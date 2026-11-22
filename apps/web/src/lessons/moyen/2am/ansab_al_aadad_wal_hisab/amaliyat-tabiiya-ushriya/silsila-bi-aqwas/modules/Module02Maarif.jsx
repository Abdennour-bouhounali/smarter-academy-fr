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
 * Module 2 — معارف : le module s'ouvre sur un labo (le MÊME type `coop-calculator`, posé seul `levels={false}`, une seule tâche : 5 caisses de 20 balles dont 3 percées par caisse) ; chaque
 * encadré NOMME ce que l'élève vient de faire (question → encadré → brique), avec les mots de la plateforme (guide §4ter-bis) : la règle des parenthèses et ses exemples, les parenthèses inutiles,
 * les parenthèses imbriquées et les crochets, la barre de fraction. Rappel de la leçon précédente de l'unité (PUBLIÉE : lien). LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const base = getLessonPath(RECALL.lesson);
  return (
    <ContentModule
      objectives={['أين أضع القوسين وماذا يفعلان؟', 'كيف أحسب أقواسًا داخل أقواس؟', 'كيف أكتب كسرًا بقوسين؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — الأقواس وخطّ الكسر"
      moduleSubtitle="أسمّي ما فعلتُه"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="coop-calculator" tasks={LAB.alone.tasks} levels={false} />}
      steps={[
        {
          num: 1, title: 'أين وضعتَ القوسين؟ ولماذا؟', subtitle: 'في حساب الكرات السليمة', done: !!q.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'في $5 \\times 20 - 3$ ، أيّ وضع للقوسين يعطي عدد الكرات السليمة (من كلّ صندوق نُزعت 3)؟'}</MathText>}
                options={['$5 \\times (20 - 3)$', '$(5 \\times 20) - 3$', '$5 \\times 20 - (3)$'].map(M)}
                correct={0} cols={1} requires={['aqwas-awwalan']}
                explain={<MathText>{'نطرح الكرات المثقوبة من كلّ صندوق أوّلًا: $20 - 3 = 17$ ثم نضرب في 5 فنجد $85$ . أمّا القوسان حول $5 \\times 20$ فلا يغيّران شيئًا ويعطيان $97$ .'}</MathText>}
                onAnswered={answered('a')} />
              {q.a && <TextbookBox kind="property" compact text={KNOWLEDGE.brackets.text} source={KNOWLEDGE.brackets.source} />}
              {q.a && (
                <TextbookBox kind="remark" title={RECALL.title} text={RECALL.text} source={RECALL.source} compact>
                  {base && <Link to={base} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>درس « سلسلة عمليات دون أقواس وأولوية العمليات »</Link>}
                </TextbookBox>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'هل القوسان ضروريان؟', subtitle: 'قارن بما تطبعه الآلة دونهما', done: !!q.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'أيّ هذه العبارات لا يتغيّر ناتجها إذا حذفنا قوسيها؟'}</MathText>}
                options={['$12 + (3 \\times 4)$', '$(12 + 3) \\times 4$', '$(12 - 3) \\div 3$'].map(M)}
                correct={0} cols={1} requires={['aqwas-ghayr-daruriya']}
                explain={<MathText>{'الضرب يُحسب أوّلًا دون قوسين: $12 + (3 \\times 4) = 12 + 12 = 24$ وهو ما نجده بحذفهما. في الأخريين تتغيّر النتيجة: $60$ و $3$ بدل $24$ و $11$ .'}</MathText>}
                onAnswered={answered('b')} />
              {q.b && <KnowledgeBrick id="qaidat-aqwas" lead="نجمع ما فعلناه: ماذا تفعل الأقواس، ومتى تلزم؟" />}
              {q.b && <TextbookBox kind="remark" compact text={KNOWLEDGE.useless.text} source={KNOWLEDGE.useless.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'أقواس داخل أقواس', subtitle: 'من أين نبدأ وكيف نكتبها؟', done: !!q.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'في $H = 3 \\times [20 - (4 + 6)]$ ما أوّل ما نحسبه؟'}</MathText>}
                options={['$4 + 6$', '$20 - 4$', '$3 \\times 20$'].map(M)}
                correct={0} cols={3} requires={['qaidat-aqwas']}
                explain={<MathText>{'القوس الداخلي أوّلًا: $4 + 6 = 10$ ، ثم $20 - 10 = 10$ بين المعقوفين، ثم $3 \\times 10 = 30$ .'}</MathText>}
                onAnswered={answered('c')} />
              {q.c && <TextbookBox kind="example" compact text={KNOWLEDGE.nested.text} source={KNOWLEDGE.nested.source} />}
            </div>
          ),
        },
        {
          num: 4, title: 'خطّ الكسر', subtitle: 'قوسان للبسط وقوسان للمقام', done: !!q.d,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'كيف نكتب $\\dfrac{36 + 12}{20 - 8}$ دون خطّ الكسر؟'}</MathText>}
                options={['$(36 + 12) \\div (20 - 8)$', '$36 + 12 \\div 20 - 8$', '$(36 + 12) \\div 20 - 8$'].map(M)}
                correct={0} cols={1} requires={['qaidat-aqwas']}
                explain={<MathText>{'البسط كلّه عدد واحد والمقام كلّه عدد واحد: $48 \\div 12 = 4$ . الثانية تقسم 12 على 20 وحده؛ والثالثة تقسم على 20 ثم تطرح 8 .'}</MathText>}
                onAnswered={answered('d')} />
              {q.d && <TextbookBox kind="property" compact text={KNOWLEDGE.bar.text} source={KNOWLEDGE.bar.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
