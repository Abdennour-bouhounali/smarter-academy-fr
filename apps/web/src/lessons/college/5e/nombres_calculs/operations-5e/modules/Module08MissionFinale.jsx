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
 * TRANSFERT, pas répétition (§45) : aucune épreuve ne reprend les valeurs des
 * modules. Les contextes changent (recette, carburant, ruban, classe) et chaque
 * distracteur encode une erreur RÉELLEMENT rencontrée dans la leçon :
 *   — lire le calcul de gauche à droite (M1, M2) ;
 *   — croire qu'une parenthèse autour du produit change quelque chose (M1) ;
 *   — ne décaler la virgule que d'UN des deux nombres d'une division (M6) ;
 *   — croire que diviser rend toujours plus petit (M6) ;
 *   — confondre multiple et diviseur (M3) ;
 *   — accepter un résultat dont l'ordre de grandeur est absurde (M7).
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 7 LPs sont tous couverts.
 *
 * `badges[].test` est une FONCTION (m) => bool — un objet y provoquerait
 * « b.test is not a function » au montage (bug attrapé par la suite e2e).
 */
const SKILLS = {
  structure: { label: 'Lire la structure', emoji: '🧩', module: 2 },
  enchainer: { label: 'Enchaîner', emoji: '⛓️', module: 4 },
  malin: { label: 'Calcul malin', emoji: '💡', module: 5 },
  diviser: { label: 'Diviser', emoji: '➗', module: 6 },
  multiples: { label: 'Multiples et diviseurs', emoji: '▦', module: 3 },
  controle: { label: 'Contrôler', emoji: '🔎', module: 7 },
};

const BADGES = [
  { id: 'b-structure', emoji: '🧩', label: 'Lecteur de calculs', test: (m) => !m.structure },
  { id: 'b-enchainer', emoji: '⛓️', label: 'Maître de l’ordre', test: (m) => !m.enchainer },
  { id: 'b-diviser', emoji: '➗', label: 'Dompteur de virgules', test: (m) => !m.diviser },
  { id: 'b-multiples', emoji: '▦', label: 'Chasseur de diviseurs', test: (m) => !m.multiples },
  { id: 'b-controle', emoji: '🔎', label: 'Œil du contrôleur', test: (m) => !m.controle },
  { id: 'b-parfait', emoji: '💎', label: 'Calcul juste', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'op5-e1',
    skill: 'structure',
    title: 'La recette',
    prompt: 'Une recette demande 3 œufs, puis 4 pots de 2 œufs chacun. On écrit 3 + 4 × 2. Combien d’œufs en tout ?',
    options: ['11', '14', '9', '24'],
    cols: 4,
    requires: ['priorites', 'structure-calcul'],
    explain: 'Le produit 4 × 2 = 8 forme un bloc (les œufs des pots) ; on lui ajoute les 3 œufs : 11. Lire de gauche à droite donnerait 14, ce que la convention interdit.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_operations-5e_P4'] },
  },
  {
    id: 'op5-e2',
    skill: 'structure',
    title: 'La parenthèse utile',
    prompt: 'Laquelle de ces écritures ne donne PAS le même résultat que 6 + 5 × 2 ?',
    options: ['(6 + 5) × 2', '6 + (5 × 2)', '5 × 2 + 6', '6 + 10'],
    cols: 2,
    requires: ['parentheses', 'priorites'],
    explain: '6 + 5 × 2 = 16. Les trois dernières écritures valent aussi 16 : entourer le produit ne change rien, puisqu’il passait déjà en premier. Seule (6 + 5) × 2 = 22 change la structure.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_operations-5e_P4'] },
  },
  {
    id: 'op5-e3',
    skill: 'enchainer',
    title: 'Quatre opérations',
    prompt: 'Combien vaut 30 − 2 × 7 + 4 ?',
    options: ['20', '200', '12', '8'],
    cols: 4,
    requires: ['enchainement', 'priorites'],
    explain: 'Le produit d’abord : 2 × 7 = 14. Puis de gauche à droite : 30 − 14 = 16, et 16 + 4 = 20. (200 vient d’une lecture de gauche à droite : 28 × 7 = 196, puis + 4.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_operations-5e_P5'] },
  },
  {
    id: 'op5-e4',
    skill: 'enchainer',
    title: 'Avec une parenthèse',
    prompt: 'Combien vaut (15 − 3) ÷ 4 + 7 ?',
    options: ['10', '3', '15', '19'],
    cols: 4,
    requires: ['enchainement', 'parentheses', 'priorites'],
    explain: 'La parenthèse d’abord : 15 − 3 = 12. Puis la division : 12 ÷ 4 = 3. Enfin l’addition : 3 + 7 = 10. (Répondre 3 revient à oublier le + 7 ; répondre 15 revient à oublier la division.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_operations-5e_P5', '5e_operations-5e_P4'] },
  },
  {
    id: 'op5-e5',
    skill: 'malin',
    title: 'De tête',
    prompt: 'Sans poser l’opération : combien vaut 99 × 4 ?',
    options: ['396', '400', '364', '3 604'],
    cols: 4,
    requires: ['decouper-calcul'],
    explain: 'On découpe 99 en 100 − 1 : 100 × 4 = 400, puis on retire 1 × 4 = 4. Reste 396. Répondre 400 revient à oublier de retirer le paquet en trop.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_operations-5e_P2'] },
  },
  {
    id: 'op5-e6',
    skill: 'malin',
    title: 'Le bon regroupement',
    prompt: 'Pour calculer 2 × 43 × 50 de tête, quel regroupement est le plus commode ?',
    options: ['(2 × 50) × 43', '(2 × 43) × 50', '2 × (43 × 50)', 'Aucun : il faut poser l’opération'],
    cols: 2,
    requires: ['decouper-calcul'],
    explain: '2 × 50 = 100, et 100 × 43 = 4 300 se fait de tête. Les trois premiers regroupements donnent tous 4 300 — mais seul le premier fait apparaître un nombre rond.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_operations-5e_P1', '5e_operations-5e_P2'] },
  },
  {
    id: 'op5-e7',
    skill: 'diviser',
    title: 'Le plein d’essence',
    prompt: 'Un automobiliste paie 45 € pour du carburant à 1,5 € le litre. Combien de litres a-t-il pris ?',
    options: ['30 L', '3 L', '67,5 L', '300 L'],
    cols: 4,
    requires: ['diviser-decimal', 'quotient-invariant'],
    explain: '45 ÷ 1,5 : on multiplie les DEUX nombres par 10, ce qui donne 450 ÷ 15 = 30 litres. (67,5 correspond à une multiplication au lieu d’une division.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_operations-5e_P3'] },
  },
  {
    id: 'op5-e8',
    skill: 'diviser',
    title: 'Le ruban',
    prompt: 'Dans un ruban de 8 mètres, combien de morceaux de 0,25 m peut-on découper ?',
    options: ['32', '2', '4', '8'],
    cols: 4,
    requires: ['diviser-decimal', 'quotient-invariant'],
    explain: '8 ÷ 0,25 : on multiplie les deux nombres par 100, soit 800 ÷ 25 = 32. Diviser par un nombre plus petit que 1 donne bien un résultat PLUS GRAND que 8 : un quart de mètre tient quatre fois dans chaque mètre.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_operations-5e_P3'] },
  },
  {
    id: 'op5-e9',
    skill: 'multiples',
    title: 'Les rangées',
    prompt: 'Un jardinier veut planter 42 salades en rangées toutes complètes et de même longueur. Quelle longueur de rangée est IMPOSSIBLE ?',
    options: ['8', '7', '6', '14'],
    cols: 4,
    requires: ['multiple-diviseur', 'criteres-divisibilite'],
    explain: 'Il faut un diviseur de 42 : 1, 2, 3, 6, 7, 14, 21, 42. 8 n’en fait pas partie (42 ÷ 8 laisse un reste de 2), alors que 7, 6 et 14 conviennent.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_operations-5e_P6'] },
  },
  {
    id: 'op5-e10',
    skill: 'controle',
    title: 'La facture douteuse',
    prompt: 'Une facture indique : 24 cahiers à 1,90 € l’unité, total 456 €. Que penser de ce total ?',
    options: [
      'Il est faux : le total doit tourner autour de 45 €',
      'Il est juste : 24 × 1,90 fait bien 456',
      'Il est faux : le total doit tourner autour de 4,50 €',
      'Impossible à dire sans poser la multiplication',
    ],
    cols: 1,
    requires: ['ordre-de-grandeur', 'mem-controler'],
    explain: 'On estime : 24 × 1,90 est proche de 24 × 2 = 48. Le total exact vaut 45,60 €. Annoncer 456 € revient à décaler la virgule d’un rang — l’erreur la plus fréquente sur les décimaux.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_operations-5e_P7'] },
  },
];

export default function Module08MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le calcul juste"
      moduleSubtitle="Dix épreuves pour prouver que tu lis un calcul avant de le faire"
      estimatedTime="6 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Le calcul juste',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune, commence par la même
            question que depuis le début : <strong>quelle est la structure de ce calcul ?</strong>
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🧩', label: 'L’ordre', value: '( ) → × ÷ → + −' },
        { id: 'r2', emoji: '➗', label: 'Diviseur décimal', value: '× 10 des DEUX côtés' },
        { id: 'r3', emoji: '▦', label: 'Diviseur', value: 'la division tombe juste' },
        { id: 'r4', emoji: '🔎', label: 'Avant de croire', value: 'j’estime' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Calcul juste !',
        title: 'Mission accomplie',
        message: 'Tu sais lire la structure d’un calcul, l’enchaîner, le simplifier et le contrôler.',
        verbs: ['Lire', 'Enchaîner', 'Diviser', 'Contrôler'],
        masterBadgeLabel: 'Calcul juste',
      }}
    />
  );
}
