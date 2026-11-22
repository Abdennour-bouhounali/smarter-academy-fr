import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE } from '../content/textbook';

/**
 * Module 2 — معارف : chaque encadré NOMME ce que l'élève vient de trouver à l'atelier (question → encadré → brique), avec les mots de la
 * plateforme (guide §4ter-bis) : le كسر عشري et ses noms (P1), la lecture et la virgule (P2), le مفكوك النموذجي d'un décimal (P3), les
 * zéros qu'on garde et ceux qu'on supprime (P2), رقم الأعشار et عدد الأعشار (P3). Le dernier exemple de معارف 4 (b) du manuel y est cité. LP : P1–P3.
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
      objectives={['كيف نسمّي القطع الصغيرة ونكتبها؟', 'كيف نقرأ عددًا عشريًا ونفكّكه؟', 'أيّ الأصفار نحذف وأيّها نُبقي؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — الكسر العشري والكتابة العشرية"
      moduleSubtitle="الأعشار · الأجزاء من مائة وألف · المفكوك · الأصفار"
      estimatedTime="8 دقائق"
      brief={{
        tag: 'معارف', title: 'نسمّي ما وجدته في الورشة', tone: 'violet',
        body: <p>ما فعلتَه بالبلاطات نكتبه الآن بالأسماء. أجب أوّلًا، ثم اقرأ الخلاصة التي تحت كل سؤال.</p>,
      }}
      steps={[
        {
          num: 1, title: 'اسم القطع الصغيرة', subtitle: 'العُشر والجزء من مائة والجزء من ألف', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="البلاطة الواحدة جزء من مائة جزء متقايس من اللوحة. أيّ كسر يمثّلها؟"
                options={[M('$\\frac{1}{100}$'), M('$\\frac{1}{10}$'), M('$\\frac{100}{1}$')]}
                correct={0} cols={3} requires={['kasr-ashri']}
                explain={<MathText>{'جزء واحد من مائة جزء: $\\frac{1}{100}$ . أمّا العمود فجزء من عشرة أجزاء: $\\frac{1}{10}$ .'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <TextbookBox kind="definition" compact lines={[KNOWLEDGE.decimalFraction.definition, KNOWLEDGE.decimalFraction.equal]} source={KNOWLEDGE.decimalFraction.source} />}
              {q1 && <TextbookBox kind="remark" compact text={KNOWLEDGE.decimalFraction.size} />}
            </div>
          ),
        },
        {
          num: 2, title: 'كيف نقرأ 2,35؟', subtitle: 'الجزء الصحيح والجزء العشري', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>العدد <bdi dir="ltr">2,35</bdi> هو لوحتان وثلاثة أعمدة وخمس بلاطات. نقرؤه:</span>}
                options={[M('وحدتان وثلاثة أعشار وخمسة أجزاء من مائة'), M('وحدتان وخمسة وثلاثون عُشرًا'), M('وحدتان وثلاثة وخمسون جزءًا من مائة')]}
                correct={0} cols={1} requires={['kitaba-bifasila']}
                explain={<MathText>{'الرقم 3 يعدّ أعشارًا والرقم 5 يعدّ أجزاءً من مائة. ($35$ عُشرًا تعني $3{,}5$ ، و $53$ جزءًا من مائة تعني $0{,}53$ .)'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <TextbookBox kind="definition" compact text={KNOWLEDGE.comma.definition} source={KNOWLEDGE.comma.source} />}
              {q2 && <TextbookBox kind="example" compact text={KNOWLEDGE.comma.reading} />}
            </div>
          ),
        },
        {
          num: 3, title: 'مجموع حدّه لكل رقم', subtitle: 'المفكوك النموذجي', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'$2{,}35=2+\\frac{3}{10}+\\ldots$ ، الحدّ الناقص هو:'}</MathText>}
                options={[M('$\\frac{5}{100}$'), M('$\\frac{5}{10}$'), M('$\\frac{35}{10}$')]}
                correct={0} cols={3} requires={['kasr-ashri']}
                explain={<MathText>{'الرقم 5 في مرتبة الأجزاء من مائة: $\\frac{5}{100}$ . ولو كان $\\frac{5}{10}$ لكان العدد $2{,}8$ .'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="mafkuk-ashri" lead="لوحتان، وثلاثة أعمدة، وخمس بلاطات: كيف نكتبها مجموعًا؟" />}
              {q3 && <TextbookBox kind="property" compact lines={[KNOWLEDGE.expansion.definition, KNOWLEDGE.expansion.order]} source={KNOWLEDGE.expansion.source} />}
            </div>
          ),
        },
        {
          num: 4, title: 'أيّ صفر نحذف؟', subtitle: '3,40 و 3,04', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="أيّ هذه الكتابات يساوي 3,4 تمامًا؟"
                options={[M('$3{,}40$'), M('$3{,}04$'), M('$30{,}4$')]}
                correct={0} cols={3} requires={['kasr-ashri']}
                explain={<MathText>{'$3{,}40$ هو $3$ وأربعة أعشار وصفر من الأجزاء من مائة، أي $3{,}4$ . أمّا $3{,}04$ فهو $3$ وأربعة أجزاء من مائة، و $30{,}4$ عدد أكبر بعشر مرّات.'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <KnowledgeBrick id="asfar-ghayr-darurya" lead="2,50 و 2,5 ملآ الطاولة نفسها، أمّا 0,05 و 0,5 فلا: ما الفرق بين الصفرين؟" />}
            </div>
          ),
        },
        {
          num: 5, title: 'رقم الأعشار وعدد الأعشار', subtitle: 'كم عُشرًا في 2,35؟', done: q5,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>في العدد <bdi dir="ltr">2,35</bdi> رقم الأعشار هو 3. كم عُشرًا في هذا العدد كله؟ (كل وحدة تحوي 10 أعشار)</span>}
                options={[M('23 عُشرًا'), M('3 أعشار'), M('35 عُشرًا')]}
                correct={0} cols={3} requires={['kasr-ashri']}
                explain={<MathText>{'الوحدتان تعطيان $20$ عُشرًا، والرقم 3 يعطي 3 أعشار: $20+3=23$ .'}</MathText>}
                onAnswered={() => setQ5(true)}
              />
              {q5 && <KnowledgeBrick id="adad-al-aashar" compact />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
