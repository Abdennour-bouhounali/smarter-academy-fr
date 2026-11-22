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
 * Module 2 — معارف (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater). Chaque encadré NOMME ce que l'élève vient de faire : la
 * définition de l'équation (avec le « تذكّر — السنة الثانية » : l'item 2am.m4.r08, leçon de base non publiée : pas de lien), la solution, la vérification
 * par substitution. LP : P1, P2.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const base = getLessonPath(RECALL.lesson);
  return (
    <ContentModule
      objectives={['ما المعادلة من الدرجة الأولى؟', 'متى يكون عدد حلًّا؟', 'كيف أتحقق بالتعويض؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — المعادلة وحلّها"
      moduleSubtitle="أسمّي ما فعلتُه"
      estimatedTime="11 دقيقة"
      steps={[
        {
          num: 1, title: 'أيّ هذه مساواة معادلة من الدرجة الأولى؟', subtitle: 'المعادلة', done: !!q.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="أيّ العبارات الآتية معادلة من الدرجة الأولى بمجهول واحد؟"
                options={[M('$6x - 5 = 2x + 7$'), M('$6 - 5 = 1$'), M('$2x + y = 7$')]}
                correct={0} cols={3} requires={['naql-hadd']}
                explain={<MathText>{'الأولى مساواة فيها مجهول واحد $x$ من الشكل $ax + b = cx + d$ ؛ الثانية لا مجهول فيها، والثالثة فيها مجهولان.'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <KnowledgeBrick id="muadala-taarif" lead="مساواة فيها مجهول: ماذا نسمّيها وماذا نسمّي طرفيها؟" />}
              {q.a && <TextbookBox kind="definition" compact text={KNOWLEDGE.definition.text} source={KNOWLEDGE.definition.source} />}
              {q.a && (
                <TextbookBox kind="remark" title={RECALL.title} text={RECALL.text} source={RECALL.source} compact>
                  {base && <Link to={base} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>درس « حلّ مشكل باستعمال معادلة » — السنة الثانية متوسط</Link>}
                </TextbookBox>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'متى يكون عدد حلًّا لمعادلة؟', subtitle: 'الحلّ', done: !!q.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="في العبّارة وجدنا أنّ $x = 3$ يحقّق المعادلة $3x + 2 = x + 8$ . متى نقول إنّ عددًا حلّ لمعادلة؟"
                options={[M('عندما يعطي الطرفان العدد نفسه إذا عوّضناه'), M('عندما يكون الطرف الأيسر أكبر'), M('عندما يكون العدد موجبًا')]}
                correct={0} cols={1} requires={['naql-hadd']}
                explain={<MathText>{'من أجل $x = 3$ : $3 \\times 3 + 2 = 11$ و $3 + 8 = 11$ .'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <KnowledgeBrick id="hall-muadala" lead="عدد يجعل الطرفين متساويين: ماذا نسمّيه؟" />}
              {q.b && <TextbookBox kind="definition" compact text={KNOWLEDGE.solution.text} source={KNOWLEDGE.solution.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'كيف أعرف أنّ عددًا حلّ دون أن أحلّ؟', subtitle: 'التعويض', done: !!q.c,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<MathText>{'عوّض العدد في الطرفين ثم احكم:'}</MathText>}
                rows={[
                  { id: 'r1', label: '$x = 5$ في $4x - 3 = 2x + 7$', options: ['حلّ', 'ليس حلًّا'], correct: 0, correction: 'من أجل $x = 5$ : $4 \\times 5 - 3 = 17$ و $2 \\times 5 + 7 = 17$ .' },
                  { id: 'r2', label: '$x = 2$ في $5x - 1 = 3x + 4$', options: ['حلّ', 'ليس حلًّا'], correct: 1, correction: 'من أجل $x = 2$ : الطرف الأيسر $9$ والأيمن $10$ .' },
                ]}
                feedback={({ allRight }) => (allRight ? 'أحسنت: نحسب الطرفين ونقارن.' : 'راجع: احسب الطرف الأيسر ثم الأيمن لقيمة x نفسها.')}
                onAnswered={answered('c')}
                requires={['hall-muadala']}
              />
              {q.c && <KnowledgeBrick id="tahqqaq-taawid" lead="كيف نتأكّد أنّ عددًا حلّ لمعادلة؟" />}
              {q.c && <TextbookBox kind="property" compact text={KNOWLEDGE.check.text} source={KNOWLEDGE.check.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
