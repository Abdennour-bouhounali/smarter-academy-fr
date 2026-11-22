import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox, PairQuestion } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY, ACTIVITY_LINES, LAB } from '../content/textbook';
import { FIG_ACT2, FIG_ACT2_SOLVED } from '../content/figures';

/**
 * Module 1 — ouvert sur LES PORTAILS DE LA CARTE DE JEU (component-calc), rétrofit 2026-10-15 (§4quater).
 *
 * LE LABO OUVRE LE MODULE : pas de carte du manuel, pas de titre de workspace, pas de titre de labo ; `lead` = le contexte seul.
 * Le niveau par défaut est مبتدئ — les portails A(1 ; 2), B(4 ; 3) puis D tel que AB = DC (situation de la plateforme,
 * ENTRÉE choisie ; voir l'en-tête de lesson.config.js). Le نشاط 2 du manuel (C, D, E, F) est le niveau متقدم du MÊME labo
 * et revient en application aux étapes 3 à 6, « نشاط الكتاب ».
 * ORDRE : (1) la règle, écrite par l'élève sur SES nombres (A, B, le code qu'il a ouvert) — « أتوقّع القاعدة » puis la brique
 * farq-ihdathiyat APRÈS la réponse ; (2) pourquoi deux portails de places différentes ont le même code (D de l'élève) ;
 * (3–5) le نشاط 2 أ du manuel (lire C et D, le code de CD, la porte E) = application de la règle ; (6) نشاط 2 ب 2 : DE = CF.
 * Les étapes ne répètent pas la consigne du labo (« écris le code », « place D ») : elles demandent POURQUOI.
 * AUCUNE étape n'attend `onFinished` ; les essais (`onTrial`, deux niveaux) nourrissent la ligne de preuve. LP : P1, P2.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const KIND = { ok: 'صحيح', reversed: 'طرح مقلوب', swapped: 'مبدّلتان', coords: 'إحداثيتا النهاية', signX: 'إشارة', signY: 'إشارة', xOnly: 'نصف صحيح', yOnly: 'نصف صحيح', none: 'بعيد', zero: 'لا قفزة', order: 'ترتيب الحروف', onPoint: 'بوابة أخرى' };
const tex = (v) => (v < 0 ? `-${Math.abs(v)}` : `${v}`);

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [qRule, setQRule] = useState(false);
  const [qTwin, setQTwin] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q5, setQ5] = useState(false);

  const onTrial = (ev) => { if (ev && !ev.tk) setTrials((s) => [...s, ev].slice(-8)); };

  const evidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={trials.length ? 'true' : 'false'}>
      {trials.length === 0 ? (
        <p className="text-slate-500">لم تجرّب بعد أي رمز: اكتب رمز البوابة في المناولة أعلاه ثم افتحها.</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">محاولاتك على الخريطة:</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="trials">
            {trials.map((t) => (
              <li key={t.n} className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${t.kind === 'ok' ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-slate-300 bg-slate-50 text-slate-700'}`} data-evidence-trial={t.type}>
                {t.type === 'calc'
                  ? <MathText>{`رمز $\\overrightarrow{${t.from}${t.to}}$ : $\\begin{pmatrix} ${tex(t.u[0])} \\\\ ${tex(t.u[1])} \\end{pmatrix}$ — ${KIND[t.kind]}`}</MathText>
                  : <MathText>{`$${t.point}(${tex(t.at[0])}\\,;\\,${tex(t.at[1])})$ — ${KIND[t.kind]}`}</MathText>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط 2 — بوابات الخريطة"
      moduleSubtitle="مركبتا شعاع علمت إحداثيات مبدئه ونهايته: هل نحتاج إلى العدّ؟"
      objectives={['كيف نكتب قفزة بوابة بعددين؟', 'هل نحتاج إلى عدّ المربعات لنعرف رمزها؟', 'متى نقول عن شعاعين إنهما متساويان؟']} estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="component-calc"
                level="beginner"
                {...LAB.beginner.numbers}
                theme="game-map"
                lead="في لعبة على الهاتف، بوابات سحرية تنقل البطل على خريطة مزوّدة بمعلم. رمز كل بوابة هو مركبتا الشعاع الذي تقفز به."
                onTrial={onTrial}
              />
            ),
            advanced: () => (
              <Manipulation
                type="component-calc"
                level="advanced"
                {...LAB.advanced.numbers}
                theme="game-map"
                lead={<MathText>{'نشاط الكتاب: $C(3\\,;\\,1)$ و $D(2\\,;\\,-5)$ و $F(6\\,;\\,5)$ ، والبوابة E مجهولة: مركبتا $\\overrightarrow{DE}$ هما 3 و 4.'}</MathText>}
                onTrial={onTrial}
              />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'كيف عرفتَ رمز البوابة دون عدّ؟', subtitle: 'من إحداثيتي A و B', done: qRule,
          content: (
            <div className="space-y-3">
              {evidence}
              {/* « أتوقّع القاعدة » : la bonne option EST la règle ; l'élève l'écrit d'abord avec ses mots, la brique vient APRÈS la réponse. */}
              <PredictRule id="farq-ihdathiyat">
                <TapQuestion
                  prompt={<MathText>{'$A(1\\,;\\,2)$ و $B(4\\,;\\,3)$ ، والرمز الذي فتح البوابة هو $\\begin{pmatrix} 3 \\\\ 1 \\end{pmatrix}$ . عبّر عن $a$ و $b$ ، مركبتي $\\overrightarrow{AB}$ ، بدلالة الإحداثيات:'}</MathText>}
                  options={[
                    '$a = x_B - x_A$ و $b = y_B - y_A$',
                    '$a = x_A - x_B$ و $b = y_A - y_B$', // la soustraction à l'envers : le héros saute dans le sens contraire
                    '$a = x_B$ و $b = y_B$', // seulement quand A = O
                  ].map(M)}
                  correct={0}
                  cols={1}
                  requires={['qiraat-murakkibatayn', 'tarh-nisbi']}
                  explain={<MathText>{`${ACTIVITY_LINES.ab} هنا: $x_B - x_A = 4 - 1 = 3$ و $y_B - y_A = 3 - 2 = 1$ .`}</MathText>}
                  onAnswered={() => setQRule(true)}
                />
              </PredictRule>
              {qRule && <KnowledgeBrick id="farq-ihdathiyat" lead="ما وجدته على الخريطة، بكلمات النشاط:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'لماذا يصلح للبوابتين الرمز نفسه؟', subtitle: 'البوابة D التي وضعتَها', done: qTwin,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'عندما وضعتَ D بحيث يفتح الرمز $\\begin{pmatrix} 3 \\\\ 1 \\end{pmatrix}$ البوابتين معًا (من A إلى B ومن D إلى C) كانت النقطتان A و D في موضعين مختلفين. ما الذي جعل الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{DC}$ متساويين؟'}</MathText>}
                options={[
                  'لهما نفس المركبتين، ولا يهمّ أين يبدآن',
                  'لأنّ لهما المبدأ نفسه', // deux vecteurs égaux peuvent avoir des origines différentes
                  'لأنّ لهما الطول نفسه فقط', // l'égalité demande aussi la même direction et le même sens
                ].map(M)}
                correct={0}
                cols={1}
                requires={['farq-ihdathiyat']}
                explain={<MathText>{'$\\overrightarrow{DC}$ مركبتاه $5 - x_D$ و $5 - y_D$ ، وتساويان 3 و 1 عندما يكون $D(2\\,;\\,4)$ : شعاعان لهما نفس المركبتين متساويان، ولو بدآ من موضعين مختلفين.'}</MathText>}
                onAnswered={() => setQTwin(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'نشاط الكتاب 2 أ: النقطتان C و D', subtitle: 'السؤال 1', done: q1,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={`${ACTIVITY.intro} ${ACTIVITY.partA}`} source={ACTIVITY.source} compact />
              <GeoFigure {...FIG_ACT2} />
              <TapQuestion
                prompt="إحداثيتا C و D على الشكل:"
                options={[
                  '$C(3\\,;\\,1)$ و $D(2\\,;\\,-5)$',
                  '$C(1\\,;\\,3)$ و $D(-5\\,;\\,2)$', // l'ordre (x ; y) inversé : MISC-MAALAM-TABDIL-X-Y
                  '$C(3\\,;\\,1)$ و $D(2\\,;\\,5)$', // le signe sous l'axe des abscisses oublié : MISC-MAALAM-ISHARA
                ].map(M)}
                correct={0}
                cols={1}
                requires={['qiraat-murakkibatayn']}
                explain={<MathText>{`${ACTIVITY_LINES.read} الفاصلة أولا ثم الترتيب، و D تحت محور الفواصل فترتيبها سالب.`}</MathText>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'نشاط الكتاب 2 أ: رمز البوابة CD', subtitle: 'السؤال 2', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'طبّق القاعدة: ما هما مركبتا الشعاع $\\overrightarrow{CD}$ ؟'}</MathText>}
                options={[
                  '$\\overrightarrow{CD}\\begin{pmatrix} -1 \\\\ -6 \\end{pmatrix}$',
                  '$\\overrightarrow{CD}\\begin{pmatrix} 1 \\\\ 6 \\end{pmatrix}$', // C − D : la soustraction à l'envers (MISC-MAALAM-TARH-MAQLUB)
                  '$\\overrightarrow{CD}\\begin{pmatrix} 2 \\\\ -5 \\end{pmatrix}$', // les coordonnées de D (MISC-MAALAM-IHDATHIYAT-MURAKKIBAT)
                  '$\\overrightarrow{CD}\\begin{pmatrix} 1 \\\\ -6 \\end{pmatrix}$', // un signe oublié (MISC-MAALAM-ISHARA)
                ].map(M)}
                correct={0}
                cols={2}
                requires={['farq-ihdathiyat', 'tarh-nisbi']}
                explain={<MathText>{ACTIVITY_LINES.cd}</MathText>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
        {
          num: 5, title: 'نشاط الكتاب 2 أ: البوابة E', subtitle: 'السؤال 3', done: q3,
          content: (
            <div className="space-y-3">
              <PairQuestion
                prompt={<MathText>{'مركبتا $\\overrightarrow{DE}$ هما 3 و 4. إحداثيتا النقطة E:'}</MathText>}
                expected={{ x: '5', y: '-1' }}
                explain={ACTIVITY_LINES.e}
                requires={['farq-ihdathiyat', 'tarh-nisbi']}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
        {
          num: 6, title: 'نشاط الكتاب 2 ب: البوابتان التوأمان', subtitle: 'السؤال 2', done: q5,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY.partB} source={ACTIVITY.source} compact />
              <TapQuestion
                prompt={<MathText>{'$F(6\\,;\\,5)$ . الشعاع $\\overrightarrow{CF}$ والشعاع $\\overrightarrow{DE}$ :'}</MathText>}
                options={[
                  '$\\overrightarrow{CF}\\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$ : نفس مركبتي $\\overrightarrow{DE}$ ، إذن $\\overrightarrow{DE} = \\overrightarrow{CF}$',
                  '$\\overrightarrow{CF}\\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$ ، لكن الشعاعين غير متساويين لأن مبدأيهما مختلفان', // deux vecteurs égaux peuvent avoir des origines différentes
                  '$\\overrightarrow{CF}\\begin{pmatrix} 6 \\\\ 5 \\end{pmatrix}$ : إحداثيتا F', // MISC-MAALAM-IHDATHIYAT-MURAKKIBAT
                ].map(M)}
                correct={0}
                cols={1}
                requires={['farq-ihdathiyat']}
                explain={<MathText>{`${ACTIVITY_LINES.cf} نقول إن الشعاعين متساويان: $\\overrightarrow{DE} = \\overrightarrow{CF}$ .`}</MathText>}
                onAnswered={() => setQ5(true)}
              />
              {q5 && (
                <>
                  <GeoFigure {...FIG_ACT2_SOLVED} />
                  <Feedback tone="ok">كما على الخريطة: بوابتان من موضعين مختلفين، ورمز واحد — شعاعان متساويان، والرباعي DEFC متوازي أضلاع.</Feedback>
                </>
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
