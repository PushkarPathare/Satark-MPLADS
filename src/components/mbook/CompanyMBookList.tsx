import React, { useState, useMemo } from 'react';
import {
  Building2,
  BookOpen,
  ArrowRight,
  Search,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Landmark,
  FileSpreadsheet,
  Layers,
  MapPin,
  Calendar,
  Briefcase,
} from 'lucide-react';
import { CompanyMBookMeta } from '../../data/companyMBooks';
import { SyntheticMBookRecord } from '../../types/mbook';

interface CompanyMBookListProps {
  companies: CompanyMBookMeta[];
  companyDatasets: Record<string, SyntheticMBookRecord[]>;
  onSelectCompany: (companyId: string) => void;
}

export const CompanyMBookList: React.FC<CompanyMBookListProps> = ({
  companies,
  companyDatasets,
  onSelectCompany,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');

  // Compute live counts per company from datasets
  const companyStats = useMemo(() => {
    const stats: Record<
      string,
      { total: number; normal: number; suspicious: number; anomalous: number; totalValuation: number }
    > = {};

    companies.forEach((comp) => {
      const records = companyDatasets[comp.id] || [];
      const normal = records.filter((r) => r.groundTruth === 'NORMAL').length;
      const suspicious = records.filter((r) => r.groundTruth === 'SUSPICIOUS').length;
      const anomalous = records.filter((r) => r.groundTruth === 'ANOMALOUS').length;
      const totalValuation = records.reduce((acc, r) => acc + (r.calculatedAmount || 0), 0);

      stats[comp.id] = {
        total: records.length,
        normal,
        suspicious,
        anomalous,
        totalValuation,
      };
    });

    return stats;
  }, [companies, companyDatasets]);

  // Aggregate totals for top summary banner
  const globalSummary = useMemo(() => {
    let totalRecords = 0;
    let totalAnomalies = 0;
    let totalSanctionedLakhs = 0;

    companies.forEach((c) => {
      const s = companyStats[c.id];
      if (s) {
        totalRecords += s.total;
        totalAnomalies += s.suspicious + s.anomalous;
      }
      totalSanctionedLakhs += c.sanctionedAmountLakhs;
    });

    return {
      companiesCount: companies.length,
      totalRecords,
      totalAnomalies,
      totalSanctionedLakhs,
    };
  }, [companies, companyStats]);

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((comp) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        comp.name.toLowerCase().includes(q) ||
        comp.code.toLowerCase().includes(q) ||
        comp.projectTitle.toLowerCase().includes(q) ||
        comp.projectId.toLowerCase().includes(q) ||
        comp.mbNumber.toLowerCase().includes(q) ||
        comp.registeredDistrict.toLowerCase().includes(q);

      const matchesRisk =
        selectedRiskFilter === 'all' || comp.riskLevel === selectedRiskFilter;

      return matchesSearch && matchesRisk;
    });
  }, [companies, searchTerm, selectedRiskFilter]);

  return (
    <div className="space-y-6">
      {/* Official Directory Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span>CPWA Form 23 • Public Works Electronic Measurement Books (e-MB)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Contractor Companies Measurement Directory</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Select any registered contractor company below to inspect their complete measurement book entries, dimensional calculations, engineering check-measurements, and ground-truth anomaly classifications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Repository Status
              </span>
              <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active M-Books Loaded
              </span>
            </div>
          </div>
        </div>

        {/* Global Summary Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100 text-xs">
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80">
            <span className="text-slate-500 text-[11px] font-medium block">Registered Companies</span>
            <span className="text-lg font-black text-slate-900 mt-0.5 block">{globalSummary.companiesCount}</span>
            <span className="text-[10px] text-slate-500">Across PWD, ZP, MJP, MSRDC</span>
          </div>
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80">
            <span className="text-slate-500 text-[11px] font-medium block">Total Recorded Entries</span>
            <span className="text-lg font-black text-blue-700 mt-0.5 block">{globalSummary.totalRecords}</span>
            <span className="text-[10px] text-slate-500">Form CPWA 23 items</span>
          </div>
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80">
            <span className="text-slate-500 text-[11px] font-medium block">Flagged / Anomalous</span>
            <span className="text-lg font-black text-amber-700 mt-0.5 block">{globalSummary.totalAnomalies}</span>
            <span className="text-[10px] text-slate-500">Labeled for AI auditing</span>
          </div>
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80">
            <span className="text-slate-500 text-[11px] font-medium block">Total Sanctioned Value</span>
            <span className="text-lg font-black text-emerald-700 mt-0.5 block">
              ₹{(globalSummary.totalSanctionedLakhs / 100).toFixed(2)} Cr
            </span>
            <span className="text-[10px] text-slate-500">₹{globalSummary.totalSanctionedLakhs} Lakhs total</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company, code, project ID, M-Book..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto overflow-x-auto text-xs pb-1 sm:pb-0">
          <span className="text-slate-500 font-medium whitespace-nowrap text-[11px]">Risk Filter:</span>
          {['all', 'critical', 'high', 'medium', 'low'].map((risk) => (
            <button
              key={risk}
              onClick={() => setSelectedRiskFilter(risk)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                selectedRiskFilter === risk
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>

      {/* Company Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCompanies.map((comp) => {
          const stats = companyStats[comp.id] || {
            total: 0,
            normal: 0,
            suspicious: 0,
            anomalous: 0,
            totalValuation: 0,
          };

          const riskBadge =
            comp.riskLevel === 'critical'
              ? 'bg-rose-100 text-rose-800 border-rose-300'
              : comp.riskLevel === 'high'
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : comp.riskLevel === 'medium'
              ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
              : 'bg-emerald-100 text-emerald-800 border-emerald-300';

          return (
            <div
              key={comp.id}
              onClick={() => onSelectCompany(comp.id)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
            >
              {/* Subtle top accent border */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  comp.riskLevel === 'critical'
                    ? 'bg-rose-500'
                    : comp.riskLevel === 'high'
                    ? 'bg-amber-500'
                    : comp.riskLevel === 'medium'
                    ? 'bg-yellow-500'
                    : 'bg-emerald-500'
                }`}
              />

              <div className="space-y-3">
                {/* Header: Name + Code + Risk Score */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {comp.code}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {comp.registeredDistrict}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors pt-1">
                      {comp.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">{comp.legalEntity}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${riskBadge}`}
                    >
                      {comp.riskLevel.toUpperCase()} RISK ({comp.riskScore}/100)
                    </span>
                  </div>
                </div>

                {/* Project & M-Book Info Box */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
                        Assigned Public Work
                      </span>
                      <span className="font-semibold text-slate-800 line-clamp-1">
                        {comp.projectTitle}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Project ID: {comp.projectId}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-200/60 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">M-Book Volume</span>
                      <span className="font-mono font-bold text-slate-900">{comp.mbNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Implementing Agency</span>
                      <span className="font-medium text-slate-700 truncate block">
                        {comp.implementingAgency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description Snippet */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {comp.description}
                </p>
              </div>

              {/* Bottom Metrics and Action Footer */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">M-Book Entries</span>
                    <span className="font-black text-slate-900 text-sm">{stats.total} Records</span>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Ground Truth</span>
                    <span className="text-[11px] font-semibold flex items-center gap-1.5">
                      <span className="text-emerald-700">{stats.normal} Normal</span>
                      {(stats.suspicious > 0 || stats.anomalous > 0) && (
                        <span className="text-rose-700 font-bold">
                          • {stats.suspicious + stats.anomalous} Flagged
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs group-hover:bg-blue-700 transition-all cursor-pointer shrink-0"
                >
                  <span>Open M-Book Table</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No Contractor Companies Match Your Filter</h4>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search terms or clearing the risk filter to see all registered companies.
          </p>
        </div>
      )}
    </div>
  );
};
