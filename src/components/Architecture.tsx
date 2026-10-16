export default function Architecture() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🏗️</span> Architecture & F.O.R.G.E. Integration
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Sandy Box + F.O.R.G.E. Protocol — Forced Optimization. Relentless. Guaranteed Execution.
        </p>
      </div>

      {/* Core concept */}
      <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/10 rounded-xl border border-amber-500/20 p-5">
        <div className="flex items-start gap-3">
          <span className="text-3xl">🏖️</span>
          <div>
            <h4 className="font-bold text-amber-400">The Sandbox Metaphor</h4>
            <p className="text-sm text-gray-300 mt-1">
              A big sandbox containing smaller sandboxes ("sectors"). Each sector is independently isolated 
              (iframe/shadow-DOM style) so if one needs a fix, only that sector refreshes — everything else 
              keeps running untouched.
            </p>
            <div className="mt-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/30">
              <p className="text-xs text-gray-400 italic">
                🎵 Think sound system: if one speaker is dead, you don't rewire the whole venue — 
                you trace just that speaker's chain (amp → power cord → connector), fix it in isolation, 
                and reconnect.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System diagram */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-5">
        <h4 className="text-xs font-bold text-gray-400 mb-4">SYSTEM FLOW</h4>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { icon: '👤', label: 'User Reports Bug', color: 'border-gray-500' },
            { icon: '→', label: '', color: '' },
            { icon: '🔍', label: 'Graphify Tracer', color: 'border-purple-500' },
            { icon: '→', label: '', color: '' },
            { icon: '📋', label: 'Context Card', color: 'border-cyan-500' },
            { icon: '→', label: '', color: '' },
            { icon: '🤖', label: 'AI (focused)', color: 'border-blue-500' },
            { icon: '→', label: '', color: '' },
            { icon: '📦', label: 'Sandbox Vet', color: 'border-yellow-500' },
            { icon: '→', label: '', color: '' },
            { icon: '✅', label: 'Sector Swap', color: 'border-green-500' },
          ].map((item, idx) => (
            item.label ? (
              <div key={idx} className={`flex flex-col items-center p-3 rounded-lg border ${item.color} bg-gray-800/50 min-w-[80px]`}>
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] text-gray-300 mt-1 text-center">{item.label}</span>
              </div>
            ) : (
              <span key={idx} className="text-gray-600 text-lg">→</span>
            )
          ))}
        </div>
      </div>

      {/* The Graphify Engine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-5">
          <h4 className="text-sm font-bold text-purple-400 flex items-center gap-2 mb-3">
            <span>🕸️</span> The Graphify Engine
          </h4>
          <div className="space-y-2 text-xs text-gray-300">
            <div className="p-2 bg-gray-800/50 rounded">
              <span className="text-purple-400 font-semibold">Nodes:</span> Every UI element/function
              <div className="text-gray-500 mt-0.5">id, type, status, input/output contract, dependencies</div>
            </div>
            <div className="p-2 bg-gray-800/50 rounded">
              <span className="text-purple-400 font-semibold">Edges:</span> Every interaction/event/data-flow
              <div className="text-gray-500 mt-0.5">source, target, signal_type, health status</div>
            </div>
            <div className="p-2 bg-gray-800/50 rounded">
              <span className="text-purple-400 font-semibold">Health:</span> Real-time edge monitoring
              <div className="text-gray-500 mt-0.5">PASSING (green) / FAILING (red dashed) / UNKNOWN (dimmed)</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-5">
          <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2 mb-3">
            <span>📋</span> Context Card
          </h4>
          <div className="space-y-2 text-xs text-gray-300">
            <div className="p-2 bg-gray-800/50 rounded">
              <span className="text-cyan-400 font-semibold">Compact payload:</span> Only the sub-graph
              <div className="text-gray-500 mt-0.5">Relevant nodes + edges + contracts only</div>
            </div>
            <div className="p-2 bg-gray-800/50 rounded">
              <span className="text-cyan-400 font-semibold">Token estimate:</span> Always included
              <div className="text-gray-500 mt-0.5">Shows % savings vs full codebase</div>
            </div>
            <div className="p-2 bg-gray-800/50 rounded">
              <span className="text-cyan-400 font-semibold">Directional paths:</span> Up + Down stream
              <div className="text-gray-500 mt-0.5">AI sees exactly what feeds the fault & what it affects</div>
            </div>
          </div>
        </div>
      </div>

      {/* F.O.R.G.E. Integration */}
      <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-xl border border-red-500/20 p-5">
        <h4 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-3">
          <span>⚡</span> F.O.R.G.E. Protocol Integration
        </h4>
        <div className="text-xs text-gray-300 space-y-2">
          <p>
            <span className="text-red-400 font-bold">F.O.R.G.E.</span> — "Forced Optimization. Relentless. Guaranteed Execution."
          </p>
          <p className="text-gray-400">
            Sandy Box is the execution layer for the F.O.R.G.E. protocol. When the AI receives a Context Card:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3">
            <div className="p-2 bg-gray-900/50 rounded border border-red-500/10">
              <div className="text-red-400 font-bold text-[10px]">FORCED</div>
              <div className="text-gray-400">AI must fix only within the Context Card scope</div>
            </div>
            <div className="p-2 bg-gray-900/50 rounded border border-orange-500/10">
              <div className="text-orange-400 font-bold text-[10px]">OPTIMIZATION</div>
              <div className="text-gray-400">Minimal token usage, maximum precision</div>
            </div>
            <div className="p-2 bg-gray-900/50 rounded border border-yellow-500/10">
              <div className="text-yellow-400 font-bold text-[10px]">RELENTLESS</div>
              <div className="text-gray-400">Auto-retry with guardrails if vet fails</div>
            </div>
            <div className="p-2 bg-gray-900/50 rounded border border-green-500/10">
              <div className="text-green-400 font-bold text-[10px]">GUARANTEED</div>
              <div className="text-gray-400">Vetted changes only — rollback if tests fail</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key principles */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-5">
        <h4 className="text-xs font-bold text-gray-400 mb-3">KEY PRINCIPLES</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
            <div className="text-lg mb-1">🎯</div>
            <div className="text-xs font-bold text-white">Surgical Precision</div>
            <div className="text-[11px] text-gray-400 mt-1">Fix one thing. Don't touch anything else. Ever.</div>
          </div>
          <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
            <div className="text-lg mb-1">🛡️</div>
            <div className="text-xs font-bold text-white">Edit Guardrails</div>
            <div className="text-[11px] text-gray-400 mt-1">AI edits are physically constrained to the sector boundary.</div>
          </div>
          <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
            <div className="text-lg mb-1">🔄</div>
            <div className="text-xs font-bold text-white">Atomic Swap</div>
            <div className="text-[11px] text-gray-400 mt-1">Vetted sector replaces live sector in one atomic operation.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
