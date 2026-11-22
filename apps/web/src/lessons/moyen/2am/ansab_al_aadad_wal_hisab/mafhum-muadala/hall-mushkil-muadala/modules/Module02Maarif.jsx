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
 * Module 2 — معارف (idée de know-5) : le module OUVRE sur le labo SEUL (une tâche, `levels={false}` : la tâche du réservoir de 18 L et des 12 bouteilles), puis les noms. Les deux questions sur le labo (le remplissage et la valeur de x) sont
 * posées PAR-DESSUS lui (`JuiceLine › CHAINS.k1`) ; les étapes ci-dessous en gardent la TRACE, puis : le « تذكّر — السنة الأولى » (1AM `bahth-adad-naqisa`, leçon PUBLIÉE depuis le 2026-10-30 : AVEC lien), le « تذكّر — العبارة الحرفية » (`ibara-harfiya-intaj`,
 * leçon PUBLIÉE : avec lien), la définition de « معادلة » et de « حلّ », puis les trois formes et leurs opérations inverses. LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [trials, setTrials] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const cpOn = useLabCheckpointSettings('juice-line').enabled;
  const record = (e) => setTrials((l) => [...l, e]);
  const solved = trials.some((e) => e.kind === 'solved' && !e.free);
  const answered = (qid) => trials.some((e) => e.tk === 'checkpoint' && e.id === 'k1' && e.q === qid && (e.ok || e.revealed)) || (!cpOn && solved);
  const link = (code, text) => { const to = getLessonPath(code); return to ? <Link to={to} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>{text}</Link> : null; };
  return (
    <ContentModule
      objectives={['ما المعادلة؟ وما حلّها؟', 'كيف أتحقّق من حلّ؟', 'ما العملية العكسية في كلّ شكل من الأشكال الثلاثة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — المعادلة وحلّها"
      moduleSubtitle="معنى المعادلة والحلّ، والأشكال الثلاثة"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="juice-line" level="beginner" levels={false} tasks={[{ id: 'k1', kind: 'mould', total: 18, bottles: 12, tests: 2 }]} onTrial={record} />}
      steps={[
        {
          num: 1, title: 'المعادلة وحلّها', subtitle: '$\\frac{12}{x}=4$', done: answered('x') && q2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <p data-evidence="k1" data-tried={answered('x') ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${answered('x') ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {answered('x') ? M('في المختبر كانت السعة $x=18\\div12=1{,}5$ لتر، فامتلأت $12$ قارورة ولم يبق شيء؛ وأجبتَ عن السؤالين.') : 'أنجز مهمة المختبر (خزّان من 18 لترًا و12 قارورة) ثمّ أجب عن الأسئلة التي تظهر فوقه.'}
              </p>
              {answered('x') && (
                <>
                  <TextbookBox kind="remark" title={RECALLS.year1.title} text={RECALLS.year1.text} source={RECALLS.year1.source} compact>
                    {link(RECALLS.year1.lesson, 'درس « البحث عن أعداد ناقصة » — السنة الأولى متوسط')}
                  </TextbookBox>
                  <TextbookBox kind="remark" title={RECALLS.expression.title} text={RECALLS.expression.text} source={RECALLS.expression.source} compact>
                    {link(RECALLS.expression.lesson, 'درس « إنتاج عبارة حرفية واستعمالها » — السنة الثانية متوسط')}
                  </TextbookBox>
                  <TextbookBox kind="property" text={`${KNOWLEDGE.definition.text} ${KNOWLEDGE.definition.example}`} source={KNOWLEDGE.definition.source} compact />
                  <TapQuestion
                    prompt={<MathText>{'العدد $3$ حلّ للمعادلة $\\frac{12}{x}=4$ لأنّ:'}</MathText>}
                    options={[M('$12\\div3=4$'), M('$12-3=4$'), M('$3\\times4=4$')]}
                    correct={0} cols={3}
                    explain={<MathText>{'نعوّض $x$ بـ $3$ وننجز العملية الواحدة: $12\\div3=4$ ، فالمساواة صحيحة. ($12-3=9$ و $3\\times4=12$ .)'}</MathText>}
                    onAnswered={() => setQ2(true)}
                  />
                  {q2 && <KnowledgeBrick id="ta3rif-muadala" />}
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'الأشكال الثلاثة', subtitle: '$a\\times x$ ، $\\frac xa$ ، $\\frac ax$', done: q3,
          content: (
            <div className="space-y-3">
              <NumericQuestion prompt={<MathText>{'حلّ $2{,}5\\times x=10$ : $x=10\\div2{,}5=$'}</MathText>} expected={4}
                explain={<MathText>{'$2{,}5\\times4=10$ ، فالعامل الناقص $10\\div2{,}5=4$ . (وليس $25$ ولا $7{,}5$ .)'}</MathText>}
                onAnswered={() => setQ3(true)} />
              {q3 && (
                <>
                  <TextbookBox kind="property" text={`${KNOWLEDGE.forms.text} ${KNOWLEDGE.forms.example}`} source={KNOWLEDGE.forms.source} compact />
                  <KnowledgeBrick id="thalath-ashkal" variant="rappel" compact />
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
