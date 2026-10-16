import { useState, useEffect } from 'react';
import { SandboxPhase } from '../types';

interface PhaseInfo {
  phase: SandboxPhase;
  title: string;
  icon: string;
  description: string;
  details: string[];
  color: string;
}

const phases: PhaseInfo[] = [
  {
    phase: 'IDLE',
    title: 'Ready',
    icon: '⏸',
    description: 'Waiting for fault context',
    details: ['Context Card received from Tracer', 'Sandbox initialized'],
    color: 'gray',
  },
  {
    phase: 'SNAPSHOT',
    title: 'Snapshot',
    icon: '📸',
    description: 'Capture current state of sector',
    details: ['Serialize sector B DOM state', 'Store component tree snapshot', 'Record all event listeners', 'Save state values'],
    color: 'blue',
  },
  {
    phase: 'MOCK',
    title: 'Mock Dependencies',
    icon: '🎭',
    description: 'Replace external deps with mocks',
    details: ['Mock audio-engine API', 'Mock auth-state provider', 'Stub track-api responses', 'Isolate from Sector A & C'],
    color: 'purple',
  },
  {
    phase: 'EDIT',
    title: 'Apply Edit',
    icon: '✏️',
    description: 'AI applies fix in sandbox only',
    details: ['Fix: Add missing event listener binding', 'Guardrail: Edits restricted to sector B', 'No cross-sector modifications allowed', 'Edit validated against contract'],
    color: 'yellow',
  },
  {
    phase: 'VET',
    title: 'Vet Changes',
    icon: '🧪',
    description: 'Run automated reaction tests',
    details: ['Test: Button click fires event ✓', 'Test: Volume state updates ✓', 'Test: Audio engine receives level ✓', 'Test: Play button still works ✓', 'Test: No side effects on Sector A ✓'],
    color: 'cyan',
  },
  {
    phase: 'SWAP',
    title: 'Sector Swap',
    icon: '🔄',
    description: 'Atomic swap vetted sector into live app',
    details: ['All tests passed (5/5)', 'Atomic re-render of Sector B only', 'Sectors A & C untouched', 'Live app now has fix'],
    color: 'green',
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  gray: { bg: 'bg-gray-800', border: 'border-gray-600', text: 'text-gray-400', glow: '' },
  blue: { bg: 'bg-blue-900/30', border: 'border-blue-500/50', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
  purple: { bg: 'bg-purple-900/30', border: 'border-purple-500/50', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
  yellow: { bg: 'bg-yellow-900/30', border: 'border-yellow-500/50', text: 'text-yellow-400', glow: 'shadow-yellow-500/20' },
  cyan: { bg: 'bg-cyan-900/30', border: 'border-cyan-500/50', text: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
  green: { bg: 'bg-green-900/30', border: 'border-green-500/50', text: 'text-green-400', glow: 'shadow-green-500/20' },
};

export default function SandboxWorkflow() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (isRunning && currentPhase < phases.length) {
      const timer = setTimeout(() => {
        setLogs(prev => [...prev, `[${phases[currentPhase].icon}] ${phases[currentPhase].title}: ${phases[currentPhase].description}`]);
        if (currentPhase < phases.length - 1) {
          setCurrentPhase(prev => prev + 1);
        } else {
          setIsRunning(false);
          setLogs(prev => [...prev, '[✅] Sector swap complete! Fix deployed.']);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isRunning, currentPhase]);

  const startWorkflow = () => {
    setCurrentPhase(0);
    setLogs(['[🚀] Starting sandbox workflow for Sector B...']);
    setIsRunning(true);
  };

  const reset = () => {
    setCurrentPhase(0);
    setLogs([]);
    setIsRunning(false);
  };

  const phase = phases[currentPhase];
  const colors = colorMap[phase.color];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-2xl">📦</span> Auto-Sandbox Workflow
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Snapshot → Mock → Edit → Vet → Swap — never ship unvetted changes
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="px-3 py-1.5 text-xs rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={startWorkflow}
            disabled={isRunning}
            className="px-4 py-1.5 text-xs rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors disabled:opacity-50"
          >
            {isRunning ? '⏳ Running...' : '▶ Run Workflow'}
          </button>
        </div>
      </div>

      {/* Phase pipeline */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {phases.map((p, idx) => {
          const c = colorMap[p.color];
          const isActive = idx === currentPhase;
          const isComplete = idx < currentPhase || (currentPhase === phases.length - 1 && isRunning === false && logs.length > 0);
          
          return (
            <div key={p.phase} className="flex items-center">
              <div
                className={`flex flex-col items-center px-3 py-2 rounded-lg border transition-all min-w-[90px] ${
                  isActive
                    ? `${c.bg} ${c.border} shadow-lg ${c.glow}`
                    : isComplete
                    ? 'bg-green-900/20 border-green-700/30'
                    : 'bg-gray-800/50 border-gray-700/30'
                }`}
              >
                <span className="text-lg">{p.icon}</span>
                <span className={`text-[10px] mt-1 font-semibold ${
                  isActive ? c.text : isComplete ? 'text-green-400' : 'text-gray-500'
                }`}>
                  {p.title}
                </span>
                {isComplete && <span className="text-[9px] text-green-500">✓</span>}
              </div>
              {idx < phases.length - 1 && (
                <div className={`w-4 h-0.5 ${idx < currentPhase ? 'bg-green-600' : 'bg-gray-700'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current phase details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Phase info */}
        <div className={`rounded-xl border p-5 ${colors.bg} ${colors.border}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{phase.icon}</span>
            <div>
              <h4 className={`font-bold ${colors.text}`}>{phase.title}</h4>
              <p className="text-sm text-gray-400">{phase.description}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {phase.details.map((detail, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 text-xs p-2 rounded-lg ${
                  isRunning && idx <= (currentPhase === phases.length - 1 ? phase.details.length - 1 : 0)
                    ? 'bg-gray-800/50'
                    : 'bg-gray-800/30'
                }`}
              >
                <span className={colors.text}>
                  {detail.includes('✓') ? '✓' : detail.includes('✗') ? '✗' : '•'}
                </span>
                <span className="text-gray-300">{detail.replace('✓', '').replace('✗', '').trim()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live log */}
        <div className="bg-gray-900 rounded-xl border border-gray-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-gray-500 font-mono">sandbox.log</span>
          </div>
          <div className="font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-600 italic">Click "Run Workflow" to start...</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="text-gray-300">
                  <span className="text-gray-600">{`>`}</span> {log}
                </div>
              ))
            )}
            {isRunning && (
              <div className="text-purple-400 animate-pulse">▊</div>
            )}
          </div>
        </div>
      </div>

      {/* Guardrail visualization */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-4">
        <h4 className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-2">
          <span>🛡️</span> EDIT GUARDRAILS
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/20">
            <div className="text-xs font-bold text-red-400 mb-1">🚫 BLOCKED</div>
            <div className="text-[11px] text-gray-400">Cannot modify Sector A (nav-bar, auth-state)</div>
          </div>
          <div className="p-3 rounded-lg bg-green-900/20 border border-green-500/20">
            <div className="text-xs font-bold text-green-400 mb-1">✅ ALLOWED</div>
            <div className="text-[11px] text-gray-400">Can edit Sector B (volume-button chain)</div>
          </div>
          <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/20">
            <div className="text-xs font-bold text-red-400 mb-1">🚫 BLOCKED</div>
            <div className="text-[11px] text-gray-400">Cannot modify Sector C (settings, theme)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
