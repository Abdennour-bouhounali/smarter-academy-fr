import { describe, it, expect } from 'vitest';
import moduleEight from '../modules/Module08Itqan.jsx?raw';
import { PREP_ITEMS, LAB, KNOWLEDGE, METHOD_TILING } from './textbook';
import { EX, EXERCISES, FINAL, LP } from './exercises';
import { SHAPES, FIGURES, FINAL_FIGURES, PROBLEM_FIGURES, cellFigure } from './figures';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure.js';
import { LESSON_CONFIG } from '../lesson.config';

/* ── Géométrie de contrôle, ÉCRITE AUTREMENT que le code de la leçon : l'aire par comptage des cases et des moitiés, le périmètre par
 *    « différence symétrique des côtés » (un côté commun à deux cases disparaît ; ce qui reste est le bord). ───────────────────────── */
const HALF = new Set(['◤', '◥', '◣', '◢']);
const areaOf = (rows) => rows.reduce((s, row) => s + [...row].reduce((t, ch) => t + (ch === '#' ? 1 : HALF.has(ch) ? 0.5 : 0), 0), 0);
function perimeterOf(rows) {
  const edges = new Set();
  const toggle = (k) => (edges.has(k) ? edges.delete(k) : edges.add(k));
  rows.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch !== '#') return;
    toggle(`h${r},${c}`); toggle(`h${r + 1},${c}`); toggle(`v${r},${c}`); toggle(`v${r},${c + 1}`);
  }));
  return edges.size;
}
const dec = (n) => String(n).replace('.', ',');
const mathNum = (o) => Number(String(o).replace(/\$/g, '').replace(/\{,\}/g, '.'));
const key = (r) => r.options[r.correct];

/** Les polyominos à n cellules (4-connexes, SANS TROU) par croissance, le périmètre de chacun : pour vérifier les valeurs du labo. */
function polyominoes(max) {
  const norm = (cs) => { const mr = Math.min(...cs.map((c) => c[0])); const mc = Math.min(...cs.map((c) => c[1])); return cs.map(([r, c]) => [r - mr, c - mc]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); };
  const id = (cs) => cs.map((c) => c.join(',')).join(';');
  let level = new Map([['0,0', [[0, 0]]]]);
  const out = new Map([[1, [...level.values()]]]);
  for (let n = 2; n <= max; n += 1) {
    const next = new Map();
    for (const cs of level.values()) {
      const set = new Set(cs.map((c) => c.join(',')));
      for (const [r, c] of cs) for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const p = [r + dr, c + dc];
        if (set.has(p.join(','))) continue;
        const grown = norm([...cs, p]);
        next.set(id(grown), grown);
      }
    }
    level = next;
    out.set(n, [...level.values()]);
  }
  return out;
}
const hasHole = (cs) => {
  const rs = cs.map((c) => c[0]); const cc = cs.map((c) => c[1]);
  const [r0, r1, c0, c1] = [Math.min(...rs) - 1, Math.max(...rs) + 1, Math.min(...cc) - 1, Math.max(...cc) + 1];
  const set = new Set(cs.map((c) => c.join(',')));
  const seen = new Set(['' + r0 + ',' + c0]);
  const stack = [[r0, c0]];
  while (stack.length) {
    const [r, c] = stack.pop();
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const q = [r + dr, c + dc];
      if (q[0] < r0 || q[0] > r1 || q[1] < c0 || q[1] > c1 || set.has(q.join(',')) || seen.has(q.join(','))) continue;
      seen.add(q.join(',')); stack.push(q);
    }
  }
  return (r1 - r0 + 1) * (c1 - c0 + 1) - set.size !== seen.size;
};
const rowsOf = (cs) => { const R = Math.max(...cs.map((c) => c[0])) + 1; const C = Math.max(...cs.map((c) => c[1])) + 1; return Array.from({ length: R }, (_, r) => Array.from({ length: C }, (_, c) => (cs.some((p) => p[0] === r && p[1] === c) ? '#' : '.')).join('')); };

describe('« مساحة سطح مستو ومحيطه » — chaque clé recalculée à partir des cellules', () => {
  it('الكفاءات: trois, dans l\'ordre du catalogue, identifiants positionnels', () => {
    expect(LP).toEqual({ P1: '1am_masahat-muhit-sath_P1', P2: '1am_masahat-muhit-sath_P2', P3: '1am_masahat-muhit-sath_P3' });
    expect(LESSON_CONFIG.skills).toHaveLength(3);
  });

  it('أستعدّ : la vérité de chaque affirmation', () => {
    const truth = [
      true, // mesurer = compter les reports de l'unité
      3 + 5 === 15, // faux : 8
      true, // un polygone n'a que des côtés rectilignes
      4 === 5, // faux : un rectangle a quatre côtés
      true, // le mot « محيط »
      5 + 5 + 5 === 8, // faux : 15
    ];
    expect(PREP_ITEMS.map((it) => it.answer)).toEqual(truth);
    expect(new Set(PREP_ITEMS.map((it) => it.answer)).size).toBe(2);
    expect(PREP_ITEMS.every((it) => ['qiyas', 'mudalaa', 'adad'].includes(it.skill))).toBe(true);
  });

  it('les formes : aire et périmètre de chacune, indépendamment du code de la leçon', () => {
    const expected = {
      A: [10, 14], B: [10, 16], C: [12, 14], E: [10, 14],
      W: [9, 12], X: [9, 14], Y: [8, 12], Z: [9, 14], T: [11, 16], N1: [14, 16], N2: [14, 18],
      P1a: [9, 12], P1b: [8, 12], P2a: [10, 14], P2b: [10, 16], P3a: [7, 12], P3b: [7, 12], Q: [16, 18], PLAY: [12, 16], PLAY2: [12, 14],
      Ga: [8, 12], Gb: [8, 14], WALL: [21, 20],
    };
    for (const [id, [a, p]] of Object.entries(expected)) {
      expect([areaOf(SHAPES[id]), perimeterOf(SHAPES[id])], id).toEqual([a, p]);
    }
    // les formes à demi-carreaux : l'aire seule (le périmètre contient des diagonales)
    expect(areaOf(SHAPES.H1)).toBe(7);
    expect(areaOf(SHAPES.H2)).toBe(11.5);
    expect(areaOf(SHAPES.H3)).toBe(11);
    expect(areaOf(SHAPES.BED)).toBe(16);
    expect(areaOf(SHAPES.FS)).toBe(6.5);
    // les trois énoncés de معارف (A contre B, C, E)
    expect([areaOf(SHAPES.A) === areaOf(SHAPES.B), perimeterOf(SHAPES.A) === perimeterOf(SHAPES.B)]).toEqual([true, false]);
    expect([areaOf(SHAPES.A) === areaOf(SHAPES.C), perimeterOf(SHAPES.A) === perimeterOf(SHAPES.C)]).toEqual([false, true]);
    expect([areaOf(SHAPES.A) === areaOf(SHAPES.E), perimeterOf(SHAPES.A) === perimeterOf(SHAPES.E)]).toEqual([true, true]);
    // les formes distinctes sont de vraies formes différentes (E n'est pas un rectangle A)
    expect(SHAPES.E.join('')).not.toBe(SHAPES.A.join(''));
  });

  it('chaque forme est une surface sans trou, d\'un seul tenant, et chaque figure passe la validation GeoFigure', () => {
    const ids = Object.keys(SHAPES);
    for (const id of ids) {
      const cs = SHAPES[id].flatMap((row, r) => [...row].map((ch, c) => (ch === '#' ? [r, c] : null)).filter(Boolean));
      if (cs.length) expect(hasHole(cs), `${id} a un trou`).toBe(false);
      const fig = cellFigure(SHAPES[id]);
      expect(validateGeoFigure(fig), id).toEqual([]);
      expect(figureQuality(fig, { maxAspect: Infinity }), id).toEqual([]);
    }
    const all = [...Object.values(FIGURES).flat(), ...Object.values(FINAL_FIGURES).flat(), ...Object.values(PROBLEM_FIGURES)];
    for (const fig of all) {
      expect(validateGeoFigure(fig)).toEqual([]);
      expect(figureQuality(fig, { maxAspect: Infinity })).toEqual([]);
    }
  });

  it('les valeurs du labo : 12 dalles, périmètre minimum 14 (le seul 3 × 4), rouleau de 12 → 5 à 9 dalles', () => {
    expect(LAB.tiles).toBe(12);
    // le minimum pour n dalles est 2·⌈2√n⌉ : 14 pour n = 12, atteint par le rectangle 3 × 4 ; le maximum est 2n + 2 = 26
    expect(2 * Math.ceil(2 * Math.sqrt(12))).toBe(LAB.shortestFence);
    expect(perimeterOf(SHAPES.C)).toBe(LAB.shortestFence);
    expect(2 * 12 + 2).toBe(26);
    // le rouleau de 12 : exactement les aires 5 … 9 (énumération de tous les polyominos sans trou jusqu'à 10 dalles ; le cas des 12 dalles est dans le test du labo)
    const all = polyominoes(10);
    const reach = new Set();
    for (let n = 1; n <= 10; n += 1) for (const cs of all.get(n)) if (!hasHole(cs) && perimeterOf(rowsOf(cs)) === LAB.rope) reach.add(n);
    expect([...reach].sort((a, b) => a - b)).toEqual(LAB.ropeAreas);
  });

  it('act-1 : chaque ligne a pour clé l\'aire ou le périmètre de la forme, et chaque distracteur est faux', () => {
    const ids = ['W', 'X', 'Y', 'Z'];
    const rows = EX['act-1'].question.rows;
    expect(rows).toHaveLength(8);
    ids.forEach((id, i) => {
      expect(mathNum(key(rows[2 * i])), `aire ${id}`).toBe(areaOf(SHAPES[id]));
      expect(mathNum(key(rows[2 * i + 1])), `périmètre ${id}`).toBe(perimeterOf(SHAPES[id]));
      rows[2 * i].options.filter((o) => o !== key(rows[2 * i])).forEach((o) => expect(mathNum(o)).not.toBe(areaOf(SHAPES[id])));
      rows[2 * i + 1].options.filter((o) => o !== key(rows[2 * i + 1])).forEach((o) => expect(mathNum(o)).not.toBe(perimeterOf(SHAPES[id])));
    });
  });

  it('act-1-compare : le verdict de chaque couple', () => {
    const pairs = [['W', 'X'], ['W', 'Y'], ['X', 'Z'], ['Y', 'Z']];
    const rows = EX['act-1-compare'].question.rows;
    pairs.forEach(([a, b], i) => {
      const sa = areaOf(SHAPES[a]) === areaOf(SHAPES[b]); const sp = perimeterOf(SHAPES[a]) === perimeterOf(SHAPES[b]);
      const text = sa && sp ? 'نفس المساحة ونفس المحيط' : sa ? 'نفس المساحة فقط' : sp ? 'نفس المحيط فقط' : 'لا نفس المساحة ولا نفس المحيط';
      expect(key(rows[i])).toBe(text);
    });
    expect(rows.map((r) => r.correct)).toEqual([0, 1, 2, 3]);
  });

  it('ex-1 : le fil vaut le périmètre, et ni l\'aire ni un autre nombre', () => {
    const q = EX['ex-1'].question;
    expect(mathNum(key(q))).toBe(perimeterOf(SHAPES.T));
    expect(q.options.map(mathNum)).toContain(areaOf(SHAPES.T));
    q.options.filter((o) => o !== key(q)).forEach((o) => expect(mathNum(o)).not.toBe(perimeterOf(SHAPES.T)));
  });

  it('ex-2 : même aire, le périmètre de (b) dépasse celui de (a) de deux', () => {
    const [r1, r2, r3] = EX['ex-2'].question.rows;
    expect(areaOf(SHAPES.N1)).toBe(areaOf(SHAPES.N2));
    expect(key(r1)).toBe('متساويتان');
    expect(perimeterOf(SHAPES.N2)).toBeGreaterThan(perimeterOf(SHAPES.N1));
    expect(key(r2)).toBe('(ب)');
    expect(mathNum(key(r3))).toBe(perimeterOf(SHAPES.N2) - perimeterOf(SHAPES.N1));
    // retirer la bonne case d'un 3 × 5 : coin → même périmètre que le rectangle (16) ; milieu → 18
    expect(perimeterOf(['#####', '#####', '#####'])).toBe(16);
  });

  it('ex-3 : les aires avec demi-carreaux, et la plus grande', () => {
    const rows = EX['ex-3'].question.rows;
    const areas = ['H1', 'H2', 'H3'].map((id) => areaOf(SHAPES[id]));
    areas.forEach((a, i) => expect(mathNum(key(rows[i])), `H${i + 1}`).toBe(a));
    expect(key(rows[3])).toBe(['①', '②', '③'][areas.indexOf(Math.max(...areas))]);
    rows.slice(0, 3).forEach((r, i) => r.options.filter((o) => o !== key(r)).forEach((o) => expect(mathNum(o)).not.toBe(areas[i])));
  });

  it('ex-4 (5, 6) : un seul des trois couples a la propriété demandée', () => {
    const pairs = [['P1a', 'P1b'], ['P2a', 'P2b'], ['P3a', 'P3b']];
    const props = [
      (a, b) => perimeterOf(SHAPES[a]) === perimeterOf(SHAPES[b]) && areaOf(SHAPES[a]) !== areaOf(SHAPES[b]),
      (a, b) => areaOf(SHAPES[a]) === areaOf(SHAPES[b]) && perimeterOf(SHAPES[a]) !== perimeterOf(SHAPES[b]),
      (a, b) => areaOf(SHAPES[a]) === areaOf(SHAPES[b]) && perimeterOf(SHAPES[a]) === perimeterOf(SHAPES[b]),
    ];
    const names = ['(أ) و (ب)', '(ج) و (د)', '(هـ) و (و)'];
    props.forEach((prop, k) => {
      const holding = pairs.map(([a, b], i) => (prop(a, b) ? names[i] : null)).filter(Boolean);
      expect(holding).toHaveLength(1);
      expect(key(EX['ex-4'].question.rows[k])).toBe(holding[0]);
    });
    // les deux figures du dernier couple sont deux formes DIFFÉRENTES (non superposables)
    expect(SHAPES.P3a.join('|')).not.toBe(SHAPES.P3b.join('|'));
    expect(SHAPES.P3a.join('|')).not.toBe([...SHAPES.P3b].reverse().join('|'));
  });

  it('self-2 : 2 × 8 et 4 × 4 couvrent 16 mais n\'ont pas le périmètre 18 du polygone', () => {
    const [rect, square, same] = EX['self-2'].question.rows;
    expect(areaOf(SHAPES.Q)).toBe(16);
    expect(key(rect)).toBe('$2\\times8$'); expect(2 * 8).toBe(16);
    expect(key(square)).toBe('$4\\times4$'); expect(4 * 4).toBe(16);
    rect.options.filter((o) => o !== key(rect)).forEach((o) => { const [a, b] = o.replace(/\$/g, '').split('\\times').map(Number); expect(a * b).not.toBe(16); });
    square.options.filter((o) => o !== key(square)).forEach((o) => { const [a, b] = o.replace(/\$/g, '').split('\\times').map(Number); expect(a * b).not.toBe(16); });
    const pPoly = perimeterOf(SHAPES.Q);
    expect(2 * (2 + 8)).not.toBe(pPoly); expect(4 * 4).not.toBe(pPoly);
    expect(key(same)).toBe('لا، محيط كلٍّ منهما يخالف محيط السطح');
    // aucune paire de côtés entiers (a, b) avec a × b = 16 et 2(a + b) = 18
    for (let a = 1; a <= 16; a += 1) expect(16 % a === 0 && 2 * (a + 16 / a) === pPoly).toBe(false);
  });

  it('chaque exercice porte une source, un unique LP du درس, une figure quand il en faut une', () => {
    for (const ex of EXERCISES) {
      expect(Object.values(LP)).toContain(ex.learningPointId);
      expect(ex.source?.type).toBe('textbook');
      expect(ex.source.number).toBeUndefined();
    }
    for (const id of ['act-1', 'act-1-compare', 'ex-1', 'ex-2', 'ex-3', 'ex-4', 'self-2']) expect(FIGURES[id]?.length, id).toBeGreaterThan(0);
    // toutes les clés de lot ont une bonne réponse dans l'intervalle
    for (const ex of EXERCISES.filter((e) => e.interaction === 'batch')) ex.question.rows.forEach((r) => { expect(r.correct).toBeGreaterThanOrEqual(0); expect(r.correct).toBeLessThan(r.options.length); });
  });

  it('la méthode : 9 + 6 ÷ 2 = 12 ; l\'unité double : 21 ÷ 2 = 10,5 ; 18 ÷ 2 = 9', () => {
    expect(9 + 6 / 2).toBe(12);
    expect(METHOD_TILING.solution.join(' ')).toContain('$9+3=12$');
    expect(21 / 2).toBe(10.5);
    expect(LAB.floor.twos).toBe(dec(21 / 2));
    expect(14 + 4 / 2).toBe(16); expect(Number(LAB.floor.halvesArea)).toBe(LAB.floor.wholes + LAB.floor.halves / 2);
    expect(18 / 2).toBe(9);
    // la phrase des connaissances : 6 entières et 4 moitiés font 8
    expect(KNOWLEDGE.halves.text).toContain('ثماني');
    expect(6 + 4 / 2).toBe(8);
  });

  describe('إختبار أولي — les cinq épreuves', () => {
    it('chaque option du module 8 vient des données, et chaque clé est la bonne', () => {
      for (const e of FINAL) {
        e.options.forEach((o) => expect(moduleEight, `${e.id}: ${o}`).toContain(o));
        expect(moduleEight).toContain(LP[`P${['E1'].includes(e.id) ? 1 : ['E2', 'E3'].includes(e.id) ? 2 : 3}`]);
        expect(new Set(e.options).size).toBe(e.options.length);
        expect(Object.values(LP)).toContain(e.lp);
      }
      expect(FINAL.map((e) => e.lp)).toEqual([LP.P1, LP.P2, LP.P2, LP.P3, LP.P3]);
    });

    it('E1 — seule la première question parle du bord (le ruban autour)', () => {
      const e = FINAL[0];
      expect(e.options.filter((o) => /يلزم لإحاطة/.test(o))).toHaveLength(1);
      expect(e.options[e.correct]).toMatch(/لإحاطة/);
    });

    it('E2 — 2 + 4 carreaux entiers et une moitié = 6,5 ; E3 — 18 ÷ 2 = 9', () => {
      const e2 = FINAL[1];
      expect(areaOf(SHAPES.FS)).toBe(6.5);
      expect(mathNum(e2.options[e2.correct])).toBe(6.5);
      e2.options.filter((o, j) => j !== e2.correct).forEach((o) => expect(mathNum(o)).not.toBe(6.5));
      const e3 = FINAL[2];
      expect(mathNum(e3.options[e3.correct])).toBe(18 / 2);
      e3.options.filter((o, j) => j !== e3.correct).forEach((o) => expect(mathNum(o)).not.toBe(9));
    });

    it('E4 — Ga et Gb : même aire, périmètres 12 et 14 ; une seule option le dit', () => {
      const e = FINAL[3];
      expect([areaOf(SHAPES.Ga), areaOf(SHAPES.Gb)]).toEqual([8, 8]);
      expect([perimeterOf(SHAPES.Ga), perimeterOf(SHAPES.Gb)]).toEqual([12, 14]);
      expect(e.options[e.correct]).toBe('المساحتان متساويتان والمحيطان مختلفان');
      expect(new Set(e.options).size).toBe(4);
    });

    it('E5 — les quatre affirmations : une seule est vraie', () => {
      const e = FINAL[4];
      const square = ['###', '###', '###'];
      const rect = ['####', '####'];
      const row9 = ['#########'];
      expect(areaOf(square)).toBe(9); expect(perimeterOf(square)).toBe(12);
      expect(areaOf(rect)).toBe(8); expect(perimeterOf(rect)).toBe(12);
      // « un autre cour à 12 éléments de clôture avec 8 dalles » : vrai
      expect(perimeterOf(rect) === 12 && areaOf(rect) === 8).toBe(true);
      // « tout cour à clôture 12 a 9 dalles » : faux (le rectangle a 8)
      expect(areaOf(rect) === 9).toBe(false);
      // « tout cour de 9 dalles a une clôture de 12 » : faux (neuf dalles en rangée : 20)
      expect(perimeterOf(row9)).toBe(20);
      // « deux cours ne peuvent pas avoir le même périmètre et des aires différentes » : faux (carré 9 et rectangle 8)
      expect(perimeterOf(square) === perimeterOf(rect) && areaOf(square) !== areaOf(rect)).toBe(true);
      expect(e.correct).toBe(0);
    });
  });
});
