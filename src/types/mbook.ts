/**
 * Synthetic Government Public Works Measurement Book (M-Book / e-MB)
 * Designed for AI Anomaly Detection, Fraud Discovery & Audit Machine Learning
 */

export type GroundTruthType = 'NORMAL' | 'SUSPICIOUS' | 'ANOMALOUS';

export type AnomalyCategory =
  | 'NONE'
  | 'OVER_MEASUREMENT'
  | 'DUPLICATE_ENTRY'
  | 'GPS_MISMATCH'
  | 'EXCESS_QUANTITY'
  | 'DUPLICATE_PHOTO'
  | 'BILL_MISMATCH'
  | 'DATE_ANOMALY'
  | 'IMPOSSIBLE_DIMENSION'
  | 'REPEATED_MEASUREMENT'
  | 'MISSING_MEASUREMENT'
  | 'ENGINEER_INCONSISTENCY';

export interface SyntheticMBookRecord {
  // 1. Measurement Book Number
  mbNumber: string;
  // 2. Page Number
  pageNumber: number;
  // 3. Project ID
  projectId: string;
  // 4. Work Description
  workDescription: string;
  // 5. Measurement Date (DD-MM-YYYY)
  measurementDate: string;
  // 6. Location (Chainage / Landmark)
  location: string;
  // 7. Item/Activity
  itemActivity: string;
  // 8. Length (meters)
  length: number;
  // 9. Width (meters)
  width: number;
  // 10. Depth/Height (meters)
  depthHeight: number;
  // 11. Unit (e.g., cu.m, sq.m, RMT, Nos)
  unit: string;
  // 12. Calculated Quantity (Length * Width * Depth or L * W)
  calculatedQuantity: number;
  // 13. Approved/Sanctioned Quantity
  approvedQuantity: number;
  // 14. Rate per Unit (₹)
  ratePerUnit: number;
  // 15. Calculated Amount (₹)
  calculatedAmount: number;
  // 16. Engineer Name
  engineerName: string;
  // 17. Engineer ID
  engineerId: string;
  // 18. Contractor Name
  contractorName: string;
  // 19. Work Order Number
  workOrderNumber: string;
  // 20. GPS Latitude
  gpsLatitude: number;
  // 21. GPS Longitude
  gpsLongitude: number;
  // 22. Photo/Evidence ID
  photoEvidenceId: string;
  // 23. Verification Status
  verificationStatus: 'Pending Verification' | 'JE Recorded' | 'AE Check-Measured' | 'Passed for Payment' | 'Flagged Discrepant';
  // 24. Bill Number
  billNumber: string;
  // 25. Bill Amount (₹)
  billAmount: number;
  // 26. Remarks
  remarks: string;
  // 27. Ground Truth
  groundTruth: GroundTruthType;
  // 28. Anomaly Type
  anomalyType: AnomalyCategory;
}

export interface ProjectMetadata {
  projectId: string;
  projectName: string;
  scheme: string;
  location: string;
  implementingAgency: string;
  sanctionedAmount: number;
  contractorName: string;
  workOrderNumber: string;
  startDate: string;
  expectedCompletionDate: string;
}

export interface AnomalyDetectionReport {
  id: string;
  projectId: string;
  recordRef: string;
  detectedAnomaly: string;
  anomalyType: AnomalyCategory;
  evidence: string;
  riskScore: number; // 0 - 100
  recommendedAction: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

// Retain legacy interfaces for backward compatibility with other components
export interface MeasurementDimensionLine {
  id: string;
  subItemLabel: string;
  noOfUnits: number;
  length: number;
  breadth: number;
  depthHeight: number;
  totalQuantity: number;
  unit: string;
  remarks?: string;
  isFlaggedAnomaly?: boolean;
}

export interface CheckMeasurementRecord {
  officialName: string;
  designation: string;
  checkDate: string;
  percentChecked: number;
  observedDiscrepancyPercent: number;
  isSatisfactory: boolean;
  remarks: string;
  digitalSignatureId: string;
  geoVerifiedOnSite: boolean;
}

export interface MBookItem {
  id: string;
  itemNo: string;
  sorCode: string;
  description: string;
  unit: string;
  sanctionedQuantity: number;
  ratePerUnit: number;
  dimensionLines: MeasurementDimensionLine[];
  totalQuantityMeasured: number;
  totalValuation: number;
  excessQuantityPercent: number;
  measuredDate: string;
  juniorEngineerName: string;
  juniorEngineerDesignation: string;
  checkMeasurement?: CheckMeasurementRecord;
  status: string;
  linkedRaBillNo: string;
  hasGeotaggedPhoto: boolean;
  photoHash?: string;
  anomalyNote?: string;
}

export interface MBookRegister {
  id: string;
  bookNo: string;
  volumeNo: number;
  projectId: string;
  projectCode: string;
  projectTitle: string;
  contractorId: string;
  contractorName: string;
  implementingAgency: string;
  division: string;
  subDivision: string;
  workOrderNo: string;
  workOrderDate: string;
  sanctionedAmountLakhs: number;
  totalCertifiedLakhs: number;
  totalBillsDisbursedLakhs: number;
  billDisbursementDiscrepancyLakhs: number;
  inChargeJE: string;
  inChargeAE: string;
  inChargeEE: string;
  dateOfCommencement: string;
  stipulatedCompletionDate: string;
  items: MBookItem[];
  overallStatus: string;
  discrepanciesCount: number;
}
