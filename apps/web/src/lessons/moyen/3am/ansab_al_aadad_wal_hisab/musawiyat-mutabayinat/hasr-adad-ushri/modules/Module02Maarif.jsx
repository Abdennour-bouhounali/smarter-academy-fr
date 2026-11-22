import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessonPath } from '@smarter-academy/core';
import { ContentModule, KnowledgeBrick, BatchChoiceQuestion } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE, RECALL } from '../content/textbook';
import { ROUNDING_FIGURE } from '../content/figures';
import RoundingLine from '../content/RoundingLine';

/**
 * Module 2 — معارف : on NOMME ce que l'élève a fait à « ميزان العطّار », avec SON propre nombre (6,358). Le module s'ouvre sur sa PREMIÈRE question (§4quater),
 * le « تذكّر — السنة الأولى » est dans le `brief` (avec le lien de sa leçon quand elle est publiée, `getLessonPath`, jamais reconstruite). Ordre : la chaîne de repères
 * d'UN nombre (1, 0,1, 0,01), puis son mudawwar à chacun de ces rangs (la règle du chiffre suivant), puis le chemin inverse (un nombre dont on connaît le mudawwar,
 * avec la droite de 8,5 · 9 · 9,5). LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const prior = getLessonPath(RECALL.prior.lesson);
  return (
    <ContentModule
      objectives={['كيف أحصر عددًا عشريًا بين علامتين من كل رتبة؟', 'كيف أعيّن مدوّره؟', 'وكيف أحصر عددًا علمت مدوّره؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — الحصر والتدوير"
      moduleSubtitle="نسمّي ما فعلتَه على الميزان"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف', title: 'نبني على تدوير السنة الأولى', tone: 'violet',
        body: (
          <div className="space-y-3">
            <p>أجب عن كل سؤال، فتظهر الخلاصة بعده.</p>
            <TextbookBox kind="remark" title={RECALL.prior.title} text={RECALL.prior.text} source={RECALL.prior.source} compact>
              {prior && <Link to={prior} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>درس « حصر القيم المقرّبة » — السنة الأولى متوسط</Link>}
            </TextbookBox>
          </div>
        ),
      }}
      steps={[
        {
          num: 1, title: 'بين أيّ علامتين يقع العدد؟', subtitle: '6,358', done: !!q.a,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<MathText>{'العدد $6{,}358$ . أكمل كل متباينة بالعلامة العليا من الرتبة المذكورة:'}</MathText>}
                rows={[
                  { id: 'r1', label: M('$6\\le 6{,}358<\\ \\square$'), options: [M('$7$'), M('$6{,}4$'), M('$6{,}36$')], correct: 0, correction: M('الوحدة التي تلي $6{,}358$ هي $7$ .') },
                  { id: 'r2', label: M('$6{,}3\\le 6{,}358<\\ \\square$'), options: [M('$6{,}4$'), M('$7$'), M('$6{,}36$')], correct: 0, correction: M('الجزء من عشرة الذي يلي $6{,}358$ هو $6{,}4$ .') },
                  { id: 'r3', label: M('$\\square\\ \\le 6{,}358<6{,}36$'), options: [M('$6{,}3$'), M('$6{,}35$'), M('$6{,}358$')], correct: 1, correction: M('العلامة التي تسبقه من رتبة الجزء من مئة هي $6{,}35$ .') },
                ]}
                feedback={({ allRight }) => (allRight ? 'أحسنت: العلامة السفلى بالنقصان والعلامة العليا بالزيادة، وكل رتبة تضيّق الحصر.' : 'راجع: العلامة السفلى تبقى فيها أرقام العدد حتى الرتبة، والعليا تزيد عليها وحدة من الرتبة.')}
                requires={['tadwir']}
                onAnswered={answered('a')}
              />
              {q.a && <TextbookBox kind="property" compact text={KNOWLEDGE.chain.text} source={KNOWLEDGE.chain.source} />}
              {q.a && <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"><MathText>{KNOWLEDGE.chain.example}</MathText></p>}
              {q.a && <KnowledgeBrick id="hasr-rutba" lead="بين أيّ علامتين يقع عدد عشري من كل رتبة؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'وما مدوّره؟', subtitle: 'الرقم التالي', done: !!q.b,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<MathText>{'العدد $6{,}358$ نفسه. ما مدوّره:'}</MathText>}
                rows={[
                  { id: 'u', label: 'إلى الوحدة', options: [M('$6$'), M('$7$'), M('$6{,}4$')], correct: 0, correction: M('الرقم الذي يلي الوحدة هو $3$ (أقلّ من $5$) فلا نرفع.') },
                  { id: 't', label: M('إلى $0{,}1$'), options: [M('$6{,}3$'), M('$6{,}4$'), M('$6{,}36$')], correct: 1, correction: M('الرقم الذي يلي الجزء من عشرة هو $5$ فنرفع: $6{,}4$ .') },
                  { id: 'h', label: M('إلى $0{,}01$'), options: [M('$6{,}35$'), M('$6{,}36$'), M('$6{,}4$')], correct: 1, correction: M('الرقم الذي يلي الجزء من مئة هو $8$ فنرفع: $6{,}36$ .') },
                ]}
                feedback={({ allRight }) => (allRight ? 'أحسنت: ننظر دائمًا إلى الرقم الذي يلي الرتبة المطلوبة وحدها.' : 'راجع: الرقم الذي يلي الرتبة هو الحكم، 5 أو أكثر نرفع.')}
                requires={['hasr-rutba']}
                onAnswered={answered('b')}
              />
              {q.b && <TextbookBox kind="property" compact text={KNOWLEDGE.round.text} source={KNOWLEDGE.round.source} />}
              {q.b && <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"><MathText>{KNOWLEDGE.round.example}</MathText></p>}
            </div>
          ),
        },
        {
          num: 3, title: 'وإذا عرفنا مدوّر العدد فقط؟', subtitle: 'الطريق المعاكس', done: !!q.c,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<MathText>{'عدد $x$ مدوّره إلى الوحدة $9$ . هل يمكن أن يساوي:'}</MathText>}
                rows={[
                  { id: 'a', label: M('$x=8{,}5$'), options: ['نعم', 'لا'], correct: 0, correction: M('مدوّر $8{,}5$ هو $9$ (الرقم الذي يلي الوحدة هو $5$).') },
                  { id: 'b', label: M('$x=9{,}49$'), options: ['نعم', 'لا'], correct: 0, correction: M('الرقم الذي يلي الوحدة هو $4$ فلا نرفع: المدوّر $9$ .') },
                  { id: 'c', label: M('$x=9{,}5$'), options: ['نعم', 'لا'], correct: 1, correction: M('مدوّر $9{,}5$ هو $10$ وليس $9$ .') },
                ]}
                feedback={({ allRight }) => (allRight ? 'أحسنت: المجال يبدأ بنصف وحدة تحت $9$ ويبلغ دون نصف وحدة فوقه.' : 'راجع: أيّ عدد مدوّره $9$ ؟ جرّب الرقم الذي يلي الوحدة.')}
                requires={['hasr-rutba']}
                onAnswered={answered('c')}
              />
              {q.c && <TextbookBox kind="property" compact text={KNOWLEDGE.fromRound.text} source={KNOWLEDGE.fromRound.source} />}
              {q.c && <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"><MathText>{KNOWLEDGE.fromRound.example}</MathText></p>}
              {q.c && <RoundingLine figure={ROUNDING_FIGURE} ariaLabel="مستقيم مدرّج عليه 8,5 و 9 و 9,5: النقطة الممتلئة عند 8,5 مشمولة والنقطة المفرغة عند 9,5 غير مشمولة" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
