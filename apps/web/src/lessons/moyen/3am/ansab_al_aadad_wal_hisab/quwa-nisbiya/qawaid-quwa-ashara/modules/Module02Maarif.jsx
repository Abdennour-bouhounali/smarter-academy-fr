import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE, RECALL_QUWAT, GUIDE } from '../content/textbook';

/**
 * Module 2 — معارف « دفتر رياض » (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater). Les lignes d'un cahier de camarade (autres nombres, les QUATRE TYPES
 * d'erreur de l'نشاط 4 : exposants multipliés dans un produit, signe d'un exposant ignoré dans un quotient, exposants ajoutés dans une puissance de puissance, plus la somme
 * de puissances) : l'élève juge chaque ligne, puis corrige l'exposant. Chaque encadré NOMME ce qu'il vient de voir (question → encadré → brique) avec les mots de la plateforme.
 * Le rappel de `quwat-adad-nisbi` (puissance bâtie facteur par facteur, quotient comme annulation) est un encadré « تذكّر » LIÉ — jamais reconstruit ici. LP : P1–P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

const LINES = [
  { id: 'l1', tex: '10^{4} \\times 10^{5} = 10^{9}', ok: true },
  { id: 'l2', tex: '10^{6} \\times 10^{2} = 10^{12}', ok: false },
  { id: 'l3', tex: '\\frac{10^{8}}{10^{3}} = 10^{5}', ok: true },
  { id: 'l4', tex: '10^{-6} \\times 10^{4} = 10^{10}', ok: false },
  { id: 'l5', tex: '\\frac{10^{4}}{10^{-3}} = 10^{1}', ok: false },
  { id: 'l6', tex: '(10^{2})^{5} = 10^{7}', ok: false },
];

export default function Module02Maarif() {
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['أيّ سطور الدفتر صحيحة؟', 'ما القواعد الثلاث؟', 'هل نجمع الأسّين حين نجمع قوتين؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — دفتر رياض"
      moduleSubtitle="ستة سطور في دفتر زميلة: أيّها صحيح؟"
      estimatedTime="12 دقيقة"
      steps={[
        {
          num: 1, title: 'أيّ سطور دفتر رياض صحيحة؟', subtitle: 'نحكم على ستة سطور', done: !!q.a,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm text-slate-600">كتبت رياض سطورًا في دفترها. أصحيح كل سطر أم خاطئ؟</p>}
                rows={LINES.map((l) => ({ id: l.id, label: `$${l.tex}$`, options: ['صحيح', 'خاطئ'], correct: l.ok ? 0 : 1 }))}
                requires={['jidaa-quwa-ashara', 'hasil-quwa-ashara', 'quwat-quwa-ashara']}
                feedback={({ allRight }) => (
                  <p className={`rounded-xl border-2 px-3 py-2 text-sm font-bold ${allRight ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-950'}`}>
                    {allRight ? 'حكمتَ على السطور الستة حكمًا صحيحًا. سنصحّح الأسّ في كل سطر خاطئ.' : 'السطور الصحيحة هي الأول والثالث فقط. سنصحّح الأسّ في كل سطر خاطئ.'}
                  </p>
                )}
                onAnswered={answered('a')}
              />
            </div>
          ),
        },
        {
          num: 2, title: 'ما الأسّ الصحيح في السطر الثاني؟', subtitle: 'جداء قوتين', done: !!q.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>كتبت رياض <MathText>{'$10^{6} \\times 10^{2} = 10^{12}$'}</MathText> . الأسّ الصحيح هو:</span>}
                options={[M('$10^{8}$'), M('$10^{4}$'), M('$10^{12}$')]}
                correct={0} cols={3} requires={['jidaa-quwa-ashara']}
                explain={<MathText>{`${GUIDE.darb.why} $10^{6} \\times 10^{2} = 10^{6+2} = 10^{8}$ .`}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <TextbookBox kind="property" compact title="القاعدة الأولى" text={KNOWLEDGE.product.text} source={KNOWLEDGE.product.source}>
                <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.product.example}</MathText></p>
              </TextbookBox>}
            </div>
          ),
        },
        {
          num: 3, title: 'وفي قسمة فيها أسّ سالب؟', subtitle: 'حاصل قسمة قوتين', done: !!q.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>كتبت رياض <MathText>{'$\\frac{10^{4}}{10^{-3}} = 10^{1}$'}</MathText> . الأسّ الصحيح هو:</span>}
                options={[M('$10^{-7}$'), M('$10^{7}$'), M('$10^{1}$')]}
                correct={1} cols={3} requires={['hasil-quwa-ashara']}
                explain={<MathText>{`${GUIDE.ishara.why} $\\frac{10^{4}}{10^{-3}} = 10^{4-(-3)} = 10^{7}$ .`}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <TextbookBox kind="property" compact title="القاعدة الثانية" text={KNOWLEDGE.quotient.text} source={KNOWLEDGE.quotient.source}>
                <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.quotient.example}</MathText></p>
              </TextbookBox>}
              {q.c && <TextbookBox kind="remark" compact title={RECALL_QUWAT.title} text={RECALL_QUWAT.text} source={RECALL_QUWAT.source}>
                <Link to={RECALL_QUWAT.path} data-recall-link className="inline-flex min-h-[44px] items-center text-sm font-black text-indigo-700 underline">{RECALL_QUWAT.linkText}</Link>
              </TextbookBox>}
            </div>
          ),
        },
        {
          num: 4, title: 'وفي قوة قوة؟', subtitle: 'قوة قوة', done: !!q.d,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>كتبت رياض <MathText>{'$(10^{2})^{5} = 10^{7}$'}</MathText> . الأسّ الصحيح هو:</span>}
                options={[M('$10^{25}$'), M('$10^{3}$'), M('$10^{10}$')]}
                correct={2} cols={3} requires={['quwat-quwa-ashara']}
                explain={<MathText>{`${GUIDE.quwaJam.why} ${GUIDE.quwaJam.right}`}</MathText>}
                onAnswered={answered('d')}
              />
              {q.d && <TextbookBox kind="property" compact title="القاعدة الثالثة" text={KNOWLEDGE.power.text} source={KNOWLEDGE.power.source}>
                <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.power.example}</MathText></p>
              </TextbookBox>}
              {q.d && <KnowledgeBrick id="qawaid-thalatha" lead="جداء وقسمة وقوة قوة: ماذا نفعل بالأسّين في كل حالة؟" />}
            </div>
          ),
        },
        {
          num: 5, title: 'وهل نجمع الأسّين في مجموع قوتين؟', subtitle: 'لا قاعدة للجمع', done: !!q.e,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>أرادت رياض أن تحسب <MathText>{'$10^{2} + 10^{3}$'}</MathText> فكتبت <MathText>{'$10^{5}$'}</MathText> . ما قيمته الصحيحة؟</span>}
                options={[M('$1\\,100$'), M('$100\\,000$'), M('$10^{6}$')]}
                correct={0} cols={3} requires={['qawaid-thalatha']}
                explain={<MathText>{`${GUIDE.majmu.why} ${GUIDE.majmu.right}`}</MathText>}
                onAnswered={answered('e')}
              />
              {q.e && <TextbookBox kind="remark" compact text={KNOWLEDGE.noSum.text} source={KNOWLEDGE.noSum.source} />}
              {q.e && <KnowledgeBrick id="majmu-laysa" lead="في الجمع نحسب كل قوة ثم نجمع: وماذا عن نصف $10^{10}$ ؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
