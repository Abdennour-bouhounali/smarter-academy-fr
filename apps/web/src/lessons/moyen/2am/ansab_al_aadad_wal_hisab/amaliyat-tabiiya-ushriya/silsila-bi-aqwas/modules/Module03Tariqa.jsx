import { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, KNOWLEDGE, GUIDE } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) ; elle suit la page 11 du manuel (parenthèses imbriquées, barre de fraction) et la page 21 (la
 * calculatrice), avec les nombres de la plateforme. Trois enchaînements — des parenthèses imbriquées de l'intérieur, une barre sans barre, les touches pour la calculatrice — puis deux erreurs à
 * reconnaître. La méthode et la brique viennent APRÈS la réponse. LP : P2, P3, P4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [r, setR] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const revealed = (k) => () => setR((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['بأيّ قوس أبدأ؟', 'كيف أكتب كسرًا دون خطّ الكسر؟', 'ما الأزرار التي أحجزها على الآلة؟', 'كيف أكشف خطأً في الأقواس؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — من الداخل إلى الخارج"
      moduleSubtitle="نكتب كلّ مرحلة في سطر"
      estimatedTime="12 دقيقة"
      steps={[
        {
          num: 1, title: 'بأيّ قوسين نبدأ؟', subtitle: 'الأقواس المتداخلة', done: !!q.a && !!r.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'في $A = 4 \\times [18 - (2 + 3) \\times 3]$ ما أوّل ما نحسبه؟'}</MathText>}
                options={['$2 + 3$', '$18 - 2$', '$3 \\times 3$'].map(M)}
                correct={0} cols={3} requires={['qaidat-aqwas']}
                explain={<MathText>{'القوس الداخلي أوّلًا: $(2 + 3) = 5$ ، فيصير $A = 4 \\times [18 - 5 \\times 3]$ .'}</MathText>}
                onAnswered={answered('a')} />
              {q.a && <MethodSteps method={METHOD.nested} onAllRevealed={revealed('a')} />}
              {q.a && <KnowledgeBrick id="tariqa-mutadakhila" lead="كيف نحسب أقواسًا متداخلة مرحلة بعد مرحلة؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'كسر دون خطّ الكسر', subtitle: 'قوسان للمقام', done: !!q.b && !!r.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'كيف نكتب $B = \\dfrac{54}{4 \\times 3 - 3} + 2$ دون خطّ الكسر؟'}</MathText>}
                options={['$54 \\div (4 \\times 3 - 3) + 2$', '$54 \\div 4 \\times 3 - 3 + 2$', '$54 \\div (4 \\times 3 - 3 + 2)$'].map(M)}
                correct={0} cols={1} requires={['qaidat-aqwas']}
                explain={<MathText>{'المقام هو $4 \\times 3 - 3$ وحده، أمّا $+ 2$ فخارج الكسر. الثالثة أدخلت $+ 2$ في المقام؛ والثانية لا أقواس فيها.'}</MathText>}
                onAnswered={answered('b')} />
              {q.b && <MethodSteps method={METHOD.bar} onAllRevealed={revealed('b')} />}
              {q.b && <NumericQuestion prompt={<MathText>{'احسب $B$ :'}</MathText>} expected={8} display="8" requires={['qaidat-aqwas']}
                explain={<MathText>{'$54 \\div 9 + 2 = 6 + 2 = 8$ .'}</MathText>} onAnswered={() => {}} />}
            </div>
          ),
        },
        {
          num: 3, title: 'ما الأزرار التي نحجزها؟', subtitle: 'كلّ قوس نحتاجه', done: !!q.c && !!r.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'أيّ الأزرار تحسب $\\dfrac{72}{5 + 7}$ على الآلة؟'}</MathText>}
                options={['$72 \\div ( 5 + 7 ) =$', '$72 \\div 5 + 7 =$', '$( 72 \\div 5 ) + 7 =$'].map(M)}
                correct={0} cols={1} requires={['tariqa-mutadakhila']}
                explain={<MathText>{'المقام $5 + 7$ كلّه يجب أن يُحسب قبل القسمة: $72 \\div 12 = 6$ . الثانية تعطي $21{,}4$ والثالثة أيضًا.'}</MathText>}
                onAnswered={answered('c')} />
              {q.c && <MethodSteps method={METHOD.keys} onAllRevealed={revealed('c')} />}
              {q.c && <TextbookBox kind="remark" compact text={KNOWLEDGE.calculator.text} source={KNOWLEDGE.calculator.source} />}
              {q.c && <KnowledgeBrick id="tariqa-khatt-kasr-alat" lead="كيف نحجز كسرًا على الآلة؟" />}
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
                  { id: 'r1', label: <MathText>{'$30 - (12 + 6) = 24$'}</MathText>, options: ['صحيحة', 'خاطئة'], correct: 1, correction: <MathText>{GUIDE.ignored.why + ' ' + '$30 - (12 + 6) = 30 - 18 = 12$ .'}</MathText> },
                  { id: 'r2', label: <MathText>{'$\\dfrac{20 + 4}{8 - 2} = 20 + 4 \\div 8 - 2$'}</MathText>, options: ['صحيحة', 'خاطئة'], correct: 1, correction: <MathText>{GUIDE.barsplit.why + ' ' + '$\\dfrac{20 + 4}{8 - 2} = (20 + 4) \\div (8 - 2) = 4$ .'}</MathText> },
                ]}
                feedback={({ allRight }) => (allRight ? 'أحسنت: القوسان يغيّران ما تحسبه الآلة أوّلًا.' : 'راجع: ما بين القوسين أوّلًا، وللبسط والمقام قوساهما.')}
                onAnswered={answered('d')}
                requires={['qaidat-aqwas']}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
