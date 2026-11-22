import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import ArcTape from '../../../../../../common/components/ArcTape';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACT, ACTIVITY, KNOWLEDGE, TAPES } from '../content/textbook';

/**
 * Module 2 — معارف 1 (p. 26), le SENS et les MOTS : مجموع / حدّا المجموع, فرق / حدّا الفرق. La technique du même
 * paragraphe (أفقيا / عموديا, l'ordre des termes) est la leçon suivante de l'unité (injaz-jam-tarh-mudad).
 * Chaque nom est DEMANDÉ sur l'exemple du manuel (avec son مخطط بأقواس), puis donné par la brique ; les textes ② et ⑤
 * du نشاط 1 (les deux textes « de vocabulaire ») sont repris ensuite. LP : P2.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const { sum, difference } = KNOWLEDGE;

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3a, setQ3a] = useState(false);
  const [q3b, setQ3b] = useState(false);
  const [q4, setQ4] = useState(false);

  return (
    <ContentModule
      objectives={['ماذا نسمّي نتيجة الجمع؟ ونتيجة الطرح؟', 'ماذا نسمّي العددين اللذين نجمعهما أو نطرحهما؟', 'كيف نقرأ ذلك على مخطط بأقواس؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — المجموع والفرق"
      moduleSubtitle="لكل عدد في العملية اسم"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف — الكتاب ص 26', title: 'ماذا نسمّي كل عدد في الجمع والطرح؟', tone: 'violet',
        body: <p>في النشاط اخترنا العملية. الآن نسمّي الأعداد: للنتيجة اسم، وللعددين اللذين نحسب بهما اسم آخر، ونقرأها كلّها على مخطط بأقواس.</p>,
      }}
      intro={(
        <div className="space-y-2" data-maarif-figure>
          <TextbookBox kind="example" text={sum.example.equality} source={sum.source} compact />
          <ArcTape {...TAPES.sum} />
        </div>
      )}
      steps={[
        {
          num: 1, title: 'في الجمع: ما اسم كل عدد؟', subtitle: '$24{,}3 + 5{,}9 = 30{,}2$', done: q1,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'في المساواة $24{,}3 + 5{,}9 = 30{,}2$ :'}</MathText></p>}
                rows={[
                  { id: 's1', label: 'العدد 30,2 (تحت الخطّ)', options: ['مجموع العددين 24,3 و 5,9', 'فرق العددين 24,3 و 5,9', 'حدّ من حدّي المجموع'], correct: 0,
                    correction: 'ناتج جمع عددين يُسمّى مجموع هذين العددين.' },
                  { id: 's2', label: 'العددان 24,3 و 5,9 (فوق الخطّ)', options: ['المجموع', 'حدّا المجموع', 'الفرق'], correct: 1,
                    correction: 'العددان اللّذان نقوم بجمعهما يُسمّيان حدّي المجموع.' },
                ]}
                requires={['jam-tarh-tabii']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'تمامًا.' : 'اقرأ الأسماء في البطاقة أسفله.'}</Feedback>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="majmu-hadda" />}
            </div>
          ),
        },
        {
          num: 2, title: 'وفي الطرح؟', subtitle: '$49{,}5 - 18{,}46 = 31{,}04$', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="example" text={difference.example.equality} source={difference.source} compact />
              <ArcTape {...TAPES.difference} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'في المساواة $49{,}5 - 18{,}46 = 31{,}04$ :'}</MathText></p>}
                rows={[
                  { id: 'd1', label: 'العدد 31,04', options: ['مجموع العددين 49,5 و 18,46', 'فرق العددين 49,5 و 18,46', 'حدّ من حدّي الفرق'], correct: 1,
                    correction: 'نتيجة طرح عددين تُسمّى فرق هذين العددين.' },
                  { id: 'd2', label: 'العددان 49,5 و 18,46', options: ['حدّا الفرق', 'حدّا المجموع', 'الفرق'], correct: 0,
                    correction: 'العددان اللّذان نقوم بطرح أحدهما من الآخر يُسمّيان حدّي الفرق.' },
                ]}
                requires={['majmu-hadda']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'تمامًا.' : 'اقرأ الأسماء في البطاقة أسفله.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="farq-hadda" />}
            </div>
          ),
        },
        {
          num: 3, title: 'النصّان ② و ⑤ من النشاط', subtitle: 'فرق ومجموع', done: q3a && q3b,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" lines={[ACT[2].text, ACT[5].text]} source={ACTIVITY.source} compact />
              <NumericQuestion
                prompt={<span>فرق العددين 24,5 و 11,5 هو:</span>}
                expected={13} display="13" parse={parseDec}
                requires={['farq-hadda']}
                explain={<MathText>{'$24{,}5 - 11{,}5 = 13$ : الفرق نتيجة الطرح.'}</MathText>}
                onAnswered={() => setQ3a(true)}
              />
              <NumericQuestion
                prompt={<span>مجموع العددين 31,02 و 22,60 هو:</span>}
                expected={53.62} display="53,62" parse={parseDec}
                requires={['majmu-hadda']}
                explain={<MathText>{'$31{,}02 + 22{,}60 = 53{,}62$ : المجموع نتيجة الجمع.'}</MathText>}
                onAnswered={() => setQ3b(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'نقرأ المخطط', subtitle: 'ماذا يمثّل □؟', done: q4,
          content: (
            <div className="space-y-3">
              <ArcTape {...TAPES.differenceUnknown} />
              <TapQuestion
                prompt={<span>في هذا المخطط، ماذا يمثّل □؟</span>}
                options={[M('فرق العددين 49,5 و 18,46'), M('مجموع العددين 49,5 و 18,46'), M('حدّ المجموع 49,5')]}
                correct={0}
                cols={1}
                requires={['farq-hadda']}
                explain={<MathText>{'49,5 هو الكلّ و 18,46 جزء منه: □ هو الجزء الآخر، $\\square = 49{,}5 - 18{,}46 = 31{,}04$ ، أي فرق العددين.'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
