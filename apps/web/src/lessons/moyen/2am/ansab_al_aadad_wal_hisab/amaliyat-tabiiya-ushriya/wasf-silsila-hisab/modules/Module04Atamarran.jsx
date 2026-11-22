import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 5 du manuel (souligner la dernière opération de quatre chaînes) est posé ICI en APPLICATION de ce que le ruban a montré (guide §4ter : le manuel est la référence,
 * pas l'entrée), avec les exercices 9, 18, 19, 20 et أؤكّد 5 RÉÉCRITS (autres nombres ; chacun cite ceux qu'il remplace). Corrigés, jamais comptés. LP : P1, P2, P3.
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
      objectives={['أسمّي سلاسل وأحسبها', 'أكتب سلسلة من جملة وأحسبها', 'أصف سلسلة بجملة', 'أقرأ شجرة الحساب وأربط السلسلة باسمها']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="سمِّ، اكتب، صِف، واقرأ الشجرة"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>ستّة تمارين على تسمية السلاسل ووصفها وكتابتها. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-5', 'سمِّ كلّ سلسلة واحسبها', ['akhir-amaliya']),
        step(2, 'ex-18', 'اكتب من الجملة ثم احسب', ['tariqa-kitaba']),
        step(3, 'ex-19', 'عيّن آخر عملية وصِف', ['wasf-jumla']),
        step(4, 'ex-20', 'احسب وسمِّ', ['qaidat-tasmiya']),
        step(5, 'ex-9', 'اقرأ شجرة الحساب', ['hudud-awamil']),
        step(6, 'self-5', 'اربط كلّ سلسلة باسمها', ['akhir-amaliya']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
