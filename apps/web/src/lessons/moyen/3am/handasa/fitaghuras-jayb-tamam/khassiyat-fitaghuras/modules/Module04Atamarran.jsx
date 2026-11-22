import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';
import { FIGURES } from '../content/figures';

/**
 * Module 4 — أتمرّن : le نشاط 1 du manuel (Perigal) est posé ICI en APPLICATION (des aires de carrés sur les côtés), avec les exercices
 * RÉÉCRITS par la plateforme (autres triangles, autres nombres) : l'égalité pour un triangle nommé, le troisième côté, corriger un
 * raisonnement, une diagonale, une hauteur, la calculatrice, un triangle qui a l'AIR droit. Figures : content/figures.js. Corrigés, jamais
 * comptés. LP : P1, P2, P3, P4.
 */
const withFigures = (id, node) => (
  <div className="space-y-3">
    {FIGURES[id] && (
      <div className="flex flex-wrap items-start justify-center gap-4" data-exercise-figures={id}>
        {FIGURES[id].map((fig, i) => <GeoFigure key={i} {...fig} />)}
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
      objectives={['أكتب مساواة فيثاغورس لمثلث مسمّى', 'أحسب الوتر أو ضلعا قائما', 'أستعمل الآلة الحاسبة وأدوّر', 'أُثبت أنّ مثلثا غير قائم']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="مربعات على الأضلاع، المساواة، الضلع الثالث، تصويب برهان، قطر وارتفاع، الآلة الحاسبة، مثلث يبدو قائما"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>مثلثات قائمة ومربعات وأطوال: أجب، ثم اقرأ التصحيح. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-1', 'ثلاثة مربعات على أضلاع مثلث قائم', ['fitaghuras']),
        step(2, 'ex-1', 'أيّ مساواة؟', ['watar']),
        step(3, 'ex-3', 'الضلع الثالث', ['hisab-dil']),
        step(4, 'ex-9', 'هل برهان زميلك صحيح؟', ['watar']),
        step(5, 'ex-11', 'قطر المستطيل', ['hisab-watar']),
        step(6, 'ex-13', 'ارتفاع مثلث متساوي الساقين', ['hisab-dil']),
        step(7, 'ex-7', 'الآلة الحاسبة والتدوير', ['lamsa-jidhr']),
        step(8, 'ex-17', 'مثلث يبدو قائما', ['ithbat-ghayr-qaim']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
