import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessonPath } from '@smarter-academy/core';
import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE, RECALL_1AM, RECALL_OPS } from '../content/textbook';
import { parseNum } from '../content/exercises';

/**
 * Module 2 — معارف : chaque encadré NOMME ce que l'élève vient de faire au mur de billes, avec les mots de la plateforme (guide §4ter-bis). Aucun labo :
 * la première question est l'action — deux valeurs de 2x² − 5x + 1 (en 3, puis en −1), puis « أتوقّع القاعدة » (la brique gardée), la définition et
 * son exemple ; puis deux lettres avec des décimaux, et la valeur exacte avec π (une remarque). Deux « تذكّر » dans le `brief` : la première année (la règle
 * littérale, positive) et les opérations sur les rationnels — chacune avec son lien quand sa leçon est publiée (`getLessonPath`), jamais reconstruite. LP : P1, P2.
 */
export default function Module02Maarif() {
  const [q, setQ] = useState({});
  const answered = (key) => () => setQ((s) => ({ ...s, [key]: true }));
  const link = (code, label) => { const to = getLessonPath(code); return to && <Link to={to} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>{label}</Link>; };
  return (
    <ContentModule
      objectives={['كيف أحسب قيمة عبارة حرفية؟', 'أين أضع الأقواس وعلامة الضرب؟', 'كيف أحسب بحرفين وبأعداد عشرية؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — عوّض ثم احسب"
      moduleSubtitle="التعويض · الأقواس · الأولوية"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف', title: 'نسمّي ما فعلتَه في المسار', tone: 'violet',
        body: (
          <div className="space-y-3">
            <p>أجب أوّلًا، ثم اقرأ الخلاصة التي تحت الأسئلة.</p>
            <TextbookBox kind="remark" title={RECALL_1AM.title} text={RECALL_1AM.text} source={RECALL_1AM.source} compact>
              {link(RECALL_1AM.lesson, 'درس « تطبيق قاعدة حرفية » — السنة الأولى متوسط')}
            </TextbookBox>
            <TextbookBox kind="remark" title={RECALL_OPS.title} text={RECALL_OPS.text} source={RECALL_OPS.source} compact>
              {link(RECALL_OPS.lesson, 'درس « العمليات على الأعداد الناطقة » — السنة الثالثة متوسط')}
            </TextbookBox>
          </div>
        ),
      }}
      steps={[
        {
          num: 1, title: 'قيمتان لعبارة واحدة', subtitle: 'عدد موجب ثم عدد سالب', done: !!q.a && !!q.b,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{String.raw`احسب قيمة $2x^2-5x+1$ من أجل $x=3$ .`}</MathText>}
                expected={4} display="4" parse={parseNum}
                explain={<MathText>{'$2\\times3^2-5\\times3+1=18-15+1=4$ ؛ القوة أولًا ثم الضرب ثم الجمع والطرح.'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && (
                <NumericQuestion
                  prompt={<MathText>{String.raw`ثم من أجل $x=-1$ .`}</MathText>}
                  expected={8} display="8" parse={parseNum}
                  explain={<MathText>{'$2\\times(-1)^2-5\\times(-1)+1=2+5+1=8$ ؛ القوسان يحفظان الإشارة: $(-1)^2=1$.'}</MathText>}
                  onAnswered={answered('b')}
                />
              )}
              {q.b && <KnowledgeBrick id="tawid-qimat" lead="حسبتَ قيمة العبارة بعدد موجب ثم بعدد سالب: ما الخطوات التي اتّبعتَها؟" />}
              {q.b && <TextbookBox kind="definition" compact text={KNOWLEDGE.definition.text} source={KNOWLEDGE.definition.source} />}
              {q.b && <TextbookBox kind="example" compact text={KNOWLEDGE.example.text} source={KNOWLEDGE.example.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'حرفان وأعداد عشرية', subtitle: 'ثم القيمة المضبوطة', done: !!q.c,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{String.raw`احسب قيمة $B=(4-x)(y+2)$ من أجل $x=-1{,}5$ و $y=-7$ .`}</MathText>}
                expected={-27.5} display="-27,5" parse={parseNum} requires={['tawid-qimat']}
                explain={<MathText>{'$B=(4-(-1{,}5))\\times(-7+2)=5{,}5\\times(-5)=-27{,}5$ ؛ نضع كل قيمة سالبة بين قوسين.'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <TextbookBox kind="remark" compact text={KNOWLEDGE.exactValue.text} source={KNOWLEDGE.exactValue.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
