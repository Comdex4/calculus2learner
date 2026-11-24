/* Bootstrap: router, navigation, global listeners. */
(function () {
  'use strict';
  const CL = window.CL;
  const { U, store } = CL;
  const el = U.el;

  const NAV = [
    ['#/', 'home', 'Home'], ['#/learn', 'map', 'Learn'], ['#/practice', 'target', 'Practice'], ['#/practice/review', 'repeat', 'Review'],
    ['#/grapher', 'func', 'Grapher'], ['#/reference', 'book', 'Formulas'], ['#/progress', 'chart', 'Progress'], ['#/saved', 'bookmark', 'Saved'], ['#/settings', 'settings', 'Settings']
  ];
  const TABS = [['#/', 'home', 'Home'], ['#/learn', 'map', 'Learn'], ['#/practice', 'target', 'Practice'], ['#/grapher', 'func', 'Graph'], ['more', 'menu', 'More']];

  const ROUTES = [
    [/^$/, 'home', 'Home'], [/^learn$/, 'learn', 'Learn'], [/^lesson\/([\w-]+)$/, 'lesson', 'Lesson'],
    [/^practice$/, 'practice', 'Practice'], [/^practice\/skill\/([\w-]+)$/, 'practiceSkill', 'Practice'], [/^practice\/mix\/([\w-]+)$/, 'practiceMix', 'Practice'],
    [/^practice\/review$/, 'review', 'Review'], [/^quiz\/([\w-]+)$/, 'quiz', 'Quiz'], [/^grapher$/, 'grapher', 'Grapher'],
    [/^reference(?:\/([\w-]+))?$/, 'reference', 'Formulas'], [/^progress$/, 'progress', 'Progress'], [/^saved$/, 'saved', 'Saved'], [/^settings$/, 'settings', 'Settings']
  ];

  let cleanup = null;
  function route() {
    const raw = location.hash.replace(/^#\/?/, '');
    const path = raw.split('#')[0].replace(/\/$/, '');
    const view = document.getElementById('view');
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    view.innerHTML = '';
    CL.ui.activeProblem = null;
    let hit = ROUTES.find(([re]) => re.test(path));
    if (!hit) hit = ROUTES[0];
    const args = path.match(hit[0]).slice(1);
    try { cleanup = CL.pages[hit[1]](view, ...args) || null; }
    catch (e) { console.error(e); view.append(el('div', { class: 'card' }, el('h2', {}, 'Something went wrong'), el('pre', {}, String(e && e.stack || e)), el('a', { href: '#/', class: 'btn' }, 'Go home'))); }
    document.title = (hit[2] === 'Home' ? '' : hit[2] + ' · ') + 'Calc 2 Learner';
    const base = '#/' + path;
    document.querySelectorAll('.nav a, .tabbar a').forEach(a => {
      const h = a.getAttribute('href');
      const on = h === '#/' ? base === '#/' : base === h || (base.startsWith(h + '/') && !(h === '#/practice' && base.startsWith('#/practice/review')));
      a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.body.classList.remove('nav-open');
    if (!raw.includes('#')) window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
    CL.graph.gc();
    refreshTop();
  }
  CL.router = { reload: route };

  function refreshTop() {
    const lv = store.levelInfo();
    const st = document.getElementById('streak-pill'); if (st) st.innerHTML = CL.icon('flame') + '<b>' + store.currentStreak() + '</b>';
    const xp = document.getElementById('xp-pill'); if (xp) xp.innerHTML = '<span class="lvl-badge">' + lv.level + '</span><span class="xp-bar"><i style="width:' + Math.round(lv.pct * 100) + '%"></i></span>';
    const due = store.reviewQueue().length;
    document.querySelectorAll('[data-badge=review]').forEach(b => { b.textContent = due || ''; b.hidden = !due; });
    const th = document.getElementById('theme-btn'); if (th) th.innerHTML = CL.icon(document.documentElement.dataset.mode === 'dark' ? 'sun' : 'moon');
  }

  function buildShell() {
    const nav = document.getElementById('nav');
    for (const [h, ic, label] of NAV) nav.append(el('a', { href: h, title: label, html: CL.icon(ic) + '<span>' + label + '</span>' + (ic === 'repeat' ? '<em class="badge" data-badge="review" hidden></em>' : '') }));
    const tab = document.getElementById('tabbar');
    for (const [h, ic, label] of TABS) {
      if (h === 'more') tab.append(el('button', { type: 'button', onclick: () => document.body.classList.toggle('nav-open'), html: CL.icon(ic) + '<span>' + label + '</span>' }));
      else tab.append(el('a', { href: h, html: CL.icon(ic) + '<span>' + label + '</span>' }));
    }
    const top = document.getElementById('top-actions');
    top.append(
      el('span', { id: 'timer-pill', class: 'pill', hidden: true }),
      el('button', { class: 'top-search', type: 'button', onclick: CL.ui.search, 'aria-label': 'Search', html: CL.icon('search') + '<span>Search</span><kbd>Ctrl K</kbd>' }),
      el('a', { href: '#/progress', id: 'streak-pill', class: 'pill streak', title: 'Day streak' }),
      el('a', { href: '#/progress', id: 'xp-pill', class: 'pill xp', title: 'Level & XP' }),
      el('button', { class: 'icon-btn', type: 'button', title: 'Scratchpad (P)', 'aria-label': 'Toggle scratchpad', onclick: CL.ui.scratchpad, html: CL.icon('pencil') }),
      el('button', { class: 'icon-btn', id: 'theme-btn', type: 'button', title: 'Toggle dark mode (D)', 'aria-label': 'Toggle dark mode', onclick: () => CL.ui.toggleDark() }));
    document.getElementById('menu-btn').onclick = () => document.body.classList.toggle('nav-open');
    document.getElementById('scrim').onclick = () => document.body.classList.remove('nav-open');
    document.getElementById('menu-btn').innerHTML = CL.icon('menu');
  }

  function keys() {
    let g = false, gt;
    document.addEventListener('keydown', e => {
      const typing = e.target.closest && e.target.closest('input, textarea, select, [contenteditable]');
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); CL.ui.search(); return; }
      if (!document.getElementById('modal-root').hidden) return;
      if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
      const ap = CL.ui.activeProblem;
      if (ap && ap.isConnected && ap._keys && ap._keys(e)) { e.preventDefault(); return; }
      const k = e.key.toLowerCase();
      if (g) { const map = { h: '#/', l: '#/learn', p: '#/practice', g: '#/grapher', r: '#/reference', s: '#/settings' }; if (map[k]) location.hash = map[k]; g = false; return; }
      if (k === 'g') { g = true; clearTimeout(gt); gt = setTimeout(() => g = false, 900); return; }
      if (k === '/') { e.preventDefault(); CL.ui.search(); }
      else if (e.key === '?') CL.ui.shortcuts();
      else if (k === 'd') CL.ui.toggleDark();
      else if (k === 'p') CL.ui.scratchpad();
    });
  }

  function listeners() {
    store.on('settings', ({ k } = {}) => { if (!k || ['theme', 'accent', 'fontScale', 'mathScale', 'reduceMotion', 'compactSidebar', 'graphGrid'].includes(k)) { CL.ui.applyTheme(); refreshTop(); } });
    store.on('xp', refreshTop);
    store.on('attempt', refreshTop);
    store.on('levelup', lv => { CL.ui.sfx('level'); CL.ui.toast('**Level up!** You reached level ' + lv + ' 🎉', 'star', 'gold'); CL.ui.confetti(); });
    store.on('achievement', a => setTimeout(() => CL.ui.toast('**Achievement unlocked:** ' + a.icon + ' ' + a.name, 'trophy', 'gold'), 600));
    store.on('reset', refreshTop);
  }

  function start() {
    buildShell();
    CL.ui.applyTheme();
    listeners(); keys();
    window.addEventListener('hashchange', route);
    route();
    store.checkAchievements();
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !/localhost|127\.0\.0\.1/.test(location.hostname)) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
