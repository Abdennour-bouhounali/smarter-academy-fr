import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { MethodSteps, TextbookExercise } from '../../../../../../common/textbook';
import RayFigure from '../components/RayFigure';
import GraphChoice from '../components/GraphChoice';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';
import { NOW_49_1 } from '../content/exercises';

/**
 * Module 4 — طرائق p. 49 : « حل متراجحة من الدرجة الأولى بمجهول واحد ». Les deux
 * solutions du livre révélées LIGNE À LIGNE (MethodSteps), chacune suivie de son dessin
 * (le « الجزء الملوّن بالأحمر » du livre, redessiné) ; la conclusion de ب) est CORRIGÉE
 * ((3x + 2)/6, une ligne discrète). Puis la brique tariqat-hal et دوري الآن 1, solution
 * puis dessin. LP : P2, P3.
 */
const methodOf = (solution) => ({ source: METHOD.source, exercise: METHOD.exercise, solution });

export default function Module04Tarayiq() {
  const [readA, setReadA] = useState(false);
  const [readB, setReadB] = useState(false);
  const [now, setNow] = useState({});
  const mark = (id) => () => setNow((d) => ({ ...d, [id]: true }));
  const nowDone = NOW_49_1.every((ex) => now[ex.id] && now[`${ex.id}-g`]);

  return (
    <ContentModule
      objectives={["كيف نحلّ متراجحة سطرًا بعد سطر؟", "ماذا نفعل عندما يظهر كسران في المتراجحة؟", "كيف نمثّل الحلول بعد حلّها؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="طرائق — حل متراجحة"
      moduleSubtitle="نحلّ، ثم نمثّل بيانيا"
      estimatedTime="8 دقائق"
      brief={{
        tag: 'طرائق', title: METHOD.title, tone: 'emerald',
        body: <p>حلّ مفصّل لمتراجحتين. اقرأ كل سطر، وتوقّع السطر التالي — واتجاه المتراجحة فيه — قبل أن تكشفه.</p>,
      }}
      steps={[
        {
          num: 1, title: 'المتراجحة أ', subtitle: 'الحلّ سطرًا سطرًا', done: readA,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="qawaid-ittijah" variant="rappel" compact />
              <MethodSteps method={methodOf(METHOD.solutionA)} onAllRevealed={() => setReadA(true)} />
              {readA && <RayFigure {...METHOD.figureA} label="الجزء الملوّن بالأحمر على يمين 2، والرمز غير موجّه نحوه" />}
            </div>
          ),
        },
        {
          num: 2, title: 'المتراجحة ب', subtitle: 'كسران في الطرفين: ما أول ما نفعله؟', done: readB,
          content: (
            <div className="space-y-3">
              <MethodSteps method={methodOf(METHOD.solutionB)} onAllRevealed={() => setReadB(true)} />
              {readB && (
                <>
                  <RayFigure {...METHOD.figureB} label="الجزء الملوّن بالأحمر على يسار 4، والرمز موجّه نحوه" />
                  <KnowledgeBrick id="tariqat-hal" lead="في المتراجحتين الخطوات نفسها:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'دوري الآن', subtitle: 'حلّ، ثم مثّل بيانيا', done: nowDone,
          content: (
            <div className="space-y-4">
              {NOW_49_1.map((ex) => (
                <div key={ex.id} className="space-y-2">
                  <TextbookExercise exercise={ex} requires={['tariqat-hal']} onAnswered={mark(ex.id)} />
                  {now[ex.id] && <GraphChoice graph={ex.graph} requires={['tamthil-bayani']} onAnswered={mark(`${ex.id}-g`)} />}
                </div>
              ))}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
