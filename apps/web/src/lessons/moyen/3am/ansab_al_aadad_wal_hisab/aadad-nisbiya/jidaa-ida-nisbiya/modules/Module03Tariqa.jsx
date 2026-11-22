import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, KNOWLEDGE, GUIDE } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) : calculer un produit de plusieurs facteurs en trois gestes —
 * compter les facteurs négatifs (saisi), en déduire le signe (un toucher), puis multiplier les distances en réordonnant (saisi) ; un facteur 0 ;
 * puis la distributivité dans les deux sens sur des NOMBRES (jamais des lettres : `nashr-jabri-3am`). La méthode et les briques viennent APRÈS la
 * réponse. LP : P2, P4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [s1, setS1] = useState({});
  const done = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أعيّن إشارة جداء عدة أعداد؟', 'كيف أرتّب العوامل لأسهّل الحساب؟', 'ماذا يعطي عامل معدوم؟', 'كيف أوزّع الضرب لأحسب ذهنيًا؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أحسب جداء عدة أعداد وأستعمل التوزيع"
      moduleSubtitle="نعدّ السالبة · نرتّب · نوزّع"
      estimatedTime="12 دقيقة"
      steps={[
        {
          num: 1, title: 'كم عاملًا سالبًا؟', subtitle: 'الإشارة أوّلًا', done: !!q.a,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'$P = (-4) \\times 0{,}07 \\times (-25) \\times (-3)$ . كم عاملًا سالبًا في $P$ ؟'}</MathText>}
                expected={3} requires={['adad-salib']}
                explain={<MathText>{'العوامل السالبة هي $-4$ و $-25$ و $-3$ : ثلاثة.'}</MathText>}
                onAnswered={() => setS1((s) => ({ ...s, count: true }))}
              />
              {s1.count && (
                <TapQuestion
                  prompt="إذن إشارة الجداء P:"
                  options={[M('$+$'), M('$-$')]} correct={1} cols={2} requires={['adad-salib']}
                  explain="ثلاثة عوامل سالبة (عدد فردي): الجداء سالب."
                  onAnswered={() => setS1((s) => ({ ...s, sign: true }))}
                />
              )}
              {s1.sign && (
                <NumericQuestion
                  prompt={<MathText>{'نرتّب العوامل: $P = -(4 \\times 25 \\times 0{,}07 \\times 3)$ . احسب $P$ .'}</MathText>}
                  expected={-21} display="−21" parse={parseDec} requires={['adad-salib']}
                  explain={<MathText>{'$4 \\times 25 = 100$ ثم $100 \\times 0{,}07 = 7$ ثم $7 \\times 3 = 21$ ، والإشارة سالبة: $P = -21$ .'}</MathText>}
                  onAnswered={done('a')}
                />
              )}
              {q.a && <TextbookBox kind="example" compact text={METHOD.count.text} source={METHOD.count.source} />}
              {q.a && <MethodSteps method={METHOD.steps} />}
              {q.a && <KnowledgeBrick id="tariqat-iddat" lead="جداء عدة أعداد: ما الخطوات؟ وكيف نرتّب العوامل؟" />}
              {q.a && <TextbookBox kind="remark" compact text={METHOD.reorder.text} source={METHOD.reorder.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'وإذا كان أحد العوامل معدومًا؟', subtitle: 'حالة خاصّة', done: !!q.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'احسب: $(-1) \\times (-1) \\times 5 \\times (-2) \\times 0$'}</MathText>}
                options={[M('$0$'), M('$-10$'), M('$10$')]} correct={0} cols={3} requires={['tariqat-iddat']}
                explain={<MathText>{GUIDE.zero}</MathText>}
                onAnswered={done('b')}
              />
              {q.b && <TextbookBox kind="remark" compact text={METHOD.special.text} source={METHOD.special.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'احسب ذهنيًا', subtitle: 'عامل مشترك', done: !!q.c,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'احسب ذهنيًا: $(-3{,}2) \\times 7 + (-3{,}2) \\times 3$'}</MathText>}
                expected={-32} display="−32" parse={parseDec} requires={['tariqat-iddat']}
                explain={<MathText>{'نخرج العامل المشترك: $(-3{,}2) \\times (7 + 3) = (-3{,}2) \\times 10 = -32$ .'}</MathText>}
                onAnswered={done('c')}
              />
              {q.c && <KnowledgeBrick id="tawzi-aadad" lead="جمع جداءين لهما عامل مشترك: كيف نحسبه ذهنيًا؟" />}
              {q.c && <TextbookBox kind="property" compact text={KNOWLEDGE.distribute.text} source={KNOWLEDGE.distribute.source} />}
            </div>
          ),
        },
        {
          num: 4, title: 'وإذا كان الطرح داخل القوس؟', subtitle: 'ننشر الجداء', done: !!q.d,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'احسب ذهنيًا: $(-25) \\times (4 - 0{,}4)$'}</MathText>}
                expected={-90} display="−90" parse={parseDec} requires={['tawzi-aadad']}
                explain={<MathText>{GUIDE.distSign.why + ' ' + GUIDE.distSign.right}</MathText>}
                onAnswered={done('d')}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
