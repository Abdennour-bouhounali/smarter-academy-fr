import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessonPath } from '@smarter-academy/core';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE, GUIDE, RECALL } from '../content/textbook';

/**
 * Module 2 — معارف (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater). Chaque encadré NOMME ce que l'élève vient de faire dans le
 * مضمار (question → encadré → brique), avec les mots de la plateforme (guide §4ter-bis) : la propriété de l'addition et de la soustraction avec SES
 * nombres, puis du produit et du quotient, enfin le zéro. LP : P1, P2.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const link = (code, label) => { const to = getLessonPath(code); return to && <Link to={to} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>{label}</Link>; };
  return (
    <ContentModule
      objectives={['كيف نكتب ما فعلناه بالجمع والطرح؟', 'وبالضرب والقسمة؟', 'ماذا نقول عن الصفر؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — المساويات والعمليات"
      moduleSubtitle="ما فعلناه في المضمار بالرموز"
      estimatedTime="11 دقيقة"
      brief={{
        tag: 'تذكّر', title: 'قبل أن نكتب الخواص', tone: 'violet',
        body: (
          <TextbookBox kind="remark" title={RECALL.year2.title} text={RECALL.year2.text} source={RECALL.year2.source} compact>
            {link(RECALL.year2.lesson, 'درس « اختبار صحة مساواة أو متباينة » — السنة الثانية متوسط')}
          </TextbookBox>
        ),
      }}
      steps={[
        {
          num: 1, title: 'كيف نكتب ما فعلناه بالجمع؟', subtitle: 'a و b و c', done: !!q.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="كان المتسابقان عند العددين $a$ و $b$ المتساويين، وأضفنا $c$ إلى كلٍّ منهما. أيّ كتابة تصف ما رأيناه؟"
                options={[M('إذا كان $a = b$ فإنّ $a + c = b + c$'), M('إذا كان $a = b$ فإنّ $a + c = b$'), M('إذا كان $a = b$ فإنّ $a + c = b \\times c$')]}
                correct={0} cols={1} requires={['musawat-jam']}
                explain={<MathText>{GUIDE.together}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <TextbookBox kind="property" compact text={KNOWLEDGE.add.text} source={KNOWLEDGE.add.source} />}
              {q.a && <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"><MathText>{KNOWLEDGE.add.example}</MathText></p>}
            </div>
          ),
        },
        {
          num: 2, title: 'وبالضرب والقسمة؟', subtitle: 'عدد موجب أو سالب', done: !!q.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="إذا كان $t = \frac{2}{3}$ فكم يساوي $6t$ ؟ وكم يساوي $\frac{t}{-2}$ ؟"
                options={[M('$4$ و $-\\frac{1}{3}$'), M('$4$ و $\\frac{1}{3}$'), M('$\\frac{2}{3} + 6$ و $-\\frac{1}{3}$')]}
                correct={0} cols={1} requires={['musawat-jam']}
                explain={<MathText>{'$6 \\times \\frac{2}{3} = 4$ ، و $\\frac{2}{3} \\div (-2) = -\\frac{1}{3}$ : القسمة على عدد سالب تغيّر إشارة الناتج لا الاتجاه (لا اتجاه في المساواة).'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <KnowledgeBrick id="musawat-darb" lead="الضرب والقسمة على الطرفين: ماذا تعطي المساواة؟" />}
              {q.b && <TextbookBox kind="property" compact text={KNOWLEDGE.times.text} source={KNOWLEDGE.times.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'لماذا لا نقسم الطرفين على 0 ؟', subtitle: 'الصفر', done: !!q.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="في $0 \times x = 0 \times 5$ أراد سامي أن يقسم الطرفين على $0$ ليجد $x$ . ماذا تقول له؟"
                options={[M('لا قسمة على $0$ ، والمساواة $0 = 0$ لا تدلّنا على $x$'), M('اقسم، فنجد $x = 5$'), M('اقسم، فنجد $x = 0$')]}
                correct={0} cols={1} requires={['musawat-darb']}
                explain={<MathText>{GUIDE.divZero.why}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <KnowledgeBrick id="sifr" lead="الصفر: ما الذي يمنعنا منه وما الذي يفرغه؟" />}
              {q.c && <TextbookBox kind="remark" compact text={KNOWLEDGE.zero.text} source={KNOWLEDGE.zero.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
