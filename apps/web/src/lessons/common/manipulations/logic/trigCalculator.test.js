import { describe, it, expect } from 'vitest';
import * as L from './trigCalculator';

/** Taper une suite de touches (« ON sin 54 = » → ['ON', 'sin', '5', '4', '=']). */
const typeKeys = (lab, seq) => seq.reduce((s, k) => L.key(s, k), lab);
const keysOf = (fn, x) => [...(fn.startsWith('a') ? ['2nd', fn.slice(1)] : [fn]), ...String(x).replace('.', ',').split(''), '='];
const deg = (lab) => (lab.calc.mode === 'DEG' ? lab : L.key(lab, 'DRG'));
/** Calculer puis arrondir comme le ferait l'élève qui sait : la bonne décision au trait demandé. */
function computeAndRound(lab, fn, x, cut) {
  let s = typeKeys(deg(lab), ['ON', ...keysOf(fn, x)]);
  s = L.setCut(s, cut);
  const { up } = L.roundingOf(Number(s.pending.screen.replace(',', '.')), cut);
  return L.decide(s, up ? 'up' : 'keep');
}

const ACT4 = { angles: [10, 20, 30, 40, 45, 60, 75], inverse: { sin: 0.52, cos: 0.25, tan: 1.33 }, digits: 2 };
// Le corrigé de نشاط 4 (extraction.json › act-4 › answer).
const TABLE = {
  10: ['0,98', '0,17', '0,18'], 20: ['0,94', '0,34', '0,36'], 30: ['0,87', '0,50', '0,58'], 40: ['0,77', '0,64', '0,84'],
  45: ['0,71', '0,71', '1,00'], 60: ['0,50', '0,87', '1,73'], 75: ['0,26', '0,97', '3,73'],
};
const INVERSE = { sin: ['31,33', '31,3', '31'], cos: ['75,52', '75,5', '76'], tan: ['53,06', '53,1', '53'] };

describe('trig-calculator — la calculatrice', () => {
  it('démarre en mode R ; ON garde le mode ; DRG bascule', () => {
    let c = L.initCalc();
    expect(c.mode).toBe('RAD');
    c = L.press(c, 'DRG');
    expect(c.mode).toBe('DEG');
    c = L.press(L.press(c, 'sin'), '3');
    expect(L.press(c, 'ON')).toMatchObject({ mode: 'DEG', fn: null, entry: '' });
  });
  it('معارف 3 مثال 1 : ON sin 54 = → 0,8090169944 ; cos 54 → 0,5877852523 ; tan 54 → 1,37638192', () => {
    const run = (k) => ['ON', k, '5', '4', '='].reduce(L.press, L.press(L.initCalc(), 'DRG')).result.screen;
    expect(run('sin')).toBe('0,8090169944');
    expect(run('cos')).toBe('0,5877852523');
    expect(run('tan')).toBe('1,37638192');
  });
  it('معارف 3 مثال 2 : ON 2nd sin⁻¹ 0,4 = → 23,57817848 ; 2nd tan⁻¹ 0,3 → 16,69924423 (le manuel imprime …453)', () => {
    const run = (k, ds) => ['ON', '2nd', k, ...ds, '='].reduce(L.press, L.press(L.initCalc(), 'DRG')).result;
    expect(run('sin', ['0', ',', '4']).screen).toBe('23,57817848');
    expect(run('tan', ['0', ',', '3']).screen).toBe('16,69924423');
    expect(L.exprText({ fn: { kind: 'sin', inverse: true }, entry: '0,4' })).toBe('sin⁻¹ 0,4');
  });
  it('2nd ne vaut que pour la touche suivante ; DEL efface ; une seule virgule ; « , » seule devient « 0, »', () => {
    let c = ['DRG', '2nd', 'sin'].reduce(L.press, L.initCalc());
    expect(c.fn).toEqual({ kind: 'sin', inverse: true });
    c = ['ON', 'cos'].reduce(L.press, c);
    expect(c.fn.inverse).toBe(false);
    c = [',', '5', ',', '2'].reduce(L.press, c);
    expect(c.entry).toBe('0,52');
    c = L.press(c, 'DEL');
    expect(c.entry).toBe('0,5');
  });
  it('sin⁻¹ 1,33 → خطأ رياضي ; tan⁻¹ 1,33 existe ; « sin = » → خطأ في الكتابة', () => {
    const base = L.press(L.initCalc(), 'DRG');
    expect(['2nd', 'sin', '1', ',', '3', '3', '='].reduce(L.press, base).result.status).toBe('error');
    expect(['2nd', 'tan', '1', ',', '3', '3', '='].reduce(L.press, base).result.status).toBe('ok');
    expect(['sin', '='].reduce(L.press, base).result.status).toBe('syntax');
  });
  it('mode R : sin 30 = −0,9880316241 (sin de 30 radians)', () => {
    expect(['sin', '3', '0', '='].reduce(L.press, L.initCalc()).result.screen).toBe('-0,9880316241');
  });
});

describe('trig-calculator — l’arrondi de l’élève', () => {
  it('le chiffre suivant le trait dit s’il faut ajouter 1, pour CHAQUE case du tableau de نشاط 4 (balayage)', () => {
    for (const a of ACT4.angles) {
      for (const k of L.KINDS) {
        const r = L.evaluate({ fn: { kind: k, inverse: false }, entry: String(a), mode: 'DEG' });
        for (let cut = 0; cut <= 3; cut += 1) {
          const { up } = L.roundingOf(Number(r.screen.replace(',', '.')), cut);
          expect(L.cutScreen(r.screen, cut).next >= 5, `${k} ${a}° coupé à ${cut}`).toBe(up);
        }
      }
    }
  });
  it('le tableau complet de نشاط 4, rempli par les gestes de l’élève, est le corrigé du manuel', () => {
    let lab = L.initLab(ACT4);
    for (const a of ACT4.angles) L.KINDS.forEach((k) => { lab = computeAndRound(lab, k, a, 2); });
    for (const a of ACT4.angles) L.KINDS.forEach((k, i) => expect(L.cellOf(lab, a, k).rounded, `${k} ${a}`).toBe(TABLE[a][i]));
    expect(L.cellCount(lab)).toBe(21);
  });
  it('la troncature est REFUSÉE (sin 54 coupé au centième : garder 0,80 alors que le 9 suit) ; l’excès aussi', () => {
    let lab = L.initLab({ angles: [54, 45], digits: 2 });
    lab = L.setCut(typeKeys(lab, ['DRG', 'sin', '5', '4', '=']), 2);
    let r = L.decide(lab, 'keep');
    expect(r.last).toMatchObject({ kind: 'truncate', truncated: '0,80', rounded: '0,81', next: 9 });
    expect(L.cellCount(r)).toBe(0);
    r = L.decide(r, 'up');
    expect(L.cellOf(r, 54, 'sin').rounded).toBe('0,81');
    lab = L.setCut(typeKeys(r, ['ON', 'cos', '5', '4', '=']), 2); // 0,5877… : 7 → +1 ; coupé à 1 : 8 → +1
    lab = L.setCut(typeKeys(r, ['ON', 'tan', '4', '5', '=']), 2); // 1 → 1,00 : garder
    expect(L.decide(lab, 'up').last).toMatchObject({ kind: 'overRound', next: 0 });
    expect(L.cellOf(L.decide(lab, 'keep'), 45, 'tan').rounded).toBe('1,00');
  });
  it('le trait ailleurs que la précision demandée est refusé (le tableau veut le centième)', () => {
    const lab = L.setCut(typeKeys(L.initLab({ angles: [30], digits: 2 }), ['DRG', 'cos', '3', '0', '=']), 1);
    expect(L.decide(lab, 'keep').last).toMatchObject({ kind: 'precision', need: [2] });
    expect(L.decide({ ...lab, cut: null }, 'keep').last.kind).toBe('noCut');
  });
});

describe('trig-calculator — ce que la mathématique refuse', () => {
  it('mode R : sin 30 refusé, la nacelle (30°) dessine 0,5 et l’écran prétend −0,988', () => {
    const lab = typeKeys(L.initLab({ angles: [30, 45, 60] }), ['sin', '3', '0', '=']);
    expect(lab.last).toMatchObject({ kind: 'rad', screen: '-0,9880316241', expectedScreen: '0,5' });
    expect(lab.pending).toBe(null);
    expect(lab.trials.at(-1)).toMatchObject({ type: 'refused', reason: 'rad' });
    const sc = L.sceneOf(lab);
    expect(sc).toMatchObject({ angle: 30, kind: 'sin', agrees: false });
    expect(sc.drawn).toBeCloseTo(0.5, 12);
  });
  it('mode D : la nacelle et l’écran disent la même chose', () => {
    const lab = typeKeys(L.initLab({ angles: [30, 45, 60] }), ['DRG', 'cos', '4', '5', '=']);
    expect(lab.last.kind).toBe('toRound');
    expect(L.sceneOf(lab)).toMatchObject({ angle: 45, kind: 'cos', agrees: true });
  });
  it('dans le tableau : un angle hors du tableau se lit sans s’écrire ; une touche inverse n’est pas une case', () => {
    let lab = typeKeys(L.initLab({ angles: [30, 45, 60] }), ['DRG', 'sin', '5', '4', '=']);
    expect(lab.last.kind).toBe('offTable');
    lab = typeKeys(lab, ['ON', '2nd', 'sin', '0', ',', '5', '=']);
    expect(lab.last.kind).toBe('angleInTable');
  });
  it('étape inverse : oublier 2nd (sin 0,52 = 0,009…), la mauvaise fonction, le mode R, l’impossible', () => {
    let lab = L.initLab(ACT4);
    for (const k of L.KINDS) lab = computeAndRound(lab, k, 30, 2);
    expect(L.tableReady(lab)).toBe(true);
    lab = L.openInverse(lab);
    expect(lab.stage).toBe('inverse');
    let r = typeKeys(lab, ['ON', 'sin', '0', ',', '5', '2', '=']);
    expect(r.last).toMatchObject({ kind: 'forgot2nd', screen: '0,009075587519' });
    expect(L.sceneOf(r)).toMatchObject({ angle: 0.52, agrees: true, target: { kind: 'sin', value: 0.52 } });
    r = typeKeys(lab, ['ON', '2nd', 'cos', '0', ',', '5', '2', '=']);
    expect(r.last).toMatchObject({ kind: 'wrongKind', task: { kind: 'sin' } });
    r = typeKeys(lab, ['ON', '2nd', 'sin', '1', ',', '3', '3', '=']);
    expect(r.last.kind).toBe('domain');
    r = typeKeys(L.key(lab, 'DRG'), ['ON', '2nd', 'sin', '0', ',', '5', '2', '=']);
    expect(r.last).toMatchObject({ kind: 'radInverse', screen: '0,5468509507', expectedScreen: '31,3322515' });
    expect(L.sceneOf(r).agrees).toBe(false);
  });
  it('étape inverse : les trois angles aux trois précisions = le corrigé du manuel ; l’aller-retour sin 31,33 ≈ 0,52', () => {
    let lab = L.initLab(ACT4);
    for (const k of L.KINDS) lab = computeAndRound(lab, k, 30, 2);
    lab = L.openInverse(lab);
    for (const k of ['sin', 'cos', 'tan']) {
      lab = typeKeys(lab, ['ON', ...keysOf(`a${k}`, ACT4.inverse[k])]);
      for (const cut of L.PRECISIONS) {
        lab = L.setCut(lab, cut);
        const { up } = L.roundingOf(Number(lab.pending.screen.replace(',', '.')), cut);
        lab = L.decide(lab, up ? 'up' : 'keep');
      }
      expect([lab.inv[k][2], lab.inv[k][1], lab.inv[k][0]], k).toEqual(INVERSE[k]);
    }
    expect(L.discoveryReady(lab)).toBe(true);
    const back = typeKeys(lab, ['ON', 'sin', '3', '1', ',', '3', '3', '=']);
    expect(back.last.kind).toBe('roundTrip');
  });
});

describe('trig-calculator — étapes et découverte', () => {
  it('le tableau n’est accompli qu’avec cos, sin ET tan, après avoir quitté le mode R', () => {
    let lab = L.initLab({ angles: [30, 45, 60], digits: 2 });
    lab = computeAndRound(lab, 'sin', 30, 2);
    lab = computeAndRound(lab, 'sin', 45, 2);
    lab = computeAndRound(lab, 'sin', 60, 2);
    expect(L.tableReady(lab)).toBe(false);
    lab = computeAndRound(lab, 'cos', 30, 2);
    lab = computeAndRound(lab, 'tan', 30, 2);
    expect(L.tableReady(lab)).toBe(true);
    expect(L.discoveryReady(lab)).toBe(true); // مبتدئ : pas d'étape inverse
    expect(L.tableReady({ ...lab, modeChanged: false })).toBe(false);
  });
  it('متقدم : l’étape des angles ne s’ouvre qu’après le tableau, et garde les deux états', () => {
    let lab = L.initLab(ACT4);
    expect(L.openInverse(lab).stage).toBe('table');
    for (const k of L.KINDS) lab = computeAndRound(lab, k, 40, 2);
    lab = L.openInverse(lab);
    lab = typeKeys(lab, ['ON', '2nd', 'sin', '0', ',', '5', '2', '=']);
    lab = L.decide(L.setCut(lab, 0), 'keep');
    expect(L.taskDone(lab, 'sin')).toBe(1);
    expect(L.discoveryReady(lab)).toBe(false);
    const t = L.backToTable(lab);
    expect(t.stage).toBe('table');
    expect(L.cellCount(t)).toBe(3);
    expect(L.taskDone(L.openInverse(t), 'sin')).toBe(1);
  });
  it('les essais (acceptés et refusés) sont numérotés pour la liste de l’élève', () => {
    let lab = typeKeys(L.initLab({ angles: [30] }), ['sin', '3', '0', '=']);
    lab = computeAndRound(lab, 'sin', 30, 2);
    expect(lab.trials.map((t) => [t.n, t.type])).toEqual([[1, 'refused'], [2, 'cell']]);
    expect(L.evidenceOf(lab).cells).toEqual([{ angle: 30, kind: 'sin', rounded: '0,50', screen: '0,5' }]);
  });
});

describe('trig-calculator — le clavier', () => {
  it('porte EXACTEMENT 19 touches, sans case occupée deux fois', () => {
    for (const rows of [L.KEY_ROWS]) {
      const g = L.keyGrid(rows);
      expect(g.map((k) => k.key).sort()).toEqual(L.KEY_ROWS.flat().sort());
      expect(g).toHaveLength(19);
      const cells = new Set();
      for (const k of g) for (let r = k.row; r < k.row + k.span; r += 1) { const id = `${r}|${k.col}`; expect(cells.has(id), id).toBe(false); cells.add(id); }
    }
  });
});

describe('trig-calculator — la scène du drone (balayage)', () => {
  it('le drone, sa cible et son pied restent dans le cadre pour tout angle et toute taille', () => {
    for (const [w, h] of [[240, 110], [300, 140], [420, 200], [640, 300]]) {
      for (let a = 0; a <= 90; a += 0.5) {
        const g = L.droneGeometry(a, { width: w, height: h });
        for (const [x, y] of [g.T, g.D, g.H]) {
          expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThanOrEqual(w);
          expect(y).toBeGreaterThanOrEqual(0); expect(y).toBeLessThanOrEqual(h);
        }
        expect(Math.hypot(g.D[0] - g.T[0], g.D[1] - g.T[1])).toBeCloseTo(g.L, 9);
      }
    }
  });
});
