/**
 * THE STORY of lesson « Engrenages et rendez-vous : quand deux rythmes se retrouvent » in the world « L’archipel des
 * diviseurs » — what the world's mechanic plays (`divisorIsles/Game.js`): its islands and gaps, the waves of its gate dash,
 * its words, and what happens on the way. The design is `docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md`, lesson 4,
 * version 2 (its open questions decided by default: « plus petit multiple commun » in full, never « PPCM »; five ROWS, 0 at
 * the left; no gear drawn anywhere; three posters a run of the mission). Two NEW pieces of the world play it: the segment
 * `walkway` (he places the PILLAR, two crews lay — GAME_WORLD.md) and `story.mission`.
 *
 *   A ⇒ B      walkway « quai »: crews of 16 and 20 cases, ruler 0 … 400, a purse — only 80 holds and the purse pays it.
 *              B: the mirror of K1 `pilier-commun`.
 *   B → C      a standing bridge (a gap of 0 cases).
 *   C ⇒ D      walkway « chantier »: crews of 414 and 192, per-try ruler, 120 coins, whose bench is lesson 1's spreadsheet.
 *              D: the mirror of K2 `ppcm-facteurs`.
 *   D → E      a standing bridge. E: the mirror of K3 `traduire-rendez-vous` (an inquiry `crews`, mode `story`).
 *   E → F      a standing bridge. F: the mirror of K4 `cinq-equipes` (an inquiry `crews`, mode `days`).
 *   F → G      the gate dash (its waves use the four keys, all forged).
 *   G          THE FINAL MISSION, the lesson's problem: the board of the harbour (`story.mission`), three ferries; the
 *              finale plays on G only once it is solved.
 * No rule is told on the islands: the instruction states the constraint, the world states facts, and each rule is forged
 * in a mirror. Every number is in `NUMBERS` (math.js); the sentences and the tablets are written from it. The hooks
 * receive the game and use its commands; they hold no mechanic.
 */
import { daysFact } from '../../../../../../common/gameworld/divisorIsles/crews';
import { slot } from '../../../../../../common/gameworld/kit/forge';
import { line } from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { SHEET_BENCH } from './inquiries';
import {
  CELLS,
  COINS,
  NUMBERS,
  PLANKS,
  counted,
  fr,
  frAll,
  lcm,
  lcmOf,
  lcmPowers,
  nb,
  ordinal,
  powTex,
  powersOf,
  togetherDay,
  tx,
  valueOfPowers,
} from './math';

/** The four keys, in the order of the road. */
export const K = {
  pilier: 'pilier-commun',
  facteurs: 'ppcm-facteurs',
  rendezvous: 'traduire-rendez-vous',
  equipes: 'cinq-equipes',
};

const { pillar: PI, factors: FC, story: ST, days: DY, mission: MI } = NUMBERS;
const [A1, B1] = PI.crews;
const [A2, B2] = FC.crews;
/** The first pillar that holds, and its planks: 80 = 16 × 5 = 20 × 4 ; 13 248 = 414 × 32 = 192 × 69. */
const FIRST1 = lcm(A1, B1);
const FIRST2 = lcm(A2, B2);
/** The cycle of each of the three ferries: 1 day of work + its rest days (they all cross together on day 1 + the smallest common multiple). */
const FERRY_CYCLES = MI.rests.map((r) => r + 1);

/**
 * The lesson's modules (its config keeps them as DATA: progress, the reports and the compass read their numbers) and the
 * keys their learning points need — P1 ← K1, P2 ← K2, P3 ← K3 and K4. `journey.test.js` checks this table against the
 * config. Module 0 teaches no learning point; module 4 is the final mission (the problem); module 5 is the evaluation.
 */
export const MODULE_KEYS = {
  1: [K.pilier],
  2: [K.pilier, K.facteurs],
  3: [K.pilier, K.rendezvous, K.equipes],
  4: [K.pilier, K.facteurs, K.rendezvous, K.equipes],
};
/** Module 4 is the lesson's problem: done when the mission of the harbour is solved. */
const PROBLEM_MODULE = '4';
/** The key just sealed completes the modules that teach it and need nothing he does not hold yet. */
function completeModules(game, key) {
  const held = [...game.state.keys, key];
  for (const [m, keys] of Object.entries(MODULE_KEYS))
    if (m !== PROBLEM_MODULE && keys.includes(key) && keys.every((k) => held.includes(k))) game.onModule(m);
}

const missing = (game, key) => !game.state.keys.includes(key);
/** A bridge that stands from the start (a gap of 0 cases): he only walks across. */
const standing = (id, len) => ({
  id,
  kind: 'bridge',
  a: 0,
  len,
  moulds: [],
  predict: false,
  holdsWith: 1,
  standing: true,
});
const walkway = (id, crews, len, convoy, extra) => ({ id, kind: 'walkway', len, crews, convoy, ...extra });

const ISLANDS = [
  { id: 'A', name: 'Le ponton des bâtisseurs', R: 9, theme: 'meadow', turn: 0 },
  { id: 'B', name: 'L’île des amarres', R: 8, theme: 'meadow', turn: 0.38 },
  { id: 'C', name: 'Le chantier des deux rives', R: 9.5, theme: 'crystal', turn: -0.42 },
  { id: 'D', name: 'L’île des brumes', R: 8, theme: 'crystal', turn: 0.4 },
  { id: 'E', name: 'L’île des vigies', R: 9.5, theme: 'pine', turn: -0.35 },
  { id: 'F', name: 'L’île des fanaux', R: 8.5, theme: 'pine', turn: 0.3 },
  { id: 'G', name: 'Le port des navettes', R: 11, theme: 'autumn', turn: 0 },
];
const NAME = Object.fromEntries(ISLANDS.map((x) => [x.id, x.name]));
/** The two purses: a coin per plank laid, whatever its length; a walkway refused costs nothing (GAME_WORLD.md). */
const CONVOYS = { quai: { purse: PI.purse }, chantier: { purse: FC.purse } };
const SEGMENTS = [
  walkway('pilier-quai', PI.crews, 22, 'quai', { ruler: PI.ruler, scale: 'fixed' }),
  standing('pont-amarres', 11),
  // the second walkway: planks too long to list, his ruler follows each try; lesson 1's spreadsheet is its bench
  walkway('pilier-chantier', FC.crews, 22, 'chantier', { scale: 'fit', bench: SHEET_BENCH }),
  standing('pont-brumes', 11),
  standing('pont-vigies', 11),
  { id: 'dash', kind: 'rail', len: 300 },
];

/**
 * The gate dash (after island F: the four keys are forged): one sentence, three gates, exactly one right, each with its
 * guidance (`why`, read by the world's `explain`). The design's six waves (proof « Gate dash »); every wrong gate is a
 * belief a student holds — the sum, the PGCD, the product, a quantity that is not the one asked.
 */
const wave = (say, gates, test, why) => ({ say: fr(say), gates, test, why: frAll(why) });
const DASH_WAVES = [
  wave('Le premier pilier où finissent pile des planches de 4 et de 34 cases', [2, 38, 68], (n) => n === lcm(4, 34), {
    right: '$68 = 4 \\times 17$ et $68 = 34 \\times 2$ : les deux équipes finissent pile.',
    wrong: {
      2: '2 cases, c’est moins qu’une planche de 4 : aucune équipe ne pose de planche.',
      38: '$38 = 4 \\times 9 + 2$ : l’équipe des planches de 4 s’arrête 2 cases avant le pilier.',
    },
  }),
  wave(
    `Le plus petit multiple commun non nul de $2^{3} \\times 3$ et de $2^{2} \\times 23$`,
    [4, 552, 2208],
    (n) => n === lcm(24, 92),
    {
      right: 'Tous les facteurs premiers, chacun avec son plus grand exposant : $2^{3} \\times 3 \\times 23 = 552$.',
      wrong: {
        4: '4 divise les deux nombres : un multiple commun n’est jamais plus petit qu’eux.',
        2208: `$${tx(2208)} = 24 \\times 92$ est un multiple commun, mais $552 = 92 \\times 6$ en est un plus petit.`,
      },
    },
  ),
  wave(
    'Deux roues de 26 et de 34 dents : les tours de la roue de 34 dents quand les marques se retrouvent pour la première fois',
    [2, 13, 17],
    (n) => n === lcm(26, 34) / 34,
    {
      right: '$442 = 34 \\times 13$ : la roue de 34 dents fait 13 tours.',
      wrong: {
        2: '2 divise les deux nombres de dents, mais ce n’est pas un nombre de tours : $442 = 34 \\times 13$.',
        17: '$442 = 26 \\times 17$ : ce sont les tours de la roue de 26 dents.',
      },
    },
  ),
  wave(
    'Partager 24 billes rouges et 92 billes bleues en sachets identiques : le plus de sachets possible',
    [2, 4, 552],
    (n) => n === 4,
    {
      right: '$24 = 4 \\times 6$ et $92 = 4 \\times 23$ : 4 sachets de 6 billes rouges et de 23 billes bleues.',
      wrong: {
        2: '2 sachets marchent, mais 4 sachets marchent aussi, et c’est plus de sachets.',
        552: '$552 = 92 \\times 6$ est un multiple commun des deux nombres : on ne peut pas faire 552 sachets avec 24 billes.',
      },
    },
  ),
  wave(
    'Une équipe travaille 1 jour puis se repose 4 jours, une autre 1 jour puis se repose 7 jours. Elles travaillent ensemble le jour 1 : le prochain jour où elles travaillent ensemble',
    [29, 40, 41],
    (n) => n === togetherDay([5, 8]),
    {
      right:
        'Les cycles sont 5 et 8 jours : $5 \\times 8 = 40$ est le plus petit multiple commun, donc le jour $1 + 40 = 41$.',
      wrong: {
        29: '$28 = 5 \\times 5 + 3$ : le jour 29, la première équipe se repose encore.',
        40: '$39 = 5 \\times 7 + 4$ : le jour 40, la première équipe se repose encore.',
      },
    },
  ),
  wave(
    'Le premier pilier où finissent pile des planches de 19 et de 37 cases',
    [1, 18, 703],
    (n) => n === lcm(19, 37),
    {
      right:
        '$19 \\times 37 = 703$ : 19 et 37 n’ont aucun diviseur commun autre que 1, le premier pilier est leur produit.',
      wrong: {
        1: '1 case, c’est moins qu’une planche de 19 : aucune équipe ne pose de planche.',
        18: '$18 = 19 \\times 0 + 18$ : l’équipe des planches de 19 ne pose aucune planche.',
      },
    },
  ),
];

/**
 * The tablet of each rule: its name comes AFTER the student forged it. `lines` go through MathText; `math` are formulas
 * whose equality the story suite re-computes; `notes` are plain text (no `$`). No tablet tells a later key's way (K1's has
 * no factors, K2's no turns or days, K3's no days), and none remarks on the product of the two results of a pair.
 */
const tablet = (t) => ({ ...t, title: fr(t.title), lines: t.lines.map(fr), notes: (t.notes ?? []).map(fr) });
const MULTIPLES1 = [1, 2, 3].map((k) => nb(FIRST1 * k)).join(', ');
const P1 = FC.crews.map(powersOf);
const [GEAR_A, GEAR_B] = ST.gears;
const GEAR_L = lcm(GEAR_A, GEAR_B);
const [BUS_A, BUS_B] = ST.bus.every;
const BUS_L = lcm(BUS_A, BUS_B);
const SLEEP_CYCLES = DY.sleeps.map((s) => s + 1);
const TRIO = DY.trio.map((s) => s + 1);
const [CP, CQ] = FC.coprime;
/** 2⁶ × 3² × 23, and 2² × 7 × 19 (the decomposition of the smallest common multiple of the cycles 4, 14, 19). */
const LCM2 = lcmPowers(...P1);
const TRIO_POWERS = powersOf(lcmOf(TRIO));
export const TABLETS = {
  [K.pilier]: tablet({
    icon: '🏗️',
    title: 'Multiples communs',
    lines: [
      `${MULTIPLES1}… sont des multiples communs de ${A1} et de ${B1} : chaque équipe y finit une planche entière.`,
      `Le plus petit qui n’est pas 0 est le plus petit multiple commun de ${A1} et de ${B1} : ${FIRST1}.`,
    ],
    math: [`${FIRST1} = ${A1} \\times ${FIRST1 / A1}`, `${FIRST1} = ${B1} \\times ${FIRST1 / B1}`],
    notes: [
      `${A1 * B1} tient aussi, mais il faut ${(A1 * B1) / A1 + (A1 * B1) / B1} planches : la bourse n’en paie que ${PI.purse}`,
    ],
  }),
  [K.facteurs]: tablet({
    icon: '🧮',
    title: 'Le plus petit multiple commun par les facteurs premiers',
    lines: [
      // short: the board's name card holds these lines, the math and the note (walk 2026-11-26: they left the card);
      // the math under them writes 13 248 = 2⁶ × 3² × 23
      'On décompose, puis on prend tous les facteurs premiers, chacun avec son plus grand exposant.',
      `$${A2} = ${powTex(P1[0])}$ et $${B2} = ${powTex(P1[1])}$.`,
    ],
    math: [
      `${tx(FIRST2)} = ${powTex(LCM2)}`,
      `${tx(valueOfPowers([...CP, ...CQ]))} = ${powTex(CP)} \\times ${powTex(CQ)}`,
    ],
    notes: [`Sans facteur premier commun, c’est le produit des deux nombres`],
  }),
  [K.rendezvous]: tablet({
    icon: '🔁',
    title: 'Rendez-vous : traduire, puis revenir à l’histoire',
    lines: [
      'Deux rythmes partis ensemble se retrouvent pour la première fois après leur plus petit multiple commun ; chacun s’est alors répété ce nombre divisé par sa propre période.',
      `Roues de ${GEAR_A} et de ${GEAR_B} dents : $${GEAR_L} = ${GEAR_A} \\times ${GEAR_L / GEAR_A} = ${GEAR_B} \\times ${GEAR_L / GEAR_B}$, soit ${GEAR_L / GEAR_A} tours et ${GEAR_L / GEAR_B} tours.`,
    ],
    math: [`${GEAR_L} = ${GEAR_A} \\times ${GEAR_L / GEAR_A}`, `${GEAR_L} = ${GEAR_B} \\times ${GEAR_L / GEAR_B}`],
    notes: [
      `Un bus toutes les ${BUS_A} min et un autre toutes les ${BUS_B} min, partis à 6 h 10 : ${BUS_L} min plus tard, à 10 h`,
    ],
  }),
  [K.equipes]: tablet({
    icon: '⏳', // not 📅: its glyph prints « July 17 » — an English word on the hub (walk 2026-11-26)
    title: 'Plusieurs rythmes : compter les jours depuis le jour 1',
    lines: [
      'Une équipe qui travaille 1 jour puis dort $x$ jours a un cycle de $x + 1$ jours. Le prochain jour où toutes travaillent est le jour 1 + le plus petit multiple commun de leurs cycles.',
      `Cycles ${SLEEP_CYCLES.slice(0, -1).join(', ')} et ${SLEEP_CYCLES.at(-1)} : $${lcmOf(SLEEP_CYCLES)} = 2^{2} \\times 3 \\times 5$, donc le jour ${togetherDay(SLEEP_CYCLES)}. Cycles ${TRIO.join(', ')} : $${lcmOf(TRIO)} = ${powTex(TRIO_POWERS)}$, donc le jour ${togetherDay(TRIO)}.`,
    ],
    math: [`${lcmOf(SLEEP_CYCLES)} = 2^{2} \\times 3 \\times 5`, `${lcmOf(TRIO)} = ${powTex(TRIO_POWERS)}`],
    notes: [
      `Jour ${togetherDay(SLEEP_CYCLES)} : ${lcmOf(SLEEP_CYCLES)} jours depuis le départ, et 0 est dans la table de chaque équipe`,
    ],
  }),
};
// ───────────────────────── the words ─────────────────────────

/** The ferries of the mission, in the order of the story: du nord, de l’ouest, du sud. */
const DE = ['du nord', 'de l’ouest', 'du sud'];
const FERRY_NAMES = ['Nord', 'Ouest', 'Sud'];
/** « la navette de l’ouest est au port » · « la navette du nord et celle du sud sont au port ». */
const atPort = (idle) =>
  idle.length === 3
    ? 'les trois navettes sont au port'
    : idle.length === 1
      ? `la navette ${DE[idle[0]]} est au port`
      : `la navette ${DE[idle[0]]} et celle ${DE[idle[1]]} sont au port`;
const days = (n) => counted(n, ['jour', 'jours']);

/** The story's own words, laid over the world's (`divisorIsles/strings.js`); every sentence takes French typography. */
const TEXT = frAll({
  title: 'L’archipel des diviseurs : le port des navettes',
  subtitle:
    'La tempête a emporté les passerelles entre les îles. Avec le robot Zéro, bâtis-les avec deux équipes de charpentiers, puis retrouve le jour de la fête des navettes.',
  objective: {
    // the WHOLE instruction of a walkway, said before it stands: the crews, the constraint, the purse (`story.objective`)
    walkway: (crews, purse, bench) =>
      `Passerelle : l’équipe A pose des planches de ${nb(crews[0])} cases, l’équipe B de ${nb(crews[1])}. Le pilier ne tient que si les deux équipes finissent pile dessus. Une pièce par planche : ${counted(purse, COINS)}.${bench ? ' Le tableur t’aide.' : ' Place le pilier au poteau lumineux.'}`,
    cross: 'La passerelle tient : traverse !',
    standing: (name) => `Traverse le pont jusqu’à « ${name} »`,
    board: `Monte sur le glisseur de lumière jusqu’à « ${NAME.G} »`,
    end: 'Rallume le phare du port',
  },
  say: {
    hello:
      'Je suis Zéro ! La tempête a emporté les passerelles. Sur ce quai, deux équipes de charpentiers attendent : à toi de placer le pilier de la première passerelle.',
    // a walkway stands: the pillar, what each crew laid, the coins left
    held: (t, of) =>
      `Le pilier est à ${counted(t.d, CELLS)} : ${t.lanes.map((l) => `${counted(l.planks, PLANKS)} de ${nb(l.b)}`).join(' et ')}, il reste ${counted(of - t.cost, COINS)}. Traverse !`,
    // arriving on the island of the second walkway
    chantier: `Une deuxième passerelle : ses planches font ${counted(A2, CELLS)} et ${counted(B2, CELLS)}, et la bourse a ${counted(FC.purse, COINS)}. Le tableur de l’atelier est à ta disposition.`,
    // what waits after each forge (the road goes on from the island of its mirror)
    toStory: 'Une histoire t’attend sur l’île suivante : à toi de la lire.',
    toTeams: 'Un calendrier t’attend sur l’île suivante : des équipes, et chacune a son rythme.',
    f: 'Le glisseur de lumière est prêt. Lis la phrase, et passe par la porte qui la vérifie.',
    port: 'Le port des navettes ! Trois navettes traversent chaque jour, ou restent à quai. Au tableau du port, trouve le jour de la fête.',
    spent:
      'Il n’y a plus d’affiche. Relis les rythmes des navettes, puis reviens au tableau : trois affiches neuves t’attendent.',
    solved: 'Les trois navettes traversent ensemble : c’est le jour de la fête !',
    end: 'La fête des navettes peut commencer. Merci !',
  },
  /** The card on the right (kit/Instruction.jsx › Recall): what matters from the island before — facts, never the rule. */
  recall: {
    pillar: (d, crews) => `Le pilier : $${tx(d)} = ${crews.map((b) => `${tx(b)} \\times ${tx(d / b)}`).join(' = ')}$`,
    paid: (q, left) => `Tu as payé ${counted(q, COINS)}, ${left > 0 ? `il en reste ${left}` : 'la bourse est vide'}`,
  },
  purse: { label: 'Pièces de la passerelle', one: 'Pièces de la passerelle' },
  /** The walkway's panel (`divisorIsles/Chantier.jsx`): every word it shows. */
  walkway: {
    title: 'Le chantier de la passerelle',
    instruction: (seg) =>
      `L’équipe A pose des planches de ${nb(seg.crews[0])} cases, l’équipe B des planches de ${nb(seg.crews[1])}. Le pilier de l’île d’en face ne tient que si les deux équipes finissent pile dessus. Une pièce par planche posée.`,
    prompt: 'Appuie sur E — Pose le pilier',
    objective: 'Place le pilier, puis lance les équipes',
    before: 'Le pilier à',
    after: 'cases du bord',
    boxLabel: 'Distance du pilier au bord, en cases',
    plant: 'Poser le pilier',
    lay: 'Les équipes posent',
    take: 'Reprendre le pilier',
    bench: 'Le tableur',
    benchSub: 'Il calcule pour toi ; le pilier, c’est toi qui le places',
    benchBack: 'Retour au chantier',
    error: {
      empty: 'Écris la distance du pilier.',
      nan: 'Écris un nombre entier de cases.',
      range: (max) => `Le pilier se place entre 0 et ${nb(max)} cases du bord.`,
    },
    crew: (i, b) => `Équipe ${'AB'[i]} : planches de ${nb(b)}`,
    pillar: (d) => counted(d, CELLS),
    short: (n) => counted(n, CELLS),
    band: (n, b) => `${counted(n, PLANKS)} de ${nb(b)}`,
    lane: (l, i) => {
      const crew = `L’équipe ${'AB'[i]}`;
      if (l.ends) return `${crew} (planches de ${nb(l.b)}) finit pile au pilier : ${counted(l.planks, PLANKS)}.`;
      if (l.planks === 0)
        return `${crew} ne pose aucune planche : le pilier est à ${counted(l.short, CELLS)} du bord, la première en fait ${nb(l.b)}.`;
      return `${crew} s’arrête ${counted(l.short, CELLS)} avant le pilier : ${counted(l.planks, PLANKS)}, la ${ordinal(l.planks + 1)} dépasserait.`;
    },
    shore: 'Un pilier sur le bord : il n’y a pas de passerelle à construire.',
    verdict: (t, purse) => {
      if (t.verdict === 'paid')
        return `Le pilier tient. ${counted(t.cost, PLANKS)}, il te reste ${counted((purse?.of ?? 0) - t.cost, COINS)}.`;
      if (t.verdict === 'ruins')
        return `Le pilier tient : ${counted(t.cost, PLANKS)}. Ta bourse ne paie que ${counted(purse?.of ?? 0, PLANKS)} : le marchand reprend ses planches.`;
      return 'Le pilier ne tient pas : le marchand reprend ses planches, et aucune pièce n’est dépensée.';
    },
    purse: (left, of) => `Bourse : ${counted(left, COINS)} sur ${of}`,
  },
  end: { text: 'Tu as bâti les passerelles, forgé toi-même les quatre clés de la leçon et trouvé le jour de la fête.' },
});

// ───────────────────────── the final mission ─────────────────────────

const MISSION_TEXT = frAll({
  title: 'Le tableau du port',
  prompt: 'Appuie sur E — Le tableau du port',
  objective: `Au tableau du port : trois navettes traversent 1 jour, puis restent au port ${MI.rests.join(', ')} jours. Quel est le prochain jour où les trois traversent ensemble ? ${counted(MI.posters, ['affiche', 'affiches'])} par essai.`,
  lead: [
    'Les trois navettes du port traversent toutes le jour 1.',
    `La navette du nord traverse 1 jour, puis reste au port ${days(MI.rests[0])} ; celle de l’ouest traverse 1 jour, puis reste au port ${days(MI.rests[1])} ; celle du sud traverse 1 jour, puis reste au port ${days(MI.rests[2])}.`,
    'La fête des navettes aura lieu le prochain jour où les trois traversent ensemble. Quel jour ?',
  ],
  nan: 'Écris un jour : un nombre entier à partir de 1.',
  start: 'Le jour 1, c’est le départ : 0 jour depuis le départ.',
  again: 'Les trois traversent ensemble ce jour-là, mais ce n’est pas la première fois depuis le jour 1.',
  atPort: (day, idle) => `Le jour ${nb(day)}, ${atPort(idle)}.`,
  boxLabel: 'Le jour de la fête',
  text: {
    check: 'Vérifier',
    later: 'Pas maintenant',
    posters: (left, of) => `${counted(left, ['affiche', 'affiches'])} sur ${of}`,
    spent: 'Plus d’affiche : le tableau est vidé. Relis les rythmes, puis reviens avec trois affiches neuves.',
  },
  labels: {
    team: (i) => FERRY_NAMES[i],
    // the window can stand past day 1 000 (2 129, the rest days' trap): every number grouped by thousands
    since: (n) => nb(n),
    before: (from) => `… ${nb(from - 1)} jours`,
  },
});

/** What a typed day IS: the world's fact, written from who crosses that day — never the answer, never 681. */
function missionFact(day) {
  const f = daysFact(FERRY_CYCLES, day);
  if (f.kind === 'nan') return MISSION_TEXT.nan;
  if (f.kind === 'first') return 'ok';
  if (f.kind === 'start') return MISSION_TEXT.start;
  if (f.kind === 'again') return MISSION_TEXT.again;
  return MISSION_TEXT.atPort(day, f.idle);
}
/** The day typed in the mission's box: a whole number or NaN. */
const missionDay = (values) => {
  const t = String(values?.day ?? '').trim();
  return /^\d{1,6}$/.test(t) ? Number(t) : NaN;
};

const MISSION = {
  prompt: MISSION_TEXT.prompt,
  objective: MISSION_TEXT.objective,
  title: MISSION_TEXT.title,
  lead: MISSION_TEXT.lead,
  lines: () => [line([fr('Le jour'), slot('day', MISSION_TEXT.boxLabel, 4)])],
  check: (values) => missionFact(missionDay(values)),
  posters: MI.posters,
  window: { cycles: FERRY_CYCLES, day: missionDay, labels: MISSION_TEXT.labels },
  text: MISSION_TEXT.text,
  onSolved: (game) => {
    game.say(game.T.say.solved, 9);
    game.onModule(PROBLEM_MODULE);
  },
  onSpent: (game) => game.say(game.T.say.spent, 9),
};

// ───────────────────────── the story ─────────────────────────

export const STORY = {
  islands: ISLANDS,
  segments: SEGMENTS,
  dashWaves: DASH_WAVES,
  text: TEXT,
  convoys: CONVOYS,
  mission: MISSION,

  /**
   * The instruction of the moment — the WHOLE instruction (it stays on screen): on the island of a walkway, the crews and
   * their planks, the constraint, the purse; on a standing bridge, where it leads; once a walkway stands, to cross. null:
   * the world's own (the rail).
   */
  objective(game, seg) {
    const o = game.T.objective;
    if (seg.kind === 'walkway')
      return seg.complete ? o.cross : o.walkway(seg.crews, CONVOYS[seg.convoy].purse, Boolean(seg.bench));
    if (seg.standing) return o.standing(NAME[ISLANDS[seg.index + 1].id]);
    return null;
  },
  /**
   * The card on the right: after a walkway, the pillar and its two equalities, and the coins it cost — facts, never the
   * rule. Elsewhere the world's.
   */
  recall(game, k) {
    const R = game.T.recall;
    const before = game.segs[k - 1];
    if (!before || before.kind !== 'walkway' || !before.complete) return null;
    const d = before.builtWith ?? before.a;
    const cost = before.crews.reduce((n, b) => n + d / b, 0);
    return [R.pillar(d, before.crews), R.paid(cost, CONVOYS[before.convoy].purse - cost)];
  },

  /** What the story does on arriving at island k. No rule is told: each one is forged in the mirror of an island. */
  onArrive(game, k) {
    const { say } = game.T;
    if (k === 1 && missing(game, K.pilier)) game.openForge(K.pilier);
    if (k === 2) game.say(say.chantier, 9);
    if (k === 3 && missing(game, K.facteurs)) game.openForge(K.facteurs);
    if (k === 4 && missing(game, K.rendezvous)) game.openForge(K.rendezvous);
    if (k === 5 && missing(game, K.equipes)) game.openForge(K.equipes);
    if (k === 6) game.say(say.port, 9);
  },
  /** What the story does once the tablet of a key is closed: the modules it completes are done, then the road goes on. */
  afterKey: {
    [K.pilier]: (game) => {
      completeModules(game, K.pilier);
      game.refreshObjective();
    },
    [K.facteurs]: (game) => {
      completeModules(game, K.facteurs);
      game.refreshObjective();
      game.say(game.T.say.toStory, 9);
    },
    [K.rendezvous]: (game) => {
      completeModules(game, K.rendezvous);
      game.refreshObjective();
      game.say(game.T.say.toTeams, 9);
    },
    [K.equipes]: (game) => {
      completeModules(game, K.equipes);
      game.refreshObjective();
      game.say(game.T.say.f, 8);
      game.save();
    },
  },
  /** The forge the story is waiting for, when the page was closed in front of its mirror. */
  pendingForge(game) {
    const { stage } = game.state;
    if (stage === 1 && missing(game, K.pilier)) return K.pilier;
    if (stage === 3 && missing(game, K.facteurs)) return K.facteurs;
    if (stage === 4 && missing(game, K.rendezvous)) return K.rendezvous;
    if (stage === 5 && missing(game, K.equipes)) return K.equipes;
    return null;
  },
  /** A walkway stands: the pillar, what each crew laid, the coins left. */
  onHold(game, seg, t) {
    game.say(game.T.say.held(t, CONVOYS[seg.convoy].purse), 9);
    return true;
  },
};
