/* Units 6–8: Calc 2 integration techniques, applications, intro DEs. */
(function () {
  'use strict';
  const { L, gen } = CL; const { A } = gen; const R = String.raw;

  CL.addUnit({
    id: 'techniques', title: 'Techniques of Integration', short: 'Techniques', icon: '🧩', tag: 'Calc 2',
    blurb: 'Parts, trig integrals, trig substitution, partial fractions, improper integrals.',
    lessons: [
      {
        id: 'ibp', title: 'Integration by Parts', mins: 15, skills: ['ibp'],
        steps: [
          L.text(R`### Undoing the product rule
From $(uv)' = u'v + uv'$, integrate and rearrange:
$$\int u\,dv = uv - \int v\,du$$
The goal: pick $u$ and $dv$ so that $\int v\,du$ is **easier** than what you started with.`),
          L.text(R`### Choosing $u$: LIATE
Pick $u$ as whichever comes **first**:
**L**ogarithmic → **I**nverse trig → **A**lgebraic (polynomials) → **T**rig → **E**xponential.

Everything else is $dv$. Example: $\int x e^x\,dx$ — algebraic beats exponential, so $u = x$, $dv = e^x dx$:
$$xe^x - \int e^x\,dx = xe^x - e^x + C$$`),
          L.mc(R`For $\int x^3\ln x\,dx$, choose $u = $`, [R`$\ln x$`, R`$x^3$`, R`$x^3\ln x$`, R`$\frac1x$`], 0, 'Logs come first in LIATE — and $\\ln x$ is easy to differentiate but hard to integrate.'),
          L.input(R`Find $\int x\cos x\,dx$.`, A.anti('x*sin(x) + cos(x)', 'x\\sin x + \\cos x + C'), R`$u = x$, $dv = \cos x\,dx$, $v = \sin x$: $x\sin x - \int\sin x\,dx = x\sin x + \cos x$.`),
          L.text(R`### Repeated parts: the tabular method
When $u$ is a polynomial that dies after a few derivatives, organize everything in a table.`),
          L.widget('tabularIBP', 'Reveal rows one at a time, then multiply diagonally with alternating signs.'),
          L.text(R`!tip **The boomerang:** for $\int e^x\sin x\,dx$, parts twice brings back the original integral $I$. Then solve $I = (\ldots) - I$ algebraically.`),
          L.practice('ibp', 1), L.practice('ibp', 2), L.practice('ibp', 3)
        ]
      },
      {
        id: 'trig-int', title: 'Trigonometric Integrals', mins: 14, skills: ['trig-integrals'],
        steps: [
          L.text(R`### Powers of sine and cosine: $\int\sin^m x\cos^n x\,dx$
- **One power odd?** Save one factor of the odd one, convert the rest with $\sin^2 + \cos^2 = 1$, and $u$-sub.
  $\int\sin^3 x\,dx = \int(1 - \cos^2 x)\sin x\,dx$, $u = \cos x$.
- **Both even?** Use power-reducing: $\sin^2 x = \frac{1 - \cos 2x}{2}$, $\cos^2 x = \frac{1+\cos 2x}{2}$.`),
          L.input(R`Find $\int\cos^2 x\,dx$.`, A.anti('x/2 + sin(2*x)/4', '\\frac{x}{2} + \\frac{\\sin 2x}{4} + C'), R`$\int\frac{1 + \cos 2x}{2}dx = \frac x2 + \frac{\sin 2x}{4}$.`),
          L.text(R`### Tangent and secant
- Even power of $\sec$: save $\sec^2 x$, convert the rest to $\tan$ via $\sec^2 = 1 + \tan^2$, $u = \tan x$.
- Odd power of $\tan$: save $\sec x\tan x$, convert to $\sec$, $u = \sec x$.
- Know these: $\int\tan x\,dx = \ln|\sec x| + C$, $\int\sec x\,dx = \ln|\sec x + \tan x| + C$.`),
          L.mc(R`Best first move for $\int\sin^5 x\cos^2 x\,dx$?`, [R`Save one $\sin x$, write $\sin^4 x = (1 - \cos^2 x)^2$, let $u = \cos x$`, R`Power-reduce everything`, R`Integration by parts`, R`Let $u = \sin x$`], 0, 'Sine has the odd power, so save a $\\sin x$ for $du$.'),
          L.practice('trig-integrals', 1), L.practice('trig-integrals', 2), L.practice('trig-integrals', 3)
        ]
      },
      {
        id: 'trig-sub', title: 'Trigonometric Substitution', mins: 16, skills: ['trig-sub'],
        steps: [
          L.text(R`### Radicals of quadratics
Use a Pythagorean identity to kill the square root:

| Expression | Substitute | Identity |
|---|---|---|
| $\sqrt{a^2 - x^2}$ | $x = a\sin\theta$ | $1 - \sin^2 = \cos^2$ |
| $\sqrt{a^2 + x^2}$ | $x = a\tan\theta$ | $1 + \tan^2 = \sec^2$ |
| $\sqrt{x^2 - a^2}$ | $x = a\sec\theta$ | $\sec^2 - 1 = \tan^2$ |`),
          L.widget('trigSubTriangle', 'For each form, see how the triangle encodes the substitution.'),
          L.text(R`### Worked example
$\displaystyle\int\frac{dx}{\sqrt{9 - x^2}}$: let $x = 3\sin\theta$, $dx = 3\cos\theta\,d\theta$, $\sqrt{9 - x^2} = 3\cos\theta$.
$$\int\frac{3\cos\theta}{3\cos\theta}d\theta = \theta + C = \arcsin\frac{x}{3} + C$$`),
          L.mc(R`Which substitution for $\displaystyle\int\frac{dx}{x^2\sqrt{x^2 + 4}}$?`, [R`$x = 2\tan\theta$`, R`$x = 2\sin\theta$`, R`$x = 2\sec\theta$`, R`$u = x^2 + 4$`], 0, '$\\sqrt{a^2 + x^2}$ with $a = 2$.'),
          L.text(R`!warn Don't trig-sub when a plain $u$-sub works: $\int\frac{x}{\sqrt{x^2+4}}dx$ is just $u = x^2 + 4$.`),
          L.practice('trig-sub', 1), L.practice('trig-sub', 2), L.practice('trig-sub', 3)
        ]
      },
      {
        id: 'partial-frac', title: 'Partial Fractions', mins: 15, skills: ['partial-fractions'],
        steps: [
          L.text(R`### Break it into simple pieces
To integrate a rational function $\frac{P(x)}{Q(x)}$:
1. If $\deg P \ge \deg Q$, **long divide** first.
2. Factor $Q$.
3. Decompose:
   - distinct linear factors: $\frac{A}{x-a} + \frac{B}{x-b}$
   - repeated: $\frac{A}{x-a} + \frac{B}{(x-a)^2}$
   - irreducible quadratic: $\frac{Bx + C}{x^2 + k^2}$
4. Integrate each piece (logs and arctans).`),
          L.text(R`### The cover-up trick
$\dfrac{5x - 1}{(x - 1)(x + 1)} = \dfrac{A}{x - 1} + \dfrac{B}{x + 1}$.

For $A$: cover up $(x - 1)$ and plug $x = 1$: $A = \frac{5 - 1}{1 + 1} = 2$.
For $B$: cover up $(x + 1)$ and plug $x = -1$: $B = \frac{-6}{-2} = 3$.`),
          L.input(R`Find $\displaystyle\int\frac{5x - 1}{x^2 - 1}\,dx$.`, A.anti('2*ln(abs(x-1)) + 3*ln(abs(x+1))', '2\\ln|x-1| + 3\\ln|x+1| + C', { dom: [1.5, 4] }), R`Using $A = 2$, $B = 3$ from above.`),
          L.practice('partial-fractions', 1), L.practice('partial-fractions', 2), L.practice('partial-fractions', 3)
        ]
      },
      {
        id: 'strategy', title: 'Strategy for Integration', mins: 10, skills: ['integration-strategy'],
        steps: [
          L.text(R`### A checklist
1. **Simplify** — algebra, trig identities, split fractions.
2. **Obvious substitution?** Is some piece the derivative of another piece?
3. **Classify:**
   - product of different function types → **parts**
   - powers of trig → **trig identities**
   - $\sqrt{a^2 \pm x^2}$ or $\sqrt{x^2 - a^2}$ → **trig substitution**
   - rational function → **partial fractions**
4. **Try again** — combine methods, or try a different $u$.

!tip Practice recognizing types *without* solving. That's what this lesson's drill does.`),
          L.practice('integration-strategy', 1), L.practice('integration-strategy', 2), L.practice('integration-strategy', 2)
        ]
      },
      {
        id: 'improper', title: 'Improper Integrals', mins: 14, skills: ['improper'],
        steps: [
          L.text(R`### Infinite intervals and infinite integrands
$$\int_a^\infty f(x)\,dx = \lim_{t\to\infty}\int_a^t f(x)\,dx$$
If the limit is a finite number, the integral **converges**; otherwise it **diverges**. Same idea when $f$ blows up at an endpoint.`),
          L.text(R`### The p-test (memorize!)
$$\int_1^\infty\frac{dx}{x^p}\ \text{converges} \iff p > 1 \qquad \int_0^1\frac{dx}{x^p}\ \text{converges} \iff p < 1$$
!key These are the "measuring sticks" for the integral and comparison tests for **series** coming up.`),
          L.input(R`Evaluate $\displaystyle\int_1^\infty\frac{dx}{x^3}$.`, A.num(0.5, '\\frac12'), R`$\lim_{t\to\infty}\left[-\frac{1}{2x^2}\right]_1^t = 0 + \frac12$.`),
          L.mc(R`$\displaystyle\int_1^\infty\frac{dx}{\sqrt x}$`, ['diverges', 'converges to 2', 'converges to 1/2', 'converges to 0'], 0, '$p = \\frac12 \\le 1$.'),
          L.practice('improper', 1), L.practice('improper', 2), L.practice('improper', 3)
        ]
      },
      {
        id: 'numerical', title: 'Numerical Integration', mins: 10, skills: ['numerical-integration'],
        steps: [
          L.text(R`### When there's no formula
$\int_0^1 e^{-x^2}dx$ has no elementary antiderivative, so we approximate.
- **Midpoint**: rectangles at midpoints. Error $\propto \frac{1}{n^2}$.
- **Trapezoid**: $\frac{\Delta x}{2}[f_0 + 2f_1 + \cdots + 2f_{n-1} + f_n]$. Error $\propto \frac{1}{n^2}$.
- **Simpson** ($n$ even): $\frac{\Delta x}{3}[f_0 + 4f_1 + 2f_2 + 4f_3 + \cdots + 4f_{n-1} + f_n]$. Error $\propto \frac{1}{n^4}$ — and **exact for cubics**.`),
          L.widget('riemann', "Switch between Trapezoid and Simpson and compare errors at the same $n$.", { method: 'trap' }),
          L.practice('numerical-integration', 1), L.practice('numerical-integration', 2)
        ]
      }
    ]
  });

  CL.addUnit({
    id: 'intapps', title: 'Applications of Integration', short: 'Int. Apps', icon: '🏺', tag: 'Calc 2',
    blurb: 'Areas, volumes of revolution, arc length, average value and work.',
    lessons: [
      {
        id: 'area-between', title: 'Area Between Curves', mins: 12, skills: ['area-between'],
        steps: [
          L.text(R`### Top minus bottom
$$A = \int_a^b\big[f(x) - g(x)\big]\,dx \quad\text{where } f \ge g \text{ on } [a, b]$$
The limits are usually the **intersection points**. If the curves cross, split the integral.

Sometimes it's easier to slice horizontally: $\int_c^d [\text{right} - \text{left}]\,dy$.`),
          L.widget('areaBetween', 'Each slice has height top − bottom. The integral adds infinitely many thin slices.'),
          L.input(R`Area between $y = x$ and $y = x^2$?`, A.num(1 / 6, '\\frac16'), R`They meet at $0$ and $1$; $\int_0^1(x - x^2)dx = \frac12 - \frac13 = \frac16$.`),
          L.practice('area-between', 1), L.practice('area-between', 2), L.practice('area-between', 3)
        ]
      },
      {
        id: 'disks', title: 'Volumes: Disks & Washers', mins: 15, skills: ['volume-disk'],
        steps: [
          L.text(R`### Slice, then add
Revolve a region about an axis. Slice **perpendicular** to the axis: each slice is a disk (or a washer = disk with a hole).
$$V = \pi\int_a^b R(x)^2\,dx \qquad V = \pi\int_a^b\big[R(x)^2 - r(x)^2\big]dx$$
$R$ = outer radius, $r$ = inner radius, both measured **from the axis of rotation**.`),
          L.widget('volume', 'Drag in the 3D view to rotate. The orange ring is one disk slice.', { mode: 'disk' }),
          L.input(R`Revolve the region under $y = \sqrt x$ on $[0, 4]$ about the $x$-axis. Volume?`, A.num(8 * Math.PI, '8\\pi'), R`$\pi\int_0^4 x\,dx = 8\pi$.`, 'e.g. 8pi'),
          L.text(R`!warn Washers: it's $R^2 - r^2$, **not** $(R - r)^2$.`),
          L.practice('volume-disk', 1), L.practice('volume-disk', 2), L.practice('volume-disk', 3)
        ]
      },
      {
        id: 'shells', title: 'Volumes: Cylindrical Shells', mins: 14, skills: ['volume-shell'],
        steps: [
          L.text(R`### Slice parallel instead
Slice **parallel** to the axis. Each strip sweeps out a thin cylindrical shell with surface area $2\pi(\text{radius})(\text{height})$:
$$V = 2\pi\int_a^b x\,f(x)\,dx \quad\text{(about the } y\text{-axis)}$$`),
          L.widget('volume', 'Switch to **Shells**. Each vertical strip becomes a hollow cylinder.', { mode: 'shell' }),
          L.mc(R`Revolving $y = x - x^3$ on $[0, 1]$ about the $y$-axis — which method avoids solving for $x$ in terms of $y$?`, ['Shells', 'Washers', 'Either is equally easy', 'Neither works'], 0, 'Shells integrate in $x$ when revolving around the $y$-axis — no inverse needed.'),
          L.practice('volume-shell', 1), L.practice('volume-shell', 2), L.practice('volume-shell', 3)
        ]
      },
      {
        id: 'arc-length', title: 'Arc Length', mins: 10, skills: ['arc-length'],
        steps: [
          L.text(R`### Length of a curve
A tiny piece of curve is the hypotenuse of a triangle with legs $dx$ and $dy$:
$$L = \int_a^b\sqrt{1 + \left(\frac{dy}{dx}\right)^2}\,dx$$`),
          L.widget('arcLength', 'Add more segments and watch the polygon length approach the arc length.'),
          L.text(R`!tip Textbook arc-length problems are rigged so $1 + (y')^2$ is a **perfect square**. When you see $y = \frac{x^3}{6} + \frac{1}{2x}$, expect $1 + (y')^2 = \left(\frac{x^2}{2} + \frac{1}{2x^2}\right)^2$.`),
          L.practice('arc-length', 1), L.practice('arc-length', 2), L.practice('arc-length', 3)
        ]
      },
      {
        id: 'avg-work', title: 'Average Value & Work', mins: 12, skills: ['average-value', 'work'],
        steps: [
          L.text(R`### Average value
$$f_{\text{avg}} = \frac{1}{b - a}\int_a^b f(x)\,dx$$
The height of the rectangle with the same area as the region under $f$.`),
          L.input(R`Average value of $f(x) = x^2$ on $[0, 3]$?`, A.num(3), R`$\frac13\int_0^3 x^2dx = \frac13\cdot 9 = 3$.`),
          L.text(R`### Work
Work = force × distance. When force varies, integrate: $W = \int_a^b F(x)\,dx$.
- **Springs** (Hooke's law): $F = kx$.
- **Ropes / pumping**: slice the *object*; each slice has its own weight and its own distance to travel.`),
          L.practice('average-value', 1), L.practice('work', 1), L.practice('work', 3)
        ]
      }
    ]
  });

  CL.addUnit({
    id: 'diffeq', title: 'Differential Equations (Intro)', short: 'Diff. Eqs', icon: '🌱', tag: 'Calc 2',
    blurb: 'Slope fields, Euler\'s method, separable equations and growth models.',
    lessons: [
      {
        id: 'slope-fields', title: "Slope Fields & Euler's Method", mins: 12, skills: ['euler'],
        steps: [
          L.text(R`### Equations about rates
A differential equation like $y' = x - y$ tells you the **slope** at every point $(x, y)$. Draw a tiny segment with that slope at many points and you get a **slope field** — solution curves flow along it.`),
          L.widget('slopeField', 'Drag the initial point. Then change the Euler step $h$.'),
          L.text(R`### Euler's method
Walk along the field in steps of size $h$:
$$x_{n+1} = x_n + h, \qquad y_{n+1} = y_n + h\cdot f(x_n, y_n)$$
It's repeated **linear approximation**.`),
          L.input(R`$y' = x + y$, $y(0) = 1$, $h = 0.5$. Euler's estimate of $y(0.5)$?`, A.num(1.5), R`$y_1 = 1 + 0.5(0 + 1) = 1.5$.`),
          L.practice('euler', 1), L.practice('euler', 2)
        ]
      },
      {
        id: 'separable', title: 'Separable Equations & Growth', mins: 14, skills: ['separable', 'growth-decay'],
        steps: [
          L.text(R`### Separate and integrate
If $\frac{dy}{dx} = g(x)h(y)$, move all $y$'s to one side:
$$\int\frac{dy}{h(y)} = \int g(x)\,dx$$
Then use the initial condition to find $C$.`),
          L.text(R`### Exponential growth
$\frac{dy}{dt} = ky$ separates to $\ln|y| = kt + C$, so $y = y_0e^{kt}$. Growth if $k > 0$, decay if $k < 0$. Half-life, compound interest, Newton's law of cooling — all variations.`),
          L.input(R`Solve $y' = 3y$, $y(0) = 2$.`, A.expr('2*exp(3*x)', '2e^{3x}'), R`$y = y_0e^{kx} = 2e^{3x}$.`),
          L.practice('separable', 1), L.practice('separable', 2), L.practice('growth-decay', 2)
        ]
      }
    ]
  });
})();
