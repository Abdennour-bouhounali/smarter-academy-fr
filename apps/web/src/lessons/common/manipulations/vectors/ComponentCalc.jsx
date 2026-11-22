import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Check, Minus, Plus, ChevronLeft } from 'lucide-react';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import LabFold from '../primitives/LabFold';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { Mx, $, useTick } from './vecCp';
import MathText from '../../components/MathText';
import * as L from '../logic/componentCalc';

/**
 * component-calc — LES PORTAILS DE LA CARTE DE JEU (unité 12 « الأشعة في معلم », درس « حساب مركبتي شعاع وتساوي
 * شعاعين في معلم » : نشاط 2 p. 140, معارف 3 ب et جـ pp. 142–144, طرائق p. 143).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. Mission « calc » : l'élève écrit le CODE d'un portail — les deux composantes, chacune sur un compteur signé
 *    (− / + / ±, chiffres et flèches du clavier) — puis l'ouvre : le héros SAUTE de l'origine du vecteur qu'il a écrit.
 *    Mission « place » : il TIENT un portail aux deux coordonnées inconnues (glisser, toucher un nœud, flèches sur la
 *    poignée, ou ses deux compteurs x / y) et le valide.
 * B. Idée : AB = (x_B − x_A ; y_B − y_A) — fin moins début, signe compris ; deux vecteurs sont égaux quand leurs
 *    composantes le sont, d'où les coordonnées d'un point inconnu (DC = AB ⇒ x_C − x_D = x_B − x_A …).
 * C. Le héros atterrit sur la cible ou ailleurs (à l'envers : de l'autre côté du départ) ; le portail s'ouvre ;
 *    le vecteur posé se redessine ; le quadrilatère ABCD se tend en متوازي أضلاع ou se CROISE.
 * D. Les soustractions écrites sous le code juste ($x_B - x_A = 4 - 1 = 3$) ; pendant la pose, les deux égalités de
 *    composantes et leurs voyants (en direct à مبتدئ, à la validation à متقدم) ; le verdict ; les essais.
 * E. À découvrir avant la règle : la soustraction se fait « fin moins début » (sinon le saut part à l'envers) ; un
 *    vecteur égal se construit composante par composante ; l'ORDRE des lettres (DC, pas CD) décide.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        les composantes d'un vecteur par les coordonnées ; l'égalité de deux vecteurs par les composantes
 *   OBJECT         des portails de téléportation sur la carte d'un jeu mobile, un héros qui saute de l'un à l'autre
 *   VARIABLE       les deux composantes du code (calc) ; les deux coordonnées du portail à poser (place)
 *   INVARIANT      le code d'un saut ne dépend pas du départ : deux portails « jumeaux » ont le même code (DE = CF)
 *   TRANSFORMATION le saut du héros (départ + code), le vecteur posé qui se redessine, la forme ABCD
 *   CONSTRAINT     codes entiers de −12 à 12 ; les points sur les nœuds de la carte
 *   RESISTANCE     le portail reste FERMÉ : le saut à l'envers est dessiné (TARH-MAQLUB), l'échange x / y, les
 *                  coordonnées de B au lieu des composantes, un signe oublié sont nommés ; la pose CD = AB croise ABCD
 *                  et est refusée (TARTIB-NUQAT) ; ED au lieu de DE refusé
 *   EVIDENCE       le point d'atterrissage, les deux voyants, la forme du quadrilatère, la liste des essais
 *   CONTRAST       un code calculé (le saut) ET un point aux coordonnées inconnues (la pose), où la même soustraction
 *                  s'écrit dans l'autre sens ; à متقدم, deux portails jumeaux de départs différents
 *   PREDICTION     le code est écrit AVANT le saut (aucun aperçu) ; à متقدم la pose est jugée seulement à la validation
 *   DISCOVERY      « مركبتا AB = (x_B − x_A ; y_B − y_A) » — distracteurs réfutés par ses propres essais
 *   FORMALIZATION  معارف 3 ب (la propriété) et جـ (تساوي شعاعين) ; la طريقة « حساب مركبتي شعاع »
 *   TRANSFER       ex-6, 7, 8, 9, 12, 14 (أوظّف), la banque d'exercices
 *
 * Tous les verdicts viennent de `vectors.js` (logic/componentCalc.js) ; le dessin est en flottants. Chaque code est
 * une réponse, chaque pose un choix : aucune auto-complétion (§6bis).
 *
 * DÉCOR (exigence du propriétaire, monde `game-map`) : une île de jeu mobile — la mer, l'herbe en tuiles, des palmiers
 * de l'oasis, un phare, une petite maison de la Casbah —, des portails qui tourbillonnent, le héros à casquette, un
 * compteur de pièces et un coffre qui, touché, fait jaillir des pièces. `aria-hidden`, hors clavier (`tabIndex=-1`),
 * `[data-deco]`, sans aucune information mathématique ; immobile sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (MANIPULATION_CONTRACT §8bis) : la carte est budgétée sur l'écran de leçon (`useLessonViewport`)
 * moins ce que le bloc `[data-cc-glance]` mesure EN PLUS d'elle ; dès 600 px de large, le pavé se range À CÔTÉ de la
 * carte ; la poignée est SUR le point ; la liste des essais est dans un `LabFold` sous le bloc mesuré.
 *
 * PROPS (à plat ou groupées dans `numbers`, comme levels.js) : `points` ({ A: [x, y] … }), `missions` (voir la
 * logique), `live` ; `theme` ('game-map'), `title`, `lead`, `mission`, `level`, `levels`, `onTrial(evidence)` à chaque
 * essai, `onFinished({ missions, trials })` à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-component-calc][data-mission][data-kind=calc|place][data-solved], [data-cc-glance],
 * [data-cc-scene], [data-cc-pad], [data-cc-cell=x|y][role=spinbutton], [data-cc-minus=x|y], [data-cc-plus=x|y],
 * [data-cc-sign=x|y], [data-cc-open], [data-cc-commit], [data-cc-handle=<point>], [data-cc-next], [data-cc-dot=<i>],
 * [data-cc-lamp=x|y][data-ok], [data-cc-portal=<name>][data-open], [data-cc-hero], [data-cc-jump=<kind>],
 * [data-cc-quad][data-shape], [data-cc-twin], [data-cc-verdict=<kind>], [data-lab-fold=component-calc.trials], [data-deco].
 */
const TONE = {
  ok: 'text-emerald-800', twin: 'text-emerald-800', reversed: 'text-rose-800', swapped: 'text-rose-800', coords: 'text-rose-800',
  signX: 'text-amber-800', signY: 'text-amber-800', xOnly: 'text-amber-800', yOnly: 'text-amber-800', none: 'text-rose-800',
  zero: 'text-slate-600', order: 'text-rose-800', onPoint: 'text-slate-600',
};
const C_REF = '#4F46E5'; const C_LIVE = '#D97706'; const C_OK = '#059669'; const C_BAD = '#E11D48';
const nl = (v) => String(v).replace('-', '−');
const tex = (v) => (v < 0 ? `-${Math.abs(v)}` : `${v}`);
const par = (v) => (v < 0 ? `(-${Math.abs(v)})` : `${v}`);
const arrow = (name) => `\\overrightarrow{${name}}`;
const col = ([x, y]) => `\\begin{pmatrix} ${tex(x)} \\\\ ${tex(y)} \\end{pmatrix}`;

export default function ComponentCalc({
  numbers, points: points0, missions: missions0, live: live0, theme = 'game-map', title, lead, mission, level,
  levels: withLevels = true, checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.componentCalc.${key}`, o), [t]);
  const flat = { points: points0, missions: missions0, live: live0 };
  const initialNumbers = { ...Object.fromEntries(Object.entries(flat).filter(([, v]) => v != null)), ...(numbers ?? {}) };
  const state = useManipulation({ type: 'component-calc', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const make = () => L.init(nums);
  const [lab, setLab] = useState(make);
  const sceneKey = `${JSON.stringify(nums)}|${state.epoch}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  if (scene.key !== sceneKey) { setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(make()); }   // « إعادة », un autre niveau : la mission 1 et les questions repartent
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const m = L.mission(lab);
  const calc = m.kind === 'calc';
  const solvedNow = lab.solved[lab.idx];
  const pts = L.knownPoints(lab);
  const [burst, setBurst] = useState(0);
  const coins = lab.solved.filter(Boolean).length * 10 + burst * 3;

  /* ── les questions PENDANT le labo (primitives/LabCheckpoint) : après chaque porte résolue, une suite sur ce que l'élève vient de faire ;
     celle de la dernière mission finit par la règle et remplace la découverte automatique. L'enseignant seul peut les couper. ── */
  const cpSettings = useLabCheckpointSettings('component-calc');
  const cpEnabled = cpOn && cpSettings.enabled;
  const chain = cpEnabled ? chainOf(lab, lab.idx) : null;
  const lastIdx = lab.missions.length - 1;
  const cp = useLabCheckpoint({
    id: chain ? `m${lab.idx}` : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, lab.idx, k)) : null,
    reached: !!solvedNow,
    resetKey: scene.inits,
    onRetry: () => { celebrated.current.delete(lab.idx); setLab(L.restartMission); },
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (id === `m${lastIdx}`) { state.discover(); state.formalize(); } },
  });
  const solvedAll = L.discoveryReady(lab);
  const ready = solvedAll && !cpEnabled;
  const tick = useTick();
  // une étape est FAITE quand la porte est ouverte ET que ses questions sont répondues : la pastille passe au vert et on fête
  const stepDone = lab.missions.map((_, i) => !!lab.solved[i] && (i !== lab.idx || !cp.blocking));
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // « إعادة » : on refête
  const nowDone = stepDone[lab.idx];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.idx)) return;
    celebrated.current.add(lab.idx);
    party.celebrate({ n: lab.idx + 1, total: lab.missions.length });
  }, [nowDone, lab.idx]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son : un déclic par geste (compteur, nœud), le drapeau quand la porte s'ouvre, « over » quand le verdict la refuse
  const trialN = lab.trials.length;
  useEffect(() => {
    const tr = lab.trials[trialN - 1];
    if (tr) playSfx(tr.kind === 'ok' ? 'flag' : 'over');
  }, [trialN]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (state.isFormal) state.report(onFinished, { missions: lab.missions.length, trials: lab.trials.length });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => { if (nTrials > 0) state.report(onTrial, L.evidenceOf(lab)); }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : largeur, écran de leçon, ce que le bloc « glance » ajoute à la carte ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const sceneRef = useRef(null);
  const sceneHRef = useRef(260);
  const [width, setWidth] = useState(320);
  const [overhead, setOverhead] = useState(220);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(200, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(90, Math.ceil(glanceRef.current.getBoundingClientRect().height) - sceneHRef.current));
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
  const side = width >= 600;
  const narrow = width < 380;
  const padW = side ? Math.min(300, Math.max(240, Math.round(width * 0.36))) : 0;
  const roomW = Math.min(side ? width - padW - 12 : width, 640);
  const sceneH = Math.round(Math.max(170, Math.min(L.naturalHeight(lab, roomW), screenH - overhead - 20, 600)));
  sceneHRef.current = sceneH;
  // la carte prend la largeur de l'île à l'échelle choisie (+ une bande de mer), jamais plus : pas d'océan vide
  const mapPad = narrow ? 16 : 22;
  const cell = Math.min((roomW - 2 * mapPad) / (lab.win.xMax - lab.win.xMin), (sceneH - 2 * mapPad) / (lab.win.yMax - lab.win.yMin));
  const sceneW = Math.round(Math.min(roomW, (lab.win.xMax - lab.win.xMin) * cell + 2 * mapPad + 24));
  const fr = L.frame(lab, { width: sceneW, height: sceneH, pad: mapPad });

  /* ── la pose : le point tenu, nœud par nœud ── */
  const [dragging, setDragging] = useState(false);
  const settle = useRef(null);
  useEffect(() => () => { if (settle.current) clearTimeout(settle.current); }, []);
  const commitPlace = useCallback(() => {
    if (settle.current) { clearTimeout(settle.current); settle.current = null; }
    setLab((s) => (L.mission(s).kind === 'place' ? L.commitPlace(s) : s));
  }, []);
  const settleLater = () => { if (settle.current) clearTimeout(settle.current); settle.current = setTimeout(commitPlace, 1100); };
  const nudgePlace = (dx, dy) => {
    tick(dx + dy < 0 ? 0.75 : 1);
    setLab((s) => {
      const mm = L.mission(s); if (mm.kind !== 'place') return s;
      const [x, y] = L.xy(s.placed[mm.point]);
      return L.movePlace(s, [x + dx, y + dy]);
    });
    settleLater();
  };
  const nodeFromEvent = (e) => {
    const r = sceneRef.current.getBoundingClientRect();
    const [x, y] = fr.fromPx(e.clientX - r.left, e.clientY - r.top);
    return [Math.round(x), Math.round(y)];
  };
  const onSceneDown = (e) => {
    if (calc || solvedNow || e.button > 0 || !sceneRef.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    const n = nodeFromEvent(e);
    setLab((s) => L.movePlace(s, n));
  };
  const onSceneMove = (e) => { if (dragging) { const n = nodeFromEvent(e); tick(); setLab((s) => L.movePlace(s, n)); } };
  const onSceneUp = (e) => {
    if (!dragging) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDragging(false);
    const n = nodeFromEvent(e);
    if (settle.current) { clearTimeout(settle.current); settle.current = null; }
    setLab((s) => L.commitPlace(s, n));
  };
  const onHeldKey = (e) => {
    const mv = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (mv) { e.preventDefault(); nudgePlace(...mv); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); commitPlace(); }
  };

  /* ── les compteurs : le code (calc) ou les coordonnées du point (place) ── */
  const counter = (comp) => (calc ? lab.entry[lab.idx][comp] : L.xy(lab.placed[m.point])[comp]);
  const setCounter = (comp, v) => {
    tick(v < counter(comp) ? 0.75 : 1);
    if (calc) setLab((s) => L.setEntry(s, comp, v));
    else { setLab((s) => L.setPlaceCoord(s, comp, v)); settleLater(); }
  };

  /* ── lectures ── */
  const last = lab.last?.kind === 'commit' && lab.last.trial.mission === lab.idx ? lab.last.trial : null;
  const judgedPlace = !calc ? L.judgePlace(lab) : null;
  const showLamps = !calc && (lab.live || (last && L.xy(lab.placed[m.point]).join(';') === last.at.join(';')));
  const quad = !calc ? L.quadOf(lab) : null;
  const tw = calc ? L.twin(lab) : null;
  const refName = !calc ? (m.refNamed ? m.refNames.join('') : null) : null;
  const vecName = !calc ? m.vec.join('') : `${m.from}${m.to}`;
  const target = calc ? L.xy(L.calcTarget(lab)) : null;

  const subLine = (comp) => {
    // « x_B − x_A = 4 − 1 = 3 » sur les points de la mission (calc juste) ou du point posé (place)
    const [p, q] = calc ? [m.from, m.to] : m.vec;
    const at = calc ? pts : { ...pts, [m.point]: lab.placed[m.point] };
    const a = L.xy(at[p])[comp]; const b = L.xy(at[q])[comp];
    const v = comp === 0 ? 'x' : 'y';
    return `${v}_{${q}} - ${v}_{${p}} = ${tex(b)} - ${par(a)} = ${tex(b - a)}`;
  };
  const refValue = !calc ? L.xy(m.ref) : null;

  const verdict = (() => {
    if (calc && solvedNow && tw) return { kind: 'twin', text: k(tw.equal ? 'twinEqual' : 'twinDiff', { u: `$${arrow(vecName)}${col(target)}$`, v: `$${arrow(tw.names.join(''))}${col(L.xy(tw.other))}$`, eq: `$${arrow(tw.names.join(''))} = ${arrow(vecName)}$`, quad: `${tw.names[0]}${tw.names[1]}${m.to}${m.from}` }) };
    if (!last) return null;
    if (calc) {
      const o = { v: `$${arrow(vecName)}$`, back: `$${arrow(`${m.to}${m.from}`)}$`, from: m.from, to: m.to, code: `$${col(last.u)}$` };
      if (last.kind === 'ok') return { kind: 'ok', text: k('c_ok', { ...o, lx: `$${subLine(0)}$`, ly: `$${subLine(1)}$`, res: `$${arrow(vecName)}${col(target)}$` }) };
      return { kind: last.kind, text: k(`c_${last.kind}`, o) };
    }
    const o = {
      name: m.point, v: `$${arrow(vecName)}$`, wrong: `$${arrow(`${m.vec[1]}${m.vec[0]}`)}$`,
      eq: refName ? `$${arrow(vecName)} = ${arrow(refName)}$` : `$${arrow(vecName)}${col(refValue)}$`,
      quad: quad ? quad.names.join('') : '', ref: refName ? `$${arrow(refName)}$` : `$${col(refValue)}$`,
      at: `$${m.point}(${tex(last.at[0])}\\,;\\,${tex(last.at[1])})$`,
    };
    if (last.kind === 'order') return { kind: 'order', text: k(refName ? 'p_orderQuad' : 'p_order', o) };
    return { kind: last.kind, text: k(`p_${last.kind}`, o) };
  })();

  const discoveryOptions = useMemo(() => discoveryOptionsOf(lab, k), [lab, k]);

  const formal = (
    <ol className="list-decimal space-y-1 ps-5 text-sm text-emerald-900" data-cc-formal>
      {['formal1', 'formal2', 'formal3'].map((f) => <li key={f}><MathText>{k(f)}</MathText></li>)}
    </ol>
  );

  const missionText = mission ?? <MathText>{calc
    ? k('missionCalc', { v: `$${arrow(vecName)}$`, from: m.from })
    : k(refName ? 'missionPlace' : 'missionPlaceU', { name: m.point, eq: refName ? `$${arrow(vecName)} = ${arrow(refName)}$` : `$${arrow(vecName)}${col(refValue)}$` })}</MathText>;

  /* ── les commandes ── */
  const btn = 'inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-xl border-2 border-violet-300 bg-white px-2 text-sm font-bold text-violet-900 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500';
  const locked = solvedNow;
  const cellKey = (comp) => (e) => {
    const v = counter(comp);
    if (['ArrowUp', 'ArrowRight'].includes(e.key)) { e.preventDefault(); setCounter(comp, v + 1); return; }
    if (['ArrowDown', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); setCounter(comp, v - 1); return; }
    if (e.key === '-') { e.preventDefault(); setCounter(comp, -v); return; }
    if (e.key === 'Backspace') { e.preventDefault(); setCounter(comp, Math.trunc(v / 10)); return; }
    if (/^[0-9٠-٩]$/.test(e.key)) {
      e.preventDefault();
      const d = Number('٠١٢٣٤٥٦٧٨٩'.includes(e.key) ? '٠١٢٣٤٥٦٧٨٩'.indexOf(e.key) : e.key);
      const sgn = v < 0 ? -1 : 1; const grown = Math.abs(v) * 10 + d;
      setCounter(comp, sgn * (grown <= L.PAD_RANGE.max ? grown : d));
      return;
    }
    if (e.key === 'Enter') { e.preventDefault(); if (calc) setLab(L.commitCalc); else commitPlace(); }
  };
  const compName = (comp) => (calc ? k(comp === 0 ? 'compX' : 'compY', { v: vecName }) : k(comp === 0 ? 'coordX' : 'coordY', { name: m.point }));
  const lampOk = (comp) => (calc ? null : comp === 0 ? judgedPlace.okX : judgedPlace.okY);
  const stepper = (comp) => {
    const axis = comp === 0 ? 'x' : 'y';
    const v = counter(comp);
    return (
      <div className="flex items-center gap-1" dir="ltr" key={axis}>
        <span className="w-6 text-center font-mono text-xs font-bold text-slate-500" aria-hidden="true">{calc ? (comp === 0 ? '↔' : '↕') : axis}</span>
        <button type="button" className={btn} disabled={locked} onClick={() => setCounter(comp, v - 1)} aria-label={k('minus', { name: compName(comp) })} data-cc-minus={axis}><Minus className="h-5 w-5" aria-hidden="true" /></button>
        <div role="spinbutton" tabIndex={locked ? -1 : 0} aria-label={compName(comp)} aria-valuenow={v} aria-valuemin={L.PAD_RANGE.min} aria-valuemax={L.PAD_RANGE.max}
          aria-valuetext={nl(v)} onKeyDown={locked ? undefined : cellKey(comp)} data-cc-cell={axis}
          className={`flex h-11 w-14 items-center justify-center rounded-xl border-2 bg-white font-mono text-xl font-extrabold outline-none focus-visible:ring-4 focus-visible:ring-violet-300 ${locked ? 'border-emerald-400 text-emerald-800' : 'border-violet-400 text-slate-900'}`}>
          {nl(v)}
        </div>
        <button type="button" className={btn} disabled={locked} onClick={() => setCounter(comp, v + 1)} aria-label={k('plus', { name: compName(comp) })} data-cc-plus={axis}><Plus className="h-5 w-5" aria-hidden="true" /></button>
        {calc && (
          <button type="button" className={`${btn} w-11 font-mono text-base`} disabled={locked} onClick={() => setCounter(comp, -v)} aria-label={k('sign', { name: compName(comp) })} data-cc-sign={axis}>±</button>
        )}
        {!calc && showLamps && (
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-extrabold ${lampOk(comp) ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}
            data-cc-lamp={axis} data-ok={lampOk(comp) ? 'true' : 'false'} aria-label={k(`lamp${lampOk(comp) ? 'Ok' : 'No'}${comp === 0 ? 'X' : 'Y'}`)}>
            {lampOk(comp) ? '✓' : '✗'}
          </span>
        )}
      </div>
    );
  };

  const pad = (
    <div className="flex flex-col items-center gap-1.5" data-cc-pad style={side ? { width: padW } : undefined}>
      {calc ? (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-slate-700"><MathText>{`$${arrow(vecName)}$`}</MathText></span>
          <div className="flex flex-col gap-1 rounded-[14px] border-x-[3px] border-slate-500 px-1.5 py-1" data-cc-code>
            {stepper(0)}{stepper(1)}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <span className="text-center text-xs font-bold text-slate-600" dir="ltr"><MathText>{`$${m.point}(x\\,;\\,y)$`}</MathText></span>
          {stepper(0)}{stepper(1)}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {!solvedNow && (calc ? (
          <button type="button" className={`${btn} border-emerald-400 bg-emerald-50 text-emerald-900`} onClick={() => setLab(L.commitCalc)} data-cc-open>
            <Check className="h-4 w-4" aria-hidden="true" />{k('open')}
          </button>
        ) : (
          <button type="button" className={`${btn} border-emerald-400 bg-emerald-50 text-emerald-900`} onClick={commitPlace} data-cc-commit>
            <Check className="h-4 w-4" aria-hidden="true" />{k('commit', { name: m.point })}
          </button>
        ))}
        <Chest onOpen={() => setBurst((n) => n + 1)} burst={burst} />
        {solvedNow && lab.idx < lab.missions.length - 1 && !cp.blocking && (
          <button type="button" className={`${btn} border-violet-400 bg-violet-50`} onClick={() => setLab(L.nextMission)} data-cc-next>
            {k('next')}<ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );

  /* ── lignes vivantes : les égalités de composantes (place), les soustractions (calc juste) ── */
  const reading = !calc ? (
    <div className={`space-y-0.5 text-center ${narrow ? 'text-xs' : 'text-sm'}`} data-cc-reading>
      <p className="font-bold text-slate-700"><MathText>{k('wantLine', { eq: refName ? `$${arrow(vecName)} = ${arrow(refName)}${col(refValue)}$` : `$${arrow(vecName)}${col(refValue)}$` })}</MathText></p>
      {[0, 1].map((comp) => (
        <p key={comp} className={showLamps ? (lampOk(comp) ? 'text-emerald-800' : 'text-rose-800') : 'text-slate-600'} data-cc-eq={comp === 0 ? 'x' : 'y'}>
          <MathText>{showLamps ? `$${subLine(comp)}$` : `$${comp === 0 ? 'x' : 'y'}_{${m.vec[1]}} - ${comp === 0 ? 'x' : 'y'}_{${m.vec[0]}} = \\;?$`}</MathText>
          {showLamps && <span className="ms-1 font-bold" aria-hidden="true">{lampOk(comp) ? '✓' : '✗'}</span>}
        </p>
      ))}
      {quad && showLamps && (
        <p className={`text-xs font-bold ${quad.shape === 'para' ? 'text-emerald-800' : quad.shape === 'crossed' ? 'text-rose-800' : 'text-slate-600'}`} data-cc-quad-reading data-shape={quad.shape}>
          {k(`quad_${quad.shape}`, { quad: quad.names.join('') })}
        </p>
      )}
    </div>
  ) : null;


  const handle = !calc && !solvedNow && (() => {
    const [x, y] = fr.P(lab.placed[m.point]);
    const [px, py] = L.xy(lab.placed[m.point]);
    return (
      <button type="button" onKeyDown={onHeldKey} onClick={(e) => e.preventDefault()}
        aria-label={k('handle', { name: m.point, x: nl(px), y: nl(py) })} data-cc-handle={m.point}
        className={`absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-dashed bg-transparent outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${showLamps && judgedPlace.kind === 'ok' ? 'border-emerald-600' : 'border-amber-500'}`}
        style={{ left: x, top: y, cursor: dragging ? 'grabbing' : 'grab' }} />
    );
  })();

  return (
    <ManipulationShell
      type="component-calc"
      title={title ?? k('title')}
      mission={missionText}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      guided={cpEnabled}
      hints={['hint1', 'hint2', 'hint3'].map((h) => <MathText key={h}>{k(h)}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={(
        <ManipulationDiscovery state={state} prompt={<MathText>{k('dPrompt')}</MathText>} options={discoveryOptions} formal={formal} />
      )}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/60 to-white" minHeight="min-h-[160px]">
        <div ref={boxRef} className="space-y-2" data-component-calc data-mission={lab.idx} data-kind={m.kind}
          data-world={theme} data-solved={solvedAll ? 'true' : 'false'} data-scene-h={sceneH}>
          <div ref={glanceRef} className="relative space-y-1.5" data-cc-glance>
            {party.node}
            {cp.node}
            <div className="flex flex-wrap items-center justify-center gap-1.5" data-cc-missions>
              <LabStepper count={lab.missions.length} current={lab.idx} done={stepDone} stepAttr="data-cc-dot" />
              <span className="text-xs font-bold text-slate-700"><MathText>{calc ? k('stripCalc', { v: `$${arrow(vecName)}$` }) : k('stripPlace', { name: m.point })}</MathText></span>
              <span className="rounded-full bg-slate-900/80 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-300" dir="ltr" data-deco="coins" aria-hidden="true">● {coins}</span>
            </div>
            <div className={side ? 'flex items-start justify-center gap-3' : 'space-y-1.5'}>
              <div ref={sceneRef} className="relative mx-auto select-none" style={{ width: sceneW, height: sceneH, touchAction: calc ? undefined : 'none' }}
                data-cc-scene onPointerDown={onSceneDown} onPointerMove={onSceneMove} onPointerUp={onSceneUp} onPointerCancel={onSceneUp}>
                <Scene lab={lab} fr={fr} uid={uid} width={sceneW} height={sceneH} last={last} quad={showLamps ? quad : null} tw={tw} />
                {handle}
              </div>
              <div className="space-y-1.5">
                {pad}
                {side && reading}
              </div>
            </div>
            {!side && reading}
            <p role="status" className={`min-h-[2.5rem] text-center ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug ${verdict ? TONE[verdict.kind] : 'text-slate-500'}`}
              data-cc-verdict={verdict?.kind ?? ''}>
              {verdict ? <MathText>{verdict.text}</MathText> : <MathText>{k(calc ? 'waitingCalc' : (lab.live ? 'waitingPlace' : 'waitingPlaceBlind'), { name: m.point ?? '' })}</MathText>}
            </p>
          </div>

          {lab.trials.length > 0 && (
            <LabFold id="component-calc.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-cc-trials={lab.trials.length}>
                {lab.trials.map((x, i) => {
                  const mm = lab.missions[x.mission];
                  return (
                    <li key={i} className={TONE[x.kind]} data-kind={x.kind}>
                      <MathText>{mm.kind === 'calc'
                        ? k('trialCalc', { n: x.mission + 1, v: `$${arrow(`${mm.from}${mm.to}`)}$`, code: `$${col(x.u)}$`, verdict: k(`t_${x.kind}`) })
                        : k('trialPlace', { n: x.mission + 1, at: `$${mm.point}(${tex(x.at[0])}\\,;\\,${tex(x.at[1])})$`, verdict: k(`t_${x.kind}`) })}</MathText>
                    </li>
                  );
                })}
              </ul>
            </LabFold>
          )}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ── la découverte : distracteurs réfutés par les essais de l'élève (aussi la dernière question de la suite) ── */
export function discoveryOptionsOf(lab, k) {
    const rev = L.lastTrial(lab, (x) => x.kind === 'reversed');
    const firstCalc = lab.missions.findIndex((x) => x.kind === 'calc');
    const mc = lab.missions[firstCalc];
    const known = L.knownPoints(lab, firstCalc);
    const tc = L.xy(L.calcTarget(lab, firstCalc));
    const to = L.xy(known[mc.to]);
    const neg = lab.missions.map((x, i) => (x.kind === 'calc' ? L.xy(L.calcTarget(lab, i)) : null)).find((u) => u && (u[0] < 0 || u[1] < 0));
    return [
      {
        text: <MathText>{k('dReversed')}</MathText>,
        why: <MathText>{rev ? k('dReversedMine', { code: `$${col(rev.u)}$` }) : k('dReversedWhy', { back: `$${arrow(`${mc.to}${mc.from}`)}$` })}</MathText>,
      },
      { text: <MathText>{k('dRight')}</MathText>, correct: true },
      {
        text: <MathText>{k('dCoords')}</MathText>,
        why: <MathText>{k('dCoordsWhy', { p: `$${mc.to}(${tex(to[0])}\\,;\\,${tex(to[1])})$`, v: `$${arrow(`${mc.from}${mc.to}`)}${col(tc)}$` })}</MathText>,
      },
      {
        text: <MathText>{k('dCount')}</MathText>,
        why: <MathText>{neg ? k('dCountWhy', { code: `$${col(neg)}$` }) : k('dCountWhyPlace')}</MathText>,
      },
    ];
  }

/* ── le coffre du jeu : touché, il fait jaillir des pièces (décor) ── */
function Chest({ onOpen, burst }) {
  const reduce = useReducedMotion();
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" data-deco="chest" onClick={onOpen}
      className="relative h-11 w-11 shrink-0 rounded-lg focus:outline-none">
        <svg viewBox="0 0 40 36" width="100%" height="100%">
          <rect x="4" y="14" width="32" height="18" rx="3" fill="#92400E" stroke="#451A03" strokeWidth="1.5" />
          <path d="M4 16 Q20 2 36 16 Z" fill="#B45309" stroke="#451A03" strokeWidth="1.5" />
          <rect x="17" y="17" width="6" height="7" rx="1" fill="#FCD34D" />
          {burst > 0 && !reduce && [0, 1, 2].map((i) => (
            <circle key={`${burst}-${i}`} cx={12 + i * 8} cy={8} r={3} fill="#FCD34D" stroke="#B45309" className="cc-coin" style={{ animationDelay: `${i * 0.08}s` }} />
          ))}
        </svg>
        <style>{'.cc-coin{animation:cc-pop .7s ease-out 1 both}@keyframes cc-pop{0%{transform:translateY(8px);opacity:0}40%{opacity:1}100%{transform:translateY(-10px);opacity:0}}@media (prefers-reduced-motion: reduce){.cc-coin{animation:none;opacity:0}}'}</style>
    </button>
  );
}

/* ── la carte : l'île (décor), le repère, les portails, le héros, les flèches ── */
function Arrow({ from, to, color, label, dashed = false, inset = 9, width = 3.4, ...rest }) {
  const dx = to[0] - from[0]; const dy = to[1] - from[1]; const l = Math.hypot(dx, dy) || 1;
  if (l < 2 * inset + 6) return null;
  const ux = dx / l; const uy = dy / l;
  const a = [from[0] + ux * inset, from[1] + uy * inset]; const b = [to[0] - ux * inset, to[1] - uy * inset];
  const h = 11; const w = 6;
  const base = [b[0] - ux * h, b[1] - uy * h];
  const mx = (a[0] + b[0]) / 2 - uy * 14; const my = (a[1] + b[1]) / 2 + ux * 14;
  return (
    <g {...rest}>
      <line x1={a[0]} y1={a[1]} x2={base[0]} y2={base[1]} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? '7 5' : undefined} />
      <polygon points={`${b[0]},${b[1]} ${base[0] - uy * w},${base[1] + ux * w} ${base[0] + uy * w},${base[1] - ux * w}`} fill={color} />
      {label && (
        <g style={{ direction: 'ltr' }}>
          <text x={mx} y={my + 5} textAnchor="middle" fontSize={13} fontWeight={800} fill={color} stroke="#fff" strokeWidth={3} paintOrder="stroke">{label}</text>
          <line x1={mx - label.length * 4} x2={mx + label.length * 4 - 2} y1={my - 8} y2={my - 8} stroke={color} strokeWidth={1.4} />
          <polygon points={`${mx + label.length * 4},${my - 8} ${mx + label.length * 4 - 4},${my - 10.5} ${mx + label.length * 4 - 4},${my - 5.5}`} fill={color} />
        </g>
      )}
    </g>
  );
}

function Palm({ x, y, s }) {
  return (
    <g data-deco="palm" aria-hidden="true" opacity={0.55} transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 Q3 -14 1 -26" stroke="#92400E" strokeWidth="3" fill="none" />
      <path d="M1 -26 Q-10 -30 -16 -22 M1 -26 Q12 -31 17 -22 M1 -26 Q-4 -36 -12 -36 M1 -26 Q7 -37 14 -35" stroke="#15803D" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Portal({ at, r, open, uid, name, coords, reduce, tone = 'violet', target = false, fs = 13.5, width = 9999 }) {
  // le nom à droite du portail, ou à gauche s'il sortirait de la carte
  const estW = name.length * fs * 0.62 + coords.length * (fs - 2) * 0.5;
  const right = at[0] + r + 3 + estW <= width - 2;
  const ring = tone === 'amber' ? '#D97706' : open ? C_OK : '#7C3AED';
  return (
    <g data-cc-portal={name} data-open={open ? 'true' : 'false'} data-target={target ? 'true' : undefined}>
      {target && !open && <circle cx={at[0]} cy={at[1]} r={r + 6} fill="none" stroke="#7C3AED" strokeWidth={2} strokeDasharray="4 4" opacity={0.8} />}
      {open && <circle cx={at[0]} cy={at[1]} r={r + 6} fill="rgba(5,150,105,0.18)" stroke="none" />}
      <circle cx={at[0]} cy={at[1]} r={r} fill={`url(#cc-swirl-${uid})`} opacity={open ? 0.95 : 0.7} />
      <circle cx={at[0]} cy={at[1]} r={r} fill="none" stroke={ring} strokeWidth={3} />
      <circle cx={at[0]} cy={at[1]} r={r * 0.62} fill="none" stroke="#fff" strokeWidth={1.6} strokeDasharray="4 5"
        className={reduce ? undefined : 'cc-spin'} style={{ transformOrigin: `${at[0]}px ${at[1]}px` }} data-deco="swirl" aria-hidden="true" />
      <circle cx={at[0]} cy={at[1]} r={3.6} fill="#0F172A" />
      <g style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>
        <text x={right ? at[0] + r + 3 : at[0] - r - 3} y={at[1] - r + 2} textAnchor={right ? 'start' : 'end'} fontSize={fs} fontWeight={800} fill="#0F172A" stroke="#fff" strokeWidth={3.4} paintOrder="stroke">
          {name}<tspan fontSize={fs - 2} fontWeight={700} fill="#334155">{coords}</tspan>
        </text>
      </g>
    </g>
  );
}

function Hero({ at, reduce, s = 1 }) {
  return (
    <g data-cc-hero style={{ transform: `translate(${at[0]}px, ${at[1]}px)`, transition: reduce ? undefined : 'transform 650ms cubic-bezier(.3,1.4,.5,1)' }}>
      <g transform={`scale(${s}) translate(-27 -24)`} data-deco="hero" aria-hidden="true">
        <ellipse cx="9" cy="29" rx="8" ry="2.5" fill="#0F172A" opacity="0.25" />
        <rect x="3" y="13" width="12" height="13" rx="4" fill="#2563EB" />
        <rect x="11" y="15" width="6" height="8" rx="2" fill="#F59E0B" />
        <circle cx="9" cy="9" r="6" fill="#FDBA74" />
        <path d="M2.5 7 Q9 -1 15.5 7 Z" fill="#DC2626" />
        <rect x="9" y="5.5" width="9" height="2.4" rx="1.2" fill="#DC2626" />
      </g>
    </g>
  );
}

function Scene({ lab, fr, uid, width, height, last, quad, tw }) {
  const reduce = useReducedMotion();
  const { win, px, py, u } = fr;
  const P = fr.P;
  const m = L.mission(lab);
  const pts = L.knownPoints(lab);
  const r = Math.max(9, Math.min(16, u * 0.3));
  const fs = Math.max(12.5, Math.min(16.5, u * 0.3));
  // sur une petite carte, les noms des flèches gêneraient les noms des portails : la ligne de lecture les porte
  const nm = (name) => (u >= 30 ? name : null);
  const label = (p) => { const [x, y] = L.xy(p); return `(${nl(x)} ; ${nl(y)})`; };

  // tuiles et axes
  const tiles = [];
  for (let x = win.xMin; x <= win.xMax; x += 1) tiles.push(<line key={`x${x}`} x1={px(x)} x2={px(x)} y1={py(win.yMin)} y2={py(win.yMax)} stroke="#FFFFFF" strokeWidth={1} opacity={0.75} />);
  for (let y = win.yMin; y <= win.yMax; y += 1) tiles.push(<line key={`y${y}`} x1={px(win.xMin)} x2={px(win.xMax)} y1={py(y)} y2={py(y)} stroke="#FFFFFF" strokeWidth={1} opacity={0.75} />);
  const checker = [];
  for (let x = win.xMin; x < win.xMax; x += 1) {
    for (let y = win.yMin; y < win.yMax; y += 1) {
      if ((x + y) % 2 === 0) checker.push(<rect key={`c${x};${y}`} x={px(x)} y={py(y + 1)} width={u} height={u} fill="#4ADE80" opacity={0.22} />);
    }
  }
  const every = u < 22 ? 2 : 1;
  const ticks = [];
  for (let x = win.xMin + 1; x < win.xMax; x += 1) if (x !== 0 && x % every === 0) ticks.push(<text key={`tx${x}`} x={px(x)} y={py(0) + 13} textAnchor="middle" fontSize={10} fill="#1E293B" fontWeight={700} stroke="#fff" strokeWidth={2.4} paintOrder="stroke">{nl(x)}</text>);
  for (let y = win.yMin + 1; y < win.yMax; y += 1) if (y !== 0 && y % every === 0) ticks.push(<text key={`ty${y}`} x={px(0) - 5} y={py(y) + 3.5} textAnchor="end" fontSize={10} fill="#1E293B" fontWeight={700} stroke="#fff" strokeWidth={2.4} paintOrder="stroke">{nl(y)}</text>);

  // les vecteurs déjà trouvés
  const solvedArrows = lab.missions.map((mm, i) => {
    if (!lab.solved[i] || i === lab.idx) return null;
    const kp = L.knownPoints(lab, i + 1);
    const [a, b] = mm.kind === 'calc' ? [mm.from, mm.to] : mm.vec;
    return <Arrow key={`s${i}`} from={P(kp[a])} to={P(kp[b])} color={C_OK} label={nm(`${a}${b}`)} width={2.6} data-cc-solved={i} />;
  });

  // la mission courante
  let current = null;
  let heroAt = null;
  if (m.kind === 'calc') {
    const from = P(pts[m.from]);
    heroAt = from;
    if (last) {
      const land = P(last.landing);
      heroAt = last.kind === 'ok' ? P(pts[m.to]) : land;
      const inside = last.landing[0] >= win.xMin && last.landing[0] <= win.xMax && last.landing[1] >= win.yMin && last.landing[1] <= win.yMax;
      const corner = P([last.landing[0], L.xy(pts[m.from])[1]]);
      current = last.kind === 'zero' ? null : (
        <g data-cc-jump={last.kind}>
          {/* le saut en deux pas (horizontal puis vertical) : les composantes */}
          <polyline points={`${from[0]},${from[1]} ${corner[0]},${corner[1]} ${land[0]},${land[1]}`} fill="none" stroke={last.kind === 'ok' ? C_OK : C_BAD} strokeWidth={1.6} strokeDasharray="3 4" opacity={0.8} />
          <Arrow from={from} to={land} color={last.kind === 'ok' ? C_OK : C_BAD} dashed={last.kind !== 'ok'} label={nm(last.kind === 'ok' ? `${m.from}${m.to}` : null)} />
          {last.kind !== 'ok' && inside && (
            <g data-cc-landing>
              <line x1={land[0] - 7} y1={land[1] - 7} x2={land[0] + 7} y2={land[1] + 7} stroke={C_BAD} strokeWidth={3} strokeLinecap="round" />
              <line x1={land[0] - 7} y1={land[1] + 7} x2={land[0] + 7} y2={land[1] - 7} stroke={C_BAD} strokeWidth={3} strokeLinecap="round" />
            </g>
          )}
        </g>
      );
    }
    if (tw) {
      const [a, b] = tw.names;
      const quadPts = [pts[a], pts[b], pts[m.to], pts[m.from]].map(P);
      current = (
        <g data-cc-twin data-equal={tw.equal ? 'true' : 'false'}>
          <polygon points={quadPts.map((p) => p.join(',')).join(' ')} fill={tw.equal ? 'rgba(5,150,105,0.16)' : 'rgba(100,116,139,0.10)'} stroke={tw.equal ? C_OK : '#64748B'} strokeWidth={1.6} strokeDasharray="6 4" />
          {current}
          <Arrow from={P(pts[a])} to={P(pts[b])} color={C_OK} label={nm(`${a}${b}`)} />
        </g>
      );
    }
  } else {
    const placed = { ...pts, [m.point]: lab.placed[m.point] };
    const [a, b] = m.vec;
    current = (
      <g>
        {quad && (
          <polygon points={quad.names.map((n) => P(placed[n]).join(',')).join(' ')} data-cc-quad data-shape={quad.shape}
            fill={quad.shape === 'para' ? 'rgba(5,150,105,0.18)' : quad.shape === 'crossed' ? 'rgba(225,29,72,0.16)' : 'rgba(100,116,139,0.08)'}
            stroke={quad.shape === 'para' ? C_OK : quad.shape === 'crossed' ? C_BAD : '#64748B'} strokeWidth={2} strokeDasharray={quad.shape === 'other' ? '6 4' : undefined} strokeLinejoin="round" />
        )}
        {m.refNamed && <Arrow from={P(pts[m.refNames[0]])} to={P(pts[m.refNames[1]])} color={C_REF} label={nm(m.refNames.join(''))} />}
        {!L.xy(placed[a]).every((v, i) => v === L.xy(placed[b])[i]) && (
          <Arrow from={P(placed[a])} to={P(placed[b])} color={quad?.shape === 'para' || (lab.solved[lab.idx]) ? C_OK : C_LIVE} label={nm(`${a}${b}`)} />
        )}
      </g>
    );
  }

  // les portails : ceux de la carte connus à cette mission (+ le point posé)
  const portals = Object.entries(pts).map(([n, p]) => {
    const isTarget = m.kind === 'calc' && n === m.to;
    const open = isTarget && lab.solved[lab.idx];
    return <Portal key={n} at={P(p)} r={r} open={open} target={isTarget} uid={uid} name={n} coords={label(p)} reduce={reduce} fs={fs} width={width} />;
  });
  const placing = m.kind === 'place'
    ? <Portal key="placing" at={P(lab.placed[m.point])} r={r} open={lab.solved[lab.idx]} uid={uid} name={m.point} coords={label(lab.placed[m.point])} reduce={reduce} tone={lab.solved[lab.idx] ? 'violet' : 'amber'} fs={fs} width={width} />
    : null;

  const island = { x: px(win.xMin) - u * 0.35, y: py(win.yMax) - u * 0.35, w: (win.xMax - win.xMin) * u + u * 0.7, h: (win.yMax - win.yMin) * u + u * 0.7 };
  return (
    <svg width={width} height={height} className="absolute inset-0" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
      <defs>
        <radialGradient id={`cc-swirl-${uid}`}>
          <stop offset="0%" stopColor="#F5D0FE" />
          <stop offset="60%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
        <linearGradient id={`cc-sea-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>
      <style>{'.cc-spin{animation:cc-rot 4s linear infinite}@keyframes cc-rot{to{transform:rotate(360deg)}}@media (prefers-reduced-motion: reduce){.cc-spin{animation:none}}'}</style>
      <g data-deco="island" aria-hidden="true">
        <rect x={0} y={0} width={width} height={height} fill={`url(#cc-sea-${uid})`} />
        <rect x={island.x} y={island.y} width={island.w} height={island.h} rx={u * 0.6} fill="#FDE68A" />
        <rect x={island.x + 5} y={island.y + 5} width={island.w - 10} height={island.h - 10} rx={u * 0.5} fill="#86EFAC" />
        <Palm x={island.x + 14} y={island.y + island.h - 8} s={Math.min(1.2, u / 34)} />
        <Palm x={island.x + island.w - 18} y={island.y + island.h - 10} s={Math.min(1.1, u / 36)} />
        <g transform={`translate(${island.x + island.w - 16} ${island.y + 34}) scale(${Math.min(1, u / 34)})`} opacity={0.6}>
          <rect x="-5" y="-26" width="10" height="26" fill="#F8FAFC" stroke="#64748B" />
          <rect x="-5" y="-20" width="10" height="5" fill="#DC2626" />
          <path d="M-7 -26 L0 -33 L7 -26 Z" fill="#DC2626" />
        </g>
        <g transform={`translate(${island.x + 16} ${island.y + 22}) scale(${Math.min(1, u / 34)})`} opacity={0.55}>
          <rect x="-8" y="-8" width="16" height="12" fill="#F8FAFC" stroke="#94A3B8" />
          <path d="M-6 -8 Q0 -16 6 -8" fill="#22C55E" />
        </g>
      </g>
      <g data-deco="tiles" aria-hidden="true">{checker}</g>
      <g opacity={0.9}>{tiles}</g>
      {/* le repère : axes, O, graduations */}
      <g data-cc-axes>
        <line x1={px(win.xMin)} x2={px(win.xMax)} y1={py(0)} y2={py(0)} stroke="#1E293B" strokeWidth={1.8} />
        <polygon points={`${px(win.xMax) + 2},${py(0)} ${px(win.xMax) - 7},${py(0) - 4.5} ${px(win.xMax) - 7},${py(0) + 4.5}`} fill="#1E293B" />
        <line x1={px(0)} x2={px(0)} y1={py(win.yMin)} y2={py(win.yMax)} stroke="#1E293B" strokeWidth={1.8} />
        <polygon points={`${px(0)},${py(win.yMax) - 2} ${px(0) - 4.5},${py(win.yMax) + 7} ${px(0) + 4.5},${py(win.yMax) + 7}`} fill="#1E293B" />
        <text x={px(0) - 5} y={py(0) + 13} textAnchor="end" fontSize={11} fontWeight={800} fill="#1E293B" stroke="#fff" strokeWidth={2.4} paintOrder="stroke">O</text>
        {ticks}
      </g>
      {solvedArrows}
      {current}
      {portals}
      {placing}
      {heroAt && <Hero at={heroAt} reduce={reduce} s={Math.max(0.85, Math.min(1.6, u / 30))} />}
    </svg>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de la mission i : un code calculé → les deux composantes ; une porte tenue → l'équation puis les coordonnées ; la dernière finit par la règle. */
export function chainOf(lab, i) {
  const m = lab.missions[i];
  const q = m.kind === 'calc' ? ['calcX', 'calcBack'] : ['placeEq', 'placeVal'];
  if (m.kind === 'calc' && L.twin(lab, i)?.equal) q.push('twin');
  if (i === lab.missions.length - 1) q.push('rule');
  return q;
}

const compOf = (v) => (v[0] !== 0 ? 0 : 1);

/** Chaque question est construite sur LES nombres de la mission (rien n'est écrit en dur) ; `k` : les textes de `componentCalc`. */
export const QUESTIONS = {
  calcX: (lab, i, k) => {
    const m = lab.missions[i]; const pts = L.knownPoints(lab, i);
    const [ax] = L.xy(pts[m.from]); const [bx] = L.xy(pts[m.to]);
    const o = { v: $(arrow(`${m.from}${m.to}`)), from: m.from, to: m.to };
    const sub = (a, b, p, q) => `x_{${p}} - x_{${q}} = ${tex(a)} - ${par(b)}`;
    return {
      id: 'calcX', kind: 'choice',
      prompt: Mx(k, 'calcX.prompt', o),
      options: [
        { text: <MathText>{$(sub(bx, ax, m.to, m.from))}</MathText>, correct: true },
        { text: <MathText>{$(sub(ax, bx, m.from, m.to))}</MathText>, why: Mx(k, 'calcX.whyReverse', { ...o, r: $(tex(ax - bx)) }) },
        { text: <MathText>{$(`x_{${m.to}} + x_{${m.from}} = ${tex(bx)} + ${par(ax)}`)}</MathText>, why: Mx(k, 'calcX.whySum', { ...o, s: $(tex(bx + ax)) }) },
      ],
      hints: [Mx(k, 'calcX.hint1', o), Mx(k, 'calcX.hint2', o)],
      explain: Mx(k, 'calcX.explain', { ...o, calc: $(`${sub(bx, ax, m.to, m.from)} = ${tex(bx - ax)}`) }),
    };
  },
  calcBack: (lab, i, k) => {
    const m = lab.missions[i];
    const [ux, uy] = L.xy(L.calcTarget(lab, i));
    const back = [-ux, -uy];
    const o = { from: m.from, to: m.to, v: $(arrow(`${m.from}${m.to}`)), w: $(arrow(`${m.to}${m.from}`)), u: $(col([ux, uy])), r: $(col(back)) };
    const cands = [{ a: [ux, uy], why: 'whySame' }, { a: [uy, ux], why: 'whySwap' }, { a: [-uy, -ux], why: 'whySwapBack' }, { a: [-ux + 1, -uy], why: 'whyOff' }];
    const seen = new Set([back.join(';')]); const ds = [];
    for (const c of cands) { const key = c.a.join(';'); if (ds.length < 2 && !seen.has(key)) { seen.add(key); ds.push(c); } }
    return {
      id: 'calcBack', kind: 'choice',
      prompt: Mx(k, 'calcBack.prompt', o),
      options: [
        { text: <MathText>{$(col(back))}</MathText>, correct: true },
        ...ds.map((d) => ({ text: <MathText>{$(col(d.a))}</MathText>, why: Mx(k, `calcBack.${d.why}`, { ...o, n: $(col(d.a)) }) })),
      ],
      hints: [Mx(k, 'calcBack.hint1', o), Mx(k, 'calcBack.hint2', o)],
      explain: Mx(k, 'calcBack.explain', o),
    };
  },
  twin: (lab, i, k) => {
    const m = lab.missions[i]; const tw = L.twin(lab, i);
    const u = L.xy(L.calcTarget(lab, i));
    const o = { v: $(arrow(`${m.from}${m.to}`)), w: $(arrow(tw.names.join(''))), code: $(col(u)) };
    return {
      id: 'twin', kind: 'choice',
      prompt: Mx(k, 'twin.prompt', o),
      options: [
        { text: Mx(k, 'twin.same', o), correct: true },
        { text: Mx(k, 'twin.origin'), why: Mx(k, 'twin.whyOrigin') },
        { text: Mx(k, 'twin.end'), why: Mx(k, 'twin.whyEnd') },
      ],
      hints: [Mx(k, 'twin.hint1'), Mx(k, 'twin.hint2', o)],
      explain: Mx(k, 'twin.explain', o),
    };
  },
  placeEq: (lab, i, k) => {
    const m = lab.missions[i]; const r = L.xy(m.ref);
    const c = compOf(r); const ax = c === 0 ? 'x' : 'y';
    const [p, q] = m.vec;
    const eq = m.refNamed ? $(`${arrow(`${p}${q}`)} = ${arrow(m.refNames.join(''))}`) : $(`${arrow(`${p}${q}`)}${col(r)}`);
    const o = { p: m.point, v: $(arrow(`${p}${q}`)), rev: $(arrow(`${q}${p}`)), eq, comp: k(c === 0 ? 'cp.placeEq.compX' : 'cp.placeEq.compY') };
    const form = (a, b) => `${ax}_{${a}} - ${ax}_{${b}} = ${tex(r[c])}`;
    return {
      id: 'placeEq', kind: 'choice',
      prompt: Mx(k, 'placeEq.prompt', o),
      options: [
        { text: <MathText>{$(form(q, p))}</MathText>, correct: true },
        { text: <MathText>{$(form(p, q))}</MathText>, why: Mx(k, 'placeEq.whyOrder', o) },
        { text: <MathText>{$(`${ax}_{${p}} + ${ax}_{${q}} = ${tex(r[c])}`)}</MathText>, why: Mx(k, 'placeEq.whySum', o) },
      ],
      hints: [Mx(k, 'placeEq.hint1'), Mx(k, 'placeEq.hint2', o)],
      explain: Mx(k, 'placeEq.explain', { ...o, calc: $(form(q, p)) }),
    };
  },
  placeVal: (lab, i, k) => {
    const m = lab.missions[i]; const r = L.xy(m.ref);
    const t = L.xy(m.target); const tr = L.xy(m.trap);
    const [p, q] = m.vec;
    const pt = (a) => $(`${m.point}(${tex(a[0])}\\,;\\,${tex(a[1])})`);
    const o = { p: m.point, v: $(arrow(`${p}${q}`)), rev: $(arrow(`${q}${p}`)), q: m.other };
    const cands = [{ a: tr, why: 'whyTrap' }, { a: [t[1], t[0]], why: 'whySwap' }, { a: r, why: 'whyComps' }, { a: [t[0] + 1, t[1] - 1], why: 'whyOff' }];
    const seen = new Set([t.join(';')]); const ds = [];
    for (const c of cands) { const key = c.a.join(';'); if (ds.length < 2 && !seen.has(key)) { seen.add(key); ds.push(c); } }
    return {
      id: 'placeVal', kind: 'choice',
      prompt: Mx(k, 'placeVal.prompt', o),
      options: [
        { text: <MathText>{pt(t)}</MathText>, correct: true },
        ...ds.map((d) => ({ text: <MathText>{pt(d.a)}</MathText>, why: Mx(k, `placeVal.${d.why}`, { ...o, pt: pt(d.a) }) })),
      ],
      hints: [Mx(k, 'placeVal.hint1'), Mx(k, 'placeVal.hint2', o)],
      explain: Mx(k, 'placeVal.explain', { ...o, pt: pt(t) }),
    };
  },
  rule: (lab, i, k) => ({
    id: 'rule', kind: 'choice',
    prompt: <MathText>{k('dPrompt')}</MathText>,
    options: discoveryOptionsOf(lab, k),
    hints: [Mx(k, 'rule.hint1'), Mx(k, 'rule.hint2')],
    explain: <ol className="list-decimal space-y-1 ps-5 text-sm" data-cc-formal>{['formal1', 'formal2', 'formal3'].map((f) => <li key={f}><MathText>{k(f)}</MathText></li>)}</ol>,
  }),
};
