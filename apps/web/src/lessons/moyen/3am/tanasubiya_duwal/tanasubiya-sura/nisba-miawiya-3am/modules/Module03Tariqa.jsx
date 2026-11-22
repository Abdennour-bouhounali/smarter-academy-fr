import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, NOW, GUIDE } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) : les TROIS CAS du pourcentage dans le tableau « الكلّ ↔ 100 » (le
 * tableau de معارف p. 90, réécrit : 160 sacs), la variation en pourcentage (طرائق p. 91, réécrite : un قميص à 1500 DA, +20 % puis −20 %) et دورك الآن (l'ordre
 * des deux variations). La méthode et la brique viennent APRÈS la réponse. LP : P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [r, setR] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const revealed = (k) => () => setR((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أجد الجزء أو النسبة أو الكلّ؟', 'كيف أحسب زيادة أو تخفيضًا؟', 'ماذا يحدث عند تغيّرين متتاليين؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — جزء ونسبة وزيادة وتخفيض"
      moduleSubtitle="حالات النسبة المئوية وتغيّراتها"
      estimatedTime="11 دقيقة"
      steps={[
        {
          num: 1, title: 'ما المجهول؟ الجزء أم النسبة أم الكلّ؟', subtitle: 'ثلاث حالات', done: !!q.a && !!r.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'في مخزن $160$ كيسًا. ما $35\\%$ منها؟'}</MathText>}
                options={[M('$56$'), M('$125$'), M('$5600$')]}
                correct={0} cols={3} requires={['nisba-jadwal']}
                explain={<MathText>{'$160 \\times \\frac{35}{100} = 56$ . ($125$ طرح $35$ من $160$ ؛ $5600$ ضرب في $35$ دون القسمة على $100$ .)'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <MethodSteps method={METHOD.cases} onAllRevealed={revealed('a')} />}
              {q.a && <KnowledgeBrick id="tariqat-hisab" lead="الجزء أو النسبة أو الكلّ مجهول: كيف نحسب في كل حالة؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ما الثمن بعد ارتفاع ثم انخفاض؟', subtitle: 'تغيّران متتاليان', done: !!q.b && !!r.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="ثمن قميص $1500$ دج ارتفع بـ $20\\%$ ثم انخفض بـ $20\\%$ . ما ثمنه الجديد؟"
                options={[M('$1440$'), M('$1500$'), M('$1200$')]}
                correct={0} cols={3} requires={['ziyada-nuqsan']}
                explain={<MathText>{GUIDE.undo.right.replace('200 \\times 1{,}2 \\times 0{,}8 = 192$ لا $200', '1500 \\times 1{,}2 \\times 0{,}8 = 1440$ لا $1500')}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <MethodSteps method={METHOD.change} onAllRevealed={revealed('b')} />}
              {q.b && <KnowledgeBrick id="tatabu" lead="زيادة ثم تخفيض بالنسبة نفسها: هل نعود إلى البداية؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'وإذا بدأنا بالانخفاض؟', subtitle: 'ترتيب التغيّرين', done: !!q.c && !!r.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="ثمن القميص نفسه $1500$ دج انخفض بـ $20\\%$ ثم ارتفع بـ $20\\%$ . كيف يكون ثمنه مقارنةً بالترتيب السابق؟"
                options={[
                  'الثمن نفسه $1440$ دج: ترتيب التغيّرين لا يغيّر الناتج',
                  'أكبر، لأنّ الانخفاض جاء أولًا',
                  'يعود إلى $1500$ دج',
                ].map(M)}
                correct={0} cols={1} requires={['tatabu']}
                explain={<MathText>{'$1{,}2 \\times 0{,}8 = 0{,}8 \\times 1{,}2 = 0{,}96$ : نضرب في المعامل نفسه.'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <MethodSteps method={NOW} onAllRevealed={revealed('c')} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
