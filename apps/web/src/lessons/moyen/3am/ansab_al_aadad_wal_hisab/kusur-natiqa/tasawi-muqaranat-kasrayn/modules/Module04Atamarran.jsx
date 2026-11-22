import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 3 du manuel (quatre paires, « بالطريقة المناسبة ») est posé ICI en APPLICATION de ce que la machine a montré (guide §4ter : le manuel est la référence, pas l'entrée),
 * avec « دورك الآن » 1, les exercices 8, 12–16 et أتعمّق 55 RÉÉCRITS (autres nombres ; chacun cite ceux qu'il remplace). Corrigés, jamais comptés. LP : P1–P3.
 */
export default function Module04Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const step = (num, id, title, req) => ({
    num, title, done: !!done[id],
    content: <TextbookExercise exercise={EX[id]} requires={req} onAnswered={mark(id)} />,
  });
  return (
    <ContentModule
      objectives={['أقارن بالطريقة المناسبة', 'أدرس تساوي كسرين', 'أصنّف الكسور المتساوية', 'أرتّب كسورًا بمقام مشترك', 'أجد حدًّا مجهولًا', 'أفحص ما تقوله الحاسبة']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="مقارنة، تساوٍ، تصنيف، ترتيب، حدّ مجهول، وحاسبة تخدع"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>تمارين على المقارنة بالطريقة المناسبة وتساوي الكسور والترتيب. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-3', 'قارن بالطريقة المناسبة', ['ikhtiyar-tariqa']),
        step(2, 'now-1', 'هل الكسران متساويان؟', ['jidaa-property']),
        step(3, 'ex-8', 'صنّف الكسور المتساوية', ['jidaa-property']),
        step(4, 'ex-12', 'رتّب بمقام مشترك', ['qaida-tawhid']),
        {
          num: 5, title: 'تساوٍ وحدّ مجهول', done: !!done['ex-15'] && !!done['ex-16'],
          content: (
            <div className="space-y-3">
              <TextbookExercise exercise={EX['ex-15']} requires={['jidaa-property']} onAnswered={mark('ex-15')} />
              <TextbookExercise exercise={EX['ex-16']} requires={['jidaa-property']} onAnswered={mark('ex-16')} />
            </div>
          ),
        },
        step(6, 'deep-55', 'حاسبة تخدع', ['ikhtiyar-tariqa']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
