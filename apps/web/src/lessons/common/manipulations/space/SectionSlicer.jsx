import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Group } from 'three';
import * as linear from '@smarter-academy/core/arithmetic/linear.js';
import { Minus, Plus, Printer, Check, X, Undo2 } from 'lucide-react';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { spread } from './spaceCp';
import MathText from '../../components/MathText';
import SpaceFigure from '../../components/SpaceFigure';
import Stage3D, { prefersReducedMotion } from './stage3d/Stage3D';
import { toThree } from './stage3d/spaceStage';
import * as K from './stage3d/solids3d';
import * as L from '../logic/sectionSlicer';

/**
 * section-slicer — LA TRANCHEUSE / L'IMPRIMANTE 3D (unité 14 « الهندسة في الفضاء », درس « المقاطع المستوية للمجسمات
 * المألوفة », manuel pp. 164–169 : نشاط 2, 3, 4, 5 ; معارف 3 ; طرائق ص 169).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève TIENT LE PLAN DE COUPE : il fait glisser la buse de l'imprimante (dans la scène 3D, le long d'une droite de la
 *    mathématique — l'axe [NS], l'arête [DC], la perpendiculaire à l'axe) ou le rail du bord de la scène (doigt, −/+, flèches,
 *    Maj = grand pas) ; puis il appuie « اطبع الطبقة » et PRÉDIT la couche (trois cartes) avant que la buse ne l'imprime.
 * B. Idée : une couche imprimée est une SECTION PLANE ; la section d'une sphère par un plan à la distance h du centre est un
 *    cercle de rayon √(R² − h²) (Pythagore dans OAM), un point si h = R, rien si h > R ; celle d'un pavé par un plan parallèle
 *    à une face / à une arête un rectangle ; celle d'un cylindre un cercle (parallèle à la base) ou un rectangle (parallèle à
 *    l'axe) ; celle d'une pyramide parallèle à la base une RÉDUCTION de la base, de rapport k = SE/SA.
 * C. Le plan translucide monte / glisse dans le solide de verre ; la couche réelle s'imprime (disque + anneau, rectangle,
 *    carré) dans la couleur du filament ; les couches imprimées RESTENT : la sphère se construit couche par couche et les
 *    rayons rétrécissent vers les pôles ; la prédiction fausse reste dessinée en pointillés (« couche fantôme »).
 * D. r = √(R² − h²) exact (et décimal), le triangle OAM rectangle en A dans la scène ; 20 × 6 = 120 ; MN = √(CM² + CN²) ;
 *    KI = 2√(r² − d²) ; EF = k·AB, EG = k·AC ; les cas h = 0 (دائرة كبرى), h = R (مماس), h > R.
 * E. Avant la règle : un grand cercle (h = 0), un petit cercle (0 < h < R) ET le contact ou rien (h ≥ R) — le contraste.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        une couche = une section plane ; sphère : r² = R² − h²
 *   OBJECT         l'imprimante 3D du fablab du lycée : sa buse, son plan de travail, le solide de verre qu'elle construit
 *   VARIABLE       h (مبتدئ : au cm de 0 à R + 1 ; متقدم : x = OI au vingtième, les cinq x du نشاط 2 exacts) ; DI ; CM ; la hauteur
 *                  O′B ; OH = d ; k = SE/SA (en huitièmes)
 *   INVARIANT      le rayon R, le centre O ; la forme de la couche d'un pavé ou d'un cylindre parallèle à une face / à la base
 *                  (le même 20 × 6, le même cercle 1,7 à toute position) ; la forme de la base pour la pyramide (un carré)
 *   TRANSFORMATION la couche change avec la position : r diminue quand h augmente ; KI diminue quand d augmente ; le carré
 *                  rétrécit quand le plan monte vers S
 *   CONSTRAINT     le plan ne bouge pas pendant une prédiction ; la couche réelle est TOUJOURS imprimée (la mesure, pas l'élève)
 *   RESISTANCE     une carte fausse est imprimée en FANTÔME : pour la sphère, l'anneau annoncé ne touche pas la surface — le lab
 *                  écrit OM = √(h² + ρ²) ≠ R (« R − h » est dedans, « √(R² + h²) » dehors) ; le 25 × 6 et le carré de côté 4
 *                  sortent du solide ; 2(r − d) ne touche pas la paroi ; « une ellipse » : la vue passe AU-DESSUS, c'est un
 *                  cercle ; h > R : la buse n'imprime rien (« المستوي لا يقطع الكرة ») ; h = R : un seul point, N
 *   EVIDENCE       la pile des couches imprimées, la lecture exacte de chaque couche
 *   CONTRAST       grand cercle + petit cercle + contact (ou rien) (logic › discoveryReady)
 *   PREDICTION     chaque couche est PRÉDITE avant l'impression (trois cartes : la vraie et deux confusions réelles)
 *   DISCOVERY      « r = √(R² − h²) si h < R ; un point si h = R ; rien si h > R »
 *   FORMALIZATION  AM² = OM² − OA² (معارف 3 أ), avec les nombres de la couche de l'élève
 *   TRANSFER       معارف 3 ب/جـ (pavé, cylindre), la réduction de la pyramide (ajout déclaré), طرائق ص 169, دوري الآن
 *
 * Monde (`theme` 3d-printer) : DÉCOR (exigence du propriétaire) — le cadre de l'imprimante (rails, portique, plateau
 * chauffant quadrillé), la bobine de filament RGB qu'on touche pour changer la couleur de la PROCHAINE couche, la bande LED
 * qui s'allume pendant l'impression, des autocollants de l'atelier. `aria-hidden`, hors clavier, `[data-deco]`, jamais une
 * information (aucune mesure), immobile sous `prefers-reduced-motion`. Tout ce qui est mathématique est dans la scène 3D
 * (Stage3D, kit stage3d/) et dans la lecture HTML.
 *
 * D'UN SEUL REGARD (§8bis) : le bloc `[data-sl-glance]` = les onglets des solides (متقدم) + la scène 3D avec son rail en
 * surimpression + la rangée −/valeur/+/« اطبع »/modes + les cartes ou le verdict. La hauteur de la scène est budgétée sur
 * l'écran de leçon (useLessonViewport moins ce que le bloc prend en plus du dessin) et ne dépasse jamais 55 % de la hauteur
 * de la fenêtre (le téléphone garde de quoi défiler autour de la scène qui prend le doigt). Les couches imprimées (la liste)
 * sont dans un `LabFold` SOUS le bloc mesuré.
 *
 * Props : `solids`, `R`, `step`, `stops`, `start`, `foot`, `cuboid`, `cylinder`, `pyramid` — à plat ou groupés dans `numbers`
 * (levels.js) ; `theme`, `title`, `lead`, `mission`, `level`, `levels`, `onTrial(evidence)` à chaque couche imprimée et
 * `onFinished({ stage, witness })` à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-section-slicer][data-stage=<étage>][data-solved][data-world], [data-sl-glance], [data-sl-tab=<solide>],
 * [data-sl-mode=<étage>], [data-stage3d] (Stage3D), [data-sl-rail] (role=slider, la variable), [data-sl-less|more],
 * [data-sl-value=<texte>], [data-sl-print], [data-sl-card=<kind>][data-correct], [data-sl-cancel], [data-sl-verdict=<kind>],
 * [data-sl-next], [data-lab-fold=section-slicer.layers], [data-sl-layer], [data-deco].
 */
const NUMBER_KEYS = ['solids', 'R', 'step', 'stops', 'start', 'foot', 'cuboid', 'cylinder', 'pyramid'];
const btn = 'inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 bg-white px-2 disabled:opacity-40 focus:outline-none focus-visible:ring-2';
const VERTICAL = { sphere: true, 'cylinder-base': true, pyramid: true };
/** Sens du rail horizontal : la variable croît vers la gauche (CM, d) ou la droite (DI) — comme le plan à l'écran. */
const RAIL_DIR = { 'cuboid-face': 'ltr', 'cuboid-edge': 'rtl', 'cylinder-axis': 'rtl' };
const SOLID_STAGES = { cuboid: ['cuboid-face', 'cuboid-edge'], cylinder: ['cylinder-base', 'cylinder-axis'] };

export default function SectionSlicer(props) {
  const { numbers: grouped, theme: theme0, title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true,
    initialMode = 'student', allowModeSwitch = false, onTrial, onFinished } = props;
  const authored = useMemo(() => {
    const out = {};
    for (const key of NUMBER_KEYS) {
      const v = grouped?.[key] ?? props[key];
      if (v != null) out[key] = v;
    }
    return out;
  }, [grouped, props]); // eslint-disable-line react-hooks/exhaustive-deps
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.sectionSlicer.${key}`, o), [t]);
  const state = useManipulation({ type: 'section-slicer', initialNumbers: authored, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numKey = JSON.stringify(NUMBER_KEYS.map((x) => nums[x] ?? null));
  const make = () => L.init(nums);
  const [lab, setLab] = useState(make);
  const sceneKey = `${numKey}|${state.epoch}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [doneIds, setDoneIds] = useState({});
  // « إعادة » (epoch), un autre niveau ou d'autres nombres : TOUT recommence — les couches, les étapes et les questions du labo
  if (scene.key !== sceneKey) { setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(make()); setDoneIds({}); }
  const theme = theme0 ?? '3d-printer';
  const sph = lab.cfg.stages.sphere;
  const letter = sph?.letter ?? 'h';
  const foot = sph?.foot ?? 'A';

  const ready = L.discoveryReady(lab);
  const cpSettings = useLabCheckpointSettings('section-slicer');   // obligatoires pour tout élève ; l'enseignant seul les coupe, pour SON compte
  const cpLive = cpOn && cpSettings.enabled;
  useEffect(() => { if (ready && !cpLive) state.discover(); }, [ready, state.epoch, cpLive]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!state.isFormal) return;
    const w = L.witness(lab);
    state.report(onFinished, { stage: 'sphere', witness: w ? L.evidenceOf(w, lab) : null });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!lab.n) return;
    const tr = lab.trials[lab.trials.length - 1];
    const e = L.evidenceOf(tr, lab);
    // ce que le module affiche : la variable (« x = 1{,}25 ») et la couche en mots (« دائرة نصف قطرها … »)
    if (e) state.report(onTrial, { ...e, variable: valueTex(lab, tr.stage, letter, tr.i), actual: actualText(tr.section, k) });
  }, [lab.n]); // eslint-disable-line react-hooks/exhaustive-deps

  const w = L.witness(lab);
  const wR = sph ? L.lengthTex(sph.R) : '';
  const wh = w ? L.lengthTex(w.value) : '';
  const wr = w ? L.lengthTex(w.section.r) : '';
  const wp = w && sph ? L.lengthTex(trigonometryDiff(sph.R, w.value)) : '';
  const discoveryOptions = useMemo(() => [
    { text: <MathText>{k('dOptTarh', { l: letter })}</MathText>, why: <MathText>{k('dWhyTarh', { l: letter, h: wh, r: wr, p: wp })}</MathText> },
    { text: <MathText>{k('dOptRight', { l: letter })}</MathText>, correct: true },
    { text: <MathText>{k('dOptSame')}</MathText>, why: <MathText>{k('dWhySame', { l: letter, h: wh, r: wr, R: wR })}</MathText> },
  ], [k, letter, wh, wr, wp, wR]);

  const formal = sph ? (
    <div className="space-y-2" data-sl-formal>
      <EquationDisplay tone="result" tex={`${foot}M^2 = OM^2 - O${foot}^2`} note={k('fPythagoras', { foot })} />
      {w && <EquationDisplay tone="result" tex={`r^2 = ${wR}^2 - ${wh}^2 = ${L.lengthTex(w.section.r2)} \\;\\Rightarrow\\; r = ${wr}`} note={k('fWitness')} />}
      <EquationDisplay tone="result" tex={`r = \\sqrt{R^2 - ${letter}^2}`} note={k('fRuleShort')} />
      <p className="text-sm text-emerald-900"><MathText>{k('fRule', { l: letter })}</MathText></p>
    </div>
  ) : null;

  /* ── les étapes et leurs questions : l'étage réussi (la sphère : le contraste) ouvre sa suite, dans l'ordre ── */
  const stepList = L.stepsOf(lab).map((st) => ({ ...st, chain: chainOf(st.id) }));
  const stepDone = stepList.map((st) => !!doneIds[st.id] || (!cpLive && st.reached));
  const nextStep = cpLive ? stepList.find((st) => !doneIds[st.id]) : null;
  const cpId = nextStep && nextStep.reached ? nextStep.id : null;
  const chain = cpId ? nextStep.chain : null;
  const cp = useLabCheckpoint({
    id: cpId,
    questions: chain ? chain.map((q) => QUESTIONS[q]({ lab, step: nextStep, options: discoveryOptions, formal, letter, foot }, k)) : null,
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

  /* ── le son : un déclic quand le plan change de cran (au plus un toutes les 35 ms), « flag » à la couche prédite juste, « over » à la couche
     refusée, « bell » quand une étape est finie. Muet sauf « الصوت ». ── */
  const tick = useRef({ key: null, at: 0 });
  const gestureKey = `${lab.stage}|${lab.pos[lab.stage]}`;
  useEffect(() => {
    const p = tick.current;
    if (p.key === null || p.key.split('|')[0] !== gestureKey.split('|')[0]) { p.key = gestureKey; return; }
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
    playSfx(lab.trials[n - 1].ok ? 'flag' : 'over');
  }, [lab.trials.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const bells = useRef(0);
  useEffect(() => {
    const n = stepDone.filter(Boolean).length;
    if (n > bells.current) playSfx('bell');
    bells.current = n;
  }, [doneKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const stepper = (
    <LabStepper count={stepList.length} current={Math.max(0, stepDone.indexOf(false) < 0 ? stepList.length - 1 : stepDone.indexOf(false))} done={stepDone} stepAttr="data-sl-step" />
  );

  const stageMission = k(`missions.${lab.stage}`, { l: letter, foot });
  return (
    <ManipulationShell
      type="section-slicer"
      title={title ?? k('title')}
      mission={mission ?? <MathText>{stageMission}</MathText>}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided={cpLive}
      hints={['1', '2', '3'].map((n) => <MathText key={n}>{k(`hints.${lab.stage === 'sphere' ? 'sphere' : 'solid'}${n}`, { l: letter, foot })}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={sph ? <ManipulationDiscovery state={state} prompt={<MathText>{k('dPrompt', { l: letter })}</MathText>} options={discoveryOptions} formal={formal} /> : null}
      explanation={<MathText>{k('explanation', { l: letter })}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-slate-50 to-white" minHeight="min-h-[150px]">
        <Slicer key={numKey} lab={lab} setLab={setLab} k={k} theme={theme} solved={ready} formal={state.isFormal} letter={letter} foot={foot} overlay={<>{party.node}{cp.node}{stepper}</>} />
      </ManipulationStage>
    </ManipulationShell>
  );
}

/** R − h (pour réfuter « r = R − h » avec les nombres de l'élève) — une soustraction de fractions de linear.js. */
function trigonometryDiff(R, h) { return linear.sub(R, h); }

/* ── la mesure : largeur du bloc ; hauteur = écran de leçon − ce que le bloc glance prend en plus de la scène ── */
function useBudget(min, max) {
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const drawnH = useRef(320);
  const [width, setWidth] = useState(340);
  const [overhead, setOverhead] = useState(190);
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
  const winH = typeof window !== 'undefined' && window.innerHeight ? window.innerHeight : 800;
  const budget = Math.round(Math.max(min, Math.min(max, winH * 0.55, screenH - overhead - 16)));
  return { boxRef, glanceRef, drawnH, width, budget };
}

/** Le texte LaTeX de la valeur de la variable (« h = 1{,}5 », « \dfrac{SE}{SA} = \dfrac{3}{4} »). */
function valueTex(lab, stage, letter, i = lab.pos[stage]) {
  const vt = L.valueLatex(lab, stage, i);
  return {
    sphere: `${letter} = ${vt}`, 'cuboid-face': `DI = ${vt}`, 'cuboid-edge': `CM = ${vt}`, 'cylinder-base': `O'B = ${vt}`,
    'cylinder-axis': `OH = ${vt}`, pyramid: `\\dfrac{SE}{SA} = ${vt}`,
  }[stage];
}

function Slicer({ lab, setLab, k, theme, solved, formal, letter, foot, overlay }) {
  const { boxRef, glanceRef, drawnH, width, budget } = useBudget(210, 440);
  const narrow = width < 400;
  const S = budget;
  drawnH.current = S;
  const stage = lab.stage;
  const solid = L.SOLID_OF[stage];
  const actions = useRef(null);
  actions.current = {
    move: (i) => setLab((s) => L.moveTo(s, i)),
    canMove: () => L.canMove(lab) === true,
  };
  const [reduce] = useState(() => prefersReducedMotion());
  const multi = lab.cfg.solids.length > 1;
  const solidName = k(`tabs.${solid}`);
  const fig = useMemo(() => L.sceneFigure(lab, k('fallbackAria', { solid: solidName })), [lab, k, solidName]);
  const build = useCallback((stage3) => buildScene(stage3, lab.cfg, actions, { reduce, foot }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const view = SOLID_VIEW[L.SOLID_OF[lab.cfg.order[0]]];
  const sceneState = useMemo(() => ({ lab, formal }), [lab, formal]);
  const next = multi && L.isFound(lab, stage) && !lab.pending ? L.nextStage(lab) : null;

  return (
    <div ref={boxRef} className="relative space-y-2" data-section-slicer data-stage={stage} data-world={theme} data-solved={solved ? 'true' : 'false'}>
      {overlay}
      <div ref={glanceRef} className="space-y-1.5" data-sl-glance>
        {multi && <Tabs lab={lab} setLab={setLab} k={k} narrow={narrow} />}
        <div className="relative overflow-hidden rounded-2xl border border-slate-300 bg-slate-50" style={{ height: S }}>
          <PrinterDeco filament={lab.filament} printing={lab.last?.kind === 'ok' || lab.last?.kind === 'refused'} n={lab.n} reduce={reduce}
            onSpool={() => setLab(L.nextFilament)} />
          <div className="absolute inset-0">
          <Stage3D
            build={build}
            state={sceneState}
            view={view.view}
            target={view.target}
            fallback={<div className="h-full w-full overflow-hidden bg-white/95 p-1"><SpaceFigure {...fig} maxWidth={Math.round(S * 0.95)} /></div>}
            ariaLabel={k('sceneAria', { solid: solidName })}
            style={{ height: '100%' }}
          />
          </div>
          <Rail lab={lab} setLab={setLab} k={k} S={S} letter={letter} narrow={narrow} />
        </div>
        <Controls lab={lab} setLab={setLab} k={k} letter={letter} narrow={narrow} />
        <Verdict lab={lab} setLab={setLab} k={k} letter={letter} foot={foot} narrow={narrow} formal={formal} next={next} />
      </div>
      {lab.trials.length > 0 && (
        <LabFold id="section-slicer.layers" title={k('layersTitle')}>
          <ul className="flex flex-wrap gap-1.5 text-xs" data-sl-layers={lab.trials.length}>
            {lab.trials.slice(-12).map((tr) => (
              <li key={tr.n} className={`rounded-lg border px-2 py-0.5 ${tr.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`} data-sl-layer={tr.stage}>
                <span className="font-bold">{k(`tabs.${L.SOLID_OF[tr.stage]}`)}</span>{' '}
                <MathText>{`$${valueTex(lab, tr.stage, letter, tr.i)}$`}</MathText>{' '}
                <span aria-hidden="true">←</span>{' '}
                <MathText>{actualText(tr.section, k)}</MathText>{' '}
                {tr.ok ? <Check className="inline h-3.5 w-3.5" aria-label={k('predictedOk')} /> : <X className="inline h-3.5 w-3.5" aria-label={k('predictedKo')} />}
              </li>
            ))}
          </ul>
        </LabFold>
      )}
    </div>
  );
}

/** La couche réelle, en mots (DOM arabe) et en îles LaTeX. */
function actualText(sec, k) {
  if (!sec) return '';
  if (sec.kind === 'circle' || sec.kind === 'great-circle') return k('actual.circle', { r: L.lengthTex(sec.r) });
  if (sec.kind === 'rectangle') return k('actual.rectangle', { s: L.sectionTex(sec) });
  if (sec.kind === 'square') return k('actual.square', { s: L.lengthTex(sec.side) });
  return k(`actual.${sec.kind}`);
}

/* ════════════════════════════ les onglets (متقدم) et les modes ════════════════════════════ */

function Tabs({ lab, setLab, k, narrow }) {
  const cur = L.SOLID_OF[lab.stage];
  return (
    <div role="group" aria-label={k('tabsLabel')} className="grid grid-cols-4 gap-1">
      {lab.cfg.solids.map((s) => {
        const found = lab.cfg.order.some((x) => L.SOLID_OF[x] === s && L.isFound(lab, x));
        return (
          <button key={s} type="button" onClick={() => setLab((x) => L.goSolid(x, s))} aria-current={cur === s ? 'step' : undefined} data-sl-tab={s}
            className={`min-h-[44px] rounded-xl border-2 px-1 font-extrabold leading-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${narrow ? 'text-[11px]' : 'text-sm'} ${cur === s ? 'border-cyan-700 bg-cyan-600 text-white' : 'border-cyan-200 bg-white text-cyan-900'}`}>
            {found && <Check className="me-0.5 inline h-3.5 w-3.5" aria-label={k('foundMark')} />}{k(`tabs.${s}`)}
          </button>
        );
      })}
    </div>
  );
}

/* ════════════════════════════ le rail (la variable, HTML) ════════════════════════════ */

function Rail({ lab, setLab, k, letter, narrow }) {
  const stage = lab.stage;
  const st = lab.cfg.stages[stage];
  const vertical = !!VERTICAL[stage];
  const dir = RAIL_DIR[stage] ?? 'ltr';
  const locked = L.canMove(lab) !== true;
  const [live, setLive] = useState(null);
  const value = live ?? lab.pos[stage];
  const span = st.max - st.min;
  const sti = useStretchInteraction({
    value, range: { min: st.min, max: st.max }, direction: vertical ? 'ltr' : dir, pageStep: Math.max(2, Math.round(span / 8)), settleMs: 400,
    toValue: (cx, cy, rect) => {
      if (vertical) return st.min + (1 - (cy - rect.top - 22) / Math.max(1, rect.height - 44)) * span;
      const f = (cx - rect.left - 22) / Math.max(1, rect.width - 44);
      return st.min + (dir === 'rtl' ? 1 - f : f) * span;
    },
    onChange: (v) => { setLive(v); setLab((s) => L.moveTo(s, v)); },
    onCommit: (v) => { setLive(null); setLab((s) => L.moveTo(s, v)); },
  });
  useEffect(() => { setLive(null); }, [stage]);
  const frac = span ? (value - st.min) / span : 0;
  const hp = sti.handleProps({ label: k(`rail.${stage}`), valueText: valueTextPlain(lab, stage, letter, value) });
  const onKeyDown = (e) => {
    if (locked) return;
    if (e.shiftKey && ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      const big = Math.max(2, Math.round(span / 8));
      const grow = e.key === 'ArrowUp' || (dir === 'rtl' && !vertical ? e.key === 'ArrowLeft' : e.key === 'ArrowRight');
      sti.set(value + (grow ? big : -big));
      return;
    }
    hp.onKeyDown(e);
  };
  const marks = st.stops ?? [];
  const pct = (i) => `${(((i - st.min) / Math.max(1, span)) * 100).toFixed(2)}%`;
  const thumbStyle = vertical
    ? { left: '50%', top: `calc(22px + (100% - 44px) * ${(1 - frac).toFixed(4)})` }
    : { top: '50%', left: `calc(22px + (100% - 44px) * ${(dir === 'rtl' ? 1 - frac : frac).toFixed(4)})` };
  const trackCls = vertical ? `absolute bottom-2 top-2 ${narrow ? 'w-12' : 'w-14'} start-1` : `absolute bottom-1 h-12 ${narrow ? 'end-12 start-1' : 'end-14 start-14'}`;
  return (
    <div {...(locked ? {} : sti.trackProps)} className={`${trackCls} z-10`} style={locked ? undefined : sti.trackProps.style} data-sl-track={vertical ? 'vertical' : 'horizontal'}>
      {/* le rail de l'axe Z / de l'axe X de l'imprimante (la variable mathématique) */}
      <div aria-hidden="true" className={vertical ? 'absolute bottom-[22px] left-1/2 top-[22px] w-2 -translate-x-1/2 rounded-full bg-slate-300/80 shadow-inner' : 'absolute left-[22px] right-[22px] top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-300/80 shadow-inner'} />
      {marks.map((m) => (
        <span key={m} aria-hidden="true" className={vertical ? 'absolute left-1/2 h-0.5 w-6 -translate-x-1/2 bg-amber-300' : 'absolute top-1/2 h-6 w-0.5 -translate-y-1/2 bg-amber-300'}
          style={vertical ? { top: `calc(22px + (100% - 44px) * ${(1 - (m - st.min) / Math.max(1, span)).toFixed(4)})` } : { left: `calc(22px + (100% - 44px) * ${(dir === 'rtl' ? 1 - (m - st.min) / Math.max(1, span) : (m - st.min) / Math.max(1, span)).toFixed(4)})` }}
          data-sl-mark={pct(m)} />
      ))}
      <div {...hp} aria-orientation={vertical ? 'vertical' : 'horizontal'} aria-disabled={locked ? 'true' : undefined} onKeyDown={onKeyDown}
        data-sl-rail={L.valueText(lab, stage, value)}
        className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${locked ? 'border-slate-400 bg-slate-200/80' : 'border-amber-500 bg-amber-100'}`}
        style={{ ...thumbStyle, cursor: locked ? 'not-allowed' : sti.dragging ? 'grabbing' : 'grab' }}>
        {/* la buse de l'imprimante */}
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true"><rect x="5" y="3" width="14" height="9" rx="2" fill="#f59e0b" stroke="#92400e" strokeWidth="1.5" /><path d="M9 12 L15 12 L12 20 Z" fill="#78350f" /></svg>
      </div>
    </div>
  );
}
const valueTextPlain = (lab, stage, letter, i) => {
  const v = L.valueText(lab, stage, i);
  return { sphere: `${letter} = ${v}`, 'cuboid-face': `DI = ${v}`, 'cuboid-edge': `CM = ${v}`, 'cylinder-base': `O′B = ${v}`, 'cylinder-axis': `OH = ${v}`, pyramid: `SE/SA = ${v}` }[stage];
};

/* ════════════════════════════ la rangée de commandes ════════════════════════════ */

function Controls({ lab, setLab, k, letter, narrow }) {
  const stage = lab.stage;
  const st = lab.cfg.stages[stage];
  const solid = L.SOLID_OF[stage];
  const locked = L.canMove(lab) !== true;
  const cur = lab.pos[stage];
  const vertical = !!VERTICAL[stage];
  const dir = RAIL_DIR[stage] ?? 'ltr';
  // −/+ suivent l'écran : pour un rail qui croît vers la gauche, « + » est à gauche
  const plusLeft = !vertical && dir === 'rtl';
  const nudge = (d) => setLab((s) => L.moveTo(s, s.pos[s.stage] + d));
  const less = <button type="button" onClick={() => nudge(-1)} disabled={locked || cur <= st.min} aria-label={k('less')} data-sl-less className={`${btn} border-amber-300 focus-visible:ring-amber-500`}><Minus className="h-4 w-4" aria-hidden="true" /></button>;
  const more = <button type="button" onClick={() => nudge(1)} disabled={locked || cur >= st.max} aria-label={k('more')} data-sl-more className={`${btn} border-amber-300 focus-visible:ring-amber-500`}><Plus className="h-4 w-4" aria-hidden="true" /></button>;
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {SOLID_STAGES[solid] && (
        <div role="group" aria-label={k('modesLabel')} className="flex gap-1">
          {SOLID_STAGES[solid].map((m) => (
            <button key={m} type="button" onClick={() => setLab((s) => L.goStage(s, m))} aria-pressed={stage === m} data-sl-mode={m}
              className={`min-h-[44px] rounded-xl border-2 px-2 font-bold leading-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${narrow ? 'text-[11px]' : 'text-xs'} ${stage === m ? 'border-cyan-700 bg-cyan-50 text-cyan-900' : 'border-slate-200 bg-white text-slate-700'}`}>
              <MathText>{k(`modes.${m}`)}</MathText>
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-1.5" dir="ltr">
        {plusLeft ? more : less}
        <span className={`rounded-full bg-amber-100 px-2 py-1 text-center font-mono font-extrabold text-amber-900 ${narrow ? 'min-w-[4.5rem] text-xs' : 'min-w-[6.5rem] text-sm'}`} data-sl-value={L.valueText(lab)}>
          <MathText>{`$${valueTex(lab, stage, letter)}$`}</MathText>
        </span>
        {plusLeft ? less : more}
      </div>
      <button type="button" onClick={() => setLab(L.print)} disabled={L.canPrint(lab) !== true} data-sl-print
        className="inline-flex h-11 items-center gap-1.5 rounded-xl border-2 border-cyan-800 bg-cyan-600 px-3 text-sm font-extrabold text-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
        <Printer className="h-4 w-4" aria-hidden="true" /> {narrow ? k('printShort') : k('print')}
      </button>
    </div>
  );
}

/* ════════════════════════════ prédire, puis le verdict ════════════════════════════ */

function cardLabel(card, k, stage) {
  if (card.r2) return `$${L.lengthTex(card.r)}$`;
  if (card.nature) {
    if (card.nature === 'circle') return k('nature.circle', { r: L.lengthTex(card.r) });
    if (card.nature === 'rectangle') return k('nature.rectangle', { s: `${L.lengthTex(card.sides[0])} \\times ${L.lengthTex(card.sides[1])}` });
    return k(`nature.${card.nature}`, { solid: k(`of.${L.SOLID_OF[stage]}`) });
  }
  if (card.sides.length === 1) return k('nature.square', { s: L.lengthTex(card.sides[0]) });
  return k('nature.rectangle', { s: `${L.lengthTex(card.sides[0])} \\times ${L.lengthTex(card.sides[1])}` });
}

function Verdict({ lab, setLab, k, letter, foot, narrow, formal, next }) {
  const p = lab.pending;
  const small = narrow ? 'text-xs' : 'text-sm';
  if (p) {
    // la même hauteur réservée que le verdict : la scène ne saute pas quand les cartes apparaissent
    return (
      <div className="min-h-[6.5rem] space-y-1" data-sl-predict={p.stage}>
        <div className="flex items-start gap-1">
          <p role="status" className={`flex-1 ${small} font-bold leading-snug text-cyan-900`} data-sl-verdict="predict">
            <MathText>{k(`predict.${p.stage}`, { v: valueTex(lab, p.stage, letter, p.i), l: letter })}</MathText>
          </p>
          <button type="button" onClick={() => setLab(L.cancel)} data-sl-cancel aria-label={k('cancel')} title={k('cancel')}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-500">
            <Undo2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {p.cards.map((c) => (
            <button key={c.id} type="button" onClick={() => setLab((s) => L.choose(s, c.id))} data-sl-card={c.kind} data-correct={c.correct ? 'true' : 'false'}
              className={`min-h-[44px] rounded-xl border-2 border-slate-300 bg-white px-1 py-1 font-bold leading-tight text-slate-800 hover:border-cyan-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 [&_.katex]:whitespace-nowrap ${narrow ? 'text-[11px]' : 'text-sm'}`}>
              <MathText>{cardLabel(c, k, p.stage)}</MathText>
            </button>
          ))}
        </div>
      </div>
    );
  }
  const { kind, text, reading } = verdictOf(lab, k, letter, foot, formal);
  const tone = kind.startsWith('ok') ? 'text-emerald-800' : kind.startsWith('ko') ? 'text-amber-800' : 'text-slate-700';
  return (
    <div className="min-h-[6.5rem] space-y-1">
      <p role="status" className={`min-h-[2.5rem] ${small} font-bold leading-snug ${tone}`} data-sl-verdict={kind}>
        <MathText>{text}</MathText>
      </p>
      {reading && <p className={`${narrow ? 'text-[11px]' : 'text-xs'} text-center text-slate-700`} data-sl-reading><MathText>{reading}</MathText></p>}
      {next && (
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border-2 border-emerald-300 bg-emerald-50 px-2 py-1" data-sl-next-card={next}>
          <span className={`${narrow ? 'text-[11px]' : 'text-xs'} font-semibold text-emerald-900`}>{k('nextCard', { solid: k(`tabs.${L.SOLID_OF[next]}`) })}</span>
          <button type="button" onClick={() => setLab((s) => L.goSolid(s, L.SOLID_OF[next]))} data-sl-next={next}
            className="h-11 rounded-xl border-2 border-emerald-700 bg-emerald-600 px-3 text-sm font-extrabold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
            {k('toNext', { solid: k(`tabs.${L.SOLID_OF[next]}`) })}
          </button>
        </div>
      )}
    </div>
  );
}

/** Le verdict d'une impression, avec les nombres de l'écran (et la lecture exacte de la couche à cette position). */
function verdictOf(lab, k, letter, foot, formal) {
  const stage = lab.stage;
  const st = lab.cfg.stages[stage];
  const e = lab.last;
  const here = lab.trials.slice().reverse().find((x) => x.stage === stage && x.i === lab.pos[stage]);
  if (!e || e.kind === 'predict' || e.stage !== stage || e.i !== lab.pos[stage]) {
    const reading = here ? k('readHere', { s: actualText(here.section, k) }) : null;
    return { kind: 'start', text: k(`start.${stage}`, { l: letter }), reading };
  }
  const sec = e.section;
  const card = e.card;
  const lt = (x) => L.lengthTex(x);
  const approx = (x) => (L.isIrrational(x) ? `$\\approx ${L.approx(x).replace(',', '{,}')}$` : '');
  if (stage === 'sphere') {
    const v = lt(sec.h); const R = lt(st.R);
    if (e.kind === 'ok') {
      const text = sec.kind === 'circle' ? k('ok.sphereCircle', { foot, r: lt(sec.r), approx: approx(sec.r) })
        : sec.kind === 'great-circle' ? k('ok.sphereGreat', { r: R })
          : sec.kind === 'point' ? k('ok.spherePoint', { l: letter, v, R })
            : k('ok.sphereNone', { l: letter, v, R });
      const reading = formal && sec.kind === 'circle' ? k('readPythagoras', { foot, R, v, r2: lt(sec.r2) }) : null;
      return { kind: `ok-${sec.kind}`, text, reading };
    }
    if (card.r2 && e.detail) {
      return {
        kind: `ko-${card.kind}`,
        text: k('ko.sphereRing', { p: lt(card.r), om: lt(e.detail.om), omApprox: approx(e.detail.om), R, where: k(`where.${e.detail.where}`), actual: actualText(sec, k) }),
      };
    }
    return { kind: `ko-${card.kind}`, text: k(`ko.sphere_${card.kind}`, { l: letter, v, R, foot, actual: actualText(sec, k) }) };
  }
  if (stage === 'cuboid-face') {
    const { a, b, c } = st.dims;
    if (e.kind === 'ok') {
      const same = lab.trials.filter((x) => x.stage === stage && x.ok).map((x) => x.i);
      return { kind: 'ok-rectangle', text: k('ok.cuboidFace', { b: lt(b), c: lt(c), area: lt(sec.area) }) + (new Set(same).size >= 2 ? ` ${k('ok.cuboidFaceSame')}` : '') };
    }
    return { kind: `ko-${card.kind}`, text: k(`ko.cuboidFace_${card.kind}`, { a: lt(a), b: lt(b), c: lt(c) }) };
  }
  if (stage === 'cuboid-edge') {
    const { c } = st.dims;
    if (e.kind === 'ok') return { kind: 'ok-rectangle', text: k('ok.cuboidEdge', { cm: lt(sec.cm), cn: lt(sec.cn), mn: lt(sec.mn), c: lt(c), area: lt(sec.area) }) };
    return { kind: `ko-${card.kind}`, text: k(`ko.cuboidEdge_${card.kind}`, { cm: lt(sec.cm), cn: lt(sec.cn), p: lt(card.sides[0]), c: lt(c) }) };
  }
  if (stage === 'cylinder-base') {
    if (e.kind === 'ok') return { kind: 'ok-circle', text: k('ok.cylinderBase', { r: lt(st.r) }) };
    return { kind: `ko-${card.kind}`, text: k(`ko.cylinderBase_${card.kind}`, { r: lt(st.r) }) };
  }
  if (stage === 'cylinder-axis') {
    const d = lt(sec.d); const r = lt(st.r); const h = lt(st.h);
    if (e.kind === 'ok') {
      if (sec.kind === 'rectangle') return { kind: 'ok-rectangle', text: k('ok.cylinderAxis', { d, r, h, w: lt(sec.width), hi: lt(sec.half), approx: approx(sec.width) }) };
      return { kind: `ok-${sec.kind}`, text: k(`ok.cylinderAxis_${sec.kind}`, { d, r }) };
    }
    return { kind: `ko-${card.kind}`, text: k(`ko.cylinderAxis_${card.kind}`, { d, r, h, p: card.sides ? lt(card.sides[0]) : '', actual: actualText(sec, k) }) };
  }
  const kk = L.kTex(sec.k); const side = lt(st.side);
  if (e.kind === 'ok') return { kind: 'ok-square', text: k('ok.pyramid', { k: kk, ab: side, side: lt(sec.side), diag: lt(sec.diag), area: lt(sec.area) }) };
  return { kind: `ko-${card.kind}`, text: k(`ko.pyramid_${card.kind}`, { k: kk, ab: side, p: lt(card.sides[0]), actual: actualText(sec, k) }) };
}

/* ════════════════════════════ la scène 3D (three.js, kit stage3d) ════════════════════════════ */

/** La vue de chaque solide, en unités de scène (chaque solide est mis à l'échelle pour un rayon ≈ 3). */
const SOLID_VIEW = {
  sphere: { view: { azimuth: -62, elevation: 20, distance: 12.5 }, target: [0, 0, 0] },
  cuboid: { view: { azimuth: -58, elevation: 26, distance: 13 }, target: [3.2, 2.56, 0.77] },
  cylinder: { view: { azimuth: -62, elevation: 18, distance: 15 }, target: [0, 0, 2.4] },
  pyramid: { view: { azimuth: -64, elevation: 16, distance: 14 }, target: [0, 0, 1.7] },
};
const n = (x) => L.toNumberAny(x);
const circlePts = (c, r, normal = 'z', count = 96) => {
  const out = [];
  for (let i = 0; i <= count; i += 1) {
    const t = (i / count) * 2 * Math.PI;
    if (normal === 'z') out.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t), c[2]]);
  }
  return out;
};
const rectPts = (corners) => [...corners, corners[0]];

/**
 * Le monde 3D du lab : un groupe par solide (mis à l'échelle `u`), visibles un à la fois ; ce qui dépend de l'état (le plan, la
 * couche, le fantôme, les couches imprimées, les noms) vit dans un groupe « dynamique » reconstruit à chaque `update`. La poignée
 * (la buse) de chaque étage est déplaçable le long d'une droite de la mathématique (`stage.draggable` + `onLine`).
 */
function buildScene(stage, cfg, actions, { reduce, foot }) {
  const worlds = {};
  const dash = (u) => ({ dash: 0.16 / u, gap: 0.1 / u });
  let currentSolid = null;
  let lastN = -1;

  const makeWorld = (solid) => {
    const g = new Group();
    const dyn = new Group();
    let u = 1;
    let center = [0, 0, 0];
    if (solid === 'sphere') {
      const R = n(cfg.stages.sphere.R); u = 3 / R;
      g.add(K.sphere(R, { opacity: 0.2 }));
      g.add(K.ring([0, 0, 0], R, { color: 'slate', tube: 0.008 * R, opacity: 0.45 }));
      g.add(K.line([[0, 0, R * 1.08], [0, 0, -R * 1.08]], { color: 'slate', dashed: true, ...dash(u), opacity: 0.8 }));
      g.add(K.dot([0, 0, 0], { radius: 0.07 / u }));
      g.add(K.dot([0, 0, R], { radius: 0.06 / u })); g.add(K.dot([0, 0, -R], { radius: 0.06 / u }));
      g.add(stage.label('O', [0.12 * R, 0, -0.1 * R])); g.add(stage.label('N', [-0.1 * R, 0, R * 1.12])); g.add(stage.label('S', [-0.1 * R, 0, -R * 1.14]));
    } else if (solid === 'cuboid') {
      const { a, b, c } = cfg.stages['cuboid-face'].dims; const A = n(a); const B = n(b); const C = n(c); u = 5.6 / A;
      center = [A / 2, B / 2, C * 0.2];
      const box = K.box([A, B, C], { color: 'sky', opacity: 0.16 });
      g.add(box); g.add(K.edges(box, { color: 'ink', opacity: 0.85 }));
      const P = L.cuboidNamed({ a, b, c });
      const ctr = [A / 2, B / 2, C / 2];
      for (const [name, p] of Object.entries(P)) {
        const v = [p[0] - ctr[0], p[1] - ctr[1], p[2] - ctr[2]]; const l = Math.hypot(...v) || 1;
        g.add(stage.label(name, [p[0] + (v[0] / l) * 1.6, p[1] + (v[1] / l) * 1.6, p[2] + (v[2] / l) * 1.6]));
      }
    } else if (solid === 'cylinder') {
      const st = cfg.stages['cylinder-axis'] ?? cfg.stages['cylinder-base']; const r = n(st.r); const h = n(st.h); u = 4.8 / h;
      center = [0, 0, h / 2];
      g.add(K.cylinder(r, h, { color: 'sky', opacity: 0.18 }));
      g.add(K.ring([0, 0, 0], r, { color: 'ink', tube: 0.012 * h, opacity: 0.7 })); g.add(K.ring([0, 0, h], r, { color: 'ink', tube: 0.012 * h, opacity: 0.85 }));
      g.add(K.line([[0, 0, -0.08 * h], [0, 0, 1.08 * h]], { color: 'slate', dashed: true, ...dash(u), opacity: 0.8 }));
      g.add(stage.label('O', [0.22 * r, 0.2 * r, h + 0.06 * h])); g.add(stage.label("O′", [0.25 * r, 0.25 * r, -0.07 * h]));
      g.add(K.dot([0, 0, h], { radius: 0.06 / u })); g.add(K.dot([0, 0, 0], { radius: 0.06 / u }));
    } else {
      const st = cfg.stages.pyramid; const side = n(st.side); const H = n(st.H); u = 4.5 / H;
      center = [0, 0, H * 0.4];
      const pyr = K.pyramid(side, H, { color: 'amber', opacity: 0.18 });
      g.add(pyr); g.add(K.edges(pyr, { color: 'ink', opacity: 0.85 }));
      const s2 = side / 2;
      const P = { S: [0, 0, H], A: [-s2, -s2, 0], B: [s2, -s2, 0], C: [s2, s2, 0], D: [-s2, s2, 0] };
      for (const [name, p] of Object.entries(P)) g.add(stage.label(name, name === 'S' ? [0, 0, H + 0.08 * H] : [p[0] * 1.2, p[1] * 1.2, -0.05 * H]));
    }
    // la poignée : la BUSE de l'imprimante (une bille dorée et sa pointe), assez grosse pour le doigt
    const handle = K.handle([0, 0, 0], { radius: 0.2 / u, color: 'amber' });
    const tip = K.cone(0.13 / u, 0.32 / u, { at: [0, 0, -0.1 / u], color: 'slate', opacity: 1 });
    tip.rotation.x = Math.PI;
    handle.add(tip);
    g.add(handle);
    g.add(dyn);
    g.scale.setScalar(u);
    g.visible = false;
    stage.add(g);
    // la vue du solide : la cible au centre du solide (en unités de scène)
    const w = { solid, g, dyn, u, handle, line: null, view: { view: SOLID_VIEW[solid].view, target: center.map((x) => x * u) } };
    // le geste mathématique dans la scène : la buse suit une droite (l'axe, une arête) — orbite suspendue pendant le geste
    stage.draggable(handle, {
      move: ({ onLine }) => {
        if (!w.line || !actions.current.canMove()) return;
        const [p, d, toIndex] = w.line;
        const tt = onLine(p.map((x) => x * w.u), d);
        actions.current.move(toIndex(tt / w.u));
      },
    });
    return w;
  };
  for (const s of cfg.solids) worlds[s] = makeWorld(s);

  const clear = (dyn) => { for (const c of [...dyn.children]) stage.remove(c); };

  // un téléphone en portrait : le champ horizontal rétrécit — on recule la caméra pour que le solide et son plan restent entiers
  let fitted = null;
  const fitView = (force = false) => {
    if (!currentSolid) return;
    const el = stage.container;
    const aspect = Math.max(0.3, (el.clientWidth || 1) / (el.clientHeight || 1));
    const k = Math.max(1, 1.25 / aspect);
    const key = `${currentSolid}|${k.toFixed(2)}`;
    if (!force && key === fitted) return;
    fitted = key;
    const v = worlds[currentSolid].view;
    const view = { ...v.view, distance: v.view.distance * k };
    stage.options.view = view; stage.options.target = v.target;
    stage.setView(view, v.target);
  };
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => fitView()) : null;
  ro?.observe(stage.container);

  const update = ({ lab }) => {
    const stg = lab.stage;
    const solid = L.SOLID_OF[stg];
    if (solid !== currentSolid) {
      for (const [s, w] of Object.entries(worlds)) {
        w.g.visible = s === solid;
        // la buse d'un solide caché est garée loin : le rayon de la souris ne doit pas l'attraper
        if (s !== solid) w.handle.position.set(1e5, 1e5, 1e5);
      }
      currentSolid = solid;
      fitView(true);
    }
    const w = worlds[solid];
    const { dyn, u, handle } = w;
    clear(dyn);
    const st = lab.cfg.stages[stg];
    const i = lab.pos[stg];
    const sec = L.sectionAt(lab, stg, i);
    const printed = lab.layers.some((l) => l.stage === stg && l.i === i);
    const filament = (layer) => L.FILAMENTS[layer.filament % L.FILAMENTS.length];
    const plane = (pts) => { dyn.add(K.polygon(pts, { color: 'sky', opacity: lab.pending ? 0.26 : 0.16 })); dyn.add(K.line(rectPts(pts), { color: 'sky', opacity: 0.9 })); };
    const ghostLine = (pts) => dyn.add(K.line(pts, { color: 'rose', dashed: true, ...dash(u) }));
    const fresh = lab.n !== lastN && lab.last && (lab.last.kind === 'ok' || lab.last.kind === 'refused');
    lastN = lab.n;
    let reveal = null; // l'objet de la couche qui vient d'être imprimée (animé)

    if (stg === 'sphere') {
      const R = n(st.R); const h = n(sec.h); const c = 1.22 * R;
      plane([[-c, -c, h], [c, -c, h], [c, c, h], [-c, c, h]]);
      // la buse à GAUCHE du plan : le rail HTML occupe le bord droit (début de ligne en RTL)
      handle.position.copy(toThree([-c, 0, h]));
      w.line = [[-c, 0, 0], [0, 0, 1], (t) => Math.round(t / n(st.step))];
      for (const layer of lab.layers.filter((l) => l.stage === 'sphere')) {
        const s = L.sectionAt(lab, 'sphere', layer.i);
        const lh = n(s.h);
        if (s.kind === 'point') dyn.add(K.dot([0, 0, lh], { radius: 0.09 / u, color: filament(layer) }));
        else if (s.r) dyn.add(K.ring([0, 0, lh], n(s.r), { color: filament(layer), tube: 0.016 * R, opacity: 0.95 }));
      }
      if (printed && (sec.kind === 'circle' || sec.kind === 'great-circle')) {
        const r = n(sec.r);
        const grp = new Group();
        grp.add(K.disc([0, 0, h], r, { color: 'emerald', opacity: 0.42 }));
        grp.add(K.ring([0, 0, h], r, { color: 'rose', tube: 0.022 * R }));
        dyn.add(grp); reveal = grp;
        const M = [r * 0.94, -r * 0.342, h];
        dyn.add(K.dot(M, { radius: 0.07 / u, color: 'rose' }));
        dyn.add(K.segment([0, 0, h], M, { color: 'rose' }));
        dyn.add(K.segment([0, 0, 0], M, { color: 'ink' }));
        dyn.add(K.segment([0, 0, 0], [0, 0, h], { color: 'ink', dashed: true, ...dash(u) }));
        if (sec.kind === 'circle' && h < R) {
          // l'angle droit en A (le triangle OAM du manuel)
          const s = 0.1 * R; const ux = 0.94; const uy = -0.342;
          dyn.add(K.line([[ux * s, uy * s, h], [ux * s, uy * s, h - s], [0, 0, h - s]], { color: 'rose' }));
          dyn.add(stage.label(foot, [-0.1 * R, 0.1 * R, h + 0.07 * R]));
        }
        dyn.add(stage.label('M', [M[0] * 1.08, M[1] * 1.08, h + 0.08 * R], { color: '#be123c' }));
      }
      if (printed && sec.kind === 'point') dyn.add(K.dot([0, 0, R], { radius: 0.12 / u, color: 'rose' }));
      const gh = lab.ghost && lab.ghost.stage === 'sphere' && lab.ghost.i === i ? lab.ghost.card : null;
      if (gh?.r2 && n(gh.r) > 0) {
        const rho = n(gh.r);
        ghostLine(circlePts([0, 0, h], rho));
        const Mg = [rho * 0.342, -rho * 0.94, h];
        dyn.add(K.dot(Mg, { radius: 0.07 / u, color: 'rose' }));
        dyn.add(K.segment([0, 0, 0], Mg, { color: 'amber', dashed: true, ...dash(u) }));
      }
    } else if (stg === 'cuboid-face' || stg === 'cuboid-edge') {
      const { a, b, c } = st.dims; const A = n(a); const B = n(b); const C = n(c);
      const m = 0.12 * B;
      let pts; let corners; let names;
      if (stg === 'cuboid-face') {
        const x = n(sec.x);
        plane([[x, -m, -m], [x, B + m, -m], [x, B + m, C + m], [x, -m, C + m]]);
        corners = [[x, 0, C], [x, B, C], [x, B, 0], [x, 0, 0]]; names = ['I', 'J', 'K', 'L'];
        handle.position.copy(toThree([x, -m, C + m]));
        w.line = [[0, -m, C + m], [1, 0, 0], (t) => Math.round(t / n(st.step))];
      } else {
        const cm = n(sec.cm); const cn = n(sec.cn); const Mx = A - cm;
        // le plan vertical qui contient (MN), un peu plus large que la section
        const mn = Math.hypot(cm, cn); const ex = (cm / mn) * m; const ey = (cn / mn) * m;
        plane([[Mx - ex, -ey, -m], [A + ex, cn + ey, -m], [A + ex, cn + ey, C + m], [Mx - ex, -ey, C + m]]);
        corners = [[Mx, 0, C], [A, cn, C], [A, cn, 0], [Mx, 0, 0]]; names = ['M', 'N', 'P', 'O'];
        const mid = [(Mx + A) / 2, cn / 2, C + 2 * m];
        handle.position.copy(toThree(mid));
        const dirv = [-0.5, n(st.ratio) / 2, 0];
        const dl = Math.hypot(dirv[0], dirv[1]);
        w.line = [[A, 0, C + 2 * m], dirv, (t) => Math.round(t / dl / n(st.step))];
      }
      for (const layer of lab.layers.filter((l) => l.stage === stg)) {
        const s = L.sectionAt(lab, stg, layer.i);
        const cs = stg === 'cuboid-face' ? [[n(s.x), 0, C], [n(s.x), B, C], [n(s.x), B, 0], [n(s.x), 0, 0]] : [[A - n(s.cm), 0, C], [A, n(s.cn), C], [A, n(s.cn), 0], [A - n(s.cm), 0, 0]];
        dyn.add(K.line(rectPts(cs), { color: filament(layer) }));
      }
      pts = corners;
      if (printed) {
        const grp = new Group(); grp.add(K.polygon(pts, { color: 'emerald', opacity: 0.5 })); grp.add(K.line(rectPts(pts), { color: 'rose' }));
        dyn.add(grp); reveal = grp;
        names.forEach((nm, j) => {
          const p = pts[j]; const off = [p[0] - A / 2, p[1] - B / 2, p[2] - C / 2]; const l = Math.hypot(...off) || 1;
          dyn.add(stage.label(nm, [p[0] + (off[0] / l) * 1.3, p[1] + (off[1] / l) * 1.3, p[2] + (off[2] / l) * 1.3], { color: '#be123c' }));
        });
      }
      const gh = lab.ghost && lab.ghost.stage === stg && lab.ghost.i === i ? lab.ghost.card : null;
      if (gh?.sides) {
        // la couche annoncée, centrée sur la vraie, dans le même plan : elle déborde (ou n'atteint pas) les arêtes
        const w1 = n(gh.sides[0]) / 2; const h1 = n(gh.sides[1]) / 2;
        const cx = (pts[0][0] + pts[1][0]) / 2; const cy = (pts[0][1] + pts[1][1]) / 2; const cz = C / 2;
        const ux = (pts[1][0] - pts[0][0]); const uy = (pts[1][1] - pts[0][1]); const ul = Math.hypot(ux, uy) || 1;
        const e1 = [ux / ul, uy / ul];
        ghostLine(rectPts([[cx - e1[0] * w1, cy - e1[1] * w1, cz + h1], [cx + e1[0] * w1, cy + e1[1] * w1, cz + h1], [cx + e1[0] * w1, cy + e1[1] * w1, cz - h1], [cx - e1[0] * w1, cy - e1[1] * w1, cz - h1]]));
      }
    } else if (stg === 'cylinder-base' || stg === 'cylinder-axis') {
      const r = n(st.r); const H = n(st.h); const m = 0.5 * r;
      if (stg === 'cylinder-base') {
        const z = n(sec.z); const c = r + m;
        plane([[-c, -c, z], [c, -c, z], [c, c, z], [-c, c, z]]);
        handle.position.copy(toThree([-c, 0, z]));
        w.line = [[-c, 0, 0], [0, 0, 1], (t) => Math.round(t / n(st.step))];
        for (const layer of lab.layers.filter((l) => l.stage === stg)) dyn.add(K.ring([0, 0, n(L.valueOf(lab, stg, layer.i))], r, { color: filament(layer), tube: 0.012 * H }));
        if (printed) {
          const grp = new Group(); grp.add(K.disc([0, 0, z], r, { color: 'emerald', opacity: 0.45 })); grp.add(K.ring([0, 0, z], r, { color: 'rose', tube: 0.016 * H }));
          dyn.add(grp); reveal = grp;
          dyn.add(K.dot([0, 0, z], { radius: 0.06 / u })); dyn.add(stage.label('B', [0.18 * r, 0.18 * r, z + 0.05 * H], { color: '#be123c' }));
          dyn.add(K.segment([0, 0, z], [r * 0.94, -r * 0.342, z], { color: 'rose', dashed: true, ...dash(u) }));
        }
      } else {
        const d = n(sec.d);
        plane([[-d, -r - m, -0.1 * H], [-d, r + m, -0.1 * H], [-d, r + m, 1.1 * H], [-d, -r - m, 1.1 * H]]);
        handle.position.copy(toThree([-d, 0, 1.22 * H]));
        w.line = [[0, 0, 1.22 * H], [-1, 0, 0], (t) => Math.round(t / n(st.step))];
        for (const layer of lab.layers.filter((l) => l.stage === stg)) {
          const s = L.sectionAt(lab, stg, layer.i); const dd = n(s.d);
          if (s.kind === 'rectangle') { const hw = n(s.half); dyn.add(K.line(rectPts([[-dd, hw, H], [-dd, -hw, H], [-dd, -hw, 0], [-dd, hw, 0]]), { color: filament(layer) })); }
          if (s.kind === 'segment') dyn.add(K.segment([-dd, 0, H], [-dd, 0, 0], { color: filament(layer) }));
        }
        if (d > 0) { dyn.add(K.segment([0, 0, H], [-d, 0, H], { color: 'ink', dashed: true, ...dash(u) })); }
        if (printed && sec.kind === 'rectangle') {
          const hw = n(sec.half); const pts = [[-d, hw, H], [-d, -hw, H], [-d, -hw, 0], [-d, hw, 0]];
          const grp = new Group(); grp.add(K.polygon(pts, { color: 'emerald', opacity: 0.5 })); grp.add(K.line(rectPts(pts), { color: 'rose' }));
          dyn.add(grp); reveal = grp;
          ['K', 'I', 'L', 'J'].forEach((nm, j) => dyn.add(stage.label(nm, [pts[j][0] - 0.15 * r, pts[j][1] * 1.25, pts[j][2] + (j < 2 ? 0.06 : -0.06) * H], { color: '#be123c' })));
          if (d > 0) dyn.add(stage.label('H', [-d - 0.12 * r, 0, H + 0.08 * H], { color: '#be123c' }));
          dyn.add(K.segment([0, 0, H], [-d, -hw, H], { color: 'rose', dashed: true, ...dash(u) }));
        }
        if (printed && sec.kind === 'segment') { const grp = new Group(); grp.add(K.segment([-d, 0, H], [-d, 0, 0], { color: 'rose' })); dyn.add(grp); reveal = grp; }
        const gh = lab.ghost && lab.ghost.stage === stg && lab.ghost.i === i ? lab.ghost.card : null;
        if (gh?.sides) { const hw = n(gh.sides[0]) / 2; ghostLine(rectPts([[-d, hw, H], [-d, -hw, H], [-d, -hw, 0], [-d, hw, 0]])); }
      }
    } else {
      const side = n(st.side); const H = n(st.H); const k = n(sec.k); const z = (1 - k) * H; const e = (side / 2) * k; const c = side * 0.8;
      plane([[-c, -c, z], [c, -c, z], [c, c, z], [-c, c, z]]);
      handle.position.copy(toThree([-c, 0, z]));
      w.line = [[-c, 0, 0], [0, 0, 1], (t) => Math.round((t / H) * 8)];
      for (const layer of lab.layers.filter((l) => l.stage === 'pyramid')) {
        const s = L.sectionAt(lab, 'pyramid', layer.i); const kk = n(s.k); const zz = (1 - kk) * H; const ee = (side / 2) * kk;
        dyn.add(K.line(rectPts([[-ee, -ee, zz], [ee, -ee, zz], [ee, ee, zz], [-ee, ee, zz]]), { color: filament(layer) }));
      }
      if (printed) {
        const pts = [[-e, -e, z], [e, -e, z], [e, e, z], [-e, e, z]];
        const grp = new Group(); grp.add(K.polygon(pts, { color: 'emerald', opacity: 0.5 })); grp.add(K.line(rectPts(pts), { color: 'rose' }));
        dyn.add(grp); reveal = grp;
        dyn.add(K.segment(pts[0], pts[2], { color: 'rose', dashed: true, ...dash(u) }));
        ['E', 'F', 'G', 'H'].forEach((nm, j) => dyn.add(stage.label(nm, [pts[j][0] * 1.35, pts[j][1] * 1.35, z + 0.05 * H], { color: '#be123c' })));
      }
      const gh = lab.ghost && lab.ghost.stage === 'pyramid' && lab.ghost.i === i ? lab.ghost.card : null;
      if (gh?.sides) { const g2 = n(gh.sides[0]) / 2; ghostLine(rectPts([[-g2, -g2, z], [g2, -g2, z], [g2, g2, z], [-g2, g2, z]])); }
    }
    // « une ellipse ? » : la vue passe au-dessus — c'est un cercle
    if (fresh && lab.last.kind === 'refused' && lab.last.card?.kind === 'baydawi') stage.setView({ ...w.view.view, elevation: 80 }, w.view.target);
    // la couche qui vient d'être imprimée apparaît comme déposée par la buse (sauf mouvement réduit)
    if (fresh && reveal && !reduce) {
      const t0 = performance.now();
      reveal.scale.setScalar(0.05);
      stage.animate((now) => {
        const f = Math.min(1, (now - t0) / 450);
        reveal.scale.setScalar(0.05 + 0.95 * (1 - (1 - f) ** 3));
        return f < 1;
      });
    }
  };
  return { update, dispose() { ro?.disconnect(); } };
}

/* ════════════════════════════ le décor : l'imprimante 3D du fablab (aria-hidden, sans information) ════════════════════════════ */

function PrinterDeco({ filament, printing, n: count, reduce, onSpool }) {
  const color = L.FILAMENTS[filament % L.FILAMENTS.length];
  const gid = `sl-bg-${useId().replace(/:/g, '')}`;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true" data-deco="3d-printer">
      <svg className="h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e0f2fe" /><stop offset="0.7" stopColor="#f8fafc" /><stop offset="1" stopColor="#e2e8f0" /></linearGradient>
        </defs>
        <rect x="0" y="0" width="400" height="300" fill={`url(#${gid})`} />
        {/* la grille du plateau chauffant, en bas */}
        {Array.from({ length: 11 }, (_, j) => <line key={`g${j}`} x1={40 + j * 32} y1={268} x2={20 + j * 36} y2={300} stroke="#94a3b8" strokeWidth="1" />)}
        <rect x="18" y="262" width="364" height="8" rx="3" fill="#475569" />
        {/* les montants et le portique */}
        <rect x="6" y="10" width="10" height="282" rx="3" fill="#64748b" />
        <rect x="384" y="10" width="10" height="282" rx="3" fill="#64748b" />
        <rect x="6" y="6" width="388" height="10" rx="3" fill="#94a3b8" />
        {[30, 90, 150, 210, 270].map((y) => <circle key={y} cx="11" cy={y} r="2" fill="#cbd5e1" />)}
        {/* la bande LED RGB (s'allume quand une couche s'imprime) */}
        <rect x="22" y="18" width="356" height="4" rx="2" fill={printing ? color : '#cbd5e1'} opacity={printing ? 0.9 : 0.8}>
          {printing && !reduce && <animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" repeatCount="indefinite" />}
        </rect>
        {/* autocollants de l'atelier */}
        <g transform="translate(352 238)"><rect width="22" height="16" rx="3" fill="#006233" /><rect x="11" width="11" height="16" fill="#ffffff" /><circle cx="12" cy="8" r="4.5" fill="#d21034" /><circle cx="13.6" cy="8" r="3.8" fill="#ffffff" /></g>
        <g transform="translate(28 236)" opacity="0.9"><rect width="18" height="18" rx="4" fill="#a855f7" /><path d="M5 6 h3 v3 h-3z M10 6 h3 v3 h-3z M5 11 h8 v2 h-8z" fill="#fff" /></g>
        <text x="200" y="292" textAnchor="middle" fontSize="9" fill="#94a3b8" direction="rtl">{count > 0 ? '●'.repeat(Math.min(count, 12)) : ''}</text>
      </svg>
      {/* la bobine de filament : la toucher change la couleur de la PROCHAINE couche (décor) */}
      <button type="button" tabIndex={-1} onClick={onSpool} className="pointer-events-auto absolute bottom-14 end-4 h-7 w-7 rounded-full focus:outline-none" style={{ background: `radial-gradient(circle at 50% 50%, #0f172a 0 22%, ${color} 24% 70%, #e2e8f0 72%)` }} data-deco="spool" />
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de chaque étage : la sphère finit par la RÈGLE ; les solides posent un calcul sur SA couche puis ce qui reste constant ou varie. */
export function chainOf(id) {
  return ({
    sphere: ['sphR2', 'sphEdge', 'rule'],
    'cuboid-face': ['cfArea', 'cfSame'],
    'cuboid-edge': ['ceSame', 'ceMN'],
    'cylinder-base': ['cbR', 'cbSame'],
    'cylinder-axis': ['caHalf2', 'caLess'],
    pyramid: ['pySide', 'pyShape'],
  })[id];
}

const $ = (x) => `$${x}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const sqf = (p) => linear.mul(L.toFrac(plain(p)), L.toFrac(plain(p)));
const plain = (p) => (p && typeof p === 'object' && 'q' in p && p.r === 1 ? p.q : p);   // une longueur rationnelle écrite en racine { q, r: 1 }
const tx = (p) => L.lengthTex(plain(p));
const ft = (p) => linear.fracText(L.toFrac(plain(p)));
const choice = (k, id, o, texts, right, hints, explain) => ({
  id, kind: 'choice', cols: 1, prompt: Cq(k, `${id}.prompt`, o),
  options: spread(texts.map(([key, why], i) => ({ text: Cq(k, `${id}.${key}`, o), correct: i === right, why: i === right ? undefined : Cq(k, `${id}.${why}`, o) })), id.length),
  hints: hints.map((h) => Cq(k, `${id}.${h}`, o)), explain: Cq(k, `${id}.${explain}`, o),
});
const num = (k, id, o, expected, answer, explain = 'explain') => ({
  id, kind: 'number', expected, answer: <MathText>{$(answer)}</MathText>,
  prompt: Cq(k, `${id}.prompt`, o), hints: [Cq(k, `${id}.hint1`, o), Cq(k, `${id}.hint2`, o)], explain: Cq(k, `${id}.${explain}`, o),
});

/** Chaque question est construite sur LES nombres de la couche de l'élève (rien n'est écrit en dur) ; `k` : les textes de `sectionSlicer`. */
export const QUESTIONS = {
  sphR2: ({ lab, step, letter }, k) => {
    const st = lab.cfg.stages.sphere; const h = step.trial.value;
    const r2 = linear.sub(sqf(st.R), sqf(h));
    const o = { l: letter, h: tx(h), R: tx(st.R), R2: tx(sqf(st.R)), h2: tx(sqf(h)), r2: tx(r2) };
    return num(k, 'sphR2', o, ft(r2), tx(r2));
  },
  sphEdge: ({ lab, letter }, k) => {
    const st = lab.cfg.stages.sphere;
    const t = lab.trials.find((x) => x.stage === 'sphere' && (x.kind === 'point' || x.kind === 'none'));
    const kind = t?.kind === 'none' ? 'none' : 'point';
    const o = { l: letter, h: t ? tx(t.value) : tx(st.R), R: tx(st.R) };
    return choice(k, `sphEdge.${kind}`.replace('.', '_'), o, [['a'], ['b', 'whyB'], ['c', 'whyC']], 0, ['hint1', 'hint2'], 'explain');
  },
  rule: ({ options, formal, letter }, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k('dPrompt', { l: letter })}</MathText>, options,
    hints: [Cq(k, 'rule.hint1', { l: letter }), Cq(k, 'rule.hint2', { l: letter })], explain: formal,
  }),
  cfArea: ({ step }, k) => {
    const [a, b] = step.trial.section.sides;
    const o = { a: $(tx(a)), b: $(tx(b)), area: tx(step.trial.section.area) };
    return num(k, 'cfArea', o, ft(step.trial.section.area), tx(step.trial.section.area));
  },
  cfSame: ({ step }, k) => {
    const [a, b] = step.trial.section.sides;
    return choice(k, 'cfSame', { a: $(tx(a)), b: $(tx(b)) }, [['same'], ['grow', 'whyGrow'], ['shrink', 'whyShrink']], 0, ['hint1', 'hint2'], 'explain');
  },
  ceSame: ({ step }, k) => {
    const s = step.trial.section;
    const mn2 = linear.add(sqf(s.cm), sqf(s.cn));
    return choice(k, 'ceSame', { cg: $(tx(s.sides[1])), cm: $(tx(s.cm)), mn2: $(tx(mn2)) }, [['cg'], ['mn', 'whyMn'], ['both', 'whyBoth']], 0, ['hint1', 'hint2'], 'explain');
  },
  ceMN: ({ step }, k) => {
    const s = step.trial.section;
    const mn2 = linear.add(sqf(s.cm), sqf(s.cn));
    const o = { cm: $(tx(s.cm)), cn: $(tx(s.cn)), cm2: tx(sqf(s.cm)), cn2: tx(sqf(s.cn)), mn2: tx(mn2) };
    return num(k, 'ceMN', o, ft(mn2), tx(mn2));
  },
  cbR: ({ lab }, k) => {
    const st = lab.cfg.stages['cylinder-base'];
    return num(k, 'cbR', { r: $(tx(st.r)) }, ft(st.r), tx(st.r));
  },
  cbSame: ({ lab }, k) => choice(k, 'cbSame', { r: $(tx(lab.cfg.stages['cylinder-base'].r)) }, [['same'], ['grow', 'whyGrow'], ['shrink', 'whyShrink']], 0, ['hint1', 'hint2'], 'explain'),
  caHalf2: ({ lab, step }, k) => {
    const st = lab.cfg.stages['cylinder-axis']; const d = step.trial.section.d;
    const res = linear.sub(sqf(st.r), sqf(d));
    const o = { d: $(tx(d)), r: $(tx(st.r)), r2: tx(sqf(st.r)), d2: tx(sqf(d)), res: tx(res) };
    return num(k, 'caHalf2', o, ft(res), tx(res));
  },
  caLess: ({ lab, step }, k) => {
    const st = lab.cfg.stages['cylinder-axis'];
    return choice(k, 'caLess', { d: $(tx(step.trial.section.d)), r: $(tx(st.r)) }, [['less'], ['more', 'whyMore'], ['same', 'whySame']], 0, ['hint1', 'hint2'], 'explain');
  },
  pySide: ({ lab, step }, k) => {
    const st = lab.cfg.stages.pyramid; const s = step.trial.section;
    const o = { k: $(tx(s.k)), b: $(tx(st.side)), side: tx(s.side) };
    return num(k, 'pySide', o, ft(s.side), tx(s.side));
  },
  pyShape: ({ step }, k) => choice(k, 'pyShape', { k: $(tx(step.trial.section.k)) }, [['square'], ['rect', 'whyRect'], ['tri', 'whyTri']], 0, ['hint1', 'hint2'], 'explain'),
};
