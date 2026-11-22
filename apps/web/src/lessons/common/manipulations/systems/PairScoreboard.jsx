import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import { Minus, Plus, Repeat, CheckCheck } from 'lucide-react';
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
import * as L from '../logic/pairScoreboard';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { useInMissionPlayer } from '../../mission/missionPlayerContext';
import PairScoreboardPlayer from './PairScoreboardPlayer';

/**
 * pair-scoreboard — LE TABLEAU DES DEUX CONDITIONS (unité 5 « جمل معادلتين من الدرجة الأولى
 * بمجهولين », leçon 1 « مفهوم جملة معادلتين »).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève ÉTIRE les DEUX nombres de la ثنائية : x et y ont chacun leur règle et leur
 *    poignée (useStretchInteraction ; glisser, toucher la règle, −/+, flèches du clavier). Il
 *    peut RENVERSER la ثنائية (« اقلب ») et il JUGE : « هذه الثنائية حل للجملة ».
 * B. Idée : une ثنائية est حل للجملة ⇔ elle vérifie les deux équations « في آن واحد ».
 * C. Pendant le geste, le monde suit en direct : les cases de l'équation (1) se remplissent
 *    (des objets restent dehors, des cases restent vides), la grandeur de l'équation (2)
 *    (points, dinars, le panneau « après la retraite ») monte ou descend ; chaque jauge lit
 *    sa substitution au mot près du manuel (« 2(13 - 5) = 16 », « 19 - 3 = 16 »).
 * D. Chaque ثنائية validée devient un ESSAI de la table (jauge (1), jauge (2)) ; « حل للجملة »
 *    est refusé tant qu'une seule jauge s'allume (« تحقّق المعادلة (1) فقط »).
 * E. À découvrir : la table de l'élève contient des ثنائيات qui vérifient UNE équation, et la
 *    seule qui vérifie les deux — c'est elle, la solution : « في آن واحد ».
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        حل جملة معادلتين = ثنائية (x ; y) qui vérifie les deux équations à la fois
 *   OBJECT         une ثنائية faite de deux quantités dessinées (cartes de match V / N, hommes
 *                  et femmes d'un service, pièces de 20DA / 10DA)
 *   VARIABLE       x ET y (deux poignées : la main tient les DEUX nombres)
 *   INVARIANT      les deux équations (les cadres et les cibles ne bougent pas) ; une jauge
 *                  dépend des DEUX nombres ; l'ordre (x d'abord)
 *   TRANSFORMATION les objets, la grandeur de (2), les lectures des deux jauges, en direct
 *   CONSTRAINT     une ثنائية n'est حل que si les deux jauges sont allumées ensemble
 *   RESISTANCE     « حل للجملة » refusé avec la jauge qui reste éteinte et sa lecture exacte ;
 *                  la ثنائية renversée (19 ; 13) éteint la jauge (2) ; les bornes de l'histoire
 *                  (on ne retraite pas 5 hommes d'un service qui en a 4)
 *   EVIDENCE       les deux jauges vertes ensemble ; la table des essais de l'élève
 *   CONTRAST       un essai à UNE jauge (le (24 ; 8) du manuel, ou tout autre) ET la ثنائية
 *                  acceptée — l'un sans l'autre n'ouvre pas la découverte
 *   PREDICTION     « 24 hommes et 8 femmes, possible ? » (س أ) se décide AVANT sur les jauges
 *   DISCOVERY      « حل الجملة ثنائية تحقق المعادلتين في آن واحد » (distracteurs réfutés par
 *                  les propres essais : « (1) seulement », « (2) seulement », « peu importe l'ordre »)
 *   FORMALIZATION  la jumla écrite { x + y = 32 ; 2(x − 5) = y − 3 }, réduite { … ; 2x − y = 7 },
 *                  « الثنائية (13 ; 19) حل لهذه الجملة »
 *   TRANSFER       le تحدّ (37 pièces, 610DA : même tableau, monde `coins`) ; معارف (2 ; 0) / (3 ; 1)
 *                  / (0 ; 2) ; le cas sans solution (aucune ثنائية n'allume les deux jauges)
 *
 * Mondes (lus sur la STRUCTURE de la jumla, logic/pairScoreboard.js › shapeOf) :
 *   football  « x + y = N » et « p·x + q·y = V » : une saison de N matchs, x victoires (p pts)
 *             et y nuls (q pt) — la carte de saison d'un club (مبتدئ, plateforme) ;
 *   coins     même structure, en pièces de p DA et q DA (le تحدّ) ;
 *   staff     « x + y = N » et « m(x − a) = y − b » : N bureaux, puis le panneau « après »
 *             (نشاط 1, متقدم) ;
 *   abstract  toute autre jumla : les deux jauges seules.
 * Manuel (§6bis) : chaque ثنائية est un essai ou une réponse — pas d'auto-complétion.
 *
 * DÉCOR (exigence du propriétaire) : un ballon qui rebondit et une écharpe qui flotte
 * (saison), une horloge murale dont les aiguilles tournent (service), une pièce qui tourne
 * (cagnotte) — touchés du doigt seulement. `aria-hidden`, `tabIndex={-1}`, `[data-deco]`,
 * jamais un état du lab, immobiles sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (règle du propriétaire, 2026-10-01) : le monde, les deux poignées, les deux jauges
 * et la réponse tiennent ENSEMBLE dans la hauteur de l'écran de leçon (`useLessonViewport` : la boîte
 * de <main>, sous la barre du haut) — mesuré au navigateur à 1280×800, 1366×768, 390×844 et 320×640,
 * aux deux niveaux, avec x et y au maximum (64 personnes, 32 sans bureau). Les bureaux / matchs /
 * pièces forment un CARRÉ (`sceneGrid` : cols = ⌈√n⌉) dont la case vient de la place qui reste
 * (largeur de la colonne, hauteur = écran − commandes mesurées − légende) : ils rétrécissent, les
 * commandes jamais. Large (≥ 620 px) : le monde et ses commandes côte à côte ; sinon les commandes
 * juste sous le monde. Étroit (< 340 px) : jauges en une ligne chacune, « اقلب » en icône, et la
 * lecture écrite (« 2(24 − 5) = 38 … ») dans un pli `LabFold` sous la manipulation. Le secondaire
 * (lecture écrite en étroit, note de la وضعية, table des essais) est SOUS la manipulation, repliable
 * (`primitives/LabFold`), jamais entre le monde et ses commandes. `MovablePanel` n'est pas utilisé :
 * rien ne flotte sur les bureaux, tout tient sans recouvrement.
 *
 * QUESTIONS PENDANT LE LABO (2026-10-28, `primitives/LabCheckpoint`, `checkpoints` défaut true) : deux étapes `LabStepper`, la 2e s'ouvre après la 1re.
 *   1. « الحل » (dès qu'une ثنائية est acceptée) : la valeur commune de la jauge (2), pourquoi la ثنائية est acceptée, la ثنائية renversée (l'ordre) ;
 *   2. « الشرط الواحد » (dès qu'un essai n'allume qu'UNE jauge) : quelle jauge, pourquoi ce n'est pas un حل, puis la RÈGLE (l'ancienne découverte).
 * Toutes construites sur les ثنائيات de l'élève (`CHAINS`, `QUESTIONS`, `chainOf` exportés). `onCheckpoint(ev)` reçoit les événements `checkpoint` / `checkpoint-done`
 * (pour la trace des étapes de la leçon) ; `onTrial` ne reçoit que les ثنائيات.
 *
 * Props : `system` (« eq1|eq2 », écrites comme le manuel), `theme` ('football' | 'staff' |
 * 'coins'), `ranges` ({ x: {min,max}, y: {min,max} }, sinon celles de l'histoire), `title`,
 * `lead`, `mission`, `level`, `levels` (false : exemple posé seul), `onTrial(t)` à chaque
 * ثنائية validée, `onSolved({ x, y })` à la réponse acceptée, `onFinished` à la règle formelle —
 * tous par `state.report`.
 *
 * CONTRAT DOM : [data-pair-scoreboard][data-world][data-x][data-y][data-solved],
 * [data-pair-card], [data-stretch-handle][data-pair-handle=x|y], [data-gauge=1|2][data-ok],
 * [data-pair-glance] (le bloc d'un seul regard), [data-pair-controls], [data-lab-fold=pair-scoreboard.readings|note|trials],
 * [data-pair-trial][data-ok1][data-ok2][data-swapped], [data-pair-swap], [data-pair-claim],
 * [data-pair-verdict=<kind>], [data-pair-refused], [data-pair-world], [data-pair-cell=x|y|empty],
 * [data-pair-overflow], [data-pair-value], [data-pair-after], [data-deco], [data-pair-formal].
 */
/**
 * LECTEUR DE MISSION (rollout 2026-11-12, unité 5 leçon 1 `mafhum-jumla` ; conseil du 2026-11-11, verdict L1 et X7) : dans le lecteur le labo est
 * `PairScoreboardPlayer` (manches, jauges lues au relâchement, manche couverte, questions sur ce que l'élève FAIT, prédictions, guide) ; partout
 * ailleurs (page, enseignant, mode classe) c'est la page ci-dessous, INCHANGÉE. Les dessins sont exportés d'ici, pas déplacés.
 */
export default function PairScoreboard(props) {
  const inPlayer = useInMissionPlayer();
  return inPlayer ? <PairScoreboardPlayer {...props} /> : <PairScoreboardPage {...props} />;
}

function PairScoreboardPage({
  system: system0 = 'x+y=32|2(x-5)=y-3', theme, ranges, title, lead, mission, level, levels: withLevels = true,
  checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false, onTrial, onCheckpoint, onSolved, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.pairScoreboard.${key}`, o), [t]);
  const state = useManipulation({ type: 'pair-scoreboard', initialNumbers: { system: system0 }, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { system } = state.numbers;
  // Sur l'autre niveau (préréglage de levels.js), le monde se lit sur la jumla seule.
  const themeHere = state.isAuthoredLevel ? theme : undefined;
  const rangesHere = state.isAuthoredLevel ? ranges : undefined;

  const make = () => L.init({ system, theme: themeHere, ranges: rangesHere });
  const [lab, setLab] = useState(make);
  const sceneKey = `${system}:${state.epoch}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [doneSteps, setDoneSteps] = useState([]);
  // Une ثنائية PAR DÉFAUT (le minimum de chaque règle) : la manipulation n'est jamais vide à l'ouverture
  // (2026-10-09). Ce n'est pas un essai : seul un geste validé (relâchement, pause clavier, « اقلب », « حل »)
  // entre dans `lab.trials` ; `lab.x` / `lab.y` restent `null` tant que la main n'a rien posé.
  const [liveX, setLiveX] = useState(null);
  const [liveY, setLiveY] = useState(null);
  if (scene.key !== sceneKey) {
    // « إعادة » ou un autre niveau : TOUT recommence — les essais, les étapes et les questions du labo
    setScene({ key: sceneKey, inits: scene.inits + 1 });
    setLab(make()); setLiveX(null); setLiveY(null); setDoneSteps([]);
  }

  const cpSettings = useLabCheckpointSettings('pair-scoreboard');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpActive = cpOn && cpSettings.enabled;
  const stepNow = !doneSteps.includes('solve') ? (lab.solved ? 'solve' : null) : !doneSteps.includes('half') ? (L.discoveryReady(lab) ? 'half' : null) : null;
  const chain = cpActive && stepNow ? chainOf(stepNow, lab) : null;
  const party = useStepCelebration();
  const cp = useLabCheckpoint({
    id: chain ? stepNow : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, k)) : null,
    reached: stepNow != null,
    resetKey: scene.inits,
    // la MÊME étape au départ : « solve » retire la réponse acceptée ; « half » retire les essais à une seule jauge
    onRetry: () => setLab((s) => (stepNow === 'solve'
      ? { ...s, solved: null, last: null }
      : { ...s, trials: s.trials.filter((tr) => tr.ok[0] === tr.ok[1]), last: null })),
    onEvent: (ev) => state.report(onCheckpoint, ev),
    onDone: (id) => {
      setDoneSteps((d) => (d.includes(id) ? d : [...d, id]));
      party.celebrate({ n: id === 'solve' ? 1 : 2, total: 2 });
      if (id === 'half') { state.discover(); state.formalize(); }
    },
  });

  const ready = L.discoveryReady(lab) && !cpActive;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, system); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Chaque NOUVEL essai est rapporté à la leçon (sa table `[data-activity-evidence]`).
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials === 0) return;
    const tr = lab.trials[nTrials - 1];
    state.report(onTrial, {
      x: tr.x, y: tr.y, ok1: tr.ok[0], ok2: tr.ok[1], swapped: tr.swapped, system,
      pair: L.pairText(tr.x, tr.y), pairTex: L.pairTex(tr.x, tr.y),
      readings: [0, 1].map((i) => L.readingTex(lab, i, tr.x, tr.y).lines),
    });
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (lab.solved) state.report(onSolved, { ...lab.solved, system }); }, [lab.solved]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : la largeur de la scène et la HAUTEUR de l'écran de leçon ── */
  const boxRef = useRef(null);
  const ctrlRef = useRef(null);
  const legendRef = useRef(null);
  const [width, setWidth] = useState(300);
  const [ctrlH, setCtrlH] = useState(300);
  const [legendH, setLegendH] = useState(28);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(240, Math.floor(el.clientWidth)));
      if (ctrlRef.current) setCtrlH(Math.ceil(ctrlRef.current.getBoundingClientRect().height));
      if (legendRef.current) setLegendH(Math.ceil(legendRef.current.getBoundingClientRect().height));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (ctrlRef.current) ro.observe(ctrlRef.current);
    if (legendRef.current) ro.observe(legendRef.current);
    return () => ro.disconnect();
  }, []);
  /* ── le son (muet sauf « الصوت ») : un geste (dent), la ثنائية acceptée (cloche), un refus (grave), le contraste atteint (drapeau) ── */
  const sfx = useRef(0);
  const lastKind = lab.last?.kind;
  useEffect(() => {
    if (lastKind === 'accepted') playSfx('bell');
    else if (lastKind === 'onlyOne' || lastKind === 'none' || lastKind === 'swapOut') playSfx('over');
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (L.discoveryReady(lab)) playSfx('flag'); }, [L.discoveryReady(lab)]); // eslint-disable-line react-hooks/exhaustive-deps
  const tick = () => { const now = performance.now(); if (now - sfx.current > 35) { playSfx('tooth'); sfx.current = now; } };
  const vp = useLessonViewport(true);
  // La hauteur disponible sous le chrome de l'application (barre du haut, barre du bas sur
  // téléphone) : `useLessonViewport` lit la boîte de <main>. Hors navigateur : un téléphone.
  const screenH = vp.ready && vp.height > 0 ? vp.height : 576;
  const budget = Math.max(320, screenH - 8);
  // Large (≥ 620 px) : la scène et ses commandes CÔTE À CÔTE ; sinon les commandes juste dessous.
  const wide = width >= 620;
  const GAP = 12;
  const colW = wide ? Math.floor((width - GAP) / 2) : width;

  /* ── les deux poignées ── */
  const EDGE = 22;
  // La piste occupe la colonne moins les deux boutons −/+ (2 × 44 px et leurs marges).
  const tw = Math.max(60, colW - 104);
  const rx = lab.range.x;
  const ry = lab.range.y;
  const muOf = (r) => (tw - 2 * EDGE) / Math.max(1, r.max - r.min);
  const toValueX = useCallback((cx, _y, rect) => rx.min + (cx - rect.left - EDGE) / muOf(rx), [rx.min, rx.max, tw]); // eslint-disable-line react-hooks/exhaustive-deps
  const toValueY = useCallback((cx, _y, rect) => ry.min + (cx - rect.left - EDGE) / muOf(ry), [ry.min, ry.max, tw]); // eslint-disable-line react-hooks/exhaustive-deps
  const dflt = useMemo(() => L.defaultPair(lab), [lab.system, lab.range]); // eslint-disable-line react-hooks/exhaustive-deps
  const sx = useStretchInteraction({
    value: liveX ?? lab.x ?? dflt.x, range: rx, toValue: toValueX, onChange: (v) => { setLiveX(v); tick(); },
    onCommit: (v) => { setLiveX(v); setLab((s) => L.set(s, 'x', v)); }, direction: 'ltr',
  });
  const sy = useStretchInteraction({
    value: liveY ?? lab.y ?? dflt.y, range: ry, toValue: toValueY, onChange: (v) => { setLiveY(v); tick(); },
    onCommit: (v) => { setLiveY(v); setLab((s) => L.set(s, 'y', v)); }, direction: 'ltr',
  });
  // PAR DÉFAUT : une ثنائية qui n'est PAS la solution (L.defaultPair ; jamais « ? ») — un état montré, pas un essai.
  const X = liveX ?? lab.x ?? dflt.x;
  const Y = liveY ?? lab.y ?? dflt.y;
  const both = X != null && Y != null;
  const gauges = L.gauges(lab, X, Y);

  /** L'état validé, y compris une valeur au clavier encore en attente. */
  const committed = (s) => {
    let base = s;
    if (X !== s.x) base = L.set(base, 'x', X);
    if (Y !== s.y) base = L.set(base, 'y', Y);
    return base;
  };
  const claim = () => { sx.flush(); sy.flush(); setLab((s) => L.claim(committed(s))); };
  const swap = () => { sx.flush(); sy.flush(); setLab((s) => L.swap(committed(s))); setLiveX(null); setLiveY(null); };

  /* ── les mots du monde ── */
  const W = lab.world;
  const sh = lab.shape;
  const w = (key, o) => k(`worlds.${W}.${key}`, { ...(sh.kind !== 'none' ? sh : {}), ...o });
  const noun = (v) => w(v === 'x' ? 'x' : 'y');
  const pairT = (x, y) => `$${L.pairTex(x, y)}$`;

  const last = lab.last;
  const verdict = last && ({
    accepted: () => <span className="text-emerald-800"><MathText>{k('vAccepted', { pair: pairT(last.x, last.y) })}</MathText></span>,
    onlyOne: () => <span className="text-rose-800" data-pair-refused="onlyOne"><MathText>{k('vOnlyOne', { pair: pairT(last.x, last.y), i: last.ok[0] ? 1 : 2, j: last.ok[0] ? 2 : 1 })}</MathText></span>,
    none: () => <span className="text-rose-800" data-pair-refused="none"><MathText>{k('vNone', { pair: pairT(last.x, last.y) })}</MathText></span>,
    noPair: () => <span className="text-slate-700">{k('vNoPair')}</span>,
    swapOut: () => <span className="text-slate-700"><MathText>{k('vSwapOut', { pair: pairT(last.x, last.y) })}</MathText></span>,
    sameSwap: () => <span className="text-slate-700">{k('vSameSwap')}</span>,
    trial: () => (last.swapped ? <span className="text-slate-800"><MathText>{k('vSwapped', { pair: pairT(last.x, last.y) })}</MathText></span> : null),
  }[last.kind]?.());

  /* ── la découverte : distracteurs réfutés par les essais de l'élève ── */
  const discoveryOptions = useMemo(() => {
    const opts = [];
    const only1 = L.halfTrial(lab, 1);
    const only2 = L.halfTrial(lab, 2);
    if (only1) opts.push({ text: <MathText>{k('dOptFirst')}</MathText>, why: <MathText>{k('dWhyFirst', { pair: pairT(only1.x, only1.y) })}</MathText> });
    opts.push({ text: <MathText>{k('dOptRight')}</MathText>, correct: true });
    if (only2) opts.push({ text: <MathText>{k('dOptSecond')}</MathText>, why: <MathText>{k('dWhySecond', { pair: pairT(only2.x, only2.y) })}</MathText> });
    // « peu importe l'ordre » : la ثنائية renversée de l'élève, ou celle de la solution, lue.
    const sol0 = lab.solved;
    const sw = L.swappedRefused(lab) ?? (sol0 && sol0.x !== sol0.y ? { x: sol0.y, y: sol0.x } : null);
    if (sw && !L.okPair(lab, sw.x, sw.y).every(Boolean)) {
      opts.push({ text: <MathText>{k('dOptAny')}</MathText>, why: <MathText>{k('dWhyAny', { pair: pairT(sw.x, sw.y) })}</MathText> });
    }
    return opts;
  }, [lab, k]); // eslint-disable-line react-hooks/exhaustive-deps

  const sol = lab.solved;
  const reducedDiffers = lab.src.some((_, i) => L.eqWrittenTex(lab, i) !== L.eqReducedTex(lab, i));
  const swappedSol = sol && sol.x !== sol.y && !L.okPair(lab, sol.y, sol.x).every(Boolean) ? { x: sol.y, y: sol.x } : null;

  /* ── la représentation vivante ── */
  const pairNow = both ? L.pairTex(X, Y) : '(x ; y)';
  const okNow = gauges.map((g) => g?.ok ?? false);
  const statusKey = !both ? 'sWait' : okNow[0] && okNow[1] ? 'sBoth' : okNow[0] ? 'sOnly1' : okNow[1] ? 'sOnly2' : 'sNone';

  /* ── la grille du monde, taillée pour la hauteur qui reste ── */
  const hasWorld = W !== 'abstract';
  const count = hasWorld ? Math.max(sh.N, (X ?? 0) + (Y ?? 0)) : 0;
  // la grille = l'écran moins les commandes, la légende et le cadre du monde (bordure, marges : 20 px)
  const sceneMax = Math.max(90, (wide ? budget : budget - ctrlH - GAP) - legendH - 20);
  const grid = hasWorld ? L.sceneGrid({ count, width: colW - 12, maxHeight: sceneMax }) : null;

  const controls = (
    <div ref={ctrlRef} className="space-y-2" data-pair-controls>
      <Ruler which="x" stretch={sx} range={rx} value={X} width={tw} edge={EDGE} handleLabel={k('handle', { name: 'x', noun: noun('x') })}
        notSet={k('notSet')} less={k('less', { name: 'x' })} more={k('more', { name: 'x' })} tone="blue" />
      <Ruler which="y" stretch={sy} range={ry} value={Y} width={tw} edge={EDGE} handleLabel={k('handle', { name: 'y', noun: noun('y') })}
        notSet={k('notSet')} less={k('less', { name: 'y' })} more={k('more', { name: 'y' })} tone="violet" />

      {/* ── les deux jauges, côte à côte ── */}
      <div className="grid grid-cols-2 gap-2">
        {[0, 1].map((i) => {
          const g = gauges[i];
          const rd = both ? L.readingTex(lab, i, X, Y) : null;
          const ok = g?.ok ?? false;
          return (
            <section key={i} data-gauge={i + 1} data-ok={both ? String(ok) : ''} aria-live="polite" aria-label={w(i === 0 ? 'g1' : 'g2')}
              className={`min-w-0 rounded-xl border-2 px-2 py-1.5 ${!both ? 'border-slate-200 bg-white' : ok ? 'border-emerald-400 bg-emerald-50' : 'border-rose-300 bg-rose-50'}`}>
              <div className="flex items-start justify-between gap-1">
                <h4 className="text-xs font-extrabold leading-tight text-slate-800">
                  {w(i === 0 ? 'g1' : 'g2')}
                </h4>
                <span aria-hidden="true" className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${!both ? 'bg-slate-300' : ok ? 'bg-emerald-600' : 'bg-rose-500'}`}>{!both ? '?' : ok ? '✓' : '✗'}</span>
              </div>
              <p className="text-xs text-slate-600" dir="ltr"><MathText>{`$${L.eqWrittenTex(lab, i)}$`}</MathText></p>
              {/* étroit : la lecture écrite (secondaire) passe dans le pli « القراءة بالتعويض » sous la manipulation */}
              {(rd ? (<div className="flex min-h-[2.5rem] flex-wrap content-start gap-x-3 font-bold text-sm" dir="ltr" data-gauge-reading>
                  {rd.lines.map((ln) => <span key={ln}><MathText>{`$${ln}$`}</MathText></span>)}
              </div>) : <p className="min-h-[2.5rem] text-[11px] text-slate-500">{k('gaugeWait')}</p>)}
              {i === 1 && both && sh.kind === 'count' && <ValueBar lab={lab} X={X} Y={Y} />}
              {i === 1 && both && sh.kind === 'after' && <AfterBars lab={lab} X={X} Y={Y} />}
            </section>
          );
        })}
      </div>

      {/* ── la réponse : la ثنائية, la renverser, la déclarer ── */}
      <div className="flex flex-wrap items-center gap-2" data-pair-card>
        <p dir="ltr" hidden={false} className="rounded-xl border-2 border-slate-300 bg-white px-2 py-1 font-mono text-lg font-extrabold text-slate-900" aria-label={k('pairLabelAria')}>
          (<span className="text-blue-700" data-pair-value-x>{X ?? '?'}</span> ; <span className="text-violet-700" data-pair-value-y>{Y ?? '?'}</span>)
        </p>
        <button type="button" onClick={swap} data-pair-swap title={k('swap')}
          className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-slate-400 bg-white px-2.5 text-sm font-bold text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">
          <Repeat className="h-4 w-4" aria-hidden="true" /> {k('swap')}
        </button>
        <button type="button" onClick={claim} data-pair-claim
          className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-emerald-600 bg-white px-2.5 text-sm font-bold text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
          <CheckCheck className="h-4 w-4" aria-hidden="true" /> {k('claim')}
        </button>
      </div>
      <p role="status" className="min-h-[2.5rem] text-sm font-bold leading-snug" data-pair-verdict={last?.kind ?? ''}>{verdict}</p>
    </div>
  );

  return (
    <ManipulationShell
      type="pair-scoreboard"
      title={title ?? k('title')}
      mission={mission ?? w('mission')}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      guided={cpActive}
      hints={[k('hint1'), k('hint2'), k('hint3')].map((h) => <MathText key={h}>{h}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      representation={(
        <EquationDisplay
          tone={both && okNow[0] && okNow[1] ? 'ok' : 'neutral'}
          tex={both ? `(x ; y) = ${pairNow}` : pairNow}
          note={<MathText>{k(statusKey)}</MathText>}
        />
      )}
      discovery={(
        <ManipulationDiscovery
          state={state}
          prompt={k('dPrompt')}
          options={discoveryOptions}
          formal={sol && (
            <div className="space-y-2" data-pair-formal>
              <EquationDisplay tone="neutral" tex={L.systemWrittenTex(lab)} note={<MathText>{k('fSystem')}</MathText>} />
              {reducedDiffers && <EquationDisplay tone="neutral" tex={L.systemReducedTex(lab)} note={<MathText>{k('fReduced')}</MathText>} />}
              <EquationDisplay tone="result" tex={L.pairTex(sol.x, sol.y)} note={<MathText>{k('fSolution', { pair: pairT(sol.x, sol.y), x: sol.x, y: sol.y })}</MathText>} />
              <p className="text-sm text-emerald-900"><MathText>{k('fRule')}</MathText></p>
              {swappedSol && <p className="text-sm text-slate-800"><MathText>{k('fOrder', { pair: pairT(swappedSol.x, swappedSol.y) })}</MathText></p>}
            </div>
          )}
        />
      )}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <div className="relative" data-pair-lab style={{ minHeight: cp.open ? 560 : undefined }}>
      {party.node}
      {cp.node}
      <ManipulationStage className="bg-gradient-to-b from-sky-50/70 to-white" data-dragging={sx.dragging || sy.dragging ? 'true' : undefined}>
        <div ref={boxRef} className="space-y-3" data-pair-scoreboard data-world={W} data-system={system}
          data-x={X ?? ''} data-y={Y ?? ''} data-solved={sol ? 'true' : 'false'} data-layout={wide ? 'side' : 'stack'} data-budget={budget} data-scene-max={sceneMax} data-ctrl-h={ctrlH} data-legend-h={legendH}>
          {cpActive && (
            <div className="space-y-1">
              <LabStepper count={2} current={doneSteps.includes('solve') ? 1 : 0} done={[doneSteps.includes('solve'), doneSteps.includes('half')]} stepAttr="data-pair-step" />
              {doneSteps.includes('solve') && !doneSteps.includes('half') && !L.halfTrial(lab) && (
                <p className="text-sm font-bold text-sky-900" data-pair-nudge><MathText>{k('cp.nudge')}</MathText></p>
              )}
            </div>
          )}
          {/* LA MANIPULATION, D'UN SEUL REGARD : le monde et ses commandes (poignées, jauges, réponse)
              tiennent ensemble dans la hauteur de l'écran de leçon — côte à côte quand c'est large,
              les commandes juste sous le monde sinon ; la grille rétrécit, jamais les commandes. */}
          <div className={wide ? 'grid grid-cols-2 items-start gap-3' : 'space-y-3'} data-pair-glance>
            {hasWorld && (
              <World lab={lab} X={X} Y={Y} w={w} k={k} grid={grid} legendRef={legendRef} />
            )}
            {controls}
          </div>
          {/* ── en dessous (secondaire, repliable — primitives/LabFold) : la lecture écrite (étroit), la note de l'histoire, la table des essais ── */}

          {sh.kind === 'after' && (
            <LabFold id="pair-scoreboard.note" title={k('noteTitle')}>
              <p className="text-xs text-slate-600">{w('rangeNote')}</p>
            </LabFold>
          )}
          {lab.trials.length > 0 && (
            <LabFold id="pair-scoreboard.trials" title={k('trialsTitle')}>
              <ul className="flex flex-wrap gap-1.5" data-pair-trials>
                {lab.trials.slice(-12).map((tr) => {
                  const okBoth = tr.ok[0] && tr.ok[1];
                  const tag = okBoth ? 'tBoth' : tr.ok[0] ? 'tOnly1' : tr.ok[1] ? 'tOnly2' : 'tNone';
                  return (
                    <li key={`${tr.x};${tr.y}`} data-pair-trial={L.pairText(tr.x, tr.y)} data-ok1={String(tr.ok[0])} data-ok2={String(tr.ok[1])} data-swapped={tr.swapped ? 'true' : 'false'}
                      className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${okBoth ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : tr.ok[0] || tr.ok[1] ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                      <bdi dir="ltr" className="font-mono">{L.pairText(tr.x, tr.y)}</bdi> {k(tag)}{tr.swapped && <> · {k('swappedTag')}</>}
                    </li>
                  );
                })}
              </ul>
            </LabFold>
          )}
        </div>
      </ManipulationStage>
      </div>
    </ManipulationShell>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** Étape « solve » : la ثنائية acceptée ; étape « half » : un essai à une seule jauge, puis la règle. */
export const CHAINS = Object.freeze({
  solve: ['readValue', 'bothWhy', 'order'],
  half: ['halfWhich', 'halfNot', 'rule'],
});
const intOf = (p) => (Lin.isInteger(p) ? Lin.toNumber(p) : null);
/** Les questions de l'étape, sans celles que les nombres de l'élève rendent sans objet (valeur non entière, x = y). */
export const chainOf = (step, lab) => CHAINS[step].filter((q) => {
  if (q === 'readValue') return intOf(L.gauges(lab, lab.solved.x, lab.solved.y)[1].left) != null;
  if (q === 'order') return lab.solved.x !== lab.solved.y;
  return true;
});
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const pairT = (x, y) => `$${L.pairTex(x, y)}$`;
/** La dernière ligne de la lecture d'une jauge (« 16 = 16 », « 24 + 5 = 29 \neq 32 ») en KaTeX. */
const lineT = (lab, i, x, y) => { const l = L.readingTex(lab, i, x, y).lines; return `$ ${l[l.length - 1]} $`; };
const ansTex = (n) => <MathText>{`$${n}$`}</MathText>;

/** Chaque question est construite sur LES ثنائيات de l'élève (rien n'est écrit en dur) ; `k` : les textes de `pairScoreboard`. */
export const QUESTIONS = {
  readValue: (lab, k) => {
    const { x, y } = lab.solved; const v = intOf(L.gauges(lab, x, y)[1].left);
    const nums = { pair: pairT(x, y), v };
    return {
      id: 'readValue', kind: 'number', expected: String(v), answer: ansTex(v),
      prompt: Mx(k, 'readValue.prompt', nums), hints: [Mx(k, 'readValue.hint1', nums), Mx(k, 'readValue.hint2', { ...nums, r: lineT(lab, 1, x, y) })],
      explain: Mx(k, 'readValue.explain', { ...nums, r: lineT(lab, 1, x, y) }),
    };
  },
  bothWhy: (lab, k) => {
    const { x, y } = lab.solved; const nums = { pair: pairT(x, y), r1: lineT(lab, 0, x, y), r2: lineT(lab, 1, x, y) };
    return {
      id: 'bothWhy', kind: 'choice',
      prompt: Mx(k, 'bothWhy.prompt', nums),
      options: [
        { text: Mx(k, 'bothWhy.wrongFirst'), why: Mx(k, 'bothWhy.whyFirst', nums) },
        { text: Mx(k, 'bothWhy.right'), correct: true },
        { text: Mx(k, 'bothWhy.wrongSecond'), why: Mx(k, 'bothWhy.whySecond', nums) },
      ],
      hints: [Mx(k, 'bothWhy.hint1', nums), Mx(k, 'bothWhy.hint2', nums)], explain: Mx(k, 'bothWhy.explain', nums),
    };
  },
  order: (lab, k) => {
    const { x, y } = lab.solved; const sw = { x: y, y: x };
    const ok = L.okPair(lab, sw.x, sw.y); const both = ok[0] && ok[1];
    const bad = ok[0] ? 1 : 0;   // la jauge qui reste éteinte (la 1re éteinte)
    const nums = { pair: pairT(x, y), swap: pairT(sw.x, sw.y), i: bad + 1, r: lineT(lab, bad, sw.x, sw.y), r1: lineT(lab, 0, sw.x, sw.y), r2: lineT(lab, 1, sw.x, sw.y) };
    return {
      id: 'order', kind: 'choice', cols: 2,
      prompt: Mx(k, 'order.prompt', nums),
      options: [
        { text: Mx(k, 'order.yes'), correct: both, why: both ? undefined : Mx(k, 'order.whyYes', nums) },
        { text: Mx(k, 'order.no'), correct: !both, why: both ? Mx(k, 'order.whyNoBoth', nums) : undefined },
      ],
      hints: [Mx(k, 'order.hint1', nums), Mx(k, 'order.hint2', nums)], explain: Mx(k, both ? 'order.explainBoth' : 'order.explainNo', nums),
    };
  },
  halfWhich: (lab, k) => {
    const h = L.halfTrial(lab); const w = h.ok[0] ? 1 : 2; const o = 3 - w;
    const nums = { pair: pairT(h.x, h.y), w, o, rw: lineT(lab, w - 1, h.x, h.y), ro: lineT(lab, o - 1, h.x, h.y) };
    const opts = [
      { n: 1, text: Mx(k, 'halfWhich.only1'), why: Mx(k, 'halfWhich.whyOnly', { ...nums, n: 1, rn: lineT(lab, 0, h.x, h.y) }) },
      { n: 2, text: Mx(k, 'halfWhich.only2'), why: Mx(k, 'halfWhich.whyOnly', { ...nums, n: 2, rn: lineT(lab, 1, h.x, h.y) }) },
    ].map((e) => (e.n === w ? { text: e.text, correct: true } : { text: e.text, why: e.why }));
    opts.push({ text: Mx(k, 'halfWhich.both'), why: Mx(k, 'halfWhich.whyBoth', nums) });
    return {
      id: 'halfWhich', kind: 'choice',
      prompt: Mx(k, 'halfWhich.prompt', nums), options: opts,
      hints: [Mx(k, 'halfWhich.hint1', nums), Mx(k, 'halfWhich.hint2', nums)], explain: Mx(k, 'halfWhich.explain', nums),
    };
  },
  halfNot: (lab, k) => {
    const h = L.halfTrial(lab); const w = h.ok[0] ? 1 : 2; const o = 3 - w;
    const nums = { pair: pairT(h.x, h.y), w, o, rw: lineT(lab, w - 1, h.x, h.y), ro: lineT(lab, o - 1, h.x, h.y) };
    return {
      id: 'halfNot', kind: 'choice',
      prompt: Mx(k, 'halfNot.prompt', nums),
      options: [
        { text: Mx(k, 'halfNot.wrongYes', nums), why: Mx(k, 'halfNot.whyYes', nums) },
        { text: Mx(k, 'halfNot.right', nums), correct: true },
        { text: Mx(k, 'halfNot.wrongNone', nums), why: Mx(k, 'halfNot.whyNone', nums) },
      ],
      hints: [Mx(k, 'halfNot.hint1', nums), Mx(k, 'halfNot.hint2', nums)], explain: Mx(k, 'halfNot.explain', nums),
    };
  },
  rule: (lab, k) => {
    const sol = lab.solved;
    const reducedDiffers = lab.src.some((_, i) => L.eqWrittenTex(lab, i) !== L.eqReducedTex(lab, i));
    const only1 = L.halfTrial(lab, 1); const only2 = L.halfTrial(lab, 2);
    const options = [];
    if (only1) options.push({ text: <MathText>{k('dOptFirst')}</MathText>, why: <MathText>{k('dWhyFirst', { pair: pairT(only1.x, only1.y) })}</MathText> });
    if (only2) options.push({ text: <MathText>{k('dOptSecond')}</MathText>, why: <MathText>{k('dWhySecond', { pair: pairT(only2.x, only2.y) })}</MathText> });
    const sw = L.swappedRefused(lab) ?? (sol.x !== sol.y ? { x: sol.y, y: sol.x } : null);
    if (sw && !L.okPair(lab, sw.x, sw.y).every(Boolean)) options.push({ text: <MathText>{k('dOptAny')}</MathText>, why: <MathText>{k('dWhyAny', { pair: pairT(sw.x, sw.y) })}</MathText> });
    options.push({ text: <MathText>{k('dOptRight')}</MathText>, correct: true });
    return {
      id: 'rule', kind: 'choice',
      prompt: <MathText>{k('dPrompt')}</MathText>, options,
      hints: [Mx(k, 'rule.hint1'), Mx(k, 'rule.hint2')],
      explain: (
        <div className="space-y-2" data-pair-formal>
          <EquationDisplay tone="neutral" tex={L.systemWrittenTex(lab)} note={<MathText>{k('fSystem')}</MathText>} />
          {reducedDiffers && <EquationDisplay tone="neutral" tex={L.systemReducedTex(lab)} note={<MathText>{k('fReduced')}</MathText>} />}
          <EquationDisplay tone="result" tex={L.pairTex(sol.x, sol.y)} note={<MathText>{k('fSolution', { pair: pairT(sol.x, sol.y), x: sol.x, y: sol.y })}</MathText>} />
          <p className="text-sm text-emerald-900"><MathText>{k('fRule')}</MathText></p>
        </div>
      ),
    };
  },
};

/* ── une règle graduée, une poignée : un nombre de la ثنائية (− à gauche, près du minimum) ── */
function Ruler({ which, stretch, range, value, width, edge, handleLabel, notSet, less, more, tone }) {
  const steps = Math.max(1, range.max - range.min);
  const mu = (width - 2 * edge) / steps;
  const px = (v) => edge + (v - range.min) * mu;
  const every = steps <= 12 && width >= 180 ? 1 : 5;
  const labelled = (u) => (width < 160 ? u === range.min || u === range.max : (u - range.min) % every === 0 || u === range.max);
  const grads = Array.from({ length: steps + 1 }, (_, i) => range.min + i);
  const shown = value ?? range.min;
  const color = tone === 'blue' ? '#1D4ED8' : '#7C3AED';
  return (
    <div dir="ltr" className="flex items-center gap-2" data-pair-ruler={which}>
      <button type="button" onClick={() => stretch.nudge(-1)} aria-label={less} disabled={value != null && value <= range.min} data-pair-less={which}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Minus className="h-5 w-5" aria-hidden="true" /></button>
      <div {...stretch.trackProps} className="relative shrink-0" style={{ ...stretch.trackProps.style, height: 48, width }}>
        <svg width={width} height={48} className="absolute inset-0" aria-hidden="true" focusable="false">
          <rect x={edge - 4} y={24} width={steps * mu + 8} height={5} rx={2} fill={color} opacity={0.85} />
          {grads.map((u) => {
            const major = labelled(u);
            return (
              <g key={u}>
                <line x1={px(u)} x2={px(u)} y1={30} y2={major ? 37 : 33} stroke="#64748B" strokeWidth={major ? 1.4 : 1} />
                {major && <text x={px(u)} y={47} textAnchor="middle" fontSize={10} fill="#334155" fontFamily="ui-monospace, monospace">{String(u).replace('-', '−')}</text>}
              </g>
            );
          })}
        </svg>
        <div
          {...stretch.handleProps({ label: handleLabel, valueText: value == null ? notSet : String(value) })}
          data-pair-handle={which}
          className={`absolute top-0 flex h-11 min-w-[44px] -translate-x-1/2 items-start justify-center rounded-xl border-2 outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${stretch.dragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-400 bg-white/70'}`}
          style={{ left: px(shown), cursor: stretch.dragging ? 'grabbing' : 'grab' }}
        >
          <span className="mt-0.5 whitespace-nowrap rounded-full px-1.5 font-mono text-sm font-extrabold text-white" style={{ background: color }}>{which} = {value ?? '?'}</span>
        </div>
      </div>
      <button type="button" onClick={() => stretch.nudge(1)} aria-label={more} disabled={value != null && value >= range.max} data-pair-more={which}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Plus className="h-5 w-5" aria-hidden="true" /></button>
    </div>
  );
}

/* ── le monde dessiné : le cadre de l'équation (1), dans une grille taillée pour l'écran ── */
function World({ lab, X, Y, w, grid, legendRef }) {
  const sh = lab.shape;
  const g = L.slots(sh.N, X, Y);
  const Figure = { football: MatchCard, coins: Coin, staff: Person }[lab.world];
  // Le monde « after » : les a premiers hommes et les b premières femmes partent (grisés).
  let seenX = 0;
  let seenY = 0;
  const leaving = (kind) => {
    if (sh.kind !== 'after') return false;
    if (kind === 'x') { seenX += 1; return seenX <= sh.a; }
    seenY += 1; return seenY <= sh.b;
  };
  const cells = [
    ...g.inside.map((kind) => ({ kind, out: false })),
    ...Array.from({ length: g.empty }, () => ({ kind: 'empty', out: false })),
    ...g.overflow.map((kind) => ({ kind, out: true })),
  ];
  return (
    <div className="space-y-1 rounded-2xl border-2 border-slate-200 bg-white p-1" data-pair-world={lab.world}>
      <div ref={legendRef} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 pe-12 text-xs font-bold text-slate-700 relative">
        <span className="inline-flex items-center gap-1"><span className="inline-block h-4 w-4"><Figure kind="x" shape={sh} /></span><bdi dir="ltr" className="text-blue-700">x</bdi><> {w('x')}</></span>
        <span className="inline-flex items-center gap-1"><span className="inline-block h-4 w-4"><Figure kind="y" shape={sh} /></span><bdi dir="ltr" className="text-violet-700">y</bdi><> {w('y')}</></span>
        <span className="text-slate-600" data-pair-frame-count={Math.min(g.total, sh.N)}>{w('frame', { used: Math.min(g.total, sh.N) })}</span>
        {g.overflow.length > 0 && <span className="text-rose-700" data-pair-overflow={g.overflow.length}>{w('overflow', { n: g.overflow.length })}</span>}
        {g.empty > 0 && <span className="font-normal text-slate-500">{w('empty', { n: g.empty })}</span>}
        {sh.kind === 'after' && <span className="font-normal text-slate-500">{w('leavingShort')}</span>}
        <Deco world={lab.world} />
      </div>
      <div dir="ltr" className="mx-auto grid" style={{ gridTemplateColumns: `repeat(${grid.cols}, ${grid.cell}px)`, gap: 4, width: grid.width }} data-pair-frame={sh.N} data-cell={grid.cell}>
        {cells.map((c, i) => {
          const away = c.kind !== 'empty' && leaving(c.kind);
          return (
            <div key={i} data-pair-cell={c.kind} data-outside={c.out ? 'true' : undefined} data-leaving={away ? 'true' : undefined}
              className={`relative ${c.out ? 'rounded-md outline outline-2 outline-dashed outline-rose-400 bg-rose-50' : ''}`} style={{ width: grid.cell, height: grid.cell }}>
              {c.kind === 'empty'
                ? <div className="h-full w-full rounded-md border-2 border-dashed border-slate-300 bg-white" />
                : <div className={away ? 'h-full w-full opacity-30 grayscale' : 'h-full w-full'}><Figure kind={c.kind} shape={sh} /></div>}
              {away && <span aria-hidden="true" className="absolute -top-0.5 end-0 text-[10px] leading-none">🧳</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** La grandeur de l'équation (2) d'un monde « count » (points, dinars), dans la jauge (2). */
export function ValueBar({ lab, X, Y }) {
  const b = L.valueBar(lab.shape, X, Y);
  const W0 = 200;
  const sc = (v) => (v / b.top) * (W0 - 8);
  const hit = b.have === b.target;
  return (
    <div data-pair-value={b.have} data-target={b.target} className="mt-1">
      <svg viewBox={`0 0 ${W0} 16`} width="100%" height={16} aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
        <rect x={4} y={3} width={W0 - 8} height={10} rx={4} fill="#F1F5F9" stroke="#CBD5E1" />
        <rect x={4} y={3} width={sc(b.xPart)} height={10} rx={3} fill="#059669" style={{ transition: 'width 160ms' }} className="motion-reduce:transition-none" />
        <rect x={4 + sc(b.xPart)} y={3} width={sc(b.yPart)} height={10} rx={3} fill="#F59E0B" style={{ transition: 'width 160ms, x 160ms' }} className="motion-reduce:transition-none" />
        <line x1={4 + sc(b.target)} x2={4 + sc(b.target)} y1={0} y2={16} stroke={hit ? '#047857' : '#E11D48'} strokeWidth={2.5} />
      </svg>
    </div>
  );
}

/** Le panneau « après » (نشاط 1), dans la jauge (2) : m fois les hommes restants contre les femmes restantes. */
function AfterBars({ lab, X, Y }) {
  const p = L.afterPanel(lab.shape, X, Y);
  const W0 = 200;
  const sc = (v) => (Math.max(0, v) / p.top) * (W0 - 8);
  return (
    <div className="mt-1" data-pair-after data-equal={String(p.equal)}>
      <svg viewBox={`0 0 ${W0} 22`} width="100%" height={22} aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
        <rect x={4} y={2} width={sc(p.twiceMen)} height={8} rx={3} fill="#1D4ED8" />
        <rect x={4} y={12} width={sc(p.womenLeft)} height={8} rx={3} fill="#7C3AED" />
      </svg>
    </div>
  );
}

/* ── les objets dessinés (SVG paramétré, jamais une image) ── */
export function MatchCard({ kind }) {
  const win = kind === 'x';
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="21" height="21" rx="4" fill={win ? '#059669' : '#F59E0B'} stroke={win ? '#065F46' : '#B45309'} />
      {win ? (
        <g transform="translate(12 12)">
          <circle r="6" fill="#fff" stroke="#0F172A" strokeWidth="1" />
          <path d="M0 -2.6 L2.5 -0.8 L1.6 2.2 L-1.6 2.2 L-2.5 -0.8 Z" fill="#0F172A" />
        </g>
      ) : (
        <g stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><line x1="7" x2="17" y1="9.5" y2="9.5" /><line x1="7" x2="17" y1="14.5" y2="14.5" /></g>
      )}
    </svg>
  );
}

export function Coin({ kind, shape }) {
  const big = kind === 'x';
  const v = big ? shape.p : shape.q;
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r={big ? 10.5 : 9} fill={big ? '#FBBF24' : '#CBD5E1'} stroke={big ? '#B45309' : '#64748B'} strokeWidth="1.4" />
      <circle cx="12" cy="12" r={big ? 7.5 : 6.4} fill="none" stroke={big ? '#D97706' : '#94A3B8'} strokeWidth="0.8" />
      <text x="12" y="15.2" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#1F2937" fontFamily="ui-monospace, monospace">{v}</text>
    </svg>
  );
}

function Person({ kind }) {
  const man = kind === 'x';
  return (
    <svg viewBox="0 0 24 30" width="100%" height="100%" aria-hidden="true" focusable="false">
      <rect x="3" y="24" width="18" height="4" rx="1" fill="#CBD5E1" />
      {man ? (
        <g>
          <circle cx="12" cy="7.5" r="4.5" fill="#F2C9A0" />
          <path d="M7.6 6 Q12 1.8 16.4 6 Q16 3 12 2.6 Q8 3 7.6 6 Z" fill="#334155" />
          <path d="M4.5 24 Q4.5 13 12 13 Q19.5 13 19.5 24 Z" fill="#1D4ED8" />
        </g>
      ) : (
        <g>
          <path d="M6.5 11 Q6.5 2 12 2 Q17.5 2 17.5 11 Q17.5 14 12 14 Q6.5 14 6.5 11 Z" fill="#7C3AED" />
          <circle cx="12" cy="8" r="3.6" fill="#F2C9A0" />
          <path d="M4.5 24 Q4.5 13.5 12 13.5 Q19.5 13.5 19.5 24 Z" fill="#8B5CF6" />
        </g>
      )}
    </svg>
  );
}

/**
 * Le DÉCOR — sans information, sans état du lab. Saison : le ballon rebondit, l'écharpe
 * flotte. Service : les aiguilles de l'horloge tournent. Cagnotte : la pièce tourne.
 * `aria-hidden`, hors du clavier, immobile sous `prefers-reduced-motion`.
 */
export function Deco({ world }) {
  const reduce = useReducedMotion();
  const [taps, setTaps] = useState(0);
  const tap = () => { if (!reduce) setTaps((n) => n + 1); };
  const anim = taps > 0 && !reduce;
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" onClick={tap} data-deco={world}
      className="absolute -top-1 end-0 h-8 w-10 rounded-xl focus:outline-none">
      <svg viewBox="0 0 70 60" width="100%" height="100%">
        <style>{'.ps-bounce{animation:ps-b .5s ease-out 2}@keyframes ps-b{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}.ps-wave{transform-origin:8px 14px;animation:ps-w .4s ease-in-out 4}@keyframes ps-w{0%,100%{transform:skewY(0)}50%{transform:skewY(8deg)}}.ps-flip{transform-box:fill-box;transform-origin:center;animation:ps-f .6s linear 2}@keyframes ps-f{0%{transform:scaleX(1)}50%{transform:scaleX(.1)}100%{transform:scaleX(1)}}@media (prefers-reduced-motion: reduce){.ps-bounce,.ps-wave,.ps-flip{animation:none}}'}</style>
        {world === 'football' && (
          <g>
            <g key={`w${taps}`} className={anim ? 'ps-wave' : undefined}>
              <rect x="6" y="8" width="2" height="34" fill="#64748B" />
              <rect x="8" y="10" width="11" height="14" fill="#16A34A" />
              <rect x="19" y="10" width="11" height="14" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5" />
              <circle cx="21" cy="17" r="3.4" fill="#DC2626" /><circle cx="22.3" cy="17" r="2.8" fill="#F8FAFC" />
            </g>
            <g key={`b${taps}`} className={anim ? 'ps-bounce' : undefined}>
              <circle cx="52" cy="46" r="8" fill="#fff" stroke="#0F172A" strokeWidth="1.4" />
              <path d="M52 42.5 L55.3 44.9 L54 48.8 L50 48.8 L48.7 44.9 Z" fill="#0F172A" />
            </g>
            <rect x="34" y="55" width="34" height="3" rx="1.5" fill="#CBD5E1" />
          </g>
        )}
        {world === 'staff' && (
          <g>
            <circle cx="35" cy="28" r="22" fill="#F8FAFC" stroke="#334155" strokeWidth="2.5" />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => (
              <line key={h} x1="35" y1="9" x2="35" y2="12" stroke="#64748B" strokeWidth="1.5" transform={`rotate(${h * 30} 35 28)`} />
            ))}
            <line x1="35" y1="28" x2="35" y2="15" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round"
              style={{ transformOrigin: '35px 28px', transform: `rotate(${taps * 90}deg)`, transition: reduce ? 'none' : 'transform 600ms ease-in-out' }} />
            <line x1="35" y1="28" x2="45" y2="28" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round"
              style={{ transformOrigin: '35px 28px', transform: `rotate(${taps * 30}deg)`, transition: reduce ? 'none' : 'transform 600ms ease-in-out' }} />
            <circle cx="35" cy="28" r="2" fill="#0F172A" />
          </g>
        )}
        {world === 'coins' && (
          <g>
            <rect x="12" y="30" width="46" height="26" rx="8" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2" opacity="0.8" />
            <g key={taps} className={anim ? 'ps-flip' : undefined}>
              <circle cx="35" cy="20" r="12" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
              <circle cx="35" cy="20" r="8" fill="none" stroke="#D97706" strokeWidth="1" />
            </g>
          </g>
        )}
      </svg>
    </button>
  );
}
