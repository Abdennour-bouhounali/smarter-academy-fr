import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 6 du manuel est posé ICI en APPLICATION des règles découvertes avec les trains (guide §4ter : le manuel
 * est la référence, pas l'entrée), avec les exercices 34–49, 51, 53 RÉÉCRITS par la plateforme (autres nombres, regroupés). Corrigés,
 * jamais comptés. LP : P1–P4.
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
      objectives={['أكتب على شكل قوة واحدة', 'أحسب قوى ذهنيًا', 'أحسب سلاسل بالأولويات', 'أستعمل القواعد في وضعيات']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="قوة واحدة، حساب ذهني، الأس نفسه، الأقواس، عدد ناقص، أس سالب، حديقة، ومجموع قوى"
      estimatedTime="13 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>ثمانية تمارين على القوى والقواعد والأولويات. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-6', 'على شكل قوة واحدة', ['hasil-quwatayn']),
        step(2, 'ex-34', 'حساب ذهني', ['quwa-salib']),
        step(3, 'ex-35', 'عاملان لهما الأس نفسه', ['quwat-jidaa']),
        step(4, 'ex-44', 'الأعداد نفسها والأقواس في أماكن مختلفة', ['awlawiya-quwa']),
        step(5, 'ex-39', 'العدد الناقص', ['quwa-taarif']),
        step(6, 'ex-40', 'أس سالب لكسر سالب', ['quwa-salib']),
        step(7, 'ex-47', 'الحديقة المربّعة', ['quwat-quwa']),
        step(8, 'ex-51', 'مجموع قوى متساوية', ['jidaa-quwatayn']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
