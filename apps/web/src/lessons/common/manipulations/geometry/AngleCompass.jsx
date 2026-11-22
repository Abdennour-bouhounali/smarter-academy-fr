import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus, RotateCcw, ArrowLeft, Ruler } from 'lucide-react';
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import MovablePanel from '../primitives/MovablePanel';
import MathText from '../../components/MathText';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import * as L from '../logic/angleCompass';

/**
 * angle-compass — LE FIL DU CERF-VOLANT (unité 10 « حساب المثلثات في المثلث القائم », درس « العلاقات بين النسب
 * المثلثية والإنشاءات الهندسية » : نشاط 5 p. 117, طرائق p. 121 « إنشاء هندسي لزاوية حادة علمت القيمة المضبوطة
 * لإحدى نسبها المثلثية », دوري الآن 2). Équerre, règle graduée et compas — SANS rapporteur — pour de vrai.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève POSE l'équerre dans le coin O (glisser ou toucher), REPORTE une longueur sur un côté (poignée le
 *    long du sable ou de la verticale, unité par unité : glisser, toucher, flèches), puis soit OUVRE le compas
 *    piqué en ce point (la jambe-crayon sous la scène : glisser, −/+, flèches — c'est le fil du cerf-volant) et
 *    ABAISSE la mine (poignée ↻ sur l'arc, partie du ciel : glisser, flèches ↓, ou « ارسم القوس »), soit reporte une seconde
 *    longueur sur l'autre côté et TRACE l'hypoténuse à la règle. Enfin il DÉSIGNE le sommet de l'angle x.
 * B. Idée : construire un angle dont on connaît un rapport, c'est construire un triangle rectangle dont les côtés
 *    réalisent ce rapport — l'hypoténuse au compas pour sin et cos, deux côtés de l'angle droit pour tan ; et,
 *    dans TOUT triangle rectangle, cos² x + sin² x = 1 et tan x = sin x / cos x (نشاط 5).
 * C. L'arc s'allonge sous le doigt (la mine descend du ciel vers O) et coupe l'autre côté là où r·cos θ = a, à la distance EXACTE √(r² − a²) ; le
 *    triangle se ferme, le cerf-volant monte au bout du fil, le rapporteur apparaît au sommet désigné.
 * D. Le panneau flottant « قراءة الزاوية x » : cos, sin, tan EXACTS de l'angle désigné, la barre « مربع جيب
 *    التمام + مربع الجيب » qui remplit exactement 1, le rapporteur (au degré) contre la calculatrice (au dixième).
 * E. À découvrir avant la règle : (مبتدئ) la somme des carrés vaut 1 pour chaque triangle construit, quelle que
 *    soit sa taille ; (متقدم) pour sin le dénominateur est l'hypoténuse (compas), pour tan il n'y a pas d'hypoténuse.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        un angle aigu est déterminé par un de ses rapports ; cos² x + sin² x = 1, tan x = sin x / cos x
 *   OBJECT         une équerre, une règle graduée, un compas (le fil), un triangle rectangle sur la plage
 *   VARIABLE       la longueur reportée (1…10 unités) et son côté, l'OUVERTURE du compas (1…12), l'angle de la mine
 *                  (0…90°), le sommet désigné comme x
 *   INVARIANT      cos² + sin² = 1 et tan = sin / cos sur TOUT triangle construit (même refusé) ; l'angle ne change
 *                  pas quand on double les longueurs (2 et 5, 4 et 10)
 *   TRANSFORMATION un arc, un point coupé, une hypoténuse, des rapports exacts, un angle lu au rapporteur
 *   CONSTRAINT     rien ne se reporte avant l'équerre ; le compas pique le point reporté ; un triangle fermé se
 *                  recommence (« إنشاء جديد »)
 *   RESISTANCE     un fil (r) ≤ la hauteur reportée n'atteint jamais l'autre côté — l'arc tourne jusqu'à 90° et passe
 *                  à côté (l'hypoténuse est le plus grand côté : 0 < sin < 1 se VOIT) ; 2 et 5 sur les deux côtés de
 *                  l'angle droit pour sin 2/5 : la lecture dit tan = 2/5 ≈ 21,8°, pas 23,6° (MISC-MUTH-INSHA-WATAR) ;
 *                  le mauvais sommet : son sinus est le cosinus de x (MISC-MUTH-ZAWIYA-KHATI) ; tan au compas
 *   EVIDENCE       le rapport exact lu sur les côtés, le rapporteur contre la calculatrice, la barre des carrés
 *   CONTRAST       toutes les cibles atteintes ET un essai refusé, ou la même cible à une autre échelle
 *   PREDICTION     quel nombre devient l'hypoténuse ; où sera l'angle x ; jusqu'où ouvrir le fil
 *   DISCOVERY      « مربع جيب التمام + مربع الجيب = 1 دائمًا » ; « للجيب: المقام وتر بالمدور ؛ للظل: ضلعا القائمة »
 *   FORMALIZATION  cos² x + sin² x = 1, tan x = sin x / cos x (معارف 4) ; la méthode de construction (طرائق ص 121)
 *   TRANSFER       طرائق ص 121 (cos 0,6 → sin 0,8), دوري الآن 1 et 2, تمارين 20, 21, 22
 *
 * Manuel (§6bis) : chaque report, chaque ouverture, chaque arc et chaque désignation est un choix — aucune
 * auto-complétion. Toute vérité vient de `trigonometry` (packages/core) par `logic/angleCompass.js`.
 *
 * DÉCOR (exigence du propriétaire, monde `kite` — une après-midi de vent sur la plage, Sidi Fredj ou Les Sablettes) :
 * la mer, le soleil, un parasol, une mouette qui s'envole au toucher, le cerf-volant aux couleurs du drapeau qui
 * frissonne au bout du fil et danse quand une construction est juste. `aria-hidden`, hors clavier, `[data-deco]`,
 * immobile sous `prefers-reduced-motion`, jamais une information (les longueurs sont écrites ailleurs).
 *
 * D'UN SEUL REGARD (§8bis) : la scène est une boîte carrée FIXE (14,4 unités) mise à l'échelle par la largeur ET
 * par la hauteur de l'écran de leçon (`useLessonViewport` moins ce que le bloc mesure en plus de la scène) ; les
 * commandes (compas, règle, sommets, recommencer) sont juste sous la scène, la cible au-dessus, la lecture dans un
 * `MovablePanel` posé sur le ciel ; la liste des essais est un `LabFold` sous le bloc mesuré `[data-ac-glance]`.
 *
 * QUESTIONS PENDANT LE LABO (2026-10-28, lot 4, `primitives/LabCheckpoint`) : `checkpoints` (défaut true). Une étape par cible (« t0 », « t1 »…) puis l'étape
 * « rule » (le contraste : un essai refusé ou deux échelles, puis la règle — l'ancienne découverte, qui formalise). Après chaque cible atteinte, une suite de
 * questions sur le triangle construit (`CHAINS`/`QUESTIONS` : le côté du mur de la nacelle… le côté au dénominateur, le côté coupé par l'arc, l'AUTRE rapport) retient
 * « التالي » ; la suite « rule » : l'angle lu à la rapporteur, cos² + sin², la règle. OBLIGATOIRES pour tout élève ; l'enseignant seul peut les couper (interrupteur de
 * l'en-tête). Événements `{ tk: 'checkpoint' | 'checkpoint-done', id, … }` vers `onTrial` (les leçons gardent `!ev.tk`). `[data-ac-step]`, `[data-ac-compare]`.
 * Props : `targets` (ou `numbers.targets`) : [{ ratio: 'sin' | 'cos' | 'tan', value: '3/5' }], `theme` ('kite'),
 * `discovery` ('relation' | 'construct', par défaut 'relation' pour une cible, 'construct' sinon), `title`, `lead`,
 * `mission`, `level`, `levels` (false : un seul niveau), `onTrial(evidence)` à chaque désignation,
 * `onFinished({ trials, targets })` à la règle formelle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-angle-compass][data-step][data-target-idx][data-solved], [data-ac-glance], [data-ac-scene],
 * [data-ac-target], [data-ac-square] (bouton), [data-ac-leg=h|v] (slider), [data-ac-open] (slider),
 * [data-ac-open-less|more], [data-ac-sweep], [data-ac-swing] (slider), [data-ac-join], [data-ac-vertex=h|v],
 * [data-ac-fresh], [data-ac-next], [data-ac-reading], [data-ac-verdict=<kind>], [data-ac-panel], [data-ac-squares],
 * [data-ac-protractor], [data-lab-fold=angle-compass.trials], [data-deco].
 */
const BOX = { x0: -1.6, x1: 12.8, y0: -1.8, y1: 12.6 };
const KNOB = 'absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 outline-none focus-visible:ring-4';
const BTN = 'inline-flex h-11 min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 px-2 text-sm font-bold focus:outline-none focus-visible:ring-2 disabled:opacity-40';
const NAME = { h: 'B', v: 'A' };
const KIND_TEX = { sin: '\\sin', cos: '\\cos', tan: '\\tan' };
const num = (x) => TR.surdNumber(x);

export default function AngleCompass({
  targets: targets0, numbers: numbers0, theme = 'kite', discovery: discoveryKind, title, lead, mission, level,
  levels: withLevels = true, checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.angleCompass.${key}`, o), [t]);
  const initialNumbers = { targets: targets0 ?? numbers0?.targets ?? [{ ratio: 'sin', value: '3/5' }] };
  const state = useManipulation({ type: 'angle-compass', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const make = () => L.init({ targets: nums.targets });
  const [lab, setLab] = useState(make);
  const sceneKey = `${JSON.stringify(nums)}|${state.epoch}`;
  const [scene, setScene] = useState(sceneKey);
  const [doneIds, setDoneIds] = useState({});
  const [inits, setInits] = useState(0);
  if (scene !== sceneKey) { setScene(sceneKey); setLab(make()); setDoneIds({}); setInits((n) => n + 1); }
  const reduce = useReducedMotion();
  const cpSettings = useLabCheckpointSettings('angle-compass');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpActive = cpOn && cpSettings.enabled;
  const mode = discoveryKind ?? (lab.targets.length > 1 ? 'construct' : 'relation');

  /* ── la découverte, les rapports à la leçon ── */
  const ready = L.discoveryReady(lab);
  useEffect(() => { if (ready && !cpActive) state.discover(); }, [ready, cpActive, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, { trials: lab.trials.length, targets: lab.targets.length }); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => { if (nTrials > 0) state.report(onTrial, L.evidenceOf(lab.trials[nTrials - 1])); }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : largeur, hauteur de l'écran de leçon, ce que le bloc mesure en plus de la scène ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const sceneRef = useRef(null);
  const sceneHRef = useRef(260);
  const [cw, setCw] = useState(300);
  const [overhead, setOverhead] = useState(null);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setCw(Math.max(200, Math.floor(el.clientWidth)));
      // cliquet : la scène ne grandit jamais sous le doigt quand une rangée de commandes disparaît
      if (glanceRef.current) { const o = Math.ceil(glanceRef.current.getBoundingClientRect().height - sceneHRef.current); setOverhead((prev) => Math.max(120, prev ?? 0, o)); }
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
  const bw = BOX.x1 - BOX.x0; const bh = BOX.y1 - BOX.y0;
  const budget = Math.max(180, Math.min(560, screenH - (overhead ?? 200) - 20));
  const scale = Math.max(12, Math.min(cw / bw, budget / bh));
  const W = Math.round(bw * scale);
  const H = Math.round(bh * scale);
  sceneHRef.current = H;
  const P = ([x, y]) => [(x - BOX.x0) * scale, (BOX.y1 - y) * scale];
  const fromClient = (cx, cy) => {
    const r = sceneRef.current?.getBoundingClientRect();
    if (!r) return [0, 0];
    return [(cx - r.left) / scale + BOX.x0, BOX.y1 - (cy - r.top) / scale];
  };
  const narrow = cw < 360;
  /** Une poignée de 44 px reste entière dans la scène. */
  const inside = ([x, y]) => [Math.min(W - 22, Math.max(22, x)), Math.min(H - 22, Math.max(22, y))];

  /* ── l'état de la construction ── */
  const step = L.stepOf(lab);
  const target = L.currentTarget(lab);
  const targetTex = `${KIND_TEX[target.ratio]} x = ${L.tex(target.exact)}`;
  const Ls = L.lengths(lab);
  // les points du dessin (flottants) : la base reportée, le point coupé, ou les deux reports
  const legLen = (leg) => {
    if (Ls) return num(Ls[leg]);
    return lab.legs[leg];
  };
  const ptH = legLen('h') != null ? [legLen('h'), 0] : null;
  const ptV = legLen('v') != null ? [0, legLen('v')] : null;
  const lastTrial = lab.last?.kind === 'trial' ? lab.last.trial : (lab.vertex && lab.trials.length ? lab.trials[lab.trials.length - 1] : null);
  const shownTrial = lab.closed && lab.vertex ? lastTrial : null;

  /* ── les gestes (moteur commun d'étirement) ── */
  const legHook = (leg) => ({
    value: lab.legs[leg] ?? 0, range: { min: 0, max: L.MAX_LEG }, direction: 'ltr', pageStep: 3,
    toValue: (cx, cy) => { const [x, y] = fromClient(cx, cy); return leg === 'h' ? x : y; },
    onChange: (v) => setLab((s) => (L.canSetLeg(s, leg) === true ? L.setLeg(s, leg, v) : s)),
    onCommit: (v) => setLab((s) => (L.canSetLeg(s, leg) === true ? L.setLeg(s, leg, v) : s)),
  });
  const legH = useStretchInteraction(legHook('h'));
  const legV = useStretchInteraction(legHook('v'));
  const openSt = useStretchInteraction({
    value: lab.opening, range: { min: 1, max: L.MAX_OPEN }, direction: 'ltr', pageStep: 3,
    toValue: (cx, _cy, rect) => 1 + ((cx - rect.left - 22) / Math.max(1, rect.width - 44)) * (L.MAX_OPEN - 1),
    onChange: (v) => setLab((s) => L.setOpening(s, v)),
    onCommit: (v) => setLab((s) => L.setOpening(s, v)),
  });
  const baseLen = lab.base ? lab.legs[lab.base] : null;
  const pivot = lab.base === 'v' ? [0, baseLen ?? 0] : [baseLen ?? 0, 0];
  const uDir = lab.base === 'v' ? [0, -1] : [-1, 0];
  const wDir = lab.base === 'v' ? [1, 0] : [0, 1];
  const tipAt = (deg) => {
    const r = lab.opening ?? 0; const a = (deg * Math.PI) / 180;
    return [pivot[0] + r * (Math.cos(a) * uDir[0] + Math.sin(a) * wDir[0]), pivot[1] + r * (Math.cos(a) * uDir[1] + Math.sin(a) * wDir[1])];
  };
  const swingSt = useStretchInteraction({
    value: Math.round(lab.swing), range: { min: 0, max: 90 }, direction: 'ltr', pageStep: 10,
    toValue: (cx, cy) => {
      const [x, y] = fromClient(cx, cy);
      const d = [x - pivot[0], y - pivot[1]];
      const deg = (Math.atan2(d[0] * wDir[0] + d[1] * wDir[1], d[0] * uDir[0] + d[1] * uDir[1]) * 180) / Math.PI;
      return Math.max(0, Math.min(90, deg));
    },
    onChange: (v) => setLab((s) => (s.closed ? s : L.setSwing(s, v))),
    onCommit: (v) => setLab((s) => (s.closed ? s : L.setSwing(s, v))),
  });

  /* ── l'équerre : glisser jusqu'au coin, ou toucher ── */
  const squareDrag = useRef(null);
  const [squarePos, setSquarePos] = useState(null);
  const place = () => setLab((s) => L.placeSquare(s));
  const squareHome = [6.4, 6.6];

  /* ── le verdict ── */
  const where = (v) => k(`where.${v}`);
  const ratioAtTex = (tr, kind = tr.ratio) => `${KIND_TEX[kind]}\\widehat{${NAME[tr.vertex]}} = ${L.tex(tr.ratios[kind])}`;
  const verdictKind = lab.last?.kind === 'trial' ? lab.last.trial.kind : (lab.last?.kind ?? '');
  const verdict = (() => {
    const last = lab.last;
    if (!last || last.kind === 'fresh' || last.kind === 'nextTarget' || last.kind === 'swing' || last.kind === 'leg' || last.kind === 'legCleared' || last.kind === 'opening' || last.kind === 'square') {
      const msg = { square: 'startSquare', carry: 'startCarry', tool: 'startTool', swing: 'startSwing', join: 'startJoin', pick: 'startPick', judged: 'startPick' }[step];
      if (last?.kind === 'leg') return <span className="text-slate-800">{k('vLeg', { n: last.n, leg: k(`legName.${last.leg}`) })} {k(msg)}</span>;
      if (last?.kind === 'opening') return <span className="text-slate-800">{k('vOpening', { r: last.r })} {k(msg)}</span>;
      return <span className="text-slate-700">{k(msg)}</span>;
    }
    switch (last.kind) {
      case 'noSquare': case 'closed': case 'compassMode': case 'rulerMode': case 'noBase': case 'noOpening': case 'needBoth': case 'notClosed':
        return <span className="text-amber-800">{k(`v.${last.kind}`)}</span>;
      case 'short': return <span className="text-rose-800" data-ac-refused="short">{k('vShort', { a: last.a, r: last.r })}</span>;
      case 'touch': return <span className="text-rose-800" data-ac-refused="touch">{k('vTouch', { a: last.a })}</span>;
      case 'cut': return <span className="text-slate-800"><MathText>{k('vCut', { third: `$${TR.surdLatex(last.third)}$`, a: baseLen, r: lab.opening })}</MathText> {k('startPick')}</span>;
      case 'joined': return <span className="text-slate-800"><MathText>{k('vJoined', { c: `$${TR.surdLatex(Ls.c)}$` })}</MathText> {k('startPick')}</span>;
      case 'trial': {
        const tr = last.trial;
        const ev = L.evidenceOf(tr);
        const o = { where: where(tr.vertex), ratio: `$${ratioAtTex(tr)}$`, target: `$${targetTex}$`, prot: ev.protractor, deg: ev.deg, calc: ev.targetDeg, tan: `$${ratioAtTex(tr, 'tan')}$`, k: tr.scale };
        if (tr.kind === 'ok') return <span className="text-emerald-800"><MathText>{k(narrow ? 'vOkShort' : tr.scale && tr.scale !== 1 ? 'vOkScale' : 'vOk', o)}</MathText></span>;
        return <span className="text-rose-800" data-ac-refused={tr.kind}><MathText>{k(`vTrial.${tr.kind}`, o)}</MathText></span>;
      }
      default: return null;
    }
  })();

  /* ── la lecture (ce que la scène dit) ── */
  const reading = (() => {
    // chaque égalité entière dans UNE île (« OB = √21 » s'inverserait hors de l'île)
    const f = (name, x) => (x == null ? `${name} : —` : `$${name} = ${typeof x === 'number' ? x : TR.surdLatex(x)}$`);
    return k('reading', {
      h: f('OB', Ls ? Ls.h : lab.legs.h), v: f('OA', Ls ? Ls.v : lab.legs.v), c: f('AB', Ls ? Ls.c : lab.opening),
    });
  })();

  /* ── découverte ── */
  const okTrial = lab.trials.find((tr) => tr.ok) ?? lab.trials[0];
  const discoveryOptions = useMemo(() => {
    if (mode === 'construct') {
      const tg = lab.targets.find((x) => x.ratio !== 'tan' && L.targetPair(x)) ?? lab.targets[0];
      const [n, d] = L.targetPair(tg) ?? [2, 5];
      const fake = TR.atanDeg(n / d);
      const o = { n, d, target: `$${KIND_TEX[tg.ratio]} x = \\dfrac{${n}}{${d}}$`, deg: TR.roundTo(fake, 1) };
      return [
        { text: <MathText>{k('dOptHyp', o)}</MathText>, correct: true },
        { text: <MathText>{k('dOptLegs', o)}</MathText>, why: <MathText>{k('dWhyLegs', o)}</MathText> },
        { text: <MathText>{k('dOptSwap', o)}</MathText>, why: <MathText>{k('dWhySwap', o)}</MathText> },
      ];
    }
    const r = okTrial?.ratios;
    const sumTex = r ? LIN.fracLatex(LIN.add(r.cos.r === 1 ? r.cos.q : LIN.frac(0), r.sin.r === 1 ? r.sin.q : LIN.frac(0))) : '';
    const rational = r && r.cos.r === 1 && r.sin.r === 1;
    return [
      { text: <MathText>{k('dOptOne')}</MathText>, correct: true },
      { text: <MathText>{k('dOptSum')}</MathText>, why: <MathText>{rational ? k('dWhySumWitness', { c: L.tex(r.cos), s: L.tex(r.sin), sum: sumTex }) : k('dWhySum')}</MathText> },
      { text: <MathText>{k('dOptSize')}</MathText>, why: <MathText>{k('dWhySize')}</MathText> },
    ];
  }, [lab, k, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const formal = (() => {
    if (mode === 'construct') {
      return (
        <div className="space-y-2" data-ac-formal>
          {lab.trials.filter((tr) => tr.ok).slice(0, 2).map((tr, i) => (
            <EquationDisplay key={i} tone="result" tex={`${ratioAtTex(tr)} \\;\\Rightarrow\\; \\widehat{${NAME[tr.vertex]}} \\approx ${L.evidenceOf(tr).deg.replace(',', '{,}')}^{\\circ}`} />
          ))}
          <p className="text-sm text-emerald-900"><MathText>{k('fRuleConstruct')}</MathText></p>
        </div>
      );
    }
    const r = okTrial?.ratios;
    if (!r) return null;
    const sq = L.squaresOf(r);
    return (
      <div className="space-y-2" data-ac-formal>
        <EquationDisplay tone="result" tex={`\\left(${L.tex(r.cos)}\\right)^2 + \\left(${L.tex(r.sin)}\\right)^2 = ${LIN.fracLatex(sq.c2)} + ${LIN.fracLatex(sq.s2)} = 1`} />
        <EquationDisplay tone="result" tex={`\\dfrac{\\sin x}{\\cos x} = ${L.tex(TR.surdDiv(r.sin, r.cos))} = \\tan x`} />
        <p className="text-sm text-emerald-900"><MathText>{k('fRuleRelation')}</MathText></p>
      </div>
    );
  })();

  /* ── les questions pendant le labo : une suite par cible, puis la règle ── */
  const lastIdx = lab.targets.length - 1;
  const stageId = !doneIds[`t${lab.idx}`] ? `t${lab.idx}` : (lab.idx === lastIdx ? 'rule' : null);
  const isRule = stageId === 'rule';
  const reachedNow = isRule ? ready : !!lab.solved[lab.idx];
  const okTr = L.okTrialOf(lab, lab.idx);
  const lastTr = lab.trials.length ? lab.trials[lab.trials.length - 1] : null;
  const chainKeys = isRule ? CHAINS[mode === 'construct' ? 'ruleConstruct' : 'ruleRelation'] : CHAINS.t;
  const qctx = { k, lab, mode, tr: okTr, lastTr, discoveryOptions, formal };
  const cpQuestions = cpActive && stageId && reachedNow && (isRule ? lastTr : okTr)
    ? chainKeys.map((q) => QUESTIONS[q](qctx)).filter(Boolean) : null;
  const cp = useLabCheckpoint({
    id: cpActive ? stageId : null,
    questions: cpQuestions,
    reached: reachedNow,
    resetKey: inits,
    onRetry: () => setLab(isRule ? L.fresh : L.retryTarget),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setDoneIds((d) => ({ ...d, [id]: true }));
      if (id === 'rule') { state.discover(); state.formalize(); }
    },
  });
  const stageIds = [...lab.targets.map((_, i) => `t${i}`), 'rule'];
  const stepDone = stageIds.map((id) => !!doneIds[id]);
  const stepCur = doneIds[`t${lastIdx}`] ? lastIdx + 1 : lab.idx;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  useEffect(() => { celebrated.current = new Set(); }, [inits]);
  useEffect(() => {
    stageIds.forEach((id, i) => {
      if (doneIds[id] && !celebrated.current.has(id)) { celebrated.current.add(id); party.celebrate({ n: i + 1, total: stageIds.length }); }
    });
  }, [doneIds]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le son (muet sauf « الصوت ») : un déclic par geste (au plus un toutes les 35 ms), la cloche quand le triangle se ferme, le drapeau d'un essai juste, « over » d'un refus ── */
  const sfx = useRef({ at: 0, last: lab.last });
  useEffect(() => {
    const now = performance.now();
    if (now - sfx.current.at > 35) { sfx.current.at = now; playSfx('tooth'); }
  }, [lab.legs.h, lab.legs.v, lab.opening, Math.round(lab.swing), lab.square]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const last = lab.last;
    if (sfx.current.last === last) return;
    sfx.current.last = last;
    if (!last) return;
    if (last.kind === 'cut' || last.kind === 'joined') playSfx('bell');
    else if (last.kind === 'short' || last.kind === 'touch') playSfx('over');
    else if (last.kind === 'trial') playSfx(last.trial.ok ? 'flag' : 'over');
  }, [lab.last]);

  const missionText = mission ?? <MathText>{k(lab.targets.length > 1 ? 'missionMany' : 'mission', { target: `$${targetTex}$` })}</MathText>;
  const hintKeys = target.ratio === 'tan' ? ['hint1', 'hint2Tan', 'hint3Tan'] : ['hint1', 'hint2Hyp', 'hint3Hyp'];
  const success = shownTrial?.ok;

  /* ── commandes visibles ── */
  const showLeg = (leg) => lab.square && !lab.closed && L.canSetLeg(lab, leg) === true;
  const showCompass = lab.square && !lab.closed && lab.base != null && lab.mode !== 'ruler';
  const showSwing = showCompass && lab.opening != null;
  const showJoin = lab.square && !lab.closed && lab.mode === 'ruler';

  return (
    <ManipulationShell
      type="angle-compass"
      title={title ?? k('title')}
      mission={missionText}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      guided={cpActive}
      hints={hintKeys.map((h) => <MathText key={h}>{k(h, { target: `$${targetTex}$` })}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={(
        <ManipulationDiscovery
          state={state}
          prompt={<MathText>{k(mode === 'construct' ? 'dPromptConstruct' : 'dPromptRelation')}</MathText>}
          options={discoveryOptions}
          formal={formal}
        />
      )}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/70 to-amber-50/40">
        <div ref={boxRef} className="relative space-y-2" data-angle-compass data-step={step} data-target-idx={lab.idx}
          data-solved={ready ? 'true' : 'false'} data-world={theme} data-scale={scale.toFixed(2)}>
          {party.node}
          {cp.node}
          <div ref={glanceRef} className="space-y-1.5" data-ac-glance>
            {/* LES ÉTAPES : une par cible, puis la règle */}
            {cpActive && <LabStepper count={stageIds.length} current={stepCur} done={stepDone} stepAttr="data-ac-step" />}
            {/* LA CIBLE */}
            <p className={`flex flex-wrap items-center justify-center gap-x-2 ${narrow ? 'text-xs' : 'text-sm'} font-extrabold text-indigo-950`} data-ac-target={`${target.ratio}:${target.value}`}>
              {lab.targets.length > 1 && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-800">{k('targetCount', { n: lab.idx + 1, total: lab.targets.length })}</span>}
              <span>{k('targetLabel')}</span>
              <MathText>{`$${targetTex}$`}</MathText>
              {lab.solved[lab.idx] && <span className="text-emerald-700" aria-hidden="true">✓</span>}
            </p>

            {/* LA SCÈNE : le dessin, et par-dessus les poignées (HTML, ≥ 44 px) */}
            <div ref={sceneRef} className="relative mx-auto overflow-hidden rounded-2xl" style={{ width: W, height: H }} data-ac-scene>
              <BeachScene W={W} H={H} P={P} scale={scale} />
              <Gull reduce={reduce} />
              <ConstructionSvg lab={lab} Ls={Ls} P={P} W={W} H={H} scale={scale} ptH={ptH} ptV={ptV} tipAt={tipAt} pivot={pivot}
                shownTrial={shownTrial} success={success} reduce={reduce} />

              {/* l'équerre avant d'être posée : glisser jusqu'au coin O, ou toucher */}
              {!lab.square && (() => {
                const at = P(squarePos ?? squareHome);
                return (
                  <button type="button" data-ac-square aria-label={k('squareHandle')}
                    onClick={() => { if (!squareDrag.current?.moved) place(); squareDrag.current = null; }}
                    onPointerDown={(e) => { if (e.button > 0) return; e.currentTarget.setPointerCapture?.(e.pointerId); squareDrag.current = { x: e.clientX, y: e.clientY, moved: false }; }}
                    onPointerMove={(e) => {
                      const d = squareDrag.current; if (!d) return;
                      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) d.moved = true;
                      if (d.moved) setSquarePos(fromClient(e.clientX, e.clientY));
                    }}
                    onPointerUp={(e) => {
                      const d = squareDrag.current; if (!d?.moved) return;
                      const [x, y] = fromClient(e.clientX, e.clientY);
                      if (Math.hypot(x, y) < 2.6) place(); else setSquarePos(null);
                    }}
                    className={`${KNOB} h-14 w-14 border-amber-600 bg-amber-50/95 text-amber-800 focus-visible:ring-amber-300`}
                    style={{ left: at[0], top: at[1], touchAction: 'none', cursor: 'grab' }}>
                    <SetSquareIcon />
                  </button>
                );
              })()}

              {/* les deux reports : une poignée par côté de l'angle droit */}
              {[['h', legH], ['v', legV]].map(([leg, st]) => {
                if (!showLeg(leg)) return null;
                const n = lab.legs[leg];
                const p0 = P(leg === 'h' ? [n ?? 1, 0] : [0, n ?? 1]);
                const at = inside([p0[0] + (leg === 'v' ? -22 : 0), p0[1] + (leg === 'h' ? 22 : 0)]);
                return (
                  <div key={leg} {...st.trackProps} {...st.handleProps({ label: k(`legHandle.${leg}`), valueText: n == null ? k('legEmpty') : k('legValue', { n }) })}
                    data-ac-leg={leg} data-value={n ?? 0}
                    className={`${KNOB} ${n == null ? 'border-dashed border-sky-500 bg-white/70' : 'border-sky-700 bg-sky-50/95'} text-sky-800 focus-visible:ring-sky-300`}
                    style={{ ...st.trackProps.style, left: at[0], top: at[1] }}>
                    <span aria-hidden="true" className="text-xs font-extrabold" dir="ltr">{n ?? '↔'}</span>
                  </div>
                );
              })}

              {/* la mine du compas sur l'arc : la faire tourner */}
              {showSwing && (() => {
                const at = inside(P(tipAt(lab.swing)));
                return (
                  <div {...swingSt.trackProps} {...swingSt.handleProps({ label: k('swingHandle'), valueText: k('swingValue', { deg: Math.round(90 - lab.swing) }) })}
                    data-ac-swing={Math.round(lab.swing)}
                    className={`${KNOB} border-fuchsia-600 bg-fuchsia-50/95 text-fuchsia-800 focus-visible:ring-fuchsia-300`}
                    style={{ ...swingSt.trackProps.style, left: at[0], top: at[1] }}>
                    <span aria-hidden="true" className="text-base">↻</span>
                  </div>
                );
              })()}

              {/* désigner le sommet de x : au point du sable (B, l'enfant) ou de la verticale (A, le cerf-volant) */}
              {lab.closed && [['h', ptH], ['v', ptV]].map(([v, pt]) => {
                const p0 = P(pt);
                const at = inside([p0[0] + (v === 'h' ? 26 : 30), p0[1] + (v === 'h' ? -26 : -10)]);
                const on = lab.vertex === v;
                return (
                  <button key={v} type="button" onClick={() => setLab((s) => L.pick(s, v))} data-ac-vertex={v}
                    aria-label={k(`vertexLabel.${v}`)} aria-pressed={on}
                    className={`${KNOB} ${on ? (shownTrial?.ok ? 'border-emerald-600 bg-emerald-50/95' : 'border-rose-500 bg-rose-50/95') : 'border-indigo-500 bg-white/85'} text-indigo-900 focus-visible:ring-indigo-300`}
                    style={{ left: at[0], top: at[1] }}>
                    <span aria-hidden="true" className="text-sm font-extrabold" dir="ltr">{`x?`}</span>
                  </button>
                );
              })}

              {/* LA LECTURE de l'angle désigné : flottante, sur le ciel */}
              {shownTrial && (
                <MovablePanel id="angle-compass.reading" bounds={sceneRef} title={k('panelTitle')} className={`absolute right-1 top-1 z-20 ${narrow ? 'max-w-[58%]' : 'max-w-[min(15rem,48%)]'}`}>
                  <ReadingPanel trial={shownTrial} k={k} narrow={narrow} />
                </MovablePanel>
              )}
            </div>

            {/* LES COMMANDES — juste sous la scène */}
            <div className="space-y-1.5" data-ac-controls>
            {showCompass && (
              <div className="flex items-center gap-1.5" dir="ltr" data-ac-compass-row>
                <button type="button" onClick={() => openSt.nudge(-1)} aria-label={k('openLess')} data-ac-open-less className={`${BTN} border-slate-300 bg-white focus-visible:ring-fuchsia-400`}><Minus className="h-4 w-4" aria-hidden="true" /></button>
                <CompassTrack st={openSt} value={lab.opening} max={L.MAX_OPEN} label={k('openHandle')} valueText={lab.opening == null ? k('openEmpty') : k('openValue', { r: lab.opening })} />
                <button type="button" onClick={() => openSt.nudge(1)} aria-label={k('openMore')} data-ac-open-more className={`${BTN} border-slate-300 bg-white focus-visible:ring-fuchsia-400`}><Plus className="h-4 w-4" aria-hidden="true" /></button>
                <button type="button" onClick={() => setLab((s) => L.sweep(s))} disabled={lab.opening == null} data-ac-sweep
                  className={`${BTN} border-fuchsia-700 bg-fuchsia-700 text-white focus-visible:ring-fuchsia-300`}>
                  <span aria-hidden="true">↻</span>{narrow ? <span className="sr-only">{k('sweep')}</span> : <span dir="rtl">{k('sweep')}</span>}
                </button>
              </div>
            )}
            {(showJoin || lab.square) && (
              <div className="flex flex-wrap items-center justify-center gap-1.5" data-ac-tools-row>
                {showJoin && (
                  <button type="button" onClick={() => setLab((s) => L.join(s))} disabled={lab.legs.h == null || lab.legs.v == null} data-ac-join
                    className={`${BTN} border-sky-700 bg-sky-700 text-white focus-visible:ring-sky-300`}>
                    <Ruler className="h-4 w-4" aria-hidden="true" />{k('join')}
                  </button>
                )}
                {lab.square && (
                  <button type="button" onClick={() => setLab((s) => L.fresh(s))} data-ac-fresh className={`${BTN} border-slate-300 bg-white text-slate-700 focus-visible:ring-indigo-400`}>
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />{k('fresh')}
                  </button>
                )}
                {L.canNext(lab) && !cp.blocking && (
                  <button type="button" onClick={() => setLab((s) => L.next(s))} data-ac-next className={`${BTN} border-indigo-700 bg-indigo-700 text-white focus-visible:ring-indigo-300`}>
                    {k('next')}<ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            )}

            </div>

            {/* LA LECTURE, puis le verdict */}
            <p className="text-center text-xs font-bold text-slate-600" data-ac-reading><MathText>{reading}</MathText></p>
            {cpActive && lab.solved[lab.idx] && lab.idx === lastIdx && !ready && !doneIds.rule && (
              <p className="text-center text-xs font-extrabold text-indigo-900" data-ac-compare>{k('compareNote')}</p>
            )}
            <p role="status" className={`min-h-[2.5rem] ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug`} data-ac-verdict={verdictKind}>{verdict}</p>
          </div>

          {lab.trials.length > 0 && (
            <LabFold id="angle-compass.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-ac-trials={lab.trials.length}>
                {lab.trials.map((tr, i) => {
                  const ev = L.evidenceOf(tr);
                  return (
                    <li key={i} className={tr.ok ? 'text-emerald-800' : 'text-rose-800'} data-ok={String(tr.ok)}>
                      <MathText>{k(`row.${tr.kind}`, { ratio: `$${ratioAtTex(tr)}$`, deg: ev.deg, h: `$${TR.surdLatex(tr.lengths.h)}$`, v: `$${TR.surdLatex(tr.lengths.v)}$`, c: `$${TR.surdLatex(tr.lengths.c)}$` })}</MathText>
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

/* ── le panneau de lecture : rapports exacts, carrés, rapporteur contre calculatrice ── */
function ReadingPanel({ trial, k, narrow }) {
  const r = trial.ratios;
  // sur un téléphone le panneau flotte sur le ciel : fractions en ligne (\tfrac), pour qu'il reste petit
  const T = (tex) => (narrow ? tex.replace(/\\dfrac/g, '\\tfrac') : tex);
  const sq = L.squaresOf(r);
  const ev = L.evidenceOf(trial);
  const V = NAME[trial.vertex];
  const c2 = LIN.toNumber(sq.c2);
  return (
    <div className={`space-y-1 ${narrow ? 'text-[10px] leading-tight' : 'text-xs'}`} data-ac-panel={trial.kind}>
      <div className="flex flex-wrap gap-x-2 gap-y-0.5" dir="ltr">
        {['cos', 'sin', 'tan'].map((kind) => (
          <MathText key={kind}>{T(`$${KIND_TEX[kind]}\\widehat{${V}} = ${L.tex(r[kind])}$`)}</MathText>
        ))}
      </div>
      {/* la barre des carrés : elle remplit exactement 1 — sur tout triangle rectangle */}
      <div data-ac-squares={`${LIN.fracText(sq.c2)}+${LIN.fracText(sq.s2)}`} className={narrow ? 'flex flex-wrap items-center gap-x-2' : ''}>
        {!narrow && <p className="shrink-0 font-bold text-slate-700">{k('squaresLabel')}</p>}
        <div className="relative mt-0.5 flex h-4 min-w-[4rem] flex-1 overflow-hidden rounded-md border border-slate-400 bg-white" dir="ltr" aria-hidden="true">
          <div className="h-full bg-sky-400" style={{ width: `${c2 * 100}%` }} />
          <div className="h-full bg-amber-400" style={{ width: `${(1 - c2) * 100}%` }} />
        </div>
        <p dir="ltr" className="mt-0.5 shrink-0 text-center"><MathText>{T(`$${narrow ? '' : `\\cos^2\\widehat{${V}} + \\sin^2\\widehat{${V}} = `}${LIN.fracLatex(sq.c2)} + ${LIN.fracLatex(sq.s2)} = ${LIN.fracLatex(sq.sum)}$`)}</MathText></p>
      </div>
      <p className="font-bold text-slate-800" data-ac-protractor={ev.protractor}>
        {k('protractor')} <MathText>{`$\\widehat{${V}} \\approx ${ev.protractor}^{\\circ}$`}</MathText>
        <span className="mx-1 text-slate-400" aria-hidden="true">·</span>
        {k('calculator')} <code dir="ltr" className="rounded bg-slate-100 px-1">{`${trial.ratio}⁻¹`}</code> <MathText>{`$\\approx ${ev.targetDeg.replace(',', '{,}')}^{\\circ}$`}</MathText>
      </p>
    </div>
  );
}

/* ── la jambe-crayon du compas : l'ouverture (le fil), tenue ── */
function CompassTrack({ st, value, max, label, valueText }) {
  const f = value == null ? 0 : (value - 1) / (max - 1);
  return (
    <div {...st.trackProps} className="relative h-12 min-w-[110px] flex-1 rounded-xl border-2 border-fuchsia-200 bg-fuchsia-50/50" style={st.trackProps.style} data-ac-open-track>
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false" preserveAspectRatio="none" viewBox="0 0 100 48">
        {Array.from({ length: max }, (_, i) => (
          <line key={i} x1={6 + (i / (max - 1)) * 88} y1="40" x2={6 + (i / (max - 1)) * 88} y2={i % 2 ? 44 : 46} stroke="#a21caf" strokeWidth="0.6" />
        ))}
        <path d={`M 6 40 Q ${6 + f * 44} ${10 + (1 - f) * 8} ${6 + f * 88} 40`} fill="none" stroke="#7c3aed" strokeWidth="1.2" strokeDasharray="2 1.5" />
      </svg>
      <div {...st.handleProps({ label, valueText })} data-ac-open={value ?? 0}
        className={`absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 ${value == null ? 'border-dashed border-fuchsia-400 bg-white/70' : 'border-fuchsia-600 bg-white/95'} outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-300`}
        style={{ left: `calc(22px + ${f} * (100% - 44px))`, cursor: st.dragging ? 'grabbing' : 'grab' }}>
        <span aria-hidden="true" className="text-xs font-extrabold text-fuchsia-800" dir="ltr">{value ?? '✎'}</span>
      </div>
    </div>
  );
}

/* ── la construction : équerre, graduations, reports, arc, hypoténuse (le fil), sommets, rapporteur ── */
function ConstructionSvg({ lab, P, W, H, scale, ptH, ptV, tipAt, pivot, shownTrial, success, reduce }) {
  const O = P([0, 0]);
  const reach = 12.2;
  const ends = { h: P([reach, 0]), v: P([0, reach]) };
  const arcPts = [];
  if (lab.mode === 'compass' && lab.opening != null) {
    // l'arc tracé : de 90° (départ, le fil parallèle à l'autre côté) jusqu'à la mine
    for (let d = 90; d >= lab.swing - 0.001; d -= 2) arcPts.push(P(tipAt(Math.max(d, lab.swing))));
    arcPts.push(P(tipAt(lab.swing)));
  }
  const cTip = lab.mode === 'compass' && lab.opening != null ? P(tipAt(lab.swing)) : null;
  const cPivot = P(pivot);
  const hinge = cTip ? [(cPivot[0] + cTip[0]) / 2 - (cTip[1] - cPivot[1]) * 0.35, (cPivot[1] + cTip[1]) / 2 + (cTip[0] - cPivot[0]) * 0.35] : null;
  const A = ptV ? P(ptV) : null;
  const B = ptH ? P(ptH) : null;
  const kitePos = A ?? (lab.mode === 'compass' && lab.base === 'h' && cTip && lab.closed ? cTip : null);
  const tickLen = Math.max(4, 0.22 * scale);
  return (
    <svg width={W} height={H} className="absolute inset-0" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
      <style>{'.ac-kite{transform-box:fill-box;transform-origin:50% 100%;animation:ac-k 2.6s ease-in-out infinite}@keyframes ac-k{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(5deg)}}.ac-joy{animation:ac-j .9s ease-in-out 2}@keyframes ac-j{0%,100%{transform:rotate(0)}50%{transform:rotate(14deg) scale(1.08)}}@media (prefers-reduced-motion: reduce){.ac-kite,.ac-joy{animation:none}}'}</style>
      {lab.square && (
        <g>
          {/* les deux côtés de l'angle droit, gradués (la règle) */}
          <line x1={O[0]} y1={O[1]} x2={ends.h[0]} y2={ends.h[1]} stroke="#0f172a" strokeWidth="2" />
          <line x1={O[0]} y1={O[1]} x2={ends.v[0]} y2={ends.v[1]} stroke="#0f172a" strokeWidth="2" />
          {Array.from({ length: 12 }, (_, i) => i + 1).map((i) => {
            const ph = P([i, 0]); const pv = P([0, i]);
            return (
              <g key={i}>
                <line x1={ph[0]} y1={ph[1]} x2={ph[0]} y2={ph[1] + tickLen} stroke="#475569" strokeWidth="1" />
                <line x1={pv[0]} y1={pv[1]} x2={pv[0] - tickLen} y2={pv[1]} stroke="#475569" strokeWidth="1" />
                {i % 2 === 0 && scale > 15 && <text x={ph[0]} y={ph[1] + tickLen + 10} fontSize="9" fill="#64748b" textAnchor="middle">{i}</text>}
                {i % 2 === 0 && scale > 15 && <text x={pv[0] - tickLen - 3} y={pv[1] + 3} fontSize="9" fill="#64748b" textAnchor="end">{i}</text>}
              </g>
            );
          })}
          {/* l'équerre posée et l'angle droit */}
          <polygon points={[P([0, 0]), P([2.4, 0]), P([0, 2.4])].map((p) => p.join(',')).join(' ')} fill="rgba(245,158,11,0.22)" stroke="#b45309" strokeWidth="1.2" />
          <polyline points={[P([0.6, 0]), P([0.6, 0.6]), P([0, 0.6])].map((p) => p.join(',')).join(' ')} fill="none" stroke="#e11d48" strokeWidth="1.4" />
          <text x={O[0] - 8} y={O[1] + 14} fontSize="13" fontWeight="800" fill="#0f172a" textAnchor="middle">O</text>
        </g>
      )}
      {/* les reports */}
      {B && <g><line x1={O[0]} y1={O[1]} x2={B[0]} y2={B[1]} stroke="#0369a1" strokeWidth="4" strokeLinecap="round" /><circle cx={B[0]} cy={B[1]} r="3.5" fill="#0369a1" /><text x={B[0]} y={B[1] + 26} fontSize="13" fontWeight="800" fill="#0f172a" textAnchor="middle">B</text></g>}
      {A && <g><line x1={O[0]} y1={O[1]} x2={A[0]} y2={A[1]} stroke="#0369a1" strokeWidth="4" strokeLinecap="round" /><circle cx={A[0]} cy={A[1]} r="3.5" fill="#0369a1" /><text x={A[0] - 12} y={A[1] - 6} fontSize="13" fontWeight="800" fill="#0f172a" textAnchor="middle">A</text></g>}
      {/* l'arc du compas, et le compas lui-même */}
      {arcPts.length > 1 && <polyline points={arcPts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#a21caf" strokeWidth="1.8" data-ac-arc={Math.round(lab.swing)} />}
      {cTip && !lab.closed && hinge && (
        <g opacity="0.85">
          <line x1={cPivot[0]} y1={cPivot[1]} x2={hinge[0]} y2={hinge[1]} stroke="#475569" strokeWidth="2" />
          <line x1={hinge[0]} y1={hinge[1]} x2={cTip[0]} y2={cTip[1]} stroke="#a21caf" strokeWidth="2" />
          <circle cx={hinge[0]} cy={hinge[1]} r="3.5" fill="#334155" />
        </g>
      )}
      {/* l'hypoténuse : le fil du cerf-volant */}
      {lab.closed && A && B && <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={success ? '#059669' : '#7c3aed'} strokeWidth="2.4" data-ac-hyp />}
      {/* l'angle désigné et le rapporteur posé dessus */}
      {shownTrial && A && B && <AngleMark at={shownTrial.vertex === 'h' ? B : A} other={shownTrial.vertex === 'h' ? A : B} base={shownTrial.vertex === 'h' ? O : O} deg={shownTrial.deg} ok={shownTrial.ok} scale={scale} />}
      {/* le décor du monde : l'enfant au point du sable, le cerf-volant au point de la verticale */}
      {B && <Child at={B} scale={scale} />}
      {kitePos && <Kite at={kitePos} scale={scale} joy={success && !reduce} />}
    </svg>
  );
}

function AngleMark({ at, other, base, ok, scale }) {
  const r = Math.max(22, 1.6 * scale);
  const a0 = Math.atan2(base[1] - at[1], base[0] - at[0]);
  const a1 = Math.atan2(other[1] - at[1], other[0] - at[0]);
  let d = a1 - a0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
  const p0 = [at[0] + r * Math.cos(a0), at[1] + r * Math.sin(a0)];
  const p1 = [at[0] + r * Math.cos(a0 + d), at[1] + r * Math.sin(a0 + d)];
  const mid = a0 + d / 2;
  const R = r * 1.9;
  // le rapporteur : un demi-disque gradué centré au sommet, posé le long du côté de l'angle droit
  const ticks = Array.from({ length: 19 }, (_, i) => i * 10);
  const sgn = d > 0 ? 1 : -1;
  return (
    <g data-ac-mark>
      <g opacity="0.55" data-ac-protractor-drawing>
        <path d={`M ${at[0] + R * Math.cos(a0)} ${at[1] + R * Math.sin(a0)} A ${R} ${R} 0 0 ${sgn > 0 ? 1 : 0} ${at[0] + R * Math.cos(a0 + sgn * Math.PI)} ${at[1] + R * Math.sin(a0 + sgn * Math.PI)} Z`} fill="rgba(186,230,253,0.45)" stroke="#0284c7" strokeWidth="1" />
        {ticks.map((tk) => {
          const a = a0 + sgn * (tk * Math.PI) / 180;
          const l = tk % 30 === 0 ? 7 : 4;
          return <line key={tk} x1={at[0] + R * Math.cos(a)} y1={at[1] + R * Math.sin(a)} x2={at[0] + (R - l) * Math.cos(a)} y2={at[1] + (R - l) * Math.sin(a)} stroke="#0369a1" strokeWidth="1" />;
        })}
      </g>
      <path d={`M ${p0[0]} ${p0[1]} A ${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${p1[0]} ${p1[1]}`} fill="none" stroke={ok ? '#059669' : '#e11d48'} strokeWidth="2.2" />
      <text x={at[0] + (r + 10) * Math.cos(mid)} y={at[1] + (r + 10) * Math.sin(mid) + 4} fontSize="14" fontWeight="800" fill={ok ? '#065f46' : '#9f1239'} textAnchor="middle">x</text>
    </g>
  );
}

/* ── le décor de la plage — aria-hidden, aucune information ── */
function BeachScene({ W, H, P }) {
  const sand = P([BOX.x0, 0]);
  const horizon = P([0, 3.2]);
  return (
    <svg width={W} height={H} className="absolute inset-0" aria-hidden="true" focusable="false" data-deco="kite">
      <defs>
        <linearGradient id="ac-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bae6fd" /><stop offset="1" stopColor="#f0f9ff" /></linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} fill="url(#ac-sky)" />
      <circle cx={W * 0.86} cy={H * 0.12} r={Math.max(10, W * 0.05)} fill="#fde68a" opacity="0.9" />
      <rect x="0" y={horizon[1]} width={W} height={Math.max(0, sand[1] - horizon[1])} fill="#7dd3fc" opacity="0.35" />
      <path d={`M 0 ${horizon[1] + 8} q ${W / 16} -5 ${W / 8} 0 t ${W / 8} 0 t ${W / 8} 0 t ${W / 8} 0 t ${W / 8} 0 t ${W / 8} 0 t ${W / 8} 0 t ${W / 8} 0`} fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity="0.6" />
      <rect x="0" y={sand[1]} width={W} height={H - sand[1]} fill="#fde68a" opacity="0.75" />
      {/* un parasol au bout de la plage */}
      <g opacity="0.8" transform={`translate(${W * 0.93} ${sand[1]})`}>
        <line x1="0" y1="0" x2="-4" y2={-H * 0.12} stroke="#78350f" strokeWidth="2" />
        <path d={`M ${-4 - W * 0.06} ${-H * 0.12} Q -4 ${-H * 0.19} ${-4 + W * 0.06} ${-H * 0.12} Z`} fill="#e11d48" />
        <path d={`M ${-4 - W * 0.02} ${-H * 0.12} Q -4 ${-H * 0.17} ${-4 + W * 0.02} ${-H * 0.12} Z`} fill="#f8fafc" />
      </g>
    </svg>
  );
}

function Child({ at, scale }) {
  const s = Math.max(0.7, scale / 24);
  return (
    <g transform={`translate(${at[0] + 10 * s} ${at[1]}) scale(${s})`} data-deco="child" opacity="0.9">
      <circle cx="0" cy="-30" r="5" fill="#92400e" />
      <path d="M 0 -25 L 0 -12 M 0 -12 L -5 0 M 0 -12 L 5 0 M 0 -21 L -7 -26 M 0 -21 L 7 -16" stroke="#1e293b" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <rect x="-4" y="-25" width="8" height="10" rx="2" fill="#059669" />
    </g>
  );
}

function Kite({ at, scale, joy }) {
  const s = Math.max(0.7, scale / 22);
  return (
    <g transform={`translate(${at[0]} ${at[1]}) scale(${s})`} data-deco="kite-toy">
      <g className={joy ? 'ac-joy' : 'ac-kite'}>
        <path d="M 0 -26 L 11 -12 L 0 0 L -11 -12 Z" fill="#059669" stroke="#0f172a" strokeWidth="1.2" />
        <path d="M 0 -26 L 11 -12 L 0 -12 Z" fill="#f8fafc" />
        <path d="M 0 -12 L 11 -12 L 0 0 Z" fill="#f8fafc" opacity="0.4" />
        <circle cx="1.5" cy="-13" r="3" fill="#e11d48" />
        <path d="M 0 0 q 4 6 0 10 q -4 5 1 10" fill="none" stroke="#e11d48" strokeWidth="1.4" />
      </g>
    </g>
  );
}

function SetSquareIcon() {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true" focusable="false">
      <polygon points="6,34 34,34 6,6" fill="rgba(245,158,11,0.35)" stroke="#b45309" strokeWidth="2" />
      <polygon points="11,29 21,29 11,19" fill="#fffbeb" stroke="#b45309" strokeWidth="1.2" />
      <polyline points="6,28 12,28 12,34" fill="none" stroke="#e11d48" strokeWidth="1.6" />
    </svg>
  );
}

/** Une mouette qui s'envole au toucher. Décor seulement. */
function Gull({ reduce }) {
  const [taps, setTaps] = useState(0);
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => setTaps((n) => n + 1)} data-deco="gull"
      className="absolute top-[18%] z-10 h-9 w-12 rounded-xl focus:outline-none" style={{ insetInlineStart: '38%' }}>
      <svg viewBox="0 0 60 30" width="100%" height="100%">
        <style>{'.ac-g{animation:ac-g 1.1s ease-out 1}@keyframes ac-g{0%{transform:translate(0,0)}50%{transform:translate(-10px,-8px)}100%{transform:translate(0,0)}}@media (prefers-reduced-motion: reduce){.ac-g{animation:none}}'}</style>
        <path key={taps} className={taps > 0 && !reduce ? 'ac-g' : undefined} d="M 8 18 Q 18 6 30 16 Q 42 6 52 18" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </button>
  );
}


/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** Les suites : `t` après CHAQUE cible atteinte (le triangle construit) ; `rule*` à la fin, quand le contraste est vu (la règle remplace la découverte). */
export const CHAINS = Object.freeze({
  t: ['den', 'third', 'ratio'],
  ruleRelation: ['degree', 'squares', 'rule'],
  ruleConstruct: ['degree', 'rule'],
});

const $ = (x) => `$${x}$`;
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const LEN = { h: 'OB', v: 'OA', c: 'AB' };
/** Un surd rationnel → son texte exact pour une réponse (4, 3/2) ; sinon null (la question est alors sautée). */
const exactText = (x) => (x.r === 1 ? LIN.fracText(x.q) : null);
const lensTex = (Ls) => $(`OB=${TR.surdLatex(Ls.h)},\\ OA=${TR.surdLatex(Ls.v)},\\ AB=${TR.surdLatex(Ls.c)}`);
const ratioTex = (kind, x) => `${KIND_TEX[kind]}\\,x=${L.tex(x)}`;

/** Chaque question est construite sur LE triangle de l'élève (rien en dur) ; `k` : les textes de `angleCompass`. */
export const QUESTIONS = {
  den: ({ k, tr }) => {
    const side = TR.RATIO_SIDES[tr.ratio].den;
    const len = L.sidesAt(tr.lengths, tr.vertex)[side];
    const e = exactText(len);
    if (e == null) return null;
    return {
      id: 'den', kind: 'number', expected: e, answer: <MathText>{$(TR.surdLatex(len))}</MathText>,
      prompt: Mx(k, 'den.prompt', { ratio: $(ratioTex(tr.ratio, tr.ratios[tr.ratio])) }),
      hints: [Mx(k, side === 'hypotenuse' ? 'den.hint1Hyp' : 'den.hint1Adj'), Mx(k, 'den.hint2', { lens: lensTex(tr.lengths) })],
      explain: Mx(k, 'den.explain', { side: k(`cp.side.${side}`), den: $(TR.surdLatex(len)), ratio: $(ratioTex(tr.ratio, tr.ratios[tr.ratio])) }),
    };
  },
  third: ({ k, tr }) => {
    const leg = L.cutLeg(tr);
    if (!leg) return null;
    const base = leg === 'h' ? 'v' : 'h';
    const len = tr.lengths[leg];
    const e = exactText(len);
    if (e == null) return null;
    const a = TR.surdNumber(tr.lengths[base]); const c = TR.surdNumber(tr.lengths.c);
    const calc = `${LEN[leg]}^2=${c}^2-${a}^2`;
    return {
      id: 'third', kind: 'number', expected: e, answer: <MathText>{$(TR.surdLatex(len))}</MathText>,
      prompt: Mx(k, 'third.prompt', { leg: $(LEN[leg]), a: $(`${LEN[base]}=${a}`), c: $(`AB=${c}`) }),
      hints: [Mx(k, 'third.hint1'), Mx(k, 'third.hint2', { calc: $(calc) })],
      explain: Mx(k, 'third.explain', { calc: $(`${calc}=${c * c - a * a}`), leg: $(`${LEN[leg]}=${TR.surdLatex(len)}`) }),
    };
  },
  ratio: ({ k, tr }) => {
    const o = tr.ratio === 'cos' ? 'sin' : tr.ratio === 'sin' ? 'cos' : 'sin';
    const sd = L.sidesAt(tr.lengths, tr.vertex);
    const { num, den } = TR.RATIO_SIDES[o];
    const val = tr.ratios[o];
    const right = L.tex(val);
    const wrongs = ['cos', 'sin', 'tan'].filter((x) => x !== o && L.tex(tr.ratios[x]) !== right);
    const opt = (kind) => ({ text: <MathText>{$(L.tex(tr.ratios[kind]))}</MathText>, why: Mx(k, 'ratio.whyOther', { wrong: $(KIND_TEX[kind]), o: $(KIND_TEX[o]), def: k(`cp.def.${o}`) }) });
    const options = [opt(wrongs[0]), { text: <MathText>{$(right)}</MathText>, correct: true }, ...wrongs.slice(1).map(opt)];
    return {
      id: 'ratio', kind: 'choice', cols: 3,
      prompt: Mx(k, 'ratio.prompt', { where: k(`where.${tr.vertex}`), o: $(KIND_TEX[o]) }),
      options,
      hints: [Mx(k, 'ratio.hint1', { o: $(KIND_TEX[o]), def: k(`cp.def.${o}`) }), Mx(k, 'ratio.hint2', { num: $(TR.surdLatex(sd[num])), den: $(TR.surdLatex(sd[den])) })],
      explain: Mx(k, 'ratio.explain', { calc: $(`${KIND_TEX[o]}\\,x=\\dfrac{${TR.surdLatex(sd[num])}}{${TR.surdLatex(sd[den])}}=${right}`) }),
    };
  },
  degree: ({ k, lastTr }) => {
    const p = L.evidenceOf(lastTr).protractor;
    const lo = Math.floor(p / 10) * 10;
    return {
      id: 'degree', kind: 'number', expected: String(p), answer: <MathText>{$(`${p}^{\\circ}`)}</MathText>,
      prompt: Mx(k, 'degree.prompt'),
      hints: [Mx(k, 'degree.hint1'), Mx(k, 'degree.hint2', { lo: $(`${lo}^{\\circ}`), hi: $(`${lo + 10}^{\\circ}`) })],
      explain: Mx(k, 'degree.explain', { p: $(`${p}^{\\circ}`) }),
    };
  },
  squares: ({ k, lastTr }) => {
    const r = lastTr.ratios;
    const sq = L.squaresOf(r);
    const calc = `\\left(${L.tex(r.cos)}\\right)^2+\\left(${L.tex(r.sin)}\\right)^2`;
    return {
      id: 'squares', kind: 'number', expected: '1', answer: <MathText>{$('1')}</MathText>,
      prompt: Mx(k, 'squares.prompt', { c: $(`\\cos x=${L.tex(r.cos)}`), s: $(`\\sin x=${L.tex(r.sin)}`) }),
      hints: [Mx(k, 'squares.hint1'), Mx(k, 'squares.hint2', { calc: $(calc) })],
      explain: Mx(k, 'squares.explain', { calc: $(`${calc}=${LIN.fracLatex(sq.c2)}+${LIN.fracLatex(sq.s2)}=1`) }),
    };
  },
  rule: ({ k, mode, lastTr, discoveryOptions, formal }) => {
    const construct = mode === 'construct';
    const sq = lastTr ? L.squaresOf(lastTr.ratios) : null;
    return {
      id: 'rule', kind: 'choice',
      prompt: <MathText>{k(construct ? 'dPromptConstruct' : 'dPromptRelation')}</MathText>,
      options: discoveryOptions,
      hints: [Mx(k, construct ? 'rule.hintC1' : 'rule.hintR1'),
        construct || !sq ? Mx(k, 'rule.hintC2') : Mx(k, 'rule.hintR2', { calc: $(`${LIN.fracLatex(sq.c2)}+${LIN.fracLatex(sq.s2)}`) })],
      explain: formal,
    };
  },
};
