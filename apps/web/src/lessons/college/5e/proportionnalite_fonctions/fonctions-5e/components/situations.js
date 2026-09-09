/**
 * Les situations de la leçon « Fonctions » (5e) — DÉCLARÉES COMME RÈGLES.
 *
 * PÉRIMÈTRE : aucune de ces règles n'est présentée comme « linéaire » ou
 * « affine », et aucune n'emploie f(x). Ce sont des grandeurs qui dépendent
 * d'une durée, d'un nombre ou d'un âge.
 *
 * Fil narratif : le four à pain de la cantine, puis la journée du collège.
 */
import { quantity } from './fonctionsUtils';

/* ── Module 1 — le four : une molette, trois grandeurs ────────────── */

/**
 * La couleur de la croûte, sur une échelle de 0 (pâle) à 10 (très doré).
 * Elle plafonne : au-delà de 25 min le pain ne fonce plus, il brûle.
 */
export const COULEUR = quantity({
  id: 'couleur',
  label: 'Couleur de la croûte',
  unit: '/10',
  emoji: '🥖',
  rule: (t) => Math.min(10, t * 0.42),
  decimals: 1,
  story: 'Plus la cuisson dure, plus la croûte dore.',
});

/**
 * La masse du pain. Elle DIMINUE : l'eau s'évapore. C'est la grandeur qui
 * casse l'idée que « dépendre » voudrait dire « augmenter ensemble ».
 */
export const MASSE = quantity({
  id: 'masse',
  label: 'Masse du pain',
  unit: 'g',
  emoji: '⚖️',
  rule: (t) => 500 - 4 * t,
  decimals: 0,
  story: 'En cuisant, le pain perd de l’eau : il s’allège.',
});

/** La température à cœur, qui monte régulièrement. */
export const TEMPERATURE = quantity({
  id: 'temperature',
  label: 'Température à cœur',
  unit: '°C',
  emoji: '🌡️',
  rule: (t) => 20 + 4 * t,
  decimals: 0,
  story: 'Le cœur du pain met du temps à chauffer.',
});

export const FOUR = [COULEUR, MASSE, TEMPERATURE];

/** Les durées atteignables par la molette du four. */
export const DUREES = { min: 0, max: 25, step: 1 };

/* ── Module 4 — la plante du coin fenêtre ─────────────────────────── */

/**
 * La hauteur d'une plante, semaine après semaine. Elle croît, mais PAS
 * proportionnellement : la pousse ralentit. C'est le cas « normal » que la
 * leçon sœur écarterait comme contre-exemple.
 */
export const PLANTE = quantity({
  id: 'plante',
  label: 'Hauteur de la plante',
  unit: 'cm',
  emoji: '🌱',
  rule: (s) => Math.round(4 + 6 * Math.sqrt(s)),
  decimals: 0,
  story: 'Semée il y a peu, elle pousse vite puis ralentit.',
});

/* ── Module 5 — la température de la salle, sur une journée ───────── */

/**
 * La température de la salle polyvalente, heure par heure. Elle MONTE puis
 * REDESCEND : c'est ce qui permet de faire découvrir qu'une même température
 * correspond à deux moments différents, sans jamais employer le mot
 * « antécédent » (3e).
 *
 * Les couples sont relevés (une série de mesures), pas engendrés par une
 * formule : c'est ce qu'est réellement un relevé de température.
 */
export const SALLE = [
  { x: 8, y: 16 },
  { x: 9, y: 17 },
  { x: 10, y: 19 },
  { x: 11, y: 21 },
  { x: 12, y: 23 },
  { x: 13, y: 24 },
  { x: 14, y: 25 },
  { x: 15, y: 24 },
  { x: 16, y: 22 },
  { x: 17, y: 20 },
  { x: 18, y: 18 },
];
