/* App shell: icons, theme, toasts, sounds, confetti, modal, search palette, scratchpad, focus timer. */
(function () {
  'use strict';
  const CL = (window.CL = window.CL || {});
  const { U, store } = CL;
  const el = U.el;
  CL.ui = CL.ui || {};

  /* ---------- icons (inline SVG, stroke-based) ---------- */
  const P = {
    home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
    map: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14',
    target: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h.01',
    repeat: 'M17 2l4 4-4 4M3 11V9a3 3 0 013-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 01-3 3H3',
    chart: 'M3 3v18h18M7 15l4-5 4 3 5-7',
    book: 'M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14zM4 19.5A2.5 2.5 0 006.5 22H20v-5',
    func: 'M4 20c4 0 4-16 8-16s4 16 8 16M3 12h18',
    bookmark: 'M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z',
    bookmarkFilled: 'M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z',
    settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z',
    search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
    flame: 'M12 22c4 0 7-3 7-7 0-4-3-6-4-9-1 2-2 3-3 3 0-2-1-4-3-6 0 4-4 6-4 12 0 4 3 7 7 7z',
    pencil: 'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z',
    sun: 'M12 17a5 5 0 100-10 5 5 0 000 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
    moon: 'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z',
    menu: 'M3 6h18M3 12h18M3 18h18',
    x: 'M18 6L6 18M6 6l12 12',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    back: 'M19 12H5M11 18l-6-6 6-6',
    bulb: 'M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z',
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    check: 'M20 6L9 17l-5-5',
    star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
    play: 'M5 3l14 9-14 9V3z',
    keyboard: 'M2 6h20v12H2zM6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10',
    trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4zM17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3',
    clock: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
    trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    note: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M8 13h8M8 17h5',
    download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
    upload: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12',
    plus: 'M12 5v14M5 12h14',
    eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 100-6 3 3 0 000 6z',
    zap: 'M13 2L3 14h9l-1 8 10-12h-9z',
    refresh: 'M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0114.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0020.5 15'
  };
  CL.icon = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="${name.endsWith('Filled') ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${P[name] || P.star}"/></svg>`;

  /* ---------- theme ---------- */
  const ACCENTS = { indigo: '#5b5bd6', blue: '#1c7ed6', teal: '#0c8599', green: '#2b8a3e', orange: '#e8590c', pink: '#d6336c', purple: '#8e44ad', red: '#e03131' };
  const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function resolvedTheme() { const t = store.setting('theme'); return t === 'system' ? (media && media.matches ? 'dark' : 'light') : t; }
  function applyTheme() {
    const s = store.state.settings, root = document.documentElement;
    const theme = resolvedTheme();
    root.dataset.theme = theme;
    root.dataset.mode = ['dark', 'midnight'].includes(theme) ? 'dark' : 'light';
    const acc = ACCENTS[s.accent] || s.accent || ACCENTS.indigo;
    root.style.setProperty('--accent', acc);
    root.style.setProperty('--c1', acc);
    root.style.fontSize = (16 * (s.fontScale || 1)) + 'px';
    root.style.setProperty('--math-scale', s.mathScale || 1.08);
    root.classList.toggle('reduce-motion', !!s.reduceMotion);
    root.classList.toggle('compact-side', !!s.compactSidebar);
    const meta = document.querySelector('meta[name=theme-color]'); if (meta) meta.content = getComputedStyle(root).getPropertyValue('--bg').trim() || '#fff';
    try { localStorage.setItem('calc2learner.theme', theme); } catch (e) {}
    requestAnimationFrame(() => CL.graph.redrawAll());
  }
  media && media.addEventListener && media.addEventListener('change', () => store.setting('theme') === 'system' && applyTheme());
  CL.ui.applyTheme = applyTheme; CL.ui.ACCENTS = ACCENTS; CL.ui.resolvedTheme = resolvedTheme;
  CL.ui.toggleDark = () => { store.setting('theme', ['dark', 'midnight'].includes(resolvedTheme()) ? 'light' : 'dark'); };

  /* ---------- toasts ---------- */
  CL.ui.toast = (msg, icon = 'check', kind = '') => {
    const root = document.getElementById('toasts');
    const t = el('div', { class: 'toast ' + kind, role: 'status', html: CL.icon(icon) + '<span>' + CL.md(msg).replace(/^<p>|<\/p>$/g, '') + '</span>' });
    root.append(t);
    setTimeout(() => t.classList.add('out'), 2600);
    setTimeout(() => t.remove(), 3100);
  };

  /* ---------- sound ---------- */
  let actx;
  CL.ui.sfx = kind => {
    if (!store.setting('sound')) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = { good: [[660, 0], [880, 0.08]], wrong: [[220, 0], [180, 0.09]], done: [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.3]], level: [[440, 0], [554, 0.1], [659, 0.2], [880, 0.3]] }[kind] || [];
      for (const [f, t] of notes) {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = kind === 'wrong' ? 'triangle' : 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, actx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.12, actx.currentTime + t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + t + 0.18);
        o.connect(g); g.connect(actx.destination); o.start(actx.currentTime + t); o.stop(actx.currentTime + t + 0.2);
      }
    } catch (e) {}
  };

  /* ---------- confetti ---------- */
  CL.ui.confetti = () => {
    if (!store.setting('confetti') || store.setting('reduceMotion')) return;
    const c = el('canvas', { class: 'confetti' }); document.body.append(c);
    const ctx = c.getContext('2d'); const W = c.width = innerWidth, H = c.height = innerHeight;
    const cols = Object.values(ACCENTS);
    const ps = U.range(1, 140).map(() => ({ x: W / 2 + (Math.random() - 0.5) * 200, y: H * 0.35, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 13 - 3, r: Math.random() * 6 + 3, c: U.pick(cols), a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3 }));
    let f = 0;
    (function tick() {
      ctx.clearRect(0, 0, W, H);
      for (const p of ps) { p.x += p.vx; p.y += p.vy; p.vy += 0.35; p.vx *= 0.99; p.a += p.va; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); }
      if (++f < 120) requestAnimationFrame(tick); else c.remove();
    })();
  };

  /* ---------- modal ---------- */
  CL.ui.modal = (title, content, opts = {}) => {
    const root = document.getElementById('modal-root');
    root.innerHTML = '';
    const close = () => { root.innerHTML = ''; root.hidden = true; document.removeEventListener('keydown', esc); opts.onClose && opts.onClose(); if (prev) prev.focus && prev.focus(); };
    const esc = e => { if (e.key === 'Escape') close(); };
    const prev = document.activeElement;
    const box = el('div', { class: 'modal ' + (opts.cls || ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      el('div', { class: 'modal-head' }, el('h2', {}, title), el('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: close, html: CL.icon('x') })),
      content);
    root.append(el('div', { class: 'modal-backdrop', onclick: close }), box);
    root.hidden = false;
    document.addEventListener('keydown', esc);
    setTimeout(() => { const f = box.querySelector('input,button:not(.icon-btn),a'); f && f.focus(); }, 20);
    return { close, box };
  };

  /* ---------- search / command palette ---------- */
  CL.ui.search = () => {
    const input = el('input', { class: 'search-input', type: 'search', placeholder: 'Search lessons, skills, formulas, pages…', 'aria-label': 'Search' });
    const list = el('div', { class: 'search-list', role: 'listbox' });
    const items = [];
    const pages = [['Home', '#/', 'home'], ['Learn — course map', '#/learn', 'map'], ['Practice hub', '#/practice', 'target'], ['Review due', '#/practice/review', 'repeat'], ['Mixed practice', '#/practice/mix/all', 'zap'], ['Grapher', '#/grapher', 'func'], ['Formula reference', '#/reference', 'book'], ['Progress & stats', '#/progress', 'chart'], ['Saved problems & notes', '#/saved', 'bookmark'], ['Settings', '#/settings', 'settings']];
    pages.forEach(([t, h, i]) => items.push({ t, sub: 'Page', h, i }));
    for (const u of CL.course.units) for (const l of u.lessons) items.push({ t: l.title, sub: 'Lesson · ' + u.title, h: '#/lesson/' + l.id, i: 'book' });
    for (const s of CL.gen.list()) items.push({ t: s.title, sub: 'Practice · ' + ((CL.course.unit(s.unit) || {}).title || ''), h: '#/practice/skill/' + s.id, i: 'target', extra: s.desc });
    for (const sec of (CL.REFERENCE || [])) items.push({ t: sec.title, sub: 'Formula sheet', h: '#/reference/' + sec.id, i: 'book', extra: sec.keywords || '' });
    let sel = 0, shown = [];
    function render() {
      const q = input.value.trim().toLowerCase();
      const words = q.split(/\s+/).filter(Boolean);
      shown = items.filter(it => words.every(w => (it.t + ' ' + it.sub + ' ' + (it.extra || '')).toLowerCase().includes(w))).slice(0, 40);
      sel = Math.min(sel, Math.max(0, shown.length - 1));
      list.innerHTML = '';
      shown.forEach((it, i) => list.append(el('a', { href: it.h, class: 'search-item' + (i === sel ? ' sel' : ''), role: 'option', onclick: () => m.close(), html: CL.icon(it.i) + `<span><b>${U.esc(it.t)}</b><small>${U.esc(it.sub)}</small></span>` })));
      if (!shown.length) list.append(el('div', { class: 'muted pad' }, 'No matches'));
    }
    input.addEventListener('input', () => { sel = 0; render(); });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { sel = Math.min(shown.length - 1, sel + 1); render(); e.preventDefault(); }
      if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); render(); e.preventDefault(); }
      if (e.key === 'Enter' && shown[sel]) { location.hash = shown[sel].h; m.close(); }
    });
    const m = CL.ui.modal('Search', el('div', {}, input, list), { cls: 'modal-search' });
    render(); input.focus();
  };

  /* ---------- keyboard shortcut help ---------- */
  CL.ui.shortcuts = () => {
    const rows = [['Ctrl/⌘ + K or /', 'Search everything'], ['?', 'This help'], ['Enter', 'Check answer / next problem'], ['H', 'Show a hint'], ['S', 'Show the next solution step'], ['N', 'Next problem (after answering)'], ['1–4 / A–D', 'Pick a multiple-choice option'], ['D', 'Toggle dark mode'], ['P', 'Toggle scratchpad'], ['G then H/L/P/G/R', 'Go to Home / Learn / Practice / Grapher / Reference'], ['← / →', 'Previous / next lesson step']];
    CL.ui.modal('Keyboard shortcuts', el('div', { class: 'shortcut-list', html: rows.map(([k, d]) => `<div><kbd>${k}</kbd><span>${d}</span></div>`).join('') }));
  };

  /* ---------- scratchpad ---------- */
  let pad = null;
  CL.ui.scratchpad = () => {
    if (pad) { pad.hidden = !pad.hidden; if (!pad.hidden) sizeCanvas(); return; }
    pad = el('div', { class: 'scratch', role: 'dialog', 'aria-label': 'Scratchpad' });
    const canvas = el('canvas', { class: 'scratch-canvas' });
    let color = 'ink', size = 2.5, erase = false;
    const tools = el('div', { class: 'scratch-tools' });
    const colors = { ink: null, blue: '#1c7ed6', red: '#e03131', green: '#2b8a3e' };
    const btns = [];
    for (const c of Object.keys(colors)) { const b = el('button', { class: 'swatch' + (c === 'ink' ? ' on' : ''), title: c, 'aria-label': 'Pen ' + c, style: { background: colors[c] || 'var(--text)' } }); b.onclick = () => { color = c; erase = false; btns.forEach(x => x.classList.remove('on')); b.classList.add('on'); }; btns.push(b); tools.append(b); }
    const er = el('button', { class: 'btn btn-sm btn-ghost', type: 'button' }, 'Eraser'); er.onclick = () => { erase = true; btns.forEach(x => x.classList.remove('on')); er.classList.add('on'); }; btns.push(er);
    const clear = el('button', { class: 'btn btn-sm btn-ghost', type: 'button' }, 'Clear'); clear.onclick = () => { strokes = []; redraw(); };
    const undo = el('button', { class: 'btn btn-sm btn-ghost', type: 'button' }, 'Undo'); undo.onclick = () => { strokes.pop(); redraw(); };
    tools.append(er, undo, clear);
    const head = el('div', { class: 'scratch-head' }, el('b', {}, '✏️ Scratchpad'), el('span', { class: 'grow' }), el('button', { class: 'icon-btn', 'aria-label': 'Close scratchpad', onclick: () => { pad.hidden = true; }, html: CL.icon('x') }));
    pad.append(head, tools, canvas);
    document.body.append(pad);
    const ctx = canvas.getContext('2d');
    let strokes = [], cur = null;
    function sizeCanvas() { const r = canvas.getBoundingClientRect(); const d = devicePixelRatio || 1; canvas.width = r.width * d; canvas.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0); redraw(); }
    function redraw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ink = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
      for (const s of strokes) { ctx.strokeStyle = s.erase ? 'rgba(0,0,0,1)' : (colors[s.color] || ink); ctx.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over'; ctx.lineWidth = s.erase ? 18 : s.size; ctx.lineCap = ctx.lineJoin = 'round'; ctx.beginPath(); s.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
      ctx.globalCompositeOperation = 'source-over';
    }
    const pos = e => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); cur = { color, size: e.pressure && e.pointerType === 'pen' ? size * (0.5 + e.pressure) : size, erase, pts: [pos(e)] }; strokes.push(cur); });
    canvas.addEventListener('pointermove', e => { if (!cur) return; cur.pts.push(pos(e)); redraw(); });
    canvas.addEventListener('pointerup', () => { cur = null; });
    canvas.style.touchAction = 'none';
    // drag panel
    let drag = null;
    head.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; drag = [e.clientX - pad.offsetLeft, e.clientY - pad.offsetTop]; head.setPointerCapture(e.pointerId); });
    head.addEventListener('pointermove', e => { if (!drag) return; pad.style.left = Math.max(0, e.clientX - drag[0]) + 'px'; pad.style.top = Math.max(0, e.clientY - drag[1]) + 'px'; pad.style.right = 'auto'; pad.style.bottom = 'auto'; });
    head.addEventListener('pointerup', () => { drag = null; });
    new ResizeObserver(sizeCanvas).observe(canvas);
    store.on('settings', () => redraw());
  };

  /* ---------- focus timer ---------- */
  const timer = { end: null, mode: 'focus', id: null, listeners: new Set() };
  CL.ui.timer = {
    start(min, mode = 'focus') { timer.end = Date.now() + min * 60000; timer.mode = mode; clearInterval(timer.id); timer.id = setInterval(tickTimer, 1000); tickTimer(); },
    stop() { timer.end = null; clearInterval(timer.id); tickTimer(); },
    get remaining() { return timer.end ? Math.max(0, timer.end - Date.now()) : 0; },
    get mode() { return timer.mode; },
    get running() { return !!timer.end; },
    on(fn) { timer.listeners.add(fn); return () => timer.listeners.delete(fn); }
  };
  function tickTimer() {
    const r = CL.ui.timer.remaining;
    timer.listeners.forEach(f => f(r));
    const pill = document.getElementById('timer-pill');
    if (pill) { pill.hidden = !timer.end; const s = Math.ceil(r / 1000); pill.textContent = (timer.mode === 'focus' ? '⏱ ' : '☕ ') + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
    if (timer.end && r <= 0) {
      clearInterval(timer.id); timer.end = null; CL.ui.sfx('done');
      CL.ui.toast(timer.mode === 'focus' ? 'Focus session done — take a 5 minute break! ☕' : 'Break over — back to it! 💪', 'clock');
      if (pill) pill.hidden = true;
      timer.listeners.forEach(f => f(0));
    }
  }
})();
