import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import * as Rot from '@smarter-academy/core/arithmetic/rotation.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import { useManipulationImmersive } from '../immersive';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useDragInteraction from '../useDragInteraction';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import MovablePanel from '../primitives/MovablePanel';
import MathText from '../../components/MathText';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import * as L from '../logic/shapeTurn';

/**
 * shape-turn — LE PAPIER CALQUE ÉPINGLÉ (unité 13 « الدوران - الزوايا - المضلّعات المنتظمة », leçon « خواص الدوران
 * وتوظيفها في الأشكال الهندسية », manuel pp. 154–155, 158–161).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève TOURNE une feuille de papier calque (le « ورق شفاف » du manuel) épinglée en O, en tirant son coin (ou ±1°,
 *    ±10°, flèches, Maj + flèche = 10°) ; il peut aussi l'ÉTIRER par un faux mors ↔ (ce n'est plus un دوران). مبتدئ : il
 *    IMPRIME des copies d'un pétale de zellige pour former une rosace ; متقدم : il fait tomber la copie de [AC] sur [BD],
 *    porte des cartes de propriétés sur deux affirmations, puis pose l'épingle W d'un دوران inconnu (تمرين 18).
 * B. Idée : le دوران est une isométrie — il garde les longueurs, la استقامية, les زوايا, les مساحات ; une droite et son
 *    image font l'angle du دوران (90° ⇒ ⊥, 180° ⇒ ∥) ; d'où AC = BD et (AC) ⊥ (BD) ; le centre est à égale distance de
 *    chaque point et de son image (intersection de deux médiatrices).
 * C. La copie tourne sous le doigt ; les JAUGES (une lame flottante, MovablePanel) restent figées (longueur, angle, aire,
 *    alignement) pendant que l'angle entre la droite et son image suit θ ; étirée, la feuille fait bouger les jauges.
 * D. Les jauges en îlots KaTeX (A′B′ = 3, ∠, aire, A′, I′, B′ alignés, l'angle entre (AB) et (A′B′)) ; à la découverte :
 *    « الدوران يحافظ على الأطوال، استقامية النقط، الزوايا والمساحات » ; AC = BD = √41, (AC) ⊥ (BD).
 * E. Avant la règle : une rosace complète ET une feuille étirée refusée (« ليس دورانا: تغيّر الطول ») ; [AC] posé sur
 *    [BD] ET deux affirmations prouvées (une carte qui prouve autre chose est refusée en le disant).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        le دوران conserve longueurs, alignement, angles, aires ; droite et image font l'angle α
 *   OBJECT         la feuille de papier calque et la copie qu'elle porte ; l'épingle W (seconde scène)
 *   VARIABLE       θ, la rotation de la feuille (degrés signés, > 0 direct) — et, en contraste, l'étirement k
 *   INVARIANT      longueur, angle, aire, alignement de la copie (tant que k = 1) ; O fixe
 *   TRANSFORMATION la position et la DIRECTION de la copie ; l'angle entre (AB) et (A′B′)
 *   CONSTRAINT     la feuille ne fait que tourner autour de l'épingle ; une copie s'imprime seulement si elle est l'image
 *                  d'une copie posée par (O, α, sens)
 *   RESISTANCE     impression refusée : feuille étirée (« ليس دورانا: تغيّر الطول », les deux longueurs), angle mesuré
 *                  faux, sens contraire, place déjà prise ; [AC] qui manque [BD] (« il reste 30° ») ; une carte de preuve
 *                  qui prouve autre chose ; une épingle hors d'une médiatrice (« WP² = 1 لكن WP′² = 5 ») ; deux
 *                  médiatrices confondues
 *   EVIDENCE       la rosace qui se ferme ; la copie qui couvre [BD] ; l'épingle acceptée en (2 ; 4)
 *   CONTRAST       la feuille vraie / la feuille étirée ; 60° direct / −60° ; 90° / autre angle
 *   PREDICTION     « dans quel sens tourner pour que A tombe sur B ? » ; « quelle carte prouve AC = BD ? »
 *   DISCOVERY      « le دوران garde longueurs, angles, alignement et aires » ; « (BD) ⊥ (AC) parce que [BD] est
 *                  l'image de [AC] par un دوران de 90° »
 *   FORMALIZATION  معارف 3 p. 154 + la propriété « صورة مستقيم بدوران زاويته 90° تعامده » (ajout déclaré) ; la طريقة p. 155
 *   TRANSFER       تمارين 4, 6, 8, 17, 18 ; la synthèse (rotations de 60° / 72°)
 *
 * Monde (`theme`) : `zellige` — une rosace de zellige de Tlemcen, la feuille calque de l'artisan. Manuel (§6bis) : chaque
 * impression, chaque carte, chaque épingle est un essai jugé ; aucune auto-complétion.
 *
 * DÉCOR (exigence du propriétaire) : la bordure de zellige, l'étoile à huit branches en fond, le téléphone qui « prend la
 * story » de la rosace au toucher. `aria-hidden`, hors clavier, `[data-deco]`, jamais une information (aucune longueur,
 * aucun angle), immobile sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (§8bis) : la scène est CARRÉE, budgétée sur l'écran de leçon (`useLessonViewport` moins ce que le bloc
 * `[data-st-glance]` prend en plus du dessin) ; la poignée est sur la scène (le coin de la feuille, et le mors ↔ sur son
 * bord) ; la rangée ±1° / ±10° / lecture / « اطبع » juste dessous ; les jauges flottent sur la scène dans un
 * `MovablePanel` (sous 420 px de large : une ligne compacte sous les commandes) ; la ligne de verdict sous le tout. Les
 * cartes de preuve et la liste des essais sont dans des `LabFold` SOUS le bloc mesuré.
 *
 * Props : `numbers` (ou à plat) `mode` ('rosette' | 'prove'), `center`, `alpha`, `direction`, `shape` (rosette),
 * `points` + `centerTask` (prove) — levels.js › 'shape-turn' ; `theme`, `title`, `lead`, `mission`, `level`, `levels`,
 * `onTrial(evidence)` à chaque essai, `onFinished({ mode, … })` à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-shape-turn][data-mode][data-stage][data-world][data-solved], [data-st-glance], [data-st-scene],
 * [data-st-handle] (role=slider, aria-valuenow = θ), [data-st-stretch] (role=slider), [data-st-turn=<±1|±10>],
 * [data-st-theta], [data-st-stamp], [data-st-unstretch], [data-st-copy=<n>], [data-st-gauges][data-st-gauge=<key>],
 * [data-st-between], [data-st-verdict=<kind>], [data-st-claim=<id>][data-st-claim-ok], [data-st-card=<id>],
 * [data-st-center-open], [data-st-back], [data-st-pin] (bouton, flèches), [data-st-pin-place], [data-st-bisector=<M|N|P>],
 * [data-lab-fold=shape-turn.claims|shape-turn.trials], [data-deco],
 * [data-st-step=<i>] (LabStepper : 2 étapes en 'rosette', 3 en 'prove').
 *
 * QUESTIONS PENDANT LE LABO (2026-10-28, lot 3 ; `primitives/LabCheckpoint`) : `STEPS` (étape → objectif atteint → suite de questions `QUESTIONS`).
 * rosette : r1 la rosace fermée (nombre de pétales · longueur gardée · angle entre (AB) et (A′B′)), r2 la feuille étirée (ليس دورانا) puis la RÈGLE ;
 * prove : p1 [AC] sur [BD] (angle · image), p2 les deux affirmations prouvées (longueur) puis la RÈGLE, p3 le centre W (محور · deux محورين · angle).
 * Une étape s'ouvre quand son objectif est atteint ET que les précédentes sont répondues ; la suite qui finit par `rule` remplace la découverte
 * automatique (`state.discover(); state.formalize()`). « أعِد التجربة » : `logic/shapeTurn.js › retryStep`. Réglage enseignant `useLabCheckpointSettings('shape-turn')`
 * (`headerAction`) ; questions actives ⇒ `guided`. Sons (`playSfx`) : déclic de la feuille, `bell` par copie imprimée, `flag` (rosace fermée, [BD] atteint,
 * épingle acceptée), `over` (impression refusée, feuille étirée, carte refusée, épingle refusée). Le stepper ouvre `[data-st-glance]` (la scène en tient compte,
 * y compris en plein écran : `useManipulationImmersive`).
 */
const NUMBER_KEYS = ['mode', 'center', 'alpha', 'direction', 'shape', 'points', 'centerTask'];
const TP = { style: { direction: 'ltr', unicodeBidi: 'isolate' }, fontFamily: 'ui-sans-serif, system-ui, sans-serif' };
const ZELLIGE = ['#047857', '#1D4ED8', '#B45309', '#0F766E', '#7C2D12', '#4338CA'];
const btn = 'inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 px-2 text-sm font-bold disabled:opacity-40 focus:outline-none focus-visible:ring-2';
const prime = (n) => `${n}′`;

export default function ShapeTurn(props) {
  const { numbers: grouped, theme = 'zellige', title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true,
    initialMode = 'student', allowModeSwitch = false, onTrial, onFinished } = props;
  const authored = useMemo(() => {
    const out = {};
    for (const key of NUMBER_KEYS) {
      const v = grouped?.[key] ?? props[key];
      if (v != null) out[key] = v;
    }
    if (!out.mode) out.mode = 'rosette';
    return out;
  }, [grouped, props]); // eslint-disable-line react-hooks/exhaustive-deps
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.shapeTurn.${key}`, o), [t]);
  const state = useManipulation({ type: 'shape-turn', initialNumbers: authored, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const mode = nums.mode === 'prove' ? 'prove' : 'rosette';
  const m = useCallback((key, o) => k(`${mode}.${key}`, o), [k, mode]);
  const numKey = JSON.stringify(NUMBER_KEYS.map((x) => nums[x] ?? null));
  const make = () => L.init(nums);
  const [lab, setLab] = useState(make);
  const sceneKey = `${numKey}|${state.epoch}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [doneIds, setDoneIds] = useState({});
  if (scene.key !== sceneKey) {
    // « إعادة » (epoch), un autre niveau ou d'autres nombres : TOUT recommence — la feuille, les essais, les questions du labo
    setScene({ key: sceneKey, inits: scene.inits + 1 });
    setLab(make());
    setDoneIds({});
  }

  const ready = L.discoveryReady(lab);
  // les questions pendant le labo : obligatoires pour tout élève, l'enseignant seul les coupe pour SON compte (L2)
  const cpSettings = useLabCheckpointSettings('shape-turn');
  const cpLive = cpOn && cpSettings.enabled;
  useEffect(() => { if (ready && !cpLive) state.discover(); }, [ready, state.epoch, cpLive]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!state.isFormal) return;
    state.report(onFinished, mode === 'prove' ? { mode, landed: lab.landed } : { mode, stamps: lab.stamps.length });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const nEvents = lab.trials.length;
  useEffect(() => { if (nEvents > 0) { const e = L.evidenceOf(lab); if (e) state.report(onTrial, e); } }, [nEvents]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la découverte : des distracteurs réfutés par les essais de l'élève ── */
  const discoveryOptions = useMemo(() => {
    const stretched = lab.trials.find((e) => e.kind === 'stretch' && !e.rotation);
    if (mode === 'prove') {
      const off = lab.trials.find((e) => e.kind === 'turn' && e.landing === 'miss' && e.between > 0 && e.between < 90);
      return [
        { text: <MathText>{m('dOptLength')}</MathText>, why: <MathText>{off ? m('dWhyLength', { theta: off.theta, between: off.between }) : m('dWhyLengthNone')}</MathText> },
        { text: <MathText>{m('dOptRight')}</MathText>, correct: true },
        { text: <MathText>{m('dOptEquilateral')}</MathText>, why: <MathText>{m('dWhyEquilateral')}</MathText> },
      ];
    }
    const first = lab.trials.find((e) => e.kind === 'stamp');
    const g = L.gauges(lab, 0, 10);
    return [
      { text: <MathText>{m('dOptLengthOnly')}</MathText>, why: <MathText>{m('dWhyLengthOnly', { angle: g.angle.orig, area: g.area.orig })}</MathText> },
      { text: <MathText>{m('dOptAll')}</MathText>, correct: true },
      { text: <MathText>{m('dOptDirection')}</MathText>, why: <MathText>{first ? m('dWhyDirection', { theta: first.theta, between: L.gauges(lab, first.theta, 10).between }) : m('dWhyDirectionNone')}</MathText> },
      { text: <MathText>{m('dOptStretch')}</MathText>, why: <MathText>{stretched ? m('dWhyStretch', { orig: stretched.orig, copy: stretched.copy }) : m('dWhyStretchNone')}</MathText> },
    ];
  }, [lab, m, mode]);

  const steps = STEPS[mode];
  const stepDone = steps.map((st) => !!doneIds[st.id] || (!cpLive && st.reached(lab)));
  const nextStep = cpLive ? steps.find((st) => !doneIds[st.id]) : null;
  const cpId = nextStep && nextStep.reached(lab) ? nextStep.id : null;
  const chain = cpId ? nextStep.chain : null;
  const formal = mode === 'prove' ? (
    <div className="space-y-2" data-st-formal>
      <EquationDisplay tone="result" tex={'AC = BD = \\sqrt{41}'} note={m('fNoteLength')} />
      <EquationDisplay tone="result" tex={'(AC) \\perp (BD)'} note={m('fNotePerp')} />
      <p className="text-sm text-emerald-900"><MathText>{m('fRule')}</MathText></p>
    </div>
  ) : (
    <div className="space-y-2" data-st-formal>
      <p className="rounded-xl border-2 border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">{m('fRule')}</p>
      <p className="text-sm text-emerald-900"><MathText>{m('fLine')}</MathText></p>
    </div>
  );

  // le stepper ouvre le bloc « d'un seul regard » (`[data-st-glance]`) : la hauteur de la scène en tient compte
  const stepper = <LabStepper count={steps.length} current={Math.max(0, stepDone.indexOf(false) < 0 ? steps.length - 1 : stepDone.indexOf(false))} done={stepDone} stepAttr="data-st-step" />;
  const cp = useLabCheckpoint({
    id: cpId,
    questions: chain ? chain.map((q) => QUESTIONS[q]({ lab, options: discoveryOptions, formal, m, mode }, k)) : null,
    reached: !!cpId,
    resetKey: scene.inits,
    onRetry: () => setLab((s) => L.retryStep(s, cpId, nums)),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setDoneIds((d) => ({ ...d, [id]: true }));
      if (steps.find((st) => st.id === id)?.chain.includes('rule')) { state.discover(); state.formalize(); }
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
      party.celebrate({ n: i + 1, total: steps.length });
    });
  }, [doneKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le son : la rosace qui se ferme, la feuille qui tombe sur [BD] et l'épingle acceptée sonnent « flag » ── */
  const heard = useRef({ rosette: false, landed: false, center: false, n: 0 });
  useEffect(() => {
    const h = heard.current;
    const flags = { rosette: L.rosetteDone(lab), landed: !!lab.landed, center: !!lab.center };
    if (lab.trials.length === 0) { heard.current = { ...flags, n: 0 }; return; }
    if ((flags.rosette && !h.rosette) || (flags.landed && !h.landed) || (flags.center && !h.center)) playSfx('flag');
    else if (lab.trials.length !== h.n) {
      const e = lab.last;
      if (e?.kind === 'stamp') playSfx('bell');
      else if (e?.kind === 'refuse' || (e?.kind === 'stretch' && !e.rotation) || (e?.kind === 'claim' && !e.ok) || (e?.kind === 'pin' && !e.ok)) playSfx('over');
    }
    heard.current = { ...flags, n: lab.trials.length };
  }, [lab]);   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ManipulationShell
      type="shape-turn"
      title={title ?? m('title')}
      mission={mission ?? <MathText>{lab.stage === 'center' ? k('center.mission') : m('mission', { alpha: lab.alpha })}</MathText>}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided={cpLive}
      hints={['hint1', 'hint2', 'hint3'].map((hk) => <MathText key={hk}>{lab.stage === 'center' ? k(`center.${hk}`) : m(hk, { alpha: lab.alpha })}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={<ManipulationDiscovery state={state} prompt={<MathText>{m('dPrompt')}</MathText>} options={discoveryOptions} formal={formal} />}
      explanation={<MathText>{m('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-emerald-50/60 to-white" minHeight="min-h-[150px]">
        <div className="relative space-y-2" data-st-root>
          {party.node}
          {cp.node}
          {lab.stage === 'center'
            ? <CenterLab lab={lab} setLab={setLab} k={k} theme={theme} top={stepper} />
            : <TurnLab lab={lab} setLab={setLab} k={k} m={m} theme={theme} solved={ready} formal={state.isFormal} top={stepper} />}
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
  const [overhead, setOverhead] = useState(170);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(200, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(100, Math.ceil(glanceRef.current.getBoundingClientRect().height) - drawnH.current));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (glanceRef.current) ro.observe(glanceRef.current);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const immersed = useManipulationImmersive();   // plein écran (L7) : l'écran moins la barre « خروج / الصوت / إعادة » du shell
  const lessonH = vp.ready && vp.height > 0 ? vp.height : 640;
  const screenH = immersed && typeof window !== 'undefined' ? Math.min(lessonH, window.innerHeight - 96) : lessonH;
  const budget = Math.round(Math.max(min, Math.min(max, screenH - overhead - 20)));
  return { boxRef, glanceRef, drawnH, width, budget };
}

const poly = (pts) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

/* ════════════════════════════ la feuille qui tourne (rosace / طريقة) ════════════════════════════ */

function TurnLab({ lab, setLab, k, m, theme, solved, formal, top }) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const { boxRef, glanceRef, drawnH, width, budget } = useBudget(220, 600);
  const narrow = width < 420;
  const size = Math.max(200, Math.min(width, budget, 620));
  drawnH.current = size;
  const G = L.sceneLayout(lab, { size, pad: 22 });
  const sceneRef = useRef(null);
  const [liveT, setLiveT] = useState(null);
  const [liveK, setLiveK] = useState(null);
  const theta = liveT ?? lab.theta;
  const stretch = liveK ?? lab.stretch;
  const thetaRef = useRef(theta); thetaRef.current = theta;
  const tooth = useRef({ theta, at: 0 });
  useEffect(() => {   // le geste : un déclic par pas de la feuille (au plus un toutes les 35 ms, plus grave en arrière)
    const p = tooth.current;
    const d = theta - p.theta;
    p.theta = theta;
    if (d === 0) return;
    const now = performance.now();
    if (now - p.at > 35) { playSfx('tooth', { pitch: d > 0 ? 1 : 0.75 }); p.at = now; }
  }, [theta]);
  const O = { x: Number(lab.O.x.n) / Number(lab.O.x.d), y: Number(lab.O.y.n) / Number(lab.O.y.d) };
  const Opx = [G.X(O.x), G.Y(O.y)];
  const P = (p) => [G.X(p.x), G.Y(p.y)];
  const W = (n) => { const p = lab.pts[n]; return { x: Number(p.x.n) / Number(p.x.d), y: Number(p.y.n) / Number(p.y.d) }; };

  /* la feuille : un rectangle (repère de la feuille, origine O) autour de ce qu'elle porte */
  const { x0: sx0, x1: sx1, y0: sy0, y1: sy1 } = L.sheetRect(lab);
  const corner = { x: sx1, y: sy1 };                                    // le coin saisi (haut, droite à θ = 0)
  const cornerBase = Rot.bearing({ x: 0, y: 0 }, corner);
  const kk = stretch / 10;
  const toWorld = (loc, t = theta, kx = kk) => Rot.rotateApprox({ x: O.x + loc.x * kx, y: O.y + loc.y }, O, Math.abs(t), t < 0 ? 'indirect' : 'direct');
  const cornerW = toWorld(corner);
  const handleLoc = L.stretchHandle(lab);                               // le faux mors : la place la plus libre (logic)
  const edgeLoc = { x: handleLoc.x, y: handleLoc.y };
  const edgeW = toWorld(edgeLoc);

  const pointerWorld = (cx, cy) => {
    const r = sceneRef.current?.getBoundingClientRect();
    if (!r) return null;
    return G.toWorld((cx - r.left) * (size / r.width), (cy - r.top) * (size / r.height));
  };
  const rot = useStretchInteraction({
    value: theta, range: L.TURN, direction: 'ltr', pageStep: 10,
    toValue: (cx, cy) => { const p = pointerWorld(cx, cy); return p ? L.pointerTheta(O, p, thetaRef.current, cornerBase) : thetaRef.current; },
    onChange: (v) => setLiveT(v),
    onCommit: (v) => { setLiveT(null); setLab((s) => L.turn(s, v)); },
  });
  const str = useStretchInteraction({
    value: stretch, range: L.STRETCH, direction: 'ltr', pageStep: 1,
    toValue: (cx, cy) => {
      const p = pointerWorld(cx, cy);
      if (!p) return stretch;
      const a = ((theta % 360) * Math.PI) / 180;
      const along = (p.x - O.x) * Math.cos(a) + (p.y - O.y) * Math.sin(a);   // la projection sur le bord de la feuille
      return (10 * along) / edgeLoc.x;
    },
    onChange: (v) => setLiveK(v),
    onCommit: (v) => { setLiveK(null); setLab((s) => L.stretchTo(s, v)); },
  });
  // Maj + flèche = 10° (le brief : ←/→ = ∓1°, Maj = 10°)
  const handleProps = rot.handleProps({ label: k('handle'), valueText: k('handleText', { theta: Math.abs(theta), dir: theta < 0 ? k('indirect') : k('direct') }) });
  const onKeyDown = (e) => {
    if (e.shiftKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      rot.set(thetaRef.current + (e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 10 : -10));
      return;
    }
    handleProps.onKeyDown(e);
  };
  // un appui près de l'épingle ne fait pas tourner la feuille (un tap distrait)
  const trackDown = (e) => {
    const p = pointerWorld(e.clientX, e.clientY);
    if (p && Math.hypot(p.x - O.x, p.y - O.y) < (G.x1 - G.x0) * 0.08) return;
    rot.trackProps.onPointerDown(e);
  };

  const g = L.gauges({ ...lab, theta, stretch }, theta, stretch);
  const [a, b] = lab.mode === 'rosette' ? ['A', 'B'] : ['A', 'C'];

  /* ── le verdict ── */
  const last = lab.last;
  let vKind = 'start';
  if (liveT != null || liveK != null) vKind = 'live';
  else if (last) vKind = last.kind === 'turn' && lab.mode === 'prove' ? `land_${last.landing}` : last.kind === 'refuse' ? `refuse_${last.reason}` : last.kind;
  const verdict = (() => {
    switch (vKind) {
      case 'live': return <span className="text-slate-700"><MathText>{k('vLive', { theta: Math.abs(theta), dir: theta < 0 ? k('indirect') : k('direct'), between: g.between })}</MathText></span>;
      case 'turn': return <span className="text-slate-800"><MathText>{k('vTurn', { theta: Math.abs(last.theta), dir: last.theta < 0 ? k('indirect') : k('direct'), between: last.between })}</MathText></span>;
      case 'stretch': return last.rotation
        ? <span className="text-emerald-800"><MathText>{k('vUnstretch')}</MathText></span>
        : <span className="text-rose-800"><MathText>{k('vStretch', { seg: last.seg, segp: `${last.seg[0]}'${last.seg[1]}'`, orig: texLen(last.orig), copy: texLen(last.copy) })}</MathText></span>;
      case 'stamp': return <span className="text-emerald-800"><MathText>{k(last.done ? 'vStampDone' : 'vStamp', { n: last.n, at: last.at, alpha: lab.alpha })}</MathText></span>;
      case 'refuse_stretch': return <span className="text-rose-800"><MathText>{k('vStretch', { seg: last.seg, segp: `${last.seg[0]}'${last.seg[1]}'`, orig: texLen(last.orig), copy: texLen(last.copy) })}</MathText></span>;
      case 'refuse_home': return <span className="text-amber-800"><MathText>{k('vHome')}</MathText></span>;
      case 'refuse_twice': return <span className="text-amber-800"><MathText>{k('vTwice', { at: last.at })}</MathText></span>;
      case 'refuse_angle': return <span className="text-rose-800"><MathText>{k('vAngle', { measured: last.measured, alpha: lab.alpha })}</MathText></span>;
      case 'refuse_sense': return <span className="text-rose-800"><MathText>{k('vSense', { measured: last.measured })}</MathText></span>;
      case 'land_land': return <span className="text-emerald-800"><MathText>{k('vLand')}</MathText></span>;
      case 'land_miss': return <span className="text-amber-800"><MathText>{k(L.landing({ ...lab, theta: last.theta, stretch: last.stretch }).rest > 0 ? 'vMissShort' : 'vMissOver', { rest: Math.abs(L.landing({ ...lab, theta: last.theta, stretch: last.stretch }).rest ?? 0), theta: Math.abs(last.theta) })}</MathText></span>;
      case 'land_stretch': return <span className="text-rose-800"><MathText>{k('vStretch', { seg: 'AC', segp: "A'C'", orig: '\\sqrt{41}', copy: texLen(g.length.copy) })}</MathText></span>;
      case 'land_start': return <span className="text-slate-700"><MathText>{m('vStart')}</MathText></span>;
      case 'claim': return last.ok
        ? <span className="text-emerald-800"><MathText>{k('vClaimOk', { card: k(`card_${last.card}`) })}</MathText></span>
        : <span className="text-rose-800"><MathText>{k('vClaimNo', { card: k(`card_${last.card}`), proves: k(`proves_${last.proves}`), need: k(`proves_${last.need}`) })}</MathText></span>;
      default: return <span className="text-slate-700"><MathText>{m('vStart', { alpha: lab.alpha })}</MathText></span>;
    }
  })();

  /* ── les jauges ── */
  const ok = (b2) => (b2 ? '✓' : '✗');
  const gaugeLines = [
    { key: 'length', tone: g.length.equal, tex: `${a}${b} = ${texLen(g.length.orig)} ,\\; ${a}'${b}' = ${texLen(g.length.copy)}`, label: k('gLength') },
    { key: 'angle', tone: g.angle.equal, tex: `\\widehat{${lab.mode === 'rosette' ? 'ABC' : 'ACO'}} = ${dec(g.angle.orig)}^{\\circ} ,\\; \\widehat{${lab.mode === 'rosette' ? "A'B'C'" : "A'C'O"}} = ${dec(g.angle.copy)}^{\\circ}`, label: k('gAngle') },
    { key: 'area', tone: g.area.equal, tex: `${texNum(g.area.orig)} ,\\; ${texNum(g.area.copy)}`, label: k('gArea') },
    { key: 'aligned', tone: g.aligned, tex: `${a}', I', ${b}'`, label: k(g.aligned ? 'gAligned' : 'gNotAligned') },
  ];
  // à 0° (ou 360°) la copie est SUR le motif : ni « متوازيان » ni rien
  const betweenBadge = g.perp ? k('perp') : g.parallel && ((theta % 360) + 360) % 360 !== 0 ? k('parallel') : '';
  const gaugesBody = (
    <div className={`space-y-0.5 ${narrow ? 'text-[11px]' : 'text-xs'}`} data-st-gauges data-st-rotation={g.rotation ? 'true' : 'false'}>
      {gaugeLines.map((ln) => (
        <p key={ln.key} className={ln.tone ? 'text-emerald-800' : 'text-rose-700'} data-st-gauge={ln.key} data-equal={ln.tone ? 'true' : 'false'}>
          <span className="font-bold">{ln.label}</span> <MathText>{`$${ln.tex}$`}</MathText> <span aria-hidden="true">{ok(ln.tone)}</span>
        </p>
      ))}
      <p className="font-bold text-indigo-900" data-st-between={g.between}>
        {k('gBetween')} <MathText>{`$(${a}${b}) ,\\; (${a}'${b}')$ : $${g.between}^{\\circ}$`}</MathText> {betweenBadge && <span className="ms-1 rounded bg-indigo-600 px-1.5 text-white">{betweenBadge}</span>}
      </p>
      {!g.rotation && <p className="font-extrabold text-rose-700" data-st-not-rotation>{k('notRotation')}</p>}
    </div>
  );

  /* les jauges en pastilles (écran étroit) : ✓ / ✗ et l'angle entre les droites, sans les valeurs */
  const gaugesChips = (
    <div className="flex flex-wrap items-center justify-center gap-1 text-[11px] font-bold" data-st-gauges data-st-rotation={g.rotation ? 'true' : 'false'}>
      {gaugeLines.map((ln) => (
        <span key={ln.key} className={`rounded-full px-1.5 py-0.5 ${ln.tone ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-800'}`} data-st-gauge={ln.key} data-equal={ln.tone ? 'true' : 'false'}>
          {k(`chip_${ln.key}`)} {ok(ln.tone)}
        </span>
      ))}
      <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-indigo-900" data-st-between={g.between}>
        <MathText>{`$\\angle = ${g.between}^{\\circ}$`}</MathText>{betweenBadge && ` ${betweenBadge}`}
      </span>
    </div>
  );

  /* ── le dessin ── */
  const stamps = lab.mode === 'rosette' ? lab.stamps : [];
  const motif = ['A', 'B', 'C'];
  const motifAt = (deg) => motif.map((n) => P(Rot.rotateApprox(W(n), O, deg, 'direct')));
  const copy = L.copyPoints({ ...lab, theta, stretch }, theta, stretch);
  const landed = lab.mode === 'prove' && lab.landed && L.landing({ ...lab, theta, stretch }).kind === 'land';

  const controls = (
    <div className="flex flex-wrap items-center justify-center gap-1.5" dir="ltr">
      <div className={`flex items-center ${narrow ? 'gap-1' : 'gap-1.5'}`}>
      <button type="button" onClick={() => rot.set(theta - 10)} disabled={theta <= L.TURN.min} aria-label={k('turnBy', { n: 10, dir: k('indirect') })} data-st-turn="-10" className={`${btn} ${narrow ? 'px-1 text-xs' : ''} border-sky-300 bg-white focus-visible:ring-sky-500`}>−10°</button>
      <button type="button" onClick={() => rot.nudge(-1)} disabled={theta <= L.TURN.min} aria-label={k('turnBy', { n: 1, dir: k('indirect') })} data-st-turn="-1" className={`${btn} ${narrow ? 'px-1 text-xs' : ''} border-sky-300 bg-white focus-visible:ring-sky-500`}>−1°</button>
      <span className={`${narrow ? 'min-w-[3.6rem] px-1 text-xs' : 'min-w-[5.5rem] px-2 text-sm'} rounded-full bg-emerald-100 py-1 text-center font-extrabold text-emerald-900`} data-st-theta={theta}>
        <MathText>{`$\\theta = ${theta}^{\\circ}$`}</MathText>
      </span>
      <button type="button" onClick={() => rot.nudge(1)} disabled={theta >= L.TURN.max} aria-label={k('turnBy', { n: 1, dir: k('direct') })} data-st-turn="1" className={`${btn} ${narrow ? 'px-1 text-xs' : ''} border-sky-300 bg-white focus-visible:ring-sky-500`}>+1°</button>
      <button type="button" onClick={() => rot.set(theta + 10)} disabled={theta >= L.TURN.max} aria-label={k('turnBy', { n: 10, dir: k('direct') })} data-st-turn="10" className={`${btn} ${narrow ? 'px-1 text-xs' : ''} border-sky-300 bg-white focus-visible:ring-sky-500`}>+10°</button>
      </div>
      {lab.mode === 'rosette' && (
        <button type="button" onClick={() => { rot.flush(); setLab((s) => L.stamp(s)); }} data-st-stamp disabled={L.rosetteDone(lab)}
          className={`${btn} border-emerald-600 bg-emerald-600 text-white focus-visible:ring-emerald-400`} dir="rtl">{k('stamp')}</button>
      )}
      {lab.stretch !== 10 && (
        <button type="button" onClick={() => setLab((s) => L.unstretch(s))} data-st-unstretch className={`${btn} border-rose-300 bg-white text-rose-800 focus-visible:ring-rose-400`} dir="rtl">{k('unstretch')}</button>
      )}
    </div>
  );

  return (
    <div ref={boxRef} className="space-y-2" data-shape-turn data-mode={lab.mode} data-stage="turn" data-world={theme} data-solved={solved ? 'true' : 'false'} data-scene-h={size}>
      <div ref={glanceRef} className="space-y-1.5" data-st-glance>
        {top}
        <div {...rot.trackProps} ref={(el) => { sceneRef.current = el; rot.trackProps.ref.current = el; }} onPointerDown={trackDown}
          className="relative mx-auto overflow-hidden rounded-xl border border-slate-200" style={{ ...rot.trackProps.style, width: size, height: size }} data-st-scene>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0" style={{ direction: 'ltr' }}
            role="img" aria-label={k(`${lab.mode}.sceneLabel`, { theta: Math.abs(theta), dir: theta < 0 ? k('indirect') : k('direct'), n: stamps.length })}>
            <defs>
              <pattern id={`st-z-${uid}`} width={48} height={48} patternUnits="userSpaceOnUse">
                <path d="M24 4 L29 19 L44 24 L29 29 L24 44 L19 29 L4 24 L19 19 Z" fill="none" stroke="#99F6E4" strokeWidth={1} />
              </pattern>
            </defs>
            <rect x={0} y={0} width={size} height={size} fill="#F0FDFA" />
            <ZelligeDeco size={size} uid={uid} reduce={reduce} done={lab.mode === 'rosette' && L.rosetteDone(lab)} />
            {/* le cercle de l'épingle (le chemin des sommets) */}
            <circle cx={Opx[0]} cy={Opx[1]} r={Math.max(...lab.carried.map((n) => Math.hypot(W(n).x - O.x, W(n).y - O.y))) * G.k} fill="none" stroke="#94A3B8" strokeWidth={0.8} strokeDasharray="3 5" />
            {lab.mode === 'rosette' ? (
              <g>
                {/* les copies imprimées */}
                {stamps.map((st, i) => {
                  const q = motifAt(st.at);
                  const c = ZELLIGE[(i + 1) % ZELLIGE.length];
                  const mid = [(q[0][0] + q[1][0] + q[2][0]) / 3, (q[0][1] + q[1][1] + q[2][1]) / 3];
                  return (
                    <g key={st.at} data-st-copy={st.n}>
                      <polygon points={poly(q)} fill={c} fillOpacity={0.8} stroke="#0F172A" strokeWidth={1.2} />
                      <text x={mid[0]} y={mid[1] + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill="#FFFFFF" {...TP}>{st.n}</text>
                    </g>
                  );
                })}
                {/* le motif */}
                {(() => {
                  const q = motifAt(0); const I = P(W('I'));
                  return (
                    <g data-st-motif>
                      <polygon points={poly(q)} fill={ZELLIGE[0]} stroke="#0F172A" strokeWidth={1.6} />
                      <circle cx={I[0]} cy={I[1]} r={3} fill="#FDE68A" />
                      {motif.map((n, i) => <PointLabel key={n} at={q[i]} name={n} from={Opx} color="#0F172A" />)}
                      <PointLabel at={I} name="I" from={Opx} color="#92400E" small />
                    </g>
                  );
                })()}
              </g>
            ) : (
              <ProveFigure lab={lab} P={P} W={W} Opx={Opx} landed={landed} />
            )}
            {/* la feuille de papier calque, épinglée en O, tournée de θ, étirée de k */}
            <g transform={`translate(${Opx[0]} ${Opx[1]}) rotate(${-theta}) scale(${kk} 1)`} data-st-sheet data-st-stretch-k={stretch}>
              <rect x={sx0 * G.k} y={-sy1 * G.k} width={(sx1 - sx0) * G.k} height={(sy1 - sy0) * G.k} rx={6}
                fill="#E0F2FE" fillOpacity={0.42} stroke={stretch !== 10 ? '#E11D48' : '#0284C7'} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
              {/* la languette du faux mors : de la feuille jusqu'au mors */}
              <line x1={Math.max(sx0, Math.min(sx1, edgeLoc.x)) * G.k} y1={-Math.max(sy0, Math.min(sy1, edgeLoc.y)) * G.k} x2={edgeLoc.x * G.k} y2={-edgeLoc.y * G.k}
                stroke="#94A3B8" strokeWidth={6} strokeLinecap="round" opacity={0.45} vectorEffect="non-scaling-stroke" data-st-tab />
              <polyline points={poly(lab.carried.map((n) => [(W(n).x - O.x) * G.k, -(W(n).y - O.y) * G.k]).concat(lab.mode === 'rosette' ? [[(W('A').x - O.x) * G.k, -(W('A').y - O.y) * G.k]] : []))}
                fill="none" stroke={stretch !== 10 ? '#E11D48' : '#0369A1'} strokeWidth={2.4} strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />
            </g>
            {/* les noms de la copie (non étirés, lisibles) */}
            {[a, b].map((n) => <PointLabel key={`c${n}`} at={P(copy[n])} name={prime(n)} from={Opx} color={stretch !== 10 ? '#BE123C' : '#0369A1'} small />)}
            <circle cx={P(copy.I)[0]} cy={P(copy.I)[1]} r={2.5} fill="#0369A1" />
            {/* l'épingle */}
            <g aria-hidden="true">
              <circle cx={Opx[0]} cy={Opx[1]} r={6} fill="#DC2626" stroke="#7F1D1D" strokeWidth={1.5} />
              <circle cx={Opx[0] - 1.5} cy={Opx[1] - 1.5} r={1.8} fill="#FECACA" />
            </g>
            <text x={Opx[0] - 9} y={Opx[1] + 18} fontSize={13} fontWeight={800} fill="#0F172A" textAnchor="end" {...TP}>O</text>
          </svg>
          {/* le coin de la feuille : LA poignée (role=slider) */}
          <div {...handleProps} onKeyDown={onKeyDown} data-st-handle={theta}
            className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-sky-600 bg-white/85 shadow outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
            style={{ left: G.X(cornerW.x), top: G.Y(cornerW.y), cursor: rot.dragging ? 'grabbing' : 'grab' }}>
            <span aria-hidden="true" className="text-base font-black text-sky-700">⟲</span>
          </div>
          {/* le faux mors : il ÉTIRE la feuille (ce n'est plus un دوران) */}
          <div {...str.trackProps} onPointerDown={(e) => { e.stopPropagation(); str.trackProps.onPointerDown(e); }}
            className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2" style={{ ...str.trackProps.style, left: G.X(edgeW.x), top: G.Y(edgeW.y) }}>
            <div {...str.handleProps({ label: k('stretchHandle'), valueText: k('stretchText', { k: String(stretch / 10).replace('.', ',') }) })} data-st-stretch={stretch}
              className={`absolute inset-0.5 flex items-center justify-center rounded-lg border-2 border-dashed ${stretch !== 10 ? 'border-rose-500 bg-rose-50/90' : 'border-slate-400 bg-white/80'} outline-none focus-visible:ring-4 focus-visible:ring-rose-300`}
              style={{ transform: `rotate(${-theta}deg)` }}>
              <span aria-hidden="true" className="text-sm font-black text-slate-600">↔</span>
            </div>
          </div>
          {!narrow && (
            <MovablePanel id="shape-turn.gauges" bounds={sceneRef} title={k('gaugesTitle')} className="absolute left-1 top-1 z-10 max-w-[48%]">
              {gaugesBody}
            </MovablePanel>
          )}
        </div>
        {controls}
        {narrow && gaugesChips}
        <p role="status" className={`min-h-[2.5rem] ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug`} data-st-verdict={vKind}>{verdict}</p>
      </div>

      <Claims lab={lab} setLab={setLab} k={k} m={m} />
      {lab.mode === 'prove' && (solved || formal) && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-indigo-200 bg-indigo-50 px-3 py-2 text-sm" data-st-next>
          <p className="flex-1 text-indigo-900"><MathText>{k('center.nextCard')}</MathText></p>
          <button type="button" onClick={() => setLab((s) => L.openCenter(s))} data-st-center-open className={`${btn} border-indigo-600 bg-indigo-600 text-white focus-visible:ring-indigo-400`}>{k('center.open')}</button>
        </div>
      )}
      {lab.trials.length > 0 && (
        <LabFold id="shape-turn.trials" title={k('trialsTitle')} defaultOpen={false}>
          <ul className="space-y-0.5 text-xs" data-st-trials={lab.trials.length}>
            {lab.trials.slice(-10).map((e, i) => <li key={i}><MathText>{trialLine(e, k)}</MathText></li>)}
          </ul>
        </LabFold>
      )}
    </div>
  );
}

const dec = (x) => String(x).replace('.', '{,}');
const texNum = (s) => String(s).replace(',', '{,}');
const texLen = (s) => (String(s).includes('√') ? String(s).replace(/(\d*)√(\d+)/, '$1\\sqrt{$2}') : texNum(s));

/** Une ligne de la liste des essais (le LabFold), dans les mots du lab. */
function trialLine(e, k) {
  const dir = (t) => (t < 0 ? k('indirect') : k('direct'));
  switch (e.kind) {
    case 'turn': return k('trial_turn', { theta: Math.abs(e.theta), dir: dir(e.theta), between: e.between });
    case 'stretch': return e.rotation ? k('trial_unstretch') : k('trial_stretch', { k: String(e.stretch / 10).replace('.', '{,}'), orig: texLen(e.orig), copy: texLen(e.copy) });
    case 'stamp': return k('trial_stamp', { n: e.n, at: e.at });
    case 'refuse': return k(`trial_refuse_${e.reason}`, { theta: Math.abs(e.theta), measured: e.measured ?? '', at: e.at ?? '' });
    case 'claim': return k(e.ok ? 'trial_claimOk' : 'trial_claimNo', { card: k(`card_${e.card}`) });
    default: return '';
  }
}

/** Le nom d'un point, posé à l'opposé du centre `from` (LTR, isolé). */
function PointLabel({ at, name, from, color, small = false }) {
  const dx = at[0] - from[0]; const dy = at[1] - from[1]; const l = Math.hypot(dx, dy) || 1;
  const off = small ? 12 : 14;
  return (
    <text x={at[0] + (dx / l) * off} y={at[1] + (dy / l) * off + 4} textAnchor="middle" fontSize={small ? 12 : 14} fontWeight={800}
      fill={color} stroke="#FFFFFF" strokeWidth={3} paintOrder="stroke" {...TP}>{name}</text>
  );
}

/** La figure de la طريقة p. 155 : OAB et OCD rectangles isocèles en O, [AC] et [BD]. */
function ProveFigure({ P, W, Opx, landed }) {
  const A = P(W('A')); const B = P(W('B')); const C = P(W('C')); const D = P(W('D'));
  const sq = (u, v) => {
    const s = 11; const lu = Math.hypot(u[0] - Opx[0], u[1] - Opx[1]); const lv = Math.hypot(v[0] - Opx[0], v[1] - Opx[1]);
    const e1 = [(u[0] - Opx[0]) / lu * s, (u[1] - Opx[1]) / lu * s]; const e2 = [(v[0] - Opx[0]) / lv * s, (v[1] - Opx[1]) / lv * s];
    return `M${Opx[0] + e1[0]} ${Opx[1] + e1[1]} L${Opx[0] + e1[0] + e2[0]} ${Opx[1] + e1[1] + e2[1]} L${Opx[0] + e2[0]} ${Opx[1] + e2[1]}`;
  };
  return (
    <g data-st-prove-figure>
      <polygon points={poly([Opx, A, B])} fill="#047857" fillOpacity={0.14} stroke="#047857" strokeWidth={1.6} />
      <polygon points={poly([Opx, C, D])} fill="#1D4ED8" fillOpacity={0.14} stroke="#1D4ED8" strokeWidth={1.6} />
      <path d={sq(A, B)} fill="none" stroke="#0F172A" strokeWidth={1.2} />
      <path d={sq(C, D)} fill="none" stroke="#0F172A" strokeWidth={1.2} />
      <line x1={A[0]} y1={A[1]} x2={C[0]} y2={C[1]} stroke="#EA580C" strokeWidth={3} data-st-seg="AC" />
      <line x1={B[0]} y1={B[1]} x2={D[0]} y2={D[1]} stroke={landed ? '#059669' : '#DC2626'} strokeWidth={landed ? 5 : 3} data-st-seg="BD" data-landed={landed ? 'true' : 'false'} />
      {[['A', A], ['B', B], ['C', C], ['D', D]].map(([n, p]) => <PointLabel key={n} at={p} name={n} from={Opx} color="#0F172A" />)}
    </g>
  );
}

/** Le décor : bordure de zellige, étoiles, et le téléphone qui prend la story (aucune information). */
function ZelligeDeco({ size, uid, reduce, done }) {
  const [flash, setFlash] = useState(0);
  const band = Math.max(8, Math.round(size * 0.035));
  const tiles = Math.ceil(size / band);
  return (
    <g data-deco="zellige">
      <rect x={0} y={0} width={size} height={size} fill={`url(#st-z-${uid})`} opacity={0.7} aria-hidden="true" />
      <g aria-hidden="true">
        {Array.from({ length: tiles }, (_, i) => (
          <g key={i}>
            <rect x={i * band} y={0} width={band} height={band * 0.6} fill={ZELLIGE[i % 3]} opacity={0.55} />
            <rect x={i * band} y={size - band * 0.6} width={band} height={band * 0.6} fill={ZELLIGE[(i + 1) % 3]} opacity={0.55} />
          </g>
        ))}
      </g>
      {/* le téléphone : « story » de la rosace (décor) */}
      <g transform={`translate(${size - 30}, ${size - 48})`} onClick={() => setFlash((n) => n + 1)} style={{ cursor: 'pointer' }} aria-hidden="true" tabIndex={-1}>
        <rect x={0} y={0} width={18} height={30} rx={4} fill="#0F172A" />
        <rect x={2} y={4} width={14} height={21} rx={2} fill={flash % 2 && !reduce ? '#FEF9C3' : done ? '#5EEAD4' : '#334155'} style={{ transition: reduce ? 'none' : 'fill .25s' }} />
        <circle cx={9} cy={27.5} r={1.2} fill="#64748B" />
      </g>
    </g>
  );
}

/* ── les affirmations et les cartes de preuve (porter une carte sur une affirmation) ── */
function Claims({ lab, setLab, k, m }) {
  const open = L.claimsOpen(lab);
  const claims = L.claimsOf(lab);
  const drag = useDragInteraction({
    accepts: () => true,
    onDrop: (card, claimId) => setLab((s) => L.claim(s, claimId, card.replace('card-', ''))),
  });
  if (!open) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 px-3 py-2 text-xs text-slate-600" data-st-claims-closed>{m('claimsClosed')}</p>
    );
  }
  return (
    <LabFold id="shape-turn.claims" title={k('claimsTitle')}>
      <div className="space-y-2" data-st-claims>
        <p className="text-xs text-slate-600">{k('claimsHow')}</p>
        <div className="grid gap-1.5 grid-cols-2">
          {claims.map((c) => {
            const st = lab.claims[c.id];
            const hz = drag.hoverZone?.id === c.id;
            return (
              <div key={c.id} role="button" tabIndex={0} {...drag.zoneProps(c.id)} data-st-claim={c.id} data-st-claim-ok={st?.ok ? 'true' : 'false'}
                aria-label={k('claimZone', { claim: k(`claim_${c.id}`) })}
                className={`min-h-[44px] rounded-xl border-2 px-2 py-1.5 text-sm outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 ${st?.ok ? 'border-emerald-500 bg-emerald-50' : hz ? 'border-indigo-500 bg-indigo-50' : drag.held ? 'border-dashed border-indigo-400 bg-white' : 'border-slate-300 bg-white'}`}>
                <p className="font-bold text-slate-800">{c.tex ? <MathText>{`$${c.tex}$`}</MathText> : null} <MathText>{k(`claim_${c.id}`)}</MathText></p>
                {st && <p className={`text-xs ${st.ok ? 'text-emerald-800' : 'text-rose-700'}`}>{st.ok ? '✓ ' : '✗ '}<MathText>{k(`card_${st.card}`)}</MathText></p>}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-1.5" data-st-cards>
          {L.CARDS.map((id) => (
            <button key={id} type="button" {...drag.sourceProps(`card-${id}`)} data-st-card={id}
              className={`min-h-[44px] rounded-xl border-2 px-2 py-1 text-xs font-bold outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${drag.held === `card-${id}` ? 'border-amber-600 bg-amber-100 ring-2 ring-amber-300' : 'border-amber-300 bg-amber-50 text-amber-900'}`}>
              <MathText>{k(`card_${id}`)}</MathText>
            </button>
          ))}
        </div>
      </div>
    </LabFold>
  );
}

/* ════════════════════════════ متقدم, seconde scène — le centre W (تمرين 18) ════════════════════════════ */

function CenterLab({ lab, setLab, k, theme, top }) {
  const { boxRef, glanceRef, drawnH, width, budget } = useBudget(220, 560);
  const narrow = width < 420;
  const size = Math.max(200, Math.min(width, budget, 560));
  drawnH.current = size;
  const G = L.sceneLayout(lab, { size, pad: 22 });
  const sceneRef = useRef(null);
  const dragging = useRef(false);
  const T0 = lab.task.pts;
  const W = (n) => ({ x: Number(T0[n].x.n) / Number(T0[n].x.d), y: Number(T0[n].y.n) / Number(T0[n].y.d) });
  const P = (p) => [G.X(p.x), G.Y(p.y)];
  const pin = lab.pin;
  const d = L.pinDistances(lab);
  const meet = L.bisectorMeet(lab);
  const grid = lab.task.grid;

  const toNode = (e) => {
    const r = sceneRef.current?.getBoundingClientRect();
    if (!r) return null;
    const w = G.toWorld((e.clientX - r.left) * (size / r.width), (e.clientY - r.top) * (size / r.height));
    return [w.x, w.y];
  };
  const onDown = (e) => { const q = toNode(e); if (!q) return; e.currentTarget.setPointerCapture?.(e.pointerId); dragging.current = true; setLab((s) => L.movePin(s, q)); };
  const onMove = (e) => { if (!dragging.current) return; const q = toNode(e); if (q) setLab((s) => L.movePin(s, q)); };
  const onUp = (e) => { if (!dragging.current) return; dragging.current = false; e.currentTarget.releasePointerCapture?.(e.pointerId); setLab((s) => L.placePin(s)); };
  const onKey = (e) => {
    const step = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (step) { e.preventDefault(); setLab((s) => L.movePin(s, [s.pin[0] + step[0], s.pin[1] + step[1]])); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLab((s) => L.placePin(s)); }
  };

  const last = lab.last;
  const vKind = last?.kind === 'pin' ? (last.ok ? 'pin_ok' : `pin_${last.pair === 'turn' ? 'turn' : 'no'}`) : last?.kind === 'bisector' ? `bis_${last.meet?.kind ?? 'one'}` : 'start';
  const verdict = (() => {
    switch (vKind) {
      case 'pin_ok': return <span className="text-emerald-800"><MathText>{k('center.vOk', { x: last.at[0], y: last.at[1], alpha: last.alpha, dir: k(last.direction === 'indirect' ? 'indirect' : 'direct') })}</MathText></span>;
      case 'pin_no': return <span className="text-rose-800"><MathText>{k('center.vNo', { p: last.pair, d1: last.d1, d2: last.d2 })}</MathText></span>;
      case 'pin_turn': return <span className="text-rose-800"><MathText>{k('center.vTurn')}</MathText></span>;
      case 'bis_same': return <span className="text-amber-800"><MathText>{k('center.vSame', { a: last.meet.pairs[0], b: last.meet.pairs[1] })}</MathText></span>;
      case 'bis_point': return <span className="text-indigo-800"><MathText>{k('center.vMeet', { a: last.meet.pairs[0], b: last.meet.pairs[1] })}</MathText></span>;
      case 'bis_one': return <span className="text-slate-700"><MathText>{k('center.vOne')}</MathText></span>;
      default: return <span className="text-slate-700"><MathText>{k('center.vStart')}</MathText></span>;
    }
  })();
  const nodes = []; for (let i = 0; i <= grid; i += 1) nodes.push(i);
  const tri = (ns) => poly(ns.map((n) => P(W(n))));
  const pinPx = P({ x: pin[0], y: pin[1] });

  return (
    <div ref={boxRef} className="space-y-2" data-shape-turn data-mode={lab.mode} data-stage="center" data-world={theme} data-solved={lab.center ? 'true' : 'false'} data-scene-h={size}>
      <div ref={glanceRef} className="space-y-1.5" data-st-glance>
        {top}
        <div ref={sceneRef} className="relative mx-auto overflow-hidden rounded-xl border border-slate-200" style={{ width: size, height: size, touchAction: 'none' }}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} data-st-scene>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0" style={{ direction: 'ltr' }} role="img"
            aria-label={k('center.sceneLabel', { x: pin[0], y: pin[1] })}>
            <rect x={0} y={0} width={size} height={size} fill="#FFFFFF" />
            {nodes.map((i) => (
              <g key={i}>
                <line x1={G.X(i)} x2={G.X(i)} y1={G.Y(0)} y2={G.Y(grid)} stroke="#CBD5E1" strokeWidth={1} />
                <line y1={G.Y(i)} y2={G.Y(i)} x1={G.X(0)} x2={G.X(grid)} stroke="#CBD5E1" strokeWidth={1} />
              </g>
            ))}
            <polygon points={tri(['M', 'N', 'P'])} fill="#047857" fillOpacity={0.35} stroke="#047857" strokeWidth={1.6} />
            <polygon points={tri(["M'", "N'", "P'"])} fill="#1D4ED8" fillOpacity={0.3} stroke="#1D4ED8" strokeWidth={1.6} />
            {lab.bisectors.map((n) => {
              const [p1, p2] = L.bisectorLine(lab, n);
              return <line key={n} x1={G.X(p1.x)} y1={G.Y(p1.y)} x2={G.X(p2.x)} y2={G.Y(p2.y)} stroke="#7C3AED" strokeWidth={1.8} strokeDasharray="7 5" data-st-bisector-line={n} />;
            })}
            {lab.bisectors.map((n) => {
              const a = P(W(n)); const b = P(W(`${n}'`));
              return <line key={`s${n}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#7C3AED" strokeWidth={1} opacity={0.6} />;
            })}
            {meet?.kind === 'point' && <circle cx={G.X(meet.at[0])} cy={G.Y(meet.at[1])} r={7} fill="none" stroke="#7C3AED" strokeWidth={2} data-st-meet />}
            {['M', 'N', 'P', "M'", "N'", "P'"].map((n) => {
              const p = P(W(n));
              return (
                <g key={n}>
                  <circle cx={p[0]} cy={p[1]} r={3.5} fill="#0F172A" />
                  <text x={p[0] + (n.length > 1 ? 9 : -9)} y={p[1] - 7} textAnchor={n.length > 1 ? 'start' : 'end'} fontSize={13} fontWeight={800} fill="#0F172A" stroke="#FFFFFF" strokeWidth={3} paintOrder="stroke" {...TP}>{n.replace("'", '′')}</text>
                </g>
              );
            })}
            {lab.center && <path d={`M${pinPx[0] + 30} ${pinPx[1]} A30 30 0 0 0 ${pinPx[0]} ${pinPx[1] - 30}`} fill="none" stroke="#059669" strokeWidth={2.5} data-st-center-arc />}
            <text x={pinPx[0] + 10} y={pinPx[1] + 18} fontSize={13} fontWeight={800} fill="#B91C1C" {...TP}>W</text>
          </svg>
          <button type="button" onKeyDown={onKey} onClick={(e) => e.stopPropagation()} data-st-pin={`${pin[0]};${pin[1]}`}
            aria-label={k('center.pin', { x: pin[0], y: pin[1] })}
            className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-rose-300"
            style={{ left: pinPx[0], top: pinPx[1] }}>
            <span aria-hidden="true" className={`block h-4 w-4 rounded-full border-2 ${lab.center ? 'border-emerald-800 bg-emerald-500' : 'border-rose-900 bg-rose-500'}`} />
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {L.PAIRS.map((n) => (
            <button key={n} type="button" onClick={() => setLab((s) => L.toggleBisector(s, n))} aria-pressed={lab.bisectors.includes(n)} data-st-bisector={n}
              className={`${btn} ${lab.bisectors.includes(n) ? 'border-violet-600 bg-violet-100 text-violet-900' : 'border-violet-300 bg-white text-violet-800'} focus-visible:ring-violet-400`}>
              <MathText>{k('center.bisector', { p: n })}</MathText>
            </button>
          ))}
          <button type="button" onClick={() => setLab((s) => L.placePin(s))} data-st-pin-place className={`${btn} border-emerald-600 bg-emerald-600 text-white focus-visible:ring-emerald-400`}>{k('center.place')}</button>
        </div>
        <p className={`flex flex-wrap justify-center gap-x-3 ${narrow ? 'text-[11px]' : 'text-xs'} font-bold`} data-st-pin-distances dir="ltr">
          {L.PAIRS.map((n) => (
            <span key={n} className={d[n].equal ? 'text-emerald-700' : 'text-rose-700'}>
              <MathText>{`$W${n}^2 = ${d[n].d1}$ , $W${n}'^2 = ${d[n].d2}$`}</MathText>
            </span>
          ))}
        </p>
        <p role="status" className={`min-h-[2.5rem] ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug`} data-st-verdict={vKind}>{verdict}</p>
      </div>
      <button type="button" onClick={() => setLab((s) => L.backToTurn(s))} data-st-back className={`${btn} border-slate-300 bg-white text-slate-700 focus-visible:ring-slate-400`}>{k('center.back')}</button>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/**
 * Les ÉTAPES de chaque niveau, dans l'ordre : r1 · r2 (مبتدئ : la rosace fermée, puis la feuille étirée et la règle) ; p1 · p2 · p3 (متقدم :
 * [AC] tombé sur [BD], les deux affirmations prouvées et la règle, puis le centre W). Une étape s'ouvre quand son objectif est atteint ET que
 * les précédentes sont répondues ; la suite qui contient `rule` finit par la règle (elle remplace la découverte automatique).
 */
export const STEPS = Object.freeze({
  rosette: [
    { id: 'r1', chain: ['count', 'kept', 'between'], reached: (lab) => L.rosetteDone(lab) },
    { id: 'r2', chain: ['stretch', 'rule'], reached: (lab) => lab.fakeTried },
  ],
  prove: [
    { id: 'p1', chain: ['alpha', 'image'], reached: (lab) => !!lab.landed },
    { id: 'p2', chain: ['length', 'rule'], reached: (lab) => L.claimsProved(lab) },
    { id: 'p3', chain: ['axis', 'two', 'center'], reached: (lab) => !!lab.center },
  ],
});

const $ = (s) => `$${s}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;

/** Chaque question est construite sur LES nombres de l'élève (rien n'est écrit en dur) ; `k` : les textes de `shapeTurn`. */
export const QUESTIONS = {
  count: ({ lab }, k) => {
    const n = L.rosetteSize(lab);
    return {
      id: 'count', kind: 'number', expected: String(n), answer: <MathText>{$(n)}</MathText>,
      prompt: Cq(k, 'rosette.count.prompt'), hints: [Cq(k, 'rosette.count.hint1'), Cq(k, 'rosette.count.hint2', { alpha: lab.alpha })],
      explain: Cq(k, 'rosette.count.explain', { n: $(n), calc: $(`360 \\div ${lab.alpha} = ${n}`) }),
    };
  },
  kept: ({ lab }, k) => {
    const st = L.readableStamp(lab);
    const len = texLen(L.gauges(lab, 0, L.STRETCH.min).length.orig);
    const o = { at: st?.at ?? lab.alpha, len };
    return {
      id: 'kept', kind: 'choice', cols: 1, prompt: Cq(k, 'rosette.kept.prompt', o),
      options: [
        { text: Cq(k, 'rosette.kept.bigger'), why: Cq(k, 'rosette.kept.whyBigger', o) },
        { text: Cq(k, 'rosette.kept.same', o), correct: true },
        { text: Cq(k, 'rosette.kept.smaller'), why: Cq(k, 'rosette.kept.whySmaller', o) },
      ],
      hints: [Cq(k, 'rosette.kept.hint1'), Cq(k, 'rosette.kept.hint2')], explain: Cq(k, 'rosette.kept.explain', o),
    };
  },
  between: ({ lab }, k) => {
    const st = L.readableStamp(lab) ?? { at: lab.alpha, between: lab.alpha };
    const o = { at: st.at, between: st.between };
    return {
      id: 'between', kind: 'number', expected: String(st.between), answer: <MathText>{$(`${st.between}^{\\circ}`)}</MathText>,
      prompt: Cq(k, 'rosette.between.prompt', o), hints: [Cq(k, 'rosette.between.hint1', o), Cq(k, 'rosette.between.hint2')],
      explain: Cq(k, 'rosette.between.explain', o),
    };
  },
  stretch: ({ lab }, k) => {
    const e = L.lastStretch(lab);
    const o = { orig: e ? texLen(e.orig) : '3', copy: e ? texLen(e.copy) : '4' };
    return {
      id: 'stretch', kind: 'choice', cols: 1, prompt: Cq(k, 'rosette.stretch.prompt', o),
      options: [
        { text: Cq(k, 'rosette.stretch.pinned'), why: Cq(k, 'rosette.stretch.whyPinned', o) },
        { text: Cq(k, 'rosette.stretch.no'), correct: true },
        { text: Cq(k, 'rosette.stretch.aligned'), why: Cq(k, 'rosette.stretch.whyAligned', o) },
      ],
      hints: [Cq(k, 'rosette.stretch.hint1'), Cq(k, 'rosette.stretch.hint2')], explain: Cq(k, 'rosette.stretch.explain', o),
    };
  },
  rule: ({ options, formal, m, mode }, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{m('dPrompt')}</MathText>, options,
    hints: [Cq(k, `${mode}.rule.hint1`), Cq(k, `${mode}.rule.hint2`)], explain: formal,
  }),
  alpha: ({ lab }, k) => {
    const a = L.landedAlpha(lab);
    return {
      id: 'alpha', kind: 'number', expected: String(a), answer: <MathText>{$(`${a}^{\\circ}`)}</MathText>,
      prompt: Cq(k, 'prove.alpha.prompt'), hints: [Cq(k, 'prove.alpha.hint1'), Cq(k, 'prove.alpha.hint2')], explain: Cq(k, 'prove.alpha.explain', { alpha: a }),
    };
  },
  image: ({ lab }, k) => {
    const a = L.landedAlpha(lab);
    return {
      id: 'image', kind: 'choice', cols: 3, prompt: Cq(k, 'prove.image.prompt', { alpha: a }),
      options: [
        { text: <MathText>{$('[AD]')}</MathText>, why: Cq(k, 'prove.image.whyAD') },
        { text: <MathText>{$('[BD]')}</MathText>, correct: true },
        { text: <MathText>{$('[CB]')}</MathText>, why: Cq(k, 'prove.image.whyCB') },
      ],
      hints: [Cq(k, 'prove.image.hint1'), Cq(k, 'prove.image.hint2')], explain: Cq(k, 'prove.image.explain'),
    };
  },
  length: ({ lab }, k) => {
    const ac = texLen(L.gauges(lab, 0, L.STRETCH.min).length.orig);
    const root = /\\sqrt\{(\d+)\}/.exec(ac);
    const sq = root ? root[1] : String(Number(String(ac).replace('{,}', '.')) ** 2);
    const o = { ac, sq };
    return {
      id: 'length', kind: 'choice', cols: 3, prompt: Cq(k, 'prove.length.prompt', o),
      options: [
        { text: <MathText>{$(`2 \\times ${ac}`)}</MathText>, why: Cq(k, 'prove.length.whyDouble', o) },
        { text: <MathText>{$(sq)}</MathText>, why: Cq(k, 'prove.length.whySquare', o) },
        { text: <MathText>{$(ac)}</MathText>, correct: true },
      ],
      hints: [Cq(k, 'prove.length.hint1'), Cq(k, 'prove.length.hint2')], explain: Cq(k, 'prove.length.explain', o),
    };
  },
  axis: (_ctx, k) => ({
    id: 'axis', kind: 'choice', cols: 1, prompt: Cq(k, 'prove.axis.prompt'),
    options: [
      { text: Cq(k, 'prove.axis.segment'), why: Cq(k, 'prove.axis.whySegment') },
      { text: Cq(k, 'prove.axis.bisector'), correct: true },
      { text: Cq(k, 'prove.axis.line'), why: Cq(k, 'prove.axis.whyLine') },
    ],
    hints: [Cq(k, 'prove.axis.hint1'), Cq(k, 'prove.axis.hint2')], explain: Cq(k, 'prove.axis.explain'),
  }),
  two: (_ctx, k) => ({
    id: 'two', kind: 'choice', cols: 1, prompt: Cq(k, 'prove.two.prompt'),
    options: [
      { text: Cq(k, 'prove.two.wrong'), why: Cq(k, 'prove.two.whyWrong') },
      { text: Cq(k, 'prove.two.many'), correct: true },
      { text: Cq(k, 'prove.two.pair'), why: Cq(k, 'prove.two.whyPair') },
    ],
    hints: [Cq(k, 'prove.two.hint1'), Cq(k, 'prove.two.hint2')], explain: Cq(k, 'prove.two.explain'),
  }),
  center: ({ lab }, k) => {
    const c = lab.center ?? { alpha: 90 };
    return {
      id: 'center', kind: 'number', expected: String(c.alpha), answer: <MathText>{$(`${c.alpha}^{\\circ}`)}</MathText>,
      prompt: Cq(k, 'prove.center.prompt'), hints: [Cq(k, 'prove.center.hint1'), Cq(k, 'prove.center.hint2')], explain: Cq(k, 'prove.center.explain', { alpha: c.alpha }),
    };
  },
};
