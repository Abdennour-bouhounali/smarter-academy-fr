/**
 * La signature de « mushkilat-jumla » (unité 5, leçon 3 — contrat : `README.md` de ce dossier ; conseil du 2026-11-11, verdict X3–X4, L3).
 * Écrite par le constructeur de la leçon le 2026-11-12. `SYSTEMS` est CONSTRUIT en important le contenu de la leçon (jamais recopié).
 *
 * La مسألة (module 4, « متحف الولاية ») : 180 visiteurs, 250 / 100 دج, 33000 دج → 150x = 15000 → (100 ; 80), échangé 30000 ; partie 2 :
 * 210 visiteurs, 40000 دج → (380/3 ; 250/3), leurres 126 / 84 (39900) et l'arrondi 127 / 83 (40050) ; partie 3 : 8000 perdus, p = 330.
 */
import { M1_ROUNDS, M2_ROUNDS } from '../../mushkilat-jumla/content/stories.js';
import { PREP_SYSTEMS } from '../../mushkilat-jumla/content/prep.js';
import { PEER_SHEET, NUMS as PEER } from '../../mushkilat-jumla/content/peerSheet.js';
import { MODULE2_SYSTEMS } from '../../mushkilat-jumla/content/exercises.js';

/** Ce qu'aucun texte montré à l'élève AVANT la مسألة ne contient (cartes, carte des معارف, points d'étape, « أستعدّ », exercices). */
export const TEXT = [
  // 180 et 210 sont interdits dans leur RÔLE (un total compté) : la somme des angles d'un triangle (180°) reste libre
  /(^|[^0-9.,{])(33000|40000|30000|25000|8000|39900|40050|126|127)(?![0-9])/,
  /(?<![0-9])x\s*\+\s*y\s*=\s*(180|210)(?![0-9])/,
  /(180|210)\s*(زائر|شخص|تذكرة)/,
  /(?<![0-9])150\s*x/,
  /250\s*x\s*\+\s*100\s*y/,
  /\(\s*\$?\s*(100\s*;\s*80|80\s*;\s*100)\s*\$?\s*\)/,
  /380\s*\/\s*3|\\dfrac\{380\}\{3\}|250\s*\/\s*3|\\dfrac\{250\}\{3\}/,
  /متحف الولاية/,
];

/** Ce que les leçons d'AVANT ne montrent pas (il n'y en a pas après : c'est la dernière leçon de l'unité). */
export const UNIT = {
  systems: ['x+y=180|250x+100y=33000', 'x+y=210|250x+100y=40000'],
  pairs: ['(100 ; 80)', '(80 ; 100)', '(380/3 ; 250/3)'],
  never: [180, 210, 33000, 40000],
};

// les jumal des manches (une libre qui rejoue une manche n'est pas listée deux fois)
const ROUNDS = [...M1_ROUNDS, ...M2_ROUNDS];
const played = new Set(ROUNDS.filter((r) => !r.free).map((r) => r.props.system));
const rowsOf = (rounds) => rounds.flatMap((r) => {
  if (r.free) return (r.props.choices ?? []).filter((c) => !played.has(c.props.system)).map((c) => ({ id: `free-${c.id}`, tier: 'free', system: c.props.system }));
  const main = { id: r.id, tier: r.optional ? 'star' : 'required', system: r.props.system };
  return r.easier ? [main, { id: `${r.id}e`, tier: 'easier', system: r.easier.props.system }] : [main];
});

/** Chaque jumla que la leçon montre avant sa مسألة, avec son niveau (manches, « أستعدّ », la feuille de camarade, le module 2). */
export const SYSTEMS = [
  ...rowsOf(M1_ROUNDS),
  ...rowsOf(M2_ROUNDS),
  { id: 'peer', tier: 'peer', system: [PEER_SHEET.lines[1].match(/\$(.+)\$/)[1], `x - y = ${PEER.rightX - PEER.rightY}`] },
  ...PREP_SYSTEMS.map((p) => ({ id: `prep-${p.n}`, tier: 'prep', system: p.system })),
  ...MODULE2_SYSTEMS.map((m) => ({ id: m.id, tier: 'module', system: m.system })),
];

/** Les textes d'avant la مسألة (scannés pour les totaux et couples des autres leçons, de la synthèse et de la page d'unité). */
export const SHOWN = [
  ...[...M1_ROUNDS, ...M2_ROUNDS].flatMap((r) => [r.props, r.easier?.props].filter(Boolean)).flatMap((p) => [p.story, ...(p.choices ?? []).map((c) => c.props.story)]),
  PEER_SHEET.task,
  ...PEER_SHEET.lines,
];
