import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION, REMARKS, LAB, LESSON_TITLES, analysisText } from '../content/textbook';
import { SITUATION_FIGURE } from '../content/figures';
import { BASE } from '../../_unit/unitMeta';

/**
 * Module 7 — la وضعية des deux coureurs (p. 148) lue dans les TROIS étapes du « تحليل الوضعية » du manuel (قراءة الوضعية
 * وفهمها · تحليل الوضعية واختيار استراتيجية حل مناسبة · تنفيذ استراتيجية الحل المختارة), chaque partie renvoyée au درس qui
 * l'enseigne (lire un point = درس 1 ; composantes = درس 2 ; milieu et distance = درس 3 ; prouver par le calcul = درس 4), comme
 * les synthèses des unités 2 à 11.
 *
 * LE WORKSPACE (un type, deux niveaux — `route-compare`, écrit pour cette leçon ; props dans content/textbook.js › LAB) :
 *   متقدم  la وضعية du manuel : l'élève parie, puis construit les deux parcours (trois centres, trois balises) ; 3π ≈ 9,42
 *          contre √13 + √5 + √17 ≈ 9,96 ;
 *   مبتدئ  un rallye au Sahara : un demi-cercle et une ligne droite contre deux lignes droites — cette fois la ligne brisée gagne.
 * Ouvert sur متقدم (ouvert sur مبتدئ par défaut depuis 2026-10-09) : c'est la وضعية du module. Les gestes de l'élève (`onTrial`) sont listés
 * au-dessus des questions d'exécution (`[data-activity-evidence]`). Aucune étape n'attend le lab (`onFinished`).
 * Déclarés en une ligne : les noms E, P, Q (la plateforme), « محيط نصف دائرة » = l'arc seul.
 * LP : P2 (lire, ranger, points sur l'axe), P3 (centres, longueurs, comparaison), P1 (tout mobiliser, conclure).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const TRUE_FALSE = ['صحيح', 'خاطئ'];

/** Un geste du lab (`onTrial`, logic/routeCompare.js › evidenceOf), en une ligne : arabe et îlots LTR. */
function trialLine(e) {
  if (!e || typeof e !== 'object') return null;
  const L = ({ children }) => <bdi dir="ltr" className="font-mono">{children}</bdi>;
  if (e.kind === 'bet') return <>توقّعت أنّ المسار ({e.bet}) أقصر</>;
  if (e.kind === 'ok' && e.piece === 'arc') return <>المسار ({e.route}): نصف دائرة مركزها <L>{e.centre}</L> ، طولها <L>{e.length} ≈ {e.approx}</L> ✓</>;
  if (e.kind === 'ok') return <>المسار ({e.route}): قطعة مركبتاها <L>{e.comp}</L> ، طولها <L>{e.length} ≈ {e.approx}</L> ✓</>;
  if (e.piece === 'arc') return <>المسار ({e.route}): مركز في <L>{e.at}</L> — القوس يُغلق عند <L>{e.end}</L> ✗</>;
  if (e.kind === 'skip') return <>المسار ({e.route}): اختصار إلى <L>{e.at}</L> ✗</>;
  return <>المسار ({e.route}): النقطة <L>{e.at}</L> ليست على المسار ✗</>;
}

function Evidence({ trials, title, empty, id }) {
  const shown = trials.map(trialLine).filter(Boolean).slice(-6);
  return (
    <div className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence={id}>
      {shown.length === 0 && <p className="text-slate-500" data-tried="false">{empty}</p>}
      {shown.length > 0 && (
        <div data-tried="true">
          <p>{title}</p>
          <ul className="ms-4 list-disc">{shown.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

/** Le renvoi d'une partie de la وضعية vers le درس qui l'enseigne. */
const BackLink = ({ lesson, what }) => (
  <p className="text-xs text-slate-500" data-back-link={lesson}>{what} — <Link to={`${BASE}/${lesson}`} className="text-blue-700 underline">{LESSON_TITLES[lesson]}</Link></p>
);

/** Une étape du « تحليل الوضعية » du manuel, au mot près. */
const Phase = ({ i }) => (
  <TextbookBox kind="remark" title={SITUATION.analysis[i].label} text={analysisText(SITUATION.analysis[i])} source={SITUATION.source} compact />
);

export default function Module07AlWadiya() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));
  const keep = (e) => { if (e && !e.tk) setTrials((list) => [...list, e]); };   // les événements du labo (checkpoint) ne sont pas des gestes

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="الوضعية وتحليلها" moduleSubtitle="عدّاءان ومساران في معلم: أيّهما أقصر؟" estimatedTime="22 دقيقة"
      objectives={['أيّ المسارين أقصر: ما تراه العين أم ما يقوله الحساب؟', 'أين مركز كل نصف دائرة، وما طول مساره؟', 'كيف نعرف طول مسار من قطع مستقيمة في معلم؟', 'كيف نقارن طولين متقاربين دون أن نخطئ في التدوير؟']}
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation type="route-compare" level="beginner" {...LAB.beginner} lead="رالي في الصحراء: مساران بين المخيّم والواحة. توقّع أيّهما أقصر، ثم ابنِ كل مسار." onTrial={keep} />
            ),
            advanced: () => (
              <Manipulation type="route-compare" level="advanced" {...LAB.advanced} lead="وضعية الكتاب: عدّاءان ومساران في معلم. توقّع أيّهما أقصر، ثم ابنِ كل مسار جزءا بجزء وراقب الساعتين." onTrial={keep} />
            ),
          }}
        />
      }
      steps={[
        { num: 1, title: 'قراءة الوضعية وفهمها', subtitle: 'المرحلة 1 من الكتاب: عمّ يتحدث النص؟', done: !!q[1],
          content: (
            <div className="space-y-3">
              <div className="space-y-2 rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-3" data-situation="addaan">
                <p className="font-bold">{SITUATION.title}</p>
                <p><MathText>{SITUATION.text}</MathText></p>
                <GeoFigure {...SITUATION_FIGURE} />
                <p className="text-sm"><MathText>{SITUATION.scale}</MathText></p>
                <p className="text-xs text-slate-500" data-names-note><MathText>{'الكتاب لا يسمّي النقطة $(2\\,;\\,0)$ ولا رأسي المسار (2) الأوسطين: سمّتها المنصّة E و P و Q، فقطع المسار (2) هي $[MP]$ و $[PQ]$ و $[QN]$ .'}</MathText> <MathText>{REMARKS.muhit}</MathText> <SourceTag source={SITUATION.names} /></p>
                <SourceTag source={SITUATION.source} />
              </div>
              <Phase i={0} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">رتّب المعطيات: احكم على كل عبارة.</p>}
                rows={[
                  { id: 'r1', label: 'النص يقارن طولي مسارين، لا سرعتي العدّاءين.', options: TRUE_FALSE, correct: 0, correction: <MathText>{REMARKS.mawdu}</MathText> },
                  { id: 'r2', label: 'للمسارين نفس نقطة البداية.', options: TRUE_FALSE, correct: 1, correction: <MathText>{REMARKS.tartib}</MathText> },
                  { id: 'r3', label: <MathText>{'$1\\,\\mathrm{cm}$ على المعلم يمثّل $1\\,\\mathrm{km}$ في الواقع.'}</MathText>, options: TRUE_FALSE, correct: 0, correction: 'هذا هو سلّم الشكل: الطول المحسوب على المعلم بالسنتيمتر هو نفسه الطول الحقيقي بالكيلومتر.' },
                ]}
                requires={['ihdathiyat-nuqta']}
                feedback={({ allRight }) => <MathText>{allRight ? `أحسنت. ${REMARKS.tartib}` : REMARKS.mawdu}</MathText>}
                onAnswered={mark(1)} />
            </div>
          ) },
        { num: 2, title: 'تحليل الوضعية: كيف أفسّر التمثيلين؟', subtitle: 'المرحلة 2 من الكتاب: ما الأدوات؟', done: !!q[2],
          content: (
            <div className="space-y-3">
              <Phase i={1} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر الأدوات: احكم على كل عبارة.</p>}
                rows={[
                  { id: 't1', label: 'المسار (1) مكوّن من ثلاثة أنصاف دوائر أطرافها على محور الفواصل.', options: TRUE_FALSE, correct: 0, correction: <MathText>{REMARKS.tafsir1}</MathText> },
                  { id: 't2', label: 'مركز كل نصف دائرة هو منتصف قطرها.', options: TRUE_FALSE, correct: 0, correction: <MathText>{REMARKS.markaz}</MathText> },
                  { id: 't3', label: <MathText>{'طول نصف دائرة نصف قطرها $r$ هو $2\\pi r$ .'}</MathText>, options: TRUE_FALSE, correct: 1, correction: <MathText>{`${REMARKS.muhitWhy} ${REMARKS.muhitRight}`}</MathText> },
                  { id: 't4', label: <MathText>{'طول القطعة $[MP]$ هو $|x_P - x_M| + |y_P - y_M|$ .'}</MathText>, options: TRUE_FALSE, correct: 1, correction: <MathText>{`${REMARKS.jamWhy} ${REMARKS.qita}`}</MathText> },
                ]}
                requires={['muntasaf-qita', 'tul-nisf-daira', 'masafa-nuqtatayn']}
                feedback={({ allRight }) => <MathText>{allRight ? `أحسنت. ${REMARKS.qita}` : REMARKS.markaz}</MathText>}
                onAnswered={mark(2)} />
              <BackLink lesson="muntasaf-masafa" what="إحداثيتا المنتصف والمسافة بين نقطتين" />
            </div>
          ) },
        { num: 3, title: 'تنفيذ: نقاط المسار (1) على محور الفواصل', subtitle: 'المرحلة 3 من الكتاب', done: !!q[3],
          content: (
            <div className="space-y-3">
              <Phase i={2} />
              <Evidence id="masar1" trials={trials} title="محاولاتك في المختبر:"
                empty="لم تبدأ بعد: في المختبر توقّع أولا، ثم ضع مركز كل نصف دائرة من المسار (1)." />
              <TapQuestion
                prompt="إحداثيات النقط التي يلتقي فيها المسار (1) بمحور الفواصل هي:"
                options={[
                  '$A(-2\\,;\\,0)$ ، $O(0\\,;\\,0)$ ، $E(2\\,;\\,0)$ ، $B(4\\,;\\,0)$',
                  '$(-1\\,;\\,0)$ ، $(1\\,;\\,0)$ ، $(3\\,;\\,0)$ فقط',
                  '$A(0\\,;\\,-2)$ ، $O(0\\,;\\,0)$ ، $E(0\\,;\\,2)$ ، $B(0\\,;\\,4)$',
                  '$(-1\\,;\\,1)$ ، $(1\\,;\\,-1)$ ، $(3\\,;\\,1)$',
                ].map(M)}
                correct={0} cols={1} requires={['ihdathiyat-nuqta']}
                explain={<MathText>{`${REMARKS.axe} النقط $(-1\\,;\\,0)$ و $(1\\,;\\,0)$ و $(3\\,;\\,0)$ مراكز أنصاف الدوائر (المسار لا يمرّ بها)، و $(0\\,;\\,-2)$ تبديل للفاصلة والترتيب، و $(-1\\,;\\,1)$ أعلى نصف الدائرة الأولى.`}</MathText>}
                onAnswered={mark(3)} />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : lire un point = murakkibata-shuaa (درس 1) ; les corrections des étapes 2–3 juste au-dessus (REMARKS.tafsir1, REMARKS.axe) viennent de décrire les deux parcours. */}
              {q[3] && <KnowledgeBrick id="qiraat-masarayn" variant="rappel" />}
              <BackLink lesson="murakkibata-shuaa" what="قراءة إحداثيتي نقطة في معلم" />
            </div>
          ) },
        { num: 4, title: 'تنفيذ: طول المسار (1)', subtitle: 'محيط ثلاثة أنصاف دوائر', done: !!q[4],
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر الجواب في كل سطر.</p>}
                rows={[
                  { id: 'c1', label: <MathText>{'مركز نصف الدائرة التي قطرها $[AO]$'}</MathText>, options: ['$I(-1\\,;\\,0)$', '$I(1\\,;\\,0)$', '$I(-2\\,;\\,0)$'].map(M), correct: 0, correction: <MathText>{'منتصف $[AO]$ : $\\left(\\dfrac{-2 + 0}{2}\\,;\\,\\dfrac{0 + 0}{2}\\right) = (-1\\,;\\,0)$ . نصف الفرق يعطي $(1\\,;\\,0)$ ، والمجموع دون قسمة يعطي $(-2\\,;\\,0)$ .'}</MathText> },
                  { id: 'c2', label: 'نصف قطر كل نصف دائرة', options: ['1', '2', '$\\pi$'].map(M), correct: 0, correction: <MathText>{'$AO = 2$ هو القطر، ونصف القطر $r = \\dfrac{2}{2} = 1$ .'}</MathText> },
                  { id: 'c3', label: 'طول المسار (1)', options: ['$3\\pi \\approx 9{,}42\\,\\mathrm{km}$', '$6\\pi \\approx 18{,}85\\,\\mathrm{km}$', '$6\\,\\mathrm{km}$'].map(M), correct: 0, correction: <MathText>{`${REMARKS.L1} $6\\pi$ هو محيط ثلاث دوائر كاملة، و $6\\,\\mathrm{km}$ طول القطعة $[AB]$ لا طول الأقواس.`}</MathText> },
                ]}
                requires={['muntasaf-qita', 'tul-nisf-daira']}
                feedback={({ allRight }) => <MathText>{allRight ? `أحسنت. ${REMARKS.centres}` : REMARKS.markaz}</MathText>}
                onAnswered={mark(4)} />
              {q[4] && (
                <>
                  <p className="text-xs text-slate-600" data-misconception-note="muhit"><MathText>{`خطأ شائع: ${REMARKS.muhitWrong} ${REMARKS.muhitWhy}`}</MathText></p>
                  {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : centre = milieu = ihdathiyata-muntasaf (درس 3), longueur πr = prérequis tul-nisf-daira ; les corrections de l’étape 2 (REMARKS.markaz) et de l’étape 4 viennent de le dire. */}
                  <KnowledgeBrick id="nisf-daira-markaz" variant="rappel" />
                </>
              )}
              <BackLink lesson="muntasaf-masafa" what="إحداثيتا منتصف قطعة" />
            </div>
          ) },
        { num: 5, title: 'تنفيذ: أطراف قطع المسار (2)', subtitle: 'نقرأ الإحداثيات على الشكل', done: !!q[5],
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="إحداثيات أطراف قطع المسار (2) هي:"
                options={[
                  '$M(-2\\,;\\,3)$ ، $P(1\\,;\\,1)$ ، $Q(3\\,;\\,2)$ ، $N(4\\,;\\,-2)$',
                  '$M(3\\,;\\,-2)$ ، $P(1\\,;\\,1)$ ، $Q(2\\,;\\,3)$ ، $N(-2\\,;\\,4)$',
                  '$M(-2\\,;\\,3)$ ، $P(1\\,;\\,1)$ ، $Q(3\\,;\\,2)$ ، $N(4\\,;\\,2)$',
                ].map(M)}
                correct={0} cols={1} requires={['ihdathiyat-nuqta']}
                explain={<MathText>{`${REMARKS.sommets} الفاصلة أولا ثم الترتيب؛ و N تحت محور الفواصل فترتيبها سالب.`}</MathText>}
                onAnswered={mark(5)} />
              <BackLink lesson="murakkibata-shuaa" what="قراءة إحداثيتي نقطة في معلم" />
            </div>
          ) },
        { num: 6, title: 'تنفيذ: طول المسار (2)', subtitle: 'المسافة بين طرفي كل قطعة', done: !!q[6],
          content: (
            <div className="space-y-3">
              <Evidence id="masar2" trials={trials} title="محاولاتك في المختبر:"
                empty="في المختبر: اسحب العدّاء الثاني من M إلى كل نقطة مراقبة، وراقب المركبتين والطول." />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">طول كل قطعة (القيمة المضبوطة):</p>}
                rows={[
                  { id: 'l1', label: '$MP$', options: ['$\\sqrt{13}$', '$5$', '$13$'].map(M), correct: 0, correction: <MathText>{REMARKS.MP}</MathText> },
                  { id: 'l2', label: '$PQ$', options: ['$\\sqrt{5}$', '$3$', '$5$'].map(M), correct: 0, correction: <MathText>{REMARKS.PQ}</MathText> },
                  { id: 'l3', label: '$QN$', options: ['$\\sqrt{17}$', '$5$', '$17$'].map(M), correct: 0, correction: <MathText>{REMARKS.QN}</MathText> },
                ].map((r) => ({ ...r, label: <MathText>{r.label}</MathText> }))}
                requires={['hisab-murakkibat', 'masafa-nuqtatayn']}
                feedback={({ allRight }) => <MathText>{allRight ? `أحسنت. ${REMARKS.L2}` : `${REMARKS.jamWhy} الجذر نأخذه في الأخير، بعد جمع المربعين.`}</MathText>}
                onAnswered={mark(6)} />
              {q[6] && (
                <>
                  <p className="text-xs text-slate-600" data-misconception-note="jam"><MathText>{`خطأ شائع: ${REMARKS.jamWrong} ${REMARKS.jamWhy}`}</MathText></p>
                  {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : la distance est masafa (درس 3) ; la correction de l’étape 2 et le retour de la question ci-dessus (REMARKS.qita, REMARKS.L2) viennent de l’énoncer. */}
                  <KnowledgeBrick id="tul-khatt-munkasir" variant="rappel" />
                </>
              )}
              <BackLink lesson="hisab-murakkibatay" what="حساب مركبتي شعاع" />
            </div>
          ) },
        { num: 7, title: 'المقارنة', subtitle: 'أيّ المسارين أقصر؟', done: !!q[7],
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="أقصر المسارين هو:"
                options={[
                  'المسار (1)، لأنّ $3\\pi \\approx 9{,}42 < \\sqrt{13} + \\sqrt{5} + \\sqrt{17} \\approx 9{,}96$',
                  'المسار (2)، لأنّ قطعه كلها مستقيمة',
                  'المسار (2)، لأنّ $\\sqrt{13 + 5 + 17} = \\sqrt{35} \\approx 5{,}92$',
                  'لا يمكن الحسم: الطولان متساويان تقريبا',
                ].map(M)}
                correct={0} cols={1} requires={['nisf-daira-markaz', 'tul-khatt-munkasir', 'qima-muqarraba']}
                explain={<MathText>{`${REMARKS.muqarana} مجموع الجذور ليس جذر المجموع ( $\\sqrt{13} + \\sqrt{5} + \\sqrt{17} \\neq \\sqrt{35}$ )، والقطع المستقيمة ليست دليلا: الحساب يفصل حتى لفرق $0{,}54$ .`}</MathText>}
                onAnswered={mark(7)} />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : comparer par valeurs approchées est le prérequis qima-muqarraba ; l’explication de la question ci-dessus (REMARKS.muqarana) vient de le faire (9,42 < 9,96). */}
              {q[7] && <KnowledgeBrick id="muqaranat-masarayn" variant="rappel" />}
            </div>
          ) },
        { num: 8, title: 'التحقّق وتفسير النتيجة', subtitle: 'آخر المرحلة 3: هل النتيجة ملائمة؟', done: !!q[8],
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">قبل أن نكتب الجواب، احكم على كل عبارة.</p>}
                rows={[
                  { id: 'v1', label: <MathText>{'$3{,}61 + 2{,}24 + 4{,}12 = 9{,}97$ ، إذن طول المسار (2) مدوّرا إلى $0{,}01$ هو $9{,}97$ .'}</MathText>, options: TRUE_FALSE, correct: 1, correction: <MathText>{REMARKS.tadwir}</MathText> },
                  { id: 'v2', label: 'لو جرى العدّاء الثاني مستقيما من M إلى N لكان مساره أقصر من المسار (1).', options: TRUE_FALSE, correct: 0, correction: <MathText>{REMARKS.ikhtisar}</MathText> },
                  { id: 'v3', label: <MathText>{'الفرق بين طولي المسارين حوالي $0{,}54\\,\\mathrm{km}$ .'}</MathText>, options: TRUE_FALSE, correct: 0, correction: <MathText>{REMARKS.natija}</MathText> },
                  { id: 'v4', label: <MathText>{'لو كان $1\\,\\mathrm{cm}$ يمثّل $2\\,\\mathrm{km}$ لتغيّر أقصر المسارين.'}</MathText>, options: TRUE_FALSE, correct: 1, correction: 'السلّم يضرب الطولين في نفس العدد: يتضاعف الطولان ويبقى المسار (1) هو الأقصر.' },
                ]}
                requires={['muqaranat-masarayn', 'qima-muqarraba']}
                feedback={({ allRight }) => <MathText>{allRight ? `أحسنت. ${REMARKS.natija}` : REMARKS.tadwir}</MathText>}
                onAnswered={mark(8)} />
              {q[8] && (
                <>
                  <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900"><MathText>{SITUATION.closing}</MathText></p>
                  {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : la démarche remet en ordre les trois étapes du « تحليل الوضعية » que l’élève vient de lire (encadrés des étapes 1–3) et l’arrondi final (REMARKS.tadwir, étape 8). */}
                  <KnowledgeBrick id="tariqat-wadiya" variant="rappel" />
                </>
              )}
              <BackLink lesson="ithbat-khawas-maalam" what="توظيف الحساب والإحداثيات للإجابة عن سؤال هندسي" />
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={7} variant="memo" />} />
  );
}
