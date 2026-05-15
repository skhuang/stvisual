import { describe, expect, it } from 'vitest';
import {
  createChaosEngineeringExplorer,
  TOPOLOGIES,
  applyFault,
  FAULT_KINDS,
} from '../components/ChaosEngineeringExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createChaosEngineeringExplorer();
  document.body.appendChild(el);
  return el;
}

describe('Fault propagation math', () => {
  it('no fault leaves every node healthy', () => {
    const r = applyFault(TOPOLOGIES[0], null);
    for (const s of r.status.values()) {
      expect(s.pass).toBe(1.0);
    }
    expect(r.blastRadius.size).toBe(0);
    expect(r.hypothesisHolds).toBe(true);
  });

  it('kill on a leaf affects only its dependents (transitively)', () => {
    // inventory is a leaf — orders depends on it, gateway depends on orders, web on gateway.
    const r = applyFault(TOPOLOGIES[0], { nodeId: 'inventory', kind: 'kill', severity: 1 });
    expect(r.status.get('inventory').pass).toBe(0);
    // Cache is parallel to inventory; it should NOT be affected.
    expect(r.status.get('cache').pass).toBe(1.0);
    // The blast radius should include the dependency chain back to web.
    expect(r.blastRadius.has('inventory')).toBe(true);
    expect(r.blastRadius.has('orders')).toBe(true);
    expect(r.blastRadius.has('gateway')).toBe(true);
    expect(r.blastRadius.has('web')).toBe(true);
  });

  it('drop fault sets pass = 1 − severity locally', () => {
    const r = applyFault(TOPOLOGIES[0], { nodeId: 'payments', kind: 'drop', severity: 0.30 });
    expect(r.status.get('payments').pass).toBeCloseTo(0.7, 5);
  });

  it('latency fault keeps pass at 1.0 but pushes latencyMs above baseline', () => {
    const r = applyFault(TOPOLOGIES[0], { nodeId: 'payments', kind: 'latency', severity: 500 });
    expect(r.status.get('payments').pass).toBe(1.0);
    expect(r.status.get('payments').latencyMs).toBeGreaterThan(500);
  });

  it('hypothesisHolds flips to false once the journey success drops below threshold', () => {
    const noFault = applyFault(TOPOLOGIES[0], null);
    expect(noFault.hypothesisHolds).toBe(true);
    const broken = applyFault(TOPOLOGIES[0], { nodeId: 'gateway', kind: 'kill', severity: 1 });
    expect(broken.hypothesisHolds).toBe(false);
  });

  it('blast radius is bounded by the size of the topology', () => {
    for (const topo of TOPOLOGIES) {
      const r = applyFault(topo, { nodeId: topo.nodes[topo.nodes.length - 1].id, kind: 'kill', severity: 1 });
      expect(r.blastRadius.size).toBeLessThanOrEqual(topo.nodes.length);
    }
  });

  it('FAULT_KINDS exposes exactly the three categories', () => {
    expect(FAULT_KINDS).toEqual(['latency', 'drop', 'kill']);
  });
});

describe('ChaosEngineeringExplorer smoke', () => {
  it('renders wrap, topology chips, graph, hypothesis, fault menu', () => {
    mount();
    expect(document.querySelector('[data-testid="chx-wrap"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="chx-topos"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="chx-graph"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="chx-hypo"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="chx-fault"]')).toBeInTheDocument();
  });

  it('with no fault: hypothesis green, blast radius 0', () => {
    mount();
    expect(document.querySelector('[data-testid="chx-hypo"]').classList.contains('chx-hypo--pass')).toBe(true);
    expect(document.querySelector('[data-testid="chx-met-blast"]').textContent.trim()).toBe('0');
  });

  it('injecting kill on gateway flips hypothesis red and grows blast radius', () => {
    mount();
    const nodeSelect = document.querySelector('[data-testid="chx-fault-node"]');
    const kindSelect = document.querySelector('[data-testid="chx-fault-kind"]');
    nodeSelect.value = 'gateway';
    nodeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    kindSelect.value = 'kill';
    kindSelect.dispatchEvent(new Event('change', { bubbles: true }));
    document.querySelector('[data-testid="chx-fault-inject"]').click();
    expect(document.querySelector('[data-testid="chx-hypo"]').classList.contains('chx-hypo--fail')).toBe(true);
    expect(Number(document.querySelector('[data-testid="chx-met-blast"]').textContent.trim())).toBeGreaterThan(0);
  });

  it('Clear button returns the system to the no-fault state', () => {
    mount();
    const nodeSelect = document.querySelector('[data-testid="chx-fault-node"]');
    nodeSelect.value = 'payments';
    nodeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    document.querySelector('[data-testid="chx-fault-inject"]').click();
    document.querySelector('[data-testid="chx-fault-clear"]').click();
    expect(document.querySelector('[data-testid="chx-hypo"]').classList.contains('chx-hypo--pass')).toBe(true);
  });

  it('quiz: pick C (record + expand), submit → correct', () => {
    mount();
    document.querySelector('[data-testid="chx-quiz-start"]').click();
    document.querySelector('input[name="chx-quiz"][value="c"]').click();
    document.querySelector('[data-testid="chx-quiz-submit"]').click();
    expect(document.querySelector('[data-testid="chx-quiz-result"]').classList.contains('quiz-correct')).toBe(true);
  });

  it('lab reflect activates', () => {
    mount();
    document.querySelector('[data-testid="chx-lab-start"]').click();
    expect(document.querySelector('[data-testid="chx-lab-text"]')).toBeInTheDocument();
  });
});
