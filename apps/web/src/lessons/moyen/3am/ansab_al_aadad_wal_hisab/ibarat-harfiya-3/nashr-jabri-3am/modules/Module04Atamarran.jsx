import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 3 (les rectangles ABEF/ABCD et LMPQ), les exercices 8, 15, 16 (+ 17), 18, دوري الآن ② et أتعمّق 43 (ب، جـ)
 * du manuel sont posés ICI en APPLICATION de ce que l'élève a découvert au jardin (guide §4ter : le manuel est la référence, pas
 * l'entrée), RÉÉCRITS par la plateforme (autres nombres, autres contextes). Chaque clé est calculée puis recalculée dans
 * ../content/content.test.js. Corrigés, jamais comptés. LP : P1, P2, P3, P4.
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
      objectives={['أحسب مساحة بطريقتين', 'أنشر k(a ± b)', 'أنشر (a + b)(c + d)', 'أراقب نشرًا بقيمة']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="أرض ومساحتان، نشر، خطأ زميل، مراقبة بقيمة، صحيح أم خاطئ"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>نشر جداءات وتبسيط الناتج. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-3', 'أرض ومساحتان', ['masaha-tariqatayn']),
        step(2, 'ex-8', 'انشر k(a ± b)', ['tawzi-darb', 'hadd-matruh']),
        step(3, 'ex-15', 'خطأ في ورقة زميل', ['tawzi-darb']),
        step(4, 'ex-16', 'انشر جداء مجموعين', ['jidaa-qawsayn', 'rukn-yuad']),
        step(5, 'ex-18', 'أراقب نشر زميلي', ['jidaa-qawsayn']),
        step(6, 'now-59', 'انشر وبسّط ورتّب', ['tariqat-nashr']),
        step(7, 'deep-43', 'صحيح أم خاطئ؟', ['tariqat-nashr']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
