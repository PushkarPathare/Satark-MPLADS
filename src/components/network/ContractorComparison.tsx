/**
 * Contractor Comparison & Benchmarking Lab
 * SATARK-MPLADS Neutral Analytical Decision Support
 */

import React, { useState } from 'react';
import {
  Scale,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  Landmark,
  TrendingUp,
  FolderGit2,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Contractor, Project } from '../../types';

interface ContractorComparisonProps {
  contractors: Contractor[];
  initialContractorA?: Contractor;
  initialContractorB?: Contractor;
  projects: Project[];
  onSelectContractor?: (contractorId: string) => void;
  onClose?: () => void;
}

export const ContractorComparison: React.FC<ContractorComparisonProps> = ({
  contractors,
  initialContractorA,
  initialContractorB,
  projects,
  onSelectContractor,
  onClose,
}) => {
  const [contractorAId, setContractorAId] = useState<string>(
    initialContractorA?.id || contractors[0]?.id || ''
  );
  const [contractorBId, setContractorBId] = useState<string>(
    initialContractorB?.id || contractors[1]?.id || ''
  );

  const contractorA = contractors.find((c) => c.id === contractorAId);
  const contractorB = contractors.find((c) => c.id === contractorBId);

  if (!contractorA || !contractorB) {
    return null;
  }

  const completionRateA = ((contractorA.completed / Math.max(contractorA.totalProjects, 1)) * 100).toFixed(1);
  const completionRateB = ((contractorB.completed / Math.max(contractorB.totalProjects, 1)) * 100).toFixed(1);

  const fundUtilA = ((contractorA.totalExpenditure / Math.max(contractorA.totalSanctionedAmount, 1)) * 100).toFixed(1);
  const fundUtilB = ((contractorB.totalExpenditure / Math.max(contractorB.totalSanctionedAmount, 1)) * 100).toFixed(1);

  return (
    <div
      id="contractor-comparison-modal"
      className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="bg-white text-slate-900 p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 leading-tight">
              Contractor Network Comparative Lab
            </h3>
            <p className="text-xs text-slate-500">
              Objective comparative benchmarking across multi-project portfolios
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        )}
      </div>

      {/* Selector Strip */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contractor A Selector */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            Contractor Entity A:
          </label>
          <select
            value={contractorAId}
            onChange={(e) => setContractorAId(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold"
          >
            {contractors.map((c) => (
              <option key={c.id} value={c.id} disabled={c.id === contractorBId}>
                {c.name} ({c.code}) - Risk: {c.riskScore}/100
              </option>
            ))}
          </select>
        </div>

        {/* Contractor B Selector */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            Contractor Entity B:
          </label>
          <select
            value={contractorBId}
            onChange={(e) => setContractorBId(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold"
          >
            {contractors.map((c) => (
              <option key={c.id} value={c.id} disabled={c.id === contractorAId}>
                {c.name} ({c.code}) - Risk: {c.riskScore}/100
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="p-4 overflow-y-auto space-y-5 text-xs text-slate-800">
        {/* Metric Rows */}
        <div className="grid grid-cols-3 gap-2 py-2.5 border-b border-slate-200 items-center">
          <div className="font-bold text-slate-900">{contractorA.name}</div>
          <div className="text-center font-bold text-slate-500 uppercase text-[11px]">Metric Category</div>
          <div className="font-bold text-right text-slate-900">{contractorB.name}</div>
        </div>

        {/* Network Risk Score */}
        <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 items-center">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono font-bold text-sm px-2.5 py-1 rounded ${
                contractorA.riskScore > 70
                  ? 'bg-rose-100 text-rose-800'
                  : contractorA.riskScore > 40
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {contractorA.riskScore}/100
            </span>
          </div>
          <div className="text-center text-slate-600 font-medium">Network Risk Index</div>
          <div className="flex items-center justify-end gap-2">
            <span
              className={`font-mono font-bold text-sm px-2.5 py-1 rounded ${
                contractorB.riskScore > 70
                  ? 'bg-rose-100 text-rose-800'
                  : contractorB.riskScore > 40
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {contractorB.riskScore}/100
            </span>
          </div>
        </div>

        {/* Total Works & Status */}
        <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 items-center">
          <div>
            <div className="font-bold text-sm text-slate-900">{contractorA.totalProjects} Works</div>
            <div className="text-[10px] text-slate-500">{contractorA.completed} Done • {contractorA.ongoing} Ongoing • {contractorA.delayed} Delayed</div>
          </div>
          <div className="text-center text-slate-600 font-medium">Portfolio Works</div>
          <div className="text-right">
            <div className="font-bold text-sm text-slate-900">{contractorB.totalProjects} Works</div>
            <div className="text-[10px] text-slate-500">{contractorB.completed} Done • {contractorB.ongoing} Ongoing • {contractorB.delayed} Delayed</div>
          </div>
        </div>

        {/* Total Sanction & Expenditure */}
        <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 items-center">
          <div>
            <div className="font-bold font-mono text-slate-900">₹{(contractorA.totalSanctionedAmount / 100).toFixed(2)} Cr</div>
            <div className="text-[10px] text-slate-500">Exp: ₹{(contractorA.totalExpenditure / 100).toFixed(2)} Cr ({fundUtilA}%)</div>
          </div>
          <div className="text-center text-slate-600 font-medium">Sanction & Drawal</div>
          <div className="text-right">
            <div className="font-bold font-mono text-slate-900">₹{(contractorB.totalSanctionedAmount / 100).toFixed(2)} Cr</div>
            <div className="text-[10px] text-slate-500">Exp: ₹{(contractorB.totalExpenditure / 100).toFixed(2)} Cr ({fundUtilB}%)</div>
          </div>
        </div>

        {/* Average Delay */}
        <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 items-center">
          <div className="font-semibold text-amber-600 font-mono">
            {contractorA.avgDelayMonths} Months
          </div>
          <div className="text-center text-slate-600 font-medium">Average Delay</div>
          <div className="font-semibold text-right text-amber-600 font-mono">
            {contractorB.avgDelayMonths} Months
          </div>
        </div>

        {/* Completion Rate */}
        <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 items-center">
          <div className="font-semibold font-mono text-emerald-600">
            {completionRateA}%
          </div>
          <div className="text-center text-slate-600 font-medium">Completion Rate</div>
          <div className="font-semibold text-right font-mono text-emerald-600">
            {completionRateB}%
          </div>
        </div>

        {/* District & Agency Coverage */}
        <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 items-center">
          <div>
            <div className="font-semibold text-slate-800">{contractorA.districts.length} Districts</div>
            <div className="text-[10px] text-slate-500">{contractorA.agencies.length} Agencies</div>
          </div>
          <div className="text-center text-slate-600 font-medium">Network Dispersion</div>
          <div className="text-right">
            <div className="font-semibold text-slate-800">{contractorB.districts.length} Districts</div>
            <div className="text-[10px] text-slate-500">{contractorB.agencies.length} Agencies</div>
          </div>
        </div>

        {/* Active Flagged Signals */}
        <div className="grid grid-cols-3 gap-2 py-2 items-center">
          <div className="font-semibold text-rose-600">
            {contractorA.networkSignals.length} Flagged Signals
          </div>
          <div className="text-center text-slate-600 font-medium">Network Anomaly Signals</div>
          <div className="font-semibold text-right text-rose-600">
            {contractorB.networkSignals.length} Flagged Signals
          </div>
        </div>

        {/* Neutral Comparative Note */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Neutral Decision Support Findings
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {contractorA.name} exhibits a higher network concentration index ({contractorA.riskFactors.geographicConcentration} vs {contractorB.riskFactors.geographicConcentration}) with an average milestone delay delta of {Math.abs(contractorA.avgDelayMonths - contractorB.avgDelayMonths).toFixed(1)} months. Both contractors should be audited based on respective Measurement Book (MB) entries.
          </p>
        </div>
      </div>
    </div>
  );
};
