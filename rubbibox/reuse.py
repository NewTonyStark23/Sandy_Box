"""
Reuse Detection for Rubbi-Box Protocol
Implements the "Reuse > Repair > Replace" hierarchy
"""

from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
from .graph import NestedGraph, GraphNode, GraphEdge, NodeStatus
from .context_card import ContextCard


class FixStrategy(Enum):
    REUSE = "reuse"      # Wire up existing code (~5 tokens)
    REPAIR = "repair"    # Patch existing code (~20 tokens)
    REPLACE = "replace"  # Write new code (~50 tokens)


@dataclass
class ReuseCandidate:
    """A piece of existing code that can be reused"""
    node_id: str
    node: GraphNode
    compatibility_score: float  # 0.0 to 1.0
    reason: str
    estimated_tokens: int = 5  # Just wiring instruction


@dataclass
class RepairCandidate:
    """A piece of existing code that can be repaired"""
    node_id: str
    node: GraphNode
    issue: str
    fix_description: str
    estimated_tokens: int = 20  # Patch code


@dataclass
class FixRecommendation:
    """Recommendation for how to fix the fault"""
    strategy: FixStrategy
    description: str
    estimated_tokens: int
    confidence: float
    reuse_candidate: Optional[ReuseCandidate] = None
    repair_candidate: Optional[RepairCandidate] = None
    wiring_instruction: Optional[str] = None


class ReuseDetector:
    """
    Detects opportunities to reuse existing code instead of writing new code.
    Implements the "Reuse > Repair > Replace" hierarchy.
    """
    
    def __init__(self, graph: NestedGraph):
        self.graph = graph
        
    def analyze(self, context_card: ContextCard) -> FixRecommendation:
        """
        Analyze the context card and recommend the best fix strategy.
        Priority: REUSE > REPAIR > REPLACE
        """
        
        # Step 1: Try to find reuse candidates
        reuse_candidates = self._find_reuse_candidates(context_card)
        
        if reuse_candidates:
            # Pick the best reuse candidate
            best_candidate = max(reuse_candidates, key=lambda c: c.compatibility_score)
            
            if best_candidate.compatibility_score >= 0.8:
                return FixRecommendation(
                    strategy=FixStrategy.REUSE,
                    description=f"Reuse {best_candidate.node.label}: {best_candidate.reason}",
                    estimated_tokens=best_candidate.estimated_tokens,
                    confidence=best_candidate.compatibility_score,
                    reuse_candidate=best_candidate,
                    wiring_instruction=f"Wire {context_card.origin_node} → {best_candidate.node_id}"
                )
        
        # Step 2: Try to find repair candidates
        repair_candidates = self._find_repair_candidates(context_card)
        
        if repair_candidates:
            best_repair = repair_candidates[0]
            
            return FixRecommendation(
                strategy=FixStrategy.REPAIR,
                description=f"Repair {best_repair.node.label}: {best_repair.issue}",
                estimated_tokens=best_repair.estimated_tokens,
                confidence=0.7,
                repair_candidate=best_repair
            )
        
        # Step 3: Must replace (write new code)
        return FixRecommendation(
            strategy=FixStrategy.REPLACE,
            description="No compatible existing code found - must write new code",
            estimated_tokens=50,
            confidence=0.5
        )
    
    def _find_reuse_candidates(self, context_card: ContextCard) -> List[ReuseCandidate]:
        """Find existing code that can be reused"""
        candidates = []
        
        origin_node = self.graph.get_node(context_card.origin_node)
        if not origin_node:
            return candidates
        
        # Look for compatible nodes in the downstream chain
        for node_id in context_card.downstream_path:
            node = self.graph.get_node(node_id)
            if not node:
                continue
            
            # Skip if the node is glitching
            if node.status == NodeStatus.GLITCHING:
                continue
            
            # Check compatibility
            compatibility = self._check_compatibility(origin_node, node)
            
            if compatibility > 0.5:
                candidates.append(ReuseCandidate(
                    node_id=node_id,
                    node=node,
                    compatibility_score=compatibility,
                    reason=f"Compatible output contract: {node.output_contract}",
                    estimated_tokens=5
                ))
        
        # Also check all active nodes in the sector
        for node in self.graph.nodes.values():
            if node.id == context_card.origin_node:
                continue
            if node.status != NodeStatus.ACTIVE:
                continue
            if node.id in [c.node_id for c in candidates]:
                continue
            
            compatibility = self._check_compatibility(origin_node, node)
            
            if compatibility > 0.7:
                candidates.append(ReuseCandidate(
                    node_id=node.id,
                    node=node,
                    compatibility_score=compatibility,
                    reason=f"Highly compatible: {node.output_contract}",
                    estimated_tokens=5
                ))
        
        return candidates
    
    def _find_repair_candidates(self, context_card: ContextCard) -> List[RepairCandidate]:
        """Find existing code that can be repaired"""
        candidates = []
        
        # Look for glitching nodes that might be fixable
        for node_id in context_card.glitching_nodes if hasattr(context_card, 'glitching_nodes') else []:
            node = self.graph.get_node(node_id)
            if not node:
                continue
            
            # Check if the issue is repairable
            issue, fixable = self._analyze_issue(node)
            
            if fixable:
                candidates.append(RepairCandidate(
                    node_id=node_id,
                    node=node,
                    issue=issue,
                    fix_description=f"Fix {issue} in {node.label}",
                    estimated_tokens=20
                ))
        
        return candidates
    
    def _check_compatibility(self, broken_node: GraphNode, candidate_node: GraphNode) -> float:
        """
        Check how compatible a candidate node is with the broken node.
        Returns a score from 0.0 to 1.0.
        """
        score = 0.0
        
        # Check if output contract matches input contract
        if broken_node.input_contract in candidate_node.output_contract:
            score += 0.5
        elif candidate_node.output_contract in broken_node.input_contract:
            score += 0.3
        
        # Check if node types are compatible
        if broken_node.node_type == candidate_node.node_type:
            score += 0.3
        elif self._are_types_compatible(broken_node.node_type, candidate_node.node_type):
            score += 0.2
        
        # Check if they're in the same sector
        if broken_node.sector == candidate_node.sector:
            score += 0.2
        
        return min(1.0, score)
    
    def _are_types_compatible(self, type1: str, type2: str) -> bool:
        """Check if two node types are compatible"""
        compatible_pairs = [
            ("component", "handler"),
            ("handler", "component"),
            ("state", "utility"),
            ("utility", "state"),
        ]
        return (type1, type2) in compatible_pairs
    
    def _analyze_issue(self, node: GraphNode) -> Tuple[str, bool]:
        """
        Analyze what's wrong with a glitching node.
        Returns (issue_description, is_fixable).
        """
        # Simple heuristic analysis
        if "missing" in node.description.lower():
            return ("Missing implementation", True)
        elif "typo" in node.description.lower():
            return ("Typo in code", True)
        elif "undefined" in node.description.lower():
            return ("Undefined reference", True)
        elif "not connected" in node.description.lower():
            return ("Not connected", True)
        else:
            return ("Unknown issue", False)
