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
 * TRANSFERT, pas répétition (§45) : aucune épreuve ne reprend les valeurs des
 * modules. Les contextes changent (voile, charpente, cerf-volant, parcelle,
 * enseigne) et chaque distracteur encode une erreur RÉELLEMENT rencontrée :
 *   — additionner au lieu de retirer de 180° (M2) ;
 *   — accepter le cas d'égalité de l'inégalité triangulaire (M3) ;
 *   — croire qu'un grand triangle a une plus grande somme d'angles (M1) ;
 *   — confondre hauteur et médiane (M6) ;
 *   — croire que le centre du cercle circonscrit est toujours dedans (M5) ;
 *   — croire que « même aire » veut dire « même forme » (M6).
 *
 * PÉRIMÈTRE 5e — vérifié épreuve par épreuve : aucun Pythagore, aucun Thalès,
 * aucune trigonométrie, aucun centre de gravité démontré.
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 7 LPs sont tous couverts.
 *
 * `badges[].test` est une FONCTION (m) => bool — un objet y provoquerait
 * « b.test is not a function » au montage.
 */
const SKILLS = {
  somme: { label: 'Somme des angles', emoji: '📐', module: 1 },
  calculer: { label: 'Calculer un angle', emoji: '🧮', module: 2 },
  inegalite: { label: 'Inégalité triangulaire', emoji: '📏', module: 3 },
  construire: { label: 'Construire', emoji: '🧭', module: 4 },
  cercle: { label: 'Cercle circonscrit', emoji: '⭕', module: 5 },
  droites: { label: 'Hauteur et médiane', emoji: '📉', module: 6 },
};

const BADGES = [
  { id: 'b-somme', emoji: '📐', label: 'Gardien des 180°', test: (m) => !m.somme },
  { id: 'b-calculer', emoji: '🧮', label: 'Calculateur d’angles', test: (m) => !m.calculer },
  { id: 'b-inegalite', emoji: '📏', label: 'Juge des longueurs', test: (m) => !m.inegalite },
  { id: 'b-construire', emoji: '🧭', label: 'Maître du compas', test: (m) => !m.construire },
  { id: 'b-cercle', emoji: '⭕', label: 'Chasseur de centres', test: (m) => !m.cercle },
  { id: 'b-droites', emoji: '📉', label: 'Œil du géomètre', test: (m) => !m.droites },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du triangle', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'tri5-e1',
    skill: 'somme',
    title: 'La grande voile',
    prompt: 'Une voile triangulaire est deux fois plus grande qu’une autre, de même forme. Que vaut la somme de ses angles ?',
    options: ['180°', '360°', '90°', 'Cela dépend de sa taille'],
    cols: 4,
    requires: ['somme-angles-triangle'],
    explain: 'La somme vaut 180° pour absolument tous les triangles. Agrandir allonge les côtés, mais n’ouvre pas les angles.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_triangles-5e_P1'] },
  },
  {
    id: 'tri5-e2',
    skill: 'calculer',
    title: 'La charpente',
    prompt: 'Dans une ferme de charpente triangulaire, deux angles mesurent 34° et 81°. Combien mesure le troisième ?',
    options: ['65°', '115°', '95°', '245°'],
    cols: 4,
    requires: ['calculer-angle-manquant', 'somme-angles-triangle'],
    explain: '34 + 81 = 115, puis 180 − 115 = 65°. (115° est la somme des deux angles connus, pas le troisième angle.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_triangles-5e_P2'] },
  },
  {
    id: 'tri5-e3',
    skill: 'calculer',
    title: 'Le triangle rectangle',
    prompt: 'Dans un triangle rectangle, l’un des angles aigus mesure 28°. Combien mesure l’autre ?',
    options: ['62°', '152°', '28°', '90°'],
    cols: 4,
    requires: ['calculer-angle-manquant'],
    explain: 'L’angle droit occupe 90°, il reste 90° pour les deux angles aigus : 90 − 28 = 62°.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_triangles-5e_P2'] },
  },
  {
    id: 'tri5-e4',
    skill: 'inegalite',
    title: 'Le cerf-volant',
    prompt: 'Peut-on fabriquer un triangle avec des baguettes de 5 cm, 9 cm et 3 cm ?',
    options: [
      'Non : 9 > 5 + 3, les deux courtes ne se rejoignent pas',
      'Oui : les trois longueurs sont différentes',
      'Oui : 9 < 5 + 3 + 9',
      'Seulement si on plie une baguette',
    ],
    cols: 2,
    requires: ['inegalite-triangulaire'],
    explain: 'On compare le plus grand côté à la somme des deux autres : 5 + 3 = 8, et 9 > 8. Les deux baguettes courtes sont trop courtes pour se rejoindre.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_triangles-5e_P3'] },
  },
  {
    id: 'tri5-e5',
    skill: 'inegalite',
    title: 'Le cas limite',
    prompt: 'Trois longueurs mesurent 6 cm, 4 cm et 10 cm. Que peut-on construire ?',
    options: [
      'Rien : la figure serait plate, c’est un segment',
      'Un triangle très aplati mais valable',
      'Un triangle rectangle',
      'Un triangle isocèle',
    ],
    cols: 2,
    requires: ['inegalite-triangulaire'],
    explain: '10 = 6 + 4 exactement : les trois points sont alignés. On obtient un segment, sans surface ni angles — le cas d’égalité est exclu.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_triangles-5e_P4'] },
  },
  {
    id: 'tri5-e6',
    skill: 'construire',
    title: 'Au compas',
    prompt: 'Pour construire un triangle dont on connaît les trois côtés, comment obtient-on le troisième sommet ?',
    options: [
      'Par l’intersection de deux arcs de cercle',
      'En mesurant un angle au rapporteur',
      'En traçant une perpendiculaire',
      'En plaçant le point à vue',
    ],
    cols: 2,
    requires: ['construire-triangle'],
    explain: 'Un arc de centre B et de rayon AB rassemble tous les points à la bonne distance de B ; le second arc fait de même depuis C. Leur croisement satisfait les deux conditions à la fois.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_triangles-5e_P5'] },
  },
  {
    id: 'tri5-e7',
    skill: 'cercle',
    title: 'La parcelle',
    prompt: 'Un jardinier veut planter un arbre à égale distance de trois bornes formant un triangle. Où doit-il creuser ?',
    options: [
      'Au point de concours des trois médiatrices',
      'Au milieu du plus grand côté',
      'Au point de concours des trois hauteurs',
      'Nulle part : un tel point n’existe pas',
    ],
    cols: 2,
    requires: ['mediatrices-cercle-circonscrit'],
    explain: 'Les médiatrices rassemblent les points à égale distance de deux sommets ; leur point commun est donc à égale distance des trois. C’est le centre du cercle circonscrit.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_triangles-5e_P6'] },
  },
  {
    id: 'tri5-e8',
    skill: 'cercle',
    title: 'Toujours dedans ?',
    prompt: 'Le centre du cercle circonscrit d’un triangle se trouve-t-il toujours à l’intérieur du triangle ?',
    options: [
      'Non : il en sort quand un angle dépasse 90°',
      'Oui, toujours',
      'Oui, sauf pour les triangles rectangles',
      'Non : il est toujours à l’extérieur',
    ],
    cols: 2,
    requires: ['mediatrices-cercle-circonscrit'],
    explain: 'Dans un triangle obtusangle, le centre sort du triangle ; dans un triangle rectangle, il tombe sur le milieu du plus grand côté. Le cercle, lui, passe toujours par les trois sommets.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_triangles-5e_P6'] },
  },
  {
    id: 'tri5-e9',
    skill: 'droites',
    title: 'L’enseigne',
    prompt: 'Dans un triangle quelconque, quelle droite issue d’un sommet rejoint le MILIEU du côté opposé ?',
    options: ['La médiane', 'La hauteur', 'La médiatrice', 'La bissectrice'],
    cols: 4,
    requires: ['hauteur-et-mediane'],
    explain: 'La médiane vise le milieu (médi- comme milieu). La hauteur, elle, tombe perpendiculairement, et rarement au milieu.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_triangles-5e_P7'] },
  },
  {
    id: 'tri5-e10',
    skill: 'droites',
    title: 'Le partage du terrain',
    prompt: 'Un terrain triangulaire est coupé par une médiane. Que peut-on dire des deux parcelles obtenues ?',
    options: [
      'Elles ont la même aire, mais pas la même forme',
      'Elles ont la même forme et la même aire',
      'La plus grande a le double de l’aire de l’autre',
      'On ne peut rien dire sans les mesures',
    ],
    cols: 2,
    requires: ['mediane-deux-aires-egales'],
    explain: 'Même base (le milieu partage le côté en deux longueurs égales) et même hauteur (celle issue du sommet) : les aires sont égales. Les formes, en revanche, diffèrent presque toujours.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_triangles-5e_P7'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : les triangles"
      moduleSubtitle="Dix épreuves pour prouver que le triangle n’a plus de secret"
      estimatedTime="6 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître du triangle',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune, souviens-toi des trois
            contraintes : <strong>180° pour les angles</strong>,{' '}
            <strong>l’inégalité pour les côtés</strong>, et{' '}
            <strong>milieu ou perpendiculaire</strong> pour les droites.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '📐', label: 'Trois angles', value: 'toujours 180°' },
        { id: 'r2', emoji: '📏', label: 'Le plus grand côté', value: '< somme des deux autres' },
        { id: 'r3', emoji: '⭕', label: 'Médiatrices', value: 'cercle circonscrit' },
        { id: 'r4', emoji: '📉', label: 'Médiane', value: 'milieu, et deux aires égales' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître du triangle !',
        title: 'Mission accomplie',
        message: 'Tu sais calculer, construire, et démontrer dans un triangle.',
        verbs: ['Calculer', 'Construire', 'Raisonner', 'Démontrer'],
        masterBadgeLabel: 'Maître du triangle',
      }}
    />
  );
}
