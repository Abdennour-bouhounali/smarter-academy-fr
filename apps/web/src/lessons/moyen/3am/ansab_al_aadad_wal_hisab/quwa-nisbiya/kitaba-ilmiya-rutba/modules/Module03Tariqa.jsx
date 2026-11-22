import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) : quatre méthodes, chacune APRÈS la question qui la fait trouver — (A) écrire un décimal en notation
 * scientifique en déplaçant la virgule (طرائق p. 45 réécrite), (B) partir de k × 10ᵖ (دوري الآن p. 45), (C) encadrer et donner le rang de grandeur (طرائق p. 45), (D) calculer puis écrire
 * (le patron des devoirs de fin de trimestre). La méthode et la brique viennent APRÈS la réponse. LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [read, setRead] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const revealed = (k) => () => setRead((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أكتب عددًا عشريًا كتابة علمية؟', 'وإذا بدأت من $k \\times 10^p$ ؟', 'كيف أحصر وأعطي رتبة القدر؟', 'كيف أحسب ثم أكتب النتيجة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — من عدد إلى كتابته العلمية"
      moduleSubtitle="الفاصلة · k × 10ᵖ · الحصر · الحساب"
      estimatedTime="12 دقيقة"
      steps={[
        {
          num: 1, title: 'ما الكتابة العلمية للعدد $0{,}00052$ ؟', subtitle: 'نزيح الفاصلة', done: !!q.a && !!read.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'الكتابة العلمية للعدد $0{,}00052$ هي:'}</MathText>}
                options={[M('$52 \\times 10^{-5}$'), M('$5{,}2 \\times 10^{-4}$'), M('$5{,}2 \\times 10^{-3}$'), M('$0{,}52 \\times 10^{-3}$')]}
                correct={1} cols={2} requires={['kitaba-ilmiya']}
                explain={<MathText>{'نُزيح الفاصلة أربع رتب نحو اليمين حتى يصير رقم غير معدوم قبلها: $5{,}2 \\times 10^{-4}$ . ($52 \\times 10^{-5}$ و $0{,}52 \\times 10^{-3}$ تساويان العدد لكنّ العدد الأوّل فيهما ليس من 1 إلى أقل من 10 ، و $5{,}2 \\times 10^{-3}$ يُزيح ثلاث رتب فقط.)'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <MethodSteps method={METHOD.decimal} onAllRevealed={revealed('a')} />}
            </div>
          ),
        },
        {
          num: 2, title: 'وإذا بدأنا من $k \\times 10^p$ ؟', subtitle: 'نكتب $k$ علميًا أوّلًا', done: !!q.b && !!read.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'الكتابة العلمية للعدد $2\\,500 \\times 10^{-7}$ هي:'}</MathText>}
                options={[M('$2{,}5 \\times 10^{-10}$'), M('$2{,}5 \\times 10^{-4}$'), M('$2{,}5 \\times 10^{-3}$')]}
                correct={1} cols={3} requires={['kitaba-ilmiya']}
                explain={<MathText>{'$2\\,500 = 2{,}5 \\times 10^{3}$ ، ثم $10^{3} \\times 10^{-7} = 10^{-4}$ : $2{,}5 \\times 10^{-4}$ . (الأخرى تضرب الأسّين أو تنسى إشارة الأسّ.)'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <MethodSteps method={METHOD.times} onAllRevealed={revealed('b')} />}
              {q.b && <KnowledgeBrick id="tariqa-ilmiya" lead="من عدد عشري أو من $k \\times 10^p$ : كيف نصل دائمًا إلى $a \\times 10^n$ حيث $1 \\le a < 10$ ؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'وما رتبة قدر $7{,}62 \\times 10^{9}$ ؟', subtitle: 'الحصر ورتبة القدر', done: !!q.c && !!read.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'رتبة قدر $7{,}62 \\times 10^{9}$ هي:'}</MathText>}
                options={[M('$7 \\times 10^{9}$'), M('$8 \\times 10^{9}$'), M('$10^{10}$')]}
                correct={1} cols={3} requires={['rutbat-qadr']}
                explain={<MathText>{'مدوّر $7{,}62$ إلى الوحدة هو 8 : $8 \\times 10^{9}$ . ($7 \\times 10^{9}$ يحذف ما بعد الفاصلة، و $10^{10}$ هي القوة التالية لا رتبة القدر.)'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <MethodSteps method={METHOD.bracket} onAllRevealed={revealed('c')} />}
            </div>
          ),
        },
        {
          num: 4, title: 'وكيف نكتب نتيجة حساب كتابة علمية؟', subtitle: 'نحسب ثم نكتب', done: !!q.d && !!read.d,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'الكتابة العلمية للعدد $F = 3 \\times 10^{4} \\times 8 \\times 10^{-9}$ هي:'}</MathText>}
                options={[M('$24 \\times 10^{-5}$'), M('$2{,}4 \\times 10^{-4}$'), M('$2{,}4 \\times 10^{-5}$'), M('$2{,}4 \\times 10^{-36}$')]}
                correct={1} cols={2} requires={['tariqa-ilmiya']}
                explain={<MathText>{'$3 \\times 8 = 24$ و $10^{4} \\times 10^{-9} = 10^{-5}$ ، فالجداء $24 \\times 10^{-5}$ ؛ و $24 = 2{,}4 \\times 10^{1}$ ، إذن $2{,}4 \\times 10^{-4}$ . ($24 \\times 10^{-5}$ ليست علمية، و $2{,}4 \\times 10^{-5}$ نسيت الرتبة، و $2{,}4 \\times 10^{-36}$ ضربت الأسّين.)'}</MathText>}
                onAnswered={answered('d')}
              />
              {q.d && <MethodSteps method={METHOD.compute} onAllRevealed={revealed('d')} />}
              {q.d && <KnowledgeBrick id="hisab-ilmiya" lead="بعد الحساب بالقواعد الثلاث، ماذا نفعل إن لم يكن العدد الأوّل من 1 إلى أقل من 10 ؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
