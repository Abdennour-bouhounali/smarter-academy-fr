import { useState } from 'react';
import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (idée de method-3) : quatre pas. (1) un exemple résolu en quatre lignes (une égalité à deux valeurs dans le tableau « النتيجة » ; deux inconnues ; des valeurs données pour une inégalité ; un contre-exemple) avec une question de calcul sur le tableau ;
 * (2) l'ORDRE du couple (x ; y) ; (3) « parmi des valeurs données » ; (4) un contre-exemple. Jamais « معادلة » ni « حلّ ». LP : P1, P2, P3.
 */
export default function Module03Tariqa() {
  const [read, setRead] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  return (
    <ContentModule
      objectives={['كيف أنظّم اختبار مساواة في جدول؟', 'كيف أعوّض عددين مجهولين؟', 'كيف أعيّن القيم التي تحقّق متباينة من بين قيم معطاة؟', 'كيف أبيّن أنّ عبارتين غير متساويتين؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أعوّض وأحسب وأقارن"
      moduleSubtitle="من القيمة إلى الحكم: صحيحة أم خاطئة"
      estimatedTime="10 دقائق"
      brief={{ tone: 'sky', tag: 'طريقة', title: 'من الحمولة إلى الحكم',
        body: <p>رأينا كيف يحكم الميزان. للطريقة ثلاث خطوات: نعوّض الحرف بالقيمة في الطرفين، ننجز الحساب في كلّ طرف، ثمّ نقارن النتيجتين.</p> }}
      steps={[
        { num: 1, title: 'أمثلة محلولة', subtitle: 'اكشف سطرًا سطرًا', done: read && q1,
          content: (
            <div className="space-y-3">
              <MethodSteps method={{ source: METHOD.source, exercise: METHOD.exercise, solution: METHOD.solution }} onAllRevealed={() => setRead(true)} />
              {read && (
                <NumericQuestion prompt={<MathText>{'في الجدول: $5x-3$ من أجل $x=4$ تساوي'}</MathText>} expected={17}
                  explain={<MathText>{'$5\\times4-3=20-3=17$ ، وهو ما أعطاه الطرف الأوّل $2\\times4+9=17$ : المساواة صحيحة من أجل $x=4$ .'}</MathText>}
                  onAnswered={() => setQ1(true)} />
              )}
              {q1 && <KnowledgeBrick id="jadwal-ikhtibar" />}
            </div>
          ) },
        { num: 2, title: 'ترتيب القيمتين', subtitle: '$(x;y)=(6;4)$', done: q2,
          content: (
            <div className="space-y-3">
              <NumericQuestion prompt={<MathText>{'نبدّل القيمتين في $3x+2y$ : من أجل $(x;y)=(6;4)$ نجد'}</MathText>} expected={26}
                explain={<MathText>{'$3\\times6+2\\times4=18+8=26$ ، لا $24$ : $(6;4)$ ليس $(4;6)$ ، فالمساواة $3x+2y=24$ خاطئة هنا.'}</MathText>}
                onAnswered={() => setQ2(true)} />
              {q2 && <KnowledgeBrick id="zawj-tartib" variant="rappel" compact />}
            </div>
          ) },
        { num: 3, title: 'قيم معطاة', subtitle: '$4x-3\\le2x+7$', done: q3,
          content: (
            <div className="space-y-3">
              <NumericQuestion prompt={<MathText>{'من بين $3$ و $4$ و $5$ و $6$ ، كم قيمة تجعل $4x-3\\le2x+7$ صحيحة؟'}</MathText>} expected={3}
                explain={<MathText>{'$3$ و $4$ و $5$ تصحّحها ($9\\le13$ ، $13\\le15$ ، $17\\le17$) و $6$ لا ($21\\le19$ خاطئة): ثلاث قيم.'}</MathText>}
                onAnswered={() => setQ3(true)} />
              {q3 && <KnowledgeBrick id="qiyam-muhaqqiqa" />}
            </div>
          ) },
        { num: 4, title: 'مثال مضادّ', subtitle: '$3x+x$ و $3x^2$', done: q4,
          content: (
            <div className="space-y-3">
              <NumericQuestion prompt={<MathText>{'من أجل $x=1$ تساوي العبارة $3x^2$ العدد'}</MathText>} expected={3}
                explain={<MathText>{'$3\\times1^2=3$ ، أمّا $3x+x=4$ ، فالعبارتان تعطيان $4\\neq3$ : مثال واحد يبيّن أنّهما غير متساويتين.'}</MathText>}
                onAnswered={() => setQ4(true)} />
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
