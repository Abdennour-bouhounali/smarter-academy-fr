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
 * modules (ni le programme « +3 ×2 » du module 1, ni la cagnotte du module 4,
 * ni la commande du club du module 6), et chaque distracteur encode une erreur
 * RÉELLEMENT rencontrée :
 *   — « beaucoup d'exemples finissent par prouver » (M1, M5) ;
 *   — « il faut plusieurs contre-exemples pour réfuter » (M5) ;
 *   — utiliser une donnée parce qu'elle est écrite (M2) ;
 *   — calculer sans borner (M3) ;
 *   — vérifier en refaisant la dernière ligne (M6) ;
 *   — refuser un résultat parce qu'il n'est pas rond (M6) ;
 *   — rendre un nombre nu au lieu d'une phrase (M6).
 *
 * `badges[].test` est une FONCTION `(misses) => bool`. Les 7 LPs sont couverts :
 *   P1 → e1, e10 · P2 → e2 · P3 → e3 · P4 → e4 · P5 → e5, e6 · P6 → e7, e8
 *   P7 → e9, e10
 */
const SKILLS = {
  lire: { label: 'Lire et représenter', module: 2, emoji: '📄' },
  estimer: { label: 'Estimer avant de calculer', module: 3, emoji: '📏' },
  conjecturer: { label: 'Conjecturer et réfuter', module: 5, emoji: '🔎' },
  prouver: { label: 'Prouver par la lettre', module: 1, emoji: '🔤' },
  conclure: { label: 'Vérifier et répondre', module: 6, emoji: '✅' },
};

const BADGES = [
  { id: 'b-li', emoji: '📄', label: 'Lecteur d’énoncé', test: (m) => !m.lire },
  { id: 'b-es', emoji: '📏', label: 'Bon estimateur', test: (m) => !m.estimer },
  { id: 'b-co', emoji: '🔎', label: 'Chasseur de contre-exemples', test: (m) => !m.conjecturer },
  { id: 'b-pr', emoji: '🔤', label: 'Démonstrateur', test: (m) => !m.prouver },
  { id: 'b-cl', emoji: '✅', label: 'Enquête bouclée', test: (m) => !m.conclure },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du raisonnement', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'rp4-e1',
    skill: 'lire',
    title: 'La donnée en trop',
    prompt: 'Un train de 8 wagons transporte 320 passagers. Le trajet dure 2 h et le billet coûte 19 €. Quelle donnée est INUTILE pour calculer le nombre moyen de passagers par wagon ?',
    options: ['Le prix du billet', 'Le nombre de wagons', 'Le nombre de passagers', 'Aucune : toutes servent'],
    correct: 0,
    cols: 2,
    requires: ['donnees-utiles'],
    explain: 'La question ne porte que sur des passagers et des wagons : 320 ÷ 8. Le prix du billet et la durée sont écrits, mais les enlever ne change rien à la réponse.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_raisonnement-problemes-4e_P1'] },
  },
  {
    id: 'rp4-e2',
    skill: 'lire',
    title: 'Le bon schéma',
    prompt: 'Théo a 3 fois plus de billes que Nina, et ils en ont 48 à eux deux. Quel schéma en barres traduit la situation ?',
    options: [
      'Une barre pour Nina, une barre 3 fois plus longue pour Théo, les deux réunies valant 48',
      'Deux barres de même longueur, valant 48 chacune',
      'Une barre de 48 coupée en 3 parts égales',
      'Une barre de 48 et une barre de 3',
    ],
    correct: 0,
    cols: 1,
    requires: ['representer'],
    explain: '« 3 fois plus » se dessine en longueurs : la barre de Théo vaut 3 barres de Nina. Les deux réunies font donc 4 barres de Nina, qui valent 48 — ce qui donne aussitôt 12 pour Nina.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_raisonnement-problemes-4e_P2'] },
  },
  {
    id: 'rp4-e3',
    skill: 'estimer',
    title: 'L’ordre de grandeur',
    prompt: 'Un rouleau de 45 m de tissu sert à faire des nappes de 2,20 m. Sans calculer précisément, combien de nappes environ ?',
    options: ['Une vingtaine', 'Une centaine', 'Environ 5', 'Environ 90'],
    correct: 0,
    cols: 2,
    requires: ['estimer-avant'],
    explain: '2,20 m est proche de 2 m, et 45 ÷ 2 fait environ 22. Une vingtaine est le seul ordre de grandeur compatible. (90 viendrait d’une multiplication au lieu d’une division.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_raisonnement-problemes-4e_P3'] },
  },
  {
    id: 'rp4-e4',
    skill: 'conjecturer',
    title: 'Ce qu’on peut dire',
    prompt: 'Marc essaie 12 nombres et l’affirmation tient à chaque fois. Que peut-il écrire, exactement ?',
    options: [
      'Il conjecture que l’affirmation est vraie, sans l’avoir démontrée',
      'Il a démontré l’affirmation : 12 essais, c’est suffisant',
      'Il ne peut rien écrire du tout',
      'L’affirmation est fausse, puisqu’il n’a pas tout essayé',
    ],
    correct: 0,
    cols: 1,
    requires: ['conjecture', 'essais-ne-prouvent-pas'],
    explain: 'Douze essais réussis font naître une conjecture, et rien de plus. Ils ne démontrent pas — mais ils n’invalident pas non plus : ils laissent la question ouverte.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_raisonnement-problemes-4e_P4'] },
  },
  {
    id: 'rp4-e5',
    skill: 'conjecturer',
    title: 'Combien en faut-il ?',
    prompt: 'Pour montrer qu’une affirmation du type « pour tout nombre… » est FAUSSE, que faut-il produire ?',
    options: [
      'Un seul contre-exemple, vérifié',
      'Au moins deux contre-exemples',
      'Autant de contre-exemples que d’exemples qui marchent',
      'Une démonstration menée avec une lettre',
    ],
    correct: 0,
    cols: 2,
    requires: ['contre-exemple'],
    explain: '« Pour tout » exige tous les cas : un seul cas contraire suffit à faire tomber l’affirmation, et il n’en faut pas un second. La lettre, elle, sert à PROUVER — pas à réfuter.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_raisonnement-problemes-4e_P5'] },
  },
  {
    id: 'rp4-e6',
    skill: 'conjecturer',
    title: 'Trouver la faille',
    prompt: 'Affirmation : « le double d’un nombre est toujours plus grand que ce nombre ». Quel nombre la réfute ?',
    options: ['−5', '7', '0,5', 'Aucun : elle est vraie'],
    correct: 0,
    cols: 4,
    requires: ['contre-exemple'],
    explain: 'Le double de −5 vaut −10, qui est PLUS PETIT que −5. Les négatifs sont exactement les cas qu’on n’essaie jamais spontanément — et c’est souvent là que se cache le contre-exemple.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_raisonnement-problemes-4e_P5'] },
  },
  {
    id: 'rp4-e7',
    skill: 'prouver',
    title: 'La lettre qui démontre',
    prompt: 'Programme : « choisis un nombre, multiplie par 5, ajoute 10, divise par 5, retire le nombre de départ ». En appelant n le nombre choisi, que vaut le résultat ?',
    options: ['2, quel que soit n', 'n + 2', '10', 'Cela dépend de n'],
    correct: 0,
    cols: 2,
    requires: ['preuve-par-la-lettre', 'distributivite-simple'],
    explain: 'Avec la lettre : 5n, puis 5n + 10, puis (5n + 10) ÷ 5 = n + 2, puis n + 2 − n = 2. Le n disparaît, donc le résultat vaut 2 pour tous les nombres à la fois.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_raisonnement-problemes-4e_P6'] },
  },
  {
    id: 'rp4-e8',
    skill: 'prouver',
    title: 'Pourquoi la lettre suffit',
    prompt: 'Pourquoi un calcul mené avec la lettre n vaut-il preuve, alors que cent essais ne valent rien ?',
    options: [
      'Parce que n représente n’importe quel nombre : le calcul les traite tous à la fois',
      'Parce qu’une lettre est plus rigoureuse qu’un nombre',
      'Parce que les lettres évitent les erreurs de calcul',
      'Parce que n vaut une valeur particulière bien choisie',
    ],
    correct: 0,
    cols: 1,
    requires: ['preuve-par-la-lettre'],
    explain: 'La lettre n’est pas plus rigoureuse : elle est plus GÉNÉRALE. Comme aucune valeur particulière n’a été supposée pour n, la conclusion vaut pour toutes — et c’est ce qu’aucun essai ne peut donner.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_raisonnement-problemes-4e_P6'] },
  },
  {
    id: 'rp4-e9',
    skill: 'conclure',
    title: 'La bonne vérification',
    prompt: 'On a trouvé 8,50 € pour le prix d’un carnet. Quelle vérification est la plus utile ?',
    options: [
      'Remettre 8,50 € dans l’énoncé et voir si le total annoncé retombe',
      'Refaire la dernière division, plus lentement',
      'Arrondir à 8 €, parce qu’un prix devrait tomber juste',
      'Comparer avec le prix d’un carnet en magasin',
    ],
    correct: 0,
    cols: 1,
    requires: ['verifier-dans-l-histoire'],
    explain: 'Refaire le dernier calcul reproduit l’erreur à l’identique. Seul le retour à l’énoncé peut la détecter. Et 8,50 € est un prix parfaitement ordinaire : rien n’oblige un résultat à tomber rond.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_raisonnement-problemes-4e_P7'] },
  },
  {
    id: 'rp4-e10',
    skill: 'conclure',
    title: 'Répondre pour de bon',
    prompt: 'Question : « Combien de cartons faut-il pour ranger 130 livres, à 12 livres par carton ? » Le calcul donne 10,83. Quelle réponse est correcte ?',
    options: [
      'Il faut 11 cartons : 10 ne suffiraient pas',
      'Il faut 10,83 cartons',
      'Il faut 10 cartons',
      '10,83',
    ],
    correct: 0,
    cols: 2,
    requires: ['phrase-reponse', 'controler-le-sens'],
    explain: 'Un carton ne se coupe pas : le résultat doit être un entier, et 10 cartons laisseraient des livres dehors. La réponse est une phrase qui dit de quoi on parle, quelle valeur, et pourquoi il faut passer à l’entier au-dessus.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_raisonnement-problemes-4e_P7', '4e_raisonnement-problemes-4e_P1'] },
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
      estimatedTime="9 min"
      lessonConfig={LESSON_CONFIG}
      brief={{
        tag: '🏆 Mission finale',
        title: 'Le dossier',
        tone: 'amber',
        body: (
          <>
            Dix situations où il faut raisonner avant de calculer. Réponds à tout, puis
            soumets : aucune correction avant la fin.
          </>
        ),
      }}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'Raisonnement maîtrisé',
        title: 'Mission accomplie',
        message: 'Tu sais lire un énoncé, écarter ce qui ne sert pas, borner une réponse avant de la calculer, réfuter d’un seul contre-exemple, démontrer par la lettre, et finir par une phrase qui répond vraiment.',
        verbs: ['Comprendre', 'Représenter', 'Conjecturer', 'Prouver'],
        masterBadgeLabel: 'Maître du raisonnement',
      }}
    />
  );
}
