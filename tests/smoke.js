/* Browser smoke test: every page, every lesson step, a problem from every skill.
 * Usage: start a static server in the repo root (e.g. `python3 -m http.server 8765`), then
 *        node tests/smoke.js
 */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror @' + page.url() + ': ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console @' + page.url() + ': ' + m.text()); });
  await page.goto(BASE);
  await page.waitForSelector('.tiles');
  const routes = ['#/', '#/learn', '#/practice', '#/practice/review', '#/practice/mix/all', '#/practice/mix/weak', '#/practice/mix/series', '#/quiz/limits', '#/quiz/all', '#/grapher', '#/reference', '#/reference/series', '#/progress', '#/saved', '#/settings'];
  for (const r of routes) { await page.evaluate(h => { location.hash = h; }, r); await page.waitForTimeout(250); }

  // every lesson, every step
  const lessons = await page.evaluate(() => CL.course.lessonList().map(l => [l.id, l.steps.length]));
  let steps = 0;
  for (const [id, n] of lessons) {
    await page.evaluate(h => { location.hash = h; }, '#/lesson/' + id);
    await page.waitForSelector('.lesson-card-step');
    for (let i = 0; i < n + 2 && !(await page.evaluate(() => !!document.querySelector('.lesson-done'))); i++) {
      const ok = await page.evaluate(() => {
        const b = [...document.querySelectorAll('.lesson-nav button')];
        const skip = b.find(x => x.textContent.trim() === 'Skip' && !x.hidden);
        if (skip) { skip.click(); return 'skip'; }
        const c = b.find(x => /Continue|Complete/.test(x.textContent));
        if (c && !c.disabled) { c.click(); return 'cont'; }
        return 'stuck';
      });
      steps++;
      if (ok === 'stuck') { errors.push('stuck at ' + id + ' step ' + i); break; }
      await page.waitForTimeout(40);
    }
    const done = await page.evaluate(() => !!document.querySelector('.lesson-done'));
    if (!done) errors.push('lesson did not complete: ' + id);
  }

  // a problem from every skill at every level
  const skills = await page.evaluate(() => Object.keys(CL.gen.skills));
  for (const s of skills) {
    await page.evaluate(h => { location.hash = h; }, '#/practice/skill/' + s);
    await page.waitForSelector('.prob');
    for (const lv of [1, 2, 3]) {
      await page.evaluate(lv => { [...document.querySelectorAll('.sess-bar .chip')][lv].click(); }, lv);
      await page.waitForTimeout(30);
      const html = await page.evaluate(() => document.querySelector('.prob').innerHTML);
      if (/katex-error|\bNaN\b/.test(html)) errors.push('suspicious render in ' + s + ' L' + lv);
      await page.evaluate(() => { const g = document.querySelector('.prob-graph button'); if (g) g.click(); });
      await page.evaluate(() => { const b = [...document.querySelectorAll('.prob-actions button')].find(x => x.textContent.includes('Show answer')); if (b) b.click(); });
    }
  }

  for (const t of ['dark', 'sepia', 'midnight', 'contrast', 'light']) { await page.evaluate(t => CL.store.setting('theme', t), t); await page.waitForTimeout(50); }
  console.log(`visited ${routes.length} routes, ${lessons.length} lessons / ${steps} steps, ${skills.length} skills x3 levels`);
  console.log(errors.length ? errors.slice(0, 40).join('\n') + `\n${errors.length} errors` : 'NO ERRORS');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
