import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessonPath } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { useLabCheckpointSettings } from '../../../../../../common/manipulations/primitives/labCheckpointSettings';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { RECALLS, KNOWLEDGE } from '../content/textbook';

/**
 * Module 2 — معارف (idées de know-1 et know-2) : le module OUVRE sur le labo SEUL (une tâche, `levels={false}` : un rang de cellules, la règle puis la valeur pour n = 6), puis les noms. Les deux questions sur le labo (le nombre de tiges de six
 * cellules et la règle) sont posées PAR-DESSUS lui (`WaxCells › CHAINS.k1`) ; les étapes ci-dessous en gardent la TRACE, puis : le « تذكّر — السنة الأولى » (1AM `intaj-ibara-harfiya`, leçon PRÉVUE : SANS lien), la définition, « تذكّر —
 * الخاصية التوزيعية » (`tawzi-darb-jam-tarh`, avec le lien de sa leçon PUBLIÉE), les conventions d'écriture, puis a² et a³ et le mot d'al-Khwarizmi. LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [trials, setTrials] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const cpOn = useLabCheckpointSettings('wax-cells').enabled;
  const record = (e) => setTrials((l) => [...l, e]);
  const solved = trials.some((e) => e.kind === 'solved' && !e.free);
  const answered = (qid) => trials.some((e) => e.tk === 'checkpoint' && e.id === 'k1' && e.q === qid && (e.ok || e.revealed)) || (!cpOn && solved);
  const link = (code, text) => { const to = getLessonPath(code); return to ? <Link to={to} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>{text}</Link> : null; };
  return (
    <ContentModule
      objectives={['ماذا يمثّل الحرف في عبارة؟', 'متى نحذف إشارة الضرب؟', 'ماذا تعني $a^2$ و $a^3$ ؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — العبارة الحرفية"
      moduleSubtitle="الحرف عدد، واختصار الكتابة، والمربّع والمكعّب"
      estimatedTime="13 دقيقة"
      intro={<Manipulation type="wax-cells" level="beginner" levels={false} tasks={[{ id: 'k1', kind: 'rule', targets: [3, 6] }]} onTrial={record} />}
      steps={[
        {
          num: 1, title: 'العبارة الحرفية', subtitle: '$5n+1$', done: answered('rule') && q2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <p data-evidence="k1" data-tried={answered('rule') ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${answered('rule') ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {answered('rule') ? M('في المختبر عدّ اللوح $31$ عودًا لصفّ من $6$ خلايا، وهو ما تعطيه $5\\times 6+1$ ؛ وأجبتَ عن القاعدة.') : 'أنجز مهمة المختبر (صفّ من ست خلايا) واكتب القاعدة، ثم أجب عن الأسئلة التي تظهر فوقه.'}
              </p>
              {answered('rule') && (
                <>
                  <TextbookBox kind="remark" title={RECALLS.year1.title} text={RECALLS.year1.text} source={RECALLS.year1.source} compact />
                  <TextbookBox kind="property" text={`${KNOWLEDGE.definition.text} ${KNOWLEDGE.definition.example}`} source={KNOWLEDGE.definition.source} compact />
                  <TapQuestion
                    prompt={<MathText>{'محيط مربّع ضلعه $x$ يُكتب:'}</MathText>}
                    options={[M('$4\\times x$'), M('$x+4$'), M('$x^4$')]}
                    correct={0} cols={3}
                    explain={<MathText>{'للمربّع أربعة أضلاع متساوية: $4\\times x=4x$ . ($x+4$ يجمع ضلعًا وعدد الأضلاع؛ و $x^4$ ضرب $x$ في نفسه أربع مرّات.)'}</MathText>}
                    onAnswered={() => setQ2(true)}
                  />
                  {q2 && <KnowledgeBrick id="ta3rif" />}
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'اختصار الكتابة', subtitle: '$5\\times n=5n$', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="remark" title={RECALLS.distributive.title} text={RECALLS.distributive.text} source={RECALLS.distributive.source} compact>
                {link(RECALLS.distributive.lesson, 'درس « توزيع الضرب على الجمع والطرح » — السنة الثانية متوسط')}
              </TextbookBox>
              <TapQuestion prompt={<MathText>{'نكتب $7\\times(a+1)$ بأبسط شكل:'}</MathText>}
                options={[M('$7(a+1)$'), M('$7a+1$'), M('$7+a1$')]} correct={0} cols={3}
                explain={<MathText>{'نحذف $\\times$ أمام القوس: $7(a+1)$ . ($7a+1$ يضرب الـ $7$ في $a$ وحده.)'}</MathText>}
                onAnswered={() => setQ3(true)} />
              {q3 && (
                <>
                  <TextbookBox kind="property" text={`${KNOWLEDGE.conventions.text} ${KNOWLEDGE.conventions.example}`} source={KNOWLEDGE.conventions.source} compact />
                  <KnowledgeBrick id="ikhtisar-kitaba" variant="rappel" compact />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'المربّع والمكعّب', subtitle: '$a\\times a=a^2$', done: q4,
          content: (
            <div className="space-y-3">
              <NumericQuestion prompt={<MathText>{'قيمة $x^2$ من أجل $x=4$ :'}</MathText>} expected={16}
                explain={<MathText>{'$x^2=x\\times x=4\\times 4=16$ . (وليس $4\\times 2=8$ .)'}</MathText>}
                onAnswered={() => setQ4(true)} />
              {q4 && (
                <>
                  <TextbookBox kind="property" text={`${KNOWLEDGE.powers.text} ${KNOWLEDGE.powers.example}`} source={KNOWLEDGE.powers.source} compact />
                  <TextbookBox kind="remark" title="هل تعلم؟" text={KNOWLEDGE.history.text} source={KNOWLEDGE.history.source} compact />
                  <KnowledgeBrick id="murabba-mukaab" variant="rappel" compact />
                </>
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
