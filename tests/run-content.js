/* Validate lesson content: references, KaTeX, and answer self-checks. */
const fs = require('fs'), path = require('path');
const load = require('./load.js');
const katex = require(path.join(__dirname, '..', 'vendor', 'katex', 'katex.min.js'));
const gens = fs.readdirSync(path.join(__dirname, '..', 'js/gen')).filter(f => f !== 'base.js').map(f => 'js/gen/' + f);
const content = ['js/content/course.js', 'js/content/u-foundations.js', 'js/content/u-calc1.js', 'js/content/u-calc2.js', 'js/content/u-series.js'];
const CL = load(['js/core/util.js', 'js/core/expr.js', 'js/gen/base.js', ...gens, ...content]);
const widgetSrc = fs.readFileSync(path.join(__dirname, '..', 'js/ui/widgets.js'), 'utf8');
const widgets = new Set([...widgetSrc.matchAll(/W\.(\w+) = \(/g)].map(m => m[1]));
const errs = [];
const tex = (t, where) => { try { katex.renderToString(t, { throwOnError: true, strict: 'ignore' }); } catch (e) { errs.push(where + ': KaTeX ' + e.message.slice(0, 90) + ' IN ' + t.slice(0, 80)); } };
const chunks = md => { const o = []; String(md).replace(/\$\$([\s\S]+?)\$\$/g, (m, t) => { o.push(t); return ''; }).replace(/\$([^$\n]+?)\$/g, (m, t) => { o.push(t); return ''; }); return o; };
const ids = new Set(); let nLessons = 0, nSteps = 0;
const usedSkills = new Set();
for (const u of CL.course.units) for (const l of u.lessons) {
  nLessons++;
  if (ids.has(l.id)) errs.push('dup lesson id ' + l.id); ids.add(l.id);
  for (const s of l.skills || []) { if (!CL.gen.skills[s]) errs.push(l.id + ': unknown skill ' + s); usedSkills.add(s); }
  l.steps.forEach((st, i) => {
    nSteps++;
    const w = l.id + '#' + i;
    if (!st) { errs.push(w + ': empty step'); return; }
    for (const m of [st.md, st.explain, ...(st.choices || [])].filter(Boolean)) chunks(m).forEach(t => tex(t, w));
    if (st.t === 'widget' && !widgets.has(st.w)) errs.push(w + ': unknown widget ' + st.w);
    if (st.t === 'practice' && !CL.gen.skills[st.skill]) errs.push(w + ': unknown practice skill ' + st.skill);
    if (st.t === 'mc' && !(st.a >= 0 && st.a < st.choices.length)) errs.push(w + ': bad mc index');
    if (st.t === 'input') {
      const a = st.ans; const raw = a.type === 'set' || a.type === 'tuple' ? a.v.join(',') : typeof a.v === 'number' ? String(a.v) : a.v;
      const r = CL.expr.check(raw, a); if (!r.ok) errs.push(w + ': input answer fails self-check ' + JSON.stringify(r));
      if (st.placeholder && !/^e\.g\./.test(st.placeholder)) {}
      if (st.placeholder) { const ex = st.placeholder.replace(/^e\.g\.\s*/, ''); const r2 = CL.expr.check(ex, a); if (!r2.ok) errs.push(w + ': placeholder example does not check: ' + ex); }
    }
  });
}
const unused = Object.keys(CL.gen.skills).filter(s => !usedSkills.has(s));
if (unused.length) errs.push('skills not attached to any lesson: ' + unused.join(', '));
const unusedW = [...widgets].filter(w => !CL.course.units.some(u => u.lessons.some(l => l.steps.some(s => s.t === 'widget' && s.w === w))));
console.log(`${CL.course.units.length} units, ${nLessons} lessons, ${nSteps} steps, ${widgets.size} widgets (${unusedW.length} unused in lessons: ${unusedW.join(', ')})`);
errs.forEach(e => console.log('✗ ' + e));
console.log(errs.length ? errs.length + ' problems' : 'content OK');
process.exit(errs.length ? 1 : 0);
