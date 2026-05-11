// Test Generation from Coverage (course lecture #12, phase 12.1).
//
// Bridges the *abstract* coverage requirements produced by `graphCoverage.js`
// (node / edge / edge-pair / prime-path / complete-path / all-defs / all-uses /
// all-du-paths) with the *concrete* witnesses produced by `symbolicExecution.js`,
// then runs a greedy set-cover to pick a minimal list of concrete inputs that
// together cover every feasible requirement.
//
// Inputs:
//   { sourceCode, criterion, symbexOptions? }
//
// Output:
//   {
//     function:               { name, params },
//     cfg:                    CFG produced by programToGraph,
//     criterion:              string,
//     requirements:           Requirement[],          // from graphCoverage
//     witnessedPaths:         WitnessedPath[],        // one per symbex path
//     requirementCoverage:    PerRequirementResult[], // coverage breakdown
//     selectedTests:          SelectedTest[],         // greedy set cover output
//     totalRequirements,
//     feasibleRequirements,
//     selectedCount,
//     symbexTruncated,
//     error?:                 string,                 // if parsing / setup failed
//   }
//
// A `WitnessedPath` is the marriage of a symbex path (witness + path condition
// + return expression) and its corresponding walk over the CFG (so that we can
// match it against Graph-Coverage requirements).
//
// Limitations (intentional, teaching-grade):
//   * The witness solver brute-forces over `searchDomain` (default [-5, 12]).
//     `if (a == 42)` is unsolvable here unless the user widens the domain.
//   * Both parsers (programToGraph + symbolicExecution) need to agree on the
//     source's structure. Anything one rejects becomes `error`.
//   * Path-explosion safeguards (`maxLoopUnroll` / `maxPaths`) are inherited
//     from the symbex engine — see §16 of the spec.

import { generateControlFlowGraphFromProgram } from './programToGraph.js';
import { symbolicExecute } from './symbolicExecution.js';
import { mapBranchesToCfg } from './pathToCfg.js';
import {
  getCoverageRequirements,
  requirementCoveredByRecord,
} from './graphCoverage.js';

const SUPPORTED_CRITERIA = new Set([
  'node', 'edge', 'edge-pair', 'prime-path', 'complete-path',
  'all-defs', 'all-uses', 'all-du-paths',
]);

export function generateTestsFromCoverage({ sourceCode, criterion, symbexOptions = {} }) {
  if (!sourceCode || typeof sourceCode !== 'string') {
    return errorResult(criterion, 'sourceCode is required');
  }
  if (!SUPPORTED_CRITERIA.has(criterion)) {
    return errorResult(criterion, `Unsupported criterion: ${criterion}`);
  }

  let cfg;
  try {
    cfg = generateControlFlowGraphFromProgram({
      sourceCode,
      language: 'javascript',
      title: 'Test Generation CFG',
    });
  } catch (err) {
    return errorResult(criterion, `CFG build failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  let symbex;
  try {
    symbex = symbolicExecute(sourceCode, symbexOptions);
  } catch (err) {
    return errorResult(criterion, `Symbolic execution failed: ${err instanceof Error ? err.message : String(err)}`, { cfg });
  }

  let requirements;
  try {
    requirements = getCoverageRequirements(cfg, criterion);
  } catch (err) {
    return errorResult(criterion, `Requirement generation failed: ${err instanceof Error ? err.message : String(err)}`, { cfg });
  }

  const witnessedPaths = symbex.paths.map((p) => {
    const mapping = mapBranchesToCfg(cfg, p.branches);
    return {
      id: p.id,
      feasible: p.feasible,
      witness: p.witness,
      concreteEnv: p.concreteEnv,
      concreteReturn: p.concreteReturn,
      pathCondition: p.pathCondition.slice(),
      returnExpression: p.returnExpression,
      branches: p.branches.slice(),
      cfgNodes: mapping.nodes.slice(),
      cfgEdges: mapping.edges.slice(),
      cfgUnresolved: mapping.unresolved,
    };
  });

  const requirementCoverage = requirements.map((req) =>
    coverageForRequirement(req, witnessedPaths),
  );

  const selectedTests = greedyCoverSelect(witnessedPaths, requirements);

  return {
    function: symbex.function,
    cfg,
    criterion,
    requirements,
    witnessedPaths,
    requirementCoverage,
    selectedTests,
    totalRequirements: requirements.length,
    feasibleRequirements: requirementCoverage.filter((r) => r.feasible).length,
    selectedCount: selectedTests.length,
    symbexTruncated: Boolean(symbex.truncated),
  };
}

function coverageForRequirement(requirement, witnessedPaths) {
  const coveringIds = [];
  let representative = null;
  for (const wp of witnessedPaths) {
    if (!wp.feasible) continue;
    const record = { path: wp.cfgNodes, edgeIds: wp.cfgEdges };
    if (!requirementCoveredByRecord(requirement, record)) continue;
    coveringIds.push(wp.id);
    if (!representative) representative = wp;
  }
  return {
    requirementId: requirement.id,
    requirement,
    coveringPathIds: coveringIds,
    feasible: coveringIds.length > 0,
    representativeWitness: representative?.witness ?? null,
    representativeReturn: representative?.concreteReturn ?? null,
    representativePathId: representative?.id ?? null,
  };
}

// Greedy set-cover: pick the witnessed path that covers the largest number of
// still-uncovered requirements; tie-break by smaller witness magnitudes (so the
// "simplest" input wins).
function greedyCoverSelect(witnessedPaths, requirements) {
  const feasiblePaths = witnessedPaths.filter((wp) => wp.feasible);
  // Pre-compute which requirements each path covers.
  const pathCovers = new Map();
  for (const wp of feasiblePaths) {
    const record = { path: wp.cfgNodes, edgeIds: wp.cfgEdges };
    const covered = new Set();
    for (const req of requirements) {
      if (requirementCoveredByRecord(req, record)) covered.add(req.id);
    }
    pathCovers.set(wp.id, covered);
  }

  const remaining = new Set();
  for (const req of requirements) {
    // Only consider requirements that some path can cover (infeasible ones are
    // skipped here — caller surfaces them in requirementCoverage).
    for (const wp of feasiblePaths) {
      if (pathCovers.get(wp.id).has(req.id)) { remaining.add(req.id); break; }
    }
  }

  const used = new Set();
  const result = [];
  while (remaining.size > 0) {
    let best = null;
    let bestGain = 0;
    let bestMagnitude = Infinity;
    for (const wp of feasiblePaths) {
      if (used.has(wp.id)) continue;
      const covers = pathCovers.get(wp.id);
      let gain = 0;
      for (const id of covers) if (remaining.has(id)) gain += 1;
      if (gain === 0) continue;
      const magnitude = witnessMagnitude(wp.witness);
      if (gain > bestGain || (gain === bestGain && magnitude < bestMagnitude)) {
        best = wp;
        bestGain = gain;
        bestMagnitude = magnitude;
      }
    }
    if (!best) break;
    used.add(best.id);
    const newlyCovered = [];
    for (const id of pathCovers.get(best.id)) {
      if (remaining.has(id)) { newlyCovered.push(id); remaining.delete(id); }
    }
    result.push({
      pathId: best.id,
      witness: best.witness,
      concreteEnv: best.concreteEnv,
      concreteReturn: best.concreteReturn,
      pathCondition: best.pathCondition.slice(),
      returnExpression: best.returnExpression,
      coveredRequirementIds: newlyCovered,
    });
  }
  return result;
}

function witnessMagnitude(witness) {
  if (!witness) return Infinity;
  let sum = 0;
  for (const v of Object.values(witness)) sum += Math.abs(Number(v) || 0);
  return sum;
}

/**
 * Pretty-print a witness as `f(1, 2, 3)`-style call expression for the UI.
 */
export function formatConcreteCall(fnName, params, witness) {
  if (!witness) return `${fnName}(?)`;
  const args = params.map((p) => formatWitnessValue(witness[p]));
  return `${fnName}(${args.join(', ')})`;
}

export function formatWitnessValue(value) {
  if (value === null || value === undefined) return '?';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

export function formatExpectedReturn(value) {
  if (value === null || value === undefined) return 'undefined';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'object') {
    try { return JSON.stringify(value); } catch { return String(value); }
  }
  return String(value);
}

function errorResult(criterion, message, partial = {}) {
  return {
    function: partial.cfg ? { name: '', params: [] } : null,
    cfg: partial.cfg || null,
    criterion,
    requirements: [],
    witnessedPaths: [],
    requirementCoverage: [],
    selectedTests: [],
    totalRequirements: 0,
    feasibleRequirements: 0,
    selectedCount: 0,
    symbexTruncated: false,
    error: message,
  };
}
