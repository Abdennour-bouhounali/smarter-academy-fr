import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox, TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE, RECALL } from '../content/textbook';
import { EX } from '../content/exercises';

/**
 * Module 2 — معارف 3 (p. 55) « الكتابات الكسرية لحاصل القسمة » : la règle du manuel (× ou ÷ le même nombre, déjà
 * conjecturée au module 1) et son exemple 175/100 ; le « تذكّر » d'une ligne (la fraction quotient, leçon « حاصل
 * القسمة والكسر » — rappelée, jamais reconstruite) ; la fraction décimale et l'écriture décimale (« 0,7 = 7/10 » de
 * معارف 1, l'exemple 2 : 2,1 ÷ 3,5 = 0,6) ; puis « اختزلنا الكسر ». Exercices 16, 19, 17 (p. 58). LP : P1, P2.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [e19, setE19] = useState(false);
  const [q3, setQ3] = useState(false);
  return (
    <ContentModule
      objectives={['نطبّق قاعدة الكتاب: نفس العدد للبسط وللمقام', 'كيف نكتب كسرًا كتابة عشرية؟', 'ماذا يعني «اختزلنا الكسر»؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — الكتابات الكسرية لحاصل القسمة"
      moduleSubtitle="× و ÷ نفس العدد · الكسر العشري · الاختزال"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف — الكتاب ص 55', title: 'قاعدة الكتاب، والكسر العشري', tone: 'violet',
        body: <p>الكتاب يكتب القاعدة التي وجدتها في الصينية. نطبّقها لنمرّ إلى الكتابة العشرية، ثم نسمّي ما فعلناه بهديّة الجدّ.</p>,
      }}
      steps={[
        {
          num: 1, title: 'قاعدة الكتاب', subtitle: 'مثال 1: 7/4', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'$\\frac{7}{4}=\\frac{7\\times 25}{4\\times 25}=\\frac{\\ldots}{100}$'}</MathText>}
                options={[M('175'), M('32'), M('700')]}
                correct={0} cols={3} requires={['kitabat-mutasawiya']}
                explain={<MathText>{'$7\\times 25=175$ : نضرب البسط في نفس العدد 25 الذي ضربنا فيه المقام.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <TextbookBox kind="property" text={KNOWLEDGE.rule} source={KNOWLEDGE.source} compact />}
              {q1 && <TextbookBox kind="remark" text={RECALL.text} source={RECALL.source} compact />}
            </div>
          ),
        },
        {
          num: 2, title: 'الكسر العشري والكتابة العشرية', subtitle: 'من الكسر إلى الفاصلة', done: q2 && e19,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'أيّ كسر عشري يساوي $\\frac{3}{4}$؟'}</MathText>}
                options={[M('$\\frac{34}{100}$'), M('$\\frac{75}{100}$'), M('$\\frac{3}{10}$')]}
                correct={1} cols={3} requires={['kitabat-mutasawiya']}
                explain={<MathText>{'$\\frac{3\\times 25}{4\\times 25}=\\frac{75}{100}=0{,}75$ ؛ أمّا $\\frac{34}{100}$ فهو 0,34 : الأرقام لا تُلصق.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="kasr-ashri" lead="في الصينية: 10 قطع، 6 منها للجيران." />}
              {q2 && <TextbookBox kind="example" lines={[KNOWLEDGE.example2, KNOWLEDGE.example2Math]} source={KNOWLEDGE.source} compact />}
              {q2 && <TextbookExercise exercise={EX['ex-16']} requires={['kasr-ashri']} onAnswered={() => {}} />}
              {q2 && <TextbookExercise exercise={EX['ex-19']} requires={['kasr-ashri']} onAnswered={() => setE19(true)} />}
            </div>
          ),
        },
        {
          num: 3, title: 'اختزلنا الكسر', subtitle: 'مثال 1: 54/45', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'$\\frac{54}{45}=\\frac{54\\div 9}{45\\div 9}=\\frac{6}{5}$ : ماذا تغيّر؟'}</MathText>}
                options={[M('البسط والمقام صغرا، والكسر لم يتغيّر'), M('الكسر صغر لأنّ بسطه صغر'), M('الكسر كبر لأنّ مقامه صغر')]}
                correct={0} cols={1} requires={['kitabat-mutasawiya']}
                explain={<span>قسمنا البسط والمقام على نفس العدد 9 : نفس العدد بكتابة أبسط.</span>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="ikhtizal" />}
              {q3 && <TextbookExercise exercise={EX['ex-17']} requires={['ikhtizal']} onAnswered={() => {}} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
