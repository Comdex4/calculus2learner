/* Interactive lesson widgets — "play with the math" components. */
(function () {
  'use strict';
  const CL = (window.CL = window.CL || {});
  const { U } = CL;
  const el = U.el;
  const PI = Math.PI;
  const W = {};

  /* ---------- small UI kit ---------- */
  const inl = s => CL.md(s).replace(/^<p>|<\/p>$/g, '');
  function box(host, cls = '') { const w = el('div', { class: 'widget ' + cls }); host.append(w); return w; }
  function controls(w) { const c = el('div', { class: 'wctl' }); w.append(c); return c; }
  function slider(c, o) {
    const id = 'r' + Math.random().toString(36).slice(2);
    const inp = el('input', { type: 'range', min: o.min, max: o.max, step: o.step || 'any', value: o.value, id });
    const val = el('span', { class: 'wval' });
    const lab = el('label', { class: 'wslider', for: id }, el('span', { class: 'wlab', html: inl(o.label) }), inp, val);
    const get = () => +inp.value;
    const upd = () => { val.innerHTML = o.fmt ? inl(o.fmt(get())) : U.fmt(get(), 3); };
    inp.addEventListener('input', () => { upd(); o.onInput && o.onInput(get()); });
    upd(); c.append(lab);
    return { el: lab, get value() { return get(); }, set value(v) { inp.value = v; upd(); }, input: inp, show(b) { lab.style.display = b ? '' : 'none'; } };
  }
  function chips(c, o) {
    const wrap = el('div', { class: 'wchips', role: 'radiogroup' }, o.label ? el('span', { class: 'wlab', html: inl(o.label) }) : null);
    let cur = o.value;
    const btns = o.options.map(([v, l]) => {
      const b = el('button', { class: 'chip' + (v === cur ? ' on' : ''), type: 'button', role: 'radio', 'aria-checked': v === cur ? 'true' : 'false', html: inl(l) });
      b.addEventListener('click', () => { cur = v; btns.forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); }); o.onChange && o.onChange(v); });
      wrap.append(b); return b;
    });
    c.append(wrap);
    return { get value() { return cur; } };
  }
  function toggle(c, label, checked, onChange) {
    const inp = el('input', { type: 'checkbox' }); inp.checked = checked;
    inp.addEventListener('change', () => onChange(inp.checked));
    const l = el('label', { class: 'wtoggle' }, inp, el('span', { html: inl(label) }));
    c.append(l); return inp;
  }
  function readout(w) { const r = el('div', { class: 'wread', 'aria-live': 'polite' }); w.append(r); return { el: r, set(md) { r.innerHTML = CL.md(md); } }; }
  function button(c, label, onclick, cls = 'btn btn-sm') { const b = el('button', { class: cls, type: 'button', onclick, html: inl(label) }); c.append(b); return b; }
  const fmt = (x, d = 3) => U.fmt(x, d);
  function simpson(f, a, b, n = 400) { if (a === b) return 0; const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; }
  const angleTex = th => { const f = CL.gen.H.piFrac(th); return Math.abs(f.v * PI - th) < 1e-9 ? CL.T.pi(f) : fmt(th, 3); };

  const FN = {
    sq: { tex: 'x^2', f: x => x * x, d: x => 2 * x, F: x => x ** 3 / 3, view: [-3, 3, -1, 9] },
    cubic: { tex: 'x^3 - 3x', f: x => x ** 3 - 3 * x, d: x => 3 * x * x - 3, F: x => x ** 4 / 4 - 1.5 * x * x, view: [-3, 3, -5, 5] },
    sin: { tex: '\\sin x', f: Math.sin, d: Math.cos, F: x => -Math.cos(x), view: [-2 * PI, 2 * PI, -2, 2], pi: true },
    exp: { tex: 'e^{x}', f: Math.exp, d: Math.exp, F: Math.exp, view: [-3, 2.5, -1, 8] },
    ln: { tex: '\\ln x', f: Math.log, d: x => 1 / x, F: x => x * Math.log(x) - x, view: [-0.5, 6, -3, 3], dom: [0.01, 100] },
    sqrt: { tex: '\\sqrt{x}', f: Math.sqrt, d: x => 0.5 / Math.sqrt(x), F: x => 2 / 3 * x ** 1.5, view: [-0.5, 6, -1, 3], dom: [0, 100] },
    recip: { tex: '\\frac{1}{x}', f: x => 1 / x, d: x => -1 / (x * x), F: x => Math.log(Math.abs(x)), view: [-4, 4, -4, 4] }
  };
  const fnChips = keys => keys.map(k => [k, '$' + FN[k].tex + '$']);

  /* ========== 1. Unit circle ========== */
  W.unitCircle = (host) => {
    const w = box(host);
    const c = controls(w);
    let snap = true;
    toggle(c, 'Snap to special angles', true, v => { snap = v; });
    const p = new CL.Plot(w, { xmin: -1.7, xmax: 1.7, ymin: -1.5, ymax: 1.5, equal: true, height: 340, pan: false, zoom: false });
    const r = readout(w);
    const pt = { type: 'point', x: Math.cos(PI / 6), y: Math.sin(PI / 6), drag: (x, y) => { let t = Math.atan2(y, x); if (t < 0) t += 2 * PI; if (snap) { const cand = []; for (let k = 0; k < 24; k++) cand.push(k * PI / 12); const sp = cand.filter((a, i) => i % 2 === 0 || (i % 3 === 0)); let best = sp.reduce((b, a) => Math.abs(a - t) < Math.abs(b - t) ? a : b); if (Math.abs(2 * PI - t) < Math.abs(best - t)) best = 0; t = best; } return [Math.cos(t), Math.sin(t)]; }, color: 'accent', label: 'P' };
    const arc = { type: 'custom', draw(ctx, P, pal) { let t = Math.atan2(pt.y, pt.x); if (t < 0) t += 2 * PI; ctx.strokeStyle = pal.text; ctx.lineWidth = 1.5; ctx.beginPath(); const R = P.X(0.22) - P.X(0); ctx.arc(P.X(0), P.Y(0), R, 0, -t, true); ctx.stroke(); ctx.fillStyle = pal.text; ctx.font = '600 12px system-ui'; ctx.fillText('θ', P.X(0.3 * Math.cos(t / 2)), P.Y(0.3 * Math.sin(t / 2))); } };
    function upd() {
      let t = Math.atan2(pt.y, pt.x); if (t < 0) t += 2 * PI;
      const deg = Math.round(t * 180 / PI * 100) / 100;
      const exact = Math.abs(deg - Math.round(deg)) < 1e-6 && Math.round(deg) % 15 === 0 && (Math.round(deg) % 30 === 0 || Math.round(deg) % 45 === 0);
      const ex = fn => { if (!exact) return fmt({ sin: Math.sin, cos: Math.cos, tan: Math.tan }[fn](t), 4); const e = CL.gen.exactTrig(fn, Math.round(deg)); return e.dne ? '\\text{undefined}' : e.tex; };
      const q = deg % 90 === 0 ? 'on an axis' : 'Quadrant ' + ['I', 'II', 'III', 'IV'][Math.floor(deg / 90)];
      p.layers = [
        { type: 'param', x: Math.cos, y: Math.sin, t: [0, 2 * PI], color: 'text', width: 1.5 },
        arc,
        { type: 'segment', x1: 0, y1: 0, x2: pt.x, y2: pt.y, color: 'text', width: 2 },
        { type: 'segment', x1: 0, y1: 0, x2: pt.x, y2: 0, color: 1, width: 4, label: 'cos' },
        { type: 'segment', x1: pt.x, y1: 0, x2: pt.x, y2: pt.y, color: 2, width: 4, label: 'sin' },
        ...(Math.abs(Math.tan(t)) < 6 && Math.abs(pt.x) > 0.05 ? [{ type: 'segment', x1: 1, y1: 0, x2: 1, y2: Math.tan(t), color: 3, width: 3, dash: true, label: 'tan' }] : []),
        pt
      ];
      p.draw();
      r.set(`$\\theta = ${angleTex(t)} = ${fmt(deg, 2)}^\\circ$ · ${q}\n\n$\\cos\\theta = ${ex('cos')}$, $\\quad\\sin\\theta = ${ex('sin')}$, $\\quad\\tan\\theta = ${ex('tan')}$`);
    }
    p.onDraw = null; pt.onEnd = upd;
    const origDrag = pt.drag; pt.drag = (x, y) => { const v = origDrag(x, y); pt.x = v[0]; pt.y = v[1]; setTimeout(upd); return v; };
    upd();
  };

  /* ========== 2. Trig graphs ========== */
  W.trigGraphs = (host) => {
    const w = box(host); const c = controls(w);
    let fn = 'sin';
    chips(c, { options: [['sin', '$\\sin$'], ['cos', '$\\cos$'], ['tan', '$\\tan$']], value: fn, onChange: v => { fn = v; upd(); } });
    const sA = slider(c, { label: '$A$', min: -4, max: 4, step: 0.25, value: 1, onInput: upd });
    const sB = slider(c, { label: '$B$', min: 0.25, max: 4, step: 0.25, value: 1, onInput: upd });
    const sH = slider(c, { label: '$h$', min: -PI, max: PI, step: PI / 12, value: 0, fmt: v => '$' + angleTex(v) + '$', onInput: upd });
    const sD = slider(c, { label: '$D$', min: -3, max: 3, step: 0.5, value: 0, onInput: upd });
    const p = new CL.Plot(w, { xmin: -2 * PI, xmax: 2 * PI, ymin: -5, ymax: 5, piTicks: true, height: 300, trace: true });
    const r = readout(w);
    function upd() {
      const A = sA.value, B = sB.value, h = sH.value, D = sD.value, f = Math[fn];
      p.set([{ type: 'fn', f, color: 'text', width: 1.2, dash: true, trace: false }, { type: 'hline', y: D, color: 3, dash: [3, 4], width: 1 }, { type: 'fn', f: x => A * f(B * (x - h)) + D, color: 1, width: 3 }]);
      const per = (fn === 'tan' ? PI : 2 * PI) / B;
      r.set(`$y = ${fmt(A)}\\${fn}\\big(${fmt(B)}(x ${h >= 0 ? '-' : '+'} ${angleTex(Math.abs(h))})\\big) ${D >= 0 ? '+' : '-'} ${fmt(Math.abs(D))}$\n\n${fn === 'tan' ? '' : `Amplitude $|A| = ${fmt(Math.abs(A))}$ · `}Period $= ${angleTex(per)}$ · Phase shift $${angleTex(h)}$ · Midline $y = ${fmt(D)}$`);
    }
    upd();
  };

  /* ========== 3. Transformations ========== */
  W.transform = (host) => {
    const w = box(host); const c = controls(w);
    const bases = { sq: ['x^2', x => x * x], abs: ['|x|', Math.abs], sqrt: ['\\sqrt{x}', Math.sqrt], exp: ['2^x', x => 2 ** x], recip: ['\\frac{1}{x}', x => 1 / x], sin: ['\\sin x', Math.sin] };
    let b = 'sq';
    chips(c, { label: '$f(x)$:', options: Object.keys(bases).map(k => [k, '$' + bases[k][0] + '$']), value: b, onChange: v => { b = v; upd(); } });
    const sa = slider(c, { label: '$a$ (vertical)', min: -3, max: 3, step: 0.25, value: 1, onInput: upd });
    const sb = slider(c, { label: '$b$ (horizontal)', min: 0.25, max: 3, step: 0.25, value: 1, onInput: upd });
    const sh = slider(c, { label: '$h$', min: -5, max: 5, step: 0.5, value: 0, onInput: upd });
    const sk = slider(c, { label: '$k$', min: -5, max: 5, step: 0.5, value: 0, onInput: upd });
    const p = new CL.Plot(w, { xmin: -7, xmax: 7, ymin: -6, ymax: 6, height: 300, trace: true });
    const r = readout(w);
    function upd() {
      const [tex, f] = bases[b], a = sa.value, bb = sb.value, h = sh.value, k = sk.value;
      p.set([{ type: 'fn', f, color: 'text', dash: true, width: 1.5, trace: false }, { type: 'fn', f: x => a * f(bb * (x - h)) + k, color: 1, width: 3 }]);
      const desc = [];
      if (a < 0) desc.push('reflected over the $x$-axis');
      if (Math.abs(a) !== 1) desc.push(`vertically ${Math.abs(a) > 1 ? 'stretched' : 'compressed'} by $${fmt(Math.abs(a))}$`);
      if (bb !== 1) desc.push(`horizontally ${bb > 1 ? 'compressed' : 'stretched'} by $${fmt(1 / bb)}$`);
      if (h) desc.push(`shifted ${h > 0 ? 'right' : 'left'} $${fmt(Math.abs(h))}$`);
      if (k) desc.push(`shifted ${k > 0 ? 'up' : 'down'} $${fmt(Math.abs(k))}$`);
      r.set(`$y = ${fmt(a)}\\,f\\big(${fmt(bb)}(x ${h >= 0 ? '-' : '+'} ${fmt(Math.abs(h))})\\big) ${k >= 0 ? '+' : '-'} ${fmt(Math.abs(k))}$ where $f(x) = ${tex}$\n\n${desc.length ? 'The dashed graph is ' + desc.join(', ') + '.' : 'No transformation yet — move a slider!'}`);
    }
    upd();
  };

  /* ========== 4. Exponentials & logs ========== */
  W.expLog = (host) => {
    const w = box(host); const c = controls(w);
    const sb = slider(c, { label: 'base $b$', min: 0.2, max: 5, step: 0.05, value: 2, onInput: upd });
    let showLog = true; toggle(c, 'Show inverse $\\log_b x$', true, v => { showLog = v; upd(); });
    const btn = button(c, 'Set $b = e$', () => { sb.value = Math.E; upd(); });
    const p = new CL.Plot(w, { xmin: -4, xmax: 6, ymin: -4, ymax: 6, equal: true, height: 320, trace: true });
    const r = readout(w);
    function upd() {
      const b = sb.value;
      const L = [{ type: 'fn', f: x => x, color: 'text', dash: true, width: 1, trace: false }, { type: 'fn', f: x => b ** x, color: 1, width: 3, label: 'b^x' }, { type: 'point', x: 0, y: 1, color: 1 }];
      if (showLog && Math.abs(b - 1) > 0.01) L.push({ type: 'fn', f: x => Math.log(x) / Math.log(b), color: 2, width: 3, domain: [1e-6, 100] }, { type: 'point', x: 1, y: 0, color: 2 });
      p.set(L);
      r.set(`$y = ${fmt(b, 3)}^x$ ${b > 1 ? '**grows**' : b < 1 ? '**decays**' : 'is constant'}. Slope at $x=0$: $\\ln b = ${fmt(Math.log(b), 4)}$${Math.abs(b - Math.E) < 0.01 ? ' — exactly 1 when $b = e$! That\'s why $e$ is special.' : ''}\n\nThe log curve is the reflection across $y = x$: $\\log_b(b^x) = x$.`);
    }
    upd();
  };

  /* ========== 5. Limit explorer ========== */
  W.limitExplorer = (host, params = {}) => {
    const w = box(host); const c = controls(w);
    const EX = {
      hole: { tex: '\\frac{x^2 - 1}{x - 1}', f: x => (x * x - 1) / (x - 1), a: 1, L: 2, view: [-2, 4, -1, 5], note: 'Undefined at $x = 1$, but the limit is $2$ — a removable hole.', hole: [1, 2] },
      sinc: { tex: '\\frac{\\sin x}{x}', f: x => Math.sin(x) / x, a: 0, L: 1, view: [-8, 8, -0.5, 1.5], note: 'Undefined at $0$, yet $\\frac{\\sin x}{x} \\to 1$.', hole: [0, 1] },
      jump: { tex: '\\frac{|x|}{x}', f: x => Math.abs(x) / x, a: 0, L: null, view: [-3, 3, -2, 2], note: 'Left side → $-1$, right side → $1$: the limit **does not exist**.' },
      blow: { tex: '\\frac{1}{x^2}', f: x => 1 / (x * x), a: 0, L: Infinity, view: [-3, 3, -1, 12], note: 'Grows without bound: $\\lim = \\infty$ (a vertical asymptote).' },
      osc: { tex: '\\sin\\left(\\frac{1}{x}\\right)', f: x => Math.sin(1 / x), a: 0, L: null, view: [-1, 1, -1.5, 1.5], note: 'Oscillates infinitely fast — no limit.' }
    };
    let k = params.example || 'hole';
    chips(c, { options: Object.keys(EX).map(k => [k, '$' + EX[k].tex + '$']), value: k, onChange: v => { k = v; const e = EX[k]; p.setView(...e.view); upd(); } });
    const sd = slider(c, { label: 'distance $\\delta$ from $a$', min: -4, max: 0, step: 0.05, value: -0.3, fmt: v => '$10^{' + fmt(v, 2) + '} \\approx ' + fmt(10 ** v, 4) + '$', onInput: upd });
    const p = new CL.Plot(w, { xmin: EX[k].view[0], xmax: EX[k].view[1], ymin: EX[k].view[2], ymax: EX[k].view[3], height: 300, trace: true });
    const r = readout(w);
    function upd() {
      const e = EX[k], d = 10 ** sd.value, xl = e.a - d, xr = e.a + d;
      const L = [{ type: 'fn', f: e.f, color: 1, width: 3, step: 0.5 }, { type: 'vline', x: e.a, color: 'text', dash: true, width: 1 }, { type: 'point', x: xl, y: e.f(xl), color: 2, label: 'left' }, { type: 'point', x: xr, y: e.f(xr), color: 3, label: 'right' }];
      if (e.hole) L.push({ type: 'point', x: e.hole[0], y: e.hole[1], hollow: true, color: 1, r: 5 });
      p.set(L);
      const rows = [1, 2, 3, 4].map(j => { const dd = d * 10 ** (1 - j) * 10; return `| $${fmt(e.a - dd / 10, 6)}$ | $${fmt(e.f(e.a - dd / 10), 6)}$ | $${fmt(e.a + dd / 10, 6)}$ | $${fmt(e.f(e.a + dd / 10), 6)}$ |`; });
      r.set(`$\\displaystyle\\lim_{x\\to ${e.a}} ${e.tex}$ — ${e.note}\n\n| $x$ (left) | $f(x)$ | $x$ (right) | $f(x)$ |\n|---|---|---|---|\n${rows.join('\n')}`);
    }
    upd();
  };

  /* ========== 6. Secant → tangent ========== */
  W.secantTangent = (host) => {
    const w = box(host); const c = controls(w);
    let k = 'sq';
    chips(c, { options: fnChips(['sq', 'cubic', 'sin', 'exp', 'sqrt']), value: k, onChange: v => { k = v; const f = FN[k]; p.setView(...f.view); pt.x = k === 'sqrt' ? 1 : 1; upd(); } });
    const sh = slider(c, { label: '$h$', min: -3, max: 0.4, step: 0.01, value: 0.3, fmt: v => '$h = ' + fmt(10 ** v, 4) + '$', onInput: upd });
    const p = new CL.Plot(w, { xmin: -3, xmax: 3, ymin: -1, ymax: 9, height: 320 });
    const r = readout(w);
    const pt = { type: 'point', x: 1, y: 1, color: 'accent', label: 'drag me', drag: (x) => [x, FN[k].f(x)] };
    function upd() {
      const F = FN[k], x0 = pt.x, h = 10 ** sh.value; pt.y = F.f(x0);
      const ms = (F.f(x0 + h) - F.f(x0)) / h, mt = F.d(x0);
      p.layers = [{ type: 'fn', f: F.f, color: 1, width: 3, domain: F.dom }, { type: 'line', x0, y0: F.f(x0), m: mt, color: 3, dash: true, width: 1.5 }, { type: 'line', x0, y0: F.f(x0), m: ms, color: 2, width: 2 }, { type: 'point', x: x0 + h, y: F.f(x0 + h), color: 2 }, pt];
      p.draw();
      r.set(`Secant slope $\\dfrac{f(${fmt(x0, 2)} + h) - f(${fmt(x0, 2)})}{h} = ${fmt(ms, 5)}$ · True derivative $f'(${fmt(x0, 2)}) = ${fmt(mt, 5)}$\n\nShrink $h$ and watch the **orange secant** become the **green tangent**: that limit *is* the derivative.`);
    }
    const od = pt.drag; pt.drag = (x, y) => { const v = od(x, y); pt.x = v[0]; setTimeout(upd); return v; };
    upd();
  };

  /* ========== 7. Derivative tracer ========== */
  W.derivativeTracer = (host) => {
    const w = box(host); const c = controls(w);
    let k = 'cubic';
    chips(c, { options: fnChips(['sq', 'cubic', 'sin', 'exp', 'ln']), value: k, onChange: v => { k = v; p1.setView(...FN[k].view); p2.setView(FN[k].view[0], FN[k].view[1], -5, 5); pt.x = k === 'ln' ? 1 : 0.5; upd(); } });
    const p1 = new CL.Plot(w, { xmin: -3, xmax: 3, ymin: -5, ymax: 5, height: 240 });
    el('div'); w.append(el('div', { class: 'wcap', html: inl("Below: the slope function $f'(x)$, traced as you drag.") }));
    const p2 = new CL.Plot(w, { xmin: -3, xmax: 3, ymin: -5, ymax: 5, height: 200 });
    const r = readout(w);
    const pt = { type: 'point', x: 0.5, y: 0, color: 'accent', label: 'drag', drag: x => [x, FN[k].f(x)] };
    function upd() {
      const F = FN[k]; const x0 = pt.x; pt.y = F.f(x0); const m = F.d(x0);
      p1.layers = [{ type: 'fn', f: F.f, color: 1, width: 3, domain: F.dom }, { type: 'line', x0, y0: pt.y, m, color: 2, width: 2 }, pt]; p1.draw();
      p2.set([{ type: 'fn', f: F.d, color: 2, width: 1.5, dash: true, domain: F.dom }, { type: 'fn', f: F.d, color: 2, width: 3, domain: [F.view[0], x0] }, { type: 'point', x: x0, y: m, color: 2 }]);
      r.set(`At $x = ${fmt(x0, 2)}$: $f(x) = ${fmt(pt.y, 3)}$, slope $f'(x) = ${fmt(m, 3)}$ — ${Math.abs(m) < 0.05 ? '**horizontal tangent** (possible max/min)' : m > 0 ? '$f$ is **increasing**' : '$f$ is **decreasing**'}.`);
    }
    const od = pt.drag; pt.drag = (x, y) => { const v = od(x, y); pt.x = v[0]; setTimeout(upd); return v; };
    upd();
  };

  /* ========== 8. Riemann sums ========== */
  W.riemann = (host, params = {}) => {
    const w = box(host); const c = controls(w);
    const fs = { sq: { tex: 'x^2', f: x => x * x, a: 0, b: 2, F: x => x ** 3 / 3 }, sin: { tex: '\\sin x', f: Math.sin, a: 0, b: PI, F: x => -Math.cos(x) }, cubic: { tex: 'x^3 - 3x + 2', f: x => x ** 3 - 3 * x + 2, a: -2, b: 2, F: x => x ** 4 / 4 - 1.5 * x * x + 2 * x }, exp: { tex: 'e^{x}', f: Math.exp, a: 0, b: 1, F: Math.exp }, recip: { tex: '\\frac1x', f: x => 1 / x, a: 1, b: 3, F: Math.log } };
    let k = 'sq', m = params.method || 'left';
    chips(c, { options: Object.keys(fs).map(k => [k, '$' + fs[k].tex + '$']), value: k, onChange: v => { k = v; view(); upd(); } });
    chips(c, { options: [['left', 'Left'], ['right', 'Right'], ['mid', 'Midpoint'], ['trap', 'Trapezoid'], ['simp', 'Simpson']], value: m, onChange: v => { m = v; upd(); } });
    const sn = slider(c, { label: '$n$', min: 1, max: 60, step: 1, value: 4, onInput: upd });
    const p = new CL.Plot(w, { height: 300, trace: true });
    const r = readout(w);
    function view() { const F = fs[k]; const ys = U.range(0, 50).map(i => F.f(F.a + (F.b - F.a) * i / 50)); p.setView(F.a - 0.5, F.b + 0.5, Math.min(0, ...ys) - 0.5, Math.max(...ys) + 0.8); }
    function upd() {
      const F = fs[k]; let n = sn.value; if (m === 'simp' && n % 2) n++;
      const dx = (F.b - F.a) / n; const rects = []; let s = 0;
      for (let i = 0; i < n; i++) {
        const x0 = F.a + i * dx, x1 = x0 + dx;
        if (m === 'trap') { rects.push({ x0, x1, y0: F.f(x0), y1: F.f(x1) }); s += (F.f(x0) + F.f(x1)) / 2 * dx; }
        else if (m === 'simp') { if (i % 2 === 0) { const xm = x1, x2 = x0 + 2 * dx; const y0 = F.f(x0), y1 = F.f(xm), y2 = F.f(x2); const q = x => { const l0 = (x - xm) * (x - x2) / ((x0 - xm) * (x0 - x2)), l1 = (x - x0) * (x - x2) / ((xm - x0) * (xm - x2)), l2 = (x - x0) * (x - xm) / ((x2 - x0) * (x2 - xm)); return y0 * l0 + y1 * l1 + y2 * l2; }; rects.push({ x0, x1: x2, f: q }); s += dx / 3 * (y0 + 4 * y1 + y2); } }
        else { const xs = m === 'left' ? x0 : m === 'right' ? x1 : (x0 + x1) / 2; const y = F.f(xs); rects.push({ x0, x1, y }); s += y * dx; }
      }
      const exact = F.F(F.b) - F.F(F.a);
      p.set([{ type: 'rects', rects, color: 2, signed: true }, { type: 'fn', f: F.f, color: 1, width: 3 }]);
      r.set(`Approximation with $n = ${n}$: $\\approx ${fmt(s, 6)}$ · Exact $\\displaystyle\\int_{${fmt(F.a, 3)}}^{${angleTex(F.b)}} ${F.tex}\\,dx = ${fmt(exact, 6)}$ · Error $= ${fmt(Math.abs(s - exact), 6)}$\n\nCrank up $n$ — the error shrinks. Notice how much faster ${m === 'simp' ? "Simpson's rule" : m === 'mid' || m === 'trap' ? 'this rule' : 'midpoint/Simpson'} converges than left/right sums.`);
    }
    view(); upd();
  };

  /* ========== 9. Accumulation (FTC) ========== */
  W.accumulation = (host) => {
    const w = box(host); const c = controls(w);
    const fs = { lin: { tex: 'x - 1', f: x => x - 1 }, sin: { tex: '\\sin x', f: Math.sin }, quad: { tex: '2 - x^2', f: x => 2 - x * x }, cos: { tex: '\\cos x', f: Math.cos } };
    let k = 'sin';
    chips(c, { label: '$f(t)$:', options: Object.keys(fs).map(k => [k, '$' + fs[k].tex.replace(/x/g, 't') + '$']), value: k, onChange: v => { k = v; upd(); } });
    const sx = slider(c, { label: '$x$', min: 0, max: 6, step: 0.01, value: 2, onInput: upd });
    const p1 = new CL.Plot(w, { xmin: -0.5, xmax: 6.5, ymin: -2.5, ymax: 2.5, height: 220 });
    w.append(el('div', { class: 'wcap', html: inl('Below: the accumulation function $A(x) = \\int_0^x f(t)\\,dt$.') }));
    const p2 = new CL.Plot(w, { xmin: -0.5, xmax: 6.5, ymin: -3, ymax: 3, height: 200 });
    const r = readout(w);
    function upd() {
      const f = fs[k].f, x = sx.value, A = t => simpson(f, 0, t, 200);
      p1.set([{ type: 'area', f, a: 0, b: x, signed: true, color: 1 }, { type: 'fn', f, color: 1, width: 3 }, { type: 'point', x, y: f(x), color: 'accent' }]);
      const pts = U.range(0, 120).map(i => { const t = 6 * i / 120; return [t, A(t)]; });
      p2.set([{ type: 'poly', pts, color: 2, width: 1.5, dash: true }, { type: 'poly', pts: pts.filter(q => q[0] <= x), color: 2, width: 3 }, { type: 'point', x, y: A(x), color: 2 }, { type: 'line', x0: x, y0: A(x), m: f(x), color: 3, width: 1.5, dash: true }]);
      r.set(`$A(${fmt(x, 2)}) = ${fmt(A(x), 4)}$ (blue area counts positive, red negative).\n\nSlope of $A$ at $x$ (green line) $= ${fmt(f(x), 4)} = f(${fmt(x, 2)})$. **That's the Fundamental Theorem:** $A'(x) = f(x)$.`);
    }
    upd();
  };

  /* ========== 10. Area between curves ========== */
  W.areaBetween = (host) => {
    const w = box(host); const c = controls(w);
    const P = {
      a: { tex: ['x + 2', 'x^2'], f: x => x + 2, g: x => x * x, a: -1, b: 2, view: [-2.5, 3.5, -1, 6] },
      b: { tex: ['\\sqrt{x}', 'x^2'], f: Math.sqrt, g: x => x * x, a: 0, b: 1, view: [-0.3, 1.5, -0.3, 1.3] },
      c: { tex: ['\\sin x', '\\cos x'], f: Math.sin, g: Math.cos, a: PI / 4, b: 5 * PI / 4, view: [0, 4.5, -1.5, 1.5] },
      d: { tex: ['x', 'x^3'], f: x => x, g: x => x ** 3, a: 0, b: 1, view: [-0.3, 1.4, -0.3, 1.3] }
    };
    let k = 'a';
    chips(c, { options: Object.keys(P).map(k => [k, '$' + P[k].tex[0] + '$ & $' + P[k].tex[1] + '$']), value: k, onChange: v => { k = v; p.setView(...P[k].view); sx.input.min = P[k].a; sx.input.max = P[k].b; sx.value = (P[k].a + P[k].b) / 2; upd(); } });
    const sx = slider(c, { label: 'sample slice at $x$', min: -1, max: 2, step: 0.01, value: 0.5, onInput: upd });
    const p = new CL.Plot(w, { xmin: -2.5, xmax: 3.5, ymin: -1, ymax: 6, height: 300, trace: true });
    const r = readout(w);
    function upd() {
      const Q = P[k], x = sx.value, dx = (Q.b - Q.a) / 30;
      const area = simpson(t => Q.f(t) - Q.g(t), Q.a, Q.b);
      p.set([{ type: 'area', f: Q.f, g: Q.g, a: Q.a, b: Q.b, color: 3, alpha: 0.25 }, { type: 'fn', f: Q.f, color: 1, width: 3 }, { type: 'fn', f: Q.g, color: 2, width: 3 },
        { type: 'custom', draw(ctx, pl, pal) { ctx.fillStyle = CL.graph.withAlpha(pal.c[3], 0.6); ctx.fillRect(pl.X(x - dx / 2), pl.Y(Q.f(x)), pl.X(x + dx / 2) - pl.X(x - dx / 2), pl.Y(Q.g(x)) - pl.Y(Q.f(x))); } },
        { type: 'point', x: Q.a, y: Q.f(Q.a), color: 'text' }, { type: 'point', x: Q.b, y: Q.f(Q.b), color: 'text' }]);
      r.set(`Slice at $x = ${fmt(x, 2)}$: height $= f(x) - g(x) = ${fmt(Q.f(x) - Q.g(x), 4)}$, width $dx$.\n\nAdd up all slices: $\\displaystyle\\int_{${angleTex(Q.a)}}^{${angleTex(Q.b)}} \\left(${Q.tex[0]} - ${Q.tex[1]}\\right)dx = ${fmt(area, 5)}$`);
    }
    sx.input.min = P[k].a; sx.input.max = P[k].b;
    upd();
  };

  /* ========== 11. Volumes of revolution (3D) ========== */
  W.volume = (host, params = {}) => {
    const w = box(host); const c = controls(w);
    const fs = { sqrt: { tex: '\\sqrt{x}', f: Math.sqrt }, lin: { tex: '\\frac{x}{2} + \\frac12', f: x => x / 2 + 0.5 }, sq: { tex: '\\frac{x^2}{2}', f: x => x * x / 2 }, bump: { tex: '1 + \\frac{\\sin(2x)}{2}', f: x => 1 + Math.sin(2 * x) / 2 } };
    let k = 'sqrt', mode = params.mode || 'disk';
    chips(c, { options: Object.keys(fs).map(k => [k, '$' + fs[k].tex + '$']), value: k, onChange: v => { k = v; upd(); } });
    chips(c, { options: [['disk', 'Disks (about $x$-axis)'], ['shell', 'Shells (about $y$-axis)']], value: mode, onChange: v => { mode = v; upd(); } });
    const sb = slider(c, { label: 'right end $b$', min: 0.5, max: 2.5, step: 0.05, value: 2, onInput: upd });
    const ss = slider(c, { label: 'slice position', min: 0, max: 1, step: 0.01, value: 0.6, fmt: v => Math.round(v * 100) + '%', onInput: upd });
    const row = el('div', { class: 'wrow' }); w.append(row);
    const left = el('div'), right = el('div'); row.append(left, right);
    const p = new CL.Plot(left, { xmin: -0.5, xmax: 3, ymin: -0.5, ymax: 2.5, height: 300, pan: false, zoom: false });
    const v3 = new CL.View3D(right, { height: 300, range: 1.75 });
    const r = readout(w);
    function upd() {
      const f = fs[k].f, b = sb.value, a = 0, xs = a + (b - a) * ss.value, dx = 0.07;
      const V = mode === 'disk' ? PI * simpson(x => f(x) ** 2, a, b) : 2 * PI * simpson(x => x * f(x), a, b);
      p.set([{ type: 'area', f, a, b, color: 1, alpha: 0.22 }, { type: 'fn', f, color: 1, width: 3, domain: [0, 3] },
        { type: 'custom', draw(ctx, pl, pal) { ctx.fillStyle = CL.graph.withAlpha(pal.c[1], 0.7); ctx.fillRect(pl.X(xs - dx / 2), pl.Y(f(xs)), pl.X(xs + dx / 2) - pl.X(xs - dx / 2), pl.Y(0) - pl.Y(f(xs))); } },
        mode === 'disk' ? { type: 'segment', x1: -0.4, y1: 0, x2: 2.9, y2: 0, color: 4, width: 2, dash: true, label: 'axis' } : { type: 'segment', x1: 0, y1: -0.4, x2: 0, y2: 2.4, color: 4, width: 2, dash: true, label: 'axis' }]);
      v3.scene = (V3, P) => {
        const N = 28, M = 32, quads = [];
        if (mode === 'disk') {
          for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
            const x0 = a + (b - a) * i / N, x1 = a + (b - a) * (i + 1) / N, t0 = 2 * PI * j / M, t1 = 2 * PI * (j + 1) / M;
            const S = (x, t) => [x - b / 2, f(x) * Math.cos(t), f(x) * Math.sin(t)];
            quads.push([S(x0, t0), S(x1, t0), S(x1, t1), S(x0, t1)]);
          }
          V3.surface(quads, P.c[0], { alpha: 0.55 });
          const ring = U.range(0, 40).map(j => { const t = 2 * PI * j / 40; return [xs - b / 2, f(xs) * Math.cos(t), f(xs) * Math.sin(t)]; });
          V3.line(ring, P.c[1], 3.5);
        } else {
          for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
            const x0 = a + (b - a) * i / N, x1 = a + (b - a) * (i + 1) / N, t0 = 2 * PI * j / M, t1 = 2 * PI * (j + 1) / M;
            const S = (x, t) => [x * Math.cos(t), x * Math.sin(t), f(x) - 1];
            quads.push([S(x0, t0), S(x1, t0), S(x1, t1), S(x0, t1)]);
          }
          V3.surface(quads, P.c[0], { alpha: 0.45 });
          for (const z of [0, 1]) V3.line(U.range(0, 40).map(j => { const t = 2 * PI * j / 40; return [xs * Math.cos(t), xs * Math.sin(t), z ? f(xs) - 1 : -1]; }), P.c[1], 3);
          for (let j = 0; j < 8; j++) { const t = 2 * PI * j / 8; V3.line([[xs * Math.cos(t), xs * Math.sin(t), -1], [xs * Math.cos(t), xs * Math.sin(t), f(xs) - 1]], P.c[1], 1.5); }
        }
      };
      v3.draw();
      r.set(mode === 'disk' ? `Each slice is a **disk** of radius $f(x)$ and thickness $dx$: volume $\\pi[f(x)]^2\\,dx$.\n\n$V = \\pi\\displaystyle\\int_0^{${fmt(b, 2)}} \\left(${fs[k].tex}\\right)^2dx \\approx ${fmt(V, 5)}$` : `Each slice becomes a **cylindrical shell** of radius $x$, height $f(x)$, thickness $dx$: volume $2\\pi x f(x)\\,dx$.\n\n$V = 2\\pi\\displaystyle\\int_0^{${fmt(b, 2)}} x\\left(${fs[k].tex}\\right)dx \\approx ${fmt(V, 5)}$`);
    }
    upd();
  };

  /* ========== 12. Arc length ========== */
  W.arcLength = (host) => {
    const w = box(host); const c = controls(w);
    const fs = { sin: { tex: '\\sin x', f: Math.sin, d: Math.cos, a: 0, b: PI }, sq: { tex: 'x^2', f: x => x * x, d: x => 2 * x, a: 0, b: 1.5 }, sem: { tex: '\\sqrt{4 - x^2}', f: x => Math.sqrt(Math.max(0, 4 - x * x)), d: x => -x / Math.sqrt(4 - x * x), a: -1.9, b: 1.9 }, cube: { tex: '\\frac{2}{3}x^{3/2}', f: x => 2 / 3 * x ** 1.5, d: x => Math.sqrt(x), a: 0, b: 3 } };
    let k = 'sin';
    chips(c, { options: Object.keys(fs).map(k => [k, '$' + fs[k].tex + '$']), value: k, onChange: v => { k = v; upd(); } });
    const sn = slider(c, { label: 'segments $n$', min: 1, max: 40, step: 1, value: 3, onInput: upd });
    const p = new CL.Plot(w, { xmin: -2.5, xmax: 3.5, ymin: -0.8, ymax: 2.8, height: 280, equal: true });
    const r = readout(w);
    function upd() {
      const F = fs[k], n = sn.value; const pts = U.range(0, n).map(i => { const x = F.a + (F.b - F.a) * i / n; return [x, F.f(x)]; });
      let L = 0; for (let i = 1; i <= n; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      const exact = simpson(x => Math.sqrt(1 + F.d(x) ** 2), F.a + 1e-9, F.b - 1e-9, 2000);
      p.set([{ type: 'fn', f: F.f, color: 1, width: 3, domain: [F.a, F.b] }, { type: 'poly', pts, color: 2, width: 2, dots: true }]);
      r.set(`Polygon with $n = ${n}$ segments: length $\\approx ${fmt(L, 6)}$ · True arc length $\\displaystyle\\int\\sqrt{1 + (f')^2}\\,dx \\approx ${fmt(exact, 6)}$\n\nEach segment has length $\\sqrt{\\Delta x^2 + \\Delta y^2} = \\sqrt{1 + (\\Delta y/\\Delta x)^2}\\,\\Delta x$ — that's where the formula comes from.`);
    }
    upd();
  };

  /* ========== 13. Slope field + Euler ========== */
  W.slopeField = (host) => {
    const w = box(host); const c = controls(w);
    const ODE = { exp: ['y', (x, y) => y], lin: ['x', (x, y) => x], xy: ['x - y', (x, y) => x - y], logi: ['y\\left(1 - \\frac{y}{4}\\right)', (x, y) => y * (1 - y / 4)], circ: ['-\\frac{x}{y}', (x, y) => -x / y] };
    let k = 'xy', euler = true;
    chips(c, { label: "$y' =$", options: Object.keys(ODE).map(k => [k, '$' + ODE[k][0] + '$']), value: k, onChange: v => { k = v; upd(); } });
    const sh = slider(c, { label: 'Euler step $h$', min: 0.05, max: 1, step: 0.05, value: 0.5, onInput: upd });
    toggle(c, "Show Euler's method", true, v => { euler = v; upd(); });
    const p = new CL.Plot(w, { xmin: -4, xmax: 4, ymin: -3, ymax: 5, height: 340, equal: true });
    const r = readout(w);
    const pt = { type: 'point', x: -2, y: 1, color: 'accent', label: 'initial point', drag: (x, y) => [x, y] };
    function rk(f, x0, y0, x1, n = 400) { const pts = [[x0, y0]]; const h = (x1 - x0) / n; let x = x0, y = y0; for (let i = 0; i < n; i++) { const k1 = f(x, y), k2 = f(x + h / 2, y + h * k1 / 2), k3 = f(x + h / 2, y + h * k2 / 2), k4 = f(x + h, y + h * k3); y += h / 6 * (k1 + 2 * k2 + 2 * k3 + k4); x += h; if (!isFinite(y) || Math.abs(y) > 50) break; pts.push([x, y]); } return pts; }
    function upd() {
      const f = ODE[k][1];
      const sol = rk(f, pt.x, pt.y, 5).concat().reverse().concat(rk(f, pt.x, pt.y, -5).slice(1)).sort((a, b) => a[0] - b[0]);
      const L = [{ type: 'field', f, color: 'text', nx: 22 }, { type: 'poly', pts: sol, color: 1, width: 3 }];
      let eu = [[pt.x, pt.y]]; const h = sh.value;
      if (euler) { let x = pt.x, y = pt.y; for (let i = 0; i < 4 / h && x < 4; i++) { y += h * f(x, y); x += h; if (!isFinite(y)) break; eu.push([x, y]); } L.push({ type: 'poly', pts: eu, color: 2, width: 2, dots: true }); }
      L.push(pt); p.layers = L; p.draw();
      r.set(`Drag the initial point. **Blue**: the true solution through it. ${euler ? `**Orange**: Euler's method with $h = ${fmt(h, 2)}$ — follow the slope for a step, then re-measure. Smaller $h$ ⇒ closer to the truth.` : ''}`);
    }
    const od = pt.drag; pt.drag = (x, y) => { pt.x = x; pt.y = y; setTimeout(upd); return [x, y]; };
    upd();
  };

  /* ========== 14. Sequences ========== */
  W.sequencePlot = (host) => {
    const w = box(host); const c = controls(w);
    const SQ = { inv: ['\\frac{1}{n}', n => 1 / n, 0], alt: ['\\frac{(-1)^n}{n}', n => (-1) ** n / n, 0], ratio: ['\\frac{n}{n+1}', n => n / (n + 1), 1], e: ['\\left(1 + \\frac1n\\right)^n', n => (1 + 1 / n) ** n, Math.E], osc: ['(-1)^n', n => (-1) ** n, null], sinn: ['\\frac{\\sin n}{\\sqrt{n}}', n => Math.sin(n) / Math.sqrt(n), 0] };
    let k = 'e';
    chips(c, { options: Object.keys(SQ).map(k => [k, '$' + SQ[k][0] + '$']), value: k, onChange: v => { k = v; upd(); } });
    const sN = slider(c, { label: 'terms $N$', min: 5, max: 200, step: 1, value: 30, onInput: upd });
    const p = new CL.Plot(w, { xmin: -2, xmax: 32, ymin: -1.5, ymax: 3.2, height: 280 });
    const r = readout(w);
    function upd() {
      const [tex, f, L] = SQ[k], N = sN.value;
      p.setView(-N * 0.05, N * 1.05, -1.5, 3.2);
      const pts = U.range(1, N).map(n => [n, f(n)]);
      p.set([...(L !== null ? [{ type: 'hline', y: L, color: 3, dash: true, width: 1.5, label: 'limit' }] : []), { type: 'dots', pts, color: 1, r: N > 80 ? 2 : 3.5 }]);
      r.set(`$a_n = ${tex}$: $a_{${N}} = ${fmt(f(N), 6)}$. ${L !== null ? `Converges to $${L === Math.E ? 'e \\approx 2.71828' : L}$.` : 'Keeps bouncing — **diverges**.'}`);
    }
    upd();
  };

  /* ========== 15. Series partial sums ========== */
  W.seriesSums = (host, params = {}) => {
    const w = box(host); const c = controls(w);
    const SE = {
      geo: { tex: r => `\\sum_{n=0}^\\infty \\left(${fmt(r, 2)}\\right)^n`, a: (n, r) => r ** n, n0: 0, sum: r => Math.abs(r) < 1 ? 1 / (1 - r) : null },
      harm: { tex: () => '\\sum_{n=1}^\\infty \\frac{1}{n}', a: n => 1 / n, n0: 1, sum: () => null },
      p: { tex: p => `\\sum_{n=1}^\\infty \\frac{1}{n^{${fmt(p, 2)}}}`, a: (n, p) => 1 / n ** p, n0: 1, sum: p => p === 2 ? PI * PI / 6 : null },
      altharm: { tex: () => '\\sum_{n=1}^\\infty \\frac{(-1)^{n+1}}{n}', a: n => (-1) ** (n + 1) / n, n0: 1, sum: () => Math.LN2 },
      fact: { tex: () => '\\sum_{n=0}^\\infty \\frac{1}{n!}', a: n => 1 / U.fact(n), n0: 0, sum: () => Math.E }
    };
    let k = params.series || 'geo';
    chips(c, { options: [['geo', 'Geometric'], ['harm', 'Harmonic'], ['p', 'p-series'], ['altharm', 'Alt. harmonic'], ['fact', '$\\sum 1/n!$']], value: k, onChange: v => { k = v; upd(); } });
    const sr = slider(c, { label: 'ratio $r$', min: -1.2, max: 1.2, step: 0.05, value: 0.5, onInput: upd });
    const sp = slider(c, { label: '$p$', min: 0.5, max: 3, step: 0.1, value: 2, onInput: upd });
    const sN = slider(c, { label: 'terms $N$', min: 1, max: 100, step: 1, value: 15, onInput: upd });
    const p = new CL.Plot(w, { height: 280 });
    const r = readout(w);
    function upd() {
      const S = SE[k]; sr.show(k === 'geo'); sp.show(k === 'p');
      const par = k === 'geo' ? sr.value : sp.value, N = sN.value;
      let s = 0; const sums = [], terms = [];
      for (let i = 0; i < N; i++) { const n = S.n0 + i; const t = S.a(n, par); s += t; sums.push([i + 1, s]); terms.push({ x0: i + 0.6, x1: i + 1.4, y: t }); }
      const lim = S.sum(par);
      const ys = sums.map(q => q[1]).concat(terms.map(t => t.y)); const lo = Math.min(0, ...ys), hi = Math.max(1, ...ys.filter(isFinite));
      p.setView(-1, N + 2, lo - 0.3, Math.min(hi, 60) + 0.5);
      p.set([{ type: 'rects', rects: terms, color: 2, signed: true, alpha: 0.35 }, ...(lim !== null ? [{ type: 'hline', y: lim, color: 3, dash: true, width: 1.5, label: 'sum' }] : []), { type: 'dots', pts: sums, color: 1, r: 3.5 }]);
      r.set(`$${S.tex(par)}$\n\nOrange bars: terms $a_n$. Blue dots: partial sums $S_N$. $S_{${N}} = ${fmt(s, 6)}$. ${lim !== null ? `Converges to $${fmt(lim, 6)}$.` : (k === 'geo' && Math.abs(par) >= 1 ? '$|r| \\ge 1$ — **diverges**.' : k === 'p' && par <= 1 ? '$p \\le 1$ — **diverges** (slowly!).' : k === 'p' ? 'Converges (by the p-test).' : 'Terms → 0 but the sums grow forever — **diverges**.')}`);
    }
    upd();
  };

  /* ========== 16. Taylor polynomials ========== */
  W.taylor = (host) => {
    const w = box(host); const c = controls(w);
    const TF = {
      sin: { tex: '\\sin x', f: Math.sin, d: (k, a) => Math.sin(a + k * PI / 2), center: true },
      cos: { tex: '\\cos x', f: Math.cos, d: (k, a) => Math.cos(a + k * PI / 2), center: true },
      exp: { tex: 'e^x', f: Math.exp, d: (k, a) => Math.exp(a), center: true },
      ln: { tex: '\\ln(1 + x)', f: x => Math.log(1 + x), d: k => k === 0 ? 0 : (-1) ** (k + 1) * U.fact(k - 1), R: '1' },
      geo: { tex: '\\frac{1}{1 - x}', f: x => 1 / (1 - x), d: k => U.fact(k), R: '1' },
      atan: { tex: '\\arctan x', f: Math.atan, d: k => k % 2 === 0 ? 0 : (-1) ** ((k - 1) / 2) * U.fact(k - 1), R: '1' }
    };
    let k = 'sin';
    chips(c, { options: Object.keys(TF).map(k => [k, '$' + TF[k].tex + '$']), value: k, onChange: v => { k = v; sa.show(!!TF[k].center); if (!TF[k].center) sa.value = 0; upd(); } });
    const sn = slider(c, { label: 'degree $n$', min: 0, max: 20, step: 1, value: 3, onInput: upd });
    const sa = slider(c, { label: 'center $a$', min: -3, max: 3, step: 0.1, value: 0, onInput: upd });
    const p = new CL.Plot(w, { xmin: -7, xmax: 7, ymin: -3, ymax: 3, height: 320, trace: true });
    const r = readout(w);
    function upd() {
      const F = TF[k], n = sn.value, a = F.center ? sa.value : 0;
      const co = U.range(0, n).map(j => F.d(j, a) / U.fact(j));
      const T = x => co.reduce((s, cj, j) => s + cj * (x - a) ** j, 0);
      p.set([{ type: 'fn', f: F.f, color: 1, width: 3, trace: false }, { type: 'fn', f: T, color: 2, width: 2.5 }, { type: 'point', x: a, y: F.f(a), color: 'text' }]);
      const v = a === 0 ? 'x' : `(x ${a > 0 ? '-' : '+'} ${fmt(Math.abs(a), 2)})`;
      const terms = co.map((cj, j) => [cj, j]).filter(([cj]) => Math.abs(cj) > 1e-12).slice(0, 6).map(([cj, j]) => { const fr = CL.gen.H.piFrac ? null : null; const s = j === 0 ? fmt(cj, 4) : (Math.abs(Math.abs(cj) - 1) < 1e-12 ? (cj < 0 ? '-' : '') : fmt(cj, 4)) + (j === 1 ? v : v + '^{' + j + '}'); return s; });
      r.set(`$T_{${n}}(x) = ${terms.join(' + ').replace(/\+ -/g, '- ') || '0'}${co.filter(x => Math.abs(x) > 1e-12).length > 6 ? ' + \\cdots' : ''}$\n\nHigher degree ⇒ the orange polynomial hugs the blue curve over a wider range.${F.R ? ' But for this function it can never go past $|x| < ' + F.R + '$ — the radius of convergence!' : ''}`);
    }
    upd();
  };

  /* ========== 17. Power series convergence at a point ========== */
  W.convergence = (host) => {
    const w = box(host); const c = controls(w);
    const PS = { geo: ['\\sum x^n', n => 1, '(-1, 1)'], harm: ['\\sum \\frac{x^n}{n}', n => 1 / n, '[-1, 1)'], sq: ['\\sum \\frac{x^n}{n^2}', n => 1 / (n * n), '[-1, 1]'], fact: ['\\sum \\frac{x^n}{n!}', n => 1 / U.fact(n), '(-\\infty, \\infty)'] };
    let k = 'harm';
    chips(c, { options: Object.keys(PS).map(k => [k, '$' + PS[k][0] + '$']), value: k, onChange: v => { k = v; upd(); } });
    const sx = slider(c, { label: '$x$', min: -1.5, max: 1.5, step: 0.05, value: 0.8, onInput: upd });
    const p = new CL.Plot(w, { xmin: -1, xmax: 41, ymin: -3, ymax: 6, height: 260 });
    const nl = new CL.Plot(w, { xmin: -2, xmax: 2, ymin: -0.6, ymax: 0.6, height: 70, pan: false, zoom: false, grid: false, toolbar: false });
    const r = readout(w);
    function upd() {
      const [tex, cf, iv] = PS[k], x = sx.value; let s = 0; const pts = [];
      for (let n = (k === 'harm' || k === 'sq') ? 1 : 0, i = 1; i <= 40; n++, i++) { s += cf(n) * x ** n; pts.push([i, s]); }
      const ys = pts.map(q => q[1]).filter(isFinite); p.setView(-1, 41, Math.max(-50, Math.min(-1, ...ys) - 0.5), Math.min(50, Math.max(2, ...ys) + 0.5), false);
      p.set([{ type: 'dots', pts, color: 1, r: 3 }]);
      const inside = k === 'fact' || Math.abs(x) < 1 - 1e-9 || (Math.abs(Math.abs(x) - 1) < 1e-9 && ((k === 'sq') || (k === 'harm' && x < 0)));
      nl.set([{ type: 'custom', draw(ctx, P, pal) { ctx.strokeStyle = pal.good; ctx.lineWidth = 6; ctx.beginPath(); const l = k === 'fact' ? -2 : -1, rr = k === 'fact' ? 2 : 1; ctx.moveTo(P.X(l), P.Y(0)); ctx.lineTo(P.X(rr), P.Y(0)); ctx.stroke(); if (k !== 'fact') for (const e of [-1, 1]) { const closed = k === 'sq' || (k === 'harm' && e < 0); ctx.beginPath(); ctx.arc(P.X(e), P.Y(0), 6, 0, 7); ctx.fillStyle = closed ? pal.good : pal.bg; ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); } } }, { type: 'point', x, y: 0, color: inside ? 'good' : 'bad', r: 7, label: 'x' }]);
      r.set(`$${tex}$ at $x = ${fmt(x, 2)}$: $S_{40} = ${fmt(s, 5)}$ — ${inside ? '**converges**' : '**diverges**'}. Interval of convergence: $${iv}$.`);
    }
    upd();
  };

  /* ========== 18. Parametric curves ========== */
  W.parametric = (host) => {
    const w = box(host); const c = controls(w);
    const CV = { circle: ['(\\cos t, \\sin t)', t => [Math.cos(t), Math.sin(t)], t => [-Math.sin(t), Math.cos(t)], 2 * PI], ellipse: ['(2\\cos t, \\sin t)', t => [2 * Math.cos(t), Math.sin(t)], t => [-2 * Math.sin(t), Math.cos(t)], 2 * PI], cycloid: ['(t - \\sin t, 1 - \\cos t)', t => [t - Math.sin(t), 1 - Math.cos(t)], t => [1 - Math.cos(t), Math.sin(t)], 4 * PI], liss: ['(\\sin 2t, \\sin 3t)', t => [Math.sin(2 * t), Math.sin(3 * t)], t => [2 * Math.cos(2 * t), 3 * Math.cos(3 * t)], 2 * PI], cusp: ['(t^2, t^3)', t => [t * t, t ** 3], t => [2 * t, 3 * t * t], 1.5] };
    let k = 'circle', vel = true;
    chips(c, { options: Object.keys(CV).map(k => [k, '$' + CV[k][0] + '$']), value: k, onChange: v => { k = v; st.input.max = CV[k][3]; st.input.min = k === 'cusp' ? -1.5 : 0; upd(); } });
    const st = slider(c, { label: '$t$', min: 0, max: 2 * PI, step: 0.01, value: 1, onInput: upd });
    toggle(c, 'Show velocity vector', true, v => { vel = v; upd(); });
    const p = new CL.Plot(w, { xmin: -3, xmax: 3, ymin: -2, ymax: 2.5, height: 320, equal: true });
    const r = readout(w);
    function upd() {
      const [tex, P, V, T1] = CV[k], t = st.value, t0 = k === 'cusp' ? -1.5 : 0; const [x, y] = P(t), [vx, vy] = V(t);
      if (k === 'cycloid') p.setView(-1, 13, -1, 3);
      const L = [{ type: 'param', x: s => P(s)[0], y: s => P(s)[1], t: [t0, T1], color: 'text', width: 1, dash: true }, { type: 'param', x: s => P(s)[0], y: s => P(s)[1], t: [t0, t], color: 1, width: 3 }, { type: 'point', x, y, color: 'accent' }];
      if (vel) L.push({ type: 'segment', x1: x, y1: y, x2: x + vx * 0.5, y2: y + vy * 0.5, arrow: true, color: 2, width: 2.5 });
      p.set(L);
      const dydx = vy / vx;
      r.set(`$(x, y) = ${tex}$ at $t = ${fmt(t, 2)}$: point $(${fmt(x, 3)}, ${fmt(y, 3)})$, velocity $\\langle ${fmt(vx, 3)}, ${fmt(vy, 3)}\\rangle$, speed $${fmt(Math.hypot(vx, vy), 3)}$.\n\n$\\dfrac{dy}{dx} = \\dfrac{dy/dt}{dx/dt} = ${isFinite(dydx) && Math.abs(dydx) < 1e6 ? fmt(dydx, 4) : '\\text{undefined (vertical)}'}$`);
    }
    upd();
  };

  /* ========== 19. Polar curves ========== */
  W.polar = (host) => {
    const w = box(host); const c = controls(w);
    const PC = { card: ['1 + \\cos\\theta', t => 1 + Math.cos(t), 2 * PI], rose3: ['2\\cos 3\\theta', t => 2 * Math.cos(3 * t), PI], rose2: ['2\\sin 2\\theta', t => 2 * Math.sin(2 * t), 2 * PI], lima: ['1 + 2\\sin\\theta', t => 1 + 2 * Math.sin(t), 2 * PI], spiral: ['\\frac{\\theta}{2}', t => t / 2, 4 * PI], circ: ['2\\cos\\theta', t => 2 * Math.cos(t), PI] };
    let k = 'card';
    chips(c, { label: '$r =$', options: Object.keys(PC).map(k => [k, '$' + PC[k][0] + '$']), value: k, onChange: v => { k = v; st.input.max = PC[k][2]; upd(); } });
    const st = slider(c, { label: '$\\theta$', min: 0, max: 2 * PI, step: 0.01, value: 2, fmt: v => '$' + angleTex(v) + '$', onInput: upd });
    const p = new CL.Plot(w, { xmin: -3.5, xmax: 3.5, ymin: -3, ymax: 3, height: 340, equal: true });
    const r = readout(w);
    function upd() {
      const [tex, rf, T1] = PC[k], th = st.value, rr = rf(th);
      const area = 0.5 * simpson(t => rf(t) ** 2, 0, th);
      if (k === 'spiral') p.setView(-7, 7, -6, 6); else p.setView(-3.5, 3.5, -3, 3);
      p.set([{ type: 'polarArea', r: rf, a: 0, b: th, color: 3, alpha: 0.25 }, { type: 'polar', r: rf, t: [0, T1], color: 'text', width: 1, dash: true }, { type: 'polar', r: rf, t: [0, th], color: 1, width: 3 }, { type: 'segment', x1: 0, y1: 0, x2: rr * Math.cos(th), y2: rr * Math.sin(th), color: 2, width: 2 }, { type: 'point', x: rr * Math.cos(th), y: rr * Math.sin(th), color: 'accent' }]);
      r.set(`$r = ${tex}$: at $\\theta = ${angleTex(th)}$, $r = ${fmt(rr, 3)}$${rr < 0 ? ' (negative! the point is plotted in the **opposite** direction)' : ''}.\n\nArea swept so far: $\\frac12\\displaystyle\\int_0^{\\theta} r^2\\,d\\theta \\approx ${fmt(area, 4)}$`);
    }
    upd();
  };

  /* ========== 20. Trig substitution triangle ========== */
  W.trigSubTriangle = (host) => {
    const w = box(host); const c = controls(w);
    let k = 'sin';
    chips(c, { options: [['sin', '$\\sqrt{a^2 - x^2}$'], ['tan', '$\\sqrt{a^2 + x^2}$'], ['sec', '$\\sqrt{x^2 - a^2}$']], value: k, onChange: v => { k = v; upd(); } });
    const sth = slider(c, { label: '$\\theta$', min: 0.15, max: 1.35, step: 0.01, value: 0.6, onInput: upd });
    const p = new CL.Plot(w, { xmin: -0.5, xmax: 4.5, ymin: -0.6, ymax: 3.2, height: 280, equal: true, pan: false, zoom: false, grid: false });
    const r = readout(w);
    function upd() {
      const th = sth.value, a = 2; let adj, opp, hyp, lab;
      if (k === 'sin') { hyp = a; opp = a * Math.sin(th); adj = a * Math.cos(th); lab = { hyp: 'a', opp: 'x', adj: '√(a²−x²)' }; }
      else if (k === 'tan') { adj = a; opp = a * Math.tan(th); hyp = a / Math.cos(th); lab = { hyp: '√(a²+x²)', opp: 'x', adj: 'a' }; }
      else { adj = a; hyp = a / Math.cos(th); opp = a * Math.tan(th); lab = { hyp: 'x', opp: '√(x²−a²)', adj: 'a' }; }
      const s = Math.min(1, 3 / Math.max(opp, adj, 0.01));
      const A0 = [0, 0], B0 = [adj * s, 0], C0 = [adj * s, opp * s];
      p.set([{ type: 'poly', pts: [A0, B0, C0], close: true, fill: true, color: 1, width: 2.5 },
        { type: 'text', x: adj * s / 2, y: -0.25, text: lab.adj, align: 'center', color: 2 }, { type: 'text', x: adj * s + 0.1, y: opp * s / 2, text: lab.opp, color: 2 }, { type: 'text', x: adj * s / 2 - 0.25, y: opp * s / 2 + 0.25, text: lab.hyp, align: 'right', color: 2 }, { type: 'text', x: 0.35, y: 0.12, text: 'θ', color: 'text' },
        { type: 'poly', pts: [[adj * s - 0.18, 0], [adj * s - 0.18, 0.18], [adj * s, 0.18]], color: 'text', width: 1 }]);
      const M = { sin: ['x = a\\sin\\theta', 'dx = a\\cos\\theta\\,d\\theta', '\\sqrt{a^2 - x^2} = a\\cos\\theta', '1 - \\sin^2\\theta = \\cos^2\\theta'], tan: ['x = a\\tan\\theta', 'dx = a\\sec^2\\theta\\,d\\theta', '\\sqrt{a^2 + x^2} = a\\sec\\theta', '1 + \\tan^2\\theta = \\sec^2\\theta'], sec: ['x = a\\sec\\theta', 'dx = a\\sec\\theta\\tan\\theta\\,d\\theta', '\\sqrt{x^2 - a^2} = a\\tan\\theta', '\\sec^2\\theta - 1 = \\tan^2\\theta'] }[k];
      r.set(`Substitute $${M[0]}$, so $${M[1]}$ and $${M[2]}$ (using $${M[3]}$).\n\nTo convert back to $x$, read any trig ratio off the triangle — e.g. $\\sin\\theta = \\frac{\\text{opp}}{\\text{hyp}}$.`);
    }
    upd();
  };

  /* ========== 21. L'Hôpital zoom ========== */
  W.lhopital = (host) => {
    const w = box(host); const c = controls(w);
    const PR = { sin: ['\\sin x', 'x', Math.sin, x => x, 0, 1, 1], exp: ['e^{x} - 1', '2x', x => Math.exp(x) - 1, x => 2 * x, 0, 1, 2], ln: ['\\ln x', 'x - 1', Math.log, x => x - 1, 1, 1, 1], cos: ['1 - \\cos x', '\\sin x', x => 1 - Math.cos(x), Math.sin, 0, 0, 1] };
    let k = 'exp';
    chips(c, { options: Object.keys(PR).map(k => [k, '$\\frac{' + PR[k][0] + '}{' + PR[k][1] + '}$']), value: k, onChange: v => { k = v; upd(); } });
    const sz = slider(c, { label: 'zoom', min: 0, max: 3, step: 0.05, value: 0, fmt: v => fmt(10 ** v, 1) + '×', onInput: upd });
    const p = new CL.Plot(w, { height: 300, pan: false });
    const r = readout(w);
    function upd() {
      const [tf, tg, f, g, a, fp, gp] = PR[k]; const s = 2 / 10 ** sz.value;
      p.setView(a - s, a + s, -s * 1.2, s * 1.2);
      p.set([{ type: 'fn', f, color: 1, width: 3, label: 'f' }, { type: 'fn', f: g, color: 2, width: 3, label: 'g' }, { type: 'point', x: a, y: 0, color: 'text' }]);
      const x = a + s / 2;
      r.set(`At $x = ${fmt(x, 5)}$: $\\dfrac{f(x)}{g(x)} = ${fmt(f(x) / g(x), 6)}$ while $\\dfrac{f'(${a})}{g'(${a})} = ${fmt(fp / gp, 6)}$.\n\nZoom in: both curves look like **straight lines** through the same point, so their ratio becomes the ratio of their slopes — that's L'Hôpital's rule.`);
    }
    upd();
  };

  /* ========== 22. Optimization box ========== */
  W.optimizationBox = (host) => {
    const w = box(host); const c = controls(w);
    const S = 12;
    const sx = slider(c, { label: 'cut size $x$ (in)', min: 0.1, max: 5.9, step: 0.05, value: 1, onInput: upd });
    const row = el('div', { class: 'wrow' }); w.append(row); const L = el('div'), Rr = el('div'); row.append(L, Rr);
    const sheet = new CL.Plot(L, { xmin: -1, xmax: 13, ymin: -1, ymax: 13, height: 260, equal: true, pan: false, zoom: false, grid: false });
    const p = new CL.Plot(Rr, { xmin: -0.3, xmax: 6.3, ymin: -20, ymax: 150, height: 260, pan: false, zoom: false });
    const r = readout(w);
    const V = x => x * (S - 2 * x) ** 2;
    function upd() {
      const x = sx.value;
      sheet.set([{ type: 'poly', pts: [[0, 0], [S, 0], [S, S], [0, S]], close: true, fill: true, color: 1, width: 2 }, ...[[0, 0], [S - x, 0], [0, S - x], [S - x, S - x]].map(([a, b]) => ({ type: 'poly', pts: [[a, b], [a + x, b], [a + x, b + x], [a, b + x]], close: true, fill: true, fillAlpha: 0.9, color: 'bad', width: 1 })), { type: 'poly', pts: [[x, x], [S - x, x], [S - x, S - x], [x, S - x]], close: true, color: 'text', dash: true, width: 1 }]);
      p.set([{ type: 'fn', f: V, color: 1, width: 3, domain: [0, 6] }, { type: 'point', x, y: V(x), color: 'accent' }, { type: 'point', x: 2, y: 128, color: 3, label: 'max' }]);
      r.set(`Cut $x$-inch squares from a $12\\times12$ sheet and fold: $V(x) = x(12 - 2x)^2 = ${fmt(V(x), 2)}$ in³.\n\n$V'(x) = (12 - 2x)(12 - 6x) = 0 \\Rightarrow x = 2$, giving the **max** $V = 128$ in³.`);
    }
    upd();
  };

  /* ========== 23. Mean value theorem ========== */
  W.mvt = (host) => {
    const w = box(host); const c = controls(w);
    const sa = slider(c, { label: '$a$', min: -2.5, max: 0.5, step: 0.05, value: -2, onInput: upd });
    const sb = slider(c, { label: '$b$', min: 0.8, max: 2.5, step: 0.05, value: 2, onInput: upd });
    const F = FN.cubic;
    const p = new CL.Plot(w, { xmin: -3, xmax: 3, ymin: -5, ymax: 5, height: 300 });
    const r = readout(w);
    function upd() {
      const a = sa.value, b = sb.value, m = (F.f(b) - F.f(a)) / (b - a);
      // f'(c) = 3c^2 - 3 = m
      const c2 = (m + 3) / 3; const cs = c2 >= 0 ? [Math.sqrt(c2), -Math.sqrt(c2)].filter(x => x > a && x < b) : [];
      p.set([{ type: 'fn', f: F.f, color: 1, width: 3 }, { type: 'segment', x1: a, y1: F.f(a), x2: b, y2: F.f(b), color: 2, width: 2.5 }, { type: 'point', x: a, y: F.f(a), color: 2 }, { type: 'point', x: b, y: F.f(b), color: 2 }, ...cs.flatMap(cc => [{ type: 'line', x0: cc, y0: F.f(cc), m, color: 3, dash: true, width: 2 }, { type: 'point', x: cc, y: F.f(cc), color: 3, label: 'c' }])]);
      r.set(`$f(x) = x^3 - 3x$ on $[${fmt(a, 2)}, ${fmt(b, 2)}]$: average slope $= ${fmt(m, 4)}$. Tangent(s) parallel to the secant at $c = ${cs.map(x => fmt(x, 4)).join(', ')}$.\n\nThe MVT promises at least one such $c$ for any smooth function.`);
    }
    upd();
  };

  /* ========== 24. Vectors ========== */
  W.vectors2d = (host) => {
    const w = box(host); const c = controls(w);
    let proj = false; toggle(c, 'Show projection of $\\mathbf u$ onto $\\mathbf v$', false, v => { proj = v; upd(); });
    const p = new CL.Plot(w, { xmin: -5, xmax: 5, ymin: -4, ymax: 4, height: 340, equal: true });
    const r = readout(w);
    const snap = (x, y) => [Math.round(x * 2) / 2, Math.round(y * 2) / 2];
    const u = { type: 'point', x: 3, y: 1, color: 1, label: 'u', drag: snap }, v = { type: 'point', x: 1, y: 2.5, color: 2, label: 'v', drag: snap };
    function upd() {
      const dot = u.x * v.x + u.y * v.y, nu = Math.hypot(u.x, u.y), nv = Math.hypot(v.x, v.y);
      const ang = nu && nv ? Math.acos(Math.max(-1, Math.min(1, dot / (nu * nv)))) * 180 / PI : 0;
      const L = [{ type: 'segment', x1: u.x, y1: u.y, x2: u.x + v.x, y2: u.y + v.y, color: 'text', dash: true, width: 1 }, { type: 'segment', x1: v.x, y1: v.y, x2: u.x + v.x, y2: u.y + v.y, color: 'text', dash: true, width: 1 }, { type: 'segment', x1: 0, y1: 0, x2: u.x + v.x, y2: u.y + v.y, color: 3, arrow: true, width: 2.5, label: 'u+v' }, { type: 'segment', x1: 0, y1: 0, x2: u.x, y2: u.y, color: 1, arrow: true, width: 3 }, { type: 'segment', x1: 0, y1: 0, x2: v.x, y2: v.y, color: 2, arrow: true, width: 3 }];
      if (proj && nv) { const k = dot / (nv * nv); L.push({ type: 'segment', x1: 0, y1: 0, x2: k * v.x, y2: k * v.y, color: 4, width: 5 }, { type: 'segment', x1: u.x, y1: u.y, x2: k * v.x, y2: k * v.y, color: 4, dash: true, width: 1.5 }); }
      L.push(u, v); p.layers = L; p.draw();
      r.set(`$\\mathbf u = \\langle ${u.x}, ${u.y}\\rangle$, $\\mathbf v = \\langle ${v.x}, ${v.y}\\rangle$, $\\mathbf u + \\mathbf v = \\langle ${u.x + v.x}, ${u.y + v.y}\\rangle$\n\n$\\mathbf u\\cdot\\mathbf v = ${fmt(dot, 3)}$ · $\\|\\mathbf u\\| = ${fmt(nu, 3)}$ · $\\|\\mathbf v\\| = ${fmt(nv, 3)}$ · angle $\\approx ${fmt(ang, 1)}^\\circ$${Math.abs(dot) < 1e-9 ? ' — **orthogonal!**' : ''}`);
    }
    for (const q of [u, v]) { const od = q.drag; q.drag = (x, y) => { const s = od(x, y); q.x = s[0]; q.y = s[1]; setTimeout(upd); return s; }; }
    upd();
  };

  /* ========== 25. Surfaces z = f(x, y) ========== */
  W.surface3d = (host) => {
    const w = box(host); const c = controls(w);
    const SF = { bowl: ['x^2 + y^2', (x, y) => (x * x + y * y) / 2], saddle: ['x^2 - y^2', (x, y) => (x * x - y * y) / 2], wave: ['\\sin x\\cos y', (x, y) => Math.sin(x) * Math.cos(y)], bump: ['2e^{-(x^2+y^2)}', (x, y) => 2 * Math.exp(-(x * x + y * y))], plane: ['1 - \\frac{x}{2} - \\frac{y}{3}', (x, y) => 1 - x / 2 - y / 3] };
    let k = 'saddle';
    chips(c, { label: '$z =$', options: Object.keys(SF).map(k => [k, '$' + SF[k][0] + '$']), value: k, onChange: v => { k = v; upd(); } });
    const sy = slider(c, { label: 'trace plane $y = c$', min: -2, max: 2, step: 0.05, value: 0.5, onInput: upd });
    const v3 = new CL.View3D(w, { height: 360, range: 2.4 });
    const r = readout(w);
    function upd() {
      const f = SF[k][1], c0 = sy.value, N = 24, R0 = 2;
      v3.scene = (V, P) => {
        const quads = [];
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
          const x0 = -R0 + 2 * R0 * i / N, x1 = -R0 + 2 * R0 * (i + 1) / N, y0 = -R0 + 2 * R0 * j / N, y1 = -R0 + 2 * R0 * (j + 1) / N;
          quads.push([[x0, y0, f(x0, y0)], [x1, y0, f(x1, y0)], [x1, y1, f(x1, y1)], [x0, y1, f(x0, y1)]].map(q => [q[0], q[1], Math.max(-2.5, Math.min(2.5, q[2]))]));
        }
        V.surface(quads, (q, sh) => { const z = (q[0][2] + q[2][2]) / 2; const tt = Math.max(0, Math.min(1, (z + 2) / 4)); return CL.graph.shadeColor(tt > 0.5 ? P.c[1] : P.c[0], 0.5 + 0.5 * sh); });
        V.line(U.range(0, 60).map(i => { const x = -R0 + 2 * R0 * i / 60; return [x, c0, f(x, c0)]; }), P.c[2], 4);
      };
      v3.draw();
      r.set(`Drag to rotate. The green curve is the **trace** where the plane $y = ${fmt(c0, 2)}$ slices the surface — its slope is the partial derivative $\\frac{\\partial z}{\\partial x}$. This is where Calc 3 begins!`);
    }
    upd();
  };

  /* ========== 26. Tabular integration by parts ========== */
  W.tabularIBP = (host) => {
    const w = box(host); const c = controls(w);
    const PR = {
      a: { int: 'x^2e^{x}', D: ['x^2', '2x', '2', '0'], I: ['e^{x}', 'e^{x}', 'e^{x}', 'e^{x}'], ans: 'x^2e^x - 2xe^x + 2e^x' },
      b: { int: 'x^3\\sin x', D: ['x^3', '3x^2', '6x', '6', '0'], I: ['\\sin x', '-\\cos x', '-\\sin x', '\\cos x', '\\sin x'], ans: '-x^3\\cos x + 3x^2\\sin x + 6x\\cos x - 6\\sin x' },
      c: { int: 'x^2\\cos 2x', D: ['x^2', '2x', '2', '0'], I: ['\\cos 2x', '\\frac{1}{2}\\sin 2x', '-\\frac{1}{4}\\cos 2x', '-\\frac{1}{8}\\sin 2x'], ans: '\\frac{x^2}{2}\\sin 2x + \\frac{x}{2}\\cos 2x - \\frac{1}{4}\\sin 2x' }
    };
    let k = 'a', shown = 1;
    chips(c, { options: Object.keys(PR).map(k => [k, '$\\int ' + PR[k].int + '\\,dx$']), value: k, onChange: v => { k = v; shown = 1; upd(); } });
    button(c, 'Next row ▸', () => { shown = Math.min(PR[k].D.length, shown + 1); upd(); });
    button(c, 'Reset', () => { shown = 1; upd(); }, 'btn btn-sm btn-ghost');
    const tbl = el('div', { class: 'wtable' }); w.append(tbl);
    const r = readout(w);
    function upd() {
      const P = PR[k]; const rows = P.D.map((d, i) => i < shown ? `| $${i % 2 ? '-' : '+'}$ | $${d}$ | $${P.I[i]}$ |` : '| | | |');
      tbl.innerHTML = CL.md(`| sign | $D$ (differentiate $u$) | $I$ (integrate $dv$) |\n|---|---|---|\n${rows.join('\n')}`);
      r.set(shown >= P.D.length ? `Multiply **diagonally** (each $D$ with the $I$ one row down) using the signs, and stop when $D$ hits $0$:\n\n$\\displaystyle\\int ${P.int}\\,dx = ${P.ans} + C$` : 'Keep differentiating $u$ until it becomes $0$, integrating $dv$ alongside.');
    }
    upd();
  };

  CL.widgets = W;
  CL.wkit = { slider, chips, toggle, readout, button, box, controls, inl, simpson };
})();
