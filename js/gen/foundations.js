/* Generators: algebra foundations + trigonometry refresher. */
(function () {
  'use strict';
  const { U, T, S, F, Frac, gen } = CL;
  const { def, A, H } = gen;
  const R = String.raw;

  /* ================= ALGEBRA ================= */

  def('exp-rules', { title: 'Exponent Rules', unit: 'foundations', desc: 'Combine powers and radicals into a single power of x.' }, lv => {
    if (lv === 1) {
      const a = U.int(2, 8), b = U.int(2, 7), c = U.int(1, 9), n = a + b - c;
      return {
        q: R`Simplify $\dfrac{x^{${a}}\cdot x^{${b}}}{x^{${c}}}$ and write it as $x^n$. What is $n$?`,
        a: A.num(n),
        hints: ['Same base multiplied → **add** exponents: $x^a\\cdot x^b = x^{a+b}$.', 'Same base divided → **subtract** exponents: $\\dfrac{x^m}{x^c} = x^{m-c}$.'],
        steps: [R`Numerator: $x^{${a}}\cdot x^{${b}} = x^{${a}+${b}} = x^{${a + b}}$.`, R`Divide: $\dfrac{x^{${a + b}}}{x^{${c}}} = x^{${a + b}-${c}} = x^{${n}}$, so $n = ${n}$.`]
      };
    }
    if (lv === 2) {
      const a = U.int(2, 5), b = U.pick([-2, -1, 2, 3, 4]), c = U.int(1, 6), d = U.int(1, 4), n = a * b - c + d;
      return {
        q: R`Write $\left(x^{${a}}\right)^{${b}}\cdot \dfrac{x^{${d}}}{x^{${c}}}$ as a single power $x^n$. What is $n$?`,
        a: A.num(n),
        hints: ['Power of a power → **multiply** exponents: $(x^a)^b = x^{ab}$.', 'Then add the exponent from the numerator and subtract the one from the denominator.'],
        steps: [R`$\left(x^{${a}}\right)^{${b}} = x^{${a}\cdot ${b < 0 ? '(' + b + ')' : b}} = x^{${a * b}}$.`, R`$x^{${a * b}}\cdot x^{${d}} \div x^{${c}} = x^{${a * b} + ${d} - ${c}} = x^{${n}}$.`]
      };
    }
    let m = U.pick([2, 3, 4, 5]), p = U.int(1, 7);
    if (p % m === 0) p++;
    const q = U.int(-2, 3), r = U.pick([2, 3]);
    const n = F(p, m).add(q).sub(F(1, r));
    const root = m === 2 ? R`\sqrt{x^{${p}}}` : R`\sqrt[${m}]{x^{${p}}}`;
    const rr = r === 2 ? R`\sqrt{x}` : R`\sqrt[${r}]{x}`;
    return {
      q: R`Write $\dfrac{${root}\cdot x^{${q}}}{${rr}}$ as a single power $x^n$. Find $n$ (a fraction is fine).`,
      a: A.num(n),
      hints: ['Convert radicals to fractional exponents: $\\sqrt[m]{x^p} = x^{p/m}$.', 'Then add/subtract the exponents using a common denominator.'],
      steps: [R`$${root} = x^{${p}/${m}}$ and $${rr} = x^{1/${r}}$.`, R`Exponent: $\frac{${p}}{${m}} + (${q}) - \frac{1}{${r}} = ${n.tex()}$.`]
    };
  });

  def('solve-quadratic', { title: 'Solving Quadratics', unit: 'foundations', desc: 'Factor or use the quadratic formula.' }, lv => {
    if (lv === 1) {
      const [r1, r2] = U.distinct(2, -9, 9);
      const b = -(r1 + r2), c = r1 * r2;
      return {
        q: R`Solve $${T.poly([[1, 2], [b, 1], [c, 0]])} = 0$. Enter all solutions separated by commas.`,
        a: A.set([r1, r2]),
        hints: [R`Find two numbers that **multiply** to $${c}$ and **add** to $${b}$.`, 'Write it as $(x - r_1)(x - r_2) = 0$ and set each factor to zero.'],
        steps: [R`Factor: $${T.poly([[1, 2], [b, 1], [c, 0]])} = (${T.lin(1, -r1)})(${T.lin(1, -r2)})$.`, R`Zero-product property: $x = ${r1}$ or $x = ${r2}$.`]
      };
    }
    if (lv === 2) {
      const a = U.pick([2, 3, 5]); let p = U.nz(-7, 7); if (p % a === 0) p += 1;
      let r = U.int(-5, 5); if (F(p, a).eq(r)) r += 2;
      const B = -(a * r + p), C = p * r;
      return {
        q: R`Solve $${T.poly([[a, 2], [B, 1], [C, 0]])} = 0$. Enter all solutions separated by commas.`,
        a: A.set([p / a, r], [F(p, a).tex(), r].join(',\\ ')),
        hints: [R`Try the AC method: look for factors of $${a}\cdot(${C}) = ${a * C}$ that add to $${B}$.`, 'Or just use the quadratic formula $x = \\dfrac{-b\\pm\\sqrt{b^2-4ac}}{2a}$.'],
        steps: [R`Factor: $(${T.lin(a, -p)})(${T.lin(1, -r)}) = 0$.`, R`So $x = ${F(p, a).tex()}$ or $x = ${r}$.`]
      };
    }
    const k = U.int(-5, 5); let m = U.pick([2, 3, 5, 6, 7, 8, 10, 11, 12, 13]);
    const c = k * k - m, b = -2 * k;
    const st = H.sqrtTex(m);
    return {
      q: R`Solve $${T.poly([[1, 2], [b, 1], [c, 0]])} = 0$ exactly. Enter both solutions separated by commas.`,
      a: A.set([k + Math.sqrt(m), k - Math.sqrt(m)], R`${k} + ${st},\ ${k} - ${st}`),
      hints: ['This one does not factor nicely — use the quadratic formula or complete the square.', R`Completing the square: $x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x = ${-c}$; add $${k * k}$ to both sides.`],
      steps: [R`Complete the square: $(x ${k <= 0 ? '+' : '-'} ${Math.abs(k)})^2 = ${m}$.`, R`$x = ${k} \pm \sqrt{${m}} = ${k} \pm ${st}$. (Type e.g. <kbd>${k}+sqrt(${m}), ${k}-sqrt(${m})</kbd>.)`]
    };
  });

  def('log-eval', { title: 'Evaluating Logarithms', unit: 'foundations', desc: 'Use the definition and properties of logs.' }, lv => {
    if (lv === 1) {
      const t = U.pick(['b', 'b', 'ln', 'inv']);
      if (t === 'ln') {
        const k = U.nz(-4, 6);
        return { q: R`Evaluate $\ln\left(e^{${k}}\right)$.`, a: A.num(k), hints: ['$\\ln$ and $e^x$ are inverse functions.'], steps: [R`$\ln(e^{${k}}) = ${k}$ because $e^{${k}} = e^{${k}}$.`] };
      }
      const b = U.pick([2, 3, 5, 10]), k = t === 'inv' ? -U.int(1, 3) : U.int(1, b === 2 ? 6 : b === 10 ? 4 : 3);
      const arg = k >= 0 ? String(Math.pow(b, k)) : R`\frac{1}{${Math.pow(b, -k)}}`;
      return {
        q: R`Evaluate $\log_{${b}}\left(${arg}\right)$.`, a: A.num(k),
        hints: [R`$\log_{${b}}(y)$ asks: "${b} to **what power** gives $y$?"`],
        steps: [R`Write the argument as a power of ${b}: $${arg} = ${b}^{${k}}$.`, R`So $\log_{${b}}(${arg}) = ${k}$.`]
      };
    }
    if (lv === 2) {
      const p = U.pick([2, 3]); const m = U.int(2, p === 2 ? 3 : 2), k = U.nz(-4, 5); const base = Math.pow(p, m);
      const flip = U.chance(0.25);
      const B = flip ? R`\frac{1}{${base}}` : String(base);
      const ans = F(k, flip ? -m : m);
      const argTex = k >= 0 ? String(Math.pow(p, k)) : R`\frac{1}{${Math.pow(p, -k)}}`;
      return {
        q: R`Evaluate $\log_{${B}}\left(${argTex}\right)$.`, a: A.num(ans),
        hints: [R`Write both the base and the argument as powers of $${p}$.`, R`If base $= ${p}^{a}$ and argument $= ${p}^{c}$, then the log is $c/a$.`],
        steps: [R`Base: $${B} = ${p}^{${flip ? -m : m}}$. Argument: $${argTex} = ${p}^{${k}}$.`, R`$\left(${p}^{${flip ? -m : m}}\right)^{y} = ${p}^{${k}} \Rightarrow y = ${ans.tex()}$.`]
      };
    }
    const b = U.pick([2, 3, 5]), k = U.int(1, 3), d = U.pick([2, 3, 5, 7].filter(x => x !== b));
    const A1 = Math.pow(b, k) * d;
    if (U.chance()) {
      return {
        q: R`Evaluate $\log_{${b}}(${A1}) - \log_{${b}}(${d})$.`, a: A.num(k),
        hints: ['Use $\\log_b M - \\log_b N = \\log_b\\left(\\frac{M}{N}\\right)$.'],
        steps: [R`$\log_{${b}}\frac{${A1}}{${d}} = \log_{${b}}(${A1 / d})$.`, R`$${A1 / d} = ${b}^{${k}}$, so the answer is $${k}$.`]
      };
    }
    return {
      q: R`Evaluate $\log_{${b}}(${A1}) + \log_{${b}}\left(\frac{1}{${d}}\right)$.`, a: A.num(k),
      hints: ['Use $\\log_b M + \\log_b N = \\log_b(MN)$.'],
      steps: [R`$\log_{${b}}\left(${A1}\cdot\frac{1}{${d}}\right) = \log_{${b}}(${A1 / d})$.`, R`$${A1 / d} = ${b}^{${k}}$, so the answer is $${k}$.`]
    };
  });

  def('exp-equations', { title: 'Exponential & Log Equations', unit: 'foundations', desc: 'Solve equations with exponents and logarithms.' }, lv => {
    if (lv === 1) {
      const b = U.pick([2, 3, 5]), k = U.int(2, b === 2 ? 7 : b === 3 ? 5 : 4), c = U.nz(-3, 3);
      return {
        q: R`Solve for $x$: $${b}^{${T.lin(1, c)}} = ${Math.pow(b, k)}$.`, a: A.num(k - c),
        hints: [R`Write $${Math.pow(b, k)}$ as a power of $${b}$.`, 'If $b^{u} = b^{v}$ then $u = v$.'],
        steps: [R`$${Math.pow(b, k)} = ${b}^{${k}}$, so $${T.lin(1, c)} = ${k}$.`, R`$x = ${k - c}$.`]
      };
    }
    if (lv === 2) {
      const p = U.pick([2, 3]);
      let [m1, m2] = U.sample([1, 2, 3], 2);
      const c1 = U.nz(-3, 3), c2 = U.nz(-3, 3);
      const x = F(m2 * c2 - m1 * c1, m1 - m2);
      const B1 = Math.pow(p, m1), B2 = Math.pow(p, m2);
      return {
        q: R`Solve for $x$: $${B1}^{${T.lin(1, c1)}} = ${B2}^{${T.lin(1, c2)}}$.`, a: A.num(x),
        hints: [R`Rewrite both bases as powers of $${p}$.`, R`Then set the exponents equal: $${m1}(x ${c1 < 0 ? '-' : '+'} ${Math.abs(c1)}) = ${m2}(x ${c2 < 0 ? '-' : '+'} ${Math.abs(c2)})$.`],
        steps: [R`$${p}^{${m1}(${T.lin(1, c1)})} = ${p}^{${m2}(${T.lin(1, c2)})}$.`, R`$${T.lin(m1, m1 * c1)} = ${T.lin(m2, m2 * c2)}$.`, R`$x = ${x.tex()}$.`]
      };
    }
    if (U.chance()) {
      const a = U.nz(-4, 5), b = U.int(-3, 3), k = U.pick([2, 3, 5, 6, 7, 10]);
      const v = (Math.log(k) - b) / a;
      const top = b === 0 ? R`\ln ${k}` : R`\ln ${k} ${b > 0 ? '-' : '+'} ${Math.abs(b)}`;
      return {
        q: R`Solve exactly: $e^{${T.lin(a, b)}} = ${k}$.`, a: A.num(v, a === 1 ? top : R`\frac{${top}}{${a}}`),
        hints: ['Take $\\ln$ of both sides.', R`$${T.lin(a, b)} = \ln ${k}$.`],
        steps: [R`$\ln$ both sides: $${T.lin(a, b)} = \ln ${k}$.`, R`$x = \dfrac{\ln ${k} ${b === 0 ? '' : (b > 0 ? '- ' + b : '+ ' + (-b))}}{${a}}$ (type something like <kbd>(ln(${k})${b > 0 ? '-' + b : b < 0 ? '+' + (-b) : ''})/${a}</kbd>).`]
      };
    }
    const a = U.int(1, 4), b = U.int(-4, 4), c = U.int(1, 3);
    const v = (Math.exp(c) - b) / a;
    return {
      q: R`Solve exactly: $\ln\left(${T.lin(a, b)}\right) = ${c}$.`, a: A.num(v, R`\frac{e^{${c}} ${b === 0 ? '' : (b > 0 ? '- ' + b : '+ ' + (-b))}}{${a}}`),
      hints: ['Exponentiate both sides: $e^{\\ln u} = u$.'],
      steps: [R`$${T.lin(a, b)} = e^{${c}}$.`, R`$x = \dfrac{e^{${c}} ${b === 0 ? '' : (b > 0 ? '- ' + b : '+ ' + (-b))}}{${a}}$.`]
    };
  });

  def('composition', { title: 'Composition & Inverses', unit: 'foundations', desc: 'Evaluate and build composite and inverse functions.' }, lv => {
    const a = U.nz(-4, 4), b = U.int(-5, 5), c = U.int(-4, 4), k = U.nz(-3, 3);
    // f(x) = a x + b, g(x) = x^2 + c
    if (lv === 1) {
      const n = U.int(-3, 3), g = n * n + c, val = a * g + b;
      return {
        q: R`Let $f(x) = ${T.lin(a, b)}$ and $g(x) = ${T.poly([[1, 2], [c, 0]])}$. Find $f(g(${n}))$.`, a: A.num(val),
        hints: ['Work inside-out: compute $g(' + n + ')$ first.', 'Then plug that number into $f$.'],
        steps: [R`$g(${n}) = (${n})^2 ${T.signed(c)} = ${g}$.`, R`$f(${g}) = ${a}(${g}) ${T.signed(b)} = ${val}$.`]
      };
    }
    if (lv === 2) {
      const order = U.chance();
      const ans = order ? S.poly([[a, 2], [a * c + b, 0]]) : S.poly([[a * a, 2], [2 * a * b, 1], [b * b + c, 0]]);
      const texA = order ? T.poly([[a, 2], [a * c + b, 0]]) : T.poly([[a * a, 2], [2 * a * b, 1], [b * b + c, 0]]);
      return {
        q: R`Let $f(x) = ${T.lin(a, b)}$ and $g(x) = ${T.poly([[1, 2], [c, 0]])}$. Find $${order ? 'f(g(x))' : 'g(f(x))'}$.`, a: A.expr(ans, texA),
        hints: [order ? 'Replace every $x$ in $f$ with $g(x)$.' : 'Replace every $x$ in $g$ with $f(x)$.'],
        steps: order ? [R`$f(g(x)) = ${a}\left(x^2 ${T.signed(c)}\right) ${T.signed(b)}$.`, R`$= ${texA}$.`] : [R`$g(f(x)) = \left(${T.lin(a, b)}\right)^2 ${T.signed(c)}$.`, R`$= ${texA}$.`]
      };
    }
    const t = U.pick(['lin', 'cube', 'exp']);
    if (t === 'lin') {
      const m = U.nz(-5, 5); const bb = U.int(-6, 6);
      return {
        q: R`Find the inverse function $f^{-1}(x)$ of $f(x) = ${T.lin(m, bb)}$.`, a: A.expr(R`(x - (${bb}))/(${m})`, R`\frac{${T.lin(1, -bb)}}{${m}}`),
        hints: ['Write $y = f(x)$, swap $x$ and $y$, then solve for $y$.'],
        steps: [R`Swap: $x = ${T.lin(m, bb, 'y')}$.`, R`Solve: $y = \dfrac{${T.lin(1, -bb)}}{${m}}$.`]
      };
    }
    if (t === 'cube') {
      const h = U.nz(-4, 4), v = U.nz(-5, 5);
      return {
        q: R`Find $f^{-1}(x)$ for $f(x) = (${T.lin(1, h)})^3 ${T.signed(v)}$.`, a: A.expr(R`cbrt(x - (${v})) - (${h})`, R`\sqrt[3]{${T.lin(1, -v)}} ${T.signed(-h)}`, { dom: [-6, 6] }),
        hints: ['Swap $x$ and $y$: $x = (y + ' + h + ')^3 + ' + v + '$.', 'Undo the cube with a cube root.'],
        steps: [R`$x ${T.signed(-v)} = (${T.lin(1, h, 'y')})^3$.`, R`$y = \sqrt[3]{${T.lin(1, -v)}} ${T.signed(-h)}$. (Type <kbd>cbrt(x...)</kbd> for a cube root.)`]
      };
    }
    const h = U.nz(-3, 3), m = U.pick([2, 3]);
    return {
      q: R`Find $f^{-1}(x)$ for $f(x) = e^{${m}x ${h > 0 ? '-' : '+'} ${Math.abs(h)}}$.`, a: A.expr(R`(ln(x) + (${h}))/${m}`, R`\frac{\ln x ${T.signed(h)}}{${m}}`, { dom: [0.3, 5] }),
      hints: ['Swap $x$ and $y$, then take $\\ln$ of both sides.'],
      steps: [R`$x = e^{${m}y ${h > 0 ? '-' : '+'} ${Math.abs(h)}} \Rightarrow \ln x = ${m}y ${h > 0 ? '-' : '+'} ${Math.abs(h)}$.`, R`$y = \dfrac{\ln x ${T.signed(h)}}{${m}}$.`]
    };
  });

  def('transformations', { title: 'Graph Transformations', unit: 'foundations', desc: 'Shifts, stretches, and reflections of graphs.' }, lv => {
    const h = U.nz(-5, 5), k = U.nz(-5, 5);
    const hD = h > 0 ? `right ${h}` : `left ${-h}`, hW = h > 0 ? `left ${h}` : `right ${-h}`;
    const kD = k > 0 ? `up ${k}` : `down ${-k}`, kW = k > 0 ? `down ${k}` : `up ${-k}`;
    const inner = h > 0 ? `x - ${h}` : `x + ${-h}`;
    if (lv === 1) {
      const eq = R`y = f(${inner}) ${T.signed(k)}`;
      return {
        q: R`Compared with $y = f(x)$, how is the graph of $${eq}$ transformed?`,
        a: A.mc(`Shift ${hD}, ${kD}`, [`Shift ${hW}, ${kD}`, `Shift ${hD}, ${kW}`, `Shift ${hW}, ${kW}`]),
        hints: ['Changes **inside** $f(\\,)$ affect $x$ and act "backwards": $f(x - h)$ moves **right** by $h$.', 'Changes **outside** affect $y$ directly: $+k$ moves **up** by $k$.'],
        steps: [R`Inside: $f(${inner})$ → shift ${hD}.`, R`Outside: $${T.signed(k)}$ → shift ${kD}.`]
      };
    }
    const a = U.pick([-3, -2, -1, 2, 3, F(1, 2)]);
    const af = Frac.of(a);
    const neg = af.sign() < 0, mag = af.abs();
    const stretch = mag.eq(1) ? '' : (mag.v > 1 ? `vertical stretch by ${mag}` : `vertical compression by ${mag}`);
    const parts = [neg ? 'reflect over the x-axis' : '', stretch, `shift ${hD}`, `shift ${kD}`].filter(Boolean);
    const wrong1 = [neg ? 'reflect over the y-axis' : 'reflect over the x-axis', stretch, `shift ${hD}`, `shift ${kD}`].filter(Boolean);
    const wrong2 = [neg ? 'reflect over the x-axis' : '', stretch, `shift ${hW}`, `shift ${kD}`].filter(Boolean);
    const wrong3 = [neg ? 'reflect over the x-axis' : '', mag.eq(1) ? 'vertical stretch by 2' : (mag.v > 1 ? `vertical compression by ${mag}` : `vertical stretch by ${mag}`), `shift ${hD}`, `shift ${kW}`].filter(Boolean);
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    let eq;
    if (lv === 3 && U.chance(0.5)) {
      const b = U.pick([2, 3]);
      const p2 = [`horizontal compression by a factor of 1/${b}`, `shift ${hD}`, `shift ${kD}`];
      return {
        q: R`Compared with $y = f(x)$, describe $y = f\big(${b}(${inner})\big) ${T.signed(k)}$.`,
        a: A.mc(cap(p2.join(', ')), [cap([`horizontal stretch by a factor of ${b}`, `shift ${hD}`, `shift ${kD}`].join(', ')), cap([`horizontal compression by a factor of 1/${b}`, `shift ${hW}`, `shift ${kD}`].join(', ')), cap([`vertical stretch by ${b}`, `shift ${hD}`, `shift ${kD}`].join(', '))]),
        hints: ['A factor $b>1$ multiplying $x$ **inside** squeezes the graph horizontally by $1/b$.', 'Factor first: $f(b(x-h))$ shows the shift $h$ clearly.'],
        steps: [`Inside factor ${b} → horizontal compression by $1/${b}$.`, `$x - h$ form → shift ${hD}; outside constant → shift ${kD}.`]
      };
    }
    eq = R`y = ${af.eq(-1) ? '-' : af.tex()}f(${inner}) ${T.signed(k)}`;
    return {
      q: R`Compared with $y = f(x)$, describe the graph of $${eq}$.`,
      a: A.mc(cap(parts.join(', ')), [cap(wrong1.join(', ')), cap(wrong2.join(', ')), cap(wrong3.join(', '))]),
      hints: ['A negative factor in front reflects across the **x-axis**. Its size stretches (>1) or compresses (<1) vertically.', '$f(x-h)$ shifts right by $h$; adding $k$ outside shifts up by $k$.'],
      steps: [`Outside factor $${af.tex()}$: ${[neg ? 'reflect over the x-axis' : '', stretch || 'no stretch'].filter(Boolean).join(' and ')}.`, `Inside $${inner}$ → shift ${hD}; outside $${T.signed(k)}$ → shift ${kD}.`]
    };
  });

  /* ================= TRIG ================= */

  const REF = {
    sin: { 0: '0', 30: '\\frac{1}{2}', 45: '\\frac{\\sqrt{2}}{2}', 60: '\\frac{\\sqrt{3}}{2}', 90: '1' },
    cos: { 0: '1', 30: '\\frac{\\sqrt{3}}{2}', 45: '\\frac{\\sqrt{2}}{2}', 60: '\\frac{1}{2}', 90: '0' },
    tan: { 0: '0', 30: '\\frac{\\sqrt{3}}{3}', 45: '1', 60: '\\sqrt{3}', 90: null },
    csc: { 0: null, 30: '2', 45: '\\sqrt{2}', 60: '\\frac{2\\sqrt{3}}{3}', 90: '1' },
    sec: { 0: '1', 30: '\\frac{2\\sqrt{3}}{3}', 45: '\\sqrt{2}', 60: '2', 90: null },
    cot: { 0: null, 30: '\\sqrt{3}', 45: '1', 60: '\\frac{\\sqrt{3}}{3}', 90: '0' }
  };
  const TRIGF = { sin: Math.sin, cos: Math.cos, tan: Math.tan, csc: x => 1 / Math.sin(x), sec: x => 1 / Math.cos(x), cot: x => Math.cos(x) / Math.sin(x) };
  function refAngle(D) {
    D = ((D % 360) + 360) % 360;
    if (D % 90 === 0) return (D === 0 || D === 180) ? 0 : 90;
    if (D < 90) return D; if (D < 180) return 180 - D; if (D < 270) return D - 180; return 360 - D;
  }
  function quadrant(D) { D = ((D % 360) + 360) % 360; if (D % 90 === 0) return 0; return Math.floor(D / 90) + 1; }
  function exactTrig(fn, D) {
    const ref = refAngle(D), base = REF[fn][ref];
    if (base === null) return { dne: true, tex: '\\text{undefined}' };
    const v = TRIGF[fn](D * Math.PI / 180);
    const neg = v < -1e-9;
    return { v: Math.abs(v) < 1e-9 ? 0 : v, tex: (neg && base !== '0' ? '-' : '') + base, ref };
  }
  gen.exactTrig = exactTrig;

  def('deg-rad', { title: 'Radians ↔ Degrees', unit: 'trig', desc: 'Convert between degrees and radians.' }, lv => {
    if (lv === 1 || (lv === 2 && U.chance(0.4))) {
      const D = U.pick([30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360]);
      const f = F(D, 180);
      return {
        q: R`Convert $${D}^\circ$ to radians. (Type something like <kbd>5pi/6</kbd>.)`, a: A.num(f.v * Math.PI, T.pi(f)),
        hints: ['Multiply by $\\dfrac{\\pi}{180^\\circ}$.'],
        steps: [R`$${D}^\circ\cdot\dfrac{\pi}{180^\circ} = \dfrac{${D}\pi}{180}$.`, R`Simplify: $${T.pi(f)}$.`]
      };
    }
    if (lv === 2) {
      const f = F(U.int(1, 23), U.pick([3, 4, 6, 12])); const deg = f.mul(180);
      return {
        q: R`Convert $${T.pi(f)}$ radians to degrees.`, a: A.num(deg.v, deg.tex() + '^\\circ'),
        hints: ['Multiply by $\\dfrac{180^\\circ}{\\pi}$ — the $\\pi$ cancels.'],
        steps: [R`$${T.pi(f)}\cdot\dfrac{180^\circ}{\pi} = ${deg.tex()}^\circ$.`]
      };
    }
    const f = F(U.int(13, 47) * U.sign(), U.pick([3, 4, 6]));
    let r = f; while (r.v < 0) r = r.add(2); while (r.v >= 2) r = r.sub(2);
    return {
      q: R`Find the angle in $[0, 2\pi)$ coterminal with $${T.pi(f)}$.`, a: A.num(r.v * Math.PI, T.pi(r)),
      hints: ['Coterminal angles differ by multiples of $2\\pi$.', 'Add or subtract $2\\pi$ until you land in $[0, 2\\pi)$.'],
      steps: [R`$2\pi = \frac{${2 * f.d}\pi}{${f.d}}$.`, R`$${T.pi(f)} ${f.v > 0 ? '-' : '+'} k\cdot 2\pi = ${T.pi(r)}$.`]
    };
  });

  def('trig-values', { title: 'Exact Trig Values', unit: 'trig', desc: 'Unit-circle values at special angles.' }, lv => {
    const fns = lv === 1 ? ['sin', 'cos'] : lv === 2 ? ['sin', 'cos', 'tan'] : ['sin', 'cos', 'tan', 'sec', 'csc', 'cot'];
    const fn = U.pick(fns);
    let D;
    if (lv === 1) D = U.pick([0, 30, 45, 60, 90]);
    else if (lv === 2) D = U.pick([0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330]);
    else D = U.pick([30, 45, 60, 120, 135, 150, 210, 225, 240, 300, 315, 330, 90, 180]) + U.pick([-360, 0, 360]);
    const ex = exactTrig(fn, D);
    const ang = T.pi(F(D, 180));
    const Dn = ((D % 360) + 360) % 360;
    const q = quadrant(D);
    const steps = [];
    if (D !== Dn) steps.push(R`$${ang}$ is coterminal with $${T.pi(F(Dn, 180))}$ (add/subtract $2\pi$).`);
    if (q) steps.push(R`The angle lies in quadrant ${['', 'I', 'II', 'III', 'IV'][q]}; its reference angle is $${T.pi(F(refAngle(D), 180))}$.`);
    else steps.push(R`The angle lies on an axis: the point on the unit circle is $(${Math.round(Math.cos(D * Math.PI / 180))}, ${Math.round(Math.sin(D * Math.PI / 180))})$.`);
    if (ex.dne) steps.push(R`$${'\\' + fn}$ divides by ${fn === 'tan' || fn === 'sec' ? '$\\cos = 0$' : '$\\sin = 0$'} here, so it is **undefined** (type <kbd>DNE</kbd>).`);
    else steps.push(R`$${'\\' + fn}\left(${ang}\right) = ${ex.tex}$.`);
    return {
      q: R`Find the exact value of $${'\\' + fn}\left(${ang}\right)$. (Type <kbd>DNE</kbd> if undefined; use <kbd>sqrt(3)/2</kbd> style for radicals.)`,
      a: ex.dne ? A.num('dne', '\\text{undefined}') : A.num(ex.v, ex.tex),
      hints: ['On the unit circle, $(x, y) = (\\cos\\theta, \\sin\\theta)$, $\\tan\\theta = y/x$.', 'Find the reference angle, use the special-triangle value, then fix the sign by quadrant (ASTC: **A**ll, **S**in, **T**an, **C**os positive in quadrants I–IV).'],
      steps
    };
  });

  def('trig-graph', { title: 'Trig Graph Features', unit: 'trig', desc: 'Amplitude, period, midline, phase shift.' }, lv => {
    const Aamp = U.nz(-4, 4), B = U.pick([F(1), F(2), F(3), F(4), F(1, 2), F(1, 3)]), D = U.int(-3, 3);
    const h = F(U.nz(-3, 3), U.pick([2, 3, 4, 6]));
    const fn = lv === 3 && U.chance(0.4) ? 'tan' : U.pick(['sin', 'cos']);
    const inner = lv >= 2 ? R`${B.eq(1) ? '' : B.tex()}\left(x ${h.sign() > 0 ? '-' : '+'} ${T.pi(h.abs())}\right)` : R`${B.eq(1) ? '' : B.tex()}x`;
    const eq = R`y = ${Aamp === 1 ? '' : Aamp === -1 ? '-' : Aamp}${'\\' + fn}\left(${inner}\right) ${D ? T.signed(D) : ''}`;
    const asks = lv === 1 ? ['amp', 'period', 'mid'] : fn === 'tan' ? ['period', 'shift'] : ['amp', 'period', 'mid', 'shift'];
    const ask = U.pick(asks);
    const period = (fn === 'tan' ? F(1) : F(2)).div(B);
    const name = { amp: 'amplitude', period: 'period', mid: 'midline value $y = D$', shift: 'phase shift (positive = right)' }[ask];
    let a, steps;
    if (ask === 'amp') { a = A.num(Math.abs(Aamp)); steps = [R`Amplitude is $|A| = |${Aamp}| = ${Math.abs(Aamp)}$.`]; }
    else if (ask === 'period') { a = A.num(period.v * Math.PI, T.pi(period)); steps = [R`Period $= \dfrac{${fn === 'tan' ? '\\pi' : '2\\pi'}}{|B|} = \dfrac{${fn === 'tan' ? '\\pi' : '2\\pi'}}{${B.tex()}} = ${T.pi(period)}$.`]; }
    else if (ask === 'mid') { a = A.num(D); steps = [R`The vertical shift is $D = ${D}$, so the midline is $y = ${D}$.`]; }
    else { a = A.num(h.v * Math.PI, T.pi(h)); steps = [R`In the form $${'\\' + fn}(B(x - h))$, $h = ${T.pi(h)}$.`]; }
    return {
      q: R`For $${eq}$, find the **${name}**.`, a,
      hints: ['Standard form: $y = A\\sin\\big(B(x - h)\\big) + D$.', 'Amplitude $|A|$; period $2\\pi/|B|$ (or $\\pi/|B|$ for tangent); phase shift $h$; midline $y = D$.'],
      steps, graph: { fns: [{ f: R`${Aamp}*${fn}(${B.n}/${B.d}*(x - ${lv >= 2 ? h.n : 0}*pi/${h.d})) + ${D}` }], x: [-2 * Math.PI, 2 * Math.PI], y: [-6, 6], piTicks: true }
    };
  });

  def('trig-identities', { title: 'Trig Identities', unit: 'trig', desc: 'Pythagorean, double-angle and power-reducing identities.' }, lv => {
    const k = lv === 1 ? 1 : U.pick([1, 2, 3, 4]);
    const u = k === 1 ? 'x' : k + 'x', u2 = (2 * k) + 'x', u4 = (4 * k) + 'x';
    const L = [
      { e: R`\sin^2(${u})`, c: R`\frac{1 - \cos(${u2})}{2}`, w: [R`\frac{1 + \cos(${u2})}{2}`, R`\frac{1 - \cos(${u})}{2}`, R`1 - \frac{\cos(${u2})}{2}`, R`\frac{\cos(${u2}) - 1}{2}`], hint: 'Power-reducing: $\\sin^2\\theta = \\frac{1-\\cos 2\\theta}{2}$.', lvl: 1 },
      { e: R`\cos^2(${u})`, c: R`\frac{1 + \cos(${u2})}{2}`, w: [R`\frac{1 - \cos(${u2})}{2}`, R`\frac{1 + \cos(${u})}{2}`, R`1 + \frac{\cos(${u2})}{2}`], hint: 'Power-reducing: $\\cos^2\\theta = \\frac{1+\\cos 2\\theta}{2}$.', lvl: 1 },
      { e: R`\sin(${u})\cos(${u})`, c: R`\frac{1}{2}\sin(${u2})`, w: [R`\sin(${u2})`, R`2\sin(${u2})`, R`\frac{1}{2}\cos(${u2})`], hint: 'Double angle: $\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$.', lvl: 1 },
      { e: R`1 + \tan^2(${u})`, c: R`\sec^2(${u})`, w: [R`\csc^2(${u})`, R`\cot^2(${u})`, R`\cos^2(${u})`], hint: 'Divide $\\sin^2+\\cos^2=1$ by $\\cos^2$.', lvl: 1 },
      { e: R`\csc^2(${u}) - 1`, c: R`\cot^2(${u})`, w: [R`\tan^2(${u})`, R`\sec^2(${u})`, R`-\cot^2(${u})`], hint: 'Divide $\\sin^2+\\cos^2=1$ by $\\sin^2$.', lvl: 2 },
      { e: R`\cos^2(${u}) - \sin^2(${u})`, c: R`\cos(${u2})`, w: [R`\sin(${u2})`, R`1`, R`-\cos(${u2})`], hint: 'Double angle: $\\cos 2\\theta = \\cos^2\\theta - \\sin^2\\theta$.', lvl: 2 },
      { e: R`1 - 2\sin^2(${u})`, c: R`\cos(${u2})`, w: [R`\cos^2(${u})`, R`-\cos(${u2})`, R`\sin(${u2})`], hint: '$\\cos 2\\theta = 1 - 2\\sin^2\\theta$.', lvl: 2 },
      { e: R`\sec^2(${u}) - \tan^2(${u})`, c: R`1`, w: [R`-1`, R`0`, R`\sec^2(${u})`], hint: '$1 + \\tan^2 = \\sec^2$.', lvl: 2 },
      { e: R`\frac{\sin^2(${u})}{1 - \cos(${u})}`, c: R`1 + \cos(${u})`, w: [R`1 - \cos(${u})`, R`\sin(${u})`, R`\cos(${u})`], hint: 'Write $\\sin^2 = 1 - \\cos^2 = (1-\\cos)(1+\\cos)$.', lvl: 3 },
      { e: R`\sin^2(${u})\cos^2(${u})`, c: R`\frac{1 - \cos(${u4})}{8}`, w: [R`\frac{1 - \cos(${u2})}{4}`, R`\frac{1 + \cos(${u4})}{8}`, R`\frac{\sin(${u4})}{4}`], hint: '$\\sin\\theta\\cos\\theta = \\frac12\\sin 2\\theta$, then power-reduce $\\sin^2 2\\theta$.', lvl: 3 },
      { e: R`\tan(${u})\cos(${u})`, c: R`\sin(${u})`, w: [R`\cos(${u})`, R`\sec(${u})`, R`1`], hint: '$\\tan = \\sin/\\cos$.', lvl: 1 },
      { e: R`\frac{\sin(${u2})}{\sin(${u})}`, c: R`2\cos(${u})`, w: [R`2`, R`\cos(${u})`, R`2\sin(${u})`], hint: 'Expand $\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$.', lvl: 3 }
    ].filter(x => x.lvl <= lv);
    const it = U.pick(L);
    return {
      q: R`Which expression is identical to $${it.e}$?`,
      a: A.mc('$' + it.c + '$', it.w.map(w => '$' + w + '$')),
      hints: [it.hint, 'Test your choice numerically: plug in a value like $x = 0.5$ for both sides.'],
      steps: [it.hint, R`So $${it.e} = ${it.c}$.`]
    };
  });

  def('inverse-trig', { title: 'Inverse Trig Functions', unit: 'trig', desc: 'Evaluate arcsin, arccos, arctan and compositions.' }, lv => {
    const SV = [['0', 0], ['\\frac{1}{2}', 0.5], ['\\frac{\\sqrt{2}}{2}', Math.SQRT1_2], ['\\frac{\\sqrt{3}}{2}', Math.sqrt(3) / 2], ['1', 1]];
    const TV = [['0', 0], ['\\frac{\\sqrt{3}}{3}', 1 / Math.sqrt(3)], ['1', 1], ['\\sqrt{3}', Math.sqrt(3)]];
    const tp = v => T.pi(H.piFrac(v));
    const steps = [], hints = ['$\\arcsin$ outputs angles in $[-\\frac{\\pi}{2}, \\frac{\\pi}{2}]$, $\\arccos$ in $[0, \\pi]$, $\\arctan$ in $(-\\frac{\\pi}{2}, \\frac{\\pi}{2})$.'];
    if (lv <= 2) {
      const fn = lv === 1 ? U.pick(['arcsin', 'arctan', 'arccos']) : U.pick(['arcsin', 'arccos', 'arctan']);
      const neg = lv === 2 && U.chance(0.6);
      const [tx, v0] = U.pick(fn === 'arctan' ? TV : SV);
      const v = neg ? -v0 : v0, tex = (neg && tx !== '0' ? '-' : '') + tx;
      const r = { arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan }[fn](v);
      steps.push(R`We need the angle $\theta$ in the range of $${'\\' + fn}$ with $${'\\' + (fn.slice(3))}\theta = ${tex}$.`, R`$\theta = ${tp(r)}$.`);
      return { q: R`Evaluate $${'\\' + fn}\left(${tex}\right)$ exactly.`, a: A.num(r, tp(r)), hints: hints.concat(['Ask: which special angle has that sine/cosine/tangent value? Then check it lies in the allowed range.']), steps };
    }
    if (U.chance(0.35)) {
      const [fn, inner, cand] = U.pick([
        ['arcsin', 'sin', [2, 3, 5, 7, 8, 10, 11].map(k => F(k, 6)).concat([F(3, 4), F(5, 4), F(7, 4)])],
        ['arccos', 'cos', [-1, -2, 4, 5, 7, 8, 10, 11].map(k => F(k, 6)).concat([F(-1, 4), F(5, 4), F(7, 4)])],
        ['arctan', 'tan', [5, 7, 4, -5].map(k => F(k, 6)).concat([F(3, 4), F(5, 4)])]]);
      const th = U.pick(cand);
      const r = { arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan }[fn](Math[inner](th.v * Math.PI));
      return {
        q: R`Evaluate $${'\\' + fn}\left(${'\\' + inner}\left(${T.pi(th)}\right)\right)$.`, a: A.num(r, tp(r)),
        hints: hints.concat(['Careful! $\\' + fn + '(\\' + inner + '\\,\\theta) = \\theta$ only when $\\theta$ is already in the range of $\\' + fn + '$.']),
        steps: [R`$${'\\' + inner}\left(${T.pi(th)}\right) = ${gen.exactTrig(inner, Math.round(th.v * 180)).tex}$.`, R`The angle in the range of $${'\\' + fn}$ with that value is $${tp(r)}$.`]
      };
    }
    const [a, b, c] = U.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]);
    const t = U.pick(['sin-arccos', 'cos-arcsin', 'tan-arcsin', 'tan-arccos', 'sin-arctan', 'cos-arctan', 'sec-arctan']);
    const [outer, inv] = t.split('-');
    const arg = inv === 'arctan' ? F(a, b) : F(a, c);
    // right triangle: angle theta with given ratio. opposite/adjacent/hyp
    let opp, adj, hyp = c;
    if (inv === 'arcsin') { opp = a; adj = b; } else if (inv === 'arccos') { adj = a; opp = b; } else { opp = a; adj = b; }
    const val = { sin: F(opp, hyp), cos: F(adj, hyp), tan: F(opp, adj), sec: F(hyp, adj) }[outer];
    return {
      q: R`Evaluate $${'\\' + outer}\left(${'\\' + inv}\left(${arg.tex()}\right)\right)$ exactly.`, a: A.num(val),
      hints: ['Let $\\theta = \\' + inv + '(' + arg.tex() + ')$ and draw a right triangle.', 'Use the Pythagorean theorem to find the missing side.'],
      steps: [R`$\theta = ${'\\' + inv}\left(${arg.tex()}\right)$ means $${'\\' + (inv.slice(3))}\theta = ${arg.tex()}$ with $\theta$ in quadrant I.`, R`Triangle: opposite $= ${opp}$, adjacent $= ${adj}$, hypotenuse $= ${hyp}$ (since $${opp}^2 + ${adj}^2 = ${hyp}^2$).`, R`$${'\\' + outer}\theta = ${val.tex()}$.`]
    };
  });

  def('trig-equations', { title: 'Solving Trig Equations', unit: 'trig', desc: 'All solutions in [0, 2π).' }, lv => {
    const VAL = { sin: [['0', 0], ['\\frac{1}{2}', .5], ['\\frac{\\sqrt{2}}{2}', Math.SQRT1_2], ['\\frac{\\sqrt{3}}{2}', Math.sqrt(3) / 2], ['1', 1]], tan: [['0', 0], ['1', 1], ['\\sqrt{3}', Math.sqrt(3)], ['\\frac{\\sqrt{3}}{3}', 1 / Math.sqrt(3)]] };
    VAL.cos = VAL.sin;
    let eqTex, resid, hints, solveStep;
    if (lv <= 2) {
      const fn = U.pick(['sin', 'cos', 'tan']);
      const [tx, v0] = U.pick(VAL[fn]); const neg = U.chance() && v0 !== 0; const v = neg ? -v0 : v0; const vt = (neg ? '-' : '') + tx;
      if (lv === 1) eqTex = R`${'\\' + fn} x = ${vt}`;
      else {
        if (fn === 'tan') {
          const opts = { '1': R`\tan x ${neg ? '+' : '-'} 1 = 0`, '\\sqrt{3}': R`\tan x ${neg ? '+' : '-'} \sqrt{3} = 0`, '\\frac{\\sqrt{3}}{3}': R`\sqrt{3}\tan x ${neg ? '+' : '-'} 1 = 0`, '0': R`3\tan x = 0` };
          eqTex = opts[tx];
        } else {
          const twice = { '0': '0', '\\frac{1}{2}': '1', '\\frac{\\sqrt{2}}{2}': '\\sqrt{2}', '\\frac{\\sqrt{3}}{2}': '\\sqrt{3}', '1': '2' }[tx];
          eqTex = tx === '0' ? R`2${'\\' + fn} x = 0` : R`2${'\\' + fn} x ${neg ? '+' : '-'} ${twice} = 0`;
        }
      }
      const F0 = { sin: Math.sin, cos: Math.cos, tan: Math.tan }[fn];
      resid = x => F0(x) - v;
      hints = ['Isolate the trig function first.', 'Find the reference angle, then every quadrant where the function has the right sign (ASTC).'];
      solveStep = R`Isolate: $${'\\' + fn} x = ${vt}$.`;
    } else {
      const t = U.pick(['double', 'quad1', 'quad2', 'sq']);
      if (t === 'double') {
        const fn = U.pick(['sin', 'cos']); const [tx, v0] = U.pick(VAL.sin.slice(1, 4)); const neg = U.chance(); const v = neg ? -v0 : v0;
        eqTex = R`${'\\' + fn}(2x) = ${(neg ? '-' : '') + tx}`; resid = x => Math[fn](2 * x) - v;
        hints = ['Let $u = 2x$. Since $x \\in [0, 2\\pi)$, $u \\in [0, 4\\pi)$ — **two** trips around the circle.', 'Solve for $u$, then divide by 2.'];
        solveStep = R`Let $u = 2x \in [0, 4\pi)$ and solve $${'\\' + fn} u = ${(neg ? '-' : '') + tx}$.`;
      } else if (t === 'quad1') {
        eqTex = R`2\sin^2 x - \sin x - 1 = 0`; resid = x => 2 * Math.sin(x) ** 2 - Math.sin(x) - 1;
        hints = ['Treat it as a quadratic in $s = \\sin x$.', 'Factor: $(2s + 1)(s - 1) = 0$.'];
        solveStep = R`$(2\sin x + 1)(\sin x - 1) = 0 \Rightarrow \sin x = -\tfrac12$ or $\sin x = 1$.`;
      } else if (t === 'quad2') {
        eqTex = R`2\cos^2 x + \cos x - 1 = 0`; resid = x => 2 * Math.cos(x) ** 2 + Math.cos(x) - 1;
        hints = ['Quadratic in $c = \\cos x$.', 'Factor: $(2c - 1)(c + 1) = 0$.'];
        solveStep = R`$(2\cos x - 1)(\cos x + 1) = 0 \Rightarrow \cos x = \tfrac12$ or $\cos x = -1$.`;
      } else {
        const fn = U.pick(['sin', 'cos', 'tan']);
        const [n, d, vt] = fn === 'tan' ? U.pick([[3, 1, '3'], [1, 3, '\\frac{1}{3}'], [1, 1, '1']]) : U.pick([[1, 4, '\\frac{1}{4}'], [1, 2, '\\frac{1}{2}'], [3, 4, '\\frac{3}{4}']]);
        eqTex = R`${'\\' + fn}^2 x = ${vt}`; resid = x => Math[fn](x) ** 2 - n / d;
        hints = ['Take square roots — remember **both** signs.', '$\\' + fn + ' x = \\pm\\sqrt{' + vt + '}$.'];
        solveStep = R`$${'\\' + fn} x = \pm\sqrt{${vt}}$.`;
      }
    }
    const sols = [];
    for (let m = 0; m < 48; m++) { const x = m * Math.PI / 24; const r = resid(x); if (isFinite(r) && Math.abs(r) < 1e-9) sols.push(F(m, 24)); }
    const tex = sols.length ? sols.map(T.pi).join(',\\ ') : '\\text{none}';
    return {
      q: R`Solve $${eqTex}$ for all $x$ in $[0, 2\pi)$. Separate answers with commas.`,
      a: A.set(sols.map(f => f.v * Math.PI), tex),
      hints, steps: [solveStep, R`Checking each quadrant in $[0, 2\pi)$: $x = ${tex}$.`],
      graph: { fns: [{ f: resid }], x: [0, 2 * Math.PI], y: [-3, 3], piTicks: true }
    };
  });
})();
