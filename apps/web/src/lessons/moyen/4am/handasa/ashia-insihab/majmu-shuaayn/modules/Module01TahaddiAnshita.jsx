import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { CHALLENGE, ACT3, ACT4, LAB } from '../content/textbook';
import { FIG_ACT3, FIG_ACT3_SOL, FIG_ACT4, FIG_ACT4_SOL } from '../content/figures';
import RiverFigure from '../components/RiverFigure';
import LabEvidence from '../components/LabEvidence';

/**
 * Module 1 — le تحدّ de la page d'unité (p. 127, DOUBLON DÉCLARÉ, l'entrée de la leçon), puis نشاط 3 et نشاط 4 (p. 129).
 *
 * LE WORKSPACE (`vector-sum`, un objectif, props dans content/textbook.js › LAB) :
 *   مبتدئ  `chasles`, la trottinette dans Alger (plateforme) : poser la queue du second trajet au bout du premier, lire la
 *          somme AC, l'enchaînement qui tourne (AC < AB + BC), le retour (AB + BA = 0) — c'est نشاط 3 et 4 « en vrai » ;
 *   متقدم  `parallelogram`, le تحدّ : tourner la vitesse du nageur jusqu'à ce que la diagonale s + c suive (AB). OUVERT PAR
 *          DÉFAUT (ouvert sur مبتدئ par défaut depuis 2026-10-09) : c'est le تحدّ que le module porte, et son titre nomme ses nombres.
 * Aucune étape n'attend le laboratoire (`onFinished`) : les essais de l'élève (`onTrial`) sont listés au-dessus des
 * questions ([data-activity-evidence]).
 * RÉTROFIT 2026-10-15 (§4quater) : aucune carte au-dessus ; le labo ouvre le module (niveau مبتدئ = la trottinette de la
 * plateforme, choisie comme ENTRÉE ; le تحدّ du livre reste le niveau متقدم et devient l'étape 2).
 * PROTOTYPE 2026-10-28 : les étapes 1 et 2 ne reposent plus leurs questions — elles sont posées PAR-DESSUS le labo (`vector-sum › chasles|parallelogram.cp`,
 * rubriques turn · zero · target · miss) et les étapes gardent la TRACE (événements `checkpoint-done`).
 *   1. POURQUOI le compteur lit plus que la distance droite (les propres essais de la trottinette)   (LP P2)
 *   2. le تحدّ : viser B ne suffit pas ; dans quel sens viser                              (LP P1)
 *   3. نشاط 3 : M′, M″, les trois parallélogrammes, M″ image de M par AC → brique tarkib-insihabayn  (LP P1, P2)
 *   4. نشاط 4 : AB + BC, D, AB + AD, AB + BA, AB et BA — les phrases du manuel sur 0 et les opposés  (LP P2)
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const isSwim = (e) => e?.mode === 'parallelogram';
const isRide = (e) => e?.mode === 'chasles';

export default function Module01TahaddiAnshita() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : leur trace (`checkpoint-done`, rubriques turn · zero · target · miss) fait avancer les étapes
  const [cpDone, setCpDone] = useState({});
  const keep = (e) => {
    if (!e) return;
    if (e.tk) { if (e.tk === 'checkpoint-done') setCpDone((d) => ({ ...d, [e.id]: true })); return; }
    setTrials((list) => [...list, e].slice(-30));
  };

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1} objectives={['هل يصل السبّاح إلى B إذا سبح نحوها مباشرة؟', 'أين ينتهي من انتقل بانسحابين متتابعين؟', 'ماذا يفعل مشوار العودة؟']} moduleTitle="التحدّ ونشاطا 3 و 4"
      moduleSubtitle="سبّاح وتيار، دراجة ومشواران: حركتان متتابعتان، حركة واحدة" estimatedTime="15 دقيقة"
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation type="vector-sum" level="beginner" {...LAB.beginner} lead="دراجة كهربائية في شوارع الجزائر تقطع مشوارين متتابعين." onTrial={keep} />
            ),
            advanced: () => (
              <Manipulation type="vector-sum" level="advanced" {...LAB.advanced} lead="تحدّ الوحدة: سبّاح سرعته 4 km/h يعبر نهرًا يجري تيّاره بسرعة 2 km/h." onTrial={keep} />
            ),
          }}
        />
      }
      steps={[
        { num: 1, title: 'لماذا يقرأ العدّاد أكثر؟', subtitle: 'عن مشاويرك بالدراجة', done: !!cpDone.turn,
          content: (
            <div className="space-y-3">
              <LabEvidence id="beginner-first" trials={trials} filter={isRide} title="مشاويرك بالدراجة (المستوى المبتدئ):"
                empty="لم تضع مشوارًا ثانيًا بعد: في المستوى المبتدئ اسحب بطاقة مشوار ثانٍ وضع ذيل سهمها حيث تقف الدراجة، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
              {cpDone.turn && (
                <p className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900" data-evidence="ride-answered">
                  <MathText>{'أجبتَ في المختبر: العدّاد يقيس المسافة المقطوعة على الطريق ($AB$ ثم $BC$) ، أمّا الانتقال الفعلي فهو الشعاع من المبدأ الأول إلى النهاية الأخيرة.'}</MathText>
                </p>
              )}
            </div>
          ) },
        { num: 2, title: 'التحدّ: نحو B مباشرة؟', subtitle: 'الماء يتحرّك أيضا', done: !!(cpDone.target && cpDone.miss),
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" title="تحدّ" text={CHALLENGE.text} source={CHALLENGE.source} compact>
                <RiverFigure label={CHALLENGE.ariaLabel} />
              </TextbookBox>
              <LabEvidence id="advanced" trials={trials} filter={isSwim} title="محاولاتك مع السبّاح (المستوى المتقدّم):"
                empty="لم ينطلق السبّاح بعد: في المستوى المتقدّم اسحب رأس السهم الأزرق ثم اتركه، وراقب أين يصل." />
              {cpDone.target && cpDone.miss && (
                <p className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900" data-evidence="swim-answered">
                  <MathText>{'أجبتَ في المختبر: لو سبح نحو B مباشرة لجرفه التيار، فيوجّه سرعته مائلة نحو أعلى النهر ليكون مجموع سرعتيه على (AB).'}</MathText>
                </p>
              )}
            </div>
          ) },
        { num: 3, title: 'نشاط 3: انسحابان متتابعان', subtitle: 'M ثم M′ ثم M″', done: !!q[2],
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" title={`نشاط 3 — ${ACT3.title}`} lines={ACT3.parts} source={ACT3.source} compact>
                <GeoFigure {...FIG_ACT3} />
              </TextbookBox>
              <TapQuestion
                prompt={<MathText>{'2) على المرصوفة، للانتقال من M إلى M′ صورتها بالانسحاب الذي شعاعه $\\overrightarrow{AB}$ :'}</MathText>}
                options={['مربع واحد نحو اليسار و 5 مربعات نحو الأسفل', 'مربع واحد نحو اليمين و 5 مربعات نحو الأعلى', 'مربعان نحو اليمين و 7 مربعات نحو الأسفل'].map(M)}
                correct={0} cols={1} requires={['surat-insihab']}
                explain={<MathText>{'من A إلى B على المرصوفة: مربع نحو اليسار و 5 نحو الأسفل، و $\\overrightarrow{MM\'} = \\overrightarrow{AB}$ : نفس الحركة من M. (الحركة المعاكسة هي $\\overrightarrow{BA}$ ، والأخيرة هي $\\overrightarrow{AC}$ .)'}</MathText>}
                onAnswered={mark('2a')} />
              {q['2a'] && (
                <>
                  <GeoFigure {...FIG_ACT3_SOL} />
                  <BatchChoiceQuestion
                    intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'3) M″ صورة M′ بالانسحاب الذي شعاعه $\\overrightarrow{BC}$ . أكمل:'}</MathText></p>}
                    rows={[
                      { id: 'q4a', label: <MathText>{'4) طبيعة الرباعي AMM′B'}</MathText>, options: ['متوازي أضلاع', 'مستطيل', 'رباعي كيفي'].map(M), correct: 0,
                        correction: <MathText>{'$\\overrightarrow{MM\'} = \\overrightarrow{AB}$ تعني أن AMM′B متوازي أضلاع؛ زواياه ليست قائمة على المرصوفة.'}</MathText> },
                      { id: 'q4b', label: <MathText>{'4) طبيعة الرباعي BM′M″C'}</MathText>, options: ['متوازي أضلاع', 'مستطيل', 'رباعي كيفي'].map(M), correct: 0,
                        correction: <MathText>{'$\\overrightarrow{M\'M\'\'} = \\overrightarrow{BC}$ تعني أن BM′M″C متوازي أضلاع.'}</MathText> },
                      { id: 'q5', label: <MathText>{'5) صورة M بالانسحاب الذي شعاعه $\\overrightarrow{AC}$'}</MathText>, options: ['M″', 'M′', 'C'].map(M), correct: 0,
                        correction: <MathText>{'على المرصوفة: من M إلى M″ مربعان نحو اليمين و 7 نحو الأسفل، مثل من A إلى C ؛ فـ ACM″M متوازي أضلاع و $\\overrightarrow{MM\'\'} = \\overrightarrow{AC}$ .'}</MathText> },
                      { id: 'q6', label: <MathText>{'6) الانسحاب الذي شعاعه $\\overrightarrow{AB}$ متبوعا بالانسحاب الذي شعاعه $\\overrightarrow{BC}$ هو الانسحاب الذي شعاعه'}</MathText>, options: ['$\\overrightarrow{AC}$', '$\\overrightarrow{CA}$', '$\\overrightarrow{BC}$'].map(M), correct: 0,
                        correction: <MathText>{'الانسحابان المتتابعان ينقلان M إلى M″ ، والانسحاب الذي شعاعه $\\overrightarrow{AC}$ ينقلها مباشرة إلى M″ ( $\\overrightarrow{CA}$ يعيدها في الاتجاه المعاكس).'}</MathText> },
                    ]}
                    requires={['surat-insihab', 'tasawi-mutawazi']}
                    feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{allRight ? 'كل الأسطر صحيحة: انظر إلى الأسهم الثلاثة المنطلقة من M على الشكل.' : 'راجع التصحيح تحت كل سطر.'}</MathText></Feedback>}
                    onAnswered={mark(2)} />
                </>
              )}
              {q[2] && (
                <>
                  {/* La remarque du livre ÉNONCE la règle (AB + BC = AC) : l'élève la prédit d'abord (أتوقّع القاعدة). */}
                  <PredictRule id="tarkib-insihabayn"><TextbookBox kind="remark" text={ACT3.after} source={ACT3.source} compact /></PredictRule>
                  <KnowledgeBrick id="tarkib-insihabayn" lead="7) «مجموع الشعاعين … و … يساوي الشعاع …»:" />
                </>
              )}
            </div>
          ) },
        { num: 4, title: 'نشاط 4: إنشاء ممثل لمجموع', subtitle: 'كيف نرسم المجموع؟', done: !!q[3],
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" title={`نشاط 4 — ${ACT4.title}`} lines={[ACT4.intro, ...ACT4.parts]} source={ACT4.source} compact>
                <GeoFigure {...FIG_ACT4} />
              </TextbookBox>
              <LabEvidence id="beginner" trials={trials} filter={isRide} title="مشاويرك بالدراجة (المستوى المبتدئ):"
                empty="افتح المستوى المبتدئ: ضع بطاقات المشوار الثاني على الخريطة، منها مشوار العودة." />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">أكمل كل سطر:</p>}
                rows={[
                  { id: 'r1', label: <MathText>{'1) ممثل للشعاع $\\overrightarrow{AB} + \\overrightarrow{BC}$'}</MathText>, options: ['$\\overrightarrow{AC}$', '$\\overrightarrow{CA}$', '$\\overrightarrow{BA}$'].map(M), correct: 0,
                    correction: <MathText>{'نهاية $\\overrightarrow{AB}$ هي مبدأ $\\overrightarrow{BC}$ : المجموع من A إلى C.'}</MathText> },
                  { id: 'r2', label: <MathText>{'2) D بحيث ABCD متوازي أضلاع هي صورة C بالانسحاب الذي شعاعه'}</MathText>, options: ['$\\overrightarrow{BA}$', '$\\overrightarrow{AB}$', '$\\overrightarrow{AC}$'].map(M), correct: 0,
                    correction: <MathText>{'ABCD متوازي أضلاع يعني $\\overrightarrow{AB} = \\overrightarrow{DC}$ ، أي $\\overrightarrow{CD} = \\overrightarrow{BA}$ .'}</MathText> },
                  { id: 'r3', label: <MathText>{'3) ممثل للشعاع $\\overrightarrow{AB} + \\overrightarrow{AD}$'}</MathText>, options: ['$\\overrightarrow{AC}$', '$\\overrightarrow{BD}$', '$\\overrightarrow{DB}$'].map(M), correct: 0,
                    correction: <MathText>{'$\\overrightarrow{AD} = \\overrightarrow{BC}$ ، فـ $\\overrightarrow{AB} + \\overrightarrow{AD} = \\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ : القطر الصادر من A ( [BD] هو القطر الآخر).'}</MathText> },
                  { id: 'r4', label: <MathText>{'4) ممثل للشعاع $\\overrightarrow{AB} + \\overrightarrow{BA}$'}</MathText>, options: ['$\\overrightarrow{AA}$', '$2\\overrightarrow{AB}$', '$\\overrightarrow{AC}$'].map(M), correct: 0,
                    correction: <MathText>{'من A إلى B ثم العودة إلى A : $\\overrightarrow{AB} + \\overrightarrow{BA} = \\overrightarrow{AA}$ ، ما فعلته الدراجة في مشوار العودة.'}</MathText> },
                  { id: 'r5', label: <MathText>{'5) الشعاعان $\\overrightarrow{AB}$ و $\\overrightarrow{BA}$ لهما'}</MathText>, options: ['نفس المنحى ونفس الطول واتجاهان متعاكسان', 'نفس المنحى ونفس الاتجاه ونفس الطول', 'منحيان مختلفان'].map(M), correct: 0,
                    correction: <MathText>{'كلاهما على المستقيم (AB) وطوله AB ، لكن الأول من A نحو B والثاني من B نحو A : ليسا متساويين.'}</MathText> },
                ]}
                requires={['tarkib-insihabayn', 'tasawi-mutawazi', 'anasir-shuaa']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{allRight ? 'المجموع واحد في الحالتين: $\\overrightarrow{AC}$ .' : 'راجع التصحيح تحت كل سطر.'}</MathText></Feedback>}
                onAnswered={mark(3)} />
              {q[3] && (
                <>
                  <GeoFigure {...FIG_ACT4_SOL} />
                  <TextbookBox kind="remark" lines={[ACT4.afterZero, ACT4.afterOpposite]} source={ACT4.source} compact />
                </>
              )}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />} />
  );
}
