import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';
import { READING_25 } from '../content/textbook';
import { FIG_EX29, FIG_EX25, FIG_EX28, FIG_EX13 } from '../content/figures';

/**
 * Module 3 — أوظّف تعلّماتي (p. 125 « أتعمّق » : ex-29, ex-24, ex-25, ex-28 ; p. 123 : ex-13).
 * AUTOMATIZE : ex-29 (le palmier, tan et ×). TRANSFER : ex-24 (le triangle dans un demi-cercle : PROUVER l'angle droit
 * puis résoudre le triangle), ex-25 (le rectangle : 30° en O — la lecture de l'extraction est dite —, OAB = 15°, puis
 * cos et sin), ex-28 (le parallélogramme : l'aire donne AH, puis sin et l'angle consécutif), ex-13 (les réciproques de
 * Pythagore et de Thalès — unité 9 — avant cos A). Une étape par exercice, faite quand chaque partie a reçu une
 * réponse (juste ou fausse) ; la brique burhan-qaim est posée après ex-24.
 */
const FIGURES = {
  ex29: <GeoFigure {...FIG_EX29} />,
  ex25: (
    <div className="space-y-1">
      <GeoFigure {...FIG_EX25} />
      <p className="text-xs text-slate-500" data-reading="ex-25"><MathText>{READING_25}</MathText></p>
    </div>
  ),
  ex28: <GeoFigure {...FIG_EX28} />,
  ex13: <GeoFigure {...FIG_EX13} />,
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
      objectives={['أترجم الوضعية إلى مثلث قائم وأختار النسبة', 'أبرهن أن المثلث قائم قبل أن أحسب', 'أحسب أطوالًا وأقياسًا في الأشكال المألوفة']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين الكتاب 29 و 24 و 25 و 28 و 13"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أوظّف تعلّماتي — الكتاب ص 123 و 125', title: 'تمارين الكتاب، بعباراته', tone: 'amber',
        body: <p>في كل تمرين: ارسم المثلث القائم (أو أثبت أنه قائم)، سمِّ الأضلاع بالنسبة إلى الزاوية، اختر النسبة، ثم دوّر في النهاية. اكتب الأعداد العشرية بالفاصلة (مثل 7,3). الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 29 — النخلة', done: all('29'),
          content: <div className="space-y-3">{block('29', ['zawiyat-nazar', 'ikhtiyar-nisba'])}</div> },
        { num: 2, title: 'تمرين 24 — مثلث في نصف دائرة', done: all('24'),
          content: (
            <div className="space-y-3">
              {block('24', ['hall-muthallath', 'zawiya-min-dilain', 'fithaghuris'])}
              {/* Rappel : « les rapports ne se définissent que dans un triangle rectangle » est la définition du درس 1, et
                  l'erreur fréquente de l'ex-24 (affichée dès l'énoncé) la redit — rien à prédire. */}
              {all('24') && <KnowledgeBrick id="burhan-qaim" variant="rappel" lead="قبل أيّ نسبة مثلثية:" />}
            </div>
          ) },
        { num: 3, title: 'تمرين 25 — قطرا مستطيل', done: all('25'),
          content: <div className="space-y-3">{block('25', ['khatawat-tarid', 'zawiyatan-hadatan', 'ikhtiyar-nisba'])}</div> },
        { num: 4, title: 'تمرين 28 — متوازي أضلاع', done: all('28'),
          content: <div className="space-y-3">{block('28', ['khatawat-tarid', 'zawiya-min-dilain', 'muadala-majhul-bast'])}</div> },
        { num: 5, title: 'تمرين 13 — برهن ثم احسب', done: all('13'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="burhan-qaim" variant="rappel" compact />
              {block('13', ['burhan-qaim', 'fithaghuris', 'zawiya-min-dilain'])}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
