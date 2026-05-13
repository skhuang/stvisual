import {
  graphCoverageCodeLanguages,
  graphCoverageCriteria,
  graphCoverageGraph,
  graphCoverageProgramExamples,
} from '../data/testingData.js';
import { buildTestPathSetForRequirements, getCoverageRequirements } from '../utils/graphCoverage.js';
import { generateControlFlowGraphFromProgram } from '../utils/programToGraph.js';
import { buildDataFlowGraph } from '../utils/dataFlow.js';
import { t, getLocale, pickField } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';

function cloneGraph(graph) {
  return {
    ...graph,
    nodes: graph.nodes.map((node) => ({ ...node })),
    edges: graph.edges.map((edge) => ({
      ...edge,
      control: edge.control ? { ...edge.control } : undefined,
    })),
  };
}

function escapeHtml(value = '') {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function createDraftFromGraph(graph) {
  return {
    nodesText: serializeNodes(graph.nodes),
    edgesText: serializeEdges(graph.edges),
    startNodeId: graph.startNodeId,
    endNodeId: graph.endNodeId,
  };
}

function serializeNodes(nodes) {
  return nodes.map((node) => `${node.id},${node.label},${node.x},${node.y}`).join('\n');
}

function serializeEdges(edges) {
  return edges
    .map((edge) => {
      if (edge.control?.x !== undefined && edge.control?.y !== undefined) {
        return `${edge.id},${edge.from},${edge.to},${edge.control.x},${edge.control.y}`;
      }

      return `${edge.id},${edge.from},${edge.to}`;
    })
    .join('\n');
}

function parseNodesText(nodesText) {
  const rows = nodesText.split('\n').map((item) => item.trim()).filter(Boolean);

  if (!rows.length) {
    throw new Error(t('graph.err.nodesEmpty'));
  }

  return rows.map((row, index) => {
    const [id, label, x, y] = row.split(',').map((item) => item.trim());

    if (!id || !label || x === undefined || y === undefined) {
      throw new Error(t('graph.err.nodeFmt', { line: index + 1 }));
    }

    const parsedX = Number(x);
    const parsedY = Number(y);

    if (!Number.isFinite(parsedX) || !Number.isFinite(parsedY)) {
      throw new Error(t('graph.err.nodeCoord', { line: index + 1 }));
    }

    return { id, label, x: parsedX, y: parsedY, kind: 'node' };
  });
}

function parseEdgesText(edgesText, nodeIds) {
  const rows = edgesText.split('\n').map((item) => item.trim()).filter(Boolean);

  if (!rows.length) {
    throw new Error(t('graph.err.edgesEmpty'));
  }

  return rows.map((row, index) => {
    const cols = row.split(',').map((item) => item.trim());

    let id;
    let from;
    let to;
    let controlX;
    let controlY;

    if (cols.length === 2) {
      [from, to] = cols;
      id = `${from}-${to}`;
    } else if (cols.length === 3) {
      [id, from, to] = cols;
    } else if (cols.length === 5) {
      [id, from, to, controlX, controlY] = cols;
    } else {
      throw new Error(t('graph.err.edgeFmt', { line: index + 1 }));
    }

    if (!from || !to) {
      throw new Error(t('graph.err.edgeMissing', { line: index + 1 }));
    }

    if (!nodeIds.has(from) || !nodeIds.has(to)) {
      throw new Error(t('graph.err.edgeNode', { line: index + 1, from, to }));
    }

    if (controlX !== undefined && controlY !== undefined) {
      const cx = Number(controlX);
      const cy = Number(controlY);

      if (!Number.isFinite(cx) || !Number.isFinite(cy)) {
        throw new Error(t('graph.err.edgeCtl', { line: index + 1 }));
      }

      return { id, from, to, control: { x: cx, y: cy } };
    }

    return { id, from, to };
  });
}

function parseGraphDraft({ nodesText, edgesText, startNodeId, endNodeId }) {
  const nodes = parseNodesText(nodesText);
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = parseEdgesText(edgesText, nodeIds);

  if (!nodeIds.has(startNodeId)) {
    throw new Error(t('graph.err.startMissing'));
  }

  if (!nodeIds.has(endNodeId)) {
    throw new Error(t('graph.err.endMissing'));
  }

  return {
    id: 'custom-graph',
    title: t('graph.customTitle'),
    nodes,
    edges,
    startNodeId,
    endNodeId,
  };
}

function parseUploadedGraphSpec(rawText) {
  let payload;

  try {
    payload = JSON.parse(rawText);
  } catch {
    throw new Error(t('graph.err.notJson'));
  }

  const graphPayload = payload.graph || payload;

  if (!graphPayload || !Array.isArray(graphPayload.nodes) || !Array.isArray(graphPayload.edges)) {
    throw new Error(t('graph.err.jsonShape'));
  }

  const graph = {
    ...graphPayload,
    id: graphPayload.id || payload.id || 'uploaded-graph',
    title: graphPayload.title || payload.title || 'Uploaded Graph',
  };
  const validatedGraph = parseGraphDraft(createDraftFromGraph(graph));

  return {
    program: {
      id: payload.id || 'uploaded-spec',
      name: payload.name || payload.title || graph.title,
      description: payload.description || 'Uploaded graph specification for graph coverage exploration.',
      sourceCode: payload.sourceCode || payload.code || '',
      uploadName: payload.fileName || null,
    },
    graph: {
      ...validatedGraph,
      id: graph.id,
      title: graph.title,
    },
  };
}

function readUploadedFile(file) {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error(t('graph.err.readFile')));
    reader.readAsText(file);
  });
}

function getSelectedSourceNodes(graph, requirement) {
  if (!requirement) {
    return [];
  }

  return requirement.nodes
    .map((nodeId) => graph.nodes.find((node) => node.id === nodeId))
    .filter((node) => node?.sourceLine)
    .filter((node, index, nodes) => nodes.findIndex((item) => item.id === node.id) === index);
}

function renderSourceCode(sourceCode, selectedSourceNodes) {
  if (!sourceCode) {
    return `<p class="graph-source-empty" data-testid="program-source-empty">${t('graph.source.empty')}</p>`;
  }

  const highlightedLines = new Set(selectedSourceNodes.map((node) => node.sourceLine));

  return `
    <pre class="graph-source-code" data-testid="program-source-code"><code>
      ${sourceCode.split('\n').map((line, index) => `
        <span class="graph-source-line${highlightedLines.has(index + 1) ? ' graph-source-line--active' : ''}" data-testid="program-source-line-${index + 1}">
          <span class="graph-source-line-number">${index + 1}</span>
          <span class="graph-source-line-text">${escapeHtml(line) || '&nbsp;'}</span>
        </span>
      `).join('')}
    </code></pre>
  `;
}

function resolveProgramGraph(program) {
  if (program.sourceCode && program.language) {
    return generateControlFlowGraphFromProgram({
      sourceCode: program.sourceCode,
      language: program.language,
      title: `${program.name} Control Flow Graph`,
    });
  }

  if (program.graph) {
    return cloneGraph(program.graph);
  }

  throw new Error(t('graph.err.noSource'));
}

function trimToCircle(from, to, radius) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return {
    x: to.x - (dx / len) * radius,
    y: to.y - (dy / len) * radius,
  };
}

function computeGraphBounds(graph, edgeList = graph.edges, padding = 60) {
  const xs = [];
  const ys = [];
  for (const node of graph.nodes) {
    xs.push(node.x - 32, node.x + 32);
    ys.push(node.y - 32, node.y + 32);
  }
  for (const edge of edgeList) {
    if (edge?.control) {
      xs.push(edge.control.x);
      ys.push(edge.control.y);
    }
  }
  if (xs.length === 0) return { minX: 0, minY: 0, width: 920, height: 340 };
  const minX = Math.min(...xs) - padding;
  const minY = Math.min(...ys) - padding;
  const maxX = Math.max(...xs) + padding;
  const maxY = Math.max(...ys) + padding;
  return {
    minX,
    minY,
    width: Math.max(920, maxX - minX),
    height: Math.max(340, maxY - minY),
  };
}

function createGraphCanvas(graph, requirement) {
  const highlightedNodes = new Set(requirement?.nodes || []);
  const highlightedEdges = new Set(requirement?.edges || []);
  const { minX, minY, width, height } = computeGraphBounds(graph);

  return `
    <div class="graph-canvas" data-testid="graph-canvas">
      <svg viewBox="${minX} ${minY} ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${t('graph.aria.canvas')}">
        <defs>
          <marker id="arrow-default" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 z" fill="#9aa8b6"></path>
          </marker>
          <marker id="arrow-active" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 z" fill="#ea580c"></path>
          </marker>
        </defs>
        ${graph.edges.map((edge) => {
          const fromNode = graph.nodes.find((node) => node.id === edge.from);
          const toNode = graph.nodes.find((node) => node.id === edge.to);
          const active = highlightedEdges.has(edge.id);
          const NODE_R = 28;
          const ARROW_GAP = 4; // small visual gap so arrow tip sits at circle edge

          if (edge.control) {
            // Trim end along the tangent (control → end) of the quadratic curve.
            const end = trimToCircle(edge.control, toNode, NODE_R + ARROW_GAP);
            const start = trimToCircle(edge.control, fromNode, NODE_R);
            return `
              <path
                class="graph-edge${active ? ' graph-edge--active' : ''}"
                d="M ${start.x} ${start.y} Q ${edge.control.x} ${edge.control.y} ${end.x} ${end.y}"
                marker-end="url(#${active ? 'arrow-active' : 'arrow-default'})"
                data-testid="graph-edge-${edge.id}"
              ></path>
            `;
          }

          const end = trimToCircle(fromNode, toNode, NODE_R + ARROW_GAP);
          const start = trimToCircle(toNode, fromNode, NODE_R);
          return `
            <line
              class="graph-edge${active ? ' graph-edge--active' : ''}"
              x1="${start.x}"
              y1="${start.y}"
              x2="${end.x}"
              y2="${end.y}"
              marker-end="url(#${active ? 'arrow-active' : 'arrow-default'})"
              data-testid="graph-edge-${edge.id}"
            ></line>
          `;
        }).join('')}
        ${graph.nodes.map((node) => `
          <g class="graph-node${highlightedNodes.has(node.id) ? ' graph-node--active' : ''}" data-testid="graph-node-${node.id}">
            ${node.sourceLine ? `<title>Line ${node.sourceLine}: ${escapeHtml(node.sourceText || node.label)}</title>` : ''}
            <circle cx="${node.x}" cy="${node.y}" r="28"></circle>
            <text x="${node.x}" y="${node.y + 5}" text-anchor="middle">${node.label}</text>
          </g>
        `).join('')}
      </svg>
    </div>
  `;
}

function createDataFlowCanvas(graph) {
  const dfg = buildDataFlowGraph(graph);
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  const { minX, minY, width, height } = computeGraphBounds(graph, dfg.edges);

  // Group edges between the same pair so labels stack instead of overlap.
  const grouped = new Map();
  for (const e of dfg.edges) {
    const key = `${e.from}->${e.to}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(e);
  }

  const edgeMarkup = [...grouped.entries()].map(([key, group]) => {
    const sample = group[0];
    const a = nodeById.get(sample.from);
    const b = nodeById.get(sample.to);
    if (!a || !b) return '';
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    // Curve up-and-over for forward, down for back-edges so the DFG view
    // doesn't overlap the CFG straight lines.
    const sign = a.y <= b.y ? -1 : 1;
    const offset = 28 + group.length * 6;
    const cx = (a.x + b.x) / 2 + (-dy / len) * offset * sign;
    const cy = (a.y + b.y) / 2 + (dx / len) * offset * sign;
    const labels = group.map((e) => e.variable).join(', ');
    const DFG_R = 24;
    const ARROW_GAP = 4;
    const start = trimToCircle({ x: cx, y: cy }, a, DFG_R);
    const end = trimToCircle({ x: cx, y: cy }, b, DFG_R + ARROW_GAP);
    return `
      <g class="graph-dfg-edge" data-testid="dfg-edge-${escapeHtml(key)}">
        <path d="M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}"
              marker-end="url(#dfg-arrow)"></path>
        <text x="${cx}" y="${cy}" text-anchor="middle">${escapeHtml(labels)}</text>
      </g>
    `;
  }).join('');

  const empty = dfg.edges.length === 0
    ? `<p class="graph-dfg-empty" data-testid="graph-dfg-empty">${t('graph.dfg.empty')}</p>`
    : '';

  return `
    <div class="graph-dfg-card" data-testid="graph-dfg-card">
      <div class="graph-dfg-header">
        <h4>${t('graph.dfg.title')}</h4>
        <p>${t('graph.dfg.help')}</p>
      </div>
      <div class="graph-canvas graph-dfg-canvas" data-testid="graph-dfg-canvas">
        <svg viewBox="${minX} ${minY} ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${t('graph.dfg.aria')}">
          <defs>
            <marker id="dfg-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 z" fill="#0ea5e9"></path>
            </marker>
          </defs>
          ${edgeMarkup}
          ${graph.nodes.map((node) => `
            <g class="graph-node graph-dfg-node" data-testid="dfg-node-${node.id}">
              <circle cx="${node.x}" cy="${node.y}" r="24"></circle>
              <text x="${node.x}" y="${node.y + 5}" text-anchor="middle">${node.label}</text>
            </g>
          `).join('')}
        </svg>
      </div>
      ${empty}
    </div>
  `;
}

export function createGraphCoverageExplorer() {
  const root = document.createElement('div');
  const defaultGraph = cloneGraph(graphCoverageGraph);
  const defaultProgram = {
    id: 'default-sample',
    name: 'Default CFG Sample',
    description: 'A generic control flow graph used to compare graph coverage criteria on the same structure.',
    sourceCode: '',
  };

  let graph = defaultGraph;
  let baseGraph = cloneGraph(defaultGraph);
  let criterionId = 'node';
  let selectedRequirementId = null;
  let parseError = '';
  let sourceStatus = t('graph.status.initial');
  let activeProgram = defaultProgram;
  let selectedProgramId = defaultProgram.id;
  let selectedCodeLanguage = 'javascript';
  let autoApplyTimer = null;
  let draft = createDraftFromGraph(defaultGraph);

  const graphQuiz = { active: false, selectedPaths: new Set(), phase: 'question', result: null };

  function getQuizCandidates(pathPlan) {
    const seen = new Set();
    const candidates = [];
    for (const rp of pathPlan.requirementPaths) {
      if (!rp.path) continue;
      const key = rp.path.join('->');
      if (!seen.has(key)) { seen.add(key); candidates.push(rp.path); }
    }
    return candidates;
  }

  function gradeGraphQuiz(pathPlan) {
    const requirements = getCoverageRequirements(graph, criterionId);
    const userPaths = [...graphQuiz.selectedPaths].map((s) => s.split('->'));
    const coveredReqIds = new Set();
    for (const path of userPaths) {
      for (const rp of pathPlan.requirementPaths) {
        if (rp.path && rp.path.join('->') === path.join('->')) {
          coveredReqIds.add(rp.requirement.id);
        }
      }
    }
    graphQuiz.result = {
      covered: coveredReqIds.size,
      total: requirements.length,
      optimal: pathPlan.selectedPaths.length,
      userCount: userPaths.length,
    };
    graphQuiz.phase = 'graded';
    render();
  }

  function renderGraphQuizPanel(pathPlan, selectedCriterion) {
    if (!graphQuiz.active) return '';
    const candidates = getQuizCandidates(pathPlan);
    const isGraded = graphQuiz.phase === 'graded';
    const optimalKeys = new Set(pathPlan.selectedPaths.map((p) => p.join('->')));

    const pathItems = candidates.map((path, idx) => {
      const key = path.join('->');
      const checked = graphQuiz.selectedPaths.has(key) ? ' checked' : '';
      const isOptimal = optimalKeys.has(key);
      const optLabel = isGraded && isOptimal ? ' <span class="quiz-optimal-badge">✓ optimal</span>' : '';
      return `<label class="quiz-path-item">
        <input type="checkbox" data-quiz-path="${escapeHtml(key)}"${checked}
          ${isGraded ? 'disabled' : ''} data-testid="graph-quiz-path-${idx}"/>
        <span class="quiz-path-text">${escapeHtml(key.replaceAll('->', ' → '))}</span>
        ${optLabel}
      </label>`;
    }).join('');

    const scoreRow = isGraded ? `<p class="quiz-score" data-testid="graph-quiz-score">
      ${t('quiz.graph.score')
        .replace('{covered}', graphQuiz.result.covered)
        .replace('{total}', graphQuiz.result.total)
        .replace('{optimal}', graphQuiz.result.optimal)}
      ${graphQuiz.result.covered === graphQuiz.result.total && graphQuiz.result.userCount === graphQuiz.result.optimal
        ? ` <strong>${t('quiz.graph.perfect')}</strong>`
        : graphQuiz.result.covered < graphQuiz.result.total
          ? ` <em>${t('quiz.graph.incomplete')}</em>` : ''}
    </p>
    <button type="button" class="quiz-share-btn" data-share-payload="${encodeResult({ v: 1, explorer: 'graph', explorerLabel: t('quiz.graph.title'), mode: 'quiz', ts: Date.now(), lang: getLocale(), score: graphQuiz.result.covered, total: graphQuiz.result.total, items: candidates.map((path) => { const key = path.join('->'); const isOpt = optimalKeys.has(key); const checked = graphQuiz.selectedPaths.has(key); return { q: key.replaceAll('->', ' → '), a: checked ? '✓' : '—', expected: isOpt ? '✓' : '—', ok: checked === isOpt }; }) })}" data-testid="graph-quiz-share">📋 ${t('quiz.share.btn')}</button>` : '';

    const prompt = t('quiz.graph.prompt')
      .replace('{criterion}', escapeHtml(selectedCriterion ? selectedCriterion.label : criterionId))
      .replace('{program}', escapeHtml(activeProgram.name));

    return `<div class="quiz-panel quiz-panel--graph" data-testid="graph-quiz">
      <div class="quiz-header">
        <h4>${t('quiz.graph.title')}</h4>
        <button type="button" class="quiz-close-btn" data-testid="graph-quiz-close">${t('quiz.close')}</button>
      </div>
      <p class="quiz-prompt">${prompt}</p>
      <div class="quiz-path-list">${pathItems || '<em>No candidate paths available.</em>'}</div>
      ${scoreRow}
      <div class="quiz-actions">
        ${!isGraded
          ? `<button type="button" class="quiz-check-btn" data-testid="graph-quiz-check">${t('quiz.graph.check')}</button>`
          : `<button type="button" class="quiz-reset-btn" data-testid="graph-quiz-reset">${t('quiz.reset')}</button>`}
      </div>
    </div>`;
  }

  function loadGraphSource(program, nextGraph, statusMessage) {
    activeProgram = { ...program };
    selectedProgramId = program.id;
    baseGraph = cloneGraph(nextGraph);
    graph = cloneGraph(nextGraph);
    draft = createDraftFromGraph(graph);
    parseError = '';
    sourceStatus = statusMessage;
    selectedRequirementId = null;
    render();
  }

  function scheduleAutoApply() {
    if (autoApplyTimer) {
      clearTimeout(autoApplyTimer);
    }

    autoApplyTimer = window.setTimeout(() => {
      try {
        graph = {
          ...parseGraphDraft(draft),
          title: `${activeProgram.name} CFG`,
        };
        parseError = '';
        sourceStatus = t('graph.status.recomputed', { name: activeProgram.name });
        selectedRequirementId = null;
        render();
      } catch (error) {
        parseError = error.message;
        render();
      }
    }, 300);
  }

  function resetGraph() {
    graph = cloneGraph(baseGraph);
    draft = createDraftFromGraph(graph);
    parseError = '';
    sourceStatus = t('graph.status.reset', { name: activeProgram.name });
    selectedRequirementId = null;
    render();
  }

  function getState() {
    const requirements = getCoverageRequirements(graph, criterionId);
    if (!requirements.some((item) => item.id === selectedRequirementId)) {
      selectedRequirementId = requirements[0]?.id || null;
    }

    const selectedRequirement = requirements.find((item) => item.id === selectedRequirementId) || requirements[0] || null;
    const selectedCriterion = graphCoverageCriteria.find((item) => item.id === criterionId);
    const pathPlan = buildTestPathSetForRequirements(graph, requirements);

    return {
      requirements,
      selectedRequirement,
      selectedCriterion,
      pathPlan,
    };
  }

  function render() {
    const { requirements, selectedRequirement, selectedCriterion, pathPlan } = getState();
    const selectedSourceNodes = getSelectedSourceNodes(graph, selectedRequirement);
    const quizPanel = renderGraphQuizPanel(pathPlan, selectedCriterion);

    root.className = 'graph-coverage';
    root.dataset.testid = 'graph-coverage-explorer';
    root.innerHTML = `
      <div class="graph-source-card" data-testid="graph-source-card">
        <div class="graph-source-toolbar">
          <label>
            Program Example
            <select data-testid="program-example-select">
              <option value="${defaultProgram.id}"${selectedProgramId === defaultProgram.id ? ' selected' : ''}>Default CFG Sample</option>
              ${graphCoverageProgramExamples.map((example) => `
                <option value="${example.id}"${selectedProgramId === example.id ? ' selected' : ''}>${example.name}</option>
              `).join('')}
              <option value="uploaded-code"${selectedProgramId === 'uploaded-code' ? ' selected' : ''}>Uploaded Source Code</option>
              <option value="uploaded-spec"${selectedProgramId === 'uploaded-spec' ? ' selected' : ''}>Uploaded Graph Spec</option>
            </select>
          </label>
          <div class="graph-upload-field">
            <span>Upload JSON Graph Spec</span>
            <button type="button" class="graph-upload-btn" data-testid="graph-upload-btn">${t('common.chooseFile')}</button>
            <input type="file" accept="application/json,.json" data-testid="graph-upload-input" class="sr-only" />
          </div>
          <label>
            Code Language
            <select data-testid="program-language-select">
              ${graphCoverageCodeLanguages.map((language) => `
                <option value="${language.id}"${selectedCodeLanguage === language.id ? ' selected' : ''}>${language.label}</option>
              `).join('')}
            </select>
          </label>
          <div class="graph-upload-field">
            <span>Upload Source Code</span>
            <button type="button" class="graph-upload-btn" data-testid="code-upload-btn">${t('common.chooseFile')}</button>
            <input type="file" accept=".js,.txt,.code,.pseudo" data-testid="code-upload-input" class="sr-only" />
          </div>
        </div>
        <div class="graph-source-copy">
          <div>
            <span class="detail-label">Current Source</span>
            <h4 data-testid="program-source-name">${activeProgram.name}</h4>
            <p class="graph-source-description" data-testid="program-source-description">${activeProgram.description}</p>
            <p class="graph-source-status${parseError ? ' graph-editor-status--error' : ''}" data-testid="graph-source-status">${parseError || sourceStatus}</p>
          </div>
          <div class="graph-upload-hint">
            <span class="detail-label">Upload Format</span>
            <p>${t('graph.uploadFormatHelp')}</p>
          </div>
        </div>
        ${renderSourceCode(activeProgram.sourceCode, selectedSourceNodes)}
      </div>

      <div class="graph-editor-card" data-testid="graph-editor-card">
        <div class="graph-editor-header">
          <h4>Graph Editor</h4>
          <p>${t('graph.editor.help')}</p>
        </div>
        <div class="graph-editor-meta">
          <label>
            Start
            <input type="text" value="${draft.startNodeId}" data-testid="graph-start-input" data-draft-field="startNodeId" />
          </label>
          <label>
            End
            <input type="text" value="${draft.endNodeId}" data-testid="graph-end-input" data-draft-field="endNodeId" />
          </label>
          <button type="button" class="graph-editor-reset" data-testid="graph-reset-btn">${t('graph.editor.reset')}</button>
        </div>
        <div class="graph-editor-grid">
          <label>
            Nodes (id,label,x,y)
            <textarea data-testid="graph-nodes-input" data-draft-field="nodesText">${draft.nodesText}</textarea>
          </label>
          <label>
            Edges (from,to | id,from,to | id,from,to,cx,cy)
            <textarea data-testid="graph-edges-input" data-draft-field="edgesText">${draft.edgesText}</textarea>
          </label>
        </div>
        <p class="graph-editor-status${parseError ? ' graph-editor-status--error' : ''}" data-testid="graph-editor-status">
          ${parseError || t('graph.editor.synced')}
        </p>
      </div>

      <div class="graph-coverage-header">
        <div>
          <p class="graph-coverage-kicker">White Box Testing</p>
          <h3>${pickField(graph, 'title')}</h3>
          <p class="graph-coverage-desc">${t('graph.headerDesc')}</p>
        </div>
        <div class="graph-coverage-stats">
          <div class="graph-stat-card"><span class="graph-stat-label">Nodes</span><strong>${graph.nodes.length}</strong></div>
          <div class="graph-stat-card"><span class="graph-stat-label">Edges</span><strong>${graph.edges.length}</strong></div>
          <div class="graph-stat-card"><span class="graph-stat-label">Requirements</span><strong>${requirements.length}</strong></div>
        </div>
      </div>

      <div class="graph-criterion-row">
        <div class="graph-criterion-switcher" role="tablist" aria-label="${t('graph.aria.switcher')}">
          ${graphCoverageCriteria.map((criterion) => `
            <button
              class="criterion-chip${criterionId === criterion.id ? ' active' : ''}"
              type="button"
              data-testid="criterion-${criterion.id}"
              data-criterion="${criterion.id}"
              role="tab"
              aria-selected="${criterionId === criterion.id}"
            >
              <span>${pickField(criterion, 'label')}</span>
              <small>${criterion.label}</small>
            </button>
          `).join('')}
        </div>
        <button type="button" class="quiz-start-btn" data-testid="graph-quiz-start">${t('quiz.start')}</button>
      </div>

      <div class="graph-coverage-layout">
        <div class="graph-main-panel">
          ${createGraphCanvas(graph, selectedRequirement)}
          ${createDataFlowCanvas(graph)}
          <div class="graph-selected-summary" data-testid="selected-requirement-summary">
            <span class="summary-label">${t('graph.summary.current')}</span>
            <strong>${selectedRequirement?.label || t('common.none')}</strong>
            <p>${selectedCriterion ? pickField(selectedCriterion, 'description') : ''}</p>
          </div>

          <div class="graph-test-path-card" data-testid="graph-test-path-card">
            <h4>Generated Test Path Set</h4>
            <p class="sidebar-text">${t('graph.path.help')}</p>
            <div class="test-path-metrics" data-testid="test-path-metrics">
              <div class="test-path-metric">
                <span class="detail-label">${t('graph.path.before')}</span>
                <strong data-testid="baseline-path-count">${pathPlan.optimizationMetrics.baselinePathCount}</strong>
              </div>
              <div class="test-path-metric">
                <span class="detail-label">${t('graph.path.after')}</span>
                <strong data-testid="optimized-path-count">${pathPlan.optimizationMetrics.optimizedPathCount}</strong>
              </div>
              <div class="test-path-metric test-path-metric--accent">
                <span class="detail-label">${t('graph.path.saved')}</span>
                <strong data-testid="saved-path-count">${pathPlan.optimizationMetrics.savedPathCount}</strong>
              </div>
            </div>
            <ul class="test-path-list" data-testid="test-path-list">
              ${pathPlan.selectedPaths.map((path, index) => `
                <li data-testid="test-path-${index + 1}">T${index + 1}: ${path.join(' -> ')}</li>
              `).join('') || `<li>${t('graph.path.none')}</li>`}
            </ul>
            <p class="test-path-meta" data-testid="test-path-meta">
              Covered Requirements: ${pathPlan.requirementPaths.filter((item) => item.covered).length} / ${pathPlan.requirementPaths.length}
            </p>
            ${pathPlan.uncoveredRequirements.length
              ? `<p class="graph-editor-status graph-editor-status--error">${t('graph.path.uncovered', { items: pathPlan.uncoveredRequirements.map((item) => item.displayText).join('、') })}</p>`
              : `<p class="graph-editor-status">${t('graph.path.allCovered')}</p>`}
          </div>
        </div>

        <aside class="graph-sidebar">
          <div class="graph-sidebar-card">
            <h4>Test Requirements</h4>
            <p class="sidebar-text">${t('graph.req.help')}</p>
            <ul class="requirement-list" data-testid="requirement-list">
              ${requirements.map((requirement) => `
                <li>
                  <button
                    class="requirement-item${selectedRequirement?.id === requirement.id ? ' active' : ''}"
                    type="button"
                    data-testid="requirement-${requirement.id}"
                    data-requirement-id="${requirement.id}"
                  >
                    <span class="requirement-kind">${requirement.type}</span>
                    <strong>${requirement.displayText}</strong>
                  </button>
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="graph-sidebar-card">
            <h4>Requirement Detail</h4>
            <div class="detail-grid">
              <div>
                <span class="detail-label">Nodes</span>
                <p data-testid="detail-nodes">${selectedRequirement?.nodes.join(' -> ') || t('common.none')}</p>
              </div>
              <div>
                <span class="detail-label">Edges</span>
                <p data-testid="detail-edges">${selectedRequirement?.edges.join(', ') || t('common.none')}</p>
              </div>
              <div>
                <span class="detail-label">Criterion</span>
                <p>${selectedCriterion ? pickField(selectedCriterion, 'label') : ''}</p>
              </div>
              <div>
                <span class="detail-label">Source Mapping</span>
                <ul class="source-mapping-list" data-testid="detail-source-mapping">
                  ${selectedSourceNodes.length
                    ? selectedSourceNodes.map((node) => `<li>${node.label} -> L${node.sourceLine}: ${escapeHtml(node.sourceText || '')}</li>`).join('')
                    : `<li>${t('graph.detail.noSourceMap')}</li>`}
                </ul>
              </div>
            </div>
          </div>
        </aside>
      </div>

      ${quizPanel}
    `;

    root.querySelector('[data-testid="graph-reset-btn"]').addEventListener('click', () => {
      resetGraph();
    });

    root.querySelector('[data-testid="program-example-select"]').addEventListener('change', (event) => {
      const nextProgramId = event.target.value;

      if (nextProgramId === defaultProgram.id) {
        loadGraphSource(defaultProgram, defaultGraph, t('graph.status.defaultLoaded'));
        return;
      }

      if (nextProgramId === 'uploaded-spec') {
        selectedProgramId = nextProgramId;
        sourceStatus = t('graph.status.pickJson');
        render();
        return;
      }

      if (nextProgramId === 'uploaded-code') {
        selectedProgramId = nextProgramId;
        sourceStatus = t('graph.status.pickCode');
        render();
        return;
      }

      const example = graphCoverageProgramExamples.find((item) => item.id === nextProgramId);
      if (example) {
        const nextGraph = resolveProgramGraph(example);
        selectedCodeLanguage = example.language || selectedCodeLanguage;
        loadGraphSource(example, nextGraph, t('graph.status.exampleLoaded', { name: example.name }));
      }
    });

    root.querySelector('[data-testid="program-language-select"]').addEventListener('change', (event) => {
      selectedCodeLanguage = event.target.value;
    });

    root.querySelector('[data-testid="graph-upload-btn"]').addEventListener('click', () => {
      root.querySelector('[data-testid="graph-upload-input"]').click();
    });

    root.querySelector('[data-testid="code-upload-btn"]').addEventListener('click', () => {
      root.querySelector('[data-testid="code-upload-input"]').click();
    });

    root.querySelector('[data-testid="graph-upload-input"]').addEventListener('change', async (event) => {
      const [file] = event.target.files || [];

      if (!file) {
        return;
      }

      try {
        const spec = parseUploadedGraphSpec(await readUploadedFile(file));
        loadGraphSource(
          { ...spec.program, id: 'uploaded-spec' },
          spec.graph,
          t('graph.status.uploadLoaded', { name: file.name })
        );
      } catch (error) {
        selectedProgramId = 'uploaded-spec';
        parseError = error.message;
        render();
      }
    });

    root.querySelector('[data-testid="code-upload-input"]').addEventListener('change', async (event) => {
      const [file] = event.target.files || [];

      if (!file) {
        return;
      }

      try {
        const sourceCode = await readUploadedFile(file);
        const uploadedProgram = {
          id: 'uploaded-code',
          name: file.name.replace(/\.[^.]+$/, '') || 'Uploaded Code',
          description: `Uploaded ${selectedCodeLanguage} source file converted into a simplified control flow graph.`,
          sourceCode,
          language: selectedCodeLanguage,
        };
        const generatedGraph = resolveProgramGraph(uploadedProgram);
        selectedProgramId = 'uploaded-code';
        loadGraphSource(uploadedProgram, generatedGraph, t('graph.status.codeGenerated', { name: file.name }));
      } catch (error) {
        parseError = error.message;
        sourceStatus = t('graph.status.codeFailed');
        render();
      }
    });

    root.querySelectorAll('[data-draft-field]').forEach((input) => {
      input.addEventListener('input', () => {
        draft = {
          ...draft,
          [input.dataset.draftField]: input.value,
        };
        scheduleAutoApply();
      });
    });

    root.querySelectorAll('[data-criterion]').forEach((button) => {
      button.addEventListener('click', () => {
        criterionId = button.dataset.criterion;
        selectedRequirementId = null;
        render();
      });
    });

    root.querySelectorAll('[data-requirement-id]').forEach((button) => {
      button.addEventListener('click', () => {
        selectedRequirementId = button.dataset.requirementId;
        render();
      });
    });

    root.querySelector('[data-testid="graph-quiz-start"]')?.addEventListener('click', () => {
      graphQuiz.active = true;
      graphQuiz.selectedPaths = new Set();
      graphQuiz.phase = 'question';
      graphQuiz.result = null;
      render();
    });

    root.querySelector('[data-testid="graph-quiz-close"]')?.addEventListener('click', () => {
      graphQuiz.active = false;
      render();
    });

    root.querySelectorAll('[data-quiz-path]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const key = cb.dataset.quizPath;
        if (cb.checked) graphQuiz.selectedPaths.add(key);
        else graphQuiz.selectedPaths.delete(key);
      });
    });

    root.querySelector('[data-testid="graph-quiz-check"]')?.addEventListener('click', () => {
      const { pathPlan } = getState();
      gradeGraphQuiz(pathPlan);
    });

    root.querySelector('[data-testid="graph-quiz-reset"]')?.addEventListener('click', () => {
      graphQuiz.selectedPaths = new Set();
      graphQuiz.phase = 'question';
      graphQuiz.result = null;
      render();
    });
  }

  render();

  if (typeof globalThis.addEventListener === 'function') {
    globalThis.addEventListener('stvisual:load-program-source', (event) => {
      if (!root.isConnected) return;
      const detail = event.detail || {};
      if (detail.target !== 'graph') return;
      const content = String(detail.content ?? '');
      const fileName = detail.name || 'uploaded.code';
      try {
        const uploadedProgram = {
          id: 'uploaded-code',
          name: fileName.replace(/\.[^.]+$/, '') || 'Uploaded Code',
          description: `Uploaded ${selectedCodeLanguage} source from cloud, converted into a simplified control flow graph.`,
          sourceCode: content,
          language: selectedCodeLanguage,
        };
        const generatedGraph = resolveProgramGraph(uploadedProgram);
        loadGraphSource(uploadedProgram, generatedGraph, t('graph.status.codeGenerated', { name: fileName }));
      } catch (error) {
        parseError = error.message;
        sourceStatus = t('graph.status.codeFailed');
        render();
      }
    });
  }

  return root;
}
