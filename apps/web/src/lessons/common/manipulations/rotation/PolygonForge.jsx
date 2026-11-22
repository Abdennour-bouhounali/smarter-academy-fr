import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus, RotateCcw, Undo2 } from 'lucide-react';
import { parseDec } from '@smarter-academy/core';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import MovablePanel from '../primitives/MovablePanel';
import MathText from '../../components/MathText';
import { centeredArc, angleArc, rightAngleSquare } from '../../components/geoFigure';
import * as L from '../logic/polygonForge';

/**
 * polygon-forge — LA FORGE DE POLYGONES (unité 13 « الدوران - الزوايا - المضلّعات المنتظمة », درس « المضلعات المنتظمة
 * وتطبيقاتها », manuel pp. 151–157 : le تحدّ de l'étoile du drapeau, معارف 5, طرائق).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève TOURNE le cadran de l'angle α (il fait glisser l'image suivante autour du centre O ; −/+ ; flèches ±1°,
 *    Maj ±10°) puis APPLIQUE la rotation « دوّر » : chaque nouveau sommet est l'image du précédent par (O, α, sens direct).
 *    متقدم : il tire ensuite le compas (le rayon R, en saisissant la pointe A, ou en tapant R) et relie les pointes.
 * B. Idée : les sommets d'un polygone régulier à n côtés sont les images successives d'un sommet par la rotation de
 *    centre O et d'angle 360°/n — la figure ne se REFERME que si n × α = 360° ; la زاوية مركزية est 360°/n, la زاوية
 *    المضلع 180° − 360°/n, le côté = r pour l'hexagone (2r·sin(180°/n) sinon).
 * C. Les images se posent une à une sur le cercle, l'arc fléché α va du dernier sommet à l'image suivante, le compteur
 *    dit k × α ; à la fermeture le polygone se remplit (miel / tifo), au dépassement le second tour se dessine en
 *    pointillés orange ; متقدم : la corde AB se mesure pendant que R change, les branches rouges forment l'étoile.
 * D. n × α = 360°, α = 360°/n, 180° − α, côté = r ; متقدم : sin 36° = 5/R → R ≈ 8,51 cm, branche ≈ 16,18 cm, pointe 36°.
 * E. Avant la règle : un tour qui NE SE FERME PAS (50° : 7 × 50 = 350 < 360 < 400) ou un autre polygone, ET la figure
 *    cherchée (l'alvéole, l'étoile).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        un polygone régulier = l'orbite d'un sommet sous la rotation (O, 360°/n)
 *   OBJECT         مبتدئ : une alvéole de ruche de Kabylie ; متقدم : l'étoile du drapeau peinte en tifo dans les tribunes
 *   VARIABLE       α (degrés entiers, 20 → 180), puis le nombre d'images posées ; متقدم : R (centièmes de cm), la pointe suivante
 *   INVARIANT      la distance au centre (OM′ = OM : chaque image reste sur le cercle) ; le même α à chaque image
 *   TRANSFORMATION la k-ième image à k·α de A ; le polygone se remplit quand l'image retombe sur A
 *   CONSTRAINT     α ne change pas pendant un tour (même rotation) ; un polygone a au moins trois sommets
 *   RESISTANCE     α tel que 360 ÷ α n'est pas entier : la k-ième image DÉPASSE A, le second tour se dessine décalé et le lab
 *                  écrit pourquoi (« 360 ÷ 50 = 7,2 ليس عددا صحيحا ») ; 180° : un segment ; 144° : une étoile (deux tours) ;
 *                  متقدم : AB ≠ 10,00 cm écrit au centième, un côté du pentagone refusé comme branche
 *   EVIDENCE       le polygone qui se ferme (et rien d'autre), le compteur n × α = 360°
 *   CONTRAST       un tour ouvert ou un autre polygone ET la figure cherchée (logic › discoveryReady)
 *   PREDICTION     choisir α AVANT de tourner : le compteur dit seulement ce qui a été fait, jamais la bonne valeur
 *   DISCOVERY      « تنغلق الحلقة عندما يكون n × α = 360° تماما »
 *   FORMALIZATION  α = 360°/n (معارف 5, خاصية 2), Â = 180° − 360°/n (طريقة p. 157), R = 5 / sin 36° (le تحدّ)
 *   TRANSFER       معارف 5 (خاصية 3), طرائق p. 157 (108°, construction, côté à partir de R), دوري الآن (heptagone)
 *
 * Mondes (`theme`) : `honeycomb` (مبتدئ) — la ruche, les abeilles qui butinent ; `flag-star` (متقدم, le تحدّ) — le tifo
 * vert et blanc de la tribune. MANUEL (§6bis) : chaque tour est un essai, aucune auto-complétion.
 *
 * DÉCOR (exigence du propriétaire) : abeilles qui s'envolent au toucher, ruche en liège, alvéoles pâles autour ; tribune,
 * supporters, fumigène qu'on allume, croissant qui apparaît quand l'étoile est tracée. `aria-hidden`, hors clavier,
 * `[data-deco]`, jamais une information (aucun angle, aucune longueur), immobile sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (§8bis) : la scène est un CARRÉ (le cercle y est inscrit) dont le côté est budgété sur l'écran de leçon
 * (`useLessonViewport` moins ce que le bloc `[data-pf-glance]` occupe en plus du dessin) ; la poignée EST l'image suivante
 * (sur le cercle) ; −/+ et « دوّر » juste dessous, puis le verdict et les lectures ; le compteur flotte dans un coin de la
 * scène (`MovablePanel`, une ligne sous 380 px) ; les étapes de l'étoile en tête du bloc ; les essais dans un `LabFold`
 * SOUS le bloc mesuré.
 *
 * Props : `n`, `r`, `tip`, `star`, `alpha` — à plat ou groupés dans `numbers` (levels.js) ; `theme`, `title`, `lead`,
 * `mission`, `level`, `levels`, `onTrial(evidence)` à chaque issue (tour, rayon, étoile) et `onFinished({ mode, alpha, n })`
 * à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-polygon-forge][data-mode=cell|star][data-world][data-stage][data-solved], [data-pf-glance],
 * [data-pf-handle] (role=slider, α), [data-pf-less|more], [data-pf-alpha], [data-pf-turn], [data-pf-release],
 * [data-pf-vertex=<j>], [data-pf-run=<issue>], [data-pf-verdict=<kind>], [data-pf-readings], [data-pf-counter],
 * [data-pf-stage-tab=<forge|radius|draw>], [data-pf-next], [data-pf-rhandle] (role=slider, R), [data-pf-rinput],
 * [data-pf-chord], [data-pf-tip=<j>], [data-pf-stroke], [data-lab-fold=polygon-forge.trials], [data-deco].
 */
const NUMBER_KEYS = ['n', 'r', 'tip', 'star', 'alpha'];
const TP = { style: { direction: 'ltr', unicodeBidi: 'isolate' }, fontFamily: 'ui-monospace, monospace' };
const TIP_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const RED = '#D21034'; // le rouge du drapeau
const btn = 'inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 bg-white px-2 disabled:opacity-40 focus:outline-none focus-visible:ring-2';
const tx = (s) => String(s).replace(',', '{,}');

export default function PolygonForge(props) {
  const { numbers: grouped, theme: theme0, title, lead, mission, level, levels: withLevels = true,
    initialMode = 'student', allowModeSwitch = false, checkpoints: cpOn = true, onTrial, onFinished } = props;
  const authored = useMemo(() => {
    const out = {};
    for (const key of NUMBER_KEYS) {
      const v = grouped?.[key] ?? props[key];
      if (v != null) out[key] = v;
    }
    return out;
  }, [grouped, props]); // eslint-disable-line react-hooks/exhaustive-deps
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.polygonForge.${key}`, o), [t]);
  const state = useManipulation({ type: 'polygon-forge', initialNumbers: authored, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numKey = JSON.stringify(NUMBER_KEYS.map((x) => nums[x] ?? null));
  const make = () => L.init(nums);
  const [lab, setLab] = useState(make);
  const sceneKey = `${numKey}|${state.epoch}`;
  const [scene, setScene] = useState(sceneKey);
  const [inits, setInits] = useState(0);
  const [doneIds, setDoneIds] = useState({});
  // « إعادة », un autre niveau ou d'autres nombres : TOUT recommence — la forge, les essais, les questions du labo
  if (scene !== sceneKey) { setScene(sceneKey); setLab(make()); setInits((n) => n + 1); setDoneIds({}); }
  const mode = lab.mode;
  const theme = theme0 ?? (mode === 'star' ? 'flag-star' : 'honeycomb');
  const m = useCallback((key, o) => k(`${mode}.${key}`, o), [k, mode]);

  const ready = L.discoveryReady(lab);
  // les questions pendant le labo : obligatoires pour tout élève, l'enseignant seul les coupe pour SON compte (L2)
  const cpSettings = useLabCheckpointSettings('polygon-forge');
  const cpLive = cpOn && cpSettings.enabled;
  useEffect(() => { if (ready && !cpLive) state.discover(); }, [ready, state.epoch, cpLive]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!state.isFormal) return;
    const closed = lab.trials.find((tr) => tr.outcome === 'closed');
    state.report(onFinished, { mode, alpha: closed?.alpha ?? null, n: lab.target });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const e = L.evidenceOf(lab);
    if (e) state.report(onTrial, e);
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps

  const sn = mode === 'star' ? L.starNumbers(lab) : null;
  const discoveryOptions = useMemo(() => (mode === 'star' ? [
    { text: <MathText>{m('dOptR10')}</MathText>, why: <MathText>{m('dWhyR10', { c: tx(L.chordText(lab, lab.tip * 100)) })}</MathText> },
    { text: <MathText>{m('dOptRight', { r: tx(sn.RText) })}</MathText>, correct: true },
    { text: <MathText>{m('dOptBranch')}</MathText>, why: <MathText>{m('dWhyBranch', { b: tx(sn.branchText) })}</MathText> },
  ] : [
    { text: <MathText>{m('dOptEven')}</MathText>, why: <MathText>{m('dWhyEven')}</MathText> },
    { text: <MathText>{m('dOptRight')}</MathText>, correct: true },
    { text: <MathText>{m('dOptSix')}</MathText>, why: <MathText>{m('dWhySix')}</MathText> },
  ]), [lab, m, mode, sn]);

  // Miroir synchrone de `lab` : « جرّب كل الإمكانيات » enchaîne des pas plus vite qu'un rendu.
  const labRef = useRef(lab);
  labRef.current = lab;
  const untried = () => (labRef.current.stage === 'forge' ? L.untriedAlphas(labRef.current) : []);

  const target = lab.target;
  const found = lab.trials.find((tr) => tr.outcome === 'closed')?.alpha;
  const formal = mode === 'star' ? (
    <div className="space-y-2" data-pf-formal>
      <EquationDisplay tone="result" tex={`\\widehat{AOB} = \\dfrac{360^\\circ}{${target}} = ${found ?? 72}^\\circ`} />
      <EquationDisplay tone="result" tex={`\\sin ${sn.half.replace('^\\circ', '')}^\\circ = \\dfrac{AH}{OA} = \\dfrac{${tx(sn.halfTip.replace(',00', ''))}}{R} \\;\\Rightarrow\\; R \\approx ${tx(sn.RText)}\\,\\mathrm{cm}`} />
      <p className="text-sm text-emerald-900"><MathText>{m('fRule', { r: tx(sn.RText) })}</MathText></p>
    </div>
  ) : (
    <div className="space-y-2" data-pf-formal>
      {found && <EquationDisplay tone="result" tex={`${target} \\times ${found}^\\circ = 360^\\circ`} />}
      <EquationDisplay tone="result" tex={'\\alpha = \\dfrac{360^\\circ}{n}'} note={m('fCentral')} />
      <EquationDisplay tone="result" tex={'\\widehat{A} = 180^\\circ - \\dfrac{360^\\circ}{n} = \\dfrac{(n-2) \\times 180^\\circ}{n}'} note={m('fInterior')} />
      <p className="text-sm text-emerald-900"><MathText>{m('fRule')}</MathText></p>
    </div>
  );

  /* ── les étapes et leurs questions : une étape atteinte (ET les précédentes) ouvre sa suite, dans l'ordre ── */
  const stepList = L.stepsOf(lab).map((st) => ({ ...st, chain: chainOf(mode, st.id) }));
  const stepDone = stepList.map((st) => !!doneIds[st.id] || (!cpLive && st.reached));
  const nextStep = cpLive ? stepList.find((st) => !doneIds[st.id]) : null;
  const cpId = nextStep && nextStep.reached ? nextStep.id : null;
  const chain = cpId ? nextStep.chain : null;
  const cp = useLabCheckpoint({
    id: cpId,
    questions: chain ? chain.map((q) => QUESTIONS[q]({ lab, options: discoveryOptions, formal }, k)) : null,
    reached: !!cpId,
    resetKey: inits,
    onRetry: () => setLab((cur) => L.retryStep(cur, cpId)),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setDoneIds((d) => ({ ...d, [id]: true }));
      if (stepList.find((st) => st.id === id)?.chain.includes('rule')) { state.discover(); state.formalize(); }
    },
  });
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && lab.radiusTrials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // « إعادة » : on refête
  const doneKey = stepDone.join();
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.has(i)) return;
      celebrated.current.add(i);
      party.celebrate({ n: i + 1, total: stepList.length });
    });
  }, [doneKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le son : un déclic par geste (au plus un toutes les 35 ms), « flag » à la figure juste, « bell » à la fermeture / l'étoile finie,
     « over » à un tour refusé ou dépassé. Muet sauf « الصوت ». ── */
  const tick = useRef(0);
  const heard = useRef(null);
  useEffect(() => {
    const e = lab.last;
    if (!e || heard.current === e) return;
    heard.current = e;
    const kind = e.kind;
    if (kind === 'closed') { playSfx('flag'); playSfx('bell'); return; }
    if (['other', 'flat', 'open', 'star', 'spiral', 'refuse'].includes(kind)) { playSfx('over'); return; }
    if (kind === 'radius') { playSfx(e.verdict === 'ok' ? 'flag' : 'over'); return; }
    if (kind === 'stroke') { playSfx('tooth'); if (e.count === lab.target) { playSfx('flag'); playSfx('bell'); } return; }
    const now = performance.now();
    if (['turn', 'alpha'].includes(kind) && now - tick.current > 35) { playSfx('tooth'); tick.current = now; }
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ManipulationShell
      type="polygon-forge"
      title={title ?? m('title')}
      mission={mission ?? <MathText>{m('mission')}</MathText>}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided={cpLive}
      hints={['hint1', 'hint2', 'hint3'].map((hk) => <MathText key={hk}>{m(hk)}</MathText>)}
      controller={{
        autoStep: () => false,
        canAutoStep: () => false,
        autoComplete: {
          label: t('manipulation.autoComplete.tryAll'),
          ready: true,
          remaining: untried().length,
          // un angle par pas : on VOIT chaque tour se jouer, puis son issue (fermé / ouvert / étoile / spirale)
          intervalMs: 480,
          maxTicks: 80,
          step: () => {
            const next = untried()[0];
            if (next === undefined) return;
            const after = L.runAlpha(labRef.current, next);
            labRef.current = after;
            setLab(after);
          },
          finish: () => {
            const todo = untried();
            if (todo.length === 0) return;
            const after = todo.reduce((acc, a) => L.runAlpha(acc, a), labRef.current);
            labRef.current = after;
            setLab(after);
          },
        },
      }}
      discovery={<ManipulationDiscovery state={state} prompt={m('dPrompt')} options={discoveryOptions} formal={formal} />}
      explanation={<MathText>{m('explanation')}</MathText>}
    >
      <ManipulationStage className={mode === 'star' ? 'bg-gradient-to-b from-emerald-50/70 to-white' : 'bg-gradient-to-b from-amber-50/70 to-white'} minHeight="min-h-[150px]">
        <div className="relative space-y-2">
          {party.node}
          {cp.node}
          <LabStepper count={stepList.length} current={Math.max(0, stepDone.indexOf(false) < 0 ? stepList.length - 1 : stepDone.indexOf(false))} done={stepDone} stepAttr="data-pf-step" />
          <Forge lab={lab} setLab={setLab} k={k} m={m} theme={theme} solved={ready} blocking={cp.blocking} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ── la mesure : largeur du bloc ; hauteur = écran de leçon − ce que le bloc glance prend en plus du dessin ── */
function useBudget(min, max) {
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const drawnH = useRef(300);
  const [width, setWidth] = useState(320);
  const [overhead, setOverhead] = useState(200);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(200, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(120, Math.ceil(glanceRef.current.getBoundingClientRect().height) - drawnH.current));
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
  const budget = Math.round(Math.max(min, Math.min(max, screenH - overhead - 20)));
  return { boxRef, glanceRef, drawnH, width, budget };
}

/** Un point du cercle (degrés mathématiques, y vers le HAUT) en coordonnées SVG. */
const at = (c, r, deg) => [c + r * Math.cos((deg * Math.PI) / 180), c - r * Math.sin((deg * Math.PI) / 180)];
const pts = (list) => list.map((p) => p.join(',')).join(' ');

function Forge({ lab, setLab, k, m, theme, solved, blocking = false }) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const { boxRef, glanceRef, drawnH, width, budget } = useBudget(220, 540);
  const narrow = width < 380;
  const S = Math.max(220, Math.min(width, budget, 540));
  drawnH.current = S;
  const c = S / 2;
  const sceneRef = useRef(null);
  const stage = lab.stage;

  /* les deux grandeurs tenues par la main : α (cadran) et R (compas) — un seul moteur « étirer » chacune (§4.2) */
  const [liveA, setLiveA] = useState(null);
  const [liveR, setLiveR] = useState(null);
  const ended = lab.run != null && L.canTurn(lab) !== true;
  const fromDeg = ended ? L.START_DEG : L.START_DEG + lab.images * lab.alpha;
  const alphaSt = useStretchInteraction({
    value: liveA ?? lab.alpha, range: { min: L.ALPHA.min, max: L.ALPHA.max }, direction: 'ltr', pageStep: 10,
    toValue: (cx, cy, rect) => {
      const phi = (Math.atan2(-(cy - (rect.top + rect.height / 2)), cx - (rect.left + rect.width / 2)) * 180) / Math.PI;
      const a = (((phi - fromDeg) % 360) + 360) % 360;
      return a > 270 ? L.ALPHA.min : a;
    },
    onChange: (v) => setLiveA(v),
    onCommit: (v) => { setLiveA(null); setLab((s) => L.setAlpha(s, v)); },
  });
  const scale = (S * 0.40) / (L.RADIUS.max / 100); // px par cm (étape du rayon)
  const radiusSt = useStretchInteraction({
    value: liveR ?? lab.radius, range: { min: L.RADIUS.min, max: L.RADIUS.max }, direction: 'ltr', pageStep: 50,
    toValue: (cx, cy, rect) => (Math.hypot(cx - (rect.left + rect.width / 2), cy - (rect.top + rect.height / 2)) / scale) * 100,
    onChange: (v) => setLiveR(v),
    onCommit: (v) => { setLiveR(null); setLab((s) => L.commitRadius(s, v)); },
  });
  const alpha = liveA ?? lab.alpha;
  const radius = liveR ?? lab.radius;

  return (
    <div ref={boxRef} className="space-y-2" data-polygon-forge data-mode={lab.mode} data-world={theme} data-stage={stage} data-solved={solved ? 'true' : 'false'} data-scene-s={S}>
      <div ref={glanceRef} className="space-y-1.5" data-pf-glance>
        {lab.mode === 'star' && <StageTabs lab={lab} setLab={setLab} m={m} blocking={blocking} />}
        <div ref={sceneRef} className="relative mx-auto overflow-hidden rounded-xl border border-slate-200 bg-white" style={{ width: S, height: S }}>
          {stage === 'forge' && <ForgeStage lab={lab} k={k} S={S} c={c} uid={uid} theme={theme} reduce={reduce} narrow={narrow} sceneRef={sceneRef} st={alphaSt} alpha={alpha} fromDeg={fromDeg} ended={ended} />}
          {stage === 'radius' && <RadiusStage lab={lab} k={k} S={S} c={c} scale={scale} st={radiusSt} h={radius} live={liveR != null} />}
          {stage === 'draw' && <DrawStage lab={lab} setLab={setLab} k={k} S={S} c={c} uid={uid} reduce={reduce} />}
        </div>
        {stage === 'forge' && <ForgeControls lab={lab} setLab={setLab} k={k} narrow={narrow} st={alphaSt} alpha={alpha} />}
        {stage === 'radius' && <RadiusControls lab={lab} setLab={setLab} k={k} narrow={narrow} st={radiusSt} h={radius} />}
        <Verdict lab={lab} setLab={setLab} k={k} m={m} narrow={narrow} blocking={blocking} />
      </div>

      {(lab.trials.length > 0 || lab.radiusTrials.length > 0) && (
        <LabFold id="polygon-forge.trials" title={k('trialsTitle')}>
          <ul className="flex flex-wrap gap-1.5 text-xs" data-pf-trials={lab.trials.length + lab.radiusTrials.length}>
            {lab.trials.map((tr) => (
              <li key={`t${tr.i}`} className={`rounded-lg border px-2 py-0.5 ${tr.outcome === 'closed' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`} data-pf-trial={tr.outcome}>
                <MathText>{k(`trial_${tr.outcome}`, { a: tr.alpha, name: tr.n ? k(`names.${tr.n}`) : '' })}</MathText>
              </li>
            ))}
            {lab.radiusTrials.slice(-8).map((tr, i) => (
              <li key={`r${i}`} className={`rounded-lg border px-2 py-0.5 ${tr.verdict === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`} data-pf-trial={`radius-${tr.verdict}`}>
                <MathText>{k('trial_radius', { r: tx(L.radiusText(tr.radius)), c: tx(tr.text) })}</MathText>
              </li>
            ))}
          </ul>
        </LabFold>
      )}
    </div>
  );
}

/* ════════════════════════════ 1. LES SOMMETS : tourner, appliquer la rotation ════════════════════════════ */

function ForgeStage({ lab, k, S, c, uid, theme, reduce, narrow, sceneRef, st, alpha, fromDeg }) {
  const rr = S * 0.34;
  const locked = L.canSetAlpha(lab) !== true;
  const P = L.vertexDegrees(lab).map((d) => at(c, rr, d));
  // l'image suivante (le fantôme) : depuis le dernier sommet ; après un tour terminé, le premier pas d'un nouveau tour
  const ghostDeg = fromDeg + alpha;
  const from = at(c, rr, fromDeg);
  const ghost = at(c, rr, ghostDeg);
  const n = L.closedN(lab);
  const closedTarget = lab.run === 'closed';

  const hp = st.handleProps({ label: k('handle'), valueText: k('handleText', { a: alpha }) });
  const onKeyDown = (e) => {
    if (locked) return;
    if (e.shiftKey && ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      st.set(alpha + (e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 10 : -10));
      return;
    }
    hp.onKeyDown(e);
  };

  // les arêtes : premier tour (indigo), au-delà de 360° (orange, pointillé — la figure ne se referme pas)
  const edges = [];
  for (let j = 1; j < P.length; j += 1) edges.push({ a: P[j - 1], b: P[j], lap2: j * lab.alpha > 360 });
  const fill = n ? (closedTarget ? (theme === 'flag-star' ? '#FDE68A' : '#FBBF24') : '#E2E8F0') : null;
  const arc = Math.abs(ghostDeg - fromDeg) > 0.5 ? centeredArc([c, c], from, ghost, 'ccw', { head: 10, labelOffset: 16 }) : null;
  const small = angleArc(from, [c, c], ghost, Math.min(30, rr * 0.3));

  return (
    <>
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} className="absolute inset-0" style={{ direction: 'ltr' }} role="img"
        aria-label={k('sceneCell', { k: lab.images, a: alpha })}>
        <defs>
          <radialGradient id={`pf-disc-${uid}`}><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor={theme === 'flag-star' ? '#ECFDF5' : '#FFFBEB'} /></radialGradient>
        </defs>
        {theme === 'flag-star' ? <TifoDeco S={S} reduce={reduce} done={false} /> : <HoneyDeco S={S} reduce={reduce} />}
        <circle cx={c} cy={c} r={rr + 14} fill={`url(#pf-disc-${uid})`} />
        <circle cx={c} cy={c} r={rr} fill="none" stroke="#94A3B8" strokeWidth={1.4} strokeDasharray="4 5" />
        {n && <polygon points={pts(P.slice(0, n))} fill={fill} opacity={0.75} stroke="none" data-pf-fill={closedTarget ? 'target' : 'other'} />}
        {closedTarget && theme !== 'flag-star' && <HoneyShine c={c} rr={rr} />}
        {edges.map((e, i) => (
          <line key={i} x1={e.a[0]} y1={e.a[1]} x2={e.b[0]} y2={e.b[1]} stroke={e.lap2 ? '#F59E0B' : '#4338CA'} strokeWidth={e.lap2 ? 2 : 3}
            strokeDasharray={e.lap2 ? '6 4' : undefined} strokeLinecap="round" />
        ))}
        {/* le dernier rayon et le rayon de l'image suivante : l'angle α au centre */}
        {(
          <g data-pf-wedge>
            <line x1={c} y1={c} x2={from[0]} y2={from[1]} stroke="#0F766E" strokeWidth={1.5} strokeDasharray="4 4" />
            <line x1={c} y1={c} x2={ghost[0]} y2={ghost[1]} stroke="#0F766E" strokeWidth={1.5} strokeDasharray="4 4" />
            <path d={small.path} fill="none" stroke="#0F766E" strokeWidth={2} />
            <text x={small.label[0]} y={small.label[1]} textAnchor="middle" fontSize={13} fontWeight={800} fill="#0F766E" stroke="#FFFFFF" strokeWidth={3} paintOrder="stroke" {...TP} data-pf-alpha-label={alpha}>{`${alpha}°`}</text>
            {arc && <path d={arc.path} fill="none" stroke="#0F766E" strokeWidth={2} opacity={0.75} />}
            {arc && <polygon points={pts(arc.arrow)} fill="#0F766E" opacity={0.75} />}
          </g>
        )}
        <circle cx={c} cy={c} r={4} fill="#0F172A" />
        <text x={c + 7} y={c + 16} fontSize={13} fontWeight={800} fill="#0F172A" {...TP}>O</text>
        {P.map((p, j) => (
          <circle key={j} cx={p[0]} cy={p[1]} r={j === 0 ? 6.5 : 5} fill={j === 0 ? '#E11D48' : (j * lab.alpha > 360 ? '#F59E0B' : '#4338CA')} stroke="#FFFFFF" strokeWidth={1.6}
            className={reduce || j === 0 ? undefined : 'pf-pop'} data-pf-vertex={j} />
        ))}
        <text x={P[0][0] + 9} y={P[0][1] - 9} fontSize={14} fontWeight={800} fill="#BE123C" {...TP}>A</text>
        <style>{'@keyframes pf-pop{from{transform-box:fill-box;transform-origin:center;transform:scale(.2)}to{transform-box:fill-box;transform-origin:center;transform:scale(1)}}.pf-pop{animation:pf-pop .35s ease-out}@media (prefers-reduced-motion: reduce){.pf-pop{animation:none}}'}</style>
      </svg>
      {/* la piste : toute la scène (le cadran) ; la poignée : l'image suivante, sur le cercle */}
      <div {...(locked ? {} : st.trackProps)} className="absolute inset-0" style={locked ? undefined : st.trackProps.style} data-pf-track>
        <div {...hp} onKeyDown={onKeyDown} aria-disabled={locked ? 'true' : undefined} data-pf-handle={alpha}
          className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 outline-none focus-visible:ring-4 focus-visible:ring-teal-300 ${locked ? 'border-slate-300 bg-white/60' : 'border-teal-600 bg-white/85'}`}
          style={{ left: ghost[0], top: ghost[1], cursor: locked ? 'not-allowed' : st.dragging ? 'grabbing' : 'grab' }}>
          <span aria-hidden="true" className={`block h-3.5 w-3.5 rounded-full ${locked ? 'bg-slate-300' : 'bg-teal-600'}`} />
        </div>
      </div>
      {!narrow && (
        <MovablePanel id="polygon-forge.counter" bounds={sceneRef} title={k('counterTitle')} className="absolute left-1 top-1 z-10">
          <Counter lab={lab} alpha={lab.alpha} k={k} />
        </MovablePanel>
      )}
    </>
  );
}

function Counter({ lab, alpha, k, inline = false }) {
  const total = lab.images * alpha;
  const frac = Math.min(1, total / 360);
  return (
    <div className={`${inline ? 'inline-flex items-center gap-2' : 'space-y-1'} rounded-xl border-2 border-slate-800 bg-slate-900/95 px-2 py-1 text-xs text-white shadow`} data-pf-counter={total}>
      <p className="flex items-center gap-1.5"><span className="text-teal-300">{k('counterImages')}</span>
        {/* UNE île LTR isolée (« N × M = P » s'inverse dans une ligne RTL) */}
        <span dir="ltr" className="sa-math-inline inline-block font-mono font-bold" style={{ direction: 'ltr', unicodeBidi: 'isolate' }} data-pf-counter-formula>{`${lab.images} × ${alpha}° = ${total}°`}</span></p>
      {!inline && (
        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-700" aria-hidden="true">
          <div className={`h-full ${total > 360 ? 'bg-amber-400' : total === 360 ? 'bg-emerald-400' : 'bg-teal-400'}`} style={{ width: `${frac * 100}%` }} />
        </div>
      )}
    </div>
  );
}

function ForgeControls({ lab, setLab, k, narrow, st, alpha }) {
  const locked = L.canSetAlpha(lab) !== true;
  const set = (d) => st.set(alpha + d);
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <div className="flex items-center gap-1.5" dir="ltr">
          <button type="button" onClick={() => set(-1)} disabled={locked || alpha <= L.ALPHA.min} aria-label={k('less')} data-pf-less className={`${btn} border-teal-300 focus-visible:ring-teal-500`}><Minus className="h-4 w-4" aria-hidden="true" /></button>
          <span className="min-w-[5.5rem] rounded-full bg-teal-100 px-2 py-1 text-center font-mono text-sm font-extrabold text-teal-900" data-pf-alpha={alpha}>
            <MathText>{`$\\alpha = ${alpha}^{\\circ}$`}</MathText>
          </span>
          <button type="button" onClick={() => set(1)} disabled={locked || alpha >= L.ALPHA.max} aria-label={k('more')} data-pf-more className={`${btn} border-teal-300 focus-visible:ring-teal-500`}><Plus className="h-4 w-4" aria-hidden="true" /></button>
        </div>
        <button type="button" onClick={() => { st.flush(); setLab(L.turn); }} disabled={L.canTurn(lab) !== true} data-pf-turn
          className="inline-flex h-11 items-center gap-1.5 rounded-xl border-2 border-indigo-700 bg-indigo-600 px-4 text-sm font-extrabold text-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> {k('turn')}
        </button>
        {lab.images > 0 && (
          <button type="button" onClick={() => setLab(L.release)} data-pf-release className={`${btn} gap-1 border-slate-300 text-sm font-bold text-slate-700 focus-visible:ring-slate-400`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('release')}
          </button>
        )}
      </div>
      {narrow && <div className="flex justify-center"><Counter lab={lab} alpha={lab.alpha} k={k} inline /></div>}
    </div>
  );
}

/* ════════════════════════════ 2. LE RAYON (متقدم) : deux pointes à 10 cm ════════════════════════════ */

function RadiusStage({ lab, k, S, c, scale, st, h, live }) {
  const R = (h / 100) * scale;
  const n = lab.target;
  const tips = Array.from({ length: n }, (_, j) => at(c, R, L.START_DEG + (j * 360) / n));
  const A = tips[0]; const B = tips[1];
  const H = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  const chord = L.chordText(lab, h);
  const sn = L.starNumbers(lab);
  const hp = st.handleProps({ label: k('rHandle'), valueText: k('rHandleText', { r: L.radiusText(h) }) });
  const onKeyDown = (e) => {
    if (e.shiftKey && ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      st.set(h + (e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 10 : -10));
      return;
    }
    hp.onKeyDown(e);
  };
  const ok = lab.radiusOk && !live && lab.last?.kind === 'radius' && lab.last.verdict === 'ok';
  const sq = rightAngleSquare(A, H, [c, c], 9);
  const ang = angleArc(A, [c, c], H, Math.min(28, R * 0.35));
  return (
    <>
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} className="absolute inset-0" style={{ direction: 'ltr' }} role="img"
        aria-label={k('sceneRadius', { r: L.radiusText(h), c: chord })}>
        <TifoDeco S={S} reduce done={false} quiet />
        <circle cx={c} cy={c} r={R + 10} fill="#FFFFFF" opacity={0.9} />
        <circle cx={c} cy={c} r={R} fill="none" stroke="#94A3B8" strokeWidth={1.4} strokeDasharray="4 5" />
        <polygon points={pts(tips)} fill="none" stroke="#4338CA" strokeWidth={1.4} strokeDasharray="5 4" opacity={0.6} />
        {/* le triangle OHA, rectangle en H : sin(36°) = AH / OA */}
        <polygon points={pts([[c, c], H, A])} fill="#CCFBF1" opacity={0.6} />
        <line x1={c} y1={c} x2={A[0]} y2={A[1]} stroke="#0F766E" strokeWidth={2} />
        <line x1={c} y1={c} x2={H[0]} y2={H[1]} stroke="#0F766E" strokeWidth={1.5} strokeDasharray="4 4" />
        <polyline points={pts(sq)} fill="none" stroke="#0F766E" strokeWidth={1.3} />
        <path d={ang.path} fill="none" stroke="#0F766E" strokeWidth={1.6} />
        <text x={ang.label[0]} y={ang.label[1]} textAnchor="middle" fontSize={12} fontWeight={800} fill="#0F766E" stroke="#FFFFFF" strokeWidth={3} paintOrder="stroke" {...TP}>{`${sn.half.replace('^\\circ', '')}°`}</text>
        <text x={(c + A[0]) / 2 + 8} y={(c + A[1]) / 2} fontSize={13} fontWeight={800} fill="#0F766E" stroke="#FFFFFF" strokeWidth={3} paintOrder="stroke" {...TP}>R</text>
        {/* la corde mesurée : deux pointes consécutives */}
        <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={ok ? '#059669' : '#E11D48'} strokeWidth={3.5} strokeLinecap="round" data-pf-chord={chord} />
        <text x={(A[0] + B[0]) / 2 - 10} y={(A[1] + B[1]) / 2 - 10} textAnchor="end" fontSize={13} fontWeight={800} fill={ok ? '#047857' : '#BE123C'} stroke="#FFFFFF" strokeWidth={3} paintOrder="stroke" {...TP}>{`AB ≈ ${chord} cm`}</text>
        {tips.map((p, j) => <circle key={j} cx={p[0]} cy={p[1]} r={4.5} fill="#4338CA" stroke="#FFFFFF" strokeWidth={1.2} />)}
        <circle cx={H[0]} cy={H[1]} r={3} fill="#0F766E" />
        <text x={H[0] - 6} y={H[1] + 14} textAnchor="end" fontSize={12} fontWeight={800} fill="#0F766E" {...TP}>H</text>
        <text x={B[0] - 8} y={B[1] + 4} textAnchor="end" fontSize={13} fontWeight={800} fill="#0F172A" {...TP}>B</text>
        <circle cx={c} cy={c} r={4} fill="#0F172A" />
        <text x={c + 7} y={c + 16} fontSize={13} fontWeight={800} fill="#0F172A" {...TP}>O</text>
      </svg>
      <div {...st.trackProps} className="absolute inset-0" style={st.trackProps.style} data-pf-rtrack>
        <div {...hp} onKeyDown={onKeyDown} data-pf-rhandle={h}
          className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-rose-600 bg-white/85 outline-none focus-visible:ring-4 focus-visible:ring-rose-300"
          style={{ left: A[0], top: A[1], cursor: st.dragging ? 'grabbing' : 'grab' }}>
          <span aria-hidden="true" className="text-sm font-black text-rose-700" {...TP}>A</span>
        </div>
      </div>
    </>
  );
}

function RadiusControls({ setLab, k, narrow, st, h }) {
  const [txt, setTxt] = useState('');
  const [bad, setBad] = useState(false);
  const nudge = (d) => st.set(h + d);
  const submit = (e) => {
    e.preventDefault();
    const v = parseDec(txt);
    if (!Number.isFinite(v)) { setBad(true); return; }
    setBad(false);
    st.flush();
    setLab((s) => L.commitRadius(s, Math.round(v * 100)));
  };
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <div className="flex items-center gap-1.5" dir="ltr">
        <button type="button" onClick={() => nudge(-1)} disabled={h <= L.RADIUS.min} aria-label={k('rLess')} data-pf-rless className={`${btn} border-rose-300 focus-visible:ring-rose-500`}><Minus className="h-4 w-4" aria-hidden="true" /></button>
        <span className="min-w-[6.5rem] rounded-full bg-rose-100 px-2 py-1 text-center font-mono text-sm font-extrabold text-rose-900" data-pf-radius={h}>
          <MathText>{`$R = ${tx(L.radiusText(h))}\\,\\mathrm{cm}$`}</MathText>
        </span>
        <button type="button" onClick={() => nudge(1)} disabled={h >= L.RADIUS.max} aria-label={k('rMore')} data-pf-rmore className={`${btn} border-rose-300 focus-visible:ring-rose-500`}><Plus className="h-4 w-4" aria-hidden="true" /></button>
      </div>
      <form onSubmit={submit} className="flex items-center gap-1.5">
        <input value={txt} onChange={(e) => { setTxt(e.target.value); setBad(false); }} inputMode="decimal" dir="ltr" aria-label={k('rInput')} placeholder="R"
          aria-invalid={bad ? 'true' : undefined} title={bad ? k('rBad') : undefined} data-pf-rinput
          className={`h-11 ${narrow ? 'w-20' : 'w-24'} rounded-xl border-2 px-2 text-center font-mono text-sm ${bad ? 'border-rose-500' : 'border-slate-300'} focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400`} />
        <button type="submit" data-pf-rset className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 border-rose-700 bg-rose-600 px-3 text-sm font-extrabold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">{k('rSet')}</button>
      </form>
    </div>
  );
}

/* ════════════════════════════ 3. LES BRANCHES (متقدم) : un sommet sur deux ════════════════════════════ */

function DrawStage({ lab, setLab, k, S, c, reduce }) {
  const sn = L.starNumbers(lab);
  const R = S * 0.36;
  const n = lab.target;
  const tips = Array.from({ length: n }, (_, j) => at(c, R, L.START_DEG + (j * 360) / n));
  const done = L.starDone(lab);
  const order = Array.from({ length: n }, (_, j) => (j * lab.starStep) % n);
  return (
    <>
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} className="absolute inset-0" style={{ direction: 'ltr' }} role="img"
        aria-label={k('sceneDraw', { count: lab.strokes.length })}>
        <TifoDeco S={S} reduce={reduce} done={done} />
        <circle cx={c} cy={c} r={R + 12} fill="#FFFFFF" opacity={0.92} />
        <circle cx={c} cy={c} r={R} fill="none" stroke="#94A3B8" strokeWidth={1.2} strokeDasharray="4 5" />
        <polygon points={pts(tips)} fill="none" stroke="#4338CA" strokeWidth={1.2} strokeDasharray="5 4" opacity={0.5} />
        {done && <polygon points={pts(order.map((j) => tips[j]))} fill={RED} fillRule="nonzero" stroke={RED} strokeWidth={2} data-pf-star-fill className={reduce ? undefined : 'pf-glow'} />}
        {lab.strokes.map((s) => {
          const [a, b] = s.split('-').map(Number);
          return <line key={s} x1={tips[a][0]} y1={tips[a][1]} x2={tips[b][0]} y2={tips[b][1]} stroke={RED} strokeWidth={4} strokeLinecap="round" data-pf-stroke={s} />;
        })}
        {done && (() => {
          const a = angleArc(tips[n - lab.starStep], tips[0], tips[lab.starStep], Math.max(18, R * 0.22));
          return (
            <g data-pf-tip-angle={sn.tipAngle}>
              <path d={a.path} fill="none" stroke="#FFFFFF" strokeWidth={2} />
              <text x={a.label[0]} y={a.label[1] + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill="#FFFFFF" {...TP}>{`${sn.tipAngle}°`}</text>
            </g>
          );
        })()}
        <circle cx={c} cy={c} r={3} fill="#0F172A" opacity={done ? 0 : 1} />
        <style>{'@keyframes pf-glow{from{opacity:.4}to{opacity:1}}.pf-glow{animation:pf-glow .6s ease-out}@media (prefers-reduced-motion: reduce){.pf-glow{animation:none}}'}</style>
      </svg>
      {tips.map((p, j) => {
        const pen = lab.pen === j && !done;
        const lab2 = at(c, R + 26, L.START_DEG + (j * 360) / n);
        return (
          <React.Fragment key={j}>
            <button type="button" onClick={() => setLab((s) => L.tapTip(s, j))} aria-label={pen ? k('pen', { name: TIP_NAMES[j] }) : k('tip', { name: TIP_NAMES[j] })}
              aria-pressed={pen ? 'true' : 'false'} data-pf-tip={j} disabled={done}
              className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 ${pen ? 'border-rose-600 bg-rose-100' : 'border-indigo-400 bg-white/80'}`}
              style={{ left: p[0], top: p[1] }}>
              <span aria-hidden="true" className={`block h-3 w-3 rounded-full ${pen ? 'bg-rose-600' : 'bg-indigo-600'}`} />
            </button>
            <span aria-hidden="true" className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-900" style={{ left: lab2[0], top: lab2[1], ...TP.style, fontFamily: TP.fontFamily }}>{TIP_NAMES[j]}</span>
          </React.Fragment>
        );
      })}
    </>
  );
}

/* ════════════════════════════ les étapes (متقدم), le verdict, les lectures ════════════════════════════ */

function StageTabs({ lab, setLab, m, blocking = false }) {
  const reach = { forge: true, radius: !blocking && L.canOpenRadius(lab), draw: !blocking && L.canOpenDraw(lab) };
  return (
    <div role="group" aria-label={m('stages')} className="mx-auto grid max-w-md grid-cols-3 gap-1">
      {['forge', 'radius', 'draw'].map((id, i) => (
        <button key={id} type="button" disabled={!reach[id]} onClick={() => setLab((s) => L.goStage(s, id))} aria-current={lab.stage === id ? 'step' : undefined}
          data-pf-stage-tab={id}
          className={`min-h-[44px] rounded-xl border-2 px-1 font-extrabold leading-tight disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-sm ${lab.stage === id ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-emerald-200 bg-white text-emerald-900'}`}>
          <span className="me-1 inline-block rounded-full bg-black/10 px-1.5 font-mono">{i + 1}</span>{m(`stage_${id}`)}
        </button>
      ))}
    </div>
  );
}

function Verdict({ lab, setLab, k, m, narrow, blocking = false }) {
  const e = lab.last;
  const name = (n) => k(`names.${n}`);
  let kind = 'start';
  let text = null;
  let next = null;
  let readings = null;
  if (lab.stage === 'forge') {
    const a = lab.alpha;
    kind = e?.kind && ['closed', 'other', 'flat', 'open', 'star', 'spiral', 'turn', 'alpha'].includes(e.kind) ? e.kind : 'start';
    if (kind === 'turn') kind = e.total > 360 ? 'lap' : 'turn';
    switch (kind) {
      case 'turn': text = k('vTurn', { k: e.k, a: e.alpha, t: e.total, left: 360 - e.total }); break;
      case 'lap': text = k('vLap', { k: e.k, a: e.alpha, t: e.total }); break;
      case 'closed': text = k('vClosed', { k: e.k, a: e.alpha, name: name(e.n) }); break;
      case 'other': text = k('vOther', { k: e.k, a: e.alpha, name: name(e.n), wanted: k(`wanted.${lab.mode}`) }); break;
      case 'flat': text = k('vFlat'); break;
      case 'open': text = k('vOpen', { p: e.k - 1, pt: (e.k - 1) * e.alpha, k: e.k, t: e.total, a: e.alpha, q: tx(L.quotientText(e.alpha)) }); break;
      case 'star': text = k('vStar', { k: e.k, a: e.alpha }); break;
      case 'spiral': text = k('vSpiral', { a: e.alpha, q: tx(L.quotientText(e.alpha)) }); break;
      case 'alpha': text = k('vAlpha', { a }); break;
      default: text = k('vStart', { a });
    }
    const n = L.closedN(lab);
    if (n) {
      const rd = L.readings(n, lab.mode === 'cell' ? lab.r : null);
      readings = (
        <div className={`flex flex-wrap justify-center gap-1.5 ${narrow ? 'text-[11px]' : 'text-xs'}`} data-pf-readings={n}>
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-bold text-indigo-900">{k('readCentral')} <MathText>{`$${rd.central}$`}</MathText></span>
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-bold text-indigo-900">{k('readInterior')} <MathText>{`$180^\\circ - ${lab.alpha}^\\circ = ${rd.interior}$`}</MathText></span>
          {rd.sideText && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 font-bold text-amber-900" data-pf-side={rd.sideExact ?? rd.sideText}>
              {k('readSide')}: <MathText>{rd.sideExact ? `$${rd.sideExact}\\,\\mathrm{cm}$` : `$${tx(rd.sideText)}\\,\\mathrm{cm}$`}</MathText>
              {!rd.sideExact && <> {k('approx')}</>}
              {rd.sideIsRadius && <> {k('isRadius')}</>}
            </span>
          )}
        </div>
      );
    }
    if (lab.mode === 'star' && lab.run === 'closed') next = { label: m('toRadius'), card: m('foundCard', { a: lab.alpha }), go: 'radius' };
  } else if (lab.stage === 'radius') {
    const sn = L.starNumbers(lab);
    kind = e?.kind === 'radius' ? `radius-${e.verdict}` : 'radius-start';
    if (e?.kind === 'radius') {
      const o = { r: tx(L.radiusText(e.radius)), c: tx(e.text) };
      text = e.verdict === 'ok' ? k('vROk', o) : e.verdict === 'short' ? k('vRShort', o) : k('vRLong', o);
    } else text = k('vRStart');
    readings = <p className={`text-center ${narrow ? 'text-[11px]' : 'text-xs'} text-teal-900`} data-pf-triangle><MathText>{k('triangle', { h: tx(sn.halfTip.replace(',00', '')), half: sn.half })}</MathText></p>;
    if (lab.radiusOk && e?.kind === 'radius' && e.verdict === 'ok') next = { label: m('toDraw'), card: m('radiusCard'), go: 'draw' };
  } else {
    const sn = L.starNumbers(lab);
    if (L.starDone(lab)) { kind = 'star-done'; text = k('vDDone', { b: tx(sn.branchText), t: sn.tipAngle }); } else if (e?.kind === 'refuse') {
      kind = `refuse-${e.reason}`;
      text = e.reason === 'side' ? k('vDSide', { a: TIP_NAMES[e.from], b: TIP_NAMES[e.to] }) : e.reason === 'again' ? k('vDAgain') : k('vDSkip');
    } else if (e?.kind === 'stroke') { kind = 'stroke'; text = k('vDStroke', { count: e.count, b: TIP_NAMES[e.to] }); } else { kind = 'draw-start'; text = k('vDStart'); }
  }
  const tone = /closed|ok|done|stroke/.test(kind) ? 'text-emerald-800' : /open|spiral|flat|other|star$|short|long|refuse/.test(kind) ? 'text-amber-800' : 'text-slate-700';
  return (
    <div className="space-y-1">
      <p role="status" className={`min-h-[2.5rem] ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug ${tone}`} data-pf-verdict={kind} data-pf-run={lab.run ?? 'none'}>
        <MathText>{text}</MathText>
      </p>
      {readings}
      {next && !blocking && (
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border-2 border-emerald-300 bg-emerald-50 px-2 py-1" data-pf-next-card={next.go}>
          <span className={`${narrow ? 'text-[11px]' : 'text-xs'} font-semibold text-emerald-900`}><MathText>{next.card}</MathText></span>
          <button type="button" onClick={() => setLab((s) => L.goStage(s, next.go))} data-pf-next={next.go}
            className="h-11 rounded-xl border-2 border-emerald-700 bg-emerald-600 px-3 text-sm font-extrabold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
            {next.label}
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════ les décors (aria-hidden, sans information) ════════════════════════════ */

/** Un petit drapeau qui flotte dans le coin quand l'étoile est tracée (décor : aucune mesure). */
function MiniFlag({ x, y, w }) {
  const id = useId().replace(/:/g, '');
  const h = (w * 2) / 3;
  return (
    <g transform={`translate(${x}, ${y})`} data-deco="mini-flag">
      <defs><mask id={`pf-cr-${id}`}><rect x={0} y={0} width={w} height={h} fill="#FFFFFF" /><circle cx={w * 0.537} cy={h / 2} r={h * 0.2} fill="#000000" /></mask></defs>
      <rect x={0} y={0} width={w / 2} height={h} fill="#006233" />
      <rect x={w / 2} y={0} width={w / 2} height={h} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={0.5} />
      <circle cx={w * 0.487} cy={h / 2} r={h * 0.25} fill={RED} mask={`url(#pf-cr-${id})`} />
      <circle cx={w * 0.587} cy={h / 2} r={h * 0.09} fill={RED} />
    </g>
  );
}

/** Une alvéole décorative (hexagone pâle) centrée en (x, y). */
const hexPts = (x, y, s) => Array.from({ length: 6 }, (_, j) => [x + s * Math.cos((Math.PI / 3) * j), y + s * Math.sin((Math.PI / 3) * j)]);

/** La ruche de Kabylie : des alvéoles pâles dans les coins, une ruche en liège, des abeilles qui s'envolent au toucher. */
function HoneyDeco({ S, reduce }) {
  const [flown, setFlown] = useState(0);
  const s = Math.max(10, S * 0.045);
  const cells = [];
  for (const [cx, cy] of [[0, 0], [S, 0], [0, S], [S, S]]) {
    for (let i = 0; i < 3; i += 1) for (let j = 0; j < 3; j += 1) {
      const x = cx + (cx ? -1 : 1) * (s * 1.5 * i + s);
      const y = cy + (cy ? -1 : 1) * (s * Math.sqrt(3) * j + (i % 2 ? s * 0.87 : 0) + s);
      if (i + j < 4) cells.push([x, y]);
    }
  }
  return (
    <g data-deco="honeycomb" aria-hidden="true">
      <style>{'.pf-bee{transition:transform 1s ease-out}@media (prefers-reduced-motion: reduce){.pf-bee{transition:none}}'}</style>
      {cells.map(([x, y], i) => <polygon key={i} points={pts(hexPts(x, y, s))} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={1} opacity={0.55} />)}
      {/* la ruche en liège (taɛṣṣalt) posée dans le coin */}
      <g transform={`translate(${S - s * 3.2}, ${S - s * 1.9})`}>
        <rect x={0} y={0} width={s * 2.8} height={s * 1.5} rx={s * 0.7} fill="#A16207" stroke="#713F12" strokeWidth={1} />
        {[0.7, 1.4, 2.1].map((f) => <line key={f} x1={s * f} y1={2} x2={s * f} y2={s * 1.5 - 2} stroke="#713F12" strokeWidth={0.8} />)}
        <circle cx={s * 0.25} cy={s * 0.75} r={s * 0.2} fill="#422006" />
      </g>
      <g className={reduce ? undefined : 'pf-bee'} style={{ transform: flown % 2 ? `translate(${-S * 0.08}px, ${S * 0.05}px)` : 'none', cursor: 'pointer' }} onClick={() => setFlown((n) => n + 1)} tabIndex={-1}>
        {[[S * 0.83, S * 0.2], [S * 0.16, S * 0.78]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x}, ${y})`}>
            <ellipse cx={-3} cy={-6} rx={5} ry={3.5} fill="#E0F2FE" opacity={0.9} />
            <ellipse cx={3} cy={-6} rx={5} ry={3.5} fill="#E0F2FE" opacity={0.9} />
            <ellipse cx={0} cy={0} rx={8} ry={5} fill="#FACC15" stroke="#1C1917" strokeWidth={1} />
            <line x1={-2} y1={-5} x2={-2} y2={5} stroke="#1C1917" strokeWidth={2} />
            <line x1={3} y1={-4.5} x2={3} y2={4.5} stroke="#1C1917" strokeWidth={2} />
          </g>
        ))}
      </g>
    </g>
  );
}

/** Le miel qui brille dans l'alvéole fermée (seulement quand l'hexagone est fermé). */
function HoneyShine({ c, rr }) {
  return (
    <g aria-hidden="true" data-deco="honey">
      <ellipse cx={c - rr * 0.25} cy={c - rr * 0.3} rx={rr * 0.22} ry={rr * 0.1} fill="#FFFFFF" opacity={0.45} />
      <circle cx={c + rr * 0.2} cy={c + rr * 0.25} r={rr * 0.05} fill="#FFFFFF" opacity={0.35} />
    </g>
  );
}

/** La tribune du tifo : moitié verte, moitié blanche, supporters, un fumigène qu'on allume ; le croissant quand l'étoile est tracée. */
function TifoDeco({ S, reduce, done, quiet = false }) {
  const [flare, setFlare] = useState(0);
  return (
    <g data-deco="flag-star" aria-hidden="true">
      <style>{'.pf-smoke{transition:opacity .8s ease-out}@media (prefers-reduced-motion: reduce){.pf-smoke{transition:none}}'}</style>
      <rect x={0} y={0} width={S / 2} height={S} fill="#006233" opacity={quiet ? 0.18 : 0.32} />
      <rect x={S / 2} y={0} width={S / 2} height={S} fill="#FFFFFF" />
      {/* les cartons du tifo */}
      {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={(S / 9) * i} y1={0} x2={(S / 9) * i} y2={S} stroke="#064E3B" strokeWidth={0.4} opacity={0.18} />)}
      {Array.from({ length: 9 }, (_, i) => <line key={`h${i}`} x1={0} y1={(S / 9) * i} x2={S} y2={(S / 9) * i} stroke="#064E3B" strokeWidth={0.4} opacity={0.18} />)}
      {/* les supporters au bas des gradins */}
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i} transform={`translate(${S * 0.04 + i * S * 0.035}, ${S - 8})`}>
          <circle cx={0} cy={-6} r={4} fill={i % 2 ? '#7C2D12' : '#422006'} />
          <rect x={-4.5} y={-2} width={9} height={10} rx={2} fill={i % 3 === 0 ? '#16A34A' : i % 3 === 1 ? '#FFFFFF' : RED} stroke="#334155" strokeWidth={0.5} />
        </g>
      ))}
      <g style={{ cursor: 'pointer' }} onClick={() => setFlare((n) => n + 1)} tabIndex={-1}>
        <rect x={S - 22} y={S - 24} width={5} height={14} fill="#334155" />
        <circle cx={S - 19.5} cy={S - 27} r={4} fill={RED} />
        <g className={reduce ? undefined : 'pf-smoke'} opacity={flare % 2 ? 0.8 : 0}>
          {[0, 1, 2].map((i) => <circle key={i} cx={S - 19 - i * 7} cy={S - 36 - i * 9} r={6 + i * 3} fill="#FCA5A5" />)}
        </g>
      </g>
      {done && <MiniFlag x={6} y={6} w={Math.max(48, S * 0.16)} />}
    </g>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/**
 * La suite de questions de l'étape `id`. مبتدئ : la forge (images · somme), le contraste (quotient · règle). متقدم : la forge (images · somme),
 * le rayon (demi-angle · rapport), les branches (sauts · règle).
 */
export function chainOf(mode, id) {
  if (id === 'forge') return ['count', 'sum'];
  if (id === 'contrast') return ['open', 'rule'];
  if (id === 'radius') return ['half', 'trig'];
  return ['skip', 'rule'];
}

const $ = (x) => `$${x}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;

/** Chaque question est construite sur LES nombres de l'élève (rien n'est écrit en dur) ; `k` : les textes de `polygonForge`. */
export const QUESTIONS = {
  count: ({ lab }, k) => {
    const tr = L.closedTrial(lab);
    const beta = L.otherAlpha(tr.alpha);
    const o = { n: tr.k, a: tr.alpha, b: beta, calc: $(`360 \\div ${beta}`) };
    return {
      id: 'count', kind: 'number', expected: String(360 / beta), answer: <MathText>{$(360 / beta)}</MathText>,
      prompt: Cq(k, 'count.prompt', o), hints: [Cq(k, 'count.hint1', o), Cq(k, 'count.hint2', o)], explain: Cq(k, 'count.explain', o),
    };
  },
  sum: ({ lab }, k) => {
    const tr = L.closedTrial(lab);
    const o = { n: tr.k, a: tr.alpha, half: tr.alpha * tr.k / 2, twice: tr.alpha * tr.k * 2, total: tr.alpha * tr.k };
    return {
      id: 'sum', kind: 'choice', cols: 1, prompt: Cq(k, 'sum.prompt', o),
      options: [
        { text: Cq(k, 'sum.half', o), why: Cq(k, 'sum.whyHalf', o) },
        { text: Cq(k, 'sum.full', o), correct: true },
        { text: Cq(k, 'sum.twice', o), why: Cq(k, 'sum.whyTwice', o) },
      ],
      hints: [Cq(k, 'sum.hint1', o), Cq(k, 'sum.hint2', o)], explain: Cq(k, 'sum.explain', o),
    };
  },
  open: ({ lab }, k) => {
    const tr = L.lastOpenTrial(lab);
    const q = Number((360 / tr.alpha).toFixed(2));
    const o = { a: tr.alpha, q: String(q).replace('.', ','), name: tr.n ? k(`names.${tr.n}`) : '' };
    return {
      id: 'open', kind: 'number', expected: String(q), answer: <MathText>{$(String(q).replace('.', '{,}'))}</MathText>,
      prompt: Cq(k, 'open.prompt', o), hints: [Cq(k, 'open.hint1', o), Cq(k, 'open.hint2', o)], explain: Cq(k, Number.isInteger(q) ? 'open.explainWhole' : 'open.explain', o),
    };
  },
  half: ({ lab }, k) => {
    const sn = L.starNumbers(lab);
    const o = { n: lab.target, a: lab.found, half: lab.found / 2, d: String(lab.tip).replace('.', ','), h: String(lab.tip / 2).replace('.', ',') };
    return {
      id: 'half', kind: 'number', expected: String(360 / lab.target / 2), answer: <MathText>{$(`${360 / lab.target / 2}^{\\circ}`)}</MathText>,
      prompt: Cq(k, 'half.prompt', { ...o, R: String(sn.RText).replace('.', ',') }), hints: [Cq(k, 'half.hint1', o), Cq(k, 'half.hint2', o)], explain: Cq(k, 'half.explain', o),
    };
  },
  trig: ({ lab }, k) => {
    const sn = L.starNumbers(lab);
    const o = { half: 360 / lab.target / 2, h: String(lab.tip / 2).replace('.', ','), R: String(sn.RText).replace('.', ',') };
    return {
      id: 'trig', kind: 'choice', cols: 1, prompt: Cq(k, 'trig.prompt', o),
      options: [
        { text: Cq(k, 'trig.sin', o), correct: true },
        { text: Cq(k, 'trig.cos', o), why: Cq(k, 'trig.whyCos', o) },
        { text: Cq(k, 'trig.tan', o), why: Cq(k, 'trig.whyTan', o) },
      ],
      hints: [Cq(k, 'trig.hint1', o), Cq(k, 'trig.hint2', o)], explain: Cq(k, 'trig.explain', o),
    };
  },
  skip: ({ lab }, k) => {
    const o = { n: lab.target, a: lab.found, two: lab.found * 2 };
    return {
      id: 'skip', kind: 'choice', cols: 1, prompt: Cq(k, 'skip.prompt', o),
      options: [
        { text: Cq(k, 'skip.one', o), why: Cq(k, 'skip.whyOne', o) },
        { text: Cq(k, 'skip.two', o), correct: true },
        { text: Cq(k, 'skip.three', o), why: Cq(k, 'skip.whyThree', o) },
      ],
      hints: [Cq(k, 'skip.hint1', o), Cq(k, 'skip.hint2', o)], explain: Cq(k, 'skip.explain', o),
    };
  },
  rule: ({ lab, options, formal }, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k(`${lab.mode}.dPrompt`)}</MathText>, options,
    hints: [Cq(k, `rule.${lab.mode}.hint1`), Cq(k, `rule.${lab.mode}.hint2`)], explain: formal,
  }),
};
