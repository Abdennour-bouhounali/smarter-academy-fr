import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf, CORRECTIONS } from '../content/exercises';
import { FIG_EX1, FIG_EX2, FIG_EX4, FIG_EX5, FIG_EX5_SOL, FIG_EX8 } from '../content/figures';

/**
 * Module 4 — أوظّف تعلّماتي (p. 134, « الأشعة والمساواة الشعاعية » et « الأشعة ومتوازي الأضلاع »).
 * AUTOMATIZE : ex-1 (les trois éléments d'un vecteur donné en mots, puis deux représentants), ex-2 (deux égalités lues
 * sur le quadrillage), ex-4 (le sapin : une image, des vecteurs égaux). TRANSFER : ex-3 (représentants, K milieu), ex-5
 * (le losange → BMND rectangle), ex-8 (le rectangle et ses milieux, deux preuves). Deux coquilles corrigées en une ligne
 * (ex-4 : 5 vecteurs et non 6 ; ex-8 : 3 et non 4). Une étape par exercice, faite quand chaque partie a reçu une réponse.
 */
const FIGURES = {
  ex1: <GeoFigure {...FIG_EX1} />,
  ex2: <GeoFigure {...FIG_EX2} />,
  ex4: <GeoFigure {...FIG_EX4} />,
  ex5: <GeoFigure {...FIG_EX5} />,
  ex8: <GeoFigure {...FIG_EX8} />,
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
      moduleNumber={4} objectives={['كيف أقرأ شعاعًا على المرصوفة؟', 'كيف أعرف أنّ شعاعين متساويان؟', 'ماذا يعطيني متوازي الأضلاع من أشعة متساوية؟']}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين الكتاب 1 و 2 و 3 و 4 و 5 و 8"
      estimatedTime="10 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي — الكتاب ص 134', title: 'تمارين الكتاب، بعباراته', tone: 'amber',
        body: <p>على المرصوفة، عُدّ المربعات أفقيا ثم شاقوليا مع الجهة، كما فعلت مع المسيّرات. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 1 — الشعاع u', done: all('1'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="shuaa" variant="rappel" compact />
              {block('1', ['shuaa'])}
            </div>
          ) },
        { num: 2, title: 'تمرين 2 — على المرصوفة', done: all('2'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tasawi-shuaayn" variant="rappel" compact />
              {block('2', ['tasawi-shuaayn'])}
            </div>
          ) },
        { num: 3, title: 'تمرين 3 — ممثّلات شعاع', done: all('3'),
          content: <div className="space-y-3">{block('3', ['tasawi-shuaayn', 'mutawazi-adlaa'])}</div> },
        { num: 4, title: 'تمرين 4 — شجرة الصنوبر', done: all('4'),
          content: <div className="space-y-3">{block('4', ['insihab-shuaa', 'tasawi-shuaayn'])}</div> },
        { num: 5, title: 'تمرين 5 — المعين ABCD', done: all('5'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="mutawazi-adlaa" variant="rappel" compact />
              {block('5', ['mutawazi-adlaa', 'mulahazat'])}
              {all('5') && <GeoFigure {...FIG_EX5_SOL} />}
            </div>
          ) },
        { num: 6, title: 'تمرين 8 — المستطيل ومنتصفات أضلاعه', done: all('8'),
          content: <div className="space-y-3">{block('8', ['tasawi-shuaayn', 'mutawazi-adlaa'])}</div> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
