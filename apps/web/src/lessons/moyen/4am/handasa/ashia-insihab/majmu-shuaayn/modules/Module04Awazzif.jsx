import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf, EX13_READING } from '../content/exercises';
import { PLATFORM_SOURCE } from '../content/textbook';
import { FIG_EX10, FIG_EX11, FIG_EX13, FIG_EX15, FIG_EX16 } from '../content/figures';

/**
 * Module 4 — أوظّف تعلّماتي (p. 135, « مجموع شعاعين - علاقة شال » : ex-10, 11, 13, 14, 15, 16).
 * AUTOMATIZE : ex-15 (deux vecteurs donnés : Chasles en changeant l'ordre, puis les DEUX méthodes), ex-14 (simplifier
 * avant de construire), ex-16 (le parallélogramme par ses diagonales, puis la règle). TRANSFER : ex-10 (quatre triangles
 * équilatéraux : remplacer un vecteur par un vecteur égal), ex-11 (deux translations successives), ex-13 (le triangle,
 * ses milieux et G — « AC + AA » gardé tel qu'imprimé, la lecture A′ B′ C′ dite en une ligne). Une étape par exercice,
 * faite quand chaque partie a reçu une réponse (juste ou fausse).
 */
const FIGURES = {
  ex10: <GeoFigure {...FIG_EX10} />,
  ex11: <GeoFigure {...FIG_EX11} />,
  ex13: (
    <div className="space-y-1">
      <GeoFigure {...FIG_EX13} />
      <p className="text-xs text-slate-500" data-reading="ex-13"><MathText>{EX13_READING}</MathText></p>
    </div>
  ),
  ex15: <GeoFigure {...FIG_EX15} />,
  ex16: (
    <div className="space-y-1">
      <GeoFigure {...FIG_EX16} />
      <p className="text-xs text-slate-500">شكل مناسب للسؤال 1) <SourceTag source={PLATFORM_SOURCE} /></p>
    </div>
  ),
};

function Exercise({ ex, requires, onDone }) {
  return (
    <div className="space-y-2">
      {ex.figure && FIGURES[ex.figure]}
      <TextbookExercise exercise={ex} requires={requires} onAnswered={onDone} />
    </div>
  );
}

export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (n) => partsOf(n).every((ex) => done[ex.id]);
  const block = (n, requires) => partsOf(n).map((ex) => <Exercise key={ex.id} ex={ex} requires={requires} onDone={mark(ex.id)} />);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4} objectives={['شعاعان متعاقبان أم لهما نفس المبدأ؟', 'ماذا أفعل إن لم يكن أيٌّ من الحالتين؟', 'كيف أنشئ ممثلًا للمجموع وأتحقّق منه؟']}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين الكتاب 15 و 14 و 16 و 10 و 11 و 13"
      estimatedTime="10 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي — الكتاب ص 135', title: 'تمارين الكتاب، بعباراته', tone: 'amber',
        body: <p>في كل مجموع: هل الشعاعان متعاقبان (علاقة شال)؟ أم لهما نفس المبدأ (قاعدة متوازي الأضلاع)؟ وإلا عوّض أحدهما بشعاع يساويه. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 15 — شعاعان معطيان', done: all('15'),
          content: <div className="space-y-3">{block('15', ['alaqat-shal', 'qaidat-mutawazi', 'insha-mumaththil'])}</div> },
        { num: 2, title: 'تمرين 14 — بسّط ثم أنشئ', done: all('14'),
          content: <div className="space-y-3">{block('14', ['alaqat-shal', 'qaidat-mutawazi'])}</div> },
        { num: 3, title: 'تمرين 16 — قطران متناصفان', done: all('16'),
          content: <div className="space-y-3">{block('16', ['qaidat-mutawazi', 'muntasaf-nazira', 'tasawi-mutawazi'])}</div> },
        { num: 4, title: 'تمرين 10 — أربعة مثلثات', done: all('10'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="insha-mumaththil" variant="rappel" compact />
              {block('10', ['insha-mumaththil', 'shuaa-maadum', 'muntasaf-nazira'])}
            </div>
          ) },
        { num: 5, title: 'تمرين 11 — انسحابان متتابعان', done: all('11'),
          content: <div className="space-y-3">{block('11', ['tarkib-insihabayn', 'alaqat-shal', 'tasawi-mutawazi'])}</div> },
        { num: 6, title: 'تمرين 13 — مثلث ومركز ثقله', done: all('13'),
          content: <div className="space-y-3">{block('13', ['alaqat-shal', 'shuaa-maadum', 'qaidat-mutawazi'])}</div> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
