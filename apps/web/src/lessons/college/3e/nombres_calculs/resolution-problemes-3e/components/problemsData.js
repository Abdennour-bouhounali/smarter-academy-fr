import { lin } from './problemUtils';

/**
 * problemsData — les QUATRE situations de la leçon, écrites une seule fois.
 *
 * Le fil narratif (« Le Carnet de modélisation ») veut que les situations
 * REVIENNENT au lieu de se multiplier : le forfait de cinéma (M1, M4, M7),
 * Tom et Léa (M3, M6, M7), le rectangle (M4, M5, M7), les crêpes (M2, M5).
 * Chaque énoncé est donc découpé une fois en `fragments` (les morceaux que
 * le Traducteur surligne) et en `quantities` (les quantités réécrites selon
 * le choix de l'inconnue) — aucun module ne réécrit un énoncé à la main.
 *
 * Une quantité porte `lin: { <choiceId>: Lin }` : l'écriture de cette
 * quantité SI l'on choisit `choiceId` comme inconnue. Un choix invalide (par
 * exemple « la somme des âges ») n'apparaît dans aucune entrée `lin` — donc
 * `rewriteQuantities` renvoie null pour lui, et c'est exactement ce que doit
 * ressentir l'élève : « avec ce choix, je ne peux pas écrire le reste ».
 *
 * ≤ 45 mots par énoncé (risque « densité de texte sur mobile », spec C8).
 */

/* ── Tom et Léa (M3, M6, M7) ──────────────────────────────────────── */
export const AGES = {
  id: 'ages',
  title: 'Tom et Léa',
  text: "Léa a 3 ans de plus que Tom. Dans 5 ans, la somme de leurs âges sera 35 ans. Quel est l'âge de Tom aujourd'hui ?",
  fragments: [
    { id: 'f-lea', text: 'Léa a 3 ans de plus que Tom.' },
    { id: 'f-futur', text: 'Dans 5 ans, la somme de leurs âges sera 35 ans.' },
    { id: 'f-question', text: "Quel est l'âge de Tom aujourd'hui ?", isQuestion: true },
  ],
  choices: [
    { id: 'tom', label: "l'âge de Tom aujourd'hui", valid: true },
    { id: 'lea', label: "l'âge de Léa aujourd'hui", valid: true },
    { id: 'somme', label: 'la somme de leurs âges dans 5 ans', valid: false },
  ],
  quantities: [
    { id: 'tom', label: 'Âge de Tom', lin: { tom: lin(1, 0), lea: lin(1, -3) } },
    { id: 'lea', label: 'Âge de Léa', lin: { tom: lin(1, 3), lea: lin(1, 0) } },
    { id: 'tom5', label: 'Tom dans 5 ans', lin: { tom: lin(1, 5), lea: lin(1, 2) } },
    { id: 'lea5', label: 'Léa dans 5 ans', lin: { tom: lin(1, 8), lea: lin(1, 5) } },
    { id: 'somme5', label: 'Somme dans 5 ans', lin: { tom: lin(2, 13), lea: lin(2, 7) } },
  ],
  constraints: { integer: true, min: 0, max: 120, unit: 'ans' },
  // 2x + 13 = 35 → x = 11 (Tom 11, Léa 14 ; dans 5 ans 16 + 19 = 35).
  equation: { left: lin(2, 13), right: lin(0, 35) },
  answer: 11,
};

/* ── Le forfait de cinéma (M1, M4, M7) ────────────────────────────── */
export const FORFAIT = {
  id: 'forfait',
  title: 'Le forfait mystère',
  text: "La carte A coûte 9 € par séance. La carte B coûte 24 € à l'achat, puis 5 € par séance. À partir de combien de séances la carte B devient-elle plus avantageuse ?",
  fragments: [
    { id: 'f-a', text: 'La carte A coûte 9 € par séance.' },
    { id: 'f-b-fixe', text: "La carte B coûte 24 € à l'achat," },
    { id: 'f-b-var', text: 'puis 5 € par séance.' },
    { id: 'f-question', text: 'À partir de combien de séances la carte B devient-elle plus avantageuse ?', isQuestion: true },
  ],
  choices: [{ id: 'n', label: 'le nombre de séances', valid: true }],
  quantities: [
    { id: 'a', label: 'Carte A', lin: { n: lin(9, 0) } },
    { id: 'b', label: 'Carte B', lin: { n: lin(5, 24) } },
  ],
  constraints: { integer: true, min: 0, unit: 'séances' },
  // 9n = 24 + 5n → n = 6.
  equation: { left: lin(9, 0), right: lin(5, 24) },
  answer: 6,
  variable: 'n',
};

/** La variante du module 7 : la carte B coûte 25 € → n = 6,25, non entier. */
export const FORFAIT_25 = {
  ...FORFAIT,
  id: 'forfait25',
  title: 'Le forfait à 25 €',
  text: "Le cinéma change son tarif : la carte B coûte maintenant 25 € à l'achat, puis 5 € par séance. La carte A reste à 9 € par séance. À partir de combien de séances la carte B est-elle plus avantageuse ?",
  fragments: [
    { id: 'f-a', text: 'La carte A reste à 9 € par séance.' },
    { id: 'f-b-fixe', text: 'La carte B coûte maintenant 25 € à l’achat,' },
    { id: 'f-b-var', text: 'puis 5 € par séance.' },
    { id: 'f-question', text: 'À partir de combien de séances la carte B est-elle plus avantageuse ?', isQuestion: true },
  ],
  quantities: [
    { id: 'a', label: 'Carte A', lin: { n: lin(9, 0) } },
    { id: 'b', label: 'Carte B', lin: { n: lin(5, 25) } },
  ],
  // 9n = 25 + 5n → n = 6,25 → « dès 7 séances ».
  equation: { left: lin(9, 0), right: lin(5, 25) },
  answer: 6.25,
};

/* ── Le rectangle (M4, M5, M7) ────────────────────────────────────── */
export const RECTANGLE = {
  id: 'rectangle',
  title: 'Le rectangle',
  text: "Un rectangle a une longueur qui dépasse sa largeur de 4 cm. Son périmètre mesure 40 cm. Quelles sont ses dimensions ?",
  fragments: [
    { id: 'f-relation', text: 'Un rectangle a une longueur qui dépasse sa largeur de 4 cm.' },
    { id: 'f-perimetre', text: 'Son périmètre mesure 40 cm.' },
    { id: 'f-question', text: 'Quelles sont ses dimensions ?', isQuestion: true },
  ],
  choices: [
    { id: 'largeur', label: 'la largeur', valid: true },
    { id: 'longueur', label: 'la longueur', valid: true },
  ],
  quantities: [
    { id: 'largeur', label: 'Largeur', lin: { largeur: lin(1, 0), longueur: lin(1, -4) } },
    { id: 'longueur', label: 'Longueur', lin: { largeur: lin(1, 4), longueur: lin(1, 0) } },
    { id: 'perimetre', label: 'Périmètre', lin: { largeur: lin(4, 8), longueur: lin(4, -8) } },
  ],
  constraints: { min: 0, unit: 'cm' },
  // 4x + 8 = 40 → x = 8 (largeur 8, longueur 12).
  equation: { left: lin(4, 8), right: lin(0, 40) },
  answer: 8,
};

/** Le même rectangle avec P = 62 : x = 13,5 — le tableau d'essais échoue (M5). */
export const RECTANGLE_62 = {
  ...RECTANGLE,
  id: 'rectangle62',
  title: 'Le rectangle de périmètre 62',
  text: "Un rectangle a une longueur qui dépasse sa largeur de 4 cm. Son périmètre mesure 62 cm. Quelle est sa largeur ?",
  // Les fragments DOIVENT être redéclarés : le spread ci-dessus reprendrait
  // ceux de RECTANGLE (périmètre 40, « quelles sont ses dimensions ? »), et
  // l'énoncé affiché contredirait alors la question posée.
  fragments: [
    { id: 'f-relation', text: 'Un rectangle a une longueur qui dépasse sa largeur de 4 cm.' },
    { id: 'f-perimetre', text: 'Son périmètre mesure 62 cm.' },
    { id: 'f-question', text: 'Quelle est sa largeur ?', isQuestion: true },
  ],
  equation: { left: lin(4, 8), right: lin(0, 62) },
  answer: 13.5,
};

/* ── Les crêpes (M2, M5) ──────────────────────────────────────────── */
export const CREPES = {
  id: 'crepes',
  title: 'Les crêpes',
  text: "Pour 4 personnes, une recette de crêpes demande 250 g de farine, 3 œufs et 50 cL de lait. Le paquet de farine pèse 1 kg. Quelle masse de farine faut-il pour 7 personnes ?",
  fragments: [
    { id: 'f-recette', text: 'Pour 4 personnes, une recette de crêpes demande 250 g de farine,' },
    { id: 'f-oeufs', text: '3 œufs et 50 cL de lait.' },
    { id: 'f-paquet', text: 'Le paquet de farine pèse 1 kg.' },
    { id: 'f-question', text: 'Quelle masse de farine faut-il pour 7 personnes ?', isQuestion: true },
  ],
  choices: [{ id: 'p', label: 'le nombre de personnes', valid: true }],
  quantities: [{ id: 'farine', label: 'Farine (g)', lin: { p: lin(62.5, 0) } }],
  constraints: { min: 0, unit: 'g' },
  // Proportionnalité pure : 250 / 4 = 62,5 g par personne → 437,5 g pour 7.
  equation: { left: lin(62.5, 0), right: lin(0, 437.5) },
  answer: 7,
};

/* ── Le programme de calcul (M4) ──────────────────────────────────── */
export const PROGRAMME = {
  id: 'programme',
  title: 'Le programme de calcul',
  text: "Je choisis un nombre, je le multiplie par 3, puis j'ajoute 7. J'obtiens 25. Quel nombre ai-je choisi ?",
  fragments: [
    { id: 'f-choisir', text: 'Je choisis un nombre,' },
    { id: 'f-mult', text: 'je le multiplie par 3,' },
    { id: 'f-ajout', text: "puis j'ajoute 7." },
    { id: 'f-resultat', text: "J'obtiens 25." },
    { id: 'f-question', text: 'Quel nombre ai-je choisi ?', isQuestion: true },
  ],
  choices: [{ id: 'x', label: 'le nombre choisi au départ', valid: true }],
  quantities: [
    { id: 'depart', label: 'Nombre choisi', lin: { x: lin(1, 0) } },
    { id: 'triple', label: 'Après « × 3 »', lin: { x: lin(3, 0) } },
    { id: 'final', label: 'Après « + 7 »', lin: { x: lin(3, 7) } },
  ],
  constraints: {},
  // 3x + 7 = 25 → x = 6.
  equation: { left: lin(3, 7), right: lin(0, 25) },
  answer: 6,
};

export const PROBLEMS = { AGES, FORFAIT, FORFAIT_25, RECTANGLE, RECTANGLE_62, CREPES, PROGRAMME };
