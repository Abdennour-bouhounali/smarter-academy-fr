import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 1 du manuel est posé ICI en APPLICATION des propriétés découvertes au مضمار (guide §4ter : le manuel est la référence,
 * pas l'entrée), avec les exercices 1–5 RÉÉCRITS par la plateforme (autres nombres). Corrigés, jamais comptés. LP : P1–P3.
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
      objectives={['أطبّق العملية نفسها على الطرفين', 'أكمل المساواة', 'أحكم: صحيح أم خاطئ', 'أضرب في عدد سالب']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="مبلغان متساويان، أكمل، عدد مجهول، صحيح أم خاطئ، اضرب في عدد سالب، وأكمل بعد معلومة"
      estimatedTime="12 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>ستة تمارين على العمليات على طرفي مساواة. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-1', 'مبلغان متساويان', ['musawat-jam']),
        step(2, 'ex-1', 'أكمل بعد معلومة', ['musawat-jam']),
        step(3, 'ex-2', 'عدد مجهول', ['tahwil']),
        step(4, 'ex-3', 'صحيح أم خاطئ', ['tahwil']),
        step(5, 'ex-4', 'اضرب في عدد سالب', ['musawat-darb']),
        step(6, 'ex-5', 'أكمل من 4x = −2', ['tahwil']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
