import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import { fmt, fmtParen, produit, diviser, evaluer } from '../components/operations';

/**
 * Module 6 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Le test CONSOLIDE :
 * il n'introduit ni concept, ni vocabulaire, ni notation neufs
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *
 * TRANSFERT, pas répétition (§45) : aucune épreuve ne reprend les valeurs des
 * modules, et chaque distracteur encode une erreur RÉELLEMENT rencontrée :
 *   — « − × − = − », par analogie avec « − + − = − » (M1, M2) ;
 *   — additionner au lieu de multiplier (M2) ;
 *   — « tous négatifs → négatif », sans compter les facteurs (M3) ;
 *   — croire que la division a sa propre règle (M4) ;
 *   — calculer de gauche à droite (M5).
 *
 * `badges[].test` est une FONCTION `(misses) => bool` : un objet `{skill}` y
 * jette « b.test is not a function » et le module ne monte pas du tout.
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 6 LPs sont tous couverts.
 */
const SKILLS = {
  produit: { label: 'Multiplier', emoji: '✖️' },
  parite: { label: 'Compter les signes', emoji: '🔢' },
  quotient: { label: 'Diviser', emoji: '➗' },
  ordre: { label: 'Enchaîner', emoji: '🧮' },
};

const BADGES = [
  { id: 'b-prod', emoji: '✖️', label: 'Règle des signes', test: (m) => !m.produit },
  { id: 'b-par', emoji: '🔢', label: 'Compteur de signes', test: (m) => !m.parite },
  { id: 'b-quot', emoji: '➗', label: 'Diviseur relatif', test: (m) => !m.quotient },
  { id: 'b-ordre', emoji: '🧮', label: 'Maître des priorités', test: (m) => !m.ordre },
  { id: 'b-parfait', emoji: '💎', label: 'Maître de la table', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'nr4-e1',
    skill: 'produit',
    title: 'Deux négatifs',
    prompt: `Combien fait ${fmt(-8)} × ${fmtParen(-6)} ?`,
    options: ['48', `${fmt(-48)}`, `${fmt(-14)}`, '14'],
    cols: 4,
    requires: ['regle-des-signes'],
    explain: `8 × 6 = 48 pour la valeur, et deux facteurs négatifs donnent un produit positif : 48. (${fmt(-14)} serait la somme, pas le produit.)`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_nombres-relatifs-4e_P1'] },
  },
  {
    id: 'nr4-e2',
    skill: 'produit',
    title: 'Signes contraires',
    prompt: `Combien fait 9 × ${fmtParen(-7)} ?`,
    options: [`${fmt(-63)}`, '63', `${fmt(-16)}`, '16'],
    cols: 4,
    requires: ['regle-des-signes'],
    explain: `9 × 7 = 63, et des signes contraires donnent un produit négatif : ${fmt(-63)}.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_nombres-relatifs-4e_P1'] },
  },
  {
    id: 'nr4-e3',
    skill: 'produit',
    title: 'Pourquoi la règle',
    prompt: `Pourquoi ${fmt(-5)} × ${fmt(-2)} vaut-il 10, et non ${fmt(-10)} ?`,
    options: [
      'Parce que c’est la seule valeur qui prolonge la table sans casser sa régularité',
      'Parce que les mathématiciens en ont décidé ainsi',
      'Parce que deux barres « − » forment un « + » à l’écrit',
      'Parce qu’un produit ne peut jamais être négatif',
    ],
    cols: 1,
    requires: ['regularite-table', 'regle-des-signes'],
    explain: 'La colonne de −5 monte de 5 en 5 quand on descend : …, −10, −5, 0, puis nécessairement 5, puis 10. Toute autre valeur briserait un écart constant qui vaut pour toute la table.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_nombres-relatifs-4e_P2'] },
  },
  {
    id: 'nr4-e4',
    skill: 'parite',
    title: 'Trois facteurs',
    prompt: `Quel est le signe de ${fmt(-2)} × ${fmtParen(-3)} × ${fmtParen(-4)} ?`,
    options: [
      'Négatif : 3 facteurs négatifs, c’est impair',
      'Positif : les négatifs s’annulent deux par deux',
      'Positif : il y a plusieurs facteurs négatifs',
      'Nul',
    ],
    cols: 1,
    requires: ['parite-facteurs'],
    explain: `Trois facteurs négatifs, et 3 est impair : le produit est négatif (il vaut ${fmt(produit([-2, -3, -4]))}). « S’annuler deux par deux » ne marche que s’il en reste zéro.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_nombres-relatifs-4e_P3'] },
  },
  {
    id: 'nr4-e5',
    skill: 'parite',
    title: 'Quatre facteurs',
    prompt: `Combien fait ${fmt(-1)} × ${fmtParen(-2)} × ${fmtParen(-1)} × ${fmtParen(-5)} ?`,
    options: ['10', `${fmt(-10)}`, '9', `${fmt(-9)}`],
    cols: 4,
    requires: ['parite-facteurs', 'regle-des-signes'],
    explain: `Les valeurs : 1 × 2 × 1 × 5 = 10. Les signes : quatre facteurs négatifs, c’est pair, donc positif. Résultat : ${fmt(produit([-1, -2, -1, -5]))}.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_nombres-relatifs-4e_P3'] },
  },
  {
    id: 'nr4-e6',
    skill: 'quotient',
    title: 'Un quotient',
    prompt: `Combien fait ${fmt(-72)} ÷ ${fmtParen(-9)} ?`,
    options: ['8', `${fmt(-8)}`, `${fmt(-81)}`, '81'],
    cols: 4,
    requires: ['quotient-relatifs'],
    explain: `72 ÷ 9 = 8, et deux nombres de même signe donnent un quotient positif : ${fmt(diviser(-72, -9))}.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_nombres-relatifs-4e_P4'] },
  },
  {
    id: 'nr4-e7',
    skill: 'quotient',
    title: 'Le diviseur nul',
    prompt: 'Que peut-on dire de 7 ÷ 0 ?',
    options: [
      'Ce calcul n’a pas de résultat',
      'Il vaut 0',
      'Il vaut 7',
      'Il vaut l’infini négatif',
    ],
    cols: 1,
    requires: ['quotient-relatifs'],
    explain: 'Diviser par 0 reviendrait à chercher un nombre qui, multiplié par 0, donne 7. Or tout nombre multiplié par 0 donne 0 : aucun ne convient. (0 ÷ 7, en revanche, vaut bien 0.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_nombres-relatifs-4e_P4'] },
  },
  {
    id: 'nr4-e8',
    skill: 'ordre',
    title: 'Un enchaînement',
    prompt: `Combien fait 6 + ${fmtParen(-5)} × ${fmtParen(-2)} ?`,
    options: ['16', `${fmt(-2)}`, `${fmt(16)} seulement si on calcule de gauche à droite`, '4'],
    cols: 2,
    requires: ['priorites-relatifs', 'regle-des-signes'],
    explain: `La multiplication d’abord : ${fmt(-5)} × ${fmtParen(-2)} = 10 (deux négatifs → positif). Puis 6 + 10 = ${fmt(evaluer([6, '+', -5, '×', -2]))}. De gauche à droite, on trouverait ${fmt(-2)} : c’est l’erreur classique.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_nombres-relatifs-4e_P5'] },
  },
  {
    id: 'nr4-e9',
    skill: 'ordre',
    title: 'Division et soustraction',
    prompt: `Combien fait ${fmt(-4)} − 18 ÷ ${fmtParen(-3)} ?`,
    options: ['2', `${fmt(-10)}`, `${fmt(-2)}`, `${fmt(22)}`],
    cols: 4,
    requires: ['priorites-relatifs', 'quotient-relatifs'],
    explain: `La division d’abord : 18 ÷ ${fmtParen(-3)} = ${fmt(-6)}. Puis ${fmt(-4)} − ${fmtParen(-6)} = ${fmt(-4)} + 6 = ${fmt(evaluer([-4, '−', 18, '÷', -3]))}. Retirer un négatif fait augmenter.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_nombres-relatifs-4e_P5'] },
  },
  {
    id: 'nr4-e10',
    skill: 'ordre',
    title: 'Prévoir le signe',
    prompt: `Sans poser le calcul : quel est le signe de ${fmt(-3)} × ${fmtParen(-2)} × ${fmtParen(-5)} × ${fmtParen(2)} ?`,
    options: [
      'Négatif : trois facteurs négatifs, un nombre impair',
      'Positif : il y a autant de positifs que de négatifs',
      'Positif : il y a quatre facteurs en tout, un nombre pair',
      'On ne peut pas le savoir sans calculer',
    ],
    cols: 1,
    requires: ['controle-du-signe', 'parite-facteurs'],
    explain: `On ne compte QUE les facteurs négatifs : il y en a trois, c’est impair, donc le produit est négatif (il vaut ${fmt(produit([-3, -2, -5, 2]))}). Le nombre total de facteurs n’entre pas en jeu.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_nombres-relatifs-4e_P6'] },
  },
];

export default function Module06MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : la table"
      moduleSubtitle="Dix épreuves pour prouver que tu maîtrises les opérations sur les relatifs"
      estimatedTime="9 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître de la table',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune, décide d’abord du{' '}
            <strong>signe</strong>, puis calcule la valeur.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '✖️', label: 'Même signe', value: 'produit positif' },
        { id: 'r2', emoji: '➗', label: 'Signes contraires', value: 'produit négatif' },
        { id: 'r3', emoji: '🔢', label: 'Négatifs', value: 'pair → +, impair → −' },
        { id: 'r4', emoji: '🧮', label: 'Priorités', value: '× et ÷ d’abord' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître de la table !',
        title: 'Mission accomplie',
        message: 'Tu sais multiplier, diviser et enchaîner les opérations sur les nombres relatifs.',
        verbs: ['Multiplier', 'Compter', 'Diviser', 'Enchaîner'],
        masterBadgeLabel: 'Maître de la table',
      }}
    />
  );
}
