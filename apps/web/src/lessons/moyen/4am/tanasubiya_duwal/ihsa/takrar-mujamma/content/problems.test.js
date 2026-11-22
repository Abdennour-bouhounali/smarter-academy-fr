import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique EXACTE : rationnels [num, den], aucune virgule flottante dans un تواتر. ──
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const R = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(Math.abs(n), d) || 1; return [n / g, d / g]; };
const rAdd = (x, y) => R(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const rSub = (x, y) => R(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
const rMul = (x, y) => R(x[0] * y[0], x[1] * y[1]);
const rDiv = (x, y) => R(x[0] * y[1], x[1] * y[0]);
const rEq = (x, y) => x[0] * y[1] === y[0] * x[1];
/** Un nombre décimal saisi (57.5, 0.32) → rationnel exact. */
const dec = (v) => { const [i, f = ''] = String(v).split('.'); return R(Number(i + f), 10 ** f.length); };
/** Pourcentage exact de f sur n : [num, den]. */
const pct = (f, n) => R(f * 100, n);

const sum = (a) => a.reduce((t, x) => t + x, 0);
/** التكرار المجمع الصاعد / النازل de chaque valeur (ou فئة) d'un tableau d'effectifs. */
const up = (freqs) => freqs.map((_, i) => sum(freqs.slice(0, i + 1)));
const down = (freqs) => freqs.map((_, i) => sum(freqs.slice(i)));
/** Les effectifs lus dans le `table` de l'énoncé : la mathématique part de ce que l'élève VOIT. */
const freqsOf = (id) => PROBLEM[id].table.rows[0].slice(1).map(Number);
const valuesOf = (id) => PROBLEM[id].table.head.slice(1);

const numericOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric');
const expectedOf = (id, part) => numericOf(id, part).map((s) => s.expected);
const correctOf = (id, part, k) => { const s = PROBLEM[id].parts[part].steps.filter((st) => st.kind === 'choice')[k]; return s.options[s.correct]; };

// ── Vérificateur des ÉGALITÉS écrites (explain, lines, bonnes options) ──────────────────
// Évalue + − × \frac, parenthèses, décimaux « 0{,}35 », pourcentages « 65\% », exactement.
function evalExpr(src) {
  const s = src
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\{,\}/g, '.').replace(/\\times/g, '*').replace(/\\%/g, '%').replace(/\s+/g, '');
  if (!/^[\d.+\-*/()%]+$/.test(s)) return null; // une lettre (m, \le…) : non vérifiable ici
  let i = 0;
  const num = () => {
    let v;
    if (s[i] === '(') { i++; v = add(); i++; } else {
      const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
      if (j === i) throw new Error(`bad number in ${src}`);
      v = dec(s.slice(j, i));
    }
    if (s[i] === '%') { i++; v = rDiv(v, R(100)); }
    return v;
  };
  const prod = () => { let v = num(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = num(); v = op === '*' ? rMul(v, w) : rDiv(v, w); } return v; };
  const add = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? rAdd(v, w) : rSub(v, w); } return v; };
  const v = add();
  return i === s.length ? v : null;
}
/** Chaque formule $…$ : ses membres « = » sont égaux, « < » / « > » est vrai. */
function checkText(text) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    for (const op of ['<', '>']) {
      const parts = f.split(op);
      if (parts.length === 2) {
        const [x, y] = parts.map(evalExpr);
        if (x && y) { const lt = x[0] * y[1] < y[0] * x[1]; expect(op === '<' ? lt : !lt && !rEq(x, y), f).toBe(true); checked++; }
      }
    }
    if (f.includes('<') || f.includes('>')) continue;
    const sides = f.split('=').map(evalExpr);
    if (sides.length < 2 || sides.some((v) => v == null)) continue;
    for (const v of sides.slice(1)) expect(rEq(v, sides[0]), `${f}`).toBe(true);
    checked++;
  }
  return checked;
}
const allTexts = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);

describe('les مسائل du درس 1 de l’unité 8 « التكرار المجمع والتواتر المجمع »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage, m.estimatedMin])).toEqual([
      [5, '05', 'masala-1', 'practice_lab', 8], [6, '06', 'masala-2', 'practice_lab', 8], [7, '07', 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(74);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 5], ['masala-2', 6], ['masala-3', 7]]);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('data: 4–5 useful items, and at least one useless item that is a number', () => {
    for (const p of PROBLEMS) {
      const useful = p.data.filter((d) => d.useful).length;
      expect(useful >= 4 && useful <= 5, p.id).toBe(true);
      expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
      for (const d of p.data) expect(d.text.includes('$'), `${p.id} ${d.id}`).toBe(false);
    }
  });

  it('every statement shows its table (« الجدول »), rows as long as the head', () => {
    for (const p of PROBLEMS) {
      expect(p.statement, p.id).toMatch(/الجدول/);
      expect(p.table.rows.every((r) => r.length === p.table.head.length), p.id).toBe(true);
    }
  });

  it('no bare « a/b », « % » or « x² » in the Arabic prose', () => {
    for (const p of PROBLEMS) for (const t of allTexts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/\d\s*\/\s*\d/);
      expect(prose, `${p.id}: ${t}`).not.toMatch(/%/);
    }
  });

  it('no forbidden notion (المدى، الوسيط، المتوسط) — teachingScope.exclude', () => {
    for (const p of PROBLEMS) for (const t of allTexts(p)) expect(t, p.id).not.toMatch(/المدى|الوسيط|المتوسط الحسابي|الوسط/);
  });

  it('every written equality (explain, solution lines, correct options) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part) => part.steps.forEach((s) => {
      for (const t of [s.explain, s.prompt, ...(s.lines ?? [])].filter(Boolean)) checked += checkText(t);
      if (s.kind === 'choice') checked += checkText(s.options[s.correct]);
    }));
    expect(checked).toBeGreaterThan(35);
  });

  it('the equality checker catches a wrong number', () => {
    expect(() => checkText('$7 + 8 + 4 = 20$')).toThrow();
    expect(() => checkText('$\\frac{19}{25} = 75\\%$')).toThrow();
    expect(() => checkText('$0{,}32 + 0{,}23 + 0{,}1 = 0{,}66$')).toThrow();
    expect(() => checkText('$67\\% > 75\\%$')).toThrow();
  });

  it('مسألة 1 — the numbers are computed from the table, not typed', () => {
    const f = freqsOf('masala-1'), v = valuesOf('masala-1');
    const N = sum(f);
    expect(N).toBe(25); // « 25 طفلًا » de l'énoncé
    expect(PROBLEM['masala-1'].statement).toContain(`${N} طفلًا`);
    const slide = down(f)[v.indexOf('140')], train = up(f)[v.indexOf('135')];
    expect(expectedOf('masala-1', 0)).toEqual([slide, train]);
    // le piège : le النازل de 145 (oublie 140) et le تكرار seul donnent d'autres nombres
    expect(down(f)[v.indexOf('145')]).not.toBe(slide);
    expect(f[v.indexOf('140')]).not.toBe(slide);
    // 2) les deux تواتر en %, exacts, et leur somme 100 % (aucune قامة entre 135 et 140)
    const [p140, p135] = expectedOf('masala-1', 1);
    expect(rEq(dec(p140), pct(slide, N))).toBe(true);
    expect(rEq(dec(p135), pct(train, N))).toBe(true);
    expect(slide + train).toBe(N);
    expect(p140 + p135).toBe(100);
    expect(correctOf('masala-1', 1, 1)).toContain(`${p140}\\% + ${p135}\\% = 100\\%`);
    // 3) le budget
    const cost = slide * 300 + train * 150;
    expect(expectedOf('masala-1', 2)).toEqual([slide * 300, train * 150, cost, cost - 6500]);
    expect(cost).toBeGreaterThan(6500);
    expect(PROBLEM['masala-1'].statement).toContain('6500 دج');
  });

  it('مسألة 2 — the numbers are computed from the table, not typed', () => {
    const f = freqsOf('masala-2'), v = valuesOf('masala-2');
    const N = sum(f);
    expect(N).toBe(40);
    expect(PROBLEM['masala-2'].statement).toContain(`${N} منخرطًا`);
    const cup = down(f)[v.indexOf('13')];
    const [n1, p1] = expectedOf('masala-2', 0);
    expect(n1).toBe(cup);
    expect(rEq(dec(p1), pct(cup, N))).toBe(true);
    expect(numericOf('masala-2', 0)[1].display).toBe(String(p1).replace('.', ','));
    // 2) le أمين a oublié la valeur elle-même : 8 = تكرارات 10 et 11
    const i12 = v.indexOf('12');
    expect(PROBLEM['masala-2'].parts[1].question).toContain(`للعمر 12 هو ${up(f)[i12] - f[i12]}.`);
    expect(expectedOf('masala-2', 1)).toEqual([up(f)[i12]]);
    expect(up(f)[i12] + cup).toBe(N); // « 12 على الأكثر » et « 13 على الأقل » se partagent le club
    // 3) la saison suivante : 12 على الأقل maintenant, sans les 15 ans qui partent
    const next = down(f)[i12] - f[v.indexOf('15')];
    expect(next).toBe(f[i12] + f[v.indexOf('13')] + f[v.indexOf('14')]);
    expect(expectedOf('masala-2', 2)).toEqual([down(f)[i12], next, next * 1500]);
  });

  it('مسألة 3 — the numbers are computed from the table (classes), not typed', () => {
    const f = freqsOf('masala-3');
    const N = sum(f);
    expect(N).toBe(200);
    expect(PROBLEM['masala-3'].statement).toContain(`${N} حبّة`);
    // les bornes des فئات se suivent : [2;4[, [4;6[, [6;8[, [8;10[, [10;12]
    const bounds = valuesOf('masala-3').map((c) => c.match(/\d+/g).map(Number));
    expect(bounds).toEqual([[2, 4], [4, 6], [6, 8], [8, 10], [10, 12]]);
    const k6 = 2, k8 = 2; // la فئة 6 ≤ m < 8
    // 1) النازل de 6 ≤ m < 8 en %, puis le nombre de حبّات
    const [rel68, d68, nTrader] = expectedOf('masala-3', 0);
    expect(rEq(dec(rel68), R(f[k6], N))).toBe(true);
    expect(rEq(dec(d68), pct(down(f)[k6], N))).toBe(true);
    expect(nTrader).toBe(down(f)[k6]);
    // 2) « moins de 8 kg » = الصاعد de 6 ≤ m < 8 ; 3/4 = 75 % : l'ouvrier se trompe
    const [lt8] = expectedOf('masala-3', 1);
    expect(rEq(dec(lt8), pct(up(f)[k8], N))).toBe(true);
    expect(lt8).toBeLessThan(75);
    expect(rEq(pct(up(f)[3], N), R(90))).toBe(true); // le distracteur « 90 % » = الصاعد de 8 ≤ m < 10
    expect(rEq(pct(f[k6], N), R(32))).toBe(true); // le distracteur « 32 % » = la فئة seule
    // 3) le marché local (moins de 6 kg) et la recette
    const market = up(f)[1];
    expect(market + nTrader).toBe(N);
    expect(expectedOf('masala-3', 2)).toEqual([market, nTrader * 450, market * 200, nTrader * 450 + market * 200]);
  });
});
