// Black-box test design: Boundary Value Analysis and Equivalence Class Partitioning.

/**
 * Generate BVA test cases for a set of numeric parameters.
 * Uses the standard 5-point BVA: min, min+1, nominal, max-1, max.
 * Returns one test case per boundary point per parameter (others at nominal).
 *
 * @param {Array<{name:string, min:number, max:number}>} params
 * @returns {Array<{id:string, label:string, values:{[name]:number}, boundary:string}>}
 */
export function generateBvaTests(params) {
  if (!params.length) return [];

  const nominals = {};
  for (const p of params) {
    nominals[p.name] = Math.round((p.min + p.max) / 2);
  }

  const tests = [];
  let idx = 0;

  for (const p of params) {
    const points = [
      { val: p.min,     label: `${p.name}=min` },
      { val: p.min + 1, label: `${p.name}=min+1` },
      { val: nominals[p.name], label: `${p.name}=nominal` },
      { val: p.max - 1, label: `${p.name}=max-1` },
      { val: p.max,     label: `${p.name}=max` },
    ];

    // Deduplicate (e.g. when min+1 === nominal)
    const seen = new Set();
    for (const { val, label } of points) {
      if (seen.has(val)) continue;
      seen.add(val);

      const values = { ...nominals, [p.name]: val };
      tests.push({
        id: `bva-${idx++}`,
        label,
        values,
        boundary: label,
        param: p.name,
      });
    }
  }

  return tests;
}

/**
 * Generate Robustness BVA tests: adds min-1 and max+1 (out-of-range) points.
 *
 * @param {Array<{name:string, min:number, max:number}>} params
 * @returns {Array<{id:string, label:string, values:{[name]:number}, boundary:string, robust:boolean}>}
 */
export function generateRobustBvaTests(params) {
  const base = generateBvaTests(params);

  if (!params.length) return base;

  const nominals = {};
  for (const p of params) {
    nominals[p.name] = Math.round((p.min + p.max) / 2);
  }

  const extras = [];
  let idx = base.length;
  for (const p of params) {
    for (const { val, label } of [
      { val: p.min - 1, label: `${p.name}=min-1` },
      { val: p.max + 1, label: `${p.name}=max+1` },
    ]) {
      const values = { ...nominals, [p.name]: val };
      extras.push({
        id: `bva-${idx++}`,
        label,
        values,
        boundary: label,
        param: p.name,
        robust: true,
      });
    }
  }

  return [...base, ...extras];
}

// ---------------------------------------------------------------------------
// Equivalence Class Partitioning
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} EqClass
 * @property {string} name   - e.g. "valid", "too-small", "negative"
 * @property {string} kind   - "valid" | "invalid"
 * @property {number|string} representative - example value from this class
 */

/**
 * @typedef {Object} EqParam
 * @property {string} name
 * @property {EqClass[]} classes
 */

/**
 * Generate Weak Equivalence Class Testing (WECT) test cases.
 * WECT: cover each equivalence class exactly once (pair valid classes together).
 *
 * @param {EqParam[]} params
 * @returns {Array<{id:string, label:string, values:{[name]:string|number}, coverage:string[]}>}
 */
export function generateWectTests(params) {
  if (!params.length) return [];

  // For each param, split classes into valid and invalid lists.
  const perParam = params.map((p) => ({
    name: p.name,
    valid: p.classes.filter((c) => c.kind === 'valid'),
    invalid: p.classes.filter((c) => c.kind === 'invalid'),
  }));

  const tests = [];
  let idx = 0;

  // --- Phase 1: cover all valid classes ---
  // Zip valid classes across params (longest chain wins).
  const maxValid = Math.max(...perParam.map((p) => p.valid.length), 0);
  for (let i = 0; i < maxValid; i++) {
    const values = {};
    const coverage = [];
    for (const pp of perParam) {
      const cls = pp.valid[i % pp.valid.length];
      values[pp.name] = cls?.representative ?? pp.valid[0]?.representative ?? '';
      coverage.push(`${pp.name}:${cls?.name ?? 'valid'}`);
    }
    tests.push({ id: `ec-${idx++}`, label: `Valid-${i + 1}`, values, coverage });
  }

  // --- Phase 2: one test per invalid class per param ---
  for (const pp of perParam) {
    for (const cls of pp.invalid) {
      const values = {};
      const coverage = [];
      for (const pp2 of perParam) {
        if (pp2.name === pp.name) {
          values[pp2.name] = cls.representative;
          coverage.push(`${pp.name}:${cls.name}`);
        } else {
          const firstValid = pp2.valid[0];
          values[pp2.name] = firstValid?.representative ?? '';
          coverage.push(`${pp2.name}:${firstValid?.name ?? 'valid'}`);
        }
      }
      tests.push({ id: `ec-${idx++}`, label: `Invalid(${pp.name}=${cls.name})`, values, coverage });
    }
  }

  return tests;
}

/**
 * Generate Strong Equivalence Class Testing (SECT) test cases.
 * SECT: Cartesian product of all equivalence classes.
 * Capped at 50 test cases to avoid explosion.
 */
export function generateSectTests(params, maxTests = 50) {
  if (!params.length) return [];

  function* cartesian(lists) {
    if (!lists.length) { yield []; return; }
    const [first, ...rest] = lists;
    for (const item of first) {
      for (const combo of cartesian(rest)) {
        yield [item, ...combo];
      }
    }
  }

  const allClasses = params.map((p) => p.classes.map((c) => ({ param: p.name, cls: c })));
  const tests = [];
  let idx = 0;

  for (const combo of cartesian(allClasses)) {
    if (tests.length >= maxTests) break;
    const values = {};
    const coverage = [];
    for (const { param, cls } of combo) {
      values[param] = cls.representative;
      coverage.push(`${param}:${cls.name}`);
    }
    const hasInvalid = combo.some(({ cls }) => cls.kind === 'invalid');
    tests.push({
      id: `ec-${idx++}`,
      label: combo.map(({ cls }) => cls.name).join(' × '),
      values,
      coverage,
      hasInvalid,
    });
  }

  return tests;
}

// ---------------------------------------------------------------------------
// Decision Table Testing
// ---------------------------------------------------------------------------

/**
 * Generate test cases from a decision table: one test case per rule.
 *
 * @param {Array<{id:string, name:string, values:string[]}>} conditions
 * @param {Array<{id:string, name:string}>} actions
 * @param {Array<{id:string, conditions:Object.<string,string>, actions:string[]}>} rules
 */
export function generateDecisionTableTests(conditions, actions, rules) {
  return rules.map((rule, i) => ({
    id: rule.id ?? `dt-${i}`,
    label: `R${i + 1}`,
    conditions: { ...rule.conditions },
    actions: [...rule.actions],
  }));
}

/**
 * Validate a decision table: find duplicate rules and report coverage.
 */
export function validateDecisionTable(conditions, rules) {
  const keys = rules.map((r) =>
    conditions.map((c) => r.conditions[c.id] ?? '–').join('|')
  );
  const seen = new Set();
  const duplicate = [];
  for (let i = 0; i < keys.length; i++) {
    if (seen.has(keys[i])) duplicate.push(`R${i + 1}`);
    else seen.add(keys[i]);
  }
  const total = conditions.reduce((acc, c) => {
    const real = c.values.filter((v) => v !== '–').length;
    return acc * (real || 1);
  }, 1);
  return { duplicate, total, covered: seen.size };
}

// ---------------------------------------------------------------------------
// State Transition Testing
// ---------------------------------------------------------------------------

/**
 * Generate one test case per transition (0-switch / transition coverage).
 *
 * @param {Array<{id:string, name:string, initial?:boolean, final?:boolean}>} states
 * @param {Array<{id:string, from:string, to:string, event:string, action?:string}>} transitions
 */
export function generateStTransitionTests(states, transitions) {
  return transitions.map((tr, i) => {
    const fromState = states.find((s) => s.id === tr.from);
    const toState   = states.find((s) => s.id === tr.to);
    return {
      id: tr.id ?? `st-${i}`,
      label: `T${i + 1}`,
      from: fromState?.name ?? tr.from,
      to: toState?.name ?? tr.to,
      event: tr.event,
      action: tr.action ?? '',
    };
  });
}

/**
 * Generate test sequences (BFS shortest path from initial state + one more transition).
 *
 * @param {Array<{id:string, name:string, initial?:boolean}>} states
 * @param {Array<{id:string, from:string, to:string, event:string, action?:string}>} transitions
 */
export function generateStSequenceTests(states, transitions) {
  const initial = states.find((s) => s.initial) ?? states[0];
  if (!initial) return [];

  const adjOut = {};
  for (const s of states) adjOut[s.id] = [];
  for (const tr of transitions) {
    if (adjOut[tr.from]) adjOut[tr.from].push(tr);
  }

  const dist = { [initial.id]: [] };
  const queue = [initial.id];
  while (queue.length) {
    const cur = queue.shift();
    for (const tr of adjOut[cur] ?? []) {
      if (!(tr.to in dist)) {
        dist[tr.to] = [...dist[cur], tr];
        queue.push(tr.to);
      }
    }
  }

  return transitions.map((tr, i) => {
    const pathToFrom = dist[tr.from] ?? [];
    const fullPath = [...pathToFrom, tr];
    const stateNames = [initial.name ?? initial.id];
    const events = [];
    for (const step of fullPath) {
      const toSt = states.find((s) => s.id === step.to);
      stateNames.push(toSt?.name ?? step.to);
      events.push(step.event);
    }
    return {
      id: `stseq-${i}`,
      label: `Seq${i + 1}`,
      sequence: stateNames,
      events,
    };
  });
}
