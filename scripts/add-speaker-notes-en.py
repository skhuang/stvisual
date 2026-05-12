#!/usr/bin/env python3
"""Inject speaker notes into English slide decks using case-insensitive heading matching."""
import os, re

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', 'slides')

# Keys are matched case-insensitively as substrings of slide headings.
EN = {
    '01-course-intro': {
        'software testing visual': 'Welcome students. This series has 13 lectures, each paired with a browser-based interactive tool designed to turn abstract test criteria into measurable engineering practice.',
        'course goal': 'Emphasize "hands-on": every requirement is a clickable item in the tool and students see coverage metrics update in real time, rather than just memorizing definitions.',
        'course map': 'The course has expanded to 13 lectures (adding Data Flow #4 and Logic Binding #13). Three main threads: graph (#3–#4), logic (#5, #13), and mutation (#6–#8).',
        'learning depend': 'The three threads can be taken in any order, but Graph Coverage is a prerequisite for Data Flow. Ask: which thread are you currently on?',
        'three categories': '"Code visibility" is the core classification axis. Ask students which category their daily testing falls into — the answer is usually gray-box.',
        'black-box': 'BVA is the most commonly underestimated but highly effective technique. All four black-box techniques need no source code and can be designed at the requirements review stage.',
        'white-box': 'Core idea for white-box: "structure defines criterion." Each subsequent lecture dives into one structure (graph, logic, mutation) as a concrete realization.',
        'gray-box': 'Ask: has anyone ever seen all their dependencies\' source code? This question usually makes everyone realize that almost all real-world testing is gray-box.',
        'method tree': 'Open the tool live. Click toggle-all-btn to expand all 16 techniques, then ask students to find the visibility-fill bar and state that black-box is 0%.',
        'white-box card': 'Point out symbex and concolic — high-end techniques used in industry for automated test generation. Covered in depth in lectures #10–#11.',
        'mental model': 'These three mental models (abstract, cover, mutate) are the skeleton of the entire series. Every criterion fits into one of them.',
        'summary': 'This lecture is an overview — no need to memorize everything. Awareness of the landscape matters; each subsequent lecture will go deep into one criterion.',
        'exercise': 'Reserve 10–15 minutes for hands-on tool exploration. Exercise 1 is the most essential; exercises 3–4 make good take-home discussion topics.',
        'further reading': 'Students wanting depth can read A&O §1–2. The full tool specification is in docs/Specification.zh-TW.md.',
    },
    '02-testing-flow-pyramid': {
        'testing flow': 'This lecture connects two complementary views: flow tells you "what to do when," and pyramid tells you "the right proportion for each layer."',
        'two parallel': 'Both views are needed. Flow gives the engineering lifecycle; pyramid gives the resource allocation ratio. Neither alone is sufficient.',
        'six steps': 'The key word is "repeatable": every time code changes, you run the flow again — not just before a release.',
        'auto-play': 'Open the tool and click auto-play to cycle through the six steps. Ask students to find the step they most commonly skip in their own projects.',
        'still matters': 'Even with CI/CD, this six-step logic still holds. CI/CD automates the flow; it does not eliminate it.',
        'testing pyramid': 'The pyramid\'s most important insight: unit tests should be most numerous, E2E tests fewest, because of the speed and cost difference.',
        'four testing': 'Ask students: what does your project\'s pyramid look like? Is it an inverted triangle (lots of E2E, few unit tests)?',
        'pyramid + card': 'The pyramid in the tool is interactive — clicking each layer expands a detail card. Ask students to click and read the examples for each layer.',
        'mike cohn': 'Mike Cohn\'s pyramid principle is widely cited, but many teams invert it. Ask why E2E tests shouldn\'t be the backbone of the test suite.',
        'anti-pyramid': 'The ice-cream cone and hourglass are common anti-patterns. Ask students which shape their project is, and discuss how to improve it.',
        'combining': 'Key connection: "Test Design" in the six steps corresponds to the pyramid layer decision — choose the layer first, then design the test cases.',
        'summary': 'The core message: flow makes testing orderly, pyramid makes resource allocation rational. Both are essential.',
        'exercise': 'Exercise 1 (draw your own pyramid) is the most important. Exercise 3 (CI/CD discussion) guides students to think about the limits of automation.',
        'further reading': 'Fowler\'s blog post "TestPyramid" is the best secondary resource for this concept — short and precise.',
    },
    '03-graph-coverage': {
        'graph coverage': 'This lecture is the graph-theoretic foundation of the entire series. Mastering CFG and coverage criteria here makes Data Flow (#4) and Test Generation (#12) flow naturally.',
        'why graph': 'CFG bridges program structure and measurable coverage criteria. Emphasize: not just if/while — any "flow" structure can be turned into a graph.',
        'what is a cfg': 'Node = basic block, Edge = control flow transfer. Whiteboard a simple if-else CFG and have students fill in the nodes collaboratively.',
        'five structural': 'These five criteria form a strict subsumption hierarchy. Prime Path Coverage is the "king" — it subsumes most criteria below it.',
        'subsumption': 'The subsumption diagram is the key tool for understanding criterion strength. Ask: why does Edge Coverage not subsume Prime Path Coverage?',
        'worked example': 'This sample CFG is the standard A&O textbook example. Have students compute NC by hand first, then check against the tool.',
        'node coverage': 'NC requires each node to be visited at least once. Have students find the minimum number of test paths.',
        'edge coverage': 'EC requires each edge to be covered at least once. Usually just one or two more paths than NC.',
        'prime path': 'PPC requires covering all prime paths (longest simple paths). Emphasize this may be fewer than total paths — not every path needs to be covered.',
        'pick a criterion': 'Open the tool live, select Node Coverage, and let it compute the requirement list. Observe how requirement count grows as criterion strength increases.',
        'greedy set cover': 'The tool uses greedy set cover to find the minimum test set. Ask: does the greedy solution guarantee optimality? (No, but it\'s usually very close.)',
        'upload code': 'Let students upload a simple function they wrote and watch the tool auto-generate a CFG. Note: the tool only handles JavaScript function syntax.',
        'live cfg': 'Live edit mode lets students directly modify the dot-format CFG, useful for manually constructing textbook examples.',
        'summary': 'CFG + five criteria are the graph-theoretic backbone of this series. Mastering this makes Data Flow (#4) and Test Generation (#12) follow naturally.',
        'exercise': 'Exercise 1 (compute prime paths by hand) is the most important foundational skill. Exercise 3 (upload your own code) works well as homework.',
        'further reading': 'A&O §3 has the complete CFG theory. The prime path algorithm in the tool is in src/utils/graphCoverage.js.',
    },
    '04-data-flow-coverage': {
        'data flow coverage': 'This lecture extends CFG to "data flow," moving from structure to semantics. Defining def/use pairs is the core skill of this lecture.',
        'from structure to data': 'CFG only tracks "which edges are taken"; DFC also tracks "where variables are assigned and where they are used" — enabling detection of semantic errors.',
        'three core': 'The def-clear path is the most important concept: a def-use pair is valid only if the variable is not redefined between the def and the use.',
        'three data-flow': 'All-Defs < All-Uses < All-DU-Paths in strength. All-Uses is the most commonly adopted criterion in practice.',
        'subsumption': 'Data flow and structural coverage criteria interleave in subsumption. All-Uses subsumes Edge Coverage — important but non-obvious.',
        'triangle problem': 'The Triangle Problem is the standard A&O example. Have students manually find all def/use pairs, then compare with the tool.',
        'how def': 'Assignment statements and function parameters are the most common def points; conditional tests and operands are the most common use points.',
        'dfg view': 'The DFG view expands each CFG node into def points and use points. Let students trace the arrows connecting defs to uses.',
        'all-defs': 'All-Defs only requires each def to reach at least one use. This is the weakest data flow criterion and usually has the fewest requirements.',
        'all-uses': 'All-Uses requires covering every def-use pair. Ask: if a def has 5 uses, how many test paths are needed?',
        'all-du-path': 'All-DU-Paths is the strongest data flow criterion, requiring coverage of every def-clear path for every def-use pair.',
        'empty': 'If a function has no variable assignments (only a return statement), the DFG will be empty. This is a design choice, not a bug.',
        'algorithm': 'def/use extraction uses AST analysis; DU-pair enumeration uses BFS/DFS; def-clear paths use reachability analysis.',
        'summary': 'Data Flow Coverage catches semantic errors missed by structure-only criteria. Mastering def/use pairs is foundational for all subsequent data flow discussions.',
        'exercise': 'Exercise 1 (manually find def/use pairs) is the most critical skill-building exercise. Exercise 3 (compare coverage strengths) works well as a group discussion.',
        'further reading': 'A&O §15 has the complete data flow theory. The tool implementation is in src/utils/dataFlow.js.',
    },
    '05-logic-coverage': {
        'logic coverage': 'This is the most theory-dense lecture in the series. 14 criteria take time to absorb. Suggested split: first session covers basic criteria, second covers DNF/IC/UTP.',
        'from graph': 'Starting from CFG branch conditions: if (a && b) has two clauses. Logic Coverage requires testing at the clause level, not just the branch level.',
        'terminology': 'Clarify the predicate/clause/binding hierarchy: predicate is the whole boolean expression; clause is an atomic (indivisible) sub-condition.',
        'truth table': 'The truth table is the computational foundation of Logic Coverage. The tool\'s truth table is interactive — students can see which rows satisfy each criterion.',
        'predicate grammar': 'The tool accepts JavaScript boolean expressions: &&, ||, !, (), ===, !==, and comparisons.',
        'semantic family': 'The semantic series (PC/CC/CoC/GACC/CACC/RACC/GICC/RICC/IC) focuses on "how clauses determine predicate value."',
        'dnf (syntactic)': 'The DNF series (UTPC/MUTPC/NFPC/MNFPC) focuses on "coverage of DNF implicants" — an algebraic perspective.',
        'subsumption': 'CACC is the most practically adopted criterion: stronger than ACC, weaker than IC, balancing test cost and strength.',
        'worked example': 'This three-clause example can fully illustrate all 14 criteria. The paired row structure in CACC is the basis for the tool\'s color highlighting design.',
        'pc / cc': 'PC requires predicate true and false at least once each; CC requires each clause true and false (regardless of other clauses).',
        'cacc': 'CACC requires: fixing other clauses\' values such that the major clause\'s truth determines the predicate\'s truth — this is what "deterministic" means.',
        'quine': 'Quine-McCluskey is the standard DNF minimization algorithm. The tool uses it to compute implicants for UTPC/MUTPC criteria.',
        'ic, utp': 'IC is the strongest semantic criterion; UTPC is the most basic DNF criterion. Each has advantages in different scenarios.',
        'cutpnfp': 'CUTPNFP = UTPC ∩ NFP — a composite criterion satisfying both clause coverage and DNF implicant coverage simultaneously.',
        'karnaugh': 'K-maps visually represent truth tables, especially useful for showing which minterms are required by each criterion.',
        'k-map cell': 'The tool\'s K-map uses colors to distinguish: cells required by the criterion (requirement rows) vs. cells already covered by tests.',
        'pick an example': 'Select (a && b) || c live, have students follow along switching criteria and observing how the requirement list changes.',
        'truth table': 'Each truth table row has corresponding DNF analysis and clause values. Have students find which row can "determine the predicate solely by changing a."',
        'cacc criterion': 'CACC needs two rows per clause (major clause T and F, other clauses set to make predicate determinable by major clause).',
        'ic + dnf': 'IC usually has the most requirements. The K-map synchronously highlights the minterms required by IC.',
        'cutpnfp k-map': 'CUTPNFP\'s K-map shows the intersection of UTPC and NFP requirements — a useful visual for understanding the composite criterion.',
        'textbook-style dnf': 'The textbook-style DNF rendering uses ¬ and ∧/∨ notation, matching A&O §4–5 exactly. Useful for students working alongside the textbook.',
        'persistence': 'The tool persists the predicate and binding settings across sessions, so students can continue where they left off.',
        'summary': '14 criteria can seem overwhelming at first. Remind students that CACC is the practical standard, and the others exist to understand the theoretical landscape.',
        'exercise': 'Exercise 1 (truth table by hand) is the most foundational. Exercise 4 (CACC with 4 clauses) is the most challenging.',
    },
    '06-program-mutation': {
        'program mutation': 'This lecture shifts perspective: instead of testing the program, we test the test suite itself. Mutation score is an objective metric for test suite quality.',
        'shift in perspective': 'Traditional testing answers "is the program correct?"; mutation testing answers "how strong is my test suite?" — a meta-question.',
        'three steps': 'Three steps: generate mutants → run test suite against each mutant → compute mutation score. Numerator = killed; denominator = all non-equivalent mutants.',
        '"killed"': '"Killed" means the test suite has at least one test that can distinguish the mutant from the original program.',
        '11 procedural': 'AOR (arithmetic operator replacement) and ROR (relational operator replacement) are the most common operators and easiest to compute by hand.',
        '4 object-oriented': 'OO operators target class inheritance and polymorphism, especially important in Java/C++ programs. The current tool implements 11 procedural operators.',
        'aor on max': 'For hand calculation: replace a > b with a + b, a - b, a * b, etc. Ask which mutant is easiest to kill.',
        'ror on max': 'a > b changed to a >= b is the most subtle ROR mutant — it differs only when a == b, so tests need to include this boundary case.',
        'equivalent': 'Equivalent mutants are mutation testing\'s biggest challenge — no test can kill them because they are semantically identical to the original program.',
        'tool: overview': 'Left side: program input and test suite. Right side: mutant list and killed/alive statistics. Suggest students look at the summary numbers first.',
        'execution flow': 'Clicking "Run Mutation" triggers: parse program → generate all mutants → run all tests against each mutant → compute score.',
        'mutant list': 'Each mutant can be expanded to see the diff — which operator applied to which token made what replacement.',
        'per-test': 'The mutant detail page shows which tests killed it and which didn\'t. This helps students understand why one test is stronger than another.',
        'shapehierarchy': 'The shapeHierarchy example shows OO mutation: replacing subclass instances, modifying polymorphic calls, etc. Good for students with OO background.',
        'cloud sync': 'The tool supports cloud sync of test sets, making it easy for students to share the same mutant list for group discussion.',
        'mutate pipeline': 'AST transformation is the core technique for generating mutants. The tool has a corresponding AST visitor for each operator.',
        'pitfalls': 'High coverage ≠ high mutation score. Example: 100% coverage but tests only assert "no crash" → mutation score can be very low.',
        'summary': 'Mutation score is an objective measure of test suite strength. The goal is not 100% (impossible with equivalent mutants) but approaching 80–90%.',
        'exercise': 'Exercise 1 (compute AOR mutants by hand) is the most important foundational skill. Exercise 3 (equivalent mutant judgment) works for advanced students.',
        'further reading': 'A&O §11.2 has complete mutation operator definitions. PIT is the most widely used Java mutation testing tool in industry.',
    },
    '07-grammar-and-string-mutation': {
        'grammar-based testing': 'This lecture treats grammar as the test subject, not the test tool. Grammar defines valid input structure; coverage criteria require generating tests that cover the grammar.',
        'why grammar': 'Any system accepting structured input (parser, compiler, API) can use a grammar to define the input space, then apply coverage criteria to design tests.',
        'two teaching': 'This lecture covers Grammar Coverage (covering BNF productions) and String Mutation (mutating individual strings to find boundaries) — complementary approaches.',
        'bnf': 'BNF\'s ::=, |, *, + syntax is the language of grammar testing. The tool accepts standard BNF format and automatically derives strings.',
        'built-in grammars': 'Three built-in grammars: arithmetic, URL, JSON. Start with arithmetic — observe how the derivation tree expands.',
        'derivation': 'BFS left derivation ensures shortest derivations appear first, allowing the tool to find the minimum test set in reasonable time.',
        'two coverage': 'PDC (Production Coverage): each production used at least once; TSC (Terminal Symbol Coverage): each terminal appears at least once.',
        'tool: overview': 'Input grammar on the left, see derivation list and coverage statistics on the right. Start with the default grammar, then switch to a custom one.',
        'derivations + pdc': 'The tool synchronously highlights which productions are covered (PDC) and which terminals are covered (TSC).',
        'grammar mutation: 4': 'Operators target the grammar itself: substitute, delete, insert non-terminal, modify quantifier. These mutants simulate "grammar errors."',
        'kill criterion': 'A test kills a grammar mutant if it accepts strings from the original grammar but rejects strings from the mutant grammar (or vice versa).',
        'grammar mutants': 'The tool lists all grammar mutants and their kill status. Ask: which operator type produces the hardest-to-kill mutants?',
        'pivot to strings': 'String Mutation is character-level mutation testing — not modifying the grammar, but mutating individual string inputs to find boundary cases.',
        '5 string': 'AOR/LCR/SOR/UOI/COR have character-level counterparts: insert, delete, substitute characters, etc.',
        'positive / negative': 'Positive tests should pass (grammatically correct input); negative tests should fail (deliberately incorrect input). Both must be designed.',
        'string mutation': 'The string mutant list shows positive/negative classification, helping students verify the expected behavior of each mutant.',
        'algorithm peek': 'BFS derivation uses recursive expansion + deduplication. Grammar mutation applies operator substitution to the grammar\'s AST.',
        'from the cloud': 'Cloud loading lets students share custom grammars. Good for group work: each group designs a grammar, then tests each other\'s.',
        'summary': 'Grammar is both the specification of test inputs and can itself be the test subject. PDC/TSC help ensure all "paths" through the grammar are tested.',
        'exercise': 'Exercise 1 (manual derivation) is the most basic skill. Exercise 3 (JSON grammar coverage) works well as an advanced assignment.',
        'further reading': 'A&O §12–13 has the complete grammar-based testing theory.',
    },
    '08-spec-mutation': {
        'specification mutation': 'This lecture is the final stop of the mutation series: shifting the mutation target from source code to specifications (predicates) and state machines (FSMs).',
        'three mutation lectures': 'Lecture #6 mutates programs; #7 mutates grammars; this lecture mutates specifications (predicates) and state machines (FSMs).',
        'what is specification': 'A specification mutant substitutes operators in a predicate. The test suite must distinguish the original specification from each mutant.',
        'the 6 operators': 'AOR/ROR/LCR/MOR/AOD/COD are the six specification mutation operators. LCR (&&↔||) and ROR (>↔>=) are the most common.',
        'basic vs smv': 'Basic operators directly replace operators; SMV (Safety Monitor Violation) operators are designed for safety-monitoring patterns.',
        'smv example table': 'SMV is especially important in formal verification contexts, such as aerospace and automotive safety specifications.',
        '6 operators': 'Have students compute the effect of each operator on this predicate by hand, then compare with the tool\'s mutant list.',
        'kill algorithm': 'Kill condition: the original predicate and the mutant predicate produce different outputs on some input. The test suite must include such an input.',
        'safety monitor': 'FSM (finite state machine) is another form of specification. The tool shows side-by-side comparison of original and mutant FSMs.',
        'memoryless': 'Most FSMs are memoryless (Markov property): the next state depends only on the current state and input, not on history.',
        'diff = killer': 'The difference set (diff) of two FSMs is precisely the test set that kills the FSM mutant. The tool computes and displays this diff directly.',
        'tool: overview': 'Three sections: left for predicate input, middle for mutant list, right for side-by-side FSM view.',
        'mutants and score': 'The tool shows kill status for both predicate and FSM mutants, plus the overall mutation score.',
        'dual fsm': 'The side-by-side view lets students directly see which state transition differs between original and mutant FSM.',
        'smv source': 'The tool shows the SMV-format specification, helping students understand how formal verification tools (like NuSMV) interpret these specs.',
        'persistence': 'The tool saves the most recent predicate and FSM, enabling cross-session continuation of work.',
        'algorithm summary': 'Predicate mutation substitutes AST operators; FSM mutation adds/removes/changes state transition table entries; diff uses BFS.',
        'connections to': 'Specification Mutation connects formal verification (§16) and Logic Coverage (§4–5). This is the most theory-heavy lecture in the series.',
        'summary': 'Specification Mutation tests whether the specification itself is precise enough. A strong test suite should kill all non-equivalent specification mutants.',
        'exercise': 'Exercise 1 (compute LCR mutants by hand) is the most basic. Exercise 3 (FSM diff) suits students with automata theory background.',
        'further reading': 'A&O §14, §16 has the complete specification mutation and FSM theory.',
    },
    '09-fuzz-testing': {
        'fuzz testing': 'From this lecture, the series enters the "automated test generation" trilogy (Fuzz → Symbex → Concolic). Fuzz is the simplest but still highly effective method.',
        'where this fits': 'Fuzz testing\'s key advantage: fully automated, no specification required, can find boundary cases hard to find through manual testing. Drawback: unpredictable coverage.',
        'when to fuzz': 'Best for: systems accepting large volumes of external input (parsers, network protocols, file handlers). Less suitable for: bugs requiring specific semantic inputs.',
        'three steps': 'This tool implements: generate random integer/boolean inputs → execute the target function → record crashes and branch traces.',
        'instrumentation': 'The tool "instruments" each if/while condition before execution, recording taken/not-taken into a branch trace array.',
        'cfg coverage': 'Branch traces correspond to CFG edges. The tool computes node coverage and edge coverage percentages.',
        '6 examples': 'Six examples cover: simple arithmetic, boundary checks, recursion (fibonacci), string handling, loops, and multi-branch logic.',
        'tool: overview': 'Left side: code input and test count. Right side: test case list (pass/crash) and CFG view.',
        'testcases and cfg': 'Click a test case and the CFG highlights the nodes and edges visited in that run. Ask students to find "which branch has never been covered."',
        'crash detection': 'Crash = runtime exception. The tool shows crash rate and error messages to help locate issues.',
        'random-input': 'Phase 1 uses pure random integers/booleans. Phase 2 mutates interesting seeds (crashes + novel branch patterns) using ±1, boundary values, and bitflip.',
        'fundamental limits': 'Pure random fuzz cannot handle "magic numbers" (specific constants needed to trigger certain branches). Concolic execution (#11) solves this.',
        'pitfalls': 'High node coverage ≠ good testing: if assertions only check "no crash," fuzz cannot find logic errors.',
        'algorithm peek': 'Instrumentation uses regex replacement of if/while conditions. Loops have an iteration limit (10,000) to prevent infinite loops.',
        'summary': 'Fuzz is a "volume" strategy. Phase 2 mutation lets the tool explore boundaries missed by pure random testing.',
        'exercise': 'Exercise 1 (observe crash rate) is the most intuitive. Exercise 3 (compare fuzz vs. random) works well as a discussion topic.',
        'further reading': 'AFL and libFuzzer are the most widely used fuzz tools in industry. Interested students can try running AFL on their own programs.',
    },
    '10-symbolic-execution': {
        'symbolic execution': 'Symbolic execution is the most "mathematical" method in this series: treating program inputs as symbols and using constraint solvers to find concrete inputs for every path.',
        'from fuzz': 'Fuzz is "blind trial"; symbex is "systematic analysis." Symbex guarantees finding inputs for every reachable path (if solvable).',
        'three things': 'Execution state = environment (symbolic variable values) + path condition (constraints to reach this point) + branch trace (which branches taken).',
        'fork': 'At each conditional branch, symbex "forks" into two execution states (true and false paths). This is the root of path explosion.',
        'bounded brute': 'The tool uses bounded brute-force search ([-10, 10] integer grid) to find concrete values satisfying the path condition. Real symbex systems use SMT solvers (e.g., Z3).',
        'infeasible': 'If a path\'s constraints are unsatisfiable (infeasible), no test case can reach that path — this itself is important test information.',
        '4 examples': 'Four examples cover: simple conditionals, multi-branch, nested conditions, and paths with equality constraints.',
        'tool: overview': 'Left side: code input. Right side: path list (each path shows path condition, witness, infeasibility flag).',
        'path list': 'Each path entry shows: path condition (formula), concrete witness (x=1, y=-3), execution result. Click a path to highlight the CFG.',
        'path highlight': 'Clicking a path entry highlights the corresponding node and edge sequence in purple. Have students confirm the path condition matches the CFG path.',
        'path explosion': 'Exponential path count is symbex\'s biggest challenge. The tool uses a depth limit (max paths) to avoid explosion.',
        'algorithm peek': 'The tool uses recursive DFS to unfold the AST, cloning execution state at each conditional branch, accumulating the path condition, then solving.',
        'real symbex': 'Real systems (KLEE, Angr, S2E) use Z3/Boolector SMT solvers and can handle integers, characters, pointers, and complex constraints.',
        'summary': 'Symbex systematically covers all reachable paths but is limited by path explosion. Concolic (#11) is a hybrid strategy combining concrete execution with symbolic analysis.',
        'exercise': 'Exercise 1 (manually trace path conditions) is the most important. Exercise 3 (infeasible paths) suits students with linear algebra background.',
        'further reading': 'KLEE is the most famous symbex tool. EXE is KLEE\'s predecessor. A&O §13 has a detailed introduction.',
    },
    '11-concolic-execution': {
        'concolic execution': 'Concolic = concrete + symbolic. Core idea: execute with concrete values, simultaneously track symbolic path conditions, then negate conditions to find new paths.',
        'three-way': 'Fuzz is fastest but blind; symbex is systematic but slow; concolic compromises: start with concrete execution, use symbex to guide the next input.',
        'the name': 'Concolic = concurrent symbolic + concrete. DART (2005) was the first paper to coin this term — worth mentioning historically.',
        'four core steps': 'Each iteration: execute → collect path condition → negate the last unexplored branch → solve for new input. These four steps are the algorithm\'s heart.',
        'flip': '"Negate" means: take the negation of the last path condition constraint, then solve. This guarantees a different branch is taken in the next execution.',
        'key differences': 'Symbex tracks all paths simultaneously (exponential space); concolic takes one path at a time (linear space), progressively exploring.',
        '4 examples': 'The four examples match symbex, making it easy for students to compare how the two methods find witnesses differently.',
        'overview + settings': 'The "Seed Input" lets students control the starting point; "Max Iterations" controls exploration depth. Start with a small iteration count to observe behavior.',
        'iteration list': 'Each iteration entry shows: concrete input, path condition, execution result, which branch was negated.',
        'cfg sync': 'Clicking an iteration entry synchronizes the CFG to highlight that iteration\'s path, letting students trace the exploration progress.',
        'algorithm peek': 'The tool maintains both concrete values and symbolic expressions in an AST interpreter simultaneously, recording both at branch points.',
        'convergence': 'Concolic does not guarantee finding all paths (limited by iteration count) but can explore many paths in a bounded number of steps — more systematic than pure fuzz.',
        'real-world': 'Real systems (SAGE, DrChecker) use Z3 for constraint solving and can handle characters, memory addresses, and complex types. This tool uses integer brute-force for simplicity.',
        'summary': 'Concolic is the best compromise between fuzz + symbex: starting from concrete execution, using symbolic analysis to guide the next step, avoiding path explosion.',
        'exercise': 'Exercise 1 (trace iterations) is the most core understanding exercise. Exercise 3 (compare with fuzz) works well as a final discussion.',
        'further reading': 'The DART paper (Godefroid et al., 2005) is the founding work on concolic execution. SAGE is Microsoft\'s concolic tool for Windows fuzzing.',
    },
    '12-test-generation': {
        'test generation': 'This lecture connects all previous criteria: using coverage criteria to generate the "minimum test set" covering "all requirements." The culminating application of the series.',
        'where this lecture fits': 'Previous lectures "define criteria"; this lecture "automatically generates test sets satisfying criteria." The last mile from theory to engineering practice.',
        'problem definition': 'Problem: given a function and a coverage criterion, find the minimum set of test cases such that all criterion-required requirements are covered.',
        'computation pipeline': 'Pipeline: source code → CFG → coverage requirements → Greedy Set Cover → minimum test set → execution verification.',
        'key modules': 'Four modules work together: pathFinder, TestPathSelector (greedy), TestCaseBuilder (concretize), Runner (verify). Each has a clear role.',
        'greedy set cover': 'Greedy Set Cover is an approximation for an NP-hard problem: each step picks the path covering the most uncovered requirements. Approximation ratio ln(n).',
        '8 coverage': 'The tool supports NC/EC/ECC/PPC/ADUP/ADU/ADef + CACC. Have students switch criteria and observe how test set size changes.',
        'tool: overview': 'Left: code input. Right: three sections — requirements list, selected tests list, CFG view.',
        'requirements card': 'The requirements card lists all coverage requirements (node/edge/path/clause). Click a requirement to highlight the CFG and show which test covers it.',
        'minimal tests': 'The minimal tests card lists the Greedy Set Cover–selected minimum test set. Each test shows which requirements it covers.',
        'cfg interaction': 'Clicking a requirement or test synchronizes the CFG to highlight related nodes/edges/paths, helping students build visual connections.',
        'abs(x)': 'abs(x) is the simplest demo: only two edges, needing two tests (x>0 and x<=0).',
        'triangle': 'Triangle has multiple prime paths, requiring a significantly larger test set than edge coverage. This illustrates the impact of criterion strength.',
        'infeasible': 'Some requirements correspond to paths that are semantically unreachable (infeasible). The tool marks these in red and skips them.',
        'comparison with': 'Symbex/Concolic use constraint solving to find inputs; this tool uses brute-force integer grid search. The former is more powerful; the latter is more intuitive.',
        'implementation highlight': 'The tool\'s core challenge: translating a coverage requirement (abstract path) into concrete input values (integer combinations).',
        'summary': 'This lecture turns "defining criteria" into "automated generation." Coverage criteria are not just evaluation metrics but also specifications for generating tests.',
        'exercise': 'Exercise 1 (observe test set sizes for different criteria) is the most intuitive. Exercise 3 (modify code and observe CFG changes) works as an interactive demo.',
        'further reading': 'A&O §8 has the complete Test Path theory. The Set Cover implementation is in src/utils/setCover.js.',
    },
    '13-logic-binding': {
        'logic coverage binding': 'This lecture solves the "last mile" problem of Logic Coverage: mapping abstract clauses (a, b, c) to concrete program expressions so tests can actually be executed.',
        'last mile': 'Students can compute CACC requirement tables but don\'t know how to generate concrete inputs satisfying "a=T, b=F." Binding bridges this gap.',
        'three layers of mapping': 'Three layers: criterion (CACC) → clause truth value combination (a=T, b=F) → concrete witness (x=1, y=10). Binding handles the second-to-third layer conversion.',
        'binding ui': 'The tool\'s Binding panel sits immediately below the logic coverage tool. After selecting a criterion, each requirement row shows a corresponding witness.',
        'sub-panel elements': 'Each clause (a, b, c) has an input box where students enter a JavaScript expression (e.g., x > 0).',
        'four-column': 'Four columns: row number (which requirement), clause truth values (a=T, b=F, c=T), constraint formula ((x > 0) && !(y < 10)), witness (x=1, y=10).',
        'solving algorithm': 'The tool first tries an analytic solver (interval arithmetic); if that fails, it uses brute-force search over the [-10, 10] integer Cartesian product.',
        'smallest absolute': 'Searching from 0 upward in |x| order ensures the witness closest to 0 is found, making it easiest for students to verify by hand.',
        'abs(x)': 'abs(x)\'s predicate is x >= 0, with one clause. Binding is straightforward: a=T → x=0, a=F → x=-1.',
        'max(a, b)': 'max(a, b)\'s predicate is a >= b, one clause. CACC needs two witnesses: a=T and a=F.',
        'triangle': 'Triangle has multiple clauses; CACC has more requirements. Have students verify each witness actually satisfies the corresponding clause truth values.',
        'auto-fill': 'Auto-fill reads the selected example\'s defaultBindings and fills all clause expressions with one click. Use auto-fill to quickly see results, then manually modify to learn.',
        'binding tool in action': 'Live demo: select triangle → select CACC → click auto-fill. Have students match each witness table row to the corresponding textbook requirement.',
        'search range': 'Default search range is [-10, 10]. For expressions involving large numbers (e.g., x > 50), the analytic solver handles this case exactly without range limits.',
        'limitations': 'Limitation: the brute-force fallback can only find integer witnesses within the search range. The analytic interval solver handles simple linear constraints like x > 50 exactly.',
        'summary': 'Binding turns Logic Coverage from "paper exercise" into "verifiable test inputs." Mastering this three-layer mapping is what it means to truly understand the engineering application of Logic Coverage.',
        'exercise': 'Exercise 1 (manually fill bindings and verify witnesses) is the most important. Exercise 3 (expand search range) helps understand solver limitations.',
        'further reading': 'A&O §4–5 has the complete Logic Coverage theory. The binding solver implementation is in src/utils/logicBinding.js.',
    },
}


def inject_notes(filepath, notes_dict):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    slides = content.split('\n---\n')
    result = []

    for i, slide in enumerate(slides):
        heading_match = None
        for line in slide.split('\n'):
            if line.startswith('#'):
                heading_match = line.lstrip('#').strip()
                break

        note = None
        if heading_match and i > 0:  # skip frontmatter
            heading_lower = heading_match.lower()
            for key, val in notes_dict.items():
                if key.lower() in heading_lower:
                    note = val
                    break

        slide_stripped = slide.rstrip()
        if note:
            result.append(f"{slide_stripped}\n\n<!-- {note} -->")
        else:
            result.append(slide_stripped)

    new_content = '\n---\n'.join(result) + '\n'
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    return len([s for s in slides if s.strip()])


for stem, notes in EN.items():
    filepath = os.path.join(BASE, f"{stem}.en.md")
    if os.path.exists(filepath):
        count = inject_notes(filepath, notes)
        # Verify
        with open(filepath, 'r') as f:
            injected = f.read().count('<!--')
        print(f"Processed {stem}.en.md — {injected} notes in {count} slides")
    else:
        print(f"MISSING: {filepath}")
