import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Helpers ────────────────────────────────────────────────────────────────
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choicesOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');
const correctOf = (id, part, k) => { const s = choicesOf(id, part)[k]; return s.options[s.correct]; };
/** Décimaux EXACTS : on compare en centièmes entiers (0,25 → 25), jamais en flottants. */
const c = (v) => Math.round(v * 100);
const dec = (s) => Number(String(s).replace(',', '.'));
/** L'antécédent EXACT de y par x ↦ ax quand a et y sont en centièmes : y / a. */
const antecedent = (a, y) => c(y) / c(a);

// ── Évaluateur des formules écrites ($…$) ─────────────────────────────────────
// Nombres (décimaux 0{,}25), + − × ÷, \frac / \dfrac, parenthèses, multiplication
// implicite (0{,}25x) ; la lettre x prend la valeur de `vars`. Une formule est
// découpée sur = < > ; chaque membre est évalué ; une lettre sans valeur rend le
// membre « non numérique » (ignoré).
function evalExpr(src, vars = {}) {
  let s = src
    .replace(/\{,\}/g, '.')
    .replace(/\\left|\\right/g, '')
    .replace(/\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\s+/g, '');
  if (s === '' || !/^[\d.+\-*/()x]+$/.test(s)) return null;
  if (s.includes('x') && vars.x == null) return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '-') { i++; return -atom(); }
    if (s[i] === '(') { i++; const v = sum(); if (s[i] !== ')') throw new Error(`bad ( in ${src}`); i++; return v; }
    if (s[i] === 'x') { i++; return vars.x; }
    const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
    if (i === j) throw new Error(`bad token in ${src}`);
    return Number(s.slice(j, i));
  };
  const implicit = () => { let v = atom(); while (s[i] === '(' || s[i] === 'x') v *= atom(); return v; };
  const prod = () => { let v = implicit(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = implicit(); v = op === '*' ? v * w : v / w; } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? v + w : v - w; } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
const EPS = 1e-9;
const REL = { '=': (a, b) => Math.abs(a - b) < EPS, '<': (a, b) => a < b - EPS, '>': (a, b) => a > b + EPS };
/** Vérifie chaque maillon NUMÉRIQUE des formules d'un texte ; renvoie le nombre de maillons vérifiés. */
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    const parts = f.split(/(=|<|>)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [a, b] = [evalExpr(parts[k - 1]), evalExpr(parts[k + 1])];
      if (a == null || b == null) continue;
      expect(REL[parts[k]](a, b), `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}
/** x vérifie-t-il l'équation écrite « $… = …$ » ? */
const solves = (formula, x) => {
  const [l, r] = formula.replace(/^\$|\$$/g, '').split('=');
  return Math.abs(evalExpr(l, { x }) - evalExpr(r, { x })) < EPS;
};

describe('les مسائل du درس 5 (unité 6) « ترييض وضعيات بالدالة الخطية »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (4, 5, 6 — track problem, practice_lab, before the test 7)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage, m.estimatedMin])).toEqual([
      [4, '04', 'masala-1', 'practice_lab', 8], [5, '05', 'masala-2', 'practice_lab', 8], [6, '06', 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '07', number: 7, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(74);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(4);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 4], ['masala-2', 5], ['masala-3', 6]]);
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

  it('no bare formula in the Arabic prose — every formula is a $…$ island (units g, kg, cm stay glued to their number)', () => {
    const texts = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
    for (const p of PROBLEMS) for (const t of texts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '').replace(/\d(?:kg|g|cm)(?![A-Za-z])/g, '0');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/[A-Za-z=<>+×÷√²\\]|\d\s*\/\s*\d/);
      expect(t.split('$').length % 2, `${p.id}: unbalanced $ in ${t}`).toBe(1);
      expect(t, `${p.id}: « DA » in Arabic`).not.toMatch(/\bDA\b/);
    }
  });

  it('every numeric equality written in explains, options and solutions is TRUE', () => {
    let checked = 0;
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) {
      for (const t of [s.explain, ...(s.lines ?? []), ...(s.options ?? [])].filter(Boolean)) checked += checkText(t, `${p.id} ${part.label}`);
    }
    expect(checked).toBeGreaterThan(40);
  });

  it('مسألة 1 — the spring: a, the formula, an image, an antecedent, the limit', () => {
    // Énoncé : 6 g → 1,5 cm ; 16 g → 4 cm ; longueur à vide 12 cm (leurre) ; limite 7 cm.
    const a = 1.5 / 6;
    expect(c(a)).toBe(25);
    expect(c(a * 16)).toBe(c(4)); // le 2e relevé confirme a
    expect(expectedOf('masala-1', 0).map(c)).toEqual([c(a), c(a * 16)]);
    expect(correctOf('masala-1', 0, 0)).toBe('$a = \\dfrac{1{,}5}{6}$');
    expect(correctOf('masala-1', 0, 1)).toBe('$y = 0{,}25x$');
    expect(expectedOf('masala-1', 1).map(c)).toEqual([c(a * 14), c(antecedent(a, 5.5))]);
    expect(antecedent(a, 5.5)).toBe(22);
    expect(solves(correctOf('masala-1', 1, 1), 22)).toBe(true);
    const bag = a * 30, max = antecedent(a, 7);
    expect(bag).toBeGreaterThan(7); // le piège : le sac ne passe pas
    expect(expectedOf('masala-1', 2).map(c)).toEqual([c(bag), c(max)]);
    expect(max).toBe(28);
    expect(solves(correctOf('masala-1', 2, 1), max)).toBe(true);
    expect(c(12 + bag)).toBe(c(19.5)); // le distracteur « longueur du ressort »
  });

  it('مسألة 2 — the photocopy shop: the graph, the class, the budget', () => {
    const v = PROBLEM['masala-2'].visual;
    const [line] = v.functions, [A] = v.points;
    expect(line.b).toBe(0); // une droite par O : la situation est proportionnelle
    expect(line.a * A.x).toBe(A.y); // A est sur la droite
    const a = A.y / A.x;
    expect(expectedOf('masala-2', 0)).toEqual([A.y, a]);
    expect(a).toBe(5);
    const pupils = 32, pages = 6, budget = 1000;
    const total = pupils * pages, cost = a * total;
    expect(expectedOf('masala-2', 1)).toEqual([total, cost]);
    expect(cost).toBeLessThanOrEqual(budget);
    expect(correctOf('masala-2', 1, 1)).toContain(String(budget - cost));
    const maxPages = budget / a, series = Math.floor(maxPages / pages);
    expect(expectedOf('masala-2', 2)).toEqual([maxPages, series, series]);
    expect(maxPages % pages).not.toBe(0); // le reste à interpréter
    expect(solves(correctOf('masala-2', 2, 0), maxPages)).toBe(true);
    expect(series).toBeGreaterThanOrEqual(pupils);
    // le repère tient dans 460 px et montre A
    expect(A.x).toBeLessThanOrEqual(v.range.xMax);
    expect(A.y).toBeLessThanOrEqual(v.range.yMax);
  });

  it('مسألة 3 — the honey: the table, whole jars, the season', () => {
    const { head, rows } = PROBLEM['masala-3'].table;
    const masses = head.slice(1).map(dec), prices = rows[0].slice(1).map(dec);
    const quotients = masses.map((m, k) => prices[k] / m);
    expect(new Set(quotients).size).toBe(1); // tableau de proportionnalité
    const a = quotients[0];
    expect(a).toBe(4000);
    expect(expectedOf('masala-3', 0)).toEqual([prices[0] / masses[0], prices.at(-1) / masses.at(-1)]);
    expect(correctOf('masala-3', 0, 2)).toBe(`$f(x) = ${a}x$`);
    const money = 15000, jar = 0.5, jarPrice = a * jar;
    expect(jarPrice).toBe(prices[0]);
    const kg = money / a, jars = kg / jar, whole = Math.floor(jars);
    expect(c(kg)).toBe(375);
    expect(Number.isInteger(jars)).toBe(false); // le piège : 7,5 bocaux
    expect(expectedOf('masala-3', 1).map(c)).toEqual([c(kg), c(jars), c(whole), c(whole * jarPrice), c(money - whole * jarPrice)]);
    expect((whole + 1) * jarPrice).toBeGreaterThan(money);
    expect(solves(correctOf('masala-3', 1, 0), kg)).toBe(true);
    const hives = 15, perHive = 4, goal = 250000;
    const harvest = hives * perHive, income = a * harvest;
    expect(expectedOf('masala-3', 2)).toEqual([harvest, income]);
    expect(income).toBeLessThan(goal);
    expect(correctOf('masala-3', 2, 1)).toContain(String(goal - income));
  });
});
