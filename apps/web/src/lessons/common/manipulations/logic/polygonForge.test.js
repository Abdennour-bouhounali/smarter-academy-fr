import { describe, it, expect } from 'vitest';
import * as Rot from '@smarter-academy/core/arithmetic/rotation.js';
import * as L from './polygonForge';
import { LEVELS } from '../levels';

/**
 * polygon-forge — la logique du lab sur les nombres du manuel et de la plateforme : la cellule de ruche (60°, n = 6),
 * l'étoile du drapeau (72°, pointes à 10 cm → R ≈ 8,51 cm, branches ≈ 16,18 cm, pointes de 36°), la résistance (50° ne
 * se ferme jamais : 360 ÷ 50 = 7,2), l'étoile à deux tours (144°), le segment (180°). Chaque issue est confrontée à
 * rotation.js, balayée sur TOUT le cadran.
 */
const run = (lab, times = 40) => { let s = lab; for (let i = 0; i < times && L.canTurn(s) === true; i += 1) s = L.turn(s); return s; };
const cell = () => L.init(LEVELS['polygon-forge'].beginner.numbers);
const flag = () => L.init(LEVELS['polygon-forge'].advanced.numbers);

describe('polygon-forge — the level pair', () => {
  it('مبتدئ = the beehive cell (n = 6, r = 3) ; متقدم = the تحدّ star (n = 5, tips 10 cm, every second tip)', () => {
    expect(cell()).toMatchObject({ mode: 'cell', target: 6, r: 3, alpha: 50, stage: 'forge' });
    expect(flag()).toMatchObject({ mode: 'star', target: 5, tip: 10, starStep: 2, alpha: 60 });
  });
  it('neither start angle is the answer (50° and 60° at مبتدئ / متقدم; the answers are 60° and 72°)', () => {
    expect(Rot.sidesFromCentral(cell().alpha)).not.toBe(6);
    expect(Rot.sidesFromCentral(flag().alpha)).not.toBe(5);
  });
});

describe('polygon-forge — the dial and the turns', () => {
  it('α is clamped to [20 ; 180] and locked while a run is in progress', () => {
    let s = L.setAlpha(cell(), 5);
    expect(s.alpha).toBe(20);
    s = L.setAlpha(s, 400);
    expect(s.alpha).toBe(180);
    s = L.setAlpha(s, 60);
    s = L.turn(s);
    expect(L.canSetAlpha(s)).toBe('locked');
    expect(L.setAlpha(s, 72).alpha).toBe(60);
    s = L.release(s);
    expect(s.images).toBe(0);
    expect(L.setAlpha(s, 72).alpha).toBe(72);
  });
  it('a FINISHED run frees the dial: turning it starts a new run, the trials stay', () => {
    const s = run(L.setAlpha(cell(), 60));
    expect(L.canSetAlpha(s)).toBe(true);
    const u = L.setAlpha(s, 72);
    expect(u).toMatchObject({ alpha: 72, images: 0, run: null });
    expect(u.trials).toHaveLength(1);
  });

  it('60° closes the cell after 6 images — the trial is « closed », n = 6', () => {
    const s = run(L.setAlpha(cell(), 60));
    expect(s.run).toBe('closed');
    expect(s.images).toBe(6);
    expect(L.closedN(s)).toBe(6);
    expect(s.trials).toEqual([{ alpha: 60, outcome: 'closed', k: 6, n: 6, i: 0 }]);
    expect(L.canTurn(s)).toBe('ended');
  });

  it('50° NEVER closes: the 8th image passes A (7 × 50 = 350 < 360 < 400), then two turns without landing', () => {
    let s = cell();
    for (let k = 1; k <= 7; k += 1) { s = L.turn(s); expect(s.run).toBeNull(); }
    s = L.turn(s);
    expect(s.run).toBe('open');
    expect(s.trials.at(-1)).toMatchObject({ alpha: 50, outcome: 'open', k: 8 });
    expect(L.canTurn(s)).toBe(true);
    s = run(s);
    expect(s.run).toBe('spiral');
    expect(s.trials).toHaveLength(1);
    expect(s.trials[0].outcome).toBe('spiral');
    expect(L.quotientText(50)).toBe('7,2');
  });

  it('72° closes a pentagon: at مبتدئ another polygon (« other »), at متقدم the target — `found`', () => {
    const a = run(L.setAlpha(cell(), 72));
    expect(a).toMatchObject({ run: 'other', images: 5 });
    const b = run(L.setAlpha(flag(), 72));
    expect(b).toMatchObject({ run: 'closed', images: 5, found: 72 });
    expect(L.canOpenRadius(b)).toBe(true);
  });

  it('144° (= 2 × 72°) lands on A after TWO turns: a star, not a regular polygon', () => {
    const s = run(L.setAlpha(flag(), 144));
    expect(s.run).toBe('star');
    expect(s.images).toBe(5);
    expect(s.trials).toEqual([{ alpha: 144, outcome: 'star', k: 5, n: null, i: 0 }]);
    expect(Rot.sidesFromCentral(144)).toBeNull();
  });

  it('180° gives two images only: a segment (n < 3)', () => {
    const s = run(L.setAlpha(cell(), 180));
    expect(s).toMatchObject({ run: 'flat', images: 2 });
  });

  it('SWEEP: for every α of the dial, the run closes after n images ⇔ rotation.sidesFromCentral(α) = n', () => {
    for (let a = L.ALPHA.min; a <= L.ALPHA.max; a += 1) {
      const s = run(L.setAlpha(cell(), a), 60);
      const n = Rot.sidesFromCentral(a);
      if (n != null) {
        expect(['closed', 'other'], `α = ${a}`).toContain(s.run);
        expect(s.images, `α = ${a}`).toBe(n);
        expect(n * a).toBe(360);
      } else {
        expect(['open', 'flat', 'star', 'spiral'], `α = ${a}`).toContain(s.run);
        if (s.run === 'star') expect(s.images * a).toBe(720);
      }
      // a run never goes on after its outcome
      expect(L.canTurn(s)).toBe('ended');
    }
  });

  it('the drawn vertices are A then each image of the previous one by (O, α), in the direct sense', () => {
    const s = run(L.setAlpha(cell(), 60));
    const deg = L.vertexDegrees(s);
    expect(deg).toEqual([90, 150, 210, 270, 330, 390, 450]);
    const O = { x: 0, y: 0 };
    const pts = deg.map((d) => Rot.pointOnCircle(O, 3, d));
    for (let j = 1; j < pts.length; j += 1) expect(Rot.imageCheck(O, pts[j - 1], pts[j], 60, 'direct').ok).toBe(true);
    // la 6e image retombe sur A
    expect(pts[6].x).toBeCloseTo(pts[0].x, 9);
    expect(pts[6].y).toBeCloseTo(pts[0].y, 9);
  });
});

describe('polygon-forge — the readings of a closed polygon (rotation.js)', () => {
  it('hexagon of radius 3: central 60°, interior 120°, side = r = 3 (the bees’ trick)', () => {
    expect(L.readings(6, 3)).toMatchObject({ central: '60^\\circ', interior: '120^\\circ', sideExact: '3', sideIsRadius: true });
  });
  it('square r√2, triangle r√3, pentagon ≈ 2r·sin 36°', () => {
    expect(L.readings(4, 3)).toMatchObject({ central: '90^\\circ', interior: '90^\\circ', sideExact: '3\\sqrt{2}', sideIsRadius: false });
    expect(L.readings(3, 3)).toMatchObject({ central: '120^\\circ', interior: '60^\\circ', sideExact: '3\\sqrt{3}' });
    expect(L.readings(5, 3)).toMatchObject({ central: '72^\\circ', interior: '108^\\circ', sideExact: null, sideText: '3,53' });
  });
  it('heptagon: the central angle stays EXACT (360/7)', () => {
    expect(L.readings(7).central).toBe('\\dfrac{360}{7}^\\circ');
    expect(L.readings(7).interior).toBe('\\dfrac{900}{7}^\\circ');
  });
});

describe('polygon-forge — the flag star (the تحدّ)', () => {
  const pentagon = () => run(L.setAlpha(flag(), 72));

  it('R = 5 / sin 36° ≈ 8,51 cm ; branch ≈ 16,18 cm ; tip angle 36° ; half the central angle 36°', () => {
    expect(L.starNumbers(flag())).toMatchObject({ RText: '8,51', branchText: '16,18', tipAngle: 36, half: '36^\\circ', halfTip: '5,00' });
  });

  it('the radius stage opens only after the pentagon closed; 8,51 is the ONLY radius giving 10,00 cm', () => {
    expect(L.openRadius(flag()).stage).toBe('forge');
    let s = L.openRadius(pentagon());
    expect(s.stage).toBe('radius');
    s = L.commitRadius(s, 1000); // R = côté : le piège de l'hexagone
    expect(s.last).toMatchObject({ verdict: 'long', text: '11,76' });
    s = L.commitRadius(s, 618); // 5 / cos 36°
    expect(s.last).toMatchObject({ verdict: 'short', text: '7,27' });
    s = L.commitRadius(s, 850);
    expect(s.last).toMatchObject({ verdict: 'short', text: '9,99' });
    expect(L.canOpenDraw(s)).toBe(false);
    s = L.commitRadius(s, 851);
    expect(s.last).toMatchObject({ verdict: 'ok', text: '10,00' });
    expect(L.canOpenDraw(s)).toBe(true);
    const oks = [];
    for (let h = L.RADIUS.min; h <= L.RADIUS.max; h += 1) if (L.commitRadius(L.openRadius(pentagon()), h).last.verdict === 'ok') oks.push(h);
    expect(oks).toEqual([851]);
  });

  it('drawing: every second tip is a branch (A→C→E→B→D→A); a side of the pentagon is refused', () => {
    let s = L.openDraw(L.commitRadius(L.openRadius(pentagon()), 851));
    expect(s.stage).toBe('draw');
    s = L.tapTip(s, 1);
    expect(s.last).toMatchObject({ kind: 'refuse', reason: 'side' });
    expect(s.strokes).toEqual([]);
    for (const j of [2, 4, 1, 3]) s = L.tapTip(s, j);
    expect(L.starDone(s)).toBe(false);
    expect(L.tapTip(s, 1).last).toMatchObject({ kind: 'refuse', reason: 'again' });
    s = L.tapTip(s, 0);
    expect(s.strokes).toEqual(['0-2', '2-4', '1-4', '1-3', '0-3']);
    expect(L.starDone(s)).toBe(true);
    expect(L.evidenceOf(s)).toMatchObject({ kind: 'star', strokes: 5 });
  });

  it('the way back keeps everything: forge ↔ radius ↔ draw', () => {
    let s = L.openDraw(L.commitRadius(L.openRadius(pentagon()), 851));
    s = L.goStage(s, 'forge');
    expect(s).toMatchObject({ stage: 'forge', found: 72, radiusOk: true });
    expect(L.goStage(s, 'draw').stage).toBe('draw');
  });
});

describe('polygon-forge — discovery needs the target AND a contrast', () => {
  it('مبتدئ: a first-try hexagon is not enough; after a refused 50° run it is', () => {
    let s = run(L.setAlpha(cell(), 60));
    expect(L.discoveryReady(s)).toBe(false);
    s = run(L.setAlpha(L.release(s), 50));
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('the default start (50°) gives the contrast by itself', () => {
    let s = run(cell());
    s = run(L.setAlpha(L.release(s), 60));
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('متقدم: the star must be drawn; a refused radius counts as contrast', () => {
    let s = L.openRadius(run(L.setAlpha(flag(), 72)));
    s = L.commitRadius(s, 1000);
    s = L.openDraw(L.commitRadius(s, 851));
    expect(L.discoveryReady(s)).toBe(false);
    for (const j of [2, 4, 1, 3, 0]) s = L.tapTip(s, j);
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('evidence of a turn names the outcome and α', () => {
    const s = run(L.setAlpha(cell(), 72));
    expect(L.evidenceOf(s)).toEqual({ kind: 'turn', outcome: 'other', alpha: 72, n: 5, k: 5, mode: 'cell' });
  });
});

describe('polygon-forge — défaut jamais une réponse, et « جرّب كل الإمكانيات »', () => {
  it('le α de départ ne ferme jamais la figure cherchée (cellule ou étoile, n de 3 à 20)', () => {
    for (let n = 3; n <= 20; n += 1) {
      const c = L.init({ n, r: 3 });
      expect(c.alpha * n, `cell n=${n}`).not.toBe(360);
      const st = L.init({ n, tip: 10, star: 2 });
      expect(st.alpha * n, `star n=${n}`).not.toBe(360);
      expect(c.trials).toHaveLength(0);
      expect(c.images).toBe(0);
    }
  });
  it('runAlpha = la main (setAlpha puis « دوّر » jusqu’à la fin du tour) : même essai enregistré', () => {
    for (const a of [20, 50, 60, 72, 144, 180]) {
      let hand = L.setAlpha(cell(), a);
      while (L.canTurn(hand) === true) hand = L.turn(hand);
      const auto = L.runAlpha(cell(), a);
      expect(auto.trials, `α=${a}`).toEqual(hand.trials);
      expect(auto.run).toBe(hand.run);
    }
  });
  it('parcourir tout le cadran : un essai par α, plus rien à essayer, la découverte est possible mais pas déclarée', () => {
    let s = cell();
    expect(L.untriedAlphas(s)).toHaveLength(161);
    let guard = 0;
    while (L.untriedAlphas(s).length && guard++ < 200) s = L.runAlpha(s, L.untriedAlphas(s)[0]);
    expect(s.trials).toHaveLength(161);
    expect(L.untriedAlphas(s)).toHaveLength(0);
    expect(s.trials.find((t) => t.alpha === 60).outcome).toBe('closed');
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('un α déjà essayé à la main n’est pas rejoué ; l’étoile trouve 72 en parcourant', () => {
    let s = L.runAlpha(flag(), 72);
    expect(L.untriedAlphas(s)).toHaveLength(160);
    s = L.runAlpha(flag(), 20);
    s = L.untriedAlphas(s).reduce((acc, a) => L.runAlpha(acc, a), s);
    expect(s.found).toBe(72);
  });
});
