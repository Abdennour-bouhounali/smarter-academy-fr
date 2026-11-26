/**
 * THE EXPERIMENTS AND THE BENCH of lesson « Engrenages et rendez-vous : quand deux rythmes se retrouvent » — their numbers
 * and their words (the screens and their logic are the world's: `divisorIsles/InquirySheet.jsx` + `sheet.js`,
 * `InquiryCrews.jsx` + `crews.js`; the contract: GAME_WORLD.md « Explore », the spec shapes). The design:
 * `docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md`, lesson 4, version 2.
 *
 *   K1  pilier-commun   NO experiment, NO bench: the walkway of the quay (16 and 20, 14 coins) is the experiment.
 *   SHEET_BENCH         K2's TOOL (not its experiment: lesson 1 sealed the sheet's rule) — `sheet` on the walkway of the
 *                       chantier, two rounds, 414 then 192 (it writes 207, 69, 23 and 96, 48, 24, 12, 6, 3). It KEEPS its
 *                       state and `text.kept` writes both decompositions under the pillar's box (`Workshop.jsx › BenchKept`).
 *   STORY_INQUIRY       K3 traduire-rendez-vous — `crews` / `story`, in the mirror of E: two stories (two wheels of 32 and
 *                       20 teeth; a line every 10 min and a shuttle every 46 min, together at 6 h 10), each TRANSLATED by
 *                       him into two crews (chips: translation errors only — 52 the sum, 12 the difference, 2 the wheels;
 *                       6 the start hour, 2 the lines, 3 the line's number), a pillar on the story's own ruler 0 … 700,
 *                       then read back into the story (160 teeth, 5 and 8 turns; 10 h 00).
 *   DAYS_INQUIRY        K4 cinq-equipes — `crews` / `days`, in the mirror of F: five teams, team x works 1 day then sleeps
 *                       x days, all at work on day 1, 62 days drawn; day 1 first (0 days since the start), then teams 1–2
 *                       (day 7), 1–3 (day 13), 1–4 (day 61, the run stops on 13, 25, 31, 37, 49 naming the one asleep),
 *                       all five (day 61 again).
 * No sentence here states a rule: each says what the sheet, the crews, the story or the teams have just done
 * (`inquiries.test.js` forbids the words of each key). Nothing is drawn as a gear (the owner): the wheels are words only.
 */
import { CELLS, NUMBERS, ROWS, counted, frAll, lcm, listFr, nb, tx } from './math';

const { factors: FC, story: ST, days: DY } = NUMBERS;

// ───────────────────────── K2's tool — the spreadsheet of lesson 1, on the chantier's walkway (`sheet`) ─────────────────────────

const [F1] = FC.crews;
const lineList = (zeros) => (zeros.length > 1 ? `les lignes ${listFr(zeros)} montrent` : `la ligne ${zeros[0]} montre`);
const product = (xs) =>
  [...xs]
    .sort((x, y) => x - y)
    .map(tx)
    .join(' \\times ');
/** « 2 × 3^{2} × 23 »: the primes found, increasing, each once with its exponent. */
const powersTex = (xs) =>
  [...new Set([...xs].sort((x, y) => x - y))]
    .map((p) => {
      const k = xs.filter((x) => x === p).length;
      return k > 1 ? `${tx(p)}^{${k}}` : tx(p);
    })
    .join(' \\times ');

/**
 * What the sheet kept, as the walkway's card writes it under the pillar's box (`Workshop.jsx › BenchKept`, at most four
 * lines): each round he finished, with its powers « 414 = 2 × 3² × 23 » (gate B 2026-11-26: the tiles of forge 2 speak
 * of « exposant », so the card shows one), and the round he left half-way, as far as he went (« 192 = 2 × 96 »).
 * Nothing else: no pillar. `s` is a state `sheet.js › sheetFrom` accepted for this spec.
 */
function sheetKept(s) {
  const done = (s.rounds ?? []).map((r) => `$${tx(r.n)} = ${powersTex(r.factors)}$`);
  const n0 = SHEET_BENCH.rounds[s.ri]?.n;
  const open =
    s.stage !== 'seen' && s.factors?.length && n0 ? [`$${tx(n0)} = ${product(s.factors)} \\times ${tx(s.n)}$`] : [];
  return [...done, ...open];
}

export const SHEET_BENCH = {
  kind: 'sheet',
  stop: 'square',
  rounds: FC.crews.map((n) => ({ n })),
  text: frAll({
    lead: (n) =>
      n === F1
        ? `Des planches de ${counted(n, CELLS)} : la feuille de calcul de l’atelier. En A, des nombres premiers ; en B, le reste de la division de ${nb(n)} par chacun. Clique la ligne que tu lis.`
        : `Des planches de ${counted(n, CELLS)} : la même feuille. Clique une ligne, ou dis que le nombre est premier.`,
    goal: (n) => `Avec la feuille, trouver les nombres premiers dont le produit fait ${nb(n)}.`,
    primeHead: 'Premier',
    ask: ({ n, lines }) => `${nb(n)} sur la feuille, ${counted(lines, ROWS)}. Quelle ligne lis-tu ?`,
    prime: 'Il est premier',
    held: (a) =>
      a.after === 1
        ? `Ligne ${a.p} : reste 0. $${tx(a.before)} \\div ${a.p} = 1$ : il ne reste rien.`
        : `Ligne ${a.p} : reste 0. $${tx(a.before)} \\div ${a.p} = ${tx(a.after)}$, et la feuille se remplit de nouveau pour ${nb(a.after)}.`,
    miss: (a) => `Ligne ${a.p} : le reste est ${a.r}, et non 0. ${a.p} ne divise pas ${nb(a.before)}.`,
    notPrime: ({ n, zeros }) => `Pas encore : sur la feuille de ${nb(n)}, ${lineList(zeros)} le reste 0.`,
    notebook: 'Le cahier',
    end: ({ n, factors }) => `La feuille de ${nb(n)} est finie : les nombres trouvés sont ${listFr(factors.map(nb))}.`,
    foundLine: (r) => `${nb(r.n)} : ${listFr(r.factors.map(nb))}`,
    next: 'Nombre suivant',
    done: 'Retour au chantier',
    kept: sheetKept,
  }),
};

// ───────────────────────── K3 — a story translated into crews (`crews` / `story`) ─────────────────────────

const [GA, GB] = ST.gears;
const [BA, BB] = ST.bus.every;
const [H0, M0] = ST.bus.start;
const GL = lcm(GA, GB);
const BL = lcm(BA, BB);
/** « 6 h 10 », « 10 h 00 » — a clock time as the story writes it. */
export const clockFr = (h, m) => `${h} h ${String(m).padStart(2, '0')}`;
/** The clock time `t` minutes after the start of the story of the buses: [h, min]. */
export const clockAfter = (t) => {
  const all = H0 * 60 + M0 + t;
  return [Math.floor(all / 60), all % 60];
};
const AT_BL = clockAfter(BL);

/** The two stories of the mirror of E, as the world knows them (the forge reads them back: `forges.js`). */
export const STORIES = {
  gears: { a: GA, b: GB, unit: ['dent', 'dents'], first: GL },
  bus: { a: BA, b: BB, unit: ['minute', 'minutes'], first: BL, start: [H0, M0] },
};

const GEARS_ROUND = frAll({
  text: [
    `Deux roues dentées s’engrènent : l’une a ${GA} dents, l’autre ${GB}. On marque la dent de chacune qui touche l’autre.`,
    'Les deux marques se retrouvent face à face pour la première fois après combien de dents passées ? Combien de tours a fait chaque roue ?',
  ],
  unit: { options: ['une dent', 'un tour', 'une roue'], right: 'une dent' },
  // translation errors only — 52 the sum, 12 the difference, 2 the number of wheels — never a result (5, 8, 160)
  numbers: [GA, GB, GA + GB, GA - GB, 2],
  crews: [GA, GB],
  ask: [
    { id: 'teeth', label: 'Les marques se retrouvent après', value: GL, after: 'dents' },
    { id: 'turnsA', label: `La roue de ${GA} dents a fait`, value: GL / GA, after: 'tours' },
    { id: 'turnsB', label: `La roue de ${GB} dents a fait`, value: GL / GB, after: 'tours' },
  ],
});
const BUS_ROUND = frAll({
  text: [
    `Au terminus, la ligne 3 part toutes les ${BA} min, la navette de l’aéroport toutes les ${BB} min.`,
    `Elles partent ensemble à ${clockFr(H0, M0)}. À quelle heure repartiront-elles ensemble pour la première fois ?`,
  ],
  unit: { options: ['une minute', 'un bus', 'une heure'], right: 'une minute' },
  // 6 the start hour, 2 the number of lines, 3 the line's number — never 23, 5, 230
  numbers: [BA, BB, H0, 2, 3],
  crews: [BA, BB],
  ask: [{ id: 'at', label: 'Elles repartent ensemble à', value: AT_BL, clock: true }],
});
const isGears = (round) => round.crews[0] === GA;

/** A chip put on the wrong slot: the story's fact (gate A, defect 2), never the result. */
function mapFact({ slot, value, round }) {
  if (slot === 'unit') {
    if (value === 'un tour')
      return `Un tour de la roue de ${GA} dents, c’est ${GA} dents qui passent : l’histoire compte les dents, une à une.`;
    if (value === 'une roue')
      return 'Il n’y a que deux roues : l’histoire compte ce qui passe, une dent après l’autre.';
    if (value === 'un bus')
      return 'Deux bus seulement : l’histoire compte le temps qui passe depuis le départ, minute après minute.';
    return `La ligne 3 part toutes les ${BA} min, pas toutes les ${BA} h : l’histoire compte des minutes.`;
  }
  const other = slot === 'A' ? 'B' : 'A';
  if (round.crews.includes(value))
    return `L’équipe ${other} pose déjà des planches de ${value} : chaque ${isGears(round) ? 'roue' : 'ligne'} a son équipe.`;
  if (isGears(round)) {
    if (value === 2) return '2, c’est le nombre de roues, pas un nombre de dents.';
    return `${value} dents : aucune des deux roues n’en a autant.`;
  }
  if (value === H0) return `${H0} h, c’est l’heure du départ, pas un rythme de bus.`;
  if (value === 2) return '2, c’est le nombre de lignes, pas un rythme de bus.';
  return '3, c’est le numéro de la ligne, pas un rythme de bus.';
}

const multipleOf = (t, a, b) => t > 0 && t % a === 0 && t % b === 0;
/** A value read back wrong: the story's fact (a product that refutes it), never the answer. */
function backFact({ id, said, round }) {
  const n = Number(said);
  if (isGears(round)) {
    if (said == null || said === '' || !Number.isInteger(n)) return 'Écris un nombre entier dans chaque case.';
    if (id === 'teeth') {
      if (multipleOf(n, GA, GB))
        return `Après ${counted(n, ['dent', 'dents'])}, les marques sont face à face, mais elles l’étaient déjà avant.`;
      if (n > 0 && n % GA === 0)
        return `Après ${counted(n, ['dent', 'dents'])}, la roue de ${GB} dents n’a pas fini son tour.`;
      if (n > 0 && n % GB === 0)
        return `Après ${counted(n, ['dent', 'dents'])}, la roue de ${GA} dents n’a pas fini son tour.`;
      return `Après ${counted(n, ['dent', 'dents'])}, aucune des deux marques n’est revenue à sa place.`;
    }
    const who = id === 'turnsA' ? GA : GB;
    return `${counted(n, ['tour', 'tours'])} de la roue de ${who} dents, c’est $${n} \\times ${who} = ${tx(n * who)}$ dents, pas ${GL}.`;
  }
  const h = Number(said?.h);
  const m = Number(said?.min);
  if (!Number.isInteger(h) || !Number.isInteger(m) || m > 59)
    return 'Écris l’heure : les heures, puis les minutes (de 0 à 59).';
  const t = h * 60 + m - (H0 * 60 + M0);
  // « 3 h 50 »: the 230 minutes themselves, read as a clock time
  if (h * 60 + m === BL) return `${clockFr(h, m)} min, c’est la durée depuis ${clockFr(H0, M0)}.`;
  if (t <= 0) return `À ${clockFr(h, m)}, les deux ne sont pas encore parties : elles partent à ${clockFr(H0, M0)}.`;
  if (multipleOf(t, BA, BB))
    return `À ${clockFr(h, m)}, elles repartent ensemble, mais elles l’avaient déjà fait avant.`;
  if (t % BA === 0) return `À ${clockFr(h, m)}, la ligne 3 part, mais pas la navette.`;
  if (t % BB === 0) return `À ${clockFr(h, m)}, la navette part, mais pas la ligne 3.`;
  return `À ${clockFr(h, m)}, aucune des deux ne part.`;
}

/** The walkway's words on the story's ruler: no purse (`crews.js › storyWalk`). */
const PILLAR_WORDS = {
  before: 'Le pilier à',
  after: 'cases du bord',
  plant: 'Poser le pilier',
  lay: 'Les équipes posent',
  take: 'Reprendre le pilier',
  error: {
    empty: 'Écris la distance du pilier.',
    nan: 'Écris un nombre entier de cases.',
    range: (max) => `Le pilier se place entre 0 et ${nb(max)} cases du bord.`,
  },
  crew: (i, b) => `Équipe ${'AB'[i]} : planches de ${nb(b)}`,
  pillar: (d) => counted(d, CELLS),
  short: (n) => counted(n, CELLS),
  band: (n, b) => `${counted(n, ['planche', 'planches'])} de ${nb(b)}`,
  lane: (l, i) => {
    const crew = `L’équipe ${'AB'[i]}`;
    if (l.ends)
      return `${crew} (planches de ${nb(l.b)}) finit pile au pilier : ${counted(l.planks, ['planche', 'planches'])}.`;
    // one line a lane in the mirror's facts column (InquiryCrews.jsx): the shortfall, which is the whole distance
    if (l.planks === 0) return `${crew} ne pose rien : ${counted(l.short, CELLS)}, moins qu’une planche.`;
    return `${crew} s’arrête ${counted(l.short, CELLS)} avant le pilier : ${counted(l.planks, ['planche', 'planches'])}.`;
  },
  shore: 'Un pilier sur le bord : il n’y a pas de passerelle à construire.',
  verdict: (t) =>
    t.holds
      ? 'Le pilier tient : les deux équipes finissent pile dessus.'
      : 'Le pilier ne tient pas : une équipe ne finit pas pile dessus.',
};

export const STORY_INQUIRY = {
  kind: 'crews',
  mode: 'story',
  ruler: ST.ruler,
  rounds: [GEARS_ROUND, BUS_ROUND],
  text: frAll({
    lead: (round, ri) =>
      ri === 0
        ? 'Une histoire sans passerelle. Traduis-la en deux équipes de charpentiers, place le pilier, puis reviens à l’histoire.'
        : 'Une deuxième histoire, au terminus des bus. Même chemin : traduis, place le pilier, puis reviens à l’histoire.',
    goal: (round) =>
      isGears(round)
        ? 'Répondre à l’histoire des deux roues : après combien de dents, et combien de tours pour chacune.'
        : 'Répondre à l’histoire du terminus : à quelle heure les deux repartent ensemble.',
    translate: 'Traduis',
    unitAsk: 'Une case de la passerelle, c’est',
    crewAsk: (i) => `L’équipe ${'AB'[i]} pose des planches de`,
    mapFact,
    pillar: PILLAR_WORDS,
    toStory: 'Reviens à l’histoire',
    hour: 'h',
    minute: 'min',
    check: 'Vérifier',
    backFact,
    end: (r, round) =>
      isGears(round)
        ? `Les marques se retrouvent après ${GL} dents : la roue de ${GA} dents a fait ${GL / GA} tours, celle de ${GB} dents ${GL / GB} tours.`
        : `Les deux repartent ensemble à ${clockFr(...AT_BL)}, ${BL} min après ${clockFr(H0, M0)}.`,
    foundLine: (r, round) =>
      isGears(round)
        ? `Roues de ${GA} et ${GB} dents : le pilier à ${r.d ?? '…'}`
        : `Bus de ${BA} et ${BB} min : le pilier à ${r.d ?? '…'}`,
    next: 'Histoire suivante',
    done: 'Écrire ma règle',
  }),
};

// ───────────────────────── K4 — five teams, day by day (`crews` / `days`) ─────────────────────────

/** « les équipes 1 et 2 », « les équipes 1, 2, 3, 4 et 5 ». */
export const teamsFr = (teams) =>
  teams.length === 1 ? `l’équipe ${teams[0]}` : `les équipes ${listFr(teams.map(String))}`;
const cap = (s) => `${s[0].toUpperCase()}${s.slice(1)}`;
const dayN = (n) => `le jour ${nb(n)}`;

export const DAYS_INQUIRY = {
  kind: 'crews',
  mode: 'days',
  teams: DY.sleeps.map((sleep) => ({ sleep })),
  days: DY.span,
  stages: [
    { ask: 'zero', options: [0, 1] },
    { teams: [1, 2], run: 'step' },
    { teams: [1, 2, 3], run: 'fast' },
    { teams: [1, 2, 3, 4], run: 'fast', stopOn: 'all-but-one' },
    { teams: [1, 2, 3, 4, 5], run: 'fast' },
  ],
  text: frAll({
    lead: () =>
      'Cinq équipes travaillent toutes le jour 1. Ensuite, chacune travaille 1 jour puis dort : 1 jour pour l’équipe 1, 2 jours pour l’équipe 2, et ainsi de suite jusqu’à 5 jours pour l’équipe 5.',
    goal: (st) =>
      st.ask === 'zero'
        ? 'D’abord, le jour 1 : le départ.'
        : `Le prochain jour où ${teamsFr(st.teams)} travaillent ensemble.`,
    rows: { team: (i) => `Équipe ${i + 1}`, since: (n) => String(n) },
    zeroAsk: 'Le jour 1, combien de jours se sont écoulés depuis le départ ?',
    zeroFact: ({ said, right }) =>
      right || said === 0
        ? '0 jour : c’est le départ. Sous chaque case allumée, le nombre de jours depuis le départ : 0 est dans la ligne de chaque équipe.'
        : 'Le jour 1, c’est le jour du départ : aucun jour ne s’est encore écoulé.',
    sayAsk: (st) => `Le prochain jour où ${teamsFr(st.teams)} travaillent ensemble ?`,
    dayBefore: 'Le jour',
    say: 'Lancer les jours',
    saidLine: (day) => `Tu as dit : ${dayN(day)}.`,
    step: 'Jour suivant',
    fast: 'Avance',
    pause: 'Pause',
    stopFact: ({ day, team }) => `Jour ${day} : quatre équipes travaillent, l’équipe ${team} dort.`,
    met: ({ day, said, teams }) => {
      const head = `Jour ${nb(day)} : ${teamsFr(teams)} travaillent ensemble.`;
      const five =
        teams.length === DY.sleeps.length
          ? ` L’équipe 5 aussi : ${day - 1} jours depuis le départ, c’est $6 \\times ${(day - 1) / 6}$.`
          : '';
      if (said === day) return `${head}${five} Tu l’avais dit.`;
      if (said > day) return `${head}${five} Bien avant ${dayN(said)}.`;
      return `${head}${five} Tu avais dit ${dayN(said)}.`;
    },
    foundLine: (x) => `${cap(teamsFr(x.teams))} : jour ${nb(x.day)}`,
    next: 'Question suivante',
    done: 'Écrire ma règle',
  }),
};
