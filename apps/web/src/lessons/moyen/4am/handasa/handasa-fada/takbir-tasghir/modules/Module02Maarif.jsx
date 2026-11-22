import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import SpaceFigure from '../../../../../../common/components/SpaceFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { SourceTag, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACT5, KNOW, EXAMPLE_BALL, KNOWLEDGE_SOURCE } from '../content/textbook';
import { FIG_ACT5, FIG_KNOW_CONE } from '../content/figures';

/**
 * Module 2 — معارف (DÉCLARÉES : la page du manuel manque, extraction › discrepancies › act-6 missing_page).
 * FORMALIZE : 1) la définition (k, تكبير / تصغير, la forme gardée — brique takbir-tarif) et le contraste « + 1 cm » du lab ;
 * 2) la propriété k / k² / k³ (brique takbir-khassiya), l'exemple de la balle de handball (aire et volume recalculés deux fois) ;
 * 3) le نشاط 5 en DOUBLON déclaré (la section EFGH d'une pyramide, F, G, H définis par l'extraction) → la section d'une
 * pyramide ou d'un cône est une réduction (brique maqta-tasghir), le cône de la plateforme. LP : P1.
 * Rétrofit 2026-10-15 (§4quater) : question d'abord, brique (et exemple de la balle) APRÈS la réponse ; la carte du haut dit ce qu'est le module.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  return (
    <ContentModule
      objectives={["متى نقول إنّ مجسّما تكبير لآخر؟", "كيف نعبّر عن الأطوال والمساحات والحجوم بدلالة $k$ ؟", "ماذا يحدث لهرم يقطعه مستو يوازي قاعدته؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — التكبير والتصغير"
      moduleSubtitle="ما رأيته بالمكعبات، مكتوبا كمعرفة"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف من المنصّة', title: KNOW.title, tone: 'violet',
        body: <p>صفحة المعارف الخاصة بالتكبير والتصغير غير موجودة في النسخة المتوفّرة من الكتاب: كتبتها المنصّة بلغة الكتاب، انطلاقا من النشاطين 5 و 6.</p>,
        footer: <SourceTag source={KNOWLEDGE_SOURCE} />,
      }}
      steps={[
        {
          num: 1, title: 'التكبير والتصغير بالنسبة k', subtitle: 'تعريف', done: q1,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">لكل مجسّم ناتج، هل هو تكبير أم تصغير للمجسّم الأصلي؟</p>}
                rows={[
                  { id: 'a', label: <MathText>{'$k = \\dfrac{3}{2}$'}</MathText>, options: ['تكبير', 'تصغير', 'ليس تكبيرا ولا تصغيرا'], correct: 0, correction: <MathText>{'$\\dfrac{3}{2} > 1$ : تكبير.'}</MathText> },
                  // 0,8 < 1 : une réduction même si le nombre « ressemble » à un entier (MISC-TAKBIR-ITTIJAH)
                  { id: 'b', label: <MathText>{'$k = 0{,}8$'}</MathText>, options: ['تكبير', 'تصغير', 'ليس تكبيرا ولا تصغيرا'], correct: 1, correction: <MathText>{'$0 < 0{,}8 < 1$ : تصغير.'}</MathText> },
                  // + 1 cm à chaque arête d'un pavé non cubique : le contraste du lab
                  { id: 'c', label: <MathText>{'متوازي مستطيلات $2 \\times 3 \\times 6$ صار $3 \\times 4 \\times 7$'}</MathText>, options: ['تكبير', 'تصغير', 'ليس تكبيرا ولا تصغيرا'], correct: 2, correction: <MathText>{'النسب $\\dfrac{3}{2}$ و $\\dfrac{4}{3}$ و $\\dfrac{7}{6}$ مختلفة: إضافة نفس الطول لكل حرف ليست ضربا في نفس العدد، وشكل المجسّم تغيّر.'}</MathText> },
                ]}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: نفس العدد k لكل الأطوال، وموقعه بالنسبة إلى 1 يقرّر.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="takbir-tarif" lead="ما فعلته في لعبة البناء، معرّفا:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'الأطوال والمساحات والحجوم', subtitle: 'خاصية', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'مكعّب حجمه $64\\,\\mathrm{cm}^3$ صُغّر بالنسبة $k = \\dfrac{1}{2}$ . حجم المكعّب الناتج:'}</MathText>}
                options={[
                  '$8\\,\\mathrm{cm}^3$',
                  // × 1/2 (MISC-TAKBIR-HAJM-K)
                  '$32\\,\\mathrm{cm}^3$',
                  // × (1/2)² (MISC-TAKBIR-HAJM-K)
                  '$16\\,\\mathrm{cm}^3$',
                ].map(M)}
                correct={0}
                cols={3}
                explain={<MathText>{'$\\left(\\dfrac{1}{2}\\right)^3 \\times 64 = \\dfrac{64}{8} = 8\\,\\mathrm{cm}^3$ : المكعّب الذي حرفه $4\\,\\mathrm{cm}$ صار حرفه $2\\,\\mathrm{cm}$ .'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="takbir-khassiya" lead="القاعدة التي عدّتها المكعبات:" />}
              {q2 && <TextbookBox kind="example" lines={[EXAMPLE_BALL.text, ...EXAMPLE_BALL.lines]} source={EXAMPLE_BALL.source} compact />}
            </div>
          ),
        },
        {
          num: 3, title: 'نشاط 5: مقطع هرم بمستو', subtitle: 'تصغير للقاعدة', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={`${ACT5.intro} ${ACT5.part1}`} source={ACT5.source} compact />
              <p className="text-xs text-slate-500" data-correction>{ACT5.completion}</p>
              <SpaceFigure {...FIG_ACT5} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">في الهرم SABCD:</p>}
                rows={[
                  // 1 : SA − SE au lieu de SE/SA × AB ; 4 : la base elle-même (MISC-MAQTA-HARAM)
                  { id: 'ef', label: 'EF', options: ['$3\\,\\mathrm{cm}$', '$1\\,\\mathrm{cm}$', '$4\\,\\mathrm{cm}$'].map(M), correct: 0, correction: <MathText>{ACT5.answer1}</MathText> },
                  // 12 : aire × 3/4 (MISC-TAKBIR-MISAHA-K) ; 16 : l'aire de la base
                  { id: 'area', label: 'مساحة المربع EFGH', options: ['$9\\,\\mathrm{cm}^2$', '$12\\,\\mathrm{cm}^2$', '$16\\,\\mathrm{cm}^2$'].map(M), correct: 0, correction: <MathText>{ACT5.reduction}</MathText> },
                ]}
                requires={['takbir-khassiya', 'talis-nisab']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: المقطع تصغير للقاعدة بالنسبة 3/4.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <>
                  <KnowledgeBrick id="maqta-tasghir" lead="ما يحدث في كل هرم وكل مخروط:" />
                  <SpaceFigure {...FIG_KNOW_CONE} />
                </>
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
