/* Generators: parametric & polar calculus, bridge to Calc 3 (vectors, 3D, partials). */
(function () {
  'use strict';
  const { U, T, S, F, Frac, gen } = CL;
  const { def, A, H } = gen;
  const R = String.raw;

  /** Try to express a float as (p/q)·√m for m in 1,2,3,5,6 with small q */
  function surdTex(v) {
    if (Math.abs(v) < 1e-12) return '0';
    for (const m of [1, 2, 3, 5, 6]) {
      for (const q of [1, 2, 3, 4, 6]) {
        const c = v / Math.sqrt(m) * q;
        if (Math.abs(c - Math.round(c)) < 1e-9) return T.surd(F(Math.round(c), q), m);
      }
    }
    return U.fmt(v, 4);
  }
  gen.surdTex = surdTex;
  const SPECIAL = [F(1, 6), F(1, 4), F(1, 3), F(1, 2), F(2, 3), F(3, 4), F(5, 6), F(7, 6), F(5, 4), F(4, 3), F(5, 3), F(7, 4), F(11, 6)];

  /* ================= PARAMETRIC ================= */

  def('param-deriv', { title: 'Parametric Derivatives', unit: 'polar', desc: 'dy/dx = (dy/dt)/(dx/dt).' }, lv => {
    const hints = ['$\\dfrac{dy}{dx} = \\dfrac{dy/dt}{dx/dt}$.'];
    if (lv === 1) {
      const a = U.nz(-3, 3), b = U.int(-4, 4), c = U.nz(-2, 2), d = U.int(-4, 4), t0 = U.nz(-3, 3);
      const m = F(3 * c * t0 * t0 + d, 2 * a * t0);
      return { q: R`For $x = ${T.poly([[a, 2], [b, 0]], 't')}$, $y = ${T.poly([[c, 3], [d, 1]], 't')}$, find $\dfrac{dy}{dx}$ at $t = ${t0}$.`, a: A.num(m), hints, steps: [R`$\frac{dx}{dt} = ${2 * a}t$, $\frac{dy}{dt} = ${T.poly([[3 * c, 2], [d, 0]], 't')}$.`, R`At $t = ${t0}$: $\dfrac{${3 * c * t0 * t0 + d}}{${2 * a * t0}} = ${m.tex()}$.`] };
    }
    if (lv === 2) {
      const t = U.pick(['circle', 'horiz', 'exp']);
      if (t === 'circle') {
        const r = U.int(1, 5), th = U.pick(SPECIAL.filter(f => !f.eq(F(1, 2)) && f.d !== 1));
        const v = -1 / Math.tan(th.v * Math.PI);
        return { q: R`For $x = ${r === 1 ? '' : r}\cos t$, $y = ${r === 1 ? '' : r}\sin t$, find $\dfrac{dy}{dx}$ at $t = ${T.pi(th)}$.`, a: A.num(v, surdTex(v)), hints, steps: [R`$\frac{dy}{dx} = \frac{${r}\cos t}{-${r}\sin t} = -\cot t$.`, R`$-\cot\left(${T.pi(th)}\right) = ${surdTex(v)}$.`] };
      }
      if (t === 'horiz') { const k = U.int(1, 4); return { q: R`At which values of $t$ does the curve $x = t^2 + 1$, $y = t^3 - ${3 * k * k}t$ have a **horizontal** tangent line?`, a: A.set([k, -k]), hints: ['Horizontal tangent: $\\frac{dy}{dt} = 0$ while $\\frac{dx}{dt} \\ne 0$.'], steps: [R`$\frac{dy}{dt} = 3t^2 - ${3 * k * k} = 0 \Rightarrow t = \pm ${k}$.`, R`$\frac{dx}{dt} = 2t \ne 0$ there. So $t = \pm${k}$.`] }; }
      const t0 = U.int(-3, 3);
      return { q: R`For $x = e^{t}$, $y = te^{t}$, find $\dfrac{dy}{dx}$ at $t = ${t0}$.`, a: A.num(1 + t0), hints, steps: [R`$\frac{dy}{dt} = e^t + te^t$, $\frac{dx}{dt} = e^t$, so $\frac{dy}{dx} = 1 + t$.`, R`At $t = ${t0}$: $${1 + t0}$.`] };
    }
    const a = U.int(-3, 3), b = U.int(-4, 4), t0 = U.nz(-3, 3);
    const d2 = F(3, 2).sub(F(b, 2 * t0 * t0)).div(2 * t0);
    return { q: R`For $x = t^2 ${T.signed(a)}$, $y = t^3 ${b ? T.signed(b) + 't' : ''}$, find $\dfrac{d^2y}{dx^2}$ at $t = ${t0}$.`, a: A.num(d2), hints: hints.concat(['$\\dfrac{d^2y}{dx^2} = \\dfrac{\\frac{d}{dt}\\left(\\frac{dy}{dx}\\right)}{dx/dt}$ — divide by $dx/dt$ again!']), steps: [R`$\frac{dy}{dx} = \frac{3t^2 ${T.signed(b)}}{2t} = \frac{3t}{2} + \frac{${b}}{2t}$.`, R`$\frac{d}{dt}\left(\frac{dy}{dx}\right) = \frac{3}{2} - \frac{${b}}{2t^2}$; divide by $\frac{dx}{dt} = 2t$.`, R`At $t = ${t0}$: $${d2.tex()}$.`] };
  });

  def('param-arclength', { title: 'Parametric Arc Length', unit: 'polar', desc: 'L = ∫√((dx/dt)² + (dy/dt)²) dt.' }, lv => {
    const hints = ['$L = \\displaystyle\\int_a^b\\sqrt{\\left(\\frac{dx}{dt}\\right)^2 + \\left(\\frac{dy}{dt}\\right)^2}\\,dt$.'];
    if (lv === 1) {
      if (U.chance()) { const r = U.int(1, 6), th = U.pick([F(1, 2), F(1), F(3, 2), F(2), F(1, 3), F(2, 3)]); return { q: R`Find the length of $x = ${r === 1 ? '' : r}\cos t$, $y = ${r === 1 ? '' : r}\sin t$ for $0 \le t \le ${T.pi(th)}$.`, a: A.num(r * th.v * Math.PI, T.pi(th.mul(r))), hints, steps: [R`Speed $= \sqrt{${r * r}\sin^2 t + ${r * r}\cos^2 t} = ${r}$.`, R`$L = ${r}\cdot ${T.pi(th)} = ${T.pi(th.mul(r))}$.`], check: { integral: [String(r), 0, th.v * Math.PI] } }; }
      const [p, q, h] = U.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]]); const t1 = U.int(1, 4);
      return { q: R`Find the length of $x = ${p}t + 1$, $y = ${q}t - 2$ for $0 \le t \le ${t1}$.`, a: A.num(h * t1), hints, steps: [R`Speed $= \sqrt{${p * p} + ${q * q}} = ${h}$.`, R`$L = ${h}\cdot ${t1} = ${h * t1}$.`] };
    }
    if (lv === 2) {
      const [b2, s] = U.pick([[3, 2], [8, 3], [15, 4]]);
      const L = 2 * (s ** 3 - 1);
      return { q: R`Find the length of $x = 3t^2$, $y = 2t^3$ for $0 \le t \le \sqrt{${b2}}$.`, a: A.num(L), hints, steps: [R`$\frac{dx}{dt} = 6t$, $\frac{dy}{dt} = 6t^2$; speed $= 6t\sqrt{1 + t^2}$.`, R`$\int_0^{\sqrt{${b2}}} 6t\sqrt{1+t^2}\,dt = 2(1 + t^2)^{3/2}\Big|_0^{\sqrt{${b2}}} = 2(${s ** 3} - 1) = ${L}$.`], check: { integral: ['6*x*sqrt(1 + x^2)', 0, Math.sqrt(b2)] } };
    }
    if (U.chance()) { const r = U.int(1, 5); return { q: R`Find the length of one arch of the cycloid $x = ${r === 1 ? '' : r}(t - \sin t)$, $y = ${r === 1 ? '' : r}(1 - \cos t)$, $0 \le t \le 2\pi$.`, a: A.num(8 * r), hints: hints.concat(['Use $1 - \\cos t = 2\\sin^2(t/2)$.']), steps: [R`Speed $= ${r}\sqrt{(1 - \cos t)^2 + \sin^2 t} = ${r}\sqrt{2 - 2\cos t} = ${2 * r}\sin(t/2)$.`, R`$\int_0^{2\pi} ${2 * r}\sin(t/2)dt = ${8 * r}$.`], check: { integral: [R`${r}*sqrt(2 - 2*cos(x))`, 0, 2 * Math.PI] } }; }
    const b = U.int(1, 3);
    return { q: R`Find the length of $x = e^{t}\cos t$, $y = e^{t}\sin t$ for $0 \le t \le ${b}$.`, a: A.num(Math.SQRT2 * (Math.exp(b) - 1), R`\sqrt{2}\left(e^{${b}} - 1\right)`), hints, steps: [R`$\left(\frac{dx}{dt}\right)^2 + \left(\frac{dy}{dt}\right)^2 = 2e^{2t}$.`, R`$\int_0^{${b}}\sqrt2 e^t dt = \sqrt2(e^{${b}} - 1)$.`], check: { integral: ['sqrt(2)*exp(x)', 0, b] } };
  });

  /* ================= POLAR ================= */

  def('polar-convert', { title: 'Polar ↔ Rectangular', unit: 'polar', desc: 'x = r cos θ, y = r sin θ, r² = x² + y².' }, lv => {
    if (lv === 1) {
      const r = U.nz(-5, 6), th = U.pick(SPECIAL.concat([F(0), F(1)])), ask = U.pick(['x', 'y']);
      const v = r * (ask === 'x' ? Math.cos(th.v * Math.PI) : Math.sin(th.v * Math.PI));
      return { q: R`Convert the polar point $\left(r, \theta\right) = \left(${r}, ${T.pi(th)}\right)$ to rectangular coordinates. What is $${ask}$?`, a: A.num(v, surdTex(v)), hints: ['$x = r\\cos\\theta$, $y = r\\sin\\theta$.'], steps: [R`$${ask} = ${r}${ask === 'x' ? '\\cos' : '\\sin'}\left(${T.pi(th)}\right) = ${surdTex(v)}$.`] };
    }
    if (lv === 2) {
      const [x, y] = U.pick([[1, 1], [-1, 1], [-2, -2], [3, -3], [0, 4], [-5, 0], [2, 2], [0, -3], [4, 0], [-3, 3]]).map(v => v * U.int(1, 2));
      if (U.chance() && (Math.abs(x) === Math.abs(y) || x === 0 || y === 0)) {
        let th = Math.atan2(y, x); if (th < 0) th += 2 * Math.PI;
        return { q: R`Convert $(x, y) = (${x}, ${y})$ to polar. Find $\theta$ in $[0, 2\pi)$ (with $r > 0$).`, a: A.num(th, T.pi(H.piFrac(th))), hints: ['$\\tan\\theta = \\frac{y}{x}$ — but check the quadrant!'], steps: [R`The point is in ${x === 0 || y === 0 ? 'an axis direction' : 'quadrant ' + (x > 0 ? (y > 0 ? 'I' : 'IV') : (y > 0 ? 'II' : 'III'))}.`, R`$\theta = ${T.pi(H.piFrac(th))}$.`] };
      }
      const r2 = x * x + y * y;
      return { q: R`Convert $(x, y) = (${x}, ${y})$ to polar. Find $r$ (with $r \ge 0$).`, a: A.num(Math.sqrt(r2), H.sqrtTex(r2)), hints: ['$r = \\sqrt{x^2 + y^2}$.'], steps: [R`$r = \sqrt{${x * x} + ${y * y}} = ${H.sqrtTex(r2)}$.`] };
    }
    const a = U.int(1, 5);
    const pairs = [
      [R`r = ${2 * a}\cos\theta`, R`(x - ${a})^2 + y^2 = ${a * a}`],
      [R`r = ${2 * a}\sin\theta`, R`x^2 + (y - ${a})^2 = ${a * a}`],
      [R`r = ${a}`, R`x^2 + y^2 = ${a * a}`],
      [R`r\sin\theta = ${a}`, R`y = ${a}`],
      [R`r = ${a}\sec\theta`, R`x = ${a}`],
      [R`\theta = \frac{\pi}{4}`, R`y = x`],
      [R`r^2 = ${a}\csc\theta\sec\theta`, R`xy = ${a}`]
    ];
    const i = U.int(0, pairs.length - 1);
    return { q: R`Which rectangular equation is equivalent to $${pairs[i][0]}$?`, a: A.mc('$' + pairs[i][1] + '$', pairs.filter((p, j) => j !== i).map(p => '$' + p[1] + '$')), hints: ['Multiply through by $r$ if helpful, then use $x = r\\cos\\theta$, $y = r\\sin\\theta$, $r^2 = x^2 + y^2$.'], steps: [R`$${pairs[i][0]} \iff ${pairs[i][1]}$.`] };
  });

  def('polar-area', { title: 'Polar Area', unit: 'polar', desc: 'A = ½∫r² dθ.' }, lv => {
    const hints = ['$A = \\dfrac12\\displaystyle\\int_\\alpha^\\beta r^2\\,d\\theta$.', 'Make sure your $\\theta$-interval traces the region **exactly once**.'];
    const a = U.int(1, 5);
    if (lv === 1) {
      const t = U.pick(['cos', 'sin', 'circ']);
      const P = { cos: [R`r = ${2 * a}\cos\theta`, a * a, [0, Math.PI], R`${2 * a}*cos(x)`], sin: [R`r = ${2 * a}\sin\theta`, a * a, [0, Math.PI], R`${2 * a}*sin(x)`], circ: [R`r = ${a}`, a * a, [0, 2 * Math.PI], String(a)] }[t];
      return { q: R`Find the area enclosed by $${P[0]}$.`, a: A.num(Math.PI * P[1], T.pi(F(P[1]))), hints, steps: [R`$\frac12\int_{${T.pi(H.piFrac(P[2][0]))}}^{${T.pi(H.piFrac(P[2][1]))}} r^2\,d\theta = ${T.pi(F(P[1]))}$ (a circle of radius ${t === 'circ' ? a : a}).`], check: { integral: [R`0.5*(${P[3]})^2`, P[2][0], P[2][1]] }, graph: { polars: [{ r: P[3].replace(/x/g, 'theta'), t: P[2] }], x: [-2.5 * a, 2.5 * a], y: [-2.5 * a, 2.5 * a], equal: true } };
    }
    if (lv === 2) {
      const t = U.pick(['cardioid', 'rose', 'petal']);
      const k = U.int(2, 4);
      if (t === 'cardioid') return { q: R`Find the area enclosed by the cardioid $r = ${a === 1 ? '' : a}(1 + \cos\theta)$.`, a: A.num(1.5 * Math.PI * a * a, T.pi(F(3 * a * a, 2))), hints, steps: [R`$\frac12\int_0^{2\pi}${a * a}(1 + \cos\theta)^2 d\theta = \frac{${a * a}}{2}\left(2\pi + 0 + \pi\right)$.`, R`$= ${T.pi(F(3 * a * a, 2))}$.`], check: { integral: [R`0.5*${a * a}*(1 + cos(x))^2`, 0, 2 * Math.PI] }, graph: { polars: [{ r: R`${a}*(1+cos(theta))` }], x: [-1.5 * a, 2.5 * a], y: [-2 * a, 2 * a], equal: true } };
      if (t === 'rose') { const tot = k % 2 ? F(a * a, 4) : F(a * a, 2); return { q: R`Find the **total** area enclosed by the rose $r = ${a === 1 ? '' : a}\cos(${k}\theta)$.`, a: A.num(tot.v * Math.PI, T.pi(tot)), hints: hints.concat([R`$r = a\cos(k\theta)$ has $k$ petals if $k$ is odd, $2k$ petals if $k$ is even.`]), steps: [R`${k % 2 ? k : 2 * k} petals, each of area $\frac{\pi a^2}{4k} = ${T.pi(F(a * a, 4 * k))}$.`, R`Total: $${T.pi(tot)}$.`], graph: { polars: [{ r: R`${a}*cos(${k}*theta)` }], x: [-1.5 * a, 1.5 * a], y: [-1.5 * a, 1.5 * a], equal: true } }; }
      return { q: R`Find the area of **one petal** of $r = ${a === 1 ? '' : a}\sin(${k}\theta)$.`, a: A.num(Math.PI * a * a / (4 * k), T.pi(F(a * a, 4 * k))), hints: hints.concat([R`One petal: $0 \le \theta \le \frac{\pi}{${k}}$.`]), steps: [R`$\frac12\int_0^{\pi/${k}} ${a * a}\sin^2(${k}\theta)\,d\theta = \frac{${a * a}}{2}\cdot\frac{\pi}{${2 * k}}$.`, R`$= ${T.pi(F(a * a, 4 * k))}$.`], check: { integral: [R`0.5*${a * a}*sin(${k}*x)^2`, 0, Math.PI / k] } };
    }
    const t = U.pick(['between', 'spiral', 'lemn']);
    if (t === 'between') { const v = 2 * a * a + Math.PI * a * a / 4; return { q: R`Find the area inside $r = ${a === 1 ? '' : a}(1 + \cos\theta)$ but outside $r = ${a}$.`, a: A.num(v, R`${2 * a * a} + ${T.pi(F(a * a, 4))}`), hints: hints.concat(['Curves meet where $\\cos\\theta = 0$: $\\theta = \\pm\\frac{\\pi}{2}$.', '$A = \\frac12\\int (r_{\\text{out}}^2 - r_{\\text{in}}^2)\\,d\\theta$.']), steps: [R`$\frac12\int_{-\pi/2}^{\pi/2}\left[${a * a}(1 + \cos\theta)^2 - ${a * a}\right]d\theta = \frac{${a * a}}{2}\int(2\cos\theta + \cos^2\theta)\,d\theta$.`, R`$= \frac{${a * a}}{2}\left(4 + \frac{\pi}{2}\right) = ${2 * a * a} + ${T.pi(F(a * a, 4))}$.`], check: { integral: [R`0.5*(${a * a}*(1+cos(x))^2 - ${a * a})`, -Math.PI / 2, Math.PI / 2] } }; }
    if (t === 'spiral') return { q: R`Find the area swept out by the spiral $r = \theta$ for $0 \le \theta \le 2\pi$.`, a: A.num(4 * Math.PI ** 3 / 3, R`\frac{4\pi^3}{3}`), hints, steps: [R`$\frac12\int_0^{2\pi}\theta^2 d\theta = \frac{(2\pi)^3}{6} = \frac{4\pi^3}{3}$.`], check: { integral: ['0.5*x^2', 0, 2 * Math.PI] } };
    return { q: R`Find the total area enclosed by the lemniscate $r^2 = ${a * a}\cos(2\theta)$.`, a: A.num(a * a), hints: hints.concat(['One loop: $-\\frac{\\pi}{4} \\le \\theta \\le \\frac{\\pi}{4}$; there are two loops.']), steps: [R`One loop: $\frac12\int_{-\pi/4}^{\pi/4}${a * a}\cos 2\theta\,d\theta = \frac{${a * a}}{2}$.`, R`Two loops: $${a * a}$.`], check: { integral: [R`${a * a}*cos(2*x)`, -Math.PI / 4, Math.PI / 4] } };
  });

  def('polar-slope', { title: 'Polar Tangent Slopes', unit: 'polar', desc: 'dy/dx for r = f(θ).' }, lv => {
    const a = U.int(1, 4), b = U.int(1, 4);
    const pool = lv === 1 ? ['circ'] : lv === 2 ? ['card', 'lin'] : ['card', 'rose', 'lin'];
    const t = U.pick(pool);
    const th = U.pick([F(1, 6), F(1, 4), F(1, 3), F(2, 3), F(3, 4), F(5, 6)]);
    const P = {
      circ: [R`r = ${2 * a}\sin\theta`, x => 2 * a * Math.sin(x), x => 2 * a * Math.cos(x)],
      card: [R`r = ${a === 1 ? '' : a}(1 + \cos\theta)`, x => a * (1 + Math.cos(x)), x => -a * Math.sin(x)],
      lin: [R`r = ${a} + ${b === 1 ? '' : b}\sin\theta`, x => a + b * Math.sin(x), x => b * Math.cos(x)],
      rose: [R`r = \cos(2\theta)`, x => Math.cos(2 * x), x => -2 * Math.sin(2 * x)]
    }[t];
    const x = th.v * Math.PI, r = P[1](x), rp = P[2](x);
    const den = rp * Math.cos(x) - r * Math.sin(x);
    if (Math.abs(den) < 1e-9) return null;
    const m = (rp * Math.sin(x) + r * Math.cos(x)) / den;
    if (!isFinite(m) || Math.abs(m) > 1e6) return null;
    return {
      q: R`Find the slope $\dfrac{dy}{dx}$ of the tangent line to $${P[0]}$ at $\theta = ${T.pi(th)}$. (Exact or 4 decimals.)`, a: A.num(m, surdTex(m)),
      hints: ['Treat it as parametric: $x = r\\cos\\theta$, $y = r\\sin\\theta$.', '$\\dfrac{dy}{dx} = \\dfrac{r\'\\sin\\theta + r\\cos\\theta}{r\'\\cos\\theta - r\\sin\\theta}$.'],
      steps: [R`At $\theta = ${T.pi(th)}$: $r = ${surdTex(r)}$, $r' = ${surdTex(rp)}$.`, R`$\dfrac{dy}{dx} = ${surdTex(m)}$.`]
    };
  });

  /* ================= BRIDGE TO CALC 3 ================= */

  const NICE3 = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9], [2, 10, 11, 15], [6, 6, 7, 11], [3, 4, 12, 13]];
  const vtex = v => R`\langle ${v.join(', ')}\rangle`;
  const signs = v => v.map(x => x * U.sign());

  def('vector-ops', { title: 'Vector Basics', unit: 'bridge', desc: 'Magnitude, addition, scalar multiples, unit vectors.' }, lv => {
    if (lv === 1) {
      if (U.chance()) { const [a, b, c] = U.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [7, 24, 25]]); const v = signs([a, b]); return { q: R`Find the magnitude $\|\mathbf{v}\|$ of $\mathbf{v} = ${vtex(v)}$.`, a: A.num(c), hints: ['$\\|\\langle a, b\\rangle\\| = \\sqrt{a^2 + b^2}$.'], steps: [R`$\sqrt{${a * a} + ${b * b}} = ${c}$.`] }; }
      const u = [U.int(-6, 6), U.int(-6, 6)], w = [U.int(-6, 6), U.int(-6, 6)], k = U.nz(-3, 3), m = U.nz(-3, 3);
      const res = [k * u[0] + m * w[0], k * u[1] + m * w[1]];
      return { q: R`Let $\mathbf{u} = ${vtex(u)}$ and $\mathbf{w} = ${vtex(w)}$. Compute $${k}\mathbf{u} ${m < 0 ? '-' : '+'} ${Math.abs(m) === 1 ? '' : Math.abs(m)}\mathbf{w}$. Enter as <kbd>a, b</kbd>.`, a: A.tuple(res), hints: ['Scale each component, then add componentwise.'], steps: [R`$${k}\mathbf{u} = ${vtex(u.map(x => k * x))}$, $${m}\mathbf{w} = ${vtex(w.map(x => m * x))}$.`, R`Sum: $${vtex(res)}$.`] };
    }
    const [p, q, r, n] = U.pick(NICE3); const v = U.shuffle(signs([p, q, r]));
    if (lv === 2) return { q: R`Find $\|\mathbf{v}\|$ for $\mathbf{v} = ${vtex(v)}$.`, a: A.num(n), hints: ['$\\|\\langle a,b,c\\rangle\\| = \\sqrt{a^2+b^2+c^2}$.'], steps: [R`$\sqrt{${v.map(x => x * x).join(' + ')}} = \sqrt{${n * n}} = ${n}$.`] };
    return { q: R`Find the unit vector in the direction of $\mathbf{v} = ${vtex(v)}$. Enter as <kbd>a, b, c</kbd>.`, a: A.tuple(v.map(x => x / n), R`\left\langle ${v.map(x => F(x, n).tex()).join(', ')}\right\rangle`), hints: ['$\\hat{\\mathbf v} = \\dfrac{\\mathbf v}{\\|\\mathbf v\\|}$.'], steps: [R`$\|\mathbf v\| = ${n}$.`, R`$\hat{\mathbf v} = \left\langle ${v.map(x => F(x, n).tex()).join(', ')}\right\rangle$.`] };
  });

  def('dot-product', { title: 'Dot Product & Angles', unit: 'bridge', desc: 'u·v, angles, orthogonality, projections.' }, lv => {
    const dim = lv === 1 ? 2 : 3;
    const u = U.range(1, dim).map(() => U.int(-5, 5)), v = U.range(1, dim).map(() => U.int(-5, 5));
    const dot = u.reduce((s, x, i) => s + x * v[i], 0);
    if (lv === 1) return { q: R`Compute $\mathbf{u}\cdot\mathbf{v}$ for $\mathbf{u} = ${vtex(u)}$, $\mathbf{v} = ${vtex(v)}$.`, a: A.num(dot), hints: ['Multiply matching components and add.'], steps: [R`$${u.map((x, i) => '(' + x + ')(' + v[i] + ')').join(' + ')} = ${dot}$.`] };
    if (lv === 2) {
      if (U.chance()) {
        const a = [U.int(-4, 4), U.int(-4, 4), U.nz(-4, 4)]; const b0 = U.int(-4, 4), b1 = U.int(-4, 4);
        const rem = -(a[0] * b0 + a[1] * b1);
        const ortho = rem % a[2] === 0 && U.chance(0.6);
        const b = [b0, b1, ortho ? rem / a[2] : U.int(-4, 4)];
        const d = a.reduce((s, x, i) => s + x * b[i], 0);
        return { q: R`Are $\mathbf{u} = ${vtex(a)}$ and $\mathbf{v} = ${vtex(b)}$ orthogonal?`, a: A.mcFixed(['Yes — their dot product is 0', 'No — their dot product is not 0'], d === 0 ? 0 : 1), hints: ['Orthogonal ⟺ $\\mathbf u\\cdot\\mathbf v = 0$.'], steps: [R`$\mathbf u\cdot\mathbf v = ${d}$.`, d === 0 ? 'Zero → **orthogonal**.' : 'Nonzero → **not** orthogonal.'] };
      }
      const [p, q, r, n] = U.pick(NICE3); const b = U.shuffle(signs([p, q, r]));
      const d = u.reduce((s, x, i) => s + x * b[i], 0);
      return { q: R`Find the scalar projection $\text{comp}_{\mathbf v}\mathbf u$ of $\mathbf u = ${vtex(u)}$ onto $\mathbf v = ${vtex(b)}$.`, a: A.num(F(d, n)), hints: ['$\\text{comp}_{\\mathbf v}\\mathbf u = \\dfrac{\\mathbf u\\cdot\\mathbf v}{\\|\\mathbf v\\|}$.'], steps: [R`$\mathbf u\cdot\mathbf v = ${d}$, $\|\mathbf v\| = ${n}$.`, R`$\text{comp} = ${F(d, n).tex()}$.`] };
    }
    const nu = Math.hypot(...u), nv = Math.hypot(...v);
    if (!nu || !nv) return null;
    const ang = Math.acos(dot / (nu * nv)) * 180 / Math.PI;
    return { q: R`Find the angle between $\mathbf u = ${vtex(u)}$ and $\mathbf v = ${vtex(v)}$ in **degrees**, to at least one decimal place.`, a: A.num(ang, U.fmt(ang, 2) + '^\\circ', { tol: 0.06 / Math.max(1, ang) }), hints: ['$\\cos\\theta = \\dfrac{\\mathbf u\\cdot\\mathbf v}{\\|\\mathbf u\\|\\|\\mathbf v\\|}$.'], steps: [R`$\mathbf u\cdot\mathbf v = ${dot}$, $\|\mathbf u\| = ${H.sqrtTex(u.reduce((s, x) => s + x * x, 0))}$, $\|\mathbf v\| = ${H.sqrtTex(v.reduce((s, x) => s + x * x, 0))}$.`, R`$\theta = \arccos\left(\frac{${dot}}{${U.fmt(nu * nv, 4)}}\right) \approx ${U.fmt(ang, 2)}^\circ$.`] };
  });

  def('cross-product', { title: 'Cross Product', unit: 'bridge', desc: 'u×v, areas, volumes.' }, lv => {
    const u = [U.int(-4, 4), U.int(-4, 4), U.int(-4, 4)], v = [U.int(-4, 4), U.int(-4, 4), U.int(-4, 4)];
    const c = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const hint = ['$\\mathbf u\\times\\mathbf v = \\langle u_2v_3 - u_3v_2,\\ u_3v_1 - u_1v_3,\\ u_1v_2 - u_2v_1\\rangle$ (determinant with $\\mathbf i, \\mathbf j, \\mathbf k$).'];
    if (lv === 1) return { q: R`Compute $\mathbf u\times\mathbf v$ for $\mathbf u = ${vtex(u)}$, $\mathbf v = ${vtex(v)}$. Enter as <kbd>a, b, c</kbd>.`, a: A.tuple(c), hints: hint, steps: [R`$\mathbf i$: $(${u[1]})(${v[2]}) - (${u[2]})(${v[1]}) = ${c[0]}$; $\mathbf j$: $(${u[2]})(${v[0]}) - (${u[0]})(${v[2]}) = ${c[1]}$; $\mathbf k$: $(${u[0]})(${v[1]}) - (${u[1]})(${v[0]}) = ${c[2]}$.`, R`$${vtex(c)}$.`] };
    const n2 = c.reduce((s, x) => s + x * x, 0);
    if (!n2) return null;
    if (lv === 2) return { q: R`Find the area of the parallelogram spanned by $\mathbf u = ${vtex(u)}$ and $\mathbf v = ${vtex(v)}$.`, a: A.num(Math.sqrt(n2), H.sqrtTex(n2)), hints: hint.concat(['Area $= \\|\\mathbf u\\times\\mathbf v\\|$.']), steps: [R`$\mathbf u\times\mathbf v = ${vtex(c)}$.`, R`Area $= \sqrt{${n2}} = ${H.sqrtTex(n2)}$.`] };
    const w = [U.int(-3, 3), U.int(-3, 3), U.int(-3, 3)];
    const trip = Math.abs(w[0] * c[0] + w[1] * c[1] + w[2] * c[2]);
    return { q: R`Find the volume of the parallelepiped spanned by $\mathbf u = ${vtex(u)}$, $\mathbf v = ${vtex(v)}$, $\mathbf w = ${vtex(w)}$.`, a: A.num(trip), hints: hint.concat(['Volume $= |\\mathbf w\\cdot(\\mathbf u\\times\\mathbf v)|$ (scalar triple product).']), steps: [R`$\mathbf u\times\mathbf v = ${vtex(c)}$.`, R`$|\mathbf w\cdot(\mathbf u\times\mathbf v)| = ${trip}$.`] };
  });

  def('distance-3d', { title: '3D Coordinates & Spheres', unit: 'bridge', desc: 'Distance in space, equations of spheres.' }, lv => {
    if (lv === 1) {
      const [p, q, r, n] = U.pick(NICE3); const d = U.shuffle(signs([p, q, r]));
      const P = [U.int(-5, 5), U.int(-5, 5), U.int(-5, 5)], Q = P.map((x, i) => x + d[i]);
      return { q: R`Find the distance between $P(${P.join(', ')})$ and $Q(${Q.join(', ')})$.`, a: A.num(n), hints: ['$d = \\sqrt{(\\Delta x)^2 + (\\Delta y)^2 + (\\Delta z)^2}$.'], steps: [R`Differences: $${d.join(', ')}$.`, R`$d = \sqrt{${d.map(x => x * x).join(' + ')}} = ${n}$.`] };
    }
    const c = [U.int(-4, 4), U.int(-4, 4), U.int(-4, 4)], r = U.int(1, 6);
    const G = c[0] ** 2 + c[1] ** 2 + c[2] ** 2 - r * r;
    const eq = R`x^2 + y^2 + z^2 ${c[0] ? T.signed(-2 * c[0]) + 'x' : ''} ${c[1] ? T.signed(-2 * c[1]) + 'y' : ''} ${c[2] ? T.signed(-2 * c[2]) + 'z' : ''} ${G ? T.signed(G) : ''} = 0`;
    const steps = [R`Complete the square: $(x ${T.signed(-c[0])})^2 + (y ${T.signed(-c[1])})^2 + (z ${T.signed(-c[2])})^2 = ${r * r}$.`, R`Center $(${c.join(', ')})$, radius $${r}$.`];
    if (lv === 2) return { q: R`Find the radius of the sphere $${eq}$.`, a: A.num(r), hints: ['Complete the square in each of $x$, $y$, $z$.'], steps };
    return { q: R`Find the center of the sphere $${eq}$. Enter as <kbd>a, b, c</kbd>.`, a: A.tuple(c), hints: ['Complete the square in each variable: $x^2 + bx = (x + b/2)^2 - b^2/4$.'], steps };
  });

  def('partial-derivs', { title: 'Partial Derivatives (Preview)', unit: 'bridge', desc: 'Differentiate in one variable, hold the other constant.' }, lv => {
    const wrt = U.pick(['x', 'y']);
    let f, fs, ans, at;
    if (lv === 1) {
      const terms = U.sample([[2, 0], [1, 1], [0, 2], [3, 0], [2, 1], [1, 2], [0, 3], [1, 0], [0, 1]], 3).map(([i, j]) => [U.nz(-6, 6), i, j]);
      const tt = (c, i, j) => T.term(c, (i ? T.pw('x', i) : '') + (j ? T.pw('y', j) : ''));
      f = T.join(terms.map(t => tt(...t)));
      fs = terms.map(([c, i, j]) => `${c}*x^${i}*y^${j}`).join(' + ');
      const d = terms.map(([c, i, j]) => wrt === 'x' ? [c * i, i - 1, j] : [c * j, i, j - 1]).filter(([c]) => c);
      ans = d.length ? d.map(([c, i, j]) => `${c}*x^${i}*y^${j}`).join(' + ') : '0';
      at = T.join(d.map(t => tt(...t)));
    } else {
      const a = U.int(1, 4), b = U.int(1, 3);
      const pool = [
        [R`e^{${H.kx(a)}y}`, R`exp(${a}*x*y)`, { x: [R`${a}*y*exp(${a}*x*y)`, R`${a}ye^{${H.kx(a)}y}`], y: [R`${a}*x*exp(${a}*x*y)`, R`${a}xe^{${H.kx(a)}y}`] }],
        [R`\sin(x^2 y)`, 'sin(x^2*y)', { x: ['2*x*y*cos(x^2*y)', R`2xy\cos(x^2y)`], y: ['x^2*cos(x^2*y)', R`x^2\cos(x^2y)`] }],
        [R`\ln(x^2 + ${b}y^2)`, R`ln(x^2 + ${b}*y^2)`, { x: [R`2*x/(x^2 + ${b}*y^2)`, R`\frac{2x}{x^2 + ${b}y^2}`], y: [R`${2 * b}*y/(x^2 + ${b}*y^2)`, R`\frac{${2 * b}y}{x^2 + ${b}y^2}`] }],
        [R`x^{${a + 1}}\cos y`, R`x^${a + 1}*cos(y)`, { x: [R`${a + 1}*x^${a}*cos(y)`, R`${a + 1}x^{${a}}\cos y`], y: [R`-x^${a + 1}*sin(y)`, R`-x^{${a + 1}}\sin y`] }],
        [R`\frac{x}{y}`, 'x/y', { x: ['1/y', R`\frac{1}{y}`], y: ['-x/y^2', R`-\frac{x}{y^2}`] }],
        [R`\sqrt{x^2 + y^2}`, 'sqrt(x^2 + y^2)', { x: ['x/sqrt(x^2+y^2)', R`\frac{x}{\sqrt{x^2+y^2}}`], y: ['y/sqrt(x^2+y^2)', R`\frac{y}{\sqrt{x^2+y^2}}`] }]
      ];
      const it = U.pick(pool);
      if (lv === 3 && U.chance(0.5)) {
        const mixed = { [R`exp(${a}*x*y)`]: [R`${a}*exp(${a}*x*y) + ${a * a}*x*y*exp(${a}*x*y)`, R`${a}e^{${H.kx(a)}y}(1 + ${a}xy)`], 'sin(x^2*y)': ['2*x*cos(x^2*y) - 2*x^3*y*sin(x^2*y)', R`2x\cos(x^2y) - 2x^3y\sin(x^2y)`], [R`x^${a + 1}*cos(y)`]: [R`-${a + 1}*x^${a}*sin(y)`, R`-${a + 1}x^{${a}}\sin y`], 'x/y': ['-1/y^2', R`-\frac{1}{y^2}`] }[it[1]];
        if (mixed) return { q: R`Find the mixed partial $f_{xy} = \dfrac{\partial^2 f}{\partial y\,\partial x}$ for $f(x, y) = ${it[0]}$.`, a: A.expr(mixed[0], mixed[1], { vars: ['x', 'y'], dom: [[0.3, 1.2], [0.3, 1.2]] }), hints: ['First $f_x$ (treat $y$ as constant), then differentiate that with respect to $y$.', "Clairaut's theorem: $f_{xy} = f_{yx}$ for nice functions."], steps: [R`$f_x = ${it[2].x[1]}$.`, R`$f_{xy} = ${mixed[1]}$.`] };
      }
      f = it[0]; fs = it[1]; ans = it[2][wrt][0]; at = it[2][wrt][1];
    }
    return {
      q: R`Find $\dfrac{\partial f}{\partial ${wrt}}$ for $f(x, y) = ${f}$.`, a: A.expr(ans, at, { vars: ['x', 'y'], dom: [[0.3, 1.5], [0.3, 1.5]] }),
      hints: [R`Treat ${wrt === 'x' ? '$y$' : '$x$'} as a **constant** and differentiate with respect to $${wrt}$ as usual.`],
      steps: [R`Holding ${wrt === 'x' ? '$y$' : '$x$'} fixed: $f_{${wrt}} = ${at}$.`], check: { partial: [fs, wrt] }
    };
  });
})();
