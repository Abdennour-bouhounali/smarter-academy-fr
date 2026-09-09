import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import VectorPlane from '../components/VectorPlane';
import { formatVec } from '../components/colinUtils';

/**
 * Module 6 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Chaque
 * distracteur encode une erreur RÉELLEMENT rencontrée dans la leçon :
 *   - sens contraire pris pour une autre direction (M1) ; « les deux
 *     coordonnées ont grandi » (M1, M3) ; colinéaires = même longueur ;
 *   - produits en croix ajoutés, ordre inversé, signe d'un produit de
 *     négatifs (M4, M5) ; « presque zéro » (M4, M6) ;
 *   - alignés ⇔ C entre A et B, ou AB = AC (M2) ; parallèles ⇔ CD = AB (M6).
 *
 * Les objets `assessment` sont écrits en toutes lettres. Les 9 LPs sont
 * tous couverts.
 */
const EPREUVES = [
  {
    id: 'col-e1',
    skill: 'rail',
    requires: ['colin-direction', 'colin-vocabulaire-direction-sens', 'colin-critere-det'],
    title: 'Sens contraire',
    prompt: 'u (3 ; −1) et v (−6 ; 2). Sont-ils colinéaires ?',
    options: [
      'Oui : v = −2·u, même direction, sens contraire',
      'Non : ils partent dans des sens opposés',
      'Non : v est deux fois plus long que u',
      'Oui, mais seulement si on les dessine du même point',
    ],
    cols: 1,
    explain: 'v = −2·u : sur le même rail, à l’envers, deux fois plus long. Ni le sens ni la longueur n’entrent dans la direction. det = 3 × 2 − (−1) × (−6) = 6 − 6 = 0.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_colinearite-alignement-2nde_P1'] },
  },
  {
    id: 'col-e2',
    skill: 'rail',
    requires: ['colin-multiple', 'colin-produits-croix'],
    title: 'Les deux ont grandi',
    prompt: 'u (2 ; 1) et v (4 ; 3). Sont-ils colinéaires ?',
    options: [
      'Non : ×2 sur x mais ×3 sur y, pas le même facteur',
      'Oui : les deux coordonnées ont augmenté',
      'Oui : v est plus long que u dans la même direction',
      'Non : ils n’ont pas la même longueur',
    ],
    cols: 1,
    explain: 'Colinéaires exigerait un SEUL facteur k pour les deux coordonnées. Ici 4 = 2 × 2 mais 3 = 1 × 3 : det = 2 × 3 − 1 × 4 = 2 ≠ 0. La longueur, elle, ne compte jamais.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_colinearite-alignement-2nde_P2'] },
  },
  {
    id: 'col-e3',
    skill: 'proportion',
    requires: ['colin-multiple', 'colin-coordonnee-manquante-prop'],
    title: 'La coordonnée manquante',
    prompt: 'u (3 ; −2) et v (−6 ; y) sont colinéaires. Que vaut y ?',
    options: ['4', '−4', '−12', '9'],
    cols: 4,
    explain: 'v = k·u avec −6 = 3k, donc k = −2, et y = −2 × (−2) = 4. Vérification : 3 × 4 − (−2) × (−6) = 12 − 12 = 0.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_colinearite-alignement-2nde_P3'] },
  },
  {
    id: 'col-e4',
    skill: 'det',
    requires: ['colin-formule-det', 'colin-calculer-det'],
    title: 'Calculer un déterminant',
    prompt: 'u (2 ; 5) et v (3 ; 7). det(u, v) = ?',
    options: ['−1', '29', '1', '0'],
    cols: 4,
    explain: 'det = x_u × y_v − y_u × x_v = 2 × 7 − 5 × 3 = 14 − 15 = −1. 29 additionne les produits ; 1 inverse l’ordre ; et −1 n’est pas 0 : u et v ne sont pas colinéaires.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_colinearite-alignement-2nde_P4'] },
  },
  {
    id: 'col-e5',
    skill: 'det',
    requires: ['colin-calculer-det', 'mem-colin-det-zero'],
    title: 'Le signe des produits',
    prompt: 'u (−4 ; 6) et v (2 ; −3). Que vaut det(u, v), et que peut-on en conclure ?',
    options: [
      'det = 12 − 12 = 0 : colinéaires',
      'det = 12 + 12 = 24 : non colinéaires',
      'det = −12 − 12 = −24 : non colinéaires',
      'det = 0, mais on ne peut rien conclure',
    ],
    cols: 1,
    explain: '(−4) × (−3) = +12 et 6 × 2 = 12 : det = 12 − 12 = 0. Nul, donc colinéaires (v = −0,5·u). Le produit de deux négatifs est positif — c’est là que le calcul se rate.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_colinearite-alignement-2nde_P5', 'seconde_colinearite-alignement-2nde_P4'] },
  },
  {
    id: 'col-e6',
    skill: 'alignes',
    requires: ['colin-alignement-det'],
    title: 'Trois points',
    prompt: 'A (1 ; 2), B (3 ; 5), C (7 ; 11). Alignés ?',
    options: [
      'Oui : AB (2 ; 3), AC (6 ; 9), det = 18 − 18 = 0',
      'Non : AB ≠ AC',
      'Non : C n’est pas entre A et B',
      'Oui : les trois abscisses et les trois ordonnées augmentent',
    ],
    cols: 1,
    explain: 'Alignés ⇔ AB et AC colinéaires ⇔ det(AB, AC) = 2 × 9 − 3 × 6 = 0. Oui. Qu’ils soient égaux ou que C soit « entre » ne joue aucun rôle ; et « tout augmente » ne prouve rien.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_colinearite-alignement-2nde_P6'] },
  },
  {
    id: 'col-e7',
    skill: 'alignes',
    requires: ['colin-alignement-det', 'colin-oeil-hesite'],
    title: 'Le presque-aligné',
    prompt: 'A (0 ; 0), B (3 ; 1), C (7 ; 2). Alignés ?',
    options: [
      'Non : det(AB, AC) = 3 × 2 − 1 × 7 = −1 ≠ 0',
      'Oui : det = −1, c’est presque zéro',
      'Oui : sur un dessin, ils ont l’air alignés',
      'Non : AC est plus long que AB',
    ],
    cols: 1,
    explain: 'det(AB, AC) = 3 × 2 − 1 × 7 = −1. Non nul : pas alignés, à un carreau près — et « presque zéro » n’existe pas pour un déterminant. Le point aligné serait C (6 ; 2), ou (9 ; 3).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_colinearite-alignement-2nde_P6', 'seconde_colinearite-alignement-2nde_P8'] },
  },
  {
    id: 'col-e8',
    skill: 'paralleles',
    requires: ['colin-parallelisme-det', 'colin-vocabulaire-parallele'],
    title: 'Deux droites',
    prompt: 'A (−2 ; 1), B (1 ; 3), C (4 ; −1), D (−2 ; −5). Les droites (AB) et (CD) sont-elles parallèles ?',
    options: [
      'Oui : AB (3 ; 2), CD (−6 ; −4), det = −12 + 12 = 0',
      'Non : CD ≠ AB',
      'Non : CD part dans le sens contraire',
      'Oui : elles ne se coupent pas sur le dessin',
    ],
    cols: 1,
    explain: '(AB) ∥ (CD) ⇔ AB et CD colinéaires ⇔ det(AB, CD) = 3 × (−4) − 2 × (−6) = −12 + 12 = 0. Oui — CD = −2·AB, à l’envers et deux fois plus long, ce qui ne change rien à la direction.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_colinearite-alignement-2nde_P7'] },
  },
  {
    id: 'col-e9',
    skill: 'paralleles',
    requires: ['colin-parallelisme-det', 'colin-methode-conclure'],
    title: 'Quel quadrilatère ?',
    prompt: 'A (0 ; 0), B (4 ; 1), C (10 ; 5), D (2 ; 3). AB (4 ; 1), DC (8 ; 2), AD (2 ; 3), BC (6 ; 4). Que peut-on dire de ABCD ?',
    options: [
      '(AB) ∥ (DC) mais (AD) et (BC) sécantes : un trapèze, pas un parallélogramme',
      'Un parallélogramme : AB et DC sont colinéaires',
      'Ni l’un ni l’autre : AB ≠ DC',
      'Un parallélogramme : det(AD, BC) = 2 × 4 − 3 × 6 = −10',
    ],
    cols: 1,
    explain: 'det(AB, DC) = 4 × 2 − 1 × 8 = 0 : (AB) ∥ (DC). det(AD, BC) = 2 × 4 − 3 × 6 = −10 ≠ 0 : (AD) et (BC) sont sécantes. Un seul couple de côtés parallèles : un trapèze. Un parallélogramme exigerait AB = DC.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_colinearite-alignement-2nde_P9', 'seconde_colinearite-alignement-2nde_P7'] },
  },
  {
    id: 'col-e10',
    skill: 'problemes',
    requires: ['colin-coordonnee-manquante-det', 'mem-colin-deux-usages'],
    title: 'Aligner un point',
    prompt: 'A (−1 ; 2), B (2 ; 4), C (5 ; y). Pour quelle valeur de y les points sont-ils alignés ?',
    options: ['6', '4', '8', '5'],
    cols: 4,
    explain: 'AB (3 ; 2), AC (6 ; y − 2). det = 3(y − 2) − 2 × 6 = 3y − 18 = 0 ⇔ y = 6. Alors AC = (6 ; 4) = 2·AB.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_colinearite-alignement-2nde_P8', 'seconde_colinearite-alignement-2nde_P3'] },
  },
];

const SKILLS = {
  rail: { label: 'Colinéarité (le rail)', module: 1 },
  alignes: { label: 'Trois points alignés', module: 2 },
  proportion: { label: 'Coordonnées proportionnelles', module: 3 },
  det: { label: 'Déterminant', module: 4 },
  paralleles: { label: 'Droites parallèles', module: 5 },
  problemes: { label: 'Résoudre', module: 5 },
};

const BADGES = [
  { id: 'b-rail', emoji: '🏅', label: 'Sur le rail', test: (m) => !m.rail },
  { id: 'b-align', emoji: '🏅', label: 'Trois points, une droite', test: (m) => !m.alignes },
  { id: 'b-prop', emoji: '🏅', label: 'Le bon facteur', test: (m) => !m.proportion },
  { id: 'b-det', emoji: '🏅', label: 'Détecteur calibré', test: (m) => !m.det },
  { id: 'b-par', emoji: '🏅', label: 'Droites jumelles', test: (m) => !m.paralleles },
  { id: 'b-prob', emoji: '🏅', label: 'Prouveur', test: (m) => !m.problemes },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du déterminant', test: (m) => Object.keys(m).length === 0 },
];

/** La synthèse : le rail de u, v = −2·u dessus, et trois points alignés. */

export default function Module06MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le détecteur"
      moduleSubtitle="Dix épreuves pour prouver qu’aucun alignement ne t’échappe"
      estimatedTime="13 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître du déterminant',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Réflexe à chaque fois : deux vecteurs,
            un déterminant, zéro ou pas zéro.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🛤️', label: 'Colinéaires', value: 'même rail' },
        { id: 'r2', emoji: '✖️', label: 'Multiple', value: 'v = k·u' },
        { id: 'r3', emoji: '🔎', label: 'Déterminant', value: 'x·y′ − y·x′' },
        { id: 'r4', emoji: '📐', label: 'Nul ⇔', value: 'alignés / parallèles' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître du déterminant !',
        title: 'Mission accomplie',
        message: 'Tu sais reconnaître, calculer, décider et prouver un alignement ou un parallélisme.',
        verbs: ['Reconnaître', 'Calculer', 'Décider', 'Prouver'],
        masterBadgeLabel: 'Maître du déterminant',
      }}
    />
  );
}
