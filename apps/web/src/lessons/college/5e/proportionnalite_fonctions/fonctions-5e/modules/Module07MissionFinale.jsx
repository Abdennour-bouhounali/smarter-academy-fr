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
 * PÉRIMÈTRE, vérifié épreuve par épreuve : aucune n'emploie f(x), « image »
 * ni « antécédent » — ni en énoncé, ni en distracteur, ni en correction.
 *
 * TRANSFERT, pas répétition : les contextes changent (bibliothèque, vélo,
 * bougie, piscine…) et chaque distracteur encode une erreur RÉELLEMENT
 * rencontrée dans la leçon :
 *   — retourner la phrase « en fonction de » (M2) ;
 *   — croire que dépendre = augmenter ensemble (M1) ;
 *   — lire un tableau en ligne au lieu d'une colonne (M3) ;
 *   — appliquer un programme de calcul dans le désordre (M3) ;
 *   — inverser abscisse et ordonnée en plaçant un point (M4) ;
 *   — croire qu'une sortie ne correspond qu'à une seule entrée (M5).
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 6 LPs sont tous couverts.
 *
 * `badges[].test` est une FONCTION (m) => bool.
 */
const SKILLS = {
  dependance: { label: 'La dépendance', emoji: '🔗', module: 1 },
  phrase: { label: '« en fonction de »', emoji: '💬', module: 2 },
  tableau: { label: 'Le tableau', emoji: '📋', module: 3 },
  programme: { label: 'Le programme', emoji: '⚙️', module: 3 },
  points: { label: 'Les points', emoji: '📍', module: 4 },
  graphique: { label: 'Lire le graphique', emoji: '📈', module: 5 },
};

const BADGES = [
  { id: 'b-dependance', emoji: '🔗', label: 'Détecteur de dépendance', test: (m) => !m.dependance },
  { id: 'b-phrase', emoji: '💬', label: 'Phrase juste', test: (m) => !m.phrase },
  { id: 'b-tableau', emoji: '📋', label: 'Lecteur de tableau', test: (m) => !m.tableau },
  { id: 'b-points', emoji: '📍', label: 'Placeur de points', test: (m) => !m.points },
  { id: 'b-graphique', emoji: '📈', label: 'Œil du graphique', test: (m) => !m.graphique },
  { id: 'b-parfait', emoji: '💎', label: 'Tout dépend de toi', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'fonc5-e1',
    skill: 'dependance',
    title: 'La bibliothèque',
    prompt:
      'À la bibliothèque, le nombre de pages qu’il te reste à lire diminue à mesure que tu lis. Cette quantité dépend-elle du nombre de pages déjà lues ?',
    options: [
      'Oui : à chaque nombre de pages lues correspond un reste bien précis',
      'Non : pour dépendre, elle devrait augmenter elle aussi',
      'Non : ce sont deux grandeurs indépendantes',
      'On ne peut pas savoir',
    ],
    cols: 1,
    requires: ['dependance'],
    explain:
      'Dépendre, c’est être déterminé par l’autre grandeur, peu importe le sens. Comme la masse du pain qui diminuait en cuisant, le reste à lire dépend bien de ce qui est déjà lu.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_fonctions-5e_P1'] },
  },
  {
    id: 'fonc5-e2',
    skill: 'dependance',
    title: 'La bougie',
    prompt:
      'Une bougie se consume : sa hauteur diminue avec le temps. Quelle grandeur commande l’autre ?',
    options: [
      'Le temps écoulé',
      'La hauteur de la bougie',
      'Aucune des deux',
      'Les deux à la fois',
    ],
    cols: 2,
    requires: ['dependance', 'en-fonction-de'],
    explain:
      'Le temps passe tout seul, et la bougie raccourcit en conséquence. On ne peut pas régler la hauteur pour faire avancer l’heure.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_fonctions-5e_P1'] },
  },
  {
    id: 'fonc5-e3',
    skill: 'phrase',
    title: 'La bonne phrase',
    prompt:
      'Le temps de trajet à vélo dépend de la distance parcourue. Comment le dit-on correctement ?',
    options: [
      'Le temps de trajet en fonction de la distance',
      'La distance en fonction du temps de trajet',
      'Le temps de trajet et la distance',
      'La distance en fonction de la vitesse',
    ],
    cols: 1,
    requires: ['en-fonction-de'],
    explain:
      'Ce qui dépend se dit en premier, ce qu’on choisit en second : « le temps de trajet en fonction de la distance ». Retourner la phrase inverserait le sens.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_fonctions-5e_P2'] },
  },
  {
    id: 'fonc5-e4',
    skill: 'phrase',
    title: 'La piscine municipale',
    prompt:
      'On remplit une piscine avec un tuyau. On dit : « le volume d’eau en fonction de la durée de remplissage ». Quelle grandeur règle-t-on ?',
    options: [
      'La durée de remplissage',
      'Le volume d’eau',
      'La taille de la piscine',
      'Le débit du tuyau',
    ],
    cols: 2,
    requires: ['en-fonction-de'],
    explain:
      'Dans cette phrase, la grandeur qui suit « en fonction de » est celle qu’on règle : la durée. Le volume, lui, en découle.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_fonctions-5e_P2'] },
  },
  {
    id: 'fonc5-e5',
    skill: 'tableau',
    title: 'Le relevé de pluie',
    prompt:
      'Un tableau donne la pluie tombée : 1 h → 4 mm, 2 h → 7 mm, 3 h → 9 mm, 4 h → 10 mm. Combien de pluie après 3 heures ?',
    options: ['9 mm', '3 mm', '7 mm', '10 mm'],
    cols: 4,
    requires: ['tableau-de-valeurs'],
    explain:
      'On cherche 3 sur la ligne des heures, et on lit dans la même colonne : 9 mm. Un tableau de valeurs se lit toujours par colonne.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_fonctions-5e_P4'] },
  },
  {
    id: 'fonc5-e6',
    skill: 'tableau',
    title: 'Ce que dit une colonne',
    prompt:
      'Dans ce même relevé, que signifie la colonne « 2 h / 7 mm » ?',
    options: [
      'Après 2 heures, il était tombé 7 mm de pluie',
      'Après 7 heures, il était tombé 2 mm de pluie',
      'Il est tombé 7 mm entre la 2e et la 3e heure',
      'Il pleut 2 mm toutes les 7 heures',
    ],
    cols: 1,
    requires: ['tableau-de-valeurs', 'en-fonction-de'],
    explain:
      'La ligne du haut porte la grandeur d’entrée — les heures. La colonne se lit donc « à 2 heures correspond 7 mm ». Les deux lignes ne sont pas interchangeables.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_fonctions-5e_P4'] },
  },
  {
    id: 'fonc5-e7',
    skill: 'programme',
    title: 'Le programme de calcul',
    prompt:
      '« Choisis un nombre, multiplie-le par 4, puis retire 3. » Que donne le nombre 5 ?',
    options: ['17', '8', '23', '11'],
    cols: 4,
    requires: ['programme-de-calcul'],
    explain:
      '5 × 4 = 20, puis 20 − 3 = 17. (Répondre 8 reviendrait à retirer 3 d’abord, puis à multiplier — le programme dit l’inverse.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_fonctions-5e_P3'] },
  },
  {
    id: 'fonc5-e8',
    skill: 'programme',
    title: 'Remplir le tableau',
    prompt:
      'Avec le même programme (multiplier par 4, puis retirer 3), quelle colonne est correcte ?',
    options: ['0 → −3', '0 → 3', '0 → 0', '0 → 4'],
    cols: 4,
    requires: ['programme-de-calcul', 'tableau-de-valeurs'],
    explain:
      '0 × 4 = 0, puis 0 − 3 = −3. Le programme s’applique à tous les nombres, y compris à zéro.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_fonctions-5e_P3'] },
  },
  {
    id: 'fonc5-e9',
    skill: 'points',
    title: 'Placer le couple',
    prompt:
      'Sur un graphique donnant la hauteur d’une plante en fonction du nombre de semaines, où place-t-on la colonne (6 ; 15) ?',
    options: [
      '6 vers la droite, 15 vers le haut',
      '15 vers la droite, 6 vers le haut',
      '6 vers le haut, 15 vers la droite',
      'Peu importe l’ordre',
    ],
    cols: 1,
    requires: ['couple-point'],
    explain:
      'La grandeur d’entrée — les semaines — se lit sur l’axe horizontal : 6 vers la droite, puis 15 vers le haut pour la hauteur.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_fonctions-5e_P5'] },
  },
  {
    id: 'fonc5-e10',
    skill: 'graphique',
    title: 'La courbe du marathon',
    prompt:
      'Sur un graphique, la vitesse d’un coureur monte pendant la première heure, puis redescend. À combien de moments court-il exactement à 12 km/h ?',
    options: [
      'À deux moments : une fois en montant, une fois en redescendant',
      'À un seul moment',
      'Jamais',
      'Pendant toute la course',
    ],
    cols: 1,
    requires: ['plusieurs-instants', 'lire-graphique'],
    explain:
      'Comme la température de la salle, la courbe monte puis redescend : elle croise donc deux fois la même hauteur. Une entrée n’a qu’une sortie, mais une sortie peut venir de plusieurs entrées.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_fonctions-5e_P6', '5e_fonctions-5e_P5'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : la journée"
      moduleSubtitle="Dix épreuves pour dire, ranger et lire une dépendance"
      estimatedTime="6 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: 'Évaluation',
        title: 'Une journée entière de dépendances',
        tone: 'amber',
        body: (
          <p>
            Dix situations, toutes nouvelles. À chaque fois, les trois mêmes questions :{' '}
            <strong>qui commande</strong>, <strong>comment on le range</strong>, et{' '}
            <strong>ce que le dessin répond</strong>.
          </p>
        ),
      }}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître des dépendances',
        title: 'Mission accomplie',
        message:
          'Tu sais repérer la grandeur qui commande, la dire « en fonction de », la ranger dans un tableau, la transformer en points et lire le graphique pour répondre à une vraie question.',
        verbs: ['Repérer', 'Dire', 'Ranger', 'Lire'],
        masterBadgeLabel: 'Tout dépend de toi',
      }}
    />
  );
}
