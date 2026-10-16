import { useState, useEffect } from 'react';
import { ProtocolEnforcer, EnforcementState, AuditEntry } from '../enforcement/protocol';

export default function EnforcementDemo() {
  const [enforcer, setEnforcer] = useState<ProtocolEnforcer | null>(null);
  const [state, setState] = useState<EnforcementState | null>(null);
  const [showViolationDemo, setShowViolationDemo] = useState(false);

  useEffect(() => {
    // Initialize the enforcer
    const newEnforcer = new ProtocolEnforcer((newState) => {
      setState(newState);
    });
    setEnforcer(newEnforcer);
    setState(newEnforcer.getState());
  }, []);

  const handleReportBug = () => {
    if (!enforcer) return;
    enforcer.reportBug('Volume button click does nothing');
  };

  const handleGenerateContextCard = () => {
    if (!enforcer) return;
    enforcer.generateContextCard();
  };

  const handleCheckReuse = () => {
    if (!enforcer) return;
    enforcer.checkReuse();
    enforcer.createSnapshot();
  };

  const handleApplyEdit = () => {
    if (!enforcer) return;
    enforcer.applyEdit('volume-button', [
      'function VolumeButton() {',
      '  return <button onClick={handleVolumeClick}>🔊</button>;',
      '}'
    ]);
  };

  const handleRunVet = () => {
    if (!enforcer) return;
    enforcer.runVet();
  };

  const handleSwap = () => {
    if (!enforcer) return;
    enforcer.swapSector();
  };

  const handleRunFullProtocol = async () => {
    if (!enforcer) return;
    
    // Run through the entire protocol step by step
    enforcer.reportBug('Volume button click does nothing');
    await delay(500);
    
    enforcer.generateContextCard();
    await delay(500);
    
    enforcer.checkReuse();
    enforcer.createSnapshot();
    await delay(500);
    
    enforcer.applyEdit('volume-button', [
      'function VolumeButton() {',
      '  return <button onClick={handleVolumeClick}>🔊</button>;',
      '}'
    ]);
    await delay(500);
    
    enforcer.runVet();
    await delay(500);
    
    enforcer.swapSector();
  };

  const handleReset = () => {
    if (!enforcer) return;
    const newEnforcer = new ProtocolEnforcer((newState) => {
      setState(newState);
    });
    setEnforcer(newEnforcer);
    setState(newEnforcer.getState());
    setShowViolationDemo(false);
  };

  // Violation demos
  const handleAttemptEditOutsideSector = () => {
    if (!enforcer) return;
    setShowViolationDemo(true);
    enforcer.attemptEditOutsideSector('nav-bar'); // Outside sector!
  };

  const handleAttemptSwapWithoutVet = () => {
    if (!enforcer) return;
    setShowViolationDemo(true);
    enforcer.attemptSwapWithoutVet();
  };

  const handleAttemptSkipContextCard = () => {
    if (!enforcer) return;
    setShowViolationDemo(true);
    enforcer.attemptSkipContextCard();
  };

  if (!state) {
    return <div className="text-gray-400">Loading enforcement engine...</div>;
  }

  const isComplete = state.phase === 'SWAPPED' || state.phase === 'ROLLED_BACK';
  const violations = enforcer?.getViolations() || [];
  const auditTrail = enforcer?.getAuditTrail() || [];
  const complianceScore = enforcer?.getComplianceScore() || 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🛡️</span> Enforcement Layer
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            The protocol is BINDING — you physically cannot skip steps
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleRunFullProtocol}
            disabled={isComplete}
            className="px-4 py-1.5 text-xs rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors disabled:opacity-50"
          >
            ▶ Run Full Protocol
          </button>
        </div>
      </div>

      {/* Current Phase */}
      <div className={`p-4 rounded-xl border ${getPhaseColor(state.phase)}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Current Phase</div>
            <div className="text-lg font-bold text-white mt-1">
              {enforcer?.getPhaseLabel()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Compliance Score</div>
            <div className={`text-2xl font-black ${
              complianceScore === 100 ? 'text-green-400' : 
              complianceScore >= 80 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {complianceScore.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Steps */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-5">
        <h4 className="text-xs font-bold text-gray-400 mb-3">PROTOCOL STEPS</h4>
        <div className="space-y-2">
          <ProtocolStep
            step={1}
            label="Report Bug"
            description="User describes what's broken"
            status={getStepStatus(state, 'IDLE', 'MAPPING')}
            onClick={handleReportBug}
            disabled={state.phase !== 'IDLE'}
          />
          <ProtocolStep
            step={2}
            label="Generate Context Card"
            description="Compressed sub-graph with token savings"
            status={getStepStatus(state, 'CONTEXT_CARD_REQUIRED', 'REUSE_CHECK_REQUIRED')}
            onClick={handleGenerateContextCard}
            disabled={state.phase !== 'CONTEXT_CARD_REQUIRED'}
          />
          <ProtocolStep
            step={3}
            label="Check Reuse + Snapshot"
            description="Reuse > Repair > Replace hierarchy"
            status={getStepStatus(state, 'REUSE_CHECK_REQUIRED', 'SANDBOX_REQUIRED')}
            onClick={handleCheckReuse}
            disabled={state.phase !== 'REUSE_CHECK_REQUIRED'}
          />
          <ProtocolStep
            step={4}
            label="Apply Edit (Guardrails Active)"
            description="Edit only within declared sector"
            status={getStepStatus(state, 'SANDBOX_REQUIRED', 'VET_REQUIRED')}
            onClick={handleApplyEdit}
            disabled={state.phase !== 'SANDBOX_REQUIRED'}
          />
          <ProtocolStep
            step={5}
            label="Vet Fix (5 Tests)"
            description="Type, state flow, side effects, integration, token budget"
            status={getStepStatus(state, 'VET_REQUIRED', 'SWAP_READY')}
            onClick={handleRunVet}
            disabled={state.phase !== 'VET_REQUIRED'}
          />
          <ProtocolStep
            step={6}
            label="Swap Sector"
            description="Atomic swap of vetted sector"
            status={getStepStatus(state, 'SWAP_READY', 'SWAPPED')}
            onClick={handleSwap}
            disabled={state.phase !== 'SWAP_READY'}
          />
        </div>
      </div>

      {/* Violation Demo */}
      <div className="bg-red-900/10 rounded-xl border border-red-500/20 p-5">
        <h4 className="text-xs font-bold text-red-400 mb-3 flex items-center gap-2">
          <span>🚫</span> TRY TO BREAK THE PROTOCOL
        </h4>
        <p className="text-xs text-gray-400 mb-3">
          These actions should be BLOCKED by the enforcement layer:
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAttemptEditOutsideSector}
            className="px-3 py-1.5 text-xs rounded-lg bg-red-900/30 border border-red-500/30 text-red-400 hover:bg-red-900/50 transition-colors"
          >
            ✗ Edit Outside Sector
          </button>
          <button
            onClick={handleAttemptSwapWithoutVet}
            className="px-3 py-1.5 text-xs rounded-lg bg-red-900/30 border border-red-500/30 text-red-400 hover:bg-red-900/50 transition-colors"
          >
            ✗ Swap Without Vet
          </button>
          <button
            onClick={handleAttemptSkipContextCard}
            className="px-3 py-1.5 text-xs rounded-lg bg-red-900/30 border border-red-500/30 text-red-400 hover:bg-red-900/50 transition-colors"
          >
            ✗ Skip Context Card
          </button>
        </div>
        {showViolationDemo && violations.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-red-900/20 border border-red-500/30">
            <div className="text-xs font-bold text-red-400 mb-1">VIOLATIONS DETECTED:</div>
            <div className="text-xs text-gray-300 space-y-1">
              {violations.slice(-3).map((v, i) => (
                <div key={i}>• {v}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Audit Trail */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-5">
        <h4 className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-2">
          <span>📜</span> AUDIT TRAIL ({auditTrail.length} entries)
        </h4>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {auditTrail.length === 0 ? (
            <div className="text-xs text-gray-600 italic">No activity yet</div>
          ) : (
            auditTrail.slice().reverse().map((entry, idx) => (
              <AuditEntryRow key={idx} entry={entry} />
            ))
          )}
        </div>
      </div>

      {/* Vet Results */}
      {state.vetResults.length > 0 && (
        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-5">
          <h4 className="text-xs font-bold text-gray-400 mb-3">VET RESULTS</h4>
          <div className="space-y-2">
            {state.vetResults.map((result, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  result.passed
                    ? 'bg-green-900/10 border-green-500/20'
                    : 'bg-red-900/10 border-red-500/20'
                }`}
              >
                <span className={`text-lg ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                  {result.passed ? '✓' : '✗'}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{result.test}</div>
                  <div className="text-xs text-gray-400">{result.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Context Card Preview */}
      {state.contextCard && (
        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-5">
          <h4 className="text-xs font-bold text-gray-400 mb-3">CONTEXT CARD</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-2xl font-black text-cyan-400">
                {state.contextCard.relevantNodes.length}
              </div>
              <div className="text-[10px] text-gray-500">Nodes in Scope</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-cyan-400">
                {state.contextCard.relevantEdges.length}
              </div>
              <div className="text-[10px] text-gray-500">Edges in Scope</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-green-400">
                {state.contextCard.savingsPercent.toFixed(0)}%
              </div>
              <div className="text-[10px] text-gray-500">Token Savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-purple-400">
                {state.contextCard.tokenEstimate}
              </div>
              <div className="text-[10px] text-gray-500">Tokens Used</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper components
function ProtocolStep({
  step,
  label,
  description,
  status,
  onClick,
  disabled
}: {
  step: number;
  label: string;
  description: string;
  status: 'pending' | 'active' | 'complete';
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
      status === 'complete'
        ? 'bg-green-900/10 border-green-500/20'
        : status === 'active'
        ? 'bg-purple-900/20 border-purple-500/30 shadow-lg shadow-purple-500/10'
        : 'bg-gray-800/30 border-gray-700/30 opacity-50'
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        status === 'complete'
          ? 'bg-green-500 text-white'
          : status === 'active'
          ? 'bg-purple-500 text-white animate-pulse'
          : 'bg-gray-700 text-gray-500'
      }`}>
        {status === 'complete' ? '✓' : step}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="text-xs text-gray-400">{description}</div>
      </div>
      {status === 'active' && (
        <button
          onClick={onClick}
          disabled={disabled}
          className="px-3 py-1 text-xs rounded bg-purple-600 text-white hover:bg-purple-500 transition-colors disabled:opacity-50"
        >
          Execute
        </button>
      )}
      {status === 'complete' && (
        <span className="text-xs text-green-400">✓ Enforced</span>
      )}
    </div>
  );
}

function AuditEntryRow({ entry }: { entry: AuditEntry }) {
  return (
    <div className={`flex items-start gap-2 p-2 rounded text-xs ${
      entry.blocked ? 'bg-red-900/10' : entry.enforced ? 'bg-gray-800/30' : 'bg-gray-800/10'
    }`}>
      <span className={`mt-0.5 ${
        entry.blocked ? 'text-red-400' : entry.enforced ? 'text-green-400' : 'text-gray-500'
      }`}>
        {entry.blocked ? '🚫' : entry.enforced ? '✓' : '•'}
      </span>
      <div className="flex-1">
        <div className="text-gray-300">
          <span className="font-semibold">{entry.action}</span>
        </div>
        <div className="text-gray-500 text-[10px]">{entry.detail}</div>
      </div>
      <span className="text-[9px] text-gray-600 font-mono">
        {new Date(entry.timestamp).toLocaleTimeString()}
      </span>
    </div>
  );
}

// Helper functions
function getPhaseColor(phase: string): string {
  if (phase.includes('VIOLATION')) return 'bg-red-900/20 border-red-500/30';
  if (phase.includes('SWAPPED')) return 'bg-green-900/20 border-green-500/30';
  if (phase.includes('ROLLED_BACK')) return 'bg-yellow-900/20 border-yellow-500/30';
  if (phase.includes('READY')) return 'bg-cyan-900/20 border-cyan-500/30';
  return 'bg-purple-900/20 border-purple-500/30';
}

function getStepStatus(
  state: EnforcementState,
  requiredPhase: string,
  completedPhase: string
): 'pending' | 'active' | 'complete' {
  const phaseOrder = [
    'IDLE', 'MAPPING', 'TRACING', 'CONTEXT_CARD_REQUIRED',
    'REUSE_CHECK_REQUIRED', 'SANDBOX_REQUIRED', 'VET_REQUIRED',
    'SWAP_READY', 'SWAPPED', 'ROLLED_BACK'
  ];
  
  const currentIdx = phaseOrder.indexOf(state.phase);
  const requiredIdx = phaseOrder.indexOf(requiredPhase);
  const completedIdx = phaseOrder.indexOf(completedPhase);
  
  if (currentIdx >= completedIdx) return 'complete';
  if (currentIdx >= requiredIdx) return 'active';
  return 'pending';
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
