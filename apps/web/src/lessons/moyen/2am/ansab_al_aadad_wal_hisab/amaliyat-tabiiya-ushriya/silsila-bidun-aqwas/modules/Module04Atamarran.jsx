import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 1 du manuel (expliquer 15 et 21 pour 25 − 7 + 3) est posé ICI en APPLICATION de ce que le tramway a montré (guide §4ter : le manuel est la référence,
 * pas l'entrée), avec les exercices 1–7, أؤكّد 6 et أتعمّق 39 RÉÉCRITS (autres nombres ; chacun cite ceux qu'il remplace). Corrigés, jamais comptés. LP : P1–P3.
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
      objectives={['أحسب سلسلة جمع وطرح أو ضرب وقسمة', 'أطبّق أسبقية الضرب والقسمة', 'أصحّح حسابًا خاطئًا', 'أترجم وضعية بسلسلة']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="من على صواب؟ تحقّق، احسب، صحّح، أتمم، واكتب سلسلة"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>سبعة تمارين على ترتيب العمليات وأسبقيتها. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-1', 'من على صواب؟', ['yasar-yamin-jam']),
        step(2, 'act-2', 'تحقّق من المساواة', ['qawaid-hisab']),
        step(3, 'ex-1', 'احسب', ['yasar-yamin-darb']),
        step(4, 'ex-4', 'ابدأ بما يسبق', ['awlawiya']),
        step(5, 'ex-5', 'ورقة زميل', ['awlawiya']),
        step(6, 'ex-7', 'أتمم الحساب', ['awlawiya']),
        step(7, 'self-6', 'زوايا متجاورة', ['tarjama-silsila']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
