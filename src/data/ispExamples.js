// Authored Input Domain Models for the ISP Explorer. Following the
// PairwiseExplorer precedent, characteristic names and block labels are
// plain strings (uniform with user-edited content); only `nameKey` — the
// example chip's display name — is an i18n key.

export const ISP_EXAMPLES = [
  {
    id: 'find-element',
    nameKey: 'isp.example.findElement',
    characteristics: [
      { name: 'list length',  blocks: ['0', '1', '≥2'],             baseIndex: 1 },
      { name: 'target found', blocks: ['absent', 'once', 'many'],   baseIndex: 1 },
      { name: 'position',     blocks: ['first', 'middle', 'last'],  baseIndex: 0 },
    ],
  },
  {
    id: 'password',
    nameKey: 'isp.example.password',
    characteristics: [
      { name: 'length',  blocks: ['<8', '8–16', '>16'], baseIndex: 1 },
      { name: 'digit',   blocks: ['yes', 'no'],          baseIndex: 0 },
      { name: 'symbol',  blocks: ['yes', 'no'],          baseIndex: 0 },
    ],
  },
  {
    id: 'date',
    nameKey: 'isp.example.date',
    characteristics: [
      { name: 'month',     blocks: ['31-day', '30-day', 'Feb'],     baseIndex: 0 },
      { name: 'day',       blocks: ['1–28', '29', '30', '31'],      baseIndex: 0 },
      { name: 'leap year', blocks: ['yes', 'no'],                   baseIndex: 1 },
    ],
  },
];
