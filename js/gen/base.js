/* Problem generator registry + answer helpers. */
(function () {
  'use strict';
  const CL = (window.CL = window.CL || {});
  const { U, Frac } = CL;

  const skills = {};

  /**
   * Register a skill generator.
   * meta: {title, unit, desc}
   * fn(level:1|2|3) => {q, a, hints, steps, graph?, check?, mistakes?}
   */
  function def(id, meta, fn) { skills[id] = { id, ...meta, fn }; }

  function make(id, level) {
    const sk = skills[id];
    if (!sk) throw new Error('Unknown skill ' + id);
    level = Math.max(1, Math.min(3, level || 1));
    let last;
    for (let i = 0; i < 25; i++) {
      try {
        const p = sk.fn(level);
        if (!p) continue;
        p.skill = id; p.level = level; p.title = sk.title;
        p.hints = p.hints || []; p.steps = p.steps || [];
        return p;
      } catch (e) { last = e; }
    }
    throw last || new Error('Generator failed: ' + id);
  }

  const texOf = v => (v instanceof Frac ? v.tex() : typeof v === 'number' ? U.fmt(v) : String(v));

  const A = {
    /** numeric answer (number | Frac | 'dne' | 'diverges'), with display tex */
    num(v, tex, extra = {}) {
      if (v instanceof Frac) return { type: 'num', v: v.v, tex: tex || v.tex(), ...extra };
      if (v === 'dne') return { type: 'num', v: 'dne', tex: tex || '\\text{DNE}', ...extra };
      if (v === 'diverges') return { type: 'num', v: 'diverges', tex: tex || '\\text{diverges}', ...extra };
      if (v === Infinity) return { type: 'num', v, tex: tex || '\\infty', ...extra };
      if (v === -Infinity) return { type: 'num', v, tex: tex || '-\\infty', ...extra };
      return { type: 'num', v, tex: tex || texOf(v), ...extra };
    },
    expr(v, tex, opts = {}) { return { type: 'expr', v, tex: tex || CL.expr.toTex(v), vars: opts.vars || ['x'], dom: opts.dom || [-2, 2], ...opts }; },
    anti(v, tex, opts = {}) { return { type: 'anti', v, tex: (tex || CL.expr.toTex(v)), vars: opts.vars || ['x'], dom: opts.dom || [-2, 2], ...opts }; },
    set(vals, tex) { return { type: 'set', v: vals.map(x => +x), tex: tex || vals.map(texOf).join(',\\ ') }; },
    tuple(vals, tex) { return { type: 'tuple', v: vals.map(x => +x), tex: tex || '\\langle ' + vals.map(texOf).join(', ') + '\\rangle' }; },
    /** multiple choice: correct markup + wrong markups (deduped, shuffled, max 4 total by default) */
    mc(correct, wrongs, max = 4) {
      const seen = new Set([correct]);
      const ws = [];
      for (const w of U.shuffle(wrongs)) { if (!seen.has(w)) { seen.add(w); ws.push(w); } }
      const choices = U.shuffle([correct, ...ws.slice(0, max - 1)]);
      return { type: 'mc', choices, correct: choices.indexOf(correct), tex: null, correctMd: correct };
    },
    /** fixed-order multiple choice (e.g. converge/diverge) */
    mcFixed(choices, correctIndex) { return { type: 'mc', choices, correct: correctIndex, correctMd: choices[correctIndex] }; }
  };

  /* shared math helpers for generators */
  const H = {
    /** nice multiple of pi from a float (denominator up to 24) */
    piFrac(v) { const k = Math.round(v / Math.PI * 24); return new Frac(k, 24); },
    /** tex for k (int coefficient) times body, e.g. 3x, -x, x */
    kx(k, body = 'x') { return k === 1 ? body : k === -1 ? '-' + body : k + body; },
    sx(k, body = 'x') { return k === 1 ? body : '(' + k + '*' + body + ')'; },
    /** "(x - a)" tex */
    xm(a, v = 'x') { return a === 0 ? v : a > 0 ? '(' + v + ' - ' + a + ')' : '(' + v + ' + ' + (-a) + ')'; },
    xmS(a, v = 'x') { return '(' + v + ' - ' + S_num(a) + ')'; },
    /** "\left(x-a\right)" without parens when a = 0 */
    shift(a, v = 'x') { return a === 0 ? v : a > 0 ? v + ' - ' + a : v + ' + ' + (-a); },
    sq: k => Math.sqrt(k),
    isSquare: n => n >= 0 && Number.isInteger(Math.sqrt(n)),
    /** split sqrt(n) into a*sqrt(b) */
    simplifySqrt(n) { let a = 1, b = n; for (let k = Math.floor(Math.sqrt(n)); k > 1; k--) { if (n % (k * k) === 0) { a = k; b = n / (k * k); break; } } return [a, b]; },
    sqrtTex(n) { const [a, b] = H.simplifySqrt(n); if (b === 1) return String(a); return (a === 1 ? '' : a) + '\\sqrt{' + b + '}'; }
  };
  function S_num(a) { return a < 0 ? '(' + a + ')' : String(a); }

  CL.gen = { skills, def, make, A, H, list: () => Object.values(skills) };
})();
