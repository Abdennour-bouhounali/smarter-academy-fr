import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { bidi } from '../../../../../../../utils/bidi';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION, OTHER_CABLE, FAMILY, REMARKS, LAB } from '../content/textbook';
import { CableCarFigure, CableCarVignette } from '../components/CableCarFigure';

/**
 * Module 7 — la وضعية (p. 74) : le مصعد هوائي, lu dans les TROIS étapes du « تحليل الوضعية »
 * du manuel (قراءة الوضعية وفهمها · تحليل الوضعية واختيار استراتيجية حل مناسبة · تنفيذ
 * استراتيجية الحل المختارة), comme les synthèses des unités 2 à 5.
 *
 * LE LABORATOIRE (origin-line, RÉUTILISÉ de « التمثيل البياني لدالة خطية », mode `read`, monde
 * `budget` — props dans content/textbook.js › LAB, deux niveaux dans un ManipulationWorkspace,
 * ouvert sur مبتدئ par défaut depuis 2026-10-09 : c'est la famille du manuel) :
 *   متقدم  la famille du manuel : C(x) = 3,8x contre la ligne du budget 2000 DA — l'intersection
 *          tombe entre deux nœuds (≈ 526,3), l'élève lit puis décide l'arrondi.
 *   مبتدئ  une autre famille (2 adultes, 2 enfants à −50 %) : C(x) = 3x contre 1500 DA, lue sur
 *          un nœud (500 DA) ; elle sert l'étape 7.
 * Les lectures de l'élève (`onTrial`) sont listées au-dessus de la question (`[data-activity-evidence]`).
 *
 * L'exécution se fait sur les nombres de la PLATEFORME (un autre téléphérique 300 m → 800 m,
 * 1200 m ; une autre famille), pour que les réponses du manuel restent celles de « وضعية الاختبار النهائي ».
 * Chaque brique est posée APRÈS la question qu'elle corrige (sa leçon contient la réponse).
 * LP : P2 (modéliser), P3 (stratégie et interprétation).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const TRUE_FALSE = ['صحيح', 'خاطئ'];

/** Une lecture rapportée par le laboratoire (`onTrial`), quelle que soit sa forme. */
function trialText(t) {
  if (t == null) return null;
  if (typeof t === 'number' || typeof t === 'string') return String(t).replace('.', ',');
  const x = t.x ?? t.value ?? t.probe;
  const y = t.y ?? t.image ?? t.cost;
  const f = (v) => (v && typeof v === 'object' && 'n' in v && 'd' in v ? String(Number(v.n) / Number(v.d)) : String(v)).replace('.', ',');
  if (x != null && y != null) return `(${f(x)} ; ${f(y)})`;
  if (x != null) return f(x);
  return null;
}

function Evidence({ trials, level, empty }) {
  const shown = trials.map(trialText).filter(Boolean).slice(-6);
  return (
    <div className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence={level}>
      {shown.length === 0 && <p className="text-slate-500" data-tried="false">{empty}</p>}
      {shown.length > 0 && (
        <p data-tried="true">قراءاتك على المستقيم (السعر ؛ التكلفة): {shown.map((s, i) => <bdi key={i} dir="ltr" className="mx-1 font-mono">{s}</bdi>)}</p>
      )}
    </div>
  );
}

export default function Module07AlWadiya() {
  const [, setBigTrials] = useState([]);
  const [smallTrials, setSmallTrials] = useState([]);
  const [q, setQ] = useState({});
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));
  const keep = (set) => (trial) => set((list) => [...list, trial]);
  const { altA, altB, AH } = OTHER_CABLE.numbers;

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="تحليل الوضعية النهائية للاختبار" moduleSubtitle="المصعد الهوائي: كم يدوم الصعود، وما أكبر سعر للتذكرة؟" estimatedTime="16 دقيقة"
      objectives={['ما المطلوب في الوضعية، وما المتغيّر؟', 'بأيّ أدوات نحسب طول الحبل ثم المدة؟', 'كيف نعبّر عن التكلفة وما أكبر سعر تسمح به الميزانية؟']}
      brief={{
        tag: 'أدمج تعلّماتي — الكتاب ص 74', headline: 'رحلة عائلية في المصعد الهوائي', emoji: '🚡', visual: <CableCarVignette />,
        title: 'المدة الزمنية لصعود واحد، ثم أكبر سعر للتذكرة في حدود 2000 DA', tone: 'amber',
        body: (
          <div className="space-y-2">
            <p><MathText>{SITUATION.q1}</MathText></p>
            <p><MathText>{SITUATION.q2}</MathText></p>
            <ul className="ms-4 list-none space-y-1">
              <li><MathText>{SITUATION.q2a}</MathText></li>
              <li><MathText>{SITUATION.q2b}</MathText></li>
            </ul>
            <CableCarFigure />
            <p className="text-xs text-slate-500"><MathText>{SITUATION.figure}</MathText></p>
          </div>
        ),
        footer: <SourceTag source={SITUATION.source} />,
      }}
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          lead="المستوى المتقدّم هو عائلة الكتاب: مستقيم التكلفة وخط الميزانية 2000 DA. في المستوى المبتدئ عائلة أخرى بتكلفة 3x وميزانية 1500 DA."
          levels={{
            beginner: () => (
              <Manipulation
                type="origin-line"
                level="beginner"
                {...LAB.beginner}
                title={bidi('عائلة أخرى: التكلفة 3x والميزانية 1500 DA')}
                onTrial={keep(setSmallTrials)}
              />
            ),
            advanced: () => (
              <Manipulation
                type="origin-line"
                level="advanced"
                {...LAB.advanced}
                title={bidi('عائلة الكتاب: التكلفة 3,8x والميزانية 2000 DA')}
                onTrial={keep(setBigTrials)}
              />
            ),
          }}
        />
      }
      steps={[
        { num: 1, title: 'قراءة الوضعية وفهمها', subtitle: 'المرحلة 1 من الكتاب: المهمّتان والمتغيّر', done: !!q[1],
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'ما المطلوب في هذه الوضعية، وما هو المتغيّر $x$؟'}</MathText>}
                options={[
                  'مدة صعود واحد بالدقائق والثواني، ثم أكبر سعر $x$ لتذكرة البالغ تسمح به ميزانية 2000 DA',
                  'طول الحبل فقط، و $x$ هو هذا الطول',
                  'عدد أفراد العائلة، و $x$ هو عدد الأطفال',
                  'سعر تذكرة الطفل، و $x$ هو التخفيض 40%',
                ].map(M)}
                correct={0} cols={1} requires={['sura-adad']}
                explain={<MathText>{'السؤالان: «ما هي المدة الزمنية…» و «ما هي أكبر قيمة لسعر التذكرة…». و $x$ سعر تذكرة البالغ: التكلفة تُعطى بدلالته. أمّا طول الحبل فوسيلة لحساب المدة، والعائلة (بالغان و 3 أطفال) معطاة.'}</MathText>}
                onAnswered={mark(1)} />
              {q[1] && <TextbookBox kind="remark" title={SITUATION.analysis[0].label} text={SITUATION.analysis[0].text} source={SITUATION.source} compact />}
            </div>
          ) },
        { num: 2, title: 'تحليل الوضعية واختيار استراتيجية', subtitle: 'المرحلة 2 من الكتاب: ماذا نحتاج لحساب المدة؟', done: !!q[2],
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">على شكل الكتاب: احكم على كل عبارة.</p>}
                rows={[
                  { id: 's1', label: <MathText>{'المثلث $AHB$ قائم في $H$'}</MathText>, options: TRUE_FALSE, correct: 0, correction: <MathText>{'$H$ المسقط العمودي لـ $B$ على مستوى $A$ : الزاوية في $H$ قائمة.'}</MathText> },
                  { id: 's2', label: <MathText>{'$BH = 1400\\,\\mathrm{m}$'}</MathText>, options: TRUE_FALSE, correct: 1, correction: <MathText>{'$BH$ الفرق بين الارتفاعين: $BH = 1400 - 900$ ، لأنّ $A$ نفسها على ارتفاع 900m.'}</MathText> },
                  { id: 's3', label: <MathText>{'$AB = AH + BH$'}</MathText>, options: TRUE_FALSE, correct: 1, correction: <MathText>{REMARKS.sumWhy}</MathText> },
                  { id: 's4', label: <MathText>{'$AB^2 = AH^2 + BH^2$'}</MathText>, options: TRUE_FALSE, correct: 0, correction: <MathText>{'مبرهنة فيثاغورس في المثلث $AHB$ القائم في $H$ : الوتر هو الحبل نفسه.'}</MathText> },
                  { id: 's5', label: <MathText>{'مدة الصعود بالثواني هي $\\dfrac{AB}{5{,}5}$ ( $AB$ بالمتر)'}</MathText>, options: TRUE_FALSE, correct: 0, correction: <MathText>{'السرعة $v = \\dfrac{d}{t}$ ، فالمدة $t = \\dfrac{d}{v}$ : متر على متر في الثانية يعطي ثواني.'}</MathText> },
                ]}
                requires={['fithaghuras', 'maqadir-murakkaba']}
                feedback={({ allRight }) => <MathText>{allRight ? 'أحسنت. ماذا يمثّل الحبل في المثلث $AHB$ ، وكيف نصل منه إلى المدة؟' : 'الحبل وتر المثلث القائم $AHB$ ، وضلعه $BH$ هو الفرق بين الارتفاعين.'}</MathText>}
                onAnswered={mark(2)} />
              {q[2] && <TextbookBox kind="remark" title={SITUATION.analysis[1].label} text={SITUATION.analysis[1].text} source={SITUATION.source} compact />}
            </div>
          ) },
        { num: 3, title: 'تنفيذ: طول الحبل', subtitle: 'المرحلة 3 — على مصعد هوائي آخر', done: !!q[3],
          content: (
            <div className="space-y-3">
              <p className="rounded-lg bg-amber-50 px-2 py-1 text-sm"><MathText>{OTHER_CABLE.text}</MathText> <SourceTag source={OTHER_CABLE.source} /></p>
              <CableCarFigure altA={altA} altB={altB} AH={AH} label="شكل المصعد الهوائي الآخر" />
              <NumericQuestion
                prompt={<span>ما طول الحبل <MathText>{'$AB$'}</MathText> بالمتر في هذا المصعد؟</span>}
                expected={1300} display="1300"
                requires={['fithaghuras']}
                explain={<MathText>{REMARKS.pythagore}</MathText>}
                explainFor={(n) => <MathText>{n === 1700 ? `${REMARKS.sumWhy} ${REMARKS.pythagore}` : REMARKS.pythagore}</MathText>}
                onAnswered={mark(3)} />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : Pythagore est un prérequis (3AM, `fithaghuras`) ; la ligne s4 de l’étape 2
                  ($AB^2 = AH^2 + BH^2$) et l’explication de la question ci-dessus (REMARKS.pythagore) viennent de l’énoncer. */}
              {q[3] && <KnowledgeBrick id="masafa-fithaghuras" variant="rappel" />}
            </div>
          ) },
        { num: 4, title: 'تنفيذ: مدة الصعود', subtitle: 'كم تدوم رحلة الصعود؟', done: !!q[4],
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>المصعد الآخر يسير بسرعة <bdi dir="ltr">5m/s</bdi> على حبل طوله <bdi dir="ltr">1300m</bdi>. مدة صعود واحد هي:</span>}
                options={[
                  '$260\\,\\mathrm{s}$ ، أي 4 دقائق و 20 ثانية',
                  '$6500\\,\\mathrm{s}$ ، لأنّ $1300 \\times 5 = 6500$',
                  '$260\\,\\mathrm{s}$ ، أي $2{,}6$ دقيقة',
                  '$340\\,\\mathrm{s}$ ، أي 5 دقائق و 40 ثانية',
                ].map(M)}
                correct={0} cols={1} requires={['masafa-fithaghuras', 'maqadir-murakkaba']}
                explain={<MathText>{`${REMARKS.mudda} أمّا $2{,}6$ دقيقة فهي 2 دقيقة و 36 ثانية: الدقيقة 60 ثانية لا 100، و $340\\,\\mathrm{s}$ مدة حبل طوله $1700\\,\\mathrm{m}$.`}</MathText>}
                onAnswered={mark(4)} />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : $t = d/v$ est la vitesse moyenne de « تطبيقات التناسبية » (درس 4, maqadir-murakkaba) ;
                  la ligne s5 de l’étape 2 et l’explication ci-dessus (REMARKS.mudda) viennent de la dire, minutes comprises. */}
              {q[4] && <KnowledgeBrick id="mudda-sura" variant="rappel" />}
            </div>
          ) },
        { num: 5, title: 'تنفيذ: التكلفة بدلالة x', subtitle: 'الجزء 2 — عائلة أخرى', done: !!q[5],
          content: (
            <div className="space-y-3">
              <p className="rounded-lg bg-amber-50 px-2 py-1 text-sm"><MathText>{FAMILY.text}</MathText> <SourceTag source={FAMILY.source} /></p>
              <TapQuestion
                prompt={<MathText>{'تكلفة رحلة هذه العائلة بدلالة $x$ هي:'}</MathText>}
                options={[
                  '$C(x) = 2x + 2 \\times 0{,}5x = 3x$',
                  '$C(x) = 4x$',
                  '$C(x) = 2x + 2(x - 50) = 4x - 100$',
                  '$C(x) = 4 \\times 0{,}5x = 2x$',
                ].map(M)}
                correct={0} cols={1} requires={['nisba-takhfid', 'shakl-khatti']}
                explain={<MathText>{`${REMARKS.tifl} البالغان يدفعان $2x$ والطفلان $2 \\times 0{,}5x$ : $C(x) = 3x$ دالة خطية معاملها 3. التخفيض بالنسبة المئوية لا بالدينار، ولا يخص البالغين.`}</MathText>}
                onAnswered={mark(5)} />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : la forme $ax$ est shakl-khatti (درس 2) et le coût réduit est takhfid-darb (درس 4) ;
                  l’explication ci-dessus vient d’écrire $C(x) = 3x$ « دالة خطية معاملها 3 ». */}
              {q[5] && <KnowledgeBrick id="taklifa-khattiya" variant="rappel" />}
            </div>
          ) },
        { num: 6, title: 'وإذا كان التخفيض 25%؟', subtitle: 'ماذا يدفع الطفل الآن؟', done: !!q[6],
          content: (
            <TapQuestion
              prompt={<MathText>{'لو استفاد كل طفل من العائلة الأخرى من تخفيض قدره 25% فقط من قيمة $x$ ، لصارت التكلفة:'}</MathText>}
              options={[
                '$C(x) = 2x + 2 \\times 0{,}75x = 3{,}5x$',
                '$C(x) = 2x + 2 \\times 0{,}25x = 2{,}5x$',
                '$C(x) = 2x + 2(x - 25) = 4x - 50$',
                '$C(x) = 4 \\times 0{,}75x = 3x$',
              ].map(M)}
              correct={0} cols={1} requires={['taklifa-khattiya', 'nisba-takhfid']}
              explain={<MathText>{`${REMARKS.takhfidWhy} ${REMARKS.takhfidRight}`}</MathText>}
              onAnswered={mark(6)} />
          ) },
        { num: 7, title: 'قراءة بيانية: حد الميزانية', subtitle: 'على المخبر — المستوى المبتدئ', done: !!q[7],
          content: (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">ما قرأته على مستقيم التكلفة <MathText>{'$C(x) = 3x$'}</MathText> (المستوى المبتدئ):</p>
              <Evidence trials={smallTrials} level="beginner" empty="لم تقرأ بعد على المستقيم: افتح المستوى المبتدئ واسحب المؤشّر إلى أن تبلغ التكلفة خط الميزانية." />
              <NumericQuestion
                prompt={<span>بميزانية <bdi dir="ltr">1500 DA</bdi>، ما أكبر سعر لتذكرة البالغ (بالدينار)؟</span>}
                expected={500} display="500"
                requires={['taklifa-khattiya', 'qiraa-bayaniya']}
                explain={<MathText>{REMARKS.mizaniya}</MathText>}
                onAnswered={mark(7)} />
            </div>
          ) },
        { num: 8, title: 'تفسير النتيجة', subtitle: 'ميزانية 1600 DA', done: !!q[8],
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<span>لو كانت ميزانية العائلة الأخرى <bdi dir="ltr">1600 DA</bdi> (والتكلفة <MathText>{'$3x$'}</MathText>)، ما أكبر سعر للتذكرة بعدد طبيعي من الدنانير؟</span>}
                expected={533} display="533"
                parse={parseDec}
                requires={['taklifa-khattiya', 'qiraa-bayaniya']}
                explain={<MathText>{`$\\dfrac{1600}{3} \\approx 533{,}33$. ${REMARKS.tadwirWhy} ${REMARKS.tadwirRight}`}</MathText>}
                onAnswered={mark(8)} />
              {q[8] && (
                <>
                  {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : la lecture de l’intersection est qiraa-bayaniya (درس 3) ; les explications des
                      étapes 7 (REMARKS.mizaniya) et 8 (tadwirWhy + tadwirRight : arrondir vers le bas) viennent de la dire. */}
                  <KnowledgeBrick id="hadd-mizaniya" variant="rappel" />
                  <TextbookBox kind="remark" title={SITUATION.analysis[2].label} text={SITUATION.analysis[2].text} source={SITUATION.source} compact />
                  {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : la démarche ne fait que remettre en ordre les trois encadrés « تحليل الوضعية »
                      que l’élève vient de lire (étapes 1, 2 et celui juste au-dessus). */}
                  <KnowledgeBrick id="tariqat-wadiya" variant="rappel" />
                  <TextbookBox kind="remark" text={REMARKS.notSolvedHere} compact />
                </>
              )}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={7} variant="memo" />} />
  );
}
