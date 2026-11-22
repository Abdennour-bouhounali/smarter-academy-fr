import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, KNOWLEDGE } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) : la relation y = ax (طريقة p. 91), la LECTURE d'une valeur inconnue sur un graphique de
 * proportionnalité (le fil de cuivre : coefficient, masse de 10 m, longueur de 4,5 kg ; طرائق p. 91 réécrit) et le JUGEMENT d'un graphique (alignés mais hors de O). La méthode et
 * la brique viennent APRÈS la réponse. LP : P3, P4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [r, setR] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const revealed = (k) => () => setR((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أكتب علاقة نقطة من مستقيم التناسبية؟', 'كيف أقرأ قيمة مجهولة على البيان؟', 'كيف أحكم على تمثيل؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أقرأ بيانًا وأحكم عليه"
      moduleSubtitle="y = ax وقراءة قيمة وحكم"
      estimatedTime="11 دقيقة"
      steps={[
        {
          num: 1, title: 'ما العلاقة بين y و x على مستقيم التناسبية؟', subtitle: 'y = ax', done: !!q.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="مستقيم يمرّ بـ $O$ وبالنقطة $(1\ ;\ 3)$ . النقطة $M(x\ ;\ y)$ منه. ما العلاقة بين $y$ و $x$ ؟"
                options={['$y = 3 \\times x$', '$y = x + 3$', '$y = \\dfrac{3}{x}$'].map(M)}
                correct={0} cols={3} requires={['muamil-qiraa']}
                explain={<MathText>{'$M$ على مستقيم يمرّ بـ $O$ : ترتيبها $3$ أمثال فاصلتها. ($y = x + 3$ لا يعطي $0$ عند $x = 0$ .)'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <TextbookBox kind="method" compact text={KNOWLEDGE.coefficient.text} source={KNOWLEDGE.coefficient.source} />}
              {q.a && <KnowledgeBrick id="y-ax" lead="نقطة (x ; y) من مستقيم يمرّ بالمبدأ: ماذا تحقّق؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ما كتلة 10 m من السلك؟', subtitle: 'قراءة قيمة', done: !!q.b && !!r.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="نقط بيان سلك نحاسي $(4\ ;\ 3)$ و $(8\ ;\ 6)$ و $(12\ ;\ 9)$ على مستقيم يمرّ بـ $O$ ( الطول بالمتر والكتلة بالكيلوغرام ). ما كتلة $10\ \mathrm{m}$ منه؟"
                options={['$7{,}5\\ \\mathrm{kg}$', '$7\\ \\mathrm{kg}$', '$13\\ \\mathrm{kg}$'].map(M)}
                correct={0} cols={3} requires={['y-ax']}
                explain={<MathText>{'المعامل $\\frac{3}{4} = 0{,}75$ ، فـ $y = 0{,}75 \\times 10 = 7{,}5$ . ($7$ تُضيف $3$ إلى $4$ ؛ $13$ تُضيف الفرق.)'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <MethodSteps method={METHOD.read} onAllRevealed={revealed('b')} />}
              {q.b && <KnowledgeBrick id="qiraa-qima" lead="قيمة مجهولة على بيان تناسبية: كيف نجدها بالقراءة أو بالحساب؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'هل هذه النقط وضعية تناسبية؟', subtitle: 'حكم على بيان', done: !!q.c && !!r.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="النقط $(1\ ;\ 3)$ و $(2\ ;\ 5)$ و $(4\ ;\ 9)$ على استقامة واحدة. هل هي وضعية تناسبية؟"
                options={['لا: المستقيم لا يمرّ بـ $O$', 'نعم: النقط على استقامة', 'نعم: الترتيب يزيد مع الفاصلة'].map(M)}
                correct={0} cols={1} requires={['tamthil-tanasub']}
                explain={<MathText>{'لو كانت تناسبية لكان ترتيب الفاصلة $2$ هو $2 \\times 3 = 6$ لا $5$ .'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <MethodSteps method={METHOD.judge} onAllRevealed={revealed('c')} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
