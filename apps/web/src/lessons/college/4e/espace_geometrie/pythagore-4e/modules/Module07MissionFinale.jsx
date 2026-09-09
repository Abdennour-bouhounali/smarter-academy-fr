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
 * TRANSFERT, pas répétition : aucune épreuve ne reprend les valeurs des
 * modules (ni le 3-4-5 du puzzle, ni le 13-5 du module 5, ni l'échelle de
 * 5 m), et chaque distracteur encode une erreur RÉELLEMENT rencontrée :
 *   — additionner les longueurs au lieu des carrés (M4) ;
 *   — oublier d'extraire la racine (M4) ;
 *   — additionner alors qu'il fallait soustraire (M5) ;
 *   — prendre pour hypoténuse un côté qui n'en est pas un (M5) ;
 *   — appliquer le théorème à un triangle non rectangle (M2, M6).
 *
 * `badges[].test` est une FONCTION `(misses) => bool`. Les 6 LPs sont couverts.
 */
const SKILLS = {
  enonce: { label: 'Énoncer le théorème', module: 3, emoji: '📜' },
  hypo: { label: 'Calculer l’hypoténuse', module: 4, emoji: '📏' },
  cote: { label: 'Calculer un côté', module: 5, emoji: '📐' },
  decider: { label: 'Décider et appliquer', module: 6, emoji: '⚖️' },
};

const BADGES = [
  { id: 'b-en', emoji: '📜', label: 'Théorème su', test: (m) => !m.enonce },
  { id: 'b-hy', emoji: '📏', label: 'Hypoténuse sûre', test: (m) => !m.hypo },
  { id: 'b-co', emoji: '📐', label: 'Côté retrouvé', test: (m) => !m.cote },
  { id: 'b-de', emoji: '⚖️', label: 'Juge du rectangle', test: (m) => !m.decider },
  { id: 'b-parfait', emoji: '💎', label: 'Maître de Pythagore', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'py4-e1',
    skill: 'enonce',
    title: 'L’hypoténuse',
    prompt: 'Dans un triangle DEF rectangle en E, quel côté est l’hypoténuse ?',
    options: ['[DF]', '[DE]', '[EF]', 'Le plus court'],
    correct: 0,
    cols: 4,
    requires: ['hypotenuse'],
    explain: 'L’hypoténuse est le côté opposé à l’angle droit. L’angle droit est en E, donc l’hypoténuse est le côté qui ne touche pas E : [DF].',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_pythagore-4e_P1'] },
  },
  {
    id: 'py4-e2',
    skill: 'enonce',
    title: 'L’égalité',
    prompt: 'Un triangle RST est rectangle en S. Quelle égalité est vraie ?',
    options: ['RS² + ST² = RT²', 'RS² + RT² = ST²', 'RS + ST = RT', 'RS² − ST² = RT²'],
    correct: 0,
    cols: 2,
    requires: ['theoreme-pythagore'],
    explain: 'Les côtés de l’angle droit partent de S : ce sont [SR] et [ST]. Leurs carrés s’additionnent pour donner celui de [RT], l’hypoténuse.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_pythagore-4e_P1'] },
  },
  {
    id: 'py4-e3',
    skill: 'hypo',
    title: 'Le carré de l’hypoténuse',
    prompt: 'Les côtés de l’angle droit mesurent 9 cm et 12 cm. Combien vaut le carré de l’hypoténuse ?',
    options: ['225', '21', '441', '108'],
    correct: 0,
    cols: 4,
    requires: ['theoreme-pythagore'],
    explain: '9² + 12² = 81 + 144 = 225. (21 serait 9 + 12 ; 441 serait (9 + 12)².)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_pythagore-4e_P2'] },
  },
  {
    id: 'py4-e4',
    skill: 'hypo',
    title: 'La longueur, pas son carré',
    prompt: 'Toujours avec 9 cm et 12 cm : combien mesure l’hypoténuse ?',
    options: ['225 cm', '15 cm', '21 cm', '112,5 cm'],
    correct: 1,
    cols: 4,
    requires: ['methode-calculer'],
    explain: '225 est le CARRÉ de l’hypoténuse. La longueur est le nombre dont le carré vaut 225 : c’est 15 cm.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_pythagore-4e_P2'] },
  },
  {
    id: 'py4-e5',
    skill: 'hypo',
    title: 'Quand ça ne tombe pas juste',
    prompt: 'Deux côtés de l’angle droit mesurent 5 et 6. Entre quels entiers se trouve l’hypoténuse ?',
    options: ['Entre 7 et 8', 'Entre 5 et 6', 'Entre 10 et 11', 'Entre 30 et 31'],
    correct: 0,
    cols: 2,
    requires: ['methode-calculer', 'encadrer-une-racine'],
    explain: '5² + 6² = 61. Or 7² = 49 et 8² = 64 : la racine de 61 est donc entre 7 et 8.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_pythagore-4e_P2'] },
  },
  {
    id: 'py4-e6',
    skill: 'cote',
    title: 'Le côté manquant',
    prompt: 'Un triangle rectangle a une hypoténuse de 25 cm et un côté de 7 cm. Combien mesure le troisième côté ?',
    options: ['24 cm', '32 cm', '18 cm', '26 cm'],
    correct: 0,
    cols: 4,
    requires: ['methode-calculer', 'controle-hypotenuse'],
    explain: '25² − 7² = 625 − 49 = 576, et 24² = 576. (32 viendrait d’une addition des carrés ; 18 d’une soustraction des longueurs.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_pythagore-4e_P3'] },
  },
  {
    id: 'py4-e7',
    skill: 'cote',
    title: 'Le contrôle',
    prompt: 'Un élève calcule un côté de l’angle droit et trouve 30 cm, alors que l’hypoténuse mesure 26 cm. Que dire ?',
    options: [
      'C’est impossible : un côté de l’angle droit est toujours plus court que l’hypoténuse',
      'C’est possible si le triangle est très aplati',
      'C’est possible, il faut juste vérifier l’unité',
      'On ne peut pas savoir sans le troisième côté',
    ],
    correct: 0,
    cols: 1,
    requires: ['controle-hypotenuse'],
    explain: 'L’hypoténuse est le plus grand côté du triangle rectangle. Trouver plus long qu’elle signale une addition faite à la place d’une soustraction.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_pythagore-4e_P3'] },
  },
  {
    id: 'py4-e8',
    skill: 'decider',
    title: 'Rectangle ?',
    prompt: 'Un triangle a pour côtés 20, 21 et 29. Est-il rectangle ?',
    options: [
      'Oui : 400 + 441 = 841 et 29² = 841',
      'Non : 20 + 21 ≠ 29',
      'Non : les trois nombres sont trop proches',
      'On ne peut pas le savoir sans figure',
    ],
    correct: 0,
    cols: 1,
    requires: ['reciproque'],
    explain: 'On compare les deux membres : 20² + 21² = 841 et 29² = 841. Ils sont égaux, donc le triangle est rectangle.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_pythagore-4e_P4'] },
  },
  {
    id: 'py4-e9',
    skill: 'decider',
    title: 'Pas rectangle',
    prompt: 'Un triangle a pour côtés 6, 7 et 10. Que peut-on affirmer ?',
    options: [
      'Il n’est pas rectangle : 36 + 49 = 85, et 10² = 100',
      'Il est rectangle',
      'Il est rectangle si l’angle droit est entre 6 et 7',
      'Il faut mesurer les angles pour le savoir',
    ],
    correct: 0,
    cols: 1,
    requires: ['contraposee'],
    explain: '85 et 100 diffèrent. Si le triangle était rectangle, ils seraient égaux : il ne l’est donc pas — sans qu’aucune mesure d’angle soit nécessaire.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_pythagore-4e_P5'] },
  },
  {
    id: 'py4-e10',
    skill: 'decider',
    title: 'Le problème complet',
    prompt: 'Un écran rectangulaire mesure 80 cm de large et 60 cm de haut. Quelle distance sépare deux coins opposés de l’écran ?',
    options: ['100 cm', '140 cm', '20 cm', '70 cm'],
    correct: 0,
    cols: 4,
    requires: ['methode-calculer', 'hypotenuse'],
    explain: 'Les côtés d’un rectangle forment un angle droit : le segment joignant deux coins opposés en est l’hypoténuse. 80² + 60² = 6400 + 3600 = 10 000, et 100² = 10 000.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_pythagore-4e_P6'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : le chantier"
      moduleSubtitle="Dix épreuves, une seule soumission"
      estimatedTime="9 min"
      lessonConfig={LESSON_CONFIG}
      brief={{
        tag: '🏆 Mission finale',
        title: 'Le chantier',
        tone: 'amber',
        body: (
          <>
            Dix situations où l’angle droit se cache. Réponds à tout, puis soumets :
            aucune correction avant la fin.
          </>
        ),
      }}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'Pythagore maîtrisé',
        title: 'Mission accomplie',
        message: 'Tu sais reconnaître l’hypoténuse, calculer une longueur dans les deux sens, et décider si un triangle est rectangle sans avoir besoin d’une figure.',
        verbs: ['Reconnaître', 'Écrire', 'Calculer', 'Décider'],
        masterBadgeLabel: 'Maître de Pythagore',
      }}
    />
  );
}
