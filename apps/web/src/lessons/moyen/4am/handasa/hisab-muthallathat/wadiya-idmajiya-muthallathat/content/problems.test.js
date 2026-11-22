import { describe, it, expect } from 'vitest';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const { sinDeg, cosDeg, tanDeg, asinDeg, atanDeg } = TR;
/** L'arrondi de la calculatrice (trigonometry.js › roundTo écrit « 2,65 ») relu comme nombre. */
const roundTo = (x, d) => Number(TR.roundTo(x, d).replace(',', '.'));
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);

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

describe('les six وضعيات تدريبية de أدمج تعلّماتي (unité 10)', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    expect(PROBLEMS.map((p) => p.id)).toEqual(['wadiya-1', 'wadiya-2', 'wadiya-3', 'wadiya-4', 'wadiya-5', 'wadiya-6']);
  });

  it('are platform additions of exam type, never the textbook', () => {
    for (const p of PROBLEMS) {
      expect(p.source.type, p.id).toBe('platform_addition');
      expect(p.source.reason, p.id).toBe('exam_style_problem');
    }
  });

  it('match their modules (1 to 6 — track problem, practice_lab, before the analysis and the test)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage])).toEqual(
      [1, 2, 3, 4, 5, 6].map((n) => [n, `0${n}`, `wadiya-${n}`, 'practice_lab']),
    );
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
    expect(LESSON_CONFIG.lessonProblem).toBeUndefined();
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation' && /^wadiya-\d$/.test(r.code));
    expect(situations.map((r) => [r.code, r.module])).toEqual([1, 2, 3, 4, 5, 6].map((n) => [`wadiya-${n}`, n]));
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      expect(part.asks.length, `${p.id} ${part.label}`).toBeGreaterThanOrEqual(demandsOf(part.question));
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('no training step is an assessment, each situation has a drawn support and a distinct tone', () => {
    for (const p of PROBLEMS) {
      for (const part of p.parts) for (const s of part.steps) expect(s.assessment, p.id).toBeUndefined();
      expect(Boolean(p.figure || p.table || p.illustration), p.id).toBe(true);
    }
    expect(new Set(PROBLEMS.map((p) => p.tone)).size).toBe(6);
  });

  it('every figure is valid, readable (figureQuality) and drawn on the statement numbers', () => {
    for (const p of PROBLEMS.filter((q) => q.figure)) {
      expect(validateGeoFigure(p.figure), p.id).toEqual([]);
      expect(figureQuality(p.figure), p.id).toEqual([]);
    }
    const d = (P, a, b) => Math.hypot(P[b][0] - P[a][0], P[b][1] - P[a][1]);
    const t = PROBLEM['wadiya-1'].figure.points;
    expect([d(t, 'P', 'T'), d(t, 'P', 'E'), d(t, 'T', 'E')]).toEqual([8, 6, 10]);
    const c = PROBLEM['wadiya-2'].figure.points;
    expect(d(c, 'O', 'A') * 10).toBeCloseTo(600, 0);
    expect(atanDeg(c.A[1] / c.H[0])).toBeCloseTo(28, 1);
    expect(d(c, 'A', 'C') * 10).toBeCloseTo(400, 5);
    expect(d(c, 'C', 'B') * 10).toBeCloseTo(300, 5);
    expect(d(c, 'A', 'B') * 10).toBeCloseTo(500, 0);
    const k = PROBLEM['wadiya-3'].figure.points;
    expect([d(k, 'O', 'K'), d(k, 'H', 'K')]).toEqual([50, 30]);
    const w = PROBLEM['wadiya-6'].figure.points;
    expect([d(w, 'A', 'C'), d(w, 'C', 'D'), d(w, 'D', 'E')]).toEqual([60, 20, 16]);
    expect(d(w, 'D', 'E') / d(w, 'A', 'B')).toBeCloseTo(d(w, 'C', 'D') / d(w, 'C', 'A'), 12); // (DE) ∥ (AB) : Thalès
    expect(w.E[0]).toBe(w.D[0]);
  });

  it('وضعية 1 — the numbers are computed, not typed', () => {
    expect(expectedOf('wadiya-1', 0)).toEqual([roundTo(8 / 6, 2), roundTo(atanDeg(8 / 6), 0), Math.sqrt(8 ** 2 + 6 ** 2)]);
    expect(roundTo(atanDeg(1.33), 0)).toBe(53); // arrondir tan avant la touche inverse ne change pas ici l'entier
    expect(expectedOf('wadiya-1', 1)).toEqual([roundTo(8 / tanDeg(35), 2), roundTo(8 / sinDeg(35), 2)]);
    expect(8 / tanDeg(35) > 6).toBe(true);
  });

  it('وضعية 2 — the numbers are computed, not typed', () => {
    expect(expectedOf('wadiya-2', 0)).toEqual([roundTo(600 * sinDeg(28), 1), roundTo(600 * cosDeg(28), 1)]);
    expect(expectedOf('wadiya-2', 1)).toEqual([Math.sqrt(400 ** 2 + 300 ** 2), 300 / 400, roundTo(atanDeg(300 / 400), 0)]);
    const dz = 600 * sinDeg(28) + 300;
    expect(roundTo(dz, 0)).toBe(582);
    expect(roundTo(roundTo(600 * sinDeg(28), 1) + 300, 0)).toBe(582); // même résultat : pas de piège ici
    expect(expectedOf('wadiya-2', 2)).toEqual([roundTo(dz, 0), 600 + 500, (600 + 500) / 5]);
  });

  it('وضعية 3 — the numbers are computed, not typed', () => {
    const sin = 30 / 50; const cos2 = 1 - sin ** 2; const cos = Math.sqrt(cos2);
    expect(expectedOf('wadiya-3', 0).map((v) => Math.round(v * 1e9) / 1e9)).toEqual([sin, cos2, cos, sin / cos].map((v) => Math.round(v * 1e9) / 1e9));
    expect(cos * 50).toBeCloseTo(Math.sqrt(50 ** 2 - 30 ** 2), 12); // OH = 40 aussi par Pythagore
    expect(expectedOf('wadiya-3', 1)).toEqual([Math.round(cos * 50), Math.round(35 * sin)]);
    expect(expectedOf('wadiya-3', 2)).toEqual([roundTo(asinDeg(sin), 0)]);
    expect(roundTo(atanDeg(sin / cos), 0)).toBe(roundTo(asinDeg(sin), 0));
    expect(roundTo(asinDeg(sin), 0)).toBeGreaterThan(30);
  });

  it('وضعية 4 — the numbers are computed, not typed', () => {
    const AC = Math.hypot(4, 3); const AD2 = AC ** 2 + 2.4 ** 2;
    expect(AC).toBe(5);
    expect(expectedOf('wadiya-4', 0)).toEqual([5, roundTo(AD2, 2), roundTo(Math.sqrt(AD2), 2)]);
    expect(Math.sqrt(AD2) > 5.5 && Math.sqrt(AD2) <= 6).toBe(true); // la pièce de 5,5 m ne suffit pas, celle de 6 m oui
    expect(expectedOf('wadiya-4', 2)).toEqual([2.4 / 5, roundTo(atanDeg(2.4 / 5), 0)]);
    expect(roundTo(asinDeg(2.4 / Math.sqrt(AD2)), 0)).toBe(26); // la même valeur par le sinus (valeur exacte)
    const fig = PROBLEM['wadiya-4'].figure.points;
    expect(fig.B[0] - fig.A[0]).toBeGreaterThan(fig.F[1] - fig.A[1] - 6); // le pavé est dessiné, pas une bande
  });

  it('وضعية 5 — the numbers are computed, not typed', () => {
    const rows = PROBLEM['wadiya-5'].table.rows.map((r) => r.slice(1).map(Number));
    expect(rows).toEqual([[200, 50], [150, 80], [240, 70]]);
    const angles = rows.map(([a, h]) => roundTo(atanDeg(h / a), 0));
    expect(expectedOf('wadiya-5', 0)).toEqual(angles);
    expect(angles).toEqual([14, 28, 16]);
    expect(angles.map((x) => x <= 20)).toEqual([true, false, true]); // A et C conviennent
    expect(expectedOf('wadiya-5', 1)).toEqual([Math.hypot(150, 80)]);
    expect(expectedOf('wadiya-5', 2)).toEqual([roundTo(250 * tanDeg(18), 1), roundTo(250 / cosDeg(18), 1)]);
  });

  it('وضعية 6 — the numbers are computed, not typed', () => {
    const AB = (16 * 60) / 20; const tanX = AB / 60;
    expect(expectedOf('wadiya-6', 0)).toEqual([AB]);
    expect(expectedOf('wadiya-6', 1)).toEqual([tanX, roundTo(atanDeg(tanX), 0)]);
    expect(atanDeg(16 / 20)).toBeCloseTo(atanDeg(tanX), 12); // le petit triangle donne le même angle
    const BC = Math.sqrt(60 ** 2 + AB ** 2);
    expect(expectedOf('wadiya-6', 2)).toEqual([roundTo(BC, 2)]);
    expect(BC < 80).toBe(true);
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
    expect(() => checkText('$\\dfrac{8}{\\tan 35^{\\circ}} \\approx 11{,}43$', 'ok')).not.toThrow();
    expect(() => checkText('$\\dfrac{8}{\\tan 35^{\\circ}} \\approx 11{,}33$', 'mutated')).toThrow();
    expect(() => checkText('$AC^2 = 4^2 + 3^2 = 24$', 'mutated')).toThrow();
  });
});
