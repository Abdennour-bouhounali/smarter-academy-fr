import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { spread } from './spaceCp';
import MathText from '../../components/MathText';
import SpaceFigure from '../../components/SpaceFigure';
import Stage3D from './stage3d/Stage3D';
import { buildSphereProbeScene } from './sphereProbeScene';
import * as L from '../logic/sphereProbe';

/**
 * sphere-probe — LA SONDE (unité 14 « الهندسة في الفضاء », درس « الكرة والجلة », نشاط 1 p. 164 et معارف 1 p. 166).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève DÉPLACE un point M dans l'espace, autour d'une vraie sphère 3D qu'il fait tourner du doigt : il glisse M sur le
 *    plan horizontal où elle se trouve (nœuds entiers), tire la flèche au-dessus / au-dessous pour la monter ou la descendre,
 *    ou règle ses coordonnées (−/+, flèches) ; il bascule la vue entre la كرة creuse (verre) et la جلّة pleine.
 * B. Idée : la كرة (δ) de centre O et de rayon R est l'ensemble des points M de l'ESPACE tels que OM = R (une surface creuse),
 *    la جلّة (β) celui des points tels que OM ≤ R (un solide plein qui contient la كرة) ; dans un repère de l'espace d'origine O,
 *    OM² = x² + y² + z² (Pythagore deux fois : OM₀² = x² + y², puis OM² = OM₀² + z²).
 * C. Pendant le geste : M se déplace, son pied M₀ et les deux côtés de l'angle droit en pointillés, [OM] ; à la déclaration,
 *    [OM] et la sonde prennent la couleur de la position jugée, la كرة s'ALLUME quand un point « على الكرة » est accepté.
 * D. La lecture écrit M(x ; y ; z) et, à مبتدئ, OM² = x² + y² + z² = n à côté de R² (le signe reste à trouver) ; le verdict écrit
 *    la comparaison exacte (OM = √3 < 3 = R) ; la règle : M ∈ (δ) ⇔ OM = R, M ∈ (β) ⇔ OM ≤ R.
 * E. Avant la règle : trois positions jugées justes — sur, dans, hors —, donc le contraste d'un point de la جلّة qui n'est pas de
 *    la كرة (« M داخل الجلة لكنه ليس من الكرة: OM < R »).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        كرة = { M : OM = R } (surface creuse) ; جلّة = { M : OM ≤ R } (solide plein, la كرة comprise) ; قطر ; دائرة كبرى / صغرى
 *   OBJECT         une lampe-globe de verre RGB dans la chambre d'un gamer (مبتدئ) ; la جلّة de fonte du lancer du poids au stade du
 *                  quartier, à côté d'un ballon de handball creux — les deux objets du نشاط 1 (متقدم)
 *   VARIABLE       la position de la sonde M (x ; y ; z) — puis M′ et la hauteur h du plan (متقدم, étape 2)
 *   INVARIANT      O et R ; un point de la كرة est TOUJOURS dans la جلّة ; OM² = x² + y² + z²
 *   TRANSFORMATION la sonde change de nœud, OM² change (lu en direct à مبتدئ, à calculer à متقدم)
 *   CONSTRAINT     les nœuds entiers du cube [−bound ; bound]³ (une comparaison EXACTE de OM² et R², jamais un flottant)
 *   RESISTANCE     une déclaration fausse est refusée avec la comparaison qui la contredit (OM = √3 < 3 : « داخل الجلة لكنها ليست
 *                  من الكرة ») ; à متقدم, P posée sur la كرة refusée, Q posée à OQ = R refusée (« الجلة تشمل الكرة ») ; un M′
 *                  hors de la كرة ou d'une simple corde refusé (MM′ = 4√2 < 8 = 2R) ; un plan hors de O ne donne pas de دائرة كبرى
 *   EVIDENCE       la كرة qui s'allume ; les couleurs ambre / bleu / rose des points jugés ; OM exact dans le verdict
 *   CONTRAST       un point de la جلّة qui n'est pas de la كرة, contre un point de la كرة (qui est aussi de la جلّة), et un point dehors
 *   PREDICTION     la déclaration (مبتدئ) / le placement (متقدم) précède tout verdict ; à متقدم, OM n'est jamais affichée avant
 *   DISCOVERY      « الكرة : OM = R ؛ الجلة : OM ≤ R » (choisie parmi des conjectures réfutées par les points de l'élève)
 *   FORMALIZATION  M ∈ (δ) ⇔ OM = R ; M ∈ (β) ⇔ OM ≤ R ; OM² = x² + y² + z²
 *   TRANSFER       معارف 1 (l'exemple M, P, Q ; أقطار ; دوائر كبرى / صغرى), طرائق (représenter un point), le درس des sections
 *
 * Monde (`theme`) : `glass-globe` (مبتدئ) — la chambre d'un gamer la nuit, bande LED RGB, écran et clavier ; `shot-put` (متقدم) —
 * le stade du quartier au crépuscule, le cercle de lancer du poids, une athlète algérienne, le but de handball. Décor SVG
 * DERRIÈRE le canvas transparent, `aria-hidden`, `[data-deco]`, jamais une position ni une distance ; un toucher sur la
 * télécommande RGB / l'athlète ne change que le décor ; immobile sous `prefers-reduced-motion`.
 * Manuel (§6bis) : chaque déclaration / placement est un essai jugé (aucune auto-complétion).
 *
 * D'UN SEUL REGARD (§8bis) : le bloc `[data-sp-glance]` = la fenêtre 3D (hauteur budgétée sur `100dvh` : min(52dvh, 430px)
 * côte à côte sur un écran large, min(40dvh, 330px) empilée sur un téléphone — ≤ 55 % de l'écran, la page défile autour), la
 * bascule كرة / جلّة POSÉE sur la fenêtre, les coordonnées, la lecture, les déclarations et le verdict ; la liste des essais
 * est dans un `LabFold` SOUS le bloc mesuré.
 *
 * Props : `R`, `bound`, `probes` ([[x, y, z], …] → A, B, C) ou `tasks` (['surface', 'inside', 'outside', 'diameter',
 * 'great-circle', 'small-circle']) — à plat ou dans `numbers` —, `start`, `theme`, `title`, `lead`, `mission`, `level`,
 * `levels`, `onTrial(evidence)` à chaque geste jugé, `onFinished({ R, kinds })` à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-sphere-probe][data-world][data-mode=classify|tasks][data-stage=probe|circles][data-object=sphere|ball]
 * [data-task], [data-sp-glance], [data-stage3d] (Stage3D), [data-sp-object=sphere|ball], [data-sp-pad=M|M′] et ses
 * [data-sp-coord=x|y|z] (role=spinbutton) / [data-sp-step="x+"…], [data-sp-plane] (h), [data-sp-claim=surface|inside|outside],
 * [data-sp-place], [data-sp-to-circles], [data-sp-back], [data-sp-diameter], [data-sp-section], [data-sp-reading],
 * [data-sp-verdict=<kind>], [data-sp-progress] [data-sp-chip=<id>][data-done], [data-lab-fold=sphere-probe.trials], [data-deco].
 */
const AXES = ['x', 'y', 'z'];
const KIND_TONE = {
  surface: 'border-amber-400 bg-amber-100 text-amber-950',
  inside: 'border-sky-400 bg-sky-100 text-sky-950',
  outside: 'border-rose-400 bg-rose-100 text-rose-950',
};
const pointTex = (name, p) => `${name.replace('′', "'")}(${p[0]}\\,;\\,${p[1]}\\,;\\,${p[2]})`;

export default function SphereProbe({
  numbers: nums, R: R0, bound: bound0, probes: probes0, tasks: tasks0, start: start0, theme, title, lead, mission, level,
  levels: withLevels = true, checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.sphereProbe.${key}`, o), [t]);
  const initialNumbers = useMemo(() => {
    const pick = (a, b) => (a !== undefined ? a : b);
    const out = { R: pick(R0, nums?.R) ?? 3 };
    const b = pick(bound0, nums?.bound); if (b != null) out.bound = b;
    const p = pick(probes0, nums?.probes); if (p != null) out.probes = p;
    const tk = pick(tasks0, nums?.tasks); if (tk != null) out.tasks = tk;
    const s = pick(start0, nums?.start); if (s != null) out.start = s;
    return out;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'sphere-probe', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const make = () => L.init(state.numbers);
  const [lab, setLab] = useState(make);
  const [object, setObject] = useState('sphere');
  const sceneKey = `${JSON.stringify(state.numbers)}|${state.epoch}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [doneIds, setDoneIds] = useState({});
  // « إعادة » (epoch), un autre niveau ou d'autres nombres : TOUT recommence — les essais, les étapes et les questions du labo
  if (scene.key !== sceneKey) { setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(make()); setObject('sphere'); setDoneIds({}); }
  const [grabbing, setGrabbing] = useState(false);
  const [hue, setHue] = useState(0); // le décor seulement (la télécommande RGB)
  const reduce = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  const { R, bound, mode } = lab;
  const world = theme ?? (mode === 'tasks' ? 'shot-put' : 'glass-globe');
  const circles = lab.stage === 'circles';
  const task = L.currentTask(lab);
  const name = mode === 'tasks' && L.PLACE_TASKS.includes(task) ? L.taskName(task) : 'M';

  const ready = L.discoveryReady(lab);
  const cpSettings = useLabCheckpointSettings('sphere-probe');   // obligatoires pour tout élève ; l'enseignant seul les coupe, pour SON compte
  const cpLive = cpOn && cpSettings.enabled;
  useEffect(() => { if (ready && !cpLive) state.discover(); }, [ready, state.epoch, cpLive]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!state.isFormal) return;
    state.report(onFinished, { R, kinds: [...new Set(lab.trials.filter((x) => x.ok && x.truth).map((x) => x.truth))] });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (lab.trials.length > 0) state.report(onTrial, L.evidenceOf(lab.last)); }, [lab.trials.length]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : côte à côte (large) ou empilé (téléphone) ── */
  const boxRef = useRef(null);
  const [boxW, setBoxW] = useState(640); // mesuré avant la première peinture (useLayoutEffect)
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => setBoxW(Math.max(200, Math.floor(el.clientWidth)));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const wide = boxW >= 620;
  const narrow = boxW < 380;
  const stageHeight = wide ? 'min(52dvh, 430px)' : 'min(38dvh, 330px)';

  /* ── le pont avec la scène 3D (la main dans le canvas) ── */
  const stale = L.isStale(lab);
  const last = lab.last;
  const judged = last && !stale && last.ok && (last.type === 'classify' || last.type === 'place') ? last.truth : null;
  const sec = circles ? L.section(R, lab.h) : null;
  const view = useMemo(() => ({
    R, bound, world, object, stage: lab.stage, M: lab.M, name: mode === 'classify' && L.probeAt(lab) ? `M = ${L.probeAt(lab)}` : name, onProbe: mode === 'classify' ? L.probeAt(lab) : null,
    verdict: judged, glow: judged === 'surface',
    probes: lab.probes.map((p) => {
      const done = lab.trials.find((x) => x.ok && x.type === 'classify' && x.name === p.name);
      return { name: p.name, at: p.at, done: done ? done.truth : null };
    }),
    placed: lab.placed, anchor: L.anchorOf(lab), prime: lab.prime, h: lab.h, section: sec,
    diameterOk: lab.trials.some((x) => x.type === 'diameter' && x.ok),
    showPlane: circles && task !== 'diameter',
  }), [lab, object, world, name, judged, task]); // eslint-disable-line react-hooks/exhaustive-deps
  const bridge = useRef(null);
  bridge.current = {
    view,
    moveM: (p) => setLab((s) => L.moveM(s, p)),
    movePrime: (p) => setLab((s) => L.movePrime(s, p)),
    setPlane: (h) => setLab((s) => L.setPlane(s, h)),
    grab: (b) => setGrabbing(b),
  };
  const build = useCallback((stage) => buildSphereProbeScene(stage, bridge), []);

  /* ── ce que l'écran écrit ── */
  const P = circles ? lab.prime : lab.M;
  const rd = L.reading(R, P);
  const fallback = (
    <SpaceFigure
      kind="space" view={{ azimuth: -58, elevation: 20 }} maxWidth={300}
      points={{ O: [0, 0, 0], [circles ? 'N' : name]: circles ? [0, 0, R] : (lab.M[0] === 0 && lab.M[1] === 0 && lab.M[2] === 0 ? [0.01, 0, 0] : lab.M) }}
      solids={[{ type: 'sphere', center: 'O', radius: R }]}
      segments={circles ? [] : [{ from: 'O', to: name, dashed: true }]}
      ariaLabel={k('fallbackLabel', { R, name })}
    />
  );
  const sceneLabel = circles
    ? k('sceneLabelCircles', { x: lab.prime[0], y: lab.prime[1], z: lab.prime[2], h: lab.h })
    : k('sceneLabel', { R, name, x: lab.M[0], y: lab.M[1], z: lab.M[2] });

  const reading = (() => {
    if (circles && (task === 'great-circle' || task === 'small-circle' || (!task && lab.trials.some((x) => x.type === 'section')))) {
      const r = sec.kind === 'none' ? k('readNone') : sec.kind === 'point' ? k('readPoint') : `$r = ${sec.radiusTex}$`;
      return `$h = ${lab.h}$ ، ${sec.kind === 'great-circle' ? '$O_1 = O$ ، ' : sec.kind === 'circle' ? `$O_1(0\\,;\\,0\\,;\\,${lab.h})$ ، ` : ''}${r}`;
    }
    if (circles) return `$${pointTex('M', L.anchorOf(lab))}$ ، $${pointTex("M'", lab.prime)}$`;
    if (mode === 'tasks') return `$${pointTex(name, lab.M)}$ ، $R = ${R}$`;
    return narrow ? `$${pointTex('M', lab.M)}$ ، $R^2 = ${rd.R2}$` : `$${pointTex('M', lab.M)}$ ، $OM = ${rd.OMTex}$`;
  })();
  const readingSum = circles ? null : mode === 'classify'
    ? (narrow ? `$OM^2 = ${rd.sumShortTex}$` : `$OM^2 = ${rd.sumTex}$ ؛ $R^2 = ${rd.R2}$`)
    : k('readPrompt', { name });

  const verdictKind = grabbing ? 'live' : !last ? 'start' : stale ? 'moved' : `${last.ok ? 'ok' : 'ko'}-${last.type}`;
  const verdict = (() => {
    if (verdictKind === 'live') return <span className="text-violet-900">{k('vGrab')}</span>;
    if (verdictKind === 'start') {
      const key = circles ? (task === 'diameter' ? 'vStart.diameter' : 'vStart.section') : mode === 'tasks' ? 'vStart.place' : 'vStart.classify';
      return <span className="text-slate-800"><MathText>{k(key, { R })}</MathText></span>;
    }
    if (verdictKind === 'moved') return <span className="text-slate-700"><MathText>{k('vMoved', { name: last.type === 'diameter' ? "$M'$" : last.type === 'section' ? k('thePlane') : last.type === 'classify' ? '$M$' : `$${last.name}$` })}</MathText></span>;
    const tone = last.ok ? 'text-emerald-800' : 'text-rose-800';
    const o = { name: last.name, om: last.OMTex, R, other: last.other, chord: last.chordTex, d: 2 * R, h: last.h, r: last.radiusTex, x: last.at?.[0], y: last.at?.[1], z: last.at?.[2] };
    let key;
    if (last.type === 'classify' || last.type === 'place') key = last.reason === 'taken' ? 'ko.taken' : last.ok ? `ok.${last.truth}` : `ko.${last.claimed}_${last.truth}`;
    else if (last.type === 'diameter') key = last.ok ? 'dia.ok' : `dia.${last.reason}`;
    else key = last.ok ? (last.task === 'great-circle' ? 'sec.okGreat' : 'sec.okSmall') : `sec.${last.reason}`;
    return <span className={tone}><MathText>{k(key, o)}</MathText></span>;
  })();

  /* ── la mission (au-dessus, par l'enveloppe) ── */
  const missionKey = circles ? (task ? `mission.${task}` : 'mission.done') : mode === 'tasks' ? (L.PLACE_TASKS.includes(task) ? `mission.${task}` : 'mission.toCircles') : 'mission.classify';

  /* ── la découverte : des conjectures réfutées par les points de l'élève ── */
  const own = (kind) => lab.trials.find((x) => x.ok && x.truth === kind && (x.type === 'classify' || x.type === 'place'));
  const discoveryOptions = useMemo(() => {
    const ins = own('inside'); const sur = own('surface');
    return [
      { text: k('dOptSame'), why: <MathText>{ins ? k('dWhySame', { name: ins.name, om: ins.OMTex, R }) : k('dWhySameGeneric')}</MathText> },
      { text: <MathText>{k('dOptStrict')}</MathText>, why: <MathText>{sur ? k('dWhyStrict', { name: sur.name }) : k('dWhyStrictGeneric')}</MathText> },
      { text: <MathText>{k('dOptLe')}</MathText>, why: <MathText>{k('dWhyLe', { name: ins ? ins.name : 'P' })}</MathText> },
      { text: <MathText>{k('dOptRight')}</MathText>, correct: true },
    ];
  }, [lab.trials, k, R]); // eslint-disable-line react-hooks/exhaustive-deps
  const formal = (
    <div className="space-y-2" data-sp-formal>
      <EquationDisplay tone="result" tex={'M \\in (\\delta) \\iff OM = R'} note={<MathText>{k('fNoteSphere')}</MathText>} />
      <EquationDisplay tone="result" tex={'M \\in (\\beta) \\iff OM \\le R'} note={<MathText>{k('fNoteBall')}</MathText>} />
      <EquationDisplay tone="neutral" tex={'OM^2 = x^2 + y^2 + z^2'} note={<MathText>{k('fNoteDist')}</MathText>} />
    </div>
  );

  /* ── les étapes et leurs questions : la position jugée juste (ou la tâche faite) ouvre sa suite, dans l'ordre ── */
  const stepList = L.stepsOf(lab).map((st) => ({ ...st, chain: chainOf(st.id) }));
  const stepDone = stepList.map((st) => !!doneIds[st.id] || (!cpLive && st.reached));
  const nextStep = cpLive ? stepList.find((st) => !doneIds[st.id]) : null;
  const cpId = nextStep && nextStep.reached ? nextStep.id : null;
  const chain = cpId ? nextStep.chain : null;
  const cp = useLabCheckpoint({
    id: cpId,
    questions: chain ? chain.map((q) => QUESTIONS[q]({ lab, step: nextStep, options: discoveryOptions, formal }, k)) : null,
    reached: !!cpId,
    resetKey: scene.inits,
    onRetry: () => setLab((cur) => L.retryStep(cur, cpId)),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setDoneIds((d) => ({ ...d, [id]: true }));
      if (stepList.find((st) => st.id === id)?.chain.includes('rule')) { state.discover(); state.formalize(); }
    },
  });
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // « إعادة » : on refête
  const doneKey = stepDone.join();
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.has(i)) return;
      celebrated.current.add(i);
      party.celebrate({ n: i + 1, total: stepList.length });
    });
  }, [doneKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le son : un déclic quand la sonde (ou le plan) change de nœud, « flag » à la position juste, « over » à la position refusée, « bell » quand
     une étape est finie. Muet sauf « الصوت ». ── */
  const tick = useRef({ key: null, at: 0 });
  const gestureKey = `${lab.M}|${lab.prime}|${lab.h}`;
  useEffect(() => {
    const p = tick.current;
    if (p.key === null) { p.key = gestureKey; return; }
    if (p.key === gestureKey) return;
    p.key = gestureKey;
    const now = performance.now();
    if (now - p.at > 35) { playSfx('tooth'); p.at = now; }
  }, [gestureKey]);
  const heard = useRef(0);
  useEffect(() => {
    const n = lab.trials.length;
    if (n < heard.current) heard.current = 0;
    if (n === 0 || n === heard.current) return;
    heard.current = n;
    playSfx(lab.last?.ok ? 'flag' : 'over');
  }, [lab.trials.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const bells = useRef(0);
  useEffect(() => {
    const n = stepDone.filter(Boolean).length;
    if (n > bells.current) playSfx('bell');
    bells.current = n;
  }, [doneKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── les commandes ── */
  const btn = `inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 ${narrow ? 'px-2 text-xs' : 'px-3 text-sm'} font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 disabled:opacity-40`;
  const stepFor = circles ? (axis, d) => setLab((s) => L.stepPrime(s, axis, d)) : (axis, d) => setLab((s) => L.stepM(s, axis, d));
  const padName = circles ? 'M′' : name;
  const showPad = !circles || task === 'diameter';
  const showPlane = circles && (task === 'great-circle' || task === 'small-circle');

  const claimRow = (() => {
    if (!circles && mode === 'classify') {
      return (
        <div className="grid grid-cols-3 gap-1" role="group" aria-label={k('claimGroup', { name: 'M' })}>
          {L.KINDS.map((kind) => (
            <button key={kind} type="button" data-sp-claim={kind} onClick={() => setLab((s) => L.classify(s, kind))}
              className={`${btn} ${KIND_TONE[kind]} px-1 ${narrow ? "whitespace-nowrap text-[11px]" : ""}`}>{k(`claim.${kind}`)}</button>
          ))}
        </div>
      );
    }
    if (!circles) {
      return (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {L.PLACE_TASKS.includes(task) && (
            <button type="button" data-sp-place onClick={() => setLab((s) => L.place(s))} className={`${btn} ${KIND_TONE[task]}`}>
              <MathText>{k('place', { name: `$${name}$` })}</MathText>
            </button>
          )}
          {L.canOpenCircles(lab) && (
            <button type="button" data-sp-to-circles onClick={() => setLab((s) => L.openCircles(s))} className={`${btn} border-violet-400 bg-violet-600 text-white`}>{k('toCircles')}</button>
          )}
        </div>
      );
    }
    return (
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {task === 'diameter' && (
          <button type="button" data-sp-diameter onClick={() => setLab((s) => L.claimDiameter(s))} className={`${btn} border-violet-400 bg-violet-100 text-violet-950`}>
            <MathText>{k('diameterClaim')}</MathText>
          </button>
        )}
        {(task === 'great-circle' || task === 'small-circle') && (
          <button type="button" data-sp-section onClick={() => setLab((s) => L.claimSection(s))} className={`${btn} border-rose-400 bg-rose-100 text-rose-950`}>{k(`sectionClaim.${task}`)}</button>
        )}
        <button type="button" data-sp-back onClick={() => setLab((s) => L.backToProbe(s))} aria-label={k('back')} title={k('back')} className={`${btn} border-slate-300 bg-white text-slate-800`}>{narrow ? <span aria-hidden="true">↩</span> : k('back')}</button>
      </div>
    );
  })();

  const chips = mode === 'classify'
    ? lab.probes.map((p) => ({ id: p.name, label: p.name, latin: true, done: view.probes.find((q) => q.name === p.name)?.done }))
    : (lab.tasks ?? []).map((tk, i) => ({ id: tk, label: L.PLACE_TASKS.includes(tk) ? L.taskName(tk) : k(`${narrow ? 'chipShort' : 'chip'}.${tk}`), latin: L.PLACE_TASKS.includes(tk), done: i < lab.taskIndex ? (L.PLACE_TASKS.includes(tk) ? tk : 'surface') : null, current: i === lab.taskIndex }));

  return (
    <ManipulationShell
      type="sphere-probe"
      title={title ?? k('title')}
      mission={mission ?? <MathText>{k(missionKey, { R })}</MathText>}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided={cpLive}
      hints={(mode === 'tasks' ? ['hintT1', 'hintT2', 'hintT3'] : ['hint1', 'hint2', 'hint3']).map((hk) => <MathText key={hk}>{k(hk, { R, R2: R * R })}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={<ManipulationDiscovery state={state} prompt={k('dPrompt')} options={discoveryOptions} formal={formal} />}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className={world === 'shot-put' ? 'bg-gradient-to-b from-indigo-950 to-slate-900' : 'bg-gradient-to-b from-[#120a2a] to-[#1e1b4b]'} minHeight="min-h-[180px]">
        <div ref={boxRef} className="relative space-y-2" data-sphere-probe data-world={world} data-mode={mode} data-stage={lab.stage} data-object={object}
          data-task={task ?? ''} data-r={R}>
          {party.node}
          {cp.node}
          <LabStepper count={stepList.length} current={Math.max(0, stepDone.indexOf(false) < 0 ? stepList.length - 1 : stepDone.indexOf(false))} done={stepDone} stepAttr="data-sp-step" />
          <div className={wide ? 'grid grid-cols-[minmax(0,1.35fr)_minmax(250px,1fr)] items-start gap-3' : `space-y-1.5 ${narrow ? '-mx-2' : ''}`} data-sp-glance>
            {/* la fenêtre 3D, son décor derrière, la bascule كرة / جلة posée dessus */}
            <div className="relative overflow-hidden rounded-2xl" style={{ height: stageHeight }}>
              <Decor world={world} uid={uid} reduce={reduce} hue={hue} />
              <Stage3D
                build={build} state={view} fallback={fallback} className="absolute inset-0"
                view={{ azimuth: -58, elevation: 21, distance: bound * 3.7 + 1 }} target={[0, 0, 0]}
                ariaLabel={sceneLabel} style={{ position: 'absolute' }}
              />
              {!circles && (
                <div className={`absolute z-10 flex gap-1 rounded-xl bg-white/85 p-1 shadow ring-1 ring-slate-200 ${narrow ? 'bottom-1 left-1/2 -translate-x-1/2' : 'start-2 top-2'}`} role="group" aria-label={k('objectGroup')}>
                  {['sphere', 'ball'].map((o) => (
                    <button key={o} type="button" data-sp-object={o} aria-pressed={object === o} onClick={() => setObject(o)}
                      className={`min-h-[44px] whitespace-nowrap rounded-lg px-2 font-extrabold focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 text-sm ${object === o ? 'bg-slate-900 text-white' : 'text-slate-800'}`}>
                      <MathText>{k(`object.${o}`)}</MathText>
                    </button>
                  ))}
                </div>
              )}
              {!narrow && <DecoTap world={world} onTap={() => setHue((h) => (h + 1) % 4)} />}
            </div>

            {/* les commandes, la lecture, le verdict */}
            <div className="space-y-1.5">
              {showPad && <CoordPad name={padName} p={P} bound={bound} onStep={stepFor} onSet={(axis, v) => { const q = [...P]; q[axis] = v; setLab((s) => (circles ? L.movePrime(s, q) : L.moveM(s, q))); }} k={k} narrow={narrow} />}
              {showPlane && (
                <div className="flex items-center justify-center gap-1 rounded-xl bg-white/90 p-1" data-sp-plane={lab.h}>
                  <button type="button" data-sp-step="h-" aria-label={k('planeMinus')} onClick={() => setLab((s) => L.setPlane(s, s.h - 1))} className={`${btn} border-sky-300 bg-white text-sky-900`}>−</button>
                  <span role="spinbutton" tabIndex={0} aria-label={k('planeAria')} aria-valuenow={lab.h} aria-valuemin={-(R + 1)} aria-valuemax={R + 1}
                    onKeyDown={(e) => { const d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); setLab((s) => L.setPlane(s, s.h + d * (e.shiftKey ? 2 : 1))); } }}
                    dir="ltr" className="min-w-[4.5rem] rounded-lg px-2 py-2 text-center font-mono text-base font-bold text-slate-900 outline-none focus-visible:ring-4 focus-visible:ring-sky-300">{`h = ${lab.h}`}</span>
                  <button type="button" data-sp-step="h+" aria-label={k('planePlus')} onClick={() => setLab((s) => L.setPlane(s, s.h + 1))} className={`${btn} border-sky-300 bg-white text-sky-900`}>+</button>
                </div>
              )}
              <div className={`rounded-xl bg-white/95 px-2 py-1 text-center [&_.katex]:whitespace-nowrap ${narrow ? 'text-[11px]' : 'text-sm'} text-slate-900`} data-sp-reading aria-live="polite">
                <p><MathText>{reading}</MathText></p>
                {readingSum && <p className="text-slate-700"><MathText>{readingSum}</MathText></p>}
              </div>
              {claimRow}
              <p role="status" className={`min-h-[2.75rem] rounded-xl bg-white/95 px-2 py-1 [&_.katex]:whitespace-nowrap ${narrow ? 'text-[11px]' : 'text-sm'} font-bold leading-snug`} data-sp-verdict={verdictKind}>{verdict}</p>
              <div className={`flex flex-wrap items-center justify-center ${narrow ? 'gap-0.5' : 'gap-1'}`} data-sp-progress>
                {chips.filter((c) => !narrow || mode === 'classify' || L.PLACE_TASKS.includes(c.id) === !circles).map((c) => (
                  <span key={c.id} data-sp-chip={c.id} data-done={c.done ? 'true' : 'false'}
                    className={`rounded-full border ${narrow ? 'px-1.5 text-[10px]' : 'px-2 text-xs'} py-0.5 font-bold ${c.done ? KIND_TONE[c.done] : c.current ? 'border-white bg-white/20 text-white' : 'border-white/40 text-white/80'}`}>
                    {c.latin ? <bdi dir="ltr" className="font-mono">{c.label}</bdi> : c.label}{c.done ? ' ✓' : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {lab.trials.length > 0 && (
            <LabFold id="sphere-probe.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-sp-trials={lab.trials.length}>
                {lab.trials.slice(-8).map((tr) => (
                  <li key={tr.n} className={tr.ok ? 'text-emerald-800' : 'text-rose-800'}>
                    <MathText>{trialLine(tr, k)}</MathText>
                  </li>
                ))}
              </ul>
            </LabFold>
          )}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/** Une ligne de l'historique : le point, sa position jugée, ✓ / ✗. */
function trialLine(tr, k) {
  const mark = tr.ok ? '✓' : '✗';
  if (tr.type === 'classify' || tr.type === 'place') {
    return `${mark} $${pointTex(tr.name, tr.at)}$ : ${k(`claim.${tr.claimed}`)} — $O${tr.name} = ${tr.OMTex}$`;
  }
  if (tr.type === 'diameter') return `${mark} $${pointTex("M'", tr.at)}$ : $MM' = ${tr.chordTex}$`;
  return `${mark} $h = ${tr.h}$ : ${k(`sectionKind.${tr.kind}`)}`;
}

/** Les coordonnées d'un point : trois spinbuttons (−/+, flèches ; Maj = pas de 2). */
function CoordPad({ name, p, bound, onStep, onSet, k, narrow }) {
  const [axis, setAxis] = useState(2);
  const key = (i) => (e) => {
    const d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key];
    if (d) { e.preventDefault(); onStep(i, d * (e.shiftKey ? 2 : 1)); return; }
    if (e.key === 'Home') { e.preventDefault(); onSet(i, -bound); }
    if (e.key === 'End') { e.preventDefault(); onSet(i, bound); }
  };
  const b = 'inline-flex h-11 min-w-[44px] shrink-0 items-center justify-center gap-1 rounded-lg border-2 border-amber-300 bg-white text-lg font-black text-amber-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 disabled:opacity-40';
  const spin = (ax, i, extra = '') => (
    <span role="spinbutton" tabIndex={0} data-sp-coord={ax} aria-label={k('axisAria', { axis: ax, name })} aria-valuenow={p[i]} aria-valuemin={-bound} aria-valuemax={bound}
      onKeyDown={key(i)} dir="ltr" className={`flex min-h-[44px] items-center justify-center rounded-lg text-center font-mono font-bold text-slate-900 outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${extra}`}>{`${ax} = ${p[i]}`}</span>
  );
  // Un téléphone (≈ 200 px de scène) : les trois coordonnées sur une ligne, un seul couple −/+ pour celle qu'on a touchée.
  if (narrow) {
    const ax = AXES[axis];
    return (
      <div className="space-y-1" role="group" aria-label={k('padLabel', { name })} data-sp-pad={name}>
        <div className="grid grid-cols-3 gap-1" dir="ltr">
          {AXES.map((a, i) => (
            <div key={a} onClick={() => setAxis(i)} onFocus={() => setAxis(i)} data-selected={axis === i ? 'true' : 'false'}
              className={`rounded-lg ${axis === i ? 'bg-amber-200 ring-2 ring-amber-400' : 'bg-white/90'}`}>
              {spin(a, i, 'text-xs')}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1" dir="ltr">
          <button type="button" data-sp-step={`${ax}-`} aria-label={k('minusAria', { axis: ax, name })} disabled={p[axis] <= -bound} onClick={() => onStep(axis, -1)} className={b}>− <span className="font-mono text-sm">{ax}</span></button>
          <button type="button" data-sp-step={`${ax}+`} aria-label={k('plusAria', { axis: ax, name })} disabled={p[axis] >= bound} onClick={() => onStep(axis, 1)} className={b}>+ <span className="font-mono text-sm">{ax}</span></button>
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(8.4rem,1fr))] gap-1" role="group" aria-label={k('padLabel', { name })} data-sp-pad={name}>
      {AXES.map((a, i) => (
        <div key={a} className="flex items-center justify-between gap-0.5 rounded-xl bg-white/90 p-0.5">
          <button type="button" data-sp-step={`${a}-`} aria-label={k('minusAria', { axis: a, name })} disabled={p[i] <= -bound} onClick={() => onStep(i, -1)} className={b}>−</button>
          {spin(a, i, 'min-w-[2.6rem] flex-1 text-base')}
          <button type="button" data-sp-step={`${a}+`} aria-label={k('plusAria', { axis: a, name })} disabled={p[i] >= bound} onClick={() => onStep(i, 1)} className={b}>+</button>
        </div>
      ))}
    </div>
  );
}

/**
 * Le DÉCOR derrière le canvas transparent (exigence du propriétaire, monde Gen-Alpha) : `aria-hidden`, jamais une position,
 * jamais une distance. glass-globe : la chambre d'un gamer la nuit — bande LED RGB, écran au pixel-art, clavier lumineux,
 * poster, la lampe-globe posée sur son socle. shot-put : le stade du quartier au crépuscule — gradins, projecteurs, piste,
 * cercle de lancer et secteur, une athlète en vert et blanc, le but de handball (le ballon creux du نشاط 1), le drapeau.
 */
function Decor({ world, uid, reduce, hue = 0 }) {
  const LED = [['#f472b6', '#a78bfa', '#38bdf8'], ['#34d399', '#facc15', '#f97316'], ['#38bdf8', '#818cf8', '#f472b6'], ['#ef4444', '#f59e0b', '#22c55e']][hue];
  if (world === 'shot-put') {
    return (
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" data-deco="shot-put">
        <defs>
          <linearGradient id={`spSky${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1e1b4b" /><stop offset="0.55" stopColor="#7c3aed" /><stop offset="0.85" stopColor="#fb923c" />
          </linearGradient>
          <radialGradient id={`spLight${uid}`}><stop offset="0" stopColor="#fef9c3" stopOpacity="0.9" /><stop offset="1" stopColor="#fef9c3" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width="400" height="300" fill={`url(#spSky${uid})`} />
        <radialGradient id={`spVig${uid}`}><stop offset="0" stopColor="#020617" stopOpacity="0.55" /><stop offset="1" stopColor="#020617" stopOpacity="0" /></radialGradient>
        {/* gradins et public */}
        <path d="M0 150 L400 135 L400 190 L0 200 Z" fill="#312e81" opacity="0.9" />
        {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={(i * 37) % 400} cy={152 + ((i * 13) % 34)} r="2.2" fill={['#f8fafc', '#16a34a', '#ef4444', '#facc15'][(i + hue) % 4]} opacity="0.55" />)}
        {/* projecteurs */}
        {[30, 370].map((x) => (
          <g key={x}>
            <rect x={x - 2} y="40" width="4" height="100" fill="#475569" />
            <rect x={x - 14} y="32" width="28" height="10" rx="2" fill="#e2e8f0" />
            <circle cx={x} cy="37" r="34" fill={`url(#spLight${uid})`} className={reduce ? undefined : 'sp-flicker'} />
          </g>
        ))}
        {/* la piste rouge, la pelouse, le cercle de lancer du poids et le secteur */}
        <rect y="200" width="400" height="100" fill="#15803d" />
        <path d="M-20 300 Q200 190 420 300" fill="none" stroke="#b45309" strokeWidth="26" opacity="0.85" />
        <ellipse cx="300" cy="262" rx="26" ry="9" fill="none" stroke="#f8fafc" strokeWidth="2" />
        <path d="M300 262 L380 214 M300 262 L392 240" stroke="#f8fafc" strokeWidth="1.4" opacity="0.8" />
        {/* l'athlète (vert, blanc) prête à lancer */}
        <g transform="translate(296 222)">
          <circle cx="0" cy="0" r="5" fill="#7c2d12" />
          <path d="M-5 6 h10 v16 h-10 z" fill="#16a34a" />
          <path d="M-5 22 h4 v14 h-4 z M1 22 h4 v14 h-4 z" fill="#f8fafc" />
          <path d="M5 8 l10 -8" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" />
          <circle cx="16" cy="-1" r="3.2" fill="#334155" />
        </g>
        <circle cx="200" cy="150" r="130" fill={`url(#spVig${uid})`} />
        {/* le but de handball et son ballon creux */}
        <g transform="translate(26 226)" opacity="0.9">
          <path d="M0 40 V0 H46 V40" fill="none" stroke="#f8fafc" strokeWidth="3" />
          <path d="M0 0 L8 10 H54 L46 0 M8 10 V40 M54 10 V40" fill="none" stroke="#e2e8f0" strokeWidth="1" opacity="0.6" />
          <circle cx="62" cy="34" r="6" fill="#facc15" stroke="#1d4ed8" strokeWidth="1.5" />
        </g>
        {/* le drapeau */}
        <g transform="translate(336 92)">
          <rect x="0" y="0" width="2" height="40" fill="#cbd5e1" />
          <rect x="2" y="0" width="12" height="16" fill="#16a34a" /><rect x="14" y="0" width="12" height="16" fill="#f8fafc" />
          <circle cx="15" cy="8" r="4" fill="#dc2626" /><circle cx="16.4" cy="8" r="3.3" fill="#f8fafc" />
        </g>
        <style>{'.sp-flicker{animation:spFl 3.4s ease-in-out infinite alternate}@keyframes spFl{from{opacity:.7}to{opacity:1}}@media (prefers-reduced-motion: reduce){.sp-flicker{animation:none}}'}</style>
      </svg>
    );
  }
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" data-deco="glass-globe">
      <defs>
        <linearGradient id={`spRoom${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b0620" /><stop offset="1" stopColor="#1e1b4b" />
        </linearGradient>
        <linearGradient id={`spLed${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={LED[0]} /><stop offset="0.5" stopColor={LED[1]} /><stop offset="1" stopColor={LED[2]} />
        </linearGradient>
        <radialGradient id={`spHalo${uid}`}><stop offset="0" stopColor={LED[1]} stopOpacity="0.45" /><stop offset="1" stopColor={LED[1]} stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#spRoom${uid})`} />
      {/* le halo de la lampe-globe et la bande LED au plafond */}
      <circle cx="200" cy="150" r="150" fill={`url(#spHalo${uid})`} />
      <rect x="0" y="6" width="400" height="5" rx="2" fill={`url(#spLed${uid})`} className={reduce ? undefined : 'sp-led'} />
      <rect x="0" y="11" width="400" height="22" fill={`url(#spLed${uid})`} opacity="0.12" />
      {/* poster pixel-art */}
      <g transform="translate(318 46)" opacity="0.85">
        <rect width="58" height="74" rx="3" fill="#312e81" stroke={LED[2]} strokeWidth="1.5" />
        {[[10, 12], [22, 12], [34, 12], [16, 24], [28, 24], [10, 36], [40, 36], [22, 48], [34, 48]].map(([x, y], i) => <rect key={i} x={x} y={y} width="8" height="8" fill={LED[i % 3]} />)}
      </g>
      {/* l'écran gamer et le clavier */}
      <g transform="translate(14 150)" opacity="0.9">
        <rect width="88" height="56" rx="4" fill="#020617" stroke="#475569" strokeWidth="2" />
        <rect x="5" y="5" width="78" height="44" fill="#0f172a" />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={10 + (i % 6) * 12} y={12 + Math.floor(i / 6) * 14} width="8" height="8" fill={LED[i % 3]} opacity="0.75" />)}
        <rect x="38" y="56" width="12" height="10" fill="#334155" />
      </g>
      <rect x="0" y="246" width="400" height="54" fill="#1f1235" />
      <rect x="0" y="244" width="400" height="4" fill={`url(#spLed${uid})`} opacity="0.6" />
      <g transform="translate(18 254)">
        <rect width="96" height="20" rx="4" fill="#111827" stroke="#334155" />
        {Array.from({ length: 18 }, (_, i) => <rect key={i} x={4 + (i % 9) * 10} y={3 + Math.floor(i / 9) * 8} width="8" height="6" rx="1" fill={LED[i % 3]} opacity="0.7" />)}
      </g>
      {/* le socle de la lampe-globe */}
      <path d="M176 262 h48 l-6 -12 h-36 z" fill="#3f3f46" stroke="#71717a" />
      <style>{'.sp-led{animation:spLed 2.6s ease-in-out infinite alternate}@keyframes spLed{from{opacity:.75}to{opacity:1}}@media (prefers-reduced-motion: reduce){.sp-led{animation:none}}'}</style>
    </svg>
  );
}

/** Un toucher sur la télécommande RGB (ou l'athlète) ne change QUE le décor — hors clavier, `aria-hidden`. */
function DecoTap({ world, onTap }) {
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" onClick={onTap} data-deco-tap
      className="absolute bottom-1 start-1 z-10 h-11 w-11 rounded-xl bg-slate-900/70 ring-1 ring-white/30">
      <span className="flex h-full items-center justify-center gap-0.5">
        {(world === 'shot-put' ? ['#16a34a', '#f8fafc', '#dc2626'] : ['#f472b6', '#facc15', '#38bdf8']).map((c) => <span key={c} className="h-2 w-2 rounded-full" style={{ background: c }} />)}
      </span>
    </button>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/**
 * La suite de chaque étape. Les trois positions (كرة, داخل, خارج) : OM² de SON point · sa comparaison à R² · sa place (كرة / جلة) ; la dernière
 * (خارج) finit par la RÈGLE. Les tâches du متقدم : le قطر, la دائرة كبرى, la دائرة صغرى.
 */
export function chainOf(id) {
  if (id === 'outside') return ['om2', 'cmp', 'ball', 'rule'];
  if (id === 'surface' || id === 'inside') return ['om2', 'cmp', 'ball'];
  if (id === 'diameter') return ['diamLen', 'diamMid'];
  if (id === 'great-circle') return ['gcRadius', 'gcCentre'];
  return ['scRadius2', 'scSmaller'];
}

const $ = (x) => `$${x}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const KINDI = { surface: 0, inside: 1, outside: 2 };

/** Chaque question est construite sur LES nombres de l'élève (rien n'est écrit en dur) ; `k` : les textes de `sphereProbe`. */
export const QUESTIONS = {
  om2: ({ step }, k) => {
    const tr = step.trial; const [x, y, z] = tr.at;
    const o = { name: $(tr.name), p: $(pointTex(tr.name, tr.at)), x: $(x), y: $(y), z: $(z), calc: $(`${x * x} + ${y * y} + ${z * z}`), n: tr.OM2 };
    return {
      id: 'om2', kind: 'number', expected: String(tr.OM2), answer: <MathText>{$(tr.OM2)}</MathText>,
      prompt: Cq(k, 'om2.prompt', o), hints: [Cq(k, 'om2.hint1', o), Cq(k, 'om2.hint2', o)], explain: Cq(k, 'om2.explain', o),
    };
  },
  cmp: ({ lab, step }, k) => {
    const tr = step.trial; const R = lab.R;
    const o = { name: $(tr.name), n: tr.OM2, R2: R * R, R, om: $(`OM = ${tr.OMTex}`) };
    const right = KINDI[tr.truth];
    return {
      id: 'cmp', kind: 'choice', cols: 1, prompt: Cq(k, 'cmp.prompt', o),
      options: [
        { text: Cq(k, 'cmp.eq', o), correct: right === 0, why: Cq(k, tr.truth === 'surface' ? 'cmp.whyEq' : 'cmp.whyNotEq', o) },
        { text: Cq(k, 'cmp.lt', o), correct: right === 1, why: Cq(k, 'cmp.whyLt', o) },
        { text: Cq(k, 'cmp.gt', o), correct: right === 2, why: Cq(k, 'cmp.whyGt', o) },
      ],
      hints: [Cq(k, 'cmp.hint1', o), Cq(k, 'cmp.hint2', o)], explain: Cq(k, 'cmp.explain', o),
    };
  },
  ball: ({ lab, step }, k) => {
    const tr = step.trial; const R = lab.R;
    const o = { name: $(tr.name), n: tr.OM2, R2: R * R };
    const right = KINDI[tr.truth];
    return {
      id: 'ball', kind: 'choice', cols: 1, prompt: Cq(k, 'ball.prompt', o),
      options: [
        { text: Cq(k, 'ball.both', o), correct: right === 0, why: Cq(k, 'ball.whyBoth', o) },
        { text: Cq(k, 'ball.ballOnly', o), correct: right === 1, why: Cq(k, 'ball.whyBallOnly', o) },
        { text: Cq(k, 'ball.neither', o), correct: right === 2, why: Cq(k, 'ball.whyNeither', o) },
      ],
      hints: [Cq(k, 'ball.hint1', o), Cq(k, 'ball.hint2', o)], explain: Cq(k, `ball.explain.${tr.truth}`, o),
    };
  },
  rule: ({ options, formal }, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k('dPrompt')}</MathText>, options,
    hints: [Cq(k, 'rule.hint1'), Cq(k, 'rule.hint2')], explain: formal,
  }),
  diamLen: ({ lab, step }, k) => {
    const tr = step.trial; const R = lab.R; const A = L.anchorOf(lab);
    const o = { R, d: 2 * R, m: $(pointTex('M', A)), mp: $(pointTex("M'", tr.at)) };
    return {
      id: 'diamLen', kind: 'number', expected: String(2 * R), answer: <MathText>{$(2 * R)}</MathText>,
      prompt: Cq(k, 'diamLen.prompt', o), hints: [Cq(k, 'diamLen.hint1', o), Cq(k, 'diamLen.hint2', o)], explain: Cq(k, 'diamLen.explain', o),
    };
  },
  diamMid: ({ lab, step }, k) => {
    const o = { R: lab.R, mp: $(pointTex("M'", step.trial.at)) };
    return {
      id: 'diamMid', kind: 'choice', cols: 1, prompt: Cq(k, 'diamMid.prompt', o),
      options: spread([
        { text: Cq(k, 'diamMid.centre', o), correct: true },
        { text: Cq(k, 'diamMid.end', o), why: Cq(k, 'diamMid.whyEnd', o) },
        { text: Cq(k, 'diamMid.any', o), why: Cq(k, 'diamMid.whyAny', o) },
      ], 1),
      hints: [Cq(k, 'diamMid.hint1', o), Cq(k, 'diamMid.hint2', o)], explain: Cq(k, 'diamMid.explain', o),
    };
  },
  gcRadius: ({ lab, step }, k) => {
    const o = { R: lab.R, h: step.trial.h };
    return {
      id: 'gcRadius', kind: 'number', expected: String(lab.R), answer: <MathText>{$(lab.R)}</MathText>,
      prompt: Cq(k, 'gcRadius.prompt', o), hints: [Cq(k, 'gcRadius.hint1', o), Cq(k, 'gcRadius.hint2', o)], explain: Cq(k, 'gcRadius.explain', o),
    };
  },
  gcCentre: ({ lab }, k) => {
    const o = { R: lab.R };
    return {
      id: 'gcCentre', kind: 'choice', cols: 1, prompt: Cq(k, 'gcCentre.prompt', o),
      options: spread([
        { text: Cq(k, 'gcCentre.o', o), correct: true },
        { text: Cq(k, 'gcCentre.other', o), why: Cq(k, 'gcCentre.whyOther', o) },
        { text: Cq(k, 'gcCentre.none', o), why: Cq(k, 'gcCentre.whyNone', o) },
      ], 2),
      hints: [Cq(k, 'gcCentre.hint1', o), Cq(k, 'gcCentre.hint2', o)], explain: Cq(k, 'gcCentre.explain', o),
    };
  },
  scRadius2: ({ lab, step }, k) => {
    const h = step.trial.h; const R = lab.R;
    const r2 = R * R - h * h;
    const o = { R, h, R2: R * R, h2: h * h, r2, calc: $(`${R * R} - ${h * h}`) };
    return {
      id: 'scRadius2', kind: 'number', expected: String(r2), answer: <MathText>{$(r2)}</MathText>,
      prompt: Cq(k, 'scRadius2.prompt', o), hints: [Cq(k, 'scRadius2.hint1', o), Cq(k, 'scRadius2.hint2', o)], explain: Cq(k, 'scRadius2.explain', o),
    };
  },
  scSmaller: ({ lab, step }, k) => {
    const h = step.trial.h; const R = lab.R;
    const o = { R, h, r2: R * R - h * h, R2: R * R };
    return {
      id: 'scSmaller', kind: 'choice', cols: 1, prompt: Cq(k, 'scSmaller.prompt', o),
      options: spread([
        { text: Cq(k, 'scSmaller.less', o), correct: true },
        { text: Cq(k, 'scSmaller.same', o), why: Cq(k, 'scSmaller.whySame', o) },
        { text: Cq(k, 'scSmaller.more', o), why: Cq(k, 'scSmaller.whyMore', o) },
      ], 0),
      hints: [Cq(k, 'scSmaller.hint1', o), Cq(k, 'scSmaller.hint2', o)], explain: Cq(k, 'scSmaller.explain', o),
    };
  },
};
