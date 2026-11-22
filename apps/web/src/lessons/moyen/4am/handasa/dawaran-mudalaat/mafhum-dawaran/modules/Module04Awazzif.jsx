import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf, CORRECTIONS } from '../content/exercises';
import { FIG_EX1, FIG_EX2, FIG_EX5, FIG_EX7 } from '../content/figures';

/**
 * Module 4 — أوظّف تعلّماتي (pp. 158–159, « صورة شكل بدوران »).
 * AUTOMATIZE : ex-2 (la croix : ① ↦ ②, puis centre, angle et sens), ex-7 (② = ① tourné : quel angle, quel sens), ex-1
 * (quatre segments : 95°, 230°, l'antécédent par 265° — trois fois [OA], c'est voulu). TRANSFER : ex-3 (deux rotations de
 * même centre et même sens : 139° − 50° = 89°, pas un angle droit), ex-5 (l'éventail : les écarts lus sur le scan donnés
 * comme données, figure redessinée exacte). Une étape par exercice, faite quand chaque partie a reçu une réponse.
 */
const FIGURES = {
  ex1: <GeoFigure {...FIG_EX1} />,
  ex2: <GeoFigure {...FIG_EX2} />,
  ex5: <GeoFigure {...FIG_EX5} />,
  ex7: <GeoFigure {...FIG_EX7} />,
};

function Exercise({ ex, requires, onDone, showFigure = true }) {
  return (
    <div className="space-y-2">
      {showFigure && ex.figure && FIGURES[ex.figure]}
      {ex.correction && <p className="text-xs text-slate-500" data-correction><MathText>{CORRECTIONS[ex.correction]}</MathText></p>}
      <TextbookExercise exercise={ex} requires={requires} onAnswered={onDone} />
    </div>
  );
}

export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (n) => partsOf(n).every((ex) => done[ex.id]);
  // la figure d'un exercice à plusieurs parties n'est dessinée qu'une fois (avant la première partie)
  const block = (n, requires) => partsOf(n).map((ex, i) => <Exercise key={ex.id} ex={ex} requires={requires} onDone={mark(ex.id)} showFigure={i === 0} />);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين الكتاب 1 و 2 و 3 و 5 و 7"
      estimatedTime="8 دقائق"
      objectives={["أحدّد مركز الدوران وزاويته واتجاهه في الأشكال", "أنشئ صور نقط وقطع بالدوران"]}
      brief={{ tag: 'أوظّف تعلّماتي — الكتاب ص 158–159', title: 'تمارين الكتاب، بعباراته', tone: 'amber',
        body: <p>لكل دوران: المركز، ثم الزاوية التي نعدّها من صورة إلى أخرى، ثم الاتجاه (عكس عقارب الساعة أم معها). الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 2 — أربعة مثلثات', done: all('2'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="ittijah" variant="rappel" compact />
              {block('2', ['dawaran', 'ittijah'])}
            </div>
          ) },
        { num: 2, title: 'تمرين 7 — الشكلان ① و ②', done: all('7'),
          content: <div className="space-y-3">{block('7', ['dawaran', 'ittijah'])}</div> },
        { num: 3, title: 'تمرين 1 — أربع قطع متقايسة', done: all('1'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tariqat-qitaa" variant="rappel" compact />
              {block('1', ['surat-nuqta', 'tariqat-qitaa'])}
              {all('1') && <p className="text-xs text-slate-500"><MathText>{CORRECTIONS.ex1}</MathText></p>}
            </div>
          ) },
        { num: 4, title: 'تمرين 3 — دورانان حول A', done: all('3'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="surat-nuqta" variant="rappel" compact />
              {block('3', ['surat-nuqta', 'tariqat-nuqta'])}
            </div>
          ) },
        { num: 5, title: 'تمرين 5 — المروحة', done: all('5'),
          content: <div className="space-y-3">{block('5', ['dawaran', 'ittijah'])}</div> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
