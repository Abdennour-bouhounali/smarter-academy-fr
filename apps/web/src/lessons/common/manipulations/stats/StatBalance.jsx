import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus, ArrowLeft } from 'lucide-react';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import MathText from '../../components/MathText';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import * as L from '../logic/statBalance';

/**
 * stat-balance — LA BALANCE DES VALEURS (unité 8 « الإحصاء », leçon 2 « مدى ووسيط ومتوسط سلسلة إحصائية » ;
 * réutilisée par la synthèse « أدمج تعلّماتي » en `mode="hidden"` par un contrat de props FIXE, brief §6).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève GLISSE l'appui sous une poutre graduée qui porte les valeurs (jetons dessinés : cartes de score,
 *    relevés du thermomètre, médailles) ; il GLISSE un rideau entre les jetons rangés ; il PINCE un كلّاب sur
 *    les deux jetons extrêmes ; il TIRE le plus grand jeton loin ; en hidden il POSE des jetons cachés.
 * B. المتوسط est le point d'équilibre des valeurs (Σ (x − m) = 0, m = Σ x / N) ; الوسيط coupe la série RANGÉE
 *    en deux effectifs égaux ; المدى = أكبر قيمة − أصغر قيمة ; la moyenne sent les valeurs extrêmes, la médiane non.
 * C. Pendant le geste : la poutre penche du côté le plus lourd (et les deux sommes de distances s'écrivent) ; les
 *    jetons changent de couleur de part et d'autre du rideau (et les deux effectifs s'écrivent) ; les jetons
 *    dehors du كلّاب rougissent ; la moyenne court derrière le jeton tiré, le rideau ne bouge pas.
 * D. « المدى = 48 − 34 = 14 », « m = 393/10 = 39,3 » (mêmes sommes de distances des deux côtés), « Med = 38,5 »
 *    (rangs 5 et 6), puis « m : 4 → 6,4 → 7,2 ; Med : 3 → 3 → 3 ».
 * E. Avant la règle : la poutre n'est de niveau qu'en UN point, qui n'est ni le milieu de l'étendue ni le point
 *    qui partage les effectifs ; le rideau ne se verrouille qu'au rang médian ; la moyenne court, la médiane reste.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        les trois indicateurs d'une série : المدى (dispersion), المتوسط (équilibre), الوسيط (rang)
 *   OBJECT         une poutre graduée chargée de jetons (une valeur = un objet dessiné, empilé sur sa graduation)
 *   VARIABLE       la position p de l'appui (graduation 1/D qui contient la moyenne) ; la position c du rideau dans
 *                  l'espace des rangs (0…2N) ; les deux mâchoires (colonnes) ; la valeur du jeton tiré ; en hidden
 *                  la valeur de chaque jeton caché
 *   INVARIANT      Σ (x − m) = 0 : à l'équilibre, la somme des distances à gauche = la somme à droite ; N jetons
 *   TRANSFORMATION la poutre tourne autour de l'appui ; les jetons se colorent selon leur côté du rideau
 *   CONSTRAINT     de niveau ⇔ p = statistics.mean (EXACT) ; verrou ⇔ autant de jetons de chaque côté ; كلّاب pris
 *                  ⇔ aucun jeton dehors ; un jeton caché reste entre ses voisins du tableau
 *   RESISTANCE     la poutre penche TOUJOURS hors de la moyenne (angle minimal visible, jamais « presque ») ; le
 *                  rideau refuse un partage inégal (« 4 مقابل 6 ») ; les jetons dehors du كلّاب restent rouges ;
 *                  un jeton caché tiré hors de ses bornes est refusé et revient (« محصورة بين 2 و 4 »)
 *   EVIDENCE       les deux sommes de distances égales ; les deux effectifs égaux ; المدى écrit ; m et Med du contraste
 *   CONTRAST       le point d'équilibre ≠ le milieu de l'étendue ≠ le point des effectifs égaux (refutés par les
 *                  nombres de la poutre) ; N impair (rideau SUR un jeton) / N pair (entre deux) aux deux niveaux ;
 *                  le jeton tiré à deux positions : m change, Med non
 *   PREDICTION     la poutre penche avant qu'on la touche : de quel côté faut-il pousser l'appui ?
 *   DISCOVERY      « المتوسط = مجموع القيم ÷ عددها » (moyenne), « يتغيّر المتوسط ويبقى الوسيط » (contraste),
 *                  « الوسيط ثم المتوسط » (hidden) — distracteurs réfutés par les nombres de l'élève
 *   FORMALIZATION  m = Σ x / N et Σ (x − m) = 0 ; Med par les rangs (N + 1)/2 ou N/2 et N/2 + 1 ; المدى = max − min
 *   TRANSFER       نشاط 4 et معارف 3–4 (le rideau), طرائق ص 97 (3 et 43 ajoutés : 6 → 8, Med 5), la synthèse
 *                  (médailles : x = 3 par la médiane, y = 28 par la moyenne)
 *
 * Manuel (§6bis) : chaque position validée est un essai — pas d'auto-complétion.
 *
 * GESTES : la scène entière est la piste (pointeur : le doigt saisit la poignée de l'étape — l'appui, le rideau,
 * la mâchoire la plus proche, le jeton tiré, le jeton caché le plus proche — et la valeur est lue SOUS le doigt ;
 * dans une pile de jetons égaux, la HAUTEUR du doigt choisit la coupe du rideau) ; relâcher = l'essai. Chaque
 * poignée est un `role="slider"` (useStretchInteraction : flèches, Page, Début/Fin, pause avant validation) et a
 * ses boutons −/+.
 *
 * DÉCOR (exigence du propriétaire) — sans information, sans état du lab : la manette qui vibre (esport), le soleil
 * et le mercure qui miroitent (heatwave), la médaille qui brille (medals). `aria-hidden`, `tabIndex={-1}`,
 * `[data-deco]`, immobiles sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (MANIPULATION_CONTRACT §8bis) : la hauteur de la scène vient de l'écran de leçon
 * (`useLessonViewport`) moins les commandes mesurées ; les jetons sont CARRÉS et rétrécissent (logic ›
 * beamLayout : la colonne la plus haute × le jeton tient dans la hauteur, deux colonnes voisines ne se chevauchent
 * pas) ; large (≥ 620 px) : poutre et commandes côte à côte ; sinon les commandes juste dessous. Les essais sont
 * dans un `LabFold` sous la manipulation.
 *
 * QUESTIONS PENDANT LE LABO (2026-10-28, lot 5 ; `primitives/LabCheckpoint`) : `checkpoints` (défaut true). UNE suite de questions par ÉTAPE du labo (range · mean ·
 * median · contrast · hidden), posée PAR-DESSUS quand l'étape est faite et qui retient « التالي » (`chainFor`) : range · l'étendue d'une valeur plus grande, puis
 * la règle ; mean · la somme, ÷ N, la règle ; median · la rang(s) puis la valeur ; contrast · de combien la moyenne monte, de combien la médiane monte, puis la
 * règle ; hidden · la somme visée, puis la règle. La dernière étape finit TOUJOURS par la règle (`rule`), qui remplace la découverte et formalise. Un `LabStepper`
 * remplace les onglets d'étape. Les événements `{ tk: 'checkpoint' | 'checkpoint-done', … }` partent vers `onCheckpoint` (jamais `onTrial`). OBLIGATOIRES pour tout
 * élève ; l'ENSEIGNANT les coupe pour SON compte (interrupteur en en-tête).
 *
 * PROPS (contrat de l'unité, brief §6 — la synthèse ne passe QUE celles-ci) :
 *   series        « 40|35|34 » ou « 1:11|2:3|?:2|… » (virgule décimale ; « ? » = valeur cachée, hidden seulement)
 *   mode          « range|mean|median » (toute sous-chaîne ordonnée ; la médiane ajoute l'étape contraste) | « hidden »
 *   hidden        « 2:2-4|12:26-32 » — index (dans l'ordre ÉCRIT de series) : bornes incluses ; au plus trois
 *   targetMean targetMedian   cibles de hidden (chaînes)
 *   unit          « °C » | « DA » | « kg » | « cm » (îlot KaTeX) ou un mot arabe (« ميدالية », texte DOM)
 *   axis          « min:max:pas » (défaut : graduation ronde autour de la série)
 *   theme         'esport' | 'heatwave' | 'medals' — mots dans lesson.json › manipulation.statBalance.themes
 *   title lead mission level levels  comme les autres types ; onTrial(t) à chaque essai validé,
 *   onFinished({ stages, range, mean, median }) à la règle formelle — tous deux par `state.report`.
 *
 * CONTRAT DOM : [data-stat-balance][data-mode][data-theme][data-stage][data-n][data-layout],
 * [data-sb-glance], [data-sb-scene][data-w][data-h][data-token], [data-sb-beam][data-tilt],
 * [data-sb-token=<id>][data-v][data-side], [data-sb-fulcrum][data-p], [data-sb-curtain][data-c][data-locked],
 * [data-sb-jaw=lo|hi], [data-sb-handle=fulcrum|curtain|lo|hi|moved|hole-<h>], [data-sb-less=…], [data-sb-more=…],
 * [data-sb-stage-tab=<stage>][data-done], [data-sb-next], [data-sb-reading=<stage>], [data-sb-verdict=<kind>],
 * [data-sb-target=mean|median][data-ok], [data-sb-trial], [data-sb-formal], [data-deco].
 */
const GAP = 12;
const TILT_ROOM = 14;
const RAIL_H = 16;
const RULER_H = 22;
const JAWS_H = 34;
const SIDE = { left: '#2563EB', right: '#EA580C', on: '#059669', out: '#E11D48' };
const UNIT_TEX = { '°C': '\\,^{\\circ}\\mathrm{C}', DA: '\\,\\mathrm{DA}', kg: '\\,\\mathrm{kg}', cm: '\\,\\mathrm{cm}', m: '\\,\\mathrm{m}' };

export default function StatBalance({
  series: series0, mode: mode0 = 'mean|median', hidden, targetMean, targetMedian, unit, axis, theme: theme0 = 'esport',
  title, lead, mission, level, levels: withLevels = true, initialMode = 'student', allowModeSwitch = false,
  onTrial, onFinished, checkpoints: cpOn = true, onCheckpoint,
}) {
  const { t, i18n } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.statBalance.${key}`, o), [t]);
  const reduce = useReducedMotion();
  const state = useManipulation({
    type: 'stat-balance',
    initialNumbers: { series: series0, mode: mode0 },
    initialMode, initialLevel: level, withLevels, hintCount: 3,
  });
  const { series, mode } = state.numbers;
  // Sur l'autre niveau (préréglage de levels.js), seuls la série et le mode valent ; le monde suit le niveau.
  const authored = state.isAuthoredLevel;
  const theme = authored ? (L.THEMES.includes(theme0) ? theme0 : 'esport') : (state.level === 'advanced' ? 'heatwave' : 'esport');
  const tw = useCallback((key, o) => t(`manipulation.statBalance.themes.${theme}.${key}`, o), [t, theme]);
  const make = () => L.init({ series, mode, ...(authored ? { hidden, targetMean, targetMedian, axis } : {}) });
  const [lab, setLab] = useState(make);
  const sceneKey = `${series}:${mode}:${state.epoch}:${authored}`;
  const [scene, setScene] = useState(sceneKey);
  const [live, setLive] = useState({});
  const [drag, setDrag] = useState(null);
  const [shake, setShake] = useState(0);
  const [inits, setInits] = useState(0);
  const [doneIds, setDoneIds] = useState(() => new Set());
  if (scene !== sceneKey) {
    setScene(sceneKey); setLab(make()); setLive({}); setDrag(null); setInits((n) => n + 1); setDoneIds(new Set());
  }
  const stage = L.stageOf(lab);
  // les questions pendant le labo : obligatoires pour tout élève, l'enseignant seul les coupe pour SON compte
  const cpSettings = useLabCheckpointSettings('stat-balance');
  const cpActive = cpOn && cpSettings.enabled;
  const lastStage = lab.stage === lab.stages.length - 1;
  const cp = useLabCheckpoint({
    id: cpActive ? stage : null,
    questions: cpActive && lab.done[stage] ? chainFor(stage, lastStage).map((q) => QUESTIONS[q](lab, k)) : null,
    reached: !!lab.done[stage],
    resetKey: inits,
    // « أعِد التجربة » : l'étape recommence (l'appui, le rideau, les mâchoires, le jeton tiré ou les jetons cachés reviennent au départ)
    onRetry: () => { setLive({}); setLab((x) => retryStage(x, stage, make)); },
    onEvent: (ev) => state.report(onCheckpoint, ev),
    onDone: (id) => {
      setDoneIds((d) => new Set(d).add(id));
      if (id === lab.stages[lab.stages.length - 1]) { state.discover(); state.formalize(); }
    },
  });
  const ready = L.discoveryReady(lab) && !cpActive;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (state.isFormal) state.report(onFinished, { stages: lab.stages, range: L.text(L.range(baseOf(lab))), mean: L.text(L.mean(lab)), median: L.text(L.median(lab)) });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  // les sons : un cran = un pas ; l'étape juste (niveau, verrou, kallab fermé, cible trouvée) = flag ; refusé / inégal = over
  useEffect(() => {
    const l = lab.last;
    if (!l) return;
    if (['balanced', 'locked', 'caught', 'found'].includes(l.kind)) playSfx('flag');
    else if (['unequal', 'refused'].includes(l.kind)) playSfx('over');
    else playSfx('tooth');
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials === 0) return;
    state.report(onTrial, trialReport(lab.trials[nTrials - 1]));
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : la largeur de la scène et la HAUTEUR de l'écran de leçon ── */
  const boxRef = useRef(null);
  const ctrlRef = useRef(null);
  const [width, setWidth] = useState(320);
  const [ctrlH, setCtrlH] = useState(230);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(140, Math.floor(el.clientWidth)));
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
  const sceneW = wide ? Math.floor((width - GAP) * 0.6) : width;

  /* ── la série vue (avec le geste en cours) ── */
  const view = useMemo(() => {
    if (stage === 'contrast') return L.previewMoved(lab, live.moved ?? lab.moved ?? 0);
    if (stage === 'hidden' && live.hole) return L.previewHole(lab, live.hole.h, L.holeAt(lab, live.hole.h, live.hole.k));
    return lab;
  }, [lab, live, stage]);
  const cols = useMemo(() => L.columns(view), [view]);
  const showCurtain = ['median', 'contrast', 'hidden'].includes(stage);
  const showJaws = stage === 'range';
  const reserved = 2 * TILT_ROOM + (showCurtain ? RAIL_H : 4) + 6 + 18 + RULER_H + (showJaws ? JAWS_H : 0) + 6;
  const availH = Math.max(reserved + 30, (wide ? budget : budget - ctrlH - GAP) - 4);
  const g0 = L.beamLayout(view, { width: sceneW, height: availH, reserved, maxToken: 34 });
  const tokenS = g0.token;
  const H = Math.round(reserved + g0.tall * tokenS);
  const g = g0;
  const ax = L.axisOf(view);
  const yRail = 2;
  const yTokTop = (showCurtain ? RAIL_H : 4) + TILT_ROOM;
  const beamY = yTokTop + g.tall * tokenS;
  const yFul = beamY + 6;
  const yRuler = yFul + 18;
  const yJaws = yRuler + RULER_H;

  /* ── l'appui (variable de « mean ») et ce qu'on dessine ── */
  const fJ = live.fulcrum ?? lab.fulcrumJ;
  const fixedP = (() => {
    if (stage === 'hidden') return lab.targetMean;
    if (stage === 'contrast') return L.mean(view);
    if (stage === 'mean' || (lab.stages.includes('mean') && !lab.done.mean)) return fJ != null ? L.fulcrumAt(lab, fJ) : L.mean(view);
    return L.mean(view);
  })();
  const pShown = fixedP;
  const mo = L.moments(view, pShown);
  const maxDist = Math.max(g.px(ax.max) - g.px(pShown), g.px(pShown) - g.px(ax.min), 1);
  const maxDeg = Math.min(9, (Math.asin(Math.min(1, TILT_ROOM / maxDist)) * 180) / Math.PI);
  const angle = L.tiltAngle(view, pShown, maxDeg, maxDeg * 0.35);

  /* ── le rideau ── */
  const cShown = stage === 'hidden' ? view.N : (live.curtain ?? lab.curtain ?? 0);
  const cSides = showCurtain ? L.sides(view, cShown) : null;
  const cLocked = showCurtain ? L.curtainLocked(view, cShown) : false;
  const cValue = showCurtain ? L.curtainValue(view, cShown) : null;

  /* ── le كلّاب ── */
  const jaws = live.jaws ?? lab.jaws;
  const out = showJaws && jaws ? L.outside(view, jaws) : null;

  /* ── gestes : commits ── */
  const commitF = useCallback((j) => { setLive((l) => ({ ...l, fulcrum: undefined })); setLab((s) => L.setFulcrum(s, j)); }, []);
  const commitC = useCallback((c) => { setLive((l) => ({ ...l, curtain: undefined })); setLab((s) => L.setCurtain(s, c)); }, []);
  const commitJaw = useCallback((which, idx) => { setLive((l) => ({ ...l, jaws: undefined })); setLab((s) => L.setJaw(s, which, idx)); }, []);
  const commitMoved = useCallback((kk) => { setLive((l) => ({ ...l, moved: undefined })); setLab((s) => L.placeMoved(s, kk)); }, []);
  const commitHole = useCallback((h, v) => {
    setLive((l) => ({ ...l, hole: undefined }));
    setLab((s) => {
      const next = L.placeHole(s, h, v);
      if (next.last?.kind === 'refused') setShake((n) => n + 1);
      return next;
    });
  }, []);

  /* ── poignées clavier / boutons (useStretchInteraction, direction LTR : la poutre est un axe) ── */
  const none = useCallback(() => 0, []);
  const fR = lab.stages.includes('mean') ? L.fulcrumRange(lab) : { min: 0, max: 0 };
  const sF = useStretchInteraction({ value: fJ, range: fR, direction: 'ltr', toValue: none, onChange: (j) => setLive((l) => ({ ...l, fulcrum: j })), onCommit: commitF });
  const cR = L.curtainRange(lab);
  const sC = useStretchInteraction({ value: cShown, range: cR, direction: 'ltr', toValue: none, onChange: (c) => setLive((l) => ({ ...l, curtain: c })), onCommit: commitC });
  const K = cols.length;
  const jawRange = { min: 0, max: Math.max(0, K - 1) };
  const sLo = useStretchInteraction({ value: jaws?.lo ?? 0, range: jawRange, direction: 'ltr', toValue: none, onChange: (i) => setLive((l) => ({ ...l, jaws: { ...(l.jaws ?? lab.jaws), lo: Math.min(i, (l.jaws ?? lab.jaws).hi) } })), onCommit: (i) => commitJaw('lo', i) });
  const sHi = useStretchInteraction({ value: jaws?.hi ?? 0, range: jawRange, direction: 'ltr', toValue: none, onChange: (i) => setLive((l) => ({ ...l, jaws: { ...(l.jaws ?? lab.jaws), hi: Math.max(i, (l.jaws ?? lab.jaws).lo) } })), onCommit: (i) => commitJaw('hi', i) });
  const mR = lab.contrastAxis ? L.moveRange(lab) : { min: 0, max: 0 };
  const mK = live.moved ?? lab.moved ?? 0;
  const sM = useStretchInteraction({ value: mK, range: mR, direction: 'ltr', toValue: none, onChange: (kk) => setLive((l) => ({ ...l, moved: kk })), onCommit: commitMoved });
  const holeK = (h) => (live.hole?.h === h ? live.hole.k : L.holeIndex(lab, h, L.holeValue(lab, h)));
  const hR = (h) => (lab.holes[h] ? L.holeRange(lab, h) : { min: 0, max: 0 });
  const sH0 = useStretchInteraction({ value: lab.holes[0] ? holeK(0) : 0, range: hR(0), direction: 'ltr', toValue: none, onChange: (kk) => setLive((l) => ({ ...l, hole: { h: 0, k: kk } })), onCommit: (kk) => commitHole(0, L.holeAt(lab, 0, kk)) });
  const sH1 = useStretchInteraction({ value: lab.holes[1] ? holeK(1) : 0, range: hR(1), direction: 'ltr', toValue: none, onChange: (kk) => setLive((l) => ({ ...l, hole: { h: 1, k: kk } })), onCommit: (kk) => commitHole(1, L.holeAt(lab, 1, kk)) });
  const sH2 = useStretchInteraction({ value: lab.holes[2] ? holeK(2) : 0, range: hR(2), direction: 'ltr', toValue: none, onChange: (kk) => setLive((l) => ({ ...l, hole: { h: 2, k: kk } })), onCommit: (kk) => commitHole(2, L.holeAt(lab, 2, kk)) });
  const sHoles = [sH0, sH1, sH2].slice(0, lab.holes.length);

  /* « جرّب كل الإمكانيات » : l'appui (mean), le rideau (median), le jeton tiré (contrast) — toutes leurs positions. */
  const labRef = useRef(lab);
  labRef.current = lab;
  const sweepable = L.SWEEPABLE.includes(stage);
  const autoComplete = sweepable ? {
    label: t('manipulation.autoComplete.tryAll'),
    ready: true,
    remaining: L.untriedSweep(lab).length,
    intervalMs: 480,
    maxTicks: 80,
    step: () => {
      const v = L.untriedSweep(labRef.current)[0];
      if (v === undefined) return;
      labRef.current = L.applySweep(labRef.current, v);
      setLive({});
      setLab((x) => L.applySweep(x, v));
    },
    finish: () => {
      const todo = L.untriedSweep(labRef.current);
      if (todo.length === 0) return;
      let acc = labRef.current;
      todo.forEach((v, i) => {
        acc = L.applySweep(acc, v);
        // les essais intermédiaires sont rapportés ici ; le dernier l'est par l'effet sur `nTrials`
        if (i < todo.length - 1) state.report(onTrial, trialReport(acc.trials[acc.trials.length - 1]));
      });
      labRef.current = acc;
      setLive({});
      setLab((x) => todo.reduce((a2, v) => L.applySweep(a2, v), x));
    },
  } : undefined;

  /* ── le pointeur : la scène entière est la piste de l'étape ── */
  const sceneRef = useRef(null);
  const liveRef = useRef(live);
  liveRef.current = live;
  const local = (e) => {
    const r = sceneRef.current.getBoundingClientRect();
    return { X: e.clientX - r.left, Y: e.clientY - r.top };
  };
  const clampI = (i, r) => Math.max(r.min, Math.min(r.max, i));
  const holeTokenX = (h) => g.px(L.holeValue(view, h));
  const pointerTo = (target, { X, Y }) => {
    const v = g.fromPx(X);
    if (target === 'fulcrum') return setLive((l) => ({ ...l, fulcrum: clampI(Math.round((v - L.toNum(lab.baseAxis.min)) * lab.D), fR) }));
    if (target === 'curtain') return setLive((l) => ({ ...l, curtain: L.curtainFrom(view, v, (beamY - Y) / tokenS) }));
    if (target === 'lo' || target === 'hi') {
      const idx = L.columnNear(view, v);
      return setLive((l) => {
        const j = { ...(l.jaws ?? lab.jaws) };
        if (target === 'lo') j.lo = Math.min(idx, j.hi); else j.hi = Math.max(idx, j.lo);
        return { ...l, jaws: j };
      });
    }
    if (target === 'moved') return setLive((l) => ({ ...l, moved: clampI(Math.round((v - L.toNum(lab.origMax)) / L.toNum(lab.vstep)), mR) }));
    if (target.startsWith('hole-')) {
      const h = Number(target.slice(5));
      const raw = Math.round((v - L.toNum(lab.holes[h].lo)) / L.toNum(lab.vstep));
      return setLive((l) => ({ ...l, hole: { h, k: raw } }));
    }
    return null;
  };
  const onDown = (e) => {
    if (e.button > 0 || !sceneRef.current) return;
    if (e.target.closest?.('[data-deco]')) return;
    const p = local(e);
    let target = null;
    if (stage === 'mean') target = 'fulcrum';
    else if (stage === 'median') target = 'curtain';
    else if (stage === 'contrast') target = 'moved';
    else if (stage === 'range' && jaws) {
      const xl = g.px(cols[jaws.lo].v);
      const xh = g.px(cols[jaws.hi].v);
      target = Math.abs(p.X - xl) <= Math.abs(p.X - xh) && !(p.X > xh) ? 'lo' : 'hi';
      if (jaws.lo === jaws.hi) target = p.X < xl ? 'lo' : 'hi';
    } else if (stage === 'hidden') {
      let best = 0;
      lab.holes.forEach((_, h) => { if (Math.abs(p.X - holeTokenX(h)) < Math.abs(p.X - holeTokenX(best))) best = h; });
      target = `hole-${best}`;
    }
    if (!target) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(target);
    pointerTo(target, p);
  };
  const onMove = (e) => { if (drag) pointerTo(drag, local(e)); };
  const onUp = (e) => {
    if (!drag) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    const target = drag;
    setDrag(null);
    const l = liveRef.current;
    if (target === 'fulcrum' && l.fulcrum != null) commitF(l.fulcrum);
    else if (target === 'curtain' && l.curtain != null) commitC(l.curtain);
    else if ((target === 'lo' || target === 'hi') && l.jaws) commitJaw(target, l.jaws[target]);
    else if (target === 'moved' && l.moved != null) commitMoved(l.moved);
    else if (target.startsWith('hole-') && l.hole) commitHole(l.hole.h, L.holeAt(lab, l.hole.h, l.hole.k));
  };
  /** Un pas −/+ d'une valeur cachée : au bord, la main essaie de sortir du tableau — refus expliqué. */
  const nudgeHole = (h, d) => {
    const cur = holeK(h);
    const r = hR(h);
    if (cur + d < r.min || cur + d > r.max) { commitHole(h, L.holeAt(lab, h, cur + d)); return; }
    sHoles[h].nudge(d);
  };

  /* ── les mots ── */
  const unitWord = unit ?? tw('unit');
  const uTex = UNIT_TEX[unitWord] ?? null;
  const val = (p) => (uTex ? `$${L.tex(p)}${uTex}$` : `$${L.tex(p)}$ ${unitWord}`);
  const valA = (p) => (uTex ? `$${L.texApprox(p)}${uTex}$` : `$${L.texApprox(p)}$ ${unitWord}`);
  const T = (s) => <MathText>{s}</MathText>;
  const mStr = (() => {
    if (stage === 'hidden') return mission ?? k('mission.hidden', { med: L.tex(lab.targetMedian), mean: L.tex(lab.targetMean), tokens: tw('tokens') });
    return k(`mission.${stage}`, { tokens: tw('tokens') });
  })();
  const missionText = stage === 'hidden' && mission ? mission : <MathText>{mStr}</MathText>;
  const hintKeys = [0, 1, 2].map((i) => k(`hints.${stage}.${i}`, { tokens: tw('tokens') }));
  const verdict = verdictOf({ lab, k, T, val, valA, tw });

  /* ── la découverte : distracteurs réfutés par les nombres de la poutre ── */
  const discoveryOptions = useMemo(() => discoveryFor(lab, k, val), [lab, k]); // eslint-disable-line react-hooks/exhaustive-deps
  const formal = <Formal lab={lab} k={k} val={val} valA={valA} />;
  const representation = <Representation lab={lab} k={k} valA={valA} />;

  const layout = wide ? 'side' : 'stack';
  const W = Math.round(sceneW);
  const sideOf = (rank) => {
    if (!showCurtain) return null;
    return L.sideOfRank(view, cShown, rank);
  };
  const outside = (v) => !!(out && (L.toNum(v) < L.toNum(out.lo) || L.toNum(v) > L.toNum(out.hi)));
  const movedId = stage === 'contrast' ? L.movedTokenId(lab) : null;
  const holeIds = new Set(lab.holes.flatMap((_, h) => L.holeTokens(lab, h).map((tk) => tk.id)));
  const tickEvery = Math.max(1, Math.ceil(30 / (g.unit * L.toNum(ax.step))));
  const ticks = [];
  for (let v = L.toNum(ax.min), n = 0; v <= L.toNum(ax.max) + 1e-9; v += L.toNum(ax.step), n += 1) ticks.push({ v, label: n % tickEvery === 0 });
  const fmt = (v) => String(Math.round(v * 1000) / 1000).replace('.', ',');
  const pivotX = g.px(pShown);

  const activeHandle = { range: null, mean: 'fulcrum', median: 'curtain', contrast: 'moved', hidden: null }[stage];

  const sceneEl = (
    <div dir="ltr" className="relative mx-auto" style={{ width: W, height: H }} data-sb-scenebox>
      <div
        ref={sceneRef}
        className="absolute inset-0 rounded-xl border border-slate-200 bg-white"
        style={{ touchAction: 'none', userSelect: 'none', cursor: drag ? 'grabbing' : 'pointer' }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        role="group" aria-label={k('sceneAria', { beam: tw('beam') })}
        data-sb-scene data-w={W} data-h={H} data-token={Math.round(tokenS)}
      >
        <svg width={W} height={H} className="absolute inset-0" aria-hidden="true" focusable="false">
          <style>{SB_CSS}</style>
          {/* le rail du rideau (et la marque de la médiane visée, hidden) */}
          {showCurtain && <line x1={g.pad} x2={W - g.pad} y1={yRail + 6} y2={yRail + 6} stroke="#CBD5E1" strokeWidth={3} strokeLinecap="round" />}
          {stage === 'hidden' && (
            <g data-sb-target-mark="median">
              <path d={`M${g.px(lab.targetMedian)} ${yRail + 13} l-5 -8 h10 z`} fill="#059669" />
            </g>
          )}
          {/* la poutre et ses jetons : tournent autour de l'appui */}
          <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${pivotX}px ${beamY + 3}px`, transition: reduce || drag ? 'none' : 'transform 420ms cubic-bezier(.3,1.4,.5,1)' }}
            data-sb-beam data-tilt={mo.tilt}>
            <rect x={g.pad - 6} y={beamY} width={W - 2 * g.pad + 12} height={6} rx={3} fill={mo.tilt === 'level' ? '#059669' : '#475569'} />
            {cols.map((c) => c.tokens.map((tk, n) => {
              const side = sideOf(tk.rank);
              const isOut = outside(c.v);
              const x = g.px(c.v);
              const y = beamY - (n + 1) * tokenS;
              return (
                <g key={tk.id} transform={`translate(${x - tokenS / 2} ${y})`} data-sb-token={tk.id} data-v={L.text(c.v)} data-side={side ?? (isOut ? 'out' : '')}>
                  <TokenGlyph theme={theme} s={tokenS} hidden={holeIds.has(tk.id)} moved={tk.id === movedId} label={tokenS >= 20 ? fmt(L.toNum(c.v)) : null} />
                  {(side || isOut) && (
                    <rect x={0.5} y={0.5} width={tokenS - 1} height={tokenS - 1} rx={Math.min(5, tokenS / 4)} fill="none"
                      stroke={isOut ? SIDE.out : SIDE[side]} strokeWidth={side === 'on' ? 2.6 : 1.8} />
                  )}
                </g>
              );
            }))}
          </g>
          {/* l'appui : un triangle sous la poutre */}
          <g data-sb-fulcrum data-p={L.text(pShown)}>
            <path d={`M${pivotX} ${yFul} l-9 16 h18 z`} fill={mo.tilt === 'level' ? '#059669' : '#0F172A'} />
            {stage === 'contrast' && <path d={`M${g.px(L.mean(baseOf(lab)))} ${yFul} l-7 13 h14 z`} fill="none" stroke="#94A3B8" strokeDasharray="3 2" data-sb-ghost="mean" />}
          </g>
          {/* la règle FIXE */}
          <line x1={g.pad} x2={W - g.pad} y1={yRuler} y2={yRuler} stroke="#334155" strokeWidth={1.4} />
          {ticks.map((tk) => (
            <g key={tk.v}>
              <line x1={g.pad + (tk.v - L.toNum(ax.min)) * g.unit} x2={g.pad + (tk.v - L.toNum(ax.min)) * g.unit} y1={yRuler - 3} y2={yRuler + (tk.label ? 4 : 2)} stroke="#334155" strokeWidth={1} />
              {tk.label && <text x={g.pad + (tk.v - L.toNum(ax.min)) * g.unit} y={yRuler + 15} textAnchor="middle" fontSize={10} fill="#475569" fontFamily="ui-monospace, monospace">{fmt(tk.v)}</text>}
            </g>
          ))}
          {/* le rideau */}
          {showCurtain && (
            <g data-sb-curtain data-c={cShown} data-locked={cLocked ? 'true' : 'false'}>
              <line x1={g.px(cValue)} x2={g.px(cValue)} y1={yRail + 6} y2={beamY + 4} stroke={cLocked ? '#059669' : '#7C3AED'} strokeWidth={2.4} strokeDasharray={cLocked ? undefined : '5 3'} />
              <rect x={g.px(cValue) - 6} y={yRail + 1} width={12} height={10} rx={3} fill={cLocked ? '#059669' : '#7C3AED'} />
            </g>
          )}
          {stage === 'contrast' && (
            <line x1={g.px(L.median(baseOf(lab)))} x2={g.px(L.median(baseOf(lab)))} y1={yRail + 6} y2={beamY} stroke="#94A3B8" strokeWidth={1} strokeDasharray="2 3" data-sb-ghost="median" />
          )}
          {/* le كلّاب */}
          {showJaws && jaws && (
            <g data-sb-jaws>
              {['lo', 'hi'].map((w) => {
                const x = g.px(cols[jaws[w]].v) + (w === 'lo' ? -tokenS / 2 - 3 : tokenS / 2 + 3);
                return (
                  <g key={w} data-sb-jaw={w}>
                    <line x1={x} x2={x} y1={yTokTop - 4} y2={yJaws + 8} stroke={out && out.below + out.above === 0 ? '#059669' : '#B45309'} strokeWidth={2.2} />
                    <path d={w === 'lo' ? `M${x} ${yTokTop - 4} h6` : `M${x} ${yTokTop - 4} h-6`} stroke="#B45309" strokeWidth={2.2} />
                  </g>
                );
              })}
              <line x1={g.px(cols[jaws.lo].v) - tokenS / 2 - 3} x2={g.px(cols[jaws.hi].v) + tokenS / 2 + 3} y1={yJaws + 8} y2={yJaws + 8} stroke="#B45309" strokeWidth={3} />
            </g>
          )}
        </svg>
        {/* les poignées (clavier, lecteur d'écran, cible tactile de 44 px) */}
        {stage === 'mean' && (
          <Handle s={sF} which="fulcrum" x={pivotX} y={yFul + 8} label={k('fulcrumAria', { p: L.text(pShown) })} valueText={L.text(pShown)} tone="#0F172A" />
        )}
        {(stage === 'median') && (
          <Handle s={sC} which="curtain" x={g.px(cValue)} y={yRail + 6} label={k('curtainAria', { left: cSides.left, right: cSides.right })} valueText={k('curtainText', { left: cSides.left, right: cSides.right })} tone="#7C3AED" />
        )}
        {showJaws && jaws && (
          <>
            <Handle s={sLo} which="lo" x={g.px(cols[jaws.lo].v) - tokenS / 2 - 3} y={yJaws + 8} label={k('jawLoAria', { v: L.text(cols[jaws.lo].v) })} valueText={L.text(cols[jaws.lo].v)} tone="#B45309" />
            <Handle s={sHi} which="hi" x={g.px(cols[jaws.hi].v) + tokenS / 2 + 3} y={yJaws + 8} label={k('jawHiAria', { v: L.text(cols[jaws.hi].v) })} valueText={L.text(cols[jaws.hi].v)} tone="#B45309" />
          </>
        )}
        {stage === 'contrast' && (
          <Handle s={sM} which="moved" x={g.px(L.moveAt(lab, mK))} y={beamY - tokenS / 2} label={k('movedAria', { v: L.text(L.moveAt(lab, mK)) })} valueText={L.text(L.moveAt(lab, mK))} tone="#DC2626" />
        )}
        {stage === 'hidden' && lab.holes.map((_, h) => (
          <Handle key={h} s={sHoles[h]} which={`hole-${h}`} x={holeTokenX(h)} y={beamY - tokenS / 2} shakeKey={lab.last?.kind === 'refused' && lab.last.h === h ? shake : 0}
            label={k('holeAria', { n: h + 1, v: L.text(L.holeValue(view, h)), lo: L.text(lab.holes[h].lo), hi: L.text(lab.holes[h].hi) })} valueText={L.text(L.holeValue(view, h))} tone="#7C3AED" />
        ))}
      </div>
    </div>
  );

  const stepPad = (s, which, less, more, onLess, onMore) => (
    <span dir="ltr" className="inline-flex gap-1">
      <button type="button" onClick={onLess ?? (() => s.nudge(-1))} aria-label={less} data-sb-less={which}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Minus className="h-5 w-5" aria-hidden="true" /></button>
      <button type="button" onClick={onMore ?? (() => s.nudge(1))} aria-label={more} data-sb-more={which}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Plus className="h-5 w-5" aria-hidden="true" /></button>
    </span>
  );

  const reading = (() => {
    if (stage === 'range' && out) {
      const n = out.below + out.above;
      return (
        <div className="space-y-1.5" data-sb-reading="range">
          <div className="flex flex-wrap items-center gap-1.5">
            {stepPad(sLo, 'lo', k('jawLoLess'), k('jawLoMore'))}
            <span className="text-xs font-bold text-amber-900">{k('jawLo')}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {stepPad(sHi, 'hi', k('jawHiLess'), k('jawHiMore'))}
            <span className="text-xs font-bold text-amber-900">{k('jawHi')}</span>
          </div>
          <p className="text-sm font-bold text-slate-800">{T(k('rWidth', { hi: L.tex(out.hi), lo: L.tex(out.lo), w: L.tex(out.width) }))}</p>
          <p className={`text-xs font-bold ${n ? 'text-rose-700' : 'text-emerald-700'}`}>{k('outside', { count: n })}</p>
        </div>
      );
    }
    if (stage === 'mean') {
      return (
        <div className="space-y-1.5" data-sb-reading="mean">
          <div className="flex flex-wrap items-center gap-1.5">
            {stepPad(sF, 'fulcrum', k('fulcrumLess'), k('fulcrumMore'))}
            <span className="text-sm font-bold text-slate-800">{T(k('pNow', { p: L.texApprox(pShown) }))}</span>
          </div>
          <p className="text-sm text-slate-800" data-sb-sums>{T(k('sums', { l: L.texApprox(mo.left), r: L.texApprox(mo.right) }))}</p>
          <p className="text-xs font-bold" style={{ color: mo.tilt === 'level' ? '#047857' : '#334155' }} data-sb-tilt={mo.tilt}>{k(`tilt.${mo.tilt}`)}</p>
        </div>
      );
    }
    if (stage === 'median' && cSides) {
      return (
        <div className="space-y-1.5" data-sb-reading="median">
          <div className="flex flex-wrap items-center gap-1.5">
            {stepPad(sC, 'curtain', k('curtainLess'), k('curtainMore'))}
          </div>
          <p className="text-sm font-bold" data-sb-counts>
            <span style={{ color: SIDE.left }}>{k('leftCount', { count: cSides.left })}</span>{' · '}
            {cSides.on && <><span style={{ color: SIDE.on }}>{k('onCount')}</span>{' · '}</>}
            <span style={{ color: SIDE.right }}>{k('rightCount', { count: cSides.right })}</span>
          </p>
        </div>
      );
    }
    if (stage === 'contrast') {
      return (
        <div className="space-y-1.5" data-sb-reading="contrast">
          <div className="flex flex-wrap items-center gap-1.5">
            {stepPad(sM, 'moved', k('movedLess'), k('movedMore'))}
            <span className="text-sm font-bold text-rose-800">{T(k('movedNow', { v: val(L.moveAt(lab, mK)) }))}</span>
          </div>
          <p className="text-sm text-slate-800">{T(k('contrastNow', { m: valA(L.mean(view)), med: val(L.median(view)) }))}</p>
          <p className="text-xs text-slate-500">{T(k('contrastBefore', { m: valA(L.mean(baseOf(lab))), med: val(L.median(baseOf(lab))) }))}</p>
        </div>
      );
    }
    if (stage === 'hidden') {
      const st = L.hiddenStatus(view);
      const compact = (p) => (L.isShort(p) ? L.tex(p) : `\\approx ${L.approx(p).replace(',', '{,}')}`);
      return (
        <div className="space-y-1.5" data-sb-reading="hidden">
          {/* compact (§8bis, synthèse à 320 px) : les pavés −/+ des valeurs cachées côte à côte, la valeur et ses bornes dessous */}
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${lab.holes.length}, minmax(0, 1fr))` }}>
            {lab.holes.map((hole, h) => (
              <div key={h} className="flex flex-col items-center gap-0.5" data-sb-hole={h}>
                {stepPad(sHoles[h], `hole-${h}`, k('holeLess', { n: h + 1 }), k('holeMore', { n: h + 1 }), () => nudgeHole(h, -1), () => nudgeHole(h, 1))}
                <span className="text-center text-xs font-bold leading-tight text-violet-900">{T(k('holeShort', { n: h + 1, v: L.tex(L.holeValue(view, h)), lo: L.tex(hole.lo), hi: L.tex(hole.hi) }))}</span>
              </div>
            ))}
          </div>
          <ul className="flex flex-wrap gap-1.5">
            <li data-sb-target="median" data-ok={st.medianOk ? 'true' : 'false'}
              className={`rounded-lg border-2 px-2 py-0.5 text-xs font-bold ${st.medianOk ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : 'border-slate-300 bg-white text-slate-700'}`}>
              {st.medianOk ? '✓ ' : '○ '}{T(k('targetMedian', { now: compact(st.median), goal: L.tex(lab.targetMedian) }))}
            </li>
            <li data-sb-target="mean" data-ok={st.meanOk ? 'true' : 'false'}
              className={`rounded-lg border-2 px-2 py-0.5 text-xs font-bold ${st.meanOk ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : 'border-slate-300 bg-white text-slate-700'}`}>
              {st.meanOk ? '✓ ' : '○ '}{T(k('targetMean', { now: compact(st.mean), goal: L.tex(lab.targetMean) }))}
            </li>
          </ul>
        </div>
      );
    }
    return null;
  })();

  // les étapes lisibles (remplacent les onglets) : chacune est FAITE quand ses questions sont répondues ; on fête chacune une fois (réarmées après « إعادة »)
  const stepDone = lab.stages.map((st) => (cpActive ? doneIds.has(st) : !!lab.done[st]));
  const stepper = lab.stages.length > 1 && <LabStepper count={lab.stages.length} current={stepDone.includes(false) ? stepDone.indexOf(false) : lab.stages.length - 1} done={stepDone} stepAttr="data-sb-step" />;
  const party = useStepCelebration();
  const celebrated = useRef({ inits, set: new Set() });
  if (celebrated.current.inits !== inits) celebrated.current = { inits, set: new Set() };
  const doneKey = stepDone.join('');
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.set.has(i)) return;
      celebrated.current.set.add(i);
      party.celebrate({ n: i + 1, total: lab.stages.length });
    });
  }, [doneKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const controls = (
    <div ref={ctrlRef} className="space-y-2" data-sb-controls>
      {stepper}
      {reading}
      <p role="status" aria-live="polite" className={`${stage === 'hidden' ? 'min-h-[1.25rem]' : 'min-h-[2.5rem]'} text-sm font-bold leading-snug`} data-sb-verdict={lab.last?.kind ?? ''}>{verdict}</p>
      {L.canAdvance(lab) && !cp.blocking && (
        <button type="button" onClick={() => { setLive({}); setLab((x) => L.goStage(x, x.stage + 1)); }} data-sb-next
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border-2 border-blue-600 bg-blue-600 px-3 text-sm font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
          {k('next', { name: k(`stage.${lab.stages[lab.stage + 1]}`) })} <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );

  return (
    <ManipulationShell
      type="stat-balance"
      title={title ?? k('title')}
      mission={missionText}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      guided={cpActive}
      hints={hintKeys.map((h) => <MathText key={h}>{h}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false, ...(autoComplete ? { autoComplete } : {}) }}
      representation={representation}
      discovery={<ManipulationDiscovery state={state} prompt={<MathText>{k(`dPrompt.${L.discoveryKind(lab)}`)}</MathText>} options={discoveryOptions} formal={formal} />}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-amber-50/60 to-white">
        <div ref={boxRef} className="space-y-3" data-stat-balance data-mode={mode} data-theme={theme} data-stage={stage} data-n={lab.N}
          data-layout={layout} data-budget={budget} data-ctrl-h={ctrlH} data-active={activeHandle ?? ''}>
          <div className="relative">
          {party.node}
          {cp.node}
          <div className={wide ? 'grid items-start gap-3' : 'space-y-3'} style={wide ? { gridTemplateColumns: `${sceneW}px 1fr` } : undefined} data-sb-glance>
            <div>
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-xs font-bold text-slate-600" data-sb-axis>{tw('beam')}{uTex ? <> · <bdi dir="ltr">{unitWord}</bdi></> : ''}</p>
                <Deco theme={theme} reduce={reduce} />
              </div>
              {sceneEl}
            </div>
            {controls}
          </div>
          </div>
          {lab.trials.length > 0 && (
            <LabFold id="stat-balance.trials" title={k('trialsTitle')}>
              <ul className="flex flex-wrap gap-1.5" data-sb-trials>
                {lab.trials.slice(-10).map((tr, n) => (
                  <li key={`${tr.stage}${n}`} data-sb-trial={tr.stage}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-800">
                    <MathText>{trialLine(tr, k)}</MathText>
                  </li>
                ))}
              </ul>
            </LabFold>
          )}
          {i18n.exists(`lesson:manipulation.statBalance.themes.${theme}.world`) && <p className="text-[11px] text-slate-500" data-sb-world>{tw('world')}</p>}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ── la série d'origine (avant le jeton tiré) ── */
function baseOf(lab) {
  if (!lab.stages.includes('contrast')) return lab;
  return { ...lab, tokens: lab.tokens.map((t, i) => ({ ...t, v: lab.origValues[i] })) };
}

function trialReport(tr) {
  const T = (p) => (p == null ? null : L.text(p));
  if (tr.stage === 'mean') return { stage: 'mean', p: T(tr.p), tilt: tr.tilt, left: T(tr.left), right: T(tr.right), ok: tr.tilt === 'level' };
  if (tr.stage === 'median') return { stage: 'median', c: tr.c, left: tr.left, right: tr.right, on: tr.on, value: T(tr.value), ok: tr.locked };
  if (tr.stage === 'range') return { stage: 'range', lo: T(tr.lo), hi: T(tr.hi), width: T(tr.width), outside: tr.below + tr.above, ok: tr.caught };
  if (tr.stage === 'contrast') return { stage: 'contrast', v: T(tr.v), mean: T(tr.mean), median: T(tr.median), ok: true };
  return { stage: 'hidden', h: tr.h, v: T(tr.v), refused: tr.refused, mean: T(tr.mean), median: T(tr.median), ok: !!(tr.meanOk && tr.medianOk) };
}

function trialLine(tr, k) {
  if (tr.stage === 'mean') return `$p = ${L.texApprox(tr.p)}$ · ${k(`tiltShort.${tr.tilt}`)}`;
  if (tr.stage === 'median') return `${tr.left} | ${tr.on ? '● | ' : ''}${tr.right}${tr.locked ? ' ✓' : ''}`;
  if (tr.stage === 'range') return `$${L.tex(tr.hi)} - ${L.tex(tr.lo)} = ${L.tex(tr.width)}$${tr.caught ? ' ✓' : ''}`;
  if (tr.stage === 'contrast') return `$${L.tex(tr.v)}$ : $m = ${L.texApprox(tr.mean)}$ ، $\\mathrm{Med} = ${L.tex(tr.median)}$`;
  if (tr.refused) return `$${L.tex(tr.v)}$ ✗`;
  return `$${L.tex(tr.v)}$ : $\\mathrm{Med} = ${L.texApprox(tr.median)}$ ، $m = ${L.texApprox(tr.mean)}$`;
}

/* ── le verdict : la conséquence mathématique ── */
function verdictOf({ lab, k, T, val, valA }) {
  const last = lab.last;
  if (!last) return null;
  switch (last.kind) {
    case 'tilted': return <span className="text-slate-800">{T(k('vTilted', { p: L.texApprox(last.p), side: k(`side.${last.tilt}`), l: L.texApprox(last.left), r: L.texApprox(last.right) }))}</span>;
    case 'balanced': return <span className="text-emerald-800">{T(k('vBalanced', { p: valA(last.p), s: L.texApprox(last.left) }))}</span>;
    case 'unequal': return <span className="text-violet-900">{T(k('vUnequal', { left: last.left, right: last.right }))}</span>;
    case 'locked': return <span className="text-emerald-800">{T(k(last.on ? 'vLockedOn' : 'vLockedBetween', { n: last.left, v: val(last.value) }))}</span>;
    case 'open': return <span className="text-amber-900">{T(k('vOpen', { count: last.below + last.above }))}</span>;
    case 'caught': return <span className="text-emerald-800">{T(k('vCaught', { hi: L.tex(last.hi), lo: L.tex(last.lo), w: L.tex(last.width) }))}</span>;
    case 'moved': return <span className="text-rose-900">{T(k('vMoved', { v: val(last.v), m: valA(last.mean), med: val(last.median) }))}</span>;
    case 'refused': return <span className="text-rose-800">{T(k('vRefused', { lo: L.tex(last.lo), hi: L.tex(last.hi) }))}</span>;
    case 'hiddenTry': return null; // les deux pastilles cibles disent déjà la médiane et la moyenne courantes
    case 'found': return <span className="text-emerald-800">{T(k('vFound', { med: L.tex(last.median), m: L.tex(last.mean) }))}</span>;
    default: return null;
  }
}

/* ── la découverte ── */
function discoveryFor(lab, k, val, forced) {
  const M = (s) => <MathText>{s}</MathText>;
  const kind = forced ?? L.discoveryKind(lab);
  const base = baseOf(lab);
  if (kind === 'contrast') {
    const tr = L.contrastTrials(lab).filter((x) => !L.same(x.v, lab.origMax));
    const ms = tr.slice(-2).map((x) => L.texApprox(x.mean)).join(' ، ');
    const meds = tr.slice(-2).map((x) => L.tex(x.median)).join(' ، ');
    return [
      { text: M(k('dOpt.bothMove')), why: M(k('dOpt.bothMoveWhy', { meds, med0: L.tex(L.median(base)) })) },
      { text: M(k('dOpt.contrastRight')), correct: true },
      { text: M(k('dOpt.noneMove')), why: M(k('dOpt.noneMoveWhy', { ms, m0: L.texApprox(L.mean(base)) })) },
    ];
  }
  if (kind === 'mean') {
    const m = L.mean(lab);
    const opts = [{ text: M(k('dOpt.meanRight')), correct: true }];
    const mid = L.midrange(lab);
    if (!L.same(mid, m)) {
      const mo = L.moments(lab, mid);
      opts.unshift({ text: M(k('dOpt.midrange')), why: M(k('dOpt.midrangeWhy', { lo: L.tex(L.minV(lab)), hi: L.tex(L.maxV(lab)), mid: L.tex(mid), side: k(`side.${mo.tilt}`), l: L.texApprox(mo.left), r: L.texApprox(mo.right) })) });
    }
    const med = L.median(lab);
    if (!L.same(med, m) && !L.same(med, mid)) {
      const mo = L.moments(lab, med);
      opts.push({ text: M(k('dOpt.counts')), why: M(k('dOpt.countsWhy', { med: L.tex(med), side: k(`side.${mo.tilt}`), l: L.texApprox(mo.left), r: L.texApprox(mo.right) })) });
    }
    return opts;
  }
  if (kind === 'hidden') {
    const w = L.meanOnlyWitness(lab);
    const opts = [{ text: M(k('dOpt.hiddenRight')), correct: true }];
    if (w) {
      const tmp = { ...lab, tokens: lab.tokens.map((t) => { const h = lab.holes.findIndex((x) => x.index === t.entry); return h >= 0 ? { ...t, v: w[h] } : t; }) };
      opts.push({ text: M(k('dOpt.meanOnly')), why: M(k('dOpt.meanOnlyWhy', { vals: w.map(L.tex).join(' ، '), m: L.tex(lab.targetMean), med: L.texApprox(L.median(tmp)) })) });
    }
    opts.unshift({ text: M(k('dOpt.guess')), why: M(k('dOpt.guessWhy', { n: lab.N })) });
    return opts;
  }
  const r = L.range(lab);
  const opts = [{ text: M(k('dOpt.rangeRight')), correct: true }];
  if (!L.same(L.maxV(lab), r)) opts.unshift({ text: M(k('dOpt.rangeMax')), why: M(k('dOpt.rangeMaxWhy', { hi: L.tex(L.maxV(lab)), w: L.tex(r) })) });
  if (lab.N !== L.toNum(r)) opts.push({ text: M(k('dOpt.rangeCount')), why: M(k('dOpt.rangeCountWhy', { n: lab.N, w: L.tex(r) })) });
  void val;
  return opts;
}

function Formal({ lab, k, val, valA }) {
  const M = (s) => <MathText>{s}</MathText>;
  const base = baseOf(lab);
  const has = (s) => lab.stages.includes(s);
  const N = base.N;
  const vals = L.values(base);
  const sumTex = vals.length <= 12 ? vals.map(L.tex).join(' + ') : `\\ldots`;
  const m = L.mean(base);
  const ranks = L.medianRanks(base);
  const sorted = L.ranked(base).map((t) => t.v);
  return (
    <div className="space-y-2" data-sb-formal={lab.stages.join('|')}>
      {has('range') && <p className="text-sm text-slate-800" data-sb-formal-line="range">{M(k('fRange', { hi: L.tex(L.maxV(base)), lo: L.tex(L.minV(base)), w: L.tex(L.range(base)) }))}</p>}
      {(has('mean') || has('contrast')) && (
        <>
          <EquationDisplay tone="result" tex={`m = \\dfrac{${sumTex}}{${N}} = \\dfrac{${L.tex(L.sum(base))}}{${N}} = ${L.texApprox(m)}`} />
          <p className="text-sm text-emerald-900" data-sb-formal-line="mean">{M(k('fMean'))}</p>
        </>
      )}
      {has('median') && (
        <p className="text-sm text-slate-800" data-sb-formal-line="median">
          {M(ranks.length === 1
            ? k('fMedianOdd', { N, r: ranks[0], v: L.tex(sorted[ranks[0] - 1]) })
            : k('fMedianEven', { N, r1: ranks[0], r2: ranks[1], a: L.tex(sorted[ranks[0] - 1]), b: L.tex(sorted[ranks[1] - 1]), v: L.tex(L.median(base)) }))}
        </p>
      )}
      {has('contrast') && <p className="text-sm text-emerald-900" data-sb-formal-line="contrast">{M(k('fContrast'))}</p>}
      {has('hidden') && <p className="text-sm text-emerald-900" data-sb-formal-line="hidden">{M(k('fHidden', { med: L.tex(lab.targetMedian), m: L.tex(lab.targetMean), vals: lab.holes.map((_, h) => L.tex(L.holeValue(lab, h))).join(' ، ') }))}</p>}
      {void val}{void valA}
    </div>
  );
}

/** Ce que l'élève a trouvé jusqu'ici (jamais avant le geste qui le trouve). */
function Representation({ lab, k, valA }) {
  const base = baseOf(lab);
  const items = [];
  if (lab.done.range) items.push(k('found.range', { w: L.tex(L.range(base)) }));
  if (lab.done.mean) items.push(k('found.mean', { m: L.texApprox(L.mean(base)) }));
  if (lab.done.median) items.push(k('found.median', { v: L.tex(L.median(base)) }));
  if (lab.done.hidden) items.push(k('found.hidden', { vals: lab.holes.map((_, h) => L.tex(L.holeValue(lab, h))).join(' ، ') }));
  void valA;
  if (!items.length) return null;
  return <p className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-900" data-sb-found><MathText>{items.join(' · ')}</MathText></p>;
}

/* ── une poignée posée sur la scène (cible de 44 px, slider au clavier) ── */
function Handle({ s, which, x, y, label, valueText, tone, shakeKey = 0 }) {
  return (
    <div {...s.handleProps({ label, valueText })}
      className="absolute z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
      style={{ left: x, top: y }} data-sb-handle={which}
      onPointerDown={(e) => { /* la scène porte le geste : la poignée laisse passer le doigt */ void e; }}>
      <span key={shakeKey} className={`block h-3.5 w-3.5 rounded-full border-2 border-white shadow ${shakeKey ? 'sb-shake' : ''}`} style={{ background: tone }} />
    </div>
  );
}

/* ── les jetons dessinés : CARRÉS, un par valeur ── */
function TokenGlyph({ theme, s, hidden, moved, label }) {
  const r = Math.min(5, s / 4);
  if (hidden) {
    // l'hexagone du manuel (أدمج تعلّماتي) : une valeur à retrouver
    const c = s / 2;
    const pts = Array.from({ length: 6 }, (_, i) => { const a = (Math.PI / 3) * i + Math.PI / 6; return `${c + (s / 2 - 1) * Math.cos(a)},${c + (s / 2 - 1) * Math.sin(a)}`; }).join(' ');
    return (
      <g>
        <polygon points={pts} fill="#EDE9FE" stroke="#7C3AED" strokeWidth={1.4} />
        {s >= 12 && <text x={c} y={c + s * 0.17} textAnchor="middle" fontSize={s * 0.48} fontWeight="bold" fill="#5B21B6">?</text>}
      </g>
    );
  }
  if (theme === 'heatwave') {
    // un relevé du thermomètre : le tube, le mercure, le réservoir
    return (
      <g>
        <rect x={0.5} y={0.5} width={s - 1} height={s - 1} rx={r} fill={moved ? '#FEE2E2' : '#FFF7ED'} stroke="#FDBA74" strokeWidth={1} />
        <rect x={s * 0.42} y={s * 0.12} width={s * 0.16} height={s * 0.6} rx={s * 0.08} fill="#fff" stroke="#9A3412" strokeWidth={Math.max(0.6, s / 40)} />
        <rect x={s * 0.45} y={s * 0.32} width={s * 0.1} height={s * 0.45} fill="#DC2626" className="sb-mercury" />
        <circle cx={s / 2} cy={s * 0.78} r={s * 0.13} fill="#DC2626" stroke="#9A3412" strokeWidth={Math.max(0.6, s / 40)} />
        {label && <text x={s * 0.78} y={s * 0.3} textAnchor="middle" fontSize={s * 0.24} fontWeight="bold" fill="#7C2D12">{label}</text>}
      </g>
    );
  }
  if (theme === 'medals') {
    // une médaille d'or et son ruban
    return (
      <g>
        <path d={`M${s * 0.3} 0 L${s * 0.45} ${s * 0.42} L${s * 0.55} ${s * 0.42} L${s * 0.7} 0 Z`} fill="#2563EB" />
        <circle cx={s / 2} cy={s * 0.62} r={s * 0.36} fill={moved ? '#FCA5A5' : '#FBBF24'} stroke="#B45309" strokeWidth={Math.max(0.6, s / 30)} />
        {label && <text x={s / 2} y={s * 0.71} textAnchor="middle" fontSize={s * 0.3} fontWeight="bold" fill="#78350F">{label}</text>}
      </g>
    );
  }
  // esport : la carte de score d'un joueur
  return (
    <g>
      <rect x={0.5} y={0.5} width={s - 1} height={s - 1} rx={r} fill={moved ? '#FECACA' : '#EDE9FE'} stroke="#6D28D9" strokeWidth={1} />
      <rect x={0.5} y={0.5} width={s - 1} height={s * 0.26} rx={r} fill="#6D28D9" />
      <circle cx={s * 0.3} cy={s * 0.14} r={s * 0.05} fill="#C4B5FD" />
      <circle cx={s * 0.7} cy={s * 0.14} r={s * 0.05} fill="#C4B5FD" />
      {label && <text x={s / 2} y={s * 0.76} textAnchor="middle" fontSize={s * 0.4} fontWeight="bold" fill="#3B0764">{label}</text>}
    </g>
  );
}

/* ── le décor (sans information) ── */
function Deco({ theme, reduce }) {
  const [taps, setTaps] = useState(0);
  const anim = taps > 0 && !reduce;
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" onPointerDown={(e) => e.stopPropagation()} onClick={() => !reduce && setTaps((n) => n + 1)} data-deco={theme}
      className="h-7 w-7 shrink-0 rounded-lg focus:outline-none">
      <svg viewBox="0 0 40 40" width="100%" height="100%">
        {theme === 'esport' && (
          <g key={taps} className={anim ? 'sb-buzz' : undefined}>
            <path d="M8 16 q0 -6 7 -6 h10 q7 0 7 6 l2 10 q1 6 -5 5 l-5 -5 h-8 l-5 5 q-6 1 -5 -5 z" fill="#4C1D95" />
            <circle cx={14} cy={18} r={2.2} fill="#C4B5FD" /><circle cx={27} cy={16.5} r={1.6} fill="#F472B6" /><circle cx={30} cy={20} r={1.6} fill="#34D399" />
          </g>
        )}
        {theme === 'heatwave' && (
          <g key={taps} className={anim ? 'sb-glow' : undefined}>
            <circle cx={20} cy={20} r={8} fill="#F59E0B" />
            {Array.from({ length: 8 }, (_, i) => <line key={i} x1={20 + 11 * Math.cos(i * Math.PI / 4)} y1={20 + 11 * Math.sin(i * Math.PI / 4)} x2={20 + 15 * Math.cos(i * Math.PI / 4)} y2={20 + 15 * Math.sin(i * Math.PI / 4)} stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" />)}
          </g>
        )}
        {theme === 'medals' && (
          <g key={taps} className={anim ? 'sb-glow' : undefined}>
            <path d="M14 4 L18 18 h4 L26 4 z" fill="#2563EB" />
            <circle cx={20} cy={26} r={10} fill="#FBBF24" stroke="#B45309" strokeWidth={1.5} />
            <path d="M16 23 l3 -3 v12" stroke="#78350F" strokeWidth={2} fill="none" />
          </g>
        )}
      </svg>
    </button>
  );
}

const SB_CSS = '.sb-shake{animation:sb-s .35s ease-in-out 1}@keyframes sb-s{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}'
  + '.sb-buzz{animation:sb-b .08s linear 6}@keyframes sb-b{0%,100%{transform:translate(0,0)}50%{transform:translate(1px,-1px)}}'
  + '.sb-glow{animation:sb-g .9s ease-in-out 1}@keyframes sb-g{0%,100%{opacity:1}50%{opacity:.55}}'
  + '.sb-mercury{animation:sb-m 2.4s ease-in-out infinite}@keyframes sb-m{0%,100%{opacity:1}50%{opacity:.8}}'
  + '@media (prefers-reduced-motion: reduce){.sb-shake,.sb-buzz,.sb-glow,.sb-mercury{animation:none}}';

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

const BASE_CHAINS = Object.freeze({
  range: ['rangeAdd', 'rangeRule'],
  mean: ['sumX', 'meanDiv', 'meanRule'],
  median: ['medRank', 'medValue'],
  contrast: ['meanUp', 'medianUp', 'rule'],
  hidden: ['hidSum', 'rule'],
});

/** La suite de questions d'une étape ; la DERNIÈRE étape finit par la règle générale (`rule`, qui remplace la découverte). */
export const chainFor = (stage, last) => {
  const base = BASE_CHAINS[stage];
  return last ? [...base.filter((q) => !/Rule$/.test(q) && q !== 'rule'), 'rule'] : base;
};

/** « أعِد التجربة » : l'étape `stage` recommence (l'état de l'étape revient à celui de `make()`). */
function retryStage(lab, stage, make) {
  const f = make();
  return {
    ...lab, last: null,
    done: { ...lab.done, [stage]: false },
    trials: lab.trials.filter((t) => t.stage !== stage),
    ...(stage === 'mean' ? { fulcrumJ: f.fulcrumJ } : {}),
    ...(stage === 'median' ? { curtain: f.curtain } : {}),
    ...(stage === 'range' ? { jaws: f.jaws } : {}),
    ...(stage === 'contrast' ? { tokens: f.tokens, moved: 0 } : {}),
    ...(stage === 'hidden' ? { tokens: f.tokens } : {}),
  };
}

const dl = (x) => `$${x}$`;
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const ft = (p) => Lin.fracText(p);

/** Chaque question est construite sur LA série de l'élève (rien en dur) ; `k` : les textes de `statBalance`. */
export const QUESTIONS = {
  rangeAdd: (lab, k) => {
    const hi = L.maxV(lab); const lo = L.minV(lab); const r = L.range(lab);
    const d = 4;
    const o = { hi: dl(L.tex(hi)), lo: dl(L.tex(lo)), d, newHi: dl(L.tex(Lin.add(hi, Lin.frac(d)))), r: dl(L.tex(r)) };
    return {
      id: 'rangeAdd', kind: 'number', expected: ft(Lin.add(r, Lin.frac(d))), answer: <MathText>{dl(L.tex(Lin.add(r, Lin.frac(d))))}</MathText>,
      prompt: Mx(k, 'rangeAdd.prompt', o), hints: [Mx(k, 'rangeAdd.hint1', o), Mx(k, 'rangeAdd.hint2', o)],
      explain: Mx(k, 'rangeAdd.explain', { ...o, calc: dl(`${L.tex(Lin.add(hi, Lin.frac(d)))} - ${L.tex(lo)} = ${L.tex(Lin.add(r, Lin.frac(d)))}`) }),
    };
  },
  rangeRule: (lab, k) => ruleQuestion(lab, k, 'range'),
  sumX: (lab, k) => {
    const sum = L.sum(lab);
    const o = { N: lab.N, vals: dl(lab.N <= 12 ? L.valueList(lab).join(' + ') : '\\ldots') };
    return {
      id: 'sumX', kind: 'number', expected: ft(sum), answer: <MathText>{dl(L.tex(sum))}</MathText>,
      prompt: Mx(k, 'sumX.prompt', o), hints: [Mx(k, 'sumX.hint1', o), Mx(k, 'sumX.hint2', o)],
      explain: Mx(k, 'sumX.explain', { ...o, calc: dl(`${lab.N <= 12 ? L.valueList(lab).join(' + ') : '\\ldots'} = ${L.tex(sum)}`) }),
    };
  },
  meanDiv: (lab, k) => {
    const sum = L.sum(lab); const m = L.mean(lab);
    const o = { sum: dl(L.tex(sum)), N: lab.N };
    return {
      id: 'meanDiv', kind: 'number', expected: ft(m), answer: <MathText>{dl(L.texApprox(m))}</MathText>,
      prompt: Mx(k, 'meanDiv.prompt', o), hints: [Mx(k, 'meanDiv.hint1', o), Mx(k, 'meanDiv.hint2', o)],
      explain: Mx(k, 'meanDiv.explain', { ...o, calc: dl(`\\dfrac{${L.tex(sum)}}{${lab.N}} = ${L.texApprox(m)}`) }),
    };
  },
  meanRule: (lab, k) => ruleQuestion(lab, k, 'mean'),
  medRank: (lab, k) => {
    const ranks = L.medianRanks(lab);
    const odd = ranks.length === 1;
    const o = { N: lab.N };
    return {
      id: 'medRank', kind: 'number', expected: String(ranks[0]), answer: <MathText>{dl(String(ranks[0]))}</MathText>,
      prompt: Mx(k, odd ? 'medRank.promptOdd' : 'medRank.promptEven', o), hints: [Mx(k, odd ? 'medRank.hint1Odd' : 'medRank.hint1Even', o), Mx(k, odd ? 'medRank.hint2Odd' : 'medRank.hint2Even', o)],
      explain: Mx(k, odd ? 'medRank.explainOdd' : 'medRank.explainEven', { ...o, r: ranks[0], r2: ranks[1] ?? ranks[0] }),
    };
  },
  medValue: (lab, k) => {
    const ranks = L.medianRanks(lab);
    const sorted = L.ranked(lab).map((tk) => tk.v);
    const med = L.median(lab);
    const odd = ranks.length === 1;
    const o = { r: ranks[0], r2: ranks[1] ?? ranks[0], a: dl(L.tex(sorted[ranks[0] - 1])), b: dl(L.tex(sorted[(ranks[1] ?? ranks[0]) - 1])) };
    return {
      id: 'medValue', kind: 'number', expected: ft(med), answer: <MathText>{dl(L.tex(med))}</MathText>,
      prompt: Mx(k, odd ? 'medValue.promptOdd' : 'medValue.promptEven', o), hints: [Mx(k, odd ? 'medValue.hint1Odd' : 'medValue.hint1Even', o), Mx(k, odd ? 'medValue.hint2Odd' : 'medValue.hint2Even', o)],
      explain: Mx(k, odd ? 'medValue.explainOdd' : 'medValue.explainEven', { ...o, calc: dl(L.tex(med)) }),
    };
  },
  meanUp: (lab, k) => {
    const tr = L.contrastTrials(lab).filter((x) => !L.same(x.v, lab.origMax)).at(-1);
    const base = baseOf(lab);
    const d = Lin.sub(tr.v, lab.origMax);
    const up = Lin.sub(tr.mean, L.mean(base));
    const o = { a: dl(L.tex(lab.origMax)), b: dl(L.tex(tr.v)), d: dl(L.tex(d)), N: lab.N };
    return {
      id: 'meanUp', kind: 'number', expected: ft(up), answer: <MathText>{dl(L.texApprox(up))}</MathText>,
      prompt: Mx(k, 'meanUp.prompt', o), hints: [Mx(k, 'meanUp.hint1', o), Mx(k, 'meanUp.hint2', o)],
      explain: Mx(k, 'meanUp.explain', { ...o, calc: dl(`\\dfrac{${L.tex(d)}}{${lab.N}} = ${L.texApprox(up)}`) }),
    };
  },
  medianUp: (lab, k) => {
    const tr = L.contrastTrials(lab).filter((x) => !L.same(x.v, lab.origMax)).at(-1);
    const base = baseOf(lab);
    const o = { a: dl(L.tex(lab.origMax)), b: dl(L.tex(tr.v)), med: dl(L.tex(L.median(base))) };
    return {
      id: 'medianUp', kind: 'number', expected: '0', answer: <MathText>{dl('0')}</MathText>,
      prompt: Mx(k, 'medianUp.prompt', o), hints: [Mx(k, 'medianUp.hint1', o), Mx(k, 'medianUp.hint2', o)],
      explain: Mx(k, 'medianUp.explain', o),
    };
  },
  hidSum: (lab, k) => {
    const sum = Lin.mul(lab.targetMean, Lin.frac(lab.N));   // la somme visée (= la somme des valeurs une fois les cibles trouvées)
    const o = { m: dl(L.tex(lab.targetMean)), N: lab.N };
    return {
      id: 'hidSum', kind: 'number', expected: ft(sum), answer: <MathText>{dl(L.tex(sum))}</MathText>,
      prompt: Mx(k, 'hidSum.prompt', o), hints: [Mx(k, 'hidSum.hint1', o), Mx(k, 'hidSum.hint2', o)],
      explain: Mx(k, 'hidSum.explain', { ...o, calc: dl(`${L.tex(lab.targetMean)} \\times ${lab.N} = ${L.tex(sum)}`) }),
    };
  },
  rule: (lab, k) => ruleQuestion(lab, k, null),
};

/** La règle d'une étape (ou la règle générale de la DERNIÈRE étape) : les distracteurs sont réfutés par les nombres de l'élève. */
function ruleQuestion(lab, k, forced) {
  const kind = forced ?? L.discoveryKind(lab);
  return {
    id: forced ? `${forced}Rule` : 'rule', kind: 'choice',
    prompt: <MathText>{k(`dPrompt.${kind}`)}</MathText>,
    options: discoveryFor(lab, k, () => '', kind),
    hints: [Mx(k, `rule.hint1.${kind}`, {}), Mx(k, `rule.hint2.${kind}`, {})],
    explain: <Formal lab={lab} k={k} val={() => ''} valA={() => ''} />,
  };
}
