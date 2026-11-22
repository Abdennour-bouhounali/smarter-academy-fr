import { describe, it, expect } from 'vitest';
import * as SP from '@smarter-academy/core/arithmetic/space.js';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { validateSpaceFigure, spaceFigureQuality } from '../../../../../../common/components/spaceFigure';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les مسائل du درس « الكرة والجلة » : contrat GuidedProblem, place dans le parcours, et SURTOUT chaque nombre recalculé —
 * les positions par space.js (`ballPosition`, comparaison EXACTE de OM² et R²), le reste en arithmétique exacte (dixièmes
 * en entiers), et chaque égalité / inégalité écrite dans les explications, les options justes et les rédactions évaluée.
 */
const numericOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric');
const expectedOf = (id, part) => numericOf(id, part).map((s) => s.expected);
const chosen = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice').map((s) => s.options[s.correct]);
const O = [0, 0, 0];
const div = (a, b) => ({ q: Math.floor(a / b), r: a % b });
/** Un décimal → dixièmes entiers (aucune virgule flottante dans une comparaison). */
const tenths = (x) => Math.round(x * 10);

// ── Vérificateur des formules $…$ : + − × ÷ ^ parenthèses, décimaux « 3{,}14 », unités \,\mathrm{…} ignorées. ──────────
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const R = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(Math.abs(n), d) || 1; return [n / g, d / g]; };
const rAdd = (x, y) => R(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const rSub = (x, y) => R(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
const rMul = (x, y) => R(x[0] * y[0], x[1] * y[1]);
const rDiv = (x, y) => R(x[0] * y[1], x[1] * y[0]);
const rPow = (x, e) => { let v = R(1); for (let k = 0; k < e; k += 1) v = rMul(v, x); return v; };
const rCmp = (x, y) => Math.sign(x[0] * y[1] - y[0] * x[1]);
const dec = (v) => { const [i, f = ''] = String(v).split('.'); return R(Number(i + f), 10 ** f.length); };
function evalExpr(src) {
  const s = src
    .replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/\{,\}/g, '.')
    .replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\s+/g, '');
  if (!s || !/^[\d.+\-*/()^]+$/.test(s)) return null; // une lettre (OA, R, \pi…) : ce membre n'est pas numérique
  let i = 0;
  const atom = () => {
    let v;
    if (s[i] === '(') { i += 1; v = sum(); i += 1; } else {
      const j = i; while (/[\d.]/.test(s[i] ?? '')) i += 1;
      if (j === i) throw new Error(`bad number in ${src}`);
      v = dec(s.slice(j, i));
    }
    if (s[i] === '^') { i += 1; const j = i; while (/\d/.test(s[i] ?? '')) i += 1; v = rPow(v, Number(s.slice(j, i))); }
    return v;
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i]; i += 1; const w = atom(); v = op === '*' ? rMul(v, w) : rDiv(v, w); } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i]; i += 1; const w = prod(); v = op === '+' ? rAdd(v, w) : rSub(v, w); } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
const REL = { '=': (c) => c === 0, '<': (c) => c < 0, '>': (c) => c > 0, '\\le': (c) => c <= 0, '\\neq': (c) => c !== 0 };
/** Chaque couple de membres NUMÉRIQUES voisins d'une formule vérifie sa relation. Renvoie le nombre de relations vérifiées. */
function checkText(text) {
  let checked = 0;
  for (const [, f] of String(text ?? '').matchAll(/\$([^$]+)\$/g)) {
    if (f.includes('\\approx') || f.includes('\\perp')) continue;
    const tokens = f.split(/(\\neq|\\le|=|<|>)/);
    for (let k = 1; k + 1 < tokens.length; k += 2) {
      const a = evalExpr(tokens[k - 1]); const b = evalExpr(tokens[k + 1]);
      if (!a || !b) continue;
      expect(REL[tokens[k]](rCmp(a, b)), f).toBe(true);
      checked += 1;
    }
  }
  return checked;
}
const allTexts = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
/** Les textes qui doivent être VRAIS : explications, options justes, rédactions. */
const trueTexts = (p) => p.parts.flatMap((part) => part.steps.flatMap((s) => [s.explain, ...(s.lines ?? []), s.kind === 'choice' ? s.options[s.correct] : null])).filter(Boolean);

describe('les مسائل du درس « الكرة والجلة »', () => {
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
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(79);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].figure).toBe(LESSON_CONFIG.lessonProblem.figure);
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

  it('every statement shows its figure (« الشكل المقابل »): valid SpaceFigure, readable', () => {
    for (const p of PROBLEMS) {
      expect(p.statement, p.id).toMatch(/الشكل المقابل/);
      expect(p.figure.kind, p.id).toBe('space');
      expect(validateSpaceFigure(p.figure), p.id).toEqual([]);
      expect(spaceFigureQuality(p.figure), p.id).toEqual([]);
    }
  });

  it('the figures say what the statements say', () => {
    // مسألة 1 : sphère de rayon 6, axes qui sortent de la sphère en X1, Y1, Z1.
    const f1 = PROBLEM['masala-1'].figure;
    expect(f1.solids[0].radius).toBe(6);
    for (const n of ['X1', 'Y1', 'Z1']) expect(SP.ballPosition(O, 6, f1.points[n]).where).toBe('surface');
    // مسألة 2 : R = 5, N et S aux extrémités d'un diamètre vertical, A et B sur la sphère, AB = 8, I milieu, OI = 3.
    const f2 = PROBLEM['masala-2'].figure.points;
    for (const n of ['N', 'S', 'A', 'B']) expect(SP.ballPosition(O, 5, f2[n]).where, n).toBe('surface');
    expect(SP.distanceSquared3(f2.N, f2.S).n).toBe(100);
    expect(SP.distanceSquared3(f2.A, f2.B).n).toBe(64);
    expect(f2.I).toEqual([0, 1, 2].map((k) => (f2.A[k] + f2.B[k]) / 2));
    expect(SP.distanceSquared3(O, f2.I).n).toBe(9);
    // مسألة 3 : R = 11 ; V sur la sphère, le diamètre [DE] coté 22 cm, le plan (P) contient O.
    const f3 = PROBLEM['masala-3'].figure;
    expect(f3.solids[0].radius).toBe(11);
    expect(SP.ballPosition(O, 11, f3.points.V).where).toBe('surface');
    expect(SP.distanceSquared3(f3.points.D, f3.points.E).n).toBe(22 * 22);
    expect(['P1', 'P2', 'P3', 'P4'].every((n) => f3.points[n][2] === 0)).toBe(true);
  });

  it('مسألة 1 — the numbers are computed, not typed', () => {
    const r = 6;
    const pts = { A: [2, 4, 4], B: [5, 1, 3], C: [4, 4, 3] };
    for (const [n, p] of Object.entries(pts)) expect(PROBLEM['masala-1'].statement).toContain(`$${n}(${p.join('\\,;\\,')})$`);
    const pos = Object.fromEntries(Object.entries(pts).map(([n, p]) => [n, SP.ballPosition(O, r, p)]));
    expect(expectedOf('masala-1', 0)).toEqual(['A', 'B', 'C'].map((n) => SP.distanceSquared3(O, pts[n]).n));
    expect(['A', 'B', 'C'].map((n) => pos[n].where)).toEqual(['surface', 'inside', 'outside']);
    // le piège : C a toutes ses coordonnées < 6 et est dehors ; B a une somme de coordonnées > 6 et est dedans
    expect(pts.C.every((x) => x < r)).toBe(true);
    expect(pts.B.reduce((s, x) => s + x, 0)).toBeGreaterThan(r);
    const conclusions = PROBLEM['masala-1'].parts[0].steps.filter((s) => s.kind === 'choice' && s.ask != null).map((s) => s.correct);
    expect(conclusions).toEqual(['surface', 'inside', 'outside'].map((w) => ['surface', 'inside', 'outside'].indexOf(w)));
    // 2) le rayon de la دائرة كبرى, le diamètre 2R ; B n'est pas sur la sphère
    expect(expectedOf('masala-1', 1)).toEqual([r, SP.diameter(r).n]);
    expect(pos.B.onSphere).toBe(false);
    // 3) la boîte : le côté doit être ≥ 2R ; 11 échoue, 13 convient ; 8 boîtes à 420 دج
    const D = SP.diameter(r).n;
    expect(11 < D && 13 >= D && 11 > r).toBe(true);
    expect(expectedOf('masala-1', 2)).toEqual([8 * 420]);
  });

  it('مسألة 2 — the numbers are computed, not typed', () => {
    const r = 5; const AB = 8;
    expect(expectedOf('masala-2', 0)).toEqual([SP.diameter(r).n, r]);
    const AI = AB / 2; const OI2 = r * r - AI * AI; const OI = Math.sqrt(OI2);
    expect(Number.isInteger(OI)).toBe(true);
    expect(expectedOf('masala-2', 1)).toEqual([AI, OI]);
    expect(SP.ballPosition(O, r, [0, 0, OI]).where).toBe('inside');
    // 3) π ≈ 3,14 : 2 × 3,14 × 5 en dixièmes, puis × 450 (exact en dixièmes)
    const lengthTenths = 2 * 314 * r / 10; // 314 centièmes → dixièmes
    expect(lengthTenths).toBe(314);
    expect(numericOf('masala-2', 2).map((s) => tenths(s.expected))).toEqual([lengthTenths, lengthTenths * 450]);
    expect(numericOf('masala-2', 2)[0].display).toBe('31,4');
  });

  it('مسألة 3 — the numbers are computed, not typed', () => {
    const D = 22; const r = D / 2;
    expect(SP.diameter(r).n).toBe(D);
    expect(expectedOf('masala-3', 0)).toEqual([r]);
    expect(SP.ballPosition(O, r, [0, 0, r]).where).toBe('surface'); // la valve
    expect(SP.ballPosition(O, r, O).where).toBe('inside'); // le capteur au centre
    // 2) (γ₁) de centre O : rayon R ; (γ₂) : diamètre mesuré 17,6 → rayon 8,8 < 11 : petit cercle
    const r2Tenths = tenths(17.6) / 2;
    expect(numericOf('masala-3', 1).map((s) => tenths(s.expected))).toEqual([tenths(r), r2Tenths]);
    expect(r2Tenths < tenths(r)).toBe(true);
    expect(SP.isGreatCircle(r, r2Tenths / 10)).toBe(false);
    expect(SP.isGreatCircle(r, r)).toBe(true);
    // 3) 200 cm de رفّ, des ballons de 22 cm : 200 = 22 × 9 + 2 ; avec le rayon on aurait cru 18
    const d = div(200, D);
    expect(expectedOf('masala-3', 2)).toEqual([d.q, d.r, d.q, d.q * 3200]);
    expect(div(200, r).q).not.toBe(d.q);
  });

  it('every equality / inequality written in explains, correct options and solutions is TRUE', () => {
    let checked = 0;
    for (const p of PROBLEMS) for (const t of trueTexts(p)) checked += checkText(t);
    expect(checked).toBeGreaterThan(40);
  });

  it('the checker catches a wrong number (mutation)', () => {
    expect(() => checkText('$2^2 + 4^2 + 4^2 = 37$')).toThrow();
    expect(() => checkText('$35 > 36$')).toThrow();
  });

  it('no bare point name, « x² » or « a/b » in the Arabic prose', () => {
    for (const p of PROBLEMS) for (const t of allTexts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, t).not.toMatch(/[A-Z]/);
      expect(prose, t).not.toMatch(/\d\s*\/\s*\d|²|√|DA\b/);
    }
  });

  it('chosen answers name the right object', () => {
    expect(chosen('masala-2', 0)).toEqual(['قطر للكرة طوله $2R$', 'دائرة كبرى: مركزها مركز الكرة $O$']);
    expect(chosen('masala-3', 2)[0]).toBe('طول قطرها');
  });
});
