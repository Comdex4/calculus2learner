/* The interactive problem card used by practice, quizzes, lessons and saved problems. */
(function () {
  'use strict';
  const CL = (window.CL = window.CL || {});
  const { U, store } = CL;
  const el = U.el;
  CL.ui = CL.ui || {};

  const PLACEHOLDER = {
    num: 'Type a number or exact expression, e.g. 3/4, sqrt(2)/2, 5pi/6',
    expr: 'Type an expression, e.g. 3x^2 + sin(x)',
    anti: 'Antiderivative (the +C is optional), e.g. x^3/3 + ln|x|',
    set: 'Separate answers with commas, e.g. -2, 3',
    tuple: 'Components separated by commas, e.g. 1, -2, 3'
  };

  function keypad(input, vars, onChange) {
    const keys = [
      ...vars.map(v => [v === 'theta' ? 'θ' : v, v]), ['xʸ', '^'], ['(', '('], [')', ')'], ['÷', '/'], ['×', '*'],
      ['√', 'sqrt('], ['π', 'pi'], ['e', 'e'], ['sin', 'sin('], ['cos', 'cos('], ['tan', 'tan('], ['ln', 'ln('], ['|x|', 'abs('],
      ['arctan', 'arctan('], ['∞', 'inf'], ['DNE', 'DNE'], [',', ', '], ['⌫', 'BS']
    ];
    const pad = el('div', { class: 'keypad', 'aria-label': 'Math keypad' });
    for (const [lab, ins] of keys) {
      pad.append(el('button', {
        type: 'button', class: 'key' + (ins === 'BS' ? ' key-bs' : ''), tabindex: '-1', 'aria-label': ins === 'BS' ? 'Backspace' : lab,
        onmousedown: e => e.preventDefault(),
        onclick: () => {
          const s = input.selectionStart ?? input.value.length, e2 = input.selectionEnd ?? s;
          if (ins === 'BS') { if (s === e2 && s > 0) { input.value = input.value.slice(0, s - 1) + input.value.slice(e2); input.setSelectionRange(s - 1, s - 1); } else { input.value = input.value.slice(0, s) + input.value.slice(e2); input.setSelectionRange(s, s); } }
          else { input.value = input.value.slice(0, s) + ins + input.value.slice(e2); const p = s + ins.length; input.setSelectionRange(p, p); }
          input.focus(); onChange();
        }
      }, lab));
    }
    return pad;
  }

  /**
   * Render a problem.
   * opts: { onResolve(result), onNext(), quiz, compact, showSkill, nextLabel, allowBookmark }
   */
  function problem(host, prob, opts = {}) {
    const a = prob.a;
    const st = { attempts: 0, hints: 0, steps: 0, resolved: false, solved: false, revealed: false };
    const root = el('div', { class: 'prob' + (opts.compact ? ' prob-compact' : '') });
    host.append(root);

    // header
    const head = el('div', { class: 'prob-head' });
    if (opts.showSkill !== false) head.append(el('span', { class: 'pill pill-soft' }, prob.title || ''));
    head.append(el('span', { class: 'pill lv lv' + prob.level, title: 'Difficulty level' }, ['', 'Level 1 · Easy', 'Level 2 · Medium', 'Level 3 · Hard'][prob.level]));
    const spacer = el('span', { class: 'grow' }); head.append(spacer);
    if (opts.allowBookmark !== false) {
      const bm = el('button', { class: 'icon-btn', type: 'button', title: 'Save this problem', 'aria-label': 'Save this problem', html: CL.icon('bookmark') });
      bm.addEventListener('click', () => {
        const copy = JSON.parse(JSON.stringify({ ...prob, graph: prob.graph && serializableGraph(prob.graph) ? prob.graph : undefined }));
        store.addBookmark({ prob: copy, skill: prob.skill });
        bm.classList.add('on'); bm.innerHTML = CL.icon('bookmarkFilled'); CL.ui.toast('Saved to your problem set', 'bookmark');
      });
      head.append(bm);
    }
    const lessonFor = CL.course && CL.course.lessonForSkill(prob.skill);
    if (lessonFor && !opts.compact) head.append(el('a', { class: 'icon-btn', href: '#/lesson/' + lessonFor.id, title: 'Review the lesson: ' + lessonFor.title, 'aria-label': 'Review lesson', html: CL.icon('book') }));
    root.append(head);

    const q = el('div', { class: 'prob-q md' }); CL.mdInto(q, prob.q); root.append(q);

    // graph
    if (prob.graph) {
      const gwrap = el('div', { class: 'prob-graph' });
      const gbtn = el('button', { class: 'btn btn-ghost btn-sm', type: 'button', html: CL.icon('chart') + ' Show graph' });
      let shown = false, plot = null;
      gbtn.addEventListener('click', () => {
        shown = !shown; gbtn.innerHTML = CL.icon('chart') + (shown ? ' Hide graph' : ' Show graph');
        if (shown && !plot) { const h = el('div'); gwrap.append(h); try { plot = CL.graph.fromSpec(h, prob.graph); } catch (e) { h.textContent = 'Graph unavailable'; } }
        if (plot) plot.wrap.parentElement.style.display = shown ? '' : 'none';
      });
      gwrap.append(gbtn); root.append(gwrap);
    }

    // answer area
    const ansArea = el('div', { class: 'prob-answer' });
    root.append(ansArea);
    const feedback = el('div', { class: 'prob-feedback', role: 'status', 'aria-live': 'polite' });
    let input, checkBtn, preview, mcButtons = [];

    if (a.type === 'mc') {
      const list = el('div', { class: 'mc-list' });
      a.choices.forEach((c, i) => {
        const b = el('button', { type: 'button', class: 'mc-choice' }, el('span', { class: 'mc-letter' }, 'ABCDEF'[i]), el('span', { class: 'mc-text md', html: CL.md(c).replace(/^<p>|<\/p>$/g, '') }));
        b.addEventListener('click', () => chooseMC(i, b));
        mcButtons.push(b); list.append(b);
      });
      ansArea.append(list);
    } else {
      const row = el('div', { class: 'ans-row' });
      input = el('input', { class: 'ans-input', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder: PLACEHOLDER[a.type] || 'Your answer', 'aria-label': 'Your answer' });
      checkBtn = el('button', { class: 'btn btn-primary', type: 'button' }, 'Check');
      row.append(el('span', { class: 'ans-prefix', html: CL.tex(a.type === 'anti' ? '\\int\\!=' : '=') }), input, checkBtn);
      preview = el('div', { class: 'ans-preview', 'aria-hidden': 'true' });
      ansArea.append(row, preview);
      const upd = () => {
        if (store.setting('livePreview') === false) { preview.innerHTML = ''; return; }
        const pv = CL.expr.preview(input.value, a.type);
        preview.innerHTML = pv.error ? '<span class="muted small">' + U.esc(pv.error) + '</span>' : pv.tex ? CL.tex(pv.tex, false) : '<span class="muted small">Live preview appears here</span>';
      };
      input.addEventListener('input', upd);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (st.resolved) next(); else check(); } });
      checkBtn.addEventListener('click', () => st.resolved ? next() : check());
      if (store.setting('keypad')) {
        const kp = keypad(input, a.vars || (a.type === 'num' || a.type === 'set' || a.type === 'tuple' ? [] : ['x']), upd);
        const kbtn = el('button', { type: 'button', class: 'btn btn-ghost btn-sm kp-toggle', html: CL.icon('keyboard') + ' Keypad' });
        kp.hidden = window.innerWidth > 900 ? false : true;
        kbtn.addEventListener('click', () => { kp.hidden = !kp.hidden; });
        ansArea.append(kbtn, kp);
      }
      upd();
      setTimeout(() => { if (!opts.noFocus && window.innerWidth > 700 && root.isConnected) input.focus({ preventScroll: true }); }, 50);
    }
    root.append(feedback);

    // actions
    const actions = el('div', { class: 'prob-actions' });
    const hintBtn = el('button', { class: 'btn btn-soft', type: 'button' });
    const stepBtn = el('button', { class: 'btn btn-soft', type: 'button', html: CL.icon('list') + ' Break it down' });
    const revealBtn = el('button', { class: 'btn btn-ghost', type: 'button' }, 'Show answer');
    const nextBtn = el('button', { class: 'btn btn-primary', type: 'button', hidden: true, html: (opts.nextLabel || 'Next problem') + ' ' + CL.icon('arrow') });
    if (!opts.quiz) actions.append(hintBtn, stepBtn, revealBtn);
    actions.append(el('span', { class: 'grow' }), nextBtn);
    root.append(actions);
    const hintsBox = el('div', { class: 'prob-hints' });
    const stepsBox = el('ol', { class: 'prob-steps' });
    root.append(hintsBox, stepsBox);

    function updHint() {
      const left = prob.hints.length - st.hints;
      hintBtn.innerHTML = CL.icon('bulb') + (left > 0 ? ` Hint (${left})` : ' No more hints');
      hintBtn.disabled = left <= 0;
      stepBtn.innerHTML = CL.icon('list') + (st.steps === 0 ? ' Break it down' : st.steps < prob.steps.length ? ` Next step (${st.steps}/${prob.steps.length})` : ' All steps shown');
      stepBtn.disabled = st.steps >= prob.steps.length;
    }
    updHint();
    hintBtn.addEventListener('click', showHint);
    stepBtn.addEventListener('click', showStep);
    revealBtn.addEventListener('click', reveal);
    nextBtn.addEventListener('click', next);

    function showHint() {
      if (st.hints >= prob.hints.length) return;
      const h = el('div', { class: 'hint md' }); CL.mdInto(h, '**Hint ' + (st.hints + 1) + ':** ' + prob.hints[st.hints]);
      hintsBox.append(h); st.hints++; updHint();
    }
    function showStep() {
      if (st.steps >= prob.steps.length) return;
      const li = el('li', { class: 'step md' }); CL.mdInto(li, prob.steps[st.steps]);
      stepsBox.append(li); st.steps++; updHint();
      if (st.steps >= prob.steps.length && !st.resolved) showAnswer(false);
    }
    function correctText() {
      if (a.type === 'mc') return a.choices[a.correct];
      return a.tex ? '$' + (a.type === 'anti' && !/\+ C$/.test(a.tex) ? a.tex + ' + C' : a.tex) + '$' : String(a.v);
    }
    function showAnswer(viaReveal) {
      while (st.steps < prob.steps.length) { const li = el('li', { class: 'step md' }); CL.mdInto(li, prob.steps[st.steps]); stepsBox.append(li); st.steps++; }
      updHint();
      if (!st.resolved) {
        st.revealed = true;
        setFeedback('info', '**Answer:** ' + correctText() + (viaReveal ? '' : ''));
        if (a.type === 'mc') mcButtons[a.correct].classList.add('correct');
        resolve(false);
      }
    }
    function reveal() { showAnswer(true); }
    function setFeedback(kind, md) { feedback.className = 'prob-feedback show fb-' + kind; CL.mdInto(feedback, md); }

    function chooseMC(i, b) {
      if (st.resolved) return;
      if (i === a.correct) {
        b.classList.add('correct');
        mcButtons.forEach(x => x.disabled = true);
        setFeedback('good', praise());
        resolve(true);
      } else {
        st.attempts++;
        b.classList.add('wrong'); b.disabled = true;
        CL.ui.sfx('wrong');
        if (opts.quiz) { mcButtons[a.correct].classList.add('correct'); mcButtons.forEach(x => x.disabled = true); setFeedback('bad', 'Not quite. The answer is highlighted.'); showAnswerSteps(); resolve(false); return; }
        setFeedback('bad', 'Not quite — try again' + (st.attempts >= 2 && st.hints < prob.hints.length ? ', or take a hint.' : '.'));
        shake(b);
      }
    }
    function showAnswerSteps() { while (st.steps < prob.steps.length) { const li = el('li', { class: 'step md' }); CL.mdInto(li, prob.steps[st.steps]); stepsBox.append(li); st.steps++; } }

    function check() {
      if (st.resolved) return;
      const raw = input.value;
      const r = CL.expr.check(raw, a);
      if (r.empty) { setFeedback('info', r.msg); input.focus(); return; }
      if (r.parseError) { setFeedback('warn', "I couldn't read that: " + U.esc(r.msg) + '. Check the preview below the box.'); return; }
      if (r.ok) {
        input.classList.add('ok'); input.readOnly = true;
        setFeedback('good', praise() + (a.type !== 'num' && a.tex ? '  Our form: ' + correctText() : ''));
        resolve(true);
        return;
      }
      st.attempts++;
      input.classList.remove('ok'); shake(input);
      CL.ui.sfx('wrong');
      let msg = r.msg ? U.esc(r.msg) : 'Not quite.';
      if (prob.mistakes) for (const m of prob.mistakes) { try { if (CL.expr.check(raw, { ...a, v: m.v }).ok) { msg = m.msg; break; } } catch (e) {} }
      if (opts.quiz) { setFeedback('bad', msg + ' **Answer:** ' + correctText()); input.readOnly = true; showAnswerSteps(); resolve(false); return; }
      setFeedback('bad', msg + (st.attempts >= 2 ? (st.hints < prob.hints.length ? ' Try a hint 💡' : ' Try breaking it down step by step.') : ' Try again!'));
    }
    function praise() { return U.pick(['**Correct!** ', '**Nice work!** ', '**Exactly right.** ', '**Nailed it.** ', '**Yes!** ']) + (st.attempts === 0 && st.hints === 0 && st.steps === 0 ? '' : ''); }
    function shake(n) { if (store.setting('reduceMotion')) return; n.classList.remove('shake'); void n.offsetWidth; n.classList.add('shake'); }

    function resolve(solved) {
      if (st.resolved) return;
      st.resolved = true; st.solved = solved && !st.revealed;
      if (checkBtn) { checkBtn.textContent = opts.nextLabel || 'Next'; }
      hintBtn.disabled = stepBtn.disabled = revealBtn.disabled = true;
      if (st.steps < prob.steps.length && !opts.quiz) {
        stepBtn.disabled = false; stepBtn.innerHTML = CL.icon('list') + ' See full solution';
        stepBtn.onclick = () => { showAnswerSteps(); stepBtn.disabled = true; };
        stepBtn.removeEventListener('click', showStep);
      }
      nextBtn.hidden = !opts.onNext;
      if (st.solved) CL.ui.sfx('good');
      const result = { skill: prob.skill, solved: st.solved, firstTry: st.attempts === 0, hints: st.hints + st.steps, revealed: st.revealed, level: prob.level };
      opts.onResolve && opts.onResolve(result);
      if (opts.onNext) setTimeout(() => nextBtn.focus({ preventScroll: true }), 30);
      if (st.solved && store.setting('autoNext') && opts.onNext && !opts.quiz) setTimeout(() => { if (root.isConnected) next(); }, 1400);
    }
    function next() { if (opts.onNext && st.resolved) opts.onNext(); }

    // keyboard shortcuts while this card is active
    root._keys = e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return false;
      const k = e.key.toLowerCase();
      if (k === 'h' && !opts.quiz) { showHint(); return true; }
      if (k === 's' && !opts.quiz) { showStep(); return true; }
      if ((k === 'n' || k === 'enter') && st.resolved) { next(); return true; }
      if (a.type === 'mc' && /^[1-6a-f]$/.test(k)) { const i = isNaN(+k) ? k.charCodeAt(0) - 97 : +k - 1; if (mcButtons[i] && !mcButtons[i].disabled) mcButtons[i].click(); return true; }
      return false;
    };
    CL.ui.activeProblem = root;
    return { root, state: st, check, showHint, showStep, reveal };
  }

  function serializableGraph(g) {
    const walk = o => { if (typeof o === 'function') return false; if (o && typeof o === 'object') return Object.values(o).every(walk); return true; };
    return walk(g);
  }

  CL.ui.problem = problem;
})();
