import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 6 du manuel (transformer une chaîne en additions) est posé ICI en APPLICATION des idées découvertes avec la corde (guide §4ter : le manuel est la référence, pas l'entrée), avec les exercices
 * 29, 36, 37 et أتعمّق 39, 43, 44, 46, 58 RÉÉCRITS par la plateforme (autres nombres). Corrigés, jamais comptés. LP : P1–P3.
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
      objectives={['أحوّل الطرح إلى جمع المعاكس', 'أجمّع الحدود الموجبة والسالبة', 'أبسّط الكتابة وأحسبها', 'أضع الإشارات وأبحث عن أكبر قيمة']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="تحويل، تجميع، تبسيط، إشارات، وأكبر قيمة"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>تسعة تمارين على المجاميع الجبرية. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-6', 'من الطرح إلى الجمع', ['tarh-ila-jam']),
        step(2, 'ex-29', 'مجاميع طويلة', ['tajmi-hudud']),
        step(3, 'ex-36', 'ثلاثة مجاميع جبرية', ['naql-tajmi']),
        step(4, 'ex-37', 'أين الخطأ؟', ['tarh-ila-jam']),
        step(5, 'deep-39', 'أبسّط الكتابة', ['kitaba-mubassata']),
        step(6, 'deep-43', 'أضع الإشارات', ['tarh-ila-jam']),
        step(7, 'deep-44', 'أزواج من الفروق', ['naql-tajmi']),
        step(8, 'deep-46', 'أكبر قيمة', ['tarh-ila-jam']),
        step(9, 'deep-58', 'مربّع صفري', ['tajmi-hudud']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
