import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : les exercices 1–12 du manuel, l'نشاط 1 (le carré, le cube), l'نشاط 3 et أؤكّد 11 sont posés ICI en APPLICATION de ce que la
 * عدسة a montré (guide §4ter : le manuel est la référence, pas l'entrée), RÉÉCRITS par la plateforme (autres nombres, regroupés en huit lignes de travail).
 * Corrigés, jamais comptés. Aucun produit ni quotient de puissances de 10 : une conversion est donnée en décimal. LP : P1–P4.
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
      objectives={['أكتب الكتابة العشرية لقوة', 'أكتب عددًا على شكل قوة', 'أقرأ الأسماء والبادئات', 'أعدّ الأصفار والرتب', 'أكتب $k \\times 10^n$']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="الكتابة العشرية، على شكل قوة، الأسماء، الوحدات، صحيح أم خاطئ، الأصفار والرتب، و k × 10ⁿ"
      estimatedTime="13 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>ثمانية تمارين على قوى العدد 10 وكتابتها. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'ex-1', 'الكتابة العشرية', ['ashara-asfar']),
        step(2, 'ex-6', 'على شكل قوة للعدد 10', ['ashara-adad']),
        step(3, 'ex-2', 'الأسماء', ['ashara-asma']),
        step(4, 'ex-10', 'الوحدات', ['ashara-asma']),
        step(5, 'ex-8', 'صحيح أم خاطئ؟', ['ashara-salib']),
        step(6, 'act-3', 'عدّ الأصفار', ['ashara-asfar']),
        step(7, 'act-3-rank', 'رتبة الرقم 1', ['ashara-salib']),
        step(8, 'self-11', 'كتابات من الشكل k × 10ⁿ', ['ashara-kn']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
