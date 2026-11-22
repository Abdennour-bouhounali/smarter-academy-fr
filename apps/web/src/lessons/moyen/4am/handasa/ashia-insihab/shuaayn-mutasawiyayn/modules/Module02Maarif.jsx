import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOW2_REMINDER, MISTAKES, PLATFORM_SOURCE } from '../content/textbook';
import { FIG_KNOW3 } from '../content/figures';

/**
 * Module 2 — معارف 3 (p. 132) et le متوازي أضلاع par l'égalité de deux vecteurs.
 *   1. UNDERSTAND : معارف 3 (brique muntasaf-shuaa, l'exemple et sa figure), puis le sens réciproque ;
 *   2. TOUCH THE MATH : l'ordre des lettres (AI = IB, jamais AI = BI — MISTAKES.midpoint) ;
 *   3. FORMALIZE : AB = DC ⇔ ABCD متوازي أضلاع ⇔ diagonales de même milieu (rappel du درس 1, déclaré) et les étapes de
 *      la preuve (brique mutawazi-shuaa) ; l'ordre des sommets ;
 *   4. le cas aligné (نشاط 2 ب) : une égalité de vecteurs sans متوازي أضلاع « vrai ».
 * RÉTROFIT 2026-10-15 (§4quater) : chaque question AVANT sa brique / sa boîte — RT = TS d'abord (on vient de le vivre sur le foulard),
 * puis `muntasaf-shuaa` et sa figure ; la remarque du cas aligné après la réponse du cas aligné. L'étape 3 garde « أتوقّع القاعدة ».
 * LP : P1 (1–2), P2 (3–4).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q1a, setQ1a] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3a, setQ3a] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2} objectives={['كيف نكتب «I منتصف [AB]» بالأشعة؟', 'لماذا يغيّر ترتيب الحروف كل شيء؟', 'ما العلاقة بين تساوي شعاعين ومتوازي الأضلاع؟', 'ماذا يبقى صحيحًا إذا كانت النقط على استقامة واحدة؟']}
      moduleTitle="معارف — المنتصف ومتوازي الأضلاع بالأشعة"
      moduleSubtitle="خاصية من الكتاب في الاتجاهين، وترتيب الحروف الذي يغيّر كل شيء"
      estimatedTime="8 دقائق"
      brief={{
        tag: 'معارف — الكتاب ص 132', title: 'الشعاعان المتساويان ومفهوم منتصف قطعة', tone: 'violet',
        body: <p>على الوشاح قارنت الشعاعين في مواضع مختلفة للقائد. الكتاب يكتب ما وجدته خاصية في الاتجاهين، ثم نربطها بمتوازي الأضلاع الذي عرفته في الدرس السابق.</p>,
      }}
      steps={[
        {
          num: 1, title: 'معارف 3', subtitle: 'المنتصف وتساوي شعاعين', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'R، S، T ثلاث نقط حيث $\\overrightarrow{RT} = \\overrightarrow{TS}$ . إذن:'}</MathText>}
                options={['T منتصف [RS]', 'R منتصف [TS]', 'S منتصف [RT]'].map(M)}
                correct={0}
                cols={3}
                explain={<MathText>{'في $\\overrightarrow{RT} = \\overrightarrow{TS}$ النقطة المشتركة T هي نهاية الأول ومبدأ الثاني: T منتصف [RS] (معارف 3).'}</MathText>}
                onAnswered={() => setQ1a(true)}
              />
              {q1a && (
                <>
                  <KnowledgeBrick id="muntasaf-shuaa" lead="معارف 3، كما في الكتاب:" />
                  <GeoFigure {...FIG_KNOW3} />
                </>
              )}
              {q1a && (
                <TapQuestion
                  prompt={<MathText>{'K منتصف القطعة [UV]. أيّ مساواة صحيحة؟'}</MathText>}
                  options={[
                    '$\\overrightarrow{UK} = \\overrightarrow{KV}$',
                    '$\\overrightarrow{UK} = \\overrightarrow{VK}$', // sens contraires : MISC-SHUAA-MUNTASAF-IB-IA
                    '$\\overrightarrow{KU} = \\overrightarrow{KV}$', // sens contraires
                  ].map(M)}
                  correct={0}
                  cols={3}
                  requires={['muntasaf-shuaa']}
                  explain={<MathText>{'$\\overrightarrow{UK}$ و $\\overrightarrow{KV}$ يتجهان كلاهما من U نحو V. أما $\\overrightarrow{VK}$ و $\\overrightarrow{KU}$ فيعاكسان الاتجاه.'}</MathText>}
                  onAnswered={() => setQ1(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'ترتيب الحروف', subtitle: 'خطأ شائع', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{`كتب تلميذ: «${MISTAKES.midpoint.wrong}». ما رأيك؟`}</MathText>}
                options={[
                  MISTAKES.midpoint.why,
                  'صحيح: للشعاعين نفس الطول', // la longueur ne suffit pas
                  'صحيح: المهم أن تظهر I في الشعاعين', // l'ordre des lettres porte le sens
                ].map(M)}
                correct={0}
                cols={1}
                requires={['muntasaf-shuaa']}
                explain={<MathText>{MISTAKES.midpoint.right}</MathText>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'متوازي الأضلاع وقطراه', subtitle: 'تذكير بالدرس 1، وكيف نبرهن', done: q3,
          content: (
            <div className="space-y-3">
              <PredictRule id="mutawazi-shuaa" prompt={"وجدت في النشاط أنّ منتصفًا مشتركًا لقطرين يعطي شعاعين متساويين. إذا كانت $A$، $B$، $C$، $D$ أربع نقط كل ثلاث منها ليست على استقامة و $\\overrightarrow{AB} = \\overrightarrow{DC}$: ماذا تستنتج عن الرباعي $ABCD$ وعن قطريه؟"}><TextbookBox kind="property" text={KNOW2_REMINDER.property} source={KNOW2_REMINDER.source} compact /></PredictRule>
              <KnowledgeBrick id="mutawazi-shuaa" lead="نجمع ما نعرفه في معرفة واحدة نبرهن بها:" />
              <TapQuestion
                prompt="ABCD رباعي قطراه [AC] و [BD] لهما نفس المنتصف. أيّ مساواة صحيحة؟"
                options={[
                  '$\\overrightarrow{AB} = \\overrightarrow{DC}$',
                  '$\\overrightarrow{AB} = \\overrightarrow{CD}$', // l'ordre des sommets : ABDC
                  '$\\overrightarrow{AC} = \\overrightarrow{BD}$', // les diagonales ne sont pas égales
                ].map(M)}
                correct={0}
                cols={3}
                requires={['mutawazi-shuaa']}
                explain={<MathText>{`قطراه متناصفان: ABCD متوازي أضلاع، فـ $\\overrightarrow{AB} = \\overrightarrow{DC}$ . ${MISTAKES.order.text}`}</MathText>}
                onAnswered={() => setQ3a(true)}
              />
              {q3a && (
                <TapQuestion
                  prompt="لإثبات أن EFGH متوازي أضلاع (E، F، G ليست على استقامة)، يكفي أن نثبت:"
                  options={[
                    '$\\overrightarrow{EF} = \\overrightarrow{HG}$',
                    '$\\overrightarrow{EF} = \\overrightarrow{GH}$', // l'ordre : EFHG
                    '$EF = HG$', // deux longueurs égales : un trapèze isocèle aussi
                  ].map(M)}
                  correct={0}
                  cols={3}
                  requires={['mutawazi-shuaa']}
                  explain={<MathText>{'الضلع [EF] ومقابله [HG] مقروءان في الاتجاه نفسه: $\\overrightarrow{EF} = \\overrightarrow{HG}$ . تساوي الطولين لا يكفي (شبه منحرف متساوي الساقين).'}</MathText>}
                  onAnswered={() => setQ3(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'حالة خاصة', subtitle: 'النقط على استقامة واحدة', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>A، B، C، D على مستقيم واحد بهذا الترتيب، و <MathText>{'$\\overrightarrow{AB} = \\overrightarrow{CD}$'}</MathText> . <SourceTag source={PLATFORM_SOURCE} /></span>}
                options={[
                  'للقطعتين [AD] و [BC] نفس المنتصف، لكن ABDC ليس متوازي أضلاع حقيقيا (مسطّح)',
                  'ABDC متوازي أضلاع حقيقي', // les quatre points sont alignés
                  'المساواة مستحيلة لأن النقط على استقامة', // نشاط 2 ب : elle est possible
                ].map(M)}
                correct={0}
                cols={1}
                requires={['mutawazi-shuaa', 'muntasaf-mushtarak']}
                explain={<MathText>{'كما في نشاط 2 ب: تساوي الشعاعين يعطي المنتصف المشترك، لكن «متوازي الأضلاع» مسطّح لأن الرؤوس على استقامة واحدة.'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <TextbookBox kind="remark" text={KNOW2_REMINDER.special} source={KNOW2_REMINDER.source} compact />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
