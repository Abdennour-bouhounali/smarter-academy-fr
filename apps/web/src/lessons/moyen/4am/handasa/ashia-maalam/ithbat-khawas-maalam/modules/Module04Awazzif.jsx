import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf, CORRECTIONS } from '../content/exercises';
import * as F from '../content/figures';

/**
 * Module 4 — أوظّف تعلّماتي (p. 147 : ex-13, 18, 19 ; p. 149 « أتعمّق » : ex-21, 24, 26, 27).
 * AUTOMATIZE : ex-13 (milieux, côtés, Pythagore → carré), ex-21 (composantes, longueurs, rectangle non isocèle). TRANSFER :
 * ex-18 (cercle de diamètre [AC], perpendicularité par l'isocèle), ex-19 (des coordonnées en √3/2 : équilatéral, centre O),
 * ex-24 (rectangle puis carré, diagonales perpendiculaires), ex-26 (isocèle non rectangle, D, losange ACBD, aire 35),
 * ex-27 (D par translation, carré). Une ligne pour chaque correction (ex-13, ex-21, ex-26) et pour la lecture de ex-24 Q3.
 * Une étape par exercice, faite quand chaque partie a reçu une réponse (juste ou fausse). Les figures « après » (le
 * cercle, D) n'apparaissent qu'une fois la partie qui les calcule répondue.
 */
const FIGURES = {
  ex13: F.FIG_EX13, ex18: F.FIG_EX18, ex18done: F.FIG_EX18_DONE, ex19: F.FIG_EX19, ex19done: F.FIG_EX19_DONE,
  ex21: F.FIG_EX21, ex24: F.FIG_EX24, ex26: F.FIG_EX26, ex26done: F.FIG_EX26_DONE, ex27: F.FIG_EX27, ex27done: F.FIG_EX27_DONE,
};

function Exercise({ ex, requires, onDone, reveal }) {
  return (
    <div className="space-y-2">
      {ex.correction && <p className="text-xs font-semibold text-amber-800" data-correction={ex.id}><MathText>{CORRECTIONS[ex.correction]}</MathText></p>}
      {ex.figure && (reveal || !ex.figure.endsWith('done')) && <GeoFigure {...FIGURES[ex.figure]} />}
      <TextbookExercise exercise={ex} requires={requires} onAnswered={onDone} />
    </div>
  );
}

export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (n) => partsOf(n).every((ex) => done[ex.id]);
  const block = (n, requires) => partsOf(n).map((ex, i, list) => (
    <Exercise key={ex.id} ex={ex} requires={requires} onDone={mark(ex.id)} reveal={i > 0 && done[list[i - 1].id]} />
  ));

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4} moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين الكتاب 13 و 18 و 19 و 21 و 24 و 26 و 27" objectives={['أوظّف الحساب في إثبات طبيعة مثلث ورباعي', 'أبرهن بنفسي على انتماء نقطة إلى دائرة', 'أنتقي الدليل الكافي في كل تمرين']} estimatedTime="10 دقائق"
      brief={{ tag: 'تمارين الكتاب — ص 147 و 149', title: 'تمارين الكتاب، بعباراته', tone: 'amber',
        body: <p>في كل تمرين: احسب مربعات الأطوال أو المركبات أو المنتصفات من الإحداثيات، ثم اختر الدليل الكافي واستنتج. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 13 — رباعي في معلم', done: all('13'),
          content: <div className="space-y-3">{block('13', ['muntasaf-maalam', 'tabiat-rubai', 'tabiat-muthallath'])}</div> },
        { num: 2, title: 'تمرين 21 — مثلث قائم', done: all('21'),
          content: <div className="space-y-3">{block('21', ['murakkibat-shuaa', 'masafa-maalam', 'tabiat-muthallath'])}</div> },
        { num: 3, title: 'تمرين 18 — دائرة قطرها [AC]', done: all('18'),
          content: <div className="space-y-3">{block('18', ['intima-daira', 'taamud', 'tabiat-muthallath'])}</div> },
        { num: 4, title: 'تمرين 19 — مثلث متقايس الأضلاع', done: all('19'),
          content: <div className="space-y-3">{block('19', ['tabiat-muthallath', 'intima-daira'])}</div> },
        { num: 5, title: 'تمرين 24 — من المستطيل إلى المربّع', done: all('24'),
          content: <div className="space-y-3">{block('24', ['tabiat-rubai', 'adilla-kafiya', 'muntasaf-maalam'])}</div> },
        { num: 6, title: 'تمرين 26 — معيّن ومساحته', done: all('26'),
          content: <div className="space-y-3">{block('26', ['tabiat-muthallath', 'tabiat-rubai', 'taamud'])}</div> },
        { num: 7, title: 'تمرين 27 — مربّع بانسحاب', done: all('27'),
          content: <div className="space-y-3">{block('27', ['tabiat-muthallath', 'tabiat-rubai', 'murakkibat-shuaa'])}</div> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />} />
  );
}
