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
 * modules (ni les températures, ni les altitudes, ni les refuges), et chaque
 * distracteur encode une erreur RÉELLEMENT rencontrée :
 *   — annoncer le nombre de graduations à la place de la coordonnée (M2) ;
 *   — multiplier au lieu de diviser pour placer, ou l'inverse (M4) ;
 *   — choisir un pas qui confond des relevés (M1) ;
 *   — choisir un pas qui laisse les valeurs entre deux traits (M1) ;
 *   — juger un parallélogramme à l'œil (M5) ;
 *   — croire que le point qui paraît proche l'est (M6).
 *
 * COUVERTURE : les 4 LPs sont couverts, chacun par au moins deux épreuves.
 * `badges[].test` est une FONCTION `(misses) => bool`.
 */
const SKILLS = {
  lire: { label: 'Lire des coordonnées', module: 2, emoji: '👁️' },
  choisir: { label: 'Choisir une graduation', module: 3, emoji: '📏' },
  placer: { label: 'Placer un point', module: 4, emoji: '📌' },
  decider: { label: 'Décider par les coordonnées', module: 6, emoji: '🧭' },
};

const BADGES = [
  { id: 'b-li', emoji: '👁️', label: 'Lecture sûre', test: (m) => !m.lire },
  { id: 'b-ch', emoji: '📏', label: 'Graduation juste', test: (m) => !m.choisir },
  { id: 'b-pl', emoji: '📌', label: 'Point bien posé', test: (m) => !m.placer },
  { id: 'b-de', emoji: '🧭', label: 'Juge des figures', test: (m) => !m.decider },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du repérage', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'rp4-e1',
    skill: 'lire',
    title: 'Compter n’est pas lire',
    prompt: 'Sur un axe dont une graduation vaut 0,5, un point est posé 5 graduations à droite de l’origine. Quelle est son abscisse ?',
    options: ['2,5', '5', '10', '5,5'],
    correct: 0,
    cols: 4,
    requires: ['coordonnee-decimale'],
    explain: '5 graduations de 0,5 : 5 × 0,5 = 2,5. (5 serait le nombre de graduations ; 10 viendrait d’une division.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_reperage-4e_P1'] },
  },
  {
    id: 'rp4-e2',
    skill: 'lire',
    title: 'Une ordonnée négative',
    prompt: 'Une graduation verticale vaut 0,2. Un point est 6 graduations SOUS l’axe horizontal. Quelle est son ordonnée ?',
    options: ['−1,2', '−6', '−0,2', '1,2'],
    correct: 0,
    cols: 4,
    requires: ['coordonnee-decimale'],
    explain: '6 graduations de 0,2 font 1,2 ; sous l’axe horizontal, l’ordonnée est négative : −1,2.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_reperage-4e_P1'] },
  },
  {
    id: 'rp4-e3',
    skill: 'lire',
    title: 'Entre deux traits',
    prompt: 'Une graduation vaut 1. Un point est posé exactement au milieu entre les traits 3 et 4. Quelle est son abscisse ?',
    options: ['3,5', '4', '3', '7'],
    correct: 0,
    cols: 4,
    requires: ['coordonnee-decimale'],
    explain: 'Un point peut se poser entre deux graduations : son abscisse est alors décimale. L’arrondir à 3 ou à 4 serait une erreur, pas un arrondi.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_reperage-4e_P1'] },
  },
  {
    id: 'rp4-e4',
    skill: 'choisir',
    title: 'Le pas qui écrase',
    prompt: 'On veut représenter les masses 2,1 · 2,4 · 2,8 · 3,2 kg. Pourquoi une graduation de 1 kg ne convient-elle pas ?',
    options: [
      'Plusieurs masses tomberaient sur le même point',
      'L’axe aurait trop de graduations',
      'Les masses sont trop petites pour un repère',
      'Elle convient très bien',
    ],
    correct: 0,
    cols: 1,
    requires: ['trois-defauts'],
    explain: 'À 1 kg près, 2,1 et 2,4 tombent toutes deux sur 2, et 2,8 et 3,2 sur 3 : quatre masses distinctes ne donneraient que deux points. La donnée est perdue.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_reperage-4e_P2'] },
  },
  {
    id: 'rp4-e5',
    skill: 'choisir',
    title: 'Le pas qui noie',
    prompt: 'Des recettes vont de 0 à 4 000 €. Pourquoi une graduation de 10 € ne convient-elle pas ?',
    options: [
      'L’axe porterait 401 graduations : on ne peut plus les compter',
      'Les recettes seraient confondues',
      'Les valeurs tomberaient entre les traits',
      'Elle convient très bien',
    ],
    correct: 0,
    cols: 1,
    requires: ['trois-defauts'],
    explain: 'De 0 à 4 000 par pas de 10, il faut 401 graduations. Le défaut n’est pas la fidélité — elle est parfaite — mais la lisibilité. Un pas de 500 € suffirait.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_reperage-4e_P2'] },
  },
  {
    id: 'rp4-e6',
    skill: 'choisir',
    title: 'Le bon pas',
    prompt: 'Des tailles d’élèves vont de 1,50 m à 1,80 m, mesurées au centimètre. Quelle graduation choisir ?',
    options: [
      '0,05 m : 7 graduations, et chaque taille reste distincte au demi-décimètre près',
      '0,001 m : c’est le plus précis',
      '0,5 m : l’axe sera très court',
      '1 m : c’est l’unité de la grandeur',
    ],
    correct: 0,
    cols: 1,
    requires: ['methode-graduation'],
    explain: 'De 1,50 à 1,80 par pas de 0,05 : 7 graduations, un axe lisible. À 0,001 m il en faudrait 301 ; à 0,5 m ou 1 m, toutes les tailles se confondraient.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_reperage-4e_P2'] },
  },
  {
    id: 'rp4-e7',
    skill: 'placer',
    title: 'Combien de graduations ?',
    prompt: 'Une graduation vaut 0,25. Combien de graduations faut-il compter pour poser un point d’abscisse 1,5 ?',
    options: ['6', '1,5', '0,375', '3'],
    correct: 0,
    cols: 4,
    requires: ['placer-pas-non-unitaire'],
    explain: 'On divise la coordonnée par le pas : 1,5 ÷ 0,25 = 6. (0,375 viendrait d’une multiplication, qui sert à LIRE et non à POSER.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_reperage-4e_P3'] },
  },
  {
    id: 'rp4-e8',
    skill: 'placer',
    title: 'Deux axes, deux pas',
    prompt: 'Sur l’axe horizontal une graduation vaut 2, sur l’axe vertical elle vaut 0,5. Où poser le point (6 ; −1) ?',
    options: [
      '3 graduations à droite, 2 graduations vers le bas',
      '6 graduations à droite, 1 graduation vers le bas',
      '12 graduations à droite, 0,5 graduation vers le bas',
      '3 graduations à droite, 1 graduation vers le bas',
    ],
    correct: 0,
    cols: 1,
    requires: ['placer-pas-non-unitaire'],
    explain: 'On divise chaque coordonnée par le pas de SON axe : 6 ÷ 2 = 3 graduations, et −1 ÷ 0,5 = −2 graduations. Les deux axes n’ont pas forcément le même pas.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_reperage-4e_P3'] },
  },
  {
    id: 'rp4-e9',
    skill: 'decider',
    title: 'Parallélogramme ou pas',
    prompt: 'Pour R(1 ; 1), S(5 ; 2), T(6 ; 6) et U(2 ; 5), le milieu de [RT] est (3,5 ; 3,5) et celui de [SU] est (3,5 ; 3,5). Que conclure ?',
    options: [
      'RSTU est un parallélogramme : ses diagonales ont le même milieu',
      'RSTU n’est pas un parallélogramme',
      'On ne peut rien conclure sans mesurer les côtés',
      'RSTU est un carré',
    ],
    correct: 0,
    cols: 1,
    requires: ['parallelogramme-milieux'],
    explain: 'Les diagonales d’un parallélogramme se coupent en leur milieu, et réciproquement. Les deux milieux coïncident, donc RSTU en est un — sans qu’aucune longueur n’ait été mesurée.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_reperage-4e_P4'] },
  },
  {
    id: 'rp4-e10',
    skill: 'decider',
    title: 'Le plus proche',
    prompt: 'Depuis P(2 ; 1), lequel de K(6 ; 2) et L(0 ; 5) est le plus proche ?',
    options: [
      'K : 4² + 1² = 17, contre 2² + 4² = 20 pour L',
      'L : il a des coordonnées plus petites',
      'K : son abscisse est plus grande',
      'Ils sont à la même distance',
    ],
    correct: 0,
    cols: 1,
    requires: ['decider-par-coordonnees'],
    explain: 'Pour K les écarts sont 4 et 1, donc 16 + 1 = 17. Pour L ils sont −2 et 4, donc 4 + 16 = 20. Le plus petit carré désigne le plus proche : c’est K.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_reperage-4e_P4'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : la carte"
      moduleSubtitle="Dix épreuves, une seule soumission"
      estimatedTime="5 min"
      lessonConfig={LESSON_CONFIG}
      brief={{
        tag: '🏆 Mission finale',
        title: 'La carte',
        tone: 'amber',
        body: (
          <>
            Dix situations où il faut lire, régler, poser ou trancher. Réponds à tout, puis
            soumets : aucune correction avant la fin.
          </>
        ),
      }}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'Repérage maîtrisé',
        title: 'Mission accomplie',
        message: 'Tu sais lire une coordonnée décimale, choisir toi-même la graduation qu’un jeu de données réclame, poser un point quand une graduation ne vaut pas 1, et te servir des coordonnées pour trancher une question de figure.',
        verbs: ['Lire', 'Choisir', 'Placer', 'Décider'],
        masterBadgeLabel: 'Maître du repérage',
      }}
    />
  );
}
