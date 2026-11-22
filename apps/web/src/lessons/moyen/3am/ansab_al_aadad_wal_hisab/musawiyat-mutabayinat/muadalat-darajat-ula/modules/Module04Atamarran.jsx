import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 4 du manuel est posé ICI en APPLICATION de ce que la عبّارة a montré (guide §4ter : le manuel est la référence, pas l'entrée),
 * avec les exercices 29–65 RÉÉCRITS et regroupés par la plateforme (autres nombres ; chacun cite ceux qu'il remplace). Corrigés, jamais comptés. LP : P1–P4.
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
      objectives={['أميّز المعادلة من الدرجة الأولى', 'أتحقق بالتعويض', 'أحلّ معادلات', 'أرييض مشكلات']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="عدد مشترك، معادلة أم لا، تعويض، حلّ، وترييض مشكلات"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>ثمانية تمارين على المعادلات وحلّها وترييض المشكلات. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-4', 'عدد مشترك', ['naql-hadd']),
        step(2, 'ex-30', 'معادلة أم لا', ['muadala-taarif']),
        step(3, 'ex-33', 'هل هو حلّ؟', ['tahqqaq-taawid']),
        step(4, 'ex-34', 'حلّ معادلات', ['tariqat-hall']),
        step(5, 'ex-35', 'كتب أمل', ['tarhiq-mushkila']),
        step(6, 'ex-40', 'عدد وضعفه', ['tarhiq-mushkila']),
        step(7, 'ex-44', 'مستطيل', ['tarhiq-mushkila']),
        step(8, 'ex-49', 'دفاتر وأقلام', ['tarhiq-mushkila']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
