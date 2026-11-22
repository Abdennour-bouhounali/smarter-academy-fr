import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useDragInteraction from '../useDragInteraction';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import MovablePanel from '../primitives/MovablePanel';
import MathText from '../../components/MathText';
import { vectorArrow } from '../../components/geoFigure';
import * as L from '../logic/vectorSum';

/**
 * vector-sum — DEUX MOUVEMENTS, UN SEUL (unité 11 « الأشعة والانسحاب », leçon « مجموع شعاعين », manuel pp. 127–135).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. مبتدئ : l'élève PORTE la flèche d'un second trajet de trottinette (une carte de l'appli) et pose sa QUEUE sur une
 *    station de la carte d'Alger (glisser, toucher la carte puis la station, Entrée). متقدم : il TOURNE la flèche de la
 *    vitesse propre du nageur (glisser sa pointe, −/+, flèches) — le courant, lui, ne se règle pas.
 * B. Idée : deux déplacements successifs sont UN déplacement — le vecteur somme ; enchaînés bout à bout (علاقة شال
 *    AB + BC = AC), ou posés sur la même origine (قاعدة متوازي الأضلاع : la diagonale) ; AB + BA = 0.
 * C. La flèche BC se pose, la flèche AC (la somme) apparaît et la trottinette roule ; le nageur part le long de la
 *    diagonale s + c, et l'écart à B se lit sur la rive.
 * D. AB + BC = AC écrit sous les yeux, le compteur (chemin parcouru) contre la distance AC ; θ, la vitesse réelle et,
 *    à l'arrivée en B, sin θ = 2 ÷ 4 → 30°, |s + c| = 2√3 ≈ 3,46 km/h.
 * E. Avant la règle : un enchaînement qui TOURNE (AC < AB + BC) et le RETOUR (somme nulle) ; un départ manqué ET
 *    l'arrivée exacte en B.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        la somme de deux vecteurs est le vecteur de la translation résultant de deux translations successives
 *   OBJECT         مبتدئ : la flèche d'un trajet de trottinette ; متقدم : la flèche de la vitesse propre du nageur
 *   VARIABLE       مبتدئ : la station où se pose la QUEUE du second trajet (et lequel des trois trajets) ;
 *                  متقدم : la direction θ de la vitesse propre (degrés depuis (AB), vers l'amont), |s| = 4 fixe
 *   INVARIANT      AB fait, la trottinette en B ; le courant c (2 km/h) ; |s| = 4 ; la somme ne dépend que des vecteurs
 *   TRANSFORMATION la somme AC (ou s + c) apparaît et suit ; le point d'arrivée glisse le long de la rive
 *   CONSTRAINT     un second trajet ne part que de la FIN du premier ; la vitesse propre garde sa longueur
 *   RESISTANCE     queue en A refusée (« même origine : ce n'est pas un enchaînement »), ailleurs refusée (« la
 *                  trottinette est en B, elle ne saute pas ») ; le nageur emporté vers l'aval : refusé, l'écart écrit
 *                  en mètres (vectors.crossingSide décide, exact à 30°)
 *   EVIDENCE       la flèche AC qui ferme le triangle ; le point A retrouvé (vecteur nul) ; la diagonale sur (AB)
 *   CONTRAST       virage (AC ≈ 5,66 < AB + BC ≈ 6,32) / même direction (les longueurs s'ajoutent) / retour (0) ;
 *                  droit sur B (30 m en aval) / trop vers l'amont / exactement 30°
 *   PREDICTION     « où pose-t-on le second trajet ? », « faut-il viser B ? » — l'élève essaie avant la règle
 *   DISCOVERY      « AB + BC = AC : de l'origine du premier à la fin du second » ; « la vitesse réelle est la
 *                  diagonale du parallélogramme construit sur s et c »
 *   FORMALIZATION  AB + BC = AC (علاقة شال), AB + BA = 0, s + c = AD (ABDC parallélogramme), sin θ = 2/4 → 30°
 *   TRANSFER       معارف 4–6, طرائق p. 133, exercices 10–16, la synthèse (le passage piéton)
 *
 * Mondes (`theme`) : `scooter` (مبتدئ) — une trottinette électrique louée dans Alger, la baie et un ferry du port ; `swim` (متقدم, le تحدّ) — un nageur traverse l'oued, un drone le filme. Manuel (§6bis) : chaque pose / chaque
 * départ est un essai jugé ; chasles : aucune auto-complétion (porter une carte) ; nageur : « جرّب كل الإمكانيات » (la graduation de 5°, un départ par pas).
 *
 * DÉCOR (exigence du propriétaire) : les mouettes de la baie s'envolent au toucher, la trottinette sonne, un ferry ; le drone
 * fait un tour, le poisson saute, les copains filment sur la rive. `aria-hidden`, hors clavier, `[data-deco]`, jamais
 * une information (aucune longueur, aucun angle), immobiles sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (§8bis) : la scène est budgétée sur l'écran de leçon (`useLessonViewport` moins ce que le bloc
 * mesuré `[data-vs-glance]` occupe en plus du dessin). مبتدئ : la carte est un bloc presque carré (8 × 7 rues), les
 * cartes de trajet À CÔTÉ (≥ 600 px, avec l'écran de l'appli : égalité et compteurs) ou juste dessous ; la ligne de
 * lecture sous le tout (rien ne flotte SUR la carte : elle est pleine de stations). متقدم : la poignée est la pointe de la flèche, −/+ et la ligne de lecture juste dessous, les
 * vitesses dans un `MovablePanel` (sous 380 px : une ligne sous les commandes, la montre cacherait la poignée). Les essais sont dans un `LabFold` SOUS le bloc mesuré.
 *
 * Props : `mode` ('chasles' | 'parallelogram'), `A`, `u`, `legs`, `decoys` (chasles), `swim`, `current`, `width`
 * (parallelogram) — à plat ou groupés dans `numbers` ; `theme`, `title`, `lead`, `mission`, `level`, `levels`,
 * `onTrial(evidence)` à chaque essai, `onFinished({ mode, … })` à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-vector-sum][data-mode][data-world][data-solved], [data-vs-glance], chasles :
 * [data-vs-card=<i>][data-vs-placed], [data-vs-station=<id>], [data-vs-sum=<kind>], [data-vs-panel] ; parallelogram :
 * [data-vs-handle] (role=slider), [data-vs-less|more], [data-vs-theta], [data-vs-landing=<side>], [data-vs-speed] ;
 * [data-vs-verdict=<kind>], [data-lab-fold=vector-sum.trials], [data-deco].
 */
const NUMBER_KEYS = ['mode', 'A', 'u', 'legs', 'decoys', 'swim', 'current', 'width'];
const TP = { style: { direction: 'ltr', unicodeBidi: 'isolate' }, fontFamily: 'ui-monospace, monospace' };
const COLORS = { first: '#4F46E5', second: '#D97706', sum: '#059669', swim: '#2563EB', current: '#DC2626' };
/** Un nombre à virgule écrit DANS un îlot KaTeX : la virgule décimale du manuel est `{,}`. */
const tx = (s) => String(s).replace(',', '{,}');
const btn = 'inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2';

export default function VectorSum(props) {
  const { numbers: grouped, theme: theme0, title, lead, mission, level, levels: withLevels = true, checkpoints = true,
    initialMode = 'student', allowModeSwitch = false, onTrial, onFinished } = props;
  const authored = useMemo(() => {
    const out = {};
    for (const key of NUMBER_KEYS) {
      const v = grouped?.[key] ?? props[key];
      if (v != null) out[key] = v;
    }
    if (!out.mode) out.mode = 'chasles';
    return out;
  }, [grouped, props]); // eslint-disable-line react-hooks/exhaustive-deps
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.vectorSum.${key}`, o), [t]);
  const state = useManipulation({ type: 'vector-sum', initialNumbers: authored, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const mode = nums.mode === 'parallelogram' ? 'parallelogram' : 'chasles';
  const theme = theme0 ?? (mode === 'parallelogram' ? 'swim' : 'scooter');
  const m = useCallback((key, o) => k(`${mode}.${key}`, o), [k, mode]);
  const numKey = JSON.stringify(NUMBER_KEYS.map((x) => nums[x] ?? null));
  const make = () => L.init(nums);
  const [lab, setLab] = useState(make);
  const sceneKey = `${numKey}|${state.epoch}`;
  const [scene, setScene] = useState(sceneKey);
  if (scene !== sceneKey) { setScene(sceneKey); setLab(make()); }

  // Miroir synchrone de `lab` : « جرّب كل الإمكانيات » enchaîne des pas plus vite qu'un rendu.
  const labRef = useRef(lab);
  labRef.current = lab;
  const swimAuto = mode === 'parallelogram' ? {
    label: t('manipulation.autoComplete.tryAll'),
    ready: true,
    remaining: L.untriedThetas(lab).length,
    intervalMs: 480,
    maxTicks: 80,
    step: () => {
      const next = L.untriedThetas(labRef.current)[0];
      if (next === undefined) return;
      labRef.current = L.launch(labRef.current, next);
      setLab((s) => L.launch(s, next));
    },
    finish: () => {
      const todo = L.untriedThetas(labRef.current);
      if (todo.length === 0) return;
      labRef.current = todo.reduce((acc, v) => L.launch(acc, v), labRef.current);
      setLab((s) => todo.reduce((acc, v) => L.launch(acc, v), s));
    },
  } : null;

  // les questions pendant le labo (obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte) : la règle vient de la dernière suite
  const cpSettings = useLabCheckpointSettings('vector-sum');
  const cpActive = checkpoints && cpSettings.enabled;
  const ready = L.discoveryReady(lab) && !cpActive;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!state.isFormal) return;
    state.report(onFinished, mode === 'parallelogram' ? { mode, angle: lab.crossing.angle, speed: L.crossingResult(lab).speedText } : { mode, chains: lab.trials.length });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const nEvents = lab.trials.length + (lab.refusals?.length ?? 0);
  useEffect(() => { if (nEvents > 0) { const e = L.evidenceOf(lab); if (e) state.report(onTrial, e); } }, [nEvents]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la découverte : des distracteurs réfutés par les essais de l'élève ── */
  const discoveryOptions = useMemo(() => {
    if (mode === 'parallelogram') {
      const miss = lab.trials.find((tr) => tr.side === 'downstream');
      return [
        { text: <MathText>{m('dOptStraight')}</MathText>, why: <MathText>{miss ? m('dWhyStraight', { theta: miss.theta, drift: miss.driftText }) : m('dWhyStraightNone')}</MathText> },
        { text: <MathText>{m('dOptRight')}</MathText>, correct: true },
        { text: <MathText>{m('dOptAdd')}</MathText>, why: <MathText>{m('dWhyAdd', { speed: tx(L.crossingResult(lab).speedText) })}</MathText> },
      ];
    }
    const turn = lab.trials.find((tr) => tr.kind === 'turn');
    const ev = turn ? L.evidenceOf({ ...lab, last: { kind: 'chain', chain: turn } }) : null;
    return [
      { text: <MathText>{m('dOptReverse')}</MathText>, why: <MathText>{m('dWhyReverse')}</MathText> },
      { text: <MathText>{m('dOptLengths')}</MathText>, why: <MathText>{ev ? m('dWhyLengths', { path: tx(ev.path), straight: tx(ev.straight) }) : m('dWhyLengthsNone')}</MathText> },
      { text: <MathText>{m('dOptRight')}</MathText>, correct: true },
    ];
  }, [lab, m, mode]);

  const formal = mode === 'parallelogram' ? (
    <div className="space-y-2" data-vs-formal>
      <EquationDisplay tone="result" tex={'\\vec{s} + \\vec{c} = \\overrightarrow{AD}'} note={m('fNote')} />
      <EquationDisplay tone="result" tex={`\\sin\\theta = ${L.crossingResult(lab).sinTex} = \\dfrac{1}{2} \\;\\Rightarrow\\; \\theta = ${lab.crossing.angle ?? '?'}^{\\circ}`} />
      <EquationDisplay tone="result" tex={`AD = \\sqrt{${lab.swim}^2 - ${lab.current}^2} = ${L.crossingResult(lab).speedTex} \\approx ${L.crossingResult(lab).speedText.replace(',', '{,}')}\\,\\mathrm{km/h}`} />
      <p className="text-sm text-emerald-900"><MathText>{m('fRule')}</MathText></p>
    </div>
  ) : (
    <div className="space-y-2" data-vs-formal>
      <EquationDisplay tone="result" tex={'\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}'} note={m('fNote')} />
      <EquationDisplay tone="result" tex={'\\overrightarrow{AB} + \\overrightarrow{BA} = \\overrightarrow{AA} = \\vec{0}'} />
      <p className="text-sm text-emerald-900"><MathText>{m('fRule')}</MathText></p>
    </div>
  );

  /* ── les étapes : deux contrastes (chasles : un virage puis le retour · nageur : l'arrivée puis un départ manqué) ── */
  const KINDS = L.STEP_KINDS[mode];
  const [answered, setAnswered] = useState({ epoch: state.epoch, ids: {} });
  const ans = answered.epoch === state.epoch ? answered.ids : {};
  const reachedK = L.reachedKinds(lab);
  const pending = KINDS.filter((kd) => reachedK.includes(kd) && !ans[kd]);
  const stepId = pending[0] ?? null;
  const withRule = pending.length === 1 && reachedK.length === KINDS.length;
  const chain = cpActive && stepId ? chainOf(lab, stepId, withRule) : null;
  const cp = useLabCheckpoint({
    id: chain ? stepId : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, k, { options: discoveryOptions, formal, m })) : null,
    reached: !!stepId,
    resetKey: state.epoch,
    onRetry: () => setLab((x) => L.restartStep(x, stepId)),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setAnswered((a) => ({ epoch: state.epoch, ids: { ...(a.epoch === state.epoch ? a.ids : {}), [id]: true } }));
      if (chain.includes('rule')) { state.discover(); state.formalize(); }
    },
  });
  const stepDone = KINDS.map((kd) => reachedK.includes(kd) && (!cpActive || !!ans[kd]));
  const stepper = <LabStepper count={KINDS.length} current={stepDone.every(Boolean) ? KINDS.length - 1 : stepDone.findIndex((d) => !d)} done={stepDone} stepAttr="data-vs-step" />;
  const party = useStepCelebration();
  const celebrated = useRef({ epoch: state.epoch, set: new Set() });
  if (celebrated.current.epoch !== state.epoch) celebrated.current = { epoch: state.epoch, set: new Set() };
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.set.has(i)) return;
      celebrated.current.set.add(i);
      party.celebrate({ n: i + 1, total: KINDS.length });
    });
  }, [stepDone.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son : un déclic par essai accepté, « over » pour un refus ou un départ manqué, le drapeau quand une étape est faite
  const doneN = stepDone.filter(Boolean).length;
  const sfx = useRef({ n: nEvents, d: doneN, epoch: state.epoch });
  useEffect(() => {
    const p = sfx.current;
    if (p.epoch !== state.epoch) { sfx.current = { n: nEvents, d: doneN, epoch: state.epoch }; return; }
    if (nEvents > p.n) {
      const lt = lab.last;
      playSfx(lt?.kind === 'refusal' || (lt?.trial && lt.trial.side !== 'target') ? 'over' : 'tooth');
    }
    if (doneN > p.d) playSfx('flag');
    sfx.current = { n: nEvents, d: doneN, epoch: state.epoch };
  }, [nEvents, doneN, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  const lay = { stepper, party: party.node, cp: cp.node, open: cp.open };

  return (
    <ManipulationShell
      type="vector-sum"
      title={title ?? m('title')}
      mission={mission ?? <MathText>{m('mission', mode === 'parallelogram' ? { swim: lab.swim, current: lab.current } : {})}</MathText>}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided={cpActive}
      hints={['hint1', 'hint2', 'hint3'].map((hk) => <MathText key={hk}>{m(hk)}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false, ...(swimAuto ? { autoComplete: swimAuto } : {}) }}
      discovery={<ManipulationDiscovery state={state} prompt={m('dPrompt')} options={discoveryOptions} formal={formal} />}
      explanation={<MathText>{m('explanation')}</MathText>}
    >
      <ManipulationStage className={mode === 'parallelogram' ? 'bg-gradient-to-b from-sky-50/70 to-white' : 'bg-gradient-to-b from-amber-50/60 to-white'} minHeight="min-h-[150px]">
        {mode === 'parallelogram'
          ? <SwimLab lab={lab} setLab={setLab} m={m} k={k} theme={theme} solved={L.discoveryReady(lab)} lay={lay} />
          : <ChaslesLab lab={lab} setLab={setLab} m={m} k={k} theme={theme} solved={L.discoveryReady(lab)} lay={lay} />}
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ── la mesure commune : largeur du bloc ; hauteur = écran de leçon − ce que le bloc glance prend en plus du dessin ── */
function useBudget(min, max) {
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const drawnH = useRef(260);
  const [width, setWidth] = useState(320);
  const [overhead, setOverhead] = useState(190);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(200, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(110, Math.ceil(glanceRef.current.getBoundingClientRect().height) - drawnH.current));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (glanceRef.current) ro.observe(glanceRef.current);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 640;
  const budget = Math.round(Math.max(min, Math.min(max, screenH - overhead - 24)));
  return { boxRef, glanceRef, drawnH, width, budget };
}

/** Une flèche de vecteur (le trait s'arrête au pied de la pointe — geoFigure.vectorArrow, la même que GeoFigure). */
function Arrow({ a, b, color, width = 3, dashed = false, head = 11, opacity = 1, data }) {
  if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 4) return null;
  const ar = vectorArrow(a, b, head);
  return (
    <g opacity={opacity} {...data}>
      <line x1={ar.shaft[0][0]} y1={ar.shaft[0][1]} x2={ar.shaft[1][0]} y2={ar.shaft[1][1]} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? '7 5' : undefined} />
      <polygon points={ar.head.map((p) => p.join(',')).join(' ')} fill={color} />
    </g>
  );
}

/** Le nom d'un vecteur, surmonté de sa petite flèche (le \vec du manuel), en LTR. */
function VecName({ x, y, name, color, size = 13 }) {
  const w = Math.max(10, name.length * size * 0.62);
  return (
    <g aria-hidden="true">
      <text x={x} y={y} fontSize={size} fontWeight={800} fill={color} textAnchor="middle" {...TP}>{name}</text>
      <line x1={x - w / 2} y1={y - size - 1} x2={x + w / 2} y2={y - size - 1} stroke={color} strokeWidth={1.3} />
      <polyline points={`${x + w / 2 - 4},${y - size - 4} ${x + w / 2},${y - size - 1} ${x + w / 2 - 4},${y - size + 2}`} fill="none" stroke={color} strokeWidth={1.3} />
    </g>
  );
}

/** Le milieu d'une flèche, décalé sur sa gauche (côté « extérieur ») pour y poser son nom. */
function nameAt(a, b, off = 14) {
  const dx = b[0] - a[0]; const dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1;
  return [(a[0] + b[0]) / 2 + (dy / l) * off, (a[1] + b[1]) / 2 - (dx / l) * off + 5];
}

/* ════════════════════════════ مبتدئ — la trottinette (علاقة شال) ════════════════════════════ */

function ChaslesLab({ lab, setLab, m, k, theme, solved, lay }) {
  const reduce = useReducedMotion();
  const { boxRef, glanceRef, drawnH, width, budget } = useBudget(190, 430);
  const wide = width >= 600;
  const narrow = width < 380;
  const dockW = wide ? 200 : 0;
  const mapW = Math.max(190, Math.min(width - dockW - (wide ? 12 : 0), wide ? 560 : width));
  const G = L.mapLayout(lab, { width: mapW, height: budget });
  const svgW = Math.round(G.width); const svgH = Math.round(G.height);
  drawnH.current = svgH;
  const sceneRef = useRef(null);
  const legOf = (src) => Number(String(src).replace('leg-', ''));

  const drag = useDragInteraction({
    accepts: (src, zone) => L.canAttach(lab, legOf(src), zone),
    onDrop: (src, zone) => setLab((s) => L.attach(s, legOf(src), zone)),
    onReject: (src, zone) => setLab((s) => L.refuse(s, legOf(src), zone)),
  });

  const P = (p) => { const [x, y] = V.coords(p); return [G.X(x), G.Y(y)]; };
  const stationPx = Object.fromEntries(lab.stations.map((st) => [st.id, P(st.p)]));
  const vecPx = (v) => { const [x, y] = V.coords(v); return [x * G.k, -y * G.k]; };
  const chain = lab.placed;
  const scooterAt = chain ? P(chain.C) : stationPx.B;

  /* la flèche portée suit le doigt (sa QUEUE sous le doigt), ou s'aimante sur la station visée */
  let ghost = null;
  if (drag.held != null) {
    const v = vecPx(lab.legs[legOf(drag.held)]);
    let tail = null;
    if (drag.hoverZone?.id) tail = stationPx[drag.hoverZone.id];
    else if (drag.dragging && drag.ghost && sceneRef.current) {
      const r = sceneRef.current.getBoundingClientRect();
      tail = [(drag.ghost.x - r.left) * (svgW / r.width), (drag.ghost.y - r.top) * (svgH / r.height)];
    }
    if (tail) ghost = { tail, head: [tail[0] + v[0], tail[1] + v[1]], valid: drag.hoverZone ? drag.hoverZone.valid : null };
  }

  const last = lab.last;
  const verdictKind = drag.held != null && last?.kind !== 'refusal' ? 'held' : last?.kind === 'refusal' ? last.refusal.reason : last?.kind === 'chain' ? last.chain.kind : 'start';
  const ev = chain ? L.evidenceOf({ ...lab, last: { kind: 'chain', chain } }) : null;
  const verdict = (() => {
    switch (verdictKind) {
      case 'held': return <span className="text-amber-900">{m('vHeld')}</span>;
      case 'origin': return <span className="text-rose-800"><MathText>{m('vOrigin')}</MathText></span>;
      case 'gap': return <span className="text-rose-800"><MathText>{m('vGap', { at: last.refusal.at })}</MathText></span>;
      case 'turn': return <span className="text-emerald-800"><MathText>{m('vTurn', { path: tx(ev.path), straight: tx(ev.straight) })}</MathText></span>;
      case 'line': return <span className="text-emerald-800"><MathText>{m('vLine', { path: tx(ev.path) })}</MathText></span>;
      case 'zero': return <span className="text-emerald-800"><MathText>{m('vZero', { path: tx(ev.path) })}</MathText></span>;
      default: return <span className="text-slate-700"><MathText>{m('vStart')}</MathText></span>;
    }
  })();

  const xs = []; for (let x = Math.ceil(G.x0); x <= G.x1; x += 1) xs.push(x);
  const ys = []; for (let y = Math.ceil(G.y0); y <= G.y1; y += 1) ys.push(y);
  const A = stationPx.A; const B = stationPx.B;
  const C = chain ? P(chain.C) : null;
  const zero = chain?.kind === 'zero';
  const secondName = zero ? 'BA' : 'BC';

  const zoneClass = (id) => {
    const hz = drag.hoverZone;
    if (hz?.id === id) return hz.valid ? 'border-emerald-600 bg-emerald-100/70 ring-4 ring-emerald-300' : 'border-rose-500 bg-rose-100/70 ring-4 ring-rose-200';
    if (drag.held != null) return 'border-amber-500 bg-amber-50/40 border-dashed';
    return 'border-transparent bg-transparent';
  };

  const cards = lab.legs.map((v, i) => {
    const [dx, dy] = V.coords(v);
    const s = 9; const W = 4 * s * 2; const H = 4 * s * 2;
    const a = [W / 2 - (dx * s) / 2, H / 2 + (dy * s) / 2]; const b = [a[0] + dx * s, a[1] - dy * s];
    const placedHere = chain?.leg === i;
    return (
      <button key={i} type="button" {...drag.sourceProps(`leg-${i}`)}
        aria-label={m('cardLabel', { n: i + 1 })} data-vs-card={i} data-vs-placed={placedHere ? 'true' : 'false'}
        className={`relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center rounded-xl border-2 bg-white px-1 py-0.5 outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${
          drag.held === `leg-${i}` ? 'border-amber-600 ring-2 ring-amber-300' : placedHere ? 'border-emerald-500' : 'border-slate-300'} ${drag.rejected === `leg-${i}` && !reduce ? 'animate-pulse' : ''}`}>
        <svg width={narrow ? 46 : 58} height={narrow ? 46 : 58} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" style={{ direction: 'ltr' }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
            <g key={g}><line x1={g * s} x2={g * s} y1={0} y2={H} stroke="#E2E8F0" strokeWidth={0.8} /><line x1={0} x2={W} y1={g * s} y2={g * s} stroke="#E2E8F0" strokeWidth={0.8} /></g>
          ))}
          <Arrow a={a} b={b} color={COLORS.second} width={3} head={8} />
          <circle cx={a[0]} cy={a[1]} r={3.2} fill="#FFFFFF" stroke={COLORS.second} strokeWidth={1.6} />
        </svg>
        <span className="text-[11px] font-bold leading-tight text-slate-700">{m('cardShort', { n: i + 1 })}</span>
        {placedHere && <span className="absolute -top-1.5 -start-1.5 h-3 w-3 rounded-full bg-emerald-500" aria-hidden="true" />}
      </button>
    );
  });

  const panel = (
    <div className="rounded-2xl border-[3px] border-slate-800 bg-slate-900 px-2 py-1.5 text-xs text-white shadow-lg" data-vs-panel aria-label={m('panelTitle')}>
      <div className="mx-auto mb-1 h-1 w-8 rounded-full bg-slate-600" aria-hidden="true" />
      <div>
        <p className="font-bold text-amber-300">{m('panelHead')}</p>
        {chain ? (
          <div className="space-y-0.5">
            <div dir="ltr" className="text-center"><MathText>{`$\\overrightarrow{AB} + \\overrightarrow{${secondName}} = ${zero ? '\\vec{0}' : '\\overrightarrow{AC}'}$`}</MathText></div>
            <p>{m('panelPath')} <bdi dir="ltr" className="font-mono font-bold">{ev.path}</bdi></p>
            <p>{m('panelStraight')} <bdi dir="ltr" className="font-mono font-bold">{ev.straight}</bdi></p>
          </div>
        ) : <p className="text-slate-300">{m('panelEmpty')}</p>}
      </div>
    </div>
  );

  return (
    <div ref={boxRef} className={`relative space-y-2 ${lay.open ? 'min-h-[620px]' : ''}`} data-vector-sum data-mode="chasles" data-world={theme} data-solved={solved ? 'true' : 'false'} data-scene-h={svgH}>
      {lay.party}{lay.cp}
      <div ref={glanceRef} className="space-y-1.5" data-vs-glance>
      {lay.stepper}
      <div className={`gap-3 ${wide ? 'flex items-start justify-center' : 'space-y-1.5'}`}>
        <div className="space-y-1.5">
          <div ref={sceneRef} className="relative mx-auto overflow-hidden rounded-xl border border-slate-200" style={{ width: svgW, height: svgH }}>
            <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="absolute inset-0" style={{ direction: 'ltr' }}
              role="img" aria-label={m('sceneLabel', { state: chain ? m(`scene_${chain.kind}`) : m('scene_start') })}>
              <rect x={0} y={0} width={svgW} height={svgH} fill="#F8FAFC" />
              <CityDeco G={G} svgW={svgW} />
              {/* les rues : le quadrillage du manuel, aux nœuds entiers */}
              {xs.map((x) => <line key={`x${x}`} x1={G.X(x)} x2={G.X(x)} y1={G.Y(G.y1)} y2={G.Y(G.y0)} stroke="#CBD5E1" strokeWidth={x % 2 === 0 ? 1.6 : 0.9} />)}
              {ys.map((y) => <line key={`y${y}`} y1={G.Y(y)} y2={G.Y(y)} x1={G.X(G.x0)} x2={G.X(G.x1)} stroke="#CBD5E1" strokeWidth={y % 2 === 0 ? 1.6 : 0.9} />)}
              {/* le premier trajet, fait */}
              <Arrow a={A} b={B} color={COLORS.first} width={4} data={{ 'data-vs-first': '' }} />
              <VecName {...xy(nameAt(A, B))} name="AB" color={COLORS.first} />
              {/* le second trajet, posé, et la SOMME */}
              {chain && !zero && <Arrow a={B} b={C} color={COLORS.second} width={4} data={{ 'data-vs-second': '' }} />}
              {chain && zero && <Arrow a={shift(B, A, 7)} b={shift(A, B, -7)} color={COLORS.second} width={4} data={{ 'data-vs-second': '' }} opacity={0.9} />}
              {chain && <VecName {...xy(nameAt(B, C))} name={secondName} color={COLORS.second} />}
              {chain && !zero && (
                <g data-vs-sum={chain.kind}>
                  <Arrow a={A} b={C} color={COLORS.sum} width={5} head={13} />
                  <VecName {...xy(nameAt(A, C, -16))} name="AC" color={COLORS.sum} size={14} />
                </g>
              )}
              {zero && (
                <g data-vs-sum="zero">
                  <circle cx={A[0]} cy={A[1]} r={14} fill="none" stroke={COLORS.sum} strokeWidth={3} strokeDasharray="4 3" />
                  <VecName x={A[0] - 26} y={A[1] + 30} name="0" color={COLORS.sum} size={15} />
                </g>
              )}
              {/* la flèche portée (fantôme) */}
              {ghost && (
                <g data-vs-ghost>
                  <Arrow a={ghost.tail} b={ghost.head} color={ghost.valid === false ? '#E11D48' : COLORS.second} width={3.5} dashed opacity={0.85} />
                  <circle cx={ghost.tail[0]} cy={ghost.tail[1]} r={5} fill="#FFFFFF" stroke={ghost.valid === false ? '#E11D48' : COLORS.second} strokeWidth={2} />
                </g>
              )}
              {/* les stations */}
              {lab.stations.map((st) => {
                const [x, y] = stationPx[st.id];
                return (
                  <g key={st.id}>
                    <circle cx={x} cy={y} r={6} fill={st.role === 'other' ? '#94A3B8' : '#0F172A'} stroke="#FFFFFF" strokeWidth={2} />
                    <text x={x - 9} y={y - 9} textAnchor="end" fontSize={13} fontWeight={800} fill="#0F172A" {...TP}>{st.id}</text>
                  </g>
                );
              })}
              {chain && !zero && (
                <g>
                  <circle cx={C[0]} cy={C[1]} r={6} fill={COLORS.sum} stroke="#FFFFFF" strokeWidth={2} />
                  <text x={C[0] + 9} y={C[1] - 8} fontSize={13} fontWeight={800} fill="#065F46" {...TP}>C</text>
                </g>
              )}
              <Scooter x={scooterAt[0]} y={scooterAt[1]} size={Math.max(16, Math.min(28, G.k * 0.55))} reduce={reduce} />
            </svg>
            {/* les zones de pose : une par station (≥ 44 px), au-dessus du dessin */}
            {lab.stations.map((st) => {
              const [x, y] = stationPx[st.id];
              return (
                <div key={st.id} role="button" tabIndex={0} {...drag.zoneProps(st.id)} data-vs-station={st.id}
                  aria-label={m('stationLabel', { name: st.id })}
                  className={`absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${zoneClass(st.id)}`}
                  style={{ left: x, top: y }} />
              );
            })}
          </div>
        </div>
        <div className={wide ? 'w-[200px] space-y-2' : 'space-y-1.5'}>
          <p className="text-xs font-bold text-slate-600">{m('dockTitle')}</p>
          <div className={`grid grid-cols-3 gap-1.5 ${wide ? '' : 'mx-auto max-w-[17rem]'}`} data-vs-dock>{cards}</div>
          {wide && panel}
        </div>
      </div>
      <p role="status" className={`min-h-[2.5rem] ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug`} data-vs-verdict={verdictKind}>{verdict}</p>
      </div>

      {(lab.trials.length > 0 || lab.refusals.length > 0) && (
        <LabFold id="vector-sum.trials" title={k('trialsTitle')}>
          <ul className="space-y-0.5 text-xs" data-vs-trials={lab.trials.length}>
            {lab.trials.map((tr, i) => {
              const e = L.evidenceOf({ ...lab, last: { kind: 'chain', chain: tr } });
              return <li key={`t${i}`} className="text-emerald-800"><MathText>{m(`trial_${tr.kind}`, { n: tr.leg + 1, path: tx(e.path), straight: tx(e.straight) })}</MathText></li>;
            })}
            {lab.refusals.map((r, i) => <li key={`r${i}`} className="text-rose-800"><MathText>{m(`trial_${r.reason}`, { n: r.leg + 1, at: r.at })}</MathText></li>)}
          </ul>
        </LabFold>
      )}
    </div>
  );
}

const xy = ([x, y]) => ({ x, y });
/** `p` décalé de `d` px perpendiculairement à (p, q) : le retour BA se dessine à côté de AB, pas dessus. */
const shift = (p, q, d) => { const dx = q[0] - p[0]; const dy = q[1] - p[1]; const l = Math.hypot(dx, dy) || 1; return [p[0] - (dy / l) * d, p[1] + (dx / l) * d]; };

/** La trottinette électrique (décor qui porte une information : elle est là où l'on est arrivé). */
function Scooter({ x, y, size, reduce }) {
  const [ring, setRing] = useState(0);
  const s = size;
  return (
    <g data-vs-scooter style={{ transform: `translate(${x}px, ${y}px)`, transition: reduce ? 'none' : 'transform 1.1s ease-in-out' }}>
      <g transform={`translate(${s * 0.15}, ${-s * 0.95})`} onClick={() => setRing((n) => n + 1)} style={{ cursor: 'pointer' }} aria-hidden="true" data-deco="scooter">
        <rect x={0} y={s * 0.62} width={s * 0.9} height={s * 0.12} rx={s * 0.06} fill="#0F172A" />
        <line x1={s * 0.78} y1={s * 0.66} x2={s * 0.86} y2={0} stroke="#0F172A" strokeWidth={2.2} strokeLinecap="round" />
        <line x1={s * 0.72} y1={0} x2={s * 1.0} y2={0} stroke="#0F172A" strokeWidth={2.2} strokeLinecap="round" />
        <circle cx={s * 0.12} cy={s * 0.82} r={s * 0.14} fill="#22C55E" stroke="#0F172A" strokeWidth={1.4} />
        <circle cx={s * 0.82} cy={s * 0.82} r={s * 0.14} fill="#22C55E" stroke="#0F172A" strokeWidth={1.4} />
        {ring % 2 === 1 && <text x={s * 1.05} y={-2} fontSize={s * 0.5} fill="#F59E0B">♪</text>}
      </g>
    </g>
  );
}

/** La baie d'Alger, un ferry, des mouettes qui s'envolent : décor pur. */
function CityDeco({ G, svgW }) {
  const reduce = useReducedMotion();
  const [flown, setFlown] = useState(0);
  const seaH = Math.max(10, (G.Y(G.y1 - 0.45) - G.Y(G.y1)) + 4);
  const mx = svgW - G.k * 0.9;
  return (
    <g data-deco="scooter">
      <style>{'.vs-fly{transition:transform 1s ease-out}@media (prefers-reduced-motion: reduce){.vs-fly{transition:none}}'}</style>
      <rect x={0} y={0} width={svgW} height={seaH} fill="#BAE6FD" aria-hidden="true" />
      <path d={`M0 ${seaH} Q ${svgW / 4} ${seaH - 4} ${svgW / 2} ${seaH} T ${svgW} ${seaH}`} fill="none" stroke="#7DD3FC" strokeWidth={2} aria-hidden="true" />
      {/* un ferry du port d'Alger sur la baie */}
      <g aria-hidden="true" transform={`translate(${mx - 22}, ${Math.max(2, seaH - 13)})`}>
        <path d="M0 6 L34 6 L30 12 L4 12 Z" fill="#F8FAFC" stroke="#475569" strokeWidth={0.9} />
        <rect x={8} y={1} width={14} height={5} fill="#E2E8F0" stroke="#475569" strokeWidth={0.8} />
        <rect x={16} y={-3} width={4} height={4} fill="#E11D48" />
      </g>
      <g className={reduce ? undefined : 'vs-fly'} style={{ transform: flown % 2 ? 'translate(18px, -10px)' : 'none', cursor: 'pointer' }}
        onClick={() => setFlown((n) => n + 1)} aria-hidden="true" tabIndex={-1}>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${svgW * 0.18 + i * 16} ${seaH * 0.55 + (i % 2) * 4} q4 -5 8 0 q4 -5 8 0`} fill="none" stroke="#475569" strokeWidth={1.5} />
        ))}
      </g>
    </g>
  );
}

/* ════════════════════════════ متقدم — le nageur (قاعدة متوازي الأضلاع, le تحدّ) ════════════════════════════ */

function SwimLab({ lab, setLab, m, k, theme, solved, lay }) {
  const reduce = useReducedMotion();
  const { boxRef, glanceRef, drawnH, width, budget } = useBudget(200, 380);
  const narrow = width < 380;
  const svgW = Math.min(width, 640);
  const svgH = Math.max(200, Math.min(budget, Math.round(svgW * (narrow ? 1.05 : 0.75))));
  drawnH.current = svgH;
  const sceneRef = useRef(null);
  const [liveT, setLiveT] = useState(null);
  const theta = liveT ?? lab.theta;

  /* la géométrie du dessin : deux rives, A sur la rive basse, B juste en face ; l'eau coule de gauche à droite */
  const bank = Math.max(26, Math.round(svgH * 0.14));
  const yA = svgH - bank; const yB = bank;
  const river = yA - yB;
  const xA = Math.round(svgW * (narrow ? 0.6 : 0.58));
  const unit = Math.min(river * 0.16, (svgW * 0.36) / lab.swim);       // px par km/h
  const toPx = (v) => [xA + v.x * unit, yA - v.y * unit];
  const vel = L.velocities(lab, theta);
  const S = toPx(vel.s); const Cc = toPx(vel.c); const D = toPx(vel.r);
  const reach = (v) => { const tt = river / (v.y * unit); return [xA + v.x * unit * tt, yB]; };
  const landing = reach(vel.r);
  const landX = Math.max(10, Math.min(svgW - 10, landing[0]));
  const R = Math.round(lab.swim * unit * 1.3);

  const st = useStretchInteraction({
    value: theta, range: { min: lab.thetaMin, max: lab.thetaMax }, direction: 'rtl', pageStep: 5,
    toValue: (cx, cy, rect) => {
      const ax = rect.left + rect.width / 2; const ay = rect.bottom;
      return (Math.atan2(-(cx - ax), Math.max(1, ay - cy)) * 180) / Math.PI;
    },
    onChange: (v) => setLiveT(v),
    onCommit: (v) => { setLiveT(null); setLab((s) => L.launch(s, v)); },
  });

  const last = lab.last?.trial;
  const verdictKind = liveT != null ? 'live' : last ? last.side : 'start';
  const res = L.crossingResult(lab);
  const verdict = (() => {
    switch (verdictKind) {
      case 'live': return <span className="text-slate-700"><MathText>{m('vLive', { theta, speed: L.velocities(lab, theta).speed.toFixed(2).replace('.', '{,}') })}</MathText></span>;
      case 'downstream': return <span className="text-rose-800"><MathText>{m('vDown', { theta: last.theta, drift: last.driftText })}</MathText></span>;
      case 'upstream': return <span className="text-amber-800"><MathText>{m('vUp', { theta: last.theta, drift: last.driftText })}</MathText></span>;
      case 'target': return <span className="text-emerald-800"><MathText>{m('vTarget', { theta: last.theta, speedTex: res.speedTex, speed: res.speedText.replace(',', '{,}') })}</MathText></span>;
      default: return <span className="text-slate-700"><MathText>{m('vStart', { swim: lab.swim, current: lab.current })}</MathText></span>;
    }
  })();

  /* le nageur : en A tant qu'aucun départ ; après un départ, au point d'arrivée de CE départ */
  const lastLand = last ? reach(L.velocities(lab, last.theta).r) : [xA, yA];
  const swimmer = [Math.max(10, Math.min(svgW - 10, lastLand[0])), last ? yB + 6 : yA - 6];
  const arcR = Math.min(44, unit * 1.6);
  const arcEnd = [xA - arcR * Math.sin((theta * Math.PI) / 180), yA - arcR * Math.cos((theta * Math.PI) / 180)];
  const speedLive = L.velocities(lab, theta).speed;

  return (
    <div ref={boxRef} className={`relative space-y-2 ${lay.open ? 'min-h-[620px]' : ''}`} data-vector-sum data-mode="parallelogram" data-world={theme} data-solved={solved ? 'true' : 'false'} data-scene-h={svgH}>
      {lay.party}{lay.cp}
      <div ref={glanceRef} className="space-y-1.5" data-vs-glance>
        {lay.stepper}
        <div ref={sceneRef} className="relative mx-auto overflow-hidden rounded-xl border border-slate-200" style={{ width: svgW, height: svgH }}>
          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="absolute inset-0" style={{ direction: 'ltr' }}
            role="img" aria-label={m('sceneLabel', { theta, swim: lab.swim, current: lab.current })}>
            <defs>
              <linearGradient id="vs-water" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#7DD3FC" /><stop offset="1" stopColor="#38BDF8" /></linearGradient>
            </defs>
            <rect x={0} y={0} width={svgW} height={yB} fill="#86EFAC" />
            <rect x={0} y={yB} width={svgW} height={river} fill="url(#vs-water)" />
            <rect x={0} y={yA} width={svgW} height={svgH - yA} fill="#86EFAC" />
            <RiverDeco svgW={svgW} yA={yA} yB={yB} reduce={reduce} />
            {/* (AB) : la traversée visée */}
            <line x1={xA} y1={yA} x2={xA} y2={yB} stroke="#0F172A" strokeWidth={1.2} strokeDasharray="3 4" opacity={0.6} />
            {/* le parallélogramme : copies en pointillés, diagonale = la somme */}
            <polygon points={[[xA, yA], Cc, D, S].map((p) => p.join(',')).join(' ')} fill="#10B981" opacity={0.1} />
            <Arrow a={S} b={D} color={COLORS.current} width={2} dashed opacity={0.7} head={8} />
            <Arrow a={Cc} b={D} color={COLORS.swim} width={2} dashed opacity={0.7} head={8} />
            <Arrow a={[xA, yA]} b={Cc} color={COLORS.current} width={3.5} data={{ 'data-vs-current': '' }} />
            <VecName {...xy(nameAt([xA, yA], Cc, -14))} name="c" color={COLORS.current} />
            <Arrow a={[xA, yA]} b={S} color={COLORS.swim} width={3.5} data={{ 'data-vs-swim': '' }} />
            <VecName {...xy(nameAt([xA, yA], S, 14))} name="s" color={COLORS.swim} />
            <Arrow a={[xA, yA]} b={D} color={COLORS.sum} width={4.5} head={12} data={{ 'data-vs-sum': 'live' }} />
            <text x={D[0] + 6} y={D[1] - 4} fontSize={13} fontWeight={800} fill="#065F46" {...TP}>D</text>
            {/* le chemin réel, prolongé jusqu'à l'autre rive, et le point d'arrivée */}
            <line x1={D[0]} y1={D[1]} x2={landing[0]} y2={landing[1]} stroke={COLORS.sum} strokeWidth={1.6} strokeDasharray="5 5" />
            <circle cx={landX} cy={yB} r={5} fill={Math.abs(landing[0] - xA) < 1 ? COLORS.sum : '#F59E0B'} stroke="#FFFFFF" strokeWidth={1.5} data-vs-landing={verdictKind === 'live' ? 'live' : verdictKind} />
            {/* l'angle θ entre (AB) et s */}
            {theta !== 0 && <path d={`M${xA} ${yA - arcR} A${arcR} ${arcR} 0 0 ${theta > 0 ? 0 : 1} ${arcEnd[0]} ${arcEnd[1]}`} fill="none" stroke="#1E3A8A" strokeWidth={1.5} />}
            <text x={xA - (arcR + 30) * Math.sin((theta * Math.PI) / 360)} y={yA - (arcR + 14) * Math.cos((theta * Math.PI) / 360)} textAnchor="middle" fontSize={12} fontWeight={800} fill="#1E3A8A" stroke="#E0F2FE" strokeWidth={3} paintOrder="stroke" {...TP} data-vs-theta={theta}>{`θ = ${theta}°`}</text>
            {/* A, B */}
            <circle cx={xA} cy={yA} r={5} fill="#0F172A" />
            <text x={xA + 8} y={yA + 16} fontSize={13} fontWeight={800} fill="#0F172A" {...TP}>A</text>
            <g data-vs-flag>
              <line x1={xA} y1={yB} x2={xA} y2={yB - 20} stroke="#0F172A" strokeWidth={1.5} />
              <path d={`M${xA} ${yB - 20} l12 4 l-12 4 z`} fill="#E11D48" />
              <circle cx={xA} cy={yB} r={5} fill="#0F172A" />
              <text x={xA - 8} y={yB - 6} textAnchor="end" fontSize={13} fontWeight={800} fill="#0F172A" {...TP}>B</text>
            </g>
            <Swimmer x={swimmer[0]} y={swimmer[1]} reduce={reduce} landed={!!last} hit={last?.side === 'target'} />
          </svg>
          {/* la poignée : la POINTE de la flèche s ; la piste : le demi-disque au-dessus de A */}
          <div {...st.trackProps} className="absolute" style={{ ...st.trackProps.style, left: xA - R, top: yA - R, width: 2 * R, height: R }} data-vs-track>
            <div {...st.handleProps({ label: m('handle'), valueText: m('handleText', { theta }) })} data-vs-handle={theta}
              className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-blue-600 bg-white/80 outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
              style={{ left: S[0] - (xA - R), top: S[1] - (yA - R), cursor: st.dragging ? 'grabbing' : 'grab' }}>
              <span aria-hidden="true" className="text-sm font-black text-blue-700">⟲</span>
            </div>
          </div>
          {!narrow && (
          <MovablePanel id="vector-sum.watch" bounds={sceneRef} title={m('panelTitle')} className="absolute left-1 top-1 z-10">
            <div className={`rounded-2xl border-2 border-slate-800 bg-slate-900/95 px-2 py-1 text-white shadow-lg ${narrow ? 'text-[10px] leading-tight' : 'text-xs'}`} data-vs-speed={speedLive.toFixed(2)}>
              <p><span className="text-blue-300">{m('panelSwim')}</span> <bdi dir="ltr" className="font-mono font-bold">{`${lab.swim} km/h`}</bdi></p>
              <p><span className="text-rose-300">{m('panelCurrent')}</span> <bdi dir="ltr" className="font-mono font-bold">{`${lab.current} km/h`}</bdi></p>
              <p><span className="text-emerald-300">{m('panelReal')}</span> <bdi dir="ltr" className="font-mono font-bold">{`≈ ${speedLive.toFixed(2).replace('.', ',')} km/h`}</bdi></p>
            </div>
          </MovablePanel>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5" dir="ltr">
          <button type="button" onClick={() => st.nudge(1)} disabled={theta >= lab.thetaMax} aria-label={m('more')} data-vs-more className={`${btn} border-blue-300 focus-visible:ring-blue-500`}><Plus className="h-4 w-4" aria-hidden="true" /></button>
          <span className="min-w-[5rem] rounded-full bg-blue-100 px-2 py-1 text-center font-mono text-sm font-extrabold text-blue-900" data-vs-theta-value={theta}>
            <MathText>{`$\\theta = ${theta}^{\\circ}$`}</MathText>
          </span>
          <button type="button" onClick={() => st.nudge(-1)} disabled={theta <= lab.thetaMin} aria-label={m('less')} data-vs-less className={`${btn} border-blue-300 focus-visible:ring-blue-500`}><Minus className="h-4 w-4" aria-hidden="true" /></button>
        </div>
        {narrow && (
          <p className="flex flex-wrap justify-center gap-x-3 rounded-xl bg-slate-900 px-2 py-1 text-[11px] text-white" data-vs-speed={speedLive.toFixed(2)}>
            <span><span className="text-blue-300">{m('panelSwim')}</span> <bdi dir="ltr" className="font-mono font-bold">{`${lab.swim} km/h`}</bdi></span>
            <span><span className="text-rose-300">{m('panelCurrent')}</span> <bdi dir="ltr" className="font-mono font-bold">{`${lab.current} km/h`}</bdi></span>
            <span><span className="text-emerald-300">{m('panelReal')}</span> <bdi dir="ltr" className="font-mono font-bold">{`≈ ${speedLive.toFixed(2).replace('.', ',')} km/h`}</bdi></span>
          </p>
        )}
        <p role="status" className={`min-h-[2.5rem] ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug`} data-vs-verdict={verdictKind}>{verdict}</p>
      </div>

      {lab.trials.length > 0 && (
        <LabFold id="vector-sum.trials" title={k('trialsTitle')}>
          <ul className="space-y-0.5 text-xs" data-vs-trials={lab.trials.length}>
            {lab.trials.map((tr, i) => (
              <li key={i} className={tr.side === 'target' ? 'text-emerald-800' : tr.side === 'downstream' ? 'text-rose-800' : 'text-amber-800'}>
                <MathText>{m(`trial_${tr.side}`, { theta: tr.theta, drift: tr.driftText })}</MathText>
              </li>
            ))}
          </ul>
        </LabFold>
      )}
    </div>
  );
}

/** Le nageur (bonnet, lunettes, bras) : il est là où la somme des vitesses l'a mené. */
function Swimmer({ x, y, reduce, landed, hit }) {
  return (
    <g data-vs-swimmer={landed ? (hit ? 'B' : 'bank') : 'A'} style={{ transform: `translate(${x}px, ${y}px)`, transition: reduce ? 'none' : 'transform 1.4s ease-in-out' }} aria-hidden="true">
      <ellipse cx={0} cy={4} rx={13} ry={5} fill="#FFFFFF" opacity={0.6} />
      <circle cx={0} cy={0} r={6.5} fill="#FCD34D" stroke="#92400E" strokeWidth={1} />
      <path d="M-6.5 -1 A6.5 6.5 0 0 1 6.5 -1 Z" fill={hit ? '#059669' : '#E11D48'} />
      <rect x={-5} y={0} width={10} height={2.4} rx={1.2} fill="#0F172A" />
      <path d="M-12 6 q4 -8 8 -2 M12 6 q-4 -8 -8 -2" fill="none" stroke="#92400E" strokeWidth={1.6} strokeLinecap="round" />
    </g>
  );
}

/** L'oued : les rides qui filent avec le courant, un poisson qui saute, le drone qui filme, les copains : décor pur. */
function RiverDeco({ svgW, yA, yB, reduce }) {
  const [jump, setJump] = useState(0);
  const [flip, setFlip] = useState(0);
  const river = yA - yB;
  return (
    <g data-deco="swim">
      <style>{'@keyframes vs-flow{from{transform:translateX(0)}to{transform:translateX(24px)}}.vs-flow{animation:vs-flow 2.4s linear infinite}.vs-jump{transition:transform .5s ease-out}@media (prefers-reduced-motion: reduce){.vs-flow{animation:none}.vs-jump{transition:none}}'}</style>
      <g className={reduce ? undefined : 'vs-flow'} aria-hidden="true">
        {[0.22, 0.48, 0.74].map((f, i) => (
          <path key={f} d={Array.from({ length: Math.ceil(svgW / 48) + 2 }, (_, j) => `M${j * 48 - 48 + (i % 2) * 20} ${yB + river * f} q12 -4 24 0`).join(' ')} fill="none" stroke="#E0F2FE" strokeWidth={1.4} opacity={0.8} />
        ))}
      </g>
      {/* le poisson, en aval */}
      <g className="vs-jump" style={{ transform: jump % 2 ? 'translateY(-16px)' : 'none', cursor: 'pointer' }} onClick={() => setJump((n) => n + 1)} aria-hidden="true" tabIndex={-1}>
        <ellipse cx={svgW - 34} cy={yB + river * 0.62} rx={9} ry={4.5} fill="#F97316" />
        <path d={`M${svgW - 25} ${yB + river * 0.62} l7 -5 l0 10 z`} fill="#F97316" />
      </g>
      {/* le drone qui filme, au-dessus de la rive d'en face (côté aval, loin de la montre) */}
      <g transform={`translate(${svgW - 76}, 0)`}>
      <g style={{ transform: `rotate(${flip % 2 ? 360 : 0}deg)`, transformOrigin: `${36}px ${Math.max(14, yB * 0.45)}px`, transition: reduce ? 'none' : 'transform .8s ease-in-out', cursor: 'pointer' }}
        onClick={() => setFlip((n) => n + 1)} aria-hidden="true" tabIndex={-1}>
        <rect x={28} y={Math.max(10, yB * 0.45) - 3} width={16} height={7} rx={2} fill="#334155" />
        <line x1={20} x2={52} y1={Math.max(10, yB * 0.45) - 4} y2={Math.max(10, yB * 0.45) - 4} stroke="#334155" strokeWidth={1.6} />
        <circle cx={41} cy={Math.max(10, yB * 0.45) + 1} r={1.6} fill="#EF4444" />
      </g>
      </g>
      {/* les copains sur la rive de départ, téléphone levé */}
      <g aria-hidden="true">
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${18 + i * 18}, ${yA + 8})`}>
            <circle cx={0} cy={0} r={4} fill="#92400E" />
            <rect x={-3.5} y={4} width={7} height={9} rx={2} fill={i ? '#6366F1' : '#F43F5E'} />
            <rect x={3} y={-4} width={3} height={5} rx={0.8} fill="#0F172A" />
          </g>
        ))}
      </g>
    </g>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

const $ = (s) => `$${s}$`;
const Mx = (k, mode, key, o) => <MathText>{k(`${mode}.cp.${key}`, o)}</MathText>;

/** La suite de questions de l'étape `kd` (chasles : turn · zero ; nageur : target · miss) ; la règle ferme la DERNIÈRE étape à finir. */
export function chainOf(lab, kd, withRule) {
  const base = { turn: ['sumVec', 'shorter'], zero: ['zeroSum', 'opposite'], target: ['angle', 'real'], miss: ['miss'] }[kd];
  return withRule ? [...base, 'rule'] : base;
}

/** Chaque question est construite sur LES nombres de l'essai de l'élève (rien en dur) ; `k` : les textes de `vectorSum` (`chasles.cp.*`, `parallelogram.cp.*`). */
export const QUESTIONS = {
  sumVec: (lab, k) => {
    const tr = L.trialOfKind(lab, 'turn');
    const o = { n: tr.leg + 1 };
    return {
      id: 'sumVec', kind: 'choice', cols: 3,
      prompt: Mx(k, 'chasles', 'sumVec.prompt', o),
      options: [
        { text: <MathText>{$('\\overrightarrow{CA}')}</MathText>, why: Mx(k, 'chasles', 'sumVec.whyCA', o) },
        { text: <MathText>{$('\\overrightarrow{AC}')}</MathText>, correct: true },
        { text: <MathText>{$('\\overrightarrow{BC}')}</MathText>, why: Mx(k, 'chasles', 'sumVec.whyBC', o) },
      ],
      hints: [Mx(k, 'chasles', 'sumVec.hint1', o), Mx(k, 'chasles', 'sumVec.hint2', o)],
      explain: Mx(k, 'chasles', 'sumVec.explain', o),
    };
  },
  shorter: (lab, k) => {
    const tr = L.trialOfKind(lab, 'turn');
    const ev = L.evidenceOf({ ...lab, last: { kind: 'chain', chain: tr } });
    const o = { path: $(tx(ev.path)), straight: $(tx(ev.straight)) };
    return {
      id: 'shorter', kind: 'choice',
      prompt: Mx(k, 'chasles', 'shorter.prompt', o),
      options: [
        { text: Mx(k, 'chasles', 'shorter.equal'), why: Mx(k, 'chasles', 'shorter.whyEqual', o) },
        { text: Mx(k, 'chasles', 'shorter.less'), correct: true },
        { text: Mx(k, 'chasles', 'shorter.more'), why: Mx(k, 'chasles', 'shorter.whyMore', o) },
      ],
      hints: [Mx(k, 'chasles', 'shorter.hint1'), Mx(k, 'chasles', 'shorter.hint2', o)],
      explain: Mx(k, 'chasles', 'shorter.explain', o),
    };
  },
  zeroSum: (lab, k) => {
    const tr = L.trialOfKind(lab, 'zero');
    const o = { n: tr.leg + 1 };
    return {
      id: 'zeroSum', kind: 'choice',
      prompt: Mx(k, 'chasles', 'zeroSum.prompt', o),
      options: [
        { text: Mx(k, 'chasles', 'zeroSum.number'), why: Mx(k, 'chasles', 'zeroSum.whyNumber', o) },
        { text: Mx(k, 'chasles', 'zeroSum.twice'), why: Mx(k, 'chasles', 'zeroSum.whyTwice', o) },
        { text: Mx(k, 'chasles', 'zeroSum.zero'), correct: true },
      ],
      hints: [Mx(k, 'chasles', 'zeroSum.hint1', o), Mx(k, 'chasles', 'zeroSum.hint2')],
      explain: Mx(k, 'chasles', 'zeroSum.explain', o),
    };
  },
  opposite: (lab, k) => ({
    id: 'opposite', kind: 'choice',
    prompt: Mx(k, 'chasles', 'opposite.prompt'),
    options: [
      { text: Mx(k, 'chasles', 'opposite.equal'), why: Mx(k, 'chasles', 'opposite.whyEqual') },
      { text: Mx(k, 'chasles', 'opposite.opposite'), correct: true },
      { text: Mx(k, 'chasles', 'opposite.perp'), why: Mx(k, 'chasles', 'opposite.whyPerp') },
    ],
    hints: [Mx(k, 'chasles', 'opposite.hint1'), Mx(k, 'chasles', 'opposite.hint2')],
    explain: Mx(k, 'chasles', 'opposite.explain'),
  }),
  angle: (lab, k) => {
    const tr = L.trialOfKind(lab, 'target');
    const o = { theta: $(String(Math.abs(tr.theta))), swim: lab.swim, current: lab.current };
    return {
      id: 'angle', kind: 'number', expected: String(Math.abs(tr.theta)), answer: <MathText>{$(`${Math.abs(tr.theta)}^{\\circ}`)}</MathText>,
      prompt: Mx(k, 'parallelogram', 'angle.prompt', o), hints: [Mx(k, 'parallelogram', 'angle.hint1', o), Mx(k, 'parallelogram', 'angle.hint2', o)],
      explain: Mx(k, 'parallelogram', 'angle.explain', o),
    };
  },
  real: (lab, k) => {
    const cr = L.crossingResult(lab);
    const o = { swim: lab.swim, current: lab.current, plus: $(`${lab.swim}+${lab.current}=${lab.swim + lab.current}`), minus: $(`${lab.swim}-${lab.current}=${lab.swim - lab.current}`), real: $(`${cr.speedTex}\\approx ${tx(cr.speedText)}`) };
    return {
      id: 'real', kind: 'choice', cols: 3,
      prompt: Mx(k, 'parallelogram', 'real.prompt', o),
      options: [
        { text: <MathText>{o.plus}</MathText>, why: Mx(k, 'parallelogram', 'real.whyPlus', o) },
        { text: <MathText>{o.real}</MathText>, correct: true },
        { text: <MathText>{o.minus}</MathText>, why: Mx(k, 'parallelogram', 'real.whyMinus', o) },
      ],
      hints: [Mx(k, 'parallelogram', 'real.hint1', o), Mx(k, 'parallelogram', 'real.hint2', o)],
      explain: Mx(k, 'parallelogram', 'real.explain', o),
    };
  },
  miss: (lab, k) => {
    const tr = L.trialOfKind(lab, 'miss');
    const o = { theta: $(`${Math.abs(tr.theta)}^{\\circ}`), drift: $(`${tr.driftText}`), swim: lab.swim, current: lab.current };
    return {
      id: 'miss', kind: 'choice',
      prompt: Mx(k, 'parallelogram', 'miss.prompt', o),
      options: [
        { text: Mx(k, 'parallelogram', 'miss.slow'), why: Mx(k, 'parallelogram', 'miss.whySlow', o) },
        { text: Mx(k, 'parallelogram', 'miss.sum'), correct: true },
        { text: Mx(k, 'parallelogram', 'miss.protractor'), why: Mx(k, 'parallelogram', 'miss.whyProtractor', o) },
      ],
      hints: [Mx(k, 'parallelogram', 'miss.hint1', o), Mx(k, 'parallelogram', 'miss.hint2', o)],
      explain: Mx(k, 'parallelogram', 'miss.explain', o),
    };
  },
  rule: (lab, k, ctx) => ({
    id: 'rule', kind: 'choice',
    prompt: ctx.m('dPrompt') ? <MathText>{ctx.m('dPrompt')}</MathText> : null,
    options: ctx.options,
    hints: [Mx(k, lab.mode === 'parallelogram' ? 'parallelogram' : 'chasles', 'rule.hint1'), Mx(k, lab.mode === 'parallelogram' ? 'parallelogram' : 'chasles', 'rule.hint2')],
    explain: ctx.formal,
  }),
};
