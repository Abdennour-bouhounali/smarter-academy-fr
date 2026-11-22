import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 1 du manuel (le partage par un naturel et trois divisions) est posé ICI en APPLICATION de ce que la دوّاسة a montré (guide §4ter : le
 * manuel est la référence, pas l'entrée), avec les exercices 1, 2, 4–7 et أتعمّق 59 RÉÉCRITS (autres nombres ; chacun cite ceux qu'il remplace). Corrigés, jamais
 * comptés. LP : P1–P3.
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
      objectives={['أقسم كسرًا على عدد أو على كسر', 'أعيّن مقلوب عدد', 'أختزل قبل الضرب', 'أجد عرضًا من مساحة وطول']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="جدارية، مقلوبات، جداءات، اختزال، كسر مبسّط، ومستطيل"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>سبعة تمارين على المقلوب وقسمة الكسور. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-1', 'جدارية تتقاسمها أفواج', ['qismat-kasrayn']),
        step(2, 'ex-1', 'مقلوبات', ['maqlub-tarif']),
        step(3, 'ex-4', 'جداءات ذهنية', ['maqlub']),
        step(4, 'ex-5', 'بسّط ثم احسب', ['ikhtizal-qabl']),
        step(5, 'ex-6', 'كسر مبسّط', ['qisma-darb']),
        step(6, 'ex-7', 'احسب ثم بسّط', ['qismat-kasrayn']),
        step(7, 'deep-59', 'عرض قطعة خشب', ['qismat-kasrayn']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
