import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TankLab from '../components/TankLab';
import { affine, solveEq, solveIneq, intervalText, parseDec, formatDec } from '../components/affineUtils';

/**
 * Module 5 — MANIPULATION : signe, équations, inéquations.
 * Le réservoir V(t) = −4t + 30 se vide : vide quand V(t) = 0 (t = 7,5) ; à moitié
 * (20 L) quand V(t) = 20 ; encore plus de 10 L tant que V(t) > 10 — une inéquation
 * dont le sens s'inverse en divisant par a < 0.
 */
const V = affine(-4, 30);
export default function Module05SigneEquationsInequations() {
  const [q1, setQ1] = useState(false); const [q2, setQ2] = useState(false); const [q3, setQ3] = useState(false); const [q4, setQ4] = useState(false);
  const steps = [
    {
      num: 1, title: 'Quand le réservoir est-il vide ?', subtitle: 'V(t) = −4t + 30 : on vide à 4 L/min à partir de 30 L.', done: q1,
      content: (
        <NumericQuestion above={<TankLab a={-4} b={30} t={0} lockA lockB lockT frozen />} prompt="À quel instant t (en min) V(t) = 0 ?" expected={7.5} parse={parseDec} display={formatDec(7.5)}
          explain={<span>−4t + 30 = 0 ⟺ 4t = 30 ⟺ t = <strong>7,5</strong> min. C’est le zéro de V : −b/a = −30/(−4).</span>}
          explainFor={(n) => (n === 30 ? '30 est le volume de départ. Résous −4t + 30 = 0 : 4t = 30, t = 7,5.' : n === -7.5 ? 'Signe : −4t = −30 donne t = 7,5 (positif).' : n === 26 ? 'Tu as soustrait 4 de 30. Le débit est 4 L par minute : 30 ÷ 4 = 7,5 minutes.' : '−4t + 30 = 0 ⟺ t = 30 ÷ 4 = 7,5.')}
          solved={q1} onAnswered={() => setQ1(true)} />
      ),
    },
    {
      num: 2, title: 'Le signe de V', done: q2,
      content: (
        <BatchChoiceQuestion intro={<p className="text-sm text-slate-700">V(t) = −4t + 30, zéro en 7,5.</p>}
          rows={[
            { id: 'r1', label: 'V(5)', options: ['positif', 'négatif', 'nul'], correct: 0, correction: 'avant le zéro, signe contraire à a' },
            { id: 'r2', label: 'V(9)', options: ['négatif : le modèle ne décrit plus rien, le réservoir est déjà vide', 'positif', 'nul'], correct: 0, correction: 'après le zéro, signe de a' },
            { id: 'r3', label: 'V(t) > 0 pour', options: ['t < 7,5', 't > 7,5', 'tout t'], correct: 0, correction: 'a < 0 : + à gauche du zéro' },
            { id: 'r4', label: 'Tableau de signes de V', options: ['+ avant 7,5, 0, − après', '− avant 7,5, 0, + après', '+ partout'], correct: 0, correction: 'signe de a à droite' },
          ]}
          feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} ax + b : zéro en −b/a, signe de a à droite du zéro, signe contraire à gauche. Ici a = −4 &lt; 0 : positif avant 7,5, négatif après.</Feedback>}
          solved={q2} onAnswered={() => setQ2(true)} />
      ),
    },
    {
      num: 3, title: 'Une équation', done: q3,
      content: (
        <NumericQuestion prompt="À quel instant reste-t-il exactement 20 L ? (résous V(t) = 20)" expected={2.5} parse={parseDec} display={formatDec(2.5)}
          explain={<span>−4t + 30 = 20 ⟺ −4t = −10 ⟺ t = <strong>2,5</strong> min. Vérification : −4 × 2,5 + 30 = 20 ✓.</span>}
          explainFor={(n) => (n === -2.5 ? '−4t = −10 : diviser deux négatifs donne un positif, t = 2,5.' : n === 12.5 ? 'Tu as ajouté 20 au lieu de le soustraire : −4t = 20 − 30 = −10, t = 2,5.' : n === 10 ? '10 = 30 − 20 est ce qu’il faut vider ; à 4 L/min, cela prend 10 ÷ 4 = 2,5 min.' : '−4t + 30 = 20 ⟺ −4t = −10 ⟺ t = 2,5.')}
          solved={q3} onAnswered={() => setQ3(true)} />
      ),
    },
    {
      num: 4, title: 'Une inéquation', done: q4,
      content: (
        <TapQuestion prompt={<span>Pendant combien de temps reste-t-il <strong>plus de 10 L</strong> ? (résous <MathText>{'$-4t + 30 > 10$'}</MathText>)</span>}
          options={['t < 5 : de 0 à 5 min', 't > 5', 't < −5', 't > −5']}
          correct={0} cols={2}
          explain={<span>−4t + 30 &gt; 10 ⟺ −4t &gt; −20 ⟺ t &lt; 5 : en divisant par −4 (négatif), <strong>le sens de l’inégalité s’inverse</strong>. Solutions : {intervalText(solveIneq(V, 10, '>'))}, donc de 0 à 5 min dans la situation. Vérification : V(3) = 18 &gt; 10 ✓, V(6) = 6 &lt; 10.</span>}
          explainWrong="−4t > −20 : on divise par −4, négatif, donc on RETOURNE l’inégalité : t < 5. Teste t = 3 : V(3) = 18 > 10 ✓ ; t = 6 : V(6) = 6, non. Le réservoir se vide : c’est au début qu’il reste plus de 10 L."
          solved={q4} onAnswered={() => setQ4(true)} />
      ),
    },
  ];
  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Signe, équations, inéquations" moduleSubtitle="Vide ? À moitié ? Plus de 10 L ? Résoudre avec ax + b" estimatedTime="10 min"
      brief={{ tag: 'Manipulation', title: 'Le réservoir se vide', tone: 'cyan', body: <p>V(t) = −4t + 30. Quand est-il vide ? Quand reste-t-il 20 L ? Pendant combien de temps plus de 10 L ? Le zéro, le signe, une équation, une inéquation.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5}>Module suivant : un abonnement, un téléphérique, une bougie — reconnaître a et b dans la vraie vie.</KnowledgeSnapshot>} />
  );
}
