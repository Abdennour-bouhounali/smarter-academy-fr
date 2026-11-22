import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 6 du manuel (deux rectangles aux expressions déjà données) est posé ICI en APPLICATION de ce que les distributeurs ont montré (guide §4ter : le manuel est la référence, pas
 * l'entrée), avec les exercices 21, 23, 24, 25, 26, 27, 32, 35 et أُنجِز الآن 13 RÉÉCRITS (autres nombres ; chacun cite ceux qu'il remplace). Corrigés, jamais comptés. LP : P1, P2, P3, P4.
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
      objectives={['أعبّر عن مساحة بطريقتين', 'أنشر وأحلّل وأصحّح أخطاء زميل', 'أحسب ذهنيًا بالتوزيع', 'أنشر عبارة فيها حرف']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="مساحتان، أخطاء، نشر وتحليل، حساب ذهني، وحرف"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>سبعة تمارين على النشر والتحليل والحساب الذهني. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-6', 'مساحة مستطيلين بطريقتين', ['qaidat-tawzi']),
        step(2, 'ex-21', 'أتمم وصحّح كتابة زميل', ['tawzi-tarh']),
        step(3, 'ex-24', 'انشر وحلّل ثم احسب', ['tahlil']),
        step(4, 'ex-26', 'احسب بطريقتين', ['qaidat-tawzi']),
        step(5, 'ex-32', 'احسب ذهنيًا', ['tariqa-dhihni']),
        step(6, 'ex-27', 'شتلات الفلّاح', ['tawzi-tarh']),
        step(7, 'ex-35', 'عبارة فيها حرف', ['tariqa-harf']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
