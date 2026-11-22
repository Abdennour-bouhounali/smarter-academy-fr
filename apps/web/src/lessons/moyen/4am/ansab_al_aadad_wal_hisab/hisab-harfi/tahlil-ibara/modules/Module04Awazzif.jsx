import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox, TextbookExercise, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX25_NOTE, QCM } from '../content/textbook';
import { partsOf } from '../content/exercises';

/**
 * Module 4 — أوظّف تعلّماتي (pp. 38–39) : exercices 20 → 27, 28 (ب) (la partie
 * أ appartient à la leçon 2), 29 → 33 ; puis les items 5 et 9 de « أؤكّد
 * تعلّماتي » (p. 40), formatifs : l'item 5 a DEUX bonnes réponses dans le
 * manuel, il est posé en lignes « يساويه / لا يساويه » (une seule réponse juste
 * par ligne). Les autres items (4, 6, 10, 11, 12) sont l'إختبار أولي.
 * Une étape par exercice ; elle est faite quand chaque expression a reçu une
 * réponse (juste ou fausse). LP : P1, P2, P3.
 */
const EQUAL = ['يساويه', 'لا يساويه'];
const Q5 = QCM[5];
const Q9 = QCM[9];

export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (n) => partsOf(n).every((ex) => done[ex.id]);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      objectives={["كيف أحلّل عبارة بعامل مشترك أو بمتطابقة؟", "كيف أكشف الخطأ في تحليل مقترح؟", "كيف أحسب ذهنيًا بمتطابقة معكوسة؟"]}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين متدرّجة، وسؤالان للتأكّد من تعلّماتك"
      estimatedTime="11 دقيقة"
      brief={{ tag: 'أوظّف تعلّماتي', title: 'تمارين متدرّجة', tone: 'amber',
        body: <p>لكل عبارة اختر تحليلها، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'العامل المشترك', done: all('20'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tariqat-amil-mushtarak" variant="rappel" compact />
              {partsOf('20').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-amil-mushtarak']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 2, title: 'ابحث عن الخطإ', done: all('21'),
          content: (
            <div className="space-y-3">
              {partsOf('21').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-amil-mushtarak']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 3, title: 'حدّ وحده بين قوسين', done: all('22'),
          content: (
            <div className="space-y-3">
              {partsOf('22').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-amil-mushtarak']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 4, title: 'عامل عددي أو حرفي', done: all('23'),
          content: (
            <div className="space-y-3">
              {partsOf('23').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['khassiya-tawziiya']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 5, title: 'لاحظ وجود عامل مشترك', done: all('24'),
          content: (
            <div className="space-y-3">
              {partsOf('24').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-amil-mushtarak']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 6, title: 'كسور وأعداد عشرية', done: all('25'),
          content: (
            <div className="space-y-3">
              {partsOf('25').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-amil-mushtarak']} onAnswered={mark(ex.id)} />)}
              <TextbookBox kind="remark" text={EX25_NOTE.text} source={EX25_NOTE.source} compact />
            </div>
          ) },
        { num: 7, title: 'مربع مجموع', done: all('26'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tariqat-mutatabiqat" variant="rappel" compact />
              {partsOf('26').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-mutatabiqat']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 8, title: 'مربع فرق', done: all('27'),
          content: (
            <div className="space-y-3">
              {partsOf('27').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-mutatabiqat']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 9, title: 'احسب ذهنيا', done: all('28'),
          content: (
            <div className="space-y-3">
              {partsOf('28').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tahlil-mutatabiqat']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 10, title: 'أتمم المساويات', done: all('29'),
          content: (
            <div className="space-y-3">
              {partsOf('29').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tahlil-mutatabiqat']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 11, title: 'حلّل إلى جداء عوامل', done: all('30'),
          content: (
            <div className="space-y-3">
              {partsOf('30').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-mutatabiqat']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 12, title: 'معاملات كسرية', done: all('31'),
          content: (
            <div className="space-y-3">
              {partsOf('31').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-mutatabiqat']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 13, title: 'فرق مربّعين', done: all('32'),
          content: (
            <div className="space-y-3">
              {partsOf('32').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-mutatabiqat']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 14, title: 'حلّل ثم انشر', done: all('33'),
          content: (
            <div className="space-y-3">
              {partsOf('33').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-mutatabiqat', 'nashr-tawzii']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 15, title: 'أؤكّد تعلّماتي', subtitle: 'سؤالان للتأكّد', done: !!done.q5 && !!done.q9,
          content: (
            <div className="space-y-4">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{Q5.text}</MathText> <SourceTag source={Q5.source} /> <span className="font-normal text-slate-600"><MathText>{'لهذه العبارة أكثر من تحليل صحيح: هل كل كتابة تساوي العبارة $\\sqrt{2}x + 2$ ؟'}</MathText></span></p>}
                rows={Q5.options.map((o, i) => ({
                  id: `q5-${i}`, label: <MathText>{o}</MathText>, options: EQUAL,
                  correct: Q5.correctSet.includes(i) ? 0 : 1,
                  correction: <MathText>{Q5.rowCorrections[i]}</MathText>,
                }))}
                requires={['khassiya-tawziiya']}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    <MathText>{allRight
                      ? 'تحليلان صحيحان: العامل المشترك $\\sqrt{2}$ أو العامل المشترك 2 — لعبارة واحدة قد يوجد أكثر من تحليل.'
                      : 'انشر كل كتابة وقارن بالعبارة $\\sqrt{2}x + 2$ ، ولا تنسَ أنّ $\\sqrt{2} \\times \\sqrt{2} = 2$.'}</MathText>
                  </Feedback>
                )}
                onAnswered={mark('q5')}
              />
              <TapQuestion
                prompt={<span><MathText>{Q9.text}</MathText> <SourceTag source={Q9.source} /></span>}
                options={Q9.options.map((o) => <MathText key={o}>{o}</MathText>)}
                correct={Q9.correct}
                cols={1}
                requires={['tahlil-mutatabiqat']}
                explain={<MathText>{Q9.explain}</MathText>}
                onAnswered={mark('q9')}
              />
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
