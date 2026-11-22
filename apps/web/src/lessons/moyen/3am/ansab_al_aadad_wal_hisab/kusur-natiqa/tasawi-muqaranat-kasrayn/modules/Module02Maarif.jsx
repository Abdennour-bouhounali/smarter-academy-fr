import { useState } from 'react';
import { Link } from 'react-router-dom';
import { parseDec, getLessonPath } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE, RECALL } from '../content/textbook';

/**
 * Module 2 — معارف : le module s'ouvre sur un labo (le MÊME type `shade-match`, monde `equal`, posé seul `levels={false}`) : la référence 6/8 et quatre seaux déjà prêts (9/12, 15/20, 7/9, 12/15) que
 * l'élève charge un à un pour lire l'aiguille. Chaque encadré NOMME ce que l'élève vient de faire (question → encadré → brique), avec les mots de la plateforme (guide §4ter-bis) : un « تذكّر — السنة
 * الثانية » sans lien (`muqarana-kasrayn`, 2AM, NON publiée), le facteur k (1AM), la propriété des produits en croix dans les DEUX sens avec sa justification par le dénominateur b × d (le raisonnement du نشاط 2 du
 * manuel, avec d'autres nombres), la règle du dénominateur commun et deux exemples. LP : P1, P2.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const base = getLessonPath(RECALL.lesson);
  return (
    <ContentModule
      objectives={['أيّ الدلاء يطابق المرجع؟', 'ماذا يعني تساوي الجداءين المتصالبين؟', 'لماذا تصحّ الخاصية؟', 'كيف نقارن بتوحيد المقامين؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — الجداءان المتصالبان"
      moduleSubtitle="أسمّي ما فعلتُه"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="shade-match" world={LAB.equal.world} tasks={LAB.equal.tasks} levels={false} />}
      steps={[
        {
          num: 1, title: 'أيّ الدلاء طابقت؟', subtitle: 'أربعة دلاء', done: !!q.a,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<MathText>{'المرجع $\\frac{6}{8}$ . أيّ الدلاء الأربعة طابقه؟'}</MathText>}
                rows={[
                  { id: 'r1', label: <MathText>{'$\\frac{9}{12}$'}</MathText>, options: ['يطابق', 'لا يطابق'], correct: 0, correction: <MathText>{'$6\\times12=72=8\\times9$ .'}</MathText> },
                  { id: 'r2', label: <MathText>{'$\\frac{15}{20}$'}</MathText>, options: ['يطابق', 'لا يطابق'], correct: 0, correction: <MathText>{'$6\\times20=120=8\\times15$ .'}</MathText> },
                  { id: 'r3', label: <MathText>{'$\\frac{7}{9}$'}</MathText>, options: ['يطابق', 'لا يطابق'], correct: 1, correction: <MathText>{'$6\\times9=54$ و $8\\times7=56$ : مختلفان.'}</MathText> },
                  { id: 'r4', label: <MathText>{'$\\frac{12}{15}$'}</MathText>, options: ['يطابق', 'لا يطابق'], correct: 1, correction: <MathText>{'$6\\times15=90$ و $8\\times12=96$ : مختلفان.'}</MathText> },
                ]}
                feedback={({ allRight }) => (allRight ? 'أحسنت: الدلوان المطابقان هما اللذان وقفت إبرتهما عند «تطابق».' : 'راجع: المطابقان هما اللذان وقفت إبرتهما في الوسط؛ أعد تحميلهما إن شئت.')}
                requires={['jidaa-mutasalib']}
                onAnswered={answered('a')}
              />
              {q.a && (
                <TextbookBox kind="remark" title={RECALL.title} text={RECALL.text} source={RECALL.source} compact>
                  {base && <Link to={base} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>درس « مقارنة كسرين » — السنة الثانية متوسط</Link>}
                </TextbookBox>
              )}
              {q.a && <TextbookBox kind="property" compact text={KNOWLEDGE.scale.text} source={KNOWLEDGE.scale.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'تحقّق بالجداءين', subtitle: 'في الاتجاهين', done: !!q.b && !!q.b2,
          content: (
            <div className="space-y-3">
              <NumericQuestion prompt={<MathText>{'تحقّق من المطابقة بين $\\frac{6}{8}$ و $\\frac{9}{12}$ . احسب $6\\times12$ :'}</MathText>} expected={72} display="72" parse={parseDec} requires={['jidaa-mutasalib']}
                explain={<MathText>{'$6\\times12=72$ .'}</MathText>} onAnswered={answered('b')} />
              {q.b && (
                <NumericQuestion prompt={<MathText>{'واحسب $8\\times9$ :'}</MathText>} expected={72} display="72" parse={parseDec} requires={['jidaa-mutasalib']}
                  explain={<MathText>{'$8\\times9=72$ : الجداءان المتصالبان متساويان، فالكسران متساويان.'}</MathText>} onAnswered={answered('b2')} />
              )}
              {q.b2 && <TextbookBox kind="property" compact text={KNOWLEDGE.property.text} source={KNOWLEDGE.property.source} />}
              {q.b2 && <TextbookBox kind="remark" compact title="لماذا تصحّ الخاصية؟" text={KNOWLEDGE.proof.text} source={KNOWLEDGE.proof.source} />}
              {q.b2 && <KnowledgeBrick id="jidaa-property" lead="في الاتجاهين: إذا تساوى الكسران ماذا نقول عن الجداءين؟ وإذا تساوى الجداءان؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'كيف نقارن 5/6 و 7/8 ؟', subtitle: 'توحيد المقامين', done: !!q.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'قارن $\\frac{5}{6}$ و $\\frac{7}{8}$ بكتابتهما بنفس المقام $24$ :'}</MathText>}
                options={[M('$\\frac{20}{24}<\\frac{21}{24}$ ، إذن $\\frac{5}{6}<\\frac{7}{8}$'), M('$\\frac{20}{24}>\\frac{21}{24}$ ، إذن $\\frac{5}{6}>\\frac{7}{8}$'), M('$\\frac{5}{24}<\\frac{7}{24}$ ، إذن $\\frac{5}{6}<\\frac{7}{8}$')]}
                correct={0} cols={1} requires={['muqarana-kasrayn-2am']}
                explain={<MathText>{'$24\\div6=4$ و $5\\times4=20$ ؛ $24\\div8=3$ و $7\\times3=21$ ؛ ثمّ نقارن البسطين $20<21$ . (الخيار الثالث لم يضرب البسط في العدد نفسه.)'}</MathText>}
                onAnswered={answered('c')} />
              {q.c && <TextbookBox kind="definition" compact text={KNOWLEDGE.rule.text} source={KNOWLEDGE.rule.source} />}
              {q.c && <KnowledgeBrick id="qaida-tawhid" lead="لمقارنة كسرين مقاماهما مختلفان: ماذا نفعل أوّلًا؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'ومقام آخر', subtitle: '11/18 و 7/12', done: !!q.d && !!q.d2,
          content: (
            <div className="space-y-3">
              <NumericQuestion prompt={<MathText>{'ما أصغر مضاعف مشترك للعددين $18$ و $12$ ؟'}</MathText>} expected={36} display="36" parse={parseDec} requires={['qaida-tawhid']}
                explain={<MathText>{'مضاعفات $18$ : $18$ ، $36$ ؛ و $36=12\\times3$ : أصغر مضاعف مشترك هو $36$ (و $18\\times12=216$ يصلح أيضًا لكنّه أكبر).'}</MathText>}
                onAnswered={answered('d')} />
              {q.d && (
                <TapQuestion
                  prompt={<MathText>{'قارن $\\frac{11}{18}$ و $\\frac{7}{12}$ بالمقام $36$ :'}</MathText>}
                  options={[M('$\\frac{22}{36}>\\frac{21}{36}$ ، إذن $\\frac{11}{18}>\\frac{7}{12}$'), M('$\\frac{22}{36}<\\frac{21}{36}$ ، إذن $\\frac{11}{18}<\\frac{7}{12}$'), M('$\\frac{11}{36}>\\frac{7}{36}$ ، إذن $\\frac{11}{18}>\\frac{7}{12}$')]}
                  correct={0} cols={1} requires={['qaida-tawhid']}
                  explain={<MathText>{'$\\frac{11}{18}=\\frac{22}{36}$ و $\\frac{7}{12}=\\frac{21}{36}$ ، و $22>21$ .'}</MathText>}
                  onAnswered={answered('d2')} />
              )}
              {q.d2 && <TextbookBox kind="example" compact text={KNOWLEDGE.examples.text} source={KNOWLEDGE.examples.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
