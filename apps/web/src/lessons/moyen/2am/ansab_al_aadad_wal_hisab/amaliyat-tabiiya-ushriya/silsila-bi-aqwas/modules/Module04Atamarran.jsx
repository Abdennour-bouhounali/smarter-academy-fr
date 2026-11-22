import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 3 du manuel (six résultats avec et sans parenthèses) est posé ICI en APPLICATION de ce que la calculatrice a montré (guide §4ter : le manuel est la référence,
 * pas l'entrée), avec les exercices 8, 10, 13–17 et دوري الآن RÉÉCRITS (autres nombres ; chacun cite ceux qu'il remplace). Corrigés, jamais comptés. LP : P1–P4.
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
      objectives={['أقارن حسابًا بأقواس وبدونها', 'أضع القوسين وأحسب أقواسًا متداخلة', 'أكتب الكسر بالاتجاهين', 'أفسّر عرض الآلة وأربط المسألة بعبارتها']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="قارن، احسب، ضع القوسين، اكتب الكسر، فسّر الآلة، واربط"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>سبعة تمارين على الأقواس وخطّ الكسر والآلة الحاسبة. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-3', 'قارن بأقواس وبدونها', ['aqwas-ghayr-daruriya']),
        step(2, 'ex-8', 'احسب', ['aqwas-awwalan']),
        step(3, 'ex-10', 'ضع قوسين لتصحّ المساواة', ['qaidat-aqwas']),
        step(4, 'ex-14', 'أقواس متداخلة', ['tariqa-mutadakhila']),
        step(5, 'ex-15', 'خطّ الكسر بالاتجاهين', ['khatt-kasr']),
        step(6, 'ex-17', 'ماذا ظهر على الآلة؟', ['tariqa-khatt-kasr-alat']),
        step(7, 'ex-13', 'اربط المسألة بعبارتها', ['qaidat-aqwas']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
