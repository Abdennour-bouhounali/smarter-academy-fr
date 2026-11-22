import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Footprints, BookmarkPlus, Check, ChevronLeft, LockKeyhole, Hand, Sparkles, RotateCw, NotebookPen, Ruler, Layers, CheckCircle2 } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { PromptCard, VerdictBanner } from '../primitives/LabKit';
import LabFold from '../primitives/LabFold';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { LEVELS } from '../levels';
import * as L from '../logic/tileYard';
import YardBoard, { geometry as yardGeometry } from './YardBoard';
import FloorBoard, { geometry as floorGeometry } from './FloorBoard';
import { MiniYard, RopeCoil, TONES } from './tileArt';

/**
 * tile-yard — LE CARREAU SOUS LA MAIN (1AM, unité 11, درس « مساحة سطح مستو ومحيطه »). Logique : `logic/tileYard.js` (+ `core/arithmetic/surfaces.js`).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. Une cour de carreaux de zellige. La main tient UN CARREAU (une unité d'aire) et le porte : glissé, toucher-toucher, ou clavier.
 * B. Deux mesures qu'on LIT, côte à côte, jamais fusionnées : « البلاطات » (l'aire, le nombre de carreaux) et « السياج » (le périmètre, le nombre
 *    de bâtons de clôture) ; « أمشِ حول السياج » : la jardinière marche et un compteur tique par bâton — le périmètre devient une longueur marchée.
 * C. La géométrie résiste : un carreau qui détacherait la cour (un coin seulement), la couperait en deux, refermerait un creux, ou ferait
 *    éclater la corde revient en secouant, avec sa raison écrite. Chaque pose est un essai (pas de « جرّب كل الإمكانيات » : type NON éligible).
 * D. La phase formelle nomme l'aire (le nombre d'unités d'aire qui couvrent) et le périmètre (la longueur du bord) avec SES cours gardés.
 * E. Les fausses conjectures sont réfutées avec SES cours : même nombre de carreaux / clôtures différentes ; même corde / aires différentes.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        aire = combien d'unités d'aire couvrent ; périmètre = longueur du bord ; deux grandeurs indépendantes
 *   OBJECT         une cour pavée de zellige, sa clôture de bois, un tas de carreaux, un rouleau de corde ; une terrasse à paver
 *   VARIABLE       la place d'un carreau (fence) ; la présence d'un carreau sous une corde fixe (rope) ; le carreau posé sur le sol (floor)
 *   INVARIANT      fence : 12 carreaux ; rope : 12 bâtons ; floor : la surface à couvrir
 *   TRANSFORMATION chaque pose change la clôture sans changer l'aire (fence), ou l'aire sans changer la clôture (rope)
 *   CONSTRAINT     cour d'un seul tenant (côtés), sans creux ; corde ≤ 12 ; carreau entier / demi / double qui va sur sa cellule
 *   RESISTANCE     detached · splits · hole · rope · overlap · outside · unit
 *   EVIDENCE       les deux compteurs, la clôture éclairée bâton par bâton, le fantôme en pointillés, le carnet de cours
 *   CONTRAST       2×6 (16) / 3×4 (14) / un long ruban (26) ; 9 carreaux / 5 carreaux avec la même corde ; 21 unités ① / 10,5 unités ②
 *   PREDICTION     aucune carte : chaque pose est jugée par la géométrie
 *   DISCOVERY      « ماذا بقي ثابتًا ؟ » (fence) · « هل يتعيّن عدد البلاطات بالحبل ؟ » (rope)
 *   FORMALIZATION  مساحة السطح · محيطه · les trois phrases avec ses propres cours
 *   TRANSFER       les modules suivants et la banque
 *
 * « جرّب كل الإمكانيات » : NON (chaque pose EST une réponse). « جرّب أعدادك » : rien à taper ici, volontairement absent.
 *
 * D'UN SEUL REGARD (§8bis) : `[data-ty-glance]` enveloppe la consigne, le plateau, les deux compteurs et les commandes ; le carnet et le texte
 * secondaire sont dans le panneau latéral (large) ou dessous (étroit). Tablette et ordinateur seulement (≥ 768 px).
 *
 * ONBOARDING : `logic/tileYard.js › coachOf` (pick · walk · keep · again · next | add · more | pick · sweep · half · double · halfTwo · confirm).
 *
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 1, 2026-10-28) : `checkpoints` (défaut true). Après
 * CHAQUE tâche (cour gardée qui remplit le but ; scène lue), une suite par-dessus le labo (`CHAINS`) : fence — la clôture lue · pourquoi
 * elle raccourcit ; 20 bâtons — les carreaux lus · même aire ? · LA RÈGLE ; rope — les carreaux lus · même corde ? · LA RÈGLE ; floor — les
 * demis · la lecture ; la seconde unité · le rapport. La règle (l'ancienne découverte) formalise dans `onDone` ; la dernière tâche d'une cour
 * n'ouvre sa suite que quand la découverte est prête (3 cours gardés). « أعِد التجربة » remet LA MÊME tâche (`L.retryTask`) ; « إعادة »
 * la tâche 1. Mode guidé (`guided`) dès qu'une suite est active ; l'enseignant seul coupe les questions pour SON compte. ÉTAPES `LabStepper`
 * (`[data-ty-step=<i>]`) et la fête par tâche. SON : `tooth` pour un carreau posé, déplacé, retiré (plus grave), `bell` une cour gardée ou
 * une marche autour de la clôture, `flag` une tâche remplie ou une lecture confirmée, `over` un refus.
 * Props (contrat fixé avec la leçon) : `world` ('yard' | 'floor'), `mode` ('fence' | 'rope', yard), `tasks` (floor : les scènes), `level`, `levels`, `coach`,
 * `title`, `lead`, `onTrial(événement)` (par `state.report`), `onFinished({ world, mode })`.
 *
 * CONTRAT DOM : [data-tile-yard][data-world][data-mode][data-task], [data-ty-glance], [data-ty-tile=<r>-<c>], [data-ty-area], [data-ty-fence],
 * [data-ty-walk], [data-ty-keep], [data-ty-notebook] [data-ty-stamp], [data-ty-refused=<reason>], [data-ty-rope][data-used], [data-ty-heap],
 * [data-ty-floor][data-scene], [data-ty-box=<kind>], [data-ty-reading], [data-ty-verdict], [data-ty-confirm], [data-ty-next], [data-ty-rotate].
 */
const NS = 'manipulation.tileYard';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const MAX_W = 1000;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const MOTION_CSS = '@keyframes ty-wobble{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}45%{transform:translateX(5px)}70%{transform:translateX(-3px)}}'
  + '@keyframes ty-glow{0%,100%{fill-opacity:.22}50%{fill-opacity:.42}}@keyframes ty-pop{from{opacity:.3;transform:scale(.88)}to{opacity:1;transform:scale(1)}}'
  + '@keyframes ty-num{from{transform:scale(.78);opacity:.3}to{transform:scale(1);opacity:1}}'
  + '.ty-wobble{animation:ty-wobble .38s ease-in-out}.ty-glow{animation:ty-glow 1.3s ease-in-out infinite}.ty-pop{animation:ty-pop .2s ease-out both}.ty-num{animation:ty-num .22s ease-out both}'
  + '@media (prefers-reduced-motion:reduce){.ty-wobble,.ty-glow,.ty-pop,.ty-num{animation:none}}';

export function numbersFor({ world, mode, tasks, level }) {
  if (world === 'floor') return { world: 'floor', mode: 'floor', tasks: L.tasksFor('floor', 'fence', tasks) };
  const asked = LEVELS['tile-yard'][resolveLevelId(level ?? 'beginner')].numbers;
  return { world: 'yard', mode: mode ?? asked.mode };
}

const useReduced = () => {
  const [r, setR] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setR(m.matches);
    const f = () => setR(m.matches);
    m.addEventListener?.('change', f);
    return () => m.removeEventListener?.('change', f);
  }, []);
  return r;
};

export default function TileYard({
  world, mode, tasks, title, lead, level, levels: withLevelsProp = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const withLevels = world === 'floor' ? false : withLevelsProp;
  const initialNumbers = useMemo(() => numbersFor({ world, mode, tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'tile-yard', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (epoch), un autre niveau : TOUT recommence — la tâche 1, le carnet, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const floor = lab.world === 'floor';
  const ready = L.discoveryReady(lab);
  // les questions pendant le labo : la suite de la tâche courante (`chainsOf`)
  const cpSettings = useLabCheckpointSettings('tile-yard');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const chains = cpOn && cpSettings.enabled ? chainsOf(lab) : null;
  const curTask = L.taskOf(lab);
  const chain = chains?.[curTask] ?? null;
  const ruleByCheckpoint = !!chains && !floor;
  const cpReached = taskReached(lab, lab.ti);
  const cp = useLabCheckpoint({
    id: chain ? curTask : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, curTask, k)) : null,
    reached: cpReached,
    resetKey: scene.inits,
    onRetry: () => setLab(L.retryTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (chains?.[id]?.includes('rule')) { state.discover(); state.formalize(); } },
  });
  useEffect(() => { if (ready && !ruleByCheckpoint) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son de chaque geste jugé (muet sans « الصوت »)
  const lastSeen = useRef(lab.last);
  useEffect(() => {
    const v = lab.last;
    if (v === lastSeen.current) return;
    lastSeen.current = v;
    if (!v) return;
    const e = v.event;
    if (e === 'refused' || e === 'duplicate') playSfx('over');
    else if (e === 'task' || e === 'read') playSfx('flag');
    else if (e === 'keep' || e === 'walk') playSfx('bell');
    else playSfx('tooth', { pitch: e === 'remove' || e === 'unlay' ? 0.75 : 1 });
  }, [lab.last]);
  // les étapes : une tâche est FAITE quand son but est atteint ET que ses questions sont répondues ; on la fête une fois
  const stepDone = lab.tasks.map((_, i) => taskReached(lab, i) && (i !== lab.ti || !cp.blocking));
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.events.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps
  const steps = lab.tasks.length > 1 ? <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-ty-step" /> : null;
  const cpBox = { cp, party, steps };
  useEffect(() => {
    if (floor && ready) { state.formalize(); state.report(onFinished, { world: 'floor', mode: 'floor' }); }
  }, [floor, ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const reported = useRef(0);
  const nEv = lab.events.length;
  useEffect(() => {
    if (nEv < reported.current) reported.current = 0;
    for (let i = reported.current; i < nEv; i += 1) state.report(onTrial, lab.events[i]);
    reported.current = nEv;
  }, [nEv, lab.events]); // eslint-disable-line react-hooks/exhaustive-deps

  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'tile-yard', step: coachStep,
    text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });

  const boxRef = useRef(null);
  const [width, setWidth] = useState(720);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => setWidth(Math.max(300, Math.min(MAX_W, Math.floor(el.clientWidth))));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : (typeof window !== 'undefined' ? window.innerHeight : 768);

  const discovery = !floor ? (
    <ManipulationDiscovery state={state} prompt={k(lab.mode === 'rope' ? 'discovery.promptRope' : 'discovery.promptFence')} options={discoveryOptions(lab, k)} formal={<Formal lab={lab} k={k} />}
      onFormalized={() => state.report(onFinished, { world: 'yard', mode: lab.mode })} />
  ) : null;

  return (
    <ManipulationShell type="tile-yard" title={title ?? k('title')} titleHidden state={state} allowModeSwitch={allowModeSwitch} allowFreeLab={false}
      coach={coachOn ? coach : null} hints={[0, 1, 2].map((i) => k(`hints.${floor ? 'floor' : lab.mode}.${i}`))}
      guided={!!chain || ruleByCheckpoint} headerAction={cpSettings.control}
      controller={{ autoStep: () => false, canAutoStep: () => false }} discovery={discovery} explanation={k('explanation')}>
      <ManipulationStage className="bg-gradient-to-b from-amber-50/60 to-white">
        <div ref={boxRef} className="space-y-2" data-tile-yard data-world={lab.world} data-mode={lab.mode} data-task={L.taskOf(lab)} data-solved={ready ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: MOTION_CSS }} />
          {floor
            ? <FloorLab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cpBox={cpBox} />
            : <YardLab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cpBox={cpBox} />}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Pièces communes ══════════════ */

const Big = ({ children, dataAttr, label, small = false }) => (
  <bdi dir="ltr" key={String(children)} className={`ty-num inline-block ${small ? 'text-3xl' : 'text-4xl'} font-black leading-none tabular-nums text-indigo-800`} {...dataAttr} aria-label={label}>{children}</bdi>
);

function Meter({ icon: Icon, label, value, noun, dataAttr, children, tone = 'indigo', compact = false }) {
  const ring2 = tone === 'amber' ? 'ring-amber-200 bg-amber-50/60' : 'ring-indigo-100 bg-white';
  return (
    <div className={`min-w-0 rounded-2xl px-2.5 py-2 ring-2 ${ring2}`} data-ty-meter>
      <p className="flex items-center gap-1 text-xs font-black text-indigo-900/80"><Icon className="h-4 w-4 shrink-0" aria-hidden="true" />{label}</p>
      <p className="flex items-baseline gap-1.5"><Big dataAttr={dataAttr} small={compact}>{value}</Big><span className="text-xs font-extrabold text-indigo-900/70">{noun}</span></p>
      {!compact && children}
    </div>
  );
}

function TileIcons({ n }) {
  return (
    <div className="mt-1 flex flex-wrap gap-[3px]" aria-hidden="true" data-ty-icons="tiles">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="inline-block h-[11px] w-[11px] rounded-[3px] border" style={{ background: TONES[i % 3].mid, borderColor: TONES[i % 3].base }} />
      ))}
    </div>
  );
}
function StickIcons({ n }) {
  return (
    <div className="mt-1 flex flex-wrap gap-[3px]" aria-hidden="true" data-ty-icons="sticks">
      {Array.from({ length: n }, (_, i) => <span key={i} className="inline-block h-[11px] w-[5px] rounded-full bg-amber-700" />)}
    </div>
  );
}

function walkNarrow(width) { return width < 600; }

/* ══════════════ Monde yard ══════════════ */

function YardLab({ lab, setLab, k, width, screenH, lead, cpBox }) {
  const rope = lab.mode === 'rope';
  const reduce = useReduced();
  const side = !walkNarrow(width);
  const sideW = side ? (width < 800 ? 214 : 250) : 0;
  const c = (() => {
    const geo = yardGeometry(1, rope);
    const cw = ((side ? width - sideW - 12 : width - 4)) / geo.w;
    const budget = side ? screenH - 310 : screenH - 470;
    const ch = budget / geo.h;
    return Math.max(26, Math.min(62, Math.floor(Math.min(cw, ch))));
  })();
  const [wobble, setWobble] = useState(null);
  const setWobbleKey = (id) => setWobble((w) => ({ id, n: (w?.n ?? 0) + 1 }));
  const [walk, setWalk] = useState(null);
  const cellsKey = lab.tiles.map((q) => `${q.r},${q.c}`).join('|');
  useEffect(() => { setWalk(null); }, [cellsKey]);
  useEffect(() => {
    if (!walk) return undefined;
    const total = L.fenceOf(lab);
    const step = reduce ? 0.5 : 0.11;
    const id = setInterval(() => {
      setWalk((w) => {
        if (!w) return w;
        const p = w.p + step;
        return p >= total ? { p: total, end: true } : { p };
      });
    }, 40);
    return () => clearInterval(id);
  }, [!!walk, cellsKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (walk?.end) { setLab((s) => L.walked(s)); const t = setTimeout(() => setWalk(null), 500); return () => clearTimeout(t); }
    return undefined;
  }, [walk?.end]); // eslint-disable-line react-hooks/exhaustive-deps

  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const fenceN = L.fenceOf(lab);
  const tilesN = L.tilesOf(lab);
  const context = lead || k(rope ? 'context.rope' : 'context.fence');
  const question = k(`question.${task}`);
  const prompt = (
    <PromptCard size={side ? 'lg' : 'md'} className={screenH < 800 ? '!space-y-1.5 !p-3.5' : undefined} aside={cpBox.steps} context={context} contextProps={{ 'data-ty-context': task }}
      title={question} titleClassName={!side ? 'text-base' : screenH < 800 ? 'text-lg' : 'text-xl'} lamp={done ? 'on' : 'off'} titleProps={{ 'data-ty-prompt': task, 'data-lit': done ? 'true' : 'false' }} />
  );
  const walking = !!walk;
  const canKeep = L.canKeep(lab);
  const left = L.ropeLeft(lab);
  const nextEl = L.canNext(lab) && !cpBox.cp.blocking && (
    <button type="button" onClick={() => setLab(L.nextTask)} data-ty-next
      className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] active:translate-y-0.5 ${ring}`}>
      {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
    </button>
  );
  const banner = yardBanner(lab, k, walking, ready(lab));
  const panel = (
    <div className="min-w-0 space-y-2" style={side ? { width: sideW } : undefined} data-ty-panel>
      <div className="grid grid-cols-2 gap-2">
        <Meter compact={!side} icon={Layers} label={k('meter.tiles')} value={tilesN} noun={k('unit.tile')} dataAttr={{ 'data-ty-area': tilesN }}><TileIcons n={tilesN} /></Meter>
        <Meter compact={!side} icon={Ruler} label={k('meter.fence')} value={fenceN} noun={k('unit.stick')} tone="amber" dataAttr={{ 'data-ty-fence': fenceN }}><StickIcons n={fenceN} /></Meter>
      </div>
      {rope && <RopeMeter used={fenceN} total={lab.rope} k={k} compact={!side} />}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" data-ty-walk disabled={tilesN === 0 || walking} onClick={() => setWalk({ p: 0 })}
          className={`inline-flex min-h-[48px] items-center justify-center gap-1 rounded-2xl border-2 px-1.5 text-[13px] leading-tight font-black transition-all ${ring} ${tilesN === 0 || walking ? 'border-slate-200 bg-slate-50 text-slate-400' : 'border-amber-500 bg-amber-400 text-amber-950 shadow-[0_4px_0_0_#B45309] active:translate-y-0.5 active:shadow-none'}`}>
          <Footprints className="h-5 w-5" aria-hidden="true" /> {k('walk')}
        </button>
        <button type="button" data-ty-keep disabled={!canKeep} onClick={() => setLab(L.keep)}
          className={`inline-flex min-h-[48px] items-center justify-center gap-1 rounded-2xl border-2 px-1.5 text-[13px] leading-tight font-black transition-all ${ring} ${canKeep ? 'border-indigo-600 bg-indigo-600 text-white shadow-[0_4px_0_0_#3730A3] active:translate-y-0.5 active:shadow-none' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
          <BookmarkPlus className="h-5 w-5" aria-hidden="true" /> {rope && !canKeep && tilesN > 0 ? k('keepLeft', { count: left }) : k('keep')}
        </button>
      </div>
      <VerdictBanner tone={banner.tone} icon={banner.icon} size="xs" className="min-h-[3.2rem]" data-ty-banner={lab.last?.event ?? ''}>
        <div className="min-w-0 space-y-1.5">
          <p {...(lab.last?.event === 'refused' ? { 'data-ty-refused': lab.last.reason } : {})}>{banner.text}</p>
          {nextEl}
        </div>
      </VerdictBanner>
      {side && <Notebook lab={lab} k={k} />}
    </div>
  );
  const glance = (
    <div className="relative mx-auto space-y-2.5" style={{ maxWidth: MAX_W }} data-ty-glance>
      {cpBox.party.node}
      {cpBox.cp.node}
      {prompt}
      <div className={side ? 'flex items-start gap-3' : 'space-y-2'}>
        <div className="flex min-w-0 flex-1 justify-center rounded-3xl border-2 border-amber-300/70 bg-[#F3E9CF] p-1.5 shadow-[0_12px_30px_-18px_rgba(146,64,14,0.55)]" data-ty-stage>
          <YardBoard lab={lab} setLab={setLab} k={k} c={c} walk={walk} wobble={wobble} setWobbleKey={setWobbleKey} reduce={reduce} />
        </div>
        {panel}
      </div>
    </div>
  );
  return (
    <>
      {glance}
      {!side && lab.kept.length > 0 && <LabFold id="tile-yard.notebook" title={k('notebook.title')}><Notebook lab={lab} k={k} /></LabFold>}
    </>
  );
}
const ready = (lab) => L.discoveryReady(lab);

function RopeMeter({ used, total, k, compact = false }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-amber-50/70 px-2 py-1.5 ring-2 ring-amber-200" data-ty-rope data-used={used} data-total={total}>
      <RopeCoil w={compact ? 52 : 76} h={compact ? 38 : 54} used={used} total={total} />
      <div className="min-w-0 flex-1">
        <div className="flex gap-[2px]" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => <span key={i} className={`h-3 flex-1 rounded-[3px] border ${i < used ? 'border-amber-800 bg-amber-500' : 'border-dashed border-amber-400 bg-white'}`} />)}
        </div>
        <p className="mt-1 text-xs font-black text-amber-950">{k('ropeUsed', { used: iso(used), total: iso(total) })}</p>
      </div>
    </div>
  );
}

function yardBanner(lab, k, walking, isReady) {
  const last = lab.last;
  const rope = lab.mode === 'rope';
  if (walking) return { tone: 'indigo', icon: Footprints, text: k('b.walking') };
  if (last?.event === 'refused') {
    return { tone: 'rose', icon: LockKeyhole, text: k(`refused.${last.reason}`, { fence: iso(last.fence ?? '') }) };
  }
  if (last?.event === 'duplicate') return { tone: 'amber', icon: NotebookPen, text: k('b.duplicate') };
  if (last?.event === 'task') return { tone: 'emerald', icon: CheckCircle2, text: k(`b.task.${last.task}`, { tiles: iso(last.tiles), fence: iso(last.fence) }) };
  if (last?.event === 'keep') {
    return { tone: 'emerald', icon: NotebookPen, text: L.allTasksDone(lab) && !isReady ? k('b.keepMore') : k('b.kept', { tiles: iso(last.tiles), fence: iso(last.fence) }) };
  }
  if (last?.event === 'walk') return { tone: 'indigo', icon: Footprints, text: k('b.walked', { count: iso(last.fence) }) };
  if (L.allTasksDone(lab) && !isReady) return { tone: 'indigo', icon: NotebookPen, text: k('b.keepMore') };
  if (last && ['move', 'add', 'remove'].includes(last.event)) {
    return { tone: 'indigo', icon: Hand, text: k(`b.${last.event}`, { tiles: iso(last.tiles), fence: iso(last.fence), prev: iso(last.prevFence) }) };
  }
  return { tone: 'indigo', icon: Hand, text: k(rope ? 'idle.rope' : 'idle.fence') };
}

function Notebook({ lab, k }) {
  return (
    <div className="rounded-2xl bg-white/70 p-2 ring-1 ring-amber-200" data-ty-notebook data-count={lab.kept.length}>
      <p className="mb-1 flex items-center gap-1 text-xs font-black text-amber-950"><NotebookPen className="h-3.5 w-3.5" aria-hidden="true" /> {k('notebook.title')}</p>
      {lab.kept.length === 0
        ? <p className="text-[11px] font-bold text-slate-500">{k('notebook.empty')}</p>
        : (
          <ul className="flex flex-wrap gap-1.5">
            {lab.kept.map((e, i) => (
              <li key={e.id} data-ty-stamp={i} data-tiles={e.tiles} data-fence={e.fence} className="ty-pop flex items-center gap-1 rounded-xl bg-[#FBF5E4] px-1 py-0.5 ring-1 ring-amber-300">
                <MiniYard cells={e.cells} box={44} />
                <span className="flex flex-col text-[11px] font-black leading-tight text-indigo-900" dir="ltr"><span>{e.tiles}</span><span className="text-amber-800">{e.fence}</span></span>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}

/* ══════════════ Monde floor ══════════════ */

function FloorLab({ lab, setLab, k, width, screenH, lead, cpBox }) {
  const reduce = useReduced();
  const scene = L.taskOf(lab);
  const sc = L.SCENES[scene];
  const side = !walkNarrow(width);
  const sideW = side ? (width < 800 ? 214 : 250) : 0;
  const c = (() => {
    const geo = floorGeometry(scene, 1);
    const cw = (side ? width - sideW - 12 : width - 4) / geo.w;
    const budget = side ? screenH - 310 : screenH - 440;
    return Math.max(26, Math.min(60, Math.floor(Math.min(cw, budget / geo.h))));
  })();
  const [held, setHeld] = useState(null);
  const [orient, setOrient] = useState('h');
  const [wobble, setWobble] = useState(null);
  const setWobbleKey = (id) => setWobble((w) => ({ id, n: (w?.n ?? 0) + 1 }));
  useEffect(() => { setHeld(null); }, [scene, lab.phase]);
  const done = L.sceneDone(lab);
  const cov = L.covered(lab);
  const rd = L.reading(lab);
  const phaseKey = lab.phase === 'two' ? 'two' : 'one';
  const unitTxt = k(`unit.${phaseKey}`);
  const context = lead || k('context.floor');
  const question = k(`question.${scene}.${phaseKey}`);
  const counts = (() => {
    const n = (kind) => lab.pieces.filter((p) => p.kind === kind).length;
    return rd.unit === 'two'
      ? { a: n('two'), b: n('halfTwo'), ka: 'double', kb: 'halfDouble' }
      : { a: n('one'), b: n('half'), ka: 'tile', kb: 'halfTile' };
  })();
  const verdictText = done ? k('verdict.read', { value: iso(rd.value), unit: unitTxt }) : null;
  const last = lab.last;
  const banner = (() => {
    if (last?.event === 'refused') return { tone: 'rose', icon: LockKeyhole, text: k(`refused.${last.reason}`) };
    if (done) return { tone: 'emerald', icon: CheckCircle2, text: scene === 'terrace-double' ? k('verdict.sameFloor', { one: iso(lab.reads[scene]?.one), two: iso(lab.reads[scene]?.two) }) : verdictText };
    if (lab.phase === 'two' && lab.pieces.length === 0) return { tone: 'indigo', icon: Sparkles, text: k('b.newUnit', { one: iso(lab.reads[scene]?.one) }) };
    if (cov) return { tone: 'indigo', icon: Hand, text: k('b.covered') };
    return { tone: 'indigo', icon: Hand, text: k(`idle.${phaseKey}`) };
  })();
  const nextEl = L.canNext(lab) && !cpBox.cp.blocking && (
    <button type="button" onClick={() => setLab(L.nextScene)} data-ty-next
      className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] active:translate-y-0.5 ${ring}`}>
      {k('nextScene')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
    </button>
  );
  const prompt = (
    <PromptCard size={side ? 'lg' : 'md'} className={screenH < 800 ? '!space-y-1.5 !p-3.5' : undefined} aside={cpBox.steps} context={context} contextProps={{ 'data-ty-context': scene }}
      title={question} titleClassName={!side ? 'text-base' : screenH < 800 ? 'text-lg' : 'text-xl'} lamp={done ? 'on' : 'off'} titleProps={{ 'data-ty-prompt': scene, 'data-lit': done ? 'true' : 'false' }} />
  );
  const panel = (
    <div className="min-w-0 space-y-2" style={side ? { width: sideW } : undefined} data-ty-panel>
      <div className="rounded-2xl bg-white px-3 py-2 ring-2 ring-indigo-100" data-ty-readingcard>
        <p className="flex items-center gap-1 text-xs font-black text-indigo-900/80"><Layers className="h-4 w-4" aria-hidden="true" />{k('reading.label')}</p>
        <p className="flex items-baseline gap-2">
          <bdi dir="ltr" key={rd.value} className="ty-num inline-block text-4xl font-black leading-none tabular-nums text-indigo-800" data-ty-reading={rd.value} data-unit={rd.unit}>{rd.value}</bdi>
          <span className="inline-flex items-center gap-1 text-sm font-extrabold text-indigo-900/80"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white" aria-hidden="true">{rd.unit === 'two' ? '2' : '1'}</span>{k('reading.unit')}</span>
        </p>
        <p className="mt-0.5 text-[11px] font-bold leading-snug text-slate-600" data-ty-counts>
          {k(`reading.${counts.ka}`, { count: counts.a })}{(sc.halves.length > 0 || lab.phase === 'two') && <> {k('reading.plus')} {k(`reading.${counts.kb}`, { count: counts.b })}</>}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {lab.phase === 'two'
          ? (
            <button type="button" data-ty-rotate onClick={() => setOrient((o) => (o === 'h' ? 'v' : 'h'))} disabled={done}
              className={`inline-flex min-h-[48px] items-center justify-center gap-1 rounded-2xl border-2 px-1.5 text-[13px] leading-tight font-black ${ring} ${done ? 'border-slate-200 bg-slate-50 text-slate-400' : 'border-amber-500 bg-amber-400 text-amber-950 shadow-[0_4px_0_0_#B45309] active:translate-y-0.5 active:shadow-none'}`}>
              <RotateCw className="h-5 w-5" aria-hidden="true" /> {k('rotate')}
            </button>
          ) : <span />}
        <button type="button" data-ty-confirm disabled={!L.canConfirm(lab)} onClick={() => setLab(L.confirm)}
          className={`inline-flex min-h-[48px] items-center justify-center gap-1 rounded-2xl border-2 px-1.5 text-[13px] leading-tight font-black ${lab.phase === 'two' ? '' : 'col-span-2'} ${ring} ${L.canConfirm(lab) ? 'border-indigo-600 bg-indigo-600 text-white shadow-[0_4px_0_0_#3730A3] active:translate-y-0.5 active:shadow-none' : done ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
          <Check className="h-5 w-5" aria-hidden="true" /> {done ? k('confirmed') : k('confirm')}
        </button>
      </div>
      <VerdictBanner tone={banner.tone} icon={banner.icon} size="xs" className="min-h-[3.2rem]" data-ty-banner={last?.event ?? ''}>
        <div className="min-w-0 space-y-1.5">
          <p data-ty-verdict={done ? 'read' : undefined} {...(last?.event === 'refused' ? { 'data-ty-refused': last.reason } : {})}>{banner.text}</p>
          {nextEl}
        </div>
      </VerdictBanner>
      {L.finished(lab) && <FloorFormal lab={lab} k={k} />}
    </div>
  );
  return (
    <div className="relative mx-auto space-y-2.5" style={{ maxWidth: MAX_W }} data-ty-glance>
      {cpBox.party.node}
      {cpBox.cp.node}
      {prompt}
      <div className={side ? 'flex items-start gap-3' : 'space-y-2'}>
        <div className="flex min-w-0 flex-1 justify-center rounded-3xl border-2 border-amber-300/70 bg-[#F3E9CF] p-1.5 shadow-[0_12px_30px_-18px_rgba(146,64,14,0.55)]" data-ty-stage>
          <FloorBoard lab={lab} setLab={setLab} k={k} c={c} wobble={wobble} setWobbleKey={setWobbleKey} reduce={reduce} held={held} setHeld={setHeld} orient={orient} setOrient={setOrient} />
        </div>
        {panel}
      </div>
    </div>
  );
}

function FloorFormal({ lab, k }) {
  const r = lab.reads;
  const halves = r['terrace-halves']?.one;
  const dbl = r['terrace-double'];
  return (
    <div className="space-y-1 rounded-2xl border-2 border-emerald-300 bg-emerald-50/80 p-2.5 text-xs font-extrabold leading-relaxed text-emerald-950" data-ty-formal>
      {halves && <p>{k('formal.floorHalves', { value: iso(halves) })}</p>}
      {dbl?.one && dbl?.two && <p>{k('formal.floorDouble', { one: iso(dbl.one), two: iso(dbl.two) })}</p>}
      <p>{k('formal.floorRule')}</p>
    </div>
  );
}

/* ══════════════ La découverte et la règle (yard) ══════════════ */

export function discoveryOptions(lab, k) {
  const w = L.witnesses(lab);
  if (lab.mode === 'rope') {
    return [
      { text: k('discovery.rope.same'), why: k('discovery.rope.whySame', { many: iso(w.many.tiles), few: iso(w.few.tiles), rope: iso(w.rope) }) },
      { text: k('discovery.rope.right'), correct: true },
      { text: k('discovery.rope.longer'), why: k('discovery.rope.whyLonger', { many: iso(w.many.tiles), few: iso(w.few.tiles), rope: iso(w.rope) }) },
    ];
  }
  return [
    { text: k('discovery.fence.same'), why: k('discovery.fence.whySame', { lo: iso(w.lo.fence), hi: iso(w.hi.fence), tiles: iso(w.tiles) }) },
    { text: k('discovery.fence.right'), correct: true },
    { text: k('discovery.fence.less'), why: k('discovery.fence.whyLess', { lo: iso(w.lo.fence), hi: iso(w.hi.fence), tiles: iso(w.tiles) }) },
  ];
}

function StampPair({ pair }) {
  if (!pair) return null;
  return (
    <span className="inline-flex items-center gap-2" data-ty-formal-pair>
      {pair.map((e) => (
        <span key={e.id} className="inline-flex items-center gap-1 rounded-xl bg-[#FBF5E4] px-1 py-0.5 ring-1 ring-amber-300">
          <MiniYard cells={e.cells} box={44} />
          <span className="flex flex-col text-[11px] font-black leading-tight text-indigo-900" dir="ltr"><span>{e.tiles}</span><span className="text-amber-800">{e.fence}</span></span>
        </span>
      ))}
    </span>
  );
}

export function Formal({ lab, k }) {
  const pairs = L.formalPairs(lab);
  const first = lab.kept[0];
  return (
    <div className="space-y-2.5 text-sm font-bold text-emerald-950" data-ty-formal-block>
      <p data-ty-def="area">{k('formal.area')}</p>
      <p data-ty-def="perimeter">{k('formal.perimeter')}</p>
      {first && <p className="text-xs text-slate-700">{k('formal.own', { tiles: iso(first.tiles), fence: iso(first.fence) })}</p>}
      {[['sameAreaOnly', 'formal.sameArea'], ['samePerimeterOnly', 'formal.samePerimeter'], ['sameBoth', 'formal.sameBoth']].map(([key, text]) => pairs[key] && (
        <div key={key} className="flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-200 bg-white/80 p-2" data-ty-sentence={key}>
          <span className="min-w-0 flex-1">{k(text)}</span>
          <StampPair pair={pairs[key]} k={k} />
        </div>
      ))}
    </div>
  );
}


/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de chaque tâche ; `rule` (la découverte) clôt la dernière tâche d'une cour. Le sol n'a pas de règle à découvrir ici. */
export const CHAINS = Object.freeze({
  shortest: ['fenceNum', 'whyShorter'],
  twenty: ['tilesNum', 'sameArea', 'rule'],
  biggest: ['tilesNum', 'ropeSame'],
  smallest: ['tilesNum', 'rule'],
  'terrace-halves': ['halfPair', 'areaNum'],
  'terrace-double': ['twoUnits', 'ratio'],
});

export function chainsOf(lab) {
  const out = {};
  for (const t of lab.tasks) if (CHAINS[t]) out[t] = [...CHAINS[t]];
  return out;
}

/** La tâche i est-elle atteinte ? Son but rempli ; pour la DERNIÈRE tâche d'une cour, aussi la découverte prête (3 cours gardés). */
export function taskReached(lab, i) {
  if (!lab.done[i]) return false;
  if (L.isFloor(lab) || i < lab.tasks.length - 1) return true;
  return L.discoveryReady(lab);
}

const C = (k, key, o) => k(`cp.${key}`, o);
const pick = (list, right, whys) => list.map((text, i) => (i === right ? { text, correct: true } : { text, why: whys[i] }));
/** La cour gardée qui a rempli la tâche (sinon le but lui-même). */
const keptFor = (lab, task) => {
  const goal = L.TASK_GOAL[task] ?? {};
  return [...lab.kept].reverse().find((x) => (goal.fence == null || goal.fence === x.fence) && (goal.tiles == null || goal.tiles === x.tiles))
    ?? { tiles: goal.tiles ?? L.TILES, fence: goal.fence ?? L.ROPE };
};
/** Les lectures d'une scène du sol (celles de l'élève, sinon celles de la scène). */
const floorRead = (lab, scene) => {
  const sc = L.SCENES[scene];
  const halves = sc.whole.length * 2 + sc.halves.length;
  const one = lab.reads?.[scene]?.one ?? (halves % 2 ? `${(halves - 1) / 2},5` : String(halves / 2));
  const two = lab.reads?.[scene]?.two ?? (halves % 4 ? `${Math.floor(halves / 4)},5` : String(halves / 4));
  return { one, two, whole: sc.whole.length, halfCount: sc.halves.length };
};
const num = (v) => String(v).replace(',', '.');

export const QUESTIONS = {
  fenceNum: (lab, task, k) => {
    const x = keptFor(lab, task);
    const o = { fence: iso(x.fence), tiles: iso(x.tiles) };
    return {
      id: 'fenceNum', kind: 'number', expected: String(x.fence), answer: <bdi dir="ltr">{x.fence}</bdi>,
      prompt: C(k, 'fenceNum.prompt', o), hints: [C(k, 'fenceNum.hint1'), C(k, 'fenceNum.hint2')], explain: C(k, 'fenceNum.explain', o),
    };
  },
  whyShorter: (lab, task, k) => {
    const x = keptFor(lab, task);
    const o = { fence: iso(x.fence), tiles: iso(x.tiles) };
    return {
      id: 'whyShorter', kind: 'choice', prompt: C(k, 'whyShorter.prompt', o),
      options: pick([C(k, 'whyShorter.right'), C(k, 'whyShorter.fewer'), C(k, 'whyShorter.smaller')], 0, [null, C(k, 'whyShorter.whyFewer', o), C(k, 'whyShorter.whySmaller')]),
      hints: [C(k, 'whyShorter.hint1'), C(k, 'whyShorter.hint2')], explain: C(k, 'whyShorter.explain', o),
    };
  },
  tilesNum: (lab, task, k) => {
    const x = keptFor(lab, task);
    const o = { fence: iso(x.fence), tiles: iso(x.tiles) };
    return {
      id: 'tilesNum', kind: 'number', expected: String(x.tiles), answer: <bdi dir="ltr">{x.tiles}</bdi>,
      prompt: C(k, `tilesNum.prompt.${lab.mode === 'rope' ? 'rope' : 'fence'}`, o), hints: [C(k, 'tilesNum.hint1'), C(k, 'tilesNum.hint2', o)], explain: C(k, 'tilesNum.explain', o),
    };
  },
  sameArea: (lab, task, k) => {
    const w = L.witnesses(lab);
    const o = { lo: iso(w.lo.fence), hi: iso(Math.max(w.hi.fence, 20)), tiles: iso(w.tiles) };
    return {
      id: 'sameArea', kind: 'choice', prompt: C(k, 'sameArea.prompt', o),
      options: pick([C(k, 'sameArea.same'), C(k, 'sameArea.bigger', o), C(k, 'sameArea.smaller', o)], 0, [null, C(k, 'sameArea.whyBigger', o), C(k, 'sameArea.whySmaller', o)]),
      hints: [C(k, 'sameArea.hint1'), C(k, 'sameArea.hint2', o)], explain: C(k, 'sameArea.explain', o),
    };
  },
  ropeSame: (lab, task, k) => {
    const x = keptFor(lab, task);
    const o = { rope: iso(lab.rope ?? L.ROPE), tiles: iso(x.tiles) };
    return {
      id: 'ropeSame', kind: 'choice', prompt: C(k, 'ropeSame.prompt', o),
      options: pick([C(k, 'ropeSame.square'), C(k, 'ropeSame.long'), C(k, 'ropeSame.any')], 0, [null, C(k, 'ropeSame.whyLong', o), C(k, 'ropeSame.whyAny', o)]),
      hints: [C(k, 'ropeSame.hint1'), C(k, 'ropeSame.hint2')], explain: C(k, 'ropeSame.explain', o),
    };
  },
  halfPair: (lab, task, k) => {
    const r = floorRead(lab, task);
    const o = { halves: iso(r.halfCount), pairs: iso(r.halfCount / 2) };
    return {
      id: 'halfPair', kind: 'choice', prompt: C(k, 'halfPair.prompt', o),
      options: pick([C(k, 'halfPair.one'), C(k, 'halfPair.two'), C(k, 'halfPair.half')], 0, [null, C(k, 'halfPair.whyTwo'), C(k, 'halfPair.whyHalf')]),
      hints: [C(k, 'halfPair.hint1'), C(k, 'halfPair.hint2')], explain: C(k, 'halfPair.explain', o),
    };
  },
  areaNum: (lab, task, k) => {
    const r = floorRead(lab, task);
    const o = { whole: iso(r.whole), halves: iso(r.halfCount), value: iso(r.one) };
    return {
      id: 'areaNum', kind: 'number', expected: num(r.one), answer: <bdi dir="ltr">{r.one}</bdi>,
      prompt: C(k, 'areaNum.prompt'), hints: [C(k, 'areaNum.hint1', o), C(k, 'areaNum.hint2', o)], explain: C(k, 'areaNum.explain', o),
    };
  },
  twoUnits: (lab, task, k) => {
    const r = floorRead(lab, task);
    const o = { one: iso(r.one), two: iso(r.two) };
    return {
      id: 'twoUnits', kind: 'choice', prompt: C(k, 'twoUnits.prompt', o),
      options: pick([C(k, 'twoUnits.unit'), C(k, 'twoUnits.floor'), C(k, 'twoUnits.mistake')], 0, [null, C(k, 'twoUnits.whyFloor'), C(k, 'twoUnits.whyMistake', o)]),
      hints: [C(k, 'twoUnits.hint1'), C(k, 'twoUnits.hint2')], explain: C(k, 'twoUnits.explain', o),
    };
  },
  ratio: (lab, task, k) => {
    const r = floorRead(lab, task);
    const o = { one: iso(r.one), two: iso(r.two) };
    return {
      id: 'ratio', kind: 'number', expected: '2', answer: <bdi dir="ltr">2</bdi>,
      prompt: C(k, 'ratio.prompt', o), hints: [C(k, 'ratio.hint1'), C(k, 'ratio.hint2', o)], explain: C(k, 'ratio.explain', o),
    };
  },
  rule: (lab, task, k) => ({
    id: 'rule', kind: 'choice', prompt: k(lab.mode === 'rope' ? 'discovery.promptRope' : 'discovery.promptFence'), options: discoveryOptions(lab, k),
    hints: [C(k, `rule.${lab.mode}.hint1`), C(k, `rule.${lab.mode}.hint2`)],
    explain: <div className="space-y-1"><p>{k('formal.area')}</p><p>{k('formal.perimeter')}</p></div>,
  }),
};
