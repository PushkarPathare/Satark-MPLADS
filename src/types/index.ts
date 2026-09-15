/**
 * SATARK-MPLADS Type Definitions
 * System for Advanced Tracking, Anomaly Recognition & Knowledge-graph
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskFactorBreakdown {
  geographicConcentration: number; // e.g. +18
  projectSimilarity: number;       // e.g. +16
  delayPattern: number;            // e.g. +14
  costDeviation: number;           // e.g. +20
  agencyConcentration: number;     // e.g. +10
  historicalAnomalies: number;     // e.g. +8
}

export interface NetworkSignal {
  id: string;
  type: 
    | 'geographic_concentration'
    | 'repeated_project_pattern'
    | 'delay_pattern'
    | 'cost_pattern'
    | 'agency_concentration'
    | 'financial_physical_mismatch'
    | 'split_tendering';
  title: string;
  description: string;
  severity: RiskLevel;
  confidence: number; // 0-100%
  flaggedDate: string;
  supportingEvidence: string[];
  benchmarkComparison?: string;
  recommendedAction: string;
  flagCode: string;
}

export interface YearlyProgress {
  year: number;
  projectCount: number;
  sanctionedCr: number;
  expenditureCr: number;
  milestoneNotes?: string;
}

export interface Contractor {
  id: string;
  code: string;
  name: string;
  legalEntity: string;
  panNumber: string;
  gstNumber: string;
  registeredDistrict: string;
  state: string;
  experienceYears: number;
  totalProjects: number;
  completed: number;
  ongoing: number;
  delayed: number;
  totalSanctionedAmount: number; // In Lakhs or Crores (stored in Lakhs, displayed with formatters)
  totalExpenditure: number;      // In Lakhs
  avgDelayMonths: number;
  avgCostLakhs: number;
  districts: string[];
  agencies: string[];
  categories: string[];
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  riskFactors: RiskFactorBreakdown;
  networkSignals: NetworkSignal[];
  timeline: YearlyProgress[];
  contactPerson: string;
  phone: string;
  registeredAddress: string;
  whyFlaggedSummary: string;
  lastUpdated: string;
}

export interface InvoiceItem {
  id: string;
  invoiceNo: string;
  date: string;
  amountLakhs: number;
  stage: string;
  verifiedBy: string;
  status: 'Approved' | 'Disbursed' | 'Under Review' | 'Flagged for Delta';
}

export interface MilestoneItem {
  id: string;
  title: string;
  targetDate: string;
  actualDate?: string;
  weightagePercent: number;
  completedPercent: number;
  measurementBookRef: string;
  verified: boolean;
}

export interface SitePhoto {
  id: string;
  caption: string;
  url: string;
  timestamp: string;
  geoLat: number;
  geoLng: number;
  altitudeMeters?: number;
  accuracyMeters?: number;
  uploaderName: string;
  uploaderDesignation?: string;
  uploaderCertId?: string;
  fileHash?: string; // SHA-256 hash of raw image
  tamperCheckPassed?: boolean;
  verifiedMatch: boolean;
  notes: string;
}

export interface InspectionRecord {
  id: string;
  date: string;
  inspectorName: string;
  designation: string;
  findings: string;
  geoVerified: boolean;
  physicalProgressObserved: number;
  fileHash?: string;
  inspectionCertificateNo?: string;
}

export interface GisLocationData {
  lat: number;
  lng: number;
  altitudeMeters?: number;
  accuracyRadiusMeters?: number;
  address: string;
  village?: string;
  gramPanchayatOrWard?: string;
  taluka: string;
  district?: string;
  state?: string;
  pincode: string;
  assemblyConstituency?: string;
  parliamentaryConstituency?: string;
  surveyGatNo?: string;
  geofenceRadiusMeters?: number;
  satelliteType: 'Urban Cluster' | 'Rural Panchayat' | 'Semi-Urban Ward';
}

export interface ProjectEvidence {
  financialInvoices: InvoiceItem[];
  physicalMilestones: MilestoneItem[];
  gisCoordinates: GisLocationData;
  sitePhotos: SitePhoto[];
  physicalFinancialDelta: number; // e.g. Financial 90% vs Physical 40% = +50% delta (flagged)
  inspectionHistory: InspectionRecord[];
  measurementBookNo: string;
  workOrderRef: string;
  completionCertificateRef?: string;
  dlpExpiryDate?: string; // Defect Liability Period (e.g. 3 years post-completion)
}

export interface ProjectAnomaly {
  id: string;
  code: string;
  type: string;
  severity: RiskLevel;
  description: string;
  detectedOn: string;
  deltaMetric: string;
}

export type ProjectStatus = 'Completed' | 'Ongoing' | 'Delayed' | 'Stalled' | 'Under Scrutiny';

export interface UnitMetric {
  label: string;            // e.g. "Built-up Floor Area", "Road Length", "Plant Capacity", "Workstations / PCs", "Streetlight Units", "Hospital Bed Capacity"
  unit: string;             // e.g. "sq.ft", "km", "LPH (Litres/Hr)", "Workstations", "Luminary Poles", "Beds"
  quantity: number;         // e.g. 2500, 1.4, 2000, 30, 50, 8
  unitCostFormatted: string; // e.g. "₹1,920 / sq.ft", "₹22.86 L / km"
  unitCostValue: number;    // numeric normalized value for calculations
}

export interface CostComponentBreakdown {
  civilWorksLakhs: number;
  materialsEquipmentLakhs: number;
  laborMachineryLakhs: number;
  contingenciesOverheadLakhs: number;
}

export type CostAnomalySeverity = 
  | 'Normal'
  | 'Within Margin (+0% to +15%)'
  | 'Elevated (+15% to +30%)'
  | 'High Outlier (+30% to +60%)'
  | 'Unusually High / Critical Outlier (>+60%)';

export interface CostBenchmarkComparison {
  targetProjectId: string;
  targetProjectCode: string;
  targetProjectTitle: string;
  category: string;
  unitLabel: string;
  unitName: string;
  projectQuantity: number;
  projectSanctionedLakhs: number;
  projectUnitCost: number;
  formattedProjectUnitCost: string;
  
  // Peer Stats
  peerCount: number;
  peerMeanSanctionedLakhs: number;
  peerMedianSanctionedLakhs: number;
  peerMeanUnitCost: number;
  peerMedianUnitCost: number;
  peerMinUnitCost: number;
  peerMaxUnitCost: number;
  formattedPeerMedianUnitCost: string;
  
  // Government Schedule of Rates (DSR / SSR / CPWD Baseline)
  dsrCeilingUnitCost: number;
  formattedDsrCeiling: string;
  dsrDeviationPercent: number;

  // Comparison Indicators
  variancePercent: number; // vs Peer Median
  percentileRank: number; // 0 - 100th percentile
  isUnusuallyHigh: boolean;
  anomalyClassification: CostAnomalySeverity;
  zScore: number; // Standard deviation score

  // Root Causes & Diagnostic Notes
  costDriverExplanations: string[];
  peerProjects: Array<{
    id: string;
    code: string;
    title: string;
    contractorName: string;
    district: string;
    agencyName: string;
    sanctionedAmountLakhs: number;
    unitCostValue: number;
    formattedUnitCost: string;
    varianceVsMedianPercent: number;
    status: ProjectStatus;
  }>;
  recommendedAuditSteps: string[];
}

export interface Project {
  id: string;
  code: string; // e.g. "MPL-1024"
  title: string;
  description: string;
  category: string; // e.g. "Drinking Water", "Community Infrastructure", "Roads & Bridges", "Education", "Healthcare", "Sanitation"
  district: string;
  state: string;
  taluka: string;
  mpName: string;
  mpConstituency: string;
  mpHouse: 'Lok Sabha' | 'Rajya Sabha';
  implementingAgencyId: string;
  implementingAgencyName: string;
  contractorId: string;
  contractorName: string;
  sanctionedAmountLakhs: number;
  expenditureLakhs: number;
  physicalProgress: number;  // 0 - 100%
  financialProgress: number; // 0 - 100%
  sanctionedDate: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  status: ProjectStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  anomalies: ProjectAnomaly[];
  evidenceChain: ProjectEvidence;
  alertDescription: string;
  unitMetric?: UnitMetric;
  costBreakdown?: CostComponentBreakdown;
  dsrBaselineCostLakhs?: number;
}

export interface ImplementingAgency {
  id: string;
  code: string;
  name: string;
  district: string;
  state: string;
  departmentType: 'PWD' | 'Zilla Parishad' | 'MSRDC' | 'Water Supply Board' | 'Municipal Corporation' | 'Rural Development';
  nodalOfficerName: string;
  activeProjectsCount: number;
  completedProjectsCount: number;
  totalFundHandledLakhs: number;
  associatedContractors: string[];
  avgCompletionRatePercent: number;
  riskIndex: number;
}

export interface LocationDistrict {
  id: string;
  name: string;
  state: string;
  totalProjects: number;
  totalSanctionedCr: number;
  totalExpenditureCr: number;
  contractorCount: number;
  agencyCount: number;
  riskIndex: number;
  coordinates: { lat: number; lng: number };
}

export type NodeType = 'contractor' | 'project' | 'agency' | 'location' | 'category';

export interface GraphNode {
  id: string;
  label: string;
  subLabel?: string;
  type: NodeType;
  radius: number;
  color: string;
  secondaryColor?: string;
  riskLevel?: RiskLevel;
  riskScore?: number;
  entityId: string;
  data: any;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  expanded?: boolean;
  connectedCount?: number;
}

export interface GraphLink {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  strength: number; // 1 to 5 for stroke width / visual weight
  label?: string;
  relationshipType: 
    | 'contractor_project'
    | 'project_agency'
    | 'project_district'
    | 'contractor_agency'
    | 'contractor_district'
    | 'project_category';
  valueLakhs?: number;
  isFlaggedLink?: boolean;
}

export interface UpholderDetails {
  name: string;
  designation: string;
  department: string;
  digitalCertificateId: string;
  publicKeyFingerprint: string;
}

export interface FileProofData {
  fileName: string;
  fileSizeBytes: string;
  fileHash: string; // Cryptographic SHA-256
  mimeType: string;
  uploadTimestamp: string;
  geotagProof?: {
    lat: number;
    lng: number;
    accuracyMeters: number;
    altitudeMeters?: number;
    geofenceValid: boolean;
    locationName: string;
  };
}

export type LifecycleStage = 
  | 'Pre-Execution & Sanction'
  | 'Active Execution'
  | 'Physical Milestone Verification'
  | 'Milestone Verification'
  | 'Commissioning & Handover'
  | 'Post-Completion DLP (1-3 Year Maintenance)'
  | 'Annual Social Audit'
  | 'Asset Durability Inspection';

export interface InspectionReportDetails {
  whatWasWrong: string; // The root trigger anomaly or detected discrepancy
  anomalyType?: string; // e.g. "Physical-Financial Delta", "Cartel Monopoly", "Sub-standard Material"
  whatWasInspected: string; // The physical asset, site elements, or registers inspected
  inspectionLocation?: string; // Gat/Survey No, GP, Taluka
  registersInspected?: string[]; // e.g. ["e-MB Register CPWA 23", "Concrete Cube Test Reports", "Muster Roll"]
  inspectionTeam?: string[]; // Joint inspection committee
  findingsObservations?: string[]; // Detailed ground findings
  claimedPhysicalPercent?: number; // Claimed on paper
  verifiedPhysicalPercent?: number; // Actually verified on ground
  discrepancyAmountLakhs?: number; // Excess payment or recovery amount in ₹ Lakhs
  orderedDirectives?: string[]; // Executive actions ordered by Collector / DLMC
  complianceDeadlineDays?: number; // Days granted for compliance
  inspectionOutcome?: 'Major Irregularity Confirmed' | 'Recovery & FIR Ordered' | 'Satisfactory - No Defects' | 'Under Show Cause Scrutiny';
}

export interface AuditAction {
  id: string;
  blockIndex?: number;
  blockHash?: string;
  previousHash?: string;
  merkleRoot?: string;
  timestamp: string; // ISO 8601 string
  officerName: string;
  officerDesignation: string;
  upholder?: UpholderDetails;
  targetType: 'Contractor' | 'Project' | 'Asset Handover' | 'Social Audit';
  targetId: string;
  targetCode: string;
  targetName: string;
  lifecycleStage?: LifecycleStage;
  actionType: 
    | 'Investigate'
    | 'Field Verification'
    | 'Financial Review'
    | 'Request Updated Evidence'
    | 'Escalate'
    | 'Mark Verified'
    | 'False Positive'
    | 'Post-Completion Audit'
    | 'DLP Warranty Check'
    | 'Cryptographic Verification'
    | 'Add Remarks';
  status: 'Logged' | 'In Progress' | 'Inspection Ordered' | 'Completed' | 'Escalated to DLMC' | 'Verified on Chain';
  remarks: string;
  priority: 'Normal' | 'High' | 'Urgent';
  verificationOrderNo: string;
  assignedInspector?: string;
  fileProof?: FileProofData;
  digitalSignature?: string;
  isTampered?: boolean;
  isPostCompletionRecord?: boolean;
  postCompletionYear?: number;
  dlpStatus?: 'Under Warranty' | 'Maintenance Required' | 'Satisfactory' | 'Expired';
  inspectionReport?: InspectionReportDetails;
  whatWasWrong?: string;
  whatWasInspected?: string;
}

export interface FilterState {
  searchQuery: string;
  selectedDistrict: string;
  selectedCategory: string;
  selectedRiskLevel: string;
  selectedYear: string;
  selectedAgency: string;
  onlyShowFlagged: boolean;
  nodeTypes: {
    contractor: boolean;
    project: boolean;
    agency: boolean;
    location: boolean;
  };
}
