import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Sprout, Star, Minus, Plus } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import { sumWith, cellsOf } from '@smarter-academy/core/arithmetic/fractions3.js';
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
import * as L from '../logic/seedRake';
import SeedScene, { CSS as SCENE_CSS } from './seedRake/SeedScene';
import { W, H, ZONE_COLORS, HARVEST, borderOf, nFromX } from './seedRake/seedArt';

/**
 * seed-rake — L'ESPACEMENT SOUS LA MAIN : « مشط الشتلات » (3AM, unité 2 « العمليات على الكسور والأعداد الناطقة », درس « جمع وطرح كسرين », 2026-10-26).
 * La logique, exacte, est dans `logic/seedRake.js` (sur `packages/core/arithmetic/fractions3.js` et `powers.js`, importés PAR CHEMIN) ; le dessin dans
 * `seedRake/SeedScene.jsx` et `seedRake/seedArt.js`. Distinct de `fraction-knife` (1AM : UNE part est fixe, la main tient le nombre de parts d'UN tout ; il n'additionne jamais),
 * de `tile-yard` (1AM : la main porte UNE tuile pour mesurer une aire), de `ruler-compare` (1AM : une graduation décimale sépare deux longueurs) et de `unit-ladder` (unité 3 : une
 * bande étirée sur des colonnes d'unités) : ici la main ÉTIRE un râteau (un espacement 1/N qui s'accroche aux fractions unitaires) pour que DEUX OU TROIS zones voisines contiennent
 * chacune un nombre ENTIER de plants ; la somme se lit en plants, le même pour tout espacement qui convient, et le besoin du jardinier (de la place pour les plants) fait choisir
 * le PLUS LARGE : le plus petit multiple commun.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tire la poignée du râteau (ou − / + , ← → , Début) : la variable est N, l'espacement 1/N m ; « ازرع » sème un plant par case.
 * B. Les dents s'écartent ou se resserrent ; chaque zone reçoit ses plants ; la longueur plantée est une accolade sur la règle.
 * C. En مبتدئ les décomptes sont visibles ; en متقدم le râteau est BLOQUÉ : on écrit N et la longueur, puis « ازرع » vérifie (aucun décompte avant).
 * D. Chaque semis est un essai (le N, le verdict, les décomptes) ; chaque engagement aussi.
 * E. À découvrir (مبتدئ, après g1–g3) : « لماذا نجحت المسافتان ولم تنجح … ؟ » — « le plus grand nombre réussit » et « la somme des dénominateurs » réfutés avec SES nombres.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        a/b ± c/d : on ne compte que des parts de la même taille ; un dénominateur commun est un multiple commun ; le plus petit est le plus large espacement
 *   OBJECT         un حوض de 1 m, sa règle, des zones de cultures et leurs pancartes, un râteau de jardin, des plants dans des cases de terre, un second حوض ; Sara (KidFigure)
 *   VARIABLE       l'espacement 1/N m (N = 2 … 60) ; en متقدم l'engagement écrit (N et la longueur)
 *   INVARIANT      la longueur plantée est la même pour tout espacement qui convient (5/12 m pour 1/12 comme pour 1/24)
 *   TRANSFORMATION chaque changement de N écarte les dents ; chaque semis place un plant par case
 *   CONSTRAINT     chaque zone doit contenir un nombre ENTIER de cases ; N entier ; 2 ≤ N ≤ 60 ; résultats positifs (hors de cette leçon : le négatif)
 *   RESISTANCE     la case à cheval sur la frontière (plant flétri, contour rouge, rien n'est compté), un total faux réfuté par les plants, le râteau bloqué en متقدم
 *   EVIDENCE       les décomptes par zone, l'accolade sur la règle, les pastilles « 1/12 ← 5 », la phrase écrite avec SES nombres
 *   CONTRAST       1/4 + 1/6 : 1/10 refusé (2,5 cases), 1/12 et 1/24 acceptés, même accolade ; 2/10 (le faux « on additionne les haut et bas ») plus court qu'UN seul des deux
 *   PREDICTION     N et le total écrits avant de semer (متقدم)
 *   DISCOVERY      « لماذا نجحت المسافتان … ولم تنجح … ؟ »
 *   FORMALIZATION  1/4 + 1/6 = 3/12 + 2/12 = 5/12 ; un multiple commun ; le plus petit multiple commun
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * « جرّب كل الإمكانيات » : NON (chaque semis EST l'essai). « جرّب أعدادك » est TOUJOURS ouvert sous le labo (jusqu'à 3 zones, la dernière peut être une récolte ; une prédiction
 * quelconque est dessinée en pointillés sans être jugée).
 * D'UN SEUL REGARD (§8bis) : `[data-sr-glance]` enveloppe la consigne, la scène, les décomptes, les commandes et le verdict.
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/seedRake.js › coachOf` (rake · plant · border · predict · free).
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 5, 2026-10-28) : `checkpoints` (défaut true). Après CHAQUE tâche, une suite de questions se pose PAR-DESSUS le labo
 * et retient « المهمة التالية » (`CHAINS`), construite sur SES essais (`lab.record`) : g1 pourquoi l'espacement refusé · combien de plants · la même longueur · le plus large ; g2 le total · lequel
 * échoue ; g3 les plants restants · la RÈGLE (l'ancienne découverte, qui formalise) ; a1–a4 et `fewest` : les cases de la 1re zone et le total à l'espacement le plus large. OBLIGATOIRES pour tout
 * élève ; l'ENSEIGNANT seul les coupe pour SON compte (`useLabCheckpointSettings`, interrupteur dans l'en-tête) ; coupées, la découverte d'avant reprend. Le module 1 de `jam-tarh-kasrayn` en
 * garde la TRACE (événements `checkpoint` du labo). ÉTAPES `LabStepper` (`[data-sr-step=<i>]`) + fête ; « إعادة » repart de la tâche 1 ; « أعِد التجربة » remet LA MÊME tâche. SON (`playSfx`) :
 * `tooth` quand le râteau change d'espacement, `bell` pour un semis qui convient, `flag` à l'objectif, `over` pour un semis refusé ou une prédiction fausse.
 * Props : `tasks` ([{ id, kind, terms, need, needRefusal, widest }]), `world` ('bed' | 'fewest'), `level`, `levels`, `coach`, `checkpoints`, `title`, `lead`, `onTrial(event)`, `onFinished({ world })`.
 * CONTRAT DOM : [data-seed-rake][data-task][data-solved][data-world], [data-sr-glance], [data-sr-stage], [data-sr-svg][data-n], [data-sr-rake][data-n][data-locked], [data-sr-tooth],
 * [data-sr-bed], [data-sr-zone], [data-sr-sign], [data-sr-plant], [data-sr-wilt], [data-sr-borderline], [data-sr-bracket], [data-sr-second], [data-sr-readout][data-n], [data-sr-less],
 * [data-sr-more], [data-sr-plant-btn], [data-sr-star], [data-sr-count][data-zone][data-value], [data-sr-log][data-sr-log-item], [data-sr-predict], [data-sr-pred-n], [data-sr-pred-num],
 * [data-sr-pred-den], [data-sr-verdict], [data-sr-step], [data-sr-free][data-active], [data-sr-free-a|b=<i>], [data-sr-free-harvest], [data-sr-free-pred-n|d], [data-sr-formal], [data-sr-next].
 */
const NS = 'manipulation.seedRake';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const tex = (p) => { const [a, b] = String(p).split('/'); return `\\frac{${a}}{${b}}`; };
const mathOf = (p) => `$${tex(p)}$`;
const frac = (n, d) => `${n}/${d}`;
const zoneColor = (i, z) => (z?.sub ? HARVEST : ZONE_COLORS[i % 3]);

export function numbersFor({ tasks, world, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['seed-rake'][lv].numbers;
  return { tasks: tasks ?? asked.tasks, world: world ?? asked.world ?? 'bed' };
}

export default function SeedRake({
  tasks, world, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, world, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'seed-rake', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
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
  const cpSettings = useLabCheckpointSettings('seed-rake');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
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
    lab: 'seed-rake', step: coachStep,
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
    <ManipulationDiscovery state={state} prompt={<MathText>{discoveryPrompt(lab, k)}</MathText>}
      options={discoveryOptions(lab, k)} formal={<Formal lab={lab} k={k} />} />
  );

  return (
    <ManipulationShell
      type="seed-rake"
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
      <ManipulationStage className="bg-gradient-to-b from-lime-50/70 to-white">
        <div ref={boxRef} className="space-y-2" data-seed-rake data-task={lab.ti} data-world={lab.world} data-solved={everyDone ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: SCENE_CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} lead={state.isAuthoredLevel ? lead : null} cp={cp} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Les mots ══════════════ */

const NAMES = ['crop.tomato', 'crop.pepper', 'crop.onion'];
function plants(k, n) {
  if (n === 1) return k('plant.one');
  if (n === 2) return k('plant.two');
  return k(n >= 3 && n <= 10 ? 'plant.few' : 'plant.many', { n: iso(String(n)) });
}
const spacing = (N) => iso(frac(1, N));
const zoneName = (k, t, i) => (t.terms[i]?.sub ? k('crop.harvest') : k(NAMES[i % 3]));

function contextOf(t, k, free) {
  const f = t.terms.map((x) => mathOf(x.p));
  const m = '$1$ م';
  const base = t.harvest
    ? (t.terms.length === 3
      ? k('context.harvest3', { m, f1: f[0], f2: f[1], f3: f[2] })
      : t.terms.length === 2 ? k('context.harvest', { m, f1: f[0], f2: f[1] }) : k('context.add1', { m, f1: f[0] }))
    : t.terms.length === 3 ? k('context.add3', { m, f1: f[0], f2: f[1], f3: f[2] }) : t.terms.length === 2 ? k('context.add2', { m, f1: f[0], f2: f[1] }) : k('context.add1', { m, f1: f[0] });
  return free ? `${k('context.freePrefix')} ${base}` : base;
}

function borderText(t, pl, k) {
  const info = borderOf(t, pl.borderAt);
  if (info.kind === 'harvest') return k('border.harvest');
  if (info.kind === 'end') return k('border.end', { a: zoneName(k, t, info.left) });
  return k('border.between', { a: zoneName(k, t, info.left), b: zoneName(k, t, info.right) });
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, screenH, lead, cp }) {
  const uid = `sr${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const free = L.isFree(lab);
  const t = L.taskOf(lab);
  const done = L.taskDone(lab);
  const predictKind = !free && t.kind === 'predict';
  const canRake = L.canRake(lab);
  const pl = lab.planted;
  const svgRef = useRef(null);

  /* ── le geste : la poignée du râteau (glisser), − / + , ← → */
  const dragRef = useRef(false);
  const xOf = (e) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r || !r.width) return null;
    return ((e.clientX - r.left) / r.width) * W;
  };
  const pointTo = (e) => { const x = xOf(e); if (x != null) setLab((s) => L.setN(s, nFromX(x))); };
  const down = (e) => { if (!canRake) return; e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); dragRef.current = true; pointTo(e); };
  const move = (e) => { if (dragRef.current && canRake) pointTo(e); };
  const up = () => { dragRef.current = false; };
  const keyDown = (e) => {
    if (!canRake) return;
    const map = { ArrowRight: -1, ArrowUp: -1, ArrowLeft: 1, ArrowDown: 1 };
    if (e.key in map) { e.preventDefault(); setLab((s) => L.stepN(s, map[e.key] * (e.shiftKey ? 5 : 1))); } else if (e.key === 'Home') { e.preventDefault(); setLab((s) => L.setN(s, 2)); } else if (e.key === 'Enter') { e.preventDefault(); setLab((s) => L.plant(s)); }
  };
  const grabProps = {
    tabIndex: canRake ? 0 : -1, role: 'slider', 'aria-valuemin': 2, 'aria-valuemax': 60, 'aria-valuenow': lab.N, 'aria-valuetext': k('rake.valueText', { s: spacing(lab.N) }),
    'aria-label': done ? k('rake.ariaFrozen') : k('rake.aria'), 'aria-disabled': canRake ? undefined : 'true',
    onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: up, onKeyDown: keyDown, style: { touchAction: 'none' },
  };

  /* ── la consigne : le contexte, puis UNE question */
  const ctx = contextOf(t, k, free);
  const question = free ? k('question.free') : predictKind ? k('question.predict') : lab.world === 'fewest' ? k('question.fewest') : k('question.plant');
  // une étape est FAITE quand la tâche est finie ET que ses questions (LabCheckpoint) sont répondues : la pastille passe au vert et on fête
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-sr-step" />
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
  // le son (muet sans « الصوت ») : un déclic quand le râteau change d'espacement, une cloche pour un semis qui convient, le drapeau à l'objectif, « over » si refusé
  const heard = useRef({ N: lab.N, at: 0, n: lab.trials.length, ti: lab.ti });
  useEffect(() => {
    const h = heard.current;
    if (h.ti !== lab.ti || lab.trials.length < h.n) { heard.current = { N: lab.N, at: 0, n: lab.trials.length, ti: lab.ti }; return; }
    if (lab.N !== h.N) {
      const now = Date.now();
      if (now - h.at > 35) { playSfx('tooth', { pitch: lab.N > h.N ? 1 : 0.75 }); h.at = now; }
      h.N = lab.N;
    }
    const fresh = lab.trials.slice(h.n);
    h.n = lab.trials.length;
    if (!fresh.length) return;
    if (fresh.some((e) => e.kind === 'solved')) playSfx('flag');
    else if (fresh.some((e) => e.kind === 'refused' || (e.kind === 'predict' && e.ok === false))) playSfx('over');
    else if (fresh.some((e) => e.kind === 'plant' && e.ok)) playSfx('bell');
  }, [lab.N, lab.trials, lab.ti]);
  const prompt = (
    <PromptCard size="md" context={<MathText>{ctx}</MathText>} contextProps={{ 'data-sr-context': free ? 'free' : t.kind }}
      title={<MathText>{question}</MathText>} titleClassName="text-base" lamp={free ? null : done ? 'on' : 'off'}
      titleProps={{ 'data-sr-prompt': t.kind, 'data-lit': done ? 'true' : 'false' }}
      aside={steps || undefined} instruction={lead || (!free && !predictKind && lab.world === 'bed' && lab.ti === 0 ? k('lead') : undefined)} />
  );

  /* ── la scène */
  const innerH = typeof window !== 'undefined' && window.innerHeight ? window.innerHeight : screenH + 40;
  const fixed = 318 + (predictKind ? 66 : 0) + (lab.tasks.length > 1 && lab.ti > 0 ? 30 : 0) + (lead ? 28 : 0);
  const hBudget = Math.max(130, Math.min(300, innerH - 24 - fixed));
  const scale = Math.max(0.6, Math.min(1.2, Math.min(width / W, hBudget / H)));
  const mood = done || (pl && pl.ok) ? 'proud' : pl && !pl.ok ? 'wonder' : 'happy';
  const stage = (
    <StageFrame className="min-w-0 overflow-hidden" data-sr-stage data-scale={scale.toFixed(2)} data-screen-h={Math.round(screenH)}>
      <SeedScene lab={lab} k={k} uid={uid} width={width} scale={scale} mood={mood} grabProps={grabProps} svgRef={svgRef} />
    </StageFrame>
  );

  /* ── les décomptes (visibles seulement après un semis qui convient) */
  const counts = pl && pl.ok ? (
    <div className="flex min-w-0 max-w-full flex-wrap items-center justify-center gap-1.5" data-sr-counts>
      {t.zones.map((z, i) => (
        <span key={i} data-sr-count data-zone={i} data-value={pl.counts[i]} className="inline-flex items-center gap-1.5 rounded-full border-2 bg-white px-2.5 py-1 text-xs font-black text-slate-800" style={{ borderColor: zoneColor(i, z).fill }}>
          <span className="h-3 w-3 rounded-full" style={{ background: zoneColor(i, z).fill }} aria-hidden="true" />
          {zoneName(k, t, i)}: {plants(k, pl.counts[i])}
        </span>
      ))}
      <span data-sr-total className="inline-flex items-center rounded-full border-2 border-indigo-300 bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-950">
        <MathText>{k('count.total', { n: plants(k, pl.signedN), s: spacing(pl.N), len: iso(pl.totalText) })}</MathText>
      </span>
    </div>
  ) : null;

  const rec = free ? { works: [], refused: [] } : lab.record[t.id] ?? { works: [], refused: [] };
  const log = !free && !predictKind && rec.works.length > 0 && (
    <div className="flex min-w-0 max-w-full flex-wrap items-center gap-1.5" data-sr-log>
      <span className="text-xs font-extrabold text-slate-600">{k('log.title')}</span>
      {rec.works.map((N) => {
        const r = sumWith(t.terms, N);
        return (
          <span key={N} data-sr-log-item={N} className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-900">
            <bdi dir="ltr">{`1/${N} → ${r.signed}`}</bdi>
          </span>
        );
      })}
      {rec.works.length >= 2 && <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-900">{k('log.same', { len: iso(t.totalText) })}</span>}
    </div>
  );

  /* ── les commandes */
  const btn = `inline-flex min-h-[44px] items-center justify-center gap-1 rounded-2xl border-2 px-2.5 text-base font-black shadow-[0_3px_0_0_var(--sr-sh)] transition-all duration-150 active:translate-y-0.5 active:shadow-none disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none motion-reduce:transition-none ${ring}`;
  const lime = `${btn} border-emerald-300 bg-white text-emerald-950 [--sr-sh:#6EE7B7]`;
  const green = `${btn} border-emerald-700 bg-emerald-600 text-white [--sr-sh:#047857]`;
  const amber = `${btn} border-amber-400 bg-amber-50 text-amber-950 [--sr-sh:#FCD34D]`;
  const canPlant = L.canPlant(lab);
  const field = `h-10 rounded-xl border-2 border-amber-300 bg-white text-center text-lg font-black tabular-nums ${ring}`;
  const predictRow = predictKind && !done && (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 rounded-2xl bg-amber-50 px-3 py-1.5" data-sr-predict>
      <label className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
        {k('predict.nLabel')}
        <bdi dir="ltr" className="inline-flex items-center gap-1">
          <span>1 /</span>
          <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" maxLength={2} value={lab.predN} onChange={(e) => setLab((s) => L.setPredN(s, e.target.value))} aria-label={k('predict.nAria')} data-sr-pred-n className={`${field} w-14`} />
        </bdi>
      </label>
      <label className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
        {k('predict.lenLabel')}
        <bdi dir="ltr" className="inline-flex items-center gap-1">
          <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" maxLength={3} value={lab.predNum} onChange={(e) => setLab((s) => L.setPredNum(s, e.target.value))} aria-label={k('predict.numAria')} data-sr-pred-num className={`${field} w-16`} />
          <span>/</span>
          <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" maxLength={3} value={lab.predDen} onChange={(e) => setLab((s) => L.setPredDen(s, e.target.value))} aria-label={k('predict.denAria')} data-sr-pred-den className={`${field} w-16`} />
        </bdi>
        <span>{k('unit.m')}</span>
      </label>
    </div>
  );
  const controls = (
    <LabCard className="space-y-1.5 p-1.5" data-sr-controls>
      {predictRow}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {!predictKind && (
          <>
            <button type="button" className={lime} onClick={() => setLab((s) => L.stepN(s, 1))} disabled={!canRake || lab.N >= L.MAX_N} aria-label={k('less.aria')} data-sr-less>
              <Minus className="h-5 w-5" aria-hidden="true" /> <span dir="rtl">{k('less.label')}</span>
            </button>
            <span className="inline-flex min-h-[44px] flex-col items-center justify-center rounded-2xl border-2 border-lime-300 bg-lime-50 px-2.5 py-0.5 text-base font-black leading-tight text-emerald-950" data-sr-readout data-n={lab.N} aria-live="polite">
              <span className="text-[10.5px] font-extrabold text-slate-600">{k('readout.label')}</span>
              <span className="inline-flex items-baseline gap-1"><bdi dir="ltr" className="text-xl tabular-nums">{`1/${lab.N}`}</bdi> <span className="text-xs">{k('unit.m')}</span></span>
            </span>
            <button type="button" className={lime} onClick={() => setLab((s) => L.stepN(s, -1))} disabled={!canRake || lab.N <= L.MIN_N} aria-label={k('more.aria')} data-sr-more>
              <Plus className="h-5 w-5" aria-hidden="true" /> <span dir="rtl">{k('more.label')}</span>
            </button>
          </>
        )}
        {(canPlant || predictKind) && (
          <button type="button" className={green} onClick={() => setLab(predictKind ? L.attempt : L.plant)} disabled={predictKind ? !L.predictReady(lab) : !canPlant} aria-label={k('plantBtn.aria')} data-sr-plant-btn>
            <Sprout className="h-5 w-5" aria-hidden="true" /> <span dir="rtl">{k('plantBtn.label')}</span>
          </button>
        )}
        {(L.starVisible(lab) || lab.hunt) && !free && !predictKind && (
          <button type="button" className={amber} onClick={() => setLab(L.star)} disabled={lab.hunt} aria-label={k('star.aria')} data-sr-star data-on={lab.hunt ? 'true' : 'false'}>
            <Star className="h-5 w-5" aria-hidden="true" /> <span dir="rtl">{k('star.label')}</span>
          </button>
        )}
      </div>
    </LabCard>
  );

  /* ── le verdict */
  const vv = verdictOf(lab, k);
  const canNext = L.canNext(lab) && !cp.blocking;
  const Icon = vv.tone === 'emerald' ? CheckCircle2 : vv.tone === 'indigo' ? Hand : Sparkles;
  const banner = (
    <VerdictBanner tone={vv.tone} icon={Icon} size="sm" className="min-h-[2.75rem] !py-1.5" data-sr-verdict={vv.code}>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <p className={vv.tone === 'indigo' ? 'font-bold text-indigo-900' : ''}><MathText>{vv.text}</MathText></p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-sr-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );

  return (
    <>
      <div className="relative space-y-2" data-sr-glance>
        {party.node}
        {cp.node}
        {prompt}
        {stage}
        {counts}
        {log}
        {done && predictKind ? null : controls}
        {banner}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ Le verdict ══════════════ */

function verdictOf(lab, k) {
  const t = L.taskOf(lab);
  const free = L.isFree(lab);
  const pl = lab.planted;
  if (lab.refusal) return { text: k(`refusal.${lab.refusal}`), tone: 'rose', code: `refusal-${lab.refusal}` };
  if (free) {
    if (!pl) return { text: k('idle.free'), tone: 'indigo', code: '' };
    if (!pl.ok) return { text: `${borderText(t, pl, k)} ${k('v.freeNote')}`, tone: 'rose', code: 'free' };
    return { text: k('v.freeOk', { n: plants(k, pl.signedN), s: spacing(pl.N), len: iso(pl.totalText) }), tone: 'emerald', code: 'free' };
  }
  const last = lab.trials.at(-1);
  if (t.kind === 'predict') {
    if (!pl || !last || last.mission !== t.id || last.kind === 'solved') {
      if (L.taskDone(lab) && pl) return { text: k('v.predictOk', { len: iso(t.totalText) }), tone: 'emerald', code: 'ok' };
      return { text: k('idle.predict'), tone: 'indigo', code: '' };
    }
    if (last.kind === 'predict') {
      if (last.why === 'border') return { text: `${k('v.predictBorder', { s: spacing(last.N) })} ${borderText(t, pl, k)}`, tone: 'rose', code: 'refuted' };
      if (last.why === 'value') return { text: k('v.predictValue', { s: spacing(last.N), n: plants(k, pl.signedN), len: iso(pl.totalText), wrote: iso(last.value) }), tone: 'amber', code: 'refuted' };
      if (last.why === 'wider') return { text: k('v.wider', { s: spacing(last.N), len: iso(pl.totalText) }), tone: 'indigo', code: 'wider' };
      return { text: k('v.predictOk', { len: iso(pl.totalText) }), tone: 'emerald', code: 'ok' };
    }
    return { text: k('idle.predict'), tone: 'indigo', code: '' };
  }
  if (pl && !pl.ok) return { text: `${borderText(t, pl, k)} ${k('v.nothingCounted')}`, tone: 'rose', code: 'refused' };
  if (pl && pl.ok) {
    const rec = lab.record[t.id] ?? { works: [] };
    if (t.widest && pl.N !== t.widestN) return { text: k('v.wider', { s: spacing(pl.N), len: iso(pl.totalText) }), tone: 'indigo', code: 'wider' };
    if (lab.hunt && pl.N === Math.min(...rec.works) && rec.works.length > 1) return { text: k('v.huntBest', { s: spacing(pl.N) }), tone: 'indigo', code: 'hunt' };
    return { text: k('v.ok', { n: plants(k, pl.signedN), s: spacing(pl.N), len: iso(pl.totalText) }), tone: L.taskDone(lab) ? 'emerald' : 'indigo', code: 'ok' };
  }
  if (L.taskDone(lab)) return { text: k('v.done'), tone: 'emerald', code: 'ok' };
  if (lab.hunt) return { text: k('idle.hunt', { s: spacing(L.widestFound(lab)) }), tone: 'indigo', code: 'hunt' };
  return { text: k('idle.plant'), tone: 'indigo', code: '' };
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const blank = [{ a: '1', b: '4' }, { a: '1', b: '6' }, { a: '', b: '' }];
  const [rows, setRows] = useState(blank);
  const [harvest, setHarvest] = useState(false);
  const [bad, setBad] = useState(null);
  const apply = (nextRows, nextHarvest) => {
    const v = L.validateFree(nextRows, nextHarvest);
    if (v.ok) { setBad(null); setLab((s) => L.setFree(s, v.cfg)); } else setBad(v.why === 'empty' ? null : v.why);
  };
  const edit = (i, which) => (e) => {
    const raw = L.latin(e.target.value).replace(/[^0-9]/g, '').slice(0, 2);
    const next = rows.map((r, j) => (j === i ? { ...r, [which]: raw } : r));
    setRows(next);
    apply(next, harvest);
  };
  const flip = (e) => { setHarvest(e.target.checked); apply(rows, e.target.checked); };
  const pred = lab.freePred;
  const box = `h-11 w-14 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-emerald-300'} bg-white px-1 text-center text-xl font-black tabular-nums text-emerald-950 ${ring}`;
  const pbox = 'h-11 w-14 rounded-xl border-2 border-orange-300 bg-white px-1 text-center text-xl font-black tabular-nums text-orange-950 outline-none focus-visible:ring-4 focus-visible:ring-orange-200';
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-sr-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex flex-col gap-1 text-xs font-black text-emerald-950">
            <span>{k('free.zone', { i: i + 1 })}</span>
            <bdi dir="ltr" className="inline-flex items-center gap-1">
              <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" value={r.a} onChange={edit(i, 'a')} aria-label={k('free.aAria', { i: i + 1 })} aria-invalid={!!bad} data-sr-free-a={i} className={box} />
              <span>/</span>
              <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" value={r.b} onChange={edit(i, 'b')} aria-label={k('free.bAria', { i: i + 1 })} aria-invalid={!!bad} data-sr-free-b={i} className={box} />
            </bdi>
          </div>
        ))}
        <label className="flex min-h-[44px] items-center gap-1.5 text-xs font-black text-emerald-950">
          <input type="checkbox" checked={harvest} onChange={flip} data-sr-free-harvest className="h-5 w-5" /> {k('free.harvest')}
        </label>
        <div className="flex flex-col gap-1 text-xs font-black text-orange-900">
          <span>{k('free.pred')}</span>
          <bdi dir="ltr" className="inline-flex items-center gap-1">
            <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" value={pred.n} onChange={(e) => setLab((s) => L.setFreePred(s, e.target.value, s.freePred.d))} aria-label={k('free.predNAria')} data-sr-free-pred-n className={pbox} />
            <span>/</span>
            <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" value={pred.d} onChange={(e) => setLab((s) => L.setFreePred(s, s.freePred.n, e.target.value))} aria-label={k('free.predDAria')} data-sr-free-pred-d className={pbox} />
          </bdi>
        </div>
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-sr-free-back
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
      {bad && <p role="alert" className="text-sm font-bold text-rose-700" data-sr-free-refusal={bad}>{k(`free.refusal.${bad}`)}</p>}
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

export function discoveryPrompt(lab, k) {
  const f = L.formalOf(lab);
  return k('discovery.prompt', { w1: spacing(f.works[0]), w2: spacing(f.works[1]), bad: spacing(f.bad) });
}

export function discoveryOptions(lab, k) {
  const f = L.formalOf(lab);
  const [d1, d2] = f.dens;
  return [
    {
      text: <MathText>{k('discovery.bigger')}</MathText>,
      why: <MathText>{k('discovery.whereBigger', { wit: spacing(f.witnessBigger), w: iso(Math.max(...f.works)) })}</MathText>,
    },
    { text: <MathText>{k('discovery.right', { n1: iso(f.works[0]), n2: iso(f.works[1]), d1: iso(d1), d2: iso(d2), bad: iso(f.bad) })}</MathText>, correct: true },
    {
      text: <MathText>{k('discovery.sum', { d1: iso(d1), d2: iso(d2) })}</MathText>,
      why: <MathText>{k('discovery.whereSum', { s: iso(f.sumDen), ss: spacing(f.sumDen) })}</MathText>,
    },
  ];
}

export function Formal({ lab, k }) {
  const f = L.formalOf(lab);
  const t = f.task;
  const r = sumWith(t.terms, f.widestN);
  const parts = t.terms.map((x, i) => `\\frac{${r.counts[i]}}{${f.widestN}}`);
  const eq = `$${t.terms.map((x) => tex(x.p)).join('+')}=${parts.join('+')}=\\frac{${r.signed}}{${f.widestN}}$`;
  const [d1, d2] = f.dens;
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-sr-formal>
      <p><MathText>{k('formal.sum', { eq })}</MathText></p>
      <p><MathText>{k('formal.lcm', { n: iso(f.widestN), d1: iso(d1), d2: iso(d2) })}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque tâche : elle interroge ce que l'élève vient de FAIRE (ses essais) ; g3 finit par la règle (l'ancienne découverte). */
export const CHAINS = Object.freeze({
  g1: ['whyRefused', 'plantsTotal', 'sameLength', 'widest'],
  g2: ['totalAt', 'failsWhich'],
  g3: ['harvestLeft', 'rule'],
  a1: ['cells', 'totalNum'],
  a2: ['cells', 'totalNum'],
  a3: ['cells', 'totalNum'],
  a4: ['cells', 'totalNum'],
  f1: ['plantsAt', 'longerThanBed'],
});

const $ = (s) => `$${s}$`;
const Q = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const at = (list, i) => { const [first, ...rest] = list; const out = [...rest]; out.splice(Math.min(i, out.length), 0, first); return out; };

const worksOf = (lab, t) => (lab.record?.[t.id]?.works?.length ? lab.record[t.id].works : t.working.slice(0, 2));



/** Chaque question est construite sur LES essais de la tâche (rien n'est écrit en dur) ; `k` : les textes de `seedRake`. */
export const QUESTIONS = {
  whyRefused: (lab, t, k) => {
    const refused = lab.record?.[t.id]?.refused ?? [];
    const bad = refused.length ? refused[refused.length - 1] : { N: 10, zone: 0 };
    const zi = Math.max(0, Math.min(bad.zone, t.terms.length - 1));
    const p = t.terms[zi].p;
    const [pa, pb] = p.split('/');
    const works = worksOf(lab, t);
    const o = { bad: iso(bad.N), s: spacing(bad.N), zone: zoneName(k, t, zi), p: $(tex(p)), pb: iso(pb), sw1: spacing(works[0]), calc: $(`${bad.N}\\times${tex(p)}=\\frac{${bad.N * Number(pa)}}{${pb}}`) };
    return {
      id: 'whyRefused', kind: 'choice',
      prompt: Q(k, 'whyRefused.prompt', o),
      options: at([
        { text: Q(k, 'whyRefused.right', o), correct: true },
        { text: Q(k, 'whyRefused.small'), why: Q(k, 'whyRefused.whySmall', o) },
        { text: Q(k, 'whyRefused.short'), why: Q(k, 'whyRefused.whyShort', o) },
      ], 0),
      hints: [Q(k, 'whyRefused.hint1', o), Q(k, 'whyRefused.hint2', o)],
      explain: Q(k, 'whyRefused.explain', o),
    };
  },
  plantsTotal: (lab, t, k) => {
    const N = worksOf(lab, t)[0];
    const r = sumWith(t.terms, N);
    const o = { s: spacing(N), N: iso(N), c1: iso(r.counts[0]), c2: iso(r.counts[1] ?? 0), n: iso(r.signed) };
    return {
      id: 'plantsTotal', kind: 'number', expected: String(r.signed), answer: <MathText>{$(String(r.signed))}</MathText>,
      prompt: Q(k, 'plantsTotal.prompt', o),
      hints: [Q(k, 'plantsTotal.hint1', o), Q(k, 'plantsTotal.hint2', o)],
      explain: Q(k, 'plantsTotal.explain', o),
    };
  },
  sameLength: (lab, t, k) => {
    const works = worksOf(lab, t);
    const [N1, N2 = works[0]] = works;
    const r1 = sumWith(t.terms, N1); const r2 = sumWith(t.terms, N2);
    const len = L.valueText(t.totalValue);
    const o = { s2: spacing(N2), s1: spacing(N1), n2: iso(r2.signed), n1: iso(r1.signed), len: $(tex(len)), f2: $(`\\frac{${r2.signed}}{${N2}}`), f1: $(`\\frac{${r1.signed}}{${N1}}`) };
    return {
      id: 'sameLength', kind: 'choice',
      prompt: Q(k, 'sameLength.prompt', o),
      options: at([
        { text: Q(k, 'sameLength.right', o), correct: true },
        { text: Q(k, 'sameLength.longer'), why: Q(k, 'sameLength.whyLonger', o) },
        { text: Q(k, 'sameLength.shorter'), why: Q(k, 'sameLength.whyShorter', o) },
      ], 1),
      hints: [Q(k, 'sameLength.hint1', o), Q(k, 'sameLength.hint2', o)],
      explain: Q(k, 'sameLength.explain', o),
    };
  },
  widest: (lab, t, k) => {
    const W0 = t.widestN;
    const o = { w: iso(W0), d1: iso(t.dens[0]), d2: iso(t.dens[1] ?? t.dens[0]) };
    return {
      id: 'widest', kind: 'choice', cols: 3,
      prompt: Q(k, 'widest.prompt'),
      options: at([
        { text: <MathText>{$(`\\frac{1}{${W0}}`)}</MathText>, correct: true },
        { text: <MathText>{$(`\\frac{1}{${W0 * 2}}`)}</MathText>, why: Q(k, 'widest.why', { ...o, x: iso(W0 * 2) }) },
        { text: <MathText>{$(`\\frac{1}{${W0 * 3}}`)}</MathText>, why: Q(k, 'widest.why', { ...o, x: iso(W0 * 3) }) },
      ], 1),
      hints: [Q(k, 'widest.hint1'), Q(k, 'widest.hint2', o)],
      explain: Q(k, 'widest.explain', o),
    };
  },
  totalAt: (lab, t, k) => {
    const N = worksOf(lab, t)[0];
    const r = sumWith(t.terms, N);
    const o = { s: spacing(N), c1: iso(r.counts[0]), c2: iso(r.counts[1] ?? 0), n: iso(r.signed), p1: $(tex(t.terms[0].p)), p2: $(tex(t.terms[1]?.p ?? t.terms[0].p)) };
    return {
      id: 'totalAt', kind: 'number', expected: String(r.signed), answer: <MathText>{$(String(r.signed))}</MathText>,
      prompt: Q(k, 'totalAt.prompt', o),
      hints: [Q(k, 'totalAt.hint1', o), Q(k, 'totalAt.hint2', o)],
      explain: Q(k, 'totalAt.explain', o),
    };
  },
  failsWhich: (lab, t, k) => {
    const [d1, d2 = d1] = t.dens;
    const bad = d1 + d2;
    const good1 = t.widestN; const good2 = t.widestN * 2;
    const calc = (N) => $(`${N}\\times${tex(t.terms[0].p)}=\\frac{${N * Number(t.terms[0].p.split('/')[0])}}{${d1}}`);
    const o = { p1: $(tex(t.terms[0].p)), p2: $(tex(t.terms[1]?.p ?? t.terms[0].p)), bad: iso(bad), d1: iso(d1), d2: iso(d2) };
    const wk = (N) => {
      const r = sumWith(t.terms, N);
      return Q(k, 'failsWhich.whyWorks', { ...o, x: iso(N), c1: iso(r.counts[0]), c2: iso(r.counts[1] ?? 0) });
    };
    return {
      id: 'failsWhich', kind: 'choice', cols: 3,
      prompt: Q(k, 'failsWhich.prompt', o),
      options: at([
        { text: <MathText>{$(`\\frac{1}{${bad}}`)}</MathText>, correct: true },
        { text: <MathText>{$(`\\frac{1}{${good1}}`)}</MathText>, why: wk(good1) },
        { text: <MathText>{$(`\\frac{1}{${good2}}`)}</MathText>, why: wk(good2) },
      ], 2),
      hints: [Q(k, 'failsWhich.hint1', o), Q(k, 'failsWhich.hint2', { ...o, calc: calc(bad) })],
      explain: Q(k, 'failsWhich.explain', { ...o, calc: calc(bad) }),
    };
  },
  harvestLeft: (lab, t, k) => {
    const N = worksOf(lab, t)[0];
    const r = sumWith(t.terms, N);
    const o = { s: spacing(N), c1: iso(r.counts[0]), c2: iso(r.counts[1] ?? 0), n: iso(r.signed) };
    return {
      id: 'harvestLeft', kind: 'number', expected: String(r.signed), answer: <MathText>{$(String(r.signed))}</MathText>,
      prompt: Q(k, 'harvestLeft.prompt', o),
      hints: [Q(k, 'harvestLeft.hint1', o), Q(k, 'harvestLeft.hint2', o)],
      explain: Q(k, 'harvestLeft.explain', o),
    };
  },
  rule: (lab, t, k) => ({
    id: 'rule', kind: 'choice',
    prompt: <MathText>{discoveryPrompt(lab, k)}</MathText>,
    options: discoveryOptions(lab, k),
    hints: [Q(k, 'rule.hint1'), Q(k, 'rule.hint2')],
    explain: <Formal lab={lab} k={k} />,
  }),
  cells: (lab, t, k) => {
    const N = t.widestN;
    const p = t.terms[0].p;
    const c = cellsOf(p, N).count;
    const o = { s: spacing(N), N: iso(N), zone: zoneName(k, t, 0), p: $(tex(p)), calc: $(`${N}\\times${tex(p)}=${c}`) };
    return {
      id: 'cells', kind: 'number', expected: String(c), answer: <MathText>{$(String(c))}</MathText>,
      prompt: Q(k, 'cells.prompt', o),
      hints: [Q(k, 'cells.hint1', o), Q(k, 'cells.hint2', o)],
      explain: Q(k, 'cells.explain', o),
    };
  },
  totalNum: (lab, t, k) => {
    const N = t.widestN;
    const r = sumWith(t.terms, N);
    const o = { s: spacing(N), N: iso(N), counts: r.counts.map((c) => iso(c)).join(' ، '), n: iso(r.signed), len: $(tex(t.totalText)) };
    return {
      id: 'totalNum', kind: 'number', expected: String(r.signed), answer: <MathText>{$(String(r.signed))}</MathText>,
      prompt: Q(k, 'totalNum.prompt', o),
      hints: [Q(k, 'totalNum.hint1', o), Q(k, 'totalNum.hint2', o)],
      explain: Q(k, 'totalNum.explain', o),
    };
  },
  plantsAt: (lab, t, k) => {
    const N = t.widestN;
    const r = sumWith(t.terms, N);
    const o = { s: spacing(N), c1: iso(r.counts[0]), c2: iso(r.counts[1] ?? 0), n: iso(r.signed) };
    return {
      id: 'plantsAt', kind: 'number', expected: String(r.signed), answer: <MathText>{$(String(r.signed))}</MathText>,
      prompt: Q(k, 'plantsAt.prompt', o),
      hints: [Q(k, 'plantsAt.hint1', o), Q(k, 'plantsAt.hint2', o)],
      explain: Q(k, 'plantsAt.explain', o),
    };
  },
  longerThanBed: (lab, t, k) => {
    const N = t.widestN;
    const r = sumWith(t.terms, N);
    const o = { len: $(tex(t.totalText)), N: iso(N), n: iso(r.signed), rest: $(`\\frac{${r.signed - BigInt(N)}}{${N}}`) };
    return {
      id: 'longerThanBed', kind: 'choice',
      prompt: Q(k, 'longerThanBed.prompt', o),
      options: at([
        { text: Q(k, 'longerThanBed.longer'), correct: true },
        { text: Q(k, 'longerThanBed.shorter'), why: Q(k, 'longerThanBed.whyShorter', o) },
        { text: Q(k, 'longerThanBed.equal'), why: Q(k, 'longerThanBed.whyEqual', o) },
      ], 2),
      hints: [Q(k, 'longerThanBed.hint1', o), Q(k, 'longerThanBed.hint2', o)],
      explain: Q(k, 'longerThanBed.explain', o),
    };
  },
};
