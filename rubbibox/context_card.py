"""
Context Card Generator for Rubbi-Box Protocol
Generates compressed sub-graphs for AI to focus on only the relevant code
"""

from typing import Dict, List
from dataclasses import dataclass, field
from .graph import NestedGraph, GraphNode, GraphEdge
from .tracer import FaultTrace


@dataclass
class ContextCard:
    """
    Compressed sub-graph for AI to focus on.
    Contains only the relevant nodes, edges, and contracts.
    """
    fault_description: str
    origin_node: str
    upstream_path: List[str]
    downstream_path: List[str]
    relevant_nodes: List[GraphNode]
    relevant_edges: List[GraphEdge]
    token_estimate: int
    full_codebase_tokens: int
    savings_percent: float
    reuse_candidates: List[str] = field(default_factory=list)
    confidence_score: float = 0.0
    
    def to_prompt(self) -> str:
        """Generate a prompt-ready string for the AI"""
        lines = [
            "=" * 60,
            "CONTEXT CARD - SURGICAL EDIT REQUIRED",
            "=" * 60,
            "",
            f"FAULT: {self.fault_description}",
            f"ORIGIN: {self.origin_node}",
            "",
            "UPSTREAM PATH (what feeds the fault):",
            " → ".join(self.upstream_path) if self.upstream_path else "  (none)",
            "",
            "DOWNSTREAM PATH (what the fault affects):",
            " → ".join(self.downstream_path) if self.downstream_path else "  (none)",
            "",
            "-" * 60,
            "RELEVANT NODES (edit ONLY these):",
            "-" * 60,
        ]
        
        for node in self.relevant_nodes:
            lines.extend([
                f"  [{node.id}] {node.label}",
                f"    Type: {node.node_type}",
                f"    Status: {node.status.value}",
                f"    Input: {node.input_contract}",
                f"    Output: {node.output_contract}",
                f"    Code: {len(node.code_lines)} lines ({node.token_count} tokens)",
                ""
            ])
        
        lines.extend([
            "-" * 60,
            "RELEVANT EDGES (connections to preserve):",
            "-" * 60,
        ])
        
        for edge in self.relevant_edges:
            health_icon = "✓" if edge.health.value == "passing" else "✗"
            lines.append(f"  {health_icon} {edge.source} → {edge.target} ({edge.label})")
        
        lines.extend([
            "",
            "-" * 60,
            "TOKEN ECONOMY:",
            "-" * 60,
            f"  Full codebase: {self.full_codebase_tokens} tokens",
            f"  This context:  {self.token_estimate} tokens",
            f"  Savings:       {self.savings_percent:.1f}%",
            "",
            "REUSE CANDIDATES (existing code to wire up):",
        ])
        
        if self.reuse_candidates:
            for candidate in self.reuse_candidates:
                lines.append(f"  • {candidate}")
        else:
            lines.append("  (none - must repair or replace)")
        
        lines.extend([
            "",
            f"CONFIDENCE SCORE: {self.confidence_score:.0%}",
            "",
            "PROTOCOL RULES:",
            "  1. Edit ONLY nodes listed above",
            "  2. Attempt REUSE before REPAIR before REPLACE",
            "  3. Test in sandbox before deploying",
            "  4. Verify no cross-sector contamination",
            "=" * 60,
        ])
        
        return "\n".join(lines)


class ContextCardGenerator:
    """
    Generates Context Cards from fault traces.
    Compresses the full codebase into a minimal, focused sub-graph.
    """
    
    def __init__(self, full_graph: NestedGraph):
        self.full_graph = full_graph
        self.full_codebase_tokens = full_graph.calculate_total_tokens()
        
    def generate(self, trace: FaultTrace, user_report: str) -> ContextCard:
        """Generate a Context Card from a fault trace"""
        
        # Extract relevant subgraph
        subgraph = self._extract_relevant_subgraph(trace)
        
        # Calculate token estimate
        token_estimate = subgraph.calculate_total_tokens()
        
        # Calculate savings
        savings_percent = (1 - token_estimate / self.full_codebase_tokens) * 100
        
        # Find reuse candidates
        reuse_candidates = self._find_reuse_candidates(subgraph, trace)
        
        # Calculate confidence score
        confidence_score = self._calculate_confidence(trace, reuse_candidates)
        
        return ContextCard(
            fault_description=user_report,
            origin_node=trace.origin_node,
            upstream_path=trace.upstream_chain,
            downstream_path=trace.downstream_chain,
            relevant_nodes=list(subgraph.nodes.values()),
            relevant_edges=list(subgraph.edges.values()),
            token_estimate=token_estimate,
            full_codebase_tokens=self.full_codebase_tokens,
            savings_percent=savings_percent,
            reuse_candidates=reuse_candidates,
            confidence_score=confidence_score
        )
    
    def _extract_relevant_subgraph(self, trace: FaultTrace) -> NestedGraph:
        """Extract only the relevant nodes and edges"""
        all_node_ids = {trace.origin_node} | set(trace.upstream_chain) | set(trace.downstream_chain)
        return self.full_graph.extract_subgraph(list(all_node_ids), f"context-{trace.origin_node}")
    
    def _find_reuse_candidates(self, subgraph: NestedGraph, trace: FaultTrace) -> List[str]:
        """
        Find existing code that can be reused instead of writing new code.
        Implements the "Reuse > Repair > Replace" hierarchy.
        """
        candidates = []
        
        # Look for healthy nodes in the downstream chain that could be reused
        for node_id in trace.downstream_chain:
            node = subgraph.get_node(node_id)
            if node and node.status.value == "active":
                # Check if this node's input matches what the glitching node needs
                origin_node = subgraph.get_node(trace.origin_node)
                if origin_node and self._is_compatible(origin_node, node):
                    candidates.append(f"{node.label} (compatible, can wire up)")
        
        return candidates
    
    def _is_compatible(self, broken_node: GraphNode, candidate_node: GraphNode) -> bool:
        """Check if a candidate node is compatible with the broken node"""
        # Simple compatibility check: output contract matches input contract
        # In a real implementation, this would do type checking
        return (broken_node.input_contract in candidate_node.output_contract or
                candidate_node.output_contract in broken_node.input_contract)
    
    def _calculate_confidence(self, trace: FaultTrace, reuse_candidates: List[str]) -> float:
        """
        Calculate confidence score for the fix.
        Higher confidence = more likely to succeed without breaking things.
        """
        score = 0.5  # Base score
        
        # Boost for having reuse candidates
        if reuse_candidates:
            score += 0.2
        
        # Boost for clear fault chain
        if len(trace.faulting_edges) == 1:
            score += 0.1
        
        # Boost for limited scope
        total_nodes = 1 + len(trace.upstream_chain) + len(trace.downstream_chain)
        if total_nodes <= 5:
            score += 0.1
        elif total_nodes <= 10:
            score += 0.05
        
        # Penalize for multiple faulting edges
        if len(trace.faulting_edges) > 2:
            score -= 0.1
        
        return min(1.0, max(0.0, score))
