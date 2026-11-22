/**
 * L'adaptation des jeux de mathématiques au niveau de l'élève (pur).
 *
 * Règle du propriétaire (2026-10-23) : NE JAMAIS commencer par du difficile.
 * Chaque partie s'ouvre sur un ÉCHAUFFEMENT : deux niveaux sous la position de
 * l'élève (`home`), une première manche où une faute ne coûte pas de bouclier
 * (les sims), et une remontée rapide — une bonne manche sous `home` fait
 * remonter d'un niveau entier, jamais au-dessus de `home`. L'élève gagne d'abord,
 * puis le niveau monte progressivement.
 *
 * Après chaque manche :
 *   sous `home`, au plus une faute                             → un niveau plus haut (sans dépasser `home`)
 *   manche parfaite                                            → un sous-niveau plus haut
 *   deux fautes ou plus (piège touché, égale tombée, …)        → un sous-niveau plus bas
 *   deux mauvaises manches de suite                            → un niveau entier plus bas
 *   sinon                                                      → on reste
 *
 * Au-dessus de `home`, on monte d'AU PLUS un sous-niveau par manche ; sous
 * `home`, on ne dépasse pas `home`. Le serveur borne donc la position de la
 * manche k par `home + k` (SniperScoring / OddScoring).
 */
import { POSITIONS, SUB_LEVELS, clampPos } from './levels';

const BAD_FAULTS = 2;
/** L'échauffement commence deux niveaux sous la position de l'élève. MIROIR : config/madar.php › sniper.warmup_drop. */
const WARMUP_DROP = 2 * SUB_LEVELS;

/** La position où commence une partie dont la position de l'élève est `home`. */
export const warmStart = (home) => clampPos(home - WARMUP_DROP);

/** @returns {{ pos: number, change: 'up' | 'down' | 'same', bad: boolean }} */
export function adaptStep(pos, { perfect, faults }, prevBad = false, home = -1) {
  if (pos < home && faults <= 1) {
    const next = Math.min(home, pos + SUB_LEVELS);
    return { pos: next, change: next > pos ? 'up' : 'same', bad: false };
  }
  if (perfect) return { pos: clampPos(pos + 1), change: pos + 1 < POSITIONS ? 'up' : 'same', bad: false };
  if (faults >= BAD_FAULTS) {
    const next = clampPos(pos - (prevBad ? SUB_LEVELS : 1));
    return { pos: next, change: next < pos ? 'down' : 'same', bad: true };
  }
  return { pos, change: 'same', bad: false };
}

/** La plus haute position qu'une partie dont la position de l'élève est `home` peut atteindre en `rounds` manches. */
export const maxReachable = (home, rounds) => clampPos(home + Math.max(0, rounds));
