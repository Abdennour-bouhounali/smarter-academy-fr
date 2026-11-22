import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Minus, Plus, Scale, Check, X as XIcon, PenLine } from 'lucide-react';
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
import * as L from '../logic/bridgeLoad';
import { COL, Sack, Pile, Truck, Barrier, Bridge, Student } from './bridgeLoad/art';

/**
 * bridge-load — LA CHARGE SOUS LA MAIN (2AM, unité 4, درس « اختبار مساواة أو متباينة », 2026-10-29). La logique, entière, est dans `logic/bridgeLoad.js` ; les maths (lire une relation, substituer, calculer
 * les deux membres, comparer) viennent de `equation2.js` E3 (importé par chemin). Thème `weighbridge` : un dépôt de matériaux au bord d'un oued à sec, un camion à benne ouverte, la dalle d'un pèse-camion dont
 * l'ÉCRAN écrit la substitution (« 4000 + 50 × 15 = 4750 ») puis la comparaison (« 4750 < 5000 ؟ »), une barrière et la pancarte du pont.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tient des COMPTES : x sacs de ciment (50 kg) et, à deux inconnues, y sacs de sable (40 kg). Trois chemins : glisser un sac (ou une palette de 5) du dépôt vers la benne et la décharger ; − / + (± 1, ± 5) ;
 *    le clavier (↑ ↓ ciment, ← → sable, Entrée pèse). « اعبر إلى الميزان » pèse. Les charges DONNÉES sont des CARTES qu'on glisse sur la benne une à une.
 * B. Le monde répond : l'écran écrit la substitution et les deux membres calculés ; la barrière se lève ou reste baissée.
 * C. La résistance : le verdict est demandé AVANT la barrière (on lit puis on décide) ; la charge-limite (5000 : « < 5000 » est faux) ; deux inconnues (l'ordre des comptes compte) ; à متقدم l'écran est MASQUÉ jusqu'à ce que
 *    l'élève ait tapé la valeur des deux membres, et une affirmation « toujours » tombe devant UNE charge.
 * D. La phase formelle écrit ses nombres : 4000 + 50 × 15 = 4750 et 4750 < 5000 ; 3000 + 70 × 30 = 5100 = 3600 + 50 × 30 ; 2000 ≠ 2400 pour x = 0.
 * E. Les erreurs sont DESSINÉES : un mauvais verdict montre la vraie ligne, la barrière (qui dit la vérité) et le signe en rouge ; une charge qui « réfute » mais vérifie est refusée (« توافق ادّعاءه ») ; l'échange ciment ↔ sable écrit une autre ligne.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        tester une égalité ou une inégalité pour une valeur = substituer, calculer les deux membres, comparer ; « < » ≠ « ≤ » ; une valeur ne prouve pas « toujours », une valeur suffit à réfuter
 *   OBJECT         des sacs, un camion, un pèse-camion à écran, une barrière, la pancarte ; des cartes de charges
 *   VARIABLE       x (sacs de ciment) et y (sacs de sable), des COMPTES de 0 à 60
 *   INVARIANT      masse totale = masse à vide + 50 x + 40 y : la même règle pèse toutes les charges
 *   TRANSFORMATION (x, y) → la ligne de substitution → les deux membres → la comparaison → la barrière
 *   CONSTRAINT     la pancarte (< 5000, ≤ 7000, =) ; une seule charge sur la benne
 *   RESISTANCE     la charge 20 (= 5000 pile) ; l'ordre des deux comptes ; l'écran masqué (متقدم)
 *   EVIDENCE       l'écran (lignes + comparaison), la barrière, la pancarte
 *   CONTRAST       un camion avec un signe contre deux camions à une charge ; < contre ≤ ; une valeur qui vérifie contre une valeur qui réfute
 *   PREDICTION     (متقدم) taper la masse des deux camions avant que l'écran ne s'allume
 *   DISCOVERY      « كيف نختبر قيمة في عبارة ؟ »
 *   FORMALIZATION  4000 + 50 × 15 = 4750 et 4750 < 5000
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert : masse à vide, masses des sacs, nombre et signe de la pancarte), les exercices et la banque
 *
 * « جرّب كل الإمكانيات » : NON. « جرّب أعدادك » est TOUJOURS ouvert sous le labo (jamais compté). ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/bridgeLoad.js › coachOf` (load · weigh · screen · twin · cards · claim · next · free).
 * Props : `tasks`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished()`.
 * CONTRAT DOM : [data-bridge-load][data-level][data-task][data-x][data-y][data-solved][data-layout], [data-bl-glance], [data-bl-scene], [data-bl-depot=cement|sand], [data-bl-sack][data-kind][data-n], [data-bl-bed=A|B], [data-bl-pile=<kind>],
 * [data-bl-weigh], [data-bl-screens], [data-bl-screen=A|B][data-holds][data-judged], [data-bl-cmp], [data-bl-sign], [data-bl-barrier][data-open], [data-bl-load], [data-bl-less=<x|y>], [data-bl-more=<x|y>],
 * [data-bl-ask], [data-bl-verdict], [data-bl-yes], [data-bl-no], [data-bl-predict], [data-bl-counter], [data-bl-cards], [data-bl-card=<i>][aria-pressed], [data-bl-cards-check], [data-bl-next-load], [data-bl-next],
 * [data-bl-step=<i>], [data-bl-free][data-active], [data-bl-free-start], [data-bl-free-back], [data-bl-formal], [data-bl-context], [data-bl-prompt].
 */
const NS = 'manipulation.bridgeLoad';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const WIDE_MIN = 700;
const SIDE_W = 236;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-sky-300';
const $ = (s) => `$${s}$`;
const W = 460;
const H1 = 178;
const H2 = 206;
const SIGN_TEXT = { '<': '<', '≤': '≤', '=': '=', '>': '>', '≥': '≥' };

export function numbersFor({ tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['bridge-load'][lv].numbers;
  return { tasks: tasks ?? asked.tasks };
}

export default function BridgeLoad({
  tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'bridge-load', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
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
  const cpSettings = useLabCheckpointSettings('bridge-load');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[cur.id] ?? null : null;
  const cp = useLabCheckpoint({
    id: chain ? cur.id : null,
    questions: chain && L.taskDone(lab) ? chain.map((q) => QUESTIONS[q](lab, cur, k)) : null,
    reached: L.taskDone(lab),
    resetKey: scene.inits,
    onRetry: () => setLab(L.restartTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (FINAL.has(id)) { state.discover(); state.formalize(); } },
  });
  const ready = L.discoveryReady(lab);
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  const finishedOnce = useRef(false);
  useEffect(() => {
    if (!ready) { finishedOnce.current = false; return; }
    if (!finishedOnce.current) { finishedOnce.current = true; state.report(onFinished, {}); }
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const reported = useRef(0);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials < reported.current) reported.current = 0;
    for (let i = reported.current; i < nTrials; i += 1) state.report(onTrial, L.trialEvidence(lab.trials[i]));
    reported.current = nTrials;
  }, [nTrials, lab.trials]); // eslint-disable-line react-hooks/exhaustive-deps

  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'bridge-load', step: coachStep,
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
  const advanced = L.levelOf(lab) === 'advanced';
  const discovery = (
    <ManipulationDiscovery state={state} prompt={<MathText>{k(advanced ? 'discovery.promptAdv' : 'discovery.prompt')}</MathText>} options={ruleOptions(k, advanced)} formal={<Formal lab={lab} k={k} />} />
  );
  const bed = L.bedOf(lab);

  return (
    <ManipulationShell
      type="bridge-load"
      title={title ?? k('title')}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      coach={coachOn ? coach : null}
      headerAction={cpOn ? cpSettings.control : null}
      guided={!!chain}
      hints={[0, 1, 2].map((i) => k(`hints.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={discovery}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/70 to-white">
        <div ref={boxRef} className="space-y-2" data-bridge-load data-level={advanced ? 'advanced' : 'beginner'} data-task={lab.free ? 'free' : lab.ti}
          data-x={bed.x} data-y={bed.y} data-solved={ready ? 'true' : 'false'} data-layout={width >= WIDE_MIN ? 'wide' : 'narrow'}>
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} advanced={advanced} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

const loadWords = (k, c, task) => {
  if (task?.twoUnknowns || c.y) return k('loadTwo', { x: iso(c.x), y: iso(c.y) });
  return k('loadOne', { x: iso(c.x) });
};

function Lab({ lab, setLab, k, width, lead, cp, advanced }) {
  const wide = width >= WIDE_MIN;
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const done = L.taskDone(lab);
  const lit_ = !free && done;
  const w = lab.w;
  const last = lab.last;
  const sc = free ? lab.free.screen : w.screen;

  /* ── la consigne : le contexte puis UNE question ── */
  const ctx = (() => {
    if (lead && lab.ti === 0 && !free) return lead;
    if (free) return k('ctx.free');
    return k(`ctx.${task.id}`, { defaultValue: k('ctx.generic') });
  })();
  const question = free ? k('q.free') : k(`q.${task.id}`, { defaultValue: k('q.generic') });

  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-bl-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le son (muet sauf « الصوت ») : un déclic par sac, le drapeau pour un verdict ou des cartes justes, « over » pour un refus ── */
  const bed = L.bedOf(lab);
  const sacks = bed.x + bed.y;
  const sfxRef = useRef({ h: sacks, key: '' });
  const sfxKey = `${free ? 'free' : lab.ti}:${w.k}`;
  useEffect(() => {
    const p = sfxRef.current;
    if (p.key !== sfxKey) { sfxRef.current = { h: sacks, key: sfxKey }; return; }
    if (sacks !== p.h) playSfx('gesture', { pitch: sacks > p.h ? 1 : 0.75 });
    p.h = sacks;
  }, [sacks, sfxKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (!nTrials) return;
    const tr = lab.trials[nTrials - 1];
    if (tr.kind === 'solved') playSfx('bell');
    else if (tr.kind === 'verdict' || tr.kind === 'cards' || tr.kind === 'counter' || tr.kind === 'predict') playSfx(tr.ok ? 'flag' : 'over');
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = (
    <PromptCard size={wide ? 'lg' : 'md'} context={<MathText>{ctx}</MathText>} contextProps={{ 'data-bl-context': free ? 'free' : task.id }}
      title={<MathText>{question}</MathText>} titleClassName={wide ? 'text-xl' : 'text-[15px]'} lamp={free ? null : lit_ ? 'on' : 'off'}
      titleProps={{ 'data-bl-prompt': task.id, 'data-lit': lit_ ? 'true' : 'false' }} />
  );

  /* ── le verdict : la CONSÉQUENCE avec les nombres de l'élève, jamais la règle ── */
  const massKg = (v) => `$${v}\\,\\mathrm{kg}$`;
  const cmpOf = (r) => $(r.lines.cmp.replace(/\s+/g, '').replace(/≤/g, '\\le').replace(/≥/g, '\\ge'));
  const wantLoad = !free && L.target(lab) ? loadWords(k, L.target(lab), task) : '';
  const verdictLine = (() => {
    if (free) return sc ? k(sc.holds ? 'v.freeHolds' : 'v.freeFails', { cmp: cmpOf(sc) }) : k('v.freeIdle');
    if (last?.kind === 'counter') return last.ok ? k('v.counterOk', { cmp: cmpOf(sc) }) : k('v.agrees', { cmp: cmpOf(sc) });
    if (last?.kind === 'cards') {
      if (last.ok) return k('v.cardsOk');
      const j = w.miss?.cards;
      if (j?.wrong.length) { const c = task.cards[j.wrong[0]]; const r = L.weighAt(task, c.x, c.y); return k('v.cardWrong', { load: loadWords(k, c, task), cmp: cmpOf(r) }); }
      if (j?.missing.length) { const c = task.cards[j.missing[0]]; const r = L.weighAt(task, c.x, c.y); return k('v.cardMissing', { load: loadWords(k, c, task), cmp: cmpOf(r) }); }
    }
    if (last?.kind === 'verdict' && sc) {
      const key = task.lanes ? (sc.holds ? 'same' : 'differ') : sc.holds ? 'pass' : 'stop';
      const bound = !task.lanes && !sc.holds && sc.left === sc.right ? ` ${k('v.boundary', { m: massKg(sc.left) })}` : '';
      return `${k(last.ok ? `v.right.${key}` : `v.wrong.${key}`, { cmp: cmpOf(sc), mass: massKg(sc.left) })}${bound}`;
    }
    if (last?.kind === 'predict') {
      return last.ok ? k('v.predictOk') : k('v.predictBad', { a: iso(last.a), b: iso(last.b), ra: iso(sc?.left ?? ''), rb: iso(sc?.right ?? '') });
    }
    if (w.phase === 'predict') return w.miss?.unreadable ? k('v.unreadable') : k('v.predictIdle');
    if (sc && !sc.on && w.phase === 'bed' && wantLoad && !done) return sc.swap ? k('v.swap', { mass: massKg(sc.left), load: wantLoad }) : k('v.offTarget', { mass: massKg(sc.left), load: wantLoad });
    if (w.phase === 'ask') return k(task.lanes ? 'v.askTwin' : 'v.ask');
    if (w.phase === 'ok') return k('v.okNext');
    if (w.phase === 'cards') return sc ? k('v.cardsRead', { cmp: cmpOf(sc) }) : k('v.cardsIdle');
    if (done) return L.discoveryReady(lab) ? k('v.allDone') : k('v.taskDone');
    if (task.kind === 'claim') return sc ? k('v.claimRead', { cmp: cmpOf(sc) }) : k('v.claimIdle');
    if (wantLoad) return k('v.target', { load: wantLoad });
    return k('v.idle');
  })();
  const refused = !!(last && (last.ok === false));
  const accepted = !refused && !!last && last.ok === true;
  const tone = refused ? 'rose' : accepted ? 'emerald' : 'amber';
  const Icon = refused ? Sparkles : accepted ? CheckCircle2 : Hand;
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = refused ? 'wonder' : done ? 'proud' : 'happy';
  const after = L.afterOk(lab);
  const banner = (
    <VerdictBanner tone={tone} icon={wide ? Icon : null} size="sm" className="min-h-[3.5rem]" data-bl-verdict={refused ? 'bad' : accepted ? 'good' : ''}>
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
        <p className={`min-w-0 flex-1 ${last ? '' : 'font-bold text-amber-950'}`}><MathText>{verdictLine}</MathText></p>
        {after && (
          <button type="button" onClick={() => setLab(L.nextLoad)} data-bl-next-load
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-sky-600 bg-sky-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#075985] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k(after === 'load' ? 'nextLoad' : 'toCards')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-bl-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );

  const stageW = Math.min(540, Math.max(300, (wide ? width - SIDE_W - 12 : width) - 24));
  const stage = (
    <>
      <Scene lab={lab} setLab={setLab} k={k} width={stageW} mood={mood} girl={advanced} />
      <Screens lab={lab} k={k} />
    </>
  );
  const tools = <Tools lab={lab} setLab={setLab} k={k} />;

  return (
    <>
      <div className="relative space-y-2" data-bl-glance>
        {party.node}
        {cp.node}
        {prompt}
        {wide ? (
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <StageFrame className="min-w-0 space-y-1 overflow-hidden p-3" data-bl-stage>
                {steps ? <div className="flex flex-wrap items-center justify-end gap-x-3">{steps}</div> : null}
                {stage}
              </StageFrame>
              {tools}
            </div>
            <div className="flex shrink-0 flex-col gap-2.5" style={{ width: SIDE_W }}>{banner}</div>
          </div>
        ) : (
          <>
            <StageFrame className="min-w-0 space-y-1 overflow-hidden p-2" data-bl-stage>{steps || null}{stage}</StageFrame>
            {tools}
            {banner}
          </>
        )}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ Le dépôt, le camion, le pèse-camion, la barrière ══════════════ */

/** Ce que la scène dessine : une voie (un camion) ou deux (A et B, UNE charge x pour les deux). */
function sceneModel(lab) {
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const bed = L.bedOf(lab);
  if (free) {
    const f = lab.free;
    return { lanes: [{ id: null, empty: f.e, text: iso(`${f.e} kg`) }], twoKinds: true, kgX: f.a, kgY: f.b, x: bed.x, y: bed.y };
  }
  if (task.lanes) {
    return { lanes: task.laneInfo.map((l) => ({ id: l.id, empty: l.empty, text: iso(L.pretty(l.text)) })), twoKinds: false, kgX: null, kgY: null, x: bed.x, y: 0 };
  }
  return { lanes: [{ id: null, empty: task.empty, text: iso(`${task.empty} kg`) }], twoKinds: task.twoUnknowns, kgX: task.kgX, kgY: task.kgY, x: bed.x, y: bed.y };
}

function Scene({ lab, setLab, k, width, mood, girl }) {
  const free = L.isFree(lab);
  const m = sceneModel(lab, k);
  const twin = m.lanes.length === 2;
  const H = twin ? H2 : H1;
  const w = lab.w;
  const sc = free ? lab.free.screen : w.screen;
  const open = free ? !!sc?.holds : !!(w.judged && sc?.holds);
  const canLoad = free || (w.phase !== 'ok' && w.phase !== 'done');
  const svgRef = useRef(null);
  const [drag, setDrag] = useState(null);
  const pt = (e) => {
    const box = svgRef.current.getBoundingClientRect();
    return { x: ((e.clientX - box.left) / Math.max(1, box.width)) * W, y: ((e.clientY - box.top) / Math.max(1, box.height)) * H };
  };
  const zone = { x: 108, y: 14, w: 250, h: H - 28 };
  const inZone = (p) => p.x >= zone.x && p.x <= zone.x + zone.w && p.y >= zone.y && p.y <= zone.y + zone.h;
  const startIn = (kind, n) => (e) => { if (!canLoad) return; svgRef.current.setPointerCapture?.(e.pointerId); const p = pt(e); setDrag({ kind, n, dir: 'in', sx: p.x, sy: p.y, x: p.x, y: p.y }); e.preventDefault(); };
  const startOut = (kind) => (e) => { if (!canLoad) return; svgRef.current.setPointerCapture?.(e.pointerId); const p = pt(e); setDrag({ kind, n: 1, dir: 'out', sx: p.x, sy: p.y, x: p.x, y: p.y }); e.preventDefault(); };
  const move = (e) => { if (drag) { const p = pt(e); setDrag((d) => (d ? { ...d, x: p.x, y: p.y } : d)); } };
  const up = (e) => {
    if (!drag) return;
    const p = pt(e);
    const moved = Math.hypot(p.x - drag.sx, p.y - drag.sy) > 6;
    const inside = inZone(p);
    if (drag.dir === 'in' && (inside || !moved)) setLab((s) => L.load(s, drag.kind, drag.n));
    if (drag.dir === 'out' && moved && !inside) setLab((s) => L.load(s, drag.kind, -drag.n));
    setDrag(null);
  };
  const key = (e) => {
    if (!canLoad) return;
    if (e.key === 'ArrowUp') { e.preventDefault(); setLab((s) => L.load(s, 'x', 1)); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setLab((s) => L.load(s, 'x', -1)); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); setLab((s) => L.load(s, 'y', 1)); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); setLab((s) => L.load(s, 'y', -1)); }
    else if (e.key === 'Enter') { e.preventDefault(); setLab(L.pressWeigh); }
  };
  const tileKey = (kind, n) => (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (canLoad) setLab((s) => L.load(s, kind, n)); } };

  const tiles = [];
  tiles.push({ kind: 'x', n: 1, col: 0, row: 0 }, { kind: 'x', n: 5, col: 0, row: 1 });
  if (m.twoKinds) tiles.push({ kind: 'y', n: 1, col: 1, row: 0 }, { kind: 'y', n: 5, col: 1, row: 1 });
  const TX = (col) => 6 + col * 52;
  const TY = (row) => (twin ? 44 + row * 52 : 34 + row * 51);
  const hitFor = (kind) => (kind === 'x' ? 'cement' : 'sand');

  const laneGeom = (i) => (twin ? { ox: 122, oy: 56 + i * 100, s: 0.7 } : { ox: 122, oy: 98, s: 1 });
  const showKg = !twin;

  return (
    <div className="space-y-1" data-bl-scene-box>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: Math.min(W * 1.2, width), display: 'block', margin: '0 auto', touchAction: 'none', direction: 'ltr' }} role="group" aria-label={k('stageAria')}
        data-bl-scene dir="ltr" onPointerMove={move} onPointerUp={up} onPointerCancel={() => setDrag(null)}>
        <defs>
          <linearGradient id="bl-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COL.sky} /><stop offset="1" stopColor={COL.skyLow} /></linearGradient>
        </defs>
        <rect x={0} y={0} width={W} height={H} rx={12} fill="url(#bl-sky)" />
        <rect x={0} y={H - 36} width={W} height={36} fill={COL.ground} />
        <rect data-bl-dropzone x={zone.x} y={zone.y} width={zone.w} height={zone.h} fill="none" />
        {/* le dépôt : palettes de sacs, un tas par sorte (glisser un sac ou une palette de 5) */}
        <rect x={4} y={TY(1) + 49} width={m.twoKinds ? 104 : 52} height={7} rx={2} fill={COL.pallet} stroke={COL.palletDark} strokeWidth={1} />
        {[{ kind: 'cement', col: 0, label: k('cement') }, ...(m.twoKinds ? [{ kind: 'sand', col: 1, label: k('sand') }] : [])].map((d) => (
          <g key={d.kind} data-bl-depot={d.kind}>
            <text x={TX(d.col) + 24} y={twin ? 36 : 26} textAnchor="middle" fontSize={13} fontWeight={800} fill={COL.ink}>{d.label}</text>
          </g>
        ))}
        {tiles.map((tl) => {
          const kind = hitFor(tl.kind);
          const x0 = TX(tl.col); const y0 = TY(tl.row);
          const kg = tl.kind === 'x' ? m.kgX : m.kgY;
          return (
            <g key={`${tl.kind}${tl.n}`} data-bl-sack data-kind={kind} data-n={tl.n} role="button" tabIndex={canLoad ? 0 : -1} aria-label={k(tl.n === 1 ? `tile.${kind}One` : `tile.${kind}Five`)}
              onPointerDown={startIn(tl.kind, tl.n)} onKeyDown={tileKey(tl.kind, tl.n)} style={{ cursor: canLoad ? 'grab' : 'default', touchAction: 'none' }} className={ring}>
              <rect x={x0} y={y0} width={48} height={tl.n === 1 ? 46 : 48} rx={8} fill="#fff" fillOpacity={canLoad ? 0.85 : 0.45} stroke={kind === 'cement' ? COL.cementDark : COL.sandDark} strokeWidth={1.6} />
              {tl.n === 1
                ? <Sack x={x0 + 8} y={y0 + 8} w={32} h={20} kind={kind} />
                : [0, 1, 2, 3, 4].map((r) => <Sack key={r} x={x0 + 12} y={y0 + 38 - r * 7.2} w={24} h={6.6} kind={kind} />)}
              {tl.n === 1 && showKg && kg ? <text x={x0 + 24} y={y0 + 41} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={COL.ink}>{iso(`${kg} kg`)}</text> : null}
              {tl.n === 5 && <text x={x0 + 40} y={y0 + 12} textAnchor="end" fontSize={13} fontWeight={900} fill={COL.ink}>{iso('×5')}</text>}
            </g>
          );
        })}
        {/* le pont de l'oued, à droite */}
        {m.lanes.map((ln, i) => { const g = laneGeom(i); return <g key={`b${i}`}><rect x={108} y={g.oy + 36 * g.s} width={W - 108 - 70} height={14 * g.s} fill="#94A3B8" /><Bridge x={W - 76} y={g.oy + 37 * g.s} w={76} /></g>; })}
        {m.lanes.map((ln, i) => {
          const g = laneGeom(i);
          const cC = Math.ceil(m.x / 5); const cS = Math.ceil(m.y / 5);
          const colW = Math.min(17, 164 / Math.max(1, cC + cS));
          return (
            <g key={ln.id ?? 'one'} transform={`translate(${g.ox} ${g.oy}) scale(${g.s})`} data-bl-bed={ln.id ?? 'A'} data-count={m.x + m.y}>
              <Truck
                tag={<text x={85} y={18} textAnchor="middle" fontSize={ln.id ? 13 : 15} fontWeight={800} fill="#fff">{ln.text}</text>}>
                <g role="group" tabIndex={ln.id === 'B' ? -1 : 0} aria-label={k('bedAria')} onKeyDown={key} className={ring} style={{ outline: 'none' }}>
                  <rect x={0} y={-48} width={170} height={48} fill="transparent" />
                  <g data-bl-pile="x" onPointerDown={startOut('x')} style={{ cursor: canLoad ? 'grab' : 'default' }}><Pile kind="cement" count={m.x} x0={3} floor={-3} colW={colW} /></g>
                  {m.twoKinds && <g data-bl-pile="y" onPointerDown={startOut('y')} style={{ cursor: canLoad ? 'grab' : 'default' }}><Pile kind="sand" count={m.y} x0={3 + cC * colW} floor={-3} colW={colW} /></g>}
                </g>
              </Truck>
              {ln.id && <g aria-hidden="true"><circle cx={-16} cy={-18} r={13} fill={ln.id === 'A' ? '#0EA5E9' : '#F97316'} stroke={COL.ink} strokeWidth={1.4} /><text x={-16} y={-13} textAnchor="middle" fontSize={16} fontWeight={900} fill="#fff">{ln.id}</text></g>}
            </g>
          );
        })}
        {m.lanes.map((ln, i) => {
          const g = laneGeom(i);
          return (
            <g key={`ba${i}`} data-bl-barrier data-lane={ln.id ?? 'A'} data-open={open ? 'true' : 'false'}>
              <Barrier px={W - 34} py={g.oy + 37 * g.s - 32} len={64} open={open} />
            </g>
          );
        })}
        <Student x={W - 14} y={twin ? 56 + 37 * 0.7 : 98 + 37} girl={girl} mood={mood} h={twin ? 40 : 52} />
        {/* la sortie de la main : le sac qu'on porte */}
        {drag && (drag.dir === 'in' || Math.hypot(drag.x - drag.sx, drag.y - drag.sy) > 6) && (
          <g pointerEvents="none" opacity={0.9} data-bl-ghost>
            {Array.from({ length: Math.min(drag.n, 5) }, (_, r) => <Sack key={r} x={drag.x - 13} y={drag.y - 8 - r * 8} w={26} h={8} kind={drag.kind === 'y' ? 'sand' : 'cement'} />)}
          </g>
        )}
      </svg>
    </div>
  );
}

/* ══════════════ Le pèse-camion : l'écran qui écrit la substitution ══════════════ */

function Screens({ lab, k }) {
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const w = lab.w;
  const sc = free ? lab.free.screen : w.screen;
  const hidden = !free && w.phase === 'predict';
  const judged = free ? !!sc : w.judged;
  const lanes = !free && task.lanes;
  const rel = free ? lab.free.sign : task.rel;
  const limit = free ? lab.free.s : task.limit;
  const holdsAttr = sc && !hidden ? String(sc.holds) : '';
  const boundary = !!(sc && judged && !lanes && !sc.holds && sc.left === sc.right && (rel === '<' || rel === '>'));
  const lcd = `flex min-h-[30px] items-center justify-center rounded-lg border-2 px-1.5 py-0.5 font-mono font-black tabular-nums ${lanes ? 'text-[12.5px]' : 'text-[15px]'}`;
  const line = (id, text) => (
    <div key={id} data-bl-screen={id} data-holds={holdsAttr} data-judged={judged ? 'true' : 'false'} dir="ltr"
      className={`${lcd} ${sc && !hidden ? (judged ? (sc.holds ? 'border-emerald-600 bg-slate-900 text-emerald-300' : 'border-rose-500 bg-slate-900 text-rose-300') : 'border-slate-700 bg-slate-900 text-emerald-300') : 'border-slate-700 bg-slate-900 text-slate-500'}`}>
      <span className="flex items-center gap-1.5">
        {lanes && <span className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black text-white" style={{ background: id === 'A' ? '#0EA5E9' : '#F97316' }}>{id}</span>}
        {hidden ? <bdi>{'• • •'}</bdi> : sc ? <bdi>{iso(text)}</bdi> : <bdi>{'— — —'}</bdi>}
      </span>
    </div>
  );
  const status = !sc || hidden ? '؟' : judged ? k(sc.holds ? 'screen.true' : 'screen.false') : '؟';
  return (
    <div className="flex items-stretch gap-2" data-bl-screens>
      <div data-bl-sign dir="ltr" className="flex h-[62px] w-[62px] shrink-0 flex-col items-center justify-center self-center rounded-full border-[5px] border-red-600 bg-white leading-none text-slate-900 shadow-sm" aria-label={k('signAria')}>
        {lanes ? <span className="text-lg font-black">{`A ${SIGN_TEXT[rel] ?? rel} B`}</span>
          : <><span className="text-xl font-black">{SIGN_TEXT[rel] ?? rel}</span><span className="text-[11px] font-black">{`${limit} kg`}</span></>}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        {lanes ? <div className="grid grid-cols-2 gap-1">{['A', 'B'].map((id) => line(id, sc ? (id === 'A' ? sc.lines.a : sc.lines.b) : ''))}</div> : line('A', sc ? sc.lines.a : '')}
        <div className="flex items-center gap-1.5">
          <div data-bl-cmp dir="ltr" className={`${lcd} flex-1 ${sc && !hidden ? 'border-slate-700 bg-slate-900 text-amber-200' : 'border-slate-700 bg-slate-900 text-slate-500'}`}>
            <bdi>{sc && !hidden ? iso(`${sc.lines.cmp} ?`) : '— — —'}</bdi>
          </div>
          <span data-bl-status data-judged={judged ? 'true' : 'false'} className={`inline-flex min-h-[30px] min-w-[3.6rem] items-center justify-center rounded-lg border-2 px-2 text-xs font-black ${judged && sc && !hidden ? (sc.holds ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-rose-400 bg-rose-50 text-rose-800') : 'border-amber-300 bg-amber-50 text-amber-800'}`}>{status}</span>
        </div>
        {boundary && (
          <div data-bl-boundary dir="ltr" className={`${lcd} border-rose-500 bg-slate-900 text-rose-300`}><bdi>{iso(`${sc.left} = ${sc.right}`)}</bdi></div>
        )}
      </div>
    </div>
  );
}

/* ══════════════ Les commandes ══════════════ */

const btnBase = 'inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border-2 px-2.5 text-sm font-black';

function CountRow({ k, kind, label, value, locked, onDelta, attr }) {
  return (
    <div className="flex items-center gap-0.5" dir="ltr" data-bl-row={kind}>
      <button type="button" disabled={locked || value <= 0} onClick={() => onDelta(-5)} aria-label={k('less5')} {...{ [`${attr}-less5`]: true }}
        className={`inline-flex h-10 min-w-[1.75rem] items-center justify-center rounded-xl border-2 border-sky-200 bg-white px-0.5 text-xs font-black text-sky-900 disabled:opacity-40 ${ring}`}>{'−5'}</button>
      <RoundButton onClick={() => onDelta(-1)} disabled={locked || value <= 0} aria-label={k('less')} size={34} {...{ [`${attr}-less`]: true }}><Minus className="h-4 w-4" strokeWidth={3} aria-hidden="true" /></RoundButton>
      <span className="flex min-h-[40px] min-w-[4.2rem] items-center justify-center gap-1 rounded-xl border-2 border-sky-200 bg-sky-50 px-1.5 text-sky-950">
        <span className="text-[11px] font-black leading-tight" dir="rtl">{label}</span>
        <span className="text-base font-black leading-none tabular-nums" data-bl-count={kind}>{value}</span>
      </span>
      <RoundButton primary onClick={() => onDelta(1)} disabled={locked || value >= L.COUNT_MAX} aria-label={k('more')} size={34} {...{ [`${attr}-more`]: true }}><Plus className="h-4 w-4" strokeWidth={3} aria-hidden="true" /></RoundButton>
      <button type="button" disabled={locked || value >= L.COUNT_MAX} onClick={() => onDelta(5)} aria-label={k('more5')} {...{ [`${attr}-more5`]: true }}
        className={`inline-flex h-10 min-w-[1.75rem] items-center justify-center rounded-xl border-2 border-sky-200 bg-white px-0.5 text-xs font-black text-sky-900 disabled:opacity-40 ${ring}`}>{'+5'}</button>
    </div>
  );
}

function Tools({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const w = lab.w;
  const phase = w.phase;
  const locked = !free && (phase === 'ok' || phase === 'done');
  const twoUnknowns = free || task.twoUnknowns;
  const bed = L.bedOf(lab);
  const done = L.taskDone(lab);
  const laneTask = !free && task.lanes;
  return (
    <LabCard className="space-y-2 p-2" data-bl-tools>
      {(free || phase !== 'cards') && (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5" data-bl-load>
        <CountRow k={k} kind="x" label={laneTask ? 'x' : k('rows.cement')} value={bed.x} locked={locked} attr="data-bl-x" onDelta={(d) => setLab((s) => L.load(s, 'x', d))} />
        {twoUnknowns && <CountRow k={k} kind="y" label={k('rows.sand')} value={bed.y} locked={locked} attr="data-bl-y" onDelta={(d) => setLab((s) => L.load(s, 'y', d))} />}
        {!free && phase === 'ask' ? (
          <div data-bl-ask className="flex items-center gap-2" role="group" aria-label={k(task.lanes ? 'askTwin' : 'ask')}>
            <button type="button" onClick={() => setLab((s) => L.judgeVerdict(s, true))} data-bl-yes className={`${btnBase} min-w-[4.4rem] border-emerald-600 bg-emerald-600 text-white shadow-[0_3px_0_0_#047857] active:translate-y-0.5 ${ring}`}><Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />{k('yes')}</button>
            <button type="button" onClick={() => setLab((s) => L.judgeVerdict(s, false))} data-bl-no className={`${btnBase} min-w-[4.4rem] border-rose-500 bg-rose-500 text-white shadow-[0_3px_0_0_#BE123C] active:translate-y-0.5 ${ring}`}><XIcon className="h-4 w-4" strokeWidth={3} aria-hidden="true" />{k('no')}</button>
          </div>
        ) : (
          <button type="button" onClick={() => setLab(L.pressWeigh)} disabled={locked || phase === 'predict'} data-bl-weigh
            className={`${btnBase} border-sky-700 bg-sky-600 text-white shadow-[0_3px_0_0_#075985] transition-all duration-150 active:translate-y-0.5 disabled:opacity-40 motion-reduce:transition-none ${ring}`}>
            <Scale className="h-4 w-4" aria-hidden="true" />{k('weigh')}
          </button>
        )}
      </div>
      )}
      {!free && phase === 'predict' && <Predict lab={lab} setLab={setLab} k={k} />}
      {!free && task.kind === 'claim' && !done && phase === 'bed' && w.screen && (
        <button type="button" onClick={() => setLab(L.pressCounter)} data-bl-counter
          className={`${btnBase} w-full border-rose-500 bg-rose-500 text-white shadow-[0_3px_0_0_#BE123C] active:translate-y-0.5 ${ring}`}>{k('counter')}</button>
      )}
      {!free && phase === 'cards' && <Cards lab={lab} setLab={setLab} k={k} />}
    </LabCard>
  );
}

function Predict({ lab, setLab, k }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const pend = lab.w.pending;
  useEffect(() => { setA(''); setB(''); }, [lab.ti, pend?.x, pend?.y]);
  const field = (id, val, set, label, color) => (
    <label className="flex items-center gap-1.5 text-sm font-black text-sky-950">
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] text-white" style={{ background: color }}>{label}</span>
      <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" maxLength={6} value={val} placeholder={k('predict.placeholder')} aria-label={k(`predict.aria${label}`)} data-bl-predict-input={label}
        onChange={(e) => set(e.target.value)} className={`h-11 w-[5.2rem] rounded-xl border-2 border-sky-300 bg-white px-1 text-center text-lg font-black tabular-nums text-sky-950 ${ring}`} />
    </label>
  );
  return (
    <form data-bl-predict className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-sky-200 bg-sky-50/60 p-2" onSubmit={(e) => { e.preventDefault(); if (a && b) setLab((s) => L.predict(s, a, b)); }}>
      {field('A', a, setA, 'A', '#0EA5E9')}{field('B', b, setB, 'B', '#F97316')}
      <button type="submit" disabled={!a || !b} data-bl-predict-go className={`${btnBase} border-sky-600 bg-sky-600 text-white shadow-[0_3px_0_0_#075985] active:translate-y-0.5 disabled:opacity-40 ${ring}`}><PenLine className="h-4 w-4" aria-hidden="true" />{k('predict.go')}</button>
    </form>
  );
}

function CardFace({ c, twoKinds }) {
  return (
    <span className="inline-flex items-center gap-1 text-base font-black tabular-nums" dir="ltr">
      <i className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: COL.cement }} aria-hidden="true" />
      <bdi>{c.x}</bdi>
      {twoKinds && <><i className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: COL.sand, outline: `1px solid ${COL.sandDark}` }} aria-hidden="true" /><bdi>{c.y}</bdi></>}
    </span>
  );
}

function Cards({ lab, setLab, k }) {
  const task = L.taskOf(lab);
  const w = lab.w;
  const bed = L.bedOf(lab);
  const miss = w.miss?.cards;
  const [g, setG] = useState(null);
  const skip = useRef(false);
  const swallow = () => { skip.current = true; setTimeout(() => { skip.current = false; }, 60); };
  const down = (i) => (e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setG({ i, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY }); };
  const move = (e) => setG((p) => (p ? { ...p, x: e.clientX, y: e.clientY } : p));
  const up = (i) => (e) => {
    if (!g) return;
    const moved = Math.hypot(e.clientX - g.sx, e.clientY - g.sy) > 8;
    const z = document.querySelector('[data-bl-dropzone]')?.getBoundingClientRect();
    const inside = !!z && e.clientX >= z.left && e.clientX <= z.right && e.clientY >= z.top && e.clientY <= z.bottom;
    swallow();
    if (moved) { if (inside) setLab((s) => L.dropCard(s, i)); } else setLab((s) => L.toggleCard(s, i));
    setG(null);
  };
  const click = (i) => () => { if (skip.current) return; setLab((s) => L.toggleCard(s, i)); };
  const key = (i) => (e) => { if (e.key === 'ArrowUp') { e.preventDefault(); setLab((s) => L.dropCard(s, i)); } };
  const weighed = (c) => L.guidedTrials(lab).some((e) => e.kind === 'weigh' && e.x === c.x && e.y === c.y);
  return (
    <div data-bl-cards className="space-y-1.5 rounded-xl border-2 border-sky-200 bg-sky-50/60 p-2">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 flex-1 text-xs font-black leading-snug text-sky-950">{k('cards.label')}</p>
        <button type="button" disabled={!w.picked.length} onClick={() => setLab(L.checkCards)} data-bl-cards-check className={`${btnBase} border-sky-600 bg-sky-600 text-white disabled:opacity-40 ${ring}`}>{k('cards.check')}</button>
      </div>
      <div className={`grid gap-2 ${task.cards.length > 4 ? 'grid-cols-5' : 'grid-cols-4'}`} dir="ltr">
        {task.cards.map((c, i) => {
          const on = w.picked.includes(i);
          const bad = !!miss?.wrong.includes(i);
          const lack = !!miss?.missing.includes(i);
          const here = bed.x === c.x && bed.y === c.y;
          return (
            <button key={i} type="button" aria-pressed={on} aria-label={k('cards.aria', { load: loadWords(k, c, task).replace(/[⁦⁩]/g, '') })} data-bl-card={i} data-weighed={weighed(c) ? 'true' : 'false'} dir="ltr"
              onPointerDown={down(i)} onPointerMove={move} onPointerUp={up(i)} onPointerCancel={() => setG(null)} onClick={click(i)} onKeyDown={key(i)} style={{ touchAction: 'none' }}
              className={`relative flex min-h-[48px] items-center justify-center rounded-xl border-2 px-1 py-1 text-center ${ring} ${bad ? 'border-rose-500 bg-rose-50 text-rose-900' : lack ? 'border-dashed border-amber-500 bg-amber-50 text-amber-950' : on ? 'border-sky-600 bg-sky-600 text-white' : here ? 'border-sky-500 bg-white text-sky-950' : 'border-sky-200 bg-white text-sky-950'}`}>
              <CardFace c={c} twoKinds={task.twoUnknowns} />
              {weighed(c) && <Scale className={`absolute left-1 top-1 h-3 w-3 ${on ? 'text-white' : 'text-sky-500'}`} aria-hidden="true" />}
              {on && <Check className="absolute bottom-0.5 right-1 h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      {g && Math.hypot(g.x - g.sx, g.y - g.sy) > 8 && (
        <div className="pointer-events-none fixed z-50 rounded-xl border-2 border-sky-600 bg-white px-3 py-1 text-sky-950 shadow-lg" style={{ left: g.x, top: g.y, transform: 'translate(-50%, -120%)' }} data-bl-card-ghost>
          <CardFace c={task.cards[g.i]} twoKinds={task.twoUnknowns} />
        </div>
      )}
    </div>
  );
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const f = lab.free;
  const Row = ({ label, value, onLess, onMore, attr }) => (
    <div className="flex items-center gap-1.5" dir="ltr">
      <RoundButton onClick={onLess} aria-label={k('less')} size={40} {...{ [`${attr}-less`]: true }}><Minus className="h-4 w-4" strokeWidth={3} aria-hidden="true" /></RoundButton>
      <span className="flex min-h-[40px] min-w-[8.5rem] items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-200 bg-white px-2 text-emerald-950"><span className="text-[11px] font-black" dir="rtl">{label}</span><span className="text-sm font-black tabular-nums"><bdi>{value}</bdi></span></span>
      <RoundButton primary onClick={onMore} aria-label={k('more')} size={40} {...{ [`${attr}-more`]: true }}><Plus className="h-4 w-4" strokeWidth={3} aria-hidden="true" /></RoundButton>
    </div>
  );
  const R = L.FREE_RANGE;
  const bump = (key, d) => setLab((s) => L.setFree(s, { [key]: s.free[key] + d * R[key].step }));
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-bl-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      {free && (
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-2">
            <Row label={k('free.empty')} value={`${f.e} kg`} attr="data-bl-fe" onLess={() => bump('e', -1)} onMore={() => bump('e', 1)} />
            <Row label={k('free.cementKg')} value={`${f.a} kg`} attr="data-bl-fa" onLess={() => bump('a', -1)} onMore={() => bump('a', 1)} />
            <Row label={k('free.sandKg')} value={`${f.b} kg`} attr="data-bl-fb" onLess={() => bump('b', -1)} onMore={() => bump('b', 1)} />
            <Row label={k('free.limit')} value={`${f.s} kg`} attr="data-bl-fs" onLess={() => bump('s', -1)} onMore={() => bump('s', 1)} />
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={k('free.sign')}>
            <span className="text-xs font-black text-emerald-900">{k('free.sign')}</span>
            {L.SIGNS.map((sg) => (
              <button key={sg} type="button" aria-pressed={f.sign === sg} onClick={() => setLab((s) => L.setFree(s, { sign: sg }))} data-bl-fsign={sg} dir="ltr"
                className={`inline-flex h-10 min-w-[2.75rem] items-center justify-center rounded-xl border-2 px-2 text-lg font-black ${ring} ${f.sign === sg ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-emerald-200 bg-white text-emerald-950'}`}>{sg}</button>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {!free ? (
          <button type="button" onClick={() => setLab(L.freeTask)} data-bl-free-start className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-300 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>{k('free.start')}</button>
        ) : (
          <button type="button" onClick={() => setLab(L.toGuided)} data-bl-free-back className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

export function ruleOptions(k, advanced = false) {
  return advanced
    ? [
      { text: <MathText>{k('rule.advRight')}</MathText>, correct: true },
      { text: <MathText>{k('rule.advOne')}</MathText>, why: <MathText>{k('rule.whyAdvOne')}</MathText> },
      { text: <MathText>{k('rule.advMany')}</MathText>, why: <MathText>{k('rule.whyAdvMany')}</MathText> },
    ]
    : [
      { text: <MathText>{k('rule.right')}</MathText>, correct: true },
      { text: <MathText>{k('rule.count')}</MathText>, why: <MathText>{k('rule.whyCount')}</MathText> },
      { text: <MathText>{k('rule.half')}</MathText>, why: <MathText>{k('rule.whyHalf')}</MathText> },
    ];
}

export function Formal({ lab, k }) {
  const tk = L.taskOf(lab);
  const f = L.formalLines(tk)[0];
  const note = tk.kind === 'claim' ? k('formal.counter', { x: f.x }) : tk.lanes ? k('formal.equal', { x: f.x }) : k(f.note === 'holds' ? 'formal.holds' : 'formal.fails', { x: f.x });
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-bl-formal>
      <p><MathText>{k('formal.intro')}</MathText></p>
      <p className="text-center text-base" dir="ltr"><MathText>{$(f.tex)}</MathText></p>
      <p><MathText>{note}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

export const CHAINS = Object.freeze({
  b1: ['line', 'why20'],
  b2: ['unknowns'],
  b3: ['which', 'twenty'],
  a1: ['howmany'],
  a2: ['rule'],
  a3: ['diff'],
  k1: ['line'],
});
/** Les tâches qui finissent un niveau (ou le module 2) : leur suite achevée ouvre la découverte et la phase formelle. */
const FINAL = new Set(['b3', 'a3', 'k1']);

const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const T = (s) => <MathText>{s}</MathText>;
const hints = (k, id) => [Mx(k, `${id}.hint1`), Mx(k, `${id}.hint2`)];
const choice = (k, id, opts, extra = {}) => ({ id, kind: 'choice', prompt: Mx(k, `${id}.prompt`, extra.params), options: opts, hints: hints(k, id), explain: extra.explain ?? Mx(k, `${id}.explain`, extra.params) });
const numberQ = (k, id, expected, params, shown) => ({ id, kind: 'number', expected: String(expected), answer: T($(String(shown ?? expected))), prompt: Mx(k, `${id}.prompt`, params), hints: hints(k, id), explain: Mx(k, `${id}.explain`, params) });
const opt = (k, id, name, correct) => (correct ? { text: T(k(`cp.${id}.${name}`)), correct: true } : { text: T(k(`cp.${id}.${name}`)), why: Mx(k, `${id}.why${name[0].toUpperCase()}${name.slice(1)}`) });

export const QUESTIONS = {
  /** « ماذا كتب الميزان ؟ » : la masse totale de la PREMIÈRE charge de la tâche, lue sur l'écran. */
  line: (lab, task, k) => {
    const c = task.loads[0]; const r = L.weighAt(task, c.x, c.y);
    return numberQ(k, 'line', r.left, { x: `${LRI}${c.x}${PDI}` }, r.left);
  },
  why20: (lab, task, k) => choice(k, 'why20', [opt(k, 'why20', 'wrongA'), opt(k, 'why20', 'right', true), opt(k, 'why20', 'wrongB')]),
  unknowns: (lab, task, k) => choice(k, 'unknowns', [opt(k, 'unknowns', 'wrongA'), opt(k, 'unknowns', 'right', true), opt(k, 'unknowns', 'wrongB')]),
  which: (lab, task, k) => numberQ(k, 'which', 30, {}, 30),
  twenty: (lab, task, k) => choice(k, 'twenty', [opt(k, 'twenty', 'wrongA'), opt(k, 'twenty', 'right', true), opt(k, 'twenty', 'wrongB')]),
  howmany: (lab, task, k) => choice(k, 'howmany', [opt(k, 'howmany', 'wrongA'), opt(k, 'howmany', 'right', true), opt(k, 'howmany', 'wrongB')]),
  rule: (lab, task, k) => choice(k, 'rule', [opt(k, 'rule', 'wrongA'), opt(k, 'rule', 'wrongB'), opt(k, 'rule', 'right', true)], { explain: <Formal lab={lab} k={k} /> }),
  diff: (lab, task, k) => choice(k, 'diff', [opt(k, 'diff', 'wrongA'), opt(k, 'diff', 'right', true), opt(k, 'diff', 'wrongB')]),
};
