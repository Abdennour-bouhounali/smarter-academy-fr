/**
 * THE EXPERIMENTS AND THE BENCH of lesson « Rendre une fraction irréductible » — their numbers and their words (the
 * screens and their logic are the world's: `divisorIsles/measure.js` + `InquiryMeasure.jsx`, `InquiryGcd.jsx › ladder`;
 * the contract: GAME_WORLD.md « Explore », the spec block of `measure` and of `ladder`).
 *
 *   STRIKE_INQUIRY  K1's experiment, in the mirror of B — `measure` / `stages`, CHIPS ONLY (`typed: false`: the primes
 *                   2, 3, 5, 7, 11, 13), one road a round: his sign 69/123 (only 3 → 23/41), then 52/76 (2 → 26/38,
 *                   2 again → 13/19 — « 2 twice » is SEEN, 4 is no chip). Each plank that fills both re-counts the
 *                   strips, and the line says it as a decomposition (« En planches de 3 : 69 = 3 × 23 et 123 = 3 × 41 »).
 *                   His end button « no plank longer than a cell fills both » is HIS claim; the world answers it.
 *   PGCD_INQUIRY    K3's experiment, in the mirror of D — `measure` / `direct` on 722/1 786 (the bridge he has just
 *                   crossed), the TYPED box only, `long: true` (strips of 1 786 cells: a plank under 3 px is one band).
 *                   ONE stage: 2 → 361/893 and 19 → 38/94 are « not enough » (a plank still fills both), 38 → 19/47.
 *                   Same kind as K1, the opposite gesture: many small strikes there, one big one here (design, lesson 3).
 *   NOTEBOOK_BENCH  the bench of C's workshop (read by `story.js`), K3's TOOL, not its experiment: lesson 2's notebook,
 *                   `ladder` / `divide`, `plain`, `manual: 2`, on (1 786 ; 722): 1 786 = 722 × 2 + 342 | 722 = 342 × 2 +
 *                   38 | 342 = 38 × 9 + 0; its rows are kept under the length box (`text.kept`).
 * Every sentence says what the world just did — never « barre », « commun », « simplifier », « irréductible », « PGCD »,
 * « en une étape » (`inquiries.test.js`). Counts go through `counted`, numbers through `nb` / `tx` (French thousands).
 */
import { CELLS, NUMBERS, ROWS, counted, euclid, fracTex as F, frAll, nb, tx } from './math';

const { strike: ST, pgcd: PG } = NUMBERS;

/** « 69 = 3 × 23 » as LaTeX. */
const timesTex = (n, d) => `${tx(n)} = ${tx(d)} \\times ${tx(n / d)}`;
/** A chain of fractions [[p, q], …] as one formula. */
const chainOf = (chain) => chain.map(([p, q]) => F(p, q)).join(' = ');
/** What a plank that does not fill both left: « il reste 1 case en haut et le bas est rempli ». */
const leftOf = (f) =>
  `${f.ra ? `il reste ${counted(f.ra, CELLS)} en haut` : 'le haut est rempli'} et ${f.rb ? `il reste ${counted(f.rb, CELLS)} en bas` : 'le bas est rempli'}`;

/** The words both `measure` specs share: the strips, the planks, the world's check. */
const MEASURE_TEXT = {
  unit: 'cases',
  lay: 'Poser la planche',
  end: 'Aucune planche plus longue qu’une case ne remplit les deux',
  bound: ({ max }) => `Une planche mesure de 2 à ${counted(max, CELLS)}.`,
  sameRoad: ({ d }) => `La planche de ${nb(d)} a déjà ouvert un chemin : prends-en une autre.`,
  refused: (f) => `Avec des planches de ${nb(f.d)}, ${leftOf(f)} : les bandes ne changent pas.`,
  counted: ({ d, from }) => `En planches de ${nb(d)} : $${timesTex(from[0], d)}$ et $${timesTex(from[1], d)}$.`,
  checkLabel: ({ p, q }) => `Le miroir essaie les planches de ${nb(p)} sur ${nb(q)}`,
  checkSeen: ({ p, q, found }) => `La planche de ${nb(found)} remplit encore ${nb(p)} et ${nb(q)}.`,
  predictAsk: ({ a, b }) => `Par un autre chemin, où arriveront les bandes de $${F(a, b)}$ ?`,
  predictGo: 'Je le dis',
  runLine: ({ end }) => `Arrivée : $${F(end[0], end[1])}$`,
  foundLine: (r) => `$${F(r.a, r.b)} = ${F(r.final[0], r.final[1])}$`,
};

/** K1 — the mirror of B: prime planks, one at a time, on his sign, then on 52/76. */
export const STRIKE_INQUIRY = {
  kind: 'measure',
  mode: 'stages',
  typed: false,
  chips: ST.chips,
  rounds: ST.rounds.map(([a, b]) => ({ a, b, mode: 'stages', runs: 1 })),
  text: frAll({
    ...MEASURE_TEXT,
    lead: (a, b) =>
      a === ST.rounds[0][0]
        ? `La dernière écriture de ta pancarte : $${F(a, b)}$. En haut ${counted(a, CELLS)}, en bas ${counted(b, CELLS)}.`
        : `Une autre pancarte : $${F(a, b)}$. En haut ${counted(a, CELLS)}, en bas ${counted(b, CELLS)}.`,
    goal: () => 'Pose une planche à la fois. Quand plus aucune ne remplit les deux bandes, dis-le.',
    pickAsk: ({ p, q, stage }) =>
      stage === 0
        ? `Quelle planche poses-tu sur les deux bandes de $${F(p, q)}$ ?`
        : `Les bandes écrivent maintenant $${F(p, q)}$. Une autre planche ?`,
    runEnd: (f) =>
      `Aucune planche plus longue qu’une case ne remplit ${nb(f.end[0])} et ${nb(f.end[1])} : les bandes écrivent $${chainOf(f.chain)}$.`,
    notEnough: ({ d, end, found }) =>
      `Avec ${nb(d)}, les bandes écrivent $${F(end[0], end[1])}$, et la planche de ${nb(found)} les remplit encore.`,
    again: 'Reprendre les bandes',
    next: 'Une autre pancarte',
    done: 'Au miroir',
  }),
};

/** K3 — the mirror of D: ONE plank, typed, on the fraction of the bridge he has just crossed. */
export const PGCD_INQUIRY = {
  kind: 'measure',
  mode: 'direct',
  long: true,
  rounds: [{ a: PG.mark, b: PG.gap, mode: 'direct' }],
  text: frAll({
    ...MEASURE_TEXT,
    lead: (a, b) =>
      `La pancarte du pont que tu viens de traverser : $${F(a, b)}$. En haut ${counted(a, CELLS)}, en bas ${counted(b, CELLS)}.`,
    goal: () => 'Tape la longueur d’une seule planche : le miroir compte les deux bandes avec elle.',
    pickAsk: ({ p, q }) => `Quelle longueur de planche poses-tu sur les deux bandes de $${F(p, q)}$ ?`,
    runEnd: (f) =>
      `$${F(f.a, f.b)} = ${F(f.end[0], f.end[1])}$ : aucune planche plus longue qu’une case ne remplit ${nb(f.end[0])} et ${nb(f.end[1])}. Une planche a suffi.`,
    notEnough: ({ a, b, d, end, found }) =>
      `Avec ${nb(d)} : $${F(a, b)} = ${F(end[0], end[1])}$. Une étape ne suffit pas : la planche de ${nb(found)} remplit encore ${nb(end[0])} et ${nb(end[1])}.`,
    again: 'Reprendre la pancarte du pont',
    next: 'Suivant',
    done: 'Au miroir',
  }),
};

// ───────────────────────── the bench of C's workshop: lesson 2's notebook ─────────────────────────

const pairTex = ([x, y]) => `$(${tx(x)} ; ${tx(y)})$`;
const rowTex = (f) => `$${tx(f.a)} = ${tx(f.b)} \\times ${f.q} + ${tx(f.value)}$`;

/**
 * What the notebook kept, as the workshop's card writes it: the rows it wrote (all of them once it ended). The state is
 * the one `InquiryGcd.jsx › LadderRows` hands to `spec.onState`; anything else gives no line.
 */
function notebookKept(s) {
  const r = NOTEBOOK_BENCH.rounds[s?.ri ?? 0];
  if (!r || !Number.isInteger(s?.written)) return [];
  const rows = euclid(r.a, r.b);
  const n = s.found?.length || s.stage === 'seen' ? rows.length : Math.min(s.written, rows.length);
  return rows.slice(0, n).map((x) => `$${tx(x.a)} = ${tx(x.b)} \\times ${x.q} + ${tx(x.r)}$`);
}

/** C's workshop: the notebook of divisions on the bridge 1 786 / 722 — the rows only (`plain`), two typed (`manual`). */
export const NOTEBOOK_BENCH = {
  kind: 'ladder',
  mode: 'divide',
  plain: true,
  manual: 2,
  rounds: [{ a: PG.gap, b: PG.mark }],
  text: frAll({
    lead: (a, b) => `Le carnet de divisions : le pont de ${counted(a, CELLS)} et ses ${counted(b, CELLS)} éclairées.`,
    goal: () => 'À chaque ligne, le carnet divise un nombre par un autre. Écris la paire de la ligne suivante.',
    ask: ({ a, b }) => `Quelle paire vient après ${pairTex([a, b])} ?`,
    write: 'Écrire la ligne',
    seen: (f) =>
      f.next
        ? `${rowTex(f)}, et la ligne suivante est ${pairTex(f.next)}${f.hit ? ', comme tu l’as écrit.' : `. Tu avais écrit ${pairTex(f.said)}.`}`
        : `${rowTex(f)}.`,
    planks: 'Planches des deux nombres',
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
