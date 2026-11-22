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
import { RECALLS, KNOWLEDGE, LAB } from '../content/textbook';

/**
 * Module 2 — معارف (idée de know-2c) : le module OUVRE sur le labo SEUL (une tâche, `levels={false}` : 3/4 × 2/5 sur une fenêtre à 4 crans de rail et 5 crans de cordon), puis les noms. Les deux questions sur le labo
 * (l'écriture réduite et la règle) sont posées PAR-DESSUS lui (`WindowBlinds › CHAINS.k1`) ; les étapes ci-dessous en gardent la TRACE, puis : les « تذكّر » (1AM `kusur-ashriya-kitaba` avec le lien de sa leçon PUBLIÉE ;
 * « كسر من عدد » = leçon PRÉVUE de 1AM, SANS lien ; le quotient avec le lien de `hasil-qisma-kasr`), la règle du produit, la règle « naturel × fraction » (et le décimal), puis « de » = ×. LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [trials, setTrials] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const cpOn = useLabCheckpointSettings('window-blinds').enabled;
  const record = (e) => setTrials((l) => [...l, e]);
  const solved = trials.some((e) => e.kind === 'solved' && !e.free);
  const answered = (qid) => trials.some((e) => e.tk === 'checkpoint' && e.id === 'k1' && e.q === qid && (e.ok || e.revealed)) || (!cpOn && solved);
  const link = (code, text) => { const to = getLessonPath(code); return to ? <Link to={to} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>{text}</Link> : null; };
  return (
    <ContentModule
      objectives={['ماذا أفعل بالبسطين وبالمقامين حين أضرب كسرين؟', 'وكيف أضرب عددًا طبيعيًا في كسر؟', 'ماذا تعني كلمة «من» بعد كسر؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — جداء كسرين"
      moduleSubtitle="البسطان معًا والمقامان معًا، وعدد في كسر، وكسر من كسر"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="window-blinds" level="beginner" levels={false} tasks={[{ id: 'k1', curtain: LAB.maarif.curtain, blind: LAB.maarif.blind, W: 1, H: 1 }]} onTrial={record} />}
      steps={[
        {
          num: 1, title: 'تذكّر ثم قاعدة الجداء', subtitle: '$\\frac{3}{4}\\times\\frac{2}{5}=\\frac{3}{10}$', done: answered('ruleK') && q4,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <p data-evidence="k1" data-tried={answered('ruleK') ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${answered('ruleK') ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {answered('ruleK') ? M('في المختبر كانت $4\\times 5=20$ مربّعًا صغيرًا والداكن منها $3\\times 2=6$ : $\\frac{6}{20}=\\frac{3}{10}$ ، وأجبتَ عن القاعدة.') : 'أنجز مهمة المختبر (3/4 و2/5) واكتب الجزء المظلم، ثم أجب عن الأسئلة التي تظهر فوقه.'}
              </p>
              {answered('ruleK') && (
                <>
                  <TextbookBox kind="remark" title={RECALLS.decimal.title} text={RECALLS.decimal.text} source={RECALLS.decimal.source} compact>
                    {link(RECALLS.decimal.lesson, 'درس « كتابة الكسور العشرية » — السنة الأولى متوسط')}
                  </TextbookBox>
                  <TextbookBox kind="remark" title={RECALLS.ofNumber.title} text={RECALLS.ofNumber.text} source={RECALLS.ofNumber.source} compact />
                  <TextbookBox kind="property" text={`${KNOWLEDGE.product.text} ${KNOWLEDGE.product.example}`} source={KNOWLEDGE.product.source} compact />
                  <TapQuestion
                    prompt={<MathText>{'ما قيمة $\\frac{2}{9}\\times\\frac{3}{4}$ بعد الاختزال؟'}</MathText>}
                    options={[M('$\\frac{1}{6}$'), M('$\\frac{5}{13}$'), M('$\\frac{6}{36}$')]}
                    correct={0} cols={3} requires={['qaida-jida']}
                    explain={<MathText>{'$\\frac{2\\times 3}{9\\times 4}=\\frac{6}{36}$ ثم نقسم الحدّين على $6$ : $\\frac{1}{6}$ . ($\\frac{6}{36}$ لم تُختزل؛ و $\\frac{5}{13}$ جمعٌ للبسطين والمقامين.)'}</MathText>}
                    onAnswered={() => setQ4(true)}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'عدد طبيعي في كسر', subtitle: '$4\\times\\frac{3}{11}$', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="remark" title={RECALLS.quotient.title} text={RECALLS.quotient.text} source={RECALLS.quotient.source} compact>
                {link(RECALLS.quotient.lesson, 'درس « حاصل القسمة والكسر » — السنة الأولى متوسط')}
              </TextbookBox>
              <NumericQuestion prompt={<MathText>{'نكتب $4=\\frac{4}{1}$ فنجد $4\\times\\frac{3}{11}=\\frac{4\\times 3}{1\\times 11}=\\frac{\\ldots}{11}$ . البسط:'}</MathText>} expected={12}
                requires={['adad-fi-kasr']} explain={<MathText>{'$4\\times 3=12$ والمقام $1\\times 11=11$ ، فالجداء $\\frac{12}{11}$ وهو أكبر من $1$ .'}</MathText>}
                onAnswered={() => setQ2(true)} />
              {q2 && (
                <>
                  <TextbookBox kind="property" text={`${KNOWLEDGE.natural.text} ${KNOWLEDGE.natural.example}`} source={KNOWLEDGE.natural.source} compact />
                  <TextbookBox kind="property" text={KNOWLEDGE.decimal.text} source={KNOWLEDGE.decimal.source} compact />
                  <KnowledgeBrick id="qaida-jida-maarif" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'كلمة «من» تعني الضرب', subtitle: '$\\frac{3}{4}$ من $\\frac{2}{5}$', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'ما $\\frac{3}{4}$ من $\\frac{2}{5}$ ؟'}</MathText>}
                options={[M('$\\frac{3}{10}$'), M('$\\frac{23}{20}$'), M('$\\frac{5}{9}$')]}
                correct={0} cols={3} requires={['juz-min-juz']}
                explain={<MathText>{'«من» ضرب: $\\frac{3}{4}\\times\\frac{2}{5}=\\frac{6}{20}=\\frac{3}{10}$ . ($\\frac{23}{20}$ هو مجموع الكسرين، ولا يصحّ لأنّه أكبر من $\\frac{2}{5}$ بكثير.)'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <>
                  <TextbookBox kind="property" text={`${KNOWLEDGE.of.text} ${KNOWLEDGE.of.example}`} source={KNOWLEDGE.of.source} compact />
                  <KnowledgeBrick id="juz-min-juz" variant="rappel" compact />
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
