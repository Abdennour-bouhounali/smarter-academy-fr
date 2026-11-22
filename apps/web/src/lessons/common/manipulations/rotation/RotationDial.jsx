import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import { useManipulationImmersive } from '../immersive';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import MathText from '../../components/MathText';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import * as L from '../logic/rotationDial';

/**
 * rotation-dial — LA GRANDE ROUE DE BEN AKNOUN (unité 13 « الدوران - الزوايا - المضلّعات المنتظمة », درس « مفهوم
 * الدوران وإنشاء صور أشكال هندسية بدوران », نشاطان 2 و 3 p. 152).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève TIENT L'IMAGE : il porte le repère A′ (glisser, toucher, flèches + Entrée) jusqu'à la place où, selon lui,
 *    la nacelle arrive quand la roue tourne de α dans le sens demandé (مبتدئ) ; sur la feuille (متقدم) il OUVRE le
 *    compas piqué en O, TOURNE la règle de la منقلة posée sur [OA), puis POSE A′.
 * B. Idée : la صورة d'un point M par le دوران (O, α, sens) est LE point M′ tel que OM′ = OM ET \widehat{MOM′} = α ET
 *    dans ce sens — trois conditions, aucune ne suffit seule ; et l'image d'une قطعة / d'une دائرة se construit par
 *    celles de deux points (longueur et rayon gardés).
 * C. Sous le doigt : [OA] et [OA′] en pointillés, l'arc fléché de A vers A′ avec sa mesure, le sens (↺ / ↻) ; une
 *    image refusée reste en rose et le panneau dit QUELLE condition manque ; une image juste fait rouler la lumière
 *    de la nacelle jusqu'à sa place.
 * D. La lecture « $OA = 3$ ، $OA' = 3$ » · « $\widehat{AOA'} = 60^\circ$ ↺ » · les voyants البعد · الزاوية · الاتجاه.
 * E. À découvrir avant la règle : la même mesure dans l'autre sens mène ailleurs (le jumeau horaire) ; la bonne
 *    direction au mauvais rayon n'est pas l'image ; le bon rayon ne suffit pas non plus.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        l'image d'un point par un دوران ; trois conditions (OM′ = OM, la mesure α, le sens)
 *   OBJECT         une grande roue la nuit (six nacelles, des lampes sur la jante et sur un anneau intérieur) ; une
 *                  feuille, un compas et une منقلة
 *   VARIABLE       la position de l'image (un nœud de la roue ; un point de la feuille) — et, sur la feuille,
 *                  l'ouverture du compas et l'angle de la règle
 *   INVARIANT      la distance au centre : la nacelle reste sur sa jante ; la longueur d'une قطعة, le rayon d'une دائرة
 *   TRANSFORMATION l'arc fléché, la mesure, le sens et les rayons lus changent avec l'image tenue
 *   CONSTRAINT     `rotation.imageCheck` (packages/core) : rien n'est accepté sans les trois conditions
 *   RESISTANCE     le refus NOMME ce qui manque : « نفس الزاوية لكن في الاتجاه المعاكس » / « الاتجاه صحيح لكن
 *                  OA′ ≠ OA » / « البعد صحيح لكن الزاوية 90° لا 60° » ; l'image refusée reste en rose
 *   EVIDENCE       les places acceptées, l'arc et sa mesure, A′B′ = AB, W′A′ = WA
 *   CONTRAST       مبتدئ : chaque rotation est demandée dans les DEUX sens (60° ↺ puis 60° ↻ : deux nacelles
 *                  différentes) ; متقدم : un point, une قطعة qui ne reste pas parallèle, une دائرة qui change de centre
 *   PREDICTION     où arrive la nacelle, avant que la lumière ne roule ; le compas avant la règle
 *   DISCOVERY      « $OA' = OA$ و $\widehat{AOA'} = \alpha$ في الاتجاه المعطى » ; « صورة قطعة / دائرة »
 *   FORMALIZATION  معارف 1–2 (p. 154), طرائق (p. 155)
 *   TRANSFER       نشاط 3 (المستقيم، نصف المستقيم), تمارين 1, 2, 3, 5, 7, la banque d'exercices
 *
 * Manuel (§6bis) : chaque dépôt est un essai — aucune auto-complétion. Toutes les vérités viennent de
 * `rotation.imageCheck` via logic/rotationDial.js ; le dessin est en flottants.
 *
 * DÉCOR (exigence du propriétaire, monde `ferris-wheel`) : le parc de Ben Aknoun au crépuscule — ciel dégradé, étoiles,
 * le croissant de lune, les collines d'Alger et leurs fenêtres allumées, les pieds de la roue, la cabine des tickets
 * dont le bouton change la couleur des lampes ; sur la feuille, un autocollant de la roue dans le coin. `aria-hidden`,
 * hors clavier (`tabIndex=-1`), `[data-deco]`, immobile sous `prefers-reduced-motion`, jamais une information.
 *
 * D'UN SEUL REGARD (§8bis) : `[data-rd-glance]` = la scène CARRÉE + le panneau (tâche, lectures, voyants, verdict).
 * Le panneau se met à côté dès 620 px, sinon dessous ; le côté de la scène est borné par l'écran de leçon
 * (`useLessonViewport`) moins ce que le bloc mesure en plus. La liste des essais est un `LabFold` hors du bloc.
 *
 * Props : `scene` ('wheel' | 'plane'), roue : `r`, `inner`, `gondolas`, `step`, `tasks` ; feuille : `missions` ;
 * `theme` (`ferris-wheel`), `title`, `lead`, `mission`, `level`, `levels`, `onTrial(evidence)` à chaque dépôt,
 * `onFinished(summary)` à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-rotation-dial][data-scene][data-solved][data-task|data-mission], [data-rd-glance], [data-rd-scene],
 * [data-rd-handle=image|compass|ray] (boutons), [data-rd-node] (roue), [data-rd-gondola=<nom>], [data-rd-arc],
 * [data-rd-circle], [data-rd-ray], [data-rd-image=<nom>], [data-rd-tab=<id>][data-done], [data-rd-reading],
 * [data-rd-lamp=length|angle|sense][data-on], [data-rd-verdict=<kind>], [data-rd-outcome], [data-lab-fold=rotation-dial.trials],
 * [data-deco],
 * [data-rd-step=<i>] (LabStepper : une étape par tâche de la roue ou par mission de la feuille).
 *
 * QUESTIONS PENDANT LE LABO (2026-10-28, lot 3 ; `primitives/LabCheckpoint`) : `chainOf(lab, i)` donne la suite de l'étape i, `QUESTIONS` les construit sur les
 * nombres de l'élève. Roue : 1re tâche (angle · distance), sa jumelle de sens contraire (angle · « même place ? »), une tâche de plusieurs pas (pas · angle),
 * la dernière (jumelle) finit par la RÈGLE. Feuille : le point (compas · angle), la قطعة (longueur · parallélisme), la دائرة (rayon · centre) puis la RÈGLE.
 * Une étape est atteinte quand elle ET les précédentes sont finies (`logic › stepsOf`) ; « أعِد التجربة » : `logic › retryStep`. Réglage enseignant
 * `useLabCheckpointSettings('rotation-dial')` ; questions actives ⇒ `guided`. Sons : déclic de l'image tenue, `flag` (image juste), `bell` (paire de tâches
 * ou mission finie), `over` (image refusée).
 */
const PRIME = (s) => String(s).replace(/'/g, '′');
const LIGHTS = [['#FBBF24', '#FDE68A'], ['#F472B6', '#FBCFE8'], ['#22D3EE', '#A5F3FC'], ['#4ADE80', '#BBF7D0']];
const DEG = Math.PI / 180;
const KNOB = 'absolute flex h-11 w-11 items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-sky-300';

/** Un arc fléché de centre c (px), rayon R (px), depuis la direction th1 (degrés, repère math), de `signed` degrés. */
function arcGeom(c, R, th1, signed) {
  const a1 = th1 * DEG; const a2 = (th1 + signed) * DEG;
  const P = (a) => [c[0] + R * Math.cos(a), c[1] - R * Math.sin(a)];
  const [x1, y1] = P(a1); const [x2, y2] = P(a2);
  const sweep = signed > 0 ? 0 : 1;
  const large = Math.abs(signed) > 180 ? 1 : 0;
  // tangente (écran) au bout, dans le sens du parcours
  const sg = signed > 0 ? 1 : -1;
  const tx = -Math.sin(a2) * sg; const ty = -Math.cos(a2) * sg;
  const h = 8; const w = 4;
  const foot = [x2 - tx * h, y2 - ty * h];
  const arrow = `${x2},${y2} ${foot[0] - ty * w},${foot[1] + tx * w} ${foot[0] + ty * w},${foot[1] - tx * w}`;
  const mid = (th1 + signed / 2) * DEG;
  return { d: `M ${x1} ${y1} A ${R} ${R} 0 ${large} ${sweep} ${x2} ${y2}`, arrow, label: [c[0] + (R + 14) * Math.cos(mid), c[1] - (R + 14) * Math.sin(mid) + 4] };
}

export default function RotationDial({
  scene = 'wheel', r, inner, gondolas, step, tasks, missions, theme = 'ferris-wheel', title, lead, mission, level,
  levels: withLevels = true, checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.rotationDial.${key}`, o), [t]);
  const reduce = useReducedMotion();
  const initialNumbers = scene === 'plane' ? { scene, missions } : { scene, r, inner, gondolas, step, tasks };
  const state = useManipulation({ type: 'rotation-dial', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const make = () => L.init(nums);
  const [lab, setLab] = useState(make);
  const sceneKey = `${JSON.stringify(nums)}|${state.epoch}`;
  const [seen, setSeen] = useState({ key: sceneKey, inits: 0 });
  const [doneIds, setDoneIds] = useState({});
  const [hold, setHold] = useState(null); // { id: 'image' | 'compass' | 'ray', cursor: {x,y}, mode: 'drag' | 'select' | 'key' }
  const [pencilDeg, setPencilDeg] = useState(null);
  const [shake, setShake] = useState(0);
  const [ride, setRide] = useState(null); // { n, at, signed }
  const [lights, setLights] = useState(0);
  // « إعادة » (epoch), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais, les questions du labo
  if (seen.key !== sceneKey) { setSeen({ key: sceneKey, inits: seen.inits + 1 }); setLab(make()); setHold(null); setPencilDeg(null); setRide(null); setDoneIds({}); }
  const wheel = lab.scene === 'wheel';

  /* ── pédagogie : découverte, règle, essais ── */
  const ready = L.discoveryReady(lab);
  // les questions pendant le labo : obligatoires pour tout élève, l'enseignant seul les coupe pour SON compte (L2)
  const cpSettings = useLabCheckpointSettings('rotation-dial');
  const cpLive = cpOn && cpSettings.enabled;
  useEffect(() => { if (ready && !cpLive) state.discover(); }, [ready, state.epoch, cpLive]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, L.summaryOf(lab)); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => { if (nTrials > 0) state.report(onTrial, L.evidenceOf(lab)); }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : largeur, écran de leçon, surplus du bloc « glance » ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const sceneRef = useRef(null);
  const sideRef = useRef(300);
  const [width, setWidth] = useState(340);
  const [overhead, setOverhead] = useState(210);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(200, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(0, Math.ceil(glanceRef.current.getBoundingClientRect().height) - sideRef.current));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (glanceRef.current) ro.observe(glanceRef.current);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const immersed = useManipulationImmersive();   // plein écran (L7) : l'écran moins la barre du shell ; le stepper (≈ 52 px) est toujours au-dessus
  const lessonH = vp.ready && vp.height > 0 ? vp.height : 640;
  const screenH = (immersed && typeof window !== 'undefined' ? Math.min(lessonH, window.innerHeight - 96) : lessonH) - 52;
  const side = width >= 620;
  const panelW = width >= 900 ? 270 : 236;
  const sceneSide = Math.round(Math.max(200, Math.min(side ? width - panelW - 12 : width, side ? screenH - 40 : screenH - overhead - 28, 600)));
  sideRef.current = side ? 0 : sceneSide;
  const geo = L.layout(lab, sceneSide, wheel ? 14 : 16);
  const px = (p) => geo.toPx(p);
  const unitPx = geo.scale;

  /* ── la tâche (roue) ou la mission (feuille) en cours ── */
  const tk = wheel ? L.task(lab) : null;
  const ms = wheel ? null : L.mission(lab);
  const curName = wheel ? tk.from : L.current(lab);
  const P = wheel ? L.gondolaPoint(lab, tk.from) : (curName ? L.sourcePoint(lab) : null);
  const alpha = wheel ? tk.alpha : ms.alpha;
  const direction = wheel ? tk.direction : ms.direction;
  const last = lab.last;
  const lastHere = last && (wheel ? last.task === tk.id : last.mission === ms.id && last.from === curName) ? last : null;

  /* ── le repère A′ : où il est (tenu, refusé, ou à son plateau) ── */
  // le plateau du repère A′ : une place libre (sous la roue, à gauche des pieds ; le coin bas de la feuille) — aucune étiquette dessous
  const tray = wheel ? { x: -3.55, y: -3.75 } : { x: L.BOX.plane - 0.9, y: -L.BOX.plane + 0.9 };
  const imagePos = hold?.id === 'image' ? hold.cursor : lastHere && !lastHere.ok ? lastHere.at : tray;
  const atTray = !(hold?.id === 'image') && !(lastHere && !lastHere.ok);
  const live = P && !atTray ? L.reading(P, imagePos) : null;
  const liveCheck = P && !atTray ? L.judge(P, imagePos, alpha, direction, wheel ? L.TOL.wheel : L.TOL.plane) : null;

  /* ── gestes ── */
  const toUnits = (cx, cy) => {
    const box = sceneRef.current?.getBoundingClientRect();
    if (!box) return { x: 0, y: 0 };
    return geo.fromPx(cx - box.left, cy - box.top);
  };
  const snapImage = (q) => {
    if (wheel) { const nd = L.nodeNear(lab, q.x, q.y); return { x: nd.x, y: nd.y, node: nd }; }
    return L.snapImage(lab, q, Math.max(0.25, 18 / unitPx));
  };
  const commitImage = (q) => {
    setHold(null);
    if (!P) return;
    const s = snapImage(q);
    setLab((cur) => {
      const next = wheel ? L.placeWheel(cur, s.node) : L.placePlane(cur, s);
      const x = next.last;
      if (x && !x.ok) setShake((n) => n + 1);
      if (x && x.ok) setRide({ n: x.n, at: x.at, from: wheel ? L.gondolaPoint(cur, x.from) : L.mission(cur).pts[x.from], signed: (x.direction === 'direct' ? 1 : -1) * x.alpha });
      return next;
    });
  };
  const applyTool = (id, q) => {
    if (id === 'image') { commitImage(q); return; }
    if (!P) return;
    if (id === 'compass') { setLab((cur) => L.setRadius(cur, Math.hypot(q.x, q.y))); setPencilDeg(Math.atan2(q.y, q.x) / DEG); }
    if (id === 'ray') setLab((cur) => L.setRay(cur, Math.atan2(q.y, q.x) / DEG - L.reading({ x: 1, y: 0 }, P).signed));
  };

  const drag = useRef(null);
  const onDown = (id) => (e) => {
    if (e.button > 0) return;
    e.preventDefault(); e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { id, sx: e.clientX, sy: e.clientY, moved: false };
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return;
    d.moved = true;
    const q = toUnits(e.clientX, e.clientY);
    if (d.id === 'image') setHold({ id: 'image', cursor: wheel ? snapImage(q) : snapImage(q), mode: 'drag' });
    else { setHold({ id: d.id, cursor: q, mode: 'drag' }); applyTool(d.id, q); }
  };
  const onUp = (id) => (e) => {
    e.stopPropagation(); // le relâchement sur une poignée ne doit pas devenir un toucher de la scène
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (d.moved) {
      const q = toUnits(e.clientX, e.clientY);
      if (id === 'image') commitImage(q); else { applyTool(id, q); setHold(null); }
      return;
    }
    // un toucher : choisir cet outil (puis toucher la scène), ou le reposer
    if (hold && hold.id === id) setHold(null);
    else setHold({ id, cursor: id === 'image' ? imagePos : id === 'compass' ? pencilAt : rayAt, mode: 'select' });
  };
  const onSceneUp = (e) => {
    if (drag.current) return;
    const q = toUnits(e.clientX, e.clientY);
    if (hold && hold.mode !== 'drag') { applyTool(hold.id, q); if (hold.id !== 'image') setHold(null); return; }
    if (wheel && !hold) commitImage(q); // la roue : toucher un nœud y pose l'image
  };

  /* clavier : ←/→ = ∓1 pas (rayon, degré, 0,1), Maj = grand pas ; ↑/↓ ; Entrée pose l'image */
  const onKey = (id) => (e) => {
    const big = e.shiftKey;
    if (id === 'image') {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!atTray || hold?.id === 'image') commitImage(imagePos); return; }
      if (e.key === 'Escape') { e.preventDefault(); setHold(null); return; }
      const dir = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
      if (!dir || !P) return;
      e.preventDefault();
      if (wheel) {
        const m = lab.k * 2;
        const cur = atTray ? L.nodeNear(lab, P.x, P.y) : L.nodeNear(lab, imagePos.x, imagePos.y);
        let ring = cur.ring; let i = cur.i;
        if (!atTray) {
          if (dir[0]) i += dir[0] * (big ? 2 : 1);
          if (dir[1]) ring = dir[1] > 0 ? 'rim' : 'inner';
        }
        const nd = L.nodeAt(lab, ring, ((i % m) + m) % m);
        setHold({ id: 'image', cursor: { x: nd.x, y: nd.y, node: nd }, mode: 'key' });
      } else {
        const s = big ? 0.5 : 0.1;
        // depuis le plateau, le premier pas part de SA construction (cercle ∩ demi-droite) si elle existe, sinon de P
        const base = atTray && hold?.id !== 'image' ? (L.crossing(lab) ?? P) : imagePos;
        setHold({ id: 'image', cursor: snapImage({ x: base.x + dir[0] * s, y: base.y + dir[1] * s }), mode: 'key' });
      }
      return;
    }
    const inc = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
    if (!inc || !P) return;
    e.preventDefault();
    if (id === 'compass') setLab((cur) => L.setRadius(cur, (cur.radius ?? 1) + inc * (big ? 1 : 0.1)));
    if (id === 'ray') setLab((cur) => L.setRay(cur, (cur.ray ?? 0) + inc * (big ? 10 : 1)));
  };

  /* ── positions des poignées de la feuille ── */
  const bearingP = P ? L.reading({ x: 1, y: 0 }, P).signed ?? 0 : 0;
  const rProt = Math.min(2.3, L.BOX.plane * 0.4);
  const pencilR = lab.radius ?? 1.1;
  const pencilAngle = lab.radius != null && pencilDeg != null ? pencilDeg : bearingP + 180;
  const pencilAt = L.polar(pencilR, pencilAngle);
  const rayAngle = lab.ray != null ? bearingP + lab.ray : bearingP;
  const rayAt = L.polar(rProt - 0.28, rayAngle);

  /* ── verdict ── */
  const lens = (name, rP, rQ) => ({ OP: `$O${name ?? ''} = ${L.fmt(rP, wheel ? 1 : 2).replace(',', '{,}')}$`, OQ: `$O${name ?? ''}' = ${L.fmt(rQ, wheel ? 1 : 2).replace(',', '{,}')}$` });
  const verdict = (() => {
    if (!last) return null;
    const o = { p: PRIME(last.from), q: PRIME(last.name), a: `$${last.alpha}^\\circ$`, m: `$${last.measured}^\\circ$`, AOA: `$\\widehat{${last.from}O${last.name}}$`, AOAv: `$\\widehat{${last.from}O${last.name}} = ${last.alpha}^\\circ$`,
      ...lens(last.from, last.rP, last.rQ), sense: k(`sense_${last.direction}`), land: last.landsOn ?? '' };
    if (last.ok) return k(wheel ? (last.landsOn ? 'vOkWheel' : 'vOk') : 'vOk', o);
    return k(`v_${last.kind}`, o);
  })();
  const out = !wheel && L.missionDone(lab) ? L.outcome(lab) : null;

  /* ── découverte ── */
  const discoveryOptions = useMemo(() => (wheel ? [
    { text: <MathText>{k('dWheelRadius')}</MathText>, why: <MathText>{k('dWheelRadiusWhy')}</MathText> },
    { text: <MathText>{k('dWheelRight')}</MathText>, correct: true },
    { text: <MathText>{k('dWheelSense')}</MathText>, why: <MathText>{k('dWheelSenseWhy')}</MathText> },
    { text: <MathText>{k('dWheelAngle')}</MathText>, why: <MathText>{k('dWheelAngleWhy')}</MathText> },
  ] : [
    { text: <MathText>{k('dPlaneParallel')}</MathText>, why: <MathText>{k('dPlaneParallelWhy')}</MathText> },
    { text: <MathText>{k('dPlaneCenter')}</MathText>, why: <MathText>{k('dPlaneCenterWhy')}</MathText> },
    { text: <MathText>{k('dPlaneRight')}</MathText>, correct: true },
    { text: <MathText>{k('dPlaneLonger')}</MathText>, why: <MathText>{k('dPlaneLongerWhy')}</MathText> },
  ]), [wheel, k]);
  const formal = wheel ? (
    <div className="space-y-2" data-rd-formal>
      {lab.tasks.map((x) => (
        <EquationDisplay key={x.id} tone="result" size="sm" tex={`O${x.from}' = O${x.from}\\ ,\\ \\widehat{${x.from}O${x.from}'} = ${x.alpha}^\\circ\\ ${x.direction === 'direct' ? '\\circlearrowleft' : '\\circlearrowright'}`} />
      ))}
      <p className="text-sm text-emerald-900"><MathText>{k('fWheel')}</MathText></p>
    </div>
  ) : (
    <div className="space-y-2" data-rd-formal>
      {lab.missions.map((_, i) => L.outcome(lab, i)).filter((o) => o && o.kind !== 'point').map((o) => (
        <EquationDisplay key={o.kind} tone="result" size="sm" tex={`${o.a}'${o.b}' = ${o.a}${o.b} = ${L.fmt(o.after).replace(',', '{,}')}`} />
      ))}
      <p className="text-sm text-emerald-900"><MathText>{k('fPlane')}</MathText></p>
    </div>
  );

  /* ── les étapes et leurs questions : une tâche (roue) ou une mission (feuille) finie ouvre sa suite, dans l'ordre ── */
  const stepList = L.stepsOf(lab).map((st, i) => ({ ...st, chain: chainOf(lab, i) }));
  const stepDone = stepList.map((st) => !!doneIds[st.id] || (!cpLive && st.reached));
  const nextStep = cpLive ? stepList.find((st) => !doneIds[st.id]) : null;
  const cpId = nextStep && nextStep.reached ? nextStep.id : null;
  const chain = cpId ? nextStep.chain : null;
  const cp = useLabCheckpoint({
    id: cpId,
    questions: chain ? chain.map((q) => QUESTIONS[q]({ lab, step: nextStep, options: discoveryOptions, formal, wheel }, k)) : null,
    reached: !!cpId,
    resetKey: seen.inits,
    onRetry: () => { setHold(null); setRide(null); setLab((cur) => L.retryStep(cur, cpId)); },
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

  /* ── le son : un déclic quand l'image tenue change de place (au plus un toutes les 35 ms), « flag » à l'image juste, « bell » à la mission
     ou à la paire de tâches finie, « over » à l'image refusée. Muet sauf « الصوت ». ── */
  const tick = useRef({ key: '', at: 0 });
  const gestureKey = `${hold?.id === 'image' ? `${Math.round(hold.cursor.x * 50)},${Math.round(hold.cursor.y * 50)}` : ''}|${lab.radius ?? ''}|${lab.ray ?? ''}`;
  useEffect(() => {
    const p = tick.current;
    if (p.key === gestureKey) return;
    const first = p.key === '';
    p.key = gestureKey;
    const now = performance.now();
    if (!first && gestureKey !== '||' && now - p.at > 35) { playSfx('tooth'); p.at = now; }
  }, [gestureKey]);
  const heard = useRef(0);
  useEffect(() => {
    const n = lab.trials.length;
    if (n === 0) { heard.current = 0; return; }
    if (n === heard.current) return;
    heard.current = n;
    const x = lab.last;
    if (!x) return;
    if (!x.ok) { playSfx('over'); return; }
    playSfx('flag');
    const closes = wheel ? L.taskDone(lab, lab.tasks.findIndex((tt) => tt.id === x.task)) && x.task && lab.tasks.findIndex((tt) => tt.id === x.task) % 2 === 1 : L.missionDone(lab, lab.missions.findIndex((mm) => mm.id === x.mission));
    if (closes) playSfx('bell');
  }, [lab]); // eslint-disable-line react-hooks/exhaustive-deps

  const missionText = mission ?? <MathText>{k(wheel ? 'missionWheel' : 'missionPlane')}</MathText>;
  const hintKeys = wheel ? ['hintW1', 'hintW2', 'hintW3'] : ['hintP1', 'hintP2', 'hintP3'];
  const senseIcon = (d) => (d === 'direct' ? '↺' : d === 'indirect' ? '↻' : '');
  const textSize = 'text-xs';

  /* ── le panneau : onglets, tâche, lectures, voyants, verdict ── */
  const tabs = wheel ? lab.tasks.map((x, i) => ({ id: x.id, i, done: L.taskDone(lab, i), label: `${x.from} · ${x.alpha}° ${senseIcon(x.direction)}`, aria: k('tabTaskAria', { from: x.from, alpha: x.alpha, sense: k(`sense_${x.direction}`) }) }))
    : lab.missions.map((x, i) => ({ id: x.id, i, done: L.missionDone(lab, i), label: k(`tab_${x.id}`), aria: k('tabMissionAria', { name: k(`tab_${x.id}`), alpha: x.alpha }) }));
  const activeTab = wheel ? lab.t : lab.m;
  const goTab = (i) => { setHold(null); setLab((s) => (wheel ? L.goToTask(s, i) : L.goToMission(s, i))); };
  const taskLine = wheel
    ? k('taskWheel', { from: `$${tk.from}$`, a: `$${tk.alpha}^\\circ$`, sense: k(`sense_${tk.direction}`), icon: senseIcon(tk.direction) })
    : curName ? k(`task_${ms.id}`, { p: `$${curName}$`, a: `$${ms.alpha}^\\circ$`, sense: k(`sense_${ms.direction}`), icon: senseIcon(ms.direction) }) : k('missionComplete');
  const lampOn = (el) => (wheel && liveCheck && hold?.id === 'image' ? (el === 'length' ? liveCheck.length : el === 'angle' ? liveCheck.angle : liveCheck.sense !== false) : null);
  const steps = !wheel && curName ? [
    { id: 'compass', on: lab.radius != null }, { id: 'ray', on: lab.ray != null }, { id: 'image', on: false },
  ] : null;

  const panel = (
    <div className={`flex min-w-0 flex-col gap-1.5 rounded-2xl border-2 border-indigo-900 bg-slate-900 p-2 text-slate-100 ${side ? '' : 'w-full'}`}
      style={side ? { width: panelW } : undefined} data-rd-panel>
      <div className="flex items-center gap-1.5">
        <span className={`truncate ${textSize} font-bold text-amber-300`}>{k(wheel ? 'panelWheel' : 'panelPlane')}</span>
        <TicketDeco lights={lights} onTap={() => setLights((n) => n + 1)} />
      </div>
      <div className={`grid ${tabs.length === 4 ? 'grid-cols-4' : 'grid-cols-3'} gap-1`} role="group" aria-label={k('tabsLabel')} data-rd-tabs>
        {tabs.map((x) => (
          <button key={x.id} type="button" onClick={() => goTab(x.i)} aria-pressed={x.i === activeTab} aria-label={x.aria}
            data-rd-tab={x.id} data-done={x.done ? 'true' : 'false'}
            className={`min-h-[44px] rounded-lg border px-0.5 text-[11px] font-bold leading-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${x.i === activeTab ? 'border-amber-300 bg-indigo-800 text-white' : 'border-slate-600 bg-slate-800 text-slate-300'}`}>
            {wheel ? <bdi dir="ltr">{x.label}</bdi> : x.label}{x.done ? ' ✓' : ''}
          </button>
        ))}
      </div>
      <p className={`rounded-lg bg-indigo-950/70 px-2 py-1 ${textSize} font-bold leading-snug text-amber-100`} data-rd-task><MathText>{taskLine}</MathText></p>
      {steps && (
        <ol className="flex gap-1" data-rd-steps>
          {steps.map((s, i) => (
            <li key={s.id} className={`flex-1 rounded-md px-1 py-0.5 text-center text-[10.5px] font-bold ${s.on ? 'bg-emerald-500/25 text-emerald-200' : 'bg-slate-800 text-slate-300'}`}>
              {`${i + 1}. ${k(`step_${s.id}`)}`}{s.on ? ' ✓' : ''}
            </li>
          ))}
        </ol>
      )}
      <div className={`rounded-lg bg-slate-800 px-2 py-1 ${textSize} leading-snug`} data-rd-reading aria-live="polite">
        {P && live && live.measured != null ? (
          <>
            <p><MathText>{`${lens(curName, live.rP, live.rQ).OP} ، ${lens(curName, live.rP, live.rQ).OQ}`}</MathText></p>
            <p><MathText>{k('readAngle', { AOA: `$\\widehat{${curName}O${curName}'} = ${live.measured}^\\circ$`, icon: senseIcon(live.dir), sense: live.dir ? k(`sense_${live.dir}`) : '' })}</MathText></p>
          </>
        ) : !wheel && P && (lab.radius != null || lab.ray != null) ? (
          <>
            {lab.radius != null && <p><MathText>{k('readCompass', { r: `$${L.fmt(lab.radius).replace(',', '{,}')}$`, OP: `$O${curName} = ${L.fmt(Math.hypot(P.x, P.y)).replace(',', '{,}')}$` })}</MathText></p>}
            {lab.ray != null && <p><MathText>{k('readRay', { d: `$${Math.abs(lab.ray)}^\\circ$`, icon: senseIcon(lab.ray > 0 ? 'direct' : lab.ray < 0 ? 'indirect' : null) })}</MathText></p>}
          </>
        ) : out ? (
          <p data-rd-outcome={out.kind}><MathText>{k(`out_${out.kind}`, { len: `$${L.fmt(out.after).replace(',', '{,}')}$` })}</MathText></p>
        ) : <p className="text-slate-300"><MathText>{k(wheel ? 'readWaitWheel' : 'readWaitPlane')}</MathText></p>}
      </div>
      {wheel && (
        <div className="flex flex-wrap gap-1" data-rd-lamps>
          {['length', 'angle', 'sense'].map((el) => {
            const on = lampOn(el);
            return (
              <span key={el} data-rd-lamp={el} data-on={on == null ? '' : String(on)}
                className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${on == null ? 'bg-slate-800 text-slate-400' : on ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/25 text-rose-200'}`}>
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${on == null ? 'bg-slate-500' : on ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                {k(`lamp_${el}`)}{on == null ? '' : on ? ' ✓' : ' ✗'}
              </span>
            );
          })}
        </div>
      )}
      <p role="status" className={`min-h-[2.6rem] rounded-lg bg-white px-2 py-1 ${textSize} font-bold leading-snug ${lastHere?.ok || (last?.ok && !lastHere) ? 'text-emerald-800' : lastHere ? 'text-rose-800' : 'text-slate-600'}`}
        data-rd-verdict={last?.kind ?? ''}>
        <MathText>{verdict ?? k(wheel ? 'waitingWheel' : 'waitingPlane')}</MathText>
      </p>
    </div>
  );

  /* ── les poignées (boutons posés sur la scène) ── */
  const handles = [];
  if (P) {
    handles.push({ id: 'image', at: imagePos, aria: k(wheel ? 'grabImageWheel' : 'grabImagePlane', { q: PRIME(`${curName}'`), p: curName }) });
    if (!wheel) {
      handles.push({ id: 'compass', at: pencilAt, aria: k('grabCompass', { p: curName }) });
      handles.push({ id: 'ray', at: rayAt, aria: k('grabRay', { p: curName }) });
    }
  }

  return (
    <ManipulationShell
      type="rotation-dial"
      title={title ?? k('title')}
      mission={missionText}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided={cpLive}
      hints={hintKeys.map((h) => <MathText key={h}>{k(h)}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={<ManipulationDiscovery state={state} prompt={<MathText>{k(wheel ? 'dPromptWheel' : 'dPromptPlane')}</MathText>} options={discoveryOptions} formal={formal} />}
      explanation={<MathText>{k(wheel ? 'explanationWheel' : 'explanationPlane')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-indigo-50 to-white !p-3" minHeight="min-h-[200px]" dragging={hold?.mode === 'drag'}>
        <div ref={boxRef} className="relative space-y-2" data-rotation-dial data-scene={lab.scene} data-world={theme}
          data-solved={ready ? 'true' : 'false'} {...(wheel ? { 'data-task': tk.id } : { 'data-mission': ms.id })} data-side={sceneSide}>
          {party.node}
          {cp.node}
          <LabStepper count={stepList.length} current={Math.max(0, stepDone.indexOf(false) < 0 ? stepList.length - 1 : stepDone.indexOf(false))} done={stepDone} stepAttr="data-rd-step" />
          <div ref={glanceRef} className={`flex ${side ? 'flex-row items-start' : 'flex-col items-center'} justify-center gap-2`} data-rd-glance>
            <div ref={sceneRef} className="relative shrink-0 overflow-hidden rounded-xl" style={{ width: sceneSide, height: sceneSide, touchAction: 'none' }}
              onPointerUp={onSceneUp} data-rd-scene>
              {wheel
                ? <WheelScene lab={lab} geo={geo} tk={tk} P={P} imagePos={imagePos} atTray={atTray} live={live} liveCheck={liveCheck}
                  hold={hold} lastHere={lastHere} ride={ride} reduce={reduce} lights={lights} shake={shake} />
                : <PlaneScene lab={lab} geo={geo} ms={ms} P={P} curName={curName} imagePos={imagePos} atTray={atTray} live={live}
                  hold={hold} lastHere={lastHere} ride={ride} reduce={reduce} pencilAt={pencilAt} rProt={rProt} rayAngle={rayAngle} bearingP={bearingP} shake={shake} />}
              {handles.map((h) => {
                const [x, y] = px(h.at);
                const mine = hold?.id === h.id;
                return (
                  <button key={h.id} type="button" data-rd-handle={h.id} aria-label={h.aria} aria-pressed={mine}
                    onPointerDown={onDown(h.id)} onPointerMove={onMove} onPointerUp={onUp(h.id)} onPointerCancel={() => { drag.current = null; }}
                    onKeyDown={onKey(h.id)}
                    className={`${KNOB} ${mine ? 'ring-4 ring-amber-300' : ''}`}
                    style={{ left: Math.max(0, Math.min(sceneSide - 44, x - 22)), top: Math.max(0, Math.min(sceneSide - 44, y - 22)), touchAction: 'none', cursor: drag.current ? 'grabbing' : 'grab' }} />
                );
              })}
            </div>
            {panel}
          </div>

          {lab.trials.length > 0 && (
            <LabFold id="rotation-dial.trials" title={k('trialsTitle')} defaultOpen={false}>
              <ul className="space-y-0.5 text-xs" data-rd-trials={lab.trials.length}>
                {lab.trials.map((x) => (
                  <li key={x.n} className={x.ok ? 'text-emerald-800' : 'text-rose-800'} data-kind={x.kind}>
                    <MathText>{k('trialRow', { n: x.n, q: PRIME(x.name), a: `$${x.alpha}^\\circ$`, icon: senseIcon(x.direction), verdict: k(`t_${x.kind}`, { m: `$${x.measured}^\\circ$` }) })}</MathText>
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

/* ── ce qui est commun aux deux scènes : rayons pointillés, arc fléché, mesure ── */
function AngleMark({ geo, P, Q, color, data }) {
  const rd = L.reading(P, Q);
  if (rd.measured == null || rd.measured === 0) return null;
  const c = geo.toPx({ x: 0, y: 0 });
  const th1 = Math.atan2(P.y, P.x) / DEG;
  const R = Math.max(18, Math.min(geo.scale * 1.05, 46));
  const arc = arcGeom(c, R, th1, rd.signed);
  const [qx, qy] = geo.toPx(Q); const [ppx, ppy] = geo.toPx(P);
  return (
    <g data-rd-arc={data}>
      <line x1={c[0]} y1={c[1]} x2={ppx} y2={ppy} stroke={color} strokeWidth={1.6} strokeDasharray="5 4" />
      <line x1={c[0]} y1={c[1]} x2={qx} y2={qy} stroke={color} strokeWidth={1.6} strokeDasharray="5 4" />
      <path d={arc.d} fill="none" stroke={color} strokeWidth={2.4} />
      <polygon points={arc.arrow} fill={color} />
      <text x={arc.label[0]} y={arc.label[1]} textAnchor="middle" fontSize={12} fontWeight={800} fill={color} style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{`${rd.measured}°`}</text>
    </g>
  );
}

/** La lumière qui roule de P à son image le long de l'arc (une réussite) — rien sous reduced-motion. */
function Ride({ geo, ride, reduce, color }) {
  if (!ride || reduce) return null;
  const c = geo.toPx({ x: 0, y: 0 });
  const [x, y] = geo.toPx(ride.at);
  return (
    <g key={ride.n} className="rd-ride" style={{ transformOrigin: `${c[0]}px ${c[1]}px`, '--rd-from': `${ride.signed}deg` }} data-rd-ride>
      <circle cx={x} cy={y} r={9} fill={color} opacity={0.35} />
      <circle cx={x} cy={y} r={4.5} fill={color} />
      <style>{'.rd-ride{animation:rd-ride 1s cubic-bezier(.3,.7,.3,1) 1 both}@keyframes rd-ride{0%{transform:rotate(var(--rd-from));opacity:1}85%{opacity:1}100%{transform:rotate(0deg);opacity:0}}@media (prefers-reduced-motion: reduce){.rd-ride{animation:none;opacity:0}}'}</style>
    </g>
  );
}

/* ── la roue (مبتدئ) ── */
function WheelScene({ lab, geo, tk, P, imagePos, atTray, live, liveCheck, hold, lastHere, ride, reduce, lights, shake }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const S = geo.side;
  const c = geo.toPx({ x: 0, y: 0 });
  const u = geo.scale;
  const [lampA, lampB] = LIGHTS[lights % LIGHTS.length];
  const tx = { direction: 'ltr', unicodeBidi: 'isolate' };
  const stars = useMemo(() => Array.from({ length: 22 }, (_, i) => [((i * 37) % 100) / 100, ((i * 53) % 47) / 100, i % 3]), []);
  const ground = c[1] + u * 4.1;
  const doneImg = Object.entries(lab.done).map(([id, nodeId]) => ({ id, nd: L.nodes(lab).find((n) => n.id === nodeId), from: lab.tasks.find((x) => x.id === id).from }));
  const heldNode = hold?.id === 'image' ? hold.cursor : null;
  const showMarker = !atTray;
  const markColor = hold?.id === 'image' ? (liveCheck?.ok ? '#34D399' : '#FDE68A') : lastHere && !lastHere.ok ? '#FB7185' : '#FDE68A';
  return (
    <svg width={S} height={S} className="absolute inset-0" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
      <defs>
        <linearGradient id={`rd-dusk-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E1B4B" /><stop offset="0.55" stopColor="#4C1D95" /><stop offset="0.85" stopColor="#BE185D" /><stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      {/* décor : le crépuscule sur Ben Aknoun, la lune, les collines et leurs fenêtres */}
      <g data-deco="sky">
        <rect width={S} height={S} fill={`url(#rd-dusk-${uid})`} />
        {stars.map(([x, y, s], i) => <circle key={i} cx={x * S} cy={y * S * 0.7} r={s === 0 ? 1.3 : 0.8} fill="#E0E7FF" opacity={s === 2 ? 0.4 : 0.8} />)}
        <path d={`M ${S * 0.1} ${S * 0.07} a 11 11 0 1 0 9 17 a 9 9 0 1 1 -9 -17 Z`} fill="#FEF3C7" opacity={0.9} />
        <path d={`M0 ${ground - 4} Q ${S * 0.2} ${ground - 26} ${S * 0.42} ${ground - 10} T ${S * 0.8} ${ground - 18} T ${S} ${ground - 8} V ${S} H 0 Z`} fill="#1E1B4B" opacity={0.9} />
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={(i + 0.3) * (S / 16)} y={ground - 8 - ((i * 7) % 9)} width={2.4} height={2.4} fill="#FDE68A" opacity={0.75} />)}
        <rect x={0} y={ground} width={S} height={S - ground} fill="#0F172A" />
      </g>
      {/* les pieds de la roue (décor) */}
      <g data-deco="legs" stroke="#94A3B8" strokeWidth={3} strokeLinecap="round">
        <line x1={c[0]} y1={c[1]} x2={c[0] - u * 1.6} y2={ground} />
        <line x1={c[0]} y1={c[1]} x2={c[0] + u * 1.6} y2={ground} />
        <line x1={c[0] - u * 0.9} y1={c[1] + u * 2.2} x2={c[0] + u * 0.9} y2={c[1] + u * 2.2} strokeWidth={2} />
      </g>
      {/* la roue : jante, anneau intérieur, rayons */}
      <circle cx={c[0]} cy={c[1]} r={u * lab.r} fill="none" stroke="#E2E8F0" strokeWidth={3} />
      <circle cx={c[0]} cy={c[1]} r={u * lab.inner} fill="none" stroke="#CBD5E1" strokeWidth={1.6} opacity={0.8} />
      {Array.from({ length: lab.k * 2 }, (_, i) => {
        const a = (i * 360) / (lab.k * 2) * DEG;
        return <line key={i} x1={c[0]} y1={c[1]} x2={c[0] + u * lab.r * Math.cos(a)} y2={c[1] - u * lab.r * Math.sin(a)} stroke="#CBD5E1" strokeWidth={i % 2 === 0 ? 1.6 : 0.9} opacity={0.75} />;
      })}
      {/* les nœuds : lampes de la jante et de l'anneau */}
      {L.nodes(lab).map((nd) => {
        const [x, y] = geo.toPx(nd);
        return <circle key={nd.id} cx={x} cy={y} r={nd.ring === 'rim' ? 3 : 2.4} fill={nd.i % 2 === 0 && nd.ring === 'rim' ? lampA : lampB} opacity={0.9} data-rd-node={nd.id} className="rd-twinkle" style={{ animationDelay: `${(nd.i % 4) * 0.4}s` }} />;
      })}
      <style>{'.rd-twinkle{animation:rd-tw 2.4s ease-in-out infinite}@keyframes rd-tw{50%{opacity:.45}}@media (prefers-reduced-motion: reduce){.rd-twinkle{animation:none}}.rd-shake{animation:rd-shake .35s ease-in-out 1}@keyframes rd-shake{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}@media (prefers-reduced-motion: reduce){.rd-shake{animation:none}}'}</style>
      {/* les nacelles, suspendues sous leur point de la jante */}
      {lab.names.map((nm) => {
        const p = L.gondolaPoint(lab, nm);
        const [x, y] = geo.toPx(p);
        const w = Math.max(14, u * 0.62); const h = w * 0.78;
        const active = nm === tk.from;
        return (
          <g key={nm} data-rd-gondola={nm}>
            <line x1={x} y1={y} x2={x} y2={y + h * 0.35} stroke="#E2E8F0" strokeWidth={1.4} />
            <rect x={x - w / 2} y={y + h * 0.35} width={w} height={h} rx={w * 0.25} fill={active ? '#F59E0B' : '#6366F1'} stroke="#F8FAFC" strokeWidth={1.2} opacity={0.95} />
            <rect x={x - w * 0.32} y={y + h * 0.5} width={w * 0.64} height={h * 0.32} rx={2} fill="#E0F2FE" opacity={0.85} />
            <circle cx={x} cy={y} r={3.6} fill={active ? '#FBBF24' : '#F8FAFC'} />
            <text x={x} y={y + h * 1.35 + 11} textAnchor="middle" fontSize={Math.max(11, Math.min(15, u * 0.42))} fontWeight={800} fill="#FFFFFF" style={tx}>{nm}</text>
          </g>
        );
      })}
      {/* le moyeu O */}
      <circle cx={c[0]} cy={c[1]} r={6} fill="#F8FAFC" stroke="#1E1B4B" strokeWidth={2} />
      <text x={c[0] - 17} y={c[1] - 12} textAnchor="middle" fontSize={13} fontWeight={800} fill="#FFFFFF" stroke="#1E1B4B" strokeWidth={3} paintOrder="stroke" style={tx}>O</text>
      {/* les images déjà trouvées (vert) */}
      {doneImg.map(({ id, nd, from }) => {
        const [x, y] = geo.toPx(nd);
        return (
          <g key={id} data-rd-image={`${from}'`}>
            <circle cx={x} cy={y} r={7} fill="none" stroke="#34D399" strokeWidth={2.4} />
            {id === tk.id && <text x={x + 12} y={y - 8} fontSize={12} fontWeight={800} fill="#A7F3D0" style={tx}>{PRIME(`${from}'`)}</text>}
          </g>
        );
      })}
      {/* l'image tenue : rayons pointillés, arc fléché, mesure */}
      {showMarker && P && live?.measured != null && <AngleMark geo={geo} P={P} Q={imagePos} color={markColor} data={hold?.id === 'image' ? 'held' : 'refused'} />}
      {showMarker && (() => {
        const [x, y] = geo.toPx(heldNode ?? imagePos);
        return (
          <g className={lastHere && !lastHere.ok && !hold ? 'rd-shake' : undefined} key={`m${shake}`} data-rd-marker>
            <circle cx={x} cy={y} r={10} fill="none" stroke={markColor} strokeWidth={3} />
            <circle cx={x} cy={y} r={3} fill={markColor} />
            <text x={x + 13} y={y + 14} fontSize={13} fontWeight={800} fill={markColor} style={tx}>{PRIME(`${tk.from}'`)}</text>
          </g>
        );
      })()}
      {!showMarker && (() => {
        // au plateau (le moyeu) : le repère A′ attend d'être porté
        const [tx0, ty0] = geo.toPx(imagePos);
        return <g data-rd-marker="tray"><rect x={tx0 - 17} y={ty0 - 17} width={34} height={34} rx={8} fill="#1E1B4B" stroke="#FDE68A" strokeWidth={1.6} strokeDasharray="4 3" /><circle cx={tx0} cy={ty0} r={10} fill="none" stroke="#FDE68A" strokeWidth={2.4} /><circle cx={tx0} cy={ty0} r={3} fill="#FDE68A" /><text x={tx0} y={ty0 - 22} textAnchor="middle" fontSize={13} fontWeight={800} fill="#FDE68A" stroke="#1E1B4B" strokeWidth={3} paintOrder="stroke" style={tx}>{PRIME(`${tk.from}'`)}</text></g>;
      })()}
      <Ride geo={geo} ride={ride} reduce={reduce} color="#34D399" />
    </svg>
  );
}

/* ── la feuille (متقدم) : compas, منقلة, points, images ── */
function PlaneScene({ lab, geo, ms, P, curName, imagePos, atTray, live, hold, lastHere, ride, reduce, pencilAt, rProt, rayAngle, bearingP, shake }) {
  const S = geo.side;
  const c = geo.toPx({ x: 0, y: 0 });
  const u = geo.scale;
  const tx = { direction: 'ltr', unicodeBidi: 'isolate' };
  const im = L.imagesOf(lab);
  const pts = ms.pts;
  const label = (name, p, color = '#0F172A', dx = 9, dy = -9) => { const [x, y] = geo.toPx(p); return <text x={x + dx} y={y + dy} fontSize={14} fontWeight={800} fill={color} style={tx}>{PRIME(name)}</text>; };
  const dot = (p, color, r = 3.6) => { const [x, y] = geo.toPx(p); return <circle cx={x} cy={y} r={r} fill={color} />; };
  const showMarker = !atTray;
  const markColor = hold?.id === 'image' ? '#0EA5E9' : lastHere && !lastHere.ok ? '#E11D48' : '#0EA5E9';
  const hinge = (() => {
    const [nx, ny] = c; const [qx, qy] = geo.toPx(pencilAt);
    const mx = (nx + qx) / 2; const my = (ny + qy) / 2;
    const dx = qx - nx; const dy = qy - ny; const l = Math.hypot(dx, dy) || 1;
    // la charnière du compas au-dessus du milieu (côté « ciel » de la feuille)
    const nxp = -dy / l; const nyp = dx / l;
    const sgn = nyp > 0 ? -1 : 1;
    const h = Math.max(22, l * 0.55);
    return [mx + sgn * nxp * h, my + sgn * nyp * h];
  })();
  const [pcx, pcy] = geo.toPx(pencilAt);
  const rayEnd = L.polar(L.BOX.plane * 1.5, rayAngle);
  const [rex, rey] = geo.toPx(rayEnd);
  const [rhx, rhy] = geo.toPx(L.polar(rProt - 0.28, rayAngle));
  const protTicks = [];
  for (let d = -180; d < 180; d += 10) {
    const a = (bearingP + d) * DEG;
    const r1 = rProt * u; const r2 = (rProt - (d % 30 === 0 ? 0.32 : 0.18)) * u;
    protTicks.push(<line key={d} x1={c[0] + r1 * Math.cos(a)} y1={c[1] - r1 * Math.sin(a)} x2={c[0] + r2 * Math.cos(a)} y2={c[1] - r2 * Math.sin(a)} stroke="#1D4ED8" strokeWidth={d === 0 ? 2 : 1} />);
  }
  const protLabels = u * rProt > 70 ? [30, 60, 90, 120, 150, -30, -60, -90, -120, -150, 180] : [90, -90, 180];
  return (
    <svg width={S} height={S} className="absolute inset-0" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
      {/* la feuille, et l'autocollant de la grande roue dans le coin (décor) */}
      <rect width={S} height={S} fill="#FFFBEB" />
      <g data-deco="sticker" opacity={0.9}>
        <rect x={S - 58} y={8} width={50} height={50} rx={10} fill="#312E81" transform={`rotate(6 ${S - 33} 33)`} />
        <circle cx={S - 33} cy={30} r={15} fill="none" stroke="#FDE68A" strokeWidth={1.8} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={S - 33} y1={30} x2={S - 33 + 15 * Math.cos(i * 60 * DEG)} y2={30 - 15 * Math.sin(i * 60 * DEG)} stroke="#FDE68A" strokeWidth={1} />)}
        {Array.from({ length: 6 }, (_, i) => <rect key={`g${i}`} x={S - 33 + 15 * Math.cos(i * 60 * DEG) - 3} y={30 - 15 * Math.sin(i * 60 * DEG) + 1} width={6} height={5} rx={1.5} fill={i === 0 ? '#F59E0B' : '#A5B4FC'} />)}
        <line x1={S - 33} y1={30} x2={S - 43} y2={52} stroke="#94A3B8" strokeWidth={1.6} />
        <line x1={S - 33} y1={30} x2={S - 23} y2={52} stroke="#94A3B8" strokeWidth={1.6} />
      </g>
      <g data-deco="ticket" opacity={0.85} transform={`rotate(-8 34 ${S - 26})`}>
        <rect x={8} y={S - 40} width={54} height={26} rx={4} fill="#FDE68A" stroke="#F59E0B" strokeWidth={1.2} strokeDasharray="0" />
        <line x1={22} y1={S - 40} x2={22} y2={S - 14} stroke="#F59E0B" strokeWidth={1} strokeDasharray="2 2" />
        <circle cx={42} cy={S - 27} r={7} fill="none" stroke="#B45309" strokeWidth={1.2} />
        {Array.from({ length: 4 }, (_, i) => <line key={i} x1={42} y1={S - 27} x2={42 + 7 * Math.cos(i * 45 * DEG)} y2={S - 27 - 7 * Math.sin(i * 45 * DEG)} stroke="#B45309" strokeWidth={0.8} />)}
      </g>
      {/* la منقلة, posée en O, zéro sur [OP) */}
      {P && (lab.radius != null || lab.ray != null) && (
        <g data-rd-protractor opacity={0.9}>
          <circle cx={c[0]} cy={c[1]} r={rProt * u} fill="rgba(59,130,246,0.10)" stroke="#2563EB" strokeWidth={1.4} />
          <circle cx={c[0]} cy={c[1]} r={(rProt - 0.45) * u} fill="none" stroke="#93C5FD" strokeWidth={0.8} />
          {protTicks}
          {protLabels.map((d) => {
            const a = (bearingP + d) * DEG; const rr = (rProt - 0.62) * u;
            return <text key={d} x={c[0] + rr * Math.cos(a)} y={c[1] - rr * Math.sin(a) + 3.5} textAnchor="middle" fontSize={9} fill="#1E40AF" style={tx}>{Math.abs(d)}</text>;
          })}
        </g>
      )}
      {/* le cercle du compas (l'élève l'a ouvert) */}
      {lab.radius != null && <circle cx={c[0]} cy={c[1]} r={lab.radius * u} fill="none" stroke="#DB2777" strokeWidth={1.8} strokeDasharray="6 4" data-rd-circle />}
      {/* la règle : la demi-droite depuis O */}
      {P && lab.ray != null && <line x1={c[0]} y1={c[1]} x2={rex} y2={rey} stroke="#D97706" strokeWidth={2} data-rd-ray />}
      {P && <line x1={c[0]} y1={c[1]} x2={geo.toPx(L.polar(L.BOX.plane * 1.5, bearingP))[0]} y2={geo.toPx(L.polar(L.BOX.plane * 1.5, bearingP))[1]} stroke="#94A3B8" strokeWidth={1} strokeDasharray="3 5" />}
      {/* les figures de la mission : la قطعة [AB], la دائرة (W, WA) */}
      {ms.id === 'segment' && (() => { const [a, b] = ms.order.map((n) => geo.toPx(pts[n])); return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#0F172A" strokeWidth={2.4} />; })()}
      {ms.id === 'circle' && (() => { const [w] = ms.order; return <circle cx={geo.toPx(pts[w])[0]} cy={geo.toPx(pts[w])[1]} r={Math.hypot(pts[ms.order[1]].x - pts[w].x, pts[ms.order[1]].y - pts[w].y) * u} fill="none" stroke="#0F172A" strokeWidth={2} />; })()}
      {/* les images obtenues, puis la قطعة / la دائرة image */}
      {ms.id === 'segment' && L.missionDone(lab) && (() => { const [a, b] = ms.order.map((n) => geo.toPx(im[n])); return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#059669" strokeWidth={2.8} data-rd-image-figure="segment" />; })()}
      {ms.id === 'circle' && L.missionDone(lab) && (() => { const [w, a] = ms.order; return <circle cx={geo.toPx(im[w])[0]} cy={geo.toPx(im[w])[1]} r={Math.hypot(im[a].x - im[w].x, im[a].y - im[w].y) * u} fill="none" stroke="#059669" strokeWidth={2.4} data-rd-image-figure="circle" />; })()}
      {ms.order.map((n) => (
        <g key={n}>{dot(pts[n], n === curName ? '#B45309' : '#0F172A')}{label(n, pts[n], n === curName ? '#B45309' : '#0F172A')}</g>
      ))}
      {Object.entries(im).map(([n, p]) => (
        <g key={`i${n}`} data-rd-image={`${n}'`}>{dot(p, '#059669', 4.2)}{label(`${n}'`, p, '#047857')}</g>
      ))}
      {/* O */}
      <circle cx={c[0]} cy={c[1]} r={4.2} fill="#0F172A" />
      <text x={c[0] - 12} y={c[1] + 18} fontSize={14} fontWeight={800} fill="#0F172A" stroke="#FFFBEB" strokeWidth={4} paintOrder="stroke" style={tx}>O</text>
      {/* le compas : la pointe en O, le crayon à la poignée */}
      {P && (
        <g data-rd-compass>
          <line x1={c[0]} y1={c[1]} x2={hinge[0]} y2={hinge[1]} stroke="#475569" strokeWidth={3} strokeLinecap="round" />
          <line x1={hinge[0]} y1={hinge[1]} x2={pcx} y2={pcy} stroke="#64748B" strokeWidth={3} strokeLinecap="round" />
          <circle cx={hinge[0]} cy={hinge[1]} r={4.5} fill="#334155" />
          <circle cx={pcx} cy={pcy} r={9} fill="#FBCFE8" stroke="#DB2777" strokeWidth={2} />
          <circle cx={pcx} cy={pcy} r={2.6} fill="#DB2777" />
        </g>
      )}
      {/* la poignée de la règle (sur le bord de la منقلة) et sa lecture */}
      {P && (
        <g data-rd-ray-knob>
          <circle cx={rhx} cy={rhy} r={9} fill="#FEF3C7" stroke="#D97706" strokeWidth={2} />
          {lab.ray != null && <text x={rhx} y={rhy - 13} textAnchor="middle" fontSize={11.5} fontWeight={800} fill="#B45309" style={tx}>{`${Math.abs(lab.ray)}°`}</text>}
        </g>
      )}
      {/* l'image tenue : arc fléché et mesure ; le repère P′ */}
      {showMarker && P && live?.measured != null && <AngleMark geo={geo} P={P} Q={imagePos} color={markColor} data={hold?.id === 'image' ? 'held' : 'refused'} />}
      {P && (() => {
        const [x, y] = geo.toPx(imagePos);
        return (
          <g className={lastHere && !lastHere.ok && !hold ? 'rd-shake' : undefined} key={`m${shake}`} data-rd-marker={atTray ? 'tray' : 'placed'}>
            <circle cx={x} cy={y} r={10} fill={atTray ? '#E0F2FE' : 'none'} stroke={markColor} strokeWidth={2.6} strokeDasharray={atTray ? '4 3' : undefined} />
            <circle cx={x} cy={y} r={3} fill={markColor} />
            <text x={x - 14} y={y - 13} textAnchor="middle" fontSize={13} fontWeight={800} fill={markColor} style={tx}>{PRIME(`${curName}'`)}</text>
            {hold?.id === 'image' && hold.cursor?.snapped && <circle cx={x} cy={y} r={15} fill="none" stroke="#0EA5E9" strokeWidth={1.4} opacity={0.6} />}
          </g>
        );
      })()}
      <style>{'.rd-shake{animation:rd-shake .35s ease-in-out 1}@keyframes rd-shake{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}@media (prefers-reduced-motion: reduce){.rd-shake{animation:none}}'}</style>
      <Ride geo={geo} ride={ride} reduce={reduce} color="#059669" />
    </svg>
  );
}

/** La cabine des tickets : son bouton change la couleur des lampes de la roue. Décor seulement. */
function TicketDeco({ lights, onTap }) {
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" data-deco="tickets" onClick={onTap}
      className="ms-auto inline-flex h-8 w-14 shrink-0 items-center justify-center gap-1 rounded-full bg-indigo-950 focus:outline-none">
      {LIGHTS.map(([cc], i) => <span key={cc} className="h-2.5 w-2.5 rounded-full" style={{ background: cc, opacity: i === lights % LIGHTS.length ? 1 : 0.35 }} />)}
    </button>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/**
 * La suite de questions de l'étape `i` (la tâche ou la mission finie). Roue : la 1re tâche lit l'angle et la distance ; sa jumelle (même
 * angle, sens contraire) compare les places ; une tâche de plusieurs pas compte les pas ; la dernière finit par la règle. Feuille : le point
 * (compas · angle), la قطعة (longueur · parallélisme), la دائرة (rayon · centre · règle).
 */
export function chainOf(lab, i) {
  if (lab.scene === 'wheel') {
    const tk = lab.tasks[i];
    const twin = L.twinOf(lab, tk);
    const last = i === lab.tasks.length - 1;
    const twinFirst = twin && lab.tasks.indexOf(twin) < i;
    if (last) return twin && twinFirst ? ['twin', 'rule'] : ['angle', 'rule'];
    if (twinFirst) return ['angle', 'twin'];
    return tk.steps > 1 ? ['steps', 'angle'] : ['angle', 'dist'];
  }
  const ms = lab.missions[i];
  const last = i === lab.missions.length - 1;
  const base = ms.id === 'segment' ? ['length', 'parallel'] : ms.id === 'circle' ? ['radius', 'center'] : ['compass', 'angle'];
  return last ? [...base, 'rule'] : base;
}

const $ = (x) => `$${x}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const ang = (a) => `\\widehat{ ${a}O${a}' }`;

/** Chaque question est construite sur LES nombres de l'élève (rien n'est écrit en dur) ; `k` : les textes de `rotationDial`. */
export const QUESTIONS = {
  angle: ({ lab, step, wheel }, k) => {
    const ms = wheel ? null : lab.missions.find((x) => x.id === step.id);
    const tk = wheel ? lab.tasks.find((x) => x.id === step.id) : null;
    const from = wheel ? tk.from : ms.order[0];
    const alpha = wheel ? tk.alpha : ms.alpha;
    const o = { from, A: $(from), AOA: $(ang(from)), alpha };
    return {
      id: 'angle', kind: 'number', expected: String(alpha), answer: <MathText>{$(`${alpha}^{\\circ}`)}</MathText>,
      prompt: Cq(k, wheel ? 'wheel.angle.prompt' : 'plane.angle.prompt', o),
      hints: [Cq(k, 'angle.hint1', o), Cq(k, 'angle.hint2', o)], explain: Cq(k, 'angle.explain', o),
    };
  },
  dist: ({ lab, step }, k) => {
    const tk = lab.tasks.find((x) => x.id === step.id);
    const r = L.fmt(lab.r, 1);
    const o = { from: tk.from, r: $(r), OA: $(`O${tk.from}`), OB: $(`O${tk.from}'`) };
    return {
      id: 'dist', kind: 'choice', cols: 1, prompt: Cq(k, 'dist.prompt', o),
      options: [
        { text: Cq(k, 'dist.bigger', o), why: Cq(k, 'dist.whyBigger', o) },
        { text: Cq(k, 'dist.same', o), correct: true },
        { text: Cq(k, 'dist.smaller', o), why: Cq(k, 'dist.whySmaller', o) },
      ],
      hints: [Cq(k, 'dist.hint1', o), Cq(k, 'dist.hint2', o)], explain: Cq(k, 'dist.explain', o),
    };
  },
  twin: ({ lab, step }, k) => {
    const tk = lab.tasks.find((x) => x.id === step.id);
    const tw = L.twinOf(lab, tk);
    const here = L.accepted(lab, tk.id)?.landsOn ?? '';
    const there = tw ? (L.accepted(lab, tw.id)?.landsOn ?? '') : '';
    const o = { from: tk.from, alpha: tk.alpha, here, there, sense: k(`sense_${tk.direction}`), senseTwin: k(`sense_${tk.direction === 'direct' ? 'indirect' : 'direct'}`) };
    return {
      id: 'twin', kind: 'choice', cols: 1, prompt: Cq(k, 'twin.prompt', o),
      options: [
        { text: Cq(k, 'twin.same', o), why: Cq(k, 'twin.whySame', o) },
        { text: Cq(k, 'twin.other', o), correct: true },
        { text: Cq(k, 'twin.angle', o), why: Cq(k, 'twin.whyAngle', o) },
      ],
      hints: [Cq(k, 'twin.hint1', o), Cq(k, 'twin.hint2', o)], explain: Cq(k, 'twin.explain', o),
    };
  },
  steps: ({ lab, step }, k) => {
    const tk = lab.tasks.find((x) => x.id === step.id);
    const o = { from: tk.from, alpha: tk.alpha, unit: lab.step, n: tk.steps, calc: $(`${tk.alpha} \\div ${lab.step} = ${tk.steps}`) };
    return {
      id: 'steps', kind: 'number', expected: String(tk.steps), answer: <MathText>{$(tk.steps)}</MathText>,
      prompt: Cq(k, 'steps.prompt', o), hints: [Cq(k, 'steps.hint1', o), Cq(k, 'steps.hint2', o)], explain: Cq(k, 'steps.explain', o),
    };
  },
  compass: ({ lab, step }, k) => {
    const ms = lab.missions.find((x) => x.id === step.id);
    const a = ms.order[0];
    const o = { A: $(a), alpha: ms.alpha, OA: $(`O${a}`), OB: $(`O${a}'`) };
    return {
      id: 'compass', kind: 'choice', cols: 1, prompt: Cq(k, 'compass.prompt', o),
      options: [
        { text: Cq(k, 'compass.alpha', o), why: Cq(k, 'compass.whyAlpha', o) },
        { text: Cq(k, 'compass.same', o), correct: true },
        { text: Cq(k, 'compass.measure', o), why: Cq(k, 'compass.whyMeasure', o) },
      ],
      hints: [Cq(k, 'compass.hint1', o), Cq(k, 'compass.hint2', o)], explain: Cq(k, 'compass.explain', o),
    };
  },
  length: ({ lab, step }, k) => {
    const i = lab.missions.findIndex((x) => x.id === step.id);
    const out = L.outcome(lab, i);
    const o = { a: out.a, b: out.b, before: $(L.fmt(out.before).replace(',', '{,}')), after: $(L.fmt(out.after).replace(',', '{,}')), alpha: lab.missions[i].alpha };
    return {
      id: 'length', kind: 'number', expected: L.fmt(out.after), answer: <MathText>{o.after}</MathText>,
      prompt: Cq(k, 'length.prompt', o), hints: [Cq(k, 'length.hint1', o), Cq(k, 'length.hint2', o)], explain: Cq(k, 'length.explain', o),
    };
  },
  parallel: ({ lab, step }, k) => {
    const ms = lab.missions.find((x) => x.id === step.id);
    const [a, b] = ms.order;
    const o = { a, b, alpha: ms.alpha };
    return {
      id: 'parallel', kind: 'choice', cols: 1, prompt: Cq(k, 'parallel.prompt', o),
      options: [
        { text: Cq(k, 'parallel.yes', o), why: Cq(k, 'parallel.whyYes', o) },
        { text: Cq(k, 'parallel.no', o), correct: true },
        { text: Cq(k, 'parallel.longer', o), why: Cq(k, 'parallel.whyLonger', o) },
      ],
      hints: [Cq(k, 'parallel.hint1', o), Cq(k, 'parallel.hint2', o)], explain: Cq(k, 'parallel.explain', o),
    };
  },
  radius: ({ lab, step }, k) => {
    const i = lab.missions.findIndex((x) => x.id === step.id);
    const out = L.outcome(lab, i);
    const o = { before: $(L.fmt(out.before).replace(',', '{,}')), after: $(L.fmt(out.after).replace(',', '{,}')), W: out.a };
    return {
      id: 'radius', kind: 'number', expected: L.fmt(out.after), answer: <MathText>{o.after}</MathText>,
      prompt: Cq(k, 'radius.prompt', o), hints: [Cq(k, 'radius.hint1', o), Cq(k, 'radius.hint2', o)], explain: Cq(k, 'radius.explain', o),
    };
  },
  center: ({ lab, step }, k) => {
    const ms = lab.missions.find((x) => x.id === step.id);
    const w = ms.order[0];
    const o = { W: $(w), Wp: $(`${w}'`) };
    return {
      id: 'center', kind: 'choice', cols: 1, prompt: Cq(k, 'center.prompt', o),
      options: [
        { text: Cq(k, 'center.same', o), why: Cq(k, 'center.whySame', o) },
        { text: Cq(k, 'center.image', o), correct: true },
        { text: Cq(k, 'center.o', o), why: Cq(k, 'center.whyO', o) },
      ],
      hints: [Cq(k, 'center.hint1', o), Cq(k, 'center.hint2', o)], explain: Cq(k, 'center.explain', o),
    };
  },
  rule: ({ options, formal, wheel }, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k(wheel ? 'dPromptWheel' : 'dPromptPlane')}</MathText>, options,
    hints: [Cq(k, wheel ? 'wheel.rule.hint1' : 'plane.rule.hint1'), Cq(k, wheel ? 'wheel.rule.hint2' : 'plane.rule.hint2')], explain: formal,
  }),
};
