/* All app pages. Each page fn(view, ...params) renders into view and may return a cleanup fn. */
(function () {
  'use strict';
  const CL = (window.CL = window.CL || {});
  const { U, store } = CL;
  const el = U.el;
  const md = s => CL.md(s);
  const inl = s => CL.md(s).replace(/^<p>|<\/p>$/g, '');
  const pages = {};

  function header(title, sub, ...actions) {
    return el('header', { class: 'page-head' }, el('div', {}, el('h1', { html: inl(title) }), sub ? el('p', { class: 'muted', html: inl(sub) }) : null), el('div', { class: 'page-actions' }, ...actions));
  }
  function card(cls, ...kids) { return el('section', { class: 'card ' + (cls || '') }, ...kids); }
  function bar(pct, cls = '') { return el('div', { class: 'bar ' + cls, role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(pct * 100) }, el('span', { style: { width: Math.round(U.clamp(pct, 0, 1) * 100) + '%' } })); }
  function link(href, html, cls = 'btn') { return el('a', { href, class: cls, html }); }
  function unitProgress(u) {
    const done = u.lessons.filter(l => store.lesson(l.id).done).length;
    const sk = CL.course.skillsOfUnit(u.id);
    const m = sk.length ? sk.reduce((a, s) => a + (store.state.skills[s.id] ? store.state.skills[s.id].mastery : 0), 0) / sk.length : 0;
    return { done, total: u.lessons.length, pct: done / u.lessons.length, mastery: m };
  }
  function nextLessonToDo() {
    const list = CL.course.lessonList();
    const last = store.state.lastLesson;
    if (last) { const l = store.lesson(last); if (!l.done) return CL.course.lesson(last); const i = list.findIndex(x => x.id === last); const after = list.slice(i + 1).find(x => !store.lesson(x.id).done); if (after) return after; }
    return list.find(x => !store.lesson(x.id).done) || null;
  }
  function masteryChip(id, named) {
    const s = store.state.skills[id];
    const m = s ? s.mastery : 0, lab = store.masteryLabel(m, s ? s.attempts : 0);
    return el('span', { class: 'mchip m-' + lab.toLowerCase(), title: (named ? lab + ' · ' : '') + Math.round(m * 100) + '% mastery' }, named ? CL.gen.skills[id].title : lab);
  }

  /* ================= DASHBOARD ================= */
  const TIPS = [
    'Stuck on an integral? Differentiate your answer — if you get the integrand back, you\'re right.',
    'For series, **always** run the divergence test first. It takes five seconds.',
    'LIATE picks $u$ for integration by parts: Logs, Inverse trig, Algebraic, Trig, Exponential.',
    '$\\sqrt{a^2 - x^2}$ → $x = a\\sin\\theta$. $\\sqrt{a^2 + x^2}$ → $x = a\\tan\\theta$. $\\sqrt{x^2 - a^2}$ → $x = a\\sec\\theta$.',
    'Washers: $\\pi\\int(R^2 - r^2)\\,dx$ — square first, then subtract.',
    'Ratio test loves factorials. Limit comparison loves rational functions.',
    'Use the **scratchpad** (✏️ in the top bar) to work problems by hand — it\'s how the learning sticks.',
    'Spaced review beats cramming. Check the **Review** queue daily.',
    'Polar area: $\\frac12\\int r^2\\,d\\theta$. Don\'t forget the $\\frac12$!',
    'Taylor coefficient: $c_n = \\frac{f^{(n)}(a)}{n!}$. The factorial is the most-forgotten piece.',
    'The Grapher can graph any function with sliders: try typing `a*sin(b*x)`.',
    'If a limit gives $\\frac{0}{0}$, that\'s not an answer — it\'s an invitation to simplify.'
  ];
  pages.home = view => {
    const s = store.state, lv = store.levelInfo(), today = store.day(), goal = s.settings.dailyGoal;
    const name = s.settings.name ? ', ' + U.esc(s.settings.name) : '';
    const h = new Date().getHours();
    view.append(header((h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening') + name + ' 👋', new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) + ' — let\'s learn some calculus.'));

    // stat tiles
    const ring = (p) => `<svg viewBox="0 0 36 36" class="ring"><circle cx="18" cy="18" r="15.9" class="ring-bg"/><circle cx="18" cy="18" r="15.9" class="ring-fg" stroke-dasharray="${Math.min(100, p * 100)} 100"/></svg>`;
    const due = store.reviewQueue().length;
    view.append(el('div', { class: 'tiles' },
      card('tile', el('div', { class: 'tile-ring', html: ring(today.xp / goal) + `<b>${Math.min(999, Math.round(today.xp / goal * 100))}%</b>` }), el('div', {}, el('div', { class: 'tile-n' }, today.xp + ' / ' + goal + ' XP'), el('div', { class: 'muted small' }, today.xp >= goal ? 'Daily goal complete! 🎉' : 'Daily goal'))),
      card('tile', el('div', { class: 'tile-ic flame', html: CL.icon('flame') }), el('div', {}, el('div', { class: 'tile-n' }, store.currentStreak() + ' day' + (store.currentStreak() === 1 ? '' : 's')), el('div', { class: 'muted small' }, 'Streak · best ' + s.streak.best))),
      card('tile', el('div', { class: 'tile-ic lvl', html: '<b>' + lv.level + '</b>' }), el('div', { class: 'grow' }, el('div', { class: 'tile-n' }, 'Level ' + lv.level), bar(lv.pct), el('div', { class: 'muted small' }, lv.into + ' / ' + lv.need + ' XP to next'))),
      card('tile clickable', el('a', { href: '#/practice/review', class: 'tile-link' }, el('div', { class: 'tile-ic rev', html: CL.icon('repeat') }), el('div', {}, el('div', { class: 'tile-n' }, due + ' due'), el('div', { class: 'muted small' }, due ? 'Spaced review ready' : 'Review queue empty'))))
    ));

    // continue
    const nx = nextLessonToDo();
    const grid = el('div', { class: 'grid-2' }); view.append(grid);
    if (nx) {
      const u = CL.course.unit(nx.unit); const prog = store.lesson(nx.id);
      grid.append(card('hero', el('div', { class: 'eyebrow' }, prog.step > 0 ? 'Continue where you left off' : 'Up next'), el('h2', {}, nx.title), el('p', { class: 'muted' }, u.icon + ' ' + u.title + ' · ~' + nx.mins + ' min'),
        prog.step > 0 ? bar(prog.step / CL.course.lesson(nx.id).steps.length) : null,
        el('div', { class: 'row' }, link('#/lesson/' + nx.id, CL.icon('play') + (prog.step > 0 ? ' Resume lesson' : ' Start lesson'), 'btn btn-primary btn-lg'), link('#/learn', 'Course map', 'btn btn-ghost'))));
    } else grid.append(card('hero', el('h2', {}, 'You finished every lesson! 🎓'), el('p', {}, 'Keep your skills sharp with mixed practice and unit quizzes.'), link('#/practice/mix/all', 'Mixed practice', 'btn btn-primary')));

    grid.append(card('', el('h3', {}, 'Quick practice'), el('div', { class: 'quick' },
      link('#/practice/mix/all', CL.icon('zap') + '<span><b>Mixed practice</b><small>Infinite problems from everything you\'ve touched</small></span>', 'quick-btn'),
      link('#/practice/review', CL.icon('repeat') + `<span><b>Spaced review</b><small>${due} skill${due === 1 ? '' : 's'} due today</small></span>`, 'quick-btn'),
      link('#/practice/mix/weak', CL.icon('target') + '<span><b>Weak spots</b><small>Drill your lowest-mastery skills</small></span>', 'quick-btn'),
      link('#/practice', CL.icon('list') + '<span><b>Pick a skill</b><small>81 problem generators</small></span>', 'quick-btn'))));

    // course progress
    const cp = card('', el('div', { class: 'card-head' }, el('h3', {}, 'Course progress'), link('#/learn', 'Open map ' + CL.icon('arrow'), 'btn btn-ghost btn-sm')));
    const ul = el('div', { class: 'unit-progress' });
    for (const u of CL.course.units) { const p = unitProgress(u); ul.append(el('a', { href: '#/learn#u-' + u.id, class: 'up-row' }, el('span', { class: 'up-ic' }, u.icon), el('span', { class: 'up-t' }, u.title, el('small', { class: 'muted' }, u.tag)), bar(p.pct), el('span', { class: 'up-n muted small' }, p.done + '/' + p.total))); }
    cp.append(ul);

    const right = el('div', { class: 'stack' });
    // heatmap
    const hm = card('', el('h3', {}, 'Activity'), heatmap(18));
    // focus timer
    const tm = card('', el('h3', {}, 'Focus timer'), timerWidget());
    const tip = card('tip', el('div', { class: 'eyebrow' }, '💡 Tip'), el('div', { class: 'md', html: md(U.pick(TIPS)) }));
    right.append(hm, tm, tip);
    view.append(el('div', { class: 'grid-2 wide-left' }, cp, right));

    const ach = Object.entries(s.achievements).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id]) => store.ACH.find(a => a.id === id)).filter(Boolean);
    if (ach.length) view.append(card('', el('div', { class: 'card-head' }, el('h3', {}, 'Recent achievements'), link('#/progress', 'All ' + CL.icon('arrow'), 'btn btn-ghost btn-sm')), el('div', { class: 'ach-row' }, ...ach.map(a => el('div', { class: 'ach got', title: a.desc }, el('span', { class: 'ach-ic' }, a.icon), el('b', {}, a.name))))));
  };

  function heatmap(weeks) {
    const wrap = el('div', { class: 'heatmap', role: 'img', 'aria-label': 'Activity over the last ' + weeks + ' weeks' });
    const today = new Date(); const start = new Date(today); start.setDate(start.getDate() - (weeks * 7 - 1) - today.getDay());
    const max = Math.max(20, ...Object.values(store.state.daily).map(d => d.xp));
    for (let w = 0; w < weeks; w++) {
      const col = el('div', { class: 'hm-col' });
      for (let d = 0; d < 7; d++) {
        const dt = new Date(start); dt.setDate(start.getDate() + w * 7 + d);
        const key = U.today(dt); const v = (store.state.daily[key] || {}).xp || 0;
        const lvl = dt > today ? -1 : v === 0 ? 0 : v < max * 0.25 ? 1 : v < max * 0.5 ? 2 : v < max * 0.75 ? 3 : 4;
        col.append(el('span', { class: 'hm-cell l' + lvl, title: key + ': ' + v + ' XP' }));
      }
      wrap.append(col);
    }
    return el('div', {}, wrap, el('div', { class: 'hm-legend muted small' }, 'Less ', ...[0, 1, 2, 3, 4].map(l => el('span', { class: 'hm-cell l' + l })), ' More'));
  }

  function timerWidget() {
    const disp = el('div', { class: 'timer-disp' });
    const btns = el('div', { class: 'row' });
    const render = r => { disp.textContent = CL.ui.timer.running ? Math.floor(r / 60000) + ':' + String(Math.ceil(r / 1000) % 60).padStart(2, '0') : '25:00'; };
    btns.append(el('button', { class: 'btn btn-soft btn-sm', onclick: () => CL.ui.timer.start(25, 'focus') }, 'Focus 25'), el('button', { class: 'btn btn-soft btn-sm', onclick: () => CL.ui.timer.start(5, 'break') }, 'Break 5'), el('button', { class: 'btn btn-ghost btn-sm', onclick: () => CL.ui.timer.stop() }, 'Stop'));
    const off = CL.ui.timer.on(render); render(CL.ui.timer.remaining);
    const w = el('div', { class: 'timer' }, disp, btns);
    const mo = new MutationObserver(() => { if (!w.isConnected) { off(); mo.disconnect(); } }); setTimeout(() => mo.observe(document.getElementById('view'), { childList: true }), 0);
    return w;
  }

  /* ================= LEARN (course map) ================= */
  pages.learn = view => {
    view.append(header('Course map', 'Precalc review → Calc 1 essentials → all of Calc 2 → a head start on Calc 3. Go in order, or jump anywhere.'));
    const filt = el('div', { class: 'chips-row' });
    const tags = ['All', 'Precalc review', 'Calc 1', 'Calc 2', 'Preview'];
    let cur = 'All';
    const body = el('div', { class: 'units' });
    tags.forEach(t => { const b = el('button', { class: 'chip' + (t === cur ? ' on' : ''), type: 'button' }, t); b.onclick = () => { cur = t; [...filt.children].forEach(x => x.classList.toggle('on', x === b)); render(); }; filt.append(b); });
    view.append(filt, body);
    const nx = nextLessonToDo();
    function render() {
      body.innerHTML = '';
      CL.course.units.forEach((u, ui) => {
        if (cur !== 'All' && u.tag !== cur) return;
        const p = unitProgress(u);
        const sec = el('section', { class: 'unit', id: 'u-' + u.id });
        sec.append(el('div', { class: 'unit-head' },
          el('div', { class: 'unit-ic' }, u.icon),
          el('div', { class: 'grow' }, el('div', { class: 'eyebrow' }, 'Unit ' + ui + ' · ' + u.tag), el('h2', {}, u.title), el('p', { class: 'muted' }, u.blurb), el('div', { class: 'row small muted' }, bar(p.pct), p.done + ' of ' + p.total + ' lessons · ' + Math.round(p.mastery * 100) + '% skill mastery')),
          el('div', { class: 'unit-actions' }, link('#/practice/mix/' + u.id, CL.icon('zap') + ' Practice', 'btn btn-soft btn-sm'), link('#/quiz/' + u.id, CL.icon('trophy') + ' Unit quiz', 'btn btn-ghost btn-sm'))));
        const path = el('div', { class: 'path' });
        u.lessons.forEach((l, i) => {
          const lp = store.lesson(l.id); const full = CL.course.lesson(l.id);
          const status = lp.done ? 'done' : lp.step > 0 ? 'started' : (nx && nx.id === l.id ? 'next' : 'todo');
          path.append(el('a', { href: '#/lesson/' + l.id, class: 'lesson-card ' + status },
            el('span', { class: 'lc-node', html: status === 'done' ? CL.icon('check') : status === 'next' ? CL.icon('play') : String(i + 1) }),
            el('span', { class: 'lc-body' }, el('b', {}, l.title), el('small', { class: 'muted' }, '~' + l.mins + ' min · ' + full.steps.length + ' steps' + (status === 'started' ? ' · ' + Math.round(lp.step / full.steps.length * 100) + '% done' : '')),
              el('span', { class: 'lc-skills' }, ...(l.skills || []).map(id => masteryChip(id, true))))));
        });
        sec.append(path);
        body.append(sec);
      });
    }
    render();
    const anchor = (location.hash.split('#')[2] || '');
    if (anchor) setTimeout(() => { const t = document.getElementById(anchor); t && t.scrollIntoView({ behavior: 'smooth' }); }, 60);
  };

  /* ================= LESSON PLAYER ================= */
  pages.lesson = (view, id) => {
    const lesson = CL.course.lesson(id);
    if (!lesson) { view.append(header('Lesson not found'), link('#/learn', 'Back to course map', 'btn')); return; }
    const u = lesson.unitObj; const prog = store.lesson(id);
    store.state.lastLesson = id; store.save();
    const n = lesson.steps.length;
    let idx = prog.done ? 0 : Math.min(prog.step, n - 1);
    const passed = new Set(U.range(0, prog.done ? n - 1 : idx - 1));

    const top = el('div', { class: 'lesson-top' },
      el('a', { href: '#/learn#u-' + u.id, class: 'icon-btn', 'aria-label': 'Back to course map', html: CL.icon('back') }),
      el('div', { class: 'grow' }, el('div', { class: 'eyebrow' }, u.icon + ' ' + u.title), el('h1', { class: 'lesson-title' }, lesson.title)),
      el('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: notes, html: CL.icon('note') + ' Notes' }));
    const dots = el('div', { class: 'lesson-dots' });
    const stage = el('div', { class: 'lesson-stage' });
    const nav = el('div', { class: 'lesson-nav' });
    const backBtn = el('button', { class: 'btn btn-ghost', type: 'button', html: CL.icon('back') + ' Back' });
    const contBtn = el('button', { class: 'btn btn-primary btn-lg', type: 'button' });
    const skipBtn = el('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, 'Skip');
    nav.append(backBtn, el('span', { class: 'grow' }), skipBtn, contBtn);
    view.append(top, dots, stage, nav);

    function renderDots() {
      dots.innerHTML = '';
      for (let i = 0; i < n; i++) dots.append(el('button', { class: 'ldot' + (i === idx ? ' cur' : '') + (passed.has(i) ? ' done' : ''), type: 'button', 'aria-label': 'Step ' + (i + 1), title: 'Step ' + (i + 1), onclick: () => { if (passed.has(i) || i <= Math.max(...passed, -1) + 1) go(i); } }));
    }
    function needs(st) { return ['mc', 'input', 'practice'].includes(st.t); }
    function canContinue() { return !needs(lesson.steps[idx]) || passed.has(idx) || !store.setting('requireChecks'); }
    function updNav() {
      backBtn.disabled = idx === 0;
      const last = idx === n - 1;
      contBtn.innerHTML = last ? CL.icon('check') + ' Complete lesson' : 'Continue ' + CL.icon('arrow');
      contBtn.disabled = !canContinue();
      skipBtn.hidden = !(needs(lesson.steps[idx]) && !passed.has(idx));
    }
    function go(i) { idx = U.clamp(i, 0, n - 1); render(); window.scrollTo({ top: 0, behavior: store.setting('reduceMotion') ? 'auto' : 'smooth' }); }
    function markPassed() { passed.add(idx); updNav(); renderDots(); }

    function render() {
      stage.innerHTML = ''; CL.graph.gc();
      const st = lesson.steps[idx];
      const c = el('div', { class: 'lesson-card-step' + (store.setting('reduceMotion') ? '' : ' enter') });
      stage.append(c);
      if (st.t === 'text') { c.append(el('div', { class: 'md prose', html: md(st.md) })); passed.add(idx); }
      else if (st.t === 'widget') {
        if (st.md) c.append(el('div', { class: 'md prose', html: md(st.md) }));
        const host = el('div'); c.append(host);
        try { CL.widgets[st.w](host, st.p || {}); } catch (e) { console.error(e); host.textContent = 'Widget failed to load.'; }
        passed.add(idx);
      } else if (st.t === 'mc') {
        c.append(el('div', { class: 'eyebrow' }, '🤔 Quick check'), el('div', { class: 'md prose', html: md(st.md) }));
        const list = el('div', { class: 'mc-list' }); const fb = el('div', { class: 'prob-feedback' });
        const order = st.shuffled || (st.shuffled = U.shuffle(st.choices.map((_, i) => i)));
        const btns = order.map((ci, k) => { const b = el('button', { type: 'button', class: 'mc-choice' }, el('span', { class: 'mc-letter' }, 'ABCD'[k]), el('span', { class: 'mc-text md', html: inl(st.choices[ci]) })); b.onclick = () => pick(ci, b); list.append(b); return b; });
        function pick(ci, b) {
          if (ci === st.a) { b.classList.add('correct'); btns.forEach(x => x.disabled = true); fb.className = 'prob-feedback show fb-good'; fb.innerHTML = md('**Correct!** ' + (st.explain || '')); CL.ui.sfx('good'); if (!passed.has(idx)) store.addXP(2, 'check'); markPassed(); }
          else { b.classList.add('wrong'); b.disabled = true; fb.className = 'prob-feedback show fb-bad'; fb.innerHTML = md('Not quite — think about it and try another option.'); CL.ui.sfx('wrong'); }
        }
        c.append(list, fb);
        if (passed.has(idx)) { btns[order.indexOf(st.a)].classList.add('correct'); btns.forEach(x => x.disabled = true); fb.className = 'prob-feedback show fb-good'; fb.innerHTML = md(st.explain || ''); }
      } else if (st.t === 'input') {
        c.append(el('div', { class: 'eyebrow' }, '✍️ Your turn'));
        const prob = { q: st.md, a: st.ans, hints: [], steps: st.explain ? [st.explain] : [], level: 1, title: 'Checkpoint', skill: (lesson.skills || [])[0] };
        CL.ui.problem(c, prob, { compact: true, showSkill: false, allowBookmark: false, onResolve: r => { if (r.solved && !passed.has(idx)) store.addXP(2, 'check'); markPassed(); } });
      } else if (st.t === 'practice') {
        c.append(el('div', { class: 'eyebrow' }, '🎯 Practice · ' + CL.gen.skills[st.skill].title), st.md ? el('div', { class: 'md prose', html: md(st.md) }) : null);
        const host = el('div'); c.append(host);
        const make = () => { host.innerHTML = ''; const p = CL.gen.make(st.skill, st.level); CL.ui.problem(host, p, { compact: true, nextLabel: 'Another one', onResolve: r => { const res = store.recordAttempt(r); if (res.xp) CL.ui.toast('+' + res.xp + ' XP', 'zap'); markPassed(); }, onNext: make }); };
        make();
      }
      store.setLessonStep(id, Math.max(prog.step, idx));
      updNav(); renderDots();
    }
    backBtn.onclick = () => go(idx - 1);
    skipBtn.onclick = () => { passed.add(idx); if (idx < n - 1) go(idx + 1); else { updNav(); renderDots(); } };
    contBtn.onclick = () => {
      if (!canContinue()) return;
      if (idx < n - 1) { passed.add(idx); go(idx + 1); return; }
      const first = store.completeLesson(id);
      CL.ui.confetti(); CL.ui.sfx('done');
      finish(first);
    };
    function finish(first) {
      stage.innerHTML = ''; nav.innerHTML = ''; dots.innerHTML = '';
      const nxt = CL.course.nextLesson(id);
      stage.append(el('div', { class: 'lesson-done' },
        el('div', { class: 'big-emoji' }, '🎉'), el('h2', {}, 'Lesson complete!'),
        el('p', { class: 'muted' }, first ? '+30 XP for finishing ' + lesson.title + '.' : 'Nice review of ' + lesson.title + '.'),
        el('h3', {}, 'Lock it in with practice'),
        el('div', { class: 'row wrap center' }, ...(lesson.skills || []).map(s => link('#/practice/skill/' + s, CL.icon('target') + ' ' + CL.gen.skills[s].title, 'btn btn-soft'))),
        el('div', { class: 'row center', style: { marginTop: '1.5rem' } }, nxt ? link('#/lesson/' + nxt.id, 'Next lesson: ' + nxt.title + ' ' + CL.icon('arrow'), 'btn btn-primary btn-lg') : link('#/learn', 'Back to course map', 'btn btn-primary btn-lg'))));
    }
    function notes() {
      const ta = el('textarea', { class: 'notes-area', rows: 10, placeholder: 'Write your own notes, summaries, or questions for this lesson. Saved automatically.' });
      ta.value = store.note(id);
      ta.addEventListener('input', U.debounce(() => store.note(id, ta.value), 300));
      CL.ui.modal('Notes — ' + lesson.title, el('div', {}, ta, el('p', { class: 'muted small' }, 'Find all your notes under Saved.')));
    }
    const keys = e => {
      if (e.target.closest('input,textarea') || document.getElementById('modal-root').hidden === false) return;
      if (e.key === 'ArrowRight' && !contBtn.disabled && idx < n - 1) contBtn.click();
      if (e.key === 'ArrowLeft' && idx > 0) backBtn.click();
    };
    document.addEventListener('keydown', keys);
    render();
    return () => document.removeEventListener('keydown', keys);
  };

  /* ================= PRACTICE HUB ================= */
  pages.practice = view => {
    view.append(header('Practice', 'Every skill has an **infinite** problem generator with hints and step-by-step solutions. Difficulty adapts as you improve.'));
    const due = store.reviewQueue().length;
    view.append(el('div', { class: 'tiles' },
      el('a', { href: '#/practice/mix/all', class: 'card tile clickable' }, el('div', { class: 'tile-ic', html: CL.icon('zap') }), el('div', {}, el('b', {}, 'Mixed practice'), el('div', { class: 'muted small' }, 'Interleaved problems'))),
      el('a', { href: '#/practice/review', class: 'card tile clickable' }, el('div', { class: 'tile-ic rev', html: CL.icon('repeat') }), el('div', {}, el('b', {}, 'Spaced review'), el('div', { class: 'muted small' }, due + ' due'))),
      el('a', { href: '#/practice/mix/weak', class: 'card tile clickable' }, el('div', { class: 'tile-ic', html: CL.icon('target') }), el('div', {}, el('b', {}, 'Weak spots'), el('div', { class: 'muted small' }, 'Lowest mastery first'))),
      el('a', { href: '#/quiz/all', class: 'card tile clickable' }, el('div', { class: 'tile-ic', html: CL.icon('trophy') }), el('div', {}, el('b', {}, 'Exam simulator'), el('div', { class: 'muted small' }, '15 questions, no hints')))));
    const q = el('input', { class: 'input', type: 'search', placeholder: 'Filter skills…', 'aria-label': 'Filter skills' });
    view.append(el('div', { class: 'filter-row' }, q));
    const body = el('div'); view.append(body);
    function render() {
      body.innerHTML = '';
      const f = q.value.toLowerCase();
      for (const u of CL.course.units) {
        const sk = CL.course.skillsOfUnit(u.id).filter(s => !f || (s.title + ' ' + s.desc + ' ' + u.title).toLowerCase().includes(f));
        if (!sk.length) continue;
        const sec = card('skill-unit', el('div', { class: 'card-head' }, el('h3', {}, u.icon + ' ' + u.title), el('div', { class: 'row' }, link('#/practice/mix/' + u.id, 'Mix this unit', 'btn btn-soft btn-sm'), link('#/quiz/' + u.id, 'Quiz', 'btn btn-ghost btn-sm'))));
        for (const s of sk) {
          const r = store.state.skills[s.id];
          const lesson = CL.course.lessonForSkill(s.id);
          sec.append(el('div', { class: 'skill-row' },
            el('div', { class: 'grow' }, el('a', { href: '#/practice/skill/' + s.id, class: 'skill-name' }, s.title), el('div', { class: 'muted small' }, s.desc)),
            el('div', { class: 'skill-meta' }, masteryChip(s.id), bar(r ? r.mastery : 0, 'thin'), el('small', { class: 'muted' }, r ? `${r.correct}/${r.attempts} · L${r.level}` : 'not started')),
            el('div', { class: 'row' }, lesson ? link('#/lesson/' + lesson.id, CL.icon('book'), 'icon-btn') : null, link('#/practice/skill/' + s.id, 'Practice', 'btn btn-primary btn-sm'))));
        }
        body.append(sec);
      }
    }
    q.addEventListener('input', render); render();
  };

  /* ================= PRACTICE SESSION ================= */
  function session(view, cfg) {
    const stats = { n: 0, first: 0, streak: 0, xp: 0, best: 0 };
    let diff = store.setting('difficulty');
    const diffChips = el('div', { class: 'wchips' }, el('span', { class: 'wlab' }, 'Difficulty'));
    [['adaptive', 'Adaptive'], [1, 'Easy'], [2, 'Medium'], [3, 'Hard']].forEach(([v, l]) => {
      const b = el('button', { type: 'button', class: 'chip' + (String(v) === String(diff) ? ' on' : '') }, l);
      b.onclick = () => { diff = v; store.setting('difficulty', v); [...diffChips.querySelectorAll('.chip')].forEach(x => x.classList.toggle('on', x === b)); nextProblem(); };
      diffChips.append(b);
    });
    const statBox = el('div', { class: 'sess-stats' });
    const timerEl = el('span', { class: 'pill', hidden: !store.setting('showTimer') });
    view.append(header(cfg.title, cfg.sub, ...(cfg.actions || [])), el('div', { class: 'sess-bar' }, diffChips, el('span', { class: 'grow' }), timerEl, statBox));
    const host = el('div', { class: 'sess-host' }); view.append(host);
    const side = el('div', { class: 'sess-foot muted small', html: 'Shortcuts: <kbd>Enter</kbd> check/next · <kbd>H</kbd> hint · <kbd>S</kbd> step · scratchpad ✏️ in the top bar' });
    view.append(side);
    let t0 = Date.now(), tick = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); timerEl.textContent = '⏱ ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }, 1000);
    function renderStats() { statBox.innerHTML = `<span class="pill">✔ ${stats.first}/${stats.n}</span><span class="pill">🔥 ${stats.streak}</span><span class="pill">⚡ +${stats.xp} XP</span>`; }
    function levelFor(skill) { return diff === 'adaptive' ? store.skill(skill).level : +diff; }
    function nextProblem() {
      host.innerHTML = ''; CL.graph.gc(); t0 = Date.now();
      const skill = cfg.pick();
      if (!skill) { host.append(cfg.empty ? cfg.empty() : el('p', {}, 'Nothing to practice.')); return; }
      const p = CL.gen.make(skill, levelFor(skill));
      CL.ui.problem(host, p, {
        showSkill: true,
        onResolve: r => {
          const res = store.recordAttempt(r);
          stats.n++; if (r.solved && r.firstTry && !r.hints) { stats.first++; stats.streak++; } else stats.streak = 0;
          stats.xp += res.xp; renderStats();
          if (res.xp) CL.ui.toast('+' + res.xp + ' XP' + (stats.streak >= 3 ? ' · 🔥 ' + stats.streak + ' in a row' : ''), 'zap');
          const sk = res.skill; if (sk.level !== r.level && diff === 'adaptive') CL.ui.toast(sk.level > r.level ? 'Level up! Problems get harder now 💪' : 'Dialing difficulty back a notch', sk.level > r.level ? 'star' : 'refresh');
          cfg.after && cfg.after(r);
        },
        onNext: nextProblem
      });
    }
    renderStats(); nextProblem();
    return () => clearInterval(tick);
  }

  pages.practiceSkill = (view, id) => {
    const sk = CL.gen.skills[id];
    if (!sk) { view.append(header('Unknown skill'), link('#/practice', 'Back', 'btn')); return; }
    const u = CL.course.unit(sk.unit); const lesson = CL.course.lessonForSkill(id);
    store.state.lastSkill = id;
    return session(view, { title: sk.title, sub: u.icon + ' ' + u.title + ' · ' + sk.desc, pick: () => id, actions: [lesson ? link('#/lesson/' + lesson.id, CL.icon('book') + ' Lesson', 'btn btn-ghost btn-sm') : null, link('#/practice', 'All skills', 'btn btn-ghost btn-sm')] });
  };

  pages.practiceMix = (view, unit) => {
    let pool, title, sub;
    if (unit === 'weak') {
      pool = Object.entries(store.state.skills).filter(([id, s]) => s.attempts > 0 && CL.gen.skills[id]).sort((a, b) => a[1].mastery - b[1].mastery).slice(0, 6).map(([id]) => id);
      title = 'Weak spots'; sub = 'Your six lowest-mastery skills, shuffled.';
      if (!pool.length) pool = CL.course.skillsOfUnit('foundations').map(s => s.id);
    } else if (unit === 'all') {
      const touched = Object.keys(store.state.skills).filter(id => CL.gen.skills[id]);
      const lessonSkills = CL.course.lessonList().filter(l => store.lesson(l.id).done || store.lesson(l.id).step > 0).flatMap(l => l.skills || []);
      pool = [...new Set([...touched, ...lessonSkills])];
      if (pool.length < 3) pool = CL.gen.list().map(s => s.id);
      title = 'Mixed practice'; sub = 'Interleaving different problem types is one of the most effective ways to learn. Skills you\'ve started appear here.';
    } else {
      const u = CL.course.unit(unit); pool = CL.course.skillsOfUnit(unit).map(s => s.id);
      title = 'Mixed: ' + (u ? u.title : unit); sub = 'Random problems from every skill in this unit.';
    }
    let last = null;
    return session(view, {
      title, sub, actions: [link('#/practice', 'All skills', 'btn btn-ghost btn-sm')],
      pick: () => {
        const w = pool.map(id => { const s = store.state.skills[id]; return [id, (1.25 - (s ? s.mastery : 0)) * (id === last ? 0.15 : 1)]; });
        let r = Math.random() * w.reduce((a, x) => a + x[1], 0);
        for (const [id, wt] of w) { r -= wt; if (r <= 0) return (last = id); }
        return (last = w[0][0]);
      }
    });
  };

  pages.review = view => {
    let queue = store.reviewQueue();
    const total = queue.length;
    return session(view, {
      title: 'Spaced review', sub: total ? `${total} skill${total === 1 ? '' : 's'} due. Answer cleanly to push them further out; miss one and it comes back soon.` : 'Skills come back here on a schedule (1, 3, 7, 14, 30… days) so you don\'t forget them.',
      pick: () => queue.shift(),
      empty: () => el('div', { class: 'empty' }, el('div', { class: 'big-emoji' }, '✅'), el('h2', {}, total ? 'Review complete!' : 'Nothing due right now'), el('p', { class: 'muted' }, 'Come back tomorrow, or keep going with mixed practice.'), link('#/practice/mix/all', 'Mixed practice', 'btn btn-primary'))
    });
  };

  /* ================= QUIZ ================= */
  pages.quiz = (view, unit) => {
    const u = unit === 'all' ? null : CL.course.unit(unit);
    const N = unit === 'all' ? 15 : 10;
    let pool = unit === 'all' ? (() => { const t = Object.keys(store.state.skills).filter(id => CL.gen.skills[id]); return t.length >= 5 ? t : CL.gen.list().map(s => s.id); })() : CL.course.skillsOfUnit(unit).map(s => s.id);
    const order = []; while (order.length < N) order.push(...U.shuffle(pool)); order.length = N;
    const probs = order.map(id => CL.gen.make(id, U.pick([2, 2, 3, 1])));
    const results = [];
    let i = 0; const t0 = Date.now();
    view.append(header(u ? 'Quiz: ' + u.title : 'Exam simulator', N + ' questions · one attempt each · no hints. Solutions are shown after each answer.'));
    const progress = el('div', { class: 'quiz-prog' }); const host = el('div'); view.append(progress, host);
    function renderProg() { progress.innerHTML = ''; for (let k = 0; k < N; k++) progress.append(el('span', { class: 'qdot' + (k === i ? ' cur' : '') + (results[k] ? (results[k].solved ? ' ok' : ' bad') : '') })); }
    function show() {
      host.innerHTML = ''; CL.graph.gc(); renderProg();
      if (i >= N) return done();
      CL.ui.problem(host, probs[i], { quiz: true, showSkill: true, nextLabel: i === N - 1 ? 'See results' : 'Next question', onResolve: r => { results[i] = r; store.recordAttempt(r); renderProg(); }, onNext: () => { i++; show(); } });
    }
    function done() {
      const score = results.filter(r => r.solved).length; const pct = score / N;
      const bonus = Math.round(score * 2 + (pct === 1 ? 20 : 0)); store.addXP(bonus, 'quiz');
      if (pct >= 0.8) { CL.ui.confetti(); CL.ui.sfx('done'); }
      const mins = Math.round((Date.now() - t0) / 60000);
      const bySkill = {}; results.forEach((r, k) => { const id = probs[k].skill; (bySkill[id] = bySkill[id] || [0, 0]); bySkill[id][1]++; if (r.solved) bySkill[id][0]++; });
      host.append(el('div', { class: 'lesson-done' }, el('div', { class: 'big-emoji' }, pct >= 0.9 ? '🏆' : pct >= 0.7 ? '🎉' : pct >= 0.5 ? '👍' : '📚'),
        el('h2', {}, score + ' / ' + N + ' (' + Math.round(pct * 100) + '%)'), el('p', { class: 'muted' }, 'Time: ~' + mins + ' min · +' + bonus + ' bonus XP'),
        el('div', { class: 'quiz-break' }, ...Object.entries(bySkill).map(([id, [a, b]]) => el('div', { class: 'qb-row' }, el('span', { class: 'grow' }, CL.gen.skills[id].title), el('b', { class: a === b ? 'good' : 'bad' }, a + '/' + b), a < b ? link('#/practice/skill/' + id, 'Practice', 'btn btn-soft btn-sm') : null))),
        el('div', { class: 'row center' }, el('button', { class: 'btn btn-primary', onclick: () => CL.router.reload() }, 'New quiz'), link('#/practice', 'Practice hub', 'btn btn-ghost'))));
    }
    show();
  };

  /* ================= GRAPHER ================= */
  pages.grapher = view => {
    view.append(header('Grapher', 'Graph functions, parametric curves (`(cos(t), sin(t))`) and polar curves (`r = 1 + cos(theta)`). Letters like `a`, `b`, `k` become sliders automatically.'));
    const layout = el('div', { class: 'grapher' }); view.append(layout);
    const panel = el('div', { class: 'gpanel card' }); const plotHost = el('div', { class: 'gplot card' });
    layout.append(panel, plotHost);
    const plot = new CL.Plot(plotHost, { xmin: -8, xmax: 8, ymin: -5, ymax: 5, height: 520, trace: true, wheelZoom: true });
    const rows = []; const params = {}; const paramBox = el('div', { class: 'gparams' });
    const list = el('div', { class: 'glist' });
    const tools = el('div', { class: 'gtools' });
    panel.append(list, el('button', { class: 'btn btn-soft btn-sm', type: 'button', onclick: () => addRow(''), html: CL.icon('plus') + ' Add expression' }), paramBox, tools);
    const saved = (() => { try { return JSON.parse(localStorage.getItem('calc2learner.grapher')) || null; } catch (e) { return null; } })();
    let showD = false, showArea = false, showTan = false;
    const aIn = el('input', { class: 'input sm', value: '0', 'aria-label': 'Area from' }), bIn = el('input', { class: 'input sm', value: '2', 'aria-label': 'Area to' }), cIn = el('input', { class: 'input sm', value: '1', 'aria-label': 'Tangent at' });
    const out = el('div', { class: 'gout md' });
    tools.append(el('h4', {}, 'Calculus tools (first function)'),
      el('label', { class: 'wtoggle' }, (() => { const c = el('input', { type: 'checkbox' }); c.onchange = () => { showD = c.checked; draw(); }; return c; })(), el('span', { html: inl("Show derivative $f'(x)$") })),
      el('label', { class: 'wtoggle' }, (() => { const c = el('input', { type: 'checkbox' }); c.onchange = () => { showTan = c.checked; draw(); }; return c; })(), el('span', {}, 'Tangent line at x = '), cIn),
      el('label', { class: 'wtoggle' }, (() => { const c = el('input', { type: 'checkbox' }); c.onchange = () => { showArea = c.checked; draw(); }; return c; })(), el('span', {}, 'Integral from '), aIn, el('span', {}, ' to '), bIn),
      out);
    [aIn, bIn, cIn].forEach(i => i.addEventListener('input', draw));
    const COLORS = [1, 2, 3, 4, 5, 6];
    function addRow(text) {
      const r = { text, on: true, color: COLORS[rows.length % 6] };
      const inp = el('input', { class: 'input gexpr', value: text, placeholder: 'e.g. x^2 - 2, sin(a*x), r = 2cos(3theta)', spellcheck: 'false', 'aria-label': 'Expression' });
      const dot = el('button', { class: 'gdot c' + r.color, type: 'button', title: 'Show/hide', 'aria-label': 'Toggle visibility' });
      const del = el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Remove', html: CL.icon('x') });
      const prev = el('div', { class: 'gprev' });
      const row = el('div', { class: 'grow-row' }, dot, el('div', { class: 'grow' }, inp, prev), del);
      r.el = row; r.prev = prev;
      inp.addEventListener('input', () => { r.text = inp.value; draw(); });
      dot.onclick = () => { r.on = !r.on; dot.classList.toggle('off', !r.on); draw(); };
      del.onclick = () => { rows.splice(rows.indexOf(r), 1); row.remove(); draw(); };
      rows.push(r); list.append(row); draw();
      return r;
    }
    function parseRow(t) {
      t = t.trim(); if (!t) return null;
      const E = CL.expr;
      let kind = 'fn', body = t, vars = ['x'];
      if (/^r\s*=/.test(t)) { kind = 'polar'; body = t.replace(/^r\s*=/, ''); vars = ['theta']; }
      else if (/^\(.*,.*\)$/.test(t)) { kind = 'param'; vars = ['t']; }
      else body = t.replace(/^(y|f\(x\))\s*=/, '');
      if (kind === 'param') {
        const inner = t.slice(1, -1); let depth = 0, cut = -1;
        for (let i = 0; i < inner.length; i++) { const ch = inner[i]; if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ',' && depth === 0) { cut = i; break; } }
        const xs = inner.slice(0, cut), ys = inner.slice(cut + 1);
        const tx = E.parse(xs), ty = E.parse(ys);
        const fv = [...E.vars(tx), ...E.vars(ty)].filter(v => !['t'].includes(v));
        return { kind, x: E.compile(tx), y: E.compile(ty), free: fv, tex: '\\left(' + E.tex(tx) + ',\\ ' + E.tex(ty) + '\\right)' };
      }
      const tree = E.parse(body);
      const free = [...E.vars(tree)].filter(v => !vars.includes(v) && !(kind === 'fn' && v === 'y'));
      return { kind, f: E.compile(tree), free, tex: (kind === 'polar' ? 'r = ' : 'y = ') + E.tex(tree) };
    }
    function ensureParams(names) {
      for (const n of names) if (!(n in params)) {
        params[n] = { v: 1 };
        const s = CL.wkit.slider(paramBox, { label: '$' + (n === 'theta' ? '\\theta' : n) + '$', min: -5, max: 5, step: 0.1, value: 1, onInput: v => { params[n].v = v; draw(); } });
        params[n].s = s;
      }
      for (const n of Object.keys(params)) params[n].s.show(names.includes(n));
    }
    function draw() {
      const layers = []; const allFree = new Set(); let first = null;
      for (const r of rows) {
        let p = null;
        try { p = parseRow(r.text); r.prev.innerHTML = p ? CL.tex(p.tex) : ''; r.prev.classList.remove('err'); } catch (e) { r.prev.textContent = e.message; r.prev.classList.add('err'); }
        if (!p) continue;
        p.free.forEach(v => allFree.add(v));
        const env = () => { const o = {}; for (const k in params) o[k] = params[k].v; return o; };
        if (!r.on) continue;
        if (p.kind === 'fn') { const f = x => p.f({ ...env(), x }); layers.push({ type: 'fn', f, color: r.color, width: 2.6 }); if (!first) first = f; }
        else if (p.kind === 'polar') layers.push({ type: 'polar', r: th => p.f({ ...env(), theta: th }), t: [0, 4 * Math.PI], n: 1200, color: r.color, width: 2.6 });
        else layers.push({ type: 'param', x: t => p.x({ ...env(), t }), y: t => p.y({ ...env(), t }), t: [-10, 10], n: 1500, color: r.color, width: 2.6 });
      }
      ensureParams([...allFree]);
      let info = [];
      if (first) {
        const d = x => (first(x + 1e-5) - first(x - 1e-5)) / 2e-5;
        if (showD) layers.push({ type: 'fn', f: d, color: 'text', dash: true, width: 2, trace: false });
        if (showArea) { const a = +aIn.value, b = +bIn.value; if (isFinite(a) && isFinite(b)) { layers.unshift({ type: 'area', f: first, a, b, signed: true, color: 1 }); const v = CL.wkit.simpson(first, a, b, 1000); info.push(`$\\displaystyle\\int_{${U.fmt(a)}}^{${U.fmt(b)}} f(x)\\,dx \\approx ${U.fmt(v, 6)}$`); } }
        if (showTan) { const c = +cIn.value; if (isFinite(c) && isFinite(first(c))) { const m = d(c); layers.push({ type: 'line', x0: c, y0: first(c), m, color: 'text', width: 1.5 }, { type: 'point', x: c, y: first(c), color: 'text' }); info.push(`Tangent at $x = ${U.fmt(c)}$: $y = ${U.fmt(m, 4)}(x - ${U.fmt(c)}) + ${U.fmt(first(c), 4)}$`); } }
      }
      out.innerHTML = md(info.join('\n\n'));
      plot.set(layers);
      try { localStorage.setItem('calc2learner.grapher', JSON.stringify(rows.map(r => r.text))); } catch (e) {}
    }
    (saved && saved.length ? saved : ['sin(a*x)', 'x^2/4 - 1']).forEach(addRow);
    const pre = el('div', { class: 'gpresets' }, el('span', { class: 'muted small' }, 'Try: '));
    [['Taylor sin', ['sin(x)', 'x - x^3/6 + x^5/120']], ['Rose', ['r = 3cos(k*theta)']], ['Cycloid', ['(t - sin(t), 1 - cos(t))']], ['Slope', ['x^3 - 3x']], ['e^x vs ln', ['e^x', 'ln(x)', 'x']]].forEach(([n, exps]) => pre.append(el('button', { class: 'chip', type: 'button', onclick: () => { rows.slice().forEach(r => r.el.remove()); rows.length = 0; exps.forEach(addRow); } }, n)));
    panel.prepend(pre);
  };

  /* ================= REFERENCE ================= */
  pages.reference = (view, sec) => {
    view.append(header('Formula reference', 'Everything you need on one page. Use Ctrl/⌘+F or the filter.'));
    const q = el('input', { class: 'input', type: 'search', placeholder: 'Filter (e.g. "ratio", "washer", "sec")…', 'aria-label': 'Filter formulas' });
    const toc = el('div', { class: 'chips-row' });
    const body = el('div', { class: 'ref-grid' });
    view.append(el('div', { class: 'filter-row' }, q), toc, body);
    for (const s of CL.REFERENCE) {
      toc.append(el('a', { class: 'chip', href: '#/reference/' + s.id }, s.title));
      body.append(card('ref', { id: 'ref-' + s.id }.id ? el('h2', { id: 'ref-' + s.id }, s.title) : null, el('div', { class: 'md', html: md(s.md) })));
    }
    q.addEventListener('input', () => { const f = q.value.toLowerCase(); [...body.children].forEach((c, i) => { const s = CL.REFERENCE[i]; c.hidden = f && !(s.title + ' ' + s.keywords + ' ' + s.md).toLowerCase().includes(f); }); });
    if (sec) setTimeout(() => { const t = document.getElementById('ref-' + sec); t && t.scrollIntoView({ behavior: 'smooth' }); }, 60);
  };

  /* ================= PROGRESS ================= */
  pages.progress = view => {
    const s = store.state, lv = store.levelInfo();
    const totalAtt = Object.values(s.skills).reduce((a, k) => a + k.attempts, 0);
    const totalFirst = Object.values(s.skills).reduce((a, k) => a + k.firstTry, 0);
    view.append(header('Progress', 'Your stats, mastery and achievements.'));
    view.append(el('div', { class: 'tiles' },
      card('tile', el('div', { class: 'tile-ic lvl', html: '<b>' + lv.level + '</b>' }), el('div', {}, el('div', { class: 'tile-n' }, s.xp + ' XP'), el('div', { class: 'muted small' }, 'Level ' + lv.level))),
      card('tile', el('div', { class: 'tile-ic', html: CL.icon('check') }), el('div', {}, el('div', { class: 'tile-n' }, store.totalSolved()), el('div', { class: 'muted small' }, 'problems solved'))),
      card('tile', el('div', { class: 'tile-ic', html: CL.icon('target') }), el('div', {}, el('div', { class: 'tile-n' }, totalAtt ? Math.round(totalFirst / totalAtt * 100) + '%' : '—'), el('div', { class: 'muted small' }, 'first-try accuracy'))),
      card('tile', el('div', { class: 'tile-ic', html: CL.icon('book') }), el('div', {}, el('div', { class: 'tile-n' }, store.doneLessons() + '/' + CL.course.lessonList().length), el('div', { class: 'muted small' }, 'lessons complete')))));

    // last 30 days chart
    const days = U.range(0, 29).map(i => U.addDays(U.today(), i - 29));
    const max = Math.max(10, ...days.map(d => (s.daily[d] || {}).xp || 0));
    const chart = el('div', { class: 'barchart', role: 'img', 'aria-label': 'XP per day, last 30 days' });
    days.forEach(d => { const v = (s.daily[d] || {}).xp || 0; chart.append(el('div', { class: 'bc-col', title: d + ': ' + v + ' XP' }, el('span', { style: { height: (v / max * 100) + '%' } }))); });
    view.append(el('div', { class: 'grid-2' }, card('', el('h3', {}, 'XP — last 30 days'), chart, el('div', { class: 'row muted small spread' }, el('span', {}, days[0]), el('span', {}, 'today'))), card('', el('h3', {}, 'Activity'), heatmap(22))));

    // mastery by unit
    const mu = card('', el('h3', {}, 'Mastery by unit'));
    for (const u of CL.course.units) { const p = unitProgress(u); mu.append(el('div', { class: 'up-row' }, el('span', { class: 'up-ic' }, u.icon), el('span', { class: 'up-t' }, u.title), bar(p.mastery, 'good'), el('span', { class: 'up-n small muted' }, Math.round(p.mastery * 100) + '%'))); }
    view.append(mu);

    // skills table
    const rows = Object.entries(s.skills).filter(([id]) => CL.gen.skills[id]).sort((a, b) => b[1].mastery - a[1].mastery);
    const tbl = card('', el('h3', {}, 'Skills you\'ve practiced'));
    if (!rows.length) tbl.append(el('p', { class: 'muted' }, 'No practice yet — your skill table will fill in as you go.'));
    else tbl.append(el('div', { class: 'table-wrap' }, el('table', { class: 'skills-table' }, el('thead', { html: '<tr><th>Skill</th><th>Mastery</th><th>Correct</th><th>Level</th><th>Next review</th><th></th></tr>' }),
      el('tbody', {}, ...rows.map(([id, k]) => el('tr', {}, el('td', {}, CL.gen.skills[id].title), el('td', {}, masteryChip(id)), el('td', {}, k.correct + '/' + k.attempts), el('td', {}, 'L' + k.level), el('td', { class: 'muted' }, k.due || '—'), el('td', {}, link('#/practice/skill/' + id, 'Practice', 'btn btn-ghost btn-sm'))))))));
    view.append(tbl);

    // achievements
    const ag = el('div', { class: 'ach-grid' });
    for (const a of store.ACH) { const got = s.achievements[a.id]; ag.append(el('div', { class: 'ach' + (got ? ' got' : ''), title: got ? 'Earned ' + new Date(got).toLocaleDateString() : 'Locked' }, el('span', { class: 'ach-ic' }, got ? a.icon : '🔒'), el('b', {}, a.name), el('small', { class: 'muted' }, a.desc))); }
    view.append(card('', el('h3', {}, 'Achievements (' + Object.keys(s.achievements).length + '/' + store.ACH.length + ')'), ag));

    // recent
    const rec = s.history.slice(-15).reverse();
    if (rec.length) view.append(card('', el('h3', {}, 'Recent attempts'), el('div', { class: 'recent' }, ...rec.map(h => el('div', { class: 'rec-row' }, el('span', { class: h.ok && !h.rv ? 'good' : 'bad' }, h.ok && !h.rv ? '✔' : '✘'), el('span', { class: 'grow' }, CL.gen.skills[h.s] ? CL.gen.skills[h.s].title : h.s), el('small', { class: 'muted' }, 'L' + h.lv + (h.h ? ' · ' + h.h + ' hint' + (h.h > 1 ? 's' : '') : '') + ' · ' + new Date(h.t).toLocaleString()))))));
  };

  /* ================= SAVED ================= */
  pages.saved = view => {
    const s = store.state;
    view.append(header('Saved', 'Problems you bookmarked (☆ on any problem) and your lesson notes.'));
    const bm = card('', el('h3', {}, 'Saved problems (' + s.bookmarks.length + ')'));
    if (!s.bookmarks.length) bm.append(el('p', { class: 'muted' }, 'Nothing saved yet. Click the bookmark icon on any problem to save it here for later review.'));
    for (const b of s.bookmarks) {
      const box = el('div', { class: 'saved-item' });
      const head = el('div', { class: 'row' }, el('b', { class: 'grow' }, (CL.gen.skills[b.skill] || {}).title || 'Problem'), el('small', { class: 'muted' }, new Date(b.t).toLocaleDateString()),
        el('button', { class: 'btn btn-soft btn-sm', type: 'button', onclick: () => { body.innerHTML = ''; CL.ui.problem(body, b.prob, { allowBookmark: false, compact: true, onResolve: r => store.recordAttempt(r) }); } }, 'Try it'),
        el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Delete', html: CL.icon('trash'), onclick: () => { store.removeBookmark(b.id); box.remove(); } }));
      const body = el('div', { class: 'md', html: md(b.prob.q) });
      box.append(head, body); bm.append(box);
    }
    const nt = card('', el('h3', {}, 'Lesson notes'));
    const notes = Object.entries(s.notes);
    if (!notes.length) nt.append(el('p', { class: 'muted' }, 'Open any lesson and click Notes to write your own summary.'));
    for (const [id, text] of notes) { const l = CL.course.lesson(id); nt.append(el('div', { class: 'saved-item' }, el('div', { class: 'row' }, el('b', { class: 'grow' }, l ? l.title : id), l ? link('#/lesson/' + id, 'Open lesson', 'btn btn-ghost btn-sm') : null), el('pre', { class: 'note-text' }, text))); }
    view.append(bm, nt);
  };

  /* ================= SETTINGS ================= */
  pages.settings = view => {
    const S = store.state.settings;
    view.append(header('Settings', 'Make it yours. Everything is saved in this browser.'));
    const set = (k, v) => { store.setting(k, v); };
    const field = (label, desc, control) => el('div', { class: 'set-row' }, el('div', { class: 'grow' }, el('b', {}, label), desc ? el('div', { class: 'muted small' }, desc) : null), control);
    const sw = k => { const i = el('input', { type: 'checkbox', class: 'switch', 'aria-label': k }); i.checked = !!S[k]; i.onchange = () => set(k, i.checked); return i; };
    const range = (k, min, max, step, fmt) => { const v = el('span', { class: 'small muted' }); const i = el('input', { type: 'range', min, max, step, value: S[k], 'aria-label': k }); const u = () => v.textContent = fmt(+i.value); i.oninput = () => { u(); set(k, +i.value); }; u(); return el('div', { class: 'row' }, i, v); };
    const seg = (k, opts) => { const w = el('div', { class: 'wchips' }); opts.forEach(([val, lab]) => { const b = el('button', { type: 'button', class: 'chip' + (String(S[k]) === String(val) ? ' on' : '') }, lab); b.onclick = () => { set(k, val); [...w.children].forEach(x => x.classList.toggle('on', x === b)); }; w.append(b); }); return w; };

    const name = el('input', { class: 'input', value: S.name, placeholder: 'Your first name', 'aria-label': 'Name' }); name.oninput = U.debounce(() => set('name', name.value.trim()), 300);
    view.append(card('', el('h3', {}, 'Profile'), field('Name', 'Used for greetings on the home page.', name), field('Daily XP goal', 'About 10 XP per problem.', seg('dailyGoal', [[30, 'Casual 30'], [60, 'Regular 60'], [120, 'Serious 120'], [200, 'Intense 200']]))));

    const themes = el('div', { class: 'theme-grid' });
    [['system', 'System'], ['light', 'Light'], ['dark', 'Dark'], ['sepia', 'Sepia'], ['midnight', 'Midnight'], ['contrast', 'High contrast']].forEach(([v, l]) => {
      const b = el('button', { type: 'button', class: 'theme-card t-' + v + (S.theme === v ? ' on' : ''), 'aria-pressed': S.theme === v }, el('span', { class: 'theme-swatch' }, el('i'), el('i'), el('i')), l);
      b.onclick = () => { set('theme', v); [...themes.children].forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); };
      themes.append(b);
    });
    const acc = el('div', { class: 'row wrap' });
    Object.entries(CL.ui.ACCENTS).forEach(([k, c]) => { const b = el('button', { type: 'button', class: 'swatch big' + (S.accent === k ? ' on' : ''), title: k, 'aria-label': 'Accent ' + k, style: { background: c } }); b.onclick = () => { set('accent', k); [...acc.children].forEach(x => x.classList.toggle('on', x === b)); }; acc.append(b); });
    view.append(card('', el('h3', {}, 'Appearance'), field('Theme', null, themes), field('Accent color', null, acc),
      field('Text size', null, range('fontScale', 0.85, 1.3, 0.05, v => Math.round(v * 100) + '%')),
      field('Math size', 'Size of rendered equations relative to text.', range('mathScale', 0.9, 1.4, 0.02, v => Math.round(v * 100) + '%')),
      field('Reduce motion', 'Turn off animations, shakes and confetti.', sw('reduceMotion')),
      field('Compact sidebar', 'Icons only in the navigation (desktop).', sw('compactSidebar')),
      field('Graph grid lines', null, sw('graphGrid'))));

    view.append(card('', el('h3', {}, 'Practice'),
      field('Default difficulty', 'Adaptive raises the level after 3 clean answers and lowers it after 2 misses.', seg('difficulty', [['adaptive', 'Adaptive'], [1, 'Easy'], [2, 'Medium'], [3, 'Hard']])),
      field('Math keypad', 'On-screen buttons for √, π, sin, ^ and more.', sw('keypad')),
      field('Live answer preview', 'See your typed answer rendered as math.', sw('livePreview')),
      field('Auto-advance', 'Load the next problem automatically after a correct answer.', sw('autoNext')),
      field('Session timer', 'Show a stopwatch during practice.', sw('showTimer')),
      field('Require lesson checkpoints', 'Must answer quick-checks before continuing a lesson.', sw('requireChecks')),
      field('Sound effects', null, sw('sound')),
      field('Celebrations', 'Confetti when you finish a lesson or ace a quiz.', sw('confetti'))));

    const fileIn = el('input', { type: 'file', accept: 'application/json,.json', hidden: true });
    fileIn.onchange = () => { const f = fileIn.files[0]; if (!f) return; f.text().then(t => { try { store.importJSON(t); CL.ui.toast('Progress imported!'); CL.router.reload(); } catch (e) { CL.ui.toast('Import failed: ' + e.message, 'x', 'bad'); } }); };
    view.append(card('', el('h3', {}, 'Your data'),
      el('p', { class: 'muted small' }, 'Progress is stored locally in this browser (no account needed). Export a backup to move it to another device.'),
      el('div', { class: 'row wrap' },
        el('button', { class: 'btn btn-soft', type: 'button', html: CL.icon('download') + ' Export backup', onclick: () => { const blob = new Blob([store.exportJSON()], { type: 'application/json' }); const a = el('a', { href: URL.createObjectURL(blob), download: 'calc2learner-backup-' + U.today() + '.json' }); document.body.append(a); a.click(); a.remove(); } }),
        el('button', { class: 'btn btn-soft', type: 'button', html: CL.icon('upload') + ' Import backup', onclick: () => fileIn.click() }), fileIn,
        el('button', { class: 'btn btn-danger', type: 'button', html: CL.icon('trash') + ' Reset progress', onclick: () => { if (confirm('Erase ALL progress (XP, mastery, lessons, notes, bookmarks)? Settings are kept. This cannot be undone.')) { store.reset(true); CL.ui.toast('Progress reset'); CL.router.reload(); } } }))));

    view.append(card('', el('h3', {}, 'Help'), el('div', { class: 'row wrap' }, el('button', { class: 'btn btn-ghost', type: 'button', onclick: CL.ui.shortcuts, html: CL.icon('keyboard') + ' Keyboard shortcuts' })),
      el('div', { class: 'md small muted', html: md('**Typing answers:** use `^` for powers, `sqrt()`, `pi`, `e`, `ln`, `sin`, `arctan`, `|x|` or `abs()`. Implicit multiplication works (`2x`, `3sin(x)`). Fractions like `5pi/6` are fine. Type `inf` for ∞, `DNE` for does-not-exist, and `diverges` for divergent series/integrals. Decimal answers are accepted when correctly rounded to 2+ places, but exact answers are encouraged.') })));
  };

  CL.pages = pages;
})();
