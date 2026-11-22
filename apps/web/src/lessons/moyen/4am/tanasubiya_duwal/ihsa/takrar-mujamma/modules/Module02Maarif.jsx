import { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY2, KNOWLEDGE, PROPERTY } from '../content/textbook';
import { addition } from '../../_unit/unitMeta';
import FreqTable from '../components/FreqTable';

/**
 * Module 2 — معارف 1 et 2 (p. 94) et نشاط 2 (p. 92).
 *   1. UNDERSTAND : معارف 1 — la définition (brique takrar-mujamma) et l'exemple des 20 notes, puis une série
 *      de la plateforme (les pointures) : la somme des effectifs, sans personnes ;
 *   2. TOUCH THE MATH : نشاط 2 — les 30 notes, le cumul ÷ 30, des fractions dans le tableau du manuel ;
 *   3. FORMALIZE : معارف 2 — l'التواتر المجمع (brique tawatur-mujamma) et la note « التواتر » ;
 *   4. ce que disent les deux bouts du tableau (brique khasiyat-mujamma, plateforme déclarée) — l'invariant
 *      que la toise a fait toucher (up + down = N + f).
 * Les questions utilisent d'AUTRES nombres que les encadrés (la réponse n'est jamais au-dessus).
 * LP : P1 (1), P2 (2, 3), P3 (4).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const fr = (n) => `$\\dfrac{${n}}{30}$`;

export default function Module02Maarif() {
  const [q1a, setQ1a] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4a, setQ4a] = useState(false);
  const [q4, setQ4] = useState(false);
  const t = KNOWLEDGE.cumul.table;
  const r = KNOWLEDGE.relative.table;

  return (
    <ContentModule
      objectives={["كيف أكتب بتعريف ما عددته عند البوابة؟", "كيف أنتقل من التكرار المجمع إلى التواتر المجمع؟", "ماذا يساوي الصاعد لأكبر قيمة؟ وماذا يربط الصاعد والنازل لقيمة؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — التكرار والتواتر المجمعان"
      moduleSubtitle="الصاعد والنازل، ثم القسمة على التكرار الكلي"
      estimatedTime="11 دقيقة"
      brief={{
        tag: 'معارف ص 94 · أنشطة ص 92', title: KNOWLEDGE.cumul.title, tone: 'violet',
        body: <p>عند البوابة عددت التلاميذ المضائين. الكتاب يكتب ذلك تعريفًا بالتكرارات، ثم يقسم على التكرار الكلي.</p>,
      }}
      steps={[
        {
          num: 1, title: 'التكرار المجمع', subtitle: 'معارف 1', done: q1,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="mujamma-nashat" variant="rappel" compact />
              <PredictRule id="takrar-mujamma"><TextbookBox kind="definition" title={KNOWLEDGE.cumul.title} lines={[KNOWLEDGE.cumul.up, KNOWLEDGE.cumul.down]} source={KNOWLEDGE.cumul.source} compact /></PredictRule>
              <KnowledgeBrick id="takrar-mujamma" lead="ما فعلته عند البوابة، بكلمات الكتاب:" />
              <TextbookBox kind="example" lines={[KNOWLEDGE.cumul.example, ...KNOWLEDGE.cumul.exampleLines]} source={KNOWLEDGE.cumul.source} compact />
              <FreqTable head="العلامة" values={t.values} rows={[
                { label: 'التكرار', cells: t.freqs },
                { label: 'التكرار المجمع الصاعد', cells: t.up },
                { label: 'التكرار المجمع النازل', cells: t.down },
              ]} />
              <p className="text-sm font-semibold text-slate-800">مقاسات أحذية فريق الحيّ، وهو يتبرّع بأحذية قديمة للمحتاجين: المقاس 38 (4 لاعبين)، 39 (7)، 40 (9)، 41 (5)، 42 (2). <SourceTag source={addition('interaction_generation')} /></p>
              <NumericQuestion
                prompt="التكرار المجمع الصاعد للمقاس 40:"
                expected={20}
                display="20"
                requires={['takrar-mujamma']}
                explain={<MathText>{'$4 + 7 + 9 = 20$ : تكرار 40 وتكرارات المقاسات الأصغر منه.'}</MathText>}
                explainFor={(n) => <MathText>{n === 11 ? 'نسيت تكرار 40 نفسه: $4 + 7 + 9 = 20$.' : '$4 + 7 + 9 = 20$ : تكرار 40 وتكرارات المقاسات الأصغر منه.'}</MathText>}
                onAnswered={() => setQ1a(true)}
              />
              {q1a && (
                <NumericQuestion
                  prompt="التكرار المجمع النازل للمقاس 40:"
                  expected={16}
                  display="16"
                  requires={['takrar-mujamma']}
                  explain={<MathText>{'$9 + 5 + 2 = 16$ : تكرار 40 وتكرارات المقاسات الأكبر منه.'}</MathText>}
                  onAnswered={() => setQ1(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'التكرار النسبي المجمع', subtitle: 'نشاط 2', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" title={`نشاط 2: ${ACTIVITY2.title}`} lines={[ACTIVITY2.text, ACTIVITY2.namingUp, ACTIVITY2.namingDown, ACTIVITY2.instruction]} source={ACTIVITY2.source} compact />
              <FreqTable head="العلامة $n$" values={ACTIVITY2.values} rows={[
                { label: 'عدد التلاميذ', cells: ACTIVITY2.freqs.map(String) },
                { label: 'أصغر من أو تساوي $n$', cells: ACTIVITY2.tableUp },
                { label: 'أكبر من أو تساوي $n$', cells: ACTIVITY2.tableDown },
              ]} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">أتمم بعض الخانات «…»:</p>}
                rows={[
                  { id: 'u10', label: <MathText>{'أصغر من أو تساوي $10$'}</MathText>, options: [fr(10), fr(7), fr(27)].map(M), correct: 0, correction: <MathText>{'$\\dfrac{3 + 7}{30} = \\dfrac{10}{30}$'}</MathText> },
                  { id: 'u13', label: <MathText>{'أصغر من أو تساوي $13$'}</MathText>, options: [fr(5), fr(23), fr(12)].map(M), correct: 1, correction: <MathText>{'$\\dfrac{18 + 5}{30} = \\dfrac{23}{30}$'}</MathText> },
                  { id: 'd10', label: <MathText>{'أكبر من أو تساوي $10$'}</MathText>, options: [fr(20), fr(10), fr(27)].map(M), correct: 2, correction: <MathText>{'$\\dfrac{30 - 3}{30} = \\dfrac{27}{30}$ : الجميع ما عدا أصحاب العلامة 9 (و $\\dfrac{20}{30}$ نسي تكرار 10 نفسه).'}</MathText> },
                  { id: 'd13', label: <MathText>{'أكبر من أو تساوي $13$'}</MathText>, options: [fr(12), fr(7), fr(23)].map(M), correct: 0, correction: <MathText>{'$\\dfrac{5 + 4 + 2 + 1}{30} = \\dfrac{12}{30}$'}</MathText> },
                ]}
                requires={['takrar-mujamma', 'tawatur-nisbi']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: نجمع التكرارات، ثم نقسم على 30.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'التواتر المجمع', subtitle: 'معارف 2', done: q3,
          content: (
            <div className="space-y-3">
              <PredictRule id="tawatur-mujamma" prompt={"في النشاط 2 أتممت خانات «أصغر من أو تساوي $n$» بكسور مقامها 30. بكلماتك: كيف نحسب التكرار النسبي المجمّع الصاعد لقيمة؟ وكيف نحسب النازل؟"}><TextbookBox kind="definition" title={KNOWLEDGE.relative.title} lines={[KNOWLEDGE.relative.up, KNOWLEDGE.relative.down]} source={KNOWLEDGE.relative.source} compact /></PredictRule>
              <TextbookBox kind="example" text={KNOWLEDGE.relative.example} source={KNOWLEDGE.relative.source} compact />
              <FreqTable head="العلامة" values={r.values} rows={[
                { label: 'التكرار', cells: r.freqs },
                { label: 'التكرار النسبي', cells: r.rel },
                { label: 'التكرار النسبي المجمع الصاعد', cells: r.up },
                { label: 'التكرار النسبي المجمع النازل', cells: r.down },
              ]} />
              <p className="rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-900"><MathText>{KNOWLEDGE.relative.note}</MathText></p>
              <KnowledgeBrick id="tawatur-mujamma" lead="ما فعلته في نشاط 2، بكلمات الكتاب:" />
              <TapQuestion
                prompt="في نشاط 2، التواتر المجمع الصاعد للعلامة 12 مكتوبا عددا عشريا هو:"
                options={['$0{,}6$', '$0{,}18$', '$18$', '$0{,}27$'].map(M)}
                correct={0}
                cols={4}
                requires={['tawatur-mujamma']}
                explain={<MathText>{'$\\dfrac{18}{30} = 0{,}6$ . ($18$ هو التكرار المجمع غير مقسوم، و $0{,}18$ يقسم على 100 بدل 30.)'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'طرفا الجدول', subtitle: 'ما نقرؤه في الجدول', done: q4,
          content: (
            <div className="space-y-3">
              <PredictRule id="khasiyat-mujamma" prompt={"انظر إلى جدول التكرارات المجمّعة الذي أتممته: ماذا يساوي الصاعد لأكبر قيمة والنازل لأصغر قيمة؟ ومن أجل قيمة $t$، بماذا يساوي مجموع الصاعد والنازل لها؟ (فكّر: كم مرّة عُدّت القيمة $t$؟)"}><TextbookBox kind="property" title={PROPERTY.title} lines={PROPERTY.lines} source={PROPERTY.source} compact /></PredictRule>
              <KnowledgeBrick id="khasiyat-mujamma" lead="ما رأيته عند البوابة حين عددت القيمة نفسها من الجهتين:" />
              <TapQuestion
                prompt="في سلسلة تكرارها الكلي 40، التواتر المجمع الصاعد لأكبر قيمة هو:"
                options={['$1$', '$40$', '$\\dfrac{1}{40}$', '$0$'].map(M)}
                correct={0}
                cols={4}
                requires={['khasiyat-mujamma']}
                explain={<MathText>{'الصاعد لأكبر قيمة يضمّ القيم كلها: $\\dfrac{40}{40} = 1$ . ($40$ هو التكرار المجمع الصاعد غير مقسوم.)'}</MathText>}
                onAnswered={() => setQ4a(true)}
              />
              {q4a && (
                <NumericQuestion
                  prompt="في نشاط 2: تكرار العلامة 12 هو 8 والتكرار المجمع الصاعد لها 18 (من 30). احسب دون الجدول التكرار المجمع النازل للعلامة 12:"
                  expected={20}
                  display="20"
                  requires={['khasiyat-mujamma']}
                  explain={<MathText>{'الصاعد + النازل = التكرار الكلي + تكرار 12: $18 + 20 = 30 + 8$ ، إذن النازل $20$ (أي $\\dfrac{20}{30}$).'}</MathText>}
                  explainFor={(n) => <MathText>{n === 12 ? '$30 - 18 = 12$ ينسى أن العلامة 12 تُعدّ في الجهتين: $18 + 20 = 30 + 8$ ، النازل $20$.' : 'الصاعد + النازل = التكرار الكلي + تكرار 12: $18 + 20 = 30 + 8$ ، إذن النازل $20$.'}</MathText>}
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
