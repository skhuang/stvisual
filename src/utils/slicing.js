// Pure program-slicing engine over an authored Program Dependence Graph.
// A PDG: { statements:[{id,line,text,defs,uses,kind?}],
//          controlDeps:[[from,to]], dataDeps:[[from,to,variable]] }.
// A criterion: { stmtId, variable }. A trace: { id, steps:[stmtId...] }.
// Every slice function returns a Set<stmtId> that includes the criterion
// statement itself.

// Backward slice: statements that may affect `variable` at `stmtId`.
export function backwardSlice(pdg, criterion) {
  const { stmtId, variable } = criterion;
  const slice = new Set([stmtId]);
  const queue = [];
  // Seed: control parents of stmtId, and defs of `variable` flowing into it.
  for (const [from, to] of pdg.controlDeps) {
    if (to === stmtId && !slice.has(from)) { slice.add(from); queue.push(from); }
  }
  for (const [from, to, v] of pdg.dataDeps) {
    if (to === stmtId && v === variable && !slice.has(from)) {
      slice.add(from); queue.push(from);
    }
  }
  // Transitive closure over every dependence edge.
  while (queue.length) {
    const cur = queue.shift();
    for (const [from, to] of pdg.controlDeps) {
      if (to === cur && !slice.has(from)) { slice.add(from); queue.push(from); }
    }
    for (const [from, to] of pdg.dataDeps) {
      if (to === cur && !slice.has(from)) { slice.add(from); queue.push(from); }
    }
  }
  return slice;
}

// Forward slice: statements that may be affected by `variable` at `stmtId`.
export function forwardSlice(pdg, criterion) {
  const { stmtId, variable } = criterion;
  const slice = new Set([stmtId]);
  const queue = [];
  for (const [from, to] of pdg.controlDeps) {
    if (from === stmtId && !slice.has(to)) { slice.add(to); queue.push(to); }
  }
  for (const [from, to, v] of pdg.dataDeps) {
    if (from === stmtId && v === variable && !slice.has(to)) {
      slice.add(to); queue.push(to);
    }
  }
  while (queue.length) {
    const cur = queue.shift();
    for (const [from, to] of pdg.controlDeps) {
      if (from === cur && !slice.has(to)) { slice.add(to); queue.push(to); }
    }
    for (const [from, to] of pdg.dataDeps) {
      if (from === cur && !slice.has(to)) { slice.add(to); queue.push(to); }
    }
  }
  return slice;
}

// The data-dep edges actually exercised by a trace, by the last-definition
// rule: when a use of v executes, only the most recent preceding def of v
// is live. Returns a Set of "from|to|variable" keys.
function liveDataDeps(pdg, trace) {
  const stmtById = new Map(pdg.statements.map((s) => [s.id, s]));
  const lastDef = new Map();
  const live = new Set();
  for (const sid of trace.steps) {
    const st = stmtById.get(sid);
    if (!st) continue;
    for (const v of st.uses || []) {
      const d = lastDef.get(v);
      if (d !== undefined) live.add(`${d}|${sid}|${v}`);
    }
    for (const v of st.defs || []) lastDef.set(v, sid);
  }
  return live;
}

// Dynamic backward slice: backwardSlice restricted to statements executed
// in `trace` and data-dep edges that were live in it.
export function dynamicSlice(pdg, trace, criterion) {
  const { stmtId, variable } = criterion;
  const executed = new Set(trace.steps);
  if (!executed.has(stmtId)) return new Set();
  const live = liveDataDeps(pdg, trace);
  const slice = new Set([stmtId]);
  const queue = [];
  for (const [from, to] of pdg.controlDeps) {
    if (to === stmtId && executed.has(from) && !slice.has(from)) {
      slice.add(from); queue.push(from);
    }
  }
  for (const [from, to, v] of pdg.dataDeps) {
    if (to === stmtId && v === variable
        && live.has(`${from}|${to}|${v}`) && !slice.has(from)) {
      slice.add(from); queue.push(from);
    }
  }
  while (queue.length) {
    const cur = queue.shift();
    for (const [from, to] of pdg.controlDeps) {
      if (to === cur && executed.has(from) && !slice.has(from)) {
        slice.add(from); queue.push(from);
      }
    }
    for (const [from, to, v] of pdg.dataDeps) {
      if (to === cur && live.has(`${from}|${to}|${v}`) && !slice.has(from)) {
        slice.add(from); queue.push(from);
      }
    }
  }
  return slice;
}

// Program dice: statements in the failing slice but in no passing slice.
export function programDice(failingSlice, passingSlices) {
  const dice = new Set(failingSlice);
  for (const ps of passingSlices) {
    for (const s of ps) dice.delete(s);
  }
  return dice;
}

// True iff two slices share at least one statement.
export function slicesIntersect(a, b) {
  for (const s of a) {
    if (b.has(s)) return true;
  }
  return false;
}

// Slice-based coverage. Given a slice (Set of statement ids) and the set of
// statement ids executed by a test suite, report which slice statements were
// covered, which were missed, and the coverage percentage. An empty slice is
// vacuously 100% covered.
export function sliceCoverage(slice, executed) {
  const covered = new Set();
  const uncovered = new Set();
  for (const id of slice) {
    if (executed.has(id)) covered.add(id);
    else uncovered.add(id);
  }
  const total = slice.size;
  const pct = total === 0 ? 100 : Math.round((covered.size / total) * 100);
  return { covered, uncovered, pct };
}

// Regression test selection. Given a PDG, its output criterion, the id of the
// changed statement, and a mode ('static' | 'dynamic'), classify every trace
// in `pdg.traces` as affected (must re-run) or safe (can skip).
//
// impact  = the forward slice of the changed statement — every statement the
//           edit can reach. Computed over each variable the statement defines
//           (or, for a def-less statement, a single variable-less pass so
//           control-dependent children are still reached).
// static  : a trace is affected iff the statements it executed intersect
//           `impact`.
// dynamic : a trace is affected iff `changedStmtId` is in that trace's
//           dynamic backward slice from `criterion`.
export function affectedTests(pdg, criterion, changedStmtId, mode) {
  const changed = pdg.statements.find((s) => s.id === changedStmtId);
  const impact = new Set();
  const vars = changed && changed.defs.length ? changed.defs : [undefined];
  for (const v of vars) {
    for (const id of forwardSlice(pdg, { stmtId: changedStmtId, variable: v })) {
      impact.add(id);
    }
  }
  const affected = new Set();
  const safe = new Set();
  for (const trace of pdg.traces || []) {
    let hit;
    if (mode === 'dynamic') {
      hit = dynamicSlice(pdg, trace, criterion).has(changedStmtId);
    } else {
      hit = slicesIntersect(impact, new Set(trace.steps));
    }
    (hit ? affected : safe).add(trace.id);
  }
  return { affected, safe, impact };
}
