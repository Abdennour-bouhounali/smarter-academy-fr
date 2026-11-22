import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { SourceTag, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY_2, ACTIVITY_2_LINES, KNOW2, PLATFORM_SOURCE } from '../content/textbook';
import { FIG_ACT2, FIG_ACT2_D, FIG_KNOW2, FIG_KNOW2_FLAT } from '../content/figures';

/**
 * Module 3 — نشاط 2 أ (p. 128) et معارف 2 (p. 130) « الشعاعان المتساويان ومتوازي الأضلاع ».
 * TOUCH THE MATH : construire D (D image de C par la translation qui transforme B en A — la translation du lab), comparer
 * AB et DC, nommer AD = BC. FORMALIZE : la propriété (brique mutawazi-adlaa) ; l'ORDRE DES LETTRES (AB = CD ⇔ ABDC, le
 * point d'apprentissage du propriétaire, MISC-SHUAA-TARTIB-RUUS) ; les remarques et le cas aligné (brique mulahazat).
 * La partie ب du نشاط 2 est au درس « الشعاعان المتساويان ومتوازي الأضلاع ومنتصف قطعة ». LP : P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Mutawazi() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3} objectives={['كيف ننشئ النقطة D لنحصل على متوازي أضلاع؟', 'ماذا نقول عن الشعاعين AB و DC؟', 'هل يهمّ ترتيب الحروف؟', 'ماذا يحدث إذا كانت النقط الأربع في استقامية؟']}
      moduleTitle="نشاط 2 أ — الشعاعان المتساويان ومتوازي الأضلاع"
      moduleSubtitle="متى يرسم شعاعان متساويان متوازي أضلاع؟"
      estimatedTime="9 دقائق"
      brief={{
        tag: 'نشاط 2 ومعارف 2 — الكتاب ص 128 و 130', title: ACTIVITY_2.title, tone: 'emerald',
        body: <p>في عرض المسيّرات أضاء الرباعي ABB′A′ حين اكتملت التشكيلة. هنا نبني الرباعي بأنفسنا ونعرف السبب.</p>,
        footer: <SourceTag source={ACTIVITY_2.source} />,
      }}
      steps={[
        {
          num: 1, title: 'نشاط 2 أ: أنشئ النقطة D', subtitle: 'السؤال 1', done: q1,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY_2.text} source={ACTIVITY_2.source} compact />
              <GeoFigure {...FIG_ACT2} />
              <TapQuestion
                prompt="لكي يكون الرباعي ABCD متوازي أضلاع، النقطة D هي:"
                options={[
                  'صورة C بالانسحاب الذي يحوّل B إلى A',
                  'صورة C بالانسحاب الذي يحوّل A إلى B', // donne ABDC, pas ABCD
                  'منتصف القطعة [AC]', // un sommet n'est pas sur la diagonale
                ]}
                correct={0}
                cols={1}
                requires={['insihab-shuaa']}
                explain={<MathText>{`${ACTIVITY_2_LINES.construct} (بالانسحاب الذي يحوّل A إلى B تقع صورة C في الجهة الأخرى، فيكون الرباعي ABDC.)`}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <GeoFigure {...FIG_ACT2_D} />}
            </div>
          ),
        },
        {
          num: 2, title: 'نشاط 2 أ: قارن الشعاعين', subtitle: 'السؤال 2', done: q2,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_ACT2_D} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">في متوازي الأضلاع ABCD:</p>}
                rows={[
                  {
                    id: 'abdc', label: <MathText>{'الشعاعان $\\overrightarrow{AB}$ و $\\overrightarrow{DC}$'}</MathText>,
                    options: ['متساويان: نفس المنحى ونفس الاتجاه ونفس الطول', 'لهما نفس الطول فقط', 'لهما نفس المنحى والطول واتجاهان متعاكسان'],
                    correct: 0, correction: <MathText>{ACTIVITY_2_LINES.compare}</MathText>,
                  },
                  {
                    id: 'other', label: 'شعاعان آخران متساويان',
                    options: ['$\\overrightarrow{AD} = \\overrightarrow{BC}$', '$\\overrightarrow{AD} = \\overrightarrow{CB}$', '$\\overrightarrow{AC} = \\overrightarrow{BD}$'].map(M),
                    correct: 0, correction: <MathText>{ACTIVITY_2_LINES.other}</MathText>,
                  },
                ]}
                requires={['tasawi-shuaayn']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: ضلعان متقابلان في متوازي الأضلاع يعطيان شعاعين متساويين.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="mutawazi-adlaa" lead="الخاصية، بكلمات الكتاب:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'ترتيب الحروف', subtitle: 'أيّ رباعي؟', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="example" text={'A و B و C و D أربع نقط كل ثلاث منها ليست في استقامية و $\\overrightarrow{AB} = \\overrightarrow{CD}$ .'} source={PLATFORM_SOURCE} compact />
              <TapQuestion
                prompt={<MathText>{'$\\overrightarrow{AB} = \\overrightarrow{CD}$ يعني أن الرباعي التالي متوازي أضلاع:'}</MathText>}
                options={['ABDC', 'ABCD', 'ACBD']}
                correct={0}
                cols={3}
                requires={['mutawazi-adlaa']}
                explain={<MathText>{`${ACTIVITY_2_LINES.order} (ABCD يتطلب $\\overrightarrow{AB} = \\overrightarrow{DC}$ ، و ACBD يتطلب $\\overrightarrow{AC} = \\overrightarrow{DB}$ .)`}</MathText>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'ملاحظات وحالة خاصة', subtitle: 'معارف 2', done: q4,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_KNOW2} />
              <GeoFigure {...FIG_KNOW2_FLAT} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{`${KNOW2.special} في الشكل أعلاه $\\overrightarrow{AB} = \\overrightarrow{DC}$ :`}</MathText></p>}
                rows={[
                  { id: 'quad', label: 'هل ABCD متوازي أضلاع؟', options: ['لا: النقط في استقامية، لا يتكوّن رباعي', 'نعم'], correct: 0, correction: <MathText>{KNOW2.specialLine}</MathText> },
                  { id: 'mid', label: 'القطعتان [AC] و [BD]', options: ['لهما نفس المنتصف E', 'ليس لهما نفس المنتصف'], correct: 0, correction: <MathText>{KNOW2.remarks[0]}</MathText> },
                ]}
                requires={['mutawazi-adlaa']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: المنتصف المشترك يبقى حتى حين يصبح متوازي الأضلاع «مسطّحا».' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <KnowledgeBrick id="mulahazat" lead="ما يصحّ من أجل كل أربع نقط:" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
