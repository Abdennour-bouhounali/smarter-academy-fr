import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import RealLine from '../../../../../common/components/RealLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — Boss Final « La fête foraine » (moteur du kit, QCM uniquement).
 * Fichier de DONNÉES.
 *
 * Épreuves écrites EN DERNIER : chaque distracteur encode un piège travaillé
 * dans les modules 1 à 6 —
 *   · −4 ∈ ℕ, ℤ ⊂ ℕ (M2) · ∩ pris pour ∪ (M2, M5)
 *   · crochet lu à l'envers (M1, M3) · la borne exclue crue incluse (M1, M3)
 *   · [a ; +∞] avec l'infini fermé (M3) · x ≥ a colorié vers −∞ (M4)
 *   · ≤ traduit par un crochet ouvert (M4) · « une infinité d'entiers » (M6)
 *   · intersection prise pour la réunion (M5) · « plus de » lu comme inclus (M6)
 *
 * Couverture des 5 LPs :
 *   P1 → e1, e2 · P2 → e3, e4 · P3 → e5, e6, e9 · P4 → e3, e4, e7, e8 ·
 *   P5 → e7, e8, e9, e10.
 */
const REGISTRE = [
  { id: 'manege', emoji: '🎡', label: 'Manège', value: '[1,2 ; 1,9[' },
  { id: 'boites', emoji: '📦', label: 'Boîtes', value: 'ℕ ⊂ ℤ ⊂ ℝ' },
  { id: 'inter', emoji: '∩', label: 'Intersection', value: ']2 ; 4]' },
  { id: 'infini', emoji: '∞', label: 'Infini', value: 'toujours [' },
];

const SKILLS = {
  ensembles: { label: 'Le langage des ensembles', module: 2 },
  lire: { label: 'Lire et représenter un intervalle', module: 3 },
  bornes: { label: 'Bornes et types d’intervalles', module: 3 },
  traduire: { label: 'Inégalité ↔ intervalle', module: 4 },
  croiser: { label: 'Intersection et réunion', module: 5 },
  situations: { label: 'Résoudre une situation', module: 6 },
};

const line = (props) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-1">
    <RealLine {...props} />
  </div>
);

const EPREUVES = [
  {
    id: 'ei-e1',
    skill: 'ensembles',
    title: 'Épreuve 1',
    prompt: 'Laquelle de ces affirmations est vraie ?',
    options: ['−4 ∈ ℕ', '−4 ∈ ℤ', '0 ∉ ℕ', 'ℤ ⊂ ℕ'],
    cols: 2,
    correct: 1,
    requires: ['vocab-appartenance', 'vocab-inclusion'],
    explain: '−4 est un entier négatif : il est dans ℤ, pas dans ℕ (les entiers naturels commencent à 0, donc 0 ∈ ℕ). C’est ℕ qui est inclus dans ℤ, pas l’inverse.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_ensembles-et-intervalles-2nde_P1'] },
  },
  {
    id: 'ei-e2',
    skill: 'ensembles',
    title: 'Épreuve 2',
    prompt: 'A = {1 ; 2 ; 3 ; 6} et B = {2 ; 3 ; 5}. Que vaut A ∩ B ?',
    options: ['{2 ; 3}', '{1 ; 2 ; 3 ; 5 ; 6}', '{1 ; 6}', '∅'],
    cols: 2,
    correct: 0,
    requires: ['vocab-intersection-reunion'],
    explain: 'L’intersection, ce sont les éléments communs : 2 et 3. {1 ; 2 ; 3 ; 5 ; 6} est la réunion A ∪ B ; {1 ; 6} sont les éléments de A qui ne sont pas dans B.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_ensembles-et-intervalles-2nde_P1'] },
  },
  {
    id: 'ei-e3',
    skill: 'lire',
    title: 'Épreuve 3',
    prompt: 'Quelle écriture correspond à l’ensemble colorié ?',
    extra: line({ min: -5, max: 4, step: 1, intervals: [{ id: 'I', from: -3, to: 1, openFrom: true, tone: 'indigo' }], ariaLabel: 'Intervalle de −3 exclu à 1 inclus' }),
    options: [']−3 ; 1]', '[−3 ; 1[', '[−3 ; 1]', ']−3 ; 1['],
    cols: 2,
    correct: 0,
    requires: ['intervalle', 'mem-borne'],
    explain: 'En −3, le crochet est tourné vers l’extérieur : −3 exclu. En 1, tourné vers le nombre : 1 inclus. ]−3 ; 1], semi-ouvert.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_ensembles-et-intervalles-2nde_P2', 'seconde_ensembles-et-intervalles-2nde_P4'] },
  },
  {
    id: 'ei-e4',
    skill: 'bornes',
    title: 'Épreuve 4',
    prompt: 'Lequel de ces nombres appartient à [−1 ; 2[ ?',
    options: ['2', '−1', '−1,5', '2,001'],
    cols: 4,
    correct: 1,
    requires: ['methode-appartenance-intervalle'],
    explain: '[−1 : la borne −1 est incluse. 2[ : 2 est exclu, et 2,001 est au-delà. −1,5 < −1 est avant la borne de gauche.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_ensembles-et-intervalles-2nde_P2', 'seconde_ensembles-et-intervalles-2nde_P4'] },
  },
  {
    id: 'ei-e5',
    skill: 'traduire',
    title: 'Épreuve 5',
    prompt: 'L’ensemble des nombres x tels que x ≥ −2 s’écrit :',
    options: ['[−2 ; +∞[', ']−2 ; +∞[', ']−∞ ; −2]', '[−2 ; +∞]'],
    cols: 2,
    correct: 0,
    requires: ['regle-signe-crochet', 'regle-sens-inegalite', 'demi-droite-infini'],
    explain: '« Plus grand ou égal » : −2 inclus (crochet fermé) et on regarde vers +∞. L’infini n’est pas un nombre : son crochet est toujours ouvert, jamais [−2 ; +∞].',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_ensembles-et-intervalles-2nde_P3'] },
  },
  {
    id: 'ei-e6',
    skill: 'traduire',
    title: 'Épreuve 6',
    prompt: 'x ∈ ]0 ; 4] signifie :',
    options: ['0 < x ≤ 4', '0 ≤ x < 4', '0 ≤ x ≤ 4', '0 < x < 4'],
    cols: 2,
    correct: 0,
    requires: ['regle-signe-crochet', 'methode-traduire'],
    explain: ']0 : 0 exclu, signe strict <. 4] : 4 inclus, signe large ≤. Donc 0 < x ≤ 4.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_ensembles-et-intervalles-2nde_P3'] },
  },
  {
    id: 'ei-e7',
    skill: 'bornes',
    title: 'Épreuve 7',
    prompt: 'Combien de nombres ENTIERS appartiennent à ]1 ; 5[ ?',
    options: ['3', '5', '4', 'Une infinité'],
    cols: 4,
    correct: 0,
    requires: ['methode-compter-entiers'],
    explain: 'Les bornes 1 et 5 sont exclues : restent 2, 3 et 4 — trois entiers. Il y a bien une infinité de NOMBRES dans ]1 ; 5[ (1,5 ; 2,75 ; …), mais seulement trois entiers.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_ensembles-et-intervalles-2nde_P4', 'seconde_ensembles-et-intervalles-2nde_P5'] },
  },
  {
    id: 'ei-e8',
    skill: 'croiser',
    title: 'Épreuve 8',
    prompt: 'I = [−1 ; 3] et J = [2 ; 6[. Que vaut I ∩ J ?',
    extra: line({ min: -2, max: 7, step: 1, intervals: [{ id: 'I', from: -1, to: 3, tone: 'sky', label: 'I' }, { id: 'J', from: 2, to: 6, openTo: true, tone: 'amber', label: 'J' }], ariaLabel: 'I = [−1 ; 3] et J = [2 ; 6[' }),
    options: ['[2 ; 3]', '[−1 ; 6[', ']2 ; 3]', '∅'],
    cols: 2,
    correct: 0,
    requires: ['intersection-intervalles', 'reunion-intervalles'],
    explain: 'La zone recouverte deux fois va de 2 à 3 ; 2 est inclus (J est fermé en 2) et 3 aussi (I est fermé en 3). [−1 ; 6[ est la réunion.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_ensembles-et-intervalles-2nde_P5', 'seconde_ensembles-et-intervalles-2nde_P4'] },
  },
  {
    id: 'ei-e9',
    skill: 'situations',
    title: 'Épreuve 9',
    prompt: 'Une piscine est chauffée à une température T d’au moins 26 °C et strictement inférieure à 29 °C. T appartient à :',
    options: ['[26 ; 29[', ']26 ; 29]', '[26 ; 29]', ']26 ; 29['],
    cols: 2,
    correct: 0,
    requires: ['methode-phrase-intervalle'],
    explain: '« Au moins 26 » : 26 inclus. « Strictement inférieure à 29 » : 29 exclu. [26 ; 29[.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_ensembles-et-intervalles-2nde_P5', 'seconde_ensembles-et-intervalles-2nde_P3'] },
  },
  {
    id: 'ei-e10',
    skill: 'situations',
    title: 'Épreuve 10',
    prompt: 'Manège : tailles dans [1,2 ; 1,9[. Grand huit : à partir de 1,40 m, sans limite. Quelles tailles t permettent de faire les deux ?',
    options: ['[1,4 ; 1,9[', '[1,2 ; +∞[', ']1,4 ; 1,9[', '[1,2 ; 1,4]'],
    cols: 2,
    correct: 0,
    requires: ['intersection-intervalles', 'methode-phrase-intervalle'],
    explain: 'Les deux à la fois : l’intersection de [1,2 ; 1,9[ et de [1,4 ; +∞[. « À partir de 1,40 » inclut 1,40 ; le manège exclut 1,90. [1,4 ; 1,9[.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_ensembles-et-intervalles-2nde_P5'] },
  },
];

const BADGES = [
  { id: 'b-ensembles', emoji: '📦', label: 'Langage des ensembles sans faute', test: (m) => !m.ensembles },
  { id: 'b-lire', emoji: '🔧', label: 'Crochets lus sans faute', test: (m) => !m.lire && !m.bornes },
  { id: 'b-traduire', emoji: '🔁', label: 'Traductions sans faute', test: (m) => !m.traduire },
  { id: 'b-croiser', emoji: '∩', label: 'Croisements sans faute', test: (m) => !m.croiser },
  { id: 'b-situations', emoji: '🎡', label: 'Situations sans faute', test: (m) => !m.situations },
  { id: 'b-perfect', emoji: '💎', label: 'Dix sur dix', test: (m) => Object.values(m).every((v) => !v) },
];


export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : la fête foraine"
      moduleSubtitle="Dix épreuves pour prouver qu’aucun crochet ne te trompe."
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: '🏆 Boss final',
        title: 'Le forain te confie tous ses panneaux.',
        body: <p>Dix questions, aucune aide, une seule validation à la fin. Tes réponses deviennent ton profil de maîtrise.</p>,
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître des crochets',
        title: 'Leçon terminée',
        message: 'Tu sais lire un ensemble, écrire un intervalle, le traduire en inégalité et croiser deux plages. La valeur absolue et les inéquations s’appuieront dessus.',
        verbs: ['Ranger', 'Lire', 'Traduire', 'Croiser'],
        masterBadgeLabel: 'Tous les badges débloqués',
      }}
    />
  );
}
