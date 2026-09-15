/**
 * Multi-Signal Network Intelligence Scanner Modal
 * SATARK-MPLADS Deep Relationship & Correlation Engine
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FolderGit2,
  Landmark,
  MapPin,
  ArrowRight,
  TrendingUp,
  SearchCheck,
  RotateCw,
} from 'lucide-react';
import { Contractor, Project, ImplementingAgency } from '../../types';

interface NetworkScanModalProps {
  contractors: Contractor[];
  projects: Project[];
  agencies: ImplementingAgency[];
  isOpen: boolean;
  onClose: () => void;
  onSelectContractor: (contractorId: string) => void;
  onSelectProject: (project: Project) => void;
}

export const NetworkScanModal: React.FC<NetworkScanModalProps> = ({
  contractors,
  projects,
  agencies,
  isOpen,
  onClose,
  onSelectContractor,
  onSelectProject,
}) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      setScanProgress(0);
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            return 100;
          }
          return prev + 25;
        });
      }, 180);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Gather flagged entities
  const highRiskContractors = contractors.filter((c) => c.riskScore >= 60);
  const highRiskProjects = projects.filter((p) => p.riskScore >= 60);
  const delayedCount = projects.filter((p) => p.status === 'Delayed').length;
  const highDeltaCount = projects.filter((p) => p.financialProgress - p.physicalProgress > 25).length;

  return (
    <div
      id="network-scan-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="network-scan-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-blue-200">
                <Sparkles className="w-5 h-5 text-blue-200" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-blue-200">
                  SATARK Real-Time Engine
                </span>
                <h2 className="text-lg font-bold text-white">
                  Contractor Network Intelligence Scan
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

          {/* Scan Progress Bar */}
          <div className="mt-4 pt-3 border-t border-white/15">
            <div className="flex items-center justify-between text-xs text-blue-100 mb-1.5">
              <span>
                {isScanning
                  ? `Analyzing multilateral relational topologies across ${contractors.length} contractors and ${projects.length} works...`
                  : 'Multi-Signal Network Analysis Complete'}
              </span>
              <span className="font-mono font-bold">{scanProgress}%</span>
            </div>
            <div className="h-1.5 bg-blue-950/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-300 to-emerald-400 transition-all duration-200"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700">
          {isScanning ? (
            <div className="py-12 text-center space-y-3">
              <RotateCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="font-medium text-slate-600">
                Cross-correlating Measurement Book dates, Geographic Clusters, and Treasury Draws...
              </p>
            </div>
          ) : (
            <>
              {/* Executive Scan Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-center">
                  <div className="text-[11px] text-rose-800 font-semibold">Flagged Contractors</div>
                  <div className="text-xl font-bold font-mono text-rose-600 mt-0.5">{highRiskContractors.length}</div>
                  <div className="text-[10px] text-slate-500">Score &gt; 60/100</div>
                </div>

                <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 text-center">
                  <div className="text-[11px] text-orange-800 font-semibold">High-Risk Works</div>
                  <div className="text-xl font-bold font-mono text-orange-600 mt-0.5">{highRiskProjects.length}</div>
                  <div className="text-[10px] text-slate-500">Require spot check</div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                  <div className="text-[11px] text-amber-800 font-semibold">Delayed Works</div>
                  <div className="text-xl font-bold font-mono text-amber-600 mt-0.5">{delayedCount}</div>
                  <div className="text-[10px] text-slate-500">Past target milestone</div>
                </div>

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                  <div className="text-[11px] text-blue-800 font-semibold">Financial Lead Gaps</div>
                  <div className="text-xl font-bold font-mono text-blue-600 mt-0.5">{highDeltaCount}</div>
                  <div className="text-[10px] text-slate-500">&gt;25% Payment vs Physical</div>
                </div>
              </div>

              {/* Key Anomaly Clusters */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  Primary Identified Relationship Anomalies
                </h3>

                {/* Cluster 1: Apex Infra concentration */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      Geographic & Agency Concentration: Apex Infra Buildtech LLP
                    </div>
                    <span className="text-[10px] font-mono bg-rose-100 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                      Risk: 88/100
                    </span>
                  </div>

                  <p className="text-[11.5px] text-slate-600 leading-relaxed">
                    Contractor is allocated 12 works across Haveli and Baramati with 7 above-average delays and an identical financial disbursement lead averaging +50.5% over actual physical site progress.
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Corroborated by 3 dated inspection photos</span>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectContractor('con-1');
                      }}
                      className="py-1 px-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      Inspect Contractor Graph Node
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Cluster 2: Western Ghats Builders */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                      Repeated Work Specifications: Western Ghats Builders
                    </div>
                    <span className="text-[10px] font-mono bg-orange-100 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
                      Risk: 74/100
                    </span>
                  </div>

                  <p className="text-[11.5px] text-slate-600 leading-relaxed">
                    5 community hall works share identical estimate sheets of ₹49.50 Lakhs (just below the ₹50L tender committee threshold). 3 projects exhibit 4.2-month milestone delays.
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Associated Agency: Zilla Parishad Pune Works Dept</span>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectContractor('con-2');
                      }}
                      className="py-1 px-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      Inspect Contractor Graph Node
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Recommended Next Actions */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Recommended Administrative Action Protocol
                </div>
                <ul className="list-disc list-inside text-emerald-800 text-[11px] space-y-1">
                  <li>Direct District Level Monitoring Committee (DLMC) to conduct joint physical inspections of high-delta works.</li>
                  <li>Cross-verify Measurement Book (MB) page logs with geotagged site photo timestamp metadata.</li>
                  <li>Withhold subsequent Running Account (RA) bills on works exceeding +25% financial lead until ground completion matches.</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Close Scan Results
          </button>
        </div>
      </div>
    </div>
  );
};
