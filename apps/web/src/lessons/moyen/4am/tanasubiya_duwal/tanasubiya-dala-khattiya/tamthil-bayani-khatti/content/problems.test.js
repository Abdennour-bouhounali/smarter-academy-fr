import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const stepsOf = (id, part) => PROBLEM[id].parts[part].steps;
const expectedOf = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choicesOf = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'choice');
const correctOf = (id, part, k) => { const s = choicesOf(id, part)[k]; return s.options[s.correct]; };
const near = (x, y) => Math.abs(x - y) < 1e-9;

// ── Une droite du graphe : f(x) = a·x, telle que dessinée (visual.functions) ──
const lineOf = (id, fid) => PROBLEM[id].visual.functions.find((f) => f.id === fid);
const image = (id, fid, x) => lineOf(id, fid).a * x;
const antecedent = (id, fid, y) => y / lineOf(id, fid).a;
/** Une lecture graphique est EXACTE : le point (x ; y) est dans la fenêtre ET sur un nœud de la grille. */
function onGridNode(id, x, y) {
  const { range, xStep, yStep } = PROBLEM[id].visual;
  expect(x >= range.xMin && x <= range.xMax && y >= range.yMin && y <= range.yMax, `${id} (${x} ; ${y}) in window`).toBe(true);
  expect(near(Math.round(x / xStep) * xStep, x), `${id} x = ${x} on a grid line`).toBe(true);
  expect(near(Math.round(y / yStep) * yStep, y), `${id} y = ${y} on a grid line`).toBe(true);
}
const outOfWindow = (id, x, y) => {
  const { range } = PROBLEM[id].visual;
  return x < range.xMin || x > range.xMax || y < range.yMin || y > range.yMax;
};

// ── Vérificateur des RELATIONS écrites (explain, prompt, solution lines, bonne option) ──
// Chaque formule $…$ est découpée sur = < > \neq ; chaque membre purement numérique (entiers,
// décimaux « 0{,}25 », ×, ÷, +, −, parenthèses, \dfrac{n}{m}) est évalué, et chaque relation entre
// deux membres numériques VOISINS est vérifiée. Les membres contenant une lettre sont ignorés.
const EPS = 1e-9;
function evalExpr(src) {
  const s = src
    .replace(/\{,\}/g, '.')
    .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\s+/g, '');
  if (!/^[\d.+\-*/()]+$/.test(s) || !/\d/.test(s)) return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '(') { i++; const v = sum(); if (s[i] !== ')') throw new Error(`bad parens in ${src}`); i++; return v; }
    if (s[i] === '-') { i++; return -atom(); }
    const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
    if (i === j) throw new Error(`bad number in ${src}`);
    return Number(s.slice(j, i));
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = atom(); v = op === '*' ? v * w : v / w; } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? v + w : v - w; } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of text.matchAll(/\$([^$]+)\$/g)) {
    const parts = f.split(/(=|<|>|\\neq)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1]), parts[k], evalExpr(parts[k + 1])];
      if (x == null || y == null) continue;
      const ok = { '=': Math.abs(x - y) < EPS * Math.max(1, Math.abs(x)), '<': x < y - EPS, '>': x > y + EPS, '\\neq': Math.abs(x - y) > EPS }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}
/** Le coefficient a d'une écriture « y = ax », « f(x) = ax » (a décimal, fraction ou entier). */
const coefOf = (tex) => {
  const m = tex.replace(/\$/g, '').match(/=\s*(.*)x$/);
  if (!m) return null;
  return m[1] === '' ? 1 : m[1] === '-' ? -1 : evalExpr(m[1]);
};

describe('les مسائل du درس 3 (unité 6) « التمثيل البياني لدالة خطية وقراءته »', () => {
  it('respect the GuidedProblem contract (incl. the graph in `visual`)', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    for (const p of PROBLEMS) {
      expect(p.visual?.functions?.length, p.id).toBeGreaterThan(0);
      for (const f of p.visual.functions) expect(f.b, `${p.id} ${f.id} passes through O`).toBe(0);
    }
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
    expect(PROBLEMS.map((p) => p.id)).toEqual(['masala-1', 'masala-2', 'masala-3']);
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

  it('no bare letter, « DA » or a/b in the Arabic text — every formula is a $…$ island; money in دج', () => {
    const texts = (p) => [p.statement, ...p.data.map((d) => d.text), ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
    for (const p of PROBLEMS) for (const t of texts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/\\|\^|\d\s*\/\s*\d|\b[xyafgdDO]\b|\bDA\b|نقاط التعلّم|√/);
    }
  });

  it('every written relation (explain, prompt, solution lines, correct options) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part) => part.steps.forEach((s, si) => {
      const where = `${p.id} ${part.label} step ${si + 1}`;
      for (const t of [s.explain, s.prompt, ...(s.lines ?? [])].filter(Boolean)) checked += checkText(t, where);
      if (s.kind === 'choice') checked += checkText(s.options[s.correct], `${where} (correct option)`);
    }));
    expect(checked).toBeGreaterThan(35);
  });

  it('the relation checker fails on a mutated number (self-test)', () => {
    expect(() => checkText('$f(1000) = 0{,}5 \\times 1000 = 400$', 'mutant')).toThrow();
    expect(() => checkText('$a = \\dfrac{50}{-200} = 0{,}25$', 'mutant')).toThrow();
    expect(() => checkText('$45 > 50$', 'mutant')).toThrow();
    expect(checkText('$g(-800) = -0{,}25 \\times (-800) = 200$ و $\\dfrac{45}{0{,}3} = 150$ و $60 < 70$', 'ok')).toBe(3);
  });

  it('مسألة 1 — readings on grid nodes, coefficients and heights computed, not typed', () => {
    const id = 'masala-1';
    // 1) f(300) lue sur un nœud ; a = f(300) / 300 ; l'équation choisie a ce coefficient et c'est la droite dessinée.
    const f300 = image(id, 'd1', 300);
    onGridNode(id, 300, f300);
    const aF = f300 / 300;
    expect(expectedOf(id, 0)).toEqual([f300, aF]);
    expect(coefOf(correctOf(id, 0, 1))).toBe(aF);
    expect(aF).toBe(lineOf(id, 'd1').a);
    // 2) (D2) descend : a < 0 ; l'antécédent de 50 est négatif (à l'ouest) ; a = 50 / x.
    const x50 = antecedent(id, 'd2', 50);
    onGridNode(id, x50, 50);
    expect(x50).toBeLessThan(0);
    const aG = 50 / x50;
    expect(aG).toBeLessThan(0);
    expect(expectedOf(id, 1)).toEqual([x50, aG]);
    expect(coefOf(correctOf(id, 1, 2))).toBe(aG);
    expect(aG).toBe(lineOf(id, 'd2').a);
    expect(choicesOf(id, 1)[0].options[choicesOf(id, 1)[0].correct]).toMatch(/^سالبة/);
    // 3) les stations : hors de la fenêtre, calculées par l'équation ; 380 m au-dessus de la mer pour O.
    const sea = 380, east = 1000, west = -800;
    const hE = aF * east, hW = aG * west;
    expect(outOfWindow(id, east, hE) && outOfWindow(id, west, hW)).toBe(true);
    expect(hW).toBeGreaterThan(0); // le piège du signe : la station ouest est AU-DESSUS de O
    expect(expectedOf(id, 2)).toEqual([hE, sea + hE, hW, sea + hW, (sea + hE) - (sea + hW)]);
    for (const n of [sea, east, -west]) expect(PROBLEM[id].statement).toContain(String(n));
  });

  it('مسألة 2 — readings on grid nodes, the rate and the amounts computed, not typed', () => {
    const id = 'masala-2';
    const f40 = image(id, 'd', 40);
    onGridNode(id, 40, f40);
    const rate = f40 / 40;
    expect(rate).toBe(lineOf(id, 'd').a);
    expect(expectedOf(id, 0)).toEqual([f40, rate]);
    expect(coefOf(correctOf(id, 0, 1).replace('f(x)', 'y'))).toBe(rate);
    // 2) 9000 دج → x euros, lu sur un nœud ; il manque fee − x euros
    const sara = 9000, fee = 70, karim = 360;
    const euros = antecedent(id, 'd', sara);
    onGridNode(id, euros, sara);
    expect(expectedOf(id, 1)).toEqual([euros]);
    expect(euros).toBeLessThan(fee); // le cas qui ÉCHOUE
    expect(correctOf(id, 1, 1)).toContain(`${fee - euros} أورو`);
    // 3) 360 € hors fenêtre ; ce qui manque à Sara, en دج ; ce qui reste à Karim
    expect(outOfWindow(id, karim, rate * karim)).toBe(true);
    const missing = rate * (fee - euros);
    expect(missing).toBe(rate * fee - sara);
    expect(expectedOf(id, 2)).toEqual([rate * karim, missing, rate * karim - missing]);
    for (const n of [sara, fee, karim]) expect(PROBLEM[id].statement).toContain(String(n));
  });

  it('مسألة 3 — readings on grid nodes, the speed, the race time and the arrival computed, not typed', () => {
    const id = 'masala-3';
    const d20 = image(id, 'd', 20);
    onGridNode(id, 20, d20);
    expect(expectedOf(id, 0)).toEqual([d20, 60 / 20, d20 * (60 / 20)]);
    // 2) l'antécédent de 13,5 lu sur un nœud ; il RÉUSSIT (< 50)
    const t = antecedent(id, 'd', 13.5);
    onGridNode(id, t, 13.5);
    expect(near(t, 45)).toBe(true);
    expect(expectedOf(id, 1)).toEqual([45]);
    expect(t).toBeLessThan(50);
    // 3) a = d(20) / 20 ; 0,3x = 45 ; départ 8:00 + 150 min
    const a = d20 / 20;
    expect(near(a, lineOf(id, 'd').a)).toBe(true);
    expect(near(coefOf(correctOf(id, 2, 0).replace('d(x)', 'y')), a)).toBe(true);
    const race = 45, minutes = race / a;
    expect(near(minutes, 150)).toBe(true);
    expect(outOfWindow(id, minutes, race)).toBe(true);
    const ex = expectedOf(id, 2);
    expect(near(ex[0], a)).toBe(true);
    expect(ex.slice(1)).toEqual([150]);
    const arrival = 8 * 60 + 150;
    expect(correctOf(id, 2, 2)).toBe(`${Math.floor(arrival / 60)}:${String(arrival % 60).padStart(2, '0')}`);
    expect(PROBLEM[id].statement).toContain(`${race} km`);
  });
});
