import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { TextbookBox, SourceTag, MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY2, ACTIVITY2_LINES, KNOWLEDGE, IMAGE_METHOD, METHOD, ZERO_NOTE } from '../content/textbook';
import ValueTable from '../components/ValueTable';

/**
 * Module 2 — نشاط 2 (p. 66), معارف 1 et 2 (p. 68), طرائق (p. 69).
 *   1. نشاط 2 — « quelles machines sont linéaires ? » en TABLEAUX : les trois tableaux du livre à
 *      associer à x², 2x, 2x − 1 (س 1), le seul tableau de proportionnalité (س 2), la seule fonction
 *      linéaire (س 3) — le contraste que le niveau متقدم du lab a fait toucher ;
 *   2. معارف 1 — la définition (brique dala-khattiya), ses exemples, quatre fonctions à classer ;
 *   3. la صورة (hisab-sura) et معارف 2 — le tableau de −3x (jadwal-khattiya) ;
 *   4. la طريقة g(−2) = 6, révélée ligne à ligne (MethodSteps), la brique tayin-dala et la condition
 *      m ≠ 0 (la carte 0 du lab).
 * Les questions utilisent d'AUTRES nombres que les encadrés (la réponse n'est jamais au-dessus).
 * Rétrofit 2026-10-15 (§4quater) : sans labo, il s'ouvre sur la première question (les trois tableaux, plus de carte des questions
 * du livre au-dessus) ; les classements, la صورة et le calcul de a sont essayés AVANT leurs encadrés / briques (gardés par la réponse).
 * LP : P1, P2, P3.
 */
const Opt = (s) => <MathText key={s}>{s}</MathText>;
const EXPR = ['$x^2$', '$2x$', '$2x - 1$'];

export default function Module02Maarif() {
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3a, setQ3a] = useState(false);
  const [q3, setQ3] = useState(false);
  const [, setLines] = useState(false);
  const [q4a, setQ4a] = useState(false);
  const [q4, setQ4] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      objectives={["كيف نميّز الدالة الخطية من غيرها؟", "ماذا يميّز جدول قيم دالة خطية؟", "كيف نعيّن الدالة الخطية إذا عرفنا عددًا وصورته؟"]}
      moduleNumber={2}
      moduleTitle="معارف — الدالة الخطية"
      moduleSubtitle="تمييزها، صورة عدد، جدول قيمها، وتعيينها من عدد وصورته"
      estimatedTime="14 دقيقة"
      brief={{
        tag: 'أنشطة ص 66 · معارف ص 68 · طرائق ص 69', title: KNOWLEDGE.linear.title, tone: 'violet',
        body: <p><MathText>{'في النشاط 1 طابقت آلةُ الضرب في $0{,}8$ آلةَ التخفيض. هل تطابق كلَّ آلة آلةُ ضرب؟ نبدأ بثلاثة جداول من الكتاب، ثم نعرّف الدالة الخطية ونتعلّم تعيينها.'}</MathText></p>,
      }}
      steps={[
        {
          num: 1, title: 'أيّ هذه الدوال آلة ضرب؟', subtitle: 'نشاط 2 — ثلاثة جداول', done: q1,
          content: (
            <div className="space-y-3">
              <p className="text-xs text-slate-500"><MathText>{`نشاط 2: ${ACTIVITY2.title}`}</MathText> <SourceTag source={ACTIVITY2.source} /></p>
              <div className="grid gap-2 grid-cols-3" data-act2-tables>
                {ACTIVITY2.tables.map((tb) => (
                  <ValueTable key={tb.n} n={tb.n} rows={[{ label: '$x$', cells: tb.x }, { label: '$y$', cells: tb.y }]} />
                ))}
              </div>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'س 1) العبارة الموافقة لكل جدول ($x \\longmapsto …$):'}</MathText></p>}
                rows={[
                  { id: 't1', label: 'الجدول 1', options: EXPR.map(Opt), correct: 2, correction: <MathText>{ACTIVITY2_LINES.t1}</MathText> },
                  { id: 't2', label: 'الجدول 2', options: EXPR.map(Opt), correct: 1, correction: <MathText>{ACTIVITY2_LINES.t2}</MathText> },
                  { id: 't3', label: 'الجدول 3', options: EXPR.map(Opt), correct: 0, correction: <MathText>{ACTIVITY2_LINES.t3}</MathText> },
                ]}
                requires={['taawid-qima']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: ثلاثة جداول، ثلاث عبارات.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1a(true)}
              />
              {q1a && (
                <TapQuestion
                  prompt="س 2) أيّ الجداول جدول تناسبية؟"
                  options={['الجدول 2 وحده', 'الجدولان 1 و 2', 'الجداول الثلاثة', 'الجدول 3 وحده']}
                  correct={0}
                  cols={2}
                  requires={['muamil-tanasub']}
                  explain={<MathText>{ACTIVITY2_LINES.prop}</MathText>}
                  onAnswered={() => setQ1b(true)}
                />
              )}
              {q1b && (
                <TapQuestion
                  prompt={<MathText>{'س 3) الدوال الخطية من بين أ) $x \\longmapsto x^2$ ، ب) $x \\longmapsto 2x$ ، جـ) $x \\longmapsto 2x - 1$ هي:'}</MathText>}
                  options={['ب) وحدها', 'ب) و جـ)', 'أ) و ب)', 'الثلاث'].map(Opt)}
                  correct={0}
                  cols={2}
                  requires={['dala-nashat']}
                  explain={<MathText>{ACTIVITY2_LINES.linear}</MathText>}
                  onAnswered={() => setQ1(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'أيّ هذه الدوال خطية؟', subtitle: 'معارف 1', done: q2,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">هل هي دالة خطية؟ وإن كانت، ما معاملها؟</p>}
                rows={[
                  { id: 'l1', label: <MathText>{'$x \\longmapsto -5x$'}</MathText>, options: ['خطية معاملها $-5$', 'خطية معاملها $5$', 'ليست خطية'].map(Opt), correct: 0, correction: <MathText>{'$-5x = (-5) \\times x$ : من الشكل $ax$ مع $a = -5$ (المعامل بإشارته).'}</MathText> },
                  { id: 'l2', label: <MathText>{'$x \\longmapsto x + 5$'}</MathText>, options: ['خطية معاملها $5$', 'خطية معاملها $1$', 'ليست خطية'].map(Opt), correct: 2, correction: <MathText>{'صورة 0 هي $0 + 5 = 5$ وليست 0: العبارة ليست من الشكل $ax$.'}</MathText> },
                  { id: 'l3', label: <MathText>{'$x \\longmapsto \\dfrac{2}{3}x$'}</MathText>, options: ['خطية معاملها $\\dfrac{2}{3}$', 'خطية معاملها $\\dfrac{3}{2}$', 'ليست خطية'].map(Opt), correct: 0, correction: <MathText>{'$\\dfrac{2}{3}x = \\dfrac{2}{3} \\times x$ : $a = \\dfrac{2}{3}$.'}</MathText> },
                  { id: 'l4', label: <MathText>{'$x \\longmapsto 5x^2$'}</MathText>, options: ['خطية معاملها $5$', 'خطية معاملها $10$', 'ليست خطية'].map(Opt), correct: 2, correction: <MathText>{'$5x^2 = 5x \\times x$ : المضروب في $x$ ليس عددًا ثابتًا ($1 \\longmapsto 5$ لكن $2 \\longmapsto 20 \\neq 10$).'}</MathText> },
                ]}
                requires={['dala-nashat']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="dala-nashat" variant="rappel" compact />}
              {q2 && <TextbookBox kind="definition" title={KNOWLEDGE.linear.title} lines={KNOWLEDGE.linear.definition} source={KNOWLEDGE.linear.source} compact />}
              {q2 && <TextbookBox kind="example" lines={KNOWLEDGE.linear.examples} source={KNOWLEDGE.linear.source} compact />}
              {q2 && <KnowledgeBrick id="dala-khattiya" lead="ما تفعله الآلة التي تطابقها آلة الضرب، معرَّفًا:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'ما صورة عدد، وماذا يميّز جدول القيم؟', subtitle: 'معارف 1 و 2', done: q3,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'$f$ الدالة الخطية $f(x) = 1{,}5x$ : $f(-4) =$'}</MathText>}
                expected={(n) => Math.abs(n + 6) < 1e-9}
                parse={parseDec}
                display="-6"
                requires={['dala-khattiya']}
                explain={<MathText>{'$f(-4) = 1{,}5 \\times (-4) = -6$.'}</MathText>}
                onAnswered={() => setQ3a(true)}
              />
              {q3a && <KnowledgeBrick id="hisab-sura" lead="من التعريف: «العدد a × x يسمى صورة x»." />}
              {q3a && (
                <>
                  <PredictRule id="jadwal-khattiya" prompt={"في آلة التخفيض كانت الدالة $f(x) = 0{,}8x$ وجدول الأسعار جدول تناسبية. ماذا تستنتج عن جدول قيم أيّ دالة خطية $f(x) = ax$؟ وما معامل التناسبية فيه؟"}><TextbookBox kind="definition" title={KNOWLEDGE.table.title} lines={KNOWLEDGE.table.definition} source={KNOWLEDGE.table.source} compact /></PredictRule>
                  <TextbookBox kind="example" text={KNOWLEDGE.table.example} source={KNOWLEDGE.table.source} compact />
                  <ValueTable caption="جدول قيم الدالة f" rows={[{ label: '$x$', cells: KNOWLEDGE.table.x }, { label: '$f(x)$', cells: KNOWLEDGE.table.y }]} arrow={KNOWLEDGE.table.arrow} />
                  <KnowledgeBrick id="jadwal-khattiya" lead="جدولك في آلة التخفيض كان جدول تناسبية معامله 0,8 — وهذه هي القاعدة:" />
                  <TapQuestion
                    prompt={<MathText>{'الجدول ($x$ : $2$ ، $5$ ، $-1$ ؛ $g(x)$ : $-1$ ، $-2{,}5$ ، $0{,}5$) جدول قيم دالة خطية $g$. معاملها هو:'}</MathText>}
                    options={['$-0{,}5$', '$-2$', '$0{,}5$', '$-3$'].map(Opt)}
                    correct={0}
                    cols={4}
                    requires={['jadwal-khattiya']}
                    explain={<MathText>{'$\\dfrac{-1}{2} = \\dfrac{-2{,}5}{5} = \\dfrac{0{,}5}{-1} = -0{,}5$ : معامل التناسبية هو معامل الدالة. ($-2$ هو المقلوب، و $-3$ فرق بين عددين.)'}</MathText>}
                    onAnswered={() => setQ3(true)}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'كيف نعيّن المعامل من عدد وصورته؟', subtitle: 'طرائق', done: q4,
          content: (
            <div className="space-y-3">
              {/* « أتوقّع القاعدة » : la طريقة (g(−2) = 6) énonce la méthode — l'élève l'écrit avant (prompt : knowledge.jsx). */}
              <PredictRule id="tayin-dala"><MethodSteps method={METHOD} onAllRevealed={() => setLines(true)} /></PredictRule>
              <NumericQuestion
                prompt={<MathText>{'$h$ دالة خطية حيث $h(4) = -10$ . معاملها $a =$'}</MathText>}
                expected={(n) => Math.abs(n + 2.5) < 1e-9}
                parse={parseDec}
                display="-2,5"
                requires={['dala-khattiya']}
                explain={<MathText>{'$a \\times 4 = -10$ ، إذن $a = -10 \\div 4 = -2{,}5$ : $h(x) = -2{,}5x$.'}</MathText>}
                onAnswered={() => setQ4a(true)}
              />
              {q4a && <KnowledgeBrick id="tayin-dala" lead="ما فعلته حين وضعت زوجًا من جدولك على مقبض a:" />}
              {q4a && <p className="text-xs text-slate-600"><MathText>{IMAGE_METHOD.rule}</MathText> <SourceTag source={IMAGE_METHOD.source} /></p>}
              {q4a && (
                <TapQuestion
                  prompt={<MathText>{'نعرف عن دالة خطية $k$ أنّ $k(0) = 0$ فقط. هل يكفي هذا لتعيين معاملها؟'}</MathText>}
                  options={['لا: $a \\times 0 = 0$ مهما كان $a$', 'نعم: معاملها $a = 0$', 'نعم: معاملها $a = 1$'].map(Opt)}
                  correct={0}
                  cols={1}
                  requires={['tayin-dala']}
                  explain={<MathText>{ZERO_NOTE.text}</MathText>}
                  onAnswered={() => setQ4(true)}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
