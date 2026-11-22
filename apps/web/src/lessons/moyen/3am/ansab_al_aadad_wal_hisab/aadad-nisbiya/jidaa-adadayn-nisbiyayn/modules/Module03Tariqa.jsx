import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, KNOWLEDGE, GUIDE } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) : calculer un produit de deux relatifs en DEUX
 * gestes — le signe (un toucher « + / − »), puis le produit des distances (saisi). Cinq produits : (−6) × 7, (−1,5) × (−8) (طرائق p. 11,
 * redessinés), 0,25 × (−36), (−0,3) × (−0,2) (le piège de la virgule), puis (−12) × 0. La méthode et les briques viennent APRÈS la
 * réponse. LP : P4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const SIGNS = [M('$+$'), M('$-$')];

/** Un produit en deux gestes : le signe d'abord, puis le nombre. */
function SignThenProduct({ id, tex, plus, expected, display, why, onDone, requires }) {
  const [signDone, setSignDone] = useState(false);
  return (
    <div className="space-y-3" data-sign-product={id}>
      <TapQuestion
        prompt={<MathText>{`أولًا: ما إشارة الجداء $${tex}$ ؟`}</MathText>}
        options={SIGNS} correct={plus ? 0 : 1} cols={2} requires={requires}
        explain={<MathText>{plus ? 'للعددين الإشارة نفسها: الجداء موجب.' : 'للعددين إشارتان مختلفتان: الجداء سالب.'}</MathText>}
        onAnswered={() => setSignDone(true)}
      />
      {signDone && (
        <NumericQuestion
          prompt={<MathText>{`ثم احسب: $${tex}$`}</MathText>}
          expected={expected} display={display} parse={parseDec} requires={requires}
          explain={<MathText>{why}</MathText>}
          onAnswered={onDone}
        />
      )}
    </div>
  );
}

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [, setRead] = useState(false);
  const done = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أعيّن إشارة جداء عددين؟', 'وبعد الإشارة، ماذا أحسب؟', 'أين أضع الفاصلة؟', 'ماذا يعطي الضرب في 0؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أحسب جداء عددين نسبيين"
      moduleSubtitle="الإشارة أوّلًا · ثم المسافتان"
      estimatedTime="10 دقائق"
      steps={[
        {
          num: 1, title: 'ما جداء $-6$ و $7$ ؟', subtitle: 'إشارتان مختلفتان', done: !!q.a,
          content: (
            <div className="space-y-3">
              <SignThenProduct id="p1" tex="(-6) \times 7" plus={false} expected={-42} display="−42" requires={['ishara-jidaa']}
                why="المسافتان $6$ و $7$ وجداؤهما $42$ ، والإشارة سالبة: $-42$ ." onDone={done('a')} />
              {q.a && <MethodSteps method={METHOD.steps} onAllRevealed={() => setRead(true)} />}
              {q.a && <KnowledgeBrick id="tariqat-jidaa" lead="جداء عددين نسبيين: ما الخطوتان؟ وبأيّ ترتيب؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'وإذا كان أحد العاملين عشريًا؟', subtitle: 'سالب في سالب', done: !!q.b,
          content: (
            <SignThenProduct id="p2" tex="(-1{,}5) \times (-8)" plus expected={12} display="12" requires={['tariqat-jidaa']}
              why="سالبان: الجداء موجب. $1{,}5 \times 8 = 12$ ." onDone={done('b')} />
          ),
        },
        {
          num: 3, title: 'والعامل الأول عشري موجب؟', subtitle: 'موجب في سالب', done: !!q.c,
          content: (
            <SignThenProduct id="p3" tex="0{,}25 \times (-36)" plus={false} expected={-9} display="−9" requires={['tariqat-jidaa']}
              why="إشارتان مختلفتان: سالب. $0{,}25 \times 36 = 9$ (ربع 36)، إذن $-9$ ." onDone={done('c')} />
          ),
        },
        {
          num: 4, title: 'أين تقع الفاصلة؟', subtitle: 'عشريان صغيران', done: !!q.d,
          content: (
            <div className="space-y-3">
              <SignThenProduct id="p4" tex="(-0{,}3) \times (-0{,}2)" plus expected={0.06} display="0,06" requires={['tariqat-jidaa']}
                why="سالبان: موجب. $3 \times 2 = 6$ ثم نضع الفاصلة بعد رقمين: $0{,}06$ ، لا $0{,}6$ ." onDone={done('d')} />
              {q.d && <TextbookBox kind="remark" compact text={METHOD.decimal} source={METHOD.steps.source} />}
            </div>
          ),
        },
        {
          num: 5, title: 'ماذا يعطي الضرب في 0؟', subtitle: 'جداء عدد في الصفر', done: !!q.e,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'احسب: $(-12) \\times 0$'}</MathText>}
                options={[M('$0$'), M('$-12$'), M('$12$')]}
                correct={0} cols={3} requires={['tariqat-jidaa']}
                explain={<MathText>{GUIDE.zero}</MathText>}
                onAnswered={done('e')}
              />
              {q.e && <KnowledgeBrick id="jidaa-sifr" lead="مصعد سرعته 0: أين تكون كابينته مهما كان الزمن؟" />}
              {q.e && <TextbookBox kind="property" compact text={KNOWLEDGE.distance.zero} source={KNOWLEDGE.distance.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
