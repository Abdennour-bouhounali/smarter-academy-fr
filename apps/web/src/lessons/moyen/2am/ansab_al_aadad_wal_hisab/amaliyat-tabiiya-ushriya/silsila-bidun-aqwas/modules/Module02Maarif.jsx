import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessonPath } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE, RECALL } from '../content/textbook';

/**
 * Module 2 — معارف : le module s'ouvre sur un labo (le MÊME type `tram-route`, monde `mixed`, posé seul `levels={false}`, une seule tâche : 50 − 4 × 6 + 30 ÷ 5) ; chaque encadré NOMME ce
 * que l'élève vient de faire (question → encadré → brique), avec les mots de la plateforme (guide §4ter-bis) : les trois règles, puis l'ACCORD que suit aussi la calculatrice scientifique
 * (une calculatrice dessinée, jamais tapée avec des parenthèses). Rappel de 1AM `mana-jam-tarh` (PUBLIÉE : lien). LP : P1, P2.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

/** Une calculatrice scientifique DESSINÉE (code, pas une image) : l'écran montre la ligne tapée et le résultat. */
function CalcScreen({ keys, result }) {
  return (
    <div className="mx-auto w-full max-w-xs rounded-2xl border-4 border-slate-700 bg-slate-800 p-3 shadow-md" data-calc aria-label="آلة حاسبة علمية">
      <div className="rounded-lg bg-lime-100 px-3 py-2 text-end font-mono text-sm text-slate-700" dir="ltr" data-calc-line>{keys}</div>
      <div className="mt-1 rounded-lg bg-lime-100 px-3 py-1 text-end font-mono text-2xl font-black text-slate-900" dir="ltr" data-calc-result>{result}</div>
    </div>
  );
}

export default function Module02Maarif() {
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const base = getLessonPath(RECALL.lesson);
  return (
    <ContentModule
      objectives={['أيّ العمليات تُحسب أوّلًا؟', 'كيف أحسب بقية السلسلة؟', 'ما القواعد الثلاث؟', 'لماذا نتّفق على قراءة واحدة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — قواعد الحساب"
      moduleSubtitle="أسمّي ما فعلتُه"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="tram-route" world={LAB.alone.world} tasks={LAB.alone.tasks} levels={false} />}
      steps={[
        {
          num: 1, title: 'أيّ العمليات حسبتَ أوّلًا؟', subtitle: 'في الرحلة الكاملة', done: !!q.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'في $50 - 4 \\times 6 + 30 \\div 5$ ، أيّ العمليات حسبتَ أوّلًا لتوافق العدّاد؟'}</MathText>}
                options={['$4 \\times 6$ و $30 \\div 5$', '$50 - 4$', '$6 + 30$'].map(M)}
                correct={0} cols={1} requires={['awlawiya']}
                explain={<MathText>{'الأفواج الأربعة تنزل كتلة واحدة $4 \\times 6 = 24$ ، وحصّة العربة من المنتظرين $30 \\div 5 = 6$ ؛ أمّا $50 - 4$ فيعامل العدد 4 كأنّه تلاميذ.'}</MathText>}
                onAnswered={answered('a')} />
              {q.a && <TextbookBox kind="property" compact text={KNOWLEDGE.priority.text} source={KNOWLEDGE.priority.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'ثم ماذا؟', subtitle: 'ما بقي يُحسب من اليسار', done: !!q.b,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'بعد حساب $4 \\times 6 = 24$ و $30 \\div 5 = 6$ تبقى $50 - 24 + 6$ . احسبها من اليسار:'}</MathText>}
                expected={32} display="32" requires={['yasar-yamin-jam']}
                explain={<MathText>{'$50 - 24 = 26$ ثم $26 + 6 = 32$ ، وهو ما قرأه العدّاد.'}</MathText>}
                onAnswered={answered('b')} />
              {q.b && <KnowledgeBrick id="qawaid-hisab" lead="نجمع ما فعلناه: كيف نحسب سلسلة دون أقواس؟" />}
              {q.b && <TextbookBox kind="property" compact text={KNOWLEDGE.addSub.text} source={KNOWLEDGE.addSub.source} />}
              {q.b && <TextbookBox kind="example" compact text={KNOWLEDGE.mulDiv.text} source={KNOWLEDGE.mulDiv.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'كم يساوي 56 ÷ 7 × 3 ؟', subtitle: 'ضرب وقسمة وحدهما', done: !!q.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'احسب $56 \\div 7 \\times 3$ :'}</MathText>}
                options={[M('$24$'), M('$\\frac{8}{3}$'), M('$168$')]}
                correct={0} cols={3} requires={['yasar-yamin-darb']}
                explain={<MathText>{'من اليسار: $56 \\div 7 = 8$ ثم $8 \\times 3 = 24$ . ($\\frac{8}{3}$ قسّم 56 على 21 أي 7 × 3؛ و 168 ضرب أوّلًا ثم لم يقسم.)'}</MathText>}
                onAnswered={answered('c')} />
              {q.c && (
                <TextbookBox kind="remark" title={RECALL.title} text={RECALL.text} source={RECALL.source} compact>
                  {base && <Link to={base} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>درس « معنى الجمع والطرح » — السنة الأولى متوسط</Link>}
                </TextbookBox>
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'ماذا تعرض الآلة الحاسبة؟', subtitle: 'قراءة واحدة يتّفق عليها الجميع', done: !!q.d,
          content: (
            <div className="space-y-3">
              <CalcScreen keys="15 + 3 × 4 =" result="27" />
              <TapQuestion
                prompt={<MathText>{'كتبنا على آلة حاسبة علمية $15 + 3 \\times 4$ ثم «=» فظهر $27$ . لماذا لم تُظهر $72$ ؟'}</MathText>}
                options={['لأنّها تحسب الضرب $3 \\times 4$ قبل الجمع', 'لأنّها لا تعرف الجمع', 'لأنّها تحسب من اليمين'].map(M)}
                correct={0} cols={1} requires={['qawaid-hisab']}
                explain={<MathText>{'الآلة العلمية تتبع الاتّفاق نفسه الذي اتّفقنا عليه: الضرب قبل الجمع، فتحسب $15 + 12 = 27$ .'}</MathText>}
                onAnswered={answered('d')} />
              {q.d && <KnowledgeBrick id="ittifaq" lead="لماذا نحسب جميعًا بالقواعد نفسها؟" />}
              {q.d && <TextbookBox kind="remark" compact text={KNOWLEDGE.agreement.text} source={KNOWLEDGE.agreement.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
