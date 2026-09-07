import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TrailLab from '../components/TrailLab';
import VariationTable from '../components/VariationTable';
import { ENCLOS, ENCLOS_RANGE, makeFunction, parseDec, formatDec } from '../components/variationsUtils';

/** Module 6 — LABORATOIRE D'ENTRAÎNEMENT : optimiser. L'enclos (aire maximale), un coût minimal donné par un tableau. */
const COUT = makeFunction('C', (q) => 0.02 * (q - 40) ** 2 + 6, { domain: [0, 100], turns: [40], unit: ' €' });

export default function Module06AtelierOptimiser() {
  const [q1, setQ1] = useState(false); const [q2, setQ2] = useState(false); const [q3a, setQ3a] = useState(false); const [q3b, setQ3b] = useState(false); const [q4, setQ4] = useState(false);
  const steps = [
    {
      num: 1, title: 'L’enclos', subtitle: 'On dispose de 40 m de clôture pour un enclos rectangulaire de largeur x (en m).', done: q1,
      content: (
        <TapQuestion prompt="Quelle est l’aire A(x) de l’enclos, en fonction de x ?"
          options={['A(x) = x(20 − x)', 'A(x) = x(40 − x)', 'A(x) = 40x', 'A(x) = x²']} correct={0} cols={2}
          explain="Périmètre 40 : 2 × (largeur + longueur) = 40, donc longueur = 20 − x. Aire = x(20 − x), pour 0 ≤ x ≤ 20."
          explainWrong="Deux largeurs et deux longueurs font 40 m : x + longueur = 20, longueur = 20 − x. L’aire est largeur × longueur = x(20 − x)."
          solved={q1} onAnswered={() => setQ1(true)} />
      ),
    },
    {
      num: 2, title: 'Les variations de l’aire', done: q2,
      content: (
        <BatchChoiceQuestion intro={<div className="space-y-2"><TrailLab f={ENCLOS} range={ENCLOS_RANGE} unit={15} unitY={2.2} xStep={1} yStep={20} value={10} paintAll showTurns="all" frozen axisLabels={{ x: 'x', y: 'A' }} xUnit=" m" yUnit=" m²" labelEvery={2} /><VariationTable f={ENCLOS} unit=" m²" /></div>}
          rows={[
            { id: 'r1', label: 'A est croissante sur', options: ['[0 ; 10]', '[10 ; 20]', '[0 ; 20]'], correct: 0, correction: 'la flèche ↗' },
            { id: 'r2', label: 'Le maximum de A', options: ['100 m², atteint en x = 10', '10 m²', '100 m², atteint en x = 20'], correct: 0, correction: 'le sommet' },
            { id: 'r3', label: 'L’enclos d’aire maximale est', options: ['un carré de 10 m de côté', 'un rectangle 5 m × 15 m', 'le plus long possible'], correct: 0, correction: 'largeur 10, longueur 20 − 10 = 10' },
            { id: 'r4', label: 'A(5) et A(15)', options: ['sont égales (75 m²)', 'A(5) < A(15)', 'A(5) > A(15)'], correct: 0, correction: 'symétrie de la parabole' },
          ]}
          feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Optimiser, c’est lire un extremum sur un tableau de variations : l’aire est maximale (100 m²) pour x = 10, l’enclos carré.</Feedback>}
          solved={q2} onAnswered={() => setQ2(true)} />
      ),
    },
    {
      num: 3, title: 'Calculer pour vérifier', done: q3a && q3b,
      content: (
        <div className="space-y-4">
          <NumericQuestion prompt={<span>Calcule A(5), en m². (<MathText>{'$A(x) = x(20 - x)$'}</MathText>)</span>} expected={75} parse={parseDec} display={formatDec(75)}
            explain={<span>A(5) = 5 × 15 = <strong>75</strong> m². Moins que 100 : cohérent avec le maximum.</span>}
            explainFor={(n) => (n === 100 ? '100 est le maximum, atteint en 10. Pour x = 5 : 5 × (20 − 5) = 75.' : n === 15 ? '15 est la longueur ; l’aire est 5 × 15 = 75.' : 'A(5) = 5 × (20 − 5) = 75.')}
            solved={q3a} onAnswered={() => setQ3a(true)} />
          {q3a && (
            <NumericQuestion prompt="Quelle largeur x (en m) donne l’aire maximale ?" expected={10} parse={parseDec} display={formatDec(10)}
              explain={<span>Le maximum de A est atteint en x = <strong>10</strong> : un carré 10 × 10, aire 100 m².</span>}
              explainFor={(n) => (n === 100 ? '100 est l’aire maximale, pas la largeur. Elle est atteinte pour x = 10.' : n === 20 ? 'Pour x = 20, la longueur vaut 0 : aire nulle. Le maximum est au milieu, x = 10.' : 'Le tableau place le maximum en x = 10.')}
              solved={q3b} onAnswered={() => setQ3b(true)} />
          )}
        </div>
      ),
    },
    {
      num: 4, title: 'Un coût minimal', done: q4,
      content: (
        <TapQuestion above={<div className="space-y-2"><p className="text-sm text-slate-700">Le coût de fabrication unitaire C (en €) selon la quantité q produite (en centaines), sur [0 ; 100], est donné par son tableau :</p><VariationTable f={COUT} unit=" €" /></div>}
          prompt="Pour quelle quantité le coût unitaire est-il minimal, et que vaut-il ?"
          options={['q = 40, coût 6 €', 'q = 0, coût 38 €', 'q = 100, coût 78 €', 'q = 6, coût 40 €']} correct={0} cols={2}
          explain="Le tableau descend jusqu’à q = 40 puis remonte : le minimum est 6 €, atteint pour q = 40. Produire moins ou plus coûte plus cher à l’unité."
          explainWrong="Le minimum est la plus petite valeur de la ligne du bas : 6 €, sous q = 40 (la vallée). Ne confonds pas la valeur (6 €) et l’endroit (q = 40)."
          solved={q4} onAnswered={() => setQ4(true)} />
      ),
    },
  ];
  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6}
      moduleTitle="Atelier : optimiser" moduleSubtitle="Chercher un maximum ou un minimum, c’est optimiser" estimatedTime="13 min"
      brief={{ tag: 'Atelier', title: 'L’enclos et le coût', tone: 'rose', body: <p>Modéliser la situation par une fonction, dresser ou lire son tableau de variations, lire l’extremum — et dire où il est atteint.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6}>Il ne reste qu’à le prouver : la mission finale. Dix épreuves, une seule validation.</KnowledgeSnapshot>} />
  );
}
