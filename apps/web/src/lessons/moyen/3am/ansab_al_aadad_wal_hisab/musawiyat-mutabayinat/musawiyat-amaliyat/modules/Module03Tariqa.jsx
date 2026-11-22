import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, BatchChoiceQuestion } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, GUIDE } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) : transformer une égalité donnée et juger qu'une autre en
 * découle ou non, SANS chercher x (طرائق p. 75, réécrite, autres nombres). La méthode et la brique viennent APRÈS la réponse. LP : P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [r1, setR1] = useState(false);
  const [r2, setR2] = useState(false);
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أتحقّق من مساواة انطلاقًا من أخرى؟', 'ماذا أفعل بكل حدود الطرف عند الضرب؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أحوّل مساواة وأحكم عليها"
      moduleSubtitle="دون البحث عن x"
      estimatedTime="10 دقائق"
      steps={[
        {
          num: 1, title: 'أيّ المساواتين صحيحة؟', subtitle: 'الجمع والطرح', done: !!q.a && r1,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<MathText>{'$x$ عدد ناطق حيث $5 = 3x - 1$ . حكم على كل مساواة:'}</MathText>}
                rows={[
                  { id: 'r1', label: '$4 = 3x - 2$', options: ['صحيحة', 'خاطئة'], correct: 0, correction: 'نطرح $1$ من طرفي $5 = 3x - 1$ : $4 = 3x - 2$ .' },
                  { id: 'r2', label: '$3x + 2 = 5$', options: ['صحيحة', 'خاطئة'], correct: 1, correction: 'نضيف $3$ إلى طرفي $5 = 3x - 1$ : $8 = 3x + 2$ ، فـ $3x + 2 = 5$ خاطئة.' },
                ]}
                feedback={({ allRight }) => (allRight ? 'أحسنت: ننتقل من المساواة المعطاة إلى المطلوبة بعملية على الطرفين.' : 'راجع: العملية نفسها تقود من المعطاة إلى مساواة واحدة فقط.')}
                onAnswered={answered('a')}
                requires={['musawat-jam']}
              />
              {q.a && <MethodSteps method={METHOD.transform} onAllRevealed={() => setR1(true)} />}
              {q.a && <KnowledgeBrick id="tahwil" lead="كيف نحكم على مساواة جديدة انطلاقًا من مساواة معطاة؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ماذا نفعل بكل الحدود عند الضرب؟', subtitle: 'الضرب والقسمة', done: !!q.b && r2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'$x$ عدد ناطق حيث $2x + 3 = 7$ . أيّ المساواتين صحيحة: $-4x - 6 = -14$ أم $4x + 3 = 14$ ؟'}</MathText>}
                options={[M('$-4x - 6 = -14$ فقط'), M('$4x + 3 = 14$ فقط'), M('كلتاهما')]}
                correct={0} cols={1} requires={['musawat-darb']}
                explain={<MathText>{`${GUIDE.allTerms.right} وفي المساواة الثانية لم نضرب $3$ في $2$ .`}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <MethodSteps method={METHOD.scale} onAllRevealed={() => setR2(true)} />}
              {q.b && <KnowledgeBrick id="hukm" lead="عند الضرب في عدد: على أيّ حدود نطبّقه؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'هل نستنتج المساواة بالعادة؟', subtitle: 'مساواة لا تنتج', done: !!q.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'من $10 = 4x - 2$ هل نستنتج $4x = 5$ ؟'}</MathText>}
                options={[M('لا: بإضافة $2$ إلى الطرفين نجد $12 = 4x$'), M('نعم: لأنّنا أضفنا عددًا إلى الطرفين'), M('نعم: لأنّ $10 \\div 2 = 5$')]}
                correct={0} cols={1} requires={['tahwil']}
                explain={<MathText>{GUIDE.notFollow.why}</MathText>}
                onAnswered={answered('c')}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
