"""
Sandbox for Rubbi-Box Protocol
Implements snapshot → mock → edit → vet → swap workflow
"""

from typing import Dict, List, Optional, Callable
from dataclasses import dataclass, field
from enum import Enum
import copy
import json
from .graph import NestedGraph, GraphNode, GraphEdge, NodeStatus, EdgeHealth
from .context_card import ContextCard


class SandboxPhase(Enum):
    IDLE = "idle"
    SNAPSHOT = "snapshot"
    MOCK = "mock"
    EDIT = "edit"
    VET = "vet"
    SWAP = "swap"
    ROLLBACK = "rollback"


@dataclass
class VetResult:
    """Result of vetting a fix"""
    passed: bool
    node_id: str
    message: str
    test_type: str  # "type_check", "state_flow", "side_effect", "integration"


@dataclass
class SandboxState:
    """Current state of the sandbox"""
    phase: SandboxPhase
    snapshot: Optional[Dict] = None
    edited_nodes: List[str] = field(default_factory=list)
    vet_results: List[VetResult] = field(default_factory=list)
    swap_complete: bool = False
    rolled_back: bool = False


class SectorSandbox:
    """
    Isolated sandbox for testing fixes before deploying.
    Implements the full workflow: snapshot → mock → edit → vet → swap
    """
    
    def __init__(self, sector_graph: NestedGraph):
        self.sector_graph = sector_graph
        self.state = SandboxState(phase=SandboxPhase.IDLE)
        self.original_graph = copy.deepcopy(sector_graph)
        self.mocks: Dict[str, Callable] = {}
        
    def snapshot(self) -> str:
        """
        Phase 1: Capture current state of sector.
        Returns snapshot ID.
        """
        self.state.phase = SandboxPhase.SNAPSHOT
        
        # Serialize the entire sector state
        snapshot_data = {
            "nodes": {
                node_id: {
                    "id": node.id,
                    "label": node.label,
                    "status": node.status.value,
                    "code_lines": node.code_lines,
                    "token_count": node.token_count
                }
                for node_id, node in self.sector_graph.nodes.items()
            },
            "edges": {
                edge_id: {
                    "id": edge.id,
                    "source": edge.source,
                    "target": edge.target,
                    "health": edge.health.value
                }
                for edge_id, edge in self.sector_graph.edges.items()
            }
        }
        
        self.state.snapshot = snapshot_data
        snapshot_id = f"snap-{self.sector_graph.name}-{len(self.state.edited_nodes)}"
        
        return snapshot_id
    
    def mock_dependencies(self, external_deps: List[str]) -> None:
        """
        Phase 2: Replace external dependencies with mocks.
        Isolates the sector from the rest of the system.
        """
        self.state.phase = SandboxPhase.MOCK
        
        for dep_id in external_deps:
            # Create a mock that returns default values
            self.mocks[dep_id] = lambda: None
            
            # Mark the dependency as mocked
            node = self.sector_graph.get_node(dep_id)
            if node:
                node.description = f"[MOCKED] {node.description}"
    
    def apply_edit(self, node_id: str, new_code_lines: List[str], 
                   context_card: ContextCard) -> bool:
        """
        Phase 3: Apply edit in sandbox only.
        Enforces edit guardrails - can't touch anything outside the sector.
        """
        self.state.phase = SandboxPhase.EDIT
        
        # Guardrail: Check if node is in the context card
        if node_id not in [n.id for n in context_card.relevant_nodes]:
            raise PermissionError(
                f"Edit guardrail violation: {node_id} is outside the declared sector"
            )
        
        # Apply the edit
        node = self.sector_graph.get_node(node_id)
        if not node:
            raise ValueError(f"Node {node_id} not found in sector")
        
        node.code_lines = new_code_lines
        node.status = NodeStatus.FIXED
        node.calculate_tokens()
        
        self.state.edited_nodes.append(node_id)
        
        return True
    
    def vet(self, context_card: ContextCard) -> List[VetResult]:
        """
        Phase 4: Run automated reaction tests.
        Checks if the fix works and doesn't break anything else.
        """
        self.state.phase = SandboxPhase.VET
        results = []
        
        # Test 1: Type check - do the contracts still match?
        for node in context_card.relevant_nodes:
            type_check = self._test_type_compatibility(node)
            results.append(type_check)
        
        # Test 2: State flow - does data flow correctly?
        for edge in context_card.relevant_edges:
            state_flow = self._test_state_flow(edge)
            results.append(state_flow)
        
        # Test 3: Side effects - did we break anything outside the sector?
        side_effect = self._test_no_side_effects(context_card)
        results.append(side_effect)
        
        # Test 4: Integration - do all the pieces work together?
        integration = self._test_integration(context_card)
        results.append(integration)
        
        self.state.vet_results = results
        
        return results
    
    def swap(self) -> bool:
        """
        Phase 5: Atomic swap - replace live sector with vetted version.
        Only proceeds if all vet tests passed.
        """
        self.state.phase = SandboxPhase.SWAP
        
        # Check if all vet tests passed
        if not all(r.passed for r in self.state.vet_results):
            self.rollback()
            return False
        
        # Swap is successful
        self.state.swap_complete = True
        
        return True
    
    def rollback(self) -> None:
        """Rollback to the snapshot if something went wrong"""
        self.state.phase = SandboxPhase.ROLLBACK
        self.state.rolled_back = True
        
        # Restore from snapshot
        if self.state.snapshot:
            self.sector_graph = copy.deepcopy(self.original_graph)
    
    def _test_type_compatibility(self, node: GraphNode) -> VetResult:
        """Test if node's type contracts are still valid"""
        # In a real implementation, this would do actual type checking
        # For now, we just check that contracts are non-empty
        if node.input_contract and node.output_contract:
            return VetResult(
                passed=True,
                node_id=node.id,
                message=f"Type contracts valid for {node.label}",
                test_type="type_check"
            )
        else:
            return VetResult(
                passed=False,
                node_id=node.id,
                message=f"Missing type contracts for {node.label}",
                test_type="type_check"
            )
    
    def _test_state_flow(self, edge: GraphEdge) -> VetResult:
        """Test if state flows correctly through the edge"""
        source = self.sector_graph.get_node(edge.source)
        target = self.sector_graph.get_node(edge.target)
        
        if not source or not target:
            return VetResult(
                passed=False,
                node_id=edge.source,
                message=f"Edge {edge.id} references missing node",
                test_type="state_flow"
            )
        
        # Check if source output matches target input
        # In a real implementation, this would do actual data flow analysis
        if source.status == NodeStatus.FIXED or source.status == NodeStatus.ACTIVE:
            return VetResult(
                passed=True,
                node_id=edge.source,
                message=f"State flow valid: {edge.source} → {edge.target}",
                test_type="state_flow"
            )
        else:
            return VetResult(
                passed=False,
                node_id=edge.source,
                message=f"Source node {edge.source} not in valid state",
                test_type="state_flow"
            )
    
    def _test_no_side_effects(self, context_card: ContextCard) -> VetResult:
        """Test that the fix doesn't affect nodes outside the sector"""
        # Check that only nodes in the context card were edited
        for edited_node_id in self.state.edited_nodes:
            if edited_node_id not in [n.id for n in context_card.relevant_nodes]:
                return VetResult(
                    passed=False,
                    node_id=edited_node_id,
                    message=f"Side effect detected: {edited_node_id} was edited but not in sector",
                    test_type="side_effect"
                )
        
        return VetResult(
            passed=True,
            node_id="all",
            message="No side effects detected",
            test_type="side_effect"
        )
    
    def _test_integration(self, context_card: ContextCard) -> VetResult:
        """Test that all the pieces work together"""
        # Check that all glitching nodes are now fixed
        for node in context_card.relevant_nodes:
            current_node = self.sector_graph.get_node(node.id)
            if current_node and current_node.status == NodeStatus.GLITCHING:
                return VetResult(
                    passed=False,
                    node_id=node.id,
                    message=f"Integration test failed: {node.label} still glitching",
                    test_type="integration"
                )
        
        return VetResult(
            passed=True,
            node_id="all",
            message="Integration test passed: all nodes functional",
            test_type="integration"
        )
    
    def get_status(self) -> Dict:
        """Get current sandbox status"""
        return {
            "phase": self.state.phase.value,
            "snapshot_id": self.state.snapshot is not None,
            "edited_nodes": self.state.edited_nodes,
            "vet_results": [
                {
                    "passed": r.passed,
                    "node_id": r.node_id,
                    "message": r.message,
                    "test_type": r.test_type
                }
                for r in self.state.vet_results
            ],
            "swap_complete": self.state.swap_complete,
            "rolled_back": self.state.rolled_back
        }
