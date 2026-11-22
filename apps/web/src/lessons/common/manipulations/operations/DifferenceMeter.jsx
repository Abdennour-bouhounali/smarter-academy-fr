import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Sparkles, Hand, FlaskConical, Undo2, RotateCcw, ChevronLeft, Plus, Minus, ShieldAlert, ArrowLeftRight, Check } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import { ratTex, ratText } from '@smarter-academy/core/arithmetic/powers.js';
import * as O from '@smarter-academy/core/arithmetic/orderSign.js';
import MathText from '../../components/MathText';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { LabCard, StageFrame, PromptCard, VerdictBanner } from '../primitives/LabKit';
import KidFigure from '../primitives/KidFigure';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { LEVELS } from '../levels';
import * as L from '../logic/differenceMeter';
import { CSS, VB_W, VB_H, RAIL_Y, Bench, Meter, Rail, Bead, Tag, ProbeArt, Lead, Curtain, Lens, LENS, AMBER, BLUE, needleDeg, fmt } from './differenceMeter/art';

/**
 * difference-meter — L'AIGUILLE QUI LIT UNE DIFFÉRENCE : « مقياس الفرق » (3AM, unité 4 « الحساب الحرفي », درس « مقارنة عددين ناطقين », 2026-10-26).
 * La logique, exacte, est dans `logic/differenceMeter.js` (sur `packages/core/arithmetic/orderSign.js`, importé PAR CHEMIN) ; le dessin dans `differenceMeter/art.jsx`.
 * Distinct de `robot-track` (on RÉORDONNE des facteurs), `number-line-pegs` (on PORTE un nombre sur la droite), `loom-threads` (on PLACE des fils), `zero-probe` (UNE sonde, la distance au zéro) et
 * `equality-lanes` (la même opération des deux côtés) : ici deux nombres ne sont JAMAIS placés par la main ; elle BRANCHE deux sondes (quel nombre est soustrait) et lit UNE aiguille.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main branche la sonde rouge et la sonde noire sur les perles (glisser, ou toucher la sonde puis la perle, ou clavier), permute les sondes, ÉCRIT la différence (متقدم), choisit la carte d'ordre ;
 *    dans le monde `race` elle tient x.
 * B. L'aiguille se place à (rouge − noir) et la fenêtre numérique affiche la valeur exacte ; permuter fait traverser l'aiguille, pas la carte juste ; une carte fausse est REFUSÉE avec les deux faits côte à côte.
 * C. Les perles gardent leur place honnête (abscisse = valeur) ; deux perles à moins d'un pixel fusionnent leur étiquette (« حبّتان متراكبتان ») sous la loupe ; le volet et le rideau cachent ce qu'on doit déduire.
 * D. Chaque branchement, lecture, écriture, verdict, x et carte de région est un essai jugé exactement (MANUEL §6bis).
 * E. À découvrir : مبتدئ « متى تميل الإبرة إلى اليمين ؟ » ; متقدم « هل تحتاج إلى a و b لتعرف الترتيب ؟ ».
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        a > b ⟺ a − b > 0 (et <, =) ; l'ordre se lit sur la différence seule ; A − B simplifiée se lit selon x
 *   OBJECT         la paillasse du labo de physique : rail de verre graduée, deux perles, galvanomètre en laiton, sondes rouge et noire ; Reem (KidFigure, hijab) tient les fils
 *   VARIABLE       QUEL nombre est soustrait (le branchement des sondes) ; la différence écrite ; x (monde `race`)
 *   INVARIANT      l'ordre de a et b ne dépend pas de la façon de les soustraire : permuter les sondes change la lecture, pas la carte juste
 *   TRANSFORMATION branchement → lecture ; écriture → volet levé ; x → les perles glissent et l'aiguille suit A(x) − B(x)
 *   CONSTRAINT     deux sondes sur deux perles différentes ; la différence écrite se juge par sa valeur
 *   RESISTANCE     le plus éloigné de zéro n'est pas le plus grand (−3/2 contre −1/2) ; un numérateur plus grand n'est pas un nombre plus grand (9/11 contre 13/16) ; on peut ordonner sans voir a et b
 *   EVIDENCE       le côté de l'aiguille ; deux perles qui se recouvrent mais une aiguille qui tranche ; l'aiguille qui traverse zéro quand x passe c
 *   CONTRAST       d2 (l'aiguille va à gauche pour −3/2 − (−1/2)) ; d3 (0,85 px) ; d6 (rideau) ; e1 (le coefficient de x le plus grand n'est pas toujours le plus grand)
 *   PREDICTION     la différence ÉCRITE avant que le volet ne se lève (متقدم)
 *   DISCOVERY      « متى تميل الإبرة إلى اليمين ؟ » / « هل تحتاج إلى a و b ؟ »
 *   FORMALIZATION  a > b معناه a − b > 0 …
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * D'UN SEUL REGARD (§8bis) : `[data-dm-glance]` enveloppe la consigne, la paillasse, les cartes et le verdict.
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/differenceMeter.js › coachOf` (plug · plug2 · write · swap · verdict · x · coef · cards · next · free).
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 1, 2026-10-28) : `checkpoints` (défaut true). Après CHAQUE
 * tâche, une suite de questions sur ce que l'élève vient de FAIRE se pose par-dessus le labo et retient « التالي » (`chainOf`) : rail la lecture
 * de l'aiguille · l'ordre ; mustSwap la lecture · l'échange (le signe change, pas l'ordre) ; write le dénominateur commun · l'ordre ; rideau
 * l'ordre ; race qui est plus grand à x = 0 · où elles se croisent (ou jamais). La dernière tâche de chaque niveau rail finit par LA RÈGLE
 * (l'ancienne découverte `side` / `need`, qui formalise dans `onDone`). Obligatoires pour tout élève ; l'enseignant seul les coupe pour SON
 * compte (`useLabCheckpointSettings`). ÉTAPES `LabStepper` (`[data-dm-step=<i>]`) + fête ; « إعادة » repart de la tâche 1 ; « أعِد التجربة »
 * remet LA MÊME tâche (`L.restartTask`). SON (`playSfx`) : `tooth` pour brancher / échanger / bouger x, `bell` pour une différence écrite
 * juste ou des coefficients justes, `flag` pour la tâche faite, `over` pour un refus.
 * Props : `tasks`, `world` ('rail' | 'race'), `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({ world })`.
 * CONTRAT DOM : [data-difference-meter][data-world][data-task][data-solved], [data-dm-glance], [data-dm-scene], [data-dm-rail], [data-dm-bead=a|b][data-value], [data-dm-probe=red|black][data-on],
 * [data-dm-swap], [data-dm-needle][data-reading][data-side], [data-dm-window], [data-dm-shutter], [data-dm-write], [data-dm-card=gt|lt|eq|nojudge], [data-dm-cards], [data-dm-curtain], [data-dm-lens],
 * [data-dm-x] (+ -less / -more), [data-dm-coef-panel], [data-dm-coef=p|q], [data-dm-regions], [data-dm-region=<i>], [data-dm-rcard=gt|eq|lt], [data-dm-refused=<reason>], [data-dm-banner], [data-dm-next],
 * [data-dm-free], [data-dm-free-a], [data-dm-free-b], [data-dm-kid], [data-dm-formal].
 */
const NS = 'manipulation.differenceMeter';
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-amber-300';
const M = (tex) => `$${tex}$`;
const ORDER_TEX = { gt: '>', lt: '<', eq: '=' };

export function numbersFor({ tasks, world, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['difference-meter'][lv].numbers;
  const w = world ?? asked.world ?? 'rail';
  return { tasks: tasks ?? (w === 'race' ? L.PRESETS.race.tasks : asked.tasks), world: w };
}

export default function DifferenceMeter({
  tasks, world, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, world, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'difference-meter', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const kind = L.discoveryKind(lab);
  // les questions pendant le labo : la suite de la tâche courante ; celle qui finit par la règle remplace la découverte automatique
  const cpSettings = useLabCheckpointSettings('difference-meter');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpOnNow = cpOn && cpSettings.enabled && !L.isFree(lab);
  const chain = cpOnNow ? chainOf(lab, lab.ti) : null;
  const ruleByCheckpoint = cpOn && cpSettings.enabled && lab.tasks.some((_, i) => chainOf(lab, i).includes('rule'));
  const curTask = L.taskOf(lab);
  const cp = useLabCheckpoint({
    id: chain ? curTask.id : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, curTask, k)) : null,
    reached: L.taskDone(lab),
    resetKey: scene.inits,
    onRetry: () => setLab(L.restartTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: () => { if (chain?.includes('rule')) { state.discover(); state.formalize(); } },
  });
  useEffect(() => { if (kind && !ruleByCheckpoint) state.discover(); }, [kind, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son du geste (muet sans « الصوت ») : brancher, échanger, bouger x ; une écriture juste ; la tâche faite ; un refus
  const heard = useRef({ n: lab.trials.length, at: 0 });
  useEffect(() => {
    const h = heard.current;
    if (lab.trials.length < h.n) h.n = 0;
    const fresh = lab.trials.slice(h.n);
    h.n = lab.trials.length;
    if (!fresh.length) return;
    const kinds = fresh.map((e) => e.kind);
    if (kinds.includes('solved')) playSfx('flag');
    else if (fresh.some((e) => e.ok === false)) playSfx('over');
    else if (fresh.some((e) => (e.kind === 'write' || e.kind === 'coef') && e.ok)) playSfx('bell');
    else if (kinds.some((x) => x === 'plug' || x === 'swap' || x === 'x')) {
      const now = Date.now();
      if (now - h.at > 35) { playSfx('tooth', { pitch: kinds.includes('swap') ? 0.75 : 1 }); h.at = now; }
    }
  }, [lab.trials]);
  const finishedOnce = useRef(false);
  const everyDone = L.allDone(lab);
  useEffect(() => {
    if (!everyDone) { finishedOnce.current = false; return; }
    if (!finishedOnce.current) { finishedOnce.current = true; state.report(onFinished, { world: lab.tasks[0].kind === 'race' ? 'race' : 'rail' }); }
  }, [everyDone]); // eslint-disable-line react-hooks/exhaustive-deps
  const reported = useRef(0);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials < reported.current) reported.current = 0;
    for (let i = reported.current; i < nTrials; i += 1) state.report(onTrial, { ...lab.trials[i] });
    reported.current = nTrials;
  }, [nTrials, lab.trials]); // eslint-disable-line react-hooks/exhaustive-deps

  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'difference-meter', step: coachStep,
    text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });

  const discovery = kind ? (
    <ManipulationDiscovery state={state} prompt={<MathText>{k(`discovery.${kind}.prompt`)}</MathText>} options={discoveryOptions(k, kind)} formal={<Formal k={k} />} />
  ) : null;

  return (
    <ManipulationShell
      type="difference-meter"
      title={title ?? k('title')}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      coach={coachOn ? coach : null}
      headerAction={cpSettings.control}
      guided={!!chain || ruleByCheckpoint}
      hints={[0, 1, 2].map((i) => k(`hints.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={discovery}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/70 to-white">
        <div className="space-y-2" data-difference-meter data-world={L.isRace(lab) ? 'race' : 'rail'} data-task={lab.ti} data-solved={everyDone ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} lead={state.isAuthoredLevel ? lead : null} cp={cp} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

const frac = (r) => Number(r.n) / Number(r.d);

function railTicks(task) {
  const [lo, hi] = task.range;
  const span = hi - lo;
  const out = [];
  const major = span <= 8 ? 1 : 10;
  const minor = span <= 8 ? 0.5 : 5;
  for (let v = lo; v <= hi + 1e-9; v += minor) {
    const isMajor = Math.abs(v / major - Math.round(v / major)) < 1e-9;
    out.push({ x: ((v - lo) / span) * VB_W, major: isMajor, zero: v === 0, ...(isMajor ? { label: String(v).replace('-', '−') } : {}) });
  }
  return out;
}
const vmaxOf = (task) => {
  if (task.kind !== 'race') return Math.max(Math.abs(task.range[0]), Math.abs(task.range[1]));
  let m = 1;
  for (let x = 0; x <= task.xmax; x += 1) m = Math.max(m, Math.abs(frac(O.valueOfExpr({ terms: task.terms }, { n: BigInt(x), d: 1n }))));
  return m;
};

function Lab({ lab, setLab, k, lead, cp }) {
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const race = task.kind === 'race';
  const done = L.taskDone(lab);
  const reading = L.readingOf(lab);
  const shut = L.shutterClosed(lab);
  const shown = L.needleShown(lab);
  const letters = race ? ['A', 'B'] : ['a', 'b'];
  const names = { a: letters[0], b: letters[1] };

  // une étape est FAITE quand la tâche est finie ET que ses questions (LabCheckpoint) sont répondues : la pastille passe au vert et on fête
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // L.init (« إعادة », autre niveau) : on refête
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la consigne : contexte puis UNE question */
  const ctxKey = free ? (race ? 'race' : 'rail') : race ? 'race' : task.curtain ? 'curtain' : task.write ? 'write' : 'rail';
  const qKey = free ? 'free' : race ? 'race' : task.curtain ? 'curtain' : task.write ? 'write' : 'rail';
  const pairLine = !race && !task.curtain ? k('pairLine', { a: M(ratTex(task.a)), b: M(ratTex(task.b)) }) : '';
  const raceLine = race ? k('raceLine', { A: M(`A=${task.textA.replace(/²/g, "^2")}`), B: M(`B=${task.textB.replace(/²/g, "^2")}`) }) : '';
  const curtainLine = task.curtain ? k('curtainLine', { card: M(`${task.curtain.left}-${task.curtain.left === 'a' ? 'b' : 'a'}=${fmtDec(task.curtain.value)}`) }) : '';
  const prompt = (
    <PromptCard size="md"
      context={<MathText>{`${free ? `${k('context.freePrefix')} ` : ''}${k(`context.${ctxKey}`)} ${race ? raceLine : task.curtain ? curtainLine : pairLine}`}</MathText>}
      contextProps={{ 'data-dm-context': ctxKey }}
      title={<MathText>{k(`question.${qKey}`)}</MathText>} titleClassName="text-base" lamp={free ? null : done ? 'on' : 'off'}
      titleProps={{ 'data-dm-prompt': qKey, 'data-lit': done ? 'true' : 'false' }}
      aside={lab.tasks.length > 1 && !free ? <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-dm-step" /> : undefined}
      instruction={lead || undefined} />
  );

  /* ── la paillasse */
  const stage = <Scene lab={lab} setLab={setLab} k={k} names={names} reading={reading} shut={shut} shown={shown} />;

  /* ── les commandes propres à l'épreuve */
  const swapBtn = !race && !task.curtain ? (
    <button type="button" data-dm-swap disabled={!L.plugged(lab) || done || shut} onClick={() => setLab(L.swap)}
      className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border-2 px-3 text-sm font-black ${ring} ${L.plugged(lab) && !done && !shut ? 'border-amber-400 bg-amber-50 text-amber-950' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
      <ArrowLeftRight className="h-4 w-4" aria-hidden="true" /> {k('swap')}
    </button>
  ) : null;

  const cards = <Cards lab={lab} setLab={setLab} k={k} names={names} />;
  const vv = verdictOf(lab, k, names);
  const canNext = L.canNext(lab) && !cp.blocking;
  const Icon = vv.tone === 'emerald' ? CheckCircle2 : vv.tone === 'amber' ? ShieldAlert : vv.tone === 'indigo' ? Hand : Sparkles;
  const btn = `inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border-2 px-3.5 text-sm font-black transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`;
  const banner = (
    <VerdictBanner tone={vv.tone} icon={Icon} size="sm" className="min-h-[2.75rem] !py-1.5" data-dm-banner data-dm-refused={vv.refused || undefined} data-code={vv.code}>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <p className={vv.tone === 'indigo' ? 'font-bold text-indigo-900' : ''}><MathText>{vv.text}</MathText></p>
        <div className="flex flex-wrap items-center gap-2">
          {L.canRetry(lab) && (
            <button type="button" onClick={() => setLab(L.retry)} data-dm-retry className={`${btn} border-amber-400 bg-amber-50 text-amber-950`}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> {k('retry')}
            </button>
          )}
          {canNext && (
            <button type="button" onClick={() => setLab(L.nextTask)} data-dm-next className={`${btn} border-emerald-600 bg-emerald-600 text-white shadow-[0_3px_0_0_#047857]`}>
              {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </VerdictBanner>
  );

  return (
    <>
      <div className="relative space-y-2" data-dm-glance>
        {party.node}
        {cp.node}
        {prompt}
        {stage}
        {race ? <RaceControls lab={lab} setLab={setLab} k={k} /> : (
          <>
            {task.write && L.plugged(lab) && !free && <WritePanel lab={lab} setLab={setLab} k={k} />}
            <div className="flex flex-wrap items-center justify-between gap-2">{swapBtn}</div>
            {cards}
          </>
        )}
        {banner}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} race={race} />
    </>
  );
}

const fmtDec = (r) => {
  const t = ratText(r);
  if (!t.includes('/')) return t;
  const den = Number(r.d);
  let d2 = den; let c2 = 0; while (d2 % 2 === 0) { d2 /= 2; c2 += 1; } let c5 = 0; while (d2 % 5 === 0) { d2 /= 5; c5 += 1; }
  if (d2 !== 1) return t;
  const digits = Math.max(c2, c5);
  const scaled = (r.n < 0n ? -r.n : r.n) * 10n ** BigInt(digits) / r.d;
  const s = String(scaled).padStart(digits + 1, '0');
  return `${r.n < 0n ? '-' : ''}${s.slice(0, s.length - digits)}{,}${s.slice(s.length - digits)}`;
};

/* ══════════════ La scène : paillasse, galvanomètre, rail, perles, sondes ══════════════ */

function Scene({ lab, setLab, k, names, reading, shut, shown }) {
  const task = L.taskOf(lab);
  const race = task.kind === 'race';
  const done = L.taskDone(lab);
  const svgRef = useRef(null);
  const [drag, setDrag] = useState(null);
  const beads = L.beadValues(lab);
  const xa = L.xOf(task, beads.a); const xb = L.xOf(task, beads.b);
  const lay = L.tagLayout(xa, xb);
  const curtain = !race && !!task.curtain;
  const near = !curtain && L.gapPx(lab) < 30;
  const overlap = near && !race;
  const ticks = useMemo(() => railTicks(task), [task]);
  const vmax = useMemo(() => vmaxOf(task), [task]);
  const val = reading ? frac(reading) : 0;
  const deg = shown ? needleDeg(val, vmax) : 0;
  const side = reading ? Math.sign(Number(reading.n)) : null;
  const windowText = shown ? fmt(reading) : '— —';
  const last = lab.last;
  const shakeCls = lab.flash % 2 ? 'dm-shake-a' : 'dm-shake-b';
  const mood = done ? 'proud' : last?.kind === 'refused' ? 'wonder' : 'happy';

  const REST = { red: { x: 150, y: 222 }, black: { x: 450, y: 222 } };
  const off = near ? 18 : 0;
  const tipOf = (which) => {
    if (drag?.which === which) return { x: drag.x, y: drag.y };
    const bead = which === 'red' ? lab.red : lab.black;
    if (!bead) return REST[which];
    const bx = bead === 'a' ? xa : xb;
    return { x: bx + (which === 'red' ? -off : off), y: RAIL_Y - 14 };
  };
  const tips = { red: tipOf('red'), black: tipOf('black') };
  const fixed = race || curtain;

  const toSvg = (e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: p.x, y: p.y };
  };
  const beadNear = (p) => {
    if (curtain) return null;
    if (overlap) {
      // les perles se recouvrent : une poignée par perle dans la loupe (a en haut, b en bas), et sur la rail la moitié haute est a, la moitié basse b
      const hs = [['a', LENS.x, LENS.ya], ['b', LENS.x, LENS.yb]].map(([id, x, y]) => ({ id, d: Math.hypot(p.x - x, p.y - y) })).sort((u, v) => u.d - v.d)[0];
      if (hs.d < 40) return hs.id;
      const onCluster = Math.abs(p.x - (xa + xb) / 2) < 50 && Math.abs(p.y - RAIL_Y) < 50;
      return onCluster ? (p.y < RAIL_Y ? 'a' : 'b') : null;
    }
    const cand = [['a', xa], ['b', xb]].map(([id, x]) => ({ id, d: Math.hypot(p.x - x, p.y - (RAIL_Y - 10)) })).sort((u, v) => u.d - v.d)[0];
    return cand.d < 62 ? cand.id : null;
  };
  const onDown = (which) => (e) => {
    if (fixed || done) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ which, ...toSvg(e), moved: false });
  };
  const onMove = (e) => { if (drag) setDrag((d) => ({ ...d, ...toSvg(e), moved: true })); };
  const onUp = (e) => {
    if (!drag) return;
    const p = toSvg(e);
    const bead = beadNear(p);
    const { which, moved } = drag;
    setDrag(null);
    if (bead && moved) setLab((s) => L.plug(s, which, bead));
    else if (!moved) setLab((s) => L.selectProbe(s, which));
  };
  const onKey = (which) => (e) => {
    if (fixed || done) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLab((s) => L.selectProbe(s, which)); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const leftBead = xa <= xb ? 'a' : 'b'; const rightBead = leftBead === 'a' ? 'b' : 'a';
      setLab((s) => L.plug(s, which, e.key === 'ArrowLeft' ? leftBead : rightBead));
    }
  };
  const probeLabel = (which) => {
    const bead = which === 'red' ? lab.red : lab.black;
    return k(`probe.${which}`, { on: bead ? names[bead] : k('probe.none') });
  };
  const wire = (which) => (
    <Lead key={`w${which}`} from={which === 'red' ? { x: 176, y: 172 } : { x: 424, y: 172 }} to={tips[which]} color={which} />
  );
  const probe = (which) => {
    const bead = which === 'red' ? lab.red : lab.black;
    const t = tips[which];
    const shaking = (last?.kind === 'refused' && last.reason === 'same');
    return (
      <g key={which} data-dm-probe={which} data-on={bead ?? 'none'} data-selected={lab.sel === which ? 'true' : 'false'} role="button" tabIndex={fixed ? -1 : 0} aria-label={probeLabel(which)} aria-pressed={lab.sel === which}
        onPointerDown={onDown(which)} onPointerMove={onMove} onPointerUp={onUp} onKeyDown={onKey(which)} className={`${shaking ? shakeCls : ''} outline-none focus-visible:[&>circle]:stroke-amber-400`} style={{ cursor: fixed ? 'default' : 'grab', touchAction: 'none' }}>
        <ProbeArt x={t.x} y={t.y} color={which} selected={lab.sel === which && !drag} on={!!bead} />
        <circle cx={t.x} cy={t.y - 28} r="34" fill="transparent" stroke="transparent" strokeWidth="3" />
      </g>
    );
  };
  const beadNode = (id) => {
    const v = id === 'a' ? beads.a : beads.b;
    const x = id === 'a' ? xa : xb;
    const hit = { 'data-dm-bead': id, 'data-value': ratText(v), role: 'button', tabIndex: fixed ? -1 : 0, 'aria-label': k('bead.aria', { n: names[id], v: ratText(v) }),
      onClick: () => setLab((s) => L.tapBead(s, id)), onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLab((s) => L.tapBead(s, id)); } },
      style: { cursor: fixed ? 'default' : 'pointer' }, className: 'outline-none' };
    return (
      <g key={id}>
        <Bead x={x} letter={names[id]} tone={id} data-dm-bead-art />
        {!overlap && <g {...hit}><circle cx={x} cy={RAIL_Y} r={Math.min(24, Math.max(15, L.gapPx(lab) / 2))} fill="transparent" /></g>}
      </g>
    );
  };
  const handle = (id) => {
    const y = id === 'a' ? LENS.ya : LENS.yb;
    const v = id === 'a' ? beads.a : beads.b;
    return (
      <g key={`h${id}`} data-dm-bead={id} data-dm-handle data-value={ratText(v)} role="button" tabIndex={0} aria-label={k('bead.aria', { n: names[id], v: ratText(v) })}
        onClick={() => setLab((s) => L.tapBead(s, id))} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLab((s) => L.tapBead(s, id)); } }} style={{ cursor: 'pointer' }} className="outline-none">
        <circle cx={LENS.x} cy={y} r="22" fill="transparent" />
        <circle cx={LENS.x} cy={y} r="17" fill={id === 'a' ? AMBER : BLUE} stroke="#fff" strokeWidth="2.5" />
        <text x={LENS.x} y={y + 6} fontSize="17" fontWeight="900" fill="#fff" textAnchor="middle" style={{ fontStyle: 'italic' }}>{names[id]}</text>
      </g>
    );
  };

  return (
    <StageFrame className="min-w-0 overflow-hidden !p-1.5" data-dm-stage>
      <div dir="ltr" data-dm-scene>
        <svg ref={svgRef} viewBox={`0 0 ${VB_W} ${VB_H}`} className="block h-auto w-full max-h-[46vh]" role="group" aria-label={k('scene.aria')} data-dm-rail>
          <Bench />
          <Rail ticks={ticks} />
          <g data-dm-kid aria-hidden="true">
            <KidFigure cx={56} top={118} foot={232} hairStyle="hijab" scarf="lavender" outfit="violet" skin="medium" mood={mood} />
          </g>
          <g data-dm-needle data-reading={reading ? ratText(reading) : ''} data-side={shown && side !== null ? side : ''}>
            <Meter deg={deg} dim={!shown} shutter={shut} windowText={windowText} side={null} />
          </g>
          {wire('red')}{wire('black')}
          {!curtain && beadNode('a')}{!curtain && beadNode('b')}
          {curtain && <g data-dm-curtain><Curtain /></g>}
          {!curtain && !lay.merged && (
            <>
              <Tag x={lay.a.x} text={fmt(beads.a)} tone="a" data-dm-tag="a" />
              <Tag x={lay.b.x} text={fmt(beads.b)} tone="b" data-dm-tag="b" />
            </>
          )}
          {!curtain && lay.merged && <Tag x={lay.mid} w={L.MERGED_W} text={k('lens.caption')} tone="x" data-dm-tag="merged" />}
          {overlap && <><Lens />{handle('a')}{handle('b')}</>}
          {probe('red')}{probe('black')}
        </svg>
      </div>
    </StageFrame>
  );
}

/* ══════════════ Les cartes d'ordre ══════════════ */

function Cards({ lab, setLab, k, names }) {
  const task = L.taskOf(lab);
  const active = L.cardsActive(lab);
  const wrong = lab.last?.kind === 'refused' && lab.last.reason === 'verdict' ? lab.last.card : null;
  const shakeCls = lab.flash % 2 ? 'dm-shake-a' : 'dm-shake-b';
  const defs = [['gt', '>'], ['lt', '<'], ['eq', '=']];
  const card = (id, tex, extra = '') => (
    <button key={id} type="button" data-dm-card={id} disabled={!active} aria-pressed={lab.verdict === id} onClick={() => setLab((s) => L.chooseCard(s, id))}
      className={`flex min-h-[56px] items-center justify-center rounded-2xl border-[3px] px-2 text-xl font-black transition-transform duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring} ${wrong === id ? shakeCls : ''} ${extra} ${
        lab.verdict === id ? 'border-emerald-600 bg-emerald-600 text-white shadow-[0_4px_0_0_#047857]' : wrong === id ? 'border-rose-400 bg-rose-50 text-rose-900' : active ? 'border-sky-400 bg-white text-sky-950 shadow-[0_4px_0_0_rgba(3,105,161,0.35)]' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
      <span dir="ltr"><MathText>{tex}</MathText></span>
    </button>
  );
  return (
    <div className="space-y-2" data-dm-cards role="group" aria-label={k('cards.aria')}>
      <div className="grid grid-cols-3 gap-2">
        {defs.map(([id, sym]) => card(id, M(`${names.a}${sym}${names.b}`)))}
      </div>
      {task.curtain && (
        <button type="button" data-dm-card="nojudge" disabled={!active} onClick={() => setLab((s) => L.chooseCard(s, 'nojudge'))}
          className={`flex min-h-[48px] w-full items-center justify-center rounded-2xl border-[3px] px-3 text-sm font-black ${ring} ${wrong === 'nojudge' ? `${shakeCls} border-rose-400 bg-rose-50 text-rose-900` : 'border-slate-300 bg-white text-slate-800'}`}>
          {k('cards.nojudge')}
        </button>
      )}
    </div>
  );
}

/* ══════════════ Écrire la différence (volet) ══════════════ */

function Stepper({ label, value, onDec, onInc, dataKey, aria }) {
  const b = `inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-sky-300 bg-white text-sky-900 ${ring}`;
  return (
    <div className="flex items-center gap-1" role="group" aria-label={aria} data-dm-stepper={dataKey}>
      <button type="button" className={b} aria-label={`${label} −`} onClick={onDec}><Minus className="h-4 w-4" aria-hidden="true" /></button>
      <output className="min-w-[3rem] text-center text-xl font-black tabular-nums text-sky-950" dir="ltr" data-value={value}>{value}</output>
      <button type="button" className={b} aria-label={`${label} +`} onClick={onInc}><Plus className="h-4 w-4" aria-hidden="true" /></button>
    </div>
  );
}

function WritePanel({ lab, setLab, k }) {
  const w = lab.written;
  const closed = L.shutterClosed(lab);
  const refused = lab.last?.kind === 'refused' && lab.last.reason === 'write';
  return (
    <LabCard className={`space-y-2 border-sky-200 p-3 ${closed ? 'bg-sky-50/70' : 'bg-emerald-50/70'}`} data-dm-write data-open={closed ? 'false' : 'true'}>
      <p className="text-sm font-black text-sky-950">{closed ? k('write.title') : k('write.done')}</p>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2" dir="ltr">
        <button type="button" data-dm-write-sign={w.sign} disabled={!closed} aria-label={k('write.signAria')} onClick={() => setLab((s) => L.setWritten(s, { sign: -s.written.sign }))}
          className={`inline-flex h-12 w-12 items-center justify-center rounded-full border-[3px] text-3xl font-black ${ring} ${w.sign < 0 ? 'border-red-600 bg-red-600 text-white' : 'border-blue-600 bg-blue-600 text-white'}`}>{w.sign < 0 ? '−' : '+'}</button>
        <div className="flex flex-col items-center gap-1">
          <Stepper label={k('write.num')} aria={k('write.numAria')} value={w.num} dataKey="num" onDec={() => closed && setLab((s) => L.setWritten(s, { num: s.written.num - 1 }))} onInc={() => closed && setLab((s) => L.setWritten(s, { num: s.written.num + 1 }))} />
          <span className="h-1 w-24 rounded bg-sky-900" aria-hidden="true" />
          <Stepper label={k('write.den')} aria={k('write.denAria')} value={w.den} dataKey="den" onDec={() => closed && setLab((s) => L.setWritten(s, { den: s.written.den - 1 }))} onInc={() => closed && setLab((s) => L.setWritten(s, { den: s.written.den + 1 }))} />
        </div>
        <button type="button" data-dm-write-check disabled={!closed} onClick={() => setLab(L.checkWritten)}
          className={`inline-flex min-h-[48px] items-center gap-1.5 rounded-full border-2 px-4 text-base font-black ${ring} ${closed ? 'border-sky-700 bg-sky-600 text-white shadow-[0_3px_0_0_#075985]' : 'border-emerald-300 bg-emerald-50 text-emerald-800'}`}>
          <Check className="h-4 w-4" aria-hidden="true" /> {k('write.check')}
        </button>
      </div>
      {refused && <span className="sr-only" data-dm-write-refused />}
    </LabCard>
  );
}

/* ══════════════ Le monde `race` : x, les coefficients, les régions ══════════════ */

function RaceControls({ lab, setLab, k }) {
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const step = free ? 0.5 : 1;
  const more = lab.x + step <= task.xmax;
  const less = lab.x - step >= 0;
  const btn = `inline-flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-sky-500 bg-white text-sky-900 shadow-[0_3px_0_0_rgba(3,105,161,0.35)] disabled:border-slate-200 disabled:text-slate-300 ${ring}`;
  return (
    <div className="space-y-2">
      <LabCard className="flex items-center gap-3 border-sky-200 bg-white p-2.5" dir="ltr" data-dm-xcard>
        <span className="text-2xl font-black italic text-sky-900" dir="ltr">x</span>
        <button type="button" data-dm-x-less disabled={!less} onClick={() => setLab((s) => L.setX(s, s.x - step))} className={btn} aria-label={k('x.less')}><Minus className="h-5 w-5" aria-hidden="true" /></button>
        <input type="range" data-dm-x min={0} max={task.xmax} step={step} value={lab.x} onChange={(e) => setLab((s) => L.setX(s, Number(e.target.value)))} aria-label={k('x.aria')} aria-valuetext={String(lab.x)}
          className="h-11 min-w-0 flex-1 accent-sky-600" dir="ltr" />
        <button type="button" data-dm-x-more disabled={!more} onClick={() => setLab((s) => L.setX(s, s.x + step))} className={btn} aria-label={k('x.more')}><Plus className="h-5 w-5" aria-hidden="true" /></button>
        <output className="min-w-[3.5rem] text-center text-2xl font-black tabular-nums text-sky-950" dir="ltr" data-dm-x-value>{String(lab.x).replace('.', ',')}</output>
      </LabCard>
      {L.coefOpen(lab) && !lab.coefOk && <CoefPanel lab={lab} setLab={setLab} k={k} />}
      {lab.coefOk && <RegionPanel lab={lab} setLab={setLab} k={k} />}
    </div>
  );
}

function CoefPanel({ lab, setLab, k }) {
  const c = lab.coef;
  return (
    <LabCard className="space-y-2 border-sky-200 bg-sky-50/70 p-3" data-dm-coef-panel>
      <p className="text-sm font-black text-sky-950"><MathText>{k('coef.title')}</MathText></p>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2" dir="ltr">
        <Stepper label="x" aria={k('coef.pAria')} value={c.p} dataKey="p" onDec={() => setLab((s) => L.setCoef(s, { p: s.coef.p - 1 }))} onInc={() => setLab((s) => L.setCoef(s, { p: s.coef.p + 1 }))} />
        <span className="text-2xl font-black italic text-sky-900">x</span>
        <span className="text-2xl font-black text-sky-900" aria-hidden="true">+</span>
        <Stepper label={k('coef.q')} aria={k('coef.qAria')} value={c.q} dataKey="q" onDec={() => setLab((s) => L.setCoef(s, { q: s.coef.q - 1 }))} onInc={() => setLab((s) => L.setCoef(s, { q: s.coef.q + 1 }))} />
        <button type="button" data-dm-coef-check onClick={() => setLab(L.checkCoef)} className={`inline-flex min-h-[48px] items-center gap-1.5 rounded-full border-2 border-sky-700 bg-sky-600 px-4 text-base font-black text-white shadow-[0_3px_0_0_#075985] ${ring}`}>
          <Check className="h-4 w-4" aria-hidden="true" /> {k('write.check')}
        </button>
      </div>
    </LabCard>
  );
}

function regionTex(r) {
  if (r.kind === 'all') return null;
  const c = ratTex(r.bound);
  return r.kind === 'lt' ? `x<${c}` : r.kind === 'eq' ? `x=${c}` : `x>${c}`;
}

function RegionPanel({ lab, setLab, k }) {
  const task = L.taskOf(lab);
  const wrongSet = new Set(lab.last?.kind === 'refused' && lab.last.reason === 'regions' ? [lab.last.region] : []);
  const shakeCls = lab.flash % 2 ? 'dm-shake-a' : 'dm-shake-b';
  const filled = L.regionsFilled(lab);
  const defs = [['gt', '>'], ['eq', '='], ['lt', '<']];
  return (
    <LabCard className="space-y-2 border-sky-200 bg-white p-3" data-dm-regions data-ok={lab.regionsOk ? 'true' : 'false'}>
      <p className="text-sm font-black text-sky-950"><MathText>{k('regions.title', { diff: O.linearTex(task.form) })}</MathText></p>
      {task.regions.map((r, i) => (
        <div key={i} className={`flex flex-wrap items-center justify-between gap-2 ${wrongSet.has(i) ? shakeCls : ''}`} data-dm-region={i} data-kind={r.kind}>
          <span className="min-w-[8rem] text-base font-black text-sky-950" dir="ltr"><MathText>{r.kind === 'all' ? k('regions.all') : M(regionTex(r))}</MathText></span>
          <div className="flex gap-2" role="group" aria-label={k('regions.rowAria')}>
            {defs.map(([id, sym]) => (
              <button key={id} type="button" data-dm-rcard={id} aria-pressed={lab.regionPick[i] === id} disabled={lab.regionsOk} onClick={() => setLab((s) => L.setRegionCard(s, i, id))}
                className={`min-h-[44px] min-w-[68px] rounded-xl border-[3px] px-2 text-lg font-black ${ring} ${lab.regionPick[i] === id ? (lab.regionsOk ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-sky-700 bg-sky-600 text-white') : 'border-sky-300 bg-white text-sky-950'}`}>
                <span dir="ltr"><MathText>{M(`A${sym}B`)}</MathText></span>
              </button>
            ))}
          </div>
        </div>
      ))}
      {!lab.regionsOk && (
        <div className="flex justify-end">
          <button type="button" data-dm-regions-check disabled={!filled} onClick={() => setLab(L.checkRegions)}
            className={`inline-flex min-h-[48px] items-center gap-1.5 rounded-full border-2 px-4 text-base font-black ${ring} ${filled ? 'border-sky-700 bg-sky-600 text-white shadow-[0_3px_0_0_#075985]' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
            <Check className="h-4 w-4" aria-hidden="true" /> {k('write.check')}
          </button>
        </div>
      )}
    </LabCard>
  );
}

/* ══════════════ Le verdict (la bannière) ══════════════ */

function verdictOf(lab, k, names) {
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const last = lab.last;
  const note = free ? ` ${k('v.freeNote')}` : '';
  const rd = (r) => M(ratTex(r));
  const cardTex = (c) => M(`${names.a}${ORDER_TEX[c]}${names.b}`);
  if (last?.kind === 'refused') {
    const r = last.reason;
    if (r === 'same') return { text: k('refuse.same') + note, tone: 'amber', code: 'same', refused: 'same' };
    if (r === 'verdict') {
      if (last.card === 'nojudge') return { text: k('refuse.noJudge', { r: rd(last.reading) }) + note, tone: 'amber', code: 'verdict', refused: 'verdict' };
      if (task.curtain) return { text: k('refuse.verdictCurtain', { r: rd(last.reading), card: cardTex(last.card) }) + note, tone: 'amber', code: 'verdict', refused: 'verdict' };
      return { text: k('refuse.verdict', { red: names[lab.red], black: names[lab.black], r: rd(last.reading), card: cardTex(last.card) }) + note, tone: 'amber', code: 'verdict', refused: 'verdict' };
    }
    if (r === 'write') {
      const w = last.written;
      const mine = M(`${w.sign < 0 ? '-' : ''}\\frac{${w.num}}{${w.den}}`);
      return { text: k('refuse.write', { w: mine, r: rd(last.reading) }) + note, tone: 'amber', code: 'write', refused: 'write' };
    }
    if (r === 'coef') {
      const c = last.written;
      const x = L.xRat(lab);
      const got = O.valueAtTerms([{ c: c.p, p: 1 }, { c: c.q, p: 0 }], x);
      return { text: k('refuse.coef', { w: M(O.linearTex(c)), x: ratTex(x), r: rd(last.reading), got: rd(got) }) + note, tone: 'amber', code: 'coef', refused: 'coef' };
    }
    if (r === 'regions') {
      const reg = task.regions[last.region];
      const card = lab.regionPick[last.region];
      return { text: k('refuse.regions', { x: ratTex(last.sample), r: rd(last.reading), card: M(`A${ORDER_TEX[card]}B`) }) + note, tone: 'amber', code: 'regions', refused: 'regions', reg };
    }
  }
  if (L.taskDone(lab)) return { text: k(L.isRace(lab) ? 'v.solvedRace' : 'v.solved'), tone: 'emerald', code: 'solved' };
  if (last?.kind === 'swapped') return { text: k('v.swapped', { r: rd(L.readingOf(lab)) }) + note, tone: 'indigo', code: 'swapped' };
  if (last?.kind === 'written') return { text: k('v.written', { r: rd(last.value) }) + note, tone: 'emerald', code: 'written' };
  if (last?.kind === 'coef') return { text: k('v.coef', { w: M(O.linearTex(task.form)) }) + note, tone: 'emerald', code: 'coef' };
  if (last?.kind === 'verdict') return { text: k('v.verdict') + note, tone: 'indigo', code: 'verdict' };
  if (L.isRace(lab)) {
    const r = L.readingOf(lab);
    if (lab.coefOk) return { text: k('idle.cards'), tone: 'indigo', code: 'cards' };
    return { text: L.coefOpen(lab) ? k('idle.coef') : k('idle.x', { r: rd(r) }), tone: 'indigo', code: 'x' };
  }
  if (task.curtain) return { text: k('idle.curtain'), tone: 'indigo', code: 'curtain' };
  if (!lab.red || !lab.black) return { text: lab.sel ? k('idle.bead') : k('idle.plug'), tone: 'indigo', code: 'plug' };
  if (L.shutterClosed(lab)) return { text: k('idle.write'), tone: 'indigo', code: 'write' };
  if (task.mustSwap && lab.verdict && !lab.taskSwapped) return { text: k('idle.swap'), tone: 'indigo', code: 'swap' };
  return { text: k('idle.read', { r: rd(L.readingOf(lab)) }), tone: 'indigo', code: 'read' };
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k, race }) {
  const free = L.isFree(lab);
  const [ta, setTa] = useState('');
  const [tb, setTb] = useState('');
  const [bad, setBad] = useState(null);
  const add = () => {
    const v = race ? L.validateFreeRace(ta, tb) : L.validateFreeRail(ta, tb);
    if (!v.ok) { setBad(v.why === 'empty' ? null : { which: v.which, why: v.why }); return; }
    setBad(null); setLab((s) => (race ? L.setFreeRace(s, ta, tb) : L.setFreeRail(s, ta, tb)));
  };
  const onKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } };
  const field = (which, v, set, label) => (
    <label className="flex flex-col gap-1 text-xs font-black text-sky-950">
      <span>{label}</span>
      <input type="text" inputMode="text" autoComplete="off" dir="ltr" value={v} onChange={(e) => set(e.target.value.slice(0, 16))} onKeyDown={onKey} data-dm-free-input={which} {...{ [`data-dm-free-${which}`]: true }}
        aria-label={k(`free.aria.${race ? 'race' : 'rail'}.${which}`)} aria-invalid={bad?.which === which} placeholder={race ? (which === 'a' ? '2x+7' : 'x+10') : (which === 'a' ? '-3/4' : '0,6')}
        className={`h-11 w-32 max-w-full rounded-xl border-2 ${bad?.which === which ? 'border-rose-300' : 'border-sky-300'} bg-white px-2 text-start text-lg font-black tabular-nums text-sky-950 ${ring}`} />
    </label>
  );
  return (
    <LabCard className="space-y-2 border-sky-200 bg-sky-50/50 p-3" data-dm-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-sky-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k(race ? 'free.hintRace' : 'free.hintRail')}</p>
      <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
        {field('a', ta, setTa, race ? 'A' : 'a')}
        {field('b', tb, setTb, race ? 'B' : 'b')}
        <button type="button" onClick={add} data-dm-free-add className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-sky-400 bg-white px-3 text-sm font-black text-sky-900 ${ring}`}>
          <Plus className="h-4 w-4" aria-hidden="true" /> {k('free.add')}
        </button>
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-dm-free-back className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-sky-200 bg-white px-3 text-xs font-bold text-sky-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
      {bad && <p role="alert" className="text-sm font-bold text-rose-700" data-dm-free-refusal={bad.why}>{k(`free.refusal.${bad.why}`)}</p>}
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

export function discoveryOptions(k, kind = 'side') {
  if (kind === 'need') {
    return [
      { text: <MathText>{k('discovery.need.yes')}</MathText>, why: <MathText>{k('discovery.need.whyYes')}</MathText> },
      { text: <MathText>{k('discovery.need.right')}</MathText>, correct: true },
      { text: <MathText>{k('discovery.need.far')}</MathText>, why: <MathText>{k('discovery.need.whyFar')}</MathText> },
    ];
  }
  return [
    { text: <MathText>{k('discovery.side.far')}</MathText>, why: <MathText>{k('discovery.side.whyFar', { eq: M('-\\frac32<-\\frac12') })}</MathText> },
    { text: <MathText>{k('discovery.side.right')}</MathText>, correct: true },
    { text: <MathText>{k('discovery.side.numerator')}</MathText>, why: <MathText>{k('discovery.side.whyNum', { eq: M('\\frac9{11}>\\frac{13}{16}') })}</MathText> },
  ];
}

export function Formal({ k }) {
  return (
    <div className="space-y-2 text-sm font-bold text-sky-950" data-dm-formal>
      <p><MathText>{k('formal.gt')}</MathText></p>
      <p><MathText>{k('formal.lt')}</MathText></p>
      <p><MathText>{k('formal.eq')}</MathText></p>
      <p><MathText>{k('formal.swap')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de la tâche `i` : selon son épreuve ; la dernière tâche d'un niveau rail finit par la règle (`side`, ou `need` s'il y a un rideau). */
export function chainOf(lab, i) {
  const t = lab.tasks[i];
  if (!t) return [];
  if (t.kind === 'race') return ['atZero', raceRoot(t) ? 'cross' : 'never'];
  const base = t.curtain ? ['order'] : t.write ? ['denom', 'order'] : t.mustSwap ? ['reading', 'swap'] : ['reading', 'order'];
  return i === lab.tasks.length - 1 ? [...base, 'rule'] : base;
}

/** Le x où A = B (A − B = p·x + q s'annule), s'il est un entier de [0 ; xmax] — sinon null. */
function raceRoot(t) {
  const f = t.form;
  if (!f || f.p === 0) return null;
  const x = -f.q / f.p;
  return Number.isInteger(x) && x >= 0 && x <= t.xmax ? x : null;
}

const Q = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const cmpTex = (t, card) => M(`${ratTex(t.a)}${ORDER_TEX[card]}${ratTex(t.b)}`);
const cardOf = (r) => (r.n > 0n ? 'gt' : r.n < 0n ? 'lt' : 'eq');

/** Chaque question est construite sur LES nombres de la tâche et sur CE que l'élève a branché (rien en dur). */
export const QUESTIONS = {
  reading: (lab, t, k) => {
    const r = L.readingOf(lab) ?? O.difference(t.a, t.b);
    const redV = lab.red === 'b' ? t.b : t.a; const blackV = lab.red === 'b' ? t.a : t.b;
    const o = { red: M(ratTex(redV)), black: M(ratTex(blackV)), calc: M(`${ratTex(redV)}-${ratTex(blackV)}=${ratTex(r)}`) };
    return {
      id: 'reading', kind: 'number', expected: ratText(r), answer: <MathText>{M(ratTex(r))}</MathText>,
      prompt: Q(k, 'reading.prompt', o), hints: [Q(k, 'reading.hint1', o), Q(k, 'reading.hint2', o)], explain: Q(k, 'reading.explain', o),
    };
  },
  order: (lab, t, k) => {
    const d = O.difference(t.a, t.b);
    const right = cardOf(d);
    const shown = t.curtain ? t.curtain.left === 'a' ? t.curtain.value : O.negateRat(t.curtain.value) : d;
    const o = { a: M(t.curtain ? 'a' : ratTex(t.a)), b: M(t.curtain ? 'b' : ratTex(t.b)), d: M(`a-b=${ratTex(shown)}`) };
    const opt = (card) => (t.curtain ? M(`a${ORDER_TEX[card]}b`) : cmpTex(t, card));
    const whyOf = { gt: Q(k, 'order.whyGt', o), lt: Q(k, 'order.whyLt', o), eq: Q(k, 'order.whyEq', o) };
    return {
      id: 'order', kind: 'choice', cols: 3, prompt: Q(k, t.curtain ? 'order.promptCurtain' : 'order.prompt', o),
      options: ['gt', 'lt', 'eq'].map((c) => (c === right ? { text: <MathText>{opt(c)}</MathText>, correct: true } : { text: <MathText>{opt(c)}</MathText>, why: whyOf[c] })),
      hints: [Q(k, 'order.hint1', o), Q(k, 'order.hint2', o)],
      explain: Q(k, `order.explain.${right}`, { ...o, cmp: opt(right) }),
    };
  },
  swap: (lab, t, k) => {
    const d = O.difference(t.a, t.b);
    const o = { ab: M(`a-b=${ratTex(d)}`), ba: M(`b-a=${ratTex(O.negateRat(d))}`), cmp: cmpTex(t, cardOf(d)) };
    return {
      id: 'swap', kind: 'choice', prompt: Q(k, 'swap.prompt', o),
      options: [
        { text: Q(k, 'swap.right', o), correct: true },
        { text: Q(k, 'swap.flipped'), why: Q(k, 'swap.whyFlipped', o) },
        { text: Q(k, 'swap.same'), why: Q(k, 'swap.whySame', o) },
      ],
      hints: [Q(k, 'swap.hint1'), Q(k, 'swap.hint2', o)], explain: Q(k, 'swap.explain', o),
    };
  },
  denom: (lab, t, k) => {
    const da = Number(t.a.d); const db = Number(t.b.d);
    const lcm = (da * db) / gcd(da, db);
    const opts = [lcm, da + db, Math.max(da, db)];
    const o = { a: M(ratTex(t.a)), b: M(ratTex(t.b)), da: M(String(da)), db: M(String(db)), lcm: M(String(lcm)), sum: M(String(da + db)), max: M(String(Math.max(da, db))) };
    return {
      id: 'denom', kind: 'choice', cols: 3, prompt: Q(k, 'denom.prompt', o),
      options: opts.map((v, i) => (i === 0 ? { text: <MathText>{M(String(v))}</MathText>, correct: true }
        : { text: <MathText>{M(String(v))}</MathText>, why: Q(k, i === 1 ? 'denom.whySum' : 'denom.whyMax', o) })),
      hints: [Q(k, 'denom.hint1', o), Q(k, 'denom.hint2', o)],
      explain: Q(k, 'denom.explain', { ...o, calc: M(`${ratTex(t.a)}-${ratTex(t.b)}=${ratTex(O.difference(t.a, t.b))}`) }),
    };
  },
  atZero: (lab, t, k) => {
    const q = t.form ? t.form.q : 0;
    const right = q > 0 ? 0 : q < 0 ? 1 : 2;
    const o = { A: M(`A=${t.textA.replace(/²/g, '^2')}`), B: M(`B=${t.textB.replace(/²/g, '^2')}`), d: M(`A-B=${q}`) };
    const texts = [Q(k, 'atZero.a'), Q(k, 'atZero.b'), Q(k, 'atZero.eq')];
    const whys = [Q(k, 'atZero.whyA', o), Q(k, 'atZero.whyB', o), Q(k, 'atZero.whyEq', o)];
    return {
      id: 'atZero', kind: 'choice', cols: 3, prompt: Q(k, 'atZero.prompt', o),
      options: texts.map((text, i) => (i === right ? { text, correct: true } : { text, why: whys[i] })),
      hints: [Q(k, 'atZero.hint1'), Q(k, 'atZero.hint2', o)], explain: Q(k, 'atZero.explain', o),
    };
  },
  cross: (lab, t, k) => {
    const x = raceRoot(t);
    const f = t.form;
    const lin = `${f.p === 1 ? '' : f.p === -1 ? '-' : f.p}x${f.q < 0 ? f.q : `+${f.q}`}`;
    const o = { lin: M(`A-B=${lin}`), x: M(`x=${x}`) };
    return {
      id: 'cross', kind: 'number', expected: String(x), answer: <MathText>{M(String(x))}</MathText>,
      prompt: Q(k, 'cross.prompt', o), hints: [Q(k, 'cross.hint1'), Q(k, 'cross.hint2', o)], explain: Q(k, 'cross.explain', o),
    };
  },
  never: (lab, t, k) => {
    const q = t.form ? t.form.q : 0;
    const o = { d: M(`A-B=${q}`) };
    return {
      id: 'never', kind: 'choice', prompt: Q(k, 'never.prompt'),
      options: [
        { text: Q(k, 'never.right', o), correct: true },
        { text: Q(k, 'never.later'), why: Q(k, 'never.whyLater', o) },
        { text: Q(k, 'never.zero'), why: Q(k, 'never.whyZero', o) },
      ],
      hints: [Q(k, 'never.hint1'), Q(k, 'never.hint2', o)], explain: Q(k, 'never.explain', o),
    };
  },
  rule: (lab, t, k) => {
    const kind = lab.tasks.some((x) => x.curtain) ? 'need' : 'side';
    return {
      id: 'rule', kind: 'choice', prompt: <MathText>{k(`discovery.${kind}.prompt`)}</MathText>, options: discoveryOptions(k, kind),
      hints: [Q(k, `rule.${kind}.hint1`), Q(k, `rule.${kind}.hint2`)], explain: <Formal k={k} />,
    };
  },
};
