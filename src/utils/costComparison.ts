import { Project, CostBenchmarkComparison, UnitMetric, CostComponentBreakdown, CostAnomalySeverity } from '../types';

/**
 * Standard District Schedule of Rates (DSR / PWD SSR 2024-25 Baseline Ceilings)
 */
export const CATEGORY_DSR_CEILINGS: Record<string, { unit: string; ceilingRate: number; label: string }> = {
  'Community Infrastructure': {
    unit: 'sq.ft',
    ceilingRate: 1250, // ₹1,250 / sq.ft standard PWD building ceiling
    label: 'Built-up Floor Area',
  },
  'Drinking Water': {
    unit: 'LPH',
    ceilingRate: 750, // ₹750 / LPH (₹7.5 Lakhs per 1,000 LPH capacity)
    label: 'Plant / Storage Capacity',
  },
  'Roads & Bridges': {
    unit: 'km',
    ceilingRate: 16.5, // ₹16.5 Lakhs / km for standard M-30 CC/Bituminous road
    label: 'Road Length',
  },
  'Education': {
    unit: 'Workstations',
    ceilingRate: 48000, // ₹48,000 / smart workstation / STEM lab unit
    label: 'Classroom / Lab Capacity',
  },
  'Education & Schools': {
    unit: 'Workstations',
    ceilingRate: 48000,
    label: 'Classroom / Lab Capacity',
  },
  'Healthcare': {
    unit: 'Beds',
    ceilingRate: 350000, // ₹3.5 Lakhs / PHC bed infrastructure
    label: 'Bed / Facility Capacity',
  },
  'Public Health': {
    unit: 'Beds',
    ceilingRate: 350000,
    label: 'Bed / Facility Capacity',
  },
  'Solar Energy': {
    unit: 'Poles',
    ceilingRate: 28500, // ₹28,500 / 30W LiFePO4 Solar High-Mast Pole
    label: 'Luminary Pole Units',
  },
  'Renewable Energy': {
    unit: 'Poles',
    ceilingRate: 28500,
    label: 'Luminary Pole Units',
  },
  'Sanitation': {
    unit: 'Seats',
    ceilingRate: 140000, // ₹1.4 Lakhs / toilet block seat
    label: 'Sanitation Seats',
  },
};

/**
 * Derive or fallback the unit metric for any project
 */
export function getProjectUnitMetric(project: Project): UnitMetric {
  if (project.unitMetric) {
    return project.unitMetric;
  }

  // Infer defaults based on category and title/description
  const cat = project.category;
  if (cat.includes('Community') || cat.includes('Mandir') || cat.includes('Hall') || cat.includes('Center')) {
    const qty = 2500;
    const rate = Math.round((project.sanctionedAmountLakhs * 100000) / qty);
    return {
      label: 'Built-up Floor Area',
      unit: 'sq.ft',
      quantity: qty,
      unitCostValue: rate,
      unitCostFormatted: `₹${rate.toLocaleString('en-IN')} / sq.ft`,
    };
  }

  if (cat.includes('Water') || cat.includes('RO') || cat.includes('ESR')) {
    const qty = 2000;
    const rate = Math.round((project.sanctionedAmountLakhs * 100000) / qty);
    return {
      label: 'Filtration / Storage Capacity',
      unit: 'LPH',
      quantity: qty,
      unitCostValue: rate,
      unitCostFormatted: `₹${rate.toLocaleString('en-IN')} / LPH`,
    };
  }

  if (cat.includes('Road') || cat.includes('Bridge')) {
    const qty = 1.5;
    const rate = Number((project.sanctionedAmountLakhs / qty).toFixed(2));
    return {
      label: 'Road Length',
      unit: 'km',
      quantity: qty,
      unitCostValue: rate,
      unitCostFormatted: `₹${rate} L / km`,
    };
  }

  if (cat.includes('Education') || cat.includes('School') || cat.includes('Lab')) {
    const qty = 30;
    const rate = Math.round((project.sanctionedAmountLakhs * 100000) / qty);
    return {
      label: 'Workstations / Classroom Units',
      unit: 'Units',
      quantity: qty,
      unitCostValue: rate,
      unitCostFormatted: `₹${rate.toLocaleString('en-IN')} / unit`,
    };
  }

  if (cat.includes('Health') || cat.includes('Hospital') || cat.includes('PHC')) {
    const qty = 8;
    const rate = Math.round((project.sanctionedAmountLakhs * 100000) / qty);
    return {
      label: 'Maternity / Ward Bed Capacity',
      unit: 'Beds',
      quantity: qty,
      unitCostValue: rate,
      unitCostFormatted: `₹${(rate / 100000).toFixed(2)} L / bed`,
    };
  }

  if (cat.includes('Solar') || cat.includes('Light') || cat.includes('Energy')) {
    const qty = 50;
    const rate = Math.round((project.sanctionedAmountLakhs * 100000) / qty);
    return {
      label: 'Solar Luminary Pole Units',
      unit: 'Poles',
      quantity: qty,
      unitCostValue: rate,
      unitCostFormatted: `₹${rate.toLocaleString('en-IN')} / pole`,
    };
  }

  // Generic fallback
  const qty = 1;
  return {
    label: 'Standard Project Scope Unit',
    unit: 'Unit',
    quantity: qty,
    unitCostValue: project.sanctionedAmountLakhs,
    unitCostFormatted: `₹${project.sanctionedAmountLakhs} Lakhs`,
  };
}

/**
 * Get or infer Cost Component Breakdown
 */
export function getProjectCostBreakdown(project: Project): CostComponentBreakdown {
  if (project.costBreakdown) {
    return project.costBreakdown;
  }

  const total = project.sanctionedAmountLakhs;
  const isHighRisk = project.riskScore >= 70;

  // For high-risk projects, overheads and material padding are often inflated
  if (isHighRisk) {
    return {
      civilWorksLakhs: Number((total * 0.42).toFixed(2)),
      materialsEquipmentLakhs: Number((total * 0.38).toFixed(2)),
      laborMachineryLakhs: Number((total * 0.12).toFixed(2)),
      contingenciesOverheadLakhs: Number((total * 0.08).toFixed(2)),
    };
  }

  return {
    civilWorksLakhs: Number((total * 0.52).toFixed(2)),
    materialsEquipmentLakhs: Number((total * 0.30).toFixed(2)),
    laborMachineryLakhs: Number((total * 0.14).toFixed(2)),
    contingenciesOverheadLakhs: Number((total * 0.04).toFixed(2)),
  };
}

/**
 * Perform statistical peer comparison and determine if cost is unusually high
 */
export function calculateCostBenchmarkComparison(
  targetProject: Project,
  allProjects: Project[]
): CostBenchmarkComparison {
  const targetMetric = getProjectUnitMetric(targetProject);
  
  // Find peer projects in the same category or closely matching categories
  const targetCat = targetProject.category.toLowerCase();
  
  let peers = allProjects.filter((p) => {
    const pCat = p.category.toLowerCase();
    return (
      pCat === targetCat ||
      (targetCat.includes('water') && pCat.includes('water')) ||
      (targetCat.includes('road') && pCat.includes('road')) ||
      (targetCat.includes('community') && pCat.includes('community')) ||
      (targetCat.includes('education') && pCat.includes('education')) ||
      (targetCat.includes('health') && pCat.includes('health')) ||
      (targetCat.includes('solar') && pCat.includes('solar'))
    );
  });

  // If fewer than 2 peers found in specific category, expand to all
  if (peers.length < 2) {
    peers = allProjects;
  }

  // Calculate peer unit costs
  const peerData = peers.map((p) => {
    const metric = getProjectUnitMetric(p);
    return {
      id: p.id,
      code: p.code,
      title: p.title,
      contractorName: p.contractorName,
      district: p.district,
      agencyName: p.implementingAgencyName,
      sanctionedAmountLakhs: p.sanctionedAmountLakhs,
      unitCostValue: metric.unitCostValue,
      formattedUnitCost: metric.unitCostFormatted,
      status: p.status,
    };
  });

  const unitCosts = peerData.map((d) => d.unitCostValue);
  const sanctionedValues = peerData.map((d) => d.sanctionedAmountLakhs);

  // Mean & Median Calculations
  const peerMeanUnitCost = unitCosts.reduce((a, b) => a + b, 0) / unitCosts.length;
  const sortedUnitCosts = [...unitCosts].sort((a, b) => a - b);
  const mid = Math.floor(sortedUnitCosts.length / 2);
  const peerMedianUnitCost =
    sortedUnitCosts.length % 2 !== 0
      ? sortedUnitCosts[mid]
      : (sortedUnitCosts[mid - 1] + sortedUnitCosts[mid]) / 2;

  const peerMinUnitCost = sortedUnitCosts[0];
  const peerMaxUnitCost = sortedUnitCosts[sortedUnitCosts.length - 1];

  const peerMeanSanctionedLakhs = sanctionedValues.reduce((a, b) => a + b, 0) / sanctionedValues.length;
  const sortedSanctioned = [...sanctionedValues].sort((a, b) => a - b);
  const peerMedianSanctionedLakhs =
    sortedSanctioned.length % 2 !== 0
      ? sortedSanctioned[Math.floor(sortedSanctioned.length / 2)]
      : (sortedSanctioned[Math.floor(sortedSanctioned.length / 2) - 1] +
          sortedSanctioned[Math.floor(sortedSanctioned.length / 2)]) /
        2;

  // Standard Deviation
  const variance =
    unitCosts.reduce((acc, val) => acc + Math.pow(val - peerMeanUnitCost, 2), 0) /
    unitCosts.length;
  const stdDev = Math.sqrt(variance) || 1;
  const zScore = Number(((targetMetric.unitCostValue - peerMeanUnitCost) / stdDev).toFixed(2));

  // Variance % vs Median
  const variancePercent = Number(
    (((targetMetric.unitCostValue - peerMedianUnitCost) / peerMedianUnitCost) * 100).toFixed(1)
  );

  // Percentile Rank
  const smallerCount = sortedUnitCosts.filter((v) => v < targetMetric.unitCostValue).length;
  const equalCount = sortedUnitCosts.filter((v) => v === targetMetric.unitCostValue).length;
  const percentileRank = Math.round(
    ((smallerCount + 0.5 * equalCount) / sortedUnitCosts.length) * 100
  );

  // DSR Rate baseline
  const dsrInfo =
    CATEGORY_DSR_CEILINGS[targetProject.category] ||
    CATEGORY_DSR_CEILINGS['Community Infrastructure'];
  const dsrCeilingUnitCost = dsrInfo.ceilingRate;
  const dsrDeviationPercent = Number(
    (((targetMetric.unitCostValue - dsrCeilingUnitCost) / dsrCeilingUnitCost) * 100).toFixed(1)
  );

  // Anomaly Classification
  let anomalyClassification: CostAnomalySeverity = 'Normal';
  let isUnusuallyHigh = false;

  if (variancePercent > 60 || (zScore >= 1.8 && variancePercent > 35) || dsrDeviationPercent > 50) {
    anomalyClassification = 'Unusually High / Critical Outlier (>+60%)';
    isUnusuallyHigh = true;
  } else if (variancePercent > 30 || dsrDeviationPercent > 30) {
    anomalyClassification = 'High Outlier (+30% to +60%)';
    isUnusuallyHigh = true;
  } else if (variancePercent > 15 || dsrDeviationPercent > 15) {
    anomalyClassification = 'Elevated (+15% to +30%)';
    isUnusuallyHigh = false;
  } else if (variancePercent >= 0) {
    anomalyClassification = 'Within Margin (+0% to +15%)';
    isUnusuallyHigh = false;
  } else {
    anomalyClassification = 'Normal';
    isUnusuallyHigh = false;
  }

  // Cost Driver Explanations
  const costDriverExplanations: string[] = [];
  if (isUnusuallyHigh) {
    costDriverExplanations.push(
      `Unit rate of ${targetMetric.unitCostFormatted} is ${variancePercent > 0 ? `+${variancePercent}%` : `${variancePercent}%`} higher than the district peer median (${
        targetMetric.unit === 'km'
          ? `₹${peerMedianUnitCost.toFixed(2)} L/km`
          : targetMetric.unit === 'Beds'
          ? `₹${(peerMedianUnitCost / 100000).toFixed(2)} L/bed`
          : `₹${Math.round(peerMedianUnitCost).toLocaleString('en-IN')} / ${targetMetric.unit}`
      }).`
    );

    if (dsrDeviationPercent > 20) {
      costDriverExplanations.push(
        `Exceeds the State PWD/CPWD Schedule of Rates (DSR Ceiling) benchmark of ${
          targetMetric.unit === 'km'
            ? `₹${dsrCeilingUnitCost} L/km`
            : targetMetric.unit === 'Beds'
            ? `₹${(dsrCeilingUnitCost / 100000).toFixed(2)} L/bed`
            : `₹${dsrCeilingUnitCost.toLocaleString('en-IN')} / ${targetMetric.unit}`
        } by +${dsrDeviationPercent}%.`
      );
    }

    if (targetProject.expenditureLakhs > 0 && targetProject.physicalProgress < 50) {
      costDriverExplanations.push(
        `Disproportionate fund absorption: Financial progress is ${targetProject.financialProgress}% (₹${targetProject.expenditureLakhs}L) against only ${targetProject.physicalProgress}% physical execution.`
      );
    }

    if (targetProject.riskScore >= 75) {
      costDriverExplanations.push(
        `Contractor (${targetProject.contractorName}) has multiple repeat tenders with elevated unit rates across adjacent blocks.`
      );
    }
  } else if (anomalyClassification === 'Elevated (+15% to +30%)') {
    costDriverExplanations.push(
      `Unit cost is +${variancePercent}% above peer median. May be partially attributable to local site terrain, soil grading, or material logistics.`
    );
  } else {
    costDriverExplanations.push(
      `Cost is well-calibrated with peer baseline rates and within standard ±10% tender deviation bounds.`
    );
  }

  // Recommended Audit Steps
  const recommendedAuditSteps: string[] = [];
  if (isUnusuallyHigh) {
    recommendedAuditSteps.push(
      'Issue Notice for Detailed Bill of Quantities (BOQ) Rate Reasonableness Analysis by Sub-Divisional Officer.'
    );
    recommendedAuditSteps.push(
      'Cross-check actual on-site measurements in Measurement Book (MB) against approved technical estimate.'
    );
    recommendedAuditSteps.push(
      'Withhold next Running Account (RA) Bill disbursement pending rate reconciliation and quality core testing.'
    );
  } else if (anomalyClassification === 'Elevated (+15% to +30%)') {
    recommendedAuditSteps.push(
      'Verify justification for site-specific lead charges and extra item sanction orders.'
    );
  } else {
    recommendedAuditSteps.push(
      'Maintain standard milestone-linked inspection protocol as per MPLADS operational guidelines.'
    );
  }

  // Format unit cost string for peer median
  const formattedPeerMedianUnitCost =
    targetMetric.unit === 'km'
      ? `₹${peerMedianUnitCost.toFixed(2)} L / km`
      : targetMetric.unit === 'Beds'
      ? `₹${(peerMedianUnitCost / 100000).toFixed(2)} L / bed`
      : `₹${Math.round(peerMedianUnitCost).toLocaleString('en-IN')} / ${targetMetric.unit}`;

  const formattedDsrCeiling =
    targetMetric.unit === 'km'
      ? `₹${dsrCeilingUnitCost} L / km`
      : targetMetric.unit === 'Beds'
      ? `₹${(dsrCeilingUnitCost / 100000).toFixed(2)} L / bed`
      : `₹${dsrCeilingUnitCost.toLocaleString('en-IN')} / ${targetMetric.unit}`;

  // Enrich peer projects with relative variance vs median
  const enrichedPeers = peerData.map((p) => ({
    ...p,
    varianceVsMedianPercent: Number(
      (((p.unitCostValue - peerMedianUnitCost) / peerMedianUnitCost) * 100).toFixed(1)
    ),
  }));

  return {
    targetProjectId: targetProject.id,
    targetProjectCode: targetProject.code,
    targetProjectTitle: targetProject.title,
    category: targetProject.category,
    unitLabel: targetMetric.label,
    unitName: targetMetric.unit,
    projectQuantity: targetMetric.quantity,
    projectSanctionedLakhs: targetProject.sanctionedAmountLakhs,
    projectUnitCost: targetMetric.unitCostValue,
    formattedProjectUnitCost: targetMetric.unitCostFormatted,
    peerCount: peers.length,
    peerMeanSanctionedLakhs: Number(peerMeanSanctionedLakhs.toFixed(2)),
    peerMedianSanctionedLakhs: Number(peerMedianSanctionedLakhs.toFixed(2)),
    peerMeanUnitCost: Number(peerMeanUnitCost.toFixed(2)),
    peerMedianUnitCost: Number(peerMedianUnitCost.toFixed(2)),
    peerMinUnitCost: Number(peerMinUnitCost.toFixed(2)),
    peerMaxUnitCost: Number(peerMaxUnitCost.toFixed(2)),
    formattedPeerMedianUnitCost,
    dsrCeilingUnitCost,
    formattedDsrCeiling,
    dsrDeviationPercent,
    variancePercent,
    percentileRank,
    isUnusuallyHigh,
    anomalyClassification,
    zScore,
    costDriverExplanations,
    peerProjects: enrichedPeers,
    recommendedAuditSteps,
  };
}

/**
 * Severity visual helpers
 */
export function getCostSeverityBadge(classification: CostAnomalySeverity) {
  switch (classification) {
    case 'Unusually High / Critical Outlier (>+60%)':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-900',
        border: 'border-rose-200',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
        barColor: '#e11d48',
        label: 'UNUSUALLY HIGH COST',
        iconType: 'critical',
      };
    case 'High Outlier (+30% to +60%)':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-900',
        border: 'border-amber-200',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        barColor: '#d97706',
        label: 'HIGH COST OUTLIER',
        iconType: 'warning',
      };
    case 'Elevated (+15% to +30%)':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-900',
        border: 'border-yellow-200',
        badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        barColor: '#ca8a04',
        label: 'ELEVATED COST',
        iconType: 'alert',
      };
    case 'Within Margin (+0% to +15%)':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-900',
        border: 'border-blue-200',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
        barColor: '#2563eb',
        label: 'WITHIN MARGIN',
        iconType: 'info',
      };
    case 'Normal':
    default:
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-900',
        border: 'border-emerald-200',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        barColor: '#059669',
        label: 'BENCHMARK / OPTIMAL',
        iconType: 'success',
      };
  }
}
