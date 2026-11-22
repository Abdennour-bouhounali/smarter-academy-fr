import { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater). Quatre enchaînements, chacun question → méthode → calcul : le facteur commun dans une somme (A), dans une différence
 * (B), le nombre rond ± un petit nombre (C = 3,5 × 101 et D = 19 × 6), puis la lettre (E = 4 × (x − 3) = 4x − 12, notation 4 × x = 4x, valeurs par deux voies). Les nombres sont ceux de la plateforme (طرائق 3 et 4 du
 * manuel, réécrits). La méthode et la brique viennent APRÈS la réponse. LP : P3, P4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [r, setR] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const revealed = (k) => () => setR((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أحسب ذهنيًا بإخراج عامل مشترك؟', 'كيف أكتب عددًا قريبًا من عدد مدوّر؟', 'كيف أنشر عبارة فيها حرف وأتحقّق منها؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — الحساب الذهني والحرف"
      moduleSubtitle="أبحث عن العامل المشترك أو عن عدد مدوّر"
      estimatedTime="12 دقيقة"
      steps={[
        {
          num: 1, title: 'مجموع جداءين', subtitle: 'ما العامل المشترك؟', done: !!q.a && !!r.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'في $A = 25 \\times 4{,}3 + 25 \\times 5{,}7$ ما العامل المشترك؟'}</MathText>}
                options={['$25$', '$4{,}3$', '$5{,}7$'].map(M)}
                correct={0} cols={3} requires={['tahlil']}
                explain={<MathText>{'العدد $25$ مكتوب في الجداءين: نخرجه ونجمع $4{,}3 + 5{,}7 = 10$ .'}</MathText>}
                onAnswered={answered('a')} />
              {q.a && <MethodSteps method={METHOD.common} onAllRevealed={revealed('a')} />}
              {q.a && <NumericQuestion prompt={<MathText>{'احسب $A$ :'}</MathText>} expected={250} display="250" requires={['tahlil']}
                explain={<MathText>{'$25 \\times 10 = 250$ .'}</MathText>} onAnswered={() => {}} />}
              {q.a && <KnowledgeBrick id="tariqa-dhihni" lead="كيف نحسب ذهنيًا بالتوزيع؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'فرق جداءين', subtitle: 'العامل المشترك في موضع واحد', done: !!q.b && !!r.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'في $B = 14{,}6 \\times 12 - 4{,}6 \\times 12$ ما العامل المشترك؟'}</MathText>}
                options={['$12$', '$4{,}6$', '$14{,}6$'].map(M)}
                correct={0} cols={3} requires={['tahlil']}
                explain={<MathText>{'العدد $12$ مكتوب بعد العددين: $B = (14{,}6 - 4{,}6) \\times 12 = 10 \\times 12$ .'}</MathText>}
                onAnswered={answered('b')} />
              {q.b && <MethodSteps method={METHOD.diff} onAllRevealed={revealed('b')} />}
              {q.b && <NumericQuestion prompt={<MathText>{'احسب $B$ :'}</MathText>} expected={120} display="120" requires={['tahlil']}
                explain={<MathText>{'$10 \\times 12 = 120$ .'}</MathText>} onAnswered={() => {}} />}
            </div>
          ),
        },
        {
          num: 3, title: 'عدد قريب من عدد مدوّر', subtitle: '101 و 19', done: !!q.c && !!r.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'لحساب $3{,}5 \\times 101$ ذهنيًا نكتب $101$ على شكل:'}</MathText>}
                options={['$100 + 1$', '$100 - 1$', '$10 + 1$'].map(M)}
                correct={0} cols={3} requires={['qaidat-tawzi']}
                explain={<MathText>{'$101 = 100 + 1$ ، فنضرب $3{,}5$ في $100$ ثم نضيف $3{,}5 \\times 1$ . (و $100 - 1$ تساوي $99$ لا $101$.)'}</MathText>}
                onAnswered={answered('c')} />
              {q.c && <MethodSteps method={METHOD.near} onAllRevealed={revealed('c')} />}
              {q.c && <NumericQuestion prompt={<MathText>{'احسب $3{,}5 \\times 101$ :'}</MathText>} expected={353.5} display="353,5" requires={['tariqa-dhihni']}
                explain={<MathText>{'$350 + 3{,}5 = 353{,}5$ .'}</MathText>} onAnswered={() => {}} />}
              {q.c && <NumericQuestion prompt={<MathText>{'احسب $19 \\times 6$ بكتابة $19 = 20 - 1$ :'}</MathText>} expected={114} display="114" requires={['tariqa-dhihni']}
                explain={<MathText>{'$20 \\times 6 - 1 \\times 6 = 120 - 6 = 114$ .'}</MathText>} onAnswered={() => {}} />}
            </div>
          ),
        },
        {
          num: 4, title: 'عبارة فيها حرف', subtitle: 'أنشر $4 \\times (x - 3)$', done: !!q.d && !!r.d,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'ما نشر $E = 4 \\times (x - 3)$ ؟'}</MathText>}
                options={['$4x - 12$', '$4x - 3$', '$x - 12$'].map(M)}
                correct={0} cols={3} requires={['qaidat-tawzi']}
                explain={<MathText>{'العدد $4$ يضرب $x$ ويضرب $3$ : $4 \\times x - 4 \\times 3 = 4x - 12$ . (الثانية ضربت الحرف وحده؛ والثالثة ضربت العدد وحده.)'}</MathText>}
                onAnswered={answered('d')} />
              {q.d && <MethodSteps method={METHOD.letter} onAllRevealed={revealed('d')} />}
              {q.d && <NumericQuestion prompt={<MathText>{'احسب $E$ من أجل $x = 4{,}5$ :'}</MathText>} expected={6} display="6" requires={['qaidat-tawzi']}
                explain={<MathText>{'$4 \\times (4{,}5 - 3) = 4 \\times 1{,}5 = 6$ ؛ و $4 \\times 4{,}5 - 12 = 18 - 12 = 6$ . ومن أجل $x = 3$ نجد $0$ بالطريقتين.'}</MathText>} onAnswered={() => {}} />}
              {q.d && <KnowledgeBrick id="tariqa-harf" lead="كيف أنشر عبارة فيها حرف؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
