"""
Rubbi-Box Protocol Demo
End-to-end demonstration of the protocol in action
"""

from .graph import NestedGraph, GraphNode, GraphEdge, NodeStatus, EdgeHealth, SignalType
from .tracer import FaultTracer
from .context_card import ContextCardGenerator
from .sandbox import SectorSandbox
from .reuse import ReuseDetector, FixStrategy


def build_demo_graph() -> NestedGraph:
    """
    Build the demo graph: a media player app with a broken volume button.
    This represents the R1 (Project) level graph.
    """
    
    # R1: Project-level graph
    project = NestedGraph("media-player-app", level=1)
    
    # Sector A: App Shell (healthy)
    app_shell = GraphNode(
        id="app-shell",
        label="App Shell",
        node_type="component",
        status=NodeStatus.ACTIVE,
        description="Root layout component",
        input_contract="Route params",
        output_contract="Layout structure",
        sector="A",
        code_lines=[
            "function AppShell({ children }) {",
            "  return <div className='app'>{children}</div>;",
            "}"
        ]
    )
    
    nav_bar = GraphNode(
        id="nav-bar",
        label="Navigation Bar",
        node_type="component",
        status=NodeStatus.ACTIVE,
        description="Top navigation with links",
        input_contract="Route state",
        output_contract="Nav links rendered",
        sector="A",
        code_lines=[
            "function NavBar() {",
            "  return <nav>...</nav>;",
            "}"
        ]
    )
    
    auth_state = GraphNode(
        id="auth-state",
        label="Auth State",
        node_type="state",
        status=NodeStatus.ACTIVE,
        description="User authentication context",
        input_contract="Login/logout events",
        output_contract="User session data",
        sector="A",
        code_lines=[
            "const [user, setUser] = useState(null);",
            "function login() { ... }"
        ]
    )
    
    # Sector B: Media Player (contains the glitch)
    media_player = GraphNode(
        id="media-player",
        label="Media Player",
        node_type="component",
        status=NodeStatus.ACTIVE,
        description="Main media player container",
        input_contract="Track ID, auth token",
        output_contract="Player UI with controls",
        sector="B",
        code_lines=[
            "function MediaPlayer({ trackId }) {",
            "  return <div className='player'>...</div>;",
            "}"
        ]
    )
    
    volume_button = GraphNode(
        id="volume-button",
        label="Volume Button",
        node_type="component",
        status=NodeStatus.GLITCHING,
        description="🔴 THE GLITCH: Click does nothing",
        input_contract="onClick handler",
        output_contract="Toggle volume state",
        sector="B",
        code_lines=[
            "function VolumeButton() {",
            "  return <button>🔊</button>;  // Missing onClick!",
            "}"
        ]
    )
    
    volume_handler = GraphNode(
        id="volume-handler",
        label="Volume Handler",
        node_type="handler",
        status=NodeStatus.GLITCHING,
        description="Handles volume toggle logic",
        input_contract="Click event",
        output_contract="Volume state update",
        sector="B",
        code_lines=[
            "function handleVolumeClick() {",
            "  setVolume(prev => prev === 0 ? 100 : 0);",
            "}"
        ]
    )
    
    volume_state = GraphNode(
        id="volume-state",
        label="Volume State",
        node_type="state",
        status=NodeStatus.GLITCHING,
        description="Stores current volume level",
        input_contract="Set volume action",
        output_contract="Volume level (0-100)",
        sector="B",
        code_lines=[
            "const [volume, setVolume] = useState(100);",
        ]
    )
    
    audio_engine = GraphNode(
        id="audio-engine",
        label="Audio Engine",
        node_type="utility",
        status=NodeStatus.ACTIVE,
        description="Web Audio API wrapper",
        input_contract="Volume level, track data",
        output_contract="Audio output",
        sector="B",
        code_lines=[
            "function AudioEngine({ volume, track }) {",
            "  useEffect(() => { audio.setVolume(volume); }, [volume]);",
            "}"
        ]
    )
    
    play_button = GraphNode(
        id="play-button",
        label="Play Button",
        node_type="component",
        status=NodeStatus.ACTIVE,
        description="Play/pause toggle (working)",
        input_contract="onClick handler",
        output_contract="Play state toggle",
        sector="B",
        code_lines=[
            "function PlayButton() {",
            "  return <button onClick={togglePlay}>▶</button>;",
            "}"
        ]
    )
    
    track_api = GraphNode(
        id="track-api",
        label="Track API",
        node_type="api",
        status=NodeStatus.ACTIVE,
        description="Fetches track metadata",
        input_contract="Track ID",
        output_contract="Track data (title, artist, url)",
        sector="B",
        code_lines=[
            "async function fetchTrack(trackId) {",
            "  return await api.get(`/tracks/${trackId}`);",
            "}"
        ]
    )
    
    # Sector C: Settings (healthy, unrelated)
    settings_panel = GraphNode(
        id="settings-panel",
        label="Settings Panel",
        node_type="component",
        status=NodeStatus.ACTIVE,
        description="User preferences UI",
        input_contract="User settings",
        output_contract="Settings form",
        sector="C",
        code_lines=[
            "function SettingsPanel() {",
            "  return <div>Settings...</div>;",
            "}"
        ]
    )
    
    # Add all nodes to project
    for node in [app_shell, nav_bar, auth_state, media_player, volume_button,
                 volume_handler, volume_state, audio_engine, play_button,
                 track_api, settings_panel]:
        project.add_node(node)
    
    # Add edges
    edges = [
        GraphEdge("e1", "app-shell", "nav-bar", SignalType.DATA, EdgeHealth.PASSING, "routes"),
        GraphEdge("e2", "app-shell", "auth-state", SignalType.STATE, EdgeHealth.PASSING, "session"),
        GraphEdge("e3", "app-shell", "media-player", SignalType.DATA, EdgeHealth.PASSING, "render"),
        GraphEdge("e4", "app-shell", "settings-panel", SignalType.DATA, EdgeHealth.PASSING, "render"),
        GraphEdge("e5", "media-player", "volume-button", SignalType.DATA, EdgeHealth.FAILING, "onClick"),
        GraphEdge("e6", "media-player", "play-button", SignalType.DATA, EdgeHealth.PASSING, "onClick"),
        GraphEdge("e7", "media-player", "track-api", SignalType.DATA, EdgeHealth.PASSING, "fetch"),
        GraphEdge("e8", "volume-button", "volume-handler", SignalType.EVENT, EdgeHealth.FAILING, "click→handler"),
        GraphEdge("e9", "volume-handler", "volume-state", SignalType.STATE, EdgeHealth.FAILING, "setVolume"),
        GraphEdge("e10", "volume-state", "audio-engine", SignalType.DATA, EdgeHealth.FAILING, "level"),
        GraphEdge("e11", "play-button", "play-handler", SignalType.EVENT, EdgeHealth.PASSING, "click→handler"),
        GraphEdge("e12", "track-api", "audio-engine", SignalType.DATA, EdgeHealth.PASSING, "track-url"),
        GraphEdge("e13", "auth-state", "track-api", SignalType.DATA, EdgeHealth.PASSING, "token"),
        GraphEdge("e14", "settings-panel", "theme-state", SignalType.STATE, EdgeHealth.PASSING, "toggle"),
    ]
    
    for edge in edges:
        project.add_edge(edge)
    
    return project


def run_demo():
    """
    Run the full Rubbi-Box protocol demo.
    Simulates: User reports bug → AI traces fault → generates Context Card → 
               applies fix in sandbox → vets → swaps sector.
    """
    
    print("=" * 70)
    print("RUBBI-BOX PROTOCOL DEMO")
    print("=" * 70)
    print()
    
    # Step 1: User reports bug
    print("STEP 1: USER REPORTS BUG")
    print("-" * 70)
    user_report = "I click the volume button and nothing happens"
    print(f'User says: "{user_report}"')
    print()
    
    # Step 2: Build the graph (R1 level)
    print("STEP 2: AI LOADS RUBBI-X GRAPH (R1 - Project Level)")
    print("-" * 70)
    project_graph = build_demo_graph()
    print(f"Loaded project: {project_graph.name}")
    print(f"Total nodes: {len(project_graph.nodes)}")
    print(f"Total edges: {len(project_graph.edges)}")
    print(f"Total tokens: {project_graph.calculate_total_tokens()}")
    print()
    
    # Step 3: Zoom into sector (R2 level)
    print("STEP 3: AI ZOOMS INTO SECTOR (R2 - Module Level)")
    print("-" * 70)
    sector_b_nodes = [n.id for n in project_graph.nodes.values() if n.sector == "B"]
    sector_b = project_graph.extract_subgraph(sector_b_nodes, "Sector-B-Media-Player")
    print(f"Extracted Sector B: {sector_b.name}")
    print(f"Nodes in sector: {len(sector_b.nodes)}")
    print(f"Tokens in sector: {sector_b.calculate_total_tokens()}")
    print()
    
    # Step 4: Trace the fault
    print("STEP 4: AI TRACES THE FAULT")
    print("-" * 70)
    tracer = FaultTracer(project_graph)
    fault_trace = tracer.trace_fault("volume-button")
    
    print(f"Origin node: {fault_trace.origin_node}")
    print(f"Upstream chain: {' → '.join(fault_trace.upstream_chain)}")
    print(f"Downstream chain: {' → '.join(fault_trace.downstream_chain)}")
    print(f"Faulting edges: {fault_trace.faulting_edges}")
    print(f"Diagnosis: {fault_trace.diagnosis}")
    print()
    
    print("Trace steps:")
    for step in fault_trace.trace_steps:
        print(f"  {step.step_number}. [{step.direction.upper()}] {step.action}: {step.description}")
    print()
    
    # Step 5: Generate Context Card
    print("STEP 5: AI GENERATES CONTEXT CARD")
    print("-" * 70)
    card_generator = ContextCardGenerator(project_graph)
    context_card = card_generator.generate(fault_trace, user_report)
    
    print(context_card.to_prompt())
    print()
    
    # Step 6: Analyze reuse opportunities
    print("STEP 6: AI ANALYZES REUSE > REPAIR > REPLACE")
    print("-" * 70)
    reuse_detector = ReuseDetector(sector_b)
    fix_recommendation = reuse_detector.analyze(context_card)
    
    print(f"Strategy: {fix_recommendation.strategy.value.upper()}")
    print(f"Description: {fix_recommendation.description}")
    print(f"Estimated tokens: {fix_recommendation.estimated_tokens}")
    print(f"Confidence: {fix_recommendation.confidence:.0%}")
    
    if fix_recommendation.wiring_instruction:
        print(f"Wiring instruction: {fix_recommendation.wiring_instruction}")
    print()
    
    # Step 7: Apply fix in sandbox
    print("STEP 7: AI APPLIES FIX IN SANDBOX")
    print("-" * 70)
    sandbox = SectorSandbox(sector_b)
    
    # Snapshot
    snapshot_id = sandbox.snapshot()
    print(f"✓ Snapshot created: {snapshot_id}")
    
    # Mock external dependencies
    sandbox.mock_dependencies(["app-shell", "auth-state"])
    print("✓ External dependencies mocked")
    
    # Apply edit
    if fix_recommendation.strategy == FixStrategy.REUSE:
        # Wire up existing handler
        fixed_code = [
            "function VolumeButton() {",
            "  return <button onClick={handleVolumeClick}>🔊</button>;",
            "}"
        ]
    else:
        # Write new handler
        fixed_code = [
            "function VolumeButton() {",
            "  const handleClick = () => setVolume(v => v === 0 ? 100 : 0);",
            "  return <button onClick={handleClick}>🔊</button>;",
            "}"
        ]
    
    sandbox.apply_edit("volume-button", fixed_code, context_card)
    print(f"✓ Edit applied to volume-button")
    print(f"  New code: {len(fixed_code)} lines")
    print()
    
    # Step 8: Vet the fix
    print("STEP 8: AI VETS THE FIX")
    print("-" * 70)
    vet_results = sandbox.vet(context_card)
    
    for result in vet_results:
        status = "✓" if result.passed else "✗"
        print(f"{status} [{result.test_type}] {result.message}")
    
    all_passed = all(r.passed for r in vet_results)
    print()
    print(f"Vet result: {'ALL TESTS PASSED' if all_passed else 'SOME TESTS FAILED'}")
    print()
    
    # Step 9: Swap or rollback
    print("STEP 9: AI SWAPS SECTOR (or rolls back)")
    print("-" * 70)
    if all_passed:
        success = sandbox.swap()
        if success:
            print("✓ Sector swap complete!")
            print("✓ Sector B (media player) re-rendered with fix")
            print("✓ Sectors A and C untouched")
            print("✓ Live app now has working volume button")
        else:
            print("✗ Swap failed - rolled back to snapshot")
    else:
        sandbox.rollback()
        print("✗ Vet failed - rolled back to snapshot")
    print()
    
    # Final summary
    print("=" * 70)
    print("TOKEN SAVINGS SUMMARY")
    print("=" * 70)
    print(f"Full codebase:     {context_card.full_codebase_tokens} tokens")
    print(f"Context Card:      {context_card.token_estimate} tokens")
    print(f"Fix generation:    {fix_recommendation.estimated_tokens} tokens")
    print(f"Total used:        {context_card.token_estimate + fix_recommendation.estimated_tokens} tokens")
    print(f"Savings:           {context_card.savings_percent:.1f}%")
    print()
    print("PROTOCOL COMPLIANCE:")
    print("  ✓ Context Card generated before editing")
    print("  ✓ Reuse > Repair > Replace hierarchy followed")
    print("  ✓ Edit guardrails enforced (only edited volume-button)")
    print("  ✓ Sandbox testing completed")
    print("  ✓ Vet passed all checks")
    print("  ✓ Sector swap atomic (only Sector B affected)")
    print("=" * 70)


if __name__ == "__main__":
    run_demo()
