import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';
import { IsoscelesBisectorFigure, ThalesTrapezoidFigure } from '../components/Figures';

/**
 * Module 3 — أوظّف تعلّماتي et أتعمّق : les dix exercices RÉÉCRITS par la plateforme (rollout 2026-11-12 ; ids ex-14 → ex-28 gardés). Chaque exercice en deux entrées : la TRADUCTION (choisir la jumla,
 * chaque distracteur une jumla fausse) puis la RÉSOLUTION (la ثنائية tapée). Les figures des
 * exercices 19 (triangle isocèle et bissectrice) et 21 (Thalès, trapèze) sont redessinées en SVG.
 * Chaque étape est faite quand chaque entrée a reçu une réponse (juste ou fausse). LP : P1, P2.
 */
export default function Module03Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (...ns) => ns.every((n) => partsOf(n).every((ex) => done[ex.id]));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="عشرة تمارين من المنصّة: أعداد، أشكال، ومن الحياة اليومية"
      objectives={['كيف أترجم نصّ المشكلة إلى جملة معادلتين؟', 'كيف أتأكد أنّ جوابي يوافق القصة؟', 'ماذا أفعل في مسألة هندسية أو في عددين مجهولين؟']}
      estimatedTime="18 دقيقة"
      brief={{ tag: 'أوظّف تعلّماتي وأتعمّق', title: 'حل مشكلات باستعمال جمل معادلتين', tone: 'amber',
        body: <p>في كل تمرين: اختر الجملة التي تترجم النص، ثم اكتب الثنائية التي تحلّها وتحقق منها في النص. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'أعداد مجهولة', done: all('14', '15', '16', '17'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="khutuwat-hall" variant="rappel" compact />
              {partsOf('14').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['jumla-tarjama', 'hall-jumla']} onAnswered={mark(ex.id)} />)}
              {partsOf('15').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['jumla-tarjama', 'tahaqquq-nas']} onAnswered={mark(ex.id)} />)}
              {partsOf('16').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['jumla-tarjama', 'hall-jumla']} onAnswered={mark(ex.id)} />)}
              {partsOf('17').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['jumla-tarjama', 'hall-jumla']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 2, title: 'محيطات ومساحات', done: all('18', '24', '25'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="jumla-tarjama" variant="rappel" compact />
              {partsOf('18').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['jumla-tarjama', 'muhit-misaha']} onAnswered={mark(ex.id)} />)}
              {partsOf('24').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['khutuwat-hall', 'tahaqquq-nas']} onAnswered={mark(ex.id)} />)}
              {partsOf('25').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['jumla-tarjama', 'muhit-misaha']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 3, title: 'زوايا وخاصية طالس', done: all('19', '21'),
          content: (
            <div className="space-y-3">
              {/* la figure À CÔTÉ de son exercice, un seul bloc paginé : la question et ce qu'elle regarde sur le même écran */}
              <div className="flex items-start gap-3" data-paging-keep>
                <div className="w-52 shrink-0"><IsoscelesBisectorFigure /></div>
                <div className="min-w-0 flex-1 space-y-3">
                  {partsOf('19').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['khutuwat-hall', 'hall-jumla']} onAnswered={mark(ex.id)} />)}
                </div>
              </div>
              <div className="flex items-start gap-3" data-paging-keep>
                <div className="w-52 shrink-0"><ThalesTrapezoidFigure /></div>
                <div className="min-w-0 flex-1 space-y-3">
                  {partsOf('21').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['khutuwat-hall', 'muhit-misaha']} onAnswered={mark(ex.id)} />)}
                </div>
              </div>
            </div>
          ) },
        { num: 4, title: 'من الحياة اليومية', done: all('20', '26', '27', '28'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tahaqquq-nas" variant="rappel" compact />
              {partsOf('20').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['jumla-tarjama', 'tahaqquq-nas']} onAnswered={mark(ex.id)} />)}
              {partsOf('26').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['jumla-tarjama', 'hall-jumla']} onAnswered={mark(ex.id)} />)}
              {partsOf('27').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['jumla-tarjama', 'tahaqquq-nas']} onAnswered={mark(ex.id)} />)}
              {partsOf('28').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['jumla-tarjama', 'nisba-mia']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
