/* Formula reference sheets. */
(function () {
  'use strict';
  const R = String.raw;
  CL.REFERENCE = [
    {
      id: 'algebra', title: 'Algebra & Logs', keywords: 'exponent factor quadratic log ln',
      md: R`| | |
|---|---|
| $x^ax^b = x^{a+b}$ | $(x^a)^b = x^{ab}$ |
| $x^{-a} = \frac{1}{x^a}$ | $x^{p/q} = \sqrt[q]{x^p}$ |
| $a^2 - b^2 = (a-b)(a+b)$ | $a^3 \pm b^3 = (a\pm b)(a^2 \mp ab + b^2)$ |
| $x = \dfrac{-b\pm\sqrt{b^2-4ac}}{2a}$ | $x^2 + bx = \left(x + \frac b2\right)^2 - \frac{b^2}{4}$ |
| $\ln(ab) = \ln a + \ln b$ | $\ln\frac ab = \ln a - \ln b$ |
| $\ln a^p = p\ln a$ | $\log_b x = \frac{\ln x}{\ln b}$ |
| $e^{\ln x} = x$ | $\ln e^x = x$ |`
    },
    {
      id: 'trig', title: 'Trigonometry', keywords: 'unit circle identities pythagorean double angle power reducing sin cos tan sec',
      md: R`**Unit circle values**

| $\theta$ | $0$ | $\frac\pi6$ | $\frac\pi4$ | $\frac\pi3$ | $\frac\pi2$ |
|---|---|---|---|---|---|
| $\sin$ | $0$ | $\frac12$ | $\frac{\sqrt2}2$ | $\frac{\sqrt3}2$ | $1$ |
| $\cos$ | $1$ | $\frac{\sqrt3}2$ | $\frac{\sqrt2}2$ | $\frac12$ | $0$ |
| $\tan$ | $0$ | $\frac{\sqrt3}3$ | $1$ | $\sqrt3$ | — |

**Identities**

| | |
|---|---|
| $\sin^2\theta + \cos^2\theta = 1$ | $1 + \tan^2\theta = \sec^2\theta$ |
| $1 + \cot^2\theta = \csc^2\theta$ | $\sin 2\theta = 2\sin\theta\cos\theta$ |
| $\cos 2\theta = \cos^2\theta - \sin^2\theta$ | $= 1 - 2\sin^2\theta = 2\cos^2\theta - 1$ |
| $\sin^2\theta = \frac{1 - \cos 2\theta}{2}$ | $\cos^2\theta = \frac{1 + \cos 2\theta}{2}$ |
| $\sin A\cos B = \frac12[\sin(A{+}B) + \sin(A{-}B)]$ | $\sin(A \pm B) = \sin A\cos B \pm \cos A\sin B$ |
| $\cos(A \pm B) = \cos A\cos B \mp \sin A\sin B$ | $\sin(-\theta) = -\sin\theta,\ \cos(-\theta) = \cos\theta$ |

**Inverse trig ranges:** $\arcsin \in [-\frac\pi2, \frac\pi2]$, $\arccos \in [0, \pi]$, $\arctan \in (-\frac\pi2, \frac\pi2)$.`
    },
    {
      id: 'limits', title: 'Limits', keywords: 'limit lhopital squeeze infinity indeterminate',
      md: R`| | |
|---|---|
| $\displaystyle\lim_{x\to0}\frac{\sin x}{x} = 1$ | $\displaystyle\lim_{x\to0}\frac{1-\cos x}{x} = 0$ |
| $\displaystyle\lim_{x\to\infty}\left(1 + \frac kx\right)^x = e^k$ | $\displaystyle\lim_{x\to0}\frac{e^x - 1}{x} = 1$ |
| L'Hôpital ($\frac00$, $\frac\infty\infty$): $\lim\frac fg = \lim\frac{f'}{g'}$ | Squeeze: $g \le f \le h$, $g, h \to L \Rightarrow f \to L$ |

**Growth order:** $\ln n \ll n^p \ll b^n \ll n! \ll n^n$`
    },
    {
      id: 'derivatives', title: 'Derivatives', keywords: 'derivative power product quotient chain rule differentiate',
      md: R`| Rule | | Function | Derivative |
|---|---|---|---|
| Power | $nx^{n-1}$ | $\sin x$ | $\cos x$ |
| Product | $f'g + fg'$ | $\cos x$ | $-\sin x$ |
| Quotient | $\frac{f'g - fg'}{g^2}$ | $\tan x$ | $\sec^2 x$ |
| Chain | $f'(g(x))g'(x)$ | $\sec x$ | $\sec x\tan x$ |
| $e^x$ | $e^x$ | $\csc x$ | $-\csc x\cot x$ |
| $a^x$ | $a^x\ln a$ | $\cot x$ | $-\csc^2 x$ |
| $\ln x$ | $\frac1x$ | $\arcsin x$ | $\frac{1}{\sqrt{1-x^2}}$ |
| $\log_a x$ | $\frac{1}{x\ln a}$ | $\arctan x$ | $\frac{1}{1+x^2}$ |

**Tangent line:** $y = f(a) + f'(a)(x - a)$ · **Implicit:** differentiate both sides, attach $y'$ to each $y$-term.`
    },
    {
      id: 'integrals', title: 'Basic Integrals', keywords: 'antiderivative integral table ftc',
      md: R`| | |
|---|---|
| $\int x^n dx = \frac{x^{n+1}}{n+1} + C\ (n\ne-1)$ | $\int\frac1x dx = \ln|x| + C$ |
| $\int e^x dx = e^x + C$ | $\int a^x dx = \frac{a^x}{\ln a} + C$ |
| $\int\sin x\,dx = -\cos x + C$ | $\int\cos x\,dx = \sin x + C$ |
| $\int\sec^2 x\,dx = \tan x + C$ | $\int\sec x\tan x\,dx = \sec x + C$ |
| $\int\tan x\,dx = \ln|\sec x| + C$ | $\int\sec x\,dx = \ln|\sec x + \tan x| + C$ |
| $\int\frac{dx}{a^2 + x^2} = \frac1a\arctan\frac xa + C$ | $\int\frac{dx}{\sqrt{a^2 - x^2}} = \arcsin\frac xa + C$ |

**FTC:** $\frac{d}{dx}\int_a^{x} f(t)\,dt = f(x)$ and $\int_a^b f(x)\,dx = F(b) - F(a)$.`
    },
    {
      id: 'techniques', title: 'Integration Techniques', keywords: 'parts liate trig substitution partial fractions improper simpson trapezoid',
      md: R`**By parts:** $\int u\,dv = uv - \int v\,du$ — choose $u$ by LIATE.

**Trig powers:** odd power → save one factor + Pythagorean identity; even powers → power-reducing.

**Trig substitution**

| Form | Sub | Identity |
|---|---|---|
| $\sqrt{a^2 - x^2}$ | $x = a\sin\theta$ | $\cos^2\theta$ |
| $\sqrt{a^2 + x^2}$ | $x = a\tan\theta$ | $\sec^2\theta$ |
| $\sqrt{x^2 - a^2}$ | $x = a\sec\theta$ | $\tan^2\theta$ |

**Partial fractions:** $\frac{A}{x-a}$, $\frac{A}{x-a} + \frac{B}{(x-a)^2}$, $\frac{Bx + C}{x^2 + k^2}$.

**Improper p-test:** $\int_1^\infty\frac{dx}{x^p}$ converges iff $p > 1$; $\int_0^1\frac{dx}{x^p}$ converges iff $p < 1$.

**Numerical:** Trapezoid $\frac{\Delta x}{2}[f_0 + 2f_1 + \dots + f_n]$ · Simpson $\frac{\Delta x}{3}[f_0 + 4f_1 + 2f_2 + \dots + 4f_{n-1} + f_n]$`
    },
    {
      id: 'applications', title: 'Applications of Integrals', keywords: 'area volume disk washer shell arc length surface work average',
      md: R`| Quantity | Formula |
|---|---|
| Area between curves | $\int_a^b [f(x) - g(x)]\,dx$ |
| Disk / washer | $\pi\int_a^b [R(x)^2 - r(x)^2]\,dx$ |
| Shells (about $y$-axis) | $2\pi\int_a^b x\,f(x)\,dx$ |
| Arc length | $\int_a^b\sqrt{1 + [f'(x)]^2}\,dx$ |
| Surface area (about $x$-axis) | $2\pi\int_a^b f(x)\sqrt{1 + [f'(x)]^2}\,dx$ |
| Average value | $\frac{1}{b-a}\int_a^b f(x)\,dx$ |
| Work | $\int_a^b F(x)\,dx$; Hooke $F = kx$ |`
    },
    {
      id: 'diffeq', title: 'Differential Equations', keywords: 'separable euler growth decay logistic slope field',
      md: R`| | |
|---|---|
| Separable $\frac{dy}{dx} = g(x)h(y)$ | $\int\frac{dy}{h(y)} = \int g(x)\,dx$ |
| Exponential $y' = ky$ | $y = y_0e^{kt}$ |
| Newton cooling | $T = T_s + (T_0 - T_s)e^{-kt}$ |
| Logistic $y' = ky(1 - \frac yM)$ | $y = \frac{M}{1 + Ae^{-kt}}$ |
| Euler's method | $y_{n+1} = y_n + h\,f(x_n, y_n)$ |`
    },
    {
      id: 'series', title: 'Series Tests', keywords: 'convergence divergence geometric p-series comparison ratio root alternating integral test',
      md: R`| Test | Use when | Conclusion |
|---|---|---|
| Divergence | always check first | $a_n \not\to 0 \Rightarrow$ diverges |
| Geometric $\sum ar^n$ | constant ratio | $\frac{a}{1-r}$ if $|r|<1$ |
| p-series $\sum\frac1{n^p}$ | | converges iff $p > 1$ |
| Integral | $f$ positive, decreasing | same as $\int_1^\infty f$ |
| Direct comparison | $0 \le a_n \le b_n$ | $\sum b_n$ conv ⇒ $\sum a_n$ conv |
| Limit comparison | rational/algebraic | $\lim\frac{a_n}{b_n} = c > 0$ ⇒ same behavior |
| Alternating (AST) | $\sum(-1)^nb_n$ | $b_n \downarrow 0$ ⇒ converges; error $\le b_{N+1}$ |
| Ratio | factorials, $b^n$ | $L<1$ conv, $L>1$ div, $L=1$ ? |
| Root | $(\ldots)^n$ | same as ratio |`
    },
    {
      id: 'taylor', title: 'Power & Taylor Series', keywords: 'maclaurin taylor series radius interval convergence remainder',
      md: R`$$f(x) = \sum_{n=0}^\infty\frac{f^{(n)}(a)}{n!}(x-a)^n$$

| Function | Maclaurin series | Converges |
|---|---|---|
| $\frac{1}{1-x}$ | $\sum x^n$ | $|x| < 1$ |
| $e^x$ | $\sum\frac{x^n}{n!}$ | all $x$ |
| $\sin x$ | $\sum\frac{(-1)^nx^{2n+1}}{(2n+1)!}$ | all $x$ |
| $\cos x$ | $\sum\frac{(-1)^nx^{2n}}{(2n)!}$ | all $x$ |
| $\ln(1+x)$ | $\sum_{n\ge1}\frac{(-1)^{n+1}x^n}{n}$ | $-1 < x \le 1$ |
| $\arctan x$ | $\sum\frac{(-1)^nx^{2n+1}}{2n+1}$ | $|x| \le 1$ |
| $(1+x)^k$ | $\sum\binom kn x^n$ | $|x| < 1$ |

**Taylor remainder:** $|R_n(x)| \le \frac{M}{(n+1)!}|x - a|^{n+1}$.`
    },
    {
      id: 'polar', title: 'Parametric & Polar', keywords: 'parametric polar area arc length slope',
      md: R`| | Parametric | Polar |
|---|---|---|
| Slope | $\frac{dy}{dx} = \frac{y'(t)}{x'(t)}$ | $\frac{r'\sin\theta + r\cos\theta}{r'\cos\theta - r\sin\theta}$ |
| Arc length | $\int\sqrt{x'^2 + y'^2}\,dt$ | $\int\sqrt{r^2 + r'^2}\,d\theta$ |
| Area | | $\frac12\int_\alpha^\beta r^2\,d\theta$ |

$x = r\cos\theta$, $y = r\sin\theta$, $r^2 = x^2 + y^2$, $\tan\theta = \frac yx$. Second derivative: $\frac{d^2y}{dx^2} = \frac{\frac{d}{dt}(dy/dx)}{dx/dt}$.`
    },
    {
      id: 'vectors', title: 'Vectors & 3D (Calc 3 preview)', keywords: 'vector dot cross product magnitude projection sphere partial',
      md: R`| | |
|---|---|
| $\|\mathbf v\| = \sqrt{v_1^2 + v_2^2 + v_3^2}$ | $\hat{\mathbf v} = \frac{\mathbf v}{\|\mathbf v\|}$ |
| $\mathbf u\cdot\mathbf v = \sum u_iv_i = \|\mathbf u\|\|\mathbf v\|\cos\theta$ | $\mathbf u\perp\mathbf v \iff \mathbf u\cdot\mathbf v = 0$ |
| $\text{comp}_{\mathbf v}\mathbf u = \frac{\mathbf u\cdot\mathbf v}{\|\mathbf v\|}$ | $\text{proj}_{\mathbf v}\mathbf u = \frac{\mathbf u\cdot\mathbf v}{\|\mathbf v\|^2}\mathbf v$ |
| $\mathbf u\times\mathbf v = \langle u_2v_3 - u_3v_2,\ u_3v_1 - u_1v_3,\ u_1v_2 - u_2v_1\rangle$ | $\|\mathbf u\times\mathbf v\| = $ parallelogram area |
| Sphere: $(x-a)^2 + (y-b)^2 + (z-c)^2 = r^2$ | $f_x$: differentiate in $x$, hold $y$ constant |`
    }
  ];
})();
