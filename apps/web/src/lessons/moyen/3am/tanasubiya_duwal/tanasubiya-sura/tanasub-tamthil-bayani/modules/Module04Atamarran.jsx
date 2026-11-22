import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 1 du manuel est posé ICI en APPLICATION de ce que « سكك الدبابيس » a montré (guide §4ter : le manuel est la référence, pas l'entrée), avec les
 * exercices 1–5, أتعمّق 31, 32, 33 et 41 RÉÉCRITS et regroupés par la plateforme (autres nombres ; chacun cite ceux qu'il remplace). Les figures sont des données `GeoFigure`
 * (content/figures.js). Corrigés, jamais comptés. LP : P1–P4.
 */
export default function Module04Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const step = (num, id, title, req) => {
    const ex = EX[id];
    const figs = ex.figures ?? (ex.figure ? [ex.figure] : []);
    return {
      num, title, done: !!done[id],
      content: (
        <div className="space-y-2">
          {figs.length > 0 && <div className="flex flex-wrap items-start justify-center gap-3" data-exercise-figures>{figs.map((f, i) => <GeoFigure key={i} {...f} />)}</div>}
          <TextbookExercise exercise={ex} requires={req} onAnswered={mark(id)} />
        </div>
      ),
    };
  };
  return (
    <ContentModule
      objectives={['أحكم على عرض ببيانه', 'أقرأ نقطة وأحسب قيمة', 'أعرف متى لا تكون الوضعية تناسبية']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="عروض كرّاريس، معالم، ماء، علب، براميل، آلة، نقطة، كوكب"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>عشرة تمارين على التمثيل البياني لوضعية تناسبية. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-1', 'ثلاثة عروض كرّاريس', ['tamthil-tanasub']),
        step(2, 'ex-1', 'ثلاثة معالم', ['tamthil-tanasub']),
        step(3, 'ex-2', 'صنبور الماء', ['qiraa-qima']),
        step(4, 'ex-3', 'علب متماثلة', ['tamthil-tanasub']),
        step(5, 'ex-4', 'الماء المالح', ['qiraa-qima']),
        step(6, 'ex-5', 'براميل الماء', ['qiraa-qima']),
        step(7, 'deep-31', 'آلة الخرسانة', ['tamthil-tanasub']),
        step(8, 'deep-32', 'أين أضع النقطة؟', ['y-ax']),
        step(9, 'deep-33', 'نصف مستقيم يمرّ بـ O', ['y-ax']),
        step(10, 'deep-41', 'ميزان كوكب بعيد', ['y-ax']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
