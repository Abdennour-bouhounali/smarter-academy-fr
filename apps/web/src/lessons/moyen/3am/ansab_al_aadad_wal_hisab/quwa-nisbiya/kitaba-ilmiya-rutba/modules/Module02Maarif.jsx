import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE } from '../content/textbook';

/**
 * Module 2 — معارف « هل هي كتابة علمية ؟ » (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater). Six écritures à juger (l'idée de l'activité 5 : plusieurs écritures
 * d'un même nombre, une seule est scientifique), puis l'encadrement, le rang de grandeur (avec la retenue 9,7 × 10³ → 1 × 10⁴) et la règle de comparaison. Chaque encadré NOMME ce que
 * l'élève vient de voir (question → encadré → brique) avec les mots de la plateforme. LP : P1–P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

const ROWS = [
  { id: 'w1', tex: '0{,}72 \\times 10^{5}', ok: false },
  { id: 'w2', tex: '7{,}2 \\times 10^{4}', ok: true },
  { id: 'w3', tex: '10 \\times 10^{3}', ok: false },
  { id: 'w4', tex: '1 \\times 10^{-6}', ok: true },
  { id: 'w5', tex: '9{,}99 \\times 10^{8}', ok: true },
  { id: 'w6', tex: '45 \\times 10^{-2}', ok: false },
];

export default function Module02Maarif() {
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['أيّ الكتابات علمية؟', 'كيف نحصر عددًا بين قوتين للعدد 10 ؟', 'ما رتبة القدر حين يصير المدوّر 10 ؟', 'ماذا نقارن أوّلًا؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — هل هي كتابة علمية؟"
      moduleSubtitle="ست كتابات: أيّها علمية؟"
      estimatedTime="12 دقيقة"
      steps={[
        {
          num: 1, title: 'أيّ هذه الكتابات علمية؟', subtitle: 'نحكم على ست كتابات', done: !!q.a,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm text-slate-600">على جدار المعرض ست بطاقات جديدة. أهي كتابة علمية للعدد الذي تحمله أم لا؟</p>}
                rows={ROWS.map((r) => ({ id: r.id, label: `$${r.tex}$`, options: ['علمية', 'ليست علمية'], correct: r.ok ? 0 : 1 }))}
                requires={['kitaba-ilmiya']}
                feedback={({ allRight }) => (
                  <p className={`rounded-xl border-2 px-3 py-2 text-sm font-bold ${allRight ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-950'}`}>
                    {allRight ? 'حكمتَ على الكتابات الست حكمًا صحيحًا.' : 'العلمية هي الثانية والرابعة والخامسة فقط: في كل منها العدد الأوّل من 1 إلى أقل من 10 .'}
                  </p>
                )}
                onAnswered={answered('a')}
              />
              {q.a && <TextbookBox kind="property" compact title="الكتابة العلمية" text={KNOWLEDGE.sci.text} source={KNOWLEDGE.sci.source}>
                <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.sci.example}</MathText></p>
              </TextbookBox>}
              {q.a && <KnowledgeBrick id="shart-ilmiya" lead="هل تكفي المساواة؟ $45 \\times 10^{-2}$ يساوي $0{,}45$ . فما الذي ينقصها؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'وما حصر عدد كتابته العلمية معروفة؟', subtitle: 'الحصر', done: !!q.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>عدد كتابته العلمية <MathText>{'$A = 4{,}2 \\times 10^{5}$'}</MathText> . أيّ حصر صحيح؟</span>}
                options={[M('$10^{4} \\le A < 10^{5}$'), M('$10^{5} \\le A < 10^{6}$'), M('$10^{6} \\le A < 10^{7}$')]}
                correct={1} cols={1} requires={['hasr-quwatayn']}
                explain={<MathText>{'$A = 420\\,000$ ، وهو من $100\\,000 = 10^{5}$ إلى أقل من $1\\,000\\,000 = 10^{6}$ . الحصر يُقرأ من الأسّ: $10^{n} \\le A < 10^{n+1}$ .'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <TextbookBox kind="property" compact title="الحصر" text={KNOWLEDGE.bracket.text} source={KNOWLEDGE.bracket.source}>
                <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.bracket.example}</MathText></p>
              </TextbookBox>}
            </div>
          ),
        },
        {
          num: 3, title: 'وماذا لو دوّرنا $a$ إلى $10$ ؟', subtitle: 'رتبة القدر', done: !!q.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>رتبة قدر <MathText>{'$9{,}7 \\times 10^{3}$'}</MathText> هي:</span>}
                options={[M('$9 \\times 10^{3}$'), M('$1 \\times 10^{3}$'), M('$1 \\times 10^{4}$')]}
                correct={2} cols={3} requires={['rutbat-qadr']}
                explain={<MathText>{'مدوّر $9{,}7$ إلى الوحدة هو $10$ ، و $10 \\times 10^{3} = 1 \\times 10^{4}$ : نكتب $a\' = 10$ على الشكل $1 \\times 10^{n+1}$ . (الجواب $9 \\times 10^{3}$ يحذف ما بعد الفاصلة، و $1 \\times 10^{3}$ ينسى الرقم 9 .)'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <TextbookBox kind="property" compact title="رتبة القدر" text={KNOWLEDGE.order.text} source={KNOWLEDGE.order.source}>
                <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.order.example}</MathText></p>
              </TextbookBox>}
            </div>
          ),
        },
        {
          num: 4, title: 'وما أكبر العددين؟', subtitle: 'قاعدة المقارنة', done: !!q.d,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>أيّهما أكبر: <MathText>{'$6{,}1 \\times 10^{-3}$'}</MathText> أم <MathText>{'$9 \\times 10^{-4}$'}</MathText> ؟</span>}
                options={[M('$6{,}1 \\times 10^{-3}$'), M('$9 \\times 10^{-4}$'), M('متساويان')]}
                correct={0} cols={3} requires={['muqarana-ilmiya']}
                explain={<MathText>{'الأسّ $-3$ أكبر من $-4$ ، فالأوّل أكبر مع أنّ $6{,}1 < 9$ : $9 \\times 10^{-4} < 6{,}1 \\times 10^{-3}$ .'}</MathText>}
                onAnswered={answered('d')}
              />
              {q.d && <TextbookBox kind="property" compact title="المقارنة" text={KNOWLEDGE.compare.text} source={KNOWLEDGE.compare.source}>
                <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.compare.example}</MathText></p>
              </TextbookBox>}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
