import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox, TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { NOW_30 } from '../content/textbook';
import { partsOf } from '../content/exercises';
import CubeFigure from '../components/CubeFigure';

/**
 * Module 5 — أتعمّق : exercices 28, 29, 30 (p. 27 : نشر وتبسيط), 32, 34, 36,
 * 37, 38 (p. 29, dont deux du BEM), puis « دوري الآن » p. 30 dans sa version
 * CORRIGÉE (extraction.json → now-30.correction) : l'élève fait le travail du
 * tableur (a = 2, 5, 10), puis choisit la comparaison et sa justification —
 * les deux nombres sont égaux pour tout a ≥ 2. LP : P2, P3.
 */
export default function Module05Atamaqq() {
  const [done, setDone] = useState({});
  const [q30, setQ30] = useState({});
  const mark30 = (k) => () => setQ30((d) => ({ ...d, [k]: true }));
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (n) => partsOf(n).every((ex) => done[ex.id]);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="أتعمّق"
      moduleSubtitle="نشر، هندسة، ومسائل من امتحان شهادة التعليم المتوسط"
      estimatedTime="12 دقيقة"
      objectives={['كيف أنشر وأبسّط عبارات فيها جذور؟', 'كيف أستعمل الجذور في مكعّب وفي مثلث قائم؟', 'هل يتساوى العددان من أجل كل قيمة للعدد $a$؟']}
      brief={{ tag: 'أوظّف تعلّماتي وأتعمّق', title: 'الجذور في الحساب وفي الهندسة', tone: 'rose',
        body: <p>ننشر بالمتطابقات الشهيرة، نبسّط، ونجعل المقامات ناطقة — ثم نستعمل ذلك في مكعّب وفي مثلث قائم.</p> }}
      steps={[
        { num: 1, title: 'انشر وبسّط', done: all('28'),
          content: (
            <div className="space-y-3">
              {partsOf('28').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['mutatabiqat', 'jidaa-jidhrayn']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 2, title: 'المتطابقات الشهيرة', done: all('29'),
          content: (
            <div className="space-y-3">
              {partsOf('29').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['mutatabiqat', 'tabsit-tawzii']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 3, title: 'العددان A و B', done: all('30'),
          content: (
            <div className="space-y-3">
              {partsOf('30').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['mutatabiqat', 'naqt-maqam']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 4, title: 'المكعّب', done: all('32'),
          content: (
            <div className="space-y-3">
              <CubeFigure />
              {partsOf('32').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['kitaba-a-jidhr-b']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 5, title: 'مثلث قائم ومتساوي الساقين', done: all('34'),
          content: (
            <div className="space-y-3">
              {partsOf('34').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['kitaba-a-jidhr-b', 'tabsit-tawzii']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 6, title: 'هل المثلث قائم؟', done: all('36'),
          content: (
            <div className="space-y-3">
              {partsOf('36').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['kitaba-a-jidhr-b', 'tabsit-tawzii']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 7, title: 'من امتحان شهادة التعليم المتوسط', done: all('37'),
          content: (
            <div className="space-y-3">
              {partsOf('37').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['kitaba-a-jidhr-b', 'tabsit-tawzii', 'naqt-maqam']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 8, title: 'من امتحان شهادة التعليم المتوسط', done: all('38'),
          content: (
            <div className="space-y-3">
              {partsOf('38').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['kitaba-a-jidhr-b', 'tabsit-tawzii']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 9, title: 'دوري الآن — المجدول', done: Boolean(q30.trials && q30.comparison),
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" title="دوري الآن" text={NOW_30.text} source={NOW_30.source} />
              <p className="text-xs text-slate-500">{NOW_30.correctionNote}</p>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'أنجز عمل المجدول: احسب العدد الثاني من أجل ثلاث قيم للعدد $a$.'}</MathText></p>}
                rows={NOW_30.trials.map((r) => ({
                  id: `a${r.a}`,
                  label: <MathText>{r.label}</MathText>,
                  options: r.options.map((o) => <MathText key={o}>{o}</MathText>),
                  correct: r.correct,
                  correction: <MathText>{r.correction}</MathText>,
                }))}
                requires={['jidhr-taarif']}
                onAnswered={mark30('trials')}
              />
              {q30.trials && (
                <TapQuestion
                  prompt={<MathText>{NOW_30.comparison.prompt}</MathText>}
                  options={NOW_30.comparison.options.map((o) => <MathText key={o}>{o}</MathText>)}
                  correct={NOW_30.comparison.correct}
                  cols={1}
                  requires={['mutatabiqat', 'jidhr-a2b']}
                  explain={<MathText>{NOW_30.answer}</MathText>}
                  onAnswered={mark30('comparison')}
                />
              )}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={5} variant="memo" />}
    />
  );
}
