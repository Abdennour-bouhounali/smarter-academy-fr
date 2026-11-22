import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, GUIDE } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) : de l'écriture décimale à la puissance (et le contraire) par le
 * COMPTE des zéros ou le RANG du 1 (طرائق p. 43, réécrite), puis le مفكوك d'un décimal (chaque chiffre × la puissance de son rang, rangs vides absents), puis
 * k × 10ⁿ (le décalage de la virgule de 1AM, rappelé). La méthode et la brique viennent APRÈS la réponse. LP : P3, P4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [read, setRead] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const revealed = (k) => () => setRead((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أعدّ الأصفار أو رتبة الرقم 1 ؟', 'كيف أكتب مفكوك عدد عشري؟', 'كيف أكتب عددًا على الشكل $k \\times 10^n$ ؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — من الكتابة العشرية إلى القوى"
      moduleSubtitle="عدّ الأصفار · المفكوك · k × 10ⁿ"
      estimatedTime="11 دقيقة"
      steps={[
        {
          num: 1, title: 'كيف نكتب قوة 10 انطلاقًا من كتابتها العشرية؟', subtitle: 'عدّ الأصفار أو الرتبة', done: !!q.a && !!read.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'$a = 100\\,000$ و $b = 0{,}0001$ . اكتب كل عدد على شكل قوة للعدد 10 :'}</MathText>}
                options={[M('$a = 10^5$ و $b = 10^{-4}$'), M('$a = 10^6$ و $b = 10^{-3}$'), M('$a = 10^5$ و $b = 10^{4}$')]}
                correct={0} cols={1} requires={['ashara-salib']}
                explain={<MathText>{'$100\\,000$ : خمسة أصفار بعد الرقم 1 ، إذن $10^5$ . $0{,}0001$ : الرقم 1 في الرتبة الرابعة بعد الفاصلة، إذن $10^{-4}$ . ($10^6$ يعدّ الأرقام، و $10^4$ ينسى أنّ العدد أصغر من 1 .)'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <MethodSteps method={METHOD.count} onAllRevealed={revealed('a')} />}
              {q.a && <KnowledgeBrick id="ashara-adad" lead="1 متبوع بأصفار، أو 0,0…01 : ماذا نعدّ لنكتب الأس؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'كيف نكتب مفكوك عدد عشري؟', subtitle: 'كل رقم × قوة رتبته', done: !!q.b && !!read.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'اكتب مفكوك العدد $5\\,030{,}07$ :'}</MathText>}
                options={[
                  M('$5 \\times 10^3 + 3 \\times 10^1 + 7 \\times 10^{-2}$'),
                  M('$5 \\times 10^3 + 3 \\times 10^2 + 7 \\times 10^{-2}$'),
                  M('$5 \\times 10^4 + 3 \\times 10^2 + 7 \\times 10^{-1}$'),
                ]}
                correct={0} cols={1} requires={['ashara-adad']}
                explain={<MathText>{`${GUIDE.mafkuk.right} ${GUIDE.mafkuk.why}`}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <MethodSteps method={METHOD.expand} onAllRevealed={revealed('b')} />}
              {q.b && <KnowledgeBrick id="ashara-mafkuk" lead="كل رقم يُضرب في قوة العدد 10 التي توافق رتبته: ماذا نفعل بالرتب الفارغة؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'كيف نكتب عددًا على الشكل k × 10ⁿ ؟', subtitle: 'مليون وميكرومتر', done: !!q.c && !!read.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'$36$ مليونًا تُكتب $36 \\times 10^{?}$ :'}</MathText>}
                options={[M('$6$'), M('$3$'), M('$9$')]}
                correct={0} cols={3} requires={['ashara-adad']}
                explain={<MathText>{'المليون هو $10^6$ ، إذن $36$ مليونًا $= 36 \\times 10^6 = 36\\,000\\,000$ . ($10^9$ هو المليار.)'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <MethodSteps method={METHOD.times} onAllRevealed={revealed('c')} />}
              {q.c && <KnowledgeBrick id="ashara-kn" lead="45 000 = 45 × 10³ ، وهل لهذا العدد كتابة وحيدة بهذا الشكل؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
