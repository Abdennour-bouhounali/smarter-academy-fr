import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';

import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ThreeWritings from '../components/ThreeWritings';

/**
 * Module 2 — DÉCOUVERTE : la proportion s'écrit de trois façons, et c'est le
 * MÊME nombre. La manipulation (ThreeWritings) affiche les trois écritures
 * côte à côte et les fait bouger ensemble : l'élève ne les convertit pas, il
 * les voit être une seule quantité.
 *
 * Puis les deux sens de lecture : appliquer une proportion (partie = p × tout)
 * et remonter au tout (tout = partie / p) — le second est celui qu'on rate.
 */
export default function Module02TroisEcrituresUneProportion() {
  const [tested, setTested] = useState(() => new Set());
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = tested.size >= 3;

  const test = (key, react) => {
    const next = new Set(tested); next.add(key); setTested(next);
    if (!done1 && next.size >= 3) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Le même nombre, trois habits',
      subtitle: 'Choisis une part et regarde les trois écritures changer ensemble. Essaie-en trois.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <ThreeWritings
            total={800}
            options={[200, 240, 400, 480, 600]}
            tested={tested}
            onTest={(v) => test(v, kit.react)}
            disabled={done1}
          />
          {done1 ? (
            <Feedback tone="ok">
              Une seule quantité, trois écritures : <strong>la fraction</strong> garde la trace du calcul,
              {' '}<strong>le décimal</strong> permet de multiplier, <strong>le pourcentage</strong> se compare d’un coup d’œil.
              Passer de l’un à l’autre ne change pas la valeur : 0,6 = 60/100 = 60 %.
            </Feedback>
          ) : (
            <Feedback tone="info">Parts testées : {tested.size} sur 3.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'De la proportion à l’effectif',
      done: q2,
      content: (
        <NumericQuestion
          prompt="Dans un lycée de 1 250 élèves, 36 % font une langue ancienne. Combien d’élèves cela représente-t-il ?"
          expected={450} suffix="élèves"
          explain="36 % = 0,36 et 0,36 × 1 250 = 450. Appliquer une proportion, c’est MULTIPLIER le tout par le nombre décimal."
          explainFor={(n) => (n === 36
            ? '36 est le pourcentage, pas l’effectif : il faut encore le multiplier par le tout, 0,36 × 1 250 = 450.'
            : n === 3472 || n === 3472.22
              ? 'Tu as divisé au lieu de multiplier. Une part est plus petite que le tout : 0,36 × 1 250 = 450.'
              : 'partie = proportion × tout, soit 0,36 × 1 250 = 450.')}
          solved={q2} onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'De l’effectif au tout',
      subtitle: 'Le sens qu’on oublie.',
      done: q3,
      content: (
        <NumericQuestion
          prompt="Dans un autre lycée, 189 élèves sont demi-pensionnaires, et cela représente 42 % des élèves. Combien y a-t-il d’élèves en tout ?"
          expected={450} suffix="élèves"
          above={(revealed) => (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-center">
              <MathText>{'$$\\text{partie} = p \\times \\text{tout} \\quad\\Longrightarrow\\quad \\text{tout} = \\frac{\\text{partie}}{p}$$'}</MathText>
              {revealed && <p className="text-xs text-violet-700 mt-1">189 ÷ 0,42 = 450</p>}
            </div>
          )}
          explain="tout = partie ÷ p = 189 ÷ 0,42 = 450. On DIVISE, parce qu’on remonte à la référence."
          explainFor={(n) => (n === 79 || n === 79.38
            ? 'Tu as multiplié : 189 × 0,42 donne une part de la part. Ici c’est le TOUT qu’on cherche, donc on divise : 189 ÷ 0,42 = 450.'
            : n === 231
              ? '189 n’est pas 42 % de plus que quelque chose : c’est 42 % DE quelque chose. 189 ÷ 0,42 = 450.'
              : 'Le tout est toujours plus grand que la part : 189 ÷ 0,42 = 450.')}
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Trois écritures à relier',
      done: q4,
      content: (
        <BatchChoiceQuestion
          intro={<p className="text-sm font-semibold text-slate-700">Pour chaque proportion, quelle est l’écriture en pourcentage ?</p>}
          rows={[
            { id: 'r1', label: <span className="font-mono">0,08</span>, options: ['0,8 %', '8 %', '80 %'], correct: 1, correction: '0,08 = 8/100 = 8 %' },
            { id: 'r2', label: <span className="font-mono">3/8</span>, options: ['37,5 %', '3,8 %', '38 %'], correct: 0, correction: '3 ÷ 8 = 0,375 = 37,5 %' },
            { id: 'r3', label: <span className="font-mono">1,25</span>, options: ['12,5 %', '1,25 %', '125 %'], correct: 2, correction: '1,25 = 125/100 = 125 % — une proportion peut dépasser 100 % quand la « part » est plus grande que la référence' },
            { id: 'r4', label: <span className="font-mono">7/20</span>, options: ['35 %', '7,20 %', '3,5 %'], correct: 0, correction: '7/20 = 35/100 = 35 %' },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Les quatre.' : `${nCorrect} sur ${total}.`} Pour passer au pourcentage on multiplie le décimal par 100 —
              {' '}<strong>on ne déplace pas la virgule au hasard</strong> : 0,08 vaut 8 %, pas 0,8 %.
            </Feedback>
          )}
          solved={q4} onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Trois écritures, une proportion" moduleSubtitle="Décimale, fraction, pourcentage" estimatedTime="10 min"
      brief={{
        tag: 'Découverte', title: 'p = partie / tout', tone: 'violet',
        body: <p>Une proportion est un quotient : la part divisée par le tout. Ce nombre s’écrit de trois façons, et se lit dans les deux sens — pour trouver la part, ou pour remonter au tout.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Et maintenant ?</strong> Tu sais lire une part d’un tout. Module suivant : une part <em>d’une part</em> —
          et le piège qui fait additionner deux pourcentages alors qu’il faut les multiplier.
        </KnowledgeSnapshot>
      )}
    />
  );
}
