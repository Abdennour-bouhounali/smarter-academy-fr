import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : les exercices 1, 2, 3 (+ 4), 5, 6, 7, 8, 9 et le calcul d'âge d'« أقوّم تعلّماتي » 4 du manuel sont posés ICI en APPLICATION de ce que l'élève a fait sur la jauge
 * (guide §4ter : le manuel est la référence, pas l'entrée), RÉÉCRITS par la plateforme (autres nombres, autres contextes : Tamanrasset, une résidence d'Annaba, des
 * savants avant et après l'ère). Corrigés, jamais comptés. LP : P1–P3.
 */
export default function Module04Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const step = (num, id, title, req) => ({
    num, title, done: !!done[id],
    content: <div className="space-y-3"><TextbookExercise exercise={EX[id]} requires={req} onAnswered={mark(id)} /></div>,
  });
  return (
    <ContentModule
      objectives={['أحدّد جهة قراءة بالنسبة إلى الصفر', 'أكتب وضعية بعدد نسبي: طابق أو تاريخ', 'أعيّن مسافة عدد إلى الصفر ومعاكسه']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="حرارة، طوابق، تواريخ، مسافة ومعاكس"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>قراءات محرار، طوابق عمارة، تواريخ قبل الميلاد وبعده، ثمّ صحيح أم خاطئ والمسافة إلى الصفر والمعاكس. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'ex-1', 'قراءات المحرار', ['sayaqat-salib']),
        step(2, 'ex-2', 'طوابق عمارة', ['sayaqat-salib']),
        step(3, 'ex-3', 'تواريخ العلماء', ['sayaqat-salib']),
        step(4, 'self-4', 'عمر أرخميدس', ['sayaqat-salib']),
        step(5, 'ex-5', 'ارتفاعات وأعماق', ['sayaqat-salib']),
        step(6, 'ex-6', 'صحيح أم خاطئ؟', ['adad-nisbi']),
        step(7, 'ex-7', 'المسافة إلى الصفر', ['ishara-masafa']),
        step(8, 'ex-9', 'عددان على بعد واحد', ['adad-mutaakisan']),
        step(9, 'ex-8', 'المعاكس', ['adad-mutaakisan']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
