import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE } from '../content/textbook';

/**
 * Module 2 — معارف : chaque encadré NOMME ce que l'élève vient de faire sur le ruban (question → encadré → brique), avec les mots de la
 * plateforme (guide §4ter-bis) : le nom de la demi-droite graduée, de son origine, de son unité et de ses dix graduations (P1), l'abscisse
 * et la notation O(0), A(2,4) (P2/P3), l'encadrement entre deux graduations (P2), l'origine qui n'apparaît pas et une graduation plus fine (P2).
 * LP : P1–P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);
  return (
    <ContentModule
      objectives={['ما الذي نحتاجه لتدريج نصف مستقيم؟', 'ما فاصلة نقطة وكيف نكتبها؟', 'كيف نقرأ نقطة بين تدريجتين وحين لا يظهر المبدأ؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — نصف مستقيم مدرّج"
      moduleSubtitle="المبدأ · الوحدة · التدريجات · الفاصلة · الحصر"
      estimatedTime="9 دقائق"
      brief={{
        tag: 'معارف', title: 'نسمّي ما فعلتَه على الشريط', tone: 'violet',
        body: <p>ما فعلتَه بالأعلام نكتبه الآن بالأسماء. أجب أوّلًا، ثم اقرأ الخلاصة التي تحت كل سؤال.</p>,
      }}
      steps={[
        {
          num: 1, title: 'ما الذي نحتاجه لتدريج نصف مستقيم؟', subtitle: 'المبدأ والوحدة', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>أيّ جملة تصف كيف ندرّج نصف مستقيم؟</span>}
                options={[M('نختار مبدأً $O$ ووحدة طول ننقلها منه، ثم نقسّم كلّ وحدة إلى عشرة أجزاء متساوية'), M('نقسّم نصف المستقيم كلّه إلى عشرة أجزاء متساوية دون وحدة'), M('نختار وحدة طول فقط دون مبدأ')]}
                correct={0} cols={1} requires={['tadrij-nisf-mustaqim']}
                explain={<MathText>{'المبدأ يقول من أين نبدأ العدّ، والوحدة تُنقل منه مرّة بعد مرّة، وكلّ وحدة تُقسَّم إلى عشرة أجزاء فتصير التدريجة الصغيرة $\\frac{1}{10}=0{,}1$ .'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <TextbookBox kind="definition" compact text={KNOWLEDGE.halfLine.definition} source={KNOWLEDGE.halfLine.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'ما فاصلة نقطة؟', subtitle: 'وكيف نكتبها', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>تبعد النقطة <bdi dir="ltr">B</bdi> عن <bdi dir="ltr">O</bdi> بأربع وحدات وتدريجة صغيرة واحدة. فاصلتها:</span>}
                options={[M('$4{,}1$'), M('$1{,}4$'), M('$4{,}01$')]}
                correct={0} cols={3} requires={['faasila-nuqta']}
                explain={<MathText>{'أربع وحدات كاملة ثم تدريجة صغيرة واحدة: $4+\\frac{1}{10}=4{,}1$ . والرقم الذي بعد الفاصلة يعدّ التدريجات، لا الوحدات.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <TextbookBox kind="definition" compact text={KNOWLEDGE.abscissa.definition} source={KNOWLEDGE.abscissa.source} />}
              {q2 && <TextbookBox kind="remark" compact text={KNOWLEDGE.writings.text} source={KNOWLEDGE.writings.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'وإن وقعت النقطة بين تدريجتين؟', subtitle: 'الحصر', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>علم يقع بين التدريجتين <bdi dir="ltr">7,2</bdi> و <bdi dir="ltr">7,3</bdi> . أيّ كتابة تحصر فاصلته <bdi dir="ltr">x</bdi> ؟</span>}
                options={[M('$7{,}2<x<7{,}3$'), M('$x=7{,}2$'), M('$7{,}3<x<7{,}4$')]}
                correct={0} cols={1} requires={['hasr-faasila']}
                explain={<MathText>{'لا تقع النقطة على تدريجة، فلا نقرأ لها فاصلة مضبوطة: نكتب العددين المجاورين ونحصر: $7{,}2<x<7{,}3$ .'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <TextbookBox kind="property" compact text={KNOWLEDGE.bounds.text} source={KNOWLEDGE.bounds.source} />}
            </div>
          ),
        },
        {
          num: 4, title: 'وحين لا يظهر المبدأ؟', subtitle: 'ملاحظة', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>في شريط لا يظهر مبدؤه، العلامة الأولى المكتوبة هي <bdi dir="ltr">20</bdi> . علم يقع بعد العلامة <bdi dir="ltr">21</bdi> بتدريجتين صغيرتين، فاصلته:</span>}
                options={[M('$21{,}2$'), M('$0{,}2$'), M('$20{,}2$')]}
                correct={0} cols={3}
                explain={<MathText>{'نقرأ العدد المكتوب على آخر علامة قبل العلم (21) ثم نضيف تدريجتين: $21+\\frac{2}{10}=21{,}2$ . ويبقى المبدأ $O(0)$ موجودًا خارج الصورة.'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <KnowledgeBrick id="mabda-ghayr-zahir" compact />}
              {q4 && <TextbookBox kind="remark" compact text={KNOWLEDGE.hiddenOrigin.text} source={KNOWLEDGE.hiddenOrigin.source} />}
            </div>
          ),
        },
        {
          num: 5, title: 'وإن دقّقنا المقياس؟', subtitle: 'من 0 إلى 0,1', done: q5,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>قسّمنا الفاصل بين <bdi dir="ltr">0</bdi> و <bdi dir="ltr">0,1</bdi> إلى عشرة أجزاء متساوية. التباعد بين تدريجتين صغيرتين متتاليتين:</span>}
                options={[M('$0{,}01$'), M('$0{,}1$'), M('$0{,}001$')]}
                correct={0} cols={3} requires={['tadrij-nisf-mustaqim']}
                explain={<MathText>{'عشرة أجزاء متساوية في $0{,}1$ : كلّ جزء $0{,}1\\div10=0{,}01$ .'}</MathText>}
                onAnswered={() => setQ5(true)}
              />
              {q5 && <TextbookBox kind="remark" compact text={KNOWLEDGE.smallerScale.text} source={KNOWLEDGE.smallerScale.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
