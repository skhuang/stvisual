// Render a small "safety monitor" finite state machine that visualizes how a
// Boolean specification partitions clause assignments into SAFE (predicate
// holds) vs. VIOLATION (predicate fails). Used by SpecMutationExplorer to
// show the original predicate side-by-side with a selected mutant; the
// transitions whose target state differs between the two are highlighted.

import { evaluateAst, buildAssignmentSpace } from './specMutation.js';

const STATE_RADIUS = 34;
const SVG_W = 280;
const SVG_H = 200;
const SAFE_X = 70;
const VIO_X = SVG_W - 70;
const Y = SVG_H / 2;

function escapeXml(s = '') {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function shortAssignment(values, clauses) {
  return clauses
    .map((c) => `${c}=${values[c] ? 'T' : 'F'}`)
    .join(' ');
}

// Build the four transition buckets for a predicate ast under all clause
// assignments. Each bucket contains the assignments routed to it.
//   safe -> safe   : predicate was true in `from`, true in `to` (self-loop on SAFE)
//   safe -> vio    : predicate true in `from`, false after assignment
//   vio  -> safe   : predicate becomes true again
//   vio  -> vio    : predicate stays false (self-loop on VIOLATION)
//
// Since the FSM is memoryless and only depends on the new assignment's
// predicate value, the four transitions reduce to two effective sets:
//   trueSet  = assignments where predicate evaluates to true  (target = SAFE)
//   falseSet = assignments where predicate evaluates to false (target = VIOLATION)
// We still describe all four edges because the diagram shows both source states.
export function buildMonitor(ast, clauses) {
  const assignments = buildAssignmentSpace(clauses);
  const trueSet = [];
  const falseSet = [];
  for (const a of assignments) {
    if (evaluateAst(ast, a)) trueSet.push(a);
    else falseSet.push(a);
  }
  return { assignments, trueSet, falseSet };
}

// Compute which assignments are routed differently by the mutant compared to
// the original; these correspond to the killer set.
export function diffMonitors(origAst, mutAst, clauses) {
  const assignments = buildAssignmentSpace(clauses);
  const flipped = [];
  for (const a of assignments) {
    if (evaluateAst(origAst, a) !== evaluateAst(mutAst, a)) flipped.push(a);
  }
  return flipped;
}

function transitionLabel(assignments, clauses, max = 3) {
  if (assignments.length === 0) return '∅';
  const sample = assignments.slice(0, max).map((a) => shortAssignment(a, clauses));
  const more = assignments.length - max;
  return more > 0 ? `${sample.join(' ; ')} (+${more})` : sample.join(' ; ');
}

// Render an SVG with two states (SAFE / VIOLATION) and four labeled transitions.
// `flippedKey` is an optional Set of assignment-key strings used to mark a
// transition as "killer" when its assignment routing differs vs. the original.
export function renderMonitorSvg({
  ast,
  clauses,
  title,
  flippedSet = null, // Set<string> of assignment keys (e.g. "a=T b=F")
  emptyLabel = '∅',
  testId = 'spec-fsm',
} = {}) {
  if (!ast || !clauses || clauses.length === 0) {
    return `<div class="spec-fsm-empty">${escapeXml(emptyLabel)}</div>`;
  }
  // Cap the number of clauses we render directly: 2^n grows fast and the
  // labels stop being readable beyond ~4 clauses. Above that, we summarize.
  const tooBig = clauses.length > 4;
  const monitor = buildMonitor(ast, clauses);

  const mark = (a) => {
    if (!flippedSet) return false;
    return flippedSet.has(shortAssignment(a, clauses));
  };

  const safeToVio = monitor.falseSet; // from SAFE these go to VIOLATION
  const safeToSafe = monitor.trueSet; // self-loop on SAFE
  const vioToSafe = monitor.trueSet;
  const vioToVio = monitor.falseSet;

  const anyKiller = (xs) => flippedSet ? xs.some((a) => mark(a)) : false;

  const labelForward = tooBig
    ? `${safeToVio.length} / ${monitor.assignments.length} assignments`
    : transitionLabel(safeToVio, clauses);
  const labelRecover = tooBig
    ? `${vioToSafe.length} / ${monitor.assignments.length} assignments`
    : transitionLabel(vioToSafe, clauses);
  const labelSafeLoop = tooBig
    ? `${safeToSafe.length}`
    : transitionLabel(safeToSafe, clauses);
  const labelVioLoop = tooBig
    ? `${vioToVio.length}`
    : transitionLabel(vioToVio, clauses);

  const fwdKiller = anyKiller(safeToVio);
  const recKiller = anyKiller(vioToSafe);
  const safeLoopKiller = anyKiller(safeToSafe);
  const vioLoopKiller = anyKiller(vioToVio);

  const cls = (killer) => `spec-fsm-edge${killer ? ' killer' : ''}`;

  // Curved arrow from SAFE to VIOLATION (top arc) and VIOLATION to SAFE (bottom arc).
  const topArc = `M ${SAFE_X + STATE_RADIUS},${Y - 6} Q ${SVG_W / 2},${Y - 80} ${VIO_X - STATE_RADIUS},${Y - 6}`;
  const bottomArc = `M ${VIO_X - STATE_RADIUS},${Y + 6} Q ${SVG_W / 2},${Y + 80} ${SAFE_X + STATE_RADIUS},${Y + 6}`;

  // Self loops (small circles above each state).
  const safeLoop = `M ${SAFE_X - 14},${Y - STATE_RADIUS + 4} q -22,-30 0,-44 q 22,14 0,44`;
  const vioLoop = `M ${VIO_X - 14},${Y - STATE_RADIUS + 4} q -22,-30 0,-44 q 22,14 0,44`;

  return `
    <figure class="spec-fsm" data-testid="${escapeXml(testId)}">
      ${title ? `<figcaption class="spec-fsm-title">${escapeXml(title)}</figcaption>` : ''}
      <svg viewBox="0 0 ${SVG_W} ${SVG_H}" role="img" aria-label="${escapeXml(title || 'monitor')}">
        <defs>
          <marker id="arrow-${escapeXml(testId)}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>

        <!-- self loops -->
        <path d="${safeLoop}" class="${cls(safeLoopKiller)}" fill="none" marker-end="url(#arrow-${escapeXml(testId)})" />
        <path d="${vioLoop}" class="${cls(vioLoopKiller)}" fill="none" marker-end="url(#arrow-${escapeXml(testId)})" />
        <text x="${SAFE_X - 14}" y="${Y - STATE_RADIUS - 32}" class="spec-fsm-edge-label">P=T (${labelSafeLoop})</text>
        <text x="${VIO_X - 14}" y="${Y - STATE_RADIUS - 32}" class="spec-fsm-edge-label">P=F (${labelVioLoop})</text>

        <!-- safe -> violation (top arc) -->
        <path d="${topArc}" class="${cls(fwdKiller)}" fill="none" marker-end="url(#arrow-${escapeXml(testId)})" />
        <text x="${SVG_W / 2}" y="${Y - 60}" text-anchor="middle" class="spec-fsm-edge-label">P=F · ${escapeXml(labelForward)}</text>

        <!-- violation -> safe (bottom arc) -->
        <path d="${bottomArc}" class="${cls(recKiller)}" fill="none" marker-end="url(#arrow-${escapeXml(testId)})" />
        <text x="${SVG_W / 2}" y="${Y + 70}" text-anchor="middle" class="spec-fsm-edge-label">P=T · ${escapeXml(labelRecover)}</text>

        <!-- states -->
        <g class="spec-fsm-state safe">
          <circle cx="${SAFE_X}" cy="${Y}" r="${STATE_RADIUS}" />
          <text x="${SAFE_X}" y="${Y - 2}" text-anchor="middle">SAFE</text>
          <text x="${SAFE_X}" y="${Y + 14}" text-anchor="middle" class="spec-fsm-state-sub">P=T</text>
        </g>
        <g class="spec-fsm-state violation">
          <circle cx="${VIO_X}" cy="${Y}" r="${STATE_RADIUS}" />
          <text x="${VIO_X}" y="${Y - 2}" text-anchor="middle">VIOLATION</text>
          <text x="${VIO_X}" y="${Y + 14}" text-anchor="middle" class="spec-fsm-state-sub">P=F</text>
        </g>
      </svg>
    </figure>
  `;
}

// Convenience for callers: produce the Set<string> of assignment keys from
// the killer list returned by evaluateSpecMutants.
export function flippedKeysFromKillers(killers, clauses) {
  return new Set(killers.map((k) => shortAssignment(k.test, clauses)));
}
