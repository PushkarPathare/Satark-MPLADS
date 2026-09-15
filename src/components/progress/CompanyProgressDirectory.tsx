import React, { useState, useMemo } from 'react';
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Search,
  ArrowRight,
  ShieldAlert,
  FolderGit2,
  MapPin,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Contractor, Project, RiskLevel } from '../../types';

interface CompanyProgressDirectoryProps {
  contractors: Contractor[];
  projects: Project[];
  onSelectCompany: (companyId: string) => void;
  onShowAllInGraph: () => void;
}

export const CompanyProgressDirectory: React.FC<CompanyProgressDirectoryProps> = ({
  contractors,
  projects,
  onSelectCompany,
  onShowAllInGraph,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'risk' | 'gap' | 'projects' | 'budget'>('risk');

  // Compute stats for each contractor company
  const companyCards = useMemo(() => {
    return contractors.map((contractor) => {
      const companyProjects = projects.filter(
        (p) =>
          p.contractorId === contractor.id ||
          p.contractorName.toLowerCase() === contractor.name.toLowerCase()
      );

      const totalProjects = companyProjects.length;
      const avgPhysical =
        totalProjects > 0
          ? Math.round(
              companyProjects.reduce((acc, p) => acc + p.physicalProgress, 0) / totalProjects
            )
          : 0;
      const avgFinancial =
        totalProjects > 0
          ? Math.round(
              companyProjects.reduce((acc, p) => acc + p.financialProgress, 0) / totalProjects
            )
          : 0;
      const delta = avgFinancial - avgPhysical;
      const sanctionedTotalLakhs = companyProjects.reduce(
        (acc, p) => acc + p.sanctionedAmountLakhs,
        0
      );
      const expenditureTotalLakhs = companyProjects.reduce(
        (acc, p) => acc + p.expenditureLakhs,
        0
      );
      const highDeltaCount = companyProjects.filter(
        (p) => p.financialProgress - p.physicalProgress > 20
      ).length;
      const delayedCount = companyProjects.filter(
        (p) => p.status === 'Delayed' || p.status === 'Stalled'
      ).length;

      return {
        contractor,
        companyProjects,
        totalProjects,
        avgPhysical,
        avgFinancial,
        delta,
        sanctionedTotalLakhs,
        expenditureTotalLakhs,
        highDeltaCount,
        delayedCount,
      };
    });
  }, [contractors, projects]);

  // Overall system metrics
  const systemStats = useMemo(() => {
    const totalProjects = projects.length || 1;
    const avgPhysical = Math.round(
      projects.reduce((acc, p) => acc + p.physicalProgress, 0) / totalProjects
    );
    const avgFinancial = Math.round(
      projects.reduce((acc, p) => acc + p.financialProgress, 0) / totalProjects
    );
    const criticalDeltaCount = projects.filter(
      (p) => p.financialProgress - p.physicalProgress > 20
    ).length;
    const companiesWithGap = companyCards.filter((c) => c.delta > 20).length;

    return {
      totalCompanies: contractors.length,
      totalProjects: projects.length,
      avgPhysical,
      avgFinancial,
      criticalDeltaCount,
      companiesWithGap,
    };
  }, [projects, contractors, companyCards]);

  // Filtered & sorted companies
  const filteredCompanies = useMemo(() => {
    return companyCards
      .filter(({ contractor }) => {
        const matchesSearch =
          contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contractor.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contractor.registeredDistrict.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contractor.legalEntity.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRisk =
          riskFilter === 'all' || contractor.riskLevel === riskFilter;

        return matchesSearch && matchesRisk;
      })
      .sort((a, b) => {
        if (sortBy === 'risk') return b.contractor.riskScore - a.contractor.riskScore;
        if (sortBy === 'gap') return b.delta - a.delta;
        if (sortBy === 'projects') return b.totalProjects - a.totalProjects;
        if (sortBy === 'budget') return b.sanctionedTotalLakhs - a.sanctionedTotalLakhs;
        return 0;
      });
  }, [companyCards, searchTerm, riskFilter, sortBy]);

  const getRiskBadge = (level: RiskLevel, score: number) => {
    switch (level) {
      case 'critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Critical Risk ({score}/100)
          </span>
        );
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            High Risk ({score}/100)
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-yellow-100 text-yellow-900 border border-yellow-300">
            Medium Risk ({score}/100)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Low Risk ({score}/100)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Primary Action */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <Building2 className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              Step 1: Contractor Companies Directory
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Visual Progress & Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Select any contractor company below to inspect its dedicated physical vs. financial progress curves, or click <strong className="text-slate-800 font-semibold">"Show All in Graph"</strong> to visualize all {systemStats.totalProjects} public works together.
          </p>
        </div>

        {/* Primary Call to Action: Show All in Graph */}
        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
          <button
            onClick={onShowAllInGraph}
            className="py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-95"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Show All in Graph ({systemStats.totalProjects} Projects)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <span className="text-[11px] text-center text-slate-500 font-medium">
            Visualizes all {contractors.length} companies simultaneously
          </span>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Monitored Companies</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{systemStats.totalCompanies}</span>
            <span className="text-xs text-slate-500">contractors</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-1 font-medium">
            {systemStats.totalProjects} works across {systemStats.totalCompanies} agencies
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase">System Physical Avg</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-emerald-700">
              {systemStats.avgPhysical}%
            </span>
            <span className="text-xs text-slate-500">ground execution</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full"
              style={{ width: `${systemStats.avgPhysical}%` }}
            />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-amber-800 uppercase">System Financial Avg</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-amber-800">
              {systemStats.avgFinancial}%
            </span>
            <span className="text-xs text-slate-500">treasury disbursed</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${systemStats.avgFinancial}%` }}
            />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-rose-800 uppercase flex items-center justify-between">
            <span>Progress Gap (&gt;20% Delta)</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-rose-700">
              {systemStats.companiesWithGap}
            </span>
            <span className="text-xs text-slate-500">companies flagged</span>
          </div>
          <div className="text-[11px] text-rose-700 mt-1 font-medium">
            {systemStats.criticalDeltaCount} works with financial outpacing physical
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search company by name, code, district, or registration..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-600 font-semibold shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Risk:</span>
            </div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600 font-medium"
            >
              <option value="all">All Risk Levels ({companyCards.length})</option>
              <option value="critical">Critical Risk</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium shrink-0">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600 font-medium"
            >
              <option value="risk">Highest Risk Score</option>
              <option value="gap">Highest Progress Gap</option>
              <option value="projects">Most Projects</option>
              <option value="budget">Highest Sanctioned Budget</option>
            </select>
          </div>
        </div>

        {/* Secondary Quick Button: Show All in Graph */}
        <button
          onClick={onShowAllInGraph}
          className="py-2 px-3.5 bg-slate-100 hover:bg-blue-50 text-blue-700 hover:text-blue-800 border border-slate-200 hover:border-blue-200 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Show All in Graph</span>
        </button>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCompanies.map(
          ({
            contractor,
            totalProjects,
            avgPhysical,
            avgFinancial,
            delta,
            sanctionedTotalLakhs,
            expenditureTotalLakhs,
            highDeltaCount,
            delayedCount,
          }) => {
            const hasHighGap = delta > 20;

            return (
              <div
                key={contractor.id}
                onClick={() => onSelectCompany(contractor.id)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Header: Name, Code, Risk Level */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {contractor.code}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {totalProjects} {totalProjects === 1 ? 'Project' : 'Projects'}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {contractor.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>
                          {contractor.registeredDistrict}, {contractor.state}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="truncate max-w-[200px]">{contractor.legalEntity}</span>
                      </p>
                    </div>

                    <div className="shrink-0">
                      {getRiskBadge(contractor.riskLevel, contractor.riskScore)}
                    </div>
                  </div>

                  {/* Dual Progress Bars */}
                  <div className="mt-4 space-y-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                          Average Physical Execution
                        </span>
                        <span className="font-mono font-bold text-emerald-700">
                          {avgPhysical}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(2, avgPhysical)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1">
                          <span
                            className={`w-2 h-2 rounded-full inline-block ${
                              hasHighGap ? 'bg-rose-600' : 'bg-amber-500'
                            }`}
                          />
                          Average Financial Disbursement
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            hasHighGap ? 'text-rose-700' : 'text-amber-800'
                          }`}
                        >
                          {avgFinancial}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            hasHighGap ? 'bg-rose-600' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.max(2, avgFinancial)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Progress Gap & Status Badges */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    {hasHighGap ? (
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>+{delta}% Gap (Disbursement Outpaces Execution)</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Balanced Execution ({delta > 0 ? `+${delta}%` : `${delta}%`})</span>
                      </span>
                    )}

                    {highDeltaCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-semibold">
                        {highDeltaCount} works flagged for delta
                      </span>
                    )}

                    {delayedCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                        {delayedCount} delayed
                      </span>
                    )}
                  </div>

                  {/* Budget Details Strip */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">
                        Sanctioned Budget
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        ₹{sanctionedTotalLakhs.toFixed(1)}L
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">
                        Disbursed Outflow
                      </span>
                      <span className="font-mono font-bold text-amber-800 text-sm">
                        ₹{expenditureTotalLakhs.toFixed(1)}L
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Click to inspect progress curves
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCompany(contractor.id);
                    }}
                    className="py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200 hover:border-blue-600"
                  >
                    <span>View Company Graph</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          }
        )}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3 shadow-xs">
          <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">No contractors found matching criteria</h4>
          <p className="text-xs text-slate-500">
            Try adjusting your search query or reset the risk level filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setRiskFilter('all');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Bottom Callout: Show All in Graph */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-bold">Looking for Cross-Company Comparative Analytics?</h3>
          <p className="text-xs text-slate-300">
            View all {systemStats.totalProjects} projects across all {systemStats.totalCompanies} contractors simultaneously on a single unified comparative progress graph.
          </p>
        </div>
        <button
          onClick={onShowAllInGraph}
          className="py-2.5 px-5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Show All in Graph</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
