import { useState } from 'react';
import { Link } from 'react-router-dom';
import { parseDec, getLessonPath } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox, FractionQuestion } from '../../../../../../common/textbook';
import { Manipulation } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE, RECALL, RECALL_POW } from '../content/textbook';

/**
 * Module 2 — معارف : le module s'ouvre sur un labo (le MÊME type `gear-crank`, monde `reverse`, posé seul `levels={false}`) : la chaîne est déplacée, le plateau devient le
 * pignon — 3/5 puis 5/3 de tour de pédale pour UN tour de roue. Chaque encadré NOMME ce que l'élève vient de faire (question → encadré → brique), avec les mots de la
 * plateforme (guide §4ter-bis) : le مقلوب d'un naturel, d'un décimal et d'une fraction, le nombre 0 qui n'en a pas, la notation ⁻¹ (rappel de `quwat-adad-nisbi`, publiée :
 * lien), puis « diviser, c'est multiplier par le مقلوب » (rappel de `jida-kasrayn`, 2AM, NON publiée : sans lien). LP : P1, P2.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const pow = getLessonPath(RECALL_POW.lesson);
  const base = getLessonPath(RECALL.lesson);
  return (
    <ContentModule
      objectives={['ما مقلوب عدد طبيعي أو عشري أو كسر؟', 'هل لكلّ عدد مقلوب؟', 'كيف أعبّر عن القسمة بالضرب؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — المقلوب والقسمة"
      moduleSubtitle="أسمّي ما فعلتُه"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="gear-crank" world={LAB.reverse.world} tasks={LAB.reverse.tasks} levels={false} />}
      steps={[
        {
          num: 1, title: 'ما مقلوب 8 ؟ وما مقلوب 0,25 ؟', subtitle: 'طبيعي وعشري', done: !!q.a && !!q.a2,
          content: (
            <div className="space-y-3">
              <FractionQuestion prompt="ما مقلوب العدد 8 ؟ (كسر)" expected="1/8" requires={['maqlub']}
                explain={<MathText>{'$8 \\times \\frac{1}{8} = 1$ ، ومقلوب $8$ هو $\\frac{1}{8}$ أي $0{,}125$ .'}</MathText>}
                onAnswered={answered('a')} />
              {q.a && (
                <NumericQuestion prompt={<MathText>{'ما مقلوب العدد العشري $0{,}25$ ؟ (اكتبه عددًا)'}</MathText>} expected={4} display="4" parse={parseDec} requires={['maqlub']}
                  explain={<MathText>{'$0{,}25 = \\frac{1}{4}$ ، فمقلوبه $4$ : جداؤهما $1$ .'}</MathText>}
                  onAnswered={answered('a2')} />
              )}
              {q.a2 && <KnowledgeBrick id="maqlub-tarif" lead="مقلوب عدد طبيعي أو عشري أو كسر: كيف نكتبه؟" />}
              {q.a2 && <TextbookBox kind="definition" compact text={KNOWLEDGE.definition.text} source={KNOWLEDGE.definition.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'ما مقلوب 7/5 ؟', subtitle: 'مقلوب كسر وكتابته', done: !!q.b,
          content: (
            <div className="space-y-3">
              <FractionQuestion prompt={<MathText>{'ما مقلوب الكسر $\\frac{7}{5}$ ؟'}</MathText>} expected="5/7" requires={['maqlub']}
                explain={<MathText>{'نقلب الكسر: $\\frac{7}{5} \\times \\frac{5}{7} = 1$ .'}</MathText>}
                onAnswered={answered('b')} />
              {q.b && <TextbookBox kind="remark" compact text={KNOWLEDGE.notation.text} source={KNOWLEDGE.notation.source} />}
              {q.b && (
                <TextbookBox kind="remark" title={RECALL_POW.title} text={RECALL_POW.text} source={RECALL_POW.source} compact>
                  {pow && <Link to={pow} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>درس « قوة عدد نسبي »</Link>}
                </TextbookBox>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'هل للعدد 0 مقلوب؟', subtitle: 'عدد بلا مقلوب', done: !!q.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'هل للعدد $0$ مقلوب؟'}</MathText>}
                options={['لا: كلّ عدد مضروب في $0$ يعطي $0$ لا $1$', 'نعم: هو $\\frac{1}{0}$', 'نعم: هو $0$ نفسه'].map(M)}
                correct={0} cols={1} requires={['maqlub']}
                explain={<MathText>{'لا عدد يضرب في $0$ فيعطي $1$ ، ولا دوّاسة بلا أسنان تُدير السلسلة. ($\\frac{1}{0}$ كتابة بلا معنى.)'}</MathText>}
                onAnswered={answered('c')} />
              {q.c && <KnowledgeBrick id="sifr-item" lead="هل يوجد عدد جداؤه مع 0 يساوي 1؟" />}
              {q.c && <TextbookBox kind="definition" compact text={KNOWLEDGE.zero.text} source={KNOWLEDGE.zero.source} />}
            </div>
          ),
        },
        {
          num: 4, title: 'كم يساوي 9 ÷ 0,75 ؟', subtitle: 'القسمة ضرب', done: !!q.d,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'احسب $9 \\div 0{,}75$ بالضرب في مقلوب $0{,}75$ :'}</MathText>}
                options={[M('$12$'), M('$6{,}75$'), M('$\\frac{1}{12}$')]}
                correct={0} cols={3} requires={['qisma-darb']}
                explain={<MathText>{'$0{,}75 = \\frac{3}{4}$ ومقلوبه $\\frac{4}{3}$ : $9 \\times \\frac{4}{3} = 12$ .'}</MathText>}
                onAnswered={answered('d')} />
              {q.d && <TextbookBox kind="property" compact text={KNOWLEDGE.property.text} source={KNOWLEDGE.property.source} />}
              {q.d && <TextbookBox kind="example" compact text={KNOWLEDGE.examples.text} source={KNOWLEDGE.examples.source} />}
              {q.d && (
                <TextbookBox kind="remark" title={RECALL.title} text={RECALL.text} source={RECALL.source} compact>
                  {base && <Link to={base} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>درس « جداء كسرين » — السنة الثانية متوسط</Link>}
                </TextbookBox>
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
