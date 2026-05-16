// Minimal, dependency-free renderer for the Marp-markdown subset the
// docs/slides decks use. Not a general markdown engine.

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Inline formatting. Escapes first, then applies image/link/code/bold/italic.
function renderInline(text) {
  let h = escapeHtml(text);
  h = h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => `<img alt="${alt}" src="${src}">`);
  h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
    (_, t, u) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`);
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  return h;
}

function splitRow(line) {
  return line.replace(/^\s*\|?/, '').replace(/\|?\s*$/, '').split('|').map((c) => c.trim());
}

function isBlockStart(line) {
  return /^(#{1,6}\s|>|\s*([-*+]|\d+\.)\s|```)/.test(line) || line.includes('|');
}

export function renderMarkdown(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (line.trim().startsWith('```')) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) { code.push(lines[i]); i++; }
      i++;
      out.push(`<pre class="slide-code"><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      out.push(`<h${heading[1].length}>${renderInline(heading[2])}</h${heading[1].length}>`);
      i++;
      continue;
    }

    if (/^(\*\*\*|---|___)\s*$/.test(line)) { out.push('<hr>'); i++; continue; }

    if (line.startsWith('>')) {
      const bq = [];
      while (i < lines.length && lines[i].startsWith('>')) { bq.push(lines[i].replace(/^>\s?/, '')); i++; }
      out.push(`<blockquote>${renderInline(bq.join(' '))}</blockquote>`);
      continue;
    }

    if (line.includes('|') && i + 1 < lines.length
        && /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(lines[i + 1])) {
      const header = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      const thead = `<tr>${header.map((c) => `<th>${renderInline(c)}</th>`).join('')}</tr>`;
      const tbody = rows.map((r) => `<tr>${r.map((c) => `<td>${renderInline(c)}</td>`).join('')}</tr>`).join('');
      out.push(`<table class="slide-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table>`);
      continue;
    }

    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*+]|\d+\.)\s+/, ''));
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map((it) => `<li>${renderInline(it)}</li>`).join('')}</${tag}>`);
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    if (para.length) out.push(`<p>${renderInline(para.join(' '))}</p>`);
    else { i++; }
  }
  return out.join('');
}

// Parse a whole Marp deck: strip front-matter, split slides on `---`,
// peel out <!-- speaker notes --> per slide.
export function parseDeck(raw) {
  let body = raw;
  if (body.startsWith('---')) {
    const close = body.indexOf('\n---', 3);
    if (close !== -1) {
      const nl = body.indexOf('\n', close + 1);
      body = nl !== -1 ? body.slice(nl + 1) : '';
    }
  }
  const slides = body.split(/\n---\n/).map((chunk) => {
    const notes = [];
    const content = chunk.replace(/<!--([\s\S]*?)-->/g, (_, n) => { notes.push(n.trim()); return ''; });
    return { html: renderMarkdown(content.trim()), notes: notes.filter(Boolean).join('\n\n') };
  }).filter((s) => s.html.trim());
  return { slides };
}
