/**
 * Graph Data Builder for SATARK-MPLADS Contractor Network Intelligence
 */

import {
  Contractor,
  Project,
  ImplementingAgency,
  LocationDistrict,
  GraphNode,
  GraphLink,
  NodeType,
} from '../types';
import { MOCK_DISTRICTS } from '../data/mockData';

export interface BuildGraphOptions {
  contractors: Contractor[];
  projects: Project[];
  agencies: ImplementingAgency[];
  districts?: LocationDistrict[];
  selectedDistrict?: string;
  selectedCategory?: string;
  selectedContractorId?: string | null;
  searchQuery?: string;
  minRiskScore?: number;
  enabledNodeTypes?: NodeType[];
  expandedNodeIds?: string[] | Set<string>;
}

export function buildGraphData(options: BuildGraphOptions): {
  nodes: GraphNode[];
  links: GraphLink[];
} {
  const {
    contractors,
    projects,
    agencies,
    districts = MOCK_DISTRICTS,
    selectedDistrict = 'all',
    selectedCategory = 'all',
    selectedContractorId = null,
    searchQuery = '',
    minRiskScore = 0,
    enabledNodeTypes = ['contractor', 'project', 'agency', 'location'],
    expandedNodeIds = [],
  } = options;

  const expandedSet =
    expandedNodeIds instanceof Set
      ? expandedNodeIds
      : new Set<string>(expandedNodeIds);

  const nodesMap = new Map<string, GraphNode>();
  const linksMap = new Map<string, GraphLink>();

  const isTypeEnabled = (type: NodeType) => enabledNodeTypes.includes(type);

  // Filter contractors
  const filteredContractors = contractors.filter((c) => {
    if (minRiskScore > 0 && c.riskScore < minRiskScore) {
      return false;
    }
    if (
      selectedDistrict !== 'all' &&
      !c.districts.includes(selectedDistrict) &&
      c.registeredDistrict !== selectedDistrict
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchCode = c.code.toLowerCase().includes(q);
      const matchDist = c.districts.some((d) => d.toLowerCase().includes(q));
      if (!matchName && !matchCode && !matchDist) return false;
    }
    return true;
  });

  // Always include selected contractor even if filters exclude it
  const effectiveContractors = [...filteredContractors];
  if (
    selectedContractorId &&
    !effectiveContractors.some((c) => c.id === selectedContractorId)
  ) {
    const sel = contractors.find((c) => c.id === selectedContractorId);
    if (sel) effectiveContractors.push(sel);
  }

  // 1. Add Contractor Nodes (🟣)
  if (isTypeEnabled('contractor')) {
    effectiveContractors.forEach((c) => {
      const isSelected = c.id === selectedContractorId;
      const isCritical = c.riskLevel === 'critical';
      const isHigh = c.riskLevel === 'high';

      nodesMap.set(c.id, {
        id: c.id,
        entityId: c.id,
        label: c.name,
        subLabel: `${c.totalProjects} Works • ₹${(c.totalSanctionedAmount / 100).toFixed(1)} Cr`,
        type: 'contractor',
        radius: isSelected ? 28 : isCritical ? 25 : isHigh ? 23 : 20,
        color: '#8b5cf6', // Vibrant Purple
        secondaryColor: '#c4b5fd',
        riskLevel: c.riskLevel,
        riskScore: c.riskScore,
        data: c,
        expanded: expandedSet.has(c.id) || isSelected,
        connectedCount: c.totalProjects,
      });
    });
  }

  // 2. Add Project Nodes & Links (🔵)
  const visibleProjects = projects.filter((p) => {
    // Check contractor visibility
    const isContractorVisible = nodesMap.has(p.contractorId);
    if (!isContractorVisible) return false;

    // Check project filters
    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }
    if (selectedDistrict !== 'all' && p.district !== selectedDistrict) {
      return false;
    }
    if (minRiskScore > 0 && p.riskScore < minRiskScore) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = p.code.toLowerCase().includes(q);
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchContractor = p.contractorName.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchContractor) return false;
    }
    return true;
  });

  if (isTypeEnabled('project')) {
    visibleProjects.forEach((p) => {
      // Check if project should be rendered (always if contractor is selected or expanded, or high risk)
      const contractorNode = nodesMap.get(p.contractorId);
      const shouldRender =
        contractorNode?.expanded ||
        p.contractorId === selectedContractorId ||
        effectiveContractors.length <= 2 ||
        p.riskLevel === 'critical' ||
        p.riskLevel === 'high';

      if (shouldRender) {
        nodesMap.set(p.id, {
          id: p.id,
          entityId: p.id,
          label: p.code,
          subLabel:
            p.title.length > 24 ? p.title.substring(0, 22) + '…' : p.title,
          type: 'project',
          radius:
            p.riskLevel === 'critical' ? 18 : p.riskLevel === 'high' ? 16 : 14,
          color: '#3b82f6', // Electric Blue
          secondaryColor: '#93c5fd',
          riskLevel: p.riskLevel,
          riskScore: p.riskScore,
          data: p,
          expanded: expandedSet.has(p.id),
          connectedCount: 3,
        });

        // Link: Contractor -> Project
        const linkId = `${p.contractorId}-${p.id}`;
        const strength =
          p.sanctionedAmountLakhs > 40
            ? 4
            : p.sanctionedAmountLakhs > 25
            ? 3
            : 2;
        linksMap.set(linkId, {
          id: linkId,
          source: p.contractorId,
          target: p.id,
          strength,
          label: `₹${p.sanctionedAmountLakhs}L`,
          relationshipType: 'contractor_project',
          valueLakhs: p.sanctionedAmountLakhs,
          isFlaggedLink: p.riskLevel === 'critical' || p.riskLevel === 'high',
        });
      }
    });
  }

  // 3. Add Implementing Agency Nodes & Links (🟢)
  if (isTypeEnabled('agency')) {
    agencies.forEach((agency) => {
      // Check if any visible project connects to this agency
      const connectedProjects = Array.from(nodesMap.values()).filter(
        (n) =>
          n.type === 'project' &&
          (n.data as Project).implementingAgencyId === agency.id
      );

      // Or check direct contractor relationship
      const connectedContractors = effectiveContractors.filter((c) =>
        c.agencies.includes(agency.name)
      );

      if (connectedProjects.length > 0 || connectedContractors.length > 0) {
        nodesMap.set(agency.id, {
          id: agency.id,
          entityId: agency.id,
          label: agency.code,
          subLabel:
            agency.name.length > 22
              ? agency.name.substring(0, 20) + '…'
              : agency.name,
          type: 'agency',
          radius: 20,
          color: '#10b981', // Emerald Green
          secondaryColor: '#a7f3d0',
          data: agency,
          connectedCount:
            connectedProjects.length + connectedContractors.length,
        });

        // Project -> Agency links
        connectedProjects.forEach((projNode) => {
          const linkId = `${projNode.id}-${agency.id}`;
          linksMap.set(linkId, {
            id: linkId,
            source: projNode.id,
            target: agency.id,
            strength: 2,
            relationshipType: 'project_agency',
          });
        });

        // If projects aren't rendered for a contractor, create direct Contractor -> Agency link
        connectedContractors.forEach((cont) => {
          if (nodesMap.has(cont.id)) {
            const hasProjectIntermediate = connectedProjects.some(
              (p) => (p.data as Project).contractorId === cont.id
            );
            if (!hasProjectIntermediate) {
              const linkId = `${cont.id}-${agency.id}`;
              linksMap.set(linkId, {
                id: linkId,
                source: cont.id,
                target: agency.id,
                strength: 3,
                label: 'Agency Allocation',
                relationshipType: 'contractor_agency',
                isFlaggedLink: cont.riskFactors.agencyConcentration >= 10,
              });
            }
          }
        });
      }
    });
  }

  // 4. Add District / Location Nodes & Links (🟠)
  if (isTypeEnabled('location')) {
    districts.forEach((dist) => {
      const connectedProjects = Array.from(nodesMap.values()).filter(
        (n) => n.type === 'project' && (n.data as Project).district === dist.name
      );

      const connectedContractors = effectiveContractors.filter((c) =>
        c.districts.includes(dist.name)
      );

      if (connectedProjects.length > 0 || connectedContractors.length > 0) {
        nodesMap.set(dist.id, {
          id: dist.id,
          entityId: dist.id,
          label: `${dist.name} Dist`,
          subLabel: `${dist.totalProjects} Total Works`,
          type: 'location',
          radius: 22,
          color: '#f97316', // Orange
          secondaryColor: '#fed7aa',
          data: dist,
          connectedCount:
            connectedProjects.length + connectedContractors.length,
        });

        // Project -> District links
        connectedProjects.forEach((projNode) => {
          const linkId = `${projNode.id}-${dist.id}`;
          linksMap.set(linkId, {
            id: linkId,
            source: projNode.id,
            target: dist.id,
            strength: 1.5,
            relationshipType: 'project_district',
          });
        });

        // Direct Contractor -> District link if no project link shown
        connectedContractors.forEach((cont) => {
          if (nodesMap.has(cont.id)) {
            const hasProjectIntermediate = connectedProjects.some(
              (p) => (p.data as Project).contractorId === cont.id
            );
            if (!hasProjectIntermediate) {
              const linkId = `${cont.id}-${dist.id}`;
              linksMap.set(linkId, {
                id: linkId,
                source: cont.id,
                target: dist.id,
                strength: 2,
                label: 'District Footprint',
                relationshipType: 'contractor_district',
                isFlaggedLink: cont.riskFactors.geographicConcentration >= 15,
              });
            }
          }
        });
      }
    });
  }

  return {
    nodes: Array.from(nodesMap.values()),
    links: Array.from(linksMap.values()),
  };
}
