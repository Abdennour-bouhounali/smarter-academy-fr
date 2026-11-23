/**
 * THE EXPERIMENTS AND THE BENCHES of lesson « Trouver le PGCD de deux nombres » — their numbers and their words (the
 * screens and their logic are the world's: `divisorIsles/InquiryDeal.jsx` + `deal.js`, `InquirySheet.jsx` + `sheet.js`,
 * `InquiryGcd.jsx › Ladder` + `inquiry.js`, `InquiryGcdModes.jsx › Pair` + `gcdModes.js`; the contract: GAME_WORLD.md
 * « Explore », the spec shapes). The design: `docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md`, lesson 2.
 *
 *   K1  diviseurs-communs  NO experiment, NO bench: the convoy « jumeaux » (90, 54, 15 coins) is the experiment.
 *   DEAL_INQUIRY  K2 lots-identiques — `deal` (default mode), in the mirror of island C: 30 apples and 42 pears dealt into
 *                 identical baskets, chips 2 … 12 — 2, 3, 6 share everything; 5, 10 leave pears; 7 leaves apples; 4, 8, 9,
 *                 11, 12 leave both. Then the most baskets and what one holds.
 *   SHEET_BENCH   K3's TOOL (not its experiment: lesson 1 sealed the sheet's rule) — `sheet` on C's workshop, two rounds,
 *                 1 736 then 980 (it writes 868, 434, 217, 31 and 490, 245, 49, 7). It KEEPS its state
 *                 (`Workshop.jsx › Bench`, `sheet.js › sheetFrom`) and `text.kept` writes both decompositions under the
 *                 length box where he types the plank (`Workshop.jsx › BenchKept`).
 *   EUCLIDE_BENCH K4's tool — `ladder` / `divide`, `plain` (no column of the planks of both, no gold), `manual: 2`, on E's
 *                 workshop: 52 015 = 31 209 × 1 + 20 806 | 31 209 = 20 806 × 1 + 10 403 | 20 806 = 10 403 × 2 + 0. He
 *                 types the next pair of rows 1 and 2, then the count. `text.kept` writes the rows it showed.
 *   PAIR_INQUIRY  K4 euclide — `nest` / `pair`, in the mirror of G, two rounds of three probes: the CONTRAST (88 ; 33)
 *                 against (88 ; 22) — the lists differ —, then his notebook's last two rows (31 209 ; 20 806) against
 *                 (20 806 ; 10 403) — the lists are the same, and they are the planks of 10 403.
 * No sentence here states a rule: each one says what the baskets, the sheet, the notebook or the strips have just done
 * (`inquiries.test.js` forbids the words of each key). No sentence of the deal names a plank (A10).
 */
import { CELLS, NUMBERS, ROWS, counted, euclid, frAll, listFr, nb, tx } from './math';

const { deal: DL, factors: FC, euclide: EU } = NUMBERS;

/** The nouns of the stall: « 1 pomme », « 30 pommes ». */
export const APPLES = ['pomme', 'pommes'];
export const PEARS = ['poire', 'poires'];
export const BASKETS = ['panier', 'paniers'];

// ───────────────────────── K2 — the stall: identical baskets (`deal`) ─────────────────────────

/** What stays on the table after a deal: « 2 poires », « 2 pommes et 6 poires ». */
const leftOver = (restA, restB) =>
  [restA ? counted(restA, APPLES) : null, restB ? counted(restB, PEARS) : null].filter(Boolean).join(' et ');
/** One deal, in words: what each basket holds and what is left. */
const dealSays = (f) =>
  `${counted(f.k, BASKETS)} : dans chacun, ${counted(f.qA, APPLES)} et ${counted(f.qB, PEARS)}, ${
    f.restA || f.restB ? `et il reste sur la table ${leftOver(f.restA, f.restB)}` : 'et il ne reste aucun fruit'
  }.`;
/** What he had said, against what the world did. */
const after = (right) => (right == null ? '' : right ? ' Tu l’avais prévu.' : ' Tu avais prévu autre chose.');

export const DEAL_INQUIRY = {
  kind: 'deal',
  a: { n: DL.apples, item: 'apple' },
  b: { n: DL.pears, item: 'pear' },
  lot: 'basket',
  choices: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  minTries: 4,
  text: frAll({
    lead: (a, b) =>
      `Sur l’étal du marché : ${counted(a.n, APPLES)} et ${counted(b.n, PEARS)}. On veut tout mettre dans des paniers identiques : autant de pommes dans chaque panier, et autant de poires.`,
    goal: () => 'Le plus de paniers possible, et ce que contient un panier, sans qu’il reste un fruit.',
    choose: ({ tried }) =>
      tried === 0 ? 'Combien de paniers ? Choisis un nombre.' : 'Choisis un autre nombre de paniers.',
    ask: ({ k }) => `${counted(k, BASKETS)} : toutes les pommes et toutes les poires seront-elles partagées ?`,
    dealt: (f) => `${dealSays(f)}${after(f.guess == null ? null : f.guess === f.ok)}`,
    again: (f) => `Tu as déjà essayé ce nombre. ${dealSays(f)}`,
    cols: { lots: 'Paniers', a: 'Pommes par panier', b: 'Poires par panier', left: 'Sur la table' },
    toAnswer: 'Je connais la réponse',
    back: 'J’essaie d’autres nombres',
    check: 'Vérifier',
    answerLead: () => 'Le plus de paniers, et ce que contient un panier :',
    lotsUnit: 'paniers',
    unitA: 'pommes',
    unitB: 'poires',
    miss: (f) => {
      const { said, row } = f;
      if (f.kind === 'open') return 'Parmi les nombres que tu n’as pas encore essayés, un autre mérite un essai.';
      if (f.kind === 'bigger')
        return `${counted(said.k, BASKETS)} partagent tous les fruits, et ${counted(row.k, BASKETS)} de ton tableau aussi.`;
      if (!row.ok) return `${counted(row.k, BASKETS)} : il reste sur la table ${leftOver(row.restA, row.restB)}.`;
      return `${dealSays(row)} Tu as écrit ${said.x} et ${said.y}.`;
    },
    ok: ({ said }) =>
      `${counted(said.k, BASKETS)}, avec dans chacun ${counted(said.x, APPLES)} et ${counted(said.y, PEARS)} : il ne reste aucun fruit.`,
    bound: ({ max }) => `Écris les trois nombres ; le nombre de paniers va de 1 à ${max}.`,
    yes: 'Oui',
    no: 'Non',
    done: 'Écrire ma règle',
  }),
};

// ───────────────────────── K3's tool — the spreadsheet of lesson 1, on C's workshop (`sheet`) ─────────────────────────

const [F1] = FC.gaps;
const lineList = (zeros) => (zeros.length > 1 ? `les lignes ${listFr(zeros)} montrent` : `la ligne ${zeros[0]} montre`);
const product = (xs) =>
  [...xs]
    .sort((x, y) => x - y)
    .map(tx)
    .join(' \\times ');

/**
 * What the sheet kept, as the workshop's card writes it under the length box (`Workshop.jsx › BenchKept`, at most four
 * lines): each round he finished, « 1 736 = 2 × 2 × 2 × 7 × 31 » (the primes he found, in increasing order — writing them
 * with powers is his), and the round he left half-way, as far as he went (« 980 = 2 × 490 »). Nothing else: no plank.
 * `s` is a state `sheet.js › sheetFrom` accepted for this spec.
 */
function sheetKept(s) {
  const done = (s.rounds ?? []).map((r) => `$${tx(r.n)} = ${product(r.factors)}$`);
  const n0 = SHEET_BENCH.rounds[s.ri]?.n;
  const open =
    s.stage !== 'seen' && s.factors?.length && n0 ? [`$${tx(n0)} = ${product(s.factors)} \\times ${tx(s.n)}$`] : [];
  return [...done, ...open];
}

export const SHEET_BENCH = {
  kind: 'sheet',
  stop: 'square',
  rounds: FC.gaps.map((n) => ({ n })),
  text: frAll({
    lead: (n) =>
      n === F1
        ? `${counted(n, CELLS)} : la feuille de calcul de l’atelier. En A, des nombres premiers ; en B, le reste de la division de ${nb(n)} par chacun. Clique la ligne que tu lis.`
        : `${counted(n, CELLS)} : la même feuille. Clique une ligne, ou dis que le nombre est premier.`,
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
    done: 'Retour à l’atelier',
    kept: sheetKept,
  }),
};

// ───────────────────────── K4's tool — the division notebook, on E's workshop (`ladder` / `divide`, plain) ─────────────────────────

const [E1, E2] = EU.gaps;
const pairTex = ([x, y]) => `$(${tx(x)} ; ${tx(y)})$`;
const rowTex = (f) => `$${tx(f.a)} = ${tx(f.b)} \\times ${f.q} + ${tx(f.value)}$`;

/**
 * What the notebook kept, as the workshop's card writes it: the rows it wrote (all of them once it ended). The state is
 * the one `InquiryGcd.jsx › LadderRows` hands to `spec.onState`; anything else gives no line.
 */
function notebookKept(s) {
  const r = EUCLIDE_BENCH.rounds[s?.ri ?? 0];
  if (!r || !Number.isInteger(s?.written)) return [];
  const rows = euclid(r.a, r.b);
  const n = s.found?.length || s.stage === 'seen' ? rows.length : Math.min(s.written, rows.length);
  return rows.slice(0, n).map((x) => `$${tx(x.a)} = ${tx(x.b)} \\times ${x.q} + ${tx(x.r)}$`);
}

export const EUCLIDE_BENCH = {
  kind: 'ladder',
  mode: 'divide',
  plain: true,
  manual: 2,
  rounds: [{ a: E1, b: E2 }],
  text: frAll({
    lead: (a, b) => `Le carnet de divisions : un fossé de ${counted(a, CELLS)} et un fossé de ${counted(b, CELLS)}.`,
    goal: () => 'À chaque ligne, le carnet divise un nombre par un autre. Écris la paire de la ligne suivante.',
    ask: ({ a, b }) => `Quelle paire vient après ${pairTex([a, b])} ?`,
    write: 'Écrire la ligne',
    seen: (f) =>
      f.next
        ? `${rowTex(f)}, et la ligne suivante est ${pairTex(f.next)}${f.hit ? ', comme tu l’as écrit.' : `. Tu avais écrit ${pairTex(f.said)}.`}`
        : `${rowTex(f)}.`,
    planks: 'Planches des deux fossés',
    folded: (k) => counted(k, ['ligne cachée', 'lignes cachées']),
    countAsk: ({ a, b, written }) =>
      `Le carnet a écrit ${counted(written, ROWS)}. Combien de lignes écrira-t-il en tout pour ${nb(a)} et ${nb(b)} ?`,
    countLabel: 'Nombre de lignes',
    finish: 'Finir le carnet',
    end: (f) =>
      `Le carnet a écrit ${counted(f.steps, ROWS)} pour ${nb(f.a)} et ${nb(f.b)}${f.guessed === f.steps ? ', comme tu l’avais dit.' : `, et tu avais dit ${f.guessed}.`}`,
    foundLine: (f) => `${nb(f.a)} et ${nb(f.b)} : ${counted(f.steps, ROWS)}`,
    next: 'Suivant',
    done: 'Retour à l’atelier',
    kept: notebookKept,
  }),
};

// ───────────────────────── K4 — two pairs of gaps, the same planks? (`nest` / `pair`) ─────────────────────────

const [C88, C33, C22] = EU.contrast;
const [R1, R2] = euclid(E1, E2);
const fill = (yes) => (yes ? 'remplit' : 'ne remplit pas');
/** Round 1, the contrast; round 2, his notebook's last two rows: (31 209 ; 20 806) and (20 806 ; 10 403). */
const FIRST_ROUND = { a: C88, b: C33, pair: [C88, C22], probes: [11, 22, 8] };
const LAST_ROWS = { a: R2.a, b: R2.b, pair: [R2.b, R2.r], probes: [EU.plank, R1.r, R2.a] };

export const PAIR_INQUIRY = {
  kind: 'nest',
  mode: 'pair',
  rounds: [FIRST_ROUND, LAST_ROWS],
  text: frAll({
    lead: (a, b, [x, y]) =>
      a === C88
        ? `Deux paires de fossés : ${a} et ${b}, puis ${x} et ${y}. Pour chaque planche, dis si elle remplit les deux fossés de chaque paire.`
        : `Les deux dernières lignes de ton carnet : ${nb(a)} et ${nb(b)}, puis ${nb(x)} et ${nb(y)}. Même jeu, planche par planche.`,
    goal: (a, b, [x, y]) =>
      `Comparer les planches qui remplissent ${nb(a)} et ${nb(b)} avec celles qui remplissent ${nb(x)} et ${nb(y)}.`,
    ask: ({ p }) => `La planche de ${nb(p)} : remplit-elle les deux fossés de chaque paire ?`,
    onFirst: ({ a, b }) => `${nb(a)} et ${nb(b)}`,
    onSecond: ({ x, y }) => `${nb(x)} et ${nb(y)}`,
    lay: 'Pose la planche',
    yes: 'Oui',
    no: 'Non',
    seen: (f, g) =>
      `La planche de ${nb(f.p)} ${fill(f.holdsA)} ${nb(f.a)} et ${fill(f.holdsB)} ${nb(f.b)} ; elle ${fill(f.holdsX)} ${nb(f.x)} et ${fill(f.holdsY)} ${nb(f.y)}.${
        g.first === f.inFirst && g.second === f.inSecond ? ' Tu l’avais prévu.' : ''
      }`,
    compare: ({ a, b, x, y, first, second }) =>
      `Les planches qui remplissent ${nb(a)} et ${nb(b)} : ${listFr(first.map(nb))}. Celles qui remplissent ${nb(x)} et ${nb(y)} : ${listFr(second.map(nb))}.`,
    firstLabel: (a, b) => `${nb(a)} et ${nb(b)}`,
    secondLabel: (x, y) => `${nb(x)} et ${nb(y)}`,
    foundLine: (f) =>
      `${nb(f.p)} : ${f.inFirst ? 'oui' : 'non'} pour ${nb(f.a)} et ${nb(f.b)}, ${f.inSecond ? 'oui' : 'non'} pour ${nb(f.x)} et ${nb(f.y)}`,
    next: 'Paires suivantes',
    done: 'Écrire ma règle',
  }),
};
