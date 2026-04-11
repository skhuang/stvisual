# stvisual External Presentation Brief

Date: 2026-04-12

## Product Pitch
stvisual is an interactive learning and analysis platform for software testing, focused on graph coverage from both manually edited control-flow graphs and uploaded source code.

## Problem
Teaching and applying coverage criteria is often abstract.
Traditional materials explain node, edge, and prime-path coverage conceptually, but learners still struggle to connect theory with executable test requirements and real program structure.

## Solution
stvisual turns coverage theory into visual, testable workflows.

- Visual testing-method map: black-box, white-box, gray-box
- Graph Coverage Explorer: node, edge, prime-path, edge-pair, complete-path
- Requirement generation from CFG
- Auto-generated test path sets with optimization metrics
- Source upload -> simplified CFG generation
- Source-line mapping from selected requirements back to code lines

## What Makes It Different
- Dual input model: graph-first and code-first
- Explainability-first UI: requirement detail + mapped source lines
- Built for reproducibility: unit tests, browser E2E, CI workflows
- Deployment-ready static architecture for both hosted and file protocol usage

## Key Technical Highlights
- Plain HTML + JavaScript runtime with protocol-aware bootstrap
- Standalone fallback bundle for file protocol compatibility
- Program-to-CFG parser with support for if, switch, nested loops, break, continue
- Greedy set-cover approximation for test-path reduction

## Validation Evidence
- Unit tests cover parser, coverage algorithms, data contracts, and UI interactions
- Browser E2E covers upload flow, complex control-flow mapping, and criterion-switch consistency
- GitHub Actions runs automated tests and deployment workflows

## Delivery Status
- Core visualization delivered
- Advanced graph coverage delivered
- Path optimization metrics delivered
- README and documentation delivered
- Program upload and source-mapped CFG workflow delivered

## Typical Use Cases
- Teaching graph coverage in software testing courses
- Demonstrating requirement derivation from control-flow structure
- Comparing coverage criteria behavior on the same program
- Explaining test-path minimization and trade-offs

## Public Links
- Repository: https://github.com/skhuang/stvisual
- Live Demo: https://skhuang.github.io/stvisual/

## Next Growth Opportunities
1. Expand language support in source-to-CFG generation.
2. Add richer parser semantics for advanced control-flow constructs.
3. Provide bidirectional navigation between code lines and CFG nodes.
4. Add exportable coverage reports for teaching and assessment.
