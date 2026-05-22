const SECTION_CATEGORY = {
  methods: 'foundations',
  flow: 'foundations',
  types: 'foundations',
  codecov: 'foundations',
  blackbox: 'input-space',
  pbt: 'input-space',
  graph: 'graph-model',
  mbt: 'graph-model',
  slicing: 'graph-model',
  logic: 'logic',
  groupth: 'logic',
  syntax: 'syntax',
  symbex: 'generation',
  concolic: 'generation',
  fuzz: 'generation',
  testgen: 'generation',
  exploit: 'generation',
  sbst: 'generation',
  tdd: 'process',
  acceptance: 'process',
  agile: 'process',
  inttest: 'process',
  advanced: 'strategy',
  rbt: 'strategy',
};

export async function openSectionFromNav(page, sectionId) {
  if (sectionId === 'all') {
    await page.getByTestId('nav-btn-all').click();
    return;
  }
  const categoryId = SECTION_CATEGORY[sectionId];
  if (!categoryId) throw new Error(`No nav category mapped for section: ${sectionId}`);
  await page.getByTestId(`nav-category-${categoryId}`).hover();
  await page.getByTestId(`nav-btn-${sectionId}`).click();
}
