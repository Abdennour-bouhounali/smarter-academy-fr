import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessonPath } from '@smarter-academy/core';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { useLabCheckpointSettings } from '../../../../../../common/manipulations/primitives/labCheckpointSettings';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { RECALLS, KNOWLEDGE, LAB } from '../content/textbook';

/**
 * Module 2 — معارف (idée de know-3a…3c) : le module OUVRE sur le labo SEUL (une tâche, `levels={false}` : 2/3 | 5/6, tubes en tiers et en sixièmes), puis les noms. Les deux questions sur le labo (la lecture et la règle)
 * sont posées PAR-DESSUS lui (`LevelLaser › CHAINS.k1`) ; les étapes ci-dessous en gardent la TRACE, puis : les trois « تذكّر » (1AM `ikhtizal-kitaba-kasriya`, 1AM `hasil-qisma-kasr`, `jam-tarh-kusur`, chacun avec le
 * lien de sa leçon PUBLIÉE), les quatre règles (nos mots, nos exemples) et la brique. LP : P1, P2, P3, P4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [trials, setTrials] = useState([]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const cpOn = useLabCheckpointSettings('level-laser').enabled;
  const record = (e) => setTrials((l) => [...l, e]);
  const solved = trials.some((e) => e.kind === 'solved' && !e.free);
  const answered = (qid) => trials.some((e) => e.tk === 'checkpoint' && e.id === 'k1' && e.q === qid && (e.ok || e.revealed)) || (!cpOn && solved);
  const link = (code, text) => { const to = getLessonPath(code); return to ? <Link to={to} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>{text}</Link> : null; };
  const box = (r, label) => (
    <TextbookBox kind="remark" title={r.title} text={r.text} source={r.source} compact>
      {link(r.lesson, label)}
    </TextbookBox>
  );
  return (
    <ContentModule
      objectives={['ماذا أفعل حين يكون مقام أحد الكسرين مضاعفًا لمقام الآخر؟', 'وماذا حين يتساوى المقام أو البسط؟', 'وكيف أقارن كسرًا بالعدد $1$ ؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — قواعد المقارنة"
      moduleSubtitle="نوحّد المقامين أو نقارن البسطين أو نستعمل العدد واحد"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="level-laser" level="beginner" levels={false} tasks={[{ id: 'k1', tanks: [LAB.maarif.left, LAB.maarif.right] }]} onTrial={record} />}
      steps={[
        {
          num: 1, title: 'تذكّر ثم توحيد المقامين', subtitle: '$\\frac{2}{3}=\\frac{4}{6}<\\frac{5}{6}$', done: answered('ruleK') && q1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <p data-evidence="k1" data-tried={answered('ruleK') ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${answered('ruleK') ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {answered('ruleK') ? M('في المختبر قطع الليزر عند زيت $\\frac{2}{3}$ الأنبوب الآخر عند العلامة $4$ من $6$ : $\\frac{2}{3}=\\frac{4}{6}<\\frac{5}{6}$ ، وأجبتَ عن القاعدة.') : 'أنجز مهمة المختبر (2/3 و5/6) ثم أجب عن الأسئلة التي تظهر فوقه.'}
              </p>
              {answered('ruleK') && (
                <>
                  {box(RECALLS.equal, 'درس « اختزال كتابة كسرية » — السنة الأولى متوسط')}
                  {box(RECALLS.unify, 'درس « جمع وطرح كسرين » — السنة الثانية متوسط')}
                  <TextbookBox kind="property" text={`${KNOWLEDGE.multiple.text} ${KNOWLEDGE.multiple.example}`} source={KNOWLEDGE.multiple.source} compact />
                  <TapQuestion
                    prompt={<MathText>{'كيف نقارن $\\frac{5}{12}$ و $\\frac{3}{4}$ ؟'}</MathText>}
                    options={[M('نكتب $\\frac{3}{4}$ بمقام $12$ فنجد $\\frac{9}{12}$ ثم نقارن $5$ و $9$'), M('نقارن $5$ و $3$ مباشرة'), M('نقارن $12$ و $4$ فقط')]}
                    correct={0} cols={1} requires={['tawhid-li-muqarana']}
                    explain={<MathText>{'$12=4\\times 3$ ، فنضرب حدّي $\\frac{3}{4}$ في $3$ : $\\frac{9}{12}$ ، و $5<9$ إذن $\\frac{5}{12}<\\frac{3}{4}$ . (مقارنة $5$ و $3$ وحدهما تخدع لأنّ المقامين مختلفان.)'}</MathText>}
                    onAnswered={() => setQ1(true)}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'نفس المقام ونفس البسط', subtitle: '$\\frac{4}{11}<\\frac{9}{11}$ ، $\\frac{7}{9}>\\frac{7}{12}$', done: q2,
          content: (
            <div className="space-y-3">
              {box(RECALLS.quotient, 'درس « حاصل القسمة والكسر » — السنة الأولى متوسط')}
              <TextbookBox kind="property" text={`${KNOWLEDGE.sameDen.text} ${KNOWLEDGE.sameDen.example}`} source={KNOWLEDGE.sameDen.source} compact />
              <TapQuestion
                prompt={<MathText>{'أيّ الكسرين أكبر: $\\frac{7}{9}$ أم $\\frac{7}{12}$ ؟'}</MathText>}
                options={[M('$\\frac{7}{9}$'), M('$\\frac{7}{12}$'), M('متساويان')]}
                correct={0} cols={3} requires={['nafs-al-bast']}
                explain={<MathText>{'البسط نفسه $7$ ، والأصغر مقامًا هو الأكبر: $9<12$ إذن $\\frac{7}{9}>\\frac{7}{12}$ .'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <TextbookBox kind="property" text={`${KNOWLEDGE.sameNum.text} ${KNOWLEDGE.sameNum.example}`} source={KNOWLEDGE.sameNum.source} compact />}
            </div>
          ),
        },
        {
          num: 3, title: 'المقارنة بالعدد 1', subtitle: '$\\frac{11}{13}<1<\\frac{13}{12}$', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'قارن $\\frac{11}{13}$ و $\\frac{13}{12}$ .'}</MathText>}
                options={[M('$\\frac{11}{13}<1<\\frac{13}{12}$ إذن $\\frac{11}{13}<\\frac{13}{12}$'), M('$\\frac{11}{13}>\\frac{13}{12}$ لأنّ $11<13$'), M('متساويان')]}
                correct={0} cols={1} requires={['muqarana-bi-1']}
                explain={<MathText>{'$11<13$ فالأوّل أصغر من $1$ ، و $13>12$ فالثاني أكبر من $1$ ، إذن الأوّل أصغر.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <>
                  <TextbookBox kind="property" text={`${KNOWLEDGE.one.text} ${KNOWLEDGE.one.example}`} source={KNOWLEDGE.one.source} compact />
                  <KnowledgeBrick id="qawaid-muqarana" />
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
