import { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY_6 } from '../content/textbook';

/**
 * Module 2 — نشاط 6 (p. 67) « المقادير المركّبة » (DISCOVER) :
 *   1. la voiture à 25 m/s devant le panneau 80 km/h : convertir, comparer → brique miqdar-qisma
 *      (une vitesse est le quotient d'une distance par une durée) ;
 *   2. le débit de la station (7 200 000 L/h → 2 m³/s) → brique tahwil-murakkab (convertir le
 *      numérateur ET le dénominateur) ;
 *   3. les trois métaux (question CORRIGÉE : 8 cm³ de cuivre, une ligne discrète) : comparer des
 *      masses de 1 cm³, la masse volumique ; chaque distracteur est un calcul faux réel (quotient
 *      renversé, unité oubliée, le 6 cm³ du misprint) ;
 *   4. lire une grandeur en fonction d'une autre (P3) : à 25 m/s, d = 25t.
 * LP : P2, P3.
 * RETROFIT 2026-10-15 : module sans labo — le brief ne nomme plus la notion (« مقادير مركّبة ») avant qu'elle ne soit trouvée.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02MaqadirMurakkaba() {
  const [q1a, setQ1a] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3a, setQ3a] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      objectives={["هل ارتكب السائق مخالفة؟", "كيف نعبّر عن تدفق بالوحدة المناسبة؟", "أيّ المعادن أثقل؟"]}
      moduleNumber={2}
      moduleTitle="نشاط 6 — المقادير المركّبة"
      moduleSubtitle="سرعة، تدفق، كتلة حجمية"
      estimatedTime="11 دقيقة"
      brief={{
        tag: 'أنشطة — الكتاب ص 67',
        headline: 'لافتة 80 على الطريق!',
        emoji: '🚗',
        title: ACTIVITY_6.title,
        tone: 'sky',
        body: (
          <div className="space-y-2">
            <p>سيارة أمام لافتة، ومحطة تضخّ الماء، وثلاث قطع من معادن مختلفة: في كل موقف مقداران يجب أن نقارنهما أو نحوّلهما.</p>
            <p className="text-sm text-slate-600">ثلاثة أسئلة: نحسب، ونحوّل الوحدات، ثم نقارن.</p>
          </div>
        ),
        footer: <SourceTag source={ACTIVITY_6.source} />,
      }}
      steps={[
        {
          num: 1, title: 'هل ارتكب السائق مخالفة؟', subtitle: 'السؤال 1', done: q1,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={ACTIVITY_6.questions[0]} source={ACTIVITY_6.source} compact />
              <NumericQuestion
                prompt={<MathText>{'السرعة $25m/s$ بالكيلومتر في الساعة:'}</MathText>}
                expected={90}
                parse={parseDec}
                suffix="km/h"
                requires={['sura-mutawassita', 'tahwil-wahdat']}
                explainFor={(n) => (n === 6.944 || (n > 6.9 && n < 7)
                  ? <MathText>{'قسمت على 3,6: $25m/s$ تعني $25m$ في كل ثانية، أي في الساعة $25 \\times 3600 = 90\\,000m$ ، أي $90km/h$ .'}</MathText>
                  : <MathText>{ACTIVITY_6.answers.speed}</MathText>)}
                explain={<MathText>{ACTIVITY_6.answers.speed}</MathText>}
                onAnswered={() => setQ1a(true)}
              />
              {q1a && (
                <TapQuestion
                  prompt={<MathText>{'السرعة القصوى $80km/h$ : هل ارتكب السائق مخالفة؟'}</MathText>}
                  options={[M('نعم، لأنّ $90km/h > 80km/h$'), M('لا، لأنّ $25 < 80$')]}
                  correct={0}
                  cols={1}
                  requires={['sura-mutawassita', 'tahwil-wahdat']}
                  explain={<MathText>{'لا نقارن 25 و 80 مباشرة: الوحدتان مختلفتان. بالوحدة نفسها $90km/h > 80km/h$ : مخالفة.'}</MathText>}
                  onAnswered={() => setQ1(true)}
                />
              )}
              {q1 && <KnowledgeBrick id="miqdar-qisma" lead="السرعة المتوسطة مسافة مقسومة على مدة — مقدار مركّب:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'تدفق محطة المياه', subtitle: 'السؤال 2', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={ACTIVITY_6.questions[1]} source={ACTIVITY_6.source} compact />
              <NumericQuestion
                prompt={<MathText>{'التدفق بالمتر المكعب في الثانية:'}</MathText>}
                expected={2}
                parse={parseDec}
                suffix="m³/s"
                requires={['miqdar-qisma', 'tahwil-wahdat']}
                explainFor={(n) => (n === 2000
                  ? <MathText>{'حوّلت المقام وحده: $\\dfrac{7\\,200\\,000L}{3600s} = 2000L/s$ . ثم $2000L = 2m^3$ : التدفق $2m^3/s$ .'}</MathText>
                  : <MathText>{ACTIVITY_6.answers.flow}</MathText>)}
                explain={<MathText>{ACTIVITY_6.answers.flow}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="tahwil-murakkab" lead="حوّلنا اللتر إلى متر مكعب، والساعة إلى ثوان، كلًّا على حدة:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'أيّ المعادن أثقل؟', subtitle: 'السؤال 3', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={ACTIVITY_6.questions[2]} source={ACTIVITY_6.source} compact>
                <p className="text-[11px] text-slate-500" data-correction-note><MathText>{ACTIVITY_6.correctionNote}</MathText></p>
              </TextbookBox>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'كتلة $1cm^3$ من كل معدن (الكتلة الحجمية):'}</MathText></p>}
                rows={[
                  { id: 'gold', label: 'الذهب', options: [M('$19{,}3g/cm^3$'), M('$1{,}93g/cm^3$'), M('$0{,}052g/cm^3$')], correct: 0, correction: M(`${ACTIVITY_6.answers.gold} ( $1{,}93$ : تحويل خاطئ لـ $3dm^3$ إلى $30\\,000cm^3$ ؛ $0{,}052$ : قسمة الحجم على الكتلة.)`) },
                  { id: 'silver', label: 'الفضة', options: [M('$10{,}5g/cm^3$'), M('$0{,}095g/cm^3$'), M('$378g/cm^3$')], correct: 0, correction: M(`${ACTIVITY_6.answers.silver} ( $0{,}095$ : قسمة الحجم على الكتلة؛ $378$ هو الجداء $63 \\times 6$ ، لا حاصل القسمة.)`) },
                  { id: 'copper', label: 'النحاس', options: [M('$8{,}9g/cm^3$'), M('$11{,}9g/cm^3$'), M('$0{,}11g/cm^3$')], correct: 0, correction: M(`${ACTIVITY_6.answers.copper} ( $11{,}9$ يوافق $6cm^3$ ، الخطأ المطبعي؛ $0{,}11$ : قسمة الحجم على الكتلة.)`) },
                ]}
                requires={['miqdar-qisma', 'tahwil-murakkab']}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    <MathText>{allRight ? 'الكتلة الحجمية مقدار حاصل القسمة: الكتلة على الحجم، بالوحدة نفسها للمعادن الثلاثة.' : 'نقسم الكتلة على الحجم، بعد أن نكتبهما بالوحدتين نفسيهما ( $g$ و $cm^3$ ).'}</MathText>
                  </Feedback>
                )}
                onAnswered={() => setQ3a(true)}
              />
              {q3a && (
                <TapQuestion
                  prompt="أيّ المعادن الثلاثة هو الأثقل؟"
                  options={['الذهب', 'الفضة', 'النحاس']}
                  correct={0}
                  cols={3}
                  requires={['miqdar-qisma']}
                  explain={<MathText>{`${ACTIVITY_6.answers.heaviest} لا نقارن الكتل $57{,}9kg$ و $63g$ و $71{,}2g$ وحدها: الأحجام مختلفة.`}</MathText>}
                  onAnswered={() => setQ3(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'مقدار بدلالة مقدار آخر', subtitle: 'نقرأ السرعة بطريقة أخرى', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'السيارة تسير بسرعة ثابتة $25m/s$ . المسافة $d$ (بالمتر) التي تقطعها في $t$ ثانية هي:'}</MathText>}
                options={[M('$d = 25t$'), M('$d = \\dfrac{t}{25}$'), M('$d = 25 + t$')]}
                correct={0}
                cols={3}
                requires={['miqdar-qisma']}
                explain={<MathText>{'من $v = \\dfrac{d}{t}$ ينتج $d = v \\times t = 25t$ : في كل ثانية $25m$ ، والمسافة دالة خطية للمدة معاملها السرعة. مثلا في $4s$ : $d = 100m$ ، لا $\\dfrac{4}{25}m$ ولا $29m$ .'}</MathText>}
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
