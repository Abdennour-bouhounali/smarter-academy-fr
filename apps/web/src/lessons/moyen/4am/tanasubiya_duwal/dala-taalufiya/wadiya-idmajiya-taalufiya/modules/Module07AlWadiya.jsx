import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { useLabCheckpointSettings } from '../../../../../../common/manipulations/primitives/labCheckpointSettings';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { bidi } from '../../../../../../../utils/bidi';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION, PARTS, LESSON_TITLES, lessonPath, REMARKS, LAB } from '../content/textbook';
import { ParticipantsFigure, BusFigure, BeachVignette } from '../components/TripFigures';

/**
 * Rétrofit 2026-10-15 (§4quater, synthèse = modifications minimales) : plus de titre / `lead` de workspace (le contexte de chaque
 * niveau est le `lead` du labo) ; la boîte « تحليل الوضعية » (qui donne l'association partie ↔ درس) vient APRÈS la réponse de l'étape 2.
 * La carte de la situation reste au-dessus du labo : c'est l'énoncé de la وضعية (étapes 1–8), le labo ne sert qu'à l'étape 7.
 *
 * Module 7 — la وضعية de la PLATEFORME (le manuel n'a pas de « أدمج تعلّماتي » pour cette unité) :
 * رحلة إلى شاطئ تيبازة, lue dans les TROIS phases des synthèses du manuel (قراءة · تحليل · تنفيذ),
 * chaque partie RENVOYANT au درس qu'elle mobilise (lien sous l'étape) :
 *   étape 3  les participants : y = −x/2 + 20, puis l'intersection (32 ; 4)          درس 4
 *   étape 4  « الأمل » : f(32) = 10800, puis l'antécédent de 12000 = 40                درس 1
 *   étape 5  « النورس » par deux devis : g(x) = 200x + 5000                             درس 3
 *   étape 6  les deux droites, (20 ; 9000), « الأمل » pour 32 élèves                     درس 2 et 5
 *   étape 7  les trois tarifs de kayak sur le LABORATOIRE plan-compare                   درس 5
 *   étape 8  il reste 1200 DA ; deux kayaks à 550 DA : suffisant                         interprétation
 *
 * LE LABORATOIRE (plan-compare, RÉUTILISÉ de « حل مشكلات وترييض وضعيات بتوظيف الدالة التآلفية », monde
 * `rental` — props dans content/textbook.js › LAB, deux niveaux dans un ManipulationWorkspace,
 * ouvert sur مبتدئ par défaut depuis 2026-10-09 : ce sont les tarifs de la situation) :
 *   متقدم  les trois tarifs de kayak 150x, 50x + 300, 600 (comparer) ;
 *   مبتدئ  deux tarifs de vélo 50x + 200 et 100x (modéliser la carte, puis comparer).
 * Aucune étape n'attend `onFinished` (ce n'est pas une activité du manuel) ; les essais de l'élève
 * (`onTrial`) sont listés au-dessus de la question de l'étape 7 (`[data-activity-evidence]`).
 * Chaque brique est posée APRÈS la question qu'elle corrige. LP : P1 (mobiliser), P2 (analyser, choisir,
 * interpréter).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const BackTo = ({ lesson }) => (
  <p className="text-xs text-slate-500" data-back-to={lesson}>عند الحاجة أعود إلى <Link to={lessonPath(lesson)} className="text-blue-700 underline">{LESSON_TITLES[lesson]}</Link></p>
);

/**
 * Un essai rapporté par le laboratoire (`onTrial` de plan-compare) : `{ kind: 'x', x, cheapest }` (x heures,
 * indices des formules les moins chères) → « 5 ساعات: ب » ; `{ kind: 'mark', ok, x, y }` (une marque
 * acceptée là où deux coûts sont égaux) → « (3 ; 450) ». Les autres essais ne sont pas listés.
 */
const LETTERS = ['أ', 'ب', 'جـ'];
const val = (v) => String(v && typeof v === 'object' && 'n' in v && 'd' in v ? Number(v.n) / Number(v.d) : v).replace('.', ',');
function trialText(t) {
  if (!t || typeof t !== 'object') return null;
  if (t.kind === 'x' && t.x != null) {
    const best = Array.isArray(t.cheapest) ? t.cheapest.map((i) => LETTERS[i]).filter(Boolean).join(' و ') : '';
    return { s: best ? `${val(t.x)} ← ${best}` : val(t.x), dir: 'rtl' };
  }
  if (t.kind === 'mark' && t.ok && t.x != null && t.y != null) return { s: `(${val(t.x)} ; ${val(t.y)})`, dir: 'ltr' };
  return null;
}

function Evidence({ trials, empty }) {
  const shown = trials.map(trialText).filter(Boolean).slice(-6);
  return (
    <div className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence="advanced">
      {shown.length === 0 && <p className="text-slate-500" data-tried="false">{empty}</p>}
      {shown.length > 0 && (
        <p data-tried="true">ما جرّبته على المخبر (عدد الساعات ← الصيغة الأرخص، ونقط التساوي): {shown.map((e, i) => <bdi key={i} dir={e.dir} className="mx-1 font-mono">{e.s}</bdi>)}</p>
      )}
    </div>
  );
}

const PART_OPTIONS = [
  'جملة معادلتين بمجهولين: نقطة تقاطع مستقيمين',
  'صورة عدد بدالة تآلفية دستورها معطى',
  'تعيين دالة تآلفية من عددين وصورتيهما',
  'المفاضلة بين صيغ: نقارن التكاليف بحسب قيمة المتغيّر',
];

export default function Module07AlWadiya() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const mark = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const keep = (trial) => setTrials((list) => [...list, trial]);
  const [cps, setCps] = useState([]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : « quelle formule est la moins chère » (avant / après) y est posée ; coupées par l'enseignant, les questions d'origine reviennent
  const cpOn = useLabCheckpointSettings('plan-compare').enabled;
  const answered = (id) => cps.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const onCheckpoint = (e) => setCps((l) => [...l, e]);
  const kayakDone = cpOn ? answered('paint') : !!q['7a'] && !!q['7b'];

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="الوضعية وتحليلها" moduleSubtitle="رحلة إلى شاطئ تيبازة: كم تلميذا؟ أيّ حافلة؟ أيّ صيغة لكراء القوارب؟" estimatedTime="18 دقيقة"
      objectives={[
        'ما المطلوب في الرحلة؟ وما المتغيّر في كل جزء؟',
        'أيّ درس من الوحدة يحلّ كل جزء من الوضعية؟',
        'كيف نجد عددين مجهولين، ثمنا لا يُعطى دستوره، وأرخص صيغة؟',
        'هل يكفي المبلغ المتبقّي؟ وكيف نكتب الجواب؟',
      ]}
      brief={{
        tag: 'أدمج تعلّماتي — وضعية من المنصّة', headline: 'رحلة نهاية السنة إلى الشاطئ', emoji: '🏖️', visual: <BeachVignette />,
        title: 'عدد المشاركين، الناقل الأرخص، وصيغة الكراء الأنسب — بكل موارد الوحدة', tone: 'amber',
        body: (
          <div className="space-y-2" data-situation="tipaza">
            <p><MathText>{SITUATION.intro}</MathText></p>
            <p><MathText>{SITUATION.part1}</MathText></p>
            <p><MathText>{SITUATION.part2}</MathText></p>
            <ul className="ms-4 list-none space-y-1">
              <li><MathText>{SITUATION.part2a}</MathText></li>
              <li><MathText>{SITUATION.part2b}</MathText></li>
            </ul>
            <p className="font-semibold"><MathText>{SITUATION.part2q}</MathText></p>
            <p><MathText>{SITUATION.part3}</MathText></p>
            <ul className="ms-4 list-disc space-y-0.5">
              {SITUATION.plans.map((p) => <li key={p}><MathText>{p}</MathText></li>)}
            </ul>
            <p className="font-semibold"><MathText>{SITUATION.part3q}</MathText></p>
          </div>
        ),
        footer: <SourceTag source={SITUATION.source} />,
      }}
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="plan-compare"
                level="beginner"
                {...LAB.beginner}
                lead="في المستوى المبتدئ صيغتان لكراء دراجة: ننمذج صيغة الرسم الثابت أولا ثم نقارن."
                title={bidi('كراء دراجة: رسم ثابت 200 DA و 50 DA للساعة، أو 100 DA للساعة')}
                onCheckpoint={onCheckpoint}
              />
            ),
            advanced: () => (
              <Manipulation
                type="plan-compare"
                level="advanced"
                {...LAB.advanced}
                lead="المستوى المتقدّم هو صيغ الوضعية الثلاث لكراء قارب كاياك."
                title={bidi('كراء قارب كاياك: الصيغ الثلاث أ و ب و جـ')}
                onTrial={keep}
                onCheckpoint={onCheckpoint}
              />
            ),
          }}
        />
      }
      steps={[
        { num: 1, title: 'قراءة الوضعية وفهمها', subtitle: 'المرحلة 1: المهام والمتغيّرات', done: !!q[1],
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="ما المطلوب في هذه الوضعية؟"
                options={[
                  'عدد التلاميذ والمرافقين، الناقل الأرخص للقسم، الصيغة الأنسب لكراء قاربين 5 ساعات، ثم الحكم على كفاية المبلغ المتبقّي',
                  'ثمن مساهمة كل تلميذ فقط',
                  'عدد الساعات التي تتساوى عندها الصيغ الثلاث',
                  'عدد قطع النقود في صندوق القسم',
                ].map(M)}
                correct={0} cols={1} requires={['naw-dala']}
                explain={<MathText>{'الأسئلة: عدد المشاركين (الجزء 1)، «أيّ الناقلين يختار القسم؟» (الجزء 2)، ثم «ما الصيغة الأنسب؟ وهل يكفي المبلغ المتبقّي؟» (الجزء 3). مساهمة التلميذ معطاة (300 DA)، والصيغ الثلاث لا تتساوى في ساعة واحدة.'}</MathText>}
                onAnswered={mark(1)} />
              {q[1] && <TextbookBox kind="remark" title={SITUATION.analysis[0].label} text={SITUATION.analysis[0].text} source={SITUATION.source} compact />}
            </div>
          ) },
        { num: 2, title: 'تحليل الوضعية واختيار استراتيجية', subtitle: 'المرحلة 2: كل جزء يعيدنا إلى درس', done: !!q[2],
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">أيّ مورد من موارد الوحدة يحلّ كل جزء؟</p>}
                rows={[
                  { id: 'r1', label: <MathText>{PARTS[0].label}</MathText>, options: PART_OPTIONS.map(M), correct: 0, correction: <MathText>{`مجهولان ومعلومتان (عدد الأشخاص والمبلغ المجموع): جملة معادلتين، كل معادلة مستقيم — ${LESSON_TITLES[PARTS[0].lesson]}.`}</MathText> },
                  { id: 'r2', label: <MathText>{PARTS[1].label}</MathText>, options: PART_OPTIONS.map(M), correct: 1, correction: <MathText>{`دستور «الأمل» معطى (مبلغ ثابت ومبلغ عن كل تلميذ)، نحسب صورة عدد التلاميذ — ${LESSON_TITLES[PARTS[1].lesson]}.`}</MathText> },
                  { id: 'r3', label: <MathText>{PARTS[2].label}</MathText>, options: PART_OPTIONS.map(M), correct: 2, correction: <MathText>{`«النورس» لم يعطِ دستوره بل عرضين: عددان وصورتاهما — ${LESSON_TITLES[PARTS[2].lesson]}.`}</MathText> },
                  { id: 'r4', label: <MathText>{PARTS[3].label}</MathText>, options: PART_OPTIONS.map(M), correct: 3, correction: <MathText>{`نقارن الأثمان بحسب عدد التلاميذ أو الساعات، بنقطة تقاطع المستقيمات — ${LESSON_TITLES[PARTS[3].lesson]}.`}</MathText> },
                ]}
                requires={['taqatu-jumla', 'sura-taalufiya', 'tanasub-taghayyurat', 'mufadala']}
                feedback={({ allRight }) => <MathText>{allRight ? 'أحسنت: أربعة أجزاء، أربعة موارد من دروس الوحدة.' : 'الدستور المعطى نحسب به صورة، والعرضان عددان وصورتاهما، والمجهولان جملة، والاختيار مقارنة.'}</MathText>}
                onAnswered={mark(2)} />
              {q[2] && <TextbookBox kind="remark" title={SITUATION.analysis[1].label} text={SITUATION.analysis[1].text} source={SITUATION.source} compact />}
            </div>
          ) },
        { num: 3, title: 'تنفيذ: عدد المشاركين', subtitle: 'الجزء 1 — كيف نجد عددين من معلومتين؟', done: !!q['3a'] && !!q['3b'],
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'المعادلة $300x + 600y = 12000$ تُكتب على الشكل $y = ax + b$ :'}</MathText>}
                options={['$y = -\\dfrac{1}{2}x + 20$', '$y = \\dfrac{1}{2}x + 20$', '$y = -2x + 40$', '$y = -300x + 12000$'].map(M)}
                correct={0} cols={2} requires={['taqatu-jumla']}
                explain={<MathText>{`${REMARKS.eqY} الإشارة تتغيّر عند نقل $300x$ ، ونقسم كل الحدود على معامل $y$ أي 600.`}</MathText>}
                onAnswered={mark('3a')} />
              <TapQuestion
                prompt={<MathText>{'على الشكل: $(d_1)$ يمثّل $y = -x + 36$ و $(d_2)$ يمثّل $y = -\\dfrac{1}{2}x + 20$. نقطة تقاطعهما تعطي:'}</MathText>}
                above={<ParticipantsFigure />}
                options={[
                  '32 تلميذا و 4 مرافقين: $(32 ; 4)$',
                  '4 تلاميذ و 32 مرافقا: $(4 ; 32)$',
                  '36 تلميذا دون مرافقين: $(36 ; 0)$',
                  '40 تلميذا دون مرافقين: $(40 ; 0)$',
                ].map(M)}
                correct={0} cols={1} requires={['taqatu-jumla']}
                explain={<MathText>{`${REMARKS.jumla} النقطة $(36 ; 0)$ على $(d_1)$ وحده ($300 \\times 36 = 10800 \\neq 12000$)، و $(40 ; 0)$ على $(d_2)$ وحده ($40 + 0 \\neq 36$).`}</MathText>}
                onAnswered={mark('3b')} />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : c’est hall-bayani de « التفسير البياني لحل جملة معادلتين » (درس 4) ; les explications
                  des deux questions ci-dessus (REMARKS.eqY, REMARKS.jumla) viennent de la dire. */}
              {q['3a'] && q['3b'] && <KnowledgeBrick id="jumla-bayaniya" variant="rappel" />}
              <BackTo lesson="tafsir-bayani-jumla" />
            </div>
          ) },
        { num: 4, title: 'تنفيذ: ثمن «الأمل»', subtitle: 'الجزء 2 — دالة تآلفية: صورة عدد، والعدد الذي صورته معلومة', done: !!q['4a'] && !!q['4b'],
          content: (
            <div className="space-y-3">
              <p className="rounded-lg bg-amber-50 px-2 py-1 text-sm"><MathText>{'نرمز بـ $f(x)$ لثمن «الأمل» من أجل $x$ تلميذا: مبلغ ثابت يضاف إليه مبلغ عن كل تلميذ.'}</MathText></p>
              <NumericQuestion
                prompt={<span>ثمن الناقل «الأمل» للقسم (32 تلميذا)، بالدينار:</span>}
                expected={10800} display="10800"
                requires={['sura-taalufiya']}
                explain={<MathText>{REMARKS.amal}</MathText>}
                explainFor={(n) => <MathText>{n === 4800 ? `${REMARKS.nisyanB} ${REMARKS.amal}` : REMARKS.amal}</MathText>}
                onAnswered={mark('4a')} />
              <NumericQuestion
                prompt={<span>لو خُصّص المبلغ المجموع كله (12000 DA) للحافلة، ما أكبر عدد من التلاميذ يمكن أن ينقله «الأمل»؟</span>}
                expected={40} display="40"
                requires={['adad-sura']}
                explain={<MathText>{REMARKS.amalMax}</MathText>}
                explainFor={(n) => <MathText>{n === 80 ? `$\\dfrac{12000}{150} = 80$ ينسى المبلغ الثابت: نطرح 6000 أولا. ${REMARKS.amalMax}` : REMARKS.amalMax}</MathText>}
                onAnswered={mark('4b')} />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : « مبلغ ثابت + مبلغ عن كل وحدة » est dala-ujra / sura-taalufiya / sabiq-taalufiya (درس 1) ;
                  l’encadré en tête de l’étape et les explications (REMARKS.amal, amalMax) viennent de le dire. */}
              {q['4a'] && q['4b'] && <KnowledgeBrick id="taklifa-taalufiya" variant="rappel" />}
              <BackTo lesson="mafhum-taalufiya" />
            </div>
          ) },
        { num: 5, title: 'تنفيذ: دستور «النورس»', subtitle: 'الجزء 2 — الدستور غير معطى: ماذا نملك؟', done: !!q[5],
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'«النورس»: 9800 DA لـ 24 تلميذا و 12200 DA لـ 36 تلميذا. دستور ثمنه $g(x)$ هو:'}</MathText>}
                options={['$g(x) = 200x + 5000$', '$g(x) = 2400x + 5000$', '$g(x) = 200x + 9800$', '$g(x) = \\dfrac{1}{200}x + 5000$'].map(M)}
                correct={0} cols={2} requires={['tanasub-taghayyurat']}
                explain={<MathText>{`${REMARKS.nawras} تحقق: $200 \\times 36 + 5000 = 12200$. الفرق 2400 ثمن 12 تلميذا لا تلميذ واحد، و 9800 صورة 24 لا صورة 0.`}</MathText>}
                onAnswered={mark(5)} />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : c’est hisab-muamil-a puis hisab-b de « تعيين دالة تآلفية انطلاقًا من عددين وصورتيهما » (درس 3) ;
                  l’explication ci-dessus (REMARKS.nawras) vient de faire le calcul. */}
              {q[5] && <KnowledgeBrick id="min-thunaiyatayn" variant="rappel" />}
              <BackTo lesson="tanasub-taghayyurat" />
            </div>
          ) },
        { num: 6, title: 'تنفيذ: أيّ الناقلين؟', subtitle: 'أين يلتقي مستقيما الثمنين؟', done: !!q['6a'] && !!q['6b'],
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="على الشكل، مستقيما ثمني الناقلين يتقاطعان في النقطة:"
                above={<BusFigure />}
                options={['$(20 ; 9000)$', '$(9000 ; 20)$', '$(0 ; 6000)$', '$(32 ; 10800)$'].map(M)}
                correct={0} cols={2} requires={['taklifa-taalufiya', 'min-thunaiyatayn', 'tartib-mabda']}
                explain={<MathText>{`${REMARKS.cross} النقطة $(0 ; 6000)$ على مستقيم «الأمل» وحده (ترتيبه عند المبدأ)، و $(32 ; 10800)$ كذلك ($g(32) = 11400$).`}</MathText>}
                onAnswered={mark('6a')} />
              <TapQuestion
                prompt="إذن، للقسم (32 تلميذا) يختار:"
                options={[
                  '«الأمل»: بعد 20 تلميذا يصبح مستقيمه تحت مستقيم «النورس»',
                  '«النورس»: مبلغه الثابت أصغر، فهو الأرخص دائما',
                  '«النورس»: مستقيمه يقطع محور التراتيب تحت مستقيم «الأمل»',
                  'أيّا منهما: الثمن نفسه لأنّ المستقيمين يتقاطعان',
                ].map(M)}
                correct={0} cols={1} requires={['mufadala', 'taklifa-taalufiya', 'min-thunaiyatayn']}
                explain={<MathText>{`${REMARKS.choice} ${REMARKS.afdalWhy}`}</MathText>}
                onAnswered={mark('6b')} />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : c’est tasawi-taqatu + sigha-afdal de « حل مشكلات وترييض وضعيات » (درس 5) ; les explications
                  ci-dessus (REMARKS.cross, REMARKS.choice) viennent de la dire. */}
              {q['6a'] && q['6b'] && <KnowledgeBrick id="ikhtiyar-sigha" variant="rappel" />}
              <BackTo lesson="tamthil-bayani-taalufi" />
              <BackTo lesson="tarrid-taalufi" />
            </div>
          ) },
        { num: 7, title: 'تنفيذ: صيغة كراء الكاياك', subtitle: 'الجزء 3 — على المخبر: ثلاث صيغ', done: kayakDone,
          content: (
            <div className="space-y-3">
              <Evidence trials={trials} empty="لم تجرّب بعد على المخبر: افتح المستوى المتقدّم وحرّك عدد الساعات، ثم ابحث عن نقطتي التقاطع." />
              {cpOn ? (
                <p data-checkpoint-trace="paint" data-tried={kayakDone ? 'true' : 'false'}
                  className={`rounded-xl border-2 px-3 py-2 text-sm ${kayakDone ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                  {kayakDone
                    ? <MathText>{'أجبتَ في المخبر: الصيغة الأرخص تتغيّر عند نقطتي التقاطع، فهي تتعلّق بعدد الساعات.'}</MathText>
                    : 'ضع العلامة على نقطتي التقاطع ولوّن محور الساعات، وأجب عن الأسئلة التي تظهر فوق المخبر.'}
                </p>
              ) : (
                <>
                <TapQuestion
                  prompt="القسم يبقى 5 ساعات على الشاطئ. الصيغة الأرخص لقارب واحد هي:"
                  options={[
                    'الصيغة ب: $50 \\times 5 + 300 = 550\\,\\mathrm{DA}$',
                    'الصيغة أ: لا رسم ثابت فيها، فهي الأرخص',
                    'الصيغة جـ: 600 DA',
                    'الصيغة ب: $(50 + 300) \\times 5 = 1750\\,\\mathrm{DA}$',
                  ].map(M)}
                  correct={0} cols={1} requires={['mufadala', 'ikhtiyar-sigha']}
                  explain={<MathText>{`${REMARKS.kayak5} الرسم الثابت 300 DA يُدفع مرّة واحدة، لا عن كل ساعة.`}</MathText>}
                  onAnswered={mark('7a')} />
                <BatchChoiceQuestion
                  intro={<p className="text-sm font-semibold text-slate-700">بحسب مدّة الكراء، ما الصيغة الأرخص؟</p>}
                  rows={[
                    { id: 'h1', label: 'أقل من 3 ساعات', options: ['الصيغة أ', 'الصيغة ب', 'الصيغة جـ'], correct: 0, correction: <MathText>{'مثلا لساعتين: أ $300$ ، ب $400$ ، جـ $600$.'}</MathText> },
                    { id: 'h2', label: 'بين 3 و 6 ساعات', options: ['الصيغة أ', 'الصيغة ب', 'الصيغة جـ'], correct: 1, correction: <MathText>{'مثلا لـ 4 ساعات: أ $600$ ، ب $500$ ، جـ $600$.'}</MathText> },
                    { id: 'h3', label: 'أكثر من 6 ساعات', options: ['الصيغة أ', 'الصيغة ب', 'الصيغة جـ'], correct: 2, correction: <MathText>{'مثلا لـ 7 ساعات: أ $1050$ ، ب $650$ ، جـ $600$.'}</MathText> },
                  ]}
                  requires={['ikhtiyar-sigha']}
                  feedback={() => <MathText>{REMARKS.kayakRanges}</MathText>}
                  onAnswered={mark('7b')} />
                </>
              )}
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : « la moins chère = la droite la plus basse » est sigha-afdal (درس 5), et le retour de la
                  question ci-dessus (REMARKS.kayakRanges) vient de donner les trois plages. */}
              {kayakDone && <KnowledgeBrick id="thalath-sigh" variant="rappel" />}
              <BackTo lesson="tarrid-taalufi" />
            </div>
          ) },
        { num: 8, title: 'تفسير النتيجة', subtitle: 'المرحلة 3: هل يكفي المبلغ المتبقّي؟', done: !!q['8a'] && !!q['8b'],
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<span>ما يتبقّى من المبلغ المجموع (12000 DA) بعد دفع ثمن «الأمل»، بالدينار:</span>}
                expected={1200} display="1200"
                requires={['taklifa-taalufiya']}
                explain={<MathText>{'$12000 - 10800 = 1200\\,\\mathrm{DA}$.'}</MathText>}
                onAnswered={mark('8a')} />
              <TapQuestion
                prompt="هل يكفي هذا المبلغ لكراء قاربين 5 ساعات؟"
                options={[
                  'نعم: بالصيغة ب يكلّف القاربان $2 \\times 550 = 1100\\,\\mathrm{DA}$ ، ويبقى 100 DA',
                  'لا: يكلّف القاربان $2 \\times 750 = 1500\\,\\mathrm{DA}$',
                  'لا: المبلغ المتبقّي لا يكفي إلا لقارب واحد',
                ].map(M)}
                correct={0} cols={1} requires={['thalath-sigh']}
                explain={<MathText>{`${REMARKS.rest} المبلغ 1500 DA هو ثمن الصيغة أ، وهي ليست الأنسب لـ 5 ساعات.`}</MathText>}
                onAnswered={mark('8b')} />
              {q['8a'] && q['8b'] && (
                <>
                  {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : interpréter dans le contexte est la dernière étape de khutuwat-mufadala (درس 5) ;
                      l’explication ci-dessus (REMARKS.rest) vient de conclure en dinars. */}
                  <KnowledgeBrick id="tafsir-natija" variant="rappel" />
                  <TextbookBox kind="remark" title={SITUATION.analysis[2].label} text={SITUATION.analysis[2].text} source={SITUATION.source} compact />
                  {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : la démarche ne fait que remettre en ordre les trois encadrés « تحليل الوضعية »
                      que l’élève vient de lire (étapes 1, 2 et celui juste au-dessus). */}
                  <KnowledgeBrick id="tariqat-wadiya" variant="rappel" />
                  <TextbookBox kind="remark" text={REMARKS.notTheTest} compact />
                </>
              )}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={7} variant="memo" />} />
  );
}
