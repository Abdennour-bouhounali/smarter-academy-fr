import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf, EX17_CORRECTION } from '../content/exercises';
import Ex18Graphs from '../components/Ex18Graphs';

/**
 * Module 3 — أوظّف تعلّماتي (p. 73, « التعرف على وضعية تناسبية ») : exercices 16, 17 (question 2
 * corrigée, une ligne), 18 (les deux représentations redessinées en SVG), puis un exercice de la
 * plateforme (la chawarma, y = 250 × x). Une étape par exercice ; elle est faite quand chaque partie a
 * reçu une réponse (juste ou fausse). LP : P1 (16, 17‑1, 18‑2), P2 (17‑2, 17‑3, 18‑1), P3 (plateforme).
 */
export default function Module03Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (n) => partsOf(n).every((ex) => done[ex.id]);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      objectives={["كيف أتعرّف على وضعية تناسبية؟", "كيف أحسب معامل التناسبية وأكمل جدولًا؟", "أيّ بيان يمثّل وضعية تناسبية؟"]}
      moduleNumber={3}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين الكتاب 16، 17، 18 وتمرين من المنصّة"
      estimatedTime="9 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي — الكتاب ص 73', title: 'التعرف على وضعية تناسبية', tone: 'amber',
        body: <p>تمارين الكتاب بعباراتها. احسب حواصل القسمة قبل أن تحكم، واكتب الأعداد العشرية بالفاصلة (1,5). الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 16 — العدد b', done: all('16'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="rabi-mutanasib" variant="rappel" compact />
              {partsOf('16').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['rabi-mutanasib']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 2, title: 'تمرين 17 — محيط القرص ومساحته', done: all('17'),
          content: (
            <div className="space-y-3">
              <p className="text-xs text-slate-500" data-correction><MathText>{EX17_CORRECTION}</MathText></p>
              <TextbookExercise exercise={partsOf('17')[0]} requires={['jadwal-tanasub']} onAnswered={mark('ex-17-1')} />
              <KnowledgeBrick id="muamil-tanasub" variant="rappel" compact />
              <TextbookExercise exercise={partsOf('17')[1]} requires={['muamil-tanasub']} onAnswered={mark('ex-17-2')} />
              <TextbookExercise exercise={partsOf('17')[2]} requires={['muamil-tanasub', 'mablagh-thabit']} onAnswered={mark('ex-17-3')} />
            </div>
          ) },
        { num: 3, title: 'تمرين 18 — بيانان', done: all('18'),
          content: (
            <div className="space-y-3">
              <Ex18Graphs />
              <KnowledgeBrick id="mablagh-thabit" variant="rappel" compact />
              <TextbookExercise exercise={partsOf('18')[0]} requires={['mablagh-thabit', 'muamil-tanasub']} onAnswered={mark('ex-18-1')} />
              <TextbookExercise exercise={partsOf('18')[1]} requires={['muamil-tanasub']} onAnswered={mark('ex-18-2')} />
            </div>
          ) },
        { num: 4, title: 'تمرين من المنصّة — الشاورما', done: all('p1'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="y-ax" variant="rappel" compact />
              {partsOf('p1').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['y-ax']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
