import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';

/**
 * Module 4 — أوظّف تعلّماتي (p. 99 : تمارين 8 → 13) et أتعمّق (p. 101 : 17, 18). Une étape par exercice ; elle est
 * faite quand chaque partie a reçu une réponse (juste ou fausse). « اقترح سلسلة … » est posé comme le choix de LA
 * série qui vérifie les conditions (content/exercises.js) ; ex-13 et la série unique se saisissent.
 * AUTOMATIZE : 8 → 13 ; TRANSFER : 17 (une famille de séries), 18 (des longueurs en racines carrées).
 * LP : P2 (8, 11, 18), P3 (9, 12, 13), P1 (10, 17).
 */
export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (...ns) => ns.every((n) => partsOf(n).every((ex) => done[ex.id]));
  const list = (n, requires) => partsOf(n).map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={requires} onAnswered={mark(ex.id)} />);

  return (
    <ContentModule
      objectives={["كيف أبني سلسلة تحقّق شروطًا على المتوسط والوسيط والمدى؟", "كيف أتحقّق من أنّ سلسلة ما تحقّق الشروط؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين الكتاب 8 ← 13، 17 و 18"
      estimatedTime="10 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي ص 99 · أتعمّق ص 101', title: 'سلاسل بشروط', tone: 'amber',
        body: <p>في كل تمرين نبحث عن سلسلة تحقّق شروطًا على تكرارها الكلّي ومداها ومتوسطها ووسيطها. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 8 — المتوسط 7', done: all('8'),
          content: <div className="space-y-3"><KnowledgeBrick id="mutawassit-mutawazin" variant="rappel" compact />{list('8', ['mutawassit-mutawazin'])}</div> },
        { num: 2, title: 'تمرين 9 — الوسيط 7', done: all('9'),
          content: <div className="space-y-3"><KnowledgeBrick id="wasit-rutba" variant="rappel" compact />{list('9', ['wasit-rutba'])}</div> },
        { num: 3, title: 'تمرين 10 — المتوسط والمدى', done: all('10'),
          content: <div className="space-y-3">{list('10', ['mada', 'mutawassit-mutawazin'])}</div> },
        { num: 4, title: 'تمرين 11 — الوسيط والمتوسط', done: all('11'),
          content: <div className="space-y-3">{list('11', ['wasit', 'mutawassit-mutawazin'])}</div> },
        { num: 5, title: 'تمرين 12 — الوسيط في 3', done: all('12'),
          content: <div className="space-y-3">{list('12', ['wasit-rutba'])}</div> },
        { num: 6, title: 'تمرين 13 — سلسلة وحيدة', done: all('13'),
          content: <div className="space-y-3">{list('13', ['wasit', 'mada', 'mutawassit-mutawazin'])}</div> },
        { num: 7, title: 'أتعمّق — تمرينا 17 و 18', done: all('17', '18'),
          content: (
            <div className="space-y-3">
              {list('17', ['mada', 'wasit', 'mutawassit-mutawazin'])}
              {list('18', ['mada', 'wasit-rutba', 'mutawassit-mutawazin'])}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
