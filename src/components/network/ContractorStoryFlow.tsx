/**
 * Simplified Contractor Relationship Story Flow
 * Plain-language, visual step-by-step connection diagram
 * SATARK-MPLADS Decision-Support System
 */

import React from 'react';
import {
  Building2,
  FolderGit2,
  Landmark,
  MapPin,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Clock,
  IndianRupee,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { Contractor, Project, ImplementingAgency } from '../../types';

interface ContractorStoryFlowProps {
  contractor: Contractor;
  projects: Project[];
  agencies: ImplementingAgency[];
  onSelectProject: (project: Project) => void;
  onWhyFlaggedClick: () => void;
}

export const ContractorStoryFlow: React.FC<ContractorStoryFlowProps> = ({
  contractor,
  projects,
  agencies,
  onSelectProject,
  onWhyFlaggedClick,
}) => {
  const contractorProjects = projects.filter((p) => p.contractorId === contractor.id);

  // Group projects by implementing agency
  const agencyBreakdown = agencies
    .map((agency) => {
      const agencyProjs = contractorProjects.filter((p) => p.implementingAgencyId === agency.id);
      const totalLakhs = agencyProjs.reduce((acc, p) => acc + p.sanctionedAmountLakhs, 0);
      const percentage = contractorProjects.length > 0
        ? Math.round((agencyProjs.length / contractorProjects.length) * 100)
        : 0;
      return {
        agency,
        projects: agencyProjs,
        totalLakhs,
        percentage,
        isHighConcentration: percentage >= 50,
      };
    })
    .filter((g) => g.projects.length > 0);

  // Group projects by district
  const districtGroups: { [district: string]: Project[] } = {};
  contractorProjects.forEach((p) => {
    if (!districtGroups[p.district]) {
      districtGroups[p.district] = [];
    }
    districtGroups[p.district].push(p);
  });

  const delayedCount = contractorProjects.filter((p) => p.status === 'Delayed').length;
  const inProgressCount = contractorProjects.filter((p) => p.status === 'In Progress').length;
  const completedCount = contractorProjects.filter((p) => p.status === 'Completed').length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-6 shadow-sm">
      {/* Header: Plain Language Story Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Plain-English Relationship Story
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            How <span className="text-purple-700 underline decoration-purple-300">{contractor.name}</span> Connects to Govt Funds
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Follow the flow below to see which govt agencies awarded the work, where the funds went, and which sites are currently delayed.
          </p>
        </div>

        <button
          onClick={onWhyFlaggedClick}
          className="self-start md:self-auto px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-amber-600" />
          Why is this Contractor Flagged?
        </button>
      </div>

      {/* 3-Step Visual Story Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* STEP 1: Government Agencies (Who awarded the work?) */}
        <div className="lg:col-span-4 bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-emerald-700" />
                Step 1: Govt Agencies
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                {agencyBreakdown.length} Approving Bodies
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Government authorities that sanctioned and awarded tenders to this contractor:
            </p>

            <div className="space-y-2.5">
              {agencyBreakdown.map((item) => (
                <div
                  key={item.agency.id}
                  className={`p-2.5 rounded-lg border text-xs transition-all ${
                    item.isHighConcentration
                      ? 'bg-rose-50 border-rose-200'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="truncate">{item.agency.name}</span>
                    <span className="font-mono text-emerald-700 shrink-0 ml-2">
                      ₹{(item.totalLakhs / 100).toFixed(2)} Cr
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{item.projects.length} Works allocated</span>
                    <span className={`font-semibold ${item.isHighConcentration ? 'text-amber-700 font-bold' : 'text-slate-600'}`}>
                      {item.percentage}% of all works {item.isHighConcentration && '⚠️'}
                    </span>
                  </div>
                  {item.isHighConcentration && (
                    <div className="mt-1.5 text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      High agency concentration signal
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Total Sanctioned:</span>
            <span className="font-bold text-emerald-700 font-mono text-xs">
              ₹{(contractor.totalSanctionedAmount / 100).toFixed(2)} Cr
            </span>
          </div>
        </div>

        {/* STEP 2: The Contractor Hub (The executing entity) */}
        <div className="lg:col-span-4 bg-purple-50/60 rounded-xl border-2 border-purple-200 p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-purple-700" />
                Step 2: Contractor Hub
              </span>
              <span
                className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                  contractor.riskScore >= 70
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                Risk Score: {contractor.riskScore}/100
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-purple-200 text-center mb-3 shadow-xs">
              <div className="text-[10px] text-purple-700 font-mono font-semibold">{contractor.code} • {contractor.registeredDistrict}</div>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">{contractor.name}</div>
              <div className="text-[11px] text-slate-500">{contractor.legalEntity}</div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-center shadow-xs">
                <div className="text-[10px] text-slate-500">Total Works</div>
                <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                  {contractorProjects.length} Projects
                </div>
              </div>

              <div className="p-2 bg-white rounded-lg border border-slate-200 text-center shadow-xs">
                <div className="text-[10px] text-slate-500">Average Delay</div>
                <div className="text-sm font-bold text-rose-600 font-mono mt-0.5">
                  +{contractor.avgDelayDays} Days
                </div>
              </div>

              <div className="p-2 bg-white rounded-lg border border-slate-200 text-center shadow-xs">
                <div className="text-[10px] text-slate-500">Funds Drawn</div>
                <div className="text-sm font-bold text-amber-700 font-mono mt-0.5">
                  ₹{(contractor.totalDisbursedAmount / 100).toFixed(2)} Cr
                </div>
              </div>

              <div className="p-2 bg-white rounded-lg border border-slate-200 text-center shadow-xs">
                <div className="text-[10px] text-slate-500">Districts Active</div>
                <div className="text-sm font-bold text-orange-700 font-mono mt-0.5">
                  {contractor.districts.length} Districts
                </div>
              </div>
            </div>

            {/* Status Breakdown Pills */}
            <div className="flex items-center justify-center gap-2 text-[11px] mt-3 pt-2 border-t border-purple-200">
              <span className="text-rose-600 font-semibold">{delayedCount} Delayed</span>
              <span className="text-slate-400">•</span>
              <span className="text-blue-600 font-semibold">{inProgressCount} Ongoing</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-700 font-semibold">{completedCount} Done</span>
            </div>
          </div>

          <div className="mt-3 p-2 bg-white rounded-lg border border-purple-200 text-[11px] text-slate-700 leading-snug shadow-xs">
            <span className="font-semibold text-purple-800">Signal: </span>
            {contractor.riskScore >= 70
              ? 'Significant concentration of delayed works with advance payment drawals.'
              : 'Moderate delay frequency across multi-district works.'}
          </div>
        </div>

        {/* STEP 3: Execution Sites & Projects (Where are the works happening?) */}
        <div className="lg:col-span-4 bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-blue-700" />
                Step 3: Ground Projects
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200 font-medium">
                {contractorProjects.length} Field Sites
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Click any project below to inspect geotagged site photos and invoices:
            </p>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {Object.entries(districtGroups).map(([district, districtProjects]) => (
                <div key={district} className="space-y-1.5">
                  <div className="text-[10px] font-bold text-orange-700 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-orange-600" />
                    {district} District ({districtProjects.length} works)
                  </div>

                  {districtProjects.map((p) => {
                    const isDelayed = p.status === 'Delayed';
                    return (
                      <button
                        key={p.id}
                        onClick={() => onSelectProject(p)}
                        className={`w-full p-2 rounded-lg border text-left flex items-center justify-between gap-2 transition-all hover:scale-[1.01] cursor-pointer ${
                          isDelayed
                            ? 'bg-rose-50 hover:bg-rose-100 border-rose-200'
                            : 'bg-white hover:bg-slate-100 border-slate-200 shadow-xs'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-blue-700">{p.code}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                isDelayed
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : p.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {p.status}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                            {p.title}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold font-mono text-slate-900">
                            ₹{p.sanctionedAmountLakhs}L
                          </div>
                          <div className="text-[10px] text-blue-700 flex items-center justify-end gap-0.5">
                            Photos <ExternalLink className="w-2.5 h-2.5" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Delayed Projects:</span>
            <span className="font-bold text-rose-600 font-mono text-xs">
              {delayedCount} of {contractorProjects.length} ({Math.round((delayedCount / Math.max(contractorProjects.length, 1)) * 100)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Summary Callout */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-700 shadow-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong className="text-slate-900">Summary for Nodal Officer: </strong>
            {contractor.name} holds ₹{(contractor.totalSanctionedAmount / 100).toFixed(2)} Cr in MPLADS works with {delayedCount} overdue projects.
            {contractor.riskScore >= 70 && ' Recommend prioritizing joint site inspection of physical milestones against Measurement Book entries.'}
          </span>
        </div>

        <div className="text-slate-500 text-[11px] shrink-0 font-mono">
          SATARK Decision Support ID: {contractor.code}
        </div>
      </div>
    </div>
  );
};
