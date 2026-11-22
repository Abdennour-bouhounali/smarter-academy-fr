import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';
import GoldenFigure from '../components/GoldenFigure';

/**
 * Module 4 — أوظّف تعلّماتي (p. 26–27) et أتعمّق 33 (p. 29), dans l'ordre du
 * manuel : 15, 16, 17 (جداء), 20, 21 (حاصل قسمة), 33 (العدد الذهبي).
 * Laboratoire : les erreurs sont corrigées, jamais comptées. LP : P1, P2.
 *
 * `TextbookExercise` (interaction `batch`) rend les OPTIONS et les
 * CORRECTIONS des lignes telles quelles, sans MathText : les données
 * (pures, `$…$`) sont donc habillées ici, au rendu, sans être réécrites.
 */
const withMath = (ex) => ({
  ...ex,
  question: {
    ...ex.question,
    rows: ex.question.rows.map((r) => ({
      ...r,
      options: r.options.map((o) => <MathText key={o}>{o}</MathText>),
      ...(r.correction ? { correction: <MathText>{r.correction}</MathText> } : {}),
    })),
  },
});
const X = Object.fromEntries(Object.entries(EX).map(([id, ex]) => [id, withMath(ex)]));

export default function Module04Awazzif() {
  const [d15, setD15] = useState(false);
  const [d16, setD16] = useState(false);
  const [d17, setD17] = useState(false);
  const [d20, setD20] = useState(false);
  const [d21, setD21] = useState(false);
  const [d33, setD33] = useState(false);
  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="جداء جذرين وحاصل قسمتهما، ثم العدد الذهبي"
      estimatedTime="12 دقيقة"
      objectives={['كيف أحسب جذر جداء أو جذر حاصل قسمة؟', 'كيف أستعمل الخاصيتين في تمرين العدد الذهبي؟']}
      brief={{
        tag: 'أوظّف تعلّماتي', title: 'جداء جذرين وحاصل قسمتهما في التمارين', tone: 'amber',
        body: <p>في كل سطر اختر النتيجة، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب. وفي الأخير: كيف نرسم العدد الذهبي بالمسطرة والمدوّر.</p>,
      }}
      steps={[
        { num: 1, title: 'جذر جداء', done: d15,
          content: <div className="space-y-3"><KnowledgeBrick id="jidaa-jidhrayn" variant="rappel" compact /><TextbookExercise exercise={X['ex-15']} requires={['jidaa-jidhrayn']} onAnswered={() => setD15(true)} /></div> },
        { num: 2, title: 'جذر جداء أعداد عشرية', done: d16,
          content: <TextbookExercise exercise={X['ex-16']} requires={['jidaa-jidhrayn']} onAnswered={() => setD16(true)} /> },
        { num: 3, title: 'جداء جذرين', done: d17,
          content: <TextbookExercise exercise={X['ex-17']} requires={['jidaa-jidhrayn', 'la-tawzi-jam']} onAnswered={() => setD17(true)} /> },
        { num: 4, title: 'جذر حاصل قسمة', done: d20,
          content: <div className="space-y-3"><KnowledgeBrick id="qismat-jidhrayn" variant="rappel" compact /><TextbookExercise exercise={X['ex-20']} requires={['qismat-jidhrayn']} onAnswered={() => setD20(true)} /></div> },
        { num: 5, title: 'حاصل قسمة جذرين', done: d21,
          content: <TextbookExercise exercise={X['ex-21']} requires={['qismat-jidhrayn']} onAnswered={() => setD21(true)} /> },
        { num: 6, title: 'العدد الذهبي', subtitle: 'أتعمّق', done: d33,
          content: (
            <div className="space-y-3">
              <GoldenFigure />
              <TextbookExercise exercise={X['ex-33']} requires={['qismat-jidhrayn', 'la-tawzi-jam']} onAnswered={() => setD33(true)} />
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
