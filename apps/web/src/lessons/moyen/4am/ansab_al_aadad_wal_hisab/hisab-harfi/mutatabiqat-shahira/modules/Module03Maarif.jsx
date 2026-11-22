import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE, PLATFORM } from '../content/textbook';

/**
 * Module 3 — معارف 2 (p. 34) : la définition d'une متطابقة, les trois
 * identités et trois exemples (ceux de la PLATEFORME depuis le rollout du 2026-11-11 — indépendance du manuel, SHARED-deliberate). Les identités, établies aux
 * modules 1 et 2, reviennent en RAPPEL (`variant="rappel"`) ; la seule
 * connaissance NOUVELLE ici est la définition (« صحيحة من أجل كل القيم »),
 * posée par sa brique AVANT la question qui l'exige — et cette question se
 * tranche par un contre-exemple. Chaque exemple du manuel est d'abord une
 * question ; l'exemple devient la correction. LP : P1, P2, P3.
 *
 * Rétrofit 2026-10-15 (§4quater) : la brique `mutatabiqa` (la définition) vient APRÈS la question du contre-exemple (elle la
 * donnait) ; la question ne `requires` plus que l'expérience du labo. La carte du haut dit ce qu'est le module, sans énoncer la
 * définition. L'étape 2 (rappel des trois identités établies aux modules 1–2, puis l'application) reste telle quelle.
 */
const m = (tex) => <MathText key={tex}>{tex}</MathText>;
const KINDS = ['مربع مجموع', 'مربع فرق', 'جداء مجموع حدين وفرقهما'];

export default function Module03Maarif() {
  const [d, setD] = useState({});
  const done = (k) => () => setD((s) => ({ ...s, [k]: true }));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      objectives={["متى نسمّي مساواة فيها حروف «متطابقة»؟", "ما المتطابقات الشهيرة الثلاث؟", "كيف نتعرّف على نوع العبارة قبل نشرها؟"]}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="معارف — المتطابقات الشهيرة"
      moduleSubtitle="المتطابقة، والمتطابقات الثلاث"
      estimatedTime="7 دقائق"
      brief={{
        tag: 'معارف', title: KNOWLEDGE.title, tone: 'violet',
        body: <p>ثلاث خطوات: تسمية ما تحقّقت منه في الملعب، ثم الوقوف عند صيغه الثلاث بأمثلة، ثم التعرّف على نوع كل عبارة قبل نشرها.</p>,
      }}
      steps={[
        {
          num: 1, title: 'تعريف المتطابقة', done: !!d.def,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>في الملعب كنتَ تتحقّق من أجل قيمتين لـ <MathText>{'$x$'}</MathText> على الأقل. المساواة <MathText>{'$(x + 1)^2 = x^2 + 1$'}</MathText> صحيحة من أجل <MathText>{'$x = 0$'}</MathText>. هل تكفي هذه القيمة لقبولها؟</span>}
                options={[
                  'نعم: هي صحيحة من أجل $x = 0$',
                  'لا: من أجل $x = 1$ نجد $(1 + 1)^2 = 4$ و $1^2 + 1 = 2$',
                  'نعم: كل مساواة فيها حرف تبقى صحيحة',
                ].map(m)}
                correct={1}
                cols={1}
                explain={<span>المساواة تُقبل إذا كانت صحيحة من أجل <strong>كل</strong> القيم؛ قيمة واحدة لا تكفي لإثباتها، وقيمة واحدة تكفي لنفيها. والنشر الصحيح: <MathText>{'$(x + 1)^2 = x^2 + 2x + 1$'}</MathText>.</span>}
                onAnswered={done('def')}
              />
              {d.def && <KnowledgeBrick id="mutatabiqa" lead="ما تحقّقت منه على الملعب من أجل كل قيمة لـ x له اسم:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'المتطابقات الشهيرة الثلاث', subtitle: 'ثلاثة أمثلة', done: !!d.ex,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-700"><MathText>{KNOWLEDGE.remarkable}</MathText></p>
              <KnowledgeBrick id="murabba-majmu" variant="rappel" compact />
              <KnowledgeBrick id="murabba-farq" variant="rappel" compact />
              <KnowledgeBrick id="jidaa-majmu-farq" variant="rappel" compact />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">انشر مستعملًا المتطابقة المناسبة:</p>}
                rows={[
                  { id: 'k1', label: m('$(3x + 4)^2 =$'), options: ['$9x^2 + 16$', '$9x^2 + 24x + 16$', '$3x^2 + 24x + 16$'].map(m), correct: 1 },
                  { id: 'k2', label: m('$(5 - 2x)^2 =$'), options: ['$25 - 20x + 4x^2$', '$25 - 10x + 4x^2$', '$25 - 4x^2$'].map(m), correct: 0 },
                  { id: 'k3', label: m('$(4x - 1)(4x + 1) =$'), options: ['$4x^2 - 1$', '$16x^2 + 1$', '$16x^2 - 1$'].map(m), correct: 2 },
                ]}
                requires={['murabba-majmu', 'murabba-farq', 'jidaa-majmu-farq']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>الأمثلة الثلاثة أدناه، بكل خطواتها.</Feedback>}
                onAnswered={done('ex')}
              />
              {d.ex && <TextbookBox kind="example" lines={PLATFORM.examples} compact />}
            </div>
          ),
        },
        {
          num: 3, title: 'أيّ متطابقة؟', subtitle: 'نتعرّف على نوع المتطابقة قبل النشر', done: !!d.kind,
          content: (
            <BatchChoiceQuestion
              intro={<p className="text-sm font-semibold text-slate-700">ما نوع كل عبارة؟</p>}
              rows={[
                { id: 't1', label: m('$(7 - 3x)^2$'), options: KINDS, correct: 1 },
                { id: 't2', label: m('$(x + \\sqrt{2})(x - \\sqrt{2})$'), options: KINDS, correct: 2 },
                { id: 't3', label: m('$(0{,}5 + 4x)^2$'), options: KINDS, correct: 0 },
                { id: 't4', label: m('$(x - 1)(x - 1)$'), options: KINDS, correct: 1, correction: m('$(x - 1)(x - 1) = (x - 1)^2$ : العاملان متساويان.') },
              ]}
              requires={['mutatabiqa', 'murabba-majmu', 'murabba-farq', 'jidaa-majmu-farq']}
              feedback={({ allRight }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  مربّع: العاملان متساويان؛ جداء مجموع وفرق: نفس الحدّين بإشارتين مختلفتين بينهما.
                </Feedback>
              )}
              onAnswered={done('kind')}
            />
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
