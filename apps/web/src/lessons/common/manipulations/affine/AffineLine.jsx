import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, MapPin, Minus, Plus } from 'lucide-react';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import MathText from '../../components/MathText';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import * as L from '../logic/affineLine';
import { ticks as tickValues } from '../logic/originLine';

/**
 * affine-line — LA DROITE QUI A QUITTÉ L'ORIGINE (unité 7 « الدالة التآلفية », leçon 2 « التمثيل البياني
 * لدالة تآلفية وقراءته بيانيًا »). Monde : la rampe d'un skatepark (`ramp`).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève TIRE le point (0 ; b′) le long de l'axe des ordonnées (ou saisit la droite n'importe où) : toute
 *    la droite glisse verticalement (shift / identify) ; il TIRE le sommet de la marche « 1 à droite, a′ en
 *    haut » (identify) ; il POSE des points (draw) ; il GLISSE une sonde sur un axe (shift, read, draw).
 * B. Idée : le graphe de x ⟼ ax + b est la droite de x ⟼ ax montée de b — parallèle à elle, elle coupe l'axe
 *    des ordonnées en (0 ; b) (« الترتيب عند المبدأ ») ; a est ce dont elle monte pour un pas vers la droite
 *    (« معامل التوجيه ») ; deux points suffisent à la tracer, O n'en est pas en général.
 * C. Pendant le geste : la droite de l'élève monte / descend en direct, les flèches (d) → (d′) s'allongent
 *    TOUTES de b′ ; la marche se redresse ; la sonde trace ses deux pointillés ; le skateur roule sur la rampe.
 * D. f(x) = 3/2 x + 1 et (0 ; 1) ; « على (d): 3 ، على (d′): 4 » ; y = a′x + b′ de l'élève ; f(4) = 7.
 * E. À découvrir avant la règle : chaque point de (d′) est le point de (d) de même abscisse monté de b, et
 *    (0 ; b) est sur (d′) (shift) ; b se lit où la droite coupe l'axe des ordonnées, a sur une marche (identify) ;
 *    deux points suffisent et O est refusé (draw) ; image = ordonnée, antécédent = abscisse (read).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        graphe d'une fonction affine : une droite parallèle à celle de x ⟼ ax, qui coupe l'axe des
 *                  ordonnées en (0 ; b) ; a = معامل التوجيه, b = الترتيب عند المبدأ
 *   OBJECT         une rampe de skatepark (la droite), sa base (0 ; b′) sur l'axe des ordonnées, une marche
 *   VARIABLE       shift : b′ (la hauteur de départ) ; identify : b′ ET a′ (la marche) ; draw : (x ; y) de
 *                  l'épingle ; read / shift : l'abscisse (ou l'ordonnée) d'une sonde
 *   INVARIANT      la pente a en shift (la marche résiste : « a ثابت ») ; l'écart (d) → (d′) est le MÊME à
 *                  toutes les abscisses ; la fonction en draw / read
 *   TRANSFORMATION la droite translate ; les flèches s'allongent ensemble ; la marche se redresse
 *   CONSTRAINT     (d′) est acceptée ssi b′ = b (`affine.imageOf(f, 0)`) ; un point ssi y = f(x) (EXACT)
 *   RESISTANCE     b′ ≠ b : refus avec f(0) = b ; un point hors de la droite tremble avec son écart ; O est
 *                  refusé quand b ≠ 0 (« f(0) = b ≠ 0 ») ; la marche refuse de bouger en shift
 *   EVIDENCE       shift : (d′) acceptée ET deux lectures à des abscisses différentes ; identify : les deux
 *                  droites confondues ; draw : deux points acceptés ; read : les cibles lues
 *   CONTRAST       la même flèche +b à x = 2 et à x = −2 ; parallèles (même a) vs sécantes sur l'axe des
 *                  ordonnées (même b) ; O accepté pour x ⟼ ax et refusé pour x ⟼ ax + b
 *   PREDICTION     « على (d) 3، استنتج دون حساب » : l'ordonnée sur (d′) se prédit avant d'y monter la sonde
 *   DISCOVERY      les conjectures ci-dessus ; les distracteurs sont réfutés par les propres essais de l'élève
 *   FORMALIZATION  « نسمّي العدد b … الترتيب عند المبدأ » (نشاط 3) ; la propriété écrite par la plateforme
 *   TRANSFER       معارف (رسم بنقطتين) ; القراءة البيانية (read) ; أوظّف ; les leçons 3–5 de l'unité
 *
 * QUESTIONS PENDANT LE LABO (2026-10-28, lot 4) : quand un laboratoire (shift, identify, draw, read) est accompli, une suite de questions se pose PAR-DESSUS le
 * labo (`CHAINS`, sur les essais de l'élève) et retient la suite (rien ne se pose plus, « التالي » attend) ; le dernier laboratoire finit par LA RÈGLE.
 * Étapes `LabStepper` (`[data-al-lab-step=<i>]`, fête à chaque laboratoire fait) ; « إعادة » repart de zéro ; obligatoires pour tout élève, coupées par
 * l'enseignant pour SON compte (`useLabCheckpointSettings`) ; `checkpoints` = false les coupe aussi ; `onCheckpoint(ev)` : la trace pour les étapes du module.
 *
 * Manuel (§6bis) : chaque droite, chaque point, chaque lecture est un essai ou une réponse — pas d'auto-complétion.
 * Enchaînement (§7quater) : « shift|identify » — le second laboratoire s'ouvre par un BOUTON quand le premier est
 * accompli (« إلى المنحدر الثاني ← »), avec un retour ; l'état de chacun survit à l'aller-retour.
 *
 * GESTES : les deux poignées (b′ et la marche) et les sondes sont des `useStretchInteraction` (glisser, toucher
 * la piste, flèches, −/+) sur des pistes COLLÉES au plan ; dans le plan, saisir la droite la fait glisser (shift)
 * ou, en identify, saisir près de l'axe des ordonnées tire b′ et ailleurs fait tourner la droite autour de (0 ; b′).
 * L'épingle (draw) suit le doigt en 2D et se pose sur le nœud exact le plus proche ; flèches + Entrée, boutons.
 *
 * DÉCOR (exigence du propriétaire) — sans information : un skateur sur la rampe (la droite) qui roule d'un bout à
 * l'autre quand on le touche. `aria-hidden`, hors du clavier, `[data-deco]`, immobile sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (§8bis) : la hauteur du plan vient de l'écran de leçon (`useLessonViewport`) moins les commandes
 * mesurées ; le plan rétrécit, jamais les commandes. Large (≥ 620 px) : plan et commandes côte à côte ; sinon les
 * commandes juste dessous. Le bloc mesuré est `[data-al-glance]` ; les essais sont dans un `LabFold` dessous.
 *
 * PROPS : a, b (chaînes du manuel : « 3/2 », « 0,5 », « -3 ») ; mode 'shift' | 'identify' | 'draw' | 'read', enchaînés
 *   par « | » ; find « a:b » (la droite cachée d'un identify enchaîné) ; reads « x:4|y:7 » ; xMin xMax yMin yMax ;
 *   showRule (read : écrire la formule ; défaut faux) ; theme 'ramp' ; title lead mission level levels ;
 *   onTrial(t) à chaque essai validé, onFinished({ modes, a, b }) à la règle formelle — par `state.report`.
 *
 * CONTRAT DOM : [data-affine-line][data-mode][data-modes][data-stage][data-theme][data-a][data-b][data-b-now]
 * [data-a-now][data-layout], [data-al-glance], [data-al-plane][data-w][data-h], [data-al-ghost], [data-al-line]
 * [data-dir], [data-al-hidden], [data-al-lift=<x>], [data-al-step], [data-al-intercept], [data-al-strip=b|a|x|y]
 * (pistes `data-stretch-*`), [data-al-handle=b|a|x|y], [data-al-pin], [data-al-point=<label>], [data-al-refused],
 * [data-al-probe=x|y], [data-al-controls], [data-al-next], [data-al-back], [data-al-place],
 * [data-al-move=left|right|up|down], [data-al-target=<i>][data-done], [data-al-verdict=<kind>], [data-al-trial],
 * [data-al-formal], [data-deco="ramp"].
 */
const STRIP_W = 44;
const GAP = 12;
const TITLE_H = 20;
const COLORS = { line: '#7C2D12', ghost: '#94A3B8', hidden: '#D97706', mine: '#2563EB', step: '#059669', lift: '#7C3AED' };

export default function AffineLine({
  a: a0, b: b0, mode: mode0 = 'shift', find, reads, xMin, xMax, yMin, yMax, showRule = false, theme: theme0 = 'ramp',
  title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false,
  onTrial, onFinished, onCheckpoint,
}) {
  const { t, i18n } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.affineLine.${key}`, o), [t]);
  const reduce = useReducedMotion();
  const state = useManipulation({
    type: 'affine-line',
    initialNumbers: {
      a: a0 == null ? undefined : String(a0), b: b0 == null ? undefined : String(b0), mode: mode0,
      ...(find ? { find } : {}), ...(reads ? { reads } : {}),
    },
    initialMode, initialLevel: level, withLevels, hintCount: 3,
  });
  const { a, b, mode: modesRaw, find: findN, reads: readsN } = state.numbers;
  const authored = state.isAuthoredLevel;
  const theme = L.THEMES.includes(theme0) ? theme0 : 'ramp';
  const make = () => L.init({ a, b, mode: modesRaw, find: findN, reads: readsN, ...(authored ? { xMin, xMax, yMin, yMax } : {}) });
  const [lab, setLab] = useState(make);
  const sceneKey = `${a}:${b}:${modesRaw}:${findN ?? ''}:${readsN ?? ''}:${state.epoch}:${state.resetCount}:${authored}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [cleared, setCleared] = useState([]);   // les laboratoires dont la suite de questions est finie
  const [pin, setPin] = useState(() => (L.mode(lab) === 'draw' ? L.startPin(lab) : null));
  const [liveB, setLiveB] = useState(null);
  const [liveA, setLiveA] = useState(null);
  const [liveXi, setLiveXi] = useState(null);
  const [liveYi, setLiveYi] = useState(null);
  const [drag, setDrag] = useState(null); // 'pin' | 'line' | 'b' | 'a' | null
  const [shake, setShake] = useState(0);
  // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — les droites, les essais et les questions du labo
  if (scene.key !== sceneKey) {
    const fresh = make();
    setScene({ key: sceneKey, inits: scene.inits + 1 }); setCleared([]); setLab(fresh); setPin(L.mode(fresh) === 'draw' ? L.startPin(fresh) : null);
    setLiveB(null); setLiveA(null); setLiveXi(null); setLiveYi(null); setDrag(null);
  }
  const mode = L.mode(lab);
  const st = lab.style;
  const N = (p) => L.numTex(p, st);
  const NT = (p) => L.numText(p, st);

  const ready = L.discoveryReady(lab);
  const cpSettings = useLabCheckpointSettings('affine-line');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpLive = cpOn && cpSettings.enabled;
  const lastStage = lab.stage === lab.modes.length - 1;
  const reachedNow = L.stageDone(lab);
  const cp = useLabCheckpoint({
    id: cpLive ? mode : null,
    questions: cpLive && reachedNow ? chainOf(lab, mode, lastStage).map((q) => QUESTIONS[q](lab, k)) : null,
    reached: reachedNow,
    resetKey: scene.inits,
    onRetry: () => { const fresh = L.restartStage(lab); setLab(fresh); setPin(L.mode(fresh) === 'draw' ? L.startPin(fresh) : null); setLiveB(null); setLiveA(null); setLiveXi(null); setLiveYi(null); },
    onEvent: (ev) => state.report(onCheckpoint, ev),   // {tk:'checkpoint'|'checkpoint-done', id: laboratoire, …} — la TRACE que les étapes du module relisent
    onDone: (id) => {
      setCleared((c) => (c.includes(id) ? c : [...c, id]));
      if (id === lab.modes[lab.modes.length - 1]) { state.discover(); state.formalize(); }
    },
  });
  useEffect(() => { if (ready && !cpLive) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps

  // un laboratoire est FAIT quand son objectif est atteint ET sa suite de questions répondue : la pastille passe au vert et on fête
  const stepDone = lab.modes.map((m) => L.stageDone(lab, m) && (!cpLive || cleared.includes(m)));
  const nDone = stepDone.findIndex((d) => !d) < 0 ? stepDone.length : stepDone.findIndex((d) => !d);
  const party = useStepCelebration();
  const celebrated = useRef({ n: 0, inits: scene.inits });
  if (celebrated.current.inits !== scene.inits) celebrated.current = { n: 0, inits: scene.inits };   // « إعادة » : on refête
  useEffect(() => {
    if (nDone <= celebrated.current.n) return;
    celebrated.current.n = nDone;
    party.celebrate({ n: nDone, total: stepDone.length });
  }, [nDone]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son du GESTE (muet sans « الصوت ») : « tooth » une lecture ou un essai, « flag » l'objectif, « bell » un point posé, « over » un refus
  useEffect(() => {
    const kind = lab.last?.kind;
    if (!kind) return;
    if (kind === 'shiftOk' || kind === 'rel-match') playSfx('flag');
    else if (kind === 'refused' || kind === 'originRefused' || kind === 'shiftZero' || kind === 'aFixed') playSfx('over');
    else if (kind === 'accepted') playSfx(lab.last.line ? 'flag' : 'bell');
    else playSfx('tooth');
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, { modes: lab.modes, a: NT(lab.a), b: NT(lab.b) }); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials === 0) return;
    state.report(onTrial, trialReport(lab.trials[nTrials - 1], lab));
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure ── */
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

  /* ── les pistes de ce laboratoire ── */
  const { win, snap, grid } = lab;
  const bOn = mode === 'shift' || mode === 'identify';
  const aOn = mode === 'identify';
  const yOn = mode === 'read';
  const xOn = mode === 'shift' || mode === 'read' || mode === 'draw';
  const leftOn = bOn || yOn;
  const planeCol = wide ? Math.floor((width - GAP) * 0.6) : width;
  const availW = planeCol - (leftOn ? strip : 0) - (aOn ? strip : 0);
  const availH = Math.max(120, (wide ? budget : budget - ctrlH - GAP) - 2 * TITLE_H - (xOn ? strip : 0) - 8);
  const geo = useMemo(() => planeGeometry({ win, width: availW, height: availH }), [win, availW, availH]);

  /* ── valeurs vivantes ── */
  const br = L.bRange(lab);
  const clamp = (v, r) => Math.max(r.min, Math.min(r.max, v));
  const Jb = clamp(liveB ?? L.indexOf(L.toNum(lab.bNow), snap.dB), br);
  const bNow = L.valueAt(Jb, snap.dB);
  const ar = L.aRange(lab, bNow);
  const Ja = clamp(liveA ?? L.indexOf(L.toNum(lab.aNow), snap.dA), ar);
  const aNow = aOn ? L.valueAt(Ja, snap.dA) : lab.a;
  const bRef = useRef(Jb); bRef.current = Jb;
  const aRef = useRef(Ja); aRef.current = Ja;
  const pinRef = useRef(pin); pinRef.current = pin;

  const xr = L.indexRange(win.xMin, win.xMax, snap.dx);
  const yr = L.indexRange(win.yMin, win.yMax, mode === 'draw' ? snap.dyPin : snap.dyRead);

  /* ── gestes ── */
  const commitA = (j) => {
    if (cp.blocking) return;
    setLiveA(j);
    setLab((s) => {
      // la marche : la droite de l'élève (b′ courant) prend a′ ; en shift elle résiste
      const withB = s.modes[s.stage] === 'identify' ? { ...s, bNow: L.valueAt(bRef.current, s.snap.dB) } : s;
      const n = L.setA(withB, L.valueAt(j, s.snap.dA));
      if (n.last?.kind === 'aFixed') setShake((x) => x + 1);
      return n;
    });
  };
  const commitBId = (j) => {
    if (cp.blocking) return;
    setLiveB(j);
    setLab((s) => {
      if (s.modes[s.stage] === 'identify') return L.setB({ ...s, aNow: L.valueAt(aRef.current, s.snap.dA) }, L.valueAt(j, s.snap.dB));
      const n = L.setB(s, L.valueAt(j, s.snap.dB));
      if (n.last?.kind === 'shiftOff' || n.last?.kind === 'shiftZero') setShake((x) => x + 1);
      return n;
    });
  };
  const commitPin = (p) => {
    if (!p || cp.blocking) return;
    setLab((s) => {
      const n = L.place(s, L.valueAt(p.i, s.snap.dx), L.valueAt(p.j, s.snap.dyPin));
      if (n.last?.kind === 'refused' || n.last?.kind === 'originRefused') setShake((x) => x + 1);
      return n;
    });
  };
  const goNext = () => { setLiveB(null); setLiveA(null); setLiveXi(null); setLab((s) => L.next(s)); };
  const goBack = () => { setLiveB(null); setLiveA(null); setLiveXi(null); setLab((s) => L.back(s)); };

  // Miroir synchrone de `lab` pour « جرّب كل الإمكانيات » (des pas plus rapides qu'un rendu).
  const labRef = useRef(lab);
  labRef.current = lab;
  const applyLab = (fn) => { labRef.current = fn(labRef.current); setLab(fn); };
  // le balayage du laboratoire courant : shift = chaque b′ de la grille ; read = chaque x puis chaque y
  const sweepOf = (s) => {
    const m = L.mode(s);
    if (m === 'shift') return L.untriedShifts(s).map((i) => ({ axis: 'b', i }));
    if (m === 'read') return [...L.untriedProbes(s, 'x').map((i) => ({ axis: 'x', i })), ...L.untriedProbes(s, 'y').map((i) => ({ axis: 'y', i }))];
    return [];
  };
  const runSweep = (act) => {
    if (act.axis === 'b') {
      setLiveB(act.i);
      applyLab((s) => {
        const n = L.setB(s, L.valueAt(act.i, s.snap.dB));
        if (n.last?.kind === 'shiftOff' || n.last?.kind === 'shiftZero') setShake((x) => x + 1);
        return n;
      });
    } else if (act.axis === 'x') {
      setLiveXi(act.i);
      applyLab((s) => L.probe(s, L.valueAt(act.i, s.snap.dx)));
    } else {
      setLiveYi(act.i);
      applyLab((s) => L.readY(s, L.valueAt(act.i, s.snap.dyRead)));
    }
  };
  const sweepLeft = sweepOf(lab).length;

  const planeRef = useRef(null);
  const local = (e) => {
    const r = planeRef.current.getBoundingClientRect();
    return { X: e.clientX - r.left, Y: e.clientY - r.top };
  };
  const pinAt = ({ X, Y }) => {
    const v = geo.fromPx(X, Y);
    const ry = L.indexRange(win.yMin, win.yMax, snap.dyPin);
    return { i: clamp(L.indexOf(v.x, snap.dx), xr), j: clamp(L.indexOf(v.y, snap.dyPin), ry) };
  };
  const follow = (p, kind) => {
    const v = geo.fromPx(p.X, p.Y);
    if (kind === 'line') setLiveB(clamp(L.bIndexUnder(lab, aNow, v.x, v.y), br));
    else if (kind === 'b') setLiveB(clamp(L.indexOf(v.y, snap.dB), br));
    else if (kind === 'a') { const j = L.aIndexUnder(lab, bNow, v.x, v.y); if (j != null) setLiveA(clamp(j, ar)); }
  };
  const onPlaneDown = (e) => {
    if (e.button > 0 || !planeRef.current || mode === 'read' || cp.blocking) return;
    const p = local(e);
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    if (mode === 'draw') { setDrag('pin'); setPin(pinAt(p)); return; }
    let kind = 'line';
    if (mode === 'identify') kind = Math.abs(p.X - geo.px(0)) < 26 ? 'b' : 'a';
    // shift : la marche est celle de f — saisir son sommet ne la redresse pas, elle résiste
    if (mode === 'shift' && Math.hypot(p.X - geo.px(1), p.Y - geo.py(L.toNum(bNow) + L.toNum(lab.a))) < 18) {
      setLab((s) => L.setA(s, s.a)); setShake((x) => x + 1); return;
    }
    setDrag(kind);
    follow(p, kind);
  };
  const onPlaneMove = (e) => {
    if (!drag) return;
    const p = local(e);
    if (drag === 'pin') setPin(pinAt(p));
    else follow(p, drag);
  };
  const onPlaneUp = (e) => {
    if (!drag) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    const kind = drag;
    setDrag(null);
    if (kind === 'pin') commitPin(pinRef.current);
    else if (kind === 'a') commitA(aRef.current);
    else commitBId(bRef.current);
  };
  const movePin = (di, dj) => {
    const ry = L.indexRange(win.yMin, win.yMax, snap.dyPin);
    setPin((p) => ({ i: clamp((p?.i ?? 0) + di, xr), j: clamp((p?.j ?? 0) + dj, ry) }));
  };
  const onPinKey = (e) => {
    const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (m) { e.preventDefault(); movePin(...m); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); commitPin(pinRef.current); }
  };

  /* ── pistes (useStretchInteraction) ── */
  const yToIndex = (d) => (_cx, cy, rect) => geo.fromPx(0, cy - rect.top).y / L.toNum(d);
  const sB = useStretchInteraction({
    value: bOn ? Jb : null, range: br, direction: 'ltr',
    toValue: useCallback(yToIndex(snap.dB), [geo, snap.dB]), // eslint-disable-line react-hooks/exhaustive-deps
    onChange: setLiveB, onCommit: commitBId,
  });
  const sA = useStretchInteraction({
    value: aOn ? Ja : null, range: ar, direction: 'ltr',
    toValue: useCallback((_cx, cy, rect) => (geo.fromPx(0, cy - rect.top).y - L.toNum(bNow)) / L.toNum(snap.dA), [geo, snap.dA, bNow]),
    onChange: setLiveA, onCommit: commitA,
  });
  const lastX = [...lab.trials].reverse().find((r) => r.kind === 'probe' || r.kind === 'read-x');
  const lastY = [...lab.readsDone].reverse().find((r) => r.axis === 'y');
  // Sondes : jamais vides à l'ouverture (2026-10-09). Le départ n'est ni un essai ni une cible de `reads`.
  const xi = liveXi ?? (lastX ? L.indexOf(L.toNum(lastX.x ?? lastX.v), snap.dx) : L.defaultProbeIndex(lab, 'x'));
  const yi = liveYi ?? (lastY ? L.indexOf(L.toNum(lastY.v), snap.dyRead) : L.defaultProbeIndex(lab, 'y'));
  const canX = (mode === 'shift' || mode === 'read' || (mode === 'draw' && L.drawLine(lab))) && !cp.blocking;
  const sX = useStretchInteraction({
    value: xi, range: xr, direction: 'ltr',
    toValue: useCallback((cx, _cy, rect) => geo.fromPx(cx - rect.left, 0).x / L.toNum(snap.dx), [geo, snap.dx]),
    onChange: (v) => canX && setLiveXi(v),
    onCommit: (v) => { if (!canX) return; setLiveXi(v); setLab((s) => L.probe(s, L.valueAt(v, s.snap.dx))); },
  });
  const sY = useStretchInteraction({
    value: yi, range: yr, direction: 'ltr',
    toValue: useCallback(yToIndex(snap.dyRead), [geo, snap.dyRead]), // eslint-disable-line react-hooks/exhaustive-deps
    onChange: (v) => yOn && setLiveYi(v),
    onCommit: (v) => { if (!yOn || cp.blocking) return; setLiveYi(v); setLab((s) => L.readY(s, L.valueAt(v, s.snap.dyRead))); },
  });

  /* ── lectures vivantes ── */
  const probeX = xi != null && canX ? L.valueAt(xi, snap.dx) : null;
  const lineB = mode === 'shift' || mode === 'identify' ? bNow : lab.b;
  const lineA = mode === 'identify' ? aNow : lab.a;
  const probeYd = probeX != null && mode === 'shift' ? L.image(lab.a, 0, probeX) : null;
  const probeYl = probeX != null ? L.image(lineA, lineB, probeX) : null;
  const probeY = yi != null && yOn ? L.valueAt(yi, snap.dyRead) : null;
  const probeYX = probeY != null ? L.antecedent(lab.a, lab.b, probeY) : null;

  /* ── mots ── */
  const fTex = `f(x) = ${L.affineTex(lab.a, lab.b, st)}`;
  const small = (x) => x.replace(/\\dfrac/g, '\\tfrac');
  const missionText = mission ?? <MathText>{k(`mission.${mode}`, { f: small(fTex), g: small(`g(x) = ${L.affineTex(lab.a, 0, st)}`) })}</MathText>;
  const hintKeys = [0, 1, 2].map((i) => k(`hints.${mode}.${i}`));
  const verdict = verdictOf(lab, k, st);
  const discoveryOptions = useMemo(() => discoveryFor(lab, k), [lab, k]);
  const primary = L.primaryMode(lab);
  const formal = <Formal lab={lab} k={k} />;
  const representation = (
    <EquationDisplay tone={mode === 'identify' && lab.matched ? 'ok' : 'neutral'}
      tex={mode === 'shift' ? L.lineTex(lab.a, bNow, st) : mode === 'identify' ? L.lineTex(aNow, bNow, st) : `y = ${L.affineTex(lab.a, lab.b, st)}`} />
  );

  /* ── dessin ── */
  const W = Math.round(geo.W);
  const H = Math.round(geo.H);
  const P = (x, y) => [geo.px(L.toNum(x)), geo.py(L.toNum(y))];
  const xTicks = tickValues(win.xMin, win.xMax, grid.xStep);
  const yTicks = tickValues(win.yMin, win.yMax, grid.yStep);
  const labelEveryX = Math.max(1, Math.ceil(24 / (geo.u * L.toNum(grid.xStep))));
  const labelEveryY = Math.max(1, Math.ceil(16 / (geo.u * L.toNum(grid.yStep))));
  const showLine = mode === 'shift' || mode === 'identify' || mode === 'read' || (mode === 'draw' && L.drawLine(lab));
  const seg = showLine ? L.segment(lineA, lineB, win) : null;
  const ghostSeg = mode === 'shift' ? L.segment(lab.a, 0, win) : null;
  const hiddenSeg = mode === 'identify' ? L.segment(lab.hidden.a, lab.hidden.b, win) : null;
  const lifts = mode === 'shift' && !L.same(bNow, 0) ? L.liftColumns(lab, bNow) : [];
  const dir = L.dirOf(lineA);
  const pinX = pin ? L.valueAt(pin.i, snap.dx) : null;
  const pinY = pin ? L.valueAt(pin.j, snap.dyPin) : null;
  const layout = wide ? 'side' : 'stack';
  const lineLabel = mode === 'shift' ? "(d')" : mode === 'identify' ? '' : '(d)';

  const plane = (
    <div dir="ltr" className="mx-auto w-max max-w-full" data-al-planeblock>
      <div className="relative" style={{ height: TITLE_H, marginLeft: leftOn ? strip : 0, width: W }}>
        <span dir="rtl" className="absolute top-0 truncate whitespace-nowrap text-[11px] font-bold text-slate-600" style={{ left: Math.max(0, Math.min(geo.px(0) + 6, W - 90)), maxWidth: W }} data-al-axis="y">{k('yAxis')}</span>
      </div>
      <div className="flex items-stretch">
        {bOn && (
          <Strip vertical s={sB} which="b" length={H} thick={strip} pos={geo.py(L.toNum(bNow))}
            label={k('handleB', { p: L.pointText(0, bNow, st) })} valueText={L.pointText(0, bNow, st)} tag={`b`} tone="lift" />
        )}
        {yOn && (
          <Strip vertical s={sY} which="y" length={H} thick={strip} pos={probeY != null ? geo.py(L.toNum(probeY)) : null}
            label={k('probeY', { v: probeY != null ? NT(probeY) : k('probeNotSet') })} valueText={probeY != null ? NT(probeY) : k('probeNotSet')}
            tag={probeY != null ? NT(probeY) : 'y'} tone="violet" />
        )}
        <div
          ref={planeRef}
          className={`relative shrink-0 rounded-lg border border-slate-200 bg-white ${mode === 'read' ? '' : 'cursor-grab'}`}
          style={{ width: W, height: H, touchAction: mode === 'read' ? 'auto' : 'none' }}
          onPointerDown={onPlaneDown} onPointerMove={onPlaneMove} onPointerUp={onPlaneUp} onPointerCancel={onPlaneUp}
          role="group" aria-label={k('planeAria')}
          data-al-plane data-w={W} data-h={H}
        >
          <svg width={W} height={H} className="absolute inset-0" aria-hidden="true" focusable="false">
            <style>{AL_CSS}</style>
            {xTicks.map((x) => <line key={`gx${L.toNum(x)}`} x1={geo.px(L.toNum(x))} x2={geo.px(L.toNum(x))} y1={geo.py(win.yMax)} y2={geo.py(win.yMin)} stroke="#E2E8F0" />)}
            {yTicks.map((y) => <line key={`gy${L.toNum(y)}`} x1={geo.px(win.xMin)} x2={geo.px(win.xMax)} y1={geo.py(L.toNum(y))} y2={geo.py(L.toNum(y))} stroke="#E2E8F0" />)}
            <line x1={geo.px(win.xMin)} x2={geo.px(win.xMax) + 6} y1={geo.py(0)} y2={geo.py(0)} stroke="#334155" strokeWidth={1.6} />
            <path d={`M${geo.px(win.xMax) + 8} ${geo.py(0)} l-7 -4 v8 z`} fill="#334155" />
            <line x1={geo.px(0)} x2={geo.px(0)} y1={geo.py(win.yMin)} y2={geo.py(win.yMax) - 6} stroke="#334155" strokeWidth={1.6} />
            <path d={`M${geo.px(0)} ${geo.py(win.yMax) - 8} l-4 7 h8 z`} fill="#334155" />
            {xTicks.map((x) => {
              const v = L.toNum(x);
              if (v === 0 || Math.round(v / L.toNum(grid.xStep)) % labelEveryX !== 0) return null;
              return <text key={`tx${v}`} x={geo.px(v)} y={geo.py(0) + 12 <= H - 1 ? geo.py(0) + 12 : geo.py(0) - 4} textAnchor="middle" fontSize={10} fill="#475569" fontFamily="ui-monospace, monospace">{NT(x).replace('-', '−')}</text>;
            })}
            {yTicks.map((y) => {
              const v = L.toNum(y);
              if (v === 0 || Math.round(v / L.toNum(grid.yStep)) % labelEveryY !== 0) return null;
              const left = geo.px(0) - 4 >= 16;
              return <text key={`ty${v}`} x={left ? geo.px(0) - 4 : geo.px(0) + 4} y={geo.py(v) + 3.5} textAnchor={left ? 'end' : 'start'} fontSize={10} fill="#475569" fontFamily="ui-monospace, monospace">{NT(y).replace('-', '−')}</text>;
            })}
            <text x={geo.px(0) - 4} y={geo.py(0) + 12} textAnchor="end" fontSize={11} fontWeight="bold" fill="#0F172A" fontFamily="ui-monospace, monospace">O</text>
            {/* la droite fantôme (d) de x ⟼ ax, par O */}
            {ghostSeg && (
              <g data-al-ghost={NT(lab.a)}>
                <line x1={geo.px(ghostSeg[0][0])} y1={geo.py(ghostSeg[0][1])} x2={geo.px(ghostSeg[1][0])} y2={geo.py(ghostSeg[1][1])} stroke={COLORS.ghost} strokeWidth={2} strokeDasharray="6 5" />
                <EndLabel seg={ghostSeg} geo={geo} text="(d)" color="#64748B" start />
                <StepTriangle geo={geo} b={0} a={lab.a} color="#94A3B8" st={st} faint />
              </g>
            )}
            {/* la droite cachée (D) — identify */}
            {hiddenSeg && (
              <g data-al-hidden>
                <line x1={geo.px(hiddenSeg[0][0])} y1={geo.py(hiddenSeg[0][1])} x2={geo.px(hiddenSeg[1][0])} y2={geo.py(hiddenSeg[1][1])} stroke={COLORS.hidden} strokeWidth={5} strokeLinecap="round" opacity={0.55} />
                <EndLabel seg={hiddenSeg} geo={geo} text="(D)" color="#B45309" />
              </g>
            )}
            {/* les flèches (d) → (d′) : toutes de b′ */}
            {lifts.map((x) => {
              const yd = L.toNum(L.image(lab.a, 0, x));
              const yl = yd + L.toNum(bNow);
              const X = geo.px(x);
              const up = yl > yd;
              return (
                <g key={`lift${x}`} data-al-lift={x}>
                  <line x1={X} x2={X} y1={geo.py(yd)} y2={geo.py(yl) + (up ? 5 : -5)} stroke={COLORS.lift} strokeWidth={1.6} />
                  <path d={up ? `M${X} ${geo.py(yl)} l-4 7 h8 z` : `M${X} ${geo.py(yl)} l-4 -7 h8 z`} fill={COLORS.lift} />
                </g>
              );
            })}
            {/* la droite de l'élève / la droite de f : la rampe */}
            {seg && (
              <g data-al-line={L.affineText(lineA, lineB, st)} data-dir={dir}>
                <line x1={geo.px(seg[0][0])} y1={geo.py(seg[0][1])} x2={geo.px(seg[1][0])} y2={geo.py(seg[1][1])} stroke={mode === 'identify' ? COLORS.mine : COLORS.line} strokeWidth={4} strokeLinecap="round" />
                <line x1={geo.px(seg[0][0])} y1={geo.py(seg[0][1])} x2={geo.px(seg[1][0])} y2={geo.py(seg[1][1])} stroke="#FDE68A" strokeWidth={1} strokeDasharray="2 6" />
                {lineLabel && <EndLabel seg={seg} geo={geo} text={lineLabel} color={COLORS.line} />}
              </g>
            )}
            {(mode === 'shift' || mode === 'identify') && <StepTriangle geo={geo} b={bNow} a={aNow} color={COLORS.step} st={st} handle={mode === 'identify'} />}
            {/* le point (0 ; b′) */}
            {(mode === 'shift' || mode === 'identify') && (
              <g data-al-intercept={L.pointText(0, bNow, st)}>
                <circle cx={geo.px(0)} cy={geo.py(L.toNum(bNow))} r={6} fill={COLORS.lift} stroke="#fff" strokeWidth={2} />
              </g>
            )}
            {/* sonde x en shift : la même abscisse sur (d) et (d′) */}
            {probeX != null && probeYl != null && (
              <g data-al-probe="x" data-x={NT(probeX)} data-y={NT(probeYl)}>
                <path d={`M${P(probeX, 0)} L${P(probeX, probeYl)} L${P(0, probeYl)}`} fill="none" stroke="#2563EB" strokeWidth={1.6} strokeDasharray="4 3" />
                <circle cx={P(probeX, probeYl)[0]} cy={P(probeX, probeYl)[1]} r={4} fill="#2563EB" />
                {probeYd != null && (
                  <>
                    <path d={`M${P(probeX, probeYd)} L${P(0, probeYd)}`} fill="none" stroke="#64748B" strokeWidth={1.2} strokeDasharray="3 3" />
                    <circle cx={P(probeX, probeYd)[0]} cy={P(probeX, probeYd)[1]} r={3.5} fill="#64748B" />
                  </>
                )}
              </g>
            )}
            {probeY != null && probeYX != null && (
              <g data-al-probe="y" data-x={NT(probeYX)} data-y={NT(probeY)}>
                <path d={`M${P(0, probeY)} L${P(probeYX, probeY)} L${P(probeYX, 0)}`} fill="none" stroke="#7C3AED" strokeWidth={1.6} strokeDasharray="4 3" />
                <circle cx={P(probeYX, probeY)[0]} cy={P(probeYX, probeY)[1]} r={4} fill="#7C3AED" />
              </g>
            )}
            {/* draw : points acceptés, dernier refus */}
            {mode === 'draw' && lab.placed.map((p) => {
              const [cx, cy] = P(p.x, p.y);
              return (
                <g key={p.label} data-al-point={p.label}>
                  <circle cx={cx} cy={cy} r={5} fill="#059669" stroke="#fff" strokeWidth={1.5} />
                  <text x={cx + 6} y={cy - 6} fontSize={12} fontWeight="bold" fill="#065F46" fontFamily="ui-monospace, monospace">{p.label}</text>
                </g>
              );
            })}
            {mode === 'draw' && (lab.last?.kind === 'refused' || lab.last?.kind === 'originRefused') && (
              <g transform={`translate(${P(lab.last.x, lab.last.y).join(' ')})`} data-al-refused={L.pointText(lab.last.x, lab.last.y, st)}>
                <g key={`r${shake}`} className="al-shake"><path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke="#E11D48" strokeWidth={2.4} strokeLinecap="round" /></g>
              </g>
            )}
            {seg && theme === 'ramp' && <Skater seg={seg} geo={geo} reduce={reduce} dragging={!!drag} />}
          </svg>
          {mode === 'draw' && pin && (
            <button type="button" onKeyDown={onPinKey} aria-label={k('pin', { p: L.pointText(pinX, pinY, st) })}
              className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${drag === 'pin' ? 'bg-blue-500/10' : ''}`}
              style={{ left: geo.px(L.toNum(pinX)), top: geo.py(L.toNum(pinY)), cursor: drag === 'pin' ? 'grabbing' : 'grab' }}
              data-al-pin={L.pointText(pinX, pinY, st)} data-i={pin.i} data-j={pin.j}>
              <span key={`p${shake}`} className={`block h-4 w-4 rounded-full border-2 border-white shadow ${shake ? 'al-shake' : ''}`} style={{ background: '#2563EB' }} />
            </button>
          )}
        </div>
        {aOn && (
          <Strip vertical s={sA} which="a" length={H} thick={strip} pos={geo.py(L.toNum(bNow) + L.toNum(aNow))}
            label={k('handleA', { a: NT(aNow) })} valueText={k('stepText', { a: NT(aNow) })} tag="a" tone="step" />
        )}
      </div>
      {xOn && (
        <div style={{ marginLeft: leftOn ? strip : 0 }}>
          <Strip s={sX} which="x" length={W} thick={strip} pos={probeX != null ? geo.px(L.toNum(probeX)) : null} disabled={!canX}
            label={k('probeX', { v: probeX != null ? NT(probeX) : k('probeNotSet') })} valueText={probeX != null ? NT(probeX) : k('probeNotSet')}
            tag={probeX != null ? `x = ${NT(probeX)}` : 'x'} tone="blue" />
        </div>
      )}
      <div className="relative" style={{ height: TITLE_H, marginLeft: leftOn ? strip : 0, width: W }}>
        <span dir="rtl" className="absolute top-0.5 max-w-full truncate whitespace-nowrap text-[11px] font-bold text-slate-600" style={{ right: 4 }} data-al-axis="x">{k('xAxis')}</span>
      </div>
    </div>
  );

  const T = (s) => <MathText>{s}</MathText>;
  const controls = (
    <div ref={ctrlRef} className="space-y-2" data-al-controls>
      <RuleLine lab={lab} k={k} st={st} fTex={fTex} showRule={showRule} aNow={aNow} bNow={bNow} mode={mode} />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5" data-al-pads>
      {bOn && (
        <div className="flex flex-wrap items-center gap-1.5" data-al-pad="b">
          <StepButtons s={sB} less={k('lessB')} more={k('moreB')} which="b" />
          <span className="text-sm font-bold" style={{ color: COLORS.lift }}>{T(k('bNow', { p: L.pointTex(0, bNow, st) }))}</span>
        </div>
      )}
      {aOn && (
        <div className="flex flex-wrap items-center gap-1.5" data-al-pad="a">
          <StepButtons s={sA} less={k('lessA')} more={k('moreA')} which="a" />
          <span className="text-sm font-bold" style={{ color: COLORS.step }}>{T(k('aNow', { a: N(aNow) }))}</span>
        </div>
      )}
      {mode === 'shift' && (
        <div className="flex flex-wrap items-center gap-1.5" data-al-read="x">
          <StepButtons s={sX} less={k('lessX')} more={k('moreX')} which="x" />
          <span className="min-w-0 text-sm font-bold text-blue-900">
            {probeX != null && probeYl != null
              ? T(k('shiftRead', { x: N(probeX), yd: N(probeYd), yl: N(probeYl) }))
              : <span className="text-xs font-normal text-slate-500">{k('probeShiftShort')}</span>}
          </span>
        </div>
      )}
      </div>
      {mode === 'draw' && (
        <div className="flex flex-wrap items-center gap-1.5" data-al-pinpad>
          <span className="rounded-lg border-2 border-blue-200 bg-blue-50 px-2 py-1 text-sm font-bold text-blue-900" aria-live="polite">
            {k('pinNow')} {pin ? T(`$${L.pointTex(pinX, pinY, st)}$`) : '?'}
          </span>
          <div dir="ltr" className="flex gap-1">
            {[['left', -1, 0, ArrowLeft, 'pinLeft'], ['right', 1, 0, ArrowRight, 'pinRight'], ['up', 0, 1, ArrowUp, 'pinUp'], ['down', 0, -1, ArrowDown, 'pinDown']].map(([id, di, dj, Icon, key]) => (
              <button key={id} type="button" onClick={() => movePin(di, dj)} aria-label={k(key)} data-al-move={id}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </button>
            ))}
          </div>
          <button type="button" onClick={() => commitPin(pinRef.current)} data-al-place
            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-emerald-600 bg-white px-3 text-sm font-bold text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
            <MapPin className="h-4 w-4" aria-hidden="true" /> {k('place')}
          </button>
        </div>
      )}
      {(mode === 'read' || (mode === 'draw' && L.drawLine(lab))) && (
        <div className="space-y-1.5" data-al-readings>
          {mode === 'read' && lab.reads.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label={k('targetsTitle')}>
              {lab.reads.map((r, i) => {
                const done = L.targetsDone(lab)[i];
                return (
                  <li key={`${r.axis}${NT(r.v)}`} data-al-target={i} data-done={done ? 'true' : 'false'}
                    className={`rounded-lg border-2 px-2 py-0.5 text-xs font-bold ${done ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : 'border-slate-300 bg-white text-slate-700'}`}>
                    {done ? '✓ ' : '○ '}{T(k(r.axis === 'x' ? 'targetX' : 'targetY', { v: N(r.v) }))}
                  </li>
                );
              })}
            </ul>
          )}
          <div className="flex flex-wrap items-center gap-1.5" data-al-read="x">
            <StepButtons s={sX} less={k('lessX')} more={k('moreX')} which="x" />
            <span className="min-w-0 text-sm font-bold text-blue-900">
              {probeX != null && probeYl != null
                ? T(`$f(${N(probeX)}) = ${N(probeYl)}$`)
                : <span className="text-xs font-normal text-slate-500">{k('probeXShort')}</span>}
            </span>
          </div>
          {yOn && (
            <div className="flex flex-wrap items-center gap-1.5" data-al-read="y">
              <StepButtons s={sY} less={k('lessY')} more={k('moreY')} which="y" />
              <span className="min-w-0 text-sm font-bold text-violet-900">
                {probeY != null && probeYX != null ? T(`$x = ${L.approxTex(probeYX, st)}$`) : <span className="text-xs font-normal text-slate-500">{k('probeYShort')}</span>}
              </span>
            </div>
          )}
        </div>
      )}
      {(L.hasNext(lab) || lab.stage > 0) && (
        <div className="flex flex-wrap items-center gap-2" data-al-stages>
          {lab.stage > 0 && (
            <button type="button" onClick={goBack} data-al-back
              className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
              {k(`back.${lab.modes[lab.stage - 1]}`)}
            </button>
          )}
          {L.hasNext(lab) && L.stageDone(lab) && !cp.blocking && (
            <div className="flex flex-1 flex-wrap items-center gap-2 rounded-xl border-2 border-indigo-200 bg-indigo-50 px-2 py-1" data-al-next-card>
              <span className="text-xs font-bold text-indigo-900">{T(k(`done.${mode}`, { b: N(lab.b) }))}</span>
              <button type="button" onClick={goNext} data-al-next
                className="inline-flex min-h-[44px] items-center rounded-xl bg-indigo-600 px-3 text-sm font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">
                {k(`next.${lab.modes[lab.stage + 1]}`)}
              </button>
            </div>
          )}
        </div>
      )}
      <p role="status" className="min-h-[2.5rem] text-sm font-bold leading-snug" data-al-verdict={lab.last?.kind ?? ''}>{verdict}</p>
    </div>
  );

  return (
    <ManipulationShell
      type="affine-line"
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
        autoComplete: sweepLeft > 0 || mode === 'shift' || mode === 'read' ? {
          label: t('manipulation.autoComplete.tryAll'),
          ready: true,
          remaining: sweepLeft,
          intervalMs: 480,
          maxTicks: 80,
          step: () => { const next = sweepOf(labRef.current)[0]; if (next) runSweep(next); },
          finish: () => { sweepOf(labRef.current).forEach(runSweep); },
        } : undefined,
      }}
      representation={representation}
      discovery={<ManipulationDiscovery state={state} prompt={<MathText>{k(`dPrompt.${primary}`)}</MathText>} options={discoveryOptions} formal={formal} />}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-orange-50/60 to-white">
        <div ref={boxRef} className="relative space-y-3" data-affine-line data-mode={mode} data-modes={lab.modes.join('|')} data-stage={lab.stage}
          data-theme={theme} data-a={a ?? ''} data-b={b ?? ''} data-b-now={NT(bNow)} data-a-now={NT(aNow)} data-layout={layout} data-budget={budget}>
          {party.node}
          {cp.node}
          {lab.modes.length > 1 && <LabStepper count={lab.modes.length} current={lab.stage} done={stepDone} stepAttr="data-al-lab-step" />}
          <div className={wide ? 'grid items-start gap-3' : 'space-y-3'} style={wide ? { gridTemplateColumns: `${planeCol}px 1fr` } : undefined} data-al-glance>
            {plane}
            {controls}
          </div>
          {lab.trials.length > 0 && (
            <LabFold id="affine-line.trials" title={k('trialsTitle')}>
              <ul className="flex flex-wrap gap-1.5" data-al-trials>
                {lab.trials.slice(-12).map((tr, n) => (
                  <li key={`${tr.kind}${n}`} data-al-trial={tr.kind} data-ok={tr.ok === false ? 'false' : 'true'}
                    className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${tr.ok === false ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-emerald-300 bg-emerald-50 text-emerald-900'}`}>
                    <MathText>{`$${trialTex(tr, st)}$`}</MathText>
                  </li>
                ))}
              </ul>
            </LabFold>
          )}
          {i18n.exists(`lesson:manipulation.affineLine.themes.${theme}.world`) && <p className="text-[11px] text-slate-500" data-al-world>{k(`themes.${theme}.world`)}</p>}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ── géométrie : معلم متعامد ومتجانس (même unité sur les deux axes) ── */
function planeGeometry({ win, width, height, pad = 14 }) {
  const xSpan = win.xMax - win.xMin;
  const ySpan = win.yMax - win.yMin;
  const u = Math.max(4, Math.min(Math.max(60, width - 2 * pad) / xSpan, Math.max(60, height - 2 * pad) / ySpan));
  const W = xSpan * u + 2 * pad;
  const H = ySpan * u + 2 * pad;
  const px = (x) => pad + (x - win.xMin) * u;
  const py = (y) => pad + (win.yMax - y) * u;
  const fromPx = (X, Y) => ({ x: win.xMin + (X - pad) / u, y: win.yMax - (Y - pad) / u });
  return { W, H, u, pad, px, py, fromPx };
}

function trialTex(tr, st) {
  if (tr.kind === 'shift') return `(0 ; ${L.numTex(tr.b, st)})`;
  if (tr.kind === 'try') return L.lineTex(tr.a, tr.b, st);
  if (tr.kind === 'probe') return `x = ${L.numTex(tr.x, st)} : ${L.numTex(tr.yd, st)} \\to ${L.numTex(tr.yl, st)}`;
  if (tr.kind === 'point') return L.pointTex(tr.x, tr.y, st);
  if (tr.kind === 'read-x') return `f(${L.numTex(tr.v, st)}) = ${L.numTex(tr.other, st)}`;
  if (tr.kind === 'read-y') return `f(${L.approxTex(tr.other, st)}) = ${L.numTex(tr.v, st)}`;
  return '';
}

function trialReport(tr, lab) {
  const st = lab.style;
  const T = (p) => L.numText(p, st);
  const base = { modes: lab.modes, mode: L.mode(lab), kind: tr.kind };
  if (tr.kind === 'shift') return { ...base, ok: tr.ok, b: T(tr.b), tex: `(0 ; ${L.numTex(tr.b, st)})` };
  if (tr.kind === 'try') return { ...base, ok: tr.ok, a: T(tr.a), b: T(tr.b), rel: tr.rel, tex: L.lineTex(tr.a, tr.b, st) };
  if (tr.kind === 'probe') return { ...base, ok: true, x: T(tr.x), yd: T(tr.yd), yl: T(tr.yl), b: T(tr.b), tex: trialTex(tr, st) };
  if (tr.kind === 'point') return { ...base, ok: tr.ok, x: T(tr.x), y: T(tr.y), fx: T(tr.fx), gap: T(tr.gap), label: tr.label ?? null, origin: tr.origin, pointTex: L.pointTex(tr.x, tr.y, st) };
  if (tr.kind === 'read-x') return { ...base, ok: true, x: T(tr.v), y: T(tr.other), tex: trialTex(tr, st) };
  return { ...base, ok: true, x: T(tr.other), y: T(tr.v), tex: trialTex(tr, st) };
}

/* ── la ligne de la règle (en tête des commandes) ── */
function RuleLine({ lab, k, st, fTex, showRule, aNow, bNow, mode }) {
  // \frac (pas \dfrac) : la ligne de la règle reste d'une ligne de haut (un seul écran, §8bis)
  const T = (s) => <MathText>{s.replace(/\\dfrac/g, '\\tfrac')}</MathText>;
  if (mode === 'shift') {
    return (
      <p className="flex flex-wrap gap-x-3 gap-y-0.5 font-bold text-slate-800 text-sm" data-al-rule>
        <span><span className="text-slate-500">{k('ghost')}:</span> {T(`$y = ${L.affineTex(lab.a, 0, st)}$`)}</span>
        <span><span className="text-slate-500">{k('target')}:</span> {T(`$${fTex}$`)}</span>
      </p>
    );
  }
  if (mode === 'identify') {
    return (
      <p className="flex flex-wrap gap-x-3 gap-y-0.5 font-bold text-slate-800 text-sm" data-al-rule>
        <span><span className="text-amber-700">{k('hiddenLine')}:</span> {lab.matched ? T(`$f(x) = ${L.affineTex(lab.hidden.a, lab.hidden.b, st)}$`) : T('$f(x) = \\,?$')}</span>
        <span><span className="text-blue-700">{k('mine')}:</span> {T(`$${L.lineTex(aNow, bNow, st)}$`)}</span>
      </p>
    );
  }
  if (mode === 'draw') return <p className="font-bold text-slate-800 text-sm" data-al-rule><span className="text-slate-500">{k('rule')}:</span> {T(`$${fTex}$`)}</p>;
  return (
    <p className="font-bold text-slate-800 text-sm" data-al-rule>
      <span className="text-slate-500">{k('lineD')}:</span> {showRule ? T(`$y = ${L.affineTex(lab.a, lab.b, st)}$`) : <bdi dir="ltr">(d)</bdi>}
    </p>
  );
}

function StepButtons({ s, less, more, which }) {
  return (
    <span dir="ltr" className="inline-flex gap-1">
      <button type="button" onClick={() => s.nudge(-1)} aria-label={less} data-al-less={which}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Minus className="h-5 w-5" aria-hidden="true" /></button>
      <button type="button" onClick={() => s.nudge(1)} aria-label={more} data-al-more={which}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Plus className="h-5 w-5" aria-hidden="true" /></button>
    </span>
  );
}

/* ── une piste collée au plan ── */
function Strip({ s, which, vertical = false, length, thick, pos, label, valueText, tag, tone, disabled = false }) {
  const color = { blue: '#2563EB', violet: '#7C3AED', lift: COLORS.lift, step: COLORS.step }[tone];
  const box = vertical ? { width: thick, height: length } : { width: length, height: thick };
  return (
    <div {...(disabled ? {} : s.trackProps)} className={`relative shrink-0 ${disabled ? 'opacity-40' : ''}`}
      style={{ ...(disabled ? {} : s.trackProps.style), ...box }} data-al-strip={which} data-disabled={disabled ? 'true' : undefined}>
      <div className="absolute rounded-full" style={vertical
        ? { left: thick / 2 - 2, top: 8, bottom: 8, width: 4, background: color, opacity: 0.35 }
        : { top: thick / 2 - 2, left: 8, right: 8, height: 4, background: color, opacity: 0.35 }} />
      {!disabled && (
        <div {...s.handleProps({ label, valueText })}
          className={`absolute z-10 flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 bg-white px-1 outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${s.dragging ? 'shadow-md' : ''}`}
          style={vertical
            ? { left: thick / 2, top: pos ?? length / 2, transform: 'translate(-50%, -50%)', borderColor: color, cursor: s.dragging ? 'grabbing' : 'grab' }
            : { top: thick / 2, left: pos ?? length / 2, transform: 'translate(-50%, -50%)', borderColor: color, cursor: s.dragging ? 'grabbing' : 'grab' }}
          data-al-handle={which}>
          <span className="whitespace-nowrap font-mono text-[11px] font-extrabold" style={{ color }}>{tag}</span>
        </div>
      )}
    </div>
  );
}

function EndLabel({ seg, geo, text, color, start = false }) {
  // la droite de l'élève est nommée à son bout droit, la droite fantôme à son bout gauche : jamais l'une sur l'autre
  const end = start ? seg[0] : seg[1];
  const X = start ? Math.max(geo.px(end[0]) + 4, 4) : Math.min(geo.px(end[0]) - 4, geo.W - 30);
  const Y = Math.max(12, Math.min(geo.H - 4, geo.py(end[1]) + (start ? -6 : 14)));
  return <text x={X} y={Y} textAnchor={start ? 'start' : 'end'} fontSize={11} fontWeight="bold" fill={color} fontFamily="ui-monospace, monospace">{text}</text>;
}

/** La marche « 1 à droite, a en haut » à partir de (0 ; b). */
function StepTriangle({ geo, b, a, color, st, faint = false, handle = false }) {
  const B = L.toNum(b); const A = L.toNum(a);
  const x0 = geo.px(0); const x1 = geo.px(1);
  const y0 = geo.py(B); const y1 = geo.py(B + A);
  return (
    <g data-al-step={faint ? 'ghost' : L.numText(a, st)} opacity={faint ? 0.55 : 1}>
      <path d={`M${x0} ${y0} L${x1} ${y0} L${x1} ${y1}`} fill="none" stroke={color} strokeWidth={faint ? 1.4 : 2} strokeDasharray={faint ? '3 3' : undefined} />
      {!faint && (
        <>
          <text x={(x0 + x1) / 2} y={y0 + (A > 0 ? -4 : 12)} textAnchor="middle" fontSize={10} fontWeight="bold" fill={color} fontFamily="ui-monospace, monospace">1</text>
          <text x={x1 + 4} y={(y0 + y1) / 2 + 3} textAnchor="start" fontSize={10} fontWeight="bold" fill={color} fontFamily="ui-monospace, monospace">{L.numText(a, st).replace('-', '−')}</text>
        </>
      )}
      {handle && <circle cx={x1} cy={y1} r={5.5} fill="#fff" stroke={color} strokeWidth={2.4} />}
    </g>
  );
}

/* ── le verdict : la conséquence mathématique ── */
function verdictOf(lab, k, st) {
  const last = lab.last;
  if (!last) return null;
  const T = (s) => <MathText>{s}</MathText>;
  const N = (p) => L.numTex(p, st);
  switch (last.kind) {
    case 'shiftOk': return <span className="text-emerald-800">{T(k('vShiftOk', { b: N(lab.b) }))}</span>;
    case 'shiftOff': return <span className="text-rose-800">{T(k('vShiftOff', { bNow: N(last.b), b: N(lab.b) }))}</span>;
    case 'shiftZero': return <span className="text-rose-800">{T(k('vShiftZero', { b: N(lab.b) }))}</span>;
    case 'aFixed': return <span className="text-amber-800">{T(k('vAFixed', { a: N(lab.a) }))}</span>;
    case 'probe': return <span className="text-blue-900">{T(k('vProbe', { x: N(last.x), yd: N(last.yd), yl: N(last.yl), b: L.signedTex(last.b, st) }))}</span>;
    case 'rel-match': return <span className="text-emerald-800">{T(k('vMatch', { b: N(last.b), a: N(last.a) }))}</span>;
    case 'rel-parallel': return <span className="text-amber-800">{T(k('vParallel'))}</span>;
    case 'rel-sameB': return <span className="text-amber-800">{T(k('vSameB', { b: N(last.b) }))}</span>;
    case 'rel-cross': return <span className="text-slate-800">{T(k('vCross'))}</span>;
    case 'same': return <span className="text-slate-700">{k('vSame')}</span>;
    case 'originRefused': return <span className="text-rose-800">{T(k('vOrigin', { b: N(lab.b) }))}</span>;
    case 'refused': return <span className="text-rose-800">{T(k('vRefused', { p: L.pointTex(last.x, last.y, st), calc: L.imageCalcTex(lab.a, lab.b, last.x, st), y: N(last.y), gap: L.absTex(last.gap, st) }))}</span>;
    case 'accepted': return (
      <span className="text-emerald-800">
        {T(k('vAccepted', { label: last.label, p: L.pointTex(last.x, last.y, st), calc: L.imageCalcTex(lab.a, lab.b, last.x, st) }))}
        {last.line && <> {T(k('vLine'))}</>}
      </span>
    );
    case 'read-x': return <span className="text-blue-900">{T(k('vReadX', { x: N(last.v), y: N(last.other) }))}</span>;
    case 'read-y': return <span className="text-violet-900">{T(k('vReadY', { y: N(last.v), x: L.approxTex(last.other, st) }))}</span>;
    default: return null;
  }
}

/* ── la découverte : distracteurs réfutés par les essais de l'élève ── */
function discoveryFor(lab, k) {
  const M = (s) => <MathText>{s}</MathText>;
  const st = lab.style;
  const N = (p) => L.numTex(p, st);
  const pm = L.primaryMode(lab);
  if (pm === 'identify') {
    const h = lab.hidden;
    const xi = L.antecedent(h.a, h.b, 0);
    return [
      { text: M(k('dOpt.idSwap')), why: M(k('dOpt.idSwapWhy', { b: N(h.b), a: N(h.a) })) },
      { text: M(k('dOpt.idRight')), correct: true },
      ...(xi != null ? [{ text: M(k('dOpt.idXAxis')), why: M(k('dOpt.idXAxisWhy', { x: L.approxTex(xi, st), b: N(h.b) })) }] : []),
    ];
  }
  if (pm === 'shift') {
    const ps = lab.probes.filter((p) => L.same(p.b, lab.b));
    const [p1, p2] = ps;
    return [
      { text: M(k('dOpt.shiftO')), why: M(k('dOpt.shiftOWhy', { b: N(lab.b) })) },
      { text: M(k('dOpt.shiftRight')), correct: true },
      ...(p1 && p2 ? [{ text: M(k('dOpt.shiftGrow')), why: M(k('dOpt.shiftGrowWhy', { x1: N(p1.x), x2: N(p2.x), b: N(lab.b) })) }] : []),
    ];
  }
  if (pm === 'draw') {
    return [
      { text: M(k('dOpt.drawO')), why: M(k('dOpt.drawOWhy', { b: N(lab.b) })) },
      { text: M(k('dOpt.drawRight')), correct: true },
      { text: M(k('dOpt.drawThree')), why: M(k('dOpt.drawThreeWhy')) },
    ];
  }
  const rx = lab.readsDone.find((r) => r.axis === 'x');
  return [
    ...(rx ? [{ text: M(k('dOpt.readSwap')), why: M(k('dOpt.readSwapWhy', { x: N(rx.v), y: N(rx.other) })) }] : []),
    { text: M(k('dOpt.readRight')), correct: true },
  ];
}

function Formal({ lab, k }) {
  const M = (s) => <MathText>{s}</MathText>;
  const st = lab.style;
  const N = (p) => L.numTex(p, st);
  return (
    <div className="space-y-2" data-al-formal={lab.modes.join('|')}>
      {lab.modes.includes('shift') && (
        <>
          <EquationDisplay tone="result" tex={`f(x) = ${L.affineTex(lab.a, lab.b, st)}`} note={M(k('fShift', { g: L.affineTex(lab.a, 0, st), b: N(lab.b) }))} />
          <p className="text-sm text-emerald-900">{M(k('fShiftRule', { b: N(lab.b) }))}</p>
        </>
      )}
      {lab.modes.includes('identify') && (
        <p className="text-sm text-slate-800">{M(k('fIdentify', { b: N(lab.hidden.b), a: N(lab.hidden.a), f: L.affineTex(lab.hidden.a, lab.hidden.b, st) }))}</p>
      )}
      {lab.modes.includes('draw') && <p className="text-sm text-emerald-900">{M(k('fDraw', { b: N(lab.b) }))}</p>}
      {lab.modes.includes('read') && <p className="text-sm text-emerald-900">{M(k('fRead'))}</p>}
      <p className="text-sm text-slate-700">{M(k('fNames'))}</p>
    </div>
  );
}

/* ── le skateur sur la rampe (décor) ── */
function Skater({ seg, geo, reduce, dragging }) {
  const [far, setFar] = useState(false);
  const f = far ? 0.3 : 0.72;
  const x = seg[0][0] + (seg[1][0] - seg[0][0]) * f;
  const y = seg[0][1] + (seg[1][1] - seg[0][1]) * f;
  const ang = (Math.atan2(-(geo.py(seg[1][1]) - geo.py(seg[0][1])), geo.px(seg[1][0]) - geo.px(seg[0][0])) * 180) / Math.PI;
  return (
    <g style={{ transform: `translate(${geo.px(x)}px, ${geo.py(y)}px) rotate(${-ang}deg)`, transition: reduce || dragging ? 'none' : 'transform 1200ms ease-in-out', cursor: 'pointer' }}
      onPointerDown={(e) => e.stopPropagation()} onClick={() => setFar((v) => !v)} data-deco="ramp" pointerEvents="all">
      <rect x={-10} y={-5} width={20} height={3} rx={1.5} fill="#1F2937" />
      <circle cx={-6} cy={-1} r={1.8} fill="#F59E0B" />
      <circle cx={6} cy={-1} r={1.8} fill="#F59E0B" />
      <path d="M-3 -6 L0 -14 L3 -6" fill="none" stroke="#0F172A" strokeWidth={2} strokeLinecap="round" />
      <rect x={-3.5} y={-22} width={7} height={9} rx={2} fill="#16A34A" />
      <path d="M-3 -19 L-8 -15 M3 -19 L8 -21" stroke="#0F172A" strokeWidth={1.6} strokeLinecap="round" />
      <circle cx={0} cy={-26} r={3.4} fill="#F5D0A9" stroke="#0F172A" strokeWidth={0.8} />
      <path d="M-3.6 -27 Q0 -32 3.6 -27 Z" fill="#DC2626" />
    </g>
  );
}

const AL_CSS = '.al-shake{animation:al-s .35s ease-in-out 1}@keyframes al-s{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}'
  + '@media (prefers-reduced-motion: reduce){.al-shake{animation:none}}';

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque laboratoire ; le DERNIER finit par LA RÈGLE. */
export function chainOf(lab, mode, last) {
  const placedOrigin = lab.trials.some((tr) => tr.kind === 'point' && tr.origin && !tr.ok);
  const base = {
    shift: ['lift', 'predict', 'cut'],
    identify: ['readB', 'readA'],
    draw: [placedOrigin ? 'origin' : null, 'enough', 'third'].filter(Boolean),
    read: ['vocab', lab.readsDone.some((r) => r.axis === 'y') ? 'antec' : null, 'compute'].filter(Boolean),
  }[mode];
  return last ? [...base, 'rule'] : base;
}
export const CHAINS = Object.freeze({ shift: ['lift', 'predict', 'cut'], identify: ['readB', 'readA'], draw: ['origin', 'enough', 'third'], read: ['vocab', 'antec', 'compute'] });

const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const D = (x) => `$${x}$`;
const shuffled = (list, seed) => { const r = seed % list.length; return [...list.slice(r), ...list.slice(0, r)]; };
const seedOf = (lab) => Math.abs(Number(lab.a.n) + Number(lab.b.n)) + lab.modes.length;

/** Une valeur à calculer : saisie libre si elle est ≥ 0 (une réponse saisie ne peut être négative), sinon trois choix aux erreurs réelles (signe, décalage). */
function valueQ(lab, k, { id, v, prompt, hints, explain }) {
  const st = lab.style;
  const T = (x) => <MathText>{D(L.numTex(x, st))}</MathText>;
  if (Lin.cmp(v, 0) >= 0) return { id, kind: 'number', expected: Lin.fracText(v), answer: T(v), prompt, hints, explain };
  const opts = [
    { text: T(v), correct: true },
    { text: T(Lin.neg(v)), why: Cq(k, 'sign') },
    { text: T(Lin.add(v, 1)), why: Cq(k, 'off') },
  ];
  return { id, kind: 'choice', cols: 3, prompt, options: shuffled(opts, seedOf(lab)), hints, explain };
}
/** Trois valeurs distinctes : la bonne et deux erreurs réelles (`why` propre à chacune). */
function choiceOf(lab, k, { id, good, wrongs, prompt, hints, explain, seed = 0 }) {
  const st = lab.style;
  const T = (x) => <MathText>{D(L.numTex(x, st))}</MathText>;
  const list = [{ v: good, correct: true }];
  for (const w of wrongs) if (!list.some((o) => L.same(o.v, w.v))) list.push(w);
  for (let bump = 1; list.length < 3; bump += 1) { const v = Lin.add(good, bump); if (!list.some((o) => L.same(o.v, v))) list.push({ v, why: Cq(k, 'off') }); }
  const opts = list.map((o) => ({ text: T(o.v), ...(o.correct ? { correct: true } : { why: o.why }) }));
  return { id, kind: 'choice', cols: 3, prompt, options: shuffled(opts, seedOf(lab) + seed), hints, explain };
}

export const QUESTIONS = {
  lift: (lab, k) => {
    const st = lab.style; const N = (x) => D(L.numTex(x, st));
    const p = lab.probes.find((q) => L.same(q.b, lab.b));
    const o = { x: L.numText(p.x, st), yd: N(p.yd), yl: N(p.yl), b: N(lab.b), calc: D(`${L.numTex(p.yl, st)} - ${Lin.cmp(p.yd, 0) < 0 ? `(${L.numTex(p.yd, st)})` : L.numTex(p.yd, st)} = ${L.numTex(lab.b, st)}`) };
    return valueQ(lab, k, { id: 'lift', v: lab.b, prompt: Cq(k, 'lift.prompt', o), hints: [Cq(k, 'lift.hint1', o), Cq(k, 'lift.hint2')], explain: Cq(k, 'lift.explain', o) });
  },
  predict: (lab, k) => {
    const st = lab.style; const N = (x) => D(L.numTex(x, st));
    const used = lab.probes.map((q) => Lin.fracText(q.x));
    const xq = [3, 4, 5, 6, 2, 1, -1].find((c) => !used.includes(String(c))) ?? 7;
    const yd = L.image(lab.a, 0, xq);
    const v = Lin.add(yd, lab.b);
    const o = { x: xq, yd: N(yd), b: N(lab.b), calc: D(`${L.numTex(yd, st)} + ${Lin.cmp(lab.b, 0) < 0 ? `(${L.numTex(lab.b, st)})` : L.numTex(lab.b, st)} = ${L.numTex(v, st)}`) };
    return valueQ(lab, k, { id: 'predict', v, prompt: Cq(k, 'predict.prompt', o), hints: [Cq(k, 'predict.hint1', o), Cq(k, 'predict.hint2', o)], explain: Cq(k, 'predict.explain', o) });
  },
  cut: (lab, k) => {
    const st = lab.style; const N = (x) => D(L.numTex(x, st));
    const o = { b: N(lab.b), good: D(L.pointTex(0, lab.b, st)) };
    const opts = [
      { text: <MathText>{o.good}</MathText>, correct: true },
      { text: <MathText>{D(L.pointTex(lab.b, 0, st))}</MathText>, why: Cq(k, 'cut.whySwap', o) },
      { text: <MathText>{D(L.pointTex(0, 0, st))}</MathText>, why: Cq(k, 'cut.whyOrigin', o) },
    ];
    return { id: 'cut', kind: 'choice', cols: 3, prompt: Cq(k, 'cut.prompt'), options: shuffled(opts, seedOf(lab)), hints: [Cq(k, 'cut.hint1'), Cq(k, 'cut.hint2', o)], explain: Cq(k, 'cut.explain', o) };
  },
  readB: (lab, k) => {
    const st = lab.style; const N = (x) => D(L.numTex(x, st)); const h = lab.hidden;
    const o = { a: N(h.a), b: N(h.b) };
    return choiceOf(lab, k, {
      id: 'readB', good: h.b, seed: 0,
      wrongs: [{ v: h.a, why: Cq(k, 'readB.whySwap', o) }, { v: Lin.neg(h.b), why: Cq(k, 'sign') }],
      prompt: Cq(k, 'readB.prompt'), hints: [Cq(k, 'readB.hint1'), Cq(k, 'readB.hint2')], explain: Cq(k, 'readB.explain', o),
    });
  },
  readA: (lab, k) => {
    const st = lab.style; const N = (x) => D(L.numTex(x, st)); const h = lab.hidden;
    const o = { a: N(h.a), b: N(h.b) };
    return choiceOf(lab, k, {
      id: 'readA', good: h.a, seed: 1,
      wrongs: [{ v: h.b, why: Cq(k, 'readA.whySwap', o) }, { v: Lin.neg(h.a), why: Cq(k, 'sign') }],
      prompt: Cq(k, 'readA.prompt'), hints: [Cq(k, 'readA.hint1'), Cq(k, 'readA.hint2')], explain: Cq(k, 'readA.explain', o),
    });
  },
  origin: (lab, k) => {
    const st = lab.style; const N = (x) => D(L.numTex(x, st));
    const o = { b: N(lab.b), f: D(`f(0) = ${L.numTex(lab.b, st)}`) };
    const opts = [
      { text: Cq(k, 'origin.right', o), correct: true },
      { text: Cq(k, 'origin.window'), why: Cq(k, 'origin.whyWindow', o) },
      { text: Cq(k, 'origin.two'), why: Cq(k, 'origin.whyTwo') },
    ];
    return { id: 'origin', kind: 'choice', cols: 1, prompt: Cq(k, 'origin.prompt'), options: shuffled(opts, seedOf(lab)), hints: [Cq(k, 'origin.hint1'), Cq(k, 'origin.hint2', o)], explain: Cq(k, 'origin.explain', o) };
  },
  enough: (lab, k) => {
    const st = lab.style;
    const [p, q] = lab.placed;
    const o = { p: D(L.pointTex(p.x, p.y, st)), q: D(L.pointTex(q.x, q.y, st)) };
    const opts = [
      { text: Cq(k, 'enough.two'), correct: true },
      { text: Cq(k, 'enough.three'), why: Cq(k, 'enough.whyThree', o) },
      { text: Cq(k, 'enough.one'), why: Cq(k, 'enough.whyOne', o) },
    ];
    return { id: 'enough', kind: 'choice', cols: 1, prompt: Cq(k, 'enough.prompt'), options: shuffled(opts, seedOf(lab) + 1), hints: [Cq(k, 'enough.hint1'), Cq(k, 'enough.hint2')], explain: Cq(k, 'enough.explain', o) };
  },
  third: (lab, k) => {
    const st = lab.style; const N = (x) => D(L.numTex(x, st));
    const used = lab.placed.map((q) => Lin.fracText(q.x));
    const cands = [2, 4, 1, 3, 5, -1].filter((c) => !used.includes(String(c)));
    const xq = cands.find((c) => Lin.cmp(L.image(lab.a, lab.b, c), 0) >= 0) ?? cands[0] ?? 7;
    const v = L.image(lab.a, lab.b, xq);
    const o = { x: xq, f: D(`f(x) = ${L.affineTex(lab.a, lab.b, st)}`), calc: D(L.imageCalcTex(lab.a, lab.b, xq, st)), v: N(v) };
    return valueQ(lab, k, { id: 'third', v, prompt: Cq(k, 'third.prompt', o), hints: [Cq(k, 'third.hint1', o), Cq(k, 'third.hint2')], explain: Cq(k, 'third.explain', o) });
  },
  vocab: (lab, k) => {
    const st = lab.style; const N = (x) => D(L.numTex(x, st));
    const r = lab.readsDone.find((q) => q.axis === 'x') ?? lab.readsDone[0];
    const x = r.axis === 'x' ? r.v : r.other; const y = r.axis === 'x' ? r.other : r.v;
    const o = { x: N(x), y: N(y) };
    const opts = [
      { text: Cq(k, 'vocab.right', o), correct: true },
      { text: Cq(k, 'vocab.swap', o), why: Cq(k, 'vocab.whySwap', o) },
      { text: Cq(k, 'vocab.same', o), why: Cq(k, 'vocab.whySame', o) },
    ];
    return { id: 'vocab', kind: 'choice', cols: 1, prompt: Cq(k, 'vocab.prompt', o), options: shuffled(opts, seedOf(lab)), hints: [Cq(k, 'vocab.hint1', o), Cq(k, 'vocab.hint2')], explain: Cq(k, 'vocab.explain', o) };
  },
  antec: (lab, k) => {
    const st = lab.style; const N = (x) => D(L.numTex(x, st));
    const r = [...lab.readsDone].reverse().find((q) => q.axis === 'y');
    const o = { x: N(r.other), y: N(r.v) };
    return valueQ(lab, k, { id: 'antec', v: r.other, prompt: Cq(k, 'antec.prompt', o), hints: [Cq(k, 'antec.hint1', o), Cq(k, 'antec.hint2', o)], explain: Cq(k, 'antec.explain', o) });
  },
  compute: (lab, k) => {
    const st = lab.style; const N = (x) => D(L.numTex(x, st));
    const r = lab.readsDone.find((q) => q.axis === 'x') ?? lab.readsDone[0];
    const x = r.axis === 'x' ? r.v : r.other; const y = r.axis === 'x' ? r.other : r.v;
    const o = { x: N(x), f: D(`f(x) = ${L.affineTex(lab.a, lab.b, st)}`), calc: D(L.imageCalcTex(lab.a, lab.b, x, st)) };
    return valueQ(lab, k, { id: 'compute', v: y, prompt: Cq(k, 'compute.prompt', o), hints: [Cq(k, 'compute.hint1', o), Cq(k, 'compute.hint2')], explain: Cq(k, 'compute.explain', o) });
  },
  rule: (lab, k) => {
    const opts = discoveryFor(lab, k);
    const ci = opts.findIndex((o) => o.correct);
    return {
      id: 'rule', kind: 'choice', cols: 1,
      prompt: <MathText>{k(`dPrompt.${L.primaryMode(lab)}`)}</MathText>,
      options: ci === opts.length - 1 ? [opts[ci], ...opts.slice(0, ci)] : opts,
      hints: [Cq(k, `rule.hint1.${L.primaryMode(lab)}`), Cq(k, `rule.hint2.${L.primaryMode(lab)}`)],
      explain: Cq(k, `rule.explain.${L.primaryMode(lab)}`),
    };
  },
};
