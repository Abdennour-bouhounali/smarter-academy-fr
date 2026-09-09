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
 * TRANSFERT, pas répétition (§45) : ni le dé à 6 faces des modules, ni le sac
 * 3/2/1. Les dispositifs changent (roue, jetons, cartes, tombola, dé à 8
 * faces, sac d'un autre contenu) et chaque distracteur encode une erreur
 * RÉELLEMENT rencontrée dans la leçon :
 *   — prendre une description pour une issue (M2) ;
 *   — compter les catégories au lieu des objets (M2, M4) ;
 *   — appliquer le quotient sans équiprobabilité (M4, M6) ;
 *   — « deux issues donc une chance sur deux » (M4) ;
 *   — confondre improbable et impossible (M7) ;
 *   — croire qu'un résultat est « dû » après une série (M1) ;
 *   — oublier une face à la frontière d'un événement (M3).
 *
 * PÉRIMÈTRE 5e : une seule épreuve par expérience, aucune probabilité
 * conditionnelle, aucun arbre. Les objets `assessment` sont écrits en toutes
 * lettres : un helper les rendrait invisibles au validateur. Les 6 LPs sont
 * tous couverts.
 *
 * `badges[].test` est une FONCTION (m) => bool.
 */
const SKILLS = {
  aleatoire: { label: 'Reconnaître le hasard', emoji: '🎲', module: 1 },
  issues: { label: 'Lister les issues', emoji: '📋', module: 2 },
  evenement: { label: 'Décrire un événement', emoji: '🎯', module: 3 },
  equiprobable: { label: 'Vérifier l’égalité', emoji: '⚖️', module: 4 },
  calculer: { label: 'Calculer', emoji: '🧮', module: 6 },
  echelle: { label: 'Situer sur l’échelle', emoji: '📏', module: 7 },
};

const BADGES = [
  { id: 'b-aleatoire', emoji: '🎲', label: 'Lecteur du hasard', test: (m) => !m.aleatoire },
  { id: 'b-issues', emoji: '📋', label: 'Énumérateur complet', test: (m) => !m.issues },
  { id: 'b-evenement', emoji: '🎯', label: 'Traducteur d’événements', test: (m) => !m.evenement },
  { id: 'b-equiprobable', emoji: '⚖️', label: 'Détecteur de triche', test: (m) => !m.equiprobable },
  { id: 'b-calculer', emoji: '🧮', label: 'Calculateur de chances', test: (m) => !m.calculer },
  { id: 'b-echelle', emoji: '📏', label: 'Arpenteur de l’échelle', test: (m) => !m.echelle },
  { id: 'b-parfait', emoji: '💎', label: 'Pari éclairé', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'prob5-e1',
    skill: 'aleatoire',
    title: 'Aléatoire ou pas ?',
    prompt: 'Laquelle de ces situations est une expérience aléatoire ?',
    options: [
      'Tirer un ticket au hasard dans une urne de tombola',
      'Compter les élèves présents dans la classe',
      'Mesurer la hauteur d’une table',
      'Calculer 12 × 4',
    ],
    cols: 1,
    requires: ['experience-aleatoire'],
    explain: 'Une expérience est aléatoire si, refaite à l’identique, elle peut donner un autre résultat. Compter, mesurer et calculer donnent toujours la même réponse ; le tirage d’un ticket, non.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_probabilites-5e_P1'] },
  },
  {
    id: 'prob5-e2',
    skill: 'aleatoire',
    title: 'La pièce en série',
    prompt: 'Une pièce équilibrée est tombée cinq fois de suite sur Pile. Quelle est la chance d’obtenir Pile au sixième lancer ?',
    options: [
      'Une chance sur deux, comme à chaque lancer',
      'Plus faible : Face est en retard',
      'Plus forte : la pièce est lancée du même côté',
      'Nulle : après cinq Piles, la pièce ne peut plus en donner',
    ],
    cols: 1,
    requires: ['experience-aleatoire', 'equiprobabilite'],
    explain: 'La pièce n’a pas de mémoire. Chaque lancer est indépendant des précédents : Pile garde sa chance sur deux, même après cinq Piles d’affilée.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_probabilites-5e_P1', '5e_probabilites-5e_P4'] },
  },
  {
    id: 'prob5-e3',
    skill: 'issues',
    title: 'Le dé à 8 faces',
    prompt: 'Un dé de jeu de rôle porte 8 faces numérotées de 1 à 8. Combien d’issues a un lancer ?',
    options: ['8', '2', '16', '6'],
    cols: 4,
    requires: ['issue'],
    explain: 'Une issue par face : 8 résultats possibles, de 1 à 8. Le nombre d’issues est toujours le nombre de résultats différents que l’expérience peut donner.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_probabilites-5e_P2'] },
  },
  {
    id: 'prob5-e4',
    skill: 'issues',
    title: 'Ce qui n’est pas une issue',
    prompt: 'On tire une carte dans un jeu de 32 cartes. Laquelle de ces propositions n’est PAS une issue ?',
    options: [
      '« Tirer un cœur »',
      '« Tirer le roi de pique »',
      '« Tirer le 7 de trèfle »',
      '« Tirer l’as de carreau »',
    ],
    cols: 1,
    requires: ['issue', 'evenement'],
    explain: '« Tirer un cœur » regroupe 8 cartes : c’est un événement, pas une issue. Une issue désigne une carte précise et une seule.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_probabilites-5e_P2', '5e_probabilites-5e_P3'] },
  },
  {
    id: 'prob5-e5',
    skill: 'evenement',
    title: 'Les jetons',
    prompt: 'Un sac contient 12 jetons numérotés de 1 à 12. Quelles issues réalisent l’événement « obtenir un multiple de 5 » ?',
    options: ['5 et 10', '5 seulement', '1, 5 et 10', '5, 10 et 15'],
    cols: 2,
    requires: ['evenement', 'issue'],
    explain: 'Parmi 1 à 12, les multiples de 5 sont 5 et 10. Le 15 n’est pas dans le sac, et 1 n’est pas un multiple de 5.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_probabilites-5e_P3'] },
  },
  {
    id: 'prob5-e6',
    skill: 'equiprobable',
    title: 'La roue de la fête',
    prompt: 'Une roue est partagée en 4 secteurs : un très grand, deux moyens et un minuscule. Les quatre secteurs sont-ils équiprobables ?',
    options: [
      'Non : l’aiguille s’arrête plus souvent sur les grands secteurs',
      'Oui : il y a quatre secteurs, donc une chance sur quatre',
      'Oui : la roue tourne au hasard',
      'On ne peut pas savoir sans la faire tourner',
    ],
    cols: 1,
    requires: ['equiprobabilite'],
    explain: 'L’équiprobabilité exige que rien ne favorise une issue. Ici la taille des secteurs les distingue : le grand a bien plus de chances que le minuscule. Le hasard du lancer n’y change rien.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_probabilites-5e_P4'] },
  },
  {
    id: 'prob5-e7',
    skill: 'equiprobable',
    title: 'Le sac de bonbons',
    prompt: 'Un sac contient 5 bonbons à la fraise et 3 au citron, tous de même forme. Quelle est la probabilité de tirer un bonbon au citron ?',
    options: ['3/8', '1/2', '3/5', '1/3'],
    cols: 4,
    requires: ['equiprobabilite', 'mem-probabilite'],
    explain: 'Les 8 bonbons sont équiprobables : 3 favorables (citron) sur 8 possibles, donc 3/8. Compter les DEUX parfums donnerait 1/2, ce qui serait faux — les parfums ne sont pas également représentés.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_probabilites-5e_P5', '5e_probabilites-5e_P4'] },
  },
  {
    id: 'prob5-e8',
    skill: 'calculer',
    title: 'Le dé à 8 faces, encore',
    prompt: 'Avec le dé à 8 faces numérotées de 1 à 8, quelle est la probabilité d’obtenir un nombre pair ?',
    options: ['4/8', '1/8', '2/8', '8/8'],
    cols: 4,
    requires: ['mem-probabilite', 'evenement'],
    explain: 'Les faces paires sont 2, 4, 6 et 8 : 4 favorables sur 8 possibles, soit 4/8, c’est-à-dire une chance sur deux.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_probabilites-5e_P5', '5e_probabilites-5e_P3'] },
  },
  {
    id: 'prob5-e9',
    skill: 'echelle',
    title: 'Le billet de tombola',
    prompt: 'Sur 500 billets vendus, un seul est gagnant. Tu en as acheté un. Que peut-on dire de ta chance de gagner ?',
    options: [
      'Elle vaut 1/500 : très faible, mais pas nulle',
      'Elle est nulle : c’est impossible',
      'Elle vaut 1/2 : soit je gagne, soit je perds',
      'Elle vaut 500',
    ],
    cols: 1,
    requires: ['echelle-probabilite', 'mem-probabilite'],
    explain: '1 billet favorable sur 500 : la probabilité est 1/500 = 0,002. C’est proche de zéro sans l’atteindre — improbable ne veut jamais dire impossible. Et une probabilité ne dépasse jamais 1.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_probabilites-5e_P6', '5e_probabilites-5e_P5'] },
  },
  {
    id: 'prob5-e10',
    skill: 'echelle',
    title: 'Certain ou impossible',
    prompt: 'Dans un sac de 20 jetons numérotés de 1 à 20, quel événement a une probabilité égale à 1 ?',
    options: [
      '« Tirer un jeton inférieur à 21 »',
      '« Tirer le jeton 20 »',
      '« Tirer un jeton pair »',
      '« Tirer le jeton 25 »',
    ],
    cols: 1,
    requires: ['echelle-probabilite', 'mem-echelle'],
    explain: 'Les 20 jetons sont tous inférieurs à 21 : l’événement est réalisé par toutes les issues, donc 20/20 = 1, il est certain. « Tirer le jeton 25 » vaut 0 : aucune issue ne le réalise.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_probabilites-5e_P6'] },
  },
];

export default function Module08MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      lessonConfig={LESSON_CONFIG}
      moduleNumber={8}
      moduleTitle="Mission finale : le pari éclairé"
      moduleSubtitle="Dix épreuves pour mesurer une chance au lieu de la deviner"
      estimatedTime="6 min"
      brief={{
        tag: 'Évaluation',
        title: 'Mesure, ne devine pas',
        tone: 'amber',
        body: (
          <p>
            Dix dispositifs nouveaux — roue, jetons, cartes, tombola, dé à huit faces. Aucun ne
            reprend le dé ni le sac des modules : il s’agit de{' '}
            <strong>transférer</strong> ta méthode. Les réponses ne s’affichent qu’à la fin.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '📋', label: 'Issues', value: 'tout, sans doublon' },
        { id: 'r2', emoji: '🎯', label: 'Événement', value: 'les issues qui le réalisent' },
        { id: 'r3', emoji: '⚖️', label: 'Condition', value: 'issues équiprobables' },
        { id: 'r4', emoji: '🧮', label: 'Probabilité', value: 'favorables ÷ possibles' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Pari éclairé !',
        title: 'Mission accomplie',
        message: 'Tu sais reconnaître une expérience aléatoire, lister ses issues, décrire un événement, vérifier l’équiprobabilité et calculer une probabilité.',
        verbs: ['Lister', 'Décrire', 'Vérifier', 'Calculer'],
        masterBadgeLabel: 'Pari éclairé',
      }}
    />
  );
}
