import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';
import { FIGURES } from '../content/figures';

/**
 * Module 4 — أتمرّن : les exercices 16 à 21, « دوري الآن » (p. 70), « أقوّم تعلّماتي » 8 et 9 et 10 et « أتعمّق » 5 et 7 du manuel sont posés ICI en APPLICATION de ce que l'élève a fait dans la cour
 * (guide §4ter : le manuel est la référence, pas l'entrée), RÉÉCRITS par la plateforme (autres points, autres contextes). Les معالم sont des données (content/figures.js, GeoFigure : grille + axes).
 * Corrigés, jamais comptés. LP : P1–P3.
 */
const FIG_OF = { 'ex-20': ['read'], 'ex-21': ['words'], 'ex-18': ['hidden'], 'deep-7': ['lines'] };

const withFigures = (id, node) => (
  <div className="space-y-3">
    {FIG_OF[id] && (
      <div className="flex flex-col items-center gap-2" data-exercise-figures={id}>
        {FIG_OF[id].map((key) => <GeoFigure key={key} {...FIGURES[key]} maxWidth={400} />)}
      </div>
    )}
    {node}
  </div>
);

export default function Module04Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const step = (num, id, title, req) => ({
    num, title, done: !!done[id],
    content: withFigures(id, <TextbookExercise exercise={EX[id]} requires={req} onAnswered={mark(id)} />),
  });
  return (
    <ContentModule
      objectives={['أقرأ إحداثيي نقطة وأميّز نقط المحورين', 'أجد المبدأ المخفي وأقرأ نقطًا على خطّ واحد', 'أصف موضع نقطة وأحسب البعد بالسنتيمتر']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="قراءة، محوران، كلمات، مبدأ مخفي، وصف، تدريج"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>قراءة إحداثيي نقط على معلم، نقط المحورين، الكلمات المناسبة، صحيح أم خاطئ، المعلم المخفي، نقط على خطّ واحد، وصف موضع النقطة والتدريج بالسنتيمتر. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'ex-20', 'قراءة الإحداثيات', ['ihdathiyyan']),
        step(2, 'ex-17', 'أين تقع النقطة؟', ['nuqta-ala-muhwar']),
        step(3, 'ex-21', 'الكلمة المناسبة', ['ihdathiyyan']),
        step(4, 'self-8', 'صحيح أم خاطئ؟', ['mu-allam-mutaamid']),
        step(5, 'ex-18', 'أين المبدأ؟', ['mu-allam-mutaamid']),
        step(6, 'deep-7', 'نقط على خطّ واحد', ['tartib-adadayn']),
        step(7, 'ex-16', 'وصف موضع النقطة', ['tariqat-talim']),
        step(8, 'ex-19', 'التدريج بالسنتيمتر', ['tariqat-talim']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
