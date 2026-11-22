import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 5 du manuel est posé ICI en APPLICATION de ce que l'élève a découvert sur la piste (guide §4ter : le manuel
 * est la référence, pas l'entrée), avec les exercices 17–20, la question « أصغر وأكبر عدد » d'أتعمّق 3 et l'exercice TIC RÉÉCRITS par la
 * plateforme (autres contextes, autres nombres). Corrigés, jamais comptés. LP : P1–P3.
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
      objectives={['أحكم على أقوال أربعة أصدقاء', 'أقارن وأرتّب أعدادًا وكسورًا', 'أكوّن أصغر وأكبر عدد من بطاقات']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="أقوال، علاقات، ترتيب تصاعدي وتنازلي، بطاقات، علامات"
      estimatedTime="13 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>أقوال أربعة أصدقاء تحتاج إلى حكمك، ثم مقارنات وترتيب وبطاقات وعلامات. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-5', 'أقوال أربعة أصدقاء', ['itmam-asfar']),
        step(2, 'ex-17', 'كسور عشرية وأعداد', ['taqarun-rutab']),
        step(3, 'ex-18', 'أعداد تحتاج إلى حذر', ['itmam-asfar']),
        step(4, 'ex-19', 'ترتيب تصاعدي', ['tartib-silsila']),
        step(5, 'ex-20', 'ترتيب تنازلي', ['tartib-silsila']),
        step(6, 'deep-3', 'بطاقات الأرقام', ['tartib-silsila']),
        step(7, 'ict', 'علامات القسم', ['tartib-silsila']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
