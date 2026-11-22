import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';
import { FIG_EX3, FIG_EX7, FIG_EX8, FIG_EX11, FIG_EX23 } from '../content/figures';

/**
 * Module 3 — أوظّف تعلّماتي (pp. 122–123, « النسب المثلثية - استعمال حاسبة », et ex-23 placé sous « إنشاءات هندسية »).
 * AUTOMATIZE : ex-3 (40° : les outils, la calculatrice, la comparaison avec des mesures — un triangle mesuré par un
 * élève, déclaré), ex-7 (le programme cos⁻¹ (4 ÷ 4,4), ACB ≈ 25°), ex-8 (DE = 5,6 puis FED ≈ 37°), ex-11 (R ≈ 21,8°).
 * TRANSFER : ex-23 (corriger ليلى — le rapport pris pour l'angle — et رضا — le mauvais rapport —, KML ≈ 56°).
 * Une étape par exercice, faite quand chaque partie a reçu une réponse (juste ou fausse). Figures : GeoFigure.
 */
const FIGURES = {
  ex3: <GeoFigure {...FIG_EX3} />,
  ex7: <GeoFigure {...FIG_EX7} />,
  ex8: <GeoFigure {...FIG_EX8} />,
  ex11: <GeoFigure {...FIG_EX11} />,
  ex23: <GeoFigure {...FIG_EX23} />,
};

function Exercise({ ex, requires, onDone }) {
  return (
    <div className="space-y-2">
      {ex.figure && FIGURES[ex.figure]}
      <TextbookExercise exercise={ex} requires={requires} onAnswered={onDone} />
    </div>
  );
}

export default function Module03Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (n) => partsOf(n).every((ex) => done[ex.id]);
  const block = (n, requires) => partsOf(n).map((ex) => <Exercise key={ex.id} ex={ex} requires={requires} onDone={mark(ex.id)} />);

  return (
    <ContentModule
      objectives={['أحسب نسبًا وأقيسًا بالحاسبة', 'أكتب برنامج الحاسبة بترتيبه الصحيح', 'أحكم على حلّ زميل وأصحّح خطأه']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين الكتاب 3 و 7 و 8 و 11 و 23"
      estimatedTime="10 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي — الكتاب ص 122 و 123', title: 'تمارين الكتاب، بعباراته', tone: 'amber',
        body: <p>اكتب الأعداد العشرية بالفاصلة (مثل 21,8) والأقياس بالدرجة دون الرمز. الحاسبة مبرمجة بالدرجة. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 3 — القياس والحاسبة', done: all('3'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="hasiba-nisba" variant="rappel" compact />
              {block('3', ['hasiba-nisba', 'tadwir-dalaqa'])}
            </div>
          ) },
        { num: 2, title: 'تمرين 7 — اكتب البرنامج', done: all('7'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="hasiba-zawiya" variant="rappel" compact />
              {block('7', ['hasiba-zawiya', 'tadwir-dalaqa'])}
            </div>
          ) },
        { num: 3, title: 'تمرين 8 — DE ثم الزاوية', done: all('8'),
          content: <div className="space-y-3">{block('8', ['hasiba-zawiya', 'tadwir-dalaqa'])}</div> },
        { num: 4, title: 'تمرين 11 — الزاوية R', done: all('11'),
          content: <div className="space-y-3">{block('11', ['hasiba-zawiya', 'tadwir-dalaqa'])}</div> },
        { num: 5, title: 'تمرين 23 — أخطاء ليلى ورضا', done: all('23'),
          content: <div className="space-y-3">{block('23', ['hasiba-zawiya', 'barmaja-daraja'])}</div> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
