import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Le test CONSOLIDE :
 * il n'introduit ni concept, ni vocabulaire, ni notation neufs
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *
 * TRANSFERT, pas répétition (§45) : aucune épreuve ne reprend les figures ni
 * les nombres des modules. Chaque distracteur encode une erreur RÉELLEMENT
 * rencontrée dans la leçon :
 *   — reporter la longueur du même côté du centre, donc revenir sur M (M2) ;
 *   — croire que le centre change la taille de l'image (M3, M4) ;
 *   — doubler une longueur ou une aire « puisqu'il y a deux figures » (M4) ;
 *   — confondre « avoir des axes » et « avoir un centre » (M5) ;
 *   — croire qu'un pliage bien choisi reproduit un demi-tour (M6).
 *
 * PÉRIMÈTRE 5e — vérifié épreuve par épreuve : aucune rotation d'un angle
 * autre que 180°, aucune translation, aucun vecteur, aucune composition de
 * transformations, aucune homothétie.
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 6 LPs sont tous couverts.
 *
 * `badges[].test` est une FONCTION (m) => bool.
 */
const SKILLS = {
  demitour: { label: 'Le demi-tour', emoji: '🔄', module: 1 },
  placer: { label: 'Placer une image', emoji: '📍', module: 2 },
  construire: { label: 'Construire une figure', emoji: '📐', module: 3 },
  invariants: { label: 'Ce qui se conserve', emoji: '🛡️', module: 4 },
  centrefig: { label: 'Le centre d’une figure', emoji: '🎯', module: 5 },
  distinguer: { label: 'Demi-tour ou pliage', emoji: '🪞', module: 6 },
};

const BADGES = [
  { id: 'b-demitour', emoji: '🔄', label: 'Maître du demi-tour', test: (m) => !m.demitour },
  { id: 'b-placer', emoji: '📍', label: 'Viseur précis', test: (m) => !m.placer },
  { id: 'b-invariants', emoji: '🛡️', label: 'Gardien des longueurs', test: (m) => !m.invariants },
  { id: 'b-centrefig', emoji: '🎯', label: 'Chercheur de centres', test: (m) => !m.centrefig },
  { id: 'b-distinguer', emoji: '🪞', label: 'Œil du miroir', test: (m) => !m.distinguer },
  { id: 'b-parfait', emoji: '💎', label: 'Le demi-tour parfait', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'tr5-e1',
    skill: 'demitour',
    title: 'De combien tourne-t-on ?',
    prompt: 'Une symétrie centrale fait tourner la figure autour de son centre. De combien ?',
    options: ['180°, un demi-tour', '90°, un quart de tour', '360°, un tour complet', 'De l’angle qu’on veut'],
    cols: 4,
    requires: ['symetrie-centrale'],
    explain: 'Un demi-tour vaut la moitié d’un tour complet : 360° ÷ 2 = 180°. Un tour complet ramènerait la figure exactement là où elle était, sans rien changer.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_transformations-5e_P1'] },
  },
  {
    id: 'tr5-e2',
    skill: 'demitour',
    title: 'Le point qui ne bouge pas',
    prompt: 'Dans une symétrie de centre O, combien de points restent exactement à leur place ?',
    options: ['Un seul : le centre O', 'Aucun', 'Tous les points d’une droite', 'Tous les points de la figure'],
    cols: 2,
    requires: ['centre-milieu'],
    explain: 'O doit être le milieu de [O O’], ce qui n’est possible que si O’ est confondu avec O. Le centre est donc le seul point fixe. (« Toute une droite » serait le cas d’un pliage.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_transformations-5e_P1'] },
  },
  {
    id: 'tr5-e3',
    skill: 'placer',
    title: 'La bonne phrase',
    prompt: 'K’ est l’image de K par la symétrie de centre O. Quelle affirmation est toujours vraie ?',
    options: [
      'O est le milieu de [K K’]',
      'K est le milieu de [O K’]',
      'K’ est le milieu de [O K]',
      'K, O et K’ forment un triangle',
    ],
    cols: 1,
    requires: ['centre-milieu', 'milieu-segment'],
    explain: 'Le demi-tour envoie K de l’autre côté de O, à la même distance : O se retrouve pile entre les deux. Les trois points sont donc alignés — jamais en triangle — et c’est le CENTRE qui est au milieu.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_transformations-5e_P2'] },
  },
  {
    id: 'tr5-e4',
    skill: 'placer',
    title: 'À quelle distance ?',
    prompt: 'Le point R est à 4 cm du centre O. À quelle distance de O se trouve son image R’ ?',
    options: ['4 cm', '8 cm', '2 cm', 'Cela dépend de la direction'],
    cols: 4,
    requires: ['centre-milieu'],
    explain: 'En tournant autour de la punaise, un point ne s’en éloigne ni ne s’en rapproche : OR’ = OR = 4 cm. (8 cm serait la longueur totale de [R R’], pas la distance à O.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_transformations-5e_P2'] },
  },
  {
    id: 'tr5-e5',
    skill: 'construire',
    title: 'La méthode',
    prompt: 'Pour construire l’image d’un quadrilatère EFGH par une symétrie centrale, que fait-on ?',
    options: [
      'On construit l’image de chaque sommet, puis on relie dans le même ordre',
      'On construit l’image d’un seul sommet, puis on recopie la forme à côté',
      'On mesure les côtés et on redessine la figure ailleurs',
      'On plie la feuille le long d’un axe',
    ],
    cols: 1,
    requires: ['construire-image'],
    explain: 'Une figure est une poignée de points reliés : on applique la règle à chacun, puis on relie les images dans le même ordre. Avec quatre sommets, l’ordre compte vraiment — relier E’G’F’H’ donnerait un quadrilatère croisé.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_transformations-5e_P3'] },
  },
  {
    id: 'tr5-e6',
    skill: 'invariants',
    title: 'La longueur du segment',
    prompt: 'Le segment [UV] mesure 9 cm. On construit son image [U’V’] par une symétrie de centre O, situé loin du segment. Combien mesure [U’V’] ?',
    options: ['9 cm', '18 cm', '4,5 cm', 'Cela dépend de la distance à O'],
    cols: 4,
    requires: ['invariants-symetrie'],
    explain: 'La symétrie centrale conserve les longueurs : [U’V’] mesure 9 cm. La position du centre décide de l’ENDROIT où le segment arrive, jamais de sa taille.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_transformations-5e_P5'] },
  },
  {
    id: 'tr5-e7',
    skill: 'invariants',
    title: 'L’aire du triangle',
    prompt: 'Un triangle a une aire de 24 cm². Quelle est l’aire de son image par une symétrie centrale ?',
    options: ['24 cm²', '48 cm²', '12 cm²', 'On ne peut pas savoir'],
    cols: 4,
    requires: ['invariants-symetrie'],
    explain: 'Les aires sont conservées : 24 cm². (48 cm² additionnerait les deux triangles, mais la question ne porte que sur l’image.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_transformations-5e_P5'] },
  },
  {
    id: 'tr5-e8',
    skill: 'centrefig',
    title: 'Qui a un centre ?',
    prompt: 'Laquelle de ces figures possède un centre de symétrie ?',
    options: ['Le losange', 'Le triangle équilatéral', 'Le trapèze isocèle', 'Le triangle isocèle'],
    cols: 2,
    requires: ['centre-de-symetrie'],
    explain: 'Le losange retombe exactement sur lui-même après un demi-tour autour du croisement de ses diagonales. Les trois autres se retrouvent « pointe inversée » : aucun point ne les ramène sur elles-mêmes, malgré leurs axes de symétrie.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_transformations-5e_P4'] },
  },
  {
    id: 'tr5-e9',
    skill: 'centrefig',
    title: 'Axes et centre',
    prompt: 'Le triangle équilatéral a trois axes de symétrie. Combien a-t-il de centres de symétrie ?',
    options: ['Aucun', 'Un seul', 'Trois', 'Autant que d’axes'],
    cols: 4,
    requires: ['centre-de-symetrie', 'axe-symetrie'],
    explain: 'Aucun. Avoir des axes et avoir un centre sont deux propriétés indépendantes : un demi-tour retourne le triangle pointe en bas, et il ne se superpose plus à lui-même.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_transformations-5e_P4'] },
  },
  {
    id: 'tr5-e10',
    skill: 'distinguer',
    title: 'Le calque sur la table',
    prompt: 'Pour superposer une figure à son image, il faut SOULEVER le calque et le retourner. De quelle transformation s’agit-il ?',
    options: [
      'Une symétrie axiale : un pliage',
      'Une symétrie centrale : un demi-tour',
      'Les deux, indifféremment',
      'Aucune des deux',
    ],
    cols: 1,
    requires: ['centrale-vs-axiale'],
    explain: 'Devoir retourner le calque est la signature du pliage. Après un demi-tour, le calque reste à plat : il suffit de le faire glisser et pivoter sur la table.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_transformations-5e_P6'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le demi-tour"
      moduleSubtitle="Dix épreuves pour prouver que le demi-tour n’a plus de secret"
      estimatedTime="6 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Le demi-tour',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune, reviens au même geste :{' '}
            <strong>le calque qui tourne d’un demi-tour autour de la punaise.</strong>
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🔄', label: 'Demi-tour', value: '180° autour d’un point' },
        { id: 'r2', emoji: '📍', label: 'O', value: 'milieu de [M M’]' },
        { id: 'r3', emoji: '🛡️', label: 'Conservé', value: 'longueurs, angles, aires' },
        { id: 'r4', emoji: '🪞', label: 'Pliage', value: 'retourne la figure' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Le demi-tour parfait !',
        title: 'Mission accomplie',
        message: 'Tu sais construire, reconnaître et justifier une symétrie centrale.',
        verbs: ['Faire tourner', 'Construire', 'Justifier', 'Distinguer'],
        masterBadgeLabel: 'Le demi-tour parfait',
      }}
    />
  );
}
