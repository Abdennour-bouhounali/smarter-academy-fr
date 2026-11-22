import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, GUIDE } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) : les étapes d'une résolution (طرائق p. 77, réécrite : 6x − 5 =
 * 2x + 7, x = 3), la MISE EN ÉQUATION d'une situation (3 stylos et un cahier / 5 stylos et un retour, x = 30), puis ce qu'on fait après la résolution
 * (déclarer et vérifier DANS l'histoire). La méthode et la brique viennent APRÈS la réponse. LP : P3, P4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [r1, setR1] = useState(false);
  const [r2, setR2] = useState(false);
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أحلّ معادلة مرحلةً مرحلة؟', 'كيف أكتب معادلة من مشكلة؟', 'ماذا أفعل بعد الحلّ؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أحلّ وأرييض"
      moduleSubtitle="مراحل الحلّ وترييض مشكلة"
      estimatedTime="11 دقيقة"
      steps={[
        {
          num: 1, title: 'ما حلّ $6x - 5 = 2x + 7$ ؟', subtitle: 'مراحل الحلّ', done: !!q.a && r1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'احسب حلّ المعادلة $6x - 5 = 2x + 7$ :'}</MathText>}
                options={[M('$3$'), M('$12$'), M('$\\frac{1}{2}$')]}
                correct={0} cols={3} requires={['naql-hadd']}
                explain={<MathText>{`نجمع حدود $x$ ثم الأعداد: $4x = 12$ ، $x = 3$ . ($12$ تنسى القسمة على $4$ ، و $\\frac{1}{2}$ تقسم $2$ على $4$ .)`}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <MethodSteps method={METHOD.solve} onAllRevealed={() => setR1(true)} />}
              {q.a && <KnowledgeBrick id="tariqat-hall" lead="مرحلةً مرحلة: كيف نحلّ معادلة من الشكل ax + b = cx + d ؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'أيّ معادلة تترجم المشكلة؟', subtitle: 'ترييض مشكلة', done: !!q.b && r2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'ثمن القلم $x$ دج. دفع محسن ثمن $3$ أقلام وكرّاسة ثمنها $40$ دج ، ودفعت نور ثمن $5$ أقلام ثم استردّت $20$ دج ، فدفعا المبلغ نفسه. أيّ معادلة تترجم ذلك؟'}</MathText>}
                options={[M('$3x + 40 = 5x - 20$'), M('$3x - 40 = 5x + 20$'), M('$3x + 40 = 5x + 20$')]}
                correct={0} cols={1} requires={['qisma-muamil']}
                explain={<MathText>{'محسن: $3x + 40$ . نور دفعت $5x$ ثم استردّت $20$ فدفعت $5x - 20$ . المبلغان متساويان.'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <MethodSteps method={METHOD.model} onAllRevealed={() => setR2(true)} />}
              {q.b && <KnowledgeBrick id="tarhiq-mushkila" lead="مشكلة بكلمات: كيف نصل إلى معادلة وإلى جواب؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'ماذا نفعل بعد أن نحلّ المعادلة؟', subtitle: 'التصريح والتحقق', done: !!q.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="وجدنا $x = 30$ في مشكلة الأقلام. ماذا نفعل الآن؟"
                options={[
                  'نصرّح بأنّ ثمن القلم $30$ دج ونتحقق منه في نص المشكلة',
                  'ننتهي: وجدنا $x$',
                  'نغيّر المعطيات لنجد عددًا أجمل',
                ].map(M)}
                correct={0} cols={1} requires={['tariqat-hall']}
                explain={<MathText>{GUIDE.unit.why}</MathText>}
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
