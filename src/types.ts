// Sandy Box - Type Definitions
// F.O.R.G.E. Protocol Integration: Forced Optimization. Relentless. Guaranteed Execution.

export type NodeStatus = 'ACTIVE' | 'GLITCHING' | 'ISOLATED' | 'FIXED';
export type NodeType = 'component' | 'event-handler' | 'state' | 'api-call' | 'utility' | 'prop';
export type EdgeHealth = 'PASSING' | 'FAILING' | 'UNKNOWN';
export type SignalType = 'EVENT' | 'DATA' | 'STATE';
export type SandboxPhase = 'IDLE' | 'SNAPSHOT' | 'MOCK' | 'EDIT' | 'VET' | 'SWAP' | 'ROLLBACK';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  status: NodeStatus;
  description: string;
  inputContract: string;
  outputContract: string;
  x: number;
  y: number;
  sector: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  signalType: SignalType;
  health: EdgeHealth;
  label: string;
}

export interface ContextCard {
  relevantNodes: GraphNode[];
  relevantEdges: GraphEdge[];
  tokenEstimate: number;
  fullCodebaseTokens: number;
  savingsPercent: number;
  faultDescription: string;
  upstreamPath: string[];
  downstreamPath: string[];
}

export interface SandboxState {
  phase: SandboxPhase;
  snapshotId: string | null;
  editedNodes: string[];
  vetResults: { nodeId: string; passed: boolean; message: string }[];
  swapComplete: boolean;
  rolledBack: boolean;
}

export interface TracerStep {
  step: number;
  action: string;
  nodeId: string;
  direction: 'upstream' | 'downstream' | 'origin';
  description: string;
}
