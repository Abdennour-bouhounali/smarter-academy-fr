import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookExercise, MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';
import { EX } from '../content/exercises';

/**
 * Module 3 — أوظّف تعلّماتي : la طريقة (p. 23) lue ligne à ligne, puis
 * دوري الآن 2 (p. 23) et les exercices 11–14 (p. 26). La وضعية de
 * « أدمج تعلّماتي » (p. 28, la زربية) appartient à la leçon de synthèse
 * wadiya-idmajiya-judhur (extraction → destinations). Laboratoire : les
 * erreurs sont corrigées, jamais comptées comme preuve. LP : P1, P2.
 *
 * Les options des exercices `batch` sont des chaînes `$…$` (content/exercises.js
 * est du JS pur) : `withMath` les passe par MathText avant TextbookExercise,
 * qui rend options et corrections telles quelles.
 */
const withMath = (ex) => ({
  ...ex,
  question: {
    ...ex.question,
    rows: ex.question.rows.map((r) => ({
      ...r,
      options: r.options.map((o) => <MathText key={o}>{o}</MathText>),
      correction: r.correction ? <MathText>{r.correction}</MathText> : undefined,
    })),
  },
});

const NOW = withMath(EX['now-23-2']);
const E11 = withMath(EX['ex-11']);
const E12 = withMath(EX['ex-12']);
const E13 = withMath(EX['ex-13']);
const E14 = withMath(EX['ex-14']);
// La règle de la طريقة est posée par la brique `tariqat-hall-x2` (une seule fois).
const METHOD_LINES = { ...METHOD, rule: undefined };

export default function Module03Awazzif() {
  const [read, setRead] = useState(false);
  const [d, setD] = useState({});
  const done = (k) => () => setD((s) => ({ ...s, [k]: true }));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="أوظّف تعلّماتي — أحل معادلات"
      moduleSubtitle="الطريقة، ثم معادلات تؤول إلى الشكل x² = a"
      estimatedTime="13 دقيقة"
      objectives={['كيف أحلّ معادلة من الشكل $x^2 = a$ خطوة بخطوة؟', 'كيف أردّ معادلة أخرى إلى هذا الشكل؟', 'هل أجد حلّين، أو حلّا واحدًا، أو لا أجد شيئًا؟']}
      brief={{
        tag: 'طريقة — أوظّف تعلّماتي', title: <MathText>{METHOD.title}</MathText>, tone: 'amber',
        body: <p>نكشف الطريقة سطرًا سطرًا، ثم نحلّ بها معادلات أخرى. الخطأ هنا يُصحَّح ولا يُحتسب.</p>,
      }}
      steps={[
        {
          num: 1, title: 'الطريقة: حل معادلة من الشكل x² = a', subtitle: 'اكشف الحل سطرًا سطرًا', done: !!d.m,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="hulul-x2-a" variant="rappel" compact />
              <MethodSteps method={METHOD_LINES} onAllRevealed={() => setRead(true)} />
              {read && (
                <div className="space-y-3">
                  <KnowledgeBrick id="tariqat-hall-x2" lead="الأسطر الثلاثة تتبع نفس الطريقة:" />
                  <TapQuestion
                    prompt={<span>ما أول ما نفعله لحل معادلة من الشكل <MathText>{'$x^2 = a$'}</MathText>؟</span>}
                    options={[
                      'نحدد إشارة العدد $a$',
                      'نكتب مباشرة $x = \\sqrt{a}$',
                      'نقسم $a$ على 2',
                      'نكتب $x = a^2$',
                    ].map((o) => <MathText key={o}>{o}</MathText>)}
                    correct={0}
                    cols={2}
                    requires={['tariqat-hall-x2']}
                    explain={<span>إشارة <MathText>{'$a$'}</MathText> تقرّر عدد الحلول؛ وإذا كان <MathText>{'$a > 0$'}</MathText> نكتب <MathText>{'$x^2 = (\\sqrt{a})^2$'}</MathText> ونأخذ الحلّين <MathText>{'$\\sqrt{a}$'}</MathText> و <MathText>{'$-\\sqrt{a}$'}</MathText>.</span>}
                    onAnswered={done('m')}
                  />
                </div>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'دوري الآن — معادلات تؤول إلى الشكل x² = a', done: !!d.n,
          content: <TextbookExercise exercise={NOW} requires={['tariqat-hall-x2', 'muadala-daraja-ula']} onAnswered={done('n')} />,
        },
        {
          num: 3, title: 'معادلات من الشكل x² = a', done: !!d.e11,
          content: <TextbookExercise exercise={E11} requires={['tariqat-hall-x2']} onAnswered={done('e11')} />,
        },
        {
          num: 4, title: 'حلول بالجذور والكسور', done: !!d.e12,
          content: <TextbookExercise exercise={E12} requires={['tariqat-hall-x2']} onAnswered={done('e12')} />,
        },
        {
          num: 5, title: 'نردّها إلى الشكل x² = a', done: !!d.e13,
          content: <TextbookExercise exercise={E13} requires={['tariqat-hall-x2', 'muadala-daraja-ula']} onAnswered={done('e13')} />,
        },
        {
          num: 6, title: 'أنشر، ثم أحلّ', done: !!d.e14,
          content: <TextbookExercise exercise={E14} requires={['tariqat-hall-x2', 'muadala-daraja-ula']} onAnswered={done('e14')} />,
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
