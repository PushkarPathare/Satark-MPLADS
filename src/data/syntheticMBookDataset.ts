import { SyntheticMBookRecord, ProjectMetadata, AnomalyDetectionReport, AnomalyCategory } from '../types/mbook';

export const SYNTHETIC_PROJECT_METADATA: ProjectMetadata = {
  projectId: 'MPLADS-2026-001',
  projectName: 'Construction of Community Road',
  scheme: 'MPLADS',
  location: 'Pune, Maharashtra',
  implementingAgency: 'Fictional Public Works Department',
  sanctionedAmount: 2500000,
  contractorName: 'ABC Infrastructure Pvt. Ltd.',
  workOrderNumber: 'WO/2026/045',
  startDate: '01-06-2026',
  expectedCompletionDate: '30-09-2026',
};

// Activity definitions with unit, sanctioned qty, and DSR rate
const ACTIVITIES = [
  { item: 'Site Clearance & Jungle Cutting', unit: 'sq.m', sanctioned: 4500, rate: 24 },
  { item: 'Earthwork Excavation in Roadway & Drains', unit: 'cu.m', sanctioned: 1850, rate: 165 },
  { item: 'Sub-grade Soil Compaction (10-12 Ton Roller)', unit: 'sq.m', sanctioned: 3800, rate: 38 },
  { item: 'Granular Sub-Base (GSB) 150mm compacted', unit: 'cu.m', sanctioned: 570, rate: 890 },
  { item: 'Wet Mix Macadam (WMM) Base 100mm', unit: 'cu.m', sanctioned: 380, rate: 1420 },
  { item: 'Prime Coat using Bituminous Emulsion (SS-1)', unit: 'sq.m', sanctioned: 3750, rate: 46 },
  { item: 'Tack Coat with Rapid Setting Emulsion (RS-1)', unit: 'sq.m', sanctioned: 3750, rate: 28 },
  { item: 'Dense Bituminous Macadam (DBM) 50mm Binder', unit: 'cu.m', sanctioned: 190, rate: 4250 },
  { item: 'Bituminous Concrete (BC) 30mm Wearing Course', unit: 'sq.m', sanctioned: 3600, rate: 245 },
  { item: 'Side Drain Construction (M-15 Grade Concrete)', unit: 'cu.m', sanctioned: 220, rate: 3950 },
  { item: 'Precast RCC Pipe Culvert (900mm NP3)', unit: 'RMT', sanctioned: 45, rate: 4800 },
  { item: 'Thermoplastic Road Surface Markings & Signages', unit: 'sq.m', sanctioned: 320, rate: 680 },
];

/**
 * Deterministic generation of exactly 100 M-Book measurement entries
 * covering normal measurements, edge cases, and 10 specific anomaly classes.
 */
function generate100Records(): SyntheticMBookRecord[] {
  const records: SyntheticMBookRecord[] = [];
  const baseLat = 18.5204;
  const baseLng = 73.8567;
  const mbNumber = 'MB/PUN/2026/014';
  const defaultEngineer = 'Rohan Deshmukh';
  const defaultEngineerId = 'ENG-PUN-408';
  const contractor = 'ABC Infrastructure Pvt. Ltd.';
  const workOrder = 'WO/2026/045';

  // Specific anomaly targets across 100 rows
  const anomalyMap: Record<number, { groundTruth: 'ANOMALOUS' | 'SUSPICIOUS'; type: any; note: string }> = {
    8: { groundTruth: 'SUSPICIOUS', type: 'REPEATED_MEASUREMENT', note: 'Exact same chainage recorded on consecutive days without curing justification' },
    14: { groundTruth: 'ANOMALOUS', type: 'OVER_MEASUREMENT', note: 'Road width recorded as 14.50m on a single-lane 3.75m village road specification' },
    22: { groundTruth: 'ANOMALOUS', type: 'DUPLICATE_ENTRY', note: 'Identical measurements & chainage duplicated from Page 06 to Page 18' },
    31: { groundTruth: 'ANOMALOUS', type: 'GPS_MISMATCH', note: 'GPS coordinates point to New Delhi (28.6139°N, 77.2090°E), 1,200 km from Pune project site' },
    39: { groundTruth: 'SUSPICIOUS', type: 'REPEATED_MEASUREMENT', note: 'Identical GPS recorded at three separate chainage locations 400m apart' },
    47: { groundTruth: 'ANOMALOUS', type: 'EXCESS_QUANTITY', note: 'Cumulative calculated quantity exceeds approved sanctioned technical limit by 142%' },
    55: { groundTruth: 'ANOMALOUS', type: 'DUPLICATE_PHOTO', note: 'Evidence Photo ID PH-PUN-0042 recycled for two separate culverts 1.8km apart' },
    63: { groundTruth: 'ANOMALOUS', type: 'BILL_MISMATCH', note: 'Billed amount ₹4,85,000 exceeds calculated M-Book item valuation ₹1,92,500' },
    71: { groundTruth: 'ANOMALOUS', type: 'DATE_ANOMALY', note: 'Measurement date 18-10-2026 occurs after sanctioned completion deadline 30-09-2026' },
    78: { groundTruth: 'ANOMALOUS', type: 'IMPOSSIBLE_DIMENSION', note: 'Wearing course asphalt depth recorded as 3.50m instead of 0.035m (100x inflation)' },
    84: { groundTruth: 'SUSPICIOUS', type: 'MISSING_MEASUREMENT', note: 'Zero/missing depth entered with positive calculated quantity multiplier' },
    91: { groundTruth: 'SUSPICIOUS', type: 'ENGINEER_INCONSISTENCY', note: 'Measurements certified under transferred officer ID ENG-DEL-901' },
    96: { groundTruth: 'SUSPICIOUS', type: 'BILL_MISMATCH', note: 'Slight unexplained rounding deviation between calculated line total and claimed bill' },
    99: { groundTruth: 'ANOMALOUS', type: 'DUPLICATE_ENTRY', note: 'Duplicate line item entry with identical dimensions and evidence hash' },
  };

  for (let i = 1; i <= 100; i++) {
    const act = ACTIVITIES[(i - 1) % ACTIVITIES.length];
    const pageNumber = Math.floor((i - 1) / 4) + 1;
    const chainageStart = (i - 1) * 25;
    const chainageEnd = chainageStart + 25;
    const location = `Chainage Ch ${chainageStart}+00 to ${chainageEnd}+00`;
    
    // Dates from 05-06-2026 to 28-09-2026
    const day = ((i * 3) % 28) + 1;
    const month = Math.min(9, 6 + Math.floor(i / 26));
    const dayStr = day.toString().padStart(2, '0');
    const monthStr = month.toString().padStart(2, '0');
    let dateStr = `${dayStr}-${monthStr}-2026`;

    // Standard baseline dimensions
    let length = 25.0;
    let width = 3.75;
    let depth = act.unit === 'cu.m' ? 0.15 : (act.unit === 'RMT' ? 1.0 : 0.0);
    let lat = Number((baseLat + ((i * 7) % 50) * 0.0004).toFixed(5));
    let lng = Number((baseLng + ((i * 5) % 50) * 0.0004).toFixed(5));
    let photoId = `EVD-PUN-${String(i).padStart(4, '0')}`;
    let engName = defaultEngineer;
    let engId = defaultEngineerId;
    let billNo = `RA-BILL-${Math.floor((i - 1) / 25) + 1}`;

    let groundTruth: 'NORMAL' | 'SUSPICIOUS' | 'ANOMALOUS' = 'NORMAL';
    let anomalyType: AnomalyCategory = 'NONE';
    let remarks = 'Legitimate field measurement verified as per CPWA Code standards.';

    // Inject specific anomaly or edge case
    if (anomalyMap[i]) {
      const anomaly = anomalyMap[i];
      groundTruth = anomaly.groundTruth;
      anomalyType = anomaly.type;
      remarks = anomaly.note;

      if (anomalyType === 'OVER_MEASUREMENT') {
        width = 14.50; // unrealistic for 3.75m road
      } else if (anomalyType === 'DUPLICATE_ENTRY') {
        length = 25.0;
        width = 3.75;
        photoId = 'EVD-PUN-0022';
      } else if (anomalyType === 'GPS_MISMATCH') {
        lat = 28.6139; // New Delhi
        lng = 77.2090;
      } else if (anomalyType === 'EXCESS_QUANTITY') {
        length = 180.0;
        width = 6.0;
        depth = 0.45;
      } else if (anomalyType === 'DUPLICATE_PHOTO') {
        photoId = 'EVD-PUN-0042'; // Recycled
      } else if (anomalyType === 'DATE_ANOMALY') {
        dateStr = '18-10-2026'; // Past completion deadline
      } else if (anomalyType === 'IMPOSSIBLE_DIMENSION') {
        depth = 3.50; // 3.5 meters thick asphalt!
      } else if (anomalyType === 'MISSING_MEASUREMENT') {
        depth = 0.00;
      } else if (anomalyType === 'ENGINEER_INCONSISTENCY') {
        engName = 'Vikas Sharma (Transferred)';
        engId = 'ENG-DEL-901';
      }
    } else if (i % 17 === 0) {
      // Mild legitimate variation
      groundTruth = 'NORMAL';
      anomalyType = 'NONE';
      width = 3.80; // slight site variation
      remarks = 'Permissible field tolerance (+1.3% width) due to curve embankment.';
    }

    // Calculated quantity
    let qty = 0;
    if (act.unit === 'cu.m') {
      qty = depth > 0 ? length * width * depth : length * width * 0.15;
    } else if (act.unit === 'sq.m') {
      qty = length * width;
    } else {
      qty = length;
    }
    qty = Number(qty.toFixed(2));

    let calcAmount = Math.round(qty * act.rate);
    let billAmount = calcAmount;

    if (anomalyType === 'BILL_MISMATCH') {
      billAmount = Math.round(calcAmount * (i === 63 ? 2.52 : 1.09));
    }

    const verificationStatus =
      groundTruth === 'ANOMALOUS'
        ? 'Flagged Discrepant'
        : groundTruth === 'SUSPICIOUS'
        ? 'Pending Verification'
        : i % 3 === 0
        ? 'Passed for Payment'
        : i % 2 === 0
        ? 'AE Check-Measured'
        : 'JE Recorded';

    records.push({
      mbNumber,
      pageNumber,
      projectId: 'MPLADS-2026-001',
      workDescription: 'Construction of Community Road under MPLADS Pune Division',
      measurementDate: dateStr,
      location,
      itemActivity: act.item,
      length: Number(length.toFixed(2)),
      width: Number(width.toFixed(2)),
      depthHeight: Number(depth.toFixed(3)),
      unit: act.unit,
      calculatedQuantity: qty,
      approvedQuantity: act.sanctioned,
      ratePerUnit: act.rate,
      calculatedAmount: calcAmount,
      engineerName: engName,
      engineerId: engId,
      contractorName: contractor,
      workOrderNumber: workOrder,
      gpsLatitude: lat,
      gpsLongitude: lng,
      photoEvidenceId: photoId,
      verificationStatus,
      billNumber: billNo,
      billAmount,
      remarks,
      groundTruth,
      anomalyType,
    });
  }

  return records;
}

export const SYNTHETIC_MBOOK_RECORDS: SyntheticMBookRecord[] = generate100Records();

/**
 * Utility: Converts records to valid CSV string
 */
export function convertMBookToCSV(records: SyntheticMBookRecord[]): string {
  const headers = [
    'Measurement Book Number',
    'Page Number',
    'Project ID',
    'Work Description',
    'Measurement Date',
    'Location',
    'Item/Activity',
    'Length',
    'Width',
    'Depth/Height',
    'Unit',
    'Calculated Quantity',
    'Approved/Sanctioned Quantity',
    'Rate per Unit',
    'Calculated Amount',
    'Engineer Name',
    'Engineer ID',
    'Contractor Name',
    'Work Order Number',
    'GPS Latitude',
    'GPS Longitude',
    'Photo/Evidence ID',
    'Verification Status',
    'Bill Number',
    'Bill Amount',
    'Remarks',
    'Ground_Truth',
    'Anomaly_Type',
  ];

  const rows = records.map((r) => [
    `"${r.mbNumber}"`,
    r.pageNumber,
    `"${r.projectId}"`,
    `"${r.workDescription.replace(/"/g, '""')}"`,
    `"${r.measurementDate}"`,
    `"${r.location.replace(/"/g, '""')}"`,
    `"${r.itemActivity.replace(/"/g, '""')}"`,
    r.length,
    r.width,
    r.depthHeight,
    `"${r.unit}"`,
    r.calculatedQuantity,
    r.approvedQuantity,
    r.ratePerUnit,
    r.calculatedAmount,
    `"${r.engineerName}"`,
    `"${r.engineerId}"`,
    `"${r.contractorName}"`,
    `"${r.workOrderNumber}"`,
    r.gpsLatitude,
    r.gpsLongitude,
    `"${r.photoEvidenceId}"`,
    `"${r.verificationStatus}"`,
    `"${r.billNumber}"`,
    r.billAmount,
    `"${r.remarks.replace(/"/g, '""')}"`,
    `"${r.groundTruth}"`,
    `"${r.anomalyType}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * 10 AI Anomaly Detection Rules & Algorithms
 */
export const AI_ANOMALY_DETECTION_RULES = [
  {
    ruleNo: 1,
    title: 'Geofence & Spatial Outlier Isolation (GPS_MISMATCH)',
    description: 'Computes geodesic Haversine distance between measured coordinate (Lat, Lng) and project site centroid (18.5204°N, 73.8567°E). Flags entries exceeding a 1.5 km bounding buffer (e.g. coordinates in New Delhi or Mumbai).',
    technique: 'Spatial Density Clustering (DBSCAN) & Geodesic Distance Thresholding',
    detectionThreshold: 'Distance > 1,500 meters from road alignment polyline',
  },
  {
    ruleNo: 2,
    title: 'Physical Dimensional Envelope Bounding (IMPOSSIBLE_DIMENSION)',
    description: 'Validates recorded Length, Width, and Depth against standard engineering design limits (IRC:SP:20 specifications). Flags road thicknesses like 3.5m (100x asphalt thickness) or single-lane widths exceeding 12m.',
    technique: 'Z-score & Domain-Specific Range Bounding Boxes',
    detectionThreshold: 'Depth > 0.35m for wearing course, or Width > 8.0m for single-lane rural roads',
  },
  {
    ruleNo: 3,
    title: 'Perceptual Image Hash Collision (DUPLICATE_PHOTO)',
    description: 'Computes pHash/dHash signatures of site photos to detect when the exact same photograph is uploaded under different measurement pages or culvert locations miles apart.',
    technique: 'Perceptual Image Hashing & Hamming Distance Matrix',
    detectionThreshold: 'Hamming distance == 0 across different chainages or measurement dates',
  },
  {
    ruleNo: 4,
    title: 'Cumulative Quantity vs Sanction Ceiling (EXCESS_QUANTITY)',
    description: 'Tracks the rolling aggregate sum of calculated quantities per item against the Approved Technical Sanction quantity. Triggers high-priority audit alerts when cumulative measurement exceeds 100%.',
    technique: 'Cumulative Aggregation & Percentage Cap Evaluator',
    detectionThreshold: 'Cumulative Sum / Approved Sanctioned Quantity > 1.05 (+5% statutory buffer)',
  },
  {
    ruleNo: 5,
    title: 'Financial Divergence Tracking (BILL_MISMATCH)',
    description: 'Performs automated mathematical reconciliation between recorded field measurements (Qty × Rate) and the contractor’s Running Account (RA) bill claim. Exposes inflation and rounding discrepancies.',
    technique: 'Algebraic Deterministic Cross-Check (Bill Amount - Calculated Valuation)',
    detectionThreshold: 'Absolute discrepancy > ₹500 or Variance > 1.0%',
  },
  {
    ruleNo: 6,
    title: 'Duplicate Chainage & Overlap Detection (DUPLICATE_ENTRY)',
    description: 'Analyzes spatio-temporal tuples [Item, Chainage, Activity] across all M-Book volumes. Catches fraudulent attempts to bill identical excavation or asphalt laying twice.',
    technique: 'Exact Match Tuple Indexing & Fuzzy Activity Jaccard Similarity',
    detectionThreshold: 'Identical Activity + Same Chainage Interval recorded on different dates without rework order',
  },
  {
    ruleNo: 7,
    title: 'Temporal Deadline & Chronological Audit (DATE_ANOMALY)',
    description: 'Validates measurement recording dates against project commencement (01-06-2026) and stipulated completion date (30-09-2026). Flags entries logged after project close or backward in time.',
    technique: 'Temporal Sequence Validator & Calendar Boundary Rules',
    detectionThreshold: 'Measurement Date > Project Completion Date without formal EOT (Extension of Time) document',
  },
  {
    ruleNo: 8,
    title: 'Measurement Frequency & Concrete Curing Velocity (REPEATED_MEASUREMENT)',
    description: 'Evaluates the time delta between consecutive measurements. Flags concrete or asphalt laying certified on back-to-back days where mandatory 7-day or 14-day curing intervals were physically required.',
    technique: 'Temporal Process Graph & Minimum Curing Interval Verification',
    detectionThreshold: 'Time delta between concrete pour and overlying course < 7 days',
  },
  {
    ruleNo: 9,
    title: 'Officer Jurisdiction & Personnel Graph (ENGINEER_INCONSISTENCY)',
    description: 'Validates Engineer ID and digital credentials against the official District PWD active personnel roster. Catches signatures by officers transferred out of the division or unauthorized staff.',
    technique: 'Entity Resolution & Relational Knowledge Graph Lookup',
    detectionThreshold: 'Engineer ID not mapped to Pune Division on measurement timestamp',
  },
  {
    ruleNo: 10,
    title: 'Missing Dimension & Incomplete Geometry (MISSING_MEASUREMENT)',
    description: 'Detects records with zero or null Depth/Height where a volumetric unit (cu.m) is billed, or where calculated quantities do not equal the geometric product of recorded dimensions.',
    technique: 'Structural Null Detection & Geometric Consistency Verifier',
    detectionThreshold: 'Unit == cu.m AND Depth == 0, OR Calculated Qty != L × W × D',
  },
];

/**
 * 28 Column Explanation Dictionary
 */
export const MBOOK_COLUMN_DICTIONARY = [
  { no: 1, name: 'Measurement Book Number', type: 'String', description: 'Unique statutory serial number of the physical/electronic M-Book volume issued by the Executive Engineer (e.g., MB/PUN/2026/014).' },
  { no: 2, name: 'Page Number', type: 'Integer', description: 'Sequential page number within the issued M-Book volume, maintaining CPWA Form 23 integrity.' },
  { no: 3, name: 'Project ID', type: 'String', description: 'Standard government identifier assigned to the sanctioned development project (MPLADS-2026-001).' },
  { no: 4, name: 'Work Description', type: 'String', description: 'Formal approved project title and scope as per the Administrative Approval (AA) and Technical Sanction (TS).' },
  { no: 5, name: 'Measurement Date', type: 'Date (DD-MM-YYYY)', description: 'The exact calendar date on which the Junior Engineer took measurements at the construction site.' },
  { no: 6, name: 'Location', type: 'String', description: 'Chainage stretch (e.g. Ch 25+00 to 50+00), culvert identifier, or cross-section boundary on the road alignment.' },
  { no: 7, name: 'Item/Activity', type: 'String', description: 'Specific Schedule of Rates (DSR/SoR) item description (e.g. Earthwork excavation, WMM, Bituminous Concrete).' },
  { no: 8, name: 'Length', type: 'Float (meters)', description: 'Measured longitudinal dimension in meters taken along the road centerline.' },
  { no: 9, name: 'Width', type: 'Float (meters)', description: 'Measured transverse dimension in meters across the carriage-way or drain width.' },
  { no: 10, name: 'Depth/Height', type: 'Float (meters)', description: 'Measured vertical thickness in meters (e.g. 0.05m for DBM, 0.15m for GSB).' },
  { no: 11, name: 'Unit', type: 'String', description: 'Standard unit of billing (cu.m for volume, sq.m for area, RMT for running meters, Nos for units).' },
  { no: 12, name: 'Calculated Quantity', type: 'Float', description: 'Geometric product of recorded dimensions (Length × Width × Depth or Length × Width).' },
  { no: 13, name: 'Approved/Sanctioned Quantity', type: 'Float', description: 'Total quantity authorized in the approved Detailed Project Report (DPR) and Technical Sanction.' },
  { no: 14, name: 'Rate per Unit', type: 'Currency (₹)', description: 'Contractually approved unit rate in Rupees per unit based on accepted tender schedule.' },
  { no: 15, name: 'Calculated Amount', type: 'Currency (₹)', description: 'Calculated monetary value of the line item (Calculated Quantity × Rate per Unit).' },
  { no: 16, name: 'Engineer Name', type: 'String', description: 'Full legal name of the Junior Engineer or authorized inspecting officer recording the entry.' },
  { no: 17, name: 'Engineer ID', type: 'String', description: 'Unique government employee ID / digital signature credential of the measuring engineer.' },
  { no: 18, name: 'Contractor Name', type: 'String', description: 'Corporate entity or contractor firm awarded the public works contract (ABC Infrastructure Pvt. Ltd.).' },
  { no: 19, name: 'Work Order Number', type: 'String', description: 'Formal contract agreement reference number issued by the competent authority (WO/2026/045).' },
  { no: 20, name: 'GPS Latitude', type: 'Float', description: 'Geographic latitude coordinate captured on-site at the point of measurement.' },
  { no: 21, name: 'GPS Longitude', type: 'Float', description: 'Geographic longitude coordinate captured on-site at the point of measurement.' },
  { no: 22, name: 'Photo/Evidence ID', type: 'String', description: 'Cryptographic identifier or file ID of the geo-tagged, time-stamped photograph of the work item.' },
  { no: 23, name: 'Verification Status', type: 'String', description: 'Statutory audit workflow status: JE Recorded, AE Check-Measured (25%), Passed for Payment, or Flagged Discrepant.' },
  { no: 24, name: 'Bill Number', type: 'String', description: 'Identifier of the contractor’s Running Account (RA) or Final Bill linked to this measurement.' },
  { no: 25, name: 'Bill Amount', type: 'Currency (₹)', description: 'Actual monetary amount claimed by the contractor under the linked billing voucher.' },
  { no: 26, name: 'Remarks', type: 'String', description: 'Field notes, chainage observations, or audit annotations recorded during entry.' },
  { no: 27, name: 'Ground_Truth', type: 'Enum', description: 'Benchmark classification: NORMAL (Legitimate), SUSPICIOUS (Borderline / High-Risk), or ANOMALOUS (Definite Discrepancy).' },
  { no: 28, name: 'Anomaly_Type', type: 'Enum', description: 'Specific anomaly taxonomy: NONE, OVER_MEASUREMENT, DUPLICATE_ENTRY, GPS_MISMATCH, EXCESS_QUANTITY, DUPLICATE_PHOTO, BILL_MISMATCH, DATE_ANOMALY, IMPOSSIBLE_DIMENSION, REPEATED_MEASUREMENT, etc.' },
];

/**
 * Sample Fraud / Anomaly Detection Reports for the AI system
 */
export const SAMPLE_ANOMALY_REPORTS: AnomalyDetectionReport[] = [
  {
    id: 'REP-2026-001',
    projectId: 'MPLADS-2026-001',
    recordRef: 'Row #31 | Page 08 | Item 4 (GSB Base)',
    detectedAnomaly: 'Severe Spatial Outlier & Geofence Breach',
    anomalyType: 'GPS_MISMATCH',
    evidence: 'Captured GPS (28.6139°N, 77.2090°E) resolves to Central Secretariat, New Delhi, which is 1,240 km away from the approved project site in Pune, Maharashtra.',
    riskScore: 98,
    recommendedAction: 'Withhold payment voucher immediately. Issue formal memo to certifying JE Rohan Deshmukh (ENG-PUN-408) demanding on-site GPS re-verification under Executive Engineer supervision.',
    severity: 'Critical',
  },
  {
    id: 'REP-2026-002',
    projectId: 'MPLADS-2026-001',
    recordRef: 'Row #78 | Page 20 | Item 9 (Bituminous Concrete)',
    detectedAnomaly: 'Impossible Engineering Physical Dimension (100x Thickness Inflation)',
    anomalyType: 'IMPOSSIBLE_DIMENSION',
    evidence: 'Depth recorded as 3.500 meters for 30mm Bituminous Concrete wearing course. Nominal design thickness is 0.030m. Calculated volume is ₹2,80,000 instead of ₹2,800.',
    riskScore: 95,
    recommendedAction: 'Block RA Bill #4. Direct Sub-Divisional Officer (SDO) to execute physical core drill test at Ch 1925+00 to verify actual asphalt thickness before releasing funds.',
    severity: 'Critical',
  },
  {
    id: 'REP-2026-003',
    projectId: 'MPLADS-2026-001',
    recordRef: 'Row #22 & Row #06 | Page 18 & Page 06 | Item 11 (RCC Pipe Culvert)',
    detectedAnomaly: 'Duplicate M-Book Entry & Double Billing of Culvert',
    anomalyType: 'DUPLICATE_ENTRY',
    evidence: 'Exact identical chainage, length (25.0m), width (3.75m), and calculated quantities recorded twice in MB-2026/014 under two different pages to bill the same culvert twice.',
    riskScore: 92,
    recommendedAction: 'Debit contractor ledger for duplicate claim ₹1,20,000. Initiate vigilance inquiry under Rule 15 of Public Works Accounts Code.',
    severity: 'High',
  },
  {
    id: 'REP-2026-004',
    projectId: 'MPLADS-2026-001',
    recordRef: 'Row #55 & Row #12 | Page 14 & Page 03',
    detectedAnomaly: 'Recycled Photo Evidence ID across Non-Adjacent Sites',
    anomalyType: 'DUPLICATE_PHOTO',
    evidence: 'Photo evidence ID "EVD-PUN-0042" was submitted simultaneously for subgrade compaction at Ch 275+00 and again for culvert apron 1.8 km away at Ch 1350+00.',
    riskScore: 88,
    recommendedAction: 'Flag for digital forensic inspection. Require mandatory on-site re-photography with verified cryptographic watermark and GPS EXIF validation.',
    severity: 'High',
  },
  {
    id: 'REP-2026-005',
    projectId: 'MPLADS-2026-001',
    recordRef: 'Row #63 | Page 16 | RA-BILL-3',
    detectedAnomaly: 'Voucher Inflation & Billing vs Measurement Discrepancy',
    anomalyType: 'BILL_MISMATCH',
    evidence: 'Claimed voucher amount ₹4,85,000 exceeds the M-Book calculated line item total of ₹1,92,500 by ₹2,92,500 (+152% inflation).',
    riskScore: 94,
    recommendedAction: 'Freeze RA Bill #3 in the Treasury portal. Pass bill only for certified M-Book amount ₹1,92,500 and demand written explanation from the contractor firm.',
    severity: 'Critical',
  },
  {
    id: 'REP-2026-006',
    projectId: 'MPLADS-2026-001',
    recordRef: 'Row #71 | Page 18 | Item 2 (Earthwork Excavation)',
    detectedAnomaly: 'Post-Project Completion Measurement without Sanction Extension',
    anomalyType: 'DATE_ANOMALY',
    evidence: 'Measurement entered on 18-10-2026, 18 calendar days after the stipulated completion date of 30-09-2026, with no formal Extension of Time (EOT) order uploaded.',
    riskScore: 78,
    recommendedAction: 'Verify whether Competent Authority (District Collector) granted time extension. If unapproved, levy liquidated damages (LD) of 1% per week of delay.',
    severity: 'Medium',
  },
  {
    id: 'REP-2026-007',
    projectId: 'MPLADS-2026-001',
    recordRef: 'Row #47 | Page 12 | Item 4 (GSB Granular Sub-Base)',
    detectedAnomaly: 'Technical Sanction Quantity Ceiling Exceeded (+142%)',
    anomalyType: 'EXCESS_QUANTITY',
    evidence: 'Cumulative measured volume of GSB reached 810 cu.m against sanctioned DPR estimate of 570 cu.m without prior approval of Revised Estimate from Superintending Engineer.',
    riskScore: 84,
    recommendedAction: 'Halt payment on excess 240 cu.m until Revised Technical Sanction (RTS) is sanctioned by the Competent Engineering Authority.',
    severity: 'High',
  },
  {
    id: 'REP-2026-008',
    projectId: 'MPLADS-2026-001',
    recordRef: 'Row #91 | Page 23 | Certified under ENG-DEL-901',
    detectedAnomaly: 'Unauthorized Measuring Officer Certification',
    anomalyType: 'ENGINEER_INCONSISTENCY',
    evidence: 'Measurement record signed under employee ID ENG-DEL-901 ("Vikas Sharma"), who was officially relieved from Pune Division on 15-06-2026.',
    riskScore: 82,
    recommendedAction: 'Invalidate measurement entry. Direct current jurisdictional JE to re-measure and re-sign before passing bills.',
    severity: 'High',
  },
];
