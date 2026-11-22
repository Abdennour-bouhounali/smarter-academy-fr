import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 5 du manuel (décimal ou non, signes, écritures égales, rangement) est posé ICI en APPLICATION de ce que le حبل a montré (guide §4ter : le manuel est la référence, pas l'entrée),
 * avec les exercices 22–24, 26–28, 30–33, أؤكّد 4/9/10 et أتعمّق 56 et 69 RÉÉCRITS (autres nombres ; chacun cite ceux qu'il remplace). Corrigés, jamais comptés. LP : P1–P3.
 */
export default function Module04Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const one = (id, req) => <TextbookExercise key={id} exercise={EX[id]} requires={req} onAnswered={mark(id)} />;
  const group = (num, title, ids, req) => ({
    num, title, done: ids.every((id) => !!done[id]),
    content: <div className="space-y-3">{ids.map((id) => one(id, req))}</div>,
  });
  return (
    <ContentModule
      objectives={['أميّز العدد العشري وأحدّد إشارة العدد الناطق', 'أصنّف الأعداد وأكتبها على الشكل المعياري', 'أكتب عددًا مجموع عدد طبيعي وكسر', 'أقارن وأرتّب وأمثّل أعدادًا ناطقة']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="عشري أم لا، إشارة، تصنيف، مقارنة، ترتيب وتمثيل"
      estimatedTime="15 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>تمارين على العدد الناطق وكتابته ومقارنته وترتيبه. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        group(1, 'عشري أم لا؟ والإشارة', ['act-5', 'act-5-signs'], ['adad-natiq']),
        group(2, 'تصنيف الأعداد', ['ex-22'], ['adad-natiq-shamil']),
        group(3, 'الشكل a/b', ['ex-23'], ['maqam-mujab']),
        group(4, 'الإشارة', ['ex-24'], ['maqam-mujab']),
        group(5, 'عدد طبيعي وكسر', ['ex-26', 'deep-56'], ['adad-natiq-shamil']),
        group(6, 'مقارنة وترتيب', ['ex-27', 'ex-30'], ['tartib-natiqa']),
        group(7, 'التساوي والمقارنة', ['ex-28', 'self-10'], ['tartib-natiqa']),
        group(8, 'على المستقيم', ['deep-69'], ['tariqa-muqarana']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
