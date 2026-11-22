import { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { TextbookExercise, SourceTag } from '../../../../../../common/textbook';
import GraphChoice from '../components/GraphChoice';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { QCM } from '../content/textbook';
import { partsOf } from '../content/exercises';
import { useModulePlayer } from '../../../../../../common/mission/useModulePlayer';

/**
 * Module 5 — أوظّف تعلّماتي (p. 51) : exercices 21 → 29, 31 et 32 (30 et 33 sont des
 * ترييض : leçon 4). Chaque « مثّل بيانيا » est une question à trois droites DESSINÉES
 * (GraphChoice). Puis les items 5 et 7 de « أؤكّد تعلّماتي » (p. 52), formatifs : DEUX
 * bonnes réponses chacun dans le manuel, posés en lignes « يحقّق / لا يحقّق » (une seule
 * réponse juste par ligne). Les items 6, 8 et 9 sont l'إختبار أولي.
 * Une étape par exercice (ou paire) ; elle est faite quand chaque partie a reçu une
 * réponse (juste ou fausse). LP : P1, P2, P3.
 *
 * Lecteur de mission (« NO BACK-AND-FORTH », 2026-11-11) : une brique « تذكير » reste ENTIÈRE sur son écran (`data-paging-keep`) —
 * ouverte en ses enfants, la moitié de ses dessins partait à côté de l'exercice 28 (zoom 0,6). La page et le mode classe : inchangés.
 */
const Q5 = QCM[5];
const Q7 = QCM[7];
const FOLLOWS = ['ينتج', 'لا ينتج'];
const SOLVES = ['حلّ لها', 'ليس حلًّا لها'];

export default function Module05Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const player = useModulePlayer(MODULE_CTX);
  const rappel = (id) => {
    const brick = <KnowledgeBrick id={id} variant="rappel" compact />;
    return player ? <div data-paging-keep>{brick}</div> : brick;
  };
  const all = (...ns) => ns.every((n) => partsOf(n).every((ex) => done[ex.id] && (!ex.graph || done[`${ex.id}-g`])));
  const render = (n, requires) => partsOf(n).map((ex) => (
    <div key={ex.id} className="space-y-2">
      <TextbookExercise exercise={ex} requires={requires} onAnswered={mark(ex.id)} />
      {ex.graph && done[ex.id] && <GraphChoice graph={ex.graph} requires={['tamthil-bayani']} onAnswered={mark(`${ex.id}-g`)} />}
    </div>
  ));

  return (
    <ContentModule
      objectives={["كيف أحلّ متراجحة وأمثّل حلولها بنفسي؟", "ماذا أفعل بالأقواس قبل الحلّ؟", "كيف أختبر قيمة لأعرف هل هي حلّ؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين متنوّعة، وسؤالان بإجابتين صحيحتين"
      estimatedTime="11 دقيقة"
      brief={{ tag: 'أوظّف تعلّماتي', title: 'تمارين بأعداد المنصّة', tone: 'amber',
        body: <p>لكل متراجحة اختر حلولها، ثم تمثيلها البياني إن طُلب، واقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'أكمل بالرمز المناسب', done: all('21'),
          content: <div className="space-y-3">{render('21', ['muqarana-adad'])}</div> },
        { num: 2, title: 'من متباينة إلى أخرى', done: all('22', '23'),
          content: (
            <div className="space-y-3">
              {rappel('qawaid-ittijah')}
              {render('22', ['qawaid-ittijah'])}
              {render('23', ['qawaid-ittijah'])}
            </div>
          ) },
        { num: 3, title: 'متراجحات بخطوة واحدة', done: all('24'),
          content: <div className="space-y-3">{render('24', ['tariqat-hal'])}</div> },
        { num: 4, title: 'اختبر ثم حلّ', done: all('25'),
          content: <div className="space-y-3">{render('25', ['hal-mutarajiha', 'tariqat-hal'])}</div> },
        { num: 5, title: 'حلّ كل متراجحة', done: all('26', '27'),
          content: (
            <div className="space-y-3">
              {rappel('tariqat-hal')}
              {render('26', ['tariqat-hal'])}
              {render('27', ['tariqat-hal'])}
            </div>
          ) },
        { num: 6, title: 'حلّ ثم مثّل', done: all('28'),
          content: (
            <div className="space-y-3">
              {rappel('tamthil-bayani')}
              {render('28', ['tariqat-hal'])}
            </div>
          ) },
        { num: 7, title: 'انشر، حلّل، ثم حلّ', done: all('29'),
          content: <div className="space-y-3">{render('29', ['tariqat-hal'])}</div> },
        { num: 8, title: 'أقواس قبل الحل', done: all('31', '32'),
          content: (
            <div className="space-y-3">
              {render('31', ['tariqat-hal'])}
              {render('32', ['tariqat-hal'])}
            </div>
          ) },
        { num: 9, title: 'سؤالان بإجابتين صحيحتين', subtitle: 'أؤكّد تعلّماتي', done: !!done.q5 && !!done.q7,
          content: (
            <div className="space-y-4">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{Q5.text}</MathText> <SourceTag source={Q5.source} /> <span className="font-normal text-slate-600">قد تكون أكثر من إجابة صحيحة: هل تنتج كل متباينة من المعطى؟</span></p>}
                rows={Q5.options.map((o, i) => ({
                  id: `q5-${i}`, label: <MathText>{o}</MathText>, options: FOLLOWS,
                  correct: Q5.correctSet.includes(i) ? 0 : 1,
                  correction: <MathText>{Q5.rowCorrections[i]}</MathText>,
                }))}
                requires={['qawaid-ittijah']}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    <MathText>{allRight
                      ? 'متباينتان تنتجان: الضرب في 3 (موجب) ثم إضافة 4 يحافظان على الاتجاه.'
                      : 'ابدأ من $x \\geq 2$ وطبّق العملية نفسها على الطرفين؛ وجرّب قيمة كبيرة لـ $x$ لتختبر ما لا ينتج.'}</MathText>
                  </Feedback>
                )}
                onAnswered={mark('q5')}
              />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{Q7.text}</MathText> <SourceTag source={Q7.source} /> <span className="font-normal text-slate-600"><MathText>{'قد تكون أكثر من إجابة صحيحة: هل $-2$ حلّ لكل متراجحة؟'}</MathText></span></p>}
                rows={Q7.options.map((o, i) => ({
                  id: `q7-${i}`, label: <MathText>{o}</MathText>, options: SOLVES,
                  correct: Q7.correctSet.includes(i) ? 0 : 1,
                  correction: <MathText>{Q7.rowCorrections[i]}</MathText>,
                }))}
                requires={['hal-mutarajiha']}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    <MathText>{allRight
                      ? 'نعوّض $x$ بـ $-2$ في كل متراجحة: متراجحتان تعطيان متباينة صحيحة.'
                      : 'عوّض $x$ بـ $-2$ واحسب الطرفين، ثم احكم على المتباينة العددية.'}</MathText>
                  </Feedback>
                )}
                onAnswered={mark('q7')}
              />
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={5} variant="memo" />}
    />
  );
}
