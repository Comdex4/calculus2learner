/* Units 0–1: Algebra toolkit + trigonometry refresher. */
(function () {
  'use strict';
  const { L, gen } = CL; const { A } = gen; const R = String.raw;

  CL.addUnit({
    id: 'foundations', title: 'Algebra & Functions Toolkit', short: 'Algebra', icon: '🧮', tag: 'Precalc review',
    blurb: 'The algebra moves calculus assumes you can do in your sleep.',
    lessons: [
      {
        id: 'exponents', title: 'Exponents & Radicals', mins: 8, skills: ['exp-rules'],
        steps: [
          L.text(R`### Why this matters
Almost every derivative and integral rule in calculus is phrased in terms of powers $x^n$. If you can turn $\dfrac{\sqrt{x}}{x^3}$ into $x^{-5/2}$ instantly, the power rule does the rest.

!key All exponent rules come from one idea: $x^n$ means "multiply $n$ copies of $x$."`),
          L.text(R`### The rules
| Rule | Example |
|---|---|
| $x^a\cdot x^b = x^{a+b}$ | $x^2 x^5 = x^7$ |
| $\dfrac{x^a}{x^b} = x^{a-b}$ | $\dfrac{x^7}{x^3} = x^4$ |
| $(x^a)^b = x^{ab}$ | $(x^3)^4 = x^{12}$ |
| $x^{-a} = \dfrac{1}{x^a}$ | $x^{-2} = \dfrac{1}{x^2}$ |
| $x^{p/q} = \sqrt[q]{x^p}$ | $x^{3/2} = \sqrt{x^3}$ |
| $x^0 = 1$ | |`),
          L.mc(R`Which is equal to $\dfrac{1}{\sqrt{x}}$?`, [R`$x^{-1/2}$`, R`$x^{1/2}$`, R`$x^{-2}$`, R`$-x^{1/2}$`], 0, R`$\sqrt{x} = x^{1/2}$, and dividing flips the sign of the exponent: $x^{-1/2}$.`),
          L.input(R`Write $x^3\cdot\sqrt{x}$ as $x^n$. What is $n$?`, A.num(3.5, '7/2'), R`$x^3\cdot x^{1/2} = x^{3 + 1/2} = x^{7/2}$.`, 'e.g. 7/2'),
          L.text(R`!warn A classic trap: $(x + y)^2 \ne x^2 + y^2$. Exponents distribute over **multiplication**, not addition: $(xy)^2 = x^2y^2$ but $(x+y)^2 = x^2 + 2xy + y^2$.`),
          L.practice('exp-rules', 2, 'Try one on your own:')
        ]
      },
      {
        id: 'factoring', title: 'Factoring & Solving Equations', mins: 10, skills: ['solve-quadratic'],
        steps: [
          L.text(R`### Zeros are everywhere in calculus
Critical points, intersections, partial fractions, limits of the form $\frac{0}{0}$ — they all come down to solving $f(x) = 0$, and that usually means **factoring**.

!key **Zero-product property:** if $AB = 0$, then $A = 0$ or $B = 0$.`),
          L.text(R`### Your factoring toolbox
- **GCF first:** $3x^3 - 6x^2 = 3x^2(x - 2)$
- **Trinomials:** $x^2 - 5x + 6 = (x-2)(x-3)$ — find two numbers that multiply to $6$ and add to $-5$.
- **Difference of squares:** $a^2 - b^2 = (a - b)(a + b)$
- **Sum/difference of cubes:** $a^3 \pm b^3 = (a \pm b)(a^2 \mp ab + b^2)$
- **Quadratic formula** when nothing works: $x = \dfrac{-b \pm\sqrt{b^2 - 4ac}}{2a}$`),
          L.mc(R`Factor $x^2 - 9$.`, [R`$(x - 3)(x + 3)$`, R`$(x - 3)^2$`, R`$(x - 9)(x + 1)$`, R`$(x + 3)^2$`], 0, 'Difference of squares with $a = x$, $b = 3$.'),
          L.input(R`Solve $x^2 + 2x - 15 = 0$. Enter both solutions separated by a comma.`, A.set([3, -5]), R`$(x + 5)(x - 3) = 0$, so $x = -5$ or $x = 3$.`, 'e.g. 3, -5'),
          L.text(R`!tip **Completing the square** ($x^2 + bx = (x + \tfrac{b}{2})^2 - \tfrac{b^2}{4}$) shows up again in Calc 2 when an integral contains $\sqrt{x^2 + 4x + 13}$ — keep it in your back pocket.`),
          L.practice('solve-quadratic', 2)
        ]
      },
      {
        id: 'functions', title: 'Functions & Transformations', mins: 10, skills: ['transformations', 'composition'],
        steps: [
          L.text(R`### Functions as machines
A function takes an input and returns exactly one output. Calculus studies how outputs **change** as inputs change, so it pays to see a formula and instantly picture its graph.

Every graph you meet is usually a familiar "parent" graph that has been shifted, stretched or flipped:
$$y = a\,f\big(b(x - h)\big) + k$$`),
          L.widget('transform', 'Play with each slider. Which ones act "backwards"?'),
          L.mc(R`The graph of $y = f(x + 3)$ is the graph of $y = f(x)$ shifted…`, ['left 3', 'right 3', 'up 3', 'down 3'], 0, R`Inside changes act opposite to what you'd guess: $f(x + 3)$ reaches each output $3$ units **earlier**, so the graph moves **left**.`),
          L.text(R`### Composition
$(f\circ g)(x) = f(g(x))$: run $g$ first, then feed the result into $f$. The **chain rule** is all about compositions, so practice spotting the "inside" and "outside":

| Function | Inside $g$ | Outside $f$ |
|---|---|---|
| $\sin(x^2)$ | $x^2$ | $\sin u$ |
| $(3x + 1)^5$ | $3x + 1$ | $u^5$ |
| $e^{\cos x}$ | $\cos x$ | $e^u$ |`),
          L.mc(R`For $h(x) = \sqrt{1 + x^3}$, what is the inside function?`, [R`$1 + x^3$`, R`$\sqrt{x}$`, R`$x^3$`, R`$\sqrt{1 + x}$`], 0, R`The square root is applied **last**, to $1 + x^3$.`),
          L.practice('composition', 1),
          L.practice('transformations', 2)
        ]
      },
      {
        id: 'explog', title: 'Exponentials & Logarithms', mins: 12, skills: ['log-eval', 'exp-equations'],
        steps: [
          L.text(R`### Two functions that undo each other
$\log_b x$ answers the question: **"$b$ to what power gives $x$?"** So $\log_2 8 = 3$ because $2^3 = 8$.

The most important base in calculus is $e \approx 2.71828$, and $\log_e x$ gets its own name: $\ln x$.`),
          L.widget('expLog', 'Slide the base. Notice the point $(0, 1)$ on every exponential and its mirror image $(1, 0)$ on every log. Then hit **Set b = e**.'),
          L.text(R`### Log laws (memorize these)
- $\ln(AB) = \ln A + \ln B$
- $\ln\left(\dfrac{A}{B}\right) = \ln A - \ln B$
- $\ln(A^p) = p\ln A$
- $\ln e^x = x$ and $e^{\ln x} = x$
- Change of base: $\log_b x = \dfrac{\ln x}{\ln b}$

!tip In Calc 1 you'll use these to simplify before differentiating (logarithmic differentiation). In Calc 2, $\ln|x|$ is the antiderivative of $\frac1x$ — it shows up constantly.`),
          L.input(R`Evaluate $\log_3 81$.`, A.num(4), R`$3^4 = 81$.`),
          L.mc(R`Which is equivalent to $\ln\left(\dfrac{x^3}{y}\right)$?`, [R`$3\ln x - \ln y$`, R`$\frac{3\ln x}{\ln y}$`, R`$\ln 3x - \ln y$`, R`$3(\ln x - \ln y)$`], 0, 'Quotient rule, then power rule.'),
          L.input(R`Solve $e^{2x} = 5$ exactly.`, A.num(Math.log(5) / 2, R`\frac{\ln 5}{2}`), R`Take $\ln$: $2x = \ln 5$, so $x = \frac{\ln 5}{2}$.`, 'e.g. ln(5)/2'),
          L.practice('log-eval', 2),
          L.practice('exp-equations', 2)
        ]
      }
    ]
  });

  CL.addUnit({
    id: 'trig', title: 'Trigonometry Refresher', short: 'Trig', icon: '📐', tag: 'Precalc review',
    blurb: 'Unit circle, identities and inverse trig — Calc 2 leans on these hard.',
    lessons: [
      {
        id: 'unit-circle', title: 'Radians & the Unit Circle', mins: 12, skills: ['deg-rad', 'trig-values'],
        steps: [
          L.text(R`### Why radians?
A **radian** measures an angle by the arc length it cuts on a circle of radius 1. A full turn is $2\pi$ radians $= 360^\circ$.

Calculus *only* works cleanly in radians: the fact that $\frac{d}{dx}\sin x = \cos x$ is **false** in degrees. So from now on, think in radians.

$$180^\circ = \pi \text{ rad} \qquad 1 \text{ rad} \approx 57.3^\circ$$`),
          L.input(R`Convert $135^\circ$ to radians.`, A.num(3 * Math.PI / 4, R`\frac{3\pi}{4}`), R`$135\cdot\frac{\pi}{180} = \frac{3\pi}{4}$.`, 'e.g. 3pi/4'),
          L.text(R`### The unit circle
The point at angle $\theta$ on the unit circle is $(\cos\theta, \sin\theta)$. That's the **definition** — the triangle ratios are just a special case.

!key $x = \cos\theta$, $y = \sin\theta$, $\tan\theta = \dfrac{y}{x}$`),
          L.widget('unitCircle', 'Drag point **P**. Watch the blue (cos) and orange (sin) segments, and the exact values below.'),
          L.mc(R`In which quadrant is $\sin\theta > 0$ but $\cos\theta < 0$?`, ['II', 'I', 'III', 'IV'], 0, R`Quadrant II: $x < 0$, $y > 0$. Mnemonic **ASTC** — **A**ll, **S**ine, **T**angent, **C**osine are positive in quadrants I, II, III, IV.`),
          L.text(R`### Special values to know cold
| $\theta$ | $0$ | $\frac{\pi}{6}$ | $\frac{\pi}{4}$ | $\frac{\pi}{3}$ | $\frac{\pi}{2}$ |
|---|---|---|---|---|---|
| $\sin\theta$ | $0$ | $\frac12$ | $\frac{\sqrt2}{2}$ | $\frac{\sqrt3}{2}$ | $1$ |
| $\cos\theta$ | $1$ | $\frac{\sqrt3}{2}$ | $\frac{\sqrt2}{2}$ | $\frac12$ | $0$ |
| $\tan\theta$ | $0$ | $\frac{\sqrt3}{3}$ | $1$ | $\sqrt3$ | undef. |

Everything else is a reference angle plus a sign.`),
          L.practice('trig-values', 2),
          L.practice('deg-rad', 2)
        ]
      },
      {
        id: 'trig-graphs', title: 'Graphs of Trig Functions', mins: 8, skills: ['trig-graph'],
        steps: [
          L.text(R`### Waves
Unwrap the unit circle and you get the sine wave. The general sinusoid
$$y = A\sin\big(B(x - h)\big) + D$$
has **amplitude** $|A|$, **period** $\dfrac{2\pi}{|B|}$, **phase shift** $h$ and **midline** $y = D$.`),
          L.widget('trigGraphs', 'Each slider controls one feature. Try making a wave with period $\\pi$.'),
          L.input(R`What is the period of $y = 3\cos(4x)$?`, A.num(Math.PI / 2, R`\frac{\pi}{2}`), R`$\frac{2\pi}{4} = \frac{\pi}{2}$.`, 'e.g. pi/2'),
          L.text(R`!note $\tan x$ has period $\pi$ (not $2\pi$) and vertical asymptotes wherever $\cos x = 0$. $\sec x = \frac{1}{\cos x}$ and $\csc x = \frac{1}{\sin x}$ have asymptotes where their denominators vanish.`),
          L.practice('trig-graph', 2)
        ]
      },
      {
        id: 'trig-identities', title: 'Trig Identities', mins: 14, skills: ['trig-identities'],
        steps: [
          L.text(R`### The identities that power Calc 2
You'll use these to **rewrite integrands** into forms you can integrate. Three families matter most:

**Pythagorean**
$$\sin^2\theta + \cos^2\theta = 1 \qquad 1 + \tan^2\theta = \sec^2\theta \qquad 1 + \cot^2\theta = \csc^2\theta$$

**Double angle**
$$\sin 2\theta = 2\sin\theta\cos\theta \qquad \cos 2\theta = \cos^2\theta - \sin^2\theta = 1 - 2\sin^2\theta = 2\cos^2\theta - 1$$

**Power-reducing** (from the double-angle formulas)
$$\sin^2\theta = \frac{1 - \cos 2\theta}{2} \qquad \cos^2\theta = \frac{1 + \cos 2\theta}{2}$$`),
          L.text(R`!why Where does $1 + \tan^2\theta = \sec^2\theta$ come from? Divide $\sin^2\theta + \cos^2\theta = 1$ by $\cos^2\theta$. Similarly, divide by $\sin^2\theta$ to get the cot/csc version. You only need to memorize one!`),
          L.mc(R`Which expression equals $\cos^2(3x)$?`, [R`$\frac{1 + \cos 6x}{2}$`, R`$\frac{1 - \cos 6x}{2}$`, R`$\frac{1 + \cos 3x}{2}$`, R`$1 - \sin(3x)$`], 0, R`Power-reducing with $\theta = 3x$, so $2\theta = 6x$.`),
          L.mc(R`Simplify $\sec^2 x - 1$.`, [R`$\tan^2 x$`, R`$\cot^2 x$`, R`$\sin^2 x$`, R`$1$`], 0, R`From $1 + \tan^2 x = \sec^2 x$.`),
          L.text(R`!tip **Checking an identity numerically:** plug in $x = 0.7$ (any non-special number) on both sides with a calculator. If they differ, it's not an identity. Use the **Grapher** page to compare both sides visually!`),
          L.practice('trig-identities', 2),
          L.practice('trig-identities', 3)
        ]
      },
      {
        id: 'inverse-trig', title: 'Inverse Trig Functions', mins: 12, skills: ['inverse-trig'],
        steps: [
          L.text(R`### Undoing sine
$\sin x$ isn't one-to-one, so to invert it we restrict its domain. That gives:

| Function | Outputs (range) |
|---|---|
| $\arcsin x$ | $\left[-\frac{\pi}{2}, \frac{\pi}{2}\right]$ |
| $\arccos x$ | $[0, \pi]$ |
| $\arctan x$ | $\left(-\frac{\pi}{2}, \frac{\pi}{2}\right)$ |

!key $\arcsin x$ = "the angle in $[-\frac{\pi}{2}, \frac{\pi}{2}]$ whose sine is $x$."`),
          L.input(R`Evaluate $\arccos\left(-\frac12\right)$.`, A.num(2 * Math.PI / 3, R`\frac{2\pi}{3}`), R`We need an angle in $[0, \pi]$ with cosine $-\frac12$: that's $\frac{2\pi}{3}$.`, 'e.g. 2pi/3'),
          L.mc(R`What is $\arcsin\left(\sin\frac{5\pi}{6}\right)$?`, [R`$\frac{\pi}{6}$`, R`$\frac{5\pi}{6}$`, R`$-\frac{\pi}{6}$`, R`$\frac{\pi}{3}$`], 0, R`$\sin\frac{5\pi}{6} = \frac12$, and $\arcsin\frac12 = \frac{\pi}{6}$ — the answer must lie in $[-\frac{\pi}{2}, \frac{\pi}{2}]$.`),
          L.text(R`### The triangle trick
To evaluate $\cos(\arctan\frac34)$: let $\theta = \arctan\frac34$, so $\tan\theta = \frac{3}{4} = \frac{\text{opp}}{\text{adj}}$. Draw a right triangle with legs 3 and 4 — the hypotenuse is 5 — so $\cos\theta = \frac45$.

This exact technique converts answers back to $x$ after **trig substitution** in Calc 2.`),
          L.practice('inverse-trig', 2),
          L.practice('inverse-trig', 3)
        ]
      },
      {
        id: 'trig-equations', title: 'Solving Trig Equations', mins: 10, skills: ['trig-equations'],
        steps: [
          L.text(R`### Find every solution
Solving $\sin x = \frac12$ on $[0, 2\pi)$ gives **two** answers: $\frac{\pi}{6}$ and $\frac{5\pi}{6}$. Missing the second one is the #1 mistake.

**Recipe:** isolate the trig function → find the reference angle → list every quadrant where the sign is right.`),
          L.input(R`Solve $2\cos x + 1 = 0$ on $[0, 2\pi)$.`, A.set([2 * Math.PI / 3, 4 * Math.PI / 3]), R`$\cos x = -\frac12$ in quadrants II and III: $x = \frac{2\pi}{3}, \frac{4\pi}{3}$.`, 'e.g. 2pi/3, 4pi/3'),
          L.text(R`!warn For $\sin(2x) = \frac12$ on $[0, 2\pi)$, the inside $2x$ runs over $[0, 4\pi)$ — **two full laps** — so there are four solutions. Solve for $2x$ first, then divide by 2.`),
          L.practice('trig-equations', 2),
          L.practice('trig-equations', 3)
        ]
      }
    ]
  });
})();
