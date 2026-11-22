import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';
import { FIG_EX5, FIG_EX6, FIG_EX14, FIG_EX15 } from '../content/figures';

/**
 * Module 4 — أوظّف تعلّماتي (pp. 122–123, « النسب المثلثية - استعمال حاسبة » et « البرهان باستعمال النسب المثلثية »).
 * AUTOMATIZE : ex-1, ex-2 (Pythagore réciproque puis les tangentes), ex-4 (cos, sin, tan d'un 12-35-37), ex-5 (valeur
 * exacte puis arrondie), ex-6 (10 cos 55°), ex-9, ex-12 (les six rapports du 3-4-5). TRANSFER : ex-10 (1,5 impossible
 * sans calcul — P2), ex-14 (une preuve par les rapports), ex-15 (le bon rapport ; le troisième élève « رضا », la liste
 * du manuel). Une étape par exercice, faite quand chaque partie a reçu une réponse (juste ou fausse).
 */
const FIGURES = {
  ex5: <GeoFigure {...FIG_EX5} />,
  ex6: <GeoFigure {...FIG_EX6} />,
  ex14: <GeoFigure {...FIG_EX14} />,
  ex15: <GeoFigure {...FIG_EX15} />,
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
      objectives={['أحسب نسبًا مثلثية قيمة مضبوطة ثم مدوّرة', 'أحسب طول ضلع في مثلث قائم', 'أحكم على حلول زملائي وأختار أحسن طريقة']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين الكتاب 1 و 2 و 4 و 5 و 6 و 9 و 10 و 12 و 14 و 15"
      estimatedTime="10 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي — الكتاب ص 122 و 123', title: 'تمارين الكتاب، بعباراته', tone: 'amber',
        body: <p>اكتب الأعداد العشرية بالفاصلة (مثل 5,74). الحاسبة مبرمجة بالدرجة، ولا تدوّر إلا النتيجة النهائية. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 1 — المثلث JKL', done: all('1'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="thill" variant="rappel" compact />
              {block('1', ['fithaghuras', 'thill'])}
            </div>
          ) },
        { num: 2, title: 'تمرين 2 — المثلث ABC', done: all('2'),
          content: <div className="space-y-3">{block('2', ['fithaghuras', 'thill'])}</div> },
        { num: 3, title: 'تمرين 4 — النسب الثلاث للزاوية A', done: all('4'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="jayb" variant="rappel" compact />
              {block('4', ['fithaghuras', 'jayb', 'thill'])}
            </div>
          ) },
        { num: 4, title: 'تمرين 5 — القيمة المضبوطة ثم المدوّرة', done: all('5'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="qiyam-madbuta" variant="rappel" compact />
              {block('5', ['jayb', 'thill', 'qiyam-madbuta'])}
            </div>
          ) },
        { num: 5, title: 'تمرين 6 — الطول SK', done: all('6'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="hisab-tul" variant="rappel" compact />
              {block('6', ['hisab-tul', 'qiyam-madbuta'])}
            </div>
          ) },
        { num: 6, title: 'تمرين 9 — الطول AC', done: all('9'),
          content: <div className="space-y-3">{block('9', ['hisab-tul'])}</div> },
        { num: 7, title: 'تمرين 10 — نبيلة ومريم', done: all('10'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="hudud" variant="rappel" compact />
              {block('10', ['hudud'])}
            </div>
          ) },
        { num: 8, title: 'تمرين 12 — النسب الست', done: all('12'),
          content: <div className="space-y-3">{block('12', ['fithaghuras', 'jayb', 'thill'])}</div> },
        { num: 9, title: 'تمرين 14 — البرهان بالنسب', done: all('14'),
          content: <div className="space-y-3">{block('14', ['jayb', 'thill'])}</div> },
        { num: 10, title: 'تمرين 15 — من أحسن الاختيار؟', done: all('15'),
          content: (
            <div className="space-y-3">
              {block('15', ['jayb', 'hisab-tul'])}
              <p className="text-xs text-slate-500" data-correction>صحّحت المنصّة خطأً مطبعيًا: نص الكتاب يسمّي التلاميذ «عمر، ليلى ومختارية» ثم يعطي الظل لـ «رضا»؛ نسمّي الثالث «رضا» كما في قائمة الأجوبة (الجواب لا يتغيّر: ليلى).</p>
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
