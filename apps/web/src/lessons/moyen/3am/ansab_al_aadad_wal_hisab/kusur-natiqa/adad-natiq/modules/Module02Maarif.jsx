import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessonPath } from '@smarter-academy/core';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE, RECALL_UNIT1, RECALL_1AM } from '../content/textbook';

/**
 * Module 2 — معارف : le module s'ouvre sur un labo (le MÊME type `number-line-pegs`, monde `writings`, posé seul `levels={false}`) : cinq cartes 15/(−20), (−6)/8, 3/(−4), (−12)/16, 3/4 → quatre sur −3/4, une sur 3/4.
 * Chaque encadré NOMME ce que l'élève vient de faire (question → encadré → brique), avec les mots de la plateforme (guide §4ter-bis) : la définition, les inclusions, la forme modèle, un « تذكّر » de
 * `qismat-nisbiyayn` (publiée : avec lien) et un « تذكّر — السنة الأولى » de `hasil-qisma-kasr` (publiée : avec lien). LP : P1, P2.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const unit1 = getLessonPath(RECALL_UNIT1.lesson);
  const year1 = getLessonPath(RECALL_1AM.lesson);
  const link = (to, label) => to && <Link to={to} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>{label}</Link>;
  return (
    <ContentModule
      objectives={['كم كتابة للعدد الواحد؟', 'ما الكتابة المعيارية؟', 'ما العدد الناطق، وأيّ أعداد هي ناطقة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — العدد الناطق"
      moduleSubtitle="أسمّي ما فعلتُه"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="number-line-pegs" world={LAB.writings.world} tasks={LAB.writings.tasks} levels={false} />}
      steps={[
        {
          num: 1, title: 'كتابات كثيرة، مكان واحد', subtitle: 'ملقط واحد', done: !!q.a && !!q.b,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'كم بطاقة من الخمس تستقرّ على الملقط الذي عند $-\\frac{3}{4}$ ؟'}</MathText>}
                expected={4} display="4" parse={parseDec} requires={['adad-natiq']}
                explain={<MathText>{'$\\frac{15}{-20}$ و $\\frac{-6}{8}$ و $\\frac{3}{-4}$ و $\\frac{-12}{16}$ كلّها تساوي $-\\frac{3}{4}$ ؛ أمّا $\\frac{3}{4}$ فعلى الجهة الأخرى.'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && (
                <TapQuestion
                  prompt={<MathText>{'ما كتابة هذا العدد على أبسط شكل بمقام موجب؟'}</MathText>}
                  options={[M('$-\\frac{3}{4}$'), M('$\\frac{3}{4}$'), M('$-\\frac{20}{15}$')]}
                  correct={0} cols={3} requires={['maqam-mujab']}
                  explain={<MathText>{'$\\frac{15}{-20}=-\\frac{15}{20}=-\\frac{3}{4}$ بعد الاختزال بالقسمة على $5$ .'}</MathText>}
                  onAnswered={answered('b')}
                />
              )}
              {q.b && <TextbookBox kind="definition" compact text={KNOWLEDGE.definition.text} source={KNOWLEDGE.definition.source} />}
              {q.b && <TextbookBox kind="property" compact text={KNOWLEDGE.standard.text} source={KNOWLEDGE.standard.source} />}
              {q.b && <TextbookBox kind="example" compact text={KNOWLEDGE.examples.text} source={KNOWLEDGE.examples.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'أعداد هي ناطقة', subtitle: 'الطبيعية والصحيحة والعشرية', done: !!q.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'هل العدد $-1{,}8$ ناطق؟ اختر كتابته على شكل حاصل قسمة عددين صحيحين:'}</MathText>}
                options={[M('نعم: $-1{,}8=-\\frac{18}{10}=-\\frac{9}{5}$'), M('لا، لأنّ له فاصلة'), M('نعم، لكنّه يساوي $\\frac{9}{5}$')]}
                correct={0} cols={1} requires={['adad-natiq']}
                explain={<MathText>{'$1{,}8=\\frac{18}{10}=\\frac{9}{5}$ ، والإشارة السالبة تبقى: $-\\frac{9}{5}$ . كل عدد عشري نسبي ناطق.'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <TextbookBox kind="property" compact text={KNOWLEDGE.inclusions.text} source={KNOWLEDGE.inclusions.source} />}
              {q.c && <KnowledgeBrick id="adad-natiq-shamil" lead="أيّ الأعداد التي نعرفها هي أعداد ناطقة؟" />}
              {q.c && (
                <TextbookBox kind="remark" title={RECALL_UNIT1.title} text={RECALL_UNIT1.text} source={RECALL_UNIT1.source} compact>
                  {link(unit1, 'درس « حاصل قسمة عددين نسبيين »')}
                </TextbookBox>
              )}
              {q.c && (
                <TextbookBox kind="remark" title={RECALL_1AM.title} text={RECALL_1AM.text} source={RECALL_1AM.source} compact>
                  {link(year1, 'درس « حاصل القسمة والكسر » (السنة الأولى)')}
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
