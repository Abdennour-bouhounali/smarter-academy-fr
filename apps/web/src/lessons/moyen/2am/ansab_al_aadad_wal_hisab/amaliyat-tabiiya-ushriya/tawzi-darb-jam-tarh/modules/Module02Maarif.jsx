import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessonPath } from '@smarter-academy/core';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE, RECALL_AQWAS } from '../content/textbook';

/**
 * Module 2 — معارف : le module s'ouvre sur un labo (le MÊME type `kit-packer`, posé seul `levels={false}`, un seul chargement : 5 cartables de 6 cahiers et 4 stylos) ; chaque encadré NOMME ce que l'élève
 * vient de faire (question → encadré → brique), avec les mots de la plateforme (guide §4ter-bis) : la propriété pour la somme et la différence, les deux exemples (mêmes nombres que la leçon, autres que le manuel),
 * نشر et تحليل, le facteur commun visible dans un ordre ou dans l'autre. Un rappel AVEC lien (« تذكّر — الأقواس », `silsila-bi-aqwas`, PUBLIÉE). LP : P1, P2, P3.
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
      objectives={['كيف أسمّي خاصية توزيع الضرب؟', 'ما النشر وما التحليل؟', 'كيف أرى العامل المشترك؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — توزيع الضرب والنشر والتحليل"
      moduleSubtitle="أسمّي ما فعلتُه"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="kit-packer" tasks={LAB.alone.tasks} levels={false} />}
      steps={[
        {
          num: 1, title: 'ما أخرجه كلّ ممرّ', subtitle: 'جداء عدد ومجموع', done: !!q.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'لخمس حقائب فيها 6 كراريس و 4 أقلام: أيّ كتابتين تعبّران عمّا أخرجه الممرّان؟'}</MathText>}
                options={['$5 \\times (6 + 4)$ و $5 \\times 6 + 5 \\times 4$', '$5 \\times 6 + 4$ و $5 \\times 6 \\times 4$', '$5 + 6 \\times 4$ و $5 \\times 6 + 4$'].map(M)}
                correct={0} cols={1} requires={['tawzi-jam']}
                explain={<MathText>{'ممرّ فاطمة يملأ خمس حقائب من 10 أشياء: $5 \\times (6 + 4)$ ؛ وممرّ علي يخرج $5 \\times 6$ كرّاسًا و $5 \\times 4$ قلمًا: $5 \\times 6 + 5 \\times 4$ .'}</MathText>}
                onAnswered={answered('a')} />
              {q.a && (
                <TextbookBox kind="remark" title={RECALL_AQWAS.title} text={RECALL_AQWAS.text} source={RECALL_AQWAS.source} compact>
                  <RecallLink lesson={RECALL_AQWAS.lesson}>درس « سلسلة عمليات تتضمّن أقواسا »</RecallLink>
                </TextbookBox>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'هل هما متساويان؟', subtitle: 'الخاصية', done: !!q.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'ما قيمة كلّ من الكتابتين؟'}</MathText>}
                options={['كلتاهما $50$ : $5 \\times 10 = 50$ و $30 + 20 = 50$', 'الأولى $50$ والثانية $34$', 'الأولى $30$ والثانية $20$'].map(M)}
                correct={0} cols={1} requires={['tawzi-jam']}
                explain={<MathText>{'$5 \\times (6 + 4) = 5 \\times 10 = 50$ و $5 \\times 6 + 5 \\times 4 = 30 + 20 = 50$ : المساواة صحيحة دائمًا.'}</MathText>}
                onAnswered={answered('b')} />
              {q.b && <KnowledgeBrick id="qaidat-tawzi" lead="نجمع ما فعلناه: ما خاصية توزيع الضرب؟" />}
              {q.b && <TextbookBox kind="property" compact text={KNOWLEDGE.property.text} source={KNOWLEDGE.property.source} />}
              {q.b && <TextbookBox kind="example" compact text={KNOWLEDGE.exampleSum.text} source={KNOWLEDGE.exampleSum.source} />}
              {q.b && <TextbookBox kind="example" compact text={KNOWLEDGE.exampleDiff.text} source={KNOWLEDGE.exampleDiff.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'نشر وتحليل', subtitle: 'اتجاهان للمساواة نفسها', done: !!q.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'الانتقال من $9 \\times 7 + 9 \\times 3$ إلى $9 \\times (7 + 3)$ يسمّى:'}</MathText>}
                options={['تحليلًا', 'نشرًا', 'قسمةً'].map(M)}
                correct={0} cols={3} requires={['qaidat-tawzi']}
                explain={<MathText>{'ننتقل من مجموع إلى جداء بإخراج العامل المشترك $9$ : هذا تحليل. والعكس، من جداء إلى مجموع، هو النشر.'}</MathText>}
                onAnswered={answered('c')} />
              {q.c && <TextbookBox kind="remark" compact text={KNOWLEDGE.names.text} source={KNOWLEDGE.names.source} />}
            </div>
          ),
        },
        {
          num: 4, title: 'العامل المشترك', subtitle: 'في أيّ موضع كان', done: !!q.d,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'ما العامل المشترك في $5 \\times 12 + 3 \\times 12$ ؟'}</MathText>}
                options={['$12$', '$5$', '$3$'].map(M)}
                correct={0} cols={3} requires={['tahlil']}
                explain={<MathText>{'العدد $12$ مكتوب في الجداءين، ولو كان في موضع مختلف: $5 \\times 12 + 3 \\times 12 = (5 + 3) \\times 12 = 96$ .'}</MathText>}
                onAnswered={answered('d')} />
              {q.d && <TextbookBox kind="remark" compact text={KNOWLEDGE.common.text} source={KNOWLEDGE.common.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
