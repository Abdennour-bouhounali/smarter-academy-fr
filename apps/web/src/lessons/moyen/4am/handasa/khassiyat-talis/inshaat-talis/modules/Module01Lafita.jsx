import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox, MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TIFO, LAB, METHOD_RAY, METHOD_DIVIDE, LINES } from '../content/textbook';
import TrialsEvidence from '../components/TrialsEvidence';
import { M1_ROUNDS } from '../content/banner';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';

/**
 * Module 1 — l'ENTRÉE de la leçon (le manuel n'a pas d'activité : le laboratoire est déclaré
 * `platform_adaptation`). Le tifo du derby : 10 cm ÷ 3 ne se mesure pas.
 *
 * REAL / DISCOVER / MANIPULATE  le lab à deux niveaux, même objectif :
 *   مبتدئ (ouvert par défaut) : la banderole [AB] en 3 parts égales — rayon, compas, règle, équerre ;
 *   متقدم : le point de rapport 3/2 de la طريقة p. 109, puis le second point (préparation du module 2).
 * UNDERSTAND  1. combien de marques, laquelle relier (les constructions de l'élève, `onTrial`, listées au-dessus :
 *             `[data-activity-evidence]`) ; 2. pourquoi : Thalès dans le triangle A P₃ B ; 3. l'ouverture n'importe pas.
 * FORMALIZE  briques taqsim-qitaa (la méthode — formulée, déclarée), tabrir-taqsim (k/n) ; puis la méthode du
 *            MANUEL (طرائق ص 107, D symétrique de B…) révélée ligne à ligne → brique tariqat-kitab-taqsim.
 * « أتوقّع القاعدة » : la طريقة du manuel (remarque, figure, solution) est enveloppée dans <PredictRule id="tariqat-kitab-taqsim"> :
 * l'élève écrit comment utiliser C, D, E AVANT de lire la solution (2026-10-06).
 * Fin de l'étape 4 (les deux niveaux du laboratoire sont dans `intro`) : la carte « مسألة الدرس » (module 4).
 * AUCUNE étape n'attend `onFinished` (pas d'activité du manuel). LP : P1.
 *
 * LECTEUR DE MISSION (rollout 2026-11-10, unité 9 leçon 3 ; conseil du 2026-11-10, verdict L3) : le labo se joue en MANCHES (content/banner.js ›
 * M1_ROUNDS : 8 cm en 3 → 11 cm en 5 et le contraste → le point de rapport 2/3, requis → défi ⭐ 1/3 → la ورشة libre) au lieu de مبتدئ / متقدم.
 * L'étape 1 attend la manche 1 (trois parts), l'étape 3 la manche 2 (la même banderole refaite avec un autre réglage). Ce que la ligne de trace dit
 * vient des manches GAGNÉES (étoiles gardées, annoncées par LabRounds au montage) : un rechargement ne bloque ni ne vide jamais une étape.
 * Aucun texte d'élève ne renvoie au manuel ; la longueur 10 cm (celle de la مسألة) ne figure plus dans les questions. Hors lecteur : le labo inchangé.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module01Lafita() {
  const [trials, setTrials] = useState([]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4a, setQ4a] = useState(false);
  const [q4, setQ4] = useState(false);
  const onTrial = (tr) => { if (!tr?.tk) setTrials((t) => [...t, tr].slice(-10)); };   // les événements `checkpoint` des questions du labo ne sont pas des constructions
  // lecteur : les manches gagnées (étoiles gardées, annoncées par LabRounds au montage) ouvrent les étapes et remplissent leur trace
  const [won, setWon] = useState({});
  const wonLine = (id, yes, no) => (
    <p className={`rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm ${won[id] ? 'font-bold text-emerald-900' : 'text-slate-500'}`}
      data-activity-evidence data-evidence={id} data-tried={won[id] ? 'true' : 'false'}>
      {won[id] ? <><span aria-hidden="true">✓ </span>{yes}</> : no}
    </p>
  );

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="لافتة التيفو — قطع متقايسة دون قياس"
      moduleSubtitle="نصف مستقيم، مدور، كوس: والقطع تتقايس من تلقاء نفسها"
      objectives={['كيف نقسم [AB] إلى قطع متقايسة دون أي قياس؟', 'لماذا تتقايس القطع؟ وهل لفتحة المدور دور؟', 'هل توجد طريقة ثانية لتقسيم ضلع؟']}
      estimatedTime="13 دقيقة"
      intro={
        // LE LABO OUVRE LE MODULE (§4quater) : le contexte du tifo est le `lead` du labo, ni carte ni titre de workspace.
        // Lecteur : les MANCHES (content/banner.js) ; la page garde ses deux niveaux.
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="m1-divider" rounds={M1_ROUNDS} icon="🧭" freeIcon="🥁"
              onTrial={onTrial} onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
        <ManipulationWorkspace
          levels={{
            beginner: () => (
              <Manipulation type="segment-divider" level="beginner" mode={LAB.m1.beginner.mode} parts={LAB.m1.beginner.parts}
                theme={LAB.m1.beginner.theme} lead={TIFO.text} onTrial={onTrial} />
            ),
            advanced: () => (
              <Manipulation type="segment-divider" level="advanced" mode={LAB.m1.advanced.mode} p={LAB.m1.advanced.p} q={LAB.m1.advanced.q}
                marks={LAB.m1.advanced.marks} theme={LAB.m1.advanced.theme} onTrial={onTrial} />
            ),
          }}
        />
          )}
        />
      }
      steps={[
        {
          needsRound: { id: 'r1', label: 'الجولة 1', icon: '🧭', won: Boolean(won.r1) },
          num: 1, title: 'كم علامة؟ وأيّها نصل بـ B ؟', subtitle: 'من إنشاءاتك', done: q1,
          content: (
            <div className="space-y-3">
              <PlayerSwitch
                player={wonLine('r1', 'الجولة 1: قسمتَ اللافتة إلى 3 قطع متقايسة بالمدور والكوس، دون أي قياس.', 'الجولة 1: لم تقسم اللافتة بعد إلى 3 قطع متقايسة.')}
                page={<TrialsEvidence trials={trials} />}
              />
              <TapQuestion
                prompt="في إنشائك الأخير: لماذا عيّنتَ 3 علامات متقايسة على [Ax) ثم وصلتَ الثالثة بـ B ؟"
                options={[
                  'نعيّن 3 علامات متقايسة ونصل الثالثة بـ B',
                  'نعيّن علامتين متقايستين ونصل الثانية بـ B',
                  'نعيّن 4 علامات متقايسة ونصل الرابعة بـ B',
                ]}
                correct={0}
                cols={1}
                requires={['qitaa-mutaqayisa']}
                explain={<MathText>{`${LINES.marksRight} ${LINES.marksWhy} (وبأربع علامات نحصل على أربع قطع.)`}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="taqsim-qitaa" lead="ما فعلته يداك، مكتوبًا:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'لماذا تتقايس القطع؟', subtitle: 'خاصية طالس', done: q2,
          content: (
            <div className="space-y-3">
              <GeoFigure {...METHOD_RAY.figure} />
              <p className="text-sm text-slate-700"><MathText>{'العلامات $P_1$ و $P_2$ و $P_3$ متقايسة، و $(P_1M_1)$ و $(P_2M_2)$ يوازيان $(P_3B)$ .'}</MathText></p>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'في المثلث $AP_3B$ ، حسب خاصية طالس:'}</MathText></p>}
                rows={[
                  { id: 'm1', label: <MathText>{'$\\dfrac{AM_1}{AB} = \\dfrac{AP_1}{AP_3} =$'}</MathText>, options: ['$\\dfrac{1}{3}$', '$\\dfrac{1}{2}$', '$3$'].map(M), correct: 0, correction: <MathText>{'$AP_3 = 3AP_1$ : النسبة $\\dfrac{1}{3}$ . ($\\dfrac{1}{2}$ هي $\\dfrac{AP_1}{AP_2}$ ، و $3$ نسبة مقلوبة.)'}</MathText> },
                  { id: 'm2', label: <MathText>{'$\\dfrac{AM_2}{AB} = \\dfrac{AP_2}{AP_3} =$'}</MathText>, options: ['$\\dfrac{1}{3}$', '$\\dfrac{2}{3}$', '$\\dfrac{3}{2}$'].map(M), correct: 1, correction: <MathText>{'$AP_2 = 2AP_1$ و $AP_3 = 3AP_1$ : النسبة $\\dfrac{2}{3}$ ، فـ $M_1M_2 = M_2B = \\dfrac{AB}{3}$ أيضًا.'}</MathText> },
                ]}
                requires={['talis-nisab', 'taqsim-qitaa']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: النقطتان عند ثلث AB وثلثيه، فالقطع الثلاث متقايسة.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="tabrir-taqsim" lead="خاصية طالس هي التي تقسم، لا المسطرة:" />}
            </div>
          ),
        },
        {
          needsRound: { id: 'r2', label: 'الجولة 2', icon: '🧭', won: Boolean(won.r2) },
          num: 3, title: 'فتحة المدور', subtitle: 'هل يجب أن تساوي طول قطعة؟', done: q3,
          content: (
            <div className="space-y-3">
              <PlayerSwitch
                player={wonLine('r2', 'الجولة 2: أعدتَ الإنشاء بضبط آخر، ونقط التقسيم بقيت في أماكنها.', 'الجولة 2: لم تُعد الإنشاء بعد بفتحة أخرى أو بميل آخر.')}
                page={<TrialsEvidence trials={trials} />}
              />
              <TapQuestion
                prompt={<MathText>{'على القطعة نفسها [AB]: سليم فتح المدور 2cm وأمينة 3cm ، وعيّن كل منهما 3 علامات متقايسة ووصل الثالثة بـ B ثم رسم الموازيات. ماذا نلاحظ؟'}</MathText>}
                options={[
                  'يحصلان على نقطتي التقسيم نفسيهما: كل قطعة ثلث AB عند كليهما',
                  'قطع سليم أقصر من قطع أمينة لأن فتحته أصغر',
                  'لا ينجح إلا من فتح المدور ثلث AB بالضبط',
                ]}
                correct={0}
                cols={1}
                requires={['tabrir-taqsim']}
                explain={<MathText>{LINES.opening}</MathText>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'طريقة ثانية', subtitle: 'نقط متقايسة على مستقيم يشمل B', done: q4,
          content: (
            <div className="space-y-3">
              <PredictRule id="tariqat-kitab-taqsim">
                <TextbookBox kind="remark" compact text="يمكن تقسيم الضلع [AB] بطريقة أخرى: النقط المتقايسة على مستقيم يشمل B، والموازيات للمستقيم (AE). اقرأ الحل سطرًا سطرًا." />
                <GeoFigure {...METHOD_DIVIDE.figure} />
                <MethodSteps method={{ source: METHOD_DIVIDE.source, exercise: METHOD_DIVIDE.exercise, solution: METHOD_DIVIDE.solution }} />
              </PredictRule>
              <TapQuestion
                prompt="لماذا القطع [BC] و [CD] و [DE] متقايسة؟"
                options={[
                  'لأن D نظيرة B بالنسبة إلى C ، و E نظيرة C بالنسبة إلى D',
                  'لأن المثلث ABC متقايس الأضلاع',
                  'لأن (MC) يوازي (AE)',
                ]}
                correct={0}
                cols={1}
                requires={['qitaa-mutaqayisa']}
                explain={<MathText>{'C منتصف [BD] فـ $BC = CD$ ، و D منتصف [CE] فـ $CD = DE$ : النظيرة تنقل الطول كما ينقله المدور. (لا شيء يقول إن ABC متقايس الأضلاع، والتوازي لا يعطي أطوالًا على (BE).)'}</MathText>}
                onAnswered={() => setQ4a(true)}
              />
              {q4a && (
                <TapQuestion
                  prompt={<MathText>{'في السطر (***) : لماذا $BM = MN$ ؟'}</MathText>}
                  options={[
                    'لأن C منتصف [BD] و (MC) يوازي (ND) في المثلث BDN',
                    <MathText key="b">{'لأن $BM = BC$'}</MathText>,
                    'لأن M منتصف [AB]',
                  ]}
                  correct={0}
                  cols={1}
                  requires={['mustaqim-muntasafayn']}
                  explain={<MathText>{'في المثلث BDN ، المستقيم الذي يشمل منتصف [BD] ويوازي (DN) يقطع [BN] في منتصفها M. (BM و BC ليسا على المستقيم نفسه، و M على ثلث [AB] لا منتصفها.)'}</MathText>}
                  onAnswered={() => setQ4(true)}
                />
              )}
              {q4 && <KnowledgeBrick id="tariqat-kitab-taqsim" lead="طريقتان، والفكرة واحدة: قطع متقايسة وموازيات." />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
