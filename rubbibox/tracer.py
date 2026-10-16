"""
Fault Tracer for Rubbi-Box Protocol
Traces faults through the dependency graph to identify the broken chain
"""

from typing import Dict, List, Set, Tuple
from dataclasses import dataclass
from .graph import NestedGraph, GraphNode, GraphEdge, NodeStatus, EdgeHealth


@dataclass
class TraceStep:
    """A single step in the fault trace"""
    step_number: int
    node_id: str
    direction: str  # "origin", "upstream", "downstream"
    action: str
    description: str


@dataclass
class FaultTrace:
    """Complete fault trace result"""
    origin_node: str
    upstream_chain: List[str]
    downstream_chain: List[str]
    faulting_edges: List[str]
    glitching_nodes: List[str]
    trace_steps: List[TraceStep]
    diagnosis: str


class FaultTracer:
    """
    Traces faults through the dependency graph.
    Follows the "speaker wire" analogy - traces the signal path to find the break.
    """
    
    def __init__(self, graph: NestedGraph):
        self.graph = graph
        self.trace_steps: List[TraceStep] = []
        self.step_counter = 0
        
    def trace_fault(self, reported_node_id: str) -> FaultTrace:
        """
        Trace a fault starting from the reported broken node.
        Returns a complete FaultTrace with upstream/downstream chains.
        """
        self.trace_steps = []
        self.step_counter = 0
        
        # Step 1: Locate the fault node
        origin_node = self.graph.get_node(reported_node_id)
        if not origin_node:
            raise ValueError(f"Node {reported_node_id} not found in graph")
        
        self._add_step(reported_node_id, "origin", "Locate Fault Node",
                      f"Found: {origin_node.label} (status: {origin_node.status.value})")
        
        # Step 2: Trace upstream (what feeds into this node)
        upstream_chain = self._trace_upstream(reported_node_id)
        
        # Step 3: Trace downstream (what this node affects)
        downstream_chain = self._trace_downstream(reported_node_id)
        
        # Step 4: Identify faulting edges
        faulting_edges = self._identify_faulting_edges(
            reported_node_id, upstream_chain, downstream_chain
        )
        
        # Step 5: Identify glitching nodes
        glitching_nodes = self._identify_glitching_nodes(
            reported_node_id, upstream_chain, downstream_chain
        )
        
        # Step 6: Generate diagnosis
        diagnosis = self._generate_diagnosis(
            origin_node, upstream_chain, downstream_chain, faulting_edges
        )
        
        self._add_step(reported_node_id, "origin", "Trace Complete",
                      f"Diagnosis: {diagnosis}")
        
        return FaultTrace(
            origin_node=reported_node_id,
            upstream_chain=upstream_chain,
            downstream_chain=downstream_chain,
            faulting_edges=faulting_edges,
            glitching_nodes=glitching_nodes,
            trace_steps=self.trace_steps,
            diagnosis=diagnosis
        )
    
    def _trace_upstream(self, node_id: str) -> List[str]:
        """Trace upstream dependencies (what feeds into this node)"""
        chain = []
        visited = set()
        
        def trace_recursive(current_id: str):
            if current_id in visited:
                return
            visited.add(current_id)
            
            upstream_nodes = self.graph.get_upstream(current_id)
            for upstream_id in upstream_nodes:
                upstream_node = self.graph.get_node(upstream_id)
                if upstream_node:
                    chain.append(upstream_id)
                    self._add_step(upstream_id, "upstream", "Trace Upstream",
                                 f"What feeds {current_id}? → {upstream_node.label}")
                    trace_recursive(upstream_id)
        
        trace_recursive(node_id)
        return chain
    
    def _trace_downstream(self, node_id: str) -> List[str]:
        """Trace downstream dependencies (what this node affects)"""
        chain = []
        visited = set()
        
        def trace_recursive(current_id: str):
            if current_id in visited:
                return
            visited.add(current_id)
            
            downstream_nodes = self.graph.get_downstream(current_id)
            for downstream_id in downstream_nodes:
                downstream_node = self.graph.get_node(downstream_id)
                if downstream_node:
                    chain.append(downstream_id)
                    self._add_step(downstream_id, "downstream", "Trace Downstream",
                                 f"What does {current_id} affect? → {downstream_node.label}")
                    trace_recursive(downstream_id)
        
        trace_recursive(node_id)
        return chain
    
    def _identify_faulting_edges(self, origin: str, upstream: List[str], 
                                  downstream: List[str]) -> List[str]:
        """Identify edges in the fault chain that are FAILING"""
        faulting = []
        relevant_nodes = {origin} | set(upstream) | set(downstream)
        
        for edge in self.graph.edges.values():
            if edge.source in relevant_nodes and edge.target in relevant_nodes:
                if edge.health == EdgeHealth.FAILING:
                    faulting.append(edge.id)
                    self._add_step(edge.source, "origin", "Identify Fault",
                                 f"Edge {edge.id} ({edge.source}→{edge.target}) is FAILING")
        
        return faulting
    
    def _identify_glitching_nodes(self, origin: str, upstream: List[str],
                                   downstream: List[str]) -> List[str]:
        """Identify nodes in the fault chain that are GLITCHING"""
        glitching = []
        relevant_nodes = {origin} | set(upstream) | set(downstream)
        
        for node_id in relevant_nodes:
            node = self.graph.get_node(node_id)
            if node and node.status == NodeStatus.GLITCHING:
                glitching.append(node_id)
        
        return glitching
    
    def _generate_diagnosis(self, origin_node: GraphNode, upstream: List[str],
                            downstream: List[str], faulting_edges: List[str]) -> str:
        """Generate a human-readable diagnosis of the fault"""
        if not faulting_edges:
            return f"No failing edges found in chain. Node {origin_node.label} may be healthy."
        
        # Find the first failing edge in the downstream chain
        for edge_id in faulting_edges:
            edge = self.graph.edges[edge_id]
            source_node = self.graph.get_node(edge.source)
            target_node = self.graph.get_node(edge.target)
            
            if source_node and target_node:
                return (f"Fault detected: {source_node.label} → {target_node.label} "
                       f"connection is broken ({edge.label})")
        
        return f"Fault detected in {origin_node.label} chain"
    
    def _add_step(self, node_id: str, direction: str, action: str, description: str):
        """Add a trace step"""
        self.step_counter += 1
        self.trace_steps.append(TraceStep(
            step_number=self.step_counter,
            node_id=node_id,
            direction=direction,
            action=action,
            description=description
        ))
    
    def get_relevant_subgraph(self, trace: FaultTrace) -> NestedGraph:
        """Extract the relevant subgraph from the fault trace"""
        all_nodes = {trace.origin_node} | set(trace.upstream_chain) | set(trace.downstream_chain)
        return self.graph.extract_subgraph(list(all_nodes), f"fault-{trace.origin_node}")
