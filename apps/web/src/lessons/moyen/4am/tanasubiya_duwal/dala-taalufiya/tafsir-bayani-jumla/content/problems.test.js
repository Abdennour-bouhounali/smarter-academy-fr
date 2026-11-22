import { describe, it, expect } from 'vitest';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique EXACTE : chaque جملة est résolue en fractions (linearSystem.classify). ──
const solveTex = (tex) => {
  const m = tex.match(/\\begin\{cases\}(.*)\\\\(.*)\\end\{cases\}/);
  if (!m) throw new Error(`not a jumla: ${tex}`);
  return LS.classify(LS.system(m[1].trim(), m[2].trim()));
};
const pairOf = (tex) => { const r = solveTex(tex); return r.kind === 'unique' ? [Lin.toNumber(r.x), Lin.toNumber(r.y)] : r.kind; };

const partOf = (id, part) => PROBLEM[id].parts[part];
const expectedOf = (id, part) => partOf(id, part).steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceOf = (id, part, k) => partOf(id, part).steps.filter((st) => st.kind === 'choice')[k];
const correctOf = (id, part, k) => { const s = choiceOf(id, part, k); return s.options[s.correct]; };
const wrongOf = (id, part, k) => { const s = choiceOf(id, part, k); return s.options.filter((_, i) => i !== s.correct); };

/** Une droite y = ax + b du `visual` d'une مسألة, par son id. */
const lineOf = (id, fid) => PROBLEM[id].visual.functions.find((f) => f.id === fid);
const at = (f, x) => f.a * x + f.b;

// ── Vérificateur des RELATIONS écrites (explain, prompt, lignes, bonne option) ──
// Chaque formule $…$ est découpée sur = < > \neq ; chaque membre est évalué — nombres, ×, +, −,
// parenthèses, \dfrac{a}{b}, produit implicite (20x, 400(9 − a)) — avec les VALEURS des inconnues de
// la partie (`env`) ; une relation entre deux membres évaluables VOISINS est vérifiée. Un membre qui
// contient \ldots, « ; », une lettre hors `env`, \longmapsto ou un \begin est ignoré.
const EPS = 1e-9;
function evalExpr(src, env = {}) {
  const s = src
    .replace(/\\dfrac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\\left|\\right/g, '')
    .replace(/\\times/g, '*')
    .replace(/\{,\}/g, '.')
    .replace(/\s+/g, '');
  if (s === '' || !/^[\d.+\-*/()a-z]+$/.test(s)) return null;
  if ([...s.matchAll(/[a-z]/g)].some(([v]) => !(v in env))) return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '-') { i++; return -atom(); }
    let v;
    if (s[i] === '(') { i++; v = sum(); if (s[i] !== ')') throw new Error(`) in ${src}`); i++; } else if (/[a-z]/.test(s[i])) { v = env[s[i]]; i++; } else {
      const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
      if (i === j) throw new Error(`bad number in ${src}`);
      v = Number(s.slice(j, i));
    }
    while (s[i] === '(' || /[a-z]/.test(s[i] ?? '')) v *= atom(); // produit implicite
    return v;
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = atom(); v = op === '*' ? v * w : v / w; } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? v + w : v - w; } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
function checkText(text, where, env) {
  let checked = 0;
  for (const [, f] of text.matchAll(/\$([^$]+)\$/g)) {
    if (f.includes('\\begin')) continue;
    const parts = f.split(/(=|<|>|\\neq)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1], env), parts[k], evalExpr(parts[k + 1], env)];
      if (x == null || y == null) continue;
      const ok = { '=': Math.abs(x - y) < EPS * Math.max(1, Math.abs(x)), '<': x < y - EPS, '>': x > y + EPS, '\\neq': Math.abs(x - y) > EPS }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}

/** Les inconnues de chaque partie, CALCULÉES (jamais tapées). */
const sol1 = pairOf('\\begin{cases} x + y = 40 \\\\ 20x + 50y = 1250 \\end{cases}');
const sol2 = pairOf('\\begin{cases} y = 60x + 200 \\\\ y = 30x + 500 \\end{cases}');
const sol3 = pairOf('\\begin{cases} y = 30x + 1500 \\\\ y = 45x \\end{cases}');
const ENV = {
  'masala-1': [{ x: sol1[0], y: sol1[1] }, {}, {}],
  'masala-2': [{ x: sol2[0], y: sol2[1] }, {}, {}],
  'masala-3': [{ x: sol3[0], y: sol3[1] }, { x: 7 }, {}], // 2) : (45x + 1000) − 45x = 1000 pour TOUT x
};

describe('les مسائل du درس 4 (unité 7) « التفسير البياني لحل جملة معادلتين »', () => {
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

  it('no bare letter, a/b or « DA » in the Arabic text — every formula is a $…$ island; money in دج', () => {
    const texts = (p) => [p.statement, ...p.data.map((d) => d.text), ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
    for (const p of PROBLEMS) for (const t of texts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/\\|\^|\d\s*\/\s*\d|\b[xyab]\b|\bDA\b/);
    }
  });

  it('every question that cites « التمثيل البياني » or « الشكل » carries the graph; the lesson card never cites it', () => {
    for (const p of PROBLEMS) {
      const cites = [p.statement, ...p.parts.map((part) => part.question)].some((t) => /التمثيل البياني|الشكل/.test(t));
      expect(cites, p.id).toBe(true);
      expect(p.visual?.functions?.length, p.id).toBe(2);
    }
    expect(LESSON_CONFIG.lessonProblem.statement).not.toMatch(/التمثيل البياني|الشكل/);
  });

  it('the drawn lines ARE the equations, and they cross on a node of the grid (an exact reading)', () => {
    const cases = [['masala-1', sol1], ['masala-2', sol2], ['masala-3', sol3]];
    for (const [id, [x, y]] of cases) {
      const v = PROBLEM[id].visual;
      const [d1, d2] = v.functions;
      expect(at(d1, x), `${id} d1`).toBeCloseTo(y, 9);
      expect(at(d2, x), `${id} d2`).toBeCloseTo(y, 9);
      // nœud de la grille : multiple des pas, dans le cadre
      expect(Math.abs(x / v.xStep - Math.round(x / v.xStep)) < EPS && Math.abs(y / v.yStep - Math.round(y / v.yStep)) < EPS, `${id} node`).toBe(true);
      expect(x > v.range.xMin && x < v.range.xMax && y > v.range.yMin && y < v.range.yMax, `${id} in frame`).toBe(true);
    }
    // masala-1 : (d₁) est (1) x + y = 40 et (d₂) est (2) 20x + 50y = 1250 — l'ordonnée à l'origine et la pente
    const [e1, e2] = LS.system('x + y = 40', '20x + 50y = 1250');
    const iso1 = LS.isolate(e1, 'y');
    const iso2 = LS.isolate(e2, 'y');
    expect([Lin.toNumber(iso1.k), Lin.toNumber(iso1.m)]).toEqual([lineOf('masala-1', 'd1').a, lineOf('masala-1', 'd1').b]);
    expect([Lin.toNumber(iso2.k), Lin.toNumber(iso2.m)]).toEqual([lineOf('masala-1', 'd2').a, lineOf('masala-1', 'd2').b]);
    expect(Lin.fracLatex(iso2.k)).toBe('-\\dfrac{2}{5}');
    expect(correctOf('masala-1', 0, 1)).toBe(`$y = ${Lin.fracLatex(iso2.k)}x + ${Lin.toNumber(iso2.m)}$`);
    // masala-2 / 3 : (d₁) = A, (d₂) = B
    expect([lineOf('masala-2', 'd1').a, lineOf('masala-2', 'd1').b, lineOf('masala-2', 'd2').a, lineOf('masala-2', 'd2').b]).toEqual([60, 200, 30, 500]);
    expect([lineOf('masala-3', 'd1').a, lineOf('masala-3', 'd1').b, lineOf('masala-3', 'd2').a, lineOf('masala-3', 'd2').b]).toEqual([30, 1500, 45, 0]);
  });

  it('every written relation (explain, prompt, solution lines, correct options) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part, pi) => part.steps.forEach((s, si) => {
      const where = `${p.id} ${part.label} step ${si + 1}`;
      const env = ENV[p.id][pi];
      for (const t of [s.explain, s.prompt, ...(s.lines ?? [])].filter(Boolean)) checked += checkText(t, where, env);
      if (s.kind === 'choice') checked += checkText(s.options[s.correct], `${where} (correct option)`, env);
    }));
    expect(checked).toBeGreaterThan(70);
  });

  it('the relation checker fails on a mutated number (self-test)', () => {
    expect(() => checkText('$20 \\times 25 + 50 \\times 15 = 500 + 750 = 1240$', 'mutant')).toThrow();
    expect(() => checkText('$y = -\\dfrac{2}{5}x + 25$', 'mutant', { x: 25, y: 16 })).toThrow();
    expect(() => checkText('$30x = 300$', 'mutant', { x: 11 })).toThrow();
    expect(() => checkText('$1100 \\neq 1100$', 'mutant')).toThrow();
    expect(() => checkText('$6900 < 8100 < 8000$', 'mutant')).toThrow();
    expect(checkText('$(45x + 1000) - 45x = 1000$ و $x = \\dfrac{1500}{15} = 100$', 'ok', { x: 100 })).toBe(3);
  });

  it('مسألة 1 — the class-club box: system, y = ax + b, reading, check, Salma and the top-up are computed, not typed', () => {
    const [x, y] = sol1;
    expect([x, y]).toEqual([25, 15]);
    expect(pairOf(correctOf('masala-1', 0, 0))).toEqual([x, y]);
    for (const w of wrongOf('masala-1', 0, 0)) expect(pairOf(w)).not.toEqual([x, y]);
    // les mauvaises écritures de (2) ne passent PAS par (x ; y)
    for (const w of wrongOf('masala-1', 0, 1)) {
      const m = w.match(/^\$y = (.*)\$$/)[1];
      expect(evalExpr(m, { x }), w).not.toBeCloseTo(y, 9);
    }
    expect(expectedOf('masala-1', 0)).toEqual([x, y]);
    // 2) la lecture vérifie les deux équations ; (30 ; 10) seulement la première
    const [e1, e2] = LS.system('x + y = 40', '20x + 50y = 1250');
    expect(LS.isSolution([e1, e2], x, y)).toBe(true);
    expect(LS.pairHolds([e1, e2], 30, 10)).toEqual([true, false]);
    expect(expectedOf('masala-1', 1)).toEqual([20 * x + 50 * y, 20 * 30 + 50 * 10]);
    // 3) 2000 − 1250 = 750 = 50 × 15 ; 15 + 15 = 30 ; nouvelle جملة x + y = 55, 20x + 50y = 2000
    const missing = 2000 - 1250;
    expect(missing % 50).toBe(0);
    const added = missing / 50;
    expect(expectedOf('masala-1', 2)).toEqual([missing, added, y + added]);
    expect(pairOf(correctOf('masala-1', 2, 0))).toEqual([x, y + added]);
    for (const w of wrongOf('masala-1', 2, 0)) expect(pairOf(w)).not.toEqual([x, y + added]);
  });

  it('مسألة 2 — the parcel services: intersection, check, comparison at 4, 12 and 14 kg are computed, not typed', () => {
    const [x, y] = sol2;
    expect([x, y]).toEqual([10, 800]);
    expect(pairOf(correctOf('masala-2', 0, 0))).toEqual([x, y]);
    for (const w of wrongOf('masala-2', 0, 0)) expect(pairOf(w)).not.toEqual([x, y]);
    const A = lineOf('masala-2', 'd1');
    const B = lineOf('masala-2', 'd2');
    // 1) lecture + 60x + 200 = 30x + 500 ⇔ 30x = 300
    expect(expectedOf('masala-2', 0)).toEqual([x, y, B.b - A.b]);
    expect((B.b - A.b) / (A.a - B.a)).toBe(x);
    // 2) 4 kg : A est moins cher ; à droite de l'intersection B est en dessous (12 kg)
    expect(expectedOf('masala-2', 1)).toEqual([at(A, 4), at(B, 4), x]);
    expect(at(A, 4)).toBeLessThan(at(B, 4));
    expect(at(B, 12)).toBeLessThan(at(A, 12));
    expect([at(A, 12), at(B, 12)]).toEqual([920, 860]);
    // 3) 14 kg : B ; (1040 − 920) × 4 = 480
    expect(14).toBeGreaterThan(x);
    const saving = at(A, 14) - at(B, 14);
    expect(expectedOf('masala-2', 2)).toEqual([at(A, 14), at(B, 14), saving, 4 * saving]);
    expect(4 * saving).toBe(480);
  });

  it('مسألة 3 — the printers: intersection, check, the parallel printer C and the 180 cards are computed, not typed', () => {
    const [x, y] = sol3;
    expect([x, y]).toEqual([100, 4500]);
    expect(pairOf(correctOf('masala-3', 0, 0))).toEqual([x, y]);
    for (const w of wrongOf('masala-3', 0, 0)) expect(pairOf(w)).not.toEqual([x, y]);
    const A = lineOf('masala-3', 'd1');
    const B = lineOf('masala-3', 'd2');
    expect(B.b).toBe(0); // B passe par l'origine
    // 1) lecture + 30x + 1500 = 45x ⇔ 15x = 1500
    expect(expectedOf('masala-3', 0)).toEqual([x, y, A.b]);
    expect(A.b / (B.a - A.a)).toBe(x);
    // 2) C : y = 45x + 1000 — parallèle à B, aucune solution ; écart constant 1000
    expect(correctOf('masala-3', 1, 0)).toBe('$y = 45x + 1000$');
    expect(solveTex('\\begin{cases} y = 45x \\\\ y = 45x + 1000 \\end{cases}').kind).toBe('none');
    const C = { a: 45, b: 1000 };
    for (const n of [0, 37, 100, 180]) expect(at(C, n) - at(B, n)).toBe(1000);
    expect(expectedOf('masala-3', 1)).toEqual([1000]);
    // 3) 180 cartes : A 6900, B 8100, C 9100 ; économie 1200
    expect(180).toBeGreaterThan(x);
    expect(expectedOf('masala-3', 2)).toEqual([at(A, 180), at(B, 180), at(B, 180) - at(A, 180)]);
    expect([at(A, 180), at(B, 180), at(C, 180)]).toEqual([6900, 8100, 9100]);
    expect(at(A, 180)).toBeLessThan(at(B, 180));
  });
});
