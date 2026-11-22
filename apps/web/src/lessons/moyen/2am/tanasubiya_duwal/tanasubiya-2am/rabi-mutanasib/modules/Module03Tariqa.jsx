import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) : choisir le chemin selon les nombres (طرائق p. 75,
 * réécrit — une électricienne payée à l'heure : 1260 DA pour 6 h), puis le chemin qui évite un quotient non décimal. La méthode et la
 * brique viennent APRÈS la réponse. LP : P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [read, setRead] = useState(false);
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أختار الطريق الأقصر؟', 'متى أجمع ومتى أضرب؟', 'كيف أتفادى عددًا غير منتهٍ؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أختار الطريق"
      moduleSubtitle="أنظر إلى الأعداد أوّلًا"
      estimatedTime="10 دقائق"
      steps={[
        {
          num: 1, title: 'أجرة 3 ساعات', subtitle: 'نصف المدّة', done: !!q.a,
          content: (
            <TapQuestion
              prompt={<MathText>{'تتقاضى كهربائية $1260$ DA عن $6$ ساعات. لأنّ $3 = 6 \\div 2$ ، أجرة $3$ ساعات هي:'}</MathText>}
              options={[M('$630$ DA'), M('$1263$ DA'), M('$2520$ DA')]}
              correct={0} cols={3} requires={['turuq']}
              explain={<MathText>{'الخاصية الضربية: نصف المدّة نصف الأجرة، $1260 \\div 2 = 630$ DA .'}</MathText>}
              onAnswered={answered('a')}
            />
          ),
        },
        {
          num: 2, title: 'أجرة 9 ساعات', subtitle: 'مجموع', done: !!q.b,
          content: (
            <TapQuestion
              prompt={<MathText>{'$9 = 6 + 3$ . أجرة $9$ ساعات هي:'}</MathText>}
              options={[M('$1890$ DA'), M('$1269$ DA'), M('$3780$ DA')]}
              correct={0} cols={3} requires={['turuq']}
              explain={<MathText>{'الخاصية الجمعية: $1260 + 630 = 1890$ DA .'}</MathText>}
              onAnswered={answered('b')}
            />
          ),
        },
        {
          num: 3, title: 'أجرة 7 ساعات', subtitle: 'المرور بالوحدة', done: !!q.c,
          content: (
            <TapQuestion
              prompt={<MathText>{'أجرة ساعة واحدة $1260 \\div 6 = 210$ DA . أجرة $7$ ساعات هي:'}</MathText>}
              options={[M('$1470$ DA'), M('$1267$ DA'), M('$8820$ DA')]}
              correct={0} cols={3} requires={['turuq']}
              explain={<MathText>{'$210 \\times 7 = 1470$ DA ؛ ولا نضيف $1$ إلى $1260$ ولا نضرب $1260$ في $7$ .'}</MathText>}
              onAnswered={answered('c')}
            />
          ),
        },
        {
          num: 4, title: 'عدد الساعات لأجرة 6300 DA', subtitle: 'الجداءان أو الضرب', done: !!q.d && read,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'$6300 = 1260 \\times 5$ . عدد الساعات اللازمة لأجرة $6300$ DA هو:'}</MathText>}
                options={[M('$30$ ساعة'), M('$5$ ساعات'), M('$1050$ ساعة')]}
                correct={0} cols={3} requires={['hisab-jidaan']}
                explain={<MathText>{'الأجرة صارت خمسة أمثال فالساعات خمسة أمثال: $6 \\times 5 = 30$ . (أو $1260 \\times x = 6 \\times 6300$ .)'}</MathText>}
                onAnswered={answered('d')}
              />
              {q.d && <MethodSteps method={METHOD.choose} onAllRevealed={() => setRead(true)} />}
            </div>
          ),
        },
        {
          num: 5, title: 'أيّ طريق يتفادى عددًا غير منتهٍ؟', subtitle: '7 kg بـ 100 DA', done: !!q.e,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'ثمن $7$ kg هو $100$ DA . لحساب ثمن $21$ kg دون التعامل مع عدد غير منتهٍ نستعمل:'}</MathText>}
                options={[M('المرور بالوحدة: $100 \\div 7$'), M('الخاصية الضربية: $21 = 7 \\times 3$'), M('معامل التناسبية $100 \\div 7$')]}
                correct={1} cols={1} requires={['turuq']}
                explain={<MathText>{'$100 \\div 7$ لا يُكتب كتابة عشرية منتهية، أمّا $21 = 7 \\times 3$ فتعطي $100 \\times 3 = 300$ DA مباشرة.'}</MathText>}
                onAnswered={answered('e')}
              />
              {q.e && <KnowledgeBrick id="ikhtiyar" lead="أنظر إلى الأعداد قبل أن أحسب: ماذا أختار؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
