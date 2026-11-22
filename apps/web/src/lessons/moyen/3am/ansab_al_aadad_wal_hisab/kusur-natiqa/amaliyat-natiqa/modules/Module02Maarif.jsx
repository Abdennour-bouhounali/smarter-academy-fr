import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessonPath } from '@smarter-academy/core';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE, RECALL } from '../content/textbook';

/**
 * Module 2 — معارف : le module s'ouvre sur un labo (le MÊME type `merge-board`, monde `signs`, posé seul `levels={false}`) : six fusions où seul le SIGNE est demandé ; six prédictions justes de suite.
 * Chaque encadré NOMME ce que l'élève vient de faire (question → encadré → brique), avec les mots de la plateforme (guide §4ter-bis) : la somme et la différence, le produit, le مقلوب d'un nombre
 * ناطق (négatifs compris) et la division, avec leurs exemples propres, puis quatre « تذكّر » avec lien (leçons PUBLIÉES : `jidaa-adadayn-nisbiyayn`, `maqlub-qismat-kasrayn`, `jam-tarh-kasrayn`,
 * `adad-natiq`). LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const path = (code) => getLessonPath(code);
  const link = (to, label) => to && <Link to={to} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>{label}</Link>;
  return (
    <ContentModule
      objectives={['كيف أجمع وأطرح عددين ناطقين؟', 'كيف أضرب وأقسم عددين ناطقين؟', 'ما مقلوب عدد ناطق سالب؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — العمليات الأربع"
      moduleSubtitle="أسمّي ما فعلتُه"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="merge-board" world={LAB.signs.world} tasks={LAB.signs.tasks} levels={false} />}
      steps={[
        {
          num: 1, title: 'الجمع والطرح', subtitle: 'الإشارة ثم المقام', done: !!q.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'احسب $\\frac{5}{6}+\\left(-\\frac{7}{4}\\right)$ :'}</MathText>}
                options={[M('$-\\frac{11}{12}$'), M('$\\frac{11}{12}$'), M('$-\\frac{2}{10}$')]}
                correct={0} cols={3} requires={['jam-tarh-kasrayn-3am']}
                explain={<MathText>{'$\\frac{7}{4}=\\frac{21}{12}$ أبعد عن الصفر من $\\frac{5}{6}=\\frac{10}{12}$ ، فالناتج سالب: $\\frac{10}{12}-\\frac{21}{12}=-\\frac{11}{12}$ . ($-\\frac{2}{10}$ جمع البسطين والمقامين.)'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <TextbookBox kind="property" compact text={KNOWLEDGE.sum.text} source={KNOWLEDGE.sum.source} />}
              {q.a && <TextbookBox kind="example" compact text={KNOWLEDGE.sum.examples} source={KNOWLEDGE.sum.source} />}
              {q.a && (
                <TextbookBox kind="remark" title={RECALL.sum.title} text={RECALL.sum.text} source={RECALL.sum.source} compact>
                  {link(path(RECALL.sum.lesson), 'درس « جمع وطرح كسرين »')}
                </TextbookBox>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'الضرب', subtitle: 'الإشارة أوّلًا', done: !!q.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'احسب $\\frac{9}{4}\\times\\frac{-1{,}6}{3}$ :'}</MathText>}
                options={[M('$-\\frac{6}{5}$'), M('$\\frac{6}{5}$'), M('$-\\frac{5}{6}$')]}
                correct={0} cols={3} requires={['jidaa-adadayn-nisbiyayn-3am']}
                explain={<MathText>{'عاملان مختلفا الإشارة: الجداء سالب؛ $\\frac{9\\times1{,}6}{4\\times3}=\\frac{14{,}4}{12}=\\frac{6}{5}$ .'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <TextbookBox kind="property" compact text={KNOWLEDGE.prod.text} source={KNOWLEDGE.prod.source} />}
              {q.b && <TextbookBox kind="example" compact text={KNOWLEDGE.prod.examples} source={KNOWLEDGE.prod.source} />}
              {q.b && (
                <TextbookBox kind="remark" title={RECALL.sign.title} text={RECALL.sign.text} source={RECALL.sign.source} compact>
                  {link(path(RECALL.sign.lesson), 'درس « جداء عددين نسبيين »')}
                </TextbookBox>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'المقلوب والقسمة', subtitle: 'مقلوب عدد سالب', done: !!q.c && !!q.d,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'ما مقلوب $-\\frac{8}{11}$ ؟'}</MathText>}
                options={[M('$-\\frac{11}{8}$'), M('$\\frac{11}{8}$'), M('$-\\frac{8}{11}$')]}
                correct={0} cols={3} requires={['maqlub-qismat-kasrayn-3am']}
                explain={<MathText>{'$\\left(-\\frac{8}{11}\\right)\\times\\left(-\\frac{11}{8}\\right)=1$ : للمقلوب إشارة العدد نفسها.'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <TextbookBox kind="definition" compact text={KNOWLEDGE.recip.text} source={KNOWLEDGE.recip.source} />}
              {q.c && <KnowledgeBrick id="maqlub-natiq" lead="ما مقلوب عدد ناطق، وهل لكل عدد مقلوب؟" />}
              {q.c && (
                <TapQuestion
                  prompt={<MathText>{'احسب $\\frac{5}{9}\\div\\left(-\\frac{10}{3}\\right)$ :'}</MathText>}
                  options={[M('$-\\frac{1}{6}$'), M('$\\frac{1}{6}$'), M('$-\\frac{50}{27}$')]}
                  correct={0} cols={3} requires={['maqlub-qismat-kasrayn-3am']}
                  explain={<MathText>{'نضرب في مقلوب القاسم: $\\frac{5}{9}\\times\\left(-\\frac{3}{10}\\right)=-\\frac{15}{90}=-\\frac{1}{6}$ . ($-\\frac{50}{27}$ نسي القلب.)'}</MathText>}
                  onAnswered={answered('d')}
                />
              )}
              {q.d && <TextbookBox kind="property" compact text={KNOWLEDGE.quot.text} source={KNOWLEDGE.quot.source} />}
              {q.d && <TextbookBox kind="example" compact text={KNOWLEDGE.quot.examples} source={KNOWLEDGE.quot.source} />}
              {q.d && (
                <TextbookBox kind="remark" title={RECALL.div.title} text={RECALL.div.text} source={RECALL.div.source} compact>
                  {link(path(RECALL.div.lesson), 'درس « المقلوب وقسمة كسرين »')}
                </TextbookBox>
              )}
              {q.d && (
                <TextbookBox kind="remark" title={RECALL.rational.title} text={RECALL.rational.text} source={RECALL.rational.source} compact>
                  {link(path(RECALL.rational.lesson), 'درس « العدد الناطق »')}
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
