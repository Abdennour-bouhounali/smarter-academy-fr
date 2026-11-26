/**
 * « La leçon au tableau » of this lesson — the STEPS the class goes through together (CLASS_SESSION.md §5ter). The kinds
 * of step and what the board does with each: `features/classSession/lessonScripts.js`. Reached only through the lesson's
 * pack (`lesson.pack.js › board.script`).
 *
 * Nothing ports from the Algerian platform (the only neighbour, `jam-tarh-kasrayn`, adds fractions and is not v2). The
 * hour opens on two crews that build a walkway from the same bank with planks of 22 and of 8 cases (their OWN numbers,
 * never the student's story): they must plant ONE pillar where both finish a whole plank. The four keys, each PROVED by
 * what the board builds before its name:
 *   1 the pillar at 44 (which crew finishes there?), then WHERE both finish: the two walkways drawn, a pillar to pick
 *     among 44, 80 and 88 — only at 88 do both crews finish a whole plank (`pilier-commun`);
 *   2 two planks too long to try pillar by pillar, 40 and 325: the two ladders, then a pillar written from them that the
 *     crew of 40 cannot finish — a 2 is missing — and the one that holds (`ppcm-facteurs`);
 *   3 two gears named in WORDS (9 and 24 teeth: nothing is drawn as a gear): after 24 teeth, which gear has made whole
 *     turns? then the first meeting of the two marks, in turns (`traduire-rendez-vous`);
 *   4 three teams that work one day then sleep: which work on day 37, and the first day all three work (`cinq-equipes`).
 * The keys keep lesson 4's own ids (the design's `pilier-commun` is the student's first key; the board's key ids are the
 * tablets' ids, so `KEYS` below are the ids of the world's tablets — see the note at `KEYS`).
 * MISSING ON THE BOARD (reported, not bent): a station for the CREWS TIMELINE (two to five lanes from one start, the
 * shortfall in amber, each card a PILLAR that both crews lay toward — `crewLanes.jsx › PlankLanes` on the board) and for
 * the day rows of K4. With the kinds that exist: a station whose cards are CREWS is an `ask` over bridges (the pillar is
 * the gap, the crew's plank the bridge — « which crews finish pile here? », its cards « Équipe de »); a station whose
 * cards are PILLARS — the common-multiple question — is an `ask` with a `figure` (`pilier-88`): the two walkways drawn
 * plank by plank (`lanesFigure`, plain segments, never a gear), a card agrees when it is in `answer` — computed in
 * `board.test.js` as the pillars where both crews end. A team's days and a gear's teeth stay bridges with their own
 * `words` (A10): no gear is drawn, no plank is named.
 * No `forge` / `bridges` step: each student forges the keys in his world. The numbers are the board's own (`BOARD`),
 * never the story's nor a number of the lesson's exercise bank; `board.test.js` computes every one of them.
 * A `cue` is at most 70 characters; nothing the class reads before a name holds that name (the words of each key are
 * listed in the test).
 */
import { formatFr, texFr } from '@smarter-academy/core';
import { listFr, counted, CELLS } from '../../../../../../common/gameworld/kit/authoring/numbers';
import { ladderCells, productTex } from '../../../../../../../features/classSession/lessonScripts';

/**
 * The four keys of the lesson (the tablets of the student's world), in the order of his road. ASSUMED: the world agent
 * writes `world/story.js` at the same time; `board.test.js` reads its `TABLETS` when they exist and checks these ids.
 */
export const KEYS = ['pilier-commun', 'ppcm-facteurs', 'traduire-rendez-vous', 'cinq-equipes'];

/** The board's numbers — ONE place: the script, the memo and the tests read them from here. */
export const BOARD = {
  /** The opening: crew A lays planks of 22, crew B planks of 8; the pillar at 22 (A ends, B leaves 6). */
  situation: { a: 22, b: 8 },
  /** 1 · the two crews, the pillar at 44, then at 88. */
  crews: { planks: [8, 22], first: 44, second: 88, pillars: [44, 80, 88], drawn: 110 },
  /** 2 · two planks too long to list: two ladders; a pillar that lacks one factor; the pillar that holds. */
  factors: { a: 40, b: 325, rack: [2, 3, 5, 7, 11, 13], lacking: 1300 },
  /** 3 · two gears, named in words: their teeth, and the teeth passed on the first question. */
  gears: { teeth: [9, 24], passed: 24 },
  /** 4 · three teams: one day of work, then sleep (11, 16, 17 days); the days since the start on the question. */
  teams: { sleep: [11, 16, 17], passed: 36 },
};
const { situation: S, crews: C, factors: F, gears: G, teams: T } = BOARD;

export const gcd = (x, y) => (y ? gcd(y, x % y) : x);
export const lcm = (x, y) => (x / gcd(x, y)) * y;
export const lcmOf = (xs) => xs.reduce(lcm);
/** The prime factors of n, smallest first. */
export function primeFactors(n) {
  const out = [];
  let m = n;
  for (let d = 2; m > 1; d += 1)
    while (m % d === 0) {
      out.push(d);
      m /= d;
    }
  return out;
}
/** The options of an ask that fill the gap `a`. */
const fills = (a, list) => list.filter((o) => a % o === 0);
/** « n = d1 × k1 = d2 × k2 … », every factor computed. */
const chain = (n, ds) => `${texFr(n)} = ${ds.map((d) => `${texFr(d)} \\times ${texFr(n / d)}`).join(' = ')}`;
/** « n = d × q + r », computed. */
const rest = (n, d) => `${texFr(n)} = ${texFr(d)} \\times ${Math.floor(n / d)} + ${texFr(n % d)}`;
/** Formulas one after the other, joined by « ; ». */
const rows = (fs) => fs.map((f) => `$${f}$`).join(' ; ');
const fr = (xs) => listFr(xs.map((x) => formatFr(x)));
/** « 2³ × 5 » with powers: the factor ladder's row written shorter (lesson 1). */
const powersTex = (xs) =>
  [...new Set(xs)]
    .map((p) => {
      const k = xs.filter((x) => x === p).length;
      return k > 1 ? `${p}^{${k}}` : `${p}`;
    })
    .join(' \\times ');

// 1 · the crews
const [SMALL, LARGE] = C.planks;
const FIRST = lcm(SMALL, LARGE);
/** The pillars of the crew of 22 before the first one both crews finish: 22, 44, 66 (the crew of 8 stops short). */
const STOPS = Array.from({ length: FIRST / LARGE - 1 }, (_, i) => LARGE * (i + 1));

// 2 · the two ladders and the pillar
const FA = primeFactors(F.a);
const FB = primeFactors(F.b);
const FL = primeFactors(F.lacking);
const WHOLE = lcm(F.a, F.b);
const WHOLE_FACTORS = primeFactors(WHOLE);

// 3 · the gears
const [TEETH_A, TEETH_B] = G.teeth;
const MEET = lcm(TEETH_A, TEETH_B);

// 4 · the teams: the days of work and sleep together, then the first day all three work
const CYCLES = T.sleep.map((s) => s + 1);
const ALL = lcmOf(CYCLES);
const WORK = fills(T.passed, CYCLES);

/** The words of a crew's card: each card is a CREW (its plank's length), laid from the bank toward the pillar. */
const CREW_WORDS = { card: 'Équipe de', held: 'Finit pile', fell: 'S’arrête avant' };
/** The words of a pillar's card: each card is a distance from the bank where both crews would plant the pillar. */
const PILLAR_WORDS = { card: 'Pilier à', held: 'Pile pour A et B', fell: 'A ou B s’arrête' };

/**
 * The two walkways from the same bank, drawn plank by plank (a GEOMETRY figure of the board: `StatementFigure`):
 * lane A on top, lane B under it, each plank a segment with its length written on it, the planks of a lane in two
 * alternating blues so that every joint shows; no point is named. Up to `upTo` cases — the lanes stop at the pillar
 * (`pillar`: a violet post with its distance, gate B 2026-11-26: the figure says what the sentence says).
 */
export function lanesFigure(planks, upTo, pillar = null) {
  const points = {};
  const segments = [];
  const hidden = [];
  const gap = Math.round(upTo / 4);
  planks.forEach((b, i) => {
    const y = (planks.length - 1 - i) * gap;
    const name = (k) => `${'AB'[i]}${k}`;
    for (let k = 0; k * b <= upTo; k += 1) {
      points[name(k)] = [k * b, y];
      hidden.push(name(k));
      if (k > 0)
        segments.push({ from: name(k - 1), to: name(k), label: String(b), tone: k % 2 ? 'indigo' : 'sky', bold: true });
    }
  });
  // the pillar where both lanes end, its distance written beside it, between the lanes (gate B 2026-11-26)
  if (pillar != null) {
    points.P0 = [pillar, -gap / 2];
    points.P1 = [pillar, (planks.length - 1) * gap + gap / 2];
    hidden.push('P0', 'P1');
    segments.push({ from: 'P0', to: 'P1', label: String(pillar), tone: 'violet', bold: true });
  }
  return {
    points,
    segments,
    hidden,
    ariaLabel: `Deux passerelles depuis le même bord : des planches de ${planks.join(' et de ')} cases`,
  };
}
/** The words of a gear's card (A10): the choices are tooth counts, no plank is drawn or named. */
const GEAR_WORDS = { card: 'Roue de', held: 'Tours entiers', fell: 'Tour inachevé' };
/** The words of a team's card (A10): the choices are the days of work and sleep together. */
const TEAM_WORDS = { card: 'Travail et sommeil', held: 'Elle travaille', fell: 'Elle dort' };

export const SCRIPT = {
  title: 'Multiples communs et plus petit multiple commun',
  steps: [
    {
      id: 'situation',
      kind: 'situation',
      chapter: 'On découvre',
      title: 'Deux équipes, un seul pilier',
      text: `Deux équipes bâtissent chacune une passerelle depuis le même bord de l’île : l’équipe A avec des planches de ${ladderCells(LARGE)}, l’équipe B avec des planches de ${ladderCells(SMALL)}. Elles plantent un seul pilier, là où les deux équipes finissent leur dernière planche pile. À ${ladderCells(S.a)} du bord, l’équipe A finit pile : $${chain(S.a, [S.a])}$.`,
      question: `À ${ladderCells(S.a)} du bord, l’équipe B finit-elle pile elle aussi ?`,
      bridge: { a: S.a, b: S.b },
      cue: 'Avant de poser : qui prévoit ? Où planter le pilier ?',
    },
    // 1 · the pillar where both crews end
    {
      id: 'pilier-44',
      kind: 'ask',
      chapter: 'On découvre',
      title: `Le pilier à ${C.first} cases`,
      text: `Les deux équipes posent leurs planches depuis le bord. Le pilier est planté à ${ladderCells(C.first)} du bord : $${chain(C.first, [LARGE])}$.`,
      question: 'Quelles équipes finissent leur dernière planche pile au pilier ?',
      a: C.first,
      options: C.planks,
      answer: fills(C.first, C.planks),
      words: CREW_WORDS,
      after: `${rows([rest(C.first, SMALL)])}. L’équipe de ${SMALL} s’arrête ${counted(C.first % SMALL, CELLS)} avant le pilier. À ${ladderCells(S.a)} déjà : ${rows([rest(S.a, SMALL)])}, elle s’arrêtait avant.`,
      cue: 'Où finit l’équipe de 8 ? Combien de cases avant le pilier ?',
    },
    {
      id: 'pilier-88',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'Où planter le pilier ?',
      text: `Équipe A en haut, planches de ${ladderCells(LARGE)} ; équipe B en bas, planches de ${ladderCells(SMALL)}. A finissait pile à ${fr(STOPS)} cases ; B jamais.`,
      // before the check the lanes run past, no post (the answer is the class's to find); after it, they stop at 88
      // where the post stands (`figureAfter`, LessonBoard.jsx › Ask)
      figure: lanesFigure([LARGE, SMALL], C.drawn),
      figureAfter: lanesFigure([LARGE, SMALL], C.second, C.second),
      question: 'Où planter le pilier pour que les deux équipes finissent pile ?',
      options: C.pillars,
      answer: C.pillars.filter((d) => C.planks.every((b) => d % b === 0)),
      words: PILLAR_WORDS,
      after: `${rows([chain(C.second, [SMALL, LARGE])])} : ${C.second / SMALL} planches de ${SMALL} et ${C.second / LARGE} planches de ${LARGE}. ${rows(
        C.pillars
          .filter((d) => d !== C.second)
          .map((d) =>
            rest(
              d,
              C.planks.find((b) => d % b),
            ),
          ),
      )}.`,
      cue: 'Pourquoi 88 et pas un pilier plus proche ? Et à 176 ?',
    },
    {
      id: 'name-1',
      kind: 'name',
      chapter: 'On nomme',
      tablet: KEYS[0],
      recall: ['multiples communs'],
      cue: 'Équipes de 6 et de 9 cases : où est le premier pilier possible ?',
    },
    // 2 · two planks too long to list: the two ladders, then the pillar
    {
      id: 'echelle-1',
      kind: 'ladder',
      chapter: 'On découvre',
      title: `La planche de ${F.a}`,
      text: `Des équipes aux planches de ${ladderCells(F.a)} et de ${ladderCells(F.b)} : essayer chaque pilier serait trop long. On découpe d’abord la planche de ${F.a}, morceau après morceau, jusqu’à 1 case.`,
      question: 'Quelle planche posons-nous maintenant ?',
      n: F.a,
      rack: F.rack,
      group: true,
      after: `La rangée : $${texFr(F.a)} = ${productTex(FA)}$, soit $${texFr(F.a)} = ${powersTex(FA)}$.`,
      cue: `Quelles planches reviennent plusieurs fois dans la rangée de ${F.a} ?`,
    },
    {
      id: 'echelle-2',
      kind: 'ladder',
      chapter: 'On découvre',
      title: `La planche de ${F.b}`,
      text: `Puis la planche de ${ladderCells(F.b)}, morceau après morceau, jusqu’à 1 case.`,
      question: 'Quelle planche posons-nous maintenant ?',
      n: F.b,
      rack: F.rack,
      group: true,
      after: `La rangée : $${texFr(F.b)} = ${productTex(FB)}$, soit $${texFr(F.b)} = ${powersTex(FB)}$.`,
      cue: 'Quelle planche est dans les deux rangées ? Combien de fois ?',
    },
    {
      id: 'pilier-qui-manque',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'Un pilier écrit avec les rangées',
      text: `$${texFr(F.a)} = ${powersTex(FA)}$ et $${texFr(F.b)} = ${powersTex(FB)}$. Un pilier à ${ladderCells(F.lacking)} du bord s’écrit $${texFr(F.lacking)} = ${powersTex(FL)}$.`,
      question: 'Quelles équipes finissent leur dernière planche pile à ce pilier ?',
      a: F.lacking,
      options: [F.a, F.b],
      answer: fills(F.lacking, [F.a, F.b]),
      words: CREW_WORDS,
      after: `${rows([rest(F.lacking, F.a)])} : il manque un 2 à la rangée du pilier pour finir les planches de ${F.a}, qui en demandent trois. Le premier pilier qui tient : $${texFr(WHOLE)} = ${powersTex(WHOLE_FACTORS)}$, avec $${chain(WHOLE, [F.a, F.b])}$.`,
      cue: 'Que manque-t-il à la rangée du pilier ? Où est le premier pilier ?',
    },
    {
      id: 'name-2',
      kind: 'name',
      chapter: 'On nomme',
      tablet: KEYS[1],
      recall: ['plus grand exposant'],
      cue: 'Comment écrire le premier pilier de 2² × 3 et de 2 × 3² ?',
    },
    // 3 · two gears, in words: the first meeting of the marks
    {
      id: 'roues',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'Deux roues dentées',
      text: `Roues de ${TEETH_A} et de ${TEETH_B} dents, une dent marquée sur chacune, face à face. On fait passer ${G.passed} dents : $${chain(G.passed, [TEETH_B])}$.`,
      question: 'Quelles roues ont fait un nombre entier de tours ?',
      a: G.passed,
      options: G.teeth,
      answer: fills(G.passed, G.teeth),
      words: GEAR_WORDS,
      after: `${rows([rest(G.passed, TEETH_A)])} : la roue de ${TEETH_A} n’a pas fini son tour. Face à face la première fois après ${MEET} dents : $${chain(MEET, [TEETH_A, TEETH_B])}$, soit ${MEET / TEETH_A} tours et ${MEET / TEETH_B} tours.`,
      cue: 'Combien de tours chaque roue a-t-elle faits au premier face-à-face ?',
    },
    {
      id: 'name-3',
      kind: 'name',
      chapter: 'On nomme',
      tablet: KEYS[2],
      recall: ['rythmes'],
      cue: 'Deux feux, toutes les 6 s et toutes les 9 s : quand ensemble ?',
    },
    // 4 · three teams: one day of work, then sleep
    {
      id: 'equipes',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'Trois équipes qui dorment',
      text: `Le jour 1, trois équipes travaillent ; puis A dort ${T.sleep[0]} jours, B ${T.sleep[1]}, C ${T.sleep[2]} : ${fr(CYCLES)} jours de travail et de sommeil. Le jour ${T.passed + 1}, ${T.passed} jours se sont écoulés.`,
      question: `Quelles équipes travaillent le jour ${T.passed + 1} ?`,
      a: T.passed,
      options: CYCLES,
      answer: WORK,
      words: TEAM_WORDS,
      after: `${rows(WORK.map((c) => chain(T.passed, [c])))} : A et C travaillent ; ${rows([rest(T.passed, CYCLES[1])])} : B dort. Toutes ensemble après ${formatFr(ALL)} jours : $${chain(ALL, CYCLES)}$, le jour ${formatFr(ALL + 1)}.`,
      cue: 'Pourquoi le jour 1 compte-t-il pour 0 jour écoulé ?',
    },
    {
      id: 'name-4',
      kind: 'name',
      chapter: 'On nomme',
      tablet: KEYS[3],
      recall: ['cycle'],
      cue: 'Équipes qui travaillent 1 jour et dorment 5 et 7 jours : quel jour ?',
    },
    // the copybook: two pages of two keys
    {
      id: 'trace-1',
      kind: 'trace',
      chapter: 'On écrit',
      title: 'Dans le cahier : les clés 1 et 2',
      tablets: [KEYS[0], KEYS[1]],
      cue: 'Après la copie : planches de 6 et 9, quel est le premier pilier ?',
    },
    {
      id: 'trace-2',
      kind: 'trace',
      chapter: 'On écrit',
      title: 'Dans le cahier : les clés 3 et 4',
      tablets: [KEYS[2], KEYS[3]],
      cue: 'Après la copie : quand compte-t-on les jours depuis le jour 1 ?',
    },
  ],
};

/** For the memo and the tests: what the board computes. */
export const FACTS = {
  crews: { first: FIRST, stops: STOPS, held: fills(C.first, C.planks), both: fills(C.second, C.planks) },
  factors: {
    a: FA,
    b: FB,
    lacking: FL,
    whole: WHOLE,
    wholeFactors: WHOLE_FACTORS,
    holds: fills(F.lacking, [F.a, F.b]),
  },
  gears: { meet: MEET, turns: [MEET / TEETH_A, MEET / TEETH_B], whole: fills(G.passed, G.teeth) },
  teams: { cycles: CYCLES, all: ALL, day: ALL + 1, work: WORK },
};
