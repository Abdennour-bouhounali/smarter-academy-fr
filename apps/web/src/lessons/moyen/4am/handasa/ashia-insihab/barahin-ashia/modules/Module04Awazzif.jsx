import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';
import { EX21_CORRECTION, EX24_NOTE } from '../content/textbook';
import { FIG_EX20, FIG_EX17, FIG_EX23, FIG_EX23_DONE, FIG_EX21, FIG_EX24, FIG_EX18, FIG_EX18_DONE } from '../content/figures';

/**
 * Module 4 — أوظّف تعلّماتي (p. 137 « أتعمّق » : ex-20, ex-17, ex-23, ex-21, ex-24, ex-18).
 * AUTOMATIZE : ex-20 (deux parallélogrammes, une somme qui ne se suit pas, M sur E). TRANSFER : ex-17 (la règle du
 * parallélogramme depuis le centre, J milieu de [OM]), ex-23 (A milieu de [KL] par deux opposés → brique
 * muntasaf-mutaakisan), ex-21 (posé CORRIGÉ : K milieu de [ED], une ligne dit la coquille), ex-24 (I et les longueurs ne
 * servent pas, une ligne), ex-18 (la preuve du laboratoire, la nature de OHKL, le centre de gravité rédigé). Une étape par
 * exercice, faite quand chaque partie a reçu une réponse (juste ou fausse).
 * « أتوقّع القاعدة » : la brique muntasaf-mutaakisan est un RAPPEL — elle résume ce que l'élève vient de prouver (ex-23 ; sa
 * correction l'écrit) et combine le milieu par vecteurs égaux (leçon 2) et les opposés (leçon 3).
 */
const FIGURES = {
  ex20: <GeoFigure {...FIG_EX20} />,
  ex17: <GeoFigure {...FIG_EX17} />,
  ex23: <GeoFigure {...FIG_EX23} />,
  ex21: (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-amber-800" data-correction="ex-21"><MathText>{EX21_CORRECTION}</MathText></p>
      <GeoFigure {...FIG_EX21} />
    </div>
  ),
  ex24: (
    <div className="space-y-1">
      <GeoFigure {...FIG_EX24} />
      <p className="text-xs text-slate-500" data-note="ex-24">{EX24_NOTE}</p>
    </div>
  ),
  ex18: <GeoFigure {...FIG_EX18} />,
  ex18done: <GeoFigure {...FIG_EX18_DONE} />,
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
      moduleNumber={4} objectives={['كيف أترجم المطلوب إلى مساواة شعاعية؟', 'كيف أحوّلها دون الاعتماد على الشكل؟', 'ماذا أستنتج في كل تمرين؟']}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين الكتاب 20 و 17 و 23 و 21 و 24 و 18"
      estimatedTime="11 دقيقة"
      brief={{ tag: 'أتعمّق — الكتاب ص 137', title: 'تمارين الكتاب، بعباراته', tone: 'amber',
        body: <p>في كل تمرين: ترجم المطلوب إلى مساواة شعاعية، حوّلها بعلاقة شال وبالمعطيات (لا بالشكل)، ثم استنتج. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 20 — متوازيا أضلاع', done: all('20'),
          content: <div className="space-y-3">{block('20', ['taawid-musawi', 'rabt-shal', 'istintajat'])}</div> },
        { num: 2, title: 'تمرين 17 — من مركز متوازي الأضلاع', done: all('17'),
          content: <div className="space-y-3">{block('17', ['insha-majmu', 'qaidat-mutawazi', 'muntasaf-shuaa'])}</div> },
        { num: 3, title: 'تمرين 23 — منتصف [KL]', done: all('23'),
          content: (
            <div className="space-y-3">
              {block('23', ['rabt-shal', 'mutaakisan-sifr', 'istintajat'])}
              {all('23') && (
                <>
                  <GeoFigure {...FIG_EX23_DONE} />
                  <KnowledgeBrick id="muntasaf-mutaakisan" variant="rappel" lead="ما برهنته:" />
                </>
              )}
            </div>
          ) },
        { num: 4, title: 'تمرين 21 — منتصف [ED]', done: all('21'),
          content: <div className="space-y-3">{block('21', ['khatawat-burhan', 'muntasaf-mutaakisan', 'qaidat-mutawazi'])}</div> },
        { num: 5, title: 'تمرين 24 — مثلث متساوي الساقين', done: all('24'),
          content: <div className="space-y-3">{block('24', ['rabt-shal', 'insha-majmu', 'muntasaf-shuaa'])}</div> },
        { num: 6, title: 'تمرين 18 — البرهان كاملا', done: all('18'),
          content: <div className="space-y-3">{block('18', ['khatawat-burhan', 'taawid-musawi', 'tariqat-abdc'])}</div> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
