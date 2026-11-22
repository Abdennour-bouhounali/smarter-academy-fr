import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus, ChevronUp, ChevronDown, Camera } from 'lucide-react';
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import MovablePanel from '../primitives/MovablePanel';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import MathText from '../../components/MathText';
import * as L from '../logic/clinometer';

/**
 * clinometer — LE CLINOMÈTRE DU TÉLÉPHONE (unité 10 « حساب المثلثات في المثلث القائم », درس 4 « حل مشكلات وترييض
 * وضعيات بتوظيف النسب المثلثية » ; réutilisé par « أدمج تعلّماتي » en mode `align`).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève TIENT une grandeur de la situation réelle : la distance au pied du projecteur et l'inclinaison du
 *    téléphone qui vise son sommet (`height`), la longueur d'une échelle télescopique posée à 59° (`ladder`), sa
 *    place derrière un poteau jusqu'à ce que le sommet du poteau cache celui de مقام الشهيد (`align`). Puis il
 *    CHOISIT le rapport (cos / sin / tan) et l'opération (× / ÷) qui lient le connu et le cherché.
 * B. Idée : une situation réelle se TRADUIT en triangle rectangle ; on nomme les côtés RELATIVEMENT à l'angle
 *    (connu, cherché), on choisit le rapport qui les contient tous deux (`trigonometry.lengthPlan`), on résout,
 *    on arrondit à la fin seulement, on interprète.
 * C. Le rayon de visée tourne avec le téléphone ; le triangle apparaît sur la scène au moment de la visée juste ;
 *    l'échelle s'allonge et son sommet monte le long du mur ; l'œil glisse et le rayon qui passe par le sommet du
 *    poteau balaie le monument.
 * D. La lecture écrit l'angle lu par l'appli, le triangle aux côtés nommés, l'égalité choisie
 *    (tan α = h ÷ d, sin 59° = 1,6 ÷ L, tan x = 2,3 ÷ 2,45) et le résultat arrondi, plus la séquence de touches.
 * E. Avant la règle : un contraste vécu — deux distances, deux angles, une même hauteur (`height`) ; une échelle
 *    trop courte puis trop longue, encadrée à la main avant le calcul (`ladder`) ; une place ratée puis
 *    l'alignement (`align`).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        modéliser une situation par un triangle rectangle et choisir le rapport trigonométrique qui lie le
 *                  connu et l'inconnu (longueur ou angle)
 *   OBJECT         un téléphone avec son appli clinomètre (viseur, angle) ; un projecteur de stade, une échelle de
 *                  graffeurs, un poteau électrique devant مقام الشهيد
 *   VARIABLE       d (pas de 1 m) et α (pas de 1°) ; L (pas de 0,1 m) ; d derrière le poteau (pas de 0,05 m)
 *   INVARIANT      la hauteur du projecteur (24 m) quelle que soit la distance ; l'angle de l'échelle (59°) ; le
 *                  rapport h ÷ d = tan α du même triangle
 *   TRANSFORMATION l'angle d'élévation change avec la distance ; le sommet de l'échelle monte avec L ; le rayon
 *                  par le sommet du poteau monte ou descend sur le monument
 *   CONSTRAINT     le déclencheur n'accepte que la visée juste au degré ; le plan ne s'ouvre qu'après le geste (visée,
 *                  encadrement, alignement)
 *   RESISTANCE     une visée fausse est refusée avec l'écart écrit en degrés ; un rapport faux est refusé en disant
 *                  le côté qu'il demanderait (« sin a besoin du وتر, la ligne de visée, que tu ne connais pas ») ;
 *                  l'opération fausse est refusée avec la valeur qu'elle donnerait (10 ÷ tan 67° ≈ 4,2 m ;
 *                  1,6 × sin 59° ≈ 1,37 m : plus court que le mur) ; aucune longueur au dixième ne pose
 *                  l'échelle exactement sur 1,60 m
 *   EVIDENCE       le réticule vert, le triangle dessiné, les hauteurs calculées d'essai en essai, l'encadrement
 *                  1,8 < L < 1,9 contre 1,87, les deux rayons confondus
 *   CONTRAST       deux distances au moins 5 m l'une de l'autre ; dessous / dessus de la marque ; trop près / trop loin
 *   PREDICTION     « la hauteur changera-t-elle si je recule ? » ; « l'échelle mesure-t-elle 1,6 m ? »
 *   DISCOVERY      « le même projecteur donne la même hauteur de partout ; les petits écarts viennent de l'angle
 *                  arrondi au degré » ; « le وتر se calcule en DIVISANT par sin » ; « l'alignement fait deux triangles
 *                  en situation de Thalès »
 *   FORMALIZATION  h = d × tan α ; L = 1,6 ÷ sin 59° ≈ 1,9 m ; H ÷ 2,3 = 98,1 ÷ 2,45 et tan x = 2,3 ÷ 2,45, x ≈ 43°
 *   TRANSFER       ex-29 (le palmier : 10 tan 36°), ex-26/27 (arrondir à la fin), la وضعية de la synthèse
 *
 * Mondes (`theme`) : `floodlight` (le stade de nuit), `mural` (le mur des graffeurs, le تحدّ), `maqam` (مقام الشهيد,
 * la synthèse). Manuel (§6bis) : chaque visée, chaque longueur, chaque place est un essai jugé ; aucune
 * auto-complétion. Aucune arithmétique ici : tout vient de logic/clinometer.js, donc de trigonometry.js / thales.js.
 *
 * DÉCOR (exigence du propriétaire, Gen-Alpha) : les lampes des téléphones dans la tribune, un ballon qu'on frappe
 * (stade) ; une bombe de peinture qui souffle (mur) ; une mouette qui s'envole (مقام). `aria-hidden`, hors clavier,
 * `[data-deco]`, jamais une information, immobile sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (§8bis) : la scène est budgétée sur l'écran de leçon (`useLessonViewport` moins ce que le bloc
 * mesuré `[data-cl-glance]` occupe en plus du dessin) ; les poignées sont SUR le dessin (téléphone sur le sol, rayon
 * de visée dans le ciel, sommet de l'échelle sur le mur, l'observateur sur le zoom) ; le téléphone flotte sur la scène
 * dans un `MovablePanel` (l'élève l'écarte s'il cache le sommet) ; −/+, rapports et opérations juste dessous ; la liste
 * des essais dans un `LabFold` SOUS le bloc mesuré.
 *
 * PROPS (contrat FIXE, la synthèse l'emploie) : `mode` 'height' | 'ladder' | 'align', `height`, `angle`, `minDistance`,
 * `maxDistance`, `eye`, `pole`, `poleAt`, `total` — à plat comme dans levels.js, ou groupés dans `numbers` ;
 * `theme`, `title`, `lead`, `mission`, `level`, `levels`, `onTrial(evidence)` à chaque essai / choix,
 * `onFinished({ … })` à la règle (height : { h, heights } ; ladder : { L } ; align : { H, x }) — tous par
 * `state.report`.
 *
 * CONTRAT DOM : [data-clinometer][data-mode][data-world][data-stage=hand|plan|op|done][data-aimed][data-solved],
 * [data-cl-glance], [data-cl-hand] (role=slider : d, L ou la place de l'observateur), [data-cl-hand-less|more],
 * [data-cl-tilt] (role=slider), [data-cl-tilt-less|more], [data-cl-shutter], [data-cl-phone], [data-cl-ratio=<r>],
 * [data-cl-op=mul|div], [data-cl-verdict=<kind>], [data-cl-result], [data-lab-fold=clinometer.trials], [data-deco].
 */
const num = (p) => Number(p.n) / Number(p.d);
const NUMBER_KEYS = ['mode', 'height', 'angle', 'minDistance', 'maxDistance', 'eye', 'pole', 'poleAt', 'total'];

export default function Clinometer(props) {
  const { numbers: grouped, theme: theme0, title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true,
    initialMode = 'student', allowModeSwitch = false, onTrial, onFinished } = props;
  const authored = useMemo(() => {
    const out = {};
    for (const key of NUMBER_KEYS) {
      const v = grouped?.[key] ?? props[key];
      if (v != null) out[key] = v;
    }
    if (!out.mode) out.mode = 'height';
    return out;
  }, [grouped, props]); // eslint-disable-line react-hooks/exhaustive-deps
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.clinometer.${key}`, o), [t]);
  const state = useManipulation({ type: 'clinometer', initialNumbers: authored, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const mode = L.MODES.includes(nums.mode) ? nums.mode : 'height';
  const theme = theme0 ?? (mode === 'ladder' ? 'mural' : mode === 'align' ? 'maqam' : 'floodlight');
  const m = useCallback((key, o) => k(`${mode}.${key}`, o), [k, mode]);
  const numKey = NUMBER_KEYS.map((x) => String(nums[x] ?? '')).join('|');
  const make = () => L.init(nums);
  const [lab, setLab] = useState(make);
  const sceneKey = `${numKey}|${state.epoch}`;
  const [scene, setScene] = useState(sceneKey);
  const [liveI, setLiveI] = useState(null);
  const [liveA, setLiveA] = useState(null);
  const [inits, setInits] = useState(0);
  const [doneIds, setDoneIds] = useState({});
  if (scene !== sceneKey) {
    // « إعادة », un autre niveau ou d'autres nombres : TOUT recommence — les essais, les étapes faites et les questions du labo
    setScene(sceneKey); setLab(make()); setLiveI(null); setLiveA(null); setInits(inits + 1); setDoneIds({});
  }
  const cpSettings = useLabCheckpointSettings('clinometer');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const ruleByCp = cpOn && cpSettings.enabled;

  const ready = L.discoveryReady(lab);
  useEffect(() => { if (ready && !ruleByCp) state.discover(); }, [ready, ruleByCp, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!state.isFormal) return;
    const res = L.result(lab);
    const payload = mode === 'height' ? { h: res?.h10, heights: L.measures(lab).map((x) => L.r1(x.h)) }
      : mode === 'ladder' ? { L: res?.L10 } : { H: res?.H100, x: res?.x };
    state.report(onFinished, payload);
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  // Miroir synchrone de `lab` : « جرّب كل الإمكانيات » enchaîne des pas plus vite qu'un rendu.
  const labRef = useRef(lab);
  labRef.current = lab;
  const nEvents = L.eventCount(lab);
  useEffect(() => { if (nEvents > 0) { const e = L.evidenceOf(lab); if (e) state.report(onTrial, e); } }, [nEvents]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : largeur ; hauteur = écran de leçon − ce que le bloc glance prend en plus des dessins ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const sceneRef = useRef(null);
  const svgHRef = useRef(260);
  const [width, setWidth] = useState(320);
  const [overhead, setOverhead] = useState(200);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(160, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(130, Math.ceil(glanceRef.current.getBoundingClientRect().height) - svgHRef.current));
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
  const narrow = width < 380;
  const budget = Math.round(Math.max(170, Math.min(400, screenH - overhead - 24)));
  const zoomBudget = mode === 'align' ? Math.max(104, Math.round(budget * 0.42)) : 0;
  const G = L.layout(lab, { width, height: budget - zoomBudget, bottom: mode === 'align' ? 18 : 34 });
  const Z = mode === 'align' ? L.zoomLayout(lab, { width, height: zoomBudget }) : null;
  const svgW = Math.min(width, G.width);
  const svgH = G.height;
  svgHRef.current = svgH + (Z ? Z.height : 0);

  /* ── les gestes (moteur « étirer ») ── */
  const I = liveI ?? lab.i;
  const A = liveA ?? lab.a;
  const stepM = mode === 'height' ? 1 : Number(lab.step.n) / Number(lab.step.d);
  const toMeters = useCallback((cx, rect, g, w) => ((cx - rect.left) * (w / rect.width) - g.x0) / g.k, []);
  const sinT = mode === 'ladder' ? TR.sinDeg(lab.theta) : 1;
  const handSt = useStretchInteraction({
    value: I, range: { min: lab.iMin, max: lab.iMax }, direction: 'ltr', pageStep: mode === 'align' ? 5 : 3,
    toValue: (cx, cy, rect) => {
      if (mode === 'height') return toMeters(cx, rect, G, svgW);
      if (mode === 'ladder') {
        const yM = (G.yGround - (cy - rect.top) * (svgH / rect.height)) / G.k;
        return yM / sinT / stepM;
      }
      return (toMeters(cx, rect, Z, Z.width) - 0) / stepM;
    },
    onChange: (v) => setLiveI(v),
    onCommit: (v) => { setLiveI(null); setLab((s) => L.moveTo(s, v)); },
  });
  const phoneX = mode === 'height' ? G.X(I) : 0;
  const phoneY = mode === 'height' ? G.Y(Number(lab.eye.n) / Number(lab.eye.d)) : 0;
  const tiltSt = useStretchInteraction({
    value: mode === 'height' ? A : 0, range: { min: lab.aMin ?? 0, max: lab.aMax ?? 1 }, direction: 'rtl', pageStep: 5,
    toValue: (cx, cy, rect) => {
      const x = (cx - rect.left) * (svgW / rect.width);
      const y = (cy - rect.top) * (svgH / rect.height);
      return (Math.atan2(phoneY - y, phoneX - x) * 180) / Math.PI;
    },
    onChange: (v) => setLiveA(v),
    onCommit: (v) => { setLiveA(null); setLab((s) => L.tiltTo(s, v)); },
  });
  const shoot = () => { handSt.flush(); tiltSt.flush(); setLab((s) => L.shoot(s)); };

  /* ── la lecture ── */
  const planOpen = L.planOpen(lab);
  const done = L.planDone(lab);
  const stage = done ? 'done' : planOpen ? (lab.ratio ? 'op' : 'plan') : 'hand';
  const res = L.result(lab);
  const last = lab.last;
  const aimedNow = mode === 'height' && L.aimed(lab, I, A);
  const value = L.valueAt(lab, I);
  const showTriangle = (mode === 'height' && (aimedNow || lab.pending || (done && L.aimed(lab, I, A))))
    || (mode === 'ladder') || (mode === 'align' && L.alignKind(lab, I) === 'aligned');
  const reading = mode === 'height' ? (lab.pending ?? (done ? L.measures(lab).at(-1) : null)) : null;
  const angleTex = mode === 'height' ? `${reading?.a ?? A}^{\\circ}` : mode === 'ladder' ? `${L.texOf(String(lab.theta))}^{\\circ}` : 'x';
  const dTex = mode === 'height' ? L.tex(L.valueAt(lab, reading?.i ?? I)) : '';

  const sideName = (side) => m(`side.${side}`);
  const verdictKind = (() => {
    if (liveI != null) return 'live';
    if (!last) return 'start';
    return last.kind;
  })();
  const verdict = (() => {
    switch (verdictKind) {
      case 'live':
        if (mode === 'height') return <span className="text-slate-700"><MathText>{m('vLive', { d: L.tex(value) })}</MathText></span>;
        if (mode === 'ladder') return <span className="text-slate-700"><MathText>{m('vLive', { L: L.tex(value), top: L.texOf(L.r2(L.topAt(lab, I))) })}</MathText></span>;
        return <span className="text-slate-700"><MathText>{m('vLive', { d: L.tex(value) })}</MathText></span>;
      case 'move': case 'tilt':
        return <span className="text-slate-700"><MathText>{m(aimedNow ? 'vAimReady' : 'vAiming', { a: A, d: L.tex(value) })}</MathText></span>;
      case 'miss':
        return <span className="text-rose-800"><MathText>{m(last.gap > 0 ? 'vMissLow' : 'vMissHigh', { gap: L.texOf(L.r1(Math.abs(last.gap))) })}</MathText></span>;
      case 'aimed':
        return <span className="text-emerald-800"><MathText>{m('vAimed', { a: reading?.a, d: dTex })}</MathText></span>;
      case 'ladder': {
        const b = L.bracket(lab);
        if (b && !lab.ratio) return <span className="text-emerald-800"><MathText>{m('vBracket', { lo: L.tex(L.valueAt(lab, b.lo)), hi: L.tex(L.valueAt(lab, b.hi)) })}</MathText></span>;
        return <span className={last.what === 'exact' ? 'text-emerald-800' : 'text-rose-800'}><MathText>{m(`v_${last.what}`, { L: L.tex(L.valueAt(lab, last.i)), top: L.texOf(L.r2(last.top)), hm: L.tex(lab.hm) })}</MathText></span>;
      }
      case 'align':
        return <span className={last.what === 'aligned' ? 'text-emerald-800' : 'text-rose-800'}><MathText>{m(`v_${last.what}`, { d: L.tex(L.valueAt(lab, last.i)) })}</MathText></span>;
      case 'refuseRatio':
        return (
          <span className="text-rose-800">
            <MathText>{`${k(`ratioSides.${last.ratio}`, { angle: angleTex, num: sideName(TR.RATIO_SIDES[last.ratio].num), den: sideName(TR.RATIO_SIDES[last.ratio].den) })} ${last.needs ? m('needs', { side: sideName(last.needs) }) : ''} ${last.lacks ? m('lacks', { side: sideName(last.lacks) }) : ''}`}</MathText>
          </span>
        );
      case 'ratio':
        if (mode === 'align') return <span className="text-emerald-800"><MathText>{m('vAngle', { P: L.tex(lab.P), d: L.tex(L.valueAt(lab, lab.iStar)), x: res?.x })}</MathText></span>;
        return <span className="text-emerald-800"><MathText>{m('vRatio', { a: angleTex, d: dTex, hm: mode === 'ladder' ? L.tex(lab.hm) : '' })}</MathText></span>;
      case 'refuseOp':
        return <span className="text-rose-800"><MathText>{m('vRefuseOp', { v: L.texOf(L.r2(last.value)), a: angleTex, d: dTex, hm: mode === 'ladder' ? L.tex(lab.hm) : '' })}</MathText></span>;
      case 'measure': {
        const t0 = L.measures(lab).at(-1);
        return <span className="text-emerald-800"><MathText>{m('vMeasure', { d: L.tex(t0.d), a: t0.a, h: L.texOf(L.r1(t0.h)) })}</MathText></span>;
      }
      case 'ladderResult': {
        const b = L.bracket(lab);
        return <span className="text-emerald-800"><MathText>{m('vResult', { hm: L.tex(lab.hm), a: lab.theta, L100: L.texOf(res.L100), L10: L.texOf(res.L10), lo: L.tex(L.valueAt(lab, b.lo)), hi: L.tex(L.valueAt(lab, b.hi)) })}</MathText></span>;
      }
      default:
        return <span className="text-slate-600"><MathText>{m('vStart', { hm: mode === 'ladder' ? L.tex(lab.hm) : '' })}</MathText></span>;
    }
  })();

  /* ── la découverte : des distracteurs réfutés par les essais de l'élève ── */
  const discoveryOptions = useMemo(() => {
    if (mode === 'height') {
      const ms = L.measures(lab);
      const lo = ms.reduce((a, b) => (b.d.n / b.d.d < a.d.n / a.d.d ? b : a), ms[0] ?? null);
      const hi = ms.reduce((a, b) => (b.d.n / b.d.d > a.d.n / a.d.d ? b : a), ms[0] ?? null);
      const o = lo && hi ? { d1: L.tex(lo.d), h1: L.texOf(L.r1(lo.h)), a1: lo.a, d2: L.tex(hi.d), h2: L.texOf(L.r1(hi.h)), a2: hi.a } : {};
      return [
        { text: <MathText>{m('dOptGrow')}</MathText>, why: <MathText>{m('dWhyGrow', o)}</MathText> },
        { text: <MathText>{m('dOptRight')}</MathText>, correct: true },
        { text: <MathText>{m('dOptSameAngle')}</MathText>, why: <MathText>{m('dWhySameAngle', o)}</MathText> },
      ];
    }
    if (mode === 'ladder') {
      const o = { hm: L.tex(lab.hm), a: lab.theta, top: L.texOf(L.r2(L.topAt(lab, Math.round(Number(lab.hm.n) / Number(lab.hm.d) * 10)))), wrong: L.texOf(L.r2(L.wrongOpValue(lab))) };
      return [
        { text: <MathText>{m('dOptEqual', o)}</MathText>, why: <MathText>{m('dWhyEqual', o)}</MathText> },
        { text: <MathText>{m('dOptMul', o)}</MathText>, why: <MathText>{m('dWhyMul', o)}</MathText> },
        { text: <MathText>{m('dOptRight', o)}</MathText>, correct: true },
      ];
    }
    const miss = lab.trials.find((x) => x.kind !== 'aligned');
    const o = { P: L.tex(lab.P), d: L.tex(L.valueAt(lab, lab.iStar)), T: sumTex(lab), miss: miss ? L.tex(miss.d) : '' };
    return [
      { text: <MathText>{m('dOptRight', o)}</MathText>, correct: true },
      { text: <MathText>{m('dOptAnywhere', o)}</MathText>, why: <MathText>{m(miss ? 'dWhyAnywhere' : 'dWhyAnywhereNone', o)}</MathText> },
      { text: <MathText>{m('dOptInverse', o)}</MathText>, why: <MathText>{m('dWhyInverse', o)}</MathText> },
    ];
  }, [lab, m, mode]);

  const formal = (
    <div className="space-y-2" data-cl-formal>
      {mode === 'height' && (
        <>
          <EquationDisplay tone="result" tex={'\\tan\\alpha = \\dfrac{h}{d}'} />
          <EquationDisplay tone="result" tex={'h = d \\times \\tan\\alpha'} />
          <p className="text-sm text-emerald-900"><MathText>{m('fRule', { H: L.tex(lab.H) })}</MathText></p>
        </>
      )}
      {mode === 'ladder' && res && (
        <>
          <EquationDisplay tone="result" tex={`\\sin ${lab.theta}^{\\circ} = \\dfrac{${L.tex(lab.hm)}}{L}`} />
          <EquationDisplay tone="result" tex={`L = \\dfrac{${L.tex(lab.hm)}}{\\sin ${lab.theta}^{\\circ}} \\approx ${L.texOf(res.L10)}\\,\\mathrm{m}`} />
          <p className="text-sm text-emerald-900"><MathText>{m('fRule')}</MathText></p>
        </>
      )}
      {mode === 'align' && res && (
        <>
          <EquationDisplay tone="result" tex={`\\dfrac{H}{${L.tex(lab.P)}} = \\dfrac{${sumTex(lab)}}{${L.tex(L.valueAt(lab, lab.iStar))}}`} />
          <EquationDisplay tone="result" tex={`H \\approx ${L.texOf(res.H100)}\\,\\mathrm{m}`} />
          <EquationDisplay tone="result" tex={`\\tan x = \\dfrac{${L.tex(lab.P)}}{${L.tex(L.valueAt(lab, lab.iStar))}} \\Rightarrow x \\approx ${res.x}^{\\circ}`} />
          <p className="text-sm text-emerald-900"><MathText>{m('fRule')}</MathText></p>
        </>
      )}
    </div>
  );

  /* ── les questions pendant le labo (primitives/LabCheckpoint) : deux étapes par mode, la dernière finit par la règle ── */
  const stages = CHAINS[mode];
  const stageIds = Object.keys(stages);
  const curId = ruleByCp ? stageIds.find((sid) => !doneIds[sid]) ?? null : null;
  const curReached = !!curId && !!REACHED[curId](lab);
  const cp = useLabCheckpoint({
    id: curId,
    questions: curReached ? stages[curId].map((qid) => QUESTIONS[qid](lab, k, { options: discoveryOptions, prompt: <MathText>{m('dPrompt')}</MathText>, formal })) : null,
    reached: curReached,
    resetKey: inits,
    onRetry: () => setLab((s) => (['h2', 'l2', 'a2'].includes(curId) ? retryStage(s, curId) : make())),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (sid) => { setDoneIds((d) => ({ ...d, [sid]: true })); if (stages[sid].includes('rule')) { state.discover(); state.formalize(); } },
  });
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (Object.keys(doneIds).length === 0 && celebrated.current.size) celebrated.current = new Set();
  useEffect(() => {
    stageIds.forEach((sid, i) => {
      if (!doneIds[sid] || celebrated.current.has(sid)) return;
      celebrated.current.add(sid);
      party.celebrate({ n: i + 1, total: stageIds.length });
    });
  }, [doneIds]); // eslint-disable-line react-hooks/exhaustive-deps
  const stepper = ruleByCp && (
    <LabStepper count={stageIds.length} current={curId ? stageIds.indexOf(curId) : stageIds.length - 1} done={stageIds.map((sid) => !!doneIds[sid])} stepAttr="data-cl-step" />
  );
  /* ── le son (muet sauf « الصوت ») : un déclic par pas, le drapeau à la visée / l'encadrement / l'alignement juste, « over » au refus ── */
  const sfx = useRef(0);
  useEffect(() => {
    const w = lab.last;
    if (!w) return;
    const now = performance.now();
    if (w.kind === 'move' || w.kind === 'tilt') { if (now - sfx.current > 35) { playSfx('tooth'); sfx.current = now; } return; }
    if (w.kind === 'miss' || w.kind === 'refuseRatio' || w.kind === 'refuseOp') playSfx('over');
    else if (w.kind === 'measure' || w.kind === 'aimed' || w.kind === 'ladderResult') playSfx('flag');
    else if (w.kind === 'ladder') playSfx(w.what === 'exact' || (w.what === 'above' && L.bracket(lab)) ? 'flag' : 'tooth');
    else if (w.kind === 'align') playSfx(w.what === 'aligned' ? 'flag' : 'tooth');
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps

  const btn = 'inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2';
  const valueTex = mode === 'height' ? `d = ${L.tex(value)}\\,\\mathrm{m}` : mode === 'ladder' ? `L = ${L.tex(value)}\\,\\mathrm{m}` : `d = ${L.tex(value)}\\,\\mathrm{m}`;
  const handLabel = m('handLabel');
  const handValueText = mode === 'ladder' ? m('handValueText', { L: L.dec(value), top: L.r2(L.topAt(lab, I)) }) : m('handValueText', { d: L.dec(value) });

  /* ── le plan : le rapport, puis l'opération ── */
  const opTex = (op) => {
    if (mode === 'height') {
      const a = `${reading?.a ?? A}^{\\circ}`;
      return op === 'mul' ? `h = ${dTex} \\times \\tan ${a}` : `h = ${dTex} \\div \\tan ${a}`;
    }
    return op === 'mul' ? `L = ${L.tex(lab.hm)} \\times \\sin ${lab.theta}^{\\circ}` : `L = \\dfrac{${L.tex(lab.hm)}}{\\sin ${lab.theta}^{\\circ}}`;
  };
  const refusedRatios = new Set(lab.refusals.filter((x) => x.kind === 'ratio').map((x) => x.ratio));
  const refusedOps = new Set(lab.refusals.filter((x) => x.kind === 'op').map((x) => x.op));
  const showPlan = planOpen || done;
  const keys = mode === 'height' && reading && done
    ? TR.keysForLength({ length: L.dec(reading.d ?? L.valueAt(lab, reading.i)), op: 'mul', ratio: 'tan', angle: reading.a }).slice(1)
    : mode === 'ladder' && done ? TR.keysForLength({ length: L.dec(lab.hm), op: 'div', ratio: 'sin', angle: lab.theta }).slice(1)
      : mode === 'align' && done ? ['2nd', 'tan⁻¹', '(', L.dec(lab.P), '÷', L.dec(L.valueAt(lab, lab.iStar)), ')', '='] : null;

  const plan = showPlan && (
    <div className="space-y-1.5 rounded-xl border-2 border-indigo-100 bg-indigo-50/60 p-1.5" data-cl-plan={stage}>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <span className={`${narrow ? 'text-xs' : 'text-sm'} font-bold text-indigo-900`}>{m('planAsk')}</span>
        <div className="flex gap-1.5" dir="ltr">
          {TR.RATIOS.map((r) => (
            <button key={r} type="button" disabled={!!lab.ratio || done} onClick={() => setLab((s) => L.chooseRatio(s, r))}
              aria-pressed={lab.ratio === r} aria-label={k(`ratioLabel.${r}`)} data-cl-ratio={r}
              className={`${btn} px-3 font-mono text-base font-black ${lab.ratio === r ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : refusedRatios.has(r) ? 'border-rose-300 text-rose-400 line-through' : 'border-indigo-300 text-indigo-900 focus-visible:ring-indigo-500'}`}>
              <bdi dir="ltr">{r}</bdi>
            </button>
          ))}
        </div>
      </div>
      {mode !== 'align' && lab.ratio && (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span className={`${narrow ? 'text-xs' : 'text-sm'} font-bold text-indigo-900`}>{m('opAsk')}</span>
          {['mul', 'div'].map((op) => (
            <button key={op} type="button" disabled={!!lab.op} onClick={() => setLab((s) => L.chooseOp(s, op))}
              aria-pressed={lab.op === op} aria-label={m(`opLabel.${op}`)} data-cl-op={op}
              className={`${btn} px-2 text-sm ${lab.op === op ? 'border-emerald-500 bg-emerald-50' : refusedOps.has(op) ? 'border-rose-300 opacity-60' : 'border-indigo-300 focus-visible:ring-indigo-500'}`}>
              <MathText>{`$${opTex(op)}$`}</MathText>
            </button>
          ))}
        </div>
      )}
      {done && keys && (
        <p className="flex flex-wrap items-center justify-center gap-1 text-xs text-slate-700" data-cl-result>
          <span>{k('keysLabel')}</span>
          <code dir="ltr" className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] text-emerald-200">{keys.join(' ')}</code>
        </p>
      )}
    </div>
  );

  /* ── le dessin ── */
  const X = G.X; const Y = G.Y; const yG = G.yGround;
  const textP = { style: { direction: 'ltr', unicodeBidi: 'isolate' }, fontFamily: 'ui-monospace, monospace' };
  const arc = (cx, cy, r, deg) => {
    const a = (deg * Math.PI) / 180;
    return `M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx - r * Math.cos(a)} ${cy - r * Math.sin(a)}`;
  };
  const rightMark = (x, y, s = 9) => <path d={`M${x + s} ${y} L${x + s} ${y - s} L${x} ${y - s}`} fill="none" stroke="#0F172A" strokeWidth={1.2} />;

  let sceneSvg = null; let overlays = null; let phoneScreen = null; let zoomSvg = null;
  const TONES = { amber: 'text-amber-800 ring-amber-300', pink: 'text-pink-800 ring-pink-300', emerald: 'text-emerald-800 ring-emerald-300' };
  const roleBadge = (x, y, text, tone, key) => (
    <span key={key} className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white/90 px-1.5 text-[10px] font-bold shadow-sm ring-1 ${TONES[tone]}`} style={{ left: x, top: y }} data-cl-role={key}>
      {text}
    </span>
  );
  const showRoles = state.level === 'beginner' || mode === 'height';

  if (mode === 'height') {
    const H = Number(lab.H.n) / Number(lab.H.d);
    const aRad = (A * Math.PI) / 180;
    const rayLen = Math.hypot(svgW, svgH);
    const rayEnd = [phoneX - rayLen * Math.cos(aRad), phoneY - rayLen * Math.sin(aRad)];
    const tri = showTriangle;
    const mastW = Math.max(10, Math.min(22, G.k * 0.9));
    const headW = Math.max(28, Math.min(64, G.k * 3)); const headH = Math.max(12, Math.min(26, G.k * 1.2));
    sceneSvg = (
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="absolute inset-0" style={{ direction: 'ltr' }}
        role="img" aria-label={m('sceneLabel', { d: L.dec(value), a: A })}>
        <defs>
          <linearGradient id="cl-night" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0F172A" /><stop offset="1" stopColor="#1E3A8A" /></linearGradient>
          <linearGradient id="cl-grass" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#15803D" /><stop offset="1" stopColor="#166534" /></linearGradient>
          <radialGradient id="cl-glow"><stop offset="0" stopColor="#FEF08A" stopOpacity="0.85" /><stop offset="1" stopColor="#FEF08A" stopOpacity="0" /></radialGradient>
        </defs>
        <rect x={0} y={0} width={svgW} height={yG} fill="url(#cl-night)" />
        <StadiumDeco w={svgW} yG={yG} k={G.k} />
        <rect x={0} y={yG} width={svgW} height={svgH - yG} fill="url(#cl-grass)" />
        {/* le mât en treillis et la tête de projecteurs : le SOMMET (Y(H)) est la cible */}
        <g aria-hidden="true" data-cl-mast>
          <polygon points={`${X(0) - mastW * 0.9},${yG} ${X(0) + mastW * 0.9},${yG} ${X(0) + mastW * 1.6},${Y(H) - headH * 0.4} ${X(0) - mastW * 1.6},${Y(H) - headH * 0.4}`} fill="#FDE68A" opacity={0.08} />
          <line x1={X(0) - mastW / 2} y1={yG} x2={X(0) - mastW / 4} y2={Y(H) + headH} stroke="#CBD5E1" strokeWidth={1.6} />
          <line x1={X(0) + mastW / 2} y1={yG} x2={X(0) + mastW / 4} y2={Y(H) + headH} stroke="#CBD5E1" strokeWidth={1.6} />
          {Array.from({ length: 9 }, (_, j) => {
            const y1 = yG - (j * (yG - Y(H) - headH)) / 9; const y2 = yG - ((j + 1) * (yG - Y(H) - headH)) / 9;
            const w1 = mastW / 2 - (mastW / 4) * (j / 9); const w2 = mastW / 2 - (mastW / 4) * ((j + 1) / 9);
            return <line key={j} x1={X(0) + (j % 2 ? w1 : -w1)} y1={y1} x2={X(0) + (j % 2 ? -w2 : w2)} y2={y2} stroke="#94A3B8" strokeWidth={1} />;
          })}
          <circle cx={X(0)} cy={Y(H) + headH / 2} r={headW * 0.9} fill="url(#cl-glow)" />
          <rect x={X(0) - headW / 2} y={Y(H)} width={headW} height={headH} rx={2} fill="#1E293B" stroke="#E2E8F0" strokeWidth={1.2} />
          {Array.from({ length: 8 }, (_, j) => (
            <circle key={j} cx={X(0) - headW / 2 + (headW / 4) * ((j % 4) + 0.5)} cy={Y(H) + (headH / 2) * (Math.floor(j / 4) + 0.5)} r={Math.max(1.6, headH / 5.5)} fill="#FEF9C3" />
          ))}
        </g>
        <circle cx={X(0)} cy={Y(H)} r={3} fill="#F43F5E" />
        <text x={X(0) + headW / 2 + 4} y={Y(H) + 4} fontSize={12} fontWeight="bold" fill="#FDE68A" {...textP}>S</text>
        {/* la graduation du sol (mètres depuis le pied du mât) */}
        <line x1={0} x2={svgW} y1={yG} y2={yG} stroke="#F8FAFC" strokeWidth={2} />
        {Array.from({ length: Math.floor((lab.iMax + 2) / 5) + 1 }, (_, j) => j * 5).map((mm) => (
          <g key={mm}>
            <line x1={X(mm)} x2={X(mm)} y1={yG} y2={yG + 6} stroke="#F8FAFC" />
            {(!narrow || mm % 10 === 0) && <text x={X(mm)} y={yG + 17} textAnchor="middle" fontSize={10} fill="#ECFCCB" {...textP}>{mm}</text>}
          </g>
        ))}
        <text x={X(0) - 6} y={yG - 4} textAnchor="end" fontSize={12} fontWeight="bold" fill="#F8FAFC" {...textP}>B</text>
        {/* le triangle, dès la visée juste */}
        {tri && (
          <g data-cl-triangle>
            <line x1={X(0)} y1={yG} x2={phoneX} y2={yG} stroke="#FDE047" strokeWidth={3} />
            <line x1={X(0)} y1={yG} x2={X(0)} y2={Y(H)} stroke="#F472B6" strokeWidth={3} strokeDasharray="6 4" />
            {rightMark(X(0), yG)}
            <text x={(X(0) + phoneX) / 2} y={yG - 6} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#FEF08A" {...textP}>{`${L.dec(L.valueAt(lab, I))} m`}</text>
            <text x={X(0) + 6} y={(yG + Y(H)) / 2} fontSize={13} fontWeight="bold" fill="#FBCFE8" {...textP}>{done && res ? `h ≈ ${res.h10} m` : 'h = ?'}</text>
          </g>
        )}
        {/* le rayon de visée du téléphone */}
        <line x1={phoneX} y1={phoneY} x2={rayEnd[0]} y2={rayEnd[1]} stroke={aimedNow ? '#4ADE80' : '#F87171'} strokeWidth={aimedNow ? 2.5 : 1.8} strokeDasharray={aimedNow ? undefined : '5 4'} data-cl-ray />
        <path d={arc(phoneX, phoneY, 26, A)} fill="none" stroke="#FDE047" strokeWidth={1.6} />
        <text x={phoneX - 30} y={phoneY - 8} textAnchor="end" fontSize={11} fontWeight="bold" fill="#FDE047" {...textP}>{`${A}°`}</text>
        {/* le téléphone sur son mini-trépied */}
        <g transform={`translate(${phoneX} ${phoneY})`} aria-hidden="true">
          <line x1={0} y1={0} x2={-6} y2={yG - phoneY + 0.01} stroke="#CBD5E1" />
          <line x1={0} y1={0} x2={6} y2={yG - phoneY + 0.01} stroke="#CBD5E1" />
          <g transform={`rotate(${-A})`}><rect x={-2} y={-5} width={18} height={10} rx={2} fill="#0F172A" stroke="#E2E8F0" /><circle cx={14} cy={0} r={2} fill="#38BDF8" /></g>
        </g>
        <text x={phoneX + 6} y={yG - 6} fontSize={12} fontWeight="bold" fill="#F8FAFC" {...textP}>A</text>
      </svg>
    );
    overlays = (
      <>
        {/* la piste de la distance : la bande du sol ; la poignée : le pied du trépied */}
        <div {...handSt.trackProps} className="absolute left-0 right-0" style={{ ...handSt.trackProps.style, top: yG + 2, height: Math.max(32, svgH - yG - 2) }} data-cl-hand-track>
          <div {...handSt.handleProps({ label: handLabel, valueText: handValueText })} data-cl-hand={I}
            className="absolute flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border-2 border-amber-400 bg-white/90 outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
            style={{ left: phoneX, top: 0, cursor: handSt.dragging ? 'grabbing' : 'grab' }}>
            <span aria-hidden="true" className="text-sm font-black text-amber-700">⇆</span>
          </div>
        </div>
        {/* la piste de l'inclinaison : le ciel ; la poignée : le bout du rayon de visée */}
        <div {...tiltSt.trackProps} className="absolute left-0 right-0 top-0" style={{ ...tiltSt.trackProps.style, height: yG - 4 }} data-cl-tilt-track>
          <div {...tiltSt.handleProps({ label: m('tiltLabel'), valueText: m('tiltValueText', { a: A }) })} data-cl-tilt={A}
            className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-sky-300 bg-slate-900/70 outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
            style={{ left: Math.max(22, phoneX - 70 * Math.cos((A * Math.PI) / 180)), top: Math.max(22, phoneY - 70 * Math.sin((A * Math.PI) / 180)), cursor: tiltSt.dragging ? 'grabbing' : 'grab' }}>
            <span aria-hidden="true" className="text-sm font-black text-sky-200">⤾</span>
          </div>
        </div>
        {tri && showRoles && [
          roleBadge((X(0) + phoneX) / 2, yG + 14, k('role.adjacent'), 'amber', 'adj'),
          roleBadge(X(0) + 34, (yG + Y(H)) / 2 + 16, k('role.opposite'), 'pink', 'opp'),
          roleBadge((X(0) + phoneX) / 2 + 14, (yG + Y(H)) / 2 - 10, k('role.hypotenuse'), 'emerald', 'hyp'),
        ]}
      </>
    );
    const gap = L.aimGap(lab, I, A);
    phoneScreen = <Viewfinder kind="height" gap={gap} aimed={aimedNow} angle={A} small={narrow} />;
  } else if (mode === 'ladder') {
    const hm = Number(lab.hm.n) / Number(lab.hm.d);
    const Lm = Number(value.n) / Number(value.d);
    const topM = L.topAt(lab, I);
    const footM = L.footAt(lab, I);
    const kind = L.topKind(lab, I);
    const top = [X(0), Y(topM)]; const foot = [X(footM), yG];
    const rungs = Math.max(4, Math.round(Lm / 0.22));
    const wallW = Math.min(X(0) - 2, 46);
    const rail = Math.max(4, Math.min(9, G.k * 0.12));
    sceneSvg = (
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="absolute inset-0" style={{ direction: 'ltr' }}
        role="img" aria-label={m('sceneLabel', { L: L.dec(value), top: L.r2(topM), hm: L.dec(lab.hm) })}>
        <rect x={0} y={0} width={svgW} height={yG} fill="#E0F2FE" />
        <rect x={0} y={yG} width={svgW} height={svgH - yG} fill="#D6D3D1" />
        <MuralDeco x={X(0) - wallW} w={wallW} yG={yG} sceneW={svgW} footX={X(footM)} />
        {/* la marque du mur : là où la jupe de la fresque doit commencer */}
        <line x1={X(0) - wallW} x2={X(0) + 10} y1={Y(hm)} y2={Y(hm)} stroke="#DB2777" strokeWidth={2.5} />
        <text x={X(0) + 26} y={Y(hm) + (topM < num(lab.hm) ? -5 : 13)} fontSize={12} fontWeight="bold" fill="#9D174D" {...textP} data-cl-mark={L.dec(lab.hm)}>{`${L.dec(lab.hm)} m`}</text>
        {/* l'échelle télescopique */}
        <g data-cl-ladder={L.dec(value)}>
          {[-1, 1].map((o) => {
            const ux = (top[0] - foot[0]) / Lm; const uy = (top[1] - foot[1]) / Lm; const nl = Math.hypot(ux, uy);
            const px = (-uy / nl) * rail * o; const py = (ux / nl) * rail * o;
            return <line key={o} x1={foot[0] + px} y1={foot[1] + py} x2={top[0] + px + 2} y2={top[1] + py} stroke="#92400E" strokeWidth={4} strokeLinecap="round" />;
          })}
          {Array.from({ length: rungs }, (_, j) => {
            const f = (j + 0.6) / (rungs + 0.4);
            const x = foot[0] + (top[0] - foot[0]) * f; const y = foot[1] + (top[1] - foot[1]) * f;
            const ux = (top[0] - foot[0]) / Lm; const uy = (top[1] - foot[1]) / Lm; const nl = Math.hypot(ux, uy);
            const px = (-uy / nl) * rail; const py = (ux / nl) * rail;
            return <line key={j} x1={x - px} y1={y - py} x2={x + px} y2={y + py} stroke="#F59E0B" strokeWidth={2.5} strokeLinecap="round" />;
          })}
        </g>
        {/* le sommet atteint, comparé à la marque */}
        <line x1={top[0]} x2={top[0] + 46} y1={top[1]} y2={top[1]} stroke={kind === 'below' ? '#E11D48' : kind === 'above' ? '#7C3AED' : '#059669'} strokeDasharray="3 3" />
        <text x={top[0] + 26} y={top[1] + (topM > num(lab.hm) ? -5 : 13)} fontSize={11} fontWeight="bold" fill="#334155" {...textP} data-cl-top={L.r2(topM)}>{`↦ ${L.r2(topM)} m`}</text>
        {rightMark(X(0), yG)}
        <path d={arc(foot[0], foot[1], 24, lab.theta)} fill="none" stroke="#0F172A" strokeWidth={1.5} />
        <text x={foot[0] - 28} y={foot[1] - 7} textAnchor="end" fontSize={11} fontWeight="bold" fill="#0F172A" {...textP}>{`${lab.theta}°`}</text>
        <text x={Math.max(X(0) + 30, (X(0) + foot[0]) / 2)} y={yG + 22} textAnchor="middle" fontSize={13} fontWeight="bold" fill="#92400E" {...textP}>{done && res ? `L ≈ ${res.L10} m` : `L = ${L.dec(value)} m`}</text>
        <line x1={0} x2={svgW} y1={yG} y2={yG} stroke="#57534E" strokeWidth={2} />
        {[0, 0.5, 1, 1.5, 2, 2.5].filter((h) => Y(h) > 8).map((h) => (
          <g key={h}><line x1={X(0) - 6} x2={X(0)} y1={Y(h)} y2={Y(h)} stroke="#334155" /><text x={X(0) - wallW - 2} y={Y(h) + 3} textAnchor="end" fontSize={9} fill="#334155" {...textP}>{String(h).replace('.', ',')}</text></g>
        ))}
      </svg>
    );
    overlays = (
      <>
        <div {...handSt.trackProps} className="absolute top-0" style={{ ...handSt.trackProps.style, left: Math.max(0, X(0) - 24), width: 68, height: yG }} data-cl-hand-track>
          <div {...handSt.handleProps({ label: handLabel, valueText: handValueText })} data-cl-hand={I}
            className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-amber-600 bg-white/90 outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
            style={{ left: X(0) - Math.max(0, X(0) - 24) + 4, top: top[1], cursor: handSt.dragging ? 'grabbing' : 'grab' }}>
            <span aria-hidden="true" className="text-sm font-black text-amber-800">⇕</span>
          </div>
        </div>
        {showRoles && [
          roleBadge(X(0) + 34, (Y(hm) + yG) / 2 + 12, k('role.opposite'), 'pink', 'opp'),
          roleBadge((X(0) + foot[0]) / 2 + 30, (top[1] + yG) / 2 + 14, k('role.hypotenuse'), 'emerald', 'hyp'),
          roleBadge((X(0) + foot[0]) / 2, yG + 14, k('role.adjacent'), 'amber', 'adj'),
        ]}
      </>
    );
    phoneScreen = <Viewfinder kind="ladder" angle={lab.theta} small={narrow} />;
  } else {
    const H = Number(lab.H.n) / Number(lab.H.d);
    const P = Number(lab.P.n) / Number(lab.P.d);
    const a = Number(lab.a.n) / Number(lab.a.d);
    const dM = Number(value.n) / Number(value.d);
    const kind = L.alignKind(lab, I);
    const eyeX = X(a + dM);
    const reach = (P * (a + dM)) / dM; // le rayon œil → sommet du poteau, prolongé jusqu'au monument (dessin)
    const ext = Math.min(reach, H * 1.11);
    sceneSvg = (
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="absolute inset-0" style={{ direction: 'ltr' }}
        role="img" aria-label={m('sceneLabel', { d: L.dec(value) })}>
        <defs><linearGradient id="cl-dusk" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FDE68A" /><stop offset="1" stopColor="#FED7AA" /></linearGradient></defs>
        <rect x={0} y={0} width={svgW} height={yG} fill="url(#cl-dusk)" />
        <MaqamDeco w={svgW} yG={yG} />
        <rect x={0} y={yG} width={svgW} height={svgH - yG} fill="#A3A3A3" />
        <Maqam x={X(0)} yG={yG} top={Y(H)} />
        <line x1={X(a)} y1={yG} x2={X(a)} y2={Math.min(Y(P), yG - 7)} stroke="#334155" strokeWidth={2.5} />
        <circle cx={eyeX} cy={yG - 2} r={2.5} fill="#2563EB" aria-hidden="true" />
        {kind === 'aligned' && <polygon points={`${X(0)},${yG} ${X(0)},${Y(H)} ${eyeX},${yG}`} fill="#6366F1" opacity={0.12} />}
        <line x1={eyeX} y1={yG} x2={X(0)} y2={Y(ext)} stroke={kind === 'aligned' ? '#059669' : '#E11D48'} strokeWidth={1.8} strokeDasharray={kind === 'aligned' ? undefined : '5 4'} data-cl-ray />
        <circle cx={X(0)} cy={Y(Math.min(reach, H * 1.11))} r={3} fill={kind === 'aligned' ? '#059669' : '#E11D48'} />
        <line x1={0} x2={svgW} y1={yG} y2={yG} stroke="#525252" strokeWidth={2} />
        {rightMark(X(0), yG)}
        <text x={X(0) - 6} y={yG - 4} textAnchor="end" fontSize={11} fontWeight="bold" fill="#0F172A" {...textP}>M</text>
        <text x={X(a) - 4} y={yG + 14} textAnchor="middle" fontSize={10} fill="#0F172A" {...textP}>{`${L.dec(lab.a)} m`}</text>
        <text x={X(0) + 8} y={Y(H) + 12} fontSize={12} fontWeight="bold" fill="#1E293B" {...textP}>{done && res ? `H ≈ ${res.H100} m` : 'H = ?'}</text>
      </svg>
    );
    const zx = Z.X; const zy = Z.Y; const zG = Z.yGround;
    const monSlope = H / (a + dM); // pente du rayon œil → sommet du monument
    const poleSlope = P / dM;
    const zLeft = zx(0);
    zoomSvg = (
      <div className="relative mx-auto" style={{ width: Z.width, height: Z.height }} data-cl-zoom>
        <svg width={Z.width} height={Z.height} viewBox={`0 0 ${Z.width} ${Z.height}`} className="absolute inset-0" style={{ direction: 'ltr' }}
          role="img" aria-label={m('zoomLabel', { d: L.dec(value), P: L.dec(lab.P) })}>
          <rect x={0} y={0} width={Z.width} height={zG} fill="#FFF7ED" />
          <rect x={0} y={zG} width={Z.width} height={Z.height - zG} fill="#BBF7D0" />
          {/* le poteau électrique (zoom) */}
          <rect x={zx(0) - 3} y={zy(P)} width={6} height={zG - zy(P)} fill="#475569" />
          <line x1={zx(0) - 12} x2={zx(0) + 12} y1={zy(P) + 6} y2={zy(P) + 6} stroke="#475569" strokeWidth={2} />
          <circle cx={zx(0)} cy={zy(P)} r={3.5} fill="#0F172A" />
          {/* les deux rayons depuis l'œil : vers le sommet du poteau, vers le sommet du monument */}
          <line x1={zx(dM)} y1={zG} x2={zLeft - 4} y2={zG - (dM * Z.k + 4) * poleSlope} stroke="#334155" strokeWidth={1.6} />
          <line x1={zx(dM)} y1={zG} x2={zLeft - 4} y2={Math.max(0, zG - (dM * Z.k + 4) * monSlope)} stroke={kind === 'aligned' ? '#059669' : '#D97706'} strokeWidth={2} strokeDasharray={kind === 'aligned' ? undefined : '4 3'} />
          {kind === 'aligned' && <polygon points={`${zx(0)},${zG} ${zx(0)},${zy(P)} ${zx(dM)},${zG}`} fill="#10B981" opacity={0.18} />}
          {rightMark(zx(0), zG, 7)}
          {kind === 'aligned' && <path d={arc(zx(dM), zG, 22, L.poleAngle(lab, I))} fill="none" stroke="#0F172A" strokeWidth={1.4} />}
          <text x={zx(dM) - 26} y={zG - 6} textAnchor="end" fontSize={11} fontWeight="bold" fill="#0F172A" {...textP}>x</text>
          <text x={zx(0) + 8} y={zy(P) + 4} fontSize={11} fontWeight="bold" fill="#334155" {...textP}>{`${L.dec(lab.P)} m`}</text>
          <line x1={0} x2={Z.width} y1={zG} y2={zG} stroke="#166534" strokeWidth={2} />
          {Array.from({ length: Math.floor(Number(L.valueAt(lab, lab.iMax).n) / Number(L.valueAt(lab, lab.iMax).d)) + 1 }, (_, j) => j).map((mm) => (
            <g key={mm}><line x1={zx(mm)} x2={zx(mm)} y1={zG} y2={zG + 5} stroke="#166534" /><text x={zx(mm)} y={zG + 15} textAnchor="middle" fontSize={9} fill="#14532D" {...textP}>{mm}</text></g>
          ))}
          {/* l'observateur allongé, le téléphone au ras du sol */}
          <g transform={`translate(${zx(dM)} ${zG})`} aria-hidden="true">
            <ellipse cx={18} cy={-5} rx={16} ry={4.5} fill="#2563EB" />
            <circle cx={4} cy={-7} r={4.5} fill="#FBBF24" />
            <rect x={-6} y={-6} width={6} height={4} rx={1} fill="#0F172A" />
          </g>
        </svg>
        <div {...handSt.trackProps} className="absolute left-0 right-0" style={{ ...handSt.trackProps.style, top: Math.max(0, zG - 40), height: Z.height - Math.max(0, zG - 40) }} data-cl-hand-track>
          <div {...handSt.handleProps({ label: handLabel, valueText: handValueText })} data-cl-hand={I}
            className="absolute flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border-2 border-blue-600 bg-white/85 outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
            style={{ left: zx(dM) + 14, top: 0, cursor: handSt.dragging ? 'grabbing' : 'grab' }}>
            <span aria-hidden="true" className="text-sm font-black text-blue-800">⇆</span>
          </div>
        </div>
      </div>
    );
    phoneScreen = <Viewfinder kind="align" gap={L.monumentAngle(lab, I) - L.poleAngle(lab, I)} aimed={kind === 'aligned'} angle={done && res ? res.x : null} small={narrow} />;
  }

  const phoneButtons = (
    <div className="mt-1 flex items-center justify-center gap-1" dir="ltr">
      <button type="button" onClick={() => tiltSt.nudge(-1)} disabled={A <= lab.aMin} aria-label={m('tiltLess')} data-cl-tilt-less className={`${btn} border-slate-600 bg-slate-800 text-sky-200 focus-visible:ring-sky-400`}><ChevronDown className="h-4 w-4" aria-hidden="true" /></button>
      <button type="button" onClick={shoot} aria-label={m('shutter')} data-cl-shutter
        className={`inline-flex h-11 w-11 items-center justify-center rounded-full border-4 ${aimedNow ? 'border-emerald-400 bg-emerald-500' : 'border-slate-300 bg-rose-500'} text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300`}>
        <Camera className="h-4 w-4" aria-hidden="true" />
      </button>
      <button type="button" onClick={() => tiltSt.nudge(1)} disabled={A >= lab.aMax} aria-label={m('tiltMore')} data-cl-tilt-more className={`${btn} border-slate-600 bg-slate-800 text-sky-200 focus-visible:ring-sky-400`}><ChevronUp className="h-4 w-4" aria-hidden="true" /></button>
    </div>
  );

  return (
    <ManipulationShell
      type="clinometer"
      title={title ?? m('title')}
      mission={mission ?? m('mission')}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      guided={ruleByCp}
      hints={['hint1', 'hint2', 'hint3'].map((hk) => <MathText key={hk}>{m(hk)}</MathText>)}
      controller={{
        autoStep: () => false,
        canAutoStep: () => false,
        // `height` : la main est une VISÉE (d et α à accorder), pas un balayage → pas de bouton.
        ...(mode === 'height' ? {} : {
          autoComplete: {
            label: t('manipulation.autoComplete.tryAll'),
            ready: true,
            remaining: L.tryAllPlan(lab).length,
            // un essai par pas : on VOIT le sommet de l'échelle monter / l'observateur reculer
            intervalMs: 480,
            maxTicks: 80,
            step: () => {
              const next = L.tryAllPlan(labRef.current)[0];
              if (next === undefined) return;
              labRef.current = L.tryAllApply(labRef.current, next);
              setLiveI(null);
              setLab((s) => L.tryAllApply(s, next));
            },
            finish: () => {
              let cur = labRef.current;
              for (let guard = 0; guard < 2000; guard += 1) {
                const next = L.tryAllPlan(cur)[0];
                if (next === undefined) break;
                cur = L.tryAllApply(cur, next);
              }
              labRef.current = cur;
              setLiveI(null);
              setLab(cur);
            },
          },
        }),
      }}
      discovery={<ManipulationDiscovery state={state} prompt={m('dPrompt')} options={discoveryOptions} formal={formal} />}
      explanation={<MathText>{m('explanation', mode === 'ladder' ? { hm: L.tex(lab.hm), a: lab.theta, L10: L.texOf(L.r1(lab.Lstar)) } : mode === 'align' ? { P: L.tex(lab.P), d: L.tex(L.valueAt(lab, lab.iStar)), T: sumTex(lab) } : {})}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-slate-50 to-white" minHeight="min-h-[150px]">
        <div ref={boxRef} className="space-y-2" data-clinometer data-mode={mode} data-world={theme} data-stage={stage}
          data-aimed={mode === 'height' ? (aimedNow ? 'true' : 'false') : undefined} data-solved={ready ? 'true' : 'false'} data-scene-h={svgH}>
          <div ref={glanceRef} className="relative space-y-1.5" data-cl-glance>
            {party.node}
            {cp.node}
            {stepper}
            <div ref={sceneRef} className="relative mx-auto overflow-hidden rounded-xl" style={{ width: svgW, height: svgH }}>
              {sceneSvg}
              {overlays}
              <MovablePanel id={`clinometer.phone.${mode}`} bounds={sceneRef} title={k('phoneTitle')} className={`absolute right-1 z-10 ${mode === 'ladder' ? 'bottom-9' : 'top-1'}`}>
                <div className="rounded-[16px] border-[3px] border-slate-800 bg-slate-900 p-1 shadow-lg" data-cl-phone={mode}>
                  {phoneScreen}
                  {mode === 'height' && !narrow && phoneButtons}
                </div>
              </MovablePanel>
            </div>
            {zoomSvg}
            {mode === 'height' && narrow && phoneButtons}
            {/* les commandes sans glisser, juste sous la scène */}
            <div className={`flex flex-wrap items-center justify-center ${narrow ? 'gap-1' : 'gap-1.5'}`} dir="ltr">
              <button type="button" onClick={() => handSt.nudge(-1)} disabled={I <= lab.iMin} aria-label={m('handLess')} data-cl-hand-less className={`${btn} border-amber-300 focus-visible:ring-amber-500`}><Minus className="h-4 w-4" aria-hidden="true" /></button>
              <span className={`${narrow ? 'min-w-[4rem] px-1 text-xs' : 'min-w-[6rem] px-2 text-sm'} rounded-full bg-amber-100 py-1 text-center font-mono font-extrabold text-amber-900`} data-cl-hand-value={L.dec(value)}>
                <MathText>{`$${valueTex}$`}</MathText>
              </span>
              <button type="button" onClick={() => handSt.nudge(1)} disabled={I >= lab.iMax} aria-label={m('handMore')} data-cl-hand-more className={`${btn} border-amber-300 focus-visible:ring-amber-500`}><Plus className="h-4 w-4" aria-hidden="true" /></button>
            </div>
            {plan}
            <p role="status" className={`min-h-[2.5rem] ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug`} data-cl-verdict={verdictKind}>{verdict}</p>
          </div>

          {lab.trials.length > 0 && (
            <LabFold id="clinometer.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-cl-trials={lab.trials.length}>
                {lab.trials.slice(-8).map((tr, i) => (
                  <li key={i} className={tr.kind === 'measure' || tr.kind === 'aligned' || tr.kind === 'exact' ? 'text-emerald-800' : 'text-rose-800'}>
                    <MathText>{trialLine(tr, mode, m, lab)}</MathText>
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

/** Le « 95,65 + 2,45 » du manuel, écrit comme une seule somme (LaTeX). */
function sumTex(lab) {
  return `${L.tex(lab.a)} + ${L.tex(L.valueAt(lab, lab.iStar))}`;
}

function trialLine(tr, mode, m, lab) {
  if (mode === 'height') {
    if (tr.kind === 'miss') return m('trialMiss', { d: L.tex(tr.d), a: tr.a });
    return m('trialMeasure', { d: L.tex(tr.d), a: tr.a, h: L.texOf(L.r1(tr.h)) });
  }
  if (mode === 'ladder') return m(`trial_${tr.kind}`, { L: L.tex(tr.L), top: L.texOf(L.r2(tr.top)), hm: L.tex(lab.hm) });
  return m(`trial_${tr.kind}`, { d: L.tex(tr.d) });
}

/**
 * L'écran du téléphone (l'appli clinomètre) : un viseur avec réticule. `height` : le sommet du projecteur est
 * dessiné à l'écart `gap` (degrés) du réticule ; `ladder` : le niveau posé sur l'échelle lit l'angle ; `align` :
 * le sommet du poteau au réticule, la flamme du monument à l'écart `gap`. Aucun texte arabe, aucune réponse :
 * l'angle n'est écrit que s'il est mesuré (height, ladder) ou calculé (align, après le plan).
 */
function Viewfinder({ kind, gap = 0, aimed = false, angle = null, small = false }) {
  const W = 104; const H = 70; const scale = small ? 0.66 : 1; const cx = W / 2; const cy = H / 2 - 4;
  const ppd = kind === 'align' ? 9 : 3.2;
  const y = Math.max(6, Math.min(H - 16, cy - gap * ppd));
  const off = Math.abs(cy - gap * ppd - y) > 0.5;
  const tp = { style: { direction: 'ltr', unicodeBidi: 'isolate' }, fontFamily: 'ui-monospace, monospace' };
  return (
    <svg width={W * scale} height={H * scale} viewBox={`0 0 ${W} ${H}`} className="block rounded-[10px]" style={{ direction: 'ltr' }} aria-hidden="true" data-cl-viewfinder={kind}>
      <rect x={0} y={0} width={W} height={H} rx={10} fill={kind === 'height' ? '#0B1120' : kind === 'ladder' ? '#ECFEFF' : '#FFEDD5'} />
      {kind === 'height' && (
        <g>
          <rect x={cx - 8} y={y} width={16} height={6} rx={1} fill="#FEF9C3" stroke="#CA8A04" />
          <line x1={cx} y1={y + 6} x2={cx} y2={H} stroke="#94A3B8" strokeWidth={3} />
          {off && <path d={gap > 0 ? `M${cx - 5} 8 L${cx} 2 L${cx + 5} 8 Z` : `M${cx - 5} ${H - 22} L${cx} ${H - 16} L${cx + 5} ${H - 22} Z`} fill="#F87171" />}
        </g>
      )}
      {kind === 'align' && (
        <g>
          <path d={`M${cx - 10} ${H} Q${cx - 4} ${y + 10} ${cx} ${y} Q${cx + 4} ${y + 10} ${cx + 10} ${H} Z`} fill="#E2E8F0" stroke="#94A3B8" />
          <circle cx={cx} cy={y} r={2.6} fill="#F59E0B" />
          <line x1={cx} y1={cy} x2={cx} y2={H} stroke="#334155" strokeWidth={4} />
          <circle cx={cx} cy={cy} r={2.4} fill="#0F172A" />
          {off && <path d={gap > 0 ? `M${cx - 5} 8 L${cx} 2 L${cx + 5} 8 Z` : `M${cx - 5} ${H - 22} L${cx} ${H - 16} L${cx + 5} ${H - 22} Z`} fill="#E11D48" />}
        </g>
      )}
      {kind === 'ladder' ? (
        <g>
          <rect x={14} y={14} width={W - 28} height={14} rx={7} fill="#CFFAFE" stroke="#0891B2" />
          <circle cx={cx} cy={21} r={5} fill="#22D3EE" stroke="#0E7490" />
          <path d={`M14 50 L${W - 14} 50 L14 ${50 - (W - 28) * 0.35} Z`} fill="none" stroke="#0E7490" strokeWidth={1.4} />
        </g>
      ) : (
        <g>
          <circle cx={cx} cy={cy} r={9} fill="none" stroke={aimed ? '#4ADE80' : '#F8FAFC'} strokeWidth={1.6} />
          <line x1={cx - 15} x2={cx - 5} y1={cy} y2={cy} stroke={aimed ? '#4ADE80' : '#F8FAFC'} strokeWidth={1.4} />
          <line x1={cx + 5} x2={cx + 15} y1={cy} y2={cy} stroke={aimed ? '#4ADE80' : '#F8FAFC'} strokeWidth={1.4} />
        </g>
      )}
      <rect x={0} y={H - 15} width={W} height={15} fill="#0F172A" opacity={0.75} />
      <text x={cx} y={H - 4} textAnchor="middle" fontSize={11} fontWeight="bold" fill={aimed || kind === 'ladder' ? '#4ADE80' : '#F8FAFC'} {...tp} data-cl-phone-angle={angle ?? ''}>
        {angle != null ? `∠ ${String(angle).replace('.', ',')}°` : kind === 'align' ? (aimed ? '✓' : gap > 0 ? '▲' : '▼') : '∠ —'}
      </text>
    </svg>
  );
}

/** Le stade de nuit : tribune, lampes des téléphones des supporters, étoiles, un ballon qu'on frappe. Décor pur. */
function StadiumDeco({ w, yG, k }) {
  const reduce = useReducedMotion();
  const [kicks, setKicks] = useState(0);
  const standTop = yG - Math.max(18, k * 3.2);
  const lights = Array.from({ length: Math.max(6, Math.floor(w / 26)) }, (_, i) => i);
  return (
    <g data-deco="floodlight">
      <style>{'.cl-tw{animation:cl-tw 2.4s ease-in-out infinite}@keyframes cl-tw{50%{opacity:.25}}.cl-ball{transition:transform .8s ease-out}@media (prefers-reduced-motion: reduce){.cl-tw{animation:none}.cl-ball{transition:none}}'}</style>
      <g aria-hidden="true">
        {[0.15, 0.42, 0.63, 0.88].map((f, i) => <circle key={i} cx={w * f} cy={10 + (i % 2) * 9} r={1.2} fill="#E0E7FF" />)}
        <path d={`M${w * 0.18} ${yG} L${w * 0.24} ${standTop} L${w} ${standTop} L${w} ${yG} Z`} fill="#1E293B" opacity={0.85} />
        {lights.map((i) => (
          <circle key={i} className={reduce ? undefined : 'cl-tw'} style={{ animationDelay: `${(i % 5) * 0.4}s` }}
            cx={w * 0.27 + (i * (w * 0.7)) / lights.length} cy={standTop + 5 + (i % 3) * 4} r={1.4} fill="#FDE68A" />
        ))}
      </g>
      <g className={reduce ? undefined : 'cl-ball'} style={{ transform: `translateX(${(kicks % 3) * 18}px)`, cursor: 'pointer' }} onClick={() => setKicks((n) => n + 1)} aria-hidden="true" tabIndex={-1}>
        <circle cx={w * 0.55} cy={yG + 8} r={5} fill="#F8FAFC" stroke="#0F172A" strokeWidth={0.8} />
        <path d={`M${w * 0.55 - 2} ${yG + 7} l2 -2 l2 2 l-1 2 h-2 Z`} fill="#0F172A" />
      </g>
    </g>
  );
}

/** Le mur des graffeurs (le تحدّ) : briques, formes peintes, une bombe de peinture qui souffle au toucher. */
function MuralDeco({ x, w, yG, sceneW, footX }) {
  const reduce = useReducedMotion();
  const [puffs, setPuffs] = useState(0);
  const blobs = [['#F472B6', 0.25], ['#38BDF8', 0.55], ['#FACC15', 0.8]];
  return (
    <g data-deco="mural">
      <rect x={x} y={0} width={w} height={yG} fill="#FCA5A5" />
      {Array.from({ length: Math.ceil(yG / 9) }, (_, r) => (
        <line key={r} x1={x} x2={x + w} y1={r * 9} y2={r * 9} stroke="#F87171" strokeWidth={0.6} />
      ))}
      <g aria-hidden="true" opacity={0.9}>
        <path d={`M${x} ${yG * 0.62} C${x + w * 0.4} ${yG * 0.56}, ${x + w * 0.6} ${yG * 0.7}, ${x + w} ${yG * 0.64} L${x + w} ${yG * 0.72} C${x + w * 0.6} ${yG * 0.78}, ${x + w * 0.4} ${yG * 0.64}, ${x} ${yG * 0.7} Z`} fill="#A78BFA" />
        {blobs.map(([c, f]) => (
          <g key={c}>
            <circle cx={x + w * 0.5} cy={yG * (1 - f)} r={Math.min(w * 0.4, 13)} fill={c} stroke="#1E1B4B" strokeWidth={1.4} />
            <circle cx={x + w * 0.38} cy={yG * (1 - f) - Math.min(w * 0.14, 4)} r={Math.min(w * 0.1, 3)} fill="#FFFFFF" opacity={0.8} />
            <line x1={x + w * 0.56} y1={yG * (1 - f) + Math.min(w * 0.4, 13)} x2={x + w * 0.56} y2={yG * (1 - f) + Math.min(w * 0.4, 13) + 9} stroke={c} strokeWidth={2.2} strokeLinecap="round" />
          </g>
        ))}
        <path d={`M${x + w * 0.5} ${yG * 0.08} l3 7 h7 l-6 4 l2 7 l-6 -4 l-6 4 l2 -7 l-6 -4 h7 Z`} fill="#FDE047" stroke="#1E1B4B" strokeWidth={1} />
      </g>
      <g style={{ cursor: 'pointer' }} onClick={() => setPuffs((n) => n + 1)} aria-hidden="true" tabIndex={-1}>
        <rect x={Math.min(sceneW - 18, footX + 22)} y={yG - 16} width={8} height={16} rx={2} fill="#7C3AED" />
        <rect x={Math.min(sceneW - 18, footX + 22) + 2} y={yG - 20} width={4} height={4} fill="#1F2937" />
        {puffs > 0 && (
          <circle key={puffs} cx={Math.min(sceneW - 18, footX + 22) + 4} cy={yG - 26} r={reduce ? 5 : 7} fill={['#F472B6', '#38BDF8', '#FACC15'][puffs % 3]} opacity={0.6} />
        )}
      </g>
    </g>
  );
}

/** La baie d'Alger au couchant : la mer, le soleil, une mouette qui s'envole au toucher. Décor pur. */
function MaqamDeco({ w, yG }) {
  const reduce = useReducedMotion();
  const [up, setUp] = useState(0);
  return (
    <g data-deco="maqam">
      <style>{'.cl-gull{transition:transform 1s ease-out}@media (prefers-reduced-motion: reduce){.cl-gull{transition:none}}'}</style>
      <g aria-hidden="true">
        <circle cx={w * 0.78} cy={yG * 0.28} r={Math.max(8, yG * 0.08)} fill="#FB923C" opacity={0.9} />
        <rect x={w * 0.45} y={yG - 7} width={w * 0.55} height={7} fill="#38BDF8" opacity={0.7} />
      </g>
      <g className={reduce ? undefined : 'cl-gull'} style={{ transform: up % 2 ? `translate(${w * 0.1}px, -14px)` : 'none', cursor: 'pointer' }} onClick={() => setUp((n) => n + 1)} aria-hidden="true" tabIndex={-1}>
        <path d={`M${w * 0.6} ${yG * 0.45} q5 -5 10 0 q5 -5 10 0`} fill="none" stroke="#334155" strokeWidth={1.6} />
      </g>
    </g>
  );
}

/** مقام الشهيد : trois palmes qui se rejoignent ; la pointe (top) est le sommet visé. */
function Maqam({ x, yG, top }) {
  // مقام الشهيد : trois palmes de béton qui montent d'une large base et se rejoignent en haut (S, la pointe, reste le
  // sommet visé : H n'est pas modifié), la petite tourelle cylindrique entre elles, l'esplanade à gradins. Décor du dessin.
  const H = yG - top;
  const b = Math.max(10, H * 0.17);
  const y = (f) => yG - H * f;
  const leaf = (s) => `M${x + s * b} ${yG} C${x + s * b * 0.92} ${y(0.35)}, ${x + s * b * 0.42} ${y(0.72)}, ${x} ${top}`
    + ` C${x + s * b * 0.16} ${y(0.7)}, ${x + s * b * 0.5} ${y(0.3)}, ${x + s * b * 0.56} ${yG} Z`;
  const rib = (s) => `M${x + s * b * 0.78} ${yG} C${x + s * b * 0.72} ${y(0.4)}, ${x + s * b * 0.3} ${y(0.74)}, ${x} ${top}`;
  const tw = Math.max(3, b * 0.22); const tTop = y(0.66); const tBot = y(0.56);
  const step = Math.max(2, H * 0.014);
  return (
    <g aria-hidden="true" data-cl-maqam>
      {/* la palme centrale (vue de face), derrière */}
      <path d={`M${x - b * 0.3} ${yG} C${x - b * 0.26} ${y(0.4)}, ${x - b * 0.1} ${y(0.8)}, ${x} ${top} C${x + b * 0.1} ${y(0.8)}, ${x + b * 0.26} ${y(0.4)}, ${x + b * 0.3} ${yG} Z`} fill="#CBD5E1" stroke="#64748B" strokeWidth={1} />
      {/* la tourelle cylindrique entre les palmes, sa coupole */}
      <rect x={x - tw / 2} y={tTop} width={tw} height={tBot - tTop} fill="#94A3B8" stroke="#475569" strokeWidth={0.8} />
      <ellipse cx={x} cy={tTop} rx={tw / 2} ry={Math.max(1, tw * 0.22)} fill="#E2E8F0" stroke="#475569" strokeWidth={0.8} />
      <path d={`M${x - tw / 2} ${tTop} Q${x} ${tTop - tw * 0.9} ${x + tw / 2} ${tTop}`} fill="#F59E0B" opacity={0.85} />
      {/* les deux palmes latérales, leurs nervures */}
      <path d={leaf(-1)} fill="#E2E8F0" stroke="#475569" strokeWidth={1.1} />
      <path d={leaf(1)} fill="#F1F5F9" stroke="#475569" strokeWidth={1.1} />
      <path d={rib(-1)} fill="none" stroke="#94A3B8" strokeWidth={0.8} />
      <path d={rib(1)} fill="none" stroke="#94A3B8" strokeWidth={0.8} />
      {/* l'esplanade à gradins */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={x - b * (1.5 - i * 0.18)} y={yG - step * (i + 1)} width={b * 2 * (1.5 - i * 0.18)} height={step} fill={i % 2 ? '#D6D3D1' : '#E7E5E4'} stroke="#A8A29E" strokeWidth={0.6} />
      ))}
      <circle cx={x} cy={top} r={2.5} fill="#F59E0B" />
    </g>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** Deux étapes par mode ; la dernière suite finit par la RÈGLE (l'ancienne découverte, qui formalise). */
export const CHAINS = Object.freeze({
  height: Object.freeze({ h1: ['side', 'ratioHeight', 'heightValue'], h2: ['farther', 'angleChange', 'rule'] }),
  ladder: Object.freeze({ l1: ['short', 'bracket', 'sideLadder'], l2: ['ratioLadder', 'opLadder', 'lengthValue', 'rule'] }),
  align: Object.freeze({ a1: ['parallel', 'total'], a2: ['ratioAlign', 'angleX', 'heightMonument', 'rule'] }),
});
/** Quand l'étape est ATTEINTE (la carte s'ouvre). */
export const REACHED = Object.freeze({
  h1: (lab) => L.measures(lab).length >= 1,
  h2: (lab) => L.discoveryReady(lab),
  l1: (lab) => L.bracket(lab) != null,
  l2: (lab) => L.planDone(lab),
  a1: (lab) => lab.trials.some((x) => x.kind === 'aligned'),
  a2: (lab) => L.planDone(lab),
});

/** « أعِد التجربة » : h2 retire la dernière mesure ; l2 et a2 rouvrent le choix du rapport ; les autres recommencent. */
export function retryStage(s, id) {
  if (id === 'h2') {
    const at = s.trials.map((x) => x.kind).lastIndexOf('measure');
    return Object.freeze({ ...s, trials: Object.freeze(s.trials.slice(0, Math.max(0, at))), last: null });
  }
  return Object.freeze({ ...s, ratio: null, op: null, refusals: Object.freeze([]), last: null });
}

const $ = (x) => `$${x}$`;
const LRI = '\u2066';
const PDI = '\u2069';
const iso = (x) => `${LRI}${x}${PDI}`;
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const fnum = (p) => Number(p.n) / Number(p.d);
const add2 = (a, b) => fnum(a) + fnum(b);

/** Une question à trois choix dont la bonne est `right` ; `whys` : les raisons des deux autres (indexées par option). */
function choice(k, id, prompt, texts, right, whys, nums, hints, explain, cols = 1) {
  return {
    id, kind: 'choice', cols, prompt,
    options: texts.map((text, i) => (i === right ? { text, correct: true } : { text, why: whys[i] })),
    hints, explain,
  };
}

export const QUESTIONS = {
  /* ── height ── */
  side: (lab, k) => {
    const t0 = L.measures(lab).at(-1);
    const o = { d: iso(L.dec(t0.d)), a: $(`${t0.a}^{\\circ}`) };
    return choice(k, 'side', Mx(k, 'side.prompt', o),
      ['adjacent', 'opposite', 'hyp'].map((x) => Mx(k, `side.${x}`)), 0, [null, Mx(k, 'side.whyOpposite', o), Mx(k, 'side.whyHyp', o)], o,
      [Mx(k, 'side.hint1'), Mx(k, 'side.hint2')], Mx(k, 'side.explain'), 3);
  },
  ratioHeight: (lab, k) => {
    const t0 = L.measures(lab).at(-1);
    const o = { d: iso(L.dec(t0.d)), a: t0.a };
    return choice(k, 'ratioHeight', Mx(k, 'ratioHeight.prompt', o),
      [$('\\tan'), $('\\sin'), $('\\cos')].map((x) => <MathText>{x}</MathText>), 0, [null, Mx(k, 'ratioHeight.whySin', o), Mx(k, 'ratioHeight.whyCos', o)], o,
      [Mx(k, 'ratioHeight.hint1'), Mx(k, 'ratioHeight.hint2')], Mx(k, 'ratioHeight.explain', { a: t0.a }), 3);
  },
  heightValue: (lab, k) => {
    const t0 = L.measures(lab).at(-1);
    const ans = String(Math.round(t0.h));
    const o = { d: iso(L.dec(t0.d)), a: `${t0.a}°`, tan: iso(L.r2(TR.tanDeg(t0.a))), h: iso(L.r1(t0.h)), ans: iso(ans) };
    return {
      id: 'heightValue', kind: 'number', expected: ans, answer: <MathText>{$(ans)}</MathText>,
      prompt: Mx(k, 'heightValue.prompt', o), hints: [Mx(k, 'heightValue.hint1', o), Mx(k, 'heightValue.hint2', o)], explain: Mx(k, 'heightValue.explain', o),
    };
  },
  farther: (lab, k) => {
    const ms = L.measures(lab);
    const lo = ms.reduce((a, b) => (fnum(b.d) < fnum(a.d) ? b : a));
    const hi = ms.reduce((a, b) => (fnum(b.d) > fnum(a.d) ? b : a));
    const ans = L.dec(fnum(hi.d) - fnum(lo.d));
    const o = { d1: iso(L.dec(lo.d)), d2: iso(L.dec(hi.d)), ans: iso(ans) };
    return {
      id: 'farther', kind: 'number', expected: ans, answer: <MathText>{$(ans)}</MathText>,
      prompt: Mx(k, 'farther.prompt', o), hints: [Mx(k, 'farther.hint1'), Mx(k, 'farther.hint2', o)], explain: Mx(k, 'farther.explain', o),
    };
  },
  angleChange: (lab, k) => {
    const ms = L.measures(lab);
    const lo = ms.reduce((a, b) => (fnum(b.d) < fnum(a.d) ? b : a));
    const hi = ms.reduce((a, b) => (fnum(b.d) > fnum(a.d) ? b : a));
    const o = { d1: iso(L.dec(lo.d)), d2: iso(L.dec(hi.d)), a1: iso(`${lo.a}°`), a2: iso(`${hi.a}°`) };
    return choice(k, 'angleChange', Mx(k, 'angleChange.prompt', o),
      ['smaller', 'bigger', 'same'].map((x) => Mx(k, `angleChange.${x}`)), 0, [null, Mx(k, 'angleChange.whyBigger', o), Mx(k, 'angleChange.whySame', o)], o,
      [Mx(k, 'angleChange.hint1', o), Mx(k, 'angleChange.hint2')], Mx(k, 'angleChange.explain', o), 3);
  },
  /* ── ladder ── */
  short: (lab, k) => {
    const iHm = Math.round(fnum(lab.hm) / fnum(lab.step));
    const o = { hm: iso(L.dec(lab.hm)), top: iso(L.r2(L.topAt(lab, iHm))), theta: iso(`${lab.theta}°`) };
    return choice(k, 'short', Mx(k, 'short.prompt', o),
      ['equal', 'right', 'fixed'].map((x) => Mx(k, `short.${x}`)), 1, [Mx(k, 'short.whyEqual', o), null, Mx(k, 'short.whyFixed', o)], o,
      [Mx(k, 'short.hint1'), Mx(k, 'short.hint2', o)], Mx(k, 'short.explain', o));
  },
  bracket: (lab, k) => {
    const b = L.bracket(lab);
    const o = { lo: iso(L.dec(L.valueAt(lab, b.lo))), hi: iso(L.dec(L.valueAt(lab, b.hi))), topLo: iso(L.r2(L.topAt(lab, b.lo))), topHi: iso(L.r2(L.topAt(lab, b.hi))) };
    return choice(k, 'bracket', Mx(k, 'bracket.prompt', o),
      ['between', 'below', 'above'].map((x) => Mx(k, `bracket.${x}`, o)), 0, [null, Mx(k, 'bracket.whyBelow', o), Mx(k, 'bracket.whyAbove', o)], o,
      [Mx(k, 'bracket.hint1'), Mx(k, 'bracket.hint2')], Mx(k, 'bracket.explain', o));
  },
  sideLadder: (lab, k) => {
    const o = { hm: iso(L.dec(lab.hm)), theta: iso(`${lab.theta}°`) };
    return choice(k, 'sideLadder', Mx(k, 'sideLadder.prompt', o),
      ['opposite', 'adjacent', 'hyp'].map((x) => Mx(k, `sideLadder.${x}`)), 0, [null, Mx(k, 'sideLadder.whyAdjacent'), Mx(k, 'sideLadder.whyHyp')], o,
      [Mx(k, 'sideLadder.hint1', o), Mx(k, 'sideLadder.hint2')], Mx(k, 'sideLadder.explain', o), 3);
  },
  ratioLadder: (lab, k) => {
    const o = { hm: iso(L.dec(lab.hm)), theta: lab.theta };
    return choice(k, 'ratioLadder', Mx(k, 'ratioLadder.prompt', o),
      [$('\\sin'), $('\\cos'), $('\\tan')].map((x) => <MathText>{x}</MathText>), 0, [null, Mx(k, 'ratioLadder.whyCos'), Mx(k, 'ratioLadder.whyTan')], o,
      [Mx(k, 'ratioLadder.hint1'), Mx(k, 'ratioLadder.hint2')], Mx(k, 'ratioLadder.explain', { ...o, hm: L.tex(lab.hm) }), 3);
  },
  opLadder: (lab, k) => {
    const o = { hm: L.tex(lab.hm), theta: lab.theta, L: L.texOf(L.r1(lab.Lstar)), wrong: L.texOf(L.r2(L.wrongOpValue(lab))) };
    const tm = (x) => <MathText>{$(x)}</MathText>;
    return choice(k, 'opLadder', Mx(k, 'opLadder.prompt', o),
      [tm(`L = ${o.hm} \\div \\sin ${lab.theta}^{\\circ}`), tm(`L = ${o.hm} \\times \\sin ${lab.theta}^{\\circ}`), tm(`L = ${o.hm} + \\sin ${lab.theta}^{\\circ}`)], 0,
      [null, Mx(k, 'opLadder.whyMul', o), Mx(k, 'opLadder.whyPlus', o)], o,
      [Mx(k, 'opLadder.hint1'), Mx(k, 'opLadder.hint2', o)], Mx(k, 'opLadder.explain', o));
  },
  lengthValue: (lab, k) => {
    const ans = L.r1(lab.Lstar);
    const o = { hm: iso(L.dec(lab.hm)), theta: iso(`${lab.theta}°`), sin: iso(L.r2(TR.sinDeg(lab.theta))), L2: iso(L.r2(lab.Lstar)), ans: iso(ans) };
    return {
      id: 'lengthValue', kind: 'number', expected: ans, answer: <MathText>{$(L.texOf(ans))}</MathText>,
      prompt: Mx(k, 'lengthValue.prompt', o), hints: [Mx(k, 'lengthValue.hint1', o), Mx(k, 'lengthValue.hint2', o)], explain: Mx(k, 'lengthValue.explain', o),
    };
  },
  /* ── align ── */
  parallel: (lab, k) => {
    const o = { P: iso(L.dec(lab.P)) };
    return choice(k, 'parallel', Mx(k, 'parallel.prompt', o),
      ['right', 'same', 'ground'].map((x) => Mx(k, `parallel.${x}`)), 0, [null, Mx(k, 'parallel.whySame', o), Mx(k, 'parallel.whyGround')], o,
      [Mx(k, 'parallel.hint1'), Mx(k, 'parallel.hint2')], Mx(k, 'parallel.explain'));
  },
  total: (lab, k) => {
    const d = L.valueAt(lab, lab.iStar);
    const ans = L.dec(add2(lab.a, d));
    const o = { d: iso(L.dec(d)), a: iso(L.dec(lab.a)), ans: iso(ans) };
    return {
      id: 'total', kind: 'number', expected: ans, answer: <MathText>{$(L.texOf(ans))}</MathText>,
      prompt: Mx(k, 'total.prompt', o), hints: [Mx(k, 'total.hint1'), Mx(k, 'total.hint2')], explain: Mx(k, 'total.explain', o),
    };
  },
  ratioAlign: (lab, k) => {
    const o = { P: iso(L.dec(lab.P)), d: iso(L.dec(L.valueAt(lab, lab.iStar))) };
    return choice(k, 'ratioAlign', Mx(k, 'ratioAlign.prompt', o),
      [$('\\tan'), $('\\sin'), $('\\cos')].map((x) => <MathText>{x}</MathText>), 0, [null, Mx(k, 'ratioAlign.whySin'), Mx(k, 'ratioAlign.whyCos')], o,
      [Mx(k, 'ratioAlign.hint1'), Mx(k, 'ratioAlign.hint2')], Mx(k, 'ratioAlign.explain', { P: L.tex(lab.P), d: L.tex(L.valueAt(lab, lab.iStar)) }), 3);
  },
  angleX: (lab, k) => {
    const ans = String(L.result(lab).x);
    const o = { P: iso(L.dec(lab.P)), d: iso(L.dec(L.valueAt(lab, lab.iStar))), ans: iso(ans) };
    return {
      id: 'angleX', kind: 'number', expected: ans, answer: <MathText>{$(ans)}</MathText>,
      prompt: Mx(k, 'angleX.prompt', { P: L.tex(lab.P), d: L.tex(L.valueAt(lab, lab.iStar)) }), hints: [Mx(k, 'angleX.hint1', o), Mx(k, 'angleX.hint2')], explain: Mx(k, 'angleX.explain', o),
    };
  },
  heightMonument: (lab, k) => {
    const d = L.valueAt(lab, lab.iStar);
    const ans = String(L.result(lab).H1);
    const o = { P: iso(L.dec(lab.P)), d: iso(L.dec(d)), T: iso(L.dec(add2(lab.a, d))), H2: iso(L.texOf(String(L.result(lab).H100)).replace('.', ',')), ans: iso(ans) };
    return {
      id: 'heightMonument', kind: 'number', expected: ans, answer: <MathText>{$(ans)}</MathText>,
      prompt: Mx(k, 'heightMonument.prompt', o), hints: [Mx(k, 'heightMonument.hint1', o), Mx(k, 'heightMonument.hint2', o)], explain: Mx(k, 'heightMonument.explain', o),
    };
  },
  /* ── la règle (toutes les suites finales) : l'ancienne découverte ── */
  rule: (lab, k, ctx) => ({
    id: 'rule', kind: 'choice', prompt: ctx.prompt, options: ctx.options,
    hints: [Mx(k, 'rule.hint1'), Mx(k, 'rule.hint2')], explain: ctx.formal,
  }),
};
