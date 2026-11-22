import { describe, it, expect } from 'vitest';
import * as DE from './divisorExplorer';
import * as FP from './factorPairs';
import * as DP from './divisorProperties';
import * as CD from './commonDivisors';
import * as AL from './algorithms';
import * as CP from './coprime';
import * as FR from './fraction';
import * as TB from './teamBuilder';
import { plausibleChoices } from '../useManipulation';

/* Les nombres sont ceux du manuel (§29) : 420/26/28, 60, 105, 18-12-3,
   90/54, 42/60, 252/140, 765/135, 1938/836, 17/18, 27/36, 84/48, 595/560. */

/* `divisor-explorer` est le type SHELL de la division, enregistré mais posé par
   aucune leçon aujourd'hui. Ce bloc ne teste QUE sa logique : le laboratoire
   des livres de la leçon 1 (`divisor-explorer-books`) a sa propre logique,
   `logic/bookshelf.js`, testée plus bas (bookshelf.test.js). L'ancien titre
   « 420 livres » faisait croire que ce bloc couvrait le laboratoire réel. */
describe('divisor-explorer (logique du type shell, sans leçon)', () => {
  it('poser 26 laisse 4 livres, poser 28 range tout — le verdict EST le reste', () => {
    let s = DE.init({ a: 420 });
    s = DE.place(s, 26);
    expect([s.q, s.r, s.divides]).toEqual([16, 4, false]);
    s = DE.place(s, 28);
    expect([s.q, s.r, s.divides]).toEqual([15, 0, true]);
    expect(DE.summary(s)).toEqual({ yes: [28], no: [26] });
  });
  it('la découverte attend un reste nul ET un reste non nul', () => {
    let s = DE.place(DE.init({ a: 420 }), 28);
    expect(DE.discoveryReady(s)).toBe(false);
    s = DE.place(s, 26);
    expect(DE.discoveryReady(s)).toBe(true);
  });
  it('refuse une taille plus grande que le stock ou non naturelle', () => {
    const s = DE.init({ a: 420 });
    expect(DE.canPlace(s, 421)).toBe('largerThanA');
    expect(DE.canPlace(s, 0)).toBe('notNatural');
    expect(DE.place(s, 421)).toBe(s);
  });
});

describe('factor-pairs (60 et 105)', () => {
  it('60 en 4 colonnes : rectangle parfait, couple 4 × 15', () => {
    const s = FP.test(FP.init({ n: 60 }), 4);
    expect([s.rows, s.rest]).toEqual([15, 0]);
    expect(s.pairs.map((p) => p.key)).toEqual(['4x15']);
  });
  it('60 en 7 colonnes : dernière ligne incomplète, aucun couple', () => {
    const s = FP.test(FP.init({ n: 60 }), 7);
    expect(s.rest).toBe(4);
    expect(s.pairs).toEqual([]);
  });
  it('au-delà de √105 = 10, tester 15 REDONNE le couple 7 × 15 : la règle d’arrêt se voit', () => {
    let s = FP.init({ n: 105 });
    for (const d of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) s = FP.test(s, d);
    expect(FP.complete(s)).toBe(true);
    expect(FP.discoveryReady(s)).toBe(false);
    s = FP.test(s, 15);
    expect(s.tested.find((t) => t.d === 15)).toMatchObject({ divides: true, repeat: true, beyondBound: true });
    expect(FP.discoveryReady(s)).toBe(true);
    expect(FP.foundDivisors(s)).toEqual([1, 3, 5, 7, 15, 21, 35, 105]);
    expect(FP.foundDivisors(s)).toEqual(FP.allDivisors(s));
  });
  it('« tourné » ne dépend pas de l’ordre des essais (24 : 8, 6, 5, 7 PUIS 1…4)', () => {
    let s = FP.init({ n: 24 });
    for (const d of [8, 6, 5, 7, 1, 2, 3, 4]) s = FP.test(s, d);
    const at = (d) => s.tested.find((t) => t.d === d);
    expect(at(3).repeat).toBe(false);        // 3 × 8 : debout, pas un doublon
    expect(at(4).repeat).toBe(false);
    expect(at(8).repeat).toBe(true);         // 8 × 3 : le même, couché
    expect(at(6).repeat).toBe(true);
    expect(s.pairs.map((p) => p.key)).toEqual(['1x24', '2x12', '3x8', '4x6']);
    expect(FP.discoveryReady(s)).toBe(true);
  });
  it('la réglette va jusqu’au premier diviseur au-delà de √n, sans jamais aller jusqu’à n', () => {
    expect(FP.widthRange(60)).toEqual({ min: 1, max: 14 });
    expect(FP.widthRange(105)).toEqual({ min: 1, max: 20 });
    expect(FP.widthRange(24)).toEqual({ min: 1, max: 8 });
    expect(FP.widthRange(7)).toEqual({ min: 1, max: 7 });   // un nombre premier : 7 lui-même
  });
  it('le rectangle tient dans son cadre pour toute largeur, et devient carré en √n', () => {
    for (const n of [24, 48, 60, 105]) {
      const { max } = FP.widthRange(n);
      for (let d = 1; d <= max; d += 1) {
        const L = FP.rectangleLayout({ n, d, box: 240 });
        expect(L.width, `${n}/${d}`).toBeLessThanOrEqual(240.001);
        expect(L.height, `${n}/${d}`).toBeLessThanOrEqual(240.001);
        expect(L.rows * d + L.rest, `${n}/${d}`).toBe(n);
      }
    }
    expect(FP.rectangleLayout({ n: 36, d: 6, box: 240 }).square).toBe(true);
  });
});

describe('divisor-properties (n = 3, a = 18, b = 12)', () => {
  const s0 = DP.init({ n: 3, a: 18, b: 12 });
  it('a + b, a − b et le reste sont des nombres entiers de blocs de 3', () => {
    expect(DP.blocks(s0, 'sum')).toMatchObject({ value: 30, count: 10 });
    expect(DP.blocks(s0, 'diff')).toMatchObject({ value: 6, count: 2 });
    expect(DP.blocks(s0, 'rem')).toMatchObject({ value: 6, count: 2 });
  });
  it('les trois constructions déclenchent la découverte ; une seconde fois est refusée', () => {
    let s = DP.build(DP.build(s0, 'sum'), 'diff');
    expect(DP.discoveryReady(s)).toBe(false);
    expect(DP.canBuild(s, 'sum')).toBe('alreadyBuilt');
    s = DP.build(s, 'rem');
    expect(DP.discoveryReady(s)).toBe(true);
  });
  it('au niveau متقدم, on PRÉDIT avant de bâtir ; le mur confirme (toujours des briques entières)', () => {
    let s = DP.init({ n: 9, a: 900, b: 90 });
    expect(DP.canBuild(s, 'sum', { requirePrediction: true })).toBe('predictFirst');
    s = DP.predict(s, 'sum', 'partial');
    expect(DP.canBuild(s, 'sum', { requirePrediction: true })).toBe(true);
    s = DP.build(s, 'sum');
    expect(DP.outcome(s, 'sum')).toBe('whole');           // la prédiction « partiel » est réfutée
    expect(DP.predict(s, 'sum', 'whole')).toBe(s);          // on ne réécrit pas une prédiction après coup
    for (const t of DP.TARGETS) expect(DP.outcome(DP.init({ n: 7, a: 56, b: 21 }), t)).toBe('whole');
  });
});

describe('common-divisors', () => {
  it('bouquets 90/54 : 9 bouquets marchent (10 rouges, 6 blanches), 7 non', () => {
    let s = CD.choose(CD.initBouquets({ a: 90, b: 54 }), 9);
    expect([s.qa, s.qb, s.works]).toEqual([10, 6, true]);
    s = CD.choose(s, 7);
    expect(s.works).toBe(false);
    expect(s.tried).toEqual({ 9: 'common', 7: 'no' });
    s = CD.choose(s, 5);
    expect(s.tried[5]).toBe('single');
    expect(CD.greatestGroupFound(s)).toBe(false);
    s = CD.choose(s, 18);
    // 18 marche, mais « le plus grand » n'est pas encore montré : rien au-delà.
    expect(CD.greatestGroupFound(s)).toBe(false);
    s = CD.choose(s, 19);
    expect(CD.greatestGroupFound(s)).toBe(true);
  });
  it('12/18 : le plus grand (6) ne suffit pas seul — il faut avoir vu 7 échouer', () => {
    let s = CD.initBouquets({ a: 12, b: 18 });
    for (const k of [2, 5, 3]) s = CD.choose(s, k);
    expect(CD.greatestGroupFound(s)).toBe(false);
    s = CD.choose(s, 6);
    expect(CD.greatestGroupFound(s)).toBe(false);
    s = CD.choose(s, 7);
    expect(CD.greatestGroupFound(s)).toBe(true);
  });
  it('le geste : on AJOUTE un groupe à la fois, et le motif se construit (1 ✓ 2 ✓ 3 ✓ 4 ✗ 5 ✗ 6 ✓ 7 ✗)', () => {
    let s = CD.initBouquets({ a: 12, b: 18 });
    for (let i = 0; i < 7; i += 1) s = CD.addGroup(s);
    expect(s.k).toBe(7);
    expect(s.tried).toEqual({ 1: 'common', 2: 'common', 3: 'common', 4: 'single', 5: 'no', 6: 'common', 7: 'no' });
    expect(CD.greatestGroupFound(s)).toBe(true);
    s = CD.removeGroup(s);
    expect([s.k, s.qa, s.qb, s.works]).toEqual([6, 2, 3, true]);
    let z = CD.addGroup(CD.initBouquets({ a: 12, b: 18 }));
    z = CD.removeGroup(z);
    expect(z.k).toBeNull();                              // retour aux deux piles
    expect(CD.removeGroup(z)).toBe(z);
    let top = CD.choose(CD.initBouquets({ a: 12, b: 18 }), 12);
    expect(CD.addGroup(top)).toBe(top);                  // pas plus de groupes que d'objets
  });
  it('listes 42/60 : seuls 1, 2, 3, 6 vont au milieu ; 6 seul va dans PGCD, et seulement à la fin', () => {
    let s = CD.initLists({ a: 42, b: 60 });
    expect(s.common).toEqual([1, 2, 3, 6]);
    expect(CD.canPlaceCommon(s, 7)).toBe('dividesOnlyA');
    expect(CD.canPlaceCommon(s, 5)).toBe('dividesOnlyB');
    expect(CD.canPlacePgcd(s, 6)).toBe('notAllCommon');
    // Un nombre qui n'est pas commun reçoit SA raison, pas « complète d'abord ».
    expect(CD.canPlacePgcd(s, 7)).toBe('notCommon');
    for (const d of [1, 2, 3]) s = CD.placeCommon(s, d);
    expect(CD.allCommonPlaced(s)).toBe(false);
    s = CD.placeCommon(s, 6);
    expect(CD.canPlacePgcd(s, 3)).toBe('notGreatest');
    s = CD.placePgcd(s, 6);
    expect(CD.listsDiscoveryReady(s)).toBe(true);
    expect(s.pgcd).toBe(6);
  });
});

describe('pgcd-differences (252 et 140)', () => {
  it('seul « le petit sur le grand » soustrait ; la chaîne va jusqu’au fruit nul ; PGCD = 28', () => {
    let s = AL.initDifferences({ a: 252, b: 140 });
    expect(AL.canSubtract(s, 'big', 'small')).toBe('bigOnSmall');
    expect(AL.canSubtract(s, 'small', 'big')).toBe(true);
    expect(AL.currentPair(s)).toEqual({ big: 252, small: 140 });
    s = AL.subtract(s);
    expect(AL.currentPair(s)).toEqual({ big: 140, small: 112 });
    while (!AL.isDifferencesFinished(s)) s = AL.subtract(s);
    expect(s.steps[s.steps.length - 1].diff).toBe(0);
    expect(AL.lastNonZeroDiff(s)).toBe(28);
    // La case refuse AVEC DES MATHÉMATIQUES : 56 ne divise pas 252, 84 ne divise pas 140.
    expect(AL.canPlaceDifferencePgcd(s, 56)).toBe('notDividesA');
    expect(AL.canPlaceDifferencePgcd(s, 84)).toBe('notDividesB');
    expect(AL.canPlaceDifferencePgcd(s, 14)).toBe('notGreatest');
    expect(AL.canPlaceDifferencePgcd(s, 28)).toBe(true);
    expect(AL.canSubtract(s, 'small', 'big')).toBe('finished');
  });
});

describe('euclidean-algorithm (1938 et 836, 765 et 135)', () => {
  it('deux copies de 836 tiennent dans 1938, la troisième déborde ; le reste 266 passe à la ligne suivante', () => {
    let s = AL.initEuclid({ a: 1938, b: 836 });
    s = AL.addCopy(s); s = AL.addCopy(s);
    expect(AL.canAddCopy(s)).toBe('overflow');
    expect(AL.quotientReached(s)).toBe(true);
    expect(AL.remainderOf(s)).toBe(266);
    // Le reste ne se porte qu'après avoir ESSAYÉ la copie de trop : l'élève
    // rencontre le débordement, la scène ne l'annonce pas.
    expect(AL.canCarryRemainder(s, 266)).toBe('tryOneMore');
    const tried = AL.tryCopy(s);
    expect([tried.copies, tried.overflowSeen]).toEqual([2, true]);
    s = tried;
    expect(AL.canCarryRemainder(s, 266)).toBe(true);
    s = AL.carryRemainder(s);
    expect(AL.currentDivision(s)).toMatchObject({ a: 836, b: 266, q: 3, r: 38 });
  });
  it('le geste canonique termine la chaîne : 3 divisions pour 765/135 contre 8 différences', () => {
    let s = AL.initEuclid({ a: 765, b: 135 });
    let guard = 0;
    while (!AL.isEuclidFinished(s) && guard++ < 20) s = AL.euclidAutoStep(s);
    expect(AL.isEuclidFinished(s)).toBe(true);
    expect(s.gcd).toBe(45);
    expect(AL.canPlaceEuclidPgcd(s, 45)).toBe(true);
    expect(AL.canPlaceEuclidPgcd(s, 90)).toBe('notDividesA');   // 90 ne divise pas 765
    expect(AL.comparison(765, 135)).toEqual({ differences: 8, divisions: 3 });
  });
});

describe('coprime-explorer (17/18 et 27/36)', () => {
  it('17 et 18 : seul 1 va dans la zone partagée', () => {
    let s = CP.init({ a: 17, b: 18 });
    expect(CP.canShare(s, CP.chipId('a', 17))).toBe('dividesOnlyA');
    s = CP.share(s, CP.chipId('a', 1));
    expect(CP.verdict(s)).toBe('coprime');
  });
  it('27 et 36 : 3 et 9 sont communs, مريم a tort', () => {
    let s = CP.init({ a: 27, b: 36 });
    s = CP.share(s, CP.chipId('a', 1));
    expect(CP.verdict(s)).toBe('missing');
    s = CP.share(s, CP.chipId('b', 3)); s = CP.share(s, CP.chipId('a', 9));
    expect(CP.verdict(s)).toBe('notCoprime');
    expect(s.g).toBe(9);
    expect(CP.canShare(s, CP.chipId('b', 4))).toBe('dividesOnlyB');
  });
  it('premiers entre eux : poser 1 ne CONCLUT pas — chaque diviseur de 17 doit être confronté à 18', () => {
    let s = CP.share(CP.init({ a: 17, b: 18 }), CP.chipId('a', 1));
    expect(CP.listsConclusive(s)).toBe(false);
    expect(CP.untested(s)).toEqual([17]);
    s = CP.share(s, CP.chipId('a', 17));            // refusé, mais testé
    expect(s.shared).toEqual([1]);
    expect(CP.listsConclusive(s)).toBe(true);
  });
  it('pas premiers entre eux : UN commun > 1 suffit à réfuter (méthode du manuel contre مريم)', () => {
    let s = CP.init({ a: 27, b: 36 });
    expect(CP.listsConclusive(s)).toBe(false);
    s = CP.share(s, CP.chipId('a', 3));
    expect(CP.listsConclusive(s)).toBe(true);
  });
  it('les trousses : « seul 1 marche » n’est affirmé qu’après avoir essayé 2 … 17', () => {
    let g = CP.initGroups({ a: 17, b: 18 });
    for (let i = 0; i < 3; i += 1) g = CP.addGroupTo(g);
    expect(CP.groupsInsightReady(g)).toBe(false);   // 1, 2, 3 : trop tôt pour conclure
    for (let i = 3; i < 17; i += 1) g = CP.addGroupTo(g);
    expect(g.k).toBe(17);
    expect(CP.groupsInsightReady(g)).toBe(true);
    expect(CP.workingCounts(g)).toEqual([1]);
    let h = CP.initGroups({ a: 27, b: 36 });
    for (let i = 0; i < 3; i += 1) h = CP.addGroupTo(h);
    expect(CP.groupsInsightReady(h)).toBe(true);    // 3 marche : réfuté sans aller plus loin
  });
});

describe('fraction-reduction (84/48 et 595/560)', () => {
  it('le chemin de سمير : ÷4 puis ÷3 → 7/4, puis le PGCD 12 en une fois', () => {
    let s = FR.init({ n: 84, d: 48 });
    expect(FR.railA(s)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);   // pas seulement les bons
    expect(FR.canReduceA(s, 5)).toBe('dividesNeither');
    expect(FR.canReduceA(s, 7)).toBe('dividesOnlyNumerator');           // l'erreur classique, expliquée
    expect(FR.canReduceB(s, 12)).toBe('pathANotFinished');
    s = FR.reduceA(s, 4);
    expect(FR.currentA(s)).toEqual({ n: 21, d: 12 });
    expect(FR.canReduceA(s, 4)).toBe('dividesOnlyDenominator');
    expect(FR.canClaimIrreducible(s)).toBe('stillReducible');           // 21/12 : 3 divise encore les deux
    s = FR.reduceA(s, 3);
    expect(FR.currentA(s)).toEqual({ n: 7, d: 4 });
    expect(FR.pathAFinished(s)).toBe(false);                            // c'est l'élève qui décide de s'arrêter
    s = FR.claimIrreducible(s);
    expect(FR.pathAFinished(s)).toBe(true);
    expect(FR.canReduceB(s, 4)).toBe('notPgcd');
    expect(FR.oneStepWith(s, 4)).toEqual({ n: 21, d: 12 });            // la conséquence montrée au refus
    expect(FR.canReduceB(s, 5)).toBe('dividesNeither');
    s = FR.reduceB(s, 12);
    expect(FR.discoveryReady(s)).toBe(true);
    expect(FR.chainA(s).map((c) => `${c.n}/${c.d}`)).toEqual(['84/48', '21/12', '7/4']);
    expect(FR.pathComparison(s)).toEqual({ stepsA: 2, stepsB: 1, equal: false });
  });
  it('par 12 dès le chemin أ : un pas de chaque côté — « متساويان » est alors la vraie réponse', () => {
    let s = FR.claimIrreducible(FR.reduceA(FR.init({ n: 84, d: 48 }), 12));
    expect(FR.pathAFinished(s)).toBe(true);
    s = FR.reduceB(s, 12);
    expect(FR.pathComparison(s).equal).toBe(true);
    expect(FR.railB(FR.init({ n: 595, d: 560 }))).toContain(35);         // le PGCD au-delà de 12 est proposé
  });
  it('595/560 : PGCD 35, forme irréductible 17/16', () => {
    const s = FR.init({ n: 595, d: 560 });
    expect(s.gcd).toBe(35);
    expect(s.final).toEqual({ n: 17, d: 16 });
  });
});

describe('propositions', () => {
  it('plausibleChoices est déterministe, sans doublon, et contient la bonne réponse', () => {
    const c = plausibleChoices(112, [392, 28, 113]);
    expect(c).toHaveLength(3);
    expect(new Set(c).size).toBe(3);
    expect(c).toContain(112);
    expect(plausibleChoices(112, [392, 28, 113])).toEqual(c);
  });
});

/* ── team-builder — le partage équitable rendu physique (15 et 16 joueurs) ──
   Le contexte est de la plateforme (act-1, réhabillé) ; la mathématique est
   celle du manuel : a = b × q + r, et le reste est un nombre d'objets. */
describe('team-builder (15 et 16 joueurs, 3 équipes)', () => {
  it('15 joueurs en 3 équipes : tout le monde joue, 5 par équipe', () => {
    let s = TB.init({ total: 15, groups: 3 });
    s = TB.fill(s);
    expect(s.teams.map((t) => t.length)).toEqual([5, 5, 5]);
    expect(s.bench).toEqual([]);
    const v = TB.verdict(s);
    expect([v.perGroup, v.leftOver, v.exact, v.settled]).toEqual([5, 0, true, true]);
  });

  it('16 joueurs en 3 équipes : 5 par équipe et UN joueur reste dehors, dessinable', () => {
    let s = TB.init({ total: 16, groups: 3 });
    s = TB.fill(s);
    expect(s.teams.map((t) => t.length)).toEqual([5, 5, 5]);
    expect(s.bench).toHaveLength(1);
    const v = TB.verdict(s);
    expect([v.perGroup, v.leftOver, v.exact]).toEqual([5, 1, false]);
    expect(v.benched).toEqual(s.bench);
    expect(v.equality).toEqual({ a: 16, b: 3, q: 5, r: 1 });
    // Ce que l'élève se demande tout seul : +2 ou −1.
    expect(v.fix).toEqual({ add: 2, remove: 1 });
  });

  it('les équipes restent ÉGALES : remplir une équipe avant les autres est refusé, avec sa raison', () => {
    let s = TB.init({ total: 15, groups: 3 });
    s = TB.place(s, 0, 0);
    expect(TB.canPlace(s, 1, 0)).toBe('teamsMustStayEqual');
    expect(TB.canPlace(s, 1, 1)).toBe(true);
    // Le refus ne consomme pas le joueur : il reste sur le banc.
    const after = TB.place(s, 1, 0);
    expect(after.bench).toContain(1);
    expect(after).toBe(s);
  });

  it('les nombres du refus sont ceux que canPlace voit — après le départ du joueur', () => {
    // 5/5/5 : déplacer un joueur de l'équipe 1 vers l'équipe 2. Sans lui,
    // l'équipe 1 en a 4 et l'équipe 2 en a 5 : c'est l'équipe 2 qui est trop
    // grande. La raison ne peut pas dire « 5… et la plus petite 5 ».
    const s = TB.fill(TB.init({ total: 15, groups: 3 }));
    const mover = s.teams[0][0];
    expect(TB.canPlace(s, mover, 1)).toBe('teamsMustStayEqual');
    expect(TB.rejectDetails(s, mover, 1)).toEqual({ here: 5, min: 4, perGroup: 5 });
    // Depuis le banc : aucune équipe n'est vidée.
    const one = TB.place(TB.init({ total: 15, groups: 3 }), 0, 0);
    expect(TB.canPlace(one, 1, 0)).toBe('teamsMustStayEqual');
    expect(TB.rejectDetails(one, 1, 0)).toEqual({ here: 1, min: 0, perGroup: 5 });
    // Plein : la raison nomme la part.
    const full = TB.fill(TB.init({ total: 16, groups: 3 }));
    expect(TB.canPlace(full, full.bench[0], 2)).toBe('teamIsFull');
    expect(TB.rejectDetails(full, full.bench[0], 2)).toEqual({ here: 5, min: 5, perGroup: 5 });
  });

  it('une équipe n’accepte jamais plus que sa part', () => {
    let s = TB.fill(TB.init({ total: 16, groups: 3 }));
    const leftover = s.bench[0];
    // Le seizième ne peut aller NULLE PART : c'est cela, le reste.
    for (let t = 0; t < 3; t += 1) expect(TB.canPlace(s, leftover, t)).toBe('teamIsFull');
    expect(TB.isSettled(s)).toBe(true);
  });

  it('on peut reprendre un joueur : il revient sur le banc, l’erreur ne coûte rien', () => {
    let s = TB.place(TB.init({ total: 15, groups: 3 }), 0, 0);
    s = TB.unplace(s, 0);
    expect(s.bench).toContain(0);
    expect(s.teams.every((t) => t.length === 0)).toBe(true);
  });

  it('la découverte attend le CONTRASTE : un partage juste ET un partage avec reste', () => {
    expect(TB.discoveryReady({})).toBe(false);
    expect(TB.discoveryReady({ '15:3': true })).toBe(false);
    expect(TB.discoveryReady({ '15:3': true, '18:3': true })).toBe(false);
    expect(TB.discoveryReady({ '15:3': true, '16:3': false })).toBe(true);
  });

  it('le geste canonique du mode classe avance puis s’arrête', () => {
    let s = TB.init({ total: 15, groups: 3 });
    expect(TB.nextMove(s)).toEqual({ playerId: 0, team: 0 });
    s = TB.fill(s);
    expect(TB.nextMove(s)).toBeNull();
  });
});

/* Déplacer un joueur DÉJÀ PLACÉ vers une autre équipe : l'élève change d'avis,
   et l'interface ne doit pas se battre avec lui (MANIPULATION_CONTRACT §4). */
describe('team-builder — changer d’avis', () => {
  it('un joueur placé peut passer dans une autre équipe sans repasser par le banc', () => {
    let s = TB.init({ total: 15, groups: 3 });
    s = TB.place(s, 0, 0);
    expect(TB.teamOf(s, 0)).toBe(0);
    // Les équipes 1 et 2 sont vides : y déplacer le joueur garde l'égalité.
    expect(TB.canPlace(s, 0, 1)).toBe(true);
    s = TB.place(s, 0, 1);
    expect(TB.teamOf(s, 0)).toBe(1);
    expect(s.teams[0]).toEqual([]);
    // Il n'est pas dupliqué : il est dans UNE seule équipe, et pas sur le banc.
    expect(s.teams.flat().filter((p) => p === 0)).toHaveLength(1);
    expect(s.bench).not.toContain(0);
  });

  it('le reposer dans sa propre équipe ne fait rien, et le dit', () => {
    const s = TB.place(TB.init({ total: 15, groups: 3 }), 0, 0);
    expect(TB.canPlace(s, 0, 0)).toBe('sameTeam');
  });

  it('un déplacement qui romprait l’égalité reste refusé', () => {
    let s = TB.init({ total: 15, groups: 3 });
    s = TB.place(s, 0, 0); s = TB.place(s, 1, 1); s = TB.place(s, 2, 2);
    s = TB.place(s, 3, 0); s = TB.place(s, 4, 1); s = TB.place(s, 5, 2);
    // Déplacer 3 (équipe 0 → équipe 1) donnerait 1 · 3 · 2 : inégal.
    expect(TB.canPlace(s, 3, 1)).toBe('teamsMustStayEqual');
  });

  it('une fois les équipes égales et pleines, un déplacement les déséquilibrerait : refusé, avec la BONNE raison', () => {
    const s = TB.fill(TB.init({ total: 16, groups: 3 }));
    const placed = s.teams[0][0];
    // Sortir ce joueur laisserait 4 · 5 · 5 : l'égalité est ce qui casse en
    // premier, et c'est donc ce que l'élève doit lire — pas « équipe pleine ».
    expect(TB.canPlace(s, placed, 1)).toBe('teamsMustStayEqual');
    // La scène reste stabilisée, avec son joueur dehors : le reste demeure.
    expect(TB.isSettled(s)).toBe(true);
    expect(TB.verdict(s).leftOver).toBe(1);
  });
});

describe('défaut jamais une réponse (2026-10-09)', () => {
  it('factor-pairs : la largeur par défaut ne divise pas n (sauf si tout divise)', () => {
    for (const n of [24, 48, 60, 105, 253, 452, 997]) {
      const d = FP.defaultWidth(n);
      expect(n % d, String(n)).not.toBe(0);
    }
    expect(FP.defaultWidth(48)).toBe(5);
    expect(FP.defaultWidth(60)).toBe(7);
    expect(FP.defaultWidth(2)).toBe(1);
  });
});

/* 2026-10-09 — défauts et « جرّب كل الإمكانيات » des types de divisibilité. */
describe('divisor-explorer : taille par défaut et balayage', () => {
  it('le défaut n\'est jamais un diviseur (quand le rail en offre un autre) et n\'est pas un essai', () => {
    for (const a of [24, 420, 1512, 60, 48, 105, 252]) {
      const s = DE.initWithDefault({ a, candidates: undefined });
      expect(s.b).not.toBeNull();
      expect(a % s.b).not.toBe(0);
      expect(s.tried).toEqual({});
      expect(DE.discoveryReady(s)).toBe(false);
    }
  });
  it('rail sans non-diviseur : retombe sur le début du rail', () => {
    expect(DE.defaultSize({ a: 12, candidates: [1, 2, 3] })).toBe(1);
  });
  it('un b fourni reste un essai de la leçon', () => {
    const s = DE.initWithDefault({ a: 24, b: 6, candidates: [] });
    expect(s.tried).toEqual({ 6: true });
  });
  it('balayer le rail = les mêmes essais que la main', () => {
    const rail = DE.railOf({ a: 24 });
    let s = DE.initWithDefault({ a: 24 });
    for (const c of DE.untried(s, rail)) s = DE.place(s, c);
    let hand = DE.init({ a: 24 });
    for (const c of rail) hand = DE.place(hand, c);
    expect(s.tried).toEqual(hand.tried);
    expect(DE.untried(s, rail)).toEqual([]);
    expect(DE.discoveryReady(s)).toBe(true);
  });
});

describe('common-divisors / coprime-explorer : balayage des groupes et des listes', () => {
  it('untriedGroups : 1 … min(a, b), puis plus rien', () => {
    let s = CD.initBouquets({ a: 12, b: 18 });
    expect(CD.untriedGroups(s)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (const k of CD.untriedGroups(s)) s = CD.choose(s, k);
    expect(CD.untriedGroups(s)).toEqual([]);
    expect(CD.greatestGroupFound(s)).toBe(true);
  });
  it('trousses 17/18 : tout balayé = la preuve « seul 1 marche »', () => {
    let g = CP.initGroups({ a: 17, b: 18 });
    for (const k of CP.untriedGroups(g)) g = CP.chooseGroups(g, k);
    expect(CP.workingCounts(g)).toEqual([1]);
    expect(CP.groupsInsightReady(g)).toBe(true);
  });
  it('listes : confronter chaque diviseur du plus petit mène à une preuve concluante', () => {
    for (const [a, b] of [[17, 18], [27, 36]]) {
      let s = CP.init({ a, b });
      const side = a <= b ? 'a' : 'b';
      for (const d of CP.untested(s)) s = CP.share(s, CP.chipId(side, d));
      expect(CP.untested(s)).toEqual([]);
      expect(CP.listsConclusive(s)).toBe(true);
      expect(s.checked).toBe(false); // « تحقّق » reste à l'élève
    }
  });
});
