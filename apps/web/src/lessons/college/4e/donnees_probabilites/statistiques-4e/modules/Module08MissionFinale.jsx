import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 8 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Le test CONSOLIDE :
 * il n'introduit ni concept, ni vocabulaire, ni notation neufs
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *
 * TRANSFERT, pas répétition : aucune épreuve ne reprend les valeurs des
 * modules (ni les douze trajets, ni le bulletin de Naïm, ni les deux villes),
 * et chaque distracteur encode une erreur RÉELLEMENT rencontrée :
 *   — diviser par le nombre de LIGNES au lieu de l'effectif (M2) ;
 *   — oublier les coefficients (M2) ;
 *   — chercher la médiane dans la liste sur un effectif pair (M3) ;
 *   — oublier de RANGER la série avant de prendre la valeur du milieu (M3) ;
 *   — confondre l'étendue et la valeur maximale (M4) ;
 *   — « même moyenne, donc même chose » (M5) ;
 *   — « la médiane est le meilleur indicateur » (M6) ;
 *   — lire un diagramme sans regarder l'axe (M7).
 *
 * La bonne réponse est déclarée par `correct` et sa POSITION VARIE.
 * `badges[].test` est une FONCTION `(misses) => bool`.
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 6 LPs sont tous couverts, chacun par
 * au moins une épreuve.
 *
 * PÉRIMÈTRE : aucune épreuve ne mentionne quartile, boîte à moustaches ni
 * écart type — ce sont des objets de 3e puis de 2nde.
 */
const SKILLS = {
  ponderee: { label: 'Moyenne pondérée', module: 2, emoji: '⚖️' },
  mediane: { label: 'Médiane', module: 3, emoji: '✂️' },
  etendue: { label: 'Étendue', module: 4, emoji: '📏' },
  choisir: { label: 'Choisir et comparer', module: 6, emoji: '🔍' },
};

const BADGES = [
  { id: 'b-pond', emoji: '⚖️', label: 'Coefficients maîtrisés', test: (m) => !m.ponderee },
  { id: 'b-med', emoji: '✂️', label: 'Coupe nette', test: (m) => !m.mediane },
  { id: 'b-et', emoji: '📏', label: 'Œil sur les bouts', test: (m) => !m.etendue },
  { id: 'b-choix', emoji: '🔍', label: 'Bon résumé, bonne question', test: (m) => !m.choisir },
  { id: 'b-parfait', emoji: '💎', label: 'Maître des statistiques', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'st4-e1',
    skill: 'ponderee',
    title: 'Le bulletin de physique',
    prompt: 'Trois notes : 8 (coefficient 1), 12 (coefficient 1) et 15 (coefficient 2). Quelle est la moyenne ?',
    options: ['11,67', '12,5', '35', '13,5'],
    correct: 1,
    cols: 4,
    requires: ['moyenne-ponderee'],
    explain: '(1×8 + 1×12 + 2×15) ÷ (1 + 1 + 2) = 50 ÷ 4 = 12,5. (11,67 viendrait de diviser par 3, le nombre de LIGNES, au lieu de 4, la somme des coefficients.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_statistiques-4e_P1'] },
  },
  {
    id: 'st4-e2',
    skill: 'ponderee',
    title: 'Le tableau d’effectifs',
    prompt: 'On demande à 20 élèves combien de livres ils ont lus cet été. 0 livre → 6 élèves, 1 livre → 8 élèves, 2 livres → 4 élèves, 5 livres → 2 élèves. Quelle est la moyenne de livres lus par élève ?',
    options: ['2', '6,5', '1,3', '0,4'],
    correct: 2,
    cols: 4,
    requires: ['moyenne-ponderee', 'tableau-effectifs'],
    explain: '(6×0 + 8×1 + 4×2 + 2×5) ÷ 20 = 26 ÷ 20 = 1,3 livre. (2 viendrait d’additionner les quatre valeurs 0 + 1 + 2 + 5 et de diviser par 4, les LIGNES du tableau ; 6,5 de diviser la bonne somme 26 par ces mêmes 4 lignes au lieu des 20 élèves.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_statistiques-4e_P1'] },
  },
  {
    id: 'st4-e3',
    skill: 'mediane',
    title: 'Effectif impair',
    prompt: 'Sept mesures, déjà rangées : 3 · 5 · 5 · 8 · 11 · 12 · 20. Quelle est leur médiane ?',
    options: ['8', '9,14', '5', '11'],
    correct: 0,
    cols: 4,
    requires: ['mediane-stat'],
    explain: 'Sept valeurs : la quatrième est au milieu, avec trois valeurs de chaque côté. C’est 8. (9,14 est la moyenne, pas la médiane.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_statistiques-4e_P2'] },
  },
  {
    id: 'st4-e4',
    skill: 'mediane',
    title: 'Effectif pair, série en désordre',
    prompt: 'Six temps de course, en secondes : 14 · 9 · 12 · 20 · 11 · 15. Quelle est leur médiane ?',
    options: ['12 s', '13,5 s', '13 s', '16 s'],
    correct: 2,
    cols: 4,
    requires: ['mediane-stat'],
    explain: 'Il faut d’abord RANGER : 9 · 11 · 12 · 14 · 15 · 20. Six valeurs, donc deux au milieu : 12 et 14. La médiane est (12 + 14) ÷ 2 = 13 s — un temps que personne n’a réalisé. (16 s vient de prendre les deux valeurs du milieu SANS ranger, 12 et 20 ; 13,5 s est la moyenne, pas la médiane ; 12 s est la troisième valeur rangée, pas le milieu de six.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_statistiques-4e_P2'] },
  },
  {
    id: 'st4-e5',
    skill: 'mediane',
    title: 'Ce que la médiane autorise à dire',
    prompt: 'Le loyer médian d’un quartier est de 700 €. Quelle affirmation est certaine ?',
    options: [
      'La moitié des loyers sont inférieurs à 700 €',
      'La plupart des loyers valent 700 €',
      'Le loyer le plus fréquent est 700 €',
      'Aucun loyer ne dépasse 700 €',
    ],
    correct: 0,
    cols: 1,
    requires: ['mediane-partage'],
    explain: 'La médiane partage le groupe en deux moitiés de même taille : la moitié des loyers sont en dessous, l’autre au-dessus. Elle ne dit rien de ce qui est « fréquent », et rien sur un logement en particulier.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_statistiques-4e_P3'] },
  },
  {
    id: 'st4-e6',
    skill: 'etendue',
    title: 'Le relevé de tailles',
    prompt: 'Tailles d’une équipe, en cm : 162 · 171 · 168 · 185 · 174. Quelle est l’étendue ?',
    options: ['185 cm', '23 cm', '174 cm', '172 cm'],
    correct: 1,
    cols: 4,
    requires: ['etendue'],
    explain: '185 − 162 = 23 cm. (185 cm est la plus GRANDE valeur, une position ; l’étendue est une longueur, la distance entre les deux bouts.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_statistiques-4e_P4'] },
  },
  {
    id: 'st4-e7',
    skill: 'etendue',
    title: 'Ce que l’étendue ignore',
    prompt: 'Dans une série, on remplace une valeur du milieu par une autre valeur du milieu. Que devient l’étendue ?',
    options: [
      'Elle augmente',
      'Elle diminue',
      'Elle ne change pas',
      'Cela dépend de la moyenne',
    ],
    correct: 2,
    cols: 4,
    requires: ['etendue'],
    explain: 'L’étendue ne regarde que la plus petite et la plus grande valeur. Tant qu’on ne touche à aucun des deux bouts, elle reste identique — même si toutes les autres valeurs changent.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_statistiques-4e_P4'] },
  },
  {
    id: 'st4-e8',
    skill: 'choisir',
    title: 'Moyenne contre médiane',
    prompt: 'Dans un club, les cotisations sont : 40 € · 45 € · 45 € · 50 € · 500 €. Quel résumé décrit le mieux ce que paie un membre ordinaire ?',
    options: [
      'La moyenne, 136 €',
      'La médiane, 45 €',
      'L’étendue, 460 €',
      'Les trois disent la même chose',
    ],
    correct: 1,
    cols: 1,
    requires: ['choisir-indicateur', 'mediane-partage'],
    explain: 'Une seule cotisation très à part tire la moyenne à 136 €, alors que quatre membres sur cinq paient 50 € ou moins. La médiane, 45 €, n’est pas déplacée par cette valeur extrême : c’est elle qui décrit le groupe.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_statistiques-4e_P5'] },
  },
  {
    id: 'st4-e9',
    skill: 'choisir',
    title: 'Deux ateliers',
    prompt: 'Deux ateliers de menuiserie ont la même moyenne de pièces produites par jour et la même médiane. Chez l’un, l’étendue vaut 4 ; chez l’autre, 60. Que peut-on en conclure ?',
    options: [
      'Le second est plus productif',
      'Le premier est plus régulier ; leur production totale est comparable',
      'Ils sont identiques, puisque moyenne et médiane coïncident',
      'On ne peut rien dire sans connaître les effectifs',
    ],
    correct: 1,
    cols: 1,
    requires: ['comparer-series', 'etendue', 'choisir-indicateur'],
    explain: 'Même moyenne et même médiane : au total et au milieu, les deux ateliers se valent. Ce que l’étendue ajoute est d’une autre nature — le premier produit presque la même chose chaque jour, le second alterne des journées très inégales.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_statistiques-4e_P6'] },
  },
  {
    id: 'st4-e10',
    skill: 'choisir',
    title: 'Le graphique du journal',
    prompt: 'Un graphique montre deux barres : celle de 2025 paraît trois fois plus haute que celle de 2024. En lisant les valeurs, on trouve 61 et 63. Comment l’expliquer ?',
    options: [
      'L’axe vertical ne démarre pas à zéro',
      'Les barres n’ont pas la même largeur',
      'Les valeurs affichées sont fausses',
      'Le graphique utilise une moyenne pondérée',
    ],
    correct: 0,
    cols: 1,
    requires: ['axe-tronque', 'diagramme-barres'],
    explain: '61 et 63 sont dans un rapport de 1,03 : elles ne peuvent pas donner une barre trois fois plus haute sur un axe partant de zéro. L’axe démarre donc plus haut — vers 60 — et l’œil compare 1 à 3 au lieu de 61 à 63.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_statistiques-4e_P6', '4e_statistiques-4e_P5'] },
  },
];

export default function Module08MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="🏆 Mission finale : l’observatoire"
      moduleSubtitle="Dix épreuves, une seule soumission"
      estimatedTime="9 min"
      lessonConfig={LESSON_CONFIG}
      brief={{
        tag: '🏆 Mission finale',
        title: 'L’observatoire',
        tone: 'amber',
        body: (
          <>
            Dix situations : des bulletins, des relevés, des cotisations et un graphique de
            journal. Réponds à tout, puis soumets : aucune correction avant la fin.
          </>
        ),
      }}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'Statistiques maîtrisées',
        title: 'Mission accomplie',
        message: 'Tu sais calculer une moyenne pondérée, une médiane et une étendue, et surtout choisir celui des trois qui répond à la question posée.',
        verbs: ['Pondérer', 'Partager', 'Mesurer l’écart', 'Comparer'],
        masterBadgeLabel: 'Maître des statistiques',
      }}
    />
  );
}
