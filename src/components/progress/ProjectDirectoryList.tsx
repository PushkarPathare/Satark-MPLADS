import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  IndianRupee,
  BarChart3,
  ArrowRight,
  TrendingUp,
  FolderGit2,
  Layers,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { Project, Contractor } from '../../types';

interface ProjectDirectoryListProps {
  projects: Project[];
  contractors?: Contractor[];
  onSelectProjectForGraph: (project: Project) => void;
  onOpenEvidence?: (project: Project) => void;
  onOpenMBook?: (projectCode: string) => void;
}

export const ProjectDirectoryList: React.FC<ProjectDirectoryListProps> = ({
  projects,
  contractors = [],
  onSelectProjectForGraph,
  onOpenEvidence,
  onOpenMBook,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedContractor, setSelectedContractor] = useState('all');
  const [filterMode, setFilterMode] = useState<'all' | 'high-delta' | 'completed' | 'delayed'>('all');
  const [sortBy, setSortBy] = useState<'delta-desc' | 'budget-desc' | 'physical-asc' | 'financial-desc'>('delta-desc');

  // Extract unique districts
  const districts = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.district))).sort();
  }, [projects]);

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.category))).sort();
  }, [projects]);

  // Key system stats (Numerical metrics only, NO graphs!)
  const stats = useMemo(() => {
    const totalCount = projects.length;
    const highDeltaCount = projects.filter(
      (p) => p.financialProgress - p.physicalProgress > 20
    ).length;
    const delayedCount = projects.filter(
      (p) => p.status === 'Delayed' || p.status === 'Stalled'
    ).length;
    const completedCount = projects.filter((p) => p.status === 'Completed').length;
    const totalSanctioned = projects.reduce((acc, p) => acc + p.sanctionedAmountLakhs, 0);
    const totalExpended = projects.reduce((acc, p) => acc + p.expenditureLakhs, 0);

    return {
      totalCount,
      highDeltaCount,
      delayedCount,
      completedCount,
      totalSanctioned,
      totalExpended,
    };
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchCode = p.code.toLowerCase().includes(q);
          const matchContractor = p.contractorName.toLowerCase().includes(q);
          const matchDistrict = p.district.toLowerCase().includes(q);
          const matchTaluka = p.taluka?.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          if (!matchTitle && !matchCode && !matchContractor && !matchDistrict && !matchTaluka && !matchCategory) {
            return false;
          }
        }

        // District filter
        if (selectedDistrict !== 'all' && p.district !== selectedDistrict) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }

        // Contractor filter
        if (selectedContractor !== 'all') {
          if (p.contractorId !== selectedContractor && p.contractorName !== selectedContractor) {
            return false;
          }
        }

        // Quick filter
        const delta = p.financialProgress - p.physicalProgress;
        if (filterMode === 'high-delta' && delta <= 20) {
          return false;
        }
        if (filterMode === 'completed' && p.status !== 'Completed') {
          return false;
        }
        if (filterMode === 'delayed' && p.status !== 'Delayed' && p.status !== 'Stalled') {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const deltaA = a.financialProgress - a.physicalProgress;
        const deltaB = b.financialProgress - b.physicalProgress;

        if (sortBy === 'delta-desc') {
          return deltaB - deltaA;
        }
        if (sortBy === 'budget-desc') {
          return b.sanctionedAmountLakhs - a.sanctionedAmountLakhs;
        }
        if (sortBy === 'physical-asc') {
          return a.physicalProgress - b.physicalProgress;
        }
        if (sortBy === 'financial-desc') {
          return b.financialProgress - a.financialProgress;
        }
        return 0;
      });
  }, [projects, searchQuery, selectedDistrict, selectedCategory, selectedContractor, filterMode, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner - Explains Step 1: Select a project to view its graph */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
              <FolderGit2 className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              Projects Directory
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Visual Progress & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Select any public works project from the directory below to view its interactive physical vs. financial progress curves, milestone timeline, and audit analytics.
          </p>
        </div>

        {/* Quick Instructions Badge */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            📊
          </div>
          <div>
            <div className="font-bold text-slate-900">Click Any Project</div>
            <div className="text-[11px] text-slate-500">
              Opens the dedicated progress graph & curve view
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Counters (Numerical Metrics Only - No Graphs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Public Works</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">
            {stats.totalCount}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            ₹{stats.totalSanctioned.toFixed(1)}L Sanctioned
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-700 font-semibold block">High Delta (&gt;20%)</span>
            {stats.highDeltaCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            )}
          </div>
          <span className="text-2xl font-black text-rose-700 font-mono mt-0.5 block">
            {stats.highDeltaCount}
          </span>
          <span className="text-[11px] text-rose-600 mt-1 block">
            Disbursement &gt; Physical
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-xs text-amber-800 font-semibold block">Delayed / Stalled</span>
          <span className="text-2xl font-black text-amber-800 font-mono mt-0.5 block">
            {stats.delayedCount}
          </span>
          <span className="text-[11px] text-amber-700 mt-1 block">
            Behind expected schedule
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-xs text-emerald-800 font-semibold block">Completed Works</span>
          <span className="text-2xl font-black text-emerald-700 font-mono mt-0.5 block">
            {stats.completedCount}
          </span>
          <span className="text-[11px] text-emerald-600 mt-1 block">
            Certified on ground
          </span>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by project name, code (MPL-xxx), contractor, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filter Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs shrink-0">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setFilterMode('high-delta')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                filterMode === 'high-delta'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>High Delta (&gt;20%)</span>
            </button>
            <button
              onClick={() => setFilterMode('delayed')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterMode === 'delayed'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              Delayed
            </button>
            <button
              onClick={() => setFilterMode('completed')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterMode === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Dropdown Filters & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 text-slate-500 font-semibold">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* District Selector */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
            >
              <option value="all">All Districts ({districts.length})</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Category Selector */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
            >
              <option value="all">All Sectors ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Contractor Selector if available */}
            {contractors.length > 0 && (
              <select
                value={selectedContractor}
                onChange={(e) => setSelectedContractor(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-600 font-medium max-w-[180px] sm:max-w-xs truncate"
              >
                <option value="all">All Contractors ({contractors.length})</option>
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
            >
              <option value="delta-desc">Highest Delta Gap (Flagged first)</option>
              <option value="budget-desc">Sanctioned Amount (High to Low)</option>
              <option value="physical-asc">Physical Progress (Lowest first)</option>
              <option value="financial-desc">Financial Progress (Highest first)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Directory List / Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing <strong className="text-slate-800">{filteredProjects.length}</strong> of {projects.length} Public Works Projects
          </span>
          <span className="italic text-slate-400">Click on any project to view its visual progress graph</span>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No Projects Match Your Filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, clearing category or district filters to view projects.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDistrict('all');
                setSelectedCategory('all');
                setSelectedContractor('all');
                setFilterMode('all');
              }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((project) => {
              const delta = project.financialProgress - project.physicalProgress;
              const isHighDelta = delta > 20;

              return (
                <div
                  key={project.id}
                  onClick={() => onSelectProjectForGraph(project)}
                  className={`bg-white rounded-2xl border transition-all duration-150 p-5 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between group ${
                    isHighDelta
                      ? 'border-rose-200 hover:border-rose-400 bg-gradient-to-b from-rose-50/20 to-white'
                      : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {project.code}
                        </span>
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {project.category}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          project.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : project.status === 'Delayed'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : project.status === 'Stalled'
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>

                    {/* Project Title */}
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {project.description}
                      </p>
                    </div>

                    {/* Contractor & Location Info */}
                    <div className="text-xs text-slate-600 space-y-1 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium truncate">{project.contractorName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {project.taluka}, {project.district}
                        </span>
                      </div>
                    </div>

                    {/* Financial Numbers */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-medium block">
                          Sanctioned Budget
                        </span>
                        <span className="font-bold font-mono text-slate-900">
                          ₹{project.sanctionedAmountLakhs.toFixed(2)}L
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-medium block">
                          Disbursed Amount
                        </span>
                        <span className="font-bold font-mono text-amber-800">
                          ₹{project.expenditureLakhs.toFixed(2)}L
                        </span>
                      </div>
                    </div>

                    {/* Dual Progress Numbers & Delta Tag */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Physical Progress:</span>
                        <span className="font-mono font-bold text-emerald-700">
                          {project.physicalProgress}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Financial Progress:</span>
                        <span className="font-mono font-bold text-amber-800">
                          {project.financialProgress}%
                        </span>
                      </div>

                      {/* Delta Indicator */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-500">Progress Delta:</span>
                        {isHighDelta ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                            <AlertTriangle className="w-3 h-3" />
                            +{delta}% Over-Disbursed
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {delta > 0 ? `+${delta}% Delta (Normal)` : `${delta}% Delta (Aligned)`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA Action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenEvidence) {
                          onOpenEvidence(project);
                        } else {
                          onSelectProjectForGraph(project);
                        }
                      }}
                      className="text-[11px] text-slate-500 hover:text-blue-700 flex items-center gap-1 font-medium transition-colors cursor-pointer group/link"
                      title="Click to inspect Evidence Dossier"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="hover:underline">{project.evidenceChain?.physicalMilestones?.length || 0} Milestones</span>
                      <span>•</span>
                      <span className="hover:underline">{project.evidenceChain?.sitePhotos?.length || 0} Photos</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {onOpenEvidence && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenEvidence(project);
                          }}
                          className="py-1.5 px-2.5 rounded-lg bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                          title="Open Field Evidence Dossier"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Evidence</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProjectForGraph(project);
                        }}
                        className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer group-hover:bg-blue-700"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>View Graph</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
