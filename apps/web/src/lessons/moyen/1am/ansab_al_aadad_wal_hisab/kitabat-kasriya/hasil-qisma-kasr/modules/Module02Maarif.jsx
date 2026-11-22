import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 2 — معارف 1 (p. 55) « حاصل القسمة والكسر » : chaque boîte du manuel NOMME ce que l'élève vient de trouver (question → boîte →
 * brique) : a ÷ b = a/b et le vocabulaire (7 ÷ 3), la نتيجة a/b × b = a, le contraste décimal / non décimal (7/3, 2,33) puis « تمهيد »
 * (الكاشي) en clôture. Le dernier exemple de معارف 1 (0,7 = 7/10) est à `ikhtizal-kitaba-kasriya`. LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [qz, setQz] = useState(false);
  return (
    <ContentModule
      objectives={['كيف نكتب حاصل قسمة 7 على 3؟', 'ماذا يعطي ضرب الكسر في مقامه؟', 'هل الكسر عدد عشري دائمًا؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — حاصل القسمة والكسر"
      moduleSubtitle="a ÷ b = a/b · a/b × b = a · عشري أو لا"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف', title: 'نسمّي ما وجدته في الكعكات', tone: 'violet',
        body: <p>ما فعلتَه بالكعكات نكتبه الآن بالرموز. أجب أوّلًا، ثم اقرأ الخلاصة التي تحت كل سؤال.</p>,
      }}
      steps={[
        {
          num: 1, title: 'حاصل قسمة 7 على 3', subtitle: 'البسط والمقام', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="حاصل قسمة 7 على 3 يُكتب:"
                options={[M('$\\frac{7}{3}$'), M('$\\frac{3}{7}$'), M('$2{,}33$ بالضبط')]}
                correct={0} cols={3} requires={['kasr-hasil-qisma']}
                explain={<MathText>{'$7\\div 3=\\frac{7}{3}$ : المقسوم 7 هو البسط والمقسوم عليه 3 هو المقام.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <TextbookBox kind="definition" compact lines={[
                'في لوحة الكعكات: $a$ هو عدد الكعكات على الطاولة، و$b$ هو عدد الأطفال الذين يتقاسمونها بالتساوي. حصّة الواحد تُكتب $\\frac{a}{b}$، ونقول: $a\\div b=\\frac{a}{b}$.',
                'العدد $a$ فوق الخط يسمّى البسط (ما نوزّعه: الكعكات)، والعدد $b$ تحت الخط يسمّى المقام (عدد من نوزّع عليهم: الأطفال).',
              ]} />}
              {q1 && (
                <TapQuestion
                  prompt={<MathText>{'لماذا لا نكتب $\\frac{5}{0}$، أي لماذا لا يمكن أن يكون $b=0$؟'}</MathText>}
                  options={[M('لأنّ المقام هو عدد الأطفال، وإذا لم يكن هناك أحد فلا أحد يأخذ حصّة'), M('لأنّ 5 أصغر من 0'), M('لأنّ الناتج يكون دائمًا 5')]}
                  correct={0} cols={1} requires={['kasr-hasil-qisma']}
                  explain={<MathText>{'الكسر $\\frac{5}{0}$ يعني عددًا إذا ضُرب في 0 أعطى 5، لكن الضرب في 0 يعطي 0 دائمًا. فلا توجد قسمة على 0، والمقام يختلف عن الصفر.'}</MathText>}
                  onAnswered={() => setQz(true)}
                />
              )}
              {qz && <TextbookBox kind="remark" compact lines={['المقام $b$ لا يساوي الصفر أبدًا: لا نوزّع كعكات على 0 أطفال.', 'الكسر ليس عددًا عشريًا دائمًا.']} />}
            </div>
          ),
        },
        {
          num: 2, title: 'ضرب الكسر في مقامه', subtitle: '7/3 × 3', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'$\\frac{7}{3}\\times 3=\\ldots$'}</MathText>}
                options={[M('7'), M('3'), M('$\\frac{7}{9}$')]}
                correct={0} cols={3} requires={['kasr-hasil-qisma']}
                explain={<MathText>{'ثلاث حصص من $\\frac{7}{3}$ كعكة تملأ 7 كعكات: $\\frac{7}{3}\\times 3=7$.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="natija-darb" lead="في الكعكات: حصص الأطفال معًا تملأ الكعكات بالضبط." />}
              {q2 && <TextbookBox kind="property" compact text={'الكسر $\\frac{a}{b}$ هو العدد الذي إذا ضربناه في $b$ حصلنا على $a$: $\\frac{a}{b}\\times b=a$.'} />}
              {q2 && <TextbookBox kind="example" compact text={'إذا نال كل واحد من 3 أطفال $\\frac{7}{3}$ كعكة فالجميع يأخذ $\\frac{7}{3}\\times 3=7$ كعكات: هي كل ما كان على الطاولة.'} />}
            </div>
          ),
        },
        {
          num: 3, title: 'هل 7/3 عدد عشري؟', subtitle: 'القيمة المضبوطة والمقرّبة', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'القسمة العشرية لـ 7 على 3 تعطي $2{,}333\\ldots$ فالكسر $\\frac{7}{3}$:'}</MathText>}
                options={[M('ليس عددًا عشريًا لأنّ القسمة لا تنتهي'), M('عدد عشري هو $2{,}33$'), M('عدد عشري هو $2{,}3$')]}
                correct={0} cols={1} requires={['qisma-ashriya-ibtidai']}
                explain={<MathText>{'$3\\times 2{,}33=6{,}99$ وليس 7: $2{,}33$ قيمة مقرّبة فقط.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="ashri-ghayr-ashri" lead="في الكعكات: 0,66 ثم 0,666 ثم … ولا تنتهي الكعكات." />}
              {q3 && <TextbookBox kind="example" compact text={'$\\frac{7}{3}$ ليس عددًا عشريًا لأنّ القسمة العشرية لـ 7 على 3 لا تنتهي. $2{,}33$ قيمة مقرّبة فقط، أمّا القيمة المضبوطة فهي الكسر $\\frac{7}{3}$.'} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
