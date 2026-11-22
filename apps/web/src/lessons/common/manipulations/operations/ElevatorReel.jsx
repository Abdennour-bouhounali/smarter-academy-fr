import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, ArrowUp, ArrowDown, Pause, Play } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as R from '@smarter-academy/core/arithmetic/relativeOps.js';
import MathText from '../../components/MathText';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { LabCard, StageFrame, PromptCard, VerdictBanner, StepperCard, ChoiceTray, ChoiceCard, RoundButton } from '../primitives/LabKit';
import KidFigure from '../primitives/KidFigure';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { useManipulationImmersive } from '../immersive';
import TowerArt, { minus } from './elevatorReel/TowerArt';
import { floorHeight, floorHeightFor, towerGeometry, towerWidth } from './elevatorReel/geometry';
import { LEVELS } from '../levels';
import * as L from '../logic/elevatorReel';

/**
 * elevator-reel — LE TEMPS SIGNÉ SOUS LA MAIN (3AM, unité 1 « الأعداد النسبية », درس « جداء عددين نسبيين », 2026-10-26).
 * La logique, exacte, est dans `logic/elevatorReel.js` (sur `packages/core/arithmetic/relativeOps.js`, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tient t, le temps SIGNÉ d'un film de caméra de surveillance : un curseur sur une ligne du temps (−3 … 3), −/+ et les flèches ;
 *    en متقدم elle tient AUSSI la vitesse r (levier « يصعد / ينزل » et −/+ de sa distance) dans la mission « بطريقتين ».
 * B. Le monde : l'ascenseur de charge passe par l'étage 0 à t = 0 à vitesse constante r ; à l'instant t il est à l'étage r × t. Les flèches
 *    empilées montrent « r + r + … + r » (pleines au temps positif, en pointillé au temps négatif : le chemin qu'il lui RESTE à faire).
 * C. La résistance : l'étage demandé n'est atteint que pour UN temps (sur le rail) ; en temps négatif la cabine apparaît de l'autre côté de
 *    la rue — celui qui attend un étage négatif avec une cabine qui descend la voit AU-DESSUS ; un mauvais arrêt est refusé avec le calcul.
 * D. La phase formelle écrit ce que l'élève a vu : la distance de l'étage est le produit des distances (avec SA ligne du سجلّ).
 * E. Les fausses conjectures sont réfutées avec SES lignes (somme ou différence des distances).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        r × t pour r, t relatifs : l'étage, son signe (même signe → positif) et sa distance (produit des distances) ; r × 0 = 0
 *   OBJECT         une tour (étages +9 … −9), une cabine de verre dans son puits, un écran de rediffusion et sa ligne du temps
 *   VARIABLE       t, le temps signé (et, en متقدم, la vitesse signée r)
 *   INVARIANT      la vitesse constante ; la cabine passe par l'étage 0 à t = 0
 *   TRANSFORMATION déplacer le temps : la cabine va à r × t, les flèches se réempilent
 *   CONSTRAINT     −3 ≤ t ≤ 3 (pas 1 ou 0,5), |r| ≤ 3 ⇒ |r × t| ≤ 9
 *   RESISTANCE     l'étage voulu n'a qu'un temps ; en temps négatif la cabine est de l'autre côté de la rue ; un arrêt faux montre son calcul
 *   EVIDENCE       le calcul écrit à chaque arrêt, les flèches, le سجلّ des missions
 *   CONTRAST       (−2)×3 = −6 / (−2)×(−2) = 4 ; monte / descend ; 0 vitesse
 *   PREDICTION     متقدم a1 : l'étage de (−3, −2) parmi quatre cartes, AVANT de voir
 *   DISCOVERY      « quelle est la distance de l'étage à la rue ? » (le produit des distances) ; les signes viennent dans le module
 *   FORMALIZATION  |r × t| = |r| × |t| avec SA ligne ; r × 0 = 0
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * « جرّب كل الإمكانيات » : NON (chaque temps lâché EST l'essai). « جرّب أعدادك » est TOUJOURS ouvert sous le labo.
 *
 * CONSEIL DU 2026-10-27 (quatre voix, puis le propriétaire) :
 *  - le CALCUL n'est écrit qu'APRÈS la découverte (`ready`) : avant, l'arrêt dit le temps, l'étage et le côté de la rue, et un arrêt de
 *    l'autre côté pose « قبل مروره بالطابق 0 أم بعده؟ » (`L.wrongSide`) — la règle des signes n'est jamais lue avant d'être trouvée ;
 *  - مبتدئ prédit (p1, cartes) où était l'ascenseur une minute AVANT son passage, avant de le voir ;
 *  - « ▶ شغّل التسجيل » joue le film de −3 à 3 (la cabine MONTE quand on remonte le temps), jamais avant la prédiction (`L.canPlay`) ;
 *  - la VITESSE est une carte à part, grande et signée (« −2 », flèche, « ينزل طابقين في كل دقيقة ») — le propriétaire : « l'information
 *    de la vitesse est très importante » ; la cabine porte la vitesse SIGNÉE ;
 *  - ÉCRAN DE JEU : `immersive` (ManipulationShell) — en plein écran, la tour prend toute la hauteur (`floorHeightFor`).
 *
 * D'UN SEUL REGARD (§8bis) : `[data-er-glance]` = la consigne (contexte puis UNE question), la tour, l'écran, la ligne du temps, −/+, le verdict
 * et le سجلّ. La tour est TOUJOURS à côté des commandes (largeur 280 px au-delà de 700 px de labo, 132–160 px en dessous).
 *
 * ONBOARDING : `coachOf` (cards · grab · left · lever · try · next) montre le contrôle, jamais le nombre.
 *
 * QUESTIONS PENDANT LE LABO (déploiement lot 1, 2026-10-28, `primitives/LabCheckpoint`) : `checkpoints` (défaut true). Après CHAQUE mission,
 * une suite de questions sur ce que l'élève vient de FAIRE se pose par-dessus le labo et retient « التالي » (`chainsOf`) : le temps lâché, la
 * somme répétée des flèches, le côté de la rue, la distance, « avant le passage », la valeur, le produit des distances, les signes du سجلّ, et
 * LA RÈGLE (l'ancienne découverte, qui formalise) à la dernière mission. Une réponse signée est un CHOIX (le champ numérique ne lit pas « − »).
 * Obligatoires pour tout élève ; l'enseignant seul les coupe pour SON compte (`useLabCheckpointSettings`). Questions actives → `guided` : le
 * shell masque « جرّب › اكتشف › صِغ » et « تلميح ». ÉTAPES : `LabStepper` (`[data-er-step=<i>]`) et la fête par mission. « إعادة » repart de la
 * mission 1 ; « أعِد التجربة » remet LA MÊME mission (`L.retryTask`). SON : `tooth` à chaque pas de temps (plus grave en arrière), `flag` à
 * la mission réussie, `over` à un arrêt faux.
 * Props : `tasks`, `step`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({})` — par `state.report`.
 *
 * CONTRAT DOM : [data-elevator-reel][data-task][data-solved][data-layout], [data-er-glance], [data-er-stage], [data-er-svg], [data-er-cabin][data-floor],
 * [data-er-pill], [data-er-level=<f>], [data-er-arrows=<n>], [data-er-arrow=<i>][data-dashed][data-half], [data-er-monitor], [data-er-time],
 * [data-er-knob][data-t] (role slider), [data-er-ruler], [data-er-left], [data-er-stepper], [data-er-less], [data-er-more], [data-er-t],
 * [data-er-speed], [data-er-up], [data-er-down], [data-er-r-less], [data-er-r-more], [data-er-cards], [data-er-card=<v>], [data-er-record],
 * [data-er-row], [data-er-verdict=right|wrong|part|free|''], [data-er-prompt][data-lit], [data-er-context], [data-er-next], [data-er-step=<i>][data-done],
 * [data-er-free][data-active], [data-er-free-r], [data-er-free-t], [data-er-free-back], [data-er-formal], [data-er-kid][data-mood].
 */
const NS = 'manipulation.elevatorReel';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const WIDE_MIN = 700;
const PLAY_MS = 4800; // le film de −3 à 3 : 0,8 s par minute
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const FONT = 'ui-sans-serif, system-ui, sans-serif';

const CSS = `
@keyframes er-pop { 0% { transform: scale(0.8); } 70% { transform: scale(1.06); } 100% { transform: scale(1); } }
.er-pop { animation: er-pop 280ms ease-out both; display: inline-block; }
[data-er-cabin] { transition: transform 260ms ease-out; }
@media (prefers-reduced-motion: reduce) { .er-pop { animation: none !important; } [data-er-cabin] { transition: none !important; } }
`;

/** Les nombres de départ : ceux de la leçon, sinon ceux du niveau. */
export function numbersFor({ tasks, step, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['elevator-reel'][lv].numbers;
  return { step: step ?? asked.step, tasks: tasks ?? asked.tasks };
}

const rt = (v) => minus(R.relText(R.parseRel(String(v)))); // 0.5 -> "0,5", -2 -> "−2"

export default function ElevatorReel({
  tasks, step, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, step, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'elevator-reel', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la mission 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const ready = L.discoveryReady(lab);
  // les questions pendant le labo : la suite de la mission courante ; celle qui finit par la règle remplace la découverte automatique
  const cpSettings = useLabCheckpointSettings('elevator-reel');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpChains = cpOn && cpSettings.enabled ? chainsOf(lab) : null;
  const cur = L.taskOf(lab);
  const chain = cpChains && !L.isFree(lab) ? cpChains[cur.id] ?? null : null;
  const ruleByCheckpoint = !!cpChains && Object.values(cpChains).some((c) => c.includes('rule'));
  const cp = useLabCheckpoint({
    id: chain ? cur.id : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, cur, k)) : null,
    reached: !L.isFree(lab) && L.taskDone(lab),
    resetKey: scene.inits,
    onRetry: () => setLab(L.retryTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (cpChains?.[id]?.includes('rule')) { state.discover(); state.formalize(); } },
  });
  useEffect(() => { if (ready && !ruleByCheckpoint) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son (muet sans « الصوت ») : un tic par pas de temps (plus grave en arrière, au plus un toutes les 35 ms), puis le jugement de l'arrêt
  const sfx = useRef({ t: lab.t, at: 0, last: lab.last });
  useEffect(() => {
    const p = sfx.current;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (lab.t !== p.t && now - p.at > 35) { playSfx('tooth', { pitch: lab.t > p.t ? 1 : 0.75 }); p.at = now; }
    p.t = lab.t;
    if (lab.last && lab.last !== p.last && !lab.last.free) playSfx(lab.last.ok ? 'flag' : 'over');
    p.last = lab.last;
  }, [lab.t, lab.last]);
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

  /* ── onboarding ── */
  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'elevator-reel', step: coachStep,
    text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });

  /* ── mesure ── */
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

  const advanced = lab.advanced;
  const discovery = (
    <ManipulationDiscovery state={state} prompt={<MathText>{k('discovery.prompt')}</MathText>}
      options={discoveryOptions(lab, k)} formal={<Formal lab={lab} k={k} />} />
  );

  return (
    <ManipulationShell
      headerAction={cpSettings.control}
      type="elevator-reel"
      title={title ?? k('title')}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      immersive
      guided={!!chain || ruleByCheckpoint}
      coach={coachOn ? coach : null}
      hints={[0, 1, 2].map((i) => k(`hints.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={discovery}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/50 to-white">
        <div ref={boxRef} className="space-y-2" data-elevator-reel data-task={lab.ti} data-solved={ready ? 'true' : 'false'} data-layout={width >= WIDE_MIN ? 'wide' : 'narrow'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} advanced={advanced} ready={ready} lead={state.isAuthoredLevel ? lead : null} cp={cp} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

/** « طابقين » / « 3 طوابق » / « طابقًا واحدًا » : le nombre de l'histoire. */
const floorsWord = (n, k) => k(`floors.${Math.abs(n) === 1 ? 'one' : Math.abs(n) === 2 ? 'two' : 'many'}`, { n: Math.abs(n) });

function Lab({ lab, setLab, k, width, screenH, advanced, ready, lead, cp }) {
  const uid = `er${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const immersed = useManipulationImmersive();
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const wide = width >= WIDE_MIN;
  const r = L.rOf(lab);
  const t = L.tOf(lab);
  const floor = L.floorOf(lab);
  const last = lab.last;
  const done = L.taskDone(lab);
  const cards = L.cardsOpen(lab);
  const onTarget = !free && last && last.ok;

  /* ── « ▶ شغّل التسجيل » : le film joué de −3 à 3, la cabine en mouvement continu (jamais avant la prédiction) ── */
  const [playT, setPlayT] = useState(null);
  const raf = useRef(0);
  const hold = useRef(0);
  const playing = playT !== null;
  const stopPlay = useCallback(() => { cancelAnimationFrame(raf.current); clearTimeout(hold.current); setPlayT(null); }, []);
  const startPlay = () => {
    stopPlay();
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / PLAY_MS);
      setPlayT(reduced ? Math.min(3, -3 + Math.floor(p * 7)) : -3 + 6 * p);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else hold.current = setTimeout(() => setPlayT(null), 800);
    };
    raf.current = requestAnimationFrame(tick);
  };
  useEffect(() => stopPlay, [stopPlay]);
  useEffect(() => { stopPlay(); }, [lab.ti, lab.free, stopPlay]);
  const canPlay = L.canPlay(lab) && !cards;
  // tout geste de l'élève arrête le film et rend la main au temps qu'il tient
  const act = (fn) => { if (playing) stopPlay(); setLab(fn); };
  const tShow = playing ? playT : t;
  const floorShow = playing ? r * playT : floor;

  /* ── la consigne ── */
  const sense = r < 0 ? 'down' : 'up';
  const ctx = (() => {
    if (free) return k('context.free');
    if (task.kind === 'both') return k('context.both');
    if (task.kind === 'predict') return k('context.predict', { v: floorsWord(task.r, k) });
    return k(`context.${sense}`, { v: floorsWord(task.r, k) });
  })();
  const context = free ? ctx : (lead || ctx);
  const question = (() => {
    if (free) return k('question.free');
    if (task.kind === 'both') return k('question.both', { target: iso(rt(task.floor)) });
    if (task.kind === 'predict') return k('question.predict', { t: iso(rt(task.t)) });
    return k('question.floor', { target: iso(rt(task.floor)) });
  })();
  // une étape est FAITE quand la mission est réussie ET que ses questions (LabCheckpoint) sont répondues : la pastille passe au vert et on fête
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-er-step" />
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
  const lit = !free && done;
  const prompt = (
    <PromptCard size={wide ? 'lg' : 'md'} aside={steps || null} context={context} contextProps={{ 'data-er-context': free ? 'free' : task.kind }}
      title={question} titleClassName={wide ? 'text-xl' : 'text-lg'} lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-er-prompt': free ? 'free' : task.kind, 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── la tour : à l'écran de jeu, elle prend toute la hauteur qui reste sous la consigne ── */
  const rowRef = useRef(null);
  const [avail, setAvail] = useState(0);
  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!immersed || !row) { setAvail(0); return undefined; }
    const host = row.closest('[data-immersive]');
    const measure = () => {
      if (!host) return;
      const top = row.getBoundingClientRect().top - host.getBoundingClientRect().top + host.scrollTop;
      setAvail(Math.max(0, Math.floor(host.clientHeight - top - 16)));
    };
    measure();
    // l'écran (plein écran, fenêtre) ET la consigne au-dessus (polices, guide) changent de taille après coup : on remesure
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro && host) ro.observe(host);
    if (ro && row.previousElementSibling) ro.observe(row.previousElementSibling);
    window.addEventListener('resize', measure);
    return () => { ro?.disconnect(); window.removeEventListener('resize', measure); };
  }, [immersed]);
  // un écran de jeu bas (1280×800, 1366×768) : la carte de vitesse et l'écran de la caméra restent compacts pour que la colonne tienne
  const roomy = immersed && avail >= 640;
  const fh = immersed && avail > 0 ? floorHeightFor(avail) : floorHeight(screenH);
  const tw = towerWidth(width, wide, immersed);
  const g = towerGeometry({ width: tw, fh });
  const arrows = L.arrowsOf(r, t);
  // متقدم : pas de flèches empilées avant le relâchement (la main prédit, puis vérifie) ; pendant le film, aucune
  const settled = !!last && last.t === t && last.r === r && last.kind === 'release';
  const showArrows = !playing && !cards && (!advanced || settled || free) && arrows.length > 0;
  const pillValue = playing ? minus(Math.round(floorShow) || 0) : minus(floor);
  const tower = (
    <TowerArt uid={uid} g={g} floor={floorShow} r={r} arrows={arrows} showArrows={showArrows} glow={!playing && !!onTarget} pill={{ word: k('floorWord'), value: pillValue }}
      ariaLabel={k('towerAria', { r: minus(r), t: minus(t), floor: minus(floor) })} />
  );

  /* ── les commandes ── */
  const colMax = immersed ? 640 : 440;
  const cw = Math.min(colMax, Math.max(210, width - tw - 14));
  const mood = !last ? 'neutral' : onTarget ? 'proud' : (last.floor !== 0 && last.t < 0 && Math.sign(last.r) !== Math.sign(last.floor)) ? 'wonder' : 'neutral';

  const [lo, hi] = L.RANGE_T;
  const stepper = (
    <div data-er-stepper>
      <StepperCard layout="row" value={rt(t)} unit={null}
        onLess={() => act((s) => L.step(s, -1))} onMore={() => act((s) => L.step(s, 1))}
        lessDisabled={t <= lo} moreDisabled={t >= hi}
        lessLabel={k('less')} moreLabel={k('more')}
        lessProps={{ 'data-er-less': '' }} moreProps={{ 'data-er-more': '' }} readoutProps={{ 'data-er-t': t }} />
    </div>
  );

  const speedEdit = L.speedEditable(lab);
  const speedCard = (
    <SpeedCard r={r} k={k} big={roomy}>
      {speedEdit && (
        <div className="space-y-1.5" data-er-speed>
          <p className="text-center text-[11px] font-extrabold text-indigo-900/70">{k('speedTitle')}</p>
          <div className="grid grid-cols-2 gap-1.5">
            <ChoiceCard size="sm" state={r > 0 ? 'selected' : 'idle'} aria-pressed={r > 0} onClick={() => act((s) => (L.rOf(s) > 0 ? s : L.flipSense(s)))} data-er-up>
              <ArrowUp className="me-1 h-4 w-4" aria-hidden="true" /> {k('up')}
            </ChoiceCard>
            <ChoiceCard size="sm" state={r < 0 ? 'selected' : 'idle'} aria-pressed={r < 0} onClick={() => act((s) => (L.rOf(s) < 0 ? s : L.flipSense(s)))} data-er-down>
              <ArrowDown className="me-1 h-4 w-4" aria-hidden="true" /> {k('down')}
            </ChoiceCard>
          </div>
          <div className="flex items-center justify-center gap-2" dir="ltr">
            <RoundButton size={40} onClick={() => act((s) => L.setR(s, Math.sign(L.rOf(s)) * Math.max(1, Math.abs(L.rOf(s)) - 1)))} aria-label={k('rLess')} data-er-r-less disabled={Math.abs(r) <= 1}>−</RoundButton>
            <bdi dir="ltr" className="min-w-[3.5rem] text-center text-lg font-black tabular-nums text-indigo-950" data-er-r={r}>{minus(r)}</bdi>
            <RoundButton primary size={40} onClick={() => act((s) => L.setR(s, Math.sign(L.rOf(s) || 1) * Math.min(3, Math.abs(L.rOf(s)) + 1)))} aria-label={k('rMore')} data-er-r-more disabled={Math.abs(r) >= 3}>+</RoundButton>
          </div>
        </div>
      )}
    </SpeedCard>
  );

  const predictCards = cards && (
    <LabCard className="space-y-1.5 p-2" data-er-cards>
      <p className="text-center text-[12px] font-black text-indigo-950">{k('cardsTitle')}</p>
      <ChoiceTray cols={2}>
        {task.options.map((o) => {
          const tried = lab.trials.some((x) => x.kind === 'predict' && x.task === lab.ti && x.pick === o && !x.ok);
          return (
            <ChoiceCard key={o} size="md" ltr state={tried ? 'tried' : 'idle'} onClick={() => act((s) => L.choose(s, o))} data-er-card={o}>
              {minus(o)}
            </ChoiceCard>
          );
        })}
      </ChoiceTray>
    </LabCard>
  );

  /* ── le verdict : le temps, l'étage, le côté de la rue — le calcul seulement après la découverte ── */
  const sideWord = (f) => k(`side.${L.sideOf(f)}`);
  const wayWord = last && last.kind === 'release' && task.kind === 'both' && last.ok ? k(last.r > 0 ? 'wayUp' : 'wayDown') : '';
  const verdictLine = (() => {
    if (!last) return cards ? k('idle.predict') : k('idle.floor');
    const tt = iso(rt(last.t));
    const fl = iso(minus(last.floor));
    if (last.free) return k('v.free', { t: tt, floor: fl });
    if (last.kind === 'predict') return k(last.ok ? 'v.predictRight' : 'v.predictWrong', { t: tt, floor: fl, side: sideWord(last.floor), pick: iso(minus(last.pick)) });
    if (last.ok) {
      if (task.kind === 'both' && !done) return k('v.part', { t: tt, way: wayWord });
      return k('v.right', { t: tt, floor: fl });
    }
    const goal = iso(minus(task.floor));
    if (last.floor === 0) return k('v.wrongZero', { goal });
    if (L.wrongSide(last)) return k('v.wrongSide', { t: tt, floor: fl, side: sideWord(last.floor), goal, goalSide: sideWord(task.floor) });
    return k('v.wrong', { t: tt, floor: fl, goal });
  })();
  const vkey = !last ? '' : last.free ? 'free' : last.ok ? (task.kind === 'both' && !done ? 'part' : 'right') : 'wrong';
  const tone = !last ? 'indigo' : last.ok && !last.free ? 'emerald' : 'amber';
  const Icon = !last ? Hand : last.ok && !last.free ? CheckCircle2 : Sparkles;
  const canNext = L.canNext(lab) && !cp.blocking;
  const banner = (
    <VerdictBanner tone={tone} icon={Icon} size="sm" className="min-h-[3.5rem]" data-er-verdict={vkey}>
      <div className="min-w-0 space-y-1.5">
        <p className={last ? '' : 'font-bold text-indigo-900'}>{verdictLine}</p>
        {ready && last && (
          <p className="text-base font-black text-indigo-950" data-er-calc aria-label={k('calcAria')}>
            <bdi dir="ltr">{L.calcText(last.r, last.t)}</bdi>
          </p>
        )}
        {canNext && (
          <button type="button" onClick={() => act(L.nextTask)} data-er-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );

  /* ── le سجلّ ── */
  const rows = L.recordRows(lab);
  const record = (
    <LabCard className="overflow-hidden p-0" data-er-record>
      <p className="bg-indigo-50 px-2 py-1 text-center text-[12px] font-black text-indigo-950">{k('record.title')}</p>
      <table className="w-full table-fixed text-center text-[13px] font-bold text-slate-800">
        <thead>
          <tr className="text-[11px] text-indigo-900/70"><th className="py-0.5">{k('record.r')}</th><th>{k('record.t')}</th><th>{k('record.floor')}</th></tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={3} className="py-1 text-slate-400">—</td></tr>}
          {rows.map((x, i) => (
            <tr key={`${x.i}-${i}`} data-er-row={i} className="border-t border-indigo-50">
              <td className="py-0.5"><bdi dir="ltr">{minus(x.r)}</bdi></td>
              <td><bdi dir="ltr">{rt(x.t)}</bdi></td>
              <td><bdi dir="ltr">{minus(x.floor)}</bdi></td>
            </tr>
          ))}
        </tbody>
      </table>
    </LabCard>
  );

  const playButton = canPlay && (
    <button type="button" onClick={playing ? stopPlay : startPlay} data-er-play data-playing={playing ? 'true' : 'false'} aria-label={k('playAria')}
      className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full border-2 px-3 text-xs font-black transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${playing ? 'border-rose-300 bg-rose-50 text-rose-800' : 'border-indigo-600 bg-indigo-600 text-white shadow-[0_3px_0_0_#3730A3]'} ${ring}`}>
      {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
      {playing ? k('playing') : k('play')}
    </button>
  );

  const controls = (
    <div className="flex min-w-0 flex-1 flex-col gap-2" style={{ maxWidth: colMax }}>
      <Monitor k={k} cw={cw} t={tShow} playing={playing} floor={floor} r={r} mood={mood} compact={cw < 300 || (immersed && !roomy)} />
      {speedCard}
      {predictCards}
      {!cards && (
        <LabCard className="space-y-1 p-1.5">
          <Timeline uid={uid} cw={cw} t={tShow} step={lab.step} k={k}
            onPreview={(v) => act((s) => L.preview(s, v))} onRelease={(v) => act((s) => L.release(s, v))} />
          {playButton && <div className="flex justify-center pb-1">{playButton}</div>}
        </LabCard>
      )}
      {!cards && stepper}
      {banner}
      {record}
    </div>
  );

  return (
    <>
      <div className="relative space-y-2.5" data-er-glance>
        {party.node}
        {cp.node}
        {prompt}
        <div ref={rowRef} className={`flex items-start justify-center ${immersed ? 'gap-6' : 'gap-3'}`}>
          <StageFrame className="shrink-0 overflow-hidden p-1.5" data-er-stage style={{ width: tw + 12 }}>{tower}</StageFrame>
          {controls}
        </div>
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ La vitesse : une carte à part, grande et SIGNÉE ══════════════ */

/**
 * « −2 » en grand, la flèche du sens, l'unité, et la phrase « ينزل طابقين في كل دقيقة » : la vitesse est l'un des deux facteurs du
 * produit, elle ne doit jamais être un détail (propriétaire, 2026-10-27). En متقدم (mission `both`), les commandes du levier viennent dessous.
 */
function SpeedCard({ r, k, big, children }) {
  const dir = r > 0 ? 'up' : r < 0 ? 'down' : 'still';
  const tone = dir === 'down' ? 'border-rose-200 bg-rose-50 text-rose-900' : dir === 'up' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-700';
  const Arrow = dir === 'up' ? ArrowUp : dir === 'down' ? ArrowDown : null;
  const sentence = dir === 'still' ? k('speedSentence.still') : k(`speedSentence.${dir}`, { v: floorsWord(r, k) });
  const icon = (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-2xl ${big ? 'h-14 w-14' : 'h-10 w-10'} ${dir === 'down' ? 'bg-rose-600' : dir === 'up' ? 'bg-emerald-600' : 'bg-slate-400'} text-white`}>
      {Arrow ? <Arrow className={big ? 'h-8 w-8' : 'h-6 w-6'} strokeWidth={3} /> : <span className="text-xl font-black">=</span>}
    </span>
  );
  const value = <bdi dir="ltr" className={`${big ? 'text-4xl' : 'text-3xl'} font-black leading-none tabular-nums`} data-er-speed-value={r}>{minus(r)}</bdi>;
  // dans la page : UNE rangée (le labo tient dans un écran, DNA §17) ; à l'écran de jeu : la grande carte
  return (
    <LabCard className={`space-y-2 border-2 ${big ? 'p-2.5' : 'px-2.5 py-1.5'} ${tone}`} data-er-speed-card data-sense={dir} aria-label={k('speedLabel')}>
      {big ? (
        <div className="flex items-center gap-3">
          {icon}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black opacity-70">{k('speedLabel')}</p>
            <p className="flex flex-wrap items-baseline gap-x-2 leading-none">
              {value}
              <span className="text-sm font-extrabold">{k('speedUnit')}</span>
            </p>
            <p className="mt-1 text-base font-extrabold" data-er-speed-sentence>{sentence}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5">
          {icon}
          {value}
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-[11px] font-black opacity-70">{k('speedLabel')} · {k('speedUnit')}</p>
            <p className="text-sm font-extrabold" data-er-speed-sentence>{sentence}</p>
          </div>
        </div>
      )}
      {children}
    </LabCard>
  );
}

/* ══════════════ L'écran de la salle de surveillance ══════════════ */

/** « −2,4 » : le temps du film qui défile (une décimale, virgule, vrai moins). */
const fmt1 = (v) => minus(String(Math.round(v * 10) / 10).replace('.', ','));

function Monitor({ k, cw, t, playing, floor, r, mood, compact }) {
  const h = compact ? 64 : 76; // colonne étroite (1024×768, barre latérale ouverte) ou écran de jeu bas : le labo tient dans l'écran
  const kid = Math.min(46, cw * 0.2);
  const sw = cw - kid * 2 - 8;
  const sx = kid + 4;
  return (
    <LabCard className="overflow-hidden p-0" data-er-monitor data-er-kid data-mood={mood}>
      <svg width="100%" viewBox={`0 0 ${cw} ${h}`} style={{ display: 'block', maxWidth: cw }} aria-hidden="true">
        <rect x={0} y={0} width={cw} height={h} fill="#EEF2FF" />
        <rect x={0} y={h - 10} width={cw} height={10} fill="#C7D2FE" />
        <rect x={sx} y={6} width={sw} height={h - 18} rx={10} fill="#0F172A" stroke="#475569" strokeWidth={3} />
        <rect x={sx + 6} y={12} width={sw - 12} height={h - 30} rx={6} fill="#111C33" />
        <circle cx={sx + 16} cy={24} r={4} fill="#EF4444" opacity={playing ? 1 : 0.85}>
          {playing && <animate attributeName="opacity" values="1;0.2;1" dur="0.9s" repeatCount="indefinite" />}
        </circle>
        <text x={sx + 24} y={28} fontSize={10} fontWeight={900} fill="#FCA5A5" fontFamily={FONT} textAnchor="start" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{k('rec')}</text>
        <text x={sx + sw / 2} y={h / 2 + 4} textAnchor="middle" fontSize={Math.min(28, sw * 0.14)} fontWeight={900} fill="#F8FAFC" fontFamily={FONT} data-er-time data-t={t}
          style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{`t = ${playing ? fmt1(t) : rt(t)}`}</text>
        <KidFigure cx={kid / 2 + 2} top={16} foot={h - 10} hairStyle="hijab" scarf="lavender" outfit="violet" skin="medium" mood={mood} />
        <KidFigure cx={cw - kid / 2 - 2} top={18} foot={h - 10} hairStyle="short" hair="brown" outfit="blue" skin="light" mood={mood} />
      </svg>
      <span className="sr-only" data-er-readout data-floor={floor} data-t={t} data-r={r}>{k('readoutSr', { r: minus(r), t: playing ? fmt1(t) : rt(t), floor: minus(floor) })}</span>
    </LabCard>
  );
}

/* ══════════════ La ligne du temps ══════════════ */

function Timeline({ uid, cw, t, step, k, onPreview, onRelease, disabled }) {
  const svgRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [scale, setScale] = useState(1);
  const W = Math.max(210, cw - 12);
  const pad = 26;
  const H = 80;
  const railY = 36;
  const x = (v) => pad + ((v + 3) / 6) * (W - pad * 2);
  const tOf = (px) => {
    const v = ((px - pad) / (W - pad * 2)) * 6 - 3;
    return Math.max(-3, Math.min(3, Math.round(v / step) * step));
  };
  useLayoutEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    const measure = () => { const w = el.getBoundingClientRect().width; if (w > 0) setScale(W / w); };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [W]);
  const toT = (e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    return rect ? tOf((e.clientX - rect.left) * scale) : t;
  };
  const down = (e) => { if (disabled) return; e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(true); onPreview(toT(e)); };
  const move = (e) => { if (drag) onPreview(toT(e)); };
  const up = (e) => { if (!drag) return; setDrag(false); onRelease(toT(e)); };
  const key = (e) => {
    if (disabled) return;
    const map = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    if (e.key in map) { e.preventDefault(); onRelease(Math.max(-3, Math.min(3, t + map[e.key] * step))); }
    if (e.key === 'Home') { e.preventDefault(); onRelease(-3); }
    if (e.key === 'End') { e.preventDefault(); onRelease(3); }
  };
  const ticks = [];
  for (let v = -3; v <= 3; v += 1) {
    ticks.push(
      <g key={v} data-er-tick={v}>
        <line x1={x(v)} x2={x(v)} y1={railY - 8} y2={railY + 8} stroke={v === 0 ? '#4338CA' : '#94A3B8'} strokeWidth={v === 0 ? 3 : 2} strokeLinecap="round" />
        <text x={x(v)} y={railY + 25} textAnchor="middle" fontSize={v === t ? 14 : 12} fontWeight={v === t ? 900 : 700} fill={v === t ? '#312E81' : '#64748B'}
          fontFamily={FONT} style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{minus(v)}</text>
        {step < 1 && v < 3 && <line x1={x(v + 0.5)} x2={x(v + 0.5)} y1={railY - 4} y2={railY + 4} stroke="#CBD5E1" strokeWidth={2} strokeLinecap="round" />}
      </g>,
    );
  }
  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W, display: 'block', margin: '0 auto', touchAction: 'pan-y' }} dir="ltr" role="group" aria-label={k('timelineAria')} data-er-timeline>
      <defs>
        <radialGradient id={`${uid}-tk`} cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor="#FEF9C3" /><stop offset="1" stopColor="#FACC15" /></radialGradient>
      </defs>
      <text x={W - 6} y={11} textAnchor="start" fontSize={11} fontWeight={900} fill="#312E81" fontFamily={FONT} style={{ direction: 'rtl', unicodeBidi: 'isolate' }}>{k('stepper')}</text>
      <rect x={x(-3) - 10} y={railY - 16} width={x(0) - x(-3) + 10} height={32} rx={10} fill="#FEF3C7" opacity={0.7} />
      <rect x={x(0)} y={railY - 16} width={x(3) - x(0) + 10} height={32} rx={10} fill="#DCFCE7" opacity={0.7} />
      <rect x={x(-3) - 10} y={railY - 16} width={x(0) - x(-3) + 10} height={32} fill="transparent" data-er-left pointerEvents="none" />
      <rect x={0} y={railY - 24} width={W} height={54} fill="transparent" style={{ cursor: disabled ? 'default' : drag ? 'grabbing' : 'pointer', touchAction: 'none' }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} data-er-ruler />
      <line x1={x(-3)} x2={x(3)} y1={railY} y2={railY} stroke="#C7D2FE" strokeWidth={6} strokeLinecap="round" pointerEvents="none" />
      <line x1={x(0)} x2={x(t)} y1={railY} y2={railY} stroke={t >= 0 ? '#22C55E' : '#F59E0B'} strokeWidth={6} strokeLinecap="round" pointerEvents="none" />
      <g pointerEvents="none">{ticks}</g>
      <text x={(x(-3) + x(0)) / 2} y={H - 3} textAnchor="middle" fontSize={11} fontWeight={800} fill="#B45309" fontFamily={FONT}>{k('before')}</text>
      <text x={(x(0) + x(3)) / 2} y={H - 3} textAnchor="middle" fontSize={11} fontWeight={800} fill="#15803D" fontFamily={FONT}>{k('after')}</text>
      <g role="slider" tabIndex={disabled ? -1 : 0} aria-label={k('knobAria')} aria-valuemin={-3} aria-valuemax={3} aria-valuenow={t} aria-valuetext={rt(t)} aria-orientation="horizontal"
        aria-disabled={disabled || undefined} onKeyDown={key} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        style={{ cursor: disabled ? 'default' : drag ? 'grabbing' : 'grab', touchAction: 'none', outline: 'none' }} data-er-knob data-t={t}>
        <circle cx={x(t)} cy={railY + 2.5} r={20} fill="#1E1B4B" opacity={0.15} />
        <circle cx={x(t)} cy={railY} r={20} fill={`url(#${uid}-tk)`} stroke="#A16207" strokeWidth={drag ? 3.5 : 2.5} />
        <path d={`M${x(t) - 8} ${railY - 6} V${railY + 6} M${x(t)} ${railY - 8} V${railY + 8} M${x(t) + 8} ${railY - 6} V${railY + 6}`} stroke="#A16207" strokeWidth={2.4} strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ══════════════ « جرّب أعدادك أنت » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [rText, setR] = useState('');
  const [tText, setT] = useState('');
  useEffect(() => { if (!lab.free) { setR(''); setT(''); } }, [lab.free]);
  useEffect(() => { if (lab.free) setT(rt(lab.free.t)); }, [lab.free?.t]); // eslint-disable-line react-hooks/exhaustive-deps
  const clean = (v) => v.replace(/[^0-9٠-٩\-−,٫.]/g, '').slice(0, 5);
  const bad = (rText !== '' || tText !== '') && !L.parseFree(rText === '' ? '0' : rText, tText);
  const apply = (nr, nt) => { if (L.parseFree(nr === '' ? '0' : nr, nt)) setLab((s) => L.setFree(s, nr === '' ? '0' : nr, nt)); };
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-er-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-black text-indigo-950">
          {k('free.r')}
          <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" value={rText} maxLength={3}
            onChange={(e) => { const v = clean(e.target.value); setR(v); apply(v, tText); }}
            aria-label={k('free.rAria')} aria-invalid={bad} data-er-free-r
            className={`h-11 w-20 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-emerald-300'} bg-white px-3 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`} />
        </label>
        <label className="flex items-center gap-2 text-xs font-black text-indigo-950">
          {k('free.t')}
          <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={tText} maxLength={5}
            onChange={(e) => { const v = clean(e.target.value); setT(v); apply(rText, v); }}
            aria-label={k('free.tAria')} aria-invalid={bad} data-er-free-t
            className={`h-11 w-24 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-emerald-300'} bg-white px-3 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`} />
        </label>
        {bad && <span className="text-xs font-bold text-rose-700">{k('free.bad')}</span>}
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-er-free-back
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

export function discoveryOptions(lab, k) {
  const w = L.distanceWitness(lab);
  const p = { r: minus(w.r), t: R.relText(R.parseRel(String(w.t))), a: w.a, b: R.relText(R.parseRel(String(w.b))), dist: R.relText(R.parseRel(String(Math.abs(w.floor)))), sum: R.relText(R.parseRel(String(w.sum))), diff: R.relText(R.parseRel(String(w.diff))) };
  return [
    { text: <MathText>{k('discovery.sum')}</MathText>, why: <MathText>{k('discovery.whySum', p)}</MathText> },
    { text: <MathText>{k('discovery.product')}</MathText>, correct: true },
    { text: <MathText>{k('discovery.diff')}</MathText>, why: <MathText>{k('discovery.whyDiff', p)}</MathText> },
  ];
}

export function Formal({ lab, k }) {
  const w = L.distanceWitness(lab);
  const num = (v) => R.relTex(R.parseRel(String(v)));
  const line = `|${num(w.r)}| \\times |${num(w.t)}| = ${num(w.a)} \\times ${num(w.b)} = ${num(w.product)}`;
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-er-formal>
      <p className="text-center text-base" dir="ltr"><MathText>{`$${line}$`}</MathText></p>
      <p><MathText>{k('formal.distance')}</MathText></p>
      <p><MathText>{k('formal.zero')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de chaque mission (par id de mission) ; une mission inconnue suit son genre. `rule` clôt la dernière mission. */
export const CHAINS = Object.freeze({
  m1: ['time', 'arrows'], p1: ['side', 'distance'], m2: ['time', 'before', 'value'], m3: ['time', 'product'], m4: ['time', 'signs'],
  a1: ['side', 'distance'], a2: ['twoWays', 'product'], a3: ['time', 'before'], a4: ['time'],
});
const BY_KIND = Object.freeze({ predict: ['side', 'distance'], both: ['twoWays', 'product'], floor: ['time', 'before', 'product'] });

/** Ce que l'élève a résolu pour une mission (sinon : la solution de la mission, pour les tests et le rendu à blanc). */
export function solvedOf(lab, task) {
  const i = lab.tasks.indexOf(task);
  const s = lab.solved[i];
  if (s) return s;
  if (task.kind === 'predict') return { r: task.r, t: task.t, floor: L.floorAt(task.r, task.t) };
  if (task.kind === 'both') return { r: 2, t: L.timeFor(2, task.floor, lab.step), floor: task.floor, also: { r: -2, t: L.timeFor(-2, task.floor, lab.step) } };
  return { r: task.r, t: L.timeFor(task.r, task.floor, lab.step), floor: task.floor };
}

const distinctSums = (a, b) => a * b !== a + b && a * b !== Math.abs(a - b) && a + b !== Math.abs(a - b);

/** Les suites de CE labo : une question sans objet est retirée (pas de temps négatif, une somme qui égale le produit…). */
export function chainsOf(lab) {
  const out = {};
  for (const tk of lab.tasks) {
    const s = solvedOf(lab, tk);
    out[tk.id] = (CHAINS[tk.id] ?? BY_KIND[tk.kind] ?? []).filter((q) => {
      if (q === 'arrows') return s.r < 0 && s.t > 0 && Number.isInteger(s.t);
      if (q === 'before') return s.t < 0;
      if (q === 'value') return s.floor > 0;
      if (q === 'product') return s.r !== 0 && s.t !== 0 && distinctSums(Math.abs(s.r), Math.abs(s.t));
      if (q === 'signs') return L.recordRows({ ...lab, solved: { ...lab.solved, [lab.tasks.indexOf(tk)]: s } }).length >= 3;
      return true;
    });
  }
  const last = lab.tasks[lab.tasks.length - 1];
  if (last) out[last.id] = [...out[last.id], 'rule'];
  return out;
}

const C = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const pick = (list, right, whys) => list.map((text, i) => (i === right ? { text, correct: true } : { text, why: whys[i] }));
const tx = (v) => R.relTex(R.parseRel(String(v)));
const par = (v) => (v < 0 ? `(${tx(v)})` : tx(v));
const $ = (s) => `$${s}$`;

/** Chaque question est construite sur LA mission résolue par l'élève (rien en dur). */
export const QUESTIONS = {
  time: (lab, task, k) => {
    const s = solvedOf(lab, task);
    const alt = s.t + (s.t < 0 ? -1 : 1) * lab.step;
    const other = Math.abs(alt) <= L.RANGE_T[1] ? alt : s.t - (s.t < 0 ? -1 : 1) * lab.step;
    const o = { floor: iso(minus(s.floor)), t: iso(rt(s.t)) };
    const why = (v) => C(k, 'time.why', { t: iso(rt(v)), floor: iso(minus(L.floorAt(s.r, v))) });
    return {
      id: 'time', kind: 'choice', cols: 3, prompt: C(k, 'time.prompt', o),
      options: pick([<bdi dir="ltr">{rt(s.t)}</bdi>, <bdi dir="ltr">{rt(-s.t)}</bdi>, <bdi dir="ltr">{rt(other)}</bdi>], 0, [null, why(-s.t), why(other)]),
      hints: [C(k, 'time.hint1'), C(k, 'time.hint2')], explain: C(k, 'time.explain', o),
    };
  },
  arrows: (lab, task, k) => {
    const s = solvedOf(lab, task);
    const sum = Array.from({ length: s.t }, () => par(s.r)).join('+');
    const o = { r: iso(minus(s.r)), t: iso(s.t), floor: iso(minus(s.floor)), a: iso(Math.abs(s.r)), wrong: iso(minus(s.r + s.t)) };
    return {
      id: 'arrows', kind: 'choice', prompt: C(k, 'arrows.prompt', o),
      options: pick([<MathText>{$(`${sum}=${par(s.r)}\\times ${s.t}=${tx(s.floor)}`)}</MathText>, <MathText>{$(`${par(s.r)}+${s.t}=${tx(s.r + s.t)}`)}</MathText>,
        <MathText>{$(`${Math.abs(s.r)}\\times ${s.t}=${Math.abs(s.floor)}`)}</MathText>], 0, [null, C(k, 'arrows.whySum', o), C(k, 'arrows.whyAbs', o)]),
      hints: [C(k, 'arrows.hint1', o), C(k, 'arrows.hint2', o)], explain: C(k, 'arrows.explain', o),
    };
  },
  side: (lab, task, k) => {
    const s = solvedOf(lab, task);
    const right = s.floor > 0 ? 0 : s.floor < 0 ? 1 : 2;
    const o = { r: iso(minus(s.r)), t: iso(rt(s.t)), floor: iso(minus(s.floor)), side: k(`side.${L.sideOf(s.floor)}`) };
    const why = C(k, 'side.why', o);
    return {
      id: 'side', kind: 'choice', prompt: C(k, 'side.prompt', o),
      options: pick([C(k, 'side.above'), C(k, 'side.below'), C(k, 'side.at')], right, [why, why, why]),
      hints: [C(k, 'side.hint1', o), C(k, 'side.hint2', o)], explain: C(k, 'side.explain', o),
    };
  },
  distance: (lab, task, k) => {
    const s = solvedOf(lab, task);
    const d = Math.abs(s.floor);
    const o = { a: iso(rt(Math.abs(s.r))), b: iso(rt(Math.abs(s.t))), d: iso(rt(d)) };
    return {
      id: 'distance', kind: 'number', expected: String(d), answer: <bdi dir="ltr">{rt(d)}</bdi>,
      prompt: C(k, 'distance.prompt', o), hints: [C(k, 'distance.hint1'), C(k, 'distance.hint2', o)], explain: C(k, 'distance.explain', o),
    };
  },
  before: (lab, task, k) => {
    const s = solvedOf(lab, task);
    const o = { r: iso(minus(s.r)), t: iso(rt(s.t)), floor: iso(minus(s.floor)), side: k(`side.${L.sideOf(s.floor)}`) };
    return {
      id: 'before', kind: 'choice', prompt: C(k, 'before.prompt', o),
      options: pick([C(k, 'before.right'), C(k, 'before.turned'), C(k, 'before.broken')], 0, [null, C(k, 'before.whyTurned', o), C(k, 'before.whyBroken')]),
      hints: [C(k, 'before.hint1'), C(k, 'before.hint2', o)], explain: C(k, 'before.explain', o),
    };
  },
  value: (lab, task, k) => {
    const s = solvedOf(lab, task);
    const calc = $(`${par(s.r)}\\times ${par(s.t)}`);
    const o = { calc, r: iso(minus(s.r)), t: iso(rt(s.t)), floor: iso(minus(s.floor)), full: $(`${par(s.r)}\\times ${par(s.t)}=${tx(s.floor)}`) };
    return {
      id: 'value', kind: 'number', expected: String(s.floor), answer: <bdi dir="ltr">{rt(s.floor)}</bdi>,
      prompt: C(k, 'value.prompt', o), hints: [C(k, 'value.hint1', o), C(k, 'value.hint2')], explain: C(k, 'value.explain', o),
    };
  },
  product: (lab, task, k) => {
    const s = solvedOf(lab, task);
    const a = Math.abs(s.r); const b = Math.abs(s.t); const d = Math.abs(s.floor);
    const o = { floor: iso(minus(s.floor)), a: iso(rt(a)), b: iso(rt(b)), d: iso(rt(d)), sum: iso(rt(a + b)), diff: iso(rt(Math.abs(a - b))) };
    return {
      id: 'product', kind: 'choice', cols: 3, prompt: C(k, 'product.prompt', o),
      options: pick([<MathText>{$(`${tx(a)}\\times ${tx(b)}`)}</MathText>, <MathText>{$(`${tx(a)}+${tx(b)}`)}</MathText>, <MathText>{$(`${tx(Math.max(a, b))}-${tx(Math.min(a, b))}`)}</MathText>], 0,
        [null, C(k, 'product.whySum', o), C(k, 'product.whyDiff', o)]),
      hints: [C(k, 'product.hint1'), C(k, 'product.hint2', o)], explain: C(k, 'product.explain', o),
    };
  },
  signs: (lab, task, k) => {
    const s = solvedOf(lab, task);
    const rows = L.recordRows({ ...lab, solved: { ...lab.solved, [lab.tasks.indexOf(task)]: s } });
    const row = (x) => iso(`(${minus(x.r)} ; ${rt(x.t)} ; ${minus(x.floor)})`);
    const tPos = rows.find((x) => x.t > 0 && x.floor < 0);
    const rPos = rows.find((x) => x.r > 0 && x.floor < 0);
    const pos = rows.filter((x) => x.floor > 0).map(row).join(' ، ');
    return {
      id: 'signs', kind: 'choice', prompt: C(k, 'signs.prompt'),
      options: pick([C(k, 'signs.same'), C(k, 'signs.timePos'), C(k, 'signs.speedPos')], 0,
        [null, tPos ? C(k, 'signs.whyRow', { row: row(tPos) }) : C(k, 'signs.whyGeneric'), rPos ? C(k, 'signs.whyRow', { row: row(rPos) }) : C(k, 'signs.whyGeneric')]),
      hints: [C(k, 'signs.hint1'), C(k, 'signs.hint2')], explain: C(k, 'signs.explain', { rows: pos || '—' }),
    };
  },
  twoWays: (lab, task, k) => {
    const s = solvedOf(lab, task);
    const up = s.r > 0 ? s : s.also; const down = s.r > 0 ? s.also : s;
    const right = task.floor < 0 ? 0 : 1;
    const o = { floor: iso(minus(task.floor)), tUp: iso(rt(up?.t ?? 0)), tDown: iso(rt(down?.t ?? 0)) };
    return {
      id: 'twoWays', kind: 'choice', prompt: C(k, 'twoWays.prompt', o),
      options: pick([C(k, 'twoWays.up'), C(k, 'twoWays.down'), C(k, 'twoWays.both')], right, [C(k, 'twoWays.why', o), C(k, 'twoWays.why', o), C(k, 'twoWays.why', o)]),
      hints: [C(k, 'twoWays.hint1'), C(k, 'twoWays.hint2', o)], explain: C(k, 'twoWays.explain', o),
    };
  },
  rule: (lab, task, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k('discovery.prompt')}</MathText>, options: discoveryOptions(lab, k),
    hints: [C(k, 'rule.hint1'), C(k, 'rule.hint2')], explain: <Formal lab={lab} k={k} />,
  }),
};
