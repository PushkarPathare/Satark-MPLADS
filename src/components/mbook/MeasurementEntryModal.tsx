import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Calculator,
  MapPin,
  Camera,
  UserCheck,
  Sparkles,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { SyntheticMBookRecord, GroundTruthType, AnomalyCategory } from '../../types/mbook';
import { SYNTHETIC_PROJECT_METADATA } from '../../data/syntheticMBookDataset';
import { CompanyMBookMeta } from '../../data/companyMBooks';

interface MeasurementEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: SyntheticMBookRecord) => void;
  nextPageNumber: number;
  totalRecordsCount: number;
  companyMeta?: CompanyMBookMeta;
}

const COMMON_ROAD_ACTIVITIES = [
  { name: 'Site Clearance & Jungle Cutting', unit: 'sq.m', rate: 24, defaultDepth: 0 },
  { name: 'Earthwork Excavation in Roadway', unit: 'cu.m', rate: 310, defaultDepth: 0.3 },
  { name: 'Granular Sub-Base (GSB) 150mm compacted', unit: 'cu.m', rate: 890, defaultDepth: 0.15 },
  { name: 'Wet Mix Macadam (WMM) Base 100mm', unit: 'cu.m', rate: 1420, defaultDepth: 0.1 },
  { name: 'Dense Bituminous Macadam (DBM) 50mm Binder', unit: 'cu.m', rate: 4250, defaultDepth: 0.05 },
  { name: 'Bituminous Concrete (BC) 30mm Wearing Course', unit: 'sq.m', rate: 245, defaultDepth: 0.03 },
  { name: 'Precast RCC Pipe Culvert (900mm NP3)', unit: 'RMT', rate: 4800, defaultDepth: 1.0 },
  { name: 'Prime Coat using Bituminous Emulsion (SS-1)', unit: 'sq.m', rate: 46, defaultDepth: 0 },
  { name: 'Tack Coat over Bituminous Base', unit: 'sq.m', rate: 28, defaultDepth: 0 },
  { name: 'Road Side Concrete Drain (M20 Grade)', unit: 'RMT', rate: 2850, defaultDepth: 0.4 },
];

export const MeasurementEntryModal: React.FC<MeasurementEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  nextPageNumber,
  totalRecordsCount,
  companyMeta,
}) => {
  const [selectedActivity, setSelectedActivity] = useState(COMMON_ROAD_ACTIVITIES[4].name);
  const [customActivity, setCustomActivity] = useState('');
  const [location, setLocation] = useState(`Chainage Ch 2500+00 to 2525+00`);
  const [measurementDate, setMeasurementDate] = useState('14-09-2026');
  
  // Dimensions
  const [length, setLength] = useState<number>(25.0);
  const [width, setWidth] = useState<number>(3.75);
  const [depthHeight, setDepthHeight] = useState<number>(0.05);
  const [unit, setUnit] = useState<string>('cu.m');
  const [ratePerUnit, setRatePerUnit] = useState<number>(4250);
  const [approvedQuantity, setApprovedQuantity] = useState<number>(200);

  // Engineer & Metadata
  const [engineerName, setEngineerName] = useState('Rohan Deshmukh');
  const [engineerId, setEngineerId] = useState('ENG-PUN-408');
  const [verificationStatus, setVerificationStatus] = useState<
    'Pending Verification' | 'JE Recorded' | 'AE Check-Measured' | 'Passed for Payment' | 'Flagged Discrepant'
  >('JE Recorded');

  // Evidence & Billing
  const [gpsLatitude, setGpsLatitude] = useState<number>(18.5284);
  const [gpsLongitude, setGpsLongitude] = useState<number>(73.8612);
  const [photoEvidenceId, setPhotoEvidenceId] = useState(`EVD-PUN-${String(totalRecordsCount + 1).padStart(4, '0')}`);
  const [billNumber, setBillNumber] = useState('RA-BILL-4');
  const [autoSyncBillAmount, setAutoSyncBillAmount] = useState<boolean>(true);
  const [manualBillAmount, setManualBillAmount] = useState<number>(0);
  const [remarks, setRemarks] = useState('Field measurement verified at site as per CPWA Code specifications.');

  // Manual override for ground truth
  const [overrideGroundTruth, setOverrideGroundTruth] = useState<boolean>(false);
  const [manualGroundTruth, setManualGroundTruth] = useState<GroundTruthType>('NORMAL');
  const [manualAnomalyType, setManualAnomalyType] = useState<AnomalyCategory>('NONE');

  // Handle Activity Select Change
  const handleActivityChange = (activityName: string) => {
    setSelectedActivity(activityName);
    const matched = COMMON_ROAD_ACTIVITIES.find((a) => a.name === activityName);
    if (matched) {
      setUnit(matched.unit);
      setRatePerUnit(matched.rate);
      setDepthHeight(matched.defaultDepth);
    }
  };

  // Compute calculated quantity
  const calculatedQuantity = useMemo(() => {
    if (unit === 'cu.m') {
      return Number((length * width * (depthHeight > 0 ? depthHeight : 1)).toFixed(2));
    }
    if (unit === 'sq.m') {
      return Number((length * width).toFixed(2));
    }
    // RMT or Nos
    return Number(length.toFixed(2));
  }, [length, width, depthHeight, unit]);

  // Compute calculated amount
  const calculatedAmount = useMemo(() => {
    return Math.round(calculatedQuantity * ratePerUnit);
  }, [calculatedQuantity, ratePerUnit]);

  // Effective bill amount
  const billAmount = autoSyncBillAmount ? calculatedAmount : manualBillAmount;

  // Real-Time AI Anomaly Detection Rules Assessment
  const aiEvaluation = useMemo(() => {
    // 1. Distance check from Pune site center (approx 18.52, 73.86)
    const latDiff = Math.abs(gpsLatitude - 18.525);
    const lonDiff = Math.abs(gpsLongitude - 73.86);
    const isGpsFar = latDiff > 0.5 || lonDiff > 0.5;

    // 2. Road width check (Village road spec is 3.75m carriage + shoulders, >7m is suspicious, >10m is impossible)
    const isWidthExcessive = width > 10.0;
    const isWidthSuspicious = width > 6.0 && width <= 10.0;

    // 3. Layer depth check
    const isDepthExcessive = unit === 'cu.m' && depthHeight > 0.5;

    // 4. Missing depth in volumetric measurement
    const isMissingDepth = unit === 'cu.m' && depthHeight <= 0;

    // 5. Bill mismatch
    const isBillMismatch = billAmount !== calculatedAmount && Math.abs(billAmount - calculatedAmount) > 10;

    // 6. Engineer check
    const isEngineerTransferred = engineerId.includes('DEL') || engineerName.includes('Transferred');

    if (isGpsFar) {
      return {
        groundTruth: 'ANOMALOUS' as GroundTruthType,
        anomalyType: 'GPS_MISMATCH' as AnomalyCategory,
        reason: `GPS coordinates (${gpsLatitude}, ${gpsLongitude}) are located outside the Pune district boundary.`,
        severity: 'Critical',
      };
    }

    if (isDepthExcessive) {
      return {
        groundTruth: 'ANOMALOUS' as GroundTruthType,
        anomalyType: 'IMPOSSIBLE_DIMENSION' as AnomalyCategory,
        reason: `Depth of ${depthHeight}m exceeds the maximum allowable engineering threshold (0.50m) for road layers.`,
        severity: 'Critical',
      };
    }

    if (isWidthExcessive) {
      return {
        groundTruth: 'ANOMALOUS' as GroundTruthType,
        anomalyType: 'OVER_MEASUREMENT' as AnomalyCategory,
        reason: `Width of ${width}m exceeds the sanctioned carriage width (3.75m) for this MPLADS road.`,
        severity: 'High',
      };
    }

    if (isBillMismatch) {
      return {
        groundTruth: 'ANOMALOUS' as GroundTruthType,
        anomalyType: 'BILL_MISMATCH' as AnomalyCategory,
        reason: `Billed voucher amount (₹${billAmount.toLocaleString()}) does not match calculated valuation (₹${calculatedAmount.toLocaleString()}).`,
        severity: 'High',
      };
    }

    if (isMissingDepth) {
      return {
        groundTruth: 'SUSPICIOUS' as GroundTruthType,
        anomalyType: 'MISSING_MEASUREMENT' as AnomalyCategory,
        reason: `Zero or missing depth in a volumetric (cu.m) measurement item.`,
        severity: 'Moderate',
      };
    }

    if (isWidthSuspicious) {
      return {
        groundTruth: 'SUSPICIOUS' as GroundTruthType,
        anomalyType: 'OVER_MEASUREMENT' as AnomalyCategory,
        reason: `Width of ${width}m is wider than typical single-lane specification. Requires AE check.`,
        severity: 'Moderate',
      };
    }

    if (isEngineerTransferred) {
      return {
        groundTruth: 'SUSPICIOUS' as GroundTruthType,
        anomalyType: 'ENGINEER_INCONSISTENCY' as AnomalyCategory,
        reason: `Sign-off identity flags non-rostered or transferred personnel code.`,
        severity: 'Moderate',
      };
    }

    return {
      groundTruth: 'NORMAL' as GroundTruthType,
      anomalyType: 'NONE' as AnomalyCategory,
      reason: 'Complies with CPWA Form 23 dimensional envelopes and technical tolerances.',
      severity: 'Normal',
    };
  }, [gpsLatitude, gpsLongitude, width, depthHeight, unit, billAmount, calculatedAmount, engineerId, engineerName]);

  const effectiveGroundTruth = overrideGroundTruth ? manualGroundTruth : aiEvaluation.groundTruth;
  const effectiveAnomalyType = overrideGroundTruth ? manualAnomalyType : aiEvaluation.anomalyType;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const activityName = selectedActivity === 'Custom...' ? customActivity || 'General Public Works Item' : selectedActivity;

    const newRecord: SyntheticMBookRecord = {
      mbNumber: companyMeta?.mbNumber || `MB/PUN/2026/014`,
      pageNumber: nextPageNumber,
      projectId: companyMeta?.projectId || SYNTHETIC_PROJECT_METADATA.projectId,
      workDescription: companyMeta?.projectTitle || SYNTHETIC_PROJECT_METADATA.projectName,
      measurementDate,
      location,
      itemActivity: activityName,
      length: Number(length),
      width: Number(width),
      depthHeight: Number(depthHeight),
      unit,
      calculatedQuantity,
      approvedQuantity: Number(approvedQuantity),
      ratePerUnit: Number(ratePerUnit),
      calculatedAmount,
      engineerName,
      engineerId,
      contractorName: companyMeta?.name || SYNTHETIC_PROJECT_METADATA.contractorName,
      workOrderNumber: companyMeta?.workOrderNumber || SYNTHETIC_PROJECT_METADATA.workOrderNumber,
      gpsLatitude: Number(gpsLatitude),
      gpsLongitude: Number(gpsLongitude),
      photoEvidenceId,
      verificationStatus,
      billNumber,
      billAmount,
      remarks,
      groundTruth: effectiveGroundTruth,
      anomalyType: effectiveAnomalyType,
    };

    onSave(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Record New M-Book Entry
              </h2>
              <p className="text-xs text-slate-300">
                Form CPWA 23 • Book: <span className="font-mono text-blue-300">MB/PUN/2026/014</span> • Page: <span className="font-mono text-amber-300">#{nextPageNumber}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Real-time AI Assistant Status Pill */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
              aiEvaluation.groundTruth === 'NORMAL'
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : aiEvaluation.groundTruth === 'SUSPICIOUS'
                ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                : 'bg-rose-50/70 border-rose-300 text-rose-950'
            }`}
          >
            {aiEvaluation.groundTruth === 'NORMAL' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Live AI Anomaly Scanner:
                  <span
                    className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold uppercase ${
                      aiEvaluation.groundTruth === 'NORMAL'
                        ? 'bg-emerald-200 text-emerald-900'
                        : aiEvaluation.groundTruth === 'SUSPICIOUS'
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-rose-200 text-rose-900'
                    }`}
                  >
                    {aiEvaluation.groundTruth}
                  </span>
                </span>

                {aiEvaluation.anomalyType !== 'NONE' && (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/80 border border-slate-200 font-bold">
                    {aiEvaluation.anomalyType}
                  </span>
                )}
              </div>
              <p className="text-[11px] leading-relaxed text-slate-700">
                {aiEvaluation.reason}
              </p>
            </div>
          </div>

          {/* SECTION 1: Activity & Chainage Location */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <span>1. Activity & Location Description</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Item / Activity (DSR Schedule)
                </label>
                <select
                  value={selectedActivity}
                  onChange={(e) => handleActivityChange(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {COMMON_ROAD_ACTIVITIES.map((act) => (
                    <option key={act.name} value={act.name}>
                      {act.name}
                    </option>
                  ))}
                  <option value="Custom...">Custom item...</option>
                </select>
                {selectedActivity === 'Custom...' && (
                  <input
                    type="text"
                    placeholder="Enter custom work description..."
                    value={customActivity}
                    onChange={(e) => setCustomActivity(e.target.value)}
                    className="w-full mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Location / Chainage
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Chainage Ch 2500+00 to 2525+00"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Measurement Date (DD-MM-YYYY)
                </label>
                <input
                  type="text"
                  value={measurementDate}
                  onChange={(e) => setMeasurementDate(e.target.value)}
                  placeholder="14-09-2026"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Approved / Sanctioned Quantity
                </label>
                <input
                  type="number"
                  step="any"
                  value={approvedQuantity}
                  onChange={(e) => setApprovedQuantity(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Dimensions & Real-Time Calculation */}
          <div className="space-y-3 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-blue-600" />
                <span>2. Physical Dimensions (L × B × D) & Rate</span>
              </h3>
              <span className="text-[11px] text-blue-700 font-medium">
                Automatic Mathematical Verification
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Length ($L$ in m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Width ($W/B$ in m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Depth ($D/H$ in m)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={depthHeight}
                  onChange={(e) => setDepthHeight(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="cu.m">cu.m (Cubic Meters)</option>
                  <option value="sq.m">sq.m (Square Meters)</option>
                  <option value="RMT">RMT (Running Meters)</option>
                  <option value="Nos">Nos (Count/Items)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rate per Unit (₹)
                </label>
                <input
                  type="number"
                  value={ratePerUnit}
                  onChange={(e) => setRatePerUnit(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-blue-200">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">
                  Calculated Quantity
                </span>
                <span className="text-sm sm:text-base font-mono font-black text-blue-900">
                  {calculatedQuantity} {unit}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {unit === 'cu.m' ? `${length} × ${width} × ${depthHeight}` : `${length} × ${width}`}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-blue-200">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">
                  Total Calculated Amount
                </span>
                <span className="text-sm sm:text-base font-mono font-black text-slate-900">
                  ₹{calculatedAmount.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {calculatedQuantity} {unit} @ ₹{ratePerUnit}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: GPS Coordinates & Evidence */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>3. Geo-Coordinates, Evidence & Billing</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setGpsLatitude(18.5284);
                    setGpsLongitude(73.8612);
                  }}
                  className="text-[10px] text-blue-700 hover:underline font-semibold"
                >
                  Pune Site Coordinates
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setGpsLatitude(28.6139);
                    setGpsLongitude(77.209);
                  }}
                  className="text-[10px] text-rose-600 hover:underline font-semibold"
                >
                  Test Outlier (Delhi)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  GPS Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={gpsLatitude}
                  onChange={(e) => setGpsLatitude(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  GPS Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={gpsLongitude}
                  onChange={(e) => setGpsLongitude(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Photo Evidence ID
                </label>
                <input
                  type="text"
                  value={photoEvidenceId}
                  onChange={(e) => setPhotoEvidenceId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Bill Voucher No.
                </label>
                <input
                  type="text"
                  value={billNumber}
                  onChange={(e) => setBillNumber(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-800">
                    Billed Amount (₹)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600">
                    <input
                      type="checkbox"
                      checked={autoSyncBillAmount}
                      onChange={(e) => {
                        setAutoSyncBillAmount(e.target.checked);
                        if (!e.target.checked) setManualBillAmount(calculatedAmount);
                      }}
                      className="rounded text-blue-600"
                    />
                    <span>Auto-sync with Calculated Amount</span>
                  </label>
                </div>
                <input
                  type="number"
                  disabled={autoSyncBillAmount}
                  value={billAmount}
                  onChange={(e) => setManualBillAmount(Number(e.target.value))}
                  className={`w-full p-2 rounded-lg font-mono font-bold border ${
                    autoSyncBillAmount
                      ? 'bg-slate-100 text-slate-500 border-slate-200'
                      : 'bg-white text-slate-900 border-blue-400'
                  }`}
                />
              </div>
            </div>

            {/* Engineer & Verification */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Junior Engineer (JE)
                </label>
                <input
                  type="text"
                  value={engineerName}
                  onChange={(e) => setEngineerName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Engineer Personnel ID
                </label>
                <input
                  type="text"
                  value={engineerId}
                  onChange={(e) => setEngineerId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Verification Status
                </label>
                <select
                  value={verificationStatus}
                  onChange={(e) => setVerificationStatus(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="JE Recorded">JE Recorded (100%)</option>
                  <option value="AE Check-Measured">AE Check-Measured (25%)</option>
                  <option value="Passed for Payment">Passed for Payment</option>
                  <option value="Pending Verification">Pending Verification</option>
                  <option value="Flagged Discrepant">Flagged Discrepant</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Remarks / Auditor Notes
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Field observations, curve allowances, or audit remarks..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Optional Manual Ground Truth Override */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-slate-500" />
                Benchmark Training Labels (Ground Truth)
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600">
                <input
                  type="checkbox"
                  checked={overrideGroundTruth}
                  onChange={(e) => setOverrideGroundTruth(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Manual Label Override</span>
              </label>
            </div>

            {overrideGroundTruth ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ground Truth Classification
                  </label>
                  <select
                    value={manualGroundTruth}
                    onChange={(e) => setManualGroundTruth(e.target.value as any)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                  >
                    <option value="NORMAL">NORMAL (Legitimate)</option>
                    <option value="SUSPICIOUS">SUSPICIOUS (Borderline / High-risk)</option>
                    <option value="ANOMALOUS">ANOMALOUS (Definite discrepancy)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Anomaly Type Taxonomy
                  </label>
                  <select
                    value={manualAnomalyType}
                    onChange={(e) => setManualAnomalyType(e.target.value as any)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-800"
                  >
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
            ) : (
              <p className="text-[11px] text-slate-500">
                AI Auto-Assigned:{' '}
                <strong className="text-slate-800 font-mono">
                  {aiEvaluation.groundTruth} ({aiEvaluation.anomalyType})
                </strong>
                . Enable override if creating custom benchmark training cases.
              </p>
            )}
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record & Add to M-Book</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
