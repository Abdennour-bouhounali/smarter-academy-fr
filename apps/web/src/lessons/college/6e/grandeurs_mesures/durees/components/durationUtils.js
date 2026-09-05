// Primitives de formatage mutualisées — on ne les reproduit pas ici.
import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

export { formatDec, parseDec, roundTo };

/**
 * durationUtils — outils de calcul des durées (6e).
 *
 * SEULE famille d'unités NON décimale du chapitre : base 60 (et 24). Les
 * helpers « facteur ×10/×100 » des autres leçons ne s'appliquent pas ; tout
 * passe par la conversion en secondes, avec retenue/emprunt de 60.
 *
 * Convention d'angle (ClockFace) : polarToXY prend un angle en degrés
 * mesuré DEPUIS MIDI (12 h), dans le SENS HORAIRE — la convention des
 * horloges, opposée à la convention trigonométrique. Documenté ici pour
 * éviter les bugs de signe en copiant vers d'autres composants.
 */

/** Unités usuelles, de la plus grande à la plus petite. */
export const UNITS = [
  { id: 'j', label: 'jour', seconds: 86_400 },
  { id: 'h', label: 'heure', seconds: 3_600 },
  { id: 'min', label: 'minute', seconds: 60 },
  { id: 's', label: 'seconde', seconds: 1 },
];

const SECONDS = Object.fromEntries(UNITS.map((u) => [u.id, u.seconds]));

/** { h, min, s } → total en secondes. */
export function toSeconds({ h = 0, min = 0, s = 0 } = {}) {
  return h * 3600 + min * 60 + s;
}

/** Total en secondes → { h, min, s } normalisé. */
export function fromSeconds(total) {
  const h = Math.floor(total / 3600);
  const min = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { h, min, s };
}

/** Convertit une valeur d'une unité vers une autre (ex. 2 h → 120 min). */
export function convert(value, fromId, toId) {
  return roundTo((value * SECONDS[fromId]) / SECONDS[toId], 6);
}

/** Facteur entre deux unités (ex. h→min = 60), dérivé de la table. */
export function factorBetween(fromId, toId) {
  return SECONDS[fromId] / SECONDS[toId];
}

/** Formate une durée : « 2 h 05 min », « 45 min », « 1 min 20 s ». */
export function formatDuration({ h = 0, min = 0, s = 0 } = {}) {
  const parts = [];
  if (h > 0) {
    parts.push(`${h} h`);
    if (min > 0 || s > 0) parts.push(`${String(min).padStart(2, '0')} min`);
  } else if (min > 0) {
    parts.push(`${min} min`);
  }
  if (s > 0) parts.push(`${s} s`);
  if (parts.length === 0) return '0 min';
  return parts.join(' ');
}

/** Formate un instant : « 9 h 47 », « 14 h 05 ». */
export function formatTime({ h = 0, min = 0 } = {}) {
  return `${h} h ${String(min).padStart(2, '0')}`;
}

/** Additionne deux durées, avec retenue de 60. */
export function addDurations(a, b) {
  return fromSeconds(toSeconds(a) + toSeconds(b));
}

/** Durée entre deux instants (t2 ≥ t1), avec emprunt de 60. */
export function durationBetween(t1, t2) {
  return fromSeconds(toSeconds(t2) - toSeconds(t1));
}

/** Compare deux durées : -1 | 0 | 1. */
export function compareDurations(a, b) {
  const d = toSeconds(a) - toSeconds(b);
  return d < 0 ? -1 : d > 0 ? 1 : 0;
}

/**
 * hopsBetween — la « méthode des sauts » canonique : décompose la durée
 * t1 → t2 en (1) saut jusqu'à l'heure ronde suivante, (2) heures entières,
 * (3) minutes restantes. Les cas dégénérés (départ pile, moins d'une
 * heure…) suppriment les sauts inutiles.
 * Retourne [{ minutes, label, arrivesAt: { h, min } }].
 */
export function hopsBetween(t1, t2) {
  const hops = [];
  let cur = { h: t1.h, min: t1.min };
  const endS = toSeconds(t2);

  // 1. Jusqu'à l'heure ronde suivante.
  if (cur.min !== 0) {
    const toRound = 60 - cur.min;
    const next = { h: cur.h + 1, min: 0 };
    if (toSeconds(next) <= endS) {
      hops.push({ minutes: toRound, label: `+ ${toRound} min`, arrivesAt: next });
      cur = next;
    }
  }

  // 2. Heures entières.
  const wholeHours = Math.floor((endS - toSeconds(cur)) / 3600);
  if (wholeHours > 0) {
    const next = { h: cur.h + wholeHours, min: cur.min };
    hops.push({ minutes: wholeHours * 60, label: `+ ${wholeHours} h`, arrivesAt: next });
    cur = next;
  }

  // 3. Minutes restantes.
  const restMin = Math.round((endS - toSeconds(cur)) / 60);
  if (restMin > 0) {
    hops.push({ minutes: restMin, label: `+ ${restMin} min`, arrivesAt: { h: t2.h, min: t2.min } });
  }

  return hops;
}

/**
 * polarToXY — position sur le cadran. `deg` est mesuré depuis 12 h, sens
 * horaire (0° = midi, 90° = 3 h, 180° = 6 h).
 */
export function polarToXY(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
