import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, MapPin, Minus, Plus, Lightbulb } from 'lucide-react';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
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
import * as L from '../logic/lineCrossing';

/**
 * line-crossing — DEUX DROITES, UN POINT (unité 7 « الدالة التآلفية », leçon 4 « التفسير البياني لحل جملة
 * معادلتين من الدرجة الأولى بمجهولين »).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève CHOISIT l'écriture y = mx + p de chaque équation (cartes ; une carte fausse est refusée par un
 *    témoin), puis PROMÈNE un point P sur le plan (glisser, toucher un nœud, flèches + Entrée, boutons) ;
 *    au niveau avancé il TIENT la seconde droite (son terme constant p sur la piste de l'axe des ordonnées,
 *    sa pente m sur la piste de droite).
 * B. Idée : chaque équation de la جملة est une droite (y = mx + p) ; un point vérifie une équation ⇔ il est
 *    sur sa droite ; la ثنائية solution = les coordonnées du point COMMUN aux deux droites ; deux droites
 *    parallèles n'en ont aucun (pas de solution), deux droites confondues en ont une infinité.
 * C. Pendant le geste : P suit le doigt ; la lampe de chaque équation s'allume quand P est sur sa droite et
 *    la substitution s'écrit (« 36 + 7 = 43 ») ; la droite tenue glisse et pivote ; dans le monde du manuel,
 *    des pièces tombent dans la caisse de la classe.
 * D. La جملة écrite y = … / y = … ; la ثنائية (x ; y) lue au point aux deux lampes, vérifiée par le calcul ;
 *    la position relative des droites (متقاطعان / متوازيان / منطبقان) et le nombre de solutions.
 * E. À découvrir avant la règle : un point d'UNE droite n'allume qu'une lampe ; seul le point d'intersection
 *    allume les deux (et (y ; x) n'en allume qu'une) ; parallèles : jamais les deux ; confondues : partout.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        interprétation graphique d'une جملة : solution = intersection ; trois positions relatives
 *   OBJECT         deux droites tracées par l'élève, un point P, deux lampes ; (متقدم) la seconde droite en main
 *   VARIABLE       la position (x ; y) de P ; l'écriture y = mx + p choisie ; (cases) m et p de la droite (2)
 *   INVARIANT      la droite (1) ne bouge jamais ; chaque lampe dit la vérité EXACTE de son équation
 *   TRANSFORMATION P glisse, les lampes s'allument / s'éteignent ; la droite (2) pivote / glisse
 *   CONSTRAINT     une écriture n'est acceptée que si elle EST la droite (`affine.lineFromEquation`)
 *   RESISTANCE     carte fausse : elle tremble, et un témoin exact la réfute (« x = 0 donne y = −43, et
 *                  0 + (−43) = −43 ≠ 43 ») ; une lampe ne s'allume jamais « presque » ; une intersection hors des
 *                  nœuds est DITE (lecture approchée, la valeur exacte vient du calcul)
 *   EVIDENCE       les essais de P (une lampe / deux lampes), les configurations tenues (m, p, position)
 *   CONTRAST       un point à une lampe ET le point aux deux lampes ; (cases) parallèles ET confondues
 *   PREDICTION     « où les deux lampes s'allumeront-elles ? » se décide avant de déplacer P
 *   DISCOVERY      les distracteurs (« tout point d'une droite », « (y ; x) », « parallèles = infinité ») sont
 *                  réfutés par les propres essais de l'élève
 *   FORMALIZATION  la جملة ⇔ deux droites, la ثنائية = intersection, vérifiée par substitution ; les trois cas
 *   TRANSFER       معارف (startWith="cases" sur x + y = 3 et 2x − y = 0) ; أوظّف (lecture approchée puis calcul)
 *
 * QUESTIONS PENDANT LE LABO (2026-10-28, lot 4) : à la fin de chaque étape (`L.stepsOf` : tracer · promener P · les trois cas) une suite de
 * questions se pose PAR-DESSUS le labo (`CHAINS`) et retient la suite (P ne se pose plus, « فتح الحالات » attend) ; la dernière étape finit par LA
 * RÈGLE. Étapes `LabStepper` (`[data-lc-step=<i>]`) + fête ; « إعادة » repart de zéro ; obligatoires pour tout élève, coupées par l'enseignant pour
 * SON compte (`useLabCheckpointSettings`) ; `checkpoints` = false les coupe aussi ; `onCheckpoint(ev)` : la trace pour les étapes du module.
 *
 * Manuel (§6bis) : chaque carte, chaque point, chaque droite est un choix ou une réponse — pas
 * d'auto-complétion.
 *
 * DÉCOR (exigence du propriétaire) — sans information : la caisse de la classe où tombent des pièces de 100DA
 * et 200DA quand les deux lampes s'allument (coins, نشاط 5) ; des faisceaux laser d'un spectacle de lumière et
 * un éclair au croisement (laser, مبتدئ). `aria-hidden`, hors du clavier, immobiles sous
 * `prefers-reduced-motion`, ne portent jamais la réponse.
 *
 * D'UN SEUL REGARD (MANIPULATION_CONTRACT §8bis) : le plan est budgété sur la hauteur de l'écran de leçon
 * (`useLessonViewport`) moins les commandes mesurées ; l'unité est la même sur les deux axes. Large (≥ 620 px) :
 * plan et commandes côte à côte ; sinon les commandes juste dessous. Les pistes p / m sont COLLÉES au plan.
 * Les essais sont dans un `LabFold` sous la manipulation. Le bloc mesuré est `[data-lc-glance]`.
 *
 * PROPS
 *   system     « x+y=43|100x+200y=5000 » (linearSystem.eq2 ; chaque équation contient y)
 *   cases      'true' : l'étape des trois cas s'ouvre (par un bouton) après le point commun
 *   startWith  'build' (défaut) | 'cases' (les droites déjà tracées, la (2) en main — exemple de معارف)
 *   xMin xMax yMin yMax  la fenêtre (chaînes ; défaut calculé : O, les points sur les axes, l'intersection)
 *   theme      'coins' (manuel, نشاط 5) | 'laser' (défaut) — mots dans lesson.json › manipulation.lineCrossing.themes
 *   title lead mission level levels  comme les autres types ; onTrial(t) à chaque essai validé :
 *     { kind: 'form', i, ok, tex } | { kind: 'point', ok1, ok2, x, y, pair, tex } | { kind: 'config', rel, tex, x, y, grid } ;
 *   onFinished({ stage, pair }) à la règle formelle — tous deux par `state.report`.
 *
 * CONTRAT DOM : [data-line-crossing][data-stage=build|probe|cases][data-theme][data-system][data-layout],
 * [data-lc-glance], [data-lc-plane][data-w][data-h], [data-lc-line=1|2][data-tex], [data-lc-pin][data-x][data-y],
 * [data-lc-card=<i>:<k>][data-ok], [data-lc-eq=1|2][data-built], [data-lc-lamp=1|2][data-on],
 * [data-lc-move=left|right|up|down], [data-lc-place], [data-lc-open-cases], [data-lc-back], [data-lc-strip=p|m],
 * [data-lc-handle=p|m], [data-lc-rel=unique|parallel|same], [data-lc-verdict=<kind>], [data-lc-trial], [data-lc-formal],
 * [data-deco].
 */
const STRIP_W = 44;
const GAP = 12;
const TITLE_H = 20;
const C1 = '#4F46E5';
const C2 = '#D97706';

export default function LineCrossing({
  system: system0, cases: cases0, startWith = 'build', xMin, xMax, yMin, yMax, theme: theme0 = 'laser',
  title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false,
  onTrial, onFinished, onCheckpoint,
}) {
  const { t, i18n } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.lineCrossing.${key}`, o), [t]);
  const reduce = useReducedMotion();
  const state = useManipulation({
    type: 'line-crossing',
    initialNumbers: { system: system0, ...(cases0 != null ? { cases: String(cases0) } : {}) },
    initialMode, initialLevel: level, withLevels, hintCount: 3,
  });
  const { system, cases } = state.numbers;
  const authored = state.isAuthoredLevel;
  // le monde suit la jumla : le manuel (43 pièces) est la caisse de la classe, le reste le spectacle laser
  const theme = authored && L.THEMES.includes(theme0) ? theme0 : (String(system).includes('5000') ? 'coins' : 'laser');
  const tw = (key, o) => t(`manipulation.lineCrossing.themes.${theme}.${key}`, o);
  const make = () => L.init({ system, cases, ...(authored ? { startWith, xMin, xMax, yMin, yMax } : {}) });
  const [lab, setLab] = useState(make);
  const sceneKey = `${system}:${cases ?? ''}:${state.epoch}:${state.resetCount}:${authored}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [cleared, setCleared] = useState([]);   // les étapes dont la suite de questions est finie
  const [pin, setPin] = useState(() => startPin(lab));
  const [drag, setDrag] = useState(false);
  const [shake, setShake] = useState(0);
  const [liveP, setLiveP] = useState(null);
  const [liveM, setLiveM] = useState(null);
  // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — les droites, les essais et les questions du labo
  if (scene.key !== sceneKey) {
    const fresh = make();
    setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(fresh); setPin(startPin(fresh)); setDrag(false); setLiveP(null); setLiveM(null); setCleared([]);
  }

  const ready = L.discoveryReady(lab);
  const cpSettings = useLabCheckpointSettings('line-crossing');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
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
    onRetry: () => { const fresh = L.restartStep(lab, active); setLab(fresh); setPin(startPin(fresh)); setLiveP(null); setLiveM(null); },
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
  const solution = L.intersectOf(lab.lines[0], lab.lines[1]);
  useEffect(() => {
    if (state.isFormal) state.report(onFinished, { stage: lab.stage, pair: solution.kind === 'unique' ? L.pairText(solution.x, solution.y) : null });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  // le son du GESTE (muet sans « الصوت ») : « tooth » un pas, « bell » une écriture juste ou un cas complet, « flag » les deux lampes, « over » un refus
  useEffect(() => {
    const kind = lab.last?.kind;
    if (!kind) return;
    if (kind === 'both') playSfx('flag');
    else if (kind === 'wrongForm' || kind === 'none') playSfx('over');
    else if (kind === 'built') playSfx('bell');
    else if (kind === 'config') playSfx(lab.last.rel === 'unique' ? 'tooth' : 'bell');
    else if (kind === 'one') playSfx('tooth');
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials === 0) return;
    state.report(onTrial, trialReport(lab.trials[nTrials - 1]));
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure ── */
  const boxRef = useRef(null);
  const ctrlRef = useRef(null);
  const [width, setWidth] = useState(640);
  const [ctrlH, setCtrlH] = useState(240);
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
  const budget = Math.max(300, screenH - 8);
  const wide = width >= 620;
  const strip = STRIP_W;
  const casesOn = lab.stage === 'cases';

  /* ── géométrie ── */
  const { win, snap, grid } = lab;
  const planeCol = wide ? Math.floor((width - GAP) * 0.58) : width;
  // sur un téléphone étroit, les pistes cèdent la place au plan : b et a se règlent par −/+ (et le clavier)
  const stripsOn = casesOn && true;
  const availW = planeCol - (stripsOn ? 2 * strip : 0);
  const availH = Math.max(140, (wide ? budget : budget - ctrlH - GAP) - 2 * TITLE_H - 8);
  const geo = useMemo(() => L.planeGeometry({ win, width: availW, height: availH, orthonormal: true }), [win, availW, availH]);
  const W = Math.round(geo.W);
  const H = Math.round(geo.H);
  const xr = L.indexRange(win.xMin, win.xMax, snap.dx);
  const yr = L.indexRange(win.yMin, win.yMax, snap.dy);
  const clampI = (i) => Math.max(xr.min, Math.min(xr.max, i));
  const clampJ = (j) => Math.max(yr.min, Math.min(yr.max, j));
  const pinRef = useRef(pin);
  pinRef.current = pin;
  const px = L.valueAt(pin.i, snap.dx);
  const py = L.valueAt(pin.j, snap.dy);
  const probing = lab.stage !== 'build';

  /* ── la seconde droite tenue (cases) ── */
  const pR = L.pRange(lab);
  const mR = L.mRange(lab);
  const jp = casesOn ? Math.max(pR.min, Math.min(pR.max, liveP ?? L.pIndex(lab, lab.held.b))) : 0;
  const jm = casesOn ? Math.max(mR.min, Math.min(mR.max, liveM ?? L.mIndex(lab, lab.held.a))) : 0;
  const heldNow = casesOn ? { a: L.mAt(lab, jm), b: L.pAt(lab, jp) } : null;
  const jRef = useRef({ jp, jm });
  jRef.current = { jp, jm };
  const commitHold = (m, p) => setLab((s) => L.hold(s, m, p));
  // Miroir synchrone de `lab` pour « جرّب كل الإمكانيات » : on balaye les pentes m de la graduation, p tenu.
  const labRef = useRef(lab);
  labRef.current = lab;
  const sweepM = (j) => {
    const p = labRef.current.held.b;
    labRef.current = L.hold(labRef.current, L.mAt(labRef.current, j), p);
    setLiveM(j);
    setLab((s) => L.hold(s, L.mAt(s, j), s.held.b));
  };
  const untriedM = L.untriedSlopes(lab);
  const sP = useStretchInteraction({
    value: casesOn ? jp : null, range: pR, direction: 'ltr',
    toValue: useCallback((_cx, cy, rect) => geo.fromPx(0, cy - rect.top).y / L.toNum(snap.dy), [geo, snap.dy]),
    onChange: setLiveP,
    onCommit: (j) => { setLiveP(j); commitHold(L.mAt(lab, jRef.current.jm), L.pAt(lab, j)); },
  });
  const sM = useStretchInteraction({
    value: casesOn ? jm : null, range: mR, direction: 'ltr',
    toValue: useCallback((_cx, cy, rect) => mR.max - ((cy - rect.top - 22) / Math.max(1, rect.height - 44)) * (mR.max - mR.min), [mR.max, mR.min]),
    onChange: setLiveM,
    onCommit: (j) => { setLiveM(j); commitHold(L.mAt(lab, j), L.pAt(lab, jRef.current.jp)); },
  });

  /* ── gestes sur le plan ── */
  const planeRef = useRef(null);
  const nodeAt = (e) => {
    const r = planeRef.current.getBoundingClientRect();
    const v = geo.fromPx(e.clientX - r.left, e.clientY - r.top);
    return { i: clampI(L.indexOf(v.x, snap.dx)), j: clampJ(L.indexOf(v.y, snap.dy)) };
  };
  const commitPin = (p) => {
    if (!p || cp.blocking) return;
    setLab((s) => L.place(s, L.valueAt(p.i, s.snap.dx), L.valueAt(p.j, s.snap.dy)));
  };
  const onPlaneDown = (e) => {
    if (e.button > 0 || !planeRef.current || !probing || cp.blocking) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true); setPin(nodeAt(e));
  };
  const onPlaneMove = (e) => { if (drag) setPin(nodeAt(e)); };
  const onPlaneUp = (e) => {
    if (!drag) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDrag(false); commitPin(pinRef.current);
  };
  const heard = useRef(0);
  const tick = () => { const now = Date.now(); if (now - heard.current > 35) { playSfx('tooth'); heard.current = now; } };
  const movePin = (di, dj) => { tick(); setPin((p) => ({ i: clampI(p.i + di), j: clampJ(p.j + dj) })); };
  const onPinKey = (e) => {
    const big = e.shiftKey ? 5 : 1;
    const m = { ArrowLeft: [-big, 0], ArrowRight: [big, 0], ArrowUp: [0, big], ArrowDown: [0, -big] }[e.key];
    if (m) { e.preventDefault(); movePin(...m); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); commitPin(pinRef.current); }
  };
  const pickCard = (i, kk) => {
    setLab((s) => {
      const next = L.choose(s, i, kk);
      if (next.last?.kind === 'wrongForm') setShake((n) => n + 1);
      return next;
    });
  };

  /* ── lectures vivantes ── */
  const lamps = probing ? livelamps(lab, px, py, heldNow) : [false, false];
  const rel = casesOn ? L.intersectOf(lab.lines[0], heldNow) : solution;
  const verdict = verdictOf(lab, k, tw);
  const bothTrials = lab.trials.filter((tr) => tr.kind === 'point' && tr.ok1 && tr.ok2).length;

  /* ── textes ── */
  const missionText = mission ?? <MathText>{k(`mission.${lab.cases ? 'cases' : 'probe'}`)}</MathText>;
  const hintKeys = [0, 1, 2].map((i) => k(`hints.${lab.cases ? 'cases' : 'probe'}.${i}`));
  const discoveryOptions = useMemo(() => discoveryFor(lab, k), [lab, k]);
  const formal = <Formal lab={lab} k={k} tw={tw} solution={solution} />;
  const representation = <Representation lab={lab} k={k} px={px} py={py} lamps={lamps} probing={probing} />;

  /* ── dessin ── */
  const P = (x, y) => [geo.px(x), geo.py(y)];
  const xTicks = L.ticks(win.xMin, win.xMax, grid.minor);
  const yTicks = L.ticks(win.yMin, win.yMax, grid.minor);
  const isLabel = (v) => v !== 0 && Math.abs(Math.round(v / L.toNum(grid.label)) * L.toNum(grid.label) - v) < 1e-9;
  const line1 = lab.built[0] ? L.segmentOf(lab.lines[0], win) : null;
  const g2 = casesOn ? heldNow : lab.lines[1];
  const line2 = lab.built[1] ? L.segmentOf(g2, win) : null;
  const layout = wide ? 'side' : 'stack';
  const laser = theme === 'laser';
  const relKind = casesOn ? rel.kind : null;

  const plane = (
    <div dir="ltr" className="mx-auto w-max max-w-full" data-lc-planeblock>
      <div className="relative" style={{ height: TITLE_H, marginLeft: stripsOn ? strip : 0, width: W }}>
        <span dir="rtl" className="absolute top-0 truncate whitespace-nowrap text-[11px] font-bold text-slate-600" style={{ left: Math.max(0, Math.min(geo.px(0) + 6, W - 120)), maxWidth: W }} data-lc-axis="y">{tw('yAxis')}</span>
      </div>
      <div className="flex items-stretch">
        {stripsOn && (
          <Strip vertical s={sP} which="p" length={H} thick={strip} pos={geo.py(L.toNum(heldNow.b))}
            label={k('pHandle', { p: L.numText(heldNow.b) })} valueText={L.numText(heldNow.b)} tag="b" color={C2} />
        )}
        <div
          ref={planeRef}
          className={`relative shrink-0 rounded-lg border border-slate-200 ${laser ? 'bg-slate-900' : 'bg-white'} ${probing ? 'cursor-crosshair' : ''}`}
          style={{ width: W, height: H, touchAction: probing ? 'none' : 'auto' }}
          onPointerDown={onPlaneDown} onPointerMove={onPlaneMove} onPointerUp={onPlaneUp} onPointerCancel={onPlaneUp}
          role="group" aria-label={k('planeAria')}
          data-lc-plane data-w={W} data-h={H}
        >
          <svg width={W} height={H} className="absolute inset-0" aria-hidden="true" focusable="false">
            <style>{LC_CSS}</style>
            {laser && (
              <defs>
                <filter id="lc-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.4" /></filter>
              </defs>
            )}
            {xTicks.map((x) => <line key={`gx${L.numText(x)}`} x1={geo.px(L.toNum(x))} x2={geo.px(L.toNum(x))} y1={geo.py(win.yMax)} y2={geo.py(win.yMin)} stroke={laser ? '#1E293B' : '#E2E8F0'} strokeWidth={1} />)}
            {yTicks.map((y) => <line key={`gy${L.numText(y)}`} x1={geo.px(win.xMin)} x2={geo.px(win.xMax)} y1={geo.py(L.toNum(y))} y2={geo.py(L.toNum(y))} stroke={laser ? '#1E293B' : '#E2E8F0'} strokeWidth={1} />)}
            <line x1={geo.px(win.xMin)} x2={geo.px(win.xMax) + 6} y1={geo.py(0)} y2={geo.py(0)} stroke={laser ? '#CBD5E1' : '#334155'} strokeWidth={1.6} />
            <path d={`M${geo.px(win.xMax) + 8} ${geo.py(0)} l-7 -4 v8 z`} fill={laser ? '#CBD5E1' : '#334155'} />
            <line x1={geo.px(0)} x2={geo.px(0)} y1={geo.py(win.yMin)} y2={geo.py(win.yMax) - 6} stroke={laser ? '#CBD5E1' : '#334155'} strokeWidth={1.6} />
            <path d={`M${geo.px(0)} ${geo.py(win.yMax) - 8} l-4 7 h8 z`} fill={laser ? '#CBD5E1' : '#334155'} />
            {xTicks.map((x) => {
              const v = L.toNum(x);
              if (!isLabel(v)) return null;
              const below = geo.py(0) + 13 <= H - 1;
              return <text key={`tx${v}`} x={geo.px(v)} y={below ? geo.py(0) + 12 : geo.py(0) - 4} textAnchor="middle" fontSize={10} fill={laser ? '#94A3B8' : '#475569'} fontFamily="ui-monospace, monospace">{L.numText(x).replace('-', '−')}</text>;
            })}
            {yTicks.map((y) => {
              const v = L.toNum(y);
              if (!isLabel(v)) return null;
              const left = geo.px(0) - 4 >= 18;
              return <text key={`ty${v}`} x={left ? geo.px(0) - 4 : geo.px(0) + 4} y={geo.py(v) + 3.5} textAnchor={left ? 'end' : 'start'} fontSize={10} fill={laser ? '#94A3B8' : '#475569'} fontFamily="ui-monospace, monospace">{L.numText(y).replace('-', '−')}</text>;
            })}
            <text x={geo.px(0) - 4} y={geo.py(0) + 12} textAnchor="end" fontSize={11} fontWeight="bold" fill={laser ? '#E2E8F0' : '#0F172A'} fontFamily="ui-monospace, monospace">O</text>
            {[[line1, C1, 1, lab.lines[0]], [line2, C2, 2, g2]].map(([seg, color, n, g]) => seg && (
              <g key={`l${n}`} data-lc-line={n} data-tex={L.lineTex(g)}>
                {laser && <line x1={geo.px(seg[0][0])} y1={geo.py(seg[0][1])} x2={geo.px(seg[1][0])} y2={geo.py(seg[1][1])} stroke={color} strokeWidth={7} opacity={0.55} filter="url(#lc-glow)" />}
                <line x1={geo.px(seg[0][0])} y1={geo.py(seg[0][1])} x2={geo.px(seg[1][0])} y2={geo.py(seg[1][1])}
                  stroke={color} strokeWidth={n === 2 && relKind === 'same' ? 2.4 : 2.6} strokeDasharray={n === 2 && relKind === 'same' ? '7 5' : undefined} strokeLinecap="round" />
                <LineTag seg={seg} geo={geo} W={W} H={H} n={n} color={color} />
              </g>
            ))}
            {/* le dernier point aux deux lampes : un anneau */}
            {lab.last?.kind === 'both' && (
              <circle cx={P(L.toNum(lab.last.x), L.toNum(lab.last.y))[0]} cy={P(L.toNum(lab.last.x), L.toNum(lab.last.y))[1]} r={10} fill="none" stroke="#059669" strokeWidth={2.5} data-lc-found />
            )}
            {/* l'intersection hors des nœuds (cases) : un repère approché */}
            {casesOn && rel.kind === 'unique' && !L.onGrid(lab, rel) && L.toNum(rel.x) >= win.xMin && L.toNum(rel.x) <= win.xMax && L.toNum(rel.y) >= win.yMin && L.toNum(rel.y) <= win.yMax && (
              <circle cx={geo.px(L.toNum(rel.x))} cy={geo.py(L.toNum(rel.y))} r={6} fill="none" stroke="#7C3AED" strokeWidth={1.6} strokeDasharray="3 2" data-lc-offgrid />
            )}
            {laser && <LaserDeco geo={geo} W={W} H={H} flash={bothTrials} reduce={reduce} />}
          </svg>
          {/* P (le point promené) */}
          {probing && (
            <button type="button" onKeyDown={onPinKey}
              aria-label={k('pin', { p: L.pairText(px, py) })}
              className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${drag ? 'bg-sky-500/10' : ''}`}
              style={{ left: geo.px(L.toNum(px)), top: geo.py(L.toNum(py)), cursor: drag ? 'grabbing' : 'grab' }}
              data-lc-pin={L.pairText(px, py)} data-x={L.numText(px)} data-y={L.numText(py)}>
              <span className="block h-4 w-4 rounded-full border-2 border-white shadow" style={{ background: lamps[0] && lamps[1] ? '#059669' : lamps[0] || lamps[1] ? '#0EA5E9' : '#64748B' }} />
              <span className="absolute -top-3 left-6 rounded bg-white/90 px-1 font-mono text-[10px] font-bold text-slate-800">P</span>
            </button>
          )}
          {theme === 'coins' && <CoinJar drops={bothTrials} reduce={reduce} words={{ jar: tw('jar') }} />}
        </div>
        {stripsOn && (
          <Strip vertical s={sM} which="m" length={H} thick={strip} pos={22 + ((mR.max - jm) / Math.max(1, mR.max - mR.min)) * (H - 44)}
            label={k('mHandle', { m: L.numText(heldNow.a) })} valueText={L.numText(heldNow.a)} tag="a" color={C2} />
        )}
      </div>
      <div className="relative" style={{ height: TITLE_H, marginLeft: stripsOn ? strip : 0, width: W }}>
        <span dir="rtl" className="absolute top-0.5 max-w-full truncate whitespace-nowrap text-[11px] font-bold text-slate-600" style={{ right: 4 }} data-lc-axis="x">{tw('xAxis')}</span>
      </div>
    </div>
  );

  const bi = L.buildingIndex(lab);
  const lampFull = true;
  const controls = (
    <div ref={ctrlRef} className="space-y-2" data-lc-controls>
      {steps.length > 1 && <LabStepper count={steps.length} current={Math.min(nDone, steps.length - 1)} done={stepDone} stepAttr="data-lc-step" />}
      <ul className="space-y-0.5" aria-label={k('systemTitle')}>
        {[0, 1].map((i) => ((lab.stage !== 'build' || lab.built[i]) ? (
          <li key={i} className="flex flex-wrap items-center gap-1 font-bold text-sm" data-lc-eq={i + 1} data-built={lab.built[i] ? 'true' : 'false'}>
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: i === 0 ? C1 : C2 }} aria-hidden="true" />
            <span className="text-slate-500">({i + 1})</span>
            <MathText>{`$${L.eqTex(lab.eqs[i])}$`}</MathText>
            <span className="text-slate-700"><MathText>{`$\\iff ${L.lineTex(lab.lines[i])}$`}</MathText></span>
          </li>
        ) : null))}
      </ul>
      {lab.stage === 'build' && bi != null && (
        <div className="space-y-1.5" data-lc-build={bi + 1}>
          <p className="text-xs font-bold text-slate-700"><MathText>{k('buildPrompt', { n: bi + 1, eq: L.eqTex(lab.eqs[bi]) })}</MathText></p>
          <div className="grid grid-cols-2 gap-1">
            {lab.cands[bi].map((c, kk) => {
              const refused = lab.last?.kind === 'wrongForm' && lab.last.i === bi && lab.last.k === kk;
              return (
                <button key={`${bi}:${kk}`} type="button" onClick={() => pickCard(bi, kk)}
                  className={`min-h-[44px] rounded-xl border-2 px-1 py-0.5 font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-sm ${refused ? 'border-rose-400 bg-rose-50' : 'border-slate-300 bg-white hover:border-indigo-400'}`}
                  data-lc-card={`${bi}:${kk}`} data-ok={c.ok ? 'true' : 'false'}>
                  <span key={refused ? `s${shake}` : 'n'} className={refused ? 'lc-shake inline-block' : 'inline-block'}><MathText>{`$${L.candTex(c)}$`}</MathText></span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {probing && lampFull && (
        <div className="flex flex-wrap items-center gap-1" data-lc-pinpad>
          <div dir="ltr" className="flex gap-0.5">
            {[['left', -1, 0, ArrowLeft, 'pinLeft'], ['right', 1, 0, ArrowRight, 'pinRight'], ['up', 0, 1, ArrowUp, 'pinUp'], ['down', 0, -1, ArrowDown, 'pinDown']].map(([id, di, dj, Icon, key]) => (
              <button key={id} type="button" onClick={() => movePin(di, dj)} aria-label={k(key)} data-lc-move={id}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </button>
            ))}
          </div>
          <button type="button" onClick={() => commitPin(pinRef.current)} data-lc-place aria-live="polite"
            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-emerald-600 bg-white px-2 text-sm font-bold text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
            <MapPin className="h-4 w-4" aria-hidden="true" /> {k('place')} <MathText>{`$${L.pairTex(px, py)}$`}</MathText>
          </button>
        </div>
      )}
      {probing && (
        <div className={lampFull ? 'grid grid-cols-1 gap-1' : 'flex flex-wrap gap-1'} data-lc-lamps>
          {[0, 1].map((i) => (
            <Lamp key={i} n={i + 1} on={lamps[i]} color={i === 0 ? C1 : C2} caption={lampFull ? tw(`lamp${i + 1}`) : ''} compact={false}
              tex={lampFull ? (i === 1 && casesOn ? L.substLineTex(heldNow, px, py) : L.substTex(lab.eqs[i], px, py)) : null} k={k} />
          ))}
        </div>
      )}
      {casesOn && (
        <div className="space-y-1" data-lc-casespad>
          <p className="flex flex-wrap items-center gap-1 font-bold text-slate-800 text-sm">
            <span className="text-slate-500">{k('heldNow')}</span>
            <span className="rounded-lg border-2 border-amber-300 bg-white px-1.5 py-0.5"><MathText>{`$${L.lineTex(heldNow)}$`}</MathText></span>
            <span className={`rounded-full px-2 py-0.5 text-xs text-white ${rel.kind === 'unique' ? 'bg-indigo-600' : rel.kind === 'parallel' ? 'bg-rose-600' : 'bg-emerald-600'}`} data-lc-rel={rel.kind}>{k(`rel.${rel.kind}`)}</span>
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <StepPair s={sP} less={k('lessP')} more={k('moreP')} which="p" tag="b" />
            <StepPair s={sM} less={k('lessM')} more={k('moreM')} which="m" tag="a" />
          </div>
        </div>
      )}
      <p role="status" className="font-bold leading-snug min-h-[2.5rem] text-sm" data-lc-verdict={lab.last?.kind ?? ''}>{verdict}</p>
      {L.canOpenCases(lab) && !cp.blocking && (!cpLive || cleared.includes('probe')) && (
        <button type="button" onClick={() => setLab((s) => L.openCases(s))} data-lc-open-cases
          className="min-h-[44px] rounded-xl border-2 border-violet-500 bg-violet-50 px-3 text-sm font-bold text-violet-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
          {k('openCases')}
        </button>
      )}
      {casesOn && lab.startWith !== 'cases' && (
        <button type="button" onClick={() => setLab((s) => L.backToProbe(s))} data-lc-back
          className="min-h-[44px] rounded-xl px-2 text-xs font-bold text-slate-600 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
          {k('back')}
        </button>
      )}
    </div>
  );

  return (
    <ManipulationShell
      type="line-crossing"
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
        autoComplete: casesOn ? {
          label: t('manipulation.autoComplete.tryAll'),
          ready: true,
          remaining: untriedM.length,
          intervalMs: 480,
          maxTicks: 80,
          step: () => { const j = L.untriedSlopes(labRef.current)[0]; if (j !== undefined) sweepM(j); },
          finish: () => { L.untriedSlopes(labRef.current).forEach(sweepM); },
        } : undefined,
      }}
      representation={representation}
      discovery={(
        <ManipulationDiscovery state={state} prompt={<MathText>{k(lab.cases ? 'dPrompt.cases' : 'dPrompt.probe')}</MathText>} options={discoveryOptions} formal={formal} />
      )}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-indigo-50/60 to-white">
        <div ref={boxRef} className="relative space-y-3" data-line-crossing data-stage={lab.stage} data-theme={theme} data-system={system}
          data-layout={layout} data-budget={budget} data-ctrl-h={ctrlH}>
          {party.node}
          {cp.node}
          <div className={wide ? 'grid items-start gap-3' : 'space-y-3'} style={wide ? { gridTemplateColumns: `${planeCol}px 1fr` } : undefined} data-lc-glance>
            {plane}
            {controls}
          </div>
          {lab.trials.length > 0 && (
            <LabFold id="line-crossing.trials" title={k('trialsTitle')}>
              <ul className="flex flex-wrap gap-1.5" data-lc-trials>
                {lab.trials.slice(-12).map((tr, n) => {
                  const r = trialReport(tr);
                  const ok = tr.kind === 'point' ? tr.ok1 && tr.ok2 : tr.kind === 'form' ? tr.ok : true;
                  return (
                    <li key={`${tr.kind}${n}`} data-lc-trial={tr.kind} data-ok={ok ? 'true' : 'false'}
                      className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${ok ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-slate-300 bg-white text-slate-800'}`}>
                      <MathText>{`$${r.tex}$`}</MathText>
                      {tr.kind === 'point' && <> · {k('lampsShort', { n: (tr.ok1 ? 1 : 0) + (tr.ok2 ? 1 : 0) })}</>}
                      {tr.kind === 'config' && <> · {k(`relShort.${tr.rel}`)}</>}
                      {tr.kind === 'form' && <> · {k(tr.ok ? 'tAccepted' : 'tRefused')}</>}
                    </li>
                  );
                })}
              </ul>
            </LabFold>
          )}
          {i18n.exists(`lesson:manipulation.lineCrossing.themes.${theme}.world`) && <p className="text-[11px] text-slate-500" data-lc-world>{tw('world')}</p>}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ── aides ── */

/** Un nœud de départ pour P : sur aucune des deux droites, et pas à l'intersection (rien n'est offert). */
function startPin(s) {
  const xr = L.indexRange(s.win.xMin, s.win.xMax, s.snap.dx);
  const yr = L.indexRange(s.win.yMin, s.win.yMax, s.snap.dy);
  let i = Math.max(xr.min, Math.min(xr.max, Math.round((xr.min + xr.max) / 4) || 1));
  let j = Math.max(yr.min, Math.min(yr.max, Math.round((yr.min + 3 * yr.max) / 4)));
  for (let n = 0; n < 40; n += 1) {
    const x = L.valueAt(i, s.snap.dx); const y = L.valueAt(j, s.snap.dy);
    const on = s.lines.some((g) => L.same(L.lineAt(g, x), y));
    if (!on) break;
    j = j - 1 >= yr.min ? j - 1 : yr.max; if (n % 5 === 4) i = i + 1 <= xr.max ? i + 1 : xr.min;
  }
  return { i, j };
}

function livelamps(lab, x, y, heldNow) {
  if (lab.stage !== 'cases') return L.lampsAt(lab, x, y);
  const one = L.lampsAt(lab, x, y)[0];
  const two = L.same(L.lineAt(heldNow, x), y);
  return [one, two];
}

function trialReport(tr) {
  if (tr.kind === 'form') return { kind: 'form', i: tr.i + 1, ok: tr.ok, tex: L.candTex(tr.cand) };
  if (tr.kind === 'point') return { kind: 'point', ok1: tr.ok1, ok2: tr.ok2, x: L.numText(tr.x), y: L.numText(tr.y), pair: L.pairText(tr.x, tr.y), tex: `P${L.pairTex(tr.x, tr.y)}`, stage: tr.stage, rel: tr.rel };
  return { kind: 'config', rel: tr.rel, tex: L.lineTex({ a: tr.m, b: tr.p }), x: tr.x ? L.numText(tr.x) : null, y: tr.y ? L.numText(tr.y) : null, grid: tr.grid };
}

function verdictOf(lab, k, tw) {
  const last = lab.last;
  const T = (s) => <MathText>{s}</MathText>;
  if (!last) return lab.stage === 'build' ? <span className="text-slate-600">{k('vStart')}</span> : null;
  switch (last.kind) {
    case 'wrongForm': {
      const w = last.witness;
      return <span className="text-rose-800">{T(k('vWrongForm', { cand: L.candTex(last.cand), x: L.numTex(w.x), y: L.numTex(w.y), calc: L.substTex(lab.eqs[last.i], w.x, w.y) }))}</span>;
    }
    case 'built': return <span className="text-emerald-800">{T(k(last.both ? 'vBuiltBoth' : 'vBuilt', { n: last.i + 1, eq: L.lineTex(lab.lines[last.i]) }))}</span>;
    case 'none': return <span className="text-slate-700">{T(k('vNone', { p: L.pairTex(last.x, last.y) }))}</span>;
    case 'one': return <span className="text-sky-800">{T(k('vOne', { p: L.pairTex(last.x, last.y), n: last.ok1 ? 1 : 2, m: last.ok1 ? 2 : 1 }))}</span>;
    case 'both': return <span className="text-emerald-800">{T(k(lab.stage === 'cases' ? 'vBothCases' : 'vBoth', { p: L.pairTex(last.x, last.y), meaning: tw('meaning', { x: L.numText(last.x), y: L.numText(last.y) }) }))}</span>;
    case 'openCases': return <span className="text-violet-800">{T(k('vOpenCases'))}</span>;
    case 'config':
      if (last.rel === 'parallel') return <span className="text-rose-800">{T(k('vParallel'))}</span>;
      if (last.rel === 'same') return <span className="text-emerald-800">{T(k('vSame'))}</span>;
      return <span className="text-indigo-800">{T(k(last.grid ? 'vSecant' : 'vSecantOff', { p: L.pairTex(last.x, last.y), ax: L.approxNum(last.x), ay: L.approxNum(last.y) }))}</span>;
    default: return null;
  }
}

function discoveryFor(lab, k) {
  const M = (s) => <MathText>{s}</MathText>;
  if (lab.cases) {
    const par = lab.trials.find((tr) => tr.kind === 'config' && tr.rel === 'parallel');
    const same = lab.trials.find((tr) => tr.kind === 'config' && tr.rel === 'same');
    return [
      { text: M(k('dOpt.casesSwap')), why: M(k('dOpt.casesSwapWhy', { par: par ? L.lineTex({ a: par.m, b: par.p }) : '', same: same ? L.lineTex({ a: same.m, b: same.p }) : '' })) },
      { text: M(k('dOpt.casesRight')), correct: true },
      { text: M(k('dOpt.casesAlways')), why: M(k('dOpt.casesAlwaysWhy', { par: par ? L.lineTex({ a: par.m, b: par.p }) : '' })) },
    ];
  }
  const one = lab.trials.find((tr) => tr.kind === 'point' && (tr.ok1 !== tr.ok2));
  const both = lab.trials.find((tr) => tr.kind === 'point' && tr.ok1 && tr.ok2);
  const opts = [{ text: M(k('dOpt.probeRight')), correct: true }];
  if (one) opts.unshift({ text: M(k('dOpt.probeAny')), why: M(k('dOpt.probeAnyWhy', { p: L.pairTex(one.x, one.y), n: one.ok1 ? 1 : 2 })) });
  if (both && !L.same(both.x, both.y)) {
    const swapped = L.lampsAt(lab, both.y, both.x);
    const fail = swapped[0] ? 1 : 0;
    opts.push({ text: M(k('dOpt.probeSwap')), why: M(k('dOpt.probeSwapWhy', { q: L.pairTex(both.y, both.x), calc: L.substTex(lab.eqs[fail], both.y, both.x) })) });
  }
  return opts;
}

function Formal({ lab, k, tw, solution }) {
  const M = (s) => <MathText>{s}</MathText>;
  const sys = `\\begin{cases} ${L.eqTex(lab.eqs[0])} \\\\ ${L.eqTex(lab.eqs[1])} \\end{cases} \\iff \\begin{cases} ${L.lineTex(lab.lines[0])} \\\\ ${L.lineTex(lab.lines[1])} \\end{cases}`;
  return (
    <div className="space-y-2" data-lc-formal={lab.cases ? 'cases' : 'probe'}>
      <EquationDisplay tone="result" tex={sys} />
      {solution.kind === 'unique' && (
        <>
          <p className="text-sm text-emerald-900">{M(k('fSolution', { p: L.pairTex(solution.x, solution.y) }))}</p>
          <ul className="space-y-1 text-sm" dir="ltr">
            {[0, 1].map((i) => <li key={i} className="text-start">{M(`$(${i + 1})\\quad ${L.substTex(lab.eqs[i], solution.x, solution.y)}$`)}</li>)}
          </ul>
          <p className="text-sm text-slate-700">{M(tw('meaning', { x: L.numText(solution.x), y: L.numText(solution.y) }))}</p>
          <p className="text-xs text-slate-600">{M(k('fExact'))}</p>
        </>
      )}
      {lab.cases && (
        <table className="w-full border-collapse text-xs" data-lc-cases-table>
          <tbody>
            {['unique', 'parallel', 'same'].map((r) => (
              <tr key={r}>
                <th className="border border-slate-300 bg-slate-50 px-2 py-1 text-start">{k(`rel.${r}`)}</th>
                <td className="border border-slate-300 px-2 py-1">{M(k(`fCase.${r}`))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Representation({ lab, k, px, py, lamps, probing }) {
  if (!probing) {
    const n = lab.built.filter(Boolean).length;
    return <EquationDisplay tone={n ? 'ok' : 'neutral'} tex={lab.built[0] ? L.lineTex(lab.lines[0]) : L.eqTex(lab.eqs[0])} note={k('builtCount', { n })} />;
  }
  return <EquationDisplay tone={lamps[0] && lamps[1] ? 'ok' : 'neutral'} tex={`P${L.pairTex(px, py)}`} note={k('lampsNow', { n: (lamps[0] ? 1 : 0) + (lamps[1] ? 1 : 0) })} />;
}

function Lamp({ n, on, color, caption, tex, k, compact }) {
  return (
    <div className={`flex min-w-0 items-center gap-1.5 rounded-lg border-2 ${compact ? 'px-1 py-0' : 'px-2 py-1'} ${on ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`} data-lc-lamp={n} data-on={on ? 'true' : 'false'}>
      <span className={`relative inline-flex ${compact ? 'h-5 w-5' : 'h-7 w-7'} shrink-0 items-center justify-center rounded-full ${on ? 'bg-amber-300 shadow-[0_0_10px_3px_rgba(251,191,36,0.75)]' : 'bg-slate-200'}`} aria-hidden="true">
        <Lightbulb className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} ${on ? 'text-amber-800' : 'text-slate-500'}`} />
      </span>
      <span className="min-w-0 text-xs font-bold" style={{ color }}>
        ({n}) {caption}
        <span className="sr-only"> {k(on ? 'lampOn' : 'lampOff')}</span>
        {tex && <span className={`${compact ? 'inline text-[11px]' : 'block text-[12px]'} text-slate-800`}> <MathText>{`$${tex}$`}</MathText></span>}
      </span>
    </div>
  );
}

function StepPair({ s, less, more, which, tag }) {
  return (
    <span dir="ltr" className="inline-flex items-center gap-1">
      <button type="button" onClick={() => s.nudge(-1)} aria-label={less} data-lc-less={which}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"><Minus className="h-5 w-5" aria-hidden="true" /></button>
      <span className="font-mono text-sm font-extrabold text-amber-800">{tag}</span>
      <button type="button" onClick={() => s.nudge(1)} aria-label={more} data-lc-more={which}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"><Plus className="h-5 w-5" aria-hidden="true" /></button>
    </span>
  );
}

function Strip({ s, which, vertical, length, thick, pos, label, valueText, tag, color }) {
  const box = vertical ? { width: thick, height: length } : { width: length, height: thick };
  return (
    <div {...s.trackProps} className="relative shrink-0" style={{ ...s.trackProps.style, ...box }} data-lc-strip={which}>
      <div className="absolute rounded-full" style={{ left: thick / 2 - 2, top: 8, bottom: 8, width: 4, background: color, opacity: 0.35 }} />
      <div {...s.handleProps({ label, valueText })}
        className={`absolute z-10 flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 bg-white px-1 outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${s.dragging ? 'shadow-md' : ''}`}
        style={{ left: thick / 2, top: Math.max(22, Math.min(length - 22, pos)), transform: 'translate(-50%, -50%)', borderColor: color, cursor: s.dragging ? 'grabbing' : 'grab' }}
        data-lc-handle={which}>
        <span className="whitespace-nowrap font-mono text-[11px] font-extrabold" style={{ color }}>{tag}</span>
      </div>
    </div>
  );
}

/** L'étiquette (1) / (2) au bout visible de la droite, gardée dans le plan. */
function LineTag({ seg, geo, W, H, n, color }) {
  const end = n === 1 ? seg[0] : seg[1];
  const x = Math.max(4, Math.min(W - 26, geo.px(end[0]) + (n === 1 ? 6 : -26)));
  const y = Math.max(12, Math.min(H - 4, geo.py(end[1]) + (n === 1 ? 14 : -6)));
  return <text x={x} y={y} fontSize={12} fontWeight="bold" fill={color} fontFamily="ui-monospace, monospace">({n})</text>;
}

/* ── décor (sans information) ── */

function CoinJar({ drops, reduce, words }) {
  const coins = Math.min(6, drops * 2);
  return (
    <span aria-hidden="true" className="pointer-events-none absolute right-1 top-1 block h-14 w-12" data-deco="coins" title={words.jar}>
      <svg viewBox="0 0 48 56" width="100%" height="100%">
        <rect x={8} y={14} width={32} height={38} rx={7} fill="#E0F2FE" stroke="#0369A1" strokeWidth={1.5} opacity={0.9} />
        <rect x={12} y={9} width={24} height={6} rx={2} fill="#0369A1" />
        <rect x={18} y={10.5} width={12} height={2.4} rx={1} fill="#F8FAFC" />
        {Array.from({ length: coins }, (_, i) => (
          <g key={`c${i}`} className={!reduce && i >= coins - 2 ? 'lc-drop' : undefined}>
            <ellipse cx={18 + (i % 2) * 11} cy={46 - Math.floor(i / 2) * 5} rx={6} ry={2.6} fill={i % 2 ? '#CBD5E1' : '#FBBF24'} stroke={i % 2 ? '#64748B' : '#B45309'} strokeWidth={0.8} />
          </g>
        ))}
      </svg>
    </span>
  );
}

function LaserDeco({ geo, W, H, flash, reduce }) {
  void geo;
  return (
    <g data-deco="laser" pointerEvents="none">
      <circle cx={W - 14} cy={12} r={6} fill="#A78BFA" opacity={0.85} />
      <circle cx={W - 14} cy={12} r={3} fill="#F5F3FF" />
      <rect x={6} y={H - 12} width={14} height={7} rx={2} fill="#334155" />
      <rect x={W - 22} y={H - 12} width={14} height={7} rx={2} fill="#334155" />
      {flash > 0 && !reduce && <circle key={flash} cx={W - 14} cy={12} r={10} fill="none" stroke="#FDE68A" strokeWidth={2} className="lc-pulse" />}
    </g>
  );
}

const LC_CSS = '.lc-shake{animation:lc-s .35s ease-in-out 1}@keyframes lc-s{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}'
  + '.lc-drop{animation:lc-d .6s ease-in 1}@keyframes lc-d{0%{transform:translateY(-14px);opacity:.2}100%{transform:translateY(0);opacity:1}}'
  + '.lc-pulse{animation:lc-p .8s ease-out 1;transform-origin:center;transform-box:fill-box}@keyframes lc-p{0%{opacity:1;transform:scale(.6)}100%{opacity:0;transform:scale(1.8)}}'
  + '@media (prefers-reduced-motion: reduce){.lc-shake,.lc-drop,.lc-pulse{animation:none}}';

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque étape ; la dernière étape (P seul, ou les trois cas) finit par LA RÈGLE. */
export function chainOf(lab, step) {
  const steps = L.stepsOf(lab);
  const base = {
    build: ['atZero', 'slope'],
    probe: [lab.seen.one ? 'oneLamp' : null, 'pair', checkOf(lab) ? 'check' : null].filter(Boolean),
    cases: ['para', 'same', 'sameSlope'],
  }[step];
  return step === steps[steps.length - 1] ? [...base, 'rule'] : base;
}
/** Le produit à calculer en substituant la ثنائية solution : l'équation au plus grand |a| dont le produit a·x est ≥ 0 (une réponse saisie ne peut être négative). */
function checkOf(lab) {
  const tr = [...lab.trials].reverse().find((t) => t.kind === 'point' && t.ok1 && t.ok2);
  if (!tr) return null;
  const c = [0, 1].map((i) => ({ i, prod: Lin.mul(lab.eqs[i].a, tr.x) })).filter((x) => !Lin.isZero(x.prod) && Lin.cmp(x.prod, 0) > 0);
  if (!c.length) return null;
  c.sort((p, q) => Lin.cmp(q.prod, p.prod));
  return { tr, ...c[0] };
}
export const CHAINS = Object.freeze({ build: ['atZero', 'slope'], probe: ['oneLamp', 'pair', 'check'], cases: ['para', 'same', 'sameSlope'] });

const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const T = (x) => <MathText>{`$${x}$`}</MathText>;
const D = (x) => `$${x}$`;
const neg = (p) => Lin.neg(L.fracOf(p));
/** Trois valeurs distinctes : la bonne, son opposée, un autre nombre de la droite (jamais deux fois la même). */
function threeValues(good, opposite, other) {
  const out = [good];
  for (const v of [opposite, other]) if (!out.some((u) => L.same(u, v))) out.push(v);
  for (let bump = 1; out.length < 3; bump += 1) { const c = Lin.add(L.fracOf(good), bump); if (!out.some((u) => L.same(u, c))) out.push(c); }
  return out;
}
const shuffled = (list, seed) => { const r = seed % list.length; return [...list.slice(r), ...list.slice(0, r)]; };
const seedOf = (lab) => Math.abs(Number(L.fracOf(lab.lines[0].b).n) + Number(L.fracOf(lab.lines[1].a).n)) + lab.cands[0].length;

export const QUESTIONS = {
  atZero: (lab, k) => {
    const g = lab.lines[0];
    const [p, q, r] = threeValues(g.b, neg(g.b), g.a);
    const line = D(L.lineTex(g));
    const o = { i: 1, line };
    const opts = [
      { text: T(L.numTex(p)), correct: true },
      { text: T(L.numTex(q)), why: Cq(k, 'atZero.whyOpposite', { ...o, p: D(L.numTex(g.b)) }) },
      { text: T(L.numTex(r)), why: Cq(k, 'atZero.whySlope', { ...o, a: D(L.numTex(g.a)) }) },
    ];
    return {
      id: 'atZero', kind: 'choice', cols: 3, prompt: Cq(k, 'atZero.prompt', o), options: shuffled(opts, seedOf(lab)),
      hints: [Cq(k, 'atZero.hint1', o), Cq(k, 'atZero.hint2')],
      explain: Cq(k, 'atZero.explain', { ...o, p: D(L.numTex(g.b)) }),
    };
  },
  slope: (lab, k) => {
    const g = lab.lines[1];
    const [p, q, r] = threeValues(g.a, neg(g.a), g.b);
    const line = D(L.lineTex(g));
    const o = { i: 2, line };
    const opts = [
      { text: T(L.numTex(p)), correct: true },
      { text: T(L.numTex(q)), why: Cq(k, 'slope.whyOpposite', { ...o, a: D(L.numTex(g.a)) }) },
      { text: T(L.numTex(r)), why: Cq(k, 'slope.whyConstant', { ...o, p: D(L.numTex(g.b)) }) },
    ];
    return {
      id: 'slope', kind: 'choice', cols: 3, prompt: Cq(k, 'slope.prompt', o), options: shuffled(opts, seedOf(lab) + 1),
      hints: [Cq(k, 'slope.hint1', o), Cq(k, 'slope.hint2')],
      explain: Cq(k, 'slope.explain', { ...o, a: D(L.numTex(g.a)) }),
    };
  },
  oneLamp: (lab, k) => {
    const tr = [...lab.trials].reverse().find((t) => t.kind === 'point' && t.ok1 !== t.ok2);
    const lit = tr.ok1 ? 1 : 2; const dark = lit === 1 ? 2 : 1;
    const o = { pair: D(L.pairTex(tr.x, tr.y)), lit, dark };
    const opts = [
      { text: Cq(k, 'oneLamp.right', o), correct: true },
      { text: Cq(k, 'oneLamp.solution'), why: Cq(k, 'oneLamp.whySolution', { ...o, calc: D(L.substTex(lab.eqs[dark - 1], tr.x, tr.y)) }) },
      { text: Cq(k, 'oneLamp.none'), why: Cq(k, 'oneLamp.whyNone', { ...o, calc: D(L.substTex(lab.eqs[lit - 1], tr.x, tr.y)) }) },
    ];
    return {
      id: 'oneLamp', kind: 'choice', cols: 1, prompt: Cq(k, 'oneLamp.prompt', o), options: shuffled(opts, seedOf(lab) + 2),
      hints: [Cq(k, 'oneLamp.hint1', o), Cq(k, 'oneLamp.hint2', o)],
      explain: Cq(k, 'oneLamp.explain', o),
    };
  },
  pair: (lab, k) => {
    const tr = [...lab.trials].reverse().find((t) => t.kind === 'point' && t.ok1 && t.ok2);
    const o = { pair: D(L.pairTex(tr.x, tr.y)) };
    const opts = [
      { text: Cq(k, 'pair.right'), correct: true },
      { text: Cq(k, 'pair.one'), why: Cq(k, 'pair.whyOne', { ...o, c1: D(L.substTex(lab.eqs[0], tr.x, tr.y)), c2: D(L.substTex(lab.eqs[1], tr.x, tr.y)) }) },
      { text: Cq(k, 'pair.none'), why: Cq(k, 'pair.whyNone', o) },
    ];
    return {
      id: 'pair', kind: 'choice', cols: 1, prompt: Cq(k, 'pair.prompt', o), options: shuffled(opts, seedOf(lab) + 3),
      hints: [Cq(k, 'pair.hint1', o), Cq(k, 'pair.hint2')],
      explain: Cq(k, 'pair.explain', o),
    };
  },
  check: (lab, k) => {
    const { tr, i, prod } = checkOf(lab);
    const e = lab.eqs[i];
    const o = { pair: D(L.pairTex(tr.x, tr.y)), n: i + 1, eq: D(L.eqTex(e)), prod: D(`${L.numTex(e.a)} \\times ${L.numTex(tr.x)}`), calc: D(L.substTex(e, tr.x, tr.y)) };
    return {
      id: 'check', kind: 'number', expected: Lin.fracText(prod), answer: T(L.numTex(prod)),
      prompt: Cq(k, 'check.prompt', o), hints: [Cq(k, 'check.hint1', o), Cq(k, 'check.hint2')],
      explain: Cq(k, 'check.explain', o),
    };
  },
  para: (lab, k) => {
    const tr = [...lab.trials].reverse().find((t) => t.kind === 'config' && t.rel === 'parallel');
    const o = { l1: D(L.lineTex(lab.lines[0])), lp: D(L.lineTex({ a: tr.m, b: tr.p })) };
    const opts = [
      { text: Cq(k, 'para.none'), correct: true },
      { text: Cq(k, 'para.one'), why: Cq(k, 'para.whyOne', o) },
      { text: Cq(k, 'para.many'), why: Cq(k, 'para.whyMany', o) },
    ];
    return {
      id: 'para', kind: 'choice', cols: 1, prompt: Cq(k, 'para.prompt', o), options: shuffled(opts, seedOf(lab)),
      hints: [Cq(k, 'para.hint1', o), Cq(k, 'para.hint2')], explain: Cq(k, 'para.explain', o),
    };
  },
  same: (lab, k) => {
    const tr = [...lab.trials].reverse().find((t) => t.kind === 'config' && t.rel === 'same');
    const o = { l1: D(L.lineTex(lab.lines[0])), lp: D(L.lineTex({ a: tr.m, b: tr.p })) };
    const opts = [
      { text: Cq(k, 'same.many'), correct: true },
      { text: Cq(k, 'same.none'), why: Cq(k, 'same.whyNone', o) },
      { text: Cq(k, 'same.one'), why: Cq(k, 'same.whyOne', o) },
    ];
    return {
      id: 'same', kind: 'choice', cols: 1, prompt: Cq(k, 'same.prompt', o), options: shuffled(opts, seedOf(lab) + 1),
      hints: [Cq(k, 'same.hint1', o), Cq(k, 'same.hint2')], explain: Cq(k, 'same.explain', o),
    };
  },
  sameSlope: (lab, k) => {
    const tr = [...lab.trials].reverse().find((t) => t.kind === 'config' && t.rel === 'parallel');
    const o = { l1: D(L.lineTex(lab.lines[0])), lp: D(L.lineTex({ a: tr.m, b: tr.p })), a: D(L.numTex(lab.lines[0].a)) };
    const opts = [
      { text: Cq(k, 'sameSlope.right'), correct: true },
      { text: Cq(k, 'sameSlope.constant'), why: Cq(k, 'sameSlope.whyConstant', o) },
      { text: Cq(k, 'sameSlope.nothing'), why: Cq(k, 'sameSlope.whyNothing', o) },
    ];
    return {
      id: 'sameSlope', kind: 'choice', cols: 1, prompt: Cq(k, 'sameSlope.prompt', o), options: shuffled(opts, seedOf(lab) + 2),
      hints: [Cq(k, 'sameSlope.hint1', o), Cq(k, 'sameSlope.hint2')], explain: Cq(k, 'sameSlope.explain', o),
    };
  },
  rule: (lab, k) => {
    const opts = discoveryFor(lab, k);
    const ci = opts.findIndex((o) => o.correct);
    return {
      id: 'rule', kind: 'choice', cols: 1,
      prompt: <MathText>{k(lab.cases ? 'dPrompt.cases' : 'dPrompt.probe')}</MathText>,
      options: ci === opts.length - 1 ? [opts[ci], ...opts.slice(0, ci)] : opts,
      hints: [Cq(k, lab.cases ? 'rule.hint1Cases' : 'rule.hint1Probe'), Cq(k, lab.cases ? 'rule.hint2Cases' : 'rule.hint2Probe')],
      explain: Cq(k, lab.cases ? 'rule.explainCases' : 'rule.explainProbe'),
    };
  },
};
