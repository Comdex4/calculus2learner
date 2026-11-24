/* Units 2–5: Calc 1 essentials. */
(function () {
  'use strict';
  const { L, gen } = CL; const { A } = gen; const R = String.raw;

  CL.addUnit({
    id: 'limits', title: 'Limits & Continuity', short: 'Limits', icon: '🎯', tag: 'Calc 1',
    blurb: 'The idea everything else in calculus is built on.',
    lessons: [
      {
        id: 'limit-idea', title: 'What Is a Limit?', mins: 10, skills: ['limit-eval'],
        steps: [
          L.text(R`### Getting close without arriving
$\displaystyle\lim_{x\to a} f(x) = L$ means: as $x$ gets **close** to $a$ (but not equal to it), $f(x)$ gets close to $L$.

The value $f(a)$ itself doesn't matter — it might not even exist!`),
          L.widget('limitExplorer', 'Shrink $\\delta$ and watch the left and right points close in. Try each example.'),
          L.mc(R`What is $\displaystyle\lim_{x\to1}\frac{x^2 - 1}{x - 1}$?`, ['$2$', '$0$', 'It does not exist, because $f(1)$ is undefined', '$1$'], 0, R`For $x \ne 1$, $\frac{x^2-1}{x-1} = x + 1 \to 2$. The hole at $x = 1$ doesn't matter.`),
          L.text(R`!key A two-sided limit exists **only** when the left-hand limit and right-hand limit exist and are equal.`),
          L.practice('limit-eval', 1)
        ]
      },
      {
        id: 'limit-algebra', title: 'Computing Limits Algebraically', mins: 12, skills: ['limit-eval', 'limit-onesided'],
        steps: [
          L.text(R`### The decision tree
1. **Plug in.** If you get a number, done.
2. Got $\frac{\text{nonzero}}{0}$? It's an infinite limit or DNE — check signs on each side.
3. Got $\frac{0}{0}$? That's **indeterminate** — simplify, then plug in again:
   - **Factor** and cancel
   - Multiply by the **conjugate** (for square roots)
   - Combine **fractions** over a common denominator`),
          L.input(R`Evaluate $\displaystyle\lim_{x\to 4}\frac{\sqrt{x} - 2}{x - 4}$.`, A.num(0.25, R`\frac14`), R`$x - 4 = (\sqrt x - 2)(\sqrt x + 2)$, so the expression is $\frac{1}{\sqrt x + 2} \to \frac14$.`, 'e.g. 1/4'),
          L.practice('limit-eval', 2),
          L.text(R`### One-sided limits
$\lim_{x\to a^-}$ approaches from the left, $\lim_{x\to a^+}$ from the right. They matter for piecewise functions, absolute values and vertical asymptotes.`),
          L.mc(R`$\displaystyle\lim_{x\to 3^-}\frac{1}{x - 3} = $`, [R`$-\infty$`, R`$+\infty$`, R`$0$`, 'DNE'], 0, R`Just left of 3, $x - 3$ is a tiny **negative** number, so $\frac{1}{x-3}$ is hugely negative.`),
          L.practice('limit-onesided', 2),
          L.practice('limit-eval', 3)
        ]
      },
      {
        id: 'limits-infinity', title: 'Limits at Infinity', mins: 10, skills: ['limit-infinity'],
        steps: [
          L.text(R`### End behavior
As $x\to\infty$, only the **dominant** terms matter. For rational functions compare degrees:

- top degree < bottom degree → $0$
- equal degrees → ratio of leading coefficients
- top degree > bottom degree → $\pm\infty$

!tip This "dominant term" thinking is exactly what the **limit comparison test** uses in Calc 2. Master it now.`),
          L.input(R`$\displaystyle\lim_{x\to\infty}\frac{6x^3 - x}{2x^3 + 5x^2}$`, A.num(3), R`Equal degrees: $\frac{6}{2} = 3$.`),
          L.text(R`!warn With square roots, $\sqrt{x^2} = |x|$. As $x \to -\infty$, $|x| = -x$, which flips a sign. E.g. $\lim_{x\to-\infty}\frac{\sqrt{x^2+1}}{x} = -1$.`),
          L.practice('limit-infinity', 2),
          L.practice('limit-infinity', 3)
        ]
      },
      {
        id: 'trig-limits', title: 'Special Trig Limits', mins: 8, skills: ['limit-trig'],
        steps: [
          L.text(R`### The famous one
$$\lim_{\theta\to0}\frac{\sin\theta}{\theta} = 1$$
This is why $\frac{d}{dx}\sin x = \cos x$ (in radians). Its companion: $\displaystyle\lim_{\theta\to0}\frac{1 - \cos\theta}{\theta} = 0$.`),
          L.widget('limitExplorer', 'Pick the $\\frac{\\sin x}{x}$ example.', { example: 'sinc' }),
          L.text(R`**Trick:** make the angle and the denominator match.
$$\lim_{x\to0}\frac{\sin 5x}{3x} = \frac53\lim_{x\to0}\frac{\sin 5x}{5x} = \frac53$$`),
          L.input(R`Evaluate $\displaystyle\lim_{x\to0}\frac{\sin 7x}{2x}$.`, A.num(3.5, '\\frac72'), R`$\frac72\cdot\frac{\sin 7x}{7x} \to \frac72$.`),
          L.practice('limit-trig', 2),
          L.practice('limit-trig', 3)
        ]
      },
      {
        id: 'continuity', title: 'Continuity', mins: 8, skills: ['continuity'],
        steps: [
          L.text(R`### No jumps, no holes, no blowups
$f$ is **continuous at $a$** if $\displaystyle\lim_{x\to a} f(x) = f(a)$. That's three conditions: $f(a)$ exists, the limit exists, and they match.

Polynomials, exponentials, sin and cos are continuous everywhere; rational functions, logs, roots and tan are continuous on their domains.`),
          L.text(R`### Making a piecewise function continuous
At the break point, set the two formulas equal and solve for the unknown constant.

!key **Intermediate Value Theorem:** if $f$ is continuous on $[a, b]$, it hits every value between $f(a)$ and $f(b)$. That's why $x^3 - x - 1 = 0$ must have a root between 1 and 2.`),
          L.practice('continuity', 1),
          L.practice('continuity', 2)
        ]
      }
    ]
  });

  CL.addUnit({
    id: 'derivs', title: 'Derivatives', short: 'Derivatives', icon: '📈', tag: 'Calc 1',
    blurb: 'Instantaneous rate of change — and every rule you need to compute it.',
    lessons: [
      {
        id: 'deriv-def', title: 'The Derivative as a Limit', mins: 12, skills: ['deriv-definition'],
        steps: [
          L.text(R`### Slope at a single point
The slope between two points is $\frac{\Delta y}{\Delta x}$. To get the slope **at** a point, let the second point slide in:
$$f'(a) = \lim_{h\to0}\frac{f(a + h) - f(a)}{h}$$`),
          L.widget('secantTangent', 'Shrink $h$. Drag the point along the curve.'),
          L.mc(R`What does $f'(3) = 5$ mean?`, ['At $x = 3$, $f$ is increasing at 5 units of output per unit of input', '$f(3) = 5$', 'The average rate of change from 0 to 3 is 5', '$f$ has a max at $x=3$'], 0, 'The derivative is an instantaneous rate of change / tangent slope.'),
          L.input(R`Use the definition: $\displaystyle\lim_{h\to0}\frac{(2 + h)^2 - 4}{h} = $`, A.num(4), R`It's $f'(2)$ for $f(x) = x^2$; algebraically $\frac{4h + h^2}{h} = 4 + h \to 4$.`),
          L.practice('deriv-definition', 1),
          L.practice('deriv-definition', 2)
        ]
      },
      {
        id: 'power-rule', title: 'Power Rule & Basic Rules', mins: 10, skills: ['deriv-power', 'tangent-line'],
        steps: [
          L.text(R`### Shortcuts
$$\frac{d}{dx}x^n = nx^{n-1} \qquad \frac{d}{dx}[cf] = cf' \qquad \frac{d}{dx}[f \pm g] = f' \pm g'$$
Works for **any** real $n$ — rewrite roots and fractions as powers first.`),
          L.widget('derivativeTracer', 'Drag along $f$ and watch $f\'$ get traced underneath. Where is $f\'$ zero?'),
          L.input(R`Differentiate $f(x) = 4x^3 - \frac{2}{x}$.`, A.expr('12*x^2 + 2/x^2', '12x^2 + \\frac{2}{x^2}', { dom: [0.5, 3] }), R`$\frac{2}{x} = 2x^{-1}$, whose derivative is $-2x^{-2}$. So $f' = 12x^2 + \frac{2}{x^2}$.`, 'e.g. 12x^2 + 2/x^2'),
          L.text(R`### Tangent lines
At $x = a$ the tangent line is $y = f(a) + f'(a)(x - a)$. This is also the **linear approximation** — and the first term of a **Taylor polynomial** (Calc 2!).`),
          L.practice('deriv-power', 2),
          L.practice('tangent-line', 1)
        ]
      },
      {
        id: 'product-quotient', title: 'Product & Quotient Rules', mins: 10, skills: ['deriv-product', 'deriv-quotient'],
        steps: [
          L.text(R`### Products
$$(fg)' = f'g + fg'$$
!warn $(fg)' \ne f'g'$. Check: $(x\cdot x)' = 2x$, but $1\cdot1 = 1$.`),
          L.input(R`Differentiate $x^2e^x$.`, A.expr('2*x*exp(x) + x^2*exp(x)', '2xe^x + x^2e^x'), R`$f = x^2, g = e^x$: $2x\cdot e^x + x^2\cdot e^x$.`),
          L.text(R`### Quotients
$$\left(\frac{f}{g}\right)' = \frac{f'g - fg'}{g^2}$$
Memory trick: **"low d-high minus high d-low, over the square of what's below."**`),
          L.practice('deriv-product', 2),
          L.practice('deriv-quotient', 1),
          L.practice('deriv-quotient', 2)
        ]
      },
      {
        id: 'chain-rule', title: 'The Chain Rule', mins: 12, skills: ['deriv-chain'],
        steps: [
          L.text(R`### Derivative of a composition
$$\frac{d}{dx}f(g(x)) = f'(g(x))\cdot g'(x)$$
**Outside derivative, inside left alone, times the inside derivative.**

In Leibniz notation with $u = g(x)$: $\dfrac{dy}{dx} = \dfrac{dy}{du}\cdot\dfrac{du}{dx}$ — rates multiply.`),
          L.mc(R`$\frac{d}{dx}\sin(x^3) = $`, [R`$3x^2\cos(x^3)$`, R`$\cos(x^3)$`, R`$\cos(3x^2)$`, R`$3x^2\cos x$`], 0, 'Outside: $\\sin u \\to \\cos u$ with $u = x^3$ kept. Inside: $3x^2$.'),
          L.input(R`Differentiate $(2x + 1)^5$.`, A.expr('10*(2*x+1)^4', '10(2x+1)^4'), R`$5(2x + 1)^4\cdot 2$.`),
          L.text(R`!tip **The chain rule in reverse is $u$-substitution.** Every time you integrate with $u$-sub in Calc 2 you're undoing a chain rule. Getting fluent here pays off twice.`),
          L.practice('deriv-chain', 1),
          L.practice('deriv-chain', 2),
          L.practice('deriv-chain', 3)
        ]
      },
      {
        id: 'transcendental', title: 'Trig, Exponential & Log Derivatives', mins: 12, skills: ['deriv-trig', 'deriv-explog'],
        steps: [
          L.text(R`### The table
| $f$ | $f'$ | $f$ | $f'$ |
|---|---|---|---|
| $\sin x$ | $\cos x$ | $e^x$ | $e^x$ |
| $\cos x$ | $-\sin x$ | $a^x$ | $a^x\ln a$ |
| $\tan x$ | $\sec^2 x$ | $\ln x$ | $\frac1x$ |
| $\sec x$ | $\sec x\tan x$ | $\log_a x$ | $\frac{1}{x\ln a}$ |
| $\csc x$ | $-\csc x\cot x$ | | |
| $\cot x$ | $-\csc^2 x$ | | |

!tip The "co-" functions all get a minus sign.`),
          L.mc(R`$\frac{d}{dx}e^{3x} = $`, [R`$3e^{3x}$`, R`$e^{3x}$`, R`$3xe^{3x - 1}$`, R`$e^{3}$`], 0, 'Chain rule with inside $3x$.'),
          L.text(R`### Logarithmic differentiation
For things like $x^x$ (variable base **and** exponent), take $\ln$ of both sides first: $\ln y = x\ln x$, differentiate implicitly, then solve for $y'$.`),
          L.practice('deriv-trig', 2),
          L.practice('deriv-explog', 2),
          L.practice('deriv-explog', 3)
        ]
      },
      {
        id: 'implicit-invtrig', title: 'Implicit Differentiation & Inverse Trig', mins: 12, skills: ['implicit', 'deriv-invtrig'],
        steps: [
          L.text(R`### When $y$ isn't isolated
For a curve like $x^2 + y^2 = 25$, differentiate both sides with respect to $x$, treating $y$ as a function of $x$. Every time you differentiate a $y$-term, the chain rule attaches a $y'$:
$$2x + 2yy' = 0 \Rightarrow y' = -\frac{x}{y}$$`),
          L.input(R`Find $\frac{dy}{dx}$ at $(3, 4)$ on $x^2 + y^2 = 25$.`, A.num(-0.75, '-\\frac34'), R`$y' = -\frac{x}{y} = -\frac34$.`),
          L.text(R`### Inverse trig derivatives
$$\frac{d}{dx}\arcsin x = \frac{1}{\sqrt{1 - x^2}} \quad \frac{d}{dx}\arccos x = -\frac{1}{\sqrt{1 - x^2}} \quad \frac{d}{dx}\arctan x = \frac{1}{1 + x^2}$$
!key Read backwards these are **integrals**: $\int\frac{dx}{1 + x^2} = \arctan x + C$. They're the reason trig substitution exists.`),
          L.practice('implicit', 2),
          L.practice('deriv-invtrig', 2)
        ]
      }
    ]
  });

  CL.addUnit({
    id: 'apps', title: 'Applications of Derivatives', short: 'Applications', icon: '🛠️', tag: 'Calc 1',
    blurb: "Optimization, related rates, and L'Hôpital's rule.",
    lessons: [
      {
        id: 'related-rates', title: 'Related Rates', mins: 12, skills: ['related-rates'],
        steps: [
          L.text(R`### Everything changes with time
When quantities are linked by an equation, their rates are linked by the **derivative** of that equation (with respect to $t$).

**Recipe**
1. Draw a picture, name variables.
2. Write an equation relating them.
3. Differentiate both sides with respect to $t$ (chain rule!).
4. **Then** plug in the numbers for the instant you care about.`),
          L.input(R`A circle's radius grows at 3 cm/s. How fast is the area growing (cm²/s) when $r = 10$?`, A.num(60 * Math.PI, '60\\pi'), R`$\frac{dA}{dt} = 2\pi r\frac{dr}{dt} = 2\pi(10)(3) = 60\pi$.`, 'e.g. 60pi'),
          L.practice('related-rates', 2),
          L.practice('related-rates', 3)
        ]
      },
      {
        id: 'extrema', title: 'Extrema & the Mean Value Theorem', mins: 12, skills: ['critical-points', 'mvt'],
        steps: [
          L.text(R`### Where things turn around
**Critical numbers**: where $f'(x) = 0$ or $f'$ doesn't exist. Local maxima and minima can only happen there.

- **First derivative test**: $f'$ goes $+ \to -$ ⇒ local max; $- \to +$ ⇒ local min.
- **Second derivative test**: $f'' > 0$ ⇒ concave up ⇒ min; $f'' < 0$ ⇒ max.
- **Closed interval method**: absolute extrema on $[a, b]$ occur at critical numbers or endpoints.`),
          L.widget('derivativeTracer', 'Find where the tangent is horizontal — those are the critical points.'),
          L.text(R`### The Mean Value Theorem
If $f$ is continuous on $[a, b]$ and differentiable inside, there's some $c$ with
$$f'(c) = \frac{f(b) - f(a)}{b - a}$$
— the instantaneous slope equals the average slope somewhere.`),
          L.widget('mvt', 'Move the endpoints. The green tangent(s) are always parallel to the orange secant.'),
          L.practice('critical-points', 1),
          L.practice('critical-points', 2),
          L.practice('mvt', 1)
        ]
      },
      {
        id: 'optimization', title: 'Optimization', mins: 12, skills: ['optimization'],
        steps: [
          L.text(R`### Best possible
Optimization = find the max or min of a quantity subject to a **constraint**. Use the constraint to write the quantity as a function of **one** variable, then use critical points.`),
          L.widget('optimizationBox', 'Slide the cut size. Where is the volume largest?'),
          L.input(R`For the $12\times12$ box, what cut size $x$ maximizes the volume?`, A.num(2), R`$V'(x) = (12 - 2x)(12 - 6x) = 0 \Rightarrow x = 2$ (since $x = 6$ gives zero volume).`),
          L.practice('optimization', 1),
          L.practice('optimization', 2)
        ]
      },
      {
        id: 'linear-approx', title: 'Linear Approximation', mins: 8, skills: ['linear-approx'],
        steps: [
          L.text(R`### Zoom in and everything is a line
Near $x = a$, $f(x) \approx L(x) = f(a) + f'(a)(x - a)$.

Example: $\sqrt{4.1} \approx 2 + \frac{1}{4}(0.1) = 2.025$ (true value $2.02485\ldots$).

!key This is the **degree-1 Taylor polynomial**. In Calc 2 you'll add $x^2$, $x^3$, … terms to make the approximation better and better.`),
          L.practice('linear-approx', 1),
          L.practice('linear-approx', 2)
        ]
      },
      {
        id: 'lhopital', title: "L'Hôpital's Rule", mins: 12, skills: ['lhopital'],
        steps: [
          L.text(R`### Indeterminate forms
If $\displaystyle\lim\frac{f(x)}{g(x)}$ is of the form $\frac00$ or $\frac{\infty}{\infty}$, then
$$\lim\frac{f(x)}{g(x)} = \lim\frac{f'(x)}{g'(x)}$$
(differentiate top and bottom **separately** — not the quotient rule!).`),
          L.widget('lhopital', 'Zoom in. Why does the ratio of functions approach the ratio of slopes?'),
          L.text(R`### Other forms
- $0\cdot\infty$: rewrite as a fraction, $fg = \frac{f}{1/g}$.
- $\infty - \infty$: combine into one fraction.
- $1^\infty$, $0^0$, $\infty^0$: take $\ln$, find the limit of $\ln y$, then exponentiate.

!tip Calc 2 uses L'Hôpital constantly: sequence limits, the divergence test, improper integrals, and comparing growth rates.`),
          L.input(R`$\displaystyle\lim_{x\to0}\frac{e^{x} - 1}{x} = $`, A.num(1), R`$\frac00$; L'Hôpital: $\frac{e^x}{1} \to 1$.`),
          L.practice('lhopital', 1),
          L.practice('lhopital', 2),
          L.practice('lhopital', 3)
        ]
      }
    ]
  });

  CL.addUnit({
    id: 'integrals', title: 'Integrals', short: 'Integrals', icon: '∫', tag: 'Calc 1',
    blurb: 'Accumulation, the Fundamental Theorem, and u-substitution.',
    lessons: [
      {
        id: 'riemann', title: 'Area & Riemann Sums', mins: 12, skills: ['riemann'],
        steps: [
          L.text(R`### Adding up rectangles
To find the area under $y = f(x)$ from $a$ to $b$, chop $[a, b]$ into $n$ pieces of width $\Delta x = \frac{b - a}{n}$, build a rectangle on each, and add:
$$\sum_{i=1}^{n} f(x_i^*)\,\Delta x$$
As $n \to \infty$ this becomes the **definite integral** $\displaystyle\int_a^b f(x)\,dx$.`),
          L.widget('riemann', 'Change $n$ and the sampling rule. Which method gets close fastest?'),
          L.mc(R`For an **increasing** function, a left Riemann sum is…`, ['an underestimate', 'an overestimate', 'exact', 'impossible to tell'], 0, 'Left endpoints are the lowest point of each subinterval for an increasing function.'),
          L.practice('riemann', 1),
          L.practice('riemann', 2)
        ]
      },
      {
        id: 'antiderivatives', title: 'Antiderivatives', mins: 10, skills: ['antideriv-basic'],
        steps: [
          L.text(R`### Running derivatives backwards
$F$ is an antiderivative of $f$ if $F' = f$. The **indefinite integral** collects all of them:
$$\int f(x)\,dx = F(x) + C$$

| $\int$ | Result |
|---|---|
| $x^n\ (n \ne -1)$ | $\frac{x^{n+1}}{n+1}$ |
| $\frac1x$ | $\ln|x|$ |
| $e^x$ | $e^x$ |
| $\sin x$ | $-\cos x$ |
| $\cos x$ | $\sin x$ |
| $\sec^2 x$ | $\tan x$ |
| $\frac{1}{1+x^2}$ | $\arctan x$ |
| $\frac{1}{\sqrt{1-x^2}}$ | $\arcsin x$ |`),
          L.input(R`Find $\int (6x^2 - 4x + 1)\,dx$. (Don't worry about $+C$.)`, A.anti('2*x^3 - 2*x^2 + x', '2x^3 - 2x^2 + x + C'), R`Reverse power rule on each term.`),
          L.text(R`!tip **Always check by differentiating.** The app's answer checker does exactly that — it accepts any antiderivative that differs from ours by a constant.`),
          L.practice('antideriv-basic', 1),
          L.practice('antideriv-basic', 2)
        ]
      },
      {
        id: 'ftc', title: 'The Fundamental Theorem of Calculus', mins: 14, skills: ['definite-basic', 'ftc1'],
        steps: [
          L.text(R`### The bridge between derivatives and integrals
**Part 1.** If $A(x) = \displaystyle\int_a^x f(t)\,dt$ then $A'(x) = f(x)$. Accumulating area and taking slopes undo each other.

**Part 2.** $\displaystyle\int_a^b f(x)\,dx = F(b) - F(a)$ for any antiderivative $F$.`),
          L.widget('accumulation', 'Slide $x$. Compare the slope of $A$ (green) with the height of $f$.'),
          L.input(R`Evaluate $\displaystyle\int_0^2 3x^2\,dx$.`, A.num(8), R`$x^3\Big|_0^2 = 8$.`),
          L.mc(R`$\dfrac{d}{dx}\displaystyle\int_1^{x^2}\cos t\,dt = $`, [R`$2x\cos(x^2)$`, R`$\cos(x^2)$`, R`$\cos x$`, R`$\sin(x^2) - \sin 1$`], 0, 'FTC 1 plus the chain rule: $f(g(x))g\'(x)$.'),
          L.practice('definite-basic', 1),
          L.practice('definite-basic', 2),
          L.practice('ftc1', 2)
        ]
      },
      {
        id: 'u-sub', title: 'u-Substitution', mins: 14, skills: ['usub-indef', 'usub-def'],
        steps: [
          L.text(R`### Undoing the chain rule
If the integrand looks like $f(g(x))\cdot g'(x)$, set $u = g(x)$, $du = g'(x)\,dx$:
$$\int f(g(x))g'(x)\,dx = \int f(u)\,du$$

**How to pick $u$:** look for an "inside" function whose derivative (up to a constant) is also sitting in the integrand.`),
          L.mc(R`Best substitution for $\int x^2\cos(x^3)\,dx$?`, [R`$u = x^3$`, R`$u = x^2$`, R`$u = \cos(x^3)$`, R`$u = \cos x$`], 0, '$du = 3x^2\\,dx$ matches the $x^2\\,dx$ in front.'),
          L.input(R`Find $\int 2x(x^2 + 1)^4\,dx$.`, A.anti('(x^2+1)^5/5', '\\frac{(x^2+1)^5}{5} + C'), R`$u = x^2 + 1$, $du = 2x\,dx$: $\int u^4\,du = \frac{u^5}{5}$.`),
          L.text(R`!tip **Definite integrals:** change the limits to $u$-values ($u(a)$ to $u(b)$) and you never need to substitute back.`),
          L.practice('usub-indef', 1),
          L.practice('usub-indef', 2),
          L.practice('usub-def', 2)
        ]
      }
    ]
  });
})();
