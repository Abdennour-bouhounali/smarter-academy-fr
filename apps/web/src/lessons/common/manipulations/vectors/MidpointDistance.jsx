import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Check, RotateCcw } from 'lucide-react';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import LabFold from '../primitives/LabFold';
import MovablePanel from '../primitives/MovablePanel';
import MathText from '../../components/MathText';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { Mx, useTick } from './vecCp';
import * as L from '../logic/midpointDistance';

/**
 * midpoint-distance — LE RENDEZ-VOUS GPS (unité 12 « الأشعة في معلم », درس « إحداثيتا منتصف قطعة مستقيم والمسافة بين
 * نقطتين في معلم » : نشاط 3 et نشاط 4 p. 141, معارف د و هـ p. 144).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. Étape 1 : l'élève TIENT l'épingle du rendez-vous (glisser, toucher la carte, flèches à l'écran ou au clavier, ثبّت),
 *    demi-maille par demi-maille ; il peut aussi essayer les deux propositions de la discussion de groupe. Étape 2 (qu'il
 *    ouvre lui-même) : il TIENT le coin de l'escalier (nœud par nœud), puis RÉCLAME la distance en ligne droite.
 * B. Idée : I milieu de [AB] ⇔ AI = IB ⇔ x_I = (xA + xB)/2 et y_I = (yA + yB)/2 ; AB est l'hypoténuse du triangle
 *    rectangle de jambes |xB − xA| et |yB − yA| : AB = √((xB − xA)² + (yB − yA)²) — ni la marche dans les rues
 *    |Δx| + |Δy|, ni le carré.
 * C. Les flèches AM et MB s'allongent et raccourcissent sous le doigt ; (مبتدئ) leurs composantes et leurs ombres sur les
 *    deux axes s'écrivent en direct ; l'escalier se dessine rue par rue, l'angle droit apparaît, la ligne GPS s'allume.
 * D. Les composantes en colonne, le verdict (avec la formule écrite sur les nombres des amis), les jambes, la formule
 *    de la distance exacte ; la liste des essais.
 * E. Avant la règle : la somme sans « ÷ 2 » et la demi-différence tombent ailleurs (refusées par la mathématique) ; la
 *    marche dans les rues est plus longue que la ligne droite ; 25 n'est que le carré.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        les coordonnées du milieu sont les moyennes des coordonnées ; la distance est l'hypoténuse (معارف د, هـ)
 *   OBJECT         l'épingle de rendez-vous de deux amis sur une carte quadrillée ; un escalier de rues à angle droit
 *   VARIABLE       la position M (pas de 0,5) ; la position du coin C (pas de 1) ; la distance réclamée
 *   INVARIANT      I est l'unique point où AM = MB (balayé dans les tests) ; les deux escaliers possibles ont les mêmes jambes
 *   TRANSFORMATION les flèches AM, MB et leurs composantes ; l'escalier et ses jambes ; la ligne GPS
 *   CONSTRAINT     M sur la grille des demi-mailles ; C sur les nœuds ; les rues sont horizontales ou verticales
 *   RESISTANCE     une épingle validée ailleurs est REFUSÉE en comparant les composantes (« أفقيا 1 ثم 2 ») et nomme le
 *                  piège (somme sans ÷ 2 : MISC-MAALAM-MUNTASAF-NISF ; demi-différence : MISC-MAALAM-MUNTASAF-TARH) ; un coin
 *                  hors de l'aplomb laisse un tronçon EN BIAIS (« بقي 1 أفقيا ») ; 7 (MISC-MAALAM-MASAFA-JADHR-JAM) et 25
 *                  (MISC-MAALAM-MASAFA-JADHR-NASI) sont refusés
 *   EVIDENCE       AM = MB écrit en colonnes ; l'angle droit ; la ligne GPS plus courte que l'escalier
 *   CONTRAST       un rendez-vous refusé ET le bon ; une réclamation refusée (ou un coin refusé) ET la bonne distance
 *   PREDICTION     où se retrouver ? — l'élève pose l'épingle avant toute formule (متقدم : aucune lecture avant ثبّت)
 *   DISCOVERY      « x_I = (xA + xB)/2 … et AB = √(…) » — distracteurs réfutés par ses propres essais
 *   FORMALIZATION  معارف د et هـ (p. 144)
 *   TRANSFER       le تحدّ (A(2/3 ; −2), B(−4 ; 7/3) : √365/3), ex-10, 11, 15, 16, 17, 20, la banque
 *
 * Tous les verdicts viennent de logic/midpointDistance.js, c'est-à-dire de `vectors.js` (relation, midpoint, distance) ;
 * le dessin est en flottants mais rien n'est « presque » égal. Manuel (§6bis) : chaque position est un essai, chaque
 * réclamation une réponse — aucune auto-complétion.
 *
 * DÉCOR (exigence du propriétaire, monde `gps-meet`) : la carte d'une appli de localisation — la mer, la promenade, les
 * palmiers et la grande roue des Sablettes (Alger, مبتدئ) ou la chapelle de Santa Cruz sur la montagne (Oran, متقدم) ;
 * des épingles-avatars qui « pinguent » ; une trottinette qui, touchée, parcourt l'escalier. `aria-hidden`, hors clavier,
 * `[data-deco]`, jamais une coordonnée ni une longueur ; immobile sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (MANIPULATION_CONTRACT §8bis) : la scène est budgétée sur l'écran de leçon (`useLessonViewport`) moins
 * ce que le bloc `[data-md-glance]` mesure EN PLUS d'elle ; la poignée est SUR le point tenu, les flèches juste dessous ;
 * les positions partagées flottent dans un `MovablePanel` (une ligne sous la scène sous 380 px) ; la liste des essais est
 * dans un `LabFold` sous le bloc mesuré.
 *
 * PROPS (à plat ou groupées dans `numbers`, comme levels.js) : `A`, `B`, `names` ([a, b, milieu]), `dist` ({ A, B, names } :
 * les points de l'escalier, défaut les mêmes amis), `city` ('alger' | 'oran', défaut selon le niveau), `theme` ('gps-meet'),
 * `title`, `lead`, `mission`, `level`, `levels`, `onTrial(evidence)` à chaque essai, `onFinished({ meet, dist })` à la règle
 * — tous par `state.report`.
 *
 * CONTRAT DOM : [data-midpoint-distance][data-stage=meet|distance][data-solved], [data-md-glance], [data-md-scene],
 * [data-md-handle=M|C], [data-md-move=left|right|up|down], [data-md-commit], [data-md-proposal=sum|diff], [data-md-next],
 * [data-md-back], [data-md-reopen], [data-md-claim=taxi|square|root], [data-md-reading], [data-md-verdict=<kind>],
 * [data-md-gps], [data-md-stairs][data-ok], [data-lab-fold=midpoint-distance.trials], [data-deco].
 */
/** La découverte : distracteurs réfutés par les essais de l'élève (aussi la dernière question de la suite). */
export function discoveryOptionsOf(lab, k) {
    const ref = L.lastTrial(lab, 'meet', (x) => x.kind === 'sum') ?? null;
    const sumAt = ref ? ref.at : L.xy(lab.meet.sum);
    return [
      { text: <MathText>{k('dSum')}</MathText>, why: <MathText>{k('dSumWhy', { p: isl(`(${L.legLatex(sumAt[0])}\\,;\\,${L.legLatex(sumAt[1])})`), taxi: isl(L.legLatex(lab.dist.taxi)), root: isl(L.rootLatex(lab.dist)) })}</MathText> },
      { text: <MathText>{k('dRight')}</MathText>, correct: true },
      { text: <MathText>{k('dDiff')}</MathText>, why: <MathText>{k('dDiffWhy', { sq: isl(L.legLatex(lab.dist.square)) })}</MathText> },
    ];
  }

const TONE = { ok: 'text-emerald-800', 'claim-ok': 'text-emerald-800', end: 'text-slate-600' };
const toneOf = (kind) => TONE[kind] ?? 'text-rose-800';
const C_A = '#4F46E5'; const C_B = '#E11D48'; const C_M = '#D97706'; const C_OK = '#059669'; const C_STREET = '#EA580C'; const C_GPS = '#0284C7';
const vecTex = (a, b) => `\\overrightarrow{${a}${b}}`;
const isl = (s) => `$${s}$`;
/** Un nombre à la virgule (« 2,5 », « −1 ») pour une étiquette accessible ou un texte SVG. */
const num = (v) => String(v).replace('.', ',').replace('-', '−');
const ptText = (name, [x, y]) => `${name}(${num(x)} ; ${num(y)})`;

export default function MidpointDistance({
  numbers, A: A0, B: B0, names: names0, dist: dist0, city: city0, theme = 'gps-meet', title, lead, mission, level,
  levels: withLevels = true, checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.midpointDistance.${key}`, o), [t]);
  const flat = { A: A0, B: B0, names: names0, dist: dist0 };
  const initialNumbers = { ...Object.fromEntries(Object.entries(flat).filter(([, v]) => v != null)), ...(numbers ?? {}) };
  const state = useManipulation({ type: 'midpoint-distance', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const advanced = state.level === 'advanced';
  const city = city0 ?? (advanced ? 'oran' : 'alger');
  const make = () => L.init(nums);
  const [lab, setLab] = useState(make);
  const sceneKey = `${JSON.stringify(nums)}|${state.epoch}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [doneIds, setDoneIds] = useState([]);   // les étapes dont la suite de questions est finie
  if (scene.key !== sceneKey) { setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(make()); setDoneIds([]); }   // « إعادة » : tout repart
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const meetStage = lab.stage === 'meet';

  /* ── les questions PENDANT le labo (primitives/LabCheckpoint) : après chaque étape réussie (le rendez-vous, puis la distance), une suite
     sur les nombres de l'élève ; celle de la distance finit par la règle et remplace la découverte automatique. L'enseignant seul peut les couper. ── */
  const cpSettings = useLabCheckpointSettings('midpoint-distance');
  const cpEnabled = cpOn && cpSettings.enabled;
  const steps = ['meet', 'dist'];
  const stepOk = { meet: lab.meet.solved, dist: lab.dist.solved };
  const pending = cpEnabled ? steps.find((g) => stepOk[g] && !doneIds.includes(g)) ?? null : null;
  const chain = pending ? chainOf(pending) : null;
  const cp = useLabCheckpoint({
    id: chain ? pending : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, pending, k)) : null,
    reached: !!pending,
    resetKey: scene.inits,
    onRetry: () => { celebrated.current.delete(pending); setLab((s) => L.retryStage(s, pending)); },
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setDoneIds((d) => (d.includes(id) ? d : [...d, id]));
      if (chainOf(id).includes('rule')) { state.discover(); state.formalize(); }
    },
  });
  const solvedAll = L.discoveryReady(lab);
  const ready = solvedAll && !cpEnabled;
  const tick = useTick();
  const stepDone = steps.map((g) => !!stepOk[g] && (!cpEnabled || doneIds.includes(g)));
  const stepNow = lab.stage === 'meet' ? 0 : 1;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.n === 0 && celebrated.current.size) celebrated.current = new Set();   // « إعادة » : on refête
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.has(steps[i])) return;
      celebrated.current.add(steps[i]);
      party.celebrate({ n: stepDone.filter(Boolean).length, total: steps.length });
    });
  }, [stepDone.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son : un déclic par pas de l'épingle, le drapeau quand l'essai est juste, « over » quand il est refusé
  useEffect(() => {
    const tr = lab.last?.kind === 'commit' ? lab.last.trial : null;
    if (tr && lab.n > 0) playSfx(tr.kind === 'ok' || tr.kind === 'claim-ok' ? 'flag' : tr.kind === 'end' ? 'tooth' : 'over');
  }, [lab.n]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (state.isFormal) state.report(onFinished, { meet: lab.meet.trials.length, dist: lab.dist.trials.length });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (lab.n > 0) state.report(onTrial, L.evidenceOf(lab)); }, [lab.n]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : largeur, écran de leçon, ce que le bloc « glance » ajoute à la scène ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const sceneRef = useRef(null);
  const sceneHRef = useRef(240);
  const [width, setWidth] = useState(320);
  const [overhead, setOverhead] = useState(210);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(200, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(140, Math.ceil(glanceRef.current.getBoundingClientRect().height) - sceneHRef.current));
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
  const sceneW = Math.min(width, 720);
  const sceneH = Math.round(Math.max(narrow ? 140 : 170, Math.min(L.naturalHeight(lab, sceneW), screenH - overhead - 24, 520)));
  sceneHRef.current = sceneH;
  const fr = L.frame(lab, { width: sceneW, height: sceneH, pad: narrow ? 16 : 24 });

  /* ── le point tenu : M (rendez-vous) ou C (coin de l'escalier) ── */
  const [dragging, setDragging] = useState(false);
  const settle = useRef(null);
  useEffect(() => () => { if (settle.current) clearTimeout(settle.current); }, []);
  const commit = useCallback(() => {
    if (settle.current) { clearTimeout(settle.current); settle.current = null; }
    setLab((s) => L.commitHeld(s));
  }, []);
  const nudge = (dx, dy) => {
    tick(dx + dy < 0 ? 0.75 : 1);
    setLab((s) => L.nudgeHeld(s, dx, dy));
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(commit, 900);
  };
  const fromEvent = (e) => {
    const r = sceneRef.current.getBoundingClientRect();
    return fr.fromPx(e.clientX - r.left, e.clientY - r.top);
  };
  const locked = !meetStage && !!lab.dist.cornerOk;
  const onSceneDown = (e) => {
    if (e.button > 0 || !sceneRef.current || locked) return;
    if (e.target.closest?.('[data-movable-panel]')) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    const [x, y] = fromEvent(e);
    setLab((s) => L.moveHeld(s, x, y));
  };
  const onSceneMove = (e) => { if (dragging) { const [x, y] = fromEvent(e); tick(); setLab((s) => L.moveHeld(s, x, y)); } };
  const onSceneUp = (e) => {
    if (!dragging) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDragging(false);
    setLab((s) => L.commitHeld(s, fromEvent(e)));
  };
  const onHeldKey = (e) => {
    const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (m) { e.preventDefault(); if (!locked) nudge(...m); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!locked) commit(); }
  };

  /* ── lectures ── */
  const [na, nb, ni] = lab.meet.names;
  const [da, db, dc] = lab.dist.names;
  const meetJ = L.judgeMeet(lab.meet);
  const cornerJ = L.judgeCorner(lab.dist);
  const last = lab.last?.kind === 'commit' ? lab.last.trial : null;
  const lastHere = last && last.stage === lab.stage ? last : null;
  // متقدم : aucune lecture des composantes ni des jambes avant la validation (l'élève prédit, puis vérifie)
  const showMeetLive = L.meetReadingLive(lab, advanced);
  const showLegs = !!lab.dist.cornerOk || (!advanced && cornerJ.kind === 'ok');
  const am = isl(vecTex(na, ni)); const mb = isl(vecTex(ni, nb));
  const col = (v) => isl(narrow ? `\\left(\\begin{smallmatrix} ${L.legLatex(L.xy(v)[0])} \\\\ ${L.legLatex(L.xy(v)[1])} \\end{smallmatrix}\\right)` : L.colLatex(v));

  const comps = (t2) => k('compLine', { h1: isl(L.legLatex(t2.AM[0])), h2: isl(L.legLatex(t2.MB[0])), v1: isl(L.legLatex(t2.AM[1])), v2: isl(L.legLatex(t2.MB[1])) });
  const verdict = (() => {
    if (!lastHere) return null;
    if (lastHere.stage === 'meet') {
      const P = { am, mb, eq: isl(`${vecTex(na, ni)} = ${vecTex(ni, nb)}`), a: na, b: nb, i: ni, ab: isl(vecTex(na, nb)) };
      if (lastHere.kind === 'ok') return k('v_ok', P);
      const lead2 = lastHere.kind === 'unequal' ? k(`v_unequal${lastHere.closer === 'A' ? 'A' : 'B'}`, P) : k(`v_${lastHere.kind}`, P);
      return lastHere.kind === 'end' ? lead2 : `${lead2} ${comps(lastHere)}`;
    }
    const d = lab.dist;
    const P = { a: da, b: db, c: dc, ab: isl(`${da}${db}`), ab2: isl(`${da}${db}^2`), h: isl(L.legLatex(d.h)), v: isl(L.legLatex(d.v)),
      taxi: isl(L.legLatex(d.taxi)), sq: isl(L.legLatex(d.square)), formula: isl(narrow ? L.distShortLatex(d) : L.distFormulaLatex(d)) };
    if (lastHere.kind === 'slant') return k(lastHere.first === 'h' ? 'c_slantH' : 'c_slantV', { ...P, n: isl(L.legLatex(Math.abs(lastHere.missing))) });
    if (lastHere.kind.startsWith('claim-')) return k(`r_${lastHere.kind.slice(6)}`, P);
    return k(`c_${lastHere.kind}`, P);
  })();

  const discoveryOptions = useMemo(() => discoveryOptionsOf(lab, k), [lab, k]);

  const formal = (
    <div className="space-y-1 text-sm text-emerald-900" data-md-formal>
      <p className="font-bold"><MathText>{k('formalMid')}</MathText></p>
      <p className="font-bold"><MathText>{k('formalDist')}</MathText></p>
      <p><MathText>{k('formalNote')}</MathText></p>
    </div>
  );

  const missionText = mission ?? <MathText>{meetStage
    ? k('missionMeet', { a: na, b: nb, i: ni, am, mb })
    : k('missionDist', { a: da, b: db, c: dc, ab: isl(`${da}${db}`) })}</MathText>;
  const hintKeys = meetStage ? ['hintM1', 'hintM2', 'hintM3'] : ['hintD1', 'hintD2', 'hintD3'];
  const hintParams = meetStage ? { a: na, b: nb, i: ni } : { a: da, b: db, c: dc, ab: `${da}${db}` };

  const heldName = meetStage ? ni : dc;
  const heldPt = meetStage ? lab.meet.M : lab.dist.C;
  const btn = 'inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-xl border-2 border-sky-300 bg-white px-2 text-sm font-bold text-sky-900 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500';
  const [ride, setRide] = useState(0);

  /* ── les réclamations (après l'escalier) ── */
  const d = lab.dist;
  const claimLabel = (which) => {
    const h = L.legLatex(d.h); const v = L.legLatex(d.v);
    if (advanced || narrow) return isl(which === 'taxi' ? L.legLatex(d.taxi) : which === 'square' ? L.legLatex(d.square) : L.rootLatex(d));
    if (which === 'taxi') return isl(`${h} + ${v} = ${L.legLatex(d.taxi)}`);
    if (which === 'square') return isl(`${h}^2 + ${v}^2 = ${L.legLatex(d.square)}`);
    return isl(`\\sqrt{${h}^2 + ${v}^2} = ${L.rootLatex(d)}`);
  };

  const moves = (
    <div className="flex items-center gap-1" dir="ltr">
      <button type="button" className={btn} onClick={() => nudge(-1, 0)} disabled={locked} aria-label={k('moveLeft', { name: heldName })} data-md-move="left"><ArrowLeft className="h-5 w-5" aria-hidden="true" /></button>
      <button type="button" className={btn} onClick={() => nudge(0, 1)} disabled={locked} aria-label={k('moveUp', { name: heldName })} data-md-move="up"><ArrowUp className="h-5 w-5" aria-hidden="true" /></button>
      <button type="button" className={btn} onClick={() => nudge(0, -1)} disabled={locked} aria-label={k('moveDown', { name: heldName })} data-md-move="down"><ArrowDown className="h-5 w-5" aria-hidden="true" /></button>
      <button type="button" className={btn} onClick={() => nudge(1, 0)} disabled={locked} aria-label={k('moveRight', { name: heldName })} data-md-move="right"><ArrowRight className="h-5 w-5" aria-hidden="true" /></button>
    </div>
  );
  const controls = (
    <div className={`flex flex-wrap items-center justify-center ${narrow ? 'gap-1' : 'gap-1.5'}`} data-md-controls>
      {moves}
      <button type="button" className={`${btn} border-emerald-400 text-emerald-900`} onClick={commit} disabled={locked} data-md-commit>
        <Check className="h-4 w-4" aria-hidden="true" />{narrow ? <span dir="ltr" aria-label={k('commit', { name: heldName })}>{heldName}</span> : k('commit', { name: heldName })}
      </button>
      {meetStage && ['sum', 'diff'].map((p) => (
        <button key={p} type="button" className={`${btn} border-violet-300 text-violet-900 ${narrow ? 'flex-1 min-w-0 text-[11px] leading-tight' : 'text-xs'}`} onClick={() => setLab((s) => L.tryProposal(s, p))} data-md-proposal={p}>
          <MathText>{k(p === 'sum' ? 'propSum' : 'propDiff', { who: k(`who${p === 'sum' ? 'B' : 'A'}_${city}`), ab: isl(vecTex(na, nb)) })}</MathText>
        </button>
      ))}
      {!meetStage && (
        <button type="button" className={`${btn} border-slate-300 text-slate-700 text-xs`} onClick={() => setLab(L.backToMeet)} data-md-back aria-label={k('back')}>{narrow ? k('backShort') : k('back')}</button>
      )}
      {!meetStage && d.cornerOk && (
        <button type="button" className={`${btn} border-slate-300 text-slate-700`} onClick={() => setLab(L.reopenCorner)} data-md-reopen>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />{narrow ? <span className="sr-only">{k('reopen', { c: dc })}</span> : k('reopen', { c: dc })}
        </button>
      )}
      {!narrow && <Scooter onRide={() => setRide((n) => n + 1)} />}
    </div>
  );

  const claims = !meetStage && d.cornerOk && (
    <div className="flex flex-wrap items-center justify-center gap-1.5" data-md-claims>
      <span className={`text-xs font-bold text-slate-700 ${narrow ? 'w-full text-center' : ''}`}><MathText>{k('claimTitle', { ab: isl(`${da}${db}`) })}</MathText></span>
      {['taxi', 'root', 'square'].map((w) => (
        <button key={w} type="button" className={`${btn} ${narrow ? 'flex-1 min-w-0 px-1 text-[11px]' : ''} ${d.solved && w === 'root' ? 'border-emerald-500 bg-emerald-50' : 'border-sky-400'}`} onClick={() => setLab((s) => L.claim(s, w))} data-md-claim={w}>
          <span className={narrow ? 'whitespace-nowrap text-[9px]' : 'whitespace-nowrap'}><MathText>{claimLabel(w)}</MathText></span>
        </button>
      ))}
    </div>
  );

  /* ── la ligne de lecture ── */
  const reading = meetStage ? (
    <div dir="ltr" className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 ${narrow ? 'text-xs' : 'text-sm'}`} data-md-reading>
      {showMeetLive ? (
        <>
          <span><MathText>{`${am} ${col(meetJ.AM)}`}</MathText></span>
          <span className={`font-bold ${meetJ.kind === 'ok' ? 'text-emerald-800' : 'text-slate-500'}`}>{meetJ.kind === 'ok' ? '=' : '≠'}</span>
          <span><MathText>{`${mb} ${col(meetJ.MB)}`}</MathText></span>
        </>
      ) : (
        <span className="text-slate-600"><MathText>{k('hiddenMeet', { am, mb })}</MathText></span>
      )}
    </div>
  ) : (
    <div className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 ${narrow ? 'text-xs' : 'text-sm'}`} data-md-reading>
      {showLegs ? (
        <span className="font-semibold text-slate-800"><MathText>{k('legs', { h: isl(L.legLatex(d.h)), v: isl(L.legLatex(d.v)) })}</MathText></span>
      ) : (
        <span className="text-slate-600"><MathText>{k(advanced ? 'hiddenLegs' : 'buildLegs', { a: da, b: db })}</MathText></span>
      )}
      <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${d.solved ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-sky-200 bg-sky-50 text-sky-900'}`} data-md-gps>
        <MathText>{k('gps', { eq: isl(`${da}${db} = ${d.solved ? L.rootLatex(d) : '?'}`) })}</MathText>
      </span>
    </div>
  );

  const sharePanel = (
    <div className={narrow ? 'flex flex-wrap justify-center gap-x-3 text-[11px]' : 'space-y-0.5 text-xs'} data-md-share>
      {(meetStage ? [[na, lab.meet.A, C_A], [nb, lab.meet.B, C_B], [ni, lab.meet.M, C_M]] : [[da, d.A, C_A], [db, d.B, C_B], [dc, d.C, C_STREET]]).map(([n, p, c]) => (
        <div key={n} className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: c }} aria-hidden="true" />
          <bdi dir="ltr" className="font-mono font-bold text-slate-800">{ptText(n, L.xy(p))}</bdi>
        </div>
      ))}
    </div>
  );

  const handle = (() => {
    const [x, y] = fr.P(heldPt);
    const ok = meetStage ? meetJ.kind === 'ok' && lastHere?.kind === 'ok' : !!d.cornerOk;
    return (
      <button type="button" onKeyDown={onHeldKey} onClick={(e) => e.preventDefault()}
        aria-label={`${k(meetStage ? 'handleM' : 'handleC', { name: heldName })} — ${ptText(heldName, L.xy(heldPt))}`}
        data-md-handle={meetStage ? 'M' : 'C'} data-at={L.xy(heldPt).join(';')}
        className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] bg-white/95 shadow outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${ok ? 'border-emerald-600' : meetStage ? 'border-amber-500' : 'border-orange-500'}`}
        style={{ left: x, top: y, cursor: locked ? 'default' : dragging ? 'grabbing' : 'grab' }}>
        <span dir="ltr" className="font-mono text-sm font-extrabold text-slate-900">{heldName}</span>
      </button>
    );
  })();

  return (
    <ManipulationShell
      type="midpoint-distance"
      title={title ?? k('title')}
      mission={missionText}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      guided={cpEnabled}
      hints={hintKeys.map((h) => <MathText key={h}>{k(h, hintParams)}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={<ManipulationDiscovery state={state} prompt={<MathText>{k('dPrompt')}</MathText>} options={discoveryOptions} formal={formal} />}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/60 to-white" minHeight="min-h-[170px]">
        <div ref={boxRef} className="space-y-2" data-midpoint-distance data-stage={lab.stage} data-world={theme} data-city={city}
          data-solved={solvedAll ? 'true' : 'false'} data-scene-h={sceneH}>
          <div className="relative">
            {party.node}
            {cp.node}
          <div ref={glanceRef} className="space-y-1.5" data-md-glance>
            <LabStepper count={steps.length} current={stepNow} done={stepDone} stepAttr="data-md-step" />
            <div ref={sceneRef} className="relative mx-auto select-none" style={{ width: sceneW, height: sceneH, touchAction: 'none' }}
              data-md-scene onPointerDown={onSceneDown} onPointerMove={onSceneMove} onPointerUp={onSceneUp} onPointerCancel={onSceneUp}>
              <Scene lab={lab} fr={fr} uid={uid} city={city} ride={ride} width={sceneW} height={sceneH} advanced={advanced}
                meetJ={meetJ} cornerJ={cornerJ} lastHere={lastHere} showMeetLive={showMeetLive}
                showLegs={showLegs} legs={{ h: num(L.legLatex(d.h)), v: num(L.legLatex(d.v)) }} rootText={L.rootPlain(d)} />
              {handle}
              {!narrow && (
                <MovablePanel id="midpoint-distance.share" bounds={sceneRef} title={k('shareTitle')} className="absolute left-1 top-1 z-10">
                  <div className="rounded-xl border border-sky-200 bg-white/90 px-2 py-1 shadow-sm">
                    <p className="mb-0.5 text-[11px] font-bold text-sky-800">{k(`city_${city}`)}</p>
                    {sharePanel}
                  </div>
                </MovablePanel>
              )}
            </div>
            {narrow && <div className="flex justify-center">{sharePanel}</div>}
            {meetStage && lab.meet.solved && !cp.blocking && (
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-violet-900" data-md-done-meet>
                {!narrow && <MathText>{k('doneMeet', { a: na, b: nb })}</MathText>}
                <button type="button" className={`${btn} border-violet-400 bg-violet-50 text-violet-900`} onClick={() => setLab(L.openDistance)} data-md-next>{k('next')}</button>
              </div>
            )}
            {controls}
            {claims}
            {reading}
            <p role="status" className={`min-h-[2.5rem] text-center ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug ${lastHere ? toneOf(lastHere.kind) : 'text-slate-500'}`}
              data-md-verdict={lastHere?.kind ?? ''}>
              {verdict ? <MathText>{verdict}</MathText> : k(meetStage ? 'waitingMeet' : (d.cornerOk ? 'waitingClaim' : 'waitingDist'), { a: da, b: db, c: dc })}
            </p>
          </div>
          </div>
            {meetStage && lastHere?.kind === 'ok' && (
              <p className={`text-center ${narrow ? 'text-xs' : 'text-sm'} text-emerald-900`} data-md-mid-formula>
                {['x', 'y'].map((c) => <span key={c} className="mx-2 inline-block"><MathText>{isl(L.midFormulaLatex(lab.meet)[c].replace('\\dfrac', width < 480 ? '\\tfrac' : '\\dfrac'))}</MathText></span>)}
              </p>
            )}

          {(lab.meet.trials.length + lab.dist.trials.length) > 0 && (
            <LabFold id="midpoint-distance.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-md-trials={lab.meet.trials.length + lab.dist.trials.length}>
                {lab.meet.trials.map((x, i) => (
                  <li key={`m${i}`} className={toneOf(x.kind)} data-kind={x.kind}>
                    {k('trialMeet', { verdict: k(`t_${x.kind}`) })} <span dir="ltr" className="inline-block font-mono" style={{ unicodeBidi: 'isolate' }}>{ptText(ni, x.at)}</span>
                  </li>
                ))}
                {lab.dist.trials.map((x, i) => (
                  <li key={`d${i}`} className={toneOf(x.kind)} data-kind={x.kind}>
                    {x.claim ? <MathText>{k('trialClaim', { v: claimLabel(x.claim), verdict: k(`t_${x.kind}`) })}</MathText>
                      : <>{k('trialCorner', { verdict: k(`t_${x.kind}`) })} <span dir="ltr" className="inline-block font-mono" style={{ unicodeBidi: 'isolate' }}>{ptText(dc, x.at)}</span></>}
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

/* ── la scène : la carte (décor), le quadrillage et les axes, les amis, l'épingle ou l'escalier ── */
function arrowPath(p, q, inset = 0) {
  const dx = q[0] - p[0]; const dy = q[1] - p[1]; const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l; const uy = dy / l;
  const a = [p[0] + ux * inset, p[1] + uy * inset]; const b = [q[0] - ux * inset, q[1] - uy * inset];
  const h = 10; const w = 5.5;
  const base = [b[0] - ux * h, b[1] - uy * h];
  return { line: [a, base], head: `${b[0]},${b[1]} ${base[0] - uy * w},${base[1] + ux * w} ${base[0] + uy * w},${base[1] - ux * w}` };
}
function Arrow({ from, to, color, offset = 0, label, inset = 8, dashed = false, ...rest }) {
  const dx = to[0] - from[0]; const dy = to[1] - from[1]; const l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l * offset; const ny = dx / l * offset;
  const p = [from[0] + nx, from[1] + ny]; const q = [to[0] + nx, to[1] + ny];
  if (l < 2 * inset + 6) return null;
  const a = arrowPath(p, q, inset);
  const mx = (p[0] + q[0]) / 2 + nx * 0.9; const my = (p[1] + q[1]) / 2 + ny * 0.9;
  return (
    <g {...rest}>
      <line x1={a.line[0][0]} y1={a.line[0][1]} x2={a.line[1][0]} y2={a.line[1][1]} stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeDasharray={dashed ? '6 4' : undefined} />
      <polygon points={a.head} fill={color} />
      {label && (
        <g style={{ direction: 'ltr' }}>
          <text x={mx} y={my + 4} textAnchor="middle" fontSize={13} fontWeight={800} fill={color} stroke="#fff" strokeWidth={3} paintOrder="stroke">{label}</text>
          <line x1={mx - label.length * 4} x2={mx + label.length * 4 - 2} y1={my - 9} y2={my - 9} stroke={color} strokeWidth={1.4} />
          <polygon points={`${mx + label.length * 4},${my - 9} ${mx + label.length * 4 - 4},${my - 11.5} ${mx + label.length * 4 - 4},${my - 6.5}`} fill={color} />
        </g>
      )}
    </g>
  );
}

/** Une épingle de carte (avatar) posée sur le point : le dessin seul, le nom est écrit à côté. */
function Pin({ at, color, reduce, uidKey }) {
  const [x, y] = at;
  return (
    <g aria-hidden="true">
      {!reduce && <circle className="md-ping" cx={x} cy={y} r={7} fill="none" stroke={color} strokeWidth={2} data-deco="ping" key={uidKey} />}
      <path d={`M${x} ${y} C${x - 3} ${y - 9} ${x - 11} ${y - 13} ${x - 11} ${y - 21} A11 11 0 1 1 ${x + 11} ${y - 21} C${x + 11} ${y - 13} ${x + 3} ${y - 9} ${x} ${y} Z`} fill={color} stroke="#fff" strokeWidth={1.5} />
      <circle cx={x} cy={y - 21} r={6.5} fill="#FDE68A" data-deco="avatar" />
      <circle cx={x} cy={y - 24.5} r={5} fill="#3F2A1D" data-deco="hair" opacity={0.85} />
      <circle cx={x} cy={y} r={3.2} fill="#0F172A" />
    </g>
  );
}

function MapBackdrop({ width, height, city, reduce }) {
  // la mer en haut (le nord), la promenade, des palmiers ; Alger : la grande roue des Sablettes ; Oran : Santa Cruz
  const sea = Math.max(18, height * 0.13);
  const palms = [0.18, 0.5, 0.82].map((f) => f * width);
  return (
    <g data-deco="map" aria-hidden="true">
      <rect x={0} y={0} width={width} height={height} fill="#F8FAFC" />
      <rect x={0} y={0} width={width} height={sea} fill="#BAE6FD" />
      <path d={`M0 ${sea} Q ${width / 4} ${sea + 7} ${width / 2} ${sea} T ${width} ${sea} V ${sea + 9} H 0 Z`} fill="#FEF3C7" />
      {[0.25, 0.55, 0.8].map((f, i) => (
        <path key={i} className={reduce ? undefined : 'md-wave'} d={`M${f * width - 14} ${sea * 0.45} q7 -4 14 0 t14 0`} fill="none" stroke="#0EA5E9" strokeWidth={1.4} opacity={0.6} />
      ))}
      {city === 'alger' ? (
        <g transform={`translate(${width - 34} ${sea + 2})`} opacity={0.35} data-deco="wheel">
          <circle cx={0} cy={-2} r={16} fill="none" stroke="#7C3AED" strokeWidth={1.6} />
          {[0, 45, 90, 135].map((a) => <line key={a} x1={-16 * Math.cos(a * Math.PI / 180)} y1={-2 - 16 * Math.sin(a * Math.PI / 180)} x2={16 * Math.cos(a * Math.PI / 180)} y2={-2 + 16 * Math.sin(a * Math.PI / 180)} stroke="#7C3AED" strokeWidth={1} />)}
          <path d="M-8 22 L0 -2 L8 22" fill="none" stroke="#7C3AED" strokeWidth={1.6} />
        </g>
      ) : (
        <g transform={`translate(${width - 52} ${sea - 2})`} opacity={0.35} data-deco="santa-cruz">
          <path d="M0 0 Q18 -26 46 -6 L46 0 Z" fill="#A16207" />
          <rect x={20} y={-26} width={8} height={10} fill="#F5F5F4" /><path d="M24 -32 L24 -26 M21 -29 L27 -29" stroke="#78716C" strokeWidth={1.2} />
        </g>
      )}
      {palms.map((x, i) => (
        <g key={i} transform={`translate(${x} ${sea + 4})`} opacity={0.3} data-deco="palm">
          <line x1={0} y1={0} x2={0} y2={-12} stroke="#92400E" strokeWidth={1.6} />
          <path d="M0 -12 q-7 -2 -10 3 M0 -12 q7 -2 10 3 M0 -12 q-3 -6 -8 -7 M0 -12 q3 -6 8 -7" fill="none" stroke="#15803D" strokeWidth={1.6} />
        </g>
      ))}
      <style>{'.md-wave{animation:md-w 3s ease-in-out infinite}.md-ping{animation:md-p 2.2s ease-out infinite;transform-box:fill-box;transform-origin:center}.md-ride{transition:transform 1.4s ease-in-out}@keyframes md-w{0%,100%{transform:translateX(0)}50%{transform:translateX(5px)}}@keyframes md-p{0%{opacity:.8;transform:scale(.6)}100%{opacity:0;transform:scale(2.6)}}@media (prefers-reduced-motion: reduce){.md-wave,.md-ping{animation:none}.md-ride{transition:none}}'}</style>
    </g>
  );
}

function Scene({ lab, fr, uid, city, ride, width, height, advanced, meetJ, cornerJ, lastHere, showMeetLive, showLegs, legs, rootText }) {
  const reduce = useReducedMotion();
  const text = { direction: 'ltr', unicodeBidi: 'isolate' };
  const { win, px, py, P } = fr;
  const grid = [];
  for (let x = win.xMin; x <= win.xMax; x += 1) grid.push(<line key={`x${x}`} x1={px(x)} x2={px(x)} y1={py(win.yMin)} y2={py(win.yMax)} stroke="#94A3B8" strokeWidth={x === 0 ? 0 : 0.7} opacity={0.5} />);
  for (let y = win.yMin; y <= win.yMax; y += 1) grid.push(<line key={`y${y}`} x1={px(win.xMin)} x2={px(win.xMax)} y1={py(y)} y2={py(y)} stroke="#94A3B8" strokeWidth={y === 0 ? 0 : 0.7} opacity={0.5} />);
  const tick = fr.u >= 22 ? 1 : 2;
  const axes = (
    <g data-md-axes>
      <line x1={px(win.xMin)} x2={px(win.xMax) + 4} y1={py(0)} y2={py(0)} stroke="#334155" strokeWidth={1.6} />
      <polygon points={`${px(win.xMax) + 8},${py(0)} ${px(win.xMax)},${py(0) - 4} ${px(win.xMax)},${py(0) + 4}`} fill="#334155" />
      <line x1={px(0)} x2={px(0)} y1={py(win.yMin)} y2={py(win.yMax) - 4} stroke="#334155" strokeWidth={1.6} />
      <polygon points={`${px(0)},${py(win.yMax) - 8} ${px(0) - 4},${py(win.yMax)} ${px(0) + 4},${py(win.yMax)}`} fill="#334155" />
      <g style={text} fontSize={10} fill="#475569" fontFamily="ui-monospace, monospace">
        {Array.from({ length: win.xMax - win.xMin + 1 }, (_, i) => win.xMin + i).filter((x) => x !== 0 && x % tick === 0).map((x) => (
          <text key={`tx${x}`} x={px(x)} y={py(0) + 12} textAnchor="middle">{num(x)}</text>
        ))}
        {Array.from({ length: win.yMax - win.yMin + 1 }, (_, i) => win.yMin + i).filter((y) => y !== 0 && y % tick === 0).map((y) => (
          <text key={`ty${y}`} x={px(0) - 5} y={py(y) + 3.5} textAnchor="end">{num(y)}</text>
        ))}
        <text x={px(0) - 6} y={py(0) + 12} textAnchor="end" fontWeight={700}>O</text>
      </g>
    </g>
  );
  const label = (name, at, dx, dy, color = '#0F172A') => (
    <text x={at[0] + dx} y={at[1] + dy} textAnchor="middle" fontSize={15} fontWeight={800} fill={color} stroke="#fff" strokeWidth={3.5} paintOrder="stroke" style={text}>{name}</text>
  );

  if (lab.stage === 'meet') {
    const m = lab.meet;
    const [na, nb, ni] = m.names;
    const A = P(m.A); const B = P(m.B); const M = P(m.M);
    const ok = meetJ.kind === 'ok' && lastHere?.kind === 'ok';
    // (مبتدئ) les ombres sur les axes : [xA ; xM] et [xM ; xB] — égales au seul milieu
    const shadows = showMeetLive && !advanced && (
      <g data-md-shadows opacity={0.9}>
        {[[A, M, C_A], [M, B, C_M]].map(([p, q, c], i) => (
          <g key={i}>
            <line x1={p[0]} x2={q[0]} y1={py(0) + (i ? 5 : -5)} y2={py(0) + (i ? 5 : -5)} stroke={c} strokeWidth={4} strokeLinecap="round" opacity={0.75} />
            <line x1={px(0) + (i ? 5 : -5)} x2={px(0) + (i ? 5 : -5)} y1={p[1]} y2={q[1]} stroke={c} strokeWidth={4} strokeLinecap="round" opacity={0.75} />
          </g>
        ))}
        {[A, M, B].map((p, i) => (
          <g key={`g${i}`} stroke="#64748B" strokeWidth={1} strokeDasharray="3 4">
            <line x1={p[0]} x2={p[0]} y1={p[1]} y2={py(0)} />
            <line x1={p[0]} x2={px(0)} y1={p[1]} y2={p[1]} />
          </g>
        ))}
      </g>
    );
    return (
      <svg width={width} height={height} className="absolute inset-0" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
        <MapBackdrop width={width} height={height} city={city} reduce={reduce} />
        <g>{grid}</g>
        {axes}
        {shadows}
        <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke="#0EA5E9" strokeWidth={1.4} strokeDasharray="2 5" opacity={0.7} data-md-road />
        <Arrow from={A} to={M} color={ok ? C_OK : C_A} offset={-14} label={`${na}${ni}`} data-md-arrow="AM" />
        <Arrow from={M} to={B} color={ok ? C_OK : C_M} offset={-14} label={`${ni}${nb}`} data-md-arrow="MB" />
        <Pin at={A} color={C_A} reduce={reduce} uidKey={`${uid}a`} />
        <Pin at={B} color={C_B} reduce={reduce} uidKey={`${uid}b`} />
        {label(na, A, 15, 14, C_A)}{label(nb, B, 15, 14, C_B)}
        {ok && <circle cx={M[0]} cy={M[1]} r={26} fill="none" stroke={C_OK} strokeWidth={2.5} strokeDasharray="4 4" data-deco="meet-ring" />}
      </svg>
    );
  }

  const d = lab.dist;
  const [da, db] = d.names;
  const A = P(d.A); const B = P(d.B); const Cc = P(d.C);
  const okC = !!d.cornerOk;
  const firstStreet = cornerJ.kind === 'ok' || cornerJ.kind === 'slant';
  const legColor = cornerJ.kind === 'ok' ? C_STREET : '#94A3B8';
  // la trottinette (décor) parcourt A → C → B quand on la touche
  const stops = [A, Cc, B];
  const at = stops[ride % 3];
  return (
    <svg width={width} height={height} className="absolute inset-0" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
      <MapBackdrop width={width} height={height} city={city} reduce={reduce} />
      <g>{grid}</g>
      {axes}
      <g data-md-stairs data-ok={okC ? 'true' : 'false'}>
        <line x1={A[0]} y1={A[1]} x2={Cc[0]} y2={Cc[1]} stroke={firstStreet ? legColor : '#F43F5E'} strokeWidth={5} strokeLinecap="round" opacity={0.85} strokeDasharray={firstStreet ? undefined : '6 5'} />
        <line x1={Cc[0]} y1={Cc[1]} x2={B[0]} y2={B[1]} stroke={cornerJ.kind === 'ok' ? legColor : '#F43F5E'} strokeWidth={5} strokeLinecap="round" opacity={0.85} strokeDasharray={cornerJ.kind === 'ok' ? undefined : '6 5'} />
        {cornerJ.kind === 'ok' && (() => {
          const s = 11;
          const ux = Math.sign(A[0] - Cc[0]) || Math.sign(B[0] - Cc[0]); const uy = Math.sign(B[1] - Cc[1]) || Math.sign(A[1] - Cc[1]);
          return <path d={`M${Cc[0] + ux * s} ${Cc[1]} L${Cc[0] + ux * s} ${Cc[1] + uy * s} L${Cc[0]} ${Cc[1] + uy * s}`} fill="none" stroke={legColor} strokeWidth={2} data-md-right />;
        })()}
      </g>
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={d.solved ? C_OK : C_GPS} strokeWidth={d.solved ? 3.4 : 2} strokeDasharray={d.solved ? undefined : '7 6'} data-md-gps-line />
      {showLegs && cornerJ.kind === 'ok' && (
        <g style={text} fontSize={14} fontWeight={800} data-md-leg-labels>
          {[[A, Cc], [Cc, B]].map(([p, q2], i) => {
            const horizontal = Math.abs(p[1] - q2[1]) < 1;
            const len = horizontal ? legs.h : legs.v;
            const mx = (p[0] + q2[0]) / 2; const my = (p[1] + q2[1]) / 2;
            const away = horizontal ? (my > (A[1] + B[1]) / 2 ? 18 : -10) : 0;
            const side = horizontal ? 0 : (mx > (A[0] + B[0]) / 2 ? 14 : -14);
            return <text key={i} x={mx + side} y={my + away + 4} textAnchor="middle" fill={C_STREET} stroke="#fff" strokeWidth={3.5} paintOrder="stroke">{len}</text>;
          })}
          {d.solved && <text x={(A[0] + B[0]) / 2} y={(A[1] + B[1]) / 2 - 8} textAnchor="middle" fill={C_OK} stroke="#fff" strokeWidth={3.5} paintOrder="stroke">{rootText}</text>}
        </g>
      )}
      <Pin at={A} color={C_A} reduce={reduce} uidKey={`${uid}a`} />
      <Pin at={B} color={C_B} reduce={reduce} uidKey={`${uid}b`} />
      {label(da, A, 15, 14, C_A)}{label(db, B, 15, 14, C_B)}
      <g className="md-ride" style={{ transform: `translate(${at[0]}px, ${at[1] + 14}px)` }} data-deco="scooter-rider">
        <circle cx={-6} cy={4} r={3} fill="#0F172A" /><circle cx={6} cy={4} r={3} fill="#0F172A" />
        <path d="M-6 4 L4 4 L6 -8" stroke="#10B981" strokeWidth={2} fill="none" />
      </g>
    </svg>
  );
}

/** La trottinette de l'appli : touchée, elle parcourt l'escalier (décor seulement). */
function Scooter({ onRide }) {
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" data-deco="scooter" onClick={onRide} className="h-11 w-10 shrink-0 rounded-xl focus:outline-none">
      <svg viewBox="0 0 40 44" width="100%" height="100%">
        <circle cx="10" cy="34" r="5" fill="#0F172A" /><circle cx="31" cy="34" r="5" fill="#0F172A" />
        <path d="M10 34 L27 34 L31 12 L36 12" stroke="#10B981" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <circle cx="20" cy="9" r="5" fill="#FDE68A" /><path d="M14 8 Q20 1 26 8" fill="#0EA5E9" />
      </svg>
    </button>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de chaque étape : le rendez-vous → les deux coordonnées du milieu ; la distance → les jambes, la somme des carrés, la racine, puis la règle. */
export const chainOf = (step) => (step === 'meet' ? ['midHow', 'midBack'] : ['legs', 'distSq', 'distRoot', 'rule']);

const ft = (v) => String(v).replace('.', '{,}');   // 2.5 → 2{,}5 (virgule KaTeX), le signe est celui de KaTeX
const iso = (s) => `$${s}$`;

const sg = (v) => (v < 0 ? `(${ft(v)})` : ft(v));

/** La méthode du milieu : la moyenne (juste), la somme sans « ÷ 2 » (MUNTASAF-NISF), la demi-différence (MUNTASAF-TARH) — sur l'abscisse de l'élève. */
const midHow = (lab, step, k) => {
  const m = lab.meet; const [na, nb, ni] = m.names;
  const [ax, ay] = L.xy(m.A); const [bx, by] = L.xy(m.B);
  // l'abscisse, sauf si elle ne distingue pas les trois méthodes (alors l'ordonnée)
  const pick = (a, b) => new Set([(a + b) / 2, a + b, (b - a) / 2]).size === 3;
  const comp = pick(ax, bx) ? 0 : 1;
  const a = comp === 0 ? ax : ay; const b = comp === 0 ? bx : by;
  const v = comp === 0 ? 'x' : 'y';
  const o = { a: na, b: nb, i: ni, comp: k(comp === 0 ? 'cp.midHow.compX' : 'cp.midHow.compY'), expr: iso(`${v}_{${ni}}`) };
  const sum = `${v}_{${na}} + ${v}_{${nb}}`;
  return {
    id: 'midHow', kind: 'choice',
    prompt: Mx(k, 'midHow.prompt', o),
    options: [
      { text: <MathText>{iso(`\\dfrac{${sg(a)} + ${sg(b)}}{2}`)}</MathText>, correct: true },
      { text: <MathText>{iso(`${sg(a)} + ${sg(b)}`)}</MathText>, why: Mx(k, 'mid.whySum', { ...o, n: iso(ft(a + b)), sum: iso(`${sg(a)} + ${sg(b)} = ${ft(a + b)}`) }) },
      { text: <MathText>{iso(`\\dfrac{${sg(b)} - ${sg(a)}}{2}`)}</MathText>, why: Mx(k, 'mid.whyDiff', { ...o, n: iso(ft((b - a) / 2)), diff: iso(`\\dfrac{${sg(b)} - ${sg(a)}}{2} = ${ft((b - a) / 2)}`) }) },
    ],
    hints: [Mx(k, 'midHow.hint1', o), Mx(k, 'midHow.hint2', o)],
    explain: Mx(k, 'midHow.explain', { ...o, calc: iso(`${v}_{${ni}} = \\dfrac{${sum}}{2} = \\dfrac{${sg(a)} + ${sg(b)}}{2} = ${ft((a + b) / 2)}`) }),
  };
};

/** La réciproque : connaissant le milieu et un ami, où est l'autre (B = 2I − A) ; pièges : I + A, 2I, le symétrique de I par rapport à A. */
const midBack = (lab, step, k) => {
  const m = lab.meet; const [na, nb, ni] = m.names;
  const [ax, ay] = L.xy(m.A); const [bx, by] = L.xy(m.B); const [ix, iy] = L.xy(m.I);
  const pt = (n, x, y) => iso(`${n}(${ft(x)}\\,;\\,${ft(y)})`);
  const o = { a: na, b: nb, i: ni, pi: pt(ni, ix, iy), pa: pt(na, ax, ay) };
  const cands = [
    { x: ix + ax, y: iy + ay, why: 'whyAdd' }, { x: 2 * ix, y: 2 * iy, why: 'whyDouble' }, { x: 2 * ax - ix, y: 2 * ay - iy, why: 'whyAside' }, { x: bx + 1, y: by - 1, why: 'whyOff' },
  ];
  const seen = new Set([`${bx};${by}`]); const ds = [];
  for (const c of cands) { const key = `${c.x};${c.y}`; if (ds.length < 2 && !seen.has(key)) { seen.add(key); ds.push(c); } }
  return {
    id: 'midBack', kind: 'choice',
    prompt: Mx(k, 'midBack.prompt', o),
    options: [
      { text: <MathText>{pt(nb, bx, by)}</MathText>, correct: true },
      ...ds.map((d) => ({ text: <MathText>{pt(nb, d.x, d.y)}</MathText>, why: Mx(k, `midBack.${d.why}`, { ...o, pt: pt(nb, d.x, d.y) }) })),
    ],
    hints: [Mx(k, 'midBack.hint1', o), Mx(k, 'midBack.hint2', o)],
    explain: Mx(k, 'midBack.explain', { ...o, pb: pt(nb, bx, by), calc: iso(`${ft(ix)} = \\dfrac{${sg(ax)} + x_{${nb}}}{2}`) }),
  };
};

const legAnswer = (f) => ({ kind: 'number', expected: String(Math.abs(Number(L.legLatex(f)))), answer: <MathText>{iso(L.legLatex(f))}</MathText> });

export const QUESTIONS = {
  midHow,
  midBack,
  legs: (lab, step, k) => {
    const d = lab.dist; const [da, db, dc] = d.names;
    const o = { a: da, b: db, c: dc, ab: iso(`${da}${db}`), h: iso(L.legLatex(d.h)), v: iso(L.legLatex(d.v)) };
    return {
      id: 'legs', ...legAnswer(d.h),
      prompt: Mx(k, 'legs.prompt', o),
      hints: [Mx(k, 'legs.hint1', o), Mx(k, 'legs.hint2', o)],
      explain: Mx(k, 'legs.explain', o),
    };
  },
  distSq: (lab, step, k) => {
    const d = lab.dist; const [da, db] = d.names;
    const o = { a: da, b: db, h: iso(L.legLatex(d.h)), v: iso(L.legLatex(d.v)), sq: iso(L.legLatex(d.square)) };
    return {
      id: 'distSq', kind: 'number', expected: String(L.legLatex(d.square)), answer: <MathText>{o.sq}</MathText>,
      prompt: Mx(k, 'distSq.prompt', o),
      hints: [Mx(k, 'distSq.hint1', o), Mx(k, 'distSq.hint2', o)],
      explain: Mx(k, 'distSq.explain', { ...o, calc: iso(`${L.legLatex(d.h)}^2 + ${L.legLatex(d.v)}^2 = ${L.legLatex(d.square)}`) }),
    };
  },
  distRoot: (lab, step, k) => {
    const d = lab.dist; const [da, db] = d.names;
    const o = { a: da, b: db, ab: iso(`${da}${db}`), h: iso(L.legLatex(d.h)), v: iso(L.legLatex(d.v)), taxi: iso(L.legLatex(d.taxi)), sq: iso(L.legLatex(d.square)), formula: iso(L.distFormulaLatex(d)) };
    return {
      id: 'distRoot', kind: 'choice', cols: 3,
      prompt: Mx(k, 'distRoot.prompt', o),
      options: [
        { text: <MathText>{iso(L.rootLatex(d))}</MathText>, correct: true },
        { text: <MathText>{o.taxi}</MathText>, why: Mx(k, 'distRoot.whyTaxi', o) },
        { text: <MathText>{o.sq}</MathText>, why: Mx(k, 'distRoot.whySquare', o) },
      ],
      hints: [Mx(k, 'distRoot.hint1', o), Mx(k, 'distRoot.hint2', o)],
      explain: Mx(k, 'distRoot.explain', o),
    };
  },
  rule: (lab, step, k) => ({
    id: 'rule', kind: 'choice',
    prompt: <MathText>{k('dPrompt')}</MathText>,
    options: discoveryOptionsOf(lab, k),
    hints: [Mx(k, 'rule.hint1'), Mx(k, 'rule.hint2')],
    explain: (
      <div className="space-y-1 text-sm" data-md-formal>
        <p className="font-bold"><MathText>{k('formalMid')}</MathText></p>
        <p className="font-bold"><MathText>{k('formalDist')}</MathText></p>
        <p><MathText>{k('formalNote')}</MathText></p>
      </div>
    ),
  }),
};
