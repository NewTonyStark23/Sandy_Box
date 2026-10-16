import { GraphNode, GraphEdge, NodeStatus, EdgeHealth } from '../types';

interface GraphViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  highlightedNodes?: string[];
  highlightedEdges?: string[];
  onNodeClick?: (nodeId: string) => void;
  dimUnrelated?: boolean;
  showSectors?: boolean;
}

function getNodeColor(status: NodeStatus): string {
  switch (status) {
    case 'ACTIVE': return '#22c55e';
    case 'GLITCHING': return '#ef4444';
    case 'ISOLATED': return '#f59e0b';
    case 'FIXED': return '#06b6d4';
    default: return '#6b7280';
  }
}

function getEdgeColor(health: EdgeHealth): string {
  switch (health) {
    case 'PASSING': return '#22c55e';
    case 'FAILING': return '#ef4444';
    default: return '#6b7280';
  }
}

function getNodeTypeIcon(type: string): string {
  switch (type) {
    case 'component': return '◻';
    case 'event-handler': return '⚡';
    case 'state': return '◉';
    case 'api-call': return '↗';
    case 'utility': return '⚙';
    case 'prop': return '↗';
    default: return '●';
  }
}

function getSectorColor(sector: string): string {
  switch (sector) {
    case 'A': return 'rgba(59, 130, 246, 0.08)';
    case 'B': return 'rgba(168, 85, 247, 0.08)';
    case 'C': return 'rgba(34, 197, 94, 0.08)';
    default: return 'rgba(107, 114, 128, 0.08)';
  }
}

function getSectorBorder(sector: string): string {
  switch (sector) {
    case 'A': return 'rgba(59, 130, 246, 0.3)';
    case 'B': return 'rgba(168, 85, 247, 0.3)';
    case 'C': return 'rgba(34, 197, 94, 0.3)';
    default: return 'rgba(107, 114, 128, 0.3)';
  }
}

export default function GraphView({
  nodes,
  edges,
  highlightedNodes = [],
  highlightedEdges = [],
  onNodeClick,
  dimUnrelated = false,
  showSectors = true,
}: GraphViewProps) {
  const width = 780;
  const height = 600;

  // Calculate sector bounding boxes
  const sectors = nodes.reduce((acc, node) => {
    if (!acc[node.sector]) {
      acc[node.sector] = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    }
    acc[node.sector].minX = Math.min(acc[node.sector].minX, node.x - 60);
    acc[node.sector].minY = Math.min(acc[node.sector].minY, node.y - 30);
    acc[node.sector].maxX = Math.max(acc[node.sector].maxX, node.x + 60);
    acc[node.sector].maxY = Math.max(acc[node.sector].maxY, node.y + 30);
    return acc;
  }, {} as Record<string, { minX: number; minY: number; maxX: number; maxY: number }>);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" style={{ maxHeight: '600px' }}>
      <defs>
        <marker id="arrowGreen" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#22c55e" />
        </marker>
        <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
        </marker>
        <marker id="arrowGray" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
        </marker>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glowRed">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Sector backgrounds */}
      {showSectors && Object.entries(sectors).map(([sector, bounds]) => (
        <g key={`sector-${sector}`}>
          <rect
            x={bounds.minX}
            y={bounds.minY}
            width={bounds.maxX - bounds.minX}
            height={bounds.maxY - bounds.minY}
            rx="12"
            fill={getSectorColor(sector)}
            stroke={getSectorBorder(sector)}
            strokeWidth="1.5"
            strokeDasharray={sector === 'B' ? '6,3' : 'none'}
          />
          <text
            x={bounds.minX + 8}
            y={bounds.minY + 16}
            fontSize="11"
            fill={sector === 'B' ? '#a855f7' : sector === 'A' ? '#3b82f6' : '#22c55e'}
            fontWeight="bold"
            opacity="0.8"
          >
            SECTOR {sector} {sector === 'B' ? '(contains fault)' : ''}
          </text>
        </g>
      ))}

      {/* Edges */}
      {edges.map((edge) => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (!sourceNode || !targetNode) return null;

        const isHighlighted = highlightedEdges.includes(edge.id);
        const isDimmed = dimUnrelated && !isHighlighted;
        const color = getEdgeColor(edge.health);
        const markerId = edge.health === 'PASSING' ? 'arrowGreen' : edge.health === 'FAILING' ? 'arrowRed' : 'arrowGray';

        // Calculate edge path with slight curve
        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;
        const offsetX = dy * 0.1;
        const offsetY = -dx * 0.1;

        return (
          <g key={edge.id} opacity={isDimmed ? 0.15 : 1}>
            <path
              d={`M ${sourceNode.x} ${sourceNode.y + 18} Q ${midX + offsetX} ${midY + offsetY} ${targetNode.x} ${targetNode.y - 18}`}
              fill="none"
              stroke={color}
              strokeWidth={isHighlighted ? 3 : 1.5}
              strokeDasharray={edge.health === 'FAILING' ? '6,4' : 'none'}
              markerEnd={`url(#${markerId})`}
              filter={edge.health === 'FAILING' && isHighlighted ? 'url(#glowRed)' : undefined}
            />
            {isHighlighted && (
              <text
                x={midX + offsetX}
                y={midY + offsetY - 6}
                fontSize="9"
                fill={color}
                textAnchor="middle"
                fontWeight="bold"
              >
                {edge.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const isHighlighted = highlightedNodes.includes(node.id);
        const isDimmed = dimUnrelated && !isHighlighted;
        const color = getNodeColor(node.status);

        return (
          <g
            key={node.id}
            opacity={isDimmed ? 0.2 : 1}
            cursor={onNodeClick ? 'pointer' : 'default'}
            onClick={() => onNodeClick?.(node.id)}
            filter={node.status === 'GLITCHING' ? 'url(#glowRed)' : undefined}
          >
            {/* Node background */}
            <rect
              x={node.x - 52}
              y={node.y - 16}
              width={104}
              height={32}
              rx="8"
              fill={isHighlighted ? `${color}22` : '#1a1a2e'}
              stroke={color}
              strokeWidth={isHighlighted ? 2.5 : 1.5}
            />
            {/* Status indicator */}
            <circle
              cx={node.x - 38}
              cy={node.y}
              r={4}
              fill={color}
            >
              {node.status === 'GLITCHING' && (
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
              )}
            </circle>
            {/* Icon */}
            <text x={node.x - 28} y={node.y + 4} fontSize="11" fill={color}>
              {getNodeTypeIcon(node.type)}
            </text>
            {/* Label */}
            <text
              x={node.x + 4}
              y={node.y + 4}
              fontSize="10"
              fill={isHighlighted ? '#ffffff' : '#d1d5db'}
              textAnchor="middle"
              fontWeight={isHighlighted ? 'bold' : 'normal'}
            >
              {node.label.length > 12 ? node.label.slice(0, 12) + '..' : node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
