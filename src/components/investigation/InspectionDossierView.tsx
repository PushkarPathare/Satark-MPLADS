/**
 * Official Inspection Dossier & Irregularities Executive Report View
 * SATARK-MPLADS Vigilance & Quality Assurance System
 * Presents all audit inspections in a readable report format: "What was wrong" & "What was inspected".
 */

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  FileCheck2,
  Building2,
  FolderGit2,
  MapPin,
  Calendar,
  User,
  Printer,
  FileText,
  Lock,
  TrendingDown,
  Home,
  Download,
  Info,
} from 'lucide-react';
import { AuditAction } from '../../types';

interface InspectionDossierViewProps {
  actions: AuditAction[];
  onOpenReportModal: (action: AuditAction) => void;
  onOpenCryptoModal: (action: AuditAction) => void;
  onNavigateHome?: () => void;
}

export const InspectionDossierView: React.FC<InspectionDossierViewProps> = ({
  actions,
  onOpenReportModal,
  onOpenCryptoModal,
  onNavigateHome,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'discrepancy' | 'quality' | 'cartel' | 'dlp'>('all');
  const [printNotice, setPrintNotice] = useState<string | null>(null);

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

  // Compute metrics
  const totalRecoveryLakhs = useMemo(() => {
    return actions.reduce((acc, act) => {
      const disc = act.inspectionReport?.discrepancyAmountLakhs || 0;
      return acc + disc;
    }, 0);
  }, [actions]);

  const highDiscrepancyCount = useMemo(() => {
    return actions.filter(
      (a) => (a.inspectionReport?.discrepancyAmountLakhs || 0) >= 10
    ).length;
  }, [actions]);

  const filteredActions = useMemo(() => {
    if (activeCategoryFilter === 'all') return actions;
    if (activeCategoryFilter === 'discrepancy') {
      return actions.filter((a) => (a.inspectionReport?.discrepancyAmountLakhs || 0) > 0);
    }
    if (activeCategoryFilter === 'quality') {
      return actions.filter(
        (a) =>
          a.actionType === 'Field Verification' ||
          a.remarks.toLowerCase().includes('quality') ||
          a.remarks.toLowerCase().includes('honeycomb') ||
          a.remarks.toLowerCase().includes('test')
      );
    }
    if (activeCategoryFilter === 'cartel') {
      return actions.filter(
        (a) =>
          a.targetType === 'Contractor' ||
          a.remarks.toLowerCase().includes('cartel') ||
          a.remarks.toLowerCase().includes('collusion') ||
          a.remarks.toLowerCase().includes('tender')
      );
    }
    if (activeCategoryFilter === 'dlp') {
      return actions.filter((a) => a.isPostCompletionRecord || a.actionType === 'DLP Warranty Check');
    }
    return actions;
  }, [actions, activeCategoryFilter]);

  // Safe print handler
  const handlePrint = () => {
    try {
      window.print();
    } catch {
      setPrintNotice('Direct print is restricted in the preview iframe. Use "Export All" to save the reports file.');
      setTimeout(() => setPrintNotice(null), 6000);
    }
  };

  // Export summary of all visible reports
  const handleExportAll = () => {
    const lines: string[] = [
      '================================================================================',
      'GOVERNMENT OF INDIA • MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION (MoSPI)',
      'SATARK-MPLADS STATUTORY VIGILANCE INSPECTION REPORTS DOSSIER SUMMARY',
      `DATE: ${new Date().toLocaleDateString('en-IN')}`,
      `TOTAL RECORDS: ${filteredActions.length}`,
      '================================================================================\n',
    ];

    filteredActions.forEach((act, idx) => {
      const r = act.inspectionReport;
      lines.push(`RECORD #${idx + 1}: ${act.verificationOrderNo} [Block #${String(act.blockIndex || idx + 1).padStart(3, '0')}]`);
      lines.push(`Entity: [${act.targetType}] ${act.targetCode} - ${act.targetName}`);
      lines.push(`Date: ${formatDate(act.timestamp)} | Priority: ${act.priority} | Outcome: ${r?.inspectionOutcome || act.status}`);
      lines.push(`Inspection Officer: ${act.upholder?.name || act.officerName}`);
      lines.push(`WHAT WAS WRONG: ${r?.whatWasWrong || act.whatWasWrong || act.remarks}`);
      lines.push(`WHAT WAS INSPECTED: ${r?.whatWasInspected || act.whatWasInspected || 'Civil works on ground'}`);
      if (typeof r?.discrepancyAmountLakhs === 'number' && r.discrepancyAmountLakhs > 0) {
        lines.push(`RECOVERY ORDERED: ₹${r.discrepancyAmountLakhs.toFixed(2)} Lakhs (Claimed: ${r.claimedPhysicalPercent ?? '—'}% vs Verified: ${r.verifiedPhysicalPercent ?? '—'}%)`);
      }
      if (r?.orderedDirectives && r.orderedDirectives.length > 0) {
        lines.push(`DIRECTIVES: ${r.orderedDirectives.join('; ')}`);
      }
      lines.push(`BLOCK HASH: ${act.blockHash || 'N/A'}`);
      lines.push('--------------------------------------------------------------------------------\n');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MPLADS_Audit_Inspection_Dossiers_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header Summary Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Vigilance &amp; Quality Scrutiny Dossier
            </span>
            <span className="text-xs text-slate-300">
              District Level Monitoring Committee (DLMC)
            </span>
          </div>
          <h3 className="text-base sm:text-xl font-bold">
            Executive Summary: What Was Wrong &amp; What Has Been Inspected
          </h3>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Statutory inspection ledger detailing root irregularity triggers, field verification findings, e-MB CPWA-23 checks, over-disbursement recoveries, and formal directives across sanctioned works.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="py-2 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-xs"
              title="Return to Options Menu"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          )}

          <button
            onClick={handleExportAll}
            className="py-2 px-3.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-2 border border-white/20 transition-colors shrink-0 cursor-pointer"
            title="Download full summary of all filtered inspection reports"
          >
            <Download className="w-4 h-4" />
            <span>Export All</span>
          </button>

          <button
            onClick={handlePrint}
            className="py-2 px-3.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-2 border border-white/20 transition-colors shrink-0 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print All Reports</span>
          </button>
        </div>
      </div>

      {/* Print Notice if browser restricts print */}
      {printNotice && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{printNotice}</span>
          </div>
          <button
            onClick={handleExportAll}
            className="py-1 px-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold cursor-pointer shrink-0"
          >
            Download File
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-500 font-mono uppercase">Total Inspected Works</div>
          <div className="text-xl font-extrabold text-slate-900 mt-0.5">{actions.length} Works</div>
          <div className="text-[11px] text-blue-700 font-medium mt-0.5">DLMC Formal Inquiries</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-rose-200 shadow-xs bg-rose-50/20">
          <div className="text-[10px] text-rose-700 font-mono uppercase flex items-center justify-between">
            <span>Total Recoveries Ordered</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-extrabold text-rose-700 mt-0.5">₹{totalRecoveryLakhs.toFixed(2)} L</div>
          <div className="text-[11px] text-rose-800 font-medium mt-0.5">Excess Disbursed Funds</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs bg-amber-50/20">
          <div className="text-[10px] text-amber-700 font-mono uppercase">High Financial Variances</div>
          <div className="text-xl font-extrabold text-amber-700 mt-0.5">{highDiscrepancyCount} Cases</div>
          <div className="text-[11px] text-amber-800 font-medium mt-0.5">Deviation &gt; ₹10 Lakhs</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="text-[10px] text-emerald-700 font-mono uppercase">Ledger Sealing State</div>
          <div className="text-xl font-extrabold text-emerald-700 mt-0.5">100% Sealed</div>
          <div className="text-[11px] text-emerald-800 font-medium mt-0.5">SHA-256 Chained Integrity</div>
        </div>
      </div>

      {/* Internal Sub-Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-100 rounded-xl border border-slate-200 text-xs">
        <span className="text-slate-500 font-semibold px-2">Filter Findings:</span>
        <button
          onClick={() => setActiveCategoryFilter('all')}
          className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
            activeCategoryFilter === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          All Inspected Records ({actions.length})
        </button>
        <button
          onClick={() => setActiveCategoryFilter('discrepancy')}
          className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
            activeCategoryFilter === 'discrepancy'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-700 hover:text-rose-900 hover:bg-white'
          }`}
        >
          Financial Discrepancies ({actions.filter((a) => (a.inspectionReport?.discrepancyAmountLakhs || 0) > 0).length})
        </button>
        <button
          onClick={() => setActiveCategoryFilter('quality')}
          className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
            activeCategoryFilter === 'quality'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-amber-700 hover:text-amber-900 hover:bg-white'
          }`}
        >
          Quality &amp; Material Defects
        </button>
        <button
          onClick={() => setActiveCategoryFilter('cartel')}
          className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
            activeCategoryFilter === 'cartel'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-purple-700 hover:text-purple-900 hover:bg-white'
          }`}
        >
          Contractor Cartels &amp; Collusion
        </button>
        <button
          onClick={() => setActiveCategoryFilter('dlp')}
          className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
            activeCategoryFilter === 'dlp'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-cyan-700 hover:text-cyan-900 hover:bg-white'
          }`}
        >
          Post-Completion / DLP Warranty
        </button>
      </div>

      {/* Reports Grid or Empty State */}
      {filteredActions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">No Inspection Reports Found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No audit records match the current filter selection ({activeCategoryFilter}). Switch categories to view recorded inspection dossiers.
          </p>
          <button
            onClick={() => setActiveCategoryFilter('all')}
            className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Show All Inspection Records ({actions.length})
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredActions.map((act, index) => {
            const report = act.inspectionReport;
            const isPostComp = act.isPostCompletionRecord;
            const isUrgent = act.priority === 'Urgent';
            const hasDiscrepancy = typeof report?.discrepancyAmountLakhs === 'number' && report.discrepancyAmountLakhs > 0;
            const claimedPct = report?.claimedPhysicalPercent;
            const verifiedPct = report?.verifiedPhysicalPercent;
            const hasProgressComparison = typeof claimedPct === 'number' && typeof verifiedPct === 'number';

            return (
              <div
                key={act.id}
                className={`rounded-xl border transition-all p-4 sm:p-5 shadow-xs bg-white ${
                  isUrgent
                    ? 'border-rose-300 bg-rose-50/20 hover:border-rose-400'
                    : isPostComp
                    ? 'border-cyan-200 bg-cyan-50/20 hover:border-cyan-300'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {/* Card Top: Order No, Entity, Date, Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-blue-900 border border-slate-200">
                      Block #{String(act.blockIndex || index + 1).padStart(3, '0')}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {act.verificationOrderNo}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs text-slate-600 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatDate(act.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        act.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-900 border-rose-300'
                          : act.priority === 'High'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-blue-100 text-blue-900 border-blue-300'
                      }`}
                    >
                      Priority: {act.priority}
                    </span>
                    {report?.inspectionOutcome && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                        {report.inspectionOutcome}
                      </span>
                    )}
                  </div>
                </div>

                {/* Target Entity Title */}
                <div className="py-3 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                      {act.targetType === 'Contractor' ? (
                        <Building2 className="w-3.5 h-3.5 text-purple-600" />
                      ) : (
                        <FolderGit2 className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span>{act.targetType}:</span>
                      <span className="font-mono text-blue-700 font-bold">{act.targetCode}</span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      {act.targetName}
                    </h4>
                  </div>

                  {hasDiscrepancy && (
                    <div className="text-right shrink-0 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg">
                      <span className="text-[10.5px] text-rose-700 font-medium block">Recovery Ordered</span>
                      <span className="font-extrabold text-rose-900 text-sm">
                        ₹{report!.discrepancyAmountLakhs!.toFixed(2)} Lakhs
                      </span>
                    </div>
                  )}
                </div>

                {/* Physical vs Claimed Progress Comparison Bar (if applicable) */}
                {hasProgressComparison && (
                  <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-700 text-[11px]">
                      <span>Physical vs. Financial Discrepancy Scrutiny:</span>
                      <span className="text-rose-600 font-bold font-mono">
                        Delta: {(claimedPct! - verifiedPct!).toFixed(1)}% Gap
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-[10.5px] text-slate-500 mb-1">
                          <span>Claimed Milestone Billed:</span>
                          <span className="font-bold text-rose-600">{claimedPct}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-rose-500 h-2 rounded-full"
                            style={{ width: `${Math.min(claimedPct!, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10.5px] text-slate-500 mb-1">
                          <span>Actual Verified Physical Work:</span>
                          <span className="font-bold text-emerald-700">{verifiedPct}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-emerald-600 h-2 rounded-full"
                            style={{ width: `${Math.min(verifiedPct!, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* The 2 Core Pillars: "What Was Wrong" & "What Was Inspected" */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                  {/* Pillar 1: WHAT WAS WRONG */}
                  <div className="p-3.5 rounded-lg bg-rose-50/70 border border-rose-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-rose-900 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                      <span>WHAT WAS WRONG / IRREGULARITY TRIGGER</span>
                    </div>
                    <p className="text-xs text-slate-900 leading-relaxed font-semibold">
                      {report?.whatWasWrong || act.whatWasWrong || act.remarks}
                    </p>
                    {report?.anomalyType && (
                      <div className="text-[11px] text-rose-800 font-semibold pt-1 border-t border-rose-200/60">
                        Category: {report.anomalyType}
                      </div>
                    )}
                  </div>

                  {/* Pillar 2: WHAT WAS INSPECTED */}
                  <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                      <FileCheck2 className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>WHAT WAS INSPECTED &amp; EXAMINED</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {report?.whatWasInspected || act.whatWasInspected || 'Physical on-site structures, civil milestones, e-MB CPWA-23 registers, and material test cubes.'}
                    </p>
                    {report?.inspectionLocation && (
                      <div className="text-[11px] text-blue-800 flex items-center gap-1 pt-1 border-t border-blue-200/60 truncate">
                        <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                        <span className="truncate">{report.inspectionLocation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inspecting Team & Action Controls */}
                <div className="mt-3.5 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 flex-wrap">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-semibold text-slate-900">{act.upholder?.name || act.officerName}</span>
                    </div>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      Cert: {act.upholder?.digitalCertificateId || 'DSC-NIC-2026'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenCryptoModal(act)}
                      className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 border border-slate-300 transition-colors cursor-pointer"
                      title="View Chained Block Hashes"
                    >
                      <Lock className="w-3 h-3 text-slate-600" />
                      <span>Block Hash</span>
                    </button>
                    <button
                      onClick={() => onOpenReportModal(act)}
                      className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Full Inspection Report</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
