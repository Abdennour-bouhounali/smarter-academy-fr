import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION.
 *
 * CONNAISSANCES AVANT LA DEMANDE. La mission finale CONSOLIDE : elle
 * n'introduit rien de neuf — ni concept, ni vocabulaire, ni notation — et
 * chaque épreuve déclare les connaissances qu'elle exige, toutes posées par une
 * brique des modules 1 à 6 ou déclarées en `priorKnowledge`.
 *
 * COUVERTURE. Chaque LP a au moins une épreuve qui lui est PROPRE, pour que le
 * profil de maîtrise soit interprétable :
 *   P1 coordonnées d'un vecteur .......... e1 (seule), e2
 *   P2 norme d'un vecteur ................ e3 (seule), e4, e2
 *   P3 produit scalaire .................. e5 (seule), e6
 *   P4 parallélisme ...................... e7 (seule), e8
 *   P5 orthogonalité ..................... e9 (seule), e10
 *
 * DISTRACTEURS, tous vérifiés numériquement et DISTINCTS de la bonne réponse
 * (components/espaceUtils.test.js) : soustraction inversée (e1), zéro pris pour
 * une case vide (e2), racine oubliée (e3), chemin en équerre — √(x²+y²) puis
 * + z, qui vaut 2,41 là où la diagonale vaut 1,73 (e4), rangs croisés (e5),
 * troisième terme oublié (e6), deux coordonnées sur trois qui s'accordent (e7),
 * « ne se coupent pas donc parallèles » (e8), « produit nul donc sécantes »
 * (e9, e10).
 *
 * TOUTES LES ÉPREUVES PORTENT SUR LA MÊME BOÎTE ABCDEFGH, celle des six modules
 * précédents, en unités d'arête. L'élève n'a donc aucune figure nouvelle à
 * déchiffrer sous chronomètre — et les huit coins lui sont familiers.
 */
const EPREUVES = [
  {
    id: 'ev-e1',
    requires: ['coordonnees-vecteur-espace', 'mem-arrivee-moins-depart-espace'],
    skill: 'coordonnees',
    title: 'Les trois nombres d’un trajet',
    prompt: 'Dans la boîte, B est le coin (1 ; 0 ; 0) et H est le coin (0 ; 1 ; 1). Quelles sont les coordonnées de BH ?',
    options: ['(−1 ; 1 ; 1)', '(1 ; −1 ; −1)', '(1 ; 1 ; 1)', '(−1 ; −1 ; −1)'],
    cols: 2,
    correct: 0,
    explain: 'Arrivée moins départ, sur les trois lignes : 0 − 1 = −1, puis 1 − 0 = 1, puis 1 − 0 = 1. Répondre (1 ; −1 ; −1), c’est avoir soustrait dans l’autre sens — ce sont les coordonnées de HB.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_espace-vecteurs-coordonnees-1ere_P1'] },
  },
  {
    id: 'ev-e2',
    requires: ['repere-espace', 'coordonnees-vecteur-espace'],
    skill: 'coordonnees',
    title: 'Un zéro est un résultat',
    prompt: 'A est le coin (0 ; 0 ; 0) et C le coin (1 ; 1 ; 0). Que vaut la troisième coordonnée de AC, et que signifie-t-elle ?',
    options: [
      'Elle vaut 0 : le trajet ne s’enfonce pas du tout vers le fond, il reste sur la face avant',
      'Elle n’existe pas : un trajet sur une face n’a que deux coordonnées',
      'Elle vaut 1, comme les deux autres',
      'Elle vaut 2, puisque le trajet traverse deux arêtes',
    ],
    cols: 1,
    correct: 0,
    explain: 'Zéro est un compte, pas une case vide : dans l’espace, tout vecteur a bien trois coordonnées, même quand l’une d’elles est nulle. AC vaut (1 ; 1 ; 0).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_espace-vecteurs-coordonnees-1ere_P1', 'premiere_specialite_espace-vecteurs-coordonnees-1ere_P2'] },
  },
  {
    id: 'ev-e3',
    requires: ['formule-norme-espace', 'mem-trois-carres'],
    skill: 'norme',
    title: 'La longueur d’un trajet',
    prompt: 'Un vecteur de l’espace a pour coordonnées (1 ; 1 ; 1). Quelle est sa longueur ?',
    options: ['√3', '3', '9', '√2'],
    cols: 4,
    correct: 0,
    explain: 'On additionne les trois carrés : 1 + 1 + 1 = 3, puis on prend la racine — d’où √3. Répondre 3, c’est avoir oublié la racine ; répondre √2, c’est n’avoir additionné que deux carrés.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_espace-vecteurs-coordonnees-1ere_P2'] },
  },
  {
    id: 'ev-e4',
    requires: ['formule-norme-espace', 'deux-triangles-rectangles', 'mem-trois-carres'],
    skill: 'norme',
    title: 'Une seule racine',
    prompt: 'Pour un vecteur (1 ; 1 ; 1), un élève calcule √(1 + 1) puis ajoute 1, et trouve environ 2,41. Pourquoi est-ce faux ?',
    options: [
      'Il a pris la racine trop tôt : cela revient à longer le plancher PUIS à monter, un chemin en équerre plus long que la diagonale, qui vaut environ 1,73',
      'Parce que √2 n’est pas un nombre exact',
      'Parce qu’il aurait fallu multiplier au lieu d’additionner',
      'Ce n’est pas faux : 2,41 est la bonne réponse',
    ],
    cols: 1,
    correct: 0,
    explain: 'La racine ferme la somme entière et se prend à la fin, une seule fois : √(1 + 1 + 1) = √3 ≈ 1,73. Les deux nombres diffèrent de près de 0,7 — c’est bien un autre chemin, pas un arrondi.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_espace-vecteurs-coordonnees-1ere_P2'] },
  },
  {
    id: 'ev-e5',
    requires: ['formule-scalaire-espace', 'mem-un-terme-de-plus'],
    skill: 'scalaire',
    title: 'Le produit scalaire',
    prompt: 'Dans un repère orthonormé de l’espace, u (1 ; 1 ; 1) et v (1 ; 1 ; 0). Que vaut u · v ?',
    options: ['2', '3', '1', '0'],
    cols: 4,
    correct: 0,
    explain: '1×1 + 1×1 + 1×0 = 1 + 1 + 0 = 2. Répondre 3, c’est avoir compté le troisième produit comme s’il valait 1 ; répondre 1, c’est n’avoir gardé qu’un seul terme.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_espace-vecteurs-coordonnees-1ere_P3'] },
  },
  {
    id: 'ev-e6',
    requires: ['formule-scalaire-espace', 'coordonnees-vecteur-espace'],
    skill: 'scalaire',
    title: 'Un terme négatif',
    prompt: 'Dans la boîte, BH (−1 ; 1 ; 1) et DF (1 ; −1 ; 1). Que vaut BH · DF ?',
    options: ['−1', '1', '3', '0'],
    cols: 4,
    correct: 0,
    explain: '(−1)×1 + 1×(−1) + 1×1 = −1 − 1 + 1 = −1. Un produit scalaire peut être négatif : c’est un nombre ordinaire, pas une longueur. Répondre 3, c’est avoir ignoré les signes.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_espace-vecteurs-coordonnees-1ere_P3', 'premiere_specialite_espace-vecteurs-coordonnees-1ere_P1'] },
  },
  {
    id: 'ev-e7',
    requires: ['regle-parallelisme-espace', 'methode-trancher-parallelisme'],
    skill: 'paralleles',
    title: 'Deux droites parallèles',
    prompt: 'Une droite a pour vecteur directeur (1 ; 1 ; 0) et une autre (2 ; 2 ; 0). Que peut-on affirmer ?',
    options: [
      'Elles sont parallèles : le second directeur est le premier multiplié par 2, sur les trois coordonnées',
      'Elles ne sont pas parallèles, puisque les coordonnées sont différentes',
      'Elles sont orthogonales',
      'Elles se coupent forcément, puisqu’elles vont dans le même sens',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un même nombre, k = 2, convient aux trois coordonnées : 1×2 = 2, 1×2 = 2, 0×2 = 0. Même direction, donc droites parallèles — et deux droites parallèles ne se coupent jamais, sauf à être confondues.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_espace-vecteurs-coordonnees-1ere_P4'] },
  },
  {
    id: 'ev-e8',
    requires: ['droites-espace-trois-cas', 'regle-parallelisme-espace'],
    skill: 'paralleles',
    title: 'Le troisième cas',
    prompt: 'Deux droites de l’espace ne se coupent nulle part. Sont-elles parallèles ?',
    options: [
      'Pas forcément : dans l’espace, elles peuvent aussi n’avoir ni point commun ni direction commune',
      'Oui, toujours : ne pas se couper, c’est être parallèles',
      'Non, jamais : deux droites parallèles se coupent à l’infini',
      'Cela dépend de l’angle sous lequel on dessine la figure',
    ],
    cols: 1,
    correct: 0,
    explain: 'Dans le plan, « ne se coupent pas » suffisait à conclure. Dans l’espace, il y a trois cas, et il faut EN PLUS vérifier que les directeurs sont multiples l’un de l’autre. Sur une boîte, une arête du plancher et une arête verticale du fond en donnent l’exemple immédiat.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_espace-vecteurs-coordonnees-1ere_P4'] },
  },
  {
    id: 'ev-e9',
    requires: ['regle-orthogonalite-espace', 'formule-scalaire-espace'],
    skill: 'orthogonales',
    title: 'Deux droites orthogonales',
    prompt: 'Les directeurs de deux droites de l’espace valent (1 ; 0 ; 0) et (0 ; 0 ; 1). Que peut-on affirmer ?',
    options: [
      'Elles sont orthogonales, car 1×0 + 0×0 + 0×1 = 0 — sans que cela dise si elles se rencontrent',
      'Elles sont orthogonales, donc elles se coupent à angle droit',
      'Elles sont parallèles, car deux de leurs coordonnées sont nulles',
      'On ne peut rien conclure sans connaître un point de chaque droite',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le produit des directeurs est nul : c’est exactement le critère de l’orthogonalité, et il ne demande aucun point. Mais il ne dit rien de la rencontre : sur la boîte, (AB) et (CG) ont ces directeurs-là et n’ont aucun point commun.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_espace-vecteurs-coordonnees-1ere_P5'] },
  },
  {
    id: 'ev-e10',
    requires: ['regle-orthogonalite-espace', 'mem-nul-ne-veut-pas-dire-secantes', 'droites-espace-trois-cas'],
    skill: 'orthogonales',
    title: 'Ce que le produit nul ne dit pas',
    prompt: 'Le produit des directeurs de deux droites de l’espace est nul. Que sait-on avec certitude ?',
    options: [
      'Qu’elles font un angle droit — et rien de plus : elles peuvent se couper comme ne jamais se rencontrer',
      'Qu’elles se coupent en formant un angle droit',
      'Qu’elles sont parallèles',
      'Qu’elles sont confondues',
    ],
    cols: 1,
    correct: 0,
    explain: 'Sur la boîte, (AB) et (BC) ont un produit nul et se coupent en B ; (AB) et (CG) ont un produit nul et ne se rencontrent jamais. Même produit, réponses opposées : il décide de l’angle, jamais de la rencontre.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_espace-vecteurs-coordonnees-1ere_P5', 'premiere_specialite_espace-vecteurs-coordonnees-1ere_P3'] },
  },
];

// `module` pointe le module qui ENSEIGNE la compétence, jamais l'évaluation
// elle-même : le boss mesure, il n'enseigne pas.
const SKILLS = {
  coordonnees: { label: 'Les trois coordonnées', module: 2 },
  norme: { label: 'La longueur d’un vecteur', module: 3 },
  scalaire: { label: 'Le produit scalaire', module: 4 },
  paralleles: { label: 'Le parallélisme', module: 5 },
  orthogonales: { label: 'L’orthogonalité', module: 6 },
};

const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Lecteur de coins', test: (m) => !m.coordonnees },
  { id: 'b2', emoji: '🏅', label: 'Deux fois Pythagore', test: (m) => !m.norme },
  { id: 'b3', emoji: '🏅', label: 'Un terme de plus', test: (m) => !m.scalaire },
  { id: 'b4', emoji: '🏅', label: 'Trois cas, pas deux', test: (m) => !m.paralleles },
  { id: 'b5', emoji: '🏅', label: 'L’angle sans la rencontre', test: (m) => !m.orthogonales },
  { id: 'b-parfait', emoji: '💎', label: 'Maître de l’espace', test: (m) => Object.keys(m).length === 0 },
];

export default function Module07MissionFinaleLaBoite() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : la boîte"
      moduleSubtitle="Dix épreuves : trois coordonnées, une longueur, un produit, deux critères"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître de l’espace',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation. Réflexes : arrivée moins départ sur{' '}
            <strong>trois</strong> lignes, une seule racine à la fin, et ne jamais conclure sur ce
            que le dessin laisse croire.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '📍', label: 'un vecteur', value: 'trois nombres' },
        { id: 'r2', emoji: '📏', label: 'sa longueur', value: '√(x² + y² + z²)' },
        { id: 'r3', emoji: '⊙', label: 'le produit', value: 'xx′ + yy′ + zz′' },
        { id: 'r4', emoji: '∥', label: 'parallèles', value: 'directeurs multiples' },
        { id: 'r5', emoji: '⊥', label: 'orthogonales', value: 'produit nul' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître de l’espace !',
        title: 'Mission accomplie',
        message: 'Tu sais situer un point par trois nombres, mesurer un trajet, calculer un produit scalaire dans l’espace, et trancher entre parallèles et orthogonales sans te fier au dessin.',
        verbs: ['Situer', 'Mesurer', 'Calculer', 'Trancher'],
        masterBadgeLabel: 'Maître de l’espace',
      }}
    />
  );
}
