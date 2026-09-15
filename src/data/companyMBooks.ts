import { SyntheticMBookRecord, GroundTruthType, AnomalyCategory } from '../types/mbook';
import { SYNTHETIC_MBOOK_RECORDS } from './syntheticMBookDataset';

export interface CompanyMBookMeta {
  id: string;
  name: string;
  code: string;
  legalEntity: string;
  registeredDistrict: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  projectTitle: string;
  projectId: string;
  workOrderNumber: string;
  implementingAgency: string;
  mbNumber: string;
  sanctionedAmountLakhs: number;
  category: string;
  description: string;
}

export const REGISTERED_COMPANIES: CompanyMBookMeta[] = [
  {
    id: 'comp-abc',
    name: 'ABC Infrastructure Pvt. Ltd.',
    code: 'CON-MH-PUN-001',
    legalEntity: 'Private Limited Company (Class-A PWD Registered)',
    registeredDistrict: 'Pune',
    riskScore: 72,
    riskLevel: 'high',
    projectTitle: 'Improvement & Asphalt Macadam of Village Connectivity Road (Ch 0+000 to 2+500)',
    projectId: 'MPLADS-2026-001',
    workOrderNumber: 'EE/PWD/PUN/WO/2026/044',
    implementingAgency: 'Public Works Division (PWD) Pune',
    mbNumber: 'MB/PUN/2026/014',
    sanctionedAmountLakhs: 48.0,
    category: 'Rural Roads & Highways',
    description: 'Comprehensive 100-page road construction M-Book featuring subgrade, GSB, WMM, DBM binder, BC wearing course, and culvert works with extensive AI anomaly benchmarks.',
  },
  {
    id: 'comp-apex',
    name: 'Apex Infra Buildtech LLP',
    code: 'CON-MH-PUN-019',
    legalEntity: 'Limited Liability Partnership (Class-A Civil Contractor)',
    registeredDistrict: 'Pune',
    riskScore: 78,
    riskLevel: 'high',
    projectTitle: 'Construction of Multipurpose Community Hall, Baramati',
    projectId: 'MPL-1024',
    workOrderNumber: 'PWD/PUN/WO/2023/881',
    implementingAgency: 'Public Works Department (PWD) Pune',
    mbNumber: 'PWD/BAR/MB-2024-31',
    sanctionedAmountLakhs: 48.0,
    category: 'Community Infrastructure',
    description: 'Structural civil works e-MB including column footings, TMT Fe-500 reinforcement, and plinth beams with recorded excavation depth anomalies and sub-statutory check measurements.',
  },
  {
    id: 'comp-sahyadri',
    name: 'Sahyadri Infra Ventures',
    code: 'CON-MH-SOL-022',
    legalEntity: 'Partnership Enterprise (ISO 9001:2015 Certified)',
    registeredDistrict: 'Solapur',
    riskScore: 24,
    riskLevel: 'low',
    projectTitle: 'Solar Powered RO Water Purification Plant, Pandharpur',
    projectId: 'MPL-1027',
    workOrderNumber: 'MJP/SOL/WTR/2023/102',
    implementingAgency: 'Maharashtra Jeevan Pradhikaran (MJP)',
    mbNumber: 'MJP/SOL/MB-2024-12',
    sanctionedAmountLakhs: 25.0,
    category: 'Drinking Water & Sanitation',
    description: 'Model public works register featuring 100% test-checked entries for RCC treatment shed, dual membrane 2,000 LPH skid installation, and water lab flow certifications.',
  },
  {
    id: 'comp-deccan',
    name: 'Deccan Earthmovers & Construction',
    code: 'CON-MH-PUN-088',
    legalEntity: 'Sole Proprietorship (Class-B PWD Registered)',
    registeredDistrict: 'Pune',
    riskScore: 68,
    riskLevel: 'medium',
    projectTitle: 'Construction of Rural Health Sub-Centre, Daund',
    projectId: 'MPL-1030',
    workOrderNumber: 'ZP/PUN/HLT/2023/612',
    implementingAgency: 'Pune Zilla Parishad (Health Works Wing)',
    mbNumber: 'ZP/BAR/MB-2024-18',
    sanctionedAmountLakhs: 42.0,
    category: 'Healthcare Infrastructure',
    description: 'Health clinic construction register with flagged brick masonry wall caliper discrepancies (recorded 230mm vs physical 150mm) and plinth over-measurements.',
  },
  {
    id: 'comp-vanguard',
    name: 'Vanguard Infra Projects Pvt Ltd',
    code: 'CON-MH-SOL-008',
    legalEntity: 'Private Limited Company (Class-A Civil Contractor)',
    registeredDistrict: 'Solapur',
    riskScore: 84,
    riskLevel: 'critical',
    projectTitle: 'High School Computer & Science Laboratory Upgrade, Solapur',
    projectId: 'MPL-2041',
    workOrderNumber: 'PWD/SOL/EDU/2024/019',
    implementingAgency: 'Solapur PWD Circle',
    mbNumber: 'PWD/SOL/MB-2024-09',
    sanctionedAmountLakhs: 39.5,
    category: 'Education & IT Infrastructure',
    description: 'Institutional upgrade register flagged for repeated verbatim BOQ estimates, IT workstation cabling over-bills, and advance RA payments against plinth stage progress.',
  },
  {
    id: 'comp-samarth',
    name: 'Shree Samarth Constructions',
    code: 'CON-MH-PUN-042',
    legalEntity: 'Sole Proprietorship (Class-B Registered)',
    registeredDistrict: 'Pune',
    riskScore: 38,
    riskLevel: 'medium',
    projectTitle: 'Drinking Water Supply Distribution Pipeline, Maval',
    projectId: 'MPL-1038',
    workOrderNumber: 'MJP/MAV/WS/2023/305',
    implementingAgency: 'Maharashtra Jeevan Pradhikaran (Water Supply)',
    mbNumber: 'MJP/MAV/MB-2024-05',
    sanctionedAmountLakhs: 21.0,
    category: 'Water Pipelines & Storage',
    description: 'Rural water transmission book documenting rocky trench excavation, 110mm HDPE pipe jointing, sluice valves, and hydrostatic pressure testing with mild weather variance.',
  },
  {
    id: 'comp-pragati',
    name: 'Pragati Engineers & Planners',
    code: 'CON-MH-THA-031',
    legalEntity: 'Partnership Firm (Class-A Highway & Bridge Contractor)',
    registeredDistrict: 'Thane',
    riskScore: 54,
    riskLevel: 'medium',
    projectTitle: 'Precast RCC Box Culvert & Causeways, Thane-Murbad Link',
    projectId: 'MPL-3012',
    workOrderNumber: 'MSRDC/THA/RD/2023/771',
    implementingAgency: 'MSRDC Rural Connectivity Cell',
    mbNumber: 'MSRDC/THA/MB-2024-22',
    sanctionedAmountLakhs: 34.0,
    category: 'Roads & Bridges',
    description: 'Drainage culvert register recording M-15 bed concrete, precast box culvert segments (2m x 2m), stone pitch revetments, and parapet railings with load test logs.',
  },
];

// Helper to generate realistic records for non-ABC companies
function generateApexRecords(): SyntheticMBookRecord[] {
  const items = [
    {
      act: 'Earthwork excavation in foundation trenches (Hard Strata)',
      L: 2.5, W: 2.5, D: 3.2, unit: 'cu.m', rate: 245, appQty: 280,
      bill: 102900, status: 'Flagged Discrepant' as const,
      gt: 'ANOMALOUS' as GroundTruthType, at: 'IMPOSSIBLE_DIMENSION' as AnomalyCategory,
      rem: 'Recorded depth 3.2m in soft soil - geotechnical bore log shows hard rock at 1.4m.',
    },
    {
      act: 'Plain Cement Concrete 1:4:8 in column footing bed (150mm)',
      L: 2.7, W: 2.7, D: 0.15, unit: 'cu.m', rate: 5200, appQty: 42,
      bill: 200200, status: 'AE Check-Measured' as const,
      gt: 'NORMAL' as GroundTruthType, at: 'NONE' as AnomalyCategory,
      rem: 'Thickness checked at 6 test pits. Uniform 150mm verified.',
    },
    {
      act: 'TMT Fe-500 steel bars fabrication & placing in column footing',
      L: 4.2, W: 1.0, D: 1.58, unit: 'MT', rate: 68500, appQty: 6.5,
      bill: 602800, status: 'Flagged Discrepant' as const,
      gt: 'ANOMALOUS' as GroundTruthType, at: 'EXCESS_QUANTITY' as AnomalyCategory,
      rem: 'Recorded 8.8 MT (+35% excess) without approved bar bending schedule revision.',
    },
    {
      act: 'Reinforced Cement Concrete M-25 in column pedestals up to plinth',
      L: 0.3, W: 0.45, D: 2.1, unit: 'cu.m', rate: 8400, appQty: 65,
      bill: 189000, status: 'JE Recorded' as const,
      gt: 'SUSPICIOUS' as GroundTruthType, at: 'MISSING_MEASUREMENT' as AnomalyCategory,
      rem: 'Missing mandatory 28-day concrete cube strength test certificate.',
    },
    {
      act: 'Subgrade preparation and 8-10T rolling for CC approach road',
      L: 1100.0, W: 4.5, D: 1.0, unit: 'sq.m', rate: 48, appQty: 5200,
      bill: 237600, status: 'AE Check-Measured' as const,
      gt: 'NORMAL' as GroundTruthType, at: 'NONE' as AnomalyCategory,
      rem: 'Subgrade proctor compaction test certified 98.2%.',
    },
    {
      act: 'Granular Sub-Base (GSB) Grade-III 150mm compacted layer',
      L: 1100.0, W: 4.65, D: 0.16, unit: 'cu.m', rate: 1450, appQty: 780,
      bill: 1189000, status: 'Flagged Discrepant' as const,
      gt: 'ANOMALOUS' as GroundTruthType, at: 'OVER_MEASUREMENT' as AnomalyCategory,
      rem: 'Recorded 160mm in M-Book; physical core drilling yielded only 95mm at 3 chainages.',
    },
    {
      act: 'M-20 Grade RCC Plinth Beam (300mm x 450mm)',
      L: 128.0, W: 0.3, D: 0.45, unit: 'cu.m', rate: 8200, appQty: 22,
      bill: 141696, status: 'JE Recorded' as const,
      gt: 'NORMAL' as GroundTruthType, at: 'NONE' as AnomalyCategory,
      rem: 'Perimeter beam verified with shuttering strip log.',
    },
    {
      act: 'Fly ash brick masonry in cement mortar 1:6 in plinth wall',
      L: 48.0, W: 0.23, D: 1.2, unit: 'cu.m', rate: 5800, appQty: 18,
      bill: 76790, status: 'Passed for Payment' as const,
      gt: 'NORMAL' as GroundTruthType, at: 'NONE' as AnomalyCategory,
      rem: 'Mortar batching and curing verified.',
    },
  ];

  return Array.from({ length: 32 }, (_, i) => {
    const template = items[i % items.length];
    const pageNum = i + 1;
    const calcQty = Number((template.L * template.W * template.D).toFixed(2));
    const calcAmt = Math.round(calcQty * template.rate);
    const day = String((i % 28) + 1).padStart(2, '0');

    return {
      mbNumber: 'PWD/BAR/MB-2024-31',
      pageNumber: pageNum,
      projectId: 'MPL-1024',
      workDescription: 'Construction of Multipurpose Community Hall, Baramati',
      measurementDate: `${day}-02-2024`,
      location: `Baramati Rural Site Plot B-${(i % 5) + 1} Grid ${String.fromCharCode(65 + (i % 4))}`,
      itemActivity: template.act,
      length: template.L,
      width: template.W,
      depthHeight: template.D,
      unit: template.unit,
      calculatedQuantity: calcQty,
      approvedQuantity: template.appQty,
      ratePerUnit: template.rate,
      calculatedAmount: calcAmt,
      engineerName: i % 3 === 0 ? 'Er. Sandeep Patil' : 'Er. Nilesh Kulkarni',
      engineerId: i % 3 === 0 ? 'ENG-PUN-312' : 'ENG-PUN-204',
      contractorName: 'Apex Infra Buildtech LLP',
      workOrderNumber: 'PWD/PUN/WO/2023/881',
      gpsLatitude: 18.1524 + (i * 0.0003),
      gpsLongitude: 74.5781 + (i * 0.0003),
      photoEvidenceId: `EVD-APX-${String(i + 1).padStart(4, '0')}`,
      verificationStatus: template.status,
      billNumber: `RA-BILL-${Math.floor(i / 8) + 1}`,
      billAmount: template.gt === 'ANOMALOUS' && i % 2 === 0 ? calcAmt + 25000 : calcAmt,
      remarks: template.rem,
      groundTruth: template.gt,
      anomalyType: template.at,
    };
  });
}

function generateSahyadriRecords(): SyntheticMBookRecord[] {
  const activities = [
    { name: 'RCC Framed Treatment Shed Footing (M25)', u: 'cu.m', r: 8400, l: 3.5, w: 3.5, d: 0.4 },
    { name: 'Brick Masonry in Superstructure 230mm', u: 'cu.m', r: 5600, l: 4.0, w: 0.23, d: 3.2 },
    { name: 'Supply and Erection of 2000 LPH RO Skid Frame', u: 'Nos', r: 145000, l: 1.0, w: 1.0, d: 1.0 },
    { name: 'Dual Membrane Dow Filmtec Pressure Vessel Installation', u: 'Nos', r: 88000, l: 2.0, w: 1.0, d: 1.0 },
    { name: 'Multi-Grade Sand & Activated Carbon Pre-Filter Vessel', u: 'Nos', r: 64000, l: 1.0, w: 1.0, d: 1.0 },
    { name: 'High Pressure Grundfos SS-316 Pump 3.0 kW', u: 'Nos', r: 112000, l: 1.0, w: 1.0, d: 1.0 },
    { name: 'Solar PV Array 5 kW Rooftop Mounting Structure', u: 'sq.m', r: 1850, l: 32.0, w: 1.0, d: 1.0 },
    { name: 'Hydrostatic & Product Water TDS Testing Run', u: 'Nos', r: 15000, l: 1.0, w: 1.0, d: 1.0 },
  ];

  return Array.from({ length: 20 }, (_, i) => {
    const act = activities[i % activities.length];
    const calcQty = Number((act.l * act.w * act.d).toFixed(2));
    const calcAmt = Math.round(calcQty * act.r);
    const day = String((i % 25) + 1).padStart(2, '0');

    return {
      mbNumber: 'MJP/SOL/MB-2024-12',
      pageNumber: i + 1,
      projectId: 'MPL-1027',
      workDescription: 'Solar Powered RO Water Purification Plant, Pandharpur',
      measurementDate: `${day}-01-2024`,
      location: `Pandharpur Water Works Yard Zone ${(i % 3) + 1}`,
      itemActivity: act.name,
      length: act.l,
      width: act.w,
      depthHeight: act.d,
      unit: act.u,
      calculatedQuantity: calcQty,
      approvedQuantity: calcQty * 1.1,
      ratePerUnit: act.r,
      calculatedAmount: calcAmt,
      engineerName: 'Er. Amit Shinde',
      engineerId: 'ENG-MJP-119',
      contractorName: 'Sahyadri Infra Ventures',
      workOrderNumber: 'MJP/SOL/WTR/2023/102',
      gpsLatitude: 17.6778 + (i * 0.0002),
      gpsLongitude: 75.3275 + (i * 0.0002),
      photoEvidenceId: `EVD-SHY-${String(i + 1).padStart(4, '0')}`,
      verificationStatus: 'Passed for Payment',
      billNumber: `MJP-BILL-${Math.floor(i / 10) + 1}`,
      billAmount: calcAmt,
      remarks: '100% test-checked by Executive Engineer. Water quality TDS certificate attached.',
      groundTruth: 'NORMAL',
      anomalyType: 'NONE',
    };
  });
}

function generateDeccanRecords(): SyntheticMBookRecord[] {
  const activities = [
    {
      name: 'First class fly ash brick masonry in clinic perimeter walls',
      L: 24.0, W: 0.23, D: 3.2, u: 'cu.m', r: 5600, app: 88,
      rem: 'Recorded 230mm thickness; physical measurement shows 150mm wall thickness.',
      gt: 'ANOMALOUS' as GroundTruthType, at: 'OVER_MEASUREMENT' as AnomalyCategory,
    },
    {
      name: 'Earthwork excavation in foundation for OPD consultation rooms',
      L: 18.0, W: 1.2, D: 1.5, u: 'cu.m', r: 280, app: 45,
      rem: 'Trench dimensions verified by Sectional Engineer.',
      gt: 'NORMAL' as GroundTruthType, at: 'NONE' as AnomalyCategory,
    },
    {
      name: 'Doctor Consultation & Pharmacy partition brickwork',
      L: 8.5, W: 0.23, D: 3.2, u: 'cu.m', r: 5600, app: 30,
      rem: 'Quantity over-booked by 30% against site verification.',
      gt: 'ANOMALOUS' as GroundTruthType, at: 'EXCESS_QUANTITY' as AnomalyCategory,
    },
    {
      name: 'Cement plaster 12mm thick in 1:4 cement mortar on walls',
      L: 24.0, W: 3.2, D: 1.0, u: 'sq.m', r: 185, app: 250,
      rem: 'Smooth sponge finish confirmed in OPD block.',
      gt: 'NORMAL' as GroundTruthType, at: 'NONE' as AnomalyCategory,
    },
    {
      name: 'Precast terrazzo tile flooring in immunization hall',
      L: 12.0, W: 6.0, D: 1.0, u: 'sq.m', r: 640, app: 90,
      rem: 'Grouting and skirting alignment verified.',
      gt: 'NORMAL' as GroundTruthType, at: 'NONE' as AnomalyCategory,
    },
  ];

  return Array.from({ length: 22 }, (_, i) => {
    const act = activities[i % activities.length];
    const calcQty = Number((act.L * act.W * act.D).toFixed(2));
    const calcAmt = Math.round(calcQty * act.r);
    const day = String((i % 27) + 1).padStart(2, '0');

    return {
      mbNumber: 'ZP/BAR/MB-2024-18',
      pageNumber: i + 1,
      projectId: 'MPL-1030',
      workDescription: 'Construction of Rural Health Sub-Centre, Daund',
      measurementDate: `${day}-02-2024`,
      location: `Daund Primary Health Centre Campus Section ${(i % 4) + 1}`,
      itemActivity: act.name,
      length: act.L,
      width: act.W,
      depthHeight: act.D,
      unit: act.u,
      calculatedQuantity: calcQty,
      approvedQuantity: act.app,
      ratePerUnit: act.r,
      calculatedAmount: calcAmt,
      engineerName: 'Er. R. K. Shinde',
      engineerId: 'ENG-ZP-801',
      contractorName: 'Deccan Earthmovers & Construction',
      workOrderNumber: 'ZP/PUN/HLT/2023/612',
      gpsLatitude: 18.4682 + (i * 0.0003),
      gpsLongitude: 74.5821 + (i * 0.0003),
      photoEvidenceId: `EVD-DEC-${String(i + 1).padStart(4, '0')}`,
      verificationStatus: act.gt === 'ANOMALOUS' ? 'Flagged Discrepant' : 'AE Check-Measured',
      billNumber: `ZP-RA-${Math.floor(i / 8) + 1}`,
      billAmount: act.gt === 'ANOMALOUS' ? calcAmt + 18000 : calcAmt,
      remarks: act.rem,
      groundTruth: act.gt,
      anomalyType: act.at,
    };
  });
}

function generateVanguardRecords(): SyntheticMBookRecord[] {
  const activities = [
    {
      name: 'Vitrified heavy duty tile flooring (600x600mm) in computer lab',
      L: 16.0, W: 8.0, D: 1.0, u: 'sq.m', r: 940, app: 120,
      rem: 'Repetitive estimate identical to 4 distant school tenders.',
      gt: 'SUSPICIOUS' as GroundTruthType, at: 'REPEATED_MEASUREMENT' as AnomalyCategory,
    },
    {
      name: 'Electrical wiring in PVC concealed conduit for 30 computer terminals',
      L: 450.0, W: 1.0, D: 1.0, u: 'RMT', r: 240, app: 300,
      rem: 'Advance payment claimed before laying network distribution panels.',
      gt: 'ANOMALOUS' as GroundTruthType, at: 'BILL_MISMATCH' as AnomalyCategory,
    },
    {
      name: 'Modular lab workbench with acid-resistant granite top',
      L: 24.0, W: 0.9, D: 1.0, u: 'RMT', r: 4800, app: 20,
      rem: 'Supplier invoice matches sister entity with identical date stamp.',
      gt: 'ANOMALOUS' as GroundTruthType, at: 'OVER_MEASUREMENT' as AnomalyCategory,
    },
    {
      name: 'Aluminium glazed sliding windows (2-track) in physics/chemistry lab',
      L: 12.0, W: 1.5, D: 1.0, u: 'sq.m', r: 2850, app: 25,
      rem: 'Powder coating thickness 60 microns verified.',
      gt: 'NORMAL' as GroundTruthType, at: 'NONE' as AnomalyCategory,
    },
  ];

  return Array.from({ length: 26 }, (_, i) => {
    const act = activities[i % activities.length];
    const calcQty = Number((act.L * act.W * act.D).toFixed(2));
    const calcAmt = Math.round(calcQty * act.r);
    const day = String((i % 26) + 1).padStart(2, '0');

    return {
      mbNumber: 'PWD/SOL/MB-2024-09',
      pageNumber: i + 1,
      projectId: 'MPL-2041',
      workDescription: 'High School Computer & Science Laboratory Upgrade, Solapur',
      measurementDate: `${day}-03-2024`,
      location: `Solapur High School Campus Lab Room ${(i % 4) + 1}`,
      itemActivity: act.name,
      length: act.L,
      width: act.W,
      depthHeight: act.D,
      unit: act.u,
      calculatedQuantity: calcQty,
      approvedQuantity: act.app,
      ratePerUnit: act.r,
      calculatedAmount: calcAmt,
      engineerName: 'Er. C. S. Deshpande',
      engineerId: 'ENG-SOL-092',
      contractorName: 'Vanguard Infra Projects Pvt Ltd',
      workOrderNumber: 'PWD/SOL/EDU/2024/019',
      gpsLatitude: 17.6599 + (i * 0.0004),
      gpsLongitude: 75.9064 + (i * 0.0004),
      photoEvidenceId: `EVD-VNG-${String(i + 1).padStart(4, '0')}`,
      verificationStatus: act.gt === 'ANOMALOUS' ? 'Flagged Discrepant' : 'Pending Verification',
      billNumber: `RA-BILL-${Math.floor(i / 7) + 1}`,
      billAmount: act.gt === 'ANOMALOUS' ? calcAmt + 32000 : calcAmt,
      remarks: act.rem,
      groundTruth: act.gt,
      anomalyType: act.at,
    };
  });
}

function generateSamarthRecords(): SyntheticMBookRecord[] {
  const activities = [
    { name: 'Trench excavation in ordinary rock for water line (0.9m depth)', u: 'cu.m', r: 380, l: 250.0, w: 0.6, d: 0.9 },
    { name: 'Providing and laying 110mm dia HDPE PN-6 water supply pipe', u: 'RMT', r: 420, l: 250.0, w: 1.0, d: 1.0 },
    { name: 'Refilling trenches with selected excavated earth and watering', u: 'cu.m', r: 110, l: 250.0, w: 0.6, d: 0.75 },
    { name: 'Construction of brick masonry valve chamber (1m x 1m x 1.2m)', u: 'Nos', r: 14200, l: 1.0, w: 1.0, d: 1.0 },
  ];

  return Array.from({ length: 18 }, (_, i) => {
    const act = activities[i % activities.length];
    const calcQty = Number((act.l * act.w * act.d).toFixed(2));
    const calcAmt = Math.round(calcQty * act.r);
    const day = String((i % 24) + 1).padStart(2, '0');

    return {
      mbNumber: 'MJP/MAV/MB-2024-05',
      pageNumber: i + 1,
      projectId: 'MPL-1038',
      workDescription: 'Drinking Water Supply Distribution Pipeline, Maval',
      measurementDate: `${day}-01-2024`,
      location: `Maval Taluka Hill Alignment Ch ${(i * 250)}+00`,
      itemActivity: act.name,
      length: act.l,
      width: act.w,
      depthHeight: act.d,
      unit: act.u,
      calculatedQuantity: calcQty,
      approvedQuantity: calcQty * 1.05,
      ratePerUnit: act.r,
      calculatedAmount: calcAmt,
      engineerName: 'Er. S. M. Jadhav',
      engineerId: 'ENG-MJP-308',
      contractorName: 'Shree Samarth Constructions',
      workOrderNumber: 'MJP/MAV/WS/2023/305',
      gpsLatitude: 18.7542 + (i * 0.001),
      gpsLongitude: 73.5411 + (i * 0.001),
      photoEvidenceId: `EVD-SMR-${String(i + 1).padStart(4, '0')}`,
      verificationStatus: 'AE Check-Measured',
      billNumber: `MJP-RA-${Math.floor(i / 6) + 1}`,
      billAmount: calcAmt,
      remarks: 'Hydrostatic pressure test passed at 6.0 kg/sq.cm.',
      groundTruth: 'NORMAL',
      anomalyType: 'NONE',
    };
  });
}

function generatePragatiRecords(): SyntheticMBookRecord[] {
  const activities = [
    { name: 'Levelling course M-15 concrete under precast box culvert', u: 'cu.m', r: 4600, l: 14.0, w: 4.5, d: 0.15 },
    { name: 'Erection of Precast RCC Box Culvert segments 2.0m x 2.0m', u: 'RMT', r: 18500, l: 12.0, w: 1.0, d: 1.0 },
    { name: 'Coursed stone masonry in cement mortar 1:4 in return wing walls', u: 'cu.m', r: 3800, l: 8.0, w: 0.8, d: 2.5 },
    { name: 'Reinforced concrete crash barrier & parapet railing on causeway', u: 'RMT', r: 3400, l: 24.0, w: 1.0, d: 1.0 },
  ];

  return Array.from({ length: 24 }, (_, i) => {
    const act = activities[i % activities.length];
    const calcQty = Number((act.l * act.w * act.d).toFixed(2));
    const calcAmt = Math.round(calcQty * act.r);
    const day = String((i % 25) + 1).padStart(2, '0');

    return {
      mbNumber: 'MSRDC/THA/MB-2024-22',
      pageNumber: i + 1,
      projectId: 'MPL-3012',
      workDescription: 'Precast RCC Box Culvert & Causeways, Thane-Murbad Link',
      measurementDate: `${day}-02-2024`,
      location: `Thane-Murbad Link Rd Km ${(i % 6) + 12}.400`,
      itemActivity: act.name,
      length: act.l,
      width: act.w,
      depthHeight: act.d,
      unit: act.u,
      calculatedQuantity: calcQty,
      approvedQuantity: calcQty * 1.08,
      ratePerUnit: act.r,
      calculatedAmount: calcAmt,
      engineerName: 'Er. V. N. Pawar',
      engineerId: 'ENG-MSRDC-441',
      contractorName: 'Pragati Engineers & Planners',
      workOrderNumber: 'MSRDC/THA/RD/2023/771',
      gpsLatitude: 19.2512 + (i * 0.0005),
      gpsLongitude: 73.1894 + (i * 0.0005),
      photoEvidenceId: `EVD-PRG-${String(i + 1).padStart(4, '0')}`,
      verificationStatus: 'Passed for Payment',
      billNumber: `MSRDC-BILL-${Math.floor(i / 8) + 1}`,
      billAmount: calcAmt,
      remarks: 'Precast curing certificates and load deflection testing approved.',
      groundTruth: 'NORMAL',
      anomalyType: 'NONE',
    };
  });
}

// Map company id to initial dataset
export const INITIAL_COMPANY_DATASETS: Record<string, SyntheticMBookRecord[]> = {
  'comp-abc': [...SYNTHETIC_MBOOK_RECORDS],
  'comp-apex': generateApexRecords(),
  'comp-sahyadri': generateSahyadriRecords(),
  'comp-deccan': generateDeccanRecords(),
  'comp-vanguard': generateVanguardRecords(),
  'comp-samarth': generateSamarthRecords(),
  'comp-pragati': generatePragatiRecords(),
};
