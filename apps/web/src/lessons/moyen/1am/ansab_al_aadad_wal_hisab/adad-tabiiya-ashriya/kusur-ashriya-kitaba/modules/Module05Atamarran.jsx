import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';
import { FIGURES } from '../content/figures';

/**
 * Module 5 — أتمرّن : les activités du manuel (نشاط 2 et 3) sont posées ICI en APPLICATION de ce que l'élève a découvert à l'atelier
 * (guide §4ter : le manuel est la référence, pas l'entrée), avec les exercices 4–14 et 26–28 RÉÉCRITS par la plateforme (autres contextes,
 * autres nombres). Une plaque 10 × 10 pour le sens (P1), puis de la virgule au كسر عشري et retour (P2), le مفكوك (P3), les zéros (P2)
 * et × ÷ 10, 100, 1000 (P4). Corrigés, jamais comptés. LP : P1–P4.
 */
const withFigures = (id, node) => (
  <div className="space-y-3">
    {FIGURES[id] && (
      <div className="flex flex-wrap items-start justify-center gap-3" data-exercise-figures={id}>
        {FIGURES[id].map((fig, i) => <GeoFigure key={i} {...fig} maxWidth={150} />)}
      </div>
    )}
    {node}
  </div>
);

export default function Module05Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const step = (num, id, title, req) => ({
    num, title, done: !!done[id],
    content: withFigures(id, <TextbookExercise exercise={EX[id]} requires={req} onAnswered={mark(id)} />),
  });
  return (
    <ContentModule
      objectives={['أعبّر بكسر عشري عن جزء ملوّن', 'أنتقل من الفاصلة إلى الكسر وبالعكس', 'أضرب وأقسم على 10 و 100 و 1000']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="أتمرّن"
      moduleSubtitle="صفائح ملوّنة، فاصلة وكسر، مفكوك، أصفار، ضرب وقسمة"
      estimatedTime="12 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>صفائح الزليج من جديد، ثم تمارين على الفاصلة والكسر العشري والمفكوك والأصفار. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-2', 'صفائح الزليج الملوّنة', ['kasr-ashri']),
        step(2, 'act-3', 'من الكسر العشري إلى الفاصلة', ['kitaba-bifasila']),
        step(3, 'ex-10', 'من الفاصلة إلى الكسر العشري', ['tariqat-intiqal']),
        step(4, 'ex-6', 'مساويات ومجاميع', ['kasr-ashri']),
        step(5, 'ex-8', 'من المجموع إلى الفاصلة', ['mafkuk-ashri']),
        step(6, 'ex-11', 'أصفار نحذفها وأصفار نُبقيها', ['asfar-ghayr-darurya']),
        step(7, 'ex-12', 'المفكوك في الاتجاهين', ['mafkuk-ashri']),
        step(8, 'ex-26', 'احسب ذهنيًا', ['azaha-fasila']),
        step(9, 'ex-27', 'آلة معطّلة ووحدات القياس', ['azaha-fasila']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={5} variant="memo" />}
    />
  );
}
