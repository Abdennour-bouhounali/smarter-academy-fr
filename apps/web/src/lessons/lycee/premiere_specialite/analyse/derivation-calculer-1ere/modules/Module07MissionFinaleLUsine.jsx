import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION.
 *
 * CONNAISSANCES AVANT LA DEMANDE. La mission finale CONSOLIDE : elle
 * n'introduit rien de neuf — ni concept, ni vocabulaire, ni notation — et
 * chaque épreuve déclare les connaissances qu'elle exige, toutes posées par
 * une brique des modules 1 à 6.
 *
 * COUVERTURE. Chaque LP a au moins une épreuve qui lui est PROPRE, pour que le
 * profil de maîtrise soit interprétable :
 *   P1 dérivées usuelles ................ e1 (seule), e2
 *   P2 somme et produit par un réel ..... e3 (seule), e2, e10
 *   P3 produit .......................... e4 (seule), e5
 *   P4 quotient ......................... e6 (seule), e7
 *   P5 composée simple .................. e8 (seule), e9, e10
 *
 * DISTRACTEURS, tous vérifiés numériquement et DISTINCTS de la bonne réponse
 * (components/reglesUtils.test.js) : exposant non descendu (e1), constante
 * conservée (e3), u′v′ au lieu de u′v + uv′ (e4, e5), quotient des dérivées
 * (e6), termes du numérateur échangés (e7), facteur intérieur oublié (e8, e9),
 * règle du produit appliquée à un nombre qui multiplie (e10).
 */
const EPREUVES = [
  {
    id: 'dc-e1',
    requires: ['derivees-usuelles', 'mem-x-puissance-n'],
    skill: 'usuelles',
    title: 'Le dos d’une carte',
    prompt: 'Pour f(x) = x⁵, que vaut f′(2) ?',
    options: ['80', '32', '160', '20'],
    cols: 4,
    correct: 0,
    explain: 'f′(x) = 5x⁴, donc f′(2) = 5 × 16 = 80. Répondre 32, c’est donner f(2) = 2⁵, l’ordonnée du point — pas la pente.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-calculer-1ere_P1'] },
  },
  {
    id: 'dc-e2',
    requires: ['derivees-usuelles', 'regle-somme-et-reel'],
    skill: 'usuelles',
    title: 'Les cinq dos',
    prompt: 'Une seule de ces quatre égalités est FAUSSE. Laquelle ?',
    options: [
      'La pente de 1/x est 1/x²',
      'La pente de √x est 1/(2√x)',
      'La pente de x est 1',
      'La pente de 12 est 0',
    ],
    cols: 1,
    correct: 0,
    explain: 'La pente de 1/x vaut −1/x² : elle est NÉGATIVE, car la fonction descend. Les trois autres égalités sont justes.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-calculer-1ere_P1', 'premiere_specialite_derivation-calculer-1ere_P2'] },
  },
  {
    id: 'dc-e3',
    requires: ['regle-somme-et-reel', 'vocab-terme-coefficient'],
    skill: 'somme',
    title: 'Terme par terme',
    prompt: 'Pour f(x) = 4x³ − 2x + 9, quelle est l’expression de f′(x) ?',
    options: ['12x² − 2', '12x² − 2 + 9', '4x² − 2', '12x² − 2x'],
    cols: 2,
    correct: 0,
    explain: '4 × 3x² = 12x², puis −2 × 1 = −2, et le 9 s’efface : une valeur constante ne fait pas monter la courbe. Garder le +9 est l’erreur classique.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-calculer-1ere_P2'] },
  },
  {
    id: 'dc-e4',
    requires: ['regle-produit', 'mem-produit', 'derivees-usuelles'],
    skill: 'produit',
    title: 'Deux termes, pas un',
    prompt: 'Soit f(x) = x²(x + 1). Que vaut f′(1) ?',
    options: ['5', '2', '4', '3'],
    cols: 4,
    correct: 0,
    explain: 'u = x² et v = x + 1 : u′v + uv′ = 2x(x + 1) + x². En x = 1 : 2 × 2 + 1 = 5. Répondre 2, c’est avoir multiplié les deux dos entre eux (2x × 1 = 2), ce qui ne donne pas la pente.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-calculer-1ere_P3'] },
  },
  {
    id: 'dc-e5',
    requires: ['regle-produit', 'derivation-ne-se-distribue-pas'],
    skill: 'produit',
    title: 'Pourquoi deux termes ?',
    prompt: 'Un élève écrit (uv)′ = u′v′. Comment lui montrer en une ligne que c’est faux ?',
    options: [
      'Avec u = x² et v = x : le produit vaut x³, dont la pente en 2 est 12, alors que u′v′ y vaut 4',
      'C’est impossible à montrer : les deux écritures donnent le même résultat',
      'En disant qu’un produit ne se dérive jamais',
      'En remarquant que u′v′ n’a pas de sens mathématique',
    ],
    cols: 1,
    correct: 0,
    explain: 'x² × x = x³, dont la pente en 2 vaut 3 × 4 = 12. Or u′v′ = 2x × 1 = 2x, soit 4 en x = 2. Un seul contre-exemple suffit à détruire une règle.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-calculer-1ere_P3', 'premiere_specialite_derivation-calculer-1ere_P2'] },
  },
  {
    id: 'dc-e6',
    requires: ['regle-quotient', 'mem-quotient', 'derivees-usuelles'],
    skill: 'quotient',
    title: 'La fraction',
    prompt: 'Soit f(x) = x ÷ (x + 1). Que vaut f′(1) ?',
    options: ['0,25', '1', '−0,25', '0,5'],
    cols: 4,
    correct: 0,
    explain: 'u = x et v = x + 1 : (u′v − uv′)/v² = [1 × (x + 1) − x × 1] ÷ (x + 1)² = 1 ÷ (x + 1)². En x = 1 : 1 ÷ 4 = 0,25. Répondre 1, c’est avoir divisé les dos : u′ ÷ v′ = 1 ÷ 1.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-calculer-1ere_P4'] },
  },
  {
    id: 'dc-e7',
    requires: ['regle-quotient', 'mem-quotient'],
    skill: 'quotient',
    title: 'L’ordre du numérateur',
    prompt: 'Un élève écrit (u/v)′ = (uv′ − u′v) ÷ v². Quel est l’effet de cette inversion ?',
    options: [
      'Le résultat est l’OPPOSÉ du bon : la pente change de signe',
      'Aucun : une soustraction se lit dans les deux sens',
      'Le résultat est deux fois trop grand',
      'Le dénominateur devient négatif',
    ],
    cols: 1,
    correct: 0,
    explain: 'a − b et b − a sont opposés. Le dénominateur v², lui, est un carré : il reste positif dans les deux écritures. C’est donc bien le signe du résultat qui bascule.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-calculer-1ere_P4'] },
  },
  {
    id: 'dc-e8',
    requires: ['regle-composee-simple', 'mem-composee'],
    skill: 'composee',
    title: 'Le facteur intérieur',
    prompt: 'Soit f(x) = (3x − 2)⁴. Que vaut f′(1) ?',
    options: ['12', '4', '36', '3'],
    cols: 4,
    correct: 0,
    explain: 'f′(x) = 4 × 3 × (3x − 2)³ = 12(3x − 2)³. En x = 1 : 3 − 2 = 1, donc 12 × 1 = 12. Répondre 4, c’est avoir oublié le facteur intérieur 3.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-calculer-1ere_P5'] },
  },
  {
    id: 'dc-e9',
    requires: ['regle-composee-simple', 'derivees-usuelles'],
    skill: 'composee',
    title: 'Un intérieur négatif',
    prompt: 'Quelle est l’expression de la dérivée de g(x) = (4 − x)² ?',
    options: ['−2(4 − x)', '2(4 − x)', '−2', '2(4 − x)²'],
    cols: 2,
    correct: 0,
    explain: 'Le coefficient de x dans la parenthèse vaut −1 : 2 × (−1) × (4 − x)¹ = −2(4 − x). Oublier ce −1 donnerait 2(4 − x), soit le résultat opposé.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-calculer-1ere_P5'] },
  },
  {
    id: 'dc-e10',
    requires: ['methode-choisir-la-regle', 'regle-somme-et-reel', 'regle-composee-simple'],
    skill: 'choisir',
    title: 'Quelle règle ?',
    prompt: 'Pour dériver f(x) = 5x⁴, quelle démarche convient ?',
    options: [
      'Un nombre multiplie : il reste devant, et l’on dérive x⁴ — soit 20x³',
      'Un produit de deux fonctions : appliquer u′v + uv′',
      'Un emboîtement : appliquer n·u′·uⁿ⁻¹ avec l’intérieur 5x',
      'Une fraction : appliquer (u′v − uv′)/v²',
    ],
    cols: 1,
    correct: 0,
    explain: '5 est un NOMBRE, pas une fonction de x : il traverse la dérivation. 5 × 4x³ = 20x³. Sortir la règle du produit ici n’est pas faux, mais c’est un détour — et un détour est une occasion de perdre un terme.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-calculer-1ere_P2', 'premiere_specialite_derivation-calculer-1ere_P5'] },
  },
];

// `module` pointe le module qui ENSEIGNE la compétence, jamais l'évaluation
// elle-même : le boss mesure, il n'enseigne pas.
const SKILLS = {
  usuelles: { label: 'Les dérivées usuelles', module: 2 },
  somme: { label: 'Somme et produit par un réel', module: 3 },
  produit: { label: 'La règle du produit', module: 3 },
  quotient: { label: 'La règle du quotient', module: 4 },
  composee: { label: 'La composée simple', module: 5 },
  choisir: { label: 'Choisir la bonne règle', module: 6 },
};

const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Cartes en main', test: (m) => !m.usuelles },
  { id: 'b2', emoji: '🏅', label: 'Terme par terme', test: (m) => !m.somme },
  { id: 'b3', emoji: '🏅', label: 'Deux termes, jamais un', test: (m) => !m.produit },
  { id: 'b4', emoji: '🏅', label: 'Le moins bien placé', test: (m) => !m.quotient },
  { id: 'b5', emoji: '🏅', label: 'Rien perdu à l’intérieur', test: (m) => !m.composee },
  { id: 'b-parfait', emoji: '💎', label: 'Chef d’usine', test: (m) => Object.keys(m).length === 0 },
];

export default function Module07MissionFinaleLUsine() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : l’usine"
      moduleSubtitle="Dix épreuves : reconnaître la règle, et ne rien perdre en route"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Chef d’usine',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation. Réflexe : regarder la STRUCTURE d’abord, choisir
            la règle ensuite — et compter ses termes avant de conclure.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🃏', label: 'xⁿ', value: 'n·xⁿ⁻¹' },
        { id: 'r2', emoji: '➕', label: 'u + v', value: 'u′ + v′' },
        { id: 'r3', emoji: '✖️', label: 'uv', value: 'u′v + uv′' },
        { id: 'r4', emoji: '➗', label: 'u/v', value: '(u′v − uv′)/v²' },
        { id: 'r5', emoji: '🎁', label: 'uⁿ', value: 'n·u′·uⁿ⁻¹' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Chef d’usine !',
        title: 'Mission accomplie',
        message: 'Tu sais retourner les cartes de base, reconnaître la structure d’une expression et appliquer la règle qui convient sans perdre un terme.',
        verbs: ['Retourner', 'Reconnaître', 'Appliquer', 'Vérifier'],
        masterBadgeLabel: 'Chef d’usine',
      }}
    />
  );
}
