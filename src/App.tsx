/**
 * SATARK-MPLADS: Decision-Support & Contractor Network Intelligence System
 * Ministry of Statistics and Programme Implementation (MoSPI)
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  Building2,
  FolderGit2,
  Landmark,
  MapPin,
  Sparkles,
  Search,
  Filter,
  Scale,
  FileCheck2,
  Layers,
  AlertTriangle,
  FileText,
  Activity,
  IndianRupee,
  Clock,
  Compass,
  CheckCircle2,
  Info,
  Maximize2,
  SlidersHorizontal,
  Download,
  Share2,
  RefreshCw,
  BookOpen,
  LineChart,
  Eye,
  Home,
  ArrowLeft,
} from 'lucide-react';

import {
  Contractor,
  Project,
  ImplementingAgency,
  AuditAction,
  GraphNode,
  GraphLink,
  NodeType,
} from './types';
import { MBookRegister } from './types/mbook';
import {
  MOCK_CONTRACTORS,
  MOCK_PROJECTS,
  MOCK_AGENCIES,
  MOCK_AUDIT_ACTIONS,
  DISTRICTS_LIST,
  PROJECT_CATEGORIES,
} from './data/mockData';
import { MOCK_MBOOKS } from './data/mockMBooks';
import { buildGraphData } from './utils/graphBuilder';

// Components
import { NetworkGraph } from './components/network/NetworkGraph';
import { ContractorProfilePanel } from './components/network/ContractorProfilePanel';
import { ContractorStoryFlow } from './components/network/ContractorStoryFlow';
import { WhyFlaggedModal } from './components/network/WhyFlaggedModal';
import { RelatedProjectsTable } from './components/network/RelatedProjectsTable';
import { ContractorComparison } from './components/network/ContractorComparison';
import { NetworkScanModal } from './components/network/NetworkScanModal';
import { ProjectEvidenceModal } from './components/evidence/ProjectEvidenceModal';
import { AuditTrailView } from './components/investigation/AuditTrailView';
import { ProjectCostBenchmarkView } from './components/benchmarks/ProjectCostBenchmarkView';
import { FeatureHubPortal } from './components/portal/FeatureHubPortal';
import { MeasurementBookView } from './components/mbook/MeasurementBookView';
import { ProjectProgressGraphView } from './components/progress/ProjectProgressGraphView';

export default function App() {
  // Master State
  const [contractors] = useState<Contractor[]>(MOCK_CONTRACTORS);
  const [projects] = useState<Project[]>(MOCK_PROJECTS);
  const [agencies] = useState<ImplementingAgency[]>(MOCK_AGENCIES);
  const [auditActions, setAuditActions] = useState<AuditAction[]>(MOCK_AUDIT_ACTIONS);
  const [mbooks, setMbooks] = useState<MBookRegister[]>(MOCK_MBOOKS);
  const [selectedMBookId, setSelectedMBookId] = useState<string | undefined>(undefined);

  // Eye-Care Comfort Mode (Soft Low-Strain Ergonomic Palette)
  const [eyeComfortMode, setEyeComfortMode] = useState<'charcoal' | 'slate'>('charcoal');

  // Active View Tab - Defaults to clean Portal Hub to prevent initial data overload!
  const [activeView, setActiveView] = useState<
    'portal' | 'mbook' | 'progress-graph' | 'network' | 'projects' | 'cost-benchmark' | 'comparison' | 'audit'
  >('portal');
  const [benchmarkTargetProjectId, setBenchmarkTargetProjectId] = useState<string | undefined>(undefined);

  // Network Sub-Display Mode (2D Network Graph vs Easy Story Flow vs Both)
  const [networkDisplayMode, setNetworkDisplayMode] = useState<'story' | 'graph' | 'both'>('graph');

  // Filter States
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedContractorId, setSelectedContractorId] = useState<string | null>('cont-a');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minRiskScore, setMinRiskScore] = useState<number>(0);
  const [enabledNodeTypes, setEnabledNodeTypes] = useState<NodeType[]>([
    'contractor',
    'project',
    'agency',
    'location',
  ]);

  // Selected Entity State for Graph & Panels (cont-a = Apex Infra Buildtech LLP)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('cont-a');
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>(['cont-a']);

  // Modal States
  const [isWhyFlaggedModalOpen, setIsWhyFlaggedModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidenceSelectedProject, setEvidenceSelectedProject] = useState<Project | null>(null);
  const [comparisonContractorA, setComparisonContractorA] = useState<Contractor | undefined>(undefined);
  const [comparisonContractorB, setComparisonContractorB] = useState<Contractor | undefined>(undefined);

  // Derive Currently Selected Contractor (if selected node is a contractor or fallback)
  const activeContractor = useMemo(() => {
    if (selectedNodeId) {
      const con = contractors.find((c) => c.id === selectedNodeId);
      if (con) return con;
      // If selected node is a project, get that project's contractor
      const proj = projects.find((p) => p.id === selectedNodeId);
      if (proj) {
        const found = contractors.find((c) => c.id === proj.contractorId);
        if (found) return found;
      }
    }
    if (selectedContractorId) {
      const con = contractors.find((c) => c.id === selectedContractorId);
      if (con) return con;
    }
    return contractors[0] || null;
  }, [selectedNodeId, selectedContractorId, contractors, projects]);

  // Build Graph Data dynamically based on current filters and expansions
  const graphData = useMemo(() => {
    return buildGraphData({
      contractors,
      projects,
      agencies,
      selectedDistrict,
      selectedCategory,
      selectedContractorId,
      searchQuery,
      minRiskScore,
      enabledNodeTypes,
      expandedNodeIds,
    });
  }, [
    contractors,
    projects,
    agencies,
    selectedDistrict,
    selectedCategory,
    selectedContractorId,
    searchQuery,
    minRiskScore,
    enabledNodeTypes,
    expandedNodeIds,
  ]);

  // Handle Graph Node Selection
  const handleSelectNode = useCallback(
    (node: GraphNode | null) => {
      if (!node) {
        setSelectedNodeId(null);
        return;
      }
      setSelectedNodeId(node.id);

      // If node is a contractor, set selectedContractorId and auto-expand
      if (node.type === 'contractor') {
        setSelectedContractorId(node.id);
        setExpandedNodeIds((prev) => (prev.includes(node.id) ? prev : [...prev, node.id]));
      } else if (node.type === 'project') {
        const proj = projects.find((p) => p.id === node.id);
        if (proj) {
          setSelectedContractorId(proj.contractorId);
          setEvidenceSelectedProject(proj);
        }
      }
    },
    [projects]
  );

  // Handle Node Double-Click (Expand / Collapse)
  const handleExpandNode = useCallback((node: GraphNode) => {
    setExpandedNodeIds((prev) =>
      prev.includes(node.id) ? prev.filter((id) => id !== node.id) : [...prev, node.id]
    );
  }, []);

  // Toggle Node Type Visibility
  const toggleNodeType = useCallback((type: NodeType) => {
    setEnabledNodeTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  // Open Evidence for a project
  const handleOpenEvidence = (project: Project) => {
    setEvidenceSelectedProject(project);
    setIsEvidenceModalOpen(true);
  };

  // Initiate Comparison
  const handleOpenComparison = (contractor: Contractor) => {
    setComparisonContractorA(contractor);
    const other = contractors.find((c) => c.id !== contractor.id);
    setComparisonContractorB(other);
    setActiveView('comparison');
  };

  // Record a new Audit Action with full inspection report details
  const handleAddAuditAction = (newAction: Omit<AuditAction, 'id' | 'timestamp' | 'verificationOrderNo'>) => {
    const orderNumber = `VO/MPLADS/${new Date().getFullYear()}/${1000 + auditActions.length + 1}`;
    const timestamp = new Date().toISOString();
    const targetEntityName = newAction.targetName || 'Sanctioned MPLADS Asset';

    const defaultWhatWasWrong =
      newAction.whatWasWrong ||
      (newAction.actionType === 'Financial Review'
        ? `Over-disbursement detected exceeding verified physical civil progress on ${targetEntityName}.`
        : newAction.actionType === 'Field Verification'
        ? `Quality defect, honeycombing, or delayed milestone execution noted on site.`
        : newAction.actionType === 'Investigate'
        ? `Cartel collusive bidding and repeat non-performance across sanctioned schemes.`
        : `Physical-financial variance identified requiring forensic site inspection and measurement book reconciliation.`);

    const defaultWhatWasInspected =
      newAction.whatWasInspected ||
      `On-site civil structural works, e-MB CPWA-23 recorded entries, material testing certificates, and geo-tagged photographic evidence.`;

    const prevBlock = auditActions[0];
    const previousHash = prevBlock?.blockHash || '09a47fa2c1f38e0186be8b6dc245aa50451ffb6e68da78d46db157f4955b9e01';

    const createdAction: AuditAction = {
      ...newAction,
      id: `act-${Date.now()}`,
      verificationOrderNo: orderNumber,
      timestamp,
      blockIndex: auditActions.length + 1,
      previousHash: newAction.previousHash || previousHash,
      blockHash: newAction.blockHash || `a8f${Date.now().toString(16)}b094101e4a1a3962d250882e3914a840e6c5188f1ac8e74706c9a3f2b403`,
      whatWasWrong: defaultWhatWasWrong,
      whatWasInspected: defaultWhatWasInspected,
      inspectionReport: newAction.inspectionReport || {
        whatWasWrong: defaultWhatWasWrong,
        anomalyType: 'Civil Works & Measurement Book Variance',
        whatWasInspected: defaultWhatWasInspected,
        inspectionLocation: `${newAction.targetCode || 'MPL-SITE'} - District Site Location`,
        inspectionTeam: [newAction.officerName || 'Dr. Suhas Diwase (IAS)', 'Executive Engineer (Vigilance)'],
        findingsObservations: [
          newAction.remarks || 'Initiated comprehensive field verification under SATARK-MPLADS mandate.',
          'Physical execution schedule compared against approved bill of quantities (BOQ).',
          'Measurement book entries cross-examined against geo-tagged on-site photographic evidence.'
        ],
        claimedPhysicalPercent: newAction.actionType === 'Mark Verified' ? 100 : 85,
        verifiedPhysicalPercent: newAction.actionType === 'Mark Verified' ? 100 : 38,
        discrepancyAmountLakhs: newAction.actionType === 'Mark Verified' ? 0 : 18.5,
        orderedDirectives: [
          'Immediate recovery of excess disbursement or submission of compliance certificate.',
          'Freeze contractor billing code pending complete physical reconciliation.',
          'Joint inspection committee to submit final compliance docket within 14 days.'
        ],
        registersInspected: ['e-MB CPWA Form 23', 'Cement & Steel Quality Test Register', 'Site Measurement Log'],
        complianceDeadlineDays: 14,
        inspectionOutcome: newAction.actionType === 'Mark Verified' ? 'Satisfactory - No Defects' : 'Major Irregularity Confirmed',
      },
    };

    setAuditActions((prev) => [createdAction, ...prev]);
  };

  // Handle Verification Action submission from modals
  const handleTakeAction = (actionData: {
    targetType: 'Project' | 'Contractor';
    targetId: string;
    targetCode: string;
    targetName: string;
    actionType: AuditAction['actionType'];
    remarks: string;
    priority: AuditAction['priority'];
  }) => {
    handleAddAuditAction({
      officerName: 'Dr. Suhas Diwase (IAS)',
      officerDesignation: 'District Magistrate & Collector, Pune',
      targetType: actionData.targetType,
      targetId: actionData.targetId,
      targetCode: actionData.targetCode,
      targetName: actionData.targetName,
      actionType: actionData.actionType,
      status: 'Inspection Ordered',
      remarks: actionData.remarks,
      priority: actionData.priority,
    });
    setIsEvidenceModalOpen(false);
  };

  // Summary Metrics calculations
  const totalSanctionedCr = useMemo(() => {
    const sum = projects.reduce((acc, p) => acc + p.sanctionedAmountLakhs, 0);
    return (sum / 100).toFixed(2);
  }, [projects]);

  const flaggedContractorsCount = useMemo(() => {
    return contractors.filter((c) => c.riskScore >= 60).length;
  }, [contractors]);

  const delayedProjectsCount = useMemo(() => {
    return projects.filter((p) => p.status === 'Delayed').length;
  }, [projects]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Top Government Portal Masthead */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        {/* Ministry Identification Strip */}
        <div className="bg-slate-100/90 px-4 py-1.5 text-[11px] border-b border-slate-200 flex items-center justify-between text-slate-700">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-700">Government of India</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-700 font-medium">Ministry of Statistics and Programme Implementation (MoSPI)</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry & e-MB
            </span>
            <span className="text-slate-500 hidden sm:inline">Clearance: LEVEL-3 NODAL</span>
          </div>
        </div>

        {/* Primary Header Bar */}
        <div className="px-4 py-3 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div
            onClick={() => setActiveView('portal')}
            className="flex items-center gap-3 cursor-pointer group"
            title="Return to Options Menu"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 border border-blue-400/30 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                  SATARK-MPLADS
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  DECISION SUPPORT & e-MB
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Decision-Support & Relationship Correlation System for District Nodal Officers
              </p>
            </div>
          </div>

          {/* Header Right Actions */}
          {activeView !== 'portal' ? (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              <button
                onClick={() => setActiveView('portal')}
                className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← Back to All Options</span>
              </button>

              <button
                id="btn-run-scan"
                onClick={() => setIsScanModalOpen(true)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-1.5 border border-slate-300 shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Scan Network</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Online • Clearance: LEVEL-3 NODAL</span>
            </div>
          )}
        </div>

        {/* View Navigation Bar - ONLY shown when on a dedicated page */}
        {activeView !== 'portal' && (
          <div className="px-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 py-2">
            {/* Breadcrumb & Section Name */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setActiveView('portal')}
                className="text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Options Menu</span>
              </button>
              <span className="text-slate-400">/</span>
              <span className="font-bold text-slate-900 flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-xs">
                {activeView === 'mbook' && <BookOpen className="w-3.5 h-3.5 text-amber-600" />}
                {activeView === 'progress-graph' && <LineChart className="w-3.5 h-3.5 text-emerald-600" />}
                {activeView === 'projects' && <FolderGit2 className="w-3.5 h-3.5 text-blue-600" />}
                {activeView === 'network' && <Layers className="w-3.5 h-3.5 text-purple-600" />}
                {activeView === 'cost-benchmark' && <Scale className="w-3.5 h-3.5 text-indigo-600" />}
                {activeView === 'audit' && <FileCheck2 className="w-3.5 h-3.5 text-rose-600" />}
                {activeView === 'comparison' && <Scale className="w-3.5 h-3.5 text-teal-600" />}
                <span>
                  {activeView === 'mbook' && 'e-Measurement Book (e-MB CPWA 23)'}
                  {activeView === 'progress-graph' && 'Visual Progress & Analytics'}
                  {activeView === 'projects' && `Projects Directory (${projects.length})`}
                  {activeView === 'network' && 'Contractor Network'}
                  {activeView === 'cost-benchmark' && 'Cost Benchmark & Outlier Lab'}
                  {activeView === 'audit' && `Audit Trails (${auditActions.length})`}
                  {activeView === 'comparison' && 'Contractor Comparison Tool'}
                </span>
              </span>

              {/* Quick Jump Option Selector */}
              <div className="hidden md:flex items-center gap-1.5 ml-2 text-slate-500">
                <span className="text-[11px]">Jump to:</span>
                <select
                  value={activeView}
                  onChange={(e) => setActiveView(e.target.value as any)}
                  className="bg-white border border-slate-200 text-slate-800 text-xs px-2 py-0.5 rounded-md focus:outline-none cursor-pointer"
                >
                  <option value="portal">← All Options Menu</option>
                  <option value="mbook">e-MB Measurement Book</option>
                  <option value="progress-graph">Visual Progress Graphs</option>
                  <option value="projects">Projects & Evidence</option>
                  <option value="network">Contractor Network</option>
                  <option value="cost-benchmark">Cost Benchmark</option>
                  <option value="audit">Audit Trails</option>
                  <option value="comparison">Contractor Comparison</option>
                </select>
              </div>
            </div>

            {/* Contextual Filters: District & Category */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="bg-transparent text-slate-800 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="all">All Districts (Maharashtra)</option>
                  {DISTRICTS_LIST.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist} District
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                <FolderGit2 className="w-3.5 h-3.5 text-blue-600" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-slate-800 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="all">All Project Categories</option>
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Body */}
      <main className="flex-1 p-3 sm:p-4 max-w-7xl w-full mx-auto space-y-4">
        {/* Core Notice Banner: Decision-Support Standard (shown on detailed analytic views) */}
        {activeView !== 'portal' && (
          <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-xs text-slate-700">
            <div className="flex items-center gap-2 text-slate-700">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong className="text-slate-900 font-semibold">Standard Administrative Protocol: </strong>
                The SATARK system correlates physical logs, e-MB entries, and geo-evidence to prioritize verification.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveView('portal')}
                className="text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center gap-1.5 font-semibold cursor-pointer border border-blue-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to All Options
              </button>
            </div>
          </div>
        )}

        {/* View 0: Modular Feature Hub Portal (Clean Landing Screen) */}
        {activeView === 'portal' && (
          <FeatureHubPortal
            projects={projects}
            contractors={contractors}
            mbooks={mbooks}
            onSelectFeature={(view) => setActiveView(view)}
            onOpenProjectEvidence={(p) => handleOpenEvidence(p)}
            onSelectMBook={(mbId) => {
              setSelectedMBookId(mbId);
              setActiveView('mbook');
            }}
          />
        )}

        {/* View: Electronic Measurement Book (e-MB CPWA 23) */}
        {activeView === 'mbook' && (
          <MeasurementBookView
            mbooks={mbooks}
            projects={projects}
            initialMBookId={selectedMBookId}
            onTakeAuditAction={handleAddAuditAction}
            onOpenProjectEvidence={(p) => handleOpenEvidence(p)}
          />
        )}

        {/* View: Visual Progress Graphs Dashboard */}
        {activeView === 'progress-graph' && (
          <ProjectProgressGraphView
            projects={projects}
            contractors={contractors}
            onSelectProject={(p) => handleOpenEvidence(p)}
            onOpenMBook={(projectCode) => {
              const mb = mbooks.find((m) => m.projectCode === projectCode);
              if (mb) {
                setSelectedMBookId(mb.id);
              }
              setActiveView('mbook');
            }}
          />
        )}

        {/* View 1: Main Network Graph Workspace */}
        {activeView === 'network' && (
          <div className="space-y-4">
            {/* Top Toolbar: View Mode Switcher + Contractor Quick Switcher */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 space-y-3 shadow-xs">
              {/* Row 1: Sub-Mode Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Contractor Relationship Intelligence
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select how you want to examine contractor relationships and fund pathways.
                  </p>
                </div>

                {/* View Switcher Buttons */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto text-xs">
                  <button
                    onClick={() => setNetworkDisplayMode('story')}
                    className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      networkDisplayMode === 'story'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                    ✨ Easy Flow Story (Recommended)
                  </button>

                  <button
                    onClick={() => setNetworkDisplayMode('graph')}
                    className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      networkDisplayMode === 'graph'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5 text-blue-200" />
                    🌐 2D Orbit Web
                  </button>

                  <button
                    onClick={() => setNetworkDisplayMode('both')}
                    className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      networkDisplayMode === 'both'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-200" />
                    📑 Both Views
                  </button>
                </div>
              </div>

              {/* Row 2: 1-Click Quick Contractor Selector Chips */}
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Quick Select Contractor to Inspect:</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Sorted by Risk Signal Priority
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {contractors.map((c) => {
                    const isSelected = selectedNodeId === c.id;
                    const isHighRisk = c.riskScore >= 70;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedNodeId(c.id);
                          setSelectedContractorId(c.id);
                          if (!expandedNodeIds.includes(c.id)) {
                            setExpandedNodeIds((prev) => [...prev, c.id]);
                          }
                        }}
                        className={`px-3 py-2 rounded-xl text-left border shrink-0 transition-all flex items-center gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50 border-purple-300 text-purple-950 shadow-xs ring-1 ring-purple-400'
                            : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700 shadow-xs'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isHighRisk
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : c.riskScore >= 40
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {c.riskScore}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="truncate max-w-[140px]">{c.name}</span>
                            {isHighRisk && <span className="text-rose-600 text-[10px]">🚨</span>}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {c.totalProjects} Works • ₹{(c.totalSanctionedAmount / 100).toFixed(1)} Cr
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sub-Mode 1: Easy Flow Story (Recommended) */}
            {(networkDisplayMode === 'story' || networkDisplayMode === 'both') && activeContractor && (
              <div className="space-y-4">
                <ContractorStoryFlow
                  contractor={activeContractor}
                  projects={projects}
                  agencies={agencies}
                  onSelectProject={(proj) => {
                    setEvidenceSelectedProject(proj);
                    setIsEvidenceModalOpen(true);
                  }}
                  onWhyFlaggedClick={() => setIsWhyFlaggedModalOpen(true)}
                />
              </div>
            )}

            {/* Sub-Mode 2: 2D Interactive Network Graph */}
            {(networkDisplayMode === 'graph' || networkDisplayMode === 'both') && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Left Column: Network Graph Canvas + Node Controls */}
                <div className="lg:col-span-8 space-y-3">
                  {/* Graph Filters Bar */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
                    {/* Node Type Toggles */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-slate-500 text-[11px] mr-1">Visible Nodes:</span>

                      <button
                        onClick={() => toggleNodeType('contractor')}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                          enabledNodeTypes.includes('contractor')
                            ? 'bg-purple-50 text-purple-800 border-purple-300 shadow-xs'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                        🟣 Contractors
                      </button>

                      <button
                        onClick={() => toggleNodeType('project')}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                          enabledNodeTypes.includes('project')
                            ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-xs'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        🔵 Projects
                      </button>

                      <button
                        onClick={() => toggleNodeType('agency')}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                          enabledNodeTypes.includes('agency')
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                        🟢 Agencies
                      </button>

                      <button
                        onClick={() => toggleNodeType('location')}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                          enabledNodeTypes.includes('location')
                            ? 'bg-orange-50 text-orange-800 border-orange-300 shadow-xs'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                        🟠 Locations
                      </button>
                    </div>

                    {/* Search inside Graph */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Filter nodes by name/code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 w-44 lg:w-56 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Graph Visualization Component */}
                  <div className="h-[560px]">
                    <NetworkGraph
                      nodes={graphData.nodes}
                      links={graphData.links}
                      selectedNodeId={selectedNodeId}
                      expandedNodeIds={expandedNodeIds}
                      onSelectNode={handleSelectNode}
                      onExpandNode={handleExpandNode}
                    />
                  </div>
                </div>

                {/* Right Column: Contractor Profile Panel or Selection Guide */}
                <div className="lg:col-span-4 h-[630px]">
                  {activeContractor ? (
                    <ContractorProfilePanel
                      contractor={activeContractor}
                      onWhyFlaggedClick={() => setIsWhyFlaggedModalOpen(true)}
                      onAnalyzeNetworkClick={() => setIsScanModalOpen(true)}
                      onShowRelatedProjectsClick={() => {
                        setActiveView('projects');
                      }}
                      onCompareClick={handleOpenComparison}
                      onTakeActionClick={(target) => {
                        handleAddAuditAction({
                          officerName: 'Dr. Suhas Diwase (IAS)',
                          officerDesignation: 'District Magistrate & Collector, Pune',
                          targetType: target.type,
                          targetId: target.id,
                          targetCode: target.code,
                          targetName: target.name,
                          actionType: 'Field Verification',
                          status: 'Inspection Ordered',
                          remarks: `Initiated comprehensive field verification on ${target.name} under SATARK-MPLADS mandate.`,
                          priority: 'High',
                        });
                        setActiveView('audit');
                      }}
                    />
                  ) : (
                    <div className="h-full bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center text-slate-500 space-y-3 shadow-xs">
                      <Building2 className="w-12 h-12 text-slate-300" />
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">No Contractor Selected</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs">
                          Click on any contractor (🟣) or project (🔵) node in the graph, or select one from the quick switcher above.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* View 2: All Projects & Evidence Registry */}
        {activeView === 'projects' && (
          <div className="space-y-4">
            <RelatedProjectsTable
              projects={projects}
              onSelectProject={(p) => handleOpenEvidence(p)}
              onTakeAction={(p) => handleOpenEvidence(p)}
            />
          </div>
        )}

        {/* View 3: Project Cost Benchmark & Outlier Detection */}
        {activeView === 'cost-benchmark' && (
          <div className="space-y-4">
            <ProjectCostBenchmarkView
              projects={projects}
              initialSelectedProjectId={benchmarkTargetProjectId}
              onSelectProject={(p) => setBenchmarkTargetProjectId(p.id)}
              onOpenEvidence={(p) => handleOpenEvidence(p)}
              onOrderAudit={(proj, comparison) => {
                handleAddAuditAction({
                  officerName: 'Dr. Suhas Diwase (IAS)',
                  officerDesignation: 'District Magistrate & Collector, Pune',
                  targetType: 'Project',
                  targetId: proj.id,
                  targetCode: proj.code,
                  targetName: proj.title,
                  actionType: 'Financial Review',
                  status: 'Inspection Ordered',
                  remarks: `Ordered Rate Reasonableness Audit. Unit cost of ${comparison.formattedProjectUnitCost} exceeds peer median by ${comparison.variancePercent > 0 ? `+${comparison.variancePercent}%` : `${comparison.variancePercent}%`} (${comparison.anomalyClassification}). DSR Ceiling deviation: ${comparison.dsrDeviationPercent > 0 ? `+${comparison.dsrDeviationPercent}%` : `${comparison.dsrDeviationPercent}%`}.`,
                  priority: comparison.isUnusuallyHigh ? 'High' : 'Normal',
                });
                setActiveView('audit');
              }}
            />
          </div>
        )}

        {/* View 4: Contractor Comparison Lab */}
        {activeView === 'comparison' && (
          <div className="space-y-4">
            <ContractorComparison
              contractors={contractors}
              initialContractorA={comparisonContractorA || contractors[0]}
              initialContractorB={comparisonContractorB || contractors[1]}
              projects={projects}
              onSelectContractor={(id) => {
                setSelectedNodeId(id);
                setActiveView('network');
              }}
            />
          </div>
        )}

        {/* View 5: Official Audit Trail & Investigation Log */}
        {activeView === 'audit' && (
          <div className="space-y-4">
            <AuditTrailView
              auditActions={auditActions}
              onAddAuditAction={handleAddAuditAction}
              onNavigateHome={() => setActiveView('portal')}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      {/* 1. Why Flagged Explainability Modal */}
      {activeContractor && (
        <WhyFlaggedModal
          contractor={activeContractor}
          projects={projects}
          isOpen={isWhyFlaggedModalOpen}
          onClose={() => setIsWhyFlaggedModalOpen(false)}
          onOpenEvidence={(p) => {
            setIsWhyFlaggedModalOpen(false);
            handleOpenEvidence(p);
          }}
          onTakeAction={() => {
            setIsWhyFlaggedModalOpen(false);
            handleAddAuditAction({
              officerName: 'Dr. Suhas Diwase (IAS)',
              officerDesignation: 'District Magistrate & Collector, Pune',
              targetType: 'Contractor',
              targetId: activeContractor.id,
              targetCode: activeContractor.code,
              targetName: activeContractor.name,
              actionType: 'Field Verification',
              status: 'Inspection Ordered',
              remarks: `Verification ordered based on plain-language anomaly explainability analysis for ${activeContractor.name}.`,
              priority: 'High',
            });
            setActiveView('audit');
          }}
        />
      )}

      {/* 2. Multi-Signal Network Scanner Modal */}
      <NetworkScanModal
        contractors={contractors}
        projects={projects}
        agencies={agencies}
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onSelectContractor={(id) => {
          setSelectedNodeId(id);
          if (!expandedNodeIds.includes(id)) {
            setExpandedNodeIds((prev) => [...prev, id]);
          }
          setActiveView('network');
        }}
        onSelectProject={(p) => {
          handleOpenEvidence(p);
        }}
      />

      {/* 3. Project Evidence Chain Modal */}
      <ProjectEvidenceModal
        project={evidenceSelectedProject}
        allProjects={projects}
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        onTakeAction={handleTakeAction}
        onOpenMBook={(projectCode) => {
          const mb = mbooks.find((m) => m.projectCode === projectCode);
          if (mb) {
            setSelectedMBookId(mb.id);
          }
          setActiveView('mbook');
          setIsEvidenceModalOpen(false);
        }}
        onNavigateToAudit={() => {
          setActiveView('audit');
          setIsEvidenceModalOpen(false);
        }}
      />
    </div>
  );
}
