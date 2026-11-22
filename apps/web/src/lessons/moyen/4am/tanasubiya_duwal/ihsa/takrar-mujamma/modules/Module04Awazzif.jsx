import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf, EX1_POINTER } from '../content/exercises';
import FreqTable from '../components/FreqTable';
import { PieChart, Histogram } from '../components/Charts';

/**
 * Module 4 — أوظّف تعلّماتي (p. 98, « حساب تكرارات مجمعة و تواترات مجمعة », et ex-21 p. 101).
 * AUTOMATIZE : ex-1 (températures, « تفوق » strict vs « على الأقل »), ex-2 (notes), ex-4 (مخطط دائري), ex-5
 * (فئات), ex-21 (du cumul aux fréquences). TRANSFER : ex-3 (accidents, des POURCENTAGES déjà relatifs, des
 * causes qui ne sont pas des nombres), ex-6 (électricité, un مدرّج à lire). ex-1 هـ (le tableur) : renvoi à la
 * leçon 3. Une étape par exercice, faite quand chaque partie a reçu une réponse (juste ou fausse).
 */
const FIGURES = {
  'pie-ex4': (
    <PieChart parts={[{ value: 15, label: '144cm' }, { value: 20, label: '152cm 20%' }, { value: 40, label: '155cm 40%' }, { value: 25, label: '160cm 25%' }]}
      label="مخطط دائري: 152cm 20%، 155cm 40%، 160cm 25%، وقطاع 144cm بلا نسبة" size={170} />
  ),
  'hist-ex6': (
    <Histogram edges={[0, 0.5, 1, 1.5, 2, 2.5, 3]} freqs={[10, 50, 60, 50, 20, 10]} yMax={60} yStep={10} xLabel="الفئة (الاستهلاك بـ MWh)" yLabel="عدد العائلات"
      edgeText={(e) => String(e).replace('.', ',')} label="مدرّج تكراري: من 0 إلى 3 بسعة 0,5، التكرارات 10 و 50 و 60 و 50 و 20 و 10" />
  ),
};

function Exercise({ ex, requires, onDone }) {
  return (
    <div className="space-y-2">
      {ex.table && <FreqTable head={ex.table.head} values={ex.table.values} rows={ex.table.rows} />}
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
      objectives={["متى أقول «على الأقل» ومتى أقول «على الأكثر»؟", "كيف أقرأ مخططًا دائريًا أو مدرّجًا وأحسب منه التواتر المجمع؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين الكتاب 1 إلى 6 و 21"
      estimatedTime="8 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي — الكتاب ص 98 و 101', title: 'تمارين الكتاب، بعباراته', tone: 'amber',
        body: <p>اكتب الأعداد العشرية بالفاصلة (مثل 0,6). الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 1 — درجات الحرارة', done: all('1'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="hisab-mujamma" variant="rappel" compact />
              {block('1', ['hisab-mujamma'])}
              <p className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700" data-ex1-pointer><MathText>{EX1_POINTER}</MathText></p>
            </div>
          ) },
        { num: 2, title: 'تمرين 2 — العلامات', done: all('2'),
          content: <div className="space-y-3">{block('2', ['hisab-mujamma'])}</div> },
        { num: 3, title: 'تمرين 3 — حوادث المرور', done: all('3'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tawatur-mujamma" variant="rappel" compact />
              {block('3', ['tawatur-mujamma'])}
            </div>
          ) },
        { num: 4, title: 'تمرين 4 — مخطط دائري', done: all('4'),
          content: <div className="space-y-3">{block('4', ['tawatur-mujamma', 'khasiyat-mujamma'])}</div> },
        { num: 5, title: 'تمرين 5 — مدة التنقل', done: all('5'),
          content: <div className="space-y-3">{block('5', ['hisab-mujamma'])}</div> },
        { num: 6, title: 'تمرين 6 — استهلاك الكهرباء', done: all('6'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tawatur-fiat" variant="rappel" compact />
              {block('6', ['tawatur-fiat'])}
            </div>
          ) },
        { num: 7, title: 'تمرين 21 — من الصاعد إلى التواتر', done: all('21'),
          content: <div className="space-y-3">{block('21', ['tawatur-mujamma', 'khasiyat-mujamma'])}</div> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
