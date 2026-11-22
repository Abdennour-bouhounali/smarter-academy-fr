import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf, CORRECTIONS } from '../content/exercises';
import { FIG_EX9, FIG_EX9_SOL, FIG_EX13, FIG_EX14, FIG_EX15, FIG_EX19 } from '../content/figures';

/**
 * Module 4 — أوظّف تعلّماتي (pp. 159–161).
 * AUTOMATIZE : ex-13 (le décagone : 144° et 36°), ex-19 (l'hexagone de périmètre 96 m : côté, OH = 8√3, aire, rapport au
 * disque). TRANSFER : ex-9 (l'image du triangle équilatéral par 45°, et les autres rotations — خاصية 3), ex-14 (l'octogone,
 * OA = √8 : sin 45°, OL, l'aire), ex-15 (doublon déclaré, coquille corrigée : cinq rotations de 72° autour de A donnent le
 * pentagone BCDEF). Une étape par exercice, faite quand chaque partie a reçu une réponse.
 */
const FIGURES = {
  ex9: <GeoFigure {...FIG_EX9} />,
  ex13: <GeoFigure {...FIG_EX13} />,
  ex14: <GeoFigure {...FIG_EX14} />,
  ex15: <GeoFigure {...FIG_EX15} />,
  ex19: <GeoFigure {...FIG_EX19} />,
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
      moduleSubtitle="تمارين الكتاب 13 و 19 و 9 و 14 و 15"
      estimatedTime="8 دقائق"
      objectives={["أطبّق على مضلعات منتظمة مختلفة", "أبدأ دائمًا من الزاوية المركزية"]}
      brief={{ tag: 'أوظّف تعلّماتي — الكتاب ص 159 و 161', title: 'تمارين الكتاب، بعباراته', tone: 'amber',
        body: <p>ابدأ دائما بالزاوية المركزية، ثم المثلث المتساوي الساقين الذي رأسه المركز. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 13 — العشاري المنتظم', done: all('13'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="zawiyat-mudalla" variant="rappel" compact />
              {block('13', ['markaziya-360', 'zawiyat-mudalla'])}
            </div>
          ) },
        { num: 2, title: 'تمرين 19 — السداسي المنتظم', done: all('19'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="dil-mudalla" variant="rappel" compact />
              {block('19', ['daira-muhita', 'dil-mudalla'])}
            </div>
          ) },
        { num: 3, title: 'تمرين 9 — دوران مثلث متقايس الأضلاع', done: all('9'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="surat-mudalla" variant="rappel" compact />
              {block('9', ['ruus-bidawaran', 'surat-mudalla'])}
              {all('9') && <GeoFigure {...FIG_EX9_SOL} />}
            </div>
          ) },
        { num: 4, title: 'تمرين 14 — الثماني المنتظم', done: all('14'),
          content: <div className="space-y-3">{block('14', ['zawiyat-mudalla', 'dil-mudalla'])}</div> },
        { num: 5, title: 'تمرين 15 — خمسة دورانات حول A', done: all('15'),
          content: <div className="space-y-3">{block('15', ['ruus-bidawaran', 'tarif-muntazam', 'dil-mudalla'])}</div> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
