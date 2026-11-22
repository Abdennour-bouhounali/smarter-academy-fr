import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, TextbookBox, TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD_RATIONALIZE } from '../content/textbook';
import { EXERCISES_2 } from '../content/exercises';

/**
 * Module 3 — طرائق p. 25 : « نسبة مقامها عدد غير ناطق ».
 *   1. une PRÉDICTION avant la méthode, sur un acquis (le جداء de deux
 *      racines) : par quoi multiplier √11 pour obtenir un nombre ناطق ?
 *   2. la solution du manuel, ligne à ligne, puis l'encadré « طريقة » posé
 *      en brique (naqt-maqam) ;
 *   3. دوري الآن 2 : 4/√7, √3/(2√2), 8/(5√2) − 5/√8.
 * LP : P3.
 */
const SOLUTION = { source: METHOD_RATIONALIZE.source, exercise: METHOD_RATIONALIZE.exercise, solution: METHOD_RATIONALIZE.solution };

export default function Module03Nisba() {
  const [q1, setQ1] = useState(false);
  const [read, setRead] = useState(false);
  const [done, setDone] = useState({});
  const allNow = EXERCISES_2.every((ex) => done[ex.id]);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طرائق — نسبة مقامها عدد غير ناطق"
      moduleSubtitle="كيف نجعل المقام عددًا ناطقًا؟"
      estimatedTime="10 دقائق"
      objectives={['كيف أتخلّص من الجذر في مقام نسبة؟', 'هل تتغيّر قيمة النسبة حين نغيّر كتابتها؟']}
      brief={{
        tag: 'طريقة', title: METHOD_RATIONALIZE.title, tone: 'emerald',
        body: <p><MathText>{'في المقام عدد غير ناطق، مثل $\\sqrt{11}$. هل يمكن كتابة النسبة نفسها بمقام ناطق؟'}</MathText></p>,
      }}
      steps={[
        {
          num: 1, title: 'كيف نتخلّص من الجذر في المقام؟', done: q1,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={METHOD_RATIONALIZE.exercise} source={METHOD_RATIONALIZE.source} />
              <TapQuestion
                prompt={<MathText>{'أيّ عدد، إذا ضربنا فيه $\\sqrt{11}$، يعطي عددًا ناطقًا؟'}</MathText>}
                options={[
                  <MathText key="a">{'$2$'}</MathText>,
                  <MathText key="b">{'$11$'}</MathText>,
                  <MathText key="c">{'$\\sqrt{11}$'}</MathText>,
                  <MathText key="d">{'$\\sqrt{2}$'}</MathText>,
                ]}
                correct={2}
                cols={2}
                requires={['jidaa-jidhrayn']}
                explain={<MathText>{'لأن $\\sqrt{11} \\times \\sqrt{11} = \\sqrt{121} = 11$ عدد ناطق، أما $2\\sqrt{11}$ ، $11\\sqrt{11}$ و $\\sqrt{22}$ فأعداد غير ناطقة.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ),
        },
        {
          num: 2, title: 'الحلّ، ثم الطريقة', done: read,
          content: (
            <div className="space-y-3">
              <MethodSteps method={SOLUTION} onAllRevealed={() => setRead(true)} />
              {read && <KnowledgeBrick id="naqt-maqam" lead="البسط والمقام ضُربا في نفس العدد، فالنسبة لم تتغيّر:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'دوري الآن 2', done: allNow,
          content: (
            <div className="space-y-3">
              {EXERCISES_2.map((ex) => (
                <TextbookExercise key={ex.id} exercise={ex} requires={['naqt-maqam']} onAnswered={() => setDone((d) => ({ ...d, [ex.id]: true }))} />
              ))}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
