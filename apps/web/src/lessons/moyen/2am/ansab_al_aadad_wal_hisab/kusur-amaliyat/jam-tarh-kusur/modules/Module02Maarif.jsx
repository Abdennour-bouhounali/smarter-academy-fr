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
 * Module 2 — معارف (idée de know-2a, know-2b) : le module OUVRE sur le labo SEUL (une tâche, `levels={false}` : 3/8 puis 1/4 sur un sentier de huit poteaux), puis les noms. Les deux questions sur le labo (la somme
 * et la règle) sont posées PAR-DESSUS lui (`TrailOdometer › CHAINS.k1`) ; les étapes ci-dessous en gardent la TRACE, puis : les « تذكّر » (1AM `kusur-ashriya-kitaba` et `ikhtizal-kitaba-kasriya`, chacun avec le lien
 * de sa leçon PUBLIÉE ; la comparaison à même dénominateur : UNE phrase SANS lien, leçon suivante de l'unité), la règle 1 (même dénominateur, ex. décimaux), la règle 2 (un multiple), la règle 3 (le reste). LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [trials, setTrials] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const cpOn = useLabCheckpointSettings('trail-odometer').enabled;
  const record = (e) => setTrials((l) => [...l, e]);
  const solved = trials.some((e) => e.kind === 'solved' && !e.free);
  const answered = (qid) => trials.some((e) => e.tk === 'checkpoint' && e.id === 'k1' && e.q === qid && (e.ok || e.revealed)) || (!cpOn && solved);
  const link = (code, text) => { const to = getLessonPath(code); return to ? <Link to={to} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>{text}</Link> : null; };
  return (
    <ContentModule
      objectives={['ماذا أفعل بكسرين لهما نفس المقام؟', 'وإذا كان مقام أحدهما مضاعفًا للآخر؟', 'كيف أجد الباقي من الكلّ؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — جمع الكسور وطرحها"
      moduleSubtitle="المقام نفسه، ومقام مضاعف، والباقي من الكلّ"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="trail-odometer" level="beginner" levels={false} tasks={[{ id: 'k1', n: LAB.maarif.n, k: LAB.maarif.k, legs: LAB.maarif.legs }]} onTrial={record} />}
      steps={[
        {
          num: 1, title: 'تذكّر ثم قاعدة المقام نفسه', subtitle: '$\\frac{3}{8}+\\frac{1}{4}=\\frac{5}{8}$', done: answered('ruleMulti') && q4,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <p data-evidence="k1" data-tried={answered('ruleMulti') ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${answered('ruleMulti') ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {answered('ruleMulti') ? M('في المختبر مشى الفوج $3$ أعمدة ثم ربعًا (أي $2$ من الأعمدة البيضاء) فبلغ $\\frac{5}{8}$ ، وأجبتَ عن القاعدة.') : 'أنجز مهمة المختبر (3/8 ثم ربع المسلك) واكتب أين وصل الفوج، ثم أجب عن الأسئلة التي تظهر فوقه.'}
              </p>
              {answered('ruleMulti') && (
                <>
                  <TextbookBox kind="remark" title={RECALLS.decimal.title} text={RECALLS.decimal.text} source={RECALLS.decimal.source} compact>
                    {link(RECALLS.decimal.lesson, 'درس « كتابة الكسور العشرية » — السنة الأولى متوسط')}
                  </TextbookBox>
                  <TextbookBox kind="remark" title={RECALLS.equal.title} text={RECALLS.equal.text} source={RECALLS.equal.source} compact>
                    {link(RECALLS.equal.lesson, 'درس « اختزال كتابة كسرية » — السنة الأولى متوسط')}
                  </TextbookBox>
                  <TextbookBox kind="remark" title={RECALLS.compare.title} text={RECALLS.compare.text} source={RECALLS.compare.source} compact>
                    {link(RECALLS.compare.lesson, 'درس « مقارنة كسرين »')}
                  </TextbookBox>
                  <TextbookBox kind="property" text={`${KNOWLEDGE.same.text} ${KNOWLEDGE.same.example}`} source={KNOWLEDGE.same.source} compact />
                  <TapQuestion
                    prompt={<MathText>{'ما قيمة $\\frac{3{,}2}{3}-\\frac{1{,}6}{3}$ ؟'}</MathText>}
                    options={[M('$\\frac{1{,}6}{3}$'), M('$\\frac{1{,}6}{6}$'), M('$\\frac{4{,}8}{3}$')]}
                    correct={0} cols={3} requires={['nafs-al-maqam']}
                    explain={<MathText>{'البسطان عشريان والمقام نفسه: $3{,}2-1{,}6=1{,}6$ ونحافظ على المقام $3$ : $\\frac{1{,}6}{3}$ . ($\\frac{4{,}8}{3}$ جمعٌ بدل الطرح.)'}</MathText>}
                    onAnswered={() => setQ4(true)}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'مقام أحدهما مضاعف للآخر', subtitle: '$\\frac{11}{18}-\\frac{1}{6}$', done: q2,
          content: (
            <div className="space-y-3">
              <NumericQuestion prompt={<MathText>{'لحساب $\\frac{11}{18}-\\frac{1}{6}$ نكتب $\\frac{1}{6}=\\frac{\\ldots}{18}$ . البسط:'}</MathText>} expected={3}
                requires={['tawhid-mudaaf']} explain={<MathText>{'$18=6\\times 3$ ، فنضرب حدّي $\\frac{1}{6}$ في $3$ : $\\frac{1}{6}=\\frac{3}{18}$ ، ثم $\\frac{11}{18}-\\frac{3}{18}=\\frac{8}{18}=\\frac{4}{9}$ .'}</MathText>}
                onAnswered={() => setQ2(true)} />
              {q2 && (
                <>
                  <TextbookBox kind="property" text={`${KNOWLEDGE.multiple.text} ${KNOWLEDGE.multiple.example}`} source={KNOWLEDGE.multiple.source} compact />
                  <KnowledgeBrick id="qaida-jam-tarh" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'الجزء الباقي من الكلّ', subtitle: '$1-\\frac{3}{8}$', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'أُخذ $\\frac{3}{8}$ من الكلّ. الجزء الباقي هو:'}</MathText>}
                options={[M('$\\frac{5}{8}$'), M('$\\frac{3}{8}$'), M('$\\frac{8}{3}$')]}
                correct={0} cols={3} requires={['al-baqi']}
                explain={<MathText>{'الباقي $1-\\frac{3}{8}=\\frac{8}{8}-\\frac{3}{8}=\\frac{5}{8}$ . ($\\frac{3}{8}$ هو الجزء المأخوذ نفسه.)'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <>
                  <TextbookBox kind="property" text={`${KNOWLEDGE.rest.text} ${KNOWLEDGE.natural.text}`} source={KNOWLEDGE.rest.source} compact />
                  <KnowledgeBrick id="al-baqi" variant="rappel" compact />
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
