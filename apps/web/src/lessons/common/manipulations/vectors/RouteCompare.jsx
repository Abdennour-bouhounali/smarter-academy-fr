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
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { Mx, useTick } from './vecCp';
import * as L from '../logic/routeCompare';

/**
 * route-compare — DEUX PARCOURS DANS UN معلم (unité 12 « الأشعة في معلم », « أدمج تعلّماتي », وضعية « عدّاءان » p. 148).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève PARIE (« أتوقّع : (1) / (2) أقصر »), puis CONSTRUIT chaque parcours morceau par morceau avec une épingle qu'il
 *    glisse sur le quadrillage (ou flèches + Entrée, ou un toucher sur un nœud) : la BALISE suivante d'une ligne brisée, le
 *    CENTRE d'un demi-cercle.
 * B. Idée : la longueur d'un parcours est la somme de ses morceaux — un morceau droit vaut √((Δx)² + (Δy)²) (المسافة بين
 *    نقطتين), un demi-cercle vaut π r et son centre est le MILIEU de son diamètre (إحداثيتا المنتصف) ; deux parcours voisins
 *    (9,42 contre 9,96) ne se départagent pas à l'œil : on calcule exactement, puis en valeur approchée.
 * C. Pendant le geste : la flèche du coureur, ses deux composantes en escalier et sa longueur ; l'arc qui part du point
 *    courant et se REFERME au symétrique de ce point par rapport au centre — il ne retombe sur le parcours qu'au milieu ;
 *    les deux montres connectées additionnent les morceaux construits.
 * D. La ligne de lecture écrit √(3² + (−2)²) = √13 ≈ 3,61 ou π × 1 ≈ 3,14 ; chaque montre écrit sa somme exacte (3π ;
 *    √13 + √5 + √17) et sa valeur approchée ; la règle : L₁ = 3π ≈ 9,42 < L₂ ≈ 9,96.
 * E. Avant la règle : le pari, puis les DEUX parcours construits (le contraste des deux longueurs, le pari confronté).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        la longueur d'un parcours dans un معلم = somme des distances entre points (√(Δx² + Δy²)) et des demi-cercles
 *                  (π r, centre = milieu du diamètre) ; deux parcours se comparent par le calcul, pas à l'œil
 *   OBJECT         deux parcours de course (le cross des Sablettes ; un rallye au Sahara), leurs balises, leurs demi-cercles
 *   VARIABLE       la place de l'épingle : la balise d'arrivée d'un morceau droit (nœud entier), le centre d'un arc (½ carreau)
 *   INVARIANT      la longueur d'un parcours ne dépend pas de l'ordre de construction ; un arc partant de P autour de C se
 *                  referme toujours en 2C − P ; π r pour tout demi-cercle de rayon r
 *   TRANSFORMATION chaque morceau posé ajoute sa longueur à la montre du coureur
 *   CONSTRAINT     le coureur suit SON parcours, balise après balise ; l'arc doit retomber sur le parcours
 *   RESISTANCE     un centre qui n'est pas le milieu : l'arc se referme ailleurs, son point d'arrivée est montré et chiffré
 *                  (le centre sur l'extrémité : un arc deux fois trop grand, le diamètre pris pour le rayon) ; une balise
 *                  sautée : le raccourci est refusé avec sa longueur (√61 ≈ 7,81 — plus court, mais ce n'est pas le parcours)
 *   EVIDENCE       les deux montres : 3π ≈ 9,42 km et √13 + √5 + √17 ≈ 9,96 km
 *   CONTRAST       deux parcours de longueurs voisines ; à مبتدئ c'est la ligne brisée qui gagne, à متقدم les arcs
 *   PREDICTION     le pari avant toute construction
 *   DISCOVERY      « on calcule chaque morceau (distance, π r au milieu) puis on additionne et on compare »
 *   FORMALIZATION  AB = √((x_B − x_A)² + (y_B − y_A)²) ; I((x_A + x_B)/2 ; (y_A + y_B)/2), ℓ = π r ; L₁ < L₂
 *   TRANSFER       le إختبار أولي (deux parcours de VTT à Constantine), « أتعمّق » (ex. 22, 23, 25)
 *
 * Mondes (`theme`) : `cross` (متقدم — la وضعية : le cross de la promenade des Sablettes, trois bassins ronds, deux coureurs
 * aux montres connectées) et `rally` (مبتدئ — un rallye au Sahara : une dune contournée, un puits, un 4×4).
 * Manuel (§6bis) : chaque pose est un essai jugé, aucune auto-complétion.
 *
 * DÉCOR (exigence du propriétaire, monde Gen-Alpha) : cross — la mer et les palmiers, un drone qui filme, les coureurs
 * qui courent ce qui est construit quand on les touche ; rallye — le soleil, les rides de sable, le 4×4 qui roule, un
 * dromadaire. `aria-hidden`, hors clavier, `[data-deco]`, jamais une longueur ni une place ; immobile sous
 * `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (§8bis) : la scène est budgétée sur l'écran de leçon (`useLessonViewport` moins ce que le bloc
 * `[data-rc-glance]` prend en plus du dessin) ; l'épingle est SUR le quadrillage, le pari / les parcours, les deux montres
 * et la lecture juste dessous ; la liste des essais est dans un `LabFold` SOUS le bloc mesuré.
 *
 * Props : `routes`, `unit` (à plat ou dans `numbers` — voir levels.js), `theme`, `title`, `lead`, `mission`, `level`,
 * `levels`, `onTrial(evidence)` à chaque geste, `onFinished({ shorter, l1, l2 })` à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-route-compare][data-world][data-stage=bet|build|compare][data-active][data-built="k1,k2"],
 * [data-rc-glance], [data-rc-plane], [data-rc-bet=1|2], [data-rc-route=1|2], [data-rc-pin] (bouton : flèches + Entrée),
 * [data-rc-watch=1|2][data-total], [data-rc-reading], [data-rc-verdict=<kind>], [data-lab-fold=route-compare.trials], [data-deco].
 */
/** La découverte : des distracteurs réfutés par les nombres de la scène (aussi la dernière question de la suite). */
export function discoveryOptionsOf(lab, k) {
  const r1 = lab.routes[0].total; const r2 = lab.routes[1].total;
  const sh = L.shorter(lab);
  const unitTex = `\\,\\mathrm{${lab.unit}}`;
  const n1 = lab.routes[0].pieces.length; const n2 = lab.routes[1].pieces.length;
  return [
    { text: k('dOptEye'), why: <MathText>{k('dWhyEye', { gap: L.decTex(L.gap(lab)), total: L.decTex(Math.min(r1.number, r2.number)), u: unitTex })}</MathText> },
    { text: k('dOptPieces'), why: <MathText>{k(n1 === n2 ? 'dWhyPiecesSame' : 'dWhyPiecesDiff', { n: n1, n1, n2 })}</MathText> },
    { text: k('dOptStraight'), why: <MathText>{k(sh === 0 ? 'dWhyStraightAdv' : 'dWhyStraightBeg', { l1: L.decTex(r1.number), l2: L.decTex(r2.number), u: unitTex })}</MathText> },
    { text: <MathText>{k('dOptRight')}</MathText>, correct: true },
  ];
}

const ROUTE = ['#EA580C', '#2563EB'];
const C = { ok: '#059669', ko: '#E11D48', live: '#7C3AED' };

export default function RouteCompare({
  routes: routes0, unit: unit0, numbers: nums, theme = 'cross', title, lead, mission, level, levels: withLevels = true,
  checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.routeCompare.${key}`, o), [t]);
  const initialNumbers = { routes: routes0 ?? nums?.routes, unit: unit0 ?? nums?.unit ?? 'km' };
  const state = useManipulation({ type: 'route-compare', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { routes, unit } = state.numbers;
  const make = () => L.init({ routes, unit });
  const [lab, setLab] = useState(make);
  const sceneKey = `${JSON.stringify(routes)}|${state.epoch}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [doneIds, setDoneIds] = useState([]);   // les parcours dont la suite de questions est finie
  const [drag, setDrag] = useState(false);
  if (scene.key !== sceneKey) { setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(make()); setDrag(false); setDoneIds([]); }   // « إعادة » : tout repart
  const reduce = useReducedMotion();
  const world = theme === 'rally' ? 'rally' : 'cross';
  const beginner = state.level === 'beginner';
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  const done = L.allDone(lab);
  /* ── les questions PENDANT le labo (primitives/LabCheckpoint) : après chaque parcours construit, une suite sur ses longueurs ; celle du dernier
     parcours finit par la comparaison puis la règle et remplace la découverte automatique. L'enseignant seul peut les couper. ── */
  const cpSettings = useLabCheckpointSettings('route-compare');
  const cpEnabled = cpOn && cpSettings.enabled;
  const pendingIdx = cpEnabled ? [0, 1].find((i) => L.isComplete(lab, i) && !doneIds.includes(`r${i}`)) ?? -1 : -1;
  const chain = pendingIdx >= 0 ? chainOf(lab, pendingIdx) : null;
  const cp = useLabCheckpoint({
    id: chain ? `r${pendingIdx}` : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, pendingIdx, k)) : null,
    reached: pendingIdx >= 0,
    resetKey: scene.inits,
    onRetry: () => { celebrated.current.delete(pendingIdx); setLab((s) => L.retryRoute(s, pendingIdx)); setDoneIds((d) => d.filter((x) => x !== `r${pendingIdx}`)); },
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setDoneIds((d) => (d.includes(id) ? d : [...d, id]));
      if (chainOf(lab, Number(id.slice(1))).includes('rule')) { state.discover(); state.formalize(); }
    },
  });
  const solvedAll = L.discoveryReady(lab);
  const ready = solvedAll && !cpEnabled;
  const tick = useTick();
  const stepDone = [0, 1].map((i) => L.isComplete(lab, i) && (!cpEnabled || doneIds.includes(`r${i}`)));
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && lab.built[0] + lab.built[1] === 0 && celebrated.current.size) celebrated.current = new Set();   // « إعادة » : on refête
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.has(i)) return;
      celebrated.current.add(i);
      party.celebrate({ n: stepDone.filter(Boolean).length, total: 2 });
    });
  }, [stepDone.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son : un déclic par pas de l'épingle, le drapeau quand un morceau est posé (ou le parcours fini), « over » quand il est refusé
  const nTr = lab.trials.length;
  useEffect(() => {
    const tr = lab.trials[nTr - 1];
    if (tr) playSfx(tr.kind === 'ok' ? 'flag' : 'over');
  }, [nTr]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (state.isFormal) state.report(onFinished, { shorter: L.shorter(lab) + 1, l1: L.dec(lab.routes[0].total.number), l2: L.dec(lab.routes[1].total.number) });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const nEvents = lab.trials.length + (lab.bet != null ? 1 : 0);
  useEffect(() => { if (nEvents > 0) state.report(onTrial, L.evidenceOf(lab)); }, [nEvents]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : largeur de la scène ; hauteur = écran de leçon − ce que le bloc glance prend en plus ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const svgHRef = useRef(300);
  const [boxW, setBoxW] = useState(320);
  const [overhead, setOverhead] = useState(190);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setBoxW(Math.max(150, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(120, Math.ceil(glanceRef.current.getBoundingClientRect().height) - svgHRef.current));
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
  const budget = Math.round(Math.max(180, Math.min(500, screenH - overhead - 20)));
  const G = L.layout(lab, { width: Math.min(boxW, 600), height: budget, pad: 12 });
  svgHRef.current = G.height;
  const X = G.X; const Y = G.Y;
  const xy = (P) => [X(P.x), Y(P.y)];

  /* ── le geste : l'épingle (porter sur un nœud ; flèches + Entrée ; toucher un nœud) ── */
  const planeRef = useRef(null);
  const pinRef = useRef(lab.pin);
  pinRef.current = lab.pin;
  const building = lab.bet != null && !!L.nextPiece(lab) && !cp.blocking;
  const nodeAt = (e) => {
    const r = planeRef.current.getBoundingClientRect();
    return G.fromPx((e.clientX - r.left) * (G.width / r.width), (e.clientY - r.top) * (G.height / r.height));
  };
  const onPlaneDown = (e) => {
    if (!building || e.button > 0 || !planeRef.current || e.target.closest?.('[data-deco-tap]')) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
    setLab((s) => L.movePin(s, nodeAt(e)));
  };
  const onPlaneMove = (e) => { if (drag) { tick(); setLab((s) => L.movePin(s, nodeAt(e))); } };
  const onPlaneUp = (e) => {
    if (!drag) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDrag(false);
    const P = pinRef.current;
    if (P) setLab((s) => L.placePin(s, { x: P.x, y: P.y }));
  };
  const onPinKey = (e) => {
    const st = L.pinStep(lab).n / L.pinStep(lab).d;
    const m = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, st], ArrowDown: [0, -st] }[e.key];
    const P = pinRef.current;
    if (!P) return;
    const px = P.x.n / P.x.d; const py = P.y.n / P.y.d;
    if (m) { e.preventDefault(); tick(m[0] + m[1] < 0 ? 0.75 : 1); setLab((s) => L.movePin(s, { x: px + m[0], y: py + m[1] })); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLab((s) => L.placePin(s, { x: P.x, y: P.y })); }
  };

  /* ── la lecture ── */
  const piece = L.nextPiece(lab);
  const pv = building ? L.preview(lab) : null;
  const unitTex = `\\,\\mathrm{${unit}}`;
  const name = (i, key) => lab.routes[i].names[key] ?? '';
  const reading = (() => {
    if (!pv) return null;
    if (pv.kind === 'seg') {
      const dx = V.numLatex(pv.comp.x); const dy = V.numLatex(pv.comp.y);
      const sq = (v) => (v.startsWith('-') ? `(${v})` : v);
      return `$\\sqrt{${sq(dx)}^2 + ${sq(dy)}^2} = ${TR.surdLatex(pv.length)} \\approx ${L.decTex(TR.surdNumber(pv.length))}$`;
    }
    return `$r = ${TR.surdLatex(pv.radius)}$ ، $\\pi r \\approx ${L.decTex(Math.PI * TR.surdNumber(pv.radius))}$ — ${k('readEnd')} $${L.pairTex(pv.end)}$`;
  })();
  const last = lab.last;
  const lastTrial = last?.kind === 'pin' ? last.trial : null;
  const verdictKind = drag ? 'live' : lastTrial ? (lastTrial.kind === 'ok' && last.routeDone != null ? (done ? 'compare' : 'routeDone') : `${lastTrial.piece}-${lastTrial.kind}`) : lab.bet == null ? 'bet' : last?.kind === 'select' || last?.kind === 'bet' ? `start-${piece?.kind ?? 'seg'}` : done ? 'compare' : `start-${piece?.kind ?? 'seg'}`;
  const sh = L.shorter(lab);
  const verdict = (() => {
    const tr = lastTrial;
    const routeNo = (lab.active + 1);
    switch (verdictKind) {
      case 'bet': return <span className="text-slate-700">{k('vBet')}</span>;
      case 'live': return <span className="text-violet-900">{k(piece?.kind === 'arc' ? 'vLiveArc' : 'vLiveSeg')}</span>;
      case 'start-arc': return <span className="text-slate-800"><MathText>{k('vStartArc', { n: routeNo, from: name(lab.active, piece.k) })}</MathText></span>;
      case 'start-seg': return <span className="text-slate-800"><MathText>{k('vStartSeg', { n: routeNo, from: name(lab.active, piece?.k ?? 0) })}</MathText></span>;
      case 'arc-ok': {
        const p = lab.routes[tr.route].pieces[tr.k];
        return <span className="text-emerald-800"><MathText>{k('vArcOk', { c: L.pairTex(p.centre), r: TR.surdLatex(p.radius), len: L.decTex(Math.PI * TR.surdNumber(p.radius)), from: p.fromName, to: p.toName })}</MathText></span>;
      }
      case 'arc-miss': return <span className="text-rose-800"><MathText>{k('vArcMiss', { c: L.pairTex(tr.P), end: L.pairTex(tr.pv.end) })}</MathText></span>;
      case 'arc-atEnd': return <span className="text-rose-800"><MathText>{k('vArcAtEnd', { end: L.pairTex(tr.pv.end) })}</MathText></span>;
      case 'seg-ok': {
        const p = lab.routes[tr.route].pieces[tr.k];
        return <span className="text-emerald-800"><MathText>{k('vSegOk', { v: `\\overrightarrow{${p.fromName}${p.toName}}${V.vecLatex(V.vec(p.from, p.to))}`, len: TR.surdLatex(p.length), approx: L.decTex(TR.surdNumber(p.length)) })}</MathText></span>;
      }
      case 'seg-off': return <span className="text-rose-800"><MathText>{k('vSegOff', { len: L.decTex(TR.surdNumber(tr.pv.length)), n: tr.route + 1 })}</MathText></span>;
      case 'seg-skip': return <span className="text-rose-800"><MathText>{k('vSegSkip', { len: TR.surdLatex(tr.pv.length), approx: L.decTex(TR.surdNumber(tr.pv.length)) })}</MathText></span>;
      case 'routeDone': {
        const R = lab.routes[last.routeDone].total;
        return <span className="text-emerald-800"><MathText>{k('vRouteDone', { n: last.routeDone + 1, eq: `L_{${last.routeDone + 1}} = ${R.latex} \\approx ${L.decTex(R.number)}${unitTex}`, other: 2 - last.routeDone })}</MathText></span>;
      }
      case 'compare': return (
        <span className={lab.bet === sh ? 'text-emerald-800' : 'text-amber-800'}>
          <MathText>{k('vCompare', { a: sh + 1, cmp: `L_{${sh + 1}} \\approx ${L.decTex(lab.routes[sh].total.number)}${unitTex} \\;<\\; L_{${2 - sh}} \\approx ${L.decTex(lab.routes[1 - sh].total.number)}${unitTex}`, gap: L.decTex(L.gap(lab)), u: unitTex })}</MathText>
          {' '}{k(lab.bet === sh ? 'vBetRight' : 'vBetWrong', { n: lab.bet + 1 })}
        </span>
      );
      default: return <span className="text-slate-600">{k('vBet')}</span>;
    }
  })();

  const discoveryOptions = useMemo(() => discoveryOptionsOf(lab, k), [lab, k]);

  const formal = (
    <div className="space-y-2" data-rc-formal>
      <EquationDisplay tone="result" tex={'AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}'} note={k('fNoteSeg')} />
      <EquationDisplay tone="result" tex={'I\\left(\\dfrac{x_A + x_B}{2}\\,;\\,\\dfrac{y_A + y_B}{2}\\right) \\qquad \\ell = \\pi r'} note={k('fNoteArc')} />
      <EquationDisplay tone="result" tex={`L_{${sh + 1}} = ${lab.routes[sh].total.latex} \\approx ${L.decTex(lab.routes[sh].total.number)} \\;<\\; L_{${2 - sh}} = ${lab.routes[1 - sh].total.latex} \\approx ${L.decTex(lab.routes[1 - sh].total.number)}`} />
      <p className="text-sm text-emerald-900"><MathText>{k('fRule')}</MathText></p>
    </div>
  );

  /* ── le dessin ── */
  const f = G.frame;
  const fs = narrow ? 11 : 13;
  const textP = { style: { direction: 'ltr', unicodeBidi: 'isolate' }, fontFamily: 'ui-monospace, monospace' };
  const gridX = []; for (let x = f.xMin; x <= f.xMax; x += 1) gridX.push(x);
  const gridY = []; for (let y = f.yMin; y <= f.yMax; y += 1) gridY.push(y);
  const arcD = (P, E, sweep) => { const a = xy(P); const b = xy(E); const r = Math.hypot(b[0] - a[0], b[1] - a[1]) / 2; return `M${a[0]} ${a[1]} A${r} ${r} 0 0 ${sweep === 'cw' ? 1 : 0} ${b[0]} ${b[1]}`; };
  const pieceD = (p) => (p.kind === 'arc' ? arcD(p.from, p.to, p.sweep) : `M${X(p.from.x)} ${Y(p.from.y)} L${X(p.to.x)} ${Y(p.to.y)}`);
  const builtD = (i) => lab.routes[i].pieces.slice(0, lab.built[i]).map((p, j) => (j === 0 ? pieceD(p) : pieceD(p).replace(/^M[^A-Z]*/, ''))).join(' ');
  const pin = lab.pin ? xy(lab.pin) : null;
  const labels = new Map();
  lab.routes.forEach((r) => {
    const pts = [r.start, ...r.pieces.map((p) => p.to)];
    pts.forEach((P, j) => { const key = `${L.pairText(P)}`; if (!labels.has(key) && r.names[j]) labels.set(key, { P, n: r.names[j], route: r.idx }); });
  });
  const btn = `inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 ${narrow ? 'px-1.5 text-xs' : 'px-2 text-sm'} font-bold focus:outline-none focus-visible:ring-2`;

  return (
    <ManipulationShell
      type="route-compare"
      title={title ?? k('title')}
      mission={mission ?? <MathText>{k(lab.bet == null ? 'mission.bet' : done ? 'mission.compare' : 'mission.build')}</MathText>}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      guided={cpEnabled}
      hints={['hint1', 'hint2', 'hint3'].map((hk) => <MathText key={hk}>{k(hk)}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={<ManipulationDiscovery state={state} prompt={k('dPrompt')} options={discoveryOptions} formal={formal} />}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className={world === 'rally' ? 'bg-gradient-to-b from-amber-50/70 to-white' : 'bg-gradient-to-b from-sky-50/70 to-white'} minHeight="min-h-[180px]">
        <div ref={boxRef} className="space-y-2" data-route-compare data-world={world} data-stage={lab.bet == null ? 'bet' : done ? 'compare' : 'build'}
          data-active={lab.active + 1} data-built={lab.built.join(',')} data-solved={solvedAll ? 'true' : 'false'} data-scene-h={G.height}>
          <div className="relative">
            {party.node}
            {cp.node}
          <div ref={glanceRef} className="space-y-1.5" data-rc-glance>
            <LabStepper count={2} current={lab.active} done={stepDone} stepAttr="data-rc-step" />
            <div
              ref={planeRef}
              className={`relative mx-auto ${building ? 'cursor-crosshair' : ''}`}
              style={{ width: G.width, height: G.height, touchAction: building ? 'none' : 'auto' }}
              onPointerDown={onPlaneDown} onPointerMove={onPlaneMove} onPointerUp={onPlaneUp} onPointerCancel={onPlaneUp}
              data-rc-plane data-rc-k={G.k.toFixed(3)} data-rc-origin={`${X(0).toFixed(1)},${Y(0).toFixed(1)}`}
            >
              <svg width={G.width} height={G.height} viewBox={`0 0 ${G.width} ${G.height}`} className="absolute inset-0 rounded-xl" style={{ direction: 'ltr' }}
                role="img" aria-label={k('sceneLabel', { n1: lab.built[0], n2: lab.built[1], t1: lab.routes[0].pieces.length, t2: lab.routes[1].pieces.length })}>
                <World world={world} G={G} uid={uid} />
                {/* le quadrillage (ورقة مرصوفة) et les axes du معلم */}
                <g aria-hidden="true">
                  {gridX.map((x) => <line key={`gx${x}`} x1={X(x)} x2={X(x)} y1={Y(f.yMax)} y2={Y(f.yMin)} stroke="#334155" strokeWidth={0.6} opacity={0.22} />)}
                  {gridY.map((y) => <line key={`gy${y}`} x1={X(f.xMin)} x2={X(f.xMax)} y1={Y(y)} y2={Y(y)} stroke="#334155" strokeWidth={0.6} opacity={0.22} />)}
                  <line x1={X(f.xMin)} x2={X(f.xMax) - 2} y1={Y(0)} y2={Y(0)} stroke="#334155" strokeWidth={1.4} />
                  <path d={`M${X(f.xMax)} ${Y(0)} l-7 -4 v8 z`} fill="#334155" />
                  <line x1={X(0)} x2={X(0)} y1={Y(f.yMin)} y2={Y(f.yMax) + 2} stroke="#334155" strokeWidth={1.4} />
                  <path d={`M${X(0)} ${Y(f.yMax)} l-4 7 h8 z`} fill="#334155" />
                  {gridX.filter((x) => x !== 0 && x < f.xMax).map((x) => <text key={`tx${x}`} x={X(x)} y={Y(0) + 12} fontSize={9} fill="#475569" textAnchor="middle" {...textP}>{String(x).replace('-', '−')}</text>)}
                  {gridY.filter((y) => y !== 0 && y < f.yMax).map((y) => <text key={`ty${y}`} x={X(0) - 4} y={Y(y) + 3} fontSize={9} fill="#475569" textAnchor="end" {...textP}>{String(y).replace('-', '−')}</text>)}
                  {!labels.has('(0 ; 0)') && <text x={X(0) - 4} y={Y(0) + 12} fontSize={10} fill="#334155" textAnchor="end" {...textP}>O</text>}
                </g>
                <Deco world={world} G={G} lab={lab} reduce={reduce} builtD={builtD} />
                {/* le parcours de chaque coureur, imprimé sur la carte (la figure du manuel) */}
                <g aria-hidden="true" data-rc-course>
                  {!beginner && lab.routes[0].pieces.filter((p) => p.kind === 'arc').map((p) => (
                    <circle key={`pond${p.k}`} cx={X(p.centre.x)} cy={Y(p.centre.y)} r={TR.surdNumber(p.radius) * G.k} fill="#BAE6FD" fillOpacity={0.35} stroke="#64748B" strokeDasharray="4 4" strokeWidth={1.2} />
                  ))}
                  {lab.routes.map((r) => r.pieces.map((p) => (
                    <path key={`c${r.idx}${p.k}`} d={pieceD(p)} fill="none" stroke={ROUTE[r.idx]} strokeWidth={3} strokeDasharray="0.5 7" strokeLinecap="round" opacity={0.9} />
                  )))}
                </g>
                {/* ce que l'élève a construit */}
                {lab.routes.map((r) => (
                  <g key={`b${r.idx}`} data-rc-built={r.idx + 1}>
                    {r.pieces.slice(0, lab.built[r.idx]).map((p) => (
                      <g key={p.k}>
                        <path d={pieceD(p)} fill="none" stroke={ROUTE[r.idx]} strokeWidth={4} strokeLinecap="round" />
                        {p.kind === 'arc' && (
                          <g>
                            <line x1={X(p.from.x)} y1={Y(p.from.y)} x2={X(p.to.x)} y2={Y(p.to.y)} stroke={ROUTE[r.idx]} strokeWidth={1} strokeDasharray="3 3" />
                            <circle cx={X(p.centre.x)} cy={Y(p.centre.y)} r={3.5} fill={ROUTE[r.idx]} />
                            {p.centreName && <text x={X(p.centre.x)} y={Y(p.centre.y) - 7} fontSize={fs - 1} fontWeight="bold" fill={ROUTE[r.idx]} stroke="#FFFFFF" strokeWidth={3} paintOrder="stroke" textAnchor="middle" {...textP}>{p.centreName}</text>}
                          </g>
                        )}
                      </g>
                    ))}
                  </g>
                ))}
                {/* le geste vivant : l'arc qui se referme en 2C − P, ou la flèche et son escalier de composantes */}
                {pv && pv.kind === 'arc' && (
                  <g data-rc-live="arc">
                    <path d={arcD(pv.from, pv.end, pv.sweep)} fill="none" stroke={C.live} strokeWidth={2.5} strokeDasharray="6 4" />
                    <line x1={X(pv.from.x)} y1={Y(pv.from.y)} x2={X(pv.end.x)} y2={Y(pv.end.y)} stroke={C.live} strokeWidth={1} strokeDasharray="2 3" />
                    <circle cx={X(pv.end.x)} cy={Y(pv.end.y)} r={5} fill="none" stroke={C.live} strokeWidth={2} />
                  </g>
                )}
                {pv && pv.kind === 'seg' && (
                  <g data-rc-live="seg">
                    <polyline points={`${X(pv.from.x)},${Y(pv.from.y)} ${X(pv.end.x)},${Y(pv.from.y)} ${X(pv.end.x)},${Y(pv.end.y)}`} fill="none" stroke={C.live} strokeWidth={1.4} strokeDasharray="4 3" />
                    <line x1={X(pv.from.x)} y1={Y(pv.from.y)} x2={X(pv.end.x)} y2={Y(pv.end.y)} stroke={C.live} strokeWidth={3} strokeLinecap="round" />
                    {Math.abs(pv.comp.x.n) > 0 && <text x={(X(pv.from.x) + X(pv.end.x)) / 2} y={Y(pv.from.y) + (pv.comp.y.n > 0 ? 14 : -6)} fontSize={fs - 1} fontWeight="bold" fill={C.live} textAnchor="middle" {...textP}>{L.dec(pv.comp.x.n / pv.comp.x.d, 0).replace(/,0+$/, '')}</text>}
                    {Math.abs(pv.comp.y.n) > 0 && <text x={X(pv.end.x) + 6} y={(Y(pv.from.y) + Y(pv.end.y)) / 2 + 4} fontSize={fs - 1} fontWeight="bold" fill={C.live} {...textP}>{L.dec(pv.comp.y.n / pv.comp.y.d, 0).replace(/,0+$/, '')}</text>}
                  </g>
                )}
                {/* le dernier essai refusé */}
                {lastTrial && lastTrial.kind !== 'ok' && lastTrial.pv && !drag && (
                  <g data-rc-refused={lastTrial.kind}>
                    {lastTrial.piece === 'arc'
                      ? <path d={arcD(lastTrial.pv.from, lastTrial.pv.end, lastTrial.pv.sweep)} fill="none" stroke={C.ko} strokeWidth={2} strokeDasharray="5 4" />
                      : <line x1={X(lastTrial.pv.from.x)} y1={Y(lastTrial.pv.from.y)} x2={X(lastTrial.pv.end.x)} y2={Y(lastTrial.pv.end.y)} stroke={C.ko} strokeWidth={2} strokeDasharray="5 4" />}
                    <text x={X(lastTrial.pv.end.x) + 5} y={Y(lastTrial.pv.end.y) - 5} fontSize={fs + 2} fontWeight="bold" fill={C.ko}>✗</text>
                  </g>
                )}
                {/* les balises et les points nommés */}
                {lab.routes.map((r) => r.pieces.map((p) => (p.kind === 'seg' || beginner) && (
                  <Flag key={`f${r.idx}${p.k}`} x={X(p.to.x)} y={Y(p.to.y)} color={ROUTE[r.idx]} s={G.k} />
                )))}
                {[...labels.values()].map(({ P, n, route }) => (
                  <g key={`n${n}${route}`}>
                    <circle cx={X(P.x)} cy={Y(P.y)} r={4} fill="#0F172A" />
                    <text x={X(P.x) - 6} y={Y(P.y) - 6} textAnchor="end" fontSize={fs + 1} fontWeight="bold" fill="#0F172A" stroke="#FFFFFF" strokeWidth={3} paintOrder="stroke" {...textP}>{n}</text>
                  </g>
                ))}
              </svg>
              {/* l'épingle : flèches pour la déplacer, Entrée pour la poser */}
              {building && pin && (
                <button type="button" onKeyDown={onPinKey}
                  aria-label={k(piece.kind === 'arc' ? 'pinArc' : 'pinSeg', { n: lab.active + 1 })}
                  className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-violet-300 ${drag ? 'bg-violet-500/10' : ''}`}
                  style={{ left: pin[0], top: pin[1], cursor: drag ? 'grabbing' : 'grab' }}
                  data-rc-pin={L.pairText(lab.pin)} data-rc-pin-kind={piece.kind}>
                  <span className="block h-4 w-4 rounded-full border-2 border-white shadow" style={{ background: piece.kind === 'arc' ? C.live : ROUTE[lab.active] }} />
                </button>
              )}
            </div>
            {/* le pari, puis le choix du parcours à construire */}
            <div className={`flex flex-wrap items-center justify-center ${narrow ? 'gap-1' : 'gap-1.5'}`}>
              {lab.bet == null ? (
                <>
                  <span className={`${narrow ? 'text-xs' : 'text-sm'} font-bold text-slate-700`}>{k('betLabel')}</span>
                  {[0, 1].map((i) => (
                    <button key={i} type="button" onClick={() => setLab((s) => L.placeBet(s, i))} data-rc-bet={i + 1}
                      className={`${btn} bg-white`} style={{ borderColor: ROUTE[i], color: ROUTE[i] }}>
                      {k('betShorter', { n: i + 1 })}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {[0, 1].map((i) => (
                    <button key={i} type="button" onClick={() => setLab((s) => L.selectRoute(s, i))} data-rc-route={i + 1}
                      aria-pressed={lab.active === i && !done}
                      className={`${btn} ${lab.active === i && !done ? 'text-white' : 'bg-white'}`}
                      style={{ borderColor: ROUTE[i], background: lab.active === i && !done ? ROUTE[i] : undefined, color: lab.active === i && !done ? '#FFFFFF' : ROUTE[i] }}>
                      {k('routeTab', { n: i + 1 })}{L.isComplete(lab, i) ? ' ✓' : ''}
                    </button>
                  ))}
                  <span className={`rounded-full bg-slate-100 px-2 py-1 ${narrow ? 'text-[10px]' : 'text-xs'} font-bold text-slate-700`} data-rc-my-bet={lab.bet + 1}>{k('myBet', { n: lab.bet + 1 })}</span>
                </>
              )}
            </div>
            {/* les deux montres connectées */}
            <div className={`grid ${narrow ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-2'}`}>
              {[0, 1].map((i) => <Watch key={i} i={i} lab={lab} k={k} narrow={narrow} unitTex={unitTex} winner={done && sh === i} />)}
            </div>
            <p className={`min-h-[1.5rem] text-center ${narrow ? 'text-[11px]' : 'text-sm'} text-slate-800`} data-rc-reading aria-live="polite">{reading && <MathText>{reading}</MathText>}</p>
            <p role="status" className={`min-h-[2.5rem] ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug`} data-rc-verdict={verdictKind}>{verdict}</p>
          </div>
          </div>

          {lab.trials.length > 0 && (
            <LabFold id="route-compare.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-rc-trials={lab.trials.length}>
                {lab.trials.map((tr, i) => {
                  const p = lab.routes[tr.route].pieces[tr.k];
                  const txt = tr.kind === 'ok'
                    ? (tr.piece === 'arc'
                      ? k('trialArcOk', { n: tr.route + 1, c: L.pairTex(p.centre), r: TR.surdLatex(p.radius) })
                      : k('trialSegOk', { n: tr.route + 1, from: p.fromName, to: p.toName, len: TR.surdLatex(p.length) }))
                    : k(`trial.${tr.piece}-${tr.kind}`, { n: tr.route + 1, at: L.pairTex(tr.P), end: L.pairTex(tr.pv.end) });
                  return <li key={i} className={tr.kind === 'ok' ? 'text-emerald-800' : 'text-rose-800'}><MathText>{txt}</MathText></li>;
                })}
              </ul>
            </LabFold>
          )}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/** La montre connectée d'un coureur : un anneau (morceaux construits), la somme exacte, la valeur approchée. */
function Watch({ i, lab, k, narrow, unitTex, winner }) {
  const b = L.builtLength(lab, i);
  const n = lab.routes[i].pieces.length; const m = lab.built[i];
  const R = 15; const per = 2 * Math.PI * R;
  return (
    <div className={`flex items-center gap-1.5 rounded-2xl border-2 bg-slate-900 px-1.5 py-1 text-white ${winner ? 'ring-4 ring-emerald-300' : ''}`}
      style={{ borderColor: ROUTE[i] }} data-rc-watch={i + 1} data-total={b.complete ? L.dec(b.number) : ''} data-pieces={`${m}/${n}`}>
      <svg width={narrow ? 26 : 38} height={narrow ? 26 : 38} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
        <circle cx={20} cy={20} r={R} fill="none" stroke="#334155" strokeWidth={5} />
        <circle cx={20} cy={20} r={R} fill="none" stroke={ROUTE[i]} strokeWidth={5} strokeDasharray={`${(per * m) / n} ${per}`} transform="rotate(-90 20 20)" strokeLinecap="round" />
        <text x={20} y={24.5} fontSize={12} fontWeight="bold" fill="#FFFFFF" textAnchor="middle" style={{ direction: 'ltr' }}>{i + 1}</text>
      </svg>
      <div className={`min-w-0 ${narrow ? 'flex flex-1 flex-wrap items-baseline gap-x-2' : 'space-y-0.5'} leading-tight`}>
        <p className={`${narrow ? 'text-[10px]' : 'text-[11px]'} font-bold text-slate-300`}>{k('watch', { n: i + 1 })}{winner ? ` — ${k('winner')}` : ''}</p>
        <p className={`${narrow ? 'text-[11px]' : 'text-sm'} pt-0.5 font-extrabold leading-normal`} dir="ltr">
          <MathText>{m === 0 ? `$L_{${i + 1}} = 0$` : `$L_{${i + 1}} = ${b.latex}${b.complete ? '' : ' + \\dots'}$`}</MathText>
        </p>
        <p className={`${narrow ? 'text-[10px]' : 'text-xs'} font-bold`} style={{ color: '#A7F3D0' }} dir="ltr">
          <MathText>{`$\\approx ${L.decTex(b.number)}${unitTex}$`}</MathText>
        </p>
      </div>
    </div>
  );
}

/** Une balise (un petit fanion) au point d'arrivée d'un morceau. */
function Flag({ x, y, color, s }) {
  const h = Math.max(12, s * 0.42);
  return (
    <g aria-hidden="true">
      <line x1={x} y1={y} x2={x} y2={y - h} stroke="#334155" strokeWidth={1.4} />
      <path d={`M${x} ${y - h} l${h * 0.55} ${h * 0.18} l${-h * 0.55} ${h * 0.18} z`} fill={color} />
    </g>
  );
}

/** Le fond : le parc des Sablettes (mer en haut, gazon) ou le sable du Sahara. Aucune information mathématique. */
function World({ world, G, uid }) {
  if (world === 'rally') {
    return (
      <g aria-hidden="true">
        <defs>
          <linearGradient id={`rcSand${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FEF3C7" /><stop offset="1" stopColor="#FDE68A" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={G.width} height={G.height} fill={`url(#rcSand${uid})`} />
        {[0.22, 0.48, 0.74, 0.9].map((fy) => (
          <path key={fy} d={`M0 ${G.height * fy} q ${G.width / 8} -6 ${G.width / 4} 0 t ${G.width / 4} 0 t ${G.width / 4} 0 t ${G.width / 4} 0`} stroke="#F59E0B" strokeWidth={1} fill="none" opacity={0.35} />
        ))}
      </g>
    );
  }
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={`rcPark${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E0F2FE" /><stop offset="0.12" stopColor="#F0FDF4" /><stop offset="1" stopColor="#DCFCE7" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={G.width} height={G.height} fill={`url(#rcPark${uid})`} />
      <rect x={0} y={0} width={G.width} height={G.k * 0.42} fill="#7DD3FC" opacity={0.75} />
      <path d={`M0 ${G.k * 0.42} q ${G.width / 16} -5 ${G.width / 8} 0 t ${G.width / 8} 0 t ${G.width / 8} 0 t ${G.width / 8} 0 t ${G.width / 8} 0 t ${G.width / 8} 0 t ${G.width / 8} 0 t ${G.width / 8} 0`} stroke="#F8FAFC" strokeWidth={2} fill="none" />
    </g>
  );
}

/**
 * Le DÉCOR du monde (exigence du propriétaire) — cross : palmiers, un drone qui filme (il traverse quand on le touche), et les
 * deux coureurs aux montres connectées qui courent ce qui est construit quand on les touche ; rallye : le soleil, un
 * dromadaire, le 4×4 qui roule sur le parcours (1) construit. `aria-hidden`, hors clavier, jamais une longueur.
 */
function Deco({ world, G, lab, reduce, builtD }) {
  const [run, setRun] = useState([0, 0]);
  const [fly, setFly] = useState(false);
  const s = G.k; const f = G.frame;
  const tap = (fn) => ({ onClick: (e) => { e.stopPropagation(); fn(); }, onPointerDown: (e) => e.stopPropagation(), style: { cursor: 'pointer', pointerEvents: 'auto' }, 'data-deco-tap': true });
  const css = '.rc-move{transition:transform 1.6s ease-in-out}@media (prefers-reduced-motion: reduce){.rc-move{transition:none}}';
  const go = (i) => setRun((r) => r.map((v, j) => (j === i ? v + 1 : v)));
  const start = (i) => lab.routes[i].start;
  const mover = (i, body) => {
    const d = builtD(i); const P = start(i);
    const at = `translate(${G.X(P.x)}, ${G.Y(P.y)})`;
    return (
      <g {...tap(() => go(i))}>
        <g key={run[i]} transform={run[i] === 0 || reduce || !d ? at : undefined}>
          {run[i] > 0 && !reduce && d && <animateMotion dur="3.6s" fill="freeze" path={d} />}
          {body}
        </g>
      </g>
    );
  };
  if (world === 'rally') {
    const arc = lab.routes[0].pieces.find((p) => p.kind === 'arc');
    const dune = arc ? { x: G.X(arc.centre.x), y: G.Y(arc.centre.y), r: TR.surdNumber(arc.radius) * s * 0.62 } : null;
    return (
      <g data-deco="rally" aria-hidden="true">
        <style>{css}</style>
        <circle cx={G.X(f.xMax) - s * 0.7} cy={G.Y(f.yMax) + s * 0.7} r={s * 0.38} fill="#FBBF24" opacity={0.9} />
        {dune && <path d={`M${dune.x - dune.r} ${dune.y} A ${dune.r} ${dune.r * 0.8} 0 0 1 ${dune.x + dune.r} ${dune.y} Z`} fill="#F59E0B" opacity={0.45} />}
        {/* le puits : au point de passage de la ligne brisée */}
        {lab.routes[1].pieces.slice(0, -1).map((p) => (
          <g key={p.k} transform={`translate(${G.X(p.to.x) + s * 0.32}, ${G.Y(p.to.y) + s * 0.12})`}>
            <ellipse cx={0} cy={0} rx={s * 0.2} ry={s * 0.08} fill="#78716C" />
            <rect x={-s * 0.2} y={-s * 0.16} width={s * 0.4} height={s * 0.16} fill="#A8A29E" />
          </g>
        ))}
        {/* l'oasis, en bas à droite : deux palmiers et une mare */}
        <g transform={`translate(${G.X(f.xMax) - s * 0.9}, ${G.Y(f.yMin) - s * 0.15})`} opacity={0.9}>
          <ellipse cx={s * 0.2} cy={0} rx={s * 0.55} ry={s * 0.14} fill="#38BDF8" opacity={0.6} />
          {[0, 0.45].map((dx) => (
            <g key={dx} transform={`translate(${dx * s}, 0)`}>
              <path d={`M0 0 q${s * 0.05} ${-s * 0.3} ${-s * 0.02} ${-s * 0.6}`} stroke="#92400E" strokeWidth={2.5} fill="none" />
              {[-1, -0.3, 0.4, 1].map((a) => <path key={a} d={`M${-s * 0.02} ${-s * 0.6} q${a * s * 0.17} ${-s * 0.15} ${a * s * 0.32} ${s * 0.04}`} stroke="#16A34A" strokeWidth={2.5} fill="none" strokeLinecap="round" />)}
            </g>
          ))}
        </g>
        {/* le 4×4 du parcours (1) et la moto du parcours (2) : ils roulent ce qui est construit quand on les touche */}
        {mover(0, (
          <g transform={`translate(${-s * 0.9}, ${s * 0.18})`}>
            <rect x={0} y={0} width={s * 0.6} height={s * 0.24} rx={4} fill="#EA580C" />
            <rect x={s * 0.32} y={-s * 0.1} width={s * 0.2} height={s * 0.12} rx={2} fill="#FDBA74" />
            <circle cx={s * 0.12} cy={s * 0.26} r={s * 0.07} fill="#1C1917" /><circle cx={s * 0.48} cy={s * 0.26} r={s * 0.07} fill="#1C1917" />
          </g>
        ))}
        {mover(1, (
          <g transform={`translate(${-s * 0.85}, ${s * 0.72})`}>
            <circle cx={s * 0.08} cy={s * 0.2} r={s * 0.08} fill="none" stroke="#1C1917" strokeWidth={2} />
            <circle cx={s * 0.44} cy={s * 0.2} r={s * 0.08} fill="none" stroke="#1C1917" strokeWidth={2} />
            <path d={`M${s * 0.08} ${s * 0.2} L${s * 0.26} ${s * 0.04} L${s * 0.44} ${s * 0.2}`} stroke="#2563EB" strokeWidth={3} fill="none" />
            <circle cx={s * 0.26} cy={-s * 0.06} r={s * 0.08} fill="#2563EB" />
          </g>
        ))}
      </g>
    );
  }
  const runner = (color) => (
    <g transform={`translate(${-s * 0.42}, ${s * 0.45})`}>
      <circle cx={0} cy={-s * 0.28} r={s * 0.1} fill="#FCD34D" stroke="#92400E" strokeWidth={0.8} />
      <rect x={-s * 0.09} y={-s * 0.17} width={s * 0.18} height={s * 0.22} rx={3} fill={color} />
      <path d={`M${-s * 0.05} ${s * 0.05} l${-s * 0.08} ${s * 0.16} M${s * 0.05} ${s * 0.05} l${s * 0.1} ${s * 0.14}`} stroke="#1E293B" strokeWidth={2} strokeLinecap="round" />
      <rect x={s * 0.08} y={-s * 0.1} width={s * 0.07} height={s * 0.06} rx={1} fill="#22D3EE" />
    </g>
  );
  return (
    <g data-deco="cross" aria-hidden="true">
      <style>{css}</style>
      {/* des palmiers aux coins libres */}
      {[[f.xMin + 0.45, f.yMin + 0.2], [f.xMax - 0.45, f.yMin + 0.2]].map(([px, py]) => (
        <g key={px} transform={`translate(${G.X(px)}, ${G.Y(py)})`} opacity={0.9}>
          <path d={`M0 0 q${s * 0.05} ${-s * 0.35} ${-s * 0.02} ${-s * 0.7}`} stroke="#92400E" strokeWidth={3} fill="none" />
          {[-1, -0.3, 0.4, 1].map((a) => <path key={a} d={`M${-s * 0.02} ${-s * 0.7} q${a * s * 0.2} ${-s * 0.18} ${a * s * 0.38} ${s * 0.05}`} stroke="#16A34A" strokeWidth={3} fill="none" strokeLinecap="round" />)}
        </g>
      ))}
      {/* le drone qui filme la course : il traverse quand on le touche */}
      <g className={reduce ? undefined : 'rc-move'} {...tap(() => setFly((v) => !v))} transform={`translate(${fly ? G.width * 0.72 : G.width * 0.3}, ${s * 0.22})`}>
        <rect x={-s * 0.18} y={-s * 0.05} width={s * 0.36} height={s * 0.1} rx={3} fill="#1E293B" />
        {[-1, 1].map((d) => <ellipse key={d} cx={d * s * 0.24} cy={-s * 0.08} rx={s * 0.13} ry={s * 0.03} fill="#94A3B8" />)}
        <circle cx={0} cy={s * 0.09} r={s * 0.04} fill="#EF4444" />
      </g>
      {mover(0, runner('#EA580C'))}
      {mover(1, runner('#2563EB'))}
    </g>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite du parcours i : la longueur d'un morceau, celle du parcours entier ; le dernier parcours construit ajoute la comparaison puis la règle. */
export function chainOf(lab) {
  const q = ['pieceLen', 'routeSum'];
  if (L.allDone(lab)) q.push('compare', 'rule');
  return q;
}

const iso = (s) => `$${s}$`;
const fixUnit = (lab) => `\\,\\mathrm{${lab.unit}}`;

/** Le morceau le plus instructif du parcours : le premier demi-cercle, sinon le premier morceau droit. */
const keyPiece = (lab, i) => lab.routes[i].pieces.find((p) => p.kind === 'arc') ?? lab.routes[i].pieces[0];

export const QUESTIONS = {
  pieceLen: (lab, i, k) => {
    const p = keyPiece(lab, i);
    const u = fixUnit(lab);
    const o = { from: p.fromName, to: p.toName, n: i + 1 };
    if (p.kind === 'arc') {
      const r = TR.surdLatex(p.radius); const rn = TR.surdNumber(p.radius);
      const twice = /^\d+$/.test(r) ? String(2 * Number(r)) : `2${r}`;
      const lenTex = (mult) => `${mult === 1 ? (r === '1' ? '' : r) : (r === '1' ? '2' : twice)}\\pi`;
      const fmt = (v) => iso(`${v}${u}`);
      const P = { ...o, r: iso(`r = ${r}`), c: iso(L.pairTex(p.centre)) };
      return {
        id: 'pieceLen', kind: 'choice', cols: 3,
        prompt: Mx(k, 'pieceLen.promptArc', P),
        options: [
          { text: <MathText>{iso(`${lenTex(1)} \\approx ${L.decTex(Math.PI * rn)}${u}`)}</MathText>, correct: true },
          { text: <MathText>{iso(`${lenTex(2)} \\approx ${L.decTex(2 * Math.PI * rn)}${u}`)}</MathText>, why: Mx(k, 'pieceLen.whyFull', { ...P, len: fmt(L.decTex(2 * Math.PI * rn)) }) },
          { text: <MathText>{iso(`${twice} \\approx ${L.decTex(2 * rn)}${u}`)}</MathText>, why: Mx(k, 'pieceLen.whyDiameter', { ...P, d: fmt(L.decTex(2 * rn)) }) },
        ],
        hints: [Mx(k, 'pieceLen.hint1Arc', P), Mx(k, 'pieceLen.hint2Arc', P)],
        explain: Mx(k, 'pieceLen.explainArc', { ...P, len: iso(`${lenTex(1)} \\approx ${L.decTex(Math.PI * rn)}${u}`) }),
      };
    }
    const comp = V.vec(p.from, p.to);
    const hx = Math.abs(Number(V.numLatex(comp.x))); const hy = Math.abs(Number(V.numLatex(comp.y)));
    const len = TR.surdNumber(p.length);
    const P = { ...o, comp: iso(`${V.vecLatex(comp)}`), dx: iso(String(hx)), dy: iso(String(hy)) };
    return {
      id: 'pieceLen', kind: 'choice', cols: 3,
      prompt: Mx(k, 'pieceLen.promptSeg', P),
      options: [
        { text: <MathText>{iso(`${TR.surdLatex(p.length)} \\approx ${L.decTex(len)}${u}`)}</MathText>, correct: true },
        { text: <MathText>{iso(`${hx} + ${hy} = ${hx + hy}${u}`)}</MathText>, why: Mx(k, 'pieceLen.whyTaxi', { ...P, taxi: iso(String(hx + hy)) }) },
        { text: <MathText>{iso(`${hx}^2 + ${hy}^2 = ${hx * hx + hy * hy}`)}</MathText>, why: Mx(k, 'pieceLen.whySquare', { ...P, sq: iso(String(hx * hx + hy * hy)) }) },
      ],
      hints: [Mx(k, 'pieceLen.hint1Seg', P), Mx(k, 'pieceLen.hint2Seg', P)],
      explain: Mx(k, 'pieceLen.explainSeg', { ...P, len: iso(`\\sqrt{${hx}^2 + ${hy}^2} = ${TR.surdLatex(p.length)} \\approx ${L.decTex(len)}${u}`) }),
    };
  },
  routeSum: (lab, i, k) => {
    const R = lab.routes[i].total;
    const u = fixUnit(lab);
    const P = { n: i + 1, L: iso(`L_{${i + 1}}`), unit: lab.unit };
    const short = L.shortcut(lab, i);
    const shortN = TR.surdNumber(short);
    // l'erreur propre au parcours : demi-cercles pris pour des cercles entiers, ou marche en « escalier » sur les morceaux droits
    let off = 0;
    lab.routes[i].pieces.forEach((p) => {
      if (p.kind === 'arc') { off += 2 * Math.PI * TR.surdNumber(p.radius); } else {
        const c = V.vec(p.from, p.to); off += Math.abs(Number(V.numLatex(c.x))) + Math.abs(Number(V.numLatex(c.y)));
      }
    });
    const hasArc = lab.routes[i].pieces.some((p) => p.kind === 'arc');
    const line = (n) => iso(`\\approx ${L.decTex(n)}${u}`);
    const ds = [{ n: shortN, why: 'whyShortcut' }, { n: off, why: hasArc ? 'whyFull' : 'whyStairs' }].filter((d) => L.dec(d.n) !== L.dec(R.number));
    if (ds.length < 2) ds.push({ n: R.number + 1, why: 'whyOff' });
    return {
      id: 'routeSum', kind: 'choice', cols: 3,
      prompt: Mx(k, 'routeSum.prompt', P),
      options: [
        { text: <MathText>{iso(`${R.latex} \\approx ${L.decTex(R.number)}${u}`)}</MathText>, correct: true },
        ...ds.slice(0, 2).map((d) => ({ text: <MathText>{line(d.n)}</MathText>, why: Mx(k, `routeSum.${d.why}`, { ...P, v: line(d.n), short: iso(`${TR.surdLatex(short)} \\approx ${L.decTex(shortN)}${u}`) }) })),
      ],
      hints: [Mx(k, 'routeSum.hint1', P), Mx(k, 'routeSum.hint2', P)],
      explain: Mx(k, 'routeSum.explain', { ...P, eq: iso(`L_{${i + 1}} = ${R.latex} \\approx ${L.decTex(R.number)}${u}`) }),
    };
  },
  compare: (lab, i, k) => {
    const sh = L.shorter(lab); const u = fixUnit(lab);
    const r = lab.routes;
    const P = {
      a: sh + 1, b: 2 - sh,
      cmp: iso(`L_{${sh + 1}} \\approx ${L.decTex(r[sh].total.number)}${u} \\,<\\, L_{${2 - sh}} \\approx ${L.decTex(r[1 - sh].total.number)}${u}`),
      gap: iso(`${L.decTex(L.gap(lab))}${u}`),
    };
    return {
      id: 'compare', kind: 'choice',
      prompt: Mx(k, 'compare.prompt'),
      options: [
        { text: Mx(k, 'compare.route', { n: sh + 1 }), correct: true },
        { text: Mx(k, 'compare.route', { n: 2 - sh }), why: Mx(k, 'compare.whyOther', P) },
        { text: Mx(k, 'compare.same'), why: Mx(k, 'compare.whySame', P) },
      ],
      hints: [Mx(k, 'compare.hint1'), Mx(k, 'compare.hint2', P)],
      explain: Mx(k, 'compare.explain', P),
    };
  },
  rule: (lab, i, k) => ({
    id: 'rule', kind: 'choice',
    prompt: k('dPrompt'),
    options: discoveryOptionsOf(lab, k),
    hints: [Mx(k, 'rule.hint1'), Mx(k, 'rule.hint2')],
    explain: <p className="text-sm" data-rc-formal><MathText>{k('fRule')}</MathText></p>,
  }),
};
