import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : les أتعمّق 51, 44, 42, 39, 49 et دوري الآن (now-11) du manuel sont posés ICI en APPLICATIONS de ce que le robot a montré
 * (guide §4ter : le manuel est la référence, pas l'entrée), RÉÉCRITS (autres nombres, autres contextes). Corrigés, jamais comptés. LP : P1, P2, P4.
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
      objectives={['أضرب في (−1) وأتعرّف على المعاكس', 'أحسب جداءات متنوعة', 'أعيّن إشارة جداءات طويلة', 'أوزّع الضرب لأحسب ذهنيًا']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="معاكس عدد، جداءات، إشارات طويلة، برنامجا حساب، وتوزيع الضرب"
      estimatedTime="12 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>عشرة تمارين على جداء عدة أعداد. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'deep-51', 'الضرب في (−1)', ['maakus']),
        step(2, 'deep-51b', 'عدد ومعاكسه', ['maakus']),
        step(3, 'ex-5', 'ثلاثة جداءات', ['tariqat-iddat']),
        step(4, 'now-11', 'إشارات جداءات طويلة', ['adad-salib']),
        step(5, 'ex-13', 'ثلاثة عشر عاملًا سالبًا', ['adad-salib']),
        step(6, 'deep-44', 'نعوّض كل عامل بمعاكسه', ['adad-salib']),
        step(7, 'deep-42', 'برنامجا حساب', ['maakus']),
        step(8, 'deep-42b', 'لماذا النتيجة نفسها؟', ['maakus']),
        step(9, 'deep-39', 'عدد العوامل السالبة ضعف عدد الموجبة', ['adad-salib']),
        step(10, 'deep-49', 'بطريقتين مختلفتين', ['tawzi-aadad']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
