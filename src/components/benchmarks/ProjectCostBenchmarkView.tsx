import React, { useState, useMemo } from 'react';
import {
  Scale,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Building2,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  ChevronRight,
  Info,
  ShieldCheck,
  Zap,
  IndianRupee,
  Layers,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Project, AuditAction, CostBenchmarkComparison } from '../../types';
import {
  calculateCostBenchmarkComparison,
  getProjectCostBreakdown,
  getCostSeverityBadge,
  CATEGORY_DSR_CEILINGS,
} from '../../utils/costComparison';

interface ProjectCostBenchmarkViewProps {
  projects: Project[];
  selectedProjectId?: string;
  initialSelectedProjectId?: string;
  onSelectProject?: (project: Project) => void;
  onOpenEvidence?: (project: Project) => void;
  onAddAuditAction?: (action: Partial<AuditAction>) => void;
  onOrderAudit?: (project: Project, comparison: CostBenchmarkComparison) => void;
}

export const ProjectCostBenchmarkView: React.FC<ProjectCostBenchmarkViewProps> = ({
  projects,
  selectedProjectId,
  initialSelectedProjectId,
  onSelectProject,
  onOpenEvidence,
  onAddAuditAction,
  onOrderAudit,
}) => {
  // Active target project state
  const [targetId, setTargetId] = useState<string>(
    initialSelectedProjectId || selectedProjectId || projects.find((p) => p.riskScore >= 80)?.id || projects[0]?.id || ''
  );

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyOutliers, setOnlyOutliers] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Sync if selectedProjectId or initialSelectedProjectId changes from outside
  React.useEffect(() => {
    if (selectedProjectId) {
      setTargetId(selectedProjectId);
    } else if (initialSelectedProjectId) {
      setTargetId(initialSelectedProjectId);
    }
  }, [selectedProjectId, initialSelectedProjectId]);

  // Categories and districts
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, [projects]);

  const districts = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => set.add(p.district));
    return ['All', ...Array.from(set)];
  }, [projects]);

  // Target project object
  const targetProject = useMemo(() => {
    return projects.find((p) => p.id === targetId) || projects[0];
  }, [projects, targetId]);

  // Calculate detailed benchmark comparison for current target
  const benchmarkData = useMemo(() => {
    if (!targetProject) return null;
    return calculateCostBenchmarkComparison(targetProject, projects);
  }, [targetProject, projects]);

  // Target and peer cost breakdown
  const targetBreakdown = useMemo(() => {
    if (!targetProject) return null;
    return getProjectCostBreakdown(targetProject);
  }, [targetProject]);

  // Peer average cost breakdown
  const peerAverageBreakdown = useMemo(() => {
    if (!benchmarkData || benchmarkData.peerProjects.length === 0) return null;
    const peerFullProjects = projects.filter((p) =>
      benchmarkData.peerProjects.some((peer) => peer.id === p.id)
    );
    const count = peerFullProjects.length || 1;
    let totalCivil = 0;
    let totalMat = 0;
    let totalLab = 0;
    let totalOver = 0;

    peerFullProjects.forEach((p) => {
      const b = getProjectCostBreakdown(p);
      totalCivil += b.civilWorksLakhs;
      totalMat += b.materialsEquipmentLakhs;
      totalLab += b.laborMachineryLakhs;
      totalOver += b.contingenciesOverheadLakhs;
    });

    return {
      civilWorksLakhs: Number((totalCivil / count).toFixed(2)),
      materialsEquipmentLakhs: Number((totalMat / count).toFixed(2)),
      laborMachineryLakhs: Number((totalLab / count).toFixed(2)),
      contingenciesOverheadLakhs: Number((totalOver / count).toFixed(2)),
    };
  }, [benchmarkData, projects]);

  // List of all projects evaluated for quick selector
  const projectComparisonList = useMemo(() => {
    return projects
      .map((p) => {
        const comp = calculateCostBenchmarkComparison(p, projects);
        return {
          project: p,
          comp,
        };
      })
      .filter(({ project, comp }) => {
        if (selectedCategory !== 'All' && project.category !== selectedCategory) return false;
        if (selectedDistrict !== 'All' && project.district !== selectedDistrict) return false;
        if (onlyOutliers && !comp.isUnusuallyHigh) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCode = project.code.toLowerCase().includes(q);
          const matchTitle = project.title.toLowerCase().includes(q);
          const matchCont = project.contractorName.toLowerCase().includes(q);
          const matchTaluka = project.taluka.toLowerCase().includes(q);
          if (!matchCode && !matchTitle && !matchCont && !matchTaluka) return false;
        }
        return true;
      })
      .sort((a, b) => b.comp.variancePercent - a.comp.variancePercent);
  }, [projects, selectedCategory, selectedDistrict, onlyOutliers, searchQuery]);

  // Trigger rate reasonableness audit action
  const handleOrderRateAudit = () => {
    if (!targetProject || !benchmarkData) return;

    if (onOrderAudit) {
      onOrderAudit(targetProject, benchmarkData);
      return;
    }

    if (onAddAuditAction) {
      const action: Partial<AuditAction> = {
        targetType: 'Project',
        targetId: targetProject.id,
        targetCode: targetProject.code,
        targetName: targetProject.title,
        lifecycleStage: 'Milestone Verification',
        actionType: 'Financial Review',
        status: 'In Progress',
        remarks: `Issued statutory BOQ Rate Reasonableness Audit. Cost is ${
          benchmarkData.variancePercent > 0 ? `+${benchmarkData.variancePercent}%` : `${benchmarkData.variancePercent}%`
        } above peer median rate (${benchmarkData.formattedProjectUnitCost} vs ${
          benchmarkData.formattedPeerMedianUnitCost
        }). DSR deviation is +${benchmarkData.dsrDeviationPercent}%.`,
        priority: 'Urgent',
        assignedInspector: 'District Planning Officer & Executive Engineer (Vigilance)',
        isPostCompletionRecord: false,
      };

      onAddAuditAction(action);
      setActionSuccessMessage(
        `Official BOQ Rate Reasonableness Audit ordered for ${targetProject.code} and registered in Blockchain Ledger.`
      );
      setTimeout(() => {
        setActionSuccessMessage(null);
      }, 4500);
    }
  };

  if (!targetProject || !benchmarkData) {
    return (
      <div className="p-8 text-center text-slate-400">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <p>No project data available for comparative benchmarking.</p>
      </div>
    );
  }

  const severityBadge = getCostSeverityBadge(benchmarkData.anomalyClassification);

  return (
    <div id="cost-benchmark-view" className="space-y-6 pb-12">
      {/* Header & Purpose Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                <Scale className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Comparative Cost Benchmark & Anomaly Outlier Detection
              </h2>
            </div>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Cross-evaluates project sanctioned amounts against peer works in the same category,
              State Public Works Department (PWD) Schedule of Rates (DSR), and unit outputs
              to uncover inflated tender allocations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 shadow-xs">
              <span className="text-slate-500">Evaluated Projects:</span>{' '}
              <strong className="text-slate-900 font-semibold">{projects.length}</strong>
            </div>
            <div className="px-3.5 py-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5 font-medium shadow-xs">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              <span>
                {projects.filter((p) => calculateCostBenchmarkComparison(p, projects).isUnusuallyHigh).length} High Outliers Detected
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-5 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="benchmark-search-input"
              type="text"
              placeholder="Search code, title, contractor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <select
              id="benchmark-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              id="benchmark-district-filter"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  District: {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <button
              id="toggle-outliers-only"
              onClick={() => setOnlyOutliers(!onlyOutliers)}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                onlyOutliers
                  ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{onlyOutliers ? 'Showing Outliers Only' : 'Filter High Outliers Only'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionSuccessMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Quick Project Switcher Carousel */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Select Project for Comparative Cost Breakdown ({projectComparisonList.length} filtered)
          </span>
          <span className="text-xs text-slate-400">Click any card to load comparison details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {projectComparisonList.map(({ project, comp }) => {
            const isSelected = project.id === targetId;
            const badge = getCostSeverityBadge(comp.anomalyClassification);

            return (
              <button
                key={project.id}
                id={`select-project-${project.code}`}
                onClick={() => {
                  setTargetId(project.id);
                  if (onSelectProject) onSelectProject(project);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-900">{project.code}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {project.taluka}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badge.badgeClass}`}
                  >
                    {comp.variancePercent > 0 ? `+${comp.variancePercent}%` : `${comp.variancePercent}%`}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-800 line-clamp-1 mb-2">
                  {project.title}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                  <div>
                    <span className="text-slate-400">Total:</span>{' '}
                    <strong className="text-slate-900 font-medium">₹{project.sanctionedAmountLakhs}L</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Rate:</span>{' '}
                    <span className="text-slate-700 font-medium">{comp.formattedProjectUnitCost}</span>
                  </div>
                </div>

                {comp.isUnusuallyHigh && (
                  <div className="mt-2 text-[10px] text-rose-600 flex items-center gap-1 font-semibold">
                    <AlertOctagon className="w-3 h-3 text-rose-600" />
                    <span>Unusually High Cost Alert</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Project In-Depth Outlier Dossier */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        {/* Outlier Alert Banner */}
        <div
          className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${severityBadge.bg} ${severityBadge.border}`}
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-white/80 border border-slate-200/80 shadow-xs shrink-0">
              {benchmarkData.isUnusuallyHigh ? (
                <AlertOctagon className="w-6 h-6 text-rose-600 animate-pulse" />
              ) : benchmarkData.anomalyClassification.includes('Elevated') ? (
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-white/90 text-slate-900 border border-slate-200 shadow-xs">
                  {targetProject.code}
                </span>
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${severityBadge.badgeClass}`}>
                  {severityBadge.label}
                </span>
                <span className="text-xs text-slate-600">
                  Category: <strong className="text-slate-900">{targetProject.category}</strong>
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {targetProject.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{targetProject.taluka}, {targetProject.district} • Contractor: <strong className="text-slate-900">{targetProject.contractorName}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenEvidence && (
              <button
                id="btn-view-evidence-modal"
                onClick={() => onOpenEvidence(targetProject)}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 border border-slate-300 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                <span>Inspect Evidence Dossier</span>
              </button>
            )}

            {benchmarkData.isUnusuallyHigh && (
              <button
                id="btn-order-rate-audit"
                onClick={handleOrderRateAudit}
                className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Order Rate Reasonableness Audit</span>
              </button>
            )}
          </div>
        </div>

        {/* 4-Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Metric 1: Project Unit Cost */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Project Unit Rate
            </span>
            <div className="text-xl font-extrabold text-slate-900 tracking-tight">
              {benchmarkData.formattedProjectUnitCost}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>Sanctioned: ₹{targetProject.sanctionedAmountLakhs}L</span>
              <span className="text-slate-400">({benchmarkData.projectQuantity} {benchmarkData.unitName})</span>
            </div>
          </div>

          {/* Metric 2: Peer Group Median */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Peer Median Rate ({benchmarkData.peerCount} Projects)
            </span>
            <div className="text-xl font-extrabold text-emerald-700 tracking-tight">
              {benchmarkData.formattedPeerMedianUnitCost}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>Peer Mean: ₹{benchmarkData.peerMeanSanctionedLakhs}L</span>
            </div>
          </div>

          {/* Metric 3: Cost Variance vs Benchmark */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Variance vs Peer Median
            </span>
            <div
              className={`text-xl font-extrabold tracking-tight flex items-center gap-1 ${
                benchmarkData.variancePercent > 30
                  ? 'text-rose-600'
                  : benchmarkData.variancePercent > 10
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {benchmarkData.variancePercent > 0 ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownRight className="w-5 h-5" />
              )}
              <span>{benchmarkData.variancePercent > 0 ? `+${benchmarkData.variancePercent}%` : `${benchmarkData.variancePercent}%`}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {benchmarkData.isUnusuallyHigh ? 'Outlier Deviation' : 'Within Standard Margin'}
            </div>
          </div>

          {/* Metric 4: DSR / Govt Schedule Baseline */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              State PWD DSR Standard Ceiling
            </span>
            <div className="text-xl font-extrabold text-blue-700 tracking-tight">
              {benchmarkData.formattedDsrCeiling}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              <span>Govt Rate Delta: </span>
              <strong
                className={
                  benchmarkData.dsrDeviationPercent > 20 ? 'text-rose-600' : 'text-slate-700'
                }
              >
                {benchmarkData.dsrDeviationPercent > 0
                  ? `+${benchmarkData.dsrDeviationPercent}%`
                  : `${benchmarkData.dsrDeviationPercent}%`}
              </strong>
            </div>
          </div>
        </div>

        {/* Visual Statistical Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Unit Cost Comparison Bar Chart (7 cols) */}
          <div className="lg:col-span-7 bg-slate-50/70 border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Peer Unit Cost Comparison ({benchmarkData.unitLabel})</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Target project unit rate compared to peer works and official PWD ceiling rate
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1 text-rose-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Target
                </span>
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span> Peers
                </span>
                <span className="flex items-center gap-1 text-blue-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> DSR Baseline
                </span>
              </div>
            </div>

            {/* Bar List */}
            <div className="space-y-3 pt-2">
              {/* Target Project Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-rose-800 flex items-center gap-1">
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-300 font-bold">
                      TARGET
                    </span>
                    <span className="truncate max-w-[220px]">{targetProject.code} - {targetProject.title}</span>
                  </span>
                  <strong className="text-rose-700 font-mono">
                    {benchmarkData.formattedProjectUnitCost}
                  </strong>
                </div>
                <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          20,
                          (benchmarkData.projectUnitCost / (benchmarkData.peerMaxUnitCost * 1.15 || 1)) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Peer Projects Bars */}
              {benchmarkData.peerProjects.slice(0, 5).map((peer) => {
                const isThisTarget = peer.id === targetProject.id;
                if (isThisTarget) return null;

                const maxRef = Math.max(benchmarkData.projectUnitCost, benchmarkData.peerMaxUnitCost) * 1.15;
                const widthPct = (peer.unitCostValue / (maxRef || 1)) * 100;

                return (
                  <div key={peer.id} className="pt-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-700 flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-slate-500">{peer.code}</span>
                        <span className="truncate max-w-[200px] text-slate-700">{peer.title}</span>
                        <span className="text-[10px] text-slate-500">({peer.district})</span>
                      </span>
                      <span className="text-slate-700 font-mono text-xs font-medium">
                        {peer.formattedUnitCost}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-slate-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(10, widthPct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* DSR Reference Benchmark Line */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-blue-800 font-semibold flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>State DSR PWD Approved Ceiling Standard</span>
                  </span>
                  <strong className="text-blue-700 font-mono">
                    {benchmarkData.formattedDsrCeiling}
                  </strong>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (benchmarkData.dsrCeilingUnitCost /
                          (Math.max(benchmarkData.projectUnitCost, benchmarkData.peerMaxUnitCost) * 1.15 || 1)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cost Component Split Comparison (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50/70 border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Cost Component Breakdown Split</span>
              </h4>
              <p className="text-[11px] text-slate-500 mb-4">
                Target work budget vs average peer composition in Lakhs (₹)
              </p>

              {targetBreakdown && peerAverageBreakdown && (
                <div className="space-y-3.5">
                  {/* Civil Works */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium">Civil Structural Works</span>
                      <span className="font-mono text-xs">
                        <strong className="text-slate-900">₹{targetBreakdown.civilWorksLakhs}L</strong>{' '}
                        <span className="text-slate-500">(Peer Avg: ₹{peerAverageBreakdown.civilWorksLakhs}L)</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{
                          width: `${(targetBreakdown.civilWorksLakhs / targetProject.sanctionedAmountLakhs) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Materials & Equipment */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium">Materials & Plant Machinery</span>
                      <span className="font-mono text-xs">
                        <strong className="text-rose-700">₹{targetBreakdown.materialsEquipmentLakhs}L</strong>{' '}
                        <span className="text-slate-500">(Peer Avg: ₹{peerAverageBreakdown.materialsEquipmentLakhs}L)</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{
                          width: `${(targetBreakdown.materialsEquipmentLakhs / targetProject.sanctionedAmountLakhs) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Labor & Logistics */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium">Skilled & Unskilled Labor</span>
                      <span className="font-mono text-xs">
                        <strong className="text-slate-900">₹{targetBreakdown.laborMachineryLakhs}L</strong>{' '}
                        <span className="text-slate-500">(Peer Avg: ₹{peerAverageBreakdown.laborMachineryLakhs}L)</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{
                          width: `${(targetBreakdown.laborMachineryLakhs / targetProject.sanctionedAmountLakhs) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Overheads & Contingencies */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium">Contractor Overheads & Margin</span>
                      <span className="font-mono text-xs">
                        <strong className={targetBreakdown.contingenciesOverheadLakhs > 2 ? 'text-rose-700' : 'text-slate-900'}>
                          ₹{targetBreakdown.contingenciesOverheadLakhs}L
                        </strong>{' '}
                        <span className="text-slate-500">(Peer Avg: ₹{peerAverageBreakdown.contingenciesOverheadLakhs}L)</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                      <div
                        className="bg-purple-600 h-full rounded-full"
                        style={{
                          width: `${(targetBreakdown.contingenciesOverheadLakhs / targetProject.sanctionedAmountLakhs) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quartile Bell Curve Rank Callout */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1.5">
                <span>Statistical Percentile Rank:</span>
                <span className="font-bold text-slate-900">{benchmarkData.percentileRank}th Percentile</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden relative">
                <div
                  className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full"
                  style={{ width: '100%' }}
                />
                <div
                  className="absolute top-0 bottom-0 w-2 bg-white border border-slate-700 shadow-xs -ml-1 transition-all duration-500"
                  style={{ left: `${Math.min(98, Math.max(2, benchmarkData.percentileRank))}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-medium">
                <span>0% (Lowest Cost)</span>
                <span>50% (Median)</span>
                <span className="text-rose-600 font-bold">100% (Highest Cost)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Explainability Diagnostics & Audit Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Diagnostic Findings */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-600" />
              <span>Cost Anomaly Diagnostic Findings</span>
            </h5>
            <ul className="space-y-2">
              {benchmarkData.costDriverExplanations.map((expl, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{expl}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Protocols */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Recommended Vigilance Actions</span>
            </h5>
            <ul className="space-y-2">
              {benchmarkData.recommendedAuditSteps.map((step, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Side-by-Side Peer Comparison Table */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>Peer Group Comparison Matrix ({benchmarkData.peerProjects.length} Projects in {targetProject.category})</span>
            </h4>
            <span className="text-xs text-slate-500 font-medium">Sorted by Unit Rate Variance</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-2.5 px-3">Project Code & Name</th>
                  <th className="py-2.5 px-3">Contractor</th>
                  <th className="py-2.5 px-3">District</th>
                  <th className="py-2.5 px-3">Sanctioned</th>
                  <th className="py-2.5 px-3">Unit Rate</th>
                  <th className="py-2.5 px-3">Variance vs Median</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {benchmarkData.peerProjects.map((peer) => {
                  const isCurrentTarget = peer.id === targetProject.id;
                  const isOutlier = peer.varianceVsMedianPercent > 30;

                  return (
                    <tr
                      key={peer.id}
                      className={`transition-colors ${
                        isCurrentTarget
                          ? 'bg-blue-50/70 font-semibold'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          {isCurrentTarget && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                          )}
                          <div>
                            <span className="font-mono font-bold text-slate-900 mr-1.5">
                              {peer.code}
                            </span>
                            {isCurrentTarget && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-300 font-bold uppercase">
                                TARGET
                              </span>
                            )}
                            <div className="text-slate-800 text-xs truncate max-w-[280px]">
                              {peer.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 truncate max-w-[160px]">
                        {peer.contractorName}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {peer.district}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        ₹{peer.sanctionedAmountLakhs}L
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 font-medium">
                        {peer.formattedUnitCost}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded border inline-block ${
                            peer.varianceVsMedianPercent > 30
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : peer.varianceVsMedianPercent > 10
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {peer.varianceVsMedianPercent > 0
                            ? `+${peer.varianceVsMedianPercent}%`
                            : `${peer.varianceVsMedianPercent}%`}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                            peer.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : peer.status === 'Delayed'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {peer.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isCurrentTarget && (
                            <button
                              id={`compare-as-target-${peer.code}`}
                              onClick={() => setTargetId(peer.id)}
                              className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-300 shadow-xs cursor-pointer"
                            >
                              Set Target
                            </button>
                          )}
                          {onOpenEvidence && (
                            <button
                              id={`evidence-btn-${peer.code}`}
                              onClick={() => {
                                const fullP = projects.find((p) => p.id === peer.id);
                                if (fullP) onOpenEvidence(fullP);
                              }}
                              className="p-1 rounded bg-white hover:bg-slate-100 text-blue-600 hover:text-blue-800 border border-slate-300 shadow-xs cursor-pointer"
                              title="View Project Evidence"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
