import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Minus, Plus, Eye } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import MathText from '../../components/MathText';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { LabCard, StageFrame, PromptCard, VerdictBanner, RoundButton } from '../primitives/LabKit';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { LEVELS } from '../levels';
import * as L from '../logic/waxCells';
import { COL, Hive, Flower, Bee, HexIcon, Student } from './waxCells/art';

/**
 * wax-cells — LE NOMBRE DE CELLULES SOUS LA MAIN (2AM, unité 4, درس « إنتاج عبارة حرفية واستعمالها », 2026-10-29). La logique, exacte, est dans `logic/waxCells.js` (un décompte d'ARÊTES du dessin ; les maths de la règle viennent de
 * `equation2.js` E1, importé par chemin). Thème `apiary` : le منحل du grand-père, un cadre en bois qui porte un rang de cellules hexagonales en tiges de cire ; deux cellules voisines PARTAGENT une tige.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tient n, le NOMBRE DE CELLULES du rang : elle glisse une cellule du plateau au bout du rang (elle se colle), reprend la dernière, ou −/+ « خلية », ← →. Puis elle ÉCRIT la règle avec la lettre n (puces n, chiffres, + − × ( )).
 * B. Le dessin répond : l'ardoise du compteur (le décompte des tiges DESSINÉES), puis, dès la troisième cellule, le tableau n / tiges.
 * C. La résistance : le cadre ne tient que 8 cellules et le plateau 50 tiges : la valeur de 40 cellules se CALCULE. Au niveau متقدم le compteur est caché jusqu'à ce que le nombre soit tapé.
 * D. La phase formelle écrit ce que l'élève a fait : عدد الأعواد = 5 × n + 1 = 5n + 1 ; من أجل n = 40 : 5 × 40 + 1 = 201.
 * E. Les fausses règles sont refutées par le DESSIN : 6n (les tiges partagées clignotent en rouge, « عُدّت مرّتين »), 5n (la première tige est en pointillé, « نسيتها »), 5n + 6 ; une colonne rouge dans le tableau.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        une lettre représente un nombre qui varie ; une expression littérale écrit le décompte d'un motif pour TOUT n
 *   OBJECT         un rang (ou une bande de deux rangs) de cellules hexagonales en tiges de cire, un plateau de 50 tiges, un cadre de 8 cellules
 *   VARIABLE       n, le nombre de cellules du rang (m, les colonnes d'une bande, au niveau متقدم)
 *   INVARIANT      les tiges partagées sont comptées UNE fois ; chaque cellule nouvelle ajoute le même nombre de tiges
 *   TRANSFORMATION n → le décompte d'arêtes du dessin
 *   CONSTRAINT     le cadre et le plateau limitent ce qu'on peut construire ; la règle doit être juste sur chaque rang construit
 *   RESISTANCE     les modèles faux (6n, 5n, 5n + 6) sont refusés et dessinés
 *   EVIDENCE       le compteur, le tableau, les tiges qui clignotent, la première tige en pointillé
 *   CONTRAST       un rang (5n + 1) contre une bande (8n + 3) ; une lettre contre deux
 *   PREDICTION     (متقدم) le nombre de tiges est tapé avant d'être montré
 *   DISCOVERY      « كيف نكتب عدد الأعواد لصفّ من n خلية ؟ »
 *   FORMALIZATION  5 × n + 1 = 5n + 1, puis la valeur pour n = 40
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * « جرّب كل الإمكانيات » : NON. « جرّب أعدادك » est TOUJOURS ouvert sous le labo (jamais compté). ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/waxCells.js › coachOf` (drag · count · table · predict · rule · far · compare · next).
 * Props : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished()`.
 * CONTRAT DOM : [data-wax-cells][data-level][data-task][data-n][data-m][data-solved][data-layout], [data-wc-scene], [data-wc-tray], [data-wc-cell=<row>-<i>], [data-wc-rod=<clé>][data-shared][data-blink], [data-wc-counter],
 * [data-wc-table] + [data-wc-col=<n>][data-verdict], [data-wc-less|more] (cellules), [data-wc-less-m|more-m], [data-wc-rule], [data-wc-input], [data-wc-judge], [data-wc-predict], [data-wc-far], [data-wc-compare],
 * [data-wc-model], [data-wc-verdict], [data-wc-next], [data-wc-step=<i>], [data-wc-free][data-active], [data-wc-free-start], [data-wc-free-back], [data-wc-formal], [data-wc-context], [data-wc-prompt].
 */
const NS = 'manipulation.waxCells';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const WIDE_MIN = 700;
const SIDE_W = 236;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-amber-300';
const $ = (s) => `$${s}$`;

const UX = 20;                 // pixels par unité en x (une cellule = 2 unités)
const UY = 11.55;              // pixels par unité en y (hexagone régulier)
const RULE_CHIPS = ['n', '+', '−', '×', '(', ')'];

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['wax-cells'][lv].numbers;
  return { tasks: tasks ?? asked.tasks };
}

export default function WaxCells({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'wax-cells', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const cur = L.taskOf(lab);
  const cpSettings = useLabCheckpointSettings('wax-cells');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[cur.id] ?? null : null;
  const ruleByCheckpoint = cpOn && cpSettings.enabled && lab.tasks.some((tk) => CHAINS[tk.id]?.includes('rule'));
  const cp = useLabCheckpoint({
    id: chain ? cur.id : null,
    questions: chain && L.taskDone(lab) ? chain.map((q) => QUESTIONS[q](lab, cur, k)) : null,
    reached: L.taskDone(lab),
    resetKey: scene.inits,
    onRetry: () => setLab(L.restartTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (CHAINS[id]?.includes('rule')) { state.discover(); state.formalize(); } },
  });
  const ready = L.discoveryReady(lab) && !ruleByCheckpoint;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  const finishedOnce = useRef(false);
  const finished = ruleByCheckpoint ? lab.tasks.every((_, i) => !!lab.done[i]) : ready;
  useEffect(() => {
    if (!finished) { finishedOnce.current = false; return; }
    if (!finishedOnce.current) { finishedOnce.current = true; state.report(onFinished, {}); }
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps
  const reported = useRef(0);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials < reported.current) reported.current = 0;
    for (let i = reported.current; i < nTrials; i += 1) state.report(onTrial, L.trialEvidence(lab.trials[i]));
    reported.current = nTrials;
  }, [nTrials, lab.trials]); // eslint-disable-line react-hooks/exhaustive-deps

  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'wax-cells', step: coachStep,
    text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });

  const boxRef = useRef(null);
  const [width, setWidth] = useState(640);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => setWidth(Math.max(300, Math.floor(el.clientWidth)));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 720;
  const advanced = lab.tasks[0].predict;

  const discovery = (
    <ManipulationDiscovery state={state} prompt={<MathText>{k('discovery.prompt')}</MathText>} options={ruleOptions(k)} formal={<Formal lab={lab} k={k} />} />
  );

  return (
    <ManipulationShell
      type="wax-cells"
      title={title ?? k('title')}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      coach={coachOn ? coach : null}
      headerAction={cpOn ? cpSettings.control : null}
      guided={!!chain || ruleByCheckpoint}
      hints={[0, 1, 2].map((i) => k(`hints.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={discovery}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-amber-50/70 to-white">
        <div ref={boxRef} className="space-y-2" data-wax-cells data-level={advanced ? 'advanced' : 'beginner'} data-task={lab.free ? 'free' : lab.ti}
          data-n={lab.w.n} data-m={lab.w.m} data-solved={finished ? 'true' : 'false'} data-layout={width >= WIDE_MIN ? 'wide' : 'narrow'}>
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} advanced={advanced} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, screenH, lead, cp, advanced }) {
  const wide = width >= WIDE_MIN;
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const done = L.taskDone(lab);
  const lit = !free && done;
  const w = lab.w;
  const last = lab.last;

  /* ── la consigne : le contexte puis UNE question ── */
  const ctx = (() => {
    if (lead && lab.ti === 0 && !free) return lead;
    if (free) return k('ctx.free');
    return k(`ctx.${task.id}`, { n: iso(L.FAR_N) });
  })();
  const question = free ? k('q.free') : k(`q.${task.id}`);

  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-wc-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le son (muet sauf « الصوت ») : un déclic par cellule posée ou reprise, le drapeau pour une règle ou une valeur juste, « over » sur un refus, la cloche à la fin ── */
  const sfxRef = useRef({ n: w.n, m: w.m, key: '' });
  const sfxKey = `${free ? 'free' : lab.ti}`;
  useEffect(() => {
    const p = sfxRef.current;
    if (p.key !== sfxKey) { sfxRef.current = { n: w.n, m: w.m, key: sfxKey }; return; }
    const d = (w.n - p.n) + (w.m - p.m);
    if (d !== 0) playSfx('gesture', { pitch: d > 0 ? 1 : 0.75 });
    p.n = w.n; p.m = w.m;
  }, [w.n, w.m, sfxKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (!nTrials) return;
    const tr = lab.trials[nTrials - 1];
    if (tr.kind === 'solved') playSfx('bell');
    else if ((tr.kind === 'rule' || tr.kind === 'predict' || tr.kind === 'far') && tr.ok) playSfx('flag');
    else if (tr.kind === 'rule' || tr.kind === 'predict' || tr.kind === 'far') playSfx('over');
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = (
    <PromptCard size={wide ? 'lg' : 'md'} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-wc-context': free ? 'free' : task.id }}
      title={<MathText>{question}</MathText>} titleClassName={wide ? 'text-xl' : 'text-lg'} lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-wc-prompt': task.id, 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le verdict : la CONSÉQUENCE avec les nombres de l'élève, jamais la règle ── */
  const flag = lab.flag;
  const verdictLine = (() => {
    if (flag?.compare) return k('v.compareDone');
    if (last?.kind === 'rule' && last.ok) return k('v.ruleOk');
    if (last?.kind === 'rule') {
      if (flag?.unreadable) return k('v.unreadable');
      const row = flag?.rows?.find((r) => r.n === flag.column) ?? flag?.rows?.[0];
      return k(`m.${flag?.model ?? 'other'}`, { n: iso(row?.n ?? ''), rule: iso(row?.rule ?? ''), real: iso(row?.real ?? '') });
    }
    if (last?.kind === 'predict') return last.ok ? k('v.predictOk') : k('v.predictNo', { n: iso(last.n) });
    if (last?.kind === 'far') return last.ok ? k('v.farOk') : k('v.farNo');
    if (w.phase === 'compare') return k('v.compareIdle');
    if (w.phase === 'far') return k(task.kind === 'two' ? 'v.farIdleTwo' : 'v.farIdle');
    if (w.phase === 'rule') return k(w.visited.length >= 3 || task.kind === 'two' ? 'v.ruleIdle' : 'v.ruleBuild');
    if (done) return L.discoveryReady(lab) ? k('v.allDone') : k('v.taskDone');
    if (L.counterHidden(lab)) return k('v.predictIdle');
    return k('v.idle');
  })();
  const bad = !!(last && ((last.kind === 'rule' || last.kind === 'predict' || last.kind === 'far') && !last.ok));
  const good = !bad && !!last && ((last.kind === 'rule' || last.kind === 'predict' || last.kind === 'far') && last.ok);
  const tone = bad ? 'rose' : good ? 'emerald' : 'amber';
  const Icon = bad ? Sparkles : good ? CheckCircle2 : Hand;
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = bad ? 'wonder' : done ? 'proud' : 'happy';
  const banner = (
    <VerdictBanner tone={tone} icon={wide ? Icon : null} size="sm" className="min-h-[3.5rem]" data-wc-verdict={bad ? 'bad' : good ? 'good' : ''}>
      <div className="min-w-0 space-y-1.5">
        <p className={last ? '' : 'font-bold text-amber-950'}><MathText>{verdictLine}</MathText></p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-wc-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );

  const stageW = Math.min(520, Math.max(300, (wide ? width - SIDE_W - 12 : width) - 24));
  const stage = <Apiary lab={lab} setLab={setLab} k={k} width={stageW} screenH={screenH} mood={mood} girl={advanced} />;
  const table = L.discoveryReady(lab) || w.visited.length >= 3 || task.kind === 'two' ? <Table lab={lab} k={k} /> : null;
  const tools = <Tools lab={lab} setLab={setLab} k={k} />;

  return (
    <>
      <div className="relative space-y-2" data-wc-glance>
        {party.node}
        {cp.node}
        {prompt}
        {wide ? (
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <StageFrame className="min-w-0 space-y-1 overflow-hidden p-3" data-wc-stage>
                {steps ? <div className="flex flex-wrap items-center justify-end gap-x-3">{steps}</div> : null}
                {stage}
              </StageFrame>
              {tools}
              {table}
            </div>
            <div className="flex shrink-0 flex-col gap-2.5" style={{ width: SIDE_W }}>{banner}</div>
          </div>
        ) : (
          <>
            <StageFrame className="min-w-0 space-y-1 overflow-hidden p-2" data-wc-stage>{steps || null}{stage}</StageFrame>
            {tools}
            {table}
            {banner}
          </>
        )}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ Le rucher : le cadre, le plateau, les cellules ══════════════ */

const px = (x, ox, sc) => ox + x * UX * sc;
const py = (y, oy, sc) => oy + y * UY * sc;

function Apiary({ lab, setLab, k, width, screenH, mood, girl }) {
  const task = L.taskOf(lab);
  const w = lab.w;
  const two = task.kind === 'two';
  const strip = task.strip;
  const sc = two ? 0.68 : 1;
  const cellW = 2 * UX * sc;
  const SIDE = 74;
  const frameCells = two ? L.FRAME_MAX : task.max;
  const frameW = frameCells * cellW + 16;
  const W = Math.round(SIDE + frameW + 20);
  const rowH = 4 * UY * sc;
  const stripH = rowH + 3 * UY * sc;
  const TOP = 30;
  const rowTop = TOP + 8;
  const frameH1 = two ? rowH + 16 : (strip ? stripH : rowH) + 16;
  const stripTop = two ? rowTop + frameH1 + 6 : 0;
  const frameH2 = stripH + 16;
  const trayTop = two ? stripTop + frameH2 + 6 : TOP + frameH1 + 6;
  const H = Math.round(trayTop + 56);
  const fx0 = SIDE; // bord gauche du cadre
  const ox = fx0 + 8 + UX * sc;  // x pixel du centre d'une cellule de colonne 0 (cx = 0 → ox)
  const rowOy = rowTop + 8 + 2 * UY * sc;           // y pixel du centre d'une cellule de rang 0
  const stripOy = stripTop + 8 + 2 * UY * sc;
  const hMax = screenH >= 900 ? 270 : 230;
  const svgRef = useRef(null);
  const [drag, setDrag] = useState(null);   // { from: 'tray' | 'row', x, y }
  const pt = (e) => {
    const box = svgRef.current.getBoundingClientRect();
    return { x: ((e.clientX - box.left) / Math.max(1, box.width)) * W, y: ((e.clientY - box.top) / Math.max(1, box.height)) * H };
  };
  const startTray = (e) => { if (w.phase === 'done' || w.phase === 'compare' || L.full(lab)) return; svgRef.current.setPointerCapture?.(e.pointerId); setDrag({ from: 'tray', ...pt(e) }); };
  const startRow = (e) => { if (w.n < 1 || w.phase === 'done') return; svgRef.current.setPointerCapture?.(e.pointerId); setDrag({ from: 'row', ...pt(e) }); };
  const move = (e) => { if (drag) setDrag({ ...drag, ...pt(e) }); };
  const up = (e) => {
    if (!drag) return;
    const p = pt(e);
    const inFrame = p.x > fx0 - 10 && p.x < fx0 + frameW + 10 && p.y > TOP - 10 && p.y < trayTop;
    if (drag.from === 'tray' && inFrame) setLab(L.snap);
    if (drag.from === 'row' && p.y >= trayTop - 4) setLab(L.lift);
    setDrag(null);
  };
  const key = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); setLab(L.snap); }
    if (e.key === 'ArrowRight') { e.preventDefault(); setLab(L.lift); }
  };

  const rowC = strip && !two ? [] : L.centersFor(w.n, false);
  const rowRods = w.n ? L.rodsOf(rowC) : { edges: new Map(), count: 0, shared: [] };
  const stripN = two ? w.m : w.n;
  const stripC = (two || strip) && stripN ? L.centersFor(stripN, true) : [];
  const stripRods = stripC.length ? L.rodsOf(stripC) : { edges: new Map(), count: 0, shared: [] };
  const hidden = L.counterHidden(lab);
  const blink = w.rodBlink;
  const drawRods = (rods, oy, scale, rowOnly) => [...rods.edges].map(([e, c]) => {
    const [a, b] = e.split('|').map((v) => v.split(',').map(Number));
    const shared = c > 1;
    const isFirst = rowOnly && a[0] === -1 && b[0] === -1 && a[1] !== b[1];
    const red = (blink === 'shared' && shared) ? COL.rodRed : COL.rod;
    return (
      <line key={`${oy}-${e}`} x1={px(a[0], ox, scale)} y1={py(a[1], oy, scale)} x2={px(b[0], ox, scale)} y2={py(b[1], oy, scale)}
        stroke={isFirst && blink === 'first' ? COL.rodRed : shared ? (red === COL.rodRed ? red : COL.rodShared) : COL.rod}
        strokeWidth={(shared ? 7 : 5) * Math.max(scale, 0.8)} strokeLinecap="round" strokeDasharray={isFirst && blink === 'first' ? '4 6' : undefined}
        className={shared && blink === 'shared' ? 'wc-blink' : undefined}
        data-wc-rod={e} {...(shared ? { 'data-shared': 'true' } : {})} {...(shared && blink === 'shared' ? { 'data-blink': 'true' } : {})} />
    );
  });

  return (
    <div className="space-y-1" data-wc-scene-box>
      <style dangerouslySetInnerHTML={{ __html: '@keyframes wc-blink { 0%,100% { opacity: 1 } 50% { opacity: 0.25 } } .wc-blink { animation: wc-blink 700ms ease-in-out 3; } @media (prefers-reduced-motion: reduce) { .wc-blink { animation: none !important; } }' }} />
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: Math.min(W * 1.2, width), maxHeight: hMax, display: 'block', margin: '0 auto', touchAction: 'none', direction: 'ltr' }} role="group" aria-label={k('stageAria')}
        data-wc-scene dir="ltr" onPointerMove={move} onPointerUp={up} onPointerCancel={() => setDrag(null)}>
        <rect x={0} y={0} width={W} height={H} rx={12} fill={COL.sky} />
        <rect x={0} y={H * 0.55} width={W} height={H * 0.45} fill={COL.skyLow} opacity={0.7} />
        <path d={`M0 ${H - 40} Q${W * 0.25} ${H - 66} ${W * 0.5} ${H - 44} T${W} ${H - 48} V${H} H0 Z`} fill={COL.hill} aria-hidden="true" />
        <path d={`M0 ${H - 22} Q${W * 0.3} ${H - 40} ${W * 0.6} ${H - 24} T${W} ${H - 26} V${H} H0 Z`} fill={COL.hill2} aria-hidden="true" />
        <Hive x={W - 26} y={H - 28} s={0.9} />
        <Hive x={W - 58} y={H - 22} s={0.7} />
        <Flower x={SIDE - 20} y={H - 18} c="#F472B6" />
        <Flower x={W - 90} y={H - 14} c="#FB923C" />
        <Bee x={W - 40} y={TOP + 4} s={0.9} />
        <Bee x={fx0 + frameW * 0.35} y={TOP - 8} s={0.7} />
        {/* le cadre en bois : le support du rang */}
        <rect x={fx0} y={rowTop - 8} width={frameW} height={frameH1} rx={5} fill="#FFF7E0" stroke={COL.wood} strokeWidth={5} aria-hidden="true" data-wc-frame />
        {two && <rect x={fx0} y={stripTop - 8} width={frameW} height={frameH2} rx={5} fill="#FFF7E0" stroke={COL.wood} strokeWidth={5} aria-hidden="true" />}
        {/* le gabarit : les 8 (ou 6) cases vides du cadre */}
        {Array.from({ length: frameCells }, (_, i) => <HexIcon key={`g${i}`} cx={ox + 2 * i * UX * sc} cy={rowOy} r={(2 * UX * sc) / 1.732} fill="none" stroke="#E7D3A6" style={{ strokeDasharray: '3 3', strokeWidth: 1.2 }} />)}
        {two && Array.from({ length: L.STRIP_MAX }, (_, i) => <HexIcon key={`s${i}`} cx={ox + 2 * i * UX * sc} cy={stripOy} r={(2 * UX * sc) / 1.732} fill="none" stroke="#E7D3A6" style={{ strokeDasharray: '3 3', strokeWidth: 1.2 }} />)}
        {/* les cellules : le remplissage puis les tiges (les arêtes du dessin) */}
        {rowC.map(([cx, cy], i) => <HexIcon key={`c${i}`} cx={px(cx, ox, sc)} cy={py(cy, rowOy, sc) * 1} r={(2 * UX * sc) / 1.732} fill={COL.cell} stroke="none" opacity={0.55} data-wc-cell={`0-${i}`} />)}
        {stripC.map(([cx, cy], i) => <HexIcon key={`t${i}`} cx={px(cx, ox, sc)} cy={py(cy, two ? stripOy : rowOy, sc)} r={(2 * UX * sc) / 1.732} fill={COL.cell} stroke="none" opacity={0.55} data-wc-cell={`1-${i}`} />)}
        {!two && !strip && drawRods(rowRods, rowOy, sc, true)}
        {strip && !two && drawRods(stripRods, rowOy, sc, false)}
        {two && drawRods(rowRods, rowOy, sc, true)}
        {two && drawRods(stripRods, stripOy, sc, false)}
        {/* la dernière cellule se reprend (glisser vers le plateau) */}
        {w.n > 0 && (
          <g onPointerDown={startRow} style={{ cursor: 'grab', touchAction: 'none' }} data-wc-lift aria-hidden="true">
            <rect x={px(2 * (w.n - 1), ox, sc) - cellW / 2} y={rowOy - 2 * UY * sc} width={cellW} height={rowH} fill="transparent" />
          </g>
        )}
        {/* l'ardoise du compteur */}
        <g data-wc-counter data-hidden={hidden ? 'true' : 'false'} aria-live="polite" aria-label={k('counterAria')}>
          <rect x={6} y={TOP - 14} width={SIDE - 14} height={46} rx={6} fill={COL.slate} stroke={COL.woodDark} strokeWidth={3} />
          <text x={6 + (SIDE - 14) / 2} y={TOP + 1} textAnchor="middle" fontSize={9.5} fontWeight={800} fill={COL.chalk}>{k('counterLabel')}</text>
          <text x={6 + (SIDE - 14) / 2} y={TOP + 24} textAnchor="middle" fontSize={22} fontWeight={900} fill="#FDE68A" data-wc-counter-value>{hidden ? '؟' : L.drawn(lab)}</text>
        </g>
        {/* le plateau : des tiges et la cellule à glisser */}
        <g data-wc-tray data-full={L.full(lab) ? 'true' : 'false'} role="button" tabIndex={0} aria-label={k('trayAria')} onKeyDown={key} onPointerDown={startTray} style={{ cursor: L.full(lab) ? 'not-allowed' : 'grab', touchAction: 'none' }} className={ring}>
          <rect x={fx0} y={trayTop} width={frameW} height={44} rx={8} fill={COL.tray} stroke={COL.woodDark} strokeWidth={3} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <line key={i} x1={fx0 + 70 + i * 16} y1={trayTop + 10 + (i % 2) * 6} x2={fx0 + 92 + i * 16} y2={trayTop + 34 - (i % 2) * 6} stroke={COL.rod} strokeWidth={5} strokeLinecap="round" opacity={0.9} />)}
          <HexIcon cx={fx0 + 28} cy={trayTop + 22} r={16} fill={L.full(lab) ? '#E5E7EB' : COL.cell} stroke={COL.rodDark} />
          <rect x={fx0 + frameW - 142} y={trayTop + 8} width={134} height={28} rx={14} fill="#FFFBEB" stroke={COL.woodDark} strokeWidth={1.6} />
          <text x={fx0 + frameW - 75} y={trayTop + 27} textAnchor="middle" fontSize={10.5} fontWeight={900} fill="#78350F" data-wc-tray-count>{k('trayCount', { n: Math.max(0, L.TRAY_RODS - L.drawn(lab)) })}</text>
        </g>
        {drag && <HexIcon cx={drag.x} cy={drag.y} r={(2 * UX * sc) / 1.732 + 2} fill={COL.cell} stroke={COL.flag} style={{ pointerEvents: 'none', opacity: 0.85 }} data-wc-ghost />}
        <Student x={SIDE / 2 + 2} y={H - 8} girl={girl} mood={mood} />
      </svg>
    </div>
  );
}

/* ══════════════ Les commandes : cellules, colonnes, règle, valeur ══════════════ */

function Tools({ lab, setLab, k }) {
  const task = L.taskOf(lab);
  const w = lab.w;
  const free = L.isFree(lab);
  const phase = w.phase;
  const btn = 'inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border-2 px-3 text-sm font-black';
  const Stepper = ({ label, value, lessAttr, moreAttr, onLess, onMore, lessOff, moreOff, tint }) => (
    <div className="flex items-center gap-1.5" dir="ltr">
      <RoundButton onClick={onLess} disabled={lessOff} aria-label={k('less')} size={44} {...{ [lessAttr]: true }}><Minus className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></RoundButton>
      <span className={`flex min-h-[44px] min-w-[5.4rem] items-center justify-center gap-1.5 rounded-xl border-2 px-2 text-center ${tint}`}>
        <span className="text-[11px] font-black leading-tight" dir="rtl">{label}</span>
        <span className="text-base font-black leading-none tabular-nums">{value}</span>
      </span>
      <RoundButton primary onClick={onMore} disabled={moreOff} aria-label={k('more')} size={44} {...{ [moreAttr]: true }}><Plus className="h-5 w-5" strokeWidth={3} aria-hidden="true" /></RoundButton>
    </div>
  );
  const locked = phase === 'done' || phase === 'compare';
  const showBuild = phase === 'build' || phase === 'rule' || free;
  return (
    <LabCard className="space-y-2 p-2" data-wc-tools>
      {showBuild && !locked && (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <Stepper label={k('cells')} value={w.n} lessAttr="data-wc-less" moreAttr="data-wc-more" tint="border-amber-200 bg-amber-50 text-amber-950"
            onLess={() => setLab(L.lift)} onMore={() => setLab(L.snap)} lessOff={w.n <= 0} moreOff={L.full(lab)} />
          {task.kind === 'two' && (
            <Stepper label={k('columns')} value={w.m} lessAttr="data-wc-less-m" moreAttr="data-wc-more-m" tint="border-sky-200 bg-sky-50 text-sky-950"
              onLess={() => setLab((s) => L.setStrip(s, s.w.m - 1))} onMore={() => setLab((s) => L.setStrip(s, s.w.m + 1))} lessOff={w.m <= 0} moreOff={w.m >= L.STRIP_MAX} />
          )}
        </div>
      )}
      {L.counterHidden(lab) && !free && <PredictBox lab={lab} setLab={setLab} k={k} />}
      {phase === 'rule' && !L.counterHidden(lab) && <RuleBox lab={lab} setLab={setLab} k={k} btn={btn} />}
      {phase === 'far' && <FarBox lab={lab} setLab={setLab} k={k} btn={btn} />}
      {phase === 'compare' && <CompareBox lab={lab} setLab={setLab} k={k} btn={btn} />}
    </LabCard>
  );
}

function PredictBox({ lab, setLab, k }) {
  const [val, setVal] = useState('');
  useEffect(() => { setVal(''); }, [lab.w.n, lab.ti]);
  return (
    <form data-wc-predict className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-amber-200 bg-amber-50/60 p-2"
      onSubmit={(e) => { e.preventDefault(); if (val) { setLab((s) => L.predict(s, val)); setVal(''); } }}>
      <label className="flex flex-1 flex-wrap items-center gap-2 text-sm font-black text-amber-950">
        <Eye className="h-4 w-4" aria-hidden="true" /><span className="text-xs">{k('predict.label', { n: iso(lab.w.n) })}</span>
        <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" maxLength={3} value={val} aria-label={k('predict.aria')} data-wc-predict-input
          onChange={(e) => setVal(e.target.value.replace(/[^0-9٠-٩]/g, ''))} className={`h-10 w-20 rounded-xl border-2 border-amber-300 bg-white px-2 text-center text-lg font-black tabular-nums text-amber-950 ${ring}`} />
      </label>
      <button type="submit" disabled={!val} data-wc-predict-check className={`inline-flex min-h-[44px] items-center rounded-2xl border-2 border-amber-600 bg-amber-500 px-4 text-sm font-black text-white disabled:opacity-40 ${ring}`}>{k('predict.check')}</button>
    </form>
  );
}

function RuleBox({ lab, setLab, k, btn }) {
  const task = L.taskOf(lab);
  const [val, setVal] = useState('');
  const ref = useRef(null);
  useEffect(() => { setVal(''); }, [lab.ti, lab.free]);
  const chips = task.kind === 'two' ? [...RULE_CHIPS.slice(0, 1), 'm', ...RULE_CHIPS.slice(1)] : RULE_CHIPS;
  const add = (c) => { setVal((v) => `${v}${c}`.slice(0, 24)); ref.current?.focus(); };
  return (
    <form data-wc-rule className="space-y-1.5 rounded-xl border-2 border-amber-200 bg-amber-50/60 p-2" onSubmit={(e) => { e.preventDefault(); if (val) setLab((s) => L.writeRule(s, val)); }}>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex flex-1 flex-wrap items-center gap-2 text-sm font-black text-amber-950">
          <span className="min-w-[5.5rem] text-xs">{k('rule.label')}</span>
          <input ref={ref} type="text" inputMode="text" autoComplete="off" dir="ltr" maxLength={24} value={val} placeholder={k('rule.placeholder')} aria-label={k('rule.aria')} data-wc-input
            onChange={(e) => setVal(e.target.value)} className={`h-11 min-w-[9rem] flex-1 rounded-xl border-2 border-amber-300 bg-white px-2 text-center text-lg font-black tabular-nums text-amber-950 ${ring}`} />
        </label>
        <button type="submit" disabled={!val} data-wc-judge className={`${btn} border-amber-600 bg-amber-500 text-white shadow-[0_3px_0_0_#B45309] transition-all duration-150 active:translate-y-0.5 disabled:opacity-40 motion-reduce:transition-none ${ring}`}>{k('rule.judge')}</button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5" dir="ltr" role="group" aria-label={k('rule.chips')}>
        {chips.map((c) => <button key={c} type="button" dir="ltr" onClick={() => add(c === '−' ? '-' : c === '×' ? '*' : c)} data-wc-chip={c} className={`inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-xl border-2 border-amber-200 bg-white px-2 text-base font-black text-amber-950 ${ring}`}>{`\u200E${c}\u200E`}</button>)}
        {[1, 2, 3, 5, 8].map((d) => <button key={d} type="button" onClick={() => add(String(d))} className={`inline-flex h-10 min-w-[2.2rem] items-center justify-center rounded-xl border border-slate-200 bg-white px-1.5 text-sm font-bold text-slate-700 ${ring}`}>{d}</button>)}
        <button type="button" onClick={() => setVal((v) => v.slice(0, -1))} aria-label={k('rule.erase')} className={`inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-2 text-sm font-black text-slate-600 ${ring}`}>⌫</button>
      </div>
    </form>
  );
}

function FarBox({ lab, setLab, k, btn }) {
  const task = L.taskOf(lab);
  const [val, setVal] = useState('');
  useEffect(() => { setVal(''); }, [lab.ti]);
  const [ok] = [lab.w.phase === 'done'];
  return (
    <form data-wc-far className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-amber-200 bg-amber-50/60 p-2" onSubmit={(e) => { e.preventDefault(); if (val) setLab((s) => L.answerFar(s, val)); }}>
      <label className="flex flex-1 flex-wrap items-center gap-2 text-sm font-black text-amber-950">
        <span className="text-xs">{task.kind === 'two' ? k('far.labelTwo') : k('far.label', { n: iso(task.far) })}</span>
        <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" maxLength={5} value={ok ? '✓' : val} aria-label={k('far.aria')} data-wc-far-input
          onChange={(e) => setVal(e.target.value.replace(/[^0-9٠-٩]/g, ''))} className={`h-11 w-24 rounded-xl border-2 border-amber-300 bg-white px-2 text-center text-lg font-black tabular-nums text-amber-950 ${ring}`} />
      </label>
      <button type="submit" disabled={!val} data-wc-far-check className={`${btn} border-amber-600 bg-amber-500 text-white disabled:opacity-40 ${ring}`}>{k('far.check')}</button>
    </form>
  );
}

function CompareBox({ setLab, k, btn }) {
  return (
    <div data-wc-compare-box className="space-y-1.5 rounded-xl border-2 border-amber-200 bg-amber-50/60 p-2">
      <div className="grid grid-cols-2 gap-2 text-center text-sm font-black" dir="ltr">
        <span className="rounded-xl border-2 border-sky-200 bg-sky-50 px-2 py-1 text-sky-950"><span className="block text-[11px]" dir="rtl">{k('compare.yacine')}</span><MathText>{$('5n+1')}</MathText></span>
        <span className="rounded-xl border-2 border-rose-200 bg-rose-50 px-2 py-1 text-rose-950"><span className="block text-[11px]" dir="rtl">{k('compare.rania')}</span><MathText>{$('6+5\\times(n-1)')}</MathText></span>
      </div>
      <button type="button" onClick={() => setLab(L.compareWritings)} data-wc-compare className={`${btn} w-full border-amber-600 bg-amber-500 text-white ${ring}`}>{k('compare.go')}</button>
    </div>
  );
}

/* ══════════════ Le tableau n / tiges ══════════════ */

function Table({ lab, k }) {
  const task = L.taskOf(lab);
  const w = lab.w;
  const flag = lab.flag;
  const cols = [...w.visited].sort((a, b) => a - b);
  const strip = task.strip;
  const shows = (n) => !(task.predict && task.kind !== 'compare' && !w.predictedAt.includes(n));
  const verdictOf = (n) => (flag?.rows && flag.rows.length ? (flag.rows.some((r) => r.n === n && r.rule !== r.real) ? 'bad' : flag.rows.some((r) => r.n === n) ? 'ok' : '') : '');
  const ruleVals = flag?.rows && !flag.compare ? Object.fromEntries(flag.rows.map((r) => [r.n, r.rule])) : {};
  if (task.kind === 'two' || !cols.length) return null;
  return (
    <LabCard className="overflow-x-auto p-2" data-wc-table>
      <table className="mx-auto border-separate border-spacing-1 text-center text-sm font-black" dir="rtl">
        <tbody>
          <tr>
            <th className="whitespace-nowrap pe-2 text-start text-[11px] text-amber-900">{k('table.cells')}</th>
            {cols.map((n) => <td key={n} data-wc-col={n} data-verdict={verdictOf(n)} className={`min-w-[2.3rem] rounded-lg border-2 px-1.5 py-0.5 ${verdictOf(n) === 'bad' ? 'border-rose-400 bg-rose-50 text-rose-800' : 'border-amber-200 bg-amber-50 text-amber-950'}`}>{n}</td>)}
          </tr>
          <tr>
            <th className="whitespace-nowrap pe-2 text-start text-[11px] text-amber-900">{k('table.rods')}</th>
            {cols.map((n) => <td key={n} data-verdict={verdictOf(n)} className={`rounded-lg border-2 px-1.5 py-0.5 ${verdictOf(n) === 'bad' ? 'border-rose-400 bg-rose-50 text-rose-800' : 'border-amber-200 bg-white text-slate-900'}`}>{shows(n) ? L.rodsOfRow(n, strip) : '؟'}</td>)}
          </tr>
          {Object.keys(ruleVals).length > 0 && (
            <tr>
              <th className="whitespace-nowrap pe-2 text-start text-[11px] text-rose-900">{k('table.yours')}</th>
              {cols.map((n) => <td key={n} className="rounded-lg border-2 border-dashed border-slate-300 bg-white px-1.5 py-0.5 text-slate-700">{ruleVals[n] ?? '—'}</td>)}
            </tr>
          )}
        </tbody>
      </table>
    </LabCard>
  );
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-wc-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-2">
        {!free ? (
          <button type="button" onClick={() => setLab(L.freeTask)} data-wc-free-start className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-300 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>{k('free.start')}</button>
        ) : (
          <button type="button" onClick={() => setLab(L.toGuided)} data-wc-free-back className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

export function ruleOptions(k) {
  return [
    { text: <MathText>{k('rule5n1')}</MathText>, correct: true },
    { text: <MathText>{k('rule6n')}</MathText>, why: <MathText>{k('whyRule6n')}</MathText> },
    { text: <MathText>{k('rule5n')}</MathText>, why: <MathText>{k('whyRule5n')}</MathText> },
  ];
}

export function Formal({ lab, k }) {
  const two = L.taskOf(lab).kind === 'two';
  const strip = L.taskOf(lab).strip;
  const line = two ? '5n+1+8m+3\\;\\Rightarrow\\;n=6,\\ m=4:\\ 31+35=66' : strip ? '8n+3' : '5\\times n+1=5n+1 \\qquad 5\\times 40+1=201';
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-wc-formal>
      <p><MathText>{k('formal.intro')}</MathText></p>
      <p className="text-center text-base" dir="ltr"><MathText>{$(line)}</MathText></p>
      <p><MathText>{k('formal.letter')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

export const CHAINS = Object.freeze({
  w1: ['second', 'why'],
  w2: ['repeat', 'alone', 'rule'],
  w3: ['far', 'tray'],
  a1: ['shared'],
  a2: ['same'],
  a3: ['letters', 'val'],
  k1: ['six', 'rule'],
});

const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const T = (s) => <MathText>{s}</MathText>;
const hints = (k, id) => [Mx(k, `${id}.hint1`), Mx(k, `${id}.hint2`)];
const choice = (k, id, opts, extra = {}) => ({ id, kind: 'choice', prompt: Mx(k, `${id}.prompt`), options: opts, hints: hints(k, id), explain: Mx(k, `${id}.explain`), ...extra });
const numberQ = (k, id, expected) => ({ id, kind: 'number', expected: String(expected), answer: T($(String(expected))), prompt: Mx(k, `${id}.prompt`), hints: hints(k, id), explain: Mx(k, `${id}.explain`) });
const opt = (k, id, name, correct) => (correct ? { text: T(k(`cp.${id}.${name}`)), correct: true } : { text: T(k(`cp.${id}.${name}`)), why: Mx(k, `${id}.why${name[0].toUpperCase()}${name.slice(1)}`) });

/** Chaque question vient des tâches jouées (les nombres sont ceux du dessin), jamais d'un texte libre. */
export const QUESTIONS = {
  second: (lab, task, k) => numberQ(k, 'second', L.rodsOfRow(2) - L.rodsOfRow(1)),
  why: (lab, task, k) => choice(k, 'why', [opt(k, 'why', 'wrongA'), opt(k, 'why', 'right', true), opt(k, 'why', 'wrongB')]),
  repeat: (lab, task, k) => numberQ(k, 'repeat', L.rodsOfRow(4) - L.rodsOfRow(3)),
  alone: (lab, task, k) => numberQ(k, 'alone', L.rodsOfRow(1) - (L.rodsOfRow(2) - L.rodsOfRow(1))),
  rule: (lab, task, k) => ({ id: 'rule', kind: 'choice', prompt: Mx(k, 'rule.prompt'), options: ruleOptions(k), hints: hints(k, 'rule'), explain: <Formal lab={lab} k={k} /> }),
  far: (lab, task, k) => numberQ(k, 'far', L.farValue(task.kind === 'far' ? task : { kind: 'far', far: L.FAR_N })),
  tray: (lab, task, k) => choice(k, 'tray', [opt(k, 'tray', 'right', true), opt(k, 'tray', 'wrongYes'), opt(k, 'tray', 'wrongFrame')]),
  shared: (lab, task, k) => numberQ(k, 'shared', 2 * L.rodsOfRow(3) - L.rodsOfRow(3, true)),
  same: (lab, task, k) => choice(k, 'same', [opt(k, 'same', 'wrongA'), opt(k, 'same', 'right', true), opt(k, 'same', 'wrongB')]),
  letters: (lab, task, k) => choice(k, 'letters', [opt(k, 'letters', 'wrongA'), opt(k, 'letters', 'wrongB'), opt(k, 'letters', 'right', true)]),
  val: (lab, task, k) => numberQ(k, 'val', L.rodsOfBoth(6, 4)),
  six: (lab, task, k) => numberQ(k, 'six', L.rodsOfRow(6)),
};
