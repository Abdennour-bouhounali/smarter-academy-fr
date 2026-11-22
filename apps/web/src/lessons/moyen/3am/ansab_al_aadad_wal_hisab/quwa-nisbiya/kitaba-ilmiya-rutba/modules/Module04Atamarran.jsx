import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : les exercices 21–31, 52 et 57 du manuel sont posés ICI en APPLICATION de ce que le سلّم a montré (guide §4ter : le manuel est la référence, pas l'entrée),
 * RÉÉCRITS par la plateforme (autres nombres, regroupés en six lignes de travail). Corrigés, jamais comptés. LP : P1–P3.
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
      objectives={['أتمّ مساواة بقوى العدد 10', 'أكتب كتابة علمية', 'أحكم على مقارنات وأرتّب', 'أحسب ثم أكتب', 'أعطي رتبة قدر كمية حقيقية']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="أتمّ، الكتابة العلمية، مقارنات، ترتيب، أحسب ثم أكتب، كمية حقيقية"
      estimatedTime="13 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>ستة تمارين على الكتابة العلمية والحصر ورتبة القدر. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'ex-21', 'أتمّ المساواة', ['tariqa-ilmiya']),
        step(2, 'ex-26', 'الكتابة العلمية', ['tariqa-ilmiya']),
        step(3, 'ex-27', 'صحيحة أم خاطئة؟', ['muqarana-ilmiya']),
        step(4, 'ex-29', 'رتّب تصاعديًا', ['muqarana-ilmiya']),
        step(5, 'ex-30', 'أحسب ثم أكتب', ['hisab-ilmiya']),
        step(6, 'ex-57', 'كمية حقيقية', ['rutbat-qadr']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
