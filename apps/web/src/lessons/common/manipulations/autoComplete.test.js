import { describe, it, expect } from 'vitest';
import { MANIPULATION_TYPES, AUTO_COMPLETE_UNLOCKS } from '@smarter-academy/core/curriculum/manipulationTypes.js';
import {
  autoCompleteStatus, autoCompletePlan, isAutoCompleteCapability,
  AUTO_COMPLETE_BUDGET_MS, AUTO_COMPLETE_MAX_TICKS,
} from './autoComplete';
import * as TB from './logic/teamBuilder';
import * as AL from './logic/algorithms';

/* « Compléter automatiquement » — MANIPULATION_CONTRACT §6bis.
   Trois choses sont testées ici : la DÉCISION PÉDAGOGIQUE du registre, l'état
   du bouton, et le fait que l'automatique arrive au MÊME état que la main. */

const teamSize = (s) => s.teams.map((team) => team.length);
const placedIds = (s) => s.teams.flat().sort((x, y) => x - y);
const noop = () => {};

describe('registre — qui a droit à la complétion automatique', () => {
  it('les trois gestes répétitifs d’origine la gardent (équipes, coupes, copies)', () => {
    for (const id of ['euclidean-algorithm', 'pgcd-differences', 'team-builder']) {
      expect(MANIPULATION_TYPES[id].controls.autoComplete, id).toBeTruthy();
    }
  });

  it('« جرّب كل الإمكانيات » (décision du propriétaire, 2026-10-09) : les types dont le geste est un BALAYAGE de valeurs la déclarent, en `config`', () => {
    const SWEEP = [
      'factor-pairs', 'divisor-explorer-books', 'divisor-explorer', 'common-divisors', 'coprime-explorer',
      'square-root-side', 'square-fold', 'square-tiling', 'pitch-expansion', 'turf-factoring',
      'vanishing-pitch', 'solution-ray', 'growth-race', 'linear-machine', 'origin-line', 'percent-tag',
      'affine-meter', 'affine-line', 'slope-stairs', 'line-crossing', 'plan-compare', 'stat-balance',
      'shadow-stick', 'group-tanks', 'ramp-ratios', 'clinometer', 'parallelogram-pin', 'vector-sum',
      'bridge-path', 'polygon-forge',
    ];
    for (const id of SWEEP) expect(MANIPULATION_TYPES[id].controls.autoComplete, id).toEqual({ unlock: 'config' });
    const granted = Object.entries(MANIPULATION_TYPES).filter(([, s]) => s.controls?.autoComplete).map(([id]) => id).sort();
    expect(granted).toEqual([...SWEEP, 'euclidean-algorithm', 'pgcd-differences', 'team-builder'].sort());
  });

  it('chaque déclaration est une forme connue (aucune valeur libre)', () => {
    for (const [id, spec] of Object.entries(MANIPULATION_TYPES)) {
      const cap = spec.controls?.autoComplete;
      if (cap === undefined || cap === false) continue;
      expect(isAutoCompleteCapability(cap), id).toBe(true);
      expect(AUTO_COMPLETE_UNLOCKS).toContain(cap.unlock);
    }
  });

  it('les machines à PGCD exigent un premier geste à la main ; les équipes, une configuration', () => {
    // Le premier partage se fait À LA MAIN (audit 2026-09-29, M1-F6) : `config`
    // ouvrait « أنشئ الفرق » avant tout geste, et la découverte se gagnait sans
    // qu'un seul joueur ait été porté.
    expect(MANIPULATION_TYPES['team-builder'].controls.autoComplete.unlock).toBe('first-gesture');
    expect(MANIPULATION_TYPES['pgcd-differences'].controls.autoComplete.unlock).toBe('first-gesture');
    expect(MANIPULATION_TYPES['euclidean-algorithm'].controls.autoComplete.unlock).toBe('first-gesture');
  });
});

describe('autoCompleteStatus — l’état du bouton', () => {
  const config = { unlock: 'config' };
  const first = { unlock: 'first-gesture' };
  const auto = (over) => ({ ready: true, remaining: 5, manualDone: false, step: noop, finish: noop, ...over });

  it('caché sans déclaration du registre, même si le type fournit la mécanique', () => {
    expect(autoCompleteStatus({ capability: undefined, auto: auto() })).toBe('hidden');
    expect(autoCompleteStatus({ capability: false, auto: auto() })).toBe('hidden');
    expect(autoCompleteStatus({ capability: { unlock: 'whenever' }, auto: auto() })).toBe('hidden');
  });

  it('caché sans mécanique du type, même si le registre l’accorde', () => {
    expect(autoCompleteStatus({ capability: config, auto: undefined })).toBe('hidden');
    expect(autoCompleteStatus({ capability: config, auto: { ready: true, remaining: 3 } })).toBe('hidden');
  });

  it('configuration invalide ou incomplète : désactivé — jamais un état faux', () => {
    expect(autoCompleteStatus({ capability: config, auto: auto({ ready: false }) })).toBe('invalid');
  });

  it('configuration valide : actif, sans attendre de geste pour `config`', () => {
    expect(autoCompleteStatus({ capability: config, auto: auto() })).toBe('ready');
  });

  it('`first-gesture` : verrouillé tant que l’élève n’a rien fait à la main', () => {
    expect(autoCompleteStatus({ capability: first, auto: auto() })).toBe('locked');
    expect(autoCompleteStatus({ capability: first, auto: auto({ manualDone: true }) })).toBe('ready');
  });

  it('plus rien à compléter : terminé ; pendant l’animation : en cours', () => {
    expect(autoCompleteStatus({ capability: config, auto: auto({ remaining: 0 }) })).toBe('done');
    expect(autoCompleteStatus({ capability: config, auto: auto(), running: true })).toBe('running');
  });
});

describe('autoCompletePlan — le rythme', () => {
  it('un geste par pas quand il y en a peu : on voit chaque joueur arriver', () => {
    const p = autoCompletePlan(9);
    expect(p).toMatchObject({ ticks: 9, perTick: 1 });
    expect(p.ticks * p.intervalMs).toBeLessThanOrEqual(AUTO_COMPLETE_BUDGET_MS + 140);
  });

  it('beaucoup de gestes : regroupés, la durée reste bornée, rien n’est oublié', () => {
    for (const n of [19, 30, 60, 200]) {
      const p = autoCompletePlan(n);
      expect(p.ticks).toBeLessThanOrEqual(AUTO_COMPLETE_MAX_TICKS);
      expect(p.ticks * p.perTick).toBeGreaterThanOrEqual(n);
      expect(p.ticks * p.intervalMs).toBeLessThanOrEqual(1100);
    }
  });

  it('mouvement réduit, ou pas de `step` : l’état final directement', () => {
    expect(autoCompletePlan(15, { reducedMotion: true }).ticks).toBe(0);
    expect(autoCompletePlan(15, { canStep: false }).ticks).toBe(0);
    expect(autoCompletePlan(0).ticks).toBe(0);
  });
});

describe('team-builder — « أنشئ الفرق » arrive où la main arrive', () => {
  it('15 joueurs en 3 : 5 par équipe, banc vide, scène stabilisée', () => {
    const s = TB.fill(TB.init({ total: 15, groups: 3 }));
    expect(teamSize(s)).toEqual([5, 5, 5]);
    expect(s.bench).toEqual([]);
    expect(TB.verdict(s)).toMatchObject({ settled: true, exact: true, perGroup: 5, leftOver: 0 });
  });

  it('16 en 3 : pas d’arrondi — le seizième reste sur le banc, comme à la main', () => {
    const s = TB.fill(TB.init({ total: 16, groups: 3 }));
    expect(teamSize(s)).toEqual([5, 5, 5]);
    expect(s.bench).toHaveLength(1);
    expect(TB.verdict(s)).toMatchObject({ settled: true, exact: false, leftOver: 1 });
  });

  it('sur tout le domaine du registre, l’automatique respecte n = k × q + r', () => {
    const [[tMin, tMax], [gMin, gMax]] = [MANIPULATION_TYPES['team-builder'].controls.changeNumbers.total, MANIPULATION_TYPES['team-builder'].controls.changeNumbers.groups];
    for (let n = tMin; n <= tMax; n += 1) {
      for (let k = gMin; k <= Math.min(gMax, n); k += 1) {
        const s = TB.fill(TB.init({ total: n, groups: k }));
        const q = Math.floor(n / k);
        expect(teamSize(s).every((x) => x === q), `${n}:${k}`).toBe(true);
        expect(s.bench.length, `${n}:${k}`).toBe(n % k);
        expect(TB.isSettled(s)).toBe(true);
      }
    }
  });

  it('pas à pas : `autoStep` répété = `fill`, et `remainingMoves` compte exactement ces pas', () => {
    let s = TB.init({ total: 20, groups: 4 });
    const n = TB.remainingMoves(s);
    expect(n).toBe(20);
    for (let i = 0; i < n; i += 1) s = TB.autoStep(s);
    expect(s).toEqual(TB.fill(TB.init({ total: 20, groups: 4 })));
    expect(TB.remainingMoves(s)).toBe(0);
    expect(TB.autoStep(s)).toBe(s); // sans effet à l’état final
  });

  it('MIXTE — début à la main, fin automatique : rien n’est dupliqué, rien n’est perdu, rien ne bouge', () => {
    let s = TB.init({ total: 12, groups: 3 });
    s = TB.place(s, 7, 2); // l’élève place le joueur 8 dans l’équipe 3
    s = TB.place(s, 0, 0);
    s = TB.place(s, 11, 1);
    expect(TB.remainingMoves(s)).toBe(9);
    const done = TB.fill(s);
    expect(placedIds(done)).toEqual(Array.from({ length: 12 }, (_, i) => i));
    expect(done.bench).toEqual([]);
    expect(teamSize(done)).toEqual([4, 4, 4]);
    expect(TB.teamOf(done, 7)).toBe(2);
    expect(TB.teamOf(done, 0)).toBe(0);
    expect(TB.teamOf(done, 11)).toBe(1);
  });

  it('APRÈS l’automatique, la main garde la main : échanger, renvoyer au banc, reposer', () => {
    let s = TB.fill(TB.init({ total: 12, groups: 3 }));
    const p = s.teams[0][0];
    s = TB.unplace(s, p);
    expect(s.bench).toEqual([p]);
    expect(TB.verdict(s).settled).toBe(false);
    // La même règle qu'à la main : il ne peut rentrer que dans l'équipe qui a un joueur de moins.
    expect(TB.canPlace(s, p, 2)).toBe('teamsMustStayEqual');
    s = TB.place(s, p, 0);
    expect(teamSize(s)).toEqual([4, 4, 4]);
    expect(TB.verdict(s)).toMatchObject({ settled: true, exact: true });
  });
});

describe('pgcd-differences — « أكمل الفروق »', () => {
  it('complète la chaîne 252/140 par le geste de l’élève, sans remplir la case PGCD', () => {
    let s = AL.initDifferences({ a: 252, b: 140 });
    s = AL.subtract(s); // la première coupe, à la main
    expect(AL.remainingDifferences(s)).toBe(s.steps.length - 1);
    const done = AL.completeDifferences(s);
    expect(AL.isDifferencesFinished(done)).toBe(true);
    expect(done.pgcdPlaced).toBe(false);
    expect(AL.lastNonZeroDiff(done)).toBe(28);
    expect(AL.canPlaceDifferencePgcd(done, 28)).toBe(true);
    let manual = s;
    while (!AL.isDifferencesFinished(manual)) manual = AL.subtract(manual);
    expect(done).toEqual(manual);
  });
});

describe('euclidean-algorithm — « أكمل القسمات »', () => {
  it('1938/836 : les copies se posent une à une, les restes sont portés, la case PGCD reste à l’élève', () => {
    let s = AL.initEuclid({ a: 1938, b: 836 });
    // La première division, à la main : les copies, puis le report du reste.
    while (AL.canAddCopy(s) === true) s = AL.addCopy(s);
    s = AL.tryCopy(s);                 // la copie de trop, essayée et refusée
    s = AL.carryRemainder(s);
    expect(s.confirmed).toBe(1);
    const n = AL.remainingEuclidGestures(s);
    let stepped = s;
    for (let i = 0; i < n; i += 1) stepped = AL.euclidGestureStep(stepped);
    const done = AL.completeEuclid(s);
    expect(stepped).toEqual(done);
    expect(AL.isEuclidFinished(done)).toBe(true);
    expect(done.pgcdPlaced).toBe(false);
    expect(AL.canPlaceEuclidPgcd(done, done.gcd)).toBe(true);
    expect(done.gcd).toBe(38);
  });

  it('MIXTE — une division à moitié remplie à la main se termine sans copie en trop', () => {
    let s = AL.initEuclid({ a: 765, b: 135 });
    s = AL.addCopy(AL.addCopy(s)); // 2 copies sur 5
    // par division : ses copies + l'essai de la copie de trop + le report
    expect(AL.remainingEuclidGestures(s)).toBe(3 + 1 + 1 + s.steps.slice(1).reduce((n, x) => n + x.q + 2, 0));
    const done = AL.completeEuclid(s);
    expect(done.confirmed).toBe(s.steps.length);
    expect(done.gcd).toBe(45);
  });
});

describe('rythme imposé par le type (factor-pairs, « جرّب كل الإمكانيات »)', () => {
  it('un essai par pas, à l’intervalle demandé, jusqu’à maxTicks', () => {
    expect(autoCompletePlan(14, { maxTicks: 80, intervalMs: 160 })).toEqual({ ticks: 14, perTick: 1, intervalMs: 160 });
    expect(autoCompletePlan(120, { maxTicks: 80, intervalMs: 160 }).ticks).toBe(80);
  });
  it('mouvement réduit : aucun pas, l’état final directement', () => {
    expect(autoCompletePlan(14, { maxTicks: 80, intervalMs: 160, reducedMotion: true }).ticks).toBe(0);
  });
});
