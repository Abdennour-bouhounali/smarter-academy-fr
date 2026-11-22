import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import SpaceFigure from '../../../../../../common/components/SpaceFigure';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { MethodSteps, SourceTag, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD_DRAW, METHOD_POINT, METHOD_DISTANCE, NOW_167 } from '../content/textbook';
import { FIG_DRAW_1, FIG_DRAW_2, FIG_DRAW_3, FIG_POINT_GIVEN, FIG_POINT_SOLUTION, FIG_NOW167 } from '../content/figures';

/**
 * Module 3 — طرائق (p. 167) « تمثيل كرة » et « تمثيل نقطة من كرة أو من جلّة », puis le دوري الآن.
 * TOUCH THE MATH : 1) représenter une كرة de rayon 2,5 cm — les trois figures du manuel (le cercle, le « نطاق ملوّن », la
 * représentation : avant plein, arrière pointillé), la solution révélée ligne à ligne (brique tamthil-kura) ; 2) représenter A
 * sur la كرة et B dans la جلّة par des دوائر كبرى (la figure donnée, puis la solution — brique tamthil-nuqta) ; 3) la méthode
 * DÉCLARÉE de la plateforme : OM² = x² + y² + z² dans un repère de l'espace (ce que le lab lisait — brique masafa-maalam) ;
 * 4) دوري الآن : AOB équilatéral (60°), OI = √3 par Pythagore. LP : P3, P4.
 * Rétrofit 2026-10-15 (§4quater) : module sans labo ; la carte du haut ne dit aucun fait ; « أتوقّع القاعدة » inchangée ; les trois briques
 * qui NOMMENT la méthode viennent après la question de l'étape (`{qN && <KnowledgeBrick/>}`), sans `requires` sur elles.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Taraiq() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  return (
    <ContentModule
      objectives={["كيف نوحي بكرة على الورقة؟", "كيف نمثّل نقطة على كرة ونقطة داخل جلة؟", "كيف نحسب بعد نقطة عن المركز من إحداثياتها؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طرائق — تمثيل كرة ونقطة"
      moduleSubtitle="دائرة، شكل بيضوي، وخط متقطّع لما يختفي"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'طرائق — الكتاب ص 167', title: 'تمثيل كرة، وتمثيل نقطة منها', tone: 'emerald',
        body: <p>على الورقة لا نرى إلا دائرة: كيف نوحي بأنها كرة، وكيف نميّز نقطة على سطحها من نقطة داخلها؟ اقرأ الحل سطرا بسطر.</p>,
        footer: <SourceTag source={METHOD_DRAW.source} />,
      }}
      steps={[
        {
          num: 1, title: 'تمثيل كرة', subtitle: 'نصف قطرها 2,5 cm', done: q1,
          content: (
            <div className="space-y-3">
              {/* « أتوقّع القاعدة » : la طريقة du manuel et ses trois figures DISENT la méthode — l'élève l'écrit d'abord. */}
              <PredictRule id="tamthil-kura">
                <MethodSteps method={METHOD_DRAW} />
                <div className="grid gap-2 grid-cols-3" data-draw-figures>
                  {[FIG_DRAW_1, FIG_DRAW_2, FIG_DRAW_3].map((f, i) => (
                    <div key={f.ariaLabel} className="rounded-xl border border-slate-200 bg-white p-1 text-center">
                      <SpaceFigure {...f} />
                      <span className="text-xs font-bold text-slate-600">{`الشكل ${i + 1}`}</span>
                    </div>
                  ))}
                </div>
              </PredictRule>
              <TapQuestion
                prompt="في تمثيل الكرة، الجزء الخلفي من الشكل البيضوي (الدائرة الكبرى الأفقية) يُرسم:"
                options={[
                  'بخط متقطّع',
                  // la convention inversée (MISC-KURA-TAMTHIL)
                  'بخط مستمر، مثل الجزء الأمامي',
                  // l'oubli de la partie cachée
                  'لا يُرسم أبدا',
                ]}
                correct={0}
                cols={1}
                explain="الجزء الأمامي للشكل البيضوي يكون بخط مستمر والجزء الخلفي بخط متقطّع: هكذا نرى أن الدائرة الكبرى «تدور» خلف الكرة."
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="tamthil-kura" lead="الطريقة في سطرين:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'تمثيل نقطة من كرة أو من جلة', subtitle: 'تمرين وطريقة', done: q2,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_POINT_GIVEN} />
              {/* La figure donnée reste visible (c'est le problème) ; la طريقة et sa solution dessinée viennent après la prédiction. */}
              <PredictRule id="tamthil-nuqta">
                <MethodSteps method={METHOD_POINT} />
                <SpaceFigure {...FIG_POINT_SOLUTION} />
              </PredictRule>
              <TapQuestion
                prompt="لماذا لا يكفي الشكل المعطى (الدائرة والنقط A و O و B) لنعرف أن A على الكرة و B داخلها؟"
                options={[
                  'لأن الرسم المستوي لا يُظهر العمق: نحتاج دائرة كبرى تمر بالنقطة أو نصف قطر يحملها',
                  // l'apparence : B plus près du centre sur le dessin ne prouve rien (MISC-KURA-MASAFA)
                  'بل يكفي: النقطة الأقرب إلى O على الرسم هي التي داخل الجلة',
                  // le contour comme seul lieu des points de la كرة
                  'لأن نقط الكرة كلها على الدائرة الكفاف فقط',
                ]}
                correct={0}
                cols={1}
                explain={<MathText>{`${METHOD_POINT.rule} على الرسم المستوي تظهر A و B داخل الدائرة الكفاف معا؛ الدائرة الكبرى التي تمر بـ A تُظهر أنها على السطح.`}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="tamthil-nuqta" lead="دائرة كبرى لكل نقطة:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'موقع نقطة في معلم للفضاء', subtitle: 'طريقة من المنصّة', done: q3,
          content: (
            <div className="space-y-3">
              <PredictRule id="masafa-maalam"><TextbookBox kind="method" title={METHOD_DISTANCE.title} lines={METHOD_DISTANCE.lines} source={METHOD_DISTANCE.source} compact /></PredictRule>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'كرة مركزها O ونصف قطرها $7$ ، في معلم متعامد ومتجانس مبدؤه O:'}</MathText></p>}
                rows={[
                  // 4 + 9 + 36 = 49 ; « dedans » : chaque coordonnée < 7 (MISC-KURA-MASAFA)
                  { id: 'k', label: <MathText>{'$K(2\\,;\\,3\\,;\\,6)$'}</MathText>, options: ['على الكرة', 'داخل الجلة', 'خارج الجلة'], correct: 0, correction: <MathText>{'$OK^2 = 4 + 9 + 36 = 49 = 7^2$ : K على الكرة.'}</MathText> },
                  // 9 + 36 + 16 = 61 > 49 ; « sur » : 3 + 6 − 4 … ; « dedans » : coordonnées < 7
                  { id: 'l', label: <MathText>{'$L(3\\,;\\,-6\\,;\\,4)$'}</MathText>, options: ['على الكرة', 'داخل الجلة', 'خارج الجلة'], correct: 2, correction: <MathText>{'$OL^2 = 9 + 36 + 16 = 61 > 49$ : L خارج الجلة.'}</MathText> },
                  // 1 + 16 + 16 = 33 < 49 ; « dehors » : 1 + 4 + 4 = 9 > 7 (on additionne les coordonnées)
                  { id: 'n', label: <MathText>{'$N(1\\,;\\,4\\,;\\,4)$'}</MathText>, options: ['على الكرة', 'داخل الجلة', 'خارج الجلة'], correct: 1, correction: <MathText>{'$ON^2 = 1 + 16 + 16 = 33 < 49$ : N داخل الجلة وليست على الكرة.'}</MathText> },
                ]}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? <MathText>{'أحسنت: مربع البعد يُقارن بـ $R^2 = 49$ ، لا الإحداثيات وحدها.'}</MathText> : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="masafa-maalam" lead="ما كان المسبار يحسبه أمامك:" />}
            </div>
          ),
        },
        {
          num: 4, title: 'دوري الآن', subtitle: 'مستقيم يقطع كرة', done: q4,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={NOW_167.text} source={NOW_167.source} compact />
              <SpaceFigure {...FIG_NOW167} />
              <p className="text-xs text-slate-500"><MathText>{NOW_167.figureNote}</MathText></p>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">أكمل البرهان والحساب:</p>}
                rows={[
                  // isocèle seulement : on oublie AB = 2
                  { id: 'tri', label: 'المثلث AOB', options: ['متقايس الأضلاع', 'متساوي الساقين فقط', 'قائم في O'], correct: 0, correction: <MathText>{NOW_167.answer2}</MathText> },
                  { id: 'ang', label: <MathText>{'$\\widehat{AOB}$'}</MathText>, options: ['$60^\\circ$', '$90^\\circ$', '$30^\\circ$'].map(M), correct: 0, correction: 'في المثلث المتقايس الأضلاع كل زاوية قيسها 60 درجة.' },
                  // 2² + 1² = 5 : Pythagore à l'envers ; 2 − 1 = 1 : les longueurs soustraites
                  { id: 'oi', label: 'OI', options: ['$\\sqrt{3}\\,\\mathrm{cm}$', '$\\sqrt{5}\\,\\mathrm{cm}$', '$1\\,\\mathrm{cm}$'].map(M), correct: 0, correction: <MathText>{NOW_167.answer3}</MathText> },
                ]}
                requires={['tarif-kura', 'fithaghuras']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: A و B على الكرة يعطيان OA = OB = R، والمستوي (OAB) يعيدنا إلى الهندسة المستوية.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ4(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
