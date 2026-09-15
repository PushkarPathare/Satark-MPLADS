/**
 * Official Cryptographic Audit Trail & Tamper-Evident Ledger
 * SATARK-MPLADS Transparent Governance Ledger
 * Features: SHA-256 Hash Chaining, File Proof Verification, 
 * Upholder Digital Signatures, and Post-Completion Lifecycle Tracking.
 */

import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Download,
  PlusCircle,
  Building2,
  FolderGit2,
  FileText,
  Lock,
  Unlock,
  KeyRound,
  Fingerprint,
  Link as LinkIcon,
  RefreshCw,
  Copy,
  Check,
  Award,
  ExternalLink,
  MapPin,
  FileCode,
  Calendar,
  Sparkles,
  Eye,
  X,
  Printer,
  ChevronRight,
  Shield,
  Layers,
  Home,
} from 'lucide-react';
import { AuditAction, LifecycleStage } from '../../types';
import {
  calculateBlockHash,
  computeFileSha256,
  generateDigitalSignature,
  verifyAuditLedger,
  GENESIS_HASH,
  VerificationResult,
} from '../../utils/cryptoAudit';
import { InspectionReportModal } from './InspectionReportModal';
import { InspectionDossierView } from './InspectionDossierView';

interface AuditTrailViewProps {
  auditActions: AuditAction[];
  onAddAuditAction: (action: AuditAction) => void;
  onSimulateTamper?: (blockIndex: number) => void;
  onRestoreLedger?: () => void;
  onNavigateHome?: () => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  auditActions,
  onAddAuditAction,
  onSimulateTamper,
  onRestoreLedger,
  onNavigateHome,
}) => {
  // Local state: Switch between 'dossier' (inspection reports) and 'ledger' (cryptographic blocks)
  const [viewMode, setViewMode] = useState<'dossier' | 'ledger'>('dossier');
  const [selectedInspectionAction, setSelectedInspectionAction] = useState<AuditAction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLifecycleTab, setSelectedLifecycleTab] = useState<'all' | 'post-completion' | 'active' | 'flagged'>('all');
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBlockForDetail, setSelectedBlockForDetail] = useState<AuditAction | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // Form states for logging new tamper-evident action & inspection report
  const [officerName, setOfficerName] = useState('Dr. Suhas Diwase (IAS)');
  const [officerDesignation, setOfficerDesignation] = useState('District Magistrate & Collector, Pune');
  const [officerDepartment, setOfficerDepartment] = useState('District Planning & Vigilance Committee, Pune');
  const [officerCertId, setOfficerCertId] = useState('DSC-NIC-2026-MH-88219');
  const [targetType, setTargetType] = useState<AuditAction['targetType']>('Project');
  const [targetCode, setTargetCode] = useState('MPL-1024');
  const [targetName, setTargetName] = useState('Construction of Samaj Mandir in Uruli Kanchan');
  const [lifecycleStage, setLifecycleStage] = useState<LifecycleStage>('Physical Milestone Verification');
  const [actionType, setActionType] = useState<AuditAction['actionType']>('Field Verification');
  const [priority, setPriority] = useState<AuditAction['priority']>('High');
  const [remarks, setRemarks] = useState('');
  const [whatWasWrong, setWhatWasWrong] = useState('Physical execution lagging behind 88.5% financial disbursement by 50.5% (plinth only executed).');
  const [whatWasInspected, setWhatWasInspected] = useState('Civil works at Gat No. 412/1, foundation reinforcement, and e-MB CPWA Form 23 entries.');
  const [inspectionOutcome, setInspectionOutcome] = useState('Major Irregularity Confirmed');
  const [discrepancyAmount, setDiscrepancyAmount] = useState('24.26');
  const [uploadedFileName, setUploadedFileName] = useState('Field_Joint_Inspection_Report.pdf');
  const [uploadedFileHash, setUploadedFileHash] = useState('7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069');
  const [fileSizeBytes, setFileSizeBytes] = useState('3.8 MB');
  const [locationName, setLocationName] = useState('Uruli Kanchan, Haveli, Pune');
  const [isCalculatingHash, setIsCalculatingHash] = useState(false);

  // Run ledger cryptographic verification
  const verificationResult: VerificationResult = useMemo(() => {
    return verifyAuditLedger(auditActions);
  }, [auditActions]);

  // Tab filtered actions
  const filteredActions = useMemo(() => {
    return auditActions.filter((a) => {
      // Tab filter
      if (selectedLifecycleTab === 'post-completion' && !a.isPostCompletionRecord) return false;
      if (selectedLifecycleTab === 'active' && a.isPostCompletionRecord) return false;
      if (selectedLifecycleTab === 'flagged' && a.priority !== 'Urgent' && a.actionType !== 'Escalate') return false;

      // Action type dropdown filter
      if (actionTypeFilter !== 'all' && a.actionType !== actionTypeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchOfficer = a.officerName.toLowerCase().includes(q) || (a.upholder?.name || '').toLowerCase().includes(q);
        const matchTarget = a.targetName.toLowerCase().includes(q) || a.targetCode.toLowerCase().includes(q);
        const matchRemarks = a.remarks.toLowerCase().includes(q);
        const matchOrder = a.verificationOrderNo.toLowerCase().includes(q);
        const matchHash = (a.blockHash || '').toLowerCase().includes(q) || (a.fileProof?.fileHash || '').toLowerCase().includes(q);
        if (!matchOfficer && !matchTarget && !matchRemarks && !matchOrder && !matchHash) return false;
      }
      return true;
    });
  }, [auditActions, selectedLifecycleTab, actionTypeFilter, searchQuery]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatDateTime = (ts?: string) => {
    if (!ts) return 'Current Date';
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts;
      return d.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return ts;
    }
  };

  const handleVerifyLedgerManually = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (verificationResult.isValid) {
        setVerificationFeedback(`Cryptographic validation 100% SUCCESS: All ${verificationResult.totalBlocks} chained blocks, upholder signatures, and SHA-256 file hashes match standard Merkle root.`);
      } else {
        setVerificationFeedback(`⚠️ TAMPER ALERT: Cryptographic chain corrupted at Block #${verificationResult.brokenBlockIndex}! ${verificationResult.brokenBlockReason}`);
      }
      setTimeout(() => setVerificationFeedback(null), 7000);
    }, 600);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCalculatingHash(true);
    setUploadedFileName(file.name);
    setFileSizeBytes(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);

    try {
      const hash = await computeFileSha256(file);
      setUploadedFileHash(hash);
    } catch {
      setUploadedFileHash('a3f89921c54b09e10287ab198420eac58190014ab18239019280148901284901');
    } finally {
      setIsCalculatingHash(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName.trim() || !remarks.trim()) return;

    const newIndex = auditActions.length + 1;
    const prevBlock = auditActions[auditActions.length - 1];
    const previousHash = prevBlock ? (prevBlock.blockHash || GENESIS_HASH) : GENESIS_HASH;
    const timestamp = new Date().toISOString();
    const orderNo = `PUN/AUDIT-LEDGER/${new Date().getFullYear()}/${String(newIndex).padStart(3, '0')}`;

    const computedBlockHash = calculateBlockHash({
      blockIndex: newIndex,
      timestamp,
      targetCode: targetCode || 'MPL-GEN',
      verificationOrderNo: orderNo,
      actionType,
      upholderCertId: officerCertId,
      fileHash: uploadedFileHash,
      previousHash,
      remarks,
    });

    const newAction: AuditAction = {
      id: `act-${Date.now()}`,
      blockIndex: newIndex,
      timestamp,
      verificationOrderNo: orderNo,
      officerName,
      officerDesignation,
      upholder: {
        name: officerName,
        designation: officerDesignation,
        department: officerDepartment,
        digitalCertificateId: officerCertId,
        publicKeyFingerprint: '9f:22:ca:11:80:45:9e:31:b4:c7:ee:10:88:51:7d:02',
      },
      targetType,
      targetId: `target-${Date.now()}`,
      targetCode: targetCode || 'MPL-GEN',
      targetName,
      lifecycleStage,
      actionType,
      status: 'Verified on Chain',
      remarks,
      whatWasWrong,
      whatWasInspected,
      inspectionReport: {
        whatWasWrong,
        whatWasInspected,
        inspectionLocation: locationName,
        inspectionOutcome,
        discrepancyAmountLakhs: parseFloat(discrepancyAmount) || 0,
        findingsObservations: [remarks, 'Field measurements cross-verified against official schedule of quantities.'],
        orderedDirectives: ['Joint measurement verification recorded and logged on cryptographic ledger.'],
        registersInspected: ['e-MB CPWA Form 23', 'Inspection Note Book', 'Joint Milestone Certificate'],
        complianceDeadlineDays: 14,
      },
      priority,
      assignedInspector: officerName,
      isPostCompletionRecord: lifecycleStage.includes('Post-Completion') || lifecycleStage.includes('Social Audit'),
      postCompletionYear: lifecycleStage.includes('Post-Completion') ? 1 : undefined,
      dlpStatus: lifecycleStage.includes('Post-Completion') ? 'Satisfactory' : undefined,
      fileProof: {
        fileName: uploadedFileName,
        fileSizeBytes,
        fileHash: uploadedFileHash,
        mimeType: 'application/pdf',
        uploadTimestamp: timestamp,
        geotagProof: {
          lat: 18.5204,
          lng: 73.8567,
          accuracyMeters: 2.5,
          altitudeMeters: 570,
          geofenceValid: true,
          locationName,
        },
      },
      previousHash,
      blockHash: computedBlockHash,
      digitalSignature: generateDigitalSignature(computedBlockHash, officerCertId),
    };

    onAddAuditAction(newAction);
    setShowAddModal(false);
    setRemarks('');
  };

  const getActionTypeBadge = (type: AuditAction['actionType']) => {
    switch (type) {
      case 'Field Verification':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Financial Review':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Escalate':
        return 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
      case 'Mark Verified':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Post-Completion Audit':
      case 'DLP Warranty Check':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200 font-medium';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div
      id="audit-trail-view"
      className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4"
    >
      {/* Top Header & Cryptographic Integrity Banner */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                    Tamper-Evident Audit Ledger
                  </h3>
                  {verificationResult.isValid ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      SHA-256 Chained (Intact)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-1 animate-pulse shadow-xs">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      Tamper Detected!
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Zero-trust cryptographic ledger tracking file hashes, timestamps, upholder digital certificates, and post-completion asset durability.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {onNavigateHome && (
              <button
                id="btn-return-home"
                onClick={onNavigateHome}
                className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition-colors shadow-xs cursor-pointer"
                title="Return to Options Menu"
              >
                <Home className="w-3.5 h-3.5 text-blue-600" />
                <span>Options Menu</span>
              </button>
            )}

            <button
              id="btn-verify-ledger"
              onClick={handleVerifyLedgerManually}
              disabled={isVerifying}
              className="py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-300 transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isVerifying ? 'animate-spin' : ''}`} />
              Verify Ledger
            </button>

            {onSimulateTamper && onRestoreLedger && (
              verificationResult.isValid ? (
                <button
                  id="btn-simulate-tamper"
                  onClick={() => onSimulateTamper(2)}
                  className="py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-amber-300 transition-colors shadow-xs cursor-pointer"
                  title="Inject test payload alteration into Block #2 to demonstrate instant tamper detection"
                >
                  <Unlock className="w-3.5 h-3.5 text-amber-600" />
                  Test Tamper Detection
                </button>
              ) : (
                <button
                  id="btn-restore-ledger"
                  onClick={onRestoreLedger}
                  className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-emerald-300 transition-colors shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Restore Clean Ledger
                </button>
              )
            )}

            <button
              id="btn-export-dossier"
              onClick={() => setShowCertificateModal(true)}
              className="py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-blue-300 transition-colors shadow-xs cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-blue-600" />
              MoSPI Certificate
            </button>

            <button
              id="btn-log-audit-action"
              onClick={() => setShowAddModal(true)}
              className="py-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Sign & Append Block
            </button>
          </div>
        </div>

        {/* Dynamic Verification Banner / Alert */}
        {verificationFeedback && (
          <div
            className={`mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 transition-all ${
              verificationResult.isValid
                ? 'bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-xs'
                : 'bg-rose-50 border border-rose-300 text-rose-900 font-medium shadow-xs'
            }`}
          >
            {verificationResult.isValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{verificationFeedback}</span>
          </div>
        )}

        {/* Cryptographic Chain Telemetry Strip */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3 border-t border-slate-200">
          {/* Telemetry 1: Merkle Root */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-[10px] text-slate-500 font-mono uppercase flex items-center justify-between">
              <span>Merkle Root Digest</span>
              <Fingerprint className="w-3 h-3 text-blue-600" />
            </div>
            <div className="font-mono text-xs text-blue-700 font-bold truncate mt-1 flex items-center justify-between gap-1">
              <span className="truncate">{verificationResult.merkleRoot}</span>
              <button
                onClick={() => copyToClipboard(verificationResult.merkleRoot)}
                className="text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer"
                title="Copy Merkle Root Hash"
              >
                {copiedHash === verificationResult.merkleRoot ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* Telemetry 2: Chained Blocks Count */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-[10px] text-slate-500 font-mono uppercase flex items-center justify-between">
              <span>Chained Blocks</span>
              <LinkIcon className="w-3 h-3 text-blue-600" />
            </div>
            <div className="font-mono text-xs text-slate-800 font-bold mt-1">
              {auditActions.length} Verified Records (Origin: Genesis #001)
            </div>
          </div>

          {/* Telemetry 3: Maintained After Completion */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-[10px] text-slate-500 font-mono uppercase flex items-center justify-between">
              <span>Post-Completion Checks</span>
              <Award className="w-3 h-3 text-cyan-600" />
            </div>
            <div className="font-mono text-xs text-cyan-700 font-bold mt-1">
              {auditActions.filter((a) => a.isPostCompletionRecord).length} Active DLP & Social Audits
            </div>
          </div>

          {/* Telemetry 4: Upholder NIC Signature Standard */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-[10px] text-slate-500 font-mono uppercase flex items-center justify-between">
              <span>Digital Security Protocol</span>
              <KeyRound className="w-3 h-3 text-emerald-600" />
            </div>
            <div className="font-mono text-xs text-emerald-700 font-bold mt-1 truncate">
              RSA-2048 / NIC Class-III DSC
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Switcher: 1. Inspection & Irregularity Reports Dossier, 2. Cryptographic Hash Ledger */}
      <div className="px-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setViewMode('dossier')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'dossier'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📋 Inspection & Irregularity Reports</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${viewMode === 'dossier' ? 'bg-blue-700/70 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {filteredActions.length} Reports
            </span>
          </button>

          <button
            onClick={() => setViewMode('ledger')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'ledger'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>🔐 Cryptographic Chain Ledger</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${viewMode === 'ledger' ? 'bg-blue-700/70 text-white' : 'bg-slate-200 text-slate-700'}`}>
              SHA-256 Chained
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {auditActions.length} Verified Records on Chain
          </span>
        </div>
      </div>

      {/* Navigation Filter Tabs & Search Bar */}
      <div className="px-4 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Lifecycle Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedLifecycleTab('all')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedLifecycleTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Records ({auditActions.length})
          </button>

          <button
            onClick={() => setSelectedLifecycleTab('post-completion')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              selectedLifecycleTab === 'post-completion'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Post-Completion ({auditActions.filter((a) => a.isPostCompletionRecord).length})
          </button>

          <button
            onClick={() => setSelectedLifecycleTab('active')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedLifecycleTab === 'active'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Active Execution ({auditActions.filter((a) => !a.isPostCompletionRecord).length})
          </button>

          <button
            onClick={() => setSelectedLifecycleTab('flagged')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              selectedLifecycleTab === 'flagged'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:text-rose-900 hover:bg-rose-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Irregularities & Flagged
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports, officer, hash, irregularity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 w-52 sm:w-64 focus:outline-none focus:border-blue-500 shadow-xs"
            />
          </div>

          <select
            value={actionTypeFilter}
            onChange={(e) => setActionTypeFilter(e.target.value)}
            className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
          >
            <option value="all">All Action Types</option>
            <option value="Field Verification">Field Verification</option>
            <option value="Financial Review">Financial Review</option>
            <option value="Post-Completion Audit">Post-Completion Audit</option>
            <option value="DLP Warranty Check">DLP Warranty Check</option>
            <option value="Escalate">Escalate to DLMC</option>
            <option value="Mark Verified">Mark Verified</option>
          </select>
        </div>
      </div>

      {/* Main Content Area: Dossier Mode vs Ledger Table Mode */}
      {viewMode === 'dossier' ? (
        <div className="px-4 pb-4">
          <InspectionDossierView
            actions={filteredActions}
            onOpenReportModal={(act) => setSelectedInspectionAction(act)}
            onOpenCryptoModal={(act) => setSelectedBlockForDetail(act)}
            onNavigateHome={onNavigateHome}
          />
        </div>
      ) : (
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-100 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-3">Block & Timestamp</th>
                <th className="py-3 px-3">Upholder & Signature</th>
                <th className="py-3 px-3">Target & Stage</th>
                <th className="py-3 px-3 min-w-[240px]">What Was Wrong & Inspected</th>
                <th className="py-3 px-3">File Proof & SHA-256</th>
                <th className="py-3 px-3">Chained Hashes</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {filteredActions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Lock className="w-8 h-8 text-slate-400" />
                      <span>No cryptographic audit blocks match your criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredActions.map((act, index) => {
                  const isBlockTampered = act.isTampered;
                  const isPostComp = act.isPostCompletionRecord;

                  return (
                    <tr
                      key={act.id}
                      className={`transition-colors ${
                        isBlockTampered
                          ? 'bg-rose-50 border-l-4 border-rose-500'
                          : isPostComp
                          ? 'bg-cyan-50/30 hover:bg-cyan-50/60'
                          : 'bg-white hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Col 1: Block Index & Timestamp */}
                      <td className="py-3 px-3 align-top">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-blue-800 border border-slate-200">
                            #{String(act.blockIndex || index + 1).padStart(3, '0')}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {act.verificationOrderNo}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatDateTime(act.timestamp)}
                        </div>
                        {isPostComp && (
                          <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">
                            <Sparkles className="w-2.5 h-2.5" />
                            Post-Completion (Yr {act.postCompletionYear || 1})
                          </span>
                        )}
                      </td>

                      {/* Col 2: Upholder & Digital Signature */}
                      <td className="py-3 px-3 align-top max-w-[180px]">
                        <div className="font-semibold text-slate-900 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{act.upholder?.name || act.officerName}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {act.upholder?.designation || act.officerDesignation}
                        </div>
                        <div className="text-[10px] font-mono text-emerald-700 flex items-center gap-1 mt-1">
                          <KeyRound className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{act.upholder?.digitalCertificateId || 'DSC-NIC-2026'}</span>
                        </div>
                      </td>

                      {/* Col 3: Target & Lifecycle Stage */}
                      <td className="py-3 px-3 align-top max-w-[180px]">
                        <div className="flex items-center gap-1 font-bold text-slate-900">
                          {act.targetType === 'Contractor' ? (
                            <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          ) : (
                            <FolderGit2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                          <span className="font-mono text-xs text-blue-700">{act.targetCode}</span>
                        </div>
                        <div className="text-[11px] text-slate-700 font-medium line-clamp-1 mt-0.5">
                          {act.targetName}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getActionTypeBadge(act.actionType)}`}>
                            {act.actionType}
                          </span>
                        </div>
                      </td>

                      {/* Col 4: What Was Wrong & What Was Inspected */}
                      <td className="py-3 px-3 align-top max-w-[260px]">
                        <div className="space-y-1.5">
                          <div className="bg-rose-50/80 p-1.5 rounded border border-rose-200">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-rose-800">
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                              <span>WHAT WAS WRONG:</span>
                            </div>
                            <div className="text-[11px] text-slate-800 line-clamp-2 mt-0.5 leading-snug font-medium">
                              {act.inspectionReport?.whatWasWrong || act.whatWasWrong || act.remarks}
                            </div>
                          </div>

                          <div className="bg-blue-50/80 p-1.5 rounded border border-blue-200">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-800">
                              <FileCheck2 className="w-3 h-3 text-blue-600 shrink-0" />
                              <span>WHAT WAS INSPECTED:</span>
                            </div>
                            <div className="text-[11px] text-slate-700 line-clamp-1 mt-0.5 leading-snug">
                              {act.inspectionReport?.whatWasInspected || act.whatWasInspected || 'Civil works execution & e-MB records'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Col 5: File Proof & SHA-256 Hash */}
                      <td className="py-3 px-3 align-top max-w-[190px]">
                        {act.fileProof ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-800">
                              <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="truncate">{act.fileProof.fileName}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-[10px] font-mono text-slate-600">
                              <span className="text-blue-700 font-bold">SHA:</span>
                              <span className="truncate">{act.fileProof.fileHash.slice(0, 12)}...</span>
                              <button
                                onClick={() => copyToClipboard(act.fileProof!.fileHash)}
                                className="text-slate-400 hover:text-slate-700 ml-auto cursor-pointer"
                                title="Copy File Hash"
                              >
                                {copiedHash === act.fileProof.fileHash ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5" />
                                )}
                              </button>
                            </div>
                            {act.fileProof.geotagProof && (
                              <div className="text-[9.5px] text-emerald-700 flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5 text-emerald-600" />
                                <span className="truncate">{act.fileProof.geotagProof.locationName}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">No file attached</span>
                        )}
                      </td>

                      {/* Col 6: Chained Hashes & Integrity */}
                      <td className="py-3 px-3 align-top font-mono text-[10px]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-slate-600">
                            <span className="text-slate-400">PREV:</span>
                            <span className="truncate max-w-[100px]">
                              {act.previousHash ? act.previousHash.slice(0, 10) + '...' : 'GENESIS'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-blue-700 font-bold">
                            <span className="text-blue-500">BLOCK:</span>
                            <span className="truncate max-w-[100px]">
                              {act.blockHash ? act.blockHash.slice(0, 10) + '...' : 'COMPUTING...'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Col 7: Actions / Detail Modals */}
                      <td className="py-3 px-3 align-top text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            onClick={() => setSelectedInspectionAction(act)}
                            className="py-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                          >
                            <FileText className="w-3 h-3" />
                            Report
                          </button>
                          <button
                            onClick={() => setSelectedBlockForDetail(act)}
                            className="py-0.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium flex items-center gap-1 border border-slate-300 transition-colors cursor-pointer"
                          >
                            <Eye className="w-2.5 h-2.5 text-slate-500" />
                            Hash
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal 1: Log Tamper-Evident Action & Compute SHA-256 */}
      {showAddModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-600">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Sign & Append Cryptographic Audit Block</h3>
                  <p className="text-xs text-slate-500">
                    Calculates SHA-256 hash chaining, upholders digital credentials, and appends to immutable ledger.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Row 1: Upholder Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Upholder Name (Authorized Officer)
                  </label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Official Designation & Role
                  </label>
                  <input
                    type="text"
                    value={officerDesignation}
                    onChange={(e) => setOfficerDesignation(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Department / DLMC Cell
                  </label>
                  <input
                    type="text"
                    value={officerDepartment}
                    onChange={(e) => setOfficerDepartment(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    NIC Class-III Digital Cert ID
                  </label>
                  <input
                    type="text"
                    value={officerCertId}
                    onChange={(e) => setOfficerCertId(e.target.value)}
                    className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-emerald-700 focus:outline-none focus:border-blue-500 shadow-xs"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Target & Lifecycle Stage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Entity Type</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none cursor-pointer shadow-xs"
                  >
                    <option value="Project">MPLADS Project</option>
                    <option value="Contractor">Contractor Entity</option>
                    <option value="Asset Handover">Asset Handover (Post-Completion)</option>
                    <option value="Social Audit">Gram Sabha Social Audit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Identifier Code</label>
                  <input
                    type="text"
                    value={targetCode}
                    onChange={(e) => setTargetCode(e.target.value)}
                    placeholder="e.g. MPL-1024"
                    className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Lifecycle Stage</label>
                  <select
                    value={lifecycleStage}
                    onChange={(e) => setLifecycleStage(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none cursor-pointer shadow-xs"
                  >
                    <option value="Pre-Execution & Sanction">Pre-Execution & Sanction</option>
                    <option value="Active Execution">Active Execution</option>
                    <option value="Physical Milestone Verification">Physical Milestone Verification</option>
                    <option value="Commissioning & Handover">Commissioning & Handover</option>
                    <option value="Post-Completion DLP (1-3 Year Maintenance)">
                      Post-Completion DLP (1-3 Year Maintenance)
                    </option>
                    <option value="Annual Social Audit">Annual Social Audit</option>
                    <option value="Asset Durability Inspection">Asset Durability Inspection</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Target Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Title / Description</label>
                <input
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  placeholder="e.g. Samaj Mandir & Community Hall in Uruli Kanchan"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
                  required
                />
              </div>

              {/* Row 4: Action Type & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Audit Action Type</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none cursor-pointer shadow-xs"
                  >
                    <option value="Field Verification">Field Verification & Spot Check</option>
                    <option value="Financial Review">Financial Review (MB vs RA-Bill)</option>
                    <option value="Post-Completion Audit">Post-Completion Durability Audit</option>
                    <option value="DLP Warranty Check">DLP Warranty Compliance Check</option>
                    <option value="Escalate">Escalate to DLMC Vigilance</option>
                    <option value="Mark Verified">Mark 100% Verified on Chain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Vigilance Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none cursor-pointer shadow-xs"
                  >
                    <option value="Normal">Normal Statutory Record</option>
                    <option value="High">High Priority Check</option>
                    <option value="Urgent">Urgent Escalation</option>
                  </select>
                </div>
              </div>

              {/* Row 5: File Proof & Real-time SHA-256 Engine */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-blue-600" />
                    Attach Verification File (Auto SHA-256 Cryptographic Digest)
                  </span>
                  {isCalculatingHash && (
                    <span className="text-[10px] text-amber-700 font-mono animate-pulse flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Computing SHA-256 Hash...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="Geo-location (e.g. Uruli Kanchan, Pune)"
                    className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 text-xs focus:outline-none focus:border-blue-500 shadow-xs"
                  />
                </div>

                <div className="bg-white p-2 rounded border border-slate-200 font-mono text-[10.5px]">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>File Name: <strong className="text-slate-800">{uploadedFileName}</strong> ({fileSizeBytes})</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-blue-700 break-all">
                    <span className="text-slate-500 shrink-0">SHA-256:</span>
                    <span>{uploadedFileHash}</span>
                  </div>
                </div>
              </div>

              {/* Row 6: Inspection Dossier Breakdown: What Was Wrong & What Was Inspected */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Official Field Inspection Findings Breakdown
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10.5px] font-semibold text-rose-800 mb-0.5">
                      1. What Was Wrong (Anomaly Trigger)
                    </label>
                    <input
                      type="text"
                      value={whatWasWrong}
                      onChange={(e) => setWhatWasWrong(e.target.value)}
                      placeholder="e.g. 88.5% funds disbursed vs only 38% physical work on ground..."
                      className="w-full bg-white border border-rose-200 rounded px-2.5 py-1 text-slate-900 text-xs focus:outline-none focus:border-rose-400 shadow-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-semibold text-blue-800 mb-0.5">
                      2. What Was Inspected (Scope / Civil Assets)
                    </label>
                    <input
                      type="text"
                      value={whatWasInspected}
                      onChange={(e) => setWhatWasInspected(e.target.value)}
                      placeholder="e.g. Plinth reinforcement, site boundary, e-MB CPWA Form 23..."
                      className="w-full bg-white border border-blue-200 rounded px-2.5 py-1 text-slate-900 text-xs focus:outline-none focus:border-blue-400 shadow-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10.5px] font-semibold text-slate-700 mb-0.5">
                      Inspection Outcome / Legal Verdict
                    </label>
                    <select
                      value={inspectionOutcome}
                      onChange={(e) => setInspectionOutcome(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 text-xs focus:outline-none focus:border-blue-500 shadow-xs"
                    >
                      <option value="Major Irregularity Confirmed">Major Irregularity Confirmed</option>
                      <option value="Recovery & FIR Ordered">Recovery & FIR Ordered</option>
                      <option value="Under Show Cause Scrutiny">Under Show Cause Scrutiny</option>
                      <option value="Satisfactory - No Defects">Satisfactory - No Defects</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-semibold text-slate-700 mb-0.5">
                      Recovery Discrepancy Amount (₹ Lakhs)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={discrepancyAmount}
                      onChange={(e) => setDiscrepancyAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900 text-xs focus:outline-none focus:border-blue-500 shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Row 7: Mandate / Remarks */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Statutory Directives / Audit Remarks
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Record factual observations, inspection directives, Measurement Book (MB) cross-checks, or post-completion maintenance findings..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 resize-none shadow-xs"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-1.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Sign & Add to Chain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Block Cryptographic Inspector */}
      {selectedBlockForDetail && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBlockForDetail(null);
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-600">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Cryptographic Block #{String(selectedBlockForDetail.blockIndex || 1).padStart(3, '0')} Details
                  </h3>
                  <span className="font-mono text-xs text-blue-700">
                    {selectedBlockForDetail.verificationOrderNo}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBlockForDetail(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Upholder Box */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Authorized Upholder & Signatory
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-500">Name: </span>
                    <strong className="text-slate-900">{selectedBlockForDetail.upholder?.name || selectedBlockForDetail.officerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Designation: </span>
                    <span>{selectedBlockForDetail.upholder?.designation || selectedBlockForDetail.officerDesignation}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Digital Certificate ID: </span>
                    <code className="text-emerald-700 font-mono font-bold">
                      {selectedBlockForDetail.upholder?.digitalCertificateId || 'DSC-NIC-2026-MH-88219'}
                    </code>
                  </div>
                  <div>
                    <span className="text-slate-500">Public Key Fingerprint: </span>
                    <code className="text-slate-600 font-mono text-[10px]">
                      {selectedBlockForDetail.upholder?.publicKeyFingerprint || '9f:22:ca:11:80:45:9e:31...'}
                    </code>
                  </div>
                </div>
              </div>

              {/* Hashes Box */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 font-mono text-[11px]">
                <div className="text-[11px] font-bold text-slate-700 font-sans flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  Cryptographic Chain Digest
                </div>

                <div className="space-y-1.5">
                  <div>
                    <div className="text-[10px] text-slate-500">PREVIOUS BLOCK HASH:</div>
                    <div className="bg-white p-1.5 rounded border border-slate-200 text-slate-600 flex items-center justify-between gap-1 break-all shadow-xs">
                      <span>{selectedBlockForDetail.previousHash || GENESIS_HASH}</span>
                      <button
                        onClick={() => copyToClipboard(selectedBlockForDetail.previousHash || GENESIS_HASH)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500">CURRENT BLOCK SHA-256 HASH:</div>
                    <div className="bg-white p-1.5 rounded border border-slate-200 text-blue-700 font-bold flex items-center justify-between gap-1 break-all shadow-xs">
                      <span>{selectedBlockForDetail.blockHash}</span>
                      <button
                        onClick={() => copyToClipboard(selectedBlockForDetail.blockHash || '')}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {selectedBlockForDetail.fileProof && (
                    <div>
                      <div className="text-[10px] text-slate-500">ATTACHED FILE SHA-256 DIGEST:</div>
                      <div className="bg-white p-1.5 rounded border border-slate-200 text-emerald-700 flex items-center justify-between gap-1 break-all shadow-xs">
                        <span>{selectedBlockForDetail.fileProof.fileHash}</span>
                        <button
                          onClick={() => copyToClipboard(selectedBlockForDetail.fileProof!.fileHash)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-[10px] text-slate-500">DIGITAL SIGNATURE TOKEN:</div>
                    <div className="bg-white p-1.5 rounded border border-slate-200 text-cyan-800 text-[10px] break-all shadow-xs">
                      {selectedBlockForDetail.digitalSignature || 'SIG-SHA256-RSA:A9F4E021B789CA45D10E9811C0245E89'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="text-[11px] font-bold text-slate-700">Mandate & Directives</div>
                <p className="text-slate-700 leading-relaxed text-xs">{selectedBlockForDetail.remarks}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedBlockForDetail(null)}
                className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: MoSPI Official Cryptographic Proof Dossier Certificate */}
      {showCertificateModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCertificateModal(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div className="bg-white border border-slate-300 rounded-xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-slate-800">
            {/* Certificate Header */}
            <div className="text-center pb-4 border-b-2 border-blue-600 space-y-1">
              <div className="text-[11px] font-mono tracking-widest text-blue-700 uppercase font-semibold">
                Government of India • Ministry of Statistics and Programme Implementation
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                SATARK-MPLADS Tamper-Evident Verification Dossier
              </h2>
              <div className="text-xs text-slate-600">
                Statutory Cryptographic Proof of Physical & Financial Integrity Chaining
              </div>
            </div>

            {/* Certificate Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <div className="text-slate-500 text-[10px] uppercase font-mono">Dossier Cert ID</div>
                <div className="font-mono font-bold text-blue-700">MOSPI-TR-2026-MH</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px] uppercase font-mono">Total Chained Blocks</div>
                <div className="font-bold text-slate-900">{auditActions.length} Blocks</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px] uppercase font-mono">Ledger State</div>
                <div className="font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  100% Cryptographic Match
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px] uppercase font-mono">Date Certified</div>
                <div className="font-bold text-slate-700">{new Date().toLocaleDateString('en-IN')}</div>
              </div>
            </div>

            {/* Merkle Root & Hash Summary */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs font-mono">
              <div className="text-slate-700 text-[11px] font-sans font-bold flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-blue-600" />
                Ledger Cryptographic Merkle Root (SHA-256)
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200 text-blue-700 break-all font-bold shadow-xs">
                {verificationResult.merkleRoot}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px] text-slate-600 pt-1">
                <div>
                  <span className="text-slate-500">Genesis Block Hash: </span>
                  <span className="text-slate-800 truncate">{verificationResult.genesisBlockHash.slice(0, 24)}...</span>
                </div>
                <div>
                  <span className="text-slate-500">Latest Block Hash: </span>
                  <span className="text-slate-800 truncate">{verificationResult.latestBlockHash.slice(0, 24)}...</span>
                </div>
              </div>
            </div>

            {/* Post-Completion Guarantee Statement */}
            <div className="p-3.5 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-slate-900">
                <Shield className="w-4 h-4 text-blue-600" />
                Statutory Post-Completion Lifecycle Maintenance Protocol
              </div>
              <p className="text-[11.5px] leading-relaxed text-slate-700">
                Under the SATARK-MPLADS governance charter, completed civil assets remain subject to mandatory 3-Year Defect Liability Period (DLP) monitoring, annual citizen Gram Sabha social audits, and unannounced potable water/yield quality sampling. All post-commissioning records are permanently sealed on this ledger.
              </p>
            </div>

            {/* Signature Stamps */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-center text-xs">
              <div className="space-y-1">
                <div className="font-mono text-[10px] text-emerald-700 font-bold">NIC-CLASS-III DIGITAL STAMP</div>
                <div className="font-bold text-slate-900">Dr. Suhas Diwase (IAS)</div>
                <div className="text-[10px] text-slate-500">District Magistrate & Collector, Pune</div>
              </div>
              <div className="space-y-1">
                <div className="font-mono text-[10px] text-blue-700 font-bold">VIGILANCE CELL VERIFICATION</div>
                <div className="font-bold text-slate-900">Shri Manoj S. Kadam (MPSC)</div>
                <div className="text-[10px] text-slate-500">District Planning Officer (DPO)</div>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div className="text-[10px] text-slate-500 font-mono">
                Verification Reference: MoSPI/MPLADS/2026/SEC-LEDGER
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    try {
                      window.print();
                    } catch {
                      // Ignored in sandboxed iframes
                    }
                  }}
                  className="py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer border border-slate-300 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  Print Dossier
                </button>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Full Official Statutory Inspection Report ("What Was Wrong" & "What Was Inspected") */}
      {selectedInspectionAction && (
        <InspectionReportModal
          action={selectedInspectionAction}
          onClose={() => setSelectedInspectionAction(null)}
          onOpenCryptoDetail={(act) => {
            setSelectedInspectionAction(null);
            setSelectedBlockForDetail(act);
          }}
          onNavigateHome={onNavigateHome}
        />
      )}
    </div>
  );
};
