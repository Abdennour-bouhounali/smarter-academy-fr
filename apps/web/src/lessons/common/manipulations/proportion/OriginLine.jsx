import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, MapPin, Minus, Plus } from 'lucide-react';
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
import MathText from '../../components/MathText';
import * as L from '../logic/originLine';

/**
 * origin-line — LA DROITE ÉPINGLÉE À O (unité 6 « الدالة الخطية والتناسبية », leçon 3 « التمثيل
 * البياني لدالة خطية وقراءته بيانيًا » ; réutilisée par les leçons 5 et 6 par un contrat de props FIXE).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève POSE un point dans le plan (draw : glisser l'épingle, toucher un nœud, flèches + Entrée,
 *    boutons), FAIT PIVOTER la droite autour de O (pivot / fit : saisir la droite n'importe où, ou le
 *    زالق vertical à droite), GLISSE une sonde sur un axe (read : sous l'axe des abscisses, à gauche de
 *    l'axe des ordonnées). Il essaie aussi de déplacer O — O résiste.
 * B. Idée : le graphe de x ⟼ ax est une droite qui passe par O (une seule autre point suffit), d'équation
 *    y = ax ; on y LIT une image (ordonnée) et un antécédent (abscisse) ; elle MONTE si a > 0, DESCEND si a < 0.
 * C. Pendant le geste : la droite candidate (O, épingle) pivote en direct avec son sens (monte / descend) ;
 *    la sonde trace le chemin pointillé axe → droite → autre axe et la lecture s'écrit ; le téléphérique
 *    glisse sur son câble (la droite).
 * D. Les points acceptés (A, B, C…) et le tableau x / f(x) qu'ils forment ; la lecture f(4) = 1,6 ; la
 *    droite y = ax et son sens.
 * E. À découvrir avant la règle : O, A et B sont ALIGNÉS (draw) ; « صورة = ترتيب، العدد = فاصلة » (read) ;
 *    a > 0 monte, a < 0 descend (pivot) ; les données alignées avec O ⇔ proportionnelles (fit).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        graphe d'une fonction linéaire : droite par O, d'équation y = ax, coefficient directeur a
 *   OBJECT         une droite épinglée à O (le câble d'un téléphérique), un point qu'on pose, une sonde
 *   VARIABLE       draw : la position (x ; y) de l'épingle ; pivot/fit : a (la pente, tenue par la droite ou
 *                  le زالق) ; read : l'abscisse ou l'ordonnée de la sonde
 *   INVARIANT      O — il RÉSISTE quand on le saisit (il tremble et revient : f(0) = 0) ; la fonction (draw/read)
 *   TRANSFORMATION la droite candidate pivote ; le chemin de lecture se déplace ; la cabine glisse
 *   CONSTRAINT     un point n'est accepté que s'il est sur y = ax (`proportional.onLine`, EXACT)
 *   RESISTANCE     point refusé : il tremble, et la ligne écrite donne le calcul et l'écart
 *                  (« 0,5 × 4 = 2 وليس 3 — الفرق 1 ») ; O ne se déplace jamais
 *   EVIDENCE       draw : A et B acceptés et la droite (OA) qui passe par B ; read : les deux lectures ;
 *                  pivot : une droite qui monte ET une qui descend ; fit : la droite par tous les points
 *   CONTRAST       draw : deux points d'abscisses différentes (un point refusé pèse aussi) ; read : une image
 *                  ET un antécédent ; pivot : a > 0 ET a < 0 ; fit : une droite par UN point qui manque les autres
 *   PREDICTION     « f(1) = ? » se calcule avant de poser A ; C d'abscisse −2 se prédit avant la lecture
 *   DISCOVERY      les conjectures ci-dessus ; les distracteurs sont réfutés par les propres essais de l'élève
 *   FORMALIZATION  « (OA) هو التمثيل البياني للدالة f » et y = ax ; la méthode de lecture du manuel ; la
 *                  ملاحظة de معارف sur le signe de a
 *   TRANSFER       طرائق ص 69 (1,5x par A(1 ; 1,5)) ; دوري الآن (a = 9/4) ; le ressort (leçon 5, fit) ;
 *                  le budget de la famille (leçon 6, read + cap)
 *
 * Manuel (§6bis) : chaque point, chaque droite, chaque lecture est un essai ou une réponse — pas
 * d'auto-complétion.
 *
 * GESTE « POSER UN POINT » (draw) : ni porter (useDragInteraction) ni étirer une grandeur — l'épingle suit
 * le doigt en 2D et se pose sur le nœud EXACT le plus proche (logic/originLine › indexOf / valueAt) ; le
 * relâchement est l'essai. Clavier : flèches = un nœud, Entrée / Espace = poser ; boutons ←→↑↓ + « ضع
 * النقطة ». Les sondes et le زالق sont des `useStretchInteraction` (glisser, toucher la piste, flèches, −/+).
 *
 * DÉCOR (exigence du propriétaire) — sans information, sans état du lab : la cabine rouge du téléphérique
 * de قسنطينة pendue au câble (la droite) glisse d'un bout à l'autre quand on la touche (cablecar) ; un
 * ressort et sa masse qui s'étirent avec la sonde (spring) ; un porte-monnaie (budget). `aria-hidden`,
 * `tabIndex={-1}`, `[data-deco]`, immobiles sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (MANIPULATION_CONTRACT §8bis) : le plan est un conteneur dont la hauteur vient de l'écran
 * de leçon (`useLessonViewport`) moins les commandes mesurées ; l'unité (orthonormée pour `cablecar`, par
 * axe pour `spring` / `budget`) en découle — le plan rétrécit, les commandes jamais. Large (≥ 620 px) : le
 * plan et ses commandes côte à côte ; sinon les commandes juste dessous. Les sondes et le زالق sont COLLÉS
 * au plan (sous l'axe des x, à gauche, à droite). Le secondaire (les essais) est dans un `LabFold` sous la
 * manipulation, jamais entre le plan et ses commandes.
 *
 * PROPS (contrat de l'unité, brief §6 — L5 / L6 ne passent QUE celles-ci) :
 *   a        coefficient (chaîne du manuel : « 0,5 », « -2 », « 9/4 ») — requis en draw / read
 *   mode     'draw' | 'read' | 'fit' (+ 'pivot', l'extension de la leçon 3 : le زالق sans cible)
 *   points   « x:y|x:y » — fit (données) ; dans les autres modes, des points donnés dessinés
 *   reads    « x:4|y:3,5 » — cibles de lecture (read)
 *   cap      une horizontale y = cap (budget) ; la sonde y s'y accroche, la rencontre se lit
 *   xMin xMax yMin yMax  la fenêtre (chaînes) ; O y est toujours ; graduations et grille choisies par le lab
 *   theme    'cablecar' (défaut) | 'spring' | 'budget' — mots dans lesson.json › manipulation.originLine.themes
 *   showRule (facultatif) afficher l'équation de la droite donnée en read (défaut : vrai sauf cablecar,
 *            où le manuel donne le graphe et non la formule — طرائق ص 69)
 *   title lead mission level levels  comme les autres types ; onTrial(t) à chaque essai validé,
 *   onFinished({ mode, a }) à la règle formelle — tous deux par `state.report`.
 *
 * CONTRAT DOM : [data-origin-line][data-mode][data-theme][data-a][data-line-a][data-layout],
 * [data-ol-glance], [data-ol-plane][data-w][data-h], [data-ol-origin], [data-ol-pin][data-i][data-j],
 * [data-ol-point=<label>], [data-ol-given], [data-ol-data][data-hit], [data-ol-line][data-dir],
 * [data-ol-candidate][data-dir], [data-ol-probe=x|y], [data-ol-strip=x|y|pivot] (pistes, `data-stretch-*`),
 * [data-ol-cap], [data-ol-controls], [data-ol-place], [data-ol-move=left|right|up|down],
 * [data-ol-target=<i>][data-done], [data-ol-verdict=<kind>], [data-ol-trial], [data-ol-formal], [data-deco].
 */
const STRIP_W = 44;
const GAP = 12;
const TITLE_H = 20;
const COLORS = { rising: '#059669', falling: '#E11D48', flat: '#64748B' };

export default function OriginLine({
  a: a0, mode: mode0 = 'draw', points, reads, cap, xMin, xMax, yMin, yMax, theme: theme0 = 'cablecar', showRule,
  title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false,
  onTrial, onFinished, onCheckpoint,
}) {
  const { t, i18n } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.originLine.${key}`, o), [t]);
  const reduce = useReducedMotion();
  const state = useManipulation({
    type: 'origin-line',
    // a, le mode et les cibles de lecture sont les NOMBRES du niveau (levels.js : le niveau متقدم est
    // { a: '0,4', mode: 'read', reads: 'x:4|y:3,5' }) ; le reste du contrat ne vaut que sur le niveau de la leçon.
    initialNumbers: { a: a0 == null ? undefined : String(a0), mode: mode0, ...(reads ? { reads } : {}) },
    initialMode, initialLevel: level, withLevels, hintCount: 3,
  });
  const { a, mode, reads: readsN } = state.numbers;
  // Sur l'autre niveau (préréglage de levels.js), seuls a et le mode valent : le monde est le téléphérique.
  const authored = state.isAuthoredLevel;
  const theme = authored && L.THEMES.includes(theme0) ? theme0 : 'cablecar';
  const tw = (key, o) => t(`manipulation.originLine.themes.${theme}.${key}`, o);
  const make = () => L.init({ a, mode, reads: readsN, ...(authored ? { points, cap, xMin, xMax, yMin, yMax } : {}) });
  const [lab, setLab] = useState(make);
  const sceneKey = `${a}:${mode}:${readsN ?? ''}:${state.epoch}:${authored}`;
  const [scene, setScene] = useState(sceneKey);
  const [pin, setPin] = useState(() => (mode === 'draw' ? L.startPin(lab) : null));
  const [liveXi, setLiveXi] = useState(null);
  const [liveYi, setLiveYi] = useState(null);
  const [liveJ, setLiveJ] = useState(null);
  const [drag, setDrag] = useState(null); // 'pin' | 'line' | null
  const [shake, setShake] = useState({ o: 0, pin: 0 });
  const [inits, setInits] = useState(0);        // « إعادة », un autre niveau : les questions du labo repartent aussi
  const [cleared, setCleared] = useState([]);   // les étapes dont la suite de questions est répondue
  if (scene !== sceneKey) {
    const fresh = make();
    setScene(sceneKey); setLab(fresh); setPin(fresh.mode === 'draw' ? L.startPin(fresh) : null);
    setLiveXi(null); setLiveYi(null); setLiveJ(null); setDrag(null); setInits((n) => n + 1); setCleared([]);
  }

  const ready = L.discoveryReady(lab);
  useEffect(() => { if (state.isFormal) state.report(onFinished, { mode, a: lab.lineA ? L.numText(lab.lineA) : null }); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials === 0) return;
    const tr = lab.trials[nTrials - 1];
    state.report(onTrial, trialReport(tr, lab));
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : la largeur de la scène et la HAUTEUR de l'écran de leçon ── */
  const boxRef = useRef(null);
  const ctrlRef = useRef(null);
  const [width, setWidth] = useState(320);
  const [ctrlH, setCtrlH] = useState(220);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(120, Math.floor(el.clientWidth)));
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
  const budget = Math.max(320, screenH - 8);
  const wide = width >= 620;
  const strip = STRIP_W;

  /* ── géométrie du plan ── */
  const { win, snap, grid } = lab;
  // Téléphone en lecture : les deux sondes glissent SUR les axes, dans le plan (qui n'a pas d'autre geste
  // en read) — le plan garde toute la largeur ; ailleurs elles sont collées au plan, dehors.
  const overlayStrips = false;
  const yStripOn = mode === 'read' && !overlayStrips;
  const xStripOn = (mode === 'read' && !overlayStrips) || mode === 'draw';
  const pStripOn = mode === 'pivot' || mode === 'fit';
  const planeCol = wide ? Math.floor((width - GAP) * 0.6) : width;
  const availW = planeCol - (yStripOn ? strip : 0) - (pStripOn ? strip : 0);
  const availH = Math.max(150, (wide ? budget : budget - ctrlH - GAP) - 2 * TITLE_H - (xStripOn ? strip : 0) - 8);
  const orth = theme === 'cablecar';
  const geo = useMemo(() => L.planeGeometry({ win, width: availW, height: availH, orthonormal: orth }), [win, availW, availH, orth]);

  /* ── valeurs vivantes ── */
  const xr = L.indexRange(win.xMin, win.xMax, snap.dx);
  const yr = L.indexRange(win.yMin, win.yMax, snap.dy);
  const clampI = (i) => Math.max(xr.min, Math.min(xr.max, i));
  const clampJ = (j) => Math.max(yr.min, Math.min(yr.max, j));
  const pinRef = useRef(pin);
  pinRef.current = pin;
  const jRef = useRef(null);

  const hr = pStripOn ? L.handleRange(lab) : { min: 0, max: 0 };
  // départ PAR DÉFAUT de la poignée (jamais la droite qui passe par toutes les données) : pas un essai, rien n'est enregistré.
  const j0 = pStripOn ? (lab.lineA != null ? L.handleIndex(lab, lab.lineA) : L.defaultHandleIndex(lab)) : 0;
  const J = pStripOn ? Math.max(hr.min, Math.min(hr.max, liveJ ?? j0)) : 0;
  jRef.current = J;
  const pivotA = pStripOn ? L.aAt(lab, J) : null;

  // la droite à dessiner : (OA) en draw, la droite donnée en read, la droite tenue en pivot / fit
  const shownA = pStripOn ? pivotA : lab.lineA;
  const pinX = pin ? L.valueAt(pin.i, snap.dx) : null;
  const pinY = pin ? L.valueAt(pin.j, snap.dy) : null;
  const candA = mode === 'draw' && pin && pin.i !== 0 ? L.slopeThrough(pinX, pinY) : null;

  /* ── gestes ── */
  const originTouched = () => { setShake((s) => ({ ...s, o: s.o + 1 })); setLab((s) => L.touchOrigin(s)); };
  const commitPin = (p) => {
    if (!p) return;
    setLab((s) => {
      const next = L.place(s, L.valueAt(p.i, s.snap.dx), L.valueAt(p.j, s.snap.dy));
      if (next.last?.kind === 'refused') setShake((sh) => ({ ...sh, pin: sh.pin + 1 }));
      if (next.last?.kind === 'origin') setShake((sh) => ({ ...sh, o: sh.o + 1 }));
      return next;
    });
  };
  const commitJ = (j) => { setLiveJ(j); setLab((s) => L.pivot(s, L.aAt(s, j))); };

  const planeRef = useRef(null);
  const local = (e) => {
    const r = planeRef.current.getBoundingClientRect();
    return { X: e.clientX - r.left, Y: e.clientY - r.top };
  };
  const nearO = ({ X, Y }) => Math.hypot(X - geo.px(0), Y - geo.py(0)) < 16;
  const pinAt = ({ X, Y }) => {
    const v = geo.fromPx(X, Y);
    return { i: clampI(L.indexOf(v.x, snap.dx)), j: clampJ(L.indexOf(v.y, snap.dy)) };
  };
  const jAt = ({ X, Y }) => {
    const v = geo.fromPx(X, Y);
    const j = L.handleIndexFor(lab, v.x, v.y);
    return j == null ? null : Math.max(hr.min, Math.min(hr.max, j));
  };
  const onPlaneDown = (e) => {
    if (e.button > 0 || !planeRef.current) return;
    if (mode === 'read') return;
    const p = local(e);
    if (nearO(p)) { e.preventDefault(); originTouched(); return; }
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    if (mode === 'draw') { setDrag('pin'); setPin(pinAt(p)); }
    else { const j = jAt(p); if (j != null) { setDrag('line'); setLiveJ(j); } }
  };
  const onPlaneMove = (e) => {
    if (!drag) return;
    const p = local(e);
    if (drag === 'pin') setPin(pinAt(p));
    else { const j = jAt(p); if (j != null) setLiveJ(j); }
  };
  const onPlaneUp = (e) => {
    if (!drag) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    const kind = drag;
    setDrag(null);
    if (kind === 'pin') commitPin(pinRef.current);
    else commitJ(jRef.current);
  };
  const movePin = (di, dj) => setPin((p) => ({ i: clampI((p?.i ?? 0) + di), j: clampJ((p?.j ?? 0) + dj) }));
  const onPinKey = (e) => {
    const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (m) { e.preventDefault(); movePin(...m); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); commitPin(pinRef.current); }
  };

  /* ── les sondes et le زالق (useStretchInteraction : glisser, toucher la piste, flèches, −/+) ── */
  const lastX = [...lab.readsDone].reverse().find((r) => r.axis === 'x');
  const lastY = [...lab.readsDone].reverse().find((r) => r.axis === 'y');
  // en lecture, les sondes s'ouvrent sur une valeur PAR DÉFAUT (ni cible, ni plafond, ni O) : rien n'est lu tant que l'élève ne relâche pas.
  const xi = liveXi ?? (lastX ? L.indexOf(Lin2n(lastX.v), snap.dx) : (mode === 'read' ? L.defaultProbeIndex(lab, 'x') : null));
  const yi = liveYi ?? (lastY ? L.indexOf(Lin2n(lastY.v), snap.dy) : (mode === 'read' ? L.defaultProbeIndex(lab, 'y') : null));
  const canX = L.canRead(lab, 'x');
  const canY = L.canRead(lab, 'y');
  const sX = useStretchInteraction({
    value: xi, range: xr, direction: 'ltr',
    toValue: useCallback((cx, _cy, rect) => geo.fromPx(cx - rect.left, 0).x / Lin2n(snap.dx), [geo, snap.dx]),
    onChange: (v) => canX && setLiveXi(v),
    onCommit: (v) => { if (!canX) return; setLiveXi(v); setLab((s) => L.readX(s, L.valueAt(v, s.snap.dx))); },
  });
  const sY = useStretchInteraction({
    value: yi, range: yr, direction: 'ltr',
    toValue: useCallback((_cx, cy, rect) => geo.fromPx(0, cy - rect.top).y / Lin2n(snap.dy), [geo, snap.dy]),
    onChange: (v) => canY && setLiveYi(v),
    onCommit: (v) => { if (!canY) return; setLiveYi(v); setLab((s) => L.readY(s, L.valueAt(v, s.snap.dy))); },
  });
  const sP = useStretchInteraction({
    value: pStripOn ? J : null, range: hr, direction: 'ltr',
    toValue: useCallback((_cx, cy, rect) => geo.fromPx(0, cy - rect.top).y / Lin2n(snap.dy), [geo, snap.dy]),
    onChange: setLiveJ,
    onCommit: commitJ,
  });

  /* « جرّب كل الإمكانيات » (pivot / fit) : les graduations de la poignée, une à une ; chaque droite est un essai validé comme à la main. */
  const labRef = useRef(lab);
  labRef.current = lab;
  const untriedJ = () => {
    const cur = labRef.current;
    if (cur.mode !== 'pivot' && cur.mode !== 'fit') return [];
    const rg = L.handleRange(cur);
    const all = Array.from({ length: rg.max - rg.min + 1 }, (_, n) => rg.min + n);
    return all.filter((j) => !cur.lines.some((l) => L.same(l.a, L.aAt(cur, j))));
  };
  const autoComplete = pStripOn ? {
    label: t('manipulation.autoComplete.tryAll'),
    ready: true,
    remaining: untriedJ().length,
    intervalMs: 480,
    maxTicks: 80,
    step: () => {
      const j = untriedJ()[0];
      if (j === undefined) return;
      labRef.current = L.pivot(labRef.current, L.aAt(labRef.current, j));
      setLiveJ(j);
      setLab((s) => L.pivot(s, L.aAt(s, j)));
    },
    finish: () => {
      const todo = untriedJ();
      if (todo.length === 0) return;
      let acc = labRef.current;
      todo.forEach((j, i) => {
        const before = acc.trials.length;
        acc = L.pivot(acc, L.aAt(acc, j));
        // les essais intermédiaires sont rapportés ici ; le dernier l'est par l'effet sur `nTrials`
        if (i < todo.length - 1 && acc.trials.length > before) state.report(onTrial, trialReport(acc.trials[acc.trials.length - 1], acc));
      });
      labRef.current = acc;
      setLiveJ(todo[todo.length - 1]);
      setLab((s) => todo.reduce((acc, j) => L.pivot(acc, L.aAt(acc, j)), s));
    },
  } : undefined;

  /* ── lectures vivantes ── */
  const probeX = xi != null && canX ? L.valueAt(xi, snap.dx) : null;
  const probeXY = probeX != null ? L.imageOf(lab.lineA, probeX) : null;
  const probeY = yi != null && canY ? L.valueAt(yi, snap.dy) : null;
  const probeYX = probeY != null && lab.lineA && L.dirOf(lab.lineA) !== 'flat' ? L.antecedentOf(lab.lineA, probeY) : null;

  /* ── les mots ── */
  const fTex = a ? `f : x \\longmapsto ${L.numTex(L.parseValue(a))}x` : '';
  const missionText = mission ?? <MathText>{k(`mission.${mode}`, { f: fTex })}</MathText>;
  const hintKeys = [0, 1, 2].map((i) => k(`hints.${mode}.${i}`));
  const ruleVisible = showRule ?? theme !== 'cablecar';
  const verdict = verdictOf(lab, k, tw);

  /* ── la découverte : distracteurs réfutés par les essais de l'élève ── */
  const discoveryOptions = useMemo(() => discoveryFor(lab, k), [lab, k]);
  const formal = <Formal lab={lab} k={k} fTex={fTex} />;

  /* ── les questions PENDANT le labo (primitives/LabCheckpoint) : deux étapes par scène, la seconde finit par LA RÈGLE ── */
  const cpSettings = useLabCheckpointSettings('origin-line');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpLive = cpOn && cpSettings.enabled;
  const stageNow = cleared.includes(`${mode}1`) ? 1 : 0;
  const stageId = `${mode}${stageNow + 1}`;
  const stageOk = L.stageReached(lab, stageNow);
  const cp = useLabCheckpoint({
    id: cpLive ? stageId : null,
    questions: cpLive && stageOk ? chainOf(lab, stageNow).map((q) => QUESTIONS[q](lab, k, { fTex, formal, rulePrompt: <MathText>{k(`dPrompt.${mode}`)}</MathText> })) : null,
    reached: stageOk,
    resetKey: inits,
    onRetry: () => {
      const fresh = make();
      setLab(fresh); setPin(fresh.mode === 'draw' ? L.startPin(fresh) : null); setLiveXi(null); setLiveYi(null); setLiveJ(null); setDrag(null);
    },
    onEvent: (ev) => state.report(onCheckpoint, ev),   // {tk:'checkpoint'|'checkpoint-done', id: 'draw1'…, …} — la TRACE que les étapes du module relisent
    onDone: (id) => {
      setCleared((c) => (c.includes(id) ? c : [...c, id]));
      if (id === `${mode}2`) { state.discover(); state.formalize(); }
    },
  });
  useEffect(() => { if (ready && !cpLive) state.discover(); }, [ready, cpLive, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps

  // une étape est FAITE quand son objectif est atteint ET sa suite répondue : la pastille passe au vert et on fête
  const stepDone = [0, 1].map((i) => L.stageReached(lab, i) && (!cpLive || cleared.includes(`${mode}${i + 1}`)));
  const nDone = stepDone.findIndex((d) => !d) < 0 ? stepDone.length : stepDone.findIndex((d) => !d);
  const party = useStepCelebration();
  const celebrated = useRef({ n: 0, inits });
  if (celebrated.current.inits !== inits) celebrated.current = { n: 0, inits };   // « إعادة » : on refête
  useEffect(() => {
    if (nDone <= celebrated.current.n) return;
    celebrated.current.n = nDone;
    party.celebrate({ n: nDone, total: stepDone.length });
  }, [nDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // le son du GESTE (muet sans « الصوت ») : « bell » un point posé, « tooth » une lecture ou une droite, « flag » l'objectif, « over » un refus
  useEffect(() => {
    const kind = lab.last?.kind;
    if (!kind) return;
    if (kind === 'accepted') playSfx('bell');
    else if (kind === 'refused' || kind === 'origin') playSfx('over');
    else if (kind === 'fitAll' || (kind === 'read-y' && lab.last.capHit)) playSfx('flag');
    else playSfx('tooth');
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── représentation vivante ── */
  const representation = <Representation lab={lab} k={k} pivotA={pivotA} />;

  /* ── dessin ── */
  const W = Math.round(geo.W);
  const H = Math.round(geo.H);
  const xTicks = L.ticks(win.xMin, win.xMax, grid.xStep);
  const yTicks = L.ticks(win.yMin, win.yMax, grid.yStep);
  const labelEveryX = Math.max(1, Math.ceil(26 / (geo.ux * Lin2n(grid.xStep))));
  const labelEveryY = Math.max(1, Math.ceil(18 / (geo.uy * Lin2n(grid.yStep))));
  const seg = shownA != null ? L.lineSegment(shownA, win) : null;
  const dirOf = (aa) => (aa == null ? null : L.dirOf(aa));
  const candSeg = candA != null && !(lab.lineA && L.same(candA, lab.lineA)) ? L.lineSegment(candA, win) : null;
  const P = (x, y) => [geo.px(Lin2n(x)), geo.py(Lin2n(y))];

  const layout = wide ? 'side' : 'stack';
  const planeLabel = orth ? k('planeAria') : k('planeAriaFree');

  const plane = (
    <div dir="ltr" className="mx-auto w-max max-w-full" data-ol-planeblock>
      {/* le titre de l'axe des ordonnées, au-dessus de l'axe */}
      <div className="relative" style={{ height: TITLE_H, marginLeft: yStripOn ? strip : 0, width: W }}>
        <span dir="rtl" className="absolute top-0 truncate whitespace-nowrap text-[11px] font-bold text-slate-600" style={{ left: Math.max(0, Math.min(geo.px(0) + 6, W - 90)), maxWidth: W }} data-ol-axis="y">{tw('yAxis')}</span>
      </div>
      <div className="flex items-stretch">
        {yStripOn && (
          <Strip vertical s={sY} which="y" length={H} thick={strip} pos={probeY != null ? geo.py(Lin2n(probeY)) : null}
            disabled={!canY} label={k('probeY', { v: probeY != null ? L.numText(probeY) : k('probeNotSet') })}
            valueText={probeY != null ? L.numText(probeY) : k('probeNotSet')} tag={probeY != null ? `y = ${L.numText(probeY)}` : 'y'} tone="violet" />
        )}
        <div
          ref={planeRef}
          className={`relative shrink-0 rounded-lg border border-slate-200 bg-white ${mode === 'read' ? '' : 'cursor-crosshair'}`}
          style={{ width: W, height: H, touchAction: mode === 'read' ? 'auto' : 'none' }}
          onPointerDown={onPlaneDown} onPointerMove={onPlaneMove} onPointerUp={onPlaneUp} onPointerCancel={onPlaneUp}
          role="group" aria-label={planeLabel}
          data-ol-plane data-w={W} data-h={H}
        >
          <svg width={W} height={H} className="absolute inset-0" aria-hidden="true" focusable="false">
            <style>{OL_CSS}</style>
            {/* le budget : la région au-dessus du plafond */}
            {lab.cap != null && Lin2n(lab.cap) < win.yMax && (
              <rect x={geo.pad} y={geo.py(win.yMax)} width={W - 2 * geo.pad} height={Math.max(0, geo.py(Lin2n(lab.cap)) - geo.py(win.yMax))} fill="#FFE4E6" opacity={0.6} />
            )}
            {/* quadrillage */}
            {xTicks.map((x) => <line key={`gx${L.numText(x)}`} x1={geo.px(Lin2n(x))} x2={geo.px(Lin2n(x))} y1={geo.py(win.yMax)} y2={geo.py(win.yMin)} stroke="#E2E8F0" strokeWidth={1} />)}
            {yTicks.map((y) => <line key={`gy${L.numText(y)}`} x1={geo.px(win.xMin)} x2={geo.px(win.xMax)} y1={geo.py(Lin2n(y))} y2={geo.py(Lin2n(y))} stroke="#E2E8F0" strokeWidth={1} />)}
            {/* axes */}
            <line x1={geo.px(win.xMin)} x2={geo.px(win.xMax) + 6} y1={geo.py(0)} y2={geo.py(0)} stroke="#334155" strokeWidth={1.6} />
            <path d={`M${geo.px(win.xMax) + 8} ${geo.py(0)} l-7 -4 v8 z`} fill="#334155" />
            <line x1={geo.px(0)} x2={geo.px(0)} y1={geo.py(win.yMin)} y2={geo.py(win.yMax) - 6} stroke="#334155" strokeWidth={1.6} />
            <path d={`M${geo.px(0)} ${geo.py(win.yMax) - 8} l-4 7 h8 z`} fill="#334155" />
            {xTicks.map((x, n) => {
              const v = Lin2n(x);
              if (v === 0 || (Math.round(v / Lin2n(grid.xStep)) % labelEveryX) !== 0) return null;
              void n;
              const below = geo.py(0) + 13 <= H - 1;
              return <text key={`tx${v}`} x={geo.px(v)} y={below ? geo.py(0) + 12 : geo.py(0) - 4} textAnchor="middle" fontSize={10} fill="#475569" fontFamily="ui-monospace, monospace">{L.numText(x).replace('-', '−')}</text>;
            })}
            {yTicks.map((y) => {
              const v = Lin2n(y);
              if (v === 0 || (Math.round(v / Lin2n(grid.yStep)) % labelEveryY) !== 0) return null;
              const left = geo.px(0) - 4 >= 18;
              return <text key={`ty${v}`} x={left ? geo.px(0) - 4 : geo.px(0) + 4} y={geo.py(v) + 3.5} textAnchor={left ? 'end' : 'start'} fontSize={10} fill="#475569" fontFamily="ui-monospace, monospace">{L.numText(y).replace('-', '−')}</text>;
            })}
            <text x={geo.px(0) - 4} y={geo.py(0) + 12} textAnchor="end" fontSize={11} fontWeight="bold" fill="#0F172A" fontFamily="ui-monospace, monospace">O</text>
            {/* le plafond (budget) */}
            {lab.cap != null && (
              <line x1={geo.px(win.xMin)} x2={geo.px(win.xMax)} y1={geo.py(Lin2n(lab.cap))} y2={geo.py(Lin2n(lab.cap))} stroke="#E11D48" strokeWidth={2} strokeDasharray="6 4" data-ol-cap={L.numText(lab.cap)} />
            )}
            {/* la droite candidate (draw : O → épingle), en direct */}
            {candSeg && (
              <line x1={geo.px(candSeg[0][0])} y1={geo.py(candSeg[0][1])} x2={geo.px(candSeg[1][0])} y2={geo.py(candSeg[1][1])}
                stroke={COLORS[dirOf(candA)]} strokeWidth={1.8} strokeDasharray="5 4" opacity={0.8} data-ol-candidate data-dir={dirOf(candA)} />
            )}
            {/* la droite (le câble) */}
            {seg && (
              <g data-ol-line={L.numText(shownA)} data-dir={dirOf(shownA)}>
                {theme === 'cablecar' && <line x1={geo.px(seg[0][0])} y1={geo.py(seg[0][1])} x2={geo.px(seg[1][0])} y2={geo.py(seg[1][1])} stroke="#1E293B" strokeWidth={4.5} strokeLinecap="round" />}
                <line x1={geo.px(seg[0][0])} y1={geo.py(seg[0][1])} x2={geo.px(seg[1][0])} y2={geo.py(seg[1][1])}
                  stroke={theme === 'cablecar' ? '#94A3B8' : COLORS[dirOf(shownA)] ?? '#1D4ED8'} strokeWidth={theme === 'cablecar' ? 1.4 : 2.6} strokeLinecap="round" />
              </g>
            )}
            {/* chemins de lecture */}
            {probeX != null && probeXY != null && (
              <g data-ol-probe="x" data-x={L.numText(probeX)} data-y={L.numText(probeXY)}>
                <path d={`M${P(probeX, 0)} L${P(probeX, probeXY)} L${P(0, probeXY)}`} fill="none" stroke="#2563EB" strokeWidth={1.6} strokeDasharray="4 3" />
                <circle cx={P(probeX, probeXY)[0]} cy={P(probeX, probeXY)[1]} r={4} fill="#2563EB" />
                <ReadTag x={P(0, probeXY)[0]} y={P(0, probeXY)[1]} text={L.numText(probeXY)} side="y" tone="#2563EB" W={W} />
              </g>
            )}
            {probeY != null && probeYX != null && (
              <g data-ol-probe="y" data-x={L.numText(probeYX)} data-y={L.numText(probeY)}>
                <path d={`M${P(0, probeY)} L${P(probeYX, probeY)} L${P(probeYX, 0)}`} fill="none" stroke="#7C3AED" strokeWidth={1.6} strokeDasharray="4 3" />
                <circle cx={P(probeYX, probeY)[0]} cy={P(probeYX, probeY)[1]} r={4} fill="#7C3AED" />
                <ReadTag x={P(probeYX, 0)[0]} y={P(probeYX, 0)[1]} text={L.approxText(probeYX)} side="x" tone="#7C3AED" W={W} H={H} />
              </g>
            )}
            {/* points donnés / données */}
            {lab.points.map((p) => {
              const hit = shownA != null && L.same(L.imageOf(shownA, p.x), p.y);
              const [cx, cy] = P(p.x, p.y);
              return mode === 'fit'
                ? <circle key={`d${L.numText(p.x)}`} cx={cx} cy={cy} r={5} fill={hit ? '#059669' : '#F59E0B'} stroke="#fff" strokeWidth={1.5} data-ol-data={L.pointText(p.x, p.y)} data-hit={hit ? 'true' : 'false'} />
                : <circle key={`g${L.numText(p.x)}`} cx={cx} cy={cy} r={4.5} fill="#fff" stroke="#F59E0B" strokeWidth={2} data-ol-given={L.pointText(p.x, p.y)} />;
            })}
            {/* points acceptés */}
            {lab.placed.map((p) => {
              const [cx, cy] = P(p.x, p.y);
              return (
                <g key={p.label} data-ol-point={p.label}>
                  <circle cx={cx} cy={cy} r={5} fill="#059669" stroke="#fff" strokeWidth={1.5} />
                  <text x={cx + 6} y={cy - 6} fontSize={12} fontWeight="bold" fill="#065F46" fontFamily="ui-monospace, monospace">{p.label}</text>
                </g>
              );
            })}
            {/* le dernier point refusé, un instant */}
            {lab.last?.kind === 'refused' && (
              <g transform={`translate(${P(lab.last.x, lab.last.y).join(' ')})`} data-ol-refused={L.pointText(lab.last.x, lab.last.y)}>
                <g key={`r${shake.pin}`} className="ol-shake">
                  <path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke="#E11D48" strokeWidth={2.4} strokeLinecap="round" />
                </g>
              </g>
            )}
            {/* O, épinglé */}
            <g transform={`translate(${geo.px(0)} ${geo.py(0)})`}>
              <g key={`o${shake.o}`} className={shake.o ? 'ol-shake' : undefined} data-ol-bolt>
                <circle r={6.5} fill="#0F172A" />
                <circle r={2.4} fill="#FBBF24" />
              </g>
            </g>
            {theme === 'cablecar' && seg && <Cabin seg={seg} geo={geo} reduce={reduce} dragging={!!drag} />}
          </svg>
          {/* O : un bouton (clavier, lecteur d'écran) — il résiste */}
          <button type="button" aria-label={k('originAria')} onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); originTouched(); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ' || e.key.startsWith('Arrow')) { e.preventDefault(); originTouched(); } }}
            className="absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
            style={{ left: geo.px(0), top: geo.py(0) }} data-ol-origin />
          {/* l'épingle (draw) */}
          {mode === 'draw' && pin && (
            <button type="button" onKeyDown={onPinKey}
              aria-label={k('pin', { p: L.pointText(pinX, pinY) })}
              className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${drag === 'pin' ? 'bg-blue-500/10' : ''}`}
              style={{ left: geo.px(Lin2n(pinX)), top: geo.py(Lin2n(pinY)), cursor: drag === 'pin' ? 'grabbing' : 'grab' }}
              data-ol-pin={L.pointText(pinX, pinY)} data-i={pin.i} data-j={pin.j}>
              <span key={`p${shake.pin}`} className={`block h-4 w-4 rounded-full border-2 border-white shadow ${shake.pin ? 'ol-shake' : ''}`} style={{ background: '#2563EB' }} />
            </button>
          )}
          {/* les sondes posées sur les axes (téléphone, lecture) */}
          {overlayStrips && (
            <>
              <Strip s={sX} which="x" length={W} thick={strip} pos={probeX != null ? geo.px(Lin2n(probeX)) : null}
                style={{ position: 'absolute', left: 0, top: Math.min(H - strip, geo.py(0) - strip / 2) }}
                label={k('probeX', { v: probeX != null ? L.numText(probeX) : k('probeNotSet') })}
                valueText={probeX != null ? L.numText(probeX) : k('probeNotSet')} tag={probeX != null ? L.numText(probeX) : 'x'} tone="blue" />
              <Strip vertical s={sY} which="y" length={H} thick={strip} pos={probeY != null ? geo.py(Lin2n(probeY)) : null}
                style={{ position: 'absolute', top: 0, left: Math.max(0, geo.px(0) - strip / 2) }}
                label={k('probeY', { v: probeY != null ? L.numText(probeY) : k('probeNotSet') })}
                valueText={probeY != null ? L.numText(probeY) : k('probeNotSet')} tag={probeY != null ? L.numText(probeY) : 'y'} tone="violet" />
            </>
          )}
          {/* le décor */}
          <Deco theme={theme} reduce={reduce} probe={probeX ?? probeYX} win={win} />
        </div>
        {pStripOn && (
          <Strip vertical s={sP} which="pivot" length={H} thick={strip} pos={geo.py(L.toNum(pivotA) * L.toNum(lab.hx))}
            label={k('handle', { eq: L.lineText(pivotA) })} valueText={L.lineText(pivotA)} tag={null} tone="emerald" />
        )}
      </div>
      {xStripOn && (
        <div style={{ marginLeft: yStripOn ? strip : 0 }}>
          <Strip s={sX} which="x" length={W} thick={strip} pos={probeX != null ? geo.px(Lin2n(probeX)) : null}
            disabled={!canX} label={k('probeX', { v: probeX != null ? L.numText(probeX) : k('probeNotSet') })}
            valueText={probeX != null ? L.numText(probeX) : k('probeNotSet')} tag={probeX != null ? `x = ${L.numText(probeX)}` : 'x'} tone="blue" />
        </div>
      )}
      <div className="relative" style={{ height: TITLE_H, marginLeft: yStripOn ? strip : 0, width: W }}>
        <span dir="rtl" className="absolute top-0.5 max-w-full truncate whitespace-nowrap text-[11px] font-bold text-slate-600" style={{ right: 4 }} data-ol-axis="x">{tw('xAxis')}</span>
      </div>
    </div>
  );

  const controls = (
    <div ref={ctrlRef} className="space-y-2" data-ol-controls>
      <RuleLine lab={lab} k={k} tw={tw} fTex={fTex} ruleVisible={ruleVisible} pivotA={pivotA} theme={theme} />
      {mode === 'draw' && (
        <div className="flex flex-wrap items-center gap-1.5" data-ol-pinpad>
          <span className="rounded-lg border-2 border-blue-200 bg-blue-50 px-2 py-1 text-sm font-bold text-blue-900" aria-live="polite">
            {k('pinNow')} {pin ? <MathText>{`$${L.pointTex(pinX, pinY)}$`}</MathText> : "?"}
          </span>
          <div dir="ltr" className="flex gap-1">
            {[['left', -1, 0, ArrowLeft, 'pinLeft'], ['right', 1, 0, ArrowRight, 'pinRight'], ['up', 0, 1, ArrowUp, 'pinUp'], ['down', 0, -1, ArrowDown, 'pinDown']].map(([id, di, dj, Icon, key]) => (
              <button key={id} type="button" onClick={() => movePin(di, dj)} aria-label={k(key)} data-ol-move={id}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </button>
            ))}
          </div>
          <button type="button" onClick={() => commitPin(pinRef.current)} data-ol-place
            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-emerald-600 bg-white px-3 text-sm font-bold text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
            <MapPin className="h-4 w-4" aria-hidden="true" /> {k('place')}
          </button>
        </div>
      )}
      {(mode === 'read' || (mode === 'draw' && L.hasLine(lab))) && (
        <Readings lab={lab} k={k} tw={tw} theme={theme} probeX={probeX} probeXY={probeXY} probeY={probeY} probeYX={probeYX} sX={sX} sY={sY} canY={canY} />
      )}
      {pStripOn && (
        <div className="flex flex-wrap items-center gap-1.5" data-ol-pivotpad>
          <button type="button" onClick={() => sP.nudge(-1)} aria-label={k('lessA')} disabled={J <= hr.min} data-ol-less="a"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"><Minus className="h-5 w-5" aria-hidden="true" /></button>
          <button type="button" onClick={() => sP.nudge(1)} aria-label={k('moreA')} disabled={J >= hr.max} data-ol-more="a"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"><Plus className="h-5 w-5" aria-hidden="true" /></button>
          {mode === 'fit' && (
            <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-900" data-ol-hits>
              {k('hitsNow', { n: L.hitsOf(lab, pivotA).filter(Boolean).length, m: lab.points.length })}
            </span>
          )}
        </div>
      )}
      <p role="status" className="min-h-[2.5rem] text-sm font-bold leading-snug" data-ol-verdict={lab.last?.kind ?? ''}>{verdict}</p>
    </div>
  );

  return (
    <ManipulationShell
      type="origin-line"
      title={title ?? k('title')}
      mission={missionText}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      guided={cpLive}
      hints={hintKeys.map((h) => <MathText key={h}>{h}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false, ...(autoComplete ? { autoComplete } : {}) }}
      representation={representation}
      discovery={(
        <ManipulationDiscovery state={state} prompt={<MathText>{k(`dPrompt.${mode}`)}</MathText>} options={discoveryOptions} formal={formal} />
      )}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/70 to-white">
        <div ref={boxRef} className="relative space-y-3" data-origin-line data-mode={mode} data-theme={theme} data-a={a ?? ''}
          data-line-a={shownA != null ? L.numText(shownA) : ''} data-layout={layout} data-budget={budget} data-ctrl-h={ctrlH}>
          {party.node}
          {cp.node}
          <LabStepper count={2} current={stageNow} done={stepDone} stepAttr="data-ol-step" />
          <div className={wide ? 'grid items-start gap-3' : 'space-y-3'} style={wide ? { gridTemplateColumns: `${planeCol}px 1fr` } : undefined} data-ol-glance>
            {plane}
            {controls}
          </div>
          {lab.trials.length > 0 && (
            <LabFold id="origin-line.trials" title={k('trialsTitle')}>
              <ul className="flex flex-wrap gap-1.5" data-ol-trials>
                {lab.trials.slice(-12).map((tr, n) => (
                  <li key={`${tr.kind}${n}`} data-ol-trial={tr.kind} data-ok={tr.ok === false ? 'false' : 'true'}
                    className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${tr.ok === false ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-emerald-300 bg-emerald-50 text-emerald-900'}`}>
                    <MathText>{`$${trialTex(tr)}$`}</MathText>
                    {tr.kind === 'point' && <> · {k(tr.ok ? 'tAccepted' : 'tRefused')}</>}
                    {tr.kind === 'line' && <> · {k(`dirShort.${tr.dir}`)}</>}
                  </li>
                ))}
              </ul>
            </LabFold>
          )}
          {/* le monde, en une ligne (sous la manipulation, jamais entre le plan et ses commandes) */}
          {i18n.exists(`lesson:manipulation.originLine.themes.${theme}.world`) && <p className="text-[11px] text-slate-500" data-ol-world>{tw('world')}</p>}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ── le pixel d'une valeur exacte (le dessin seulement ; tout calcul passe par logic/originLine → core) ── */
const Lin2n = (p) => L.toNum(p);
const signOf = (a) => L.dirOf(a);

function trialTex(tr) {
  if (tr.kind === 'point') return L.pointTex(tr.x, tr.y);
  if (tr.kind === 'read-x') return `f(${L.numTex(tr.v)}) = ${L.numTex(tr.other)}`;
  if (tr.kind === 'read-y') return L.readYTex(tr.v, tr.other);
  if (tr.kind === 'line') return L.lineTex(tr.a);
  return '';
}

function trialReport(tr, lab) {
  const base = { mode: lab.mode, kind: tr.kind };
  if (tr.kind === 'point') return { ...base, ok: tr.ok, x: L.numText(tr.x), y: L.numText(tr.y), label: tr.label ?? null, pointTex: L.pointTex(tr.x, tr.y), fx: L.numText(tr.fx), gap: L.numText(tr.gap) };
  if (tr.kind === 'read-x') return { ...base, ok: true, x: L.numText(tr.v), y: L.numText(tr.other), tex: `f(${L.numTex(tr.v)}) = ${L.numTex(tr.other)}` };
  if (tr.kind === 'read-y') return { ...base, ok: true, x: L.numText(tr.other), y: L.numText(tr.v), capHit: tr.capHit, tex: `${L.approxTex(tr.other)}` };
  return { ...base, ok: true, a: L.numText(tr.a), dir: tr.dir, hits: tr.hits.filter(Boolean).length, tex: L.lineTex(tr.a) };
}

/* ── la ligne de la règle (en tête des commandes) ── */
function RuleLine({ lab, k, tw, fTex, ruleVisible, pivotA, theme }) {
  if (lab.mode === 'draw') {
    return <p className="text-sm font-bold text-slate-800" data-ol-rule><span className="text-slate-500">{k('rule')}:</span> <MathText>{`$${fTex}$`}</MathText></p>;
  }
  if (lab.mode === 'read') {
    return (
      <p className="text-sm font-bold text-slate-800" data-ol-rule>
        <span className="text-slate-500">{theme === 'cablecar' ? k('lineD') : tw('line')}:</span>{' '}
        {ruleVisible ? <MathText>{`$${L.lineTex(lab.a)}$`}</MathText> : <bdi dir="ltr">(D)</bdi>}
        {lab.cap != null && <> · <span className="text-rose-700">{tw('cap')}</span> <MathText>{`$y = ${L.numTex(lab.cap)}$`}</MathText></>}
      </p>
    );
  }
  const dir = signOf(pivotA);
  return (
    <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-800" data-ol-rule data-dir={dir}>
      <span className="text-slate-500">{k('lineNow')}:</span>
      <span className="rounded-lg border-2 border-slate-300 bg-white px-2 py-0.5"><MathText>{`$${L.lineTex(pivotA)}$`}</MathText></span>
      <span className="rounded-full px-2 py-0.5 text-xs text-white" style={{ background: COLORS[dir] }}>{k(`dir.${dir}`)}</span>
    </p>
  );
}

/* ── les lectures et les cibles ── */
function Readings({ lab, k, tw, theme, probeX, probeXY, probeY, probeYX, sX, sY, canY }) {
  const done = L.targetsDone(lab);
  const extra = (key, x, y) => {
    const s = tw(key, { x, y });
    return s && theme !== 'cablecar' ? <span className="block text-xs font-normal text-slate-600"><MathText>{s}</MathText></span> : null;
  };
  return (
    <div className="space-y-1.5" data-ol-readings>
      {lab.reads.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label={k('targetsTitle')}>
          {lab.reads.map((r, i) => (
            <li key={`${r.axis}${L.numText(r.v)}`} data-ol-target={i} data-done={done[i] ? 'true' : 'false'}
              className={`rounded-lg border-2 px-2 py-0.5 text-xs font-bold ${done[i] ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : 'border-slate-300 bg-white text-slate-700'}`}>
              {done[i] ? '✓ ' : '○ '}<MathText>{k(r.axis === 'x' ? 'targetX' : 'targetY', { v: L.numTex(r.v) })}</MathText>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-1.5" data-ol-read="x">
        <StepButtons s={sX} less={k('lessX')} more={k('moreX')} which="x" />
        <span className="min-w-0 text-sm font-bold text-blue-900">
          {probeX != null && probeXY != null
            ? <><MathText>{`$f(${L.numTex(probeX)}) = ${L.numTex(probeXY)}$`}</MathText>{extra('readX', L.numTex(probeX), L.numTex(probeXY))}</>
            : <span className="text-xs font-normal text-slate-500">{k('probeXShort')}</span>}
        </span>
      </div>
      {canY && (
        <div className="flex flex-wrap items-center gap-1.5" data-ol-read="y">
          <StepButtons s={sY} less={k('lessY')} more={k('moreY')} which="y" />
          <span className="min-w-0 text-sm font-bold text-violet-900">
            {probeY != null && probeYX != null
              ? <><MathText>{`$x = ${L.approxTex(probeYX)}$`}</MathText>{extra('readY', L.approxTex(probeYX), L.numTex(probeY))}</>
              : <span className="text-xs font-normal text-slate-500">{k('probeYShort')}</span>}
          </span>
        </div>
      )}
    </div>
  );
}

function StepButtons({ s, less, more, which }) {
  return (
    <span dir="ltr" className="inline-flex gap-1">
      <button type="button" onClick={() => s.nudge(-1)} aria-label={less} data-ol-less={which}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Minus className="h-5 w-5" aria-hidden="true" /></button>
      <button type="button" onClick={() => s.nudge(1)} aria-label={more} data-ol-more={which}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Plus className="h-5 w-5" aria-hidden="true" /></button>
    </span>
  );
}

/* ── une piste collée au plan : une sonde (x / y) ou le زالق (pivot) ── */
function Strip({ s, which, vertical = false, length, thick, pos, label, valueText, tag, tone, disabled = false, style = null }) {
  const color = { blue: '#2563EB', violet: '#7C3AED', emerald: '#059669' }[tone];
  const box = vertical ? { width: thick, height: length } : { width: length, height: thick };
  return (
    <div {...(disabled ? {} : s.trackProps)} className={`relative shrink-0 ${disabled ? 'opacity-40' : ''}`}
      style={{ ...(disabled ? {} : s.trackProps.style), ...box, ...(style ?? {}) }} data-ol-strip={which} data-disabled={disabled ? 'true' : undefined}>
      <div className="absolute rounded-full" style={vertical
        ? { left: thick / 2 - 2, top: 8, bottom: 8, width: 4, background: color, opacity: 0.35 }
        : { top: thick / 2 - 2, left: 8, right: 8, height: 4, background: color, opacity: 0.35 }} />
      {!disabled && (
        <div
          {...s.handleProps({ label, valueText })}
          className={`absolute z-10 flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 bg-white px-1 outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${s.dragging ? 'shadow-md' : ''}`}
          style={vertical
            ? { left: thick / 2, top: pos ?? length / 2, transform: 'translate(-50%, -50%)', borderColor: color, cursor: s.dragging ? 'grabbing' : 'grab' }
            : { top: thick / 2, left: pos ?? length / 2, transform: 'translate(-50%, -50%)', borderColor: color, cursor: s.dragging ? 'grabbing' : 'grab' }}
          data-ol-handle={which}
        >
          <span className="whitespace-nowrap font-mono text-[11px] font-extrabold" style={{ color }}>{tag ?? (vertical ? '⇕' : '⇔')}</span>
        </div>
      )}
    </div>
  );
}

function ReadTag({ x, y, text, side, tone, W, H = 0 }) {
  const w = 8 + text.length * 6.4;
  const tx = side === 'y' ? Math.max(1, Math.min(W - w - 1, x + 4)) : Math.max(1, Math.min(W - w - 1, x - w / 2));
  const ty = side === 'y' ? y - 17 : Math.min(H - 17, y + 3);
  return (
    <g>
      <rect x={tx} y={ty} width={w} height={14} rx={4} fill="#fff" stroke={tone} strokeWidth={1} />
      <text x={tx + w / 2} y={ty + 10.5} textAnchor="middle" fontSize={10} fontWeight="bold" fill={tone} fontFamily="ui-monospace, monospace">{text.replace('-', '−')}</text>
    </g>
  );
}

/* ── le verdict : la conséquence mathématique, dans les mots de la leçon ── */
function verdictOf(lab, k, tw) {
  const last = lab.last;
  if (!last) return null;
  const T = (s) => <MathText>{s}</MathText>;
  switch (last.kind) {
    case 'origin': return <span className="text-amber-800" data-ol-origin-refused>{T(k('origin'))}</span>;
    case 'same': return <span className="text-slate-700">{k('vSame')}</span>;
    case 'refused': return <span className="text-rose-800">{T(k('vRefused', { p: L.pointTex(last.x, last.y), calc: L.productTex(lab.a, last.x), y: L.numTex(last.y), gap: L.absTex(last.gap) }))}</span>;
    case 'accepted': return (
      <span className="text-emerald-800">
        {T(k('vAccepted', { label: last.label, p: L.pointTex(last.x, last.y), calc: L.productTex(lab.a, last.x) }))}
        {last.first && <> {T(k('vFirst', { label: last.label }))}</>}
      </span>
    );
    case 'read-x': return <span className="text-blue-900">{T(k('vReadX', { x: L.numTex(last.v), y: L.numTex(last.other) }))}</span>;
    case 'read-y': return (
      <span className="text-violet-900">
        {T(k('vReadY', { y: L.numTex(last.v), x: L.approxTex(last.other) }))}
        {last.capHit && <> {T(k('vCap', { cap: tw('cap'), x: L.approxTex(last.other) }))}</>}
      </span>
    );
    case 'line': return <span style={{ color: COLORS[last.dir] }}>{T(k('vLine', { eq: L.lineTex(last.a), dir: k(`dir.${last.dir}`) }))}</span>;
    case 'fitAll': return <span className="text-emerald-800">{T(k('vFitAll', { eq: L.lineTex(last.a) }))}</span>;
    case 'fitSome': return <span className="text-amber-800">{T(k('vFitSome', { eq: L.lineTex(last.a), n: last.nHits, m: lab.points.length }))}</span>;
    default: return null;
  }
}

/* ── la découverte ── */
function discoveryFor(lab, k) {
  const M = (s) => <MathText>{s}</MathText>;
  if (lab.mode === 'draw') {
    const [A, B] = lab.placed;
    if (!A || !B) return [];
    return [
      { text: M(k('dOpt.drawNotAligned', { A: A.label, B: B.label })), why: M(k('dOpt.drawNotAlignedWhy', { pA: `${A.label}${L.pointTex(A.x, A.y)}`, pB: `${B.label}${L.pointTex(B.x, B.y)}` })) },
      { text: M(k('dOpt.drawRight', { A: A.label, B: B.label })), correct: true },
      { text: M(k('dOpt.drawNoO')), why: M(k('dOpt.drawNoOWhy', { a: L.numTex(lab.a) })) },
    ];
  }
  if (lab.mode === 'read') {
    const rx = lab.readsDone.find((r) => r.axis === 'x');
    const opts = [{ text: M(k('dOpt.readRight')), correct: true }];
    if (rx) {
      opts.unshift({ text: M(k('dOpt.readSwap')), why: M(k('dOpt.readSwapWhy', { x: L.numTex(rx.v), y: L.numTex(rx.other) })) });
      opts.push({ text: M(k('dOpt.readCalc')), why: M(k('dOpt.readCalcWhy', { x: L.numTex(rx.v), y: L.numTex(rx.other) })) });
    }
    return opts;
  }
  if (lab.mode === 'pivot') {
    const up = lab.lines.find((l) => l.dir === 'rising');
    return [
      { text: M(k('dOpt.pivotReversed')), why: M(k('dOpt.pivotReversedWhy', { up: up ? L.lineTex(up.a) : 'y = x' })) },
      { text: M(k('dOpt.pivotRight')), correct: true },
      { text: M(k('dOpt.pivotMovesO')), why: M(k('dOpt.pivotMovesOWhy')) },
    ];
  }
  if (L.fitPossible(lab)) {
    const some = lab.lines.find((l) => l.hits.some(Boolean) && !l.hits.every(Boolean));
    const opts = [{ text: M(k('dOpt.fitRight', { eq: L.lineTex(lab.fitA) })), correct: true }];
    if (some) opts.push({ text: M(k('dOpt.fitOne')), why: M(k('dOpt.fitOneWhy', { eq: L.lineTex(some.a) })) });
    return opts;
  }
  return [
    { text: M(k('dOpt.fitNoWrong')), why: M(k('dOpt.fitNoWrongWhy')) },
    { text: M(k('dOpt.fitNoRight')), correct: true },
  ];
}

export function Formal({ lab, k, fTex }) {
  const M = (s) => <MathText>{s}</MathText>;
  if (lab.mode === 'draw') {
    const pts = [{ x: L.parseValue('0'), y: L.parseValue('0'), label: 'O' }, ...lab.placed];
    return (
      <div className="space-y-2" data-ol-formal="draw">
        <EquationDisplay tone="result" tex={L.lineTex(lab.a)} note={M(k('fDraw', { A: lab.placed[0]?.label ?? 'A', f: fTex }))} />
        <div dir="ltr" className="overflow-x-auto">
          <table className="border-collapse text-sm" data-ol-table>
            <tbody>
              <tr><th className="border border-slate-300 bg-slate-50 px-2 font-mono">x</th>{pts.map((p) => <td key={`x${p.label}`} className="border border-slate-300 px-2 text-center">{M(`$${L.numTex(p.x)}$`)}</td>)}</tr>
              <tr><th className="border border-slate-300 bg-slate-50 px-2 font-mono">f(x)</th>{pts.map((p) => <td key={`y${p.label}`} className="border border-slate-300 px-2 text-center">{M(`$${L.numTex(p.y)}$`)}</td>)}</tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-emerald-900">{M(k('fDrawRule'))}</p>
        <p className="text-sm text-slate-800">{M(k('fDrawM', { eq: L.lineTex(lab.a) }))}</p>
      </div>
    );
  }
  if (lab.mode === 'read') {
    return (
      <div className="space-y-2" data-ol-formal="read">
        <p className="text-sm font-bold text-slate-700">{k('fRead')}</p>
        <ul className="space-y-1 text-sm">
          {lab.readsDone.slice(-4).map((r) => (
            <li key={`${r.axis}${L.numText(r.v)}`} dir="ltr" className="text-start">
              {r.axis === 'x' ? M(`$f(${L.numTex(r.v)}) = ${L.numTex(r.other)}$`) : M(`$${L.readYTex(r.v, r.other)}$`)}
            </li>
          ))}
        </ul>
        <p className="text-sm text-emerald-900">{M(k('fReadRule'))}</p>
      </div>
    );
  }
  if (lab.mode === 'pivot') {
    return (
      <div className="space-y-2" data-ol-formal="pivot">
        <p className="text-sm text-emerald-900">{M(k('fPivot'))}</p>
        <p className="text-sm text-slate-700">{k('fPivotMine')} {lab.lines.slice(-4).map((l) => <span key={L.numText(l.a)} className="me-2" style={{ color: COLORS[l.dir] }}>{M(`$${L.lineTex(l.a)}$`)} ({k(`dirShort.${l.dir}`)})</span>)}</p>
      </div>
    );
  }
  return (
    <div className="space-y-2" data-ol-formal="fit">
      {L.fitPossible(lab)
        ? <EquationDisplay tone="result" tex={L.lineTex(lab.fitA)} note={M(k('fFit', { eq: L.lineTex(lab.fitA), a: L.numTex(lab.fitA) }))} />
        : <p className="text-sm text-slate-800">{M(k('fFitNo'))}</p>}
    </div>
  );
}

function Representation({ lab, k, pivotA }) {
  if (lab.mode === 'draw') {
    const tex = ['O(0 ; 0)', ...lab.placed.map((p) => `${p.label}${L.pointTex(p.x, p.y)}`)].join(',\\ ');
    return <EquationDisplay tone={lab.placed.length ? 'ok' : 'neutral'} tex={tex} note={lab.placed.length ? null : k('noLine')} />;
  }
  if (lab.mode === 'read') {
    const lines = lab.readsDone.slice(-2).map((r) => (r.axis === 'x' ? `f(${L.numTex(r.v)}) = ${L.numTex(r.other)}` : L.readYTex(r.v, r.other)));
    return lines.length ? <EquationDisplay tone="ok" tex={lines.join(',\\quad ')} /> : null;
  }
  return <EquationDisplay tone="neutral" tex={L.lineTex(pivotA)} note={k(`dir.${signOf(pivotA)}`)} />;
}

/* ── la cabine du téléphérique, pendue au câble (décor) ── */
function Cabin({ seg, geo, reduce, dragging }) {
  const [far, setFar] = useState(false);
  // le bout du câble le plus loin de O (côté des x positifs s'il existe)
  const end = seg[1][0] > 0 ? seg[1] : seg[0];
  const f = far ? 0.82 : 0.42;
  const X = geo.px(end[0] * f);
  const Y = geo.py(end[1] * f);
  return (
    <g style={{ transform: `translate(${X}px, ${Y}px)`, transition: reduce || dragging ? 'none' : 'transform 1100ms ease-in-out', cursor: 'pointer' }}
      onPointerDown={(e) => e.stopPropagation()} onClick={() => setFar((v) => !v)} data-deco="cablecar" pointerEvents="all">
      <line x1={0} y1={0} x2={0} y2={9} stroke="#1E293B" strokeWidth={1.6} />
      <circle r={2.6} fill="#1E293B" />
      <rect x={-11} y={9} width={22} height={15} rx={4} fill="#DC2626" stroke="#7F1D1D" strokeWidth={1} />
      <rect x={-8} y={12} width={7} height={6} rx={1} fill="#E0F2FE" />
      <rect x={1} y={12} width={7} height={6} rx={1} fill="#E0F2FE" />
      <rect x={-11} y={21} width={22} height={3} fill="#F8FAFC" opacity={0.85} />
    </g>
  );
}

/* ── le décor des autres mondes (sans information) ── */
function Deco({ theme, reduce, probe, win }) {
  const [taps, setTaps] = useState(0);
  if (theme === 'cablecar') return null;
  const anim = taps > 0 && !reduce;
  const ratio = probe ? Math.max(0.15, Math.min(1, Math.abs(Lin2n(probe)) / Math.max(1, Math.abs(win.xMax)))) : 0.4;
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" onPointerDown={(e) => e.stopPropagation()} onClick={() => !reduce && setTaps((n) => n + 1)} data-deco={theme}
      className="absolute right-1 top-1 h-12 w-10 rounded-lg focus:outline-none">
      <svg viewBox="0 0 40 60" width="100%" height="100%">
        {theme === 'spring' && (
          <g key={taps} className={anim ? 'ol-bounce' : undefined}>
            <rect x={6} y={1} width={28} height={3} rx={1} fill="#475569" />
            <path d={springPath(20, 4, 10 + 30 * ratio)} fill="none" stroke="#0EA5E9" strokeWidth={1.8} />
            <rect x={13} y={14 + 30 * ratio} width={14} height={10} rx={2} fill="#64748B" />
          </g>
        )}
        {theme === 'budget' && (
          <g>
            <rect x={4} y={24} width={32} height={22} rx={5} fill="#16A34A" stroke="#14532D" strokeWidth={1.2} />
            <circle cx={30} cy={35} r={3} fill="#FDE68A" />
            <g key={taps} className={anim ? 'ol-drop' : undefined}>
              <circle cx={20} cy={12} r={6} fill="#FBBF24" stroke="#B45309" strokeWidth={1.2} />
            </g>
          </g>
        )}
      </svg>
    </button>
  );
}

function springPath(x, y0, len) {
  const n = 7; const step = len / n;
  let d = `M${x} ${y0} `;
  for (let i = 0; i < n; i++) d += `L${x + (i % 2 ? -6 : 6)} ${y0 + step * (i + 0.5)} `;
  return `${d}L${x} ${y0 + len}`;
}

const OL_CSS = '.ol-shake{animation:ol-s .35s ease-in-out 1}@keyframes ol-s{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}'
  + '.ol-bounce{animation:ol-b .5s ease-out 2}@keyframes ol-b{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}'
  + '.ol-drop{animation:ol-d .6s ease-in 1}@keyframes ol-d{0%{transform:translateY(-8px);opacity:.3}100%{transform:translateY(0);opacity:1}}'
  + '@media (prefers-reduced-motion: reduce){.ol-shake,.ol-bounce,.ol-drop{animation:none}}';

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/**
 * La suite de questions de chaque étape d'une scène. Étape 0 : le premier objectif atteint (un point posé · une lecture · une droite) ; étape 1 :
 * la découverte prête, la suite finit par LA RÈGLE (l'ancienne découverte, qui formalise).
 */
export function chainOf(lab, stage) {
  const m = lab.mode;
  if (stage === 0) return { draw: ['dratio', 'dpredict'], read: ['rvocab', 'rcompute'], pivot: ['pdir', 'pordinate'], fit: ['fhits', 'fratio'] }[m];
  return { draw: ['dalign', 'rule'], read: ['rways', 'rule'], pivot: ['psign', 'rule'], fit: [L.fitPossible(lab) ? 'fcommon' : 'fnone', 'rule'] }[m];
}

const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const D = (x) => `$${x}$`;
const spread = (list, seed) => { const r = seed % list.length; return [...list.slice(r), ...list.slice(0, r)]; };
const seedOf = (lab) => lab.trials.length + lab.placed.length + lab.readsDone.length + lab.lines.length;
const T = (x) => <MathText>{D(L.numTex(x))}</MathText>;

/** Une valeur à calculer : saisie libre si elle est ≥ 0 (une réponse saisie ne peut être négative), sinon trois choix aux erreurs réelles (signe, décalage). */
function valueQ(lab, k, { id, v, prompt, hints, explain }) {
  if (Lin.cmp(v, 0) >= 0) return { id, kind: 'number', expected: Lin.fracText(v), answer: T(v), prompt, hints, explain };
  const opts = [
    { text: T(v), correct: true },
    { text: T(Lin.neg(v)), why: Cq(k, 'sign') },
    { text: T(Lin.add(v, 1)), why: Cq(k, 'off') },
  ];
  return { id, kind: 'choice', cols: 3, prompt, options: spread(opts, seedOf(lab)), hints, explain };
}

const lastOf = (list, axis) => [...list].reverse().find((r) => r.axis === axis);

export const QUESTIONS = {
  /* ── draw ── */
  dratio: (lab, k) => {
    const A = lab.placed[0];
    const r = L.slopeThrough(A.x, A.y);
    const o = { A: A.label, x: D(L.numTex(A.x)), y: D(L.numTex(A.y)), P: D(L.pointTex(A.x, A.y)), a: D(L.numTex(r)), calc: D(`${L.numTex(A.y)} \\div ${Lin.cmp(A.x, 0) < 0 ? `(${L.numTex(A.x)})` : L.numTex(A.x)} = ${L.numTex(r)}`) };
    return valueQ(lab, k, { id: 'dratio', v: r, prompt: Cq(k, 'dratio.prompt', o), hints: [Cq(k, 'dratio.hint1', o), Cq(k, 'dratio.hint2', o)], explain: Cq(k, 'dratio.explain', o) });
  },
  dpredict: (lab, k) => {
    const A = lab.placed[0];
    const xq = Lin.mul(A.x, 2);
    const v = L.imageOf(lab.a, xq);
    const o = { x: D(L.numTex(xq)), a: D(L.numTex(lab.a)), ax: D(`${L.numTex(lab.a)} \\times ${Lin.cmp(xq, 0) < 0 ? `(${L.numTex(xq)})` : L.numTex(xq)}`), calc: D(L.productTex(lab.a, xq)) };
    return valueQ(lab, k, { id: 'dpredict', v, prompt: Cq(k, 'dpredict.prompt', o), hints: [Cq(k, 'dpredict.hint1', o), Cq(k, 'dpredict.hint2', o)], explain: Cq(k, 'dpredict.explain', o) });
  },
  dalign: (lab, k) => {
    const [A] = lab.placed;
    const B = lab.placed.find((p) => !L.same(p.x, A.x)) ?? lab.placed[1];
    const o = { A: A.label, B: B.label, xa: D(L.numTex(A.x)), xb: D(L.numTex(B.x)), ya: D(L.numTex(A.y)), yb: D(L.numTex(B.y)), a: D(L.numTex(lab.a)) };
    const opts = [
      { text: Cq(k, 'dalign.ratio', o), correct: true },
      { text: Cq(k, 'dalign.x', o), why: Cq(k, 'dalign.whyX', o) },
      { text: Cq(k, 'dalign.y', o), why: Cq(k, 'dalign.whyY', o) },
    ];
    return { id: 'dalign', kind: 'choice', cols: 3, prompt: Cq(k, 'dalign.prompt', o), options: spread(opts, seedOf(lab)), hints: [Cq(k, 'dalign.hint1', o), Cq(k, 'dalign.hint2', o)], explain: Cq(k, 'dalign.explain', o) };
  },
  /* ── read ── */
  rvocab: (lab, k) => {
    const r = lab.readsDone[lab.readsDone.length - 1];
    const o = { v: D(L.numTex(r.v)), other: D(r.axis === 'x' ? L.numTex(r.other) : L.approxTex(r.other)), a: D(L.numTex(lab.lineA)) };
    const isX = r.axis === 'x';
    const opts = [
      { text: Cq(k, 'rvocab.image', o), ...(isX ? { correct: true } : { why: Cq(k, 'rvocab.whyImage', o) }) },
      { text: Cq(k, 'rvocab.ant', o), ...(!isX ? { correct: true } : { why: Cq(k, 'rvocab.whyAnt', o) }) },
      { text: Cq(k, 'rvocab.coef', o), why: Cq(k, 'rvocab.whyCoef', o) },
    ];
    return { id: 'rvocab', kind: 'choice', cols: 3, prompt: Cq(k, isX ? 'rvocab.promptX' : 'rvocab.promptY', o), options: spread(opts, seedOf(lab)), hints: [Cq(k, 'rvocab.hint1', o), Cq(k, 'rvocab.hint2', o)], explain: Cq(k, isX ? 'rvocab.explainX' : 'rvocab.explainY', o) };
  },
  rcompute: (lab, k) => {
    const r = lab.readsDone[lab.readsDone.length - 1];
    const a = lab.lineA;
    if (r.axis === 'x') {
      const o = { a: D(L.numTex(a)), x: D(L.numTex(r.v)), ax: D(`${L.numTex(a)} \\times ${L.numTex(r.v)}`), calc: D(L.productTex(a, r.v)) };
      return valueQ(lab, k, { id: 'rcompute', v: r.other, prompt: Cq(k, 'rcompute.promptX', o), hints: [Cq(k, 'rcompute.hint1X', o), Cq(k, 'rcompute.hint2X', o)], explain: Cq(k, 'rcompute.explainX', o) });
    }
    const o = { a: D(L.numTex(a)), y: D(L.numTex(r.v)) };
    const opts = [
      { text: Cq(k, 'rcompute.div', o), correct: true },
      { text: Cq(k, 'rcompute.times', o), why: Cq(k, 'rcompute.whyTimes', o) },
      { text: Cq(k, 'rcompute.minus', o), why: Cq(k, 'rcompute.whyMinus', o) },
    ];
    return { id: 'rcompute', kind: 'choice', cols: 3, prompt: Cq(k, 'rcompute.promptY', o), options: spread(opts, seedOf(lab)), hints: [Cq(k, 'rcompute.hint1Y', o), Cq(k, 'rcompute.hint2Y', o)], explain: Cq(k, 'rcompute.explainY', o) };
  },
  rways: (lab, k) => {
    const a = lab.lineA;
    const rx = lastOf(lab.readsDone, 'x'); const ry = lastOf(lab.readsDone, 'y');
    const o = {
      a: D(L.numTex(a)),
      x: D(L.numTex(rx?.v ?? 1)), y: D(L.numTex(rx?.other ?? a)),
      y2: D(L.numTex(ry?.v ?? 1)), eq: D(`${L.numTex(a)} \\times ${L.numTex(rx?.v ?? 1)} = ${L.numTex(rx?.other ?? a)}`),
    };
    const opts = [
      { text: Cq(k, 'rways.right', o), correct: true },
      { text: Cq(k, 'rways.swap', o), why: Cq(k, 'rways.whySwap', o) },
      { text: Cq(k, 'rways.both', o), why: Cq(k, 'rways.whyBoth', o) },
    ];
    return { id: 'rways', kind: 'choice', cols: 3, prompt: Cq(k, 'rways.prompt'), options: spread(opts, seedOf(lab)), hints: [Cq(k, 'rways.hint1', o), Cq(k, 'rways.hint2', o)], explain: Cq(k, 'rways.explain', o) };
  },
  /* ── pivot ── */
  pdir: (lab, k) => {
    const l = lab.lines[lab.lines.length - 1];
    const o = { a: D(L.numTex(l.a)), eq: D(L.lineTex(l.a)) };
    const opts = ['rising', 'falling', 'flat'].map((d) => ({ text: Cq(k, `pdir.${d}`), ...(l.dir === d ? { correct: true } : { why: Cq(k, 'pdir.why', o) }) }));
    return { id: 'pdir', kind: 'choice', cols: 3, prompt: Cq(k, 'pdir.prompt', o), options: opts, hints: [Cq(k, 'pdir.hint1', o), Cq(k, 'pdir.hint2', o)], explain: Cq(k, `pdir.explain.${l.dir}`, o) };
  },
  pordinate: (lab, k) => {
    const l = lab.lines[lab.lines.length - 1];
    const two = Lin.frac(2);
    const v = L.imageOf(l.a, two);
    const o = { eq: D(L.lineTex(l.a)), a: D(L.numTex(l.a)), ax: D(`${L.numTex(l.a)} \\times 2`), calc: D(L.productTex(l.a, two)) };
    return valueQ(lab, k, { id: 'pordinate', v, prompt: Cq(k, 'pordinate.prompt', o), hints: [Cq(k, 'pordinate.hint1', o), Cq(k, 'pordinate.hint2', o)], explain: Cq(k, 'pordinate.explain', o) });
  },
  psign: (lab, k) => {
    const up = lab.lines.find((l) => l.dir === 'rising');
    const down = lab.lines.find((l) => l.dir === 'falling');
    const o = { up: D(L.lineTex(up.a)), down: D(L.lineTex(down.a)) };
    const opts = [
      { text: Cq(k, 'psign.sign'), correct: true },
      { text: Cq(k, 'psign.abs'), why: Cq(k, 'psign.whyAbs', o) },
      { text: Cq(k, 'psign.origin'), why: Cq(k, 'psign.whyOrigin', o) },
    ];
    return { id: 'psign', kind: 'choice', cols: 3, prompt: Cq(k, 'psign.prompt', o), options: spread(opts, seedOf(lab)), hints: [Cq(k, 'psign.hint1', o), Cq(k, 'psign.hint2', o)], explain: Cq(k, 'psign.explain', o) };
  },
  /* ── fit ── */
  fhits: (lab, k) => {
    const l = lab.lines[lab.lines.length - 1];
    const n = l.hits.filter(Boolean).length;
    const o = { eq: D(L.lineTex(l.a)), m: lab.points.length, n };
    return { id: 'fhits', kind: 'number', expected: String(n), answer: <MathText>{D(String(n))}</MathText>, prompt: Cq(k, 'fhits.prompt', o), hints: [Cq(k, 'fhits.hint1', o), Cq(k, 'fhits.hint2', o)], explain: Cq(k, 'fhits.explain', o) };
  },
  fratio: (lab, k) => {
    const p = lab.points.find((q) => !Lin.isZero(q.x)) ?? lab.points[0];
    const r = L.slopeThrough(p.x, p.y);
    const o = { x: D(L.numTex(p.x)), y: D(L.numTex(p.y)), P: D(L.pointTex(p.x, p.y)), a: D(L.numTex(r)), calc: D(`${L.numTex(p.y)} \\div ${L.numTex(p.x)} = ${L.numTex(r)}`) };
    return valueQ(lab, k, { id: 'fratio', v: r, prompt: Cq(k, 'fratio.prompt', o), hints: [Cq(k, 'fratio.hint1', o), Cq(k, 'fratio.hint2', o)], explain: Cq(k, 'fratio.explain', o) });
  },
  fcommon: (lab, k) => {
    const o = { a: D(L.numTex(lab.fitA)), eq: D(L.lineTex(lab.fitA)) };
    return valueQ(lab, k, { id: 'fcommon', v: lab.fitA, prompt: Cq(k, 'fcommon.prompt', o), hints: [Cq(k, 'fcommon.hint1', o), Cq(k, 'fcommon.hint2', o)], explain: Cq(k, 'fcommon.explain', o) });
  },
  fnone: (lab, k) => {
    const opts = [
      { text: Cq(k, 'fnone.ratios'), correct: true },
      { text: Cq(k, 'fnone.few'), why: Cq(k, 'fnone.whyFew') },
      { text: Cq(k, 'fnone.window'), why: Cq(k, 'fnone.whyWindow') },
    ];
    return { id: 'fnone', kind: 'choice', cols: 3, prompt: Cq(k, 'fnone.prompt'), options: spread(opts, seedOf(lab)), hints: [Cq(k, 'fnone.hint1'), Cq(k, 'fnone.hint2')], explain: Cq(k, 'fnone.explain') };
  },
  /* ── la règle (l'ancienne découverte) ── */
  rule: (lab, k, ctx) => ({
    id: 'rule', kind: 'choice',
    prompt: ctx.rulePrompt,
    options: spread(discoveryFor(lab, k), seedOf(lab) + 1),
    hints: [Cq(k, `rule.hint1.${lab.mode}`), Cq(k, `rule.hint2.${lab.mode}`)],
    explain: ctx.formal,
  }),
};
