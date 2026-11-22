import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf, CORRECTIONS } from '../content/exercises';
import { FIG_EX4, FIG_EX4_SOL1, FIG_EX4_SOL2, FIG_EX8, FIG_EX17, FIG_EX17_SOL, FIG_EX18 } from '../content/figures';

/**
 * Module 4 — أوظّف تعلّماتي (pp. 158–161).
 * AUTOMATIZE : ex-4 (le carré ABA′C, l'image d'un triangle par (C, 45°)), ex-6 (BM = CN : la preuve rangée ligne à ligne),
 * ex-8 (cinq دورانات lus sur une figure codée). TRANSFER : ex-17 (BEM : milieu, demi-tour, rectangle — coquille corrigée
 * ABCD → ABDC), ex-18 (les centres O et W par les médiatrices — figure complétée, le scan est presque effacé).
 * Une étape par exercice, faite quand chaque partie a reçu une réponse.
 */
const FIGURES = {
  ex4: <GeoFigure {...FIG_EX4} />,
  ex8: <GeoFigure {...FIG_EX8} />,
  ex17: <GeoFigure {...FIG_EX17} />,
  ex17sol: <GeoFigure {...FIG_EX17_SOL} />,
  ex18: <GeoFigure {...FIG_EX18} />,
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
  // la figure d'un exercice à plusieurs parties n'est dessinée qu'une fois, sauf quand une partie en change
  const block = (n, requires) => partsOf(n).map((ex, i) => {
    const prev = partsOf(n)[i - 1];
    return <Exercise key={ex.id} ex={ex} requires={requires} onDone={mark(ex.id)} showFigure={i === 0 || ex.figure !== prev?.figure} />;
  });

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين الكتاب 4 و 6 و 8 و 17 و 18"
      estimatedTime="10 دقائق"
      objectives={["أستعمل خواص الدوران في تمارين الكتاب", "أحدّد الدوران الذي يحوّل شكلا إلى آخر", "أجد مركز دوران مجهول"]}
      brief={{ tag: 'أوظّف تعلّماتي — الكتاب ص 158 إلى 161', title: 'تمارين الكتاب، بعباراته', tone: 'amber',
        body: <p>لكل دوران: مركز، زاوية، اتجاه. ولكل إثبات: ابحث عن الدوران الذي يحوّل شكلا إلى آخر، ثم طبّق خواصه. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 4 — المربع ABA′C', done: all('4'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="khawas-dawaran" variant="rappel" compact />
              {block('4', ['khawas-dawaran'])}
              {done['ex-4-a'] && <GeoFigure {...FIG_EX4_SOL1} />}
              {done['ex-4-b'] && <GeoFigure {...FIG_EX4_SOL2} />}
            </div>
          ) },
        { num: 2, title: 'تمرين 6 — $BM = CN$', done: all('6'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="istimal-khawas" variant="rappel" compact />
              {block('6', ['istimal-khawas'])}
            </div>
          ) },
        { num: 3, title: 'تمرين 8 — خمسة دورانات في شكل', done: all('8'),
          content: <div className="space-y-3">{block('8', ['surat-nuqta-dawaran', 'ittijah-dawaran'])}</div> },
        { num: 4, title: 'تمرين 17 — من شهادة التعليم المتوسط', done: all('17'),
          content: <div className="space-y-3">{block('17', ['muntasaf-maalam', 'khawas-dawaran', 'mustatil-qutran'])}</div> },
        { num: 5, title: 'تمرين 18 — أين المركز؟', done: all('18'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="markaz-dawaran" variant="rappel" compact />
              {block('18', ['markaz-dawaran'])}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
