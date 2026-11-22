import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';

/**
 * Module 4 — أوظّف تعلّماتي (pp. 72–73) : exercices 3, 4, 5 et 19 → 27, en QUATRE groupes pour
 * garder le module navigable (une étape par groupe, faite quand chaque question du groupe a reçu
 * une réponse, juste ou fausse) — les trois rubriques du manuel, la deuxième coupée en deux :
 *   1. تعيين دالة خطية (3, 4, 5) — P1, et P3 pour « le prix AVANT » (3-3) ;
 *   2. استعمال النسب المئوية : prendre, augmenter, diminuer (19, 20, 21, 22) — P1 ;
 *   3. un taux inconnu, deux baisses successives (23, 24) — P1 ;
 *   4. المقادير المركّبة (25, 26, 27) — P2, et P3 pour la masse d'une personne (25-2).
 */
export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (nums) => nums.every((n) => partsOf(n).every((ex) => done[ex.id]));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      objectives={["كيف أوظّف النسب المئوية والدوال الخطية في تمارين الكتاب؟", "كيف أتعامل مع تغيّرين متتابعين؟", "كيف أحوّل وحدات مقدار مركّب؟"]}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين الكتاب 3، 4، 5 و 19 ← 27"
      estimatedTime="12 دقيقة"
      brief={{ tag: 'أوظّف تعلّماتي — الكتاب ص 72، 73', title: 'تمارين الكتاب، بعباراته', tone: 'amber',
        body: <p>أربع مجموعات من التمارين. اكتب الأعداد العشرية بالفاصلة (مثل 1,08)، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب. يمكنك أن تبدأ بأيّ مجموعة.</p> }}
      steps={[
        { num: 1, title: 'تعيين دالة خطية', subtitle: 'تمارين 3، 4، 5 — ص 72', done: all(['3', '4', '5']),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="dala-murfaqa" variant="rappel" compact />
              {partsOf('3').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['takhfid-darb', 'dala-murfaqa']} onAnswered={mark(ex.id)} />)}
              {partsOf('4').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['ziyada-darb', 'dala-murfaqa']} onAnswered={mark(ex.id)} />)}
              {partsOf('5').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['ziyada-darb', 'dala-murfaqa']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 2, title: 'أخذ نسبة، زيادة، تخفيض', subtitle: 'تمارين 19 ← 22 — ص 73', done: all(['19', '20', '21', '22']),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="ziyada-darb" variant="rappel" compact />
              {partsOf('19').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['nisba-akhdh', 'dala-murfaqa']} onAnswered={mark(ex.id)} />)}
              {partsOf('20').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['takhfid-darb']} onAnswered={mark(ex.id)} />)}
              {partsOf('21').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['takhfid-darb', 'dala-murfaqa']} onAnswered={mark(ex.id)} />)}
              {partsOf('22').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['ziyada-darb', 'nisba-akhdh']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 3, title: 'نسبة مجهولة وتغيّران متتابعان', subtitle: 'تمرينا 23 و 24 — ص 73', done: all(['23', '24']),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tatabu-darb" variant="rappel" compact />
              {partsOf('23').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['takhfid-darb', 'dala-murfaqa']} onAnswered={mark(ex.id)} />)}
              {partsOf('24').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tatabu-darb']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 4, title: 'المقادير المركّبة', subtitle: 'تمارين 25، 26، 27 — ص 73', done: all(['25', '26', '27']),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="miqdar-qisma" variant="rappel" compact />
              {partsOf('25').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['nisba-akhdh', 'miqdar-qisma', 'tahwil-murakkab', 'miqdar-bidalala']} onAnswered={mark(ex.id)} />)}
              {partsOf('26').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['miqdar-qisma', 'tahwil-murakkab']} onAnswered={mark(ex.id)} />)}
              {partsOf('27').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['miqdar-qisma', 'tahwil-murakkab']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
