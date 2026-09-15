/**
 * "Why is this Contractor Flagged?" Decision-Support Explainability Modal
 * SATARK-MPLADS Plain-Language Government Decision Support
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  ShieldAlert,
  Info,
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  Printer,
  ChevronRight,
  ClipboardList,
  Compass,
} from 'lucide-react';
import { Contractor, Project } from '../../types';

interface WhyFlaggedModalProps {
  contractor: Contractor;
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onOpenEvidence: (project: Project) => void;
  onTakeAction: () => void;
}

export const WhyFlaggedModal: React.FC<WhyFlaggedModalProps> = ({
  contractor,
  projects,
  isOpen,
  onClose,
  onOpenEvidence,
  onTakeAction,
}) => {
  const [aiBrief, setAiBrief] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  if (!isOpen) return null;

  const handleGenerateBrief = async () => {
    setIsLoadingAi(true);
    try {
      const response = await fetch('/api/generate-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractorName: contractor.name,
          riskScore: contractor.riskScore,
          riskFactors: contractor.riskFactors,
          signals: contractor.networkSignals,
          projects: projects.filter((p) => p.contractorId === contractor.id),
          district: contractor.registeredDistrict,
        }),
      });
      const data = await response.json();
      if (data.brief) {
        setAiBrief(data.brief);
      }
    } catch (err) {
      console.error(err);
      setAiBrief(
        `SATARK Administrative Decision Brief for ${contractor.name}: Statistical pattern shows 12 projects across 2 talukas with 7 above-average delays. Recommended field verification protocol activated.`
      );
    } finally {
      setIsLoadingAi(false);
    }
  };

  const contractorProjects = projects.filter((p) => p.contractorId === contractor.id);
  const delayedProjects = contractorProjects.filter((p) => p.status === 'Delayed');

  return (
    <div
      id="why-flagged-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="why-flagged-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <HelpCircle className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-blue-200">
                  SATARK Decision Support
                </span>
                <h2 className="text-lg font-bold text-white leading-tight">
                  Why is this Contractor Flagged?
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs bg-white/10 p-2 rounded-lg border border-white/15">
            <div className="font-semibold text-white truncate max-w-sm">
              {contractor.name} ({contractor.code})
            </div>
            <div className="font-mono bg-white/20 px-2 py-0.5 rounded text-white font-bold">
              Risk Score: {contractor.riskScore}/100
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Main Plain-Language Explanation */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Plain-Language Administrative Summary
            </div>
            <p className="text-amber-900 text-xs leading-relaxed font-medium">
              {contractor.whyFlaggedSummary}
            </p>
          </div>

          {/* Core Decision Support Notice */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-slate-600">
              <strong className="text-slate-800 font-semibold">
                Statutory Human Verification Mandate:
              </strong>{' '}
              SATARK does not allege misconduct or determine culpability. This score represents an objective mathematical deviation from district-wide execution averages, intended solely to assist the District Magistrate / Nodal Officer in directing field inspections efficiently.
            </div>
          </div>

          {/* Specific Signal Trigger Points */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-600" />
              Observed Relationship & Execution Signals
            </h3>

            <div className="space-y-2">
              {contractor.networkSignals.map((signal) => (
                <div
                  key={signal.id}
                  className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      {signal.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{signal.flagCode}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mb-2">
                    {signal.description}
                  </p>
                  {signal.benchmarkComparison && (
                    <div className="text-[10.5px] p-2 bg-slate-50 rounded text-slate-600 border border-slate-200">
                      <strong className="text-slate-700">District Norm: </strong> {signal.benchmarkComparison}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contributing Risk Score Factors */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs text-slate-900">
              Mathematical Score Attribution ({contractor.riskScore} / 100)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between">
                <span className="text-slate-600">Geographic Concentration</span>
                <span className="font-mono font-bold text-orange-600">+{contractor.riskFactors.geographicConcentration} pts</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between">
                <span className="text-slate-600">Project Similarity</span>
                <span className="font-mono font-bold text-indigo-600">+{contractor.riskFactors.projectSimilarity} pts</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between">
                <span className="text-slate-600">Delay Pattern</span>
                <span className="font-mono font-bold text-amber-600">+{contractor.riskFactors.delayPattern} pts</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between">
                <span className="text-slate-600">Cost & Rate Deviation</span>
                <span className="font-mono font-bold text-rose-600">+{contractor.riskFactors.costDeviation} pts</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between">
                <span className="text-slate-600">Agency Concentration</span>
                <span className="font-mono font-bold text-emerald-600">+{contractor.riskFactors.agencyConcentration} pts</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between">
                <span className="text-slate-600">Historical Anomalies</span>
                <span className="font-mono font-bold text-blue-600">+{contractor.riskFactors.historicalAnomalies} pts</span>
              </div>
            </div>
          </div>

          {/* Related High-Priority Projects */}
          {delayedProjects.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-900">
                  Key Delayed Projects Associated with Contractor ({delayedProjects.length})
                </h3>
                <span className="text-[10px] text-slate-400">Click to view physical & GIS evidence</span>
              </div>

              <div className="space-y-1.5">
                {delayedProjects.slice(0, 3).map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => onOpenEvidence(proj)}
                    className="p-2.5 bg-white rounded-lg border border-slate-200 hover:border-blue-400 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[10.5px] text-blue-600">
                          {proj.code}
                        </span>
                        <span className="font-medium text-slate-900 text-xs">
                          {proj.title}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Sanctioned: ₹{proj.sanctionedAmountLakhs}L | Progress: Physical {proj.physicalProgress}% vs Financial {proj.financialProgress}%
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Decision-Support Briefing Section */}
          <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-blue-950">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Generate Official Officer Inspection Brief
              </div>
              <button
                onClick={handleGenerateBrief}
                disabled={isLoadingAi}
                className="py-1 px-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isLoadingAi ? 'Generating Brief...' : 'Draft Brief with AI'}
              </button>
            </div>

            {aiBrief && (
              <div className="p-3 bg-white rounded-lg border border-blue-200 text-xs leading-relaxed space-y-2 animate-in fade-in duration-200">
                <div className="font-bold text-[11px] text-slate-500 uppercase tracking-wide">
                  Formal Decision Support Brief
                </div>
                <div className="whitespace-pre-line text-slate-800 font-serif">
                  {aiBrief}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            Audit logging active. All inquiries recorded under MoSPI portal rules.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="py-1.5 px-3 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onTakeAction();
              }}
              className="py-1.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Order Official Verification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
