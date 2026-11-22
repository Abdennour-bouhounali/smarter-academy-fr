import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import * as S from '@smarter-academy/core/arithmetic/statistics.js';
import '../../../../../../i18n';
import StatBalance from '../../../../../common/manipulations/stats/StatBalance';
import ManipulationWorkspace from '../../../../../common/manipulations/ManipulationWorkspace';
import * as L from '../../../../../common/manipulations/logic/statBalance';
import { LAB, SITUATION, SCHOOL_GAMES, TEST } from './content/textbook';

/**
 * Le laboratoire du module 7 de la synthèse (stat-balance, réutilisé de « مدى ووسيط ومتوسط سلسلة إحصائية »,
 * mode `hidden`, monde `medals`) rendu avec EXACTEMENT les props que le module étale (content/textbook.js ›
 * LAB), dans le workspace à deux niveaux ouvert sur متقدم — puis la mathématique que les modules 7 et 8
 * supposent, recalculée avec packages/core (statistics.js) et posée par la main dans la logique du lab.
 */
const num = (f) => Number(f.n) / Number(f.d);
const workspace = () => (
  <ManipulationWorkspace
    defaultLevel="advanced"
    levels={{
      beginner: () => <StatBalance level="beginner" {...LAB.beginner} />,
      advanced: () => <StatBalance level="advanced" {...LAB.advanced} />,
    }}
  />
);
/** Les valeurs d'un tableau dont les cases cachées reçoivent `fill` (dans l'ordre). */
const filled = (values, fill) => { let k = 0; return values.map((v) => (v == null ? fill[k++] : v)); };
/** La seule valeur entière de [lo, hi] qui donne la médiane cible (les autres cachées fixées). */
const solveMedian = ({ values, counts, hidden, median }, h, others) => {
  const ok = [];
  for (let v = hidden[h].lo; v <= hidden[h].hi; v += 1) {
    const fill = others.slice(); fill[h] = v;
    if (num(S.median(filled(values, fill), counts)) === median) ok.push(v);
  }
  return ok;
};

it('les deux niveaux se rendent dans le workspace, monde « medals », mode hidden, sans clé i18n brute', () => {
  const html = renderToString(workspace());
  expect((html.match(/data-stat-balance/g) ?? []).length).toBeGreaterThanOrEqual(2);
  expect((html.match(/data-sb-glance/g) ?? []).length).toBeGreaterThanOrEqual(2);
  expect((html.match(/data-theme="medals"/g) ?? []).length).toBeGreaterThanOrEqual(2);
  expect((html.match(/data-stage="hidden"/g) ?? []).length).toBeGreaterThanOrEqual(2);
  // 30 jetons au manuel + 10 aux jeux scolaires
  expect((html.match(/data-sb-token=/g) ?? []).length).toBe(40);
  expect(html).toContain('data-sb-handle="hole-0"');
  expect(html).toContain('data-sb-handle="hole-1"');
  expect(html).toContain('عدد الميداليات الذهبية لكل دولة');
  expect(html).not.toMatch(/manipulation\.[a-zA-Z]+\.[a-zA-Z]/);
  expect(html).not.toContain('NaN');
});

it('les props du LAB sont celles de la situation (aucune valeur cachée retapée)', () => {
  const series = (n) => n.values.map((v, i) => `${v ?? '?'}:${n.counts[i]}`).join('|');
  expect(LAB.advanced.series).toBe(series(SITUATION.numbers));
  expect(LAB.beginner.series).toBe(series(SCHOOL_GAMES.numbers));
  const holes = (n) => n.hidden.map((h) => `${h.index}:${h.lo}-${h.hi}`).join('|');
  expect(LAB.advanced.hidden).toBe(holes(SITUATION.numbers));
  expect(LAB.beginner.hidden).toBe(holes(SCHOOL_GAMES.numbers));
  expect(Number(LAB.advanced.targetMean)).toBe(SITUATION.numbers.mean);
  expect(Number(LAB.advanced.targetMedian)).toBe(SITUATION.numbers.median);
});

it('la situation du manuel : la main pose 3 puis 28, et le lab dit « trouvé » ; 13 pays sans or', () => {
  const n = SITUATION.numbers;
  expect(S.total(n.counts)).toBe(30);
  // la médiane donne la première valeur, unique entre 2 et 4 (la seconde n'y change rien)
  expect(solveMedian(n, 0, [2, 26])).toEqual([3]);
  expect(solveMedian(n, 0, [2, 32])).toEqual([3]);
  // la moyenne donne la seconde
  const y = num(S.solveValueForMean(filled(n.values, [3, 0]), n.counts, n.mean, 12));
  expect(y).toBe(28);
  expect(num(S.weightedSum(filled(n.values, [0, 0]), n.counts))).toBe(176);
  expect(num(S.mean(filled(n.values, [3, 28]), n.counts))).toBe(7);
  // dans la logique du laboratoire, avec les props du module
  let lab = L.init(LAB.advanced);
  lab = L.placeHole(lab, 0, L.holeAt(lab, 0, 1));
  expect(L.hiddenStatus(lab).medianOk).toBe(true);
  lab = L.placeHole(lab, 1, L.holeAt(lab, 1, 2));
  const st = L.hiddenStatus(lab);
  expect(st.medianOk && st.meanOk).toBe(true);
  expect(lab.last.kind).toBe('found');
  // un jeton hors de ses bornes est refusé
  expect(L.placeHole(L.init(LAB.advanced), 0, L.holeAt(lab, 0, 5)).last.kind).toBe('refused');
  // 69 % : T = 30 ÷ 0,69 ≈ 43,48 → 43 ; 13 pays
  const T = 30 / 0.69;
  expect(Math.round(T)).toBe(43);
  expect(Math.round(T) - 30).toBe(13);
});

it('le niveau مبتدئ : la valeur extrême ne déplace pas la médiane, la balance la trouve (8)', () => {
  const n = SCHOOL_GAMES.numbers;
  for (let v = n.hidden[0].lo; v <= n.hidden[0].hi; v += 1) expect(num(S.median(filled(n.values, [v]), n.counts))).toBe(n.median);
  expect(num(S.solveValueForMean(filled(n.values, [0]), n.counts, n.mean, 4))).toBe(8);
  let lab = L.init(LAB.beginner);
  lab = L.placeHole(lab, 0, L.holeAt(lab, 0, 2));
  expect(lab.last.kind).toBe('found');
});

it('la sortie de « إختبار أولي » (autres nombres) : 20 pays, 4, 15, 11', () => {
  const t = TEST.numbers;
  expect(S.total(t.counts)).toBe(20);
  expect(S.cumulativeUp(t.counts).slice(0, 3)).toEqual([6, 8, 11]);
  expect(solveMedian(t, 0, [2, 12])).toEqual([4]);
  expect(num(S.weightedSum(filled(t.values, [0, 0]), t.counts))).toBe(97);
  expect(num(S.solveValueForMean(filled(t.values, [4, 0]), t.counts, t.mean, 8))).toBe(15);
  const T = 20 / 0.64;
  expect(T).toBe(31.25);
  expect(Math.round(T) - 20).toBe(11);
});
