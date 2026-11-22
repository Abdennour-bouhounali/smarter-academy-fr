import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Droplets, Check } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import MathText from '../../components/MathText';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { LabCard, StageFrame, PromptCard, VerdictBanner } from '../primitives/LabKit';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { LEVELS } from '../levels';
import * as L from '../logic/shadeMatch';
import PaintScene, { CSS as SCENE_CSS } from './shadeMatch/PaintScene';
import { shadeColor, METER, needleDeg, meterPoint } from './shadeMatch/shadeArt';

/**
 * shade-match — LE NUMÉRATEUR SOUS LA MAIN : « آلة مزج الألوان » (3AM, unité 2 « العمليات على الكسور والأعداد الناطقة », درس « تساوي كسرين ومقارنتهما », 2026-10-26).
 * La logique, exacte, est dans `logic/shadeMatch.js` (sur `packages/core/arithmetic/fractions3.js` et `powers.js`, importés PAR CHEMIN) ; le dessin dans
 * `shadeMatch/PaintScene.jsx` et `shadeMatch/shadeArt.js`. Distinct de `fraction-knife` (1AM : la part est fixe, la main tient le nombre de parts d'UN tout), de
 * `fourth-gauges` (2AM : une case manquante d'un tableau de prix, trois balances) et de `scoop-scale` (une masse continue sur une balance d'arrondi) : ici la main
 * VERSE des mesures DISCRÈTES dans un mélange, le juge est une COULEUR que l'œil ne sépare pas près de l'égalité et un mesureur à aiguille qui, lui, tranche — et le
 * cas impossible (aucun entier ne convient) est le cœur de la comparaison.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main appuie la manette (appui prolongé : une mesure toutes les 0,45 s ; un clic : une mesure ; « تصريف » en ôte une ; Espace maintenu, Entrée, Retour arrière).
 * B. La couleur du seau B se teinte en direct de la part de bleu c/(c + d) ; l'aiguille penche selon le signe de c × b − a × d et allume « تطابق » à l'égalité.
 * C. En مبتدئ le mesureur est visible ; en متقدم il est VOILÉ jusqu'à l'engagement (« أثبّت », ou « لا يوجد عدد صحيح » avec les deux voisins écrits).
 * D. Chaque lâcher de la manette est un essai (le c, le verdict) ; chaque engagement aussi.
 * E. À découvrir (مبتدئ, après s1 et s3) : « متى يطابق لونُ الدلو الثاني لونَ المرجع ؟ » — « autant de bleu que de blanc ajouté » et « plus de bleu que de blanc » sont
 *    réfutés avec ses propres nombres.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        a/b = c/d ⇔ a × d = b × c ; c/d < a/b ⇔ c × b < a × d ; deux fractions se comparent sur un même dénominateur (un multiple commun)
 *   OBJECT         la machine à teinter d'un magasin de peinture : un seau de référence scellé, un seau B, un bec de laiton, une manette, deux pastilles et un mesureur ; Amine (KidFigure)
 *   VARIABLE       le nombre c de mesures de bleu versées (un entier, 0 … 40) ; en متقدم l'engagement (c, ou les deux voisins)
 *   INVARIANT      le rapport bleu/blanc fait la teinte : ajouter autant de bleu que de blanc ne la conserve pas
 *   TRANSFORMATION chaque mesure versée → une goutte, une barrette bleue de plus, une teinte plus foncée
 *   CONSTRAINT     c entier ; a, b, d ∈ 1 … 20 en libre ; quand a·d/b n'est pas entier aucun c ne convient
 *   RESISTANCE     l'aiguille (plus clair / plus foncé), l'impossible (deux voisins de part et d'autre du zéro), le voile (متقدم)
 *   EVIDENCE       la teinte, l'aiguille et son lampe, les graduations posées à chaque lâcher (la mémoire des essais), la phrase écrite avec SES nombres
 *   CONTRAST       3/4 et 7/10 : presque la même couleur à l'œil, une aiguille sans ambiguïté ; 7/9 et 10/13 : numérateurs (10 > 7) contre produits en croix (91 > 90)
 *   PREDICTION     le c écrit avant la révélation (متقدم), le seau le plus foncé (a4)
 *   DISCOVERY      « متى يطابق لونُ الدلو الثاني لونَ المرجع ؟ »
 *   FORMALIZATION  3/4 = 6/8 car 3 × 8 = 4 × 6 ; 7/10 < 3/4 car 7 × 4 < 3 × 10
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * « جرّب كل الإمكانيات » : NON (chaque lâcher EST l'essai). « جرّب أعدادك » est TOUJOURS ouvert sous le labo.
 * D'UN SEUL REGARD (§8bis) : `[data-sm-glance]` enveloppe la consigne, la scène, le mesureur, les commandes et le verdict.
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/shadeMatch.js › coachOf` (lever · meter · drain · impossible · commit · free).
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 5, 2026-10-28) : `checkpoints` (défaut true). Après CHAQUE tâche, une suite de questions se pose PAR-DESSUS le labo
 * et retient « المهمة التالية » (`CHAINS`) : s1 le facteur commun · quel seau égale aussi ; s2 les deux produits en croix · ce qu'on remarque ; s3 entre quels entiers · pourquoi aucun · la RÈGLE (l'ancienne
 * découverte, qui formalise) ; a1 produit en croix · le bleu déduit ; a2 entre quels entiers · pourquoi aucun ; a3 réduire la référence · le produit en croix ; a4 les deux produits ; monde `equal` : la
 * référence réduite. OBLIGATOIRES pour tout élève ; l'ENSEIGNANT seul les coupe pour SON compte (`useLabCheckpointSettings`, interrupteur dans l'en-tête) ; coupées, la découverte d'avant reprend.
 * ÉTAPES `LabStepper` (`[data-sm-step=<i>]`) + fête ; « إعادة » repart de la tâche 1 ; « أعِد التجربة » remet LA MÊME tâche. SON (`playSfx`) : `tooth` à chaque mesure versée, `bell` à un lâcher
 * qui tombe pile ou un seau chargé, `flag` à l'objectif, `over` pour un engagement faux.
 * Props : `tasks` ([{ id, a, b, d, veil, kind }]), `world` ('mix' | 'equal'), `level`, `levels`, `coach`, `checkpoints`, `title`, `lead`, `onTrial(event)`, `onFinished({ world })`.
 * CONTRAT DOM : [data-shade-match][data-task][data-solved][data-layout][data-world], [data-sm-glance], [data-sm-stage], [data-sm-svg], [data-sm-lever][data-pressed],
 * [data-sm-drain], [data-sm-blue][data-value], [data-sm-white][data-value], [data-sm-swatch=ref|second][data-color], [data-sm-meter][data-needle][data-veiled], [data-sm-lamp][data-on],
 * [data-sm-tick][data-c][data-verdict], [data-sm-commit], [data-sm-impossible], [data-sm-below], [data-sm-above], [data-sm-pick=first|second], [data-sm-candidate][data-loaded],
 * [data-sm-verdict], [data-sm-log], [data-sm-step], [data-sm-free][data-active], [data-sm-free-a], [data-sm-free-b], [data-sm-free-d], [data-sm-formal], [data-sm-next].
 */
const NS = 'manipulation.shadeMatch';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const WIDE_MIN = 760;
const SIDE_W = 262;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const tex = (a, b) => `\\frac{${a}}{${b}}`;

export function numbersFor({ tasks, world, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['shade-match'][lv].numbers;
  return { tasks: tasks ?? asked.tasks, world: world ?? asked.world ?? 'mix' };
}

export default function ShadeMatch({
  tasks, world, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, world, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'shade-match', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  // les questions pendant le labo : la suite de la tâche courante ; celle qui finit par la règle remplace la découverte automatique
  const cpSettings = useLabCheckpointSettings('shade-match');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const curTask = L.taskOf(lab);
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[curTask.id] ?? null : null;
  const ruleByCheckpoint = cpOn && cpSettings.enabled && lab.tasks.some((tk) => CHAINS[tk.id]?.includes('rule'));
  const cp = useLabCheckpoint({
    id: chain ? curTask.id : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, curTask, k)) : null,
    reached: L.taskDone(lab),
    resetKey: scene.inits,
    onRetry: () => setLab(L.restartTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (CHAINS[id]?.includes('rule')) { state.discover(); state.formalize(); } },
  });
  const ready = L.discoveryReady(lab) && !ruleByCheckpoint;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  const finishedOnce = useRef(false);
  const everyDone = L.allDone(lab);
  useEffect(() => {
    if (!everyDone) { finishedOnce.current = false; return; }
    if (!finishedOnce.current) { finishedOnce.current = true; state.report(onFinished, { world: lab.world }); }
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
    lab: 'shade-match', step: coachStep,
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

  const discovery = (
    <ManipulationDiscovery state={state} prompt={<MathText>{k('discovery.prompt')}</MathText>}
      options={discoveryOptions(lab, k)} formal={<Formal lab={lab} k={k} />} />
  );

  return (
    <ManipulationShell
      type="shade-match"
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
      <ManipulationStage className="bg-gradient-to-b from-indigo-50/70 to-white">
        <div ref={boxRef} className="space-y-2" data-shade-match data-task={lab.ti} data-world={lab.world}
          data-solved={everyDone ? 'true' : 'false'} data-layout={width >= WIDE_MIN ? 'wide' : 'narrow'}>
          <style dangerouslySetInnerHTML={{ __html: SCENE_CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Les mots : « طلقة واحدة / طلقتين / n طلقات / n طلقة » ══════════════ */

function shots(k, n) {
  if (n === 0) return k('shot.zero');
  if (n === 1) return k('shot.one');
  if (n === 2) return k('shot.two');
  return k(n >= 3 && n <= 10 ? 'shot.few' : 'shot.many', { n: iso(String(n)) });
}
function cans(k, n) {
  if (n === 1) return k('can.one');
  if (n === 2) return k('can.two');
  return k(n >= 3 && n <= 10 ? 'can.few' : 'can.many', { n: iso(String(n)) });
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, screenH, lead, cp }) {
  const uid = `sm${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const wide = width >= WIDE_MIN;
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const veil = L.veiled(lab);
  const kind = free ? 'match' : task.kind;
  const canDose = L.canDose(lab);
  const j = L.judge(lab);
  const here = !!lab.settled && lab.settled.c === lab.c;

  /* ── le geste : la manette (appui prolongé = une mesure toutes les 0,45 s) ── */
  const [pressed, setPressed] = useState(false);
  const [drop, setDrop] = useState(0);
  const holdRef = useRef(null);
  const settleRef = useRef(null);
  const prevC = useRef(lab.c);
  useEffect(() => { if (lab.c > prevC.current) setDrop(lab.c); prevC.current = lab.c; }, [lab.c]);
  useEffect(() => () => { clearInterval(holdRef.current); clearTimeout(settleRef.current); }, []);
  const settleSoon = () => { clearTimeout(settleRef.current); settleRef.current = setTimeout(() => setLab((s) => L.release(s)), L.SETTLE_MS); };
  const startHold = () => {
    if (!canDose || holdRef.current) return;
    clearTimeout(settleRef.current);
    setPressed(true);
    setLab((s) => L.dose(s, 1));
    holdRef.current = setInterval(() => setLab((s) => L.dose(s, 1)), L.SHOT_MS);
  };
  const stopHold = () => {
    if (!holdRef.current) return;
    clearInterval(holdRef.current);
    holdRef.current = null;
    setPressed(false);
    setLab((s) => L.release(s));
  };
  const down = (e) => { if (!canDose) return; e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); startHold(); };
  const keyDown = (e) => {
    if (!canDose) return;
    if (e.key === ' ') { e.preventDefault(); if (!e.repeat) startHold(); } else if (e.key === 'Enter') { e.preventDefault(); setLab((s) => L.dose(s, 1)); settleSoon(); } else if (e.key === 'Backspace') { e.preventDefault(); setLab((s) => L.drain(s)); settleSoon(); }
  };
  const keyUp = (e) => { if (e.key === ' ') { e.preventDefault(); stopHold(); } };
  const grabProps = {
    tabIndex: canDose ? 0 : -1, role: 'button', 'aria-pressed': pressed, 'aria-label': done ? k('lever.ariaFrozen') : k('lever.aria'), 'aria-disabled': canDose ? undefined : 'true',
    onPointerDown: down, onPointerUp: stopHold, onPointerCancel: stopHold, onKeyDown: keyDown, onKeyUp: keyUp, style: { touchAction: 'none' },
  };
  const svgRef = useRef(null);

  /* ── la consigne : le contexte, puis UNE question ── */
  const whiteTxt = (n) => cans(k, n);
  const ctx = free ? k('context.free', { blue: shots(k, task.a), white: whiteTxt(task.b), white2: whiteTxt(task.d) })
    : kind === 'compare' ? k('context.compare', { blue: shots(k, task.a), white: whiteTxt(task.b), blue2: shots(k, task.c), white2: whiteTxt(task.d) })
      : kind === 'pick' ? k('context.pick', { blue: shots(k, task.a), white: whiteTxt(task.b) })
        : k('context.mix', { blue: shots(k, task.a), white: whiteTxt(task.b), white2: whiteTxt(task.d) });
  const question = free ? k('question.free') : kind === 'compare' ? k('question.compare') : kind === 'pick' ? k('question.pick') : task.veil ? k('question.veil') : k('question.mix');
  // une étape est FAITE quand la tâche est finie ET que ses questions (LabCheckpoint) sont répondues : la pastille passe au vert et on fête
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-sm-step" />
  );
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // L.init (« إعادة », autre niveau) : on refête
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son (muet sans « الصوت ») : un déclic par mesure versée (plus grave en arrière), une cloche à un lâcher qui tombe pile ou à un seau chargé, le drapeau à l'objectif, « over » à un engagement faux
  const heard = useRef({ c: lab.c, at: 0, n: lab.trials.length, ti: lab.ti });
  useEffect(() => {
    const h = heard.current;
    if (h.ti !== lab.ti || lab.trials.length < h.n) { heard.current = { c: lab.c, at: 0, n: lab.trials.length, ti: lab.ti }; return; }
    if (lab.c !== h.c) {
      const now = Date.now();
      if (now - h.at > 35) { playSfx('tooth', { pitch: lab.c > h.c ? 1 : 0.75 }); h.at = now; }
      h.c = lab.c;
    }
    const fresh = lab.trials.slice(h.n);
    h.n = lab.trials.length;
    if (!fresh.length) return;
    if (fresh.some((e) => e.kind === 'solved')) playSfx('flag');
    else if (fresh.some((e) => (e.kind === 'commit' || e.kind === 'impossible') && e.ok === false)) playSfx('over');
    else if (fresh.some((e) => (e.kind === 'release' && e.ok) || e.kind === 'load')) playSfx('bell');
  }, [lab.c, lab.trials, lab.ti]);
  const prompt = (
    <PromptCard size="md" context={<MathText>{ctx}</MathText>} contextProps={{ 'data-sm-context': free ? 'free' : kind }}
      title={<MathText>{question}</MathText>} titleClassName="text-lg" lamp={free ? null : done ? 'on' : 'off'}
      titleProps={{ 'data-sm-prompt': kind, 'data-lit': done ? 'true' : 'false' }}
      aside={steps || undefined} instruction={lead || (kind === 'match' && !task.veil && !free && lab.ti === 0 ? k('lead') : undefined)} />
  );

  /* ── la scène ── */
  const stageW = wide ? width - SIDE_W - 8 : width;
  const innerH = typeof window !== 'undefined' && window.innerHeight ? window.innerHeight : screenH + 40;
  const hasFields = lab.tasks.some((tk) => tk.veil && tk.kind !== 'compare') && !free;
  const fixed = 322 + (wide ? 0 : 112) + (hasFields ? 44 : 0) + (lab.tasks.length > 1 && lab.ti > 0 ? 30 : 0) + (lead ? 28 : 0);
  const hBudget = Math.max(150, Math.min(300, innerH - 24 - fixed));
  const scale = Math.max(0.62, Math.min(1.25, Math.min(stageW / 440, hBudget / 232)));
  const mood = done || (!veil && here && j.verdict === 'match') ? 'proud' : lab.c > 0 || lab.loaded >= 0 ? 'wonder' : 'happy';
  const stage = (
    <StageFrame className="min-w-0 overflow-hidden" data-sm-stage data-scale={scale.toFixed(2)} data-screen-h={Math.round(screenH)}>
      <PaintScene lab={lab} k={k} uid={uid} width={stageW} scale={scale} mood={mood} pressed={pressed} drop={drop} grabProps={grabProps} svgRef={svgRef} />
    </StageFrame>
  );

  /* ── le mesureur, les pastilles, les compteurs ── */
  const B = L.bucketB(lab);
  const sh = L.shares(lab);
  const meterBlock = (
    <div className="flex flex-col items-center gap-2" data-sm-meter-block>
      <div className="flex items-center justify-center gap-2" dir="ltr">
        <Swatch id="ref" label={k('meter.swatchRef')} color={shadeColor(L.depth(sh.ref))} />
        <Meter lab={lab} k={k} veil={veil} />
        <Swatch id="second" label={k('meter.swatchSecond')} color={shadeColor(L.depth(sh.mix))} />
      </div>
      <div className="grid w-full max-w-[300px] grid-cols-2 gap-2" data-sm-counters>
        <Counter id="blue" label={k('counter.blue')} value={B.c} aria={k('counter.blueAria', { v: iso(B.c) })} tone="blue" />
        <Counter id="white" label={k('counter.white')} value={B.d} aria={k('counter.whiteAria', { v: iso(B.d) })} tone="white" />
      </div>
    </div>
  );

  const past = !free ? lab.tasks.filter((tk, i) => lab.done[i] && i !== lab.ti && tk.kind === 'match') : [];
  const log = past.length > 0 && (
    <div className="flex flex-wrap items-center gap-1.5" data-sm-log>
      <span className="text-xs font-extrabold text-slate-600">{k('log.title')}</span>
      {past.map((tk) => {
        const what = tk.impossible ? k('log.impossibleItem', { a: iso(tk.a), b: iso(tk.b), d: iso(tk.d) }) : k('log.item', { a: iso(tk.a), b: iso(tk.b), d: iso(tk.d), c: iso(tk.goal) });
        return (
          <span key={tk.id} data-sm-log-item={tk.id} aria-label={k('log.aria', { a: iso(tk.a), b: iso(tk.b), d: iso(tk.d), what })}
            className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-900">{what}</span>
        );
      })}
    </div>
  );

  /* ── les commandes ── */
  const btn = `inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border-2 px-3 text-base font-black shadow-[0_3px_0_0_var(--sm-sh)] transition-all duration-150 active:translate-y-0.5 active:shadow-none disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none motion-reduce:transition-none ${ring}`;
  const indigo = `${btn} border-indigo-300 bg-white text-indigo-950 [--sm-sh:#A5B4FC]`;
  const sky = `${btn} border-sky-600 bg-sky-500 text-white [--sm-sh:#0369A1]`;
  const amber = `${btn} border-amber-400 bg-amber-50 text-amber-950 [--sm-sh:#FCD34D]`;
  const drainBtn = (
    <button type="button" className={indigo} onClick={() => { setLab((s) => L.drain(s)); settleSoon(); }} disabled={!canDose || lab.c <= 0} aria-label={k('drain.aria')} data-sm-drain>
      <Undo2 className="h-5 w-5" aria-hidden="true" /> <span dir="rtl">{k('drain.label')}</span>
    </button>
  );
  const showFields = kind === 'match' && !free && task.veil;
  const controls = (
    <LabCard className="space-y-1.5 p-1.5" data-sm-controls>
      {kind === 'compare' && !free && (
        <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label={k('pick.aria')}>
          {['A', 'B'].map((w) => (
            <button key={w} type="button" className={`${indigo} min-w-[150px]`} disabled={done} data-sm-pick={w === 'A' ? 'first' : 'second'}
              data-picked={lab.choice === w ? 'true' : 'false'} onClick={() => setLab((s) => L.chooseDarker(s, w))}>
              <Droplets className="h-5 w-5" aria-hidden="true" /> {k(w === 'A' ? 'pick.first' : 'pick.second')}
            </button>
          ))}
        </div>
      )}
      {kind === 'pick' && !free && (
        <div className="flex flex-wrap items-center justify-center gap-2" role="group">
          {task.candidates.map((x, i) => (
            <button key={`${x.c}-${x.d}`} type="button" className={`${indigo} min-w-[112px] ${lab.loaded === i ? '!border-indigo-600 !bg-indigo-50' : ''}`} onClick={() => setLab((s) => L.loadCandidate(s, i))}
              data-sm-candidate={i} data-loaded={lab.loadedSet.includes(i) ? 'true' : 'false'} data-current={lab.loaded === i ? 'true' : 'false'} aria-label={k('candidate.aria', { c: iso(x.c), d: iso(x.d) })}>
              {lab.loadedSet.includes(i) && <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />}
              <bdi dir="ltr" className="tabular-nums"><MathText>{`$${tex(x.c, x.d)}$`}</MathText></bdi>
            </button>
          ))}
        </div>
      )}
      {kind === 'match' && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {drainBtn}
          {showFields && (
            <button type="button" className={sky} onClick={() => setLab(L.commit)} disabled={done || lab.c === 0} aria-label={k('commit.aria')} data-sm-commit>
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> <span dir="rtl">{k('commit.label')}</span>
            </button>
          )}
          {!free && (
            <button type="button" className={amber} onClick={() => setLab(L.claimImpossible)} disabled={done} aria-label={k('impossible.aria')} data-sm-impossible>
              <span dir="rtl">{k('impossible.label')}</span>
            </button>
          )}
        </div>
      )}
      {showFields && !done && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl bg-amber-50 px-3 py-1" data-sm-fields>
          <span className="text-xs font-extrabold text-amber-900">{k('impossible.fieldsHint')}</span>
          <label className="flex items-center gap-1.5 text-xs font-black text-indigo-950">
            {k('impossible.belowLabel')}
            <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" maxLength={2} value={lab.belowText} onChange={(e) => setLab((s) => L.setBelow(s, e.target.value))}
              aria-label={k('impossible.belowAria')} data-sm-below className={`h-10 w-14 rounded-xl border-2 border-amber-300 bg-white text-center text-lg font-black tabular-nums ${ring}`} />
          </label>
          <label className="flex items-center gap-1.5 text-xs font-black text-indigo-950">
            {k('impossible.aboveLabel')}
            <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" maxLength={2} value={lab.aboveText} onChange={(e) => setLab((s) => L.setAbove(s, e.target.value))}
              aria-label={k('impossible.aboveAria')} data-sm-above className={`h-10 w-14 rounded-xl border-2 border-amber-300 bg-white text-center text-lg font-black tabular-nums ${ring}`} />
          </label>
        </div>
      )}
    </LabCard>
  );

  /* ── le verdict ── */
  const vv = verdictOf(lab, k);
  const canNext = L.canNext(lab) && !cp.blocking;
  const Icon = vv.tone === 'emerald' ? CheckCircle2 : vv.tone === 'indigo' ? Hand : Sparkles;
  const banner = (
    <VerdictBanner tone={vv.tone} icon={wide ? Icon : null} size="sm" className="min-h-[2.75rem] !py-1.5" data-sm-verdict={vv.code}>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <p className={vv.tone === 'indigo' ? 'font-bold text-indigo-900' : ''}>{vv.text}</p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-sm-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );

  return (
    <>
      <div className="relative space-y-2" data-sm-glance>
        {party.node}
        {cp.node}
        {prompt}
        {wide ? (
          <div className="flex items-stretch gap-2">
            <div className="min-w-0 flex-1">{stage}</div>
            <div className="shrink-0" style={{ width: SIDE_W }}>{meterBlock}</div>
          </div>
        ) : (
          <>{meterBlock}{stage}</>
        )}
        {log}
        {controls}
        {banner}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ Les pastilles, le mesureur, les compteurs ══════════════ */

function Swatch({ id, label, color }) {
  return (
    <div className="flex flex-col items-center gap-1" data-sm-swatch={id} data-color={color}>
      <div className="h-[58px] w-[70px] rounded-2xl border-[3px] border-white shadow-[0_2px_8px_rgba(30,27,75,0.25)] ring-2 ring-indigo-100" style={{ background: color }} aria-hidden="true" />
      <span className="text-[11px] font-extrabold text-slate-600" dir="rtl">{label}</span>
    </div>
  );
}

const TICK_ORDER = 7;

function Meter({ lab, k, veil }) {
  const { w, h, cx, cy, r } = METER;
  const t = L.taskOf(lab);
  const on = !veil && L.judge(lab).verdict === 'match' && !L.judge(lab).empty && (L.bucketB(lab).c > 0);
  const pos = veil ? 0 : L.needle(lab);
  const deg = needleDeg(pos);
  const tip = meterPoint(deg, r - 6);
  const shownTicks = !veil && t.kind === 'match' ? lab.seen.slice(-TICK_ORDER) : [];
  const arc = (a0, a1) => {
    const p = meterPoint(a0); const q = meterPoint(a1);
    return `M${p.x.toFixed(1)} ${p.y.toFixed(1)} A${r} ${r} 0 0 1 ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
  };
  const d = L.bucketB(lab).d;
  return (
    <div className="relative" data-sm-meter data-needle={veil ? '' : pos.toFixed(2)} data-veiled={veil ? 'true' : 'false'} role="img" aria-label={veil ? k('meter.veilAria') : k('meter.aria')}>
      <svg viewBox={`0 -30 ${w} ${h + 30}`} width={190} height={Math.round((190 * (h + 30)) / w)} style={{ display: 'block' }}>
        <path d={arc(-METER.maxDeg - 6, -2)} fill="none" stroke="#BFDBFE" strokeWidth={12} strokeLinecap="round" />
        <path d={arc(2, METER.maxDeg + 6)} fill="none" stroke="#1E3A8A" strokeWidth={12} strokeLinecap="round" opacity={0.85} />
        <circle cx={cx} cy={cy - r} r={9} fill={on ? '#34D399' : '#E2E8F0'} stroke={on ? '#059669' : '#94A3B8'} strokeWidth={2.4} data-sm-lamp data-on={on ? 'true' : 'false'} />
        {shownTicks.map((tk) => {
          const p = L.needleAt(t, tk.c, d);
          const a = tk.verdict === 'match' ? 0 : needleDeg(p);
          const q0 = meterPoint(a, r + 9); const q1 = meterPoint(a, r + 22);
          const lbl = meterPoint(a, r + 33);
          return (
            <g key={tk.c} data-sm-tick data-c={tk.c} data-verdict={tk.verdict} aria-label={k('meter.tickAria', { shots: shots(k, tk.c), verdict: k(tk.verdict === 'match' ? 'meter.lamp' : `meter.${tk.verdict}`) })}>
              <line x1={q0.x} y1={q0.y} x2={q1.x} y2={q1.y} stroke="#4F46E5" strokeWidth={3.4} strokeLinecap="round" />
              <text x={lbl.x} y={lbl.y + 4} textAnchor="middle" fontSize={15} fontWeight={900} fill="#312E81">{tk.c}</text>
            </g>
          );
        })}
        {veil ? (
          <g data-sm-cover>
            <circle cx={cx} cy={cy} r={20} fill="#FFFFFF" stroke="#C7D2FE" strokeWidth={3} />
            <text x={cx} y={cy + 8} textAnchor="middle" fontSize={26} fontWeight={900} fill="#6366F1">؟</text>
          </g>
        ) : (
          <g className="sm-needle" style={{ transition: 'transform 140ms ease-out' }}>
            <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="#1E1B4B" strokeWidth={5} strokeLinecap="round" />
            <circle cx={cx} cy={cy} r={8} fill="#1E1B4B" stroke="#FFFFFF" strokeWidth={2.5} />
          </g>
        )}
        <text x={14} y={h - 4} fontSize={17} fontWeight={900} fill="#475569">{k('meter.lighter')}</text>
        <text x={w - 14} y={h - 4} fontSize={17} fontWeight={900} fill="#1E3A8A" textAnchor="end">{k('meter.darker')}</text>
      </svg>
    </div>
  );
}

const TONES = {
  blue: { box: 'border-blue-300 bg-blue-50', title: 'text-blue-900', num: 'text-blue-950' },
  white: { box: 'border-slate-300 bg-white', title: 'text-slate-700', num: 'text-slate-900' },
};
function Counter({ id, label, value, aria, tone }) {
  const T = TONES[tone];
  return (
    <div className={`flex min-h-[50px] items-center justify-between gap-2 rounded-2xl border-2 px-3 py-1 ${T.box}`} data-sm-counter={id} {...{ [`data-sm-${id}`]: '' }} data-value={value} role="group" aria-label={aria}>
      <p className={`text-xs font-black ${T.title}`}>{label}</p>
      <span key={value} className={`text-2xl font-black tabular-nums ${T.num}`} dir="ltr">{value}</span>
    </div>
  );
}

/* ══════════════ Le verdict ══════════════ */

function verdictOf(lab, k) {
  const task = L.taskOf(lab);
  const free = L.isFree(lab);
  const st = lab.settled;
  const j = L.judge(lab);
  const here = st && lab.c === st.c;
  const kind = free ? 'match' : task.kind;
  const sh = (n) => shots(k, n);
  if (lab.refusal) return { text: k(`refusal.${lab.refusal}`), tone: 'rose', code: `refusal-${lab.refusal}` };
  if (free) {
    if (here && j.verdict === 'match' && lab.c > 0) return { text: k('v.freeMatch'), tone: 'emerald', code: 'free' };
    if (here && lab.c > 0) return { text: k(`v.${j.verdict}`, { shots: sh(lab.c) }), tone: j.verdict === 'darker' ? 'amber' : 'indigo', code: '' };
    return { text: k('idle.free'), tone: 'indigo', code: '' };
  }
  if (kind === 'compare') {
    if (!lab.choice) return { text: k('idle.compare'), tone: 'indigo', code: '' };
    const ok = task.darker === lab.choice;
    if (ok) return { text: k(lab.choice === 'A' ? 'v.okCompare' : 'v.okCompareSecond'), tone: 'emerald', code: 'ok' };
    return { text: k(lab.choice === 'A' ? 'v.refutedCompareFirst' : 'v.refutedCompare'), tone: 'amber', code: 'refuted' };
  }
  if (kind === 'pick') {
    if (L.taskDone(lab)) return { text: k('v.pickDone'), tone: 'emerald', code: 'ok' };
    const loaded = lab.loaded >= 0 ? task.candidates[lab.loaded] : null;
    if (loaded) return { text: k(`v.${j.verdict}`, { shots: iso(`${loaded.c}/${loaded.d}`) }), tone: 'indigo', code: j.verdict };
    return { text: k('idle.pick'), tone: 'indigo', code: '' };
  }
  if (L.taskDone(lab)) {
    if (task.impossible) return { text: k('v.okImpossible', { low: sh(task.below), high: sh(task.above) }), tone: 'emerald', code: 'ok' };
    return { text: k('v.ok'), tone: 'emerald', code: 'ok' };
  }
  const last = lab.trials.at(-1);
  if (task.veil && last && last.kind === 'impossible' && !last.ok && lab.revealed) return { text: k('v.impossibleWrong', { low: iso(last.below), high: iso(last.above) }), tone: 'amber', code: 'refuted' };
  if (task.veil && last && last.kind === 'commit' && !last.ok && lab.revealed) return { text: k('v.committedWrong', { shots: sh(last.value), verdict: k(`meter.${L.judge({ ...lab, c: last.value }).verdict === 'lighter' ? 'lighter' : 'darker'}`) }), tone: 'amber', code: 'refuted' };
  if (L.veiled(lab)) return { text: k('idle.veil'), tone: 'indigo', code: '' };
  const pair = lab.seen.find((x) => x.verdict === 'lighter' && lab.seen.some((y) => y.c === x.c + 1 && y.verdict === 'darker'));
  if (task.impossible && pair && L.bracketSeen(lab)) return { text: k('v.bracket', { low: sh(pair.c), high: sh(pair.c + 1) }), tone: 'indigo', code: 'bracket' };
  if (here && lab.c > 0) return { text: k(`v.${j.verdict}`, { shots: sh(lab.c) }), tone: j.verdict === 'darker' ? 'amber' : 'indigo', code: j.verdict };
  return { text: k('idle.mix'), tone: 'indigo', code: '' };
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const base = free ? null : task.id;
  const initial = () => ({ a: String(task.a ?? 3), b: String(task.b ?? 4), d: String(task.d ?? 8) });
  const [v, setV] = useState(initial);
  useEffect(() => { if (!free) setV(initial()); }, [base, free]); // eslint-disable-line react-hooks/exhaustive-deps
  const verdict = L.validateFree(v.a, v.b, v.d);
  const empty = !verdict.ok && verdict.why === 'empty';
  const field = (which) => (e) => {
    const raw = L.latin(e.target.value).replace(/[^0-9]/g, '').slice(0, 2);
    const next = { ...v, [which]: raw };
    setV(next);
    const check = L.validateFree(next.a, next.b, next.d);
    if (check.ok) setLab((s) => L.setFree(s, check.cfg));
  };
  const bad = !verdict.ok && !empty;
  const box = `h-11 w-[72px] rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-emerald-300'} bg-white px-2 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`;
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-sm-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        {[['a', 'blue', 'blueAria'], ['b', 'whiteRef', 'whiteRefAria'], ['d', 'white', 'whiteAria']].map(([w, lbl, aria]) => (
          <label key={w} className="flex flex-col gap-1 text-xs font-black text-indigo-950">
            {k(`free.${lbl}`)}
            <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" value={v[w]} onChange={field(w)} aria-label={k(`free.${aria}`)} aria-invalid={bad}
              {...{ [`data-sm-free-${w}`]: '' }} className={box} />
          </label>
        ))}
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-sm-free-back
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
      {bad && <p role="alert" className="text-sm font-bold text-rose-700" data-sm-free-refusal={verdict.why}>{k('free.range')}</p>}
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

export function discoveryOptions(lab, k) {
  const f = L.formalOf(lab);
  const diff = f.exact.d - f.exact.b;
  return [
    {
      text: <MathText>{k('discovery.plus')}</MathText>,
      why: <MathText>{k('discovery.wherePlus', { b: iso(f.exact.b), d: iso(f.exact.d), diff: iso(diff), c: iso(f.add.c), calc: `$${f.add.c}\\times${f.exact.b}=${f.add.lhs} > ${f.exact.a}\\times${f.exact.d}=${f.add.rhs}$` })}</MathText>,
    },
    { text: <MathText>{k('discovery.right', { a: iso(f.exact.a), b: iso(f.exact.b) })}</MathText>, correct: true },
    {
      text: <MathText>{k('discovery.bigger')}</MathText>,
      why: <MathText>{k('discovery.whereBigger', { c: iso(f.notBigger.c), d: iso(f.notBigger.d) })}</MathText>,
    },
  ];
}

export function Formal({ lab, k }) {
  const f = L.formalOf(lab);
  const eq = `$${tex(f.exact.a, f.exact.b)}=${tex(f.exact.c, f.exact.d)}$`;
  const prodsEq = `$${f.exact.a}\\times${f.exact.d}=${f.exact.b}\\times${f.exact.c}$`;
  const lt = `$${tex(f.gone.below, f.gone.d)}<${tex(f.gone.a, f.gone.b)}$`;
  const prodsLt = `$${f.gone.below}\\times${f.gone.b}<${f.gone.a}\\times${f.gone.d}$`;
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-sm-formal>
      <p><MathText>{k('formal.equal', { eq, prods: prodsEq })}</MathText></p>
      <p><MathText>{k('formal.compare', { lt, prods: prodsLt })}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque tâche : elle interroge ce que l'élève vient de FAIRE ; s3 finit par la règle (l'ancienne découverte). */
export const CHAINS = Object.freeze({
  s1: ['factor', 'whichEqual'],
  s2: ['product', 'equalProducts'],
  s3: ['between', 'whyNone', 'rule'],
  a1: ['product', 'blueFromProd'],
  a2: ['between', 'whyNone'],
  a3: ['reduceRef', 'product'],
  a4: ['crossA', 'crossB'],
  e1: ['reduceRef'],
});

const $ = (s) => `$${s}$`;
const Q = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const at = (list, i) => { const [first, ...rest] = list; const out = [...rest]; out.splice(Math.min(i, out.length), 0, first); return out; };
const gcdN = (a, b) => (b ? gcdN(b, a % b) : a);
const ref = (t) => $(tex(t.a, t.b));

/** Chaque question est construite sur LES nombres de la tâche (rien n'est écrit en dur) ; `k` : les textes de `shadeMatch`. */
export const QUESTIONS = {
  factor: (lab, t, k) => {
    const f = t.goal / t.a;
    const o = { ref: ref(t), a: iso(t.a), b: iso(t.b), c: iso(t.goal), d: iso(t.d), f: iso(t.d / t.b) };
    return {
      id: 'factor', kind: 'number', expected: String(t.d / t.b), answer: <MathText>{$(String(t.d / t.b))}</MathText>,
      prompt: Q(k, 'factor.prompt', o),
      hints: [Q(k, 'factor.hint1', o), Q(k, 'factor.hint2', o)],
      explain: Q(k, 'factor.explain', { ...o, f: iso(f) }),
    };
  },
  whichEqual: (lab, t, k) => {
    const f = 3;
    const ok = $(tex(t.a * f, t.b * f));
    const add1 = $(tex(t.a + t.b, t.b + t.b));
    const add2 = $(tex(t.a + 1, t.b + 1));
    const o = { ref: ref(t), a: iso(t.a), b: iso(t.b), f: iso(f), ok };
    return {
      id: 'whichEqual', kind: 'choice', cols: 3,
      prompt: Q(k, 'whichEqual.prompt', o),
      options: at([
        { text: <MathText>{ok}</MathText>, correct: true },
        { text: <MathText>{add1}</MathText>, why: Q(k, 'whichEqual.whyAdd', { ...o, x: add1, n: iso(t.b) }) },
        { text: <MathText>{add2}</MathText>, why: Q(k, 'whichEqual.whyAdd', { ...o, x: add2, n: iso(1) }) },
      ], 1),
      hints: [Q(k, 'whichEqual.hint1'), Q(k, 'whichEqual.hint2')],
      explain: Q(k, 'whichEqual.explain', o),
    };
  },
  product: (lab, t, k) => {
    const p = t.a * t.d;
    const o = { ref: ref(t), a: iso(t.a), d: iso(t.d), p: iso(p) };
    return {
      id: 'product', kind: 'number', expected: String(p), answer: <MathText>{$(String(p))}</MathText>,
      prompt: Q(k, 'product.prompt', o),
      hints: [Q(k, 'product.hint1', o), Q(k, 'product.hint2', o)],
      explain: Q(k, 'product.explain', o),
    };
  },
  equalProducts: (lab, t, k) => {
    const p = t.a * t.d;
    const p1 = $(`${t.a}\\times${t.d}`); const p2 = $(`${t.b}\\times${t.goal}`);
    const o = { b: iso(t.b), c: iso(t.goal), p1, p2, p: iso(p) };
    return {
      id: 'equalProducts', kind: 'choice',
      prompt: Q(k, 'equalProducts.prompt', o),
      options: at([
        { text: Q(k, 'equalProducts.equal'), correct: true },
        { text: Q(k, 'equalProducts.first'), why: Q(k, 'equalProducts.why', o) },
        { text: Q(k, 'equalProducts.second'), why: Q(k, 'equalProducts.why', o) },
      ], 0),
      hints: [Q(k, 'equalProducts.hint1', o), Q(k, 'equalProducts.hint2', o)],
      explain: Q(k, 'equalProducts.explain', o),
    };
  },
  between: (lab, t, k) => {
    const lo = t.below; const hi = t.above;
    const o = { ref: ref(t), d: iso(t.d), below: iso(lo), above: iso(hi) };
    const opt = (x, y) => <MathText>{k('cp.between.opt', { lo: $(String(x)), hi: $(String(y)) })}</MathText>;
    const wrong = (x, y) => ({ text: opt(x, y), why: Q(k, 'between.why', { ...o, lo: iso(x), hi: iso(y) }) });
    return {
      id: 'between', kind: 'choice', cols: 3,
      prompt: Q(k, 'between.prompt', o),
      options: at([{ text: opt(lo, hi), correct: true }, wrong(lo - 1, lo), wrong(hi, hi + 1)], 1),
      hints: [Q(k, 'between.hint1', o), Q(k, 'between.hint2', o)],
      explain: Q(k, 'between.explain', { ...o, calc: $(`\\frac{${t.a * t.d}}{${t.b}}`) }),
    };
  },
  whyNone: (lab, t, k) => {
    const ad = t.a * t.d;
    const o = { a: iso(t.a), b: iso(t.b), d: iso(t.d), ad: iso(ad), q: $(`${ad}\\div${t.b}`) };
    return {
      id: 'whyNone', kind: 'choice',
      prompt: Q(k, 'whyNone.prompt'),
      options: at([
        { text: Q(k, 'whyNone.right', o), correct: true },
        { text: Q(k, 'whyNone.broken'), why: Q(k, 'whyNone.whyBroken') },
        { text: Q(k, 'whyNone.big', o), why: Q(k, 'whyNone.whyBig') },
      ], 2),
      hints: [Q(k, 'whyNone.hint1', o), Q(k, 'whyNone.hint2', o)],
      explain: Q(k, 'whyNone.explain', o),
    };
  },
  rule: (lab, t, k) => ({
    id: 'rule', kind: 'choice',
    prompt: <MathText>{k('discovery.prompt')}</MathText>,
    options: discoveryOptions(lab, k),
    hints: [Q(k, 'rule.hint1'), Q(k, 'rule.hint2')],
    explain: <Formal lab={lab} k={k} />,
  }),
  blueFromProd: (lab, t, k) => {
    const p = t.a * t.d;
    const o = { ref: ref(t), b: iso(t.b), p: iso(p), c: iso(p / t.b) };
    return {
      id: 'blueFromProd', kind: 'number', expected: String(p / t.b), answer: <MathText>{$(String(p / t.b))}</MathText>,
      prompt: Q(k, 'blueFromProd.prompt', o),
      hints: [Q(k, 'blueFromProd.hint1', o), Q(k, 'blueFromProd.hint2', o)],
      explain: Q(k, 'blueFromProd.explain', o),
    };
  },
  reduceRef: (lab, t, k) => {
    const g = gcdN(t.a, t.b);
    const o = { ref: ref(t), a: iso(t.a), b: iso(t.b), g: iso(g), red: $(tex(t.a / g, t.b / g)) };
    return {
      id: 'reduceRef', kind: 'number', expected: String(t.a / g), answer: <MathText>{$(String(t.a / g))}</MathText>,
      prompt: Q(k, 'reduceRef.prompt', o),
      hints: [Q(k, 'reduceRef.hint1', o), Q(k, 'reduceRef.hint2', o)],
      explain: Q(k, 'reduceRef.explain', o),
    };
  },
  crossA: (lab, t, k) => {
    const p = t.a * t.d;
    const o = { ref: ref(t), other: $(tex(t.c, t.d)), a: iso(t.a), d: iso(t.d), p: iso(p) };
    return {
      id: 'crossA', kind: 'number', expected: String(p), answer: <MathText>{$(String(p))}</MathText>,
      prompt: Q(k, 'crossA.prompt', o),
      hints: [Q(k, 'crossA.hint1', o), Q(k, 'crossA.hint2', o)],
      explain: Q(k, 'crossA.explain', o),
    };
  },
  crossB: (lab, t, k) => {
    const p1 = t.a * t.d; const p2 = t.b * t.c;
    const o = { ref: ref(t), other: $(tex(t.c, t.d)), b: iso(t.b), c: iso(t.c), p1: iso(p1), p2: iso(p2) };
    return {
      id: 'crossB', kind: 'number', expected: String(p2), answer: <MathText>{$(String(p2))}</MathText>,
      prompt: Q(k, 'crossB.prompt', o),
      hints: [Q(k, 'crossB.hint1', o), Q(k, 'crossB.hint2', o)],
      explain: Q(k, p1 > p2 ? 'crossB.explainRef' : 'crossB.explainOther', o),
    };
  },
};
