import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Tv } from 'lucide-react';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import * as Lq from '@smarter-academy/core/arithmetic/linear.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import LabFold from '../primitives/LabFold';
import MovablePanel from '../primitives/MovablePanel';
import PlayerFigure from '../primitives/PlayerFigure';
import MathText from '../../components/MathText';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { Mx, $, useTick } from './vecCp';
import * as L from '../logic/shapeProver';

/**
 * shape-prover — LE « فار » DU ملعب الحي (unité 12 « الأشعة في معلم », درس « توظيف الحساب الشعاعي والإحداثيات لإثبات
 * الخواص الهندسية » : طرائق p. 145 « إنجاز برهان » et « حساب مسافات », دوري الآن p. 145).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève DÉPLACE un plot (شاخص) d'entraînement sur les nœuds du terrain quadrillé (glisser, toucher un nœud, flèches,
 *    boutons) — C du triangle (مبتدئ) ; C qui GLISSE sur sa droite x = −2 puis D, le quatrième plot (متقدم). Il CHOISIT ce
 *    qu'il affirme (« قائم في A », « مربّع », « B و D على (𝒞) ») et les CARTES-PREUVES qu'il envoie au فار.
 * B. Idée : la nature d'une figure se PROUVE dans un repère par des égalités calculées (carrés des distances, composantes,
 *    milieux), et par des preuves SUFFISANTES — pas par ce que l'œil voit sur la grille.
 * C. Le triangle / le quadrilatère se déforme ; chaque carte recalcule ses deux nombres et passe de ≠ à = ; les traces
 *    des positions jugées restent sur le terrain (vertes acceptées, rouges refusées) ; le cercle (𝒞) au quadrilatère.
 * D. Les cartes ($AB^2 + AC^2 \overset{?}{=} BC^2$ : $10 + 5 = 15 \neq 17$), le verdict écrit du فار, le calcul des carrés
 *    depuis les coordonnées (pli « الحساب من الإحداثيات »), la liste des mراجعات.
 * E. À découvrir avant la règle : un triangle qui « a l'air » droit est refusé par ses nombres ; la carte d'un AUTRE
 *    sommet ne prouve pas l'angle droit en A ; متوازي الأضلاع seul ne fait ni مستطيل ni مربّع, deux diagonales égales seules
 *    non plus ; le y² s'en va dans l'équation de la طريقة.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        prouver une nature (triangle rectangle / isocèle ; parallélogramme, rectangle, losange, carré ; point d'un
 *                  cercle) par le calcul dans un repère orthonormé, avec des preuves suffisantes
 *   OBJECT         des plots d'entraînement sur un terrain de quartier quadrillé ; un dossier de cartes pour le فار
 *   VARIABLE       la position du plot tenu (nœud par nœud ; y seul sur la droite x = −2) ; l'affirmation ; le choix des cartes
 *   INVARIANT      les plots fixes ne bougent pas ; à la position d'un angle droit, toutes les positions acceptées s'alignent
 *                  sur la perpendiculaire (traces vertes) ; sur la droite de C, l'écart AC² − (AB² + BC²) varie de 4 par pas
 *   TRANSFORMATION les carrés des distances, les composantes et les milieux changent en direct
 *   CONSTRAINT     les plots restent sur les nœuds du terrain, jamais l'un sur l'autre ; C reste sur x = −2 (متقدم)
 *   RESISTANCE     le فار refuse : une affirmation fausse à cette position (ses nombres écrits), la carte d'un autre sommet
 *                  (MISC-MAALAM-FITHAGHURAS-WATAR), une preuve insuffisante en nommant la carte qui manque
 *                  (MISC-MAALAM-MUTAWAZI-KAFI), trois plots alignés
 *   EVIDENCE       les cartes (= / ≠), les traces sur le terrain, le verdict, la liste des مراجعات
 *   CONTRAST       مبتدئ : le départ qui a l'air droit (refusé) contre une position vraiment droite (acceptée) ; متقدم : le départ
 *                  D(2 ; 2) aux diagonales égales (pas un parallélogramme) contre le carré
 *   PREDICTION     choisir sa carte AVANT de demander le فار ; trouver y en suivant l'écart qui diminue
 *   DISCOVERY      « on prouve par des égalités calculées, la bonne et assez » — distracteurs réfutés par ses propres essais
 *   FORMALIZATION  معارف من المنصّة (module 2) et la طريقة p. 145 (module 3)
 *   TRANSFER       دوري الآن p. 145, ex-13, 18, 19, 21, 24, 26, 27, la banque d'exercices
 *
 * Tous les verdicts viennent de logic/shapeProver.js (vectors.js : triangleNature, quadNature, onCircle, distanceSquared) ;
 * le dessin est en flottants mais rien n'est « presque » égal. Manuel (§6bis) : chaque demande au فار est un choix —
 * aucune auto-complétion.
 *
 * DÉCOR (exigence du propriétaire, monde `football`) : un ملعب جواري en gazon synthétique (bandes de tonte, lignes,
 * projecteurs), un téléphone sur trépied qui filme le défi (point « تسجيل » qui clignote), un ballon qu'on touche pour
 * le faire rouler vers les plots, le balayage de l'écran du فار à chaque demande et un coéquipier (PlayerFigure) qui saute
 * de joie à un « قبل » ou baisse la tête à un refus. `aria-hidden`, hors clavier
 * (`tabIndex=-1`), `[data-deco]`, sans aucune information ; immobile sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (MANIPULATION_CONTRACT §8bis) : la scène est budgétée sur l'écran de leçon (`useLessonViewport`) moins
 * ce que le bloc `[data-sp-glance]` mesure EN PLUS d'elle (commandes, affirmations, cartes, verdict) ; au-delà de 640 px le
 * terrain et le dossier du فار sont côte à côte ; la poignée est SUR le plot, les flèches juste dessous ; le calcul et la
 * liste des مراجعات sont dans des `LabFold` sous le bloc mesuré. Sous 640 px : puces et cartes compactes, et le verdict
 * s'affiche SUR le terrain comme l'écran du فار (`MovablePanel`, déplaçable) — il disparaît dès que l'élève rejoue (déplace
 * le plot, change d'affirmation ou de carte). Sous 250 px : le bloc reprend la marge de la scène (-mx-2), les cartes du
 * triangle tiennent sur une ligne, celles du quadrilatère montrent la relation en direct (= / ≠) à la place du « ؟ ».
 *
 * PROPS (à plat ou groupées dans `numbers`, comme levels.js) : `mode` ('triangle' | 'unknown'), `A`, `B`, `C` (triangle),
 * `A`, `B`, `rail` { x, min, max, start }, `D` (unknown), `theme` ('football'), `title`, `lead`, `mission`, `level`, `levels`,
 * `onTrial(evidence)` à chaque demande au فار, `onFinished({ mode, trials })` à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-shape-prover][data-mode][data-stage][data-solved], [data-sp-glance], [data-sp-scene],
 * [data-sp-handle=C|D][data-x][data-y], [data-sp-move=left|right|up|down], [data-sp-claim=<id>][aria-pressed],
 * [data-sp-card=<id>][aria-pressed][data-balanced], [data-sp-check], [data-sp-verdict=<kind>], [data-sp-claim] with ✓ when proved,
 * [data-sp-next-quad], [data-sp-back-tri], [data-sp-trace][data-ok], [data-lab-fold=shape-prover.calc|trials], [data-deco].
 */
const ID = (claim) => claim.replace(':', '_');
const num = (f) => Lq.toNumber(f);
const tex = (f) => V.numLatex(f);
const sq = (name) => `${name}^2`;
const C_OK = '#059669'; const C_NO = '#E11D48';

export default function ShapeProver({
  numbers, mode: mode0, A: A0, B: B0, C: C0, D: D0, rail: rail0, theme = 'football', title, lead, mission, level,
  levels: withLevels = true, checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.shapeProver.${key}`, o), [t]);
  const flat = { mode: mode0, A: A0, B: B0, C: C0, D: D0, rail: rail0 };
  const initialNumbers = { ...Object.fromEntries(Object.entries(flat).filter(([, v]) => v != null)), ...(numbers ?? {}) };
  const state = useManipulation({ type: 'shape-prover', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const make = () => L.init(nums);
  const [lab, setLab] = useState(make);
  const sceneKey = `${JSON.stringify(nums)}|${state.epoch}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [doneIds, setDoneIds] = useState([]);   // les preuves dont la suite de questions est finie
  if (scene.key !== sceneKey) { setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(make()); setDoneIds([]); }   // « إعادة » : tout repart
  const unknown = lab.mode === 'unknown';
  const quad = lab.stage === 'quad';
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  /* ── les questions PENDANT le labo (primitives/LabCheckpoint) : après chaque preuve acceptée par le فار, une suite sur ce qu'il vient de
     calculer ; la dernière preuve finit par la règle et remplace la découverte automatique. L'enseignant seul peut les couper. ── */
  const cpSettings = useLabCheckpointSettings('shape-prover');
  const cpEnabled = cpOn && cpSettings.enabled;
  const proofs = L.proofsOf(lab);
  const pending = cpEnabled ? proofs.find((g) => lab.solved[g] && !doneIds.includes(g)) ?? null : null;
  const chain = pending ? chainOf(lab, pending) : null;
  const cp = useLabCheckpoint({
    id: chain ? pending : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, pending, k)) : null,
    reached: !!pending,
    resetKey: scene.inits,
    onRetry: () => { celebrated.current.delete(pending); setLab((s) => L.retryClaim(s, pending)); },
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setDoneIds((d) => (d.includes(id) ? d : [...d, id]));
      if (chainOf(lab, id).includes('rule')) { state.discover(); state.formalize(); }
    },
  });
  const solvedAll = L.discoveryReady(lab);
  const ready = solvedAll && !cpEnabled;
  const tick = useTick();
  const stepDone = proofs.map((g) => !!lab.solved[g] && (!cpEnabled || doneIds.includes(g)));
  const stepNow = Math.max(0, stepDone.findIndex((d) => !d));
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // « إعادة » : on refête
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.has(proofs[i])) return;
      celebrated.current.add(proofs[i]);
      party.celebrate({ n: stepDone.filter(Boolean).length, total: proofs.length });
    });
  }, [stepDone.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son : un déclic par pas du plot ou par carte, le drapeau quand le فار accepte, « over » quand il refuse
  const trialN = lab.trials.length;
  useEffect(() => {
    const tr = lab.trials[trialN - 1];
    if (tr) playSfx(tr.kind === 'ok' ? 'flag' : 'over');
  }, [trialN]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (state.isFormal) state.report(onFinished, { mode: lab.mode, trials: lab.trials.length });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => { if (nTrials > 0) state.report(onTrial, L.evidenceOf(lab)); }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : largeur, écran de leçon, ce que le bloc « glance » ajoute à la scène ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const sceneRef = useRef(null);
  const sceneHRef = useRef(260);
  const [width, setWidth] = useState(320);
  const [overhead, setOverhead] = useState(300);
  const wide = width >= 640;
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(200, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(120, Math.ceil(glanceRef.current.getBoundingClientRect().height) - sceneHRef.current));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (glanceRef.current) ro.observe(glanceRef.current);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 700;
  const narrow = width < 400;
  // sous 640 px (téléphones) : puces et cartes compactes, verdict flottant sur le terrain (MovablePanel)
  const compact = width < 640;
  const innerW = width;
  const sceneW = wide ? Math.min(Math.floor(width * 0.54), 560) : Math.min(innerW, 560);
  const panelW = wide ? width - sceneW - 12 : innerW;
  const budget = wide ? screenH - 40 : screenH - overhead - 20;
  const sceneH = Math.round(Math.max(150, Math.min(L.naturalHeight(lab, sceneW), budget, 560)));
  sceneHRef.current = wide ? 0 : sceneH;
  const fr = L.frame(lab, { width: sceneW, height: sceneH, pad: narrow ? 16 : 22 });

  /* ── le plot tenu : glisser sur le terrain, toucher un nœud, flèches ── */
  const held = lab.held;
  const [dragging, setDragging] = useState(false);
  const nodeFromEvent = (e) => {
    const r = sceneRef.current.getBoundingClientRect();
    return fr.fromPx(e.clientX - r.left, e.clientY - r.top);
  };
  const onSceneDown = (e) => {
    if (e.button > 0 || !sceneRef.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    const p = nodeFromEvent(e);
    setLab((s) => L.moveHeld(s, p));
  };
  const onSceneMove = (e) => { if (dragging) { const p = nodeFromEvent(e); tick(); setLab((s) => L.moveHeld(s, p)); } };
  const onSceneUp = (e) => {
    if (!dragging) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };
  const nudge = (dx, dy) => { tick(dx + dy < 0 ? 0.75 : 1); setLab((s) => L.nudge(s, dx, dy)); };
  const onHandleKey = (e) => {
    const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (m) { e.preventDefault(); nudge(...m); return; }
    if (e.key === 'Enter') { e.preventDefault(); ask(); }
  };
  const [scan, setScan] = useState(0);
  const ask = () => { setLab(L.check); setScan((n) => n + 1); };

  /* ── lectures vivantes ── */
  const cards = L.cardsOf(lab);
  const last = lab.last;
  const [hx, hy] = L.xy(lab.pts[held]);

  /** L'écriture d'une carte : la question (île KaTeX) et ses nombres. */
  const cardTex = useCallback((c, compact = false) => {
    const rel = c.balanced ? '=' : '\\neq';
    // sous 250 px, au quadrilatère : une ligne par carte, la relation EN DIRECT à la place du « ؟ » (les nombres restent
    // dans le pli « الحساب من الإحداثيات »)
    if (compact === 'tiny' && ['pair', 'len', 'circ'].includes(c.kind)) {
      const r = c.balanced ? '=' : '\\neq';
      if (c.id === 'vec') return { head: `$\\overrightarrow{AB} ${r} \\overrightarrow{DC}$`, body: null };
      if (c.id === 'mid') return { head: k('cardMid'), body: `$${r}$` };
      if (c.kind === 'len') return { head: `$${sq(c.names[0])} ${r} ${sq(c.names[1])}$`, body: null };
      return { head: `$IB^2 ,\\ ID^2 ${r} IA^2$`, body: null };
    }
    if (c.kind === 'pyth') {
      const [p, q, r] = c.names;
      const sum = compact ? tex(c.left) : `${tex(c.parts[0])} + ${tex(c.parts[1])} = ${tex(c.left)}`;
      return { head: `$${sq(p)} + ${sq(q)} \\overset{?}{=} ${sq(r)}$`, body: `$${sum} ${rel} ${tex(c.right)}$` };
    }
    if (c.kind === 'iso' || c.kind === 'len') {
      const [p, q] = c.names;
      return { head: `$${sq(p)} \\overset{?}{=} ${sq(q)}$`, body: `$${tex(c.left)} ${rel} ${tex(c.right)}$` };
    }
    if (c.id === 'vec') {
      return { head: '$\\overrightarrow{AB} \\overset{?}{=} \\overrightarrow{DC}$', body: `$${V.vecLatex(c.left)} ${rel} ${V.vecLatex(c.right)}$` };
    }
    if (c.id === 'mid') {
      return { head: k('cardMid'), body: `$(${tex(c.left.x)}\\,;\\,${tex(c.left.y)}) ${rel} (${tex(c.right.x)}\\,;\\,${tex(c.right.y)})$` };
    }
    return { head: '$IB^2 ,\\ ID^2 \\overset{?}{=} IA^2$', body: `$${tex(c.parts[0])} ,\\ ${tex(c.parts[1])} \\;${rel}\\; ${tex(c.right)}$` };
  }, [k]);

  /** L'égalité (ou l'inégalité) que le verdict cite, depuis la carte jugée à la position de l'essai. */
  const verdictEq = (trial, cardId) => {
    if (!cardId) return '';
    const s = { ...lab, pts: { ...lab.pts, [trial.held]: V.point(...trial.at) } };
    const c = L.card(s, cardId);
    const rel = c.balanced ? '=' : '\\neq';
    if (c.kind === 'pyth') { const [p, q, r] = c.names; return `$${sq(p)} + ${sq(q)} = ${tex(c.parts[0])} + ${tex(c.parts[1])} = ${tex(c.left)} ${rel} ${tex(c.right)} = ${sq(r)}$`; }
    if (c.kind === 'iso' || c.kind === 'len') { const [p, q] = c.names; return `$${sq(p)} = ${tex(c.left)} ${rel} ${tex(c.right)} = ${sq(q)}$`; }
    if (c.id === 'vec') return `$\\overrightarrow{AB}${V.vecLatex(c.left)} ${rel} \\overrightarrow{DC}${V.vecLatex(c.right)}$`;
    if (c.id === 'mid') return `$(${tex(c.left.x)}\\,;\\,${tex(c.left.y)}) ${rel} (${tex(c.right.x)}\\,;\\,${tex(c.right.y)})$`;
    return `$IB^2 = ${tex(c.parts[0])}\\,,\\ ID^2 = ${tex(c.parts[1])}\\,,\\ IA^2 = ${tex(c.right)}$`;
  };

  const verdict = (() => {
    if (!last) return null;
    const X = last.claim?.split(':')[1];
    const okCard = last.kind === 'ok' ? last.cards.find((c) => L.REQUIRE[last.claim].flat().includes(c)) : null;
    switch (last.kind) {
      case 'ok': {
        if (last.claim.startsWith('right:')) return k('v_ok_right', { eq: verdictEq(last, `pyth:${X}`), X });
        if (last.claim.startsWith('iso:')) return k('v_ok_iso', { eq: verdictEq(last, `iso:${X}`), X });
        if (last.claim === 'para') return `${k('v_ok_para', { eq: verdictEq(last, okCard) })} ${k('moreQ')}`;
        if (last.claim === 'rect') return `${k('v_ok_rect', { eq: verdictEq(last, 'diag') })} ${k('moreQ')}`;
        if (last.claim === 'rhombus') return `${k('v_ok_rhombus', { eq: verdictEq(last, 'side') })} ${k('moreQ')}`;
        if (last.claim === 'square') return k('v_ok_square');
        return k('v_ok_circle', { eq: verdictEq(last, 'circ') });
      }
      case 'false': {
        const eq = verdictEq(last, last.card);
        if (last.card.startsWith('pyth:')) return k('v_false_right', { eq, X: last.card.slice(5) });
        if (last.card.startsWith('iso:')) return k('v_false_iso', { eq, X: last.card.slice(4) });
        if (last.card === 'vec' || last.card === 'mid') return k('v_false_para', { eq });
        return k(`v_false_${last.card}`, { eq });
      }
      case 'watar': {
        const [, , r] = L.card(lab, last.card).names;
        return k('v_watar', { side: `$${sq(r)}$`, Y: last.decides, X });
      }
      case 'apex': return k('v_apex', { Y: last.decides, X });
      case 'missing': {
        if (['para', 'diag', 'side', 'circ'].includes(last.need)) return k(`v_missing_${last.need}`);
        return k('v_missing_card', { card: cardTex(L.card(lab, last.need)).head });
      }
      default: return k(`v_${last.kind}`);
    }
  })();

  const discoveryOptions = useMemo(() => discoveryOptionsOf(lab, k), [lab, k]);

  const formalKeys = unknown ? ['formalU1', 'formalU2', 'formalQ1', 'formalQ2', 'formalQ3'] : ['formalTri1', 'formalTri2', 'formalTri3'];
  const formal = (
    <ol className="list-decimal space-y-1 ps-5 text-sm text-emerald-900" data-sp-formal>
      {formalKeys.map((f) => <li key={f}><MathText>{k(f)}</MathText></li>)}
    </ol>
  );
  const missionText = mission ?? <MathText>{k(quad ? 'missionQuad' : unknown ? 'missionUnknown' : 'missionTri')}</MathText>;
  const hintKeys = quad ? ['hintQ1', 'hintQ2', 'hintQ3'] : unknown ? ['hintU1', 'hintU2', 'hintU3'] : ['hintT1', 'hintT2', 'hintT3'];

  /* ── les commandes ── */
  const btn = 'inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-xl border-2 border-emerald-300 bg-white px-2 text-sm font-bold text-emerald-900 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500';
  const onRail = unknown && !quad;
  const moves = (
    <div className="flex items-center gap-1" dir="ltr" data-sp-moves>
      {!onRail && <button type="button" className={btn} onClick={() => nudge(-1, 0)} aria-label={k('moveLeft', { name: held })} data-sp-move="left"><ArrowLeft className="h-5 w-5" aria-hidden="true" /></button>}
      <button type="button" className={btn} onClick={() => nudge(0, 1)} aria-label={k('moveUp', { name: held })} data-sp-move="up"><ArrowUp className="h-5 w-5" aria-hidden="true" /></button>
      <button type="button" className={btn} onClick={() => nudge(0, -1)} aria-label={k('moveDown', { name: held })} data-sp-move="down"><ArrowDown className="h-5 w-5" aria-hidden="true" /></button>
      {!onRail && <button type="button" className={btn} onClick={() => nudge(1, 0)} aria-label={k('moveRight', { name: held })} data-sp-move="right"><ArrowRight className="h-5 w-5" aria-hidden="true" /></button>}
    </div>
  );
  const [hpx, hpy] = fr.P(lab.pts[held]);
  const badgeAt = { [hpx < sceneW / 2 ? 'right' : 'left']: 8, [hpy < sceneH / 2 ? 'bottom' : 'top']: 8 };
  const heldReading = (
    <div className="pointer-events-none absolute rounded-lg bg-white/90 px-2 py-0.5 text-sm font-bold text-slate-800 shadow" style={badgeAt} data-sp-reading dir="ltr">
      <MathText>{`$${held}(${hx}\\,;\\,${hy})$`}</MathText>
    </div>
  );

  const claimRow = (
    <div className="space-y-1" data-sp-claims>
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={k('claimTitle')}>
        {!compact && <span className="text-xs font-bold text-slate-600">{k('claimTitle')}</span>}
        {lab.claims.map((c) => {
          const on = lab.claim === c;
          return (
            <button key={c} type="button" aria-pressed={on} data-sp-claim={c} onClick={() => setLab((s) => L.setClaim(s, c))}
              className={`min-h-11 rounded-xl border-2 ${compact ? 'px-1.5 text-[11px]' : 'px-2.5 text-xs'} font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${on ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-indigo-200 bg-white text-indigo-900'}`}>
              {lab.solved[c] ? '✓ ' : ''}<MathText>{k(`chip_${ID(c)}`)}</MathText>
            </button>
          );
        })}
      </div>
    </div>
  );

  const cardGrid = (
    <div className="space-y-1" data-sp-cards>
      <p className="text-xs font-bold text-slate-600">{k('cardsTitle')}</p>
      <div className={`grid gap-1.5 ${panelW >= 520 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {cards.map((c) => {
          const on = lab.picked.includes(c.id);
          const row = false;
          const w = cardTex(c, compact);
          const fs = compact ? `text-[11px] ${c.id === 'mid' ? '' : 'whitespace-nowrap'}` : 'text-xs';
          return (
            <button key={c.id} type="button" aria-pressed={on} data-sp-card={c.id} data-balanced={c.balanced ? 'true' : 'false'}
              onClick={() => { tick(1.2); setLab((s) => L.toggleCard(s, c.id)); }}
              className={`min-h-11 rounded-xl border-2 px-1.5 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${row ? 'flex items-center justify-between gap-2' : 'text-center'} ${on ? 'border-amber-500 bg-amber-50 shadow' : 'border-slate-200 bg-white'}`}>
              <span className={`${row ? '' : 'block'} ${fs} font-bold ${w.body ? 'text-slate-800' : ''}`} style={w.body ? undefined : { color: c.balanced ? C_OK : C_NO }}><MathText>{w.head}</MathText></span>
              {w.body && <span className={`${row ? '' : 'block'} ${fs} font-semibold`} style={{ color: c.balanced ? C_OK : C_NO }}><MathText>{w.body}</MathText></span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  const checkBtn = (
    <button type="button" onClick={ask} data-sp-check
      className="inline-flex h-11 items-center gap-1.5 rounded-xl border-2 border-slate-800 bg-slate-900 px-3 text-sm whitespace-nowrap font-extrabold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
      <Tv className="h-4 w-4" aria-hidden="true" />{k('check')}
    </button>
  );
  const stageNav = (
    <>
      {unknown && !quad && lab.solved['right:B'] && !cp.blocking && (
        <button type="button" className={`${btn} border-violet-400 bg-violet-50 text-violet-900`} onClick={() => setLab(L.openQuad)} data-sp-next-quad>{k('nextQuad')}</button>
      )}
      {quad && (
        <button type="button" className={`${btn} border-slate-300 text-slate-700`} onClick={() => setLab(L.backToTri)} data-sp-back-tri>{k('backTri')}</button>
      )}
    </>
  );
  const checkRow = (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {!wide && moves}
      <div className="flex items-center justify-center gap-1.5">{checkBtn}{stageNav}</div>
    </div>
  );

  const verdictLine = (
    <p role="status" aria-live="polite" className={`${compact ? '' : 'min-h-[2.5rem]'} text-center ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug ${!last ? 'text-slate-500' : last.kind === 'ok' ? 'text-emerald-800' : 'text-rose-800'}`}
      data-sp-verdict={last?.kind ?? ''}>
      {verdict ? <MathText>{verdict}</MathText> : (unknown && !quad && lab.solved['right:B'] ? <MathText>{k('doneTri')}</MathText> : k('waiting'))}
    </p>
  );

  const handle = (() => {
    const [x, y] = fr.P(lab.pts[held]);
    return (
      <button type="button" onKeyDown={onHandleKey} onClick={(e) => e.preventDefault()}
        aria-label={k('handle', { name: held, x: hx, y: hy })}
        data-sp-handle={held} data-x={hx} data-y={hy}
        className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-orange-500 bg-white/30 outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
        style={{ left: x, top: y, cursor: dragging ? 'grabbing' : 'grab' }}>
        <span className="sr-only">{held}</span>
      </button>
    );
  })();

  const sceneBlock = (
    <div className="space-y-1.5">
      <div ref={sceneRef} className="relative mx-auto select-none overflow-hidden rounded-2xl" style={{ width: sceneW, height: sceneH, touchAction: 'none' }}
        data-sp-scene onPointerDown={onSceneDown} onPointerMove={onSceneMove} onPointerUp={onSceneUp} onPointerCancel={onSceneUp}>
        <Pitch lab={lab} fr={fr} uid={uid} width={sceneW} height={sceneH} scan={scan} cards={cards} />
        {handle}
        <Ball lab={lab} fr={fr} />
        <Teammate verdict={last?.kind ?? null} n={nTrials} size={narrow ? 26 : 34} />
        {heldReading}
        {compact && last && (
          <div onPointerDown={(e) => e.stopPropagation()}>
            <MovablePanel id="shape-prover.verdict" bounds={sceneRef} title={k('trialsTitle')} className="absolute inset-x-1 bottom-1 max-h-[calc(100%-8px)] overflow-auto rounded-xl bg-white/95 p-1 shadow-lg">
              {verdictLine}
            </MovablePanel>
          </div>
        )}
      </div>
      {wide && <div className="flex justify-center">{moves}</div>}
    </div>
  );

  const dossier = (
    <div className="space-y-2" data-sp-dossier>
      <LabStepper count={proofs.length} current={stepNow} done={stepDone} stepAttr="data-sp-step" />
      {claimRow}
      {cardGrid}
      {checkRow}
      {!compact && verdictLine}
    </div>
  );

  /* ── le calcul (pli) : chaque carré depuis les composantes ── */
  const calc = (() => {
    const lines = [];
    const pts = lab.pts;
    const segs = quad ? [['A', 'B'], ['B', 'C'], ['A', 'C'], ['B', 'D']] : [['A', 'B'], ['A', 'C'], ['B', 'C']];
    for (const [p, q] of segs) {
      const v = V.vec(pts[p], pts[q]);
      lines.push(`$${p}${q}^2 = (${tex(v.x)})^2 + (${tex(v.y)})^2 = ${tex(V.distanceSquared(pts[p], pts[q]))}$`);
    }
    if (quad) {
      const i = V.midpoint(pts.A, pts.C);
      lines.push(`$I = \\left(\\dfrac{x_A + x_C}{2}\\,;\\,\\dfrac{y_A + y_C}{2}\\right) = (${tex(i.x)}\\,;\\,${tex(i.y)})$`);
    }
    return lines;
  })();

  return (
    <ManipulationShell
      type="shape-prover"
      title={title ?? k('title')}
      mission={missionText}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      guided={cpEnabled}
      hints={hintKeys.map((h) => <MathText key={h}>{k(h)}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={(
        <ManipulationDiscovery state={state} prompt={<MathText>{k(unknown ? 'dPromptQuad' : 'dPromptTri')}</MathText>} options={discoveryOptions} formal={formal} />
      )}
      explanation={<MathText>{k(unknown ? 'explanationUnknown' : 'explanationTri')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-emerald-50/60 to-white" minHeight="min-h-[160px]">
        <div ref={boxRef} className="space-y-2" data-shape-prover data-mode={lab.mode} data-stage={lab.stage}
          data-world={theme} data-solved={solvedAll ? 'true' : 'false'} data-scene-h={sceneH}>
          <div className="relative">
            {party.node}
            {cp.node}
          <div ref={glanceRef} className={wide ? 'grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3' : `space-y-2`} data-sp-glance>
            {sceneBlock}
            {dossier}
          </div>
          </div>

          <LabFold id="shape-prover.calc" title={k('calcTitle')}>
            <ul className="space-y-0.5 text-xs text-slate-700" data-sp-calc>
              {calc.map((l) => <li key={l}><MathText>{l}</MathText></li>)}
              {unknown && !quad && <li><MathText>{`${k('calcY')} ${k('formalU1')}`}</MathText></li>}
            </ul>
          </LabFold>
          {lab.trials.length > 0 && (
            <LabFold id="shape-prover.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-sp-trials={lab.trials.length}>
                {lab.trials.map((x, i) => (
                  <li key={i} className={x.kind === 'ok' ? 'text-emerald-800' : 'text-rose-800'} data-kind={x.kind}>
                    <MathText>{`$${x.held}(${x.at[0]}\\,;\\,${x.at[1]})$`}</MathText>{' '}
                    {x.claim ? <MathText>{k('trial', { claim: k(`chip_${ID(x.claim)}`), verdict: k(`t_${x.kind}`) })}</MathText> : k(`t_${x.kind}`)}
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

/** La découverte : distracteurs réfutés par les essais de l'élève (aussi la dernière question de la suite). */
export function discoveryOptionsOf(lab, k) {
  const unknown = lab.mode === 'unknown';
    if (!unknown) {
      const f = L.firstFalse(lab);
      const lookWhy = f ? k('dTriLookWhy', { eq: verdictEqStatic(lab, f) }) : k('dTriLookWhyGeneric');
      return [
        { text: <MathText>{k('dTriLook')}</MathText>, why: <MathText>{lookWhy}</MathText> },
        { text: <MathText>{k('dTriAny')}</MathText>, why: <MathText>{k('dTriAnyWhy')}</MathText> },
        { text: <MathText>{k('dTriRight')}</MathText>, correct: true },
        { text: <MathText>{k('dTriTwo')}</MathText>, why: <MathText>{k('dTriTwoWhy')}</MathText> },
      ];
    }
    return [
      { text: <MathText>{k('dQuadPara')}</MathText>, why: <MathText>{k('dQuadParaWhy')}</MathText> },
      { text: <MathText>{k('dQuadDiag')}</MathText>, why: <MathText>{k('dQuadDiagWhy')}</MathText> },
      { text: <MathText>{k('dQuadRight')}</MathText>, correct: true },
      { text: <MathText>{k('dQuadLook')}</MathText>, why: <MathText>{k('dQuadLookWhy')}</MathText> },
    ];
  }

/** L'égalité d'un essai (pour la découverte), hors du composant. */
function verdictEqStatic(lab, trial) {
  const s = { ...lab, pts: { ...lab.pts, [trial.held]: V.point(...trial.at) } };
  const c = L.card(s, trial.card);
  if (c.kind === 'pyth') return `$${tex(c.parts[0])} + ${tex(c.parts[1])} = ${tex(c.left)} \\neq ${tex(c.right)}$`;
  if (c.kind === 'iso' || c.kind === 'len') return `$${tex(c.left)} \\neq ${tex(c.right)}$`;
  return '';
}

/* ── le terrain : gazon (décor), quadrillage, axes, plots, figure, traces ── */
function Cone({ at, label, held, tone = '#FACC15', labelAt }) {
  const [x, y] = at;
  return (
    <g data-sp-cone={label}>
      <ellipse cx={x} cy={y + 6} rx={9} ry={3} fill="#000" opacity={0.18} />
      <path d={`M${x - 8} ${y + 6} L${x} ${y - 11} L${x + 8} ${y + 6} Z`} fill={held ? '#F97316' : tone} stroke="#7C2D12" strokeWidth={1.2} strokeLinejoin="round" />
      <path d={`M${x - 4.6} ${y - 1.5} L${x + 4.6} ${y - 1.5}`} stroke="#FFFFFF" strokeWidth={2.4} />
      <circle cx={x} cy={y} r={2.4} fill="#0F172A" />
      <text x={labelAt[0]} y={labelAt[1]} textAnchor="middle" fontSize={15} fontWeight={800} fill="#0F172A" stroke="#fff" strokeWidth={3.2} paintOrder="stroke"
        style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{label}</text>
    </g>
  );
}

function Pitch({ lab, fr, uid, width, height, scan, cards }) {
  const reduce = useReducedMotion();
  const { win, px, py, u } = fr;
  const { xs, ys } = L.gridLines(lab);
  const quad = lab.stage === 'quad';
  const names = quad ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C'];
  const P = Object.fromEntries(names.map((n) => [n, fr.P(lab.pts[n])]));
  const cx = names.reduce((a, n) => a + P[n][0], 0) / names.length;
  const cy = names.reduce((a, n) => a + P[n][1], 0) / names.length;
  const labelAt = (n) => {
    const [x, y] = P[n]; const dx = x - cx; const dy = y - cy; const l = Math.hypot(dx, dy) || 1;
    const d = n === lab.held ? 30 : 19;
    let lx = x + (dx / l) * d; let ly = y + (dy / l) * d + 5;
    // jamais hors du terrain : un plot au bord garde son nom visible (rabattu à côté du plot)
    if (ly < 16) { ly = y + 6; lx = x + (dx >= 0 ? 1 : -1) * (n === lab.held ? 32 : 20); }
    if (ly > height - 6) { ly = y + 4; lx = x + (dx >= 0 ? 1 : -1) * (n === lab.held ? 32 : 20); }
    lx = Math.min(width - 10, Math.max(10, lx));
    return [lx, ly];
  };
  const busy = names.flatMap((n) => [P[n], labelAt(n)]);
  const free = (x, y) => busy.every(([bx, by]) => Math.hypot(bx - x, by - y) > 15);
  const stripes = 8;
  const stripeW = width / stripes;
  const left = px(win.xMin); const right = px(win.xMax); const top = py(win.yMax); const bottom = py(win.yMin);
  const step = u < 20 ? 2 : 1;
  const ox = win.xMin <= 0 && win.xMax >= 0; const oy = win.yMin <= 0 && win.yMax >= 0;
  const poly = names.map((n) => P[n].join(',')).join(' ');
  const solvedRight = lab.last?.kind === 'ok' && lab.last.claim?.startsWith('right:') ? lab.last.claim.slice(6) : null;
  const traces = lab.trials.filter((t) => t.stage === lab.stage && t.held === lab.held && t.kind !== 'noClaim' && t.kind !== 'noCard');
  const circ = quad ? cards.find((c) => c.id === 'circ') : null;
  const textStyle = { direction: 'ltr', unicodeBidi: 'isolate' };
  const sweep = `sp-scan-${uid}`;

  return (
    <svg width={width} height={height} className="absolute inset-0" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
      {/* le gazon synthétique du ملعب الحي : bandes de tonte, lignes, projecteurs (décor) */}
      <g data-deco="turf">
        <rect width={width} height={height} fill="#15803D" />
        {Array.from({ length: stripes }, (_, i) => (
          <rect key={i} x={i * stripeW} y={0} width={stripeW} height={height} fill={i % 2 ? '#16A34A' : '#15803D'} />
        ))}
        <rect x={6} y={6} width={width - 12} height={height - 12} fill="none" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={2} rx={10} />
        {[[14, 14], [width - 14, 14]].map(([x, y], i) => (
          <g key={i} opacity={0.75}>
            <circle cx={x} cy={y} r={5} fill="#FEF9C3" />
            <circle cx={x} cy={y} r={11} fill="#FEF9C3" opacity={0.18} />
          </g>
        ))}
        <Phone x={width - 30} y={height - 34} reduce={reduce} />
      </g>
      {/* le quadrillage (une unité = un carré) et les axes du repère */}
      <g data-sp-grid>
        {xs.map((x) => <line key={`gx${x}`} x1={px(x)} x2={px(x)} y1={top} y2={bottom} stroke="#FFFFFF" strokeOpacity={x === 0 ? 0 : 0.32} strokeWidth={1} />)}
        {ys.map((y) => <line key={`gy${y}`} x1={left} x2={right} y1={py(y)} y2={py(y)} stroke="#FFFFFF" strokeOpacity={y === 0 ? 0 : 0.32} strokeWidth={1} />)}
        {oy && <line x1={left} x2={right} y1={py(0)} y2={py(0)} stroke="#FFFFFF" strokeWidth={2.2} />}
        {ox && <line x1={px(0)} x2={px(0)} y1={top} y2={bottom} stroke="#FFFFFF" strokeWidth={2.2} />}
        {oy && xs.filter((x) => x !== 0 && x % step === 0 && free(px(x), py(0) + 9)).map((x) => (
          <text key={`tx${x}`} x={px(x)} y={py(0) + 13} textAnchor="middle" fontSize={10} fontWeight={700} fill="#ECFDF5" style={textStyle}>{x}</text>
        ))}
        {ox && ys.filter((y) => y !== 0 && y % step === 0 && free(px(0) - 9, py(y))).map((y) => (
          <text key={`ty${y}`} x={px(0) - 5} y={py(y) + 3.5} textAnchor="end" fontSize={10} fontWeight={700} fill="#ECFDF5" style={textStyle}>{y}</text>
        ))}
        {ox && oy && <text x={px(0) - 5} y={py(0) + 13} textAnchor="end" fontSize={11} fontWeight={800} fill="#FFFFFF" style={textStyle}>O</text>}
      </g>
      {/* la droite de C (mode unknown) */}
      {lab.rail && !quad && (
        <g data-sp-rail>
          <line x1={px(lab.rail.x)} x2={px(lab.rail.x)} y1={py(lab.rail.max)} y2={py(lab.rail.min)} stroke="#FDE047" strokeWidth={3} strokeDasharray="7 5" strokeLinecap="round" />
          <text x={px(lab.rail.x) - 6} y={py(lab.rail.min) + 4} textAnchor="end" fontSize={12} fontWeight={800} fill="#FEF08A" style={textStyle}>{`C(${lab.rail.x} ; y)`.replace('-', '−')}</text>
        </g>
      )}
      {/* le cercle (𝒞) de diamètre [AC] et son centre I (étape quad) */}
      {circ && (
        <g data-sp-circle>
          <circle cx={fr.P(circ.center)[0]} cy={fr.P(circ.center)[1]} r={Math.sqrt(num(circ.right)) * u} fill="none" stroke="#FFFFFF" strokeWidth={2} strokeDasharray="6 5" opacity={0.9} />
          <circle cx={fr.P(circ.center)[0]} cy={fr.P(circ.center)[1]} r={3} fill="#FFFFFF" />
          <text x={fr.P(circ.center)[0] + 7} y={fr.P(circ.center)[1] - 6} fontSize={13} fontWeight={800} fill="#FFFFFF" style={textStyle}>I</text>
        </g>
      )}
      {/* la figure : un ruban de chantier jaune entre les plots */}
      <polygon points={poly} fill="#FEF08A" fillOpacity={0.16} stroke="#FDE047" strokeWidth={3} strokeLinejoin="round" data-sp-figure />
      {quad && (
        <g opacity={0.8}>
          <line x1={P.A[0]} y1={P.A[1]} x2={P.C[0]} y2={P.C[1]} stroke="#FFFFFF" strokeWidth={1.6} strokeDasharray="5 4" />
          <line x1={P.B[0]} y1={P.B[1]} x2={P.D[0]} y2={P.D[1]} stroke="#FFFFFF" strokeWidth={1.6} strokeDasharray="5 4" />
        </g>
      )}
      {solvedRight && <RightMark at={P[solvedRight]} others={names.filter((n) => n !== solvedRight).slice(0, 2).map((n) => P[n])} />}
      {/* les traces des positions jugées par le فار */}
      {traces.map((t, i) => {
        const [x, y] = [px(t.at[0]), py(t.at[1])];
        return <circle key={i} cx={x} cy={y} r={5.5} fill="none" stroke={t.kind === 'ok' ? '#34D399' : '#FB7185'} strokeWidth={2.4} data-sp-trace data-ok={t.kind === 'ok' ? 'true' : 'false'} />;
      })}
      {names.map((n) => <Cone key={n} at={P[n]} label={n} held={n === lab.held} labelAt={labelAt(n)} />)}
      {/* l'écran du فار : un balayage à chaque demande (décor) */}
      {!reduce && scan > 0 && (
        <g key={scan} data-deco="var-scan">
          <style>{`.${sweep}{animation:${sweep} .7s ease-out 1 forwards}@keyframes ${sweep}{0%{transform:translateX(-${width}px);opacity:.0}30%{opacity:.35}100%{transform:translateX(${width}px);opacity:0}}`}</style>
          <rect className={sweep} x={0} y={0} width={width / 3} height={height} fill="#E0F2FE" opacity={0} />
        </g>
      )}
    </svg>
  );
}

function RightMark({ at, others }) {
  const s = 11;
  const u = others.map((o) => { const dx = o[0] - at[0]; const dy = o[1] - at[1]; const l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; });
  const a = [at[0] + u[0][0] * s, at[1] + u[0][1] * s];
  const b = [at[0] + u[1][0] * s, at[1] + u[1][1] * s];
  const c = [a[0] + u[1][0] * s, a[1] + u[1][1] * s];
  return <path d={`M${a[0]} ${a[1]} L${c[0]} ${c[1]} L${b[0]} ${b[1]}`} fill="none" stroke="#FFFFFF" strokeWidth={2.4} data-sp-right />;
}

/** Le téléphone sur trépied qui filme le défi (décor). */
function Phone({ x, y, reduce }) {
  return (
    <g data-deco="phone" opacity={0.9}>
      <line x1={x} y1={y + 12} x2={x - 8} y2={y + 26} stroke="#1F2937" strokeWidth={1.6} />
      <line x1={x} y1={y + 12} x2={x + 8} y2={y + 26} stroke="#1F2937" strokeWidth={1.6} />
      <rect x={x - 8} y={y - 4} width={16} height={17} rx={3} fill="#111827" stroke="#9CA3AF" strokeWidth={1} />
      <circle cx={x} cy={y + 4} r={3} fill="#1E3A8A" />
      <circle cx={x + 5} cy={y - 1} r={1.8} fill="#EF4444">
        {!reduce && <animate attributeName="opacity" values="1;0.15;1" dur="1.4s" repeatCount="indefinite" />}
      </circle>
    </g>
  );
}

/** Le coéquipier qui attend le فار : il saute de joie à un « قبل », baisse la tête à un refus (décor, aucune information). */
function Teammate({ verdict, n, size }) {
  const reduce = useReducedMotion();
  const anim = reduce || !verdict ? '' : verdict === 'ok' ? 'sp-jump' : 'sp-sigh';
  return (
    <div className="pointer-events-none absolute" style={{ left: 40, bottom: 6 }} data-deco="player" aria-hidden="true">
      <style>{'.sp-jump{animation:sp-jump .8s ease-out 2}.sp-sigh{animation:sp-sigh .9s ease-in-out 1}@keyframes sp-jump{0%,100%{transform:translateY(0)}40%{transform:translateY(-14px) rotate(-6deg)}}@keyframes sp-sigh{0%,100%{transform:translateY(0)}50%{transform:translateY(3px) scaleY(.92)}}'}</style>
      <div key={n} className={anim} style={{ transformOrigin: 'bottom center' }}>
        <PlayerFigure index={2} team={1} size={size} benched={verdict != null && verdict !== 'ok'} />
      </div>
    </div>
  );
}

/** Le ballon : touché, il roule jusqu'au plot tenu puis revient (décor, aucune information). */
function Ball({ lab, fr }) {
  const reduce = useReducedMotion();
  const [kick, setKick] = useState(0);
  const home = [fr.px(fr.win.xMin) + 4, fr.py(fr.win.yMin) - 4];
  const target = fr.P(lab.pts[lab.held]);
  const away = kick % 2 === 1 && !reduce;
  const [x, y] = away ? [target[0] - 14, target[1] + 10] : home;
  useEffect(() => {
    if (!away) return undefined;
    const tm = setTimeout(() => setKick((n) => n + 1), 1100);
    return () => clearTimeout(tm);
  }, [away]);
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" data-deco="ball"
      onPointerDown={(e) => e.stopPropagation()} onClick={() => setKick((n) => n + 1)}
      className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none"
      style={{ left: x, top: y, transition: reduce ? 'none' : 'left .6s cubic-bezier(.2,.7,.3,1), top .6s cubic-bezier(.2,.7,.3,1)' }}>
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <circle cx="12" cy="12" r="10" fill="#FFFFFF" stroke="#111827" strokeWidth="1.2" />
        <path d="M12 7 L16 10 L14.5 15 L9.5 15 L8 10 Z" fill="#111827" />
        <path d="M12 2 L12 7 M16 10 L21 8.5 M14.5 15 L17.5 19.5 M9.5 15 L6.5 19.5 M8 10 L3 8.5" stroke="#111827" strokeWidth="1" />
      </svg>
    </button>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de la preuve `claim` : lire ce que le فار a calculé, puis pourquoi cela suffit ; la dernière preuve finit par la règle. */
export function chainOf(lab, claim) {
  let q;
  if (claim === 'right:B' && lab.mode === 'unknown') q = ['railY', 'pythRead'];
  else if (claim.startsWith('right:')) q = ['pythRead', 'pythWhy'];
  else if (claim.startsWith('iso:')) q = ['isoRead', 'isoWhy'];
  else if (claim === 'square') q = ['sqRead', 'sqWhy'];
  else q = ['circRead', 'circWhy'];
  if (L.proofsOf(lab).every((g) => lab.solved[g])) q.push('rule');
  return q;
}

const ti = (n) => (n < 0 ? `-${Math.abs(n)}` : `${n}`);
const intOf = (f) => { const n = Lq.toNumber(f); return Number.isInteger(n) ? String(n) : null; };
const numAnswer = (f) => ({ kind: 'number', expected: intOf(f) ?? tex(f), answer: <MathText>{$(tex(f))}</MathText> });

/** Chaque question est construite sur LES nombres de la preuve acceptée ; `k` : les textes de `shapeProver`. */
export const QUESTIONS = {
  railY: (lab, claim, k) => {
    const s = L.atProof(lab, claim);
    const [cx, cy] = L.xy(s.pts.C);
    const good = new Set(L.railSolutions(s));
    const at = (y) => L.card({ ...s, pts: { ...s.pts, C: V.point(cx, y) } }, 'pyth:B');
    const cands = [-cy, cy + 1, cy - 1, cy + 2].filter((y) => !good.has(y) && y >= s.rail.min && y <= s.rail.max);
    const uniq = [...new Set(cands)].slice(0, 2);
    const o = { C: 'C', x: cx };
    return {
      id: 'railY', kind: 'choice', cols: 3,
      prompt: Mx(k, 'railY.prompt', o),
      options: [
        { text: <MathText>{$(`C(${ti(cx)}\\,;\\,${ti(cy)})`)}</MathText>, correct: true },
        ...uniq.map((y) => { const c = at(y); return { text: <MathText>{$(`C(${ti(cx)}\\,;\\,${ti(y)})`)}</MathText>, why: Mx(k, 'railY.whyNot', { eq: $(`${c.names[0]}^2 + ${c.names[1]}^2 = ${tex(c.parts[0])} + ${tex(c.parts[1])} = ${tex(c.left)} \\neq ${tex(c.right)} = ${c.names[2]}^2`) }) }; }),
      ],
      hints: [Mx(k, 'railY.hint1'), Mx(k, 'railY.hint2')],
      explain: Mx(k, 'railY.explain', { pt: $(`C(${ti(cx)}\\,;\\,${ti(cy)})`) }),
    };
  },
  pythRead: (lab, claim, k) => {
    const c = L.card(L.atProof(lab, claim), `pyth:${claim.slice(6)}`);
    const [p, q, r] = c.names;
    const sum = $(`${p}^2 + ${q}^2 = ${tex(c.parts[0])} + ${tex(c.parts[1])} = ${tex(c.left)}`);
    return {
      id: 'pythRead', ...numAnswer(c.left),
      prompt: Mx(k, 'pythRead.prompt', { sum: $(`${p}^2 + ${q}^2`), X: claim.slice(6) }),
      hints: [Mx(k, 'pythRead.hint1'), Mx(k, 'pythRead.hint2', { p: $(`${p}^2`), q: $(`${q}^2`) })],
      explain: Mx(k, 'pythRead.explain', { sum, r: $(`${r}^2 = ${tex(c.right)}`) }),
    };
  },
  pythWhy: (lab, claim, k) => {
    const s = L.atProof(lab, claim); const X = claim.slice(6);
    const c = L.card(s, `pyth:${X}`); const [p, q, r] = c.names;
    const f = L.firstFalse(lab);
    const eq = $(`${p}^2 + ${q}^2 = ${tex(c.left)} = ${tex(c.right)} = ${r}^2`);
    return {
      id: 'pythWhy', kind: 'choice',
      prompt: Mx(k, 'pythWhy.prompt', { X }),
      options: [
        { text: Mx(k, 'pythWhy.right', { eq }), correct: true },
        { text: Mx(k, 'pythWhy.look'), why: f ? Mx(k, 'pythWhy.whyLook', { eq: verdictEqStatic(lab, f) }) : Mx(k, 'pythWhy.whyLookGeneric') },
        { text: Mx(k, 'pythWhy.equal', { p, q }), why: Mx(k, 'pythWhy.whyEqual') },
      ],
      hints: [Mx(k, 'pythWhy.hint1', { X }), Mx(k, 'pythWhy.hint2', { X, p: $(`${p}^2`), q: $(`${q}^2`), r: $(`${r}^2`) })],
      explain: Mx(k, 'pythWhy.explain', { eq }),
    };
  },
  isoRead: (lab, claim, k) => {
    const c = L.card(L.atProof(lab, claim), claim);
    return {
      id: 'isoRead', ...numAnswer(c.left),
      prompt: Mx(k, 'isoRead.prompt', { p: $(`${c.names[0]}^2`), X: claim.slice(4) }),
      hints: [Mx(k, 'isoRead.hint1'), Mx(k, 'isoRead.hint2', { p: $(`${c.names[0]}^2`) })],
      explain: Mx(k, 'isoRead.explain', { eq: $(`${c.names[0]}^2 = ${tex(c.left)} = ${tex(c.right)} = ${c.names[1]}^2`) }),
    };
  },
  isoWhy: (lab, claim, k) => {
    const X = claim.slice(4);
    const s = L.atProof(lab, claim);
    const c = L.card(s, claim); const [p, q] = c.names;
    const [Y, Z] = ['A', 'B', 'C'].filter((n) => n !== X);
    const eq = $(`${p}^2 = ${tex(c.left)} = ${tex(c.right)} = ${q}^2`);
    return {
      id: 'isoWhy', kind: 'choice',
      prompt: Mx(k, 'isoWhy.prompt', { X }),
      options: [
        { text: <MathText>{$(`${p}^2 = ${q}^2`)}</MathText>, correct: true },
        { text: <MathText>{$(`${p}^2 + ${q}^2 = ${Y}${Z}^2`)}</MathText>, why: Mx(k, 'isoWhy.whyPyth') },
        { text: <MathText>{$(`${Y}${Z}^2 = ${Y}${X}^2`)}</MathText>, why: Mx(k, 'isoWhy.whyApex', { X }) },
      ],
      hints: [Mx(k, 'isoWhy.hint1', { X }), Mx(k, 'isoWhy.hint2', { X })],
      explain: Mx(k, 'isoWhy.explain', { eq, X }),
    };
  },
  sqRead: (lab, claim, k) => {
    const c = L.card(L.atProof(lab, claim), 'diag');
    return {
      id: 'sqRead', ...numAnswer(c.left),
      prompt: Mx(k, 'sqRead.prompt'),
      hints: [Mx(k, 'sqRead.hint1'), Mx(k, 'sqRead.hint2')],
      explain: Mx(k, 'sqRead.explain', { eq: $(`AC^2 = ${tex(c.left)} = ${tex(c.right)} = BD^2`) }),
    };
  },
  sqWhy: (lab, claim, k) => ({
    id: 'sqWhy', kind: 'choice',
    prompt: Mx(k, 'sqWhy.prompt'),
    options: [
      { text: Mx(k, 'sqWhy.right'), correct: true },
      { text: Mx(k, 'sqWhy.noSide'), why: Mx(k, 'sqWhy.whyNoSide') },
      { text: Mx(k, 'sqWhy.noPara'), why: Mx(k, 'sqWhy.whyNoPara') },
    ],
    hints: [Mx(k, 'sqWhy.hint1'), Mx(k, 'sqWhy.hint2')],
    explain: Mx(k, 'sqWhy.explain'),
  }),
  circRead: (lab, claim, k) => {
    const c = L.card(L.atProof(lab, claim), 'circ');
    return {
      id: 'circRead', ...numAnswer(c.right),
      prompt: Mx(k, 'circRead.prompt'),
      hints: [Mx(k, 'circRead.hint1'), Mx(k, 'circRead.hint2')],
      explain: Mx(k, 'circRead.explain', { eq: $(`IA^2 = ${tex(c.right)}\\,,\\ IB^2 = ${tex(c.parts[0])}\\,,\\ ID^2 = ${tex(c.parts[1])}`) }),
    };
  },
  circWhy: (lab, claim, k) => ({
    id: 'circWhy', kind: 'choice',
    prompt: Mx(k, 'circWhy.prompt'),
    options: [
      { text: Mx(k, 'circWhy.right'), correct: true },
      { text: Mx(k, 'circWhy.square'), why: Mx(k, 'circWhy.whySquare') },
      { text: Mx(k, 'circWhy.mid'), why: Mx(k, 'circWhy.whyMid') },
    ],
    hints: [Mx(k, 'circWhy.hint1'), Mx(k, 'circWhy.hint2')],
    explain: Mx(k, 'circWhy.explain'),
  }),
  rule: (lab, claim, k) => {
    const unknown = lab.mode === 'unknown';
    return {
      id: 'rule', kind: 'choice',
      prompt: <MathText>{k(unknown ? 'dPromptQuad' : 'dPromptTri')}</MathText>,
      options: discoveryOptionsOf(lab, k),
      hints: [Mx(k, 'rule.hint1'), Mx(k, 'rule.hint2')],
      explain: <ol className="list-decimal space-y-1 ps-5 text-sm" data-sp-formal>{(unknown ? ['formalU1', 'formalU2', 'formalQ1', 'formalQ2', 'formalQ3'] : ['formalTri1', 'formalTri2', 'formalTri3']).map((f) => <li key={f}><MathText>{k(f)}</MathText></li>)}</ol>,
    };
  },
};
