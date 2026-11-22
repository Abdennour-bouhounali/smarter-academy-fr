import { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../lessons/common/kit';
import { Feedback } from '../../lessons/common/components/LessonUI';
import { KnowledgeSnapshot } from '../../lessons/common/knowledge';
import MathText from '../../lessons/common/components/MathText';
import CoordPlane from '../../lessons/common/components/CoordPlane';
import NumberLine from '../../lessons/common/components/NumberLine';
import { FIXTURE_CTX, getFixtureNavLinks } from './fixture.config';

/**
 * Les trois modules de la SURFACE DE QA.
 *
 * Ils montent les VRAIS composants du moteur (ContentModule, ModuleLayout via
 * lui, les questions du kit, MathText, CoordPlane, NumberLine, la carte des
 * connaissances) avec du texte arabe — c'est le seul moyen de regarder ce que
 * le moteur fait sous RTL tant qu'aucune leçon 4AM n'existe.
 *
 * Le contenu mathématique est une ILLUSTRATION technique, choisie pour
 * exercer le rendu : une fraction, une équation, une droite, une graduation.
 * Rien ici ne relève du programme (voir fixture.config.js).
 */

/* ── Module 1 — texte arabe et mathématiques ────────────────────────────── */
export function FixtureModule01() {
  const [tapDone, setTapDone] = useState(false);
  const [numDone, setNumDone] = useState(false);

  return (
    <ContentModule
      ctx={FIXTURE_CTX}
      navLinks={getFixtureNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نص ورياضيات"
      moduleSubtitle="التحقق من اتجاه النص والتعابير الرياضية"
      estimatedTime="3 دقائق"
      brief={{
        tag: 'اختبار تقني',
        title: 'العربية من اليمين، الرياضيات من اليسار',
        tone: 'indigo',
        body: (
          <p>
            هذه الصفحة تتحقّق من أن النص العربي يُقرأ من اليمين إلى اليسار،
            بينما يبقى التعبير <MathText>{' $2x - 7 = 11$'}</MathText> بالاتجاه
            الطبيعي للرياضيات.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'تعبير داخل الجملة',
          subtitle: 'موضع التعبير واتجاهه',
          done: tapDone,
          content: (
            <div className="space-y-4">
              <KnowledgeBrick id="qa-inline-math" />
              <p>
                إذا كان <MathText>{'$x = 4$'}</MathText> فإنّ قيمة
                <MathText>{' $3x + 5$'}</MathText> تساوي:
              </p>
              <TapQuestion
                options={['12', '17', '20', '9']}
                correct={1}
                cols={4}
                explain={<span>نعوّض: <MathText>{'$3 \\times 4 + 5 = 17$'}</MathText>.</span>}
                onAnswered={(ok) => ok && setTapDone(true)}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'تعبير كتلي',
          subtitle: 'الكسور والجذور والأسس',
          done: numDone,
          content: (
            <div className="space-y-4">
              <KnowledgeBrick id="qa-block-math" />
              <MathText>{'$$\\sqrt{49} + \\frac{3}{4} \\times 8$$'}</MathText>
              <NumericQuestion
                prompt={<span>احسب قيمة التعبير أعلاه:</span>}
                expected={13}
                explain={<span><MathText>{'$7 + 6 = 13$'}</MathText></span>}
                onAnswered={(ok) => ok && setNumDone(true)}
              />
              <Feedback tone="info">
                التحقق البصري: الكسر والجذر لا ينقلبان، والفقرة العربية تبقى من
                اليمين.
              </Feedback>
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}

/* ── Module 2 — figures ─────────────────────────────────────────────────── */
export function FixtureModule02() {
  const [seen, setSeen] = useState(false);

  return (
    <ContentModule
      ctx={FIXTURE_CTX}
      navLinks={getFixtureNavLinks(2)}
      moduleNumber={2}
      moduleTitle="رسوم وجداول"
      moduleSubtitle="المعلم والمستقيم المدرّج داخل صفحة عربية"
      estimatedTime="3 دقائق"
      brief={{
        tag: 'اختبار تقني',
        title: 'المحاور لا تُعكس',
        tone: 'emerald',
        body: (
          <p>
            محور الفواصل يتزايد نحو اليمين، حتى داخل صفحة تُقرأ من اليمين إلى
            اليسار. عكسه سيجعل الرياضيات خاطئة.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'معلم في المستوي',
          subtitle: 'التحقق من التسميات والتدرّج',
          done: seen,
          content: (
            <div className="space-y-4">
              <KnowledgeBrick id="qa-figures" />
              {/* `segments` attend des COORDONNÉES (`from`/`to` sont des
                  points {x, y}), pas des identifiants : passer 'A' produisait
                  x1=NaN et le segment ne se dessinait pas. Constaté par la QA
                  navigateur — c'est précisément le genre de défaut muet que
                  cette surface existe pour rendre visible. */}
              <CoordPlane
                range={{ xMin: -4, xMax: 4, yMin: -4, yMax: 4 }}
                points={[
                  { id: 'A', x: 2, y: 3, label: 'A', color: '#4f46e5' },
                  { id: 'B', x: -3, y: -1, label: 'B', color: '#059669' },
                ]}
                segments={[{ id: 'AB', from: { x: 2, y: 3 }, to: { x: -3, y: -1 }, color: '#94a3b8' }]}
                ariaLabel="معلم في المستوي للتحقق التقني"
              />
              <NumberLine min={-5} max={5} step={1} labelEvery={1} />
              <button
                type="button"
                onClick={() => setSeen(true)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                تمّ التحقق بصريًا
              </button>
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}

/* ── Module 3 — questions, tolérance à l'erreur, fin de module ──────────── */
export function FixtureModule03() {
  const [done, setDone] = useState(false);

  return (
    <ContentModule
      ctx={FIXTURE_CTX}
      navLinks={getFixtureNavLinks(3)}
      moduleNumber={3}
      moduleTitle="أسئلة وتقدّم"
      moduleSubtitle="التغذية الراجعة وشريط التقدّم"
      estimatedTime="3 دقائق"
      brief={{
        tag: 'اختبار تقني',
        title: 'الخطأ لا يوقف التقدّم',
        tone: 'amber',
        body: <p>إجابة خاطئة تُظهر التصحيح ولا تمنع المتابعة.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'سؤال بخيارات',
          done,
          content: (
            <div className="space-y-4">
              <KnowledgeBrick id="qa-progress" />
              <TapQuestion
                prompt={<span>أيّ عدد هو حلّ المعادلة <MathText>{'$x + 9 = 15$'}</MathText> ؟</span>}
                options={['4', '6', '24', '-6']}
                correct={1}
                cols={4}
                explain={<span><MathText>{'$15 - 9 = 6$'}</MathText></span>}
                onAnswered={(ok) => ok && setDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
