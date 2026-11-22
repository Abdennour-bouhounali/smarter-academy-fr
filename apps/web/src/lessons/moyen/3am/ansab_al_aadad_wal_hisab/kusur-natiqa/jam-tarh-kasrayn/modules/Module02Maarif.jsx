import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessonPath } from '@smarter-academy/core';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE, RECALL, RECALL_TASAWI } from '../content/textbook';

/**
 * Module 2 — معارف : le module s'ouvre sur un labo (le MÊME type `seed-rake`, monde `fewest`, posé seul `levels={false}`) : 3/4 et 5/6, « أوسع مسافة » (1/12 : 9 + 10 = 19 plants, 19/12 m, le second
 * حوض s'ouvre). Chaque encadré NOMME ce que l'élève vient de faire (question → encadré → brique), avec les mots de la plateforme (guide §4ter-bis) : un « تذكّر — السنة الثانية » avec son lien
 * (`jam-tarh-kusur`, 2AM, publiée 2026-10-29), un « تذكّر » de `tasawi-muqaranat-kasrayn` (PUBLIÉE : avec lien), le rappel du même dénominateur, la règle et deux exemples. LP : P1, P2.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const base = getLessonPath(RECALL_TASAWI.lesson);
  const year2 = getLessonPath(RECALL.lesson);
  return (
    <ContentModule
      objectives={['ما أوسع مسافة تملأ الجزأين؟', 'كيف نكتب الحساب؟', 'ما قاعدة جمع كسرين وطرحهما؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — قاعدة الجمع والطرح"
      moduleSubtitle="أسمّي ما فعلتُه"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="seed-rake" world={LAB.fewest.world} tasks={LAB.fewest.tasks} levels={false} />}
      steps={[
        {
          num: 1, title: 'أوسع مسافة', subtitle: 'المقام المشترك', done: !!q.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'في الحوض $\\frac{3}{4}$ للطماطم و $\\frac{5}{6}$ للفلفل: ما أوسع مسافة نجحت؟'}</MathText>}
                options={[M('$\\frac{1}{12}$ م'), M('$\\frac{1}{24}$ م'), M('$\\frac{1}{6}$ م')]}
                correct={0} cols={3} requires={['mudaaf-1am']}
                explain={<MathText>{'$12$ أصغر مضاعف مشترك للعددين $4$ و $6$ . ($\\frac{1}{24}$ تنجح أيضًا لكنّها أضيق؛ و $\\frac{1}{6}$ ليست من مضاعفات $4$ فتُسقط شتلة على الحدّ.)'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && (
                <TextbookBox kind="remark" title={RECALL.title} text={RECALL.text} source={RECALL.source} compact>
                  {year2 && <Link to={year2} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>درس « جمع وطرح كسرين » (السنة الثانية)</Link>}
                </TextbookBox>
              )}
              {q.a && (
                <TextbookBox kind="remark" title={RECALL_TASAWI.title} text={RECALL_TASAWI.text} source={RECALL_TASAWI.source} compact>
                  {base && <Link to={base} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>درس « تساوي كسرين ومقارنتهما »</Link>}
                </TextbookBox>
              )}
              {q.a && <TextbookBox kind="property" compact text={KNOWLEDGE.same.text} source={KNOWLEDGE.same.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'اكتب الحساب', subtitle: '19/12 م', done: !!q.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'اكتب حساب الطول المزروع: $\\frac{3}{4}+\\frac{5}{6}$ بالمسافة $\\frac{1}{12}$ ، وقد زرعتَ $9$ ثمّ $10$ شتلات:'}</MathText>}
                options={[M('$\\frac{9}{12}+\\frac{10}{12}=\\frac{19}{12}$'), M('$\\frac{9}{12}+\\frac{10}{12}=\\frac{19}{24}$'), M('$\\frac{3}{4}+\\frac{5}{6}=\\frac{8}{10}$')]}
                correct={0} cols={1} requires={['mudaaf-1am']}
                explain={<MathText>{'$\\frac{3}{4}=\\frac{9}{12}$ و $\\frac{5}{6}=\\frac{10}{12}$ ، ونجمع البسطين ونُبقي المقام $12$ : $\\frac{19}{12}$ . (الخيار الثاني جمع المقامين؛ والثالث جمع البسطين والمقامين.)'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <TextbookBox kind="definition" compact text={KNOWLEDGE.rule.text} source={KNOWLEDGE.rule.source} />}
              {q.b && <TextbookBox kind="example" compact text={KNOWLEDGE.examples.text} source={KNOWLEDGE.examples.source} />}
              {q.b && <KnowledgeBrick id="qaida-jam-tarh" lead="لجمع كسرين مقاماهما مختلفان أو طرحهما: ماذا نفعل أوّلًا؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
