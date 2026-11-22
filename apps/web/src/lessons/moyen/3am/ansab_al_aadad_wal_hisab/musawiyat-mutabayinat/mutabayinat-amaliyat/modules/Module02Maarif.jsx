import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessonPath } from '@smarter-academy/core';
import { ContentModule, TapQuestion, KnowledgeBrick, BatchChoiceQuestion } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE, RECALL, LAB } from '../content/textbook';

/**
 * Module 2 — معارف : on NOMME ce que l'élève a fait aux خيوط النول, et on dit POURQUOI (le signe d'une différence, rappelé). Deux « تذكّر » dans le `brief`
 * (les égalités ; le signe de a − b), chacune avec le lien de sa leçon publiée — jamais reconstruites. Le labo se pose SEUL (`levels={false}`, une mission :
 * × (−2) fait passer −3 < 2 à 6 > −4). Puis : une question à quatre lignes (les trois propriétés et la division), deux questions de preuve (a + c et ac), les
 * encadrés, ≤ et ≥, le zéro. LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const link = (code, label) => { const to = getLessonPath(code); return to && <Link to={to} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>{label}</Link>; };
  return (
    <ContentModule
      objectives={['لماذا لا ينعكس الاتجاه إلا عند الضرب في عدد سالب؟', 'كيف أكتب الخواص الثلاث؟', 'وماذا عن ≤ و ≥ وعن القسمة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — لماذا ينقلب الاتجاه؟"
      moduleSubtitle="نبرّر بإشارة الفرق ثم نسمّي الخواص"
      estimatedTime="11 دقيقة"
      brief={{
        tag: 'معارف', title: 'نبرّر ثم نسمّي', tone: 'violet',
        body: (
          <div className="space-y-3">
            <p>جرّب أوّلًا مهمّة النول أدناه، ثم أجب؛ كل خلاصة تظهر بعد السؤال.</p>
            <TextbookBox kind="remark" title={RECALL.year2.title} text={RECALL.year2.text} source={RECALL.year2.source} compact>
              {link(RECALL.year2.lesson, 'درس « اختبار صحة مساواة أو متباينة » — السنة الثانية متوسط')}
            </TextbookBox>
            <TextbookBox kind="remark" title={RECALL.equality.title} text={RECALL.equality.text} source={RECALL.equality.source} compact>
              {link(RECALL.equality.lesson, 'درس « المساويات والعمليات » — السنة الثالثة متوسط')}
            </TextbookBox>
            <TextbookBox kind="remark" title={RECALL.difference.title} text={RECALL.difference.text} source={RECALL.difference.source} compact>
              {link(RECALL.difference.lesson, 'درس « مقارنة عددين ناطقين » — السنة الثالثة متوسط')}
            </TextbookBox>
          </div>
        ),
      }}
      intro={<Manipulation type="loom-threads" step={LAB.alone.step} tasks={LAB.alone.tasks} levels={false} />}
      steps={[
        {
          num: 1, title: 'أكتب ما رأيتُه بأعداد', subtitle: 'x < −2', done: !!q.a,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<MathText>{'$x<-2$ . أكمل كل جملة بالرمز المناسب:'}</MathText>}
                rows={[
                  { id: 'r1', label: M('$x+6\\ \\square\\ 4$'), options: [M('$<$'), M('$>$')], correct: 0, correction: M('نضيف $6$ إلى طرفي $x<-2$ : $x+6<4$ .') },
                  { id: 'r2', label: M('$3x\\ \\square\\ -6$'), options: [M('$<$'), M('$>$')], correct: 0, correction: M('نضرب في $3$ وهو موجب: الاتجاه نفسه.') },
                  { id: 'r3', label: M('$-5x\\ \\square\\ 10$'), options: [M('$<$'), M('$>$')], correct: 1, correction: M('نضرب في $-5$ وهو سالب: الاتجاه ينعكس.') },
                  { id: 'r4', label: M('$\\frac{x}{-4}\\ \\square\\ \\frac{1}{2}$'), options: [M('$<$'), M('$>$')], correct: 1, correction: M('نقسم على $-4$ وهو سالب: الاتجاه ينعكس.') },
                ]}
                feedback={({ allRight }) => (allRight ? 'أحسنت: الجمع والضرب في موجب يحفظان الاتجاه، والضرب أو القسمة في سالب يعكسانه.' : 'راجع: انظر هل العدد الذي نجري به العملية ضرب في موجب أم في سالب.')}
                requires={['jam-mutabayina']}
                onAnswered={answered('a')}
              />
            </div>
          ),
        },
        {
          num: 2, title: 'لماذا يبقى الاتجاه عند الجمع؟', subtitle: 'الفرق', done: !!q.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={M('$a<b$ . احسب الفرق $(a+c)-(b+c)$ ؛ ما إشارته؟')}
                options={[M('يساوي $a-b$ وهو سالب، فـ $a+c<b+c$'), M('يساوي $a-b+2c$ ولا نعرف إشارته'), M('يساوي $0$')]}
                correct={0} cols={1} requires={['jam-mutabayina']}
                explain={<MathText>{'$(a+c)-(b+c)=a-b$ مهما كان $c$ ، وهو سالب لأنّ $a<b$ : إذن $a+c<b+c$ .'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <TextbookBox kind="property" compact text={KNOWLEDGE.add.text} source={KNOWLEDGE.add.source} />}
              {q.b && <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"><MathText>{KNOWLEDGE.add.example}</MathText></p>}
            </div>
          ),
        },
        {
          num: 3, title: 'ولماذا ينعكس عند الضرب في سالب؟', subtitle: 'ac − bc', done: !!q.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={M('$a<b$ و $c<0$ . ما إشارة $(a-b)\\times c$ ؟')}
                options={[M('موجبة: فـ $ac-bc>0$ أي $ac>bc$'), M('سالبة: فـ $ac<bc$'), M('لا يمكن معرفتها')]}
                correct={0} cols={1} requires={['darb-salib']}
                explain={<MathText>{'$a-b$ سالب و $c$ سالب، وجداء سالبين موجب. و $ac-bc=(a-b)c$ ، إذن $ac>bc$ .'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <TextbookBox kind="property" compact text={KNOWLEDGE.pos.text} source={KNOWLEDGE.pos.source} />}
              {q.c && <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"><MathText>{KNOWLEDGE.pos.example}</MathText></p>}
              {q.c && <TextbookBox kind="property" compact text={KNOWLEDGE.neg.text} source={KNOWLEDGE.neg.source} />}
              {q.c && <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"><MathText>{KNOWLEDGE.neg.example}</MathText></p>}
            </div>
          ),
        },
        {
          num: 4, title: 'ماذا عن ≤ و ≥ وعن القسمة؟', subtitle: '≤ ≥ ÷', done: !!q.d && !!q.e,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={M('$y\\geq 6$ . ماذا نكتب بعد القسمة على $-3$ ؟')}
                options={[M('$\\frac{y}{-3}\\leq -2$'), M('$\\frac{y}{-3}\\geq -2$'), M('$\\frac{y}{-3}<-2$')]}
                correct={0} cols={1} requires={['darb-salib']}
                explain={<MathText>{'القسمة على $-3$ هي الضرب في $-\\frac{1}{3}$ وهو سالب: $\\geq$ تصير $\\leq$ ، والتساوي يبقى ممكنًا.'}</MathText>}
                onAnswered={answered('d')}
              />
              {q.d && <KnowledgeBrick id="qisma-wa-taswiya" lead="ماذا نقول عن ≤ و ≥ وعن القسمة؟" />}
              {q.d && <TextbookBox kind="remark" compact text={KNOWLEDGE.weak.text} source={KNOWLEDGE.weak.source} />}
              {q.d && (
                <TapQuestion
                  prompt={M('$a<b$ . ماذا يحدث لو ضربنا في $0$ ؟')}
                  options={[M('نجد $0=0$ : لم تعد متباينة تامّة'), M('نجد $0<0$'), M('نجد $a<b$ من جديد')]}
                  correct={0} cols={1} requires={['darb-salib']}
                  explain={<MathText>{KNOWLEDGE.zero.text}</MathText>}
                  onAnswered={answered('e')}
                />
              )}
              {q.e && <KnowledgeBrick id="sifr-mutabayina" lead="ماذا يفعل الضرب في 0 بالمتباينة؟" />}
              {q.e && <TextbookBox kind="remark" compact text={KNOWLEDGE.zero.text} source={KNOWLEDGE.zero.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
