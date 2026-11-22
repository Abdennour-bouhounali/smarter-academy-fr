import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) : choisir la graduation qui convient à quatre nombres (la plateforme écrit la
 * طريقة : le manuel n'en a pas pour cette compétence), lire une abscisse sur une graduation fine (0,25), placer −1,25 sur la même droite. La méthode et la brique
 * viennent APRÈS la réponse. LP : P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [read, setRead] = useState(false);
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أختار تدريجة تناسب أربعة أعداد؟', 'كيف أقرأ فاصلة نقطة على تدريج دقيق؟', 'كيف أضع عددًا عشريًا على المستقيم؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أختار تدريجة مناسبة"
      moduleSubtitle="أبعد عدد ثم التحقّق من كل نقطة"
      estimatedTime="10 دقائق"
      steps={[
        {
          num: 1, title: 'ما التدريجة المناسبة؟', subtitle: 'أربع نقط وستّ تدريجات', done: !!q.a && read,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'نريد وضع النقط ذات الفواصل $-30$ ؛ $45$ ؛ $60$ ؛ $-15$ على مستقيم فيه $6$ تدريجات في كل جهة من المبدأ. أيّ تدريجة تناسبها؟'}</MathText>}
                options={[M('$15$'), M('$5$'), M('$10$')]}
                correct={0} cols={3} requires={['ikhtiyar-tadrij']}
                explain={<MathText>{'$60\\div 15=4$ داخل المستقيم، و $45\\div 15=3$ ، و $-30\\div 15=-2$ ، و $-15\\div 15=-1$ : كلّها على تدريجات. مع $5$ تبعد $60$ اثنتي عشرة تدريجة، ومع $10$ تقع $45$ بين تدريجتين.'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <MethodSteps method={METHOD.choose} onAllRevealed={() => setRead(true)} />}
              {q.a && <KnowledgeBrick id="tariqa-tadrij" lead="أختار تدريجة تناسب أعدادًا معلومة: من أيّ شيء أبدأ؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'كيف أقرأ على تدريج دقيق؟', subtitle: 'التدريجة 0,25', done: !!q.b,
          content: (
            <TapQuestion
              prompt={<MathText>{'مستقيم تدريجته $0{,}25$ . نقطة تبعد عن المبدأ بثلاث تدريجات إلى اليسار. ما فاصلتها؟'}</MathText>}
              options={[M('$-0{,}75$'), M('$-3$'), M('$0{,}75$')]}
              correct={0} cols={3} requires={['faasila']}
              explain={<MathText>{METHOD.fine.read}</MathText>}
              onAnswered={answered('b')}
            />
          ),
        },
        {
          num: 3, title: 'كيف أضع عددًا عشريًا؟', subtitle: 'وضع $-1{,}25$', done: !!q.c,
          content: (
            <TapQuestion
              prompt={<MathText>{'على المستقيم نفسه نريد وضع النقطة $-1{,}25$ . كم تدريجة نعدّ، وإلى أيّ جهة؟'}</MathText>}
              options={[M('خمس تدريجات إلى اليسار'), M('خمس تدريجات إلى اليمين'), M('تدريجة واحدة إلى اليسار')]}
              correct={0} cols={1} requires={['faasila']}
              explain={<MathText>{METHOD.fine.place}</MathText>}
              onAnswered={answered('c')}
            />
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
