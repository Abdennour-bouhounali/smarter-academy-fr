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
 * TRANSFERT, pas répétition : aucune épreuve ne reprend le sac de billes ni la
 * roue des modules, et chaque distracteur encode une erreur RÉELLEMENT
 * rencontrée :
 *   — le contraire de « rouge » réduit à « bleue » (M3) ;
 *   — additionner deux effectifs qui se chevauchent (M4) ;
 *   — confondre « rare » et « impossible » (M5) ;
 *   — croire qu'une différence entre deux séries signale un truquage (M2) ;
 *   — attendre que la fréquence tombe EXACTEMENT sur la probabilité (M1).
 *
 * La bonne réponse est déclarée par `correct` et sa POSITION VARIE.
 * `badges[].test` est une FONCTION `(misses) => bool`.
 * Les 7 LPs sont tous couverts.
 */
const SKILLS = {
  contraire: { label: 'Événement contraire', module: 3, emoji: '🚫' },
  ensembles: { label: 'ET et OU', module: 4, emoji: '🔗' },
  bornes: { label: 'Impossible et certain', module: 5, emoji: '📏' },
  frequence: { label: 'Fréquence et probabilité', module: 1, emoji: '🎡' },
};

const BADGES = [
  { id: 'b-con', emoji: '🚫', label: 'Maître du contraire', test: (m) => !m.contraire },
  { id: 'b-ens', emoji: '🔗', label: 'Compteur sans doublon', test: (m) => !m.ensembles },
  { id: 'b-bor', emoji: '📏', label: 'Sens des extrêmes', test: (m) => !m.bornes },
  { id: 'b-fre', emoji: '🎡', label: 'Œil du statisticien', test: (m) => !m.frequence },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du hasard', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'pb4-e1',
    skill: 'contraire',
    title: 'Le contraire',
    prompt: 'Dans une classe, l’événement « l’élève interrogé est en 4e A ». Quel est son contraire ?',
    options: [
      'L’élève interrogé n’est pas en 4e A',
      'L’élève interrogé est en 4e B',
      'Aucun élève n’est interrogé',
      'L’élève interrogé est absent',
    ],
    correct: 0,
    cols: 1,
    requires: ['evenement-contraire'],
    explain: 'Le contraire regroupe TOUTES les autres possibilités : 4e B, 4e C, et toutes les autres classes — pas seulement la 4e B.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_probabilites-4e_P1'] },
  },
  {
    id: 'pb4-e2',
    skill: 'contraire',
    title: 'La probabilité du contraire',
    prompt: 'La probabilité qu’il pleuve demain est estimée à 0,35. Quelle est celle qu’il ne pleuve pas ?',
    options: ['0,35', '0,65', '−0,35', '1,35'],
    correct: 1,
    cols: 4,
    requires: ['somme-contraire'],
    explain: 'L’événement et son contraire couvrent toutes les possibilités : 1 − 0,35 = 0,65.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_probabilites-4e_P2'] },
  },
  {
    id: 'pb4-e3',
    skill: 'ensembles',
    title: 'Les deux à la fois',
    prompt: 'Dans un jeu de 32 cartes, combien de cartes sont à la fois « rouge » et « roi » ?',
    options: ['2', '4', '16', '20'],
    correct: 0,
    cols: 4,
    requires: ['intersection'],
    explain: 'Les rois rouges sont le roi de cœur et le roi de carreau : 2 cartes. (4 serait le nombre de rois, 16 le nombre de cartes rouges.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_probabilites-4e_P3'] },
  },
  {
    id: 'pb4-e4',
    skill: 'ensembles',
    title: 'L’un ou l’autre',
    prompt: 'Toujours sur 32 cartes : combien sont « rouges OU rois » ?',
    options: ['20', '18', '16', '12'],
    correct: 1,
    cols: 4,
    requires: ['reunion', 'intersection'],
    explain: '16 rouges et 4 rois font 20, mais les 2 rois rouges seraient comptés deux fois. Le vrai compte est 18.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_probabilites-4e_P4'] },
  },
  {
    id: 'pb4-e5',
    skill: 'ensembles',
    title: 'Sans chevauchement',
    prompt: 'Dans une urne, 5 jetons carrés et 7 jetons ronds, tous différents. Combien de jetons sont « carrés OU ronds » ?',
    options: ['12', '35', '7', '2'],
    correct: 0,
    cols: 4,
    requires: ['reunion'],
    explain: 'Aucun jeton n’est à la fois carré et rond : rien n’est compté deux fois, donc 5 + 7 = 12. C’est le seul cas où l’addition suffit.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_probabilites-4e_P4'] },
  },
  {
    id: 'pb4-e6',
    skill: 'bornes',
    title: 'Jamais',
    prompt: 'On lance un dé ordinaire, numéroté de 1 à 6. Quelle est la probabilité d’obtenir 7 ?',
    options: ['1/6', '0', '1/7', '1'],
    correct: 1,
    cols: 4,
    requires: ['impossible-certain'],
    explain: 'Aucun numéro du dé ne vaut 7 : aucune issue ne convient, la probabilité vaut 0. L’événement est impossible.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_probabilites-4e_P5'] },
  },
  {
    id: 'pb4-e7',
    skill: 'bornes',
    title: 'Rare, mais possible',
    prompt: 'Un jeu compte 10 000 billets, dont un seul gagnant. L’événement « gagner » est-il impossible ?',
    options: [
      'Non : sa probabilité est très petite, mais pas nulle',
      'Oui : les chances sont trop faibles',
      'Oui, car un seul billet gagne',
      'On ne peut pas le savoir',
    ],
    correct: 0,
    cols: 1,
    requires: ['impossible-certain'],
    explain: 'Sa probabilité vaut 1/10 000. Un événement n’est impossible que si AUCUNE issue ne le réalise — ici, il y en a une.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_probabilites-4e_P5'] },
  },
  {
    id: 'pb4-e8',
    skill: 'frequence',
    title: 'Deux séries',
    prompt: 'Deux élèves lancent la même pièce 50 fois. L’un obtient 22 piles, l’autre 27. Que conclure ?',
    options: [
      'C’est normal : les fréquences fluctuent d’une série à l’autre',
      'L’un des deux a mal compté',
      'La pièce est truquée',
      'La probabilité de pile n’est pas 0,5',
    ],
    correct: 0,
    cols: 1,
    requires: ['fluctuation'],
    explain: 'Sur 50 lancers, obtenir 22 ou 27 piles est banal. Deux séries identiques donnent presque toujours des résultats différents.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_probabilites-4e_P6'] },
  },
  {
    id: 'pb4-e9',
    skill: 'frequence',
    title: 'Beaucoup de lancers',
    prompt: 'On lance un dé équilibré 60 000 fois. À quoi peut-on s’attendre pour la fréquence du 6 ?',
    options: [
      'Exactement 1/6',
      'Très proche de 1/6, sans forcément l’égaler',
      'N’importe quelle valeur',
      'Nettement supérieure à 1/6',
    ],
    correct: 1,
    cols: 1,
    requires: ['stabilisation'],
    explain: 'Plus on répète, plus la fréquence se rapproche de la probabilité. Elle ne tombe pratiquement jamais dessus exactement.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_probabilites-4e_P6'] },
  },
  {
    id: 'pb4-e10',
    skill: 'frequence',
    title: 'Estimer par l’expérience',
    prompt: 'On ne connaît pas la composition d’une urne. Sur 5 000 tirages avec remise, on obtient 30 % de jetons verts. Que peut-on en dire ?',
    options: [
      'La proportion de verts dans l’urne est probablement proche de 30 %',
      'L’urne contient exactement 30 jetons verts',
      'On ne peut rien en déduire',
      'La proportion de verts est exactement 30 %',
    ],
    correct: 0,
    cols: 1,
    requires: ['stabilisation', 'probabilite'],
    explain: 'Sur un grand nombre de tirages, la fréquence observée donne une bonne estimation de la probabilité — donc de la proportion. « Proche de », jamais « exactement ».',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_probabilites-4e_P7'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : la fête foraine"
      moduleSubtitle="Dix épreuves, une seule soumission"
      estimatedTime="8 min"
      lessonConfig={LESSON_CONFIG}
      brief={{
        tag: '🏆 Mission finale',
        title: 'La fête foraine',
        tone: 'amber',
        body: (
          <>
            Dix situations de hasard, des cartes aux tombolas. Réponds à tout, puis soumets :
            aucune correction avant la fin.
          </>
        ),
      }}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'Probabilités maîtrisées',
        title: 'Mission accomplie',
        message: 'Tu sais décrire un contraire, croiser deux événements sans compter deux fois, reconnaître l’impossible et le certain, et lire ce que dit une longue série de lancers.',
        verbs: ['Décrire', 'Croiser', 'Reconnaître', 'Estimer'],
        masterBadgeLabel: 'Maître du hasard',
      }}
    />
  );
}
