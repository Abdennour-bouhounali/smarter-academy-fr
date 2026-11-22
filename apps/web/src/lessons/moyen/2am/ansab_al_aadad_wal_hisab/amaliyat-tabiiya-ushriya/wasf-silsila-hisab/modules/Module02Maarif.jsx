import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessonPath } from '@smarter-academy/core';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE, RECALL_AQWAS, RECALL_PRIORITE } from '../content/textbook';
import { desc } from '../content/exercises';

/**
 * Module 2 — معارف : le module s'ouvre sur un labo (le MÊME type `chain-cutter`, posé seul `levels={false}`, un seul ruban : (20 − 8) ÷ (1 + 2), coupé jusqu'aux nombres) ; chaque encadré NOMME
 * ce que l'élève vient de faire (question → encadré → brique), avec les mots de la plateforme (guide §4ter-bis) : le dividende et le diviseur, la phrase, la règle de la dernière opération et ses
 * deux exemples (mêmes nombres, deux noms), l'ordre dans la différence et le quotient. Deux rappels AVEC lien (« تذكّر », leçons précédentes de l'unité, PUBLIÉES) : les parenthèses et la priorité
 * des opérations. LP : P1, P2.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

const RecallLink = ({ lesson, children }) => {
  const to = getLessonPath(lesson);
  return to ? <Link to={to} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>{children}</Link> : null;
};

export default function Module02Maarif() {
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أسمّي قطعتي السلسلة؟', 'كيف أصف سلسلة بجملة؟', 'ما القاعدة التي تسمّي بها السلسلة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — آخر عملية تسمّي السلسلة"
      moduleSubtitle="أسمّي ما فعلتُه"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="chain-cutter" tasks={LAB.alone.tasks} levels={false} />}
      steps={[
        {
          num: 1, title: 'ما المقسوم وما القاسم؟', subtitle: 'في الشريط الذي قصصتَه', done: !!q.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'في الشريط $(20 - 8) \\div (1 + 2)$ الذي قصصتَه عند القسمة: ما المقسوم؟'}</MathText>}
                options={['$20 - 8$', '$1 + 2$', '$20$'].map(M)}
                correct={0} cols={3} requires={['hudud-awamil']}
                explain={<MathText>{'المقسوم هو القطعة التي تُقسم كلّها: $20 - 8 = 12$ ، والقاسم هو $1 + 2 = 3$ ، وحاصل القسمة $12 \\div 3 = 4$ .'}</MathText>}
                onAnswered={answered('a')} />
              {q.a && <TextbookBox kind="property" compact text={KNOWLEDGE.terms.text} source={KNOWLEDGE.terms.source} />}
              {q.a && (
                <TextbookBox kind="remark" title={RECALL_AQWAS.title} text={RECALL_AQWAS.text} source={RECALL_AQWAS.source} compact>
                  <RecallLink lesson={RECALL_AQWAS.lesson}>درس « سلسلة عمليات تتضمّن أقواسا »</RecallLink>
                </TextbookBox>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'كيف نصف هذا الشريط؟', subtitle: 'جملة تبدأ باسم السلسلة', done: !!q.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'أيّ جملة تصف $(20 - 8) \\div (1 + 2)$ ؟'}</MathText>}
                options={[desc('(20 − 8) ÷ (1 + 2)'), desc('20 − 8 ÷ (1 + 2)'), desc('(20 − 8) × (1 + 2)')].map(M)}
                correct={0} cols={1} requires={['wasf-jumla']}
                explain={<MathText>{'آخر عملية هي القسمة، فالسلسلة حاصل قسمة، مقسومها فرق العددين 20 و 8 وقاسمها مجموع العددين 1 و 2. (الثانية وصفت فرقًا؛ والثالثة وصفت جداءً.)'}</MathText>}
                onAnswered={answered('b')} />
              {q.b && <KnowledgeBrick id="qaidat-tasmiya" lead="نجمع ما فعلناه: ماذا تسمّي السلسلة وكيف نصفها؟" />}
              {q.b && <TextbookBox kind="property" compact text={KNOWLEDGE.last.text} source={KNOWLEDGE.last.source} />}
              {q.b && <TextbookBox kind="example" compact text={KNOWLEDGE.sentence.text} source={KNOWLEDGE.sentence.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'أعداد واحدة وسلسلتان', subtitle: 'القوسان يغيّران الاسم', done: !!q.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'نقارن $A = 9 + 2 \\times 7$ و $B = (9 + 2) \\times 7$ : ما اسم كلّ منهما؟'}</MathText>}
                options={['$A$ مجموع و $B$ جداء', '$A$ جداء و $B$ مجموع', '$A$ و $B$ جداءان'].map(M)}
                correct={0} cols={1} requires={['qaidat-tasmiya']}
                explain={<MathText>{'في $A$ الضرب أوّلًا فالجمع هو الأخير؛ وفي $B$ القوسان يجعلان الجمع أوّلًا فالضرب هو الأخير.'}</MathText>}
                onAnswered={answered('c')} />
              {q.c && <TextbookBox kind="example" compact text={KNOWLEDGE.examples.text} source={KNOWLEDGE.examples.source} />}
              {q.c && (
                <TextbookBox kind="remark" title={RECALL_PRIORITE.title} text={RECALL_PRIORITE.text} source={RECALL_PRIORITE.source} compact>
                  <RecallLink lesson={RECALL_PRIORITE.lesson}>درس « سلسلة عمليات دون أقواس وأولوية العمليات »</RecallLink>
                </TextbookBox>
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'هل يهمّ الترتيب؟', subtitle: 'في الفرق وفي حاصل القسمة', done: !!q.d,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'أيّ كتابة تعطي «حاصل قسمة 12 على 4» ؟'}</MathText>}
                options={['$12 \\div 4$', '$4 \\div 12$', '$12 - 4$'].map(M)}
                correct={0} cols={3} requires={['qaidat-tasmiya']}
                explain={<MathText>{'نذكر المقسوم أوّلًا: $12 \\div 4 = 3$ . أمّا $4 \\div 12$ فهي حاصل قسمة 4 على 12 وليست هي المطلوبة.'}</MathText>}
                onAnswered={answered('d')} />
              {q.d && <TextbookBox kind="remark" compact text={KNOWLEDGE.order.text} source={KNOWLEDGE.order.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
