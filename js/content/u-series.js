/* Units 9–12: series, power series, parametric & polar, bridge to Calc 3. */
(function () {
  'use strict';
  const { L, gen } = CL; const { A } = gen; const R = String.raw;
  const CD = ['Converges', 'Diverges'];

  CL.addUnit({
    id: 'series', title: 'Sequences & Series', short: 'Series', icon: '♾️', tag: 'Calc 2',
    blurb: 'Can you add infinitely many numbers and get a finite answer? Sometimes!',
    lessons: [
      {
        id: 'sequences', title: 'Sequences', mins: 10, skills: ['sequence-limit'],
        steps: [
          L.text(R`### Infinite lists
A **sequence** $a_1, a_2, a_3, \ldots$ converges to $L$ if $a_n \to L$ as $n \to \infty$. Treat $n$ like $x$ and use every limit tool you know (dominant terms, L'Hôpital, squeeze).

**Growth ranking** (for large $n$):
$$\ln n \ll n^p \ll b^n \ll n! \ll n^n$$`),
          L.widget('sequencePlot', 'Which of these settle down to a limit?'),
          L.input(R`$\displaystyle\lim_{n\to\infty}\frac{3n^2 + 1}{5n^2 - n}$`, A.num(0.6, '\\frac35'), R`Leading coefficients: $\frac35$.`),
          L.practice('sequence-limit', 1), L.practice('sequence-limit', 2), L.practice('sequence-limit', 3)
        ]
      },
      {
        id: 'series-intro', title: 'Series, Geometric & Telescoping', mins: 14, skills: ['geometric-series', 'telescoping'],
        steps: [
          L.text(R`### Adding forever
A **series** $\sum_{n=1}^\infty a_n$ is the limit of its **partial sums** $S_N = a_1 + \cdots + a_N$. If $S_N \to S$, the series converges to $S$.`),
          L.widget('seriesSums', 'Start with the geometric series. Push $|r|$ past 1. Then try the harmonic series — the terms shrink but the sum still diverges!', { series: 'geo' }),
          L.text(R`### Geometric series
$$\sum_{n=0}^{\infty} ar^n = \frac{a}{1 - r}\quad\text{if } |r| < 1 \qquad(\text{diverges if } |r| \ge 1)$$
$a$ is the **first term**. Example: $\sum_{n=1}^\infty \frac{1}{2^n} = \frac{1/2}{1 - 1/2} = 1$.`),
          L.input(R`$\displaystyle\sum_{n=0}^\infty 3\left(\frac{2}{5}\right)^n = $`, A.num(5), R`$\frac{3}{1 - 2/5} = \frac{3}{3/5} = 5$.`),
          L.text(R`### Telescoping series
Some partial sums collapse: $\sum\left(\frac1n - \frac{1}{n+1}\right)$ has $S_N = 1 - \frac{1}{N+1} \to 1$. Partial fractions often reveal this structure.`),
          L.practice('geometric-series', 1), L.practice('geometric-series', 2), L.practice('telescoping', 1), L.practice('telescoping', 2)
        ]
      },
      {
        id: 'div-integral', title: 'Divergence Test, Integral Test & p-Series', mins: 14, skills: ['divergence-test', 'p-series'],
        steps: [
          L.text(R`### The first thing to check
**Divergence test:** if $\lim a_n \ne 0$ (or doesn't exist), then $\sum a_n$ **diverges**.

!warn The converse is false. $\frac1n \to 0$ but $\sum\frac1n$ diverges. If $a_n \to 0$ the test says **nothing**.`),
          L.mc(R`What does the divergence test say about $\sum\frac{n}{2n + 1}$?`, ['It diverges', 'Inconclusive', 'It converges', 'It converges to 1/2'], 0, '$a_n \\to \\frac12 \\ne 0$.'),
          L.text(R`### Integral test
If $f$ is positive, continuous and decreasing with $f(n) = a_n$, then $\sum a_n$ and $\int_1^\infty f(x)\,dx$ **both converge or both diverge**.

That gives the **p-series** test immediately:
$$\sum_{n=1}^\infty\frac{1}{n^p}\ \text{converges} \iff p > 1$$`),
          L.widget('seriesSums', 'Choose **p-series** and slide $p$ across 1.', { series: 'p' }),
          L.mc(R`$\displaystyle\sum\frac{1}{n^{1.01}}$`, CD, 0, '$p = 1.01 > 1$ — converges (very slowly!).'),
          L.practice('divergence-test', 2), L.practice('p-series', 1), L.practice('p-series', 2)
        ]
      },
      {
        id: 'comparison', title: 'Comparison Tests', mins: 14, skills: ['comparison'],
        steps: [
          L.text(R`### Compare with something you know
**Direct comparison** (positive terms): if $a_n \le b_n$ and $\sum b_n$ converges, so does $\sum a_n$. If $a_n \ge b_n$ and $\sum b_n$ diverges, so does $\sum a_n$.

**Limit comparison:** if $\displaystyle\lim\frac{a_n}{b_n} = c$ with $0 < c < \infty$, both series do the same thing.

!tip To find $b_n$: keep only the **dominant** powers. $\frac{n + 5}{n^3 - 2} \approx \frac{n}{n^3} = \frac{1}{n^2}$ → converges.`),
          L.mc(R`$\displaystyle\sum\frac{\sqrt n}{n^2 + 1}$`, CD, 0, R`Behaves like $\frac{n^{1/2}}{n^2} = \frac{1}{n^{3/2}}$, a convergent p-series.`),
          L.mc(R`$\displaystyle\sum\frac{1}{2n - 1}$`, CD, 1, 'Behaves like $\\frac{1}{2n}$ — harmonic — diverges.'),
          L.practice('comparison', 1), L.practice('comparison', 2), L.practice('comparison', 3)
        ]
      },
      {
        id: 'alternating', title: 'Alternating Series', mins: 12, skills: ['alternating'],
        steps: [
          L.text(R`### Signs that flip
**Alternating Series Test:** $\sum(-1)^n b_n$ (with $b_n > 0$) converges if $b_n$ is decreasing and $b_n \to 0$.

So $\sum\frac{(-1)^{n+1}}{n} = 1 - \frac12 + \frac13 - \cdots$ converges (to $\ln 2$!) even though the harmonic series diverges.`),
          L.widget('seriesSums', 'Choose **Alt. harmonic**: the partial sums zig-zag inward.', { series: 'altharm' }),
          L.text(R`### Absolute vs. conditional
- **Absolutely convergent**: $\sum|a_n|$ converges. (Strongest; implies convergence.)
- **Conditionally convergent**: $\sum a_n$ converges but $\sum|a_n|$ diverges.

**Error bound:** for an alternating series meeting the AST, $|S - S_N| \le b_{N+1}$.`),
          L.practice('alternating', 1), L.practice('alternating', 2), L.practice('alternating', 3)
        ]
      },
      {
        id: 'ratio', title: 'Ratio & Root Tests', mins: 12, skills: ['ratio-test'],
        steps: [
          L.text(R`### Compare a term to the next one
$$L = \lim_{n\to\infty}\left|\frac{a_{n+1}}{a_n}\right|$$
- $L < 1$ → converges absolutely
- $L > 1$ → diverges
- $L = 1$ → **inconclusive** (try something else)

Best for **factorials** and **exponentials**. The root test, $L = \lim\sqrt[n]{|a_n|}$, has the same conclusions and is best when the whole term is raised to the $n$th power.`),
          L.input(R`For $\sum\frac{3^n}{n!}$, compute $L$.`, A.num(0), R`$\frac{3^{n+1}}{(n+1)!}\cdot\frac{n!}{3^n} = \frac{3}{n+1} \to 0$.`),
          L.text(R`!key The ratio test is the engine behind **radius of convergence** for power series — the next unit.`),
          L.practice('ratio-test', 1), L.practice('ratio-test', 2), L.practice('ratio-test', 3)
        ]
      },
      {
        id: 'test-strategy', title: 'Choosing a Test', mins: 10, skills: ['series-strategy'],
        steps: [
          L.text(R`### The flowchart
1. **Divergence test**: does $a_n \to 0$? If not, done — diverges.
2. **Recognize a type**: geometric? p-series? telescoping?
3. **Alternating?** Use the AST (and check absolute convergence).
4. **Factorials or $b^n$?** Ratio test.
5. **Whole thing to the $n$th power?** Root test.
6. **Algebraic (rational/roots)?** Limit comparison with a p-series.
7. **Easy antiderivative?** Integral test.`),
          L.practice('series-strategy', 1), L.practice('series-strategy', 2), L.practice('series-strategy', 2)
        ]
      }
    ]
  });

  CL.addUnit({
    id: 'power', title: 'Power Series & Taylor Series', short: 'Taylor', icon: '🌀', tag: 'Calc 2',
    blurb: 'Functions as infinite polynomials.',
    lessons: [
      {
        id: 'power-series', title: 'Power Series & Convergence', mins: 15, skills: ['radius', 'interval'],
        steps: [
          L.text(R`### Polynomials that never end
A **power series** centered at $c$:
$$\sum_{n=0}^\infty c_n(x - c)^n$$
It converges on an **interval** centered at $c$ with **radius** $R$ — found with the ratio test. Inside: converges absolutely. Outside: diverges. **Endpoints must be checked separately.**`),
          L.widget('convergence', 'Slide $x$ toward and past the endpoints. Watch the partial sums.'),
          L.text(R`### Example
$\sum\frac{x^n}{n}$: ratio $\left|\frac{x^{n+1}}{n+1}\cdot\frac{n}{x^n}\right| \to |x|$, so $R = 1$.
At $x = 1$: harmonic → diverges. At $x = -1$: alternating harmonic → converges. Interval: $[-1, 1)$.`),
          L.input(R`Radius of convergence of $\sum\frac{x^n}{4^n}$?`, A.num(4), R`Ratio: $\frac{|x|}{4} < 1 \iff |x| < 4$.`),
          L.practice('radius', 1), L.practice('radius', 2), L.practice('interval', 1), L.practice('interval', 2)
        ]
      },
      {
        id: 'functions-as-series', title: 'Functions as Power Series', mins: 12, skills: ['power-series-rep'],
        steps: [
          L.text(R`### Start from the geometric series
$$\frac{1}{1 - x} = \sum_{n=0}^\infty x^n = 1 + x + x^2 + \cdots,\quad |x| < 1$$
Now **substitute**, **multiply**, **differentiate** or **integrate**:
- $\frac{1}{1 + x^2} = \sum(-1)^n x^{2n}$ (replace $x$ with $-x^2$)
- $\arctan x = \sum\frac{(-1)^n x^{2n+1}}{2n + 1}$ (integrate the line above)
- $\ln(1 + x) = \sum_{n\ge1}\frac{(-1)^{n+1}x^n}{n}$ (integrate $\frac{1}{1+x}$)`),
          L.input(R`Coefficient of $x^3$ in the series for $\frac{1}{1 - 2x}$?`, A.num(8), R`$\sum(2x)^n$: the $x^3$ term is $2^3x^3$.`),
          L.practice('power-series-rep', 1), L.practice('power-series-rep', 2), L.practice('power-series-rep', 3)
        ]
      },
      {
        id: 'taylor', title: 'Taylor & Maclaurin Series', mins: 16, skills: ['taylor-coef', 'taylor-poly', 'known-series'],
        steps: [
          L.text(R`### Matching every derivative
If $f$ has a power series at $a$, it **must** be
$$f(x) = \sum_{n=0}^\infty\frac{f^{(n)}(a)}{n!}(x - a)^n$$
(Maclaurin series when $a = 0$.) Truncating gives the **Taylor polynomial** $T_n(x)$.`),
          L.widget('taylor', 'Raise the degree. For $\\ln(1+x)$ and $\\frac{1}{1-x}$, notice the approximation never works past $|x| = 1$.'),
          L.text(R`### The big five (memorize)
$$e^x = \sum\frac{x^n}{n!} \qquad \sin x = \sum\frac{(-1)^n x^{2n+1}}{(2n+1)!} \qquad \cos x = \sum\frac{(-1)^n x^{2n}}{(2n)!}$$
$$\frac{1}{1-x} = \sum x^n \qquad \ln(1 + x) = \sum_{n\ge1}\frac{(-1)^{n+1}x^n}{n}$$`),
          L.input(R`Use the series for $e^x$ to find the coefficient of $x^4$ in $e^{2x}$.`, A.num(16 / 24, '\\frac23'), R`$\frac{(2x)^4}{4!} = \frac{16}{24}x^4 = \frac23x^4$.`),
          L.practice('taylor-coef', 1), L.practice('taylor-poly', 1), L.practice('taylor-poly', 2), L.practice('known-series', 2)
        ]
      },
      {
        id: 'taylor-error', title: 'Approximation & Error', mins: 10, skills: ['series-error'],
        steps: [
          L.text(R`### How good is the approximation?
- **Alternating series estimate:** error $\le$ the first omitted term.
- **Taylor's inequality (Lagrange):** $|R_n(x)| \le \dfrac{M}{(n+1)!}|x - a|^{n+1}$ where $M \ge |f^{(n+1)}|$ on the interval.

Example: $\sin(0.1) \approx 0.1 - \frac{0.1^3}{6}$, with error at most $\frac{0.1^5}{120} \approx 8\times10^{-8}$.`),
          L.practice('series-error', 1), L.practice('series-error', 2), L.practice('alternating', 3)
        ]
      }
    ]
  });

  CL.addUnit({
    id: 'polar', title: 'Parametric & Polar', short: 'Polar', icon: '🌸', tag: 'Calc 2',
    blurb: 'New ways to describe curves — and the calculus that goes with them.',
    lessons: [
      {
        id: 'parametric', title: 'Parametric Curves', mins: 14, skills: ['param-deriv', 'param-arclength'],
        steps: [
          L.text(R`### Position as a function of time
A parametric curve gives $x = x(t)$, $y = y(t)$. Think: a particle moving through the plane.
$$\frac{dy}{dx} = \frac{dy/dt}{dx/dt} \qquad L = \int_a^b\sqrt{\left(\frac{dx}{dt}\right)^2 + \left(\frac{dy}{dt}\right)^2}dt$$`),
          L.widget('parametric', 'Trace each curve. The orange arrow is the velocity vector $\\langle x\'(t), y\'(t)\\rangle$.'),
          L.input(R`$x = t^2$, $y = t^3$. Find $\frac{dy}{dx}$ at $t = 2$.`, A.num(3), R`$\frac{3t^2}{2t} = \frac{3t}{2} = 3$.`),
          L.text(R`!key This is a preview of **vector-valued functions** $\mathbf r(t) = \langle x(t), y(t), z(t)\rangle$ in Calc 3.`),
          L.practice('param-deriv', 1), L.practice('param-deriv', 2), L.practice('param-arclength', 2)
        ]
      },
      {
        id: 'polar-coords', title: 'Polar Coordinates', mins: 12, skills: ['polar-convert'],
        steps: [
          L.text(R`### Distance and direction
Polar point $(r, \theta)$: go distance $r$ in direction $\theta$.
$$x = r\cos\theta,\quad y = r\sin\theta,\quad r^2 = x^2 + y^2,\quad \tan\theta = \frac{y}{x}$$
!warn $r$ can be negative — then you go in the opposite direction.`),
          L.widget('polar', 'Trace the curves as $\\theta$ increases. Watch the rose: $r$ goes negative!'),
          L.mc(R`$r = 4\sin\theta$ in rectangular form?`, [R`$x^2 + (y - 2)^2 = 4$`, R`$x^2 + y^2 = 16$`, R`$y = 4$`, R`$(x - 2)^2 + y^2 = 4$`], 0, R`Multiply by $r$: $r^2 = 4r\sin\theta \Rightarrow x^2 + y^2 = 4y$, then complete the square.`),
          L.practice('polar-convert', 1), L.practice('polar-convert', 2), L.practice('polar-convert', 3)
        ]
      },
      {
        id: 'polar-calc', title: 'Calculus in Polar', mins: 14, skills: ['polar-area', 'polar-slope'],
        steps: [
          L.text(R`### Area: thin pizza slices
A sector of angle $d\theta$ and radius $r$ has area $\frac12 r^2\,d\theta$:
$$A = \frac12\int_\alpha^\beta r^2\,d\theta$$
### Slopes
Treat as parametric with $x = r\cos\theta$, $y = r\sin\theta$:
$$\frac{dy}{dx} = \frac{r'\sin\theta + r\cos\theta}{r'\cos\theta - r\sin\theta}$$`),
          L.input(R`Area enclosed by $r = 2\cos\theta$?`, A.num(Math.PI, '\\pi'), R`It's a circle of radius 1. Or: $\frac12\int_0^\pi 4\cos^2\theta\,d\theta = \pi$.`),
          L.practice('polar-area', 1), L.practice('polar-area', 2), L.practice('polar-area', 3), L.practice('polar-slope', 2)
        ]
      }
    ]
  });

  CL.addUnit({
    id: 'bridge', title: 'Bridge to Calc 3', short: 'Calc 3 prep', icon: '🚀', tag: 'Preview',
    blurb: 'Vectors, 3D space and partial derivatives — so day one of Calc 3 feels familiar.',
    lessons: [
      {
        id: 'vectors', title: 'Vectors', mins: 14, skills: ['vector-ops', 'dot-product'],
        steps: [
          L.text(R`### Arrows with magnitude and direction
$\mathbf v = \langle v_1, v_2\rangle$ (or $\langle v_1, v_2, v_3\rangle$ in 3D).
- $\|\mathbf v\| = \sqrt{v_1^2 + v_2^2 + v_3^2}$
- Add componentwise; scale componentwise.
- **Dot product:** $\mathbf u\cdot\mathbf v = u_1v_1 + u_2v_2 + u_3v_3 = \|\mathbf u\|\|\mathbf v\|\cos\theta$
- $\mathbf u\perp\mathbf v \iff \mathbf u\cdot\mathbf v = 0$`),
          L.widget('vectors2d', 'Drag the tips of $\\mathbf u$ and $\\mathbf v$. Make them perpendicular. Turn on the projection.'),
          L.input(R`$\langle 2, -1, 3\rangle\cdot\langle 4, 5, -1\rangle = $`, A.num(0), R`$8 - 5 - 3 = 0$ — they're orthogonal!`),
          L.practice('vector-ops', 2), L.practice('dot-product', 1), L.practice('dot-product', 2)
        ]
      },
      {
        id: 'space', title: '3D Space & the Cross Product', mins: 14, skills: ['distance-3d', 'cross-product'],
        steps: [
          L.text(R`### Three axes
Distance: $d = \sqrt{(\Delta x)^2 + (\Delta y)^2 + (\Delta z)^2}$. Sphere: $(x - a)^2 + (y - b)^2 + (z - c)^2 = r^2$.

### The cross product (3D only)
$$\mathbf u\times\mathbf v = \begin{vmatrix}\mathbf i & \mathbf j & \mathbf k\\ u_1 & u_2 & u_3\\ v_1 & v_2 & v_3\end{vmatrix}$$
It's **perpendicular** to both $\mathbf u$ and $\mathbf v$, and $\|\mathbf u\times\mathbf v\|$ = area of the parallelogram they span.`),
          L.input(R`$\mathbf i\times\mathbf j = $ ? Enter as a vector.`, A.tuple([0, 0, 1]), R`$\langle1,0,0\rangle\times\langle0,1,0\rangle = \langle0, 0, 1\rangle = \mathbf k$ (right-hand rule).`, 'e.g. 0, 0, 1'),
          L.practice('distance-3d', 1), L.practice('distance-3d', 3), L.practice('cross-product', 1), L.practice('cross-product', 2)
        ]
      },
      {
        id: 'partials', title: 'Surfaces & Partial Derivatives', mins: 12, skills: ['partial-derivs'],
        steps: [
          L.text(R`### Functions of two variables
$z = f(x, y)$ is a **surface**. Slice it with the plane $y = c$ and you get an ordinary curve — its slope is the **partial derivative** $\frac{\partial f}{\partial x}$.`),
          L.widget('surface3d', 'Rotate the surface. Move the trace plane.'),
          L.text(R`### Computing partials
To find $f_x$, treat $y$ as a **constant** and differentiate as usual. For $f = x^2y^3$: $f_x = 2xy^3$, $f_y = 3x^2y^2$.

!key Everything you learned in Calc 1 and 2 still works — Calc 3 just runs it in more directions. You're ready!`),
          L.input(R`For $f(x, y) = x^3y + y^2$, find $\frac{\partial f}{\partial y}$.`, A.expr('x^3 + 2*y', 'x^3 + 2y', { vars: ['x', 'y'], dom: [[0.3, 1.5], [0.3, 1.5]] }), R`Treat $x$ as constant: $x^3 + 2y$.`),
          L.practice('partial-derivs', 1), L.practice('partial-derivs', 2), L.practice('partial-derivs', 3)
        ]
      }
    ]
  });
})();
