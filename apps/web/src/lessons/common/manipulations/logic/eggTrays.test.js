import { describe, it, expect } from 'vitest';
import { divmod } from '@smarter-academy/core/arithmetic/divisibility.js';
import * as L from './eggTrays';

/**
 * egg-trays — la logique que le labo importe (MANIPULATION_DNA §13 : « test the logic the component imports »).
 * Balayages, pas d'échantillons : a ∈ 0..3000 × b ∈ 1..60 pour l'état, chaque (a, b, n) d'un balayage pour le cadre.
 */

/** Un a sur deux de 0..3000 et tous les b de 1..60 (≈ 90 000 couples). */
function* sweep(step = 1) {
  for (let b = 1; b <= 60; b += 1) for (let a = 0; a <= 3000; a += step) yield [a, b];
}

describe('egg-trays — l’état est la division euclidienne', () => {
  it('q plateaux fermés, r dans le plateau ouvert, r < b TOUJOURS (le plateau ouvert ne tient jamais b œufs)', () => {
    const bad = [];
    for (const [a, b] of sweep()) {
      const p = L.packOf(a, b);
      const d = divmod(a, b);
      if (p.q !== d.q || p.r !== d.r || !(p.r < b) || b * p.q + p.r !== a) bad.push(`${a}/${b}`);
    }
    expect(bad).toEqual([]);
  });

  it('le repère est q + r/b, croît avec a, et tombe sur une graduation ⇔ a % b = 0', () => {
    const bad = [];
    for (let b = 1; b <= 60; b += 1) {
      let prev = -1;
      for (let a = 0; a <= 3000; a += 1) {
        const p = L.packOf(a, b);
        const strict = p.q < p.marker && p.marker < p.q + 1;
        if (Math.abs(p.marker - a / b) > 1e-9 || !(p.marker > prev) || p.onMark !== (a % b === 0)
          || Number.isInteger(p.marker) !== (a % b === 0) || (a % b !== 0 && !strict)) bad.push(`${a}/${b}`);
        prev = p.marker;
      }
    }
    expect(bad).toEqual([]);
  });

  it('palettes de 10 : ⌊q/10⌋ palettes + q mod 10 plateaux (7 + 1 pour 71)', () => {
    expect(L.packOf(2145, 30)).toMatchObject({ q: 71, r: 15, pallets: 7, loose: 1 });
    for (let q = 0; q <= 120; q += 1) {
      expect(L.drawnUnits(q)).toBe(Math.floor(q / 10) + (q % 10));
      const p = L.packOf(q * 30 + 7, 30);
      expect(p.pallets * 10 + p.loose).toBe(q);
    }
  });

  it('then par défaut : le multiple de b qui suit a ; max par défaut : ⌈then ÷ b⌉ + 2', () => {
    expect(L.thenOf(50, 12)).toBe(60);
    expect(L.thenOf(2145, 30)).toBe(2160);
    expect(L.thenOf(60, 12)).toBe(72);
    expect(L.thenOf(50, 12, 50)).toBeNull();
    expect(L.maxOf(50, 12, 60)).toBe(7);
    expect(L.maxOf(2145, 30, 2160)).toBe(74);
    for (const [a, b] of sweep(7)) {
      const t = L.thenOf(a, b);
      expect(t % b).toBe(0);
      expect(t).toBeGreaterThan(a);
      expect(t - a).toBeLessThanOrEqual(b);
      expect(L.maxOf(a, b, t) * b).toBeGreaterThanOrEqual(t + 2 * b);
    }
  });

  it('la grille d’un plateau : 12 = 2 × 6, 30 = 5 × 6, et rows × cols = b pour tout b', () => {
    expect(L.trayGrid(12)).toEqual({ rows: 2, cols: 6 });
    expect(L.trayGrid(30)).toEqual({ rows: 5, cols: 6 });
    for (let b = 1; b <= 60; b += 1) {
      const g = L.trayGrid(b);
      expect(g.rows * g.cols).toBe(b);
      expect(g.rows).toBeLessThanOrEqual(g.cols);
      const cells = L.openCells(b - 1, b);
      expect(new Set(cells.map((c) => `${c.row}/${c.col}`)).size).toBe(b - 1);
      for (const c of cells) { expect(c.row).toBeLessThan(g.rows); expect(c.col).toBeLessThan(g.cols); }
    }
  });
});

describe('egg-trays — le juge du cadre', () => {
  it('ok ⇔ n·b < a < (n+1)·b, et ses modèles, sur chaque (a, b, n)', () => {
    const bad = [];
    for (let b = 1; b <= 40; b += 1) {
      for (let a = 0; a <= 600; a += 1) {
        const { q, r } = divmod(a, b);
        for (let n = 0; n <= q + 3; n += 1) {
          const v = L.judgeFrame(a, b, n);
          const model = v.ok ? 'right' : r === 0 && (n === q || n === q - 1) ? 'onMark' : r > 0 && n === r ? 'remainder' : n < q ? 'below' : 'above';
          if (v.ok !== (n * b < a && a < (n + 1) * b) || v.ok !== (r > 0 && n === q) || v.model !== model || v.gap !== Math.abs(q - n)) bad.push(`${a}/${b}/${n}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('le manuel : 2145 ÷ 30 dans [71 ; 72] ; [15 ; 16] est le reste ; 2160 ÷ 30 est SUR 72', () => {
    expect(L.judgeFrame(2145, 30, 71)).toMatchObject({ ok: true, model: 'right' });
    expect(L.judgeFrame(2145, 30, 15)).toMatchObject({ ok: false, model: 'remainder' });
    expect(L.judgeFrame(2145, 30, 69)).toMatchObject({ ok: false, model: 'below', gap: 2 });
    expect(L.judgeFrame(2145, 30, 72)).toMatchObject({ ok: false, model: 'above', gap: 1 });
    expect(L.judgeFrame(2160, 30, 72)).toMatchObject({ ok: false, model: 'onMark' });
    expect(L.judgeFrame(2160, 30, 71)).toMatchObject({ ok: false, model: 'onMark' });
    expect(L.judgeFrame(50, 12, 4)).toMatchObject({ ok: true });
    expect(L.judgeFrame(50, 12, 2)).toMatchObject({ model: 'remainder' });
    expect(L.judgeExact(2160, 30)).toMatchObject({ ok: true, q: 72 });
    expect(L.judgeExact(2145, 30)).toMatchObject({ ok: false, q: 71, r: 15 });
  });
});

describe('egg-trays — le camarade', () => {
  it('2145 = 30 × 70 + 45 : vraie, pas euclidienne ; 45 œufs ferment un plateau et en laissent 15', () => {
    const no = L.judgeClaim(2145, 30, 70, 45, false);
    expect(no).toMatchObject({ trueEq: true, euclid: false, ok: true, extra: 1, left: 15, q: 71 });
    expect(L.judgeClaim(2145, 30, 70, 45, true).ok).toBe(false);
    expect(L.judgeClaim(2145, 30, 71, 15, true)).toMatchObject({ euclid: true, ok: true, extra: 0, left: 15 });
  });

  it('balayage des égalités vraies mais non euclidiennes : r′ ≥ b ferme ⌊r′/b⌋ plateaux de plus', () => {
    const bad = [];
    let n = 0;
    for (let b = 2; b <= 40; b += 1) {
      for (let a = b; a <= 600; a += 7) {
        const { q } = divmod(a, b);
        for (let k = 1; k <= q; k += 1) {
          const cq = q - k;
          const cr = a - b * cq;
          const v = L.judgeClaim(a, b, cq, cr, true);
          n += 1;
          if (!v.trueEq || v.euclid || v.ok || v.extra !== Math.floor(cr / b) || v.q !== q || v.left !== a % b) bad.push(`${a}/${b}/${cq}`);
        }
      }
    }
    expect(n).toBeGreaterThan(10000);
    expect(bad).toEqual([]);
  });
});

describe('egg-trays — le déroulé et la porte de la découverte', () => {
  const beginner = () => L.init({ a: 50, b: 12, world: 'carton' });
  const advanced = () => L.init({ a: 2145, b: 30, world: 'tray', then: 2160, claim: { q: 70, r: 45 } });

  it('un défaut n’est pas un essai : le tapis est fermé tant que le cadre n’est pas posé', () => {
    const s = beginner();
    expect(s).toMatchObject({ a: 50, then: 60, max: 7, count: 0, frame: { n: 0, placed: false } });
    expect(L.fillLocked(s)).toBe(true);
    expect(L.commitCount(s, 20)).toBe(s);
    const s1 = L.commitFrame(s, 3);
    expect(s1.trials).toHaveLength(0);
    expect(L.fillLocked(s1)).toBe(false);
  });

  it('le cadre est verrouillé pendant le remplissage, jugé à la commande pleine, re-jugé à chaque pose', () => {
    let s = L.commitFrame(beginner(), 3);
    s = L.commitCount(s, 30);
    expect(L.frameLocked(s)).toBe(true);
    expect(L.commitFrame(s, 4)).toBe(s);
    s = L.commitCount(s, 99); // le tapis ne dépasse pas la commande
    expect(s.count).toBe(50);
    expect(s.trials.at(-1)).toMatchObject({ kind: 'frame', n: 3, ok: false, model: 'below', gap: 1 });
    s = L.commitFrame(s, 2);
    expect(s.trials.at(-1)).toMatchObject({ n: 2, model: 'remainder' });
    s = L.commitFrame(s, 4);
    expect(s.trials.at(-1)).toMatchObject({ n: 4, ok: true });
    const again = L.commitFrame(s, 4);
    expect(again.trials).toHaveLength(s.trials.length);
    expect(L.discoveryReady(s)).toBe(false);
  });

  it('mبتدئ : cadre juste, puis le contraste 60 et « يقع على عدد طبيعي » ouvrent la découverte', () => {
    let s = L.commitFrame(beginner(), 4);
    s = L.commitCount(s, 50);
    expect(L.canAddEggs(s)).toBe(true);
    s = L.addEggs(s);
    expect(s).toMatchObject({ a: 60, count: 50, frame: { placed: false } });
    expect(L.claimExact(s)).toBe(s); // pas encore plein
    s = L.commitCount(s, 60);
    expect(s.trials.at(-1).a).toBe(50); // aucun cadre posé : aucun essai
    const framed = L.commitFrame(s, 4);
    expect(framed.trials.at(-1)).toMatchObject({ a: 60, model: 'onMark', ok: false });
    s = L.claimExact(framed);
    expect(s.trials.at(-1)).toMatchObject({ kind: 'exact', a: 60, q: 5, ok: true });
    expect(L.thenDone(s)).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.trialEvidence(s.trials.at(-1))).toEqual({ kind: 'exact', a: 60, b: 12, q: 5, ok: true });
  });

  it('متقدم : le camarade s’ouvre après le contraste, se juge une fois, et ferme la porte', () => {
    let s = L.commitFrame(advanced(), 71);
    s = L.commitCount(s, 2145);
    expect(L.claimOpen(s)).toBe(false);
    s = L.claimExact(L.commitCount(L.addEggs(s), 2160));
    expect(L.claimOpen(s)).toBe(true);
    expect(L.discoveryReady(s)).toBe(false);
    s = L.answerClaim(s, false);
    expect(s.trials.at(-1)).toMatchObject({ kind: 'claim', agree: false, ok: true, extra: 1, left: 15 });
    expect(L.answerClaim(s, true)).toBe(s);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.trialEvidence(s.trials.at(-1))).toEqual({ kind: 'claim', a: 2145, b: 30, claimQ: 70, claimR: 45, agree: false, ok: true });
    expect(L.trialEvidence(s.trials[0])).toEqual({ kind: 'frame', a: 2145, b: 30, q: 71, r: 15, n: 71, ok: true, model: 'right' });
  });

  it('reset recommence tout ; shownVerdict suit l’écran', () => {
    let s = L.commitCount(L.commitFrame(beginner(), 4), 50);
    expect(L.shownVerdict(s)).toMatchObject({ kind: 'frame', ok: true });
    s = L.setCount(s, 40);
    expect(L.shownVerdict(s)).toBeNull();
    const r = L.reset(s);
    expect(r).toEqual(beginner());
    const adv = L.reset(advanced());
    expect(adv.claim).toEqual({ q: 70, r: 45 });
    expect(adv.then).toBe(2160);
  });

  it('les réfutations prennent les nombres de l’élève : 50 pair ; à 2145, le dernier pair traversé à reste non nul', () => {
    const r1 = L.refutations(beginner());
    expect(r1.even).toMatchObject({ n: 50, q: 4, r: 2, passed: true });
    expect(r1.bigger).toMatchObject({ n: 50, q: 4, r: 2 });
    let s = L.commitFrame(advanced(), 71);
    for (const c of [300, 2100, 2130, 2140, 2145]) s = L.commitCount(s, c);
    const r2 = L.refutations(s);
    expect(r2.even).toMatchObject({ n: 2140, q: 71, r: 10, passed: true });
    expect(r2.mult).toEqual({ n: 2130, q: 71 });
    const r3 = L.refutations(advanced());
    expect(r3.even.passed).toBe(false);
    expect(r3.even.n % 2).toBe(0);
    expect(r3.even.r).toBeGreaterThan(0);
    // balayage : toujours un pair à reste non nul quand b > 1
    for (const [a, b] of sweep(37)) {
      if (b <= 2 || a <= b) continue; // b = 2 : tout nombre pair est un multiple — l'option « زوجي » n'est pas proposée
      const e = L.refutations(L.init({ a, b })).even;
      expect(e, `${a}/${b}`).not.toBeNull();
      expect(e.n % 2).toBe(0);
      expect(e.n % b).not.toBe(0);
    }
  });
});

describe('egg-trays — géométrie', () => {
  const WIDTHS = [236, 300, 420, 640, 860];

  it('la règle : graduations aux entiers, lisibles, le repère entre q et q + 1', () => {
    for (const [max, b] of [[7, 12], [74, 30]]) {
      for (const width of WIDTHS) {
        const ax = L.axisLayout({ max, b, width });
        expect(ax.u * ax.tick).toBeGreaterThanOrEqual(3);
        expect(ax.u * ax.label).toBeGreaterThanOrEqual(22);
        expect(ax.ticks.at(-1).x).toBeLessThanOrEqual(width);
        for (const tk of ax.ticks) expect(Number.isInteger(tk.v)).toBe(true);
        if (max === 7 && width >= 236) expect(ax.label).toBe(1);
        for (let c = 1; c <= max * b - b; c += 7) {
          const { q, r } = divmod(c, b);
          const x = ax.xOfEggs(c);
          expect(x).toBeGreaterThanOrEqual(ax.xOf(q) - 1e-9);
          expect(x).toBeLessThan(ax.xOf(q + 1) + 1e-9);
          if (r === 0) expect(x).toBeCloseTo(ax.xOf(q), 9);
          expect(ax.trayAt(ax.xOf(q) + ax.u / 2)).toBe(q);
        }
      }
    }
    const adv = L.axisLayout({ max: 74, b: 30, width: 640 });
    expect(adv.label).toBe(10);
    expect(adv.tick).toBe(1);
  });

  it('مبتدئ : les 50 puis 60 œufs du tapis, chacun une fois, dans la largeur, sans chevauchement, à cinq largeurs', () => {
    for (const width of WIDTHS) {
      const ax = L.axisLayout({ max: 7, b: 12, width });
      const belt = L.beltLayout({ b: 12, u: ax.u, x0: ax.x0 });
      expect(belt.w).toBeGreaterThanOrEqual(Math.min(7, belt.colW * 0.86) - 1e-9);
      for (const order of [50, 60]) {
        const seen = new Set();
        const pts = Array.from({ length: order }, (_, i) => belt.pos(i));
        for (let i = 0; i < order; i += 1) {
          const p = pts[i];
          seen.add(`${p.x.toFixed(3)}/${p.y.toFixed(3)}`);
          expect(p.x - belt.w / 2).toBeGreaterThanOrEqual(0);
          expect(p.x + belt.w / 2).toBeLessThanOrEqual(width);
          expect(p.y + belt.h / 2).toBeLessThanOrEqual(belt.height + 1e-9);
          // l'œuf i est au-dessus de i ÷ b (à une colonne près)
          expect(Math.abs(p.x - ax.xOfEggs(i))).toBeLessThanOrEqual(belt.colW + 1e-9);
        }
        expect(seen.size).toBe(order);
        for (let i = 0; i + belt.rows < order; i += 1) {
          // voisins de colonne : jamais de chevauchement horizontal
          expect(pts[i + belt.rows].x - pts[i].x).toBeGreaterThanOrEqual(belt.w - 1e-9);
        }
      }
    }
  });

  it('le zoom : le plateau ouvert agrandi, sa barre de remplissage = r/b du segment', () => {
    for (const b of [12, 30]) {
      for (const width of [140, 220, 360]) {
        const z = L.zoomLayout({ b, width, maxH: 110 });
        expect(z.rows * z.cols).toBe(b);
        expect(z.h).toBeLessThanOrEqual(Math.max(110, z.rows * 9));
        for (let r = 0; r < b; r += 1) expect(z.fillW(r) / z.w).toBeCloseTo(r / b, 9);
        // les cases remplies (colonne par colonne) couvrent la part r/b à une colonne près
        for (let r = 0; r < b; r += 1) {
          const cols = new Set(L.openCells(r, b).map((c) => c.col)).size;
          expect(Math.abs(cols / z.cols - r / b)).toBeLessThanOrEqual(1 / z.cols + 1e-9);
        }
      }
    }
  });
});
