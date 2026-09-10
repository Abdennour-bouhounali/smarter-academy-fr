import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION.
 *
 * CONNAISSANCES AVANT LA DEMANDE. La mission finale CONSOLIDE : elle
 * n'introduit rien de neuf — ni concept, ni vocabulaire, ni notation, options
 * et distracteurs compris — et chaque épreuve déclare les connaissances
 * qu'elle exige, toutes posées par une brique des modules 1 à 6.
 *
 * COUVERTURE. Chaque LP a au moins une épreuve qui lui est PROPRE, pour que le
 * profil de maîtrise soit interprétable :
 *   P1 signe d'un trinôme ............... sp-e1 (seule), sp-e2, sp-e10
 *   P2 résoudre une inéquation .......... sp-e3 (seule), sp-e4
 *   P3 modéliser par une équation ....... sp-e5 (seule), sp-e6
 *   P4 modéliser par une inéquation ..... sp-e7 (seule), sp-e8
 *   P5 interpréter dans le contexte ..... sp-e9 (seule), sp-e6, sp-e10
 *
 * DISTRACTEURS, tous vérifiés numériquement et DISTINCTS de la bonne réponse
 * (components/signeProblemesUtils.test.js) : le signe de a oublié (e1, e2),
 * l'intérieur pris pour l'extérieur (e3), les bornes exclues à tort (e4), le
 * périmètre confondu avec le demi-périmètre (e5), la racine négative gardée
 * (e6, e9), « au moins » traduit par « = » ou par « > » (e7), l'inégalité non
 * retournée quand a est négatif (e8), l'opposé pris pour la solution (e6), le
 * nombre constant pris pour une racine (e10).
 */
const EPREUVES = [
  {
    id: 'sp-e1',
    requires: ['signe-trinome-regle', 'tableau-signes-trinome'],
    skill: 'signe',
    title: 'Du signe de a, sauf…',
    prompt: 'Le trinôme −2x² + 8 a pour racines −2 et 2. Quel est son signe entre −2 et 2 ?',
    options: [
      'Positif : a est négatif, donc le trinôme prend le signe CONTRAIRE entre les racines',
      'Négatif : a est négatif, donc le trinôme est négatif partout',
      'Positif à gauche de 0 et négatif à droite',
      'Nul, puisque −2 et 2 sont ses racines',
    ],
    cols: 1,
    correct: 0,
    explain: 'La règle : du signe de a, sauf entre les racines. Ici a = −2 est négatif, donc le trinôme est négatif à l’extérieur et POSITIF au milieu. Vérification en x = 0 : −2 × 0 + 8 = 8, positif.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_second-degre-signe-problemes-1ere_P1'] },
  },
  {
    id: 'sp-e2',
    requires: ['signe-sans-racine', 'discriminant'],
    skill: 'signe',
    title: 'Sans racine',
    prompt: 'Le trinôme x² − 2x + 5 a pour discriminant −16. Quel est son signe ?',
    options: [
      'Positif pour tous les nombres, sans exception',
      'Négatif pour tous les nombres, comme son discriminant',
      'Positif d’un côté de 1 et négatif de l’autre',
      'On ne peut pas le dire sans calculer plusieurs valeurs',
    ],
    cols: 1,
    correct: 0,
    explain: 'Sans racine, aucun endroit où le signe pourrait basculer : le trinôme garde partout le signe de a, ici positif. Une seule valeur le confirme — en x = 0 il vaut 5.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_second-degre-signe-problemes-1ere_P1'] },
  },
  {
    id: 'sp-e3',
    requires: ['methode-inequation-second-degre', 'tableau-signes-trinome'],
    skill: 'inequation',
    title: 'Deux morceaux',
    prompt: 'Résous x² − 5x + 6 > 0, dont les racines sont 2 et 3.',
    options: [
      ']−∞ ; 2[ ∪ ]3 ; +∞[',
      ']2 ; 3[',
      '[2 ; 3]',
      'ℝ',
    ],
    cols: 2,
    correct: 0,
    explain: 'a = 1 est positif, donc le trinôme est positif à l’extérieur des racines. « > 0 » retient ces deux colonnes, et les bornes sont exclues car l’inégalité est stricte. Vérification en x = 0 : 6 > 0 ✔ ; en x = 2,5 : −0,25, donc 2,5 est bien exclu.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_second-degre-signe-problemes-1ere_P2'] },
  },
  {
    id: 'sp-e4',
    requires: ['bornes-incluses-inequation', 'methode-inequation-second-degre'],
    skill: 'inequation',
    title: 'Les crochets',
    prompt: 'Résous −x² + 9 ⩾ 0, dont les racines sont −3 et 3.',
    options: [
      '[−3 ; 3]',
      ']−3 ; 3[',
      ']−∞ ; −3] ∪ [3 ; +∞[',
      '∅',
    ],
    cols: 2,
    correct: 0,
    explain: 'a = −1 est négatif : le trinôme est positif ENTRE les racines. Et « ⩾ » accepte le zéro, donc −3 et 3 font partie des solutions : les crochets se ferment. Vérification en x = 0 : 9 ⩾ 0 ✔ ; en x = 3 : 0 ⩾ 0 ✔',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_second-degre-signe-problemes-1ere_P2'] },
  },
  {
    id: 'sp-e5',
    requires: ['modeliser-second-degre'],
    skill: 'modeliser',
    title: 'Nommer et exprimer',
    prompt: 'Un rectangle a pour périmètre 20 m et pour aire 24 m². En notant x sa largeur en mètres, quelle équation traduit l’énoncé ?',
    options: [
      'x(10 − x) = 24',
      'x(20 − x) = 24',
      '2x + 2(10 − x) = 24',
      'x + 24 ÷ x = 20',
    ],
    cols: 2,
    correct: 0,
    explain: 'Le périmètre vaut 2 × (largeur + longueur), donc largeur + longueur = 10. Si la largeur est x, la longueur est 10 − x, et l’aire est leur produit : x(10 − x) = 24. Les solutions sont 4 et 6, et 4 × 6 = 24 ✔',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_second-degre-signe-problemes-1ere_P3'] },
  },
  {
    id: 'sp-e6',
    requires: ['modeliser-second-degre', 'solution-equation-vs-probleme'],
    skill: 'modeliser',
    title: 'La bonne dimension',
    prompt: 'Une longueur dépasse une largeur de 2 m, et l’aire vaut 24 m². L’équation x² + 2x − 24 = 0 a pour solutions −6 et 4. Que vaut la largeur ?',
    options: [
      '4 m : −6 annule bien l’équation, mais une largeur ne peut pas être négative',
      '−6 m et 4 m : les deux solutions conviennent',
      '−6 m : c’est la plus petite des deux, donc la largeur',
      '6 m : on remplace la solution négative par son opposé',
    ],
    cols: 1,
    correct: 0,
    explain: 'Les deux nombres annulent l’expression, mais x désigne une largeur : on écarte −6 et l’on garde 4. Vérification dans l’énoncé : 4 × 6 = 24 m², et 6 dépasse bien 4 de 2 m ✔',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_second-degre-signe-problemes-1ere_P3', 'premiere_specialite_second-degre-signe-problemes-1ere_P5'] },
  },
  {
    id: 'sp-e7',
    requires: ['traduire-au-moins-au-plus'],
    skill: 'traduire',
    title: '« Au moins »',
    prompt: 'L’aire d’un enclos vaut −2x² + 24x. On veut qu’elle soit d’au moins 64 m². Comment cela se traduit-il ?',
    options: [
      '−2x² + 24x ⩾ 64, soit −2x² + 24x − 64 ⩾ 0',
      '−2x² + 24x = 64, soit −2x² + 24x − 64 = 0',
      '−2x² + 24x > 64, soit −2x² + 24x − 64 > 0',
      '−2x² + 24x ⩽ 64, soit −2x² + 24x − 64 ⩽ 0',
    ],
    cols: 1,
    correct: 0,
    explain: '« Au moins 64 » veut dire « 64 ou plus » : l’aire a le droit de valoir exactement 64, donc l’inégalité est LARGE, avec ⩾. On ramène ensuite la cible à gauche.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_second-degre-signe-problemes-1ere_P4'] },
  },
  {
    id: 'sp-e8',
    requires: ['traduire-au-moins-au-plus', 'methode-inequation-second-degre'],
    skill: 'traduire',
    title: 'De la phrase à l’intervalle',
    prompt: 'On résout −2x² + 24x − 64 ⩾ 0, dont les racines sont 4 et 8. Quelles profondeurs conviennent ?',
    options: [
      'Toutes celles comprises entre 4 m et 8 m, ces deux valeurs comprises',
      'Toutes celles inférieures à 4 m ou supérieures à 8 m',
      'Toutes celles strictement comprises entre 4 m et 8 m',
      'Seulement 4 m et 8 m',
    ],
    cols: 1,
    correct: 0,
    explain: 'a = −2 est négatif, donc le trinôme est positif ENTRE les racines, et « ⩾ » garde les bornes : S = [4 ; 8]. Une profondeur de 4 m donne exactement 64 m², une de 6 m en donne 72 ✔',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_second-degre-signe-problemes-1ere_P4'] },
  },
  {
    id: 'sp-e9',
    requires: ['methode-interpreter', 'solution-equation-vs-probleme'],
    skill: 'interpreter',
    title: 'Répondre à la question',
    prompt: 'Un objet lancé retombe au sol quand sa hauteur s’annule. L’équation donne −1 et 5, et x compte les secondes écoulées depuis le lancer. Que faut-il écrire ?',
    options: [
      'L’objet retombe au bout de 5 secondes ; −1 est écartée car une durée écoulée n’est pas négative',
      'L’objet retombe au bout de −1 et de 5 secondes',
      'L’énoncé est impossible, puisqu’une des solutions est négative',
      'L’objet retombe au bout de 4 secondes, la différence des deux solutions',
    ],
    cols: 1,
    correct: 0,
    explain: 'Les deux nombres annulent bien l’expression, mais x compte des secondes écoulées : x ⩾ 0. On écarte −1 en le justifiant, on garde 5, et on répond par une phrase avec l’unité.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_second-degre-signe-problemes-1ere_P5'] },
  },
  {
    id: 'sp-e10',
    requires: ['solution-equation-vs-probleme', 'signe-sans-racine'],
    skill: 'interpreter',
    title: 'Quand rien ne convient',
    prompt: 'On cherche une largeur x telle que x² + 4 = 0. Le discriminant vaut −16. Que faut-il répondre ?',
    options: [
      'Aucune largeur ne convient : l’expression n’a pas de racine, elle est positive partout',
      'La largeur vaut 2 m, puisque 2² = 4',
      'La largeur vaut −2 m',
      'La largeur vaut 4 m, le nombre écrit après le x²',
    ],
    cols: 1,
    correct: 0,
    explain: 'Δ = −16 < 0 : l’expression ne s’annule jamais, et comme a = 1 est positif, elle est strictement positive partout. Il n’y a donc pas de solution, ni pour l’équation ni pour le problème. Vérification en x = 2 : 4 + 4 = 8, et non 0.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_second-degre-signe-problemes-1ere_P5', 'premiere_specialite_second-degre-signe-problemes-1ere_P1'] },
  },
];

// `module` pointe le module qui ENSEIGNE la compétence, jamais l'évaluation
// elle-même : le boss mesure, il n'enseigne pas.
const SKILLS = {
  signe: { label: 'Signe d’un trinôme', module: 2 },
  inequation: { label: 'Résoudre une inéquation', module: 4 },
  modeliser: { label: 'Modéliser', module: 5 },
  traduire: { label: 'Traduire « au moins »', module: 5 },
  interpreter: { label: 'Interpréter', module: 6 },
};

const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Lecteur de signes', test: (m) => !m.signe },
  { id: 'b2', emoji: '🏅', label: 'Résolveur d’inéquations', test: (m) => !m.inequation },
  { id: 'b3', emoji: '🏅', label: 'Modélisateur', test: (m) => !m.modeliser },
  { id: 'b4', emoji: '🏅', label: 'Traducteur d’énoncés', test: (m) => !m.traduire },
  { id: 'b5', emoji: '🏅', label: 'Interprète', test: (m) => !m.interpreter },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du signe et du sens', test: (m) => Object.keys(m).length === 0 },
];

export default function Module07MissionFinaleLeSigne() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le signe et le sens"
      moduleSubtitle="Dix épreuves : un signe, un tableau, une inéquation, un problème, une réponse"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître du signe et du sens',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation. Réflexe : le signe de a et celui de Δ pour le
            signe, le tableau pour l’inéquation, et toujours une dernière question — cette
            solution a-t-elle un sens ?
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '±', label: 'signe', value: 'du signe de a, sauf entre les racines' },
        { id: 'r2', emoji: '📋', label: 'tableau', value: '+ 0 − 0 + (pour a > 0)' },
        { id: 'r3', emoji: '⚖️', label: 'bornes', value: '⩽ ⩾ incluent · < > excluent' },
        { id: 'r4', emoji: '📝', label: 'répondre', value: 'confronter au contexte, puis rédiger' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître du signe et du sens !',
        title: 'Mission accomplie',
        message: 'Tu sais lire le signe d’un trinôme sans le calculer, dresser son tableau, résoudre une inéquation avec les bonnes bornes, traduire un énoncé et n’en retenir que les réponses qui ont un sens.',
        verbs: ['Lire', 'Résoudre', 'Modéliser', 'Interpréter'],
        masterBadgeLabel: 'Maître du signe et du sens',
      }}
    />
  );
}
