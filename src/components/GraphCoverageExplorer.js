import { graphCoverageCriteria, graphCoverageGraph } from '../data/testingData.js';
import { getCoverageRequirements } from '../utils/graphCoverage.js';

function createGraphCanvas(graph, requirement) {
  const highlightedNodes = new Set(requirement?.nodes || []);
  const highlightedEdges = new Set(requirement?.edges || []);

  return `
    <div class="graph-canvas" data-testid="graph-canvas">
      <svg viewBox="0 0 920 340" role="img" aria-label="Graph coverage 控制流程圖">
        <defs>
          <marker id="arrow-default" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
            <path d="M0,0 L12,6 L0,12 z" fill="#9aa8b6"></path>
          </marker>
          <marker id="arrow-active" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
            <path d="M0,0 L12,6 L0,12 z" fill="#ea580c"></path>
          </marker>
        </defs>
        ${graph.edges.map((edge) => {
          const fromNode = graph.nodes.find((node) => node.id === edge.from);
          const toNode = graph.nodes.find((node) => node.id === edge.to);
          const active = highlightedEdges.has(edge.id);

          if (edge.control) {
            return `
              <path
                class="graph-edge${active ? ' graph-edge--active' : ''}"
                d="M ${fromNode.x} ${fromNode.y} Q ${edge.control.x} ${edge.control.y} ${toNode.x} ${toNode.y}"
                marker-end="url(#${active ? 'arrow-active' : 'arrow-default'})"
                data-testid="graph-edge-${edge.id}"
              ></path>
            `;
          }

          return `
            <line
              class="graph-edge${active ? ' graph-edge--active' : ''}"
              x1="${fromNode.x}"
              y1="${fromNode.y}"
              x2="${toNode.x}"
              y2="${toNode.y}"
              marker-end="url(#${active ? 'arrow-active' : 'arrow-default'})"
              data-testid="graph-edge-${edge.id}"
            ></line>
          `;
        }).join('')}
        ${graph.nodes.map((node) => `
          <g class="graph-node${highlightedNodes.has(node.id) ? ' graph-node--active' : ''}" data-testid="graph-node-${node.id}">
            <circle cx="${node.x}" cy="${node.y}" r="28"></circle>
            <text x="${node.x}" y="${node.y + 5}" text-anchor="middle">${node.label}</text>
          </g>
        `).join('')}
      </svg>
    </div>
  `;
}

export function createGraphCoverageExplorer() {
  const root = document.createElement('div');
  let criterionId = 'node';
  let selectedRequirementId = null;

  function getState() {
    const requirements = getCoverageRequirements(graphCoverageGraph, criterionId);
    if (!requirements.some((item) => item.id === selectedRequirementId)) {
      selectedRequirementId = requirements[0]?.id || null;
    }
    const selectedRequirement = requirements.find((item) => item.id === selectedRequirementId) || requirements[0] || null;
    const selectedCriterion = graphCoverageCriteria.find((item) => item.id === criterionId);

    return {
      requirements,
      selectedRequirement,
      selectedCriterion,
    };
  }

  function render() {
    const { requirements, selectedRequirement, selectedCriterion } = getState();

    root.className = 'graph-coverage';
    root.dataset.testid = 'graph-coverage-explorer';
    root.innerHTML = `
      <div class="graph-coverage-header">
        <div>
          <p class="graph-coverage-kicker">White Box Testing</p>
          <h3>${graphCoverageGraph.title}</h3>
          <p class="graph-coverage-desc">用同一張控制流程圖，切換不同 coverage criteria，直接看到必須涵蓋的節點、邊與 prime path。</p>
        </div>
        <div class="graph-coverage-stats">
          <div class="graph-stat-card"><span class="graph-stat-label">Nodes</span><strong>${graphCoverageGraph.nodes.length}</strong></div>
          <div class="graph-stat-card"><span class="graph-stat-label">Edges</span><strong>${graphCoverageGraph.edges.length}</strong></div>
          <div class="graph-stat-card"><span class="graph-stat-label">Requirements</span><strong>${requirements.length}</strong></div>
        </div>
      </div>
      <div class="graph-criterion-switcher" role="tablist" aria-label="coverage criteria 切換">
        ${graphCoverageCriteria.map((criterion) => `
          <button
            class="criterion-chip${criterionId === criterion.id ? ' active' : ''}"
            type="button"
            data-testid="criterion-${criterion.id}"
            data-criterion="${criterion.id}"
            role="tab"
            aria-selected="${criterionId === criterion.id}"
          >
            <span>${criterion.labelZh}</span>
            <small>${criterion.label}</small>
          </button>
        `).join('')}
      </div>
      <div class="graph-coverage-layout">
        <div class="graph-main-panel">
          ${createGraphCanvas(graphCoverageGraph, selectedRequirement)}
          <div class="graph-selected-summary" data-testid="selected-requirement-summary">
            <span class="summary-label">目前 requirement</span>
            <strong>${selectedRequirement?.label || '無'}</strong>
            <p>${selectedCriterion?.description || ''}</p>
          </div>
        </div>
        <aside class="graph-sidebar">
          <div class="graph-sidebar-card">
            <h4>Test Requirements</h4>
            <p class="sidebar-text">切換 criteria 後，列表會重算對應必須覆蓋的 requirement。</p>
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
                <p data-testid="detail-nodes">${selectedRequirement?.nodes.join(' -> ') || '無'}</p>
              </div>
              <div>
                <span class="detail-label">Edges</span>
                <p data-testid="detail-edges">${selectedRequirement?.edges.join(', ') || '無'}</p>
              </div>
              <div>
                <span class="detail-label">Criterion</span>
                <p>${selectedCriterion?.labelZh || ''}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    `;

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
  }

  render();
  return root;
}
