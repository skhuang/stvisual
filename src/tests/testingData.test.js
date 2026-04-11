import { describe, it, expect } from 'vitest';
import {
  testingMethods,
  testingFlow,
  testingTypes,
  graphCoverageCriteria,
  graphCoverageGraph,
} from '../data/testingData';

describe('testingMethods', () => {
  it('包含三種測試方法', () => {
    expect(testingMethods).toHaveLength(3);
  });

  it('包含黑盒、白盒、灰盒測試', () => {
    const ids = testingMethods.map((m) => m.id);
    expect(ids).toContain('blackbox');
    expect(ids).toContain('whitebox');
    expect(ids).toContain('graybox');
  });

  it('每個方法都有必要欄位', () => {
    testingMethods.forEach((m) => {
      expect(m).toHaveProperty('id');
      expect(m).toHaveProperty('name');
      expect(m).toHaveProperty('nameEn');
      expect(m).toHaveProperty('description');
      expect(m).toHaveProperty('visibility');
      expect(m).toHaveProperty('colorScheme');
      expect(m).toHaveProperty('techniques');
    });
  });

  it('黑盒測試有 4 項技術', () => {
    const blackbox = testingMethods.find((m) => m.id === 'blackbox');
    expect(blackbox.techniques).toHaveLength(4);
  });

  it('白盒測試有 7 項技術', () => {
    const whitebox = testingMethods.find((m) => m.id === 'whitebox');
    expect(whitebox.techniques).toHaveLength(7);
  });

  it('灰盒測試有 2 項技術', () => {
    const graybox = testingMethods.find((m) => m.id === 'graybox');
    expect(graybox.techniques).toHaveLength(2);
  });

  it('黑盒測試代碼可見度為 0%', () => {
    const blackbox = testingMethods.find((m) => m.id === 'blackbox');
    expect(blackbox.visibility).toBe(0);
  });

  it('白盒測試代碼可見度為 100%', () => {
    const whitebox = testingMethods.find((m) => m.id === 'whitebox');
    expect(whitebox.visibility).toBe(100);
  });

  it('灰盒測試代碼可見度為 50%', () => {
    const graybox = testingMethods.find((m) => m.id === 'graybox');
    expect(graybox.visibility).toBe(50);
  });

  it('每個技術都有 id、name、nameEn、description', () => {
    testingMethods.forEach((m) => {
      m.techniques.forEach((t) => {
        expect(t).toHaveProperty('id');
        expect(t).toHaveProperty('name');
        expect(t).toHaveProperty('nameEn');
        expect(t).toHaveProperty('description');
      });
    });
  });

  it('白盒測試包含 Prime Path Coverage', () => {
    const whitebox = testingMethods.find((m) => m.id === 'whitebox');
    const hasPPC = whitebox.techniques.some((t) => t.id === 'ppc');
    expect(hasPPC).toBe(true);
  });

  it('白盒測試包含 Graph Coverage', () => {
    const whitebox = testingMethods.find((m) => m.id === 'whitebox');
    const hasGC = whitebox.techniques.some((t) => t.id === 'gc');
    expect(hasGC).toBe(true);
  });
});

describe('testingFlow', () => {
  it('流程共有 6 個步驟', () => {
    expect(testingFlow).toHaveLength(6);
  });

  it('每個步驟都有必要欄位', () => {
    testingFlow.forEach((step) => {
      expect(step).toHaveProperty('id');
      expect(step).toHaveProperty('label');
      expect(step).toHaveProperty('labelEn');
      expect(step).toHaveProperty('icon');
      expect(step).toHaveProperty('description');
    });
  });

  it('流程第一步為需求分析', () => {
    expect(testingFlow[0].id).toBe('req');
    expect(testingFlow[0].label).toBe('需求分析');
  });

  it('流程最後一步為缺陷報告', () => {
    expect(testingFlow[testingFlow.length - 1].id).toBe('report');
    expect(testingFlow[testingFlow.length - 1].label).toBe('缺陷報告');
  });

  it('流程步驟順序正確', () => {
    const ids = testingFlow.map((s) => s.id);
    expect(ids).toEqual(['req', 'plan', 'design', 'exec', 'analysis', 'report']);
  });
});

describe('testingTypes', () => {
  it('包含四種測試類型', () => {
    expect(testingTypes).toHaveLength(4);
  });

  it('每種類型都有必要欄位', () => {
    testingTypes.forEach((t) => {
      expect(t).toHaveProperty('id');
      expect(t).toHaveProperty('type');
      expect(t).toHaveProperty('typeEn');
      expect(t).toHaveProperty('purpose');
      expect(t).toHaveProperty('timing');
      expect(t).toHaveProperty('color');
    });
  });

  it('包含單元測試、集成測試、系統測試、驗收測試', () => {
    const ids = testingTypes.map((t) => t.id);
    expect(ids).toContain('unit');
    expect(ids).toContain('integration');
    expect(ids).toContain('system');
    expect(ids).toContain('acceptance');
  });

  it('單元測試時機為開發階段', () => {
    const unit = testingTypes.find((t) => t.id === 'unit');
    expect(unit.timing).toBe('開發階段');
  });

  it('每個 color 欄位為有效的 hex 顏色', () => {
    const hexRe = /^#[0-9a-fA-F]{6}$/;
    testingTypes.forEach((t) => {
      expect(t.color).toMatch(hexRe);
    });
  });
});

describe('graphCoverage data', () => {
  it('包含三種 coverage criteria', () => {
    expect(graphCoverageCriteria).toHaveLength(3);
    expect(graphCoverageCriteria.map((item) => item.id)).toEqual(['node', 'edge', 'prime-path']);
  });

  it('graph 包含 8 個節點與 10 條邊', () => {
    expect(graphCoverageGraph.nodes).toHaveLength(8);
    expect(graphCoverageGraph.edges).toHaveLength(10);
  });

  it('graph 有 start 與 end 節點', () => {
    expect(graphCoverageGraph.startNodeId).toBe('S');
    expect(graphCoverageGraph.endNodeId).toBe('T');
  });

  it('graph 包含迴圈 E -> B', () => {
    const edgeIds = graphCoverageGraph.edges.map((edge) => edge.id);
    expect(edgeIds).toContain('E-B');
  });
});
