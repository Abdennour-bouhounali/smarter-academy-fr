import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CoefficientDial from '../components/CoefficientDial';

/**
 * Module 5 — MANIPULATION : le coefficient multiplicateur k = 1 + t.
 *
 * L'axe de CoefficientDial place 1 au centre. C'est le geste qui compte :
 * en passant d'un taux positif à un taux négatif, l'élève voit le curseur
 * traverser 1, et non 0. Les erreurs visées (−20 % → ×0,2, ou ×(−0,2))
 * deviennent visiblement impossibles : elles enverraient le curseur hors de
 * l'axe ou du bon côté.
 *
 * PÉRIMÈTRE : on installe le coefficient d'UNE évolution. Le PRODUIT de
 * plusieurs coefficients et l'évolution réciproque appartiennent à la leçon
 * « Évolutions successives et réciproques » — annoncée au pied du module.
 */
export default function Module05LeCoefficientMultiplicateur() {
  const [rate, setRate] = useState(0.2);
  const [seen, setSeen] = useState(() => new Set([0.2]));
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  // Il faut avoir vu une hausse, une baisse ET le cas neutre : c'est le
  // passage par k = 1 qui fait comprendre l'axe.
  const hasUp = [...seen].some((r) => r > 0);
  const hasDown = [...seen].some((r) => r < 0);
  const hasZero = seen.has(0);
  const done1 = hasUp && hasDown && hasZero;

  const change = (r, react) => {
    setRate(r);
    const next = new Set(seen); next.add(r); setSeen(next);
    const up = [...next].some((x) => x > 0);
    const down = [...next].some((x) => x < 0);
    if (!done1 && up && down && next.has(0)) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Un taux, un coefficient',
      subtitle: 'Essaie une hausse, une baisse, et 0 %. Regarde où se place le curseur par rapport à 1.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <CoefficientDial rate={rate} onChange={(r) => change(r, kit.react)} initial={200} />
          {done1 ? (
            <Feedback tone="ok">
              Le pivot est <strong>1</strong>, pas 0. Une hausse donne <strong>k &gt; 1</strong>, une baisse
              {' '}<strong>0 &lt; k &lt; 1</strong>, et 0 % donne exactement k = 1. Un coefficient multiplicateur
              est <strong>toujours positif</strong> : « −20 % » se traduit par ×0,80, jamais par ×0,20 ni ×(−0,20).
              {' '}<span className="text-slate-500">Continue à glisser : le curseur traverse 1, jamais 0.</span>
            </Feedback>
          ) : (
            <Feedback tone="info">
              {!hasUp ? 'Essaie une hausse. ' : ''}{!hasDown ? 'Essaie une baisse. ' : ''}{!hasZero ? 'Et 0 %.' : ''}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Du taux au coefficient',
      done: q2,
      content: (
        <BatchChoiceQuestion
          intro={(
            <div className="space-y-2">
              <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-center">
                <MathText>{'$$k = 1 + t \\qquad V_{\\text{finale}} = V_{\\text{initiale}} \\times k$$'}</MathText>
              </div>
              <p className="text-sm font-semibold text-slate-700">Quel coefficient multiplicateur pour chaque évolution ?</p>
            </div>
          )}
          rows={[
            { id: 'c1', label: 'Hausse de 12 %', options: ['×1,12', '×0,12', '×12'], correct: 0, correction: '1 + 0,12 = 1,12' },
            { id: 'c2', label: 'Baisse de 12 %', options: ['×0,12', '×0,88', '×−0,12'], correct: 1, correction: '1 − 0,12 = 0,88' },
            { id: 'c3', label: 'Hausse de 100 %', options: ['×1', '×2', '×100'], correct: 1, correction: '1 + 1 = 2 : la valeur double' },
            { id: 'c4', label: 'Baisse de 100 %', options: ['×0', '×0,01', '×−1'], correct: 0, correction: '1 − 1 = 0 : il ne reste rien' },
            { id: 'c5', label: 'Hausse de 3,5 %', options: ['×1,35', '×1,035', '×3,5'], correct: 1, correction: '1 + 0,035 = 1,035 — attention au chiffre des centièmes' },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Les cinq.' : `${nCorrect} sur ${total}.`} Toujours <strong>1 + t</strong>, avec t en écriture
              décimale : 3,5 % vaut 0,035, donc k = 1,035 (et non 1,35, qui serait +35 %).
            </Feedback>
          )}
          solved={q2} onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Du coefficient au taux',
      done: q3,
      content: (
        <TapQuestion
          prompt="Un prix est multiplié par 0,94. Quelle évolution cela représente-t-il ?"
          options={['Une baisse de 6 %', 'Une baisse de 94 %', 'Une hausse de 94 %', 'Une baisse de 0,94 %']}
          correct={0} cols={2}
          explain="t = k − 1 = 0,94 − 1 = −0,06, soit une baisse de 6 %. Le coefficient dit ce qui RESTE (94 %), le taux dit ce qu’on a PERDU (6 %)."
          explainWrong="0,94 est proche de 1 : le changement est donc petit. Ce qui reste, c’est 94 % ; ce qui a disparu, c’est 6 %. Le taux est t = k − 1 = −0,06."
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Appliquer une évolution',
      done: q4,
      content: (
        <NumericQuestion
          prompt="Un loyer de 640 € augmente de 3,5 %. Quel est le nouveau loyer, en euros ?"
          expected={662.4} suffix="€"
          explain="640 × 1,035 = 662,40 €. On multiplie par le coefficient, une seule opération."
          explainFor={(n) => (n === 22.4
            ? '22,40 € est l’AUGMENTATION (640 × 0,035). Le nouveau loyer est 640 + 22,40 = 662,40 €, soit 640 × 1,035.'
            : n === 864
              ? 'Tu as utilisé k = 1,35, qui correspond à +35 %. Ici t = 3,5 % = 0,035, donc k = 1,035.'
              : '640 × (1 + 0,035) = 640 × 1,035 = 662,40 €.')}
          solved={q4} onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Le coefficient multiplicateur" moduleSubtitle="k = 1 + t, le nombre par lequel on multiplie" estimatedTime="10 min"
      brief={{
        tag: 'Manipulation', title: 'Le pivot est 1', tone: 'cyan',
        body: <p>Un taux d’évolution se lit, mais ne se multiplie pas. Le coefficient, si. Règle le taux et regarde le curseur se placer par rapport à 1.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Une porte ouverte.</strong> Un coefficient est un simple facteur — donc plusieurs évolutions
          successives se ramèneront à un <em>produit</em>, et l’on pourra même revenir en arrière.
          C’est la leçon « Évolutions successives et réciproques ».
        </KnowledgeSnapshot>
      )}
    />
  );
}
