import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Le test CONSOLIDE :
 * il n'introduit ni concept, ni vocabulaire, ni notation neufs.
 *
 * TRANSFERT, pas répétition : aucune épreuve ne reprend les figures ni les
 * lettres des modules (ni le ABC du labo, ni le RST ou le MNP des preuves), et
 * chaque distracteur encode une erreur RÉELLEMENT rencontrée :
 *   — lire une propriété à l'envers de ce que l'énoncé donne (M2, M5) ;
 *   — croire qu'une réciproque est vraie sans l'avoir vérifiée (M5) ;
 *   — confondre définition et propriété (M5) ;
 *   — appliquer la droite des milieux à un point qui n'est pas un milieu (M4) ;
 *   — conclure sans invoquer la propriété (M6) ;
 *   — prendre une observation de figure pour une preuve (M6).
 *
 * PÉRIMÈTRE. Aucune épreuve ne demande de calcul par le théorème de Pythagore :
 * il appartient à la leçon SŒUR `pythagore-4e`. Aucune ne mobilise Thalès ni la
 * trigonométrie : ce sont des objets de 3e.
 *
 * `badges[].test` est une FONCTION `(misses) => bool`. Les 4 LPs sont couverts,
 * avec au moins deux épreuves chacun.
 */
const SKILLS = {
  cercle: { label: 'Le cercle circonscrit', module: 2, emoji: '⭕' },
  milieux: { label: 'La droite des milieux', module: 4, emoji: '📏' },
  logique: { label: 'Propriété et réciproque', module: 5, emoji: '🔁' },
  rediger: { label: 'Rédiger une preuve', module: 6, emoji: '✍️' },
};

const BADGES = [
  { id: 'b-ce', emoji: '⭕', label: 'Cercle maîtrisé', test: (m) => !m.cercle },
  { id: 'b-mi', emoji: '📏', label: 'Milieux sûrs', test: (m) => !m.milieux },
  { id: 'b-lo', emoji: '🔁', label: 'Sens de lecture', test: (m) => !m.logique },
  { id: 'b-re', emoji: '✍️', label: 'Preuve rédigée', test: (m) => !m.rediger },
  { id: 'b-parfait', emoji: '🕵️', label: 'Détective en chef', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'tg4-e1',
    skill: 'cercle',
    title: 'Le point sur le cercle',
    prompt: 'Les points D, E et F sont sur un cercle, et [DF] en est un diamètre. Que peut-on affirmer ?',
    options: [
      'Le triangle DEF est rectangle en E',
      'Le triangle DEF est rectangle en D',
      'Le triangle DEF est équilatéral',
      'On ne peut rien affirmer sans mesurer',
    ],
    correct: 0,
    cols: 1,
    requires: ['caracterisation-rectangle'],
    explain: 'L’angle droit se trouve au sommet OPPOSÉ au diamètre — celui qui n’est pas une extrémité de [DF]. C’est donc E.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_triangles-4e_P1'] },
  },
  {
    id: 'tg4-e2',
    skill: 'cercle',
    title: 'Où est le centre ?',
    prompt: 'Un triangle GHI est rectangle en H. Où se trouve le centre de son cercle circonscrit ?',
    options: [
      'Au milieu de [GI]',
      'Au milieu de [GH]',
      'Au sommet H',
      'À l’intersection des trois hauteurs',
    ],
    correct: 0,
    cols: 2,
    requires: ['cercle-circonscrit-rectangle'],
    explain: 'L’angle droit est en H, donc le côté opposé est [GI] : c’est lui le diamètre, et son milieu est le centre.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_triangles-4e_P1'] },
  },
  {
    id: 'tg4-e3',
    skill: 'cercle',
    title: 'La médiane',
    prompt: 'Un triangle JKL est rectangle en K, et son hypoténuse [JL] mesure 18 cm. Combien mesure la médiane issue de K ?',
    options: ['9 cm', '18 cm', '36 cm', 'Cela dépend de la forme du triangle'],
    correct: 0,
    cols: 4,
    requires: ['cercle-circonscrit-rectangle', 'hypotenuse-diametre'],
    explain: 'La médiane issue de l’angle droit joint K au centre du cercle circonscrit : c’est un rayon. Or [JL] est le diamètre, donc la médiane vaut sa moitié : 18 ÷ 2 = 9 cm.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_triangles-4e_P1'] },
  },
  {
    id: 'tg4-e4',
    skill: 'milieux',
    title: 'Le segment des milieux',
    prompt: 'Dans un triangle UVW, S est le milieu de [UV] et T celui de [UW]. Le côté [VW] mesure 24 cm. Combien mesure [ST] ?',
    options: ['12 cm', '24 cm', '48 cm', '6 cm'],
    correct: 0,
    cols: 4,
    requires: ['droite-des-milieux'],
    explain: 'Le segment joignant deux milieux mesure la moitié du troisième côté : 24 ÷ 2 = 12 cm.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_triangles-4e_P2'] },
  },
  {
    id: 'tg4-e5',
    skill: 'milieux',
    title: 'Le point qui n’est pas un milieu',
    prompt: 'Dans un triangle ABD, P est le milieu de [AB], et Q est un point de [AD] tel que AQ = AD ÷ 3. Que peut-on dire de (PQ) ?',
    options: [
      'Rien de particulier : Q n’étant pas le milieu, la propriété ne s’applique pas',
      '(PQ) est parallèle à (BD)',
      'PQ vaut le tiers de BD',
      'PQ vaut la moitié de BD',
    ],
    correct: 0,
    cols: 1,
    requires: ['droite-des-milieux'],
    explain: 'La propriété exige que les DEUX points soient des milieux. Ici, un seul l’est : son hypothèse n’est pas vérifiée, donc elle ne dit rien de cette configuration.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_triangles-4e_P2'] },
  },
  {
    id: 'tg4-e6',
    skill: 'milieux',
    title: 'Dans l’autre sens',
    prompt: 'Dans un triangle XYZ, N est le milieu de [XY] et la droite (NM), avec M sur [XZ], est parallèle à (YZ). Que peut-on conclure ?',
    options: [
      'M est le milieu de [XZ]',
      'M est le milieu de [YZ]',
      'Le triangle XYZ est isocèle',
      'On ne peut pas conclure sans les longueurs',
    ],
    correct: 0,
    cols: 2,
    requires: ['reciproque-milieux'],
    explain: 'C’est la réciproque de la droite des milieux : un milieu plus le parallélisme forcent le second milieu.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_triangles-4e_P2'] },
  },
  {
    id: 'tg4-e7',
    skill: 'logique',
    title: 'Définition ou propriété ?',
    prompt: '« La médiatrice d’un segment est la droite perpendiculaire à ce segment en son milieu. » Cet énoncé est…',
    options: [
      'Une définition : il pose un mot, il n’y a rien à démontrer',
      'Une propriété, dont la réciproque est vraie',
      'Une propriété, dont la réciproque est fausse',
      'Une caractérisation',
    ],
    correct: 0,
    cols: 1,
    requires: ['propriete-et-reciproque'],
    explain: 'Une définition convient d’un mot pour un objet. Elle n’a ni hypothèse ni conclusion à échanger : parler de sa réciproque n’a pas de sens.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_triangles-4e_P3'] },
  },
  {
    id: 'tg4-e8',
    skill: 'logique',
    title: 'La réciproque qui tombe',
    prompt: '« Si un quadrilatère est un carré, alors ses diagonales ont la même longueur » est vrai. Que dire de sa réciproque ?',
    options: [
      'Elle est fausse : un rectangle non carré a aussi des diagonales de même longueur',
      'Elle est vraie, comme toute réciproque d’un énoncé vrai',
      'Elle est vraie, mais seulement pour les carrés',
      'On ne peut pas former la réciproque de cet énoncé',
    ],
    correct: 0,
    cols: 1,
    requires: ['propriete-et-reciproque', 'mem-un-seul-sens'],
    explain: 'Un seul contre-exemple suffit : un rectangle de 3 sur 8 a bien deux diagonales égales, et ce n’est pas un carré. Une réciproque n’est jamais vraie « automatiquement ».',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_triangles-4e_P3'] },
  },
  {
    id: 'tg4-e9',
    skill: 'rediger',
    title: 'La ligne manquante',
    prompt: 'Une copie dit : « [CD] est un diamètre du cercle qui passe par C, D et E. Donc le triangle CDE est rectangle en E. » Que manque-t-il ?',
    options: [
      'La propriété du cours qui autorise le passage de la donnée à la conclusion',
      'Rien : la donnée et la conclusion suffisent',
      'La mesure de l’angle en E',
      'Un dessin de la configuration',
    ],
    correct: 0,
    cols: 1,
    requires: ['charpente-demonstration'],
    explain: 'La conclusion est juste, mais rien ne la relie à la donnée. Il manque la ligne « Or, si un triangle est inscrit dans un cercle dont un côté est un diamètre, alors il est rectangle… ».',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_triangles-4e_P4'] },
  },
  {
    id: 'tg4-e10',
    skill: 'rediger',
    title: 'Ce qui ne prouve rien',
    prompt: 'Dans une démonstration, laquelle de ces lignes n’a AUCUNE valeur de preuve ?',
    options: [
      '« Sur la figure, les deux droites ont l’air parallèles. »',
      '« On sait que I est le milieu de [AB]. »',
      '« Or, si une droite passe par le milieu d’un côté et est parallèle à un autre côté… »',
      '« Donc J est le milieu de [AC]. »',
    ],
    correct: 0,
    cols: 1,
    requires: ['charpente-demonstration', 'mem-un-seul-sens'],
    explain: 'Une figure sert à comprendre, jamais à prouver : elle est toujours approximative. Une donnée vient de l’énoncé, une propriété vient du cours — l’œil ne fournit ni l’une ni l’autre.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_triangles-4e_P4'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : le dossier"
      moduleSubtitle="Dix épreuves, une seule soumission"
      estimatedTime="8 min"
      lessonConfig={LESSON_CONFIG}
      brief={{
        tag: '🏆 Mission finale',
        title: 'Le dossier',
        tone: 'amber',
        body: (
          <>
            Dix affaires à trancher. Réponds à tout, puis soumets : aucune correction avant la
            fin.
          </>
        ),
      }}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'Enquête close',
        title: 'Mission accomplie',
        message: 'Tu sais reconnaître un triangle rectangle à son cercle, utiliser la droite des milieux dans les deux sens, distinguer une propriété de sa réciproque, et rédiger une démonstration qui tient debout.',
        verbs: ['Caractériser', 'Utiliser', 'Distinguer', 'Rédiger'],
        masterBadgeLabel: 'Détective en chef',
      }}
    />
  );
}
