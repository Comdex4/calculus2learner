/* Generators: applications of integration + intro differential equations. */
(function () {
  'use strict';
  const { U, T, S, F, Frac, gen, poly } = CL;
  const { def, A, H } = gen;
  const R = String.raw;
  const piT = f => T.pi(Frac.of(f));
  const piA = f => A.num(Frac.of(f).v * Math.PI, piT(f));

  def('area-between', { title: 'Area Between Curves', unit: 'intapps', desc: '∫(top − bottom) dx.' }, lv => {
    const hints = ['Find where the curves intersect — those are your limits.', 'Area $= \\displaystyle\\int_a^b (\\text{top} - \\text{bottom})\\,dx$.'];
    if (lv === 1) {
      if (U.chance()) {
        const k = U.int(1, 6);
        return { q: R`Find the area of the region between $y = x^2$ and $y = ${H.kx(k)}$.`, a: A.num(F(k ** 3, 6)), hints, steps: [R`Intersections: $x^2 = ${H.kx(k)} \Rightarrow x = 0, ${k}$.`, R`$\int_0^{${k}} (${H.kx(k)} - x^2)dx = \frac{${k}^3}{2} - \frac{${k}^3}{3} = ${F(k ** 3, 6).tex()}$.`], check: { integral: [R`${k}*x - x^2`, 0, k] }, graph: { fns: [{ f: 'x^2' }, { f: k + '*x' }], shade: [{ f: k + '*x', g: 'x^2', a: 0, b: k }], x: [-1, k + 1], y: [-1, k * k + 2] } };
      }
      const c = U.int(1, 4);
      return { q: R`Find the area of the region between $y = x^2$ and $y = ${c * c}$.`, a: A.num(F(4 * c ** 3, 3)), hints, steps: [R`Intersections: $x = \pm ${c}$.`, R`$\int_{-${c}}^{${c}} (${c * c} - x^2)dx = ${2 * c ** 3} - \frac{${2 * c ** 3}}{3} = ${F(4 * c ** 3, 3).tex()}$.`], check: { integral: [R`${c * c} - x^2`, -c, c] }, graph: { fns: [{ f: 'x^2' }, { f: String(c * c) }], shade: [{ f: String(c * c), g: 'x^2', a: -c, b: c }], x: [-c - 2, c + 2], y: [-1, c * c + 3] } };
    }
    if (lv === 2) {
      const [r, s] = U.distinct(2, -3, 4).sort((x, y) => x - y);
      const a = -U.int(1, 3), m = U.int(-3, 3), c = U.int(-4, 4);
      const g = [[m, 1], [c, 0]];
      const f = [[a, 2], [m - a * (r + s), 1], [c + a * r * s, 0]];
      const area = F(-a * (s - r) ** 3, 6);
      return { q: R`Find the area enclosed by $y = ${T.poly(f)}$ and $y = ${T.poly(g)}$.`, a: A.num(area), hints, steps: [R`Set equal: $${T.poly(f)} = ${T.poly(g)} \Rightarrow ${a}(x - ${r < 0 ? '(' + r + ')' : r})(x - ${s < 0 ? '(' + s + ')' : s}) = 0$, so $x = ${r}, ${s}$.`, R`Top minus bottom: $${T.poly([[a, 2], [-a * (r + s), 1], [a * r * s, 0]])}$.`, R`$\int_{${r}}^{${s}}(\ldots)dx = ${area.tex()}$.`], check: { integral: [R`${S.poly(f)} - ${S.poly(g)}`, r, s] }, graph: { fns: [{ f: S.poly(f) }, { f: S.poly(g) }], shade: [{ f: S.poly(f), g: S.poly(g), a: r, b: s }], x: [r - 2, s + 2], y: [-12, 12] } };
    }
    const t = U.pick(['parab', 'sqrt', 'wrty', 'sincos']);
    if (t === 'parab') { const m = U.int(1, 3); const p = U.int(0, 2 * m * m); const q = 2 * m * m - p; return { q: R`Find the area enclosed by $y = ${T.poly([[-1, 2], [p, 0]])}$ and $y = ${T.poly([[1, 2], [-q, 0]])}$.`, a: A.num(F(8 * m ** 3, 3)), hints, steps: [R`$-x^2 + ${p} = x^2 - ${q} \Rightarrow x = \pm${m}$.`, R`$\int_{-${m}}^{${m}}(${2 * m * m} - 2x^2)dx = ${F(8 * m ** 3, 3).tex()}$.`], check: { integral: [R`${2 * m * m} - 2*x^2`, -m, m] } }; }
    if (t === 'sqrt') { const k = U.int(1, 4); return { q: R`Find the area between $y = \sqrt{x}$ and $y = ${k === 1 ? 'x' : '\\frac{x}{' + k + '}'}$.`, a: A.num(F(k ** 3, 6)), hints, steps: [R`$\sqrt x = \frac{x}{${k}} \Rightarrow x = 0, ${k * k}$.`, R`$\int_0^{${k * k}}\left(\sqrt x - \frac{x}{${k}}\right)dx = \frac{2}{3}(${k})^3 - \frac{${k ** 4}}{${2 * k}} = ${F(k ** 3, 6).tex()}$.`], check: { integral: [R`sqrt(x) - x/${k}`, 0, k * k] } }; }
    if (t === 'wrty') { const [r, s] = U.distinct(2, -3, 3).sort((x, y) => x - y); return { q: R`Find the area enclosed by $x = y^2$ and $x = ${T.lin(r + s, -r * s, 'y')}$. (Integrate with respect to $y$.)`, a: A.num(F((s - r) ** 3, 6)), hints: ['When curves are given as $x = g(y)$, use $\\int (\\text{right} - \\text{left})\\,dy$.'], steps: [R`$y^2 = ${T.lin(r + s, -r * s, 'y')} \Rightarrow y = ${r}, ${s}$.`, R`$\int_{${r}}^{${s}}(${T.lin(r + s, -r * s, 'y')} - y^2)dy = \frac{(${s} - (${r}))^3}{6} = ${F((s - r) ** 3, 6).tex()}$.`], check: { integral: [R`${r + s}*x - ${r * s} - x^2`, r, s] } }; }
    return { q: R`Find the area between $y = \sin x$ and $y = \cos x$ from $x = \frac{\pi}{4}$ to $x = \frac{5\pi}{4}$.`, a: A.num(2 * Math.SQRT2, '2\\sqrt{2}'), hints, steps: [R`On this interval $\sin x \ge \cos x$.`, R`$\left[-\cos x - \sin x\right]_{\pi/4}^{5\pi/4} = \sqrt2 + \sqrt2 = 2\sqrt2$.`], check: { integral: ['sin(x) - cos(x)', Math.PI / 4, 5 * Math.PI / 4] } };
  });

  def('volume-disk', { title: 'Volumes: Disks & Washers', unit: 'intapps', desc: 'V = π∫(R² − r²) dx.' }, lv => {
    const hints = ['Disk: $V = \\pi\\displaystyle\\int_a^b [f(x)]^2\\,dx$. Washer: $V = \\pi\\displaystyle\\int_a^b \\left(R^2 - r^2\\right)dx$.', 'Answer as a multiple of $\\pi$, e.g. <kbd>8pi/3</kbd>.'];
    const b = U.int(1, 4);
    if (lv === 1) {
      const t = U.pick(['x', 'sqrt', 'x2']);
      const P = { x: ['x', F(b ** 3, 3), 'x^2', R`\pi\int_0^{${b}} x^2\,dx`], sqrt: ['\\sqrt{x}', F(b * b, 2), 'x', R`\pi\int_0^{${b}} x\,dx`], x2: ['x^2', F(b ** 5, 5), 'x^4', R`\pi\int_0^{${b}} x^4\,dx`] }[t];
      return { q: R`The region under $y = ${P[0]}$ on $[0, ${b}]$ is revolved about the $x$-axis. Find the volume.`, a: piA(P[1]), hints, steps: [R`$V = ${P[3]}$.`, R`$= ${piT(P[1])}$.`], check: { integral: [R`pi*${P[2]}`, 0, b] } };
    }
    if (lv === 2) {
      const t = U.pick(['washer', 'sqrtx', 'exp', 'recip']);
      if (t === 'washer') { const m = U.int(1, 3); return { q: R`The region between $y = ${H.kx(m)}$ and $y = x^2$ is revolved about the $x$-axis. Find the volume.`, a: piA(F(2 * m ** 5, 15)), hints, steps: [R`Intersections at $x = 0, ${m}$; outer radius $R = ${H.kx(m)}$, inner $r = x^2$.`, R`$V = \pi\int_0^{${m}}(${m * m}x^2 - x^4)dx = \pi\left(\frac{${m ** 5}}{3} - \frac{${m ** 5}}{5}\right) = ${piT(F(2 * m ** 5, 15))}$.`], check: { integral: [R`pi*(${m * m}*x^2 - x^4)`, 0, m] } }; }
      if (t === 'sqrtx') return { q: R`The region between $y = \sqrt{x}$ and $y = x$ is revolved about the $x$-axis. Find the volume.`, a: piA(F(1, 6)), hints, steps: [R`Intersections $x = 0, 1$; $R = \sqrt x$, $r = x$.`, R`$\pi\int_0^1(x - x^2)dx = \frac{\pi}{6}$.`], check: { integral: ['pi*(x - x^2)', 0, 1] } };
      if (t === 'exp') { const k = U.int(2, 5); return { q: R`The region under $y = e^{x}$ on $[0, \ln ${k}]$ is revolved about the $x$-axis. Find the volume.`, a: piA(F(k * k - 1, 2)), hints, steps: [R`$\pi\int_0^{\ln ${k}} e^{2x}dx = \frac{\pi}{2}(e^{2\ln ${k}} - 1) = \frac{\pi}{2}(${k * k} - 1)$.`], check: { integral: ['pi*exp(2*x)', 0, Math.log(k)] } }; }
      const bb = U.int(2, 6);
      return { q: R`The region under $y = \frac{1}{x}$ on $[1, ${bb}]$ is revolved about the $x$-axis. Find the volume.`, a: piA(F(bb - 1, bb)), hints, steps: [R`$\pi\int_1^{${bb}} x^{-2}dx = \pi\left(1 - \frac{1}{${bb}}\right) = ${piT(F(bb - 1, bb))}$.`], check: { integral: ['pi/x^2', 1, bb] } };
    }
    if (U.chance(0.7)) {
      const c = U.int(1, 3), bb = U.int(1, 2);
      const v = F(bb ** 5, 5).add(F(2 * c * bb ** 3, 3));
      return { q: R`The region under $y = x^2$ on $[0, ${bb}]$ is revolved about the line $y = -${c}$. Find the volume.`, a: piA(v), hints: hints.concat(['Radii are measured from the axis $y = -' + c + '$: $R = x^2 + ' + c + '$, $r = ' + c + '$.']), steps: [R`$V = \pi\int_0^{${bb}}\left[(x^2 + ${c})^2 - ${c}^2\right]dx = \pi\int_0^{${bb}}(x^4 + ${2 * c}x^2)dx$.`, R`$= \pi\left(\frac{${bb ** 5}}{5} + \frac{${2 * c * bb ** 3}}{3}\right) = ${piT(v)}$.`], check: { integral: [R`pi*((x^2 + ${c})^2 - ${c * c})`, 0, bb] } };
    }
    return { q: R`The region under $y = \sin x$ on $[0, \pi]$ is revolved about the $x$-axis. Find the volume.`, a: A.num(Math.PI ** 2 / 2, '\\frac{\\pi^2}{2}'), hints, steps: [R`$\pi\int_0^\pi\sin^2 x\,dx = \pi\cdot\frac{\pi}{2}$.`], check: { integral: ['pi*sin(x)^2', 0, Math.PI] } };
  });

  def('volume-shell', { title: 'Volumes: Cylindrical Shells', unit: 'intapps', desc: 'V = 2π∫(radius)(height) dx.' }, lv => {
    const hints = ['Shells (about the $y$-axis): $V = 2\\pi\\displaystyle\\int_a^b x\\,f(x)\\,dx$ — radius $x$, height $f(x)$.', 'About $x = -c$, the radius becomes $x + c$.'];
    if (lv === 1) {
      const b = U.int(1, 4);
      if (U.chance()) return { q: R`The region under $y = x^2$ on $[0, ${b}]$ is revolved about the $y$-axis. Use shells to find the volume.`, a: piA(F(b ** 4, 2)), hints, steps: [R`$2\pi\int_0^{${b}} x\cdot x^2\,dx = 2\pi\cdot\frac{${b ** 4}}{4} = ${piT(F(b ** 4, 2))}$.`], check: { integral: ['2*pi*x^3', 0, b] } };
      return { q: R`The region under $y = x$ on $[0, ${b}]$ is revolved about the $y$-axis. Find the volume.`, a: piA(F(2 * b ** 3, 3)), hints, steps: [R`$2\pi\int_0^{${b}} x^2\,dx = ${piT(F(2 * b ** 3, 3))}$.`], check: { integral: ['2*pi*x^2', 0, b] } };
    }
    if (lv === 2) {
      const t = U.pick(['parab', 'sqrt', 'recip']);
      if (t === 'parab') { const m = U.int(1, 4); return { q: R`The region between $y = ${H.kx(m)} - x^2$ and the $x$-axis is revolved about the $y$-axis. Find the volume.`, a: piA(F(m ** 4, 6)), hints, steps: [R`The region spans $0 \le x \le ${m}$.`, R`$2\pi\int_0^{${m}} x(${H.kx(m)} - x^2)dx = 2\pi\left(\frac{${m ** 4}}{3} - \frac{${m ** 4}}{4}\right) = ${piT(F(m ** 4, 6))}$.`], check: { integral: [R`2*pi*x*(${m}*x - x^2)`, 0, m] } }; }
      if (t === 'sqrt') { const k = U.int(1, 3), b = k * k; return { q: R`The region under $y = \sqrt{x}$ on $[0, ${b}]$ is revolved about the $y$-axis. Find the volume.`, a: piA(F(4 * k ** 5, 5)), hints, steps: [R`$2\pi\int_0^{${b}} x^{3/2}dx = 2\pi\cdot\frac{2}{5}(${b})^{5/2} = ${piT(F(4 * k ** 5, 5))}$.`], check: { integral: ['2*pi*x^(3/2)', 0, b] } }; }
      const b = U.int(2, 6); return { q: R`The region under $y = \frac{1}{x}$ on $[1, ${b}]$ is revolved about the $y$-axis. Find the volume.`, a: piA(F(2 * (b - 1))), hints, steps: [R`$2\pi\int_1^{${b}} x\cdot\frac1x\,dx = 2\pi(${b} - 1)$.`], check: { integral: ['2*pi', 1, b] } };
    }
    const t = U.pick(['shift', 'gauss', 'sin']);
    if (t === 'shift') { const c = U.int(1, 3), b = U.int(1, 2); const v = F(2 * b ** 4, 4).add(F(2 * c * b ** 3, 3)); return { q: R`The region under $y = x^2$ on $[0, ${b}]$ is revolved about the line $x = -${c}$. Find the volume.`, a: piA(v), hints, steps: [R`Radius $= x + ${c}$, height $= x^2$.`, R`$2\pi\int_0^{${b}}(x + ${c})x^2dx = 2\pi\left(\frac{${b ** 4}}{4} + \frac{${c * b ** 3}}{3}\right) = ${piT(v)}$.`], check: { integral: [R`2*pi*(x + ${c})*x^2`, 0, b] } }; }
    if (t === 'gauss') { const b = U.int(1, 2); return { q: R`The region under $y = e^{-x^2}$ on $[0, ${b}]$ is revolved about the $y$-axis. Find the volume.`, a: A.num(Math.PI * (1 - Math.exp(-b * b)), R`\pi\left(1 - e^{-${b * b}}\right)`), hints: hints.concat(['Shells turn this impossible-looking integral into a $u$-substitution!']), steps: [R`$2\pi\int_0^{${b}} xe^{-x^2}dx = -\pi e^{-x^2}\Big|_0^{${b}} = \pi(1 - e^{-${b * b}})$.`], check: { integral: ['2*pi*x*exp(-x^2)', 0, b] } }; }
    return { q: R`The region under $y = \sin x$ on $[0, \pi]$ is revolved about the $y$-axis. Find the volume.`, a: A.num(2 * Math.PI ** 2, '2\\pi^2'), hints, steps: [R`$2\pi\int_0^\pi x\sin x\,dx$; by parts the integral is $\pi$.`, R`$V = 2\pi^2$.`], check: { integral: ['2*pi*x*sin(x)', 0, Math.PI] } };
  });

  def('arc-length', { title: 'Arc Length', unit: 'intapps', desc: 'L = ∫√(1 + (y\')²) dx.' }, lv => {
    const hints = ['$L = \\displaystyle\\int_a^b\\sqrt{1 + [f\'(x)]^2}\\,dx$.', 'These problems are designed so $1 + (f\')^2$ is a perfect square — look for it!'];
    if (lv === 1) {
      const [p, q, h] = U.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17]]);
      const a = U.int(-2, 1), b = a + q * U.int(1, 2);
      const m = F(p, q);
      return { q: R`Find the length of $y = ${m.tex()}x ${T.signed(U.int(-3, 3))}$ from $x = ${a}$ to $x = ${b}$.`, a: A.num(F(h * (b - a), q)), hints, steps: [R`$\sqrt{1 + \left(${m.tex()}\right)^2} = \sqrt{\frac{${q * q + p * p}}{${q * q}}} = \frac{${h}}{${q}}$.`, R`$L = \frac{${h}}{${q}}(${b - a}) = ${F(h * (b - a), q).tex()}$. (Same as the distance formula!)`], check: { value: h * (b - a) / q } };
    }
    if (lv === 2) {
      const b = U.pick([3, 8, 15, 24]); const s = Math.sqrt(1 + b);
      const v = F(2 * (s ** 3 - 1), 3);
      return { q: R`Find the arc length of $y = \frac{2}{3}x^{3/2}$ from $x = 0$ to $x = ${b}$.`, a: A.num(v), hints, steps: [R`$y' = x^{1/2}$, so $\sqrt{1 + x}$.`, R`$\int_0^{${b}}\sqrt{1 + x}\,dx = \frac{2}{3}(1 + x)^{3/2}\Big|_0^{${b}} = \frac{2}{3}(${s ** 3} - 1) = ${v.tex()}$.`], check: { integral: ['sqrt(1 + x)', 0, b] } };
    }
    if (U.chance()) {
      const b = U.int(2, 3);
      const v = F(b ** 3, 6).sub(F(1, 2 * b)).sub(F(1, 6)).add(F(1, 2));
      return { q: R`Find the arc length of $y = \frac{x^3}{6} + \frac{1}{2x}$ from $x = 1$ to $x = ${b}$.`, a: A.num(v), hints, steps: [R`$y' = \frac{x^2}{2} - \frac{1}{2x^2}$, and $1 + (y')^2 = \left(\frac{x^2}{2} + \frac{1}{2x^2}\right)^2$.`, R`$L = \left[\frac{x^3}{6} - \frac{1}{2x}\right]_1^{${b}} = ${v.tex()}$.`], check: { integral: ['x^2/2 + 1/(2*x^2)', 1, b] } };
    }
    if (U.chance()) {
      const b = U.int(2, 4);
      return { q: R`Find the arc length of $y = \frac{x^2}{4} - \frac{\ln x}{2}$ from $x = 1$ to $x = ${b}$.`, a: A.num((b * b - 1) / 4 + Math.log(b) / 2, R`\frac{${b * b - 1}}{4} + \frac{\ln ${b}}{2}`), hints, steps: [R`$y' = \frac{x}{2} - \frac{1}{2x}$, $1 + (y')^2 = \left(\frac{x}{2} + \frac{1}{2x}\right)^2$.`, R`$L = \left[\frac{x^2}{4} + \frac{\ln x}{2}\right]_1^{${b}} = \frac{${b * b - 1}}{4} + \frac{\ln ${b}}{2}$.`], check: { integral: ['x/2 + 1/(2*x)', 1, b] } };
    }
    return { q: R`Find the arc length of $y = \ln(\cos x)$ from $x = 0$ to $x = \frac{\pi}{4}$.`, a: A.num(Math.log(Math.SQRT2 + 1), R`\ln\left(\sqrt{2} + 1\right)`), hints, steps: [R`$y' = -\tan x$, $1 + \tan^2 x = \sec^2 x$.`, R`$\int_0^{\pi/4}\sec x\,dx = \ln|\sec x + \tan x|\Big|_0^{\pi/4} = \ln(\sqrt2 + 1)$.`], check: { integral: ['1/cos(x)', 0, Math.PI / 4] } };
  });

  def('average-value', { title: 'Average Value', unit: 'intapps', desc: 'The mean height of a function over an interval.' }, lv => {
    const hints = ['$f_{\\text{avg}} = \\dfrac{1}{b - a}\\displaystyle\\int_a^b f(x)\\,dx$.'];
    if (lv === 1) {
      const terms = [[U.nz(-3, 3), 2], [U.int(-4, 4), 1], [U.int(-5, 5), 0]];
      const a = U.int(-2, 1), b = a + U.int(1, 4);
      const I = poly.evalF(poly.int(terms), b).sub(poly.evalF(poly.int(terms), a)); const v = I.div(b - a);
      return { q: R`Find the average value of $f(x) = ${T.poly(terms)}$ on $[${a}, ${b}]$.`, a: A.num(v), hints, steps: [R`$\int_{${a}}^{${b}} f\,dx = ${I.tex()}$.`, R`Divide by $${b - a}$: $${v.tex()}$.`], check: { value: v.v } };
    }
    if (lv === 2) {
      const P = U.pick([
        [R`\sin x`, '[0, \\pi]', 2 / Math.PI, '\\frac{2}{\\pi}', R`$\frac{1}{\pi}\int_0^\pi\sin x\,dx = \frac{2}{\pi}$.`],
        [R`\cos x`, '[0, \\frac{\\pi}{2}]', 2 / Math.PI, '\\frac{2}{\\pi}', R`$\frac{2}{\pi}\int_0^{\pi/2}\cos x\,dx = \frac{2}{\pi}$.`],
        [R`\frac{1}{x}`, '[1, e]', 1 / (Math.E - 1), '\\frac{1}{e - 1}', R`$\frac{1}{e - 1}\int_1^e\frac{dx}{x} = \frac{1}{e - 1}$.`],
        ...[2, 3].map(k => [R`\sqrt{x}`, `[0, ${k * k}]`, 2 * k / 3, F(2 * k, 3).tex(), R`$\frac{1}{${k * k}}\cdot\frac{2}{3}(${k * k})^{3/2} = ${F(2 * k, 3).tex()}$.`])
      ]);
      return { q: R`Find the average value of $f(x) = ${P[0]}$ on $${P[1]}$.`, a: A.num(P[2], P[3]), hints, steps: [P[4]] };
    }
    const b = U.int(1, 6);
    return { q: R`For $f(x) = x^2$ on $[0, ${b}]$, find the value $c$ where $f(c)$ equals the average value (MVT for integrals).`, a: A.num(b / Math.sqrt(3), R`\frac{${b}}{\sqrt{3}}`), hints: hints.concat(['Solve $f(c) = f_{\\text{avg}}$.']), steps: [R`$f_{\text{avg}} = \frac{1}{${b}}\cdot\frac{${b ** 3}}{3} = \frac{${b * b}}{3}$.`, R`$c^2 = \frac{${b * b}}{3} \Rightarrow c = \frac{${b}}{\sqrt3}$.`] };
  });

  def('work', { title: 'Work', unit: 'intapps', desc: 'Springs, ropes and pumping.' }, lv => {
    if (lv === 1) {
      const F0 = U.pick([4, 6, 8, 10, 12, 20]), s = U.pick([F(1, 2), F(1, 4), F(1), F(2), F(1, 3)]), d = U.pick([F(1), F(2), F(1, 2), F(3, 2)]);
      const k = F(F0).div(s); const W = k.mul(d.mul(d)).div(2);
      return { q: R`A force of $${F0}$ N stretches a spring $${s.tex()}$ m beyond its natural length. How much work (J) is needed to stretch it $${d.tex()}$ m beyond natural length?`, a: A.num(W), hints: ["Hooke's law: $F = kx$. Find $k$ first.", 'Work $= \\int_0^d kx\\,dx = \\frac{k d^2}{2}$.'], steps: [R`$k = \frac{${F0}}{${s.tex()}} = ${k.tex()}$ N/m.`, R`$W = \int_0^{${d.tex()}} ${k.tex()}x\,dx = ${W.tex()}$ J.`] };
    }
    if (lv === 2) {
      if (U.chance()) {
        const k = U.int(5, 40), d1 = U.int(1, 3), d2 = d1 + U.int(1, 3);
        const W = F(k * (d2 * d2 - d1 * d1), 2);
        return { q: R`A spring has constant $k = ${k}$ lb/ft. How much work (ft·lb) does it take to stretch it from $${d1}$ ft to $${d2}$ ft beyond natural length?`, a: A.num(W), hints: ['$W = \\int_{d_1}^{d_2} kx\\,dx$.'], steps: [R`$\int_{${d1}}^{${d2}} ${k}x\,dx = \frac{${k}}{2}(${d2 * d2} - ${d1 * d1}) = ${W.tex()}$.`], check: { integral: [k + '*x', d1, d2] } };
      }
      const terms = [[U.int(1, 4), 2], [U.int(0, 5), 1], [U.int(0, 6), 0]]; const c = U.int(1, 4);
      const W = poly.evalF(poly.int(terms), c);
      return { q: R`A variable force $F(x) = ${T.poly(terms)}$ newtons moves an object from $x = 0$ to $x = ${c}$ m. Find the work (J).`, a: A.num(W), hints: ['$W = \\int_a^b F(x)\\,dx$.'], steps: [R`$\int_0^{${c}}(${T.poly(terms)})dx = ${W.tex()}$.`], check: { integral: [S.poly(terms), 0, c] } };
    }
    const t = U.pick(['rope', 'halfrope', 'bucket', 'tank']);
    const L = U.pick([10, 20, 30, 40, 50]), w = U.pick([F(1, 2), F(1), F(2), F(3, 2)]);
    if (t === 'rope') { const W = w.mul(L * L).div(2); return { q: R`A ${L} ft rope weighing $${w.tex()}$ lb/ft hangs over the edge of a tall building. How much work is done pulling the entire rope to the top?`, a: A.num(W), hints: ['A slice at depth $y$ weighs $' + w.tex() + '\\,dy$ and is lifted $y$ ft.', '$W = \\int_0^{' + L + '} ' + w.tex() + 'y\\,dy$.'], steps: [R`$W = \int_0^{${L}} ${w.tex()}y\,dy = ${w.tex()}\cdot\frac{${L * L}}{2} = ${W.tex()}$ ft·lb.`] }; }
    if (t === 'halfrope') { const W = w.mul(3 * L * L).div(8); return { q: R`A ${L} ft rope weighing $${w.tex()}$ lb/ft hangs over the edge of a building. How much work is done pulling up only the **top half** of the rope?`, a: A.num(W), hints: ['Top-half slices (depth $y \\le ' + L / 2 + '$) move $y$ ft; bottom-half slices all move ' + L / 2 + ' ft.'], steps: [R`Top half: $\int_0^{${L / 2}} ${w.tex()}y\,dy$. Bottom half: weight $${w.mul(L / 2).tex()}$ lb lifted $${L / 2}$ ft.`, R`Total: $${W.tex()}$ ft·lb.`] }; }
    if (t === 'bucket') { const B = U.pick([5, 10, 15, 20]); const W = F(B * L).add(w.mul(L * L).div(2)); return { q: R`A ${B} lb bucket hangs from a ${L} ft cable weighing $${w.tex()}$ lb/ft. How much work is needed to lift the bucket all the way up?`, a: A.num(W), hints: ['Bucket: constant force $' + B + '$ over ' + L + ' ft. Cable: like the rope problem.'], steps: [R`Bucket: $${B}\cdot ${L} = ${B * L}$. Cable: $${w.mul(L * L).div(2).tex()}$.`, R`Total $= ${W.tex()}$ ft·lb.`] }; }
    const r = U.int(1, 4), h = U.int(2, 6);
    const coef = F(125 * r * r * h * h, 4);
    return { q: R`A cylindrical tank of radius ${r} ft and height ${h} ft is full of water (62.5 lb/ft³). Find the work (ft·lb) to pump all the water out over the top.`, a: A.num(coef.v * Math.PI, R`${coef.tex()}\pi`), hints: ['A slice at depth $y$ has volume $\\pi r^2\\,dy$, weight $62.5\\pi r^2\\,dy$, and moves $y$ ft.'], steps: [R`$W = \int_0^{${h}} 62.5\pi(${r * r})y\,dy = 62.5\pi\cdot ${r * r}\cdot\frac{${h * h}}{2}$.`, R`$= ${coef.tex()}\pi$ ft·lb.`] };
  });

  /* ================= DIFFERENTIAL EQUATIONS ================= */

  def('separable', { title: 'Separable Differential Equations', unit: 'diffeq', desc: 'Separate, integrate, apply the initial condition.' }, lv => {
    const hints = ['Separate: get all $y$\'s with $dy$ and all $x$\'s with $dx$, then integrate both sides.', 'Use the initial condition to find $C$, then solve for $y$.'];
    if (lv === 1) {
      const k = U.nz(-3, 3), y0 = U.nz(-5, 5);
      return { q: R`Solve $\dfrac{dy}{dx} = ${H.kx(k, 'y')}$ with $y(0) = ${y0}$. Enter $y$ as a function of $x$.`, a: A.expr(R`${y0}*exp(${k}*x)`, R`${y0}e^{${H.kx(k)}}`), hints, steps: [R`$\int\frac{dy}{y} = \int ${k}\,dx \Rightarrow \ln|y| = ${k}x + C$.`, R`$y = Ae^{${H.kx(k)}}$ and $y(0) = ${y0}$ gives $A = ${y0}$.`], check: { ode: [R`${k}*y`, 0, y0] } };
    }
    if (lv === 2) {
      const t = U.pick(['xy', 'xovery', 'lin']);
      if (t === 'xy') { const k = U.nz(-2, 2), y0 = U.int(1, 5); return { q: R`Solve $\dfrac{dy}{dx} = ${H.kx(k, 'xy')}$ with $y(0) = ${y0}$.`, a: A.expr(R`${y0}*exp(${k}*x^2/2)`, R`${y0}e^{${F(k, 2).tex()}x^2}`), hints, steps: [R`$\ln|y| = \frac{${k}}{2}x^2 + C$.`, R`$y = ${y0}e^{${F(k, 2).tex()}x^2}$.`], check: { ode: [R`${k}*x*y`, 0, y0] } }; }
      if (t === 'xovery') { const a = U.int(1, 5); return { q: R`Solve $\dfrac{dy}{dx} = \dfrac{x}{y}$ with $y(0) = ${a}$.`, a: A.expr(R`sqrt(x^2 + ${a * a})`, R`\sqrt{x^2 + ${a * a}}`), hints, steps: [R`$\int y\,dy = \int x\,dx \Rightarrow \frac{y^2}{2} = \frac{x^2}{2} + C$.`, R`$y^2 = x^2 + ${a * a}$, take the positive root (since $y(0) > 0$).`], check: { ode: ['x/y', 0, a] } }; }
      const y0 = U.int(1, 5); return { q: R`Solve $\dfrac{dy}{dx} = (x + 1)y$ with $y(0) = ${y0}$.`, a: A.expr(R`${y0}*exp(x^2/2 + x)`, R`${y0}e^{\frac{x^2}{2} + x}`), hints, steps: [R`$\ln|y| = \frac{x^2}{2} + x + C$.`, R`$y = ${y0}e^{x^2/2 + x}$.`], check: { ode: ['(x+1)*y', 0, y0] } };
    }
    const t = U.pick(['expxy', 'ysq', 'cube']);
    if (t === 'expxy') { const c = U.int(2, 6); return { q: R`Solve $\dfrac{dy}{dx} = e^{x - y}$ with $y(0) = \ln ${c}$.`, a: A.expr(R`ln(exp(x) + ${c - 1})`, R`\ln\left(e^{x} + ${c - 1}\right)`), hints: hints.concat(['$e^{x-y} = e^x e^{-y}$.']), steps: [R`$\int e^y dy = \int e^x dx \Rightarrow e^y = e^x + C$.`, R`At $x=0$: $${c} = 1 + C$, $C = ${c - 1}$; $y = \ln(e^x + ${c - 1})$.`], check: { ode: ['exp(x - y)', 0, Math.log(c)] } }; }
    if (t === 'ysq') { const k = U.int(1, 3); return { q: R`Solve $\dfrac{dy}{dx} = ${k === 1 ? '' : k}xy^2$ with $y(0) = 1$.`, a: A.expr(R`2/(2 - ${k}*x^2)`, R`\frac{2}{2 - ${H.kx(k, 'x^2')}}`, { dom: [-0.6, 0.6] }), hints, steps: [R`$\int y^{-2}dy = \int ${k}x\,dx \Rightarrow -\frac1y = \frac{${k}x^2}{2} + C$.`, R`$C = -1$, so $y = \frac{1}{1 - ${F(k, 2).tex()}x^2} = \frac{2}{2 - ${k}x^2}$.`], check: { ode: [R`${k}*x*y^2`, 0, 1] } }; }
    const a = U.int(1, 3); return { q: R`Solve $\dfrac{dy}{dx} = \dfrac{x^2}{y^2}$ with $y(0) = ${a}$.`, a: A.expr(R`cbrt(x^3 + ${a ** 3})`, R`\sqrt[3]{x^3 + ${a ** 3}}`, { dom: [-0.8, 2] }), hints, steps: [R`$\int y^2dy = \int x^2dx \Rightarrow y^3 = x^3 + C$.`, R`$C = ${a ** 3}$; $y = \sqrt[3]{x^3 + ${a ** 3}}$.`], check: { ode: ['x^2/y^2', 0, a] } };
  });

  def('euler', { title: "Euler's Method", unit: 'diffeq', desc: 'Step along the slope field.' }, lv => {
    const fs = U.pick([['x + y', (x, y) => x.add(y)], ['x - y', (x, y) => x.sub(y)], ['2x', (x) => x.mul(2)], ['xy', (x, y) => x.mul(y)], ['y - x^2', (x, y) => y.sub(x.mul(x))], ['x + 2y', (x, y) => x.add(y.mul(2))]]);
    const n = lv === 1 ? U.pick([1, 2]) : lv === 2 ? 2 : 3;
    const h = lv === 1 ? U.pick([F(1), F(1, 2)]) : U.pick([F(1, 2), F(1, 10), F(1, 4)]);
    let x = F(U.int(-1, 1)), y = F(U.int(-2, 3));
    const x0 = x, y0 = y; const rows = [];
    for (let i = 0; i < n; i++) { const m = fs[1](x, y); const yn = y.add(h.mul(m)); rows.push(R`$y_{${i + 1}} = ${y.tex()} + ${h.tex()}\cdot(${m.tex()}) = ${yn.tex()}$`); y = yn; x = x.add(h); }
    return {
      q: R`Use Euler's method with step size $h = ${h.tex()}$ to approximate $y(${x.tex()})$ for $\dfrac{dy}{dx} = ${fs[0]}$, $y(${x0.tex()}) = ${y0.tex()}$.`, a: A.num(y),
      hints: ["Euler: $y_{n+1} = y_n + h\\cdot f(x_n, y_n)$, and $x_{n+1} = x_n + h$.", 'Take ' + n + ' step' + (n > 1 ? 's' : '') + '.'],
      steps: rows.concat([R`So $y(${x.tex()}) \approx ${y.tex()}$.`])
    };
  });

  def('growth-decay', { title: 'Exponential Growth & Decay', unit: 'diffeq', desc: 'y\' = ky models: doubling, half-life, cooling.' }, lv => {
    if (lv === 1) {
      const P0 = U.pick([50, 100, 200, 500, 1000]), T0 = U.int(2, 8), k = U.int(1, 5);
      return { q: R`A bacteria population starts at ${P0} and doubles every ${T0} hours. How many bacteria are there after ${T0 * k} hours?`, a: A.num(P0 * 2 ** k), hints: ['$P(t) = P_0\\cdot 2^{t/T}$ where $T$ is the doubling time.'], steps: [R`$P(${T0 * k}) = ${P0}\cdot 2^{${T0 * k}/${T0}} = ${P0}\cdot 2^{${k}} = ${P0 * 2 ** k}$.`] };
    }
    if (lv === 2) {
      if (U.chance()) {
        const hl = U.int(2, 30), m0 = U.pick([16, 32, 64, 80, 100, 160]), k = U.int(1, 4);
        return { q: R`A substance has a half-life of ${hl} years. Starting with ${m0} g, how much remains after ${hl * k} years?`, a: A.num(F(m0, 2 ** k)), hints: ['$m(t) = m_0\\left(\\frac12\\right)^{t/h}$.'], steps: [R`$${m0}\cdot(1/2)^{${k}} = ${F(m0, 2 ** k).tex()}$ g.`] };
      }
      const T0 = U.int(2, 10), m = U.pick([3, 5, 6, 10]);
      return { q: R`A population doubles every ${T0} years. How long (years) until it is ${m} times its original size? (Exact answer, e.g. <kbd>${T0}*ln(${m})/ln(2)</kbd>.)`, a: A.num(T0 * Math.log(m) / Math.LN2, R`\frac{${T0}\ln ${m}}{\ln 2}`), hints: ['Solve $2^{t/' + T0 + '} = ' + m + '$ by taking $\\ln$.'], steps: [R`$\frac{t}{${T0}}\ln 2 = \ln ${m}$.`, R`$t = \frac{${T0}\ln ${m}}{\ln 2} \approx ${U.fmt(T0 * Math.log(m) / Math.LN2, 3)}$.`] };
    }
    const Ts = U.pick([20, 25, 70]), T0 = Ts + U.pick([60, 80, 100, 120]), t1 = U.int(5, 15), Tt1 = Ts + (T0 - Ts) / 2 + U.pick([0, 10, -10, 20]);
    const r = F(Tt1 - Ts, T0 - Ts);
    const ans = F(Ts).add(r.mul(r).mul(T0 - Ts));
    return { q: R`Newton's law of cooling: coffee at ${T0}°F sits in a ${Ts}°F room. After ${t1} min it is ${Tt1}°F. What is its temperature after ${2 * t1} min?`, a: A.num(ans), hints: ['$T(t) = T_s + (T_0 - T_s)e^{-kt}$.', 'You don\'t need $k$: after $2t_1$ minutes the factor $e^{-kt}$ is squared.'], steps: [R`$e^{-${t1}k} = \frac{${Tt1} - ${Ts}}{${T0} - ${Ts}} = ${r.tex()}$.`, R`$T(${2 * t1}) = ${Ts} + ${T0 - Ts}\cdot\left(${r.tex()}\right)^2 = ${ans.tex()}$°F.`] };
  });
})();
