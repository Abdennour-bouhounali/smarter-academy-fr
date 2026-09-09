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
 *   — « 3x + 2 = 5x », mélanger deux natures de termes (M1, M2) ;
 *   — perdre un signe en réduisant (M2) ;
 *   — « 5(x + 4) = 5x + 4 », ne pas distribuer sur le second terme (M3) ;
 *   — oublier les deux produits du milieu d'une double distributivité (M4) ;
 *   — factoriser par un nombre qui ne divise qu'un terme (M5) ;
 *   — croire qu'un essai réussi prouve une égalité (M6).
 *
 * La bonne réponse est déclarée par `correct` et sa POSITION VARIE.
 *
 * `badges[].test` est une FONCTION `(misses) => bool` : un objet `{skill}` y
 * jette « b.test is not a function » et le module ne monte pas du tout.
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 5 LPs sont tous couverts.
 */
const SKILLS = {
  reduire: { label: 'Réduire', emoji: '🧩' },
  developper: { label: 'Développer', emoji: '📐' },
  double: { label: 'Double distributivité', emoji: '🔲' },
  factoriser: { label: 'Factoriser', emoji: '🔙' },
  tester: { label: 'Tester une égalité', emoji: '🔍' },
};

const BADGES = [
  { id: 'b-red', emoji: '🧩', label: 'Trieur de termes', test: (m) => !m.reduire },
  { id: 'b-dev', emoji: '📐', label: 'Développeur', test: (m) => !m.developper && !m.double },
  { id: 'b-fac', emoji: '🔙', label: 'Factoriseur', test: (m) => !m.factoriser },
  { id: 'b-tes', emoji: '🔍', label: 'Esprit critique', test: (m) => !m.tester },
  { id: 'b-parfait', emoji: '💎', label: 'Maître des tuiles', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'cl4-e1',
    skill: 'reduire',
    title: 'Réduire',
    prompt: <span>Réduis <MathText>{'$9x + 4 - 2x$'}</MathText></span>,
    options: [
      <MathText key="a">{'$11x$'}</MathText>,
      <MathText key="b">{'$7x + 4$'}</MathText>,
      <MathText key="c">{'$11x + 4$'}</MathText>,
      <MathText key="d">{'$7x - 4$'}</MathText>,
    ],
    correct: 1,
    cols: 4,
    optionLabel: (i) => ['11x', '7x + 4', '11x + 4', '7x − 4'][i],
    requires: ['termes-semblables'],
    explain: 'Les x : 9 − 2 = 7, donc 7x. Le 4 n’a pas de semblable, il reste tel quel. Résultat : 7x + 4. (11x viendrait d’avoir additionné au lieu de soustraire, et d’avoir absorbé le 4.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_calcul-litteral-4e_P1'] },
  },
  {
    id: 'cl4-e2',
    skill: 'reduire',
    title: 'Deux natures',
    prompt: <span>Peut-on écrire <MathText>{'$6x + 5$'}</MathText> plus court ?</span>,
    options: [
      <span key="a">Oui : <MathText>{'$11x$'}</MathText></span>,
      <span key="b">Non : c’est déjà la forme la plus courte</span>,
      <span key="c">Oui : <MathText>{'$11$'}</MathText></span>,
      <span key="d">Oui, mais seulement si on connaît x</span>,
    ],
    correct: 1,
    cols: 2,
    optionLabel: (i) => ['11x', 'Non, c’est déjà terminé', '11', 'seulement si on connaît x'][i],
    requires: ['ce-qui-se-regroupe', 'termes-semblables'],
    explain: '6x et 5 ne sont pas des termes semblables : l’un compte des x, l’autre des unités. L’expression est terminée. Vérification : pour x = 10, 6x + 5 vaut 65 — pas 110.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_calcul-litteral-4e_P1'] },
  },
  {
    id: 'cl4-e3',
    skill: 'developper',
    title: 'Distribuer',
    prompt: <span>Développe <MathText>{'$7(x + 3)$'}</MathText></span>,
    options: [
      <MathText key="a">{'$7x + 3$'}</MathText>,
      <MathText key="b">{'$7x + 10$'}</MathText>,
      <MathText key="c">{'$7x + 21$'}</MathText>,
      <MathText key="d">{'$10x$'}</MathText>,
    ],
    correct: 2,
    cols: 4,
    optionLabel: (i) => ['7x + 3', '7x + 10', '7x + 21', '10x'][i],
    requires: ['distributivite-simple'],
    explain: 'Le 7 multiplie les deux termes : 7 × x = 7x et 7 × 3 = 21. Sur le rectangle, le morceau de droite mesure 7 de haut sur 3 de large.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_calcul-litteral-4e_P2'] },
  },
  {
    id: 'cl4-e4',
    skill: 'developper',
    title: 'Un facteur négatif',
    prompt: <span>Développe <MathText>{'$-3(x - 4)$'}</MathText></span>,
    options: [
      <MathText key="a">{'$-3x + 12$'}</MathText>,
      <MathText key="b">{'$-3x - 12$'}</MathText>,
      <MathText key="c">{'$3x - 12$'}</MathText>,
      <MathText key="d">{'$-3x - 4$'}</MathText>,
    ],
    correct: 0,
    cols: 4,
    optionLabel: (i) => ['−3x + 12', '−3x − 12', '3x − 12', '−3x − 4'][i],
    requires: ['distributivite-simple', 'regle-des-signes'],
    explain: '−3 × x = −3x, et −3 × (−4) = +12 : deux facteurs négatifs donnent un produit positif. Le second terme change bien de signe.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_calcul-litteral-4e_P2'] },
  },
  {
    id: 'cl4-e5',
    skill: 'developper',
    title: 'Développer puis réduire',
    prompt: <span>Développe et réduis <MathText>{'$2(x + 5) + 3x$'}</MathText></span>,
    options: [
      <MathText key="a">{'$5x + 5$'}</MathText>,
      <MathText key="b">{'$5x + 10$'}</MathText>,
      <MathText key="c">{'$2x + 13$'}</MathText>,
      <MathText key="d">{'$10x$'}</MathText>,
    ],
    correct: 1,
    cols: 4,
    optionLabel: (i) => ['5x + 5', '5x + 10', '2x + 13', '10x'][i],
    requires: ['distributivite-simple', 'termes-semblables'],
    explain: '2(x + 5) = 2x + 10, puis 2x + 3x = 5x. Résultat : 5x + 10. Un développement se termine toujours par un regroupement.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_calcul-litteral-4e_P2'] },
  },
  {
    id: 'cl4-e6',
    skill: 'double',
    title: 'Quatre morceaux',
    prompt: <span>Développe et réduis <MathText>{'$(x + 2)(x + 5)$'}</MathText></span>,
    options: [
      <MathText key="a">{'$x^2 + 10$'}</MathText>,
      <MathText key="b">{'$x^2 + 7x + 10$'}</MathText>,
      <MathText key="c">{'$x^2 + 10x + 7$'}</MathText>,
      <MathText key="d">{'$2x + 7$'}</MathText>,
    ],
    correct: 1,
    cols: 2,
    optionLabel: (i) => ['x² + 10', 'x² + 7x + 10', 'x² + 10x + 7', '2x + 7'][i],
    requires: ['double-distributivite', 'termes-semblables'],
    explain: 'Les quatre produits : x², 5x, 2x et 10. On réduit les deux du milieu : 5x + 2x = 7x. Résultat : x² + 7x + 10. (x² + 10 oublie les deux morceaux du milieu.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_calcul-litteral-4e_P3'] },
  },
  {
    id: 'cl4-e7',
    skill: 'double',
    title: 'Combien de produits ?',
    prompt: <span>Combien de produits obtient-on en développant <MathText>{'$(a + b)(c + d)$'}</MathText>, avant de réduire ?</span>,
    options: ['2', '3', '4', '6'],
    correct: 2,
    cols: 4,
    requires: ['double-distributivite'],
    explain: 'Chacun des 2 termes de la première parenthèse multiplie chacun des 2 termes de la seconde : 2 × 2 = 4 produits, un par morceau du rectangle.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_calcul-litteral-4e_P3'] },
  },
  {
    id: 'cl4-e8',
    skill: 'factoriser',
    title: 'Factoriser',
    prompt: <span>Factorise <MathText>{'$24x + 16$'}</MathText> en sortant le plus grand facteur possible</span>,
    options: [
      <MathText key="a">{'$4(6x + 4)$'}</MathText>,
      <MathText key="b">{'$8(3x + 2)$'}</MathText>,
      <MathText key="c">{'$8(3x + 16)$'}</MathText>,
      <MathText key="d">{'$2(12x + 8)$'}</MathText>,
    ],
    correct: 1,
    cols: 2,
    optionLabel: (i) => ['4(6x + 4)', '8(3x + 2)', '8(3x + 16)', '2(12x + 8)'][i],
    requires: ['factoriser'],
    explain: '8 est le plus grand nombre qui divise 24 et 16 : 8(3x + 2). Avec 4 ou 2, la parenthèse contiendrait encore un facteur commun. Vérification : 8 × 3x = 24x et 8 × 2 = 16 ✓.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_calcul-litteral-4e_P4'] },
  },
  {
    id: 'cl4-e9',
    skill: 'factoriser',
    title: 'Vérifier une factorisation',
    prompt: <span>La factorisation <MathText>{'$18x - 12 = 6(3x - 12)$'}</MathText> est-elle juste ?</span>,
    options: [
      'Oui, 6 divise bien 18',
      'Non : en redéveloppant on obtient 18x − 72',
      'Oui, mais on aurait pu faire mieux',
      'Impossible à savoir sans connaître x',
    ],
    correct: 1,
    cols: 1,
    requires: ['factoriser'],
    explain: 'Le réflexe qui sauve : redévelopper. 6 × 3x = 18x, mais 6 × 12 = 72, pas 12. La bonne factorisation est 6(3x − 2). Le 12 n’a pas été divisé par 6.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_calcul-litteral-4e_P4'] },
  },
  {
    id: 'cl4-e10',
    skill: 'tester',
    title: 'Ce qu’un essai prouve',
    prompt: <span>Pour <MathText>{'$x = 0$'}</MathText>, les deux membres de <MathText>{'$3(x + 4) = 3x + 12$'}</MathText> valent 12. Que peut-on en conclure ?</span>,
    options: [
      'Que l’égalité est vraie pour toute valeur de x',
      'Que l’égalité n’est vraie que pour x = 0',
      'Rien de définitif : un essai ne prouve pas une égalité — seul le développement le fait',
      'Que l’égalité est fausse',
    ],
    correct: 2,
    cols: 1,
    requires: ['tester-une-egalite', 'distributivite-simple'],
    explain: 'Un essai réussi ne prouve rien : il faudrait tester une infinité de valeurs. Ici l’égalité est bel et bien vraie — mais c’est le développement, 3(x + 4) = 3x + 12, qui l’établit. À l’inverse, UN seul essai raté suffirait à la démolir.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_calcul-litteral-4e_P5'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : les tuiles"
      moduleSubtitle="Dix épreuves pour prouver que tu maîtrises le calcul littéral"
      estimatedTime="8 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître des tuiles',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Deux réflexes à garder : ne regrouper que
            des termes de <strong>même nature</strong>, et <strong>redévelopper</strong> pour
            vérifier une factorisation.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🧩', label: 'Réduire', value: 'seulement les termes semblables' },
        { id: 'r2', emoji: '📐', label: 'Développer', value: 'le facteur multiplie TOUT' },
        { id: 'r3', emoji: '🔲', label: 'Deux sommes', value: '4 produits' },
        { id: 'r4', emoji: '🔙', label: 'Factoriser', value: 'le plus grand facteur commun' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître des tuiles !',
        title: 'Mission accomplie',
        message: 'Tu sais réduire, développer, factoriser une expression littérale et tester une égalité.',
        verbs: ['Réduire', 'Développer', 'Factoriser', 'Tester'],
        masterBadgeLabel: 'Maître des tuiles',
      }}
    />
  );
}
