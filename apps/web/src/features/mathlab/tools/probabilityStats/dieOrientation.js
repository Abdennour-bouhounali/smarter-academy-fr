/**
 * L'ORIENTATION d'un dé (et d'une pièce) — logique pure, sans DOM ni scène.
 *
 * Le contrat de l'animation physique (MATH_LAB.md § 5d.9) tient en une
 * phrase : LE RÉSULTAT COMMANDE LA FACE. Le moteur tire d'abord (« 4 »),
 * ce module calcule l'orientation qui met la face 4 vers le haut, et
 * l'animation ne fait que rejoindre cette orientation — jamais l'inverse.
 * Une face lue sur l'objet après coup ne serait pas une observation.
 *
 * Ce fichier n'utilise de three.js que ses classes mathématiques
 * (Quaternion, Vector3) : il se teste en Node comme n'importe quel calcul.
 *
 *     valeur ─▶ dieOrientation ─▶ quaternion cible
 *     quaternion (de l'objet réel) ─▶ dieTopFace ─▶ valeur   (la lecture inverse, pour vérifier)
 *     { from, to, spec } ─▶ planThrow ─▶ u ∈ [0;1] ↦ { position, quaternion }
 */

import { Quaternion, Vector3 } from 'three';

const UP = Object.freeze(new Vector3(0, 1, 0));

/**
 * La valeur de chaque face, dans l'ordre des GROUPES de BoxGeometry
 * (+x, −x, +y, −y, +z, −z) : c'est aussi l'ordre des six matériaux du dé.
 * Un dé occidental : 1 en haut, 2 devant, 3 à droite, et les faces
 * opposées font 7.
 */
export const DIE_FACE_VALUES = Object.freeze([3, 4, 1, 6, 2, 5]);

const FACE_NORMALS = Object.freeze([
  new Vector3(1, 0, 0), new Vector3(-1, 0, 0),
  new Vector3(0, 1, 0), new Vector3(0, -1, 0),
  new Vector3(0, 0, 1), new Vector3(0, 0, -1),
].map((v) => Object.freeze(v)));

/** La normale LOCALE de la face qui porte `value` (1 … 6). */
export function dieNormalOf(value) {
  const index = DIE_FACE_VALUES.indexOf(value);
  if (index < 0) throw new Error(`[dice] valeur de dé inconnue : ${value}`);

  return FACE_NORMALS[index].clone();
}

/**
 * L'orientation qui met la face `value` VERS LE HAUT, tournée de `yaw`
 * autour de la verticale. Toute rotation autour de la verticale garde la
 * même face en haut : c'est ce degré de liberté qui donne à chaque lancer
 * une pose finale différente sans jamais changer le résultat.
 */
export function dieOrientation(value, yaw = 0) {
  const align = new Quaternion().setFromUnitVectors(dieNormalOf(value), UP);
  const turn = new Quaternion().setFromAxisAngle(UP, yaw);

  return turn.multiply(align);
}

/** La face RÉELLEMENT en haut d'un dé dans cette orientation — la lecture inverse. */
export function dieTopFace(quaternion) {
  let best = -Infinity;
  let value = 1;
  FACE_NORMALS.forEach((normal, index) => {
    const dot = normal.clone().applyQuaternion(quaternion).dot(UP);
    if (dot > best) { best = dot; value = DIE_FACE_VALUES[index]; }
  });

  return value;
}

/**
 * La pièce : un cylindre dont la face +y est « وجه » (heads) et la face −y
 * « ظهر » (tails). Côté « وجه » en haut = identité (à un tour près) ; côté
 * « ظهر » en haut = retournée d'un demi-tour autour d'un axe horizontal.
 */
export function coinOrientation(headsUp, yaw = 0) {
  const turn = new Quaternion().setFromAxisAngle(UP, yaw);
  if (headsUp) return turn;
  const flip = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI);

  return turn.multiply(flip);
}

/** Le côté réellement en haut d'une pièce dans cette orientation. */
export function coinTopFace(quaternion) {
  return UP.clone().applyQuaternion(quaternion).dot(UP) >= 0 ? 'heads' : 'tails';
}

/* ── Le lancer ───────────────────────────────────────────────────────────── */

/**
 * Les phases d'un lancer, en fraction de sa durée :
 *   [0 ; A[      anticipation — un léger creux avant de partir ;
 *   [A ; L[      vol — montée, culbutes, descente ; la rotation est finie à L ;
 *   [L ; B1[     premier rebond ; [B1 ; B2[ second rebond ;
 *   [B2 ; 1]     immobile — la face est lisible.
 */
export const THROW_PHASES = Object.freeze({ A: 0.12, L: 0.70, B1: 0.84, B2: 0.92 });

const easeOutCubic = (t) => 1 - (1 - t) ** 3;
const easeOutQuad = (t) => 1 - (1 - t) ** 2;
const clamp01 = (t) => Math.min(1, Math.max(0, t));

/**
 * Une PLANIFICATION de lancer : à partir de la pose de repos `from`, rejoindre
 * l'orientation `to` (celle du résultat) en tournant vraiment.
 *
 * L'orientation à l'instant u est
 *
 *     q(u) = R(spinAxis, 2π·turns·e) · R(wobbleAxis, wobble·sin(π e)) · slerp(I, Δ, e) · from
 *
 * avec Δ = to · from⁻¹ et e = easeOutCubic(progression du vol). Les trois
 * facteurs sont l'identité quand e = 1 : à l'atterrissage q = Δ·from = to,
 * EXACTEMENT, quels que soient l'axe, le nombre de tours et le tangage
 * choisis. C'est ainsi qu'on varie le mouvement sans toucher au résultat.
 *
 * @param {{ position: Vector3, quaternion: Quaternion }} from  la pose de repos
 * @param {Quaternion} to                                        l'orientation du résultat
 * @param {object} spec                                          voir randomThrowSpec
 * @returns {{ duration: number, at: (u: number) => { position: Vector3, quaternion: Quaternion } }}
 */
export function planThrow(from, to, spec) {
  const { A, L, B1, B2 } = THROW_PHASES;
  const start = from.position.clone();
  const land = spec.land.clone();
  const rest = from.quaternion.clone();
  const delta = to.clone().multiply(rest.clone().invert());
  const identity = new Quaternion();
  const spinAxis = spec.spinAxis.clone().normalize();
  const wobbleAxis = spec.wobbleAxis.clone().normalize();
  const restHeight = start.y;

  const at = (raw) => {
    const u = clamp01(raw);
    const f = clamp01((u - A) / (L - A));
    const e = easeOutCubic(f);

    const spin = new Quaternion().setFromAxisAngle(spinAxis, 2 * Math.PI * spec.turns * e);
    const wobble = new Quaternion().setFromAxisAngle(wobbleAxis, spec.wobble * Math.sin(Math.PI * e));
    const aligned = identity.clone().slerp(delta, e);
    const quaternion = f >= 1
      ? to.clone()
      : spin.multiply(wobble).multiply(aligned).multiply(rest);

    const position = new Vector3();
    if (u < A) {
      position.copy(start);
      position.y = restHeight - spec.dip * Math.sin((Math.PI * u) / A);
    } else if (u < L) {
      // De sa place vers son point de chute, en s'écartant en chemin
      // (`swing`, nul aux deux bouts) : l'objet traverse l'espace sans
      // jamais avoir à « apparaître » ailleurs qu'où il était.
      position.lerpVectors(start, land, easeOutQuad(f)).addScaledVector(spec.swing, Math.sin(Math.PI * f));
      position.y = restHeight + spec.height * 4 * f * (1 - f);
    } else if (u < B1) {
      const g = (u - L) / (B1 - L);
      position.copy(land).addScaledVector(spec.drift, 0.6 * g);
      position.y = restHeight + spec.height * spec.bounce * Math.sin(Math.PI * g);
    } else if (u < B2) {
      const g = (u - B1) / (B2 - B1);
      position.copy(land).addScaledVector(spec.drift, 0.6 + 0.4 * g);
      position.y = restHeight + spec.height * spec.bounce * 0.3 * Math.sin(Math.PI * g);
    } else {
      position.copy(land).add(spec.drift);
      position.y = restHeight;
    }

    return { position, quaternion };
  };

  return { duration: spec.duration, at };
}

/**
 * Un lancer VARIÉ : axe de culbute, nombre de tours, tangage, trajectoire,
 * durée — tirés dans des plages qui restent crédibles. Le résultat n'entre
 * pas ici ; c'est `to` qui le porte. `rng` est un générateur () → [0;1[
 * (Math.random par défaut ; injecté dans les tests).
 *
 * @param {'die' | 'coin'} kind
 * @param {Vector3} slot     où l'objet doit finir (sa place sur la table)
 */
export function randomThrowSpec(kind, slot, rng = Math.random) {
  const between = (a, b) => a + rng() * (b - a);
  const sign = () => (rng() < 0.5 ? -1 : 1);
  if (kind === 'coin') {
    // Une pièce tourne autour d'un axe HORIZONTAL : c'est ce qui la retourne.
    const angle = between(0, Math.PI);

    return {
      land: slot.clone().add(new Vector3(between(-0.15, 0.15), 0, between(-0.1, 0.1))),
      spinAxis: new Vector3(Math.cos(angle), 0, Math.sin(angle)),
      turns: Math.round(between(3, 5)),
      wobbleAxis: new Vector3(0, 1, 0),
      wobble: between(0.4, 1.4),
      swing: new Vector3(between(-0.25, 0.25), 0, between(-0.15, 0.15)),
      height: between(1.9, 2.5),
      dip: 0.04,
      bounce: 0.06,
      drift: new Vector3(between(-0.08, 0.08), 0, between(-0.06, 0.06)),
      duration: between(900, 1100),
    };
  }

  return {
    land: slot.clone().add(new Vector3(between(-0.2, 0.2), 0, between(-0.15, 0.15))),
    spinAxis: new Vector3(between(0.4, 1) * sign(), between(0.2, 0.8) * sign(), between(0.4, 1) * sign()),
    turns: Math.round(between(2, 4)),
    wobbleAxis: new Vector3(between(-1, 1), between(-1, 1), between(-1, 1)),
    wobble: between(0.5, 1.2),
    swing: new Vector3(between(0.5, 0.9) * sign(), 0, between(0.2, 0.45) * sign()),
    height: between(1.3, 1.8),
    dip: 0.06,
    bounce: 0.16,
    drift: new Vector3(between(-0.12, 0.12), 0, between(-0.1, 0.1)),
    duration: between(800, 1050),
  };
}
