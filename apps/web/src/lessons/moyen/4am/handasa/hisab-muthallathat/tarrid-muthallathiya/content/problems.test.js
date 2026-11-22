import { describe, it, expect } from 'vitest';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const { sinDeg, cosDeg, tanDeg, asinDeg, acosDeg, atanDeg } = TR;
/** L'arrondi de la calculatrice (trigonometry.js › roundTo écrit « 2,65 ») relu comme nombre. */
const roundTo = (x, d) => Number(TR.roundTo(x, d).replace(',', '.'));
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const correctOf = (id, part, k) => { const s = PROBLEM[id].parts[part].steps.filter((st) => st.kind === 'choice')[k]; return s.options[s.correct]; };

// ── Vérificateur des ÉGALITÉS écrites ($…$) ─────────────────────────────────────────────────────────────
// Expressions numériques : décimaux « 2{,}4 », \dfrac{…}{…}, \sqrt{…}, \times, \div, ^2, \sin/\cos/\tan d'un angle en
// degrés, unités (\,\mathrm{m}, ^{\circ}) ignorées. Une pièce non numérique (une lettre, \alpha…) n'est pas vérifiée.
// « = » : égalité (1e-9) ; « \approx » : écart ≤ une demi-unité du dernier chiffre du nombre arrondi écrit ;
// « < », « > », « \leq », « \geq » : vrais.
function evalExpr(src) {
  const s = src
    .replace(/\\,\\mathrm\{[a-z]+\}/g, '')
    .replace(/\^\{\\circ\}/g, '')
    .replace(/\\dfrac|\\frac/g, 'F')
    .replace(/\\sqrt/g, 'Q')
    .replace(/\\sin/g, 'S').replace(/\\cos/g, 'C').replace(/\\tan/g, 'T')
    .replace(/\\times/g, '*').replace(/\\div/g, '/')
    .replace(/\{,\}/g, '.')
    .replace(/\s+/g, '');
  if (s === '' || !/^[\d.+\-*/()^{}FQSCT]+$/.test(s)) return null;
  let i = 0;
  const fail = () => { throw new Error('parse'); };
  const group = () => { if (s[i] !== '{') fail(); i++; const v = sum(); if (s[i] !== '}') fail(); i++; return v; };
  const atom = () => {
    if (s[i] === '(') { i++; const v = sum(); if (s[i] !== ')') fail(); i++; return v; }
    if (s[i] === 'F') { i++; const n = group(); const d = group(); return n / d; }
    if (s[i] === 'Q') { i++; return Math.sqrt(group()); }
    if ('SCT'.includes(s[i])) { const f = { S: sinDeg, C: cosDeg, T: tanDeg }[s[i]]; i++; return f(atom()); }
    const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
    if (i === j) fail();
    return Number(s.slice(j, i));
  };
  const power = () => { const v = atom(); if (s[i] === '^') { i++; const e = Number(s[i++]); return v ** e; } return v; };
  const prod = () => {
    let v = power();
    for (;;) {
      if (s[i] === '*') { i++; v *= power(); } else if (s[i] === '/') { i++; v /= power(); } else return v;
    }
  };
  const sum = () => {
    let v = s[i] === '-' ? (i++, -prod()) : prod();
    while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? v + w : v - w; }
    return v;
  };
  try { const v = sum(); return i === s.length && Number.isFinite(v) ? v : null; } catch { return null; }
}
/** Le nombre de décimales d'une pièce qui n'est qu'un nombre écrit (« 2{,}65 » → 2), sinon null. */
const decimalsOf = (piece) => {
  const m = piece.replace(/\\,\\mathrm\{[a-z]+\}/g, '').replace(/\^\{\\circ\}/g, '').trim().match(/^\d+(?:\{,\}(\d+))?$/);
  return m ? (m[1] ?? '').length : null;
};
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    const parts = f.split(/(\\approx|\\leq|\\geq|=|<|>)/);
    for (let k = 1; k < parts.length; k += 2) {
      const [left, op, right] = [parts[k - 1], parts[k], parts[k + 1]];
      const a = evalExpr(left); const b = evalExpr(right);
      if (a == null || b == null) continue;
      checked++;
      const msg = `${where}: ${f}`;
      if (op === '=') expect(Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a)), msg).toBe(true);
      else if (op === '\\approx') {
        const d = Math.min(...[decimalsOf(left), decimalsOf(right)].filter((x) => x != null));
        expect(Number.isFinite(d), `${msg} (≈ sans nombre arrondi)`).toBe(true);
        expect(Math.abs(a - b) <= 0.5 * 10 ** -d + 1e-9, `${msg} (${a} ≈ ${b})`).toBe(true);
      } else if (op === '<') expect(a < b, msg).toBe(true);
      else if (op === '>') expect(a > b, msg).toBe(true);
      else if (op === '\\leq') expect(a <= b, msg).toBe(true);
      else if (op === '\\geq') expect(a >= b, msg).toBe(true);
    }
  }
  return checked;
}

describe('les مسائل du درس 4 « حل مشكلات وترييض وضعيات بتوظيف النسب المثلثية »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (4, 5, 6 — track problem, practice_lab, before the test 7)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage, m.estimatedMin])).toEqual([
      [4, '04', 'masala-1', 'practice_lab', 8], [5, '05', 'masala-2', 'practice_lab', 8], [6, '06', 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '07', number: 7, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(79);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(4);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].figure).toBe(LESSON_CONFIG.lessonProblem.figure);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 4], ['masala-2', 5], ['masala-3', 6]]);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      expect(part.asks.length, `${p.id} ${part.label}`).toBeGreaterThanOrEqual(demandsOf(part.question));
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('the decoys: at least one useless datum is a number', () => {
    for (const p of PROBLEMS) {
      expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
      expect(p.data.filter((d) => d.useful).length).toBeGreaterThanOrEqual(4);
    }
  });

  it('every figure is valid, readable (figureQuality) and drawn on the statement numbers', () => {
    for (const p of PROBLEMS) {
      expect(validateGeoFigure(p.figure), p.id).toEqual([]);
      expect(figureQuality(p.figure), p.id).toEqual([]);
    }
    // مسألة 1 : H(0 ; 0), B(0 ; 2,4), A(2,4 ÷ tan 65° ; 0) — l'échelle à 65° (question 1).
    const f1 = PROBLEM['masala-1'].figure.points;
    expect(f1.B).toEqual([0, 2.4]);
    expect(f1.A[0]).toBeCloseTo(2.4 / tanDeg(65), 3);
    expect(atanDeg(f1.B[1] / f1.A[0])).toBeCloseTo(65, 2);
    // مسألة 2 : PC = 40 à 35°, P à 30 m.
    const f2 = PROBLEM['masala-2'].figure.points;
    expect(f2.P).toEqual([0, 30]);
    expect(Math.hypot(f2.C[0] - f2.P[0], f2.C[1] - f2.P[1])).toBeCloseTo(40, 2);
    expect(atanDeg((f2.C[1] - f2.P[1]) / (f2.C[0] - f2.P[0]))).toBeCloseTo(35, 2);
    expect(f2.H).toEqual([f2.C[0], 30]);
    expect(f2.K).toEqual([f2.C[0], 0]);
    // مسألة 3 : NON à l'échelle (3° serait illisible) — la légende ET l'énoncé le disent.
    expect(PROBLEM['masala-3'].figure.caption).toMatch(/ليس بالسلّم/);
    expect(PROBLEM['masala-3'].statement).toMatch(/ليس بالسلّم/);
  });

  it('مسألة 1 — the numbers are computed, not typed', () => {
    const L65 = 2.4 / sinDeg(65);
    expect(L65 > 2.5).toBe(true); // le piège : l'échelle de 2,50 m ne suffit pas
    expect(expectedOf('masala-1', 0)).toEqual([roundTo(L65, 2)]);
    expect(roundTo(2.4 * sinDeg(65), 2)).toBe(2.18); // le distracteur « × »
    const sinA = 2.4 / 2.5; const alpha = asinDeg(sinA);
    expect(expectedOf('masala-1', 1)).toEqual([sinA, roundTo(alpha, 0)]);
    expect(alpha > 65 && alpha < 75).toBe(true);
    expect([roundTo(acosDeg(sinA), 0), roundTo(atanDeg(sinA), 0)]).toEqual([16, 44]); // les rapports échangés
    const AH2 = 2.5 ** 2 - 2.4 ** 2; const AH = Math.sqrt(AH2);
    expect(expectedOf('masala-1', 2)).toEqual([roundTo(AH2, 2), roundTo(AH, 2)]);
    expect(AH).toBeCloseTo(0.7, 12);
    expect(2.5 * cosDeg(alpha)).toBeCloseTo(0.7, 12); // l'angle exact redonne 0,70…
    expect(roundTo(2.5 * cosDeg(74), 2)).toBe(0.69); // …l'angle arrondi donne 0,69 (سلمى)
    expect(AH < 0.8).toBe(true);
    expect(correctOf('masala-1', 0, 1)).toContain('\\sin 65');
    expect(correctOf('masala-1', 1, 0)).toContain('\\sin\\alpha');
  });

  it('مسألة 2 — the numbers are computed, not typed', () => {
    const PH = 40 * cosDeg(35); const HC = 40 * sinDeg(35);
    expect(expectedOf('masala-2', 0)).toEqual([roundTo(PH, 1), roundTo(HC, 2), roundTo(30 + HC, 1)]);
    const cosA = 25 / 40; const alpha = acosDeg(cosA);
    const HC2 = 40 ** 2 - 25 ** 2;
    expect(expectedOf('masala-2', 1)).toEqual([roundTo(alpha, 0), HC2, roundTo(30 + Math.sqrt(HC2), 1)]);
    expect(roundTo(30 + 40 * sinDeg(51), 1)).toBe(61.1); // l'arrondi précoce change le résultat
    expect(roundTo(asinDeg(cosA), 0)).toBe(39); // le rapport échangé
    const reach20 = 40 * cosDeg(20); const limit = acosDeg(36 / 40);
    expect(reach20 > 36).toBe(true);
    const smallest = Math.ceil(limit); // le plus petit entier — PAS l'arrondi au plus proche
    expect(40 * cosDeg(smallest) <= 36 && 40 * cosDeg(smallest - 1) > 36).toBe(true);
    expect(expectedOf('masala-2', 2)).toEqual([roundTo(reach20, 1), roundTo(limit, 2), smallest]);
  });

  it('مسألة 3 — the numbers are computed, not typed', () => {
    const HT = 900 / tanDeg(3); const PT = 900 / sinDeg(3);
    expect(expectedOf('masala-3', 0)).toEqual([roundTo(HT, 0), roundTo(PT, 0)]);
    expect(PT > HT).toBe(true);
    const tanB = 750 / 12000; const beta = atanDeg(tanB);
    expect(expectedOf('masala-3', 1)).toEqual([tanB, roundTo(beta, 1)]);
    expect(beta > 3.5).toBe(true); // refusé, même avant l'arrondi
    expect(roundTo(atanDeg(12000 / 750), 0)).toBe(86); // le rapport renversé
    const t = PT / 75; const s = roundTo(t, 0);
    expect(expectedOf('masala-3', 2)).toEqual([s, Math.floor(s / 60), s % 60]);
    expect(s < 4 * 60).toBe(true);
  });

  it('every equality written in explains, solutions and correct options is TRUE', () => {
    let checked = 0;
    for (const p of PROBLEMS) {
      checked += checkText(p.statement, `${p.id} statement`);
      for (const part of p.parts) {
        checked += checkText(part.question, `${p.id} ${part.label} question`);
        part.steps.forEach((st, i) => {
          const w = `${p.id} ${part.label} step ${i + 1}`;
          checked += checkText(st.prompt ?? '', w) + checkText(st.explain ?? '', w);
          if (st.kind === 'choice') checked += checkText(st.options[st.correct], `${w} option`);
          for (const l of st.lines ?? []) checked += checkText(l, `${w} line`);
        });
      }
    }
    expect(checked).toBeGreaterThan(40);
  });

  it('the checker catches a wrong number', () => {
    expect(() => checkText('$\\dfrac{2{,}4}{\\sin 65^{\\circ}} \\approx 2{,}65$', 'ok')).not.toThrow();
    expect(() => checkText('$\\dfrac{2{,}4}{\\sin 65^{\\circ}} \\approx 2{,}64$', 'mutated')).toThrow();
    expect(() => checkText('$40^2 - 25^2 = 1600 - 625 = 965$', 'mutated')).toThrow();
    expect(() => checkText('$40 \\times \\cos 26^{\\circ} \\approx 35{,}95 > 36$', 'mutated')).toThrow();
  });
});
