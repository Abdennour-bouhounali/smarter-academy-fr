import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 2 du manuel (les thermomètres) est posé ICI en APPLICATION des règles découvertes avec le مسبار (guide
 * §4ter : le manuel est la référence, pas l'entrée), avec les exercices 12–20 et l'ouverture p. 38 RÉÉCRITS par la plateforme (autres
 * nombres). Corrigés, jamais comptés. LP : P1–P3.
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
      objectives={['أقارن عددين نسبيين', 'أصحّح إجابة تلميذ', 'أحدّد الأكبر والأصغر والأقرب إلى الصفر', 'أرتّب وأجد عددًا بين عددين']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="مقارنات، تصحيح إجابة، أكبر وأصغر، ترتيب، عدد بين عددين، ودرجات الأرض القصوى"
      estimatedTime="12 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>ثمانية تمارين على المقارنة والترتيب. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-2', 'مقارنة درجات الحرارة', ['mukhtalifayn']),
        step(2, 'ex-13', 'سالبان بأرقام عشرية', ['salibayn']),
        step(3, 'ex-14', 'تصحيح إجابة تلميذ', ['salibayn']),
        step(4, 'ex-15', 'الأكبر والأصغر والأقرب إلى الصفر', ['mukhtalifayn']),
        step(5, 'ex-17', 'ترتيب تصاعدي', ['tartib']),
        step(6, 'ex-18', 'ترتيب تنازلي', ['tartib']),
        step(7, 'ex-20', 'عدد بين عددين', ['hasr']),
        step(8, 'opener', 'درجات الأرض القصوى', ['mukhtalifayn']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
