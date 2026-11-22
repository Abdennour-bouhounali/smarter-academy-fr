import { describe, it, expect } from 'vitest';
import * as L from './sheetLab';

const EX7 = { cells: '4|10|8|4|3|2|4', ask: 'MAX-MIN|MEDIANE|MOYENNE|MODE', entry: 'type', chart: 'bars|pie|histogram' };
const typeSeries = (s, list) => list.reduce((st, v, i) => L.enter(L.setBar(L.select(st, i), String(v))), s);
const commit = (s, r, hand, formula) => L.enter(L.setBar(L.setHand(L.pickRow(s, r), r, hand), formula));

describe('sheet-lab — lire un دستور', () => {
  it('accepte les écritures du manuel (espaces compris) et les noms anglais', () => {
    for (const f of ['=MAX(A1 : G1)-MIN(A1 : G1)', '=MEDIANE(A1:G1)', '=MOYENNE(A1 :G1)', '=MODE(A1 :G1)', '=median(a1:g1)', '=AVERAGE(G1:A1)']) {
      expect(L.parseFormula(f).ok, f).toBe(true);
    }
    expect(L.classify(L.parseFormula('=MAX(A1:G1)-MIN(A1:G1)'))).toBe('range');
    expect(L.classify(L.parseFormula('=MEDIAN(A1:G1)'))).toBe('median');
    expect(L.classify(L.parseFormula('=AVERAGE(A1:G1)'))).toBe('mean');
    expect(L.classify(L.parseFormula('=MAX(A1:G1)'))).toBe('max');
    expect(L.classify(L.parseFormula('=MIN(A1:G1)-MAX(A1:G1)'))).toBe('other');
  });
  it('refuse ce que le tableur ne calcule pas, avec sa raison', () => {
    expect(L.parseFormula('MOYENNE(A1:G1)')).toMatchObject({ ok: false, reason: 'noEquals', name: 'MOYENNE' });
    expect(L.parseFormula('8')).toMatchObject({ ok: false, reason: 'typedNumber' });
    expect(L.parseFormula('٨')).toMatchObject({ ok: false, reason: 'typedNumber' });
    expect(L.parseFormula('=MOYEN(A1:G1)')).toMatchObject({ ok: false, reason: 'unknownFn', name: 'MOYEN' });
    expect(L.parseFormula('=MEAN(A1:G1)')).toMatchObject({ ok: false, reason: 'unknownFn', name: 'MEAN' });
    expect(L.parseFormula('=MOYENNE()')).toMatchObject({ ok: false, reason: 'noRange' });
    expect(L.parseFormula('=MOYENNE(A1:G2)')).toMatchObject({ ok: false, reason: 'outsideRow' });
    expect(L.parseFormula('=MOYENNE(A2)')).toMatchObject({ ok: false, reason: 'outsideRow' });
    expect(L.parseFormula('')).toMatchObject({ ok: false, reason: 'empty' });
  });
  it('MODE du tableur : la première valeur la plus fréquente, #N/A sans répétition', () => {
    const F = (a) => a.map((v) => ({ n: v, d: 1 }));
    expect(L.sheetMode(F([4, 10, 8, 4, 3, 2, 4]))).toEqual({ n: 4, d: 1 });
    expect(L.sheetMode(F([5, 3, 3, 5]))).toEqual({ n: 5, d: 1 });
    expect(L.sheetMode(F([1, 2, 3]))).toEqual({ error: '#N/A' });
  });
});

describe('sheet-lab — تمرين 7 (série corrigée 4, 10, 8, 4, 3, 2, 4)', () => {
  it('la ligne 1 se saisit cellule par cellule et refuse ce qui n’est pas un nombre', () => {
    let s = L.init(EX7);
    expect(s.values.every((v) => v == null)).toBe(true);
    expect(L.pickRow(s, 0).last.reason).toBe('enterFirst');
    s = L.enter(L.setBar(s, 'abc'));
    expect(s.last.reason).toBe('cellNumber');
    s = L.enter(L.setBar(s, '5'));
    expect(s.last).toMatchObject({ kind: 'typed', ok: false });
    expect(L.mismatched(s)).toEqual([0]);
    s = L.enter(L.setBar(L.select(s, 0), '٤'));
    expect(s.last).toMatchObject({ kind: 'typed', ok: true });
    expect(s.sel).toEqual({ a: 1, b: 1 });
    s = typeSeries(s, [4, 10, 8, 4, 3, 2, 4]);
    expect(L.entered(s)).toBe(true);
    expect(s.barTarget).toEqual({ kind: 'row', r: 0 });
  });

  it('les quatre دساتير donnent 8, 4, 5, 4 et confirment le calcul à la main', () => {
    let s = typeSeries(L.init(EX7), [4, 10, 8, 4, 3, 2, 4]);
    const lines = [['8', '=MAX(A1:G1)-MIN(A1:G1)', '8'], ['4', '=MEDIANE(A1:G1)', '4'], ['5', '=MOYENNE(A1:G1)', '5'], ['4', '=MODE(A1:G1)', '4']];
    lines.forEach(([hand, f, v], r) => {
      s = commit(s, r, hand, f);
      expect(s.last).toMatchObject({ kind: 'commit', status: 'ok', value: v, handOk: true });
    });
    expect(L.allVerified(s)).toBe(true);
    expect(s.snapshot.map(L.cellText)).toEqual(['8', '4', '5', '4']);
    expect(L.truth('range', s.values)).toEqual({ n: 8, d: 1 });
  });

  it('une plage sans G1 est calculée — et contredit le calcul à la main', () => {
    let s = typeSeries(L.init(EX7), [4, 10, 8, 4, 3, 2, 4]);
    s = commit(s, 2, '5', '=MOYENNE(A1:F1)');
    // 4 + 10 + 8 + 4 + 3 + 2 = 31, 31 / 6 ≈ 5,17
    expect(s.last).toMatchObject({ status: 'wrongRange', value: '5,17', handOk: false, missing: ['G1'] });
    expect(s.rows[2].status).toBe('wrongRange');
    s = commit(s, 0, '8', '=MAX(A1:G1)');
    expect(s.last).toMatchObject({ status: 'wrongFn', what: 'max', value: '10', handOk: false });
    s = commit(s, 1, '4', '=MOYENNE(B1:G1)');
    expect(s.last.status).toBe('wrongBoth');
  });

  it('une plage qui déborde sur des cellules vides donne le même nombre (cellules vides ignorées)', () => {
    let s = typeSeries(L.init(EX7), [4, 10, 8, 4, 3, 2, 4]);
    s = commit(s, 2, '5', '=MOYENNE(A1:H1)');
    expect(s.last).toMatchObject({ status: 'ok', value: '5' });
  });

  it('pas de دستور sans le calcul à la main ; sans « = » ; ni un nombre tapé', () => {
    let s = typeSeries(L.init(EX7), [4, 10, 8, 4, 3, 2, 4]);
    s = L.enter(L.setBar(L.pickRow(s, 0), '=MAX(A1:G1)-MIN(A1:G1)'));
    expect(s.last).toMatchObject({ kind: 'refuse', reason: 'needHand' });
    s = L.enter(L.setBar(L.setHand(s, 0, '8'), 'MAX(A1:G1)-MIN(A1:G1)'));
    expect(s.last.reason).toBe('noEquals');
    s = L.enter(L.setBar(s, '8'));
    expect(s.last.reason).toBe('typedNumber');
    expect(s.rows[0].formula).toBe(null);
  });

  it('la plage choisie à la main s’écrit dans le دستور en cours', () => {
    let s = typeSeries(L.init(EX7), [4, 10, 8, 4, 3, 2, 4]);
    s = L.insertCard(L.pickRow(s, 0), 'MAX-MIN');
    expect(s.bar).toBe('=MAX()-MIN()');
    s = L.select(s, 0, 6);
    expect(s.bar).toBe('=MAX(A1:G1)-MIN(A1:G1)');
    s = L.select(s, 6, 1);
    expect(s.bar).toBe('=MAX(B1:G1)-MIN(B1:G1)');
  });

  it('le CONTRASTE : 10 devient 40 — la moyenne bouge, la médiane reste, le calcul à la main ne bouge pas', () => {
    let s = typeSeries(L.init(EX7), [4, 10, 8, 4, 3, 2, 4]);
    [['8', '=MAX(A1:G1)-MIN(A1:G1)'], ['4', '=MEDIANE(A1:G1)'], ['5', '=MOYENNE(A1:G1)'], ['4', '=MODE(A1:G1)']].forEach(([h, f], r) => { s = commit(s, r, h, f); });
    expect(L.discoveryReady(s)).toBe(false);
    s = L.enter(L.setBar(L.select(s, 1), '40'));
    expect(s.last.kind).toBe('edit');
    expect(L.cellText(L.rowValue(s, 2))).toBe('9,29'); // 65 / 7
    expect(L.cellText(L.rowValue(s, 1))).toBe('4');
    expect(L.cellText(L.rowValue(s, 0))).toBe('38');
    expect(s.rows[2].hand).toEqual({ n: 5, d: 1 });
    expect(s.contrast).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('balayage : changer UNE cellule (0 → 40) bouge toujours la moyenne, jamais la médiane (trois 4 au centre)', () => {
    let s0 = typeSeries(L.init(EX7), [4, 10, 8, 4, 3, 2, 4]);
    [['8', '=MAX(A1:G1)-MIN(A1:G1)'], ['4', '=MEDIANE(A1:G1)'], ['5', '=MOYENNE(A1:G1)'], ['4', '=MODE(A1:G1)']].forEach(([h, f], r) => { s0 = commit(s0, r, h, f); });
    for (let i = 0; i < 7; i += 1) {
      for (let v = 0; v <= 40; v += 1) {
        const s = L.setCell(s0, i, v);
        expect(L.cellText(L.rowValue(s, 1)), `${i}:${v}`).toBe('4');
        const moved = v !== [4, 10, 8, 4, 3, 2, 4][i];
        expect(s.contrast, `${i}:${v}`).toBe(moved);
      }
    }
  });
});

describe('sheet-lab — مبتدئ : cinq valeurs, deux دساتير', () => {
  it('5, 8, 6, 9, 7 : étendue 4, moyenne 7 ; la découverte après un recalcul', () => {
    let s = L.init({ cells: '5|8|6|9|7', ask: 'MAX-MIN|MOYENNE' });
    expect(L.entered(s)).toBe(true);
    s = commit(s, 0, '4', '=MAX(A1:E1)-MIN(A1:E1)');
    expect(s.last.status).toBe('ok');
    s = commit(s, 1, '7', '=MOYENNE(A1:E1)');
    expect(s.last.status).toBe('ok');
    expect(L.discoveryReady(s)).toBe(false);
    s = L.nudge(s, 0, 5);
    expect(L.cellText(L.rowValue(s, 1))).toBe('8');
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('7 tapé pour une moyenne de 7,33 n’est pas « confirmé » ; 7,33 l’est (arrondi affiché)', () => {
    const F = (n, d = 1) => ({ n, d });
    expect(L.handMatches(F(733, 100), F(22, 3))).toBe(true);
    expect(L.handMatches(F(7), F(22, 3))).toBe(false);
    expect(L.handMatches(F(5), F(5))).toBe(true);
  });
  it('refuse une donnée de leçon fautive', () => {
    expect(() => L.init({ cells: '1|2|3', ask: 'MODE' })).toThrow();
    expect(() => L.init({ cells: '1', ask: 'MOYENNE' })).toThrow();
    expect(() => L.init({ cells: '1|2', ask: 'SOMME' })).toThrow();
    expect(() => L.init({ cells: '1|2', ask: 'MOYENNE', chart: 'line' })).toThrow();
  });
});

describe('sheet-lab — l’étape graphique', () => {
  const ready = () => {
    let s = typeSeries(L.init(EX7), [4, 10, 8, 4, 3, 2, 4]);
    [['8', '=MAX(A1:G1)-MIN(A1:G1)'], ['4', '=MEDIANE(A1:G1)'], ['5', '=MOYENNE(A1:G1)'], ['4', '=MODE(A1:G1)']].forEach(([h, f], r) => { s = commit(s, r, h, f); });
    return L.openCharts(s);
  };
  it('les trois jeux : la série du تمرين 7 (valeurs / تكرارات), les نفايات (ex-15), les فئات (ex-16)', () => {
    const s = ready();
    expect(s.stage).toBe('charts');
    expect(L.datasetOf(s, 'bars').labels).toEqual(['2', '3', '4', '8', '10']);
    expect(L.datasetOf(s, 'bars').values.map(L.cellText)).toEqual(['1', '1', '3', '1', '1']);
    expect(L.datasetOf(s, 'pie').labels).toEqual(['البلاستيك', 'الزجاج', 'الورق']);
    expect(L.datasetOf(s, 'histogram').labels).toEqual(['7 ≤ t < 8', '8 ≤ t < 9', '9 ≤ t < 10']);
  });
  it('le mauvais type est refusé avec sa raison ; le bon dessine 144°, 96°, 120°', () => {
    let s = L.pickDataset(ready(), 1);
    s = L.chooseChart(s, 'pie');
    expect(s.last.reason).toBe('noSelection');
    s = L.chartSelect(s, { c0: 0, c1: 2, r0: 0, r1: 1 });
    s = L.chooseChart(s, 'bars');
    expect(s.last).toMatchObject({ ok: false, reason: 'pie_bars' });
    s = L.chooseChart(s, 'histogram');
    expect(s.last.reason).toBe('pie_histogram');
    s = L.chooseChart(s, 'pie');
    expect(s.last.ok).toBe(true);
    expect(L.drawnData(s).angles.map(L.cellText)).toEqual(['144', '96', '120']);
  });
  it('une plage incomplète dessine un graphique FAUX : sans الورق, le plastique fait 216°', () => {
    let s = L.pickDataset(ready(), 1);
    s = L.chooseChart(L.chartSelect(s, { c0: 0, c1: 1, r0: 0, r1: 1 }), 'pie');
    expect(s.last).toMatchObject({ ok: false, reason: 'partial' });
    expect(L.drawnData(s).angles.map(L.cellText)).toEqual(['216', '144']);
    s = L.chooseChart(L.chartSelect(s, { c0: 0, c1: 2, r0: 1, r1: 1 }), 'pie');
    expect(s.last.reason).toBe('noLabels');
  });
  it('les classes vont au مدرّج, les valeurs isolées aux أعمدة ; tout fait → chartsDone', () => {
    let s = ready();
    s = L.chooseChart(L.chartSelect(L.pickDataset(s, 0), { c0: 0, c1: 4, r0: 0, r1: 1 }), 'histogram');
    expect(s.last.reason).toBe('bars_histogram');
    s = L.chooseChart(s, 'bars');
    s = L.chooseChart(L.chartSelect(L.pickDataset(s, 1), { c0: 0, c1: 2, r0: 0, r1: 1 }), 'pie');
    s = L.chooseChart(L.chartSelect(L.pickDataset(s, 2), { c0: 0, c1: 2, r0: 0, r1: 1 }), 'bars');
    expect(s.last.reason).toBe('histogram_bars');
    expect(L.chartsDone(s)).toBe(false);
    s = L.chooseChart(s, 'histogram');
    expect(L.chartsDone(s)).toBe(true);
  });
  it('la ligne 1 se replie en rangées de cellules d’au moins 44 px', () => {
    expect(L.perRow(7, 640)).toBe(7);
    expect(L.perRow(7, 160)).toBe(3);
    expect(L.perRow(5, 200)).toBe(4);
    expect(L.niceMax([6, 1, 4])).toBe(6);
    expect(L.niceMax([60, 40, 50])).toBe(60);
  });
});
