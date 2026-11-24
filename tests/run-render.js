/* Render every piece of rich text (lessons, reference, generated problems) through the real
 * Markdown+KaTeX renderer and flag anything that leaks raw markdown or renders badly. */
const fs = require('fs'), path = require('path');
const load = require('./load.js');
const katex = require(path.join(__dirname, '..', 'vendor', 'katex', 'katex.min.js'));
const gens = fs.readdirSync(path.join(__dirname, '..', 'js/gen')).filter(f => f !== 'base.js').map(f => 'js/gen/' + f);
const content = ['js/content/course.js', 'js/content/u-foundations.js', 'js/content/u-calc1.js', 'js/content/u-calc2.js', 'js/content/u-series.js', 'js/content/reference.js'];
const CL = load(['js/core/util.js', 'js/core/expr.js', 'js/core/render.js', 'js/gen/base.js', ...gens, ...content], { katex });

const errs = [];
function inspect(src, where) {
  const html = CL.md(src);
  const text = html.replace(/<span class="katex[\s\S]*?<\/annotation>/g, '').replace(/<[^>]+>/g, ' ');
  if (/\|\s*-{3,}/.test(text)) errs.push(where + ': raw table separator leaked');
  if (/(^|\s)#{2,4}\s/.test(text)) errs.push(where + ': raw heading marker leaked');
  if (/\*\*/.test(text)) errs.push(where + ': raw ** leaked');
  if (/katex-error/.test(html)) errs.push(where + ': KaTeX error');
  for (const m of html.matchAll(/<h(\d)>([\s\S]*?)<\/h\1>/g)) {
    const plain = m[2].replace(/<[^>]+>/g, '');
    if (plain.length > 80 || /<table|<p>|<ul/.test(m[2])) errs.push(where + ': heading swallowed content: ' + plain.slice(0, 60));
  }
  const tables = (src.match(/^\s*\|.*\|\s*$/gm) || []).length;
  if (tables && !/<table/.test(html)) errs.push(where + ': table markdown did not become a table');
}
let n = 0;
for (const u of CL.course.units) for (const l of u.lessons) l.steps.forEach((st, i) => {
  for (const s of [st.md, st.explain, ...(st.choices || [])].filter(Boolean)) { inspect(s, l.id + '#' + i); n++; }
});
for (const r of CL.REFERENCE) { inspect(r.md, 'reference:' + r.id); n++; }
for (const sk of CL.gen.list()) for (let lv = 1; lv <= 3; lv++) for (let k = 0; k < 8; k++) {
  const p = CL.gen.make(sk.id, lv);
  for (const s of [p.q, ...p.hints, ...p.steps]) { inspect(s, sk.id + ' L' + lv); n++; }
}
const uniq = [...new Set(errs)];
uniq.slice(0, 40).forEach(e => console.log('✗ ' + e));
console.log(`${n} rich-text blocks rendered, ${uniq.length} problems`);
process.exit(uniq.length ? 1 : 0);
