import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import { numericChain, symbolicChain, formatPoly } from '../components/litteralUtils';

/**
 * Module 7 — Boss Final « Le magicien » (kit, QCM). DONNÉES.
 * Distracteurs = pièges des modules 1–6 : « des essais prouvent » (M1) ·
 * 3x² + 2x = 5x³ (M2) · (a + b)² = a² + b² (M3) · signe du double produit (M3) ·
 * facteur commun incomplet (M4) · « … + 9 » pas factorisé (M4) · mauvaise
 * forme pour la question (M5) · simplifier des termes au lieu de facteurs (M6).
 * Couverture : P1 → e1, e2 · P2 → e3 · P3 → e4, e5 · P4 → e6, e7 · P5 → e8 · P6 → e9, e10.
 */
const T1 = [{ op: 'mul', k: 3 }, { op: 'add', k: 9 }, { op: 'div', k: 3 }, { op: 'subx' }];
const tex = (o) => <MathText>{o}</MathText>;
const P = (...n) => n.map((i) => `seconde_calcul-litteral-2nde_P${i}`);
const REGISTRE = [
  { id: 'tour', emoji: '🎩', label: 'Tour', value: 'toujours 3' },
  { id: 'carre', emoji: '📐', label: 'Carré', value: 'a² + 2ab + b²' },
  { id: 'facteur', emoji: '🔎', label: 'Facteur', value: '(x + 1)' },
  { id: 'formes', emoji: '🧭', label: 'Formes', value: '3 usages' },
];
const SKILLS = {
  expression: { label: 'Expression littérale et égalité pour tout x', module: 1 },
  reduire: { label: 'Réduire', module: 2 },
  developper: { label: 'Développer', module: 3 },
  factoriser: { label: 'Factoriser', module: 4 },
  choisir: { label: 'Choisir la forme', module: 5 },
  demontrer: { label: 'Démontrer et résoudre', module: 6 },
};
const EPREUVES = [
  { id: 'cl2-e1', skill: 'expression', title: 'Épreuve 1', prompt: 'Un programme de calcul donne 3 pour dix nombres essayés. Que peut-on conclure ?', options: ['Rien de sûr : il faut suivre le programme avec une lettre x pour le prouver pour tous les nombres', 'Qu’il donne toujours 3', 'Qu’il donne 3 pour les nombres entiers seulement', 'Qu’il faut essayer cent nombres'], cols: 1, correct: 0, explain: 'Des essais constatent, la lettre prouve : (3x + 9) ÷ 3 − x = 3 pour tout x. Dix ou cent essais ne couvrent jamais tous les nombres.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_calcul-litteral-2nde_P1'] } },
  { id: 'cl2-e2', skill: 'expression', title: 'Épreuve 2', prompt: 'Que vaut 2x² − 3x pour x = −2 ?', options: ['14', '2', '−14', '−2'], cols: 4, correct: 0, explain: '2 × (−2)² − 3 × (−2) = 2 × 4 + 6 = 14. Le carré d’un négatif est positif ; − 3 × (−2) = + 6.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_calcul-litteral-2nde_P1'] } },
  { id: 'cl2-e3', skill: 'reduire', title: 'Épreuve 3', prompt: 'Réduis 5x² − 3x + 4 − 2x² + 3x − 7.', options: ['$3x^{2} - 3$', '$3x^{2} - 6x - 3$', '$3x^{4} - 3$', '$3x^{2} + 3$'], renderOption: tex, optionLabel: (i) => ['3x² − 3', '3x² − 6x − 3', '3x⁴ − 3', '3x² + 3'][i], cols: 4, correct: 0, explain: 'Trois piles : x² (5 − 2 = 3), x (−3 + 3 = 0, la pile disparaît), nombres (4 − 7 = −3). Les exposants ne s’additionnent jamais.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_calcul-litteral-2nde_P2'] } },
  { id: 'cl2-e4', skill: 'developper', title: 'Épreuve 4', prompt: 'Développe (x − 4)².', options: ['$x^{2} - 8x + 16$', '$x^{2} - 16$', '$x^{2} + 16$', '$x^{2} - 4x + 16$'], renderOption: tex, optionLabel: (i) => ['x² − 8x + 16', 'x² − 16', 'x² + 16', 'x² − 4x + 16'][i], cols: 2, correct: 0, explain: '(a − b)² = a² − 2ab + b² : x² − 2 · x · 4 + 16. Il y a deux rectangles ab, donc −8x, et le coin +16.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_calcul-litteral-2nde_P3'] } },
  { id: 'cl2-e5', skill: 'developper', title: 'Épreuve 5', prompt: 'Développe (2x + 1)(x − 3).', options: ['$2x^{2} - 5x - 3$', '$2x^{2} - 3$', '$2x^{2} - 6x - 3$', '$2x^{2} + 5x - 3$'], renderOption: tex, optionLabel: (i) => ['2x² − 5x − 3', '2x² − 3', '2x² − 6x − 3', '2x² + 5x − 3'][i], cols: 2, correct: 0, explain: 'Quatre produits : 2x · x = 2x², 2x · (−3) = −6x, 1 · x = x, 1 · (−3) = −3 ; puis −6x + x = −5x.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_calcul-litteral-2nde_P3'] } },
  { id: 'cl2-e6', skill: 'factoriser', title: 'Épreuve 6', prompt: 'Factorise 6x² + 9x.', options: ['$3x(2x + 3)$', '$3(2x^{2} + 3x)$', '$x(6x + 9)$', '$3x(2x + 9)$'], renderOption: tex, optionLabel: (i) => ['3x(2x + 3)', '3(2x² + 3x)', 'x(6x + 9)', '3x(2x + 9)'][i], cols: 2, correct: 0, explain: 'Le plus grand facteur commun est 3x : 6x² = 3x · 2x et 9x = 3x · 3. Sortir seulement 3 ou seulement x laisse un facteur commun dans la parenthèse.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_calcul-litteral-2nde_P4'] } },
  { id: 'cl2-e7', skill: 'factoriser', title: 'Épreuve 7', prompt: 'Factorise (x − 2)(x + 5) − (x − 2)(2x − 1).', options: ['$(x - 2)(6 - x)$', '$(x - 2)(3x + 4)$', '$(x - 2)^{2}$', '$(x + 5)(2x - 1)$'], renderOption: tex, optionLabel: (i) => ['(x − 2)(6 − x)', '(x − 2)(3x + 4)', '(x − 2)²', '(x + 5)(2x − 1)'][i], cols: 2, correct: 0, explain: 'Facteur commun (x − 2) ; il reste (x + 5) − (2x − 1) = x + 5 − 2x + 1 = 6 − x. Attention au signe − devant toute la seconde parenthèse.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_calcul-litteral-2nde_P4'] } },
  { id: 'cl2-e8', skill: 'choisir', title: 'Épreuve 8', prompt: 'C(x) = x² − 9 = (x − 3)(x + 3). Pour trouver les x tels que C(x) = 0, la forme utile est :', options: ['La forme factorisée : (x − 3)(x + 3) = 0 ⇔ x = 3 ou x = −3', 'La forme développée', 'Les deux se valent', 'Aucune : il faut tester des valeurs'], cols: 1, correct: 0, explain: 'Un produit nul se lit facteur par facteur : x = 3 ou x = −3. La forme développée, elle, sert à calculer C(0) = −9 d’un coup d’œil.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_calcul-litteral-2nde_P5'] } },
  { id: 'cl2-e9', skill: 'demontrer', title: 'Épreuve 9', prompt: 'Pour prouver que (n + 1)² − (n − 1)² est un multiple de 4 pour tout entier n, on développe et on trouve :', options: ['4n, donc multiple de 4', '2n² + 2, donc pair', '4n², donc multiple de 4', '2, toujours'], cols: 2, correct: 0, explain: '(n + 1)² − (n − 1)² = (n² + 2n + 1) − (n² − 2n + 1) = 4n : multiple de 4 pour tout n. (Ou a² − b² = (a − b)(a + b) = 2 × 2n.)', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_calcul-litteral-2nde_P6'] } },
  { id: 'cl2-e10', skill: 'demontrer', title: 'Épreuve 10', prompt: 'Pour x ≠ 3, que vaut (x² − 9)/(x − 3) ?', options: ['x + 3', 'x − 3', 'x² − 3', '−3'], cols: 4, correct: 0, explain: 'Factoriser : x² − 9 = (x − 3)(x + 3). Le facteur (x − 3) se simplifie (x ≠ 3) : il reste x + 3. On simplifie des facteurs, jamais des termes.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_calcul-litteral-2nde_P6', 'seconde_calcul-litteral-2nde_P4'] } },
];
const BADGES = [
  { id: 'b-expr', emoji: '🎩', label: 'Expressions sans faute', test: (m) => !m.expression },
  { id: 'b-red', emoji: '🧱', label: 'Réduire sans faute', test: (m) => !m.reduire },
  { id: 'b-dev', emoji: '📐', label: 'Développer sans faute', test: (m) => !m.developper },
  { id: 'b-fac', emoji: '🔎', label: 'Factoriser sans faute', test: (m) => !m.factoriser },
  { id: 'b-dem', emoji: '🧠', label: 'Choisir et démontrer sans faute', test: (m) => !m.choisir && !m.demontrer },
  { id: 'b-perfect', emoji: '💎', label: 'Dix sur dix', test: (m) => Object.values(m).every((v) => !v) },
];
function Synthese() {
  const syms = symbolicChain(T1);
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1"><h2 className="text-xl font-space font-extrabold text-slate-900">Synthèse : le tour de magie, démontré</h2><p className="text-sm text-slate-500">La chaîne en x, figée — et la même chaîne pour −7.</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {['nombre de départ', '× 3', '+ 9', '÷ 3', '− le nombre'].map((l, i) => (
          <div key={l} className={`rounded-2xl border-2 p-2.5 ${i === 4 ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
            <div className={`font-mono ${i === 0 ? 'text-[11px] font-bold uppercase text-slate-500' : 'text-lg font-extrabold text-indigo-700'}`}>{l}</div>
            <div className="font-mono font-extrabold text-emerald-800">{formatPoly(syms[i])}</div>
            <div className="font-mono text-sm text-slate-700">{numericChain(T1, -7)[i]}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <Feedback tone="info"><strong>Expression.</strong> Une lettre suit tous les nombres ; deux écritures égales pour tout x sont la même expression. Tester constate, le calcul prouve.</Feedback>
        <Feedback tone="info"><strong>Réduire / développer.</strong> Termes semblables seulement ; (a ± b)² = a² ± 2ab + b², (a + b)(a − b) = a² − b².</Feedback>
        <Feedback tone="info"><strong>Factoriser.</strong> Le plus grand facteur commun (nombre, monôme, binôme) ou une identité ; le résultat est un PRODUIT.</Feedback>
        <Feedback tone="info"><strong>Choisir.</strong> Développée pour A(0), factorisée pour « = 0 », carré + constante pour le minimum. Simplifier des facteurs, jamais des termes.</Feedback>
      </div>
    </div>
  );
}
export default function Module07MissionFinale() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7}
      moduleTitle="🏆 Mission finale : le magicien" moduleSubtitle="Dix épreuves pour prouver qu’aucune écriture ne te trompe." estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG} timerSeconds={600} timerLabel="10 min" xpPerCorrect={10}
      brief={{ tag: '🏆 Boss final', title: 'Le magicien te confie ses tours.', body: <p>Dix questions, aucune aide, une seule validation à la fin.</p> }}
      registre={REGISTRE} skills={SKILLS} epreuves={EPREUVES} badges={BADGES} synthese={<Synthese />}
      completion={{ masterTitle: 'Maître du calcul littéral', title: 'Leçon terminée', message: 'Tu sais réduire, développer, factoriser, choisir la forme utile — et démontrer avec une lettre.', verbs: ['Suivre x', 'Réduire', 'Développer', 'Factoriser'], masterBadgeLabel: 'Tous les badges débloqués' }} />
  );
}
