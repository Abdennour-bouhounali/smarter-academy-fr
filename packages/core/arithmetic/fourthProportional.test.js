import { describe, it, expect } from 'vitest';
import * as F from './fourthProportional.js';
import { fourthProportional as legacy } from './proportional.js';
import { frac, mul, div, add, sub, eq } from './linear.js';

const GRID = ['0,5', '1', '2', '2,5', '3', '4', '6', '7,5', '8', '12', '25', '320', '625'];
const HOLES = ['a', 'b', 'c', 'd'];
const nums = (hole, a, b, c, d) => Object.fromEntries(Object.entries({ a, b, c, d }).filter(([k]) => k !== hole));

describe('fourthProportional — le quatrième proportionnel exact', () => {
  it('parse : virgule, point, chiffres arabes-indiens, ≤ 2 décimales, jamais de signe ni de 3e décimale', () => {
    expect(F.parse('2,5')).toEqual(frac(5, 2));
    expect(F.parse('٣٫٥')).toEqual(frac(7, 2));
    expect(F.parse('2.25')).toEqual(frac(9, 4));
    expect(F.parse(4)).toEqual(frac(4));
    for (const bad of ['', 'a', '1,234', '-1', '1,', ',5', '1e3']) expect(() => F.parse(bad), bad).toThrow();
    expect(F.toHundredths('2,5')).toBe(250);
    expect(F.fromHundredths(250)).toEqual(frac(5, 2));
  });

  it('decimalText / showValue : le décimal fini à la virgule, sinon la fraction réduite', () => {
    expect(F.decimalText(frac(9, 2))).toBe('4,5');
    expect(F.decimalText(frac(520))).toBe('520');
    expect(F.decimalText(frac(1, 8))).toBeNull();
    expect(F.decimalText(frac(1, 8), 3)).toBe('0,125');
    expect(F.decimalText(frac(1, 3))).toBeNull();
    expect(F.decimalText(frac(7, 100))).toBe('0,07');
    expect(F.showValue(frac(350, 3))).toBe('350/3');
    expect(F.showValue(frac(1, 8))).toBe('0,125');
    expect(F.showValue(frac(130))).toBe('130');
  });

  it('solve : le trou d est celui de proportional.js ; les quatre trous se retrouvent entre eux sur toute la grille', () => {
    let n = 0;
    for (const a of GRID) for (const b of GRID) for (const c of GRID) {
      const d = F.solve('d', { a, b, c });
      expect(eq(d, legacy(F.parse(a), F.parse(b), F.parse(c)))).toBe(true);
      // le tableau complet : chaque autre trou redonne la case correspondante
      const full = { a, b, c, d: F.showValue(d) };
      if (F.decimalText(d, 2) == null) continue;
      for (const hole of ['a', 'b', 'c']) {
        const sol = F.solve(hole, nums(hole, full.a, full.b, full.c, full.d));
        expect(eq(sol, F.parse(full[hole])), `${hole} ${JSON.stringify(full)}`).toBe(true);
        n += 1;
      }
    }
    expect(n).toBeGreaterThan(1500);
    expect(() => F.solve('d', { a: '0', b: '1', c: '1' })).toThrow();
    expect(() => F.solve('d', { a: '1', b: '1' })).toThrow();
    expect(() => F.solve('x', {})).toThrow();
  });

  it('les presets de la leçon : les réponses fixées par le contrat', () => {
    expect(F.solveText('d', { a: '4', b: '520', c: '6' })).toBe('780');
    expect(F.solveText('c', { a: '3', b: '840', d: '1400' })).toBe('5');
    expect(F.solveText('d', { a: '8', b: '400', c: '12' })).toBe('600');
    expect(F.solveText('d', { a: '2,5', b: '325', c: '4' })).toBe('520');
    expect(F.solveText('b', { a: '6', c: '9', d: '2700' })).toBe('1800');
    expect(F.solveText('a', { b: '720', c: '7,5', d: '1800' })).toBe('3');
    expect(F.solveText('d', { a: '12', b: '3', c: '18' })).toBe('4,5');
    expect(F.solveText('d', { a: '3', b: '10', c: '1' })).toBe('10/3');
  });

  it('les balances : états eq | lt | gt | off ; les trois vraies balances penchent TOUJOURS du même côté, quel que soit le trou', () => {
    let checked = 0;
    for (const hole of HOLES) {
      for (const a of ['2', '3', '4', '6']) for (const b of ['3', '5', '12']) for (const c of ['2', '5', '9']) {
        const d = '7';
        const t = { a, b, c, d };
        const ans = F.solve(hole, nums(hole, a, b, c, d));
        for (let hund = 0; hund <= 6000; hund += 25) {
          const h = F.fromHundredths(hund);
          const g = F.gauges(hole, nums(hole, a, b, c, d), h);
          const states = [g.unit.state, g.between.state, g.cross.state].filter((s) => s !== 'off');
          expect(new Set(states).size, `${hole} ${JSON.stringify(t)} h=${hund}`).toBeLessThanOrEqual(1);
          // l'égalité est celle de la solution EXACTE
          expect(g.cross.state === 'eq').toBe(eq(h, ans));
          expect(F.allBalanced(g)).toBe(eq(h, ans));
          checked += 1;
        }
        // à la solution, et seulement là, les trois sont équilibrées (centièmes voisins)
        const g = F.gauges(hole, nums(hole, a, b, c, d), ans);
        expect(F.allBalanced(g)).toBe(true);
        expect(g.diff).toBeNull();
      }
    }
    expect(checked).toBeGreaterThan(20000);
  });

  it('les formules fixes : côté gauche / droit, valeurs exactes', () => {
    const g = F.gauges('d', { a: '5', b: '625', c: '6' }, F.parse('700'));
    expect(g.unit.left).toMatchObject({ op: '÷', value: frac(125) });
    expect(g.unit.right.value).toEqual(frac(350, 3));
    expect(F.showValue(g.unit.right.value)).toBe('350/3');
    expect(g.unit.state).toBe('gt');
    expect(g.between.left.value).toEqual(frac(6, 5));
    expect(g.between.right.value).toEqual(frac(28, 25));
    expect(g.between.state).toBe('gt');
    expect(g.cross.left.value).toEqual(frac(3750));
    expect(g.cross.right.value).toEqual(frac(3500));
    expect(g.cross.state).toBe('gt');
  });

  it('sideText : le décimal fini, sinon la fraction des opérandes (jamais d’arrondi, jamais ≈)', () => {
    const g = F.gauges('d', { a: '5', b: '625', c: '6' }, F.parse('700'));
    expect(F.sideText(g.unit.left)).toBe('125');
    expect(F.sideText(g.unit.right)).toBe('700/6');
    expect(F.sideText(g.cross.left)).toBe('3750');
    expect(F.sideText(F.gauges('c', { a: '3', b: '840', d: '1400' }, frac(0)).unit.left)).toBeNull();
    expect(F.sideText(F.gauges('d', { a: '8', b: '1', c: '1' }, F.parse('1')).unit.left)).toBe('0,125');
  });

  it('division par zéro : la balance est off, jamais une exception', () => {
    const g = F.gauges('c', { a: '3', b: '840', d: '1400' }, frac(0));
    expect(g.unit.state).toBe('off');
    expect(g.unit.left.value).toBeNull();
    expect(g.between.state).toBe('lt'); // c ÷ a = 0 contre d ÷ b
    expect(g.cross.state).toBe('lt');
    const g2 = F.gauges('a', { b: '720', c: '7,5', d: '1800' }, frac(0));
    expect(g2.unit.state).toBe('off');
    expect(g2.between.state).toBe('off');
    expect(g2.cross.state).toBe('gt');
  });

  it('le leurre « الفرق » : n’existe qu’avec decoy, s’équilibre au MAUVAIS nombre (404), jamais avec les trois autres', () => {
    const nums8 = { a: '8', b: '400', c: '12' };
    expect(F.gauges('d', nums8, frac(600)).diff).toBeNull();
    const at = (v) => F.gauges('d', nums8, frac(v), { decoy: true });
    expect(F.decoyValue('d', nums8)).toEqual(frac(404));
    expect(at(404).diff.state).toBe('eq');
    expect(F.allBalanced(at(404))).toBe(false);
    expect(at(600).diff.state).toBe('lt'); // 4 contre 200 : elle a déjà basculé quand les trois autres sont encore à gauche
    expect(F.allBalanced(at(600))).toBe(true);
    expect(at(300).diff.state).toBe('off'); // d − b ≤ 0 : sans sens
    expect(at(404).diff.left.value).toEqual(frac(4));
    expect(at(404).diff.right.value).toEqual(frac(4));
    // juste sous le leurre elle penche, comme les autres, du même côté ; au-delà elle ment : elle bascule seule
    for (const v of [401, 402, 403]) expect(at(v).diff.state).toBe(at(v).cross.state);
    for (const v of [405, 450, 500, 590]) { expect(at(v).diff.state).toBe('lt'); expect(at(v).cross.state).toBe('gt'); }
    // sur toute une grille : le leurre existe presque toujours (d > b)
    let n = 0;
    for (const a of GRID) for (const b of GRID) for (const c of GRID) if (F.decoyValue('d', { a, b, c })) n += 1;
    expect(n).toBeGreaterThan(300);
    expect(eq(F.decoyValue('d', nums8), F.solve('d', nums8))).toBe(false);
  });

  it('routes : une colonne complète, un connu en face du trou ; chaque chemin propre redonne EXACTEMENT la réponse', () => {
    let clean = 0; let missing = 0;
    for (const hole of HOLES) {
      for (const a of GRID) for (const b of GRID) for (const c of GRID) {
        const d = '10';
        const nm = nums(hole, a, b, c, d);
        const r = F.routes(hole, nm);
        const ans = F.solve(hole, nm);
        expect(eq(r.answer, ans)).toBe(true);
        expect(Object.keys(r.routes)).toEqual(F.ROUTES);
        for (const id of F.ROUTES) {
          const route = r.routes[id];
          if (!route.clean) { missing += 1; continue; }
          clean += 1;
          // on refait le calcul écrit, ligne par ligne, avec les textes affichés
          let last;
          for (const s of route.steps) {
            const x = F.parse(s.x); const y = F.parse(s.y); const res = F.parse(s.r);
            const calc = s.op === '÷' ? div(x, y) : s.op === '×' ? mul(x, y) : s.op === '+' ? add(x, y) : sub(x, y);
            expect(eq(calc, res), `${hole} ${id} ${JSON.stringify(s)}`).toBe(true);
            last = res;
          }
          expect(eq(last, ans), `${hole} ${id} ${JSON.stringify(nm)}`).toBe(true);
        }
      }
    }
    expect(clean).toBeGreaterThan(2000);
    expect(missing).toBeGreaterThan(200);
  });

  it('routes : l’exemple de l’orange (625, 5, 6) et les nombres de l’élève des deux niveaux', () => {
    const r = F.routes('d', { a: '5', b: '625', c: '6' });
    expect(r.answerText).toBe('750');
    expect(r.routes.coefficient.steps).toEqual([
      { op: '÷', x: '625', y: '5', r: '125', clean: true },
      { op: '×', x: '6', y: '125', r: '750', clean: true },
    ]);
    expect(r.routes.unit.steps[0]).toMatchObject({ op: '÷', x: '625', y: '5', r: '125' });
    expect(r.routes.additive.steps).toEqual([
      { op: '−', x: '6', y: '5', r: '1', clean: true },
      { op: '×', x: '125', y: '1', r: '125', clean: true },
      { op: '+', x: '625', y: '125', r: '750', clean: true },
    ]);
    expect(r.routes.multiplicative.steps[0]).toMatchObject({ op: '÷', x: '6', y: '5', r: '1,2' });
    expect(r.routes.multiplicative.steps[1]).toMatchObject({ op: '×', x: '625', y: '1,2', r: '750' });
    expect(r.routes.cross.steps).toEqual([
      { op: '×', x: '625', y: '6', r: '3750', clean: true },
      { op: '÷', x: '3750', y: '5', r: '750', clean: true },
    ]);
    expect(Object.values(r.routes).every((x) => x.clean)).toBe(true);
    // niveau متقدم, tâche 3 : le trou a — l'unité n'est pas propre (7,5 ÷ 1800), la multiplicative et la croisée le sont
    const adv = F.routes('a', { b: '720', c: '7,5', d: '1800' });
    expect(adv.answerText).toBe('3');
    expect(adv.routes.unit.clean).toBe(false);
    expect(adv.routes.coefficient.clean).toBe(false);
    expect(adv.routes.additive.clean).toBe(false);
    expect(adv.routes.multiplicative.clean).toBe(true);
    expect(adv.routes.cross.clean).toBe(true);
    // niveau متقدم, tâche 4 et مبتدئ, tâche 3 : les cinq chemins sont propres
    expect(Object.values(F.routes('d', { a: '12', b: '3', c: '18' }).routes).every((x) => x.clean)).toBe(true);
    expect(Object.values(F.routes('d', { a: '8', b: '400', c: '12' }).routes).every((x) => x.clean)).toBe(true);
    // une quantité plus petite : l'additive soustrait
    const sub1 = F.routes('d', { a: '6', b: '750', c: '5' });
    expect(sub1.routes.additive.steps[2]).toMatchObject({ op: '−', x: '750', y: '125', r: '625' });
    // pas de réponse décimale : aucun chemin n'est propre
    const third = F.routes('d', { a: '3', b: '10', c: '1' });
    expect(third.answerText).toBe('10/3');
    expect(Object.values(third.routes).some((x) => x.clean)).toBe(false);
  });

  it('freeAnswer : exact (pas et borne), inexact (10/3 ; 0,125), trop grand', () => {
    const e = F.freeAnswer('5', '625', '6');
    expect(e).toMatchObject({ kind: 'exact', text: '750', step: 100, max: 225000 });
    expect(F.freeAnswer('4', '3', '6')).toMatchObject({ kind: 'exact', text: '4,5', step: 10, max: 1400 });
    expect(F.freeAnswer('4', '1', '1')).toMatchObject({ kind: 'exact', text: '0,25', step: 1 });
    const third = F.freeAnswer('3', '10', '1');
    expect(third).toMatchObject({ kind: 'inexact', text: '10/3', finite: false, step: 1 });
    expect(F.freeAnswer('8', '1', '1')).toMatchObject({ kind: 'inexact', text: '0,125', finite: true });
    expect(F.freeAnswer('0,01', '9999', '9999')).toEqual({ kind: 'range' });
    expect(F.freeAnswer('٥', '٦٢٥', '٦').text).toBe('750');
    // la règle atteint toujours la réponse exacte : max est un multiple du pas et dépasse la réponse
    for (const [a, b, c] of [['5', '625', '6'], ['4', '3', '6'], ['8', '7', '2'], ['2,5', '325', '4']]) {
      const r = F.freeAnswer(a, b, c);
      if (r.kind !== 'exact') continue;
      expect(r.max % r.step).toBe(0);
      expect(r.max).toBeGreaterThan((r.h.n * 100) / r.h.d);
      expect(((r.h.n * 100) / r.h.d) % r.step).toBe(0);
    }
  });

  it('parseFree : décimaux positifs ≤ 9999, ≤ 2 décimales, chiffres arabes-indiens', () => {
    expect(F.parseFree('2,5')).toBe('2,5');
    expect(F.parseFree('٤٫٢٥')).toBe('4,25');
    expect(F.parseFree('9999')).toBe('9999');
    for (const bad of ['', '0', '0,00', '-3', '10000', '1,234', 'x', '3,']) expect(F.parseFree(bad), bad).toBeNull();
  });

  it('table / frame : le tableau complet et la lecture par colonnes', () => {
    expect(F.table('d', { a: '5', b: '625', c: '6' }, '750')).toEqual({ a: frac(5), b: frac(625), c: frac(6), d: frac(750) });
    const fr = F.frame('a', { b: '720', c: '7,5', d: '1800' });
    expect(fr.cells).toEqual({ u1: 'd', v1: 'c', u2: 'b', h: 'a' });
    expect(fr.u1).toEqual(frac(1800));
  });
});
