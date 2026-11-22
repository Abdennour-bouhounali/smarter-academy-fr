import { describe, it, expect } from 'vitest';
import * as L from './statBalance';

/**
 * stat-balance — la logique sur les nombres du manuel (unité 8, pp. 93–97, 100) : El Oued (نشاط 4 :
 * المدى 14, المتوسط 39,3, الوسيط 38,5), le mini-tournoi (2, 3, 3, 4, 8), le tableau des médailles
 * (أدمج تعلّماتي : x = 3, y = 28). Balayages complets : l'appui n'est de niveau QU'à la moyenne, le rideau
 * ne se verrouille QU'au rang médian.
 */
const EL_OUED = '40|35|34|41|48|37|35|46|37|40';
const ESPORT = '2|3|3|4|8';
const MEDALS = '1:11|2:3|?:2|4:1|5:2|6:2|7:1|11:1|13:1|14:2|16:1|26:1|?:1|32:1';
const T = L.text;

describe('lecture du contrat', () => {
  it('séries simples et « valeur:effectif », virgule décimale', () => {
    expect(L.parseSeries('2|3:4|8,5').map((e) => [T(e.v), e.f])).toEqual([['2', 1], ['3', 4], ['8,5', 1]]);
    expect(L.parseSeries('?:2|4').map((e) => e.v)).toEqual([null, expect.anything()]);
    expect(() => L.parseSeries('2:0')).toThrow();
    expect(() => L.parseSeries('')).toThrow();
  });
  it('les étapes : le contraste suit la médiane ; hidden se joue seul', () => {
    expect(L.parseMode('range|mean|median')).toEqual(['range', 'mean', 'median', 'contrast']);
    expect(L.parseMode('mean|median')).toEqual(['mean', 'median', 'contrast']);
    expect(L.parseMode('range|mean')).toEqual(['range', 'mean']);
    expect(L.parseMode('hidden')).toEqual(['hidden']);
    expect(() => L.parseMode('hidden|mean')).toThrow();
    expect(() => L.parseMode('mode')).toThrow();
  });
  it('les bornes des valeurs cachées et l’axe', () => {
    expect(L.parseHidden('2:2-4|12:26-32').map((h) => [h.index, T(h.lo), T(h.hi)])).toEqual([[2, '2', '4'], [12, '26', '32']]);
    const ax = L.parseAxis('0:32:4');
    expect([T(ax.min), T(ax.max), T(ax.step)]).toEqual(['0', '32', '4']);
    expect(() => L.parseAxis('5:5:1')).toThrow();
  });
  it('un contrat faux est une erreur de contenu', () => {
    expect(() => L.init({ series: MEDALS, mode: 'mean' })).toThrow();
    expect(() => L.init({ series: MEDALS, mode: 'hidden', hidden: '2:2-4|12:26-32' })).toThrow();
    expect(() => L.init({ series: '5', mode: 'mean' })).toThrow();
    expect(() => L.init({ series: ESPORT, mode: 'mean', axis: '3:6:1' })).toThrow();
  });
});

describe('المتوسط — l’appui ne met la poutre de niveau qu’à la moyenne exacte', () => {
  for (const [series, m, D] of [[EL_OUED, '39,3', 10], [ESPORT, '4', 10], ['18:2|15:18|16:6|20:4', '241/15', 15], ['10:3|18:4|15:16|20:7', '241/15', 15]]) {
    it(`${series} → m = ${m} (graduation 1/${D})`, () => {
      const lab = L.init({ series, mode: 'mean' });
      expect(T(L.mean(lab))).toBe(m);
      expect(lab.D).toBe(D);
      const r = L.fulcrumRange(lab);
      const level = [];
      for (let j = r.min; j <= r.max; j += 1) {
        const p = L.fulcrumAt(lab, j);
        const mo = L.moments(lab, p);
        // INVARIANT : right − left = Σ (x − p) ; de niveau ⇔ p = m
        expect(L.same(mo.torque, L.moments(lab, p).torque)).toBe(true);
        if (mo.tilt === 'level') level.push(T(p));
        expect(L.tiltAngle(lab, p) === 0).toBe(mo.tilt === 'level');
        // la poutre penche du côté des grandes valeurs quand l'appui est à gauche de la moyenne
        if (L.toNum(p) < L.toNum(L.mean(lab))) expect(mo.tilt).toBe('right');
      }
      expect(level).toEqual([m]);
    });
  }
  it('El Oued : on part du milieu de l’étendue (41), qui n’est pas la moyenne ; l’essai à 39,3 équilibre', () => {
    let lab = L.init({ series: EL_OUED, mode: 'range|mean' });
    expect(T(L.fulcrumAt(lab, lab.fulcrumJ))).toBe('41');
    expect(L.moments(lab, L.fulcrumAt(lab, lab.fulcrumJ)).tilt).toBe('left');
    lab = L.setFulcrum(lab, L.fulcrumIndex(lab, L.mean(lab)));
    expect(lab.last.kind).toBe('balanced');
    expect(T(lab.last.left)).toBe(T(lab.last.right));
    expect(T(lab.last.left)).toBe('18,5');
    expect(lab.done.mean).toBe(true);
  });
  it('2, 3, 3, 4, 8 : le milieu 5 penche à gauche, le mode 3 à droite', () => {
    const lab = L.init({ series: ESPORT, mode: 'mean' });
    expect(T(L.midrange(lab))).toBe('5');
    expect(L.moments(lab, L.midrange(lab)).tilt).toBe('left');
    expect(T(L.uniqueMode(lab))).toBe('3');
    expect(L.moments(lab, L.uniqueMode(lab)).tilt).toBe('right');
  });
});

describe('الوسيط — le rideau ne se verrouille qu’au rang médian', () => {
  for (const [series, med, lockedAt] of [[EL_OUED, '38,5', [10]], [ESPORT, '3', [5]], ['3|5|4|5|11|8|10|7|4|3|10|3|4|6|7', '5', [15]], ['4|5|11|11|15|17|23|23|25', '15', [9]], ['2|5|7|7|9|12|13|13|20|22', '10,5', [10]]]) {
    it(`${series} → Med = ${med}`, () => {
      const lab = L.init({ series, mode: 'median' });
      expect(T(L.median(lab))).toBe(med);
      const r = L.curtainRange(lab);
      const locked = [];
      for (let c = r.min; c <= r.max; c += 1) if (L.curtainLocked(lab, c)) locked.push(c);
      expect(locked).toEqual(lockedAt);
      expect(T(L.curtainValue(lab, lockedAt[0]))).toBe(med);
      const done = L.setCurtain(lab, lockedAt[0]);
      expect(done.last.kind).toBe('locked');
      expect(done.last.left).toBe(done.last.right);
    });
  }
  it('le rideau sous le doigt : dans la pile des deux 3, la hauteur choisit la coupe', () => {
    const lab = L.init({ series: ESPORT, mode: 'median' });
    expect(L.curtainFrom(lab, 3, 0.5)).toBe(3); // sur le rang 2
    expect(L.curtainFrom(lab, 3, 1)).toBe(4); // entre les rangs 2 et 3
    expect(L.curtainFrom(lab, 3, 1.5)).toBe(5); // sur le rang 3 : verrouillé
    expect(L.curtainFrom(lab, 6, 0)).toBe(8); // entre 4 et 8
    expect(L.sides(lab, 4)).toEqual({ left: 2, on: null, right: 3 });
    expect(L.sideOfRank(lab, 5, 3)).toBe('on');
  });
  it('les rangs du manuel : 57 → 29, 60 → 30 et 31, 97 → 49', () => {
    const lab = L.init({ series: '50:11|51:8|53:12|54:9|55:6|56:5|57:2|58:3|60:1', mode: 'median' });
    expect(L.medianRanks(lab)).toEqual([29]);
    expect(T(L.median(lab))).toBe('53');
    const labM = L.init({ series: '54:12|55:18|56:10|57:8|58:9|60:3', mode: 'median' });
    expect(L.medianRanks(labM)).toEqual([30, 31]);
    expect(T(L.median(labM))).toBe('55,5');
  });
});

describe('المدى — le كلّاب n’est pris que sur les deux extrêmes', () => {
  it('El Oued : 48 − 34 = 14 ; serré au centre, des jetons restent dehors des deux côtés', () => {
    let lab = L.init({ series: EL_OUED, mode: 'range|mean' });
    const o = L.outside(lab);
    expect(o.below).toBeGreaterThan(0);
    expect(o.above).toBeGreaterThan(0);
    lab = L.setJaw(lab, 'lo', 0);
    expect(lab.last.kind).toBe('open');
    lab = L.setJaw(lab, 'hi', 99);
    expect(lab.last.kind).toBe('caught');
    expect(T(lab.last.width)).toBe('14');
    expect(T(L.range(lab))).toBe('14');
  });
  it('les mâchoires ne se croisent pas', () => {
    let lab = L.init({ series: ESPORT, mode: 'range' });
    lab = L.setJaw(lab, 'lo', 3);
    expect(lab.jaws.lo).toBeLessThanOrEqual(lab.jaws.hi);
  });
});

describe('le contraste — la moyenne court, la médiane reste (طرائق : 43)', () => {
  it('2, 3, 3, 4, 8 : 8 → 20 puis 24 ; m = 6,4 puis 7,2 ; Med = 3', () => {
    let lab = L.init({ series: ESPORT, mode: 'mean|median' });
    lab = L.setFulcrum(lab, L.fulcrumIndex(lab, L.mean(lab)));
    lab = L.setCurtain(lab, 5);
    lab = L.goStage(L.goStage(lab, 1), 2);
    expect(L.stageOf(lab)).toBe('contrast');
    expect(L.toNum(L.axisOf(lab).max)).toBeGreaterThanOrEqual(20);
    lab = L.placeMoved(lab, L.moveIndex(lab, L.parseVal('20')));
    expect([T(lab.last.mean), T(lab.last.median)]).toEqual(['6,4', '3']);
    expect(lab.done.contrast).toBe(false);
    lab = L.placeMoved(lab, L.moveIndex(lab, L.parseVal('24')));
    expect([T(lab.last.mean), T(lab.last.median)]).toEqual(['7,2', '3']);
    expect(lab.done.contrast).toBe(true);
    // le rideau reste verrouillé : le rang du jeton tiré n'a pas changé
    expect(L.curtainLocked(lab, lab.curtain)).toBe(true);
  });
  it('on n’ouvre pas une étape avant les précédentes', () => {
    const lab = L.init({ series: ESPORT, mode: 'mean|median' });
    expect(L.goStage(lab, 2).stage).toBe(0);
  });
});

describe('hidden — les médailles : la médiane fixe x = 3, la moyenne fixe y = 28', () => {
  const cfg = { series: MEDALS, mode: 'hidden', hidden: '2:2-4|12:26-32', targetMean: '7', targetMedian: '3', axis: '0:32:4' };
  it('30 pays, onze à 1 médaille ; seule (3 ; 28) tient les deux cibles', () => {
    const lab = L.init(cfg);
    expect(lab.N).toBe(30);
    expect(Math.max(...L.columns(lab).map((c) => c.tokens.length))).toBe(11);
    const hits = [];
    for (let a = 0; a <= L.holeRange(lab, 0).max; a += 1) {
      for (let b = 0; b <= L.holeRange(lab, 1).max; b += 1) {
        let s = L.placeHole(lab, 0, L.holeAt(lab, 0, a));
        s = L.placeHole(s, 1, L.holeAt(s, 1, b));
        if (s.last.kind === 'found') hits.push([T(L.holeValue(s, 0)), T(L.holeValue(s, 1))]);
      }
    }
    expect(hits).toEqual([['3', '28']]);
  });
  it('hors des bornes du tableau : refusé ; la moyenne seule ne suffit pas (contre-exemple)', () => {
    const lab = L.init(cfg);
    const s = L.placeHole(lab, 1, L.parseVal('33'));
    expect(s.last.kind).toBe('refused');
    expect(T(L.holeValue(s, 1))).toBe('26');
    const w = L.meanOnlyWitness(lab);
    expect(w).not.toBeNull();
    expect(w.map(T)).toEqual(['2', '30']);
  });
  it('la poutre penche selon Σ (x − 7) tant que y n’est pas 28', () => {
    let lab = L.init(cfg);
    lab = L.placeHole(lab, 0, L.parseVal('3'));
    expect(L.hiddenStatus(lab).tilt).toBe('left');
    lab = L.placeHole(lab, 1, L.parseVal('28'));
    expect(L.hiddenStatus(lab).tilt).toBe('level');
  });
});

describe('géométrie — tout tient, en bloc', () => {
  const CASES = [
    { series: ESPORT, mode: 'mean|median' },
    { series: EL_OUED, mode: 'range|mean|median' },
    { series: MEDALS, mode: 'hidden', hidden: '2:2-4|12:26-32', targetMean: '7', targetMedian: '3', axis: '0:32:4' },
  ];
  for (const cfg of CASES) {
    for (const width of [150, 180, 260, 340, 480, 700]) {
      it(`${cfg.series.slice(0, 12)}… à ${width} px`, () => {
        const lab = L.init(cfg);
        const height = 220;
        const g = L.beamLayout(lab, { width, height });
        expect(g.token).toBeGreaterThanOrEqual(5);
        expect(g.tall * g.token).toBeLessThanOrEqual(Math.max(height - 96, 5 * g.tall) + 1e-6);
        const cols = L.columns(lab);
        for (let i = 0; i < cols.length; i += 1) {
          const x = g.px(cols[i].v);
          expect(x - g.token / 2).toBeGreaterThanOrEqual(0);
          expect(x + g.token / 2).toBeLessThanOrEqual(width);
          if (i > 0 && g.token > 5) expect(x - g.px(cols[i - 1].v)).toBeGreaterThanOrEqual(g.token * 0.99);
        }
      });
    }
  }
});

describe('balayage « جرّب كل الإمكانيات »', () => {
  it('mean / median / contrast : chaque valeur est l’essai de la main, le balayage se vide, range et hidden ne se balaient pas', () => {
    const lab0 = L.init({ series: '40|35|34|36|48|38|39|41|37|45', mode: 'mean|median' });
    // mean
    const todo = L.untriedSweep(lab0);
    expect(todo.length).toBe(L.fulcrumRange(lab0).max + 1);
    let a = lab0;
    for (const j of todo) a = L.applySweep(a, j);
    expect(L.untriedSweep(a)).toEqual([]);
    expect(a.done.mean).toBe(true);
    expect(a.trials.filter((t) => t.stage === 'mean')).toHaveLength(todo.length);
    // même état que la main
    expect(L.setFulcrum(lab0, todo[3]).trials[0]).toEqual(L.applySweep(lab0, todo[3]).trials[0]);
    // median (étape suivante)
    let b = L.goStage(a, 1);
    expect(L.stageOf(b)).toBe('median');
    const cs = L.untriedSweep(b);
    expect(cs).toHaveLength(2 * b.N + 1);
    for (const c of cs) b = L.applySweep(b, c);
    expect(b.done.median).toBe(true);
    expect(L.untriedSweep(b)).toEqual([]);
    // range : pas de balayage
    expect(L.untriedSweep(L.init({ series: '40|35|34|36|48', mode: 'range' }))).toEqual([]);
  });
  it('le départ par défaut de l’appui n’est pas la moyenne et rien n’est enregistré', () => {
    const lab = L.init({ series: '40|35|34|36|48|38|39|41|37|45', mode: 'mean' });
    expect(L.same(L.fulcrumAt(lab, lab.fulcrumJ), L.mean(lab))).toBe(false);
    expect(lab.trials).toHaveLength(0);
  });
});
