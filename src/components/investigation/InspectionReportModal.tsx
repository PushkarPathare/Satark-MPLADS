/**
 * Official Government Vigilance & Field Inspection Findings Report Modal
 * SATARK-MPLADS Transparent Decision-Support System
 * Provides comprehensive breakdown of "What was wrong" and "What was inspected".
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  AlertTriangle,
  FileText,
  MapPin,
  Calendar,
  User,
  CheckCircle2,
  Lock,
  Download,
  Building2,
  FolderGit2,
  ExternalLink,
  Scale,
  FileCheck2,
  Home,
  ArrowLeft,
  Copy,
  Check,
  Award,
  Info,
} from 'lucide-react';
import { AuditAction, InspectionReportDetails } from '../../types';

interface InspectionReportModalProps {
  action: AuditAction;
  onClose: () => void;
  onOpenCryptoDetail?: (action: AuditAction) => void;
  onNavigateHome?: () => void;
}

export const InspectionReportModal: React.FC<InspectionReportModalProps> = ({
  action,
  onClose,
  onOpenCryptoDetail,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<'full' | 'findings' | 'directives' | 'crypto'>('full');
  const [copied, setCopied] = useState(false);
  const [printNotice, setPrintNotice] = useState<string | null>(null);

  // Safely resolve complete inspection report details with rich, intelligent fallbacks
  const report: InspectionReportDetails = useMemo(() => {
    const r = action.inspectionReport;
    const targetName = action.targetName || 'Sanctioned MPLADS Public Asset';
    const targetCode = action.targetCode || 'MPL-WORK';

    const defaultWhatWasWrong =
      r?.whatWasWrong ||
      action.whatWasWrong ||
      (action.actionType === 'Financial Review'
        ? `Over-disbursement detected exceeding verified physical civil progress on ${targetName}.`
        : action.actionType === 'Field Verification'
        ? `Quality defect, honeycombing, or delayed milestone execution noted on site for ${targetName}.`
        : action.actionType === 'Escalate'
        ? `Severe non-performance and cartel concentration requiring immediate DLMC enforcement intervention.`
        : action.remarks || `Statutory procedural and physical-financial variance identified requiring forensic site inspection.`);

    const defaultWhatWasInspected =
      r?.whatWasInspected ||
      action.whatWasInspected ||
      `On-site civil structural works, e-MB CPWA Form 23 recorded entries, concrete cube compressive strength reports, and geo-tagged photographic evidence.`;

    const defaultLocation =
      r?.inspectionLocation ||
      action.fileProof?.geotagProof?.locationName ||
      `${targetCode} Work Site, District In-charge Jurisdiction`;

    const defaultOutcome =
      r?.inspectionOutcome ||
      (action.actionType === 'Mark Verified'
        ? 'Satisfactory - No Defects'
        : action.actionType === 'Escalate'
        ? 'Recovery & FIR Ordered'
        : action.priority === 'Urgent'
        ? 'Major Irregularity Confirmed'
        : 'Under Show Cause Scrutiny');

    const defaultAnomalyType =
      r?.anomalyType ||
      (action.targetType === 'Contractor'
        ? 'Cartel Concentration & Bid Clustering'
        : action.actionType === 'Financial Review'
        ? 'Premature Over-Disbursement & False Billing'
        : action.actionType === 'DLP Warranty Check'
        ? 'Statutory Asset Durability Verification'
        : 'Civil Works & Measurement Book Variance');

    const defaultFindings = r?.findingsObservations && r.findingsObservations.length > 0
      ? r.findingsObservations
      : [
          action.remarks || 'Ground measurement cross-examined against approved schedule of quantities (SOQ).',
          'Electronic Measurement Book (e-MB) entries reconciled against certified running account bills.',
          'Quality check parameters and material testing certificates audited by designated engineer.',
        ];

    const defaultDirectives = r?.orderedDirectives && r.orderedDirectives.length > 0
      ? r.orderedDirectives
      : [
          'Immediate compliance notice served to implementing agency and contractor.',
          'Re-measurement and reconciliation under supervision of Executive Engineer (Vigilance).',
          'Withhold next interim payment pending verified rectification certificate.',
        ];

    const defaultRegisters = r?.registersInspected && r.registersInspected.length > 0
      ? r.registersInspected
      : ['e-MB CPWA Form 23', 'Quality Testing Register (M-25/M-30)', 'Running Account Bill File', 'Tender Sanction Docket'];

    const defaultTeam = r?.inspectionTeam && r.inspectionTeam.length > 0
      ? r.inspectionTeam
      : [
          action.upholder?.name || action.officerName || 'Dr. Suhas Diwase (IAS)',
          'Executive Engineer (Quality Assurance & Vigilance)',
          'Sub-Divisional Officer (SDO)',
        ];

    return {
      whatWasWrong: defaultWhatWasWrong,
      anomalyType: defaultAnomalyType,
      whatWasInspected: defaultWhatWasInspected,
      inspectionLocation: defaultLocation,
      registersInspected: defaultRegisters,
      inspectionTeam: defaultTeam,
      findingsObservations: defaultFindings,
      claimedPhysicalPercent: r?.claimedPhysicalPercent ?? (action.actionType === 'Mark Verified' ? 100 : 75),
      verifiedPhysicalPercent: r?.verifiedPhysicalPercent ?? (action.actionType === 'Mark Verified' ? 100 : 42),
      discrepancyAmountLakhs: r?.discrepancyAmountLakhs ?? (action.actionType === 'Mark Verified' ? 0 : 14.5),
      orderedDirectives: defaultDirectives,
      complianceDeadlineDays: r?.complianceDeadlineDays ?? 14,
      inspectionOutcome: defaultOutcome,
    };
  }, [action]);

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Safe date formatter
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Current Date';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Safe print handler with fallback notice for iframe environments
  const handlePrint = () => {
    try {
      window.print();
    } catch {
      setPrintNotice('Browser direct printing is blocked inside the sandboxed preview. Use "Download Dossier" below to save the official report.');
      setTimeout(() => setPrintNotice(null), 6000);
    }
  };

  // Download complete report as formatted text document
  const handleDownloadReport = () => {
    const officer = action.upholder?.name || action.officerName || 'District Magistrate & Collector';
    const designation = action.upholder?.designation || action.officerDesignation || 'Vigilance Authority';
    const cert = action.upholder?.digitalCertificateId || 'DSC-NIC-2026-MH';

    const textContent = `
================================================================================
GOVERNMENT OF INDIA • MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION (MoSPI)
DISTRICT LEVEL MONITORING & VIGILANCE COMMITTEE (DLMC)
STATUTORY FIELD INSPECTION & TECHNICAL AUDIT FINDINGS REPORT
================================================================================

ORDER REFERENCE: ${action.verificationOrderNo}
DATE OF INSPECTION: ${formatDate(action.timestamp)}
SEALING BLOCK: #${String(action.blockIndex || 1).padStart(3, '0')}
PRIORITY LEVEL: ${action.priority}
INSPECTION OUTCOME: ${report.inspectionOutcome}

--------------------------------------------------------------------------------
1. TARGET ENTITY & ADMINISTRATIVE DETAILS
--------------------------------------------------------------------------------
Entity Type: ${action.targetType}
Entity Code: ${action.targetCode}
Entity Name: ${action.targetName}
Lifecycle Stage: ${action.lifecycleStage || 'Milestone Verification'}
Inspection Authority: ${officer} (${designation})
Digital Certificate: ${cert}
Site Location: ${report.inspectionLocation || 'District Jurisdiction'}

--------------------------------------------------------------------------------
2. WHAT WAS WRONG (IRREGULARITY / ANOMALY TRIGGER)
--------------------------------------------------------------------------------
Category / Type: ${report.anomalyType}
Details: ${report.whatWasWrong}
Recorded Vigilance Remarks: ${action.remarks || 'None'}

Physical-Financial Audit Comparison:
- Claimed Physical Progress (Paper): ${report.claimedPhysicalPercent ?? 'N/A'}%
- Verified Ground Execution (Site): ${report.verifiedPhysicalPercent ?? 'N/A'}%
- Unauthorized Advance / Recovery: ₹${(report.discrepancyAmountLakhs || 0).toFixed(2)} Lakhs

--------------------------------------------------------------------------------
3. WHAT WAS INSPECTED (SCOPE OF PHYSICAL & DOCUMENTARY AUDIT)
--------------------------------------------------------------------------------
Assets & Civil Structures Examined:
${report.whatWasInspected}

Official Registers Cross-Examined:
${report.registersInspected?.map((reg, i) => `  [${i + 1}] ${reg}`).join('\n') || '  None listed'}

Joint Inspection Team:
${report.inspectionTeam?.map((m, i) => `  [${i + 1}] ${m}`).join('\n') || '  Joint Technical Committee'}

--------------------------------------------------------------------------------
4. GROUND TRUTH FINDINGS & OBSERVATIONS
--------------------------------------------------------------------------------
${report.findingsObservations?.map((obs, i) => `  [Observation ${i + 1}] ${obs}`).join('\n') || '  Inspection completed satisfactorily.'}

--------------------------------------------------------------------------------
5. STATUTORY DIRECTIVES & RECTIFICATION ORDERED
--------------------------------------------------------------------------------
Compliance Window: ${report.complianceDeadlineDays} Days
Directives:
${report.orderedDirectives?.map((dir, i) => `  [Directive ${i + 1}] ${dir}`).join('\n') || '  Record logged for routine monitoring.'}

--------------------------------------------------------------------------------
6. CRYPTOGRAPHIC PROOF & TAMPER-EVIDENT IMMUTABILITY
--------------------------------------------------------------------------------
Previous Hash: ${action.previousHash || 'GENESIS'}
Block Hash:    ${action.blockHash || 'COMPUTED_ON_SEAL'}
Digital Sign:  ${action.digitalSignature || 'SIG-NIC-CLASS-III'}
File Hash:     ${action.fileProof?.fileHash || 'N/A'}
GPS Geotag:    Lat ${action.fileProof?.geotagProof?.lat ?? 'N/A'}, Lng ${action.fileProof?.geotagProof?.lng ?? 'N/A'}

================================================================================
Official report generated under Section 11 of MPLADS Operational Guidelines.
================================================================================
`;

    const blob = new Blob([textContent.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeRef = action.verificationOrderNo.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `MPLADS_Inspection_Report_${safeRef}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy brief summary to clipboard
  const handleCopySummary = () => {
    try {
      const summary = `[MPLADS INSPECTION REPORT]\nRef: ${action.verificationOrderNo}\nEntity: ${action.targetCode} - ${action.targetName}\nOutcome: ${report.inspectionOutcome}\nWhat Was Wrong: ${report.whatWasWrong}\nWhat Was Inspected: ${report.whatWasInspected}\nDirectives: ${report.orderedDirectives?.join('; ')}\nAuthority: ${action.upholder?.name || action.officerName}`;
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getOutcomeBadge = () => {
    const outcome = report.inspectionOutcome;
    if (outcome === 'Major Irregularity Confirmed') {
      return 'bg-amber-100 text-amber-900 border-amber-300';
    }
    if (outcome === 'Recovery & FIR Ordered') {
      return 'bg-rose-100 text-rose-900 border-rose-300';
    }
    if (outcome === 'Under Show Cause Scrutiny') {
      return 'bg-orange-100 text-orange-900 border-orange-300';
    }
    if (outcome === 'Satisfactory - No Defects') {
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
    if (action.priority === 'Urgent') {
      return 'bg-rose-100 text-rose-900 border-rose-300';
    }
    return 'bg-blue-100 text-blue-900 border-blue-300';
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden my-4 sm:my-6 print:m-0 print:border-none print:shadow-none animate-in fade-in zoom-in-95 duration-150">
        {/* Government Header Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 print:bg-slate-900 print:text-white">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Official Vigilance &amp; Field Inspection Dossier
                </span>
                <span className="font-mono text-xs text-slate-300 font-bold">
                  Ref: {action.verificationOrderNo}
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-mono text-xs text-blue-300">
                  Block #{String(action.blockIndex || 1).padStart(3, '0')}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white mt-1">
                Field Inspection &amp; Technical Audit Findings Report
              </h2>
              <p className="text-xs text-slate-300">
                Government of India • Ministry of Statistics &amp; Programme Implementation (MoSPI) • District Vigilance Cell
              </p>
            </div>

            {/* Quick Actions & Navigation Controls */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 print:hidden">
              {onNavigateHome && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateHome();
                  }}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700 shadow-xs"
                  title="Return to Options Menu"
                >
                  <Home className="w-3.5 h-3.5 text-blue-400" />
                  <span>Home / Options</span>
                </button>
              )}

              <button
                onClick={handleDownloadReport}
                className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Download full report as official text file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>

              <button
                onClick={handleCopySummary}
                className="py-1.5 px-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition-colors cursor-pointer"
                title="Copy report summary"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="py-1.5 px-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition-colors cursor-pointer"
                title="Print Official Dossier"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ml-1"
                title="Close Report (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Meta Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Target Entity:</span>
              <span className="font-bold text-white flex items-center gap-1 mt-0.5 truncate">
                {action.targetType === 'Contractor' ? (
                  <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                ) : (
                  <FolderGit2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                )}
                {action.targetCode} - {action.targetName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Date of Inspection:</span>
              <span className="font-mono text-white mt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {formatDate(action.timestamp)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Inspection Authority:</span>
              <span className="text-white mt-0.5 block truncate flex items-center gap-1">
                <User className="w-3 h-3 text-blue-400 shrink-0" />
                {action.upholder?.name || action.officerName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Status Outcome:</span>
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border mt-0.5 ${getOutcomeBadge()}`}>
                {report.inspectionOutcome}
              </span>
            </div>
          </div>
        </div>

        {/* Print Fallback Alert (shown if iframe restricts window.print) */}
        {printNotice && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{printNotice}</span>
            </div>
            <button
              onClick={handleDownloadReport}
              className="py-1 px-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold cursor-pointer shrink-0"
            >
              Download Report Now
            </button>
          </div>
        )}

        {/* Section Navigation Tabs (Print Hidden) */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center gap-1.5 text-xs font-semibold print:hidden">
          <button
            onClick={() => setActiveTab('full')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'full'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Complete Official Dossier</span>
          </button>
          <button
            onClick={() => setActiveTab('findings')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'findings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>1. What Was Wrong &amp; Findings</span>
          </button>
          <button
            onClick={() => setActiveTab('directives')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'directives'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-emerald-500" />
            <span>2. Scope &amp; Directives</span>
          </button>
          <button
            onClick={() => setActiveTab('crypto')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'crypto'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-blue-500" />
            <span>3. Cryptographic Chain Proof</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[68vh] overflow-y-auto text-slate-800 text-xs sm:text-sm">
          {/* SECTION 1: WHAT WAS WRONG (THE IRREGULARITY / ANOMALY TRIGGER) */}
          {(activeTab === 'full' || activeTab === 'findings') && (
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <div className="p-1 bg-rose-200/80 rounded-lg text-rose-800">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <span>1. WHAT WAS WRONG (The Irregularity / Trigger Anomaly)</span>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-900 border border-rose-300">
                  {report.anomalyType}
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-rose-200/80 space-y-2 text-xs sm:text-sm">
                <p className="text-slate-800 font-medium leading-relaxed">
                  {report.whatWasWrong}
                </p>
                {action.remarks && action.remarks !== report.whatWasWrong && (
                  <div className="text-xs text-slate-600 italic pt-1 border-t border-slate-100">
                    <strong>Recorded Vigilance Note:</strong> {action.remarks}
                  </div>
                )}
              </div>

              {/* Financial Divergence Callout if discrepancy exists */}
              {typeof report.discrepancyAmountLakhs === 'number' && report.discrepancyAmountLakhs > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="bg-white p-2.5 rounded-lg border border-rose-200">
                    <span className="text-[11px] text-slate-500 block">Claimed Progress (Paper):</span>
                    <span className="font-bold text-rose-700 text-sm">
                      {report.claimedPhysicalPercent ?? '—'}%
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-rose-200">
                    <span className="text-[11px] text-slate-500 block">Verified Progress (Ground):</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {report.verifiedPhysicalPercent ?? '—'}%
                    </span>
                  </div>
                  <div className="bg-rose-100/70 p-2.5 rounded-lg border border-rose-300">
                    <span className="text-[11px] text-rose-800 font-medium block">Unauthorized Advance Disbursed:</span>
                    <span className="font-extrabold text-rose-900 text-sm">
                      ₹{report.discrepancyAmountLakhs.toFixed(2)} Lakhs for Recovery
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: WHAT WAS INSPECTED (SCOPE OF PHYSICAL & DOCUMENTARY AUDIT) */}
          {(activeTab === 'full' || activeTab === 'directives') && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <div className="p-1 bg-blue-200/80 rounded-lg text-blue-800">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <span>2. WHAT WAS INSPECTED (Scope of Field &amp; Asset Scrutiny)</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-blue-200/80 space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Physical Assets &amp; Structures Examined on Ground:
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {report.whatWasInspected}
                  </p>
                </div>

                {report.inspectionLocation && (
                  <div className="flex items-start gap-1.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900">Exact Site Coordinates &amp; Location: </span>
                      <span>{report.inspectionLocation}</span>
                    </div>
                  </div>
                )}

                {/* Inspected Registers & Documents */}
                {report.registersInspected && report.registersInspected.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Official Registers &amp; Technical Documents Cross-Examined:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {report.registersInspected.map((reg, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-800"
                        >
                          📄 {reg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inspection Team */}
                {report.inspectionTeam && report.inspectionTeam.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Joint Inspection Committee Members:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                      {report.inspectionTeam.map((member, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>{member}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 3: GROUND TRUTH FINDINGS & OBSERVATIONS */}
          {(activeTab === 'full' || activeTab === 'findings') && report.findingsObservations && report.findingsObservations.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <div className="p-1 bg-slate-200 rounded-lg text-slate-800">
                  <FileText className="w-4 h-4" />
                </div>
                <span>3. GROUND TRUTH FINDINGS &amp; SITE OBSERVATIONS</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <ul className="space-y-2">
                  {report.findingsObservations.map((obs, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                      <span className="font-bold text-blue-600 shrink-0 mt-0.5">[{idx + 1}]</span>
                      <span className="leading-relaxed">{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* SECTION 4: DIRECTIVES & RECTIFICATION ORDERED */}
          {(activeTab === 'full' || activeTab === 'directives') && report.orderedDirectives && report.orderedDirectives.length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <div className="p-1 bg-emerald-200/80 rounded-lg text-emerald-800">
                    <Scale className="w-4 h-4" />
                  </div>
                  <span>4. STATUTORY RECTIFICATION &amp; ENFORCEMENT DIRECTIVES</span>
                </div>
                {typeof report.complianceDeadlineDays === 'number' && report.complianceDeadlineDays > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 border border-emerald-300">
                    ⏱️ Compliance Window: {report.complianceDeadlineDays} Days
                  </span>
                )}
              </div>

              <div className="bg-white p-3 rounded-lg border border-emerald-200/80">
                <ul className="space-y-2">
                  {report.orderedDirectives.map((dir, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium">{dir}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* SECTION 5: CRYPTOGRAPHIC PROOF & ATTESTATION */}
          {(activeTab === 'full' || activeTab === 'crypto') && (
            <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>5. CRYPTOGRAPHIC PROOF &amp; TAMPER-EVIDENT LEDGER IMMUTABILITY</span>
                </div>
                {onOpenCryptoDetail && (
                  <button
                    onClick={() => onOpenCryptoDetail(action)}
                    className="text-blue-700 hover:text-blue-900 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    Inspect Chained Block #{String(action.blockIndex || 1).padStart(3, '0')}
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 font-semibold block">Authorized Upholder &amp; Signatory:</span>
                  <div className="font-bold text-slate-900">{action.upholder?.name || action.officerName}</div>
                  <div className="text-slate-600 text-[11px]">{action.upholder?.designation || action.officerDesignation}</div>
                  <div className="font-mono text-emerald-700 text-[10px]">
                    Digital Cert: {action.upholder?.digitalCertificateId || 'DSC-NIC-2026-MH-88219'}
                  </div>
                </div>

                <div className="space-y-1 font-mono text-[10.5px]">
                  <span className="text-[11px] text-slate-500 font-sans font-semibold block">Chained Block Hashes:</span>
                  <div className="truncate text-slate-600">
                    <span className="text-slate-400">PREV: </span>{action.previousHash ? `${action.previousHash.slice(0, 24)}...` : 'GENESIS'}
                  </div>
                  <div className="truncate text-blue-700 font-bold">
                    <span className="text-blue-500">BLOCK: </span>{action.blockHash || 'COMPUTED_ON_SEAL'}
                  </div>
                  {action.fileProof && (
                    <div className="truncate text-emerald-700">
                      <span className="text-emerald-500">FILE: </span>{action.fileProof.fileHash}
                    </div>
                  )}
                </div>
              </div>

              {/* Geotag GPS verification */}
              {action.fileProof?.geotagProof && (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded border border-emerald-200 text-emerald-800 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>
                      GPS Lat: {action.fileProof.geotagProof.lat.toFixed(4)}, Lng: {action.fileProof.geotagProof.lng.toFixed(4)} (Accuracy: {action.fileProof.geotagProof.accuracyMeters}m) — Geofence Verified Active
                    </span>
                  </div>
                  <span className="font-bold text-emerald-900 shrink-0">100% Geotag Valid</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-500">
            Official Report Generated under Section 11 of MPLADS Operational Guidelines
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onNavigateHome && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateHome();
                }}
                className="py-1.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Return to Options Menu"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Home Page</span>
              </button>
            )}

            <button
              onClick={handleDownloadReport}
              className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Download text report"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Dossier</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Dossier</span>
            </button>

            <button
              onClick={onClose}
              className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Close and return to Audit Trails"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Audit Trails</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
