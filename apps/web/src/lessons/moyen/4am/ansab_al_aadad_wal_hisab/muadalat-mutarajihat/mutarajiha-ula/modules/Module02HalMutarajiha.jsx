import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PeerSheet } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { useModulePlayer } from '../../../../../../common/mission/useModulePlayer';
import RayFigure from '../components/RayFigure';
import GraphChoice from '../components/GraphChoice';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY_B } from '../content/textbook';
import { M2_ROUNDS } from '../content/rays';
import { PEER_SHEET, PEER_KID } from '../content/peerSheet';

/**
 * Module 2 — « الرمز والاتجاه » : حل متراجحة et le tableau, nombres de la plateforme (rollout 2026-11-11, verdict X1 : le livre ne paraît plus).
 *
 * PAGE : atelier à deux niveaux, UN instrument (solution-ray) — مبتدئ : x < 4 (la borne se lit ; l'élève pose le crochet et découvre quand il est tourné
 * vers le rouge) ; متقدم (ouvert par défaut) : −2x + 7 ≤ 9 — la borne se TROUVE par les essais, puis il transforme l'inéquation carte par carte ;
 * ÷(−2) en gardant ≤ est refusé par ses propres points rouges. AUCUNE étape n'attend `onFinished` : `onTrial` liste ses essais.
 *
 * LECTEUR DE MISSION (rollout 2026-11-11, unité 4 leçon 3 ; verdict L3) : le labo se joue en MANCHES (content/rays.js › M2_ROUNDS : x < 4 puis x ≤ 4 →
 * `2x + 7 ≤ 9` → `−2x + 7 ≤ 5`, deux jumelles qui ne diffèrent que par le SIGNE du coefficient → ⭐ → la droite libre). L'étape 1 attend la manche 1,
 * l'étape 2 la manche 3 (la porte ne saute jamais la 2) ; l'étape 3 est « ورقة لقمان ». NO BACK-AND-FORTH : le tableau et la question sont UN seul
 * bloc `data-paging-keep` ; le dessin répète la ligne résolue. LP : P2, P3.
 */
const ADV = ACTIVITY_B.ineq;
const BEG = 'x<4';

export default function Module02HalMutarajiha() {
  const player = useModulePlayer(MODULE_CTX);
  const [won, setWon] = useState({});
  const [log, setLog] = useState({ [BEG]: { traces: [], bracket: null, chain: [] }, [ADV]: { traces: [], bracket: null, chain: [] } });
  const [cps, setCps] = useState([]);
  const onCheckpoint = (src) => (e) => setCps((l) => [...l, { ...e, src }]);
  const answeredAdv = cps.some((e) => e.tk === 'checkpoint-done' && e.src === ADV);
  const answeredBeg = cps.some((e) => e.tk === 'checkpoint-done' && e.src === BEG);
  const [q2a, setQ2a] = useState(false);
  const [q2b, setQ2b] = useState(false);
  const [p2, setP2] = useState(false);
  const [peerDone, setPeerDone] = useState(false);

  const onTrial = (src) => (e) => setLog((l) => {
    const cur = l[src];
    if (e.kind === 'trace') return { ...l, [src]: { ...cur, traces: [...cur.traces.filter((u) => u.k !== e.k), e].sort((a, b) => a.k - b.k) } };
    if (e.kind === 'bracket') return { ...l, [src]: { ...cur, bracket: e } };
    if (e.kind === 'step') return { ...l, [src]: { ...cur, chain: [...cur.chain, e] } };
    return l;
  });

  const Evidence = ({ src, label }) => {
    const e = log[src];
    const empty = e.traces.length === 0;
    return (
      <li data-evidence={src} data-tried={empty ? 'false' : 'true'} className="space-y-1">
        <MathText>{label}</MathText>{' '}
        {empty ? <span className="text-slate-500">لم تجرّب بعد.</span> : (
          <span className="inline-flex flex-wrap gap-1" dir="ltr">
            {e.traces.map((t) => (
              <span key={t.k} className={`rounded px-1.5 font-mono text-xs font-bold ${t.ok ? 'bg-red-100 text-red-900' : 'bg-slate-200 text-slate-700'}`}>{t.x} {t.ok ? '●' : '○'}</span>
            ))}
          </span>
        )}
        {e.bracket && <span className="block text-xs text-red-900"><MathText>{`الرمز عند $${e.bracket.x}$ : الجزء الملوّن على ${e.bracket.side === 'left' ? 'اليسار' : 'اليمين'}، والرمز ${e.bracket.toward ? 'موجّه نحوه' : 'غير موجّه نحوه'}.`}</MathText></span>}
        {e.chain.length > 0 && (
          <span className="block text-xs text-indigo-900" dir="ltr">
            <MathText>{`$-2x + 7 \\leq 9 ${e.chain.map((s) => `\\xrightarrow{${s.opTex}} ${s.ineq}`).join(' ')}$`}</MathText>
          </span>
        )}
      </li>
    );
  };
  const evidence = (srcs) => (
    <ul className="space-y-2 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence>
      {srcs.map((s) => <Evidence key={s} src={s} label={s === ADV ? 'المتراجحة $-2x + 7 \\leq 9$ (المستوى المتقدّم):' : 'المتراجحة $x < 4$ (المستوى المبتدئ):'} />)}
    </ul>
  );
  const wonLine = (id, yes, no) => (
    <p className={`rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm ${won[id] ? 'font-bold text-emerald-900' : 'text-slate-500'}`}
      data-activity-evidence data-evidence={id} data-tried={won[id] ? 'true' : 'false'}>
      {won[id] ? <><span aria-hidden="true">✓ </span><MathText>{yes}</MathText></> : <MathText>{no}</MathText>}
    </p>
  );
  const lastRowQs = (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2" data-textbook-table>
        {ACTIVITY_B.table.map((row) => (
          <div key={row.inequality} className="space-y-1 rounded-xl border-2 border-slate-200 bg-white p-2">
            <p className="text-sm font-bold"><MathText>{row.inequality}</MathText></p>
            <p className="text-sm"><MathText>{row.words}</MathText></p>
            <RayFigure {...row.figure} label={row.graph.replace(/\$/g, '')} />
          </div>
        ))}
      </div>
      <TapQuestion
        prompt={<MathText>{`أتمم السطر الأخير من الجدول: ${ACTIVITY_B.lastRow} : حلول المتراجحة معبَّر عنها بجملة لغوية`}</MathText>}
        options={[
          <MathText key="a">{'كل قيم $x$ الأصغر من أو تساوي $-6$'}</MathText>,
          <MathText key="b">{ACTIVITY_B.words}</MathText>,
          <MathText key="c">{'كل قيم $x$ الأكبر من $-6$'}</MathText>,
        ]}
        correct={1}
        cols={1}
        requires={['hal-mutarajiha']}
        explain={<MathText>{'حلولها هي حلول $x \\geq -6$ ، والعدد $-6$ منها: $-6 \\geq -6$ صحيحة.'}</MathText>}
        onAnswered={() => setQ2a(true)}
      />
      {q2a && (
        <GraphChoice
          prompt={<MathText>{`${ACTIVITY_B.lastRow} : كل قيم $x$ الأكبر من أو تساوي $-6$ . التمثيل البياني لحلولها`}</MathText>}
          graph={{
            options: [
              { from: -10, to: 0, at: -6, side: 'right', closed: true },
              { from: -10, to: 0, at: -6, side: 'right', closed: false },
              { from: -10, to: 0, at: -6, side: 'left', closed: true },
            ],
            correct: 0,
            explain: 'الجزء الملوّن على يمين $-6$ ، و $-6$ حلّ فالرمز $[$ موجّه نحو الجزء الملوّن — كما في السطر $x \\leq 4$ الذي لوّنتَه في المختبر.',
          }}
          requires={['hal-mutarajiha']}
          onAnswered={() => setQ2b(true)}
        />
      )}
      {q2b && <KnowledgeBrick id="tamthil-jadwal" lead="ما رسمته على المستقيم، في جدول الأسطر:" />}
    </div>
  );

  const peerStep = { num: player ? 3 : 4, title: 'ورقة لقمان', subtitle: 'ابحث عن الخطأ وصحّحه', done: peerDone, content: <PeerSheet sheet={PEER_SHEET} kid={PEER_KID} onDone={() => setPeerDone(true)} /> };

  const playerSteps = [
    {
      needsRound: { id: 'r1', label: 'الجولة 1', icon: '📏', won: Boolean(won.r1) },
      num: 1, title: 'أتمم الأسطر', subtitle: 'من متراجحتيك في الجولة 1', done: q2a && q2b,
      content: (
        <div className="space-y-3">
          {wonLine('r1', 'الجولة 1: لوّنتَ حلول $x < 4$ ثم $x \\leq 4$ ، ورأيتَ أنّ الرمز يتّجه نحو الجزء الملوّن في الثانية فقط.', 'الجولة 1: لم تضع بعد الرمز على المتراجحتين.')}
          <div data-paging-keep>{lastRowQs}</div>
        </div>
      ),
    },
    {
      needsRound: { id: 'r3', label: 'الجولة 3', icon: '📏', won: Boolean(won.r3) },
      num: 2, title: 'ما الذي اختلف بين الجولتين؟', subtitle: 'من جولتيك 2 و 3', done: p2,
      content: (
        <div className="space-y-3">
          {wonLine('r3', 'الجولتان 2 و 3: حوّلتَ $2x + 7 \\leq 9$ ثم $-2x + 7 \\leq 5$ إلى $x$ وحده؛ الحدّ الفاصل واحد، لكنّ الأحمر انتقل إلى الجهة الأخرى.', 'الجولة 3: لم تحوّل بعد المتراجحة ذات المعامل السالب.')}
          <TapQuestion
            prompt={<MathText>{'بين المتراجحتين $2x + 7 \\leq 9$ و $-2x + 7 \\leq 5$ : ما الذي اختلف ويفسّر انتقال الأحمر؟'}</MathText>}
            options={[
              'إشارة معامل x : موجب في الأولى وسالب في الثانية',
              'العدد الذي طرحناه من الطرفين',
              'الحدّ الفاصل بين الحلول وغيرها',
            ]}
            correct={0}
            cols={1}
            requires={['hal-mutarajiha']}
            explain={<MathText>{'طرحنا 7 في الجولتين، والحدّ الفاصل هو 1 فيهما. اختلف معامل $x$ : قسمتَ على $2$ فبقي الاتجاه، وعلى $-2$ فتغيّر.'}</MathText>}
            onAnswered={() => setP2(true)}
          />
        </div>
      ),
    },
    peerStep,
  ];

  const pageSteps = [
    {
      num: 1, title: 'لماذا رفضت نقاطك الحمراء الاتجاه بعد القسمة على −2؟', subtitle: 'حوّل المتراجحة في المستوى المتقدّم، ثم أجب', done: answeredAdv,
      content: (
        <div className="space-y-3">
          {evidence([ADV])}
          <p data-evidence="checkpoint" data-tried={answeredAdv ? 'true' : 'false'}
            className={`rounded-xl border-2 px-3 py-2 text-sm ${answeredAdv ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
            {answeredAdv
              ? 'أجبتَ في المختبر: نقاطك الحمراء تبقى حلولًا بعد كل خطوة، ولذلك انعكس الاتجاه عند القسمة على عدد سالب وبقي كما هو في الباقي.'
              : 'حوّل المتراجحة في المستوى المتقدّم حتى يبقى x وحده، ثم أجب عن الأسئلة التي تظهر فوق المختبر.'}
          </p>
        </div>
      ),
    },
    { num: 2, title: 'أتمم السطر الأخير من الجدول', subtitle: 'السطران الأوّلان من جدول أسطر', done: q2a && q2b, content: <div className="space-y-3">{evidence([ADV])}{lastRowQs}</div> },
    {
      num: 3, title: 'الرمز عند 4', subtitle: 'جرّب المستوى المبتدئ، ثم أجب', done: answeredBeg,
      content: (
        <div className="space-y-3">
          {evidence([BEG])}
          <p data-evidence="checkpoint" data-tried={answeredBeg ? 'true' : 'false'}
            className={`rounded-xl border-2 px-3 py-2 text-sm ${answeredBeg ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
            {answeredBeg
              ? 'أجبتَ في المختبر: الرمز يُوجَّه نحو الجزء الملوّن حين يكون الحدّ حلًّا، وبعيدًا عنه حين لا يكون.'
              : 'ثبّت الرمز في المستوى المبتدئ، ثم أجب عن الأسئلة التي تظهر فوق المختبر.'}
          </p>
        </div>
      ),
    },
    peerStep,
  ];

  return (
    <ContentModule
      objectives={['أين تبدأ حلول المتراجحة وأين تنتهي؟', 'متى يتغيّر اتجاه المتراجحة؟ ومتى يبقى؟', 'متى يكون الحدّ نفسه حلًّا؟ وكيف نبيّن ذلك على المستقيم؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="نشاط — الرمز والاتجاه"
      moduleSubtitle="من المتراجحة إلى نصف مستقيم ملوّن"
      estimatedTime="11 دقيقة"
      intro={(
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="lab-ray-m2" rounds={M2_ROUNDS} icon="📏" freeIcon="📐"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
            <ManipulationWorkspace
              defaultLevel="beginner"
              levels={{
                beginner: () => (
                  <Manipulation type="solution-ray" level="beginner" ineq={BEG}
                    lead="سطر الجدول الأوّل: جرّب قيمًا، منها 4 نفسه، ثم ضع الرمز ووجّهه."
                    onTrial={onTrial(BEG)} onCheckpoint={onCheckpoint(BEG)} />
                ),
                advanced: () => (
                  <Manipulation type="solution-ray" level="advanced" ineq={ADV}
                    lead="ابحث بتجاربك عن الحدّ، ثبّت التمثيل، ثم حوّل المتراجحة خطوة خطوة."
                    onTrial={onTrial(ADV)} onCheckpoint={onCheckpoint(ADV)} />
                ),
              }}
            />
          )}
        />
      )}
      steps={player ? playerSteps : pageSteps}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
