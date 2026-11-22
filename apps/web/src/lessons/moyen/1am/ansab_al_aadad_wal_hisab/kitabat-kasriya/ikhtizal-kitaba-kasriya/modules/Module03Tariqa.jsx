import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, GUIDE } from '../content/textbook';
import { EX } from '../content/exercises';

/**
 * Module 3 — طريقة (p. 56) « اختزال كتابة كسرية » : 45/567 révélé ligne à ligne (tables de multiplication, critère de 9),
 * la méthode (brique gardée par « أتوقّع القاعدة »), le piège « un diviseur d'UN seul terme » (le grand-père : 27/45 ÷ 5),
 * puis دوري الآن ②③ et les exercices 22 et 26 (p. 58 : jusqu'à la forme la plus simple ; 414/391 par 23). LP : P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [read, setRead] = useState(false);
  const [q1, setQ1] = useState(false);
  const [now, setNow] = useState(false);
  const [more, setMore] = useState({});
  const mark = (id) => () => setMore((d) => ({ ...d, [id]: true }));
  return (
    <ContentModule
      objectives={['على أيّ عدد نقسم البسط والمقام؟', 'متى نتوقّف عن الاختزال؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — اختزال كتابة كسرية"
      moduleSubtitle="قاسم مشترك للبسط والمقام"
      estimatedTime="10 دقائق"
      brief={{ tag: 'أكتسب طرائق — الكتاب ص 56', title: METHOD.title, tone: 'emerald',
        body: <p>مثال محلول من الكتاب: اكشف الحلّ سطرًا سطرًا، وحاول أن تتوقّع السطر التالي.</p> }}
      steps={[
        { num: 1, title: 'حلّ الكتاب سطرًا سطرًا', subtitle: '45/567', done: q1,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD} onAllRevealed={() => setRead(true)} />
              {read && <KnowledgeBrick id="tariqat-ikhtizal" lead="45 و 567 يقبلان القسمة على 9." />}
              <TapQuestion
                prompt={<MathText>{'لاختزال $\\frac{27}{45}$ ، قال أمين: «45 ينتهي بالرقم 5، أقسم البسط والمقام على 5». ما رأيك؟'}</MathText>}
                options={[M('خطأ: $27=5\\times 5+2$ ، 5 ليس قاسمًا للبسط'), M('صحيح: يكفي أن يقبل المقام القسمة'), M('صحيح: $\\frac{27}{45}=\\frac{5}{9}$')]}
                correct={0} cols={1} requires={['tariqat-ikhtizal']}
                explain={<MathText>{GUIDE.oneTerm.right}</MathText>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ) },
        { num: 2, title: 'دوري الآن', subtitle: 'أتمم ثم اختزل', done: now,
          content: <TextbookExercise exercise={EX['now-56']} requires={['tariqat-ikhtizal']} onAnswered={() => setNow(true)} /> },
        { num: 3, title: 'حتى أبسط شكل ممكن', subtitle: 'تمرينا 22 و 26', done: !!more['ex-22'] && !!more['ex-26'],
          content: (
            <div className="space-y-3">
              <TextbookExercise exercise={EX['ex-22']} requires={['tariqat-ikhtizal']} onAnswered={mark('ex-22')} />
              <TextbookExercise exercise={EX['ex-26']} requires={['tariqat-ikhtizal']} onAnswered={mark('ex-26')} />
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
