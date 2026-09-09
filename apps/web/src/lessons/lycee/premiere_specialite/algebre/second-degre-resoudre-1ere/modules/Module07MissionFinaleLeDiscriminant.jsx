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
 *   P1 calculer Δ ........................ e1 (seule), e2
 *   P2 résoudre selon le signe de Δ ...... e3 (seule), e2, e5
 *   P3 déterminer les racines ............ e4 (seule), e6
 *   P4 factoriser à partir des racines ... e7 (seule), e8
 *   P5 racines et parabole ............... e9 (seule), e10
 *
 * DISTRACTEURS, tous vérifiés numériquement et DISTINCTS de la bonne réponse
 * (components/quadUtils.test.js) : « + 4ac » au lieu de « − 4ac » (e1), b non
 * élevé au carré (e1), Δ pris pour le nombre de solutions (e2), Δ < 0 pris
 * pour une erreur (e3, e5), signe des racines non inversé (e4), racine double
 * comptée deux fois (e6), signe non retourné dans la parenthèse (e7, e8),
 * orientation de la courbe confondue avec le nombre de racines (e9), sommet
 * pris pour une racine (e10).
 */
const EPREUVES = [
  {
    id: 'sd-e1',
    requires: ['discriminant', 'methode-calculer-delta'],
    skill: 'delta',
    title: 'Le discriminant',
    prompt: 'Quel est le discriminant de x² − 5x + 6 ?',
    options: ['1', '49', '19', '−29'],
    cols: 4,
    correct: 0,
    explain: 'Δ = (−5)² − 4 × 1 × 6 = 25 − 24 = 1. Répondre 49, c’est avoir ajouté 4ac au lieu de le retrancher ; répondre 19, c’est avoir perdu le facteur 4.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_second-degre-resoudre-1ere_P1'] },
  },
  {
    id: 'sd-e2',
    requires: ['discriminant', 'trois-cas-selon-delta'],
    skill: 'delta',
    title: 'Compter avant de chercher',
    prompt: 'Pour 2x² + 3x + 5 = 0, on trouve Δ = −31. Combien cette équation a-t-elle de solutions ?',
    options: ['Aucune', 'Une seule', 'Deux', 'Trente et une'],
    cols: 4,
    correct: 0,
    explain: 'Δ est négatif, donc l’équation n’a pas de solution réelle. Δ n’est pas le nombre de solutions : c’est le nombre dont le SIGNE donne le nombre de solutions.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_second-degre-resoudre-1ere_P1', 'premiere_specialite_second-degre-resoudre-1ere_P2'] },
  },
  {
    id: 'sd-e3',
    requires: ['trois-cas-selon-delta', 'methode-resoudre-second-degre'],
    skill: 'resoudre',
    title: 'Conclure sans solution',
    prompt: 'En résolvant une équation du second degré, on obtient Δ = −7. Que doit-on écrire ?',
    options: [
      'L’équation n’a pas de solution réelle : S = ∅',
      'S = { −7 }',
      'Il y a une erreur de calcul : un discriminant ne peut pas être négatif',
      'S = { 0 }, faute de mieux',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un discriminant négatif est un résultat normal et complet : aucun nombre n’annule l’expression. L’ensemble des solutions est vide, et l’exercice est terminé.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_second-degre-resoudre-1ere_P2'] },
  },
  {
    id: 'sd-e4',
    requires: ['formule-racines', 'racine-trinome'],
    skill: 'racines',
    title: 'Les deux racines',
    prompt: 'Quelles sont les racines de x² − 5x + 6 ?',
    options: ['2 et 3', '−2 et −3', '1 et 6', '5 et 6'],
    cols: 2,
    correct: 0,
    explain: 'Δ = 1, donc x = (5 ± 1) ÷ 2, soit 2 et 3. Vérification : 4 − 10 + 6 = 0 et 9 − 15 + 6 = 0. Répondre −2 et −3, c’est avoir oublié que −b vaut +5.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_second-degre-resoudre-1ere_P3'] },
  },
  {
    id: 'sd-e5',
    requires: ['discriminant', 'trois-cas-selon-delta', 'racine-trinome'],
    skill: 'resoudre',
    title: 'Une expression qui ne s’annule jamais',
    prompt: 'Pour quelles valeurs de x l’expression x² + x + 1 s’annule-t-elle ?',
    options: [
      'Pour aucune : son discriminant vaut −3',
      'Pour x = 0 seulement',
      'Pour x = −1 et x = 1',
      'Pour toutes les valeurs négatives de x',
    ],
    cols: 1,
    correct: 0,
    explain: 'Δ = 1 − 4 = −3 < 0 : aucune racine réelle. On peut le vérifier : en x = 0 l’expression vaut 1, en x = −1 elle vaut 1 aussi. Elle reste toujours strictement positive.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_second-degre-resoudre-1ere_P2'] },
  },
  {
    id: 'sd-e6',
    requires: ['formule-racines', 'trois-cas-selon-delta'],
    skill: 'racines',
    title: 'La racine double',
    prompt: 'x² − 10x + 25 a un discriminant nul. Quelle est sa racine ?',
    options: ['5', '10', '25', '−5'],
    cols: 4,
    correct: 0,
    explain: 'x = −b ÷ (2a) = 10 ÷ 2 = 5. Vérification : 25 − 50 + 25 = 0. On l’appelle racine double, mais elle ne donne qu’un seul point sur l’axe.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_second-degre-resoudre-1ere_P3'] },
  },
  {
    id: 'sd-e7',
    requires: ['forme-factorisee-trinome', 'methode-factoriser-par-racines'],
    skill: 'factoriser',
    title: 'Factoriser',
    prompt: 'Les racines de 3x² − 12 sont −2 et 2. Quelle est sa forme factorisée ?',
    options: ['3(x + 2)(x − 2)', '(x + 2)(x − 2)', '3(x − 2)²', '3(x + 2)(x + 2)'],
    cols: 2,
    correct: 0,
    explain: 'La forme est a(x − x₁)(x − x₂) avec a = 3 : 3(x + 2)(x − 2). Sans le 3, le terme en x² vaudrait x² et non 3x². Et 3(x − 2)² vaut 27 en x = −1, alors que 3x² − 12 y vaut −9.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_second-degre-resoudre-1ere_P4'] },
  },
  {
    id: 'sd-e8',
    requires: ['forme-factorisee-trinome', 'methode-factoriser-par-racines', 'racine-trinome'],
    skill: 'factoriser',
    title: 'Le signe dans la parenthèse',
    prompt: 'Les racines de x² − x − 6 sont −2 et 3. Quelle est sa forme factorisée ?',
    options: ['(x + 2)(x − 3)', '(x − 2)(x + 3)', '(x + 2)(x + 3)', '(x − 2)(x − 3)'],
    cols: 2,
    correct: 0,
    explain: 'Chaque parenthèse s’écrit (x − racine) : pour −2 cela donne (x + 2), pour 3 cela donne (x − 3). Vérification en développant : x² − 3x + 2x − 6 = x² − x − 6. Le piège (x − 2)(x + 3) s’annule en 2 et −3, qui ne sont pas les racines.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_second-degre-resoudre-1ere_P4', 'premiere_specialite_second-degre-resoudre-1ere_P3'] },
  },
  {
    id: 'sd-e9',
    requires: ['racines-et-parabole', 'points-axe-abscisses'],
    skill: 'graphique',
    title: 'Lire le signe de Δ',
    prompt: 'Sur un graphique, une courbe du second degré coupe l’axe des abscisses en deux points distincts. Que peut-on dire de son discriminant ?',
    options: [
      'Il est strictement positif',
      'Il est nul',
      'Il est strictement négatif',
      'On ne peut rien en dire sans connaître a, b et c',
    ],
    cols: 1,
    correct: 0,
    explain: 'Deux points sur l’axe, donc deux racines, donc Δ > 0. Le dessin suffit : l’orientation de la courbe, vers le haut ou vers le bas, n’intervient pas.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_second-degre-resoudre-1ere_P5'] },
  },
  {
    id: 'sd-e10',
    requires: ['racines-et-parabole', 'trois-cas-selon-delta'],
    skill: 'graphique',
    title: 'Le point le plus bas',
    prompt: 'La courbe de x² − 4x + 7 a pour point le plus bas (2 ; 3). Combien de points partage-t-elle avec l’axe des abscisses ?',
    options: [
      'Aucun : son point le plus bas est déjà au-dessus de l’axe',
      'Un seul : le point (2 ; 3)',
      'Deux, de part et d’autre de x = 2',
      'Deux, dont le point (2 ; 3)',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le point le plus bas a pour ordonnée 3, donc toute la courbe est au-dessus de l’axe : aucun point commun. On le retrouve par le calcul, Δ = 16 − 28 = −12 < 0. Un point d’ordonnée 3 n’est jamais sur l’axe des abscisses.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_second-degre-resoudre-1ere_P5'] },
  },
];

// `module` pointe le module qui ENSEIGNE la compétence, jamais l'évaluation
// elle-même : le boss mesure, il n'enseigne pas.
const SKILLS = {
  delta: { label: 'Calculer Δ', module: 2 },
  resoudre: { label: 'Résoudre selon Δ', module: 3 },
  racines: { label: 'Trouver les racines', module: 4 },
  factoriser: { label: 'Factoriser', module: 5 },
  graphique: { label: 'Lire la parabole', module: 6 },
};

const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Calculateur de Δ', test: (m) => !m.delta },
  { id: 'b2', emoji: '🏅', label: 'Les trois cas maîtrisés', test: (m) => !m.resoudre },
  { id: 'b3', emoji: '🏅', label: 'Chasseur de racines', test: (m) => !m.racines },
  { id: 'b4', emoji: '🏅', label: 'Factoriseur', test: (m) => !m.factoriser },
  { id: 'b5', emoji: '🏅', label: 'Lecteur de paraboles', test: (m) => !m.graphique },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du discriminant', test: (m) => Object.keys(m).length === 0 },
];

export default function Module07MissionFinaleLeDiscriminant() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le discriminant"
      moduleSubtitle="Dix épreuves : un discriminant, trois cas, des racines, une factorisation"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître du discriminant',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation. Réflexe : ranger l’équation, relever a, b et c
            avec leurs signes, calculer Δ — et conclure avant de chercher quoi que ce soit.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🔢', label: 'Δ', value: 'b² − 4ac' },
        { id: 'r2', emoji: '⚖️', label: 'trois cas', value: '2 · 1 · 0 solutions' },
        { id: 'r3', emoji: '🎯', label: 'racines', value: '(−b ± √Δ) ÷ 2a' },
        { id: 'r4', emoji: '✖️', label: 'factorisée', value: 'a(x − x₁)(x − x₂)' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître du discriminant !',
        title: 'Mission accomplie',
        message: 'Tu sais compter les solutions avant de les chercher, les calculer dans les trois cas, factoriser à partir d’elles et lire tout cela sur une parabole.',
        verbs: ['Compter', 'Résoudre', 'Factoriser', 'Lire'],
        masterBadgeLabel: 'Maître du discriminant',
      }}
    />
  );
}
