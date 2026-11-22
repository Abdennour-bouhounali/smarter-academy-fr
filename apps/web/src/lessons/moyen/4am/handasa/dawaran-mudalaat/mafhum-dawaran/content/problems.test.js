import { describe, it, expect } from 'vitest';
import * as RT from '@smarter-academy/core/arithmetic/rotation.js';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { figureQuality } from '../../../../../../common/components/geoFigure';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les مسائل du درس « مفهوم الدوران » : chaque nombre attendu, chaque égalité écrite et chaque verdict « صورة / ليست
 * صورة » est RECALCULÉ ici — les images par rotation.imageCheck / rotate (packages/core) sur les points DESSINÉS des
 * figures, les durées et les mesures par l'arithmétique de l'énoncé.
 */
const stepsOf = (id, part) => PROBLEM[id].parts[part].steps;
const expectedOf = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
const correctOf = (id, part, k) => { const s = stepsOf(id, part).filter((x) => x.kind === 'choice')[k]; return s.options[s.correct]; };
const pt = (fig, n) => ({ x: fig.points[n][0], y: fig.points[n][1] });
const O = { x: 0, y: 0 };
const check = (fig, a, b, alpha, dir) => RT.imageCheck(O, pt(fig, a), pt(fig, b), alpha, dir, { tol: 1e-3, tolDeg: 0.05 });
const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
const near = (x, y, eps = 1e-3) => Math.abs(x - y) < eps;

// ── Vérificateur des RELATIONS écrites (explain, prompt, options, lignes de solution) ──
// Chaque formule $…$ est découpée sur = < > \neq ; chaque membre purement numérique (entiers, décimaux « 0{,}5 »,
// ×, ÷, +, −, parenthèses) est évalué, et chaque relation entre deux membres numériques VOISINS est vérifiée.
// Les membres qui contiennent une lettre (OA, \widehat{…}) sont ignorés ; les unités (\,\mathrm{cm}) et ^\circ sont ôtées.
function evalExpr(src) {
  const s = src
    .replace(/\^\\circ/g, '')
    .replace(/\\,\\mathrm\{[a-z]+\}/g, '')
    .replace(/\{,\}/g, '.')
    .replace(/\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\s+/g, '');
  if (!/^[\d.+\-*/()]+$/.test(s) || !/\d/.test(s)) return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '(') { i++; const v = sum(); i++; return v; }
    if (s[i] === '-') { i++; return -atom(); }
    const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
    return Number(s.slice(j, i));
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
      const ok = { '=': Math.abs(x - y) < 1e-9, '<': x < y, '>': x > y, '\\neq': Math.abs(x - y) > 1e-9 }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}

describe('les مسائل du درس « مفهوم الدوران وإنشاء صور »', () => {
  it('respect the GuidedProblem contract (figure included)', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    for (const p of PROBLEMS) expect(p.figure, p.id).toBeTruthy();
  });

  it('their figures are readable (figureQuality, guide §5)', () => {
    for (const p of PROBLEMS) expect(figureQuality(p.figure), p.id).toEqual([]);
  });

  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.slug, m.stage, m.estimatedMin])).toEqual([
      [5, 'masala-1', 'practice_lab', 8], [6, 'masala-2', 'practice_lab', 8], [7, 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
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

  it('every data list has a useless NUMBER (the decoy)', () => {
    for (const p of PROBLEMS) expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
  });

  it('every equality written in prompts, options, explains and solutions is true', () => {
    let n = 0;
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) {
      const where = `${p.id} ${part.label} ${s.kind}`;
      for (const t of [s.prompt, s.explain, ...(s.lines ?? [])]) if (t) n += checkText(t, where);
      if (s.kind === 'choice') n += checkText(s.options[s.correct], `${where} (correct option)`);
    }
    expect(n).toBeGreaterThan(25);
  });

  it('مسألة 1 — P is the image (40° indirect), Q the direct twin, R the wrong radius — on the DRAWN points', () => {
    const fig = PROBLEM['masala-1'].figure;
    const st = PROBLEM['masala-1'].statement;
    const OA = 5, OR = 3, ALPHA = 40, SCALE = 2, AXLE = 11;
    for (const s of ['5\\,\\mathrm{cm}', '3\\,\\mathrm{cm}', `${ALPHA}^\\circ`, '2\\,\\mathrm{m}', '11\\,\\mathrm{m}']) expect(st).toContain(s);
    const A = pt(fig, 'A'); const P = pt(fig, 'P'); const Q = pt(fig, 'Q'); const R = pt(fig, 'R');
    // A en bas, sur la verticale de O ; P et Q sur le cercle ; R sur [OP] à 3
    expect(A).toEqual({ x: 0, y: -OA });
    expect(fig.circles[0].radius).toBe(OA);
    expect(near(dist(O, P), OA) && near(dist(O, Q), OA) && near(dist(O, R), OR)).toBe(true);
    expect(near(RT.orientedAngle(O, P, R), 0, 0.05)).toBe(true);
    // les trois verdicts
    expect(check(fig, 'A', 'P', ALPHA, 'indirect').ok).toBe(true);
    const q = check(fig, 'A', 'Q', ALPHA, 'indirect');
    expect([q.ok, q.length, q.angle, q.sense]).toEqual([false, true, true, false]);
    expect(check(fig, 'A', 'Q', ALPHA, 'direct').ok).toBe(true);
    const r = check(fig, 'A', 'R', ALPHA, 'indirect');
    expect([r.ok, r.length, r.angle, r.sense]).toEqual([false, false, true, true]);
    expect(correctOf('masala-1', 0, 2).startsWith('$P$')).toBe(true);
    expect(correctOf('masala-1', 0, 0)).toContain('في اتجاه حركة عقارب الساعة');
    expect(expectedOf('masala-1', 0)).toEqual([OA]);

    // 2) نصف دورة : A1 au sommet, le sens n'y change rien
    const A1 = RT.rotate({ x: 0, y: -OA }, O, 180, 'direct');
    expect(RT.rotate({ x: 0, y: -OA }, O, 180, 'indirect')).toEqual(A1);
    expect([Number(A1.x.n) / Number(A1.x.d), Number(A1.y.n) / Number(A1.y.d)]).toEqual([0, OA]);
    const AA1 = 2 * OA;
    expect(expectedOf('masala-1', 1)).toEqual([AA1]);

    // 3) le réel : l'échelle, puis la hauteur
    expect(expectedOf('masala-1', 2)).toEqual([AA1 * SCALE, OA * SCALE, AXLE + OA * SCALE]);
    expect(AXLE - OA * SCALE).toBeGreaterThan(0); // la nacelle du bas reste au-dessus du sol (1 m) : l'énoncé est plausible
  });

  it('مسألة 2 — the minute hand: 6° a minute, clockwise = indirect', () => {
    const fig = PROBLEM['masala-2'].figure;
    const LONG = 60, PER_MIN = 360 / 60, HOUR_PER_MIN = 360 / 12 / 60;
    const M = pt(fig, 'M'); const H = pt(fig, 'H');
    // la figure : M vers 12 (en haut), H vers 3 (à droite), aiguilles 60 cm et 40 cm à la même échelle (10 cm par unité)
    expect([M.x, M.y * 10, H.x * 10, H.y]).toEqual([0, LONG, 40, 0]);
    const mark = (n) => RT.rotateApprox(M, O, 30 * n, 'indirect'); // la graduation n du cadran, vue de M (= 12)
    expect(near(mark(3).x / 6 * 4, H.x) && near(mark(3).y, 0)).toBe(true);

    // 1) 3 h → 3 h 20 : 120° indirect (M′ vers 4) ; le jumeau direct va vers 8
    expect(expectedOf('masala-2', 0)).toEqual([PER_MIN, 20 * PER_MIN]);
    const M2 = RT.rotateApprox(M, O, 20 * PER_MIN, 'indirect');
    expect(near(M2.x, mark(4).x) && near(M2.y, mark(4).y)).toBe(true);
    const twin = RT.rotateApprox(M, O, 20 * PER_MIN, 'direct');
    expect(near(twin.x, mark(8).x) && near(twin.y, mark(8).y)).toBe(true);
    expect(correctOf('masala-2', 0, 0)).toContain('غير المباشر');

    // 2) reculer de 15 min : 90° DIRECT ; l'aiguille des heures recule de 7,5°
    expect(expectedOf('masala-2', 1)).toEqual([15 * PER_MIN, 15 * HOUR_PER_MIN]);
    expect(correctOf('masala-2', 1, 1)).toBe('الاتجاه المباشر (الموجب)');

    // 3) le demi-tour : 30 min, M1 vers 6, MM1 = 120 cm
    expect(expectedOf('masala-2', 2)).toEqual([180 / PER_MIN, 2 * LONG]);
    const M1 = RT.rotateApprox(M, O, 180, 'indirect');
    expect(near(M1.x, mark(6).x) && near(M1.y, mark(6).y)).toBe(true);
  });

  it('مسألة 3 — the turntable: 18° a minute, direct; the door is 126° the OTHER way → 13 min, not 7', () => {
    const fig = PROBLEM['masala-3'].figure;
    const SPEED = 18, CAR = 4, DOOR = 126;
    const A = pt(fig, 'A'); const B = pt(fig, 'B'); const E = pt(fig, 'E');
    // O milieu de [AB], AB = 4
    expect([(A.x + B.x) / 2, (A.y + B.y) / 2, dist(A, B)]).toEqual([0, 0, CAR]);
    // la flèche de la plateforme tourne dans le sens direct
    expect(fig.arcs[0].sweep).toBe('ccw');
    // la porte : 126° depuis [OA) dans le sens des aiguilles (angle orienté négatif)
    expect(near(RT.orientedAngle(O, A, E), -DOOR, 0.05)).toBe(true);
    expect(fig.angles[0]).toMatchObject({ from: 'A', to: 'E', label: `${DOOR}°`, arrow: true });

    // 1) 5 min : 90° direct, OA′ = OA = 2, A′ au-dessus de O
    const OA = CAR / 2;
    expect(expectedOf('masala-3', 0)).toEqual([5 * SPEED, OA, OA]);
    const A2 = RT.rotate({ x: A.x, y: A.y }, O, 5 * SPEED, 'direct');
    expect(RT.imageCheck(O, { x: A.x, y: A.y }, { x: 0, y: OA }, 90, 'direct').ok).toBe(true);
    expect(Number(A2.y.n) / Number(A2.y.d)).toBe(OA);

    // 2) le demi-tour : B est l'image de A ; 10 min
    expect(check(fig, 'A', 'B', 180, 'direct').ok).toBe(true);
    expect(expectedOf('masala-3', 1)).toEqual([180 / SPEED]);

    // 3) 360 − 126 = 234° dans le sens direct, 234 / 18 = 13 min (le piège : 126 / 18 = 7)
    const turn = 360 - DOOR;
    expect(expectedOf('masala-3', 2)).toEqual([turn, turn / SPEED]);
    expect(Number.isInteger(turn / SPEED) && Number.isInteger(DOOR / SPEED)).toBe(true);
    const front = RT.rotateApprox(A, O, turn, 'direct');
    expect(near(RT.orientedAngle(O, front, E), 0, 0.05)).toBe(true); // l'avant est bien sur [OE)
    const wrong = RT.rotateApprox(A, O, DOOR, 'direct');
    expect(near(RT.orientedAngle(O, wrong, E), 0, 0.05)).toBe(false);
  });
});
