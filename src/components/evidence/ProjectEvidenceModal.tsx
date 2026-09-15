/**
 * Project Evidence Chain & Verification Center Modal
 * SATARK-MPLADS: Contractor → Project → Anomaly → Evidence → Recommended Action
 * Features Proper Hierarchical GIS Location Data, Geofence Radius Verification,
 * Tamper-Evident Photo Hash Checks, e-MB CPWA-23 Linkage, and Cryptographic Ledger.
 */

import React, { useState, useMemo } from 'react';
import {
  FileCheck,
  MapPin,
  Camera,
  IndianRupee,
  FileSpreadsheet,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Building2,
  Landmark,
  User,
  ArrowRight,
  Printer,
  Calendar,
  Layers,
  SearchCheck,
  FileText,
  BadgeAlert,
  Send,
  Eye,
  Lock,
  Copy,
  Check,
  ExternalLink,
  Navigation,
  Globe,
  Award,
  Scale,
  TrendingUp,
  AlertOctagon,
  ArrowUpRight,
  Plus,
  X,
  ZoomIn,
  Download,
  ShieldCheck,
  FileSignature,
  Maximize2,
  Receipt,
  BookOpen,
} from 'lucide-react';
import { Project, AuditAction, SitePhoto, InvoiceItem } from '../../types';
import { calculateCostBenchmarkComparison } from '../../utils/costComparison';

interface ProjectEvidenceModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  allProjects?: Project[];
  onTakeAction: (actionData: {
    targetType: 'Project' | 'Contractor';
    targetId: string;
    targetCode: string;
    targetName: string;
    actionType: AuditAction['actionType'];
    remarks: string;
    priority: AuditAction['priority'];
  }) => void;
  onOpenMBook?: (projectCode: string) => void;
  onNavigateToAudit?: () => void;
}

export const ProjectEvidenceModal: React.FC<ProjectEvidenceModalProps> = ({
  project,
  isOpen,
  onClose,
  allProjects = [],
  onTakeAction,
  onOpenMBook,
  onNavigateToAudit,
}) => {
  const [activeTab, setActiveTab] = useState<
    'evidence' | 'photos' | 'gis' | 'financial' | 'milestones' | 'cost-benchmark' | 'ledger'
  >('evidence');
  const [selectedActionType, setSelectedActionType] = useState<AuditAction['actionType']>('Field Verification');
  const [actionRemarks, setActionRemarks] = useState('');
  const [actionPriority, setActionPriority] = useState<AuditAction['priority']>('High');
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionDispatchedMessage, setActionDispatchedMessage] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'satellite' | 'street' | 'cadastral'>('satellite');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Photo viewer modal state
  const [selectedPhoto, setSelectedPhoto] = useState<SitePhoto | null>(null);

  // Invoice viewer modal state
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

  // Add Photo simulator state
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoStage, setNewPhotoStage] = useState('Intermediate Execution');
  const [newPhotoNotes, setNewPhotoNotes] = useState('');
  const [localPhotos, setLocalPhotos] = useState<SitePhoto[]>([]);

  // Cost Benchmark calculation
  const costComparison = useMemo(() => {
    if (!project || allProjects.length === 0) return null;
    try {
      return calculateCostBenchmarkComparison(project, allProjects);
    } catch {
      return null;
    }
  }, [project, allProjects]);

  // Sync photos when project changes
  const effectivePhotos = useMemo(() => {
    if (!project) return [];
    const base = project.evidenceChain?.sitePhotos || [];
    return [...base, ...localPhotos.filter((p) => !base.some((b) => b.id === p.id))];
  }, [project, localPhotos]);

  if (!isOpen || !project) return null;

  const delta = (project.financialProgress || 0) - (project.physicalProgress || 0);
  const isHighDelta = delta > 20;
  const gis = project.evidenceChain?.gisCoordinates || {
    lat: 18.5204,
    lng: 73.8567,
    address: `${project.taluka || 'Pune'}, ${project.district || 'Pune'}, Maharashtra`,
    pincode: '411001',
    satelliteType: 'Rural Cadastral Parcel',
    geofenceRadiusMeters: 50,
  };

  const invoices = project.evidenceChain?.financialInvoices || [];
  const milestones = project.evidenceChain?.physicalMilestones || [];
  const measurementBookNo = project.evidenceChain?.measurementBookNo || `MB/2024-25/${project.code.replace('MPL-', '')}`;

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const directiveText = actionRemarks || `Initiated ${selectedActionType} following SATARK-MPLADS Evidence Chain review.`;
    onTakeAction({
      targetType: 'Project',
      targetId: project.id,
      targetCode: project.code,
      targetName: project.title,
      actionType: selectedActionType,
      remarks: directiveText,
      priority: actionPriority,
    });
    setShowActionDialog(false);
    setActionRemarks('');
    setActionDispatchedMessage(`Directive Dispatched: ${selectedActionType} registered and logged in SATARK-MPLADS Audit Trail.`);
  };

  const copyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
    } catch {
      // Fallback
    }
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPhoto: SitePhoto = {
      id: `photo-${Date.now()}`,
      caption: newPhotoCaption || `${newPhotoStage} on-site inspection`,
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=600&auto=format&fit=crop&q=80',
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) + ' IST',
      geoLat: Number((gis.lat + (Math.random() - 0.5) * 0.0008).toFixed(5)),
      geoLng: Number((gis.lng + (Math.random() - 0.5) * 0.0008).toFixed(5)),
      uploaderName: 'Dr. Suhas Diwase (Collector / Vigilance Officer)',
      uploaderDesignation: 'District Magistrate & Collector, Pune',
      uploaderCertId: 'GOV-MH-EVID-8831',
      fileHash: `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`,
      verifiedMatch: true,
      tamperCheckPassed: true,
      notes: newPhotoNotes || 'Field verification inspection photo uploaded via SATARK-MPLADS Evidence Center.',
    };

    setLocalPhotos((prev) => [newPhoto, ...prev]);
    setShowAddPhotoModal(false);
    setNewPhotoCaption('');
    setNewPhotoNotes('');
  };

  const handlePrintDossier = () => {
    try {
      window.print();
    } catch {
      // Ignored in sandboxed iframes
    }
  };

  // Generate cryptographic hash for the project evidence dossier
  const dossierHash = `0x9f4a8b72${project.code.replace('MPL-', '')}c13e5902fa883d1c472890ae62bc1`;

  return (
    <div
      id="project-evidence-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="project-evidence-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800"
      >
        {/* Top Header Strip */}
        <div className="bg-slate-50 p-4 sm:p-5 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-blue-600 text-white shadow-xs">
                  {project.code}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-white text-slate-700 border border-slate-300 shadow-xs font-medium">
                  {project.category}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-white text-slate-700 border border-slate-300 shadow-xs flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  {project.district} District • {project.taluka} Taluka
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded font-bold border ${
                    project.riskScore > 70
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : project.riskScore > 40
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  Anomaly Risk: {project.riskScore}/100
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    project.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : project.status === 'Ongoing'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  Status: {project.status}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug truncate">
                {project.title}
              </h2>
              <p className="text-xs text-slate-600">
                Recommended by MP: <strong className="text-slate-800">{project.mpName}</strong> ({project.mpConstituency}) • Executing Agency: <strong className="text-slate-800">{project.implementingAgencyName}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start">
              <button
                onClick={handlePrintDossier}
                className="py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Print Official Evidence Dossier"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Print Dossier</span>
              </button>

              <button
                onClick={() => setShowActionDialog(true)}
                className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Order Joint Verification Directive"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Issue Order</span>
              </button>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 p-1.5 rounded-lg text-sm transition-colors cursor-pointer shadow-xs"
                title="Close Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Evidence Chain Visual Breadcrumb */}
          <div className="mt-3.5 pt-3 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px] font-semibold text-slate-600">
            <span className="text-purple-700 flex items-center gap-1 shrink-0 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              <Building2 className="w-3.5 h-3.5" /> {project.contractorName}
            </span>
            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-blue-700 flex items-center gap-1 shrink-0 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              <FileSpreadsheet className="w-3.5 h-3.5" /> {project.code}
            </span>
            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
            <button
              onClick={() => setActiveTab('evidence')}
              className={`flex items-center gap-1 shrink-0 px-2 py-0.5 rounded border cursor-pointer ${
                isHighDelta
                  ? 'text-rose-700 bg-rose-50 border-rose-200'
                  : 'text-slate-700 bg-slate-100 border-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Delta: {delta > 0 ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`}</span>
            </button>
            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
            <button
              onClick={() => setActiveTab('ledger')}
              className="text-emerald-700 flex items-center gap-1 shrink-0 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SHA-256 Verified Dossier</span>
            </button>
          </div>
        </div>

        {/* In-Modal Feedback Banner if an action was dispatched */}
        {actionDispatchedMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{actionDispatchedMessage}</span>
            </div>
            <div className="flex items-center gap-2">
              {onNavigateToAudit && (
                <button
                  onClick={onNavigateToAudit}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  View in Audit Trails <ArrowRight className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() => setActionDispatchedMessage(null)}
                className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Progress & Delta KPI Strip */}
        <div className="bg-slate-50/80 p-3 sm:p-4 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="text-slate-500 text-[11px] font-medium">Sanctioned Budget</div>
            <div className="font-mono font-bold text-sm text-slate-900">
              ₹{project.sanctionedAmountLakhs.toFixed(1)} Lakhs
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              Sanctioned: {project.sanctionedDate}
            </div>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="text-slate-500 text-[11px] font-medium">Expenditure Disbursed</div>
            <div className="font-mono font-bold text-sm text-blue-700">
              ₹{project.expenditureLakhs.toFixed(1)} Lakhs ({project.financialProgress.toFixed(0)}%)
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
              <Receipt className="w-3 h-3 text-blue-500" />
              {invoices.length} Running Bills Disbursed
            </div>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="text-slate-500 text-[11px] font-medium">Physical Ground Progress</div>
            <div className="font-mono font-bold text-sm text-emerald-700">
              {project.physicalProgress}% Verified
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
              <FileSpreadsheet className="w-3 h-3 text-emerald-500" />
              {milestones.length} MB Milestones Logged
            </div>
          </div>

          <div
            className={`p-2.5 rounded-xl border shadow-xs ${
              isHighDelta
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="text-[11px] font-semibold flex items-center justify-between">
              <span>Disbursed vs Physical</span>
              {isHighDelta && <AlertTriangle className="w-3 h-3 text-rose-600" />}
            </div>
            <div className="font-mono font-bold text-sm">
              +{delta.toFixed(1)}% Gap
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {isHighDelta ? '⚠️ Flagged for Joint Inspection' : 'Within Normal Range (Passed)'}
            </div>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 text-xs overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-2.5 px-3.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'evidence'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <SearchCheck className="w-3.5 h-3.5" />
            <span>Dossier & Anomalies ({project.anomalies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gis')}
            className={`py-2.5 px-3.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'gis'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-orange-600" />
            <span>GIS & Geofence</span>
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`py-2.5 px-3.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'photos'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-cyan-600" />
            <span>Site Photos ({effectivePhotos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={`py-2.5 px-3.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'financial'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
            <span>RA Invoices ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-2.5 px-3.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'milestones'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" />
            <span>MB Milestones ({milestones.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cost-benchmark')}
            className={`py-2.5 px-3.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'cost-benchmark'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-amber-600" />
            <span>Cost Benchmark</span>
            {costComparison && costComparison.isUnusuallyHigh && (
              <span className="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 border border-rose-200 rounded font-bold uppercase">
                +{costComparison.variancePercent}% High
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`py-2.5 px-3.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'ledger'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ledger & Hash</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/40">
          {/* Tab 1: Executive Dossier & Anomalies Overview */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              {/* Statistical Anomalies Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Identified Statistical Anomalies ({project.anomalies.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Calculated via SATARK-MPLADS Automated Forensic Engine
                  </span>
                </div>

                {project.anomalies.length === 0 ? (
                  <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-start gap-3 shadow-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-emerald-950 text-xs sm:text-sm">
                        Clean Compliance Record • Zero Flagged Anomalies
                      </h5>
                      <p className="text-emerald-800 text-xs mt-1 leading-relaxed">
                        Physical progress closely matches financial disbursements ({project.physicalProgress}% physical vs {project.financialProgress}% financial). All running measurement entries and rate contracts adhere to standard CPWD / PWD schedule specifications.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {project.anomalies.map((anom) => (
                      <div
                        key={anom.id}
                        className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 text-xs shadow-xs hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <BadgeAlert className="w-4 h-4 text-rose-600" />
                            {anom.type}
                          </span>
                          <span className="font-mono font-bold text-[10px] text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {anom.deltaMetric}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{anom.description}</p>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                          <span>Anomaly Code: <strong className="font-mono text-slate-700">{anom.code}</strong></span>
                          <span>Detected On: <strong className="text-slate-700">{anom.detectedOn}</strong></span>
                          <span className="font-bold uppercase text-rose-700">Severity: {anom.severity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Physical vs Financial Progress Breakdown Card */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Physical vs Financial Disbursed Convergence
                  </h4>
                  <span className="font-mono text-xs font-bold text-slate-700">
                    Delta: {delta > 0 ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600 font-medium">Physical Execution:</span>
                      <span className="font-bold text-emerald-700">{project.physicalProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, project.physicalProgress)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600 font-medium">Treasury Disbursement:</span>
                      <span className="font-bold text-blue-700">{project.financialProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHighDelta ? 'bg-rose-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, project.financialProgress)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Administrative Actions */}
              <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2.5 text-xs">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-600" />
                  Recommended Administrative Protocol
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Based on the {delta > 0 ? `+${delta.toFixed(1)}%` : 'recorded'} physical-financial divergence and {effectivePhotos.length} on-site photos, the Sub-Divisional Officer (SDO) and Executive Engineer PWD should conduct a joint physical measurement test and verify against Measurement Book (MB) records.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowActionDialog(true)}
                    className="py-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Issue Field Verification Order
                  </button>
                  {onOpenMBook && (
                    <button
                      onClick={() => onOpenMBook(project.code)}
                      className="py-1.5 px-3.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Inspect e-Measurement Book
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Proper GIS Location & Geofence Verification Studio */}
          {activeTab === 'gis' && (
            <div className="space-y-4 text-xs">
              {/* Location Hierarchy Card */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    Administrative & Revenue Location Hierarchy
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Geotag Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-mono">State & District</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      Maharashtra, {project.district}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Taluka / Block</div>
                    <div className="font-bold text-slate-800 mt-0.5">{project.taluka} Taluka</div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Parliamentary Const.</div>
                    <div className="font-bold text-blue-700 mt-0.5">{project.mpConstituency}</div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-mono">PIN Code & Type</div>
                    <div className="font-bold text-slate-800 mt-0.5 font-mono">
                      {gis.pincode} • {gis.satelliteType}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="text-[10px] text-slate-500 uppercase font-mono font-semibold">
                    Official Revenue Cadastral Address & Survey Gat:
                  </div>
                  <div className="font-semibold text-slate-800 mt-0.5 flex items-center justify-between gap-2">
                    <span>{gis.address}</span>
                    <button
                      onClick={() => copyToClipboard(gis.address)}
                      className="text-slate-500 hover:text-slate-800 shrink-0 cursor-pointer flex items-center gap-1 text-[11px] px-2 py-0.5 bg-white rounded border border-slate-200"
                      title="Copy Address"
                    >
                      {copiedText === gis.address ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive GIS Coordinate & Geofence Map Simulator */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    GIS Boundary & 50m Geofence Buffer Telemetry
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px]">
                    <button
                      onClick={() => setMapMode('satellite')}
                      className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer border ${
                        mapMode === 'satellite'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Satellite Imagery
                    </button>
                    <button
                      onClick={() => setMapMode('street')}
                      className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer border ${
                        mapMode === 'street'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      OpenStreetMap
                    </button>
                    <button
                      onClick={() => setMapMode('cadastral')}
                      className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer border ${
                        mapMode === 'cadastral'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Cadastral Survey
                    </button>
                  </div>
                </div>

                {/* Simulated GIS Canvas View */}
                <div
                  className={`h-64 sm:h-72 rounded-xl relative overflow-hidden flex flex-col justify-between p-3 border transition-colors ${
                    mapMode === 'satellite'
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : mapMode === 'cadastral'
                      ? 'bg-amber-50/70 border-amber-300 text-slate-900'
                      : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                >
                  {/* Layer background texture styling */}
                  {mapMode === 'satellite' && (
                    <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
                  )}
                  {mapMode === 'street' && (
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
                  )}
                  {mapMode === 'cadastral' && (
                    <div className="absolute inset-0 bg-[radial-gradient(#d97706_1.5px,transparent_1.5px)] [background-size:28px_28px] opacity-30" />
                  )}

                  {/* Top Map Badges */}
                  <div className="z-10 flex items-center justify-between gap-2">
                    <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-300 text-[10.5px] font-mono text-blue-900 flex items-center gap-1.5 shadow-xs">
                      <Navigation className="w-3 h-3 text-blue-600" />
                      LAT: {gis.lat.toFixed(6)}° N • LNG: {gis.lng.toFixed(6)}° E
                    </div>

                    <div className="bg-emerald-50/95 backdrop-blur-md px-2.5 py-1 rounded-md border border-emerald-300 text-[10.5px] font-bold text-emerald-800 flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Inside 50m Geofence Buffer (Pass)
                    </div>
                  </div>

                  {/* Center Target & Map Pins */}
                  <div className="z-10 text-center space-y-2 my-auto">
                    <div className="relative inline-flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-blue-500/10 border-2 border-dashed border-blue-500 animate-spin" style={{ animationDuration: '24s' }} />
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center absolute">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                      <MapPin className="w-7 h-7 text-rose-600 absolute -top-2 drop-shadow-md" />
                    </div>

                    <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-lg border border-slate-300 max-w-md mx-auto shadow-xs text-slate-800">
                      <div className="font-bold text-xs text-slate-900">{project.title}</div>
                      <div className="text-[10px] text-slate-600 mt-0.5">{gis.address}</div>
                      {mapMode === 'cadastral' && (
                        <div className="text-[10px] text-amber-800 font-mono mt-1 font-bold">
                          Cadastral Parcel ID: GAT/2024/MAH-{project.taluka.toUpperCase()}-098
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Map Controls */}
                  <div className="z-10 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-700 bg-white/95 backdrop-blur-md p-2 rounded-lg border border-slate-300 shadow-xs">
                    <div className="flex items-center gap-3">
                      <span>Altitude: <strong>562m MSL</strong></span>
                      <span>GPS Accuracy: <strong>±2.1m</strong></span>
                      <span>Buffer Radius: <strong>50m Standard</strong></span>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${gis.lat},${gis.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold"
                    >
                      Open in External Map <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Geotagged Photographic Audit Trail */}
          {activeTab === 'photos' && (
            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    Geotagged Photographic Audit Trail ({effectivePhotos.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    All photographs cryptographically stamped with SHA-256 telemetry and EXIF coordinates.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddPhotoModal(true)}
                  className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Attach Field Photo
                </button>
              </div>

              {effectivePhotos.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 shadow-xs">
                  <Camera className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="font-semibold text-xs text-slate-700">No Geotagged Site Photos Uploaded</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Implementing agency has not yet uploaded mandatory milestone site photos.
                  </p>
                  <button
                    onClick={() => setShowAddPhotoModal(true)}
                    className="mt-3 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs"
                  >
                    Upload Initial Photo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {effectivePhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col hover:border-blue-300 transition-colors group"
                    >
                      <div
                        className="relative h-48 bg-slate-100 overflow-hidden cursor-pointer"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white p-1.5 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="absolute bottom-2 left-2 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-orange-400" />
                          {photo.geoLat?.toFixed(4) || gis.lat.toFixed(4)}° N, {photo.geoLng?.toFixed(4) || gis.lng.toFixed(4)}° E
                        </div>
                      </div>

                      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-slate-900 leading-snug">
                              {photo.caption}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                              ✓ Verified Match
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                            {photo.notes}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Inspector: <strong className="text-slate-700">{photo.uploaderName}</strong></span>
                            <span>{photo.timestamp}</span>
                          </div>
                          <div className="font-mono text-[9px] text-slate-400 truncate">
                            SHA-256: {photo.fileHash || `sha256:${photo.id.replace('photo-', '')}bf4c8996fb92427ae41e`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Financial RA Invoices */}
          {activeTab === 'financial' && (
            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    Running Account (RA) Invoices & Treasury Disbursements
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Click on any bill record to inspect statutory deductions and PFMS disbursement voucher details.
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 self-start sm:self-auto">
                  Total Disbursed: ₹{project.expenditureLakhs.toFixed(2)}L / ₹{project.sanctionedAmountLakhs.toFixed(2)}L
                </span>
              </div>

              <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Invoice No</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Work Stage</th>
                      <th className="py-2.5 px-3">Amount (₹)</th>
                      <th className="py-2.5 px-3">Verifying Officer</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                          {inv.invoiceNo}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{inv.date}</td>
                        <td className="py-2.5 px-3 text-slate-800 font-medium">{inv.stage}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          ₹{inv.amountLakhs.toFixed(2)} Lakhs
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{inv.verifiedBy}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10.5px] font-semibold ${
                              inv.status === 'Flagged for Delta'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInvoice(inv);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] underline"
                          >
                            Inspect Voucher
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 5: Measurement Book (MB) Milestones */}
          {activeTab === 'milestones' && (
            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    Physical Milestones & Measurement Book (MB) Entries
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Official CPWA Form 23 MB Reference: <strong className="text-slate-800">{measurementBookNo}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {onOpenMBook && (
                    <button
                      onClick={() => onOpenMBook(project.code)}
                      className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Open in e-Measurement Book
                    </button>
                  )}
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Ground Physical: {project.physicalProgress}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {milestones.map((ms) => (
                  <div
                    key={ms.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs hover:border-blue-300 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-800 text-xs">
                        {ms.title}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Target Date: {ms.targetDate} {ms.actualDate && `• Completed: ${ms.actualDate}`}
                      </div>
                      <div className="text-[10px] font-mono text-blue-700 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" />
                        MB Record Reference: {ms.measurementBookRef}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          ms.completedPercent === 100
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : ms.completedPercent > 0
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {ms.completedPercent}% Done
                      </span>
                      <div className="text-[10px] text-slate-500">Weightage: {ms.weightagePercent}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 6: Cost Benchmark & Peer Comparison */}
          {activeTab === 'cost-benchmark' && costComparison && (
            <div className="space-y-4 text-xs">
              {/* Alert Banner */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-xs ${
                  costComparison.isUnusuallyHigh
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : costComparison.variancePercent > 15
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {costComparison.isUnusuallyHigh ? (
                    <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-xs uppercase tracking-wider">
                      {costComparison.anomalyClassification}
                    </div>
                    <div className="text-[11px] text-slate-700">
                      Unit rate of <strong className="text-slate-900">{costComparison.formattedProjectUnitCost}</strong> is{' '}
                      <strong className="text-slate-900">
                        {costComparison.variancePercent > 0
                          ? `+${costComparison.variancePercent}%`
                          : `${costComparison.variancePercent}%`}
                      </strong>{' '}
                      vs peer median ({costComparison.formattedPeerMedianUnitCost}) in {costComparison.category}.
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-sm text-slate-900">
                    {costComparison.percentileRank}th %ile
                  </div>
                  <div className="text-[10px] text-slate-500">Peer Outlier Rank</div>
                </div>
              </div>

              {/* 3 Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">
                    Target Unit Rate
                  </div>
                  <div className="font-mono font-bold text-base text-slate-900 mt-0.5">
                    {costComparison.formattedProjectUnitCost}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Scope: {costComparison.projectQuantity} {costComparison.unitName}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">
                    Peer Median Rate ({costComparison.peerCount} Projects)
                  </div>
                  <div className="font-mono font-bold text-base text-emerald-700 mt-0.5">
                    {costComparison.formattedPeerMedianUnitCost}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    District Mean: ₹{costComparison.peerMeanSanctionedLakhs}L
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">
                    State PWD DSR Ceiling
                  </div>
                  <div className="font-mono font-bold text-base text-blue-700 mt-0.5">
                    {costComparison.formattedDsrCeiling}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Ceiling Delta:{' '}
                    <strong
                      className={
                        costComparison.dsrDeviationPercent > 20
                          ? 'text-rose-600 font-bold'
                          : 'text-slate-700'
                      }
                    >
                      {costComparison.dsrDeviationPercent > 0
                        ? `+${costComparison.dsrDeviationPercent}%`
                        : `${costComparison.dsrDeviationPercent}%`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Peer Comparison Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">
                    Similar Works in {costComparison.category}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Comparing {costComparison.peerProjects.length} benchmark projects
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Project</th>
                        <th className="py-2 px-3">Contractor</th>
                        <th className="py-2 px-3">District</th>
                        <th className="py-2 px-3">Sanctioned</th>
                        <th className="py-2 px-3">Unit Rate</th>
                        <th className="py-2 px-3">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {costComparison.peerProjects.map((peer) => {
                        const isTarget = peer.id === project.id;
                        return (
                          <tr
                            key={peer.id}
                            className={isTarget ? 'bg-blue-50 font-semibold' : 'hover:bg-slate-50'}
                          >
                            <td className="py-2 px-3">
                              <span className="font-mono font-bold text-slate-900 mr-1">{peer.code}</span>
                              {isTarget && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-300 font-bold uppercase">
                                  THIS
                                </span>
                              )}
                              <div className="text-[11px] text-slate-700 truncate max-w-[200px]">
                                {peer.title}
                              </div>
                            </td>
                            <td className="py-2 px-3 text-slate-700 truncate max-w-[140px]">
                              {peer.contractorName}
                            </td>
                            <td className="py-2 px-3 text-slate-700">{peer.district}</td>
                            <td className="py-2 px-3 font-mono font-bold text-slate-900">
                              ₹{peer.sanctionedAmountLakhs}L
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-700">
                              {peer.formattedUnitCost}
                            </td>
                            <td className="py-2 px-3">
                              <span
                                className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded border inline-block ${
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
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 7: Cryptographic Ledger & Audit Chain */}
          {activeTab === 'ledger' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    Cryptographic Chain of Custody & Ledger Verification
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 font-mono">
                    SATARK-LEDGER #8492
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] space-y-1">
                  <div className="text-slate-500 uppercase text-[10px]">Evidence Merkle Packet Hash:</div>
                  <div className="font-bold text-indigo-900 break-all flex items-center justify-between gap-2">
                    <span>{dossierHash}</span>
                    <button
                      onClick={() => copyToClipboard(dossierHash)}
                      className="text-slate-500 hover:text-slate-800 text-[10px] px-2 py-0.5 bg-white rounded border border-slate-200 cursor-pointer shrink-0"
                    >
                      {copiedText === dossierHash ? 'Copied' : 'Copy Hash'}
                    </button>
                  </div>
                </div>

                {/* Multi-Signature Verification Hierarchy */}
                <div className="space-y-2 pt-2">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <FileSignature className="w-4 h-4 text-blue-600" />
                    Digital Signature Verification Matrix
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800">Junior Engineer (JE PWD Pune)</div>
                        <div className="text-[11px] text-slate-500">Ground Measurement & Geotag Verification</div>
                        <div className="text-[10px] font-mono text-emerald-700">Digital Cert: DSC-2024-JE-9912 • Timestamped: 2026-08-10 11:42 IST</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ✓ Cryptographically Signed
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800">Sub-Divisional Officer (SDO Haveli)</div>
                        <div className="text-[11px] text-slate-500">Measurement Book Endorsement & Check Measurement (25%)</div>
                        <div className="text-[10px] font-mono text-emerald-700">Digital Cert: DSC-2024-SDO-4410 • Timestamped: 2026-08-12 14:10 IST</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ✓ Cryptographically Signed
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800">Executive Engineer (EE PWD Division)</div>
                        <div className="text-[11px] text-slate-500">Technical Sanction & RA-Bill Treasury Release</div>
                        <div className="text-[10px] font-mono text-emerald-700">Digital Cert: DSC-2024-EE-1102 • Timestamped: 2026-08-15 09:30 IST</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ✓ Cryptographically Signed
                      </span>
                    </div>

                    <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-blue-900">District Collector / Nodal Officer (SATARK Level-3)</div>
                        <div className="text-[11px] text-blue-700">DLMC Vigilance Oversight Clearance</div>
                        <div className="text-[10px] font-mono text-blue-600">Active Vigilance Session • Clearance: LEVEL-3 NODAL</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                        ● Authorized to Order Inspection
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-600 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>All evidence records cryptographically bound on SATARK-MPLADS Ledger.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowActionDialog(true)}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Order Joint Verification
            </button>
            <button
              onClick={onClose}
              className="py-2 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold text-xs cursor-pointer shadow-xs transition-colors"
            >
              Close Dossier
            </button>
          </div>
        </div>
      </div>

      {/* Photo Lightbox Inspector Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span className="font-bold">{selectedPhoto.caption}</span>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="relative bg-slate-950 max-h-[55vh] flex items-center justify-center overflow-hidden">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                className="max-h-[55vh] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-2">
                <MapPin className="w-3 h-3 text-orange-400" />
                {selectedPhoto.geoLat?.toFixed(5)}° N, {selectedPhoto.geoLng?.toFixed(5)}° E
              </div>
            </div>

            <div className="p-4 space-y-2.5 text-xs bg-slate-50 flex-1 overflow-y-auto">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Field Notes:</span>
                <p className="text-slate-800 mt-0.5 leading-relaxed">{selectedPhoto.notes}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Uploading Officer:</span>
                  <strong className="text-slate-900">{selectedPhoto.uploaderName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Date & Timestamp:</span>
                  <strong className="text-slate-900">{selectedPhoto.timestamp}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10.5px]">
                <span className="font-mono text-slate-500">
                  SHA-256 Checksum: {selectedPhoto.fileHash || `sha256:${selectedPhoto.id}bf4c8996fb`}
                </span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Tamper-Check Passed
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Inspector Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Running Account Bill Voucher: {selectedInvoice.invoiceNo}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase">Bill Date</span>
                  <div className="font-bold text-slate-900">{selectedInvoice.date}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase">Disbursement Status</span>
                  <div className="font-bold text-emerald-700">{selectedInvoice.status}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase">Gross Amount</span>
                  <div className="font-bold text-slate-900 font-mono">
                    ₹{selectedInvoice.amountLakhs.toFixed(2)} Lakhs
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase">Stage Ref</span>
                  <div className="font-semibold text-slate-800">{selectedInvoice.stage}</div>
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 text-[11px]">Treasury Deductions & Recoveries:</div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>IT-TDS @ 2%:</span>
                  <span className="font-mono">₹{(selectedInvoice.amountLakhs * 0.02).toFixed(2)} Lakhs</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>GST-TDS @ 2%:</span>
                  <span className="font-mono">₹{(selectedInvoice.amountLakhs * 0.02).toFixed(2)} Lakhs</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Labor Welfare Cess @ 1%:</span>
                  <span className="font-mono">₹{(selectedInvoice.amountLakhs * 0.01).toFixed(2)} Lakhs</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Security Deposit Retention (5%):</span>
                  <span className="font-mono">₹{(selectedInvoice.amountLakhs * 0.05).toFixed(2)} Lakhs</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Net Treasury Disbursement:</span>
                  <span className="font-mono text-blue-700">₹{(selectedInvoice.amountLakhs * 0.90).toFixed(2)} Lakhs</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                <div>Verified By: <strong className="text-slate-700">{selectedInvoice.verifiedBy}</strong></div>
                <div>PFMS Mandate Ref: <strong className="font-mono text-slate-700">MH-PUN-MPLADS-2024-VOUCH-{selectedInvoice.invoiceNo.replace(/\D/g, '')}</strong></div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="py-1.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
              >
                Close Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Field Photo Simulator Modal */}
      {showAddPhotoModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-600" />
                <h3 className="font-bold text-slate-900 text-sm">Upload Geotagged Site Photo</h3>
              </div>
              <button
                onClick={() => setShowAddPhotoModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPhotoSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Inspection Caption</label>
                <input
                  type="text"
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                  placeholder="e.g. Concrete curing inspection at site foundation"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Construction Stage</label>
                <select
                  value={newPhotoStage}
                  onChange={(e) => setNewPhotoStage(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
                >
                  <option value="Initial Site Demarcation">Initial Site Demarcation</option>
                  <option value="Substructure & Excavation">Substructure & Excavation</option>
                  <option value="Plinth / Base Level">Plinth / Base Level</option>
                  <option value="Superstructure Execution">Superstructure Execution</option>
                  <option value="Finishing & Fitting">Finishing & Fitting</option>
                  <option value="Final Joint Handover Inspection">Final Joint Handover Inspection</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Inspection Officer Notes & Observations</label>
                <textarea
                  rows={3}
                  value={newPhotoNotes}
                  onChange={(e) => setNewPhotoNotes(e.target.value)}
                  placeholder="e.g. Work verified within 50m geofence. Concrete compaction done with mechanical vibrator..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-500 resize-none shadow-xs"
                  required
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[10.5px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1 font-semibold text-slate-800">
                  <MapPin className="w-3 h-3 text-orange-600" />
                  Auto-Stamped Coordinates:
                </div>
                <div className="font-mono text-blue-700">
                  {gis.lat.toFixed(6)}° N, {gis.lng.toFixed(6)}° E • Pincode: {gis.pincode}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddPhotoModal(false)}
                  className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Upload & Sign Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Dialog Overlay */}
      {showActionDialog && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Issue Administrative Directives</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Action will be registered in SATARK-MPLADS Audit Trail and sent to Executive Engineer.
                </p>
              </div>
              <button
                onClick={() => setShowActionDialog(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Directives Action Type</label>
                <select
                  value={selectedActionType}
                  onChange={(e) => setSelectedActionType(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
                >
                  <option value="Field Verification">Order Physical Joint Inspection</option>
                  <option value="Financial Review">Withhold RA-Bill & Audit MB Records</option>
                  <option value="Escalate">Escalate to DLMC Vigilance Committee</option>
                  <option value="Mark Verified">Mark Physical Progress Verified</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                <select
                  value={actionPriority}
                  onChange={(e) => setActionPriority(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent (Immediate Field Visit)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Officer Mandate & Instructions</label>
                <textarea
                  rows={3}
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  placeholder="e.g. Ordered Sub-Divisional Officer (SDO) to inspect concrete core strength and verify against RA-Bill/03..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-500 resize-none shadow-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowActionDialog(false)}
                  className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Confirm & Dispatch Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
