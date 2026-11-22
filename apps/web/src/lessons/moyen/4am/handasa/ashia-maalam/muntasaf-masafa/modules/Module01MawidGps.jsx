import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { CHALLENGE, CHALLENGE_LINES, ACTIVITY, ACTIVITY_LINES, ACTIVITY_4, ACTIVITY_4_LINES, LAB } from '../content/textbook';
import { FIG_CHALLENGE, FIG_ACT3_KL, FIG_ACT3, FIG_ACT4, FIG_ACT4_TRI } from '../content/figures';

/**
 * Module 1 — تحدّ, نشاط 3 et نشاط 4 (pp. 139 et 141), ouvert sur LE RENDEZ-VOUS GPS (midpoint-distance).
 *
 * REAL / DISCOVER / MANIPULATE  le lab à deux niveaux, même objectif :
 *   متقدم (ouvert par défaut : les نشاط 3 et 4) : K(5 ; 3), L(−3 ; 1) — l'élève pose J sans lecture avant ثبّت — puis
 *          L(1 ; −2), K(5 ; 1) : il construit l'escalier jusqu'au coin M et réclame KL ;
 *   مبتدئ : deux amis aux Sablettes, A(1 ; −1) et B(4 ; 3), les composantes et les ombres sur les axes lues en direct.
 *   Les deux propositions de la discussion de groupe (somme sans ÷ 2, demi-différence) et la marche dans les rues (7)
 *   sont REFUSÉES par la mathématique.
 * UNDERSTAND  le تحدّ (la règle graduée ne donne qu'une valeur approchée) ; le نشاط 3 1) et le نشاط 4 أ répondus sous les
 *           essais de l'élève (`onTrial`, `[data-activity-evidence]`) ; la brique « المنتصف وتساوي شعاعين ».
 * AUCUNE étape n'attend `onFinished`. LP : P1 (milieu), P2 (distance).
 * « أتوقّع القاعدة » : la brique « المنتصف وتساوي شعاعين » est un RAPPEL (`variant="rappel"`) — elle ne fait que combiner
 * le milieu par les vecteurs (الوحدة 11, priorKnowledge muntasaf-shuaa, testé par l'item 5 de « أستعدّ ») et l'égalité de deux
 * vecteurs par leurs composantes (درس 2) ; la ligne « ماذا تستنتج؟ » juste au-dessus vient de la faire conclure.
 * Les labs vivent dans l'`intro` (deux niveaux) : le rappel de « مسألة الدرس » (ANCIENNE carte, retirée du module le 2026-10-09 — elle ne vit plus qu'au sommaire) ferme la DERNIÈRE étape.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const num = (v) => String(v).replace('.', '{,}');
const ptTex = (name, [x, y]) => `$${name}(${num(x)}\\,;\\,${num(y)})$`;

export default function Module01MawidGps() {
  const [trials, setTrials] = useState([]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const onTrial = (ev) => {
    if (!ev) return;
    if (ev.stage === 'meet' && ev.kind !== 'end') setTrials((s) => [...s, { key: `m${ev.n}`, stage: 'meet', ok: ev.kind === 'ok', tex: ptTex(ev.names[2], ev.at) }].slice(-10));
    if (ev.stage === 'distance' && ev.kind === 'ok' && ev.corner) setTrials((s) => [...s, { key: `c${ev.n}`, stage: 'distance', ok: true, tex: ptTex(ev.names[2], ev.corner) }].slice(-10));
    if (ev.stage === 'distance' && ev.claim) setTrials((s) => [...s, { key: `d${ev.n}`, stage: 'distance', ok: ev.claim === 'root', tex: `$${ev.names[0]}${ev.names[1]} = ${ev.claimTex}$` }].slice(-10));
  };
  const evidence = (stage, empty) => {
    const mine = trials.filter((t) => t.stage === stage);
    return (
      <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence={stage} data-tried={mine.length ? 'true' : 'false'}>
        {mine.length === 0 ? (
          <p className="text-slate-500">{empty}</p>
        ) : (
          <>
            <p className="mb-1 font-bold text-slate-700">محاولاتك في المستوى «متقدم»:</p>
            <ul className="flex flex-wrap gap-1.5">
              {mine.map((t) => (
                <li key={t.key} className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${t.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`}>
                  {t.ok ? '✓ ' : '✗ '}<MathText>{t.tex}</MathText>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="تحدّ ونشاط 3 و 4 — موعد عبر GPS"
      moduleSubtitle="أين نلتقي في منتصف الطريق؟ وكم يبعد أحدنا عن الآخر في خط مستقيم؟"
      objectives={['أين نضع دبّوس اللقاء بين صديقين؟', 'كم يبعد أحدهما عن الآخر في خط مستقيم؟', 'لماذا لا تكفي المسطرة لمسافة دقيقة؟']} estimatedTime="13 دقيقة"
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="midpoint-distance"
                level="beginner"
                {...LAB.beginner.numbers}
                theme="gps-meet"
                lead={<MathText>{'ريم في $A(1\\,;\\,-1)$ وياسين في $B(4\\,;\\,3)$ .'}</MathText>}
              />
            ),
            advanced: () => (
              <Manipulation
                type="midpoint-distance"
                level="advanced"
                {...LAB.advanced.numbers}
                theme="gps-meet"
                lead={<MathText>{'نشاط 3: $K(5\\,;\\,3)$ و $L(-3\\,;\\,1)$ و J منتصف [KL]. ثم نشاط 4: $L(1\\,;\\,-2)$ و $K(5\\,;\\,1)$ والزاوية M.'}</MathText>}
                onTrial={onTrial}
              />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا قبل التطبيق دبّوسك هنا؟', subtitle: 'نشاط 3 — السؤال 1)', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={`${ACTIVITY.intro} ${ACTIVITY.part1}`} source={ACTIVITY.source} compact />
              {evidence('meet', 'لم تثبّت بعد دبّوس اللقاء J في المستوى «متقدم».')}
              <GeoFigure {...(q2 ? FIG_ACT3 : FIG_ACT3_KL)} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر لكل سطر:</p>}
                rows={[
                  { id: 'why', label: 'لماذا لا يقبل التطبيق دبّوسك إلا في موضع واحد؟', options: ['لأن الحركة من K إلى J يجب أن تساوي الحركة من J إلى L', 'لأن J يجب أن يكون أقرب إلى K منه إلى L', 'لأن J يجب أن يكون مجموع إحداثيتي K و L'].map(M), correct: 0, correction: <MathText>{`${ACTIVITY_LINES.j} (ودبّوس اللقاء حيث تتساوى الحركتان: لا أقرب إلى طرف ولا مجموع إحداثيات.)`}</MathText> },
                  { id: 'kj', label: <MathText>{'مركبتا $\\overrightarrow{KJ}$'}</MathText>, options: ['$\\begin{pmatrix} -4 \\\\ -1 \\end{pmatrix}$', '$\\begin{pmatrix} 4 \\\\ 1 \\end{pmatrix}$', '$\\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix}$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_LINES.kj}</MathText> },
                  { id: 'jl', label: <MathText>{'مركبتا $\\overrightarrow{JL}$'}</MathText>, options: ['$\\begin{pmatrix} -4 \\\\ -1 \\end{pmatrix}$', '$\\begin{pmatrix} -3 \\\\ 1 \\end{pmatrix}$', '$\\begin{pmatrix} 4 \\\\ 1 \\end{pmatrix}$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_LINES.kj}</MathText> },
                  { id: 'conc', label: 'ماذا تستنتج؟', options: ['$\\overrightarrow{KJ} = \\overrightarrow{JL}$', '$\\overrightarrow{KJ} = \\overrightarrow{LJ}$', '$\\overrightarrow{KJ} = \\overrightarrow{KL}$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_LINES.conclusion}</MathText> },
                ]}
                requires={['muntasaf-shuaa', 'murakkibat-hisab']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: نفس الحركة من K إلى J ومن J إلى L، كما في دبّوس اللقاء.' : 'راجع التصحيح تحت كل سطر، وقارن بدبّوسك في المستوى «متقدم».'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="muntasaf-murakkibat" variant="rappel" lead="ما وجدته على الخريطة:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ما الذي بنيته بين L و K؟', subtitle: 'نشاط 4 — الجزء أ)', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY_4.partA} source={ACTIVITY_4.source} compact />
              <GeoFigure {...(q3 ? FIG_ACT4_TRI : FIG_ACT4)} />
              {evidence('distance', 'لم تبنِ بعد درج الشوارع من L إلى K في المستوى «متقدم».')}
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر لكل سطر:</p>}
                rows={[
                  { id: 'coords', label: 'إحداثيات النقط K و L و M', options: ['$K(5\\,;\\,1)$ ، $L(1\\,;\\,-2)$ ، $M(5\\,;\\,-2)$', '$K(1\\,;\\,5)$ ، $L(-2\\,;\\,1)$ ، $M(-2\\,;\\,5)$', '$K(5\\,;\\,1)$ ، $L(-2\\,;\\,1)$ ، $M(5\\,;\\,-2)$'].map(M), correct: 0, correction: <MathText>{`الفاصلة أولا ثم الترتيب: ${ACTIVITY_4_LINES.coords} .`}</MathText> },
                  { id: 'legs', label: 'الضلعان القائمان', options: ['$KM = 3$ و $LM = 4$', '$KM = 4$ و $LM = 3$', '$KM = 1$ و $LM = 5$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_4_LINES.legs}</MathText> },
                  { id: 'kl', label: 'لماذا لا تساوي المسافة بين L و K طول الدرج كلّه (7)؟', options: ['لأن المسافة في خط مستقيم هي وتر المثلث القائم، وهو أقصر من مجموع ضلعيه', 'لأن الدرج يُحسب مرّتين', 'لأن الوتر يساوي مجموع الضلعين'].map(M), correct: 0, correction: <MathText>{`${ACTIVITY_4_LINES.kl} ${ACTIVITY_4_LINES.taxi}`}</MathText> },
                ]}
                requires={['fithaghuras', 'ihdathiyat-qiraa']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: المسافة في خط مستقيم وتر المثلث القائم، لا مجموع ضلعي الدرج.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'التحدّ: مسافة لا تكفيها المسطرة', subtitle: 'تحدّ — الكتاب ص 139', done: q1,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={CHALLENGE.text} source={CHALLENGE.source} compact />
              <GeoFigure {...FIG_CHALLENGE} />
              <TapQuestion
                prompt="قاس تلميذ AB على الرسم فوجد قرابة 6,4 cm. هل هذه هي «القيمة المضبوطة» المطلوبة؟"
                options={[
                  'لا: القياس على الرسم تقريبي، والنقطتان ليستا على عقد الرصف — نحتاج حسابا بالإحداثيات',
                  'نعم: المسطرة المدرّجة تعطي القيمة المضبوطة',
                  'لا يمكن إيجاد AB لأن إحداثيتي A و B ليستا عددين صحيحين',
                ]}
                correct={0}
                cols={1}
                requires={['ihdathiyat-qiraa']}
                explain={<MathText>{`${CHALLENGE_LINES.measure} سنحسب AB بالضبط بعد أن نكتشف القانون في هذا الدرس.`}</MathText>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
