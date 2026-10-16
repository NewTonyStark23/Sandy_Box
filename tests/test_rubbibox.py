"""
Tests for Rubbi-Box Protocol
Verifies graph integrity, tracing scope, edit guardrails, vetting, and rollback
"""

import pytest
from rubbibox.graph import (
    NestedGraph, GraphNode, GraphEdge, 
    NodeStatus, EdgeHealth, SignalType
)
from rubbibox.tracer import FaultTracer
from rubbibox.context_card import ContextCardGenerator
from rubbibox.sandbox import SectorSandbox, SandboxPhase
from rubbibox.reuse import ReuseDetector, FixStrategy
from rubbibox.demo import build_demo_graph


class TestGraphIntegrity:
    """Test that the nested graph structure works correctly"""
    
    def test_graph_creation(self):
        """Test that a graph can be created with nodes and edges"""
        graph = NestedGraph("test", level=1)
        
        node = GraphNode(
            id="test-node",
            label="Test Node",
            node_type="component",
            status=NodeStatus.ACTIVE,
            description="Test",
            input_contract="input",
            output_contract="output",
            sector="A"
        )
        
        graph.add_node(node)
        
        assert graph.get_node("test-node") is not None
        assert graph.get_node("test-node").label == "Test Node"
    
    def test_upstream_downstream(self):
        """Test that upstream and downstream tracing works"""
        graph = NestedGraph("test", level=1)
        
        # Create a chain: A → B → C
        for node_id in ["A", "B", "C"]:
            graph.add_node(GraphNode(
                id=node_id, label=node_id, node_type="component",
                status=NodeStatus.ACTIVE, description="",
                input_contract="", output_contract="", sector="A"
            ))
        
        graph.add_edge(GraphEdge("e1", "A", "B", SignalType.DATA, EdgeHealth.PASSING, ""))
        graph.add_edge(GraphEdge("e2", "B", "C", SignalType.DATA, EdgeHealth.PASSING, ""))
        
        # B's upstream is A
        assert "A" in graph.get_upstream("B")
        
        # B's downstream is C
        assert "C" in graph.get_downstream("B")
    
    def test_subgraph_extraction(self):
        """Test that subgraphs can be extracted correctly"""
        graph = build_demo_graph()
        
        # Extract Sector B
        sector_b_nodes = [n.id for n in graph.nodes.values() if n.sector == "B"]
        sector_b = graph.extract_subgraph(sector_b_nodes, "Sector-B")
        
        # All nodes should be from Sector B
        for node in sector_b.nodes.values():
            assert node.sector == "B"
        
        # Should have fewer nodes than the full graph
        assert len(sector_b.nodes) < len(graph.nodes)


class TestFaultTracing:
    """Test that fault tracing works correctly"""
    
    def test_trace_finds_origin(self):
        """Test that tracer locates the fault origin"""
        graph = build_demo_graph()
        tracer = FaultTracer(graph)
        
        trace = tracer.trace_fault("volume-button")
        
        assert trace.origin_node == "volume-button"
    
    def test_trace_finds_upstream(self):
        """Test that tracer finds upstream dependencies"""
        graph = build_demo_graph()
        tracer = FaultTracer(graph)
        
        trace = tracer.trace_fault("volume-button")
        
        # media-player should be upstream of volume-button
        assert "media-player" in trace.upstream_chain
    
    def test_trace_finds_downstream(self):
        """Test that tracer finds downstream dependencies"""
        graph = build_demo_graph()
        tracer = FaultTracer(graph)
        
        trace = tracer.trace_fault("volume-button")
        
        # volume-handler should be downstream of volume-button
        assert "volume-handler" in trace.downstream_chain
    
    def test_trace_identifies_faulting_edges(self):
        """Test that tracer identifies failing edges"""
        graph = build_demo_graph()
        tracer = FaultTracer(graph)
        
        trace = tracer.trace_fault("volume-button")
        
        # Should find faulting edges
        assert len(trace.faulting_edges) > 0
        
        # e8 (volume-button → volume-handler) should be faulting
        assert "e8" in trace.faulting_edges


class TestContextCard:
    """Test that Context Cards are generated correctly"""
    
    def test_context_card_generation(self):
        """Test that a Context Card can be generated"""
        graph = build_demo_graph()
        tracer = FaultTracer(graph)
        trace = tracer.trace_fault("volume-button")
        
        generator = ContextCardGenerator(graph)
        card = generator.generate(trace, "Volume button doesn't work")
        
        assert card.origin_node == "volume-button"
        assert len(card.relevant_nodes) > 0
        assert len(card.relevant_edges) > 0
    
    def test_context_card_token_savings(self):
        """Test that Context Card shows token savings"""
        graph = build_demo_graph()
        tracer = FaultTracer(graph)
        trace = tracer.trace_fault("volume-button")
        
        generator = ContextCardGenerator(graph)
        card = generator.generate(trace, "Volume button doesn't work")
        
        # Should have significant savings
        assert card.savings_percent > 50
        assert card.token_estimate < card.full_codebase_tokens
    
    def test_context_card_finds_reuse_candidates(self):
        """Test that Context Card identifies reuse opportunities"""
        graph = build_demo_graph()
        tracer = FaultTracer(graph)
        trace = tracer.trace_fault("volume-button")
        
        generator = ContextCardGenerator(graph)
        card = generator.generate(trace, "Volume button doesn't work")
        
        # volume-handler should be a reuse candidate
        assert len(card.reuse_candidates) > 0


class TestSandbox:
    """Test that sandbox workflow works correctly"""
    
    def test_sandbox_snapshot(self):
        """Test that sandbox can create a snapshot"""
        graph = build_demo_graph()
        sector_b_nodes = [n.id for n in graph.nodes.values() if n.sector == "B"]
        sector_b = graph.extract_subgraph(sector_b_nodes, "Sector-B")
        
        sandbox = SectorSandbox(sector_b)
        snapshot_id = sandbox.snapshot()
        
        assert snapshot_id is not None
        assert sandbox.state.phase == SandboxPhase.SNAPSHOT
    
    def test_sandbox_edit_guardrail(self):
        """Test that sandbox enforces edit guardrails"""
        graph = build_demo_graph()
        sector_b_nodes = [n.id for n in graph.nodes.values() if n.sector == "B"]
        sector_b = graph.extract_subgraph(sector_b_nodes, "Sector-B")
        
        sandbox = SectorSandbox(sector_b)
        sandbox.snapshot()
        
        tracer = FaultTracer(graph)
        trace = tracer.trace_fault("volume-button")
        generator = ContextCardGenerator(graph)
        card = generator.generate(trace, "Volume button doesn't work")
        
        # Should be able to edit volume-button (in the context card)
        sandbox.apply_edit("volume-button", ["fixed code"], card)
        
        # Should NOT be able to edit nodes outside the sector
        with pytest.raises(PermissionError):
            sandbox.apply_edit("nav-bar", ["bad code"], card)
    
    def test_sandbox_vet_pass(self):
        """Test that sandbox vetting passes for valid fixes"""
        graph = build_demo_graph()
        sector_b_nodes = [n.id for n in graph.nodes.values() if n.sector == "B"]
        sector_b = graph.extract_subgraph(sector_b_nodes, "Sector-B")
        
        sandbox = SectorSandbox(sector_b)
        sandbox.snapshot()
        
        tracer = FaultTracer(graph)
        trace = tracer.trace_fault("volume-button")
        generator = ContextCardGenerator(graph)
        card = generator.generate(trace, "Volume button doesn't work")
        
        # Apply a valid fix
        sandbox.apply_edit("volume-button", [
            "function VolumeButton() {",
            "  return <button onClick={handleVolumeClick}>🔊</button>;",
            "}"
        ], card)
        
        # Vet should pass
        results = sandbox.vet(card)
        assert all(r.passed for r in results)
    
    def test_sandbox_swap(self):
        """Test that sandbox can swap after successful vet"""
        graph = build_demo_graph()
        sector_b_nodes = [n.id for n in graph.nodes.values() if n.sector == "B"]
        sector_b = graph.extract_subgraph(sector_b_nodes, "Sector-B")
        
        sandbox = SectorSandbox(sector_b)
        sandbox.snapshot()
        
        tracer = FaultTracer(graph)
        trace = tracer.trace_fault("volume-button")
        generator = ContextCardGenerator(graph)
        card = generator.generate(trace, "Volume button doesn't work")
        
        # Apply fix and vet
        sandbox.apply_edit("volume-button", ["fixed"], card)
        sandbox.vet(card)
        
        # Swap should succeed
        success = sandbox.swap()
        assert success is True
        assert sandbox.state.swap_complete is True


class TestReuseDetection:
    """Test that reuse detection works correctly"""
    
    def test_reuse_detection_finds_candidates(self):
        """Test that reuse detector finds compatible code"""
        graph = build_demo_graph()
        sector_b_nodes = [n.id for n in graph.nodes.values() if n.sector == "B"]
        sector_b = graph.extract_subgraph(sector_b_nodes, "Sector-B")
        
        tracer = FaultTracer(graph)
        trace = tracer.trace_fault("volume-button")
        generator = ContextCardGenerator(graph)
        card = generator.generate(trace, "Volume button doesn't work")
        
        detector = ReuseDetector(sector_b)
        recommendation = detector.analyze(card)
        
        # Should recommend REUSE (volume-handler exists)
        assert recommendation.strategy == FixStrategy.REUSE
        assert recommendation.estimated_tokens <= 5
    
    def test_reuse_hierarchy_priority(self):
        """Test that reuse is preferred over repair and replace"""
        graph = build_demo_graph()
        sector_b_nodes = [n.id for n in graph.nodes.values() if n.sector == "B"]
        sector_b = graph.extract_subgraph(sector_b_nodes, "Sector-B")
        
        tracer = FaultTracer(graph)
        trace = tracer.trace_fault("volume-button")
        generator = ContextCardGenerator(graph)
        card = generator.generate(trace, "Volume button doesn't work")
        
        detector = ReuseDetector(sector_b)
        recommendation = detector.analyze(card)
        
        # REUSE should be chosen over REPAIR or REPLACE
        assert recommendation.strategy in [FixStrategy.REUSE, FixStrategy.REPAIR]
        assert recommendation.estimated_tokens <= 20


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
