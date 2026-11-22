import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import MathText from '../../components/MathText';
import * as ROT from '@smarter-academy/core/arithmetic/rotation.js';
import * as L from '../logic/lampRing';

/**
 * lamp-ring — LES LAMPADAIRES DU MASSIF (unité 13 « الدوران - الزوايا - المضلّعات المنتظمة », « أدمج تعلّماتي », وضعية p. 160 :
 * un حيّز دائري de rayon 3 m dans le jardin public de la commune, 6 أعمدة كهربائية متباعدة بنفس المسافة).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève fait GLISSER les poteaux sur le bord du massif (accrochés au cercle, au degré), puis — l'outil du دوران ouvert par
 *    lui — ne place que le DEUXIÈME poteau : chaque « دوّر » pose le suivant comme image du précédent ; enfin il choisit COMMENT
 *    calculer la distance entre deux poteaux voisins.
 * B. Idée : n points également espacés sur un cercle sont les images successives du premier par le دوران (O, 360°/n) — le
 *    دوران garde la distance au centre ET les écarts ; l'écart d se lit dans le triangle rectangle OHP₁ (H milieu de [P₁P₂]) :
 *    sin(α/2) = (d/2)/r, d = 2r·sin(180°/n) — exact pour n = 6 (r : triangles équilatéraux) et n = 4 (r√2).
 * C. Pendant le geste : les câbles entre poteaux voisins et leur longueur ; l'angle \widehat{P_1OP_2} fléché ; chaque poteau
 *    tourné arrive par un arc fléché ; le dernier écart, s'il diffère, en rouge ; le triangle OHP₁ et ses mesures.
 * D. La lecture écrit les écarts extrêmes, α et P₁P₂, puis d = 2 × r × sin(α/2) ; la règle : α = 360°/n, d = 2r·sin(180°/n).
 * E. Avant la règle : un tour allumé PAR LE دوران, la distance bien calculée, et un contraste (un refus, ou un tour à la main).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        n poteaux régulièrement espacés = sommets d'un polygone régulier : chacun image du précédent par (O, 360°/n) ;
 *                  la distance entre voisins se calcule dans le triangle rectangle (moitié de l'angle au centre, sinus)
 *   OBJECT         des lampadaires autour d'un massif de fleurs circulaire, la nuit, dans le jardin public de la commune
 *   VARIABLE       la place de chaque poteau (main) ; la place du DEUXIÈME poteau, donc α (دوران) ; le nombre n (extra)
 *   INVARIANT      la distance au centre (tous sur le bord) ; un دوران garde les écarts — toutes les images sont à la même distance
 *                  de leur voisine ; n·α = 360° pour refermer le tour
 *   TRANSFORMATION chaque glissement change deux écarts ; chaque « دوّر » ajoute un poteau à α du précédent
 *   CONSTRAINT     un poteau reste sur le bord ; le دوران part du premier poteau
 *   RESISTANCE     « أشعل » refuse des écarts inégaux en nommant le plus grand et le plus petit (en mètres) ; le tour par le دوران
 *                  reste OUVERT (dernier écart rouge, chiffré) si n·α ≠ 360°, et un poteau qui retombe sur le premier ou le dépasse
 *                  est refusé ; une carte fausse (l'arc 2πr/n, « d = r » hors hexagone, 2r·sin α) est refusée avec sa valeur
 *   EVIDENCE       les lampes s'allument ; la distance 3 m (n = 6), 2√2 ≈ 2,83 m (n = 4)
 *   CONTRAST       la main (inégal, refusé) contre le دوران (égal par construction) ; α juste contre α faux ; le câble contre l'arc
 *   PREDICTION     choisir la méthode de calcul AVANT de voir la distance écrite
 *   DISCOVERY      « chaque poteau est l'image du précédent par (O, 360°/n) ; d = 2r·sin(180°/n) »
 *   FORMALIZATION  α = 360°/n ; sin(α/2) = (d/2)/r ⇒ d = 2r·sin(180°/n) ; n = 6 : d = r
 *   TRANSFER       le إختبار أولي (8 lampadaires autour d'un rond-point d'Oran), « أتعمّق » (ex. 15 : cinq دورانات de 72°)
 *
 * Monde (`theme`) : `flower-bed` — le jardin public de la commune la nuit (lune, étoiles, allée pavée, bancs, lucioles, une
 * ado qui filme les lampes au téléphone : un toucher déclenche son flash). Le décor est `aria-hidden`, hors clavier,
 * `[data-deco]`, ne porte jamais une longueur ni une place ; immobile sous `prefers-reduced-motion`.
 * Manuel (§6bis) : chaque geste est un essai jugé ; « دوّر » pose UN poteau par appui (aucune auto-complétion).
 *
 * D'UN SEUL REGARD (§8bis) : le massif est un carré budgété sur l'écran de leçon (`useLessonViewport` moins ce que le bloc
 * `[data-lr-glance]` prend en plus du dessin) ; les poteaux se tiennent SUR le dessin, les boutons de phase, la lecture et le
 * verdict juste dessous ; la liste des essais est dans un `LabFold` SOUS le bloc mesuré.
 *
 * Props : `n`, `r` (à plat ou dans `numbers`, + `extra` : le nombre de poteaux proposé après la règle : deux puces, le n de la leçon ↔ l'extra — jamais un nombre libre qui passerait par les 8 poteaux du إختبار), `theme`, `title`,
 * `lead`, `mission`, `level`, `levels`, `onTrial(evidence)` à chaque geste jugé, `onFinished({ n, r, alpha, d })` à la règle —
 * tous par `state.report`.
 *
 * CONTRAT DOM : [data-lamp-ring][data-world][data-phase=hand|rotate|measure][data-lit=hand|rotate|''], [data-lr-glance],
 * [data-lr-plane], [data-lr-post=k][data-deg] (bouton : glisser, flèches, toucher puis toucher le bord), [data-lr-p2],
 * [data-lr-light], [data-lr-to-rotate], [data-lr-rotate], [data-lr-retry], [data-lr-to-hand], [data-lr-card=<id>],
 * [data-lr-reading], [data-lr-verdict=<kind>], [data-lr-free], [data-lab-fold=lamp-ring.trials], [data-deco].
 */
const C = { ok: '#34D399', ko: '#FB7185', live: '#C4B5FD', cable: '#FDE68A', post: '#CBD5E1' };
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = (k) => String(k).split('').map((d) => SUB[Number(d)]).join('');
const pairTex = ([i, j]) => `P_{${i + 1}}P_{${j + 1}}`;

export default function LampRing({
  n: n0, r: r0, extra: extra0, numbers: nums, title, lead, mission, level, levels: withLevels = true,
  initialMode = 'student', allowModeSwitch = false, checkpoints: cpOn = true, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.lampRing.${key}`, o), [t]);
  const initialNumbers = { n: n0 ?? nums?.n ?? 6, r: r0 ?? nums?.r ?? 3, ...((extra0 ?? nums?.extra) != null ? { extra: extra0 ?? nums?.extra } : {}) };
  const state = useManipulation({ type: 'lamp-ring', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { n, r, extra } = state.numbers;
  const make = () => L.init({ n, r });
  const [lab, setLab] = useState(make);
  const sceneKey = `${n}|${r}|${state.epoch}`;
  const [scene, setScene] = useState(sceneKey);
  const [drag, setDrag] = useState(null);
  const [selected, setSelected] = useState(null);
  const [inits, setInits] = useState(0);
  const [doneIds, setDoneIds] = useState({});
  // « إعادة », un autre niveau ou d'autres nombres : TOUT recommence — le massif, les essais, les questions du labo
  if (scene !== sceneKey) { setScene(sceneKey); setLab(make()); setDrag(null); setSelected(null); setInits((c) => c + 1); setDoneIds({}); }
  const [freeOpen, setFreeOpen] = useState(false);
  useEffect(() => { setFreeOpen(false); }, [state.resetCount]);
  const reduce = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  const ready = L.discoveryReady(lab);
  // les questions pendant le labo : obligatoires pour tout élève, l'enseignant seul les coupe pour SON compte (L2) ; la règle trouvée, le massif libre (n supplémentaire) n'en repose plus
  const cpSettings = useLabCheckpointSettings('lamp-ring');
  const cpLive = cpOn && cpSettings.enabled && !freeOpen;
  useEffect(() => { if (ready && !cpLive) state.discover(); }, [ready, state.epoch, cpLive]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!state.isFormal) return;
    setFreeOpen(true);
    state.report(onFinished, { n, r, alpha: 360 / n, d: L.dec(L.gap(n, r).number) });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (lab.trials.length > 0) state.report(onTrial, L.evidenceOf(lab)); }, [lab.trials.length]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : largeur ; hauteur = écran de leçon − ce que le bloc glance prend en plus du massif ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const svgRef = useRef(300);
  const [boxW, setBoxW] = useState(320);
  const [overhead, setOverhead] = useState(200);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setBoxW(Math.max(150, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(130, Math.ceil(glanceRef.current.getBoundingClientRect().height) - svgRef.current));
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
  const narrow = boxW < 380;
  const S = Math.round(Math.max(150, Math.min(boxW, 520, screenH - overhead - 16)));
  svgRef.current = S;
  const cx = S / 2; const cy = S / 2;
  const Rpx = S * 0.33;
  const pxOf = (deg, rad = Rpx) => { const p = ROT.pointOnCircle({ x: cx, y: 0 }, rad, deg); return [p.x, cy - p.y]; };
  const scale = Rpx / r; // pixels par mètre

  /* ── le geste : glisser un poteau sur le bord (capture), flèches, toucher puis toucher le bord ── */
  const planeRef = useRef(null);
  const degAt = (e) => {
    const b = planeRef.current.getBoundingClientRect();
    const x = (e.clientX - b.left) * (S / b.width) - cx; const y = cy - (e.clientY - b.top) * (S / b.height);
    return { deg: ROT.bearing({ x: 0, y: 0 }, { x, y }), dist: Math.hypot(x, y) };
  };
  const moveTo = (id, deg) => setLab((s) => (id === 'p2' ? L.moveP2(s, deg) : L.movePost(s, id, deg)));
  const onPostDown = (id) => (e) => {
    if (e.button > 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(id); setSelected(id);
  };
  const onPostMove = (id) => (e) => { if (drag === id && planeRef.current) moveTo(id, degAt(e).deg); };
  const onPostUp = (e) => { if (drag != null) { e.currentTarget.releasePointerCapture?.(e.pointerId); setDrag(null); } };
  const onPostKey = (id) => (e) => {
    const step = e.shiftKey ? 10 : 1;
    const dd = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step }[e.key];
    if (dd != null) {
      e.preventDefault();
      const cur = id === 'p2' ? lab.rot.p2 : lab.posts[id];
      moveTo(id, cur + dd);
      return;
    }
    if (id === 'p2' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setLab((s) => L.rotateOnce(s)); }
  };
  // Toucher un poteau le sélectionne ; toucher ensuite le bord du massif l'y porte (le chemin sans glisser).
  const onPlaneClick = (e) => {
    if (selected == null || drag != null || !planeRef.current || e.target.closest?.('[data-lr-post],[data-lr-p2],[data-deco-tap]')) return;
    const { deg, dist } = degAt(e);
    if (Math.abs(dist - Rpx) > Math.max(28, Rpx * 0.25)) return;
    moveTo(selected, deg);
  };

  /* ── ce que l'écran montre ── */
  const phase = lab.phase;
  const gaps = phase === 'hand' ? L.handGaps(lab) : null;
  const rotPosts = phase === 'hand' ? [] : L.rotatedPosts(lab);
  const alpha = L.alphaOf(lab);
  const sense = L.senseOf(lab);
  const lit = lab.rotLit && phase !== 'hand' ? 'rotate' : lab.handLit && phase === 'hand' ? 'hand' : '';
  const shown = phase === 'hand' ? lab.posts : rotPosts;
  const half = (360 / n) / 2;
  const cards = L.formulaCards(n, r);

  const reading = (() => {
    if (phase === 'hand') return k('readHand', { min: L.decTex(gaps.min), max: L.decTex(gaps.max) });
    if (phase === 'rotate') return k('readRotate', { a: alpha, sense: k(`sense.${sense}`), d: L.decTex(ROT.chordOfArc(r, alpha)) });
    if (!lab.formulaOk) return null; // la consigne est déjà la mission : pas de ligne de plus sous les cartes
    return k(`readGap.${lab.formula}`, { r: String(r).replace('.', '{,}'), h: String(half).replace('.', '{,}'), d: L.gapEqTex(n, r), hd: L.decTex(L.gap(n, r).number / 2) });
  })();

  const last = lab.last;
  const verdictKind = drag != null ? 'live' : last ? last.kind : `start-${phase}`;
  const verdict = (() => {
    switch (verdictKind) {
      case 'live': return <span className="text-violet-900">{k(drag === 'p2' ? 'vLiveP2' : 'vLive')}</span>;
      case 'start-hand': return <span className="text-slate-800">{k('vStartHand')}</span>;
      case 'start-rotate': return <span className="text-slate-800"><MathText>{k('vStartRotate')}</MathText></span>;
      case 'start-measure': return <span className="text-slate-800">{k('vStartMeasure')}</span>;
      case 'handUnequal': return (
        <span className="text-rose-800">
          <MathText>{last.zero ? k('vHandZero') : k('vHandUnequal', { max: L.decTex(last.max), min: L.decTex(last.min), a: pairTex(last.maxPair), b: pairTex(last.minPair) })}</MathText>
        </span>
      );
      case 'handOk': return <span className="text-emerald-800"><MathText>{k('vHandOk', { d: L.decTex(last.d) })}</MathText></span>;
      case 'rotated': return <span className="text-slate-800">{k('vRotated', { k: last.k, n })}</span>;
      case 'overshoot': return <span className="text-rose-800"><MathText>{k('vOvershoot', { k: last.k, a: last.alpha, turn: last.turn, m: last.k - 1 })}</MathText></span>;
      case 'ringOpen': return <span className="text-rose-800"><MathText>{k('vRingOpen', { a: last.alpha, m: n - 1, total: last.total, closing: last.closing, d: L.decTex(last.d), dl: L.decTex(last.dLast) })}</MathText></span>;
      case 'ringOk': return <span className="text-emerald-800"><MathText>{k('vRingOk', { a: last.alpha, n, sense: k(`sense.${last.sense}`) })}</MathText></span>;
      case 'formulaOk': return <span className="text-emerald-800"><MathText>{k(`vCardOk.${last.id}`, { d: L.gapEqTex(n, r), edge: L.decTex(L.edge(n, r)) })}</MathText></span>;
      case 'formulaKo': return <span className="text-rose-800"><MathText>{k(`vCardKo.${last.id}`, { v: L.decTex(last.value), d: L.decTex(last.right) })}</MathText></span>;
      default: return <span className="text-slate-700">{k('vStartHand')}</span>;
    }
  })();

  /* ── la découverte : des distracteurs réfutés par les nombres de la scène et les essais de l'élève ── */
  const discoveryOptions = useMemo(() => {
    const handRefused = lab.trials.some((x) => x.kind === 'handUnequal');
    return [
      { text: k('dOptEye'), why: <MathText>{k(handRefused ? 'dWhyEyeOwn' : 'dWhyEye')}</MathText> },
      { text: <MathText>{k('dOptHalf')}</MathText>, why: <MathText>{k('dWhyHalf', { n, h: 180 / n })}</MathText> },
      { text: <MathText>{k('dOptArc')}</MathText>, why: <MathText>{k('dWhyArc', { edge: L.decTex(L.edge(n, r)), d: L.decTex(L.gap(n, r).number) })}</MathText> },
      { text: <MathText>{k('dOptRight')}</MathText>, correct: true },
    ];
  }, [lab.trials, n, r, k]);

  const formal = (
    <div className="space-y-2" data-lr-formal>
      <EquationDisplay tone="result" tex={`\\alpha = \\dfrac{360^\\circ}{n} = \\dfrac{360^\\circ}{${n}} = ${ROT.degLatex(ROT.centralAngle(n))}`} note={k('fNoteAngle')} />
      <EquationDisplay tone="result" tex={`\\sin\\dfrac{\\alpha}{2} = \\dfrac{d/2}{r} \\;\\Rightarrow\\; d = 2r\\sin\\dfrac{180^\\circ}{n} = 2 \\times ${String(r).replace('.', '{,}')} \\times \\sin ${String(half).replace('.', '{,}')}^\\circ ${L.gapEqTex(n, r)}`} note={k('fNoteGap')} />
      <p className="text-sm text-emerald-900"><MathText>{k('fRule')}</MathText></p>
    </div>
  );

  /* ── les étapes et leurs questions : une étape atteinte (ET les précédentes) ouvre sa suite, dans l'ordre ── */
  const stepList = L.stepsOf(lab).map((st) => ({ ...st, chain: chainOf(st.id) }));
  const stepDone = stepList.map((st) => !!doneIds[st.id] || (!cpLive && st.reached));
  const nextStep = cpLive ? stepList.find((st) => !doneIds[st.id]) : null;
  const cpId = nextStep && nextStep.reached ? nextStep.id : null;
  const chain = cpId ? nextStep.chain : null;
  const cp = useLabCheckpoint({
    id: cpId,
    questions: chain ? chain.map((q) => QUESTIONS[q]({ lab, options: discoveryOptions, formal }, k)) : null,
    reached: !!cpId,
    resetKey: inits,
    onRetry: () => { setDrag(null); setLab((cur) => L.retryStep(cur, cpId)); },
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setDoneIds((d) => ({ ...d, [id]: true }));
      if (stepList.find((st) => st.id === id)?.chain.includes('rule')) { state.discover(); state.formalize(); }
    },
  });
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && lab.handTries === 0 && celebrated.current.size) celebrated.current = new Set();   // « إعادة » : on refête
  const doneKey = stepDone.join();
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.has(i)) return;
      celebrated.current.add(i);
      party.celebrate({ n: i + 1, total: stepList.length });
    });
  }, [doneKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le son : un déclic par poteau qui bouge / par image posée (au plus un toutes les 35 ms), « flag » à l'objectif juste, « bell » au tour allumé,
     « over » à un refus. Muet sauf « الصوت ». ── */
  const tick = useRef(0);
  const heard = useRef(null);
  const gestureKey = `${lab.posts.join(',')}|${lab.rot.p2}`;
  const lastGesture = useRef(gestureKey);
  useEffect(() => {
    if (lastGesture.current === gestureKey) return;
    lastGesture.current = gestureKey;
    const now = performance.now();
    if (now - tick.current > 35) { playSfx('tooth'); tick.current = now; }
  }, [gestureKey]);
  useEffect(() => {
    const e = lab.last;
    if (!e || heard.current === e) return;
    heard.current = e;
    if (e.kind === 'rotated') { playSfx('tooth'); return; }
    if (e.ok === false) { playSfx('over'); return; }
    if (['handOk', 'ringOk', 'formulaOk'].includes(e.kind)) { playSfx('flag'); if (e.kind !== 'handOk') playSfx('bell'); }
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le dessin ── */
  const fs = narrow ? 11 : 13;
  const textP = { style: { direction: 'ltr', unicodeBidi: 'isolate' }, fontFamily: 'ui-monospace, monospace' };
  const P = (deg) => pxOf(deg);
  const cableLines = (() => {
    if (phase === 'hand') return gaps.arcs.map((a) => ({ a: lab.posts[a.from], b: lab.posts[a.to], chord: a.chord, key: `${a.from}-${a.to}`, tone: lit ? C.ok : C.cable }));
    const list = [];
    for (let j = 0; j + 1 < rotPosts.length; j += 1) list.push({ a: rotPosts[j], b: rotPosts[j + 1], chord: ROT.chordOfArc(r, alpha), key: `r${j}`, tone: lab.rotLit ? C.ok : C.cable });
    if (lab.rot.result === 'closed') list.push({ a: rotPosts[rotPosts.length - 1], b: rotPosts[0], chord: ROT.chordOfArc(r, alpha), key: 'close', tone: C.ok });
    if (lab.rot.result === 'open') {
      const R = L.ring(lab);
      list.push({ a: rotPosts[rotPosts.length - 1], b: rotPosts[0], chord: ROT.chordOfArc(r, R.closing), key: 'open', tone: C.ko, dashed: true });
    }
    return list;
  })();
  const showCableLabels = phase === 'hand' || phase === 'rotate';
  const arcPath = (d1, d2, rad, sweepDirect) => {
    const [x1, y1] = pxOf(d1, rad); const [x2, y2] = pxOf(d2, rad);
    // Tous les arcs dessinés ici font au plus 180° (α ≤ 180°) : petit arc ; le sens direct est anti-horaire à l'écran.
    return `M${x1} ${y1} A${rad} ${rad} 0 0 ${sweepDirect ? 0 : 1} ${x2} ${y2}`;
  };
  const sgn = sense === ROT.DIRECT ? 1 : -1;
  const tri = phase === 'measure' && rotPosts.length >= 2 ? (() => {
    const A = P(rotPosts[0]); const B = P(rotPosts[1]);
    const H = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    return { A, B, H, mid: rotPosts[0] + (sgn * alpha) / 2 };
  })() : null;
  const btnBase = `inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 ${narrow ? 'px-2 text-xs' : 'px-3 text-sm'} font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300`;
  const sceneLabel = k('sceneLabel', { r: String(r).replace('.', ','), n, placed: shown.length, lit: lit ? k('litYes') : k('litNo') });

  return (
    <ManipulationShell
      type="lamp-ring"
      title={title ?? k('title')}
      mission={mission ?? <MathText>{k(`mission.${phase}`, { n })}</MathText>}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided={cpLive}
      hints={['hint1', 'hint2', 'hint3'].map((hk) => <MathText key={hk}>{k(hk, { n })}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={<ManipulationDiscovery state={state} prompt={k('dPrompt')} options={discoveryOptions} formal={formal} />}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-slate-900 to-indigo-950" minHeight="min-h-[180px]">
        <div ref={boxRef} className="space-y-2" data-lamp-ring data-world="flower-bed" data-phase={phase} data-lit={lit}
          data-n={n} data-r={r} data-scene-s={S}>
          {party.node}
          {cp.node}
          <LabStepper count={stepList.length} current={Math.max(0, stepDone.indexOf(false) < 0 ? stepList.length - 1 : stepDone.indexOf(false))} done={stepDone} stepAttr="data-lr-step" />
          <div ref={glanceRef} className="space-y-1.5" data-lr-glance>
            <div ref={planeRef} className="relative mx-auto" style={{ width: S, height: S }} onClick={onPlaneClick} data-lr-plane data-lr-scale={scale.toFixed(2)}>
              <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 rounded-2xl" style={{ direction: 'ltr' }} role="img" aria-label={sceneLabel}>
                <Garden S={S} Rpx={Rpx} cx={cx} cy={cy} uid={uid} />
                {/* le bord du massif : là où se tiennent les poteaux */}
                <circle cx={cx} cy={cy} r={Rpx} fill="none" stroke="#FDE68A" strokeOpacity={0.55} strokeWidth={1.5} strokeDasharray="5 5" aria-hidden="true" />
                {/* le centre O et un rayon r */}
                <g aria-hidden="true">
                  {(() => { const [ex, ey] = pxOf(120, Rpx * 0.98); const [lx, ly] = pxOf(132, Rpx * 0.55); return <>
                      <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="#E2E8F0" strokeOpacity={phase === 'hand' ? 0.5 : 0.25} strokeWidth={1} strokeDasharray="3 4" />
                      <text x={lx} y={ly} fontSize={fs - 1} fill="#E2E8F0" textAnchor="middle" stroke="#0F172A" strokeWidth={3} paintOrder="stroke" {...textP}>{`r = ${String(r).replace('.', ',')} m`}</text>
                  </>; })()}
                  <circle cx={cx} cy={cy} r={3.5} fill="#F8FAFC" />
                  <text x={cx - 7} y={cy - 7} fontSize={fs + 1} fontWeight="bold" fill="#F8FAFC" textAnchor="end" {...textP}>O</text>
                </g>
                {/* les câbles entre poteaux voisins, et leur longueur */}
                <g data-lr-cables={cableLines.length}>
                  {cableLines.map((c) => {
                    const [x1, y1] = P(c.a); const [x2, y2] = P(c.b);
                    // Au milieu de la corde, décalée vers le centre ; une longue corde qui passe près de O (où sont O, la fontaine
                    // et le rayon) porte son étiquette au quart de sa longueur, décalée perpendiculairement.
                    const nearO = Math.hypot(cx - (x1 + x2) / 2, cy - (y1 + y2) / 2) < Rpx * 0.45;
                    const t = nearO ? 0.27 : 0.5;
                    const mx = x1 + t * (x2 - x1); const my = y1 + t * (y2 - y1);
                    const toC = [cx - mx, cy - my]; const l = Math.hypot(...toC) || 1;
                    const side = nearO ? (() => { const v = [-(y2 - y1), x2 - x1]; const lv = Math.hypot(...v) || 1; const sg = v[0] * toC[0] + v[1] * toC[1] > 0 ? 1 : -1; return [(sg * v[0]) / lv, (sg * v[1]) / lv]; })() : [toC[0] / l, toC[1] / l];
                    const lx = mx + side[0] * (fs + 2); const ly = my + side[1] * (fs + 2) + 4;
                    return (
                      <g key={c.key}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c.tone} strokeWidth={c.dashed ? 2.5 : 2} strokeDasharray={c.dashed ? '6 4' : undefined} opacity={0.95} />
                        {showCableLabels && Math.hypot(x2 - x1, y2 - y1) > 4.2 * fs && (
                          <text x={lx} y={ly} fontSize={fs - 2} fontWeight="bold" fill={c.dashed ? C.ko : '#FEF9C3'} stroke="#0F172A" strokeWidth={3} paintOrder="stroke" textAnchor="middle" {...textP}>{L.dec(c.chord)}</text>
                        )}
                      </g>
                    );
                  })}
                </g>
                {/* phase 2 : l'angle du دوران, fléché, de P₁ vers P₂ ; les arcs des images */}
                {phase === 'rotate' && (
                  <g data-lr-angle={alpha} aria-hidden="true">
                    <path d={arcPath(lab.rot.p1, lab.rot.p2, Rpx * 0.28, sense === ROT.DIRECT)} fill="none" stroke={C.live} strokeWidth={2.5} markerEnd={`url(#lrArrow${uid})`} />
                    {(() => { const [x, y] = pxOf(lab.rot.p1 + (sgn * alpha) / 2, Rpx * 0.28 + fs + 2); return <text x={x} y={y + 4} fontSize={fs} fontWeight="bold" fill={C.live} textAnchor="middle" stroke="#0F172A" strokeWidth={3} paintOrder="stroke" {...textP}>{`${alpha}°`}</text>; })()}
                    {rotPosts.slice(2).map((d, j) => (
                      <path key={d} d={arcPath(rotPosts[j + 1], d, Rpx * 1.12, sense === ROT.DIRECT)} fill="none" stroke="#DDD6FE" strokeWidth={2.6} strokeDasharray="5 3" markerEnd={`url(#lrArrow${uid})`} className={reduce ? undefined : 'lr-arrive'} />
                    ))}
                  </g>
                )}
                {/* phase 3 : le triangle OP₁P₂, la hauteur OH, l'angle α/2 */}
                {tri && (
                  <g data-lr-triangle aria-hidden="true">
                    <path d={`M${cx} ${cy} L${tri.A[0]} ${tri.A[1]} L${tri.B[0]} ${tri.B[1]} Z`} fill="#FDE68A" fillOpacity={0.18} stroke="#FDE68A" strokeWidth={1.4} />
                    <line x1={cx} y1={cy} x2={tri.H[0]} y2={tri.H[1]} stroke="#F8FAFC" strokeWidth={1.2} strokeDasharray="4 3" />
                    <RightMark H={tri.H} O={[cx, cy]} A={tri.A} />
                    <path d={arcPath(rotPosts[0], tri.mid, Rpx * 0.3, sense === ROT.DIRECT)} fill="none" stroke={C.live} strokeWidth={2} />
                    {(() => { const [x, y] = pxOf(rotPosts[0] + (sgn * alpha) / 4, Rpx * 0.3 + fs + 4); return <text x={x} y={y + 4} fontSize={fs - 1} fontWeight="bold" fill={C.live} textAnchor="middle" stroke="#0F172A" strokeWidth={3} paintOrder="stroke" {...textP}>{`${String(half).replace('.', ',')}°`}</text>; })()}
                    <text x={tri.H[0] + (cx - tri.H[0]) * 0.2} y={tri.H[1] + (cy - tri.H[1]) * 0.2 + 4} fontSize={fs} fontWeight="bold" fill="#F8FAFC" textAnchor="middle" stroke="#0F172A" strokeWidth={3} paintOrder="stroke" {...textP}>H</text>
                    {(() => { const m = [(cx + tri.A[0]) / 2, (cy + tri.A[1]) / 2]; return <text x={m[0]} y={m[1] - 6} fontSize={fs - 1} fill="#E2E8F0" textAnchor="middle" stroke="#0F172A" strokeWidth={3} paintOrder="stroke" {...textP}>r</text>; })()}
                    {(() => { const m = [(tri.A[0] + tri.B[0]) / 2, (tri.A[1] + tri.B[1]) / 2]; const v = [m[0] - cx, m[1] - cy]; const l = Math.hypot(...v) || 1; return <text x={m[0] + (v[0] / l) * (fs + 8)} y={m[1] + (v[1] / l) * (fs + 8) + 4} fontSize={fs - 1} fontWeight="bold" fill={lab.formulaOk ? C.ok : '#FDE68A'} textAnchor="middle" stroke="#0F172A" strokeWidth={3} paintOrder="stroke" {...textP}>{lab.formulaOk ? `d = ${L.dec(L.gap(n, r).number)}` : 'd = ?'}</text>; })()}
                  </g>
                )}
                <defs>
                  <marker id={`lrArrow${uid}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0 0 L10 5 L0 10 z" fill={C.live} />
                  </marker>
                  <radialGradient id={`lrGlow${uid}`}>
                    <stop offset="0" stopColor="#FEF08A" stopOpacity="0.95" /><stop offset="0.45" stopColor="#FDE047" stopOpacity="0.45" /><stop offset="1" stopColor="#FDE047" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* les lampadaires */}
                {shown.map((d, i) => {
                  const [x, y] = P(d);
                  const [lx, ly] = pxOf(d, Rpx + Math.max(15, fs + 6));
                  const on = !!lit;
                  return (
                    <g key={`p${i}`} data-lr-lamp={i + 1} data-on={on ? 'true' : 'false'}>
                      {on && <circle cx={x} cy={y} r={Math.max(16, S * 0.07)} fill={`url(#lrGlow${uid})`} className={reduce ? undefined : 'lr-glow'} />}
                      <circle cx={x} cy={y} r={Math.max(6, S * 0.022)} fill="#334155" stroke={on ? '#FDE047' : C.post} strokeWidth={2} />
                      <circle cx={x} cy={y} r={Math.max(3, S * 0.011)} fill={on ? '#FEF08A' : '#64748B'} />
                      <text x={lx} y={ly + 4} fontSize={fs} fontWeight="bold" fill={phase !== 'hand' && i === 1 ? C.live : '#F8FAFC'} stroke="#0F172A" strokeWidth={3} paintOrder="stroke" textAnchor="middle" {...textP}>{`P${sub(i + 1)}`}</text>
                    </g>
                  );
                })}
                <Deco S={S} lit={!!lit} reduce={reduce} />
                <style>{'.lr-glow{animation:lrOn .9s ease-out both}.lr-arrive{animation:lrIn .5s ease-out both}@keyframes lrOn{0%{opacity:0}35%{opacity:.6}50%{opacity:.2}100%{opacity:1}}@keyframes lrIn{from{opacity:0}to{opacity:1}}@media (prefers-reduced-motion: reduce){.lr-glow,.lr-arrive{animation:none}}'}</style>
              </svg>
              {/* les poteaux qu'on tient : 44 px, glisser / flèches / toucher puis toucher le bord */}
              {phase === 'hand' && lab.posts.map((d, i) => {
                const [x, y] = P(d);
                return (
                  <button key={i} type="button" data-lr-post={i + 1} data-deg={d}
                    aria-label={k('postAria', { k: i + 1, deg: d })} aria-pressed={selected === i}
                    onPointerDown={onPostDown(i)} onPointerMove={onPostMove(i)} onPointerUp={onPostUp} onPointerCancel={onPostUp} onKeyDown={onPostKey(i)}
                    onFocus={() => setSelected(i)}
                    className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${selected === i ? 'ring-2 ring-amber-200/70' : ''}`}
                    style={{ left: x, top: y, touchAction: 'none', cursor: drag === i ? 'grabbing' : 'grab' }} />
                );
              })}
              {phase === 'rotate' && (() => {
                const [x, y] = P(lab.rot.p2);
                return (
                  <button type="button" data-lr-p2 data-deg={lab.rot.p2} aria-label={k('p2Aria', { a: alpha, sense: k(`sense.${sense}`) })}
                    onPointerDown={onPostDown('p2')} onPointerMove={onPostMove('p2')} onPointerUp={onPostUp} onPointerCancel={onPostUp} onKeyDown={onPostKey('p2')}
                    onFocus={() => setSelected('p2')}
                    className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none ring-2 ring-violet-300/70 focus-visible:ring-4 focus-visible:ring-violet-300"
                    style={{ left: x, top: y, touchAction: 'none', cursor: drag === 'p2' ? 'grabbing' : 'grab' }} />
                );
              })()}
            </div>

            {/* les commandes de la phase */}
            <div className={`flex flex-wrap items-center justify-center ${narrow ? 'gap-1' : 'gap-1.5'}`}>
              {phase === 'hand' && (
                <>
                  <button type="button" data-lr-light onClick={() => setLab((s) => L.light(s))} className={`${btnBase} border-amber-300 bg-amber-300 text-slate-900`}>{k('light')}</button>
                  {L.canRotate(lab) && !cp.blocking && <button type="button" data-lr-to-rotate onClick={() => setLab((s) => L.openRotate(s))} className={`${btnBase} border-violet-300 bg-white text-violet-900`}>{k(lab.rotLit ? 'toMeasure' : 'toRotate')}</button>}
                </>
              )}
              {phase === 'rotate' && (
                <>
                  <button type="button" data-lr-rotate disabled={!!lab.rot.result} onClick={() => setLab((s) => L.rotateOnce(s))} className={`${btnBase} border-violet-300 bg-violet-300 text-slate-900 disabled:opacity-50`}>
                    {k('rotate')} <span dir="ltr" className="font-mono">{`(${lab.rot.placed}/${n})`}</span>
                  </button>
                  <button type="button" data-lr-retry disabled={lab.rot.placed === 2 && !lab.rot.result} onClick={() => setLab((s) => L.retryRotate(s))} className={`${btnBase} border-slate-300 bg-white text-slate-800 disabled:opacity-50`}>{k('retry')}</button>
                  <button type="button" data-lr-to-hand onClick={() => setLab((s) => L.backToHand(s))} className={`${btnBase} border-slate-300 bg-white text-slate-800`}>{k('toHand')}</button>
                </>
              )}
              {phase === 'measure' && (
                <div className={`grid w-full grid-cols-2 ${narrow ? 'gap-1' : 'gap-1.5'}`} role="group" aria-label={k('cardsTitle')}>
                  {cards.map((c) => {
                    const picked = lab.formula === c.id;
                    const tone = picked ? (c.ok ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : 'border-rose-400 bg-rose-50 text-rose-900') : 'border-amber-200 bg-white text-slate-800';
                    return (
                      <button key={c.id} type="button" data-lr-card={c.id} disabled={lab.formulaOk && !picked} aria-pressed={picked}
                        onClick={() => setLab((s) => L.pickFormula(s, c.id))}
                        className={`min-h-[44px] rounded-xl border-2 px-2 py-1 text-start [&_.katex]:whitespace-nowrap ${narrow ? 'px-1 text-[10px]' : 'text-sm'} font-semibold leading-snug focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:opacity-40 ${tone}`}>
                        <MathText>{k(`card.${c.id}`)}</MathText>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {reading && <p className={`min-h-[1.5rem] text-center [&_.katex]:whitespace-nowrap ${narrow ? 'text-[11px]' : 'text-sm'} text-slate-100`} data-lr-reading aria-live="polite"><MathText>{reading}</MathText></p>}
            <p role="status" className={`min-h-[2.5rem] rounded-xl [&_.katex]:whitespace-nowrap bg-white/95 px-2 py-1 ${narrow ? 'text-[11px]' : 'text-sm'} font-bold leading-snug`} data-lr-verdict={verdictKind}>{verdict}</p>
          </div>

          {freeOpen && extra != null && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-xl bg-white/95 px-2 py-1 text-sm text-slate-800" data-lr-free>
              <span className="font-bold">{k('freeTitle')}</span>
              {[initialNumbers.n, extra].filter((v, i, a) => v != null && a.indexOf(v) === i).map((v) => (
                <button key={v} type="button" data-lr-extra={v} aria-pressed={v === n} onClick={() => state.setNumbers({ ...state.numbers, n: v })}
                  className={`${btnBase} ${v === n ? 'border-amber-400 bg-amber-300 text-slate-900' : 'border-amber-300 bg-amber-50 text-amber-900'}`}>{k('freeExtra', { count: v })}</button>
              ))}
            </div>
          )}

          {lab.trials.length > 0 && (
            <LabFold id="lamp-ring.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-lr-trials={lab.trials.length}>
                {lab.trials.map((tr, i) => (
                  <li key={i} className={tr.ok ? 'text-emerald-800' : 'text-rose-800'}>
                    <MathText>{k(`trial.${tr.kind}`, { a: tr.alpha, closing: tr.closing, max: tr.max != null ? L.decTex(tr.max) : '', min: tr.min != null ? L.decTex(tr.min) : '', v: tr.value != null ? L.decTex(tr.value) : '', k: tr.k, card: tr.id ? k(`cardShort.${tr.id}`) : '' })}</MathText>
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

/** L'angle droit en H (le pied de la hauteur issue de O). */
function RightMark({ H, O, A }) {
  const u = [O[0] - H[0], O[1] - H[1]]; const lu = Math.hypot(...u) || 1;
  const v = [A[0] - H[0], A[1] - H[1]]; const lv = Math.hypot(...v) || 1;
  const s = 8;
  const p1 = [H[0] + (u[0] / lu) * s, H[1] + (u[1] / lu) * s];
  const p3 = [H[0] + (v[0] / lv) * s, H[1] + (v[1] / lv) * s];
  const p2 = [p1[0] + (v[0] / lv) * s, p1[1] + (v[1] / lv) * s];
  return <path d={`M${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} L${p3[0]} ${p3[1]}`} fill="none" stroke="#F8FAFC" strokeWidth={1.2} />;
}

/**
 * Le jardin public la nuit : ciel étoilé, croissant de lune, allée pavée autour du massif, gazon, fleurs du massif (en
 * couronnes), la fontaine au centre. Aucune information mathématique ; ids de dégradés par `useId` (les deux niveaux
 * d'un workspace sont montés ensemble).
 */
function Garden({ S, Rpx, cx, cy, uid }) {
  const stars = useMemo(() => Array.from({ length: 26 }, (_, i) => [((i * 97) % 100) / 100, ((i * 53) % 100) / 100, (i % 3) + 1]), []);
  const flowers = useMemo(() => {
    const out = [];
    const colours = ['#F472B6', '#FDE047', '#F8FAFC', '#FB923C', '#C084FC'];
    for (let ring = 1; ring <= 4; ring += 1) {
      const count = 6 + ring * 6;
      for (let j = 0; j < count; j += 1) out.push({ f: ring / 4.6, a: (j / count) * 360 + ring * 11, c: colours[(j + ring) % colours.length] });
    }
    return out;
  }, []);
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={`lrSky${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0B1330" /><stop offset="1" stopColor="#1E1B4B" />
        </linearGradient>
        <radialGradient id={`lrBed${uid}`}>
          <stop offset="0" stopColor="#166534" /><stop offset="1" stopColor="#14532D" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={S} height={S} rx={16} fill={`url(#lrSky${uid})`} />
      {stars.map(([fx, fy, z], i) => (fy < 0.22 || fx < 0.12 || fx > 0.88) && <circle key={i} cx={fx * S} cy={fy * S * 0.9 + 4} r={z * 0.55} fill="#E0E7FF" opacity={0.7} />)}
      {/* le croissant */}
      <g transform={`translate(${S * 0.1}, ${S * 0.1})`}>
        <circle r={S * 0.04} fill="#FEF3C7" />
        <circle r={S * 0.036} cx={S * 0.016} cy={-S * 0.008} fill="#0B1330" />
      </g>
      {/* le gazon et l'allée pavée */}
      <circle cx={cx} cy={cy} r={Rpx * 1.42} fill="#052E16" opacity={0.8} />
      <circle cx={cx} cy={cy} r={Rpx * 1.16} fill="#334155" />
      <circle cx={cx} cy={cy} r={Rpx * 1.16} fill="none" stroke="#475569" strokeWidth={Rpx * 0.12} strokeDasharray="2 6" />
      {/* le massif et ses fleurs */}
      <circle cx={cx} cy={cy} r={Rpx * 1.02} fill={`url(#lrBed${uid})`} />
      {flowers.map((f, i) => {
        const a = (f.a * Math.PI) / 180;
        return <circle key={i} cx={cx + Math.cos(a) * Rpx * f.f * 1.05 + Rpx * 0.0} cy={cy - Math.sin(a) * Rpx * f.f * 1.05} r={Math.max(1.6, Rpx * 0.028)} fill={f.c} opacity={0.85} />;
      })}
      {/* la fontaine au centre */}
      <circle cx={cx} cy={cy} r={Rpx * 0.13} fill="#0EA5E9" opacity={0.55} />
      <circle cx={cx} cy={cy} r={Rpx * 0.13} fill="none" stroke="#BAE6FD" strokeWidth={1.2} opacity={0.8} />
    </g>
  );
}

/**
 * Le DÉCOR (exigence du propriétaire, monde Gen-Alpha) : un banc et une ado qui filme les lampes au téléphone (un toucher
 * déclenche le flash), un chat, des lucioles qui dansent quand les lampes s'allument. `aria-hidden`, hors clavier, jamais
 * une longueur ni une place ; immobile sous `prefers-reduced-motion`.
 */
function Deco({ S, lit, reduce }) {
  const [flash, setFlash] = useState(0);
  const tap = { onClick: (e) => { e.stopPropagation(); setFlash((f) => f + 1); }, onPointerDown: (e) => e.stopPropagation(), style: { cursor: 'pointer', pointerEvents: 'auto' }, 'data-deco-tap': true };
  const s = S / 300;
  return (
    <g data-deco="flower-bed" aria-hidden="true">
      <style>{'.lr-fly{animation:lrFly 3.2s ease-in-out infinite alternate}@keyframes lrFly{from{transform:translate(0,0)}to{transform:translate(6px,-8px)}}.lr-flash{animation:lrFlash .5s ease-out both}@keyframes lrFlash{from{opacity:.95}to{opacity:0}}@media (prefers-reduced-motion: reduce){.lr-fly,.lr-flash{animation:none}}'}</style>
      {/* le banc et l'ado au téléphone (coin bas-droit) */}
      <g transform={`translate(${S - 58 * s}, ${S - 30 * s}) scale(${s})`} {...tap}>
        <rect x={0} y={8} width={44} height={5} rx={2} fill="#92400E" />
        <rect x={3} y={13} width={3} height={9} fill="#78350F" /><rect x={38} y={13} width={3} height={9} fill="#78350F" />
        <circle cx={20} cy={-6} r={5} fill="#FCD34D" />
        <path d="M14 0 h12 v9 h-12 z" fill="#22C55E" />
        <rect x={27} y={-6} width={5} height={8} rx={1} fill="#0F172A" stroke="#94A3B8" strokeWidth={0.8} />
        {flash > 0 && <circle key={flash} cx={30} cy={-4} r={18} fill="#F8FAFC" className={reduce ? undefined : 'lr-flash'} opacity={reduce ? 0 : 0.9} />}
      </g>
      {/* un chat sur l'allée (coin bas-gauche) */}
      <g transform={`translate(${16 * s}, ${S - 18 * s}) scale(${s})`} opacity={0.85}>
        <ellipse cx={8} cy={4} rx={8} ry={4} fill="#0F172A" />
        <circle cx={15} cy={-1} r={4} fill="#0F172A" />
        <path d="M13 -4 l1 -3 l1.5 3 M16 -4 l1 -3 l1.5 3" stroke="#0F172A" strokeWidth={1.5} />
        <circle cx={16.5} cy={-1.5} r={0.8} fill="#FDE047" />
        <path d="M0 4 q-6 -2 -4 -8" stroke="#0F172A" strokeWidth={1.6} fill="none" />
      </g>
      {/* des lucioles : elles dansent quand les lampes s'allument */}
      {[[0.16, 0.42], [0.86, 0.36], [0.8, 0.84], [0.22, 0.8]].map(([fx, fy], i) => (
        <circle key={i} cx={fx * S} cy={fy * S} r={1.8 * s + 0.6} fill="#FDE047" opacity={lit ? 0.95 : 0.35} className={lit && !reduce ? 'lr-fly' : undefined} />
      ))}
    </g>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de l'étape `id` : la main (angle · œil), le دوران (somme · image), la distance (demi-angle · règle). */
export function chainOf(id) {
  if (id === 'hand') return ['arc', 'eye'];
  if (id === 'rotate') return ['times', 'image'];
  return ['half', 'rule'];
}

const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;

/** Chaque question est construite sur LES nombres de l'élève (n, α) ; `k` : les textes de `lampRing`. */
export const QUESTIONS = {
  arc: ({ lab }, k) => {
    const o = { n: lab.n, a: 360 / lab.n };
    return {
      id: 'arc', kind: 'number', expected: String(360 / lab.n), answer: <MathText>{`$${360 / lab.n}^{\\circ}$`}</MathText>,
      prompt: Cq(k, 'arc.prompt', o), hints: [Cq(k, 'arc.hint1', o), Cq(k, 'arc.hint2', o)], explain: Cq(k, 'arc.explain', o),
    };
  },
  eye: ({ lab }, k) => {
    const o = { n: lab.n, a: 360 / lab.n };
    return {
      id: 'eye', kind: 'choice', cols: 1, prompt: Cq(k, 'eye.prompt', o),
      options: [
        { text: Cq(k, 'eye.enough', o), why: Cq(k, 'eye.whyEnough', o) },
        { text: Cq(k, 'eye.angle', o), correct: true },
        { text: Cq(k, 'eye.first', o), why: Cq(k, 'eye.whyFirst', o) },
      ],
      hints: [Cq(k, 'eye.hint1', o), Cq(k, 'eye.hint2', o)], explain: Cq(k, 'eye.explain', o),
    };
  },
  times: ({ lab }, k) => {
    const a = 360 / lab.n;
    const o = { n: lab.n, a };
    return {
      id: 'times', kind: 'number', expected: String(lab.n * a), answer: <MathText>{`$${lab.n * a}^{\\circ}$`}</MathText>,
      prompt: Cq(k, 'times.prompt', o), hints: [Cq(k, 'times.hint1', o), Cq(k, 'times.hint2', o)], explain: Cq(k, 'times.explain', { ...o, total: lab.n * a }),
    };
  },
  image: ({ lab }, k) => {
    const o = { n: lab.n, a: 360 / lab.n };
    return {
      id: 'image', kind: 'choice', cols: 1, prompt: Cq(k, 'image.prompt', o),
      options: [
        { text: Cq(k, 'image.p1', o), why: Cq(k, 'image.whyP1', o) },
        { text: Cq(k, 'image.p2', o), correct: true },
        { text: Cq(k, 'image.pn', o), why: Cq(k, 'image.whyPn', o) },
      ],
      hints: [Cq(k, 'image.hint1', o), Cq(k, 'image.hint2', o)], explain: Cq(k, 'image.explain', o),
    };
  },
  half: ({ lab }, k) => {
    const a = 360 / lab.n;
    const o = { n: lab.n, a, half: a / 2 };
    return {
      id: 'half', kind: 'number', expected: String(a / 2), answer: <MathText>{`$${a / 2}^{\\circ}$`}</MathText>,
      prompt: Cq(k, 'half.prompt', o), hints: [Cq(k, 'half.hint1', o), Cq(k, 'half.hint2', o)], explain: Cq(k, 'half.explain', o),
    };
  },
  rule: ({ options, formal }, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k('dPrompt')}</MathText>, options,
    hints: [Cq(k, 'rule.hint1'), Cq(k, 'rule.hint2')], explain: formal,
  }),
};
