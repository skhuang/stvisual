# stvisual Conversation Summary

Date: 2026-04-12

## 1) Project Objective
The original request was to visualize software testing methods from Plan.md, with clear visual effects and automated tests.

The scope then expanded from educational visualization to a production-style workflow including:
- graph coverage modeling and requirement generation
- editable graph and path optimization
- static architecture compatible with both browser hosting and file protocol
- CI/CD, GitHub Pages, and PR-based collaboration
- real-program-driven graph generation (code upload -> simplified CFG)

## 2) Requirement Evolution (Chronological)
1. Visualize testing methods from Plan.md, with tests.
2. Differentiate visual presentation by method categories.
3. Implement graph coverage first: node, edge, prime path.
4. Generate test requirements from a graph.
5. Refactor architecture to plain index.html + JavaScript (no React runtime requirement).
6. Deploy to GitHub Pages.
7. Use PR workflow and GitHub Actions for tests.
8. Expand graph coverage: test path generation, editable graph, edge-pair and complete-path criteria.
9. Add browser tests for the above.
10. Add minimal test-path-set optimization (greedy set-cover approximation).
11. Expose optimization before/after metrics in UI.
12. Add GitHub README and improve it for showcase style.
13. Support real program examples and uploaded graph specs.
14. Support uploaded source code + language type, auto-generate simplified CFG.
15. Extend parser support: switch, nested loops, break, continue.
16. Show source-line mapping between CFG nodes and uploaded code.
17. Add E2E for complex upload flows and criterion-switch mapping consistency.

## 3) Architecture Changes
### Initial Direction
- Interactive front-end focused on testing visualization.

### Final Runtime Architecture
- Static HTML + vanilla JS entry points.
- Dual-mode runtime:
  - http/https: modular entry
  - file://: standalone fallback bundle

Main files:
- [index.html](../index.html)
- [src/bootstrap.js](../src/bootstrap.js)
- [src/main.js](../src/main.js)
- [src/app.js](../src/app.js)
- [src/standalone.js](../src/standalone.js)

## 4) Key Functional Outcomes
### Core Visualization
- Testing method taxonomy (black-box, white-box, gray-box)
- Testing process flow visualization
- Testing type hierarchy and explanation

### Graph Coverage Explorer
- Criteria:
  - Node
  - Edge
  - Prime Path
  - Edge-Pair
  - Complete Path
- Requirement generation and detail pane
- Test path generation and selection
- Greedy set-cover style path reduction
- Optimization metrics shown in UI (before / after / saved)
- Editable graph input with live recalculation

Relevant implementation:
- [src/components/GraphCoverageExplorer.js](../src/components/GraphCoverageExplorer.js)
- [src/utils/graphCoverage.js](../src/utils/graphCoverage.js)
- [src/data/testingData.js](../src/data/testingData.js)

### Program-to-CFG Pipeline
- Fixed classic examples including:
  - Triangle Problem
  - Next Date
  - Commission Problem
  - Next Date Leap-Year Variant
  - Calendar Days Switch Variant
- Upload JSON graph spec
- Upload source code with selected language type
- Auto-convert source code to simplified CFG
- Source-line mapping shown in UI and synchronized with selected requirements

Relevant implementation:
- [src/utils/programToGraph.js](../src/utils/programToGraph.js)
- [src/components/GraphCoverageExplorer.js](../src/components/GraphCoverageExplorer.js)
- [src/data/testingData.js](../src/data/testingData.js)

## 5) Testing & Quality
### Unit Tests (Vitest + jsdom)
- Coverage logic tests
- Data contract tests
- Component rendering and interaction tests
- Program-to-CFG parser tests (including switch / nested loop / break / continue)

Key test files:
- [src/tests/graphCoverage.test.js](../src/tests/graphCoverage.test.js)
- [src/tests/GraphCoverageExplorer.test.jsx](../src/tests/GraphCoverageExplorer.test.jsx)
- [src/tests/programToGraph.test.js](../src/tests/programToGraph.test.js)
- [src/tests/testingData.test.js](../src/tests/testingData.test.js)

### Browser E2E (Playwright)
- Graph coverage behavior
- Optimization metrics
- Code upload flow
- Complex control-flow upload mapping
- Mapping consistency after criterion switching (node / edge / prime-path)

Key E2E files:
- [e2e/graph-coverage.spec.js](../e2e/graph-coverage.spec.js)
- [e2e/path-optimization-metrics.spec.js](../e2e/path-optimization-metrics.spec.js)
- [e2e/code-upload.spec.js](../e2e/code-upload.spec.js)

## 6) CI/CD and Deployment
### CI
- Unit and browser tests in GitHub Actions

### Pages Deployment
- Build and deploy to GitHub Pages using workflow pipeline
- Standalone bundle generation integrated into deployment preparation

Workflow files:
- [.github/workflows/test.yml](../.github/workflows/test.yml)
- [.github/workflows/deploy-pages.yml](../.github/workflows/deploy-pages.yml)

Scripts:
- [scripts/build-standalone.mjs](../scripts/build-standalone.mjs)
- [scripts/prepare-pages.mjs](../scripts/prepare-pages.mjs)

## 7) GitHub Delivery Trace
### Pull Requests
- #1: Support standalone file mode and add test CI (merged)
- #2: Add browser tests for graph coverage features (merged)
- #6: Sync standalone fallback with latest graph coverage features (merged)
- #8: Show path optimization metrics in graph coverage UI (merged)
- #9: Add project README (merged)
- #11: Support code upload for simplified CFG generation (merged)

### Issues
- #3: Graph coverage advanced features (open)
- #4: Deployment compatibility for github.io / file protocol (open)
- #5: Browser E2E in GitHub Actions (open)
- #7: Optimization metric UI (closed)
- #10: Code upload and simplified CFG generation (closed)
- #12: Complex code-upload mapping-switch E2E (open)

## 8) Major Decisions and Lessons
1. Static architecture improved portability and simplified deployment.
2. file:// compatibility requires a generated standalone fallback kept in sync with source.
3. Graph coverage and path optimization are easier to validate when requirements and selected paths are both visible.
4. For realistic educational value, source-code-first workflows (program upload -> CFG) are essential.
5. Source-line mapping significantly improves explainability of generated CFG and coverage requirements.

## 9) Current State
The project is now a complete, test-backed educational tool that supports:
- conceptual testing visualization
- graph-based coverage planning
- editable and generated control-flow graphs
- source-mapped requirement analysis
- CI/CD and GitHub Pages deployment

## 10) Suggested Next Steps
1. Expand language support in program-to-CFG conversion (beyond JavaScript and pseudocode).
2. Add parser handling for additional constructs (try/catch, labeled breaks, complex switch fall-through semantics).
3. Add richer source-map UX (click source line to focus corresponding CFG node and vice versa).
4. Consider reporting and export features for generated requirements and selected test paths.
