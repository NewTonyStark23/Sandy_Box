import { useState } from 'react';

interface RepairScenario {
  name: string;
  description: string;
  fullTokens: number;
  sandyboxTokens: number;
  icon: string;
}

const scenarios: RepairScenario[] = [
  { name: 'Dead Button', description: 'Volume button unresponsive', fullTokens: 4200, sandyboxTokens: 340, icon: '🔘' },
  { name: 'Broken Form', description: 'Submit handler not firing', fullTokens: 5800, sandyboxTokens: 420, icon: '📝' },
  { name: 'API Timeout', description: 'Fetch not returning data', fullTokens: 3600, sandyboxTokens: 280, icon: '🌐' },
  { name: 'State Desync', description: 'UI not reflecting state', fullTokens: 6200, sandyboxTokens: 510, icon: '🔄' },
  { name: 'CSS Layout', description: 'Element mispositioned', fullTokens: 4800, sandyboxTokens: 180, icon: '🎨' },
  { name: 'Auth Redirect', description: 'Login not redirecting', fullTokens: 7100, sandyboxTokens: 620, icon: '🔐' },
];

export default function TokenSavings() {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const scenario = scenarios[selectedScenario];
  const savings = Math.round((1 - scenario.sandyboxTokens / scenario.fullTokens) * 100);
  const tokensSaved = scenario.fullTokens - scenario.sandyboxTokens;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-2xl">💰</span> Token Savings Model
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          ~80–97% token reduction per repair — the core value proposition
        </p>
      </div>

      {/* Big savings number */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 rounded-xl border border-green-500/30 p-6 text-center">
          <div className="text-4xl font-black text-green-400">{savings}%</div>
          <div className="text-xs text-green-300/70 mt-1">TOKEN SAVINGS</div>
        </div>
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-xl border border-blue-500/30 p-6 text-center">
          <div className="text-4xl font-black text-blue-400">{tokensSaved.toLocaleString()}</div>
          <div className="text-xs text-blue-300/70 mt-1">TOKENS SAVED</div>
        </div>
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 rounded-xl border border-purple-500/30 p-6 text-center">
          <div className="text-4xl font-black text-purple-400">{scenario.sandyboxTokens}</div>
          <div className="text-xs text-purple-300/70 mt-1">TOKENS USED (Sandy Box)</div>
        </div>
      </div>

      {/* Scenario selector */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-4">
        <h4 className="text-xs font-bold text-gray-400 mb-3">REPAIR SCENARIOS</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {scenarios.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedScenario(idx)}
              className={`p-3 rounded-lg border text-left transition-all ${
                idx === selectedScenario
                  ? 'bg-purple-900/30 border-purple-500/50 shadow-lg shadow-purple-500/10'
                  : 'bg-gray-800/30 border-gray-700/30 hover:border-gray-600'
              }`}
            >
              <div className="text-lg">{s.icon}</div>
              <div className="text-xs font-semibold text-white mt-1">{s.name}</div>
              <div className="text-[10px] text-gray-500">{s.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Visual comparison */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-5">
        <h4 className="text-xs font-bold text-gray-400 mb-4">TOKEN COMPARISON</h4>
        <div className="space-y-4">
          {/* Traditional approach */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-red-400">❌ Traditional AI (full codebase)</span>
              <span className="text-red-400 font-mono">{scenario.fullTokens.toLocaleString()} tokens</span>
            </div>
            <div className="h-6 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                style={{ width: '100%' }}
              >
                <span className="text-[9px] text-white font-bold">FULL REGENERATION</span>
              </div>
            </div>
          </div>

          {/* Sandy Box approach */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-green-400">✅ Sandy Box (Context Card only)</span>
              <span className="text-green-400 font-mono">{scenario.sandyboxTokens.toLocaleString()} tokens</span>
            </div>
            <div className="h-6 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                style={{ width: `${(scenario.sandyboxTokens / scenario.fullTokens) * 100}%` }}
              >
                <span className="text-[9px] text-white font-bold">TARGETED FIX</span>
              </div>
            </div>
          </div>
        </div>

        {/* What's included */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-red-900/10 border border-red-500/20">
            <div className="text-xs font-bold text-red-400 mb-2">Traditional sends to AI:</div>
            <ul className="text-[11px] text-gray-400 space-y-1">
              <li>• Entire component file (all 200+ lines)</li>
              <li>• All imports and dependencies</li>
              <li>• All state management code</li>
              <li>• All event handlers (working + broken)</li>
              <li>• All CSS/styling code</li>
              <li>• Test files</li>
              <li>• Config files</li>
            </ul>
          </div>
          <div className="p-3 rounded-lg bg-green-900/10 border border-green-500/20">
            <div className="text-xs font-bold text-green-400 mb-2">Sandy Box sends to AI:</div>
            <ul className="text-[11px] text-gray-400 space-y-1">
              <li>• Only the faulty node code (12 lines)</li>
              <li>• Its direct upstream/downstream (3 nodes)</li>
              <li>• Type contracts (input/output only)</li>
              <li>• The specific failing edge</li>
              <li>• Mock interfaces for external deps</li>
              <li className="text-green-400">→ AI knows exactly what to fix</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Monthly projection */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-gray-700/50 p-5">
        <h4 className="text-xs font-bold text-gray-400 mb-3">MONTHLY PROJECTION (20 repairs/day)</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-black text-red-400">
              {(scenario.fullTokens * 20 * 30 / 1000000).toFixed(1)}M
            </div>
            <div className="text-[10px] text-gray-500 mt-1">Traditional tokens/month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-green-400">
              {(scenario.sandyboxTokens * 20 * 30 / 1000000).toFixed(1)}M
            </div>
            <div className="text-[10px] text-gray-500 mt-1">Sandy Box tokens/month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-cyan-400">
              ${((scenario.fullTokens - scenario.sandyboxTokens) * 20 * 30 * 0.00003).toFixed(0)}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">Est. monthly savings ($)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
