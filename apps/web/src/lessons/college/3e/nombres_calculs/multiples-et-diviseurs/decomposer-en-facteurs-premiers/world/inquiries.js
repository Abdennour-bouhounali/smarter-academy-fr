/**
 * THE THREE EXPERIMENTS of lesson « Décomposer un nombre en facteurs premiers » — their numbers and their words (the
 * screens and their logic are the world's: `divisorIsles/InquiryFactor.jsx` + `factorLadder.js`, `Inquiry.jsx › Pairs`
 * + `inquiry.js`, `InquirySheet.jsx` + `sheet.js`). Each rule that is a procedure or a search is FOUND by an experiment of
 * its own nature, never by the same mirror; key 2 (`puissances`, a writing convention) has none — its mirror reads the
 * ladders of key 1 (`forges.js`).
 *
 *   LADDER  key 1 `plus-petit-premier` — `ladder · factor`: one gap (60, then 72, then 495) and a rack of planks 2, 3, 4,
 *           5, 6, 7, 9, 11; he lays the plank of his choice, the gap shrinks to the quotient, a plank that does not divide
 *           falls; the round ends when the gap is 1 case. His bet is the plank he takes: no prediction is asked.
 *   STOP    key 3 `arret` — `pairs` (ported from the Algerian `qawasim-adad-tabii`, key 3): the planks of ONE gap tried in
 *           order (91 — the gap he has just crossed —, then 97, then 221); a plank and its partner walk toward each other
 *           and cross; past the crossing every partner is a plank already tried. On 97 and 221 he says the last plank
 *           BEFORE trying, on 221 with the squares in front of him.
 *   SHEET   key 4 `tableur` — `sheet`: a spreadsheet, column A the primes up to the square of the number on the sheet,
 *           column B its remainders (« =MOD(2431;A2) »); he clicks the line he reads, the number becomes the quotient.
 * No sentence here states a rule: each one says what the gap, the strip or the sheet has just done (`inquiries.test.js`
 * lists the forbidden words of each key).
 */
import { CELLS, NUMBERS, PLANKS, counted, frAll, isPrime, listFr, nb, planksOf, smallestPrime, tx } from './math';

const cells = (n) => counted(n, CELLS);
/** « Une planche de 6, c’est 3 planches de 2 bout à bout » — the fact of a composite plank (the story's « 8 = 2 + 2 + 2 »). */
const madeOf = (d) => {
  const p = smallestPrime(d);
  return `Une planche de ${d}, c’est ${planksOf(d / p, p)} bout à bout.`;
};

// ───────────────────────── key 1 — the ladder, mode `factor` ─────────────────────────

const [L60, L72] = NUMBERS.ladder.rounds;
export const LADDER_INQUIRY = {
  kind: 'ladder',
  mode: 'factor',
  rack: NUMBERS.ladder.rack,
  rounds: NUMBERS.ladder.rounds.map((n) => ({ n })),
  text: frAll({
    lead: (n) =>
      n === L60
        ? `Le fossé de ${cells(L60)} revient. Pose une planche du présentoir : si elle le remplit, le fossé devient le nombre de planches posées. Recommence jusqu’à ce qu’il ne reste qu’une case.`
        : n === L72
          ? `Le fossé de ${cells(L72)}, maintenant. Pose les planches que tu veux, autant de fois que tu veux, jusqu’à une seule case.`
          : `Un fossé de ${cells(n)}. Même jeu : jusqu’à une seule case.`,
    goal: (n) => `Faire descendre le fossé de ${cells(n)} jusqu’à 1 case.`,
    ask: ({ gap }) => `Le fossé mesure ${cells(gap)}. Quelle planche poses-tu ?`,
    rackLabel: 'Les planches',
    held: (a) =>
      `La planche de ${a.plank} remplit les ${nb(a.before)} cases : $${tx(a.before)} \\div ${a.plank} = ${tx(a.after)}$. Le fossé mesure maintenant ${cells(a.after)}.`,
    fell: (a) =>
      `La planche de ${a.plank} ne remplit pas ${cells(a.before)} : il reste ${cells(a.before % a.plank)} au bout. Le fossé ne change pas.${isPrime(a.plank) ? '' : ` ${madeOf(a.plank)}`}`,
    folded: (k) => counted(k, ['ligne cachée', 'lignes cachées']),
    laidLabel: 'Les planches qui ont tenu',
    end: ({ n, planks, attempts }) => {
      const fell = attempts.filter((a) => !a.held).length;
      return `Il ne reste qu’une case : sur le fossé de ${cells(n)}, ${counted(planks.length, ['planche a tenu', 'planches ont tenu'])}${fell ? `, et ${counted(fell, ['planche est tombée', 'planches sont tombées'])}` : ''}.`;
    },
    foundLine: (r) => `${nb(r.n)} : ${counted(r.planks.length, PLANKS)}, ${listFr(r.planks)}`,
    next: 'Fossé suivant',
    done: 'Écrire ma règle',
  }),
};

// ───────────────────────── key 3 — the strip, kind `pairs` (ported) ─────────────────────────

/** The two whole numbers a partner that is not whole stands between. */
const lo = (t) => Math.floor(t.partner);
const composite = (d) =>
  d >= 4 && !isPrime(d) ? ` ${madeOf(d)} La planche de ${smallestPrime(d)} est déjà tombée.` : '';

export const STOP_INQUIRY = {
  kind: 'pairs',
  gaps: NUMBERS.stop.rounds,
  text: frAll({
    stripLabel: (a) => `Les planches de 1 à ${a}`,
    cols: { plank: 'Planche', partner: 'Partenaire', square: 'Carré' },
    plank: (d) => `planche ${d}`,
    partner: 'partenaire',
    // a partner that is not whole, in the table: « 45–46 » (between 45 and 46) — short, the table is a row of columns
    between: (x, y) => `${x}–${y}`,
    tryBtn: (d) => `Essaie la planche de ${d}`,
    lead: (a, gi) =>
      gi === 0
        ? `Tu as traversé le fossé de ${cells(a)}. Cherche toutes les planches qui le remplissent : essaie-les une par une, depuis la planche de 1, et regarde la planche et son partenaire sur la bande.`
        : `${cells(a)} : essaie les planches dans l’ordre, et regarde où se tient le partenaire.`,
    guess: (a, gi) =>
      gi === 1
        ? `Un nouveau fossé : ${cells(a)}. Avant d’essayer : quelle est la dernière planche à essayer pour trouver toutes celles qui le remplissent ?`
        : `${cells(a)}. Cette fois, le tableau est devant toi avant tout essai. Quelle est la dernière planche à essayer ?`,
    held: (a, t) =>
      t.q === t.d
        ? `$${tx(a)} = ${t.d} \\times ${t.d}$ : la planche de ${t.d} tient, et elle est son propre partenaire.`
        : `$${tx(a)} = ${t.d} \\times ${t.q}$ : la planche de ${t.d} tient, et son partenaire ${t.q} remplit aussi le fossé.`,
    fell: (a, t) =>
      `La planche de ${t.d} ne remplit pas ${cells(a)}. Si elle tenait, son partenaire se tiendrait entre ${lo(t)} et ${lo(t) + 1} : devant elle.${composite(t.d)}`,
    fellBehind: (a, t) =>
      `La planche de ${t.d} ne remplit pas ${cells(a)}. Son partenaire se tiendrait entre ${lo(t)} et ${lo(t) + 1} : derrière elle, parmi les planches déjà essayées.${composite(t.d)}`,
    known: (a, t) =>
      `$${tx(a)} = ${t.d} \\times ${t.q}$ : elle tient, mais son partenaire ${t.q} est derrière elle. C’est le pont de la planche de ${t.q}, retourné : tu le connaissais déjà.`,
    ask: (a, n) =>
      `Tu as essayé ${counted(n, PLANKS)}. Si tu continuais jusqu’à la planche de ${a}, une planche que tu ne connais pas pourrait-elle encore remplir le fossé ?`,
    askYes: 'Peut-être : on continue pour voir',
    askNo: 'Non : impossible',
    swept: (n, a, over) =>
      over
        ? `${counted(n, ['essai de plus', 'essais de plus'])}, jusqu’à la planche de ${a} : aucune planche nouvelle. Tout ce qui a tenu était un partenaire déjà connu.`
        : `Le monde continue d’essayer… ${n}`,
    afterSweep: 'J’ai vu',
    pick: (a) => `Les essais sont finis. Quelle était la dernière planche qu’il fallait essayer pour ${cells(a)} ?`,
    pickLate: (a, k, t) =>
      t.whole
        ? `La planche de ${k} : son partenaire ${t.q} a été essayé avant elle. Tu la connaissais sans l’essayer.`
        : `La planche de ${k} : si elle tenait, son partenaire se tiendrait derrière elle, parmi les planches déjà essayées. Il n’était pas nécessaire de l’essayer.`,
    pickEarly: (a, k, missed) =>
      missed
        ? `En t’arrêtant à la planche de ${k}, tu perdrais ${counted(missed, PLANKS)} qui remplissent ${cells(a)}.`
        : `En t’arrêtant à la planche de ${k} : le partenaire de la planche de ${k + 1} n’est pas derrière elle, et rien de ce que tu as essayé ne dit ce qu’elle ferait.`,
    pickOk: (a, m, guess) =>
      `La planche de ${m} est la dernière qu’il fallait essayer pour ${cells(a)}.${
        guess == null ? '' : guess === m ? ' Tu l’avais prévu.' : ` Tu avais prévu la planche de ${guess}.`
      }`,
    foundLine: (a, m) => `${nb(a)} cases : dernière planche à essayer, ${m}`,
    next: 'Fossé suivant',
    done: 'Écrire ma règle',
  }),
};

// ───────────────────────── key 4 — the spreadsheet, kind `sheet` ─────────────────────────

const [T2431] = NUMBERS.tool.rounds;
const lineList = (zeros) => (zeros.length > 1 ? `les lignes ${listFr(zeros)} montrent` : `la ligne ${zeros[0]} montre`);

export const SHEET_INQUIRY = {
  kind: 'sheet',
  stop: 'square',
  rounds: NUMBERS.tool.rounds.map((n) => ({ n })),
  text: frAll({
    lead: (n) =>
      n === T2431
        ? `${nb(n)} cases : trop long pour la main. Voici une feuille de calcul : en A, des nombres premiers ; en B, le reste de la division de ${nb(n)} par chacun. Clique la ligne que tu lis.`
        : `${nb(n)} : la même feuille. Clique une ligne, ou dis que le nombre est premier.`,
    goal: (n) => `Trouver les nombres premiers qui remplissent ${nb(n)}, avec la feuille.`,
    primeHead: 'Premier',
    ask: ({ n, lines }) => `${nb(n)} sur la feuille, ${counted(lines, ['ligne', 'lignes'])}. Quelle ligne lis-tu ?`,
    prime: 'Il est premier',
    held: (a) =>
      a.after === 1
        ? `Ligne ${a.p} : reste 0. $${tx(a.before)} \\div ${a.p} = 1$ : il ne reste rien.`
        : `Ligne ${a.p} : reste 0. $${tx(a.before)} \\div ${a.p} = ${tx(a.after)}$, et la feuille se remplit de nouveau pour ${nb(a.after)}.`,
    miss: (a) => `Ligne ${a.p} : le reste est ${a.r}, et non 0. ${a.p} ne remplit pas ${nb(a.before)}.`,
    notPrime: ({ n, zeros }) => `Pas encore : sur la feuille de ${nb(n)}, ${lineList(zeros)} le reste 0.`,
    notebook: 'Le cahier',
    end: ({ n, factors }) => `La feuille de ${nb(n)} est finie : les nombres trouvés sont ${listFr(factors.map(nb))}.`,
    foundLine: (r) => `${nb(r.n)} : ${listFr(r.factors.map(nb))}`,
    next: 'Nombre suivant',
    done: 'Écrire ma règle',
  }),
};
