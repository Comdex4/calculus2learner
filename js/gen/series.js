/* Generators: sequences, series, convergence tests, power & Taylor series. */
(function () {
  'use strict';
  const { U, T, S, F, Frac, gen } = CL;
  const { def, A, H } = gen;
  const R = String.raw;
  const CD = ['Converges', 'Diverges'];
  const ACD = ['Absolutely convergent', 'Conditionally convergent', 'Divergent'];
  const sum = (lo, term) => R`\displaystyle\sum_{n=${lo}}^{\infty} ${term}`;

  def('sequence-limit', { title: 'Limits of Sequences', unit: 'series', desc: 'Does a sequence converge? To what?' }, lv => {
    const a = U.nz(-6, 6), c = U.nz(-6, 6), b = U.int(-5, 5), d = U.int(1, 6), k = U.nz(-3, 3);
    const tail = ' (Type <kbd>DNE</kbd> if it diverges.)';
    const pool = lv === 1 ? ['rat', 'rat', 'recip', 'geo'] : lv === 2 ? ['rat', 'sqrt', 'altz', 'altdne', 'lnn', 'geo'] : ['epow', 'nexp', 'fact', 'nroot', 'altdne', 'sinn'];
    const t = U.pick(pool);
    const r = U.pick([F(1, 2), F(2, 3), F(-1, 3), F(3, 2), F(-5, 4), F(3, 4), F(5, 3)]);
    const P = {
      rat: [R`a_n = \frac{${T.poly([[a, 2], [b, 0]], 'n')}}{${T.poly([[c, 2], [d, 1]], 'n')}}`, F(a, c), R`Divide by $n^2$: $\frac{${a} + ${b}/n^2}{${c} + ${d}/n} \to ${F(a, c).tex()}$.`],
      recip: [R`a_n = ${a} + \frac{${b === 0 ? 1 : b}}{n}`, F(a), R`$\frac{${b === 0 ? 1 : b}}{n} \to 0$, so $a_n \to ${a}$.`],
      geo: [R`a_n = ${r.n < 0 ? '\\left(' + r.tex() + '\\right)' : '\\left(' + r.tex() + '\\right)'}^{n}`, Math.abs(r.v) < 1 ? F(0) : 'dne', Math.abs(r.v) < 1 ? R`$|r| = ${r.abs().tex()} < 1$, so $r^n \to 0$.` : R`$|r| = ${r.abs().tex()} > 1$, so $|r^n| \to \infty$ — diverges.`],
      sqrt: [R`a_n = \frac{${H.kx(Math.abs(a), 'n')} ${T.signed(b)}}{\sqrt{${d * d}n^2 + 1}}`, F(Math.abs(a), d), R`Divide top and bottom by $n$: $\frac{${Math.abs(a)}}{\sqrt{${d * d}}} = ${F(Math.abs(a), d).tex()}$.`],
      altz: [R`a_n = \frac{(-1)^n}{${H.kx(d, 'n')}}`, F(0), R`$|a_n| = \frac{1}{${d}n} \to 0$, so $a_n \to 0$ (squeeze).`],
      altdne: [R`a_n = (-1)^n\frac{n}{n + ${d}}`, 'dne', R`$\frac{n}{n+${d}} \to 1$, so terms alternate near $\pm1$ — no limit.`],
      lnn: [R`a_n = \frac{\ln n}{n}`, F(0), R`L'Hôpital on $\frac{\ln x}{x}$: $\frac{1/x}{1} \to 0$.`],
      epow: [R`a_n = \left(1 + \frac{${k}}{n}\right)^{n}`, null, R`Standard limit: $\left(1 + \frac{k}{n}\right)^n \to e^{k} = e^{${k}}$.`, Math.exp(k), R`e^{${k}}`],
      nexp: [R`a_n = \frac{n^{${d}}}{e^{n}}`, F(0), 'Exponentials beat polynomials: $\\to 0$.'],
      fact: [R`a_n = \frac{${Math.abs(a) + 1}^n}{n!}`, F(0), 'Factorials beat exponentials: $\\to 0$.'],
      nroot: [R`a_n = \sqrt[n]{n}`, F(1), R`$\ln a_n = \frac{\ln n}{n} \to 0$, so $a_n \to e^0 = 1$.`],
      sinn: [R`a_n = \frac{\sin n}{n}`, F(0), R`$-\frac1n \le a_n \le \frac1n$; squeeze $\Rightarrow 0$.`]
    }[t];
    return {
      q: R`Find $\displaystyle\lim_{n\to\infty} a_n$ for $${P[0]}$.${tail}`, a: P[1] === null ? A.num(P[3], P[4]) : A.num(P[1]),
      hints: ['Treat $n$ like a continuous variable $x$ and use limit techniques (dominant terms, L\'Hôpital, squeeze).', 'Growth ranking: $\\ln n \\ll n^p \\ll b^n \\ll n! \\ll n^n$.'],
      steps: [P[2]]
    };
  });

  def('geometric-series', { title: 'Geometric Series', unit: 'series', desc: 'Sum = first term ÷ (1 − ratio), when the ratio is between −1 and 1.' }, lv => {
    const tail = ' (Type <kbd>diverges</kbd> if it diverges.)';
    const hints = ['Geometric series $\\sum_{n=0}^\\infty ar^n = \\dfrac{a}{1-r}$ if $|r| < 1$; diverges if $|r| \\ge 1$.', 'The numerator is the **first term** of the series — careful when the index starts at 1.'];
    if (lv === 3 && U.chance(0.5)) {
      const two = U.chance();
      if (two) { const ab = U.int(1, 98); return { q: R`Write the repeating decimal $0.\overline{${String(ab).padStart(2, '0')}}$ as a fraction.`, a: A.num(F(ab, 99)), hints: ['$0.\\overline{ab} = \\frac{ab}{100} + \\frac{ab}{100^2} + \\cdots$ — geometric with $r = \\frac{1}{100}$.'], steps: [R`First term $\frac{${ab}}{100}$, ratio $\frac{1}{100}$.`, R`Sum $= \frac{${ab}/100}{1 - 1/100} = \frac{${ab}}{99} = ${F(ab, 99).tex()}$.`] }; }
      const d = U.int(1, 9); return { q: R`Write $0.\overline{${d}}$ as a fraction.`, a: A.num(F(d, 9)), hints: ['$0.\\overline{d} = \\frac{d}{10} + \\frac{d}{100} + \\cdots$.'], steps: [R`$\frac{${d}/10}{1 - 1/10} = \frac{${d}}{9}$.`] };
    }
    const r = lv === 1 ? U.pick([F(1, 2), F(1, 3), F(2, 3), F(1, 4), F(3, 4), F(-1, 2), F(-1, 3)]) : U.pick([F(1, 2), F(2, 3), F(-2, 5), F(3, 4), F(-3, 4), F(5, 4), F(3, 2), F(-1, 3), F(4, 3), F(2, 5)]);
    const a = U.nz(-5, 8); const lo = lv === 1 ? 0 : U.pick([0, 1, 2]);
    const first = F(a).mul(r.pow(lo));
    const conv = Math.abs(r.v) < 1;
    const val = conv ? first.div(F(1).sub(r)) : null;
    const rt = r.sign() < 0 ? R`\left(${r.tex()}\right)` : r.d === 1 ? r.tex() : R`\left(${r.tex()}\right)`;
    let term = R`${a === 1 ? '' : a === -1 ? '-' : a}${rt}^{n}`;
    if (lv >= 2 && U.chance(0.5)) { // write as fraction form
      const num = r.n, den = r.d;
      term = R`\frac{${a === 1 ? '' : a === -1 ? '-' : a}${num < 0 ? '(' + num + ')' : num}^{n}}{${den}^{n}}`;
    }
    return {
      q: R`Find the sum of $${sum(lo, term)}$.${tail}`, a: conv ? A.num(val) : A.num('diverges'), hints,
      steps: [R`Ratio $r = ${r.tex()}$, first term (at $n = ${lo}$) $= ${first.tex()}$.`, conv ? R`$|r| < 1$: sum $= \dfrac{${first.tex()}}{1 - (${r.tex()})} = ${val.tex()}$.` : R`$|r| = ${r.abs().tex()} \ge 1$: **diverges**.`],
      ...(conv ? { check: { value: val.v } } : {})
    };
  });

  def('telescoping', { title: 'Telescoping Series', unit: 'series', desc: 'Partial sums that collapse.' }, lv => {
    const k = lv === 1 ? 1 : U.int(1, 3), a = lv === 3 ? U.int(1, 4) : 0;
    if (lv === 3 && U.chance(0.35)) return { q: R`Find the sum of $${sum(1, R`\ln\left(\frac{n + 1}{n}\right)`)}$. (Type <kbd>diverges</kbd> if it diverges.)`, a: A.num('diverges'), hints: ['$\\ln\\frac{n+1}{n} = \\ln(n+1) - \\ln n$ telescopes.'], steps: [R`$S_N = \ln(N + 1) - \ln 1 = \ln(N+1) \to \infty$.`, 'So it **diverges** (even though the terms $\\to 0$!).'] };
    // sum 1/((n+a)(n+a+k)) = (1/k) * sum_{j=1..k} 1/(a+j)
    let v = F(0); for (let j = 1; j <= k; j++) v = v.add(F(1, a + j)); v = v.div(k);
    const t1 = a ? `(n + ${a})` : 'n', t2 = `(n + ${a + k})`;
    const term = k === 1 && lv === 1 && U.chance() ? R`\left(\frac{1}{n} - \frac{1}{n+1}\right)` : R`\frac{${k === 1 ? 1 : k}}{${t1}${t2}}`;
    const vv = term.startsWith('\\left') ? F(1) : v.mul(k);
    return {
      q: R`Find the sum of $${sum(1, term)}$.`, a: A.num(vv),
      hints: ['Use partial fractions: $\\frac{k}{(n+a)(n+a+k)} = \\frac{1}{n+a} - \\frac{1}{n+a+k}$.', 'Write out $S_N$: most terms cancel. What survives?'],
      steps: [R`$${term} = \frac{1}{${t1}} - \frac{1}{${t2}}$.`, R`Survivors: the first ${k} positive terms $${U.range(1, k).map(j => '\\frac{1}{' + (a + j) + '}').join(' + ')}$; the negative tail $\to 0$.`, R`Sum $= ${vv.tex()}$.`],
      check: { sum: [term.startsWith('\\left') ? '1/n - 1/(n+1)' : R`${k}/((n + ${a})*(n + ${a + k}))`, 1] }
    };
  });

  def('divergence-test', { title: 'Divergence (nth-Term) Test', unit: 'series', desc: 'If the terms do not shrink to 0, the series diverges.' }, lv => {
    const a = U.int(1, 6), b = U.int(1, 6), p = U.int(1, 3);
    const items = [
      [R`\frac{${H.kx(a, 'n')}}{${H.kx(b, 'n')} + ${a + 1}}`, 0, R`$a_n \to ${F(a, b).tex()} \ne 0$.`],
      [R`\frac{n^2}{${a}n^2 + n}`, 0, R`$a_n \to ${F(1, a).tex()} \ne 0$.`],
      [R`\left(1 + \frac{1}{n}\right)^{n}`, 0, '$a_n \\to e \\ne 0$.'],
      [R`\cos\left(\frac{1}{n}\right)`, 0, '$a_n \\to \\cos 0 = 1 \\ne 0$.'],
      [R`\frac{\sqrt{n^2 + 1}}{${b}n}`, 0, R`$a_n \to \frac{1}{${b}} \ne 0$.`],
      [R`(-1)^n`, 0, 'Terms bounce between $\\pm1$ — they don\'t approach 0.'],
      [R`\frac{1}{n^{${p}}}`, 1, R`$a_n \to 0$, so the test says nothing (the series ${p > 1 ? 'actually converges' : 'actually diverges'} by the p-test).`],
      [R`\frac{${a}}{n + ${b}}`, 1, R`$a_n \to 0$ — inconclusive (it actually diverges, like the harmonic series).`],
      [R`\sin\left(\frac{1}{n}\right)`, 1, '$a_n \\to 0$ — inconclusive.'],
      [R`\frac{n}{e^n}`, 1, '$a_n \\to 0$ — inconclusive (it actually converges).'],
      [R`\frac{\ln n}{n}`, 1, '$a_n \\to 0$ — inconclusive.']
    ];
    const it = U.pick(items);
    return {
      q: R`What does the **Divergence Test** tell you about $${sum(1, it[0])}$?`,
      a: A.mcFixed(['The series diverges', 'The test is inconclusive', 'The series converges'], it[1]),
      hints: ['Compute $\\lim_{n\\to\\infty} a_n$.', 'If the limit is not 0 → diverges. If it **is** 0, the divergence test can\'t decide (it never proves convergence!).'],
      steps: [it[2], it[1] === 0 ? '**Diverges** by the divergence test.' : 'The limit is 0, so the test is **inconclusive**.']
    };
  });

  def('p-series', { title: 'Integral Test & p-Series', unit: 'series', desc: 'Σ1/nᵖ converges iff p > 1.' }, lv => {
    const pFr = U.pick([F(2), F(3), F(1, 2), F(1), F(3, 2), F(2, 3), F(5, 4), F(4, 5), F(1, 3), F(4)]);
    if (lv === 1) {
      const conv = pFr.v > 1;
      const term = pFr.isInt() ? R`\frac{1}{n^{${pFr.n}}}` : pFr.eq(F(1, 2)) ? R`\frac{1}{\sqrt{n}}` : R`\frac{1}{n^{${pFr.texInline()}}}`;
      return { q: R`Does $${sum(1, term)}$ converge or diverge?`, a: A.mcFixed(CD, conv ? 0 : 1), hints: ['p-series: $\\sum\\frac{1}{n^p}$ converges iff $p > 1$.'], steps: [R`This is a p-series with $p = ${pFr.tex()}$.`, conv ? '$p > 1$: **converges**.' : '$p \\le 1$: **diverges**.'] };
    }
    const k = U.int(1, 3);
    const items = [
      [R`\frac{1}{n\ln n}`, 2, 1, R`$\int_2^\infty\frac{dx}{x\ln x} = \ln(\ln x)\Big|_2^\infty = \infty$.`],
      [R`\frac{1}{n(\ln n)^2}`, 2, 0, R`$\int_2^\infty\frac{dx}{x(\ln x)^2} = \frac{1}{\ln 2}$ — finite.`],
      [R`\frac{n}{n^2 + ${k}}`, 1, 1, R`$\int_1^\infty\frac{x}{x^2+${k}}dx = \frac12\ln(x^2+${k})\Big|_1^\infty = \infty$.`],
      [R`ne^{-n^2}`, 1, 0, R`$\int_1^\infty xe^{-x^2}dx = \frac{1}{2e}$ — finite.`],
      [R`\frac{1}{n^2 + ${k * k}}`, 1, 0, R`$\int_1^\infty\frac{dx}{x^2 + ${k * k}} = \frac{1}{${k}}\left(\frac{\pi}{2} - \arctan\frac{1}{${k}}\right)$ — finite.`],
      [R`\frac{\ln n}{n}`, 1, 1, R`$\int_1^\infty\frac{\ln x}{x}dx = \frac{(\ln x)^2}{2}\Big|_1^\infty = \infty$.`],
      [R`\frac{1}{(2n + ${k})^{2}}`, 1, 0, R`$\int_1^\infty (2x + ${k})^{-2}dx = \frac{1}{2(2 + ${k})}$ — finite.`],
      [R`\frac{1}{\sqrt{n + ${k}}}`, 1, 1, R`$\int_1^\infty (x + ${k})^{-1/2}dx = 2\sqrt{x + ${k}}\Big|_1^\infty = \infty$.`]
    ];
    const it = U.pick(items);
    return {
      q: R`Use the integral test: does $${sum(it[1], it[0])}$ converge or diverge?`, a: A.mcFixed(CD, it[2]),
      hints: ['Integral test: if $f$ is positive, continuous, decreasing, then $\\sum f(n)$ and $\\int_1^\\infty f(x)\\,dx$ both converge or both diverge.'],
      steps: [it[3], it[2] === 0 ? 'Integral converges, so the series **converges**.' : 'Integral diverges, so the series **diverges**.']
    };
  });

  def('comparison', { title: 'Comparison Tests', unit: 'series', desc: 'Direct and limit comparison.' }, lv => {
    // build a_n = n^p (+..)/ (n^q + ..) with effective power d = q - p
    const variants = [
      () => { const c = U.int(1, 9), q = U.int(2, 4); return [R`\frac{1}{n^{${q}} + ${c}}`, q]; },
      () => { const c = U.int(1, 9); return [R`\frac{1}{${U.int(2, 5)}n + ${c}}`, 1]; },
      () => { const c = U.int(1, 9), b = U.int(1, 9); return [R`\frac{n + ${c}}{n^3 + ${b}}`, 2]; },
      () => { const c = U.int(1, 9), b = U.int(1, 9); return [R`\frac{n^2 + ${c}}{n^3 + ${b}}`, 1]; },
      () => { const c = U.int(1, 9); return [R`\frac{\sqrt{n}}{n + ${c}}`, F(1, 2)]; },
      () => { const c = U.int(1, 9); return [R`\frac{\sqrt{n}}{n^2 + ${c}}`, F(3, 2)]; },
      () => { const c = U.int(1, 9); return [R`\frac{1}{\sqrt{n^3 + ${c}}}`, F(3, 2)]; },
      () => { const c = U.int(1, 9); return [R`\frac{1}{\sqrt{n} + ${c}}`, F(1, 2)]; },
      () => { const c = U.int(2, 9); return [R`\frac{${c}}{n^2 - 1/2}`, 2]; },
      () => [R`\frac{\sin^2 n}{n^2}`, 2],
      () => { const c = U.int(1, 5); return [R`\frac{1}{2^n + ${c}}`, 'geo'] }
    ];
    const [term, d] = U.pick(lv === 1 ? [variants[0], variants[1], variants[9], variants[10]] : variants)();
    if (d === 'geo') return { q: R`Determine whether $${sum(1, term)}$ converges, and which comparison shows it.`, a: A.mc(R`Converges — compare with $\sum\frac{1}{2^n}$`, [R`Diverges — compare with $\sum\frac{1}{n}$`, R`Converges — compare with $\sum\frac{1}{n}$`, R`Diverges — compare with $\sum 2^n$`]), hints: ['For large $n$, the term behaves like $\\frac{1}{2^n}$.'], steps: [R`$\frac{1}{2^n + c} < \frac{1}{2^n}$, a convergent geometric series ($r = \frac12$).`, '**Converges** by direct comparison.'] };
    const dF = Frac.of(d);
    const conv = dF.v > 1;
    const cmp = p => R`$\sum\frac{1}{${Frac.of(p).eq(1) ? 'n' : 'n^{' + Frac.of(p).texInline() + '}'}}$`;
    const correct = R`${conv ? 'Converges' : 'Diverges'} — compare with ${cmp(dF)}`;
    const wrongs = [R`${conv ? 'Diverges' : 'Converges'} — compare with ${cmp(dF)}`, R`${conv ? 'Diverges' : 'Converges'} — compare with ${cmp(conv ? 1 : 2)}`, R`${conv ? 'Converges' : 'Diverges'} — compare with ${cmp(conv ? F(1, 2) : 3)}`];
    if (lv === 1) {
      return { q: R`Does $${sum(1, term)}$ converge or diverge?`, a: A.mcFixed(CD, conv ? 0 : 1), hints: ['Compare with a p-series by looking at the **dominant** powers of $n$ on top and bottom.'], steps: [R`For large $n$ the term behaves like $\frac{1}{n^{${dF.texInline()}}}$.`, conv ? 'p-series with $p > 1$ → **converges**.' : 'p-series with $p \\le 1$ → **diverges**.'] };
    }
    return {
      q: R`Determine whether $${sum(1, term)}$ converges, and which series to compare it with.`, a: A.mc(correct, wrongs),
      hints: ['Keep only the highest power of $n$ in the numerator and denominator.', 'Limit comparison: if $\\lim \\frac{a_n}{b_n} = L$ with $0 < L < \\infty$, both series do the same thing.'],
      steps: [R`Dominant behavior: $a_n \approx \frac{1}{n^{${dF.texInline()}}}$.`, R`$\lim\frac{a_n}{1/n^{${dF.texInline()}}}$ is a positive finite number, so they behave the same.`, conv ? '$p > 1$: **converges**.' : '$p \\le 1$: **diverges**.']
    };
  });

  def('alternating', { title: 'Alternating Series', unit: 'series', desc: 'AST, absolute vs conditional convergence, error bounds.' }, lv => {
    if (lv === 3 && U.chance(0.4)) {
      const p = U.pick([1, 2, 3]), N = U.int(3, 9);
      const bound = F(1, (N + 1) ** p);
      return { q: R`The series $${sum(1, R`\frac{(-1)^{n+1}}{n^{${p}}}`)}$ is approximated by its partial sum $S_{${N}}$. Use the Alternating Series Estimation Theorem to bound the error $|S - S_{${N}}|$.`, a: A.num(bound), hints: ['For an alternating series meeting the AST, $|S - S_N| \\le b_{N+1}$ — the first omitted term.'], steps: [R`First omitted term: $b_{${N + 1}} = \frac{1}{${N + 1}^{${p}}} = ${bound.tex()}$.`] };
    }
    const p = U.pick([F(1), F(2), F(1, 2), F(3), F(3, 2), F(1, 3)]); const k = U.int(1, 5);
    const items = [
      [R`\frac{(-1)^n}{n^{${p.texInline()}}}`, p.v > 1 ? 0 : 1, p.v > 1 ? R`$\sum\frac{1}{n^{${p.texInline()}}}$ converges ($p > 1$), so it's absolutely convergent.` : R`AST: $\frac{1}{n^{${p.texInline()}}}$ decreases to 0, so it converges; but $\sum\frac{1}{n^{${p.texInline()}}}$ diverges ($p \le 1$) → conditional.`],
      [R`\frac{(-1)^n n}{n + ${k}}`, 2, R`$\frac{n}{n + ${k}} \to 1 \ne 0$ — diverges by the divergence test.`],
      [R`\frac{(-1)^n}{\ln n}`, 1, R`AST: $\frac{1}{\ln n}$ decreases to 0. But $\frac{1}{\ln n} > \frac1n$, so $\sum\frac{1}{\ln n}$ diverges → conditional.`],
      [R`\frac{(-1)^n}{n^2 + ${k}}`, 0, R`$\sum\frac{1}{n^2 + ${k}}$ converges (compare with $\frac{1}{n^2}$) → absolute.`],
      [R`\frac{(-1)^n}{${2 * k}n + 1}`, 1, R`AST passes, but $\sum\frac{1}{${2 * k}n+1}$ diverges (like harmonic) → conditional.`],
      [R`\frac{(-1)^n}{${k + 1}^n}`, 0, R`$\sum\frac{1}{${k + 1}^n}$ is geometric with $r = \frac{1}{${k + 1}}$ → absolute.`],
      [R`(-1)^n\frac{n^2}{n^2 + 1}`, 2, '$|a_n| \\to 1$ — diverges by the divergence test.'],
      [R`\frac{(-1)^n\sqrt{n}}{n + ${k}}`, 1, R`AST: $\frac{\sqrt n}{n + ${k}}$ eventually decreases to 0; absolute series behaves like $\sum\frac{1}{\sqrt n}$ (diverges) → conditional.`]
    ];
    const it = U.pick(lv === 1 ? items.slice(0, 2) : items);
    return {
      q: R`Classify $${sum(2, it[0])}$.`, a: A.mcFixed(ACD, it[1]),
      hints: ['Step 1: test $\\sum|a_n|$. If it converges → **absolutely** convergent.', 'Step 2: if not, use the Alternating Series Test ($b_n$ decreasing, $b_n \\to 0$). If it passes → **conditionally** convergent. If $a_n \\not\\to 0$ → divergent.'],
      steps: [it[2], R`**${ACD[it[1]]}**.`]
    };
  });

  def('ratio-test', { title: 'Ratio & Root Tests', unit: 'series', desc: 'Compare each term with the next to decide convergence.' }, lv => {
    const k = U.int(2, 6), p = U.int(1, 4);
    const items = [
      [R`\frac{${k}^n}{n!}`, F(0), R`$\frac{${k}^{n+1}/(n+1)!}{${k}^n/n!} = \frac{${k}}{n+1} \to 0$.`, R`${k}^n/n!`],
      [R`\frac{n^{${p}}}{${k}^n}`, F(1, k), R`$\frac{(n+1)^{${p}}}{n^{${p}}}\cdot\frac{1}{${k}} \to \frac{1}{${k}}$.`],
      [R`\frac{${k}^n}{n^{${p}}}`, F(k), R`$\frac{${k}\,n^{${p}}}{(n+1)^{${p}}} \to ${k}$.`],
      [R`\frac{n!}{${k}^n}`, Infinity, R`$\frac{n+1}{${k}} \to \infty$.`],
      [R`\frac{(n!)^2}{(2n)!}`, F(1, 4), R`$\frac{(n+1)^2}{(2n+2)(2n+1)} \to \frac{1}{4}$.`],
      [R`\frac{n!}{n^n}`, null, R`$\frac{(n+1)!}{(n+1)^{n+1}}\cdot\frac{n^n}{n!} = \left(\frac{n}{n+1}\right)^n \to \frac{1}{e}$.`, null, 1 / Math.E, '\\frac{1}{e}'],
      [R`\frac{1}{n^{${p}}}`, F(1), R`$\left(\frac{n}{n+1}\right)^{${p}} \to 1$ — the ratio test is inconclusive here!`],
      [R`\left(\frac{${H.kx(p, 'n')} + 1}{${H.kx(k, 'n')} + 3}\right)^{n}`, F(p, k), R`Root test is easier: $\sqrt[n]{|a_n|} = \frac{${p}n + 1}{${k}n + 3} \to ${F(p, k).tex()}$.`]
    ];
    const it = U.pick(lv === 1 ? items.slice(0, 3) : lv === 2 ? items.slice(0, 7) : items.slice(3));
    const L = it[1] === null ? it[4] : it[1] === Infinity ? Infinity : it[1].v;
    const concl = L < 1 ? 'converges (absolutely)' : L > 1 ? 'diverges' : 'inconclusive';
    return {
      q: R`For $${sum(1, it[0])}$, compute $L = \displaystyle\lim_{n\to\infty}\left|\frac{a_{n+1}}{a_n}\right|$${it[0].includes('right)^{n}') ? ' (equivalently the root-test limit $\\lim\\sqrt[n]{|a_n|}$)' : ''}. (Use <kbd>inf</kbd> for ∞.)`,
      a: it[1] === null ? A.num(it[4], it[5]) : A.num(it[1] === Infinity ? Infinity : it[1]),
      hints: ['Write $\\frac{a_{n+1}}{a_n}$ and cancel: $\\frac{(n+1)!}{n!} = n+1$, $\\frac{k^{n+1}}{k^n} = k$.', '$L < 1$ → converges absolutely; $L > 1$ → diverges; $L = 1$ → inconclusive.'],
      steps: [it[2], R`Since $L ${L < 1 ? '< 1' : L > 1 ? '> 1' : '= 1'}$, the series ${concl}.`]
    };
  });

  def('series-strategy', { title: 'Choosing a Convergence Test', unit: 'series', desc: 'Pick the right tool.' }, lv => {
    const TESTS = ['Divergence test', 'Geometric series', 'p-series', 'Comparison / limit comparison', 'Alternating series test', 'Ratio test', 'Integral test'];
    const k = U.int(2, 7), p = U.int(2, 4);
    const items = [
      [0, R`\frac{${k}n^2}{n^2 + 1}`, 'Terms approach $' + k + ' \\ne 0$.'],
      [1, R`\frac{${k}}{${k + 1}^n}`, 'Constant ratio $\\frac{1}{' + (k + 1) + '}$.'],
      [2, R`\frac{1}{n^{${p}}}`, 'Exactly the form $\\frac{1}{n^p}$.'],
      [3, R`\frac{n}{n^{3} + ${k}}`, 'Rational function of $n$: compare with $\\frac{1}{n^2}$.'],
      [3, R`\frac{1}{\sqrt{n} + ${k}}`, 'Behaves like $\\frac{1}{\\sqrt n}$.'],
      [4, R`\frac{(-1)^n}{\sqrt{n}}`, 'Alternating signs with decreasing terms → 0.'],
      [5, R`\frac{n^{${p}}}{n!}`, 'Factorials → ratio test.'],
      [5, R`\frac{${k}^n}{n^{${p}}}`, 'Exponentials with powers → ratio test.'],
      [6, R`\frac{1}{n(\ln n)^{${p}}}`, 'Has an easy antiderivative via $u = \\ln x$.']
    ];
    const pool = lv === 1 ? items.filter(i => i[0] <= 2) : items;
    const it = U.pick(pool);
    const others = U.sample(TESTS.filter((t, i) => i !== it[0]), 3);
    return {
      q: R`Which test is the most natural choice for $${sum(2, it[1])}$?`, a: A.mc(TESTS[it[0]], others),
      hints: ['Checklist: (1) terms → 0? (2) geometric or p-series? (3) alternating? (4) factorials/exponentials → ratio. (5) rational/algebraic → comparison. (6) easy integral → integral test.'],
      steps: [it[2], R`Best choice: **${TESTS[it[0]]}**.`]
    };
  });

  /* ================= POWER SERIES ================= */

  def('radius', { title: 'Radius of Convergence', unit: 'power', desc: 'Use the ratio test on a power series.' }, lv => {
    const k = U.int(2, 6), c = lv === 1 ? 0 : U.int(-4, 4), p = U.int(0, 2);
    const xc = c === 0 ? 'x' : R`(${H.shift(c)})`;
    const items = [
      [R`\frac{${xc}^n}{${k}^n}`, k],
      [R`\frac{${xc}^n}{${k}^n\, n${p > 1 ? '^' + p : ''}}`, k],
      [R`${k}^n${xc}^n`, F(1, k)],
      [R`\frac{${k}^n ${xc}^n}{n}`, F(1, k)],
      [R`\frac{${xc}^n}{n!}`, Infinity],
      [R`n!\,${xc}^n`, 0],
      [R`\frac{${xc}^{2n}}{${k * k}^n}`, k],
      [R`\frac{n${xc}^n}{${k}^{n+1}}`, k]
    ];
    const it = U.pick(lv === 1 ? items.slice(0, 4) : items);
    const R0 = it[1];
    return {
      q: R`Find the radius of convergence of $${sum(lv === 1 ? 0 : 1, it[0])}$. (Use <kbd>inf</kbd> if it converges for all $x$.)`, a: A.num(R0 === Infinity ? Infinity : R0),
      hints: ['Ratio test on the whole term: $\\lim\\left|\\frac{a_{n+1}}{a_n}\\right| = |x - c|\\cdot L$.', 'Converges when that is $< 1$, i.e. $|x - c| < \\frac{1}{L} = R$.'],
      steps: [R`Ratio of consecutive terms simplifies to a constant times $|${c === 0 ? 'x' : H.shift(c)}|${it[0].includes('2n') ? '^2' : ''}$.`, R`$R = ${R0 === Infinity ? '\\infty' : Frac.of(R0).tex()}$.`]
    };
  });

  def('interval', { title: 'Interval of Convergence', unit: 'power', desc: 'Radius plus endpoint checks.' }, lv => {
    const k = U.int(1, 4), c = lv === 1 ? 0 : U.int(-3, 3), p = U.pick([0, 1, 2]);
    const L = c - k, Rr = c + k;
    const xc = c === 0 ? 'x' : R`(${H.shift(c)})`;
    const term = R`\frac{${xc}^n}{${k === 1 ? '' : k + '^n'}${p === 0 ? (k === 1 ? '1' : '') : p === 1 ? (k === 1 ? 'n' : '\\,n') : (k === 1 ? 'n^2' : '\\,n^2')}}`;
    const iv = (l, r) => R`$${l ? '[' : '('}${L}, ${Rr}${r ? ']' : ')'}$`;
    const ans = p === 0 ? iv(0, 0) : p === 1 ? iv(1, 0) : iv(1, 1);
    const opts = [iv(0, 0), iv(1, 0), iv(0, 1), iv(1, 1)];
    return {
      q: R`Find the interval of convergence of $${sum(1, term.replace('\\frac{' + xc + '^n}{1}', xc + '^n'))}$.`, a: A.mc(ans, opts.filter(o => o !== ans)),
      hints: [R`Ratio test gives radius $R = ${k}$ centered at $${c}$: open interval $(${L}, ${Rr})$.`, 'Plug in each endpoint and test the resulting number series separately.'],
      steps: [R`Radius $${k}$, center $${c}$.`, R`At $x = ${Rr}$: $\sum\frac{1}{n^{${p}}}$ — ${p === 2 ? 'converges' : 'diverges'}. At $x = ${L}$: $\sum\frac{(-1)^n}{n^{${p}}}$ — ${p >= 1 ? 'converges (AST)' : 'diverges (terms don\'t → 0)'}.`, R`Interval: ${ans}.`]
    };
  });

  def('power-series-rep', { title: 'Functions as Power Series', unit: 'power', desc: 'Build series from 1/(1−x).' }, lv => {
    const k = U.int(2, 5), m = U.int(2, 7), j = U.int(1, 2);
    const hints = ['Start from $\\dfrac{1}{1-u} = \\sum_{n=0}^\\infty u^n$, valid for $|u| < 1$.', 'Substitute, multiply by powers of $x$, or differentiate/integrate term-by-term.'];
    const items = lv === 1 ? [
      [R`\frac{1}{1 - ${k}x}`, F(k).pow(m), R`$\frac{1}{1 - ${k}x} = \sum (${k}x)^n$, so the coefficient of $x^{${m}}$ is $${k}^{${m}}$.`],
      [R`\frac{1}{1 + x}`, F((-1) ** m), R`$\frac{1}{1+x} = \sum(-1)^n x^n$; coefficient $(-1)^{${m}}$.`],
      [R`\frac{1}{1 - x^2}`, F(m % 2 === 0 ? 1 : 0), R`$\sum x^{2n}$ has only even powers; the coefficient of $x^{${m}}$ is $${m % 2 === 0 ? 1 : 0}$.`]
    ] : lv === 2 ? [
      [R`\frac{x^{${j}}}{1 - ${k}x}`, F(k).pow(m - j), R`$x^{${j}}\sum ${k}^n x^n$: to get $x^{${m}}$ take $n = ${m - j}$: $${k}^{${m - j}}$.`],
      [R`\frac{1}{${k} - x}`, F(1, k ** (m + 1)), R`$\frac{1}{${k}}\cdot\frac{1}{1 - x/${k}} = \sum\frac{x^n}{${k}^{n+1}}$; coefficient $\frac{1}{${k}^{${m + 1}}}$.`],
      [R`\frac{x}{1 + x^2}`, F(m % 2 === 1 ? (-1) ** ((m - 1) / 2) : 0), R`$x\sum(-1)^n x^{2n} = \sum(-1)^n x^{2n+1}$; coefficient of $x^{${m}}$: $${m % 2 === 1 ? (-1) ** ((m - 1) / 2) : 0}$.`]
    ] : [
      [R`\ln(1 + x)`, F((-1) ** (m + 1), m), R`$\ln(1+x) = \sum_{n\ge1}\frac{(-1)^{n+1}x^n}{n}$; coefficient $${F((-1) ** (m + 1), m).tex()}$.`],
      [R`\arctan x`, F(m % 2 === 1 ? (-1) ** ((m - 1) / 2) : 0, m), R`$\arctan x = \sum\frac{(-1)^n x^{2n+1}}{2n+1}$ (integrate $\frac{1}{1+x^2}$); coefficient of $x^{${m}}$: $${F(m % 2 === 1 ? (-1) ** ((m - 1) / 2) : 0, m).tex()}$.`],
      [R`\frac{1}{(1 - x)^2}`, F(m + 1), R`Differentiate $\sum x^n$: $\sum n x^{n-1}$; coefficient of $x^{${m}}$ is $${m + 1}$.`]
    ];
    const it = U.pick(items);
    return { q: R`Find the coefficient of $x^{${m}}$ in the Maclaurin series of $f(x) = ${it[0]}$.`, a: A.num(it[1]), hints, steps: [it[2]] };
  });

  function taylorData(name, a) {
    // returns function giving nth derivative at center as Frac, plus display info
    switch (name) {
      case 'exp': return { t: 'e^{x}', s: 'exp(x)', c: 0, d: n => F(1) };
      case 'expk': return { t: R`e^{${a}x}`, s: R`exp(${a}*x)`, c: 0, d: n => F(a).pow(n) };
      case 'sin': return { t: '\\sin x', s: 'sin(x)', c: 0, d: n => F([0, 1, 0, -1][n % 4]) };
      case 'cos': return { t: '\\cos x', s: 'cos(x)', c: 0, d: n => F([1, 0, -1, 0][n % 4]) };
      case 'ln1': return { t: '\\ln(1 + x)', s: 'ln(1+x)', c: 0, d: n => n === 0 ? F(0) : F((-1) ** (n + 1) * U.fact(n - 1)) };
      case 'geo': return { t: '\\frac{1}{1 - x}', s: '1/(1-x)', c: 0, d: n => F(U.fact(n)) };
      case 'lnx': return { t: '\\ln x', s: 'ln(x)', c: 1, d: n => n === 0 ? F(0) : F((-1) ** (n + 1) * U.fact(n - 1)) };
      case 'recip': return { t: '\\frac{1}{x}', s: '1/x', c: a, d: n => F((-1) ** n * U.fact(n), a ** (n + 1)) };
      case 'sqrt': return { t: '\\sqrt{x}', s: 'sqrt(x)', c: a * a, d: n => { let r = F(1); for (let i = 0; i < n; i++) r = r.mul(F(1, 2).sub(i)); return r.mul(F(a).pow(1 - 2 * n)); } };
      case 'expc': return { t: 'e^{x}', s: 'exp(x)', c: a, d: n => null };
    }
  }

  def('taylor-coef', { title: 'Taylor Coefficients', unit: 'power', desc: 'Coefficient = nth derivative at the center ÷ n!.' }, lv => {
    const n = lv === 1 ? U.int(2, 4) : U.int(2, 6);
    const name = lv === 1 ? U.pick(['exp', 'expk', 'sin', 'cos']) : lv === 2 ? U.pick(['expk', 'ln1', 'geo', 'lnx', 'sin', 'cos']) : U.pick(['recip', 'sqrt', 'lnx', 'expc']);
    const a = name === 'expk' ? U.nz(-3, 3) : name === 'recip' ? U.int(1, 3) : name === 'sqrt' ? U.int(1, 3) : name === 'expc' ? U.int(1, 3) : 0;
    const D = taylorData(name, a);
    const center = D.c;
    const ct = center === 0 ? 'x' : R`(${H.shift(center)})`;
    if (name === 'expc') {
      return { q: R`Find the coefficient of $${ct}^{${n}}$ in the Taylor series of $e^{x}$ centered at $a = ${a}$.`, a: A.num(Math.exp(a) / U.fact(n), R`\frac{e^{${a}}}{${U.fact(n)}}`), hints: ['$c_n = \\dfrac{f^{(n)}(a)}{n!}$; every derivative of $e^x$ is $e^x$.'], steps: [R`$f^{(${n})}(${a}) = e^{${a}}$, so $c_{${n}} = \frac{e^{${a}}}{${n}!} = \frac{e^{${a}}}{${U.fact(n)}}$.`] };
    }
    const dn = D.d(n), cn = dn.div(U.fact(n));
    return {
      q: R`Find the coefficient of $${ct}^{${n}}$ in the Taylor series of $f(x) = ${D.t}$ centered at $a = ${center}$.`, a: A.num(cn),
      hints: ['$c_n = \\dfrac{f^{(n)}(a)}{n!}$.', 'Compute a few derivatives, look for the pattern, then evaluate at the center.'],
      steps: [R`$f^{(${n})}(${center}) = ${dn.tex()}$.`, R`$c_{${n}} = \dfrac{${dn.tex()}}{${n}!} = ${cn.tex()}$.`]
    };
  });

  def('taylor-poly', { title: 'Taylor Polynomials', unit: 'power', desc: 'Build Taylor polynomials around a center.' }, lv => {
    const n = lv === 1 ? 2 : lv === 2 ? U.int(2, 3) : U.int(3, 4);
    const name = lv === 1 ? U.pick(['exp', 'cos', 'expk', 'geo']) : lv === 2 ? U.pick(['expk', 'sin', 'ln1', 'lnx']) : U.pick(['sqrt', 'recip', 'lnx']);
    const a = name === 'expk' ? U.nz(-3, 3) : name === 'recip' ? U.int(1, 3) : name === 'sqrt' ? U.int(1, 3) : 0;
    const D = taylorData(name, a); const c = D.c;
    const cs = U.range(0, n).map(k => D.d(k).div(U.fact(k)));
    const v = c === 0 ? 'x' : '(x - ' + c + ')';
    const vt = c === 0 ? 'x' : R`(${H.shift(c)})`;
    const str = cs.map((ck, k) => ck.isZero() ? null : `${ck.str()}*${v}^${k}`).filter(Boolean).join(' + ') || '0';
    const tex = T.join(cs.map((ck, k) => T.term(ck, k === 0 ? '' : k === 1 ? vt : vt + '^{' + k + '}')));
    return {
      q: R`Find the degree-${n} Taylor polynomial $T_{${n}}(x)$ of $f(x) = ${D.t}$ centered at $a = ${c}$.`, a: A.expr(str, R`T_{${n}}(x) = ${tex}`, { dom: [c - 0.5 + (c === 0 && name === 'ln1' ? 0.2 : 0), c + 0.5] }),
      hints: ['$T_n(x) = \\sum_{k=0}^{n}\\dfrac{f^{(k)}(a)}{k!}(x - a)^k$.', 'Make a table: $k$, $f^{(k)}(x)$, $f^{(k)}(a)$, divide by $k!$.'],
      steps: [R`Derivatives at $${c}$: ${U.range(0, n).map(k => R`$f^{(${k})} = ${D.d(k).tex()}$`).join(', ')}.`, R`$T_{${n}}(x) = ${tex}$.`],
      graph: { fns: [{ f: D.s }, { f: str, dash: true, color: 2 }], x: [c - 3, c + 3], y: [-3, 4] }
    };
  });

  def('known-series', { title: 'Using Known Series', unit: 'power', desc: 'Recognize eˣ, sin, cos, ln, arctan, geometric.' }, lv => {
    const k = U.int(2, 5);
    const items = [
      [R`\sum_{n=0}^{\infty}\frac{${k}^n}{n!}`, Math.exp(k), R`e^{${k}}`, R`It's $\sum\frac{x^n}{n!} = e^x$ at $x = ${k}$.`],
      [R`\sum_{n=0}^{\infty}\frac{(-1)^n}{n!}`, 1 / Math.E, R`\frac{1}{e}`, R`$e^x$ at $x = -1$.`],
      [R`\sum_{n=0}^{\infty}\frac{(-1)^n\pi^{2n}}{(2n)!}`, -1, '-1', R`$\cos x$ at $x = \pi$: $\cos\pi = -1$.`],
      [R`\sum_{n=0}^{\infty}\frac{(-1)^n\pi^{2n+1}}{6^{2n+1}(2n+1)!}`, 0.5, R`\frac{1}{2}`, R`$\sin x$ at $x = \frac{\pi}{6}$.`],
      [R`\sum_{n=1}^{\infty}\frac{(-1)^{n+1}}{n}`, Math.LN2, R`\ln 2`, R`$\ln(1 + x)$ at $x = 1$.`],
      [R`\sum_{n=0}^{\infty}\frac{(-1)^n}{2n+1}`, Math.PI / 4, R`\frac{\pi}{4}`, R`$\arctan x$ at $x = 1$.`],
      [R`\sum_{n=1}^{\infty}\frac{1}{n\,${k}^n}`, Math.log(k / (k - 1)), R`\ln\frac{${k}}{${k - 1}}`, R`$-\ln(1 - x) = \sum\frac{x^n}{n}$ at $x = \frac{1}{${k}}$: $-\ln\left(1 - \frac{1}{${k}}\right) = \ln\frac{${k}}{${k - 1}}$.`],
      [R`\sum_{n=0}^{\infty}\frac{${k}^{2n}(-1)^n}{(2n)!}`, Math.cos(k), R`\cos ${k}`, R`$\cos x$ at $x = ${k}$.`]
    ];
    if (lv === 3 && U.chance()) {
      const m = U.int(1, 3);
      return { q: R`Using the Maclaurin series for $e^{x}$, find the Maclaurin series coefficient of $x^{${2 * m}}$ for $e^{-x^2}$.`, a: A.num(F((-1) ** m, U.fact(m))), hints: ['Substitute $u = -x^2$ into $e^u = \\sum\\frac{u^n}{n!}$.'], steps: [R`$e^{-x^2} = \sum\frac{(-1)^n x^{2n}}{n!}$; for $x^{${2 * m}}$ take $n = ${m}$.`, R`Coefficient $= \frac{(-1)^{${m}}}{${m}!} = ${F((-1) ** m, U.fact(m)).tex()}$.`] };
    }
    const it = U.pick(lv === 1 ? items.slice(0, 3) : items);
    return { q: R`Find the exact sum: $\displaystyle ${it[0]}$.`, a: A.num(it[1], it[2]), hints: ['Match the pattern to a known Maclaurin series: $e^x$, $\\sin x$, $\\cos x$, $\\ln(1+x)$, $\\arctan x$, $\\frac{1}{1-x}$.'], steps: [it[3], R`Sum $= ${it[2]}$.`] };
  });

  def('series-error', { title: 'Approximation Error', unit: 'power', desc: 'How many terms? Error bounds.' }, lv => {
    const k = lv === 1 ? 2 : lv === 2 ? 3 : 4;
    const tol = Math.pow(10, -k);
    const t = U.pick(['fact', 'p2', 'p3']);
    let need, term, how;
    if (t === 'fact') { let N = 0; while (1 / U.fact(N + 1) >= tol) N++; need = N; term = R`\frac{(-1)^n}{n!}`; how = R`Need $\frac{1}{(N+1)!} < 10^{-${k}}$: smallest $N$ is $${N}$.`; }
    else { const p = t === 'p2' ? 2 : 3; let N = 1; while (1 / Math.pow(N + 1, p) >= tol) N++; need = N; term = R`\frac{(-1)^{n+1}}{n^{${p}}}`; how = R`Need $\frac{1}{(N+1)^{${p}}} < 10^{-${k}}$: smallest $N$ is $${N}$.`; }
    const lo = t === 'fact' ? 0 : 1;
    return {
      q: R`What is the smallest $N$ such that the partial sum $S_N = \sum_{n=${lo}}^{N}$ of $${sum(lo, term)}$ is guaranteed to be within $10^{-${k}}$ of the true sum?`, a: A.num(need),
      hints: ['Alternating Series Estimation Theorem: $|S - S_N| \\le b_{N+1}$, the first omitted term.', 'Find the smallest $N$ making $b_{N+1} < 10^{-' + k + '}$.'],
      steps: [how]
    };
  });
})();
