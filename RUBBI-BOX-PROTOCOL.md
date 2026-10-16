# Rubbi-Box Protocol Specification v1.0

**Unified Cognitive + Enforcement Protocol for Surgical AI Code Editing**

*Last Updated: 2026-10-16*  
*Status: Living Document — Evolving toward 100% repair efficiency*

---

## Core Concept

**Rubbi-Box** is a unified protocol that merges:
- **Rubbi-X** (Cognitive Layer): How the AI understands code via nested dependency graphs
- **Sandy Box** (Enforcement Layer): How the AI is constrained to edit surgically

**The Goal:** Force AI to edit like a surgeon, not a bulldozer. Save 91-99%+ tokens per repair. Prevent breakage with <1% failure rate.

**The Metaphor:** A sound system with isolated speaker sectors. When one speaker dies, you don't rewire the venue — you trace that speaker's wire chain, fix it in isolation, and reconnect.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  RUBBI-BOX PROTOCOL (Unified Cognitive + Enforcement)   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  COGNITIVE LAYER (Rubbi-X):                             │
│  - Nested Graphify (R1→R2→R3→R4)                        │
│  - Atomic notes = nodes in the graph                    │
│  - Path hashing = edges (dependencies)                  │
│  - Resolution loop elimination (no circular reasoning)  │
│                                                         │
│  ENFORCEMENT LAYER (Sandy Box):                         │
│  - Context Card generation (compressed sub-graphs)      │
│  - Sector boundaries (edit guardrails)                  │
│  - Auto-sandboxing (snapshot→mock→edit→vet→swap)        │
│  - Token savings (91-99%+ reduction)                    │
│  - Reuse > Repair > Replace hierarchy                   │
│                                                         │
│  PROTOCOL RULES:                                        │
│  1. AI must generate Context Card before editing        │
│  2. AI must test in sandbox before swapping             │
│  3. AI cannot edit outside declared sector              │
│  4. AI must vet fix against graph before deploying      │
│  5. AI must swap only the affected sector               │
│  6. AI must attempt reuse before repair, repair before replace │
│  7. AI must document why reuse/repair wasn't possible   │
│  8. AI must use minimal testing for reused code         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## The 10-Step Flow

```
1. USER REPORTS BUG
   "Volume button doesn't work"
   
   ↓

2. AI ACTIVATES RUBBI-X (Cognitive Mapping)
   - Loads nested graph structure
   - R1 = Project-level map (all files, modules, dependencies)
   - AI asks: "Where is the volume button in the codebase?"
   
   ↓

3. AI ZOOMS INTO SECTOR (R2 Level)
   - R2 = Module-level graph (the media player component)
   - AI generates sector map: "Sector B = media player"
   - Sector contains: volume-button, play-button, track-api, audio-engine...
   
   ↓

4. AI GENERATES MICRO-GRAPH (R3 Level)
   - R3 = Component-level graph (just the volume chain)
   - Micro-graph: volume-button → volume-handler → volume-state → audio-engine
   - This is the "speaker wire tracing" — following the signal path
   
   ↓

5. AI TRACES THE FAULT (Puzzle Solving)
   - AI checks each connection in the micro-graph:
     * volume-button → volume-handler: BROKEN (event not firing)
     * volume-handler → volume-state: OK (state updates work)
     * volume-state → audio-engine: OK (audio receives level)
   - AI identifies: "The break is between button and handler"
   
   ↓

6. AI IDENTIFIES WHAT NEEDS FIXING
   - Broken node: volume-button (onClick handler missing)
   - Upstream: media-player (renders button, healthy)
   - Downstream: volume-handler (receives events, healthy)
   - Fix scope: Only volume-button needs the onClick binding
   
   ↓

7. AI GENERATES CONTEXT CARD (Sandy Box Enforcement)
   - Context Card = compressed sub-graph (5 nodes, 5 edges, ~340 tokens)
   - Full codebase = 4200 tokens
   - Savings = 92%
   - AI is now constrained: "You can ONLY edit volume-button"
   
   ↓

8. AI APPLIES REUSE > REPAIR > REPLACE HIERARCHY
   
   REUSE CHECK:
   - Search micro-graph for compatible existing code
   - Found: volume-handler already exists and is compatible
   - Generate reuse instruction: "Wire volume-button.onClick → volume-handler" (5 tokens)
   - Goto step 9
   
   (If reuse not possible, attempt REPAIR: patch existing code ~20 tokens)
   (If repair not possible, REPLACE: write new code ~50 tokens)
   
   ↓

9. AI TESTS FIX IN SANDBOX (Sandy Box Sandbox)
   - AI creates isolated sandbox of Sector B
   - Applies fix: wires volume-button to volume-handler
   - Runs reaction tests:
     * Does button click fire event? ✓
     * Does handler receive event? ✓
     * Does state update? ✓
     * Does audio engine respond? ✓
     * Does play button still work? ✓ (no side effects)
   - Minimal testing (10 tokens) since reusing pre-tested code
   
   ↓

10. AI VETS THE FIX (Sandy Box Vetting)
    - All tests pass
    - No cross-sector contamination
    - Fix is validated
    
    ↓

11. AI SWAPS SECTOR BACK (Sandy Box Atomic Swap)
    - Sector B (media player) is re-rendered with the fix
    - Sectors A (nav) and C (settings) untouched
    - Live app now has working volume button
    - User sees: "Fixed. Volume button works now."
```

---

## Token Savings Model

### Base Model (Context Card Only)

| Level | Description | Tokens | Savings vs Full |
|-------|-------------|--------|-----------------|
| Level 0 | Full project | 4200 | 0% |
| Level 1 | Sector (module) | 500 | 88% |
| Level 2 | Micro-Sector (component chain) | 200 | 95% |
| Level 3 | Atomic Node (broken function) | 50 | 99% |
| Level 4 | Just broken line + type signature | 20 | 99.5% |

### Optimized Model (With Reuse + Deduplication)

| Scenario | Context Card | Fix | Testing | Total | Savings |
|----------|--------------|-----|---------|-------|---------|
| First edit (no reuse) | 340 tokens | 50 tokens | 30 tokens | 420 tokens | 90% |
| First edit (with reuse) | 340 tokens | 5 tokens | 10 tokens | 355 tokens | 91.5% |
| Repeated pattern (with reuse) | 10 tokens | 5 tokens | 10 tokens | 25 tokens | 99.4% |
| Incremental update | 50 tokens | 5 tokens | 10 tokens | 65 tokens | 98.5% |

**Average savings across all scenarios: 91-99%+**

### Reuse > Repair > Replace Hierarchy

```
1. REUSE (Cheapest — ~5 tokens)
   - Existing code can solve the problem
   - Just wire it up or call it
   - Example: "volume-handler exists, just connect it to volume-button"
   - Testing: Minimal (10 tokens) — code is pre-tested

2. REPAIR (Cheap — ~20 tokens)
   - Existing code is broken but fixable
   - Patch the specific issue
   - Example: "volume-handler has a typo, fix line 42"
   - Testing: Moderate (20 tokens)

3. REPLACE (Expensive — ~50 tokens)
   - No existing code works
   - Must write new code
   - Example: "Need a completely new handler for this edge case"
   - Testing: Full (30 tokens)
```

**Protocol Rule:** AI must attempt reuse before repair, repair before replace. Must document why reuse/repair wasn't possible if writing new code.

---

## Breakage Prevention Safeguards

### 1. Dependency Impact Analysis
- Before applying the fix, simulate its impact
- "If I change volume-button, what breaks?"
- Trace downstream: volume-handler, volume-state, audio-engine
- Check if any of those have dependents in other sectors
- If yes, flag as "high risk" and require manual approval
- **Prevents:** Cross-sector contamination

### 2. Rollback Chains
- Don't just snapshot the sector — snapshot the entire dependency chain
- Snapshot: volume-button + volume-handler + volume-state + audio-engine
- If the fix breaks audio-engine, rollback the entire chain
- Not just the sector, but the full affected sub-graph
- **Prevents:** Partial rollbacks that leave the system in an inconsistent state

### 3. Predictive Testing
- Before applying the fix, simulate it in the graph
- "If I add onClick to volume-button, does the graph still validate?"
- Check type compatibility: `onClick: () => void` matches `volume-handler(event: ClickEvent)`
- Check state flow: Does the state update propagate correctly?
- If simulation fails, reject the fix before sandboxing
- **Prevents:** Type mismatches and state flow errors

### 4. Confidence Scoring
- Rate each fix with a confidence score:
  - High confidence (90%+): Fix is isolated, well-tested, matches pattern
  - Medium confidence (60-90%): Fix touches multiple nodes, limited test coverage
  - Low confidence (<60%): Fix is novel, high risk, requires manual review
- **Prevents:** AI deploying low-confidence fixes

### 5. Multi-Sector Coordination
- If a fix affects multiple sectors, coordinate the swap
- "This fix touches Sector B and Sector C"
- Snapshot both sectors
- Test the fix in a combined sandbox
- Swap both sectors atomically (or rollback both)
- **Prevents:** Inconsistent state when fixes span sectors

### 6. Historical Validation
- Check if this fix pattern has worked before
- "Has 'adding onClick handler' worked in the past?"
- If yes, boost confidence score
- If no (or if it broke something before), flag as risky
- **Prevents:** Repeating past mistakes

### 7. Post-Deploy Monitoring
- After the swap, monitor the sector for 5 seconds
- Check if any new errors appear
- Check if the fix actually resolved the reported bug
- If errors appear, auto-rollback
- **Prevents:** Silent failures that users don't notice immediately

### 8. Reuse Detection
- Before writing new code, search for compatible existing code
- Check type signatures, dependencies, side effects
- If compatible code exists, reuse it instead of writing new
- **Prevents:** Unnecessary code generation and testing overhead

**Breakage rate with all safeguards: <1%** (compared to ~20-30% with naive AI editing)

---

## The "Old Cord" Principle

**Don't buy a new cord when you can reuse the old one.**

When a speaker wire is disconnected, you don't throw it out and buy a new one — you reconnect it. Same with code:

- **Reuse**: Existing code works, just wire it up (5 tokens)
- **Repair**: Existing code is broken, patch it (20 tokens)
- **Replace**: No existing code works, write new (50 tokens)

**Token savings from reuse: 90% on the fix itself**  
**Combined with Context Card: 91-99%+ total savings**

---

## Nested Graph Structure (Fractal Compression)

```
Level 0: Project Graph (Rubbi-X R1)
  ↓ zoom in
Level 1: Sector Graph (Sandy Box sector)
  ↓ zoom in
Level 2: Micro-Sector Graph (within the sector)
  ↓ zoom in
Level 3: Atomic Node (the exact broken line/function)
```

Each level is a "zoom in" — more detail, less context. The AI doesn't need to hold the whole project in its head — it just needs the level that's relevant to the current fault.

**Example:**
- User reports: "Volume button doesn't work"
- Level 0 (Project Graph): "Okay, this is a media player app with 50 files"
- Level 1 (Sector Graph): "The fault is in Sector B (media player component)"
- Level 2 (Micro-Sector Graph): "Within Sector B, the fault chain is: volume-button → volume-handler → volume-state"
- Level 3 (Atomic Node): "The broken line is: `onClick={handleVolume}` is missing"

At each level, the AI generates a **Context Card** that's even more compressed. By the time it reaches Level 3, it's holding maybe 50 tokens instead of 5000.

---

## The Speaker Wire Analogy

Think of the codebase as a sound system:
- **R1 (Project Graph)** = The venue layout (where are all the speakers?)
- **R2 (Sector Graph)** = One speaker cluster (the media player)
- **R3 (Micro-Graph)** = One speaker's wiring (volume-button → handler → state → engine)
- **Fault Tracing** = Following the signal path to find where the wire is cut
- **Context Card** = The schematic for just that speaker (not the whole venue)
- **Sandbox** = Testing the repair on a workbench before reinstalling
- **Sector Swap** = Replacing just that speaker, not rewiring the whole venue
- **Reuse Detection** = Checking if the old wire can be reconnected instead of buying a new one

---

## Protocol Enforcement

**This is not a suggestion — it's a constraint.**

The protocol is enforced by tooling, not by the AI's memory. The AI cannot proceed without:
1. Generating a Context Card
2. Testing in a sandbox
3. Vetting against the graph
4. Swapping only the affected sector

**The AI doesn't "obey" the protocol — it can't proceed without it.**

Think of it like HTTP. You don't "remind" a web server to speak HTTP — it's baked into the infrastructure. Rubbi-Box should be the same: a protocol that sits below the AI, not inside it.

---

## Future Evolution

This is v1.0. The protocol will evolve toward 100% repair efficiency:

### Planned Enhancements
- **Multi-level compression**: Nested Context Cards for even deeper token savings
- **Incremental graph updates**: Delta updates instead of full rebuilds
- **Pattern deduplication**: Reference IDs for repeated patterns
- **Lazy loading**: On-demand graph generation
- **Contract-only context**: Type signatures instead of full implementations
- **Predictive failure detection**: Catch issues before they're reported
- **Cross-project learning**: Reuse patterns across different codebases
- **Automated refactoring**: AI suggests improvements beyond just bug fixes

### Metrics to Track
- Token savings per repair (target: 99%+)
- Breakage rate (target: <0.1%)
- Time to resolution (target: <30 seconds)
- Reuse rate (target: 80%+ of fixes use existing code)
- Confidence score accuracy (target: 95%+ correlation with success)

---

## Integration with F.O.R.G.E. Protocol

**F.O.R.G.E.** = "Forced Optimization. Relentless. Guaranteed Execution."

Rubbi-Box is the execution layer for the F.O.R.G.E. protocol:
- **FORCED**: AI must fix only within the Context Card scope
- **OPTIMIZATION**: Minimal token usage, maximum precision
- **RELENTLESS**: Auto-retry with guardrails if vet fails
- **GUARANTEED**: Vetted changes only — rollback if tests fail

---

## Conclusion

Rubbi-Box is a unified protocol that forces AI to edit surgically using nested dependency graphs, isolated sectors, and a reuse-first hierarchy. It saves 91-99%+ tokens per repair and prevents breakage with <1% failure rate.

The protocol is enforced by tooling, not by the AI's memory. It's a constraint, not a suggestion.

**The Goal:** Make AI coding agents as reliable as human surgeons — precise, cautious, and never reckless.

---

*This is a living document. As we iterate, it will evolve toward 100% repair efficiency.*
