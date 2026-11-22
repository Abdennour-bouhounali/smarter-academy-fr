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
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import MathText from '../../components/MathText';
import * as L from '../logic/translationGlide';

/**
 * translation-glide — LE SPECTACLE DE DRONES (unité 11 « الأشعة والانسحاب », درس « مفهوم الانسحاب والشعاع وتساوي
 * شعاعين », نشاط 1 p. 128).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève PORTE le drone meneur A jusqu'à un nœud de la grille lumineuse (glisser, toucher-toucher, ou flèches +
 *    Entrée) : la flèche AA′ naît sous son doigt ; puis il POSE l'image de chaque autre drone (un nœud), et répare
 *    le drone égaré en portant la pointe de sa flèche. En متقدم, il pose les images des quatre translations du manuel.
 * B. Idée : une translation est UNE flèche — un منحى (la droite (AA′)), un اتجاه (de A vers A′), un طول (AA′) ; chaque
 *    point et son image donnent une flèche ÉGALE (les trois à la fois) : c'est le شعاع, chaque flèche un مُمثّل.
 * C. La flèche, sa droite porteuse en pointillés et sa longueur suivent le geste ; une image refusée laisse une
 *    flèche rose et le nom de l'élément qui diffère ; la formation complète GLISSE d'un bloc, ABB′A′ s'éclaire.
 * D. La lecture « المنحى · الاتجاه · الطول » (voyants), puis $\overrightarrow{AA'} = \overrightarrow{BB'} = … = \vec{u}$.
 * E. À découvrir avant la règle : même longueur ne suffit pas (le drone égaré, −u), parallèle ne suffit pas ; un
 *    point et son image suffisent à fixer la translation (متقدم : C ↦ D et K ↦ H sont la translation A ↦ A′).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        le شعاع défini par une translation ; l'égalité de deux vecteurs (منحى + اتجاه + طول)
 *   OBJECT         une formation de drones lumineux au-dessus de la baie d'Alger, sur la grille du spectacle
 *   VARIABLE       la flèche du meneur (le nœud A′, مبتدئ) et la position de chaque image (un nœud, les deux niveaux)
 *   INVARIANT      la flèche u : toute image acceptée vaut P + u ; déplacer A′ déplace toutes les images posées
 *   TRANSFORMATION la flèche PP′ change avec le nœud visé ; la formation glisse d'un bloc une fois complète
 *   CONSTRAINT     une image n'est acceptée que si PP′ = u (`vectors.relation`, exact) ; le ciel borne la flèche
 *   RESISTANCE     le refus NOMME ce qui diffère : « منحى مختلف » / « نفس المنحى ونفس الطول، لكن الاتجاه معاكس » /
 *                  « … لكن الطول مختلف : √5 بدل √10 » ; la flèche refusée reste dessinée en rose
 *   EVIDENCE       les images acceptées, les flèches toutes parallèles et de même longueur, ABB′A′ متوازي أضلاع
 *   CONTRAST       مبتدئ : le drone égaré (même منحى، même طول، اتجاه معاكس) ; متقدم : A ↦ G contre A ↦ M (même منحى,
 *                  اتجاه et طول différents) et K ↦ H qui retombe sur la translation A ↦ A′
 *   PREDICTION     avant de poser B′, l'élève compte les carreaux de AA′ ; la balise du plan n'est qu'une orientation
 *   DISCOVERY      « نفس المنحى ونفس الاتجاه ونفس الطول : شعاع واحد » ; « نقطة وصورتها تعيّنان الانسحاب »
 *   FORMALIZATION  معارف 1 (p. 130) : الشعاع، المنحى، الاتجاه، الطول، تساوي شعاعين ; le pont vers معارف 2 (ABB′A′)
 *   TRANSFER       les modules 2–5 (معارف, نشاط 2 أ, ex-1 à 8) et la banque d'exercices
 *
 * Toutes les vérités viennent de `vectors.relation` (logic/translationGlide.js) ; le dessin est en flottants mais rien
 * n'est accepté sans égalité exacte. Manuel (§6bis) : chaque placement est un essai — aucune auto-complétion.
 *
 * DÉCOR (exigence du propriétaire) : le ciel de nuit, la baie d'Alger, la silhouette du minaret de جامع الجزائر, la
 * foule qui filme avec ses téléphones, un feu d'artifice quand une formation glisse, et la télécommande du spectacle
 * dont le bouton « couleur » change la couleur des LED. `aria-hidden`, hors clavier (`tabIndex=-1`), `[data-deco]`,
 * jamais une information ; immobile sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (§8bis) : le bloc `[data-tg-glance]` = la scène + la télécommande (lectures, voyants, verdict). La
 * télécommande se place À CÔTÉ de la scène quand la largeur le permet (dès 360 px pour une grille haute, 620 px pour une grille large — la figure du نشاط 1 redessinée est large, 14 × 8), sinon
 * dessous ; la hauteur de la scène est bornée par l'écran de leçon (`useLessonViewport`) moins ce que le bloc mesure en
 * plus. La liste des essais est dans un `LabFold` hors du bloc mesuré.
 *
 * Props : `scene` ('show' | 'act1'), `grid`, `drones`, `vector` (balise), `theme` (`drone-show`), `title`, `lead`,
 * `mission`, `level`, `levels`, `onTrial(evidence)` à chaque placement validé, `onFinished(summary)` à la règle —
 * tous par `state.report`.
 *
 * CONTRAT DOM : [data-translation-glide][data-scene][data-solved][data-tableau], [data-tg-glance], [data-tg-scene],
 * [data-tg-grab=<id>] (boutons : leader | drone:B | rogue), [data-tg-image=<name>], [data-tg-arrow=<kind>],
 * [data-tg-carrier], [data-tg-parallelogram][data-flat], [data-tg-rogue][data-fixed], [data-tg-lamps],
 * [data-tg-lamp=direction|sense|length][data-on], [data-tg-reading], [data-tg-verdict=<kind>], [data-tg-tab=<id>][data-done],
 * [data-lab-fold=translation-glide.trials], [data-deco].
 */
const PRIME = (s) => String(s).replace(/'/g, '′');
const VEC = (s) => `\\overrightarrow{${s}}`;
const tf = (s) => s.replace(/\\dfrac/g, '\\tfrac');
const LED = [['#22D3EE', '#67E8F9'], ['#F472B6', '#FBCFE8'], ['#FACC15', '#FEF08A'], ['#34D399', '#A7F3D0']];

export default function TranslationGlide({
  scene = 'show', grid, drones, vector, theme = 'drone-show', title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.translationGlide.${key}`, o), [t]);
  const reduce = useReducedMotion();
  const initialNumbers = scene === 'act1' ? { scene, grid } : { scene, grid, drones, vector };
  const state = useManipulation({ type: 'translation-glide', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const make = () => L.init(nums);
  const [lab, setLab] = useState(make);
  const sceneKey = `${JSON.stringify(nums)}|${state.epoch}`;
  const [seen, setSeen] = useState(sceneKey);
  const [hold, setHold] = useState(null); // { id, cursor, mode: 'drag' | 'select' | 'key' }
  const [shake, setShake] = useState(0);
  const [led, setLed] = useState(0);
  const [burst, setBurst] = useState(0);
  if (seen !== sceneKey) { setSeen(sceneKey); setLab(make()); setHold(null); }
  const act1 = lab.scene === 'act1';
  const tb = L.tableau(lab);
  const u = tb.u;

  /* ── pédagogie : découverte, règle, essais ── */
  // les questions pendant le labo (obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte) : la règle vient de la dernière suite
  const cpSettings = useLabCheckpointSettings('translation-glide');
  const cpActive = cpOn && cpSettings.enabled;
  const ready = L.discoveryReady(lab) && !cpActive;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (state.isFormal) state.report(onFinished, L.summaryOf(lab));
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => { if (nTrials > 0) state.report(onTrial, L.evidenceOf(lab)); }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps
  // une formation qui vient d'être complétée GLISSE (et le décor lance un feu d'artifice)
  const doneCount = lab.tableaux.filter((_, i) => L.imagesDone(lab, i)).length;
  const [glide, setGlide] = useState({ n: 0, t: -1 });
  const prevDone = useRef(doneCount);
  useEffect(() => {
    if (doneCount > prevDone.current) { setGlide((g) => ({ n: g.n + 1, t: lab.t })); setBurst((b) => b + 1); }
    prevDone.current = doneCount;
  }, [doneCount]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : largeur du bloc, écran de leçon, ce que le bloc « glance » mesure en plus de la scène ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const sceneRef = useRef(null);
  const sceneHRef = useRef(260);
  const [width, setWidth] = useState(340);
  const [overhead, setOverhead] = useState(200);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(200, Math.floor(el.clientWidth)));
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
  const [gw, gh] = lab.grid;
  const portrait = gh > gw;
  const panelW = narrow ? 150 : 210;
  // la télécommande à côté : dès 360 px pour une grille haute, pour le ciel large dès 620 px
  const side = portrait ? width >= 360 : width >= 620;
  const sea = narrow ? 18 : portrait ? 26 : 34;
  const avail = Math.max(170, Math.min(side ? screenH - 36 - 52 : screenH - overhead - 30 - 52, 620));
  const maxW = side ? width - panelW - 12 : width;
  const cap = width >= 700 ? 58 : 46;
  const pad = narrow ? 20 : 26; // les étiquettes des points du bord restent dans la scène
  const natural = L.naturalHeight(lab, maxW, { sea, cap, pad });
  const sceneH = Math.round(Math.max(160, Math.min(natural, avail)));
  const cellFit = Math.min((maxW - 2 * pad) / gw, (sceneH - 2 * pad - sea) / gh, cap);
  // une grille haute garde du ciel de part et d'autre (le décor y vit)
  const sceneW = Math.round(Math.min(maxW, cellFit * gw + 2 * pad + (portrait ? cellFit * 2.6 : 0)));
  sceneHRef.current = sceneH;
  const geo = L.layout(lab, { width: sceneW, height: sceneH, sea, pad });
  const r = Math.max(9, Math.min(15, geo.cell * 0.34));

  /* ── les objets qu'on peut prendre ── */
  const rogue = L.rogueArrow(lab);
  const placedNow = L.placedIn(lab);
  const grabbables = useMemo(() => {
    const out = [];
    if (!act1) out.push({ id: 'leader', at: u ? L.imageOf(lab, tb.from) : lab.drones[tb.from], origin: lab.drones[tb.from], name: tb.from });
    for (const from of L.toPlace(lab)) if (!placedNow[from]) out.push({ id: `drone:${from}`, at: lab.drones[from], origin: lab.drones[from], name: from });
    if (rogue && !rogue.fixed) out.push({ id: 'rogue', at: rogue.tip, origin: rogue.at, name: lab.rogue.name });
    return out;
  }, [lab, act1, u, tb, placedNow, rogue]);
  const byId = (id) => grabbables.find((g) => g.id === id);
  const nameOfImage = (id) => (id === 'leader' ? `${tb.from}'` : id === 'rogue' ? `${lab.rogue.name}'` : L.imageName(lab, id.slice(6)));

  const commit = (id, node) => {
    setHold(null);
    setLab((s) => {
      let next;
      if (id === 'leader') next = L.setVector(s, node);
      else if (id === 'rogue') next = L.fixRogue(s, node);
      else next = L.place(s, id.slice(6), node);
      if (next.last && next.last.kind !== 'equal' && next.last.kind !== 'leader') setShake((n) => n + 1);
      return next;
    });
  };

  /* ── gestes : glisser depuis un drone, toucher-toucher, clavier ── */
  const drag = useRef(null);
  const toNode = (cx, cy) => {
    const box = sceneRef.current?.getBoundingClientRect();
    if (!box) return [0, 0];
    const [x, y] = geo.fromPx(cx - box.left, cy - box.top);
    return L.nodeNear(lab, x, y);
  };
  const onGrabDown = (g) => (e) => {
    if (e.button > 0) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { id: g.id, sx: e.clientX, sy: e.clientY, moved: false };
  };
  const onGrabMove = (e) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return;
    d.moved = true;
    setHold({ id: d.id, cursor: toNode(e.clientX, e.clientY), mode: 'drag' });
  };
  const onGrabUp = (g) => (e) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (d.moved) { commit(g.id, toNode(e.clientX, e.clientY)); return; }
    // un toucher : choisir ce drone, le reposer, ou poser celui qu'on tient sur ce nœud
    if (hold && hold.id === g.id) setHold(null);
    else if (hold) commit(hold.id, g.at);
    else setHold({ id: g.id, cursor: g.at, mode: 'select' });
  };
  const onSceneUp = (e) => {
    if (!hold || hold.mode === 'drag') return;
    commit(hold.id, toNode(e.clientX, e.clientY));
  };
  const onGrabKey = (g) => (e) => {
    const mine = hold && hold.id === g.id;
    const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (m && mine) { e.preventDefault(); setHold((h) => ({ ...h, cursor: L.nudge(lab, h.cursor, m[0], m[1]), mode: 'key' })); return; }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (mine) commit(g.id, hold.cursor);
      else setHold({ id: g.id, cursor: g.at, mode: 'key' });
      return;
    }
    if (e.key === 'Escape' && hold) { e.preventDefault(); setHold(null); }
  };

  /* ── lectures : la flèche de référence, la flèche tenue, les voyants ── */
  const held = hold ? byId(hold.id) : null;
  const heldVec = held ? [hold.cursor[0] - held.origin[0], hold.cursor[1] - held.origin[1]] : null;
  const liveCmp = held && hold.id !== 'leader' && u ? L.compare(u, heldVec) : null;
  const refVec = hold?.id === 'leader' ? heldVec : u;
  const refName = act1 ? `${tb.from}${tb.toName}` : `${tb.from}${tb.from}'`;
  const lenTex = (v) => {
    const l = L.lengthOf(v);
    return l.exact ? l.latex : `${l.latex} \\approx ${L.approx(l.value).replace(',', '{,}')}`;
  };
  const showLamps = !act1 && !!liveCmp; // متقدم : pas de voyants pendant le geste (autonomie)

  /* ── le verdict du dernier essai ── */
  const last = lab.last;
  const verdict = (() => {
    if (!last) return null;
    if (last.kind === 'leader') return k('vLeader', { len: `$${lenTex(last.u)}$` });
    if (last.kind === 'noVector') return k('vNoVector');
    if (last.kind === 'outside') return k('vOutside', { name: PRIME(last.name) });
    if (last.kind === 'tooFar') return k('vTooFar');
    if (last.kind === 'outsideNode') return k('vOutsideNode');
    const p = last.from; const q = last.name ?? `${p}'`;
    const ref = last.rogue ? `${tb.from}${tb.from}'` : refName;
    const o = {
      p: PRIME(p), q: PRIME(q), PQ: VEC(`${p}${q}`), REF: VEC(ref), pqText: PRIME(`${p}${q}`), refText: PRIME(ref),
      len: `$${lenTex(last.v)}$`, lenRef: `$${lenTex(last.u)}$`,
    };
    return k(`v_${last.kind}`, o);
  })();
  const rogueNote = rogue && !rogue.fixed ? k('rogueIn', { r: PRIME(lab.rogue.name), RR: VEC(`${lab.rogue.name}${lab.rogue.name}'`) }) : null;

  /* ── la découverte : des distracteurs réfutés par ce que l'élève a vu ── */
  const discoveryOptions = useMemo(() => (act1 ? [
    { text: <MathText>{k('dAct1Right')}</MathText>, correct: true },
    { text: <MathText>{k('dAct1Direction')}</MathText>, why: <MathText>{k('dAct1DirectionWhy')}</MathText> },
    { text: <MathText>{k('dAct1TwoPoints')}</MathText>, why: <MathText>{k('dAct1TwoPointsWhy')}</MathText> },
    { text: <MathText>{k('dAct1Each')}</MathText>, why: <MathText>{k('dAct1EachWhy')}</MathText> },
  ] : [
    { text: <MathText>{k('dShowLength')}</MathText>, why: <MathText>{k('dShowLengthWhy', { r: PRIME(lab.rogue.name) })}</MathText> },
    { text: <MathText>{k('dShowRight')}</MathText>, correct: true },
    { text: <MathText>{k('dShowParallel')}</MathText>, why: <MathText>{k('dShowParallelWhy', { r: PRIME(lab.rogue.name) })}</MathText> },
    { text: <MathText>{k('dShowEach')}</MathText>, why: <MathText>{k('dShowEachWhy')}</MathText> },
  ]), [act1, k, lab.rogue]);

  const pg = !act1 ? L.parallelogram(lab, 0) : null;
  const formal = act1 ? (
    <div className="space-y-2" data-tg-formal>
      {lab.tableaux.map((x) => (
        <EquationDisplay key={x.id} tone="result" size="sm"
          tex={[`\\overrightarrow{${x.from}${x.toName}}`, ...x.place.map(([f, n]) => `\\overrightarrow{${f}${n}}`)].join(' = ')} />
      ))}
      <p className="text-sm text-emerald-900"><MathText>{k('fAct1')}</MathText></p>
    </div>
  ) : (
    <div className="space-y-2" data-tg-formal>
      <EquationDisplay tone="result"
        tex={`${[tb.from, ...L.toPlace(lab, 0), lab.rogue.name].map((n) => `\\overrightarrow{${n}${n}'}`).join(' = ')} = \\vec{u}`} />
      <p className="text-sm text-emerald-900"><MathText>{k('fShow', { len: u ? `$${lenTex(u)}$` : '' })}</MathText></p>
      {pg && <p className="text-sm text-emerald-900"><MathText>{k(pg.flat ? 'fFlat' : 'fParallelogram', { abba: pg.names.map(PRIME).join('') })}</MathText></p>}
    </div>
  );

  /* ── les étapes : `show` = la formation, puis le drone égaré ; `act1` = un tableau (une translation) par étape ── */
  const [answered, setAnswered] = useState({ epoch: state.epoch, ids: {} });
  const ans = answered.epoch === state.epoch ? answered.ids : {};
  const formationDone = !act1 && L.imagesDone(lab, 0);
  const showId = !act1 && formationDone && !ans.show0 ? 'show0' : 'show1';
  const stepId = act1 ? `t${lab.t}` : showId;
  const phase = act1 ? 0 : showId === 'show0' ? 0 : 1;
  const reachedNow = act1 ? L.tableauDone(lab) : showId === 'show0' ? formationDone : L.tableauDone(lab, 0);
  const nSteps = act1 ? lab.tableaux.length : 2;
  const chain = cpActive ? chainOf(lab, stepId) : null;
  const cp = useLabCheckpoint({
    id: chain ? stepId : null,
    questions: chain && reachedNow ? chain.map((q) => QUESTIONS[q](lab, k, { options: discoveryOptions, prompt: act1 ? 'dPromptAct1' : 'dPromptShow', formal })) : null,
    reached: reachedNow,
    resetKey: state.epoch,
    onRetry: () => setLab((s) => L.restartStep(s, phase)),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setAnswered((a) => ({ epoch: state.epoch, ids: { ...(a.epoch === state.epoch ? a.ids : {}), [id]: true } }));
      if (chain.includes('rule')) { state.discover(); state.formalize(); }
    },
  });
  const stepDone = act1
    ? lab.tableaux.map((_, i) => L.tableauDone(lab, i) && (i !== lab.t || !cp.blocking))
    : [formationDone && (!cpActive || !!ans.show0), L.tableauDone(lab, 0) && (!cp.blocking || !cpActive)];
  const curStep = act1 ? lab.t : (stepDone[0] ? 1 : 0);
  const party = useStepCelebration();
  const celebrated = useRef({ epoch: state.epoch, set: new Set() });
  if (celebrated.current.epoch !== state.epoch) celebrated.current = { epoch: state.epoch, set: new Set() };
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.set.has(i)) return;
      celebrated.current.set.add(i);
      party.celebrate({ n: i + 1, total: nSteps });
    });
  }, [stepDone.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son : un déclic par image acceptée, « over » pour un refus, le drapeau quand une étape est faite
  const doneN = stepDone.filter(Boolean).length;
  const sfx = useRef({ n: nTrials, d: doneN, epoch: state.epoch });
  useEffect(() => {
    const p = sfx.current;
    if (p.epoch !== state.epoch) { sfx.current = { n: nTrials, d: doneN, epoch: state.epoch }; return; }
    if (nTrials > p.n) playSfx(lab.trials[nTrials - 1]?.ok === false ? 'over' : 'tooth');
    if (doneN > p.d) playSfx('flag');
    sfx.current = { n: nTrials, d: doneN, epoch: state.epoch };
  }, [nTrials, doneN, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps

  const missionText = mission ?? <MathText>{k(act1 ? 'missionAct1' : 'missionShow')}</MathText>;
  const hintKeys = act1 ? ['hintA1', 'hintA2', 'hintA3'] : ['hintS1', 'hintS2', 'hintS3'];
  const todo = L.toPlace(lab);

  /* ── la télécommande (lectures, voyants, verdict) ── */
  const panel = (
    <div className={`flex min-w-0 flex-col gap-1.5 rounded-2xl border-2 border-slate-700 bg-slate-900 p-2 text-slate-100 ${side ? '' : 'w-full'}`}
      style={side ? { width: panelW } : undefined} data-tg-panel>
      <div className="flex items-center gap-1.5">
        <span className="truncate text-[11px] font-bold text-cyan-300">{k('appName')}</span>
        <Deco led={led} onTap={() => { setLed((n) => n + 1); setBurst((b) => b + 1); }} />
      </div>
      {act1 && (
        <div className="grid grid-cols-2 gap-1" role="group" aria-label={k('tabsLabel')} data-tg-tabs>
          {lab.tableaux.map((x, i) => {
            const done = L.tableauDone(lab, i);
            return (
              <button key={x.id} type="button" onClick={() => { setHold(null); setLab((s) => L.goTo(s, i)); }}
                aria-pressed={i === lab.t} data-tg-tab={x.id} data-done={done ? 'true' : 'false'}
                aria-label={k('tabAria', { from: x.from, to: PRIME(x.toName) })}
                className={`min-h-[44px] rounded-lg border px-1 text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${i === lab.t ? 'border-cyan-300 bg-cyan-900/60 text-white' : 'border-slate-600 bg-slate-800 text-slate-300'}`}>
                <bdi dir="ltr" className="font-mono">{`${x.from} ↦ ${PRIME(x.toName)}`}</bdi>{done ? ' ✓' : ''}
              </button>
            );
          })}
        </div>
      )}
      <div className={`rounded-lg bg-slate-800 px-2 py-1 ${narrow ? 'text-[11px]' : 'text-xs'} leading-snug`} data-tg-reading aria-live="polite">
        {refVec && (refVec[0] !== 0 || refVec[1] !== 0) ? (
          <>
            <p className="font-bold text-cyan-200"><MathText>{k('refTitle', { REF: VEC(hold?.id === 'leader' ? `${tb.from}${tb.from}'` : refName) })}</MathText></p>
            <p><MathText>{k('refDirection', { line: PRIME(hold?.id === 'leader' ? `${tb.from}${tb.from}'` : refName) })}</MathText></p>
            <p><MathText>{k('refSense', { a: PRIME(tb.from), b: PRIME(hold?.id === 'leader' || !act1 ? `${tb.from}'` : tb.toName) })}</MathText></p>
            <p><MathText>{k('refLength', { len: `$${tf(lenTex(refVec))}$` })}</MathText></p>
          </>
        ) : <p className="text-slate-300"><MathText>{k(act1 ? 'refWaitAct1' : 'refWaitShow')}</MathText></p>}
      </div>
      {!act1 && (
        <div className="flex flex-wrap gap-1" data-tg-lamps={showLamps ? 'on' : 'off'}>
          {['direction', 'sense', 'length'].map((el) => {
            const on = showLamps ? (el === 'sense' ? liveCmp.sense === true : liveCmp[el] === true) : null;
            return (
              <span key={el} data-tg-lamp={el} data-on={on == null ? '' : String(on)}
                className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${on == null ? 'bg-slate-800 text-slate-400' : on ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/25 text-rose-200'}`}>
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${on == null ? 'bg-slate-500' : on ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                {k(`lamp_${el}`)}{on == null ? '' : on ? ' ✓' : ' ✗'}
              </span>
            );
          })}
        </div>
      )}
      <ul className="flex flex-wrap gap-1" data-tg-todo>
        {todo.map((from) => {
          const ok = !!placedNow[from];
          return (
            <li key={from} className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${ok ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-800 text-slate-300'}`}>
              <bdi dir="ltr" className="font-mono">{ok ? `${from} ↦ ${PRIME(L.imageName(lab, from))}` : `${from} ↦ ?`}</bdi>
            </li>
          );
        })}
      </ul>
      <p role="status" className={`min-h-[2.5rem] rounded-lg bg-white px-2 py-1 ${narrow ? 'text-[11px]' : 'text-xs'} font-bold leading-snug ${last?.kind === 'equal' || last?.kind === 'leader' ? 'text-emerald-800' : last ? 'text-rose-800' : 'text-slate-600'}`}
        data-tg-verdict={last?.kind ?? ''}>
        <MathText>{rogueNote && (!last || last.kind === 'equal' || last.kind === 'leader') ? rogueNote : (verdict ?? k(act1 ? 'waitingAct1' : 'waitingShow'))}</MathText>
      </p>
    </div>
  );

  return (
    <ManipulationShell
      type="translation-glide"
      title={title ?? k('title')}
      mission={missionText}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided={cpActive}
      hints={hintKeys.map((h) => <MathText key={h}>{k(h)}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={(
        <ManipulationDiscovery state={state} prompt={<MathText>{k(act1 ? 'dPromptAct1' : 'dPromptShow')}</MathText>} options={discoveryOptions} formal={formal} />
      )}
      explanation={<MathText>{k(act1 ? 'explanationAct1' : 'explanationShow')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-slate-100 to-white !p-3" minHeight="min-h-[160px]" dragging={hold?.mode === 'drag'}>
        <div ref={boxRef} className={`relative space-y-2 ${cp.open ? 'min-h-[620px]' : ''}`} data-translation-glide data-scene={lab.scene} data-world={theme}
          data-solved={ready ? 'true' : 'false'} data-tableau={tb.id} data-scene-h={sceneH}>
          {party.node}
          {cp.node}
          <LabStepper count={nSteps} current={curStep} done={stepDone} stepAttr="data-tg-step" />
          <div ref={glanceRef} className={`flex ${side ? 'flex-row items-start' : 'flex-col items-center'} justify-center gap-2`} data-tg-glance>
            <div ref={sceneRef} className="relative shrink-0 overflow-hidden rounded-xl" style={{ width: sceneW, height: sceneH, touchAction: 'none' }}
              onPointerUp={onSceneUp} data-tg-scene data-cell={Math.round(geo.cell)}>
              <Sky geo={geo} lab={lab} portrait={portrait} burst={burst} reduce={reduce} />
              <Figure geo={geo} lab={lab} r={r} led={led} hold={hold} held={held} liveCmp={liveCmp} act1={act1} glide={glide} reduce={reduce}
                pg={!act1 && L.imagesDone(lab, 0) ? pg : null} shake={shake} />
              {grabbables.map((g) => {
                const [px, py] = geo.toPx(g.at);
                const mine = hold?.id === g.id;
                return (
                  <button key={g.id} type="button" data-tg-grab={g.id}
                    aria-label={k(g.id === 'leader' ? 'grabLeader' : g.id === 'rogue' ? 'grabRogue' : 'grabDrone', { name: PRIME(g.name), image: PRIME(nameOfImage(g.id)) })}
                    aria-pressed={mine}
                    onPointerDown={onGrabDown(g)} onPointerMove={onGrabMove} onPointerUp={onGrabUp(g)} onPointerCancel={() => { drag.current = null; }}
                    onKeyDown={onGrabKey(g)}
                    className={`absolute flex h-11 w-11 items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-cyan-300 ${mine ? 'ring-4 ring-amber-300' : ''}`}
                    style={{ left: px - 22, top: py - 22, touchAction: 'none', cursor: drag.current ? 'grabbing' : 'grab' }} />
                );
              })}
            </div>
            {panel}
          </div>

          {lab.trials.length > 0 && (
            <LabFold id="translation-glide.trials" title={k('trialsTitle')} defaultOpen={false}>
              <ul className="space-y-0.5 text-xs" data-tg-trials={lab.trials.length}>
                {lab.trials.map((x) => (
                  <li key={x.n} className={x.ok ? 'text-emerald-800' : 'text-rose-800'} data-kind={x.kind}>
                    <MathText>{x.leader
                      ? k('trialLeader', { n: x.n, len: `$${lenTex(x.u)}$` })
                      : k('trialRow', { n: x.n, PQ: VEC(`${x.from}${x.name}`), verdict: k(`t_${x.kind}`) })}</MathText>
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

/* ── le ciel : nuit, étoiles, la baie d'Alger, le minaret de جامع الجزائر, la foule aux téléphones (décor) ── */
function Sky({ geo, portrait, burst, reduce }) {
  const { width, height } = geo;
  const seaTop = geo.oy + geo.gh + geo.cell * 0.15;
  const stars = useMemo(() => Array.from({ length: 26 }, (_, i) => [((i * 37) % 100) / 100, ((i * 53) % 61) / 100, i % 3]), []);
  const mx = portrait ? Math.min(width - 12, geo.ox + geo.gw + (width - geo.ox - geo.gw) * 0.6) : width * 0.86;
  // des identifiants UNIQUES : les deux niveaux du workspace montent chacun un ciel, et le niveau caché
  // (display: none) rendrait son dégradé invisible s'il portait le même id
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg width={width} height={height} className="absolute inset-0" aria-hidden="true" focusable="false" data-deco="sky">
      <defs>
        <linearGradient id={`tg-night-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#020617" /><stop offset="0.7" stopColor="#1E1B4B" /><stop offset="1" stopColor="#312E81" />
        </linearGradient>
        <linearGradient id={`tg-sea-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0C4A6E" /><stop offset="1" stopColor="#082F49" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#tg-night-${uid})`} />
      {stars.map(([x, y, s], i) => <circle key={i} cx={x * width} cy={y * seaTop} r={s === 0 ? 1.4 : 0.8} fill="#E0E7FF" opacity={s === 2 ? 0.45 : 0.8} />)}
      <circle cx={portrait ? 18 : width * 0.08} cy={16} r={8} fill="#FEF9C3" opacity={0.85} />
      {/* la baie : la mer, la côte et ses lumières, le minaret de جامع الجزائر (silhouette) */}
      <rect x={0} y={seaTop} width={width} height={Math.max(0, height - seaTop)} fill={`url(#tg-sea-${uid})`} />
      <path d={`M0 ${seaTop} Q ${width * 0.5} ${seaTop - 7} ${width} ${seaTop}`} fill="#0F172A" opacity={0.85} />
      {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={(i + 0.5) * (width / 14)} cy={seaTop - 2 + (i % 2)} r={1.1} fill="#FDE68A" opacity={0.7} />)}
      <Minaret x={mx} base={seaTop} h={Math.min(66, Math.max(34, geo.gh * 0.42))} />
      {/* la foule qui filme (téléphones allumés) */}
      {Array.from({ length: Math.max(4, Math.floor(width / 26)) }, (_, i) => {
        const x = 8 + i * 26; const y = height - 4;
        return (
          <g key={i}>
            <circle cx={x} cy={y - 9} r={4.5} fill="#020617" />
            <rect x={x - 6} y={y - 5} width={12} height={8} rx={3} fill="#020617" />
            {i % 2 === 0 && <rect x={x + 3} y={y - 19} width={4} height={6} rx={1} fill="#A5F3FC" opacity={0.9} />}
          </g>
        );
      })}
      {burst > 0 && !reduce && (
        <g key={burst} className="tg-burst" style={{ transformOrigin: `${width * 0.5}px ${seaTop * 0.35}px` }}>
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return <line key={i} x1={width * 0.5} y1={seaTop * 0.35} x2={width * 0.5 + Math.cos(a) * 22} y2={seaTop * 0.35 + Math.sin(a) * 22} stroke={LED[(burst + i) % 4][0]} strokeWidth={2} strokeLinecap="round" />;
          })}
        </g>
      )}
      <style>{'.tg-burst{animation:tg-burst .9s ease-out 1 forwards}@keyframes tg-burst{0%{opacity:1;transform:scale(.2)}100%{opacity:0;transform:scale(1.4)}}@media (prefers-reduced-motion: reduce){.tg-burst{animation:none;opacity:0}}'}</style>
    </svg>
  );
}

/** Le minaret de جامع الجزائر, en silhouette : fût carré strié, deux galeries, la lanterne allumée, la flèche. Décor. */
function Minaret({ x, base, h }) {
  const w = Math.max(6, h * 0.12);
  const top = base - h;
  return (
    <g data-deco="minaret">
      <rect x={x - w * 0.7} y={base - h * 0.12} width={w * 1.4} height={h * 0.12} fill="#0B1120" />
      <rect x={x - w / 2} y={top + h * 0.16} width={w} height={h * 0.74} fill="#0B1120" />
      {[0.3, 0.5, 0.7].map((f) => <line key={f} x1={x - w / 2 + 1} x2={x + w / 2 - 1} y1={top + h * f} y2={top + h * f} stroke="#1E293B" strokeWidth={1} />)}
      <line x1={x} x2={x} y1={top + h * 0.2} y2={top + h * 0.86} stroke="#334155" strokeWidth={0.8} />
      <rect x={x - w * 0.75} y={top + h * 0.14} width={w * 1.5} height={h * 0.04} fill="#0B1120" />
      <rect x={x - w * 0.42} y={top + h * 0.05} width={w * 0.84} height={h * 0.09} fill="#FDE68A" opacity={0.85} />
      <rect x={x - w * 0.55} y={top + h * 0.03} width={w * 1.1} height={h * 0.03} fill="#0B1120" />
      <line x1={x} x2={x} y1={top - h * 0.08} y2={top + h * 0.03} stroke="#0B1120" strokeWidth={1.6} />
      <circle cx={x} cy={top - h * 0.09} r={1.4} fill="#FDE68A" />
    </g>
  );
}

/* ── la figure : la grille, les drones, les flèches, les images, le drone égaré ── */
function Arrow({ from, to, color, width = 3, dashed = false, head = 9, data }) {
  const dx = to[0] - from[0]; const dy = to[1] - from[1]; const l = Math.hypot(dx, dy);
  if (l < 1) return null;
  const ux = dx / l; const uy = dy / l;
  const bx = to[0] - ux * head; const by = to[1] - uy * head;
  return (
    <g data-tg-arrow={data}>
      <line x1={from[0]} y1={from[1]} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? '6 5' : undefined} />
      <path d={`M${to[0]} ${to[1]} L${bx - uy * head * 0.55} ${by + ux * head * 0.55} L${bx + uy * head * 0.55} ${by - ux * head * 0.55} Z`} fill={color} />
    </g>
  );
}

function DroneIcon({ x, y, r, color, glow, dim = false, rogue = false }) {
  const s = r * 0.62;
  return (
    <g opacity={dim ? 0.55 : 1}>
      <circle cx={x} cy={y} r={r * 1.25} fill={glow} opacity={0.25} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => (
        <g key={i}>
          <line x1={x} y1={y} x2={x + a * s} y2={y + b * s} stroke="#CBD5E1" strokeWidth={1.4} />
          <ellipse cx={x + a * s} cy={y + b * s} rx={r * 0.42} ry={r * 0.16} fill="#E2E8F0" opacity={0.85} />
        </g>
      ))}
      <circle cx={x} cy={y} r={r * 0.5} fill={rogue ? '#F43F5E' : color} stroke="#F8FAFC" strokeWidth={1.2} />
    </g>
  );
}

function Figure({ geo, lab, r, led, hold, held, liveCmp, act1, glide, reduce, pg, shake }) {
  const { width, height, cell } = geo;
  const [gw, gh] = lab.grid;
  const [ledA, ledB] = LED[led % LED.length];
  const tx = { direction: 'ltr', unicodeBidi: 'isolate' };
  const P = (p) => geo.toPx(p);
  const tb = L.tableau(lab);
  const u = tb.u;
  const label = (name, p, dx = 1, dy = -1, color = '#F8FAFC') => {
    const [x, y] = P(p);
    return <text x={x + dx * (r + 4)} y={y + dy * (r + 2)} textAnchor="middle" fontSize={Math.max(11, Math.min(15, cell * 0.36))} fontWeight={800} fill={color} style={tx}>{PRIME(name)}</text>;
  };
  // la droite porteuse (المنحى) de la flèche de référence, en pointillés à travers le ciel
  const carrier = (a, b, color) => {
    const [x1, y1] = P(a); const [x2, y2] = P(b);
    const dx = x2 - x1; const dy = y2 - y1; const l = Math.hypot(dx, dy) || 1;
    const e = Math.hypot(width, height);
    return <line data-tg-carrier x1={x1 - (dx / l) * e} y1={y1 - (dy / l) * e} x2={x1 + (dx / l) * e} y2={y1 + (dy / l) * e} stroke={color} strokeWidth={1.4} strokeDasharray="3 6" opacity={0.6} />;
  };
  const refColor = '#FBBF24';
  const ok = '#34D399';
  const glideOn = (t) => glide.n > 0 && glide.t === t && !reduce;
  const last = lab.last;
  const refused = last && !last.ok && last.v && last.to && last.kind !== 'leader' ? last : null;

  return (
    <svg width={width} height={height} className="absolute inset-0" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
      <style>{'.tg-glide{animation:tg-glide .95s cubic-bezier(.2,.8,.2,1) 1 both}@keyframes tg-glide{0%{transform:translate(var(--dx),var(--dy));opacity:.35}100%{transform:translate(0,0);opacity:1}}.tg-shake{animation:tg-shake .35s ease-in-out 1}@keyframes tg-shake{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}@media (prefers-reduced-motion: reduce){.tg-glide,.tg-shake{animation:none}}'}</style>
      {/* la grille lumineuse du spectacle (le quadrillage du manuel) */}
      <g stroke="#6366F1" strokeWidth={0.8} opacity={0.45}>
        {Array.from({ length: gw + 1 }, (_, i) => { const [x, y0] = P([i, gh]); const [, y1] = P([i, 0]); return <line key={`v${i}`} x1={x} y1={y0} x2={x} y2={y1} />; })}
        {Array.from({ length: gh + 1 }, (_, j) => { const [x0, y] = P([0, j]); const [x1] = P([gw, j]); return <line key={`h${j}`} x1={x0} y1={y} x2={x1} y2={y} />; })}
      </g>
      {/* la balise du plan (مبتدئ) : une orientation, pas une réponse */}
      {!act1 && lab.beacon && !u && (() => {
        const [x, y] = P(lab.beacon);
        return <g data-tg-beacon><circle cx={x} cy={y} r={r * 0.9} fill="none" stroke="#FDE68A" strokeWidth={1.6} strokeDasharray="3 3" /><text x={x} y={y + 4} textAnchor="middle" fontSize={12} fill="#FDE68A">★</text></g>;
      })()}
      {/* les tableaux déjà faits (متقدم) : les triangles images, en filigrane, comme dans la figure du manuel */}
      {act1 && lab.tableaux.map((x, i) => (L.imagesDone(lab, i) && i !== lab.t ? (
        <polygon key={x.id} points={['A', 'B', 'C'].map((n) => P([lab.drones[n][0] + x.u[0], lab.drones[n][1] + x.u[1]]).join(',')).join(' ')}
          fill="#2DD4BF" opacity={0.18} stroke="#5EEAD4" strokeWidth={1} />
      ) : null))}
      {/* le triangle ABC (متقدم) */}
      {act1 && <polygon points={['A', 'B', 'C'].map((n) => P(lab.drones[n]).join(',')).join(' ')} fill="#2DD4BF" opacity={0.28} stroke="#99F6E4" strokeWidth={1.4} />}
      {/* le parallélogramme ABB′A′ (مبتدئ, formation complète) */}
      {pg && <polygon data-tg-parallelogram data-flat={pg.flat ? 'true' : 'false'} points={pg.points.map((p) => P(p).join(',')).join(' ')} fill="#A78BFA" opacity={0.22} stroke="#C4B5FD" strokeWidth={1.6} />}
      {/* la droite porteuse de u */}
      {u && carrier(lab.drones[tb.from], [lab.drones[tb.from][0] + u[0], lab.drones[tb.from][1] + u[1]], refColor)}
      {hold?.id === 'leader' && held && (hold.cursor[0] !== held.origin[0] || hold.cursor[1] !== held.origin[1]) && carrier(held.origin, hold.cursor, '#7DD3FC')}
      {/* la flèche de référence (meneur ou couple donné) et son image */}
      {u && <Arrow from={P(lab.drones[tb.from])} to={P([lab.drones[tb.from][0] + u[0], lab.drones[tb.from][1] + u[1]])} color={refColor} width={3.4} data="ref" />}
      {/* les images posées, avec leurs flèches ; la formation complète glisse d'un bloc */}
      <g key={`g${glide.n}-${lab.t}`}>
        {L.toPlace(lab).filter((f) => L.placedIn(lab)[f]).map((f) => {
          const o = P(lab.drones[f]); const im = P(L.imageOf(lab, f));
          return (
            <g key={f} data-tg-image={L.imageName(lab, f)}>
              <Arrow from={o} to={im} color={ok} width={2.6} data="image" />
              <g className={glideOn(lab.t) ? 'tg-glide' : undefined} style={{ '--dx': `${o[0] - im[0]}px`, '--dy': `${o[1] - im[1]}px` }}>
                <DroneIcon x={im[0]} y={im[1]} r={r * 0.85} color={ledB} glow={ledA} />
              </g>
              {label(L.imageName(lab, f), L.imageOf(lab, f), 1, -1, '#A7F3D0')}
            </g>
          );
        })}
        {u && (() => {
          const im = [lab.drones[tb.from][0] + u[0], lab.drones[tb.from][1] + u[1]];
          const [x, y] = P(im); const o = P(lab.drones[tb.from]);
          return (
            <g data-tg-image={tb.toName}>
              <g className={glideOn(lab.t) ? 'tg-glide' : undefined} style={{ '--dx': `${o[0] - x}px`, '--dy': `${o[1] - y}px` }}>
                <DroneIcon x={x} y={y} r={r * 0.85} color={act1 ? '#FBBF24' : ledB} glow={act1 ? '#FDE68A' : ledA} />
              </g>
              {label(tb.toName, im, -1, -1, '#FDE68A')}
            </g>
          );
        })()}
      </g>
      {/* la dernière flèche refusée reste en rose */}
      {refused && refused.from !== tb.from && (() => {
        const o = refused.rogue && lab.rogue?.at ? lab.rogue.at : lab.drones[refused.from];
        if (!o) return null;
        return <Arrow from={P(o)} to={P(refused.to)} color="#FB7185" width={2.4} dashed data="refused" />;
      })()}
      {/* le drone égaré (مبتدئ) */}
      {lab.scene === 'show' && L.rogueArrow(lab) && (() => {
        const ra = L.rogueArrow(lab);
        const [x, y] = P(ra.at);
        return (
          <g data-tg-rogue data-fixed={ra.fixed ? 'true' : 'false'}>
            <Arrow from={[x, y]} to={P(ra.tip)} color={ra.fixed ? ok : '#F43F5E'} width={2.6} data="rogue" />
            <g className={!ra.fixed && shake ? 'tg-shake' : undefined} key={`r${shake}`}>
              <DroneIcon x={x} y={y} r={r} color={ledA} glow={ra.fixed ? ledA : '#FDA4AF'} rogue={!ra.fixed} />
            </g>
            {label(lab.rogue.name, ra.at, -1, -1, ra.fixed ? '#F8FAFC' : '#FDA4AF')}
            {!ra.fixed && <circle cx={P(ra.tip)[0]} cy={P(ra.tip)[1]} r={r * 0.55} fill="#F43F5E" opacity={0.6} />}
            {ra.fixed && (
              <g data-tg-image={`${lab.rogue.name}'`}>
                <DroneIcon x={P(ra.tip)[0]} y={P(ra.tip)[1]} r={r * 0.85} color={ledB} glow={ledA} />
                {label(`${lab.rogue.name}'`, ra.tip, 1, -1, '#A7F3D0')}
              </g>
            )}
          </g>
        );
      })()}
      {/* les drones (originaux) */}
      {Object.entries(lab.drones).map(([name, p]) => {
        const [x, y] = P(p);
        const active = act1 ? (name === tb.from || L.toPlace(lab).includes(name)) : true;
        const isShake = refused && refused.from === name && !refused.rogue;
        return (
          <g key={name} data-tg-drone={name}>
            <g className={isShake ? 'tg-shake' : undefined} key={`s${shake}`}>
              <DroneIcon x={x} y={y} r={r} color={ledA} glow={ledA} dim={!active} />
            </g>
            {label(name, p, 1, 1)}
          </g>
        );
      })}
      {/* le geste en cours : la flèche tenue et le drone fantôme au nœud visé */}
      {hold && held && (hold.cursor[0] !== held.origin[0] || hold.cursor[1] !== held.origin[1]) && (() => {
        const color = hold.id === 'leader' ? '#7DD3FC' : act1 || !liveCmp ? '#E2E8F0' : liveCmp.equal ? ok : '#FDBA74';
        const [x, y] = P(hold.cursor);
        return (
          <g data-tg-arrow="held">
            <Arrow from={P(held.origin)} to={[x, y]} color={color} width={2.8} dashed />
            <circle cx={x} cy={y} r={r * 0.9} fill="none" stroke={color} strokeWidth={2} />
          </g>
        );
      })()}
      {hold && held && (hold.mode === 'key' || hold.mode === 'select') && (() => {
        const [x, y] = P(hold.cursor);
        return <rect x={x - cell / 2} y={y - cell / 2} width={cell} height={cell} fill="none" stroke="#FDE68A" strokeWidth={2} rx={4} data-tg-cursor />;
      })()}
    </svg>
  );
}

/** La télécommande du spectacle : le bouton « couleur » change la couleur des LED. Décor seulement. */
function Deco({ led, onTap }) {
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" data-deco="remote" onClick={onTap}
      className="ms-auto inline-flex h-8 w-14 shrink-0 items-center justify-center gap-1 rounded-full bg-slate-800 focus:outline-none">
      {LED.map(([c], i) => <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c, opacity: i === led % LED.length ? 1 : 0.35 }} />)}
    </button>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

const $ = (s) => `$${s}$`;
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;

/** La suite de questions de l'étape `stepId` : `show0` la formation · `show1` le drone égaré · `t<i>` le tableau i du نشاط. */
export function chainOf(lab, stepId) {
  const last = L.allDone(lab) ? ['rule'] : [];
  if (stepId === 'show0') return ['leaderShift', 'follower', 'same'];
  if (stepId === 'show1') return ['rogueWhy', ...last];
  return lab.t === 0 ? ['shift', 'all3', ...last] : ['shift', 'vsFirst', ...last];
}

const axisOf = (u) => (u[0] !== 0 ? 'h' : 'v');
const sameOptions = (k, o) => [
  { text: Mx(k, 'same.length'), why: Mx(k, 'same.whyLength', o) },
  { text: Mx(k, 'same.direction'), why: Mx(k, 'same.whyDirection', o) },
  { text: Mx(k, 'same.all'), correct: true },
];
const KINDS = ['direction', 'sense', 'senseLength', 'length'];

/** Chaque question est construite sur LES nombres de l'étape (rien en dur) ; `k` : les textes de `translationGlide`. */
export const QUESTIONS = {
  leaderShift: (lab, k) => {
    const tb = L.tableau(lab, 0); const ax = axisOf(tb.u);
    const n = Math.abs(ax === 'h' ? tb.u[0] : tb.u[1]);
    const o = { A: tb.from, A1: PRIME(`${tb.from}'`), axis: k(`cp.axis.${ax}`), AA: $(VEC(`${tb.from}${tb.from}'`)) };
    return {
      id: 'leaderShift', kind: 'number', expected: String(n), answer: <MathText>{$(String(n))}</MathText>,
      prompt: Mx(k, 'leaderShift.prompt', o), hints: [Mx(k, 'leaderShift.hint1', o), Mx(k, 'leaderShift.hint2', o)],
      explain: Mx(k, 'leaderShift.explain', { ...o, n: $(String(n)) }),
    };
  },
  follower: (lab, k) => {
    const tb = L.tableau(lab, 0); const ax = axisOf(tb.u);
    const n = Math.abs(ax === 'h' ? tb.u[0] : tb.u[1]);
    const [b, bi] = tb.place[0];
    const o = { B: b, B1: PRIME(bi), axis: k(`cp.axis.${ax}`), A: tb.from, A1: PRIME(`${tb.from}'`) };
    return {
      id: 'follower', kind: 'number', expected: String(n), answer: <MathText>{$(String(n))}</MathText>,
      prompt: Mx(k, 'follower.prompt', o), hints: [Mx(k, 'follower.hint1', o), Mx(k, 'follower.hint2', o)],
      explain: Mx(k, 'follower.explain', { ...o, n: $(String(n)) }),
    };
  },
  same: (lab, k) => {
    const tb = L.tableau(lab, 0);
    const arrows = [tb.from, ...tb.place.map(([f]) => f)].map((f) => $(VEC(`${f}${f}'`))).join(k('cp.and'));
    const o = { arrows };
    return {
      id: 'same', kind: 'choice',
      prompt: Mx(k, 'same.prompt', o), options: sameOptions(k, o),
      hints: [Mx(k, 'same.hint1'), Mx(k, 'same.hint2')],
      explain: Mx(k, 'same.explain', o),
    };
  },
  rogueWhy: (lab, k) => {
    const r = lab.rogue.name; const A = lab.tableaux[0].from;
    const o = { r: PRIME(r), RR: $(VEC(`${r}${r}'`)), AA: $(VEC(`${A}${A}'`)) };
    return {
      id: 'rogueWhy', kind: 'choice',
      prompt: Mx(k, 'rogueWhy.prompt', o),
      options: [
        { text: Mx(k, 'rogueWhy.length', o), why: Mx(k, 'rogueWhy.whyLength', o) },
        { text: Mx(k, 'rogueWhy.all', o), correct: true },
        { text: Mx(k, 'rogueWhy.parallel', o), why: Mx(k, 'rogueWhy.whyParallel', o) },
      ],
      hints: [Mx(k, 'rogueWhy.hint1', o), Mx(k, 'rogueWhy.hint2', o)],
      explain: Mx(k, 'rogueWhy.explain', o),
    };
  },
  shift: (lab, k) => {
    const tb = L.tableau(lab); const ax = axisOf(tb.u);
    const n = Math.abs(ax === 'h' ? tb.u[0] : tb.u[1]);
    const o = { A: tb.from, A1: PRIME(tb.toName), axis: k(`cp.axis.${ax}`), AA: $(VEC(`${tb.from}${tb.toName}`)) };
    return {
      id: 'shift', kind: 'number', expected: String(n), answer: <MathText>{$(String(n))}</MathText>,
      prompt: Mx(k, 'shift.prompt', o), hints: [Mx(k, 'shift.hint1', o), Mx(k, 'shift.hint2', o)],
      explain: Mx(k, 'shift.explain', { ...o, n: $(String(n)) }),
    };
  },
  all3: (lab, k) => {
    const tb = L.tableau(lab);
    const arrows = [`${tb.from}${tb.toName}`, ...tb.place.map(([f, n]) => `${f}${n}`)].map((x) => $(VEC(x))).join(k('cp.and'));
    const o = { arrows };
    return {
      id: 'all3', kind: 'choice',
      prompt: Mx(k, 'all3.prompt', o), options: sameOptions(k, o),
      hints: [Mx(k, 'same.hint1'), Mx(k, 'same.hint2')],
      explain: Mx(k, 'all3.explain', o),
    };
  },
  vsFirst: (lab, k) => {
    const first = lab.tableaux[0]; const tb = L.tableau(lab);
    const kind = L.compare(first.u, tb.u).kind;
    const o = { cur: $(VEC(`${tb.from}${tb.toName}`)), ref: $(VEC(`${first.from}${first.toName}`)) };
    const right = KINDS.indexOf(kind);
    const picked = [right, ...KINDS.map((_, i) => i).filter((i) => i !== right)].slice(0, 3);
    const order = picked.map((_, i) => picked[(i + lab.t) % 3]);   // la bonne réponse change de place d'un tableau à l'autre
    return {
      id: 'vsFirst', kind: 'choice',
      prompt: Mx(k, 'vsFirst.prompt', o),
      options: order.map((i) => (i === right
        ? { text: Mx(k, `vsFirst.${KINDS[i]}`), correct: true }
        : { text: Mx(k, `vsFirst.${KINDS[i]}`), why: Mx(k, 'vsFirst.why', o) })),
      hints: [Mx(k, 'vsFirst.hint1', o), Mx(k, 'vsFirst.hint2', o)],
      explain: Mx(k, `vsFirst.explain_${kind}`, o),
    };
  },
  rule: (lab, k, ctx) => ({
    id: 'rule', kind: 'choice',
    prompt: <MathText>{k(ctx.prompt)}</MathText>,
    options: ctx.options,
    hints: [Mx(k, `rule.${lab.scene === 'act1' ? 'act1' : 'show1'}`), Mx(k, 'rule.hint2')],
    explain: ctx.formal,
  }),
};
