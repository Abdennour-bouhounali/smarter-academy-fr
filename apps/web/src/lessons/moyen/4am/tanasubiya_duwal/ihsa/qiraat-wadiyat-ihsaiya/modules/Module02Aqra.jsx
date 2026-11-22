import { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag, TextbookBox, TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BarChart from '../components/BarChart';
import { POLLUTION, CARS } from '../content/textbook';
import { EX, EX19_CHART } from '../content/exercises';

/**
 * Module 2 — أقرأ مخططًا وأترجمه (stage: discovery) — TOUCH THE MATH. LP : P1.
 *   (1) l'encart « تلوث البيئة » (p. 91, doublon déclaré) puis, en prolongement de la PLATEFORME, le
 *       مخطط بالأعمدة des voitures comptées par le club vert (graduation de 50 en 50) : la brique
 *       « qiraat-mukhattat » et une barre lue ;
 *   (2) le total et un pourcentage (التواتر) ;
 *   (3) ex-19 (p. 101) : la brique « tarjama-jadwal », les deux barres qui réunissent deux chaînes
 *       (D = 700 ⇒ B = 550 ⇒ A = 400 — un casse-tête, PAS une coquille) ;
 *   (4) ex-19 : le total 2450 et les تواترات en 49ᵉ.
 * Rétrofit 2026-10-15 : les briques « qiraat-mukhattat » et « tarjama-jadwal » n'apparaissent qu'APRÈS la réponse (elles donnaient la lecture avant la question).
 * Les deux graphiques sont DESSINÉS ici (components/BarChart), la valeur d'une barre n'y est pas écrite.
 */
export default function Module02Aqra() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (...ids) => ids.every((id) => done[id]);

  return (
    <ContentModule
      objectives={["ماذا يعدّ المحور العمودي وما خطوة تدريجه؟", "كيف أترجم مخططًا بالأعمدة إلى جدول؟", "ماذا أفعل حين يجمع عمود واحد قناتين؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="أقرأ مخططًا وأترجمه"
      moduleSubtitle="من التدريج إلى الجدول"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'مدخل الباب — الكتاب ص 91', headline: 'كم سيارة تمرّ أمام مدرستنا؟', emoji: '🚗',
        title: 'قراءة مخطط بالأعمدة وترجمته إلى جدول', tone: 'violet',
        body: <p><MathText>{POLLUTION.text}</MathText></p>,
        footer: <SourceTag source={POLLUTION.source} />,
      }}
      steps={[
        {
          num: 1, title: 'سيارات أمام المدرسة', subtitle: 'نقرأ المحور والتدريج', done: all('peak'),
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={CARS.text} source={CARS.source} />
              <BarChart bars={CARS.bars} yMax={CARS.yMax} step={CARS.step} axis={CARS.axis} labelEvery={2} />
              <NumericQuestion
                prompt="كم سيارة مرّت بين 8h و 9h؟"
                expected={CARS.numbers.peak}
                explain="خطوة التدريج 50 (والأرقام مكتوبة كل 100): العمود يصل إلى 600 سيارة."
                onAnswered={mark('peak')}
              />
              {done.peak && <KnowledgeBrick id="qiraat-mukhattat" lead="ما فعلته لتقرأ العمود: ماذا يعدّ المحور العمودي؟ وكيف استعملت خطوة تدريجه؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'التكرار الكلي والتواتر', done: all('total', 'pct'),
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt="كم سيارة مرّت خلال الصبيحة كلها (من 7h إلى 12h)؟"
                expected={CARS.numbers.total}
                requires={['qiraat-mukhattat']}
                explain={<MathText>{'$450 + 600 + 250 + 200 + 300 = 1800$ سيارة.'}</MathText>}
                onAnswered={mark('total')}
              />
              <TapQuestion
                prompt="ما تواتر الساعة الأولى (7h–8h)؟"
                options={[
                  <MathText key="a">{'$\\dfrac{450}{1800} = 25\\%$'}</MathText>,
                  <MathText key="b">{'$45\\%$'}</MathText>,
                  <MathText key="c">{'$\\dfrac{450}{600} = 75\\%$'}</MathText>,
                  <MathText key="d">{'$\\dfrac{1}{5} = 20\\%$'}</MathText>,
                ]}
                correct={0}
                cols={2}
                requires={['qiraat-mukhattat']}
                explain={<MathText>{'التواتر هو التكرار مقسوما على التكرار الكلي: $\\dfrac{450}{1800} = \\dfrac{1}{4} = 25\\%$ . ربع سيارات الصبيحة مرّت في ساعة الدخول إلى المدرسة.'}</MathText>}
                onAnswered={mark('pct')}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'القنوات التلفزيونية', subtitle: 'التمرين 19 — عمودان يجمعان قناتين', done: all('ex19a'),
          content: (
            <div className="space-y-3">
              <BarChart bars={EX19_CHART.bars} yMax={EX19_CHART.yMax} step={EX19_CHART.step} axis={EX19_CHART.axis} labelEvery={EX19_CHART.labelEvery} height={300} />
              <TextbookExercise exercise={EX['ex19-a']} requires={['qiraat-mukhattat']} onAnswered={mark('ex19a')} />
              {done.ex19a && <KnowledgeBrick id="tarjama-jadwal" lead="ما فعلته: قرأت أسماء الأعمدة قبل ارتفاعاتها، فعمودان يحملان قناتين." />}
            </div>
          ),
        },
        {
          num: 4, title: 'أتمم الجدول', subtitle: 'التكرار الكلي والتواترات', done: all('ex19b', 'ex19c'),
          content: (
            <div className="space-y-3">
              {done.ex19a && <KnowledgeBrick id="tarjama-jadwal" variant="rappel" compact />}
              <TextbookExercise exercise={EX['ex19-b']} requires={['tarjama-jadwal']} onAnswered={mark('ex19b')} />
              <TextbookExercise exercise={EX['ex19-c']} requires={['tarjama-jadwal']} onAnswered={mark('ex19c')} />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
