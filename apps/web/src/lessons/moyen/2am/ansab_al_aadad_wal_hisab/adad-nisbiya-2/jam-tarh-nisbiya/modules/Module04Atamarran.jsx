import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 3 (les totaux d'un jeu) et le نشاط 4 (−2 °C puis 5 de moins ; le tour de « (+7)+(−7) ») du manuel sont posés ICI en APPLICATION des idées découvertes avec les sacs (guide §4ter : le manuel est la
 * référence, pas l'entrée), avec les exercices 25–34 et أتعمّق 38 RÉÉCRITS par la plateforme (autres nombres). Corrigés, jamais comptés. LP : P1–P3.
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
      objectives={['أجمع عددين نسبيين في حسابات ووضعيات', 'أطرح عددًا نسبيًا بجمع معاكسه', 'أكمل عددًا ناقصًا', 'أفنّد فكرة خاطئة بمثال مضادّ']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="حصيلة جولتين، طقس الجلفة، مجاميع وفروق، عدد ناقص، هرم، وفكرة خاطئة"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>ثمانية تمارين على جمع عددين نسبيين وطرحهما. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-3', 'حصيلة جولتين', ['qaidat-jam']),
        step(2, 'act-4', 'انخفاض الحرارة', ['qaidat-tarh']),
        step(3, 'ex-25', 'مجاميع', ['qaidat-jam']),
        step(4, 'ex-28', 'عدد ناقص', ['qaidat-tarh']),
        step(5, 'ex-30', 'هرم المجاميع', ['qaidat-jam']),
        step(6, 'ex-32', 'فروق', ['qaidat-tarh']),
        step(7, 'ex-33', 'فرق يساوي مجموعًا', ['qaidat-tarh']),
        step(8, 'deep-38', 'فكرة خاطئة', ['qaidat-jam']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
