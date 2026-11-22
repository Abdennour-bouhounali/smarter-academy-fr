import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { SourceTag, TextbookBox, PairQuestion } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { CHALLENGE, CHALLENGE_LINES, KNOW_MID, KNOW_LINES, PLATFORM_SOURCE } from '../content/textbook';
import { FIG_CHALLENGE, FIG_KNOW_DIST } from '../content/figures';

/**
 * Module 3 — معارف د و هـ (p. 144) « إحداثيتا منتصف قطعة مستقيم » et « المسافة بين نقطتين ».
 * FORMALIZE : la brique ihdathiyata-muntasaf (propriété + exemple du manuel) puis un milieu de la plateforme à saisir
 * (PairQuestion, fractions acceptées) ; la brique masafa (propriété + exemple + « القيمة المضبوطة ») et une distance à
 * simplifier ; TRANSFER : le تحدّ de la page d'unité, enfin résolu (√365 / 3) — les fractions n'empêchent rien.
 * LP : P1, P2.
 * « أتوقّع القاعدة » : les deux briques sont prédites (predictPrompt dans knowledge.jsx) ; le brief ne les énonce plus.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="معارف — المنتصف والمسافة"
      moduleSubtitle="القانونان بكلمات الكتاب، ثم التحدّ محلولا"
      objectives={['كيف يصوغ الكتاب ما اكتشفته عن المنتصف والمسافة؟', 'هل أستطيع الآن حلّ التحدّي بقيمته المضبوطة؟']} estimatedTime="8 دقائق"
      brief={{
        tag: 'معارف — الكتاب ص 144', title: 'إحداثيتا المنتصف والمسافة بين نقطتين', tone: 'emerald',
        body: <p>دبّوس اللقاء ودرج الشوارع صارا خاصيتين في الكتاب. قبل أن تقرأ كلّ واحدة منهما، اكتبها بكلماتك.</p>,
        footer: <SourceTag source={KNOW_MID.source} />,
      }}
      steps={[
        {
          num: 1, title: 'إحداثيتا منتصف قطعة', subtitle: 'معارف د)', done: q1,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="example" text={'على خريطة المنصّة: $A(-1\\,;\\,4)$ و $B(6\\,;\\,-3)$ . أوجد إحداثيتي I منتصف [AB].'} source={PLATFORM_SOURCE} compact />
              <PairQuestion
                prompt="إحداثيتا I (يمكنك كتابة كسر مثل 5/2 أو عدد عشري مثل 2,5):"
                expected={{ x: '5/2', y: '1/2' }}
                explain={<MathText>{'$x_I = \\dfrac{-1 + 6}{2} = \\dfrac{5}{2}$ و $y_I = \\dfrac{4 + (-3)}{2} = \\dfrac{1}{2}$ : $I\\left(\\dfrac{5}{2}\\,;\\,\\dfrac{1}{2}\\right)$ — المنتصف لا يقع دائما على عقدة.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="ihdathiyata-muntasaf" lead="ما كتبته في النشاط 3، بكلمات الكتاب:" />}
              {q1 && <p className="text-xs text-slate-600"><MathText>{KNOW_LINES.midTrap}</MathText></p>}
            </div>
          ),
        },
        {
          num: 2, title: 'المسافة بين نقطتين', subtitle: 'معارف هـ)', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'$C(-2\\,;\\,1)$ و $D(4\\,;\\,-1)$ في معلم متعامد ومتجانس. القيمة المضبوطة للمسافة CD هي:'}</MathText>}
                options={[
                  '$2\\sqrt{10}$',
                  '$8$', // 6 + 2 : la marche dans les rues
                  '$40$', // CD² : la racine oubliée
                ].map(M)}
                correct={0}
                cols={3}
                requires={['judhur-tabsit']}
                explain={<MathText>{'$CD = \\sqrt{(4 - (-2))^2 + (-1 - 1)^2} = \\sqrt{36 + 4} = \\sqrt{40} = \\sqrt{4 \\times 10} = 2\\sqrt{10}$ . ($8 = 6 + 2$ مسافة السير، و $40$ هو $CD^2$ .)'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="masafa" lead="ما كتبته في النشاط 4، بكلمات الكتاب:" />}
              {q2 && <GeoFigure {...FIG_KNOW_DIST} />}
              {q2 && <p className="text-xs text-slate-600"><MathText>{KNOW_LINES.distTrap}</MathText></p>}
            </div>
          ),
        },
        {
          num: 3, title: 'عودة إلى التحدّ', subtitle: 'تحدّ — الكتاب ص 139', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={CHALLENGE.text} source={CHALLENGE.source} compact />
              <GeoFigure {...FIG_CHALLENGE} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">احسب خطوة خطوة:</p>}
                rows={[
                  { id: 'dx', label: <MathText>{'$x_B - x_A$ و $y_B - y_A$'}</MathText>, options: ['$-\\dfrac{14}{3}$ و $\\dfrac{13}{3}$', '$-\\dfrac{10}{3}$ و $\\dfrac{1}{3}$', '$\\dfrac{14}{3}$ و $-\\dfrac{13}{3}$'].map(M), correct: 0, correction: <MathText>{CHALLENGE_LINES.components}</MathText> },
                  { id: 'sq', label: <MathText>{'$AB^2$'}</MathText>, options: ['$\\dfrac{365}{9}$', '$\\dfrac{365}{3}$', '$\\dfrac{1}{9}$'].map(M), correct: 0, correction: <MathText>{CHALLENGE_LINES.square}</MathText> },
                  { id: 'ab', label: 'القيمة المضبوطة لـ AB', options: ['$\\dfrac{\\sqrt{365}}{3}\\,\\mathrm{cm}$', '$6{,}4\\,\\mathrm{cm}$', '$\\dfrac{365}{9}\\,\\mathrm{cm}$'].map(M), correct: 0, correction: <MathText>{CHALLENGE_LINES.exact}</MathText> },
                ]}
                requires={['masafa']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: القانون يعطي القيمة المضبوطة حيث لا تعطي المسطرة إلا قيمة تقريبية.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
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
