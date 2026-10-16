"""
Nested Graph Structure for Rubbi-Box Protocol
Implements R1 (Project) → R2 (Sector) → R3 (Micro-Sector) → R4 (Atomic Node)
"""

from typing import Dict, List, Optional, Set
from dataclasses import dataclass, field
from enum import Enum


class NodeStatus(Enum):
    ACTIVE = "active"
    GLITCHING = "glitching"
    ISOLATED = "isolated"
    FIXED = "fixed"


class EdgeHealth(Enum):
    PASSING = "passing"
    FAILING = "failing"
    UNKNOWN = "unknown"


class SignalType(Enum):
    EVENT = "event"
    DATA = "data"
    STATE = "state"


@dataclass
class GraphNode:
    """Atomic note - the smallest unit in the graph"""
    id: str
    label: str
    node_type: str  # component, handler, state, api, utility
    status: NodeStatus
    description: str
    input_contract: str
    output_contract: str
    sector: str
    code_lines: List[str] = field(default_factory=list)
    token_count: int = 0
    
    def calculate_tokens(self) -> int:
        """Calculate token count for this node"""
        # Rough estimate: 1 token ≈ 4 characters
        code_text = "\n".join(self.code_lines)
        self.token_count = len(code_text) // 4 + 20  # +20 for metadata
        return self.token_count


@dataclass
class GraphEdge:
    """Connection between nodes - the dependency relationship"""
    id: str
    source: str
    target: str
    signal_type: SignalType
    health: EdgeHealth
    label: str


class NestedGraph:
    """
    Nested graph structure with multiple zoom levels:
    - R1: Project-level (all files, modules)
    - R2: Sector-level (module/component)
    - R3: Micro-sector (dependency chain)
    - R4: Atomic node (single function/line)
    """
    
    def __init__(self, name: str, level: int = 1):
        self.name = name
        self.level = level  # 1=R1, 2=R2, 3=R3, 4=R4
        self.nodes: Dict[str, GraphNode] = {}
        self.edges: Dict[str, GraphEdge] = {}
        self.subgraphs: Dict[str, 'NestedGraph'] = {}  # For nesting
        self.parent: Optional['NestedGraph'] = None
        
    def add_node(self, node: GraphNode) -> None:
        """Add a node to this graph level"""
        self.nodes[node.id] = node
        
    def add_edge(self, edge: GraphEdge) -> None:
        """Add an edge to this graph level"""
        self.edges[edge.id] = edge
        
    def add_subgraph(self, subgraph: 'NestedGraph') -> None:
        """Add a nested subgraph (for zooming in)"""
        subgraph.parent = self
        self.subgraphs[subgraph.name] = subgraph
        
    def get_node(self, node_id: str) -> Optional[GraphNode]:
        """Get a node by ID"""
        return self.nodes.get(node_id)
        
    def get_upstream(self, node_id: str) -> List[str]:
        """Get all nodes that feed into this node"""
        upstream = []
        for edge in self.edges.values():
            if edge.target == node_id:
                upstream.append(edge.source)
        return upstream
        
    def get_downstream(self, node_id: str) -> List[str]:
        """Get all nodes that this node feeds into"""
        downstream = []
        for edge in self.edges.values():
            if edge.source == node_id:
                downstream.append(edge.target)
        return downstream
        
    def get_dependency_chain(self, node_id: str) -> Dict[str, List[str]]:
        """Get full upstream and downstream chains for a node"""
        return {
            "upstream": self._trace_upstream(node_id, set()),
            "downstream": self._trace_downstream(node_id, set())
        }
        
    def _trace_upstream(self, node_id: str, visited: Set[str]) -> List[str]:
        """Recursively trace upstream dependencies"""
        if node_id in visited:
            return []
        visited.add(node_id)
        
        chain = []
        for upstream_id in self.get_upstream(node_id):
            chain.append(upstream_id)
            chain.extend(self._trace_upstream(upstream_id, visited))
        return chain
        
    def _trace_downstream(self, node_id: str, visited: Set[str]) -> List[str]:
        """Recursively trace downstream dependencies"""
        if node_id in visited:
            return []
        visited.add(node_id)
        
        chain = []
        for downstream_id in self.get_downstream(node_id):
            chain.append(downstream_id)
            chain.extend(self._trace_downstream(downstream_id, visited))
        return chain
        
    def get_faulting_edges(self) -> List[GraphEdge]:
        """Get all edges with FAILING health"""
        return [e for e in self.edges.values() if e.health == EdgeHealth.FAILING]
        
    def get_glitching_nodes(self) -> List[GraphNode]:
        """Get all nodes with GLITCHING status"""
        return [n for n in self.nodes.values() if n.status == NodeStatus.GLITCHING]
        
    def calculate_total_tokens(self) -> int:
        """Calculate total token count for all nodes"""
        return sum(node.calculate_tokens() for node in self.nodes.values())
        
    def extract_subgraph(self, node_ids: List[str], name: str) -> 'NestedGraph':
        """Extract a subset of nodes and their connections into a new graph"""
        subgraph = NestedGraph(name, level=self.level)
        
        # Add requested nodes
        for node_id in node_ids:
            if node_id in self.nodes:
                subgraph.add_node(self.nodes[node_id])
        
        # Add edges that connect these nodes
        for edge in self.edges.values():
            if edge.source in node_ids and edge.target in node_ids:
                subgraph.add_edge(edge)
                
        return subgraph
        
    def to_dict(self) -> Dict:
        """Serialize graph to dictionary"""
        return {
            "name": self.name,
            "level": self.level,
            "nodes": {
                node_id: {
                    "id": node.id,
                    "label": node.label,
                    "type": node.node_type,
                    "status": node.status.value,
                    "description": node.description,
                    "input_contract": node.input_contract,
                    "output_contract": node.output_contract,
                    "sector": node.sector,
                    "token_count": node.token_count
                }
                for node_id, node in self.nodes.items()
            },
            "edges": {
                edge_id: {
                    "id": edge.id,
                    "source": edge.source,
                    "target": edge.target,
                    "signal_type": edge.signal_type.value,
                    "health": edge.health.value,
                    "label": edge.label
                }
                for edge_id, edge in self.edges.items()
            },
            "subgraphs": {
                name: subgraph.to_dict()
                for name, subgraph in self.subgraphs.items()
            }
        }
