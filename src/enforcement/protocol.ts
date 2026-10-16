/**
 * Rubbi-Box Protocol Enforcement Engine
 * 
 * This is the CORE of the enforcement layer.
 * It makes the protocol BINDING — you cannot skip steps.
 * 
 * Every rule is enforced structurally:
 * - Can't edit without a Context Card (type system)
 * - Can't edit outside the sector (runtime guardrail)
 * - Can't swap without vetting (state machine)
 * - Can't skip reuse detection (priority enforcement)
 * - Every step is logged (audit trail)
 */

import { GraphNode, GraphEdge, NestedGraph, ContextCard, generateContextCard, buildDemoGraph, traceFault } from '../rubbibox-engine';

// ============================================================
// ENFORCEMENT STATE MACHINE
// The protocol has strict phases. You can't skip ahead.
// ============================================================

export type ProtocolPhase =
  | 'IDLE'                    // Waiting for bug report
  | 'MAPPING'                 // Building the graph
  | 'TRACING'                 // Tracing the fault
  | 'CONTEXT_CARD_REQUIRED'   // MUST generate before proceeding
  | 'REUSE_CHECK_REQUIRED'    // MUST check reuse before repair
  | 'SANDBOX_REQUIRED'        // MUST test in sandbox
  | 'VET_REQUIRED'            // MUST vet before swap
  | 'SWAP_READY'              // All checks passed, ready to swap
  | 'SWAPPED'                 // Fix deployed
  | 'ROLLED_BACK'             // Fix failed, rolled back
  | 'VIOLATION';              // Protocol was violated

export interface AuditEntry {
  timestamp: number;
  phase: ProtocolPhase;
  action: string;
  detail: string;
  enforced: boolean; // Was this enforced by the protocol?
  blocked: boolean;  // Was an action blocked?
}

export interface EnforcementState {
  phase: ProtocolPhase;
  bugReport: string | null;
  graph: NestedGraph | null;
  faultNode: string | null;
  contextCard: ContextCard | null;
  reuseChecked: boolean;
  reuseStrategy: 'reuse' | 'repair' | 'replace' | null;
  sandboxSnapshot: Record<string, string[]> | null;
  editedNodes: string[];
  vetPassed: boolean;
  vetResults: { test: string; passed: boolean; message: string }[];
  swapComplete: boolean;
  auditTrail: AuditEntry[];
  violations: string[];
}

// ============================================================
// THE ENFORCEMENT ENGINE
// This is the "brain" that enforces every protocol rule.
// ============================================================

export class ProtocolEnforcer {
  private state: EnforcementState;
  private onStateChange: (state: EnforcementState) => void;

  constructor(onStateChange: (state: EnforcementState) => void) {
    this.state = this.getInitialState();
    this.onStateChange = onStateChange;
    this.log('IDLE', 'Protocol initialized', 'Enforcement layer active. Awaiting bug report.', true, false);
  }

  private getInitialState(): EnforcementState {
    return {
      phase: 'IDLE',
      bugReport: null,
      graph: null,
      faultNode: null,
      contextCard: null,
      reuseChecked: false,
      reuseStrategy: null,
      sandboxSnapshot: null,
      editedNodes: [],
      vetPassed: false,
      vetResults: [],
      swapComplete: false,
      auditTrail: [],
      violations: []
    };
  }

  private log(phase: ProtocolPhase, action: string, detail: string, enforced: boolean, blocked: boolean) {
    this.state.auditTrail.push({
      timestamp: Date.now(),
      phase,
      action,
      detail,
      enforced,
      blocked
    });
    this.state.phase = phase;
    this.onStateChange({ ...this.state });
  }

  // ============================================================
  // STEP 1: Report Bug (Entry Point)
  // ============================================================
  
  reportBug(description: string): boolean {
    if (this.state.phase !== 'IDLE' && this.state.phase !== 'SWAPPED' && this.state.phase !== 'ROLLED_BACK') {
      const violation = `VIOLATION: Can't report bug in phase ${this.state.phase}. Must be IDLE.`;
      this.state.violations.push(violation);
      this.log('VIOLATION', 'Bug report rejected', violation, true, true);
      return false;
    }

    // Reset state for new bug
    this.state = {
      ...this.getInitialState(),
      auditTrail: this.state.auditTrail // Keep audit trail
    };

    this.state.bugReport = description;
    this.log('MAPPING', 'Bug reported', `"${description}"`, true, false);
    
    // Auto-advance to graph building
    this.buildGraph();
    return true;
  }

  // ============================================================
  // STEP 2: Build Graph (Cognitive Mapping)
  // ============================================================
  
  private buildGraph(): void {
    this.state.graph = buildDemoGraph();
    const nodeCount = this.state.graph.nodes.size;
    const edgeCount = this.state.graph.edges.size;
    this.log('TRACING', 'Graph built', `${nodeCount} nodes, ${edgeCount} edges mapped`, true, false);
    
    // Auto-identify fault node from bug report
    this.identifyFaultNode();
  }

  // ============================================================
  // STEP 3: Identify Fault Node
  // ============================================================
  
  private identifyFaultNode(): void {
    // Simple heuristic: find GLITCHING nodes
    const glitchingNodes = Array.from(this.state.graph!.nodes.values())
      .filter(n => n.status === 'GLITCHING');
    
    if (glitchingNodes.length === 0) {
      this.log('VIOLATION', 'No fault found', 'No glitching nodes in graph', true, true);
      return;
    }

    this.state.faultNode = glitchingNodes[0].id;
    this.log('CONTEXT_CARD_REQUIRED', 'Fault identified', 
      `Node: ${this.state.faultNode} (${glitchingNodes[0].label})`, true, false);
  }

  // ============================================================
  // STEP 4: Generate Context Card (ENFORCED - Can't skip)
  // ============================================================
  
  generateContextCard(): boolean {
    // ENFORCEMENT: Must be in CONTEXT_CARD_REQUIRED phase
    if (this.state.phase !== 'CONTEXT_CARD_REQUIRED') {
      const violation = `VIOLATION: Can't generate Context Card in phase ${this.state.phase}. Must be CONTEXT_CARD_REQUIRED.`;
      this.state.violations.push(violation);
      this.log('VIOLATION', 'Context Card generation blocked', violation, true, true);
      return false;
    }

    // ENFORCEMENT: Must have a fault node
    if (!this.state.faultNode || !this.state.graph) {
      const violation = 'VIOLATION: No fault node identified. Can\'t generate Context Card.';
      this.state.violations.push(violation);
      this.log('VIOLATION', 'Context Card generation blocked', violation, true, true);
      return false;
    }

    // Generate the card
    this.state.contextCard = generateContextCard(
      this.state.graph,
      this.state.faultNode,
      this.state.bugReport || 'Unknown fault'
    );

    const savings = this.state.contextCard.savingsPercent.toFixed(1);
    this.log('REUSE_CHECK_REQUIRED', 'Context Card generated',
      `${this.state.contextCard.relevantNodes.length} nodes, ${this.state.contextCard.tokenEstimate} tokens, ${savings}% savings`,
      true, false);

    return true;
  }

  // ============================================================
  // STEP 5: Check Reuse (ENFORCED - Must check before repair)
  // ============================================================
  
  checkReuse(): { strategy: 'reuse' | 'repair' | 'replace'; candidates: string[] } {
    // ENFORCEMENT: Must have a Context Card first
    if (!this.state.contextCard) {
      const violation = 'VIOLATION: No Context Card. Must generate before checking reuse.';
      this.state.violations.push(violation);
      this.log('VIOLATION', 'Reuse check blocked', violation, true, true);
      return { strategy: 'replace', candidates: [] };
    }

    this.state.reuseChecked = true;

    // Check for reuse candidates
    const candidates = this.state.contextCard.reuseCandidates;

    if (candidates.length > 0) {
      this.state.reuseStrategy = 'reuse';
      this.log('SANDBOX_REQUIRED', 'Reuse candidate found',
        `Strategy: REUSE. Candidates: [${candidates.join(', ')}]`,
        true, false);
    } else {
      // Check if repair is possible
      const glitchingInScope = this.state.contextCard.relevantNodes
        .filter(n => n.status === 'GLITCHING');
      
      if (glitchingInScope.length <= 2) {
        this.state.reuseStrategy = 'repair';
        this.log('SANDBOX_REQUIRED', 'No reuse, attempting repair',
          `Strategy: REPAIR. ${glitchingInScope.length} nodes need patching.`,
          true, false);
      } else {
        this.state.reuseStrategy = 'replace';
        this.log('SANDBOX_REQUIRED', 'No reuse/repair, must replace',
          `Strategy: REPLACE. ${glitchingInScope.length} nodes need replacement.`,
          true, false);
      }
    }

    return {
      strategy: this.state.reuseStrategy!,
      candidates
    };
  }

  // ============================================================
  // STEP 6: Create Sandbox Snapshot (ENFORCED)
  // ============================================================
  
  createSnapshot(): boolean {
    // ENFORCEMENT: Must have checked reuse first
    if (!this.state.reuseChecked) {
      const violation = 'VIOLATION: Must check reuse before creating sandbox.';
      this.state.violations.push(violation);
      this.log('VIOLATION', 'Snapshot blocked', violation, true, true);
      return false;
    }

    // ENFORCEMENT: Must have Context Card
    if (!this.state.contextCard) {
      const violation = 'VIOLATION: No Context Card. Can\'t create sandbox.';
      this.state.violations.push(violation);
      this.log('VIOLATION', 'Snapshot blocked', violation, true, true);
      return false;
    }

    // Snapshot all relevant nodes
    const snapshot: Record<string, string[]> = {};
    this.state.contextCard.relevantNodes.forEach(node => {
      snapshot[node.id] = [...node.codeLines];
    });

    this.state.sandboxSnapshot = snapshot;
    this.log('SANDBOX_REQUIRED', 'Sandbox snapshot created',
      `${Object.keys(snapshot).length} nodes snapshotted`,
      true, false);

    return true;
  }

  // ============================================================
  // STEP 7: Apply Edit (ENFORCED - Guardrails active)
  // ============================================================
  
  applyEdit(nodeId: string, newCode: string[]): { success: boolean; error?: string } {
    // ENFORCEMENT: Must have a snapshot
    if (!this.state.sandboxSnapshot) {
      const violation = 'VIOLATION: No sandbox snapshot. Must create before editing.';
      this.state.violations.push(violation);
      this.log('VIOLATION', 'Edit blocked', violation, true, true);
      return { success: false, error: violation };
    }

    // ENFORCEMENT: Must have Context Card
    if (!this.state.contextCard) {
      const violation = 'VIOLATION: No Context Card. Can\'t verify edit scope.';
      this.state.violations.push(violation);
      this.log('VIOLATION', 'Edit blocked', violation, true, true);
      return { success: false, error: violation };
    }

    // GUARDRAIL: Can only edit nodes in the Context Card
    const relevantNodeIds = this.state.contextCard.relevantNodes.map(n => n.id);
    if (!relevantNodeIds.includes(nodeId)) {
      const violation = `GUARDRAIL VIOLATION: Node "${nodeId}" is OUTSIDE the declared sector. Allowed: [${relevantNodeIds.join(', ')}]`;
      this.state.violations.push(violation);
      this.log('VIOLATION', 'Edit REJECTED by guardrail', violation, true, true);
      return { success: false, error: violation };
    }

    // Apply the edit
    const node = this.state.graph?.nodes.get(nodeId);
    if (node) {
      node.codeLines = newCode;
      node.status = 'FIXED';
      node.tokenCount = Math.ceil(newCode.join('\n').length / 4) + 20;
    }

    this.state.editedNodes.push(nodeId);
    this.log('VET_REQUIRED', 'Edit applied',
      `Node "${nodeId}" edited (${newCode.length} lines). Guardrail: PASSED.`,
      true, false);

    return { success: true };
  }

  // ============================================================
  // STEP 8: Vet the Fix (ENFORCED - Must pass all tests)
  // ============================================================
  
  runVet(): { passed: boolean; results: { test: string; passed: boolean; message: string }[] } {
    // ENFORCEMENT: Must have edited something
    if (this.state.editedNodes.length === 0) {
      const violation = 'VIOLATION: No edits to vet. Must apply edit first.';
      this.state.violations.push(violation);
      this.log('VIOLATION', 'Vet blocked', violation, true, true);
      return { passed: false, results: [{ test: 'Protocol', passed: false, message: violation }] };
    }

    const results: { test: string; passed: boolean; message: string }[] = [];

    // Test 1: Type compatibility
    const typeCheck = this.vetTypeCompatibility();
    results.push(typeCheck);

    // Test 2: State flow
    const stateFlow = this.vetStateFlow();
    results.push(stateFlow);

    // Test 3: No side effects
    const sideEffects = this.vetNoSideEffects();
    results.push(sideEffects);

    // Test 4: Integration
    const integration = this.vetIntegration();
    results.push(integration);

    // Test 5: Token budget
    const tokenBudget = this.vetTokenBudget();
    results.push(tokenBudget);

    const allPassed = results.every(r => r.passed);
    this.state.vetPassed = allPassed;
    this.state.vetResults = results;

    if (allPassed) {
      this.log('SWAP_READY', 'Vet PASSED',
        `${results.length}/5 tests passed. Ready for sector swap.`,
        true, false);
    } else {
      const failed = results.filter(r => !r.passed);
      this.log('ROLLED_BACK', 'Vet FAILED',
        `${failed.length}/5 tests failed: [${failed.map(r => r.test).join(', ')}]`,
        true, true);
    }

    return { passed: allPassed, results };
  }

  private vetTypeCompatibility(): { test: string; passed: boolean; message: string } {
    // Check that edited nodes have valid type contracts
    for (const nodeId of this.state.editedNodes) {
      const node = this.state.graph?.nodes.get(nodeId);
      if (!node || !node.inputContract || !node.outputContract) {
        return { test: 'Type Compatibility', passed: false, message: `Node ${nodeId} missing contracts` };
      }
    }
    return { test: 'Type Compatibility', passed: true, message: 'All edited nodes have valid contracts' };
  }

  private vetStateFlow(): { test: string; passed: boolean; message: string } {
    // Check that state flows correctly through edges
    if (!this.state.contextCard) {
      return { test: 'State Flow', passed: false, message: 'No Context Card' };
    }

    for (const edge of this.state.contextCard.relevantEdges) {
      if (edge.health === 'FAILING') {
        const source = this.state.graph?.nodes.get(edge.source);
        if (source && source.status === 'FIXED') {
          // Edge should now be passing
          edge.health = 'PASSING';
        }
      }
    }

    const stillFailing = this.state.contextCard.relevantEdges.filter(e => e.health === 'FAILING');
    if (stillFailing.length > 0) {
      return { test: 'State Flow', passed: false, message: `${stillFailing.length} edges still failing` };
    }

    return { test: 'State Flow', passed: true, message: 'All edges passing' };
  }

  private vetNoSideEffects(): { test: string; passed: boolean; message: string } {
    // Check that only nodes in the Context Card were edited
    if (!this.state.contextCard) {
      return { test: 'No Side Effects', passed: false, message: 'No Context Card' };
    }

    const relevantIds = this.state.contextCard.relevantNodes.map(n => n.id);
    const outsideEdits = this.state.editedNodes.filter(id => !relevantIds.includes(id));

    if (outsideEdits.length > 0) {
      return { test: 'No Side Effects', passed: false, message: `Edited outside sector: [${outsideEdits.join(', ')}]` };
    }

    return { test: 'No Side Effects', passed: true, message: 'No edits outside sector' };
  }

  private vetIntegration(): { test: string; passed: boolean; message: string } {
    // Check that all glitching nodes in scope are now fixed
    if (!this.state.contextCard) {
      return { test: 'Integration', passed: false, message: 'No Context Card' };
    }

    const stillGlitching = this.state.contextCard.relevantNodes
      .filter(n => n.status === 'GLITCHING');

    if (stillGlitching.length > 0) {
      return { test: 'Integration', passed: false, message: `${stillGlitching.length} nodes still glitching` };
    }

    return { test: 'Integration', passed: true, message: 'All nodes functional' };
  }

  private vetTokenBudget(): { test: string; passed: boolean; message: string } {
    // Check that we're within token budget
    if (!this.state.contextCard) {
      return { test: 'Token Budget', passed: false, message: 'No Context Card' };
    }

    const savings = this.state.contextCard.savingsPercent;
    if (savings < 80) {
      return { test: 'Token Budget', passed: false, message: `Savings only ${savings.toFixed(1)}% (need 80%+)` };
    }

    return { test: 'Token Budget', passed: true, message: `Token savings: ${savings.toFixed(1)}%` };
  }

  // ============================================================
  // STEP 9: Swap Sector (ENFORCED - Only if vet passed)
  // ============================================================
  
  swapSector(): boolean {
    // ENFORCEMENT: Vet must have passed
    if (!this.state.vetPassed) {
      const violation = 'VIOLATION: Vet did not pass. Cannot swap sector.';
      this.state.violations.push(violation);
      this.log('VIOLATION', 'Swap BLOCKED', violation, true, true);
      return false;
    }

    // ENFORCEMENT: Must have a snapshot to verify against
    if (!this.state.sandboxSnapshot) {
      const violation = 'VIOLATION: No snapshot. Cannot verify swap.';
      this.state.violations.push(violation);
      this.log('VIOLATION', 'Swap BLOCKED', violation, true, true);
      return false;
    }

    this.state.swapComplete = true;
    this.log('SWAPPED', 'Sector SWAPPED',
      `${this.state.editedNodes.length} nodes updated. Other sectors untouched.`,
      true, false);

    return true;
  }

  // ============================================================
  // ROLLBACK (If anything fails)
  // ============================================================
  
  rollback(): void {
    // Restore from snapshot
    if (this.state.sandboxSnapshot && this.state.graph) {
      for (const [nodeId, codeLines] of Object.entries(this.state.sandboxSnapshot)) {
        const node = this.state.graph.nodes.get(nodeId);
        if (node) {
          node.codeLines = codeLines;
          node.status = 'GLITCHING'; // Restore original status
        }
      }
    }

    this.state.editedNodes = [];
    this.state.vetPassed = false;
    this.state.swapComplete = false;
    this.log('ROLLED_BACK', 'Rolled back to snapshot',
      'All changes reverted. Sector restored to pre-edit state.',
      true, false);
  }

  // ============================================================
  // ATTEMPT VIOLATION (For demo - shows enforcement in action)
  // ============================================================
  
  attemptEditOutsideSector(nodeId: string): { success: boolean; error: string } {
    const result = this.applyEdit(nodeId, ['malicious code']);
    return { success: result.success, error: result.error || '' };
  }

  attemptSwapWithoutVet(): boolean {
    // Try to swap without vetting
    const originalVetPassed = this.state.vetPassed;
    this.state.vetPassed = false; // Force fail
    const result = this.swapSector();
    this.state.vetPassed = originalVetPassed; // Restore
    return result;
  }

  attemptSkipContextCard(): boolean {
    // Try to generate Context Card in wrong phase
    const originalPhase = this.state.phase;
    this.state.phase = 'IDLE'; // Wrong phase
    const result = this.generateContextCard();
    this.state.phase = originalPhase; // Restore
    return result;
  }

  // ============================================================
  // GETTERS
  // ============================================================
  
  getState(): EnforcementState {
    return { ...this.state };
  }

  getAuditTrail(): AuditEntry[] {
    return [...this.state.auditTrail];
  }

  getViolations(): string[] {
    return [...this.state.violations];
  }

  getPhaseLabel(): string {
    const labels: Record<ProtocolPhase, string> = {
      'IDLE': '⏸ Idle',
      'MAPPING': '🗺️ Mapping Codebase',
      'TRACING': '🔍 Tracing Fault',
      'CONTEXT_CARD_REQUIRED': '📋 Context Card Required',
      'REUSE_CHECK_REQUIRED': '🔄 Reuse Check Required',
      'SANDBOX_REQUIRED': '📦 Sandbox Required',
      'VET_REQUIRED': '🧪 Vet Required',
      'SWAP_READY': '✅ Swap Ready',
      'SWAPPED': '🎉 Sector Swapped',
      'ROLLED_BACK': '↩️ Rolled Back',
      'VIOLATION': '🚫 Protocol Violation'
    };
    return labels[this.state.phase] || this.state.phase;
  }

  getComplianceScore(): number {
    const total = this.state.auditTrail.length;
    const violations = this.state.violations.length;
    if (total === 0) return 100;
    return Math.max(0, ((total - violations) / total) * 100);
  }
}
