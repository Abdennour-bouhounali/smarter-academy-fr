import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';
import { FIGURES, REDRAWN_NOTE } from '../content/figures';

/**
 * Module 4 — أتمرّن : نشاط 1 (p. 53, posé en APPLICATION : 5 ÷ 6 = 5/6), exercices 1 à 5 (p. 57), أقوّم 1 (p. 59, tubes REDESSINÉS) et 9.
 * Les figures sont des données (content/figures.js, GeoFigure) ; ex-2 ③ et self-1 sont redessinées et le disent en une ligne. Corrigés,
 * jamais comptés. LP : P1, P2.
 */
const withFigures = (id, node) => (
  <div className="space-y-3">
    {FIGURES[id] && (
      <div className="space-y-1">
        <div className="flex flex-wrap items-start justify-center gap-3" data-exercise-figures={id}>
          {FIGURES[id].map((fig, i) => <GeoFigure key={i} {...fig} maxWidth={id === 'self-1' ? 250 : 150} />)}
        </div>
        {(id === 'ex-2' || id === 'self-1') && <p className="text-center text-xs text-slate-500">{REDRAWN_NOTE}</p>}
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
      objectives={['أطبّق ما وجدته على كعكات جديدة', 'أعبّر بكسر عن جزء من شكل', 'أجد العدد الناقص']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="قسمة كعكات، كسر من شكل، عدد ناقص"
      estimatedTime="12 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>نقتسم كعكات من جديد، ثم تمارين على الكسر وحاصل القسمة. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-1', 'نشاط 1 — خمسة أرغفة لستة أشخاص', ['kasr-hasil-qisma']),
        step(2, 'ex-1', 'تمرين 1 — عبّر بكسر عن السطح الملوّن', ['kasr-hasil-qisma']),
        step(3, 'ex-2', 'تمرين 2 — هل هو ثلاثة أرباع؟', ['kasr-hasil-qisma']),
        step(4, 'ex-3', 'تمرين 3 — اذكر الكسر', ['kasr-hasil-qisma']),
        step(5, 'ex-4', 'تمرين 4 — العدد الناقص كسرا', ['natija-darb', 'tariqat-adad-naqis']),
        step(6, 'ex-5', 'تمرين 5 — أنقل وأتمم', ['natija-darb']),
        step(7, 'self-1', 'أقوّم 1 — أنابيب الاختبار', ['kasr-hasil-qisma']),
        step(8, 'self-9', 'أقوّم 9 — أكتب العدد الناقص', ['natija-darb', 'tariqat-adad-naqis']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
