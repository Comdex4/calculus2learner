/* Expression parser, evaluator, LaTeX printer and answer checking. */
(function () {
  'use strict';
  const CL = (window.CL = window.CL || {});

  const sec = x => 1 / Math.cos(x), csc = x => 1 / Math.sin(x), cot = x => Math.cos(x) / Math.sin(x);
  const FN = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan, sec, csc, cot,
    arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
    arcsec: x => Math.acos(1 / x), arccsc: x => Math.asin(1 / x), arccot: x => Math.PI / 2 - Math.atan(x),
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    ln: Math.log, log: Math.log10, exp: Math.exp, sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs
  };
  const INV = { sin: 'arcsin', cos: 'arccos', tan: 'arctan', sec: 'arcsec', csc: 'arccsc', cot: 'arccot' };
  const WORDS = ['arcsin', 'arccos', 'arctan', 'arcsec', 'arccsc', 'arccot', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
    'sqrt', 'cbrt', 'sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'exp', 'abs', 'log', 'ln', 'theta', 'alpha', 'beta', 'phi',
    'infinity', 'inf', 'pi'].sort((a, b) => b.length - a.length);
  const ALIAS = { asin: 'arcsin', acos: 'arccos', atan: 'arctan', infinity: 'inf' };
  const CONST = { pi: Math.PI, e: Math.E, inf: Infinity };
  const GREEK = { theta: '\\theta', alpha: '\\alpha', beta: '\\beta', phi: '\\varphi' };

  class ParseError extends Error {}
  const err = m => new ParseError(m);

  function normalize(s) {
    return String(s)
      .replace(/π/g, 'pi').replace(/θ/g, 'theta').replace(/∞/g, 'inf').replace(/√/g, 'sqrt')
      .replace(/[·×∙⋅]/g, '*').replace(/÷/g, '/').replace(/[−–—]/g, '-').replace(/\*\*/g, '^')
      .replace(/²/g, '^2').replace(/³/g, '^3').replace(/[[{]/g, '(').replace(/[\]}]/g, ')');
  }

  function tokenize(s) {
    s = normalize(s);
    const toks = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) {
        let j = i;
        while (j < s.length && /[0-9.]/.test(s[j])) j++;
        const str = s.slice(i, j);
        if ((str.match(/\./g) || []).length > 1 || str === '.') throw err('Bad number "' + str + '"');
        toks.push({ k: 'num', v: parseFloat(str) });
        i = j; continue;
      }
      if (/[a-zA-Z]/.test(c)) {
        const rest = s.slice(i).toLowerCase();
        const w = WORDS.find(w => rest.startsWith(w));
        if (w) { toks.push({ k: 'id', v: ALIAS[w] || w }); i += w.length; continue; }
        toks.push({ k: 'id', v: c }); i++; continue;
      }
      if ('+-*/^(),|!_'.includes(c)) { toks.push({ k: 'op', v: c }); i++; continue; }
      throw err('Unexpected character "' + c + '"');
    }
    return toks;
  }

  function parse(str) {
    const toks = tokenize(str);
    if (!toks.length) throw err('Empty expression');
    let p = 0, absDepth = 0;
    const peek = () => toks[p];
    const next = () => toks[p++];
    const isOp = (t, v) => t && t.k === 'op' && t.v === v;
    const expect = v => { if (!isOp(peek(), v)) throw err('Expected "' + v + '"'); p++; };
    const isFnTok = t => t && t.k === 'id' && FN[t.v];

    function startsOperand(t) {
      if (!t) return false;
      if (t.k === 'num' || t.k === 'id') return true;
      if (isOp(t, '(')) return true;
      if (isOp(t, '|') && absDepth === 0) return true;
      return false;
    }
    function parseExpr() {
      let n = parseTerm();
      while (isOp(peek(), '+') || isOp(peek(), '-')) {
        const o = next().v;
        n = { t: o === '+' ? 'add' : 'sub', a: n, b: parseTerm() };
      }
      return n;
    }
    function parseTerm() {
      let n = parseUnary();
      for (;;) {
        const t = peek();
        if (isOp(t, '*') || isOp(t, '/')) { next(); n = { t: t.v === '*' ? 'mul' : 'div', a: n, b: parseUnary() }; }
        else if (startsOperand(t)) n = { t: 'mul', a: n, b: parsePower() };
        else break;
      }
      return n;
    }
    function parseUnary() {
      if (isOp(peek(), '-')) { next(); return { t: 'neg', a: parseUnary() }; }
      if (isOp(peek(), '+')) { next(); return parseUnary(); }
      return parsePower();
    }
    function parsePower() {
      const b = parsePostfix();
      if (isOp(peek(), '^')) { next(); return { t: 'pow', a: b, b: parseUnary() }; }
      return b;
    }
    function parsePostfix() {
      let n = parsePrimary();
      while (isOp(peek(), '!')) { next(); n = { t: 'fact', a: n }; }
      return n;
    }
    function parsePrimary() {
      const t = next();
      if (!t) throw err('Expression ends too early');
      if (t.k === 'num') return { t: 'num', v: t.v };
      if (isOp(t, '(')) { const n = parseExpr(); expect(')'); return n; }
      if (isOp(t, '|')) {
        absDepth++; const n = parseExpr(); expect('|'); absDepth--;
        return { t: 'fn', f: 'abs', a: n };
      }
      if (t.k === 'id') {
        if (FN[t.v]) return parseFunc(t.v);
        if (t.v in CONST) return { t: 'const', n: t.v };
        return { t: 'var', n: t.v };
      }
      throw err('Unexpected "' + t.v + '"');
    }
    function parseFunc(f) {
      let base = null, power = null;
      if (f === 'log' && isOp(peek(), '_')) { next(); base = parsePrimary(); }
      if (isOp(peek(), '^')) {
        next();
        let neg = false;
        if (isOp(peek(), '-')) { next(); neg = true; }
        let pw = parsePrimary();
        if (neg) pw = { t: 'neg', a: pw };
        power = pw;
      }
      let arg;
      if (isOp(peek(), '(')) { next(); arg = parseExpr(); expect(')'); }
      else if (startsOperand(peek())) arg = parseImplicitArg();
      else throw err(f + ' needs an argument');
      let node = { t: 'fn', f, a: arg };
      if (base) node.base = base;
      if (power) {
        const isM1 = power.t === 'neg' && power.a.t === 'num' && power.a.v === 1;
        if (isM1 && INV[f]) node = { t: 'fn', f: INV[f], a: arg };
        else node = { t: 'pow', a: node, b: power };
      }
      return node;
    }
    function parseImplicitArg() {
      if (isOp(peek(), '-')) { next(); return { t: 'neg', a: parseImplicitArg() }; }
      let n = parsePower();
      while (startsOperand(peek()) && !isFnTok(peek())) n = { t: 'mul', a: n, b: parsePower() };
      return n;
    }

    const tree = parseExpr();
    if (p < toks.length) {
      const t = toks[p];
      throw err('Unexpected "' + (t.k === 'num' ? t.v : t.v) + '"');
    }
    return tree;
  }

  /* ---------- evaluation ---------- */
  function rpow(a, b) {
    if (a < 0 && !Number.isInteger(b)) {
      for (const q of [3, 5, 7]) {
        const pq = b * q;
        if (Math.abs(pq - Math.round(pq)) < 1e-9) {
          const pr = Math.round(pq);
          const mag = Math.pow(-a, b);
          return (Math.abs(pr) % 2 === 1) ? -mag : mag;
        }
      }
      return NaN;
    }
    return Math.pow(a, b);
  }
  function factorial(x) {
    if (x < 0 || !Number.isInteger(Math.round(x * 1e9) / 1e9)) return NaN;
    x = Math.round(x); let r = 1; for (let i = 2; i <= x; i++) r *= i; return r;
  }

  function compile(n) {
    switch (n.t) {
      case 'num': { const v = n.v; return () => v; }
      case 'const': { const v = CONST[n.n]; return () => v; }
      case 'var': { const k = n.n; return e => { const v = e[k]; return v === undefined ? NaN : v; }; }
      case 'add': { const a = compile(n.a), b = compile(n.b); return e => a(e) + b(e); }
      case 'sub': { const a = compile(n.a), b = compile(n.b); return e => a(e) - b(e); }
      case 'mul': { const a = compile(n.a), b = compile(n.b); return e => a(e) * b(e); }
      case 'div': { const a = compile(n.a), b = compile(n.b); return e => a(e) / b(e); }
      case 'pow': { const a = compile(n.a), b = compile(n.b); return e => rpow(a(e), b(e)); }
      case 'neg': { const a = compile(n.a); return e => -a(e); }
      case 'fact': { const a = compile(n.a); return e => factorial(a(e)); }
      case 'fn': {
        const f = FN[n.f], a = compile(n.a);
        if (n.base) { const b = compile(n.base); return e => Math.log(a(e)) / Math.log(b(e)); }
        return e => f(a(e));
      }
    }
    throw new Error('bad node ' + n.t);
  }

  function vars(n, out = new Set()) {
    if (!n) return out;
    if (n.t === 'var') out.add(n.n);
    for (const k of ['a', 'b', 'base']) if (n[k]) vars(n[k], out);
    return out;
  }

  /* ---------- LaTeX printing ---------- */
  const FNTEX = {
    sin: '\\sin', cos: '\\cos', tan: '\\tan', sec: '\\sec', csc: '\\csc', cot: '\\cot',
    arcsin: '\\arcsin', arccos: '\\arccos', arctan: '\\arctan', arcsec: '\\operatorname{arcsec}',
    arccsc: '\\operatorname{arccsc}', arccot: '\\operatorname{arccot}', sinh: '\\sinh', cosh: '\\cosh', tanh: '\\tanh',
    ln: '\\ln', log: '\\log'
  };
  function fmtNum(v) {
    if (Number.isInteger(v)) return String(v);
    return String(Math.round(v * 1e8) / 1e8);
  }
  const PREC = { add: 1, sub: 1, mul: 2, div: 2, neg: 2, pow: 3, fact: 4 };
  function startsDigit(n) {
    if (n.t === 'num') return true;
    if (n.t === 'pow' || n.t === 'mul' || n.t === 'fact') return startsDigit(n.a);
    if (n.t === 'div') return false;
    return false;
  }
  function tex(n, ctx = 0) {
    let s, my = 5;
    switch (n.t) {
      case 'num': s = fmtNum(n.v); break;
      case 'const': s = { pi: '\\pi', e: 'e', inf: '\\infty' }[n.n]; break;
      case 'var': s = GREEK[n.n] || n.n; break;
      case 'add':
        my = 1;
        if (n.b.t === 'neg') s = tex(n.a, 1) + ' - ' + tex(n.b.a, 2);
        else s = tex(n.a, 1) + ' + ' + tex(n.b, 1);
        break;
      case 'sub': my = 1; s = tex(n.a, 1) + ' - ' + tex(n.b, 2); break;
      case 'mul': {
        my = 2;
        const L = tex(n.a, 2);
        const R = n.b.t === 'neg' ? '\\left(' + tex(n.b) + '\\right)' : tex(n.b, 2);
        const needDot = startsDigit(n.b) || (n.a.t === 'num' && n.b.t === 'num');
        s = L + (needDot ? ' \\cdot ' : ' ') + R;
        break;
      }
      case 'div': my = 2; s = '\\frac{' + tex(n.a) + '}{' + tex(n.b) + '}'; break;
      case 'neg': my = 2; s = '-' + tex(n.a, 2.5); break;
      case 'pow': {
        my = 3;
        const b = n.a;
        if (b.t === 'fn' && FNTEX[b.f] && !b.base) {
          s = FNTEX[b.f] + '^{' + tex(n.b) + '}\\left(' + tex(b.a) + '\\right)';
        } else {
          const bt = tex(b, 4);
          s = '{' + bt + '}^{' + tex(n.b) + '}';
        }
        break;
      }
      case 'fact': my = 4; s = tex(n.a, 5) + '!'; break;
      case 'fn': {
        const a = tex(n.a);
        if (n.f === 'sqrt') s = '\\sqrt{' + a + '}';
        else if (n.f === 'cbrt') s = '\\sqrt[3]{' + a + '}';
        else if (n.f === 'abs') s = '\\left|' + a + '\\right|';
        else if (n.f === 'exp') s = 'e^{' + a + '}';
        else if (n.base) s = '\\log_{' + tex(n.base) + '}\\left(' + a + '\\right)';
        else s = FNTEX[n.f] + '\\left(' + a + '\\right)';
        break;
      }
      default: s = '?';
    }
    return my < ctx ? '\\left(' + s + '\\right)' : s;
  }

  /* ---------- Answer checking ---------- */
  const SPECIAL = {
    dne: ['dne', 'does not exist', 'doesnotexist', 'undefined', 'none', 'no limit'],
    diverges: ['diverges', 'diverge', 'divergent', 'div', 'd'],
  };
  function specialOf(s) {
    const t = String(s).trim().toLowerCase().replace(/\.$/, '');
    for (const k in SPECIAL) if (SPECIAL[k].includes(t)) return k;
    return null;
  }

  function cleanInput(s) {
    s = String(s).trim();
    // drop "y =", "f(x) =", "dy/dx =" prefixes
    if (s.includes('=')) s = s.slice(s.lastIndexOf('=') + 1);
    // drop trailing + C
    s = s.replace(/\+\s*[cC]\s*$/, '');
    return s.trim();
  }

  function evalNumber(s) {
    const tree = parse(s);
    const vs = vars(tree);
    if (vs.size) throw err('Answer should be a number (found variable ' + [...vs][0] + ')');
    return compile(tree)({});
  }

  function decimalsIn(s) {
    const m = String(s).trim().match(/^-?\d*\.(\d+)$/);
    return m ? m[1].length : -1;
  }

  function numClose(u, v, raw, tol) {
    if (!isFinite(v)) return u === v;
    if (!isFinite(u)) return false;
    const rel = tol || 1e-6;
    if (Math.abs(u - v) <= rel * Math.max(1, Math.abs(v))) return true;
    const d = decimalsIn(raw);
    if (d >= 2 && Math.abs(u - v) <= 0.5 * Math.pow(10, -d) + 1e-9) return true;
    return false;
  }

  function splitTop(s) {
    s = s.trim().replace(/^[<(\[{]\s*(.*?)\s*[>)\]}]$/s, (m, inner) => {
      // only strip if the brackets wrap a comma list
      let depth = 0;
      for (const ch of inner) { if (ch === '(') depth++; else if (ch === ')') depth--; if (depth < 0) return m; if (ch === ',' && depth === 0) return inner; }
      return m;
    });
    const parts = []; let depth = 0, cur = '';
    for (const ch of s) {
      if (ch === '(' || ch === '[') depth++;
      if (ch === ')' || ch === ']') depth--;
      if ((ch === ',' || ch === ';') && depth === 0) { parts.push(cur); cur = ''; } else cur += ch;
    }
    if (cur.trim() || parts.length) parts.push(cur);
    return parts.map(x => x.trim()).filter(x => x.length);
  }

  function samplePoints(vs, dom, n) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const env = { C: 0, c: 0 };
      vs.forEach((v, j) => {
        const d = Array.isArray(dom[0]) ? dom[j] || dom[0] : dom;
        env[v] = d[0] + (d[1] - d[0]) * ((i + 0.5 + 0.37 * Math.sin(17 * i + 3 * j + 1)) / n);
      });
      pts.push(env);
    }
    return U_shuffle(pts);
  }
  function U_shuffle(a) { return a; }

  /**
   * Check a user's raw string against an answer spec.
   * Returns {ok, msg?, parsed?}
   */
  function check(raw, ans) {
    const type = ans.type;
    if (raw == null || String(raw).trim() === '') return { ok: false, empty: true, msg: 'Enter an answer first.' };
    try {
      if (type === 'num') {
        const sp = specialOf(raw);
        if (typeof ans.v === 'string') {
          if (sp === ans.v) return { ok: true };
          if (ans.v === 'diverges' && (sp === 'dne' || /^[-+]?\s*(inf|infinity|∞)$/i.test(String(raw).trim()))) return { ok: true };
          if (sp) return { ok: false };
          evalNumber(cleanInput(raw));
          return { ok: false };
        }
        if (sp) return { ok: false };
        const u = evalNumber(cleanInput(raw));
        return { ok: numClose(u, ans.v, cleanInput(raw), ans.tol) };
      }
      if (type === 'set' || type === 'tuple') {
        const sp = specialOf(raw);
        const want = ans.v.slice();
        if (!want.length) return { ok: sp === 'dne' || /^(none|no solution|empty|\{\s*\}|∅)$/i.test(String(raw).trim()) };
        if (sp) return { ok: false };
        const parts = splitTop(cleanInput(raw));
        const got = parts.map(p => ({ raw: p, v: evalNumber(p) }));
        if (got.length !== want.length) return { ok: false, msg: 'Expected ' + want.length + ' value' + (want.length > 1 ? 's' : '') + ', you gave ' + got.length + '.' };
        if (type === 'tuple') return { ok: got.every((g, i) => numClose(g.v, want[i], g.raw, ans.tol)) };
        const used = new Array(want.length).fill(false);
        for (const g of got) {
          const j = want.findIndex((w, i) => !used[i] && numClose(g.v, w, g.raw, ans.tol));
          if (j < 0) return { ok: false };
          used[j] = true;
        }
        return { ok: true };
      }
      if (type === 'expr' || type === 'anti') {
        const vs = ans.vars || ['x'];
        const ut = parse(cleanInput(raw));
        const et = parse(ans.v);
        const uv = vars(ut);
        for (const v of uv) if (!vs.includes(v) && v !== 'C' && v !== 'c') return { ok: false, msg: 'Unknown variable "' + v + '" — use ' + vs.join(', ') + '.' };
        const uf = compile(ut), ef = compile(et);
        const dom = ans.dom || [-2, 2];
        const pts = samplePoints(vs, dom, 14);
        let valid = 0, d0 = null;
        for (const env of pts) {
          const e = ef(env);
          if (!isFinite(e)) continue;
          const u = uf(env);
          if (!isFinite(u)) return { ok: false };
          valid++;
          const scale = Math.max(1, Math.abs(e), Math.abs(u));
          if (type === 'anti') {
            const d = u - e;
            if (d0 === null) d0 = d;
            else if (Math.abs(d - d0) > 1e-6 * scale) return { ok: false };
          } else if (Math.abs(u - e) > 1e-6 * scale) return { ok: false };
        }
        if (valid < 3) return { ok: false, msg: 'Could not verify — try simplifying.' };
        if (type === 'expr' && ans.form && !ans.form(raw)) return { ok: false, msg: ans.formMsg || 'Correct value, but not in the requested form.' };
        return { ok: true };
      }
    } catch (e) {
      if (e instanceof ParseError) return { ok: false, msg: e.message, parseError: true };
      throw e;
    }
    return { ok: false };
  }

  /** Live preview LaTeX for any input */
  function preview(raw, type) {
    const s = String(raw || '').trim();
    if (!s) return { tex: '' };
    const sp = specialOf(s);
    if (sp) return { tex: '\\text{' + (sp === 'dne' ? 'DNE' : 'diverges') + '}' };
    try {
      if (type === 'set' || type === 'tuple') {
        const parts = splitTop(cleanInput(s));
        const inner = parts.map(p => tex(parse(p))).join(',\\ ');
        return { tex: type === 'tuple' ? '\\langle ' + inner + ' \\rangle' : inner };
      }
      const c = cleanInput(s);
      const t = parse(c);
      let out = tex(t);
      if (type === 'anti') out += ' + C';
      return { tex: out };
    } catch (e) {
      return { tex: '', error: e.message };
    }
  }

  /** compile a string to a JS function of named vars */
  function fn(str, varNames = ['x']) {
    const f = compile(parse(str));
    if (varNames.length === 1) { const k = varNames[0]; return x => f({ [k]: x }); }
    return (...args) => { const env = {}; varNames.forEach((k, i) => (env[k] = args[i])); return f(env); };
  }

  CL.expr = { parse, compile, tex, vars, check, preview, fn, evalNumber, ParseError, FN, specialOf, toTex: s => tex(parse(s)) };
})();
