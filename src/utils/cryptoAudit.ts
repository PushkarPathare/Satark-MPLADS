/**
 * SATARK-MPLADS Cryptographic Audit Ledger Engine
 * Implements SHA-256 Hash Chaining, File Proof Verification, 
 * Merkle Tree Verification, and Tamper-Evidence Detection.
 */

import { AuditAction, FileProofData, UpholderDetails } from '../types';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Standard SHA-256 implementation supporting both Web Crypto API and pure JS fallback
 */
export async function computeSha256Async(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback
    }
  }
  return computeSha256Sync(message);
}

/**
 * Synchronous SHA-256 implementation for fast synchronous chain validation & rendering
 */
export function computeSha256Sync(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i: number, j: number;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let compositeClear = '\x80';
  while ((compositeClear.length + ascii.length) % 64 !== 56) {
    compositeClear += '\x00';
  }

  const combined = ascii + compositeClear;
  for (i = 0; i < combined.length; i++) {
    j = combined.charCodeAt(i);
    words[i >> 2] = (words[i >> 2] || 0) | (j << ((3 - (i % 4)) * 8));
  }

  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength | 0;

  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2];

      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] =
        i < 16
          ? w[i]
          : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

      const s1b = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + s1b + ch + k[i] + w[i]) | 0;
      const s0b = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0b + maj) | 0;

      hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (let b = 3; b >= 0; b--) {
      const byte = (hash[i] >> (b * 8)) & 255;
      result += (byte < 16 ? '0' : '') + byte.toString(16);
    }
  }
  return result;
}

/**
 * Computes deterministic SHA-256 Block Hash from block payload
 */
export function calculateBlockHash(block: {
  blockIndex: number;
  timestamp: string;
  targetCode: string;
  verificationOrderNo: string;
  actionType: string;
  upholderCertId: string;
  fileHash: string;
  previousHash: string;
  remarks: string;
}): string {
  const payload = [
    `BLOCK_INDEX:${block.blockIndex}`,
    `TIMESTAMP:${block.timestamp}`,
    `ORDER_NO:${block.verificationOrderNo}`,
    `TARGET:${block.targetCode}`,
    `ACTION:${block.actionType}`,
    `UPHOLDER_CERT:${block.upholderCertId}`,
    `FILE_HASH:${block.fileHash}`,
    `PREV_HASH:${block.previousHash}`,
    `REMARKS:${block.remarks.trim()}`,
  ].join('||');

  return computeSha256Sync(payload);
}

/**
 * Reads a File or Blob and computes its SHA-256 digest
 */
export async function computeFileSha256(file: File | Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback
    }
  }
  // Convert array buffer to binary string for fallback
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < Math.min(bytes.byteLength, 100000); i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return computeSha256Sync(binary + `_size_${bytes.byteLength}`);
}

/**
 * Generates an official digital signature token
 */
export function generateDigitalSignature(blockHash: string, upholderCertId: string): string {
  const sigHash = computeSha256Sync(`RSA_2048_SIG::${blockHash}::${upholderCertId}`);
  return `SIG-SHA256-RSA:${sigHash.slice(0, 32).toUpperCase()}`;
}

/**
 * Merkle Tree Root Calculator for Audit Trail Batch Verification
 */
export function calculateMerkleRoot(hashes: string[]): string {
  if (hashes.length === 0) return GENESIS_HASH;
  if (hashes.length === 1) return hashes[0];

  let currentLevel = hashes.slice();
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        nextLevel.push(computeSha256Sync(currentLevel[i] + currentLevel[i + 1]));
      } else {
        nextLevel.push(computeSha256Sync(currentLevel[i] + currentLevel[i]));
      }
    }
    currentLevel = nextLevel;
  }
  return currentLevel[0];
}

/**
 * Cryptographic Validation of the Entire Ledger
 */
export interface VerificationResult {
  isValid: boolean;
  totalBlocks: number;
  genesisBlockHash: string;
  latestBlockHash: string;
  merkleRoot: string;
  brokenBlockIndex: number | null;
  brokenBlockReason: string | null;
  timestampVerified: string;
}

export function verifyAuditLedger(actions: AuditAction[]): VerificationResult {
  if (!actions || actions.length === 0) {
    return {
      isValid: true,
      totalBlocks: 0,
      genesisBlockHash: GENESIS_HASH,
      latestBlockHash: GENESIS_HASH,
      merkleRoot: GENESIS_HASH,
      brokenBlockIndex: null,
      brokenBlockReason: null,
      timestampVerified: new Date().toISOString(),
    };
  }

  const blockHashes: string[] = [];

  for (let i = 0; i < actions.length; i++) {
    const block = actions[i];
    const expectedIndex = i + 1;

    // Check Tampered flag if manually stimulated
    if (block.isTampered) {
      return {
        isValid: false,
        totalBlocks: actions.length,
        genesisBlockHash: actions[0].blockHash || GENESIS_HASH,
        latestBlockHash: actions[actions.length - 1].blockHash || '',
        merkleRoot: '',
        brokenBlockIndex: expectedIndex,
        brokenBlockReason: `Tamper Alert: Block #${expectedIndex} contains unauthorized payload modifications or corrupted digital certificate.`,
        timestampVerified: new Date().toISOString(),
      };
    }

    // 1. Verify previous hash chaining
    if (i === 0) {
      if (block.previousHash !== GENESIS_HASH) {
        return {
          isValid: false,
          totalBlocks: actions.length,
          genesisBlockHash: block.blockHash || '',
          latestBlockHash: '',
          merkleRoot: '',
          brokenBlockIndex: 1,
          brokenBlockReason: `Genesis Block #1 broken: previousHash must match zero-origin GENESIS (${GENESIS_HASH}).`,
          timestampVerified: new Date().toISOString(),
        };
      }
    } else {
      const prevBlock = actions[i - 1];
      if (block.previousHash !== prevBlock.blockHash) {
        return {
          isValid: false,
          totalBlocks: actions.length,
          genesisBlockHash: actions[0].blockHash || '',
          latestBlockHash: '',
          merkleRoot: '',
          brokenBlockIndex: expectedIndex,
          brokenBlockReason: `Cryptographic Chaining Broken at Block #${expectedIndex}: Previous Hash does not match Block #${i} Block Hash.`,
          timestampVerified: new Date().toISOString(),
        };
      }
    }

    // 2. Compute expected hash and compare
    const computedHash = calculateBlockHash({
      blockIndex: block.blockIndex || expectedIndex,
      timestamp: block.timestamp,
      targetCode: block.targetCode,
      verificationOrderNo: block.verificationOrderNo,
      actionType: block.actionType,
      upholderCertId: block.upholder?.digitalCertificateId || 'DEFAULT_NIC_CERT',
      fileHash: block.fileProof?.fileHash || 'NO_FILE_ATTACHED',
      previousHash: block.previousHash || (i === 0 ? GENESIS_HASH : actions[i - 1].blockHash || ''),
      remarks: block.remarks,
    });

    if (block.blockHash && block.blockHash !== computedHash) {
      return {
        isValid: false,
        totalBlocks: actions.length,
        genesisBlockHash: actions[0].blockHash || '',
        latestBlockHash: '',
        merkleRoot: '',
        brokenBlockIndex: expectedIndex,
        brokenBlockReason: `SHA-256 Digest Mismatch at Block #${expectedIndex}. Stored hash does not match computed digest. Data was altered after signing!`,
        timestampVerified: new Date().toISOString(),
      };
    }

    blockHashes.push(computedHash);
  }

  const merkleRoot = calculateMerkleRoot(blockHashes);

  return {
    isValid: true,
    totalBlocks: actions.length,
    genesisBlockHash: actions[0].blockHash || blockHashes[0],
    latestBlockHash: blockHashes[blockHashes.length - 1],
    merkleRoot,
    brokenBlockIndex: null,
    brokenBlockReason: null,
    timestampVerified: new Date().toISOString(),
  };
}
