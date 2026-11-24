/* Stress-test every problem generator:
 *  - generates N problems per skill per level
 *  - validates structure and that every $math$ fragment compiles in KaTeX
 *  - numerically verifies answers where the generator supplies a `check` spec
 * Usage: node tests/run-generators.js [skillFilter] [N]
 */
const fs = require('fs'), path = require('path');
const load = require('./load.js');
const katex = require(path.join(__dirname, '..', 'vendor', 'katex', 'katex.min.js'));
const files = ['js/core/util.js', 'js/core/expr.js', 'js/gen/base.js',
  ...fs.readdirSync(path.join(__dirname, '..', 'js', 'gen')).filter(f => f !== 'base.js' && f.endsWith('.js')).map(f => 'js/gen/' + f)];
const CL = load(files);
const E = CL.expr;
const filter = process.argv[2] && process.argv[2] !== 'all' ? process.argv[2] : null;
const N = +(process.argv[3] || 60);

function mathChunks(md) {
  const out = []; const s = String(md);
  s.replace(/\$\$([\s\S]+?)\$\$/g, (m, t) => { out.push(t); return ''; }).replace(/\$([^$\n]+?)\$/g, (m, t) => { out.push(t); return ''; });
  return out;
}
function texOk(t) { try { katex.renderToString(t, { throwOnError: true, strict: 'ignore' }); return null; } catch (e) { return e.message; } }

function nd(f, x) { const h = 1e-5; return (f(x + h) - f(x - h)) / (2 * h); }
function simpson(f, a, b, n = 2000) { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; }
function close(a, b, tol = 1e-4) { return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)); }

const errors = {}; let total = 0;
function fail(id, lv, msg, p) { const k = id; (errors[k] = errors[k] || []).push(`L${lv}: ${msg}` + (p ? `\n      Q: ${p.q}\n      A: ${JSON.stringify(p.a).slice(0, 200)}` : '')); }

for (const sk of CL.gen.list()) {
  if (filter && !sk.id.includes(filter)) continue;
  for (let lv = 1; lv <= 3; lv++) {
    for (let i = 0; i < N; i++) {
      total++;
      let p;
      try { p = CL.gen.make(sk.id, lv); } catch (e) { fail(sk.id, lv, 'THROW ' + e.stack.split('\n').slice(0, 2).join(' ')); continue; }
      try {
        if (!p.q || !p.a) { fail(sk.id, lv, 'missing q/a', p); continue; }
        if (!p.hints.length || !p.steps.length) fail(sk.id, lv, 'missing hints/steps', p);
        const allMd = [p.q, ...p.hints, ...p.steps, ...(p.a.choices || [])];
        if (p.a.tex) allMd.push('$' + p.a.tex + '$');
        for (const m of allMd) {
          if (/[^\s*a-z{]undefined|undefined[^\s.,;)}a-z*]|\bNaN\b|\[object|Infinity/i.test(m)) fail(sk.id, lv, 'bad text: ' + m.slice(0, 120), p);
          for (const t of mathChunks(m)) { const er = texOk(t); if (er) fail(sk.id, lv, 'KaTeX: ' + er.slice(0, 120) + ' IN ' + t.slice(0, 100), p); }
        }
        const a = p.a;
        if (a.type === 'mc') {
          if (!(a.correct >= 0 && a.correct < a.choices.length)) fail(sk.id, lv, 'mc correct index', p);
          if (new Set(a.choices).size !== a.choices.length) fail(sk.id, lv, 'mc duplicate choices', p);
          if (a.choices.length < 2) fail(sk.id, lv, 'mc too few choices', p);
        } else if (a.type === 'num') {
          if (typeof a.v === 'number' && Number.isNaN(a.v)) fail(sk.id, lv, 'num NaN', p);
          // answer tex should evaluate to value when it is a simple expression
          if (typeof a.v === 'number' && isFinite(a.v) && a.tex && !/text|circ|approx|,/.test(a.tex)) {
            // texless check: try to check the string version if provided
          }
          if (a.str) { const r = E.check(a.str, a); if (!r.ok) fail(sk.id, lv, 'answer str does not check: ' + a.str, p); }
        } else if (a.type === 'expr' || a.type === 'anti') {
          const r = E.check(a.v, a); if (!r.ok) fail(sk.id, lv, 'answer does not self-check ' + JSON.stringify(r), p);
        } else if (a.type === 'set' || a.type === 'tuple') {
          if (a.v.some(x => !isFinite(x))) fail(sk.id, lv, 'set has non-finite', p);
          const r = E.check(a.v.join(','), a); if (!r.ok && a.v.length) fail(sk.id, lv, 'set self check', p);
        }
        // numeric verification
        const c = p.check;
        if (c) {
          const dom = a.dom || [-2, 2];
          const pts = []; for (let k = 0; k < 7; k++) pts.push(dom[0] + (dom[1] - dom[0]) * (k + 0.37) / 7);
          if (c.deriv) {
            const f = E.fn(c.deriv), g = E.fn(a.v);
            for (const x of pts) { const d = nd(f, x), v = g(x); if (isFinite(d) && isFinite(v) && !close(d, v, 1e-4)) { fail(sk.id, lv, `deriv mismatch at ${x.toFixed(3)}: numeric ${d} vs answer ${v}`, p); break; } }
          }
          if (c.anti) {
            const f = E.fn(c.anti), g = E.fn(a.v);
            for (const x of pts) { const d = nd(g, x), v = f(x); if (isFinite(d) && isFinite(v) && !close(d, v, 1e-4)) { fail(sk.id, lv, `antideriv mismatch at ${x.toFixed(3)}: F' ${d} vs f ${v}`, p); break; } }
          }
          if (c.integral) {
            const [fs_, lo, hi] = c.integral; const f = E.fn(fs_);
            const I = simpson(f, lo, hi);
            if (!close(I, a.v, 1e-4)) fail(sk.id, lv, `integral mismatch: numeric ${I} vs ${a.v}`, p);
          }
          if (c.partial) {
            const [fs2, w] = c.partial; const f = E.fn(fs2, ['x', 'y']), g = E.fn(a.v, ['x', 'y']);
            for (const x of [0.4, 0.7, 1.1]) for (const y of [0.5, 0.9, 1.3]) {
              const h = 1e-5; const d = w === 'x' ? (f(x + h, y) - f(x - h, y)) / (2 * h) : (f(x, y + h) - f(x, y - h)) / (2 * h);
              if (!close(d, g(x, y), 1e-4)) { fail(sk.id, lv, `partial mismatch at (${x},${y}): ${d} vs ${g(x, y)}`, p); break; }
            }
          }
          if (c.ode) {
            const [fxy, x0, y0] = c.ode; const f = E.fn(fxy, ['x', 'y']), y = E.fn(a.v);
            if (!close(y(x0), y0, 1e-6)) fail(sk.id, lv, `ode initial condition y(${x0})=${y(x0)} != ${y0}`, p);
            for (const x of pts) { const d = nd(y, x), v = f(x, y(x)); if (isFinite(d) && isFinite(v) && !close(d, v, 1e-4)) { fail(sk.id, lv, `ode mismatch at ${x}: y' ${d} vs f ${v}`, p); break; } }
          }
          if (c.value !== undefined) { if (!close(c.value, a.v, 1e-6)) fail(sk.id, lv, `value mismatch ${c.value} vs ${a.v}`, p); }
          if (c.limit) {
            const [fs_, at, side] = c.limit; const f = E.fn(fs_);
            let v;
            if (at === Infinity || at === -Infinity) v = f(at > 0 ? 1e6 : -1e6);
            else { const h = 1e-4; v = side === '-' ? f(at - h) : side === '+' ? f(at + h) : (f(at + h) + f(at - h)) / 2; }
            if (a.v === Infinity || a.v === -Infinity) { if (!(Math.sign(v) === Math.sign(a.v) && Math.abs(v) > 1e3)) fail(sk.id, lv, `limit inf mismatch ${v}`, p); }
            else if (typeof a.v === 'number' && !close(v, a.v, 2e-3)) fail(sk.id, lv, `limit mismatch numeric ${v} vs ${a.v}`, p);
          }
          if (c.sum) {
            const [ts, n0] = c.sum; const f = E.fn(ts, ['n']);
            let s = 0; for (let n = n0; n < n0 + 200000; n++) s += f(n);
            if (!close(s, a.v, 2e-3)) fail(sk.id, lv, `series sum mismatch ${s} vs ${a.v}`, p);
          }
        }
      } catch (e) { fail(sk.id, lv, 'CHECK THROW ' + e.stack.split('\n').slice(0, 3).join(' '), p); }
    }
  }
}
const ids = Object.keys(errors);
for (const id of ids) {
  const uniq = [...new Set(errors[id])];
  console.log(`\n✗ ${id} (${errors[id].length} failures)`);
  uniq.slice(0, 4).forEach(e => console.log('   ' + e));
}
console.log(`\n${CL.gen.list().length} skills, ${total} problems generated, ${ids.length} skills with failures.`);
process.exit(ids.length ? 1 : 0);
