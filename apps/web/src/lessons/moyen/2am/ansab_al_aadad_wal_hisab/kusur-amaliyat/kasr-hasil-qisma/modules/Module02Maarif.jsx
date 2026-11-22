import { useState } from 'react';
import { Link } from 'react-router-dom';
import { parseDec, getLessonPath } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { useLabCheckpointSettings } from '../../../../../../common/manipulations/primitives/labCheckpointSettings';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { RECALLS, KNOWLEDGE, LAB } from '../content/textbook';

/**
 * Module 2 — معارف (idée de know-1c, know-1d, know-1e) : le module OUVRE sur le labo SEUL (une tâche, `levels={false}` : 10 m en 7 cordes, rang 0,1 puis 0,01 : 1,42 | 1,43), puis les noms. Les deux questions
 * sur le labo (l'écriture du حصر et la valeur exacte) sont posées PAR-DESSUS lui (`MooringLines › CHAINS.k1`) ; les étapes ci-dessous en gardent la TRACE, puis : les trois « تذكّر » (chacun avec le lien de
 * sa leçon PUBLIÉE : 1AM hasil-qisma-kasr, 1AM ikhtizal-kitaba-kasriya, qisma-iqlidiya-hasr), les mots « نسبة » et « كتابة كسرية », puis la division par un décimal. LP : P1, P2, P4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [trials, setTrials] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const cpOn = useLabCheckpointSettings('mooring-lines').enabled;
  const record = (e) => setTrials((l) => [...l, e]);
  const bk = trials.findLast((e) => e.kind === 'bracket' && !e.free && e.rank === 2);
  const answered = (qid) => trials.some((e) => e.tk === 'checkpoint' && e.id === 'k1' && e.q === qid && (e.ok || e.revealed)) || (!cpOn && !!bk);
  const link = (code, text) => { const to = getLessonPath(code); return to ? <Link to={to} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>{text}</Link> : null; };
  const Evidence = ({ ok, done, todo }) => (
    <p data-evidence="k1" data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>{ok ? done : todo}
    </p>
  );
  return (
    <ContentModule
      objectives={['ما القيمة المضبوطة لحاصل قسمة؟', 'ماذا نسمّي القيمتين المقرّبتين؟', 'ما معنى « نسبة a إلى b » ؟', 'كيف أقسم على عدد عشري؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — النسبة والقيم المقرّبة"
      moduleSubtitle="قيمة مضبوطة وقيمتان مقرّبتان، ونسبة، وقاسم عشري"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="mooring-lines" level="beginner" levels={false} tasks={[{ id: 'k1', kind: 'share', a: LAB.maarif.a, b: LAB.maarif.b, maxRank: 2 }]} onTrial={record} />}
      steps={[
        {
          num: 1, title: 'القيمة المضبوطة والقيمتان المقرّبتان', subtitle: '$1{,}42 < \\frac{10}{7} < 1{,}43$', done: answered('names'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence ok={!!bk && answered('names')}
                done={M(`في المختبر وجدتَ $${bk?.lo?.replace(',', '{,}')} < \\frac{10}{7} < ${bk?.hi?.replace(',', '{,}')}$ ، وأجبتَ عن القيمة المضبوطة: هي $\\frac{10}{7}$ نفسه.`)}
                todo="أنجز مهمة المختبر (10 m في 7 قطع) حتى السنتيمتر، ثم أجب عن الأسئلة التي تظهر فوقه." />
              {answered('names') && (
                <>
                  <TextbookBox kind="remark" title={RECALLS.quotient.title} text={RECALLS.quotient.text} source={RECALLS.quotient.source} compact>
                    {link(RECALLS.quotient.lesson, 'درس « حاصل القسمة كسر » — السنة الأولى متوسط')}
                  </TextbookBox>
                  <TextbookBox kind="remark" title={RECALLS.unit.title} text={RECALLS.unit.text} source={RECALLS.unit.source} compact>
                    {link(RECALLS.unit.lesson, 'درس « القسمة الإقليدية وحصر حاصل القسمة »')}
                  </TextbookBox>
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'نسبة a إلى b', subtitle: '$\\frac{12}{28}$', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'من بين $28$ تلميذًا في القسم يشترك $12$ في نادي المطالعة. نسبتهم إلى القسم هي:'}</MathText>}
                options={[M('$\\frac{12}{28}$'), M('$\\frac{28}{12}$'), M('$\\frac{12}{16}$')]}
                correct={0}
                cols={3}
                requires={['kasr-hasil-qisma-1am']}
                explain={<MathText>{'نسبة $12$ إلى $28$ هي $\\frac{12}{28}$ ، وتساوي $\\frac{3}{7}$ بالقسمة على $4$ .  ($\\frac{12}{16}$ تقارنهم بالتلاميذ الباقين، لا بالقسم كلّه.)'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && (
                <>
                  <TextbookBox kind="remark" title={RECALLS.equal.title} text={RECALLS.equal.text} source={RECALLS.equal.source} compact>
                    {link(RECALLS.equal.lesson, 'درس « اختزال كتابة كسرية » — السنة الأولى متوسط')}
                  </TextbookBox>
                  <TextbookBox kind="definition" text={`${KNOWLEDGE.nisba.text} ${KNOWLEDGE.nisba.fractional}`} source={KNOWLEDGE.nisba.source} compact />
                  <KnowledgeBrick id="nisba-kasriya" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'قاسم عشري: نجعله طبيعيًا', subtitle: '$\\frac{4{,}2}{0{,}35}$', done: q3,
          content: (
            <div className="space-y-3">
              <NumericQuestion prompt={<MathText>{'نضرب حدّي $\\frac{4{,}2}{0{,}35}$ في $100$ ليصير المقام طبيعيًا: $\\frac{4{,}2}{0{,}35} = \\frac{\\ldots}{35}$ . البسط:'}</MathText>} expected={420} parse={parseDec}
                requires={['kasr-mutasawi-1am']} explain={<MathText>{'$4{,}2 \\times 100 = 420$ و $0{,}35 \\times 100 = 35$ ، ثم $\\frac{420}{35} = 12$ لأنّ $35 \\times 12 = 420$ . (في $0{,}35$ رقمان بعد الفاصلة، فنضرب في $100$ لا في $10$ .)'}</MathText>}
                onAnswered={() => setQ3(true)} />
              {q3 && <KnowledgeBrick id="qisma-ashari" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
