import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';

/**
 * Module 3 — أوظّف تعلّماتي (p. 72) : exercices 1, 6, 7 (« تعيين دالة خطية ») puis 8 et 9 (« تعيين صورة
 * عدد وتعيين عدد صورته معلومة »). Une étape par exercice ; elle est faite quand chaque partie a reçu une
 * réponse (juste ou fausse). Les nombres décimaux se tapent avec la virgule (parseDec).
 * LP : P3 (ex. 1, 6, 8‑3, 8‑4, 9 b‑d), P1 (ex. 7), P2 (ex. 8‑1, 8‑2, 9 a).
 */
export default function Module03Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (n) => partsOf(n).every((ex) => done[ex.id]);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      objectives={["كيف أعيّن دالة خطية من عدد وصورته؟", "كيف أحسب صورة عدد، والعدد الذي صورته معلومة؟", "متى تكون دالة ما خطية؟"]}
      moduleNumber={3}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين الكتاب 1، 6، 7، 8، 9"
      estimatedTime="10 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي — الكتاب ص 72', title: 'تمارين الكتاب، بعباراته', tone: 'amber',
        body: <p>اكتب الأعداد العشرية بالفاصلة (مثل 0,96). الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 1 — سعر السروال', done: all('1'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tayin-dala" variant="rappel" compact />
              {partsOf('1').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tayin-dala']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 2, title: 'تمرين 6 — عدد كسري وصورته', done: all('6'),
          content: (
            <div className="space-y-3">
              {partsOf('6').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tayin-dala']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 3, title: 'تمرين 7 — خطية أم لا؟', done: all('7'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="dala-khattiya" variant="rappel" compact />
              {partsOf('7').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['dala-khattiya']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 4, title: 'تمرين 8 — صور وأعداد بالجذور', done: all('8'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="hisab-sura" variant="rappel" compact />
              {partsOf('8').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['hisab-sura', 'tayin-dala']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 5, title: 'تمرين 9 — أتمم الجدول', done: all('9'),
          content: (
            <div className="space-y-3">
              {partsOf('9').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['hisab-sura', 'jadwal-khattiya']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
