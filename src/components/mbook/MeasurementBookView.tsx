/**
 * Synthetic Government Public Works Measurement Book (M-Book / e-MB)
 * Purpose: Training & evaluation dataset for AI anomaly detection, fraud discovery,
 * and overbilling inspection in public works projects.
 */

import React, { useState, useMemo } from 'react';
import {
  Download,
  Copy,
  Check,
  Search,
  AlertTriangle,
  FileSpreadsheet,
  Info,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Building2,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  ChevronUp,
} from 'lucide-react';
import {
  SYNTHETIC_PROJECT_METADATA,
  SYNTHETIC_MBOOK_RECORDS,
  convertMBookToCSV,
  AI_ANOMALY_DETECTION_RULES,
  MBOOK_COLUMN_DICTIONARY,
  SAMPLE_ANOMALY_REPORTS,
} from '../../data/syntheticMBookDataset';
import {
  REGISTERED_COMPANIES,
  INITIAL_COMPANY_DATASETS,
  CompanyMBookMeta,
} from '../../data/companyMBooks';
import { CompanyMBookList } from './CompanyMBookList';
import { SyntheticMBookRecord, GroundTruthType, AnomalyCategory } from '../../types/mbook';
import { MeasurementEntryModal } from './MeasurementEntryModal';

interface MeasurementBookViewProps {
  mbooks?: any[];
  projects?: any[];
  initialMBookId?: string | null;
  onTakeAuditAction?: any;
  onOpenProjectEvidence?: any;
  onSelectProject?: (projectCode: string) => void;
}

export const MeasurementBookView: React.FC<MeasurementBookViewProps> = ({
  initialMBookId,
}) => {
  const [activeTab, setActiveTab] = useState<'registry' | 'ai-rules' | 'dictionary'>('registry');

  // Match initial company if initialMBookId is passed
  const initialCompany = useMemo(() => {
    if (!initialMBookId) return null;
    return (
      REGISTERED_COMPANIES.find(
        (c) =>
          c.id === initialMBookId ||
          c.mbNumber === initialMBookId ||
          c.projectId === initialMBookId
      ) || null
    );
  }, [initialMBookId]);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    initialCompany ? initialCompany.id : null
  );
  const [companyDatasets, setCompanyDatasets] = useState<Record<string, SyntheticMBookRecord[]>>(
    () => INITIAL_COMPANY_DATASETS
  );

  const currentCompany = useMemo(() => {
    if (!selectedCompanyId) return REGISTERED_COMPANIES[0];
    return REGISTERED_COMPANIES.find((c) => c.id === selectedCompanyId) || REGISTERED_COMPANIES[0];
  }, [selectedCompanyId]);

  const records = useMemo(() => {
    if (!selectedCompanyId) return [];
    return companyDatasets[selectedCompanyId] || [];
  }, [companyDatasets, selectedCompanyId]);

  const [userAddedIds, setUserAddedIds] = useState<Set<string>>(new Set());
  const [isEntryModalOpen, setIsEntryModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [groundTruthFilter, setGroundTruthFilter] = useState<'ALL' | GroundTruthType>('ALL');
  const [anomalyTypeFilter, setAnomalyTypeFilter] = useState<'ALL' | AnomalyCategory>('ALL');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesSearch =
        searchTerm === '' ||
        rec.itemActivity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.engineerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.photoEvidenceId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGroundTruth =
        groundTruthFilter === 'ALL' || rec.groundTruth === groundTruthFilter;

      const matchesAnomalyType =
        anomalyTypeFilter === 'ALL' || rec.anomalyType === anomalyTypeFilter;

      return matchesSearch && matchesGroundTruth && matchesAnomalyType;
    });
  }, [records, searchTerm, groundTruthFilter, anomalyTypeFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = records.length;
    const normal = records.filter((r) => r.groundTruth === 'NORMAL').length;
    const suspicious = records.filter((r) => r.groundTruth === 'SUSPICIOUS').length;
    const anomalous = records.filter((r) => r.groundTruth === 'ANOMALOUS').length;
    const totalCalculated = records.reduce((acc, r) => acc + r.calculatedAmount, 0);
    const totalBilled = records.reduce((acc, r) => acc + r.billAmount, 0);

    return { total, normal, suspicious, anomalous, totalCalculated, totalBilled };
  }, [records]);

  // Determine next page number
  const nextPageNumber = useMemo(() => {
    const maxPage = records.reduce((max, r) => Math.max(max, r.pageNumber), 0);
    return maxPage + 1;
  }, [records]);

  // Handle New Entry Save
  const handleSaveEntry = (newRecord: SyntheticMBookRecord) => {
    if (!selectedCompanyId) return;
    setCompanyDatasets((prev) => ({
      ...prev,
      [selectedCompanyId]: [newRecord, ...(prev[selectedCompanyId] || [])],
    }));
    setUserAddedIds((prev) => new Set(prev).add(newRecord.photoEvidenceId));
    setCurrentPage(1);

    setNotification(
      `Recorded Page #${newRecord.pageNumber} (${newRecord.itemActivity}): ${newRecord.calculatedQuantity} ${newRecord.unit} (₹${newRecord.calculatedAmount.toLocaleString()})`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle Delete Entry
  const handleDeleteEntry = (recordToDelete: SyntheticMBookRecord) => {
    if (!selectedCompanyId) return;
    setCompanyDatasets((prev) => ({
      ...prev,
      [selectedCompanyId]: (prev[selectedCompanyId] || []).filter(
        (r) =>
          !(
            r.pageNumber === recordToDelete.pageNumber &&
            r.photoEvidenceId === recordToDelete.photoEvidenceId &&
            r.location === recordToDelete.location
          )
      ),
    }));
    setNotification(`Removed measurement entry from Page #${recordToDelete.pageNumber}.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Reset to initial records
  const handleResetDataset = () => {
    if (!selectedCompanyId) return;
    setCompanyDatasets((prev) => ({
      ...prev,
      [selectedCompanyId]: [...(INITIAL_COMPANY_DATASETS[selectedCompanyId] || [])],
    }));
    setUserAddedIds(new Set());
    setCurrentPage(1);
    setNotification(`Dataset for ${currentCompany.name} restored to baseline records.`);
    setTimeout(() => setNotification(null), 3000);
  };

  // CSV Download Handler
  const handleDownloadCSV = () => {
    const csvContent = convertMBookToCSV(records);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `M-Book_${currentCompany.code}_${currentCompany.projectId}_${records.length}_Rows.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy CSV to Clipboard Handler
  const handleCopyCSV = async () => {
    const csvContent = convertMBookToCSV(records);
    try {
      await navigator.clipboard.writeText(csvContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = csvContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // If no company is selected, show company directory list
  if (!selectedCompanyId) {
    return (
      <div className="max-w-7xl mx-auto pb-12">
        <CompanyMBookList
          companies={REGISTERED_COMPANIES}
          companyDatasets={companyDatasets}
          onSelectCompany={(companyId) => {
            setSelectedCompanyId(companyId);
            setCurrentPage(1);
            setSearchTerm('');
            setGroundTruthFilter('ALL');
            setAnomalyTypeFilter('ALL');
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Synthetic Data Notice */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold uppercase tracking-wider text-amber-950 text-[11px] block">
            Synthetic Benchmark Dataset
          </span>
          <p className="leading-relaxed text-amber-800 text-[11px]">
            <strong>NOTICE:</strong> All project, contractor, engineer, GPS coordinates, bill amounts, and measurements in this M-Book are <strong>synthetic and fictitious</strong>. This dataset is engineered specifically for training, benchmarking, and testing AI/ML models in detecting public works anomalies, overbilling, duplicate measurements, and fraud patterns. It must not be presented or construed as real government records.
          </p>
        </div>
      </div>

      {/* Success / Info Notification Toast */}
      {notification && (
        <div className="bg-blue-50 border border-blue-300 text-blue-900 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold">{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-blue-500 hover:text-blue-800 font-bold ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Top Breadcrumb & Company Navigation Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setSelectedCompanyId(null)}
            className="py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>← Back to All Companies</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 font-medium">e-MB Directory</span>
          <span className="text-slate-300">/</span>
          <span className="font-extrabold text-slate-900">{currentCompany.name}</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">M-Book Volume:</span>
            <span className="font-mono font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
              {currentCompany.mbNumber}
            </span>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase ${
              currentCompany.riskLevel === 'critical'
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : currentCompany.riskLevel === 'high'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : currentCompany.riskLevel === 'medium'
                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}
          >
            {currentCompany.riskLevel} Risk ({currentCompany.riskScore}/100)
          </span>
        </div>
      </div>

      {/* Project Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                MPLADS Scheme
              </span>
              <span className="text-xs font-mono font-bold text-slate-800">
                ID: {currentCompany.projectId}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-600">
                WO: {currentCompany.workOrderNumber}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              {currentCompany.projectTitle}
            </h1>
            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>{currentCompany.registeredDistrict}, Maharashtra</span>
              <span className="text-slate-300">|</span>
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{currentCompany.implementingAgency}</span>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-slate-600">Contractor: {currentCompany.name} ({currentCompany.code})</span>
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsEntryModalOpen(true)}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Record Measurement Entry</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Download CSV ({records.length})</span>
            </button>

            <button
              onClick={handleCopyCSV}
              className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 shadow-xs transition-colors cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span>{isCopied ? 'Copied!' : 'Copy CSV'}</span>
            </button>

            {INITIAL_COMPANY_DATASETS[currentCompany.id] &&
              records.length !== INITIAL_COMPANY_DATASETS[currentCompany.id].length && (
                <button
                  onClick={handleResetDataset}
                  title="Reset back to default company records"
                  className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1 border border-rose-200 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
          </div>
        </div>

        {/* Project Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">Sanctioned Budget</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
              ₹{currentCompany.sanctionedAmountLakhs.toFixed(2)} Lakhs
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">Total Billed in Book</span>
            <span className="text-sm sm:text-base font-extrabold text-blue-900 font-mono">
              ₹{(metrics.totalBilled / 100000).toFixed(2)} Lakhs
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">Category & Class</span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 block truncate">
              {currentCompany.category}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">M-Book Register</span>
            <span className="text-xs sm:text-sm font-bold text-amber-700 font-mono block truncate">
              {currentCompany.mbNumber} ({records.length} Entries)
            </span>
          </div>
        </div>
      </div>

      {/* Anomaly Distribution Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Entries</span>
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-1 text-2xl font-black text-slate-900 font-mono">
            {metrics.total}
          </div>
          <span className="text-[10px] text-slate-400">All recorded measurements</span>
        </div>

        <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Normal</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1 text-2xl font-black text-emerald-900 font-mono">
            {metrics.normal}
          </div>
          <span className="text-[10px] text-emerald-700">Verified CPWA entries</span>
        </div>

        <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Suspicious</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-1 text-2xl font-black text-amber-900 font-mono">
            {metrics.suspicious}
          </div>
          <span className="text-[10px] text-amber-700">Borderline / High-risk</span>
        </div>

        <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">Anomalous</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-1 text-2xl font-black text-rose-900 font-mono">
            {metrics.anomalous}
          </div>
          <span className="text-[10px] text-rose-700">Flagged anomalies</span>
        </div>
      </div>

      {/* Streamlined Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('registry')}
          className={`py-2 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'registry'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Measurement Registry ({records.length} Entries)</span>
        </button>

        <button
          onClick={() => setActiveTab('ai-rules')}
          className={`py-2 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'ai-rules'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>AI Anomaly Rules & Vigilance Dossier</span>
        </button>

        <button
          onClick={() => setActiveTab('dictionary')}
          className={`py-2 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'dictionary'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>28-Column Data Dictionary</span>
        </button>
      </div>

      {/* TAB 1: REGISTRY & DATA ENTRY TABLE */}
      {activeTab === 'registry' && (
        <div className="space-y-4">
          {/* Filters & Actions Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Search input */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search activity, chainage, engineer, remarks..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Ground Truth Filter */}
              <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={groundTruthFilter}
                  onChange={(e) => {
                    setGroundTruthFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All ({metrics.total})</option>
                  <option value="NORMAL">NORMAL ({metrics.normal})</option>
                  <option value="SUSPICIOUS">SUSPICIOUS ({metrics.suspicious})</option>
                  <option value="ANOMALOUS">ANOMALOUS ({metrics.anomalous})</option>
                </select>
              </div>

              {/* Anomaly Type Filter */}
              <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium">Anomaly:</span>
                <select
                  value={anomalyTypeFilter}
                  onChange={(e) => {
                    setAnomalyTypeFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Types</option>
                  <option value="NONE">NONE</option>
                  <option value="OVER_MEASUREMENT">OVER_MEASUREMENT</option>
                  <option value="DUPLICATE_ENTRY">DUPLICATE_ENTRY</option>
                  <option value="GPS_MISMATCH">GPS_MISMATCH</option>
                  <option value="EXCESS_QUANTITY">EXCESS_QUANTITY</option>
                  <option value="DUPLICATE_PHOTO">DUPLICATE_PHOTO</option>
                  <option value="BILL_MISMATCH">BILL_MISMATCH</option>
                  <option value="DATE_ANOMALY">DATE_ANOMALY</option>
                  <option value="IMPOSSIBLE_DIMENSION">IMPOSSIBLE_DIMENSION</option>
                  <option value="REPEATED_MEASUREMENT">REPEATED_MEASUREMENT</option>
                  <option value="MISSING_MEASUREMENT">MISSING_MEASUREMENT</option>
                  <option value="ENGINEER_INCONSISTENCY">ENGINEER_INCONSISTENCY</option>
                </select>
              </div>
            </div>

            {/* Quick entry button + Page Size */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsEntryModalOpen(true)}
                className="py-1.5 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-blue-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Row</span>
              </button>

              <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                <span className="text-slate-500">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clean 28-Column Registry Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10 shadow-xs">
                  <tr>
                    <th className="p-2.5 sticky left-0 bg-slate-100 z-20 border-r border-slate-200 text-center w-12">#</th>
                    <th className="p-2.5">MB No.</th>
                    <th className="p-2.5">Page</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Location</th>
                    <th className="p-2.5">Item / Activity</th>
                    <th className="p-2.5 text-right">L (m)</th>
                    <th className="p-2.5 text-right">W (m)</th>
                    <th className="p-2.5 text-right">D (m)</th>
                    <th className="p-2.5">Unit</th>
                    <th className="p-2.5 text-right font-bold text-blue-900">Calc Qty</th>
                    <th className="p-2.5 text-right text-slate-400">Sanctioned</th>
                    <th className="p-2.5 text-right">Rate (₹)</th>
                    <th className="p-2.5 text-right font-bold text-slate-900">Calc Amt (₹)</th>
                    <th className="p-2.5">Engineer</th>
                    <th className="p-2.5">GPS Coord</th>
                    <th className="p-2.5">Photo ID</th>
                    <th className="p-2.5">Verification</th>
                    <th className="p-2.5">Bill No.</th>
                    <th className="p-2.5 text-right">Bill Amt (₹)</th>
                    <th className="p-2.5 sticky right-40 bg-slate-100 z-20 border-l border-slate-200">Ground Truth</th>
                    <th className="p-2.5 sticky right-0 bg-slate-100 z-20 border-l border-slate-200">Anomaly Type</th>
                    <th className="p-2.5">Remarks / Notes</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={24} className="p-8 text-center text-slate-500">
                        No measurement records match your search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((r, idx) => {
                      const globalRowNo = (currentPage - 1) * pageSize + idx + 1;
                      const isAnomaly = r.groundTruth === 'ANOMALOUS';
                      const isSuspicious = r.groundTruth === 'SUSPICIOUS';
                      const isUserAdded = userAddedIds.has(r.photoEvidenceId);

                      return (
                        <tr
                          key={`${r.pageNumber}-${r.photoEvidenceId}-${idx}`}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isUserAdded
                              ? 'bg-blue-50/40'
                              : isAnomaly
                              ? 'bg-rose-50/30'
                              : isSuspicious
                              ? 'bg-amber-50/30'
                              : ''
                          }`}
                        >
                          <td className="p-2.5 font-mono text-slate-500 sticky left-0 bg-white z-10 border-r border-slate-100 text-center">
                            {isUserAdded ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-600 text-white font-bold">
                                NEW
                              </span>
                            ) : (
                              globalRowNo
                            )}
                          </td>
                          <td className="p-2.5 font-mono font-bold text-slate-800">{r.mbNumber}</td>
                          <td className="p-2.5 font-mono text-slate-700">{r.pageNumber}</td>
                          <td className="p-2.5 font-mono text-slate-800">{r.measurementDate}</td>
                          <td className="p-2.5 font-medium text-slate-800">{r.location}</td>
                          <td className="p-2.5 font-medium text-slate-900 max-w-[200px] truncate" title={r.itemActivity}>
                            {r.itemActivity}
                          </td>
                          <td className="p-2.5 font-mono text-right text-slate-700">{r.length.toFixed(2)}</td>
                          <td className="p-2.5 font-mono text-right text-slate-700">{r.width.toFixed(2)}</td>
                          <td className="p-2.5 font-mono text-right text-slate-700">{r.depthHeight.toFixed(3)}</td>
                          <td className="p-2.5 font-medium text-slate-600">{r.unit}</td>
                          <td className="p-2.5 font-mono text-right font-bold text-blue-700">
                            {r.calculatedQuantity.toLocaleString()}
                          </td>
                          <td className="p-2.5 font-mono text-right text-slate-400">
                            {r.approvedQuantity.toLocaleString()}
                          </td>
                          <td className="p-2.5 font-mono text-right text-slate-600">₹{r.ratePerUnit}</td>
                          <td className="p-2.5 font-mono text-right font-bold text-slate-900">
                            ₹{r.calculatedAmount.toLocaleString()}
                          </td>
                          <td className="p-2.5 text-slate-700">
                            <span className="font-semibold">{r.engineerName}</span>{' '}
                            <span className="text-[10px] text-slate-400 font-mono">({r.engineerId})</span>
                          </td>
                          <td className="p-2.5 font-mono text-slate-600 text-[11px]">
                            {r.gpsLatitude.toFixed(4)}, {r.gpsLongitude.toFixed(4)}
                          </td>
                          <td className="p-2.5 font-mono text-xs text-blue-700">{r.photoEvidenceId}</td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.verificationStatus === 'Flagged Discrepant'
                                  ? 'bg-rose-100 text-rose-800'
                                  : r.verificationStatus === 'Passed for Payment'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : r.verificationStatus === 'AE Check-Measured'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {r.verificationStatus}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono font-bold text-slate-700">{r.billNumber}</td>
                          <td className={`p-2.5 font-mono text-right font-bold ${
                            r.billAmount !== r.calculatedAmount ? 'text-rose-700 underline' : 'text-slate-800'
                          }`}>
                            ₹{r.billAmount.toLocaleString()}
                          </td>
                          <td className="p-2.5 sticky right-40 bg-white z-10 border-l border-slate-100">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                r.groundTruth === 'NORMAL'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : r.groundTruth === 'SUSPICIOUS'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {r.groundTruth}
                            </span>
                          </td>
                          <td className="p-2.5 sticky right-0 bg-white z-10 border-l border-slate-100">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                                r.anomalyType === 'NONE'
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {r.anomalyType}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-600 italic truncate max-w-[240px]" title={r.remarks}>
                            {r.remarks}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => handleDeleteEntry(r)}
                              title="Delete this record"
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <span className="text-slate-500">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredRecords.length} records shown)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="text-slate-400">...</span>}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI ANOMALY RULES & FRAUD DOSSIER */}
      {activeTab === 'ai-rules' && (
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Section 1: Detection Algorithms */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                <span>10 Automated AI Anomaly Detection Rules</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Algorithms and heuristics executed in real-time when new measurements are submitted.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AI_ANOMALY_DETECTION_RULES.map((rule) => (
                <div
                  key={rule.ruleNo}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all space-y-1.5 text-xs"
                >
                  <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white font-mono text-[10px]">
                      #{rule.ruleNo}
                    </span>
                    {rule.title}
                  </h3>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {rule.description}
                  </p>
                  <div className="pt-1.5 border-t border-slate-100 text-[10px] space-y-0.5">
                    <div>
                      <span className="text-slate-400 font-medium">Technique: </span>
                      <strong className="text-blue-800">{rule.technique}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Trigger: </span>
                      <strong className="text-rose-700">{rule.detectionThreshold}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Sample Forensic Cases */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Vigilance Audit Cases Discovered in Dataset</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Representative anomalies captured from synthetic field measurements.
              </p>
            </div>

            <div className="space-y-3">
              {SAMPLE_ANOMALY_REPORTS.map((rep) => (
                <div
                  key={rep.id}
                  className={`p-4 rounded-xl border transition-all space-y-2 text-xs ${
                    rep.severity === 'Critical'
                      ? 'bg-rose-50/30 border-rose-200'
                      : 'bg-amber-50/30 border-amber-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800 text-xs px-2 py-0.5 rounded bg-white border border-slate-200">
                        {rep.id}
                      </span>
                      <span className="font-mono text-slate-500 text-[11px]">{rep.recordRef}</span>
                      <span className="text-[10px] font-mono font-bold text-slate-600">
                        {rep.anomalyType}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rep.severity === 'Critical' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                      }`}
                    >
                      {rep.severity} Severity (Risk {rep.riskScore}/100)
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs">
                    {rep.detectedAnomaly}
                  </h3>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] font-mono text-slate-800">
                    <span className="text-slate-400 font-sans font-bold block text-[10px] uppercase">
                      Evidence Found
                    </span>
                    {rep.evidence}
                  </div>

                  <div className="p-2.5 bg-blue-50/70 rounded-lg border border-blue-100 text-[11px] text-blue-950">
                    <span className="text-blue-700 font-bold block text-[10px] uppercase">
                      Recommended Action
                    </span>
                    {rep.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 28-COLUMN DICTIONARY */}
      {activeTab === 'dictionary' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 max-w-5xl mx-auto">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              28-Column M-Book Schema Dictionary
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact definitions, physical units, and formats used for dataset generation and machine learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MBOOK_COLUMN_DICTIONARY.map((col) => (
              <div
                key={col.no}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] flex items-center justify-center font-mono">
                      {col.no}
                    </span>
                    {col.name}
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {col.type}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed pl-6">
                  {col.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Measurement Entry Modal */}
      <MeasurementEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSave={handleSaveEntry}
        nextPageNumber={nextPageNumber}
        totalRecordsCount={records.length}
        companyMeta={currentCompany}
      />
    </div>
  );
};
