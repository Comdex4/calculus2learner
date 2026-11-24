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

    const blocks = s.split(/\n\s*\n/);
    let html = blocks.map(b => {
      b = b.replace(/^\n+|\s+$/g, '');
      const t = b.trim();
      if (!t) return '';
      if (/^<(div|table|svg|details|figure|ul|ol|p|h\d)/i.test(t)) return t;
      let m;
      if ((m = t.match(/^(#{1,4})\s+(.*)$/s))) { const lv = Math.min(6, m[1].length + 2); return '<h' + lv + '>' + inline(m[2]) + '</h' + lv + '>'; }
      if ((m = t.match(/^!(\w+)\s+([\s\S]*)$/)) && CALLOUTS[m[1]]) {
        const [ic, label] = CALLOUTS[m[1]];
        return '<div class="callout callout-' + m[1] + '"><div class="callout-h">' + ic + ' ' + label + '</div><div>' + paras(m[2]) + '</div></div>';
      }
      const lines = t.split('\n');
      if (lines.every(l => /^\s*[-*•]\s+/.test(l))) return '<ul>' + lines.map(l => '<li>' + inline(l.replace(/^\s*[-*•]\s+/, '')) + '</li>').join('') + '</ul>';
      if (lines.every(l => /^\s*\d+[.)]\s+/.test(l))) return '<ol>' + lines.map(l => '<li>' + inline(l.replace(/^\s*\d+[.)]\s+/, '')) + '</li>').join('') + '</ol>';
      if (lines.every(l => /^>\s?/.test(l))) return '<blockquote>' + inline(lines.map(l => l.replace(/^>\s?/, '')).join(' ')) + '</blockquote>';
      if (lines.length > 1 && lines.every(l => /^\|.*\|$/.test(l.trim()))) return table(lines);
      return '<p>' + inline(t).replace(/\n/g, ' ') + '</p>';
    }).join('');
    function paras(x) { return x.split(/\n/).map(l => inline(l)).join('<br>'); }
    function table(lines) {
      const rows = lines.filter(l => !/^\|\s*[-:| ]+\|$/.test(l.trim())).map(l => l.trim().slice(1, -1).split('|').map(c => c.trim()));
      return '<div class="table-wrap"><table><thead><tr>' + rows[0].map(c => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>' +
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
