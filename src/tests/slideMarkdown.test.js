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
  it('renders a $$ block as a math block', () => {
    const html = renderMarkdown('$$\n\\frac{a}{b}\n$$');
    expect(html).toBe(
      '<div class="slide-math-block"><span class="tex-frac">'
      + '<span class="tex-frac-num">a</span>'
      + '<span class="tex-frac-den">b</span></span></div>',
    );
  });
  it('renders inline $…$ math with a superscript', () => {
    expect(renderMarkdown('all $2^n$ rows'))
      .toBe('<p>all <span class="slide-math">2<sup>n</sup></span> rows</p>');
  });
  it('converts LaTeX symbol commands inside math', () => {
    expect(renderMarkdown('$a \\le b$'))
      .toBe('<p><span class="slide-math">a ≤ b</span></p>');
  });
  it('treats an escaped \\$ as a literal dollar sign', () => {
    expect(renderMarkdown('costs \\$50 today')).toBe('<p>costs $50 today</p>');
  });
  it('leaves prose prices ($50 to $99) unmathed', () => {
    expect(renderMarkdown('$50 to $99 range')).toBe('<p>$50 to $99 range</p>');
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
