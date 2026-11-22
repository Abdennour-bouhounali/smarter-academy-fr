import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { figureQuality, validateGeoFigure } from '../../../../../../common/components/geoFigure.js';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les trois « مسائل » du درس « حساب مركبتي شعاع وتساوي شعاعين في معلم » : chaque nombre est RECALCULÉ en exact
 * (packages/core/arithmetic/vectors.js) à partir des points de l'énoncé, chaque égalité, chaque point nommé et chaque
 * vecteur nommé écrits dans les textes sont vérifiés, et chaque figure est lisible et fidèle à l'énoncé.
 */

// ── Les points de chaque مسألة : donnés par l'énoncé, puis trouvés (réponses) ou proposés (les erreurs G et K) ──
const PTS = {
  'masala-1': { A: [-3, 2], B: [2, -1], C: [-1, 4], D: [4, 2], E: [0, -3] },
  'masala-2': { A: [-3, 0], B: [1, -2], C: [3, 2], K: [7, 0], W: [5, 5] },
  'masala-3': { P: [-5, -2], Q: [-1, 3], R: [4, 1] },
};
const pt = (id, n) => V.point(...PTS[id][n]);
const vc = (id, a, b) => V.coords(V.vec(pt(id, a), pt(id, b)));
const add = (p, u) => [p[0] + u[0], p[1] + u[1]];
const neg = (u) => [-u[0], -u[1]];

// Les points CALCULÉS (jamais tapés) : réponses et points des erreurs.
const AB1 = vc('masala-1', 'A', 'B');
const F = V.coords(V.translate(pt('masala-1', 'E'), V.vec(pt('masala-1', 'A'), pt('masala-1', 'B'))));
const G = add(PTS['masala-1'].E, neg(AB1)); // la sortie de Yacine : E + BA
const D2 = V.coords(V.fourthVertex(pt('masala-2', 'A'), pt('masala-2', 'B'), pt('masala-2', 'C')));
const PR = vc('masala-3', 'P', 'R');
const AMINE = add(PTS['masala-3'].P, PTS['masala-3'].R); // P + (coordonnées de R)
const AGAIN = add(PTS['masala-3'].R, PR); // le même ordre exécuté une seconde fois depuis R
const ALL = {
  'masala-1': { ...PTS['masala-1'], F, G },
  'masala-2': { ...PTS['masala-2'], D: D2 },
  'masala-3': PTS['masala-3'],
};
const UNIT_PX = 40;
const SCREEN = { x: 6, y: 4.5 };

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choicesOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');
const correctOf = (id, part, k) => { const s = choicesOf(id, part)[k]; return s.options[s.correct]; };
const pmat = ([a, b]) => `$\\begin{pmatrix} ${a} \\\\ ${b} \\end{pmatrix}$`;
const coord = (n, [x, y]) => `$${n}(${x} ; ${y})$`;

// ── Vérificateur des RELATIONS écrites (explain, prompt, bonnes options, lines, corrections) ──
function evalExpr(src) {
  const s = String(src).replace(/\{,\}/g, '.').replace(/\\times/g, '*').replace(/\s+/g, '');
  if (!/^[\d.+\-*/()]+$/.test(s) || s === '') return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '-') { i++; return -atom(); }
    if (s[i] === '(') { i++; const v = sum(); if (s[i++] !== ')') throw new Error(`bad parens in ${src}`); return v; }
    const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
    if (i === j) throw new Error(`bad number in ${src}`);
    return Number(s.slice(j, i));
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = atom(); v = op === '*' ? v * w : v / w; } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? v + w : v - w; } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
const close = (x, y) => Math.abs(x - y) < 1e-9;
function checkRelations(text, where) {
  let n = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    if (f.includes('pmatrix')) continue;
    const parts = f.split(/(=|<|>|\\neq)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1]), parts[k], evalExpr(parts[k + 1])];
      if (x == null || y == null) continue;
      const ok = { '=': close(x, y), '<': x < y, '>': x > y, '\\neq': !close(x, y) }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      n++;
    }
  }
  return n;
}
/** « $\overrightarrow{XY}\begin{pmatrix} a \\ b \end{pmatrix}$ » : a et b (évalués) sont les composantes exactes de XY. */
function checkNamedVectors(text, id, where) {
  let n = 0;
  const re = /\\overrightarrow\{([A-Z])([A-Z])\}\\begin\{pmatrix\} ([^\\]+?) \\\\ ([^\\]+?) \\end\{pmatrix\}/g;
  for (const [, a, b, x, y] of String(text).matchAll(re)) {
    const [ex, ey] = [evalExpr(x), evalExpr(y)];
    if (ex == null || ey == null) continue; // une composante littérale (3 − x_D)
    const P = ALL[id];
    expect(P[a] && P[b], `${where}: points ${a}${b}`).toBeTruthy();
    expect([ex, ey], `${where}: ${a}${b}`).toEqual([P[b][0] - P[a][0], P[b][1] - P[a][1]]);
    n++;
  }
  return n;
}
/** « $X(a ; b)$ » : un point NOMMÉ a les coordonnées de la مسألة. */
function checkNamedPoints(text, id, where) {
  let n = 0;
  for (const [, name, x, y] of String(text).matchAll(/\$([A-Z])\((-?[\d{},]+) ; (-?[\d{},]+)\)\$/g)) {
    expect(ALL[id][name], `${where}: ${name} inconnu`).toBeTruthy();
    expect([evalExpr(x), evalExpr(y)], `${where}: ${name}`).toEqual(ALL[id][name]);
    n++;
  }
  return n;
}
/** Tous les textes AFFIRMÉS (les mauvaises options ne le sont pas). */
const assertedOf = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [
  s.prompt, s.explain, ...(s.lines ?? []),
  ...(s.kind === 'choice' ? [s.options[s.correct]] : []),
  ...(s.rows ?? []).flatMap((r) => [r.options[r.correct], r.correction]),
])])].filter(Boolean);

describe('les مسائل du درس 2 (unité 12) « حساب مركبتي شعاع وتساوي شعاعين في معلم »', () => {
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
    expect(PROBLEM['masala-1'].figure).toBe(LESSON_CONFIG.lessonProblem.figure);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 5], ['masala-2', 6], ['masala-3', 7]]);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      expect(part.asks.length).toBeGreaterThanOrEqual(demandsOf(part.question));
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('every figure is readable, says the statement\'s points, and never shows an answer', () => {
    for (const p of PROBLEMS) {
      expect(p.statement).toContain('الشكل المقابل');
      expect(validateGeoFigure(p.figure), p.id).toEqual([]);
      expect(figureQuality(p.figure), p.id).toEqual([]);
      expect(p.figure.grid && p.figure.axes, p.id).toBeTruthy();
      const hidden = new Set(p.figure.hidden ?? []);
      const shown = Object.keys(p.figure.points).filter((n) => n !== 'O' && !hidden.has(n));
      expect(shown.sort(), p.id).toEqual(Object.keys(PTS[p.id]).sort());
      for (const n of shown) expect(p.figure.points[n], `${p.id} ${n}`).toEqual(PTS[p.id][n]);
      expect(p.figure.points.O).toEqual([0, 0]);
    }
    // Les vecteurs dessinés sont ceux de l'énoncé (les portails, les deux sauts du فارس).
    expect(PROBLEM['masala-1'].figure.vectors.map((v) => v.from + v.to)).toEqual(['AB', 'CD']);
    expect(PROBLEM['masala-3'].figure.vectors.map((v) => v.from + v.to)).toEqual(['PQ', 'QR']);
    // Le cadre de la مسألة 3 est l'écran : 480 × 360 pixels à 40 pixels l'unité.
    const s = PROBLEM['masala-3'].figure.points;
    expect([s.s3[0] - s.s1[0], s.s3[1] - s.s1[1]].map((u) => u * UNIT_PX)).toEqual([480, 360]);
    expect(s.s3).toEqual([SCREEN.x, SCREEN.y]);
  });

  it('the statements give exactly the figure\'s points', () => {
    for (const p of PROBLEMS) {
      const named = [...p.statement.matchAll(/\$([A-Z])\((-?\d+) ; (-?\d+)\)\$/g)].map(([, n, x, y]) => [n, [Number(x), Number(y)]]);
      expect(Object.fromEntries(named), p.id).toEqual(PTS[p.id]);
    }
  });

  it('مسألة 1 — the numbers are computed, not typed', () => {
    const CD = vc('masala-1', 'C', 'D');
    expect(expectedOf('masala-1', 0)).toEqual([...AB1, ...CD]);
    expect(correctOf('masala-1', 0, 1)).toBe(pmat(AB1));
    expect(choicesOf('masala-1', 0)[1].options[1]).toBe(pmat(neg(AB1))); // le piège : x_A − x_B
    expect(CD[0]).toBe(AB1[0]);
    expect(V.vecEq(V.vec(pt('masala-1', 'C'), pt('masala-1', 'D')), V.vec(pt('masala-1', 'A'), pt('masala-1', 'B')))).toBe(false);
    expect(expectedOf('masala-1', 1)).toEqual(F);
    expect(correctOf('masala-1', 1, 1)).toBe(coord('F', F));
    expect(choicesOf('masala-1', 1)[1].options[1]).toBe(coord('F', G)); // la sortie de Yacine, proposée comme F
    expect(PROBLEM['masala-1'].parts[1].question).toContain(coord('G', G));
    expect(V.coords(V.vec(V.point(...PTS['masala-1'].E), V.point(...G)))).toEqual(neg(AB1)); // EG = BA
    const Fp = V.point(...F);
    const Ap = pt('masala-1', 'A'); const Bp = pt('masala-1', 'B'); const Ep = pt('masala-1', 'E');
    expect(V.collinear(Ap, Bp, Ep)).toBe(false);
    expect(V.isParallelogram(Ap, Bp, Fp, Ep)).toBe(true);
    const FA = V.coords(V.vec(Fp, Ap));
    expect(expectedOf('masala-1', 2)).toEqual(FA);
    expect(correctOf('masala-1', 2, 2)).toBe(pmat(FA));
    expect(choicesOf('masala-1', 2)[2].options[1]).toBe(pmat(neg(FA)));
  });

  it('مسألة 2 — the numbers are computed, not typed', () => {
    const [A, B, C, K, W] = ['A', 'B', 'C', 'K', 'W'].map((n) => pt('masala-2', n));
    const AB = V.coords(V.vec(A, B)); const KC = V.coords(V.vec(K, C));
    expect(expectedOf('masala-2', 0)).toEqual(AB);
    const batch = PROBLEM['masala-2'].parts[0].steps.find((s) => s.kind === 'batch');
    expect(batch.rows.map((r) => r.options[r.correct])).toEqual([pmat(AB), pmat(KC)]);
    expect(KC).toEqual(neg(AB));
    expect(V.isParallelogram(A, B, C, K)).toBe(false); // la proposition de l'entrepreneur
    expect(V.isParallelogram(A, B, K, C)).toBe(true); // K est le sommet de ABKC : CK = AB
    expect(expectedOf('masala-2', 1)).toEqual(D2);
    expect(correctOf('masala-2', 1, 2)).toBe(coord('D', D2));
    expect(V.isParallelogram(A, B, C, V.point(...D2))).toBe(true);
    // K vient du piège : DC = BA ⇔ D = C − BA.
    expect(V.coords(V.vecSub(C, V.vec(B, A)))).toEqual(PTS['masala-2'].K);
    expect(choicesOf('masala-2', 1)[2].options[1]).toBe(coord('D', PTS['masala-2'].K));
    const WD = V.coords(V.vec(W, V.point(...D2)));
    const units = Math.abs(WD[0]) + Math.abs(WD[1]);
    const length = units * 100;
    expect(expectedOf('masala-2', 2)).toEqual([...WD, length, length * 2500]);
    expect(correctOf('masala-2', 2, 0)).toBe(pmat(WD));
  });

  it('مسألة 3 — the numbers are computed, not typed', () => {
    const PQ = vc('masala-3', 'P', 'Q'); const QR = vc('masala-3', 'Q', 'R');
    expect(expectedOf('masala-3', 0)).toEqual(PQ);
    expect(correctOf('masala-3', 0, 1)).toBe(`«انزلق بـ $(${PQ[0]} ; ${PQ[1]})$»`);
    expect(correctOf('masala-3', 0, 2)).toBe(`«انزلق بـ $(${QR[0]} ; ${QR[1]})$»`);
    expect(V.coords(V.vecAdd(V.point(...PQ), V.point(...QR)))).toEqual(PR); // la relation de Chasles, en contrôle
    expect(expectedOf('masala-3', 1)).toEqual([...PR, ...AMINE]);
    expect(correctOf('masala-3', 1, 0)).toBe(pmat(PR));
    expect(AMINE).not.toEqual(PTS['masala-3'].R);
    expect(correctOf('masala-3', 1, 2)).toBe(`النقطة $(${AMINE[0]} ; ${AMINE[1]})$ ، بعيدًا عن الباب`);
    expect(expectedOf('masala-3', 2)).toEqual([PR[0] * UNIT_PX, PR[1] * UNIT_PX, ...AGAIN]);
    expect(Math.abs(AGAIN[1]) <= SCREEN.y).toBe(true); // le ترتيب reste dans l'écran…
    expect(Math.abs(AGAIN[0]) <= SCREEN.x).toBe(false); // …mais pas la فاصلة : il sort à droite
    expect(AGAIN[0]).toBeGreaterThan(SCREEN.x);
    // Les points de départ et d'arrivée sont bien sur l'écran.
    for (const n of ['P', 'Q', 'R']) {
      const [x, y] = PTS['masala-3'][n];
      expect(Math.abs(x) <= SCREEN.x && Math.abs(y) <= SCREEN.y, n).toBe(true);
    }
  });

  it('every equality, named point and named vector written in the problems is true', () => {
    let rel = 0; let vecs = 0; let pts = 0;
    for (const p of PROBLEMS) for (const t of assertedOf(p)) {
      rel += checkRelations(t, p.id);
      vecs += checkNamedVectors(t, p.id, p.id);
      pts += checkNamedPoints(t, p.id, p.id);
    }
    expect(rel).toBeGreaterThan(40);
    expect(vecs).toBeGreaterThan(15);
    expect(pts).toBeGreaterThan(15);
  });

  it('the decoys are useless numbers', () => {
    for (const p of PROBLEMS) {
      const useless = p.data.filter((d) => !d.useful);
      expect(useless.some((d) => /\d/.test(d.text)), p.id).toBe(true);
      expect(p.data.filter((d) => d.useful).length).toBeGreaterThanOrEqual(4);
      for (const d of p.data) expect(d.text, `${p.id} ${d.id}`).not.toMatch(/\$|-\d|\(/); // textes simples (InfoSorter), sans signe ni parenthèse
    }
  });
});
