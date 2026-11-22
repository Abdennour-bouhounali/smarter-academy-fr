import { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, GUIDE } from '../content/textbook';
import { desc } from '../content/exercises';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) ; PAS de page « طرائق » dans le manuel pour cette leçon : la méthode est un ajout de la plateforme
 * (`addition('knowledge_formalization')`). Trois enchaînements — décrire une chaîne (dernière opération → nom → pièces), écrire une chaîne d'une phrase SANS parenthèse (la priorité suffit),
 * écrire une chaîne d'une phrase AVEC parenthèse — puis une erreur à reconnaître. La méthode et la brique viennent APRÈS la réponse. LP : P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [r, setR] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const revealed = (k) => () => setR((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أصف سلسلة ثم أحسبها؟', 'متى أكتب القوسين وهل أحتاجهما دائمًا؟', 'كيف أكشف خطأً في كتابة سلسلة من جملتها؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أصف وأكتب"
      moduleSubtitle="آخر عملية أوّلًا، ثم القطعتان"
      estimatedTime="12 دقيقة"
      steps={[
        {
          num: 1, title: 'أصف سلسلة', subtitle: 'ما آخر عملية تُنجز؟', done: !!q.a && !!r.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'في $C = 12 \\times (15 - 9)$ ما آخر عملية تُنجز؟'}</MathText>}
                options={['الضرب', 'الطرح', 'لا توجد'].map(M)}
                correct={0} cols={3} requires={['qaidat-tasmiya']}
                explain={<MathText>{'القوسان يفرضان الطرح أوّلًا ($15 - 9 = 6$) ثم يأتي الضرب $12 \\times 6$ في الأخير.'}</MathText>}
                onAnswered={answered('a')} />
              {q.a && <MethodSteps method={METHOD.describe} onAllRevealed={revealed('a')} />}
              {q.a && <NumericQuestion prompt={<MathText>{'احسب $C$ :'}</MathText>} expected={72} display="72" requires={['qaidat-tasmiya']}
                explain={<MathText>{'$12 \\times 6 = 72$ .'}</MathText>} onAnswered={() => {}} />}
              {q.a && <KnowledgeBrick id="tariqa-wasf" lead="كيف نصف سلسلة بجملة؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'أكتب سلسلة دون قوسين', subtitle: 'متى تكفي الأولوية؟', done: !!q.b && !!r.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'كيف نكتب «مجموع العدد 12 وحاصل قسمة 45 على 9» ؟'}</MathText>}
                options={['$12 + 45 \\div 9$', '$(12 + 45) \\div 9$', '$12 \\div 45 + 9$'].map(M)}
                correct={0} cols={1} requires={['tariqa-wasf']}
                explain={<MathText>{'آخر عملية هي الجمع وحدّه الثاني حاصل قسمة، والقسمة تسبق الجمع بالأولوية فلا حاجة إلى قوسين. الثانية تجمع 12 و 45 قبل القسمة فتصير حاصل قسمة؛ والثالثة تقسم 12 على 45.'}</MathText>}
                onAnswered={answered('b')} />
              {q.b && <MethodSteps method={METHOD.write} onAllRevealed={revealed('b')} />}
              {q.b && <NumericQuestion prompt={<MathText>{'احسب $12 + 45 \\div 9$ :'}</MathText>} expected={17} display="17" requires={['tariqa-wasf']}
                explain={<MathText>{'$45 \\div 9 = 5$ ثم $12 + 5 = 17$ .'}</MathText>} onAnswered={() => {}} />}
            </div>
          ),
        },
        {
          num: 3, title: 'أكتب سلسلة تحتاج قوسين', subtitle: 'متى أضع القوسين؟', done: !!q.c && !!r.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'كيف نكتب «حاصل قسمة مجموع العددين 27 و 9 على 6» ؟'}</MathText>}
                options={['$(27 + 9) \\div 6$', '$27 + 9 \\div 6$', '$6 \\div (27 + 9)$'].map(M)}
                correct={0} cols={1} requires={['tariqa-wasf']}
                explain={<MathText>{'آخر عملية هي القسمة ومقسومها المجموع كلّه، فالمجموع بين قوسين. الثانية تقسم 9 وحدها على 6 فتصير مجموعًا؛ والثالثة تقلب الترتيب.'}</MathText>}
                onAnswered={answered('c')} />
              {q.c && <MethodSteps method={METHOD.bracket} onAllRevealed={revealed('c')} />}
              {q.c && <NumericQuestion prompt={<MathText>{'احسب $(27 + 9) \\div 6$ :'}</MathText>} expected={6} display="6" requires={['tariqa-wasf']}
                explain={<MathText>{'$27 + 9 = 36$ ثم $36 \\div 6 = 6$ .'}</MathText>} onAnswered={() => {}} />}
              {q.c && <KnowledgeBrick id="tariqa-kitaba" lead="كيف نكتب سلسلة من جملتها؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'أين الخطأ؟', subtitle: 'جملتان وكتابتان', done: !!q.d,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<MathText>{'أيّ الكتابتين صحيحة؟'}</MathText>}
                rows={[
                  { id: 'r1', label: <MathText>{'«جداء العدد 4 ومجموع العددين 9 و 6» تُكتب $4 \\times 9 + 6$'}</MathText>, options: ['صحيحة', 'خاطئة'], correct: 1, correction: <MathText>{GUIDE.nobracket.why + ' ' + `الصحيح: $4 \\times (9 + 6) = 60$ ؛ وهو ${desc('4 × (9 + 6)')} .`}</MathText> },
                  { id: 'r2', label: <MathText>{'«فرق العدد 30 وجداء العددين 2 و 7» تُكتب $30 - 2 \\times 7$'}</MathText>, options: ['صحيحة', 'خاطئة'], correct: 0, correction: <MathText>{'آخر عملية هي الطرح وحدّه الثاني جداء يُنجز أوّلًا بالأولوية فلا قوسين: $30 - 14 = 16$ .'}</MathText> },
                ]}
                feedback={({ allRight }) => (allRight ? 'أحسنت: القوسان يحفظان آخر عملية.' : 'راجع: آخر عملية أوّلًا، ثم قوسان لما يجب أن يُحسب قبلها.')}
                onAnswered={answered('d')}
                requires={['tariqa-kitaba']}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
