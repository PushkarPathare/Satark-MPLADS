/**
 * Contractor Profile & Risk Intelligence Panel
 * SATARK-MPLADS Decision-Support System
 */

import React, { useState } from 'react';
import {
  Building2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  FolderGit2,
  Calendar,
  IndianRupee,
  Clock,
  Landmark,
  MapPin,
  FileCheck2,
  SearchCheck,
  Scale,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Contractor, NetworkSignal } from '../../types';

interface ContractorProfilePanelProps {
  contractor: Contractor;
  onWhyFlaggedClick: () => void;
  onAnalyzeNetworkClick: () => void;
  onShowRelatedProjectsClick: () => void;
  onCompareClick: (contractor: Contractor) => void;
  onTakeActionClick: (target: { type: 'Contractor'; id: string; name: string; code: string }) => void;
  onClose?: () => void;
}

export const ContractorProfilePanel: React.FC<ContractorProfilePanelProps> = ({
  contractor,
  onWhyFlaggedClick,
  onAnalyzeNetworkClick,
  onShowRelatedProjectsClick,
  onCompareClick,
  onTakeActionClick,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'signals' | 'timeline' | 'factors'>('overview');

  // Format currency helpers
  const formatCroresOrLakhs = (lakhs: number) => {
    if (lakhs >= 100) {
      return `₹${(lakhs / 100).toFixed(2)} Cr`;
    }
    return `₹${lakhs.toFixed(1)} L`;
  };

  const getRiskBadgeColor = (score: number) => {
    if (score >= 81) return 'bg-rose-100 text-rose-800 border-rose-300';
    if (score >= 61) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (score >= 31) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  };

  const getRiskScoreLabel = (score: number) => {
    if (score >= 81) return 'Critical Risk';
    if (score >= 61) return 'High Risk';
    if (score >= 31) return 'Medium Risk';
    return 'Low Risk';
  };

  return (
    <div
      id="contractor-profile-panel"
      className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-full"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-blue-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-blue-200 font-semibold">
                  {contractor.code}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/15 text-white border border-white/20">
                  {contractor.registeredDistrict}, MH
                </span>
              </div>
              <h3 className="font-bold text-base text-white leading-tight mt-0.5">
                {contractor.name}
              </h3>
              <p className="text-xs text-blue-100">{contractor.legalEntity}</p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Risk Score Indicator */}
        <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-xs text-blue-100 font-medium">Contractor Network Risk:</div>
            <span
              className={`font-mono font-bold text-xs px-2 py-0.5 rounded-full border ${getRiskBadgeColor(
                contractor.riskScore
              )}`}
            >
              {contractor.riskScore}/100 • {getRiskScoreLabel(contractor.riskScore)}
            </span>
          </div>

          <button
            id="btn-why-flagged"
            onClick={onWhyFlaggedClick}
            className="text-xs flex items-center gap-1 text-amber-950 font-semibold bg-amber-300 hover:bg-amber-200 px-2.5 py-1 rounded-md border border-amber-400 transition-colors cursor-pointer shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-900" />
            Why Flagged?
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-2 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2.5 px-3 font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('signals')}
          className={`py-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'signals'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Signals ({contractor.networkSignals.length})
          {contractor.networkSignals.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('factors')}
          className={`py-2.5 px-3 font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'factors'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Risk Breakdown
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`py-2.5 px-3 font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'timeline'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Timeline
        </button>
      </div>

      {/* Main Body Content based on active tab */}
      <div className="p-4 overflow-y-auto flex-1 space-y-4 text-slate-800">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <FolderGit2 className="w-3.5 h-3.5 text-blue-600" />
                  Total Projects
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                  {contractor.totalProjects}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                  <span className="text-emerald-600 font-semibold">✓ {contractor.completed} Done</span>
                  <span className="text-blue-600 font-semibold">⏳ {contractor.ongoing} Ongoing</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Delayed Projects
                </div>
                <div className="text-xl font-bold font-mono text-amber-600 mt-1">
                  {contractor.delayed}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Avg delay: <span className="font-semibold text-slate-700">{contractor.avgDelayMonths} months</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-blue-500" />
                  Total Sanctioned
                </div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                  {formatCroresOrLakhs(contractor.totalSanctionedAmount)}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Avg work cost: {formatCroresOrLakhs(contractor.avgCostLakhs)}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                  Total Expenditure
                </div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                  {formatCroresOrLakhs(contractor.totalExpenditure)}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Fund drawal: <span className="font-semibold">{((contractor.totalExpenditure / contractor.totalSanctionedAmount) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Network Connections Footprint */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Network Reach & Density</span>
                <span className="text-[10px] font-normal text-slate-500">Multilateral Associations</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <div>
                    <div className="font-bold text-slate-900">{contractor.districts.length} Districts</div>
                    <div className="text-[10px] text-slate-500">{contractor.districts.join(', ')}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                  <Landmark className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className="font-bold text-slate-900">{contractor.agencies.length} Agencies</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[130px]" title={contractor.agencies.join(', ')}>
                      {contractor.agencies.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decision Support Guidance Callout */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Administrative Decision-Support Notice
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                SATARK highlights structural patterns to facilitate targeted physical inspections. Statistical deviations do NOT constitute allegations and require independent field validation.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-1">
              <button
                id="btn-analyze-network"
                onClick={onAnalyzeNetworkClick}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Analyze Contractor Network
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-show-related-projects"
                  onClick={onShowRelatedProjectsClick}
                  className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  Related Works
                </button>

                <button
                  id="btn-compare-contractor"
                  onClick={() => onCompareClick(contractor)}
                  className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5 text-blue-600" />
                  Compare
                </button>
              </div>

              <button
                id="btn-take-action-contractor"
                onClick={() =>
                  onTakeActionClick({
                    type: 'Contractor',
                    id: contractor.id,
                    name: contractor.name,
                    code: contractor.code,
                  })
                }
                className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <SearchCheck className="w-3.5 h-3.5" />
                Initiate Verification Action
              </button>
            </div>
          </div>
        )}

        {/* Signals Tab */}
        {activeTab === 'signals' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Identified Network Signals ({contractor.networkSignals.length})
              </span>
              <span className="text-[10px] text-slate-400">Algorithmic Correlation Engine</span>
            </div>

            {contractor.networkSignals.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="font-semibold text-xs text-slate-700">No Unusual Network Signals</div>
                <p className="text-[11px] text-slate-400 mt-1">This contractor operates within standard district distribution parameters.</p>
              </div>
            ) : (
              contractor.networkSignals.map((signal) => (
                <div
                  key={signal.id}
                  className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      {signal.severity === 'critical' && <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />}
                      {signal.severity === 'high' && <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                      {signal.severity === 'medium' && <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                      {signal.severity === 'low' && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                      {signal.title}
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {signal.flagCode}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {signal.description}
                  </p>

                  {signal.benchmarkComparison && (
                    <div className="text-[11px] p-1.5 bg-slate-50 rounded text-slate-600 border border-slate-200">
                      <span className="font-semibold text-slate-700">Benchmark: </span>
                      {signal.benchmarkComparison}
                    </div>
                  )}

                  {signal.supportingEvidence && signal.supportingEvidence.length > 0 && (
                    <div className="space-y-1 text-[11px]">
                      <div className="font-semibold text-slate-500">Corroborating Evidence:</div>
                      <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                        {signal.supportingEvidence.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Confidence: <strong className="text-slate-700">{signal.confidence}%</strong></span>
                    <span className="text-blue-600 font-semibold">{signal.recommendedAction}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Risk Breakdown Tab */}
        {activeTab === 'factors' && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">Total Network Risk Index</span>
                <span className="text-base font-bold font-mono text-blue-700">{contractor.riskScore} / 100</span>
              </div>
              <p className="text-[11px] text-blue-800/80 mt-1">
                Calculated from 6 multi-dimensional risk factors comparing this contractor with district baselines.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span>Geographic Concentration</span>
                  <span className="font-mono font-bold text-blue-600">+{contractor.riskFactors.geographicConcentration} pts</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(contractor.riskFactors.geographicConcentration / 25) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span>Project Characteristic Similarity</span>
                  <span className="font-mono font-bold text-blue-600">+{contractor.riskFactors.projectSimilarity} pts</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(contractor.riskFactors.projectSimilarity / 25) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span>Milestone Delay Pattern</span>
                  <span className="font-mono font-bold text-blue-600">+{contractor.riskFactors.delayPattern} pts</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(contractor.riskFactors.delayPattern / 25) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span>Cost & Estimate Deviation</span>
                  <span className="font-mono font-bold text-blue-600">+{contractor.riskFactors.costDeviation} pts</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(contractor.riskFactors.costDeviation / 25) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span>Implementing Agency Concentration</span>
                  <span className="font-mono font-bold text-blue-600">+{contractor.riskFactors.agencyConcentration} pts</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(contractor.riskFactors.agencyConcentration / 20) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span>Historical Physical-Financial Deltas</span>
                  <span className="font-mono font-bold text-blue-600">+{contractor.riskFactors.historicalAnomalies} pts</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(contractor.riskFactors.historicalAnomalies / 15) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700">
              Contractor Project Portfolio Growth
            </div>

            <div className="relative pl-4 border-l-2 border-blue-200 space-y-4">
              {contractor.timeline.map((item, idx) => (
                <div key={item.year} className="relative group">
                  <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white" />
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>Year {item.year}</span>
                      <span className="font-mono text-blue-600">{item.projectCount} Projects</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Sanctioned: ₹{item.sanctionedCr} Cr | Disbursed: ₹{item.expenditureCr} Cr
                    </div>
                    {item.milestoneNotes && (
                      <p className="text-[10px] text-slate-600 italic mt-1 bg-white p-1.5 rounded border border-slate-200">
                        {item.milestoneNotes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
