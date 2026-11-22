import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { getLessonPath } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE, RECALL_SIMPLIFY } from '../content/textbook';

/**
 * Module 2 — معارف : chaque encadré NOMME ce que l'élève vient de trouver dans le jardin, avec les mots de la plateforme (guide §4ter-bis) :
 * « نشر » (écrire un produit comme une somme), k(a + b) = ka + kb, « chaque terme du premier avec chaque terme du second », et le PONT avec
 * la règle des parenthèses du درس précédent (−(a − b) = (−1)(a − b)). Le درس publié `tabsit-hadhf-aqwas` est RAPPELÉ en ouverture par une
 * « تذكّر » (jamais reconstruit). Aucun labo : la première question est l'action. Question → encadré → brique. LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const base = getLessonPath(RECALL_SIMPLIFY.lesson);
  return (
    <ContentModule
      objectives={['ما معنى نشر عبارة؟', 'كيف ننشر جداء مجموعين؟', 'ما صلة النشر بحذف الأقواس؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — كل حدّ مع كل حدّ"
      moduleSubtitle="النشر · الأسهم · الأقواس"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف', title: 'نسمّي ما وجدتَه في الحديقة', tone: 'violet',
        body: (
          <div className="space-y-3">
            <p>أجب أوّلًا، ثم اقرأ الخلاصة التي تحت كل سؤال.</p>
            <TextbookBox kind="remark" title={RECALL_SIMPLIFY.title} text={RECALL_SIMPLIFY.text} source={RECALL_SIMPLIFY.source} compact>
              {base && <Link to={base} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>درس « تبسيط عبارة جبرية وحذف الأقواس » — السنة الثالثة متوسط</Link>}
            </TextbookBox>
          </div>
        ),
      }}
      steps={[
        {
          num: 1, title: 'ماذا نسمّي هذا الانتقال؟', subtitle: 'النشر', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{String.raw`على أرض عرضها 5 وطولها $(x+2)$ كتبتَ مساحتها $5(x+2)$ ثم $5x+10$. كيف نسمّي الانتقال من الأولى إلى الثانية؟`}</MathText>}
                options={[
                  M('نشر: نكتب الجداء على شكل مجموع بتوزيع الضرب على الحدّين'),
                  M('تبسيط: نجمع الحدود المتشابهة'),
                  M('حلّ معادلة'),
                ]}
                correct={0} cols={1}
                explain={<MathText>{'العدد 5 يضرب كل حدّ في القوس: $5(x+2)=5x+10$. وهذا ما نسمّيه نشر الجداء، وخاصية الضرب التوزيعية.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="tawzi-darb" lead="عدد يضرب مجموعًا: ماذا فعلتَ بالعدد؟" />}
              {q1 && <TextbookBox kind="property" compact text={KNOWLEDGE.distribute1.text} source={KNOWLEDGE.distribute1.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'كم جداءً في (a + b)(c + d) ؟', subtitle: 'كل حدّ مع كل حدّ', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{String.raw`في الأرض $(x+3)(x+2)$ ظهرت أربع قطع. كم جداءً نكتب لننشر جداء مجموعين من حدّين؟`}</MathText>}
                options={[
                  M('أربعة: كل حدّ من القوس الأول في كل حدّ من القوس الثاني'),
                  M('اثنان: الحدّان الأوّلان والحدّان الأخيران'),
                  M('ثلاثة'),
                ]}
                correct={0} cols={1} requires={['tawzi-darb']}
                explain={<MathText>{'حدّان في حدّين: $2\\times2=4$ جداءات: $x\\times x$ و $x\\times2$ و $3\\times x$ و $3\\times2$.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="jidaa-qawsayn" lead="مجموعان يتضاربان: كم جداءً وبأيّ ترتيب؟" />}
              {q2 && <TextbookBox kind="property" compact text={KNOWLEDGE.distribute2.text} source={KNOWLEDGE.distribute2.source} />}
              {q2 && <TextbookBox kind="remark" compact text={KNOWLEDGE.signs.text} source={KNOWLEDGE.signs.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'ما صلة النشر بحذف الأقواس؟', subtitle: 'العامل −1', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{String.raw`عرفتَ أنّ $-(x-3)=-x+3$. كيف نكتب $-(x-3)$ على شكل جداء ثم ننشره؟`}</MathText>}
                options={[
                  M('$(-1)\\times(x-3)=-x+3$'),
                  M('$(1)\\times(x-3)=x-3$'),
                  M('$(-1)\\times(x-3)=-x-3$'),
                ]}
                correct={0} cols={1} requires={['jidaa-qawsayn']}
                explain={<MathText>{'الإشارة $-$ قبل القوسين هي العامل $-1$ ، وهو يضرب كل حدّ: $(-1)\\times x=-x$ و $(-1)\\times(-3)=+3$.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="aqwas-tawzi" lead="قاعدة الأقواس التي عرفتَها: من أين جاءت؟" />}
              {q3 && <TextbookBox kind="remark" compact text={KNOWLEDGE.bridge.text} source={KNOWLEDGE.bridge.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
