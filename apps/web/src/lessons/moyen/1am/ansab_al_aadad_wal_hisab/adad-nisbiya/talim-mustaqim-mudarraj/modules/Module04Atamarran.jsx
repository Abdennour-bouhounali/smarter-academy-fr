import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';
import { FIGURES } from '../content/figures';

/**
 * Module 4 — أتمرّن : les exercices 10 à 15, « دوري الآن » (p. 68), « أقوّم تعلّماتي » 6 et « أتعمّق » 3 et 4 du manuel sont posés ICI en APPLICATION de ce que l'élève a fait sur la route
 * (guide §4ter : le manuel est la référence, pas l'entrée), RÉÉCRITS par la plateforme (autres nombres, autres graduations). Les droites graduées sont des données (content/figures.js, GeoFigure).
 * Corrigés, jamais comptés. LP : P1–P3.
 */
const FIG_OF = { 'ex-12': ['read'], 'ex-13': ['origin1', 'origin2'] };

const withFigures = (id, node) => (
  <div className="space-y-3">
    {FIG_OF[id] && (
      <div className="flex flex-col items-center gap-2" data-exercise-figures={id}>
        {FIG_OF[id].map((key) => <GeoFigure key={key} {...FIGURES[key]} maxWidth={440} />)}
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
      objectives={['أقرأ فاصلة نقطة على مستقيم مدرّج', 'أجد المبدأ وأحسب البعد بالسنتيمتر', 'أعيّن النظير وأحكم على جمل عن المستقيم المدرّج']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="قراءة، مبدأ، بعد، نظير، مجاورة"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>قراءة فواصل بالتدريجات الصغيرة، إيجاد المبدإ من علامتين، البعد بالسنتيمتر، النظير، ثمّ صحيح أم خاطئ وتعليم نقاط. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'ex-12', 'قراءة الفواصل', ['fasila-nuqta']),
        step(2, 'ex-13', 'أين المبدأ؟', ['fasila-nuqta']),
        step(3, 'ex-14', 'البعد بالسنتيمتر', ['tadrij-jihatayn']),
        step(4, 'act-1-line', 'النظير', ['nuqtatan-mutanazirtan']),
        step(5, 'deep-3', 'علامات متجاورة', ['fasila-nuqta']),
        step(6, 'deep-4', 'حلزون على المستقيم', ['fasila-nuqta']),
        step(7, 'ex-10', 'صحيح أم خاطئ؟', ['mustaqim-mudarraj']),
        step(8, 'self-6', 'تعليم نقاط', ['fasila-nuqta']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
