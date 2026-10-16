import { useState } from 'react';
import FaultTracer from './components/FaultTracer';
import SandboxWorkflow from './components/SandboxWorkflow';
import TokenSavings from './components/TokenSavings';
import PuzzleView from './components/PuzzleView';
import Architecture from './components/Architecture';
import Implementation from './components/Implementation';
import LiveBenchmarks from './components/LiveBenchmarks';
import EnforcementDemo from './components/EnforcementDemo';
import ModeSystem from './components/ModeSystem';

type Tab = 'benchmarks' | 'enforcement' | 'modes' | 'overview' | 'tracer' | 'puzzle' | 'sandbox' | 'tokens' | 'implementation';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'benchmarks', label: '🔴 LIVE BENCHMARKS', icon: '📊' },
  { id: 'enforcement', label: '🛡️ ENFORCEMENT', icon: '🛡️' },
  { id: 'modes', label: '🎭 MODE SYSTEM', icon: '🎭' },
  { id: 'overview', label: 'Architecture', icon: '🏗️' },
  { id: 'tracer', label: 'Fault Tracer', icon: '🔍' },
  { id: 'puzzle', label: 'Puzzle View', icon: '🧩' },
  { id: 'sandbox', label: 'Sandbox', icon: '📦' },
  { id: 'tokens', label: 'Token Savings', icon: '💰' },
  { id: 'implementation', label: 'Implementation', icon: '✅' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('benchmarks');

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/3 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-gray-800/50 backdrop-blur-xl bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">
                  🏖️
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    Sandy Box
                  </span>
                </h1>
                <p className="text-[10px] text-gray-500 tracking-wider uppercase">
                  AI Development Sandbox Framework × F.O.R.G.E. Protocol
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-green-900/20 border border-green-500/20 text-[10px] text-green-400 font-mono">
                v1.0.0 — FORGE INTEGRATED
              </div>
              <a
                href="https://github.com/NewTonyStark23/F.O.R.G.E."
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-[10px] text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
              >
                ↗ F.O.R.G.E. Repo
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="relative border-b border-gray-800/30 backdrop-blur-sm bg-gray-900/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/5'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative max-w-7xl mx-auto px-4 py-6">
        {/* Hero banner for benchmarks */}
        {activeTab === 'benchmarks' && (
          <div className="mb-6 bg-gradient-to-r from-red-900/20 via-orange-900/10 to-amber-900/20 rounded-2xl border border-red-500/20 p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🔴</div>
              <div>
                <h2 className="text-2xl font-black text-white">
                  LIVE EXECUTION — No Fake Numbers
                </h2>
                <p className="text-gray-400 mt-2 text-sm">
                  This tab runs the actual Rubbi-Box engine in your browser right now. 
                  Every metric you see is measured in real-time from actual code execution. 
                  No theoretical projections. No estimates. Just facts.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="px-2 py-1 rounded bg-green-900/30 border border-green-500/20 text-[10px] text-green-400">
                    ✓ Real Execution
                  </div>
                  <div className="px-2 py-1 rounded bg-green-900/30 border border-green-500/20 text-[10px] text-green-400">
                    ✓ Measured Tokens
                  </div>
                  <div className="px-2 py-1 rounded bg-green-900/30 border border-green-500/20 text-[10px] text-green-400">
                    ✓ Verified Tests
                  </div>
                  <div className="px-2 py-1 rounded bg-cyan-900/30 border border-cyan-500/20 text-[10px] text-cyan-400">
                    ↻ Re-runnable
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero banner for enforcement */}
        {activeTab === 'enforcement' && (
          <div className="mb-6 bg-gradient-to-r from-purple-900/20 via-red-900/10 to-orange-900/20 rounded-2xl border border-purple-500/20 p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🛡️</div>
              <div>
                <h2 className="text-2xl font-black text-white">
                  ENFORCEMENT LAYER — Protocol is BINDING
                </h2>
                <p className="text-gray-400 mt-2 text-sm">
                  This is the code that makes Rubbi-Box unbreakable. You physically cannot skip steps. 
                  Try to edit outside the sector — BLOCKED. Try to swap without vetting — BLOCKED. 
                  Try to skip the Context Card — BLOCKED. Every violation is logged.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="px-2 py-1 rounded bg-red-900/30 border border-red-500/20 text-[10px] text-red-400">
                    🚫 Edit Guardrails
                  </div>
                  <div className="px-2 py-1 rounded bg-red-900/30 border border-red-500/20 text-[10px] text-red-400">
                    🚫 Vet Gate
                  </div>
                  <div className="px-2 py-1 rounded bg-red-900/30 border border-red-500/20 text-[10px] text-red-400">
                    🚫 Sector Boundaries
                  </div>
                  <div className="px-2 py-1 rounded bg-green-900/30 border border-green-500/20 text-[10px] text-green-400">
                    ✓ Audit Trail
                  </div>
                  <div className="px-2 py-1 rounded bg-green-900/30 border border-green-500/20 text-[10px] text-green-400">
                    ✓ Compliance Score
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero banner for modes */}
        {activeTab === 'modes' && (
          <div className="mb-6 bg-gradient-to-r from-blue-900/20 via-purple-900/10 to-pink-900/20 rounded-2xl border border-purple-500/20 p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🎭</div>
              <div>
                <h2 className="text-2xl font-black text-white">
                  CONTEXT-AWARE PROTOCOL
                </h2>
                <p className="text-gray-400 mt-2 text-sm">
                  The enforcement layer now detects the conversation context and only activates 
                  when there's actual code to edit. For conversations and brainstorming, 
                  the AI responds naturally and quickly without over-analyzing.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="px-2 py-1 rounded bg-blue-900/30 border border-blue-500/20 text-[10px] text-blue-400">
                    💬 Conversation Mode
                  </div>
                  <div className="px-2 py-1 rounded bg-purple-900/30 border border-purple-500/20 text-[10px] text-purple-400">
                    💡 Brainstorm Mode
                  </div>
                  <div className="px-2 py-1 rounded bg-red-900/30 border border-red-500/20 text-[10px] text-red-400">
                    🛡️ Code Edit Mode
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero banner for overview */}
        {activeTab === 'overview' && (
          <div className="mb-8 bg-gradient-to-r from-amber-900/20 via-orange-900/10 to-red-900/20 rounded-2xl border border-amber-500/20 p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-black">
                  Stop AI from{' '}
                  <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                    regenerating everything
                  </span>
                </h2>
                <p className="text-gray-400 mt-3 text-sm md:text-base max-w-xl">
                  When one button breaks, AI agents shouldn't rewrite the entire page. 
                  Sandy Box isolates the fault, generates a minimal Context Card, 
                  and ensures the AI fixes <em>only</em> what's broken — saving 80–97% of tokens.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-800/50 border border-gray-700/30 text-[11px] text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-green-500" /> Sectors Isolated
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-800/50 border border-gray-700/30 text-[11px] text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-purple-500" /> Fault Tracing
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-800/50 border border-gray-700/30 text-[11px] text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" /> Context Cards
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-800/50 border border-gray-700/30 text-[11px] text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" /> Auto-Sandbox
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-800/50 border border-gray-700/30 text-[11px] text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> Edit Guardrails
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="relative w-48 h-48">
                  {/* Animated sandbox visualization */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20" />
                  <div className="absolute top-4 left-4 right-4 bottom-4 rounded-xl bg-gray-900/80 border border-gray-700/50 p-3">
                    <div className="grid grid-cols-3 grid-rows-3 gap-1.5 h-full">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-md border transition-all ${
                            i === 4
                              ? 'bg-red-500/20 border-red-500/50 animate-pulse'
                              : i === 1 || i === 3 || i === 5 || i === 7
                              ? 'bg-cyan-500/10 border-cyan-500/20'
                              : 'bg-gray-800/50 border-gray-700/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-gray-900 border border-gray-700 text-[9px] text-gray-400 font-mono">
                    SECTOR B (isolated)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab content */}
        <div className="transition-all">
          {activeTab === 'benchmarks' && <LiveBenchmarks />}
          {activeTab === 'enforcement' && <EnforcementDemo />}
          {activeTab === 'modes' && <ModeSystem />}
          {activeTab === 'overview' && <Architecture />}
          {activeTab === 'tracer' && <FaultTracer />}
          {activeTab === 'puzzle' && <PuzzleView />}
          {activeTab === 'sandbox' && <SandboxWorkflow />}
          {activeTab === 'tokens' && <TokenSavings />}
          {activeTab === 'implementation' && <Implementation />}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-gray-800/30 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-600">
              Sandy Box × F.O.R.G.E. — Forced Optimization. Relentless. Guaranteed Execution.
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>Built for AI agents that respect boundaries</span>
              <span className="text-gray-700">|</span>
              <span className="text-amber-500/60">🏖️ Stay in your sandbox</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
