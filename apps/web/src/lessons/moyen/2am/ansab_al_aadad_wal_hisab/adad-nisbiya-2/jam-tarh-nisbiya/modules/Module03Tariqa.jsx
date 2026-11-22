import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) : écrire une somme puis une différence en étapes (nombres propres à la plateforme), avec des décimaux,
 * et trancher « qui est le plus loin de zéro ? ». La méthode et la brique viennent APRÈS la réponse. LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [read, setRead] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const done = (k) => () => setRead((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أكتب حساب مجموع بخطوات؟', 'كيف أكتب حساب فرق بخطوات؟', 'كيف أحسب بالأعداد العشرية؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أكتب الحساب"
      moduleSubtitle="مجموع، فرق، وأعداد عشرية"
      estimatedTime="10 دقائق"
      steps={[
        {
          num: 1, title: 'كيف أحسب مجموعًا؟', subtitle: 'حالتان', done: !!q.a && !!read.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'احسب $A=(-5)+(-8)$ . ما قيمتها؟'}</MathText>}
                options={[M('$(-13)$'), M('$(+13)$'), M('$(-3)$')]}
                correct={0} cols={3} requires={['jam-nafs-ishara']}
                explain={<MathText>{'الإشارتان متّفقتان: $5+8=13$ ونحتفظ بالإشارة $-$ ، فـ $A=(-13)$ .'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <MethodSteps method={METHOD.sum} onAllRevealed={done('a')} />}
              {q.a && <KnowledgeBrick id="tariqat-jam" lead="كيف أكتب حساب مجموع عددين نسبيين؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'كيف أحسب فرقًا؟', subtitle: 'نكتبه جمعًا', done: !!q.b && !!read.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'احسب $C=(+6{,}3)-(-2{,}4)$ . ما قيمتها؟'}</MathText>}
                options={[M('$(+8{,}7)$'), M('$(+3{,}9)$'), M('$(-8{,}7)$')]}
                correct={0} cols={3} requires={['jam-ishara-mukhtalifa']}
                explain={<MathText>{'نضيف معاكس $-2{,}4$ : $(+6{,}3)+(+2{,}4)=(+8{,}7)$ .'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <MethodSteps method={METHOD.diff} onAllRevealed={done('b')} />}
              {q.b && <KnowledgeBrick id="tariqat-tarh" lead="كيف أكتب حساب فرق عددين نسبيين؟" requires={['tarh-bi-muakis']} />}
            </div>
          ),
        },
        {
          num: 3, title: 'من الأبعد عن الصفر؟', subtitle: 'الإشارة بعد الطرح', done: !!q.c,
          content: (
            <TapQuestion
              prompt={<MathText>{'احسب $F=(-3{,}3)-(-5)$ . من الأبعد عن الصفر بعد كتابتها جمعًا، وما إشارة الناتج؟'}</MathText>}
              options={[M('$+5$ هو الأبعد فالناتج $(+1{,}7)$'), M('$-3{,}3$ هو الأبعد فالناتج $(-1{,}7)$'), M('الناتج $(-8{,}3)$')]}
              correct={0} cols={1} requires={['jam-ishara-mukhtalifa']}
              explain={<MathText>{'$F=(-3{,}3)+(+5)$ : المسافتان $3{,}3$ و $5$ ، فرقهما $1{,}7$ ، والأبعد عن الصفر $+5$ : $F=(+1{,}7)$ .'}</MathText>}
              onAnswered={answered('c')}
            />
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
