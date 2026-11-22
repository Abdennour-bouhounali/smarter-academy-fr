import { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOW, METHOD_PERCENT, METHOD_COMPOUND, NOW_71, BIDALALA } from '../content/textbook';

/**
 * Module 3 — معارف (p. 70) et طرائق (p. 71) (FORMALIZE) :
 *   1. le tableau des pourcentages du manuel (prendre / augmenter / diminuer), relu avec les
 *      briques du module 1, puis trois traductions (aucun distracteur juste : « x + 12 », « 0,4x »…) ;
 *   2. le réservoir (طرائق) ligne à ligne (MethodSteps) → brique tatabu-darb : pourquoi pas −15 % ;
 *   3. دوري الآن : 1,03 × 0,98 × 0,99 = 0,999306 ;
 *   4. la grandeur PRODUIT (aire, énergie — kWh CORRIGÉ, une ligne discrète) → brique miqdar-jida ;
 *   5. la grandeur QUOTIENT et la densité de population de l'Algérie (طرائق) → brique
 *      miqdar-bidalala : une grandeur donnée en fonction d'une autre (m = ρ × V).
 * LP : P1 (1–3), P2 (4–5), P3 (5).
 * RETROFIT 2026-10-15 : nommer APRÈS la réponse — le tableau des pourcentages après les trois traductions, la brique tatabu-darb
 * et l'encadré de la méthode après « لماذا لا … 15% »، miqdar-jida après le calcul de l'énergie، miqdar-bidalala après la
 * question m = 920V.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03MaarifTarayiq() {
  const [q1, setQ1] = useState(false);
  const [read2, setRead2] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [read5, setRead5] = useState(false);
  const [q5, setQ5] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      objectives={["كيف نحسب مقدارًا تغيّر مرّتين متتاليتين؟", "كيف نحسب مقدارًا مركّبًا ونحوّل وحداته؟", "كيف نعبّر عن مقدار بدلالة مقدار آخر؟"]}
      moduleNumber={3}
      moduleTitle="معارف وطرائق"
      moduleSubtitle="تطبيقات التناسبية"
      estimatedTime="11 دقيقة"
      brief={{
        tag: 'معارف — الكتاب ص 70 · طرائق — ص 71', title: KNOW.title, tone: 'emerald',
        body: (
          <div className="space-y-2">
            <p>ما اكتشفته ببطاقة السعر وبالمقادير المركّبة، كما يكتبه الكتاب: جدول النسب المئوية، ثم تغيّران متتابعان، ثم مقدار الجداء ومقدار حاصل القسمة.</p>
            <p className="text-sm text-slate-600">في الطرائق: اقرأ كل سطر من الحل، وحاول أن تتوقّع السطر التالي قبل أن تكشفه.</p>
          </div>
        ),
        footer: <div className="flex flex-wrap gap-2"><SourceTag source={KNOW.source} /><SourceTag source={METHOD_PERCENT.source} /></div>,
      }}
      steps={[
        {
          num: 1, title: 'جدول النسب المئوية', subtitle: 'معارف ص 70', done: q1,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">الدالة الخطية المرفقة بكل حالة:</p>}
                rows={[
                  { id: 'r1', label: M('زيادة $x$ بـ 12%'), options: [M('$x \\longmapsto 1{,}12x$'), M('$x \\longmapsto 0{,}12x$'), M('$x \\longmapsto x + 12$')], correct: 0,
                    correction: M('$1 + \\dfrac{12}{100} = 1{,}12$ . أمّا $0{,}12x$ فهو مقدار الزيادة، و $x + 12$ ليست خطية.') },
                  { id: 'r2', label: M('تخفيض $x$ بـ 40%'), options: [M('$x \\longmapsto 0{,}4x$'), M('$x \\longmapsto 0{,}6x$'), M('$x \\longmapsto 1{,}4x$')], correct: 1,
                    correction: M('$1 - \\dfrac{40}{100} = 0{,}6$ . أمّا $0{,}4x$ فهو مقدار التخفيض، و $1{,}4x$ زيادة.') },
                  { id: 'r3', label: M('أخذ 3% من $x$'), options: [M('$x \\longmapsto 1{,}03x$'), M('$x \\longmapsto 0{,}3x$'), M('$x \\longmapsto 0{,}03x$')], correct: 2,
                    correction: M('$\\dfrac{3}{100} = 0{,}03$ . و $0{,}3x$ هو 30% من $x$ ، و $1{,}03x$ زيادة بـ 3%.') },
                ]}
                requires={['nisba-akhdh', 'ziyada-darb', 'takhfid-darb']}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    <MathText>{allRight ? 'الأخذ يضرب في $\\dfrac{t}{100}$ ، والزيادة في $1 + \\dfrac{t}{100}$ ، والتخفيض في $1 - \\dfrac{t}{100}$ .' : 'ميّز بين أخذ النسبة (المقدار المأخوذ وحده) والزيادة أو التخفيض (المقدار كلّه بعد التغيّر).'}</MathText>
                  </Feedback>
                )}
                onAnswered={() => setQ1(true)}
              />
              {q1 && (
                <TextbookBox kind="property" title={KNOW.title} source={KNOW.source}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-know-percent-table>
                      <tbody>
                        {KNOW.percentTable.map((row) => (
                          <tr key={row.case} className="border-t border-violet-200">
                            <td className="py-1 pe-2 font-bold"><MathText>{row.case}</MathText></td>
                            <td className="py-1 pe-2"><MathText>{row.means}</MathText></td>
                            <td className="py-1"><MathText>{row.fn}</MathText></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <ul className="list-disc space-y-0.5 ps-5 text-sm text-slate-700">
                    {KNOW.percentExamples.map((e) => <li key={e}><MathText>{e}</MathText></li>)}
                  </ul>
                </TextbookBox>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'الخزان: تغيّران متتابعان', subtitle: 'طرائق ص 71 — الحلّ سطرًا سطرًا', done: read2 && q2,
          content: (
            <div className="space-y-3">
              <MethodSteps method={{ source: METHOD_PERCENT.source, exercise: METHOD_PERCENT.exercise, solution: METHOD_PERCENT.solution }} onAllRevealed={() => setRead2(true)} />
              {read2 && (
                <>
                  <TapQuestion
                    prompt={<MathText>{'لماذا لا يساوي «تفريغ 30% ثم إضافة 15%» تخفيضًا بـ 15%؟'}</MathText>}
                    options={[
                      M('لأنّ الـ 15% تُحسب مما بقي ( $21m^3$ ) لا من $30m^3$ : نضرب $0{,}7 \\times 1{,}15 = 0{,}805$ ، أي تخفيض بـ $19{,}5\\%$'),
                      M('لأنّ النسب المتتابعة لا تُجمع إلا إذا كانت كلها زيادات'),
                      M('لأنّ الخزان يفيض بعد إضافة 15%'),
                    ]}
                    correct={0}
                    cols={1}
                    explain={<MathText>{'$30 \\times 0{,}805 = 24{,}15$ ، أما تخفيض 15% فيعطي $30 \\times 0{,}85 = 25{,}5$ . حتى زيادتان لا تُجمعان: $+10\\%$ ثم $+10\\%$ تعطيان $1{,}1 \\times 1{,}1 = 1{,}21$ أي $+21\\%$ . والخزان لا يفيض: $24{,}15 < 30$ .'}</MathText>}
                    onAnswered={() => setQ2(true)}
                  />
                  {q2 && (
                    <>
                    <KnowledgeBrick id="tatabu-darb" lead="ما فعله الكتاب بالخزان — وما فعلته في المستوى المتقدّم:" />
                    <TextbookBox kind="method" title={METHOD_PERCENT.title} text={METHOD_PERCENT.method} source={METHOD_PERCENT.source} compact />
                    </>
                  )}
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'دوري الآن', subtitle: 'ص 71', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={NOW_71.text} source={NOW_71.source} compact />
              <NumericQuestion
                prompt="العدد الذي نضرب فيه السعر:"
                expected={0.999306}
                display="0,999306"
                parse={parseDec}
                requires={['tatabu-darb']}
                explainFor={(n) => (n === 1 || n === 0
                  ? <MathText>{`جمعت النسب: $3 - 2 - 1 = 0$ . ${NOW_71.explain}`}</MathText>
                  : <MathText>{NOW_71.explain}</MathText>)}
                explain={<MathText>{NOW_71.explain}</MathText>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'مقدار جداء', subtitle: 'معارف ص 70', done: q4,
          content: (
            <div className="space-y-3">
              <PredictRule id="miqdar-jida" prompt={"تعلّمت أنّ حاصل قسمة مقدارين (كالسرعة المتوسطة) يعطي «مقدار حاصل القسمة». بالقياس: ماذا نحصل عليه عندما نضرب مقدارين؟ أعطِ مثالًا من الهندسة وآخر من الكهرباء."}><TextbookBox kind="definition" title="المقادير المركّبة" lines={[KNOW.productQuantity, ...KNOW.productExamples]} source={KNOW.source}>
                <p className="text-[11px] text-slate-500" data-correction-note><MathText>{KNOW.correctionNote}</MathText></p>
              </TextbookBox></PredictRule>
              <NumericQuestion
                prompt={<MathText>{'مكيّف هواء استطاعته $2kW$ يشتغل مدة $3{,}5h$ . الطاقة التي يستهلكها (بالكيلوواط ساعي):'}</MathText>}
                expected={7}
                parse={parseDec}
                suffix="kWh"
                explain={<MathText>{'$E = P \\times t = 2kW \\times 3{,}5h = 7kWh$ . نضرب الاستطاعة في المدة، ولا نقسم.'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <KnowledgeBrick id="miqdar-jida" lead="الطاقة والمساحة يُحسبان بجداء مقدارين:" />}
            </div>
          ),
        },
        {
          num: 5, title: 'مقدار حاصل القسمة، ومقدار بدلالة آخر', subtitle: 'معارف ص 70 · طرائق ص 71', done: read5 && q5,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="definition" title="مقدار حاصل القسمة" lines={[KNOW.quotientQuantity, ...KNOW.quotientExamples]} source={KNOW.source} />
              <KnowledgeBrick id="miqdar-qisma" variant="rappel" compact />
              <MethodSteps method={{ source: METHOD_COMPOUND.source, exercise: METHOD_COMPOUND.exercise, solution: METHOD_COMPOUND.solution }} onAllRevealed={() => setRead5(true)} />
              {read5 && (
                <>
                  <TapQuestion
                    prompt={<MathText>{'الكتلة الحجمية لزيت الزيتون $920kg/m^3$ . الكتلة $m$ (بالكيلوغرام) لحجم $V$ (بالمتر المكعب) من هذا الزيت هي:'}</MathText>}
                    options={[M('$m = 920V$'), M('$m = \\dfrac{V}{920}$'), M('$m = 920 + V$')]}
                    correct={0}
                    cols={3}
                    explain={<MathText>{`من $m_v = \\dfrac{m}{V}$ ينتج $m = 920 \\times V$ : مثلا $2m^3$ كتلتها $1840kg$ . ${BIDALALA.example}`}</MathText>}
                    onAnswered={() => setQ5(true)}
                  />
                  {q5 && (
                    <>
                      <TextbookBox kind="method" title={METHOD_COMPOUND.title} text={METHOD_COMPOUND.method} source={METHOD_COMPOUND.source} compact />
                      <KnowledgeBrick id="miqdar-bidalala" lead="نقرأ المقادير المركّبة في الاتجاه الآخر:" />
                    </>
                  )}
                </>
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
