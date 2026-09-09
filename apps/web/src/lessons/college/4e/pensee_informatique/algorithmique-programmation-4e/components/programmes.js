import {
  makeRepeat, makeSi, avancer, tourner, affecter, condition, lit, formule,
} from '../../../../../common/turtle/trace4e';

/**
 * LES PROGRAMMES DE LA LEÇON — écrits une seule fois, ici.
 *
 * Chaque module affirme des choses sur le comportement de ces programmes
 * (« ce programme trace un carré », « la branche sinon est prise pour n = 3 »,
 * « le compteur vaut 5 à la fin »). Ces affirmations sont du CONTENU
 * PÉDAGOGIQUE : si le comportement réel diffère, la leçon ment à l'élève.
 * `parcours.test.js` les rejoue donc TOUTES sur le moteur.
 *
 * Les rassembler ici sert exactement à cela : le test et le module lisent le
 * même objet, et il devient impossible qu'un module dise une chose et que le
 * test en vérifie une autre.
 *
 * PÉRIMÈTRE. Aucun de ces programmes ne contient de boucle « tant que », de
 * condition composée ni de bloc défini — le moteur ne sait pas les exprimer
 * (KINDS est clos, `evalTest` ne connaît qu'une comparaison, `makeSi` et
 * `makeRepeat` aplatissent). La frontière 4e/3e est portée par la structure,
 * pas par une consigne.
 */

/* ══ M1 — le programme du ralenti ═════════════════════════════════════ */

/**
 * Le carré de 60 : 2 instructions écrites, 8 pas exécutés. C'est le premier
 * écart que le module 1 fait constater — écrire peu, exécuter beaucoup.
 */
export const PROGRAMME_DEPART = [makeRepeat(4, [avancer(60), tourner(90)])];

/* ══ M2 — le bloc qui choisit ═════════════════════════════════════════ */

/**
 * LE MÊME programme, deux entrées, deux figures. Le test porte sur `n` :
 *   n > 4  →  branche « alors »  →  côtés de 70
 *   sinon  →  branche « sinon »  →  côtés de 35
 * Quatre côtés, virages de 90° : la figure reste un carré dans les deux cas,
 * et c'est voulu — seule la TAILLE change, donc l'élève ne peut pas attribuer
 * la différence à autre chose qu'au choix.
 */
export const PROGRAMME_CHOIX = [
  makeRepeat(4, [
    makeSi(condition(lit('n'), '>', 4), [avancer(70)], [avancer(35)]),
    tourner(90),
  ]),
];

/** Les deux entrées que le module 2 fait essayer, de part et d'autre du seuil. */
export const ENTREES_CHOIX = [3, 7];

/* ══ M3 — écrire la condition ═════════════════════════════════════════ */

/**
 * Le programme du garde-fou : la condition est CHOISIE par l'élève.
 * Grand carré (80) si le test passe, petit carré (30) sinon.
 * Le seuil est 50, et c'est en 50 que « > » et « ⩾ » se séparent — la seule
 * valeur qui les distingue.
 */
export const programmeGardeFou = (op, seuil) => [
  makeRepeat(4, [
    makeSi(condition(lit('valeur'), op, seuil), [avancer(80)], [avancer(30)]),
    tourner(90),
  ]),
];

export const SEUIL_GARDE_FOU = 50;
/** Les trois valeurs d'essai : juste avant, la borne, juste après. */
export const ESSAIS_GARDE_FOU = [49, 50, 51];

/* ══ M4 — le compteur qui grandit ═════════════════════════════════════ */

/**
 * La spirale carrée : i part de 20 et gagne 20 à chaque tour.
 * Un seul AVANCER écrit, six longueurs différentes tracées — c'est le fait
 * central du module 4 : la même instruction, rencontrée deux fois, ne fait
 * plus la même chose.
 * i vaut 20, 40, 60, 80, 100, 120 pendant les six tours, puis 140 à la fin.
 */
export const PROGRAMME_SPIRALE = [
  affecter('i', 20),
  makeRepeat(6, [
    avancer(lit('i')),
    tourner(90),
    affecter('i', formule('i', { plus: 20 })),
  ]),
];

/**
 * Le compteur nu : on ne compte plus une longueur, on compte les TOURS.
 * i part de 0 et vaut 5 à la fin — le nombre de côtés du pentagone tracé.
 */
export const PROGRAMME_COMPTEUR = [
  affecter('i', 0),
  makeRepeat(5, [
    avancer(45),
    tourner(72),
    affecter('i', formule('i', { plus: 1 })),
  ]),
];

/* ══ M5 — modifier un programme existant ══════════════════════════════ */

/**
 * Le programme livré : cinq côtés, virages de 60°. Il NE SE REFERME PAS
 * (5 × 60 = 300, il manque 60°). La cible est l'hexagone régulier fermé.
 * Deux modifications d'UNE seule valeur y mènent, et le module les distingue :
 *   · passer le nombre de tours à 6      → hexagone, fermé  ✔ (la cible)
 *   · passer l'angle à 72°               → pentagone, fermé — fermé aussi,
 *     mais ce n'est pas la figure demandée : c'est le piège du module.
 */
export const PROGRAMME_A_MODIFIER = [makeRepeat(5, [avancer(50), tourner(60)])];
export const PROGRAMME_CIBLE = [makeRepeat(6, [avancer(50), tourner(60)])];
export const PROGRAMME_PENTAGONE = [makeRepeat(5, [avancer(50), tourner(72)])];

/* ══ M6 — le labo de réparation ═══════════════════════════════════════ */

/**
 * TROIS PANNES, TROIS NATURES DIFFÉRENTES.
 *
 * Le point de divergence n'est JAMAIS colorié d'avance : le module l'obtient
 * de `premiereDifference` / `premiereDifferenceVariables`, et
 * `parcours.test.js` vérifie que le pas ANNONCÉ par le module est bien celui
 * que le moteur calcule.
 *
 * 1. L'ANGLE — le pentagone dont les virages font 60° au lieu de 72°.
 *    Divergence dès le pas 1 : le premier virage est déjà faux. La figure ne
 *    se referme pas (5 × 60 = 300).
 *
 * 2. LE SEUIL — un test « t > 1 » écrit à la place de « t > 2 ».
 *    Divergence au pas 4 seulement : le PREMIER tour est identique dans les
 *    deux programmes. C'est ce qui interdit de conclure en regardant le début,
 *    et oblige à exécuter.
 *
 * 3. LE COMPTEUR — « i ← 20 » écrit à la place de « i ← i + 20 ».
 *    Les VARIABLES divergent au pas 3, le DESSIN seulement au pas 4 : la
 *    variable trahit la panne avant que le tracé ne bouge. C'est l'argument
 *    du module — un tracé seul ne suffit plus.
 */
export const BUGS = [
  {
    id: 'angle',
    nom: 'L’étoile qui ne se referme pas',
    attendu: 'un pentagone régulier fermé',
    casse: [makeRepeat(5, [avancer(60), tourner(60)])],
    repare: [makeRepeat(5, [avancer(60), tourner(72)])],
    // La panne se voit sur le TRACÉ, et dès le premier virage.
    nature: 'trace',
    instruction: 'TOURNER',
    correction: '72',
  },
  {
    id: 'seuil',
    nom: 'Le mur qui grandit trop tôt',
    attendu: 'deux côtés courts, puis deux côtés longs',
    casse: [
      affecter('t', 1),
      makeRepeat(4, [
        makeSi(condition(lit('t'), '>', 1), [avancer(80)], [avancer(40)]),
        tourner(90),
        affecter('t', formule('t', { plus: 1 })),
      ]),
    ],
    repare: [
      affecter('t', 1),
      makeRepeat(4, [
        makeSi(condition(lit('t'), '>', 2), [avancer(80)], [avancer(40)]),
        tourner(90),
        affecter('t', formule('t', { plus: 1 })),
      ]),
    ],
    nature: 'trace',
    instruction: 'SI',
    correction: 't > 2',
  },
  {
    id: 'compteur',
    nom: 'La spirale qui n’en est pas une',
    attendu: 'une spirale : chaque côté plus long que le précédent',
    casse: [
      affecter('i', 20),
      makeRepeat(5, [avancer(lit('i')), tourner(90), affecter('i', 20)]),
    ],
    repare: [
      affecter('i', 20),
      makeRepeat(5, [avancer(lit('i')), tourner(90), affecter('i', formule('i', { plus: 20 }))]),
    ],
    // Ici la VARIABLE diverge avant le tracé : c'est toute la leçon du module.
    nature: 'variable',
    instruction: 'METTRE',
    correction: 'i + 20',
  },
];
