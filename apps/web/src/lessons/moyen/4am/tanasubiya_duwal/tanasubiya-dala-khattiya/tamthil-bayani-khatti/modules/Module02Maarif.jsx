import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation } from '../../../../../../common/manipulations';
import { TextbookBox, SourceTag, MethodSteps } from '../../../../../../common/textbook';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE, METHOD_DRAW, METHOD_READ, METHOD_READ_WINDOW, NOW } from '../content/textbook';
import GraphFigure from '../components/GraphFigure';

/**
 * Module 2 — معارف (p. 68) et طرائق / دوري الآن (p. 69).
 *   1. la propriété (brique tamthil-mustaqim) et l'exemple du livre −2x / 2x, dessiné ;
 *   2. la ملاحظة : le signe de a fixe le sens (brique munha-mustaqim) ;
 *   3. طريقة « تمثيل دالة خطية بيانيا » (1,5x par A(1 ; 1,5)) révélée ligne à ligne (brique rasm-tamthil) ;
 *   4. طريقة « قراءة تمثيل بياني » sur le lab en lecture (la droite du livre, a = 0,4) : f(4) et le
 *      nombre dont l'image est 3,5, puis la règle (brique qiraa-bayaniya) ;
 *   5. دوري الآن : a = 9/4 par A(−2/3 ; −3/2), la droite tracée dans le lab, B(√32 ; √162).
 * Rétrofit 2026-10-15 (§4quater) : les briques, l'exemple et la figure du livre, et les questions suivantes viennent APRÈS la réponse ;
 * les labos de lecture / de tracé n'ont plus de titre (leur `lead` suffit). Les PredictRule restent intactes.
 * Les questions utilisent d'AUTRES nombres que les encadrés (la réponse n'est jamais au-dessus).
 * « أتوقّع القاعدة » : chaque encadré du livre qui ÉNONCE une règle (propriété, ملاحظة, les deux طرائق)
 * est enveloppé dans une PredictRule (même id que la brique) — l'élève écrit la règle (predictPrompt de knowledge.jsx), puis la lit.
 * LP : P1, P3, P2.
 */
const Opt = (s) => <MathText key={s}>{s}</MathText>;
const DIR = ['يصعد', 'ينزل'];

export default function Module02Maarif() {
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4a, setQ4a] = useState(false);
  const [q4b, setQ4b] = useState(false);
  const [q5a, setQ5a] = useState(false);
  const [q5b, setQ5b] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      objectives={["ما شكل التمثيل البياني لدالة خطية؟", "متى يصعد المستقيم ومتى ينزل؟", "كيف نرسم المستقيم، وكيف نقرأ عليه صورة عدد؟"]}
      moduleNumber={2}
      moduleTitle="معارف وطرائق — المستقيم وقراءته"
      moduleSubtitle="التمثيل البياني، المنحى، الرسم والقراءة"
      estimatedTime="13 دقيقة"
      brief={{
        tag: 'معارف ص 68 · طرائق ص 69', title: KNOWLEDGE.title, tone: 'violet',
        body: <p><MathText>{'نجرّب أولًا على دوال جديدة ما فعلته في النشاط 3: ماذا يكون مستقيمها؟ متى يصعد ومتى ينزل؟ ثم نتعلّم كيف نرسمه وكيف نقرأ عليه صورة عدد.'}</MathText></p>,
      }}
      steps={[
        {
          num: 1, title: 'ما شكل تمثيل دالة خطية؟', subtitle: 'معارف — الخاصية', done: q1a && q1b,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tamthil-nashat" variant="rappel" compact />
              {/* « أتوقّع القاعدة » : l'encadré du livre ÉNONCE la règle — l'élève la prédit d'abord. */}
              <PredictRule id="tamthil-mustaqim"><TextbookBox kind="property" text={KNOWLEDGE.property} source={KNOWLEDGE.source} compact /></PredictRule>
              <TapQuestion
                prompt={<MathText>{'معادلة المستقيم الذي يمثّل الدالة الخطية $k : x \\longmapsto -0{,}6x$ هي:'}</MathText>}
                options={['$y = -0{,}6x$', '$y = x - 0{,}6$', '$y = -0{,}6$', '$x = -0{,}6y$'].map(Opt)}
                correct={0}
                cols={2}
                requires={['tamthil-nashat']}
                explain={<MathText>{'التمثيل البياني لدالة خطية معاملها $a$ معادلته $y = ax$ : هنا $y = -0{,}6x$ ، و $-0{,}6$ معامل توجيهه.'}</MathText>}
                onAnswered={() => setQ1a(true)}
              />
              {q1a && <KnowledgeBrick id="tamthil-mustaqim" lead="ما رأيته في النشاط 3، لكل دالة خطية:" />}
              {q1a && <TextbookBox kind="example" text={KNOWLEDGE.example} source={KNOWLEDGE.source} compact />}
              {q1a && (
                <GraphFigure testId="know-3" win={{ xMin: -3, xMax: 3, yMin: -5, yMax: 5 }} height={240}
                  lines={[{ a: -2, label: '(D)', color: '#E11D48' }, { a: 2, label: "(D')", color: '#059669' }]}
                  points={[{ x: 1, y: -2, label: 'A' }, { x: 1, y: 2 }]}
                  caption="الشكل: المستقيم (D) يشمل O و A(1 ; −2)، والمستقيم (D′) يشمل O و (1 ; 2)." />
              )}
              {q1a && <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'هل النقطة من المستقيم $y = -0{,}6x$ ؟'}</MathText></p>}
                rows={[
                  { id: 'p5', label: <MathText>{'$P(5 ; -3)$'}</MathText>, options: ['نعم', 'لا'], correct: 0, correction: <MathText>{'$-0{,}6 \\times 5 = -3$ : ترتيبها صورة فاصلتها.'}</MathText> },
                  { id: 'q3', label: <MathText>{'$Q(-3 ; 5)$'}</MathText>, options: ['نعم', 'لا'], correct: 1, correction: <MathText>{'$-0{,}6 \\times (-3) = 1{,}8 \\neq 5$ : قلبنا إحداثيي P فقط.'}</MathText> },
                  { id: 'o', label: <MathText>{'$O(0 ; 0)$'}</MathText>, options: ['نعم', 'لا'], correct: 0, correction: <MathText>{'$-0{,}6 \\times 0 = 0$ : كل تمثيل لدالة خطية يشمل المبدأ.'}</MathText> },
                ]}
                requires={['tamthil-mustaqim']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: نقطة من المستقيم ترتيبها صورة فاصلتها.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1b(true)}
              />}
            </div>
          ),
        },
        {
          num: 2, title: 'متى يصعد المستقيم ومتى ينزل؟', subtitle: 'معارف — ملاحظة', done: q2,
          content: (
            <div className="space-y-3">
              <PredictRule id="munha-mustaqim"><TextbookBox kind="remark" text={KNOWLEDGE.note} source={KNOWLEDGE.source} compact /></PredictRule>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">من اليسار إلى اليمين، التمثيل البياني للدالة:</p>}
                rows={[
                  { id: 'm1', label: <MathText>{'$x \\longmapsto -0{,}7x$'}</MathText>, options: DIR, correct: 1, correction: <MathText>{'المعامل $-0{,}7 < 0$ : ينزل.'}</MathText> },
                  { id: 'm2', label: <MathText>{'$x \\longmapsto \\dfrac{2}{3}x$'}</MathText>, options: DIR, correct: 0, correction: <MathText>{'المعامل $\\dfrac{2}{3} > 0$ : يصعد.'}</MathText> },
                  { id: 'm3', label: <MathText>{'$x \\longmapsto -x$'}</MathText>, options: DIR, correct: 1, correction: <MathText>{'المعامل $-1 < 0$ : ينزل.'}</MathText> },
                  { id: 'm4', label: <MathText>{'$x \\longmapsto 4x$'}</MathText>, options: DIR, correct: 0, correction: <MathText>{'المعامل $4 > 0$ : يصعد.'}</MathText> },
                ]}
                requires={['tamthil-nashat']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'إشارة المعامل وحدها تكفي.' : 'راجع التصحيح تحت كل سطر: انظر إلى إشارة المعامل.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="munha-mustaqim" lead="ما رأيته على الزالق، بكلمات الكتاب:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'كيف نرسم المستقيم؟', subtitle: 'طرائق — تمثيل دالة خطية بيانيا', done: q3,
          content: (
            <div className="space-y-3">
              <PredictRule id="rasm-tamthil"><MethodSteps method={METHOD_DRAW} /></PredictRule>
              <TapQuestion
                prompt={<MathText>{'لرسم التمثيل البياني للدالة $h : x \\longmapsto -2{,}5x$ نرسم المستقيم الذي يشمل O والنقطة:'}</MathText>}
                options={['$(1 ; -2{,}5)$', '$(-2{,}5 ; 1)$', '$(1 ; 2{,}5)$', '$(0 ; -2{,}5)$'].map(Opt)}
                correct={0}
                cols={2}
                requires={['tamthil-mustaqim']}
                explain={<MathText>{'$h(1) = -2{,}5$ : النقطة $(1 ; -2{,}5)$. أمّا $(-2{,}5 ; 1)$ فقلبٌ للإحداثيين ($h(-2{,}5) = 6{,}25$)، و $(1 ; 2{,}5)$ تنسى الإشارة، و $(0 ; -2{,}5)$ لا تقع على مستقيم يشمل O لأنّ $h(0) = 0$.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="rasm-tamthil" lead="الطريقة، كما تعلّمها الكتاب:" />}
            </div>
          ),
        },
        {
          num: 4, title: 'نقرأ على المستقيم', subtitle: 'طرائق — قراءة تمثيل بياني', done: q4a && q4b,
          content: (
            <div className="space-y-3">
              <Manipulation
                type="origin-line"
                a={METHOD_READ.a}
                mode="read"
                reads="x:4|y:3,5"
                xMin="0" xMax="10" yMin="0" yMax="5"
                theme="cablecar"
                levels={false}
                lead="حرّك المسبار تحت محور الفواصل إلى 4، ثم المسبار على يسار محور التراتيب إلى 3,5، واتبع الخط المتقطع."
              />
              <p className="text-xs text-slate-500"><MathText>{METHOD_READ_WINDOW.note}</MathText> <SourceTag source={METHOD_READ_WINDOW.source} /></p>
              <PredictRule id="qiraa-bayaniya"><MethodSteps method={METHOD_READ} /></PredictRule>
              <NumericQuestion
                prompt={<MathText>{'على المستقيم (D) نفسه، اقرأ صورة $7{,}5$ :'}</MathText>}
                expected={3}
                parse={parseDec}
                display="3"
                requires={['tamthil-mustaqim']}
                explain={<MathText>{'من $7{,}5$ على محور الفواصل نصعد إلى (D) ثم نقرأ الترتيب: $3$ ، أي $f(7{,}5) = 3$.'}</MathText>}
                onAnswered={() => setQ4a(true)}
              />
              {q4a && <KnowledgeBrick id="qiraa-bayaniya" lead="ما فعلته بالمسبارين، طريقةً:" />}
              {q4a && (
                <NumericQuestion
                  prompt={<MathText>{'واقرأ العدد الذي صورته $2$ :'}</MathText>}
                  expected={5}
                  parse={parseDec}
                  display="5"
                  requires={['qiraa-bayaniya']}
                  explain={<MathText>{'من $2$ على محور التراتيب نذهب أفقيًا إلى (D) ثم نقرأ الفاصلة: $5$ ، أي $f(5) = 2$ — وليس $0{,}8$ وهي صورة $2$.'}</MathText>}
                  onAnswered={() => setQ4b(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 5, title: 'دوري الآن', subtitle: 'ص 69', done: q5a && q5b,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" title="دوري الآن" text={NOW.text} source={NOW.source} compact />
              <TapQuestion
                prompt={<MathText>{'معامل الدالة الخطية التي يشمل تمثيلها $A\\left(-\\dfrac{2}{3} ; -\\dfrac{3}{2}\\right)$ هو:'}</MathText>}
                options={['$\\dfrac{9}{4}$', '$\\dfrac{4}{9}$', '$-\\dfrac{9}{4}$', '$1$'].map(Opt)}
                correct={0}
                cols={4}
                requires={['tayin-muamil', 'tamthil-mustaqim']}
                explain={<MathText>{`${NOW.lines.a} أمّا $\\dfrac{4}{9}$ فهو قسمة الفاصلة على الترتيب، و $-\\dfrac{9}{4}$ تنسى أنّ حاصل قسمة عددين سالبين موجب.`}</MathText>}
                onAnswered={() => setQ5a(true)}
              />
              {q5a && (
                <Manipulation
                  type="origin-line"
                  a={NOW.a}
                  mode="draw"
                  points="-2/3:-3/2"
                  theme="cablecar"
                  levels={false}
                  lead="النقطة البرتقالية هي A. ضع نقطة ثانية من التمثيل غير O — نقطة إحداثياها أبسط."
                />
              )}
              <TapQuestion
                prompt={<MathText>{'هل النقطة $B(\\sqrt{32} ; \\sqrt{162})$ تنتمي إلى (D)؟'}</MathText>}
                options={['نعم: ترتيبها صورة فاصلتها', 'لا: إحداثياها ليسا عددين ناطقين'].map(Opt)}
                correct={0}
                cols={1}
                requires={['tamthil-mustaqim']}
                explain={<MathText>{NOW.lines.b}</MathText>}
                onAnswered={() => setQ5b(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
