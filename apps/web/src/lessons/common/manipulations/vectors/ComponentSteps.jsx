import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import MathText from '../../components/MathText';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { Mx, distractors, useTick } from './vecCp';
import * as L from '../logic/componentSteps';

/**
 * component-steps — L'APPLI DE LIVRAISON (unité 12 « الأشعة في معلم », درس « قراءة مركبتي شعاع وتمثيلهما في معلم »,
 * نشاط 1 p. 140).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève CONDUIT un livreur à scooter dans les rues d'un quartier quadrillé (le معلم) : pas à pas (glisser la
 *    dragée le long des rues, toucher un nœud de la même rue, la croix ← → ↑ ↓, ou les flèches du clavier) ; il RÈGLE
 *    les deux molettes d'un code de trajet (−/+, flèches) que le pilote automatique suit ; il POSE la destination d'un
 *    code donné (glisser le pin, toucher un nœud, flèches + الإدخال).
 * B. Idée : un vecteur se LIT comme deux déplacements — horizontal (parallèle à (OI)) puis vertical (parallèle à
 *    (OJ)), chacun avec son signe (→ +, ← −, ↑ +, ↓ −) : ce sont ses مركبتان, écrites en colonne ; elles ne
 *    dépendent pas du point de départ ; depuis l'origine O, elles sont les إحداثيات de l'arrivée.
 * C. Chaque pas fait monter ou descendre un compteur ; le trajet laisse sa trace (l'escalier) ; un code envoyé
 *    dessine son escalier depuis le départ et le scooter s'arrête là où le code mène — chez le client ou ailleurs.
 * D. La colonne $\overrightarrow{AB}\begin{pmatrix} x \\ y \end{pmatrix}$ dans le téléphone, les étiquettes « +3 », « −2 » sur les jambes de
 *    l'escalier, puis la règle « مركبتا $\overrightarrow{OM}$ هما إحداثيتا M ».
 * E. À découvrir avant la règle : deux départs différents, le même code ; à gauche ou en bas, un nombre NÉGATIF ;
 *    l'adresse du client n'est le code que depuis O ; l'ordre (horizontal d'abord) compte.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        les مركبتان d'un vecteur dans un معلم متعامد ومتجانس ; OM ↔ M(x ; y) ; représenter un vecteur
 *   OBJECT         le scooter d'une appli de livraison dans un quartier d'Alger, ses compteurs, son code de trajet
 *   VARIABLE       la position du scooter (pas signés), les deux nombres du code, la position du pin
 *   INVARIANT      le code d'un trajet ne dépend ni du chemin dans les rues ni du point de départ : seulement du
 *                  déplacement (from → to) ; deux commandes de même flèche ont le même code
 *   TRANSFORMATION chaque pas : un compteur ±1 ; chaque code : un escalier et un point d'arrivée
 *   CONSTRAINT     on roule dans les rues (un seul axe par pas) ; une commande n'est livrée que si le code mène
 *                  EXACTEMENT chez le client (`vectors.vec / translate / vecEq`)
 *   RESISTANCE     le scooter du code faux s'arrête DEVANT UNE AUTRE PORTE, l'escalier en rose, et le téléphone dit
 *                  pourquoi : signe oublié (ISHARA), nombres échangés (TABDIL-X-Y), l'adresse au lieu du trajet
 *                  (IHDATHIYAT-MURAKKIBAT), trajet à l'envers
 *   EVIDENCE       les commandes livrées, leurs escaliers et leurs colonnes ; (3 ; 2) deux fois, (−2 ; −3), (−3 ; 2) = M
 *   CONTRAST       deux restaurants, une même flèche → un même code ; un trajet vers le bas-gauche ; le dépôt O contre
 *                  un autre départ ; puis le geste inverse (le code donné, la destination à poser)
 *   PREDICTION     dès la commande 2, le code est écrit AVANT le départ ; متقدم : sans compteurs, même pour A → B
 *   DISCOVERY      « رقما الكود هما الإزاحة الأفقية ثم العمودية بإشارتيهما » ; « من O: الكود = الإحداثيتان »
 *   FORMALIZATION  نشاط 1 (3) et (5), معارف 1 et 3 أ (p. 142) : $\overrightarrow{AB}\begin{pmatrix} 8 \\ -2 \end{pmatrix}$ , $\overrightarrow{OM}\begin{pmatrix} x \\ y \end{pmatrix}$
 *   TRANSFER       طرائق p. 143 (تمثيل شعاع علمت مركبتاه), ex-1 à 5, la banque ; le درس suivant (x_B − x_A)
 *
 * Toutes les vérités viennent de `vectors.js` (logic/componentSteps.js) ; le dessin est en flottants mais rien n'est
 * livré sans égalité exacte. Manuel (§6bis) : chaque pas et chaque code est un essai — aucune auto-complétion.
 *
 * DÉCOR (exigence du propriétaire) : le quartier vu d'en haut (toits blancs d'Alger, paraboles, palmiers, un dôme),
 * les deux boulevards du معلم, le dépôt de l'appli en O, le klaxon du téléphone (le scooter sursaute, « بيب! »), les
 * étoiles de la note après chaque livraison. `aria-hidden`, hors clavier (`tabIndex=-1`), `[data-deco]`, jamais une
 * information ; immobile sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (§8bis) : le bloc `[data-cs-glance]` = le quartier + le téléphone (onglets, colonne/molettes, croix
 * de conduite ou bouton d'envoi, verdict). Le téléphone se place À CÔTÉ du quartier dès 600 px de large, sinon
 * dessous ; la hauteur du quartier est bornée par l'écran de leçon (`useLessonViewport`) moins ce que le bloc mesure
 * en plus. La liste des essais est dans un `LabFold` hors du bloc mesuré.
 *
 * Props : `grid` [xMin, xMax, yMin, yMax], `points` { A: [x, y] … } (O = l'origine), `orders` [{ id, kind:
 * 'walk' | 'walkCode' | 'code' | 'pin', from, to, u?, hidden? }], `live` (compteurs en direct), `theme` (`delivery`),
 * `title`, `lead`, `mission`, `level`, `levels`, `onTrial(evidence)` à chaque essai jugé, `onFinished(summary)` à la
 * règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-component-steps][data-order][data-kind][data-solved], [data-cs-glance], [data-cs-scene],
 * [data-cs-rider], [data-cs-pin], [data-cs-place=<name>], [data-cs-trail], [data-cs-autopilot][data-ok],
 * [data-cs-arrow=<orderId>], [data-cs-tab=<id>][data-done], [data-cs-column][data-live], [data-cs-count=x|y],
 * [data-cs-dial=x|y], [data-cs-step=left|right|up|down], [data-cs-send], [data-cs-verdict=<reason>],
 * [data-lab-fold=component-steps.trials], [data-deco].
 */
const VEC = (s) => `\\overrightarrow{${s}}`;
const col = (v) => `\\begin{pmatrix} ${v[0]} \\\\ ${v[1]} \\end{pmatrix}`;
const coordTex = (n, p) => `${n}(${p[0]}\\,;\\,${p[1]})`;
const signed = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');
const BRAND = '#F97316';
/** La découverte : des distracteurs réfutés par les commandes de l'élève (aussi la dernière question de la suite). */
export function discoveryOptionsOf(tale, k) {
  const act1 = tale === 'act1';
  return (tale === 'draw' ? [
    { text: <MathText>{k('dDrawOrigin')}</MathText>, why: <MathText>{k('dDrawOriginWhy')}</MathText> },
    { text: <MathText>{k('dDrawRight')}</MathText>, correct: true },
    { text: <MathText>{k('dDrawCoords')}</MathText>, why: <MathText>{k('dDrawCoordsWhy')}</MathText> },
    { text: <MathText>{k('dDrawOne')}</MathText>, why: <MathText>{k('dDrawOneWhy')}</MathText> },
  ] : act1 ? [
    { text: <MathText>{k('dAct1Count')}</MathText>, why: <MathText>{k('dAct1CountWhy')}</MathText> },
    { text: <MathText>{k('dAct1Right')}</MathText>, correct: true },
    { text: <MathText>{k('dAct1Coords')}</MathText>, why: <MathText>{k('dAct1CoordsWhy')}</MathText> },
    { text: <MathText>{k('dAct1Order')}</MathText>, why: <MathText>{k('dAct1OrderWhy')}</MathText> },
  ] : [
    { text: <MathText>{k('dCityAddress')}</MathText>, why: <MathText>{k('dCityAddressWhy')}</MathText> },
    { text: <MathText>{k('dCityRight')}</MathText>, correct: true },
    { text: <MathText>{k('dCityCount')}</MathText>, why: <MathText>{k('dCityCountWhy')}</MathText> },
    { text: <MathText>{k('dCityStart')}</MathText>, why: <MathText>{k('dCityStartWhy')}</MathText> },
  ]);
}

const STEPS = { left: [-1, 0], right: [1, 0], up: [0, 1], down: [0, -1] };

export default function ComponentSteps({
  grid, points, orders, live = true, story, theme = 'delivery', title, lead, mission, level, levels: withLevels = true,
  checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.componentSteps.${key}`, o), [t]);
  const reduce = useReducedMotion();
  const state = useManipulation({
    type: 'component-steps', initialNumbers: { grid, points, orders, live, ...(story ? { story } : {}) }, initialMode, initialLevel: level, withLevels, hintCount: 3,
  });
  const nums = state.numbers;
  const make = () => L.init(nums);
  const [lab, setLab] = useState(make);
  const sceneKey = `${JSON.stringify(nums)}|${state.epoch}`;
  const [seen, setSeen] = useState({ key: sceneKey, inits: 0 });
  const [doneIds, setDoneIds] = useState([]);   // les commandes dont la suite de questions est finie
  const [drag, setDrag] = useState(null); // { what: 'rider' | 'pin', cursor }
  const [honk, setHonk] = useState(0);
  const [stars, setStars] = useState(0);
  if (seen.key !== sceneKey) { setSeen({ key: sceneKey, inits: seen.inits + 1 }); setLab(make()); setDrag(null); setDoneIds([]); }   // « إعادة » : tout repart
  const o = L.order(lab);
  const s = L.stateOf(lab);
  // trois histoires : le quartier (مبتدئ), le نشاط 1 (متقدم), et دوري الآن 1 posé seul (représenter des vecteurs donnés)
  const tale = lab.story ?? (lab.live ? 'city' : 'act1');
  const act1 = tale === 'act1';

  /* ── pédagogie : découverte, règle, essais ── */
  /* ── les questions PENDANT le labo (primitives/LabCheckpoint) : après chaque commande livrée, une suite sur ce que l'élève vient de faire ;
     celle de la dernière commande finit par la règle et remplace la découverte automatique. L'enseignant seul peut les couper. ── */
  const cpSettings = useLabCheckpointSettings('component-steps');
  const cpEnabled = cpOn && cpSettings.enabled;
  const pendingIdx = cpEnabled ? lab.orders.findIndex((_, i) => lab.states[i].done && !doneIds.includes(`o${i}`)) : -1;
  const chain = pendingIdx >= 0 ? chainOf(lab, pendingIdx) : null;
  const cp = useLabCheckpoint({
    id: chain ? `o${pendingIdx}` : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, pendingIdx, k)) : null,
    reached: pendingIdx >= 0,
    resetKey: seen.inits,
    onRetry: () => { celebrated.current.delete(pendingIdx); setLab((x) => L.retryOrder(x, pendingIdx)); },
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setDoneIds((d) => (d.includes(id) ? d : [...d, id]));
      if (chainOf(lab, Number(id.slice(1))).includes('rule')) { state.discover(); state.formalize(); }
    },
  });
  const solvedAll = L.discoveryReady(lab);
  const ready = solvedAll && !cpEnabled;
  const tick = useTick();
  const stepDone = lab.orders.map((_, i) => lab.states[i].done && (!cpEnabled || doneIds.includes(`o${i}`)));
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // « إعادة » : on refête
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.has(i)) return;
      celebrated.current.add(i);
      party.celebrate({ n: stepDone.filter(Boolean).length, total: lab.orders.length });
    });
  }, [stepDone.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, L.summaryOf(lab)); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => { if (nTrials > 0) state.report(onTrial, L.evidenceOf(lab)); }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps
  const nDone = lab.states.filter((x) => x.done).length;
  const prevDone = useRef(nDone);
  useEffect(() => { if (nDone > prevDone.current) { setStars((n) => n + 1); playSfx('flag'); } prevDone.current = nDone; }, [nDone]);
  // le son : « over » quand le code ou le pin est refusé (la livraison réussie sonne dans l'effet ci-dessus)
  useEffect(() => { const tr = lab.trials[nTrials - 1]; if (tr && !tr.ok) playSfx('over'); }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : largeur du bloc, écran de leçon, surcoût du bloc « glance » au-delà du quartier ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const sceneRef = useRef(null);
  const sceneHRef = useRef(240);
  const [width, setWidth] = useState(340);
  const [overhead, setOverhead] = useState(230);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      // un niveau caché (display: none) mesure 0 : on garde la dernière largeur connue
      if (el.clientWidth > 0) setWidth(Math.max(150, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(0, Math.ceil(glanceRef.current.getBoundingClientRect().height) - sceneHRef.current));
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
  const narrow = width < 400;
  const side = width >= 600;
  const panelW = width >= 900 ? 270 : 236;
  const maxW = side ? width - panelW - 10 : width;
  const pad = narrow ? 18 : 24;
  const cap = width >= 700 ? 58 : 46;
  const avail = Math.max(170, Math.min(side ? screenH - 40 : screenH - overhead - 28, 640));
  const natural = L.naturalHeight(lab, maxW, { pad, cap });
  const sceneH = Math.round(Math.max(160, Math.min(natural, avail)));
  const [x0, x1, y0, y1] = lab.grid;
  const cellFit = Math.min((maxW - 2 * pad) / (x1 - x0), (sceneH - 2 * pad) / (y1 - y0), cap);
  const sceneW = Math.round(Math.min(maxW, cellFit * (x1 - x0) + 2 * pad));
  sceneHRef.current = sceneH;
  const geo = L.layout(lab, { width: sceneW, height: sceneH, pad });

  /* ── les gestes ── */
  const toNode = (cx, cy) => {
    const box = sceneRef.current?.getBoundingClientRect();
    if (!box) return [0, 0];
    const [x, y] = geo.fromPx(cx - box.left, cy - box.top);
    return L.nodeNear(lab, x, y);
  };
  const walking = (o.kind === 'walk' || o.kind === 'walkCode') && !s.done && !s.arrived;
  const pinning = o.kind === 'pin' && !s.done;
  const editing = !s.done && (o.kind === 'code' || (o.kind === 'walkCode' && s.arrived));
  const doStep = (name) => { tick(name === 'left' || name === 'down' ? 0.75 : 1); setLab((x) => L.step(x, ...STEPS[name])); };
  const ptr = useRef(null);
  const onHandleDown = (what) => (e) => {
    if (e.button > 0) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    ptr.current = { what, sx: e.clientX, sy: e.clientY, moved: false };
  };
  const onHandleMove = (e) => {
    const d = ptr.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return;
    d.moved = true;
    const node = toNode(e.clientX, e.clientY);
    if (d.what === 'rider') { tick(); setLab((x) => L.walkTo(x, node)); }
    else setDrag({ what: 'pin', cursor: node });
  };
  const onHandleUp = (e) => {
    const d = ptr.current;
    ptr.current = null;
    if (!d) return;
    e.stopPropagation();
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (d.what === 'pin' && d.moved) { setDrag(null); setLab((x) => L.dropPin(x, toNode(e.clientX, e.clientY))); }
  };
  const onSceneUp = (e) => {
    if (ptr.current) return;
    const node = toNode(e.clientX, e.clientY);
    if (walking) setLab((x) => L.rideTo(x, node));
    else if (pinning) setLab((x) => L.dropPin(x, node));
  };
  const onRiderKey = (e) => {
    const m = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }[e.key];
    if (m) { e.preventDefault(); doStep(m); }
  };
  const onPinKey = (e) => {
    const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (m) { e.preventDefault(); tick(m[0] + m[1] < 0 ? 0.75 : 1); setLab((x) => L.movePin(x, ...m)); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLab((x) => L.dropPin(x)); }
  };
  const onDialKey = (axis) => (e) => {
    const d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 5, PageDown: -5 }[e.key];
    if (d) { e.preventDefault(); tick(d < 0 ? 0.75 : 1); setLab((x) => L.bumpCode(x, axis, d)); return; }
    if (e.key === 'Enter') { e.preventDefault(); setLab((x) => L.sendCode(x)); }
  };

  /* ── les lectures ── */
  const fromName = o.from; const toName = o.to;
  const vecName = `${fromName}${toName}`;
  const count = L.counters(lab);
  const showCount = lab.live || s.done;
  const column = (() => {
    if (o.kind === 'pin') return o.u;
    if (o.kind === 'walk') return count;
    if (s.done) return L.expectedOf(lab, o);
    return s.code;
  })();
  const addr = L.at(lab, toName);
  const last = lab.last && lab.last.order === o.id ? lab.last : null;
  const verdict = (() => {
    if (!last) return null;
    const tx = { from: fromName, to: toName };
    if (['edge', 'street', 'notArrived'].includes(last.kind)) return { tone: 'info', text: k(`v_${last.kind}`, tx) };
    if (last.kind === 'arrivedCode') return { tone: 'info', text: k('waitArrived', tx) };
    const o2 = { ...tx, GOT: col(last.v), WANT: col(last.u), V: VEC(vecName), U: '\\vec{u}', ADDR: coordTex(toName, addr) };
    if (last.ok) return { tone: 'ok', text: k(o.kind === 'pin' ? 'v_pinEqual' : o.kind === 'walk' ? 'v_walkEqual' : 'v_equal', o2) };
    const key = last.reason === 'coords' && o.kind === 'pin' ? 'v_coordsPin' : `v_${last.reason}`;
    return { tone: 'ko', text: k(key, o2) };
  })();
  const waiting = (() => {
    const tx = { from: fromName, to: toName, ADDR: coordTex(toName, addr), U: `\\vec{u}${col(o.u ?? [0, 0])}` };
    if (s.done) return k('waitDone', tx);
    if (o.kind === 'walk') return k('waitWalk', tx);
    if (o.kind === 'walkCode') return s.arrived ? k('waitArrived', tx) : k('waitWalkCode', tx);
    // la maison est « hors figure » tant que la commande qui la cache n'est pas livrée (le D du نشاط 1) : on donne son adresse
    const toHidden = lab.orders.some((x, i) => x.hidden && !lab.states[i].done && x.to === o.to);
    if (o.kind === 'code') return toHidden ? k('waitCodeHidden', tx) : k('waitCode', tx);
    return k('waitPin', tx);
  })();

  const discoveryOptions = useMemo(() => discoveryOptionsOf(tale, k), [tale, k]);
  const formal = (
    <div className="space-y-2" data-cs-formal>
      <div className="grid gap-1.5 grid-cols-2">
        {lab.orders.map((x) => {
          const u = L.expectedOf(lab, x);
          const nm = `${x.from}${x.to}`;
          const extra = x.from === 'O' ? ` \\quad ${coordTex(x.to, L.at(lab, x.to))}` : '';
          return <EquationDisplay key={x.id} tone="result" size="sm" tex={`${VEC(nm)}${col(u)}${extra}`} />;
        })}
      </div>
      <p className="text-sm text-emerald-900"><MathText>{k(tale === 'draw' ? 'fDraw' : act1 ? 'fAct1' : 'fCity')}</MathText></p>
    </div>
  );

  /* ── le téléphone : onglets, colonne / molettes, croix ou envoi, verdict ── */
  const btn = 'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 disabled:opacity-35';
  const dial = (axis) => (
    <div className="flex items-center gap-1" data-cs-dial-row={axis ? 'y' : 'x'}>
      <button type="button" className={`${btn} bg-slate-700 text-lg text-white`} aria-label={k(axis ? 'minusY' : 'minusX')} onClick={() => { tick(0.75); setLab((x) => L.bumpCode(x, axis, -1)); }} data-cs-minus={axis ? 'y' : 'x'}>−</button>
      <span role="spinbutton" tabIndex={0} aria-label={k(axis ? 'rowY' : 'rowX')} aria-valuenow={column[axis]} aria-valuemin={-L.CODE_LIMIT} aria-valuemax={L.CODE_LIMIT}
        onKeyDown={onDialKey(axis)} data-cs-dial={axis ? 'y' : 'x'} dir="ltr"
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white font-mono text-lg font-black text-slate-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300">
        {signed(column[axis]).replace('+', '')}
      </span>
      <button type="button" className={`${btn} bg-slate-700 text-lg text-white`} aria-label={k(axis ? 'plusY' : 'plusX')} onClick={() => { tick(); setLab((x) => L.bumpCode(x, axis, 1)); }} data-cs-plus={axis ? 'y' : 'x'}>+</button>
    </div>
  );
  const countCell = (axis) => {
    const v = column[axis];
    const hidden = (o.kind === 'walkCode' && !s.done) || (o.kind === 'walk' && !showCount);
    return (
      <span dir="ltr" data-cs-count={axis ? 'y' : 'x'} className={`inline-flex h-11 min-w-[2.75rem] text-xl items-center justify-center rounded-lg px-1 font-mono font-black ${hidden ? 'bg-slate-800 text-slate-400' : v < 0 ? 'bg-rose-100 text-rose-800' : v > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-slate-800'}`}>
        {hidden ? '؟' : signed(v)}
      </span>
    );
  };
  const columnBlock = (
    <div className="flex items-center gap-1.5" dir="ltr" data-cs-column data-live={lab.live ? 'true' : 'false'} aria-live="polite">
      <span className="text-base text-orange-200"><MathText>{`$${o.kind === 'pin' ? '\\vec{u}' : VEC(vecName)}$`}</MathText></span>
      <span aria-hidden="true" className="self-stretch rounded-s-full border-y-2 border-s-2 border-orange-300" style={{ width: 9 }} />
      <div className="flex flex-col gap-1">{editing ? <>{dial(0)}{dial(1)}</> : <>{countCell(0)}{countCell(1)}</>}</div>
      <span aria-hidden="true" className="self-stretch rounded-e-full border-y-2 border-e-2 border-orange-300" style={{ width: 9 }} />
    </div>
  );
  const pad3 = (
    <div className="grid grid-cols-3 gap-1" dir="ltr" role="group" aria-label={k(pinning ? 'padPin' : 'padRide')} data-cs-pad>
      <button type="button" className={`${btn} bg-slate-800 text-sm text-slate-200`} aria-label={k('restart')} onClick={() => setLab((x) => L.restartOrder(x))} disabled={!walking} data-cs-restart>↺</button>
      <button type="button" className={`${btn} bg-orange-500 text-lg text-white`} aria-label={k(pinning ? 'pinUp' : 'up')} onClick={() => (pinning ? setLab((x) => L.movePin(x, 0, 1)) : doStep('up'))} data-cs-step="up">↑</button>
      {pinning
        ? <button type="button" className={`${btn} bg-emerald-500 text-sm text-white`} aria-label={k('confirmPin')} onClick={() => setLab((x) => L.dropPin(x))} data-cs-send>✓</button>
        : <span />}
      <button type="button" className={`${btn} bg-orange-500 text-lg text-white`} aria-label={k(pinning ? 'pinLeft' : 'left')} onClick={() => (pinning ? setLab((x) => L.movePin(x, -1, 0)) : doStep('left'))} data-cs-step="left">←</button>
      <button type="button" className={`${btn} bg-orange-500 text-lg text-white`} aria-label={k(pinning ? 'pinDown' : 'down')} onClick={() => (pinning ? setLab((x) => L.movePin(x, 0, -1)) : doStep('down'))} data-cs-step="down">↓</button>
      <button type="button" className={`${btn} bg-orange-500 text-lg text-white`} aria-label={k(pinning ? 'pinRight' : 'right')} onClick={() => (pinning ? setLab((x) => L.movePin(x, 1, 0)) : doStep('right'))} data-cs-step="right">→</button>
    </div>
  );
  const sendBtn = (
    <button type="button" onClick={() => setLab((x) => L.sendCode(x))} data-cs-send
      className={`${btn} gap-1 bg-emerald-500 px-3 text-sm text-white`}>
      <span aria-hidden="true">🛵</span>{k('send')}
    </button>
  );
  const nextBtn = s.done && !L.allDone(lab) && !cp.blocking ? (
    <button type="button" onClick={() => setLab((x) => L.goTo(x, L.nextOpen(x)))} data-cs-next className={`${btn} bg-orange-500 px-3 text-sm text-white`}>{k('next')}</button>
  ) : null;

  const panel = (
    <div className={`flex min-w-0 flex-col gap-1.5 rounded-[1.4rem] bg-slate-900 text-slate-100 border-4 p-2 border-slate-800 ${side ? '' : 'w-full'}`}
      style={side ? { width: panelW } : undefined} data-cs-panel>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[11px] font-black text-white">{k('appName')}</span>
          <Stars n={stars} reduce={reduce} />
          <Horn label={k('horn')} onTap={() => setHonk((n) => n + 1)} />
        </div>
      <div className="grid grid-cols-5 gap-1" role="group" aria-label={k('tabsLabel')} data-cs-tabs>
        {lab.orders.map((x, i) => {
          const done = L.orderDone(lab, i);
          return (
            <button key={x.id} type="button" onClick={() => { setDrag(null); setLab((st) => L.goTo(st, i)); }}
              aria-pressed={i === lab.t} data-cs-tab={x.id} data-done={done ? 'true' : 'false'}
              aria-label={k('tabAria', { n: i + 1, from: x.from, to: x.to })}
              className={`min-h-[44px] rounded-lg border px-0.5 text-[11px] font-bold leading-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 ${i === lab.t ? 'border-orange-300 bg-orange-500/25 text-white' : done ? 'border-emerald-700 bg-emerald-900/40 text-emerald-200' : 'border-slate-600 bg-slate-800 text-slate-300'}`}>
              <bdi dir="ltr" className="font-mono">{`${x.from}${x.to}`}</bdi>{done ? '✓' : ''}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl bg-slate-800 p-1.5">
        {columnBlock}
        {walking || pinning ? pad3 : editing ? sendBtn : nextBtn}
      </div>
      <p role="status" data-cs-verdict={last?.reason ?? last?.kind ?? ''}
        className={`min-h-[2.75rem] rounded-lg bg-white px-2 py-1 ${narrow ? 'text-[11px]' : 'text-xs'} font-bold leading-snug ${verdict?.tone === 'ok' ? 'text-emerald-800' : verdict?.tone === 'ko' ? 'text-rose-800' : 'text-slate-700'}`}>
        <MathText>{verdict ? verdict.text : waiting}</MathText>
      </p>
    </div>
  );

  const hintKeys = { draw: ['hintD1', 'hintD2', 'hintD3'], act1: ['hintA1', 'hintA2', 'hintA3'], city: ['hintC1', 'hintC2', 'hintC3'] }[tale];
  const cap1 = tale === 'draw' ? 'Draw' : act1 ? 'Act1' : 'City';
  const riderAt = walking || o.kind === 'walk' || o.kind === 'walkCode' ? s.pos : null;
  const pinAt = o.kind === 'pin' ? (drag?.what === 'pin' ? drag.cursor : s.pin) : null;
  const handle = (p) => { const [px, py] = geo.toPx(p); return { left: px - 22, top: py - 22 }; };

  return (
    <ManipulationShell
      type="component-steps"
      title={title ?? k('title')}
      mission={mission ?? <MathText>{k(`mission${cap1}`)}</MathText>}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      guided={cpEnabled}
      hints={hintKeys.map((h) => <MathText key={h}>{k(h)}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={(
        <ManipulationDiscovery state={state} prompt={<MathText>{k(`dPrompt${cap1}`)}</MathText>} options={discoveryOptions} formal={formal} />
      )}
      explanation={<MathText>{k(`explanation${cap1}`)}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-orange-50 to-white !p-3" minHeight="min-h-[160px]" dragging={!!ptr.current}>
        <div ref={boxRef} className="space-y-2" data-component-steps data-world={theme} data-order={o.id} data-kind={o.kind}
          data-solved={solvedAll ? 'true' : 'false'} data-scene-h={sceneH}>
          <div className="relative space-y-2">
            {party.node}
            {cp.node}
            <div className="flex justify-center"><LabStepper count={lab.orders.length} current={lab.t} done={stepDone} stepAttr="data-cs-step" /></div>
          <div ref={glanceRef} className={`flex ${side ? 'flex-row items-start' : 'flex-col items-center'} justify-center gap-2`} data-cs-glance>
            <div ref={sceneRef} className="relative shrink-0 overflow-hidden rounded-xl shadow-inner" style={{ width: sceneW, height: sceneH, touchAction: 'none' }}
              onPointerUp={onSceneUp} data-cs-scene data-cell={Math.round(geo.cell)}>
              <CityMap geo={geo} lab={lab} />

              <Trips geo={geo} lab={lab} drag={drag} reduce={reduce} honk={honk} />
              {riderAt && (
                <button type="button" data-cs-rider aria-label={k('riderAria', { x: s.pos[0], y: s.pos[1] })}
                  onPointerDown={walking ? onHandleDown('rider') : undefined} onPointerMove={onHandleMove} onPointerUp={onHandleUp}
                  onPointerCancel={() => { ptr.current = null; }} onKeyDown={walking ? onRiderKey : undefined}
                  className="absolute flex h-11 w-11 items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-orange-400"
                  style={{ ...handle(riderAt), touchAction: 'none', cursor: walking ? 'grab' : 'default' }} />
              )}
              {pinAt && !s.done && (
                <button type="button" data-cs-pin aria-label={k('pinAria', { x: pinAt[0], y: pinAt[1] })}
                  onPointerDown={onHandleDown('pin')} onPointerMove={onHandleMove} onPointerUp={onHandleUp}
                  onPointerCancel={() => { ptr.current = null; setDrag(null); }} onKeyDown={onPinKey}
                  className="absolute flex h-11 w-11 items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-orange-400"
                  style={{ ...handle(pinAt), touchAction: 'none', cursor: 'grab' }} />
              )}
            </div>
            {panel}
          </div>
          </div>

          {lab.trials.length > 0 && (
            <LabFold id="component-steps.trials" title={k('trialsTitle')} defaultOpen={false}>
              <ul className="space-y-0.5 text-xs" data-cs-trials={lab.trials.length}>
                {lab.trials.map((x) => (
                  <li key={x.n} className={x.ok ? 'text-emerald-800' : 'text-rose-800'} data-reason={x.reason}>
                    <MathText>{k('trialRow', { n: x.n, V: VEC(`${x.from}${x.to}`), GOT: col(x.v), verdict: k(`t_${x.reason}`) })}</MathText>
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

/* ── le quartier vu d'en haut : îlots, toits blancs, paraboles, palmiers, un dôme ; rues = quadrillage ; axes = boulevards ── */
function CityMap({ geo, lab }) {
  const [x0, x1, y0, y1] = lab.grid;
  const { cell, width, height } = geo;
  const P = (p) => geo.toPx(p);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const blocks = useMemo(() => {
    const out = [];
    for (let x = x0; x < x1; x += 1) for (let y = y0; y < y1; y += 1) {
      const h = Math.abs((x * 73856093) ^ (y * 19349663)) % 97;
      out.push({ x, y, h });
    }
    return out;
  }, [x0, x1, y0, y1]);
  const [ox, oy] = P([0, 0]);
  const fs = Math.max(8, Math.min(11, cell * 0.36));
  const tx = { direction: 'ltr', unicodeBidi: 'isolate' };
  const showTick = (v) => cell >= 20 || v % 2 === 0;
  return (
    <svg width={width} height={height} className="absolute inset-0" aria-hidden="true" focusable="false" data-deco="city" style={{ direction: 'ltr' }}>
      <defs>
        <pattern id={`cs-asph-${uid}`} width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#E2E8F0" /><circle cx="2" cy="2" r="0.6" fill="#CBD5E1" /></pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#cs-asph-${uid})`} />
      {/* les îlots entre les rues */}
      {blocks.map(({ x, y, h }) => {
        const [bx, by] = P([x, y + 1]);
        const m = Math.max(2, cell * 0.12);
        const w = cell - 2 * m;
        const kind = h % 11 === 0 ? 'palm' : h % 17 === 3 ? 'park' : h === 42 ? 'dome' : 'roofs';
        return (
          <g key={`${x},${y}`}>
            <rect x={bx + m} y={by + m} width={w} height={w} rx={Math.max(1, cell * 0.08)} fill={kind === 'park' ? '#D9F99D' : '#F5EBDD'} />
            {kind === 'roofs' && (
              <>
                <rect x={bx + m + w * 0.1} y={by + m + w * 0.12} width={w * 0.46} height={w * 0.38} fill="#FFFFFF" stroke="#E7D7C1" strokeWidth={0.6} />
                <rect x={bx + m + w * 0.5} y={by + m + w * 0.55} width={w * 0.4} height={w * 0.34} fill="#FFFFFF" stroke="#E7D7C1" strokeWidth={0.6} />
                {h % 3 === 0 && <circle cx={bx + m + w * 0.3} cy={by + m + w * 0.3} r={Math.max(1.2, w * 0.07)} fill="#CBD5E1" stroke="#94A3B8" strokeWidth={0.5} />}
                {h % 4 === 1 && <rect x={bx + m + w * 0.58} y={by + m + w * 0.62} width={w * 0.1} height={w * 0.1} fill="#38BDF8" />}
              </>
            )}
            {kind === 'palm' && (
              <g>
                <circle cx={bx + cell / 2} cy={by + cell / 2} r={w * 0.3} fill="#4ADE80" opacity={0.8} />
                {[0, 72, 144, 216, 288].map((a) => <line key={a} x1={bx + cell / 2} y1={by + cell / 2} x2={bx + cell / 2 + Math.cos((a * Math.PI) / 180) * w * 0.38} y2={by + cell / 2 + Math.sin((a * Math.PI) / 180) * w * 0.38} stroke="#15803D" strokeWidth={1.2} />)}
              </g>
            )}
            {kind === 'park' && <circle cx={bx + cell / 2} cy={by + cell / 2} r={w * 0.18} fill="#86EFAC" />}
            {kind === 'dome' && <circle cx={bx + cell / 2} cy={by + cell / 2} r={w * 0.3} fill="#F8FAFC" stroke="#14B8A6" strokeWidth={1.4} />}
          </g>
        );
      })}
      {/* les rues (le quadrillage du معلم) */}
      <g stroke="#FFFFFF" strokeWidth={Math.max(1.5, cell * 0.1)} opacity={0.95}>
        {Array.from({ length: x1 - x0 + 1 }, (_, i) => { const [x, ya] = P([x0 + i, y1]); const [, yb] = P([x0 + i, y0]); return <line key={`v${i}`} x1={x} y1={ya} x2={x} y2={yb} />; })}
        {Array.from({ length: y1 - y0 + 1 }, (_, j) => { const [xa, y] = P([x0, y0 + j]); const [xb] = P([x1, y0 + j]); return <line key={`h${j}`} x1={xa} y1={y} x2={xb} y2={y} />; })}
      </g>
      {/* les deux boulevards : les axes du معلم, avec leurs graduations */}
      <g data-cs-axes>
        <line x1={P([x0, 0])[0]} y1={oy} x2={P([x1, 0])[0]} y2={oy} stroke="#64748B" strokeWidth={Math.max(3, cell * 0.2)} />
        <line x1={ox} y1={P([0, y0])[1]} x2={ox} y2={P([0, y1])[1]} stroke="#64748B" strokeWidth={Math.max(3, cell * 0.2)} />
        <line x1={P([x0, 0])[0]} y1={oy} x2={P([x1, 0])[0]} y2={oy} stroke="#F8FAFC" strokeWidth={1} strokeDasharray="4 4" />
        <line x1={ox} y1={P([0, y0])[1]} x2={ox} y2={P([0, y1])[1]} stroke="#F8FAFC" strokeWidth={1} strokeDasharray="4 4" />
        {Array.from({ length: x1 - x0 + 1 }, (_, i) => x0 + i).filter((v) => v !== 0 && showTick(v)).map((v) => (
          <text key={`tx${v}`} x={P([v, 0])[0] + 2} y={oy + fs + 1} fontSize={fs} fontWeight={700} fill="#334155" style={tx}>{signed(v).replace('+', '')}</text>
        ))}
        {Array.from({ length: y1 - y0 + 1 }, (_, j) => y0 + j).filter((v) => v !== 0 && showTick(v)).map((v) => (
          <text key={`ty${v}`} x={ox + 3} y={P([0, v])[1] - 2} fontSize={fs} fontWeight={700} fill="#334155" style={tx}>{signed(v).replace('+', '')}</text>
        ))}
      </g>
      {/* le dépôt de l'appli en O */}
      <g data-cs-place="O">
        <rect x={ox - cell * 0.32} y={oy - cell * 0.32} width={cell * 0.64} height={cell * 0.64} rx={cell * 0.14} fill="#0F172A" />
        <text x={ox} y={oy + cell * 0.14} textAnchor="middle" fontSize={Math.max(9, cell * 0.42)} fontWeight={900} fill={BRAND} style={tx}>O</text>
      </g>
    </svg>
  );
}

/* ── les trajets : lieux, flèches livrées, trace du scooter, pilote automatique, pin, scooter ── */
function Arrow({ from, to, color, width = 3, dashed = false, head = 10, opacity = 1, data }) {
  const dx = to[0] - from[0]; const dy = to[1] - from[1]; const l = Math.hypot(dx, dy);
  if (l < 1) return null;
  const ux = dx / l; const uy = dy / l;
  const bx = to[0] - ux * head; const by = to[1] - uy * head;
  return (
    <g data-cs-arrow={data} opacity={opacity}>
      <line x1={from[0]} y1={from[1]} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? '6 5' : undefined} />
      <path d={`M${to[0]} ${to[1]} L${bx - uy * head * 0.55} ${by + ux * head * 0.55} L${bx + uy * head * 0.55} ${by - ux * head * 0.55} Z`} fill={color} />
    </g>
  );
}

function Scooter({ x, y, s, ghost = false, wiggle = 0, reduce }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={ghost ? 0.75 : 1}>
      <g key={wiggle} className={wiggle && !reduce ? 'cs-honk' : undefined}>
        <ellipse cx={0} cy={s * 0.42} rx={s * 0.55} ry={s * 0.12} fill="#0F172A" opacity={0.18} />
        <circle cx={-s * 0.32} cy={s * 0.28} r={s * 0.14} fill="#0F172A" />
        <circle cx={s * 0.34} cy={s * 0.28} r={s * 0.14} fill="#0F172A" />
        <path d={`M${-s * 0.42} ${s * 0.2} L${s * 0.1} ${s * 0.2} L${s * 0.3} ${-s * 0.1} L${s * 0.42} ${s * 0.2} Z`} fill={ghost ? '#94A3B8' : '#0EA5E9'} />
        <rect x={-s * 0.5} y={-s * 0.32} width={s * 0.42} height={s * 0.42} rx={s * 0.06} fill={ghost ? '#CBD5E1' : BRAND} stroke="#FFFFFF" strokeWidth={1} />
        <circle cx={s * 0.08} cy={-s * 0.32} r={s * 0.17} fill={ghost ? '#94A3B8' : '#1E293B'} />
        <rect x={s * 0.1} y={-s * 0.38} width={s * 0.12} height={s * 0.07} fill="#7DD3FC" />
      </g>
    </g>
  );
}

/** Le nom d'un lieu, dessiné EN DERNIER (au-dessus du scooter et des flèches) : LTR, auréole blanche. */
function PlaceLabel({ geo, name, p, fs, active }) {
  const [x, y] = geo.toPx(p);
  const c = geo.cell;
  // au bord du haut, le nom passe SOUS le nœud (sinon la scène le coupe)
  const above = y - Math.max(4, c * 0.3);
  const ly = above - fs < 2 ? y + Math.max(4, c * 0.3) + fs * 0.8 : above;
  return (
    <text x={x + Math.max(5, c * 0.26)} y={ly} fontSize={fs} fontWeight={900} fill={active ? '#0F172A' : '#475569'} stroke="#FFFFFF" strokeWidth={3} paintOrder="stroke"
      style={{ direction: 'ltr', unicodeBidi: 'isolate' }} data-cs-label={name}>{name}</text>
  );
}

function Place({ geo, name, p, kind, active }) {
  const [x, y] = geo.toPx(p);
  const c = geo.cell;
  if (kind === 'shop') {
    return (
      <g data-cs-place={name} opacity={active ? 1 : 0.55}>
        <rect x={x - c * 0.26} y={y - c * 0.2} width={c * 0.52} height={c * 0.36} rx={2} fill="#FFFFFF" stroke="#E11D48" strokeWidth={1.2} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={x - c * 0.26 + i * c * 0.13} y={y - c * 0.26} width={c * 0.13} height={c * 0.1} fill={i % 2 ? '#FFFFFF' : '#E11D48'} />)}
      </g>
    );
  }
  if (kind === 'home') {
    return (
      <g data-cs-place={name} opacity={active ? 1 : 0.55}>
        <path d={`M${x} ${y} C ${x - c * 0.3} ${y - c * 0.3}, ${x - c * 0.22} ${y - c * 0.62}, ${x} ${y - c * 0.62} C ${x + c * 0.22} ${y - c * 0.62}, ${x + c * 0.3} ${y - c * 0.3}, ${x} ${y} Z`} fill="#7C3AED" stroke="#FFFFFF" strokeWidth={1.2} />
        <circle cx={x} cy={y - c * 0.42} r={c * 0.09} fill="#FFFFFF" />
      </g>
    );
  }
  return (
    <g data-cs-place={name} opacity={active ? 1 : 0.6}>
      <circle cx={x} cy={y} r={Math.max(3, c * 0.13)} fill="#0F172A" />
    </g>
  );
}

function Trips({ geo, lab, drag, reduce, honk }) {
  const P = (p) => geo.toPx(p);
  const c = geo.cell;
  const o = L.order(lab);
  const s = L.stateOf(lab);
  const fs = Math.max(11, Math.min(16, c * 0.42));
  const tx = { direction: 'ltr', unicodeBidi: 'isolate' };
  const from = L.at(lab, o.from);
  const legLabels = (a, v, color) => {
    const corner = [a[0] + v[0], a[1]];
    const [ax, ay] = P(a); const [cx, cy] = P(corner); const [, by] = P([corner[0], corner[1] + v[1]]);
    return (
      <g style={tx} fontSize={Math.max(10, fs - 2)} fontWeight={900} fill={color} stroke="#FFFFFF" strokeWidth={3} paintOrder="stroke" data-cs-legs>
        {v[0] !== 0 && <text x={(ax + cx) / 2} y={ay - 5} textAnchor="middle">{signed(v[0])}</text>}
        {v[1] !== 0 && <text x={cx + 6} y={(cy + by) / 2 + 4}>{signed(v[1])}</text>}
      </g>
    );
  };
  const stair = (a, v, color, dashed, data) => {
    const corner = [a[0] + v[0], a[1]];
    const pts = [P(a), P(corner), P([corner[0], corner[1] + v[1]])].map((q) => q.join(',')).join(' ');
    return <polyline points={pts} fill="none" stroke={color} strokeWidth={Math.max(2, c * 0.09)} strokeLinejoin="round" strokeDasharray={dashed ? '5 4' : undefined} data-cs-stair={data} />;
  };
  // lieux : tous les lieux des commandes ; ceux de la commande courante en plein
  const places = [];
  lab.orders.forEach((x, i) => {
    const cur = i === lab.t;
    const doneX = lab.states[i].done;
    if (x.from !== 'O') places.push({ name: x.from, p: L.at(lab, x.from), kind: x.kind === 'pin' ? 'dot' : 'shop', active: cur });
    if (x.kind === 'pin' ? doneX : (!x.hidden || doneX)) places.push({ name: x.to, p: L.targetOf(lab, x), kind: 'home', active: cur });
  });
  // un lieu « hors figure » (le D du نشاط 1) reste caché tant que la commande qui le cache n'est pas livrée
  const hiddenNames = new Set(lab.orders.filter((x, i) => x.hidden && !lab.states[i].done).map((x) => x.to));
  // les points nommés qui ne sont dans aucune commande (le C du نشاط 1) : des repères du quartier
  const inOrders = new Set(lab.orders.flatMap((x) => [x.from, x.to]));
  Object.entries(lab.points).forEach(([n, p]) => { if (!inOrders.has(n)) places.push({ name: n, p, kind: 'dot', active: true }); });
  const seenNames = new Set(hiddenNames);
  const uniq = places.filter((pl) => { const key = pl.name; if (seenNames.has(key)) { if (pl.active) { const j = places.findIndex((q) => q.name === key); places[j].active = true; } return false; } seenNames.add(key); return true; });
  const sent = s.sent;
  const pinCursor = o.kind === 'pin' && !s.done ? (drag?.what === 'pin' ? drag.cursor : s.pin) : null;
  return (
    <svg width={geo.width} height={geo.height} className="absolute inset-0" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
      <style>{'.cs-honk{animation:cs-honk .45s ease-in-out 1}@keyframes cs-honk{25%{transform:translateY(-4px) rotate(-6deg)}75%{transform:translateY(-2px) rotate(5deg)}}.cs-auto{stroke-dasharray:600;stroke-dashoffset:600;animation:cs-auto .9s ease-out 1 forwards}@keyframes cs-auto{to{stroke-dashoffset:0}}@media (prefers-reduced-motion: reduce){.cs-honk,.cs-auto{animation:none;stroke-dashoffset:0}}'}</style>
      {/* les commandes livrées des AUTRES onglets, en filigrane (deux flèches parallèles : le même code) */}
      {lab.orders.map((x, i) => (i !== lab.t && lab.states[i].done ? (
        <Arrow key={x.id} from={P(L.at(lab, x.from))} to={P(L.targetOf(lab, x))} color="#7C3AED" width={2} opacity={0.35} data={`done-${x.id}`} />
      ) : null))}
      {uniq.map((pl) => <Place key={pl.name} geo={geo} name={pl.name} p={pl.p} kind={pl.kind} active={pl.active} />)}
      {/* la commande courante */}
      {(o.kind === 'walk' || o.kind === 'walkCode') && (
        <g>
          <polyline points={s.path.map((q) => P(q).join(',')).join(' ')} fill="none" stroke="#0EA5E9" strokeWidth={Math.max(3, c * 0.14)} strokeLinejoin="round" strokeLinecap="round" opacity={0.85} data-cs-trail={s.path.length - 1} />
          {(lab.live || s.done) && (s.pos[0] !== from[0] || s.pos[1] !== from[1]) && (
            <g data-cs-net>{stair(from, L.counters(lab), '#0369A1', true)}{legLabels(from, L.counters(lab), '#0369A1')}</g>
          )}
        </g>
      )}
      {sent && (o.kind === 'code' || (o.kind === 'walkCode' && !sent.ok)) && (
        <g key={`a${lab.trials.length}`} data-cs-autopilot data-ok={sent.ok ? 'true' : 'false'}>
          <g className={reduce ? undefined : 'cs-auto'}>{stair(from, sent.v, sent.ok ? '#059669' : '#E11D48', !sent.ok)}</g>
          {legLabels(from, sent.v, sent.ok ? '#047857' : '#BE123C')}
          {!sent.ok && L.inside(lab, sent.lands) && (
            <g>
              <circle cx={P(sent.lands)[0]} cy={P(sent.lands)[1]} r={c * 0.3} fill="none" stroke="#E11D48" strokeWidth={2} />
              <text x={P(sent.lands)[0]} y={P(sent.lands)[1] + 4} textAnchor="middle" fontSize={fs} fontWeight={900} fill="#E11D48">✗</text>
            </g>
          )}
        </g>
      )}
      {s.done && <Arrow from={P(from)} to={P(L.targetOf(lab, o))} color="#7C3AED" width={3.4} data={o.id} />}
      {s.done && o.kind !== 'walk' && o.kind !== 'walkCode' && legLabels(from, L.expectedOf(lab, o), '#047857')}
      {/* le pin : la flèche du départ vers le nœud visé */}
      {pinCursor && (
        <g data-cs-pinview>
          {(pinCursor[0] !== from[0] || pinCursor[1] !== from[1]) && <Arrow from={P(from)} to={P(pinCursor)} color="#F97316" width={2.6} dashed />}
          <path d={(() => { const [x, y] = P(pinCursor); return `M${x} ${y} C ${x - c * 0.3} ${y - c * 0.3}, ${x - c * 0.22} ${y - c * 0.62}, ${x} ${y - c * 0.62} C ${x + c * 0.22} ${y - c * 0.62}, ${x + c * 0.3} ${y - c * 0.3}, ${x} ${y} Z`; })()}
            fill={BRAND} stroke="#FFFFFF" strokeWidth={1.4} />
        </g>
      )}
      {sent && o.kind === 'pin' && !sent.ok && (
        <g data-cs-autopilot data-ok="false">
          <Arrow from={P(from)} to={P(sent.lands)} color="#E11D48" width={2.2} dashed opacity={0.8} />
        </g>
      )}
      {/* le scooter */}
      {(o.kind === 'walk' || o.kind === 'walkCode') && (() => { const [x, y] = P(s.pos); return <Scooter x={x} y={y - c * 0.1} s={Math.max(18, Math.min(34, c * 0.95))} wiggle={honk} reduce={reduce} />; })()}
      {o.kind === 'code' && (() => {
        const at = sent ? (L.inside(lab, sent.lands) ? sent.lands : from) : from;
        const [x, y] = P(at);
        return <Scooter x={x} y={y - c * 0.1} s={Math.max(18, Math.min(34, c * 0.95))} ghost={!!sent && !sent.ok} wiggle={honk} reduce={reduce} />;
      })()}
      {uniq.map((pl) => <PlaceLabel key={`l${pl.name}`} geo={geo} name={pl.name} p={pl.p} fs={fs} active={pl.active} />)}
    </svg>
  );
}

/** Le klaxon du téléphone : le scooter sursaute. Décor seulement. */
function Horn({ label, compact = false, onTap }) {
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" data-deco="horn" onClick={onTap}
      className={`${compact ? '' : 'ms-auto'} inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-full bg-slate-800 px-2 text-xs font-bold text-orange-300 focus:outline-none`}>
      <span>📣</span>{compact ? null : label}
    </button>
  );
}
/** Les étoiles de la note après chaque livraison. Décor seulement. */
function Stars({ n, reduce }) {
  return (
    <span aria-hidden="true" data-deco="stars" className="inline-flex gap-0.5" key={n}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`text-[11px] ${n > 0 ? 'text-amber-300' : 'text-slate-600'} ${n > 0 && !reduce ? 'animate-pulse' : ''}`}>★</span>
      ))}
    </span>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de la commande i : marche / code → les deux composantes puis le rapport avec l'adresse ; pin → où il est tombé et pourquoi ; la dernière finit par la règle. */
export function chainOf(lab, i) {
  const o = lab.orders[i];
  let q;
  if (o.kind === 'pin') q = o.from === 'O' ? ['pinEnd', 'vsAddr'] : ['pinEnd', 'pinHow'];
  else q = o.from === 'O' ? ['compX', 'compY', 'vsAddr'] : ['compX', 'compY'];
  if (o.kind === 'code' && o.from !== 'O' && lab.orders.some((x, j) => j !== i && x.kind === 'code' && x.from === 'O')) q.push('vsAddr');
  if (i === lab.orders.length - 1) q.push('rule');
  return q;
}

const ti = (n) => (n < 0 ? `-${Math.abs(n)}` : `${n}`);
const tp = (n) => (n < 0 ? `(-${Math.abs(n)})` : `${n}`);
const $c = (s) => `$${s}$`;
const info = (lab, i) => {
  const o = lab.orders[i];
  const u = L.expectedOf(lab, o);
  const from = L.at(lab, o.from); const to = L.at(lab, o.to);
  return { o, u, from, to, v: VEC(`${o.from}${o.to}`) };
};

/** Une composante lue sur la rue : la juste, l'opposée (direction), l'autre axe (échange), l'adresse (si le départ n'est pas O). */
const comp = (c) => (lab, i, k) => {
  const { o, u, from, to, v } = info(lab, i);
  const ax = c === 0 ? 'x' : 'y';
  const right = u[c];
  const calc = `${ax}_{${o.to}} - ${ax}_{${o.from}} = ${ti(to[c])} - ${tp(from[c])} = ${ti(right)}`;
  const ds = distractors(right, [{ v: -right, why: 'whyReverse' }, { v: u[1 - c], why: 'whySwap' }, ...(o.from !== 'O' ? [{ v: to[c], why: 'whyAddr' }] : [])], 2, 'whyOff');
  const P = { v: $c(v), from: o.from, to: o.to, calc: $c(calc) };
  return {
    id: c === 0 ? 'compX' : 'compY', kind: 'choice', cols: 3,
    prompt: Mx(k, c === 0 ? 'compX.prompt' : 'compY.prompt', P),
    options: [
      { text: <MathText>{$c(ti(right))}</MathText>, correct: true },
      ...ds.map((d) => ({ text: <MathText>{$c(ti(d.v))}</MathText>, why: Mx(k, `comp.${d.why}`, { ...P, n: $c(ti(d.v)), addr: $c(`${o.to}(${ti(to[0])}\\,;\\,${ti(to[1])})`) }) })),
    ],
    hints: [Mx(k, c === 0 ? 'compX.hint1' : 'compY.hint1', P), Mx(k, 'comp.hint2', P)],
    explain: Mx(k, 'comp.explain', P),
  };
};

export const QUESTIONS = {
  compX: comp(0),
  compY: comp(1),
  vsAddr: (lab, i, k) => {
    const { o, u, from, to } = info(lab, i);
    const P = {
      from: o.from, to: o.to, u: $c(`\\begin{pmatrix} ${ti(u[0])} \\\\ ${ti(u[1])} \\end{pmatrix}`),
      addr: $c(`${o.to}(${ti(to[0])}\\,;\\,${ti(to[1])})`), fa: $c(`${o.from}(${ti(from[0])}\\,;\\,${ti(from[1])})`),
    };
    const fromO = o.from === 'O';
    return {
      id: 'vsAddr', kind: 'choice',
      prompt: Mx(k, fromO ? 'vsAddr.promptO' : 'vsAddr.prompt', P),
      options: fromO ? [
        { text: Mx(k, 'vsAddr.sameO', P), correct: true },
        { text: Mx(k, 'vsAddr.never'), why: Mx(k, 'vsAddr.whyNever', P) },
        { text: Mx(k, 'vsAddr.swapped'), why: Mx(k, 'vsAddr.whySwapped') },
      ] : [
        { text: Mx(k, 'vsAddr.diff'), correct: true },
        { text: Mx(k, 'vsAddr.addr'), why: Mx(k, 'vsAddr.whyAddr', P) },
        { text: Mx(k, 'vsAddr.start'), why: Mx(k, 'vsAddr.whyStart', P) },
      ],
      hints: [Mx(k, 'vsAddr.hint1', P), Mx(k, 'vsAddr.hint2', P)],
      explain: Mx(k, fromO ? 'vsAddr.explainO' : 'vsAddr.explain', P),
    };
  },
  pinEnd: (lab, i, k) => {
    const { o, u, from, to } = info(lab, i);
    const pt = (a) => $c(`${o.to}(${ti(a[0])}\\,;\\,${ti(a[1])})`);
    const P = { u: $c(`\\begin{pmatrix} ${ti(u[0])} \\\\ ${ti(u[1])} \\end{pmatrix}`), from: o.from, to: o.to };
    const cands = [
      ...(o.from !== 'O' ? [{ a: u, why: 'whyU' }] : []),
      { a: [from[0] - u[0], from[1] - u[1]], why: 'whyBack' },
      { a: [from[0] + u[1], from[1] + u[0]], why: 'whySwap' },
      { a: [to[0] + 1, to[1] - 1], why: 'whyOff' },
    ];
    const seen = new Set([to.join(';')]); const ds = [];
    for (const c of cands) { const key = c.a.join(';'); if (ds.length < 2 && !seen.has(key)) { seen.add(key); ds.push(c); } }
    return {
      id: 'pinEnd', kind: 'choice',
      prompt: Mx(k, 'pinEnd.prompt', P),
      options: [
        { text: <MathText>{pt(to)}</MathText>, correct: true },
        ...ds.map((d) => ({ text: <MathText>{pt(d.a)}</MathText>, why: Mx(k, `pinEnd.${d.why}`, { ...P, pt: pt(d.a) }) })),
      ],
      hints: [Mx(k, 'pinEnd.hint1', P), Mx(k, 'pinEnd.hint2', P)],
      explain: Mx(k, 'pinEnd.explain', { ...P, pt: pt(to) }),
    };
  },
  pinHow: (lab, i, k) => {
    const { o, u, from } = info(lab, i);
    const P = {
      u: $c(`\\begin{pmatrix} ${ti(u[0])} \\\\ ${ti(u[1])} \\end{pmatrix}`), from: o.from, to: o.to,
      calc: $c(`\\begin{cases} x_{${o.to}} = ${ti(from[0])} + ${tp(u[0])} = ${ti(from[0] + u[0])} \\\\ y_{${o.to}} = ${ti(from[1])} + ${tp(u[1])} = ${ti(from[1] + u[1])} \\end{cases}`),
    };
    return {
      id: 'pinHow', kind: 'choice',
      prompt: Mx(k, 'pinHow.prompt', P),
      options: [
        { text: Mx(k, 'pinHow.add'), correct: true },
        { text: Mx(k, 'pinHow.direct'), why: Mx(k, 'pinHow.whyDirect', P) },
        { text: Mx(k, 'pinHow.sub'), why: Mx(k, 'pinHow.whySub', P) },
      ],
      hints: [Mx(k, 'pinHow.hint1', P), Mx(k, 'pinHow.hint2', P)],
      explain: Mx(k, 'pinHow.explain', P),
    };
  },
  rule: (lab, i, k) => {
    const tale = lab.story ?? (lab.live ? 'city' : 'act1');
    const cap = tale === 'draw' ? 'Draw' : tale === 'act1' ? 'Act1' : 'City';
    return {
      id: 'rule', kind: 'choice',
      prompt: <MathText>{k(`dPrompt${cap}`)}</MathText>,
      options: discoveryOptionsOf(tale, k),
      hints: [Mx(k, 'rule.hint1'), Mx(k, 'rule.hint2')],
      explain: <p className="text-sm" data-cs-formal><MathText>{k(`f${cap}`)}</MathText></p>,
    };
  },
};
