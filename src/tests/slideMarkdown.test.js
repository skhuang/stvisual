import { describe, expect, it } from 'vitest';
import { parseDeck, renderMarkdown } from '../utils/slideMarkdown.js';

describe('renderMarkdown', () => {
  it('renders headings, escaping HTML', () => {
    expect(renderMarkdown('## A <b> title')).toBe('<h2>A &lt;b&gt; title</h2>');
  });
  it('renders bold, italic and inline code', () => {
    expect(renderMarkdown('a **b** *c* `d`')).toBe('<p>a <strong>b</strong> <em>c</em> <code>d</code></p>');
  });
  it('renders an unordered list', () => {
    expect(renderMarkdown('- one\n- two')).toBe('<ul><li>one</li><li>two</li></ul>');
  });
  it('renders a fenced code block without interpreting markdown inside', () => {
    expect(renderMarkdown('```\n**x**\n```')).toBe('<pre class="slide-code"><code>**x**</code></pre>');
  });
  it('renders a GFM table', () => {
    const html = renderMarkdown('| A | B |\n| --- | --- |\n| 1 | 2 |');
    expect(html).toContain('<table');
    expect(html).toContain('<th>A</th>');
    expect(html).toContain('<td>1</td>');
  });
  it('renders an image', () => {
    expect(renderMarkdown('![alt](./slide-assets/x.png)'))
      .toBe('<p><img alt="alt" src="./slide-assets/x.png"></p>');
  });
});

describe('parseDeck', () => {
  const raw = [
    '---', 'marp: true', 'title: Demo', '---',
    '# Slide one', '<!-- note one -->',
    '---', '## Slide two', 'body',
  ].join('\n');

  it('strips front-matter and splits on slide separators', () => {
    const { slides } = parseDeck(raw);
    expect(slides).toHaveLength(2);
    expect(slides[0].html).toContain('<h1>Slide one</h1>');
    expect(slides[1].html).toContain('<h2>Slide two</h2>');
  });
  it('separates speaker notes from slide content', () => {
    const { slides } = parseDeck(raw);
    expect(slides[0].notes).toBe('note one');
    expect(slides[0].html).not.toContain('note one');
  });
});
