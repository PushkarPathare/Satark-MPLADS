/**
 * Interactive Force-Directed Network Graph Visualization
 * SATARK-MPLADS Contractor Network Intelligence
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  Crosshair,
  Lock,
  Unlock,
  Layers,
  Building2,
  FolderGit2,
  Landmark,
  MapPin,
  AlertTriangle,
  Compass,
  GitGraph,
  Sliders,
  Eye,
  EyeOff,
  Search,
  Sparkles,
} from 'lucide-react';
import { GraphNode, GraphLink, NodeType } from '../../types';

export type GraphLayoutMode = 'force' | 'radial' | 'hierarchy' | 'risk';

export interface NetworkGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  selectedNodeId: string | null;
  expandedNodeIds?: string[];
  onSelectNode: (node: GraphNode | null) => void;
  onToggleExpandNode?: (nodeId: string) => void;
  onExpandNode?: (node: GraphNode) => void;
  hoveredNodeId?: string | null;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  nodes,
  links,
  selectedNodeId,
  expandedNodeIds = [],
  onSelectNode,
  onToggleExpandNode,
  onExpandNode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const minimapSvgRef = useRef<SVGSVGElement>(null);

  // Simulation & Zoom Refs
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const currentTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const nodePositionsCache = useRef<Map<string, { x: number; y: number; vx?: number; vy?: number }>>(new Map());

  // UI States
  const [dimensions, setDimensions] = useState({ width: 850, height: 560 });
  const [layoutMode, setLayoutMode] = useState<GraphLayoutMode>('radial');
  const [isPhysicsLocked, setIsPhysicsLocked] = useState(false);
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [hoveredLink, setHoveredLink] = useState<GraphLink | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showLegend, setShowLegend] = useState(true);
  const [showGuideBanner, setShowGuideBanner] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  // Stable callbacks in refs to prevent simulation rebuilds on parent rerenders
  const onSelectNodeRef = useRef(onSelectNode);
  const onToggleExpandNodeRef = useRef(onToggleExpandNode);
  const onExpandNodeRef = useRef(onExpandNode);

  useEffect(() => {
    onSelectNodeRef.current = onSelectNode;
  }, [onSelectNode]);

  useEffect(() => {
    onToggleExpandNodeRef.current = onToggleExpandNode;
    onExpandNodeRef.current = onExpandNode;
  }, [onToggleExpandNode, onExpandNode]);

  // Handle expand action safely
  const triggerExpand = useCallback((node: GraphNode) => {
    if (onToggleExpandNodeRef.current) {
      onToggleExpandNodeRef.current(node.id);
    } else if (onExpandNodeRef.current) {
      onExpandNodeRef.current(node);
    }
  }, []);

  // Resize observer to ensure responsive graph canvas
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 50 && height > 50) {
          setDimensions({ width, height: Math.max(height, 500) });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute Active Neighborhood (Connected Nodes & Links) for selective focus/dimming
  const activeNeighborhood = useMemo(() => {
    const activeId = hoveredNode?.id || selectedNodeId;
    if (!activeId) return null;

    const connectedNodeIds = new Set<string>([activeId]);
    const connectedLinkIds = new Set<string>();

    links.forEach((l) => {
      const srcId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
      const tgtId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;

      if (srcId === activeId || tgtId === activeId) {
        connectedNodeIds.add(srcId);
        connectedNodeIds.add(tgtId);
        connectedLinkIds.add(l.id);
      }
    });

    return { nodeIds: connectedNodeIds, linkIds: connectedLinkIds };
  }, [hoveredNode, selectedNodeId, links]);

  // Main D3 Rendering Effect
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;

    // Clear previous SVG contents
    svg.selectAll('*').remove();

    // Defs: Gradients, Filters, Arrowheads & Glows
    const defs = svg.append('defs');

    // Glow filter for critical nodes & links
    const filterCritical = defs
      .append('filter')
      .attr('id', 'glow-critical')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filterCritical.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMergeCritical = filterCritical.append('feMerge');
    feMergeCritical.append('feMergeNode').attr('in', 'coloredBlur');
    feMergeCritical.append('feMergeNode').attr('in', 'SourceGraphic');

    // Glow filter for selected node
    const filterSelected = defs
      .append('filter')
      .attr('id', 'glow-selected')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filterSelected.append('feGaussianBlur').attr('stdDeviation', '5').attr('result', 'coloredBlur');
    const feMergeSelected = filterSelected.append('feMerge');
    feMergeSelected.append('feMergeNode').attr('in', 'coloredBlur');
    feMergeSelected.append('feMergeNode').attr('in', 'SourceGraphic');

    // Node Type Gradients
    // 1. Contractor (Purple Gradient)
    const gradContractor = defs.append('linearGradient').attr('id', 'grad-contractor').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
    gradContractor.append('stop').attr('offset', '0%').attr('stop-color', '#9333ea');
    gradContractor.append('stop').attr('offset', '100%').attr('stop-color', '#6b21a8');

    // 2. Project (Blue Gradient)
    const gradProject = defs.append('linearGradient').attr('id', 'grad-project').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
    gradProject.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6');
    gradProject.append('stop').attr('offset', '100%').attr('stop-color', '#1d4ed8');

    // 3. Implementing Agency (Emerald Gradient)
    const gradAgency = defs.append('linearGradient').attr('id', 'grad-agency').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
    gradAgency.append('stop').attr('offset', '0%').attr('stop-color', '#10b981');
    gradAgency.append('stop').attr('offset', '100%').attr('stop-color', '#047857');

    // 4. District (Orange Gradient)
    const gradLocation = defs.append('linearGradient').attr('id', 'grad-location').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
    gradLocation.append('stop').attr('offset', '0%').attr('stop-color', '#f97316');
    gradLocation.append('stop').attr('offset', '100%').attr('stop-color', '#c2410c');

    // Root Group for Zoom/Pan
    const rootG = svg.append('g').attr('class', 'network-root-group');

    // Setup Zoom
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 4.5])
      .on('zoom', (event) => {
        currentTransformRef.current = event.transform;
        rootG.attr('transform', event.transform);
        updateMinimapViewport();
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Apply existing zoom transform
    svg.call(zoom.transform, currentTransformRef.current);

    // Prepare simulation nodes & links with position caching
    const simNodes: GraphNode[] = nodes.map((d, index) => {
      const cached = nodePositionsCache.current.get(d.id);
      const isSelected = d.id === selectedNodeId;

      // Smart initial position based on entity type if not cached
      let initialX = width / 2;
      let initialY = height / 2;

      if (cached) {
        initialX = cached.x;
        initialY = cached.y;
      } else {
        if (d.type === 'contractor') {
          const angle = (index / Math.max(nodes.length, 1)) * 2 * Math.PI;
          initialX = width / 2 + Math.cos(angle) * 120;
          initialY = height / 2 + Math.sin(angle) * 120;
        } else if (d.type === 'project') {
          initialX = width / 2 + (Math.random() - 0.5) * 260;
          initialY = height / 2 + (Math.random() - 0.5) * 260;
        } else if (d.type === 'agency') {
          initialX = width / 2 - 220 + (Math.random() - 0.5) * 60;
          initialY = height / 2 + (index % 4 - 1.5) * 80;
        } else {
          initialX = width / 2 + 220 + (Math.random() - 0.5) * 60;
          initialY = height / 2 + (index % 4 - 1.5) * 80;
        }
      }

      return {
        ...d,
        x: initialX,
        y: initialY,
        vx: cached?.vx || 0,
        vy: cached?.vy || 0,
        expanded: expandedNodeIds.includes(d.id) || isSelected,
      };
    });

    const nodeMap = new Map(simNodes.map((n) => [n.id, n]));

    const simLinks: GraphLink[] = links
      .map((l) => {
        const src = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
        const tgt = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
        return {
          ...l,
          source: nodeMap.get(src) || src,
          target: nodeMap.get(tgt) || tgt,
        };
      })
      .filter((l) => typeof l.source === 'object' && typeof l.target === 'object');

    // Layout Specific Target Positioning
    if (layoutMode === 'radial') {
      const centerNode = simNodes.find((n) => n.id === selectedNodeId) || simNodes.find((n) => n.riskLevel === 'critical') || simNodes[0];
      const cx = width / 2;
      const cy = height / 2 + 10;

      // Filter connected entities to centerNode
      const connectedAgencies = simNodes.filter((n) => n.type === 'agency');
      const connectedProjects = simNodes.filter((n) => n.type === 'project');
      const connectedLocations = simNodes.filter((n) => n.type === 'location');
      const otherContractors = simNodes.filter((n) => n.type === 'contractor' && n.id !== centerNode?.id);

      simNodes.forEach((node) => {
        if (centerNode && node.id === centerNode.id) {
          node.fx = cx;
          node.fy = cy;
        } else if (node.type === 'agency') {
          // Position agencies on the LEFT ARC (West)
          const idx = connectedAgencies.indexOf(node);
          const total = Math.max(connectedAgencies.length, 1);
          const angle = Math.PI - 0.7 + (idx / Math.max(total - 1, 1)) * 1.4;
          node.fx = cx + Math.cos(angle) * (Math.min(width, height) * 0.36);
          node.fy = cy + Math.sin(angle) * (Math.min(width, height) * 0.36);
        } else if (node.type === 'project') {
          // Position projects on the RIGHT ARC (East)
          const idx = connectedProjects.indexOf(node);
          const total = Math.max(connectedProjects.length, 1);
          const angle = -0.9 + (idx / Math.max(total - 1, 1)) * 1.8;
          const radiusDist = Math.min(width, height) * (idx % 2 === 0 ? 0.38 : 0.44);
          node.fx = cx + Math.cos(angle) * radiusDist;
          node.fy = cy + Math.sin(angle) * radiusDist;
        } else if (node.type === 'location') {
          // Position locations on the BOTTOM ARC (South)
          const idx = connectedLocations.indexOf(node);
          const total = Math.max(connectedLocations.length, 1);
          const angle = Math.PI / 2 - 0.5 + (idx / Math.max(total - 1, 1)) * 1.0;
          node.fx = cx + Math.cos(angle) * (Math.min(width, height) * 0.42);
          node.fy = cy + Math.sin(angle) * (Math.min(width, height) * 0.42);
        } else {
          // Position other contractors on the TOP ARC (North)
          const idx = otherContractors.indexOf(node);
          const total = Math.max(otherContractors.length, 1);
          const angle = -Math.PI / 2 - 0.6 + (idx / Math.max(total - 1, 1)) * 1.2;
          node.fx = cx + Math.cos(angle) * (Math.min(width, height) * 0.44);
          node.fy = cy + Math.sin(angle) * (Math.min(width, height) * 0.44);
        }
      });
    } else if (layoutMode === 'hierarchy') {
      const agenciesList = simNodes.filter((n) => n.type === 'agency');
      const contractorsList = simNodes.filter((n) => n.type === 'contractor');
      const projectsList = simNodes.filter((n) => n.type === 'project');
      const locationsList = simNodes.filter((n) => n.type === 'location');

      const colSpacing = width / 4.5;
      const startX = (width - colSpacing * 3) / 2;

      agenciesList.forEach((n, i) => {
        n.fx = startX;
        n.fy = (height / (agenciesList.length + 1)) * (i + 1);
      });
      contractorsList.forEach((n, i) => {
        n.fx = startX + colSpacing;
        n.fy = (height / (contractorsList.length + 1)) * (i + 1);
      });
      projectsList.forEach((n, i) => {
        n.fx = startX + colSpacing * 2;
        n.fy = (height / (projectsList.length + 1)) * (i + 1);
      });
      locationsList.forEach((n, i) => {
        n.fx = startX + colSpacing * 3;
        n.fy = (height / (locationsList.length + 1)) * (i + 1);
      });
    } else if (layoutMode === 'risk') {
      const criticalNodes = simNodes.filter((n) => n.riskLevel === 'critical');
      const highNodes = simNodes.filter((n) => n.riskLevel === 'high');
      const modNodes = simNodes.filter((n) => n.riskLevel === 'medium');
      const lowNodes = simNodes.filter((n) => !n.riskLevel || n.riskLevel === 'low');

      const colW = width / 4.2;
      const x0 = (width - colW * 3) / 2;

      criticalNodes.forEach((n, i) => {
        n.fx = x0;
        n.fy = (height / (criticalNodes.length + 1)) * (i + 1);
      });
      highNodes.forEach((n, i) => {
        n.fx = x0 + colW;
        n.fy = (height / (highNodes.length + 1)) * (i + 1);
      });
      modNodes.forEach((n, i) => {
        n.fx = x0 + colW * 2;
        n.fy = (height / (modNodes.length + 1)) * (i + 1);
      });
      lowNodes.forEach((n, i) => {
        n.fx = x0 + colW * 3;
        n.fy = (height / (lowNodes.length + 1)) * (i + 1);
      });
    } else {
      // Force Layout: Clear fixed coordinates if not explicitly locked
      if (!isPhysicsLocked) {
        simNodes.forEach((n) => {
          n.fx = null;
          n.fy = null;
        });
      }
    }

    // Initialize D3 Force Simulation
    const simulation = d3
      .forceSimulation<GraphNode>(simNodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(simLinks)
          .id((d) => d.id)
          .distance((d) => {
            if (d.relationshipType === 'contractor_project') return 85;
            if (d.relationshipType === 'project_agency') return 120;
            if (d.relationshipType === 'project_district') return 130;
            return 150;
          })
          .strength((d) => (d.relationshipType === 'contractor_project' ? 0.45 : 0.25))
      )
      .force('charge', d3.forceManyBody().strength(-420).distanceMax(550))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.06))
      .force(
        'collide',
        d3
          .forceCollide<GraphNode>()
          .radius((d) => d.radius + (d.type === 'contractor' ? 32 : 24))
          .iterations(2)
      )
      .alphaDecay(layoutMode === 'force' ? 0.028 : 0.08);

    simulationRef.current = simulation;

    // SVG Groups Hierarchy
    const linkGroup = rootG.append('g').attr('class', 'network-links-layer');
    const particleGroup = rootG.append('g').attr('class', 'network-particles-layer');
    const linkLabelGroup = rootG.append('g').attr('class', 'network-link-labels-layer');
    const nodeGroup = rootG.append('g').attr('class', 'network-nodes-layer');

    // Helper: Build curved SVG Path string
    const calculateCurvedPath = (d: any) => {
      const sx = d.source.x || 0;
      const sy = d.source.y || 0;
      const tx = d.target.x || 0;
      const ty = d.target.y || 0;

      const dx = tx - sx;
      const dy = ty - sy;
      const dr = Math.sqrt(dx * dx + dy * dy);

      if (dr === 0) return `M ${sx} ${sy} L ${tx} ${ty}`;

      // Subtle curve offset for readability
      const curveOffset = d.isFlaggedLink ? 22 : 12;
      const mx = (sx + tx) / 2 + (-dy / dr) * curveOffset;
      const my = (sy + ty) / 2 + (dx / dr) * curveOffset;

      return `M ${sx} ${sy} Q ${mx} ${my} ${tx} ${ty}`;
    };

    // Render Links (Curved Paths)
    const linkPaths = linkGroup
      .selectAll<SVGPathElement, GraphLink>('path')
      .data(simLinks, (d) => d.id)
      .enter()
      .append('path')
      .attr('class', 'network-edge-path transition-opacity duration-200')
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        if (d.isFlaggedLink) return '#ef4444';
        if (d.relationshipType === 'contractor_project') return '#818cf8';
        if (d.relationshipType === 'project_agency') return '#34d399';
        if (d.relationshipType === 'project_district') return '#fb923c';
        return '#64748b';
      })
      .attr('stroke-width', (d) => {
        if (d.isFlaggedLink) return 2.6;
        if (d.valueLakhs && d.valueLakhs > 35) return 2.8;
        return 1.8;
      })
      .attr('stroke-dasharray', (d) => (d.isFlaggedLink ? '5,4' : d.relationshipType === 'contractor_agency' ? '3,3' : 'none'))
      .attr('stroke-opacity', (d) => (d.isFlaggedLink ? 0.9 : 0.55))
      .on('mouseenter', (event, d) => {
        setHoveredLink(d);
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltipPos({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          });
        }
      })
      .on('mouseleave', () => setHoveredLink(null));

    // Render Flagged Link Particles (Pulse dots indicating signal)
    const flaggedLinks = simLinks.filter((l) => l.isFlaggedLink);
    const particles = particleGroup
      .selectAll<SVGCircleElement, GraphLink>('circle')
      .data(flaggedLinks, (d) => `p-${d.id}`)
      .enter()
      .append('circle')
      .attr('r', 3)
      .attr('fill', '#f87171')
      .attr('filter', 'url(#glow-critical)')
      .attr('opacity', 0.85);

    // Render Link Labels (Pill Badges for financial amounts)
    const linkLabelNodes = linkLabelGroup
      .selectAll<SVGGElement, GraphLink>('g')
      .data(simLinks.filter((l) => Boolean(l.label && showEdgeLabels)), (d) => `lbl-${d.id}`)
      .enter()
      .append('g')
      .attr('class', 'link-label-badge cursor-pointer select-none')
      .attr('opacity', 0.85);

    linkLabelNodes
      .append('rect')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('x', -24)
      .attr('y', -8)
      .attr('width', 48)
      .attr('height', 16)
      .attr('fill', '#ffffff')
      .attr('stroke', (d) => (d.isFlaggedLink ? '#ef4444' : '#cbd5e1'))
      .attr('stroke-width', 1);

    linkLabelNodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '8.5px')
      .attr('font-weight', '700')
      .attr('font-family', 'ui-monospace, monospace')
      .attr('fill', (d) => (d.isFlaggedLink ? '#dc2626' : '#475569'))
      .text((d) => d.label || '');

    // Render Nodes Layer
    const nodeGroups = nodeGroup
      .selectAll<SVGGElement, GraphNode>('g')
      .data(simNodes, (d) => d.id)
      .enter()
      .append('g')
      .attr('class', 'network-node-group cursor-pointer select-none')
      .attr('opacity', 1.0)
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active && !isPhysicsLocked) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active && !isPhysicsLocked) simulation.alphaTarget(0);
            if (!isPhysicsLocked && layoutMode === 'force') {
              d.fx = null;
              d.fy = null;
            }
          })
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        if (onSelectNodeRef.current) {
          onSelectNodeRef.current(d);
        }
      })
      .on('dblclick', (event, d) => {
        event.stopPropagation();
        triggerExpand(d);
      })
      .on('mouseenter', (event, d) => {
        setHoveredNode(d);
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltipPos({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          });
        }
      })
      .on('mousemove', (event) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltipPos({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          });
        }
      })
      .on('mouseleave', () => setHoveredNode(null));

    // Outer Selection / Danger Halo
    nodeGroups
      .append('circle')
      .attr('class', 'node-halo')
      .attr('r', (d) => d.radius + (d.id === selectedNodeId ? 8 : d.riskLevel === 'critical' ? 7 : d.riskLevel === 'high' ? 5 : 0))
      .attr('fill', (d) => {
        if (d.id === selectedNodeId) return '#3b82f6';
        if (d.riskLevel === 'critical') return '#ef4444';
        if (d.riskLevel === 'high') return '#f97316';
        return 'transparent';
      })
      .attr('opacity', (d) => (d.id === selectedNodeId ? 0.35 : d.riskLevel === 'critical' ? 0.3 : d.riskLevel === 'high' ? 0.22 : 0))
      .attr('stroke', (d) => {
        if (d.id === selectedNodeId) return '#60a5fa';
        if (d.riskLevel === 'critical') return '#f87171';
        if (d.riskLevel === 'high') return '#fb923c';
        return 'none';
      })
      .attr('stroke-width', (d) => (d.id === selectedNodeId || d.riskLevel ? 2 : 0))
      .attr('stroke-dasharray', (d) => (d.riskLevel === 'critical' ? '4,3' : 'none'));

    // Base Node Circle with Rich Gradient
    nodeGroups
      .append('circle')
      .attr('class', 'node-core-circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => {
        if (d.type === 'contractor') return 'url(#grad-contractor)';
        if (d.type === 'project') return 'url(#grad-project)';
        if (d.type === 'agency') return 'url(#grad-agency)';
        return 'url(#grad-location)';
      })
      .attr('stroke', (d) => (d.id === selectedNodeId ? '#ffffff' : '#e2e8f0'))
      .attr('stroke-width', (d) => (d.id === selectedNodeId ? 3 : 2))
      .attr('filter', (d) => (d.riskLevel === 'critical' ? 'url(#glow-critical)' : d.id === selectedNodeId ? 'url(#glow-selected)' : 'none'));

    // Glyph / Monogram Icon inside Node
    nodeGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#ffffff')
      .attr('font-size', (d) => (d.radius > 22 ? '12px' : '10px'))
      .attr('font-weight', '800')
      .attr('pointer-events', 'none')
      .text((d) => {
        if (d.type === 'contractor') return 'C';
        if (d.type === 'project') return 'P';
        if (d.type === 'agency') return 'A';
        if (d.type === 'location') return 'L';
        return '•';
      });

    // Expand/Collapse Badge on Contractor Nodes
    const contractorNodes = nodeGroups.filter((d) => d.type === 'contractor');
    const expandPills = contractorNodes
      .append('g')
      .attr('class', 'expand-pill cursor-pointer')
      .attr('transform', (d) => `translate(${d.radius * 0.75}, -${d.radius * 0.75})`)
      .on('click', (event, d) => {
        event.stopPropagation();
        triggerExpand(d);
      });

    expandPills
      .append('rect')
      .attr('x', -10)
      .attr('y', -7)
      .attr('width', 20)
      .attr('height', 14)
      .attr('rx', 7)
      .attr('fill', (d) => (d.expanded ? '#4338ca' : '#1e1b4b'))
      .attr('stroke', '#a5b4fc')
      .attr('stroke-width', 1.2);

    expandPills
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#ffffff')
      .attr('font-size', '8px')
      .attr('font-weight', 'bold')
      .text((d) => (d.expanded ? '−' : `+${d.connectedCount || 0}`));

    // Label Backdrop Pill for perfect contrast and zero text collision
    const labelGroups = nodeGroups.append('g').attr('class', 'node-label-pill');

    labelGroups
      .append('rect')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', '#ffffff')
      .attr('fill-opacity', 0.95)
      .attr('stroke', (d) => (d.id === selectedNodeId ? '#2563eb' : d.riskLevel === 'critical' ? '#ef4444' : '#cbd5e1'))
      .attr('stroke-width', 1);

    const mainTexts = labelGroups
      .append('text')
      .attr('class', 'node-title-text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', (d) => (d.id === selectedNodeId ? '#1d4ed8' : '#0f172a'))
      .attr('font-size', (d) => (d.type === 'contractor' ? '10.5px' : '9.5px'))
      .attr('font-weight', (d) => (d.id === selectedNodeId || d.type === 'contractor' ? '700' : '600'))
      .text((d) => {
        const str = d.label || '';
        return str.length > 20 ? str.substring(0, 18) + '…' : str;
      });

    // Calculate dynamic bounding rect for label background pill
    mainTexts.each(function (this: SVGTextElement, d: GraphNode) {
      const parent = d3.select(this.parentNode as SVGGElement);
      try {
        const bbox = this.getBBox();
        const padding = 5;
        parent
          .select('rect')
          .attr('x', bbox.x - padding)
          .attr('y', bbox.y - 2)
          .attr('width', Math.max(bbox.width + padding * 2, 28))
          .attr('height', Math.max(bbox.height + 4, 14));
      } catch {
        const labelLen = d.label ? d.label.length : 8;
        const estWidth = Math.min(Math.max(labelLen * 6.5 + 10, 34), 140);
        parent
          .select('rect')
          .attr('x', -estWidth / 2)
          .attr('y', -7)
          .attr('width', estWidth)
          .attr('height', 16);
      }
    });

    // Position label pills below node circles
    labelGroups.attr('transform', (d) => `translate(0, ${d.radius + 15})`);

    // Simulation Tick Updates
    let tickCount = 0;
    simulation.on('tick', () => {
      tickCount++;

      // Update link curves
      linkPaths.attr('d', calculateCurvedPath);

      // Update animated pulse particles along flagged curves
      if (tickCount % 2 === 0) {
        particles.each(function (d: any) {
          const sx = d.source.x || 0;
          const sy = d.source.y || 0;
          const tx = d.target.x || 0;
          const ty = d.target.y || 0;

          const progress = ((Date.now() / 1500 + (d.index || 0) * 0.2) % 1);
          const px = sx + (tx - sx) * progress;
          const py = sy + (ty - sy) * progress;

          d3.select(this).attr('cx', px).attr('cy', py);
        });
      }

      // Update link labels position
      linkLabelNodes.attr('transform', (d: any) => {
        const mx = ((d.source.x || 0) + (d.target.x || 0)) / 2;
        const my = ((d.source.y || 0) + (d.target.y || 0)) / 2;
        return `translate(${mx}, ${my})`;
      });

      // Update node positions and cache
      nodeGroups.attr('transform', (d) => {
        const x = d.x || 0;
        const y = d.y || 0;
        nodePositionsCache.current.set(d.id, { x, y, vx: d.vx, vy: d.vy });
        return `translate(${x},${y})`;
      });

      updateMinimapViewport();
    });

    // Deselect when clicking empty canvas
    svg.on('click', () => {
      if (onSelectNodeRef.current) {
        onSelectNodeRef.current(null);
      }
    });

    return () => {
      simulation.stop();
    };
  }, [
    nodes,
    links,
    selectedNodeId,
    expandedNodeIds,
    dimensions,
    layoutMode,
    isPhysicsLocked,
    showEdgeLabels,
    triggerExpand,
  ]);

  // Fast Hover Opacity update without tearing down the simulation or canvas
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    if (!activeNeighborhood) {
      svg.selectAll<SVGGElement, GraphNode>('.network-node-group').attr('opacity', 1.0);
      svg.selectAll<SVGPathElement, GraphLink>('.network-edge-path').attr('stroke-opacity', (d) => (d.isFlaggedLink ? 0.9 : 0.55));
      svg.selectAll<SVGGElement, GraphLink>('.link-label-badge').attr('opacity', 0.85);
    } else {
      svg.selectAll<SVGGElement, GraphNode>('.network-node-group').attr('opacity', (d) =>
        activeNeighborhood.nodeIds.has(d.id) ? 1.0 : 0.15
      );
      svg.selectAll<SVGPathElement, GraphLink>('.network-edge-path').attr('stroke-opacity', (d) =>
        activeNeighborhood.linkIds.has(d.id) ? (d.isFlaggedLink ? 1.0 : 0.8) : 0.08
      );
      svg.selectAll<SVGGElement, GraphLink>('.link-label-badge').attr('opacity', (d) =>
        activeNeighborhood.linkIds.has(d.id) ? 1.0 : 0.1
      );
    }
  }, [activeNeighborhood]);

  // Minimap Realtime Update
  const updateMinimapViewport = useCallback(() => {
    if (!minimapSvgRef.current || !containerRef.current) return;
    const miniSvg = d3.select(minimapSvgRef.current);
    miniSvg.selectAll('*').remove();

    const { width, height } = dimensions;
    const miniW = 140;
    const miniH = 90;

    // Bounds of all nodes
    const nodeCoords: { x: number; y: number }[] = Array.from(nodePositionsCache.current.values());
    if (nodeCoords.length === 0) return;

    const minX = Math.min(...nodeCoords.map((n) => n.x), 0) - 50;
    const maxX = Math.max(...nodeCoords.map((n) => n.x), width) + 50;
    const minY = Math.min(...nodeCoords.map((n) => n.y), 0) - 50;
    const maxY = Math.max(...nodeCoords.map((n) => n.y), height) + 50;

    const scaleX = miniW / (maxX - minX || 1);
    const scaleY = miniH / (maxY - minY || 1);
    const scale = Math.min(scaleX, scaleY);

    // Draw mini nodes
    nodeCoords.forEach((n) => {
      miniSvg
        .append('circle')
        .attr('cx', (n.x - minX) * scale)
        .attr('cy', (n.y - minY) * scale)
        .attr('r', 2)
        .attr('fill', '#818cf8');
    });

    // Draw current viewport rectangle
    const transform = currentTransformRef.current;
    const vpX = (-transform.x - minX) * scale / transform.k;
    const vpY = (-transform.y - minY) * scale / transform.k;
    const vpW = (width * scale) / transform.k;
    const vpH = (height * scale) / transform.k;

    miniSvg
      .append('rect')
      .attr('x', Math.max(0, vpX))
      .attr('y', Math.max(0, vpY))
      .attr('width', Math.min(miniW, vpW))
      .attr('height', Math.min(miniH, vpH))
      .attr('fill', '#3b82f6')
      .attr('fill-opacity', 0.2)
      .attr('stroke', '#60a5fa')
      .attr('stroke-width', 1);
  }, [dimensions]);

  // Fit All Nodes to Screen View
  const handleFitToScreen = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current || nodes.length === 0) return;

    const nodeCoords: { x: number; y: number }[] = Array.from(nodePositionsCache.current.values());
    if (nodeCoords.length === 0) return;

    const minX = Math.min(...nodeCoords.map((n) => n.x));
    const maxX = Math.max(...nodeCoords.map((n) => n.x));
    const minY = Math.min(...nodeCoords.map((n) => n.y));
    const maxY = Math.max(...nodeCoords.map((n) => n.y));

    const graphWidth = maxX - minX + 120;
    const graphHeight = maxY - minY + 120;
    const { width, height } = dimensions;

    const scale = Math.min(Math.max(0.25, Math.min(width / graphWidth, height / graphHeight)), 1.8);
    const translateX = width / 2 - scale * ((minX + maxX) / 2);
    const translateY = height / 2 - scale * ((minY + maxY) / 2);

    d3.select(svgRef.current)
      .transition()
      .duration(750)
      .ease(d3.easeCubicOut)
      .call(
        zoomBehaviorRef.current.transform,
        d3.zoomIdentity.translate(translateX, translateY).scale(scale)
      );
  }, [nodes, dimensions]);

  // Center on Selected Node
  const handleCenterSelected = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current || !selectedNodeId) return;
    const pos = nodePositionsCache.current.get(selectedNodeId);
    if (!pos) return;

    const { width, height } = dimensions;
    const scale = 1.35;
    const translate = [width / 2 - scale * pos.x, height / 2 - scale * pos.y];

    d3.select(svgRef.current)
      .transition()
      .duration(700)
      .ease(d3.easeCubicOut)
      .call(
        zoomBehaviorRef.current.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
  }, [selectedNodeId, dimensions]);

  // Zoom Controls
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 0.77);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(500)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  const togglePhysicsLock = () => {
    setIsPhysicsLocked((prev) => {
      const next = !prev;
      if (simulationRef.current) {
        if (next) {
          simulationRef.current.stop();
        } else {
          simulationRef.current.alpha(0.3).restart();
        }
      }
      return next;
    });
  };

  // Dynamic Narrative text for current selection
  const activeNarrative = useMemo(() => {
    if (!selectedNodeId) {
      return '💡 Tip: Click any circle (🟣 Contractor, 🔵 Project, 🟢 Agency, 🟠 District) to isolate its connection web.';
    }
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (!node) return 'Click any circle to isolate its connection web.';
    if (node.type === 'contractor') {
      const connectedLinks = links.filter((l) => {
        const src = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
        const tgt = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
        return src === node.id || tgt === node.id;
      });
      return `Focused on Contractor ${node.label} (${node.subLabel || ''}): ${connectedLinks.length} active connections in network.`;
    }
    if (node.type === 'project') {
      return `Focused on Project ${node.label}: ${node.subLabel || ''}. Click photos icon in profile to see evidence.`;
    }
    if (node.type === 'agency') {
      return `Focused on Implementing Agency ${node.label}: ${node.subLabel || ''}.`;
    }
    return `Focused on District ${node.label}: ${node.subLabel || ''}.`;
  }, [selectedNodeId, nodes, links]);

  // Search in Graph
  const matchingNodeCount = useMemo(() => {
    if (!searchFilter.trim()) return 0;
    const q = searchFilter.toLowerCase();
    return nodes.filter(
      (n) => n.label.toLowerCase().includes(q) || (n.subLabel && n.subLabel.toLowerCase().includes(q))
    ).length;
  }, [searchFilter, nodes]);

  return (
    <div
      ref={containerRef}
      id="contractor-network-graph-container"
      className={`relative w-full bg-white rounded-xl border border-slate-200 overflow-hidden select-none shadow-sm transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-full min-h-[550px]'
      }`}
    >
      {/* Background Dot Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Primary Interactive SVG Canvas */}
      <svg
        ref={svgRef}
        id="satark-network-svg-canvas"
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Floating Control Bar (Layout Switcher & Controls) */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        {/* Left Side: Layout Modes */}
        <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-lg border border-slate-200 shadow-md text-xs">
          <span className="px-2 py-1 text-slate-500 font-semibold flex items-center gap-1 text-[11px]">
            <GitGraph className="w-3.5 h-3.5 text-blue-600" />
            Layout:
          </span>

          <button
            id="layout-mode-radial"
            onClick={() => setLayoutMode('radial')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              layoutMode === 'radial'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Crosshair className="w-3 h-3" />
            Clean Orbit (Simple)
          </button>

          <button
            id="layout-mode-force"
            onClick={() => setLayoutMode('force')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              layoutMode === 'force'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3 h-3" />
            Free Web
          </button>

          <button
            id="layout-mode-hierarchy"
            onClick={() => setLayoutMode('hierarchy')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              layoutMode === 'hierarchy'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3 h-3" />
            Flow Columns
          </button>

          <button
            id="layout-mode-risk"
            onClick={() => setLayoutMode('risk')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              layoutMode === 'risk'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            Risk Tiers
          </button>
        </div>

        {/* Right Side: Zoom & Quick Action Tools */}
        <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-lg border border-slate-200 shadow-md text-xs">
          {/* Edge Labels Toggle */}
          <button
            onClick={() => setShowEdgeLabels(!showEdgeLabels)}
            title={showEdgeLabels ? 'Hide Link Values' : 'Show Link Values'}
            className={`p-1.5 rounded transition-colors ${
              showEdgeLabels ? 'text-blue-600 bg-blue-50 border border-blue-200' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {showEdgeLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <div className="w-px h-4 bg-slate-200 mx-0.5" />

          <button
            id="btn-fit-screen"
            onClick={handleFitToScreen}
            title="Auto-Fit Graph to Screen"
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            id="btn-zoom-in"
            onClick={handleZoomIn}
            title="Zoom In (+)"
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            id="btn-zoom-out"
            onClick={handleZoomOut}
            title="Zoom Out (-)"
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            id="btn-reset-view"
            onClick={handleResetZoom}
            title="Reset View (100%)"
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {selectedNodeId && (
            <button
              id="btn-center-selection"
              onClick={handleCenterSelected}
              title="Focus on Selected Entity"
              className="p-1.5 text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded transition-colors"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          )}

          <div className="w-px h-4 bg-slate-200 mx-0.5" />

          <button
            id="btn-toggle-physics"
            onClick={togglePhysicsLock}
            title={isPhysicsLocked ? 'Unlock Dynamics' : 'Freeze Positions'}
            className={`p-1.5 rounded transition-colors ${
              isPhysicsLocked ? 'text-amber-700 bg-amber-50 border border-amber-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isPhysicsLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>

          <button
            id="btn-toggle-fullscreen"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Guide Banner for Easy Understanding */}
      {showGuideBanner && (
        <div className="absolute top-14 left-3 right-3 z-10 pointer-events-none">
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-lg border border-slate-200 p-2 text-[11px] text-slate-700 shadow-md flex items-center justify-between gap-2 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                <strong>Quick Guide: </strong>
                🟣 Center Contractor ➔ 🟢 Left: Govt Agencies ➔ 🔵 Right: Ground Works ➔ 🟠 Bottom: Districts.
              </span>
            </div>
            <button
              onClick={() => setShowGuideBanner(false)}
              className="text-slate-400 hover:text-slate-700 text-xs px-1.5 py-0.5 rounded hover:bg-slate-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Bottom Center Dynamic Narrative Bar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none max-w-lg w-full px-4 hidden md:block">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-full border border-slate-200 shadow-lg px-4 py-2 text-xs text-slate-800 text-center flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
          <span className="truncate font-medium">{activeNarrative}</span>
        </div>
      </div>

      {/* Floating Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-lg border border-slate-200 shadow-lg p-2.5 text-xs text-slate-700 max-w-[280px]">
          <div className="flex items-center justify-between gap-4 font-semibold pb-1.5 border-b border-slate-200">
            <span className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Entity Classification
            </span>
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="text-[10px] text-slate-500 hover:text-slate-800 font-medium"
            >
              {showLegend ? 'Collapse' : 'Expand'}
            </button>
          </div>

          {showLegend && (
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-purple-800 border border-purple-300 inline-block shadow-xs" />
                <span className="font-medium text-slate-800">🟣 Contractor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 border border-blue-300 inline-block shadow-xs" />
                <span className="font-medium text-slate-800">🔵 Project</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-800 border border-emerald-300 inline-block shadow-xs" />
                <span className="font-medium text-slate-800">🟢 Agency</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-500 to-orange-800 border border-orange-300 inline-block shadow-xs" />
                <span className="font-medium text-slate-800">🟠 Location</span>
              </div>

              <div className="col-span-2 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-red-500 border-dashed inline-block" /> Flagged Link
                </span>
                <span>Click: Inspect • DblClick: Expand</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Minimap / Radar (Bottom Right) */}
      {showMinimap && (
        <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-md rounded-lg border border-slate-200 shadow-lg p-2 hidden sm:block">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-1">
            <span>Radar View</span>
            <button
              onClick={() => setShowMinimap(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          </div>
          <svg
            ref={minimapSvgRef}
            width={140}
            height={90}
            className="bg-slate-50 rounded border border-slate-200"
          />
        </div>
      )}

      {/* Rich Interactive Tooltip on Node Hover */}
      {hoveredNode && (
        <div
          className="absolute z-30 pointer-events-none bg-white text-slate-900 text-xs p-3 rounded-xl shadow-2xl border border-slate-200 max-w-xs animate-in fade-in duration-100 backdrop-blur-md"
          style={{
            left: `${Math.min(tooltipPos.x + 14, dimensions.width - 260)}px`,
            top: `${Math.min(tooltipPos.y + 14, dimensions.height - 140)}px`,
          }}
        >
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm pb-1 border-b border-slate-100">
            {hoveredNode.type === 'contractor' && <Building2 className="w-4 h-4 text-purple-600 shrink-0" />}
            {hoveredNode.type === 'project' && <FolderGit2 className="w-4 h-4 text-blue-600 shrink-0" />}
            {hoveredNode.type === 'agency' && <Landmark className="w-4 h-4 text-emerald-600 shrink-0" />}
            {hoveredNode.type === 'location' && <MapPin className="w-4 h-4 text-orange-600 shrink-0" />}
            <span className="truncate">{hoveredNode.label}</span>
          </div>

          <p className="text-slate-600 text-[11px] mt-1.5 leading-relaxed">{hoveredNode.subLabel}</p>

          {hoveredNode.riskScore !== undefined && (
            <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 text-[10px]">Risk Index:</span>
              <span
                className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-full ${
                  hoveredNode.riskScore >= 70
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : hoveredNode.riskScore >= 40
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {hoveredNode.riskScore}/100
              </span>
            </div>
          )}

          <div className="mt-1.5 text-[10px] text-slate-500 italic flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-600" />
            Click to isolate • Double-click to expand
          </div>
        </div>
      )}

      {/* Rich Tooltip on Link Hover */}
      {hoveredLink && (
        <div
          className="absolute z-30 pointer-events-none bg-white text-slate-900 text-xs p-2.5 rounded-lg shadow-2xl border border-slate-200 max-w-xs animate-in fade-in duration-100 backdrop-blur-md"
          style={{
            left: `${Math.min(tooltipPos.x + 12, dimensions.width - 240)}px`,
            top: `${Math.min(tooltipPos.y + 12, dimensions.height - 100)}px`,
          }}
        >
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            {hoveredLink.isFlaggedLink ? (
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            ) : (
              <GitGraph className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>
              {hoveredLink.relationshipType === 'contractor_project'
                ? 'Contract Allocation'
                : hoveredLink.relationshipType === 'project_agency'
                ? 'Implementing Authority'
                : hoveredLink.relationshipType === 'project_district'
                ? 'District Location'
                : 'Network Link'}
            </span>
          </div>

          {hoveredLink.valueLakhs && (
            <div className="text-slate-700 text-[11px] mt-1 font-mono font-semibold">
              Sanctioned: ₹{hoveredLink.valueLakhs} Lakhs
            </div>
          )}

          {hoveredLink.isFlaggedLink && (
            <div className="text-red-800 text-[10px] mt-1 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
              ⚠️ High Risk Correlation / Delay Cluster
            </div>
          )}
        </div>
      )}

      {/* Empty State when no nodes match filters */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-slate-500 bg-white/90 backdrop-blur-xs">
          <AlertTriangle className="w-10 h-10 text-amber-500 mb-2 animate-bounce" />
          <h4 className="font-bold text-slate-800 text-sm">No Network Nodes Match Selected Criteria</h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Try adjusting your search query, clearing district or category filters, or selecting 'All' risk tiers.
          </p>
        </div>
      )}
    </div>
  );
};
