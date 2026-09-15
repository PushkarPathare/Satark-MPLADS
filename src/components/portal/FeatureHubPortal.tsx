/**
 * Option Portal & Navigation Hub
 * Clean landing view presenting clear options without front-page data overload.
 */

import React from 'react';
import {
  BookOpen,
  LineChart,
  FolderGit2,
  Scale,
  Network,
  ShieldAlert,
  ArrowRight,
  Landmark,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Project, Contractor } from '../../types';
import { MBookRegister } from '../../types/mbook';

interface FeatureHubPortalProps {
  projects: Project[];
  contractors: Contractor[];
  mbooks: MBookRegister[];
  onSelectFeature: (featureId: 'mbook' | 'progress-graph' | 'projects' | 'cost-benchmark' | 'network' | 'comparison' | 'audit') => void;
  onOpenProjectEvidence?: (project: Project) => void;
  onSelectMBook?: (mbookId: string) => void;
}

export const FeatureHubPortal: React.FC<FeatureHubPortalProps> = ({
  projects,
  contractors,
  mbooks,
  onSelectFeature,
}) => {
  const options = [
    {
      id: 'mbook' as const,
      title: 'M-Book / e-MB AI Training Dataset',
      badge: 'CPWA Form 23 • 28 Cols',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: BookOpen,
      iconColor: 'text-amber-700',
      iconBg: 'bg-amber-50 border-amber-200',
      description:
        'Realistic 100-record Public Works Measurement Book for MPLADS-2026-001 with 28 columns, ground truth labels, 10 AI anomaly rules, and exportable CSV for ML training.',
      stat: '100 Synthetic Records (28 Cols)',
      actionText: 'Open M-Book Dataset',
      actionColor: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    {
      id: 'progress-graph' as const,
      title: 'Visual Progress & Analytics',
      badge: 'Interactive Graphs',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: LineChart,
      iconColor: 'text-emerald-700',
      iconBg: 'bg-emerald-50 border-emerald-200',
      description:
        'Interactive physical vs. financial achievement curves, delay impact analysis, category distributions, and milestone completion velocity.',
      stat: `${projects.length} Monitored Projects`,
      actionText: 'View Progress Graphs',
      actionColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    {
      id: 'projects' as const,
      title: 'Project Directory & Field Evidence',
      badge: 'GIS & Cryptographic Logs',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: FolderGit2,
      iconColor: 'text-blue-700',
      iconBg: 'bg-blue-50 border-blue-200',
      description:
        'Detailed catalog of all MPLADS works with geo-tagged coordinates, milestone timelines, physical status, and SHA-256 photo hash verification.',
      stat: `${projects.length} Works Registered`,
      actionText: 'Open Project Directory',
      actionColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
      id: 'network' as const,
      title: 'Contractor Network',
      badge: 'Nexus Intelligence',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      icon: Network,
      iconColor: 'text-purple-700',
      iconBg: 'bg-purple-50 border-purple-200',
      description:
        'Interactive 2D relationship graph and story flow uncovering contractor networks, repeated tender wins, shell entities, and agency concentrations.',
      stat: `${contractors.length} Screened Contractors`,
      actionText: 'Inspect Network Graph',
      actionColor: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
    {
      id: 'cost-benchmark' as const,
      title: 'Cost Benchmark & Outlier Lab',
      badge: 'DSR Rate Reasonableness',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      icon: Scale,
      iconColor: 'text-indigo-700',
      iconBg: 'bg-indigo-50 border-indigo-200',
      description:
        'Evaluates project unit rates (₹/sq.ft, ₹/km, ₹/LPH) against district peer medians and government PWD Schedule of Rates to identify tender cost anomalies.',
      stat: 'PWD Schedule of Rates',
      actionText: 'Run Cost Benchmarks',
      actionColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    },
    {
      id: 'audit' as const,
      title: 'Audit Trails',
      badge: 'Statutory Directives',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: ShieldAlert,
      iconColor: 'text-rose-700',
      iconBg: 'bg-rose-50 border-rose-200',
      description:
        'Chronological log of executive actions, District Collector inspection orders, DLMC inquiry directives, and statutory field verification reports.',
      stat: 'DLMC Formal Actions',
      actionText: 'View Audit Trails',
      actionColor: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    {
      id: 'comparison' as const,
      title: 'Contractor Comparison Tool',
      badge: 'Side-by-Side Lab',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
      icon: Layers,
      iconColor: 'text-teal-700',
      iconBg: 'bg-teal-50 border-teal-200',
      description:
        'Side-by-side comparative benchmarking of two contractor entities comparing delivery velocities, average delays, sanction volumes, and risk flags.',
      stat: 'Multi-Factor Matrix',
      actionText: 'Compare Contractors',
      actionColor: 'bg-teal-600 hover:bg-teal-700 text-white',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Meaningful Portal Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
            <Landmark className="w-3.5 h-3.5 text-blue-600" />
            <span>Government of India • MoSPI Decision Support</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            MPLADS Project Monitoring & Governance Portal
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Official digital oversight platform for District Nodal Officers to certify electronic measurement books (e-MB), track physical and financial progress, analyze contractor networks, and audit public works expenditure.
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:items-end gap-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Operational Clearance: Level-3 Nodal</span>
          </div>
          <span className="text-slate-500 text-[11px]">7 Integrated Administrative Modules</span>
        </div>
      </div>

      {/* Section Divider */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Administrative Workspaces
          </h3>
          <p className="text-xs text-slate-500">
            Click any module below to open its dedicated view:
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          All Modules Active
        </span>
      </div>

      {/* Clean Option Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <div
              key={opt.id}
              onClick={() => onSelectFeature(opt.id)}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer shadow-xs"
            >
              <div className="space-y-3">
                {/* Header: Icon + Badge */}
                <div className="flex items-center justify-between">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${opt.iconBg}`}>
                    <Icon className={`w-6 h-6 ${opt.iconColor}`} />
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${opt.badgeColor}`}>
                    {opt.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {opt.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </div>

              {/* Action Button Strip */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 font-mono">
                  {opt.stat}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFeature(opt.id);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${opt.actionColor}`}
                >
                  <span>{opt.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
