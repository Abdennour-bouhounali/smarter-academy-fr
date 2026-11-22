import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) : calculer une somme algébrique en étapes (nombres propres à la plateforme) — avec tous les termes écrits, avec des décimaux
 * en écriture simplifiée, puis avec un crochet. La méthode et la brique viennent APRÈS la réponse. LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [read, setRead] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const done = (k) => () => setRead((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أحسب مجموعًا جبريًا بخطوات؟', 'كيف أحسب مجموعًا مبسّطًا بأعداد عشرية؟', 'كيف أحسب مجموعًا فيه أقواس؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أحسب مجموعًا جبريًا"
      moduleSubtitle="أحوّل، أجمّع، وأبدأ بالأقواس"
      estimatedTime="10 دقائق"
      steps={[
        {
          num: 1, title: 'كيف أحسب مجموعًا؟', subtitle: 'أحوّل الطرح', done: !!q.a && !!read.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'احسب $S=(+7)-(+9)+(-4)+(-2)$ . ما قيمته؟'}</MathText>}
                options={[M('$(-8)$'), M('$(+8)$'), M('$(-22)$')]}
                correct={0} cols={3} requires={['tarh-ila-jam']}
                explain={<MathText>{'نحوّل الطرح: $(+7)+(-9)+(-4)+(-2)$ ، والسالبة $-15$ فالمجموع $(+7)+(-15)=(-8)$ .'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <MethodSteps method={METHOD.chain} onAllRevealed={done('a')} />}
              {q.a && <KnowledgeBrick id="tariqat-majmu-jabri" lead="كيف أحسب مجموعًا جبريًا بخطوات؟" requires={['naql-tajmi']} />}
            </div>
          ),
        },
        {
          num: 2, title: 'وبالكتابة المبسّطة؟', subtitle: 'بأعداد عشرية', done: !!q.b && !!read.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'في $T=6-11+4{,}5-2{,}5$ لماذا نجمع $6$ و $4{,}5$ معًا؟'}</MathText>}
                options={['لأنّهما الحدّان الموجبان فنجمع الموجبة معًا', 'لأنّهما أصغر عددين', 'لأنّهما متجاوران'].map(M)}
                correct={0} cols={1} requires={['kitaba-mubassata']}
                explain={<MathText>{'الموجبة $6$ و $4{,}5$ مجموعها $10{,}5$ ، والسالبة $-11$ و $-2{,}5$ مجموعها $-13{,}5$ ، فالمجموع $-3$ .'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <MethodSteps method={METHOD.simple} onAllRevealed={done('b')} />}
            </div>
          ),
        },
        {
          num: 3, title: 'وإذا وُجد قوس؟', subtitle: 'الداخل أوّلًا', done: !!q.c && !!read.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'احسب $U=(+18)-[(-9)-(+6)]$ . ما قيمته؟'}</MathText>}
                options={[M('$(+33)$'), M('$(+21)$'), M('$(+3)$')]}
                correct={0} cols={3} requires={['naql-tajmi']}
                explain={<MathText>{'ما بين القوسين أوّلًا: $(-9)-(+6)=(-15)$ ، ثم $(+18)-(-15)=(+33)$ .'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <MethodSteps method={METHOD.brackets} onAllRevealed={done('c')} />}
              {q.c && <KnowledgeBrick id="tariqat-aqwas-awwalan" lead="ماذا أحسب أوّلًا حين يوجد قوس؟" requires={['tariqat-majmu-jabri']} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
