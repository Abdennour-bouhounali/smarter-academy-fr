import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { SourceTag, TextbookBox, MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, SOLVE_ALL, EX26, EX27, ANGLE_FROM_SIDES, CHECKS } from '../content/textbook';
import { FIG_EX26, FIG_EX27 } from '../content/figures';

/**
 * Module 2 — طرائق من المنصّة (stage `discovery` : TOUCH → FORMALIZE). Le manuel n'a ni معارف ni طرائق pour cette leçon :
 * les étapes de la modélisation et la résolution du triangle entier sont une formalisation DÉCLARÉE de la plateforme
 * (`knowledge_formalization`, « معارف من المنصّة »), posées sur deux exercices du manuel (أتعمّق p. 125) :
 *   1. ex-26 1) résolu LIGNE À LIGNE (MethodSteps) : pourquoi sin → brique khatawat-tarid                        (P1)
 *   2. ex-26 2) les quatre chemins vers AB ; avec AC ≈ 1,9 arrondi, tan donne 5,8 au lieu de 5,7 → tadwir-akhir    (P3)
 *   3. ex-27 résolu par l'élève : MS au centième, puis SF par quatre chemins et F̂ = 58° → hall-muthallath         (P3)
 *   4. un angle par deux côtés : le projecteur du module 1 (24 m vu de 30 m) → 39°, ce que lisait le téléphone
 *      → zawiya-min-dilain                                                                                     (P2)
 * « أتوقّع القاعدة » : la boîte METHOD (début de l'étape 1) et la boîte SOLVE_ALL (étape 3) ÉNONCENT les règles de
 * leurs briques : elles sont enveloppées dans <PredictRule id="khatawat-tarid"> / <PredictRule id="hall-muthallath">
 * (une seule prédiction, puis boîte et brique). tadwir-akhir est un RAPPEL (درس 1 `hisab-tul`, درس 2 `tadwir-dalaqa` :
 * « on n'arrondit que le résultat » ; ici le retour de la grille le redit avant la brique).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const close = (v) => (n) => Number.isFinite(n) && Math.abs(n - v) < 1e-9;

export default function Module02Taraiq() {
  const [q, setQ] = useState({});
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));

  return (
    <ContentModule
      objectives={['بماذا نبدأ حين نقرأ وضعية جديدة؟', 'هل تعطي طرق الحساب المختلفة النتيجة نفسها؟', 'كيف نجد كل عناصر المثلث القائم؟', 'كيف نعيّن زاوية من ضلعين؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="طرائق — من الوضعية إلى المثلث القائم"
      moduleSubtitle="معارف من المنصّة على تمرينين من الكتاب"
      estimatedTime="14 دقيقة"
      brief={{
        tag: 'معارف من المنصّة — على التمرينين 26 و 27 (ص 125)', title: 'كيف نحلّ وضعية بالنسب المثلثية؟', tone: 'emerald',
        body: <p>الطريقة التي اتّبعتها مع السلّم والكشّاف، مكتوبة خطوة خطوة، ثم تمرينان من الكتاب: الأول محلول سطرا سطرا، والثاني تحلّه بنفسك. حاول أن تتوقّع كل سطر قبل أن تكشفه.</p>,
        footer: <SourceTag source={METHOD.source} />,
      }}
      steps={[
        {
          num: 1, title: 'مثال محلول — التمرين 26 (1)', subtitle: 'نرسم، نسمّي، نختار', done: !!q[1],
          content: (
            <div className="space-y-3">
              {/* La boîte énonce les étapes de la brique khatawat-tarid : l'élève les prédit d'abord (l'échelle et le projecteur du module 1). */}
              <PredictRule id="khatawat-tarid"><TextbookBox kind="definition" title={METHOD.title} lines={METHOD.lines} source={METHOD.source} compact /></PredictRule>
              <GeoFigure {...FIG_EX26} />
              <MethodSteps method={{ source: EX26.source, exercise: EX26.statement, solution: EX26.solution }} />
              <TapQuestion
                prompt={<MathText>{'لماذا اخترنا $\\sin\\widehat{B}$ لحساب AC؟'}</MathText>}
                options={[
                  'لأن [AC] مقابل للزاوية B و [BC] وتر، والجيب يجمع المقابل والوتر',
                  'لأن [AC] مجاور للزاوية B و [BC] وتر',
                  'لأن الزاوية $18^{\\circ}$ أصغر من $45^{\\circ}$',
                ].map(M)}
                correct={0} cols={1} requires={['ikhtiyar-nisba', 'tarid-muthallath']}
                explain={<MathText>{'بالنسبة إلى B : [BC] يقابل الزاوية القائمة فهو الوتر، و [AC] لا يمرّ بالرأس B فهو المقابل، و [AB] هو المجاور. قيس الزاوية لا يختار النسبة: المعلوم والمطلوب يختارانها.'}</MathText>}
                onAnswered={mark(1)} />
              {q[1] && <KnowledgeBrick id="khatawat-tarid" lead="الخطوات التي اتّبعناها:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'التمرين 26 (2) — أربع طرق لحساب AB', subtitle: 'هل تعطي النتيجة نفسها؟', done: !!q[2],
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'وجدنا $AC \\approx 1{,}9$ . احسب AB مدوّرا إلى الجزء من 10 بكل طريقة:'}</MathText></p>}
                rows={[
                  { id: 'cos', label: <MathText>{'باستعمال $\\cos\\widehat{B}$ : $AB = 6 \\times \\cos 18^{\\circ} \\approx$'}</MathText>, options: ['$5{,}7$', '$1{,}9$', '$6{,}3$'].map(M), correct: 0,
                    correction: <MathText>{'AB مجاور للزاوية B: $\\cos 18^{\\circ} = \\dfrac{AB}{6}$ فنضرب ( $6{,}3 = \\dfrac{6}{\\cos 18^{\\circ}}$ أطول من الوتر).'}</MathText> },
                  { id: 'pyth', label: <MathText>{'بخاصية فيثاغورس مع $AC \\approx 1{,}9$ : $AB = \\sqrt{6^2 - 1{,}9^2} \\approx$'}</MathText>, options: ['$5{,}7$', '$4{,}1$', '$6{,}3$'].map(M), correct: 0,
                    correction: <MathText>{'$\\sqrt{36 - 3{,}61} = \\sqrt{32{,}39} \\approx 5{,}69$ أي $5{,}7$ ( $4{,}1 = 6 - 1{,}9$ ليست خاصية فيثاغورس، و $6{,}3$ تجمع المربعين بدل طرحهما).'}</MathText> },
                  { id: 'tan', label: <MathText>{'باستعمال $\\tan\\widehat{B}$ مع $AC \\approx 1{,}9$ : $AB = \\dfrac{1{,}9}{\\tan 18^{\\circ}} \\approx$'}</MathText>, options: ['$5{,}8$', '$5{,}7$', '$0{,}6$'].map(M), correct: 0,
                    correction: <MathText>{`$\\dfrac{1{,}9}{\\tan 18^{\\circ}} \\approx 5{,}85$ أي $5{,}8$ : لا $5{,}7$ ! ${CHECKS.earlyWhy}`}</MathText> },
                  { id: 'sinC', label: <MathText>{'باستعمال $\\sin\\widehat{C}$ ، $\\widehat{C} = 90^{\\circ} - 18^{\\circ} = 72^{\\circ}$ : $AB = 6 \\times \\sin 72^{\\circ} \\approx$'}</MathText>, options: ['$5{,}7$', '$1{,}9$', '$6{,}3$'].map(M), correct: 0,
                    correction: <MathText>{'بالنسبة إلى C ، [AB] مقابل و [BC] وتر: $\\sin 72^{\\circ} = \\dfrac{AB}{6}$ .'}</MathText> },
                ]}
                requires={['khatawat-tarid', 'fithaghuris', 'zawiyatan-hadatan']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{allRight ? EX26.earlyNote : 'راجع التصحيح تحت كل سطر.'}</MathText></Feedback>}
                onAnswered={mark(2)} />
              {q[2] && (
                <>
                  <KnowledgeBrick id="tadwir-akhir" variant="rappel" lead="لماذا اختلفت طريقة واحدة؟" />
                  <p className="text-xs text-slate-600" data-misconception-note="tadwir"><MathText>{`خطأ شائع: ${CHECKS.earlyWrong} ${CHECKS.earlyWhy}`}</MathText></p>
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'التمرين 27 — حلّ المثلث كاملا', subtitle: 'دورك الآن', done: !!q[3] && !!q[4],
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={EX27.statement} source={EX27.source} compact />
              <GeoFigure {...FIG_EX27} />
              <NumericQuestion
                prompt={<MathText>{'1) MS بالسنتيمتر، مدوّرا إلى الجزء من 100:'}</MathText>}
                expected={close(14.4)} display="14,40" parse={parseDec}
                requires={['khatawat-tarid', 'ikhtiyar-nisba', 'majhul-maqam']}
                explain={<MathText>{'بالنسبة إلى S : MF مقابل (معلوم) و MS مجاور (مطلوب)، فالظل: $\\tan 32^{\\circ} = \\dfrac{9}{MS}$ ، المجهول في المقام: $MS = \\dfrac{9}{\\tan 32^{\\circ}} \\approx 14{,}403$ أي $14{,}40\\,\\mathrm{cm}$ .'}</MathText>}
                explainFor={(n) => <MathText>{close(5.62)(n) ? 'ضربت في $\\tan 32^{\\circ}$ : المجهول MS في المقام، فنقسم.'
                  : close(16.98)(n) ? 'هذا SF ، الوتر: MS هو المجاور للزاوية S.'
                    : close(7.63)(n) ? 'هذا $9 \\times \\cos 32^{\\circ}$ : 9 ليس الوتر، إنه المقابل للزاوية S.'
                      : '$MS = \\dfrac{9}{\\tan 32^{\\circ}} \\approx 14{,}40\\,\\mathrm{cm}$ .'}</MathText>}
                onAnswered={mark(3)} />
              {q[3] && (
                <BatchChoiceQuestion
                  intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'2) SF مدوّرا إلى الجزء من 10، بكل طريقة (بالقيمة المضبوطة لـ MS):'}</MathText></p>}
                  rows={[
                    { id: 'sinS', label: <MathText>{'بـ $\\sin\\widehat{S}$ : $SF = \\dfrac{9}{\\sin 32^{\\circ}} \\approx$'}</MathText>, options: ['$17{,}0$', '$4{,}8$', '$10{,}6$'].map(M), correct: 0,
                      correction: <MathText>{'$\\sin 32^{\\circ} = \\dfrac{9}{SF}$ ، المجهول في المقام ( $4{,}8 = 9 \\times \\sin 32^{\\circ}$ أقصر من MF ، و $10{,}6 = \\dfrac{9}{\\cos 32^{\\circ}}$ يجعل MF مجاورا).'}</MathText> },
                    { id: 'pyth', label: <MathText>{'بخاصية فيثاغورس: $SF = \\sqrt{9^2 + MS^2} \\approx$'}</MathText>, options: ['$17{,}0$', '$11{,}2$', '$23{,}4$'].map(M), correct: 0,
                      correction: <MathText>{'$\\sqrt{81 + 14{,}403^2} \\approx 16{,}98$ ( $11{,}2$ تطرح المربعين، و $23{,}4 = 9 + 14{,}4$ تجمع الطولين).'}</MathText> },
                    { id: 'cosS', label: <MathText>{'بـ $\\cos\\widehat{S}$ : $SF = \\dfrac{MS}{\\cos 32^{\\circ}} \\approx$'}</MathText>, options: ['$17{,}0$', '$12{,}2$', '$14{,}4$'].map(M), correct: 0,
                      correction: <MathText>{'$\\cos 32^{\\circ} = \\dfrac{MS}{SF}$ ( $12{,}2 = MS \\times \\cos 32^{\\circ}$ أقصر من MS نفسه).'}</MathText> },
                    { id: 'F', label: <MathText>{'قيس الزاوية $\\widehat{F}$'}</MathText>, options: ['$58^{\\circ}$', '$32^{\\circ}$', '$148^{\\circ}$'].map(M), correct: 0,
                      correction: <MathText>{'الزاويتان الحادتان متتامتان: $90^{\\circ} - 32^{\\circ} = 58^{\\circ}$ .'}</MathText> },
                    { id: 'cosF', label: <MathText>{'بـ $\\cos\\widehat{F}$ : $SF = \\dfrac{9}{\\cos 58^{\\circ}} \\approx$'}</MathText>, options: ['$17{,}0$', '$4{,}8$', '$10{,}6$'].map(M), correct: 0,
                      correction: <MathText>{'بالنسبة إلى F ، [MF] مجاور و [SF] وتر: $\\cos 58^{\\circ} = \\dfrac{9}{SF}$ .'}</MathText> },
                  ]}
                  requires={['majhul-maqam', 'fithaghuris', 'zawiyatan-hadatan']}
                  feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{allRight ? 'أربع طرق، نتيجة واحدة: $SF \\approx 17{,}0\\,\\mathrm{cm}$ .' : 'راجع التصحيح تحت كل سطر.'}</MathText></Feedback>}
                  onAnswered={mark(4)} />
              )}
              {q[4] && (
                <>
                  {/* La remarque énonce la règle de la brique hall-muthallath : l'élève la prédit d'abord. */}
                  <PredictRule id="hall-muthallath"><TextbookBox kind="remark" title={SOLVE_ALL.title} lines={SOLVE_ALL.lines} source={SOLVE_ALL.source} compact /></PredictRule>
                  <KnowledgeBrick id="hall-muthallath" />
                  <p className="text-xs text-slate-600"><MathText>{CHECKS.verify}</MathText></p>
                </>
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'زاوية من ضلعين', subtitle: 'ما يقرؤه الهاتف، بالحساب', done: !!q[5],
          content: (
            <div className="space-y-3">
              <TextbookBox kind="example" text={ANGLE_FROM_SIDES.text} source={ANGLE_FROM_SIDES.source} compact />
              <NumericQuestion
                prompt={<MathText>{'قيس α بالدرجة (المدوّر إلى الوحدة):'}</MathText>}
                expected={close(39)} display="39" parse={parseDec}
                requires={['ikhtiyar-nisba', 'hasiba']}
                explain={<MathText>{ANGLE_FROM_SIDES.explain}</MathText>}
                explainFor={(n) => <MathText>{close(51)(n) ? 'قلبت النسبة: الظل هو المقابل على المجاور، والمقابل 24 في البسط: $\\tan\\alpha = \\dfrac{24}{30}$ .'
                  : close(53)(n) ? 'هذا $\\sin\\alpha = \\dfrac{24}{30}$ : 30 ليس الوتر (خط النظر)، إنه المجاور.'
                    : close(37)(n) ? 'هذا $\\cos\\alpha = \\dfrac{24}{30}$ : جيب التمام يحتاج الوتر.'
                      : ANGLE_FROM_SIDES.explain}</MathText>}
                onAnswered={mark(5)} />
              {q[5] && <KnowledgeBrick id="zawiya-min-dilain" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
