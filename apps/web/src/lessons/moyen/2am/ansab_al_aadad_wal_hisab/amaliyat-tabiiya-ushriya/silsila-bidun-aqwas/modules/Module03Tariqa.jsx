import { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, GUIDE } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) ; la page 11 du manuel est celle des parenthèses (leçon suivante) : ce module est un ajout déclaré
 * (`addition('knowledge_formalization')`). Il pose trois enchaînements — encadrer × ÷ puis calculer de gauche à droite, une suite × ÷ seule, traduire une histoire par une chaîne — puis
 * deux erreurs à reconnaître. La méthode et la brique viennent APRÈS la réponse. LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [r, setR] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const revealed = (k) => () => setR((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['أيّ العمليتين أحيط أوّلًا؟', 'كيف أحسب سلسلة ضرب وقسمة وطرحًا؟', 'كيف أترجم وضعية بسلسلة؟', 'كيف أكشف خطأً في الحساب؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — مرحلة بعد مرحلة"
      moduleSubtitle="نكتب كلّ مرحلة في سطر"
      estimatedTime="11 دقيقة"
      steps={[
        {
          num: 1, title: 'ما العمليتان اللتان تُجريان أوّلًا؟', subtitle: 'نحيط الضرب والقسمة', done: !!q.a && !!r.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'في $D = 4{,}5 + 2 \\times 8 - 27 \\div 9$ ، ما العمليتان اللتان تُجريان أوّلًا؟'}</MathText>}
                options={['$2 \\times 8$ و $27 \\div 9$', '$4{,}5 + 2$', '$8 - 27$'].map(M)}
                correct={0} cols={1} requires={['awlawiya']}
                explain={<MathText>{'الضرب والقسمة قبل الجمع والطرح: $2 \\times 8 = 16$ و $27 \\div 9 = 3$ ، فنحصل على $4{,}5 + 16 - 3$ .'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <MethodSteps method={METHOD.priority} onAllRevealed={revealed('a')} />}
              {q.a && <KnowledgeBrick id="tariqa-marahil" lead="كيف نرتّب الحساب في أسطر؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'قسمة ثم ضرب ثم طرح', subtitle: 'اليسار أوّلًا', done: !!q.b && !!r.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'احسب $E = 100 - 36 \\div 4 \\times 3$ :'}</MathText>}
                options={[M('$73$'), M('$48$'), M('$97$')]}
                correct={0} cols={3} requires={['yasar-yamin-darb']}
                explain={<MathText>{'$36 \\div 4 = 9$ ثم $9 \\times 3 = 27$ ثم $100 - 27 = 73$ . (48 طرح $36$ أوّلًا من 100؛ و97 ضرب $4 \\times 3$ أوّلًا.)'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <MethodSteps method={METHOD.mulDivOnly} onAllRevealed={revealed('b')} />}
            </div>
          ),
        },
        {
          num: 3, title: 'كم بقي مع سمير؟', subtitle: 'من وضعية إلى سلسلة', done: !!q.c && !!r.c,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'اشترى سمير 3 كراريس بـ $45$ DA للكرّاس وقلمًا بـ $25$ DA ، ودفع $200$ DA . احسب $200 - 3 \\times 45 - 25$ ، أي ما بقي معه بالدينار:'}</MathText>}
                expected={40} display="40" requires={['tariqa-marahil']}
                explain={<MathText>{'$3 \\times 45 = 135$ ، ثم $200 - 135 = 65$ ، ثم $65 - 25 = 40$ .'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <MethodSteps method={METHOD.translate} onAllRevealed={revealed('c')} />}
              {q.c && <KnowledgeBrick id="tarjama-silsila" lead="كيف نكتب سلسلة من وضعية؟" />}
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
                  { id: 'r1', label: <MathText>{'$5 + 4 \\times 3 = 27$'}</MathText>, options: ['صحيحة', 'خاطئة'], correct: 1, correction: <MathText>{GUIDE.nopriority.why + ' ' + '$5 + 4 \\times 3 = 5 + 12 = 17$ .'}</MathText> },
                  { id: 'r2', label: <MathText>{'$30 - 12 + 6 = 12$'}</MathText>, options: ['صحيحة', 'خاطئة'], correct: 1, correction: <MathText>{'$30 - 12 = 18$ ثم $18 + 6 = 24$ . ' + GUIDE.addfirst.why}</MathText> },
                ]}
                feedback={({ allRight }) => (allRight ? 'أحسنت: الضرب أوّلًا، ثم من اليسار نحو اليمين.' : 'راجع: نحيط الضرب والقسمة أوّلًا، ونحسب ما بقي من اليسار.')}
                onAnswered={answered('d')}
                requires={['awlawiya']}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
