import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Une fonction affine x ⟼ ax + b, donnée par ses deux coefficients. ──
const affine = (a, b) => (x) => a * x + b;
/** Le nombre dont l'image est m (a ≠ 0) : on retranche b, puis on divise par a — exact ou rien. */
const antecedent = (a, b, m) => {
  expect(a).not.toBe(0);
  expect((m - b) % a, `(${m} − ${b}) n'est pas un multiple de ${a}`).toBe(0);
  return (m - b) / a;
};

const stepsOf = (id, part) => PROBLEM[id].parts[part].steps;
const expectedOf = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choicesOf = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'choice');
const correctOf = (id, part, k) => { const s = choicesOf(id, part)[k]; return s.options[s.correct]; };
const numbersIn = (t) => (String(t).match(/\d+/g) ?? []).map(Number);

// ── Vérificateur des RELATIONS écrites (explain, prompt, lines, bonne option, corrections) ──
// Chaque formule $…$ est découpée sur = \neq < > ; chaque membre purement numérique
// (entiers, ×, \div, +, −, parenthèses) est évalué, et chaque relation entre deux membres
// numériques VOISINS est vérifiée. Les membres qui contiennent une lettre (x, S(15), a…) ou
// \ldots sont ignorés.
function evalExpr(src) {
  const s = src.replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\\left|\\right/g, '').replace(/\s+/g, '');
  if (!/^[\d.+\-*/()]+$/.test(s) || s === '') return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '-') { i++; return -atom(); }
    let v;
    if (s[i] === '(') { i++; v = sum(); if (s[i++] !== ')') throw new Error(`bad parens in ${src}`); } else {
      const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
      if (i === j) throw new Error(`bad number in ${src}`);
      v = Number(s.slice(j, i));
    }
    return v;
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = atom(); v = op === '*' ? v * w : v / w; } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? v + w : v - w; } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    const parts = f.split(/(=|<|>|\\neq)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1]), parts[k], evalExpr(parts[k + 1])];
      if (x == null || y == null) continue;
      const ok = { '=': x === y, '<': x < y, '>': x > y, '\\neq': x !== y }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}

/**
 * Vérificateur des IMAGES écrites : « $F(48) = 35 \times 48 + 450 = …$ », « $S(20) = …$ » — la
 * lettre dit la fonction, l'argument est remplacé et le membre de droite doit être l'image.
 */
const FUNCTIONS = {
  'masala-1': { S: affine(240, 38000) },
  'masala-2': { F: affine(35, 450) },
  'masala-3': { A: affine(50, 80), B: affine(70, 0), C: affine(0, 400) },
};
function checkImages(id, text, where) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    const m = /^\s*([SFABC])\((\d+)\)\s*=\s*(.+)$/.exec(f);
    if (!m) continue;
    const fn = FUNCTIONS[id][m[1]];
    expect(fn, `${where}: ${m[1]} is not a function of ${id}`).toBeTypeOf('function');
    const first = evalExpr(m[3].split('=')[0]);
    const last = evalExpr(m[3].split('=').at(-1));
    expect(last, `${where}: ${f}`).toBe(fn(Number(m[2])));
    if (first != null) expect(first, `${where}: ${f}`).toBe(fn(Number(m[2])));
    checked++;
  }
  return checked;
}

const allTexts = (p) => [
  p.statement,
  ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [
    s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? []),
    ...(s.rows ?? []).flatMap((r) => [r.label, ...r.options, r.correction]),
  ])]),
].filter(Boolean);

describe('les مسائل du درس 1 (unité 7) « مفهوم وتعيين دالة تآلفية »', () => {
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
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(69);
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

  it('data: 4+ useful items, and at least one useless item that is a number', () => {
    for (const p of PROBLEMS) {
      expect(p.data.filter((d) => d.useful).length).toBeGreaterThanOrEqual(4);
      expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
      for (const d of p.data) expect(d.text.includes('$'), `${p.id} ${d.id}`).toBe(false);
    }
  });

  it('no bare letter or formula in the Arabic prose — every formula is a $…$ island; « دج », never « DA »', () => {
    for (const p of PROBLEMS) for (const t of allTexts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/\b[xyabmSFABC]\b|[=×÷<>+]|\d\s*\/\s*\d|DA/);
    }
  });

  it('every written relation (explain, prompt, solution lines, correct options, corrections) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part) => part.steps.forEach((s, si) => {
      const where = `${p.id} ${part.label} step ${si + 1}`;
      const texts = [s.explain, s.prompt, ...(s.lines ?? []), ...(s.rows ?? []).map((r) => r.correction)].filter(Boolean);
      if (s.kind === 'choice') texts.push(s.options[s.correct]);
      for (const t of texts) checked += checkText(t, where) + checkImages(p.id, t, where);
    }));
    expect(checked).toBeGreaterThan(70);
  });

  it('the relation checkers fail on a mutated number (self-test)', () => {
    expect(() => checkText('$240 \\times 15 + 38000 = 41500$', 'mutant')).toThrow();
    expect(() => checkText('$4320 \\div 240 = 19$', 'mutant')).toThrow();
    expect(() => checkText('$25 > 30$', 'mutant')).toThrow();
    expect(() => checkImages('masala-2', '$F(66) = 35 \\times 66 + 450 = 2750$', 'mutant')).toThrow();
    expect(() => checkImages('masala-3', '$B(9) = 640$', 'mutant')).toThrow();
    expect(checkText('$x = 450 \\div 50 = 9$ و $b = 80 \\neq 0$', 'ok')).toBe(2);
    expect(checkImages('masala-1', '$S(20) = 240 \\times 20 + 38000 = 42800$', 'ok')).toBe(1);
  });

  it('مسألة 1 — the salary, Mourad’s hours, Souad’s target and the cap are computed, not typed', () => {
    const base = 38000, perHour = 240, cap = 20;
    const S = affine(perHour, base);
    const st = LESSON_CONFIG.lessonProblem.statement;
    for (const n of [base, perHour, cap]) expect(numbersIn(st)).toContain(n);
    // 1) l'expression et S(15)
    expect(correctOf('masala-1', 0, 1)).toBe(`$S(x) = ${perHour}x + ${base}$`);
    expect(expectedOf('masala-1', 0)).toEqual([perHour * 15, S(15)]);
    expect(S(15)).toBe(41600);
    // 2) 42320 → 18 heures ; S n'est pas linéaire (b ≠ 0) : produits en croix différents
    const mourad = 42320;
    const h = antecedent(perHour, base, mourad);
    expect(h).toBe(18);
    expect(h).toBeLessThanOrEqual(cap);
    expect(expectedOf('masala-1', 1)).toEqual([mourad - base, h]);
    expect(S(15) * h).not.toBe(mourad * 15);
    expect(S(0)).toBe(base);
    // 3) 44000 → 25 heures > 20 : impossible ; la plus grande paie est S(20)
    const souad = 44000;
    const need = antecedent(perHour, base, souad);
    expect(need).toBe(25);
    expect(need).toBeGreaterThan(cap);
    expect(S(cap)).toBeLessThan(souad);
    expect(expectedOf('masala-1', 2)).toEqual([souad - base, need, S(cap)]);
    expect(S(cap)).toBe(42800);
    expect(correctOf('masala-1', 2, 0)).toContain(`${need} ساعة`);
    expect(correctOf('masala-1', 2, 1)).toBe(`$S(${cap})$`);
  });

  it('مسألة 2 — the bill, the table and the leak are computed, not typed', () => {
    const fixed = 450, rate = 35;
    const F = affine(rate, fixed);
    const { table } = PROBLEM['masala-2'];
    const [usage, bill] = table.rows;
    // le tableau : (48, 2130), (60, …), (…, 2970) — chaque nombre écrit est cohérent avec F
    expect(F(Number(usage[1]))).toBe(Number(bill[1]));
    expect([usage[2], usage[3], bill[2]]).toEqual(['60', '…', '…']);
    expect(correctOf('masala-2', 0, 0)).toBe(`$F(x) = ${rate}x + ${fixed}$`);
    expect(correctOf('masala-2', 0, 1)).toBe(`$a = ${rate}$ ، $b = ${fixed}$`);
    expect(expectedOf('masala-2', 0)).toEqual([F(48)]);
    // 2) F(60) et le nombre dont l'image est 2970
    const third = antecedent(rate, fixed, Number(bill[3]));
    expect(expectedOf('masala-2', 1)).toEqual([F(Number(usage[2])), Number(bill[3]) - fixed, third]);
    expect([F(60), third]).toEqual([2550, 72]);
    // 3) la fuite : 4650 dج pour un usage habituel de 66 m³
    const leakBill = 4650, usual = 66;
    const recorded = antecedent(rate, fixed, leakBill);
    const lost = recorded - usual;
    const cost = leakBill - F(usual);
    expect(cost).toBe(rate * lost); // la partie fixe disparaît dans la différence
    expect(expectedOf('masala-2', 2)).toEqual([recorded, lost, cost]);
    expect([recorded, lost, cost]).toEqual([120, 54, 1890]);
    expect(F(lost)).not.toBe(cost); // le piège : une facture entière pour l'eau perdue
    expect(F(lost)).toBe(2340);
  });

  it('مسألة 3 — the three tariffs, the 5-hour stay and the 530 dج visitor are computed, not typed', () => {
    const A = affine(50, 80), B = affine(70, 0), C = affine(0, 400);
    // 1) les expressions ; B linéaire (b = 0), C constante (a = 0)
    const batch = stepsOf('masala-3', 0).find((s) => s.kind === 'batch');
    expect(batch.rows.map((r) => r.options[r.correct])).toEqual(['$A(x) = 50x + 80$', '$B(x) = 70x$', '$C(x) = 400$']);
    expect(B(0)).toBe(0);
    expect([C(0), C(1), C(9)]).toEqual([400, 400, 400]);
    expect(correctOf('masala-3', 0, 0)).toContain('$B$');
    expect(correctOf('masala-3', 0, 1)).toContain('$C$');
    // 2) 5 heures : A la moins chère ; 1 heure : B
    expect(expectedOf('masala-3', 1)).toEqual([A(5), B(5), C(5)]);
    expect(A(5)).toBeLessThan(B(5));
    expect(B(5)).toBeLessThan(C(5));
    expect(correctOf('masala-3', 1, 0)).toBe('الصيغة أ');
    expect(B(1)).toBeLessThan(A(1));
    expect(B(1)).toBeLessThan(C(1));
    expect(correctOf('masala-3', 1, 1)).toBe('الصيغة ب');
    // 3) 530 دج à la formule أ → 9 heures ; B(9) plus cher ; économie avec la carte
    const paid = 530;
    const hours = antecedent(50, 80, paid);
    expect(expectedOf('masala-3', 2)).toEqual([paid - 80, hours, paid - C(hours)]);
    expect([hours, B(hours), paid - C(hours)]).toEqual([9, 630, 130]);
    expect(B(hours)).toBeGreaterThan(paid);
    expect(correctOf('masala-3', 2, 1)).toBe(`كان سيدفع أكثر: $B(9) = ${B(hours)}$`);
    expect(paid / 50 - 80).toBeLessThan(0); // « نقسم ثم نطرح » donne un nombre négatif
  });
});
