/**
 * Related Projects Table Component
 * SATARK-MPLADS Contractor Network Intelligence
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  FileCheck,
  AlertTriangle,
  FolderGit2,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  MapPin,
  Building2,
  IndianRupee,
} from 'lucide-react';
import { Project, ProjectStatus, RiskLevel } from '../../types';

interface RelatedProjectsTableProps {
  projects: Project[];
  selectedContractorName?: string;
  onSelectProject: (project: Project) => void;
  onTakeAction: (project: Project) => void;
  onFilterContractor?: (contractorId: string) => void;
}

export const RelatedProjectsTable: React.FC<RelatedProjectsTableProps> = ({
  projects,
  selectedContractorName,
  onSelectProject,
  onTakeAction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'riskScore' | 'sanctionedAmountLakhs' | 'code' | 'physicalProgress'>('riskScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category));
    return Array.from(set);
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCode = p.code.toLowerCase().includes(q);
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchContractor = p.contractorName.toLowerCase().includes(q);
          const matchDistrict = p.district.toLowerCase().includes(q);
          if (!matchCode && !matchTitle && !matchContractor && !matchDistrict) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          valA = (valA as string).toLowerCase();
          valB = (valB as string).toLowerCase();
        }
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [projects, searchQuery, statusFilter, categoryFilter, sortField, sortDirection]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Ongoing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Delayed':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Under Scrutiny':
      case 'Stalled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRiskScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
    if (score >= 60) return 'bg-orange-100 text-orange-800 border-orange-300 font-bold';
    if (score >= 35) return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  };

  return (
    <div
      id="related-projects-section"
      className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
    >
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-blue-600" />
              Related MPLADS Works & Evidence Chain
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'Work' : 'Works'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedContractorName
              ? `Showing all works directly executed or connected to ${selectedContractorName}`
              : 'Showing all active and monitored works in the current network scope'}
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search code, title, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 w-48 lg:w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none shadow-xs"
          >
            <option value="all">All Statuses</option>
            <option value="Delayed">Delayed</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Under Scrutiny">Under Scrutiny</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none shadow-xs"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th
                onClick={() => handleSort('code')}
                className="py-3 px-3 cursor-pointer hover:text-blue-600"
              >
                <div className="flex items-center gap-1">
                  Project ID & Title
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3">District & Agency</th>
              <th
                onClick={() => handleSort('sanctionedAmountLakhs')}
                className="py-3 px-3 cursor-pointer hover:text-blue-600"
              >
                <div className="flex items-center gap-1">
                  Sanction & Spend
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('physicalProgress')}
                className="py-3 px-3 cursor-pointer hover:text-blue-600"
              >
                <div className="flex items-center gap-1">
                  Progress Delta
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3">Contractor</th>
              <th className="py-3 px-3">Status</th>
              <th
                onClick={() => handleSort('riskScore')}
                className="py-3 px-3 cursor-pointer hover:text-blue-600 text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  Risk Score
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No projects match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredProjects.map((p) => {
                const delta = p.financialProgress - p.physicalProgress;
                const isHighDelta = delta > 25;

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => onSelectProject(p)}
                  >
                    {/* Project ID & Title */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-blue-600">
                        <span>{p.code}</span>
                        {p.anomalies.length > 0 && (
                          <span
                            title={p.alertDescription}
                            className="w-2 h-2 rounded-full bg-rose-500 inline-block"
                          />
                        )}
                      </div>
                      <div className="font-semibold text-slate-900 text-xs line-clamp-1 max-w-xs mt-0.5">
                        {p.title}
                      </div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 italic">
                        {p.category} • MP: {p.mpName}
                      </div>
                    </td>

                    {/* District & Implementing Agency */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                        {p.district} ({p.taluka})
                      </div>
                      <div
                        className="text-[10px] text-slate-500 truncate max-w-[150px] mt-0.5"
                        title={p.implementingAgencyName}
                      >
                        {p.implementingAgencyName}
                      </div>
                    </td>

                    {/* Sanction & Expenditure */}
                    <td className="py-3 px-3">
                      <div className="font-mono font-semibold text-slate-900">
                        ₹{p.sanctionedAmountLakhs.toFixed(1)} L
                      </div>
                      <div className="text-[10.5px] text-slate-500">
                        Disbursed: ₹{p.expenditureLakhs.toFixed(1)} L
                      </div>
                    </td>

                    {/* Progress Delta (Physical vs Financial) */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20">
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span className="text-emerald-600 font-semibold">{p.physicalProgress}% Phys</span>
                            <span className="text-blue-600 font-semibold">{p.financialProgress.toFixed(0)}% Fin</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                            <div
                              className="bg-emerald-500 h-full"
                              style={{ width: `${p.physicalProgress}%` }}
                            />
                          </div>
                        </div>

                        {isHighDelta && (
                          <span
                            title={`Financial payment exceeds physical status by +${delta.toFixed(1)}%`}
                            className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-1 py-0.5 rounded border border-rose-200"
                          >
                            +{delta.toFixed(0)}% Δ
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Contractor */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900 text-xs">
                        {p.contractorName}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${getStatusBadge(
                          p.status
                        )}`}
                      >
                        {p.status}
                      </span>
                    </td>

                    {/* Risk Score */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block font-mono text-[11px] px-2 py-0.5 rounded border ${getRiskScoreBadge(
                          p.riskScore
                        )}`}
                      >
                        {p.riskScore}/100
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectProject(p)}
                          className="py-1 px-2 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Open Evidence Chain (GIS, Photos, Invoices)"
                        >
                          <FileCheck className="w-3 h-3" />
                          Evidence
                        </button>

                        <button
                          onClick={() => onTakeAction(p)}
                          className="py-1 px-2 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded border border-rose-200 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Take Verification Action"
                        >
                          Action
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

      {/* Footer Info Strip */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span>Notice: Click any work row to view the full </span>
          <strong className="text-slate-700 font-semibold">
            Contractor → Project → Anomaly → Evidence Chain
          </strong>
        </div>
        <div className="font-mono text-slate-400">
          MoSPI MPLADS Portal Sync: LIVE (v2026.8.2)
        </div>
      </div>
    </div>
  );
};
