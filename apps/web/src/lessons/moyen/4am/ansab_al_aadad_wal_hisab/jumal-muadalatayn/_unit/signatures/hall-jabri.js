/**
 * La signature de « hall-jabri » (unité 5, leçon 2 ; rollout du 2026-11-12 ; contrat : `README.md` de ce dossier). TOUT est construit en IMPORTANT
 * le contenu de la leçon — aucun nombre n'est retapé ici.
 *   - `TEXT` : la signature PAR RÔLE de la مسألة (content/forbidden.js) + la règle P (aucun moins devant une parenthèse avant le module 4, X11).
 *   - `UNIT` : la jumla de la مسألة (sa bonne traduction, lue dans content/problems.js), ses couples et ses totaux distinctifs.
 *   - `SYSTEMS` : chaque jumla montrée avant la مسألة — les manches et leurs entraînements, le ⭐, les choix libres, les points d'étape, la ورقة زميل,
 *     l'activité et les exemples / « دوري » / choix des modules 1–2. HORS PÉRIMÈTRE (README) : les exercices du module 3, le test final, la page, et
 *     l'énigme du kiosque (après la مسألة, module 5).
 *   - `SHOWN` : les textes d'avant la مسألة (manches, points d'étape, « أستعدّ », feuille de camarade).
 */
import { TEXT as CLIMAX_TEXT, RULE_P } from '../../hall-jabri/content/forbidden.js';
import { M1_ROUNDS } from '../../hall-jabri/content/cards.js';
import { PEER_SHEET, NUMS } from '../../hall-jabri/content/peerSheet.js';
import { PREP_LADDER } from '../../hall-jabri/content/prep.js';
import { ACTIVITY, METHOD, CHOICE } from '../../hall-jabri/content/textbook.js';
import { NOW_59 } from '../../hall-jabri/content/exercises.js';
import { PROBLEM } from '../../hall-jabri/content/problems.js';
import { LESSON_CONFIG } from '../../hall-jabri/lesson.config.js';
import { solutionOf } from '../forbiddenShared.js';

export const TEXT = [...CLIMAX_TEXT, RULE_P];

/* ── la مسألة : sa jumla (la bonne option de traduction), ses couples (la solution et la permutée ; ceux de la partie 2) ── */
const translate = PROBLEM['masala-1'].parts[0].steps.find((s) => s.role === 'translate');
const cases = /\\begin\{cases\}(.*)\\\\(.*)\\end\{cases\}/.exec(translate.options[translate.correct]);
const climax = `${cases[1].trim()} | ${cases[2].trim()}`;
const sol = solutionOf(climax);
export const UNIT = {
  systems: [climax],
  // la solution et sa permutée, calculées ; les deux couples de la partie 2 (ياسين, et l'autre couple qui ne vérifie que (1)) et leurs permutés
  pairs: [sol.key, `(${sol.key.slice(1, -1).split(' ; ').reverse().join(' ; ')})`, '(35 ; 10)', '(10 ; 35)', '(20 ; 55)', '(55 ; 20)'],
  never: [115, 390, 345],
};

/* ── les jumal d'avant la مسألة ── */
const S = NUMS.S;
const sign = (n) => (n < 0 ? `-${-n}` : `+${n}`);
const peer = `${S.a1}x${sign(S.b1)}y=${S.c1}|${S.a2}x${sign(S.b2)}y=${S.c2}`.replace(/([+-])1y/g, '$1y');
const roundRows = M1_ROUNDS.flatMap((r) => {
  const tier = r.free ? 'free' : r.optional ? 'star' : 'required';
  const rows = r.free
    ? (r.props.choices ?? []).map((system, i) => ({ id: `free-${i + 1}`, tier, system }))
    : [{ id: r.id, tier, system: r.props.system }];
  if (r.easier) rows.push({ id: `${r.id}-easier`, tier: 'easier', system: r.easier.props.system });
  return rows;
});
export const SYSTEMS = [
  ...roundRows,
  ...LESSON_CONFIG.mission.checkpoints.map((cp) => ({ id: cp.id, tier: 'checkpoint', system: cp.system })),
  { id: 'peer', tier: 'peer', system: peer },
  { id: 'activity', tier: 'module', system: ACTIVITY.systems.main },
  { id: 'activity-c2', tier: 'module', system: ACTIVITY.systems.second },
  { id: 'method-one', tier: 'module', system: METHOD.one.system },
  { id: 'method-two', tier: 'module', system: METHOD.two.system },
  ...NOW_59.map((ex, i) => ({ id: `dawri-${'ab'[i]}`, tier: 'module', system: ex.system })),
  ...CHOICE.rows.map((row) => ({ id: `choice-${row.id}`, tier: 'module', system: row.system })),
];

export const SHOWN = [
  ...M1_ROUNDS.flatMap((r) => [r, r.easier].filter(Boolean).flatMap((x) => [x.props.lead, x.props.mission])),
  ...LESSON_CONFIG.mission.checkpoints.map((cp) => [cp.prompt, ...cp.options, cp.explain].join(' ')),
  ...PREP_LADDER.map((it) => `${it.text} ${it.why}`),
  JSON.stringify(PEER_SHEET),
];
