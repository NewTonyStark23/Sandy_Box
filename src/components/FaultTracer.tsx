import { useState } from 'react';
import { TracerStep, ContextCard } from '../types';
import { faultTraceResult, demoNodes, demoEdges } from '../data/demoGraph';
import GraphView from './GraphView';

const bugReports = [
  { text: "I click the volume button and nothing happens", nodeId: 'volume-button' },
  { text: "Play button stopped working after last update", nodeId: 'play-button' },
  { text: "Track info isn't loading from the API", nodeId: 'track-api' },
];

const tracerSteps: TracerStep[] = [
  { step: 1, action: 'User Report Received', nodeId: 'volume-button', direction: 'origin', description: '"I click the volume button and nothing happens"' },
  { step: 2, action: 'Locate Fault Node', nodeId: 'volume-button', direction: 'origin', description: 'Graph search finds: volume-button (status: GLITCHING)' },
  { step: 3, action: 'Trace Upstream', nodeId: 'media-player', direction: 'upstream', description: 'What feeds into volume-button? → media-player renders it' },
  { step: 4, action: 'Trace Upstream', nodeId: 'app-shell', direction: 'upstream', description: 'What feeds media-player? → app-shell (healthy, stop here)' },
  { step: 5, action: 'Trace Downstream', nodeId: 'volume-handler', direction: 'downstream', description: 'What does volume-button affect? → volume-handler receives its events' },
  { step: 6, action: 'Trace Downstream', nodeId: 'volume-state', direction: 'downstream', description: 'volume-handler updates → volume-state' },
  { step: 7, action: 'Trace Downstream', nodeId: 'audio-engine', direction: 'downstream', description: 'volume-state feeds → audio-engine (end of chain)' },
  { step: 8, action: 'Context Card Generated', nodeId: 'volume-button', direction: 'origin', description: 'Sub-graph isolated: 5 nodes, 5 edges. Ready for AI.' },
];

export default function FaultTracer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const step = tracerSteps[currentStep];

  // Determine highlighted nodes/edges based on current step
  const getHighlightedNodes = (): string[] => {
    if (currentStep === 0) return [];
    const nodes: string[] = ['volume-button'];
    if (currentStep >= 3) nodes.push('media-player');
    if (currentStep >= 4) nodes.push('app-shell');
    if (currentStep >= 5) nodes.push('volume-handler');
    if (currentStep >= 6) nodes.push('volume-state');
    if (currentStep >= 7) nodes.push('audio-engine');
    return nodes;
  };

  const getHighlightedEdges = (): string[] => {
    if (currentStep < 3) return [];
    const edges: string[] = ['e5']; // media-player → volume-button
    if (currentStep >= 4) edges.push('e3'); // app-shell → media-player
    if (currentStep >= 5) edges.push('e8'); // volume-button → volume-handler
    if (currentStep >= 6) edges.push('e9'); // volume-handler → volume-state
    if (currentStep >= 7) edges.push('e10'); // volume-state → audio-engine
    return edges;
  };

  const contextCard: ContextCard = {
    relevantNodes: demoNodes.filter(n => faultTraceResult.relevantNodes.includes(n.id)),
    relevantEdges: demoEdges.filter(e => faultTraceResult.relevantEdges.includes(e.id)),
    tokenEstimate: faultTraceResult.tokenEstimate,
    fullCodebaseTokens: faultTraceResult.fullCodebaseTokens,
    savingsPercent: faultTraceResult.savingsPercent,
    faultDescription: 'Volume button click produces no response',
    upstreamPath: faultTraceResult.upstreamPath,
    downstreamPath: faultTraceResult.downstreamPath,
  };

  const playSequence = () => {
    setIsPlaying(true);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= tracerSteps.length) {
        clearInterval(interval);
        setIsPlaying(false);
        return;
      }
      setCurrentStep(step);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🔍</span> Fault Tracer
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Walk the dependency chain — upstream & downstream — to isolate the fault sub-graph
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setCurrentStep(0); setIsPlaying(false); }}
            className="px-3 py-1.5 text-xs rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={playSequence}
            disabled={isPlaying}
            className="px-4 py-1.5 text-xs rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors disabled:opacity-50"
          >
            {isPlaying ? '⏳ Tracing...' : '▶ Auto-Trace'}
          </button>
        </div>
      </div>

      {/* Bug report input */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">🐛</span>
          <span className="text-xs font-bold text-gray-400">USER BUG REPORT</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Describe what's broken..."
              defaultValue={bugReports[0].text}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <span className="text-[9px] text-gray-600 font-mono">demo scenario</span>
            </div>
          </div>
          <button
            onClick={() => { setCurrentStep(1); setIsPlaying(false); }}
            className="px-4 py-2 text-xs rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 transition-colors"
          >
            🔍 Trace
          </button>
        </div>
        <div className="flex gap-2 mt-2">
          {bugReports.map((report, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentStep(1); setIsPlaying(false); }}
              className="text-[10px] px-2 py-1 rounded bg-gray-800/50 text-gray-500 hover:text-gray-300 hover:bg-gray-700/50 transition-colors truncate max-w-[200px]"
            >
              "{report.text}"
            </button>
          ))}
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {tracerSteps.map((_, idx) => (
          <button
            key={idx}
            onClick={() => { setCurrentStep(idx); setIsPlaying(false); }}
            className={`h-2 flex-1 rounded-full transition-all ${
              idx <= currentStep
                ? idx === currentStep ? 'bg-purple-500' : 'bg-purple-700'
                : 'bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Current step info */}
      {currentStep > 0 && step && (
        <div className={`p-4 rounded-xl border ${
          step.direction === 'upstream' ? 'border-blue-500/30 bg-blue-500/5' :
          step.direction === 'downstream' ? 'border-orange-500/30 bg-orange-500/5' :
          'border-purple-500/30 bg-purple-500/5'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`text-2xl ${
              step.direction === 'upstream' ? 'text-blue-400' :
              step.direction === 'downstream' ? 'text-orange-400' :
              'text-purple-400'
            }`}>
              {step.direction === 'upstream' ? '↑' : step.direction === 'downstream' ? '↓' : '◎'}
            </span>
            <div>
              <div className="text-sm font-semibold text-white">
                Step {step.step}: {step.action}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{step.description}</div>
            </div>
            <span className="ml-auto px-2 py-0.5 text-xs rounded bg-gray-800 text-gray-300 font-mono">
              {step.nodeId}
            </span>
          </div>
        </div>
      )}

      {/* Graph + Context Card side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Graph */}
        <div className="lg:col-span-2 bg-gray-900/50 rounded-xl border border-gray-700/50 p-2">
          <GraphView
            nodes={demoNodes}
            edges={demoEdges}
            highlightedNodes={getHighlightedNodes()}
            highlightedEdges={getHighlightedEdges()}
            dimUnrelated={currentStep >= 5}
            showSectors={true}
          />
        </div>

        {/* Context Card */}
        <div className="space-y-3">
          {currentStep >= 7 ? (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-500/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <h4 className="text-sm font-bold text-cyan-400">CONTEXT CARD</h4>
              </div>
              <div className="text-xs text-gray-300 space-y-2">
                <div className="p-2 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-500">Fault:</span>{' '}
                  <span className="text-red-400">{contextCard.faultDescription}</span>
                </div>
                <div className="p-2 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-500">Upstream:</span>{' '}
                  <span className="text-blue-400">{contextCard.upstreamPath.join(' → ')}</span>
                </div>
                <div className="p-2 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-500">Downstream:</span>{' '}
                  <span className="text-orange-400">{contextCard.downstreamPath.join(' → ')}</span>
                </div>
                <div className="p-2 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-500">Nodes in scope:</span>{' '}
                  <span className="text-white">{contextCard.relevantNodes.length}</span>
                </div>
                <div className="p-2 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-500">Edges in scope:</span>{' '}
                  <span className="text-white">{contextCard.relevantEdges.length}</span>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Token estimate:</span>
                  <span className="text-cyan-400 font-mono">{contextCard.tokenEstimate}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-500">Full codebase:</span>
                  <span className="text-gray-400 font-mono line-through">{contextCard.fullCodebaseTokens}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-500">Savings:</span>
                  <span className="text-green-400 font-bold font-mono">{contextCard.savingsPercent}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-4 flex items-center justify-center h-48">
              <div className="text-center text-gray-500">
                <div className="text-3xl mb-2">📋</div>
                <div className="text-sm">Context Card appears after trace completes</div>
                <div className="text-xs mt-1">Step 8 of the trace</div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-3">
            <h4 className="text-xs font-bold text-gray-400 mb-2">LEGEND</h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-400">Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-400">Glitching</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500" />
                <span className="text-gray-400">Upstream</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-orange-500/30 border border-orange-500" />
                <span className="text-gray-400">Downstream</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
