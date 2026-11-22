import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox, SourceTag, MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE, METHOD, CONSTANT_NOTE, MISTAKES } from '../content/textbook';

/**
 * Module 3 — معارف (FORMALIZE). Le manuel fourni n'a pas de معارف pour cette unité : tout ce module est
 * ÉCRIT PAR LA PLATEFORME (`knowledge_formalization`, SourceTag « إضافة »), dans les mots du manuel.
 *   1. la définition et la notation (brique taarif-taalufiya) ;
 *   2. صورة عدد (sura-taalufiya) et l'erreur « sans b » expliquée ;
 *   3. العدد الذي صورته معلومة : la méthode révélée ligne à ligne (MethodSteps, la cible 37775 du
 *      compteur), la brique sabiq-taalufiya, l'ordre inverse ;
 *   4. les deux cas particuliers rappelés, et la condition a ≠ 0 (une fonction constante).
 * RÉTROFIT 2026-10-15 : chaque étape s'OUVRE sur sa question (a et b de 6 − x ; h(−2) ; l'ordre inverse de 3x + 6 ; 5 sans antécédent
 * de 2) ; l'encadré, les briques et la méthode viennent APRÈS la réponse. Pas de lab ici (le compteur est au module 1).
 * Les questions utilisent d'AUTRES nombres que les encadrés. LP : P1, P2, P3.
 * « أتوقّع القاعدة » : taarif-taalufiya n'est pas prédite (`predict: false` : le nom vient du module 1, le
 * reste est notation) ; la méthode résolue de l'étape 3 est enveloppée dans <PredictRule id="sabiq-taalufiya">.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3a, setQ3a] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="معارف — الدالة التآلفية"
      moduleSubtitle="التعريف، صورة عدد، العدد الذي صورته معلومة، الحالتان الخاصتان"
      estimatedTime="8 دقائق"
      objectives={[
        'كيف نعرّف الدالة التآلفية ونرمز لها؟',
        'كيف نحسب صورة عدد؟',
        'كيف نجد العدد الذي صورته معلومة؟',
        'ماذا يتغيّر حين يكون أحد المعاملين معدومًا؟',
      ]}
      brief={{
        tag: 'معارف — صياغة من المنصّة', title: KNOWLEDGE.definition.title, tone: 'indigo',
        body: <p>الكتاب المتوفّر لهذه الوحدة يقدّم الأنشطة فقط. هذه المعارف كتبتها المنصّة بمصطلحات الكتاب، لتجمع ما اكتشفته في النشاطين.</p>,
        footer: <SourceTag source={KNOWLEDGE.definition.source} />,
      }}
      steps={[
        {
          num: 1, title: 'التعريف والترميز', subtitle: 'الدالة التآلفية', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'المعاملان $a$ و $b$ للدالة التآلفية $f : x \\longmapsto 6 - x$ هما:'}</MathText>}
                options={['$a = -1$ ، $b = 6$', '$a = 6$ ، $b = -1$', '$a = 1$ ، $b = 6$', '$a = -1$ ، $b = -6$'].map(M)}
                correct={0}
                cols={2}
                requires={['muamilan']}
                explain={<MathText>{'$6 - x = (-1) \\times x + 6$ : المعامل المضروب في $x$ هو $-1$ (الإشارة معه)، والحدّ الثابت 6.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && (
                <>
                  <TextbookBox kind="definition" title={KNOWLEDGE.definition.title} lines={KNOWLEDGE.definition.lines} source={KNOWLEDGE.definition.source} compact />
                  <TextbookBox kind="example" lines={KNOWLEDGE.definition.examples} source={KNOWLEDGE.definition.source} compact />
                  <KnowledgeBrick id="taarif-taalufiya" lead="ما فعله العدّاد وما ميّزته في النشاط 2، معرَّفًا:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'صورة عدد', subtitle: 'كيف نحسب الصورة؟', done: q2,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'$h$ الدالة التآلفية $h(x) = 5x - 3$ : $h(-2) =$'}</MathText>}
                expected={-13}
                parse={parseDec}
                display="-13"
                requires={['taawid-qima']}
                explain={<MathText>{'$h(-2) = 5 \\times (-2) - 3 = -10 - 3 = -13$.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="sura-taalufiya" lead="كما بنى العدّاد كل قراءة: الجزء المتغير ثم الجزء الثابت." />}
              {q2 && (
                <div className="space-y-1 rounded-xl border-2 border-rose-200 bg-rose-50/60 px-3 py-2 text-sm" data-common-mistake="nisyan-b">
                  <p className="font-bold text-rose-900">خطأ شائع</p>
                  <p><span className="font-bold">✗ </span><MathText>{MISTAKES.b.wrong}</MathText></p>
                  <p><span className="font-bold">؟ </span><MathText>{MISTAKES.b.why}</MathText></p>
                  <p><span className="font-bold">✓ </span><MathText>{MISTAKES.b.right}</MathText></p>
                </div>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'العدد الذي صورته معلومة', subtitle: 'كيف نعود من الصورة إلى العدد؟', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'لتعيين العدد الذي صورته $m$ بالدالة $x \\longmapsto 3x + 6$ ، نعكس ما يفعله العدّاد:'}</MathText>}
                options={['نطرح 6 من $m$ ثم نقسم على 3', 'نقسم $m$ على 3 ثم نطرح 6', 'نقسم $m$ على 3 ثم نضيف 6'].map(M)}
                correct={0}
                cols={1}
                requires={['hal-muadala-ula']}
                explain={<MathText>{'$3x + 6 = m$ معناه $3x = m - 6$ ، ثم $x = (m - 6) \\div 3$. مثلا $m = 15$ : $x = 3$ ، و $3 \\times 3 + 6 = 15$ ؛ أما «نقسم ثم نطرح» فيعطي $15 \\div 3 - 6 = -1$ ، و $3 \\times (-1) + 6 = 3 \\neq 15$.'}</MathText>}
                onAnswered={() => setQ3a(true)}
              />
              {q3a && (
                <>
                  {/* La méthode résolue (37775 → 15) dit la règle avant sa brique : l'élève l'écrit d'abord. */}
                  <PredictRule id="sabiq-taalufiya">
                    <MethodSteps method={METHOD} />
                  </PredictRule>
                  <KnowledgeBrick id="sabiq-taalufiya" lead="ما فعلته حين حرّكت الساعات حتى بلغ العدّاد 37775:" />
                  <p className="text-xs text-slate-600"><MathText>{METHOD.program}</MathText></p>
                  <NumericQuestion
                    prompt={<MathText>{'$k$ الدالة التآلفية $k(x) = -2x + 7$ . العدد الذي صورته $15$ هو:'}</MathText>}
                    expected={-4}
                    parse={parseDec}
                    display="-4"
                    requires={['sabiq-taalufiya']}
                    explain={<MathText>{'$-2x + 7 = 15$ ، إذن $-2x = 15 - 7 = 8$ ، ومنه $x = 8 \\div (-2) = -4$. للتحقق: $-2 \\times (-4) + 7 = 15$.'}</MathText>}
                    onAnswered={() => setQ3(true)}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'الحالتان الخاصتان', subtitle: 'حين يكون أحد المعاملين معدومًا', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'$g$ الدالة الثابتة $g(x) = 5$ . العدد الذي صورته 2 بالدالة $g$ :'}</MathText>}
                options={['لا يوجد: صورة كل عدد هي 5', '$x = -3$', '$x = \\dfrac{2}{5}$'].map(M)}
                correct={0}
                cols={1}
                requires={['thabita', 'sabiq-taalufiya']}
                explain={<MathText>{'$g(-3) = 5$ و $g\\left(\\dfrac{2}{5}\\right) = 5$ : لا يعطي أيّ عدد الصورة 2. هنا $a = 0$ ، فلا نستطيع القسمة على $a$ .'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && (
                <>
                  <TextbookBox kind="remark" title={KNOWLEDGE.special.title} lines={[KNOWLEDGE.special.linear, KNOWLEDGE.special.constant]} source={KNOWLEDGE.special.source} compact />
                  <KnowledgeBrick id="khattiya-taalufiya" variant="rappel" compact />
                  <KnowledgeBrick id="thabita" variant="rappel" compact />
                  <p className="text-xs text-slate-600"><MathText>{CONSTANT_NOTE.text}</MathText> <SourceTag source={CONSTANT_NOTE.source} /></p>
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
