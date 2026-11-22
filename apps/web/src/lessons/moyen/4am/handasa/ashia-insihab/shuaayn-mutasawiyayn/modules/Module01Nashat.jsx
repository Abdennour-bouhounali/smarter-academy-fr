import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY, ACTIVITY_LINES, LAB } from '../content/textbook';
import { FIG_ACT2B } from '../content/figures';

/**
 * Module 1 — نشاط 2 ب (p. 129), ouvert sur LA BANDEROLE DU TIFO (parallelogram-pin).
 *
 * REAL / DISCOVER / MANIPULATE  le lab à deux niveaux, même objectif :
 *   مبتدئ (ouvert par défaut : le نشاط 2 ب n'est PAS le niveau avancé du lab) : le foulard [AB] coupé en 8 parts, le
 *          capo I que l'élève déplace ; AI et IB comparés (منحى، اتجاه، طول), la flèche IB retournée en BI ;
 *   متقدم : la banderole de la طريقة p. 131 (D image de C, puis E) — à un onglet, reprise au module 3.
 * UNDERSTAND  la question « متى AI = IB ؟ » sous les essais de l'élève (`onTrial`, `[data-activity-evidence]`) ; puis le
 *           نشاط 2 ب sur sa figure (FIG_ACT2B) : O milieu de [BC] et [AD] ⇒ AB = CD ; AC et DB de sens contraires.
 * FORMALIZE  la brique muntasaf-mushtarak (le « متوازي أضلاع مسطّح »).
 * RÉTROFIT 2026-10-15 (§4quater) : plus de carte du manuel ; le labo ouvre le module sans titre ni `lead` de workspace (le contexte du
 * tifo est dans le `lead` du labo) ; l'étape 1 ne re-pose plus « متى AI = IB ؟ » (le labo le demande) mais POURQUOI les mêmes
 * منحى et اتجاه ne suffisent pas, sur les propres essais de l'élève ; la brique reste APRÈS l'étape 3.
 * AUCUNE étape n'attend `onFinished`. LP : P1, P2.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const KIND = { equal: 'متساويان', length: 'الطول مختلف', sense: 'اتجاهان متعاكسان', both: 'المنحى فقط' };

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint, rubriques equal · length) : leur trace (`checkpoint-done`) fait avancer l'étape 1
  const [cpDone, setCpDone] = useState({});
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const onTrial = (ev) => {
    if (ev?.tk === 'checkpoint-done') { setCpDone((d) => ({ ...d, [ev.id]: true })); return; }
    if (ev?.mode === 'midpoint') setTrials((s) => [...s, ev].slice(-8));
  };

  const evidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={trials.length ? 'true' : 'false'}>
      {trials.length === 0 ? (
        <p className="text-slate-500">لم تسجّل بعد أي موضع (المستوى «مبتدئ»: حرّك القائد I على الوشاح واتركه، واقلب السهم الثاني).</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">مواضعك على الوشاح:</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="trials">
            {trials.map((t) => (
              <li key={t.n} className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${t.kind === 'equal' ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-slate-300 bg-slate-50 text-slate-700'}`} data-evidence-trial={t.k}>
                I عند القسم {t.k} من {t.N} — <bdi dir="ltr" className="font-mono">AI · {t.second}</bdi>: {KIND[t.kind]}
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
      moduleNumber={1} objectives={['متى يكون الشعاعان AI و IB متساويين؟', 'ماذا يعني أن يكون للقطعتين نفس المنتصف؟', 'هل يكفي أن يتساوى الطولان لنقول إنّ شعاعين متساويان؟']}
      moduleTitle="نشاط 2 ب — منتصف مشترك على مستقيم"
      moduleSubtitle="متى يكون شعاعان متساويين؟ القائد على الوشاح، ثم النقط على المستقيم (d)"
      estimatedTime="12 دقيقة"
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="parallelogram-pin"
                level="beginner"
                {...LAB.beginner.numbers}
                theme="tifo"
                lead="في مدرّجات ملعب 5 جويلية يرفع مشجّعان وشاحًا مقسّمًا إلى 8 أقسام متقايسة."
                onTrial={onTrial}
              />
            ),
            advanced: () => (
              <Manipulation
                type="parallelogram-pin"
                level="advanced"
                {...LAB.advanced.numbers}
                theme="tifo"
              />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا لا يكفي أن تكون I بين A و B؟', subtitle: 'عن مواضعك على الوشاح', done: !!cpDone.length,
          content: (
            <div className="space-y-3">
              {evidence}
              {cpDone.length && (
                <p className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900" data-evidence="midpoint-answered">
                  <MathText>{'أجبتَ في المختبر: بين A و B للشعاعين $\\overrightarrow{AI}$ و $\\overrightarrow{IB}$ دائما نفس المنحى ونفس الاتجاه، والطولان لا يتساويان إلا في المنتصف.'}</MathText>
                </p>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'نشاط 2 ب: منتصف واحد', subtitle: 'السؤال 1', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY.text} source={ACTIVITY.source} compact />
              <p className="text-xs text-slate-500" data-scan-note>{ACTIVITY.scanNote}</p>
              <GeoFigure {...FIG_ACT2B} />
              <TapQuestion
                prompt="لماذا O منتصف [BC]؟"
                options={[
                  'OC = OA + AC و OB = OD + DB، و OA = OD و AC = DB (الترميز)، إذن OC = OB',
                  'لأن O تقع بين B و C', // nécessaire, pas suffisant
                  'لأن OA = OD', // c'est le milieu de [AD], pas celui de [BC]
                ]}
                correct={0}
                cols={1}
                requires={['muntasaf-qita']}
                explain={<MathText>{ACTIVITY_LINES.midBC}</MathText>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'نشاط 2 ب: العلاقة بين الشعاعين', subtitle: 'استنتج', done: q3,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_ACT2B} />
              <TapQuestion
                prompt={<MathText>{'للقطعتين [BC] و [AD] نفس المنتصف O. العلاقة بين $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ :'}</MathText>}
                options={[
                  '$\\overrightarrow{AB} = \\overrightarrow{CD}$',
                  '$\\overrightarrow{AB} = \\overrightarrow{DC}$', // DC va vers la gauche
                  'لا علاقة: النقط على استقامة واحدة', // l'égalité vaut aussi pour des points alignés
                ].map(M)}
                correct={0}
                cols={1}
                requires={['tasawi-shuaayn', 'shuaa-mutawazi']}
                explain={<MathText>{`${ACTIVITY_LINES.abcd} ($\\overrightarrow{DC}$ يتجه نحو اليسار.)`}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="muntasaf-mushtarak" lead="ما وجدته، بكلمات النشاط:" />}
            </div>
          ),
        },
        {
          num: 4, title: 'نشاط 2 ب: الشعاعان AC و DB', subtitle: 'السؤال 2', done: q4,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_ACT2B} />
              <TapQuestion
                prompt={<MathText>{'قارن بين الشعاعين $\\overrightarrow{AC}$ و $\\overrightarrow{DB}$ :'}</MathText>}
                options={[
                  'لهما نفس المنحى ونفس الطول، لكن اتجاهين متعاكسين: ليسا متساويين',
                  'متساويان لأن AC = DB', // la longueur seule ne suffit pas (MISC-SHUAA-TUL-FAQAT)
                  'ليس لهما نفس المنحى', // tous deux sur (d)
                ].map(M)}
                correct={0}
                cols={1}
                requires={['tasawi-shuaayn']}
                explain={<MathText>{ACTIVITY_LINES.acdb}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <Feedback tone="ok">كما على الوشاح: الطول وحده لا يكفي، والاتجاه يحسم.</Feedback>}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
