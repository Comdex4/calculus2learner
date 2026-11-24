/* Light markdown + KaTeX math rendering. */
(function () {
  'use strict';
  const CL = (window.CL = window.CL || {});

  function tex(src, display = false) {
    if (window.katex) {
      try {
        return window.katex.renderToString(src, { displayMode: display, throwOnError: false, strict: 'ignore', trust: false });
      } catch (e) { /* fall through */ }
    }
    return '<code class="tex-fallback">' + CL.U.esc(src) + '</code>';
  }

  const ALLOWED = /&lt;(\/?)(b|i|u|em|strong|span|br|kbd|sub|sup|small|mark|a)((?:\s+[a-z-]+=&quot;[^&]*&quot;)*)\s*\/?&gt;/g;

  function inline(s) {
    s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    s = s.replace(ALLOWED, (m, slash, tag, attrs) => '<' + slash + tag + attrs.replace(/&quot;/g, '"') + '>');
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1<em>$2</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\((#[^)\s]*|https?:\/\/[^)\s]+)\)/g, (m, t, h) => '<a href="' + h + '"' + (h[0] === '#' ? '' : ' target="_blank" rel="noopener"') + '>' + t + '</a>');
    return s;
  }

  const CALLOUTS = { tip: ['💡', 'Tip'], key: ['🔑', 'Key idea'], warn: ['⚠️', 'Watch out'], note: ['📝', 'Note'], ex: ['✏️', 'Example'], why: ['🤔', 'Why?'] };

  function md(src) {
    if (src == null) return '';
    const math = [];
    let s = String(src)
      .replace(/\$\$([\s\S]+?)\$\$/g, (m, t) => { math.push([t, true]); return '\u0001' + (math.length - 1) + '\u0002'; })
      .replace(/\$([^$\n]+?)\$/g, (m, t) => { math.push([t, false]); return '\u0001' + (math.length - 1) + '\u0002'; });

    // Line-based block parser: headings, tables, lists (one nesting level), callouts, quotes, display math, paragraphs.
    const lines = s.split('\n');
    const out = [];
    let i = 0;
    const isBlank = l => !l.trim();
    const isHead = l => /^\s*#{1,4}\s+/.test(l);
    const isTable = l => /^\s*\|.*\|\s*$/.test(l);
    const isUL = l => /^\s*[-*•]\s+/.test(l);
    const isOL = l => /^\s*\d+[.)]\s+/.test(l);
    const isQuote = l => /^\s*>\s?/.test(l);
    const isCallout = l => { const m = l.match(/^\s*!(\w+)\s/); return !!(m && CALLOUTS[m[1]]); };
    const isDisplay = l => { const m = l.match(/^\s*\u0001(\d+)\u0002\s*$/); return !!(m && math[+m[1]][1]); };
    const isHTML = l => /^\s*<(div|table|svg|details|figure|ul|ol|p|h\d)/i.test(l);
    const startsBlock = l => isBlank(l) || isHead(l) || isTable(l) || isUL(l) || isOL(l) || isQuote(l) || isCallout(l) || isHTML(l) || isDisplay(l);
    while (i < lines.length) {
      const l = lines[i];
      if (isBlank(l)) { i++; continue; }
      if (isHTML(l)) { const buf = []; while (i < lines.length && !isBlank(lines[i])) buf.push(lines[i++]); out.push(buf.join('\n')); continue; }
      if (isHead(l)) {
        const m = l.trim().match(/^(#{1,4})\s+(.*)$/); const lv = Math.min(6, m[1].length + 2);
        out.push('<h' + lv + '>' + inline(m[2]) + '</h' + lv + '>'); i++; continue;
      }
      if (isTable(l)) { const buf = []; while (i < lines.length && isTable(lines[i])) buf.push(lines[i++]); out.push(table(buf)); continue; }
      if (isCallout(l)) {
        const m = l.trim().match(/^!(\w+)\s+([\s\S]*)$/); const buf = [m[2]]; i++;
        while (i < lines.length && !isBlank(lines[i])) buf.push(lines[i++]);
        const [ic, label] = CALLOUTS[m[1]];
        out.push('<div class="callout callout-' + m[1] + '"><div class="callout-h">' + ic + ' ' + label + '</div><div>' + md(restore(buf.join('\n'))) + '</div></div>');
        continue;
      }
      if (isQuote(l)) { const buf = []; while (i < lines.length && isQuote(lines[i])) buf.push(lines[i++].replace(/^\s*>\s?/, '')); out.push('<blockquote>' + inline(buf.join(' ')) + '</blockquote>'); continue; }
      if (isUL(l) || isOL(l)) { out.push(list()); continue; }
      if (isDisplay(l)) { out.push('<div class="math-block">' + l.trim() + '</div>'); i++; continue; }
      // paragraph: consecutive non-block lines
      const buf = []; while (i < lines.length && !startsBlock(lines[i])) buf.push(lines[i++].trim());
      if (!buf.length) { buf.push(lines[i++].trim()); }
      const text = buf.join(' ');
      if (/^\u0001\d+\u0002$/.test(text) && math[+text.slice(1, -1)][1]) out.push('<div class="math-block">' + text + '</div>');
      else out.push('<p>' + inline(text) + '</p>');
    }
    let html = out.join('');
    function list() {
      const ordered = isOL(lines[i]);
      const base = lines[i].match(/^\s*/)[0].length;
      const items = [];
      while (i < lines.length && !isBlank(lines[i]) && (isUL(lines[i]) || isOL(lines[i]) || /^\s{2,}\S/.test(lines[i]))) {
        const cur = lines[i]; const ind = cur.match(/^\s*/)[0].length;
        if (ind > base && items.length && (isUL(cur) || isOL(cur))) { // nested list
          const sub = []; const subOrdered = isOL(cur);
          while (i < lines.length && (isUL(lines[i]) || isOL(lines[i])) && lines[i].match(/^\s*/)[0].length > base) sub.push('<li>' + inline(lines[i++].replace(/^\s*([-*•]|\d+[.)])\s+/, '')) + '</li>');
          items[items.length - 1] += (subOrdered ? '<ol>' : '<ul>') + sub.join('') + (subOrdered ? '</ol>' : '</ul>');
          continue;
        }
        if (isUL(cur) || isOL(cur)) items.push(inline(cur.replace(/^\s*([-*•]|\d+[.)])\s+/, '')));
        else items[items.length - 1] += ' ' + inline(cur.trim());
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      return '<' + tag + '>' + items.map(x => '<li>' + x + '</li>').join('') + '</' + tag + '>';
    }
    function restore(x) { return x.replace(/\u0001(\d+)\u0002/g, (m, k) => { const [t, d] = math[+k]; return d ? '$$' + t + '$$' : '$' + t + '$'; }); }
    function table(rows0) {
      const rows = rows0.filter(l => !/^\s*\|[\s:|-]*-[\s:|-]*\|\s*$/.test(l)).map(l => l.trim().slice(1, -1).split('|').map(c => c.trim()));
      const cls = rows[0].every(c => !c) ? ' class="no-head"' : '';
      return '<div class="table-wrap"><table' + cls + '><thead><tr>' + rows[0].map(c => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>' +
        rows.slice(1).map(r => '<tr>' + r.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
    }
    html = html.replace(/\u0001(\d+)\u0002/g, (m, i) => { const [t, d] = math[+i]; return tex(t, d); });
    return html;
  }

  function into(el, src) { el.innerHTML = md(src); return el; }

  CL.tex = tex;
  CL.md = md;
  CL.mdInto = into;
})();
