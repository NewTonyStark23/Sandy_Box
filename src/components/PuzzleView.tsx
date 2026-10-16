import { useState } from 'react';
import { demoNodes, demoEdges } from '../data/demoGraph';
import GraphView from './GraphView';

type ViewMode = 'full' | 'fault' | 'sector-b';

export default function PuzzleView() {
  const [viewMode, setViewMode] = useState<ViewMode>('full');

  const getHighlightedNodes = (): string[] => {
    switch (viewMode) {
      case 'fault':
        return ['volume-button', 'volume-handler', 'volume-state', 'audio-engine', 'media-player'];
      case 'sector-b':
        return demoNodes.filter(n => n.sector === 'B').map(n => n.id);
      default:
        return [];
    }
  };

  const getHighlightedEdges = (): string[] => {
    switch (viewMode) {
      case 'fault':
        return ['e5', 'e8', 'e9', 'e10', 'e7'];
      case 'sector-b':
        return demoEdges.filter(e => {
          const sourceNode = demoNodes.find(n => n.id === e.source);
          const targetNode = demoNodes.find(n => n.id === e.target);
          return sourceNode?.sector === 'B' || targetNode?.sector === 'B';
        }).map(e => e.id);
      default:
        return [];
    }
  };

  // Stats
  const totalNodes = demoNodes.length;
  const totalEdges = demoEdges.length;
  const passingEdges = demoEdges.filter(e => e.health === 'PASSING').length;
  const failingEdges = demoEdges.filter(e => e.health === 'FAILING').length;
  const glitchingNodes = demoNodes.filter(n => n.status === 'GLITCHING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🧩</span> Puzzle View
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            See which connectors are working (green) vs broken (red dashed) vs unrelated (dimmed)
          </p>
        </div>
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
          {[
            { mode: 'full' as ViewMode, label: 'Full Map' },
            { mode: 'fault' as ViewMode, label: 'Fault Focus' },
            { mode: 'sector-b' as ViewMode, label: 'Sector B' },
          ].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                viewMode === mode
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3">
        <div className="px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/30">
          <span className="text-[10px] text-gray-500">NODES</span>
          <span className="ml-2 text-sm font-bold text-white">{totalNodes}</span>
        </div>
        <div className="px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/30">
          <span className="text-[10px] text-gray-500">EDGES</span>
          <span className="ml-2 text-sm font-bold text-white">{totalEdges}</span>
        </div>
        <div className="px-3 py-2 rounded-lg bg-green-900/20 border border-green-500/20">
          <span className="text-[10px] text-green-500">PASSING</span>
          <span className="ml-2 text-sm font-bold text-green-400">{passingEdges}</span>
        </div>
        <div className="px-3 py-2 rounded-lg bg-red-900/20 border border-red-500/20">
          <span className="text-[10px] text-red-500">FAILING</span>
          <span className="ml-2 text-sm font-bold text-red-400">{failingEdges}</span>
        </div>
        <div className="px-3 py-2 rounded-lg bg-red-900/20 border border-red-500/20">
          <span className="text-[10px] text-red-500">GLITCHING</span>
          <span className="ml-2 text-sm font-bold text-red-400">{glitchingNodes}</span>
        </div>
      </div>

      {/* Main graph */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-3">
        <GraphView
          nodes={demoNodes}
          edges={demoEdges}
          highlightedNodes={getHighlightedNodes()}
          highlightedEdges={getHighlightedEdges()}
          dimUnrelated={viewMode !== 'full'}
          showSectors={true}
        />
      </div>

      {/* Connection health table */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-4">
        <h4 className="text-xs font-bold text-gray-400 mb-3">CONNECTION HEALTH MAP</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-700/50">
                <th className="text-left py-2 px-2">Edge</th>
                <th className="text-left py-2 px-2">Source → Target</th>
                <th className="text-left py-2 px-2">Signal</th>
                <th className="text-left py-2 px-2">Health</th>
                <th className="text-left py-2 px-2">In Fault Scope?</th>
              </tr>
            </thead>
            <tbody>
              {demoEdges.map(edge => {
                const inScope = getHighlightedEdges().includes(edge.id);
                return (
                  <tr key={edge.id} className={`border-b border-gray-800/30 ${!inScope && viewMode !== 'full' ? 'opacity-30' : ''}`}>
                    <td className="py-1.5 px-2 font-mono text-gray-400">{edge.id}</td>
                    <td className="py-1.5 px-2 text-gray-300">
                      {edge.source} → {edge.target}
                    </td>
                    <td className="py-1.5 px-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        edge.signalType === 'EVENT' ? 'bg-yellow-900/30 text-yellow-400' :
                        edge.signalType === 'DATA' ? 'bg-blue-900/30 text-blue-400' :
                        'bg-purple-900/30 text-purple-400'
                      }`}>
                        {edge.signalType}
                      </span>
                    </td>
                    <td className="py-1.5 px-2">
                      <span className={`flex items-center gap-1 ${
                        edge.health === 'PASSING' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          edge.health === 'PASSING' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        {edge.health}
                      </span>
                    </td>
                    <td className="py-1.5 px-2">
                      {inScope ? (
                        <span className="text-cyan-400">● Yes</span>
                      ) : (
                        <span className="text-gray-600">○ No</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
