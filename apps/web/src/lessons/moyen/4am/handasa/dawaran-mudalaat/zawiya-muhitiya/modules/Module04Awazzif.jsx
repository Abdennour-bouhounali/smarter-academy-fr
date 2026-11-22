import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag, TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf, CORRECTIONS, DATUMS, DATUM_SOURCE } from '../content/exercises';
import { FIG_EX10, FIG_EX11, FIG_EX12, FIG_EX16, FIG_EX20 } from '../content/figures';

/**
 * Module 4 — أوظّف تعلّماتي (p. 159 « الزوايا المحيطية و الزوايا المركزية » et p. 161 أتعمّق).
 * AUTOMATIZE : ex-10 (le triangle équilatéral : BOC, BDC, puis DAB et DBC avec la donnée de la figure ∠BOD = 45°), ex-11 (trois
 * points alignés, les données de la figure écrites). TRANSFER : ex-12 (l'angle qui N'EST PAS inscrit — l'énoncé complété, M
 * nommé), ex-16 (les angles du triangle AEC avec ∠DOB = 40° fixé), ex-20 question 1 (BEM, doublon déclaré de la synthèse :
 * le sinus de l'unité 10 puis l'angle au centre). Une étape par exercice, faite quand chaque partie a reçu une réponse.
 */
const FIGURES = {
  ex10: <GeoFigure {...FIG_EX10} />,
  ex11: <GeoFigure {...FIG_EX11} />,
  ex12: <GeoFigure {...FIG_EX12} />,
  ex16: <GeoFigure {...FIG_EX16} />,
  ex20: <GeoFigure {...FIG_EX20} />,
};

function Exercise({ ex, requires, onDone, showFigure = true }) {
  return (
    <div className="space-y-2">
      {showFigure && ex.figure && FIGURES[ex.figure]}
      {showFigure && ex.datum && <p className="text-xs text-indigo-800" data-datum><MathText>{DATUMS[ex.datum]}</MathText> <SourceTag source={DATUM_SOURCE} /></p>}
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
      moduleSubtitle="تمارين الكتاب 10 و 11 و 12 و 16 والسؤال الأول من التمرين 20"
      estimatedTime="10 دقائق"
      objectives={["أطبّق الزاويتين المحيطية والمركزية في تمارين الكتاب", "أحسب أقياس زوايا مجهولة في دائرة"]}
      brief={{ tag: 'أوظّف تعلّماتي — الكتاب ص 159 و 161', title: 'تمارين الكتاب، بعباراته', tone: 'amber',
        body: <p>في كل زاوية: أين رأسها؟ أي قوس تحصر؟ وأي زاوية معلومة تحصر نفس القوس؟ الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 10 — المثلث المتقايس الأضلاع', done: all('10'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="khassiya-nisf" variant="rappel" compact />
              {block('10', ['khassiya-nisf', 'khassiya-tasawi'])}
            </div>
          ) },
        { num: 2, title: 'تمرين 11 — ثلاث نقط على استقامية', done: all('11'),
          content: <div className="space-y-3">{block('11', ['khassiya-nisf', 'tariqa-qaws'])}</div> },
        { num: 3, title: 'تمرين 12 — زاوية رأسها داخل الدائرة', done: all('12'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tarif" variant="rappel" compact />
              {block('12', ['tarif', 'khassiya-nisf', 'majmu-zawaya'])}
            </div>
          ) },
        { num: 4, title: 'تمرين 16 — زوايا المثلث AEC', done: all('16'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="khassiya-tasawi" variant="rappel" compact />
              {block('16', ['khassiya-tasawi', 'khassiya-nisf', 'majmu-zawaya'])}
            </div>
          ) },
        { num: 5, title: 'تمرين 20 — من شهادة التعليم المتوسط', done: all('20'),
          content: <div className="space-y-3">{block('20', ['qutr-qaima', 'khassiya-nisf'])}</div> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
