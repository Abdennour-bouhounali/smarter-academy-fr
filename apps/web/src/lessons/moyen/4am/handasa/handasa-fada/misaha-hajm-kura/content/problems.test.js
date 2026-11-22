import { describe, it, expect } from 'vitest';
import * as SP from '@smarter-academy/core/arithmetic/space.js';
import * as Q from '@smarter-academy/core/arithmetic/linear.js';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { validateSpaceFigure, spaceFigureQuality } from '../../../../../../common/components/spaceFigure';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les مسائل du درس « مساحة الكرة وحجم الجلة » : contrat GuidedProblem, place dans le parcours, et SURTOUT chaque nombre
 * recalculé — les aires et volumes par space.js (`sphereArea`, `ballVolume`, `cylinder`, `piRound` : k·π exacts), le reste en
 * arithmétique exacte — et chaque égalité écrite dans les explications, les options justes et les rédactions ÉVALUÉE par un
 * petit vérificateur qui connaît π (k·π^e exact), les fractions \frac, les unités (cm, m, dm, L) et « ≈ » / « … ».
 */
const numericOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric');
const expectedOf = (id, part) => numericOf(id, part).map((s) => s.expected);
const choiceOf = (id, part, k) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice')[k];
const chosen = (step) => step.options[step.correct];
/** Le LaTeX d'un k·π de space.js tel que le contenu l'écrit (décimales à virgule « 60{,}5\pi »). */
const piTex = (k) => {
  let d = k.d; while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5;
  return d === 1 ? `${String(Q.toNumber(k)).replace('.', '{,}')}\\pi` : SP.piLatex(k);
};
/** Arrondi décimal → nombre (piRound renvoie « 153,9 »). */
const piR = (k, d) => Number(SP.piRound(k, d).replace(',', '.'));

// ── Vérificateur : valeurs c·π^e·u (c rationnel exact, u facteur d'unité en cm^n), + − × ÷ ^ \frac, juxtaposition. ─────
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const R = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(Math.abs(n), d) || 1; return [n / g, d / g]; };
const rAdd = (x, y) => R(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const rMul = (x, y) => R(x[0] * y[0], x[1] * y[1]);
const rDiv = (x, y) => R(x[0] * y[1], x[1] * y[0]);
const rNeg = (x) => [-x[0], x[1]];
const rPow = (x, e) => { let v = R(1); for (let k = 0; k < e; k += 1) v = rMul(v, x); return v; };
const dec = (v) => { const [i, f = ''] = String(v).split('.'); return R(Number(i + f), 10 ** f.length); };
const UNIT = { cm: 1, m: 100, dm: 10, mm: [1, 10], L: 1000, g: 1 };
const V = (c, e = 0, u = [1, 1], unit = false) => ({ c, e, u, unit });
const vMul = (a, b) => V(rMul(a.c, b.c), a.e + b.e, rMul(a.u, b.u), a.unit || b.unit);
const vDiv = (a, b) => V(rDiv(a.c, b.c), a.e - b.e, rDiv(a.u, b.u), a.unit || b.unit);
const vAdd = (a, b, sign = 1) => {
  if (a.e !== b.e) throw new Error('π-powers differ in a sum');
  return V(rAdd(a.c, sign > 0 ? b.c : rNeg(b.c)), a.e, a.u, a.unit || b.unit);
};
function prep(src) {
  let s = src.replace(/\\dfrac/g, '\\frac').replace(/\{,\}/g, '.').replace(/\\left|\\right/g, '');
  s = s.replace(/\\,\\mathrm\{([a-zA-Z]+)\}(?:\^(\d))?/g, (_, u, n) => {
    if (!(u in UNIT)) return 'X';
    const f = Array.isArray(UNIT[u]) ? UNIT[u] : [UNIT[u], 1];
    const p = Number(n ?? 1);
    return `@${f[0] ** p}/${f[1] ** p}@`;
  });
  for (let k = 0; k < 4; k += 1) s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))');
  s = s.replace(/\\pi/g, 'p').replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\\ldots/g, '~').replace(/\s+/g, '');
  return s;
}
function evalExpr(src) {
  const s = prep(src);
  if (!s || !/^[\d.+\-*/()^p@~]+$/.test(s)) return null; // une lettre (R, \mathcal{A}, V…) : membre non numérique
  let i = 0;
  let trunc = false;
  const atom = () => {
    let v;
    if (s[i] === '(') { i += 1; v = sum(); i += 1; } else if (s[i] === 'p') { i += 1; v = V(R(1), 1); } else if (s[i] === '@') {
      const j = s.indexOf('@', i + 1); const [a, b] = s.slice(i + 1, j).split('/').map(Number); i = j + 1; v = V(R(1), 0, R(a, b), true);
    } else {
      const j = i; while (/[\d.]/.test(s[i] ?? '')) i += 1;
      if (j === i) throw new Error(`bad number in ${src}`);
      v = V(dec(s.slice(j, i)));
    }
    if (s[i] === '^') { i += 1; const j = i; while (/\d/.test(s[i] ?? '')) i += 1; const e = Number(s.slice(j, i)); v = V(rPow(v.c, e), v.e * e, rPow(v.u, e), v.unit); }
    return v;
  };
  const jux = () => { let v = atom(); while (/[\d(p@]/.test(s[i] ?? '')) v = vMul(v, atom()); if (s[i] === '~') { trunc = true; i += 1; } return v; };
  const prod = () => { let v = jux(); while (s[i] === '*' || s[i] === '/') { const op = s[i]; i += 1; const w = jux(); v = op === '*' ? vMul(v, w) : vDiv(v, w); } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i]; i += 1; v = vAdd(v, prod(), op === '+' ? 1 : -1); } return v; };
  const v = sum();
  if (i !== s.length) return null;
  v.trunc = trunc;
  v.digits = (src.replace(/\{,\}/g, '.').match(/\.(\d+)/) ?? [null, ''])[1].length;
  return v;
}
const num = (v) => (v.c[0] / v.c[1]) * Math.PI ** v.e;
const cmpExact = (a, b) => {
  expect(a.e, 'π-power').toBe(b.e);
  const both = a.unit && b.unit;
  const x = both ? rMul(a.c, a.u) : a.c; const y = both ? rMul(b.c, b.u) : b.c;
  return Math.sign(x[0] * y[1] - y[0] * x[1]);
};
/** Chaque couple de membres NUMÉRIQUES voisins vérifie sa relation (=, <, >, ≈, « … » = troncature). Renvoie le compte. */
function checkText(text) {
  let checked = 0;
  for (const [, f] of String(text ?? '').matchAll(/\$([^$]+)\$/g)) {
    const tokens = f.split(/(\\approx|\\neq|\\le|=|<|>)/);
    for (let k = 1; k + 1 < tokens.length; k += 2) {
      const a = evalExpr(tokens[k - 1]); const b = evalExpr(tokens[k + 1]);
      if (!a || !b) continue;
      const rel = tokens[k];
      if (rel === '\\approx' || b.trunc) {
        const p = 10 ** b.digits; const x = num(a) * p;
        const got = b.trunc ? Math.floor(x + 1e-9) : Math.round(x);
        expect(got, f).toBe(Math.round(num(b) * p));
      } else {
        const c = cmpExact(a, b);
        expect({ '=': c === 0, '<': c < 0, '>': c > 0, '\\le': c <= 0, '\\neq': c !== 0 }[rel], f).toBe(true);
      }
      checked += 1;
    }
  }
  return checked;
}
const allTexts = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
/** Les textes qui doivent être VRAIS : explications, options justes, rédactions. */
const trueTexts = (p) => p.parts.flatMap((part) => part.steps.flatMap((s) => [s.explain, ...(s.lines ?? []), s.kind === 'choice' ? s.options[s.correct] : null])).filter(Boolean);

describe('les مسائل du درس « مساحة الكرة وحجم الجلة »', () => {
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

  it('a statement that says « الشكل المقابل » shows a valid, readable SpaceFigure — and only those', () => {
    for (const p of PROBLEMS) {
      const refers = /الشكل/.test(allTexts(p).join(' '));
      expect(!!p.figure, p.id).toBe(refers);
      if (!p.figure) continue;
      expect(p.figure.kind, p.id).toBe('space');
      expect(validateSpaceFigure(p.figure), p.id).toEqual([]);
      expect(spaceFigureQuality(p.figure), p.id).toEqual([]);
    }
    expect(PROBLEMS.filter((p) => p.figure).map((p) => p.id)).toEqual(['masala-1', 'masala-2']);
  });

  it('the figures say what the statements say', () => {
    // مسألة 1 : une boule de rayon 3,5 dans un cylindre de rayon 3,5 et de hauteur 7 ; le diamètre AB coté 7 cm.
    const f1 = PROBLEM['masala-1'].figure;
    const [cyl, ball] = f1.solids;
    expect([cyl.type, cyl.radius, ball.type, ball.radius]).toEqual(['cylinder', 3.5, 'sphere', 3.5]);
    expect(f1.points[cyl.top][2] - f1.points[cyl.base][2]).toBe(7);
    expect(SP.distanceSquared3(f1.points.A, f1.points.B).n).toBe(49);
    expect(f1.segments[0].label).toBe('7 cm');
    expect(PROBLEM['masala-1'].statement).toContain('$7\\,\\mathrm{cm}$');
    // مسألة 2 : une sphère de rayon 7,5, le diamètre AB coté 15 m.
    const f2 = PROBLEM['masala-2'].figure;
    expect(f2.solids[0].radius).toBe(7.5);
    expect(SP.distanceSquared3(f2.points.A, f2.points.B).n).toBe(225);
    expect(f2.segments[0].label).toBe('15 m');
    expect(PROBLEM['masala-2'].statement).toContain('$15\\,\\mathrm{m}$');
  });

  it('مسألة 1 — the numbers are computed, not typed', () => {
    const D = 7; const r = D / 2;
    expect(PROBLEM['masala-1'].statement).toContain('بـ 30 دج');
    // 1) R, R², 𝒜 = 49π ≈ 153,9 ; le piège du diamètre : 196π
    const area = SP.sphereArea('3,5').k;
    expect(expectedOf('masala-1', 0)).toEqual([r, r * r, piR(area, 1)]);
    expect(chosen(choiceOf('masala-1', 0, 1))).toBe(`$${piTex(area)}\\,\\mathrm{cm}^2$`);
    expect(choiceOf('masala-1', 0, 1).options[1]).toBe(`$${piTex(SP.sphereArea(D).k)}\\,\\mathrm{cm}^2$`);
    // 2) R³, 𝒱 = 343π/6, le verre π·R²·2R = 343π/4, le rapport 2/3 (Archimède)
    const vol = SP.ballVolume('3,5').k;
    const glass = SP.cylinder('3,5', 7).volume.k;
    expect(expectedOf('masala-1', 1)).toEqual([r ** 3]);
    expect(chosen(choiceOf('masala-1', 1, 0))).toBe(`$${SP.piLatex(vol)}\\,\\mathrm{cm}^3$`);
    expect(choiceOf('masala-1', 1, 0).options[1]).toBe(`$${SP.piLatex(SP.ballVolume(D).k)}\\,\\mathrm{cm}^3$`);
    expect(chosen(choiceOf('masala-1', 1, 1))).toBe(`$${SP.piLatex(glass)}\\,\\mathrm{cm}^3$`);
    expect(Q.eq(Q.div(vol, glass), Q.frac(2, 3))).toBe(true);
    // 3) le jus : la moitié de 343π/6 ≈ 89,8 ; 1000 ÷ 89,8 ≈ 11,14 ; 11 oranges échouent, 12 suffisent ; 12 × 30
    const juice = Q.div(vol, 2);
    const jt = piR(juice, 1);
    expect(jt).toBe(89.8);
    const n = Math.ceil(1000 / (Q.toNumber(juice) * Math.PI));
    expect(Q.toNumber(juice) * Math.PI * 11 < 1000 && jt * 11 < 1000).toBe(true);
    expect(n).toBe(12);
    expect(Math.ceil(1000 / (Q.toNumber(juice) * 3.14))).toBe(12); // robuste avec π ≈ 3,14
    expect(expectedOf('masala-1', 2)).toEqual([jt, Math.round((1000 / jt) * 100) / 100, n, n * 30]);
  });

  it('مسألة 2 — the numbers are computed, not typed', () => {
    const D = 15;
    const vol = SP.ballVolume('7,5').k;
    expect(piTex(vol)).toBe('562{,}5\\pi');
    const rounded = Math.round(Q.toNumber(vol) * Math.PI);
    expect(expectedOf('masala-2', 0)).toEqual([7.5 ** 3, rounded]);
    expect(chosen(choiceOf('masala-2', 0, 1))).toBe(`$${piTex(vol)}\\,\\mathrm{m}^3$`);
    expect(choiceOf('masala-2', 0, 1).options[1]).toBe(`$${SP.piLatex(SP.ballVolume(D).k)}\\,\\mathrm{m}^3$`);
    // 2) 85 % du volume arrondi, en m³ puis en L (centièmes entiers : aucune virgule flottante)
    const maxCenti = 85 * rounded; // en centièmes de m³
    expect(maxCenti).toBe(150195);
    const maxL = maxCenti * 10; // 1 m³ = 1000 L
    expect(expectedOf('masala-2', 1)).toEqual([maxCenti / 100, maxL]);
    // 3) des camions de 25000 L : 60 voyages échouent, 61 suffisent ; 61 × 12000
    const trips = Math.ceil(maxL / 25000);
    expect(60 * 25000 < maxL && trips === 61).toBe(true);
    expect(expectedOf('masala-2', 2)).toEqual([Math.round((maxL / 25000) * 100) / 100, trips, trips * 12000]);
  });

  it('مسألة 3 — the numbers are computed, not typed', () => {
    const D = 11; const r = D / 2;
    // 1) la demi-sphère : la moitié de 4π·5,5² = 60,5π ≈ 190,1 ; pièges : la sphère entière, le diamètre, la base en plus
    const dome = Q.div(SP.sphereArea('5,5').k, 2);
    expect(piTex(dome)).toBe('60{,}5\\pi');
    expect(expectedOf('masala-3', 0)).toEqual([r, piR(dome, 1)]);
    const opts = choiceOf('masala-3', 0, 1).options;
    expect(chosen(choiceOf('masala-3', 0, 1))).toBe(`$${piTex(dome)}\\,\\mathrm{m}^2$`);
    expect(opts[1]).toBe(`$${piTex(SP.sphereArea('5,5').k)}\\,\\mathrm{m}^2$`);
    expect(opts[2]).toBe(`$${piTex(Q.div(SP.sphereArea(D).k, 2))}\\,\\mathrm{m}^2$`);
    expect(opts[3]).toBe(`$${piTex(Q.add(dome, Q.mul(Q.parseNumber('5,5'), Q.parseNumber('5,5'))))}\\,\\mathrm{m}^2$`);
    // 2) deux couches, 1 L pour 10 m² : 12,1π ≈ 38,0 L ; seaux de 5 L : 7 échouent, 8 suffisent
    const litres = Q.div(Q.mul(dome, 2), 10);
    const lt = piR(litres, 1);
    expect(lt).toBe(38);
    const buckets = Math.ceil((Q.toNumber(litres) * Math.PI) / 5);
    expect(7 * 5 < Q.toNumber(litres) * Math.PI && buckets === 8).toBe(true);
    expect(Math.ceil((Q.toNumber(litres) * 3.14) / 5)).toBe(8); // robuste avec π ≈ 3,14
    expect(expectedOf('masala-3', 1)).toEqual([lt, lt / 5, buckets]);
    // 3) 8 × 3200 face aux 25000 دج collectés
    const cost = buckets * 3200;
    expect(cost > 25000).toBe(true);
    expect(expectedOf('masala-3', 2)).toEqual([cost, cost - 25000]);
    expect(chosen(choiceOf('masala-3', 2, 0))).toMatch(/^لا يكفي/);
  });

  it('every equality / approximation written in explains, correct options and solutions is TRUE', () => {
    let checked = 0;
    for (const p of PROBLEMS) for (const t of trueTexts(p)) checked += checkText(t);
    expect(checked).toBeGreaterThan(60);
  });

  it('the checker catches a wrong number (mutation)', () => {
    expect(() => checkText('$4\\pi \\times 3{,}5^2 = 48\\pi\\,\\mathrm{cm}^2$')).toThrow();
    expect(() => checkText('$\\frac{4}{3}\\pi \\times 7{,}5^3 = 562{,}5\\,\\mathrm{m}^3$')).toThrow(); // π oublié
    expect(() => checkText('$49\\pi \\approx 154{,}0\\,\\mathrm{cm}^2$')).toThrow();
    expect(() => checkText('$60{,}5\\pi = 190{,}067\\ldots$')).toThrow();
    expect(() => checkText('$1\\,\\mathrm{m}^3 = 100\\,\\mathrm{L}$')).toThrow();
    expect(checkText('$1\\,\\mathrm{L} = 1\\,\\mathrm{dm}^3$')).toBe(1);
  });

  it('no bare point name, « x² » or « a/b » in the Arabic prose', () => {
    for (const p of PROBLEMS) for (const t of allTexts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, t).not.toMatch(/[A-Z]/);
      expect(prose, t).not.toMatch(/\d\s*\/\s*\d|²|³|√|DA\b/);
    }
  });
});
