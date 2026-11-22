import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { SourceTag, TextbookBox, MethodSteps, PairQuestion } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD_PROOF, METHOD_UNKNOWN, NOW145 } from '../content/textbook';
import { FIG_METHOD_PROOF, FIG_METHOD_UNKNOWN, FIG_METHOD_UNKNOWN_DONE, FIG_NOW145_1, FIG_NOW145_2, FIG_NOW145_2_DONE } from '../content/figures';

/**
 * Module 3 — طرائق p. 145 (stage `formalization`). Les deux méthodes du manuel, au mot près, révélées ligne à ligne
 * (MethodSteps), puis دوري الآن : l'élève prouve lui-même.
 *   1. « إنجاز برهان » : A(6 ; −1), B(2 ; 3), C(2 ; −5) — pourquoi BC seul ; √32 = 4√2 (une ligne de la plateforme)
 *                                                                                          → brique tariqat-burhan (P1)
 *   2. « حساب مسافات » : C(−2 ; y) — l'élève écrit BC² AVANT la solution ; le développement sauté par le manuel ; la figure
 *      « après » (C et l'angle droit)                                                       → brique tariqat-majhul (P1)
 *   3. دوري الآن 1 : ABCD مربّع, preuve en quatre lignes (P2)
 *   4. دوري الآن 2 : I(−1 ; −1) puis O sur le cercle (P3)
 * Rétrofit 2026-10-15 (§4quater) : à l'étape 1 l'énoncé du livre est posé, la QUESTION vient d'abord ; la figure, la solution rédigée
 * (MethodSteps) et la brique viennent APRÈS la réponse.
 * « أتوقّع القاعدة » (2026-10-06) : tariqat-burhan redit, dans les mots du manuel, la méthode tabiat-muthallath posée au
 * module 2 → brique `rappel`. tariqat-majhul est neuve, mais la solution du manuel (MethodSteps) l'énonce juste avant sa
 * brique : MethodSteps + développement + vérification sont enveloppés dans une PredictRule (id tariqat-majhul).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Taraiq() {
  const [q, setQ] = useState({});
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3} moduleTitle="طرائق — إنجاز برهان وحساب مجهول"
      moduleSubtitle="طريقتا الكتاب سطرا سطرا، ثم دورك" objectives={['كيف نكتب برهانًا كاملًا بالإحداثيات؟', 'كيف نعيّن إحداثية مجهولة بشرط التعامد؟', 'أبرهن بنفسي على مربّع وعلى نقطة من دائرة']} estimatedTime="11 دقيقة"
      brief={{
        tag: 'طرائق — الكتاب ص 145', title: 'كيف نكتب برهانًا بالإحداثيات؟', tone: 'sky',
        body: <p>الطريقة الأولى تبرهن طبيعة مثلث، والثانية تعيّن إحداثية مجهولة بشرط التعامد: هي ما فعلته في المستوى المتقدّم للمختبر، حين انزلق الشاخص C.</p>,
        footer: <SourceTag source={METHOD_PROOF.source} />,
      }}
      steps={[
        { num: 1, title: 'إنجاز برهان', subtitle: 'قائم في A ومتساوي الساقين', done: !!q[1],
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" title={METHOD_PROOF.title} text={METHOD_PROOF.exercise} source={METHOD_PROOF.source} compact />
              <TapQuestion
                prompt={<MathText>{'لماذا قارن الكتاب $AB^2 + AC^2$ بـ $BC^2$ (لا بـ $AB^2$ أو $AC^2$ )؟'}</MathText>}
                options={[
                  'لأن [BC] أطول الأضلاع، وهو المقابل للرأس A حيث نريد الزاوية القائمة',
                  'لأن طول BC عدد صحيح',
                  'لأن B و C على نفس الخط الشاقولي',
                  'لأن أيّ ترتيب للمربعات يعطي نفس النتيجة',
                ].map(M)}
                correct={0} cols={1} requires={['tabiat-muthallath', 'qaim-fithaghuras']}
                explain={<MathText>{'الزاوية القائمة في A تقابل الضلع [BC]، فهو الذي يكون وحده: $32 + 32 = 64$ . بترتيب آخر نختبر زاوية أخرى: $AB^2 + BC^2 = 96 \\neq 32$ .'}</MathText>}
                onAnswered={mark(1)} />
              {q[1] && (
                <>
                  <GeoFigure {...FIG_METHOD_PROOF} />
                  <MethodSteps method={{ source: METHOD_PROOF.source, exercise: METHOD_PROOF.exercise, solution: METHOD_PROOF.solution }} />
                  <p className="text-xs text-slate-600" data-platform-note="sqrt32"><MathText>{METHOD_PROOF.simplify}</MathText></p>
                  <KnowledgeBrick id="tariqat-burhan" variant="rappel" />
                </>
              )}
            </div>
          ) },
        { num: 2, title: 'حساب مسافات', subtitle: 'إحداثية مجهولة y', done: !!q[2],
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" title={METHOD_UNKNOWN.title} text={METHOD_UNKNOWN.exercise} source={METHOD_UNKNOWN.source} compact>
                <GeoFigure {...FIG_METHOD_UNKNOWN} />
              </TextbookBox>
              <TapQuestion
                prompt={<MathText>{'قبل قراءة الحل: $B(-4\\,;\\,0)$ و $C(-2\\,;\\,y)$ ، فإن $BC^2$ يساوي:'}</MathText>}
                options={['$4 + y^2$', '$4 - y^2$', '$(2 + y)^2$', '$2 + y$'].map(M)}
                correct={0} cols={2} requires={['masafa-maalam', 'murakkibat-shuaa']}
                explain={<MathText>{'$\\overrightarrow{BC}\\begin{pmatrix} -2 + 4 \\\\ y - 0 \\end{pmatrix} = \\begin{pmatrix} 2 \\\\ y \\end{pmatrix}$ ، إذن $BC^2 = 2^2 + y^2 = 4 + y^2$ : نربّع كل مركبة ثم نجمع.'}</MathText>}
                onAnswered={mark(2)} />
              {q[2] && (
                <>
                  <PredictRule id="tariqat-majhul">
                    <MethodSteps method={{ source: METHOD_UNKNOWN.source, exercise: 'عيّن y حتى يكون المستقيمان (AB) و (BC) متعامدين.', solution: METHOD_UNKNOWN.solution }} />
                    <p className="text-sm text-slate-700" data-platform-note="expand"><MathText>{METHOD_UNKNOWN.expand}</MathText></p>
                    <p className="text-sm text-emerald-800"><MathText>{METHOD_UNKNOWN.check}</MathText></p>
                    <GeoFigure {...FIG_METHOD_UNKNOWN_DONE} />
                  </PredictRule>
                  <KnowledgeBrick id="tariqat-majhul" lead="ما فعلته في المختبر، مكتوبا:" />
                </>
              )}
            </div>
          ) },
        { num: 3, title: 'دوري الآن (1)', subtitle: 'برهن أن ABCD مربّع', done: !!q[3],
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" title="دوري الآن" text={NOW145.item1.text} source={NOW145.item1.source} compact>
                <GeoFigure {...FIG_NOW145_1} />
              </TextbookBox>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">أكمل البرهان سطرا سطرا:</p>}
                rows={[
                  { id: 'n1', label: <MathText>{'$\\overrightarrow{AB}$ و $\\overrightarrow{DC}$'}</MathText>, options: ['$\\begin{pmatrix} 0 \\\\ -4 \\end{pmatrix}$ لكليهما: ABCD متوازي أضلاع', '$\\overrightarrow{AB}\\begin{pmatrix} 0 \\\\ -4 \\end{pmatrix}$ و $\\overrightarrow{DC}\\begin{pmatrix} 0 \\\\ 4 \\end{pmatrix}$ : متعاكسان', '$\\begin{pmatrix} -4 \\\\ 0 \\end{pmatrix}$ لكليهما'].map(M), correct: 0,
                    correction: <MathText>{'$\\overrightarrow{AB}\\begin{pmatrix} 2 - 2 \\\\ -2 - 2 \\end{pmatrix}$ و $\\overrightarrow{DC}\\begin{pmatrix} -2 + 2 \\\\ -2 - 2 \\end{pmatrix}$ : نفس المركبتين $\\begin{pmatrix} 0 \\\\ -4 \\end{pmatrix}$ .'}</MathText> },
                  { id: 'n2', label: 'الضلعان المتتاليان AB و BC', options: ['$AB = BC = 4$ : معيّن', '$AB = 4$ و $BC = 0$', '$AB = BC = 16$'].map(M), correct: 0,
                    correction: <MathText>{'$AB = \\sqrt{0 + 16} = 4$ و $BC = \\sqrt{16 + 0} = 4$ ( $16$ هو المربع).'}</MathText> },
                  { id: 'n3', label: 'القطران AC و BD', options: ['$AC = BD = 4\\sqrt{2}$ : مستطيل', '$AC = BD = 8$', '$AC \\neq BD$'].map(M), correct: 0,
                    correction: <MathText>{'$AC = \\sqrt{16 + 16} = \\sqrt{32} = 4\\sqrt{2}$ و $BD = \\sqrt{16 + 16} = 4\\sqrt{2}$ .'}</MathText> },
                  { id: 'n4', label: 'الخلاصة', options: ['ABCD مربّع', 'ABCD مستطيل فقط', 'ABCD معيّن فقط'].map(M), correct: 0,
                    correction: 'متوازي أضلاع، مستطيل (قطران متقايسان) ومعيّن (ضلعان متتاليان متقايسان) معا: مربّع.' },
                ]}
                requires={['tabiat-rubai', 'masafa-maalam', 'murakkibat-shuaa']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'ثلاثة أدلة كافية: ABCD مربّع.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={mark(3)} />
            </div>
          ) },
        { num: 4, title: 'دوري الآن (2)', subtitle: 'O على الدائرة', done: !!q[4],
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" title="دوري الآن" text={NOW145.item2.text} source={NOW145.item2.source} compact>
                <GeoFigure {...FIG_NOW145_2} />
              </TextbookBox>
              <PairQuestion
                prompt={<MathText>{'إحداثيتا I مركز الدائرة التي قطرها [AB]:'}</MathText>}
                expected={{ x: '-1', y: '-1' }} requires={['muntasaf-maalam', 'intima-daira']}
                explain="مركز الدائرة التي قطرها [AB] هو منتصف [AB]: $\left(\dfrac{-2 + 0}{2}\,;\,\dfrac{0 - 2}{2}\right) = (-1\,;\,-1)$ ."
                onAnswered={mark('4a')} />
              {q['4a'] && (
                <TapQuestion
                  prompt={<MathText>{'النقطة O تنتمي إلى هذه الدائرة لأن:'}</MathText>}
                  options={[
                    '$OI = \\sqrt{2}$ ونصف القطر $IA = \\sqrt{2}$',
                    '$OI = \\sqrt{2}$ و $AB = 2\\sqrt{2}$ ، فهي لا تنتمي إليها',
                    '$OA = OB = 2$ ، فـ O مركز الدائرة',
                    'O على محور الفواصل',
                  ].map(M)}
                  correct={0} cols={1} requires={['intima-daira', 'masafa-maalam']}
                  explain={<MathText>{'$OI = \\sqrt{(-1)^2 + (-1)^2} = \\sqrt{2}$ و $IA = \\sqrt{(-2 + 1)^2 + (0 + 1)^2} = \\sqrt{2}$ : بعد O عن المركز يساوي نصف القطر (نقارن بنصف القطر لا بالقطر AB). و O ليست المركز: المركز I.'}</MathText>}
                  onAnswered={mark(4)} />
              )}
              {q[4] && <GeoFigure {...FIG_NOW145_2_DONE} />}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />} />
  );
}
