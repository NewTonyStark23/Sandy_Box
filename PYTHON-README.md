# Rubbi-Box Protocol - Python Implementation

**Unified Cognitive + Enforcement Protocol for Surgical AI Code Editing**

Version: 1.0.0  
Status: Working Example (Option 1 Complete)

---

## Overview

This is a working implementation of the Rubbi-Box Protocol, demonstrating:
- Nested graph generation (R1→R2→R3)
- Fault tracing through dependency chains
- Context Card creation with token estimation
- Sandbox + vet + swap workflow
- Reuse > Repair > Replace hierarchy

## Installation

```bash
pip install -r requirements.txt
```

## Running the Demo

```bash
python -m rubbibox.demo
```

This will run the complete end-to-end workflow:
1. User reports: "Volume button doesn't work"
2. AI loads the project graph (R1 level)
3. AI zooms into Sector B (R2 level)
4. AI traces the fault through the dependency chain
5. AI generates a Context Card (compressed sub-graph)
6. AI analyzes reuse opportunities
7. AI applies fix in sandbox
8. AI vets the fix
9. AI swaps the sector (or rolls back)

## Running Tests

```bash
pytest tests/ -v
```

Tests cover:
- Graph integrity (node/edge creation, upstream/downstream tracing)
- Fault tracing scope (origin detection, chain tracing)
- Edit guardrails (can't edit outside declared sector)
- Vetting pass/fail (type checks, state flow, side effects)
- Rollback (reverts to snapshot on failure)
- Reuse detection (finds compatible existing code)

## Architecture

```
rubbibox/
├── __init__.py          # Package initialization
├── graph.py             # Nested graph structure (R1→R2→R3→R4)
├── tracer.py            # Fault tracing through dependency chains
├── context_card.py      # Context Card generation with token estimation
├── sandbox.py           # Sandbox workflow (snapshot→mock→edit→vet→swap)
├── reuse.py             # Reuse > Repair > Replace hierarchy
└── demo.py              # End-to-end demonstration
```

## Key Concepts

### Nested Graph Structure
- **R1 (Project)**: Full codebase with all files and modules
- **R2 (Sector)**: Module-level graph (e.g., media player component)
- **R3 (Micro-Sector)**: Component-level dependency chain
- **R4 (Atomic Node)**: Single function or line of code

### Fault Tracing
Follows the "speaker wire" analogy - traces the signal path to find where the connection is broken.

### Context Card
Compressed sub-graph containing only the relevant nodes, edges, and contracts. Saves 91-99%+ tokens.

### Reuse > Repair > Replace
1. **REUSE** (~5 tokens): Wire up existing compatible code
2. **REPAIR** (~20 tokens): Patch existing broken code
3. **REPLACE** (~50 tokens): Write new code (last resort)

### Sandbox Workflow
1. **Snapshot**: Capture current sector state
2. **Mock**: Replace external dependencies with mocks
3. **Edit**: Apply fix (with guardrails)
4. **Vet**: Run automated tests
5. **Swap**: Atomically replace live sector (or rollback)

## Token Savings Model

| Scenario | Tokens Used | Savings |
|----------|-------------|---------|
| Full codebase | 4200 | 0% |
| Context Card only | 340 | 92% |
| Context Card + Reuse | 345 | 91.8% |
| Context Card + Reuse + Dedup | 25 | 99.4% |

## Protocol Rules

1. AI must generate Context Card before editing
2. AI must test in sandbox before swapping
3. AI cannot edit outside declared sector
4. AI must vet fix against graph before deploying
5. AI must swap only the affected sector
6. AI must attempt reuse before repair, repair before replace
7. AI must document why reuse/repair wasn't possible
8. AI must use minimal testing for reused code

## Next Steps

- [x] Option 1: Build working example (this package)
- [ ] Option 2: Continue brainstorming (push protocol further)
- [ ] Option 3: Write enforcement layer (tooling that makes protocol binding)

## Integration with F.O.R.G.E.

Rubbi-Box is the execution layer for the F.O.R.G.E. protocol:
- **FORCED**: AI must fix only within the Context Card scope
- **OPTIMIZATION**: Minimal token usage, maximum precision
- **RELENTLESS**: Auto-retry with guardrails if vet fails
- **GUARANTEED**: Vetted changes only — rollback if tests fail

---

*This is a living implementation. As the protocol evolves, this package will be updated.*
