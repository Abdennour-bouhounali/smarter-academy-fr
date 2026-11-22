import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { RotateCcw, RotateCw } from 'lucide-react';
import { parseDec } from '@smarter-academy/core';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import PlayerFigure from '../primitives/PlayerFigure';
import MathText from '../../components/MathText';
import { angleArc } from '../../components/geoFigure';
import * as L from '../logic/inscribedAngle';

/**
 * inscribed-angle — L'ANGLE DE TIR (unité 13 « الدوران - الزوايا - المضلّعات المنتظمة », leçon « الزاوية المحيطية والزاوية
 * المركزية والعلاقة بينهما », manuel pp. 153, 156, 159).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève TIENT le sommet de l'angle : le tireur M (مبتدئ) ou le point D du نشاط 4 (متقدم) — il le glisse sur la pelouse
 *    (aimanté par le cercle peint), le pose d'un toucher, le fait tourner le long du cercle au clavier (←/→ = ∓1°, Maj = 10°),
 *    l'éloigne / le rapproche du centre (↑/↓) ou le pose « داخل / على / خارج » d'un bouton.
 * B. Idée : une زاوية محيطية (sommet SUR le cercle, côtés qui coupent le cercle) mesure la MOITIÉ de la زاوية مركزية qui
 *    intercepte le même arc ; donc toutes celles qui interceptent le même arc sont égales.
 * C. Les deux lignes de tir MA, MB et l'angle en M suivent le doigt ; l'arc intercepté s'allume ; l'angle au centre AOB
 *    reste au point central ; hors du cercle, les lignes virent au rouge et l'angle change.
 * D. \widehat{AMB} = ½ \widehat{AOB} lu en direct ; à l'étape de مزيان les deux égalités du manuel avec les nombres de
 *    l'élève (2·BAD + AOB = 180°, ADB + BAD = 90°) ; à l'étape intérieure (exercice 12) \widehat{ADB} = (AOB + A′OB′)/2.
 * E. Avant la règle : deux positions du grand arc qui donnent le MÊME angle, ET un sommet hors du cercle (plus grand
 *    dedans, plus petit dehors) ou sur l'autre arc — et, à مبتدئ, un PARI posé avant que l'angle ne se lise.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        l'angle inscrit vaut la moitié de l'angle au centre qui intercepte le même arc
 *   OBJECT         le tireur sur la pelouse (le sommet de l'angle de tir) ; le point D du نشاط 4
 *   VARIABLE       la position du sommet : sa direction t autour de O (degrés) et sa distance au centre (sur / dans / hors)
 *   INVARIANT      les poteaux A, B, le cercle, l'angle au centre AOB ; sur le grand arc, l'angle AMB lui-même
 *   TRANSFORMATION les lignes de tir, l'angle en M, l'arc intercepté (le petit arc AB, ou l'autre) — en direct
 *   CONSTRAINT     un angle inscrit a son sommet SUR le cercle ; à l'étape de مزيان, [AD] doit être un diamètre
 *   RESISTANCE     hors du cercle : refusé « ليست زاوية محيطية » avec la mesure qui a changé ; un pari ≥ 180° refusé (un angle
 *                  de triangle est plus petit), le double de AOB nommé (MISC-MUHITIYA-DIF) ; D hors diamètre refusé avec
 *                  \widehat{AOD} lu (« 150° لا 180° ») ; « AOB = ½ ADB » réfuté par les nombres de l'élève
 *   EVIDENCE       les marques des essais sur le grand arc portent toutes le même angle ; les lignes rouges hors du cercle
 *   CONTRAST       deux positions du grand arc (près / loin du but) / un sommet dedans ou dehors / l'autre arc (120° = 180° − 60°) ;
 *                  à متقدم : O dans l'angle ADB ET hors de l'angle ; le D intérieur de l'exercice 12
 *   PREDICTION     le pari sur l'angle de tir à partir de l'angle au centre seul (مبتدئ) ; la relation choisie (مزيان)
 *   DISCOVERY      « sur tout le grand arc l'angle de tir est le même : la moitié de AOB ; hors du cercle ce n'est plus un angle inscrit »
 *   FORMALIZATION  \widehat{AMB} = ½ \widehat{AOB} ; \widehat{AOB} = 2\widehat{ADB} ; l'intérieur : (AOB + A′OB′)/2
 *   TRANSFER       معارف 4 (خاصية 1 و 2), la طريقة « من القوس إلى الزاوية », exercices 10, 11, 12, 16, 20
 *
 * Monde (`theme`) : `football` — la surface de réparation d'un stade (le 5-Juillet) vue d'en haut, la ligne de but = la corde AB,
 * le cercle « d'angle de tir égal » peint sur la pelouse, le tireur au maillot vert. Manuel (§6bis) : chaque pose est un essai
 * jugé ; aucune auto-complétion.
 *
 * DÉCOR (exigence du propriétaire) : la tribune et ses supporters (un toucher lance la vague, drapeaux vert-blanc), le filet du but,
 * le tireur au maillot vert. `aria-hidden`, hors clavier, `[data-deco]`, jamais une information (aucun angle, aucune longueur),
 * immobile sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (§8bis) : la scène est un CARRÉ (le cercle y tient avec la marge des positions hors du cercle) budgété sur
 * l'écran de leçon (`useLessonViewport` moins ce que le bloc mesuré `[data-ia-glance]` occupe en plus du dessin) ; à partir de
 * 620 px les lectures, les boutons et la carte d'étape sont À CÔTÉ du carré, sinon juste dessous en lignes compactes. Le
 * tableau des essais est dans un `LabFold` SOUS le bloc mesuré.
 *
 * Props : `r`, `A`, `B` (directions des poteaux, degrés), `M` (striker) ou `D` + `stages` (act4) — à plat ou dans `numbers` ;
 * `theme`, `title`, `lead`, `mission`, `level`, `levels`, `onTrial(evidence)` à chaque essai / pari / relation,
 * `onFinished({ mode, angle, central })` à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-inscribed-angle][data-mode][data-world][data-stage][data-solved], [data-ia-glance], [data-ia-scene],
 * [data-ia-handle] (role=slider, aria-valuenow = t), [data-ia-angle], [data-ia-central], [data-ia-position], [data-ia-arc],
 * [data-ia-verdict=<kind>], [data-ia-bet-input], [data-ia-bet], [data-ia-rotate=ccw|cw], [data-ia-place=inside|on|outside],
 * [data-ia-relation=<choice>], [data-ia-next], [data-ia-back], [data-ia-mark=<kind>], [data-lab-fold=inscribed-angle.trials],
 * [data-deco].
 */
const NUMBER_KEYS = ['r', 'A', 'B', 'M', 'D', 'stages'];
const TP = { style: { direction: 'ltr', unicodeBidi: 'isolate' }, fontFamily: 'ui-monospace, monospace' };
const COLORS = { central: '#1E3A8A', shot: '#F59E0B', refused: '#E11D48', arc: '#FB7185', near: '#38BDF8', circle: '#FFFFFF', diameter: '#A7F3D0' };
const solid = 'inline-flex h-11 min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 px-3 text-sm font-bold text-white focus:outline-none focus-visible:ring-2';
const btn = 'inline-flex h-11 min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 bg-white px-2 text-sm font-bold disabled:opacity-40 focus:outline-none focus-visible:ring-2';
/** Un nombre à virgule écrit DANS un îlot KaTeX : la virgule décimale du manuel est `{,}`. */
const tx = (s) => String(s).replace(',', '{,}');
const deg = (v) => tx(L.degText(v));
const SETTLE_MS = 700;

export default function InscribedAngle(props) {
  const { numbers: grouped, theme = 'football', title, lead, mission, level, levels: withLevels = true,
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
  const k = useCallback((key, o) => t(`manipulation.inscribedAngle.${key}`, o), [t]);
  const state = useManipulation({ type: 'inscribed-angle', initialNumbers: authored, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numKey = JSON.stringify(NUMBER_KEYS.map((x) => nums[x] ?? null));
  const make = () => L.init(nums);
  const [lab, setLab] = useState(make);
  const sceneKey = `${numKey}|${state.epoch}`;
  const [scene, setScene] = useState(sceneKey);
  const [inits, setInits] = useState(0);
  const [doneIds, setDoneIds] = useState({});
  // « إعادة », un autre niveau ou d'autres nombres : TOUT recommence — la scène, les essais, les questions du labo
  if (scene !== sceneKey) { setScene(sceneKey); setLab(make()); setInits((n) => n + 1); setDoneIds({}); }
  const mode = lab.mode;
  const m = useCallback((key, o) => k(`${mode}.${key}`, { name: lab.name, ...o }), [k, mode, lab.name]);

  const ready = L.discoveryReady(lab);
  // les questions pendant le labo : obligatoires pour tout élève, l'enseignant seul les coupe pour SON compte (L2)
  const cpSettings = useLabCheckpointSettings('inscribed-angle');
  const cpLive = cpOn && cpSettings.enabled;
  useEffect(() => { if (ready && !cpLive) state.discover(); }, [ready, state.epoch, cpLive]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!state.isFormal) return;
    state.report(onFinished, { mode, central: lab.central, angle: lab.inscribed });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const nEvents = lab.trials.length + (lab.last?.kind === 'bet' || lab.last?.kind === 'relation' ? 1 : 0);
  const lastRef = useRef(null);
  useEffect(() => {
    if (!lab.last || lab.last === lastRef.current) return;
    lastRef.current = lab.last;
    const e = L.evidenceOf(lab);
    if (e) state.report(onTrial, e);
  }, [lab.last, nEvents]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la découverte : des distracteurs réfutés par les essais de l'élève ── */
  const discoveryOptions = useMemo(() => {
    if (mode === 'act4') {
      const hou = L.distinctMajor(lab, 'houaria');
      const inner = lab.trials.find((tr) => tr.kind === 'interior');
      return [
        { text: <MathText>{m('dOptDiameter')}</MathText>, why: <MathText>{hou.length ? m('dWhyDiameter', { n: hou.length, angle: deg(hou[0].angle) }) : m('dWhyDiameterNone')}</MathText> },
        { text: <MathText>{m('dOptRight')}</MathText>, correct: true },
        { text: <MathText>{m('dOptInterior')}</MathText>, why: <MathText>{inner ? m('dWhyInterior', { angle: deg(inner.angle), half: deg(lab.inscribed) }) : m('dWhyInteriorNone')}</MathText> },
      ];
    }
    const nf = L.nearFar(lab);
    const any = L.distinctMajor(lab)[0];
    return [
      { text: <MathText>{m('dOptCloser')}</MathText>, why: <MathText>{nf ? m('dWhyCloser', { angle: deg(nf.near.angle) }) : m('dWhyCloserNone')}</MathText> },
      { text: <MathText>{m('dOptEqual')}</MathText>, why: <MathText>{m('dWhyEqual', { angle: deg(any?.angle ?? lab.inscribed), central: deg(lab.central) })}</MathText> },
      { text: <MathText>{m('dOptRight')}</MathText>, correct: true },
    ];
  }, [lab, m, mode]);

  const formal = mode === 'act4' ? (
    <div className="space-y-2" data-ia-formal>
      <EquationDisplay tone="result" tex={`\\widehat{AOB} = 2\\,\\widehat{ADB} \\qquad \\widehat{ADB} = \\dfrac{1}{2}\\widehat{AOB} = \\dfrac{${deg(lab.central)}^{\\circ}}{2} = ${deg(lab.inscribed)}^{\\circ}`} note={m('fNote')} />
      <EquationDisplay tone="result" tex={'\\widehat{ADB} = \\dfrac{\\widehat{AOB} + \\widehat{A\'OB\'}}{2}'} note={m('fInterior')} />
      <p className="text-sm text-emerald-900"><MathText>{m('fRule')}</MathText></p>
    </div>
  ) : (
    <div className="space-y-2" data-ia-formal>
      <EquationDisplay tone="result" tex={`\\widehat{AMB} = \\dfrac{1}{2}\\widehat{AOB} = \\dfrac{${deg(lab.central)}^{\\circ}}{2} = ${deg(lab.inscribed)}^{\\circ}`} note={m('fNote')} />
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
  if (lab.trials.length === 0 && !lab.bet && !lab.relation && celebrated.current.size) celebrated.current = new Set();   // « إعادة » : on refête
  const doneKey = stepDone.join();
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.has(i)) return;
      celebrated.current.add(i);
      party.celebrate({ n: i + 1, total: stepList.length });
    });
  }, [doneKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le son : un déclic par geste (au plus un toutes les 35 ms), « flag » à la mesure juste, « bell » à l'étape atteinte, « over » à une position refusée
     ou à un mauvais choix. Muet sauf « الصوت ». ── */
  const tick = useRef(0);
  const heard = useRef(null);
  const reachedCount = useRef(0);
  const gestureKey = `${lab.pos.t}|${lab.pos.rho}`;
  const lastGesture = useRef(gestureKey);
  useEffect(() => {
    if (lastGesture.current === gestureKey) return;
    lastGesture.current = gestureKey;
    const now = performance.now();
    if (now - tick.current > 35) { playSfx('tooth'); tick.current = now; }
  }, [gestureKey]);
  useEffect(() => {
    const e = lab.last;
    if (!e || heard.current === e) return;
    heard.current = e;
    const n = stepList.filter((st) => st.reached).length;
    if (e.kind === 'bet') playSfx(e.bet.refused ? 'over' : 'tooth');
    else if (e.kind === 'relation') playSfx(e.ok ? 'flag' : 'over');
    else if (e.kind === 'trial') playSfx(e.trial.refused || e.trial.kind === 'minor' ? 'over' : 'flag');
    if (n > reachedCount.current) playSfx('bell');
    reachedCount.current = n;
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ManipulationShell
      type="inscribed-angle"
      title={title ?? m('title')}
      mission={mission ?? <MathText>{m(mode === 'act4' ? `mission_${lab.stage}` : 'mission', { central: deg(lab.central) })}</MathText>}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided={cpLive}
      hints={['hint1', 'hint2', 'hint3'].map((hk) => <MathText key={hk}>{m(hk)}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={<ManipulationDiscovery state={state} prompt={m('dPrompt')} options={discoveryOptions} formal={formal} />}
      explanation={<MathText>{m('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-emerald-50/70 to-white" minHeight="min-h-[150px]">
        <div className="relative space-y-2">
          {party.node}
          {cp.node}
          <LabStepper count={stepList.length} current={Math.max(0, stepDone.indexOf(false) < 0 ? stepList.length - 1 : stepDone.indexOf(false))} done={stepDone} stepAttr="data-ia-step" />
          <ShootingLab lab={lab} setLab={setLab} m={m} k={k} theme={theme} solved={ready} blocking={cp.blocking} />
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
      if (glanceRef.current) setOverhead(Math.max(60, Math.ceil(glanceRef.current.getBoundingClientRect().height) - drawnH.current));
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

/** Les points d'un arc du cercle (unités du dessin, sens direct de `from` sur `span` degrés). */
const arcPoints = (r, from, span, n = 48) => Array.from({ length: n + 1 }, (_, i) => {
  const a = ((from + (span * i) / n) * Math.PI) / 180;
  return { x: r * Math.cos(a), y: r * Math.sin(a) };
});
const bearingOf = (p) => (((Math.atan2(p.y, p.x) * 180) / Math.PI) % 360 + 360) % 360;

/* ════════════════════════════ la scène : la surface de réparation, le cercle, le sommet ════════════════════════════ */

function ShootingLab({ lab, setLab, m, k, theme, solved, blocking = false }) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const { boxRef, glanceRef, drawnH, width, budget } = useBudget(220, 560);
  const wide = width >= 620;
  const narrow = width < 380;
  const side = wide ? 250 : 0;
  const S = Math.round(Math.max(200, Math.min(budget, wide ? width - side - 12 : width, 560)));
  drawnH.current = S;
  const sceneRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const settle = useRef(null);
  useEffect(() => () => { if (settle.current) clearTimeout(settle.current); }, []);

  /* le repère : un carré de demi-côté 1,5 r centré sur O ; y vers le haut dans le monde, vers le bas à l'écran */
  const half = 1.5 * lab.r;
  const sc = S / (2 * half);
  const X = (x) => S / 2 + x * sc;
  const Y = (y) => S / 2 - y * sc;
  const px = (p) => [X(p.x), Y(p.y)];
  const Rpx = lab.r * sc;

  const pos = lab.pos;
  const meas = L.measure(lab, pos);
  const M = L.pointOf(lab, pos);
  const showAngle = L.hasBet(lab);
  const onCircle = meas.position === 'on';
  const refusedNow = !onCircle && !(lab.stage === 'interior' && meas.position === 'inside');

  /* ── la main : glisser, toucher, clavier, boutons ── */
  const toPos = useCallback((cx, cy) => {
    const r = sceneRef.current?.getBoundingClientRect();
    if (!r) return null;
    const x = ((cx - r.left) * (S / r.width) - S / 2) / sc;
    const y = -((cy - r.top) * (S / r.height) - S / 2) / sc;
    return { t: bearingOf({ x, y }), rho: Math.hypot(x, y) / lab.r };
  }, [S, sc, lab.r]);
  const commitSoon = useCallback(() => {
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => { settle.current = null; setLab((s) => L.place(s)); }, SETTLE_MS);
  }, [setLab]);
  const commitNow = useCallback(() => {
    if (settle.current) { clearTimeout(settle.current); settle.current = null; }
    setLab((s) => L.place(s));
  }, [setLab]);

  const pointer = {
    onPointerDown: (e) => {
      if (e.button > 0) return;
      e.preventDefault();
      if (settle.current) { clearTimeout(settle.current); settle.current = null; setLab((s) => L.place(s)); }
      e.currentTarget.setPointerCapture?.(e.pointerId);
      setDragging(true);
      const p = toPos(e.clientX, e.clientY);
      if (p) setLab((s) => L.moveTo(s, p));
    },
    onPointerMove: (e) => {
      if (!dragging) return;
      const p = toPos(e.clientX, e.clientY);
      if (p) setLab((s) => L.moveTo(s, p));
    },
    onPointerUp: (e) => {
      if (!dragging) return;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      setDragging(false);
      const p = toPos(e.clientX, e.clientY);
      setLab((s) => L.place(p ? L.moveTo(s, p) : s));
    },
    onPointerCancel: () => { if (dragging) { setDragging(false); setLab((s) => L.place(s)); } },
  };
  const step = (dt, drho = 0) => {
    // quitter le cercle d'une touche : l'aimant (±SNAP) le reprendrait à ±0,05, on saute donc à ±0,1
    const nextRho = (rho) => (drho === 0 ? rho : rho === 1 ? 1 + Math.sign(drho) * 0.1 : rho + drho);
    setLab((s) => L.moveTo(s, { t: s.pos.t + dt, rho: nextRho(s.pos.rho) }));
    commitSoon();
  };
  const onKeyDown = (e) => {
    const big = e.shiftKey ? 10 : 1;
    const map = { ArrowRight: [big, 0], ArrowLeft: [-big, 0], ArrowUp: [0, 0.05], ArrowDown: [0, -0.05], PageUp: [10, 0], PageDown: [-10, 0] };
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); commitNow(); return; }
    if (e.key === 'Home') { e.preventDefault(); setLab((s) => L.moveTo(s, { t: s.pos.t, rho: 1 })); commitSoon(); return; }
    const d = map[e.key];
    if (!d) return;
    e.preventDefault();
    step(d[0], d[1]);
  };
  const placeAt = (where) => {
    if (settle.current) { clearTimeout(settle.current); settle.current = null; }
    const rho = where === 'inside' ? 0.6 : where === 'outside' ? 1.3 : 1;
    setLab((s) => L.place(L.moveTo(s, { t: s.pos.t, rho })));
  };

  /* ── le pari (striker) ── */
  const [betText, setBetText] = useState('');
  const submitBet = (e) => {
    e?.preventDefault?.();
    const v = parseDec(betText);
    setLab((s) => L.bet(s, Number.isFinite(v) ? v : null));
  };

  /* ── l'arc intercepté (celui qui ne contient pas le sommet) et l'arc A′B′ de l'intérieur ── */
  const span = (((lab.B - lab.A) % 360) + 360) % 360; // de A vers B dans le sens direct
  const tIn = (((pos.t - lab.A) % 360) + 360) % 360;
  // l'arc AB qui ne porte pas le sommet ; hors du cercle, le PETIT arc AB (celui que l'angle au centre intercepte)
  const minorFrom = span <= 180 ? lab.A : lab.B;
  const minorSpan = span <= 180 ? span : 360 - span;
  const interceptFrom = onCircle ? (tIn < span ? lab.B : lab.A) : minorFrom;
  const interceptSpan = onCircle ? (tIn < span ? 360 - span : span) : minorSpan;
  const pathOf = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)} ${Y(p.y).toFixed(1)}`).join(' ');
  const interceptPath = pathOf(arcPoints(lab.r, interceptFrom, interceptSpan));
  const showInner = meas.position === 'inside' && lab.mode === 'act4' && lab.stage === 'interior';
  let innerPath = null;
  if (showInner && meas.A2 && meas.B2) {
    const a2 = bearingOf(meas.A2); const b2 = bearingOf(meas.B2);
    const sp = (((b2 - a2) % 360) + 360) % 360;
    const aIn = (((lab.A - a2) % 360) + 360) % 360 < sp;
    innerPath = pathOf(aIn ? arcPoints(lab.r, b2, 360 - sp) : arcPoints(lab.r, a2, sp));
  }

  const O = [X(0), Y(0)];
  const Apx = px(lab.Apt); const Bpx = px(lab.Bpt); const Mpx = px(M);
  const centralArc = angleArc(Apx, O, Bpx, Math.max(16, Rpx * 0.22));
  const shotArc = angleArc(Apx, Mpx, Bpx, Math.max(18, Rpx * 0.26));
  const goalY = Y(lab.Apt.y);
  /* le tireur : dans le prolongement de [OM) (hors de l'angle de tir), son nom sur le côté */
  const outward = (() => { const dx = Mpx[0] - O[0]; const dy = Mpx[1] - O[1]; const l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; })();
  const side90 = [-outward[1], outward[0]];
  const pw = narrow ? 20 : 26;
  const playerAt = [Mpx[0] + outward[0] * (pw * 0.9 + 6) - pw / 2, Mpx[1] + outward[1] * (pw * 0.9 + 6) - pw * 0.68];

  /* ── l'étape de مزيان : le diamètre, le triangle isocèle AOB, le triangle rectangle ABD ── */
  const atDiameter = lab.mode === 'act4' && lab.stage === 'mezian' && meas.diameter;

  /* ── la lecture ── */
  const last = lab.last;
  const lastTrial = last?.kind === 'trial' ? last.trial : null;
  const verdictKind = dragging ? 'live' : last?.kind === 'bet' ? `bet-${last.bet.verdict}` : last?.kind === 'relation' ? `rel-${last.choice}` : lastTrial ? lastTrial.kind : 'start';
  const angleTex = (v, approx) => `${approx ? '\\approx' : '='}\\;${deg(Math.round(v * 10) / 10)}^{\\circ}`;
  const verdict = (() => {
    const a = lastTrial ? deg(Math.round(lastTrial.angle * 10) / 10) : null;
    // avant le pari, aucun angle de tir ne s'écrit (ni sur la scène, ni ici)
    if (lab.mode === 'striker' && !showAngle && lastTrial && verdictKind !== 'live') {
      return <span className="text-indigo-900"><MathText>{m('vNoBet', { position: positionLabel })}</MathText></span>;
    }
    switch (verdictKind) {
      case 'live': return <span className="text-slate-700"><MathText>{m(onCircle ? 'vLiveOn' : 'vLiveOff')}</MathText></span>;
      case 'bet-impossible': return <span className="text-rose-800"><MathText>{m('vBetImpossible', { value: tx(last.bet.value ?? '') })}</MathText></span>;
      case 'bet-double': return <span className="text-rose-800"><MathText>{m('vBetDouble', { value: tx(last.bet.value), central: deg(lab.central) })}</MathText></span>;
      case 'bet-empty': return <span className="text-rose-800">{m('vBetEmpty')}</span>;
      case 'bet-equal': case 'bet-half': case 'bet-other': return <span className="text-indigo-900"><MathText>{m('vBetOk', { value: tx(last.bet.value) })}</MathText></span>;
      case 'rel-double': return <span className="text-emerald-800"><MathText>{m('vRelDouble', { ...mzTex(L.mezianNumbers(lab)) })}</MathText></span>;
      case 'rel-half': return <span className="text-rose-800"><MathText>{m('vRelHalf', { ...mzTex(L.mezianNumbers(lab)), half: deg(L.mezianNumbers(lab).ADB / 2) })}</MathText></span>;
      case 'rel-equal': return <span className="text-rose-800"><MathText>{m('vRelEqual', { ...mzTex(L.mezianNumbers(lab)) })}</MathText></span>;
      case 'inside': return <span className="text-rose-800"><MathText>{m('vInside', { angle: a, half: deg(lab.inscribed) })}</MathText></span>;
      case 'outside': return <span className="text-rose-800"><MathText>{m('vOutside', { angle: a, half: deg(lab.inscribed) })}</MathText></span>;
      case 'minor': return <span className="text-amber-800"><MathText>{m('vMinor', { angle: a, half: deg(lab.inscribed) })}</MathText></span>;
      case 'notDiameter': return <span className="text-rose-800"><MathText>{m('vNotDiameter', { aod: deg(L.aodOf(lab, lastTrial)) })}</MathText></span>;
      case 'diameter': return <span className="text-emerald-800"><MathText>{m('vDiameter')}</MathText></span>;
      case 'interior': return <span className="text-sky-900"><MathText>{m('vInterior', { angle: a, far: deg(lastTrial.far), near: deg(lastTrial.near) })}</MathText></span>;
      case 'major': {
        if (lab.mode === 'striker' && lab.bet) {
          const okBet = Math.abs(lab.bet.value - lastTrial.angle) < 1e-9;
          return <span className={okBet ? 'text-emerald-800' : 'text-amber-800'}><MathText>{m(okBet ? 'vMajorBetOk' : 'vMajorBetKo', { angle: a, bet: tx(lab.bet.value), n: L.distinctMajor(lab).length })}</MathText></span>;
        }
        return <span className="text-emerald-800"><MathText>{m('vMajor', { angle: a, oInside: lastTrial.oInside ? m('oIn') : m('oOut') })}</MathText></span>;
      }
      default: return <span className="text-slate-700"><MathText>{m('vStart', { central: deg(lab.central) })}</MathText></span>;
    }
  })();

  /* ── les marques des essais (les plus récents) ── */
  const marks = lab.trials.slice(-10);

  const positionLabel = meas.position === 'on' ? m(meas.arc === 'major' ? 'posMajor' : 'posMinor') : m(meas.position === 'inside' ? 'posInside' : 'posOutside');
  const readings = (
    <div className={`rounded-2xl border-2 border-slate-800 bg-slate-900 px-2 py-1.5 text-white shadow ${narrow ? 'text-[11px]' : 'text-xs'}`} data-ia-readings>
      <div className={wide ? 'flex flex-col gap-1' : 'flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5'}>
        <span data-ia-central={lab.central}>{!narrow && <span className="text-indigo-300">{k('central')} </span>}<MathText>{`$\\widehat{AOB} = ${deg(lab.central)}^{\\circ}$`}</MathText></span>
        <span data-ia-angle={showAngle ? L.degText(meas.angle) : '?'}>
          {!narrow && <span className="text-amber-300">{onCircle ? k(lab.mode === 'act4' ? 'inscribedAct4' : 'inscribed') : k('notInscribed')} </span>}
          <MathText>{showAngle ? `$\\widehat{A${lab.name}B} ${angleTex(meas.angle, !onCircle)}$` : `$\\widehat{A${lab.name}B} = \\;?$`}</MathText>
        </span>
        <span data-ia-position={meas.position} data-ia-arc={meas.arc ?? ''} className={refusedNow ? 'font-bold text-rose-300' : 'text-emerald-300'}>{positionLabel}</span>
        {lab.mode === 'striker' && lab.bet && !narrow && <span data-ia-bet={lab.bet.value} className="text-slate-300"><MathText>{m('betShown', { value: tx(lab.bet.value) })}</MathText></span>}
      </div>
    </div>
  );

  const rotateButtons = (
    <div className="flex flex-wrap items-center justify-center gap-1.5" data-ia-controls>
      <button type="button" onClick={() => step(5)} aria-label={k('rotateCcw')} data-ia-rotate="ccw" className={`${btn} border-emerald-300 text-emerald-900 focus-visible:ring-emerald-500`}><RotateCcw className="h-4 w-4" aria-hidden="true" /><bdi dir="ltr">5°</bdi></button>
      <button type="button" onClick={() => step(-5)} aria-label={k('rotateCw')} data-ia-rotate="cw" className={`${btn} border-emerald-300 text-emerald-900 focus-visible:ring-emerald-500`}><RotateCw className="h-4 w-4" aria-hidden="true" /><bdi dir="ltr">5°</bdi></button>
      <div className="inline-flex overflow-hidden rounded-xl border-2 border-slate-300" role="group" aria-label={k('placeGroup')}>
        {['inside', 'on', 'outside'].map((w) => (
          <button key={w} type="button" onClick={() => placeAt(w)} data-ia-place={w} aria-pressed={meas.position === w}
            className={`h-11 min-w-[44px] px-2 text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${meas.position === w ? 'bg-slate-800 text-white' : 'bg-white text-slate-700'}`}>
            {k(narrow ? `placeShort_${w}` : `place_${w}`)}
          </button>
        ))}
      </div>
    </div>
  );

  const betRow = lab.mode === 'striker' && L.canBet(lab) && (
    <form onSubmit={submitBet} className={`flex items-center justify-center gap-1.5 ${wide ? 'flex-wrap' : ''}`} data-ia-bet-form>
      <label className="text-xs font-bold text-slate-700" htmlFor={`${uid}-bet`}>{m(narrow ? 'betLabelShort' : 'betLabel')}</label>
      <span className="inline-flex items-center gap-0.5" dir="ltr">
        <input id={`${uid}-bet`} type="text" inputMode="decimal" dir="ltr" value={betText} onChange={(e) => setBetText(e.target.value)}
          data-ia-bet-input aria-label={m('betAria')} placeholder="؟"
          className="h-11 w-16 rounded-xl border-2 border-indigo-300 bg-white px-2 text-center font-mono text-base font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400" />
        <span className="font-mono font-bold text-slate-700">°</span>
      </span>
      <button type="submit" className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 border-indigo-700 bg-indigo-600 px-3 text-sm font-bold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400" data-ia-bet-submit>{m('betButton')}</button>
    </form>
  );

  /* ── la carte de l'étape (act4) ── */
  const stageIndex = lab.stages.indexOf(lab.stage);
  const done = lab.mode === 'act4' && L.stageDone(lab);
  const hou = lab.mode === 'act4' ? L.distinctMajor(lab, 'houaria') : [];
  const stageCard = lab.mode === 'act4' && (
    <div className="space-y-1.5 rounded-2xl border-2 border-indigo-200 bg-white/90 p-2 text-xs" data-ia-stage-card={lab.stage}>
      <p className="font-bold text-indigo-900">{k('stageOf', { n: stageIndex + 1, total: lab.stages.length })} — {m(`stage_${lab.stage}`)}</p>
      {lab.stage === 'mezian' && L.mezianReady(lab) && (
        <div className="space-y-1">
          <div dir="ltr" className="space-y-0.5 text-center" data-ia-mezian-equalities>
            <div><MathText>{'$2\\widehat{BAD} + \\widehat{AOB} = 180^{\\circ}$'}</MathText></div>
            <div className="text-slate-600"><MathText>{`$2 \\times ${deg(L.mezianNumbers(lab).BAD)}^{\\circ} + ${deg(L.mezianNumbers(lab).AOB)}^{\\circ} = 180^{\\circ}$`}</MathText></div>
            <div><MathText>{'$\\widehat{ADB} + \\widehat{BAD} = 90^{\\circ}$'}</MathText></div>
            <div className="text-slate-600"><MathText>{`$${deg(L.mezianNumbers(lab).ADB)}^{\\circ} + ${deg(L.mezianNumbers(lab).BAD)}^{\\circ} = 90^{\\circ}$`}</MathText></div>
          </div>
          {lab.relation !== 'double' && (
            <>
              <p className="font-bold text-slate-700">{m('relationAsk')}</p>
              <div className="flex flex-wrap justify-center gap-1">
                {[['double', '\\widehat{AOB} = 2\\,\\widehat{ADB}'], ['half', '\\widehat{AOB} = \\tfrac{1}{2}\\widehat{ADB}'], ['equal', '\\widehat{AOB} = \\widehat{ADB}']].map(([c, texr]) => (
                  <button key={c} type="button" onClick={() => setLab((s) => L.pickRelation(s, c))} data-ia-relation={c}
                    className={`${btn} border-slate-300 text-slate-800 focus-visible:ring-indigo-400`}><MathText>{`$${texr}$`}</MathText></button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      {lab.stage === 'houaria' && (
        <p className="text-slate-700" data-ia-houaria={hou.length}>
          {m('houariaCount')} <bdi dir="ltr" className="font-mono font-bold">{`${Math.min(hou.length, 3)} / 3`}</bdi>
          {' · '}{m('oInsideSeen')} <b>{hou.some((tr) => tr.oInside === true) ? '✓' : '—'}</b>
          {' · '}{m('oOutsideSeen')} <b>{hou.some((tr) => tr.oInside === false) ? '✓' : '—'}</b>
        </p>
      )}
      {done && !blocking && stageIndex < lab.stages.length - 1 && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-emerald-50 p-1.5">
          <p className="flex-1 font-bold text-emerald-900"><MathText>{m(`done_${lab.stage}`)}</MathText></p>
          <button type="button" onClick={() => setLab((s) => L.advance(s))} data-ia-next className={`${solid} border-emerald-700 bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-400`}>{m(`next_${lab.stage}`)}</button>
        </div>
      )}
      {stageIndex > 0 && (
        <button type="button" onClick={() => setLab((s) => L.back(s))} data-ia-back className="min-h-[44px] text-xs font-bold text-indigo-700 underline">{k('back')}</button>
      )}
    </div>
  );

  const fs = narrow ? 12 : 14;
  return (
    <div ref={boxRef} className="space-y-2" data-inscribed-angle data-mode={lab.mode} data-world={theme} data-stage={lab.stage ?? ''} data-solved={solved ? 'true' : 'false'} data-scene-s={S}>
      <div ref={glanceRef} className="space-y-1.5" data-ia-glance>
        <div className={wide ? 'flex items-start justify-center gap-3' : 'space-y-1.5'}>
          <div ref={sceneRef} className="relative mx-auto shrink-0 overflow-hidden rounded-xl border border-emerald-900/30" style={{ width: S, height: S, touchAction: 'none' }}
            {...pointer} data-ia-scene data-dragging={dragging ? 'true' : undefined}>
            <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} className="absolute inset-0" style={{ direction: 'ltr' }}
              role="img" aria-label={m('sceneLabel', { central: L.degText(lab.central), position: positionLabel })}>
              <defs>
                <linearGradient id={`${uid}-stand`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#1E293B" /><stop offset="1" stopColor="#334155" /></linearGradient>
              </defs>
              <Pitch S={S} goalY={goalY} Apx={Apx} Bpx={Bpx} uid={uid} reduce={reduce} />
              {/* le cercle peint (𝒞) : la mathématique, pas le décor */}
              <circle cx={O[0]} cy={O[1]} r={Rpx} fill="none" stroke={COLORS.circle} strokeWidth={2.6} data-ia-circle />
              <text x={X(lab.r * 1.04 * Math.cos(-0.26))} y={Y(lab.r * 1.04 * Math.sin(-0.26)) + 5} fontSize={fs} fontWeight={800} fill="#ECFDF5" stroke="#14532D" strokeWidth={3} paintOrder="stroke" {...TP}>(𝒞)</text>
              {/* l'arc intercepté */}
              <path d={interceptPath} fill="none" stroke={onCircle ? COLORS.arc : '#FDA4AF'} strokeWidth={6} strokeLinecap="round" opacity={0.9} data-ia-intercept={interceptSpan <= 180 ? 'minor' : 'major'} />
              {innerPath && <path d={innerPath} fill="none" stroke={COLORS.near} strokeWidth={6} strokeLinecap="round" data-ia-near-arc />}
              {/* l'angle au centre */}
              <line x1={O[0]} y1={O[1]} x2={Apx[0]} y2={Apx[1]} stroke={COLORS.central} strokeWidth={2.4} />
              <line x1={O[0]} y1={O[1]} x2={Bpx[0]} y2={Bpx[1]} stroke={COLORS.central} strokeWidth={2.4} />
              <path d={centralArc.path} fill="none" stroke={COLORS.central} strokeWidth={2.2} />
              <text x={centralArc.label[0]} y={centralArc.label[1]} textAnchor="middle" fontSize={fs - 1} fontWeight={800} fill={COLORS.central} stroke="#F0FDF4" strokeWidth={3} paintOrder="stroke" {...TP}>{`${L.degText(lab.central)}°`}</text>
              {/* مزيان : le diamètre [AD], OA = OB, l'angle droit en B */}
              {atDiameter && (
                <g data-ia-mezian>
                  <line x1={Apx[0]} y1={Apx[1]} x2={Mpx[0]} y2={Mpx[1]} stroke={COLORS.diameter} strokeWidth={3} strokeDasharray="7 4" />
                  <line x1={Bpx[0]} y1={Bpx[1]} x2={Mpx[0]} y2={Mpx[1]} stroke="#FFFFFF" strokeWidth={1.4} opacity={0.6} />
                  <RightMark at={Bpx} a={Apx} b={Mpx} />
                  <Tick a={O} b={Apx} /><Tick a={O} b={Bpx} />
                </g>
              )}
              {/* les marques des essais : la mémoire du lab */}
              {marks.map((tr, i) => {
                const p = px(L.pointOf(lab, tr));
                const color = tr.refused ? COLORS.refused : tr.kind === 'minor' ? '#F59E0B' : tr.kind === 'interior' ? COLORS.near : '#34D399';
                return (
                  <g key={`${tr.t}-${tr.rho}-${i}`} data-ia-mark={tr.kind} opacity={0.85}>
                    <circle cx={p[0]} cy={p[1]} r={4.5} fill={color} stroke="#064E3B" strokeWidth={1} />
                    {showAngle && !narrow && !(tr.t === pos.t && tr.rho === pos.rho) && <text x={p[0] + 6} y={p[1] - 5} fontSize={10} fontWeight={700} fill="#F8FAFC" stroke="#064E3B" strokeWidth={2.5} paintOrder="stroke" {...TP}>{`${L.degText(tr.angle)}°`}</text>}
                  </g>
                );
              })}
              {/* les lignes de tir et l'angle au sommet */}
              {showInner && meas.A2 && (
                <g data-ia-chords>
                  <line x1={Apx[0]} y1={Apx[1]} x2={px(meas.A2)[0]} y2={px(meas.A2)[1]} stroke={COLORS.near} strokeWidth={1.6} strokeDasharray="5 4" />
                  <line x1={Bpx[0]} y1={Bpx[1]} x2={px(meas.B2)[0]} y2={px(meas.B2)[1]} stroke={COLORS.near} strokeWidth={1.6} strokeDasharray="5 4" />
                  <Name p={px(meas.A2)} o={O} name="A′" color="#E0F2FE" fs={fs} />
                  <Name p={px(meas.B2)} o={O} name="B′" color="#E0F2FE" fs={fs} />
                </g>
              )}
              <g data-ia-shot={refusedNow ? 'refused' : 'ok'}>
                <line x1={Mpx[0]} y1={Mpx[1]} x2={Apx[0]} y2={Apx[1]} stroke={refusedNow ? COLORS.refused : COLORS.shot} strokeWidth={3} strokeDasharray={refusedNow ? '7 5' : undefined} strokeLinecap="round" />
                <line x1={Mpx[0]} y1={Mpx[1]} x2={Bpx[0]} y2={Bpx[1]} stroke={refusedNow ? COLORS.refused : COLORS.shot} strokeWidth={3} strokeDasharray={refusedNow ? '7 5' : undefined} strokeLinecap="round" />
                <path d={shotArc.path} fill="none" stroke={refusedNow ? COLORS.refused : COLORS.shot} strokeWidth={2.4} />
                <text x={shotArc.label[0]} y={shotArc.label[1]} textAnchor="middle" fontSize={fs} fontWeight={900} fill={refusedNow ? '#FFE4E6' : '#FEF3C7'} stroke="#14532D" strokeWidth={3.5} paintOrder="stroke" {...TP} data-ia-shot-label>
                  {showAngle ? `${onCircle ? '' : '≈ '}${L.degText(Math.round(meas.angle * 10) / 10)}°` : '?'}
                </text>
              </g>
              {/* les poteaux, le point central O */}
              <Post p={Apx} /><Post p={Bpx} />
              <Name p={Apx} o={O} name="A" color="#FFFFFF" fs={fs + 1} />
              <Name p={Bpx} o={O} name="B" color="#FFFFFF" fs={fs + 1} />
              <circle cx={O[0]} cy={O[1]} r={4.5} fill="#FFFFFF" stroke={COLORS.central} strokeWidth={2} />
              <text x={O[0] + 8} y={O[1] + 16} fontSize={fs + 1} fontWeight={800} fill="#FFFFFF" stroke="#14532D" strokeWidth={3} paintOrder="stroke" {...TP}>O</text>
              {/* le tireur au maillot vert, le ballon au sommet */}
              <g transform={`translate(${playerAt[0]}, ${playerAt[1]})`} aria-hidden="true" data-deco="striker" pointerEvents="none">
                <PlayerFigure index={1} team={1} size={pw} />
              </g>
              <g transform={`translate(${Mpx[0]}, ${Mpx[1]})`} pointerEvents="none">
                <circle r={7} fill="#FFFFFF" stroke="#0F172A" strokeWidth={1.6} />
                <path d="M0 -3.2 L3 -1 L1.9 2.6 L-1.9 2.6 L-3 -1 Z" fill="#0F172A" />
              </g>
              <text x={Mpx[0] + side90[0] * 20} y={Mpx[1] + side90[1] * 20 + 5} textAnchor="middle" fontSize={fs + 1} fontWeight={900} fill="#FEF3C7" stroke="#14532D" strokeWidth={3.5} paintOrder="stroke" {...TP}>{lab.name}</text>
            </svg>
            {/* la poignée clavier : le sommet tenu (≥ 44 px) */}
            <div role="slider" tabIndex={0} aria-label={m('handle')} aria-valuemin={0} aria-valuemax={359} aria-valuenow={pos.t}
              aria-valuetext={m('handleText', { t: pos.t, position: positionLabel })} onKeyDown={onKeyDown} onBlur={() => { if (settle.current) commitNow(); }}
              data-ia-handle={pos.t} data-ia-rho={pos.rho}
              className="absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-300/90 outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
              style={{ left: Mpx[0], top: Mpx[1], cursor: dragging ? 'grabbing' : 'grab' }} />
          </div>
          <div className={wide ? 'w-[250px] space-y-2' : 'space-y-1.5'}>
            {readings}
            {betRow}
            {rotateButtons}
            {stageCard}
          </div>
        </div>
        <p role="status" className={`min-h-[2.5rem] ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug`} data-ia-verdict={verdictKind}>{verdict}</p>
      </div>

      {lab.trials.length > 0 && (
        <LabFold id="inscribed-angle.trials" title={k('trialsTitle')}>
          <ul className="space-y-0.5 text-xs" data-ia-trials={lab.trials.length}>
            {lab.trials.slice(-8).map((tr, i) => (
              <li key={i} className={tr.refused ? 'text-rose-800' : tr.kind === 'major' || tr.kind === 'diameter' ? 'text-emerald-800' : 'text-amber-800'}>
                <MathText>{m(`trial_${tr.kind}`, { t: tr.t, angle: deg(tr.angle), aod: deg(L.aodOf(lab, tr)) })}</MathText>
              </li>
            ))}
          </ul>
        </LabFold>
      )}
    </div>
  );
}

/** Les nombres des égalités de مزيان, prêts pour KaTeX. */
const mzTex = (n) => ({ bad: deg(n.BAD), adb: deg(n.ADB), aob: deg(n.AOB) });

/** Un nom de point, posé à l'extérieur (loin de O), en LTR avec un halo. */
function Name({ p, o, name, color, fs }) {
  const dx = p[0] - o[0]; const dy = p[1] - o[1]; const l = Math.hypot(dx, dy) || 1;
  const x = p[0] + (dx / l) * 16;
  const y = p[1] + (dy / l) * 16 + 5;
  return <text x={x} y={y} textAnchor="middle" fontSize={fs} fontWeight={900} fill={color} stroke="#14532D" strokeWidth={3.5} paintOrder="stroke" style={TP.style} fontFamily={TP.fontFamily}>{name}</text>;
}
function Post({ p }) {
  return <circle cx={p[0]} cy={p[1]} r={5.5} fill="#FFFFFF" stroke="#0F172A" strokeWidth={2} />;
}
function Tick({ a, b }) {
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const dx = b[0] - a[0]; const dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1;
  const n = [-dy / l, dx / l];
  return <line x1={m[0] - n[0] * 6} y1={m[1] - n[1] * 6} x2={m[0] + n[0] * 6} y2={m[1] + n[1] * 6} stroke="#FFFFFF" strokeWidth={2.2} />;
}
function RightMark({ at, a, b, size = 10 }) {
  const u = (p) => { const dx = p[0] - at[0]; const dy = p[1] - at[1]; const l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
  const u1 = u(a); const u2 = u(b);
  const p1 = [at[0] + u1[0] * size, at[1] + u1[1] * size];
  const p3 = [at[0] + u2[0] * size, at[1] + u2[1] * size];
  const p2 = [p1[0] + u2[0] * size, p1[1] + u2[1] * size];
  return <polyline points={[p1, p2, p3].map((q) => q.join(',')).join(' ')} fill="none" stroke="#FDE68A" strokeWidth={1.8} />;
}

/** La surface de réparation vue d'en haut, la ligne de but (la corde AB prolongée), le but, la tribune : DÉCOR pur. */
function Pitch({ S, goalY, Apx, Bpx, uid, reduce }) {
  const [wave, setWave] = useState(0);
  const stripes = 8;
  const standH = Math.max(18, Math.min(goalY - 10, S * 0.13));
  const netDepth = Math.max(8, Math.min(S * 0.06, goalY - standH - 4));
  const fans = Math.max(10, Math.round(S / 18));
  return (
    <g data-deco="football">
      <style>{`.ia-wave-${uid}{transition:transform .35s ease-out}@media (prefers-reduced-motion: reduce){.ia-wave-${uid}{transition:none}}`}</style>
      {Array.from({ length: stripes }, (_, i) => (
        <rect key={i} x={0} y={(i * S) / stripes} width={S} height={S / stripes + 1} fill={i % 2 ? '#15803D' : '#16A34A'} aria-hidden="true" />
      ))}
      {/* la tribune, ses supporters : un toucher lance la vague */}
      <g aria-hidden="true" onPointerDown={(e) => { e.stopPropagation(); setWave((n) => n + 1); }} style={{ cursor: 'pointer' }}>
        <rect x={0} y={0} width={S} height={standH} fill={`url(#${uid}-stand)`} />
        {Array.from({ length: fans }, (_, i) => {
          const x = ((i + 0.5) * S) / fans;
          const up = !reduce && wave > 0 && (i + wave) % 3 === 0;
          const kit = i % 3 === 0 ? '#16A34A' : i % 3 === 1 ? '#F8FAFC' : '#DC2626';
          return (
            <g key={i} className={`ia-wave-${uid}`} style={{ transform: up ? 'translateY(-3px)' : 'none' }}>
              <circle cx={x} cy={standH * 0.42} r={Math.max(2.4, S / 130)} fill="#FCD34D" />
              <rect x={x - S / 120} y={standH * 0.55} width={S / 60} height={standH * 0.35} rx={1.5} fill={kit} />
            </g>
          );
        })}
        {/* deux drapeaux vert-blanc au croissant rouge, schématiques */}
        {[0.12, 0.88].map((f) => (
          <g key={f} transform={`translate(${S * f}, ${standH * 0.12})`}>
            <rect x={0} y={0} width={14} height={9} fill="#16A34A" /><rect x={7} y={0} width={7} height={9} fill="#F8FAFC" />
            <circle cx={7} cy={4.5} r={2.3} fill="#DC2626" /><circle cx={7.8} cy={4.5} r={1.9} fill="#16A34A" />
          </g>
        ))}
      </g>
      {/* la ligne de but et le but (le filet derrière la ligne, entre les poteaux) */}
      <line x1={0} y1={goalY} x2={S} y2={goalY} stroke="#ECFDF5" strokeWidth={2} opacity={0.85} aria-hidden="true" />
      <g aria-hidden="true" opacity={0.75}>
        <rect x={Math.min(Apx[0], Bpx[0])} y={goalY - netDepth} width={Math.abs(Bpx[0] - Apx[0])} height={netDepth} fill="none" stroke="#F8FAFC" strokeWidth={1.5} />
        {Array.from({ length: 9 }, (_, i) => {
          const x = Math.min(Apx[0], Bpx[0]) + ((i + 1) * Math.abs(Bpx[0] - Apx[0])) / 10;
          return <line key={i} x1={x} y1={goalY - netDepth} x2={x} y2={goalY} stroke="#F8FAFC" strokeWidth={0.6} />;
        })}
      </g>
      {/* la surface de réparation : des lignes fines, sans mesure */}
      <rect x={S * 0.1} y={goalY} width={S * 0.8} height={S * 0.36} fill="none" stroke="#ECFDF5" strokeWidth={1.2} opacity={0.35} aria-hidden="true" />
      <rect x={S * 0.3} y={goalY} width={S * 0.4} height={S * 0.12} fill="none" stroke="#ECFDF5" strokeWidth={1.2} opacity={0.35} aria-hidden="true" />
    </g>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/**
 * La suite de l'étape `id`. striker : le grand arc (lecture · prédiction), le contraste (hors règle · règle). act4 : مزيان (le complément · le rapport),
 * هوارية (la valeur · le centre), l'intérieur (la demi-somme · règle).
 */
export function chainOf(mode, id) {
  if (mode === 'striker') return id === 'major' ? ['read', 'predict'] : ['off', 'rule'];
  if (id === 'mezian') return ['bad', 'ratio'];
  if (id === 'houaria') return ['same', 'centre'];
  return ['inner', 'rule'];
}

const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const angleOf = (lab) => `\\widehat{A${lab.name}B}`;

/** Chaque question est construite sur LES nombres de l'élève (l'angle au centre, ses essais) ; `k` : les textes de `inscribedAngle`. */
export const QUESTIONS = {
  read: ({ lab }, k) => {
    const o = { T: `$${angleOf(lab)}$`, c: deg(lab.central), n: L.distinctMajor(lab).length };
    return {
      id: 'read', kind: 'number', expected: L.degText(lab.inscribed), answer: <MathText>{`$${deg(lab.inscribed)}^{\\circ}$`}</MathText>,
      prompt: Cq(k, 'read.prompt', o), hints: [Cq(k, 'read.hint1', o), Cq(k, 'read.hint2', o)], explain: Cq(k, 'read.explain', { ...o, a: deg(lab.inscribed) }),
    };
  },
  predict: ({ lab }, k) => {
    const c2 = lab.central === 80 ? 100 : 80;
    const o = { c: deg(lab.central), a: deg(lab.inscribed), c2, a2: c2 / 2, T: `$${angleOf(lab)}$` };
    return {
      id: 'predict', kind: 'number', expected: String(c2 / 2), answer: <MathText>{`$${c2 / 2}^{\\circ}$`}</MathText>,
      prompt: Cq(k, 'predict.prompt', o), hints: [Cq(k, 'predict.hint1', o), Cq(k, 'predict.hint2', o)], explain: Cq(k, 'predict.explain', o),
    };
  },
  off: ({ lab }, k) => {
    const tr = L.lastContrast(lab);
    const where = tr.position === 'on' ? 'minor' : tr.position;
    const o = { T: `$${angleOf(lab)}$`, where: k(`cp.where.${where}`), angle: deg(tr.angle), a: deg(lab.inscribed) };
    return {
      id: 'off', kind: 'choice', cols: 1, prompt: Cq(k, 'off.prompt', o),
      options: [
        { text: Cq(k, 'off.same', o), why: Cq(k, 'off.whySame', o) },
        { text: Cq(k, 'off.changes', o), correct: true },
        { text: Cq(k, 'off.closer', o), why: Cq(k, 'off.whyCloser', o) },
      ],
      hints: [Cq(k, 'off.hint1', o), Cq(k, 'off.hint2', o)], explain: Cq(k, 'off.explain', o),
    };
  },
  bad: ({ lab }, k) => {
    const z = L.mezianNumbers(lab);
    const o = { adb: deg(z.ADB), aob: deg(z.AOB), bad: deg(z.BAD) };
    return {
      id: 'bad', kind: 'number', expected: L.degText(z.BAD), answer: <MathText>{`$${deg(z.BAD)}^{\\circ}$`}</MathText>,
      prompt: Cq(k, 'bad.prompt', o), hints: [Cq(k, 'bad.hint1', o), Cq(k, 'bad.hint2', o)], explain: Cq(k, 'bad.explain', o),
    };
  },
  ratio: ({ lab }, k) => {
    const z = L.mezianNumbers(lab);
    const o = { adb: deg(z.ADB), aob: deg(z.AOB) };
    return {
      id: 'ratio', kind: 'number', expected: String(L.clean(z.AOB / z.ADB)), answer: <MathText>{`$${L.clean(z.AOB / z.ADB)}$`}</MathText>,
      prompt: Cq(k, 'ratio.prompt', o), hints: [Cq(k, 'ratio.hint1', o), Cq(k, 'ratio.hint2', o)], explain: Cq(k, 'ratio.explain', o),
    };
  },
  same: ({ lab }, k) => {
    const o = { n: L.distinctMajor(lab, 'houaria').length, a: deg(lab.inscribed), aob: deg(lab.central) };
    return {
      id: 'same', kind: 'number', expected: L.degText(lab.inscribed), answer: <MathText>{`$${deg(lab.inscribed)}^{\\circ}$`}</MathText>,
      prompt: Cq(k, 'same.prompt', o), hints: [Cq(k, 'same.hint1', o), Cq(k, 'same.hint2', o)], explain: Cq(k, 'same.explain', o),
    };
  },
  centre: ({ lab }, k) => {
    const o = { a: deg(lab.inscribed) };
    return {
      id: 'centre', kind: 'choice', cols: 1, prompt: Cq(k, 'centre.prompt', o),
      options: [
        { text: Cq(k, 'centre.bigger', o), why: Cq(k, 'centre.whyBigger', o) },
        { text: Cq(k, 'centre.none', o), correct: true },
        { text: Cq(k, 'centre.smaller', o), why: Cq(k, 'centre.whySmaller', o) },
      ],
      hints: [Cq(k, 'centre.hint1', o), Cq(k, 'centre.hint2', o)], explain: Cq(k, 'centre.explain', o),
    };
  },
  inner: ({ lab }, k) => {
    const tr = L.lastOf(lab, 'interior');
    const o = { angle: deg(tr.angle), far: deg(tr.far), near: deg(tr.near), half: deg(lab.inscribed), sum: deg(tr.far + tr.near) };
    return {
      id: 'inner', kind: 'choice', cols: 1, prompt: Cq(k, 'inner.prompt', o),
      options: [
        { text: Cq(k, 'inner.halfSum', o), correct: true },
        { text: Cq(k, 'inner.halfCentral', o), why: Cq(k, 'inner.whyHalfCentral', o) },
        { text: Cq(k, 'inner.sum', o), why: Cq(k, 'inner.whySum', o) },
      ],
      hints: [Cq(k, 'inner.hint1', o), Cq(k, 'inner.hint2', o)], explain: Cq(k, 'inner.explain', o),
    };
  },
  rule: ({ lab, options, formal }, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k(`${lab.mode}.dPrompt`)}</MathText>, options,
    hints: [Cq(k, `rule.${lab.mode}.hint1`), Cq(k, `rule.${lab.mode}.hint2`)], explain: formal,
  }),
};
