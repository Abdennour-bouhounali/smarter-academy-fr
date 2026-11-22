import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, GUIDE } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) : trois emplois des propriétés — déduire une inégalité d'une autre
 * (jusqu'à « x seul »), comparer deux expressions (deux valeurs, une conjecture, puis la preuve par le signe de A − B rappelé), encadrer ax + b (طرائق p. 75 et
 * ex-19, réécrits, autres nombres). La méthode et la brique viennent APRÈS la réponse. LP : P4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [r, setR] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const revealed = (k) => () => setR((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أستنتج متباينة من أخرى؟', 'كيف أقارن عبارتين؟', 'كيف أحصر عبارة من الشكل ax + b ؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أستنتج وأقارن وأحصر"
      moduleSubtitle="ثلاث طرائق بخواص واحدة"
      estimatedTime="11 دقيقة"
      steps={[
        {
          num: 1, title: 'كيف أستنتج متباينة من أخرى؟', subtitle: 'خطوة خطوة', done: !!q.a && !!r.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={M('$x>4$ . ما المتباينة التي يحقّقها $-3x+5$ ؟')}
                options={[M('$-3x+5<-7$'), M('$-3x+5>-7$'), M('$-3x+5<-12$'), M('$-3x+5>-12$')]}
                correct={0} cols={2} requires={['darb-salib']}
                explain={<MathText>{`نضرب في $-3$ فينعكس الاتجاه: $-3x<-12$ ، ثم نضيف $5$ : $-3x+5<-7$ . ${GUIDE.negNoFlip.why}`}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <MethodSteps method={METHOD.deduce} onAllRevealed={revealed('a')} />}
              {q.a && <KnowledgeBrick id="istintaj" lead="كيف نستنتج متباينة من أخرى، وماذا نفعل بالعدد السالب؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'كيف أقارن عبارتين؟', subtitle: 'تخمين ثم برهان', done: !!q.b && !!q.c && !!r.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={M('$x>2$ ، $A=4x+1$ ، $B=2x+5$ . من أجل $x=3$ : $A=13$ و $B=11$ ؛ ومن أجل $x=\\frac{5}{2}$ : $A=11$ و $B=10$ . ما تخمينك؟')}
                options={[M('$A>B$'), M('$A<B$'), M('$A=B$')]}
                correct={0} cols={3} requires={['darb-mujab']}
                explain={<MathText>{'في الحالتين $A>B$ ؛ التخمين لا يكفي، نبرهن بالفرق.'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && (
                <TapQuestion
                  prompt={M('$A-B=2x-4$ . علمًا أنّ $x>2$ ، ما إشارة $2x-4$ ؟')}
                  options={[M('موجبة، لأنّ $2x>4$ بالضرب في $2$'), M('سالبة'), M('لا نعرف إشارتها')]}
                  correct={0} cols={1} requires={['darb-mujab']}
                  explain={<MathText>{'نضرب طرفي $x>2$ في $2$ : $2x>4$ ثم نطرح $4$ : $2x-4>0$ . إذن $A-B>0$ أي $A>B$ .'}</MathText>}
                  onAnswered={answered('c')}
                />
              )}
              {q.c && <MethodSteps method={METHOD.compare} onAllRevealed={revealed('b')} />}
              {q.c && <KnowledgeBrick id="muqarana-bil-khawas" lead="كيف نثبت مقارنة عبارتين بخواص المتباينات؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'كيف أحصر عبارة من الشكل ax + b ؟', subtitle: 'الحصر', done: !!q.d && !!r.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={M('$2\\leq t\\leq 5$ . ما حصر $-2t+4$ ؟')}
                options={[M('$-6\\leq -2t+4\\leq 0$'), M('$0\\leq -2t+4\\leq -6$'), M('$8\\leq -2t+4\\leq 14$'), M('$-10\\leq -2t+4\\leq -4$')]}
                correct={0} cols={1} requires={['darb-salib']}
                explain={<MathText>{`نضرب في $-2$ : $-10\\leq -2t\\leq -4$ (الأصغر أوّلًا) ، ثم نضيف $4$ : $-6\\leq -2t+4\\leq 0$ . ${GUIDE.boundOrder.why}`}</MathText>}
                onAnswered={answered('d')}
              />
              {q.d && <MethodSteps method={METHOD.bracket} onAllRevealed={revealed('c')} />}
              {q.d && <KnowledgeBrick id="hasr-ab" lead="كيف نحصر عبارة من الشكل ax + b ، وماذا يتغيّر مع عدد سالب؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
