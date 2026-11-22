import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : les أنشطة 4 ①②, ex-15, 16, 22–27, 30, 33, دوري الآن ① ②, أتعمّق 40, 41 et 45 du manuel sont posés ICI en APPLICATIONS de ce que les خزائن ont montré
 * (guide §4ter : le manuel est la référence, pas l'entrée), RÉÉCRITS (autres nombres, autres contextes). Corrigés, jamais comptés. LP : P1, P2, P3, P4.
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
      objectives={['أكمل جداءات بعدد ناقص', 'أعيّن إشارة حاصل قسمة', 'أحسب حواصل قسمة عشرية', 'أنظّم سلاسل حسابات']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="عدد ناقص، إشارات، حواصل عشرية وكسرية، سلسلة حسابات وأقواس ناقصة"
      estimatedTime="12 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>تسعة تمارين على حاصل القسمة وسلاسل الحسابات. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-4', 'أكمل العملية', ['qisma-aamil']),
        step(2, 'ex-22', 'إشارة دون حساب', ['ishara-qisma']),
        step(3, 'ex-24', 'أحسب حواصل القسمة', ['tariqat-qisma']),
        step(4, 'now-13a', 'أربع كتابات لكسر', ['kasr-qisma']),
        step(5, 'now-13b', 'الفاصلة تنتقل', ['tariqat-qisma']),
        step(6, 'ex-33', 'سلسلة بأقواس متداخلة', ['tariqat-awlawiya']),
        step(7, 'deep-40', 'أقواس ناقصة', ['tariqat-awlawiya']),
        step(8, 'deep-41', 'إشارة جداءين', ['ishara-jadaa']),
        step(9, 'deep-45', 'متتالية', ['tariqat-qisma']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
