import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Le test CONSOLIDE :
 * il n'introduit ni concept, ni vocabulaire, ni notation neufs
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *
 * TRANSFERT, pas répétition (§45) : aucune épreuve ne reprend les valeurs des
 * modules, et chaque distracteur encode une erreur RÉELLEMENT rencontrée :
 *   — agir sur un seul membre (M1) ;
 *   — croire qu'un nombre « passe » de l'autre côté par magie (M1, M3) ;
 *   — retirer un coefficient au lieu de diviser (M3) ;
 *   — inverser l'ordre des deux gestes et fabriquer des virgules (M4) ;
 *   — traduire « 3 de plus » par 3x (M5) ;
 *   — répondre x au lieu de répondre à la question posée (M5).
 *
 * La bonne réponse est déclarée par `correct` et sa POSITION VARIE.
 *
 * `badges[].test` est une FONCTION `(misses) => bool` : un objet `{skill}` y
 * jette « b.test is not a function » et le module ne monte pas du tout.
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 6 LPs sont tous couverts.
 */
const SKILLS = {
  equilibre: { label: 'L’équilibre', emoji: '⚖️' },
  solution: { label: 'Solution', emoji: '🔍' },
  resoudre: { label: 'Résoudre', emoji: '🧮' },
  modeliser: { label: 'Modéliser', emoji: '📝' },
};

const BADGES = [
  { id: 'b-equ', emoji: '⚖️', label: 'Gardien de l’équilibre', test: (m) => !m.equilibre },
  { id: 'b-sol', emoji: '🔍', label: 'Vérificateur', test: (m) => !m.solution },
  { id: 'b-res', emoji: '🧮', label: 'Résolveur', test: (m) => !m.resoudre },
  { id: 'b-mod', emoji: '📝', label: 'Traducteur', test: (m) => !m.modeliser },
  { id: 'b-parfait', emoji: '💎', label: 'Maître de la balance', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'eq4-e1',
    skill: 'equilibre',
    title: 'Le geste légal',
    prompt: <span>Sur <MathText>{'$x + 9 = 15$'}</MathText>, quel geste conserve l’égalité ?</span>,
    options: [
      'Retirer 9 du membre de gauche uniquement',
      'Retirer 9 des deux membres',
      'Retirer 9 à gauche et ajouter 9 à droite',
      'Diviser le membre de droite par 9',
    ],
    correct: 1,
    cols: 1,
    requires: ['equilibre-conserve'],
    explain: 'Un geste ne conserve l’égalité que s’il est fait des DEUX côtés, à l’identique. Retirer 9 des deux membres donne x = 6, et la balance reste droite.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_equations-4e_P3'] },
  },
  {
    id: 'eq4-e2',
    skill: 'equilibre',
    title: 'Ce qu’on fait vraiment',
    prompt: <span>Passer de <MathText>{'$x - 8 = 2$'}</MathText> à <MathText>{'$x = 10$'}</MathText>, c’est…</span>,
    options: [
      'ajouter 8 aux deux membres',
      'faire passer le 8 à droite en changeant son signe, par convention',
      'retirer 8 aux deux membres',
      'multiplier les deux membres par 8',
    ],
    correct: 0,
    cols: 1,
    requires: ['equilibre-conserve', 'defaire-une-operation'],
    explain: 'On ajoute 8 des deux côtés : à gauche il reste x, à droite 2 + 8 = 10. « Changer de côté » décrit ce qu’on voit dans l’écriture, mais rien ne traverse le signe égal : c’est le geste sur les deux membres qui est réel.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_equations-4e_P3'] },
  },
  {
    id: 'eq4-e3',
    skill: 'solution',
    title: 'Tester une valeur',
    prompt: <span>x = 2 est-il solution de <MathText>{'$5x - 3 = 7$'}</MathText> ?</span>,
    options: [
      'Oui : 5 × 2 − 3 = 7',
      'Non : 5 × 2 − 3 = 10',
      'Non : 5 × 2 − 3 = 13',
      'On ne peut pas savoir sans résoudre',
    ],
    correct: 0,
    cols: 2,
    requires: ['verifier-une-solution'],
    explain: 'On calcule le membre de gauche : 5 × 2 = 10, puis 10 − 3 = 7. Le membre de droite vaut 7 aussi : x = 2 est bien solution. Vérifier ne demande jamais de résoudre.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_equations-4e_P2'] },
  },
  {
    id: 'eq4-e4',
    skill: 'solution',
    title: 'Ce qu’est une solution',
    prompt: 'Qu’est-ce qu’une solution d’équation ?',
    options: [
      'Le membre de droite de l’équation',
      'N’importe quelle valeur qu’on peut donner à x',
      'La valeur de x qui rend l’égalité vraie',
      'Le résultat du membre de gauche',
    ],
    correct: 2,
    cols: 1,
    requires: ['equation-solution'],
    explain: 'Une équation n’est vraie que pour certaines valeurs : la solution est celle qui rend les deux membres égaux. Pour toutes les autres, l’égalité est fausse.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_equations-4e_P1'] },
  },
  {
    id: 'eq4-e5',
    skill: 'resoudre',
    title: 'Un seul geste',
    prompt: <span>Résous <MathText>{'$9x = 54$'}</MathText></span>,
    options: ['x = 45', 'x = 6', 'x = 63', 'x = 486'],
    correct: 1,
    cols: 4,
    requires: ['defaire-une-operation'],
    explain: 'Le 9 multiplie x : on divise les deux membres par 9. 54 ÷ 9 = 6. (x = 45 viendrait d’avoir retiré 9, ce qui ne défait pas une multiplication.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_equations-4e_P4'] },
  },
  {
    id: 'eq4-e6',
    skill: 'resoudre',
    title: 'Une somme à défaire',
    prompt: <span>Résous <MathText>{'$x + 12 = 5$'}</MathText></span>,
    options: ['x = 17', 'x = 7', 'x = −7', 'x = −17'],
    correct: 2,
    cols: 4,
    requires: ['defaire-une-operation'],
    explain: 'On retire 12 des deux côtés : x = 5 − 12 = −7. Une solution négative est parfaitement normale. Vérification : −7 + 12 = 5 ✓',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_equations-4e_P4'] },
  },
  {
    id: 'eq4-e7',
    skill: 'resoudre',
    title: 'Deux gestes',
    prompt: <span>Résous <MathText>{'$7x - 5 = 30$'}</MathText></span>,
    options: ['x = 5', 'x = 35', 'x = 25', 'x = 4'],
    correct: 0,
    cols: 4,
    requires: ['resoudre-ax-plus-b'],
    explain: 'On ajoute 5 des deux côtés : 7x = 35. On divise par 7 : x = 5. Vérification : 7 × 5 − 5 = 30 ✓',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_equations-4e_P5'] },
  },
  {
    id: 'eq4-e8',
    skill: 'resoudre',
    title: 'L’ordre des gestes',
    prompt: <span>Pour résoudre <MathText>{'$6x + 18 = 42$'}</MathText> le plus simplement, on commence par…</span>,
    options: [
      'diviser les deux membres par 6',
      'retirer 18 des deux membres',
      'retirer 6 des deux membres',
      'diviser les deux membres par 18',
    ],
    correct: 1,
    cols: 2,
    requires: ['resoudre-ax-plus-b'],
    explain: 'On retire d’abord la constante : 6x = 24, puis on divise par 6 : x = 4. Diviser d’abord donnerait x + 3 = 7 — ce qui marche aussi (et redonne x = 4), mais oblige à diviser aussi le 18.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_equations-4e_P5'] },
  },
  {
    id: 'eq4-e9',
    skill: 'modeliser',
    title: 'Traduire',
    prompt: '« Un livre coûte 5 € de plus qu’un cahier. Ensemble ils coûtent 23 €. » Avec x = le prix du cahier, quelle équation traduit la situation ?',
    options: [
      <MathText key="a">{'$5x = 23$'}</MathText>,
      <MathText key="b">{'$x + 5 = 23$'}</MathText>,
      <MathText key="c">{'$x + (x + 5) = 23$'}</MathText>,
      <MathText key="d">{'$x \\times (x + 5) = 23$'}</MathText>,
    ],
    correct: 2,
    cols: 2,
    optionLabel: (i) => ['5x = 23', 'x + 5 = 23', 'x + (x + 5) = 23', 'x × (x + 5) = 23'][i],
    requires: ['modeliser-par-une-equation'],
    explain: 'Le cahier coûte x, le livre x + 5 (« 5 de plus », donc une addition). « Ensemble » signifie qu’on additionne les deux prix : x + (x + 5) = 23, soit 2x + 5 = 23.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_equations-4e_P6'] },
  },
  {
    id: 'eq4-e10',
    skill: 'modeliser',
    title: 'Répondre à la question',
    prompt: 'Suite du problème précédent : on trouve x = 9. Combien coûte le LIVRE ?',
    options: ['9 €', '23 €', '14 €', '4 €'],
    correct: 2,
    cols: 4,
    requires: ['modeliser-par-une-equation', 'controler-le-sens'],
    explain: 'x = 9 est le prix du CAHIER, puisque c’est ce qu’on avait posé. Le livre coûte x + 5 = 14 €. Vérification : 9 + 14 = 23 ✓ et le livre coûte bien 5 € de plus.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_equations-4e_P6'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : la balance"
      moduleSubtitle="Dix épreuves pour prouver que tu maîtrises les équations"
      estimatedTime="8 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître de la balance',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Deux réflexes :{' '}
            <strong>agir des deux côtés</strong>, et <strong>vérifier</strong> la solution en la
            réinjectant.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '⚖️', label: 'Règle unique', value: 'des DEUX côtés' },
        { id: 'r2', emoji: '➕', label: 'x + b = c', value: 'on retire b' },
        { id: 'r3', emoji: '✖️', label: 'ax = c', value: 'on divise par a' },
        { id: 'r4', emoji: '🧮', label: 'ax + b = c', value: 'enlever, puis partager' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître de la balance !',
        title: 'Mission accomplie',
        message: 'Tu sais reconnaître une solution, résoudre une équation du premier degré et traduire un problème.',
        verbs: ['Vérifier', 'Équilibrer', 'Résoudre', 'Traduire'],
        masterBadgeLabel: 'Maître de la balance',
      }}
    />
  );
}
