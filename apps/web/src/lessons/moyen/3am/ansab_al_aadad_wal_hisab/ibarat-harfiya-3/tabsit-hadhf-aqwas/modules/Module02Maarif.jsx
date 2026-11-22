import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE } from '../content/textbook';

/**
 * Module 2 — معارف : chaque encadré NOMME ce que l'élève vient de trouver à la table du club, avec les mots de la plateforme (guide
 * §4ter-bis) : la dernière opération d'une expression (somme ou produit, P4), le produit de monômes (P1), et pourquoi 3x × 5x n'est pas
 * 3x + 5x. Aucun labo : la première question est l'action. Question → encadré → brique. La carte historique des symboles clôt le module.
 * LP : P1, P4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  return (
    <ContentModule
      objectives={['ما الذي يفرّق مجموعًا عن جداء؟', 'كيف نبسّط جداء حدود؟', 'لماذا لا يساوي الجداء المجموع؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — مجموع أم جداء؟"
      moduleSubtitle="آخر عملية · جداء حدود"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف', title: 'نسمّي ما وجدته على الطاولة', tone: 'violet',
        body: <p>أجب أوّلًا، ثم اقرأ الخلاصة التي تحت كل سؤال.</p>,
      }}
      steps={[
        {
          num: 1, title: 'ما الذي يفرّق العبارتين؟', subtitle: 'مجموع أم جداء', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{String.raw`العبارتان $4\times(3x)$ و $3x+3x+3x+3x$ تساويان $12x$ كلتاهما. ما الذي يفرّق بينهما كتابةً؟`}</MathText>}
                options={[
                  M('آخر عملية في الأولى ضرب وفي الثانية جمع'),
                  M('الأولى أكبر قيمة من الثانية'),
                  M('في الأولى حرف وليس في الثانية'),
                ]}
                correct={0} cols={1}
                explain={<MathText>{'في الأولى نضرب 4 في $3x$ فهي جداء، وفي الثانية نجمع أربعة حدود فهي مجموع. القيمة نفسها والكتابة مختلفة.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="majmu-wa-jidaa" lead="عبارتان بقيمة واحدة: بماذا نميّز المجموع من الجداء؟" />}
              {q1 && <TextbookBox kind="definition" compact text={KNOWLEDGE.sumOrProduct.text} source={KNOWLEDGE.sumOrProduct.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'كيف نبسّط جداء حدود؟', subtitle: 'جداء حدّين', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{String.raw`اكتب العوامل واحدًا واحدًا: $3x\times5x=3\times x\times5\times x$. ما ناتج هذا الجداء؟`}</MathText>}
                options={[M('$15x^2$'), M('$15x$'), M('$8x$')]}
                correct={0} cols={3} requires={['majmu-wa-jidaa']}
                explain={<MathText>{'نضرب الأعداد: $3\\times5=15$ ، ونضرب الحروف: $x\\times x=x^2$ ، فنجد $15x^2$.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="jidaa-hududayn" lead="جداء حدّين: ماذا فعلتَ بالعددين وماذا فعلتَ بالحرفين؟" />}
              {q2 && <TextbookBox kind="property" compact text={KNOWLEDGE.product.text} source={KNOWLEDGE.product.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'هل الجداء يساوي المجموع؟', subtitle: 'اختبار بقيمة', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{String.raw`هل $3x\times5x$ تساوي $3x+5x$ ؟ اختبر بقيمة $x=2$.`}</MathText>}
                options={[
                  M('لا: عند $x=2$ الأولى تساوي 60 والثانية تساوي 16'),
                  M('نعم: كلتاهما فيها $3x$ و $5x$'),
                  M('نعم: عند $x=2$ كلتاهما تساوي 16'),
                ]}
                correct={0} cols={1} requires={['jidaa-hududayn']}
                explain={<MathText>{'$3\\times2\\times5\\times2=60$ أمّا $6+10=16$. جداء الحدّين غير مجموعهما: الأولى $15x^2$ والثانية $8x$.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <TextbookBox kind="remark" compact text={KNOWLEDGE.history.text} source={KNOWLEDGE.history.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
