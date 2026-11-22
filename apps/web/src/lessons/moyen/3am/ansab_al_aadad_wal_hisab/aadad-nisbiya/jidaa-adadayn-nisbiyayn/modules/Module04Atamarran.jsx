import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le puits (نشاط 1) et l'escalator (نشاط 2) du manuel sont posés ICI en APPLICATIONS de ce que le film du labo a
 * montré (guide §4ter : le manuel est la référence, pas l'entrée), RÉÉCRITS (un tunnel de 48 marches, une fosse de 8 m), avec les
 * exercices 1, 6, 17, 29, أؤكّد et أتعمّق 37, 43 redessinés (autres nombres). Corrigés, jamais comptés. LP : P1, P2, P4.
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
      objectives={['أحسب جداءات متنوعة', 'أربط بين جداءات متساوية', 'أكمل الإشارة الناقصة', 'أطبّق الجداء في وضعيات']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="حسابات، جداءات متساوية، إشارة ناقصة، درج نفق، حفرة، وأعداد مطلوبة"
      estimatedTime="12 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>تسعة تمارين على جداء عددين نسبيين. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'ex-1', 'ستة جداءات', ['tariqat-jidaa']),
        step(2, 'ex-6', 'جداءات متساوية', ['ishara-jidaa']),
        step(3, 'ex-29', 'الإشارة الناقصة', ['ishara-jidaa']),
        step(4, 'act-2', 'درج نفق الراجلين', ['jidaa-jamaa']),
        step(5, 'act-1', 'حفرة عميقة', ['jidaa-jamaa']),
        step(6, 'deep-43', 'صحيح أم خاطئ', ['ishara-jidaa']),
        step(7, 'ex-17', 'عددان سالبان جداؤهما 24', ['tariqat-jidaa']),
        step(8, 'ex-17b', 'جداء سالب ومجموع معدوم', ['ishara-jidaa']),
        step(9, 'deep-37', 'جداء سالب ومجموع موجب', ['ishara-jidaa']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
