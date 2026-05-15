// Regression for the §F-B class-results pipeline: every I-series and
// J-series Explorer's quiz `done` state must render a button carrying
// `data-share-payload`. The CloudStoragePanel's document-level listener
// uses that attribute to auto-upload to Firestore when a class code is
// set, so a missing button is a silent black-hole.

import { describe, expect, it } from 'vitest';
import { createEquivalentMutantExplorer } from '../components/EquivalentMutantExplorer.js';
import { createMutationScoreExplorer } from '../components/MutationScoreExplorer.js';
import { createLLMPipelineExplorer } from '../components/LLMPipelineExplorer.js';
import { createTestQualityExplorer } from '../components/TestQualityExplorer.js';
import { createFaultDirectedTestingExplorer } from '../components/FaultDirectedTestingExplorer.js';
import { createBDDGherkinExplorer } from '../components/BDDGherkinExplorer.js';
import { createUseCaseDerivationExplorer } from '../components/UseCaseDerivationExplorer.js';
import { createE2EUserJourneyExplorer } from '../components/E2EUserJourneyExplorer.js';
import { createContractTestingExplorer } from '../components/ContractTestingExplorer.js';
import { createPerformanceLoadProfileExplorer } from '../components/PerformanceLoadProfileExplorer.js';
import { createChaosEngineeringExplorer } from '../components/ChaosEngineeringExplorer.js';
import { createATDDCycleExplorer } from '../components/ATDDCycleExplorer.js';
import { createFlakyDiagnosisExplorer } from '../components/FlakyDiagnosisExplorer.js';

// Each row: factory, testid prefix, optional setup before the quiz, the
// value to pick for the radio (or 'numeric' marker), and the resulting
// share button testid.
const ROWS = [
  // ── I-series ─────────────────────────────────────────────────────
  { name: 'I1 EquivalentMutant',  create: createEquivalentMutantExplorer,    prefix: 'emx',  pick: 'b' },
  { name: 'I2 MutationScore',     create: createMutationScoreExplorer,       prefix: 'msx',  pick: 'numeric' },
  { name: 'I3 LLMPipeline',       create: createLLMPipelineExplorer,         prefix: 'llmp', pick: 'c' },
  { name: 'I4 TestQuality',       create: createTestQualityExplorer,         prefix: 'tqx',  pick: 'b' },
  { name: 'I5 FaultDirected',     create: createFaultDirectedTestingExplorer,prefix: 'fdx',  pick: 'a' },
  // ── J-series ─────────────────────────────────────────────────────
  { name: 'J1 BDDGherkin',        create: createBDDGherkinExplorer,          prefix: 'bdd',  pick: 'b' },
  { name: 'J2 UseCase',           create: createUseCaseDerivationExplorer,   prefix: 'uc',   pick: 'c' },
  { name: 'J3 E2EJourney',        create: createE2EUserJourneyExplorer,      prefix: 'e2e',  pick: 'animation' },
  { name: 'J4 Contract',          create: createContractTestingExplorer,     prefix: 'ct',   pick: 'b' },
  { name: 'J5 PerfLoad',          create: createPerformanceLoadProfileExplorer, prefix: 'plp', pick: 'b' },
  { name: 'J6 Chaos',             create: createChaosEngineeringExplorer,    prefix: 'chx',  pick: 'c' },
  { name: 'J7 ATDD',              create: createATDDCycleExplorer,           prefix: 'atdd', pick: 'c' },
  { name: 'J8 FlakyDiagnosis',    create: createFlakyDiagnosisExplorer,      prefix: 'flx',  pick: 'b' },
];

function mount(create) {
  document.body.innerHTML = '';
  const el = create();
  document.body.appendChild(el);
  return el;
}

describe('I/J series — every quiz `done` state renders a share button', () => {
  for (const row of ROWS) {
    it(`${row.name}: share button present after submitting correct answer`, () => {
      mount(row.create);
      document.querySelector(`[data-testid="${row.prefix}-quiz-start"]`).click();

      if (row.pick === 'numeric') {
        // I2 uses a number input. The correct value depends on the
        // current mutation-score; for the default state (no tests added)
        // the score is 0, so submitting "0" is the only deterministic
        // way to hit the correct branch.
        const inp = document.querySelector(`[data-testid="${row.prefix}-quiz-input"]`);
        inp.value = '0';
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        const radio = document.querySelector(`input[name="${row.prefix}-quiz"][value="${row.pick}"]`);
        radio.click();
      }

      document.querySelector(`[data-testid="${row.prefix}-quiz-submit"]`).click();

      const share = document.querySelector(`[data-testid="${row.prefix}-quiz-share"]`);
      expect(share, `${row.name} should expose a share button`).toBeInTheDocument();
      expect(share.getAttribute('data-share-payload'), `${row.name} share payload non-empty`).toBeTruthy();
    });
  }
});
