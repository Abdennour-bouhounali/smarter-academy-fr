import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX, FIGURE_E8 } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 4, les exercices 1–4, دوري الآن ①, أؤكّد 3, أتعمّق 37 et 39 et l'ICT du manuel sont posés ICI en APPLICATION de ce que l'élève a
 * découvert au mur de billes (guide §4ter : le manuel est la référence, pas l'entrée), RÉÉCRITS par la plateforme (autres nombres, autres contextes). Chaque clé est
 * calculée puis recalculée, avec un évaluateur à part, dans ../content/content.test.js. Corrigés, jamais comptés. LP : P1, P2, P3.
 */
export default function Module04Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const step = (num, id, title, req, extra) => ({
    num, title, done: !!done[id],
    content: <div className="space-y-3">{extra}<TextbookExercise exercise={EX[id]} requires={req} onAnswered={mark(id)} /></div>,
  });
  return (
    <ContentModule
      objectives={['أحسب قيمًا بأعداد سالبة وكسرية', 'أحكم على مساواة بقيمة', 'أفرّق بين القيمة المضبوطة والمقرّبة']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="نشر زميل، قيم، مساواتان، كرة مرمية، العدد π، جدول قيم"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>تعويض وحساب وحكم بالقيم. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-4', 'نشر زميل يُحكم عليه بالقيم', ['aqwas-salib', 'mithal-mudad']),
        step(2, 'ex-1', 'قيم بأعداد سالبة وكسرية', ['tawid-qimat', 'aqwas-salib']),
        step(3, 'ex-3', 'أختبر مساواتين', ['mithal-mudad', 'nashr-yuthbit']),
        step(4, 'ex-4', 'كرة مرمية', ['tawid-qimat']),
        step(5, 'now-61', 'عدد يعدم قوسًا', ['aqwas-salib', 'mithal-mudad']),
        step(6, 'self-3', 'جداء عند قيمة سالبة', ['aqwas-salib']),
        step(7, 'deep-39', 'ياسين يعمّم', ['mithal-mudad']),
        step(8, 'deep-37', 'قيمة مضبوطة وقيمة مقرّبة', ['tawid-qimat'], <GeoFigure {...FIGURE_E8} maxWidth={240} />),
        step(9, 'ict', 'جدول قيم', ['mithal-mudad', 'nashr-yuthbit']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
