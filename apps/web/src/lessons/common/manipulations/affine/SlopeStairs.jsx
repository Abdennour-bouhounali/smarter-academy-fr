import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import LabFold from '../primitives/LabFold';
import MathText from '../../components/MathText';
import { planeGeometry, ticks, niceStep } from '../logic/originLine';
import * as L from '../logic/slopeStairs';

/**
 * slope-stairs — L'ESCALIER DES ACCROISSEMENTS (unité 7 « الدالة التآلفية », leçon 3 « تعيين دالة
 * تآلفية انطلاقًا من عددين وصورتيهما » : نشاط 4 « تناسب التغيّرات » p. 79 et le تحدّ °C → °F p. 77).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève DÉPLACE deux nombres x₁ et x₂ sur l'axe des abscisses — en saisissant le plan n'importe
 *    où (le marqueur le plus proche suit le doigt le long de la droite), en glissant leurs poignées sous
 *    l'axe, aux flèches du clavier ou aux boutons −/+. Il les pose sur deux marques du manuel pour
 *    COMPLÉTER l'escalier de la figure, ou n'importe où ; il en pose un sur 0 pour lire b.
 * B. Idée : تناسب التغيّرات — (f(x₁) − f(x₂)) ÷ (x₁ − x₂) est le MÊME nombre pour tous les couples de
 *    nombres distincts : le coefficient a. Deux nombres et leurs images suffisent donc à trouver a, puis
 *    b = f(x₁) − a·x₁ (le pied de l'escalier, en x = 0).
 * C. Pendant le geste, la marche se dessine entre les deux points de la droite : la flèche horizontale
 *    (x₁ − x₂) et la flèche verticale (f(x₁) − f(x₂)) grandissent ensemble ; le quotient s'écrit en
 *    direct. Dans le stade, la carte d'abonnement se tamponne et les supporters passent le tourniquet.
 * D. La fraction du manuel écrite avec les nombres de l'élève : \dfrac{f(4) − f(1)}{4 − 1} = \dfrac{600}{3}
 *    = 200 ; les marches de la figure se remplissent ; b = f(0) = f(4) − 200 × 4 = 2000.
 * E. À découvrir avant la règle : le quotient ne dépend PAS de la marche choisie (petite, grande, à
 *    l'envers) ; en mode « deux couples », une seule marche donne a, et 0 donne b.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        تناسب التغيّرات : a = (f(x₁) − f(x₂)) / (x₁ − x₂) ; puis b = f(x₁) − a·x₁ ⇒ f(x) = ax + b
 *   OBJECT         la droite de f et une MARCHE entre deux de ses points (l'escalier de la figure du manuel)
 *   VARIABLE       x₁ et x₂ — deux nombres que la main déplace (nœuds exacts de l'axe)
 *   INVARIANT      le quotient des accroissements (= a) : il ne bouge pas quand la marche change de place,
 *                  de largeur ou de sens
 *   TRANSFORMATION la marche (largeur, hauteur), la fraction écrite, les marches « … » du manuel remplies
 *   CONSTRAINT     x₁ ≠ x₂ ; en mode « deux couples », une image doit être CONNUE
 *   RESISTANCE     x₁ = x₂ : la marche s'écrase, les deux points tremblent, « $\dfrac{0}{0}$ — القسمة على 0
 *                  مستحيلة » ; un nombre d'image inconnue : « صورته مجهولة » tant que a n'est pas trouvé
 *   EVIDENCE       la liste des marches de l'élève et leurs quotients (tous égaux) ; l'escalier rempli
 *   CONTRAST       trois marches dont DEUX largeurs différentes (et, si l'élève la fait, une marche à
 *                  l'envers) ; en mode deux couples : la marche ET la descente à 0
 *   PREDICTION     les « … » du manuel se calculent avant de poser la marche ; b avant de descendre
 *   DISCOVERY      « هو نفسه في كل الدرجات: a » (distracteurs réfutés par les marches de l'élève : « il
 *                  grandit avec la marche », « c'est la différence des images ») ; en mode deux couples,
 *                  l'expression de f (distracteurs : a = 36, b = 50 ÷ 10)
 *   FORMALIZATION  \dfrac{f(x_1) - f(x_2)}{x_1 - x_2} = a ; b = f(0) = f(x₁) − a·x₁ ; f(x) = ax + b
 *   TRANSFER       le تحدّ (10 ; 50), (30 ; 86) → 1,8x + 32 (module 2) ; la méthode « جملة معادلتين » ;
 *                  أوظّف et la banque d'exercices (a négatif, fractionnaire, couples en tableau / graphe)
 *
 * QUESTIONS PENDANT LE LABO (2026-10-28, lot 5) : à la fin de chaque étape (`L.stepsOf` : rule = première marche · contraste ;
 * points = a · b) une suite de questions se pose PAR-DESSUS le labo (`CHAINS`) et retient la suite ; la dernière étape finit par LA RÈGLE.
 * Étapes `LabStepper` (`[data-ss-step=<i>]`) + fête ; « إعادة » repart de zéro ; obligatoires pour tout élève, coupées par l'enseignant
 * pour SON compte (`useLabCheckpointSettings`) ; `checkpoints` = false les coupe aussi ; `onCheckpoint(ev)` : la trace pour les étapes du module.
 *
 * Manuel (§6bis) : chaque marche est un essai, chaque marque une décision — pas d'auto-complétion.
 *
 * DÉCOR (exigence du propriétaire) — sans information, sans état du lab : `stadium` (نشاط 4) — les
 * tribunes derrière la droite, la carte d'abonnement dont les cases se tamponnent jusqu'au plus grand des
 * deux nombres (les matchs de la marche en couleur), les supporters qui passent le tourniquet à chaque
 * marche ; `thermo` (تحدّ) — un thermomètre gradué en °C SEULEMENT (une graduation °F donnerait b),
 * dont le mercure suit le plus grand des deux nombres. `aria-hidden`, `tabIndex={-1}`, `[data-deco]`,
 * immobiles sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (MANIPULATION_CONTRACT §8bis) : le plan est budgeté sur la hauteur de l'écran de leçon
 * (`useLessonViewport`) moins les commandes mesurées ; large (≥ 620 px) : plan et commandes côte à côte ;
 * sinon les commandes juste dessous. Les poignées sont COLLÉES sous l'axe des abscisses ; le secondaire
 * (la liste des marches) est dans un `LabFold` sous le bloc « glance ».
 *
 * PROPS :
 *   rule     f connue, écriture du manuel (« 200x+2000 », « 50x+100 », « -3x+12 »)
 *   marks    « 0|1|4|6|10|12|15 » : l'escalier du manuel à compléter (marches entre marques consécutives)
 *   shown    nombre de marches de tête déjà écrites (le manuel imprime 200, puis 3 et 600 : shown=2)
 *   points   « 10:50|30:86 » : DEUX couples donnés, f inconnue (exclusif de `rule`)
 *   xMin xMax yMin yMax  la fenêtre (chaînes) ; 0 y est toujours
 *   theme    'stadium' (défaut) | 'thermo' — mots dans lesson.json › manipulation.slopeStairs.themes
 *   title lead mission level levels  comme les autres types ; onTrial(t) à chaque essai validé,
 *   onFinished({ mode, a, b }) à la règle formelle — tous deux par `state.report`.
 *
 * CONTRAT DOM : [data-slope-stairs][data-mode][data-theme][data-m1][data-m2][data-found][data-layout],
 * [data-ss-glance], [data-ss-plane][data-w][data-h], [data-ss-line], [data-ss-given], [data-ss-ghost=<i>]
 * [data-filled][data-printed], [data-ss-stair][data-q], [data-ss-point=1|2], [data-ss-b], [data-ss-strip],
 * [data-ss-handle=1|2], [data-ss-less=1|2], [data-ss-more=1|2], [data-ss-reading][data-q], [data-ss-fill]
 * [data-done][data-total], [data-ss-verdict=<kind>], [data-ss-bgoal], [data-ss-trial][data-kind],
 * [data-ss-formal], [data-deco].
 */
const GAP = 12;
const STRIP = 48;
const TITLE_H = 18;
const COL = { stair: '#D97706', rise: '#2563EB', ghost: '#94A3B8', filled: '#059669', line: '#0F172A', refuse: '#E11D48' };
const SUB = ['x₁', 'x₂'];

export default function SlopeStairs({
  rule, marks, points, shown, xMin, xMax, yMin, yMax, theme: theme0 = 'stadium',
  title, lead, mission, level, levels: withLevels = true, initialMode = 'student', allowModeSwitch = false,
  checkpoints: cpOn = true, onTrial, onFinished, onCheckpoint,
}) {
  const { t, i18n } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.slopeStairs.${key}`, o), [t]);
  const reduce = useReducedMotion();
  const state = useManipulation({
    type: 'slope-stairs',
    // la fonction (ou les deux couples) et l'escalier sont les NOMBRES du niveau (levels.js) ; le monde,
    // `shown` et la fenêtre ne valent que sur le niveau de la leçon.
    initialNumbers: points ? { points: String(points) } : { rule: rule == null ? undefined : String(rule), ...(marks ? { marks: String(marks) } : {}) },
    initialMode, initialLevel: level, withLevels, hintCount: 3,
  });
  const nums = state.numbers;
  const authored = state.isAuthoredLevel;
  const theme = authored && L.THEMES.includes(theme0) ? theme0 : 'stadium';
  const tw = useCallback((key, o) => t(`manipulation.slopeStairs.themes.${theme}.${key}`, o), [t, theme]);
  const make = () => L.init({ ...nums, ...(authored ? { shown, xMin, xMax, yMin, yMax } : {}) });
  const [lab, setLab] = useState(make);
  const sceneKey = `${nums.rule ?? ''}:${nums.marks ?? ''}:${nums.points ?? ''}:${state.epoch}:${state.resetCount}:${authored}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [cleared, setCleared] = useState([]);   // les étapes dont la suite de questions est finie
  // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la marche, les essais et les questions du labo
  if (scene.key !== sceneKey) { setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(make()); setCleared([]); }

  const ready = L.discoveryReady(lab);
  const cpSettings = useLabCheckpointSettings('slope-stairs');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpLive = cpOn && cpSettings.enabled;
  const steps = L.stepsOf(lab);
  const ruleStep = steps[steps.length - 1];
  const active = cpLive ? steps.find((st) => !cleared.includes(st)) ?? null : null;
  const reachedActive = !!active && L.stepReached(lab, active);
  const cp = useLabCheckpoint({
    id: active,
    questions: reachedActive ? chainOf(lab, active).map((q) => QUESTIONS[q](lab, k)) : null,
    reached: reachedActive,
    resetKey: scene.inits,
    onRetry: () => setLab(L.restartStep(lab, active, make())),
    onEvent: (ev) => state.report(onCheckpoint, ev),   // {tk:'checkpoint'|'checkpoint-done', id: étape, …} — la TRACE que les étapes du module relisent
    onDone: (id) => {
      setCleared((c) => (c.includes(id) ? c : [...c, id]));
      if (id === ruleStep) { state.discover(); state.formalize(); }
    },
  });
  useEffect(() => { if (ready && !cpLive) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps

  // une étape est FAITE quand son objectif est atteint ET sa suite de questions répondue : la pastille passe au vert et on fête
  const stepDone = steps.map((st) => L.stepReached(lab, st) && (!cpLive || cleared.includes(st)));
  const nDone = stepDone.findIndex((d) => !d) < 0 ? stepDone.length : stepDone.findIndex((d) => !d);
  const party = useStepCelebration();
  const celebrated = useRef({ n: 0, inits: scene.inits });
  if (celebrated.current.inits !== scene.inits) celebrated.current = { n: 0, inits: scene.inits };   // « إعادة » : on refête
  useEffect(() => {
    if (nDone <= celebrated.current.n) return;
    celebrated.current.n = nDone;
    party.celebrate({ n: nDone, total: stepDone.length });
  }, [nDone]); // eslint-disable-line react-hooks/exhaustive-deps
  const blockedRef = useRef(false);
  blockedRef.current = cp.blocking;
  // le son du GESTE (muet sans « الصوت ») : « tooth » une marche, « bell » une marche du manuel remplie, « flag » a ou b trouvé, « over » un refus
  useEffect(() => {
    const last = lab.last;
    if (!last) return;
    if (last.kind !== 'stair') playSfx('over');
    else if (last.first || last.readB) playSfx('flag');
    else if (last.newGhost) playSfx('bell');
    else playSfx('tooth');
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps
  const heard = useRef(0);
  const tick = () => { const now = Date.now(); if (now - heard.current > 35) { playSfx('tooth'); heard.current = now; } };
  useEffect(() => {
    if (state.isFormal) state.report(onFinished, { mode: lab.mode, a: lab.found ? L.numText(lab.f.a) : null, b: lab.found ? L.numText(lab.f.b) : null });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials === 0) return;
    state.report(onTrial, trialReport(lab.trials[nTrials - 1], lab));
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps
  const [shake, setShake] = useState(0);
  useEffect(() => { if (lab.last && lab.last.kind !== 'stair') setShake((v) => v + 1); }, [lab.last]);

  /* ── mesure : la largeur de la scène et la HAUTEUR de l'écran de leçon ── */
  const boxRef = useRef(null);
  const ctrlRef = useRef(null);
  const [width, setWidth] = useState(320);
  const [ctrlH, setCtrlH] = useState(240);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(200, Math.floor(el.clientWidth)));
      if (ctrlRef.current) setCtrlH(Math.ceil(ctrlRef.current.getBoundingClientRect().height));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (ctrlRef.current) ro.observe(ctrlRef.current);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 576;
  const budget = Math.max(300, screenH - 8);
  const wide = width >= 620;
  const narrow = width < 360;

  /* ── géométrie ── */
  const { win, snap } = lab;
  const snapN = L.toNum(snap);
  const planeCol = wide ? Math.floor((width - GAP) * 0.6) : width;
  const availH0 = (wide ? budget : budget - ctrlH - GAP) - 2 * TITLE_H - STRIP - 6;
  const yTickCount = Math.max(3, Math.min(10, Math.floor(Math.max(140, availH0) / 34)));
  const yStep = useMemo(() => niceStep(win.yMax - win.yMin, yTickCount), [win.yMax, win.yMin, yTickCount]);
  const yTicks = useMemo(() => ticks(win.yMin, win.yMax, yStep), [win.yMin, win.yMax, yStep]);
  const gutter = 8 + Math.max(...yTicks.map((v) => L.numText(v).length)) * 6.6;
  const availW = Math.max(150, planeCol - gutter);
  const availH = Math.max(narrow ? 118 : 140, Math.min(availH0, Math.round(availW * 0.95)));
  const geo = useMemo(() => planeGeometry({ win, width: availW, height: availH, orthonormal: false, pad: 14 }), [win, availW, availH]);
  const W = Math.round(geo.W);
  const H = Math.round(geo.H);
  const FW = Math.round(W + gutter);

  /* ── les deux nombres ── */
  const x1 = L.valueAt(lab.m[0], snap);
  const x2 = L.valueAt(lab.m[1], snap);
  const live = L.stairOf(lab, x1, x2);
  const liveWhy = live ? null : L.canStair(lab, x1, x2);
  const f = L.fnOf(lab);
  const yOf = (x) => L.imageAt(lab, x);

  /* ── gestes : saisir le plan ou la piste (le marqueur le plus proche suit) ── */
  const [drag, setDrag] = useState(null);
  // Miroir synchrone de `lab` pour « جرّب كل الإمكانيات » : x₂ reste, x₁ parcourt la graduation.
  const labRef = useRef(lab);
  labRef.current = lab;
  const sweepFirst = (i) => {
    labRef.current = L.commit(L.move(labRef.current, 0, i));
    setLab((s) => L.commit(L.move(s, 0, i)));
  };
  const untriedFirst = L.untriedFirstMarkers(lab);
  const dragRef = useRef(null);
  const idxAt = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const v = geo.fromPx(e.clientX - r.left - gutter, 0).x;
    return Math.max(lab.range.min, Math.min(lab.range.max, Math.round(v / snapN)));
  };
  const onDown = (e) => {
    if (e.button > 0 || blockedRef.current) return;
    e.preventDefault();
    const i = idxAt(e);
    const tagged = e.target.closest?.('[data-ss-handle]')?.getAttribute('data-ss-handle');
    const which = tagged ? Number(tagged) - 1 : (Math.abs(i - lab.m[0]) <= Math.abs(i - lab.m[1]) ? 0 : 1);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = which;
    setDrag(which);
    setLab((s) => L.move(s, which, i));
  };
  const onMoveP = (e) => {
    if (dragRef.current == null) return;
    const which = dragRef.current;
    const i = idxAt(e);
    if (i !== lab.m[which]) tick();
    setLab((s) => L.move(s, which, i));
  };
  const onUp = (e) => {
    if (dragRef.current == null) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
    setDrag(null);
    setLab((s) => L.commit(s));
  };
  const pointer = { onPointerDown: onDown, onPointerMove: onMoveP, onPointerUp: onUp, onPointerCancel: onUp };

  // clavier et −/+ : un slider par nombre (useStretchInteraction : flèches, Page, Début/Fin, pause = essai)
  const range = useMemo(() => ({ min: lab.range.min, max: lab.range.max }), [lab.range.min, lab.range.max]);
  const noPointer = useCallback(() => 0, []);
  const s1 = useStretchInteraction({
    value: lab.m[0], range, direction: 'ltr', toValue: noPointer,
    onChange: (v) => { if (blockedRef.current) return; tick(); setLab((s) => L.move(s, 0, v)); },
    onCommit: (v) => { if (blockedRef.current) return; setLab((s) => L.commit(L.move(s, 0, v))); },
  });
  const s2 = useStretchInteraction({
    value: lab.m[1], range, direction: 'ltr', toValue: noPointer,
    onChange: (v) => { if (blockedRef.current) return; tick(); setLab((s) => L.move(s, 1, v)); },
    onCommit: (v) => { if (blockedRef.current) return; setLab((s) => L.commit(L.move(s, 1, v))); },
  });
  const sliders = [s1, s2];

  /* ── les mots ── */
  const phaseB = lab.mode === 'points' ? lab.found : state.isFormal;
  const missionText = mission ?? <MathText>{k(lab.mode === 'points' ? 'mission.points' : lab.ghosts.length ? 'mission.ruleFill' : 'mission.rule', {
    a: lab.given[0] ? L.numTex(lab.given[0].x) : '', b: lab.given[1] ? L.numTex(lab.given[1].x) : '',
  })}</MathText>;
  const hintKeys = [0, 1, 2].map((i) => k(`hints.${lab.mode}.${i}`));
  const verdict = verdictOf(lab, k);
  const fill = L.fillProgress(lab);
  const discoveryOptions = useMemo(() => discoveryFor(lab, k), [lab, k]);

  /* ── dessin ── */
  const P = (x, y) => [geo.px(L.toNum(x)), geo.py(L.toNum(y))];
  const xTickStep = Math.max(1, Math.ceil(24 / (geo.ux * snapN)));
  const xTicks = [];
  for (let i = lab.range.min; i <= lab.range.max; i++) xTicks.push(i);
  const lineSeg = f ? clipLine(f, win) : null;
  const axisY = geo.py(Math.max(win.yMin, Math.min(win.yMax, 0)));

  const ghostEls = lab.ghosts.map((g, i) => {
    const y0 = L.imageAt({ ...lab, found: true, f: lab.hidden }, g.from);
    const y1 = L.imageAt({ ...lab, found: true, f: lab.hidden }, g.to);
    const [ax, ay] = P(g.from, y0);
    const [bx] = P(g.to, y0);
    const [, by] = P(g.to, y1);
    const done = lab.filled[i];
    const known = done || g.printed;
    const c = done ? COL.filled : g.printed ? '#475569' : COL.ghost;
    return (
      <g key={`g${i}`} data-ss-ghost={i} data-filled={done ? 'true' : 'false'} data-printed={g.printed ? 'true' : 'false'}>
        <path d={`M${ax} ${ay} H${bx} V${by}`} fill="none" stroke={c} strokeWidth={known ? 1.8 : 1.4} strokeDasharray={known ? undefined : '4 3'} />
        <text x={(ax + bx) / 2} y={ay + 11} textAnchor="middle" fontSize={known ? 10 : 13} fontWeight="bold" fill={c} fontFamily="ui-monospace, monospace">{known ? L.numText(g.dx) : '…'}</text>
        <text x={bx + 3} y={(ay + by) / 2 + 3} textAnchor="start" fontSize={known ? 10 : 13} fontWeight="bold" fill={c} fontFamily="ui-monospace, monospace">{known ? L.numText(g.df).replace('-', '−') : '…'}</text>
      </g>
    );
  });

  let stairEl = null;
  if (live) {
    const { lo, hi, run, rise } = L.stairDraw(live);
    const [ax, ay] = P(lo.x, lo.y);
    const [bx] = P(hi.x, lo.y);
    const [, by] = P(hi.x, hi.y);
    const riseUp = L.toNum(rise) >= 0;
    stairEl = (
      <g data-ss-stair data-q={L.numText(live.q)}>
        <path d={`M${ax} ${ay} H${bx}`} stroke={COL.stair} strokeWidth={3} fill="none" markerEnd="url(#ss-arrow-h)" />
        <path d={`M${bx} ${ay} V${by}`} stroke={COL.rise} strokeWidth={3} fill="none" markerEnd="url(#ss-arrow-v)" />
        <Tag x={(ax + bx) / 2} y={ay + (riseUp ? 15 : -9)} text={L.numText(run)} color={COL.stair} W={W} />
        <Tag x={bx + (bx > W - 60 ? -26 : 26)} y={(ay + by) / 2 + 4} text={L.numText(rise).replace('-', '−')} color={COL.rise} W={W} />
      </g>
    );
  }

  const markerEls = [0, 1].map((w) => {
    const x = w === 0 ? x1 : x2;
    const y = yOf(x);
    const px = geo.px(L.toNum(x));
    if (y == null) {
      return (
        <g key={`m${w}`} data-ss-point={w + 1} data-known="false">
          <line x1={px} x2={px} y1={axisY} y2={geo.py(win.yMax)} stroke="#CBD5E1" strokeWidth={1} strokeDasharray="3 4" />
          <text x={px} y={axisY - 8} textAnchor="middle" fontSize={14} fontWeight="bold" fill={COL.refuse}>?</text>
        </g>
      );
    }
    const py = geo.py(L.toNum(y));
    const same = lab.m[0] === lab.m[1];
    return (
      <g key={`m${w}`} data-ss-point={w + 1} data-known="true">
        <line x1={px} x2={px} y1={axisY} y2={py} stroke={w === 0 ? '#7C3AED' : '#0891B2'} strokeWidth={1.2} strokeDasharray="4 3" />
        <g transform={`translate(${px} ${py})`}>
          <g key={`s${shake}`} className={same && shake ? 'ss-shake' : undefined}>
            <circle r={same ? 7 : 5.5} fill={same ? '#FFE4E6' : '#fff'} stroke={same ? COL.refuse : (w === 0 ? '#7C3AED' : '#0891B2')} strokeWidth={2.4} />
          </g>
        </g>
        <text x={px + (w === 0 ? -8 : 8)} y={py - 9} textAnchor={w === 0 ? 'end' : 'start'} fontSize={11} fontWeight="bold" fill={w === 0 ? '#6D28D9' : '#0E7490'} fontFamily="ui-monospace, monospace">{SUB[w]}</text>
      </g>
    );
  });

  const plane = (
    <div dir="ltr" className="mx-auto w-max max-w-full" data-ss-planeblock>
      <div className="relative" style={{ height: TITLE_H, width: FW }}>
        <span dir="rtl" className="absolute top-0 truncate whitespace-nowrap text-[11px] font-bold text-slate-600" style={{ left: gutter + Math.max(0, geo.px(0) + 4), maxWidth: FW - gutter - 4 }} data-ss-axis="y">{tw('yAxis')}</span>
      </div>
      <div
        className="relative cursor-ew-resize rounded-lg border border-slate-200 bg-white"
        style={{ width: FW, height: H, touchAction: 'none' }}
        {...pointer}
        role="group" aria-label={k('planeAria')}
        data-ss-plane data-w={W} data-h={H}
      >
        <svg width={FW} height={H} className="absolute inset-0" aria-hidden="true" focusable="false">
          <style>{SS_CSS}</style>
          <defs>
            <marker id="ss-arrow-h" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill={COL.stair} /></marker>
            <marker id="ss-arrow-v" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill={COL.rise} /></marker>
          </defs>
          {/* étiquettes de l'axe des ordonnées, dans la gouttière */}
          {yTicks.map((v) => (
            <text key={`ly${L.numText(v)}`} x={gutter - 4} y={geo.py(L.toNum(v)) + 3.5} textAnchor="end" fontSize={10} fill="#475569" fontFamily="ui-monospace, monospace">{L.numText(v).replace('-', '−')}</text>
          ))}
          <g transform={`translate(${gutter} 0)`}>
            {theme === 'stadium' && <Stands win={win} geo={geo} f={lab.hidden} />}
            {/* quadrillage */}
            {xTicks.map((i) => <line key={`gx${i}`} x1={geo.px(i * snapN)} x2={geo.px(i * snapN)} y1={geo.py(win.yMax)} y2={geo.py(win.yMin)} stroke="#E2E8F0" strokeWidth={1} />)}
            {yTicks.map((v) => <line key={`gy${L.numText(v)}`} x1={geo.px(win.xMin)} x2={geo.px(win.xMax)} y1={geo.py(L.toNum(v))} y2={geo.py(L.toNum(v))} stroke="#E2E8F0" strokeWidth={1} />)}
            {/* axes */}
            <line x1={geo.px(win.xMin)} x2={geo.px(win.xMax) + 6} y1={axisY} y2={axisY} stroke="#334155" strokeWidth={1.6} />
            <path d={`M${geo.px(win.xMax) + 8} ${axisY} l-7 -4 v8 z`} fill="#334155" />
            <line x1={geo.px(0)} x2={geo.px(0)} y1={geo.py(win.yMin)} y2={geo.py(win.yMax) - 6} stroke="#334155" strokeWidth={1.6} />
            <path d={`M${geo.px(0)} ${geo.py(win.yMax) - 8} l-4 7 h8 z`} fill="#334155" />
            {xTicks.map((i) => (i % xTickStep !== 0 ? null : (
              <text key={`tx${i}`} x={geo.px(i * snapN)} y={Math.min(H - 2, axisY + 12)} textAnchor="middle" fontSize={10} fill="#475569" fontFamily="ui-monospace, monospace">{L.numText(L.valueAt(i, snap)).replace('-', '−')}</text>
            )))}
            {/* l'escalier du manuel */}
            {ghostEls}
            {/* la droite (connue, ou trouvée) */}
            {lineSeg && (
              <line x1={geo.px(lineSeg[0][0])} y1={geo.py(lineSeg[0][1])} x2={geo.px(lineSeg[1][0])} y2={geo.py(lineSeg[1][1])}
                stroke={COL.line} strokeWidth={2.2} strokeLinecap="round" data-ss-line={L.ruleText(f)} />
            )}
            {/* les deux couples donnés (mode points) */}
            {lab.given.map((p) => {
              const [cx, cy] = P(p.x, p.y);
              return (
                <g key={`gv${L.numText(p.x)}`} data-ss-given={`${L.numText(p.x)}:${L.numText(p.y)}`}>
                  <path d={`M${cx} ${axisY} V${cy} H${geo.px(0)}`} fill="none" stroke="#F59E0B" strokeWidth={1.2} strokeDasharray="3 3" />
                  <circle cx={cx} cy={cy} r={5} fill="#F59E0B" stroke="#fff" strokeWidth={1.5} />
                  <text x={cx > W * 0.6 ? cx - 6 : cx + 6} y={cy + 14} textAnchor={cx > W * 0.6 ? 'end' : 'start'} fontSize={10} fontWeight="bold" fill="#B45309" fontFamily="ui-monospace, monospace">{`(${L.numText(p.x)} ; ${L.numText(p.y)})`}</text>
                </g>
              );
            })}
            {/* la marche de l'élève */}
            {stairEl}
            {markerEls}
            {/* b, au pied de l'escalier */}
            {lab.bRead && (
              <g data-ss-b={L.numText(lab.bRead.b)}>
                <circle cx={geo.px(0)} cy={geo.py(L.toNum(lab.bRead.b))} r={7} fill="none" stroke="#DB2777" strokeWidth={2.4} />
                <text x={geo.px(0) + 10} y={geo.py(L.toNum(lab.bRead.b)) + 4} fontSize={12} fontWeight="bold" fill="#BE185D" fontFamily="ui-monospace, monospace">b</text>
              </g>
            )}
          </g>
        </svg>
      </div>
      {/* la piste des deux nombres, collée sous l'axe */}
      <div className="relative" style={{ width: FW, height: STRIP, touchAction: 'none' }} {...pointer} data-ss-strip>
        <div className="absolute rounded-full bg-slate-300" style={{ left: gutter + geo.px(win.xMin), width: geo.px(win.xMax) - geo.px(win.xMin), top: STRIP / 2 - 2, height: 4 }} />
        {[0, 1].map((w) => {
          const x = w === 0 ? x1 : x2;
          const other = w === 0 ? x2 : x1;
          const d = geo.px(L.toNum(x)) - geo.px(L.toNum(other));
          const push = Math.abs(d) < 46 ? (d === 0 ? (w === 0 ? -1 : 1) : Math.sign(d)) * (46 - Math.abs(d)) / 2 : 0;
          const s = sliders[w];
          return (
            <div key={`h${w}`}
              {...s.handleProps({ label: k('markerAria', { name: SUB[w], v: L.numText(x) }), valueText: L.numText(x) })}
              className={`absolute top-1/2 z-10 flex h-11 min-w-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border-2 bg-white px-1 outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${drag === w ? 'shadow-md' : ''}`}
              style={{ left: gutter + geo.px(L.toNum(x)) + push, borderColor: w === 0 ? '#7C3AED' : '#0891B2', cursor: drag === w ? 'grabbing' : 'grab' }}
              data-ss-handle={w + 1}
            >
              <span className="whitespace-nowrap font-mono text-[11px] font-extrabold" style={{ color: w === 0 ? '#6D28D9' : '#0E7490' }}>{`${SUB[w]}=${L.numText(x).replace('-', '−')}`}</span>
            </div>
          );
        })}
      </div>
      <div className="relative" style={{ height: TITLE_H, width: FW }}>
        <span dir="rtl" className="absolute top-0.5 max-w-full truncate whitespace-nowrap text-[11px] font-bold text-slate-600" style={{ right: 4 }} data-ss-axis="x">{tw('xAxis')}</span>
      </div>
    </div>
  );

  const reading = (
    <div className={`rounded-xl border-2 border-amber-200 bg-amber-50/60 px-2 py-1 ${narrow ? 'text-[11px]' : 'text-[13px]'}`} aria-live="polite" data-ss-reading data-q={live ? L.numText(live.q) : ''}>
      {live ? (
        <div dir="ltr" className="space-y-0.5 overflow-x-auto text-center font-bold text-slate-900">
          {!narrow && (
            <div className="flex flex-wrap justify-center gap-x-3 text-slate-600">
              <MathText>{`$f(${L.numTex(live.x1)}) = ${L.numTex(live.y1)}$`}</MathText>
              <MathText>{`$f(${L.numTex(live.x2)}) = ${L.numTex(live.y2)}$`}</MathText>
            </div>
          )}
          <div><MathText>{`$${narrow ? L.quotientMiniTex(live) : L.quotientShortTex(live)}$`}</MathText></div>
        </div>
      ) : (
        <p className="py-1.5 text-xs font-bold text-rose-800"><MathText>{liveWhy === 'same' ? k('liveSame', { x: L.numTex(x1) }) : k('liveUnknown', { x: L.numTex(yOf(x1) == null ? x1 : x2), a: L.numTex(lab.given[0]?.x ?? 0), b: L.numTex(lab.given[1]?.x ?? 0) })}</MathText></p>
      )}
    </div>
  );

  const controls = (
    <div ref={ctrlRef} className="space-y-2" data-ss-controls>
      {steps.length > 1 && <LabStepper count={steps.length} current={Math.min(nDone, steps.length - 1)} done={stepDone} stepAttr="data-ss-step" />}
      <RuleLine lab={lab} k={k} f={f} />
      <div dir="ltr" className={`flex flex-wrap items-center ${narrow ? 'justify-center gap-0' : 'gap-x-2 gap-y-1'}`} data-ss-pads>
        {[0, 1].map((w) => (
          <span key={`p${w}`} className={`inline-flex items-center ${narrow ? '' : 'gap-0.5'}`}>
            {!narrow && <span className="min-w-[1.5rem] text-center font-mono text-sm font-extrabold" style={{ color: w === 0 ? '#6D28D9' : '#0E7490' }}>{SUB[w]}</span>}
            {[[-1, Minus, 'less'], [1, Plus, 'more']].map(([d, Icon, key]) => (
              <button key={key} type="button" onClick={() => sliders[w].nudge(d)} aria-label={k(key, { name: SUB[w] })}
                disabled={d < 0 ? lab.m[w] <= range.min : lab.m[w] >= range.max} {...{ [`data-ss-${key}`]: w + 1 }}
                className="inline-flex h-11 w-11 flex-col items-center justify-center rounded-xl border-2 bg-white leading-none disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                style={{ borderColor: narrow ? (w === 0 ? '#C4B5FD' : '#A5F3FC') : '#CBD5E1' }}>
                <Icon className={narrow ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden="true" />
                {narrow && <span className="font-mono text-[10px] font-extrabold" style={{ color: w === 0 ? '#6D28D9' : '#0E7490' }} aria-hidden="true">{SUB[w]}</span>}
              </button>
            ))}
          </span>
        ))}
      </div>
      {reading}
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          {fill.total > 0 && (
            <p className="text-xs font-bold text-emerald-900" data-ss-fill data-done={fill.done} data-total={fill.total}>
              {k('fill')} <bdi dir="ltr">{`${fill.done}\u00A0/\u00A0${fill.total}`}</bdi>
            </p>
          )}
          <p role="status" className="min-h-[1.75rem] font-bold leading-snug text-[13px]" data-ss-verdict={lab.last?.kind ?? ''}>{verdict}</p>
        </div>
        <Deco theme={theme} lab={lab} x1={x1} x2={x2} live={live} reduce={reduce} small={narrow} />
      </div>
      {phaseB && (
        <div className="rounded-xl border-2 border-pink-200 bg-pink-50/70 px-2 py-1.5 text-[13px]" data-ss-bgoal data-done={lab.bRead ? 'true' : 'false'}>
          {lab.bRead
            ? <div dir="ltr" className="overflow-x-auto text-center font-bold text-pink-900"><MathText>{`$${L.bTex(lab.bRead)}$`}</MathText></div>
            : <p className="font-bold text-pink-900"><MathText>{k('goB')}</MathText></p>}
        </div>
      )}
    </div>
  );

  const layout = wide ? 'side' : narrow ? 'narrow' : 'stack';

  return (
    <ManipulationShell
      type="slope-stairs"
      title={title ?? k('title')}
      mission={missionText}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided={cpLive}
      hints={hintKeys.map((h) => <MathText key={h}>{h}</MathText>)}
      controller={{
        autoStep: () => false,
        canAutoStep: () => false,
        autoComplete: lab.found ? {
          label: t('manipulation.autoComplete.tryAll'),
          ready: true,
          remaining: untriedFirst.length,
          intervalMs: 480,
          maxTicks: 80,
          step: () => { const i = L.untriedFirstMarkers(labRef.current)[0]; if (i !== undefined) sweepFirst(i); },
          finish: () => { L.untriedFirstMarkers(labRef.current).forEach(sweepFirst); },
        } : undefined,
      }}
      representation={<Representation lab={lab} k={k} />}
      discovery={(
        <ManipulationDiscovery state={state} prompt={<MathText>{k(`dPrompt.${lab.mode}`)}</MathText>} options={discoveryOptions} formal={<Formal lab={lab} k={k} />} />
      )}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-emerald-50/60 to-white">
        <div ref={boxRef} className="relative space-y-3" data-slope-stairs data-mode={lab.mode} data-theme={theme}
          data-m1={L.numText(x1)} data-m2={L.numText(x2)} data-found={lab.found ? 'true' : 'false'} data-layout={layout} data-budget={budget} data-ctrl-h={ctrlH}>
          {party.node}
          {cp.node}
          <div className={wide ? 'grid items-start gap-3' : 'space-y-2'} style={wide ? { gridTemplateColumns: `${planeCol}px 1fr` } : undefined} data-ss-glance>
            {plane}
            {controls}
          </div>
          {lab.trials.length > 0 && (
            <LabFold id="slope-stairs.trials" title={k('trialsTitle')}>
              <ul className="flex flex-wrap gap-1.5" data-ss-trials>
                {lab.trials.slice(-12).map((tr, n) => (
                  <li key={`${tr.kind}${n}`} data-ss-trial data-kind={tr.kind}
                    className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${tr.kind === 'stair' ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-rose-300 bg-rose-50 text-rose-900'}`}>
                    {tr.kind === 'stair'
                      ? <MathText>{`$${L.numTex(tr.x1)} \\to ${L.numTex(tr.x2)} : ${L.shortTex(tr)}$`}</MathText>
                      : <><MathText>{`$x_1 = ${L.numTex(tr.x1)} ,\\ x_2 = ${L.numTex(tr.x2)}$`}</MathText> · {k('tRefused')}</>}
                  </li>
                ))}
              </ul>
            </LabFold>
          )}
          {i18n.exists(`lesson:manipulation.slopeStairs.themes.${theme}.world`) && <p className="text-[11px] text-slate-500" data-ss-world>{tw('world')}</p>}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ── petits calculs de DESSIN (aucune décision) ── */

/** Le tronçon visible de y = ax + b dans la fenêtre : [[x, y], [x, y]] (flottants) ou null. */
function clipLine(f, win) {
  const a = L.toNum(f.a); const b = L.toNum(f.b);
  let lo = win.xMin; let hi = win.xMax;
  if (a !== 0) {
    const t1 = (win.yMin - b) / a; const t2 = (win.yMax - b) / a;
    lo = Math.max(lo, Math.min(t1, t2)); hi = Math.min(hi, Math.max(t1, t2));
  } else if (b < win.yMin || b > win.yMax) return null;
  if (hi - lo < 1e-9) return null;
  return [[lo, a * lo + b], [hi, a * hi + b]];
}

function trialReport(tr, lab) {
  const base = { mode: lab.mode, kind: tr.kind, x1: L.numText(tr.x1), x2: L.numText(tr.x2) };
  if (tr.kind !== 'stair') return { ...base, ok: false };
  return {
    ...base, ok: true, y1: L.numText(tr.y1), y2: L.numText(tr.y2), dx: L.numText(tr.dx), df: L.numText(tr.df), q: L.numText(tr.q),
    tex: L.quotientTex(tr), short: L.shortTex(tr), ghost: tr.ghost,
    b: lab.bRead ? L.numText(lab.bRead.b) : null, bTex: lab.bRead ? L.bTex(lab.bRead) : null,
  };
}

/* ── la ligne de la fonction (en tête des commandes) ── */
function RuleLine({ lab, k, f }) {
  if (lab.mode === 'rule') {
    return <p className="text-[13px] font-bold text-slate-800" data-ss-rule><span className="text-slate-500">{k('rule')}:</span> <MathText>{`$${L.ruleTex(f)}$`}</MathText></p>;
  }
  const [p, q] = lab.given;
  return (
    <p className="text-[13px] font-bold text-slate-800" data-ss-rule>
      <span className="text-slate-500">{k('known')}:</span>{' '}
      <span className="whitespace-nowrap"><MathText>{`$f(${L.numTex(p.x)}) = ${L.numTex(p.y)}$`}</MathText></span> ، <span className="whitespace-nowrap"><MathText>{`$f(${L.numTex(q.x)}) = ${L.numTex(q.y)}$`}</MathText></span>
      {lab.found && <> · <span className="whitespace-nowrap"><MathText>{`$a = ${L.numTex(lab.f.a)}$`}</MathText></span></>}
    </p>
  );
}

function Tag({ x, y, text, color, W }) {
  const w = 10 + text.length * 7;
  const tx = Math.max(1, Math.min(W - w - 1, x - w / 2));
  return (
    <g>
      <rect x={tx} y={y - 11} width={w} height={15} rx={4} fill="#fff" stroke={color} strokeWidth={1.4} />
      <text x={tx + w / 2} y={y} textAnchor="middle" fontSize={11} fontWeight="bold" fill={color} fontFamily="ui-monospace, monospace">{text}</text>
    </g>
  );
}

/* ── le verdict du dernier essai ── */
function verdictOf(lab, k) {
  const last = lab.last;
  if (!last) return <span className="font-normal text-slate-500">{k(lab.mode === 'points' ? 'startPoints' : 'startRule')}</span>;
  const M = (s) => <MathText>{s}</MathText>;
  if (last.kind === 'same') return <span className="text-rose-800">{M(k('vSame', { x: L.numTex(last.x1) }))}</span>;
  if (last.kind === 'unknown') {
    const x = L.known(lab, last.x1) ? last.x2 : last.x1;
    return <span className="text-rose-800">{M(k('vUnknown', { x: L.numTex(x), a: L.numTex(lab.given[0].x), b: L.numTex(lab.given[1].x) }))}</span>;
  }
  return (
    <span className="text-emerald-800">
      {M(k('vStair', { q: L.numTex(last.q) }))}
      {last.first && <> {M(k('vFirst', { a: L.numTex(last.q) }))}</>}
      {last.newGhost && <> {k('vGhost')}</>}
      {last.readB && <> {M(k('vB', { b: L.numTex(lab.bRead.b) }))}</>}
    </span>
  );
}

/* ── la découverte : distracteurs réfutés par les marches de l'élève ── */
function discoveryFor(lab, k) {
  const M = (s) => <MathText>{s}</MathText>;
  if (lab.mode === 'points') {
    if (!lab.found || !lab.bRead) return [];
    const st = L.stairs(lab)[0];
    const g0 = lab.given[0];
    const dfAbs = L.absOf(st.df);
    const wrongA = `${L.numTex(dfAbs)}x + ${L.numTex(g0.y)}`;
    const ratio = L.toNum(g0.x) !== 0 ? L.divide(g0.y, g0.x) : null;
    const opts = [
      { text: M(`$${L.ruleTex(lab.f)}$`), correct: true },
      { text: M(`$f(x) = ${wrongA}$`), why: M(k('dOpt.pointsDiffWhy', { df: L.numTex(dfAbs), dx: L.numTex(L.absOf(st.dx)), a: L.numTex(lab.f.a) })) },
    ];
    if (ratio) {
      const r = ratio;
      if (!L.same(r, lab.f.b)) {
        opts.push({ text: M(`$f(x) = ${L.numTex(lab.f.a)}x + ${L.numTex(r)}$`), why: M(k('dOpt.pointsRatioWhy', { r: L.numTex(r), y: L.numTex(g0.y), x: L.numTex(g0.x), b: L.numTex(lab.f.b) })) });
      }
    }
    // l'ordre ne dépend que des nombres (deux élèves voient le même écran)
    return [opts[1], opts[0], ...opts.slice(2)];
  }
  const pair = L.contrastPair(lab);
  if (!pair) return [];
  const [small, big] = pair;
  return [
    { text: M(k('dOpt.grows')), why: M(k('dOpt.growsWhy', { s: L.shortTex(small), b: L.shortTex(big) })) },
    { text: M(k('dOpt.right', { a: L.numTex(lab.f.a) })), correct: true },
    { text: M(k('dOpt.diff')), why: M(k('dOpt.diffWhy', { df: L.numTex(big.df), dx: L.numTex(big.dx), q: L.numTex(big.q) })) },
  ];
}

function Formal({ lab, k }) {
  const M = (s) => <MathText>{s}</MathText>;
  if (lab.mode === 'points') {
    const st = L.stairs(lab)[0];
    const [, q] = lab.given;
    const check = L.imageAt(lab, q.x);
    return (
      <div className="space-y-2" data-ss-formal="points">
        <p className="text-sm font-bold text-slate-700">{k('fPoints')}</p>
        <div dir="ltr" className="space-y-1 overflow-x-auto text-start text-sm">
          <div>{M(`$a = ${L.quotientTex(st)}$`)}</div>
          {lab.bRead && <div>{M(`$${L.bTex(lab.bRead)}$`)}</div>}
        </div>
        <EquationDisplay tone="result" tex={L.ruleTex(lab.f)} note={M(k('fPointsCheck', { x: L.numTex(q.x), y: L.numTex(check) }))} />
      </div>
    );
  }
  const st = L.stairs(lab);
  return (
    <div className="space-y-2" data-ss-formal="rule">
      <EquationDisplay tone="result" tex={`\\dfrac{f(x_1) - f(x_2)}{x_1 - x_2} = ${L.numTex(lab.f.a)}`} note={M(k('fRuleNote', { a: L.numTex(lab.f.a) }))} />
      <p className="text-sm text-slate-700">{k('fMine')}</p>
      <div dir="ltr" className="flex flex-wrap gap-2 text-sm">
        {st.slice(-5).map((tr) => <span key={`${L.numText(tr.x1)}-${L.numText(tr.x2)}`} className="rounded-lg border border-emerald-200 bg-white px-2 py-0.5">{M(`$${L.shortTex(tr)}$`)}</span>)}
      </div>
      <p className="text-sm text-emerald-900">{M(k('fRule'))}</p>
      <p className="text-sm text-slate-800">{M(k('fRuleB'))}</p>
    </div>
  );
}

function Representation({ lab, k }) {
  const st = L.stairs(lab);
  if (!st.length) return <EquationDisplay tone="neutral" tex="\dfrac{f(x_1) - f(x_2)}{x_1 - x_2}" note={k('noStair')} />;
  const tex = st.slice(-3).map((tr) => L.shortTex(tr)).join(',\\quad ');
  return <EquationDisplay tone="ok" tex={tex} note={k('repNote', { count: st.length })} />;
}

/* ── le décor (sans information) ── */

/** Les tribunes du stade, derrière la droite : dans le coin que la droite laisse libre. */
function Stands({ win, geo, f }) {
  const rising = L.toNum(f.a) >= 0;
  const w = (geo.px(win.xMax) - geo.px(win.xMin)) * 0.34;
  const h = (geo.py(win.yMin) - geo.py(win.yMax)) * 0.2;
  const x0 = rising ? geo.px(win.xMin) + 4 : geo.px(win.xMax) - w - 4;
  const y0 = geo.py(win.yMax) + 2;
  const heads = [];
  const cols = 9; const rows = 3;
  const SC = ['#16A34A', '#DC2626', '#F8FAFC', '#16A34A', '#F59E0B'];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    heads.push(<circle key={`${r}-${c}`} cx={x0 + (c + 0.5 + (r % 2) * 0.4) * (w / (cols + 0.5))} cy={y0 + (r + 0.55) * (h / rows)} r={Math.max(1.6, Math.min(4, h / rows / 3))} fill={SC[(r * 3 + c) % SC.length]} />);
  }
  return (
    <g opacity={0.22} data-deco="stands" pointerEvents="none">
      <rect x={x0} y={y0} width={w} height={h} rx={4} fill="#64748B" />
      {heads}
    </g>
  );
}

/**
 * La carte d'abonnement (stade) ou le thermomètre (تحدّ). La carte compte des MATCHS (le nombre que la
 * main tient), jamais un montant ; le thermomètre est gradué en °C seulement.
 */
function Deco({ theme, lab, x1, x2, live, reduce, small }) {
  const [taps, setTaps] = useState(0);
  const hiX = Math.max(L.toNum(x1), L.toNum(x2));
  const loX = Math.min(L.toNum(x1), L.toNum(x2));
  const nStairs = L.stairs(lab).length;
  if (theme === 'thermo') {
    const frac0 = Math.max(0, Math.min(1, (hiX - lab.win.xMin) / Math.max(1, lab.win.xMax - lab.win.xMin)));
    const top = 6; const bottom = 52;
    const level = bottom - frac0 * (bottom - top);
    return (
      <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => !reduce && setTaps((n) => n + 1)} data-deco="thermo"
        className="shrink-0 rounded-lg focus:outline-none" style={{ width: small ? 30 : 40, height: small ? 52 : 66 }}>
        <svg viewBox="0 0 40 66" width="100%" height="100%">
          <rect x={14} y={2} width={12} height={54} rx={6} fill="#F1F5F9" stroke="#64748B" strokeWidth={1.4} />
          <rect x={17} y={level} width={6} height={56 - level} fill="#EF4444" style={{ transition: reduce ? 'none' : 'y 300ms ease, height 300ms ease' }} />
          <circle cx={20} cy={58} r={7} fill="#EF4444" stroke="#64748B" strokeWidth={1.4} />
          {[0, 0.5, 1].map((p) => <line key={p} x1={26} x2={31} y1={bottom - p * (bottom - top)} y2={bottom - p * (bottom - top)} stroke="#64748B" strokeWidth={1} />)}
          <text x={33} y={bottom + 3} fontSize={7} fill="#475569" fontFamily="ui-monospace, monospace">°C</text>
          <g key={taps} className={taps && !reduce ? 'ss-pop' : undefined}><circle cx={6} cy={8} r={4} fill="#FDE047" /></g>
        </svg>
      </button>
    );
  }
  // la carte d'abonnement : une case par match de la fenêtre, tamponnée jusqu'au plus grand nombre
  const n = Math.max(1, Math.min(20, lab.range.max));
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const cw = 58; const ch = small ? 40 : 50;
  const cell = Math.min((cw - 8) / cols, (ch - 14) / rows);
  return (
    <span aria-hidden="true" className="relative inline-flex shrink-0 items-end gap-1" data-deco="stadium">
      <svg viewBox={`0 0 ${cw} ${ch}`} width={small ? 50 : 62} height={small ? 34 : 54}>
        <rect x={0.5} y={0.5} width={cw - 1} height={ch - 1} rx={5} fill="#065F46" stroke="#064E3B" />
        <rect x={0.5} y={0.5} width={cw - 1} height={9} rx={4} fill="#F59E0B" />
        {Array.from({ length: n }, (_, i) => {
          const r = Math.floor(i / cols); const c = i % cols;
          const m = i + 1;
          const stamped = live && m <= hiX;
          const ofStair = live && m > loX && m <= hiX;
          return <circle key={i} cx={4 + (c + 0.5) * cell} cy={12 + (r + 0.5) * cell} r={cell * 0.34} fill={ofStair ? '#FBBF24' : stamped ? '#A7F3D0' : '#047857'} stroke="#ECFDF5" strokeWidth={0.5} />;
        })}
      </svg>
      {/* le tourniquet : à chaque marche, les supporters passent (au plus 5) */}
      {!small && (
        <svg viewBox="0 0 48 54" width={40} height={46}>
          <rect x={20} y={10} width={10} height={40} rx={2} fill="#475569" />
          <circle cx={25} cy={22} r={3.2} fill="#CBD5E1" />
          <path d="M25 22 L41 18 M25 22 L40 30 M25 22 L10 18" stroke="#94A3B8" strokeWidth={2.6} strokeLinecap="round" />
          <rect x={22} y={12} width={6} height={4} rx={1} fill="#22C55E" />
          <g key={nStairs} className={nStairs && !reduce ? 'ss-walk' : undefined}>
            {Array.from({ length: Math.min(4, Math.max(1, Math.round(Math.abs(hiX - loX)))) }, (_, i) => (
              <g key={i} transform={`translate(${4 + i * 5} ${40 - (i % 2) * 2})`}>
                <circle r={2.4} fill="#F3C9A0" />
                <rect x={-2.4} y={2.4} width={4.8} height={7} rx={1.5} fill={i % 2 ? '#DC2626' : '#16A34A'} />
              </g>
            ))}
          </g>
        </svg>
      )}
    </span>
  );
}

const SS_CSS = '.ss-shake{animation:ss-s .35s ease-in-out 1}@keyframes ss-s{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}'
  + '.ss-walk{animation:ss-w .9s ease-out 1}@keyframes ss-w{0%{transform:translateX(-14px);opacity:.2}100%{transform:translateX(0);opacity:1}}'
  + '.ss-pop{animation:ss-p .5s ease-out 1}@keyframes ss-p{0%{transform:scale(.6)}100%{transform:scale(1)}}'
  + '@media (prefers-reduced-motion: reduce){.ss-shake,.ss-walk,.ss-pop{animation:none}}';

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque étape ; la dernière étape (contraste, ou b) finit par LA RÈGLE. */
export function chainOf(lab, step) {
  const base = CHAINS[step];
  return step === L.stepsOf(lab)[1] ? [...base, 'rule'] : base;
}
export const CHAINS = Object.freeze({ stair: ['rise', 'quot'], contrast: ['sameQ'], find: ['a'], b: ['b'] });

const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const T = (x) => <MathText>{`$${x}$`}</MathText>;
const D = (x) => x;   // le TeX brut : les gabarits cp.* posent eux-mêmes les $…$
const shuffled = (list, seed) => { const r = Math.abs(seed) % list.length; return [...list.slice(r), ...list.slice(0, r)]; };
const seedOf = (lab) => lab.trials.length + Math.abs(lab.m[0]) + Math.abs(lab.m[1]);
/** La bonne option puis deux erreurs RÉELLES `{ v, why }` ; un doublon est remplacé par un décalage de 1 (avec le `why` générique). */
function numOptions(good, wrongs, generic) {
  const out = [{ text: T(L.numTex(good)), correct: true }];
  const seen = [good];
  for (const w of wrongs) {
    if (w.v == null || seen.some((u) => L.same(u, w.v))) continue;
    seen.push(w.v); out.push({ text: T(L.numTex(w.v)), why: w.why });
  }
  for (let bump = 1; out.length < 3; bump += 1) {
    const c = L.plus(good, bump);
    if (!seen.some((u) => L.same(u, c))) { seen.push(c); out.push({ text: T(L.numTex(c)), why: generic }); }
  }
  return out.slice(0, 3);
}
const lastStair = (lab) => L.stairs(lab)[L.stairs(lab).length - 1];

export const QUESTIONS = {
  /* rule · étape 1 : la dernière marche de l'élève, ce que la main vient de faire */
  rise: (lab, k) => {
    const tr = lastStair(lab);
    const o = { x1: D(L.numTex(tr.x1)), x2: D(L.numTex(tr.x2)), y1: D(L.numTex(tr.y1)), y2: D(L.numTex(tr.y2)), df: D(L.numTex(tr.df)), dx: D(L.numTex(tr.dx)) };
    const opts = numOptions(tr.df, [{ v: tr.dx, why: Cq(k, 'rise.whyWidth', o) }, { v: tr.y1, why: Cq(k, 'rise.whyImage', o) }], Cq(k, 'rise.whyOther', o));
    return {
      id: 'rise', kind: 'choice', cols: 3, prompt: Cq(k, 'rise.prompt', o), options: shuffled(opts, seedOf(lab)),
      hints: [Cq(k, 'rise.hint1', o), Cq(k, 'rise.hint2', o)], explain: Cq(k, 'rise.explain', o),
    };
  },
  quot: (lab, k) => {
    const tr = lastStair(lab);
    const inv = L.toNum(tr.df) !== 0 ? L.divide(tr.dx, tr.df) : null;
    const o = { df: D(L.numTex(tr.df)), dx: D(L.numTex(tr.dx)), q: D(L.numTex(tr.q)), x1: D(L.numTex(tr.x1)), x2: D(L.numTex(tr.x2)) };
    const opts = numOptions(tr.q, [{ v: tr.df, why: Cq(k, 'quot.whyNoDivide', o) }, { v: inv, why: Cq(k, 'quot.whyInverse', o) }], Cq(k, 'quot.whyOther', o));
    return {
      id: 'quot', kind: 'choice', cols: 3, prompt: Cq(k, 'quot.prompt', o), options: shuffled(opts, seedOf(lab) + 1),
      hints: [Cq(k, 'quot.hint1', o), Cq(k, 'quot.hint2', o)], explain: Cq(k, 'quot.explain', o),
    };
  },
  /* rule · étape 2 : deux marches de largeurs différentes de l'élève */
  sameQ: (lab, k) => {
    const [small, big] = L.contrastPair(lab);
    const o = { s: D(L.shortTex(small)), b: D(L.shortTex(big)), ds: D(L.numTex(L.absOf(small.dx))), db: D(L.numTex(L.absOf(big.dx))), q: D(L.numTex(big.q)) };
    const opts = [
      { text: Cq(k, 'sameQ.same'), correct: true },
      { text: Cq(k, 'sameQ.grows'), why: Cq(k, 'sameQ.whyGrows', o) },
      { text: Cq(k, 'sameQ.shrinks'), why: Cq(k, 'sameQ.whyShrinks', o) },
    ];
    return {
      id: 'sameQ', kind: 'choice', cols: 1, prompt: Cq(k, 'sameQ.prompt', o), options: shuffled(opts, seedOf(lab) + 2),
      hints: [Cq(k, 'sameQ.hint1', o), Cq(k, 'sameQ.hint2', o)], explain: Cq(k, 'sameQ.explain', o),
    };
  },
  /* points · étape 1 : la marche entre les deux couples donnés */
  a: (lab, k) => {
    const st = L.stairs(lab)[0];
    const g0 = lab.given[0];
    const ratio = L.toNum(g0.x) !== 0 ? L.divide(g0.y, g0.x) : null;
    const o = { df: D(L.numTex(st.df)), dx: D(L.numTex(st.dx)), a: D(L.numTex(lab.f.a)), x: D(L.numTex(g0.x)), y: D(L.numTex(g0.y)) };
    const opts = numOptions(lab.f.a, [{ v: st.df, why: Cq(k, 'a.whyNoDivide', o) }, { v: ratio, why: Cq(k, 'a.whyRatio', o) }], Cq(k, 'a.whyOther', o));
    return {
      id: 'a', kind: 'choice', cols: 3, prompt: Cq(k, 'a.prompt', o), options: shuffled(opts, seedOf(lab)),
      hints: [Cq(k, 'a.hint1', o), Cq(k, 'a.hint2', o)], explain: Cq(k, 'a.explain', o),
    };
  },
  /* points · étape 2 : b lu en x = 0 */
  b: (lab, k) => {
    const r = lab.bRead;
    const o = { a: D(L.numTex(r.a)), via: D(L.numTex(r.via)), yv: D(L.numTex(r.yVia)), b: D(L.numTex(r.b)), prod: D(L.numTex(L.times(r.a, r.via))) };
    const opts = numOptions(r.b, [{ v: r.yVia, why: Cq(k, 'b.whyImage', o) }, { v: L.times(r.a, r.via), why: Cq(k, 'b.whyProduct', o) }], Cq(k, 'b.whyOther', o));
    return {
      id: 'b', kind: 'choice', cols: 3, prompt: Cq(k, 'b.prompt', o), options: shuffled(opts, seedOf(lab) + 1),
      hints: [Cq(k, 'b.hint1', o), Cq(k, 'b.hint2', o)], explain: Cq(k, 'b.explain', o),
    };
  },
  rule: (lab, k) => {
    const opts = discoveryFor(lab, k);
    const ci = opts.findIndex((o) => o.correct);
    return {
      id: 'rule', kind: 'choice', cols: 1,
      prompt: <MathText>{k(`dPrompt.${lab.mode}`)}</MathText>,
      options: ci === opts.length - 1 ? [opts[ci], ...opts.slice(0, ci)] : opts,
      hints: [Cq(k, `rule.hint1.${lab.mode}`), Cq(k, `rule.hint2.${lab.mode}`)],
      explain: Cq(k, `rule.explain.${lab.mode}`),
    };
  },
};
