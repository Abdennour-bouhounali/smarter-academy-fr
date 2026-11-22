/**
 * La signature de « mafhum-jumla » (unité 5, leçon 1) — écrite par son constructeur (rollout 2026-11-12 ; contrat : `README.md` de ce dossier).
 * TOUT est importé des fichiers de contenu de la leçon (jamais retapé) :
 *   - TEXT : la signature de la مسألة par rôle (content/forbidden.js) — pour CETTE leçon seulement ;
 *   - UNIT : la jumla, les couples et le total de la مسألة (content/forbidden.js › CLIMAX) — interdits aux leçons d'avant (il n'y en a pas) ;
 *   - SYSTEMS : chaque jumla montrée avant la مسألة — les manches (content/pairs.js), les points d'étape (content/checkpoints.js), la ورقة صهيب
 *     (content/peerSheet.js), les jumal des modules 1–2 (content/textbook.js › MODULE_SYSTEMS) ; l'étape 2 du module 1 juge la jumla de la
 *     manche 2 (`callback: true`) ;
 *   - SHOWN : les textes d'avant la مسألة (manches, points d'étape, « أستعدّ », feuille) — jamais une lecture de jauge.
 */
import { M1_ROUNDS, M2_ROUNDS, FREE, SYS } from '../../mafhum-jumla/content/pairs.js';
import { CP_SYSTEMS } from '../../mafhum-jumla/content/checkpoints.js';
import { PEER_SYSTEM, PEER_SHEET } from '../../mafhum-jumla/content/peerSheet.js';
import { MODULE_SYSTEMS } from '../../mafhum-jumla/content/textbook.js';
import { PREP_LADDER } from '../../mafhum-jumla/content/prep.js';
import { TEXT as LESSON_TEXT, CLIMAX } from '../../mafhum-jumla/content/forbidden.js';
import { LESSON_CONFIG } from '../../mafhum-jumla/lesson.config.js';

export const TEXT = LESSON_TEXT;
export const UNIT = { systems: [...CLIMAX.systems], pairs: [...CLIMAX.pairs], never: [...CLIMAX.never] };

const byId = Object.fromEntries(M1_ROUNDS.map((r) => [r.id, r]));
export const SYSTEMS = [
  { id: 'r1', tier: 'required', system: byId.r1.props.system },
  { id: 'r2', tier: 'required', system: byId.r2.props.system },
  { id: 'r3', tier: 'required', system: byId.r3.props.system },
  { id: 'star', tier: 'star', system: byId.challenge.props.system },
  // module 2 (décision du propriétaire OQ1) : deux manches REQUISES sans solution unique — solutionOf les classe « none » / « infinite »
  ...M2_ROUNDS.map((r) => ({ id: r.id, tier: 'required', system: r.props.system })),
  { id: 'r1e', tier: 'easier', system: byId.r1.easier.props.system },
  { id: 'r2e', tier: 'easier', system: byId.r2.easier.props.system },
  { id: 'r3e', tier: 'easier', system: byId.r3.easier.props.system },
  ...FREE.map((system, i) => ({ id: `f${i + 1}`, tier: 'free', system })),
  ...Object.entries(CP_SYSTEMS).map(([id, system]) => ({ id, tier: 'checkpoint', system })),
  { id: 'peer', tier: 'peer', system: PEER_SYSTEM },
  ...Object.entries(MODULE_SYSTEMS).map(([id, system]) => ({ id: `m-${id}`, tier: 'module', system })),
  { id: 'm1-batch', tier: 'module', system: SYS.r2, callback: true },
];

const cpText = (cp) => [cp.prompt, ...cp.options, cp.explain].join(' ');
export const SHOWN = [
  ...[...M1_ROUNDS, ...M2_ROUNDS].flatMap((r) => [r, r.easier].filter(Boolean).flatMap((x) => [x.props.lead, x.props.mission])),
  ...LESSON_CONFIG.mission.checkpoints.map(cpText),
  ...PREP_LADDER.map((it) => `${it.text} ${it.why}`),
  PEER_SHEET.task, ...PEER_SHEET.lines, ...PEER_SHEET.fixes.map((f) => `${f.text} ${f.why ?? ''}`), ...Object.values(PEER_SHEET.fixedLines),
];
