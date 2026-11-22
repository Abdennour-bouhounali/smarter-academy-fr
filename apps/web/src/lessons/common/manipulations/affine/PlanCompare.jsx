import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, CheckCircle2, Flag, Minus, Plus, Paintbrush } from 'lucide-react';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import useDragInteraction from '../useDragInteraction';
import DraggableObject from '../primitives/DraggableObject';
import DropZone from '../primitives/DropZone';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import MathText from '../../components/MathText';
import * as L from '../logic/planCompare';

/**
 * plan-compare — DEUX TARIFS FACE À FACE (unité 7 « الدالة التآلفية », leçon 5 « حل مشكلات وترييض
 * وضعيات بتوظيف الدالة التآلفية » ; RÉUTILISÉ par la synthèse « أدمج تعلّماتي » par le contrat ci-dessous).
 *
 * ── CONTRAT DES PROPS (brief de l'unité §6 — la synthèse ne passe QUE celles-ci) ────────────────
 *   <Manipulation type="plan-compare"
 *     plans="200x+2000|400x"   1 à 3 formules (écriture d'`affine.affine`), « | » : formules أ ، ب ، جـ
 *     mode="model" | "compare" | "model|compare"
 *        model   la formule أ seule : l'élève CONSTRUIT le coût (la partie fixe b payée une fois, la partie
 *                a payée x fois), le lab écrit f(x) = ax + b, puis x glisse (image) / un budget se
 *                rencontre (antécédent)
 *        compare deux ou trois formules : x glisse, les barres de coût ET les droites bougent ensemble ;
 *                l'élève pose une marque là où deux coûts sont égaux (vérifiée exactement), puis peint
 *                l'axe des x : la formule la moins chère avant / après
 *        model|compare  modéliser أ, puis — l'élève l'ouvre — comparer (§7quater, retour possible)
 *     ask="x:7|y:4800"         cibles de lecture sur la formule أ (coût de 7 unités ; unités pour 4800)
 *     xMax="20" yMax="6000"    fenêtre (chaînes) ; par défaut tirée des formules
 *     theme="stadium" | "gaming" | "rental"
 *     title lead mission level levels  comme les autres types
 *     onFinished({ kind, x, before, after })   la règle formelle atteinte
 *     onTrial(t)   chaque essai validé : { kind: 'model', ok, tex, x, mine, story } | { kind: 'x', x, stage,
 *                  costs, cheapest } | { kind: 'mark', ok, x, y, pair } | { kind: 'noCross', ok }
 *                  | { kind: 'paint', ok, seg, plan }
 *     onModel({ tex })   (facultatif) le modèle accepté
 *   />
 *   Tous passent par `state.report` : ils ne partent que du niveau de la leçon. Une formule seule (ou
 *   mode="model") ne compare rien ; un budget sans nombre entier d'unités, deux formules identiques ou un
 *   montant négatif sont des erreurs de contenu (le rendu échoue). Sur l'autre niveau (préréglage de
 *   levels.js) seuls `plans` et `mode` valent ; le monde reste celui de `theme`.
 *
 * ── LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1) ───────────────────────────────────────────────
 * A. L'élève PORTE les deux montants de la formule dans la facture (« يُدفع مرّة واحدة » / « عند كل وحدة
 *    × x »), ÉTIRE x sur l'axe des unités (glisser, toucher la piste, flèches, −/+), POSE une marque dans
 *    le plan (glisser, flèches + Entrée), PEINT des intervalles de l'axe des x d'une couleur de formule.
 * B. Idée : un coût « partie fixe + partie par unité » est une fonction affine f(x) = ax + b ; deux tarifs
 *    se comparent par l'équation f(x) = g(x) (le croisement des droites) et l'inéquation f(x) < g(x)
 *    (de quel côté du croisement) — la meilleure formule DÉPEND de x.
 * C. La facture écrit f(x) = □x + □ à chaque montant posé ; x glisse : les barres (le forfait puis x
 *    blocs) s'allongent ET le point de chaque droite monte, ensemble ; la marque montre l'écart des coûts ;
 *    l'axe se colore.
 * D. f(x) = 200x + 2000 ; f(7) = 3400 ; 200x + 2000 = 4800 → x = 14 ; f(x) = g(x) → x = 10 ;
 *    f(x) < g(x) ⇔ x > 10 ; « قبل 10 مقابلات التذكرة أرخص، وبعدها الاشتراك ».
 * E. À découvrir avant la règle : le forfait ne se paie qu'une fois (la droite part de b, pas de O) ; la
 *    formule la moins chère CHANGE au croisement — ni « toujours le plus petit prix unitaire », ni
 *    « toujours le plus petit forfait ».
 *
 * ── FICHE (MANIPULATION_DNA §7) ─────────────────────────────────────────────────────────────────
 *   CONCEPT        ترييض par une fonction affine ; المفاضلة بين صيغتين (équation, inéquation, graphique)
 *   OBJECT         la facture d'un supporter / d'une salle de jeux / d'une location ; les barres de coût ; les
 *                  droites ; une marque ; l'axe des x qu'on peint
 *   VARIABLE       modèle : OÙ va chaque montant ; puis x (unités, entier) ; la position (x ; y) de la marque ;
 *                  la couleur de chaque intervalle
 *   INVARIANT      la partie fixe (une seule fois, quelle que soit x) ; le prix d'une unité (chaque bloc a la
 *                  même longueur — la pente) ; au croisement, les deux coûts sont le même nombre
 *   TRANSFORMATION barres et points bougent avec x ; l'ordre des barres s'inverse en passant le croisement
 *   CONSTRAINT     x entier de 0 à xMax ; le modèle accepté ne bouge plus ; la peinture attend la marque
 *   RESISTANCE     « تحقّق » refuse le forfait payé x fois (MISC-TARRID-JUZ-THABIT) avec le coût que la
 *                  facture de l'élève donnerait (2000 × 7 + 200 = 14200 au lieu de 3400) ; la marque hors
 *                  croisement est refusée avec les deux coûts ; une couleur fausse est refusée avec un essai
 *                  de l'élève comme témoin (MISC-TARRID-AFDAL-DAIMAN) ; « لا تتساويان » refusé quand l'ordre
 *                  s'inverse entre 0 et xMax
 *   EVIDENCE       les barres égales et les droites qui se coupent ; l'axe peint en deux couleurs
 *   CONTRAST       des essais de la comparaison des deux côtés du croisement (logic.contrastOk)
 *   PREDICTION     « qui est moins cher à 0 match ? à 20 ? » se lit sur les forfaits et les prix unitaires
 *                  avant de glisser
 *   DISCOVERY      la meilleure formule dépend de x, elle change au croisement — les distracteurs « toujours »
 *                  sont réfutés par les propres essais de l'élève
 *   FORMALIZATION  f(x) = ax + b ; f(x) = g(x) résolue ; f(x) < g(x) résolue ; la phrase de choix
 *   TRANSFER       les forfaits téléphone, les applications de taxi, la salle de sport (أوظّف) ; la plage
 *                  de la synthèse (vélo / kayak, jusqu'à trois formules)
 *
 * QUESTIONS PENDANT LE LABO (2026-10-28, lot 5) : à la fin de chaque étape (`L.stepsOf` : build · slide · mark · paint, selon `mode`) une suite de
 * questions se pose PAR-DESSUS le labo (`CHAINS`) et retient la suite (« إلى المقارنة » attend la fin de `slide`) ; la dernière étape finit par LA RÈGLE.
 * Étapes `LabStepper` (`[data-pc-step=<i>]`) + fête ; « إعادة » repart de zéro ; obligatoires pour tout élève, coupées par l'enseignant pour SON
 * compte (`useLabCheckpointSettings`) ; `checkpoints` = false les coupe aussi ; `onCheckpoint(ev)` : la trace pour les étapes du module.
 *
 * AUTO-COMPLÉTION : MANUELLE (§6bis) — chaque montant posé est une décision de modélisation, chaque marque
 * et chaque couleur une réponse.
 *
 * DÉCOR (exigence du propriétaire) — sans information, sans état du lab : des supporters dans une tribune qui
 * agitent leur drapeau (stadium), une salle de jeux dont les écrans clignotent et dont la minuterie marque
 * l'heure (gaming), la plage où un kayak tangue et une vague passe (rental). `aria-hidden`, `tabIndex={-1}`,
 * `[data-deco]`, immobile sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (MANIPULATION_CONTRACT §8bis) : `[data-pc-glance]` = le plan, sa piste x, la facture /
 * les barres, les commandes et la lecture. La hauteur du plan vient de l'écran de leçon (`useLessonViewport`)
 * moins la colonne de commandes MESURÉE (téléphone) ; large (≥ 640 px) : plan et commandes côte à côte.
 * Les commandes changent avec l'étape (construire, glisser, marquer, peindre) au lieu de s'empiler. Le
 * secondaire (les essais) est dans un `LabFold` sous la manipulation.
 *
 * CONTRAT DOM (e2e) :
 *   [data-plan-compare][data-stage=model|compare][data-step=build|slide|mark|paint][data-theme][data-plans][data-x][data-layout]
 *   [data-pc-glance]  [data-pc-plane][data-w][data-h]  [data-pc-line=<A|B|C>]  [data-pc-cursor]
 *   [data-drag-source="chip:fixed|unit"]  [data-drop-zone="slot:once|slot:each"]  [data-pc-check]  [data-pc-verdict=ok|ko]
 *   [data-pc-issue=<reason>]  [data-pc-strip] [data-stretch-handle]  [data-pc-less] [data-pc-more]  [data-pc-bar=<A|B|C>][data-cost]
 *   [data-pc-target=<i>][data-done]  [data-pc-open-compare]  [data-pc-back]  [data-pc-pin][data-x][data-y]
 *   [data-pc-move=left|right|up|down]  [data-pc-place]  [data-pc-nocross]  [data-pc-mark][data-ok]
 *   [data-pc-brush=<A|B|C>][aria-pressed]  [data-pc-seg=<i>][data-painted]  [data-pc-band=<i>]
 *   [data-pc-notice=<kind>]  [data-pc-formal]  [data-pc-trials]  [data-deco=<theme>]
 */
const STRIP = 44;
const TITLE_H = 18;
const LETTERS = ['أ', 'ب', 'جـ'];

export default function PlanCompare({
  plans: plans0 = '200x+2000|400x', mode: mode0 = 'model|compare', ask, xMax, yMax, theme: theme0 = 'stadium',
  title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false,
  onFinished, onTrial, onModel, onCheckpoint,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.planCompare.${key}`, o), [t]);
  const theme = L.THEMES.includes(theme0) ? theme0 : 'stadium';
  const tw = useCallback((key, o) => t(`manipulation.planCompare.themes.${theme}.${key}`, o), [t, theme]);
  const state = useManipulation({ type: 'plan-compare', initialNumbers: { plans: plans0, mode: mode0 }, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { plans, mode } = state.numbers;
  const authored = state.isAuthoredLevel;
  const make = () => L.init({ plans, mode, ...(authored ? { ask, xMax, yMax } : {}) });
  const [lab, setLab] = useState(make);
  const sceneKey = `${plans}|${mode}|${state.epoch}|${state.resetCount}|${authored}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [cleared, setCleared] = useState([]);   // les étapes dont la suite de questions est finie
  const [liveX, setLiveX] = useState(null);
  // Un x PAR DÉFAUT, ni essai ni réponse (2026-10-09).
  const [x, setX] = useState(() => L.defaultX(lab));
  const [pin, setPin] = useState(null);
  const [pinDrag, setPinDrag] = useState(false);
  const [shake, setShake] = useState(0);
  // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la facture, les essais, les marques et les questions du labo
  if (scene.key !== sceneKey) {
    setScene({ key: sceneKey, inits: scene.inits + 1 }); { const fresh = make(); setLab(fresh); setX(L.defaultX(fresh)); } setLiveX(null); setPin(null); setPinDrag(false); setCleared([]);
  }

  const { win, grid, env } = lab;
  const P = lab.plans;
  const compare = lab.stage === 'compare';
  const step = !lab.accepted ? 'build' : !compare ? 'slide' : L.marksDone(lab) ? 'paint' : 'mark';
  const shown = compare ? P.map((p) => p.index) : [0];

  /* ── découverte et règle formelle ── */
  const ready = L.discoveryReady(lab);
  const cpSettings = useLabCheckpointSettings('plan-compare');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpLive = cpOn && cpSettings.enabled;
  const steps = L.stepsOf(lab);
  const ruleStep = steps[steps.length - 1];
  const active = cpLive ? steps.find((st) => !cleared.includes(st)) ?? null : null;
  const reachedActive = !!active && L.stepReached(lab, active);
  const cp = useLabCheckpoint({
    id: active,
    questions: reachedActive ? chainOf(lab, active).map((q) => QUESTIONS[q](lab, k, tw)) : null,
    reached: reachedActive,
    resetKey: scene.inits,
    onRetry: () => { const fresh = L.restartStep(lab, active, make()); setLab(fresh); if (active === 'build') setX(L.defaultX(fresh)); setLiveX(null); setPin(null); },
    onEvent: (ev) => state.report(onCheckpoint, ev),   // {tk:'checkpoint'|'checkpoint-done', id: étape, …} — la TRACE que les étapes du module relisent
    onDone: (id) => {
      setCleared((c) => (c.includes(id) ? c : [...c, id]));
      if (id === ruleStep) { state.discover(); state.formalize(); }
    },
  });
  const blockedRef = useRef(false);
  blockedRef.current = cp.blocking;
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
  // le son du GESTE (muet sans « الصوت ») : « tooth » un x, « bell » une marque ou une couleur juste, « flag » le modèle accepté, « over » un refus
  useEffect(() => {
    const kd = lab.last?.kind;
    if (!kd) return;
    if (kd === 'modelOk' || kd === 'noCrossOk') playSfx('flag');
    else if (kd === 'cross' || kd === 'paintOk') playSfx('bell');
    else if (kd === 'trial' || kd === 'crossAbove') playSfx('tooth');
    else if (['modelKo', 'offLine', 'unequal', 'noCrossKo', 'paintKo', 'noBrush'].includes(kd)) playSfx('over');
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps
  const kind = L.discoveryKind(lab);
  useEffect(() => {
    if (!state.isFormal) return;
    const b = env.breaks[0];
    state.report(onFinished, { kind, x: b ? L.numText(b.x) : null, before: b ? P[b.before].id : null, after: b ? P[b.after].id : null });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = (next, report) => {
    setLab(next);
    if (report) state.report(onTrial, report);
  };

  /* ── mesure : la largeur de la scène et la HAUTEUR de l'écran de leçon ── */
  const boxRef = useRef(null);
  const sideRef = useRef(null);
  const [width, setWidth] = useState(720);
  const [sideH, setSideH] = useState(240);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(200, Math.floor(el.clientWidth)));
      if (sideRef.current) setSideH(Math.ceil(sideRef.current.getBoundingClientRect().height));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (sideRef.current) ro.observe(sideRef.current);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 576;
  const budget = Math.max(340, screenH - 8);
  const wide = width >= 640;
  const HEAD = 40;
  const planeW = wide ? Math.floor((width - 12) * 0.58) : width;
  const stripOn = wide || lab.accepted;
  const titlesH = wide ? 2 * TITLE_H : TITLE_H;
  // le bloc « glance » = l'en-tête (HEAD) + 8 + [plan : titres + plan + piste] + 8 + [commandes] (pile, téléphone)
  const availH = Math.max(wide ? 150 : 120, (wide ? budget - 8 : budget - sideH - 8) - HEAD - 8 - titlesH - (stripOn ? STRIP : 0) - 2);
  const geo = useMemo(() => L.planeGeometry({ win, width: planeW, height: Math.min(availH, wide ? 560 : 420) }), [win, planeW, availH, wide]);
  const W = Math.round(geo.W);
  const H = Math.round(geo.H);
  const layout = wide ? 'side' : 'stack';

  /* ── x : la piste sous le plan (useStretchInteraction) ── */
  const xr = { min: 0, max: win.xMax };
  const xx = Math.max(0, Math.min(win.xMax, liveX ?? x));
  const commitX = (v) => {
    if (blockedRef.current) { setLiveX(null); return; }
    setLiveX(null); setX(v);
    if (!lab.accepted) return;
    const next = L.commitX(lab, v);
    const tr = next.trials[next.trials.length - 1];
    apply(next, { kind: 'x', x: v, stage: lab.stage, costs: tr.costs.map(L.numText), cheapest: tr.cheapest.map((i) => P[i].id) });
  };
  // Miroir synchrone de `lab` pour « جرّب كل الإمكانيات » : un x validé par pas, comme la main.
  const labRef = useRef(lab);
  labRef.current = lab;
  const sweepX = (v) => {
    const prev = labRef.current;
    const next = L.commitX(prev, v);
    labRef.current = next;
    setX(v); setLiveX(null);
    setLab((s) => L.commitX(s, v));
    const tr = next.trials[next.trials.length - 1];
    if (tr) state.report(onTrial, { kind: 'x', x: v, stage: prev.stage, costs: tr.costs.map(L.numText), cheapest: tr.cheapest.map((i) => P[i].id) });
  };
  const untriedX = L.untriedXs(lab);
  const sx = useStretchInteraction({
    value: lab.accepted ? xx : null, range: xr, direction: 'ltr',
    toValue: useCallback((cx, _cy, rect) => geo.fromPx(cx - rect.left, 0).x, [geo]),
    onChange: (v) => lab.accepted && !blockedRef.current && setLiveX(v),
    onCommit: (v) => lab.accepted && commitX(v),
  });

  /* ── construire : porter les montants (useDragInteraction) ── */
  const drag = useDragInteraction({
    accepts: (src, zone) => (src.startsWith('chip:') && (zone === 'slot:once' || zone === 'slot:each' || zone === 'reserve') ? true : ''),
    onDrop: (src, zone) => {
      if (blockedRef.current) return;
      const chip = src.slice(5);
      setLab((s) => (zone === 'reserve' ? L.takeBack(s, chip) : L.place(s, chip, zone.slice(5))));
    },
  });
  const swallow = useRef(false);
  const verify = () => {
    const next = L.check(lab);
    const v = next.verdict;
    apply(next, { kind: 'model', ok: v.ok, tex: v.tex, x: L.numText(v.x), mine: L.numText(v.mine), story: L.numText(v.story) });
    if (v.ok) state.report(onModel, { tex: `f(x) = ${v.tex}` });
    else setShake((n) => n + 1);
  };

  /* ── marquer : la marque dans le plan (glisser, flèches + Entrée, boutons) ── */
  const xi = L.indexRange(0, win.xMax, grid.dx);
  const yi = L.indexRange(0, win.yMax, grid.dy);
  const clampI = (i) => Math.max(xi.min, Math.min(xi.max, i));
  const clampJ = (j) => Math.max(yi.min, Math.min(yi.max, j));
  const startPin = () => {
    const i = clampI(Math.round((win.xMax * 0.3) / L.toNumber(grid.dx)));
    let j = clampJ(Math.round((win.yMax * 0.5) / L.toNumber(grid.dy)));
    if (L.judgePin(lab, L.valueAt(i, grid.dx), L.valueAt(j, grid.dy)).ok) j = clampJ(j + 1);
    return { i, j };
  };
  const curPin = pin ?? (step === 'mark' ? startPin() : null);
  const pinRef = useRef(curPin);
  pinRef.current = curPin;
  const pinX = curPin ? L.valueAt(curPin.i, grid.dx) : null;
  const pinY = curPin ? L.valueAt(curPin.j, grid.dy) : null;
  const placeMark = (p = pinRef.current) => {
    if (!p || blockedRef.current) return;
    const mx = L.valueAt(p.i, grid.dx); const my = L.valueAt(p.j, grid.dy);
    const next = L.placeMark(lab, mx, my);
    if (!next.last.ok) setShake((n) => n + 1);
    apply(next, { kind: 'mark', ok: next.last.ok, x: L.numText(mx), y: L.numText(my), pair: next.last.pair ? next.last.pair.map((i) => P[i].id) : null });
  };
  const movePin = (di, dj) => setPin((p) => { const c = p ?? startPin(); return { i: clampI(c.i + di), j: clampJ(c.j + dj) }; });
  const onPinKey = (e) => {
    const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (m) { e.preventDefault(); movePin(...m); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); placeMark(); }
  };
  const planeRef = useRef(null);
  const pinAt = (e) => {
    const r = planeRef.current.getBoundingClientRect();
    const v = geo.fromPx(e.clientX - r.left, e.clientY - r.top);
    return { i: clampI(L.indexOf(v.x, grid.dx)), j: clampJ(L.indexOf(v.y, grid.dy)) };
  };
  const onPlaneDown = (e) => {
    if (step !== 'mark' || e.button > 0 || !planeRef.current || blockedRef.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setPinDrag(true); setPin(pinAt(e));
  };
  const onPlaneMove = (e) => { if (pinDrag) setPin(pinAt(e)); };
  const onPlaneUp = (e) => {
    if (!pinDrag) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setPinDrag(false);
    const p = pinAt(e);
    setPin(p);
    placeMark(p);
  };
  const claimNoCross = () => {
    if (blockedRef.current) return;
    const next = L.claimNoCross(lab);
    apply(next, { kind: 'noCross', ok: next.last.kind === 'noCrossOk' });
  };

  /* ── peindre : la couleur de chaque intervalle ── */
  const paintSeg = (i) => {
    if (blockedRef.current) return;
    if (lab.brush == null) { setLab((s) => ({ ...s, last: { kind: 'noBrush' } })); return; }
    const next = L.paint(lab, i);
    apply(next, { kind: 'paint', ok: next.last.kind === 'paintOk', seg: i, plan: P[lab.brush].id });
  };

  /* ── les mots ── */
  const planName = (i) => k('planName', { letter: LETTERS[i] });
  const units = (n) => tw('units', { count: n });
  const desc = (i) => {
    const { a, b } = P[i].f;
    const A = L.numText(a); const B = L.numText(b);
    if (L.eq(b, L.frac(0))) return tw('descUnit', { a: A });
    if (L.eq(a, L.frac(0))) return tw('descFixed', { b: B });
    return tw('descBoth', { a: A, b: B });
  };
  const chipText = (chip) => (chip === 'fixed' ? tw('fixedChip', { v: L.numText(P[0].f.b) }) : tw('unitChip', { v: L.numText(P[0].f.a) }));
  const missionText = compare ? k('missionCompare', { unitWord: tw('unitWord') }) : (mission ?? tw('missionModel'));
  const hints = (compare ? [k('hintC1'), k('hintC2'), k('hintC3')] : [tw('hintM1'), k('hintM2'), k('hintM3')]).map((h) => <MathText key={h}>{h}</MathText>);
  const notice = noticeOf(lab, { k, tw, planName, units, chipText });
  const targets = L.asksDone(lab);

  /* ── la découverte : les « toujours » réfutés par les essais de l'élève ── */
  const discoveryOptions = useMemo(() => discoveryFor(lab, { k, tw, planName, units }), [lab, k, tw]); // eslint-disable-line react-hooks/exhaustive-deps
  const formal = <Formal lab={lab} k={k} tw={tw} planName={planName} units={units} />;

  /* ── le dessin du plan ── */
  const xTicks = L.ticks(win.xMax, grid.xStep);
  const yTicks = L.ticks(win.yMax, grid.yStep);
  const labelEveryX = Math.max(1, Math.ceil(24 / (geo.ux * L.toNumber(grid.xStep))));
  const labelEveryY = Math.max(1, Math.ceil(16 / (geo.uy * L.toNumber(grid.yStep))));
  const N = (p) => L.toNumber(p);
  const costs = L.costsAt(lab, xx);
  const showCursor = lab.accepted;

  const plane = (
    <div dir="ltr" className="mx-auto w-max max-w-full" data-pc-planeblock>
      {wide && (
        <div className="relative" style={{ height: TITLE_H, width: W }}>
          <span dir="rtl" className="absolute top-0 truncate whitespace-nowrap text-[11px] font-bold text-slate-600" style={{ left: 4, maxWidth: W - 8 }} data-pc-axis="y">{tw('yAxis')}</span>
        </div>
      )}
      <div
        ref={planeRef}
        className={`relative rounded-lg border border-slate-200 bg-white ${step === 'mark' ? 'cursor-crosshair' : ''}`}
        style={{ width: W, height: H, touchAction: step === 'mark' ? 'none' : 'auto' }}
        onPointerDown={onPlaneDown} onPointerMove={onPlaneMove} onPointerUp={onPlaneUp} onPointerCancel={onPlaneUp}
        role="group" aria-label={k('planeAria', { unitWord: tw('unitWord') })}
        data-pc-plane data-w={W} data-h={H}
      >
        <svg width={W} height={H} className="absolute inset-0" aria-hidden="true" focusable="false">
          <style>{PC_CSS}</style>
          {xTicks.map((v) => <line key={`gx${L.numText(v)}`} x1={geo.px(N(v))} x2={geo.px(N(v))} y1={geo.py(win.yMax)} y2={geo.py(0)} stroke="#E2E8F0" />)}
          {yTicks.map((v) => <line key={`gy${L.numText(v)}`} x1={geo.px(0)} x2={geo.px(win.xMax)} y1={geo.py(N(v))} y2={geo.py(N(v))} stroke="#E2E8F0" />)}
          {/* l'axe peint : la formule la moins chère sur chaque intervalle */}
          {compare && L.marksDone(lab) && env.segments.map((seg) => {
            const painted = lab.painted[seg.index];
            return (
              <rect key={`band${seg.index}`} x={geo.px(N(seg.from))} y={geo.py(0) - 9} width={Math.max(1, geo.px(N(seg.to)) - geo.px(N(seg.from)))} height={9}
                fill={painted != null ? L.COLORS[painted] : 'url(#pc-hatch)'} opacity={painted != null ? 0.85 : 1} data-pc-band={seg.index} />
            );
          })}
          <defs>
            <pattern id="pc-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" fill="#F1F5F9" /><line x1="0" y1="0" x2="0" y2="6" stroke="#CBD5E1" strokeWidth="2" />
            </pattern>
          </defs>
          {/* axes */}
          <line x1={geo.px(0)} x2={geo.px(win.xMax) + 6} y1={geo.py(0)} y2={geo.py(0)} stroke="#334155" strokeWidth={1.6} />
          <path d={`M${geo.px(win.xMax) + 8} ${geo.py(0)} l-7 -4 v8 z`} fill="#334155" />
          <line x1={geo.px(0)} x2={geo.px(0)} y1={geo.py(0)} y2={geo.py(win.yMax) - 6} stroke="#334155" strokeWidth={1.6} />
          <path d={`M${geo.px(0)} ${geo.py(win.yMax) - 8} l-4 7 h8 z`} fill="#334155" />
          {xTicks.map((v) => {
            const n = Math.round(N(v) / N(grid.xStep));
            if (n % labelEveryX !== 0) return null;
            return <text key={`tx${n}`} x={geo.px(N(v))} y={geo.py(0) + 13} textAnchor="middle" fontSize={10} fill="#475569" fontFamily="ui-monospace, monospace">{L.numText(v)}</text>;
          })}
          {yTicks.map((v) => {
            const n = Math.round(N(v) / N(grid.yStep));
            if (n === 0 || n % labelEveryY !== 0) return null;
            return <text key={`ty${n}`} x={geo.px(0) - 4} y={geo.py(N(v)) + 3.5} textAnchor="end" fontSize={10} fill="#475569" fontFamily="ui-monospace, monospace">{L.numText(v)}</text>;
          })}
          {/* les budgets demandés (cibles y) */}
          {!compare && lab.asks.filter((q) => q.axis === 'y').map((q) => (
            <g key={`bud${L.numText(q.v)}`} data-pc-budget={L.numText(q.v)}>
              <line x1={geo.px(0)} x2={geo.px(win.xMax)} y1={geo.py(N(q.v))} y2={geo.py(N(q.v))} stroke="#D97706" strokeWidth={1.6} strokeDasharray="6 4" />
              <text x={geo.px(win.xMax) - 2} y={geo.py(N(q.v)) - 4} textAnchor="end" fontSize={10} fontWeight="bold" fill="#B45309" fontFamily="ui-monospace, monospace">{L.numText(q.v)}</text>
            </g>
          ))}
          {/* les droites des formules */}
          {lab.accepted && shown.map((i) => {
            const seg = L.lineSegment(P[i].f, win);
            if (!seg) return null;
            return (
              <line key={`l${i}`} x1={geo.px(seg[0][0])} y1={geo.py(seg[0][1])} x2={geo.px(seg[1][0])} y2={geo.py(seg[1][1])}
                stroke={L.COLORS[i]} strokeWidth={2.6} strokeLinecap="round" data-pc-line={P[i].id} />
            );
          })}
          {/* le curseur x : les points de chaque droite, avec les barres */}
          {showCursor && (
            <g data-pc-cursor={xx}>
              <line x1={geo.px(xx)} x2={geo.px(xx)} y1={geo.py(0)} y2={geo.py(win.yMax)} stroke="#64748B" strokeWidth={1.2} strokeDasharray="4 4" />
              {shown.map((i) => (N(costs[i]) <= win.yMax ? <circle key={`c${i}`} cx={geo.px(xx)} cy={geo.py(N(costs[i]))} r={5} fill={L.COLORS[i]} stroke="#fff" strokeWidth={1.5} /> : null))}
            </g>
          )}
          {/* les marques acceptées */}
          {lab.marks.map((m) => (
            <g key={`m${L.numText(m.x)}:${L.numText(m.y)}`} transform={`translate(${geo.px(N(m.x))} ${geo.py(N(m.y))})`} data-pc-mark={`(${L.numText(m.x)} ; ${L.numText(m.y)})`} data-ok="true">
              <path d="M0 -8 L8 0 L0 8 L-8 0 Z" fill="#F59E0B" stroke="#78350F" strokeWidth={1.4} />
            </g>
          ))}
          {/* la dernière marque refusée */}
          {lab.last && (lab.last.kind === 'unequal' || lab.last.kind === 'offLine') && (
            <g transform={`translate(${geo.px(N(lab.last.x))} ${geo.py(N(lab.last.y))})`} data-pc-mark-refused>
              <g key={`r${shake}`} className="pc-shake">
                <path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke="#E11D48" strokeWidth={2.4} strokeLinecap="round" />
              </g>
              {lab.last.kind === 'unequal' && lab.plans.length === 2 && (
                <line x1={0} x2={0} y1={geo.py(N(lab.last.costs[0])) - geo.py(N(lab.last.y))} y2={geo.py(N(lab.last.costs[1])) - geo.py(N(lab.last.y))} stroke="#E11D48" strokeWidth={2} strokeDasharray="3 3" />
              )}
            </g>
          )}
        </svg>
        {!wide && <span dir="rtl" className="pointer-events-none absolute top-0.5 rounded bg-white/85 px-1 text-[10px] font-bold text-slate-600" style={{ left: geo.px(0) + 4 }} data-pc-axis="y">{tw('yAxis')}</span>}
        {/* la marque (clavier : flèches + Entrée) */}
        {step === 'mark' && curPin && (
          <button type="button" onKeyDown={onPinKey}
            aria-label={k('pinAria', { x: L.numText(pinX), y: L.numText(pinY) })}
            className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${pinDrag ? 'bg-amber-500/10' : ''}`}
            style={{ left: geo.px(N(pinX)), top: geo.py(N(pinY)), cursor: pinDrag ? 'grabbing' : 'grab' }}
            data-pc-pin={`(${L.numText(pinX)} ; ${L.numText(pinY)})`} data-x={L.numText(pinX)} data-y={L.numText(pinY)}>
            <Flag className="h-6 w-6 -translate-y-2 text-amber-600" aria-hidden="true" fill="#FDE68A" />
          </button>
        )}
        {/* peindre : toucher un intervalle de l'axe */}
        {step === 'paint' && env.segments.map((seg) => (
          <button key={`ov${seg.index}`} type="button" tabIndex={-1} aria-hidden="true" onClick={() => paintSeg(seg.index)}
            className="absolute bottom-0 h-11 rounded-md hover:bg-slate-900/5"
            style={{ left: geo.px(N(seg.from)), width: Math.max(8, geo.px(N(seg.to)) - geo.px(N(seg.from))), bottom: H - geo.py(0) - 22 }} data-pc-band-touch={seg.index} />
        ))}
      </div>
      {/* la piste x : glisser, toucher, flèches */}
      {stripOn && <div {...(lab.accepted ? sx.trackProps : {})} className={`relative ${lab.accepted ? '' : 'opacity-40'}`}
        style={{ ...(lab.accepted ? sx.trackProps.style : {}), width: W, height: STRIP }} data-pc-strip data-disabled={lab.accepted ? undefined : 'true'}>
        <div className="absolute rounded-full bg-slate-500/30" style={{ top: STRIP / 2 - 2, left: geo.px(0), width: geo.px(win.xMax) - geo.px(0), height: 4 }} />
        {lab.accepted && (
          <div {...sx.handleProps({ label: k('xHandle', { unitWord: tw('unitWord') }), valueText: units(xx) })}
            className={`absolute z-10 flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 border-slate-700 bg-white px-1 outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${sx.dragging ? 'shadow-md' : ''}`}
            style={{ left: geo.px(xx), top: STRIP / 2, transform: 'translate(-50%, -50%)', cursor: sx.dragging ? 'grabbing' : 'grab' }} data-pc-x={xx}>
            <span className="whitespace-nowrap font-mono text-xs font-extrabold text-slate-800">x = {xx}</span>
          </div>
        )}
      </div>}
      <div className="relative" style={{ height: TITLE_H, width: W }}>
        <span dir="rtl" className="absolute top-0 max-w-full truncate whitespace-nowrap text-[11px] font-bold text-slate-600" style={{ right: 4 }} data-pc-axis="x">{tw('xAxis')}</span>
      </div>
    </div>
  );

  /* ── la facture (construire) ── */
  const slotZone = (slot) => {
    const chip = lab.slots[slot];
    const issue = lab.verdict && !lab.verdict.ok ? lab.verdict.issues.find((is) => is.chip === chip) : null;
    return (
      <DropZone drag={drag} id={`slot:${slot}`} tone={slot === 'once' ? 'indigo' : 'amber'} minHeight="min-h-[52px]"
        label={k(slot === 'once' ? 'slotOnceAria' : 'slotEachAria', { unitWord: tw('unitWord') })}
        className={`flex flex-col items-start gap-1 px-2 py-1 ${issue ? '!border-solid !border-rose-500 ring-4 ring-rose-200' : ''}`}
        data-pc-slot={slot} data-filled={chip ?? ''} data-issue={issue?.reason}>
        <span className="shrink-0 text-xs font-bold text-slate-700">{slot === 'once' ? k('slotOnce') : tw('slotEach')}</span>
        {chip ? (
          // toucher-toucher sur une case couverte : un autre montant en main se pose dans CETTE case
          <span className={issue ? 'pc-shake' : ''} key={issue ? `s${shake}` : 'ok'}
            onPointerDownCapture={(e) => { if (drag.held && drag.held !== `chip:${chip}`) { e.stopPropagation(); e.preventDefault(); swallow.current = true; drag.dropHere(`slot:${slot}`); } }}
            onPointerUpCapture={(e) => { if (swallow.current) e.stopPropagation(); }}
            onClickCapture={(e) => {
              if (swallow.current) { swallow.current = false; e.stopPropagation(); e.preventDefault(); return; }
              if (drag.held && drag.held !== `chip:${chip}`) { e.stopPropagation(); e.preventDefault(); drag.dropHere(`slot:${slot}`); }
            }}
            onKeyDownCapture={(e) => { if ((e.key === 'Enter' || e.key === ' ') && drag.held && drag.held !== `chip:${chip}`) { e.stopPropagation(); e.preventDefault(); drag.dropHere(`slot:${slot}`); } }}>
            <DraggableObject drag={drag} id={`chip:${chip}`} label={chipText(chip)}
              className={`min-h-[44px] rounded-xl border-2 px-2 text-xs font-extrabold shadow-sm ${chip === 'fixed' ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-amber-500 bg-amber-50 text-amber-900'}`}>
              {chipText(chip)}{slot === 'each' && <span dir="ltr" className="ms-1 font-mono">× x</span>}
            </DraggableObject>
          </span>
        ) : <span className="text-[11px] leading-tight text-slate-400">{k('slotEmpty')}</span>}
      </DropZone>
    );
  };
  const built = L.builtLin(lab);
  const buildPanel = (
    <div className="space-y-2" data-pc-build>
      <p className={`text-sm font-bold text-slate-800 ${wide ? '' : 'hidden'}`} data-pc-story>{tw(L.eq(P[0].f.b, L.frac(0)) ? 'storyUnit' : L.eq(P[0].f.a, L.frac(0)) ? 'storyFixed' : 'story', { b: L.numText(P[0].f.b), a: L.numText(P[0].f.a) })}</p>
      {L.reserve(lab).length > 0 && <DropZone drag={drag} id="reserve" tone="slate" minHeight="min-h-[52px]" label={k('reserveAria')}
        className="flex flex-wrap items-center gap-2 px-2 py-1" data-pc-reserve>
        {wide && <span className="text-xs font-bold text-slate-600">{k('reserve')}</span>}
        {L.reserve(lab).map((chip) => (
          <DraggableObject key={chip} drag={drag} id={`chip:${chip}`} label={chipText(chip)}
            className={`min-h-[44px] rounded-xl border-2 px-2 text-xs font-extrabold shadow-sm ${chip === 'fixed' ? 'border-indigo-500 bg-white text-indigo-900' : 'border-amber-500 bg-white text-amber-900'}`}>
            {chipText(chip)}
          </DraggableObject>
        ))}
      </DropZone>}
      <div className="grid grid-cols-2 gap-2">
        {slotZone('once')}
        {slotZone('each')}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <p dir="ltr" className="rounded-lg bg-white px-2 py-1 font-mono text-sm" data-pc-built><MathText>{`$f(x) = ${L.linTex(built)}$`}</MathText></p>
        <button type="button" onClick={verify} data-pc-check
          className="ms-auto inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-indigo-600 px-3 text-sm font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> {k('check')}
        </button>
      </div>
    </div>
  );

  /* ── les barres : le forfait, puis x blocs du prix d'une unité ── */
  const bars = (
    <div className={wide ? 'space-y-1.5' : 'space-y-1'} data-pc-bars>
      {shown.map((i) => {
        const { a, b } = P[i].f;
        const fixedPct = Math.min(100, (N(b) / win.yMax) * 100);
        const unitPct = (N(a) / win.yMax) * 100;
        const blocks = xx <= 30 ? xx : 0;
        const total = N(costs[i]);
        const cheapest = compare && L.cheapest(lab, xx).includes(i);
        return (
          <div key={`bar${i}`} className="grid items-center gap-1.5" style={{ gridTemplateColumns: '2.4rem 1fr auto' }} data-pc-bar={P[i].id} data-cost={L.numText(costs[i])}>
            <span className="rounded-md px-1 text-center text-xs font-extrabold text-white" style={{ background: L.COLORS[i] }} title={desc(i)}>{LETTERS[i]}</span>
            <div dir="ltr" className={`relative flex ${wide ? 'h-6' : 'h-5'} overflow-hidden rounded-md bg-slate-100`} aria-hidden="true">
              {N(b) > 0 && <span className="h-full shrink-0" style={{ width: `${fixedPct}%`, background: L.COLORS[i], opacity: 0.9, backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,.28) 0 4px, transparent 4px 8px)' }} />}
              {blocks > 0
                ? Array.from({ length: blocks }, (_, n) => <span key={n} className="h-full shrink-0 border-e border-white" style={{ width: `${unitPct}%`, background: L.COLORS[i], opacity: 0.5 }} />)
                : xx > 0 && <span className="h-full shrink-0" style={{ width: `${Math.min(100 - fixedPct, unitPct * xx)}%`, background: L.COLORS[i], opacity: 0.5 }} />}
            </div>
            <span dir="ltr" className={`min-w-[4.5rem] text-end font-mono text-xs font-extrabold ${cheapest ? 'text-emerald-700' : 'text-slate-800'}`}>{L.numText(costs[i])} DA{total > win.yMax ? ' …' : ''}</span>
          </div>
        );
      })}
    </div>
  );

  const xButtons = (
    <span dir="ltr" className="inline-flex gap-1">
      <button type="button" onClick={() => sx.nudge(-1)} aria-label={k('lessX')} disabled={xx <= 0} data-pc-less
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Minus className="h-5 w-5" aria-hidden="true" /></button>
      <button type="button" onClick={() => sx.nudge(1)} aria-label={k('moreX')} disabled={xx >= win.xMax} data-pc-more
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Plus className="h-5 w-5" aria-hidden="true" /></button>
    </span>
  );

  const slidePanel = (
    <div className="space-y-2" data-pc-slide>
      <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-800">
        {xButtons}
        <span>{units(xx)}</span>
        {compare && lab.modes.includes('model') && (
          <button type="button" onClick={() => setLab(L.backToModel)} data-pc-back aria-label={k('backToModel')} title={k('backToModel')}
            className="ms-auto inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 border-slate-300 bg-white px-2 text-xs font-bold text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <ArrowRight className="h-4 w-4" aria-hidden="true" /> {wide ? k('backToModel') : null}
          </button>
        )}
      </div>
      {bars}
      {!compare && (
        <p dir="ltr" className="text-start text-sm" data-pc-reading><MathText>{`$${L.costTex(lab, 0, xx)}$`}</MathText></p>
      )}
      {lab.asks.length > 0 && !compare && (
        <ul className="flex flex-wrap gap-1.5" aria-label={k('targetsTitle')}>
          {lab.asks.map((q, i) => (
            <li key={`${q.axis}${L.numText(q.v)}`} data-pc-target={i} data-done={targets[i] ? 'true' : 'false'}
              className={`rounded-lg border-2 px-2 py-0.5 text-xs font-bold ${targets[i] ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : 'border-slate-300 bg-white text-slate-700'}`}>
              {targets[i] ? '✓ ' : '○ '}{q.axis === 'x' ? tw('targetX', { u: units(L.toNumber(q.v)) }) : tw('targetY', { m: L.numText(q.v) })}
            </li>
          ))}
        </ul>
      )}
      {!compare && L.canCompare(lab) && !cp.blocking && (!cpLive || cleared.includes('slide')) && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-emerald-300 bg-emerald-50 px-2 py-1.5" data-pc-next>
          <p className="min-w-0 flex-1 text-xs font-bold text-emerald-900">{k('nextCard', { n: P.length })}</p>
          <button type="button" onClick={() => { setLab(L.openCompare); setPin(null); }} data-pc-open-compare
            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300">
            {k('openCompare')} <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );

  const markPad = (
    <div className="flex flex-wrap items-center gap-1.5" data-pc-markpad>
      <div dir="ltr" className={`flex ${wide ? 'gap-1' : 'gap-0.5'}`}>
        {[['left', -1, 0, ArrowLeft, 'pinLeft'], ['right', 1, 0, ArrowRight, 'pinRight'], ['up', 0, 1, ArrowUp, 'pinUp'], ['down', 0, -1, ArrowDown, 'pinDown']].map(([id, di, dj, Icon, key]) => (
          <button key={id} type="button" onClick={() => movePin(di, dj)} aria-label={k(key)} data-pc-move={id}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </button>
        ))}
      </div>
      <button type="button" onClick={() => placeMark()} data-pc-place aria-label={k('place')}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 border-amber-600 bg-white px-2 text-sm font-bold text-amber-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
        <Flag className="h-4 w-4" aria-hidden="true" />{wide && <> {k('place')} <span dir="ltr" className="font-mono text-xs">({L.numText(pinX ?? 0)} ; {L.numText(pinY ?? 0)})</span></>}
      </button>
      <button type="button" onClick={claimNoCross} data-pc-nocross aria-label={k('noCross')}
        className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-slate-300 bg-white px-2 text-xs font-bold text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">
        {wide ? k('noCross') : k('noCrossShort')}
      </button>
    </div>
  );

  const paintPad = (
    <div className="space-y-1.5" data-pc-paintpad>
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={k('brushes')}>
        <Paintbrush className="h-4 w-4 text-slate-500" aria-hidden="true" />
        {P.map((p) => (
          <button key={p.id} type="button" onClick={() => setLab((s) => L.setBrush(s, p.index))} aria-pressed={lab.brush === p.index} data-pc-brush={p.id}
            className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border-2 px-2 text-sm font-extrabold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${lab.brush === p.index ? 'text-white' : 'bg-white'}`}
            style={{ borderColor: L.COLORS[p.index], background: lab.brush === p.index ? L.COLORS[p.index] : undefined, color: lab.brush === p.index ? '#fff' : L.COLORS[p.index] }}>
            {planName(p.index)}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {env.segments.map((seg) => {
          const painted = lab.painted[seg.index];
          return (
            <button key={`seg${seg.index}`} type="button" onClick={() => paintSeg(seg.index)} data-pc-seg={seg.index} data-painted={painted != null ? P[painted].id : ''}
              aria-label={k('segAria', { range: rangeText(lab, seg) })}
              className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 bg-white px-2 text-xs font-bold text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              style={{ borderColor: painted != null ? L.COLORS[painted] : '#CBD5E1' }}>
              <span dir="ltr" className="font-mono">{rangeText(lab, seg)}</span>
              {painted != null && <span className="rounded px-1 text-white" style={{ background: L.COLORS[painted] }}>{LETTERS[painted]}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  const comparePanel = (
    <div className="space-y-2" data-pc-compare>
      {slidePanel}
      {step === 'mark' ? markPad : paintPad}
    </div>
  );

  const side = (
    <div ref={sideRef} className="min-w-0 space-y-2" data-pc-side>
      {cpLive && steps.length > 1 && <LabStepper count={steps.length} current={Math.min(nDone, steps.length - 1)} done={stepDone} stepAttr="data-pc-step" />}
      {step === 'build' ? buildPanel : compare ? comparePanel : slidePanel}
      <p role="status" className={`${wide ? 'min-h-[2.25rem] text-sm' : 'min-h-[1.25rem] text-xs'} font-bold leading-snug`} data-pc-notice={lab.last?.kind ?? ''}>{notice}</p>
    </div>
  );

  const head = (
    <div className="flex items-center gap-2 overflow-hidden" style={{ height: HEAD }}>
      <ol className={`flex flex-wrap gap-1.5 text-xs font-bold ${cpLive ? 'hidden' : ''}`} aria-hidden="true">
        {lab.modes.map((m) => (
          <li key={m} className={`rounded-full px-2.5 py-1 ${lab.stage === m ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'}`}>{k(m === 'model' ? 'stageModel' : 'stageCompare')}</li>
        ))}
      </ol>
      <ul className={`min-w-0 flex-1 flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-600 ${wide ? 'flex' : 'hidden'}`} data-pc-legend>
        {shown.map((i) => (
          <li key={`lg${i}`} className="min-w-0 truncate"><span className="font-extrabold" style={{ color: L.COLORS[i] }}>{planName(i)}</span>{lab.accepted && <>: {desc(i)}</>}</li>
        ))}
      </ul>
      <span className="ms-auto flex shrink-0"><Deco theme={theme} x={lab.accepted ? xx : 0} /></span>
    </div>
  );

  const representation = lab.accepted ? (
    <EquationDisplay tone="ok" tex={shown.map((i) => L.fnTex(lab, i)).join(' \\quad ; \\quad ')} note={compare ? k('reprCompare') : k('reprModel')} />
  ) : null;

  return (
    <ManipulationShell
      type="plan-compare"
      title={title ?? k('title')}
      mission={<MathText>{missionText}</MathText>}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided={cpLive}
      hints={hints}
      controller={{
        autoStep: () => false,
        canAutoStep: () => false,
        autoComplete: lab.accepted ? {
          label: t('manipulation.autoComplete.tryAll'),
          ready: true,
          remaining: untriedX.length,
          intervalMs: 480,
          maxTicks: 80,
          step: () => { const v = L.untriedXs(labRef.current)[0]; if (v !== undefined) sweepX(v); },
          finish: () => { L.untriedXs(labRef.current).forEach(sweepX); },
        } : undefined,
      }}
      representation={representation}
      discovery={(
        <ManipulationDiscovery state={state} prompt={<MathText>{k(kind === 'model' ? 'dPromptModel' : 'dPromptCompare')}</MathText>} options={discoveryOptions} formal={formal} />
      )}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/70 to-white" data-dragging={sx.dragging || drag.dragging || pinDrag ? 'true' : undefined}>
        <div ref={boxRef} className="relative space-y-3" data-plan-compare data-stage={lab.stage} data-step={step} data-theme={theme}
          data-plans={P.map((p) => p.src).join('|')} data-x={xx} data-layout={layout} data-budget={budget}>
          {party.node}
          {cp.node}
          <div className="space-y-2" data-pc-glance>
            {head}
            <div className={wide ? 'grid items-start gap-3' : 'space-y-2'} style={wide ? { gridTemplateColumns: `${planeW}px 1fr` } : undefined}>
              {(wide || step !== 'build') && plane}
              {side}
            </div>
          </div>
          {lab.trials.length > 0 && (
            <LabFold id="plan-compare.trials" title={k('trialsTitle')}>
              <ul className="flex flex-wrap gap-1.5" dir="ltr" data-pc-trials>
                {lab.trials.slice(-12).map((tr) => (
                  <li key={`${tr.stage}${tr.x}`} data-trial-x={tr.x} className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 font-mono text-xs font-bold text-slate-800">
                    x = {tr.x} : {(tr.stage === 'compare' ? P.map((p) => p.index) : [0]).map((i) => `${LETTERS[i]} ${L.numText(tr.costs[i])}`).join(' · ')}
                  </li>
                ))}
              </ul>
            </LabFold>
          )}
          <p className="text-[11px] text-slate-500" data-pc-world>{tw('world')}</p>
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ── un intervalle de l'axe, écrit « 0 ≤ x < 10 » ── */
function rangeText(lab, seg) {
  const a = L.numText(seg.from); const b = L.numText(seg.to);
  const last = seg.index === lab.env.segments.length - 1;
  if (lab.env.segments.length === 1) return `0 ≤ x ≤ ${b}`;
  if (seg.index === 0) return `0 ≤ x < ${b}`;
  return last ? `x > ${a}` : `${a} < x < ${b}`;
}

/* ── la ligne d'état : la conséquence mathématique, dans les mots du monde ── */
function noticeOf(lab, { k, tw, planName, units, chipText }) {
  const last = lab.last;
  if (!last) return null;
  const M = (s) => <MathText>{s}</MathText>;
  const costsLine = (x, costs) => `${units(L.toNumber(x))}: ` + lab.plans.map((p, i) => `${LETTERS[i]} ${L.numText(costs[i])}DA`).join(' ، ');
  switch (last.kind) {
    case 'modelKo': {
      const v = lab.verdict;
      return (
        <span className="text-rose-800" data-pc-verdict="ko">
          {M(k('modelKo', { x: L.numText(v.x), mine: L.numText(v.mine), story: L.numText(v.story) }))}
          {v.issues.map((is) => (
            <span key={is.chip} className="block font-normal" data-pc-issue={is.reason}>{M(tw(is.reason, { chip: chipText(is.chip) }))}</span>
          ))}
        </span>
      );
    }
    case 'modelOk': return <span className="text-emerald-800" data-pc-verdict="ok">{M(k('modelOk', { f: L.fnTex(lab, 0) }))}</span>;
    case 'trial': {
      const q = lab.asks.find((a, i) => L.asksDone(lab)[i] && (a.axis === 'x' ? L.toNumber(a.v) === last.x : L.eq(L.costsAt(lab, last.x)[0], a.v)));
      if (lab.stage === 'model' && q) return <span className="text-emerald-800">{M(q.axis === 'x' ? tw('hitX', { u: units(last.x), m: L.numText(L.costsAt(lab, last.x)[0]) }) : tw('hitY', { u: units(last.x), m: L.numText(q.v) }))}</span>;
      return null;
    }
    case 'cross': return <span className="text-emerald-800">{M(k('markOk', { x: L.numText(last.x), y: L.numText(last.y), p: planName(last.pair[0]), q: planName(last.pair[1]), u: units(L.toNumber(last.x)) }))}</span>;
    case 'crossAbove': {
      const best = L.cheapest(lab, last.x)[0];
      return <span className="text-amber-800">{M(k('markAbove', { x: L.numText(last.x), p: planName(last.pair[0]), q: planName(last.pair[1]), r: planName(best) }))}</span>;
    }
    case 'offLine': return <span className="text-rose-800">{M(k('markOff', { x: L.numText(last.x), c: L.numText(last.costs[last.pair[0]]), y: L.numText(last.y) }))}</span>;
    case 'unequal': return <span className="text-rose-800">{M(k('markKo', { costs: costsLine(last.x, last.costs) }))}</span>;
    case 'noCrossOk': return <span className="text-emerald-800">{k('noCrossOk')}</span>;
    case 'noCrossKo': return <span className="text-rose-800">{M(k('noCrossKo', { a: planName(last.witness.at0), b: planName(last.witness.atMax), xMax: lab.win.xMax }))}</span>;
    case 'noBrush': return <span className="text-slate-700">{k('noBrush')}</span>;
    case 'paintOk': return <span className="text-emerald-800">{M(k('paintOk', { p: planName(last.plan), range: rangeText(lab, lab.env.segments[last.seg]) }))}</span>;
    case 'paintKo': return <span className="text-rose-800" data-misconception="MISC-TARRID-AFDAL-DAIMAN">{M(k('paintKo', { p: planName(last.plan), costs: costsLine(last.x, last.costs), best: planName(last.best) }))}</span>;
    default: return null;
  }
}

/* ── la découverte : la conjecture se choisit ; les « toujours » sont réfutés par les essais ── */
function discoveryFor(lab, { k, tw, planName }) {
  const M = (s) => <MathText>{s}</MathText>;
  const P = lab.plans;
  const costsAt = (x) => L.costsAt(lab, x);
  const line = (x) => P.map((p, i) => `${planName(i)} ${L.numText(costsAt(x)[i])} DA`).join(' ، ');
  if (L.discoveryKind(lab) === 'model') {
    const tr = [...lab.trials].sort((p, q) => p.x - q.x);
    const t1 = tr.find((t) => t.x > 0) ?? { x: 1 };
    const t2 = tr.find((t) => t.x >= 2 * t1.x && t.x > 0) ?? { x: 2 * t1.x };
    const { a, b } = P[0].f;
    const opts = [];
    if (!L.eq(b, L.frac(0))) {
      opts.push({ text: M(k('dOptProp')), why: M(k('dOptPropWhy', { x1: t1.x, x2: t2.x, c1: L.numText(costsAt(t1.x)[0]), c2: L.numText(costsAt(t2.x)[0]) })) });
    }
    opts.push({ text: M(k('dOptModel', { f: L.fnTex(lab, 0), b: L.numText(b), a: L.numText(a), unitWord: tw('unitWord') })), correct: true });
    if (!L.eq(b, L.frac(0))) {
      opts.push({ text: M(tw('dOptFixedEach')), why: M(k('dOptFixedEachWhy', { c0: L.numText(costsAt(0)[0]), c1: L.numText(costsAt(1)[0]), a: L.numText(a) })) });
    }
    return opts;
  }
  const { segments, breaks } = lab.env;
  const compareTrials = lab.trials.filter((t) => t.stage === 'compare');
  const trialIn = (seg) => compareTrials.find((t) => L.cmp(L.frac(t.x), seg.from) > 0 && L.cmp(L.frac(t.x), seg.to) < 0)?.x ?? L.toNumber(L.witnessIn(lab, seg));
  if (!breaks.length) {
    const best = segments[0].plan;
    return [
      { text: M(k('dOptSomewhere')), why: M(k('dOptSomewhereWhy', { a: line(0), b: line(lab.win.xMax), xMax: lab.win.xMax })) },
      { text: M(k('dOptNoneRight', { p: planName(best) })), correct: true },
    ];
  }
  // « toujours la même » : réfutée dans l'intervalle suivant
  const first = segments[0];
  const other = segments[1];
  const xOther = trialIn(other);
  // la formule au plus petit prix unitaire, au plus petit forfait
  const minA = P.reduce((m, p) => (L.cmp(p.f.a, P[m].f.a) < 0 ? p.index : m), 0);
  const minB = P.reduce((m, p) => (L.cmp(p.f.b, P[m].f.b) < 0 ? p.index : m), 0);
  const segWhere = (plan) => segments.find((s) => s.plan !== plan);
  const opts = [
    { text: M(k('dOptAlways', { p: planName(first.plan) })), why: M(k('dOptAlwaysWhy', { x: xOther, line: line(xOther), q: planName(other.plan) })) },
  ];
  opts.push({ text: M(breaks.length === 1
    ? k('dOptRight', { x: L.numText(breaks[0].x), p: planName(first.plan), q: planName(other.plan) })
    : k('dOptRight3', { list: segments.map((s) => `${planName(s.plan)} (${rangeText(lab, s)})`).join(' ثم ') })), correct: true });
  const sA = segWhere(minA);
  if (sA) {
    const xa = trialIn(sA);
    opts.push({ text: M(k('dOptMinA', { unitWord: tw('unitWord') })), why: M(k('dOptMinAWhy', { p: planName(minA), x: xa, line: line(xa) })), misconception: 'MISC-TARRID-AFDAL-DAIMAN' });
  } else {
    const sB = segWhere(minB);
    if (sB) {
      const xb = trialIn(sB);
      opts.push({ text: M(k('dOptMinB')), why: M(k('dOptMinBWhy', { p: planName(minB), x: xb, line: line(xb) })), misconception: 'MISC-TARRID-AFDAL-DAIMAN' });
    }
  }
  return opts;
}

/* ── la règle formelle : les lignes écrites que le geste vient de produire ── */
function Formal({ lab, k, tw, planName, units }) {
  const M = (s) => <MathText>{s}</MathText>;
  const P = lab.plans;
  if (L.discoveryKind(lab) === 'model') {
    return (
      <div className="space-y-2" data-pc-formal="model">
        <EquationDisplay tone="result" tex={L.fnTex(lab, 0)} note={M(k('fModel', { b: L.numText(P[0].f.b), a: L.numText(P[0].f.a), unitWord: tw('unitWord') }))} />
        {lab.asks.map((q) => (
          <div key={`${q.axis}${L.numText(q.v)}`} className="space-y-0.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5">
            {q.axis === 'x' ? (
              <>
                <p dir="ltr" className="text-start">{M(`$${L.costTex(lab, 0, q.v)}$`)}</p>
                <p className="text-sm text-slate-700">{M(tw('hitX', { u: units(L.toNumber(q.v)), m: L.numText(L.costsAt(lab, q.v)[0]) }))}</p>
              </>
            ) : (
              <>
                {L.antecedentLines(lab, q.v).map((ln) => <p key={ln} dir="ltr" className="text-start">{M(`$${ln}$`)}</p>)}
                <p className="text-sm text-slate-700">{M(tw('hitY', { u: units(L.toNumber(L.antecedentX(lab, q.v))), m: L.numText(q.v) }))}</p>
              </>
            )}
          </div>
        ))}
        <p className="text-sm text-emerald-900">{M(k('fModelRule'))}</p>
      </div>
    );
  }
  const { breaks, segments } = lab.env;
  if (!breaks.length) {
    return (
      <div className="space-y-2" data-pc-formal="none">
        <p className="text-sm font-bold text-emerald-900">{M(k('fNone', { p: planName(segments[0].plan) }))}</p>
      </div>
    );
  }
  return (
    <div className="space-y-2" data-pc-formal="cross">
      {breaks.map((b) => {
        const [p0, q0] = [Math.min(b.before, b.after), Math.max(b.before, b.after)];
        const e = L.equalityLines(lab, p0, q0);
        const q = L.inequalityLines(lab, b.after, b.before);
        return (
          <div key={L.numText(b.x)} className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2">
            <p className="text-xs font-bold text-slate-600">{M(k('fEquation', { p: planName(p0), q: planName(q0) }))}</p>
            {e.lines.map((ln) => <p key={ln} dir="ltr" className="text-start">{M(`$${ln}$`)}</p>)}
            <p dir="ltr" className="text-start text-sm text-slate-700">{M(`$${e.check}$`)}</p>
            <p className="text-xs font-bold text-slate-600">{M(k('fInequality', { p: planName(b.after) }))}</p>
            {q.lines.map((ln) => <p key={ln} dir="ltr" className="text-start">{M(`$${ln}$`)}</p>)}
          </div>
        );
      })}
      <p className="text-sm font-bold text-emerald-900" data-pc-choice>
        {M(breaks.length === 1
          ? k('fChoice', { x: L.numText(breaks[0].x), u: units(L.toNumber(breaks[0].x)), p: planName(segments[0].plan), q: planName(segments[1].plan), y: L.numText(breaks[0].y) })
          : k('fChoice3', { list: segments.map((s) => `${planName(s.plan)} (${rangeText(lab, s)})`).join(' ثم ') }))}
      </p>
      <p className="text-sm text-slate-700">{M(k('fGraph'))}</p>
    </div>
  );
}

/* ── le décor de chaque monde (sans information, hors du parcours clavier) ── */
function Deco({ theme, x }) {
  const reduce = useReducedMotion();
  const [taps, setTaps] = useState(0);
  const anim = taps > 0 && !reduce;
  const hh = String(Math.min(99, x)).padStart(2, '0');
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => !reduce && setTaps((n) => n + 1)} data-deco={theme}
      className="h-10 w-20 shrink-0 rounded-lg focus:outline-none">
      <svg viewBox="0 0 120 60" width="100%" height="100%">
        {theme === 'stadium' && (
          <g>
            <rect x="2" y="30" width="116" height="28" rx="4" fill="#15803D" />
            <path d="M2 30 L118 30 L108 18 L12 18 Z" fill="#94A3B8" />
            {[18, 32, 46, 60, 74, 88, 102].map((cx, n) => (
              <g key={cx} className={anim ? 'pc-jump' : undefined} style={{ animationDelay: `${n * 60}ms` }}>
                <circle cx={cx} cy="14" r="4" fill="#FCD9B6" />
                <rect x={cx - 4} y="17" width="8" height="7" rx="2" fill={n % 2 ? '#DC2626' : '#F8FAFC'} />
              </g>
            ))}
            <g className={anim ? 'pc-wave' : undefined} style={{ transformOrigin: '10px 30px' }}>
              <line x1="10" y1="30" x2="10" y2="4" stroke="#334155" strokeWidth="1.6" />
              <path d="M10 4 h16 v10 h-16 z" fill="#16A34A" /><path d="M18 4 v10" stroke="#fff" strokeWidth="3" />
            </g>
            <line x1="60" y1="30" x2="60" y2="58" stroke="#fff" strokeWidth="1.2" opacity=".7" />
            <circle cx="60" cy="44" r="7" fill="none" stroke="#fff" strokeWidth="1.2" opacity=".7" />
          </g>
        )}
        {theme === 'gaming' && (
          <g>
            <rect x="2" y="2" width="116" height="56" rx="6" fill="#1E1B4B" />
            {[8, 44, 80].map((sx0, n) => (
              <g key={sx0}>
                <rect x={sx0} y="8" width="32" height="20" rx="2" fill="#0EA5E9" className={anim ? 'pc-flick' : undefined} style={{ animationDelay: `${n * 90}ms` }} />
                <rect x={sx0 + 13} y="28" width="6" height="4" fill="#64748B" />
              </g>
            ))}
            <rect x="34" y="38" width="52" height="16" rx="3" fill="#0F172A" stroke="#22D3EE" />
            <text x="60" y="50" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#22D3EE" fontFamily="ui-monospace, monospace">{hh}:00</text>
          </g>
        )}
        {theme === 'rental' && (
          <g>
            <rect x="0" y="0" width="120" height="30" fill="#BAE6FD" />
            <circle cx="104" cy="10" r="6" fill="#FBBF24" />
            <rect x="0" y="30" width="120" height="12" fill="#0284C7" />
            <path className={anim ? 'pc-wave' : undefined} d="M0 32 q8 -4 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0" stroke="#fff" strokeWidth="1.6" fill="none" />
            <g className={anim ? 'pc-bob' : undefined}>
              <path d="M70 30 q14 6 28 0 z" fill="#F97316" /><line x1="76" y1="22" x2="94" y2="34" stroke="#334155" strokeWidth="1.4" />
            </g>
            <rect x="0" y="42" width="120" height="18" fill="#FDE68A" />
            <g stroke="#334155" strokeWidth="1.4" fill="none">
              <circle cx="22" cy="52" r="5" /><circle cx="40" cy="52" r="5" />
              <path d="M22 52 L30 44 L40 52 M30 44 L28 40 M30 44 h6" />
            </g>
          </g>
        )}
      </svg>
    </button>
  );
}

const PC_CSS = '.pc-shake{animation:pc-s .35s ease-in-out 1}@keyframes pc-s{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}'
  + '.pc-jump{animation:pc-j .5s ease-out 2}@keyframes pc-j{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}'
  + '.pc-wave{animation:pc-w .6s ease-in-out 2}@keyframes pc-w{0%,100%{transform:rotate(0)}50%{transform:rotate(-8deg)}}'
  + '.pc-flick{animation:pc-f .3s steps(2) 3}@keyframes pc-f{50%{opacity:.35}}'
  + '.pc-bob{animation:pc-b .8s ease-in-out 2}@keyframes pc-b{0%,100%{transform:translateY(0)}50%{transform:translateY(3px)}}'
  + '@media (prefers-reduced-motion: reduce){.pc-shake,.pc-jump,.pc-wave,.pc-flick,.pc-bob{animation:none}}';

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque étape ; la dernière étape (slide si model seul, paint sinon) finit par LA RÈGLE. */
export function chainOf(lab, step) {
  const steps = L.stepsOf(lab);
  const br = lab.env.breaks[0];
  const base = {
    build: ['atZero', 'costAt'],
    slide: ['rate', lab.asks.some((q) => q.axis === 'y') ? 'budget' : null],
    mark: br ? ['crossCost'] : ['order'],
    paint: br ? [L.sideX(lab, br, 'before') != null ? 'before' : null, L.sideX(lab, br, 'after') != null ? 'after' : null] : [],
  }[step].filter(Boolean);
  return step === steps[steps.length - 1] ? [...base, 'rule'] : base;
}
export const CHAINS = Object.freeze({ build: ['atZero', 'costAt'], slide: ['rate', 'budget'], mark: ['crossCost', 'order'], paint: ['before', 'after'] });

const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const T = (x) => <MathText>{`$${x}$`}</MathText>;
const shuffled = (list, seed) => { const r = Math.abs(seed) % list.length; return [...list.slice(r), ...list.slice(0, r)]; };
const seedOf = (lab) => lab.trials.length + lab.marks.length + L.toNumber(lab.plans[0].f.a);
const nameOf = (k, i) => k('planName', { letter: LETTERS[i] });
const lastTrial = (lab, stage) => [...lab.trials].reverse().find((t) => t.stage === stage) ?? lab.trials[lab.trials.length - 1];

export const QUESTIONS = {
  /* build : la facture que l'élève vient de construire */
  atZero: (lab, k) => {
    const f = lab.plans[0].f;
    const o = { f: L.fnTex(lab, 0), b: L.numText(f.b) };
    return {
      id: 'atZero', kind: 'number', expected: Lin.fracText(f.b), answer: T(L.numTex(f.b)),
      prompt: Cq(k, 'atZero.prompt', o), hints: [Cq(k, 'atZero.hint1', o), Cq(k, 'atZero.hint2', o)], explain: Cq(k, 'atZero.explain', o),
    };
  },
  costAt: (lab, k) => {
    const x = lab.verdict?.x ?? L.sampleX(lab);
    const cost = L.costsAt(lab, x)[0];
    const o = { f: L.fnTex(lab, 0), x: L.numText(x), calc: L.costTex(lab, 0, x), a: L.numText(lab.plans[0].f.a), b: L.numText(lab.plans[0].f.b) };
    return {
      id: 'costAt', kind: 'number', expected: Lin.fracText(cost), answer: T(L.numTex(cost)),
      prompt: Cq(k, 'costAt.prompt', o), hints: [Cq(k, 'costAt.hint1', o), Cq(k, 'costAt.hint2', o)], explain: Cq(k, 'costAt.explain', o),
    };
  },
  /* slide : ce que la facture donne quand x glisse */
  rate: (lab, k) => {
    const tr = lastTrial(lab, 'model') ?? { x: 0 };
    const f = lab.plans[0].f;
    const x1 = tr.x + 1;
    const c0 = L.costsAt(lab, tr.x)[0]; const c1 = L.costsAt(lab, x1)[0];
    const o = { x: tr.x, x1, c0: L.numText(c0), c1: L.numText(c1), a: L.numText(f.a), f: L.fnTex(lab, 0) };
    return {
      id: 'rate', kind: 'number', expected: Lin.fracText(f.a), answer: T(L.numTex(f.a)),
      prompt: Cq(k, 'rate.prompt', o), hints: [Cq(k, 'rate.hint1', o), Cq(k, 'rate.hint2', o)], explain: Cq(k, 'rate.explain', o),
    };
  },
  budget: (lab, k) => {
    const q = lab.asks.find((a) => a.axis === 'y');
    const x = L.antecedentX(lab, q.v);
    const f = lab.plans[0].f;
    const o = { f: L.fnTex(lab, 0), m: L.numText(q.v), b: L.numText(f.b), a: L.numText(f.a), rest: L.numText(Lin.sub(q.v, f.b)), lines: L.antecedentLines(lab, q.v).join(' ,\\quad ') };
    return {
      id: 'budget', kind: 'number', expected: Lin.fracText(x), answer: T(L.numTex(x)),
      prompt: Cq(k, 'budget.prompt', o), hints: [Cq(k, 'budget.hint1', o), Cq(k, 'budget.hint2', o)], explain: Cq(k, 'budget.explain', o),
    };
  },
  /* mark : le coût commun au croisement, ou l'ordre qui ne change pas */
  crossCost: (lab, k) => {
    const br = lab.env.breaks[0];
    const p = br.before; const q = br.after;
    const o = { x: L.numText(br.x), p: nameOf(k, p), q: nameOf(k, q), fp: L.fnTex(lab, p), calc: L.costTex(lab, p, br.x), y: L.numText(br.y) };
    return {
      id: 'crossCost', kind: 'number', expected: Lin.fracText(br.y), answer: T(L.numTex(br.y)),
      prompt: Cq(k, 'crossCost.prompt', o), hints: [Cq(k, 'crossCost.hint1', o), Cq(k, 'crossCost.hint2', o)], explain: Cq(k, 'crossCost.explain', o),
    };
  },
  order: (lab, k) => {
    const best = lab.env.segments[0].plan;
    const xm = lab.win.xMax;
    const costs = L.costsAt(lab, xm);
    const opts = lab.plans.map((p) => (p.index === best
      ? { text: nameOf(k, p.index), correct: true }
      : { text: nameOf(k, p.index), why: Cq(k, 'order.why', { p: nameOf(k, p.index), cp: L.numText(costs[p.index]), best: nameOf(k, best), cb: L.numText(costs[best]), x: xm }) }));
    const o = { best: nameOf(k, best), x: xm, xMax: xm };
    return {
      id: 'order', kind: 'choice', cols: 1, prompt: Cq(k, 'order.prompt', o), options: shuffled(opts, seedOf(lab)),
      hints: [Cq(k, 'order.hint1', o), Cq(k, 'order.hint2', o)], explain: Cq(k, 'order.explain', o),
    };
  },
  /* paint : de chaque côté du croisement */
  before: (lab, k) => sideQuestion(lab, k, 'before'),
  after: (lab, k) => sideQuestion(lab, k, 'after'),
  rule: (lab, k, tw) => {
    const units = (n) => tw('units', { count: n });
    const opts = discoveryFor(lab, { k, tw, planName: (i) => nameOf(k, i), units });
    const ci = opts.findIndex((o) => o.correct);
    const dk = L.discoveryKind(lab);
    return {
      id: 'rule', kind: 'choice', cols: 1,
      prompt: <MathText>{k(dk === 'model' ? 'dPromptModel' : 'dPromptCompare')}</MathText>,
      options: ci === opts.length - 1 ? [opts[ci], ...opts.slice(0, ci)] : opts,
      hints: [Cq(k, `rule.hint1.${dk === 'model' ? 'model' : 'compare'}`), Cq(k, `rule.hint2.${dk === 'model' ? 'model' : 'compare'}`)],
      explain: Cq(k, `rule.explain.${dk === 'model' ? 'model' : 'compare'}`),
    };
  },
};

function sideQuestion(lab, k, side) {
  const br = lab.env.breaks[0];
  const x = L.sideX(lab, br, side);
  const best = L.cheapest(lab, x)[0];
  const costs = L.costsAt(lab, x);
  const opts = lab.plans.map((p) => (p.index === best
    ? { text: nameOf(k, p.index), correct: true }
    : { text: nameOf(k, p.index), why: Cq(k, 'side.why', { p: nameOf(k, p.index), cp: L.numText(costs[p.index]), best: nameOf(k, best), cb: L.numText(costs[best]), x }) }));
  const o = { x, cross: L.numText(br.x), best: nameOf(k, best), cb: L.numText(costs[best]) };
  return {
    id: side, kind: 'choice', cols: 1, prompt: Cq(k, `${side}.prompt`, o), options: shuffled(opts, seedOf(lab) + (side === 'after' ? 1 : 0)),
    hints: [Cq(k, `${side}.hint1`, o), Cq(k, 'side.hint2', o)], explain: Cq(k, `${side}.explain`, o),
  };
}
