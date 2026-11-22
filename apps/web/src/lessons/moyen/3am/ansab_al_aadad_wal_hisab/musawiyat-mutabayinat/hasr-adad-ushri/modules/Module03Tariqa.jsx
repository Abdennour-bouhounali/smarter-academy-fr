import { useState } from 'react';
import { ContentModule, KnowledgeBrick, BatchChoiceQuestion } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, KNOWLEDGE, RECALL } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) : trois méthodes, chacune ouverte par sa question — encadrer un nombre à un rang
 * (et donner son mudawwar), encadrer un nombre dont on connaît le mudawwar (le bout droit exclu), encadrer un quotient lu sur la calculatrice. La méthode et la brique
 * viennent APRÈS la réponse. Une « تذكّر » rappelle la propriété du × positif (leçon sœur publiée, jamais reconstruite). LP : P2, P3, P4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [r, setR] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const revealed = (k) => () => setR((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أحصر عددًا إلى رتبة وأعيّن مدوّره؟', 'كيف أحصر عددًا علمت مدوّره؟', 'كيف أحصر حاصل قسمة مقروء على الآلة الحاسبة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أحصر وأدوّر"
      moduleSubtitle="ثلاث طرائق بفكرة واحدة"
      estimatedTime="10 دقائق"
      steps={[
        {
          num: 1, title: 'كيف أحصر عددًا إلى رتبة؟', subtitle: 'والمدوّر', done: !!q.a && !!r.a,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<MathText>{'العدد $7{,}4826$ . أكمل:'}</MathText>}
                rows={[
                  { id: 'b2', label: M('حصره إلى $0{,}01$'), options: [M('$7{,}48\\le x<7{,}49$'), M('$7{,}49\\le x<7{,}50$'), M('$7{,}47\\le x<7{,}48$')], correct: 0, correction: M('نقطع بعد رقمين: $7{,}48$ ثم نضيف $0{,}01$ .') },
                  { id: 'r2', label: M('مدوّره إلى $0{,}01$'), options: [M('$7{,}48$'), M('$7{,}49$'), M('$7{,}5$')], correct: 0, correction: M('الرقم الذي يلي الجزء من مئة هو $2$ فلا نرفع: $7{,}48$ .') },
                  { id: 'b3', label: M('حصره إلى $0{,}001$'), options: [M('$7{,}482\\le x<7{,}483$'), M('$7{,}483\\le x<7{,}484$'), M('$7{,}48\\le x<7{,}49$')], correct: 0, correction: M('نقطع بعد ثلاثة أرقام: $7{,}482$ ثم نضيف $0{,}001$ .') },
                  { id: 'r3', label: M('مدوّره إلى $0{,}001$'), options: [M('$7{,}482$'), M('$7{,}483$'), M('$7{,}48$')], correct: 1, correction: M('الرقم الذي يلي الجزء من ألف هو $6$ فنرفع: $7{,}483$ .') },
                ]}
                feedback={({ allRight }) => (allRight ? 'أحسنت: العلامة السفلى بالقطع، والعليا بزيادة وحدة من الرتبة، والمدوّر بالرقم التالي.' : 'راجع: القطع للحصر، والرقم التالي للمدوّر.')}
                requires={['hasr-rutba']}
                onAnswered={answered('a')}
              />
              {q.a && <MethodSteps method={METHOD.rank} onAllRevealed={revealed('a')} />}
              {q.a && <KnowledgeBrick id="tariqa-hasr-rutba" lead="كيف نحصر عددًا إلى رتبة ونعيّن مدوّره؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'وكيف أحصر عددًا علمت مدوّره؟', subtitle: 'الطرف الأيمن', done: !!q.b && !!r.b,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<MathText>{'مدوّر $a$ إلى $0{,}01$ هو $3{,}72$ . أجب:'}</MathText>}
                rows={[
                  { id: 'br', label: 'حصر $a$', options: [M('$3{,}715\\le a<3{,}725$'), M('$3{,}72\\le a<3{,}73$'), M('$3{,}715\\le a\\le 3{,}725$')], correct: 0, correction: M('نطرح $0{,}005$ ونضيفه، والطرف الأيمن غير مشمول.') },
                  { id: 'y1', label: M('هل يمكن أن يساوي $a$ العدد $3{,}7249$ ؟'), options: ['نعم', 'لا'], correct: 0, correction: M('$3{,}7249<3{,}725$ فهو داخل المجال.') },
                  { id: 'y2', label: M('وهل يمكن أن يساوي العدد $3{,}725$ ؟'), options: ['نعم', 'لا'], correct: 1, correction: M('مدوّر $3{,}725$ هو $3{,}73$ فهو خارج المجال.') },
                  { id: 'y3', label: M('وهل يمكن أن يساوي العدد $3{,}714$ ؟'), options: ['نعم', 'لا'], correct: 1, correction: M('$3{,}714<3{,}715$ ومدوّره $3{,}71$ .') },
                ]}
                feedback={({ allRight }) => (allRight ? 'أحسنت: نصف الرتبة من كل جهة، والطرف الأيسر وحده مشمول.' : 'راجع: الطرف الأيسر مشمول والأيمن غير مشمول.')}
                requires={['hasr-min-mudawwar']}
                onAnswered={answered('b')}
              />
              {q.b && <MethodSteps method={METHOD.fromRound} onAllRevealed={revealed('b')} />}
              {q.b && <KnowledgeBrick id="tariqa-hasr-mudawwar" lead="كيف نحصر عددًا علمنا مدوّره؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'وكيف أحصر حاصل قسمة؟', subtitle: 'الآلة الحاسبة', done: !!q.c && !!r.c,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="remark" title={RECALL.properties.title} text={RECALL.properties.text} source={RECALL.properties.source} compact />
              <BatchChoiceQuestion
                intro={<MathText>{'تُظهر الآلة $355\\div113=3.14159292$ . ونضع $q=\\frac{355}{113}$ . أجب:'}</MathText>}
                rows={[
                  { id: 'q3', label: M('حصر $q$ إلى $0{,}001$'), options: [M('$3{,}141<q<3{,}142$'), M('$3{,}142<q<3{,}143$'), M('$3{,}14<q<3{,}15$')], correct: 0, correction: M('نقرأ ثلاثة أرقام بعد الفاصلة: $3{,}141$ ثم نضيف $0{,}001$ .') },
                  { id: 'r2', label: M('مدوّر $q$ إلى $0{,}01$'), options: [M('$3{,}14$'), M('$3{,}15$'), M('$3{,}141$')], correct: 0, correction: M('الرقم الذي يلي الجزء من مئة هو $1$ فلا نرفع: $3{,}14$ .') },
                  { id: 'r3', label: M('مدوّر $q$ إلى $0{,}001$'), options: [M('$3{,}141$'), M('$3{,}142$'), M('$3{,}14$')], correct: 1, correction: M('الرقم الذي يلي الجزء من ألف هو $5$ فنرفع: $3{,}142$ .') },
                ]}
                feedback={({ allRight }) => (allRight ? 'أحسنت: الحاصل بين علامتين متتاليتين، ومدوّره بالرقم التالي.' : 'راجع: شاشة الآلة تُقرأ حتى الرتبة، ثم ننظر إلى الرقم الذي يليها.')}
                requires={['hasr-rutba']}
                onAnswered={answered('c')}
              />
              {q.c && <MethodSteps method={METHOD.quotient} onAllRevealed={revealed('c')} />}
              {q.c && <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"><MathText>{KNOWLEDGE.quotient.text}</MathText></p>}
              {q.c && <KnowledgeBrick id="tariqa-hasil" lead="كيف نحصر حاصل قسمة مقروء على الآلة الحاسبة؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
