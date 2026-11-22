import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX, FIGURE_E1, FIGURE_E8 } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 5, les exercices 27–32, دوري الآن ②, أؤكّد 9–10 et أتعمّق 38 du manuel sont posés ICI en APPLICATION de ce que l'élève a découvert au galvanomètre (guide §4ter :
 * le manuel est la référence, pas l'entrée), RÉÉCRITS par la plateforme (autres nombres, autres contextes). Chaque clé est calculée puis recalculée, avec une arithmétique à part, dans
 * ../content/content.test.js. Corrigés, jamais comptés. LP : P1, P2, P3. Ordre : E1 act-5 · E2 ex-27 · E3 ex-28 · E4 ex-30/now-61 · E5 ex-29/31 · E6 self-9/10 · E7 ex-32 · E8 deep-38.
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
      objectives={['أقارن بحساب الفرق', 'أرتّب عددين من فرقهما وحده', 'أقارن عبارتين بإشارة الفرق']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="أزواج قريبة، الفرق وحده، سالبة وعشرية، العدد π، عبارتان، محيطان ومساحتان"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>نحسب الفرق ونقرأ إشارته. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-5', 'أزواج لا تفصلها العين', ['hisab-farq'], <GeoFigure {...FIGURE_E1} />),
        step(2, 'ex-27', 'الترتيب من الفرق وحده', ['maana-farq']),
        step(3, 'ex-28', 'الإشارة قبل الحساب', ['maana-farq']),
        step(4, 'ex-30', 'أزواج من الكسور', ['hisab-farq']),
        step(5, 'ex-29', 'الآلة الحاسبة', ['hisab-farq']),
        step(6, 'self-9', 'العدد π وكسر وعشري', ['hisab-farq']),
        step(7, 'ex-32', 'عبارتان في x', ['farq-ibaratayn']),
        step(8, 'deep-38', 'محيطان ومساحتان', ['farq-ibaratayn'], <GeoFigure {...FIGURE_E8} />),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
