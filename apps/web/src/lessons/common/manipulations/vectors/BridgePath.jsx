import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import MathText from '../../components/MathText';
import * as L from '../logic/bridgePath';

/**
 * bridge-path — LE PLUS COURT PASSAGE (unité 11 « الأشعة والانسحاب », « أدمج تعلّماتي », وضعية « ممر الراجلين » p. 136).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève FAIT GLISSER le passage piéton (la passerelle) le long de la route : la bande [MN], toujours
 *    perpendiculaire aux deux bords (glisser sur la route, toucher la route, −/+, flèches). Puis il PORTE l'école B
 *    vers son image B′ (une épingle qu'on lâche sur un nœud du quadrillage, ou flèches + Entrée), enfin il ramène le
 *    passage jusqu'à ce que la ligne A → M → B′ soit droite.
 * B. Idée : MN ne dépend pas de la place (le vecteur NM est le même partout) ; B′ = image de B par le انسحاب de
 *    vecteur NM fait de MB′BN un متوازي أضلاع, donc NB = MB′ et AM + MN + NB = (AM + MB′) + MN ; le plus court est
 *    atteint quand M est sur [AB′] — on « enlève » la route pour qu'il ne reste qu'une ligne droite.
 * C. Le trajet de l'enfant se redessine pendant le geste ; AM, MN, NB et leur somme sont lus en direct ; l'épingle B′
 *    tire une flèche BB′ comparée à NM (refus qui nomme le منحى, le اتجاه ou le طول) ; acceptée, le متوازي أضلاع
 *    MB′BN se teinte, [MB′] et [NB] reçoivent la même marque, et la ficelle [AB′] se tend.
 * D. La ligne de lecture écrit AM + MN + NB ≈ … puis AM + MB′ ≈ … ≥ AB′ ; le graphique (longueur selon la place) se
 *    remplit des essais de l'élève ; la règle : L_min = AB′ + MN (√85 + 2 pour la وضعية).
 * E. Avant la règle : il faut des places différentes (contraste des longueurs), la translation acceptée, et la place
 *    ALIGNÉE trouvée — trouver la plus courte « par chance » au temps 1 n'ouvre rien : c'est le POURQUOI qui est visé.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        un trajet qui traverse une bande de largeur fixe par un passage perpendiculaire est le plus court
 *                  quand, après la translation de B par NM, A, M et B′ sont alignés : L_min = AB′ + MN
 *   OBJECT         le passage piéton (la passerelle du Rhummel), l'école B et son image B′, la ficelle [AB′]
 *   VARIABLE       x, la place du passage le long de la route (pas d'un demi-carreau) ; puis B′, un nœud du quadrillage
 *   INVARIANT      MN = largeur de la route et le vecteur NM, pour toute place ; NB = MB′ une fois B′ posé
 *   TRANSFORMATION AM et NB changent en sens contraires, leur somme passe par un minimum
 *   CONSTRAINT     le passage reste perpendiculaire aux bords ; B′ n'est accepté que si BB′ = NM (`vectors.relation`)
 *   RESISTANCE     B′ posé avec un autre منحى, le اتجاه de MN, ou une autre longueur : refusé en le nommant, l'épingle
 *                  revient sur B ; au temps 3, une ligne AMB′ brisée est montrée brisée, AM + MB′ > AB′ chiffré
 *   EVIDENCE       la ligne A–M–B′ qui devient droite, le point le plus bas du graphique des essais
 *   CONTRAST       au moins une place plus longue que la meilleure (le passage devant A, la droite [AB] « en biais »)
 *   PREDICTION     « où mettre le passage ? » — l'élève essaie avant que la translation ne réponde
 *   DISCOVERY      « M sur [AB′], où B′ est l'image de B par le انسحاب de vecteur NM »
 *   FORMALIZATION  BB′ = NM ⇒ MB′BN متوازي أضلاع ⇒ NB = MB′ ; AM + MN + NB = AM + MB′ + MN ≥ AB′ + MN
 *   TRANSFER       le إختبار (une passerelle sur une autoroute d'Oran), « أتعمّق » (images par translation, ex. 19)
 *
 * Mondes (`theme`) : `crosswalk` (متقدم — la rue de l'école du manuel : deux trottoirs, la cité aux paraboles, l'école
 * au drapeau) et `bridge` (مبتدئ — la gorge du Rhummel à Constantine : la vieille ville, la station du tramway, une
 * passerelle). Manuel (§6bis) : chaque place est un essai jugé ; « جرّب كل الإمكانيات » parcourt la réglette (temps 1 et 3), jamais la pose de B′.
 *
 * DÉCOR (exigence du propriétaire, monde Gen-Alpha) : rue — l'élève au cartable et au casque qui fait le trajet quand on
 * le touche, une voiture qui file ; gorge — les cigognes de Constantine qui s'envolent, la cabine du téléphérique qui
 * glisse. `aria-hidden`, hors clavier, `[data-deco]`, jamais une longueur ni une place, immobiles sous
 * `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (§8bis) : la scène est budgétée sur l'écran de leçon (`useLessonViewport` moins ce que le bloc
 * `[data-bp-glance]` prend en plus du dessin) ; la poignée du passage est SUR la route, l'épingle SUR le quadrillage,
 * les −/+ et la lecture juste dessous ; le graphique et la liste des essais sont dans un `LabFold` SOUS le bloc mesuré.
 *
 * Props : `width`, `A`, `B` (carreaux, à plat ou dans `numbers`), `theme`, `title`, `lead`, `mission`, `level`,
 * `levels`, `onTrial(evidence)` à chaque essai, `onFinished({ min, x })` à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-bridge-path][data-world][data-stage=explore|translate|straight][data-aligned][data-solved],
 * [data-bp-glance], [data-bp-handle] (role=slider), [data-bp-less|more], [data-bp-total], [data-bp-open],
 * [data-bp-pin] (bouton, flèches + Entrée), [data-bp-plane], [data-bp-verdict=<kind>], [data-bp-reading],
 * [data-lab-fold=bridge-path.trials], [data-bp-chart], [data-deco].
 */
const C = { path: '#D97706', bp: '#7C3AED', ok: '#059669', ko: '#E11D48', nm: '#0369A1' };

export default function BridgePath({
  width: width0, A: A0, B: B0, numbers: nums, theme = 'crosswalk', title, lead, mission, level, levels: withLevels = true, checkpoints = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.bridgePath.${key}`, o), [t]);
  const initialNumbers = { width: width0 ?? nums?.width ?? 2, A: A0 ?? nums?.A ?? [-3, 5], B: B0 ?? nums?.B ?? [4, -3] };
  const state = useManipulation({ type: 'bridge-path', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { width: w, A, B } = state.numbers;
  const make = () => L.init({ width: w, A, B });
  const [lab, setLab] = useState(make);
  const sceneKey = `${w}|${A}|${B}|${state.epoch}`;
  const [scene, setScene] = useState(sceneKey);
  const [liveI, setLiveI] = useState(null);
  const [drag, setDrag] = useState(false);
  if (scene !== sceneKey) { setScene(sceneKey); setLab(make()); setLiveI(null); setDrag(false); }
  const reduce = useReducedMotion();
  const beginner = state.level === 'beginner';
  const world = theme === 'bridge' ? 'bridge' : 'crosswalk';

  // Miroir synchrone de `lab` : « جرّب كل الإمكانيات » enchaîne des pas plus vite qu'un rendu.
  const labRef = useRef(lab);
  labRef.current = lab;
  const autoComplete = {
    label: t('manipulation.autoComplete.tryAll'),
    ready: lab.stage !== 'translate',
    remaining: L.untriedPlaces(lab).length,
    intervalMs: 480,
    maxTicks: 80,
    step: () => {
      const next = L.untriedPlaces(labRef.current)[0];
      if (next === undefined) return;
      labRef.current = L.cross(labRef.current, next);
      setLiveI(null);
      setLab((s) => L.cross(s, next));
    },
    finish: () => {
      const todo = L.untriedPlaces(labRef.current);
      if (todo.length === 0) return;
      labRef.current = todo.reduce((acc, i) => L.cross(acc, i), labRef.current);
      setLiveI(null);
      setLab((s) => todo.reduce((acc, i) => L.cross(acc, i), s));
    },
  };

  // les questions pendant le labo (obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte) : la règle vient de la dernière suite
  const cpSettings = useLabCheckpointSettings('bridge-path');
  const cpActive = checkpoints && cpSettings.enabled;
  const ready = L.discoveryReady(lab) && !cpActive;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, { min: L.dec(L.minimum(lab).number), x: L.numText(lab.best.x) }); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const nEvents = lab.trials.length + lab.pinTrials.length;
  useEffect(() => { if (nEvents > 0) state.report(onTrial, L.evidenceOf(lab)); }, [nEvents]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : largeur de la scène ; hauteur = écran de leçon − ce que le bloc glance prend en plus ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const svgHRef = useRef(300);
  const [boxW, setBoxW] = useState(320);
  const [overhead, setOverhead] = useState(170);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setBoxW(Math.max(150, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(110, Math.ceil(glanceRef.current.getBoundingClientRect().height) - svgHRef.current));
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
  const narrow = boxW < 380;
  const budget = Math.round(Math.max(170, Math.min(470, screenH - overhead - 20)));
  const G = L.layout(lab, { width: Math.min(boxW, 620), height: budget });
  svgHRef.current = G.height;
  const X = G.X; const Y = G.Y;

  /* ── geste 1 : le passage (moteur « étirer ») ── */
  const I = liveI ?? lab.i;
  const xToIndex = useCallback((cx, rect) => {
    const px = (cx - rect.left) * (G.width / rect.width);
    return (G.fromPx(px, 0).x - LIN_num(lab.xLo)) / LIN_num(lab.step);
  }, [G, lab.xLo, lab.step]);
  const cross = useStretchInteraction({
    value: I, range: { min: lab.iMin, max: lab.iMax }, direction: 'ltr', pageStep: 4,
    toValue: (cx, _cy, rect) => xToIndex(cx, rect),
    onChange: (v) => setLiveI(v),
    onCommit: (v) => { setLiveI(null); setLab((s) => L.cross(s, v)); },
  });

  /* ── geste 2 : l'épingle B′ (porter sur un nœud ; flèches + Entrée) ── */
  const planeRef = useRef(null);
  const pinRef = useRef(lab.pin);
  pinRef.current = lab.pin;
  const translating = lab.stage === 'translate';
  const nodeAt = (e) => {
    const r = planeRef.current.getBoundingClientRect();
    const p = G.fromPx((e.clientX - r.left) * (G.width / r.width), (e.clientY - r.top) * (G.height / r.height));
    return { x: p.x, y: p.y };
  };
  const onPlaneDown = (e) => {
    if (!translating || e.button > 0 || !planeRef.current || e.target.closest?.('[data-bp-track]')) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
    setLab((s) => L.movePin(s, nodeAt(e)));
  };
  const onPlaneMove = (e) => { if (drag) setLab((s) => L.movePin(s, nodeAt(e))); };
  const onPlaneUp = (e) => {
    if (!drag) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDrag(false);
    const P = pinRef.current;
    setLab((s) => L.placePin(s, { x: LIN_num(P.x), y: LIN_num(P.y) }));
  };
  const onPinKey = (e) => {
    const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    const P = pinRef.current;
    if (m) { e.preventDefault(); setLab((s) => L.movePin(s, { x: LIN_num(P.x) + m[0], y: LIN_num(P.y) + m[1] })); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLab((s) => L.placePin(s, { x: LIN_num(P.x), y: LIN_num(P.y) })); }
  };

  /* ── la lecture ── */
  const parts = L.partsAt(lab, I);
  const alignedNow = lab.stage === 'straight' && L.aligned(lab, I);
  const min = L.minimum(lab);
  const d = L.numText(LIN_sub(L.xAt(lab, I), lab.xLo));
  const tex = (n) => L.dec(n).replace(',', '{,}').replace('−', '-');
  const reading = lab.stage === 'straight'
    ? `$AM + MB' \\approx ${tex(parts.am)} + ${tex(parts.mbp)} ${alignedNow ? '=' : '>'} AB' \\approx ${tex(min.abp)}$`
    : `$AM + MN + NB \\approx ${tex(parts.am)} + ${L.numTex(lab.w)} + ${tex(parts.nb)} \\approx ${tex(parts.total)}$`;
  const last = lab.last;
  const verdictKind = liveI != null ? 'live' : drag ? 'pinMove' : last?.kind === 'pin' ? `pin-${last.pin.kind}` : last?.kind ?? (lab.stage === 'translate' ? 'openTranslate' : '');
  const verdict = (() => {
    const tr = last?.trial;
    switch (verdictKind) {
      case 'live': return <span className="text-slate-700">{k('vLive')}</span>;
      case 'cross': return <span className="text-slate-900"><MathText>{k(L.canTranslate(lab) ? 'vCrossNext' : 'vCross', { total: tex(tr.total), d: L.numText(LIN_sub(tr.x, lab.xLo)) })}</MathText></span>;
      case 'openTranslate': return <span className="text-violet-900"><MathText>{k(beginner ? 'vTranslateGhost' : 'vTranslate')}</MathText></span>;
      case 'pinMove': return <span className="text-violet-900"><MathText>{k('vPinMove')}</MathText></span>;
      case 'pin-equal': return <span className="text-emerald-800"><MathText>{k('vPinOk')}</MathText></span>;
      case 'pin-direction': return <span className="text-rose-800"><MathText>{k('vPinDirection')}</MathText></span>;
      case 'pin-sense': return <span className="text-rose-800"><MathText>{k('vPinSense')}</MathText></span>;
      case 'pin-length': return <span className="text-rose-800"><MathText>{k('vPinLength', { len: L.dec(last.pin.len), w: L.numText(lab.w) })}</MathText></span>;
      case 'pin-senseLength': return <span className="text-rose-800"><MathText>{k('vPinSenseLength')}</MathText></span>;
      case 'bent': return <span className="text-rose-800"><MathText>{k('vBent', { sum: tex(L.partsAt(lab, tr.i).am + L.partsAt(lab, tr.i).mbp), abp: tex(min.abp) })}</MathText></span>;
      case 'straight': return <span className="text-emerald-800"><MathText>{k('vStraight', { min: tex(min.number) })}</MathText></span>;
      default: return <span className="text-slate-600">{k('vStart')}</span>;
    }
  })();

  /* ── la découverte : des distracteurs réfutés par les nombres de la scène ── */
  const discoveryOptions = useMemo(() => {
    const front = Math.round((LIN_num(lab.A.x) - LIN_num(lab.xLo)) / LIN_num(lab.step));
    const ab = L.abCrossing(lab);
    const m = tex(L.minimum(lab).number);
    return [
      { text: <MathText>{k('dOptFront')}</MathText>, why: <MathText>{k('dWhyFront', { total: tex(L.partsAt(lab, front).total), min: m })}</MathText> },
      { text: <MathText>{k('dOptAB')}</MathText>, why: <MathText>{k('dWhyAB', { total: tex(ab.total), min: m })}</MathText> },
      { text: <MathText>{k('dOptRight')}</MathText>, correct: true },
    ];
  }, [lab, k]); // eslint-disable-line react-hooks/exhaustive-deps

  const formal = (
    <div className="space-y-2" data-bp-formal>
      <EquationDisplay tone="result" tex={"\\overrightarrow{BB'} = \\overrightarrow{NM} \\;\\Rightarrow\\; NB = MB'"} note={k('fNoteParallelogram')} />
      <EquationDisplay tone="result" tex={"AM + MN + NB = AM + MB' + MN \\geq AB' + MN"} note={k('fNoteTriangle')} />
      <EquationDisplay tone="result" tex={`L_{\\min} = AB' + MN = ${min.latex} \\approx ${tex(min.number)}`} />
      <p className="text-sm text-emerald-900"><MathText>{k('fRule')}</MathText></p>
    </div>
  );

  /* ── le dessin ── */
  const yTop = Y(lab.w); const yBot = Y(0); const f = G.frame;
  const Mx = X(L.xAt(lab, I)); const half = Math.max(7, G.k * 0.32);
  const pA = [X(lab.A.x), Y(lab.A.y)]; const pB = [X(lab.B.x), Y(lab.B.y)];
  const pBp = [X(lab.best.Bp.x), Y(lab.best.Bp.y)];
  const pin = [X(lab.pin.x), Y(lab.pin.y)];
  const textP = { style: { direction: 'ltr', unicodeBidi: 'isolate' }, fontFamily: 'ui-monospace, monospace' };
  const fs = narrow ? 11 : 13;
  const gridX = []; for (let x = Math.ceil(f.xMin); x <= Math.floor(f.xMax); x += 1) gridX.push(x);
  const gridY = []; for (let y = Math.ceil(f.yMin); y <= Math.floor(f.yMax); y += 1) gridY.push(y);
  const ticks = []; for (let i = lab.iMin; i <= lab.iMax; i += 1) ticks.push(i);
  const perStep = Math.round(1 / LIN_num(lab.step));
  const refused = last?.kind === 'pin' && last.pin.kind !== 'equal' ? [X(last.pin.P.x), Y(last.pin.P.y)] : null;
  const showBp = lab.stage === 'straight';
  const pathColor = alignedNow ? C.ok : C.path;
  /* ── les étapes : les trois temps de la scène (explorer · translater · aligner) ── */
  const KINDS = L.STEP_KINDS;
  const [answered, setAnswered] = useState({ epoch: state.epoch, ids: {} });
  const ans = answered.epoch === state.epoch ? answered.ids : {};
  const reachedK = L.reachedKinds(lab);
  const pending = KINDS.filter((kd) => reachedK.includes(kd) && !ans[kd]);
  const stepId = pending[0] ?? null;
  const withRule = pending.length === 1 && reachedK.length === KINDS.length;
  const chain = cpActive && stepId ? chainOf(stepId, withRule) : null;
  const cp = useLabCheckpoint({
    id: chain ? stepId : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, k, { options: discoveryOptions, formal })) : null,
    reached: !!stepId,
    resetKey: state.epoch,
    onRetry: () => { setLiveI(null); setLab((x) => L.restartStep(x, stepId)); },
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setAnswered((a) => ({ epoch: state.epoch, ids: { ...(a.epoch === state.epoch ? a.ids : {}), [id]: true } }));
      if (chain.includes('rule')) { state.discover(); state.formalize(); }
    },
  });
  const stepDone = KINDS.map((kd) => reachedK.includes(kd) && (!cpActive || !!ans[kd]));
  const stepper = <LabStepper count={KINDS.length} current={stepDone.every(Boolean) ? KINDS.length - 1 : stepDone.findIndex((d) => !d)} done={stepDone} stepAttr="data-bp-step" />;
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
  // le son : un déclic par place validée, « over » pour une épingle refusée ou un trajet brisé, le drapeau quand une étape est faite
  const doneN = stepDone.filter(Boolean).length;
  const sfx = useRef({ n: nEvents, d: doneN, epoch: state.epoch });
  useEffect(() => {
    const p = sfx.current;
    if (p.epoch !== state.epoch) { sfx.current = { n: nEvents, d: doneN, epoch: state.epoch }; return; }
    if (nEvents > p.n) playSfx((lab.last?.kind === 'pin' && lab.last.pin.kind !== 'equal') || lab.last?.kind === 'bent' ? 'over' : 'tooth');
    if (doneN > p.d) playSfx('flag');
    sfx.current = { n: nEvents, d: doneN, epoch: state.epoch };
  }, [nEvents, doneN, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps

  const btn = 'inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2';
  const words = (key) => k(`world.${world}.${key}`);

  return (
    <ManipulationShell
      type="bridge-path"
      title={title ?? k('title')}
      mission={mission ?? <MathText>{k(`mission.${lab.stage}`)}</MathText>}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided={cpActive}
      hints={['hint1', 'hint2', 'hint3'].map((hk) => <MathText key={hk}>{k(hk)}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false, autoComplete }}
      discovery={<ManipulationDiscovery state={state} prompt={k('dPrompt')} options={discoveryOptions} formal={formal} />}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className={world === 'bridge' ? 'bg-gradient-to-b from-amber-50/60 to-white' : 'bg-gradient-to-b from-slate-50 to-white'} minHeight="min-h-[170px]">
        <div ref={boxRef} className={`relative space-y-2 ${cp.open ? 'min-h-[620px]' : ''}`} data-bridge-path data-world={world} data-stage={lab.stage}
          data-aligned={alignedNow ? 'true' : 'false'} data-solved={lab.solved ? 'true' : 'false'} data-scene-h={G.height}>
          {party.node}
          {cp.node}
          <div ref={glanceRef} className="space-y-1.5" data-bp-glance>
            {stepper}
            <div
              ref={planeRef}
              className={`relative mx-auto ${translating ? 'cursor-crosshair' : ''}`}
              style={{ width: G.width, height: G.height, touchAction: translating ? 'none' : 'auto' }}
              onPointerDown={onPlaneDown} onPointerMove={onPlaneMove} onPointerUp={onPlaneUp} onPointerCancel={onPlaneUp}
              data-bp-plane data-bp-k={G.k.toFixed(3)}
            >
              <svg width={G.width} height={G.height} viewBox={`0 0 ${G.width} ${G.height}`} className="absolute inset-0 rounded-xl" style={{ direction: 'ltr' }}
                role="img" aria-label={k('sceneLabel', { total: L.dec(parts.total), w: L.numText(lab.w) })}>
                <World world={world} G={G} lab={lab} yTop={yTop} yBot={yBot} />
                {/* le quadrillage (ورقة مرصوفة) : des carreaux d'une unité */}
                <g aria-hidden="true" opacity={world === 'bridge' ? 0.32 : 0.28}>
                  {gridX.map((x) => <line key={`gx${x}`} x1={X(x)} x2={X(x)} y1={0} y2={G.height} stroke="#334155" strokeWidth={0.6} />)}
                  {gridY.map((y) => <line key={`gy${y}`} x1={0} x2={G.width} y1={Y(y)} y2={Y(y)} stroke="#334155" strokeWidth={0.6} />)}
                </g>
                <Deco world={world} G={G} lab={lab} yTop={yTop} yBot={yBot} reduce={reduce} pathD={`M${pA[0]} ${pA[1]} L${Mx} ${yTop} L${Mx} ${yBot} L${pB[0]} ${pB[1]}`} />
                {/* la réglette du bord haut : une graduation par place */}
                <g aria-hidden="true">
                  {ticks.map((i) => (
                    <line key={`t${i}`} x1={X(L.xAt(lab, i))} x2={X(L.xAt(lab, i))} y1={yTop} y2={yTop + (i % perStep === 0 ? 7 : 4)} stroke={world === 'bridge' ? '#FDE68A' : '#F8FAFC'} strokeWidth={1.4} />
                  ))}
                </g>
                {/* le passage [MN] : zébras ou passerelle */}
                <Crossing world={world} x={Mx} yTop={yTop} yBot={yBot} half={half} aligned={alignedNow} />
                {/* le vecteur du passage NM (dès la translation) et le fantôme de NM attaché à B (مبتدئ) */}
                {lab.stage !== 'explore' && (
                  <g data-bp-nm>
                    <Arrow x1={Mx + Math.max(half + 6, 27)} y1={yBot} x2={Mx + Math.max(half + 6, 27)} y2={yTop} color={C.nm} width={2.4} />
                    <VecLabel x={Mx + Math.max(half + 6, 27) + 4} y={yTop + Math.max(fs + 4, (yBot - yTop) * 0.3)} text="NM" color={C.nm} size={fs} />
                  </g>
                )}
                {translating && beginner && <Arrow x1={pB[0]} y1={pB[1]} x2={pBp[0]} y2={pBp[1]} color={C.nm} width={1.6} dashed opacity={0.45} />}
                {/* le trajet de l'enfant A → M → N → B */}
                <polyline points={`${pA[0]},${pA[1]} ${Mx},${yTop}`} fill="none" stroke={pathColor} strokeWidth={3} strokeLinecap="round" />
                <polyline points={`${Mx},${yBot} ${pB[0]},${pB[1]}`} fill="none" stroke={pathColor} strokeWidth={3} strokeLinecap="round" strokeDasharray={showBp ? '6 4' : undefined} opacity={showBp ? 0.7 : 1} />
                {/* temps 3 : MB′BN متوازي أضلاع, NB = MB′, la ficelle [AB′] */}
                {showBp && (
                  <g data-bp-parallelogram>
                    <polygon points={`${Mx},${yTop} ${pBp[0]},${pBp[1]} ${pB[0]},${pB[1]} ${Mx},${yBot}`} fill={C.bp} opacity={0.12} />
                    <line x1={pA[0]} y1={pA[1]} x2={pBp[0]} y2={pBp[1]} stroke={C.ok} strokeWidth={1.5} strokeDasharray="2 4" />
                    <line x1={Mx} y1={yTop} x2={pBp[0]} y2={pBp[1]} stroke={C.bp} strokeWidth={3} strokeLinecap="round" />
                    <Tick a={[Mx, yTop]} b={pBp} color={C.bp} />
                    <Tick a={[Mx, yBot]} b={pB} color={C.bp} />
                    <Arrow x1={pB[0]} y1={pB[1]} x2={pBp[0]} y2={pBp[1]} color={C.nm} width={2} />
                    <circle cx={pBp[0]} cy={pBp[1]} r={5} fill={C.bp} />
                    <text x={pBp[0] + 8} y={pBp[1] + 4} fontSize={fs + 1} fontWeight="bold" fill={C.bp} {...textP}>B′</text>
                  </g>
                )}
                {/* l'épingle refusée (dernier essai) et la flèche vivante B → épingle */}
                {refused && translating && (
                  <g data-bp-refused>
                    <Arrow x1={pB[0]} y1={pB[1]} x2={refused[0]} y2={refused[1]} color={C.ko} width={2} dashed />
                    <text x={refused[0] + 6} y={refused[1] - 6} fontSize={fs + 2} fontWeight="bold" fill={C.ko}>✗</text>
                  </g>
                )}
                {translating && (pin[0] !== pB[0] || pin[1] !== pB[1]) && <Arrow x1={pB[0]} y1={pB[1]} x2={pin[0]} y2={pin[1]} color={C.bp} width={2.4} />}
                {/* les points nommés */}
                <circle cx={pA[0]} cy={pA[1]} r={5} fill="#0F172A" />
                <text x={pA[0] - 8} y={pA[1] + 15} textAnchor="end" fontSize={fs + 1} fontWeight="bold" fill="#0F172A" {...textP}>A</text>
                <text x={pA[0] + 8} y={pA[1] - 7} fontSize={fs - 1} fontWeight="bold" fill="#334155" direction="rtl" textAnchor="end" aria-hidden="true">{words('A')}</text>
                <circle cx={pB[0]} cy={pB[1]} r={5} fill="#0F172A" />
                <text x={pB[0] + 8} y={pB[1] - 7} fontSize={fs + 1} fontWeight="bold" fill="#0F172A" {...textP}>B</text>
                <text x={pB[0] - 8} y={pB[1] + 15} fontSize={fs - 1} fontWeight="bold" fill="#334155" direction="rtl" textAnchor="start" aria-hidden="true">{words('B')}</text>
                <text x={Mx - half - 4} y={yTop - 5} textAnchor="end" fontSize={fs} fontWeight="bold" fill="#0F172A" {...textP}>M</text>
                <text x={Mx - half - 4} y={yBot + 14} textAnchor="end" fontSize={fs} fontWeight="bold" fill="#0F172A" {...textP}>N</text>
              </svg>
              {/* la piste du passage : la bande de la route ; la poignée : le milieu du passage */}
              <div {...cross.trackProps} className="absolute left-0 right-0" style={{ ...cross.trackProps.style, top: yTop, height: Math.max(44, yBot - yTop), pointerEvents: translating ? 'none' : undefined }} data-bp-track>
                <div {...cross.handleProps({ label: k('crossHandle'), valueText: k('crossValueText', { d, total: L.dec(parts.total) }) })}
                  data-bp-handle={I}
                  className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-amber-600 bg-white/90 shadow outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
                  style={{ left: Mx, top: Math.max(22, (yBot - yTop) / 2), cursor: cross.dragging ? 'grabbing' : 'grab', pointerEvents: 'auto' }}>
                  <span aria-hidden="true" className="text-sm font-black text-amber-700">⇆</span>
                </div>
              </div>
              {/* l'épingle B′ (temps 2) : flèches pour la déplacer, Entrée pour la poser */}
              {translating && (
                <button type="button" onKeyDown={onPinKey}
                  aria-label={k('pinLabel')}
                  className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-violet-300 ${drag ? 'bg-violet-500/10' : ''}`}
                  style={{ left: pin[0], top: pin[1], cursor: drag ? 'grabbing' : 'grab' }}
                  data-bp-pin={`${L.numText(lab.pin.x)};${L.numText(lab.pin.y)}`}>
                  <span className="block h-4 w-4 rounded-full border-2 border-white shadow" style={{ background: C.bp }} />
                  <span className="absolute -top-3 -left-5 rounded bg-white/90 px-1 font-mono text-[11px] font-bold text-violet-800" dir="ltr">B′</span>
                </button>
              )}
            </div>
            {/* les commandes sans glisser, juste sous la scène */}
            <div className={`flex flex-wrap items-center justify-center ${narrow ? 'gap-1' : 'gap-1.5'}`} dir="ltr">
              <button type="button" onClick={() => cross.nudge(-1)} disabled={I <= lab.iMin} aria-label={k('crossLess')} data-bp-less className={`${btn} border-amber-300 focus-visible:ring-amber-500`}><Minus className="h-4 w-4" aria-hidden="true" /></button>
              <span className={`${narrow ? 'min-w-[4.5rem] px-1 text-xs' : 'min-w-[7rem] px-2 text-sm'} rounded-full bg-amber-100 py-1 text-center font-extrabold text-amber-900`} data-bp-total={L.dec(parts.total)}>
                <MathText>{`$L \\approx ${tex(parts.total)}$`}</MathText>
              </span>
              <button type="button" onClick={() => cross.nudge(1)} disabled={I >= lab.iMax} aria-label={k('crossMore')} data-bp-more className={`${btn} border-amber-300 focus-visible:ring-amber-500`}><Plus className="h-4 w-4" aria-hidden="true" /></button>
              {L.canTranslate(lab) && (
                <button type="button" onClick={() => setLab((s) => L.openTranslate(s))} data-bp-open dir="rtl"
                  className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-violet-400 bg-violet-50 px-3 text-sm font-bold text-violet-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
                  {k('openTranslate')}
                </button>
              )}
            </div>
            <p className={`text-center ${narrow ? 'text-[11px]' : 'text-sm'} text-slate-800`} data-bp-reading aria-live="polite"><MathText>{reading}</MathText></p>
            <p role="status" className={`min-h-[2.5rem] ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug`} data-bp-verdict={verdictKind}>{verdict}</p>
          </div>

          {nEvents > 0 && (
            <LabFold id="bridge-path.trials" title={k('trialsTitle')}>
              <Chart lab={lab} k={k} solved={lab.solved} />
              <ul className="mt-1 space-y-0.5 text-xs" data-bp-trials={nEvents}>
                {lab.trials.map((tr, i) => (
                  <li key={`c${i}`} className={tr.optimal && tr.stage === 'straight' ? 'text-emerald-800' : 'text-slate-800'}>
                    <MathText>{k('trialCross', { d: L.numText(LIN_sub(tr.x, lab.xLo)).replace('−', '-').replace(',', '{,}'), total: tex(tr.total) })}</MathText>
                  </li>
                ))}
                {lab.pinTrials.map((p, i) => (
                  <li key={`p${i}`} className={p.kind === 'equal' ? 'text-emerald-800' : 'text-rose-800'}>{k(`trialPin.${p.kind}`)}</li>
                ))}
              </ul>
            </LabFold>
          )}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

const LIN_num = (p) => p.n / p.d;
const LIN_sub = (p, q) => ({ n: p.n * q.d - q.n * p.d, d: p.d * q.d });

/** Une flèche (le \vec du manuel) : un trait et une pointe en (x2 ; y2). */
function Arrow({ x1, y1, x2, y2, color, width = 2, dashed = false, opacity = 1 }) {
  const dx = x2 - x1; const dy = y2 - y1; const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len; const uy = dy / len; const h = 9;
  const bx = x2 - ux * h; const by = y2 - uy * h;
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeDasharray={dashed ? '5 4' : undefined} strokeLinecap="round" />
      <path d={`M${x2} ${y2} L${bx - uy * 5} ${by + ux * 5} L${bx + uy * 5} ${by - ux * 5} Z`} fill={color} />
    </g>
  );
}

/** Le nom d'un vecteur surmonté de sa petite flèche (« NM »). */
function VecLabel({ x, y, text, color, size }) {
  const wTxt = size * 0.62 * text.length;
  return (
    <g style={{ direction: 'ltr' }}>
      <text x={x} y={y} fontSize={size} fontWeight="bold" fill={color} fontFamily="ui-monospace, monospace">{text}</text>
      <line x1={x} y1={y - size - 1} x2={x + wTxt} y2={y - size - 1} stroke={color} strokeWidth={1.2} />
      <path d={`M${x + wTxt + 3} ${y - size - 1} l-4 -2.5 v5 z`} fill={color} />
    </g>
  );
}

/** Une petite marque d'égalité au milieu d'un segment. */
function Tick({ a, b, color }) {
  const mx = (a[0] + b[0]) / 2; const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0]; const dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l * 6; const ny = dx / l * 6;
  return <line x1={mx - nx} y1={my - ny} x2={mx + nx} y2={my + ny} stroke={color} strokeWidth={2.4} />;
}

/** Le fond : trottoirs, cité et cour d'école (rue) ou falaises et oued (gorge). Aucune information mathématique. */
function World({ world, G, yTop, yBot }) {
  if (world === 'bridge') {
    return (
      <g aria-hidden="true">
        <rect x={0} y={0} width={G.width} height={G.height} fill="#F5E6C8" />
        <rect x={0} y={yTop} width={G.width} height={yBot - yTop} fill="#0E7490" />
        <rect x={0} y={yTop} width={G.width} height={(yBot - yTop) * 0.22} fill="#78716C" opacity={0.55} />
        <rect x={0} y={yBot - (yBot - yTop) * 0.22} width={G.width} height={(yBot - yTop) * 0.22} fill="#78716C" opacity={0.55} />
        {[0.42, 0.58].map((f) => <path key={f} d={`M0 ${yTop + (yBot - yTop) * f} q ${G.width / 8} -5 ${G.width / 4} 0 t ${G.width / 4} 0 t ${G.width / 4} 0 t ${G.width / 4} 0`} stroke="#67E8F9" strokeWidth={1.2} fill="none" opacity={0.6} />)}
        <line x1={0} x2={G.width} y1={yTop} y2={yTop} stroke="#57534E" strokeWidth={2.5} />
        <line x1={0} x2={G.width} y1={yBot} y2={yBot} stroke="#57534E" strokeWidth={2.5} />
      </g>
    );
  }
  const side = Math.max(4, G.k * 0.3);
  return (
    <g aria-hidden="true">
      <rect x={0} y={0} width={G.width} height={yTop} fill="#FEF3C7" />
      <rect x={0} y={yBot} width={G.width} height={G.height - yBot} fill="#DCFCE7" />
      <rect x={0} y={yTop - side} width={G.width} height={side} fill="#CBD5E1" />
      <rect x={0} y={yBot} width={G.width} height={side} fill="#CBD5E1" />
      <rect x={0} y={yTop} width={G.width} height={yBot - yTop} fill="#475569" />
      <line x1={0} x2={G.width} y1={(yTop + yBot) / 2} y2={(yTop + yBot) / 2} stroke="#F8FAFC" strokeWidth={2} strokeDasharray="12 10" opacity={0.85} />
      <line x1={0} x2={G.width} y1={yTop} y2={yTop} stroke="#F8FAFC" strokeWidth={2} />
      <line x1={0} x2={G.width} y1={yBot} y2={yBot} stroke="#F8FAFC" strokeWidth={2} />
    </g>
  );
}

/** Le passage [MN] : bandes de zébra (rue) ou passerelle à planches et rambardes (gorge). C'est l'objet que la main tient. */
function Crossing({ world, x, yTop, yBot, half, aligned }) {
  const h = yBot - yTop;
  if (world === 'bridge') {
    const planks = Math.max(3, Math.round(h / 9));
    return (
      <g data-bp-crossing>
        <rect x={x - half} y={yTop - 3} width={2 * half} height={h + 6} fill="#92400E" stroke={aligned ? '#059669' : '#451A03'} strokeWidth={aligned ? 3 : 1.5} rx={2} />
        {Array.from({ length: planks }, (_, i) => <line key={i} x1={x - half} x2={x + half} y1={yTop + (h * (i + 0.5)) / planks} y2={yTop + (h * (i + 0.5)) / planks} stroke="#FBBF24" strokeWidth={1.2} opacity={0.7} />)}
        <line x1={x - half - 2} x2={x - half - 2} y1={yTop - 4} y2={yBot + 4} stroke="#1C1917" strokeWidth={1.6} />
        <line x1={x + half + 2} x2={x + half + 2} y1={yTop - 4} y2={yBot + 4} stroke="#1C1917" strokeWidth={1.6} />
      </g>
    );
  }
  const stripes = Math.max(3, Math.round(h / 8));
  return (
    <g data-bp-crossing>
      <rect x={x - half} y={yTop} width={2 * half} height={h} fill="#334155" stroke={aligned ? '#059669' : 'none'} strokeWidth={3} />
      {Array.from({ length: stripes }, (_, i) => (
        <rect key={i} x={x - half + 1} y={yTop + (h * i) / stripes + h / stripes * 0.2} width={2 * half - 2} height={h / stripes * 0.6} fill="#F8FAFC" />
      ))}
    </g>
  );
}

/**
 * Le DÉCOR du monde (exigence du propriétaire) — rue : la cité aux paraboles près de A, l'école au drapeau près de B,
 * l'élève au casque qui fait le trajet quand on le touche, la voiture qui file ; gorge : les maisons de la vieille ville,
 * la station du tramway, les cigognes qui s'envolent, la cabine du téléphérique. `aria-hidden`, hors clavier, jamais
 * une longueur ; immobile sous `prefers-reduced-motion`.
 */
function Deco({ world, G, lab, yTop, yBot, reduce, pathD }) {
  const [walk, setWalk] = useState(0);
  const [car, setCar] = useState(false);
  const [fly, setFly] = useState(false);
  const s = G.k;
  const ax = G.X(lab.A.x); const ay = G.Y(lab.A.y);
  const bx = G.X(lab.B.x); const by = G.Y(lab.B.y);
  const mid = (yTop + yBot) / 2;
  const tap = (fn) => ({ onClick: (e) => { e.stopPropagation(); fn(); }, onPointerDown: (e) => e.stopPropagation(), style: { cursor: 'pointer', pointerEvents: 'auto' } });
  const css = '.bp-move{transition:transform 1.4s ease-in-out}@media (prefers-reduced-motion: reduce){.bp-move{transition:none}}';
  if (world === 'bridge') {
    return (
      <g data-deco="bridge" aria-hidden="true">
        <style>{css}</style>
        {/* la vieille ville (السويقة) au-dessus de A, la station du tramway au-dessous de B */}
        {[-1.6, -0.9].map((dx, i) => (
          <g key={dx} transform={`translate(${ax + dx * s * 0.75 + s * 0.35}, ${ay - s * 0.2})`} opacity={0.85}>
            <rect x={0} y={-s * (0.55 + 0.15 * i)} width={s * 0.5} height={s * (0.55 + 0.15 * i)} fill="#FFFBEB" stroke="#A8A29E" />
            <rect x={s * 0.08} y={-s * (0.42 + 0.15 * i)} width={s * 0.12} height={s * 0.14} fill="#0EA5E9" opacity={0.7} />
            <path d={`M${-s * 0.05} ${-s * (0.55 + 0.15 * i)} h${s * 0.6}`} stroke="#B45309" strokeWidth={2} />
          </g>
        ))}
        <g transform={`translate(${bx + s * 0.35}, ${by + s * 0.25})`} opacity={0.9}>
          <rect x={0} y={0} width={s * 1.1} height={s * 0.34} rx={s * 0.12} fill="#16A34A" />
          {[0.15, 0.45, 0.75].map((f) => <rect key={f} x={s * f} y={s * 0.07} width={s * 0.18} height={s * 0.12} fill="#DCFCE7" />)}
        </g>
        {/* le téléphérique : une cabine sur son câble, elle glisse quand on la touche */}
        <line x1={0} y1={yTop - s * 0.9} x2={G.width} y2={yBot + s * 0.9} stroke="#57534E" strokeWidth={1} opacity={0.5} />
        <g className={reduce ? undefined : 'bp-move'} {...tap(() => setCar((v) => !v))}
          transform={car ? `translate(${G.width * 0.62}, ${yTop - s * 0.9 + (yBot - yTop + 1.8 * s) * 0.62})` : `translate(${G.width * 0.18}, ${yTop - s * 0.9 + (yBot - yTop + 1.8 * s) * 0.18})`}>
          <line x1={0} y1={0} x2={0} y2={s * 0.25} stroke="#57534E" />
          <rect x={-s * 0.22} y={s * 0.25} width={s * 0.44} height={s * 0.32} rx={4} fill="#DC2626" />
          <rect x={-s * 0.15} y={s * 0.3} width={s * 0.3} height={s * 0.12} fill="#FEE2E2" />
        </g>
        {/* les cigognes de Constantine */}
        <g className={reduce ? undefined : 'bp-move'} {...tap(() => setFly((v) => !v))} transform={fly ? `translate(${-s * 2}, ${-s * 1.2})` : 'translate(0,0)'}>
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${G.width - s * (1.6 - i * 0.7)}, ${s * (0.7 + i * 0.25)})`}>
              <path d={`M${-s * 0.3} 0 Q 0 ${-s * 0.18} ${s * 0.3} 0`} stroke="#1C1917" strokeWidth={1.6} fill="none" />
              <circle cx={0} cy={s * 0.02} r={s * 0.07} fill="#FFFFFF" stroke="#1C1917" />
              <path d={`M${s * 0.06} ${s * 0.02} l${s * 0.16} ${s * 0.03}`} stroke="#EA580C" strokeWidth={1.6} />
            </g>
          ))}
        </g>
      </g>
    );
  }
  return (
    <g data-deco="crosswalk" aria-hidden="true">
      <style>{css}</style>
      {/* la cité : deux immeubles et leurs paraboles, à gauche de A */}
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${ax - s * (1.3 - i * 0.62)}, ${ay - s * 0.18})`} opacity={0.9}>
          <rect x={0} y={-s * (0.62 + 0.12 * i)} width={s * 0.5} height={s * (0.62 + 0.12 * i)} fill="#FDE68A" stroke="#B45309" />
          {[0.12, 0.36].map((f) => <rect key={f} x={s * 0.08} y={-s * (0.62 + 0.12 * i) + s * f} width={s * 0.13} height={s * 0.12} fill="#7DD3FC" />)}
          <circle cx={s * 0.38} cy={-s * (0.62 + 0.12 * i) + s * 0.18} r={s * 0.07} fill="#F1F5F9" stroke="#64748B" />
          <line x1={s * 0.05} x2={s * 0.45} y1={-s * 0.18} y2={-s * 0.18} stroke="#EC4899" strokeWidth={1.4} strokeDasharray="3 2" />
        </g>
      ))}
      {/* l'école et son drapeau, à droite de B */}
      <g transform={`translate(${bx + s * 0.3}, ${by + s * 0.55})`} opacity={0.95}>
        <rect x={0} y={-s * 0.5} width={s * 1.05} height={s * 0.5} fill="#FFFFFF" stroke="#475569" />
        <path d={`M${-s * 0.05} ${-s * 0.5} L${s * 0.52} ${-s * 0.8} L${s * 1.1} ${-s * 0.5} Z`} fill="#F87171" />
        <line x1={s * 0.95} y1={-s * 0.8} x2={s * 0.95} y2={-s * 1.3} stroke="#334155" strokeWidth={1.2} />
        <rect x={s * 0.95} y={-s * 1.3} width={s * 0.16} height={s * 0.22} fill="#16A34A" />
        <rect x={s * 1.11} y={-s * 1.3} width={s * 0.16} height={s * 0.22} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={0.5} />
        <circle cx={s * 1.11} cy={-s * 1.19} r={s * 0.05} fill="none" stroke="#DC2626" strokeWidth={1.4} />
      </g>
      {/* des arbres sur le trottoir de l'école */}
      {[0.12, 0.3, 0.88].map((f) => (
        <g key={f} transform={`translate(${G.width * f}, ${G.height - s * 0.45})`} opacity={0.9}>
          <circle cx={0} cy={0} r={s * 0.22} fill="#22C55E" stroke="#15803D" />
          <circle cx={s * 0.08} cy={-s * 0.06} r={s * 0.08} fill="#4ADE80" />
        </g>
      ))}
      {/* une trottinette sur l'autre voie (décor) */}
      <g transform={`translate(${car ? s * 0.4 : G.width - s * 1.3}, ${mid - (mid - yTop) * 0.62})`} className={reduce ? undefined : 'bp-move'}>
        <rect x={0} y={s * 0.12} width={s * 0.6} height={s * 0.07} rx={2} fill="#0F172A" />
        <circle cx={s * 0.05} cy={s * 0.22} r={s * 0.06} fill="#334155" /><circle cx={s * 0.55} cy={s * 0.22} r={s * 0.06} fill="#334155" />
        <circle cx={s * 0.3} cy={s * 0.04} r={s * 0.1} fill="#A855F7" />
      </g>
      {/* une voiture sur la route : elle file quand on la touche */}
      <g className={reduce ? undefined : 'bp-move'} {...tap(() => setCar((v) => !v))} transform={`translate(${car ? G.width - s * 1.2 : s * 0.3}, ${mid + (yBot - mid) * 0.18})`}>
        <rect x={0} y={0} width={s * 0.85} height={s * 0.36} rx={s * 0.1} fill="#FACC15" />
        <rect x={s * 0.5} y={s * 0.06} width={s * 0.22} height={s * 0.24} rx={2} fill="#1E293B" opacity={0.8} />
      </g>
      {/* l'élève au cartable et au casque : il fait le trajet quand on le touche */}
      <g {...tap(() => setWalk((n) => n + 1))}>
        <g key={walk} transform={walk === 0 || reduce ? `translate(${ax - s * 0.8}, ${ay + s * 0.08})` : undefined}>
          {walk > 0 && !reduce && <animateMotion dur="3.2s" fill="freeze" path={pathD} />}
          <circle cx={0} cy={-s * 0.16} r={s * 0.12} fill="#FCD34D" stroke="#92400E" />
          <path d={`M${-s * 0.13} ${-s * 0.2} a ${s * 0.13} ${s * 0.13} 0 0 1 ${s * 0.26} 0`} stroke="#111827" strokeWidth={2} fill="none" />
          <rect x={-s * 0.1} y={-s * 0.04} width={s * 0.2} height={s * 0.22} rx={3} fill="#2563EB" />
          <rect x={s * 0.08} y={-s * 0.02} width={s * 0.09} height={s * 0.16} rx={2} fill="#F97316" />
        </g>
      </g>
    </g>
  );
}

/** Le graphique « longueur selon la place » : les essais de l'élève ; après la découverte, toutes les places. LTR. */
function Chart({ lab, k, solved }) {
  const W = 300; const H = 120; const pad = 22;
  const all = L.allTotals(lab);
  const lo = Math.min(...all.map((p) => p.total)); const hi = Math.max(...all.map((p) => p.total));
  const x = (i) => pad + (i / lab.iMax) * (W - 2 * pad);
  const y = (v) => H - pad - ((v - lo) / Math.max(1e-9, hi - lo)) * (H - 2 * pad - 6);
  const tried = new Map(lab.trials.map((tr) => [tr.i, tr]));
  return (
    <div className="space-y-1" data-bp-chart={lab.trials.length}>
      <p className="text-xs font-semibold text-slate-700">{k('chartTitle')}</p>
      <div dir="ltr" className="mx-auto w-full max-w-[320px]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={k('chartLabel')}>
          <line x1={pad} y1={H - pad} x2={W - pad / 2} y2={H - pad} stroke="#334155" />
          <line x1={pad} y1={H - pad} x2={pad} y2={6} stroke="#334155" />
          {solved && all.map((p) => <circle key={`a${p.i}`} cx={x(p.i)} cy={y(p.total)} r={2.2} fill="#94A3B8" />)}
          {solved && <line x1={pad} x2={W - pad / 2} y1={y(lo)} y2={y(lo)} stroke="#059669" strokeDasharray="4 3" />}
          {[...tried.values()].map((tr) => (
            <circle key={`t${tr.i}`} cx={x(tr.i)} cy={y(tr.total)} r={4} fill={tr.optimal ? '#059669' : '#D97706'} />
          ))}
        </svg>
      </div>
      <div className="flex justify-between text-[11px] text-slate-500"><span>{k('chartY')}</span><span>{k('chartX')}</span></div>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

const $ = (s) => `$${s}$`;
const Mq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;

/** La suite de questions de l'étape `kd` (explore · translate · straight) ; la règle ferme la DERNIÈRE étape à finir. */
export function chainOf(kd, withRule) {
  const base = { explore: ['width', 'compare'], translate: ['pinWhy', 'para'], straight: ['alignedWhy', 'minimum'] }[kd];
  return withRule ? [...base, 'rule'] : base;
}

/** Chaque question est construite sur LES nombres de la scène (largeur, places essayées, minimum) ; `k` : les textes de `bridgePath`. */
export const QUESTIONS = {
  width: (lab, k) => {
    const w = L.numText(lab.w);
    const o = { w: $(w), MN: $('MN') };
    return {
      id: 'width', kind: 'number', expected: w, answer: <MathText>{$(w)}</MathText>,
      prompt: Mq(k, 'width.prompt', o), hints: [Mq(k, 'width.hint1', o), Mq(k, 'width.hint2', o)],
      explain: Mq(k, 'width.explain', o),
    };
  },
  compare: (lab, k) => {
    const places = []; lab.trials.filter((t) => t.stage === 'explore').forEach((t) => { if (!places.some((x) => x.i === t.i)) places.push(t); });
    const [a, b] = places.slice(-2);
    const best = a.total <= b.total ? a : b; const worse = best === a ? b : a;
    const xs = (t) => $(L.numText(t.x));
    const o = { xa: xs(a), xb: xs(b), ta: $(L.dec(a.total)), tb: $(L.dec(b.total)), xbest: xs(best), tbest: $(L.dec(best.total)), tworse: $(L.dec(worse.total)) };
    const opts = [
      { text: Mq(k, 'compare.at', { x: xs(a) }), ...(a === best ? { correct: true } : { why: Mq(k, 'compare.whyLonger', { x: xs(a), t: $(L.dec(a.total)), tbest: $(L.dec(b.total)) }) }) },
      { text: Mq(k, 'compare.at', { x: xs(b) }), ...(b === best ? { correct: true } : { why: Mq(k, 'compare.whyLonger', { x: xs(b), t: $(L.dec(b.total)), tbest: $(L.dec(a.total)) }) }) },
      { text: Mq(k, 'compare.same'), why: Mq(k, 'compare.whySame', o) },
    ];
    return {
      id: 'compare', kind: 'choice', cols: 3,
      prompt: Mq(k, 'compare.prompt', o), options: opts,
      hints: [Mq(k, 'compare.hint1'), Mq(k, 'compare.hint2', o)],
      explain: Mq(k, 'compare.explain', o),
    };
  },
  pinWhy: (lab, k) => {
    const o = { w: $(L.numText(lab.w)), NM: $("\\overrightarrow{NM}"), BB: $("\\overrightarrow{BB'}") };
    return {
      id: 'pinWhy', kind: 'choice',
      prompt: Mq(k, 'pinWhy.prompt', o),
      options: [
        { text: Mq(k, 'pinWhy.below', o), why: Mq(k, 'pinWhy.whyBelow', o) },
        { text: Mq(k, 'pinWhy.above', o), correct: true },
        { text: Mq(k, 'pinWhy.side', o), why: Mq(k, 'pinWhy.whySide', o) },
      ],
      hints: [Mq(k, 'pinWhy.hint1', o), Mq(k, 'pinWhy.hint2', o)],
      explain: Mq(k, 'pinWhy.explain', o),
    };
  },
  para: (lab, k) => {
    const o = { NB: $('NB'), MB: $("MB'") };
    return {
      id: 'para', kind: 'choice',
      prompt: Mq(k, 'para.prompt', o),
      options: [
        { text: Mq(k, 'para.rect'), why: Mq(k, 'para.whyRect') },
        { text: Mq(k, 'para.para', o), correct: true },
        { text: Mq(k, 'para.trap'), why: Mq(k, 'para.whyTrap', o) },
      ],
      hints: [Mq(k, 'para.hint1'), Mq(k, 'para.hint2', o)],
      explain: Mq(k, 'para.explain', o),
    };
  },
  alignedWhy: (lab, k) => {
    const o = { AM: $('AM'), NB: $('NB'), MB: $("MB'"), AB: $("AB'") };
    return {
      id: 'alignedWhy', kind: 'choice',
      prompt: Mq(k, 'alignedWhy.prompt', o),
      options: [
        { text: Mq(k, 'alignedWhy.perp'), why: Mq(k, 'alignedWhy.whyPerp') },
        { text: Mq(k, 'alignedWhy.straight', o), correct: true },
        { text: Mq(k, 'alignedWhy.equalLegs', o), why: Mq(k, 'alignedWhy.whyEqualLegs', o) },
      ],
      hints: [Mq(k, 'alignedWhy.hint1', o), Mq(k, 'alignedWhy.hint2', o)],
      explain: Mq(k, 'alignedWhy.explain', o),
    };
  },
  minimum: (lab, k) => {
    const mn = L.minimum(lab); const w = $(L.numText(lab.w));
    const o = { w, min: $(`${mn.latex} \\approx ${L.dec(mn.number).replace(',', '{,}')}`) };
    return {
      id: 'minimum', kind: 'choice',
      prompt: Mq(k, 'minimum.prompt', o),
      options: [
        { text: <MathText>{$(`AB + ${L.numText(lab.w)}`)}</MathText>, why: Mq(k, 'minimum.whyAB', o) },
        { text: <MathText>{$(`${"AB'"} + ${L.numText(lab.w)}`)}</MathText>, correct: true },
        { text: <MathText>{$("AB'")}</MathText>, why: Mq(k, 'minimum.whyBare', o) },
      ],
      hints: [Mq(k, 'minimum.hint1', o), Mq(k, 'minimum.hint2', o)],
      explain: Mq(k, 'minimum.explain', o),
    };
  },
  rule: (lab, k, ctx) => ({
    id: 'rule', kind: 'choice',
    prompt: <MathText>{k('dPrompt')}</MathText>,
    options: ctx.options,
    hints: [Mq(k, 'rule.hint1'), Mq(k, 'rule.hint2')],
    explain: ctx.formal,
  }),
};
