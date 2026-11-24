# Calc 2 Learner

A self-paced, interactive website for learning **Calculus 2**, including a refresher on the trig and Calc 1 material Calc 2 depends on, and a short bridge into **Calc 3**. Open it in a browser and start learning. There's nothing to install and no account to create, and it keeps working offline.

## What's inside

**60 Brilliant-style lessons in 13 units.** Each lesson is a short sequence of explanation cards, hands-on interactive widgets, and quick checkpoints you have to answer before moving on. The course runs from an algebra and trigonometry refresher, through limits, derivatives, their applications and integrals (the Calc 1 essentials), into all of Calc 2: integration techniques, applications of integration, intro differential equations, sequences and series, power and Taylor series, and parametric and polar curves. It finishes with a Calc 3 preview covering vectors, 3D space, surfaces and partial derivatives.

**26 interactive widgets.** You can drag a point around the unit circle, shrink a secant into a tangent, raise the number of Riemann rectangles, rotate a 3D solid of revolution (disks or shells), follow a slope field with Euler's method, push a Taylor polynomial to higher degree, watch power-series partial sums converge or blow up, trace parametric and polar curves, zoom in to see why L'Hôpital's rule works, and more.

**81 skills with unlimited practice problems.** Every skill has a randomized generator with three difficulty levels, so you never run out of problems. Each problem comes with progressive **hints**, a **"break it down" step-by-step solution** you reveal one step at a time, and a full answer when you want it. Some generators also include a graph and targeted feedback for common mistakes, such as forgetting the inner derivative in the chain rule.

**Flexible answer checking.** Type math the way you'd write it (`3x^2 + sin(2x)`, `5pi/6`, `sqrt(3)/2`, `ln|x+1|`) with a live typeset preview and an optional on-screen math keypad. Expressions are checked for mathematical equivalence, not exact text, and antiderivatives are accepted up to any constant.

**Progress that sticks.** XP, levels, daily goals, streaks, per-skill mastery, adaptive difficulty (it gets harder after three clean answers and easier after two misses), spaced-repetition review (skills come back after 1, 3, 7, 14, 30… days), weak-spot drills, unit quizzes, a 15-question exam simulator, achievements, an activity heatmap and stats. Everything is saved automatically in your browser, and you can export or import a backup file to move between devices.

**Study tools.** A Desmos-style grapher (functions, parametric and polar curves, automatic sliders, derivative, tangent line and definite-integral tools), a searchable formula reference, a freehand scratchpad for working problems, bookmarked problems, per-lesson notes, a Pomodoro focus timer, and a command palette (`Ctrl/⌘ + K`) to jump anywhere.

**Make it yours.** Six themes (system, light, dark, sepia, midnight/OLED, high contrast), eight accent colors, adjustable text and math size, reduced motion, sound and celebration toggles, a compact sidebar, and keyboard shortcuts for nearly everything (press `?` in the app to see them). The layout works on phones too.

## Using it

### On the web (GitHub Pages)

The repository includes a workflow (`.github/workflows/pages.yml`) that tests and publishes the site whenever `main` changes. Enable it once: in the repository on GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**. After the next push to `main` (or a manual run from the Actions tab), the site will be live at `https://<your-username>.github.io/calculus2learner/`. Once you've visited it, you can install it as an app from your browser's menu and it will work offline.

### On your computer

Clone the repository and either open `index.html` directly in your browser, or serve the folder so the offline cache can work too:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## How it's built

It's a plain static site: HTML, CSS and vanilla JavaScript with no build step and no framework. Math is typeset with [KaTeX](https://katex.org), which is vendored in `vendor/katex` so nothing loads from the internet. Graphs and the 3D views are drawn on `<canvas>` by a small custom plotting engine.

| Path | What lives there |
|---|---|
| `js/core/` | Utilities and exact fractions, the math-expression parser and equivalence checker, progress storage, Markdown and KaTeX rendering, and the 2D/3D plotting engine |
| `js/gen/` | The 81 problem generators, grouped by topic |
| `js/content/` | Course structure, lesson text, and the formula reference |
| `js/ui/` | The app shell, interactive widgets, the problem card, and every page |
| `tests/` | Automated checks (below) |

## Tests

Every generator is stress-tested by producing thousands of random problems. The test confirms that each answer is mathematically right using independent numerical checks: derivatives against finite differences, antiderivatives by differentiating them back, definite integrals with Simpson's rule, limits by evaluation, series sums by partial sums, ODE solutions by substitution, and partial derivatives numerically. It also checks that every piece of LaTeX compiles. A second test validates every lesson, and a browser test clicks through every page, every lesson step and every skill looking for errors.

```bash
npm test
```

```bash
node tests/run-generators.js series 200
```

```bash
npm run test:browser
```

The first runs the generator and content suites. The second stress-tests only the skills whose id contains "series", generating 200 problems per level. The browser test needs Playwright and a local server running on port 8765.

## Adding content

To add practice, register a new generator with `def('skill-id', { title, unit, desc }, level => ({ q, a, hints, steps, check }))` in one of the `js/gen` files and reference the skill from a lesson. The optional `check` field lets the test suite verify your answers numerically. Lessons are arrays of `L.text`, `L.widget`, `L.mc`, `L.input` and `L.practice` steps in `js/content`. Run `npm test` afterwards. If you add or rename files, also update the list in `sw.js` and bump its `VERSION`.
