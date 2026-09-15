import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  Calendar,
  Building2,
  MapPin,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Layers,
  FileText,
  Info,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Project, Contractor } from '../../types';

interface ProjectIndividualGraphViewProps {
  project: Project;
  allProjects: Project[];
  contractors?: Contractor[];
  onBackToProjects: () => void;
  onSelectAnotherProject: (project: Project) => void;
  onOpenEvidence?: (project: Project) => void;
  onOpenMBook?: (projectCode: string) => void;
}

export const ProjectIndividualGraphView: React.FC<ProjectIndividualGraphViewProps> = ({
  project,
  allProjects,
  contractors = [],
  onBackToProjects,
  onSelectAnotherProject,
  onOpenEvidence,
  onOpenMBook,
}) => {
  const [activeTab, setActiveTab] = useState<'scurve' | 'meters' | 'milestones' | 'peer'>('scurve');

  const delta = project.financialProgress - project.physicalProgress;
  const isHighDelta = delta > 20;

  // Contractor info
  const contractor = useMemo(() => {
    return (
      contractors.find(
        (c) => c.id === project.contractorId || c.name === project.contractorName
      ) || null
    );
  }, [contractors, project]);

  // Sector peer comparison stats
  const sectorPeers = useMemo(() => {
    return allProjects.filter(
      (p) => p.category === project.category && p.id !== project.id
    );
  }, [allProjects, project]);

  const sectorAvgPhysical = useMemo(() => {
    if (sectorPeers.length === 0) return project.physicalProgress;
    return Math.round(
      sectorPeers.reduce((acc, p) => acc + p.physicalProgress, 0) / sectorPeers.length
    );
  }, [sectorPeers, project]);

  const sectorAvgFinancial = useMemo(() => {
    if (sectorPeers.length === 0) return project.financialProgress;
    return Math.round(
      sectorPeers.reduce((acc, p) => acc + p.financialProgress, 0) / sectorPeers.length
    );
  }, [sectorPeers, project]);

  // Contractor other works
  const contractorOtherWorks = useMemo(() => {
    return allProjects.filter(
      (p) =>
        (p.contractorId === project.contractorId ||
          p.contractorName === project.contractorName) &&
        p.id !== project.id
    );
  }, [allProjects, project]);

  // Milestone stages with synthetic or real data
  const milestones = useMemo(() => {
    const list = project.evidenceChain?.physicalMilestones || [];
    if (list.length > 0) return list;

    // Fallback staged milestones if empty
    return [
      {
        id: 'm1',
        title: 'Site Preparation & Excavation',
        targetDate: '2024-04-15',
        actualDate: '2024-04-20',
        weightagePercent: 15,
        completedPercent: Math.min(100, Math.round(project.physicalProgress * 1.8)),
        measurementBookRef: `${project.evidenceChain?.measurementBookNo || 'MB-2025'}-P12`,
        verified: project.physicalProgress >= 15,
      },
      {
        id: 'm2',
        title: 'Foundation & Plinth Works',
        targetDate: '2024-07-30',
        actualDate: '2024-08-05',
        weightagePercent: 25,
        completedPercent: Math.min(
          100,
          Math.max(0, Math.round((project.physicalProgress - 15) * 1.5))
        ),
        measurementBookRef: `${project.evidenceChain?.measurementBookNo || 'MB-2025'}-P24`,
        verified: project.physicalProgress >= 40,
      },
      {
        id: 'm3',
        title: 'Superstructure / Core Execution',
        targetDate: '2024-11-15',
        actualDate: '2024-11-28',
        weightagePercent: 35,
        completedPercent: Math.min(
          100,
          Math.max(0, Math.round((project.physicalProgress - 40) * 1.2))
        ),
        measurementBookRef: `${project.evidenceChain?.measurementBookNo || 'MB-2025'}-P48`,
        verified: project.physicalProgress >= 75,
      },
      {
        id: 'm4',
        title: 'Finishing & Utility Connections',
        targetDate: '2025-02-28',
        weightagePercent: 15,
        completedPercent: Math.min(
          100,
          Math.max(0, Math.round((project.physicalProgress - 75) * 2))
        ),
        measurementBookRef: `${project.evidenceChain?.measurementBookNo || 'MB-2025'}-P72`,
        verified: project.physicalProgress >= 90,
      },
      {
        id: 'm5',
        title: 'Joint Inspection & Handover',
        targetDate: '2025-05-15',
        weightagePercent: 10,
        completedPercent: project.physicalProgress === 100 ? 100 : 0,
        measurementBookRef: `${project.evidenceChain?.measurementBookNo || 'MB-2025'}-P88`,
        verified: project.physicalProgress === 100,
      },
    ];
  }, [project]);

  // Generate Trajectory Points for S-Curve Graph
  const curvePoints = useMemo(() => {
    // 6 time steps: Start (0%), Month 2, Month 4, Month 6, Month 8, Current
    const phys = project.physicalProgress;
    const fin = project.financialProgress;

    return [
      { label: 'Sanction', step: 0, physical: 0, financial: 0 },
      {
        label: 'Tender/Adv',
        step: 20,
        physical: Math.round(phys * 0.12),
        financial: Math.round(fin * 0.25),
      },
      {
        label: 'Plinth/Stage 1',
        step: 40,
        physical: Math.round(phys * 0.35),
        financial: Math.round(fin * 0.52),
      },
      {
        label: 'Mid Execution',
        step: 60,
        physical: Math.round(phys * 0.62),
        financial: Math.round(fin * 0.76),
      },
      {
        label: 'Pre-Final',
        step: 80,
        physical: Math.round(phys * 0.84),
        financial: Math.round(fin * 0.92),
      },
      {
        label: 'Current Status',
        step: 100,
        physical: phys,
        financial: fin,
      },
    ];
  }, [project]);

  // SVG coordinate calculations for S-Curve
  const svgWidth = 700;
  const svgHeight = 280;
  const paddingX = 60;
  const paddingY = 40;
  const graphWidth = svgWidth - paddingX * 2;
  const graphHeight = svgHeight - paddingY * 2;

  const getX = (index: number, total: number) => {
    return paddingX + (index / (total - 1)) * graphWidth;
  };

  const getY = (val: number) => {
    // 0% at bottom, 100% at top
    return paddingY + graphHeight - (val / 100) * graphHeight;
  };

  // Build SVG path strings
  const physicalPath = curvePoints
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i, curvePoints.length)} ${getY(pt.physical)}`)
    .join(' ');

  const financialPath = curvePoints
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i, curvePoints.length)} ${getY(pt.financial)}`)
    .join(' ');

  // Shaded area between curves
  const shadedAreaPath =
    physicalPath +
    ' ' +
    curvePoints
      .slice()
      .reverse()
      .map((pt, i) => `L ${getX(curvePoints.length - 1 - i, curvePoints.length)} ${getY(pt.financial)}`)
      .join(' ') +
    ' Z';

  // Rupee values
  const physicalEquivalentValueLakhs = (
    (project.sanctionedAmountLakhs * project.physicalProgress) /
    100
  ).toFixed(2);
  const unearnedDisbursementRiskLakhs = Math.max(
    0,
    project.expenditureLakhs - Number(physicalEquivalentValueLakhs)
  ).toFixed(2);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Navigation & Breadcrumb Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onBackToProjects}
            className="py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>← Back to Projects List</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 font-medium hidden sm:inline">Visual Progress</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
            {project.code}
          </span>
        </div>

        {/* Quick Project Switcher Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium hidden md:inline">Switch Project:</span>
          <select
            value={project.id}
            onChange={(e) => {
              const target = allProjects.find((p) => p.id === e.target.value);
              if (target) onSelectAnotherProject(target);
            }}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold focus:outline-none focus:border-blue-600 text-xs cursor-pointer max-w-[220px] sm:max-w-xs truncate"
          >
            {allProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} • {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Project Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {project.code}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {project.category}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase border ${
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

            <h1 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {project.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 pt-0.5">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {project.contractorName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {project.taluka}, {project.district}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Sanctioned: {project.sanctionedDate}
              </span>
            </div>
          </div>

          {/* Top Metric Highlight Box */}
          <div className="flex items-center gap-3">
            <div
              className={`p-3.5 rounded-xl border text-right ${
                isHighDelta
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider block">
                {isHighDelta ? '⚠️ Critical Progress Gap' : 'Progress Alignment'}
              </span>
              <span className="text-2xl font-black font-mono block">
                {delta > 0 ? `+${delta}%` : `${delta}%`}
              </span>
              <span className="text-[11px] font-medium block">
                Financial vs Physical
              </span>
            </div>
          </div>
        </div>

        {/* 4 Financial & Execution Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">
              Sanctioned Budget
            </span>
            <span className="text-base font-extrabold text-slate-900 font-mono">
              ₹{project.sanctionedAmountLakhs.toFixed(2)}L
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">
              Disbursed Expenditure
            </span>
            <span className="text-base font-extrabold text-amber-800 font-mono">
              ₹{project.expenditureLakhs.toFixed(2)}L ({project.financialProgress}%)
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">
              Verified Value on Ground
            </span>
            <span className="text-base font-extrabold text-emerald-700 font-mono">
              ₹{physicalEquivalentValueLakhs}L ({project.physicalProgress}%)
            </span>
          </div>

          <div
            className={`p-3 rounded-xl border ${
              isHighDelta
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <span className="text-[10px] uppercase font-semibold block">
              Uncertified Advance Risk
            </span>
            <span className="text-base font-extrabold font-mono text-rose-700">
              ₹{unearnedDisbursementRiskLakhs}L
            </span>
          </div>
        </div>
      </div>

      {/* Graph Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <span>Select Visual Graph Perspective:</span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('scurve')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'scurve'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>S-Curve Trajectory</span>
          </button>

          <button
            onClick={() => setActiveTab('meters')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'meters'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Comparative Meters</span>
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'milestones'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Milestone Stages</span>
          </button>

          <button
            onClick={() => setActiveTab('peer')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'peer'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Peer Benchmark</span>
          </button>
        </div>
      </div>

      {/* Tab 1: S-Curve Time Series Graph */}
      {activeTab === 'scurve' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Cumulative Physical vs. Financial S-Curve</span>
                {isHighDelta && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-300">
                    High Divergence Alert
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Plots verified ground progress against treasury disbursements across project milestone stages.
              </p>
            </div>

            {/* Graph Legend */}
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-600" />
                <span className="text-slate-700">Physical Verified ({project.physicalProgress}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-600" />
                <span className="text-slate-700">Financial Disbursed ({project.financialProgress}%)</span>
              </div>
            </div>
          </div>

          {/* Interactive SVG S-Curve Chart */}
          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-72 sm:h-80 select-none"
            >
              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map((level) => {
                const y = getY(level);
                return (
                  <g key={level}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[10px] fill-slate-400 font-mono"
                    >
                      {level}%
                    </text>
                  </g>
                );
              })}

              {/* Shaded Over-Disbursement Divergence Area */}
              <path
                d={shadedAreaPath}
                fill={isHighDelta ? 'rgba(244, 63, 94, 0.14)' : 'rgba(245, 158, 11, 0.1)'}
              />

              {/* 45-Degree Parity Guide (dashed grey) */}
              <line
                x1={paddingX}
                y1={getY(0)}
                x2={svgWidth - paddingX}
                y2={getY(100)}
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Financial Curve (Amber / Rose) */}
              <path
                d={financialPath}
                fill="none"
                stroke={isHighDelta ? '#e11d48' : '#d97706'}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Physical Curve (Emerald) */}
              <path
                d={physicalPath}
                fill="none"
                stroke="#059669"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Nodes and Stage Labels */}
              {curvePoints.map((pt, i) => {
                const x = getX(i, curvePoints.length);
                const yPhys = getY(pt.physical);
                const yFin = getY(pt.financial);

                return (
                  <g key={i}>
                    {/* Vertical guideline */}
                    <line
                      x1={x}
                      y1={paddingY}
                      x2={x}
                      y2={svgHeight - paddingY}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />

                    {/* Stage Label on X-axis */}
                    <text
                      x={x}
                      y={svgHeight - 14}
                      textAnchor="middle"
                      className="text-[10px] font-semibold fill-slate-600"
                    >
                      {pt.label}
                    </text>

                    {/* Financial Dot */}
                    <circle
                      cx={x}
                      cy={yFin}
                      r="5"
                      fill="#ffffff"
                      stroke={isHighDelta ? '#e11d48' : '#d97706'}
                      strokeWidth="2.5"
                      className="cursor-pointer hover:r-7 transition-all"
                    />
                    <text
                      x={x}
                      y={yFin - 9}
                      textAnchor="middle"
                      className="text-[10px] font-bold font-mono fill-amber-800"
                    >
                      {pt.financial}%
                    </text>

                    {/* Physical Dot */}
                    <circle
                      cx={x}
                      cy={yPhys}
                      r="5"
                      fill="#ffffff"
                      stroke="#059669"
                      strokeWidth="2.5"
                      className="cursor-pointer hover:r-7 transition-all"
                    />
                    <text
                      x={x}
                      y={yPhys + 16}
                      textAnchor="middle"
                      className="text-[10px] font-bold font-mono fill-emerald-700"
                    >
                      {pt.physical}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Diagnostic Note below S-Curve */}
          <div
            className={`p-4 rounded-xl border text-xs space-y-1 ${
              isHighDelta
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              {isHighDelta ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>
                {isHighDelta
                  ? `Over-Disbursement Anomaly Flagged: +${delta}% Gap`
                  : 'Certified Physical Execution Aligns with Treasury Releases'}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-700">
              {isHighDelta
                ? `Treasury has released ₹${project.expenditureLakhs}L (${project.financialProgress}%), while certified field engineers have only verified physical works valued at ₹${physicalEquivalentValueLakhs}L (${project.physicalProgress}%). This creates a ₹${unearnedDisbursementRiskLakhs}L unverified advance exposure.`
                : `Verified ground progress (${project.physicalProgress}%) is running in parity with sanctioned treasury disbursements (${project.financialProgress}%). No premature advance release detected.`}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Comparative Progress Meters & Gauge Breakdown */}
      {activeTab === 'meters' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Comparative Execution vs. Disbursement Meters
            </h3>
            <p className="text-xs text-slate-500">
              Direct comparison between physically certified on-site works and treasury cash outflow.
            </p>
          </div>

          <div className="space-y-6">
            {/* Physical Execution Progress Meter */}
            <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Physical Work Verified on Ground
                </span>
                <span className="font-mono font-black text-xl text-emerald-700">
                  {project.physicalProgress}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(2, project.physicalProgress)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                <span>Equivalent Value: ₹{physicalEquivalentValueLakhs} Lakhs</span>
                <span>Certified by District Executive Engineers</span>
              </div>
            </div>

            {/* Financial Disbursement Progress Meter */}
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                isHighDelta
                  ? 'bg-rose-50/40 border-rose-200'
                  : 'bg-amber-50/40 border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    isHighDelta ? 'text-rose-900' : 'text-amber-900'
                  }`}
                >
                  <IndianRupee className="w-4 h-4 text-amber-600" />
                  Financial Treasury Funds Released
                </span>
                <span
                  className={`font-mono font-black text-xl ${
                    isHighDelta ? 'text-rose-700' : 'text-amber-800'
                  }`}
                >
                  {project.financialProgress}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHighDelta ? 'bg-rose-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.max(2, project.financialProgress)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                <span>Total Disbursed: ₹{project.expenditureLakhs} Lakhs of ₹{project.sanctionedAmountLakhs} Lakhs</span>
                <span>Treasury Voucher Authorizations</span>
              </div>
            </div>

            {/* Financial Reconciliation Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Total Sanctioned</span>
                <span className="text-lg font-bold font-mono text-slate-900">
                  ₹{project.sanctionedAmountLakhs.toFixed(2)}L
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Actual Certified Work</span>
                <span className="text-lg font-bold font-mono text-emerald-700">
                  ₹{physicalEquivalentValueLakhs}L
                </span>
              </div>
              <div
                className={`p-3.5 rounded-xl border ${
                  isHighDelta
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="text-[11px] block">Unearned Exposure</span>
                <span className="text-lg font-bold font-mono text-rose-700">
                  ₹{unearnedDisbursementRiskLakhs}L
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Milestone Stages Progress Bars */}
      {activeTab === 'milestones' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Certified Milestone Completion Velocity
              </h3>
              <p className="text-xs text-slate-500">
                Detailed stage-by-stage physical verification progress recorded in the Measurement Book.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              {milestones.filter((m) => m.verified).length} / {milestones.length} Verified
            </span>
          </div>

          <div className="space-y-4">
            {milestones.map((m, idx) => (
              <div
                key={m.id || idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {m.verified ? (
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </span>
                    )}
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">{m.title}</h4>
                      <span className="text-[11px] text-slate-500">
                        Target Date: {m.targetDate} {m.actualDate ? `• Certified: ${m.actualDate}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {m.measurementBookRef}
                    </span>
                    <span className="font-mono font-bold text-xs text-slate-900 w-12 text-right">
                      {m.completedPercent}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      m.completedPercent === 100
                        ? 'bg-emerald-600'
                        : m.completedPercent > 0
                        ? 'bg-blue-600'
                        : 'bg-slate-300'
                    }`}
                    style={{ width: `${m.completedPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Peer & Sector Benchmark Comparison */}
      {activeTab === 'peer' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Peer Sector & Contractor Benchmarks
            </h3>
            <p className="text-xs text-slate-500">
              Comparing this project's physical and financial velocity against other {project.category} works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Sector Average Comparison */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                {project.category} Sector Averages ({sectorPeers.length + 1} Works)
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>This Project Physical Progress</span>
                    <span className="font-bold font-mono text-emerald-700">{project.physicalProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${project.physicalProgress}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-500 mb-1">
                    <span>Sector Peer Average Physical</span>
                    <span className="font-bold font-mono text-slate-600">{sectorAvgPhysical}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-slate-500 h-full rounded-full" style={{ width: `${sectorAvgPhysical}%` }} />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>This Project Financial Disbursement</span>
                    <span className="font-bold font-mono text-amber-800">{project.financialProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full" style={{ width: `${project.financialProgress}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-500 mb-1">
                    <span>Sector Peer Average Financial</span>
                    <span className="font-bold font-mono text-slate-600">{sectorAvgFinancial}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-slate-400 h-full rounded-full" style={{ width: `${sectorAvgFinancial}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Other Projects by this Contractor */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Other Works by {project.contractorName} ({contractorOtherWorks.length} other works)
              </h4>

              {contractorOtherWorks.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No other registered works for this contractor in the database.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                  {contractorOtherWorks.map((other) => {
                    const otherDelta = other.financialProgress - other.physicalProgress;
                    return (
                      <div
                        key={other.id}
                        onClick={() => onSelectAnotherProject(other)}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 truncate max-w-[180px]">
                            {other.code} • {other.title}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Phys: {other.physicalProgress}% | Fin: {other.financialProgress}%
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {otherDelta > 20 && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                              +{otherDelta}%
                            </span>
                          )}
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Footer Buttons */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBackToProjects}
          className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>← Back to All Projects</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenMBook && (
            <button
              onClick={() => onOpenMBook(project.code)}
              className="py-2 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Inspect e-MB Measurement Book</span>
            </button>
          )}

          {onOpenEvidence && (
            <button
              onClick={() => onOpenEvidence(project)}
              className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <span>Open Full Evidence Dossier</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
