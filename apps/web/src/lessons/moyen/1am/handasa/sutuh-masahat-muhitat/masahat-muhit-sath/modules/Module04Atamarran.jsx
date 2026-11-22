import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';
import { FIGURES } from '../content/figures';

/**
 * Module 4 — أتمرّن : le نشاط 1 du manuel est posé ICI en APPLICATION de ce que l'élève a découvert dans le حوش (guide §4ter : le manuel est
 * la référence, pas l'entrée), avec les exercices 1 à 6 et أقوّم 2 RÉÉCRITS par la plateforme (autres surfaces, autres nombres). Les surfaces
 * sont des données (content/figures.js, GeoFigure) ; les consignes de dessin du manuel (ex 4–6, أقوّم 2) deviennent des choix. Corrigés,
 * jamais comptés. LP : P1, P2, P3.
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
      objectives={['أعيّن مساحة ومحيط أسطح مرسومة', 'أقارن سطحين', 'أعدّ أنصاف البلاطات', 'أبحث عن مستطيل ومربّع بالمساحة نفسها']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="جدول، خيط، زاوية ووسط، أنصاف بلاطات، أزواج، مستطيل ومربّع"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>أسطح مرسومة على ورقة مرصوفة: نعدّ البلاطات ونعدّ العصي ونقارن. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-1', 'أربعة أسطح: مساحة ومحيط', ['masaha-adad', 'mahit-hadd']),
        step(2, 'act-1-compare', 'ماذا يتساوى في كل زوج؟', ['thalath-hallat']),
        step(3, 'ex-1', 'الخيط حول الشكل', ['mahit-hadd']),
        step(4, 'ex-2', 'الزاوية والوسط', ['naql-baqat-masaha']),
        step(5, 'ex-3', 'أنصاف البلاطات', ['tariqat-rasf']),
        step(6, 'ex-4', 'ثلاثة أزواج', ['thalath-hallat']),
        step(7, 'self-2', 'مستطيل ومربّع بالمساحة نفسها', ['thalath-hallat']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
