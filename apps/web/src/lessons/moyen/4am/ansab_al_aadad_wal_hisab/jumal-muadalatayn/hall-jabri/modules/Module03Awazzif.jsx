import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';

/**
 * Module 3 — أوظّف تعلّماتي (pp. 60–61) et أتعمّق (p. 63) : exercices 5 → 13, 22 et 23. Une étape
 * par exercice ; elle est faite quand chaque jumla a reçu une réponse (juste ou fausse). La
 * progression du livre : imposer التعويض (5, 6), imposer الجمع (7, 8), puis « طريقة من اختيارك »
 * (9 → 13, 22, 23) — c'est là que se joue P3. Les solutions non entières sont gardées exactes
 * (68/19 ; 39/19), comme le livre les donne. LP : P1 (5, 6), P2 (7, 8), P3 (9 → 13, 22, 23).
 */
export default function Module03Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (n) => partsOf(n).every((ex) => done[ex.id]);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="بالتعويض، بالجمع، ثم بطريقة من اختيارك"
      objectives={['أحلّ جملة بالتعويض ثم بالجمع.', 'أيّ طريقة أختار لكل جملة؟', 'ماذا أفعل حين لا يكون الحل عددًا صحيحًا؟']}
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أوظّف تعلّماتي', title: 'جمل لأحلّها', tone: 'amber',
        body: <p>لكل جملة اكتب الثنائية في الخانتين، بالترتيب الذي يطلبه السؤال (عدد صحيح، كسر مثل 3/2، أو عدد عشري مثل 2,5)، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'بالتعويض', done: all('5'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tariqat-tawid" variant="rappel" compact />
              {partsOf('5').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-tawid']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 2, title: 'كسور وحروف أخرى', done: all('6'),
          content: (
            <div className="space-y-3">
              {partsOf('6').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-tawid', 'hall-thunaiya']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 3, title: 'بالجمع والتعويض', done: all('7'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tariqat-jam" variant="rappel" compact />
              {partsOf('7').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-jam']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 4, title: 'معاملان للضرب', done: all('8'),
          content: (
            <div className="space-y-3">
              {partsOf('8').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-jam', 'hall-thunaiya']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 5, title: 'طريقة من اختيارك', done: all('9'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="ikhtiyar-tariqa" variant="rappel" compact />
              {partsOf('9').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['ikhtiyar-tariqa']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 6, title: 'مجهول معطى بدلالة الآخر', done: all('10'),
          content: (
            <div className="space-y-3">
              {partsOf('10').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['ikhtiyar-tariqa', 'tariqat-tawid']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 7, title: 'باختيار طريقة مناسبة', done: all('11'),
          content: (
            <div className="space-y-3">
              {partsOf('11').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['ikhtiyar-tariqa']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 8, title: 'نبسّط أولًا', done: all('12') && all('13'),
          content: (
            <div className="space-y-3">
              {[...partsOf('12'), ...partsOf('13')].map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['ikhtiyar-tariqa']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 9, title: 'أتعمّق', done: all('22') && all('23'),
          content: (
            <div className="space-y-3">
              {[...partsOf('22'), ...partsOf('23')].map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['ikhtiyar-tariqa', 'hall-thunaiya']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
