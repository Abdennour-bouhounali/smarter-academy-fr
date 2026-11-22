import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique EXACTE (rationnels [num, den]) : les moyennes 10,5 · 9,75 · 11,25 ne passent pas par des flottants ──
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const R = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; return [n / g, d / g]; };
const add = (x, y) => R(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const sub = (x, y) => add(x, [-y[0], y[1]]);
const mul = (x, y) => R(x[0] * y[0], x[1] * y[1]);
const div = (x, y) => R(x[0] * y[1], x[1] * y[0]);
const num = (x) => x[0] / x[1];
const sum = (xs) => xs.reduce((t, v) => t + v, 0);
const mean = (xs) => R(sum(xs), xs.length);
const sorted = (xs) => [...xs].sort((a, b) => a - b);
const median = (xs) => { const s = sorted(xs); const n = s.length; return n % 2 ? R(s[(n - 1) / 2]) : R(s[n / 2 - 1] + s[n / 2], 2); };
const range = (xs) => Math.max(...xs) - Math.min(...xs);
/** Moyenne de groupes réunis : Σ n·m ÷ Σ n (m en rationnel). */
const weighted = (groups) => div(groups.reduce((t, [n, m]) => add(t, mul(R(n), m)), R(0)), R(sum(groups.map(([n]) => n))));
const dec = (s) => { const [w, f = ''] = String(s).split(','); return R(Number(w + f), 10 ** f.length); };

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceOf = (id, part, k) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice')[k];

// ── Vérificateur des ÉGALITÉS écrites ($…$ des explain, lines, options, énoncés) ─────────────
function evalExpr(src) {
  const s = src.replace(/\\dfrac|\\frac/g, 'F').replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\{,\}/g, '.').replace(/\s+/g, '');
  if (!/^[\d.+\-*/()FQ{}]+$/.test(s) || s === '') return null;
  let i = 0;
  const fail = () => { throw new Error('parse'); };
  const group = () => { if (s[i] !== '{') fail(); i++; const v = expr(); if (s[i] !== '}') fail(); i++; return v; };
  const atom = () => {
    if (s[i] === '(') { i++; const v = expr(); if (s[i] !== ')') fail(); i++; return v; }
    if (s[i] === 'F') { i++; const n = group(); const d = group(); return div(n, d); }
    const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
    if (i === j) fail();
    const [w, f = ''] = s.slice(j, i).split('.');
    return R(Number(w + f), 10 ** f.length);
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = atom(); v = op === '*' ? mul(v, w) : div(v, w); } return v; };
  const expr = () => { let v = s[i] === '-' ? (i++, mul(R(-1), prod())) : prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? add(v, w) : sub(v, w); } return v; };
  try { const v = expr(); return i === s.length ? v : null; } catch { return null; }
}
/** Chaque îlot $…$ : membres « = » égaux exactement, « < » / « > » vrais. Renvoie le nombre d'îlots vérifiés. */
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    const ineq = f.split(/(<|>)/);
    if (ineq.length >= 3) {
      const vals = ineq.filter((_, k) => k % 2 === 0).map(evalExpr);
      if (vals.every(Boolean)) {
        for (let k = 1; k < ineq.length; k += 2) {
          const [a, b] = [num(vals[(k - 1) / 2]), num(vals[(k + 1) / 2])];
          expect(ineq[k] === '<' ? a < b : a > b, `${where}: ${f}`).toBe(true);
        }
        checked++;
      }
      continue;
    }
    const sides = f.split('=').map(evalExpr);
    if (sides.length < 2 || sides.some((v) => v == null)) continue;
    for (const v of sides.slice(1)) expect(v, `${where}: ${f}`).toEqual(sides[0]);
    checked++;
  }
  return checked;
}
const textsOf = (p) => [
  ['statement', p.statement],
  ...p.parts.flatMap((part) => [
    [`${part.label} question`, part.question],
    ...part.steps.flatMap((s, i) => [
      [`${part.label} step ${i + 1} prompt`, s.prompt],
      [`${part.label} step ${i + 1} explain`, s.explain],
      ...(s.options ?? []).map((o, k) => [`${part.label} step ${i + 1} option ${k + 1}`, o]),
      ...(s.lines ?? []).map((l, k) => [`${part.label} step ${i + 1} line ${k + 1}`, l]),
    ]),
  ]),
].filter(([, t]) => t);

// ── Les données, lues dans les tableaux (pas retapées) ───────────────────────
const P1 = PROBLEM['masala-1'].table.rows.map(([, nb, mb, ng, mg]) => ({ boys: [Number(nb), dec(mb)], girls: [Number(ng), dec(mg)] }));
const RAIN = PROBLEM['masala-2'].table.rows[0].slice(1).map(Number);
const NOV = 10; // index de نوفمبر dans la ligne
const [FAIR_A, FAIR_B] = PROBLEM['masala-3'].table.rows.map((r) => r.slice(1).map(Number));
const STAND = 600;

describe('les مسائل du درس 4 « ترييض وقراءة وضعيات إحصائية وتفسير المؤشرات »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage])).toEqual([
      [5, '05', 'masala-1', 'practice_lab'], [6, '06', 'masala-2', 'practice_lab'], [7, '07', 'masala-3', 'practice_lab'],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEMS.map((p) => p.id)).toEqual(['masala-1', 'masala-2', 'masala-3']);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 5], ['masala-2', 6], ['masala-3', 7]]);
    expect(sum(LESSON_CONFIG.modules.map((m) => m.estimatedMin))).toBe(74);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('every data table matches the statement (rows as long as the head, the decoys are numbers)', () => {
    for (const p of PROBLEMS) {
      for (const row of p.table.rows) expect(row.length).toBe(p.table.head.length);
      expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), `${p.id}: a numeric decoy`).toBe(true);
    }
    // l'énoncé de la مسألة 1 (prose, montré seul par LessonProblemCard) porte les mêmes nombres que son tableau
    const st = LESSON_CONFIG.lessonProblem.statement;
    for (const s of ['10 ذكور معدّلهم 8', '20 أنثى معدّلهنّ $12{,}5$', '20 ذكرًا معدّلهم 9', '10 إناث معدّلهنّ $13{,}5$']) expect(st).toContain(s);
    expect(P1.map(({ boys, girls }) => boys[0] + girls[0])).toEqual([30, 30]);
  });

  it('مسألة 1 — the numbers are computed, not typed (Simpson : chaque groupe de (ب) est meilleur, (أ) l’emporte)', () => {
    const [A, B] = P1;
    const total = ({ boys, girls }) => add(mul(R(boys[0]), boys[1]), mul(R(girls[0]), girls[1]));
    const mA = weighted([A.boys, A.girls]);
    const mB = weighted([B.boys, B.girls]);
    expect(expectedOf('masala-1', 0)).toEqual([num(total(A)), num(mA), num(total(B)), num(mB)]);
    expect([num(total(A)), num(mA), num(total(B)), num(mB)]).toEqual([330, 11, 315, 10.5]);
    // le paradoxe : chaque groupe de (ب) meilleur, la classe (أ) meilleure ; la moyenne des moyennes inverse
    expect(num(B.boys[1]) > num(A.boys[1]) && num(B.girls[1]) > num(A.girls[1])).toBe(true);
    expect(num(mA) > num(mB)).toBe(true);
    const mmA = div(add(A.boys[1], A.girls[1]), R(2));
    const mmB = div(add(B.boys[1], B.girls[1]), R(2));
    expect(num(mmB) > num(mmA)).toBe(true);
    expect(expectedOf('masala-1', 1)).toEqual([num(mmB)]);
    expect(choiceOf('masala-1', 1, 1).options[choiceOf('masala-1', 1, 1).correct]).toBe('القسم (أ)');
    // 3) حصص الدعم : (ب) doit atteindre mA × 30, filles inchangées
    const need = mul(mA, R(B.boys[0] + B.girls[0]));
    const girlsB = mul(R(B.girls[0]), B.girls[1]);
    const boysNeed = sub(need, girlsB);
    const boysMean = div(boysNeed, R(B.boys[0]));
    const rise = sub(boysMean, B.boys[1]);
    expect(expectedOf('masala-1', 2)).toEqual([num(need), num(girlsB), num(boysNeed), num(boysMean), num(rise)]);
    expect(num(rise) > num(sub(mA, mB))).toBe(true); // 0,75 > 0,5 : les garçons ne sont que 20 sur 30
    // aucune valeur demandée en 3) ne coïncide avec une valeur déjà montrée (pas de faux indice)
    const shown = [A.boys[1], A.girls[1], B.boys[1], B.girls[1], mA, mB, mmA, mmB].map(num);
    expect(shown).not.toContain(num(boysMean));
    expect(shown).not.toContain(num(rise));
  });

  it('مسألة 2 — the numbers are computed, not typed (une valeur extrême : moyenne contre médiane)', () => {
    expect(RAIN).toHaveLength(12);
    const m = mean(RAIN);
    const s = sorted(RAIN);
    expect(expectedOf('masala-2', 0)).toEqual([sum(RAIN), num(m), s[5], s[6], num(median(RAIN))]);
    expect([sum(RAIN), num(m), num(median(RAIN))]).toEqual([960, 80, 69]);
    expect(RAIN[NOV]).toBe(300);
    expect(RAIN[NOV]).toBe(Math.max(...RAIN));
    expect(RAIN).not.toContain(num(m)); // aucun mois exactement à la moyenne : « أقلّ من » sans ambiguïté
    const below = RAIN.filter((v) => v < num(m)).length;
    expect(expectedOf('masala-2', 1)).toEqual([below]);
    expect(below).toBe(7);
    expect(RAIN.filter((v) => v < num(median(RAIN))).length).toBe(6);
    expect(RAIN[NOV] > sum(RAIN) / 4).toBe(true); // « أكثر من ربع مجموع السنة »
    const rest = RAIN.filter((_, k) => k !== NOV);
    expect(expectedOf('masala-2', 2)).toEqual([sum(rest), num(mean(rest)), num(median(rest))]);
    expect(sum(rest)).toBe(num(m) * 12 - RAIN[NOV]);
    expect([num(sub(m, mean(rest))), num(sub(median(RAIN), median(rest)))]).toEqual([20, 3]);
    const c = choiceOf('masala-2', 2, 0);
    expect(c.options[c.correct]).toContain('نقص بـ 20 ملم، والوسيط نقص بـ 3 ملم');
  });

  it('مسألة 3 — the numbers are computed, not typed (même moyenne, dispersions opposées)', () => {
    expect([FAIR_A.length, FAIR_B.length]).toEqual([6, 6]);
    expect(expectedOf('masala-3', 0)).toEqual([sum(FAIR_A), num(mean(FAIR_A)), sum(FAIR_B), num(mean(FAIR_B))]);
    expect(num(mean(FAIR_A))).toBe(num(mean(FAIR_B)));
    expect(expectedOf('masala-3', 1)).toEqual([range(FAIR_A), range(FAIR_B), num(median(FAIR_B))]);
    expect([range(FAIR_A), range(FAIR_B), num(median(FAIR_B))]).toEqual([40, 900, 310]);
    // le stand : « أ » jamais au-dessus de 600 ; « ب » deux jours au-dessus, alors que moyenne ET médiane sont dessous
    expect(Math.max(...FAIR_A)).toBeLessThan(STAND);
    expect(num(mean(FAIR_B))).toBeLessThan(STAND);
    expect(num(median(FAIR_B))).toBeLessThan(STAND);
    const over = FAIR_B.filter((v) => v > STAND).map((v) => v - STAND);
    expect(over).toEqual([550, 100]); // jours 5 et 6, dans cet ordre
    expect(expectedOf('masala-3', 2)).toEqual([...over, sum(over)]);
    expect(PROBLEM['masala-3'].statement).toContain(`${STAND} زائر`);
  });

  it('every written equality and inequality is true (exact arithmetic)', () => {
    let checked = 0;
    for (const p of PROBLEMS) for (const [where, t] of textsOf(p)) checked += checkText(t, `${p.id} ${where}`);
    expect(checked).toBeGreaterThan(40);
  });

  it('the equality checker catches a wrong number', () => {
    expect(() => checkText('$\\dfrac{315}{30} = 11{,}5$', 'mutation')).toThrow();
    expect(() => checkText('$960 - 300 = 650$', 'mutation')).toThrow();
    expect(() => checkText('$520 > 600$', 'mutation')).toThrow();
  });
});
