/* Interactive 2D plotting (Plot) and simple 3D wireframe/surface viewer (View3D). */
(function () {
  'use strict';
  const CL = (window.CL = window.CL || {});
  const live = new Set();

  function cssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }
  function palette() {
    return {
      bg: cssVar('--plot-bg', '#fff'), grid: cssVar('--plot-grid', '#eee'), grid2: cssVar('--plot-grid-2', '#f5f5f5'),
      axis: cssVar('--plot-axis', '#444'), text: cssVar('--plot-text', '#555'), accent: cssVar('--accent', '#5b5bd6'),
      c: [1, 2, 3, 4, 5, 6].map(i => cssVar('--c' + i, '#5b5bd6')), good: cssVar('--good', '#1a9e5a'), bad: cssVar('--bad', '#d33')
    };
  }
  function colorOf(c, P) {
    if (typeof c === 'number') return P.c[(c - 1) % P.c.length];
    if (!c) return P.c[0];
    if (c === 'accent') return P.accent;
    if (c === 'text') return P.text;
    if (c === 'good') return P.good;
    if (c === 'bad') return P.bad;
    return c;
  }
  function withAlpha(col, a) {
    if (col.startsWith('#')) {
      let h = col.slice(1); if (h.length === 3) h = h.split('').map(x => x + x).join('');
      const n = parseInt(h, 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
    }
    if (col.startsWith('rgb(')) return col.replace('rgb(', 'rgba(').replace(')', ',' + a + ')');
    return col;
  }
  function niceStep(raw) {
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }
  function fmtTick(v, step) {
    if (Math.abs(v) < step * 1e-6) return '0';
    const d = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
    return (+v.toFixed(d)).toString();
  }
  function piLabel(k, den) { // k * pi/den
    const g = CL.U.gcd(k, den); let n = k / g, d = den / g;
    if (n === 0) return '0';
    const s = n < 0 ? '−' : ''; n = Math.abs(n);
    return s + (n === 1 ? '' : n) + 'π' + (d === 1 ? '' : '/' + d);
  }

  class Plot {
    constructor(host, opts = {}) {
      this.o = Object.assign({ xmin: -5, xmax: 5, ymin: -5, ymax: 5, height: 320, grid: true, pan: true, zoom: true, equal: false, piTicks: false, trace: false, labels: true, toolbar: true, axisLabels: ['x', 'y'] }, opts);
      this.view = { xmin: this.o.xmin, xmax: this.o.xmax, ymin: this.o.ymin, ymax: this.o.ymax };
      this.home = { ...this.view }; this._req = { ...this.view };
      this.layers = [];
      this.wrap = CL.U.el('div', { class: 'plot' });
      this.canvas = CL.U.el('canvas', { 'aria-label': opts.ariaLabel || 'Interactive graph', role: 'img' });
      this.wrap.append(this.canvas);
      this.wrap.style.height = this.o.height + 'px';
      if (this.o.toolbar) {
        const tb = CL.U.el('div', { class: 'plot-tools' },
          CL.U.el('button', { class: 'plot-btn', title: 'Zoom in', 'aria-label': 'Zoom in', onclick: () => this.zoomBy(0.7) }, '+'),
          CL.U.el('button', { class: 'plot-btn', title: 'Zoom out', 'aria-label': 'Zoom out', onclick: () => this.zoomBy(1 / 0.7) }, '−'),
          CL.U.el('button', { class: 'plot-btn', title: 'Reset view', 'aria-label': 'Reset view', onclick: () => this.reset() }, '⟲'));
        this.wrap.append(tb);
      }
      this.readout = CL.U.el('div', { class: 'plot-readout' });
      this.wrap.append(this.readout);
      host.append(this.wrap);
      this.ctx = this.canvas.getContext('2d');
      this._bind();
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this.wrap);
      live.add(this);
      this.resize();
    }
    get W() { return this.wrap.clientWidth; }
    get H() { return this.wrap.clientHeight; }
    X(x) { const v = this.view; return (x - v.xmin) / (v.xmax - v.xmin) * this.W; }
    Y(y) { const v = this.view; return this.H - (y - v.ymin) / (v.ymax - v.ymin) * this.H; }
    ix(px) { const v = this.view; return v.xmin + px / this.W * (v.xmax - v.xmin); }
    iy(py) { const v = this.view; return v.ymin + (this.H - py) / this.H * (v.ymax - v.ymin); }
    setView(xmin, xmax, ymin, ymax, asHome = true) {
      this.view = { xmin, xmax, ymin, ymax };
      if (asHome) { this.home = { ...this.view }; this._req = { ...this.view }; }
      this._fixAspect(); this.draw();
    }
    reset() { this.view = { ...this.home }; this._fixAspect(); this.draw(); }
    zoomBy(f, cx, cy) {
      const v = this.view;
      cx = cx == null ? (v.xmin + v.xmax) / 2 : cx; cy = cy == null ? (v.ymin + v.ymax) / 2 : cy;
      this.view = { xmin: cx - (cx - v.xmin) * f, xmax: cx + (v.xmax - cx) * f, ymin: cy - (cy - v.ymin) * f, ymax: cy + (v.ymax - cy) * f };
      this.draw();
    }
    _fixAspect(box) {
      if (!this.o.equal || !this.W) return;
      // "contain" the requested box: expand whichever dimension is too small for a 1:1 scale
      const b = box || this._req || this.view;
      const cx = (b.xmin + b.xmax) / 2, cy = (b.ymin + b.ymax) / 2;
      let w = b.xmax - b.xmin, h = b.ymax - b.ymin;
      if (w / h > this.W / this.H) h = w * this.H / this.W; else w = h * this.W / this.H;
      this.view = { xmin: cx - w / 2, xmax: cx + w / 2, ymin: cy - h / 2, ymax: cy + h / 2 };
      if (!box) this.home = { ...this.view };
    }
    resize() {
      const dpr = window.devicePixelRatio || 1;
      const W = this.W, H = this.H;
      if (!W || !H) return;
      this.canvas.width = Math.round(W * dpr); this.canvas.height = Math.round(H * dpr);
      this.canvas.style.width = W + 'px'; this.canvas.style.height = H + 'px';
      this.dpr = dpr;
      this._fixAspect();
      this.draw();
    }
    add(layer) { this.layers.push(layer); this.draw(); return layer; }
    clear() { this.layers = []; this.draw(); }
    set(layers) { this.layers = layers; this.draw(); }
    destroy() { this.ro.disconnect(); live.delete(this); }

    _bind() {
      const c = this.canvas;
      const pointers = new Map();
      let drag = null, pinch = null;
      c.style.touchAction = this.o.pan ? 'none' : 'pan-y';
      const pos = e => { const r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      c.addEventListener('pointerdown', e => {
        const [px, py] = pos(e);
        pointers.set(e.pointerId, [px, py]);
        if (pointers.size === 2 && this.o.zoom) {
          const pts = [...pointers.values()];
          pinch = { d: Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]), view: { ...this.view } };
          drag = null; return;
        }
        const hit = this._hitPoint(px, py);
        if (hit) { drag = { pt: hit }; c.setPointerCapture(e.pointerId); e.preventDefault(); return; }
        if (this.o.pan) { drag = { pan: true, px, py, view: { ...this.view } }; c.setPointerCapture(e.pointerId); }
      });
      c.addEventListener('pointermove', e => {
        const [px, py] = pos(e);
        if (pointers.has(e.pointerId)) pointers.set(e.pointerId, [px, py]);
        if (pinch && pointers.size === 2) {
          const pts = [...pointers.values()];
          const d = Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]);
          const f = pinch.d / d; const v = pinch.view;
          const cx = (v.xmin + v.xmax) / 2, cy = (v.ymin + v.ymax) / 2;
          this.view = { xmin: cx - (cx - v.xmin) * f, xmax: cx + (v.xmax - cx) * f, ymin: cy - (cy - v.ymin) * f, ymax: cy + (v.ymax - cy) * f };
          this.draw(); return;
        }
        if (drag && drag.pt) {
          const L = drag.pt; let x = this.ix(px), y = this.iy(py);
          if (L.drag) { const r = L.drag(x, y); if (r) { x = r[0]; y = r[1]; } }
          L.x = x; L.y = y; this.draw(); return;
        }
        if (drag && drag.pan) {
          const v = drag.view; const dx = (px - drag.px) / this.W * (v.xmax - v.xmin), dy = (py - drag.py) / this.H * (v.ymax - v.ymin);
          this.view = { xmin: v.xmin - dx, xmax: v.xmax - dx, ymin: v.ymin + dy, ymax: v.ymax + dy };
          this.draw(); return;
        }
        c.style.cursor = this._hitPoint(px, py) ? 'grab' : (this.o.pan ? 'move' : 'default');
        if (this.o.trace) { this._trace = [px, py]; this.draw(); }
      });
      const up = e => { pointers.delete(e.pointerId); if (pointers.size < 2) pinch = null; if (drag && drag.pt && drag.pt.onEnd) drag.pt.onEnd(); drag = null; };
      c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
      c.addEventListener('pointerleave', () => { if (this._trace) { this._trace = null; this.draw(); } });
      c.addEventListener('wheel', e => {
        if (!this.o.zoom) return;
        if (!(e.ctrlKey || e.metaKey || this.o.wheelZoom)) { this._hint(); return; }
        e.preventDefault();
        const [px, py] = pos(e);
        this.zoomBy(e.deltaY > 0 ? 1.12 : 1 / 1.12, this.ix(px), this.iy(py));
      }, { passive: false });
      c.addEventListener('dblclick', () => this.reset());
    }
    _hint() {
      if (this._hinted) return; this._hinted = true;
      this.readout.textContent = 'Ctrl + scroll to zoom · drag to pan';
      this.readout.classList.add('show');
      setTimeout(() => this.readout.classList.remove('show'), 1600);
    }
    _hitPoint(px, py) {
      for (let i = this.layers.length - 1; i >= 0; i--) {
        const L = this.layers[i];
        if (L.type === 'point' && L.drag && Math.hypot(this.X(L.x) - px, this.Y(L.y) - py) < 16) return L;
      }
      return null;
    }

    draw() {
      if (!this.dpr) return;
      const ctx = this.ctx, W = this.W, H = this.H, P = (this.P = palette());
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      this._grid(ctx, P);
      for (const L of this.layers) { if (L && !L.hidden) { try { this._layer(ctx, L, P); } catch (e) { console.warn('layer', e); } } }
      if (this._trace) this._drawTrace(ctx, P);
      if (this.onDraw) this.onDraw(this);
    }
    _ticks(min, max, pxLen, pi) {
      if (pi) {
        const span = (max - min) / Math.PI;
        const dens = [12, 6, 4, 2, 1, 0.5, 0.25, 0.1];
        let den = 1;
        for (const d of dens) { if (span * d <= pxLen / 55) { den = d; break; } }
        if (den < 1) { const st = niceStep((max - min) / (pxLen / 70)); return { step: st, list: this._lin(min, max, st), lab: v => fmtTick(v, st) }; }
        const st = Math.PI / den; const list = this._lin(min, max, st);
        return { step: st, list, lab: v => piLabel(Math.round(v / st), den) };
      }
      const st = niceStep((max - min) / Math.max(2, pxLen / 75));
      return { step: st, list: this._lin(min, max, st), lab: v => fmtTick(v, st) };
    }
    _lin(min, max, st) { const out = []; for (let v = Math.ceil(min / st) * st; v <= max + st * 1e-9; v += st) out.push(v); return out; }
    _grid(ctx, P) {
      const W = this.W, H = this.H, v = this.view;
      const tx = this._ticks(v.xmin, v.xmax, W, this.o.piTicks);
      const ty = this._ticks(v.ymin, v.ymax, H, false);
      ctx.lineWidth = 1;
      if (this.o.grid && CL.store.setting('graphGrid') !== false) {
        ctx.strokeStyle = P.grid2;
        ctx.beginPath();
        const sx = tx.step / 5, sy = ty.step / 5;
        if (W / ((v.xmax - v.xmin) / sx) > 9) for (const x of this._lin(v.xmin, v.xmax, sx)) { const p = Math.round(this.X(x)) + 0.5; ctx.moveTo(p, 0); ctx.lineTo(p, H); }
        if (H / ((v.ymax - v.ymin) / sy) > 9) for (const y of this._lin(v.ymin, v.ymax, sy)) { const p = Math.round(this.Y(y)) + 0.5; ctx.moveTo(0, p); ctx.lineTo(W, p); }
        ctx.stroke();
        ctx.strokeStyle = P.grid; ctx.beginPath();
        for (const x of tx.list) { const p = Math.round(this.X(x)) + 0.5; ctx.moveTo(p, 0); ctx.lineTo(p, H); }
        for (const y of ty.list) { const p = Math.round(this.Y(y)) + 0.5; ctx.moveTo(0, p); ctx.lineTo(W, p); }
        ctx.stroke();
      }
      // axes
      ctx.strokeStyle = P.axis; ctx.lineWidth = 1.4; ctx.beginPath();
      const ax = U_clamp(this.Y(0), 0, H), ay = U_clamp(this.X(0), 0, W);
      if (v.ymin <= 0 && v.ymax >= 0) { ctx.moveTo(0, Math.round(ax) + 0.5); ctx.lineTo(W, Math.round(ax) + 0.5); }
      if (v.xmin <= 0 && v.xmax >= 0) { ctx.moveTo(Math.round(ay) + 0.5, 0); ctx.lineTo(Math.round(ay) + 0.5, H); }
      ctx.stroke();
      if (!this.o.labels) return;
      ctx.fillStyle = P.text; ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      const ly = U_clamp(ax + 4, 2, H - 14);
      for (const x of tx.list) { if (Math.abs(x) < tx.step * 1e-6) continue; const px = this.X(x); if (px < 10 || px > W - 10) continue; ctx.fillText(tx.lab(x), px, ly); }
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      const lx = U_clamp(ay - 4, 24, W - 2);
      for (const y of ty.list) { if (Math.abs(y) < ty.step * 1e-6) continue; const py = this.Y(y); if (py < 8 || py > H - 8) continue; ctx.fillText(ty.lab(y), lx, py); }
    }
    _path(ctx, f, a, b, step) {
      const W = this.W, H = this.H;
      const x0 = Math.max(a, this.view.xmin), x1 = Math.min(b, this.view.xmax);
      if (x1 <= x0) return;
      const px0 = this.X(x0), px1 = this.X(x1);
      const n = Math.max(2, Math.ceil((px1 - px0) / (step || 1)));
      let pen = false, prev = null;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const x = x0 + (x1 - x0) * i / n;
        let y; try { y = f(x); } catch (e) { y = NaN; }
        if (!isFinite(y)) { pen = false; prev = null; continue; }
        let py = this.Y(y);
        if (prev !== null && Math.abs(py - prev) > H * 1.2 && ((py < 0 && prev > H) || (py > H && prev < 0) || Math.abs(py - prev) > H * 3)) pen = false;
        py = U_clamp(py, -5 * H, 6 * H);
        if (pen) ctx.lineTo(this.X(x), py); else { ctx.moveTo(this.X(x), py); pen = true; }
        prev = py;
      }
      ctx.stroke();
    }
    _layer(ctx, L, P) {
      const col = colorOf(L.color, P);
      ctx.save();
      ctx.lineWidth = L.width || 2.4; ctx.strokeStyle = col; ctx.fillStyle = col;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      if (L.dash) ctx.setLineDash(L.dash === true ? [6, 5] : L.dash);
      if (L.alpha != null && L.type !== 'area' && L.type !== 'rects') ctx.globalAlpha = L.alpha;
      switch (L.type) {
        case 'fn': {
          const d = L.domain || [-Infinity, Infinity];
          this._path(ctx, L.f, d[0], d[1], L.step);
          if (L.label) this._label(ctx, L, P, col);
          break;
        }
        case 'param': case 'polar': {
          const n = L.n || 600; const [t0, t1] = L.t || [0, 2 * Math.PI];
          ctx.beginPath(); let pen = false;
          for (let i = 0; i <= n; i++) {
            const t = t0 + (t1 - t0) * i / n;
            let x, y;
            if (L.type === 'polar') { const r = L.r(t); x = r * Math.cos(t); y = r * Math.sin(t); } else { x = L.x(t); y = L.y(t); }
            if (!isFinite(x) || !isFinite(y)) { pen = false; continue; }
            if (pen) ctx.lineTo(this.X(x), this.Y(y)); else { ctx.moveTo(this.X(x), this.Y(y)); pen = true; }
          }
          ctx.stroke(); break;
        }
        case 'area': {
          const f = L.f, g = L.g || (() => 0), n = L.n || 240;
          const a = L.a, b = L.b;
          if (L.signed) {
            for (const sgn of [1, -1]) {
              ctx.fillStyle = withAlpha(sgn > 0 ? colorOf(L.color || 1, P) : colorOf(L.negColor || 'bad', P), L.alpha || 0.28);
              ctx.beginPath(); ctx.moveTo(this.X(a), this.Y(0));
              for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; let y = f(x); if (!isFinite(y)) y = 0; ctx.lineTo(this.X(x), this.Y(sgn > 0 ? Math.max(0, y) : Math.min(0, y))); }
              ctx.lineTo(this.X(b), this.Y(0)); ctx.closePath(); ctx.fill();
            }
            break;
          }
          ctx.fillStyle = withAlpha(col, L.alpha || 0.28);
          ctx.beginPath();
          for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; let y = f(x); if (!isFinite(y)) y = 0; const p = [this.X(x), U_clamp(this.Y(y), -1e4, 1e4)]; i ? ctx.lineTo(...p) : ctx.moveTo(...p); }
          for (let i = n; i >= 0; i--) { const x = a + (b - a) * i / n; let y = g(x); if (!isFinite(y)) y = 0; ctx.lineTo(this.X(x), U_clamp(this.Y(y), -1e4, 1e4)); }
          ctx.closePath(); ctx.fill(); break;
        }
        case 'polarArea': {
          const n = L.n || 200;
          ctx.fillStyle = withAlpha(col, L.alpha || 0.28); ctx.beginPath(); ctx.moveTo(this.X(0), this.Y(0));
          for (let i = 0; i <= n; i++) { const t = L.a + (L.b - L.a) * i / n; const r = L.r(t); ctx.lineTo(this.X(r * Math.cos(t)), this.Y(r * Math.sin(t))); }
          ctx.closePath(); ctx.fill(); break;
        }
        case 'rects': {
          ctx.lineWidth = 1.2;
          for (const r of L.rects) {
            const c = r.y >= 0 || !L.signed ? col : colorOf('bad', P);
            ctx.fillStyle = withAlpha(c, L.alpha || 0.25); ctx.strokeStyle = c;
            ctx.beginPath();
            if (r.y0 !== undefined) { // trapezoid
              ctx.moveTo(this.X(r.x0), this.Y(0)); ctx.lineTo(this.X(r.x0), this.Y(r.y0)); ctx.lineTo(this.X(r.x1), this.Y(r.y1)); ctx.lineTo(this.X(r.x1), this.Y(0));
            } else if (r.f) { // curve-topped (Simpson)
              ctx.moveTo(this.X(r.x0), this.Y(0));
              for (let i = 0; i <= 30; i++) { const x = r.x0 + (r.x1 - r.x0) * i / 30; ctx.lineTo(this.X(x), this.Y(r.f(x))); }
              ctx.lineTo(this.X(r.x1), this.Y(0));
            } else ctx.rect(this.X(r.x0), this.Y(Math.max(0, r.y)), this.X(r.x1) - this.X(r.x0), Math.abs(this.Y(r.y) - this.Y(0)));
            ctx.closePath(); ctx.fill(); ctx.stroke();
          }
          break;
        }
        case 'point': {
          const px = this.X(L.x), py = this.Y(L.y), r = L.r || (L.drag ? 7 : 4.5);
          if (L.drag) { ctx.fillStyle = withAlpha(col, 0.2); ctx.beginPath(); ctx.arc(px, py, r + 6, 0, 7); ctx.fill(); ctx.fillStyle = col; }
          ctx.beginPath(); ctx.arc(px, py, r, 0, 7);
          if (L.hollow) { ctx.fillStyle = P.bg; ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); } else ctx.fill();
          if (L.label) { ctx.fillStyle = L.labelColor ? colorOf(L.labelColor, P) : P.text; ctx.font = '600 12px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.fillText(L.label, px + 8, py - 6); }
          break;
        }
        case 'segment': {
          const x1 = this.X(L.x1), y1 = this.Y(L.y1), x2 = this.X(L.x2), y2 = this.Y(L.y2);
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
          if (L.arrow) { ctx.setLineDash([]); const a = Math.atan2(y2 - y1, x2 - x1), s = 10; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * Math.cos(a - 0.4), y2 - s * Math.sin(a - 0.4)); ctx.lineTo(x2 - s * Math.cos(a + 0.4), y2 - s * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill(); }
          if (L.label) { ctx.font = '600 12px system-ui, sans-serif'; ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(L.label, (x1 + x2) / 2 + 6, (y1 + y2) / 2 - 6); }
          break;
        }
        case 'line': { // infinite line through (x0,y0) slope m
          const f = x => L.y0 + L.m * (x - L.x0);
          ctx.beginPath(); ctx.moveTo(0, this.Y(f(this.ix(0)))); ctx.lineTo(this.W, this.Y(f(this.ix(this.W)))); ctx.stroke(); break;
        }
        case 'vline': { const p = this.X(L.x); ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, this.H); ctx.stroke(); if (L.label) { ctx.font = '12px system-ui'; ctx.fillText(L.label, p + 4, 14); } break; }
        case 'hline': { const p = this.Y(L.y); ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(this.W, p); ctx.stroke(); if (L.label) { ctx.font = '12px system-ui'; ctx.textAlign = 'right'; ctx.fillText(L.label, this.W - 6, p - 5); } break; }
        case 'text': {
          ctx.font = L.font || '600 13px system-ui, sans-serif'; ctx.textAlign = L.align || 'left'; ctx.textBaseline = L.baseline || 'middle';
          if (L.bg) { const w = ctx.measureText(L.text).width; ctx.fillStyle = withAlpha(P.bg, 0.85); ctx.fillRect(this.X(L.x) - (L.align === 'center' ? w / 2 : 0) - 3, this.Y(L.y) - 10, w + 6, 20); ctx.fillStyle = col; }
          ctx.fillText(L.text, this.X(L.x) + (L.dx || 0), this.Y(L.y) + (L.dy || 0)); break;
        }
        case 'field': {
          const v = this.view, nx = L.nx || 21, ny = Math.round(nx * this.H / this.W);
          ctx.lineWidth = 1.3; ctx.strokeStyle = withAlpha(col, 0.65);
          const len = Math.min(this.W / nx, this.H / ny) * 0.36;
          ctx.beginPath();
          for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) {
            const x = v.xmin + (v.xmax - v.xmin) * i / nx, y = v.ymin + (v.ymax - v.ymin) * j / ny;
            const m = L.f(x, y); if (!isFinite(m)) continue;
            const dx = 1, dy = m * (this.H / (v.ymax - v.ymin)) / (this.W / (v.xmax - v.xmin));
            const k = len / Math.hypot(dx, dy);
            const px = this.X(x), py = this.Y(y);
            ctx.moveTo(px - dx * k, py + dy * k); ctx.lineTo(px + dx * k, py - dy * k);
          }
          ctx.stroke(); break;
        }
        case 'poly': {
          ctx.beginPath(); L.pts.forEach(([x, y], i) => i ? ctx.lineTo(this.X(x), this.Y(y)) : ctx.moveTo(this.X(x), this.Y(y)));
          if (L.close) ctx.closePath();
          if (L.fill) { ctx.fillStyle = withAlpha(col, L.fillAlpha || 0.2); ctx.fill(); }
          ctx.stroke();
          if (L.dots) for (const [x, y] of L.pts) { ctx.beginPath(); ctx.arc(this.X(x), this.Y(y), 3.5, 0, 7); ctx.fill(); }
          break;
        }
        case 'dots': {
          for (const [x, y] of L.pts) { if (!isFinite(y)) continue; ctx.beginPath(); ctx.arc(this.X(x), this.Y(y), L.r || 3.5, 0, 7); ctx.fill(); }
          break;
        }
        case 'custom': L.draw(ctx, this, P); break;
      }
      ctx.restore();
    }
    _label(ctx, L, P, col) {
      const x = L.labelX != null ? L.labelX : this.ix(this.W * 0.82);
      const y = L.f(x); if (!isFinite(y)) return;
      const py = U_clamp(this.Y(y) - 10, 14, this.H - 6);
      ctx.font = '600 13px system-ui, sans-serif'; ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(L.label, this.X(x) + 4, py);
    }
    _drawTrace(ctx, P) {
      const L = this.layers.find(l => l && l.type === 'fn' && !l.hidden && l.trace !== false);
      if (!L) return;
      const x = this.ix(this._trace[0]), y = L.f(x);
      if (!isFinite(y)) return;
      const px = this.X(x), py = this.Y(y);
      ctx.save(); ctx.strokeStyle = P.text; ctx.globalAlpha = 0.35; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, this.H); ctx.stroke(); ctx.restore();
      ctx.fillStyle = colorOf(L.color, P); ctx.beginPath(); ctx.arc(px, py, 5, 0, 7); ctx.fill();
      const txt = '(' + CL.U.fmt(x, 3) + ', ' + CL.U.fmt(y, 3) + ')';
      ctx.font = '600 12px system-ui'; const w = ctx.measureText(txt).width;
      const bx = U_clamp(px + 10, 4, this.W - w - 12), by = U_clamp(py - 26, 4, this.H - 24);
      ctx.fillStyle = withAlpha(P.bg, 0.92); ctx.fillRect(bx, by, w + 10, 20);
      ctx.fillStyle = P.text; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(txt, bx + 5, by + 10);
    }
  }
  function U_clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

  /* ---------------- 3D viewer ---------------- */
  class View3D {
    constructor(host, opts = {}) {
      this.o = Object.assign({ height: 340, yaw: -0.7, pitch: 0.45, scale: 1, axes: true, range: 3, labels: ['x', 'y', 'z'] }, opts);
      this.yaw = this.o.yaw; this.pitch = this.o.pitch; this.zoom = 1;
      this.wrap = CL.U.el('div', { class: 'plot plot3d' });
      this.wrap.style.height = this.o.height + 'px';
      this.canvas = CL.U.el('canvas', { 'aria-label': '3D view, drag to rotate', role: 'img' });
      this.wrap.append(this.canvas, CL.U.el('div', { class: 'plot3d-hint' }, 'drag to rotate'));
      host.append(this.wrap);
      this.ctx = this.canvas.getContext('2d');
      this.scene = () => {};
      let d = null;
      this.canvas.style.touchAction = 'none';
      this.canvas.addEventListener('pointerdown', e => { d = [e.clientX, e.clientY, this.yaw, this.pitch]; this.canvas.setPointerCapture(e.pointerId); });
      this.canvas.addEventListener('pointermove', e => { if (!d) return; this.yaw = d[2] + (e.clientX - d[0]) * 0.01; this.pitch = U_clamp(d[3] + (e.clientY - d[1]) * 0.01, -1.5, 1.5); this.draw(); });
      const up = () => { d = null; };
      this.canvas.addEventListener('pointerup', up); this.canvas.addEventListener('pointercancel', up);
      this.canvas.addEventListener('wheel', e => { if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); this.zoom *= e.deltaY > 0 ? 0.9 : 1.1; this.draw(); }, { passive: false });
      this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this.wrap);
      live.add(this);
      this.resize();
    }
    resize() {
      const dpr = window.devicePixelRatio || 1, W = this.wrap.clientWidth, H = this.wrap.clientHeight;
      if (!W || !H) return;
      this.canvas.width = W * dpr; this.canvas.height = H * dpr; this.canvas.style.width = W + 'px'; this.canvas.style.height = H + 'px';
      this.dpr = dpr; this.W = W; this.H = H; this.draw();
    }
    // world: z up. returns [px, py, depth]
    p(x, y, z) {
      const cy = Math.cos(this.yaw), sy = Math.sin(this.yaw), cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
      const x1 = x * cy - y * sy, y1 = x * sy + y * cy;
      const depth = y1 * cp + z * sp; const up = z * cp - y1 * sp;
      const s = Math.min(this.W, this.H) / (2.4 * this.o.range) * this.zoom;
      return [this.W / 2 + x1 * s, this.H / 2 - up * s, depth];
    }
    line(pts, color, width = 1.5, dash) {
      const ctx = this.ctx; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; if (dash) ctx.setLineDash([5, 4]);
      ctx.beginPath(); pts.forEach((q, i) => { const [a, b] = this.p(...q); i ? ctx.lineTo(a, b) : ctx.moveTo(a, b); }); ctx.stroke(); ctx.restore();
    }
    text(t, x, y, z, color) { const [a, b] = this.p(x, y, z); this.ctx.fillStyle = color; this.ctx.font = '600 12px system-ui'; this.ctx.fillText(t, a + 3, b - 3); }
    dot(x, y, z, color, r = 4) { const [a, b] = this.p(x, y, z); this.ctx.fillStyle = color; this.ctx.beginPath(); this.ctx.arc(a, b, r, 0, 7); this.ctx.fill(); }
    /** quads: array of [[x,y,z]x4]; colorFn(quad, shade) */
    surface(quads, base, opts = {}) {
      const ctx = this.ctx, P = this.P;
      const L = [0.4, -0.5, 0.75]; const ln = Math.hypot(...L);
      const items = quads.map(q => {
        const pr = q.map(v => this.p(...v));
        const d = pr.reduce((a, v) => a + v[2], 0) / 4;
        const u = [q[1][0] - q[0][0], q[1][1] - q[0][1], q[1][2] - q[0][2]], w = [q[3][0] - q[0][0], q[3][1] - q[0][1], q[3][2] - q[0][2]];
        const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]; const nn = Math.hypot(...n) || 1;
        const shade = Math.abs((n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / nn / ln);
        return { pr, d, shade, q };
      }).sort((a, b) => a.d - b.d);
      for (const it of items) {
        ctx.beginPath(); it.pr.forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); ctx.closePath();
        const col = typeof base === 'function' ? base(it.q, it.shade) : shadeColor(base, 0.45 + 0.55 * it.shade);
        ctx.fillStyle = col; ctx.globalAlpha = opts.alpha || 0.92; ctx.fill(); ctx.globalAlpha = 1;
        if (opts.stroke !== false) { ctx.strokeStyle = withAlpha(P.bg, 0.35); ctx.lineWidth = 0.6; ctx.stroke(); }
      }
    }
    draw() {
      if (!this.dpr) return;
      const ctx = this.ctx; const P = (this.P = palette());
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, this.W, this.H);
      const R = this.o.range;
      if (this.o.axes) {
        const ax = [[R, 0, 0, this.o.labels[0]], [0, R, 0, this.o.labels[1]], [0, 0, R, this.o.labels[2]]];
        for (const [x, y, z, l] of ax) { this.line([[-x * 0.6, -y * 0.6, -z * 0.6], [x, y, z]], P.axis, 1.2); this.text(l, x, y, z, P.text); }
      }
      try { this.scene(this, P); } catch (e) { console.warn(e); }
    }
    destroy() { this.ro.disconnect(); live.delete(this); }
  }
  function shadeColor(col, k) {
    let r, g, b;
    if (col.startsWith('#')) { let h = col.slice(1); if (h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h, 16); r = n >> 16 & 255; g = n >> 8 & 255; b = n & 255; }
    else { const m = col.match(/\d+/g) || [100, 100, 200]; [r, g, b] = m.map(Number); }
    return `rgb(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)})`;
  }

  function redrawAll() {
    for (const p of [...live]) {
      if (!p.wrap.isConnected) { p.destroy(); continue; }
      p.draw();
    }
  }
  function gc() { for (const p of [...live]) if (!p.wrap.isConnected) p.destroy(); }

  /** Build a plot from a declarative spec (used by problems). */
  function fromSpec(host, spec) {
    const E = CL.expr;
    const p = new Plot(host, { xmin: spec.x ? spec.x[0] : -5, xmax: spec.x ? spec.x[1] : 5, ymin: spec.y ? spec.y[0] : -5, ymax: spec.y ? spec.y[1] : 5, height: spec.height || 260, piTicks: spec.piTicks, trace: true, equal: spec.equal });
    const fnOf = f => typeof f === 'function' ? f : E.fn(f);
    const layers = [];
    for (const s of spec.shade || []) layers.push({ type: 'area', f: fnOf(s.f), g: s.g ? fnOf(s.g) : null, a: s.a, b: s.b, color: s.color || 1, alpha: 0.25 });
    if (spec.rects) layers.push({ type: 'rects', rects: spec.rects, color: 2 });
    (spec.fns || []).forEach((s, i) => layers.push({ type: 'fn', f: fnOf(s.f), color: s.color || i + 1, label: s.label, domain: s.domain, dash: s.dash }));
    const fv = (f, v) => typeof f === 'function' ? f : E.fn(f, [v]);
    for (const s of spec.params || []) layers.push({ type: 'param', x: fv(s.x, 't'), y: fv(s.y, 't'), t: s.t, color: s.color || 1 });
    for (const s of spec.polars || []) layers.push({ type: 'polar', r: fv(s.r, 'theta'), t: s.t, color: s.color || 1 });
    for (const s of spec.polarShade || []) layers.push({ type: 'polarArea', r: fv(s.r, 'theta'), a: s.a, b: s.b, color: s.color || 1 });
    for (const v of spec.vlines || []) layers.push({ type: 'vline', x: v, color: 'text', dash: true, width: 1.2 });
    for (const pt of spec.points || []) layers.push({ type: 'point', x: pt[0], y: pt[1], hollow: pt[2], label: pt[3], color: pt[4] || 'text' });
    for (const v of spec.vectors || []) layers.push({ type: 'segment', x1: v[0], y1: v[1], x2: v[2], y2: v[3], arrow: true, color: v[4] || 1, label: v[5] });
    p.set(layers);
    return p;
  }

  CL.Plot = Plot;
  CL.View3D = View3D;
  CL.graph = { redrawAll, gc, fromSpec, palette, withAlpha, colorOf, shadeColor };
})();
