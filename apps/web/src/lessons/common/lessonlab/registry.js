/**
 * « Mon labo » — THE INSTRUMENTS, each tagged with the lesson that introduces it (2026-11-16).
 * One lab for every lesson: `toolsFor(lesson)` gives the instruments of that lesson (« Les outils de cette leçon ») and the cabinet
 * « Mon armoire » — the instruments of ALL the lessons before it, of every grade, grouped by grade and lesson. An instrument of a
 * later lesson is not listed at all (not even locked).
 *
 * To add an instrument: write `tools/<Name>.jsx` (props: { a, b, setA, setB, play, note }), add its entry here with the code
 * of the lesson that introduces it (`lesson`; its title is the catalogue's), its number ranges, and 2–3 « Essaie » quests in
 * `logic.js › QUESTS`.
 *
 * The Algerian instruments are kept with `lesson: null` — listed nowhere until a French lesson introduces one (their
 * Algerian tags are in git, `git show 049380e:<this file>`). Tagged today: `factor`, the instrument of the first 3e lesson;
 * `common` and `lists`, the instruments of the second (`trouver-le-pgcd`).
 */
import { getLessonById } from '@smarter-academy/core';
import { GRADES, GRADE_NAMES, compareLessons, isReached, placeOf } from './order';

export const TOOLS = [
  {
    id: 'rows',
    lesson: null,
    icon: '🟡',
    name: 'Les rangées de la division',
    hint: 'Range les jetons en rangées égales : reste-t-il quelque chose ?',
    needs: 'ab',
    labels: { a: 'Nombre de jetons', b: 'Par rangée' },
    range: { a: [1, 144], b: [1, 24] },
    load: () => import('./tools/Rows'),
  },
  {
    id: 'jumps',
    lesson: 'multiples-et-diviseurs-communs',
    icon: '🦘',
    name: 'Les sauts des multiples',
    hint: 'Saute à pas égaux depuis 0 : tombes-tu pile sur le drapeau ?',
    needs: 'ab',
    labels: { a: 'Le drapeau', b: 'Longueur du saut' },
    range: { a: [1, 120], b: [1, 30] },
    load: () => import('./tools/Jumps'),
  },
  {
    id: 'sentences',
    lesson: null,
    icon: '🗣️',
    name: 'La machine aux quatre phrases',
    hint: 'Quatre phrases, un seul sens : vraies ensemble ou fausses ensemble.',
    needs: 'ab',
    labels: { a: 'Premier nombre', b: 'Deuxième nombre' },
    range: { a: [1, 999], b: [1, 999] },
    load: () => import('./tools/Sentences'),
  },
  {
    id: 'divisors',
    lesson: null,
    icon: '🌈',
    name: 'L’arc des diviseurs',
    hint: 'Découvre tous les diviseurs d’un nombre : chaque diviseur a un partenaire.',
    needs: 'a',
    labels: { a: 'Le nombre' },
    range: { a: [1, 100], b: [1, 100] },
    load: () => import('./tools/Divisors'),
  },
  {
    id: 'planks',
    lesson: null,
    icon: '🪵',
    name: 'La planche commune',
    hint: 'Change la longueur de la planche : quelles longueurs remplit-elle exactement ?',
    needs: 'ab',
    labels: { a: 'Première longueur', b: 'Deuxième longueur' },
    range: { a: [1, 60], b: [1, 60] },
    load: () => import('./tools/Planks'),
  },
  {
    // the instrument of 3e `trouver-le-pgcd` (its design's port map: from the Algerian `qasim-mushtarak-akbar`). It
    // writes « Diviseurs communs » and PGCD(a ; b): NOT safe before the lesson's first key (LESSON_LAB.md §2, known debt)
    id: 'common',
    lesson: 'trouver-le-pgcd',
    icon: '🤝',
    name: 'Les diviseurs communs',
    hint: 'Les diviseurs de deux nombres côte à côte : lesquels sont communs, et lequel est le plus grand ?',
    needs: 'ab',
    labels: { a: 'Premier nombre', b: 'Deuxième nombre' },
    range: { a: [1, 100], b: [1, 100] },
    load: () => import('./tools/Common'),
  },
  {
    // the instrument of 3e `trouver-le-pgcd` (from the Algerian `tayin-pgcd`); it writes PGCD(a ; b) once both lists
    // are complete: NOT safe before the lesson's first key (LESSON_LAB.md §2, known debt)
    id: 'lists',
    lesson: 'trouver-le-pgcd',
    icon: '📋',
    name: 'L’établi des deux listes',
    hint: 'Écris les diviseurs de deux nombres par paires, côte à côte : où les deux listes se rejoignent-elles ?',
    needs: 'ab',
    labels: { a: 'Premier nombre', b: 'Deuxième nombre' },
    range: { a: [1, 120], b: [1, 120] },
    load: () => import('./tools/Lists'),
  },
  {
    id: 'euclid',
    lesson: null,
    icon: '🟩',
    name: 'Les carrés d’Euclide',
    hint: 'Coupe dans le rectangle le plus grand carré possible, puis recommence : le dernier carré dit le secret.',
    needs: 'ab',
    labels: { a: 'La longueur', b: 'La largeur' },
    range: { a: [1, 60], b: [1, 60] },
    load: () => import('./tools/Euclid'),
  },
  {
    // three faces on two numbers of the student's own: the two lists of divisors and what is in both, the divisions one
    // after another, one number tried on both — facts only; neither the tile nor the instrument names a key of its lesson
    id: 'duo',
    lesson: null,
    icon: '🔬',
    name: 'Le microscope à deux nombres',
    hint: 'Regarde deux nombres sous trois angles : leurs diviseurs, leurs divisions successives, et un nombre que tu essaies sur les deux.',
    needs: 'ab',
    labels: { a: 'Premier nombre', b: 'Deuxième nombre' },
    range: { a: [1, 999], b: [1, 999] },
    load: () => import('./tools/Duo'),
  },
  {
    id: 'paper',
    lesson: null,
    icon: '📝',
    name: 'La division posée',
    hint: 'La division comme on l’écrit sur une feuille, étape par étape, avec tes nombres.',
    needs: 'ab',
    labels: { a: 'Le dividende', b: 'Le diviseur' },
    range: { a: [1, 9999], b: [2, 99] },
    load: () => import('./tools/PaperDivision'),
  },
  {
    id: 'bracket',
    lesson: null,
    icon: '📏',
    name: 'L’encadrement par planches',
    hint: 'Pose les planches l’une après l’autre : combien de planches entières tiennent ? Combien en faut-il ?',
    needs: 'ab',
    labels: { a: 'La longueur', b: 'Longueur de la planche' },
    range: { a: [1, 9999], b: [2, 999] },
    load: () => import('./tools/Bracket'),
  },
  {
    id: 'rules',
    lesson: null,
    icon: '💡',
    name: 'Le détecteur de divisibilité',
    hint: 'Tourne les chiffres comme un cadenas : quelles lampes s’allument ?',
    needs: 'a',
    labels: { a: 'Le nombre' },
    range: { a: [0, 9999], b: [1, 999] },
    load: () => import('./tools/Rules'),
  },
  {
    // a fraction of the student's own as a strip of b cells with a cells lit, and a piece of length k he drags along it:
    // where k divides both, the strip regroups and the fraction is written in pieces — facts only; neither the tile nor
    // the instrument names a key of its lesson
    id: 'strip',
    lesson: 'fraction-irreductible',
    icon: '🎞️',
    name: 'La bande de la fraction',
    hint: 'Ta fraction sur une bande allumée : choisis la longueur d’un morceau. Ses jointures tombent-elles là où finit la lumière, et là où finit la bande ?',
    needs: 'ab',
    labels: { a: 'Le numérateur', b: 'Le dénominateur' },
    range: { a: [1, 999], b: [1, 999] },
    load: () => import('./tools/Strip'),
  },
  {
    // an area of the student's own laid as a square whose side his hand chooses: the tiles that do not fit, the empty
    // places; once he tried the greatest whole square and the next, the court is written — √a, or between two whole
    // numbers and to 0,01. It names the sign √ (the lab opens after the lesson): it is NOT safe before the lesson's keys
    id: 'court',
    lesson: null,
    icon: '🔲',
    name: 'La salle du nombre',
    hint: 'Range les dalles de ta salle en un carré dont tu choisis le côté : quel carré entier les contient, et où tombe son côté ?',
    needs: 'a',
    labels: { a: 'L’aire' },
    range: { a: [1, 400], b: [1, 400] },
    load: () => import('./tools/NumberCourt'),
  },
  {
    // a court of the student's own (a whole tiles), each tile cut into b × b small pieces, and a rod of p/b whose
    // numerator his hand sweeps: the platform holds p × p pieces, the court a × b × b — the drawing and the two counts say
    // which is more and by how many, and the nearest rod he reached is kept. Facts only: it names no key of its lesson
    id: 'piece',
    lesson: null,
    icon: '🟦',
    name: 'La plateforme de la fraction',
    hint: 'Une toise dont la longueur est une fraction, sur ta salle : coupe chaque dalle en petits morceaux, et compare ce que porte la plateforme à ce que porte la salle.',
    needs: 'ab',
    labels: { a: 'L’aire', b: 'Le dénominateur' },
    range: { a: [1, 50], b: [1, 12] },
    load: () => import('./tools/FractionPlatform'),
  },
  {
    // a triangle of the student's own (the ropes AB = a and AC = b, knotted every metre) and a cut [MN] whose two knots
    // his hand ties: the two ropes drawn at one length show where each knot stands on its rope, the figure (GeoFigure)
    // what the cut does. Facts only: it names no key of its lesson, writes no ratio and runs nothing on its own.
    // Taken by `thales-configuration-papillon` (its design's port map)
    id: 'rope',
    lesson: 'thales-configuration-papillon',
    icon: '🪢',
    name: 'La corde et le triangle',
    hint: 'Noue les deux bouts d’un segment sur les deux cordes du triangle : quand est-il parallèle au troisième côté ?',
    needs: 'ab',
    labels: { a: 'La corde AB', b: 'La corde AC' },
    range: { a: [2, 30], b: [2, 30] },
    load: () => import('./tools/RopeTriangle'),
  },
  {
    // a number of the student's own as a gap; his hand chooses planks (2 to 13, any length typed, the whole gap) and the
    // world lays them (`divisorIsles/factorLadder.js`): the ladder, the row of planks laid, the product once the gap is
    // 1 case — facts only, no order imposed, no word of its lesson's tablets (safe before the keys, §2)
    id: 'factor',
    lesson: 'decomposer-en-facteurs-premiers',
    icon: '🪜',
    name: 'L’échelle des facteurs',
    // one line of the lab's head at 1366×768 (the first, longer wording ended on an ellipsis there)
    hint: 'Ton nombre est un fossé : chaque planche qui le remplit le raccourcit. Jusqu’où ?',
    needs: 'a',
    labels: { a: 'Le nombre' },
    range: { a: [2, 9999], b: [1, 99] },
    load: () => import('./tools/FactorLadder'),
  },
];

export const toolById = (id) => TOOLS.find((t) => t.id === id) ?? null;

/**
 * What a student of `lesson` finds in the lab:
 *   mine     the instruments introduced by this very lesson;
 *   cabinet  [{ grade, name, lessons: [{ code, title, tools }] }] — every earlier lesson that has instruments, oldest grade first;
 *   all      mine + every instrument of the cabinet (what may ever be put on the bench).
 * `earlierOnly` (the lab opened BEFORE the lesson, by « L’échauffement »): `mine` is empty — the lesson's own instruments
 * are neither listed nor in `all`.
 */
export function toolsFor(lesson, { earlierOnly = false } = {}) {
  if (!placeOf(lesson)) return { mine: [], cabinet: [], all: [] };
  const reached = TOOLS.filter((t) => isReached(t.lesson, lesson));
  const mine = earlierOnly ? [] : reached.filter((t) => t.lesson === lesson);
  const earlier = reached.filter((t) => t.lesson !== lesson);
  const cabinet = GRADES.map((grade) => {
    const codes = [...new Set(earlier.filter((t) => placeOf(t.lesson).grade === grade).map((t) => t.lesson))].sort(
      compareLessons,
    );
    return {
      grade,
      name: GRADE_NAMES[grade],
      lessons: codes.map((code) => ({
        code,
        title: getLessonById(code)?.title ?? code,
        tools: earlier.filter((t) => t.lesson === code),
      })),
    };
  }).filter((g) => g.lessons.length);
  return { mine, cabinet, all: [...mine, ...earlier] };
}
/** Does this lesson have a lab at all (at least one instrument reached)? */
export const hasLab = (lesson) => toolsFor(lesson).all.length > 0;

/** The pair of numbers a tool can show: the shared numbers, brought inside the tool's ranges. */
export function clampFor(tool, a, b) {
  const c = (v, [lo, hi]) => Math.max(lo, Math.min(hi, Math.round(Number(v) || lo)));
  return { a: c(a, tool.range.a), b: c(b, tool.range.b) };
}
