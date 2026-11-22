import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { SourceTag, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOW1, PLATFORM_SOURCE } from '../content/textbook';
import { FIG_KNOW1, FIG_KNOW1_EQ, FIG_EQ_PICK } from '../content/figures';

/**
 * Module 2 — معارف 1 (p. 130) « الانسحاب ومفهوم الشعاع ».
 * FORMALIZE : 1) المنحى والاتجاه (brique manha-ittijah), 2) le شعاع par ses trois éléments, sa notation $\overrightarrow{AB}$,
 * مبدأ / نهاية, les مُمثّلات (brique shuaa, la figure aux quatre $\vec{u}$), 3) deux vecteurs égaux (brique tasawi-shuaayn,
 * l'exemple AB = CD). TOUCH THE MATH : un quadrillage de la plateforme où une seule paire de flèches est égale (les
 * autres diffèrent par le اتجاه ou le طول, comme le drone égaré du lab). LP : P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2} objectives={['ما الفرق بين المنحى والاتجاه؟', 'ما عناصر الشعاع وكيف نكتبه؟', 'متى نقول عن شعاعين إنهما متساويان؟']}
      moduleTitle="معارف — الشعاع وتساوي شعاعين"
      moduleSubtitle="ما رأيته في العرض، بكلمات الكتاب"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف — الكتاب ص 130', title: KNOW1.title, tone: 'violet',
        body: <p>في عرض المسيّرات قارنت أسهمًا: بعضها على مستقيمات متوازية، وبعضها يسير في الجهة المعاكسة، وبعضها أطول من غيره. هنا تضع كلمات الكتاب على ما رأيته.</p>,
        footer: <SourceTag source={KNOW1.source} />,
      }}
      steps={[
        {
          num: 1, title: 'المنحى والاتجاه', subtitle: 'معارف 1 — 1)', done: q1,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر لكل سطر:</p>}
                rows={[
                  { id: 'par', label: 'المستقيمان (d) و (d′) متوازيان، إذن', options: ['لهما نفس المنحى', 'لهما نفس الاتجاه', 'لهما نفس الطول'], correct: 0, correction: 'المنحى يخصّ المستقيمات: مستقيمان متوازيان لهما نفس المنحى.' },
                  { id: 'two', label: 'النقطتان المتمايزتان A و B تعيّنان على المستقيم (AB)', options: ['اتجاهين: من A نحو B ومن B نحو A', 'اتجاها واحدا', 'منحيين مختلفين'], correct: 0, correction: KNOW1.manha },
                ]}
                requires={['tawazi-mustaqimat']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: المنحى هو المستقيم، والاتجاه هو جهة السير عليه.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="manha-ittijah" lead="الكلمتان اللتان قرأتهما على أضواء التطبيق:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'الشعاع: منحى واتجاه وطول', subtitle: 'معارف 1 — 2)', done: q2,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_KNOW1} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'على الشكل، الأسهم الأربعة تمثّل الشعاع $\\vec{u}$ :'}</MathText></p>}
                rows={[
                  { id: 'origin', label: <MathText>{'مبدأ الشعاع $\\overrightarrow{AB}$ ونهايته'}</MathText>, options: ['مبدؤه A ونهايته B', 'مبدؤه B ونهايته A'], correct: 0, correction: 'نكتب أولا المبدأ ثم النهاية: $\\overrightarrow{AB}$ يبدأ من A وينتهي عند B.' },
                  // la droite (EF) est seulement PARALLÈLE à (AB) : même منحى quand même — distracteur faux « منحى (BF) »
                  { id: 'manha', label: <MathText>{'منحى الشعاع $\\vec{u}$'}</MathText>, options: ['منحى المستقيم (AB)', 'منحى المستقيم (BF)', 'منحى المستقيم (AE)'], correct: 0, correction: 'منحاه منحى المستقيم (AB)، وهو أيضا منحى (EF) و (CD) و (MN) لأنها توازيه.' },
                  { id: 'tul', label: <MathText>{'طويلة الشعاع $\\vec{u}$'}</MathText>, options: ['طول القطعة [AB]', 'طول المستقيم (AB)', 'المسافة بين A و M'], correct: 0, correction: 'الطويلة طول القطعة [AB] (المستقيم لا طول له).' },
                  { id: 'rep', label: <MathText>{'$\\overrightarrow{CD}$ و $\\overrightarrow{MN}$'}</MathText>, options: ['ممثّلان للشعاع $\\vec{u}$', 'شعاعان مختلفان لأن مبدأيهما مختلفان'].map(M), correct: 0, correction: 'تغيير المبدأ لا يغيّر الشعاع: كلاهما له منحى (AB) والاتجاه نفسه والطول نفسه.' },
                ]}
                requires={['manha-ittijah']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: شعاع واحد وأربعة ممثّلات، كأسهم مسيّراتك.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="shuaa" lead="كل ثنائية من نقطة وصورتها تعرّف الشعاع نفسه:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'تساوي شعاعين', subtitle: 'معارف 1 — 3)', done: q3,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_KNOW1_EQ} />
              <TextbookBox kind="example" text={'على شبكة المنصّة: أي سهم يساوي $\\overrightarrow{AB}$ ؟'} source={PLATFORM_SOURCE} compact />
              <GeoFigure {...FIG_EQ_PICK} />
              <TapQuestion
                prompt={<MathText>{'الشعاع المساوي للشعاع $\\overrightarrow{AB}$ هو:'}</MathText>}
                options={[
                  '$\\overrightarrow{CD}$',
                  '$\\overrightarrow{EF}$', // même منحى، même طول، اتجاه معاكس
                  '$\\overrightarrow{GH}$', // même منحى، même اتجاه، طول double
                ].map(M)}
                correct={0}
                cols={3}
                requires={['shuaa']}
                explain={<MathText>{'$\\overrightarrow{CD} = \\overrightarrow{AB}$ : ثلاثة مربعات يمينا ومربع نحو الأعلى. $\\overrightarrow{EF}$ له نفس المنحى ونفس الطول لكن اتجاهه معاكس، و $\\overrightarrow{GH}$ له نفس المنحى والاتجاه لكن طوله ضعف الطول.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="tasawi-shuaayn" lead="ثلاثة شروط معا، كأضواء التطبيق الثلاثة:" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
