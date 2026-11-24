/* Core utilities: randomness, exact fractions, LaTeX + expression-string formatting. */
(function () {
  'use strict';
  const CL = (window.CL = window.CL || {});

  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { const t = a % b; a = b; b = t; }
    return a || 1;
  }

  /* ---------- Exact rational numbers ---------- */
  class Frac {
    constructor(n, d = 1) {
      if (n instanceof Frac) { d = n.d; n = n.n; }
      if (!Number.isInteger(n) || !Number.isInteger(d)) throw new Error('Frac needs integers: ' + n + '/' + d);
      if (d === 0) throw new Error('Frac zero denominator');
      if (d < 0) { n = -n; d = -d; }
      const g = gcd(n, d);
      this.n = n / g || 0;
      this.d = d / g;
    }
    static of(x) {
      if (x instanceof Frac) return x;
      if (Number.isInteger(x)) return new Frac(x, 1);
      throw new Error('Frac.of non-integer ' + x);
    }
    add(o) { o = Frac.of(o); return new Frac(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(o) { o = Frac.of(o); return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(o) { o = Frac.of(o); return new Frac(this.n * o.n, this.d * o.d); }
    div(o) { o = Frac.of(o); return new Frac(this.n * o.d, this.d * o.n); }
    neg() { return new Frac(-this.n, this.d); }
    abs() { return new Frac(Math.abs(this.n), this.d); }
    inv() { return new Frac(this.d, this.n); }
    pow(k) {
      let r = new Frac(1); const b = k < 0 ? this.inv() : this;
      for (let i = 0; i < Math.abs(k); i++) r = r.mul(b);
      return r;
    }
    eq(o) { o = Frac.of(o); return this.n === o.n && this.d === o.d; }
    sign() { return Math.sign(this.n); }
    isInt() { return this.d === 1; }
    isZero() { return this.n === 0; }
    get v() { return this.n / this.d; }
    valueOf() { return this.n / this.d; }
    tex() {
      if (this.d === 1) return String(this.n);
      return (this.n < 0 ? '-' : '') + '\\frac{' + Math.abs(this.n) + '}{' + this.d + '}';
    }
    /** inline tex like 3/4 (used in exponents) */
    texInline() { return this.d === 1 ? String(this.n) : this.n + '/' + this.d; }
    str() { return this.d === 1 ? (this.n < 0 ? '(' + this.n + ')' : String(this.n)) : '(' + this.n + '/' + this.d + ')'; }
    toString() { return this.d === 1 ? String(this.n) : this.n + '/' + this.d; }
  }
  const F = (n, d) => new Frac(n, d);

  /* ---------- Random helpers ---------- */
  const U = {
    gcd,
    lcm: (a, b) => Math.abs(a * b) / gcd(a, b),
    int(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
    nz(a, b) { let x; do { x = U.int(a, b); } while (x === 0); return x; },
    pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    chance(p = 0.5) { return Math.random() < p; },
    sign() { return Math.random() < 0.5 ? -1 : 1; },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    },
    sample(arr, k) { return U.shuffle(arr).slice(0, k); },
    distinct(n, a, b, exclude = []) {
      const out = []; let guard = 0;
      while (out.length < n && guard++ < 1000) { const x = U.int(a, b); if (!out.includes(x) && !exclude.includes(x)) out.push(x); }
      return out;
    },
    range(a, b) { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; },
    fact(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; },
    round(x, d = 4) { const p = Math.pow(10, d); return Math.round(x * p) / p; },
    fmt(x, d = 4) {
      if (x === Infinity) return '∞'; if (x === -Infinity) return '-∞';
      if (!isFinite(x)) return String(x);
      if (Math.abs(x - Math.round(x)) < 1e-10) return String(Math.round(x));
      return String(U.round(x, d));
    },
    esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },
    clamp(x, a, b) { return Math.max(a, Math.min(b, x)); },
    today(d = new Date()) {
      const z = n => String(n).padStart(2, '0');
      return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
    },
    dayDiff(a, b) { // b - a in days for YYYY-MM-DD strings
      const pa = a.split('-').map(Number), pb = b.split('-').map(Number);
      return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 86400000);
    },
    addDays(day, n) {
      const p = day.split('-').map(Number); const d = new Date(p[0], p[1] - 1, p[2] + n);
      return U.today(d);
    },
    debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; },
    el(tag, attrs = {}, ...kids) {
      const e = document.createElement(tag);
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') e.className = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k === 'text') e.textContent = v;
        else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
        else e.setAttribute(k, v === true ? '' : v);
      }
      for (const kid of kids.flat()) if (kid != null && kid !== false) e.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
      return e;
    }
  };

  /* ---------- LaTeX helpers ---------- */
  const isF = x => x instanceof Frac;
  function toF(c) { return isF(c) ? c : Number.isInteger(c) ? new Frac(c) : null; }

  const T = {
    num(x) { if (isF(x)) return x.tex(); return U.fmt(x); },
    /** Returns {neg, s}: coefficient c times a body string (c may be Frac/int) */
    term(c, body) {
      const f = toF(c);
      if (f) {
        if (f.isZero()) return null;
        const a = f.abs();
        let s;
        if (body === '') s = a.tex();
        else if (a.eq(1)) s = body;
        else s = a.tex() + body;
        return { neg: f.sign() < 0, s };
      }
      if (c === 0) return null;
      const a = Math.abs(c);
      return { neg: c < 0, s: body === '' ? U.fmt(a) : (a === 1 ? body : U.fmt(a) + body) };
    },
    /** joins [{neg,s}] into "a + b - c" */
    join(parts) {
      parts = parts.filter(Boolean);
      if (!parts.length) return '0';
      return parts.map((p, i) => (i === 0 ? (p.neg ? '-' : '') + p.s : (p.neg ? ' - ' : ' + ') + p.s)).join('');
    },
    pw(v, p) {
      const f = toF(p);
      if (f) {
        if (f.isZero()) return '';
        if (f.eq(1)) return v;
        return v + '^{' + f.texInline() + '}';
      }
      return p === 1 ? v : v + '^{' + p + '}';
    },
    /** terms: [[coef, power], ...] */
    poly(terms, v = 'x') {
      return T.join(terms.map(([c, p]) => T.term(c, T.pw(v, p))));
    },
    /** "+ 3" or "- 3" for appending constants */
    signed(c) {
      const f = toF(c);
      if (f) return f.sign() < 0 ? ' - ' + f.abs().tex() : ' + ' + f.tex();
      return c < 0 ? ' - ' + U.fmt(-c) : ' + ' + U.fmt(c);
    },
    /** a*x + b */
    lin(a, b, v = 'x') { return T.poly([[a, 1], [b, 0]], v); },
    /** fraction n/d reduced, as tex */
    frac(n, d) { return new Frac(n, d).tex(); },
    /** multiple of pi from Frac */
    pi(f) {
      f = Frac.of(f);
      if (f.isZero()) return '0';
      const sgn = f.n < 0 ? '-' : '';
      const n = Math.abs(f.n);
      const top = (n === 1 ? '' : n) + '\\pi';
      return f.d === 1 ? sgn + top : sgn + '\\frac{' + top + '}{' + f.d + '}';
    },
    /** coefficient c times sqrt(k) e.g. 2\sqrt{3} */
    surd(c, k) {
      c = Frac.of(c);
      if (k === 1) return c.tex();
      const a = c.abs();
      const sgn = c.sign() < 0 ? '-' : '';
      if (a.d === 1) return sgn + (a.n === 1 ? '' : a.n) + '\\sqrt{' + k + '}';
      return sgn + '\\frac{' + (a.n === 1 ? '' : a.n) + '\\sqrt{' + k + '}}{' + a.d + '}';
    }
  };

  /* ---------- Plain expression strings (for the parser) ---------- */
  const S = {
    num(x) { if (isF(x)) return x.str(); return x < 0 ? '(' + x + ')' : String(x); },
    term(c, body) {
      const f = toF(c);
      if (f ? f.isZero() : c === 0) return null;
      if (body === '') return S.num(f || c);
      if (f && f.eq(1)) return body;
      if (f && f.eq(-1)) return '(-' + body + ')';
      return S.num(f || c) + '*' + body;
    },
    pw(v, p) {
      const f = toF(p);
      if (f) { if (f.isZero()) return ''; if (f.eq(1)) return v; return v + '^' + f.str(); }
      return p === 1 ? v : v + '^(' + p + ')';
    },
    poly(terms, v = 'x') {
      const parts = terms.map(([c, p]) => S.term(c, S.pw(v, p))).filter(Boolean);
      return parts.length ? '(' + parts.join(' + ') + ')' : '0';
    },
    lin(a, b, v = 'x') { return S.poly([[a, 1], [b, 0]], v); },
    pi(f) { f = Frac.of(f); return '(' + f.n + '*pi/' + f.d + ')'; },
    surd(c, k) { c = Frac.of(c); return '(' + c.str() + '*sqrt(' + k + '))'; }
  };

  /* Evaluate polynomial terms numerically / exactly */
  function polyEval(terms, x) {
    let s = 0; for (const [c, p] of terms) s += (+c) * Math.pow(x, +p); return s;
  }
  function polyEvalF(terms, x) {
    let s = new Frac(0); x = Frac.of(x);
    for (const [c, p] of terms) s = s.add(Frac.of(c).mul(x.pow(+p)));
    return s;
  }
  /* derivative of terms */
  function polyD(terms) {
    return terms.map(([c, p]) => [Frac.of(c).mul(Frac.of(p)), Frac.of(p).sub(1)]).filter(([c]) => !c.isZero());
  }
  function polyInt(terms) {
    return terms.map(([c, p]) => [Frac.of(c).div(Frac.of(p).add(1)), Frac.of(p).add(1)]);
  }

  Object.assign(CL, { Frac, F, U, T, S, poly: { eval: polyEval, evalF: polyEvalF, d: polyD, int: polyInt } });
})();
