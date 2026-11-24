/* Persistent progress + settings stored in localStorage. */
(function () {
  'use strict';
  const CL = (window.CL = window.CL || {});
  const { U } = CL;
  const KEY = 'calc2learner.v1';

  const DEFAULT_SETTINGS = {
    name: '',
    theme: 'system',          // system | light | dark | sepia | midnight | contrast
    accent: 'indigo',
    fontScale: 1,
    mathScale: 1.08,
    reduceMotion: false,
    sound: true,
    confetti: true,
    keypad: true,
    livePreview: true,
    difficulty: 'adaptive',   // adaptive | 1 | 2 | 3
    dailyGoal: 60,            // XP per day
    requireChecks: true,      // lesson checkpoints must be answered
    autoNext: false,          // automatically load next problem after correct
    showTimer: false,
    compactSidebar: false,
    graphGrid: true,
    angleUnit: 'rad'
  };

  const BOXES = [0, 1, 3, 7, 14, 30, 60];

  function fresh() {
    return {
      version: 1,
      created: Date.now(),
      settings: { ...DEFAULT_SETTINGS },
      xp: 0,
      streak: { current: 0, best: 0, last: null },
      daily: {},
      skills: {},
      lessons: {},
      bookmarks: [],
      notes: {},
      history: [],
      achievements: {},
      lastLesson: null,
      lastSkill: null
    };
  }

  let state;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      state = raw ? JSON.parse(raw) : fresh();
    } catch (e) { state = fresh(); }
    const f = fresh();
    for (const k in f) if (state[k] === undefined) state[k] = f[k];
    state.settings = { ...DEFAULT_SETTINGS, ...state.settings };
    return state;
  }
  const persist = U.debounce(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full / blocked */ }
  }, 250);
  function save() { persist(); }
  function saveNow() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  const listeners = {};
  function on(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); return () => off(ev, fn); }
  function off(ev, fn) { listeners[ev] = (listeners[ev] || []).filter(f => f !== fn); }
  function emit(ev, data) { (listeners[ev] || []).forEach(f => { try { f(data); } catch (e) { console.error(e); } }); }

  /* ---------- levels ---------- */
  function levelInfo(xp = state.xp) {
    let lvl = 1, need = 100, base = 0;
    while (xp >= base + need) { base += need; lvl++; need = 100 + (lvl - 1) * 50; }
    return { level: lvl, into: xp - base, need, pct: (xp - base) / need };
  }

  /* ---------- daily + streak ---------- */
  function day(d = U.today()) {
    if (!state.daily[d]) state.daily[d] = { xp: 0, solved: 0, correct: 0, minutes: 0 };
    return state.daily[d];
  }
  function touchStreak() {
    const t = U.today();
    const s = state.streak;
    if (s.last === t) return;
    if (s.last && U.dayDiff(s.last, t) === 1) s.current += 1;
    else s.current = 1;
    s.last = t;
    s.best = Math.max(s.best, s.current);
    emit('streak', s);
  }
  function currentStreak() {
    const s = state.streak;
    if (!s.last) return 0;
    const d = U.dayDiff(s.last, U.today());
    return d <= 1 ? s.current : 0;
  }

  function addXP(n, reason) {
    if (n <= 0) return 0;
    const before = levelInfo().level;
    state.xp += n;
    day().xp += n;
    touchStreak();
    const after = levelInfo().level;
    save();
    emit('xp', { n, reason, levelUp: after > before ? after : null });
    if (after > before) emit('levelup', after);
    checkAchievements();
    return n;
  }

  /* ---------- skills ---------- */
  function skill(id) {
    if (!state.skills[id]) state.skills[id] = { attempts: 0, correct: 0, firstTry: 0, streak: 0, wrongStreak: 0, mastery: 0, level: 1, box: 0, due: null, last: null, hints: 0, best: 0 };
    return state.skills[id];
  }
  function masteryLabel(m, attempts) {
    if (!attempts) return 'New';
    if (m >= 0.9) return 'Mastered';
    if (m >= 0.7) return 'Proficient';
    if (m >= 0.4) return 'Familiar';
    return 'Learning';
  }

  /**
   * result: {skill, solved, firstTry, hints, revealed, level, steps}
   */
  function recordAttempt(r) {
    const s = skill(r.skill);
    const t = U.today();
    s.attempts++;
    s.last = Date.now();
    s.hints += r.hints || 0;
    const clean = r.solved && r.firstTry && !r.hints && !r.revealed;
    if (r.solved) s.correct++;
    if (r.solved && r.firstTry) s.firstTry++;

    // mastery update (bounded exponential moving estimate)
    let gain;
    if (clean) gain = 0.22 * (0.75 + 0.25 * (r.level || 1));
    else if (r.solved && !r.revealed) gain = 0.08 / (1 + (r.hints || 0));
    else gain = -0.18;
    s.mastery = gain >= 0 ? s.mastery + gain * (1 - s.mastery) : Math.max(0, s.mastery + gain * s.mastery + gain * 0.1);
    s.mastery = U.clamp(s.mastery, 0, 1);

    // adaptive difficulty
    if (clean) { s.streak++; s.wrongStreak = 0; } else if (!r.solved || r.revealed) { s.wrongStreak++; s.streak = 0; } else { s.streak = 0; }
    s.best = Math.max(s.best, s.streak);
    if (s.streak >= 3 && s.level < 3) { s.level++; s.streak = 0; }
    if (s.wrongStreak >= 2 && s.level > 1) { s.level--; s.wrongStreak = 0; }

    // spaced repetition
    if (clean) s.box = Math.min(BOXES.length - 1, s.box + 1);
    else if (r.revealed || !r.solved) s.box = 0;
    s.due = U.addDays(t, BOXES[s.box]);

    const d = day();
    d.solved++;
    if (r.solved && r.firstTry) d.correct++;

    state.history.push({ s: r.skill, ok: !!r.solved, ft: !!r.firstTry, h: r.hints || 0, rv: !!r.revealed, lv: r.level || 1, t: Date.now() });
    if (state.history.length > 600) state.history = state.history.slice(-600);
    state.lastSkill = r.skill;

    let xp = 0;
    if (r.solved && !r.revealed) {
      const lvMul = [1, 1, 1.5, 2][r.level || 1];
      xp = Math.round((r.firstTry ? 10 : 5) * lvMul) - 3 * (r.hints || 0);
      xp = Math.max(r.firstTry ? 3 : 2, xp);
    }
    save();
    emit('attempt', { r, s });
    if (xp) addXP(xp, 'problem'); else { touchStreak(); checkAchievements(); }
    return { xp, skill: s };
  }

  function reviewQueue() {
    const t = U.today();
    return Object.entries(state.skills)
      .filter(([id, s]) => s.attempts > 0 && s.due && s.due <= t && CL.gen && CL.gen.skills[id])
      .sort((a, b) => a[1].mastery - b[1].mastery)
      .map(([id]) => id);
  }

  /* ---------- lessons ---------- */
  function lesson(id) {
    if (!state.lessons[id]) state.lessons[id] = { step: 0, done: false, completedAt: null };
    return state.lessons[id];
  }
  function setLessonStep(id, step) { const l = lesson(id); l.step = Math.max(l.step, step); state.lastLesson = id; save(); }
  function completeLesson(id) {
    const l = lesson(id);
    const first = !l.done;
    l.done = true; l.completedAt = l.completedAt || Date.now();
    state.lastLesson = id;
    save();
    emit('lesson', id);
    if (first) addXP(30, 'lesson'); else checkAchievements();
    return first;
  }
  function resetLesson(id) { state.lessons[id] = { step: 0, done: state.lessons[id] ? state.lessons[id].done : false, completedAt: state.lessons[id] && state.lessons[id].completedAt }; state.lessons[id].step = 0; save(); }

  /* ---------- bookmarks + notes ---------- */
  function addBookmark(b) { state.bookmarks.unshift({ ...b, id: Date.now() + '' + Math.random().toString(36).slice(2, 6), t: Date.now() }); save(); emit('bookmarks'); }
  function removeBookmark(id) { state.bookmarks = state.bookmarks.filter(b => b.id !== id); save(); emit('bookmarks'); }
  function note(id, text) { if (text === undefined) return state.notes[id] || ''; if (text.trim()) state.notes[id] = text; else delete state.notes[id]; save(); }

  /* ---------- settings ---------- */
  function setting(k, v) {
    if (v === undefined) return state.settings[k];
    state.settings[k] = v; save(); emit('settings', { k, v });
    return v;
  }

  /* ---------- achievements ---------- */
  const ACH = [
    { id: 'first', icon: '🎯', name: 'First Steps', desc: 'Solve your first problem', test: s => totalSolved(s) >= 1 },
    { id: 'ten', icon: '🔟', name: 'Warming Up', desc: 'Solve 10 problems', test: s => totalSolved(s) >= 10 },
    { id: 'hundred', icon: '💯', name: 'Century', desc: 'Solve 100 problems', test: s => totalSolved(s) >= 100 },
    { id: 'fivehundred', icon: '🏔️', name: 'Summit', desc: 'Solve 500 problems', test: s => totalSolved(s) >= 500 },
    { id: 'lesson1', icon: '📘', name: 'Student', desc: 'Complete a lesson', test: s => doneLessons(s) >= 1 },
    { id: 'lesson10', icon: '📚', name: 'Scholar', desc: 'Complete 10 lessons', test: s => doneLessons(s) >= 10 },
    { id: 'lessonAll', icon: '🎓', name: 'Graduate', desc: 'Complete every lesson', test: s => CL.course && doneLessons(s) >= CL.course.lessonList().length },
    { id: 'streak3', icon: '🔥', name: 'On Fire', desc: '3-day streak', test: s => s.streak.best >= 3 },
    { id: 'streak7', icon: '⚡', name: 'Week Warrior', desc: '7-day streak', test: s => s.streak.best >= 7 },
    { id: 'streak30', icon: '🌋', name: 'Unstoppable', desc: '30-day streak', test: s => s.streak.best >= 30 },
    { id: 'master1', icon: '⭐', name: 'Specialist', desc: 'Master a skill (90%)', test: s => masteredCount(s) >= 1 },
    { id: 'master10', icon: '🌟', name: 'Polymath', desc: 'Master 10 skills', test: s => masteredCount(s) >= 10 },
    { id: 'combo10', icon: '🎰', name: 'Combo x10', desc: '10 first-try answers in a row', test: s => comboRun(s) >= 10 },
    { id: 'hard', icon: '🧗', name: 'Climber', desc: 'Solve 10 hard (level 3) problems', test: s => s.history.filter(h => h.lv === 3 && h.ok && !h.rv).length >= 10 },
    { id: 'nohint', icon: '🧠', name: 'Unassisted', desc: '25 problems solved with no hints', test: s => s.history.filter(h => h.ok && !h.h && !h.rv).length >= 25 },
    { id: 'level5', icon: '🏅', name: 'Level 5', desc: 'Reach level 5', test: s => levelInfo(s.xp).level >= 5 },
    { id: 'level10', icon: '🏆', name: 'Level 10', desc: 'Reach level 10', test: s => levelInfo(s.xp).level >= 10 },
    { id: 'series', icon: '♾️', name: 'Infinite Wisdom', desc: 'Complete the Sequences & Series unit', test: s => unitDone(s, 'series') },
    { id: 'bridge', icon: '🚀', name: 'Ready for Calc 3', desc: 'Complete the Bridge to Calc 3 unit', test: s => unitDone(s, 'bridge') }
  ];
  function totalSolved(s) { return Object.values(s.skills).reduce((a, k) => a + k.correct, 0); }
  function doneLessons(s) { return Object.values(s.lessons).filter(l => l.done).length; }
  function masteredCount(s) { return Object.values(s.skills).filter(k => k.mastery >= 0.9).length; }
  function comboRun(s) { let run = 0, best = 0; for (const h of s.history) { if (h.ok && h.ft && !h.h) { run++; best = Math.max(best, run); } else run = 0; } return best; }
  function unitDone(s, unit) {
    if (!CL.course) return false;
    const u = CL.course.units.find(u => u.id === unit);
    return !!u && u.lessons.every(l => s.lessons[l.id] && s.lessons[l.id].done);
  }
  function checkAchievements() {
    for (const a of ACH) {
      if (state.achievements[a.id]) continue;
      let ok = false; try { ok = a.test(state); } catch (e) {}
      if (ok) { state.achievements[a.id] = Date.now(); save(); emit('achievement', a); }
    }
  }

  /* ---------- import / export ---------- */
  function exportJSON() { return JSON.stringify(state, null, 2); }
  function importJSON(text) {
    const obj = JSON.parse(text);
    if (!obj || typeof obj !== 'object' || !obj.settings) throw new Error('Not a Calc 2 Learner backup file');
    state = Object.assign(fresh(), obj); state.settings = { ...DEFAULT_SETTINGS, ...obj.settings };
    saveNow(); emit('settings', {}); emit('reset');
  }
  function reset(keepSettings = true) {
    const st = state.settings;
    state = fresh(); if (keepSettings) state.settings = st;
    saveNow(); emit('reset');
  }

  load();
  window.addEventListener && window.addEventListener('beforeunload', saveNow);

  CL.store = {
    get state() { return state; },
    DEFAULT_SETTINGS, ACH,
    on, off, emit, save, saveNow,
    levelInfo, day, currentStreak, addXP,
    skill, masteryLabel, recordAttempt, reviewQueue,
    lesson, setLessonStep, completeLesson, resetLesson,
    addBookmark, removeBookmark, note, setting,
    totalSolved: () => totalSolved(state), doneLessons: () => doneLessons(state), checkAchievements,
    exportJSON, importJSON, reset
  };
})();
