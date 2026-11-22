import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessonPath } from '@smarter-academy/core';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, RECALL_2AM, RECALL_2AM_AQWAS } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) : simplifier une expression à deux bases
 * (طرائق p. 45, réécrite : 3⁷ × 2⁴ / (2² × 3⁵) = 36), puis la priorité des puissances dans une chaîne (معارف 8, réécrit), le piège
 * −3² / (−3)², et une fraction de دوري الآن ② (réécrite). La méthode et la brique viennent APRÈS la réponse. LP : P3, P4.
 * Étape 2 : après la réponse, un « تذكّر — السنة الثانية » (leçon 2AM `silsila-bidun-aqwas`, publiée 2026-10-29 : avec son lien)
 * rappelle l'ordre des opérations avant la brique `awlawiya-quwa` — rappelé, jamais reconstruit.
 * Étape 4 : après la réponse, un second « تذكّر — السنة الثانية » (leçon 2AM `silsila-bi-aqwas`, publiée 2026-10-29 : avec son lien)
 * rappelle que la barre de fraction groupe le numérateur et le dénominateur.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [read, setRead] = useState(false);
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const year2 = getLessonPath(RECALL_2AM.lesson);
  const year2Aqwas = getLessonPath(RECALL_2AM_AQWAS.lesson);
  return (
    <ContentModule
      objectives={['كيف أبسّط عبارة فيها قوى لأساسين؟', 'بأيّ ترتيب أحسب سلسلة فيها قوى؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أبسّط وأحسب بالأولويات"
      moduleSubtitle="أساسان في عبارة واحدة · القوى قبل الضرب"
      estimatedTime="11 دقيقة"
      steps={[
        {
          num: 1, title: 'كيف نبسّط عبارة فيها أساسان؟', subtitle: 'دون حساب كل قوة', done: !!q.a && read,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'$A = \\frac{3^7 \\times 2^4}{2^2 \\times 3^5}$ . أيّ كتابة تساوي $A$ ؟'}</MathText>}
                options={[M('$3^2 \\times 2^2 = 36$'), M('$3^{12} \\times 2^{6}$'), M('$6^{4}$')]}
                correct={0} cols={3} requires={['hasil-quwatayn']}
                explain={<MathText>{'نجمع قوى الأساس نفسه: $\\frac{3^7}{3^5} \\times \\frac{2^4}{2^2} = 3^2 \\times 2^2 = 36$ . ($3^{12}$ جمع الأسين بدل طرحهما، و $6^4$ يخلط بين الأساسين.)'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <MethodSteps method={METHOD.simplify} onAllRevealed={() => setRead(true)} />}
              {q.a && <KnowledgeBrick id="tariqat-tabsit" lead="عبارة فيها أساسان: ماذا نفعل أوّلًا؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'بأيّ ترتيب نحسب؟', subtitle: 'قوة داخل سلسلة', done: !!q.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'احسب: $5 - 2 \\times (-3)^2$'}</MathText>}
                options={[M('$-13$'), M('$27$'), M('$-31$'), M('$23$')]}
                correct={0} cols={4} requires={['ishara-quwa']}
                explain={<MathText>{`${METHOD.priority.example} . ($27$ تبدأ بـ $5 - 2$ ، و $-31$ تضرب قبل القوة، و $23$ تنسى الإشارة.)`}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && (
                <TextbookBox kind="remark" title={RECALL_2AM.title} text={RECALL_2AM.text} source={RECALL_2AM.source} compact>
                  {year2 && <Link to={year2} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>درس « سلسلة عمليات دون أقواس » (السنة الثانية)</Link>}
                </TextbookBox>
              )}
              {q.b && <KnowledgeBrick id="awlawiya-quwa" lead="في سلسلة حسابات: متى نحسب القوى؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'هل الأس يشمل الإشارة؟', subtitle: 'سالب ثلاثة مربّع أم مربّع سالب ثلاثة', done: !!q.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'احسب: $-3^2 + (-3)^2$'}</MathText>}
                options={[M('$0$'), M('$18$'), M('$-18$')]}
                correct={0} cols={3} requires={['awlawiya-quwa']}
                explain={<MathText>{`${METHOD.priority.minus} إذن $-9 + 9 = 0$ .`}</MathText>}
                onAnswered={answered('c')}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'كسر بسطه ومقامه سلسلتان', subtitle: 'كل سلسلة بأولوياتها', done: !!q.d,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{`احسب: $${METHOD.chain.tex}$`}</MathText>}
                options={[M('$18$'), M('$36$'), M('$3$')]}
                correct={0} cols={3} requires={['awlawiya-quwa']}
                explain={<MathText>{'البسط: $4^2 - 2 \\times 5 = 16 - 10 = 6$ ثم $6^2 = 36$ . المقام: $11 - 3^2 = 11 - 9 = 2$ . إذن $\\frac{36}{2} = 18$ . ($36$ تنسى المقام، و $3$ تنسى القوة.)'}</MathText>}
                onAnswered={answered('d')}
              />
              {q.d && (
                <TextbookBox kind="remark" title={RECALL_2AM_AQWAS.title} text={RECALL_2AM_AQWAS.text} source={RECALL_2AM_AQWAS.source} compact>
                  {year2Aqwas && <Link to={year2Aqwas} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>درس « سلسلة عمليات تتضمّن أقواسا » (السنة الثانية)</Link>}
                </TextbookBox>
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
