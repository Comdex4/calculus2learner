/* Generators: limits, derivatives, applications of derivatives, integrals (Calc 1). */
(function () {
  'use strict';
  const { U, T, S, F, Frac, gen, poly } = CL;
  const { def, A, H } = gen;
  const R = String.raw;
  const bs = f => '\\' + f;

  /* power term tex with roots / negative powers shown as fractions */
  function powTerm(c, p, v = 'x') {
    p = Frac.of(p); c = Frac.of(c);
    if (c.isZero()) return null;
    if (p.isZero()) return T.term(c, '');
    const root = q => q.isInt() ? T.pw(v, q) : q.eq(F(1, 2)) ? R`\sqrt{${v}}` : q.eq(F(1, 3)) ? R`\sqrt[3]{${v}}` : R`${v}^{${q.n}/${q.d}}`;
    if (p.sign() > 0) return T.term(c, root(p));
    const a = c.abs();
    return { neg: c.sign() < 0, s: R`\frac{${a.n}}{${a.d === 1 ? '' : a.d}${root(p.neg())}}` };
  }
  const powPoly = (terms, v = 'x') => T.join(terms.map(([c, p]) => powTerm(c, p, v)));
  gen.powPoly = powPoly;

  /* ================= LIMITS ================= */

  def('limit-eval', { title: 'Evaluating Limits', unit: 'limits', desc: 'Direct substitution, factoring, and conjugates.' }, lv => {
    if (lv === 1) {
      const a = U.nz(-3, 3), b = U.int(-5, 5), c = U.int(-6, 6), n = U.int(-3, 3);
      if (U.chance()) {
        const v = a * n * n + b * n + c;
        return {
          q: R`Evaluate $\displaystyle\lim_{x \to ${n}} \left(${T.poly([[a, 2], [b, 1], [c, 0]])}\right)$.`, a: A.num(v),
          hints: ['Polynomials are continuous everywhere — just substitute.'],
          steps: [R`Substitute $x = ${n}$: $${a}(${n})^2 ${T.signed(b)}(${n}) ${T.signed(c)} = ${v}$.`], check: { limit: [S.poly([[a, 2], [b, 1], [c, 0]]), n] }
        };
      }
      let d = U.int(-5, 5); if (n + d === 0) d++;
      const v = F(n * n + b, n + d);
      return {
        q: R`Evaluate $\displaystyle\lim_{x \to ${n}} \frac{${T.poly([[1, 2], [b, 0]])}}{${T.lin(1, d)}}$.`, a: A.num(v),
        hints: ['Check the denominator first: is it zero at $x = ' + n + '$? If not, substitute directly.'],
        steps: [R`Denominator at $x=${n}$: $${n + d} \neq 0$, so substitute.`, R`$\dfrac{${n * n + b}}{${n + d}} = ${v.tex()}$.`], check: { limit: [R`(x^2 + ${b})/(x + ${d})`, n] }
      };
    }
    if (lv === 2) {
      const [r, s, t] = U.distinct(3, -6, 6);
      if (U.chance()) {
        const num = T.poly([[1, 2], [-(r + s), 1], [r * s, 0]]);
        return {
          q: R`Evaluate $\displaystyle\lim_{x \to ${r}} \frac{${num}}{${T.lin(1, -r)}}$.`, a: A.num(r - s),
          hints: ['Direct substitution gives $\\frac{0}{0}$ — an indeterminate form. Factor the numerator.', R`The numerator has a factor of $(${T.lin(1, -r)})$.`],
          steps: [R`Factor: $\dfrac{(${T.lin(1, -r)})(${T.lin(1, -s)})}{${T.lin(1, -r)}} = ${T.lin(1, -s)}$ for $x \ne ${r}$.`, R`Now substitute: $${r} - (${s}) = ${r - s}$.`],
          check: { limit: [R`(x^2 - ${r + s}*x + ${r * s})/(x - ${r})`, r] },
          graph: { fns: [{ f: R`x - ${s}` }], points: [[r, r - s, true]], x: [r - 5, r + 5], y: [r - s - 5, r - s + 5] }
        };
      }
      const v = F(r - s, r - t);
      return {
        q: R`Evaluate $\displaystyle\lim_{x \to ${r}} \frac{${T.poly([[1, 2], [-(r + s), 1], [r * s, 0]])}}{${T.poly([[1, 2], [-(r + t), 1], [r * t, 0]])}}$.`, a: A.num(v),
        hints: ['Substitution gives $\\frac{0}{0}$. Factor both top and bottom.', R`Both share a factor of $(${T.lin(1, -r)})$.`],
        steps: [R`$\dfrac{(${T.lin(1, -r)})(${T.lin(1, -s)})}{(${T.lin(1, -r)})(${T.lin(1, -t)})} = \dfrac{${T.lin(1, -s)}}{${T.lin(1, -t)}}$.`, R`Substitute $x = ${r}$: $\dfrac{${r - s}}{${r - t}} = ${v.tex()}$.`],
        check: { limit: [R`((x - ${r})*(x - ${s}))/((x - ${r})*(x - ${t}))`, r] }
      };
    }
    const t = U.pick(['conj', 'conj2', 'cube', 'recip']);
    const a = U.int(1, 5);
    if (t === 'conj') {
      return {
        q: R`Evaluate $\displaystyle\lim_{x \to 0} \frac{\sqrt{x + ${a * a}} - ${a}}{x}$.`, a: A.num(F(1, 2 * a)),
        hints: ['$\\frac{0}{0}$ again. Multiply top and bottom by the **conjugate** $\\sqrt{x + ' + a * a + '} + ' + a + '$.'],
        steps: [R`$\dfrac{(\sqrt{x+${a * a}} - ${a})(\sqrt{x+${a * a}} + ${a})}{x(\sqrt{x+${a * a}} + ${a})} = \dfrac{x}{x(\sqrt{x+${a * a}}+${a})}$.`, R`$= \dfrac{1}{\sqrt{x+${a * a}}+${a}} \to \dfrac{1}{${2 * a}}$.`],
        check: { limit: [R`(sqrt(x + ${a * a}) - ${a})/x`, 0] }
      };
    }
    if (t === 'conj2') {
      return {
        q: R`Evaluate $\displaystyle\lim_{x \to ${a * a}} \frac{\sqrt{x} - ${a}}{x - ${a * a}}$.`, a: A.num(F(1, 2 * a)),
        hints: ['Factor the denominator as a difference of squares: $x - ' + a * a + ' = (\\sqrt x - ' + a + ')(\\sqrt x + ' + a + ')$.'],
        steps: [R`$\dfrac{\sqrt{x} - ${a}}{(\sqrt{x} - ${a})(\sqrt{x} + ${a})} = \dfrac{1}{\sqrt{x} + ${a}}$.`, R`At $x = ${a * a}$: $\dfrac{1}{${2 * a}}$.`],
        check: { limit: [R`(sqrt(x) - ${a})/(x - ${a * a})`, a * a] }
      };
    }
    if (t === 'cube') {
      const r = U.nz(-3, 3);
      return {
        q: R`Evaluate $\displaystyle\lim_{x \to ${r}} \frac{x^3 ${T.signed(-r * r * r)}}{${T.lin(1, -r)}}$.`, a: A.num(3 * r * r),
        hints: ['Use the factorization $x^3 - r^3 = (x - r)(x^2 + rx + r^2)$.'],
        steps: [R`$\dfrac{x^3 - (${r})^3}{x - (${r})} = x^2 ${T.signed(r)}x ${T.signed(r * r)}$.`, R`At $x=${r}$: $3(${r})^2 = ${3 * r * r}$.`],
        check: { limit: [R`(x^3 - (${r * r * r}))/(x - (${r}))`, r] }
      };
    }
    const b = U.nz(-4, 4);
    return {
      q: R`Evaluate $\displaystyle\lim_{x \to ${b}} \frac{\frac{1}{x} - \frac{1}{${b}}}{x - ${b < 0 ? '(' + b + ')' : b}}$.`, a: A.num(F(-1, b * b)),
      hints: ['Combine the fractions in the numerator over a common denominator.'],
      steps: [R`$\frac{1}{x} - \frac{1}{${b}} = \frac{${b} - x}{${b}x} = -\frac{x - ${b < 0 ? '(' + b + ')' : b}}{${b}x}$.`, R`Cancel: $-\dfrac{1}{${b}x} \to -\dfrac{1}{${b * b}}$.`],
      check: { limit: [R`(1/x - 1/(${b}))/(x - (${b}))`, b] }
    };
  });

  def('limit-infinity', { title: 'Limits at Infinity', unit: 'limits', desc: 'End behavior and horizontal asymptotes.' }, lv => {
    const pick = () => U.nz(-6, 6);
    let a = pick(), b = pick();
    const dir = lv === 1 ? Infinity : U.pick([Infinity, -Infinity]);
    const dirT = dir > 0 ? '\\infty' : '-\\infty';
    if (lv <= 2 || U.chance(0.3)) {
      const t = lv === 1 ? U.pick(['same', 'lower']) : U.pick(['same', 'lower', 'higher']);
      const n = U.int(1, 3);
      const m = t === 'same' ? n : t === 'lower' ? n + U.int(1, 2) : Math.max(1, n - U.int(1, 2));
      const top = n === m && t === 'higher' ? n + 1 : n;
      const num = [[a, top], [U.int(-5, 5), top - 1], [U.int(-5, 5), 0]].filter(x => x[1] >= 0);
      const den = [[b, m], [U.int(-5, 5), Math.max(0, m - 1)], ...(m > 1 ? [[U.nz(-5, 5), 0]] : [])];
      const dedupe = arr => { const o = {}; for (const [c, p] of arr) o[p] = (o[p] || 0) + c; return Object.entries(o).map(([p, c]) => [c, +p]).sort((x, y) => y[1] - x[1]); };
      const N = dedupe(num), D = dedupe(den);
      if (!N[0][0] || !D[0][0] || N[0][1] !== top || D[0][1] !== m) return null;
      let ans, step;
      if (top === m) { ans = A.num(F(N[0][0], D[0][0])); step = R`Same degree: ratio of leading coefficients $\dfrac{${N[0][0]}}{${D[0][0]}} = ${F(N[0][0], D[0][0]).tex()}$.`; }
      else if (top < m) { ans = A.num(0); step = R`Degree of the denominator is bigger, so the fraction $\to 0$.`; }
      else {
        const sgn = Math.sign(N[0][0] / D[0][0]) * (dir < 0 && (top - m) % 2 === 1 ? -1 : 1);
        ans = A.num(sgn * Infinity); step = R`Numerator degree is larger: behaves like $${F(N[0][0], D[0][0]).tex()}x^{${top - m}}$, which $\to ${sgn > 0 ? '' : '-'}\infty$.`;
      }
      return {
        q: R`Evaluate $\displaystyle\lim_{x \to ${dirT}} \frac{${T.poly(N)}}{${T.poly(D)}}$. (Use <kbd>inf</kbd> or <kbd>-inf</kbd> if it's infinite.)`, a: ans,
        hints: ['Divide every term by the highest power of $x$ in the **denominator**.', 'Compare degrees: equal → ratio of leading coefficients; bottom bigger → 0; top bigger → $\\pm\\infty$.'],
        steps: [R`Leading terms: $${T.poly([N[0]])}$ on top, $${T.poly([D[0]])}$ on bottom.`, step],
        check: { limit: [R`${S.poly(N)}/${S.poly(D)}`, dir] }
      };
    }
    if (U.chance()) {
      const k = U.int(1, 5), c = U.nz(-4, 4), d = U.int(-5, 5), e = U.int(1, 9);
      const sgn = dir > 0 ? 1 : -1;
      const v = F(sgn * k, c);
      return {
        q: R`Evaluate $\displaystyle\lim_{x \to ${dirT}} \frac{\sqrt{${k * k}x^2 + ${e}}}{${T.lin(c, d)}}$.`, a: A.num(v),
        hints: ['Factor $x^2$ out of the square root: $\\sqrt{x^2} = |x|$.', dir < 0 ? 'Since $x < 0$, $|x| = -x$. Watch the sign!' : 'For $x > 0$, $|x| = x$.'],
        steps: [R`$\sqrt{${k * k}x^2 + ${e}} = |x|\sqrt{${k * k} + \frac{${e}}{x^2}}$ and $|x| = ${dir > 0 ? 'x' : '-x'}$.`, R`Limit $= \dfrac{${sgn > 0 ? '' : '-'}\sqrt{${k * k}}}{${c}} = ${v.tex()}$.`],
        check: { limit: [R`sqrt(${k * k}*x^2 + ${e})/(${c}*x + ${d})`, dir] }
      };
    }
    const k = U.nz(-8, 8);
    return {
      q: R`Evaluate $\displaystyle\lim_{x \to \infty} \left(\sqrt{x^2 ${T.signed(k)}x} - x\right)$.`, a: A.num(F(k, 2)),
      hints: ['$\\infty - \\infty$ is indeterminate. Multiply by the conjugate over itself.'],
      steps: [R`$\left(\sqrt{x^2 ${T.signed(k)}x} - x\right)\cdot\dfrac{\sqrt{x^2 ${T.signed(k)}x} + x}{\sqrt{x^2 ${T.signed(k)}x} + x} = \dfrac{${k}x}{\sqrt{x^2 ${T.signed(k)}x} + x}$.`, R`Divide top and bottom by $x$: $\dfrac{${k}}{\sqrt{1 ${T.signed(F(k, 1))}/x} + 1} \to \dfrac{${k}}{2} = ${F(k, 2).tex()}$.`],
      check: { limit: [R`sqrt(x^2 + ${k}*x) - x`, Infinity] }
    };
  });

  def('limit-trig', { title: 'Trig Limits', unit: 'limits', desc: 'Using sin(x)/x → 1 and friends.' }, lv => {
    const a = U.nz(-6, 6), b = U.nz(-6, 6);
    const ak = H.kx(a), bk = H.kx(b);
    const base = ['Key facts: $\\displaystyle\\lim_{\\theta\\to0}\\frac{\\sin\\theta}{\\theta} = 1$ and $\\displaystyle\\lim_{\\theta\\to0}\\frac{1-\\cos\\theta}{\\theta} = 0$.'];
    let t = lv === 1 ? 'sin' : lv === 2 ? U.pick(['tan', 'sinsin', 'cos0', 'xsin']) : U.pick(['cos2', 'sin2', 'cot', 'mix']);
    const P = {
      sin: [R`\frac{\sin(${ak})}{${bk}}`, F(a, b), R`sin(${a}*x)/(${b}*x)`, R`Write $\dfrac{\sin(${ak})}{${bk}} = \dfrac{${a}}{${b}}\cdot\dfrac{\sin(${ak})}{${ak}}$.`],
      tan: [R`\frac{\tan(${ak})}{${bk}}`, F(a, b), R`tan(${a}*x)/(${b}*x)`, R`$\tan(${ak}) = \dfrac{\sin(${ak})}{\cos(${ak})}$ and $\cos(${ak})\to1$, so it behaves like $\dfrac{${a}}{${b}}$.`],
      sinsin: [R`\frac{\sin(${ak})}{\sin(${bk})}`, F(a, b), R`sin(${a}*x)/sin(${b}*x)`, R`Multiply and divide: $\dfrac{\sin(${ak})}{${ak}}\cdot\dfrac{${bk}}{\sin(${bk})}\cdot\dfrac{${a}}{${b}}$.`],
      cos0: [R`\frac{1 - \cos(${ak})}{x}`, F(0), R`(1 - cos(${a}*x))/x`, R`$\dfrac{1-\cos(${ak})}{x} = ${a}\cdot\dfrac{1-\cos(${ak})}{${ak}} \to ${a}\cdot 0 = 0$.`],
      xsin: [R`\frac{x}{\sin(${ak})}`, F(1, a), R`x/sin(${a}*x)`, R`$\dfrac{x}{\sin(${ak})} = \dfrac{1}{${a}}\cdot\dfrac{${ak}}{\sin(${ak})} \to \dfrac{1}{${a}}$.`],
      cos2: [R`\frac{1 - \cos(${ak})}{x^2}`, F(a * a, 2), R`(1 - cos(${a}*x))/x^2`, R`Multiply by $\dfrac{1+\cos(${ak})}{1+\cos(${ak})}$: $\dfrac{\sin^2(${ak})}{x^2(1+\cos(${ak}))} \to \dfrac{${a * a}}{2}$.`],
      sin2: [R`\frac{\sin^2(${ak})}{x^2}`, F(a * a), R`sin(${a}*x)^2/x^2`, R`$\left(\dfrac{\sin(${ak})}{x}\right)^2 \to (${a})^2 = ${a * a}$.`],
      cot: [R`x\cot(${ak})`, F(1, a), R`x*cot(${a}*x)`, R`$x\cot(${ak}) = \dfrac{x}{\sin(${ak})}\cos(${ak}) \to \dfrac{1}{${a}}\cdot 1$.`],
      mix: [R`\frac{\sin(${ak})}{x^2 ${T.signed(b)}x}`, F(a, b), R`sin(${a}*x)/(x^2 + ${b}*x)`, R`$\dfrac{\sin(${ak})}{x(x ${T.signed(b)})} = \dfrac{\sin(${ak})}{x}\cdot\dfrac{1}{x ${T.signed(b)}} \to ${a}\cdot\dfrac{1}{${b}}$.`]
    }[t];
    return {
      q: R`Evaluate $\displaystyle\lim_{x \to 0} ${P[0]}$.`, a: A.num(P[1]),
      hints: base.concat(['Rewrite so each $\\sin(\\square)$ is divided by the **same** $\\square$.']),
      steps: [P[3], R`Answer: $${P[1].tex()}$.`], check: { limit: [P[2], 0] }
    };
  });

  def('limit-onesided', { title: 'One-Sided Limits & DNE', unit: 'limits', desc: 'Left/right limits, jumps, and vertical asymptotes.' }, lv => {
    const a = U.int(-3, 3);
    const side = U.pick(['-', '+', '']);
    const sideT = side === '-' ? '^-' : side === '+' ? '^+' : '';
    if (lv === 1) {
      const b = U.int(-4, 4), m = U.nz(-3, 3), c = U.int(-4, 4);
      const L = a * a + b, Rv = m * a + c;
      const val = side === '-' ? L : side === '+' ? Rv : (L === Rv ? L : 'dne');
      return {
        q: R`Let $f(x) = \begin{cases} x^2 ${T.signed(b)} & x < ${a} \\ ${T.lin(m, c)} & x \ge ${a}\end{cases}$. Find $\displaystyle\lim_{x \to ${a}${sideT}} f(x)$. (Type <kbd>DNE</kbd> if it doesn't exist.)`,
        a: A.num(val),
        hints: ['From the **left** ($x<' + a + '$) use the top piece; from the **right** use the bottom piece.', 'A two-sided limit exists only if both one-sided limits agree.'],
        steps: [R`Left: $(${a})^2 ${T.signed(b)} = ${L}$. Right: $${m}(${a}) ${T.signed(c)} = ${Rv}$.`, side ? R`So the ${side === '-' ? 'left' : 'right'}-hand limit is $${val}$.` : (val === 'dne' ? R`$${L} \ne ${Rv}$, so the limit does not exist.` : R`Both sides give $${L}$.`)]
      };
    }
    if (lv === 2) {
      if (U.chance()) {
        const val = side === '-' ? -1 : side === '+' ? 1 : 'dne';
        return {
          q: R`Find $\displaystyle\lim_{x \to ${a}${sideT}} \frac{|${H.shift(a)}|}{${H.shift(a)}}$. (Type <kbd>DNE</kbd> if it doesn't exist.)`, a: A.num(val),
          hints: ['If $x > ' + a + '$ the numerator equals the denominator; if $x < ' + a + '$ it is the negative.'],
          steps: [R`For $x > ${a}$ the expression is $1$; for $x < ${a}$ it is $-1$.`, side ? R`Answer: $${val}$.` : 'Left $= -1 \\ne 1 =$ right, so the limit does not exist.'],
          ...(side ? { check: { limit: [R`abs(x - (${a}))/(x - (${a}))`, a, side] } } : {})
        };
      }
      const s2 = side || U.pick(['-', '+']); const sT = s2 === '-' ? '^-' : '^+';
      const val = s2 === '+' ? 2 * a : -2 * a;
      return {
        q: R`Find $\displaystyle\lim_{x \to ${a}${sT}} \frac{x^2 - ${a * a}}{|${H.shift(a)}|}$.`, a: A.num(val),
        hints: ['Factor: $x^2 - ' + a * a + ' = (x - ' + a + ')(x + ' + a + ')$.', 'Decide whether $|x - a|$ equals $(x-a)$ or $-(x-a)$ on this side.'],
        steps: [R`On the ${s2 === '+' ? 'right' : 'left'}, $|${H.shift(a)}| = ${s2 === '+' ? '' : '-'}(${H.shift(a)})$.`, R`So the expression is $${s2 === '+' ? '' : '-'}(${H.shift(-a)}) \to ${val}$.`],
        check: { limit: [R`(x^2 - ${a * a})/abs(x - (${a}))`, a, s2] }
      };
    }
    const k = U.pick([1, 2, 3]); const c = U.nz(-4, 4);
    let num = U.nz(-5, 5);
    const numAt = num; // numerator constant
    let val;
    const sgnN = Math.sign(numAt);
    if (k % 2 === 0) val = sgnN * Infinity;
    else val = side === '' ? 'dne' : sgnN * (side === '+' ? 1 : -1) * Infinity;
    const den = k === 1 ? H.shift(a) : R`(${H.shift(a)})^{${k}}`;
    return {
      q: R`Find $\displaystyle\lim_{x \to ${a}${sideT}} \frac{${num}}{${den}}$. (Use <kbd>inf</kbd>, <kbd>-inf</kbd>, or <kbd>DNE</kbd>.)`, a: A.num(val),
      hints: ['The numerator stays at $' + num + '$ while the denominator $\\to 0$: the result blows up.', 'Determine the **sign** of the denominator on the given side.'],
      steps: [k % 2 === 0 ? R`$(${H.shift(a)})^{${k}} \to 0^+$ from both sides (even power).` : R`$${H.shift(a)} \to 0^{${side === '-' ? '-' : '+'}}$ ${side ? 'on this side' : 'on the right and $0^-$ on the left'}.`, val === 'dne' ? 'The two sides go to $+\\infty$ and $-\\infty$, so the two-sided limit does not exist.' : R`Sign: $${num}$ divided by a ${k % 2 === 0 || side === '+' ? 'positive' : 'negative'} tiny number $\Rightarrow ${val > 0 ? '+' : '-'}\infty$.`],
      ...(val !== 'dne' ? { check: { limit: [R`${num}/((x - (${a}))^${k})`, a, side || '+'] } } : {})
    };
  });

  def('continuity', { title: 'Continuity', unit: 'limits', desc: 'Choose constants to make functions continuous.' }, lv => {
    if (lv === 1) {
      const a = U.nz(-3, 3), b = U.int(-5, 5), c = U.int(-5, 5);
      const k = F(a * a + c - b, a);
      return {
        q: R`Find $k$ so that $f(x) = \begin{cases} kx ${T.signed(b)} & x < ${a} \\ x^2 ${T.signed(c)} & x \ge ${a}\end{cases}$ is continuous at $x = ${a}$.`, a: A.num(k),
        hints: ['Continuity at $a$ means left limit = right limit = $f(a)$.', 'Set the two pieces equal at $x = ' + a + '$ and solve for $k$.'],
        steps: [R`$k(${a}) ${T.signed(b)} = (${a})^2 ${T.signed(c)} = ${a * a + c}$.`, R`$${a}k = ${a * a + c - b} \Rightarrow k = ${k.tex()}$.`]
      };
    }
    if (lv === 2) {
      if (U.chance()) {
        const a = U.nz(-5, 5);
        return {
          q: R`Find $k$ so that $f(x) = \begin{cases} \dfrac{x^2 - ${a * a}}{${H.shift(a)}} & x \ne ${a} \\ k & x = ${a}\end{cases}$ is continuous.`, a: A.num(2 * a),
          hints: ['$k$ must equal $\\lim_{x\\to' + a + '} f(x)$.', 'Factor the numerator.'],
          steps: [R`$\dfrac{(${H.shift(a)})(${H.shift(-a)})}{${H.shift(a)}} = ${H.shift(-a)}$.`, R`$k = ${a} + ${a < 0 ? '(' + a + ')' : a} = ${2 * a}$.`]
        };
      }
      let a = U.pick([-3, -2, 2, 3]);
      const k = F(2 * a, a * a - 1);
      return {
        q: R`Find $k$ so that $f(x) = \begin{cases} kx^2 & x \le ${a} \\ 2x + k & x > ${a}\end{cases}$ is continuous everywhere.`, a: A.num(k),
        hints: ['Only $x = ' + a + '$ is in question. Match the pieces there.'],
        steps: [R`$k(${a})^2 = 2(${a}) + k \Rightarrow ${a * a}k - k = ${2 * a}$.`, R`$k = \dfrac{${2 * a}}{${a * a - 1}} = ${k.tex()}$.`]
      };
    }
    if (U.chance()) {
      const m = U.nz(-6, 6);
      return {
        q: R`What value of $c$ makes $f(x) = \begin{cases} \dfrac{\sin(${H.kx(m)})}{x} & x \ne 0 \\ c & x = 0\end{cases}$ continuous at $0$?`, a: A.num(m),
        hints: ['Use $\\lim_{\\theta\\to0}\\frac{\\sin\\theta}{\\theta} = 1$.'],
        steps: [R`$\dfrac{\sin(${H.kx(m)})}{x} = ${m}\cdot\dfrac{\sin(${H.kx(m)})}{${H.kx(m)}} \to ${m}$.`, R`So $c = ${m}$.`]
      };
    }
    const a = U.int(1, 5);
    return {
      q: R`What value of $c$ makes $f(x) = \begin{cases} \dfrac{\sqrt{x + ${a * a}} - ${a}}{x} & x \ne 0 \\ c & x = 0\end{cases}$ continuous at $0$?`, a: A.num(F(1, 2 * a)),
      hints: ['Compute the limit with the conjugate.'],
      steps: [R`Rationalize: $\dfrac{1}{\sqrt{x + ${a * a}} + ${a}} \to \dfrac{1}{${2 * a}}$.`, R`So $c = \frac{1}{${2 * a}}$.`]
    };
  });

  /* ================= DERIVATIVES ================= */

  def('deriv-definition', { title: 'Limit Definition of the Derivative', unit: 'derivs', desc: 'f\'(a) = lim (f(a+h) − f(a))/h.' }, lv => {
    if (lv === 1) {
      const a = U.nz(-4, 4), b = U.int(-6, 6), c = U.int(-6, 6), n = U.int(-3, 3);
      const v = 2 * a * n + b;
      return {
        q: R`Using the limit definition, find $f'(${n})$ for $f(x) = ${T.poly([[a, 2], [b, 1], [c, 0]])}$.`, a: A.num(v),
        hints: ['$f\'(a) = \\displaystyle\\lim_{h\\to0}\\frac{f(a+h)-f(a)}{h}$.', 'Expand $f(' + n + '+h)$, subtract $f(' + n + ')$; every remaining term has a factor of $h$.'],
        steps: [R`$f(${n}+h) - f(${n}) = ${a}\left[(${n}+h)^2 - ${n * n}\right] ${T.signed(b)}h = ${T.poly([[a, 2], [v, 1]], 'h')}$.`, R`Divide by $h$: $${T.poly([[a, 1], [v, 0]], 'h')} \to ${v}$ as $h \to 0$.`],
        check: { value: v }
      };
    }
    if (lv === 2) {
      const t = U.pick(['pow', 'sqrt', 'recip', 'sin']);
      if (t === 'pow') {
        const a = U.int(-3, 3), k = U.pick([2, 3, 4]); const v = k * Math.pow(a, k - 1);
        return {
          q: R`Evaluate $\displaystyle\lim_{h\to0}\frac{(${a}+h)^{${k}} - ${Math.pow(a, k)}}{h}$ by recognizing it as a derivative.`, a: A.num(v),
          hints: ['This is $f\'(a)$ for some $f$ and $a$. Which?', R`$f(x) = x^{${k}}$ at $a = ${a}$.`],
          steps: [R`It's $f'(${a})$ with $f(x) = x^{${k}}$ (note $${a}^{${k}} = ${Math.pow(a, k)}$).`, R`$f'(x) = ${k}x^{${k - 1}}$, so $f'(${a}) = ${v}$.`], check: { limit: [R`((${a}+x)^${k} - ${Math.pow(a, k)})/x`, 0] }
        };
      }
      if (t === 'sqrt') {
        const a = U.int(1, 6);
        return {
          q: R`Evaluate $\displaystyle\lim_{h\to0}\frac{\sqrt{${a * a}+h} - ${a}}{h}$ by recognizing a derivative.`, a: A.num(F(1, 2 * a)),
          hints: ['It is $f\'(' + a * a + ')$ for $f(x) = \\sqrt{x}$.'],
          steps: [R`$f(x) = \sqrt{x}$, $f'(x) = \dfrac{1}{2\sqrt{x}}$.`, R`$f'(${a * a}) = \dfrac{1}{${2 * a}}$.`], check: { limit: [R`(sqrt(${a * a}+x) - ${a})/x`, 0] }
        };
      }
      if (t === 'recip') {
        const a = U.nz(-5, 5);
        return {
          q: R`Evaluate $\displaystyle\lim_{h\to0}\frac{\frac{1}{${a}+h} - \frac{1}{${a}}}{h}$.`, a: A.num(F(-1, a * a)),
          hints: ['It is $f\'(' + a + ')$ for $f(x) = 1/x$.'],
          steps: [R`$f(x) = \frac1x$, $f'(x) = -\frac{1}{x^2}$.`, R`$f'(${a}) = ${F(-1, a * a).tex()}$.`], check: { limit: [R`(1/(${a}+x) - 1/(${a}))/x`, 0] }
        };
      }
      const th = U.pick([[1, 6], [1, 4], [1, 3], [1, 2], [2, 3], [5, 6], [1, 1]]); const f = F(...th);
      const ex = gen.exactTrig('cos', Math.round(f.v * 180)), sv = gen.exactTrig('sin', Math.round(f.v * 180));
      return {
        q: R`Evaluate $\displaystyle\lim_{h\to0}\frac{\sin\left(${T.pi(f)}+h\right) - ${sv.tex}}{h}$.`, a: A.num(ex.v, ex.tex),
        hints: ['It is $f\'(' + T.pi(f) + ')$ for $f(x) = \\sin x$.', "$\\frac{d}{dx}\\sin x = \\cos x$."],
        steps: [R`$\sin\left(${T.pi(f)}\right) = ${sv.tex}$, so this is the derivative of $\sin x$ at $${T.pi(f)}$.`, R`$\cos\left(${T.pi(f)}\right) = ${ex.tex}$.`], check: { value: Math.cos(f.v * Math.PI) }
      };
    }
    const t = U.pick(['recip', 'sqrt', 'cube']);
    if (t === 'recip') {
      const c = U.int(-4, 4);
      return {
        q: R`Use the limit definition to find $f'(x)$ for $f(x) = \dfrac{1}{${H.shift(-c)}}$.`, a: A.expr(R`-1/(x + ${c})^2`, R`-\frac{1}{(${H.shift(-c)})^2}`, { dom: [-c + 0.5, -c + 3] }),
        hints: ['Combine $\\frac{1}{x+h' + (c ? (c > 0 ? '+' + c : c) : '') + '} - \\frac{1}{x' + (c ? (c > 0 ? '+' + c : c) : '') + '}$ over a common denominator.', 'The numerator simplifies to $-h$.'],
        steps: [R`$\dfrac{f(x+h)-f(x)}{h} = \dfrac{-h}{h(x+h ${T.signed(c)})(x ${T.signed(c)})}$.`, R`Cancel $h$ and let $h\to0$: $-\dfrac{1}{(${H.shift(-c)})^2}$.`], check: { deriv: R`1/(x + ${c})` }
      };
    }
    if (t === 'sqrt') {
      const c = U.int(0, 5);
      return {
        q: R`Use the limit definition to find $f'(x)$ for $f(x) = \sqrt{${H.shift(-c)}}$.`, a: A.expr(R`1/(2*sqrt(x + ${c}))`, R`\frac{1}{2\sqrt{${H.shift(-c)}}}`, { dom: [0.5, 4] }),
        hints: ['Multiply by the conjugate $\\sqrt{x+h+' + c + '} + \\sqrt{x+' + c + '}$.'],
        steps: [R`Numerator becomes $(x+h${c ? '+' + c : ''}) - (x${c ? '+' + c : ''}) = h$.`, R`$\dfrac{1}{\sqrt{x+h${c ? '+' + c : ''}}+\sqrt{x${c ? '+' + c : ''}}} \to \dfrac{1}{2\sqrt{${H.shift(-c)}}}$.`], check: { deriv: R`sqrt(x + ${c})` }
      };
    }
    const a = U.nz(-4, 4);
    return {
      q: R`Use the limit definition to find $f'(x)$ for $f(x) = ${H.kx(a, 'x^3')}$.`, a: A.expr(R`${3 * a}*x^2`, R`${3 * a}x^2`),
      hints: ['Expand $(x+h)^3 = x^3 + 3x^2h + 3xh^2 + h^3$.'],
      steps: [R`$f(x+h) - f(x) = ${a}(3x^2h + 3xh^2 + h^3)$.`, R`Divide by $h$ and let $h\to0$: $${3 * a}x^2$.`], check: { deriv: R`${a}*x^3` }
    };
  });

  def('deriv-power', { title: 'Power Rule', unit: 'derivs', desc: 'Differentiate polynomials, roots and negative powers.' }, lv => {
    let terms;
    if (lv === 1) {
      const pw = U.sample([0, 1, 2, 3, 4, 5], 3).sort((a, b) => b - a);
      terms = pw.map(p => [U.nz(-9, 9), p]);
    } else {
      const pool = [F(1, 2), F(-1), F(-2), F(3, 2), F(1, 3), F(-1, 2), F(2), F(3), F(4), F(2, 3)];
      terms = U.sample(pool, 3).sort((a, b) => b.v - a.v).map(p => [U.nz(-6, 6), p]);
    }
    if (lv === 3 && U.chance(0.5)) {
      // second derivative of polynomial
      const pw = U.sample([2, 3, 4, 5, 6], 3).sort((a, b) => b - a); terms = pw.map(p => [U.nz(-6, 6), p]).concat([[U.nz(-9, 9), 1]]);
      const d2 = poly.d(poly.d(terms));
      return {
        q: R`Find $f''(x)$ for $f(x) = ${T.poly(terms)}$.`, a: A.expr(S.poly(d2), T.poly(d2)),
        hints: ['Differentiate twice. Power rule: $\\frac{d}{dx}x^n = nx^{n-1}$.'],
        steps: [R`$f'(x) = ${T.poly(poly.d(terms))}$.`, R`$f''(x) = ${T.poly(d2)}$.`], check: { deriv: S.poly(poly.d(terms)) }
      };
    }
    const d = poly.d(terms);
    const ftex = powPoly(terms), dtex = powPoly(d);
    return {
      q: R`Find $f'(x)$ for $f(x) = ${ftex}$.`, a: A.expr(S.poly(d), dtex, { dom: [0.3, 3] }),
      hints: ['Power rule: $\\dfrac{d}{dx}x^n = nx^{n-1}$, and constants differentiate to $0$.', lv > 1 ? 'Rewrite roots and fractions as powers first: $\\sqrt x = x^{1/2}$, $\\frac{1}{x^2} = x^{-2}$.' : 'Do each term separately.'].filter(Boolean),
      steps: [lv > 1 ? R`Rewrite with exponents: $f(x) = ${T.join(terms.map(([c, p]) => T.term(c, T.pw('x', p))))}$.` : 'Differentiate term by term.', R`$f'(x) = ${T.join(d.map(([c, p]) => T.term(c, T.pw('x', p))))}$.`, R`$= ${dtex}$.`],
      check: { deriv: S.poly(terms) }
    };
  });

  const FUNCS = {
    exp: { t: 'e^{x}', s: 'exp(x)', d: 'exp(x)', dt: 'e^{x}' },
    sin: { t: '\\sin x', s: 'sin(x)', d: 'cos(x)', dt: '\\cos x' },
    cos: { t: '\\cos x', s: 'cos(x)', d: '(-sin(x))', dt: '-\\sin x' },
    ln: { t: '\\ln x', s: 'ln(x)', d: '(1/x)', dt: '\\frac{1}{x}' },
    sqrt: { t: '\\sqrt{x}', s: 'sqrt(x)', d: '(1/(2*sqrt(x)))', dt: '\\frac{1}{2\\sqrt{x}}' }
  };

  def('deriv-product', { title: 'Product Rule', unit: 'derivs', desc: '(fg)\' = f\'g + fg\'.' }, lv => {
    if (lv === 3 && U.chance(0.5)) {
      const g = U.pick(['sin', 'cos']); const n = U.int(1, 2);
      const f = R`x^${n}*exp(x)*${g}(x)`;
      const ans = R`${n}*x^${n - 1}*exp(x)*${g}(x) + x^${n}*exp(x)*${g}(x) + x^${n}*exp(x)*${FUNCS[g].d}`;
      return {
        q: R`Differentiate $f(x) = ${n === 1 ? 'x' : 'x^2'}e^{x}${FUNCS[g].t}$.`, a: A.expr(ans, R`${n === 1 ? '' : '2x'}e^x${FUNCS[g].t} ${n === 1 ? '+ ' : '+ x^2'}${n === 1 ? 'xe^x' + FUNCS[g].t : 'e^x' + FUNCS[g].t} + ${n === 1 ? 'x' : 'x^2'}e^x${g === 'sin' ? '\\cos x' : '(-\\sin x)'}`.replace(/^\+ /, '')),
        hints: ['Three factors: $(uvw)\' = u\'vw + uv\'w + uvw\'$.'],
        steps: [R`$u = ${n === 1 ? 'x' : 'x^2'}, v = e^x, w = ${FUNCS[g].t}$.`, R`$u' = ${n === 1 ? '1' : '2x'}$, $v' = e^x$, $w' = ${FUNCS[g].dt}$. Add the three products.`],
        check: { deriv: f }
      };
    }
    const g = U.pick(lv === 1 ? ['exp', 'sin', 'cos'] : ['exp', 'sin', 'cos', 'ln', 'sqrt']);
    const P = lv === 1 ? [[U.nz(-5, 5), U.int(1, 4)]] : [[U.nz(-4, 4), U.int(1, 3)], [U.nz(-6, 6), 0]];
    const dP = poly.d(P);
    const fx = R`${S.poly(P)}*${FUNCS[g].s}`;
    const ans = R`${S.poly(dP)}*${FUNCS[g].s} + ${S.poly(P)}*${FUNCS[g].d}`;
    const pT = T.poly(P), dpT = T.poly(dP);
    const wrap = s => P.length > 1 ? '(' + s + ')' : s;
    const prod2 = FUNCS[g].dt.startsWith('-') ? R`- ${wrap(pT)}${FUNCS[g].dt.slice(1)}` : R`+ ${wrap(pT)}${FUNCS[g].dt.startsWith('\\frac') ? '\\cdot' : ''}${FUNCS[g].dt}`;
    return {
      q: R`Differentiate $f(x) = ${wrap(pT)}${FUNCS[g].t}$.`, a: A.expr(ans, R`${dpT === '1' ? '' : (dP.length ? wrap(dpT) : '')}${FUNCS[g].t} ${prod2}`, { dom: [0.3, 3] }),
      hints: ['Product rule: $(uv)\' = u\'v + uv\'$.', R`Let $u = ${pT}$ and $v = ${FUNCS[g].t}$.`],
      steps: [R`$u' = ${dpT}$, $v' = ${FUNCS[g].dt}$.`, R`$f'(x) = u'v + uv' = (${dpT})${FUNCS[g].t} + (${pT})\left(${FUNCS[g].dt}\right)$.`],
      check: { deriv: fx },
      mistakes: [{ v: R`${S.poly(dP)}*${FUNCS[g].d}`, msg: "That's $u'v'$ — the derivative of a product is **not** the product of derivatives." }]
    };
  });

  def('deriv-quotient', { title: 'Quotient Rule', unit: 'derivs', desc: '(f/g)\' = (f\'g − fg\')/g².' }, lv => {
    const hint = ['Quotient rule: $\\left(\\dfrac{u}{v}\\right)\' = \\dfrac{u\'v - uv\'}{v^2}$ ("low d-high minus high d-low, over low squared").'];
    if (lv === 1) {
      let a = U.nz(-5, 5), b = U.int(-6, 6), c = U.nz(-4, 4), d = U.int(-6, 6);
      if (a * d - b * c === 0) b++;
      const k = a * d - b * c;
      return {
        q: R`Differentiate $f(x) = \dfrac{${T.lin(a, b)}}{${T.lin(c, d)}}$.`, a: A.expr(R`${k}/(${c}*x + ${d})^2`, R`\frac{${k}}{(${T.lin(c, d)})^2}`),
        hints: hint.concat([R`$u' = ${a}$, $v' = ${c}$.`]),
        steps: [R`$f'(x) = \dfrac{${a}(${T.lin(c, d)}) - (${T.lin(a, b)})(${c})}{(${T.lin(c, d)})^2}$.`, R`Numerator: $${a * c}x ${T.signed(a * d)} - (${a * c}x ${T.signed(b * c)}) = ${k}$.`],
        check: { deriv: R`(${a}*x + ${b})/(${c}*x + ${d})` }
      };
    }
    const opts = lv === 2 ? ['xn', 'sinx', 'expx', 'quad'] : ['sin1cos', 'lnx2', 'expexp', 'xsq'];
    const t = U.pick(opts);
    const a = U.nz(-5, 5), n = U.int(2, 3), m = U.int(1, 6);
    const P = {
      xn: [R`\frac{x^{${n}}}{x ${T.signed(a)}}`, R`x^${n}/(x + ${a})`, R`(${n}*x^${n - 1}*(x + ${a}) - x^${n})/(x + ${a})^2`, R`\frac{${n}x^{${n - 1}}(x ${T.signed(a)}) - x^{${n}}}{(x ${T.signed(a)})^2}`, [-a + 0.5, -a + 3]],
      sinx: [R`\frac{\sin x}{x}`, 'sin(x)/x', '(x*cos(x) - sin(x))/x^2', R`\frac{x\cos x - \sin x}{x^2}`, [0.4, 3]],
      expx: [R`\frac{e^{x}}{x^{${n}}}`, R`exp(x)/x^${n}`, R`exp(x)*(x - ${n})/x^${n + 1}`, R`\frac{e^{x}(x - ${n})}{x^{${n + 1}}}`, [0.4, 3]],
      quad: [R`\frac{x^2 + ${m}}{x^2 + ${m + a * a}}`, R`(x^2 + ${m})/(x^2 + ${m + a * a})`, R`(2*x*${a * a})/(x^2 + ${m + a * a})^2`, R`\frac{${2 * a * a}x}{(x^2 + ${m + a * a})^2}`, [-2, 2]],
      sin1cos: [R`\frac{\sin x}{1 + \cos x}`, 'sin(x)/(1 + cos(x))', '1/(1 + cos(x))', R`\frac{1}{1 + \cos x}`, [-2, 2]],
      lnx2: [R`\frac{\ln x}{x^2}`, 'ln(x)/x^2', '(1 - 2*ln(x))/x^3', R`\frac{1 - 2\ln x}{x^3}`, [0.5, 3]],
      expexp: [R`\frac{e^{x}}{1 + e^{x}}`, 'exp(x)/(1 + exp(x))', 'exp(x)/(1 + exp(x))^2', R`\frac{e^{x}}{(1 + e^{x})^2}`, [-2, 2]],
      xsq: [R`\frac{x}{\sqrt{x^2 + ${m}}}`, R`x/sqrt(x^2 + ${m})`, R`${m}/(x^2 + ${m})^(3/2)`, R`\frac{${m}}{(x^2 + ${m})^{3/2}}`, [-2, 2]]
    }[t];
    return {
      q: R`Differentiate $f(x) = ${P[0]}$. (Any equivalent form is accepted.)`, a: A.expr(P[2], P[3], { dom: P[4] }),
      hints: hint.concat(['Simplify the numerator carefully — watch the minus sign distributing.']),
      steps: [R`Apply the quotient rule to $${P[0]}$.`, R`After simplifying: $f'(x) = ${P[3]}$.`], check: { deriv: P[1] }
    };
  });

  def('deriv-chain', { title: 'Chain Rule', unit: 'derivs', desc: 'Derivatives of compositions.' }, lv => {
    const a = U.nz(-5, 5), b = U.int(-5, 5), n = U.int(2, 6), c = U.int(1, 6);
    const pool = lv === 1 ? ['linpow', 'expax', 'sinax'] : lv === 2 ? ['quadpow', 'sinquad', 'expquad', 'lnquad', 'sqrtlin', 'cospow'] : ['sincube', 'expsin', 'lncos', 'sqrtcubic', 'sinexp', 'lnln', 'nested'];
    const t = U.pick(pool);
    const ax = H.kx(a);
    const P = {
      linpow: [R`(${T.lin(a, b)})^{${n}}`, R`(${a}*x + ${b})^${n}`, R`${n * a}*(${a}*x + ${b})^${n - 1}`, R`${n * a}(${T.lin(a, b)})^{${n - 1}}`, R`${n}*(${a}*x + ${b})^${n - 1}`],
      expax: [R`e^{${T.lin(a, b)}}`, R`exp(${a}*x + ${b})`, R`${a}*exp(${a}*x + ${b})`, R`${H.kx(a, '')}e^{${T.lin(a, b)}}`.replace(/^(-?)e/, '$1e'), R`exp(${a}*x + ${b})`],
      sinax: [R`\sin(${T.lin(a, b)})`, R`sin(${a}*x + ${b})`, R`${a}*cos(${a}*x + ${b})`, R`${a}\cos(${T.lin(a, b)})`, R`cos(${a}*x + ${b})`],
      quadpow: [R`(x^2 ${T.signed(c)})^{${n}}`, R`(x^2 + ${c})^${n}`, R`${2 * n}*x*(x^2 + ${c})^${n - 1}`, R`${2 * n}x(x^2 ${T.signed(c)})^{${n - 1}}`, R`${n}*(x^2 + ${c})^${n - 1}`],
      sinquad: [R`\sin(${H.kx(a, 'x^2')} ${T.signed(b)})`, R`sin(${a}*x^2 + ${b})`, R`${2 * a}*x*cos(${a}*x^2 + ${b})`, R`${2 * a}x\cos(${H.kx(a, 'x^2')} ${T.signed(b)})`, R`cos(${a}*x^2 + ${b})`],
      expquad: [R`e^{${H.kx(a, 'x^2')}}`, R`exp(${a}*x^2)`, R`${2 * a}*x*exp(${a}*x^2)`, R`${2 * a}xe^{${H.kx(a, 'x^2')}}`, R`exp(${a}*x^2)`],
      lnquad: [R`\ln(x^2 + ${c})`, R`ln(x^2 + ${c})`, R`2*x/(x^2 + ${c})`, R`\frac{2x}{x^2 + ${c}}`, R`1/(x^2 + ${c})`],
      sqrtlin: [R`\sqrt{${T.lin(Math.abs(a), c)}}`, R`sqrt(${Math.abs(a)}*x + ${c})`, R`${Math.abs(a)}/(2*sqrt(${Math.abs(a)}*x + ${c}))`, R`\frac{${Math.abs(a)}}{2\sqrt{${T.lin(Math.abs(a), c)}}}`, R`1/(2*sqrt(${Math.abs(a)}*x + ${c}))`],
      cospow: [R`\cos^{${n}} x`, R`cos(x)^${n}`, R`-${n}*cos(x)^${n - 1}*sin(x)`, R`-${n}\cos^{${n - 1}}x\,\sin x`, R`${n}*cos(x)^${n - 1}`],
      sincube: [R`\sin^{3}(${ax})`, R`sin(${a}*x)^3`, R`${3 * a}*sin(${a}*x)^2*cos(${a}*x)`, R`${3 * a}\sin^{2}(${ax})\cos(${ax})`, R`3*sin(${a}*x)^2*cos(${a}*x)`],
      expsin: [R`e^{\sin x}`, 'exp(sin(x))', 'cos(x)*exp(sin(x))', R`\cos x\, e^{\sin x}`, 'exp(sin(x))'],
      lncos: [R`\ln(\cos x)`, 'ln(cos(x))', '-tan(x)', R`-\tan x`, '1/cos(x)'],
      sqrtcubic: [R`\sqrt{1 + x^3}`, 'sqrt(1 + x^3)', '3*x^2/(2*sqrt(1 + x^3))', R`\frac{3x^2}{2\sqrt{1 + x^3}}`, '1/(2*sqrt(1+x^3))'],
      sinexp: [R`\sin\left(e^{${ax}}\right)`, R`sin(exp(${a}*x))`, R`${a}*exp(${a}*x)*cos(exp(${a}*x))`, R`${a}e^{${ax}}\cos\left(e^{${ax}}\right)`, R`cos(exp(${a}*x))`],
      lnln: [R`\ln(\ln x)`, 'ln(ln(x))', '1/(x*ln(x))', R`\frac{1}{x\ln x}`, '1/ln(x)'],
      nested: [R`\left(1 + \sin^2 x\right)^{${n}}`, R`(1 + sin(x)^2)^${n}`, R`${n}*(1 + sin(x)^2)^${n - 1}*2*sin(x)*cos(x)`, R`${2 * n}\sin x\cos x\left(1 + \sin^2 x\right)^{${n - 1}}`, R`${n}*(1 + sin(x)^2)^${n - 1}`]
    }[t];
    const dom = t === 'lnln' ? [1.3, 4] : t === 'lncos' ? [-1.2, 1.2] : t === 'sqrtlin' ? [0.2, 3] : t === 'sinexp' ? [-0.6, 0.6] : [-1.5, 1.5];
    return {
      q: R`Differentiate $f(x) = ${P[0]}$.`, a: A.expr(P[2], P[3], { dom }),
      hints: ['Chain rule: $\\dfrac{d}{dx}f(g(x)) = f\'(g(x))\\cdot g\'(x)$ — derivative of the outside (inside left alone) **times** derivative of the inside.', 'Identify the outer function and the inner function first.'],
      steps: [R`Outer derivative (inside unchanged), then multiply by the inner derivative.`, R`$f'(x) = ${P[3]}$.`],
      check: { deriv: P[1] },
      mistakes: [{ v: P[4], msg: 'Close! You differentiated the outside but forgot to multiply by the derivative of the **inside**.' }]
    };
  });

  def('deriv-trig', { title: 'Trig Derivatives', unit: 'derivs', desc: 'All six trig functions.' }, lv => {
    const D = { sin: ['cos(K)', '\\cos(K)'], cos: ['-sin(K)', '-\\sin(K)'], tan: ['sec(K)^2', '\\sec^2(K)'], sec: ['sec(K)*tan(K)', '\\sec(K)\\tan(K)'], csc: ['-csc(K)*cot(K)', '-\\csc(K)\\cot(K)'], cot: ['-csc(K)^2', '-\\csc^2(K)'] };
    if (lv === 3 && U.chance(0.5)) {
      const t = U.pick(['xtan', 'secsq', 'sinsec']);
      const P = {
        xtan: [R`x\tan x`, 'x*tan(x)', 'tan(x) + x*sec(x)^2', R`\tan x + x\sec^2 x`],
        secsq: [R`\sec^2 x`, 'sec(x)^2', '2*sec(x)^2*tan(x)', R`2\sec^2 x\tan x`],
        sinsec: [R`\frac{\sec x}{x}`, 'sec(x)/x', '(x*sec(x)*tan(x) - sec(x))/x^2', R`\frac{x\sec x\tan x - \sec x}{x^2}`]
      }[t];
      return { q: R`Differentiate $f(x) = ${P[0]}$.`, a: A.expr(P[2], P[3], { dom: [0.2, 1.3] }), hints: ['Combine trig derivatives with the product/quotient/chain rules.', '$\\frac{d}{dx}\\tan x = \\sec^2 x$, $\\frac{d}{dx}\\sec x = \\sec x\\tan x$.'], steps: [R`$f'(x) = ${P[3]}$.`], check: { deriv: P[1] } };
    }
    const fns = lv === 1 ? U.sample(['sin', 'cos', 'tan'], 2) : U.sample(['sin', 'cos', 'tan', 'sec', 'csc', 'cot'], 2);
    const k = lv === 1 ? 1 : U.int(1, 4);
    const K = k === 1 ? 'x' : k + 'x', Ks = k === 1 ? 'x' : '(' + k + '*x)';
    const cs = fns.map(() => U.nz(-5, 5));
    const ftex = T.join(fns.map((f, i) => T.term(cs[i], bs(f) + (k === 1 ? ' x' : '(' + K + ')'))));
    const fstr = fns.map((f, i) => `${cs[i]}*${f}(${Ks})`).join(' + ');
    const astr = fns.map((f, i) => `${cs[i] * k}*(${D[f][0].replace(/K/g, Ks)})`).join(' + ');
    const atex = T.join(fns.map((f, i) => { const dt = D[f][1].replace(/K/g, K); const neg = dt.startsWith('-'); return T.term(cs[i] * k * (neg ? -1 : 1), neg ? dt.slice(1) : dt); }));
    return {
      q: R`Differentiate $f(x) = ${ftex}$.`, a: A.expr(astr, atex, { dom: [0.15, 1.3] }),
      hints: ['$(\\sin)\' = \\cos$, $(\\cos)\' = -\\sin$, $(\\tan)\' = \\sec^2$, $(\\sec)\' = \\sec\\tan$, $(\\csc)\' = -\\csc\\cot$, $(\\cot)\' = -\\csc^2$.', k > 1 ? 'Chain rule: multiply by the derivative of $' + K + '$, which is $' + k + '$.' : 'The "co-" functions get a minus sign.'],
      steps: fns.map((f, i) => R`$\dfrac{d}{dx}\left[${cs[i]}${'\\' + (f)}(${K})\right] = ${cs[i] * k}\cdot ${D[f][1].replace(/K/g, K)}$.`).concat([R`$f'(x) = ${atex}$.`]),
      check: { deriv: fstr }
    };
  });

  def('deriv-explog', { title: 'Exponential & Log Derivatives', unit: 'derivs', desc: 'Exponentials, logarithms of any base, and logarithmic differentiation.' }, lv => {
    if (lv === 1) {
      const a = U.nz(-6, 6), b = U.nz(-6, 6), k = U.nz(-4, 4);
      return {
        q: R`Differentiate $f(x) = ${H.kx(a, `e^{${H.kx(k)}}`)} ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}\ln x$.`, a: A.expr(R`${a * k}*exp(${k}*x) + ${b}/x`, R`${a * k}e^{${H.kx(k)}} ${b < 0 ? '-' : '+'} \frac{${Math.abs(b)}}{x}`, { dom: [0.3, 2] }),
        hints: ['$\\frac{d}{dx}e^{kx} = ke^{kx}$ and $\\frac{d}{dx}\\ln x = \\frac1x$.'],
        steps: [R`$\frac{d}{dx}${H.kx(a, `e^{${H.kx(k)}}`)} = ${a * k}e^{${H.kx(k)}}$.`, R`$\frac{d}{dx}${b}\ln x = \frac{${b}}{x}$.`], check: { deriv: R`${a}*exp(${k}*x) + ${b}*ln(x)` }
      };
    }
    if (lv === 2) {
      const t = U.pick(['ax', 'logb', 'lnkx', 'xex']);
      const b = U.pick([2, 3, 5, 10]), k = U.int(2, 9);
      const P = {
        ax: [R`${b}^{x}`, R`${b}^x`, R`ln(${b})*${b}^x`, R`${b}^{x}\ln ${b}`, '$\\frac{d}{dx}a^x = a^x\\ln a$.'],
        logb: [R`\log_{${b}} x`, R`ln(x)/ln(${b})`, R`1/(x*ln(${b}))`, R`\frac{1}{x\ln ${b}}`, '$\\log_b x = \\frac{\\ln x}{\\ln b}$, so its derivative is $\\frac{1}{x\\ln b}$.'],
        lnkx: [R`\ln(${k}x)`, R`ln(${k}*x)`, '1/x', R`\frac{1}{x}`, R`$\ln(${k}x) = \ln ${k} + \ln x$ — the constant disappears!`],
        xex: [R`x^{${k}}e^{-x}`, R`x^${k}*exp(-x)`, R`x^${k - 1}*exp(-x)*(${k} - x)`, R`x^{${k - 1}}e^{-x}(${k} - x)`, 'Product rule with $(e^{-x})\' = -e^{-x}$.']
      }[t];
      return { q: R`Differentiate $f(x) = ${P[0]}$.`, a: A.expr(P[2], P[3], { dom: [0.3, 3] }), hints: [P[4]], steps: [P[4], R`$f'(x) = ${P[3]}$.`], check: { deriv: P[1] } };
    }
    const t = U.pick(['xx', 'xsin', 'logprops']);
    if (t === 'xx') return { q: R`Use logarithmic differentiation to find $\dfrac{d}{dx}\, x^{x}$.`, a: A.expr('x^x*(ln(x) + 1)', R`x^{x}(\ln x + 1)`, { dom: [0.3, 2.5] }), hints: ['Let $y = x^x$ and take $\\ln$: $\\ln y = x\\ln x$.', 'Differentiate implicitly: $\\frac{y\'}{y} = \\ln x + 1$.'], steps: [R`$\ln y = x\ln x \Rightarrow \dfrac{y'}{y} = \ln x + 1$.`, R`$y' = x^x(\ln x + 1)$.`], check: { deriv: 'x^x' } };
    if (t === 'xsin') return { q: R`Use logarithmic differentiation to find $\dfrac{d}{dx}\, x^{\sin x}$ for $x>0$.`, a: A.expr('x^sin(x)*(cos(x)*ln(x) + sin(x)/x)', R`x^{\sin x}\left(\cos x\ln x + \frac{\sin x}{x}\right)`, { dom: [0.3, 2.5] }), hints: ['$\\ln y = \\sin x\\,\\ln x$.', 'Product rule on the right side.'], steps: [R`$\dfrac{y'}{y} = \cos x\ln x + \dfrac{\sin x}{x}$.`, R`Multiply by $y = x^{\sin x}$.`], check: { deriv: 'x^sin(x)' } };
    const [p, q, r] = U.distinct(3, 1, 6); const m = U.int(2, 4);
    return {
      q: R`Differentiate $f(x) = \ln\left(\dfrac{(x + ${p})^{${m}}(x + ${q})}{x + ${r}}\right)$. (Hint: expand with log rules first.)`,
      a: A.expr(R`${m}/(x + ${p}) + 1/(x + ${q}) - 1/(x + ${r})`, R`\frac{${m}}{x + ${p}} + \frac{1}{x + ${q}} - \frac{1}{x + ${r}}`, { dom: [0, 3] }),
      hints: ['$\\ln\\frac{AB}{C} = \\ln A + \\ln B - \\ln C$ and $\\ln A^m = m\\ln A$.'],
      steps: [R`$f(x) = ${m}\ln(x+${p}) + \ln(x+${q}) - \ln(x+${r})$.`, R`$f'(x) = \dfrac{${m}}{x+${p}} + \dfrac{1}{x+${q}} - \dfrac{1}{x+${r}}$.`],
      check: { deriv: R`ln((x + ${p})^${m}*(x + ${q})/(x + ${r}))` }
    };
  });

  def('deriv-invtrig', { title: 'Inverse Trig Derivatives', unit: 'derivs', desc: 'arcsin, arccos, arctan and compositions.' }, lv => {
    const a = U.int(2, 5);
    const pool = lv === 1 ? ['asin', 'atan', 'acos'] : lv === 2 ? ['asinax', 'atanax', 'atanx2', 'atanlin'] : ['xatan', 'asinsqrt', 'atanexp', 'acosx2'];
    const t = U.pick(pool);
    const b = U.nz(-4, 4);
    const P = {
      asin: [R`\arcsin x`, 'arcsin(x)', '1/sqrt(1 - x^2)', R`\frac{1}{\sqrt{1 - x^2}}`, [-0.8, 0.8]],
      acos: [R`\arccos x`, 'arccos(x)', '-1/sqrt(1 - x^2)', R`-\frac{1}{\sqrt{1 - x^2}}`, [-0.8, 0.8]],
      atan: [R`\arctan x`, 'arctan(x)', '1/(1 + x^2)', R`\frac{1}{1 + x^2}`, [-2, 2]],
      asinax: [R`\arcsin(${a}x)`, R`arcsin(${a}*x)`, R`${a}/sqrt(1 - ${a * a}*x^2)`, R`\frac{${a}}{\sqrt{1 - ${a * a}x^2}}`, [-0.8 / a, 0.8 / a]],
      atanax: [R`\arctan(${a}x)`, R`arctan(${a}*x)`, R`${a}/(1 + ${a * a}*x^2)`, R`\frac{${a}}{1 + ${a * a}x^2}`, [-2, 2]],
      atanx2: [R`\arctan(x^2)`, 'arctan(x^2)', '2*x/(1 + x^4)', R`\frac{2x}{1 + x^4}`, [-2, 2]],
      atanlin: [R`\arctan(x ${T.signed(b)})`, R`arctan(x + ${b})`, R`1/(1 + (x + ${b})^2)`, R`\frac{1}{1 + (x ${T.signed(b)})^2}`, [-2, 2]],
      xatan: [R`x\arctan x`, 'x*arctan(x)', 'arctan(x) + x/(1 + x^2)', R`\arctan x + \frac{x}{1 + x^2}`, [-2, 2]],
      asinsqrt: [R`\arcsin(\sqrt{x})`, 'arcsin(sqrt(x))', '1/(2*sqrt(x)*sqrt(1 - x))', R`\frac{1}{2\sqrt{x}\sqrt{1 - x}}`, [0.1, 0.9]],
      atanexp: [R`\arctan(e^{x})`, 'arctan(exp(x))', 'exp(x)/(1 + exp(2*x))', R`\frac{e^{x}}{1 + e^{2x}}`, [-2, 2]],
      acosx2: [R`\arccos(x^2)`, 'arccos(x^2)', '-2*x/sqrt(1 - x^4)', R`-\frac{2x}{\sqrt{1 - x^4}}`, [-0.85, 0.85]]
    }[t];
    return {
      q: R`Differentiate $f(x) = ${P[0]}$.`, a: A.expr(P[2], P[3], { dom: P[4] }),
      hints: ['$\\frac{d}{dx}\\arcsin u = \\frac{u\'}{\\sqrt{1-u^2}}$, $\\frac{d}{dx}\\arccos u = -\\frac{u\'}{\\sqrt{1-u^2}}$, $\\frac{d}{dx}\\arctan u = \\frac{u\'}{1+u^2}$.'],
      steps: [R`Identify $u$ and $u'$, then apply the formula.`, R`$f'(x) = ${P[3]}$.`], check: { deriv: P[1] }
    };
  });

  def('implicit', { title: 'Implicit Differentiation', unit: 'derivs', desc: 'dy/dx for curves defined by equations.' }, lv => {
    let terms;
    if (lv === 1) { terms = [[1, 2, 0], [1, 0, 2]]; }
    else if (lv === 2) { terms = [[U.nz(-3, 3), 2, 0], [U.nz(-4, 4), 1, 1], [U.nz(-3, 3), 0, 2]]; }
    else terms = U.pick([[[1, 3, 0], [1, 0, 3], [U.nz(-4, 4), 1, 1]], [[1, 2, 1], [1, 0, 3]], [[U.nz(-3, 3), 1, 2], [1, 3, 1]], [[1, 2, 2], [U.nz(-3, 3), 1, 0], [U.nz(-3, 3), 0, 1]]]);
    let x0, y0;
    if (lv === 1) [x0, y0] = U.pick([[3, 4], [4, 3], [5, 12], [12, 5], [6, 8], [8, 6], [1, 1], [2, 2]]).map(v => v * U.sign());
    else { x0 = U.nz(-3, 3); y0 = U.nz(-3, 3); }
    const ev = (i, j) => Math.pow(x0, i) * Math.pow(y0, j);
    const d = terms.reduce((s, [c, i, j]) => s + c * ev(i, j), 0);
    const Fx = terms.reduce((s, [c, i, j]) => s + (i ? c * i * ev(i - 1, j) : 0), 0);
    const Fy = terms.reduce((s, [c, i, j]) => s + (j ? c * j * ev(i, j - 1) : 0), 0);
    if (Fy === 0) return null;
    const m = F(-Fx, Fy);
    const termT = (c, i, j) => T.term(c, (i ? T.pw('x', i) : '') + (j ? T.pw('y', j) : ''));
    const eq = T.join(terms.map(([c, i, j]) => termT(c, i, j)));
    const dTerm = ([c, i, j]) => {
      const parts = [];
      if (i) parts.push(T.term(c * i, (i - 1 ? T.pw('x', i - 1) : '') + (j ? T.pw('y', j) : '')));
      if (j) parts.push(T.term(c * j, (i ? T.pw('x', i) : '') + (j - 1 ? T.pw('y', j - 1) : '') + "y'"));
      return parts;
    };
    return {
      q: R`Find $\dfrac{dy}{dx}$ at the point $(${x0}, ${y0})$ on the curve $${eq} = ${d}$.`, a: A.num(m),
      hints: ['Differentiate both sides with respect to $x$, treating $y$ as a function of $x$: $\\frac{d}{dx}y^n = ny^{n-1}y\'$.', 'Use the product rule on mixed terms like $xy$. Then plug in the point and solve for $y\'$.'],
      steps: [R`$\dfrac{d}{dx}$: $${T.join(terms.flatMap(dTerm))} = 0$.`, R`Group: $y'\cdot(\text{stuff}) = -(\text{rest})$, so $y' = -\dfrac{F_x}{F_y}$.`, R`At $(${x0}, ${y0})$: $y' = -\dfrac{${Fx}}{${Fy}} = ${m.tex()}$.`],
      check: { value: -Fx / Fy }
    };
  });

  def('tangent-line', { title: 'Tangent Lines', unit: 'derivs', desc: 'Equation of the tangent line y = mx + b.' }, lv => {
    let f, fs, x0, y0, m, ftex, steps0;
    if (lv <= 2) {
      const terms = lv === 1 ? [[U.nz(-3, 3), 2], [U.int(-5, 5), 1], [U.int(-5, 5), 0]] : [[U.nz(-2, 2), 3], [U.int(-3, 3), 2], [U.int(-4, 4), 1], [U.int(-5, 5), 0]];
      x0 = U.int(-2, 2);
      y0 = poly.evalF(terms, x0); m = poly.evalF(poly.d(terms), x0);
      ftex = T.poly(terms); fs = S.poly(terms);
      steps0 = [R`$f'(x) = ${T.poly(poly.d(terms))}$, so $m = f'(${x0}) = ${m.tex()}$.`, R`$f(${x0}) = ${y0.tex()}$.`];
    } else {
      const t = U.pick(['ln', 'exp', 'sqrt', 'recip']);
      const k = U.int(2, 4);
      if (t === 'ln') { ftex = '\\ln x'; fs = 'ln(x)'; x0 = 1; y0 = F(0); m = F(1); }
      if (t === 'exp') { ftex = 'e^{' + k + 'x}'; fs = `exp(${k}*x)`; x0 = 0; y0 = F(1); m = F(k); }
      if (t === 'sqrt') { ftex = '\\sqrt{x}'; fs = 'sqrt(x)'; x0 = k * k; y0 = F(k); m = F(1, 2 * k); }
      if (t === 'recip') { ftex = '\\frac{1}{x}'; fs = '1/x'; x0 = k; y0 = F(1, k); m = F(-1, k * k); }
      steps0 = [R`$m = f'(${x0}) = ${m.tex()}$.`, R`$f(${x0}) = ${y0.tex()}$.`];
    }
    const b = y0.sub(m.mul(x0));
    return {
      q: R`Find the equation of the tangent line to $y = ${ftex}$ at $x = ${x0}$. Enter it as $y = mx + b$.`,
      a: A.expr(R`${m.str()}*x + ${b.str()}`, 'y = ' + T.lin(m, b)),
      hints: ['The slope of the tangent line is $f\'(a)$.', 'Point-slope form: $y - f(a) = f\'(a)(x - a)$.'],
      steps: [...steps0, R`$y - ${y0.tex()} = ${m.tex()}(x - ${x0 < 0 ? '(' + x0 + ')' : x0})$, i.e. $y = ${T.lin(m, b)}$.`],
      graph: { fns: [{ f: fs }, { f: R`${m.str()}*x + ${b.str()}`, dash: true, color: 2 }], points: [[x0, y0.v]], x: [x0 - 4, x0 + 4], y: [y0.v - 5, y0.v + 5] }
    };
  });

  /* ================= APPLICATIONS OF DERIVATIVES ================= */

  def('related-rates', { title: 'Related Rates', unit: 'apps', desc: 'Rates of change linked by an equation.' }, lv => {
    const t = U.pick(lv === 1 ? ['circle', 'square'] : lv === 2 ? ['ladder', 'sphere', 'circle'] : ['cone', 'shadow', 'ladder']);
    const hintsBase = ['1) Write an equation relating the quantities. 2) Differentiate both sides with respect to $t$. 3) Plug in the numbers **after** differentiating.'];
    if (t === 'circle') {
      const r = U.int(2, 12), v = U.int(1, 5);
      return { q: R`The radius of a circular ripple grows at $${v}$ cm/s. How fast is the area increasing when $r = ${r}$ cm? (cm²/s)`, a: A.num(2 * Math.PI * r * v, R`${2 * r * v}\pi`), hints: hintsBase.concat(['$A = \\pi r^2 \\Rightarrow \\frac{dA}{dt} = 2\\pi r\\frac{dr}{dt}$.']), steps: [R`$\dfrac{dA}{dt} = 2\pi r\dfrac{dr}{dt}$.`, R`$= 2\pi(${r})(${v}) = ${2 * r * v}\pi$ cm²/s.`] };
    }
    if (t === 'square') {
      const s = U.int(2, 15), v = U.int(1, 6);
      return { q: R`Each side of a square grows at $${v}$ in/min. How fast is the area growing when the side is $${s}$ in? (in²/min)`, a: A.num(2 * s * v), hints: hintsBase.concat(['$A = s^2$.']), steps: [R`$\dfrac{dA}{dt} = 2s\dfrac{ds}{dt} = 2(${s})(${v}) = ${2 * s * v}$.`] };
    }
    if (t === 'sphere') {
      const r = U.int(2, 6), Q = U.pick([8, 16, 20, 36, 50, 100]);
      const f = F(Q, 4 * r * r);
      return { q: R`Air is pumped into a spherical balloon at $${Q}$ cm³/s. How fast is the radius increasing when $r = ${r}$ cm? (cm/s)`, a: A.num(f.v / Math.PI, f.d === 1 ? R`\frac{${f.n}}{\pi}` : R`\frac{${f.n}}{${f.d}\pi}`), hints: hintsBase.concat(['$V = \\frac43\\pi r^3 \\Rightarrow \\frac{dV}{dt} = 4\\pi r^2\\frac{dr}{dt}$.']), steps: [R`$${Q} = 4\pi(${r})^2\dfrac{dr}{dt}$.`, R`$\dfrac{dr}{dt} = \dfrac{${Q}}{${4 * r * r}\pi} = ${f.d === 1 ? '\\frac{' + f.n + '}{\\pi}' : '\\frac{' + f.n + '}{' + f.d + '\\pi}'}$ cm/s.`] };
    }
    if (t === 'ladder') {
      const [a, b, c] = U.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]]); const v = U.int(1, 4);
      const dy = F(-a * v, b);
      return { q: R`A ${c} ft ladder leans against a wall. Its base slides away from the wall at $${v}$ ft/s. How fast is the top sliding **down** the wall when the base is $${a}$ ft from the wall? (Give $\frac{dy}{dt}$, which is negative.)`, a: A.num(dy), hints: hintsBase.concat(['$x^2 + y^2 = ' + c + '^2$.', 'When $x = ' + a + '$, find $y$ with the Pythagorean theorem.']), steps: [R`$2x\dfrac{dx}{dt} + 2y\dfrac{dy}{dt} = 0$.`, R`$y = \sqrt{${c * c} - ${a * a}} = ${b}$.`, R`$\dfrac{dy}{dt} = -\dfrac{x}{y}\dfrac{dx}{dt} = -\dfrac{${a}}{${b}}(${v}) = ${dy.tex()}$ ft/s.`] };
    }
    if (t === 'cone') {
      const Rr = U.int(2, 5), Hh = Rr * U.int(2, 3), Q = U.pick([2, 3, 5, 8, 10]), h = U.int(2, Hh - 1);
      const f = F(Q * Hh * Hh, Rr * Rr * h * h);
      return { q: R`Water pours into an inverted conical tank (vertex down) of height ${Hh} m and top radius ${Rr} m at $${Q}$ m³/min. How fast is the water level rising when the water is $${h}$ m deep? (m/min)`, a: A.num(f.v / Math.PI, R`\frac{${f.n}}{${f.d}\pi}`.replace('{1\\pi}', '{\\pi}')), hints: hintsBase.concat(['Similar triangles: $\\frac{r}{h} = \\frac{' + Rr + '}{' + Hh + '}$. Use it to eliminate $r$.', '$V = \\frac13\\pi r^2 h$.']), steps: [R`$r = ${F(Rr, Hh).tex()}h \Rightarrow V = \frac{1}{3}\pi\left(${F(Rr, Hh).tex()}\right)^2 h^3$.`, R`$\dfrac{dV}{dt} = \pi\left(${F(Rr, Hh).tex()}\right)^2 h^2\dfrac{dh}{dt}$.`, R`$\dfrac{dh}{dt} = \dfrac{${Q}}{\pi\cdot ${F(Rr * Rr, Hh * Hh).tex()}\cdot ${h * h}} = ${f.tex().replace(/}$/, '\\pi}').replace(/^(\d+)$/, '\\frac{$1}{\\pi}')}$.`] };
    }
    const Lh = U.pick([12, 15, 16, 18, 20]), p = U.pick([5, 6]), v = U.int(2, 5);
    const sp = F(Lh * v, Lh - p);
    return { q: R`A ${p} ft tall person walks away from a ${Lh} ft lamppost at $${v}$ ft/s. How fast is the **tip** of their shadow moving? (ft/s)`, a: A.num(sp), hints: hintsBase.concat(['Let $x$ = person\'s distance from the post, $s$ = shadow length. Similar triangles: $\\frac{' + Lh + '}{x + s} = \\frac{' + p + '}{s}$.', 'The tip is at position $x + s$.']), steps: [R`$${Lh}s = ${p}(x + s) \Rightarrow s = ${F(p, Lh - p).tex()}x$.`, R`Tip: $x + s = ${F(Lh, Lh - p).tex()}x$, so its speed is $${F(Lh, Lh - p).tex()}\cdot ${v} = ${sp.tex()}$ ft/s.`] };
  });

  def('critical-points', { title: 'Extrema & Critical Points', unit: 'apps', desc: 'Find and classify critical points; absolute extrema.' }, lv => {
    let [p, q] = U.distinct(2, -4, 4).sort((a, b) => a - b);
    if ((p + q) % 2) q += 1; if (p === q) return null;
    const c = U.int(-6, 6);
    const terms = [[1, 3], [F(-3 * (p + q), 2), 2], [3 * p * q, 1], [c, 0]];
    const fx = T.poly(terms), dfx = R`3(${H.shift(p)})(${H.shift(q)})`;
    const f = x => poly.evalF(terms, x);
    if (lv === 1) {
      return { q: R`Find all critical numbers of $f(x) = ${fx}$.`, a: A.set([p, q]), hints: ['Critical numbers: where $f\'(x) = 0$ or is undefined.', R`$f'(x) = ${T.poly(poly.d(terms))}$. Factor it.`], steps: [R`$f'(x) = ${T.poly(poly.d(terms))} = ${dfx}$.`, R`$f'(x) = 0 \Rightarrow x = ${p}, ${q}$.`], graph: { fns: [{ f: S.poly(terms) }], x: [p - 3, q + 3], y: [Math.min(f(p).v, f(q).v) - 8, Math.max(f(p).v, f(q).v) + 8] } };
    }
    if (lv === 2) {
      const ask = U.pick(['max', 'min', 'infl']);
      const ans = ask === 'max' ? p : ask === 'min' ? q : F(p + q, 2);
      return {
        q: R`For $f(x) = ${fx}$, at what $x$ does $f$ have a **${ask === 'max' ? 'local maximum' : ask === 'min' ? 'local minimum' : 'point of inflection'}**?`, a: A.num(ans),
        hints: [R`$f'(x) = ${dfx}$.`, ask === 'infl' ? "Inflection points: where $f''$ changes sign. $f''(x) = 6x - " + 3 * (p + q) + '$.' : 'First-derivative test: max where $f\'$ goes $+\\to-$, min where $-\\to+$.'],
        steps: ask === 'infl' ? [R`$f''(x) = 6x ${T.signed(-3 * (p + q))} = 0 \Rightarrow x = ${F(p + q, 2).tex()}$.`] : [R`Critical numbers: $${p}$ and $${q}$.`, R`$f'$ is positive left of $${p}$, negative between, positive right of $${q}$.`, R`So local max at $x = ${p}$ and local min at $x = ${q}$.`]
      };
    }
    const a = p - U.int(1, 2), b = q + U.int(0, 2);
    const cands = [a, b, p, q].filter(x => x >= a && x <= b);
    const vals = cands.map(x => [x, f(x)]);
    const which = U.pick(['max', 'min']);
    const best = vals.reduce((m, v) => (which === 'max' ? v[1].v > m[1].v : v[1].v < m[1].v) ? v : m);
    return {
      q: R`Find the **absolute ${which}imum value** of $f(x) = ${fx}$ on $[${a}, ${b}]$.`, a: A.num(best[1]),
      hints: ['Closed interval method: evaluate $f$ at the critical numbers inside the interval **and** at the endpoints.', R`$f'(x) = ${dfx}$.`],
      steps: [R`Candidates: ${vals.map(([x, v]) => '$f(' + x + ') = ' + v.tex() + '$').join(', ')}.`, R`The ${which === 'max' ? 'largest' : 'smallest'} is $${best[1].tex()}$.`]
    };
  });

  def('mvt', { title: 'Mean Value Theorem', unit: 'apps', desc: 'Find c with f\'(c) = average rate of change.' }, lv => {
    const hint = ['MVT: there is a $c$ in $(a,b)$ with $f\'(c) = \\dfrac{f(b)-f(a)}{b-a}$.'];
    if (lv === 1) {
      const b0 = U.int(-5, 5), a = U.int(-4, 2), b = a + U.int(2, 6);
      const c = F(a + b, 2);
      return { q: R`Find the value $c$ guaranteed by the Mean Value Theorem for $f(x) = x^2 ${T.signed(b0)}x$ on $[${a}, ${b}]$.`, a: A.num(c), hints: hint, steps: [R`Average slope: $\dfrac{f(${b}) - f(${a})}{${b - a}} = ${a + b + b0}$.`, R`$f'(c) = 2c ${T.signed(b0)} = ${a + b + b0} \Rightarrow c = ${c.tex()}$.`] };
    }
    if (lv === 2) {
      const k = U.int(1, 6);
      return { q: R`Find the value $c$ guaranteed by the MVT for $f(x) = x^3$ on $[0, ${k}]$.`, a: A.num(k / Math.sqrt(3), R`\frac{${k}}{\sqrt{3}}`), hints: hint, steps: [R`Average slope $= \dfrac{${k ** 3}}{${k}} = ${k * k}$.`, R`$3c^2 = ${k * k} \Rightarrow c = \dfrac{${k}}{\sqrt{3}}$ (positive root, since $c \in (0, ${k})$).`] };
    }
    if (U.chance()) {
      const [a, b] = U.distinct(2, 1, 6).sort((x, y) => x - y);
      const c = F((a + b) * (a + b), 4);
      return { q: R`Find $c$ from the MVT for $f(x) = \sqrt{x}$ on $[${a * a}, ${b * b}]$.`, a: A.num(c), hints: hint, steps: [R`Average slope $= \dfrac{${b} - ${a}}{${b * b} - ${a * a}} = \dfrac{1}{${a + b}}$.`, R`$\dfrac{1}{2\sqrt{c}} = \dfrac{1}{${a + b}} \Rightarrow \sqrt{c} = ${F(a + b, 2).tex()} \Rightarrow c = ${c.tex()}$.`] };
    }
    const [a, b] = U.pick([[1, 4], [2, 8], [1, 9], [4, 9], [3, 12], [2, 18], [1, 16]]);
    const c = Math.sqrt(a * b);
    return { q: R`Find $c$ from the MVT for $f(x) = \dfrac{1}{x}$ on $[${a}, ${b}]$.`, a: A.num(c), hints: hint, steps: [R`Average slope $= \dfrac{\frac{1}{${b}} - \frac{1}{${a}}}{${b - a}} = -\dfrac{1}{${a * b}}$.`, R`$-\dfrac{1}{c^2} = -\dfrac{1}{${a * b}} \Rightarrow c = ${c}$.`] };
  });

  def('optimization', { title: 'Optimization', unit: 'apps', desc: 'Maximize or minimize real-world quantities.' }, lv => {
    const base = ['1) Write the quantity to optimize. 2) Use the constraint to get one variable. 3) Set the derivative to zero. 4) Check it\'s a max/min.'];
    const t = U.pick(lv === 1 ? ['product', 'rect'] : lv === 2 ? ['river', 'box', 'boxx'] : ['recip', 'parab', 'can']);
    if (t === 'product') { const S2 = 2 * U.int(4, 30); return { q: R`Two positive numbers add to $${S2}$. What is the largest possible product?`, a: A.num(S2 * S2 / 4), hints: base.concat(['$P = x(' + S2 + ' - x)$.']), steps: [R`$P(x) = ${S2}x - x^2$, $P'(x) = ${S2} - 2x = 0 \Rightarrow x = ${S2 / 2}$.`, R`$P = ${S2 / 2}\cdot ${S2 / 2} = ${S2 * S2 / 4}$.`] }; }
    if (t === 'rect') { const P = 4 * U.int(5, 40); return { q: R`A rectangle has perimeter $${P}$ m. What is its maximum possible area (m²)?`, a: A.num((P / 4) ** 2), hints: base.concat(['$2x + 2y = ' + P + '$, area $= xy$.']), steps: [R`$y = ${P / 2} - x$, $A = x(${P / 2} - x)$.`, R`$A' = ${P / 2} - 2x = 0 \Rightarrow x = ${P / 4}$ (a square!). $A = ${(P / 4) ** 2}$.`] }; }
    if (t === 'river') { const L = 4 * U.int(20, 150); return { q: R`A farmer has $${L}$ ft of fence to enclose a rectangle along a straight river (no fence needed on the river side). What is the maximum area (ft²)?`, a: A.num(L * L / 8), hints: base.concat(['Let $x$ = sides perpendicular to the river: $2x + y = ' + L + '$.']), steps: [R`$A = x(${L} - 2x)$, $A' = ${L} - 4x = 0 \Rightarrow x = ${L / 4}$.`, R`$y = ${L / 2}$, $A = ${L / 4}\cdot ${L / 2} = ${L * L / 8}$.`] }; }
    if (t === 'box' || t === 'boxx') {
      const s = 6 * U.int(1, 6);
      if (t === 'boxx') return { q: R`An open-top box is made from a $${s}\times${s}$ inch square sheet by cutting equal squares of side $x$ from each corner and folding up. What $x$ maximizes the volume?`, a: A.num(s / 6), hints: base.concat(['$V = x(' + s + ' - 2x)^2$.']), steps: [R`$V'(x) = (${s} - 2x)^2 - 4x(${s} - 2x) = (${s} - 2x)(${s} - 6x)$.`, R`$x = ${s / 6}$ (the other root $x = ${s / 2}$ gives zero volume).`] };
      return { q: R`An open-top box is made from a $${s}\times${s}$ inch square sheet by cutting equal squares from the corners. What is the maximum volume (in³)?`, a: A.num(2 * s ** 3 / 27), hints: base.concat(['$V = x(' + s + ' - 2x)^2$; the best cut is $x = s/6$.']), steps: [R`$V'(x) = (${s} - 2x)(${s} - 6x) = 0 \Rightarrow x = ${s / 6}$.`, R`$V = ${s / 6}(${s - s / 3})^2 = ${2 * s ** 3 / 27}$.`] };
    }
    if (t === 'recip') { const k = U.int(2, 12) ** 2; return { q: R`Find the minimum value of $f(x) = x + \dfrac{${k}}{x}$ for $x > 0$.`, a: A.num(2 * Math.sqrt(k)), hints: base, steps: [R`$f'(x) = 1 - \dfrac{${k}}{x^2} = 0 \Rightarrow x = ${Math.sqrt(k)}$.`, R`$f(${Math.sqrt(k)}) = ${Math.sqrt(k)} + ${Math.sqrt(k)} = ${2 * Math.sqrt(k)}$.`] }; }
    if (t === 'parab') { const a = U.int(2, 9); const d2 = 4 * a - 1; return { q: R`What is the minimum distance from the point $(0, ${a})$ to the parabola $y = x^2$?`, a: A.num(Math.sqrt(a - 0.25), R`\frac{\sqrt{${d2}}}{2}`), hints: base.concat(['Minimize the **squared** distance $D = x^2 + (x^2 - ' + a + ')^2$ — easier, same minimizer.']), steps: [R`Let $u = x^2$: $D = u + (u - ${a})^2$, $D' = 1 + 2(u - ${a}) = 0 \Rightarrow u = ${F(2 * a - 1, 2).tex()}$.`, R`$D = ${F(2 * a - 1, 2).tex()} + \frac14 = ${F(4 * a - 1, 4).tex()}$, distance $= \dfrac{\sqrt{${d2}}}{2}$.`] }; }
    const k = U.int(1, 5);
    return { q: R`A closed cylindrical can must hold $${2 * k ** 3}\pi$ cm³. What is the minimum possible surface area (cm²)?`, a: A.num(6 * Math.PI * k * k, R`${6 * k * k}\pi`), hints: base.concat(['$V = \\pi r^2h$, $S = 2\\pi r^2 + 2\\pi rh$. Eliminate $h$.']), steps: [R`$h = \dfrac{${2 * k ** 3}}{r^2}$, $S(r) = 2\pi r^2 + \dfrac{${4 * k ** 3}\pi}{r}$.`, R`$S'(r) = 4\pi r - \dfrac{${4 * k ** 3}\pi}{r^2} = 0 \Rightarrow r = ${k}$, $h = ${2 * k}$.`, R`$S = 2\pi(${k * k}) + 2\pi(${k})(${2 * k}) = ${6 * k * k}\pi$.`] };
  });

  def('linear-approx', { title: 'Linear Approximation', unit: 'apps', desc: 'Approximate values with tangent lines.' }, lv => {
    const hint = ['$L(x) = f(a) + f\'(a)(x - a)$ — use a nearby $a$ where $f(a)$ is easy.'];
    if (lv === 1) {
      const n = U.int(2, 10), d = U.pick([1, 2, 3, -1, -2]);
      const v = F(n).add(F(d, 2 * n));
      return { q: R`Use linear approximation to estimate $\sqrt{${n * n + d}}$. Give the exact value of the approximation (fraction or decimal).`, a: A.num(v), hints: hint.concat(['$f(x) = \\sqrt x$, $a = ' + n * n + '$, $f\'(a) = \\frac{1}{2\\sqrt a}$.']), steps: [R`$L(x) = ${n} + \dfrac{1}{${2 * n}}(x - ${n * n})$.`, R`$L(${n * n + d}) = ${n} + \dfrac{${d}}{${2 * n}} = ${v.tex()}$.`] };
    }
    if (lv === 2) {
      const t = U.pick(['cbrt', 'exp', 'ln']);
      if (t === 'cbrt') { const n = U.int(2, 5), d = U.pick([1, 2, -1, -2]); const v = F(n).add(F(d, 3 * n * n)); return { q: R`Use linear approximation to estimate $\sqrt[3]{${n ** 3 + d}}$.`, a: A.num(v), hints: hint.concat(['$f\'(x) = \\frac{1}{3}x^{-2/3}$.']), steps: [R`$a = ${n ** 3}$, $f(a) = ${n}$, $f'(a) = \dfrac{1}{${3 * n * n}}$.`, R`$L = ${n} + \dfrac{${d}}{${3 * n * n}} = ${v.tex()}$.`] }; }
      if (t === 'exp') { const h = F(U.nz(-9, 9), 100); return { q: R`Use the linearization of $e^x$ at $0$ to estimate $e^{${h.v}}$.`, a: A.num(F(1).add(h)), hints: hint.concat(['At $a=0$: $L(x) = 1 + x$.']), steps: [R`$L(x) = 1 + x$.`, R`$e^{${h.v}} \approx 1 + ${h.v} = ${1 + h.v}$.`] }; }
      const h = F(U.nz(-9, 9), 100); return { q: R`Use the linearization of $\ln x$ at $1$ to estimate $\ln(${1 + h.v})$.`, a: A.num(h), hints: hint.concat(['At $a = 1$: $L(x) = x - 1$.']), steps: [R`$L(x) = 0 + 1\cdot(x - 1)$.`, R`$\ln(${1 + h.v}) \approx ${h.v}$.`] };
    }
    const a = U.int(2, 6);
    return { q: R`Find the linearization $L(x)$ of $f(x) = \sqrt{x}$ at $a = ${a * a}$.`, a: A.expr(R`${a} + (x - ${a * a})/${2 * a}`, R`${a} + \frac{1}{${2 * a}}(x - ${a * a})`), hints: hint, steps: [R`$f(${a * a}) = ${a}$, $f'(${a * a}) = \dfrac{1}{2\sqrt{${a * a}}} = \dfrac{1}{${2 * a}}$.`, R`$L(x) = ${a} + \dfrac{1}{${2 * a}}(x - ${a * a})$.`] };
  });

  def('lhopital', { title: "L'Hôpital's Rule", unit: 'apps', desc: 'Indeterminate forms 0/0, ∞/∞, 0·∞ and 1 to the ∞.' }, lv => {
    const a = U.nz(-5, 5), b = U.nz(-5, 5), n = U.int(2, 6);
    const pool = lv === 1 ? ['expm1', 'lnx1', 'xn'] : lv === 2 ? ['sincube', 'expx2', 'xlnx', 'xexp', 'lnoverx'] : ['onepow', 'expquad', 'xtox', 'tanx'];
    const t = U.pick(pool);
    const P = {
      expm1: [R`\lim_{x\to0}\frac{e^{${H.kx(a)}} - 1}{${H.kx(b)}}`, F(a, b), R`(exp(${a}*x) - 1)/(${b}*x)`, 0, '\\frac{0}{0}', R`Differentiate top and bottom: $\dfrac{${a}e^{${H.kx(a)}}}{${b}} \to \dfrac{${a}}{${b}}$.`],
      lnx1: [R`\lim_{x\to1}\frac{\ln x}{x^{${n}} - 1}`, F(1, n), R`ln(x)/(x^${n} - 1)`, 1, '\\frac{0}{0}', R`$\dfrac{1/x}{${n}x^{${n - 1}}} \to \dfrac{1}{${n}}$.`],
      xn: [R`\lim_{x\to1}\frac{x^{${n}} - 1}{x - 1}`, F(n), R`(x^${n} - 1)/(x - 1)`, 1, '\\frac{0}{0}', R`$\dfrac{${n}x^{${n - 1}}}{1} \to ${n}$.`],
      sincube: [R`\lim_{x\to0}\frac{\sin(${H.kx(a)}) - ${H.kx(a)}}{x^3}`, F(-(a ** 3), 6), R`(sin(${a}*x) - ${a}*x)/x^3`, 0, '\\frac{0}{0}', R`Apply L'Hôpital three times: $\dfrac{-${a ** 3 < 0 ? '(' + a ** 3 + ')' : a ** 3}\cos(${H.kx(a)})}{6} \to ${F(-(a ** 3), 6).tex()}$.`],
      expx2: [R`\lim_{x\to0}\frac{e^{x} - 1 - x}{x^2}`, F(1, 2), R`(exp(x) - 1 - x)/x^2`, 0, '\\frac{0}{0}', R`Twice: $\dfrac{e^x - 1}{2x} \to \dfrac{e^x}{2} \to \dfrac{1}{2}$.`],
      xlnx: [R`\lim_{x\to0^+} x^{${n}}\ln x`, F(0), R`x^${n}*ln(x)`, 0, '0\\cdot(-\\infty)', R`Rewrite as $\dfrac{\ln x}{x^{-${n}}}$ ($\frac{\infty}{\infty}$): $\dfrac{1/x}{-${n}x^{-${n + 1}}} = -\dfrac{x^{${n}}}{${n}} \to 0$.`, '+'],
      xexp: [R`\lim_{x\to\infty} x^{${n}}e^{-x}`, F(0), R`x^${n}*exp(-x)`, Infinity, '\\infty\\cdot 0', R`Write as $\dfrac{x^{${n}}}{e^x}$ and apply L'Hôpital ${n} times: $\dfrac{${n}!}{e^x} \to 0$.`],
      lnoverx: [R`\lim_{x\to\infty}\frac{\ln x}{x^{1/${n}}}`, F(0), R`ln(x)/x^(1/${n})`, Infinity, '\\frac{\\infty}{\\infty}', R`$\dfrac{1/x}{\frac{1}{${n}}x^{1/${n} - 1}} = \dfrac{${n}}{x^{1/${n}}} \to 0$.`],
      onepow: [R`\lim_{x\to\infty}\left(1 + \frac{${a}}{x}\right)^{${H.kx(b)}}`, null, R`(1 + ${a}/x)^(${b}*x)`, Infinity, '1^\\infty', R`$\ln y = ${b}x\ln\left(1 + \frac{${a}}{x}\right) \to ${a * b}$ (L'Hôpital), so $y \to e^{${a * b}}$.`],
      expquad: [R`\lim_{x\to0}\frac{1 - \cos(${H.kx(a)})}{x^2}`, F(a * a, 2), R`(1 - cos(${a}*x))/x^2`, 0, '\\frac{0}{0}', R`Twice: $\dfrac{${a}\sin(${H.kx(a)})}{2x} \to \dfrac{${a * a}\cos(${H.kx(a)})}{2} \to ${F(a * a, 2).tex()}$.`],
      xtox: [R`\lim_{x\to0^+} x^{x}`, F(1), 'x^x', 0, '0^0', R`$\ln y = x\ln x \to 0$ (L'Hôpital), so $y \to e^0 = 1$.`, '+'],
      tanx: [R`\lim_{x\to0}\frac{\tan(${H.kx(a)}) - ${H.kx(a)}}{x^3}`, F(a ** 3, 3), R`(tan(${a}*x) - ${a}*x)/x^3`, 0, '\\frac{0}{0}', R`Using $\tan u \approx u + \frac{u^3}{3}$ (or L'Hôpital three times): $\dfrac{(${a}x)^3}{3x^3} = ${F(a ** 3, 3).tex()}$.`]
    }[t];
    let ans = P[1] ? A.num(P[1]) : A.num(Math.exp(a * b), R`e^{${a * b}}`);
    return {
      q: R`Evaluate $\displaystyle ${P[0]}$.`, a: ans,
      hints: [R`Check the form first: it's $${P[4]}$.`, "L'Hôpital: for $\\frac00$ or $\\frac{\\infty}{\\infty}$, $\\lim\\frac{f}{g} = \\lim\\frac{f'}{g'}$. Other forms ($0\\cdot\\infty$, $1^\\infty$, $0^0$) must be rewritten first — use $\\ln$ for powers."],
      steps: [R`Form: $${P[4]}$.`, P[5]], check: t === 'lnoverx' ? null : { limit: [P[2], P[3], P[6] || ''] }
    };
  });

  /* ================= INTEGRALS ================= */

  def('riemann', { title: 'Riemann Sums', unit: 'integrals', desc: 'Left, right, midpoint and trapezoid sums.' }, lv => {
    const terms = [[U.pick([1, -1, 1, 2]), 2], [U.int(-3, 3), 1], [U.int(0, 6), 0]];
    const n = lv === 1 ? U.pick([2, 3, 4]) : U.pick([3, 4, 5, 6]);
    const dx = U.pick([F(1), F(1, 2), F(2)]);
    const a = U.int(-2, 2), b = F(a).add(dx.mul(n));
    const methods = lv === 1 ? ['left', 'right'] : lv === 2 ? ['left', 'right', 'midpoint'] : ['midpoint', 'trapezoid', 'right'];
    const m = U.pick(methods);
    const f = x => poly.evalF(terms, x);
    let sum = new Frac(0); const rects = []; const samples = [];
    for (let i = 0; i < n; i++) {
      const x0 = F(a).add(dx.mul(i)), x1 = x0.add(dx);
      if (m === 'trapezoid') { const y0 = f(x0), y1 = f(x1); sum = sum.add(y0.add(y1).div(2).mul(dx)); rects.push({ x0: x0.v, x1: x1.v, y0: y0.v, y1: y1.v }); }
      else { const xs = m === 'left' ? x0 : m === 'right' ? x1 : x0.add(x1).div(2); const y = f(xs); samples.push([xs, y]); sum = sum.add(y.mul(dx)); rects.push({ x0: x0.v, x1: x1.v, y: y.v }); }
    }
    const ys = rects.map(r => r.y !== undefined ? r.y : Math.max(r.y0, r.y1));
    return {
      q: R`Approximate $\displaystyle\int_{${a}}^{${b.tex()}} \left(${T.poly(terms)}\right)dx$ using a **${m}** ${m === 'trapezoid' ? 'rule' : 'Riemann sum'} with $n = ${n}$ subintervals.`, a: A.num(sum),
      hints: [R`$\Delta x = \dfrac{b-a}{n} = ${dx.tex()}$.`, m === 'trapezoid' ? 'Trapezoid: $\\frac{\\Delta x}{2}[f(x_0) + 2f(x_1) + \\dots + 2f(x_{n-1}) + f(x_n)]$.' : `Use the ${m === 'left' ? 'left endpoint' : m === 'right' ? 'right endpoint' : 'midpoint'} of each subinterval as the sample point.`],
      steps: m === 'trapezoid' ? [R`$\Delta x = ${dx.tex()}$; endpoints ${U.range(0, n).map(i => '$' + F(a).add(dx.mul(i)).tex() + '$').join(', ')}.`, R`Sum $= ${sum.tex()}$.`] : [R`$\Delta x = ${dx.tex()}$. Sample points: ${samples.map(s => '$' + s[0].tex() + '$').join(', ')}.`, R`$f$ values: ${samples.map(s => '$' + s[1].tex() + '$').join(', ')}.`, R`Sum $= \Delta x\cdot(\text{sum of values}) = ${sum.tex()}$.`],
      graph: { fns: [{ f: S.poly(terms) }], rects, x: [a - 1, b.v + 1], y: [Math.min(0, ...ys) - 2, Math.max(...ys) + 3] }
    };
  });

  function antiTerms(terms) { // power terms with p != -1
    return terms.map(([c, p]) => { p = Frac.of(p); return [Frac.of(c).div(p.add(1)), p.add(1)]; });
  }

  def('antideriv-basic', { title: 'Basic Antiderivatives', unit: 'integrals', desc: 'Reverse power rule and basic formulas.' }, lv => {
    const hintsB = ['Reverse power rule: $\\int x^n\\,dx = \\dfrac{x^{n+1}}{n+1} + C$ for $n \\ne -1$.', 'Remember $\\int \\frac{1}{x}dx = \\ln|x| + C$, $\\int e^x dx = e^x + C$, $\\int \\cos x\\,dx = \\sin x + C$, $\\int\\sin x\\,dx = -\\cos x + C$.'];
    if (lv === 1) {
      const pw = U.sample([0, 1, 2, 3, 4, 5], 3).sort((a, b) => b - a);
      const terms = pw.map(p => [U.nz(-8, 8) * (p + 1 > 1 && U.chance(0.6) ? p + 1 : 1), p]);
      const at = antiTerms(terms);
      return { q: R`Find $\displaystyle\int \left(${T.poly(terms)}\right)dx$.`, a: A.anti(S.poly(at), T.poly(at) + ' + C'), hints: hintsB, steps: [R`Integrate term by term: $${T.poly(at)} + C$.`], check: { anti: S.poly(terms) } };
    }
    const extras = U.sample([['e', 'exp(x)', 'e^{x}', 'exp(x)', 'e^{x}'], ['cos', 'cos(x)', '\\cos x', 'sin(x)', '\\sin x'], ['sin', 'sin(x)', '\\sin x', '(-cos(x))', '-\\cos x'], ['inv', '1/x', '\\frac{1}{x}', 'ln(abs(x))', '\\ln|x|'], ['sec2', 'sec(x)^2', '\\sec^2 x', 'tan(x)', '\\tan x'], ['atan', '1/(1+x^2)', '\\frac{1}{1+x^2}', 'arctan(x)', '\\arctan x']], lv === 2 ? 2 : 2);
    const pwTerms = U.sample([F(1, 2), F(-2), F(3), F(-1, 2), F(2), F(-3), F(1, 3)], lv === 2 ? 1 : 2).map(p => [U.nz(-6, 6), p]);
    const cs = extras.map(() => U.nz(-5, 5));
    let ftex = T.join([...pwTerms.map(([c, p]) => powTerm(c, p)), ...extras.map((e, i) => T.term(cs[i], e[2]))]);
    const fstr = [S.poly(pwTerms), ...extras.map((e, i) => `${cs[i]}*${e[1]}`)].join(' + ');
    const at = antiTerms(pwTerms);
    const astr = [S.poly(at), ...extras.map((e, i) => `${cs[i]}*${e[3]}`)].join(' + ');
    const atex = T.join([...at.map(([c, p]) => powTerm(c, p)), ...extras.map((e, i) => { const neg = e[4].startsWith('-'); return T.term(neg ? -cs[i] : cs[i], neg ? e[4].slice(1) : e[4]); })]);
    return {
      q: R`Find $\displaystyle\int \left(${ftex}\right)dx$.`, a: A.anti(astr, atex + ' + C', { dom: [0.2, 1.4] }),
      hints: hintsB.concat(['Rewrite roots and fractions as powers first.']),
      steps: [R`Power terms: $${T.join(pwTerms.map(([c, p]) => T.term(c, T.pw('x', p))))} \to ${T.join(at.map(([c, p]) => T.term(c, T.pw('x', p))))}$.`, R`All together: $${atex} + C$.`],
      check: { anti: fstr }
    };
  });

  def('definite-basic', { title: 'Definite Integrals (FTC)', unit: 'integrals', desc: 'Evaluate using F(b) − F(a).' }, lv => {
    const hint = ['FTC part 2: $\\displaystyle\\int_a^b f(x)\\,dx = F(b) - F(a)$ where $F\' = f$.'];
    if (lv === 1) {
      const terms = [[U.nz(-3, 3) * 3, 2], [U.int(-4, 4) * 2, 1], [U.int(-5, 5), 0]];
      const [a, b] = U.distinct(2, -2, 3).sort((x, y) => x - y);
      const Ft = poly.int(terms); const v = poly.evalF(Ft, b).sub(poly.evalF(Ft, a));
      return { q: R`Evaluate $\displaystyle\int_{${a}}^{${b}} \left(${T.poly(terms)}\right)dx$.`, a: A.num(v), hints: hint, steps: [R`$F(x) = ${T.poly(Ft)}$.`, R`$F(${b}) - F(${a}) = ${poly.evalF(Ft, b).tex()} - (${poly.evalF(Ft, a).tex()}) = ${v.tex()}$.`], check: { integral: [S.poly(terms), a, b] }, graph: { fns: [{ f: S.poly(terms) }], shade: [{ f: S.poly(terms), a, b }], x: [a - 1, b + 1], y: [-10, 10] } };
    }
    if (lv === 2) {
      const k = U.int(2, 5), c = U.nz(-4, 4);
      const P = U.pick([
        [R`\int_{1}^{e^{${k}}} \frac{${c}}{x}\,dx`, F(c * k), R`${c}/x`, 1, Math.exp(k), R`$${c}\ln x\Big|_1^{e^{${k}}} = ${c}(${k} - 0) = ${c * k}$.`],
        [R`\int_{0}^{\pi} ${c === 1 ? '' : c}\sin x\,dx`, F(2 * c), R`${c}*sin(x)`, 0, Math.PI, R`$-${c}\cos x\Big|_0^\pi = -${c}(-1 - 1) = ${2 * c}$.`],
        [R`\int_{0}^{\ln ${k}} e^{x}\,dx`, F(k - 1), 'exp(x)', 0, Math.log(k), R`$e^x\Big|_0^{\ln ${k}} = ${k} - 1 = ${k - 1}$.`],
        [R`\int_{0}^{\pi/4} \sec^2 x\,dx`, F(1), 'sec(x)^2', 0, Math.PI / 4, R`$\tan x\Big|_0^{\pi/4} = 1 - 0 = 1$.`],
        [R`\int_{0}^{1} \frac{${Math.abs(c) * 4}}{1 + x^2}\,dx`, null, R`${Math.abs(c) * 4}/(1+x^2)`, 0, 1, R`$${Math.abs(c) * 4}\arctan x\Big|_0^1 = ${Math.abs(c) * 4}\cdot\frac{\pi}{4} = ${Math.abs(c)}\pi$.`],
        [R`\int_{1}^{${k * k}} \frac{1}{\sqrt{x}}\,dx`, F(2 * k - 2), '1/sqrt(x)', 1, k * k, R`$2\sqrt{x}\Big|_1^{${k * k}} = ${2 * k} - 2 = ${2 * k - 2}$.`]
      ]);
      const ans = P[1] ? A.num(P[1]) : A.num(Math.abs(c) * Math.PI, (Math.abs(c) === 1 ? '' : Math.abs(c)) + '\\pi');
      return { q: R`Evaluate $\displaystyle ${P[0]}$.`, a: ans, hints: hint, steps: [P[5]], check: { integral: [P[2], P[3], P[4]] } };
    }
    const c = U.int(-2, 3), a = c - U.int(1, 3), b = c + U.int(1, 4);
    const v = F((c - a) ** 2 + (b - c) ** 2, 2);
    return { q: R`Evaluate $\displaystyle\int_{${a}}^{${b}} |${H.shift(c)}|\,dx$.`, a: A.num(v), hints: hint.concat(['Split at $x = ' + c + '$ where the inside changes sign, or use geometry (two triangles).']), steps: [R`Left triangle: base $${c - a}$, area $\frac{${(c - a) ** 2}}{2}$. Right triangle: base $${b - c}$, area $\frac{${(b - c) ** 2}}{2}$.`, R`Total $= ${v.tex()}$.`], check: { integral: [R`abs(x - (${c}))`, a, b] } };
  });

  def('ftc1', { title: 'FTC Part 1', unit: 'integrals', desc: 'Differentiate integrals with variable limits.' }, lv => {
    const fs = U.pick([['t^2 + 1', R`t^2 + 1`], ['sqrt(1 + t^3)', R`\sqrt{1 + t^3}`], ['sin(t^2)', R`\sin(t^2)`], ['exp(t^2)', R`e^{t^2}`], ['cos(t)/t', R`\frac{\cos t}{t}`], ['ln(1 + t^2)', R`\ln(1 + t^2)`], ['1/(1 + t^4)', R`\frac{1}{1 + t^4}`]]);
    const sub = (s, g) => s.replace(/\bt\b/g, '(' + g + ')');
    const subT = (s, g) => s.replace(/\bt\b/g, '{(' + g + ')}');
    const a = U.int(0, 3);
    const hint = ['FTC 1: $\\dfrac{d}{dx}\\displaystyle\\int_a^{x} f(t)\\,dt = f(x)$.', 'With a function in the limit: $\\dfrac{d}{dx}\\displaystyle\\int_a^{g(x)} f(t)\\,dt = f(g(x))\\,g\'(x)$.'];
    const dom = [0.3, 1.4];
    if (lv === 1) {
      return { q: R`Find $\dfrac{d}{dx}\displaystyle\int_{${a}}^{x} ${fs[1]}\,dt$.`, a: A.expr(sub(fs[0], 'x'), fs[1].replace(/\bt\b/g, 'x'), { dom }), hints: hint, steps: [R`By FTC 1, just replace $t$ with $x$: $${fs[1].replace(/\bt\b/g, 'x')}$.`] };
    }
    const G = U.pick([['x^2', 'x^2', '2*x', '2x'], ['x^3', 'x^3', '3*x^2', '3x^2'], ['sin(x)', '\\sin x', 'cos(x)', '\\cos x'], ['sqrt(x)', '\\sqrt{x}', '1/(2*sqrt(x))', '\\frac{1}{2\\sqrt{x}}']]);
    if (lv === 2) {
      return { q: R`Find $\dfrac{d}{dx}\displaystyle\int_{${a}}^{${G[1]}} ${fs[1]}\,dt$.`, a: A.expr(R`${sub(fs[0], G[0])}*${G[2]}`, R`${subT(fs[1], G[1])}\cdot ${G[3]}`, { dom }), hints: hint, steps: [R`Plug $g(x) = ${G[1]}$ in for $t$, then multiply by $g'(x) = ${G[3]}$.`, R`Answer: $${subT(fs[1], G[1])}\cdot ${G[3]}$.`] };
    }
    const Hh = U.pick([['x', 'x', '1', '1'], ['2*x', '2x', '2', '2'], ['-x', '-x', '(-1)', '(-1)']]);
    return { q: R`Find $\dfrac{d}{dx}\displaystyle\int_{${Hh[1]}}^{${G[1]}} ${fs[1]}\,dt$.`, a: A.expr(R`${sub(fs[0], G[0])}*${G[2]} - ${sub(fs[0], Hh[0])}*${Hh[2]}`, R`${subT(fs[1], G[1])}\cdot ${G[3]} - ${subT(fs[1], Hh[1])}\cdot ${Hh[3]}`, { dom }), hints: hint.concat(['Split at a constant: $\\int_{h}^{g} = \\int_c^{g} - \\int_c^{h}$.']), steps: [R`$\dfrac{d}{dx}\int_{h(x)}^{g(x)} f(t)dt = f(g(x))g'(x) - f(h(x))h'(x)$.`, R`$= ${subT(fs[1], G[1])}\cdot ${G[3]} - ${subT(fs[1], Hh[1])}\cdot ${Hh[3]}$.`] };
  });

  def('usub-indef', { title: 'u-Substitution', unit: 'integrals', desc: 'Undo the chain rule.' }, lv => {
    const a = U.int(1, 6), n = U.int(2, 6), k = U.nz(-4, 4);
    const pool = lv === 1 ? ['lin', 'explin', 'coslin'] : lv === 2 ? ['quadpow', 'xexp2', 'sincos', 'logfrac', 'lnpow'] : ['sec2tan', 'expfrac', 'sqrtfrac', 'xlnx', 'atanfrac', 'cubepow'];
    const t = U.pick(pool);
    const P = {
      lin: [R`(${T.lin(k, a)})^{${n}}`, R`(${k}*x + ${a})^${n}`, R`(${k}*x + ${a})^${n + 1}/(${k * (n + 1)})`, R`\frac{(${T.lin(k, a)})^{${n + 1}}}{${k * (n + 1)}}`, R`u = ${T.lin(k, a)},\ du = ${k}\,dx`],
      explin: [R`e^{${T.lin(k, a)}}`, R`exp(${k}*x + ${a})`, R`exp(${k}*x + ${a})/${k}`, R`\frac{1}{${k}}e^{${T.lin(k, a)}}`, R`u = ${T.lin(k, a)},\ du = ${k}\,dx`],
      coslin: [R`\cos(${H.kx(k)})`, R`cos(${k}*x)`, R`sin(${k}*x)/${k}`, R`\frac{1}{${k}}\sin(${H.kx(k)})`, R`u = ${H.kx(k)},\ du = ${k}\,dx`],
      quadpow: [R`x(x^2 + ${a})^{${n}}`, R`x*(x^2 + ${a})^${n}`, R`(x^2 + ${a})^${n + 1}/${2 * (n + 1)}`, R`\frac{(x^2 + ${a})^{${n + 1}}}{${2 * (n + 1)}}`, R`u = x^2 + ${a},\ du = 2x\,dx`],
      xexp2: [R`x e^{${H.kx(k, 'x^2')}}`, R`x*exp(${k}*x^2)`, R`exp(${k}*x^2)/${2 * k}`, R`\frac{1}{${2 * k}}e^{${H.kx(k, 'x^2')}}`, R`u = ${H.kx(k, 'x^2')},\ du = ${2 * k}x\,dx`],
      sincos: [R`\sin^{${n}}x\cos x`, R`sin(x)^${n}*cos(x)`, R`sin(x)^${n + 1}/${n + 1}`, R`\frac{\sin^{${n + 1}}x}{${n + 1}}`, R`u = \sin x,\ du = \cos x\,dx`],
      logfrac: [R`\frac{x}{x^2 + ${a}}`, R`x/(x^2 + ${a})`, R`ln(x^2 + ${a})/2`, R`\frac{1}{2}\ln(x^2 + ${a})`, R`u = x^2 + ${a},\ du = 2x\,dx`],
      lnpow: [R`\frac{(\ln x)^{${n}}}{x}`, R`ln(x)^${n}/x`, R`ln(x)^${n + 1}/${n + 1}`, R`\frac{(\ln x)^{${n + 1}}}{${n + 1}}`, R`u = \ln x,\ du = \frac{1}{x}dx`],
      sec2tan: [R`\sec^2 x\tan^{${n}} x`, R`sec(x)^2*tan(x)^${n}`, R`tan(x)^${n + 1}/${n + 1}`, R`\frac{\tan^{${n + 1}} x}{${n + 1}}`, R`u = \tan x,\ du = \sec^2 x\,dx`],
      expfrac: [R`\frac{e^{x}}{e^{x} + ${a}}`, R`exp(x)/(exp(x) + ${a})`, R`ln(exp(x) + ${a})`, R`\ln(e^{x} + ${a})`, R`u = e^x + ${a},\ du = e^x\,dx`],
      sqrtfrac: [R`\frac{x}{\sqrt{x^2 + ${a}}}`, R`x/sqrt(x^2 + ${a})`, R`sqrt(x^2 + ${a})`, R`\sqrt{x^2 + ${a}}`, R`u = x^2 + ${a},\ du = 2x\,dx`],
      xlnx: [R`\frac{1}{x\ln x}`, R`1/(x*ln(x))`, R`ln(abs(ln(x)))`, R`\ln|\ln x|`, R`u = \ln x,\ du = \frac{1}{x}dx`],
      atanfrac: [R`\frac{\arctan x}{1 + x^2}`, R`arctan(x)/(1 + x^2)`, R`arctan(x)^2/2`, R`\frac{1}{2}\arctan^2 x`, R`u = \arctan x,\ du = \frac{dx}{1 + x^2}`],
      cubepow: [R`x^2\sqrt{x^3 + ${a}}`, R`x^2*sqrt(x^3 + ${a})`, R`2*(x^3 + ${a})^(3/2)/9`, R`\frac{2}{9}(x^3 + ${a})^{3/2}`, R`u = x^3 + ${a},\ du = 3x^2\,dx`]
    }[t];
    const dom = t === 'xlnx' || t === 'lnpow' ? [1.3, 4] : t === 'sec2tan' ? [-1, 1] : t === 'lin' ? [-1.5, 1.5] : [-1.5, 1.5];
    return {
      q: R`Find $\displaystyle\int ${P[0]}\,dx$.`, a: A.anti(P[2], P[3] + ' + C', { dom }),
      hints: ['Look for an "inside" function whose derivative also appears (up to a constant).', R`Try $${P[4]}$.`],
      steps: [R`Let $${P[4]}$.`, R`Rewrite in $u$, integrate, then substitute back: $${P[3]} + C$.`], check: { anti: P[1] }
    };
  });

  def('usub-def', { title: 'Definite u-Substitution', unit: 'integrals', desc: 'Change the limits with u.' }, lv => {
    const n = U.int(1, 4), b = U.int(1, 4);
    const P = U.pick([
      [R`\int_0^1 x(x^2 + 1)^{${n}}\,dx`, F(2 ** (n + 1) - 1, 2 * (n + 1)), R`x*(x^2+1)^${n}`, 0, 1, R`$u = x^2 + 1$: $\frac12\int_1^2 u^{${n}}du = \frac{2^{${n + 1}} - 1}{${2 * (n + 1)}}$.`],
      [R`\int_0^{\pi/2} \sin^{${n}}x\cos x\,dx`, F(1, n + 1), R`sin(x)^${n}*cos(x)`, 0, Math.PI / 2, R`$u = \sin x$, limits $0 \to 1$: $\int_0^1 u^{${n}}du = \frac{1}{${n + 1}}$.`],
      [R`\int_1^{e} \frac{(\ln x)^{${n}}}{x}\,dx`, F(1, n + 1), R`ln(x)^${n}/x`, 1, Math.E, R`$u = \ln x$, limits $0 \to 1$: $\int_0^1 u^{${n}}du = \frac{1}{${n + 1}}$.`],
      [R`\int_0^1 x^2(x^3 + 1)^{${n}}\,dx`, F(2 ** (n + 1) - 1, 3 * (n + 1)), R`x^2*(x^3+1)^${n}`, 0, 1, R`$u = x^3 + 1$: $\frac13\int_1^2 u^{${n}}du = \frac{2^{${n + 1}} - 1}{${3 * (n + 1)}}$.`],
      [R`\int_0^{${b}} \frac{2x}{x^2 + 1}\,dx`, null, '2*x/(x^2+1)', 0, b, R`$u = x^2 + 1$, limits $1 \to ${b * b + 1}$: $\ln u\Big|_1^{${b * b + 1}} = \ln ${b * b + 1}$.`, Math.log(b * b + 1), R`\ln ${b * b + 1}`]
    ]);
    if (lv === 1 && P[1] === null) return null;
    return {
      q: R`Evaluate $\displaystyle ${P[0]}$.`, a: P[1] ? A.num(P[1]) : A.num(P[6], P[7]),
      hints: ['Choose $u$, then **change the limits** to $u$-values so you never have to switch back.'], steps: [P[5]], check: { integral: [P[2], P[3], P[4]] }
    };
  });
})();
