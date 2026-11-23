/**
 * THE STORY of lesson « Décomposer un nombre en facteurs premiers » in the world « L’archipel des diviseurs » — what the
 * world's mechanic plays (`divisorIsles/Game.js`): its islands and gaps, the waves of its gate dash, its words, and what
 * happens on the way. The design is `docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md`, lesson 1. ONE road: he
 * arrives with planks, every gap is one of the lesson's numbers (`math.js › NUMBERS`), and each key opens on what the road
 * has just put in his hands. No rule is told on the islands: each one is forged in the mirror of an island.
 *
 *   A → B → C   60 cases (moulds 9, 4, 2), then 72 (moulds 5, 9, 3): planks of his choice — a composite plank holds too.
 *               C: the mirror of key 1 `plus-petit-premier` (the ladder, mode `factor`, on 60, 72, 495).
 *   C → D       1 400 cases, moulds 3, 6, 8: only 8 holds — and a plank of 8 is three planks of 2 end to end.
 *               D: the mirror of key 2 `puissances` (no experiment: his own ladders of key 1).
 *   D → E       91 cases, no mould: the island's workshop makes planks up to 90 cases; 7, 13 (and 1) hold — the number
 *               that looks prime. E: the mirror of key 3 `arret` (the experiment `pairs` on 91, 97, 221).
 *   E → F       97 cases, the workshop makes planks up to 96 cases: only planks of 1 hold — 97 is prime, and his new key
 *               says which lengths he had to try before knowing it.
 *               F: the mirror of key 4 `tableur` (the experiment `sheet` on 2 431, 4 641, 3 127) — BEFORE the gap of
 *               2 431 cases, too long to try by hand.
 *   F → G       2 431 cases, the workshop (up to 2 430): 11, 13, 17 and their products hold.
 *   G → H       the gate dash (its waves use the four keys, all forged).
 *   H → I       the last bridge, the lesson's problem: a gap announced ONLY as « 2³ × 3² × 7 cases », the store offers 36
 *               and 48. 36 = 2² × 3² fits in it (14 planks); 48 = 2⁴ × 3 does not — « the same primes are there, so it
 *               divides » is the error the lesson fights.
 * Every number is in `NUMBERS` (math.js); the sentences and the tablets are written from it. The hooks receive the game
 * and use its commands; they hold no mechanic.
 */
import {
  BOSS_A,
  CELLS,
  NUMBERS,
  counted,
  frAll,
  fr,
  isPrime,
  listFr,
  nb,
  planksOf,
  powTex,
  powersOf,
  productTex,
  tx,
} from './math';

export { NUMBERS };

/** The four keys, in the order of the road. */
export const K = { ladder: 'plus-petit-premier', powers: 'puissances', stop: 'arret', tool: 'tableur' };

const [R60, R72, R1400, R91, R97, R2431] = NUMBERS.road;
const B = NUMBERS.boss;
const BOSS_POW = powersOf(BOSS_A);
/** The last bridge's gap as the store, the mission and the robot announce it: its decomposition, never its value. */
const BOSS_TEX = powTex(BOSS_POW);
const BOSS_TEXT = '2³ × 3² × 7';

/**
 * The lesson's modules (its config keeps them as DATA: progress, the reports and the compass read their numbers) and the
 * keys their learning points need — P1 ← keys 1 and 3, P2 ← key 2, P3 ← keys 3 and 4. `journey.test.js` checks this
 * table against the config. Modules 0 and 6 teach no learning point; module 5 is the last bridge.
 */
export const MODULE_KEYS = {
  1: [K.ladder],
  2: [K.ladder, K.powers],
  3: [K.ladder, K.stop],
  4: [K.stop, K.tool],
  5: [K.ladder, K.powers],
};
/** Module 5 is the lesson's problem: done when the store of the last bridge is paid. */
const PROBLEM_MODULE = '5';
/** The key just sealed completes the modules that teach it and need nothing he does not hold yet. */
function completeModules(game, key) {
  const held = [...game.state.keys, key];
  for (const [m, keys] of Object.entries(MODULE_KEYS))
    if (m !== PROBLEM_MODULE && keys.includes(key) && keys.every((k) => held.includes(k))) game.onModule(m);
}

const missing = (game, key) => !game.state.keys.includes(key);
const bridge = (id, a, len, holdsWith, extra = {}) => ({
  id,
  kind: 'bridge',
  a,
  len,
  moulds: [],
  predict: false,
  holdsWith,
  ...extra,
});
/** The workshop of an island: it works from the start, he TYPES the plank's length (1 … max). */
const workshop = (max) => ({ min: 1, max, open: true, typed: true });

const ISLANDS = [
  { id: 'A', name: 'Le quai des charpentiers', R: 9, theme: 'meadow', turn: 0 },
  { id: 'B', name: 'L’île des galets', R: 8, theme: 'meadow', turn: 0.38 },
  { id: 'C', name: 'L’île du miroir clair', R: 9.5, theme: 'crystal', turn: -0.42 },
  { id: 'D', name: 'L’île des enclumes', R: 9.5, theme: 'crystal', turn: 0.4, feature: 'anvil' },
  { id: 'E', name: 'L’île des cerfs-volants', R: 9.5, theme: 'pine', turn: -0.35, feature: 'anvil' },
  { id: 'F', name: 'L’île des lanternes', R: 9.5, theme: 'pine', turn: 0.3, feature: 'anvil' },
  { id: 'G', name: 'L’île des mouettes', R: 10.5, theme: 'autumn', turn: -0.3 },
  { id: 'H', name: 'L’île des voiles', R: 9, theme: 'stone', turn: 0.25 },
  { id: 'I', name: 'Le cap du phare', R: 12, theme: 'snow', turn: 0 },
];
const SEGMENTS = [
  bridge(`g${R60.a}`, R60.a, 15, R60.plank, { moulds: R60.moulds }),
  bridge(`g${R72.a}`, R72.a, 16, R72.plank, { moulds: R72.moulds }),
  // the long gaps are drawn as a strip of light (no tick per cell past 200 cells: Game.js › buildBridge)
  bridge(`g${R1400.a}`, R1400.a, 22, R1400.plank, { moulds: R1400.moulds }),
  bridge(`g${R91.a}`, R91.a, 16, R91.plank, { workshop: workshop(R91.workshop) }),
  bridge(`g${R97.a}`, R97.a, 16, R97.plank, { workshop: workshop(R97.workshop) }),
  bridge(`g${R2431.a}`, R2431.a, 24, R2431.plank, { workshop: workshop(R2431.workshop) }),
  { id: 'dash', kind: 'rail', len: 300 },
  {
    id: `g${BOSS_A}`,
    kind: 'bridge',
    a: BOSS_A,
    len: 26,
    moulds: [],
    holdsWith: B.plank,
    // the gap is ANNOUNCED by its decomposition, never by its count (the world's `boss.label`: the sign over the gap
    // « 2³ × 3² × 7 cases », the store's template « 2³ × 3² × 7 = 36 × [ ] » and the world's equation all write it)
    boss: { options: B.options, price: B.price, label: { text: BOSS_TEXT, tex: BOSS_TEX } },
  },
];

/**
 * The gate dash (after island G: the four keys are forged): one sentence, three gates, exactly one right, each with its
 * guidance (`why`, read by the world's `explain`). Mental arithmetic — every number at most 100 — and no pair of the
 * exercise bank (`story.test.js`).
 */
const wave = (say, gates, test, why) => ({ say: fr(say), gates, test, why: frAll(why) });
const DASH_WAVES = [
  wave('Le plus petit nombre premier qui divise 91', [3, 7, 13], (n) => n === 7, {
    right: '$91 = 7 \\times 13$ : ni 2, ni 3, ni 5 ne divisent 91, 7 le divise.',
    wrong: {
      3: '$91 = 3 \\times 30 + 1$ : 3 ne divise pas 91.',
      13: '13 divise 91, mais 7 aussi, et 7 est plus petit.',
    },
  }),
  wave('$2^3 \\times 3 = \\square$', [18, 24, 12], (n) => n === 24, {
    right: '$2^3 = 2 \\times 2 \\times 2 = 8$, et $8 \\times 3 = 24$.',
    wrong: {
      18: '$18 = 2 \\times 3 \\times 3$ : ici, c’est 2 qui revient trois fois.',
      12: '$12 = 2 \\times 2 \\times 3$ : il manque un 2.',
    },
  }),
  wave('$60 = 2^2 \\times \\square \\times 5$', [3, 6, 9], (n) => 4 * n * 5 === 60, {
    right: '$2^2 \\times 3 \\times 5 = 4 \\times 15 = 60$.',
    wrong: { 6: '$4 \\times 6 \\times 5 = 120$, et non 60.', 9: '$4 \\times 9 \\times 5 = 180$, et non 60.' },
  }),
  wave('Le dernier nombre premier à essayer pour savoir si 89 est premier', [5, 7, 11], (n) => n === 7, {
    right: '$7 \\times 7 = 49$ ne dépasse pas 89, et $11 \\times 11 = 121$ le dépasse : on s’arrête à 7.',
    wrong: {
      5: 'Après 5 vient 7, et $7 \\times 7 = 49$ ne dépasse pas 89 : il faut encore essayer 7.',
      11: '$11 \\times 11 = 121$ dépasse 89 : inutile d’essayer 11.',
    },
  }),
  wave('Un nombre premier', [51, 57, 59], (n) => isPrime(n), {
    right: '59 : ni 2, ni 3, ni 5, ni 7 ne le divisent, et $11 \\times 11 = 121$ dépasse 59.',
    wrong: { 51: '$51 = 3 \\times 17$ : 51 n’est pas premier.', 57: '$57 = 3 \\times 19$ : 57 n’est pas premier.' },
  }),
  wave('$72 = 2^{\\square} \\times 3^2$', [2, 3, 4], (n) => 2 ** n * 9 === 72, {
    right: '$72 = 8 \\times 9 = 2^3 \\times 3^2$.',
    wrong: {
      2: '$2^2 \\times 3^2 = 4 \\times 9 = 36$, et non 72.',
      4: '$2^4 \\times 3^2 = 16 \\times 9 = 144$, et non 72.',
    },
  }),
  wave('Le plus petit nombre premier qui divise 85', [3, 5, 17], (n) => n === 5, {
    right: '$85 = 5 \\times 17$ : 2 et 3 ne divisent pas 85, 5 le divise.',
    wrong: {
      3: '$85 = 3 \\times 28 + 1$ : 3 ne divise pas 85.',
      17: '17 divise 85, mais 5 aussi, et 5 est plus petit.',
    },
  }),
  wave('$2 \\times 3^2 \\times 5 = \\square$', [30, 45, 90], (n) => n === 90, {
    right: '$3^2 = 9$, et $2 \\times 9 \\times 5 = 90$.',
    wrong: {
      30: '$30 = 2 \\times 3 \\times 5$ : ici, 3 revient deux fois.',
      45: '$45 = 3^2 \\times 5$ : il manque le facteur 2.',
    },
  }),
];

/**
 * The tablet of each rule: its name comes AFTER the student forged it. `lines` go through MathText; `math` are formulas
 * whose equality the story suite re-computes (it reads products, not powers: the powers stand in the lines); `notes` are
 * plain text (no `$`).
 */
const tablet = (t) => ({ ...t, lines: t.lines.map(fr), notes: (t.notes ?? []).map(fr) });
export const TABLETS = {
  [K.ladder]: tablet({
    icon: '🪜',
    title: 'Décomposer en facteurs premiers',
    lines: [
      'On divise par le plus petit nombre premier qui divise le nombre, de nouveau tant qu’il le divise, puis par le nombre premier suivant, jusqu’au quotient 1.',
      'Les diviseurs obtenus sont les facteurs premiers du nombre : leur produit redonne le nombre.',
    ],
    math: [`${tx(60)} = ${productTex([2, 2, 3, 5])}`, `${tx(495)} = ${productTex([3, 3, 5, 11])}`],
    notes: ['72 : on divise par 2 trois fois (36, 18, 9), puis par 3 deux fois (3, 1)'],
  }),
  [K.powers]: tablet({
    icon: '🔢',
    title: 'Écrire avec des puissances',
    lines: [
      'Un facteur premier qui revient plusieurs fois s’écrit une seule fois, avec en exposant le nombre de fois : $2 \\times 2 \\times 2 = 2^3$.',
      `On range les facteurs du plus petit au plus grand : $72 = ${powTex(powersOf(72))}$ et $${tx(1400)} = ${powTex(powersOf(1400))}$.`,
    ],
    math: [`${productTex([2, 2, 2, 3, 3])} = 72`, `${productTex([2, 2, 2, 5, 5, 7])} = ${tx(1400)}`],
    notes: ['2³ = 2 × 2 × 2 = 8, et non 2 × 3 = 6'],
  }),
  [K.stop]: tablet({
    icon: '🛑',
    title: 'Savoir où s’arrêter',
    lines: [
      'Pour savoir si $n$ est premier, on essaie les divisions par 2, 3, 5, 7… tant que le carré du diviseur ne dépasse pas $n$.',
      'Si aucune ne tombe juste, $n$ est premier : un diviseur plus grand aurait un partenaire plus petit, déjà essayé.',
    ],
    math: ['91 = 7 \\times 13', '11 \\times 11 = 121'],
    notes: ['97 est premier : ni 2, ni 3, ni 5, ni 7 ne le divisent, et 11 × 11 = 121 dépasse 97'],
  }),
  [K.tool]: tablet({
    icon: '📊',
    title: 'Un outil pour les grands nombres',
    lines: [
      'Pour un grand nombre, un tableur ou un programme calcule les restes de ses divisions par 2, 3, 5, 7, 11… : on lit la première ligne où le reste est 0.',
      'On divise, puis on recommence sur le quotient ; quand aucun reste n’est 0 jusqu’au carré, le quotient est premier.',
    ],
    math: [`${tx(2431)} = ${productTex([11, 13, 17])}`, `${tx(4641)} = ${productTex([3, 7, 13, 17])}`],
    notes: [`${nb(3127)} = 53 × 59 : la ligne de 53 montre le reste 0`],
  }),
};

const cellsLeft = (r) => counted(r, ['case vide', 'cases vides']);
/** « 9, 4 ou 2 » — the moulds of an island, one of which he takes. */
const orList = (xs) => (xs.length < 2 ? String(xs[0] ?? '') : `${xs.slice(0, -1).join(', ')} ou ${xs.at(-1)}`);

/** The story's own words, laid over the world's (`divisorIsles/strings.js`); every sentence takes French typography. */
const TEXT = frAll({
  title: 'L’archipel des diviseurs : le cap du phare',
  // he carries PLANKS (« Tu portes des planches de 9 ») and the store sells planks (« Planches de 36 »): the world's
  // pilot words « le moule 48 », « la réserve des moules » are not this story's
  prompt: { boss: 'Ouvre la réserve du dernier pont' },
  predict: { cancel: 'Je change de planches' },
  verdict: {
    holds: (b, a) => `Les planches de ${b} remplissent exactement ${a} : le pont tient`,
    open: (b, a) => `Les planches de ${b} ne remplissent pas ${a} : le pont ne tient pas`,
  },
  subtitle:
    'La tempête a cassé les ponts jusqu’au phare du cap. Avec le robot Zéro, remplis chaque fossé de planches : certains nombres se cassent en morceaux plus petits, d’autres ne se cassent pas.',
  objective: {
    // the first two islands: a gap, the moulds of the island, the planks he carries
    pick: (a, moulds) =>
      `Un fossé de ${counted(a, CELLS)}. Prends un moule sur un socle (${orList(moulds)}), puis construis le pont au socle lumineux : les planches doivent remplir le fossé exactement.`,
    carry: (a, b) =>
      `Tu portes des planches de ${b}. Construis le pont au socle lumineux : il tient si elles remplissent exactement les ${nb(a)} cases. Un autre moule ? Change-le sur son socle.`,
    // the island of 1 400 cases (after key 1)
    long: (moulds) =>
      `Un long fossé : ${nb(R1400.a)} cases. Trois moules, ${listFr(moulds)} : un seul remplit le fossé exactement. Trouve-le, puis construis le pont au socle lumineux.`,
    // the islands with a workshop: the gap, the longest plank it makes, what he carries
    make91: `${R91.a} cases, et aucun moule sur cette île. L’atelier fabrique des planches de ${R91.workshop} cases au plus : quelle longueur remplit exactement ${R91.a} cases ? Fabrique-la, puis construis le pont.`,
    make97: `${R97.a} cases. L’atelier fabrique des planches de ${R97.workshop} cases au plus. Quelles longueurs dois-tu essayer pour savoir lesquelles remplissent ${R97.a} ? Fabrique ta planche, puis construis le pont.`,
    // the island of 2 431 cases: before key 4 (the mirror opens), then with it
    wait2431: `${nb(R2431.a)} cases : bien trop long pour essayer chaque planche à la main. Le miroir de l’île s’ouvre.`,
    make2431: `${nb(R2431.a)} cases, trop long pour la main. Avec ta clé, trouve une longueur qui le remplit, fabrique-la à l’atelier (${nb(R2431.workshop)} cases au plus), puis construis le pont.`,
    carryMade: (a, b) =>
      `Planches de ${b} en main : construis le pont au socle lumineux. Si elles ne remplissent pas les ${nb(a)} cases, fabrique une autre longueur à l’atelier.`,
    board: 'Monte sur le glisseur de lumière jusqu’à l’île des voiles',
    bossGo: `Va au socle lumineux et choisis les planches qui remplissent les $${BOSS_TEX}$ cases du dernier pont`,
    bossCross: 'Le dernier pont tient : traverse jusqu’au phare !',
    end: 'Rallume le phare du cap',
  },
  say: {
    hello:
      'Je suis Zéro ! La tempête a cassé les ponts jusqu’au phare. Prends un moule sur un socle, puis viens au socle lumineux, près du fossé.',
    b72: `Encore un fossé : ${R72.a} cases. Lequel de ces moules le remplit ?`,
    // what waits after each forge
    afterLadder: `Un long fossé t’attend : ${nb(R1400.a)} cases, et trois moules.`,
    afterPowers: `Plus de moules ici : l’atelier de l’île fabrique la planche que tu veux. ${R91.a} cases à remplir.`,
    afterStop: `${R97.a} cases, maintenant. Ta nouvelle clé te dit quelles longueurs essayer.`,
    afterTool: `À toi : ${nb(R2431.a)} cases. L’atelier fabrique la longueur que ta clé t’aura donnée.`,
    // said by the world after two refusals on a bridge with a workshop (the pilot's sentence named its gap of 7)
    anvilOpen: 'L’atelier de l’île est ouvert : fabrique une planche de la longueur que tu choisis.',
    f: 'Le glisseur de lumière est prêt. Lis la phrase, et passe par la porte qui la vérifie.',
    boss: `Voici le dernier pont : $${BOSS_TEX}$ cases jusqu’au phare. Dans la réserve, deux sortes de planches : ${listFr(B.options)}.`,
    bossFail: (b, r) =>
      `Il reste ${cellsLeft(r)} : les planches de ${b} ne remplissent pas le pont. $${b} = ${powTex(powersOf(b))}$ : compare ses exposants à ceux du pont, puis essaie l’autre planche.`,
    bossOk: `${planksOf(BOSS_A / B.plank, B.plank)} et aucune case vide : $${BOSS_TEX} = ${B.plank} \\times ${BOSS_A / B.plank}$. Le dernier pont tient !`,
    end: 'Le phare du cap brille de nouveau. Merci !',
    // a bridge held: its equality as the world laid it
    held: (a, b, q) => `${planksOf(q, b)}, et aucune case vide : $${tx(a)} = ${b} \\times ${tx(q)}$.`,
    held1400: (b, q) =>
      `${planksOf(q, b)}, et aucune case vide : $${tx(R1400.a)} = ${b} \\times ${q}$. Et une planche de 8, c’est trois planches de 2 bout à bout.`,
    held91: (b, q) =>
      b === 1
        ? `${planksOf(q, b)} : le pont tient, mais ${R91.a} n’est pas cassé en morceaux plus grands que 1.`
        : `${planksOf(q, b)} : $${R91.a} = ${b} \\times ${q}$. ${R91.a} se casse donc en morceaux plus petits.`,
    held97: (q) => `${planksOf(q, 1)} : aucune autre longueur de l’atelier ne remplit ${R97.a} cases.`,
  },
  workshop: {
    // a typed length longer than this island's workshop makes (its `max` is not always the gap: 90 for 91 cases)
    tooLong: (b, max) =>
      `Ici, l’atelier fabrique des planches de ${nb(max)} cases au plus : ${nb(b)}, c’est trop long.`,
  },
  /** The card on the right (kit/Instruction.jsx › Recall): what matters from the island before. */
  recall: {
    bridge: (a, b, q) => `Le fossé précédent : $${tx(a)} = ${b} \\times ${tx(q)}$`,
    eight: '$8 = 2 \\times 2 \\times 2$',
  },
  boss: {
    title: 'La réserve du dernier pont',
    mission: `Ta mission : le dernier pont mesure ${BOSS_TEXT} cases. Choisis les planches qui le remplissent exactement, construis-le, puis paie ses planches.`,
    choose: `Lesquelles remplissent exactement les ${BOSS_TEXT} cases ? Décompose ${listFr(B.options)} dans ton cahier, puis choisis.`,
    steps: ['Choisis des planches et calcule', 'Construis le pont', 'Paie'],
    price: `Prix d’une planche : ${B.price} €`,
    // the store's compute step, with the label (`boss.label`): ONE box, the number of planks — worked out from the
    // decompositions, never from a division of the gap's count (which is not shown)
    divide: (b) => `Planches de ${b} : combien en faut-il pour remplir exactement le pont ?`,
    costAsk: (b, q) =>
      `Le pont tient : ${planksOf(q, b)}. Une planche coûte ${B.price} €. Combien paies-tu à la réserve ?`,
    unit: '€',
    err: {
      long: (b, q) => `${planksOf(q, b)}, cela fait ${counted(b * q, CELLS)} : plus long que le pont !`,
      short: (b, q) => `${planksOf(q, b)}, cela fait ${counted(b * q, CELLS)} : le pont n’est pas rempli.`,
      count: 'Écris le nombre de planches.',
      sum: (b, q, r) => `Vérifie : $${b} \\times ${q} + ${r} = ${b * q + r}$, et le pont fait $${BOSS_TEX}$ cases.`,
    },
  },
  end: { text: 'Tu as rallumé le phare du cap, et forgé toi-même les quatre clés de la leçon.' },
});

/** The bridge he is building (a segment of the road), by its gap. */
const isGap = (seg, r) => seg.a === r.a && !seg.boss;

export const STORY = {
  islands: ISLANDS,
  segments: SEGMENTS,
  dashWaves: DASH_WAVES,
  text: TEXT,
  /** No convoy on this road: every bridge is built with the planks of its own island. */
  convoys: {},

  /**
   * The instruction of the moment — the WHOLE instruction (it stays on screen): the gap, what the island offers (its
   * moulds, or its workshop and the longest plank it makes), the planks he carries. null: the world's own (a bridge built,
   * the rail, the store).
   */
  objective(game, seg) {
    const o = game.T.objective;
    if (seg.complete || seg.kind !== 'bridge' || seg.boss) return null;
    const b = game.state.held;
    if (isGap(seg, R2431) && missing(game, K.tool)) return o.wait2431;
    if (seg.workshop) {
      if (b != null) return o.carryMade(seg.a, b);
      if (isGap(seg, R91)) return o.make91;
      if (isGap(seg, R97)) return o.make97;
      return o.make2431;
    }
    if (b != null) return o.carry(seg.a, b);
    if (isGap(seg, R1400)) return o.long(seg.moulds);
    return o.pick(seg.a, seg.moulds);
  },
  /** The card on the right: the bridge just crossed, as an equality (and, after 1 400, what a plank of 8 is made of). */
  recall(game, k) {
    const R = game.T.recall;
    const before = game.segs[k - 1];
    if (!before || before.kind !== 'bridge' || !before.complete) return null;
    const b = before.builtWith ?? before.holdsWith;
    const line = R.bridge(before.a, b, before.a / b);
    return before.a === R1400.a && b === 8 ? [line, R.eight] : [line];
  },

  /** What the story does on arriving at island k. No rule is told: each one is forged in the mirror of an island. */
  onArrive(game, k) {
    const { say } = game.T;
    if (k === 1) game.say(say.b72, 7);
    if (k === 2 && missing(game, K.ladder)) game.openForge(K.ladder);
    if (k === 3 && missing(game, K.powers)) game.openForge(K.powers);
    if (k === 4 && missing(game, K.stop)) game.openForge(K.stop);
    if (k === 5 && missing(game, K.tool)) game.openForge(K.tool);
    if (k === 6) game.say(say.f, 8);
    if (k === 7) game.say(say.boss, 9);
  },
  /** What the story does once the tablet of a key is closed: the modules it completes are done, then the road goes on. */
  afterKey: {
    [K.ladder]: (game) => {
      completeModules(game, K.ladder);
      game.refreshObjective();
      game.say(game.T.say.afterLadder, 8);
    },
    [K.powers]: (game) => {
      completeModules(game, K.powers);
      game.refreshObjective();
      game.say(game.T.say.afterPowers, 8);
    },
    [K.stop]: (game) => {
      completeModules(game, K.stop);
      game.refreshObjective();
      game.say(game.T.say.afterStop, 8);
    },
    // the last key: the store of the last bridge opens with it (`flags.key4`, Game.js › actAltar)
    [K.tool]: (game) => {
      game.flags.key4 = true;
      completeModules(game, K.tool);
      game.refreshObjective();
      game.say(game.T.say.afterTool, 8);
      game.save();
    },
  },
  /** The forge the story is waiting for, when the page was closed in front of its mirror. */
  pendingForge(game) {
    const { stage } = game.state;
    if (stage === 2 && missing(game, K.ladder)) return K.ladder;
    if (stage === 3 && missing(game, K.powers)) return K.powers;
    if (stage === 4 && missing(game, K.stop)) return K.stop;
    if (stage === 5 && missing(game, K.tool)) return K.tool;
    return null;
  },
  /** A bridge held: the story's own sentence for it — its equality, and on 1 400, 91 and 97 the fact it carries. */
  onHold(game, seg, b, q = seg.a / b) {
    const { say } = game.T;
    if (seg.boss) return false;
    if (seg.a === R1400.a) game.say(say.held1400(b, q), 9);
    else if (seg.a === R91.a) game.say(say.held91(b, q), 9);
    else if (seg.a === R97.a) game.say(say.held97(q), 9);
    else game.say(say.held(seg.a, b, q), 7);
    return true;
  },
  // the last bridge is the lesson's problem (module 5: decompose two planks and read the gap's decomposition)
  onBossPaid: (game) => game.onModule(PROBLEM_MODULE),
};
