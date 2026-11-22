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
 * Module 2 — معارف (idées de know-3 et know-4) : le module OUVRE sur le labo SEUL (une tâche, `levels={false}` : la règle de b1 et une première pesée à 12 sacs, 4000 + 50 × 12 = 4600 < 5000), puis les noms. La question sur le labo (ce qu'a écrit l'écran)
 * est posée PAR-DESSUS lui (`BridgeLoad › CHAINS.k1`) ; les étapes ci-dessous en gardent la TRACE, puis : le « تذكّر — السنة الأولى » (1AM `tatbiq-qaida-harfiya`, leçon PUBLIÉE depuis le 2026-10-30 : AVEC lien), le « تذكّر — المجموع الجبري » (`majmu-jabri`, leçon PUBLIÉE :
 * avec lien), la définition du test d'une égalité, le « تذكّر — خاصية التوزيع » (`tawzi-darb-jam-tarh`, avec lien), deux expressions égales, le contre-exemple, le test d'une inégalité et les quatre signes. Jamais « معادلة » ni « حلّ ». LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [trials, setTrials] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const cpOn = useLabCheckpointSettings('bridge-load').enabled;
  const record = (e) => setTrials((l) => [...l, e]);
  const solved = trials.some((e) => e.kind === 'solved' && !e.free);
  const answered = (qid) => trials.some((e) => e.tk === 'checkpoint' && e.id === 'k1' && e.q === qid && (e.ok || e.revealed)) || (!cpOn && solved);
  const link = (code, text) => { const to = getLessonPath(code); return to ? <Link to={to} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>{text}</Link> : null; };
  return (
    <ContentModule
      objectives={['كيف أختبر صحّة مساواة من أجل قيمة؟', 'متى تكون عبارتان حرفيتان متساويتين؟ وماذا يكفي لإثبات أنّهما غير متساويتين؟', 'كيف أختبر متباينة؟ وما الرموز الأربعة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — اختبار المساواة والمتباينة"
      moduleSubtitle="التعويض والحساب والمقارنة، والمثال المضادّ، والرموز الأربعة"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="bridge-load" level="beginner" levels={false} tasks={[{ id: 'k1', rule: '4000+50x<5000', loads: [12] }]} onTrial={record} />}
      steps={[
        {
          num: 1, title: 'اختبار مساواة', subtitle: '$3x+2=2x+9$', done: answered('line') && q2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <p data-evidence="k1" data-tried={answered('line') ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${answered('line') ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {answered('line') ? M('في المختبر كتب الميزان $4000+50\\times12=4600$ ثمّ قارن $4600<5000$ : عوّض ثمّ حسب الطرف ثمّ قارن.') : 'مرّر الشاحنة المحمّلة بـ 12 كيسًا على الميزان ثمّ أجب عن السؤال الذي يظهر فوقه.'}
              </p>
              {answered('line') && (
                <>
                  <TextbookBox kind="remark" title={RECALLS.year1.title} text={RECALLS.year1.text} source={RECALLS.year1.source} compact>
                    {link(RECALLS.year1.lesson, 'درس « تطبيق قاعدة حرفية » — السنة الأولى متوسط')}
                  </TextbookBox>
                  <TextbookBox kind="remark" title={RECALLS.jabri.title} text={RECALLS.jabri.text} source={RECALLS.jabri.source} compact>
                    {link(RECALLS.jabri.lesson, 'درس « حساب مجموع جبري » — السنة الثانية متوسط')}
                  </TextbookBox>
                  <TextbookBox kind="property" text={`${KNOWLEDGE.test.text} ${KNOWLEDGE.test.example}`} source={KNOWLEDGE.test.source} compact />
                  <TapQuestion
                    prompt={<MathText>{'المساواة $3x+2=2x+9$ من أجل $x=5$ :'}</MathText>}
                    options={[M('خاطئة: الطرفان $17$ و $19$'), M('صحيحة: الطرفان $17$ و $17$'), M('صحيحة لأنّ $5$ موجب')]}
                    correct={0} cols={1}
                    explain={<MathText>{'نعوّض: $3\\times5+2=17$ و $2\\times5+9=19$ ، والعددان مختلفان، فالمساواة خاطئة من أجل $x=5$ (وصحيحة من أجل $x=7$).'}</MathText>}
                    onAnswered={() => setQ2(true)}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'عبارتان متساويتان', subtitle: '$x^2+4$ و $5x$', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="remark" title={RECALLS.tawzi.title} text={RECALLS.tawzi.text} source={RECALLS.tawzi.source} compact>
                {link(RECALLS.tawzi.lesson, 'درس « خاصية التوزيع » — السنة الثانية متوسط')}
              </TextbookBox>
              <TextbookBox kind="property" text={`${KNOWLEDGE.equal.text} ${KNOWLEDGE.equal.example}`} source={KNOWLEDGE.equal.source} compact />
              <TapQuestion
                prompt={<MathText>{'العبارتان $x^2+4$ و $5x$ تعطيان $5$ و $5$ من أجل $x=1$ ، ومن أجل $x=0$ تعطيان $4$ و $0$ . هما:'}</MathText>}
                options={[M('غير متساويتين'), M('متساويتان لأنّهما تساويتا مرّة'), M('متساويتان لأنّ $x=0$ خاصّ')]}
                correct={0} cols={1}
                explain={<MathText>{'من أجل $x=0$ نجد $4\\neq0$ : مثال مضادّ واحد يكفي لنقول إنّهما غير متساويتين. أمّا التساوي من أجل $x=1$ فلا يثبت شيئًا.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <>
                  <TextbookBox kind="property" text={`${KNOWLEDGE.counter.text} ${KNOWLEDGE.counter.example}`} source={KNOWLEDGE.counter.source} compact />
                  <KnowledgeBrick id="tasawi-ibaratayn" variant="rappel" compact />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'اختبار متباينة', subtitle: '$3+5x<20$', done: q4,
          content: (
            <div className="space-y-3">
              <NumericQuestion prompt={<MathText>{'نختبر $3+5x<20$ من أجل $x=4$ : $3+5\\times4=$'}</MathText>} expected={23}
                explain={<MathText>{'$3+5\\times4=23$ ، و $23<20$ خاطئة: المتباينة خاطئة من أجل $x=4$ (وصحيحة من أجل $x=3$ لأنّ $18<20$).'}</MathText>}
                onAnswered={() => setQ4(true)} />
              {q4 && (
                <>
                  <TextbookBox kind="property" text={`${KNOWLEDGE.inequality.text} ${KNOWLEDGE.inequality.example}`} source={KNOWLEDGE.inequality.source} compact />
                  <KnowledgeBrick id="ikhtibar-mutabayina" />
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
