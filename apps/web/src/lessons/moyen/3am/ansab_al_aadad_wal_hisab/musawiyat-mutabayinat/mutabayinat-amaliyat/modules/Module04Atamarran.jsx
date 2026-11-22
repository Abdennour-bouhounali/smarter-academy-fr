import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 2 du manuel (a + c, puis le tableau ac / bc) est posé ICI en APPLICATION des propriétés découvertes aux خيوط النول (guide §4ter :
 * le manuel est la référence, pas l'entrée), avec les exercices 6–27 RÉÉCRITS par la plateforme (autres nombres). Corrigés, jamais comptés. LP : P1–P4.
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
      objectives={['أطبّق الجمع والطرح على متباينة', 'أكمل إن أمكن', 'أضرب في موجب وفي سالب', 'أستنتج وأحصر']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="ثمانية تمارين على الخواص والاستنتاج والحصر"
      estimatedTime="12 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'ثمانية تمارين لتثبيت الخواص', tone: 'amber',
        body: <p>أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'ex-6', 'أكمل بالمتباينة', ['jam-mutabayina']),
        step(2, 'act-2', 'أكمل إن أمكن', ['jam-mutabayina']),
        step(3, 'act-2b', 'أضرب وأقسم', ['darb-salib']),
        step(4, 'ex-13', 'أستنتج متباينة', ['istintaj']),
        step(5, 'ex-14', 'طرفها الأول x', ['istintaj']),
        step(6, 'ex-17', '≤ و ≥', ['darb-salib']),
        step(7, 'ex-23', 'أحصر محيطًا', ['hasr-ab']),
        step(8, 'ex-26', 'حصر معكوس', ['hasr-ab']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
