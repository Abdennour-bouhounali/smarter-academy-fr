import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { TextbookBox, SourceTag, MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD_VALUES, METHOD_CLASSES, NOW } from '../content/textbook';
import FreqTable from '../components/FreqTable';
import { Histogram } from '../components/Charts';
import { addition } from '../../_unit/unitMeta';

/**
 * Module 3 — طرائق (p. 95) « حساب التكرار والتواتر المجمعين » : deux exercices résolus, révélés ligne à
 * ligne (MethodSteps), puis دوري الآن rendu vérifiable sur des notes fournies par la plateforme (déclaré).
 *   1. les séismes (pour CHAQUE VALEUR) — brique hisab-mujamma ;
 *   2. les ouvriers (pour CHAQUE FAÏE / فئة, le مدرّج تكراري redessiné) — brique tawatur-fiat ;
 *   3. دوري الآن.
 * Rétrofit 2026-10-15 : les briques « hisab-mujamma » et « tawatur-fiat » ne paraissent qu'APRÈS la réponse de leur étape.
 * LP : P1 (1), P2 (2, 3), P3 (les tableaux lus et complétés).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const PLATFORM = addition('interaction_generation');

export default function Module03Taraiq() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const tv = METHOD_VALUES.table;
  const tc = METHOD_CLASSES.table;

  return (
    <ContentModule
      objectives={["كيف نحسب التكرارات المجمعة لكل قيمة؟", "كيف ننتقل إلى التواترات المجمعة لكل فئة؟", "كيف أتحقّق من حساباتي على علامات قسم؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طرائق — الحساب لقيمة ولفئة"
      moduleSubtitle="نرتّب، ثم نجمع من جهة، أو نقسم ثم نجمع"
      estimatedTime="8 دقائق"
      brief={{
        tag: 'طرائق — الكتاب ص 95', title: METHOD_VALUES.title, tone: 'emerald',
        body: <p>تمرينان محلولان من الكتاب: اقرأ كل سطر وحاول أن تتوقّع السطر التالي قبل أن تكشفه.</p>,
      }}
      steps={[
        {
          num: 1, title: 'لكل قيمة', subtitle: 'شدّة الزلازل', done: q1,
          content: (
            <div className="space-y-3">
              <p className="font-mono text-sm text-slate-700" dir="ltr">{METHOD_VALUES.series.join('  ')}</p>
              {/* sans `rule` : la طريقة (encadré « طريقة ») ne s'affiche qu'avec la brique, après « أتوقّع القاعدة » */}
              <MethodSteps method={{ ...METHOD_VALUES, rule: undefined }} />
              <FreqTable head="شدّة الزلزال" values={tv.values} rows={[
                { label: 'التكرار', cells: tv.freqs },
                { label: 'التكرار المجمع الصاعد', cells: tv.up },
                { label: 'التكرار المجمع النازل', cells: tv.down },
              ]} />
              <p className="text-sm font-semibold text-slate-800">نقاط فريق الحيّ، المعروف باللعب النظيف، في 12 مباراة: 0 (مرتان)، 1 (5 مرات)، 3 (4 مرات)، 4 (مرة واحدة). <SourceTag source={PLATFORM} /></p>
              <BatchChoiceQuestion
                rows={[
                  { id: 'u1', label: 'الصاعد للقيمة 1', options: ['$7$', '$5$', '$10$'].map(M), correct: 0, correction: <MathText>{'$2 + 5 = 7$'}</MathText> },
                  { id: 'd1', label: 'النازل للقيمة 1', options: ['$5$', '$10$', '$12$'].map(M), correct: 1, correction: <MathText>{'$5 + 4 + 1 = 10$'}</MathText> },
                  { id: 'd3', label: 'النازل للقيمة 3', options: ['$5$', '$4$', '$11$'].map(M), correct: 0, correction: <MathText>{'$4 + 1 = 5$'}</MathText> },
                ]}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="hisab-mujamma" lead="الطريقة كما يكتبها الكتاب، وقد طبّقتها للتوّ:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'لكل فئة', subtitle: 'أعمار العمال', done: q2,
          content: (
            <div className="space-y-3">
              <Histogram edges={METHOD_CLASSES.edges} freqs={METHOD_CLASSES.freqs} yMax={60} yStep={10} xLabel="العمر a" yLabel="التكرار"
                label="مدرّج تكراري: من 25 إلى 60 بسعة 5، التكرارات 20 و 30 و 40 و 20 و 60 و 20 و 10" />
              <MethodSteps method={{ source: METHOD_CLASSES.source, exercise: METHOD_CLASSES.exercise, solution: METHOD_CLASSES.solution }} />
              <FreqTable head="العمر $a$" values={tc.classes} rows={[
                { label: 'التكرار', cells: tc.freqs },
                { label: 'التواتر', cells: tc.rel },
                { label: 'التواتر المجمع الصاعد', cells: tc.up },
                { label: 'التواتر المجمع النازل', cells: tc.down },
              ]} />
              <TapQuestion
                prompt="التواتر المجمع النازل لفئة هو مجموع تواتر هذه الفئة و:"
                options={['تواترات الفئات التي تليها', 'تواترات الفئات التي تسبقها', 'تكرارات الفئات التي تليها دون قسمة']}
                correct={0}
                cols={1}
                explain={<MathText>{'النازل يجمع الفئة وما يليها، مثلا للفئة $40 \\le a < 45$ : $0{,}1 + 0{,}3 + 0{,}1 + 0{,}05 = 0{,}55$ . ما يسبقها يعطي الصاعد، والتكرارات دون قسمة تعطي التكرار المجمع لا التواتر.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="tawatur-fiat" lead="ونفس الطريقة للفئات، بالتواترات:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'دوري الآن', subtitle: 'علامات قسم في فئات', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={NOW.text} source={NOW.source} compact />
              <p className="text-sm text-slate-800">{NOW.dataText} <SourceTag source={NOW.dataSource} /></p>
              <FreqTable head="العلامة $n$" values={NOW.classes} rows={[{ label: 'التكرار', cells: NOW.freqs.map(String) }]} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">التكرار الكلي 25:</p>}
                rows={[
                  { id: 'u2', label: <MathText>{'الصاعد — $5 \\le n < 10$'}</MathText>, options: ['$0{,}4$', '$0{,}32$', '$10$'].map(M), correct: 0, correction: <MathText>{'$\\dfrac{2 + 8}{25} = 0{,}4$'}</MathText> },
                  { id: 'u3', label: <MathText>{'الصاعد — $10 \\le n < 15$'}</MathText>, options: ['$0{,}4$', '$0{,}8$', '$0{,}6$'].map(M), correct: 1, correction: <MathText>{'$\\dfrac{20}{25} = 0{,}8$'}</MathText> },
                  { id: 'd2', label: <MathText>{'النازل — $5 \\le n < 10$'}</MathText>, options: ['$0{,}92$', '$0{,}4$', '$0{,}6$'].map(M), correct: 0, correction: <MathText>{'$\\dfrac{8 + 10 + 5}{25} = \\dfrac{23}{25} = 0{,}92$'}</MathText> },
                  { id: 'd4', label: <MathText>{'النازل — $15 \\le n \\le 20$'}</MathText>, options: ['$1$', '$0{,}2$', '$5$'].map(M), correct: 1, correction: <MathText>{'آخر فئة: تواترها وحده $\\dfrac{5}{25} = 0{,}2$'}</MathText> },
                ]}
                requires={['tawatur-fiat']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: الصاعد 0,08 ، 0,4 ، 0,8 ، 1 والنازل 1 ، 0,92 ، 0,6 ، 0,2.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
