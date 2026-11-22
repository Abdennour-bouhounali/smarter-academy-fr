import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContentModule, TapQuestion, KnowledgeBrick, BatchChoiceQuestion } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { getLessonPath } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE, RECALL } from '../content/textbook';

/**
 * Module 2 — معارف (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater). Chaque encadré NOMME ce que l'élève vient de faire : la définition de
 * la نسبة مئوية (avec le « تذكّر — السنة الثانية » : l'item 2am.m6.r04, leçon de base non publiée : pas de lien), la propriété t % de x = x × t/100, le tableau
 * « الكلّ ↔ 100 » et a/b = t/100. LP : P1, P2.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const base = getLessonPath(RECALL.lesson);
  return (
    <ContentModule
      objectives={['ما معنى النسبة المئوية؟', 'ما معامل التناسبية؟', 'كيف أحسب نسبة من جزء وكلّ؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — النسبة المئوية"
      moduleSubtitle="أسمّي ما فعلتُه"
      estimatedTime="11 دقيقة"
      steps={[
        {
          num: 1, title: 'ماذا يعني 25 % ؟', subtitle: 'النسبة المئوية', done: !!q.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="أيّ الكسور الآتية يساوي $25\\%$ ؟"
                options={[M('$\\frac{25}{100}$'), M('$\\frac{100}{25}$'), M('$25 \\times 100$')]}
                correct={0} cols={3} requires={['hissa-t']}
                explain={<MathText>{'$25\\%$ تعني $25$ جزءًا من مئة جزء متساوٍ: $\\frac{25}{100}$ .'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <KnowledgeBrick id="nisba-taarif" lead="جزء من مئة جزء متساوٍ: كيف نسمّيه وكيف نكتبه؟" />}
              {q.a && <TextbookBox kind="definition" compact text={KNOWLEDGE.definition.text} source={KNOWLEDGE.definition.source} />}
              {q.a && (
                <TextbookBox kind="remark" title={RECALL.title} text={RECALL.text} source={RECALL.source} compact>
                  {base && <Link to={base} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>درس « حساب نسبة مئوية وتوظيفها » — السنة الثانية متوسط</Link>}
                </TextbookBox>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'بأيّ عدد ننتقل من الكلّ إلى الجزء؟', subtitle: 'معامل التناسبية', done: !!q.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="في جدول تناسبية صفّه الأول (الكلّ): $100$ و $60$ ، وصفّه الثاني (الجزء): $45$ و $?$ . ما معامل التناسبية الذي ننتقل به من الصفّ الأول إلى الثاني؟"
                options={[M('$\\frac{45}{100}$'), M('$\\frac{100}{45}$'), M('$100 - 45$')]}
                correct={0} cols={3} requires={['nisba-taarif']}
                explain={<MathText>{'من $100$ إلى $45$ نضرب في $\\frac{45}{100}$ ، فنجد $60 \\times \\frac{45}{100} = 27$ .'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <KnowledgeBrick id="nisba-jadwal" lead="جدول الكلّ ↔ 100: كيف نجد المجهول فيه؟" />}
              {q.b && <TextbookBox kind="property" compact text={KNOWLEDGE.property.text} source={KNOWLEDGE.property.source} />}
              {q.b && <TextbookBox kind="example" compact text={KNOWLEDGE.example.text} source={KNOWLEDGE.example.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'كم النسبة المئوية؟', subtitle: 'من جزء وكلّ', done: !!q.c,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<MathText>{'اكتب $\\frac{a}{b} = \\frac{t}{100}$ ثم احسب:'}</MathText>}
                rows={[
                  { id: 'r1', label: '$12$ تلميذًا من $30$', options: ['$40\\%$', '$12\\%$', '$250\\%$'], correct: 0, correction: '$\\frac{12}{30} = 0{,}4 = \\frac{40}{100}$ .' },
                  { id: 'r2', label: '$9$ من $36$', options: ['$9\\%$', '$25\\%$', '$75\\%$'], correct: 1, correction: '$\\frac{9}{36} = \\frac{1}{4} = \\frac{25}{100}$ .' },
                ]}
                feedback={({ allRight }) => (allRight ? 'أحسنت: الجزء على الكلّ، ثم نكتبه على مئة.' : 'راجع: الجزء في البسط والكلّ في المقام.')}
                onAnswered={answered('c')}
                requires={['nisba-jadwal']}
              />
              {q.c && <TextbookBox kind="property" compact text={KNOWLEDGE.table.text} source={KNOWLEDGE.table.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
