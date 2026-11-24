/* Generators: Calc 2 integration techniques. */
(function () {
  'use strict';
  const { U, T, S, F, Frac, gen, poly } = CL;
  const { def, A, H } = gen;
  const R = String.raw;

  const J = parts => T.join(parts);

  def('ibp', { title: 'Integration by Parts', unit: 'techniques', desc: '∫u dv = uv − ∫v du.' }, lv => {
    const a = U.nz(-4, 4), b = U.int(1, 4), n = U.int(1, 4);
    const ax = H.kx(a);
    const hints = ['$\\int u\\,dv = uv - \\int v\\,du$.', 'Choose $u$ by **LIATE**: Logs, Inverse trig, Algebraic, Trig, Exponential — pick whichever comes first as $u$.'];
    const pool = lv === 1 ? ['xexp', 'xsin', 'xcos', 'lnx'] : lv === 2 ? ['xnln', 'x2exp', 'x2sin', 'atan', 'linexp', 'def1'] : ['expsin', 'expcos', 'x3exp', 'ln2', 'asin', 'def2'];
    const t = U.pick(pool);
    const P = {
      xexp: () => ({ f: R`x e^{${ax}}`, fs: R`x*exp(${a}*x)`, A: R`exp(${a}*x)*(x/${a} - 1/${a * a})`, At: J([T.term(F(1, a), R`xe^{${ax}}`), T.term(F(-1, a * a), R`e^{${ax}}`)]), uv: R`u = x,\ dv = e^{${ax}}dx \Rightarrow du = dx,\ v = ${F(1, a).tex()}e^{${ax}}` }),
      xsin: () => ({ f: R`x\sin(${ax})`, fs: R`x*sin(${a}*x)`, A: R`-x*cos(${a}*x)/${a} + sin(${a}*x)/${a * a}`, At: J([T.term(F(-1, a), R`x\cos(${ax})`), T.term(F(1, a * a), R`\sin(${ax})`)]), uv: R`u = x,\ dv = \sin(${ax})dx \Rightarrow v = ${F(-1, a).tex()}\cos(${ax})` }),
      xcos: () => ({ f: R`x\cos(${ax})`, fs: R`x*cos(${a}*x)`, A: R`x*sin(${a}*x)/${a} + cos(${a}*x)/${a * a}`, At: J([T.term(F(1, a), R`x\sin(${ax})`), T.term(F(1, a * a), R`\cos(${ax})`)]), uv: R`u = x,\ dv = \cos(${ax})dx \Rightarrow v = ${F(1, a).tex()}\sin(${ax})` }),
      lnx: () => ({ f: R`\ln x`, fs: 'ln(x)', A: 'x*ln(x) - x', At: R`x\ln x - x`, uv: R`u = \ln x,\ dv = dx \Rightarrow du = \frac{dx}{x},\ v = x`, dom: [0.4, 3] }),
      xnln: () => ({ f: R`${n === 1 ? 'x' : 'x^{' + n + '}'}\ln x`, fs: R`x^${n}*ln(x)`, A: R`x^${n + 1}*ln(x)/${n + 1} - x^${n + 1}/${(n + 1) ** 2}`, At: R`\frac{x^{${n + 1}}\ln x}{${n + 1}} - \frac{x^{${n + 1}}}{${(n + 1) ** 2}}`, uv: R`u = \ln x,\ dv = x^{${n}}dx \Rightarrow v = \frac{x^{${n + 1}}}{${n + 1}}`, dom: [0.4, 3] }),
      x2exp: () => ({ f: R`x^2e^{x}`, fs: 'x^2*exp(x)', A: 'exp(x)*(x^2 - 2*x + 2)', At: R`e^{x}(x^2 - 2x + 2)`, uv: R`u = x^2,\ dv = e^x dx$; then parts again on $\int 2xe^x dx` }),
      x2sin: () => ({ f: R`x^2\sin x`, fs: 'x^2*sin(x)', A: '-x^2*cos(x) + 2*x*sin(x) + 2*cos(x)', At: R`-x^2\cos x + 2x\sin x + 2\cos x`, uv: R`u = x^2,\ dv = \sin x\,dx$; apply parts twice (or use the tabular method)` }),
      atan: () => ({ f: R`\arctan x`, fs: 'arctan(x)', A: 'x*arctan(x) - ln(1 + x^2)/2', At: R`x\arctan x - \frac{1}{2}\ln(1 + x^2)`, uv: R`u = \arctan x,\ dv = dx \Rightarrow du = \frac{dx}{1+x^2},\ v = x` }),
      linexp: () => ({ f: R`(x ${T.signed(b)})e^{x}`, fs: R`(x + ${b})*exp(x)`, A: R`(x + ${b - 1})*exp(x)`, At: R`(${T.lin(1, b - 1)})e^{x}`, uv: R`u = x ${T.signed(b)},\ dv = e^x dx` }),
      expsin: () => { const c = U.int(1, 3), d = U.int(1, 3); return { f: R`e^{${H.kx(c)}}\sin(${H.kx(d)})`, fs: R`exp(${c}*x)*sin(${d}*x)`, A: R`exp(${c}*x)*(${c}*sin(${d}*x) - ${d}*cos(${d}*x))/${c * c + d * d}`, At: R`\frac{e^{${H.kx(c)}}\left(${c}\sin(${H.kx(d)}) - ${d}\cos(${H.kx(d)})\right)}{${c * c + d * d}}`, uv: R`Apply parts **twice**; the original integral reappears — solve for it algebraically` }; },
      expcos: () => { const c = U.int(1, 3), d = U.int(1, 3); return { f: R`e^{${H.kx(c)}}\cos(${H.kx(d)})`, fs: R`exp(${c}*x)*cos(${d}*x)`, A: R`exp(${c}*x)*(${c}*cos(${d}*x) + ${d}*sin(${d}*x))/${c * c + d * d}`, At: R`\frac{e^{${H.kx(c)}}\left(${c}\cos(${H.kx(d)}) + ${d}\sin(${H.kx(d)})\right)}{${c * c + d * d}}`, uv: R`Apply parts **twice**; the original integral reappears — solve for it` }; },
      x3exp: () => ({ f: R`x^3e^{x}`, fs: 'x^3*exp(x)', A: 'exp(x)*(x^3 - 3*x^2 + 6*x - 6)', At: R`e^{x}(x^3 - 3x^2 + 6x - 6)`, uv: R`Tabular method: derivatives of $x^3$: $3x^2, 6x, 6, 0$; alternate signs` }),
      ln2: () => ({ f: R`(\ln x)^2`, fs: 'ln(x)^2', A: 'x*ln(x)^2 - 2*x*ln(x) + 2*x', At: R`x(\ln x)^2 - 2x\ln x + 2x`, uv: R`u = (\ln x)^2,\ dv = dx$, then parts again on $\int 2\ln x\,dx`, dom: [0.4, 3] }),
      asin: () => ({ f: R`\arcsin x`, fs: 'arcsin(x)', A: 'x*arcsin(x) + sqrt(1 - x^2)', At: R`x\arcsin x + \sqrt{1 - x^2}`, uv: R`u = \arcsin x,\ dv = dx$; then $u$-sub for $\int \frac{x}{\sqrt{1-x^2}}dx`, dom: [-0.9, 0.9] })
    };
    if (t === 'def1' || t === 'def2') {
      const D = t === 'def1' ? U.pick([[R`\int_0^1 xe^{x}\,dx`, 1, '1', 'x*exp(x)', 0, 1, R`$e^x(x - 1)\Big|_0^1 = 0 - (-1) = 1$.`], [R`\int_1^e \ln x\,dx`, 1, '1', 'ln(x)', 1, Math.E, R`$(x\ln x - x)\Big|_1^e = 0 - (-1) = 1$.`]])
        : U.pick([[R`\int_0^\pi x\sin x\,dx`, Math.PI, '\\pi', 'x*sin(x)', 0, Math.PI, R`$(-x\cos x + \sin x)\Big|_0^\pi = \pi$.`], [R`\int_0^{\pi/2} x\cos x\,dx`, Math.PI / 2 - 1, '\\frac{\\pi}{2} - 1', 'x*cos(x)', 0, Math.PI / 2, R`$(x\sin x + \cos x)\Big|_0^{\pi/2} = \frac{\pi}{2} - 1$.`], [R`\int_1^e x\ln x\,dx`, (Math.E ** 2 + 1) / 4, '\\frac{e^2 + 1}{4}', 'x*ln(x)', 1, Math.E, R`$\left(\frac{x^2\ln x}{2} - \frac{x^2}{4}\right)\Big|_1^e = \frac{e^2}{4} + \frac14$.`]]);
      return { q: R`Evaluate $\displaystyle ${D[0]}$.`, a: A.num(D[1], D[2]), hints, steps: [D[6]], check: { integral: [D[3], D[4], D[5]] } };
    }
    const p = P[t]();
    return {
      q: R`Find $\displaystyle\int ${p.f}\,dx$.`, a: A.anti(p.A, p.At + ' + C', { dom: p.dom || [-1.5, 1.5] }),
      hints, steps: [R`Choose $${p.uv}$.`, R`$\displaystyle\int ${p.f}\,dx = ${p.At} + C$.`], check: { anti: p.fs }
    };
  });

  def('trig-integrals', { title: 'Trigonometric Integrals', unit: 'techniques', desc: 'Powers of sin, cos, tan, sec.' }, lv => {
    const k = lv === 1 ? U.int(1, 3) : 1;
    const kx = H.kx(k), k2 = H.kx(2 * k);
    const pool = lv === 1 ? ['sin2', 'cos2', 'tan', 'sectan'] : lv === 2 ? ['sin3', 'cos3', 'sinmcos3', 'tan2', 'sec4'] : ['sin2cos2', 'sec3', 'tan3', 'sin3cos2', 'cos4', 'prodsum'];
    const t = U.pick(pool);
    const m = U.int(1, 4);
    const [p, q] = U.distinct(2, 1, 5).sort((x, y) => y - x);
    const P = {
      sin2: [R`\sin^2(${kx})`, R`sin(${k}*x)^2`, R`x/2 - sin(${2 * k}*x)/${4 * k}`, R`\frac{x}{2} - \frac{\sin(${k2})}{${4 * k}}`, 'Power-reduce: $\\sin^2\\theta = \\frac{1 - \\cos 2\\theta}{2}$.'],
      cos2: [R`\cos^2(${kx})`, R`cos(${k}*x)^2`, R`x/2 + sin(${2 * k}*x)/${4 * k}`, R`\frac{x}{2} + \frac{\sin(${k2})}{${4 * k}}`, 'Power-reduce: $\\cos^2\\theta = \\frac{1 + \\cos 2\\theta}{2}$.'],
      tan: [R`\tan(${kx})`, R`tan(${k}*x)`, R`-ln(abs(cos(${k}*x)))/${k}`, R`-\frac{1}{${k}}\ln|\cos(${kx})|`, 'Write $\\tan = \\frac{\\sin}{\\cos}$ and let $u = \\cos(' + kx + ')$.'],
      sectan: [R`\sec(${kx})\tan(${kx})`, R`sec(${k}*x)*tan(${k}*x)`, R`sec(${k}*x)/${k}`, R`\frac{1}{${k}}\sec(${kx})`, '$\\frac{d}{dx}\\sec x = \\sec x\\tan x$.'],
      sin3: [R`\sin^3 x`, 'sin(x)^3', '-cos(x) + cos(x)^3/3', R`-\cos x + \frac{\cos^3 x}{3}`, 'Odd power of sine: save one $\\sin x$, convert $\\sin^2 x = 1 - \\cos^2 x$, let $u = \\cos x$.'],
      cos3: [R`\cos^3 x`, 'cos(x)^3', 'sin(x) - sin(x)^3/3', R`\sin x - \frac{\sin^3 x}{3}`, 'Odd power of cosine: save one $\\cos x$, convert $\\cos^2 x = 1 - \\sin^2 x$, let $u = \\sin x$.'],
      sinmcos3: [R`\sin^{${m}}x\cos^3 x`, R`sin(x)^${m}*cos(x)^3`, R`sin(x)^${m + 1}/${m + 1} - sin(x)^${m + 3}/${m + 3}`, R`\frac{\sin^{${m + 1}}x}{${m + 1}} - \frac{\sin^{${m + 3}}x}{${m + 3}}`, 'Odd power of cosine: $\\cos^3 x = (1 - \\sin^2 x)\\cos x$; let $u = \\sin x$.'],
      tan2: [R`\tan^2 x`, 'tan(x)^2', 'tan(x) - x', R`\tan x - x`, 'Use $\\tan^2 x = \\sec^2 x - 1$.'],
      sec4: [R`\sec^4 x`, 'sec(x)^4', 'tan(x) + tan(x)^3/3', R`\tan x + \frac{\tan^3 x}{3}`, 'Even power of secant: save $\\sec^2 x$, write the rest as $1 + \\tan^2 x$, let $u = \\tan x$.'],
      sin2cos2: [R`\sin^2 x\cos^2 x`, 'sin(x)^2*cos(x)^2', 'x/8 - sin(4*x)/32', R`\frac{x}{8} - \frac{\sin 4x}{32}`, '$\\sin x\\cos x = \\frac12\\sin 2x$, so the integrand is $\\frac14\\sin^2 2x$; then power-reduce.'],
      sec3: ['\\sec^3 x', 'sec(x)^3', '(sec(x)*tan(x) + ln(abs(sec(x) + tan(x))))/2', R`\frac{1}{2}\left(\sec x\tan x + \ln|\sec x + \tan x|\right)`, 'Classic: parts with $u = \\sec x$, $dv = \\sec^2 x\\,dx$, then the original reappears.'],
      tan3: ['\\tan^3 x', 'tan(x)^3', 'tan(x)^2/2 + ln(abs(cos(x)))', R`\frac{\tan^2 x}{2} + \ln|\cos x|`, '$\\tan^3 x = \\tan x(\\sec^2 x - 1)$.'],
      sin3cos2: ['\\sin^3 x\\cos^2 x', 'sin(x)^3*cos(x)^2', '-cos(x)^3/3 + cos(x)^5/5', R`-\frac{\cos^3 x}{3} + \frac{\cos^5 x}{5}`, 'Odd sine: $\\sin^3 x = (1 - \\cos^2 x)\\sin x$; $u = \\cos x$.'],
      cos4: ['\\cos^4 x', 'cos(x)^4', '3*x/8 + sin(2*x)/4 + sin(4*x)/32', R`\frac{3x}{8} + \frac{\sin 2x}{4} + \frac{\sin 4x}{32}`, 'Power-reduce twice: $\\cos^4 x = \\left(\\frac{1+\\cos 2x}{2}\\right)^2$.'],
      prodsum: [R`\sin(${p}x)\cos(${q}x)`, R`sin(${p}*x)*cos(${q}*x)`, R`-cos(${p + q}*x)/${2 * (p + q)} - cos(${p - q}*x)/${2 * (p - q)}`, R`-\frac{\cos(${p + q}x)}{${2 * (p + q)}} - \frac{\cos(${H.kx(p - q)})}{${2 * (p - q)}}`, 'Product-to-sum: $\\sin A\\cos B = \\frac12[\\sin(A+B) + \\sin(A-B)]$.']
    }[t];
    return {
      q: R`Find $\displaystyle\int ${P[0]}\,dx$.`, a: A.anti(P[2], P[3] + ' + C', { dom: [-1.2, 1.2] }),
      hints: [P[4], 'Strategy: odd powers → save one factor and use a Pythagorean identity; even powers of sin/cos → power-reducing identities.'],
      steps: [P[4], R`Result: $${P[3]} + C$.`], check: { anti: P[1] }
    };
  });

  def('trig-sub', { title: 'Trigonometric Substitution', unit: 'techniques', desc: 'Substitutions for √(a²−x²), √(a²+x²), √(x²−a²).' }, lv => {
    const a = U.int(1, 5), a2 = a * a;
    const subs = { minus: R`x = ${a === 1 ? '' : a}\sin\theta`, plus: R`x = ${a === 1 ? '' : a}\tan\theta`, xminus: R`x = ${a === 1 ? '' : a}\sec\theta` };
    const idHint = ['$\\sqrt{a^2 - x^2}$ → $x = a\\sin\\theta$; $\\sqrt{a^2 + x^2}$ → $x = a\\tan\\theta$; $\\sqrt{x^2 - a^2}$ → $x = a\\sec\\theta$.'];
    if (lv === 1) {
      const kind = U.pick(['minus', 'plus', 'xminus']);
      const forms = { minus: [R`\frac{x^2}{\sqrt{${a2} - x^2}}`, R`\sqrt{${a2} - x^2}`, R`\frac{1}{x^2\sqrt{${a2} - x^2}}`], plus: [R`\frac{1}{\sqrt{x^2 + ${a2}}}`, R`\frac{x^3}{\sqrt{x^2 + ${a2}}}`, R`\frac{1}{(x^2 + ${a2})^{3/2}}`], xminus: [R`\frac{\sqrt{x^2 - ${a2}}}{x}`, R`\frac{1}{x^2\sqrt{x^2 - ${a2}}}`] };
      const correct = '$' + subs[kind] + '$';
      return {
        q: R`Which substitution is best for $\displaystyle\int ${U.pick(forms[kind])}\,dx$?`,
        a: A.mc(correct, Object.keys(subs).filter(k => k !== kind).map(k => '$' + subs[k] + '$').concat([R`$u = x^2 ${kind === 'plus' ? '+' : '-'} ${a2}$`])),
        hints: idHint.concat(['Each substitution makes the radicand a perfect square via $1 - \\sin^2 = \\cos^2$, $1 + \\tan^2 = \\sec^2$, or $\\sec^2 - 1 = \\tan^2$.']),
        steps: idHint.concat([R`Here: $${subs[kind]}$.`])
      };
    }
    const pool = lv === 2 ? ['arcsin', 'arctan', 'lnplus', 'pow32'] : ['circle', 'x2minus', 'x2root', 'x2rootplus', 'secsub', 'quarter'];
    const t = U.pick(pool);
    const da = [0.15 * a, 0.85 * a];
    const P = {
      arcsin: [R`\frac{1}{\sqrt{${a2} - x^2}}`, R`1/sqrt(${a2} - x^2)`, R`arcsin(x/${a})`, R`\arcsin\left(\frac{x}{${a}}\right)`, 'minus', da],
      arctan: [R`\frac{1}{x^2 + ${a2}}`, R`1/(x^2 + ${a2})`, R`arctan(x/${a})/${a}`, R`\frac{1}{${a}}\arctan\left(\frac{x}{${a}}\right)`, 'plus', [-2, 2]],
      lnplus: [R`\frac{1}{\sqrt{x^2 + ${a2}}}`, R`1/sqrt(x^2 + ${a2})`, R`ln(abs(x + sqrt(x^2 + ${a2})))`, R`\ln\left|x + \sqrt{x^2 + ${a2}}\right|`, 'plus', [-2, 2]],
      pow32: [R`\frac{1}{(x^2 + ${a2})^{3/2}}`, R`1/(x^2 + ${a2})^(3/2)`, R`x/(${a2}*sqrt(x^2 + ${a2}))`, R`\frac{x}{${a2}\sqrt{x^2 + ${a2}}}`, 'plus', [-2, 2]],
      circle: [R`\sqrt{${a2} - x^2}`, R`sqrt(${a2} - x^2)`, R`x*sqrt(${a2} - x^2)/2 + ${a2}*arcsin(x/${a})/2`, R`\frac{x}{2}\sqrt{${a2} - x^2} + \frac{${a2}}{2}\arcsin\left(\frac{x}{${a}}\right)`, 'minus', da],
      x2minus: [R`\frac{x^2}{\sqrt{${a2} - x^2}}`, R`x^2/sqrt(${a2} - x^2)`, R`${a2}*arcsin(x/${a})/2 - x*sqrt(${a2} - x^2)/2`, R`\frac{${a2}}{2}\arcsin\left(\frac{x}{${a}}\right) - \frac{x}{2}\sqrt{${a2} - x^2}`, 'minus', da],
      x2root: [R`\frac{1}{x^2\sqrt{${a2} - x^2}}`, R`1/(x^2*sqrt(${a2} - x^2))`, R`-sqrt(${a2} - x^2)/(${a2}*x)`, R`-\frac{\sqrt{${a2} - x^2}}{${a2}x}`, 'minus', da],
      x2rootplus: [R`\frac{1}{x^2\sqrt{x^2 + ${a2}}}`, R`1/(x^2*sqrt(x^2 + ${a2}))`, R`-sqrt(x^2 + ${a2})/(${a2}*x)`, R`-\frac{\sqrt{x^2 + ${a2}}}{${a2}x}`, 'plus', [0.3, 3]],
      secsub: [R`\frac{\sqrt{x^2 - ${a2}}}{x}`, R`sqrt(x^2 - ${a2})/x`, R`sqrt(x^2 - ${a2}) - ${a}*arcsec(x/${a})`, R`\sqrt{x^2 - ${a2}} - ${a === 1 ? '' : a}\operatorname{arcsec}\left(\frac{x}{${a}}\right)`, 'xminus', [1.2 * a, 3 * a]]
    };
    if (t === 'quarter') {
      return { q: R`Evaluate $\displaystyle\int_0^{${a}} \sqrt{${a2} - x^2}\,dx$.`, a: A.num(Math.PI * a2 / 4, R`\frac{${a2 === 1 ? '' : a2}\pi}{4}`), hints: idHint.concat(['Or think geometrically: it\'s a quarter of a circle of radius ' + a + '.']), steps: [R`With $x = ${a}\sin\theta$: $${a2}\int_0^{\pi/2}\cos^2\theta\,d\theta = ${a2}\cdot\frac{\pi}{4}$.`, R`$= \frac{${a2}\pi}{4}$ — a quarter of the area $\pi(${a})^2$.`], check: { integral: [R`sqrt(${a2} - x^2)`, 0, a] } };
    }
    const p = P[t];
    return {
      q: R`Find $\displaystyle\int ${p[0]}\,dx$.`, a: A.anti(p[2], p[3] + ' + C', { dom: p[5] }),
      hints: idHint.concat([R`Use $${subs[p[4]]}$, simplify the root with a Pythagorean identity, integrate, then draw a right triangle to convert back to $x$.`]),
      steps: [R`Substitute $${subs[p[4]]}$.`, 'Simplify, integrate in $\\theta$, and use a reference triangle to return to $x$.', R`$${p[3]} + C$.`], check: { anti: p[1] }
    };
  });

  def('partial-fractions', { title: 'Partial Fractions', unit: 'techniques', desc: 'Decompose rational functions, then integrate.' }, lv => {
    const hints = ['Factor the denominator, then write $\\frac{P(x)}{(x-a)(x-b)} = \\frac{A}{x-a} + \\frac{B}{x-b}$.', 'Find $A$ by covering up $(x-a)$ and plugging in $x = a$ (Heaviside cover-up); same for $B$.'];
    if (lv === 1) {
      const [a, b] = U.distinct(2, -5, 5); const A1 = U.nz(-5, 5), B1 = U.nz(-5, 5);
      const p = A1 + B1, q = -(A1 * b + B1 * a);
      if (p === 0 && q === 0) return null;
      const num = T.lin(p, q), den = T.poly([[1, 2], [-(a + b), 1], [a * b, 0]]);
      const lo = Math.max(a, b) + 0.5;
      return {
        q: R`Find $\displaystyle\int \frac{${num}}{${den}}\,dx$.`, a: A.anti(R`${A1}*ln(abs(x - (${a}))) + ${B1}*ln(abs(x - (${b})))`, J([T.term(A1, R`\ln|${H.shift(a)}|`), T.term(B1, R`\ln|${H.shift(b)}|`)]) + ' + C', { dom: [lo, lo + 3] }),
        hints, steps: [R`$${den} = (${H.shift(a)})(${H.shift(b)})$.`, R`$\dfrac{${num}}{(${H.shift(a)})(${H.shift(b)})} = \dfrac{${A1}}{${H.shift(a)}} + \dfrac{${B1}}{${H.shift(b)}}$.`, R`Integrate: $${J([T.term(A1, R`\ln|${H.shift(a)}|`), T.term(B1, R`\ln|${H.shift(b)}|`)])} + C$.`],
        check: { anti: R`(${p}*x + ${q})/((x - (${a}))*(x - (${b})))` }
      };
    }
    if (lv === 2) {
      if (U.chance()) {
        const a = U.nz(-4, 4), A1 = U.nz(-4, 4), B1 = U.nz(-5, 5);
        const num = T.lin(A1, -A1 * a + B1);
        return {
          q: R`Find $\displaystyle\int \frac{${num}}{(${H.shift(a)})^2}\,dx$.`, a: A.anti(R`${A1}*ln(abs(x - (${a}))) - ${B1}/(x - (${a}))`, R`${J([T.term(A1, R`\ln|${H.shift(a)}|`)])} ${B1 > 0 ? '-' : '+'} \frac{${Math.abs(B1)}}{${H.shift(a)}} + C`, { dom: [a + 0.5, a + 3] }),
          hints: ['Repeated factor: $\\frac{P(x)}{(x-a)^2} = \\frac{A}{x-a} + \\frac{B}{(x-a)^2}$.', '$\\int\\frac{dx}{(x-a)^2} = -\\frac{1}{x-a}$.'],
          steps: [R`$\dfrac{${num}}{(${H.shift(a)})^2} = \dfrac{${A1}}{${H.shift(a)}} + \dfrac{${B1}}{(${H.shift(a)})^2}$.`, R`Integrate each: $${A1}\ln|${H.shift(a)}| - \dfrac{${B1}}{${H.shift(a)}} + C$.`],
          check: { anti: R`(${A1}*x + ${-A1 * a + B1})/(x - (${a}))^2` }
        };
      }
      const a = U.nz(-4, 4), b = U.int(-4, 4), c = U.int(-5, 5);
      const r = a * a + a * b + c; if (r === 0) return null;
      return {
        q: R`Find $\displaystyle\int \frac{${T.poly([[1, 2], [b, 1], [c, 0]])}}{${H.shift(a)}}\,dx$.`, a: A.anti(R`x^2/2 + ${a + b}*x + ${r}*ln(abs(x - (${a})))`, R`\frac{x^2}{2} ${(a + b) ? T.signed(a + b) + 'x' : ''} ${T.signed(r).replace(/ \+ 1$| - 1$/, m => m.slice(0, -1))}\ln|${H.shift(a)}| + C`, { dom: [a + 0.5, a + 3] }),
        hints: ['The numerator degree ≥ denominator degree: do **polynomial long division** first.'],
        steps: [R`Divide: $\dfrac{${T.poly([[1, 2], [b, 1], [c, 0]])}}{${H.shift(a)}} = ${T.lin(1, a + b)} + \dfrac{${r}}{${H.shift(a)}}$.`, R`Integrate: $\dfrac{x^2}{2} + ${a + b}x + ${r}\ln|${H.shift(a)}| + C$.`],
        check: { anti: R`(x^2 + ${b}*x + ${c})/(x - (${a}))` }
      };
    }
    const k = U.int(1, 3), A1 = U.nz(-3, 3), B1 = U.int(-3, 3), C1 = U.nz(-4, 4);
    const k2 = k * k;
    const numT = T.poly([[A1 + B1, 2], [C1, 1], [A1 * k2, 0]]);
    const ansS = R`${A1}*ln(abs(x)) + ${B1}/2*ln(x^2 + ${k2}) + ${C1}/${k}*arctan(x/${k})`;
    const ansT = J([T.term(A1, R`\ln|x|`), T.term(F(B1, 2), R`\ln(x^2 + ${k2})`), T.term(F(C1, k), R`\arctan\left(\frac{x}{${k}}\right)`)]);
    return {
      q: R`Find $\displaystyle\int \frac{${numT}}{x^3 + ${k2}x}\,dx$.`, a: A.anti(ansS, ansT + ' + C', { dom: [0.5, 3] }),
      hints: ['Factor: $x^3 + ' + k2 + 'x = x(x^2 + ' + k2 + ')$. Irreducible quadratic → numerator $Bx + C$.', '$\\frac{A}{x} + \\frac{Bx + C}{x^2 + ' + k2 + '}$; match coefficients.'],
      steps: [R`$\dfrac{${numT}}{x(x^2 + ${k2})} = \dfrac{${A1}}{x} + \dfrac{${T.lin(B1, C1)}}{x^2 + ${k2}}$.`, R`$\int\frac{${B1}x}{x^2 + ${k2}}dx = ${F(B1, 2).tex()}\ln(x^2 + ${k2})$, $\int\frac{${C1}}{x^2 + ${k2}}dx = ${F(C1, k).tex()}\arctan\frac{x}{${k}}$.`, R`$${ansT} + C$.`],
      check: { anti: R`(${A1 + B1}*x^2 + ${C1}*x + ${A1 * k2})/(x^3 + ${k2}*x)` }
    };
  });

  const TECH = ['$u$-substitution', 'Integration by parts', 'Trigonometric substitution', 'Partial fractions', 'Trig identities / trig powers'];
  def('integration-strategy', { title: 'Choosing a Technique', unit: 'techniques', desc: 'Recognize which method fits.' }, lv => {
    const a = U.int(2, 6), m = U.int(1, 4), n = U.int(2, 5);
    const items = [
      [0, R`x^{${m}}e^{x^{${m + 1}}}`, 'The derivative of the exponent $x^{' + (m + 1) + '}$ is (a multiple of) the factor in front.'],
      [0, R`\frac{x}{x^2 + ${a}}`, 'Top is (half) the derivative of the bottom.'],
      [0, R`\cos x\,e^{\sin x}`, '$\\cos x$ is the derivative of the inner $\\sin x$.'],
      [0, R`\frac{(\ln x)^{${n}}}{x}`, '$\\frac1x$ is the derivative of $\\ln x$.'],
      [0, R`x\sqrt{x^2 + ${a}}`, '$x$ is (half) the derivative of $x^2 + ' + a + '$ — no trig sub needed.'],
      [1, R`x^{${m}}e^{${a}x}`, 'Product of a polynomial and an exponential: let $u$ = polynomial (LIATE).'],
      [1, R`x^{${m}}\ln x`, 'Log times algebraic: $u = \\ln x$.'],
      [1, R`x\sin(${a}x)`, 'Polynomial times trig: $u = x$.'],
      [1, R`\arctan x`, 'Inverse trig alone: $u = \\arctan x$, $dv = dx$.'],
      [1, R`e^{x}\cos(${a}x)`, 'Exponential times trig: parts twice.'],
      [2, R`\sqrt{${a * a} - x^2}`, 'Form $\\sqrt{a^2 - x^2}$ with no helpful $x$ outside: $x = a\\sin\\theta$.'],
      [2, R`\frac{1}{x^2\sqrt{x^2 + ${a}}}`, 'Form $\\sqrt{x^2 + a^2}$: $x = a\\tan\\theta$.'],
      [2, R`\frac{x^2}{\sqrt{${a * a} - x^2}}`, 'Form $\\sqrt{a^2 - x^2}$ and $x^2$ (not $x$) outside: trig sub.'],
      [3, R`\frac{1}{(x - ${a})(x + ${m})}`, 'Rational function with a factorable denominator.'],
      [3, R`\frac{${n}x + 1}{x^2 - ${a * a}}`, 'Denominator factors as $(x - ' + a + ')(x + ' + a + ')$.'],
      [3, R`\frac{x + ${m}}{x^2 + ${a + 1}x + ${a}}`, 'Denominator factors: $(x + 1)(x + ' + a + ')$.'],
      [4, R`\sin^2(${a}x)`, 'Even power of sine: power-reducing identity.'],
      [4, R`\sin^3 x\cos^{${n}} x`, 'Odd power of sine: peel off one $\\sin x$ and use $\\sin^2 = 1 - \\cos^2$.'],
      [4, R`\tan^2 x`, 'Use $\\tan^2 x = \\sec^2 x - 1$.']
    ];
    const pool = lv === 1 ? items.filter(i => [0, 1].includes(i[0])) : items;
    const [ci, integ, why] = U.pick(pool);
    const choices = lv === 1 ? [TECH[0], TECH[1], TECH[2]] : TECH.slice();
    const ord = U.shuffle(choices.map((c, i) => i));
    const ch = ord.map(i => choices[i]);
    return {
      q: R`What is the best first technique for $\displaystyle\int ${integ}\,dx$?`,
      a: A.mcFixed(ch, ch.indexOf(TECH[ci])),
      hints: ['Check for $u$-sub first: is some piece the derivative of another piece?', 'Products of different "types" → parts. Radicals of quadratics → trig sub. Rational functions → partial fractions. Powers of trig → identities.'],
      steps: [why, R`Best choice: **${TECH[ci]}**.`]
    };
  });

  def('improper', { title: 'Improper Integrals', unit: 'techniques', desc: 'Infinite limits and infinite discontinuities.' }, lv => {
    const hints = ['Replace the problem limit with a variable $t$, integrate, then take $\\lim_{t\\to\\infty}$ (or $t\\to$ the bad point).', 'p-test: $\\int_1^\\infty \\frac{dx}{x^p}$ converges iff $p > 1$; $\\int_0^1 \\frac{dx}{x^p}$ converges iff $p < 1$.'];
    const tail = ' (Type <kbd>diverges</kbd> if it diverges.)';
    const t = lv === 1 ? U.pick(['pinf', 'pinf', 'exp']) : lv === 2 ? U.pick(['p01', 'xexp', 'atanall', 'atanhalf']) : U.pick(['xlnx', 'xln2', 'lnx01', 'tele', 'xsq2', 'p01']);
    if (t === 'pinf') {
      const p = U.pick([F(2), F(3), F(4), F(3, 2), F(5, 2), F(1), F(1, 2), F(4, 3)]);
      const conv = p.v > 1; const val = conv ? p.sub(1).inv() : null;
      return { q: R`Evaluate $\displaystyle\int_1^\infty \frac{1}{x^{${p.texInline()}}}\,dx$.${tail}`, a: conv ? A.num(val) : A.num('diverges'), hints, steps: [R`$\int_1^t x^{-${p.texInline()}}dx$ — here $p = ${p.tex()}$.`, conv ? R`$p > 1$: $\lim_{t\to\infty}\left[\frac{x^{1-p}}{1-p}\right]_1^t = \frac{1}{p - 1} = ${val.tex()}$.` : R`$p \le 1$: the integral grows without bound — **diverges**.`] };
    }
    if (t === 'exp') { const a = U.int(1, 6); return { q: R`Evaluate $\displaystyle\int_0^\infty e^{-${a === 1 ? '' : a}x}\,dx$.${tail}`, a: A.num(F(1, a)), hints, steps: [R`$\lim_{t\to\infty}\left[-\frac{1}{${a}}e^{-${a}x}\right]_0^t = 0 + \frac{1}{${a}}$.`] }; }
    if (t === 'p01') {
      const p = U.pick([F(1, 2), F(1, 3), F(2, 3), F(3, 4), F(1), F(2), F(3, 2)]);
      const conv = p.v < 1; const val = conv ? F(1).sub(p).inv() : null;
      return { q: R`Evaluate $\displaystyle\int_0^1 \frac{1}{x^{${p.texInline()}}}\,dx$.${tail}`, a: conv ? A.num(val) : A.num('diverges'), hints, steps: [R`The integrand blows up at $x = 0$: use $\lim_{t\to0^+}\int_t^1$.`, conv ? R`$p < 1$: $\left[\frac{x^{1-p}}{1-p}\right]_0^1 = \frac{1}{1-p} = ${val.tex()}$.` : R`$p \ge 1$: **diverges**.`] };
    }
    if (t === 'xexp') { const a = U.int(1, 4); return { q: R`Evaluate $\displaystyle\int_0^\infty xe^{-${a === 1 ? '' : a}x}\,dx$.${tail}`, a: A.num(F(1, a * a)), hints: hints.concat(['Integrate by parts first.']), steps: [R`Parts: $\int xe^{-${a}x}dx = -\frac{x}{${a}}e^{-${a}x} - \frac{1}{${a * a}}e^{-${a}x}$.`, R`At $\infty$ both terms $\to 0$ (exponential beats polynomial); at $0$: $-\frac{1}{${a * a}}$. Result $\frac{1}{${a * a}}$.`] }; }
    if (t === 'atanall') return { q: R`Evaluate $\displaystyle\int_{-\infty}^{\infty} \frac{1}{1 + x^2}\,dx$.${tail}`, a: A.num(Math.PI, '\\pi'), hints, steps: [R`Split at 0: $\lim_{t\to\infty}\arctan t - \lim_{s\to-\infty}\arctan s = \frac{\pi}{2} - (-\frac{\pi}{2}) = \pi$.`] };
    if (t === 'atanhalf') { const a = U.int(2, 5); return { q: R`Evaluate $\displaystyle\int_0^\infty \frac{1}{x^2 + ${a * a}}\,dx$.${tail}`, a: A.num(Math.PI / (2 * a), R`\frac{\pi}{${2 * a}}`), hints, steps: [R`$\frac{1}{${a}}\arctan\frac{x}{${a}}\Big|_0^\infty = \frac{1}{${a}}\cdot\frac{\pi}{2}$.`] }; }
    if (t === 'xlnx') return { q: R`Evaluate $\displaystyle\int_2^\infty \frac{1}{x\ln x}\,dx$.${tail}`, a: A.num('diverges'), hints, steps: [R`$u = \ln x$: $\ln|\ln x|\Big|_2^t \to \infty$. **Diverges**.`] };
    if (t === 'xln2') { const p = U.pick([2, 3, 4]); return { q: R`Evaluate $\displaystyle\int_e^\infty \frac{1}{x(\ln x)^{${p}}}\,dx$.${tail}`, a: A.num(F(1, p - 1)), hints, steps: [R`$u = \ln x$, limits $1 \to \infty$: $\int_1^\infty u^{-${p}}du = \frac{1}{${p - 1}}$.`] }; }
    if (t === 'lnx01') return { q: R`Evaluate $\displaystyle\int_0^1 \ln x\,dx$.${tail}`, a: A.num(-1), hints, steps: [R`$(x\ln x - x)\Big|_t^1 = -1 - (t\ln t - t)$; and $t\ln t \to 0$.`, 'Result: $-1$.'] };
    if (t === 'tele') return { q: R`Evaluate $\displaystyle\int_1^\infty \frac{1}{x(x + 1)}\,dx$.${tail}`, a: A.num(Math.LN2, '\\ln 2'), hints: hints.concat(['Partial fractions: $\\frac1x - \\frac{1}{x+1}$.']), steps: [R`$\ln\left|\frac{x}{x+1}\right|\Big|_1^\infty = 0 - \ln\frac12 = \ln 2$.`] };
    return { q: R`Evaluate $\displaystyle\int_0^\infty \frac{x}{(1 + x^2)^2}\,dx$.${tail}`, a: A.num(F(1, 2)), hints, steps: [R`$u = 1 + x^2$: $-\frac{1}{2(1+x^2)}\Big|_0^\infty = 0 + \frac12$.`] };
  });

  def('numerical-integration', { title: 'Numerical Integration', unit: 'techniques', desc: 'Trapezoid, midpoint and Simpson\'s rule.' }, lv => {
    const choice = lv === 1 ? 'trap' : lv === 2 ? U.pick(['mid', 'simp', 'trap']) : U.pick(['simp', 'simprec']);
    const n = choice.startsWith('simp') ? U.pick([2, 4]) : U.pick([2, 3, 4]);
    let f, fs, ft, a, b;
    if (choice === 'simprec') { a = 1; b = U.pick([2, 3]); f = x => Frac.of(1).div(x); fs = '1/x'; ft = '\\frac{1}{x}'; }
    else {
      const terms = choice === 'simp' ? [[U.pick([1, -1]), 3], [U.int(-2, 2), 2], [U.int(0, 4), 0]] : [[U.pick([1, 2, -1]), 2], [U.int(-3, 3), 1], [U.int(0, 5), 0]];
      f = x => poly.evalF(terms, x); fs = S.poly(terms); ft = T.poly(terms); a = U.int(-1, 1); b = a + n * U.pick([1, 1, 2]) / (choice === 'simp' ? 1 : 1);
    }
    const dx = F(b - a, n);
    const xs = U.range(0, n).map(i => F(a).add(dx.mul(i)));
    let sum = new Frac(0), formula;
    if (choice === 'trap') { xs.forEach((x, i) => { sum = sum.add(f(x).mul(i === 0 || i === n ? 1 : 2)); }); sum = sum.mul(dx).div(2); formula = '\\frac{\\Delta x}{2}\\left[f(x_0) + 2f(x_1) + \\cdots + 2f(x_{n-1}) + f(x_n)\\right]'; }
    else if (choice === 'mid') { for (let i = 0; i < n; i++) sum = sum.add(f(xs[i].add(xs[i + 1]).div(2))); sum = sum.mul(dx); formula = '\\Delta x\\left[f(\\bar x_1) + \\cdots + f(\\bar x_n)\\right]'; }
    else { xs.forEach((x, i) => { sum = sum.add(f(x).mul(i === 0 || i === n ? 1 : i % 2 ? 4 : 2)); }); sum = sum.mul(dx).div(3); formula = '\\frac{\\Delta x}{3}\\left[f(x_0) + 4f(x_1) + 2f(x_2) + \\cdots + 4f(x_{n-1}) + f(x_n)\\right]'; }
    const name = { trap: 'the Trapezoidal Rule', mid: 'the Midpoint Rule', simp: "Simpson's Rule", simprec: "Simpson's Rule" }[choice];
    return {
      q: R`Approximate $\displaystyle\int_{${a}}^{${b}} ${ft}\,dx$ using ${name} with $n = ${n}$. (Exact fraction or 4+ decimals.)`, a: A.num(sum),
      hints: [R`$\Delta x = \frac{${b} - (${a})}{${n}} = ${dx.tex()}$.`, R`$${formula}$.`],
      steps: [R`Nodes: ${xs.map(x => '$' + x.tex() + '$').join(', ')}.`, R`Plug into $${formula}$.`, R`Result: $${sum.tex()} \approx ${U.fmt(sum.v, 5)}$.`].concat(choice === 'simp' ? ["Simpson's rule is **exact** for cubics — compare with the true integral!"] : [])
    };
  });
})();
