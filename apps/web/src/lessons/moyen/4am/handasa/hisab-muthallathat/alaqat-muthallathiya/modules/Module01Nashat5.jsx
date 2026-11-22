import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, ACT5, TABLE_TEX, LINES } from '../content/textbook';
import TrialsEvidence from '../components/TrialsEvidence';

/**
 * Module 1 — نشاط 5 « العلاقات المثلثية » (p. 117), stage `trigger`.
 *
 * Rétrofit 2026-10-15 : le labo EN TÊTE (ni carte `brief` du cerf-volant, ni titre/lead du workspace ni titre du labo : le contexte et la
 * mission sont ceux du labo) ; les briques restent après leur question.
 * REAL / MANIPULATE  le cerf-volant sur la plage (déclaré) : le lab `angle-compass` à deux niveaux, même objectif —
 *   مبتدئ (ouvert par défaut) : construire, sans rapporteur, l'angle dont le sinus vaut 3/5 (hauteur 3, fil 5 → 4 sur
 *   le sable) ; la lecture montre cos = 4/5 et la barre 16/25 + 9/25 qui remplit 1 ;
 *   متقدم : la طريقة p. 121 (sin 2/5 au compas, puis tan 7/3 à la règle) — préparation du module 3.
 *   L'activité 5 n'est PAS le niveau avancé du lab : aucune étape n'attend `onFinished` ; l'étape 1 liste les
 *   constructions de l'élève (`onTrial`, `[data-activity-evidence]`).
 * UNDERSTAND  1. le cosinus lu sur le triangle construit ; 2. نشاط 5 (1) avec le tableau de نشاط 4 (valeurs ARRONDIES :
 *   0,87² + 0,50² = 1,0069 — d'où la preuve) ; 3. la conjecture → brique takhmin-alaqat ;
 * FORMALIZE  4. نشاط 5 (2) : les rapports en fonction des côtés et Pythagore ; 5. tan = sin / cos → brique burhan-alaqat.
 * « أتوقّع القاعدة » : la bonne option de l'étape 3 EST la conjecture, et l'étape 4 EST la preuve (ses corrections
 * l'écrivent) : la question de l'étape 3 est enveloppée dans <PredictRule id="takhmin-alaqat">, celle de l'étape 4 dans
 * <PredictRule id="burhan-alaqat"> — l'élève écrit la conjecture, puis la preuve, AVANT de voir les options
 * (predictPrompt de knowledge.jsx). La « مسألة الدرس » (ANCIENNE carte, retirée du module le 2026-10-09 — elle ne vit plus qu'au sommaire) ferme la dernière étape : le laboratoire est
 * dans `intro` (les deux niveaux) ; même instrument que le niveau متقدم (sin x = 3/7 au compas), résolue au module 5.
 * LP : P1 (étapes 2–5), P3 (le laboratoire, étape 1).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module01Nashat5() {
  const [trials, setTrials] = useState([]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);
  // les événements du labo `{ tk: 'checkpoint' | 'checkpoint-done' }` (questions posées PAR-DESSUS le labo) ne sont pas des constructions : on n'en garde que la TRACE
  const [cpDone, setCpDone] = useState({});
  const onTrial = (tr) => {
    if (tr.tk) { if (tr.tk === 'checkpoint-done') setCpDone((d) => ({ ...d, [tr.id]: true })); return; }
    setTrials((t) => [...t, tr].slice(-8));
  };

  return (
    <ContentModule
      objectives={['كيف نرسم زاوية دون منقلة إذا عرفنا جيبها فقط؟', 'ماذا يربط جيب الزاوية بجيب تمامها وبظلها؟', 'هل يصحّ ما نخمّنه لكل زاوية حادة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط 5 — العلاقات المثلثية"
      moduleSubtitle="خيط طائرة ورقية، ومثلث قائم ترسمه دون منقلة"
      estimatedTime="13 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => (
              <Manipulation type="angle-compass" level="beginner" targets={LAB.m1.beginner.targets} theme={LAB.m1.beginner.theme}
                onTrial={onTrial} />
            ),
            advanced: () => (
              <Manipulation type="angle-compass" level="advanced" targets={LAB.m1.advanced.targets} theme={LAB.m1.advanced.theme}
                onTrial={onTrial} />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'جيب تمام الزاوية التي بنيتها', subtitle: 'من إنشاءاتك', done: q1 || !!cpDone.t0,
          content: (
            <div className="space-y-3">
              <TrialsEvidence trials={trials} />
              {cpDone.t0 ? (
                <p className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900" data-evidence="cos-trace" data-tried="true">
                  <MathText>{'أجبتَ في المختبر عن أضلاع المثلث الذي بنيته ونسبه: جيب التمام قسمة المجاور على الوتر، والضلع الثالث من خاصية فيثاغورس (انظر أضلاع إنشائك أعلاه).'}</MathText>
                </p>
              ) : (
                              <TapQuestion
                    prompt={<MathText>{'في المثلث الذي بنيته لزاوية x جيبها $\\dfrac{3}{5}$ (الارتفاع 3 والخيط 5)، المسافة على الرمل 4 . إذن $\\cos x =$'}</MathText>}
                    options={['$\\dfrac{4}{5}$', '$\\dfrac{3}{4}$', '$\\dfrac{5}{4}$'].map(M)}
                    correct={0}
                    cols={3}
                    requires={['fithaghuris', 'taarif-nisab']}
                    explain={<MathText>{'المجاور للزاوية x هو الضلع على الرمل (4) والوتر هو الخيط (5): $\\cos x = \\dfrac{4}{5}$ ، و 4 من خاصية فيثاغورس: $5^2 - 3^2 = 16$ . ($\\dfrac{3}{4}$ هو الظل، و $\\dfrac{5}{4} > 1$ نسبة مقلوبة.)'}</MathText>}
                    onAnswered={() => setQ1(true)}
                  />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'جدول النشاط 4', subtitle: 'نشاط 5 (1)', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={ACT5.part1} source={ACT5.source} compact />
              <p className="text-xs text-slate-600">قيم الجدول الذي ملأته بالحاسبة في الدرس السابق (المدوّر إلى الجزء من 100):</p>
              <div className="overflow-x-auto" dir="ltr"><MathText>{`$${TABLE_TEX}$`}</MathText></div>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">أتمم بقيم الجدول:</p>}
                rows={[
                  { id: 'q30', label: <MathText>{'$\\dfrac{\\sin 30^{\\circ}}{\\cos 30^{\\circ}} = \\dfrac{0{,}50}{0{,}87} \\approx$'}</MathText>, options: ['$0{,}57$', '$1{,}74$', '$1{,}37$'].map(M), correct: 0, correction: <MathText>{'$0{,}50 \\div 0{,}87 \\approx 0{,}57$ ، قريب من $\\tan 30^{\\circ} \\approx 0{,}58$ في الجدول. ($1{,}74$ هي القسمة مقلوبة، و $1{,}37$ هو المجموع.)'}</MathText> },
                  { id: 's30', label: <MathText>{'$(\\cos 30^{\\circ})^2 + (\\sin 30^{\\circ})^2 = 0{,}87^2 + 0{,}50^2 =$'}</MathText>, options: ['$1{,}0069$', '$1{,}37$', '$0{,}7569$'].map(M), correct: 0, correction: <MathText>{'$0{,}7569 + 0{,}25 = 1{,}0069$ . ($1{,}37$ جمع النسبتين دون تربيع، و $0{,}7569$ نسي مربع الجيب.)'}</MathText> },
                  { id: 'q45', label: <MathText>{'$\\dfrac{\\sin 45^{\\circ}}{\\cos 45^{\\circ}} = \\dfrac{0{,}71}{0{,}71} =$'}</MathText>, options: ['$1$', '$0{,}71$', '$1{,}42$'].map(M), correct: 0, correction: <MathText>{'عدد مقسوم على نفسه: 1 ، وهو $\\tan 45^{\\circ} = 1{,}00$ في الجدول.'}</MathText> },
                  { id: 's60', label: <MathText>{'$(\\cos 60^{\\circ})^2 + (\\sin 60^{\\circ})^2 = 0{,}50^2 + 0{,}87^2 =$'}</MathText>, options: ['$1{,}0069$', '$1{,}37$', '$0{,}25$'].map(M), correct: 0, correction: <MathText>{'$0{,}25 + 0{,}7569 = 1{,}0069$ ، كما لـ $30^{\\circ}$ .'}</MathText> },
                ]}
                requires={['murabba-kasr', 'taarif-nisab']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: القسمة قريبة من الظل، ومجموع المربعين قريب جدًا من 1.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'ضع تخمينا', subtitle: 'نشاط 5 (1) ب', done: q3,
          content: (
            <div className="space-y-3">
              <TrialsEvidence trials={trials} />
              <PredictRule id="takhmin-alaqat">
              <TapQuestion
                prompt="من الجدول ومن المثلثات التي بنيتها، أيّ تخمين نضع لكل زاوية حادة x ؟"
                options={[
                  <MathText key="a">{'$\\dfrac{\\sin x}{\\cos x} = \\tan x$ و $(\\cos x)^2 + (\\sin x)^2 = 1$'}</MathText>,
                  <MathText key="b">{'$\\cos x + \\sin x = 1$'}</MathText>,
                  <MathText key="c">{'$\\dfrac{\\cos x}{\\sin x} = \\tan x$ و $(\\cos x)^2 + (\\sin x)^2 = 2$'}</MathText>,
                ]}
                correct={0}
                cols={1}
                requires={['taarif-nisab']}
                explain={<MathText>{`${LINES.table} ${LINES.sumWhy}`}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              </PredictRule>
              {q3 && <KnowledgeBrick id="takhmin-alaqat" lead="التخمين، بكلمات الكتاب:" />}
            </div>
          ),
        },
        {
          num: 4, title: 'كيف نبرهن التخمين؟', subtitle: 'نشاط 5 (2) أ ب جـ', done: q4,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={ACT5.part2} source={ACT5.source} compact />
              <GeoFigure {...ACT5.figure} />
              <PredictRule id="burhan-alaqat">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'في المثلث ABC القائم في A ، و x قيس الزاوية $\\widehat{B}$ :'}</MathText></p>}
                rows={[
                  { id: 'cos', label: <MathText>{'$\\cos x =$'}</MathText>, options: ['$\\dfrac{AB}{BC}$', '$\\dfrac{AC}{BC}$', '$\\dfrac{BC}{AB}$'].map(M), correct: 0, correction: <MathText>{'المجاور للزاوية B هو [AB] والوتر [BC]. ($\\dfrac{AC}{BC}$ هو $\\sin x$ ، و $\\dfrac{BC}{AB}$ مقلوبة.)'}</MathText> },
                  { id: 'sin', label: <MathText>{'$\\sin x =$'}</MathText>, options: ['$\\dfrac{AC}{BC}$', '$\\dfrac{AC}{AB}$', '$\\dfrac{AB}{BC}$'].map(M), correct: 0, correction: <MathText>{'المقابل للزاوية B هو [AC]. ($\\dfrac{AC}{AB}$ هو $\\tan x$ .)'}</MathText> },
                  { id: 'pyth', label: 'خاصية فيثاغورس في المثلث ABC', options: ['$BC^2 = AB^2 + AC^2$', '$AB^2 = BC^2 + AC^2$', '$BC = AB + AC$'].map(M), correct: 0, correction: <MathText>{'الوتر [BC] يقابل الزاوية القائمة A: مربعه يساوي مجموع مربعي الضلعين الآخرين.'}</MathText> },
                  { id: 'sum', label: <MathText>{'$(\\cos x)^2 + (\\sin x)^2 = \\dfrac{AB^2 + AC^2}{BC^2} =$'}</MathText>, options: ['$1$', '$BC$', '$2$'].map(M), correct: 0, correction: <MathText>{LINES.proofSquares}</MathText> },
                ]}
                requires={['fithaghuris', 'taarif-nisab', 'murabba-kasr']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: التخمين صحيح لكل زاوية حادة، لا لـ 30° و 45° و 60° فقط.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ4(true)}
              />
              </PredictRule>
            </div>
          ),
        },
        {
          num: 5, title: 'والظل؟', subtitle: 'نشاط 5 (2) د', done: q5,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'$\\dfrac{\\sin x}{\\cos x} = \\dfrac{AC}{BC} \\div \\dfrac{AB}{BC} =$'}</MathText>}
                options={['$\\dfrac{AC}{AB}$', '$\\dfrac{AB}{AC}$', '$\\dfrac{AC \\times AB}{BC^2}$'].map(M)}
                correct={0}
                cols={3}
                requires={['taarif-nisab']}
                explain={<MathText>{`${LINES.proofTan} ($\\dfrac{AB}{AC}$ هو مقلوب الظل، والثالثة ضربت بدل أن تقسم.)`}</MathText>}
                onAnswered={() => setQ5(true)}
              />
              {q5 && <KnowledgeBrick id="burhan-alaqat" lead="ما بنيته يداك، مبرهنًا:" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
