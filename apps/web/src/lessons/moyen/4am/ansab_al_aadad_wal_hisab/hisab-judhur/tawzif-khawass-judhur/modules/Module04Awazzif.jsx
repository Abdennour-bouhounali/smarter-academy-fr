import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookBox, TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX27_NOTE } from '../content/textbook';
import { partsOf } from '../content/exercises';

/**
 * Module 4 — أوظّف تعلّماتي (p. 27) : exercices 18, 19, 22, 23, 24, 26, 27, puis
 * 31 (2) (p. 29, أتعمّق — la question 1 appartient à la leçon 2). Une étape par
 * exercice du manuel ; chaque nombre de l'exercice est une question, et
 * l'étape est faite quand tous ont reçu une réponse (juste ou fausse).
 * LP : P1, P2, P3.
 */
export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (n) => partsOf(n).every((ex) => done[ex.id]);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="أبسط كتابة، مقام ناطق، وتبسيط عبارات"
      estimatedTime="12 دقيقة"
      objectives={['هل أتقن كتابة جذر على أبسط شكل وإدخال معامل تحته؟', 'كيف أجعل مقام نسبة عددًا ناطقًا؟', 'كيف أبسّط عبارة فيها جذور؟']}
      brief={{ tag: 'أوظّف تعلّماتي', title: 'تمارين للتدريب', tone: 'amber',
        body: <p>لكل عدد اختر الكتابة المطلوبة، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'أبسط كتابة لجذر', done: all('18'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="kitaba-a-jidhr-b" variant="rappel" compact />
              {partsOf('18').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['kitaba-a-jidhr-b']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 2, title: 'إدخال المعامل تحت الجذر', done: all('19'),
          content: (
            <div className="space-y-3">
              {partsOf('19').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['jidhr-a2b']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 3, title: 'نسبة مقامها عدد ناطق', done: all('22'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="naqt-maqam" variant="rappel" compact />
              {partsOf('22').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['naqt-maqam']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 4, title: 'نسبة بسطها مجموع', done: all('23'),
          content: (
            <div className="space-y-3">
              {partsOf('23').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['naqt-maqam', 'tabsit-tawzii']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 5, title: 'تعيين العدد', done: all('24'),
          content: (
            <div className="space-y-3">
              {partsOf('24').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['naqt-maqam']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 6, title: 'تبسيط عبارة', done: all('26'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tabsit-tawzii" variant="rappel" compact />
              {partsOf('26').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['kitaba-a-jidhr-b', 'tabsit-tawzii']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 7, title: 'كتابة مبسطة لعددين', done: all('27'),
          content: (
            <div className="space-y-3">
              {partsOf('27').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['kitaba-a-jidhr-b', 'tabsit-tawzii']} onAnswered={mark(ex.id)} />)}
              <TextbookBox kind="remark" text={EX27_NOTE.text} source={EX27_NOTE.source} compact />
            </div>
          ) },
        { num: 8, title: 'مقلوب مجموع جذرين', done: all('31'),
          content: (
            <div className="space-y-3">
              {partsOf('31').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['mutatabiqat', 'naqt-maqam']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
