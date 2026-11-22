import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, GUIDE } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) ; le manuel n'a pas de méthode pour la division (ses طرائق p. 27 sont celles de la
 * comparaison et de la somme) : ce module est un ajout déclaré (`addition('knowledge_formalization')`). Il pose trois enchaînements — simplifier AVANT de multiplier, la
 * fraction composée, la division par un naturel et d'un naturel par une fraction — puis deux erreurs à reconnaître (retourner le premier, 0,33 prétendu مقلوب de 3).
 * La méthode et la brique viennent APRÈS la réponse. LP : P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [r, setR] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const revealed = (k) => () => setR((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['أيّ العوامل أختزل قبل الضرب؟', 'كيف أحسب كسرًا مركّبًا؟', 'كيف أقسم على عدد طبيعي أو أقسم عددًا على كسر؟', 'كيف أكشف خطأً في القسمة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — الاختزال قبل الضرب"
      moduleSubtitle="قسمة كسرين بطريقة سريعة"
      estimatedTime="11 دقيقة"
      steps={[
        {
          num: 1, title: 'ما العوامل التي نختزلها؟', subtitle: 'قبل أن نضرب', done: !!q.a && !!r.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'بعد كتابة $\\frac{14}{15} \\div \\frac{21}{10} = \\frac{14}{15} \\times \\frac{10}{21}$ ، أيّ العاملين نحذفهما قبل الضرب؟'}</MathText>}
                options={[M('$7$ و $5$'), M('$14$ و $15$'), M('$21$ و $10$')]}
                correct={0} cols={3} requires={['qismat-kasrayn']}
                explain={<MathText>{'$14 = 2 \\times 7$ و $21 = 3 \\times 7$ فنحذف $7$ ؛ $10 = 2 \\times 5$ و $15 = 3 \\times 5$ فنحذف $5$ . الناتج $\\frac{2 \\times 2}{3 \\times 3} = \\frac{4}{9}$ .'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <MethodSteps method={METHOD.simplify} onAllRevealed={revealed('a')} />}
              {q.a && <KnowledgeBrick id="ikhtizal-qabl" lead="قبل أن نضرب في المقلوب: كيف نتجنّب الأعداد الكبيرة؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'كسر فوق كسر', subtitle: 'الكسر المركّب', done: !!q.b && !!r.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'اكتب الكسر المركّب $\\dfrac{\\frac{3}{4}}{\\frac{9}{8}}$ على شكل قسمة ثم احسبه:'}</MathText>}
                options={[M('$\\frac{2}{3}$'), M('$\\frac{27}{32}$'), M('$\\frac{3}{2}$')]}
                correct={0} cols={3} requires={['qismat-kasrayn']}
                explain={<MathText>{'$\\frac{3}{4} \\div \\frac{9}{8} = \\frac{3}{4} \\times \\frac{8}{9} = \\frac{2}{3}$ . ($\\frac{27}{32}$ نسي القلب؛ $\\frac{3}{2}$ قلب الكسر الخطأ.)'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <MethodSteps method={METHOD.compound} onAllRevealed={revealed('b')} />}
            </div>
          ),
        },
        {
          num: 3, title: 'القسمة على عدد طبيعي وعلى كسر', subtitle: 'عددان لا يُشبهان الكسر', done: !!q.c && !!r.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'احسب $\\dfrac{\\frac{5}{6}}{10}$ :'}</MathText>}
                options={[M('$\\frac{1}{12}$'), M('$\\frac{25}{3}$'), M('$12$')]}
                correct={0} cols={3} requires={['qisma-darb']}
                explain={<MathText>{'القسمة على $10$ هي الضرب في $\\frac{1}{10}$ : $\\frac{5}{6} \\times \\frac{1}{10} = \\frac{1}{12}$ .'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <MethodSteps method={METHOD.natural} onAllRevealed={revealed('c')} />}
            </div>
          ),
        },
        {
          num: 4, title: 'أين الخطأ؟', subtitle: 'عبارتان مغلوطتان', done: !!q.d,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<MathText>{'أيّ العبارتين صحيحة؟'}</MathText>}
                rows={[
                  { id: 'r1', label: <MathText>{'$\\frac{2}{9} \\div \\frac{3}{4} = \\frac{9}{2} \\times \\frac{3}{4}$'}</MathText>, options: ['صحيحة', 'خاطئة'], correct: 1, correction: <MathText>{GUIDE.flipFirst.why + ' ' + GUIDE.flipFirst.right}</MathText> },
                  { id: 'r2', label: <MathText>{'$0{,}33$ هو مقلوب $3$'}</MathText>, options: ['صحيحة', 'خاطئة'], correct: 1, correction: <MathText>{GUIDE.approx.why}</MathText> },
                ]}
                feedback={({ allRight }) => (allRight ? 'أحسنت: نقلب المقسوم عليه وحده، والمقلوب الصحيح جداؤه مع العدد $1$ تمامًا.' : 'راجع: نقلب الكسر الثاني فقط، ونتحقّق بالجداء $1$ .')}
                onAnswered={answered('d')}
                requires={['maqlub']}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
