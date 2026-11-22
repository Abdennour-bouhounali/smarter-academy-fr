import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';

/**
 * Module 4 — أوظّف تعلّماتي : neuf exercices progressifs de la plateforme (rollout 2026-11-11 : plus aucun numéro ni mot du manuel).
 * Une étape par exercice ; elle est faite quand chaque équation a
 * reçu une réponse (juste ou fausse). La deuxième équation de l'exercice 9 n'a AUCUNE
 * solution : la leçon le dit (« لا يوجد أي عدد يحقّق المساواة ») sans théorie hors
 * programme. LP : P1 (ex. 1, 2, 5), P2 (ex. 3, 4, 6–9).
 */

export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (n) => partsOf(n).every((ex) => done[ex.id]);

  return (
    <ContentModule
      objectives={["كيف أحلّ معادلة من الدرجة الأولى بمفردي؟", "كيف أتصرّف مع المعاملات الكسرية والعشرية والجذور؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تسعة تمارين متدرّجة"
      estimatedTime="10 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي', title: 'تسعة تمارين متدرّجة', tone: 'amber',
        body: <p>لكل معادلة اكتب حلّها (عددًا صحيحًا أو كسرًا مثل 7/2 أو عددًا عشريًا) أو اختره، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'الشكل ax = b', done: all('1'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="hal-ax-b" variant="rappel" compact />
              {partsOf('1').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['hal-ax-b']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 2, title: 'قوى', done: all('2'),
          content: (
            <div className="space-y-3">
              {partsOf('2').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['hal-ax-b']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 3, title: 'المجهول وعدد', done: all('3'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tariqat-hal" variant="rappel" compact />
              {partsOf('3').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-hal']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 4, title: 'المجهول في الطرفين', done: all('4'),
          content: (
            <div className="space-y-3">
              {partsOf('4').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-hal']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 5, title: 'معاملات بجذور', done: all('5'),
          content: (
            <div className="space-y-3">
              {partsOf('5').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-hal', 'hal-ax-b']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 6, title: 'أنشر ثم أحل', done: all('6'),
          content: (
            <div className="space-y-3">
              {partsOf('6').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-hal', 'nashr-tabsit']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 7, title: 'طرفان يُنشران', done: all('7'),
          content: (
            <div className="space-y-3">
              {partsOf('7').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-hal', 'nashr-tabsit']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 8, title: 'يتلاشى الحد x²', done: all('8'),
          content: (
            <div className="space-y-3">
              {partsOf('8').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-hal', 'nashr-tabsit']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 9, title: 'مقامات', done: all('9'),
          content: (
            <div className="space-y-3">
              {partsOf('9').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-hal']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
