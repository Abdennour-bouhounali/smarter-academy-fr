import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus, RotateCcw, RotateCw, Video } from 'lucide-react';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import useDragInteraction from '../useDragInteraction';
import DragGhost from '../primitives/DragGhost';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import MathText from '../../components/MathText';
import * as L from '../logic/rampRatios';

/**
 * ramp-ratios — LES RAMPES DU SKATEPARK (unité 10 « حساب المثلثات في المثلث القائم », درس « النسب المثلثية
 * لزاوية حادة في مثلث قائم », نشاط 1 et نشاط 2 p. 116).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. مبتدئ : l'élève TOUCHE l'angle aigu (B ou C ; A, l'angle droit, est refusé), PORTE les étiquettes « الوتر »,
 *    « المقابل », « المجاور » sur les côtés de la rampe, PORTE les côtés nommés dans le numérateur et le
 *    dénominateur de cos, sin, tan, puis LÈVE la rampe par sa poignée C (la hauteur, donc l'angle au degré).
 *    متقدم (نشاط 2) : il ALLONGE la planche (poignée C, au demi-mètre) à B̂ = 40° imposé, enregistre chaque rampe
 *    et JUGE avant de lire si AC/BC et AC/AB ont changé ; il TOURNE l'angle (poignée sur l'arc en B) pour comparer.
 * B. Idée : dans un triangle rectangle, cos = adjacent ÷ hypoténuse, sin = opposé ÷ hypoténuse, tan = opposé ÷
 *    adjacent, relativement à l'angle choisi ; ces rapports ne dépendent que de l'angle (pas de la taille) ;
 *    l'hypoténuse est le plus grand côté, donc 0 < sin, cos < 1.
 * C. La rampe se lève : la planche s'allonge AVANT la hauteur, l'arc de la planche couchée sur le sol finit
 *    toujours après A et s'élève toujours au-dessus de C ; en متقدم la nouvelle rampe recouvre les rampes
 *    enregistrées (triangles emboîtés, verticales parallèles — la figure du نشاط 2).
 * D. Les longueurs lues (≈ au centième), les fractions composées et leurs valeurs ; en متقدم le tableau des
 *    rampes (AC/BC, AC/AB) et le verdict de chaque jugement.
 * E. À découvrir avant la règle : مبتدئ — la hauteur ne rattrape jamais la planche (trois hauteurs au moins,
 *    écartées de 20°) ; متقدم — trois longueurs à 40° donnent les MÊMES rapports, une autre angle d'autres.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        les rapports trigonométriques d'un angle aigu ; ils ne dépendent que de l'angle ; 0 < sin, cos < 1
 *   OBJECT         une rampe de skatepark : la planche (hypoténuse), la hauteur, le sol
 *   VARIABLE       مبتدئ : la hauteur AC (l'angle B̂ au degré, 10°…65°) ; متقدم : la longueur de la planche BC
 *                  (2 m…9 m, au demi-mètre) et l'angle B̂ (20°…65°)
 *   INVARIANT      l'angle droit en A ; à angle fixe, AC/BC et AC/AB (trigonometry.sinDeg / tanDeg)
 *   TRANSFORMATION les trois longueurs, les rapports, l'arc de la planche couchée
 *   CONSTRAINT     un rapport d'un angle AIGU ; les côtés se nomment relativement à l'angle choisi
 *   RESISTANCE     une étiquette mal posée revient avec la raison (la planche appelée « المقابل » : elle fait face à
 *                  l'angle droit, c'est le وتر) ; l'hypoténuse au numérateur d'un sinus est refusée (le rapport dépasserait
 *                  1) ; la hauteur poussée au maximum reste sous la planche ; un jugement faux est réfuté par les
 *                  nombres de l'élève
 *   EVIDENCE       les fractions et leurs valeurs, l'arc, le tableau des rampes
 *   CONTRAST       مبتدئ : une rampe basse et une rampe raide ; B̂ puis Ĉ (les deux côtés de l'angle droit échangent
 *                  leurs noms) ; متقدم : trois longueurs au même angle, puis un autre angle
 *   PREDICTION     le jugement « لم تتغيّرا / تغيّرتا » AVANT la lecture des rapports (متقدم)
 *   DISCOVERY      « la planche reste plus longue : 0 < sin, cos < 1 » ; « les rapports ne dépendent que de l'angle »
 *   FORMALIZATION  cos B̂ = AB/BC, sin B̂ = AC/BC, tan B̂ = AC/AB ; sin 40° ≈ 0,64, tan 40° ≈ 0,84
 *   TRANSFER       les questions des نشاط 1 et 2 répondues depuis les lectures de l'élève (`onTrial`), معارف 1–2
 *
 * Monde : `skatepark` (les rampes du skatepark de quartier). Manuel (§6bis) : chaque geste est un choix — aucune
 * auto-complétion. DÉCOR (exigence du propriétaire, monde des jeunes) : le mur de graffitis, le skateur sur la
 * planche, le téléphone qui filme le trick (REC), une planche qui fait un kickflip au toucher. `aria-hidden`, hors
 * clavier, `[data-deco]`, jamais une information, immobile sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (§8bis) : la hauteur de la scène vient de l'écran de leçon (`useLessonViewport`) moins ce que le
 * bloc `[data-rr-glance]` MESURE en plus du dessin ; étiquettes, cases et poignées sont SUR la figure ou juste
 * dessous ; la liste des essais / rampes est dans un `LabFold` sous le bloc mesuré.
 *
 * Props : `angle`, `hyp` (مبتدئ) | `hyps` (متقدم, les rampes du manuel : repères), `mode` (`name` | `scale`), `theme`
 * (`skatepark`), `title`, `lead`, `mission`, `level`, `levels`, `onTrial(evidence)` à chaque essai / rampe jugée,
 * `onFinished({ mode })` à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-ramp-ratios][data-mode][data-at][data-b][data-i][data-stage][data-solved], [data-rr-glance],
 * [data-rr-scene], [data-rr-vertex=A|B|C], [data-rr-side=AB|AC|BC][data-role], [data-rr-label=<role>],
 * [data-rr-slot=<kind>:<num|den>], [data-rr-handle=rise|len|angle] (role=slider), [data-rr-less|more=<handle>],
 * [data-rr-record], [data-rr-claim=same|changed], [data-rr-verdict=<kind>], [data-rr-reading], [data-rr-value=<kind>],
 * [data-lab-fold=ramp-ratios.trials], [data-rr-trial=<n>], [data-rr-ramp=<n>][data-ok], [data-rr-formal], [data-deco].
 */
const comma = (s) => String(s).replace(',', '{,}');
const m = (x) => `${comma(L.fmt(x))}\\,\\mathrm{m}`;
const ANG = { B: '\\widehat{B}', C: '\\widehat{C}' };
const FN = { cos: '\\cos', sin: '\\sin', tan: '\\tan' };
const ROLE_TONE = { hypotenuse: 'amber', opposite: 'rose', adjacent: 'sky' };
const TONE = {
  amber: { chip: 'border-amber-500 bg-amber-50 text-amber-900', stroke: '#D97706' },
  rose: { chip: 'border-rose-500 bg-rose-50 text-rose-900', stroke: '#E11D48' },
  sky: { chip: 'border-sky-500 bg-sky-50 text-sky-900', stroke: '#0284C7' },
  slate: { chip: 'border-slate-300 bg-white/90 text-slate-700', stroke: '#334155' },
};

export function discoveryOptions(lab, k) {
  const scale = lab.mode === 'scale';
  if (scale) {
    const w = L.witnesses(lab);
    if (!w.small || !w.other) return [{ text: <MathText>{k('dRightAdv')}</MathText>, correct: true }];
    return [
      { text: <MathText>{k('dLonger')}</MathText>, why: <MathText>{k('dWhyLonger', { a: `$BC = ${comma(L.fmt(w.small.len, 1))}\\,\\mathrm{m}$`, b: `$BC = ${comma(L.fmt(w.big.len, 1))}\\,\\mathrm{m}$`, v: `$${comma(L.fmt(w.small.sin))}$` })}</MathText> },
      { text: <MathText>{k('dRightAdv')}</MathText>, correct: true },
      { text: <MathText>{k('dAll')}</MathText>, why: <MathText>{k('dWhyAll', { b: w.other.b, v: `$${comma(L.fmt(w.small.sin))}$`, v2: `$${comma(L.fmt(w.other.sin))}$` })}</MathText> },
    ];
  }
  const w = L.witnesses(lab);
  if (!w.high) return [{ text: <MathText>{k('dRight')}</MathText>, correct: true }];
  const ta = w.high.at;
  return [
    { text: <MathText>{k('dReach')}</MathText>, why: <MathText>{k('dWhyReach', { b: w.high.b, ac: `$AC \\approx ${m(w.high.AC)}$`, bc: `$BC \\approx ${m(w.high.BC)}$` })}</MathText> },
    { text: <MathText>{k('dSame')}</MathText>, why: <MathText>{k('dWhySame', { v1: `$\\sin${ANG[ta]} \\approx ${comma(L.fmt(w.low.values.sin))}$`, v2: `$\\sin${ANG[ta]} \\approx ${comma(L.fmt(w.high.values.sin))}$`, b1: w.low.b, b2: w.high.b })}</MathText> },
    { text: <MathText>{k('dRight')}</MathText>, correct: true },
  ];
}

export function Formal({ scale, k }) {
  return (
  <div className="space-y-2" data-rr-formal>
    {scale ? (
      <>
        <EquationDisplay tone="result" tex={'\\sin\\widehat{B} = \\dfrac{AC}{BC} \\qquad \\tan\\widehat{B} = \\dfrac{AC}{AB}'} />
        <EquationDisplay tone="ok" note={k('fMineAdv')} tex={`\\sin 40^{\\circ} \\approx ${comma(L.fmt(Math.sin((40 * Math.PI) / 180)))} \\qquad \\tan 40^{\\circ} \\approx ${comma(L.fmt(Math.tan((40 * Math.PI) / 180)))}`} />
        <p className="text-sm text-emerald-900"><MathText>{k('fRuleAdv')}</MathText></p>
      </>
    ) : (
      <>
        <EquationDisplay tone="result" tex={'\\cos\\widehat{B} = \\dfrac{AB}{BC} \\quad \\sin\\widehat{B} = \\dfrac{AC}{BC} \\quad \\tan\\widehat{B} = \\dfrac{AC}{AB}'} />
        <EquationDisplay tone="ok" tex={'0 < \\sin\\widehat{B} < 1 \\qquad 0 < \\cos\\widehat{B} < 1'} />
        <p className="text-sm text-emerald-900"><MathText>{k('fRule')}</MathText></p>
      </>
    )}
  </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** Les suites de questions de chaque étape (مبتدئ : names · compose · rule ; متقدم : sizes · turn) — sur CE que l'élève vient de faire. */
export const CHAINS = Object.freeze({
  names: ['hyp', 'opp', 'swap'],
  compose: ['den', 'read', 'which'],
  rule: ['reach', 'rule'],
  sizes: ['sameSin', 'readSin'],
  turn: ['changed', 'rule'],
});
const REACHED = {
  names: (lab) => L.namesDone(lab),
  compose: (lab) => L.composeDone(lab),
  rule: (lab) => L.discoveryReady(lab),
  sizes: (lab) => L.progress(lab).sizes >= 3,
  turn: (lab) => L.discoveryReady(lab),
};
/** « أعِد التجربة » : la MÊME étape repart (et son drapeau « fait » s'efface) ; la règle n'a rien à refaire. */
const RETRY = { names: L.retryNames, compose: L.retryCompose, sizes: L.retrySizes, turn: L.retryTurn };

const $ = (s) => `$${s}$`;
const dot = (v) => String(v).replace(',', '.');
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const sd = (x) => <bdi dir="ltr" className="font-mono">[{x}]</bdi>;
const sideOptions = (right, whyOf) => L.SIDES.map((side) => ({ text: sd(side), correct: side === right, ...(side === right ? {} : { why: whyOf(side) }) }));

export const QUESTIONS = {
  hyp: (lab, k) => {
    const hyp = L.sideOfRole(lab.at, 'hypotenuse');
    return {
      id: 'hyp', kind: 'choice', cols: 3,
      prompt: Mx(k, 'hyp.prompt'),
      options: sideOptions(hyp, (side) => Mx(k, 'hyp.why', { side })),
      hints: [Mx(k, 'hyp.hint1'), Mx(k, 'hyp.hint2')],
      explain: Mx(k, 'hyp.explain', { hyp }),
    };
  },
  opp: (lab, k) => {
    const a = $(ANG[lab.at]);
    const opp = L.sideOfRole(lab.at, 'opposite');
    const hyp = L.sideOfRole(lab.at, 'hypotenuse');
    return {
      id: 'opp', kind: 'choice', cols: 3,
      prompt: Mx(k, 'opp.prompt', { a }),
      options: sideOptions(opp, (side) => Mx(k, side === hyp ? 'opp.whyHyp' : 'opp.whyAdj', { side, a, v: lab.at })),
      hints: [Mx(k, 'opp.hint1', { a, v: lab.at }), Mx(k, 'opp.hint2', { a, v: lab.at })],
      explain: Mx(k, 'opp.explain', { opp, a }),
    };
  },
  swap: (lab, k) => {
    const other = lab.at === 'B' ? 'C' : 'B';
    const now = L.sideOfRole(lab.at, 'opposite');
    const hyp = L.sideOfRole(lab.at, 'hypotenuse');
    const right = L.sideOfRole(other, 'opposite');
    return {
      id: 'swap', kind: 'choice', cols: 3,
      prompt: Mx(k, 'swap.prompt', { a: $(ANG[lab.at]), b: $(ANG[other]) }),
      options: sideOptions(right, (side) => Mx(k, side === hyp ? 'swap.whyHyp' : 'swap.whySame', { side, a: $(ANG[lab.at]), w: other })),
      hints: [Mx(k, 'swap.hint1', { b: $(ANG[other]), w: other }), Mx(k, 'swap.hint2', { b: $(ANG[other]) })],
      explain: Mx(k, 'swap.explain', { right, now, b: $(ANG[other]) }),
    };
  },
  den: (lab, k) => {
    const hyp = L.sideOfRole(lab.at, 'hypotenuse');
    const roleOf = L.roleOfSide(lab.at);
    return {
      id: 'den', kind: 'choice', cols: 3,
      prompt: Mx(k, 'den.prompt'),
      options: sideOptions(hyp, (side) => Mx(k, `den.why_${roleOf[side]}`, { side })),
      hints: [Mx(k, 'den.hint1'), Mx(k, 'den.hint2')],
      explain: Mx(k, 'den.explain', { hyp }),
    };
  },
  read: (lab, k) => {
    const v = L.fmt(L.value(lab, 'sin'));
    const a = $(ANG[lab.at]);
    return {
      id: 'read', kind: 'number', expected: dot(v), answer: <MathText>{$(comma(v))}</MathText>,
      prompt: Mx(k, 'read.prompt', { a, b: lab.b }),
      hints: [Mx(k, 'read.hint1'), Mx(k, 'read.hint2', { near: $(comma(L.fmt(L.value(lab, 'sin'), 1))) })],
      explain: Mx(k, 'read.explain', { eq: $(`\\sin${ANG[lab.at]} \\approx ${comma(v)}`) }),
    };
  },
  which: (lab, k) => {
    const s = L.fmt(L.value(lab, 'sin')); const c = L.fmt(L.value(lab, 'cos'));
    const right = Number(dot(s)) > Number(dot(c)) ? 0 : Number(dot(c)) > Number(dot(s)) ? 1 : 2;
    const vals = { s: $(comma(s)), c: $(comma(c)) };
    return {
      id: 'which', kind: 'choice',
      prompt: Mx(k, 'which.prompt', { a: $(ANG[lab.at]), b: lab.b }),
      options: ['sin', 'cos', 'same'].map((o, i) => ({
        text: Mx(k, `which.${o}`), correct: i === right,
        ...(i === right ? {} : { why: Mx(k, `which.why_${o}`, vals) }),
      })),
      hints: [Mx(k, 'which.hint1'), Mx(k, 'which.hint2', vals)],
      explain: Mx(k, 'which.explain', vals),
    };
  },
  reach: (lab, k) => {
    const w = L.witnesses(lab).high;
    const nums = { b: w.b, ac: $(`AC \\approx ${m(w.AC)}`), bc: $(`BC \\approx ${m(w.BC)}`) };
    return {
      id: 'reach', kind: 'choice',
      prompt: Mx(k, 'reach.prompt', nums),
      options: [
        { text: Mx(k, 'reach.longer'), why: Mx(k, 'reach.whyLonger', nums) },
        { text: Mx(k, 'reach.equal'), why: Mx(k, 'reach.whyEqual', nums) },
        { text: Mx(k, 'reach.shorter'), correct: true },
      ],
      hints: [Mx(k, 'reach.hint1'), Mx(k, 'reach.hint2', nums)],
      explain: Mx(k, 'reach.explain', nums),
    };
  },
  sameSin: (lab, k) => {
    const w = L.witnesses(lab);
    const nums = { small: $(`BC = ${comma(L.fmt(w.small.len, 1))}\\,\\mathrm{m}`), big: $(`BC = ${comma(L.fmt(w.big.len, 1))}\\,\\mathrm{m}`), v: $(comma(L.fmt(w.small.sin))), b: lab.angle0 };
    return {
      id: 'sameSin', kind: 'choice',
      prompt: Mx(k, 'sameSin.prompt', nums),
      options: [
        { text: Mx(k, 'sameSin.grows'), why: Mx(k, 'sameSin.whyGrows', nums) },
        { text: Mx(k, 'sameSin.same'), correct: true },
        { text: Mx(k, 'sameSin.shrinks'), why: Mx(k, 'sameSin.whyShrinks', nums) },
      ],
      hints: [Mx(k, 'sameSin.hint1'), Mx(k, 'sameSin.hint2', nums)],
      explain: Mx(k, 'sameSin.explain', nums),
    };
  },
  readSin: (lab, k) => {
    const w = L.witnesses(lab);
    const v = L.fmt(w.small.sin);
    return {
      id: 'readSin', kind: 'number', expected: dot(v), answer: <MathText>{$(comma(v))}</MathText>,
      prompt: Mx(k, 'readSin.prompt', { b: lab.angle0, len: $(`BC = ${comma(L.fmt(w.big.len, 1))}\\,\\mathrm{m}`) }),
      hints: [Mx(k, 'readSin.hint1'), Mx(k, 'readSin.hint2', { near: $(comma(L.fmt(w.small.sin, 1))) })],
      explain: Mx(k, 'readSin.explain', { eq: $(`\\sin ${lab.angle0}^{\\circ} \\approx ${comma(v)}`) }),
    };
  },
  changed: (lab, k) => {
    const w = L.witnesses(lab);
    const nums = { b0: lab.angle0, b: w.other.b, v0: $(comma(L.fmt(w.small.sin))), v: $(comma(L.fmt(w.other.sin))) };
    return {
      id: 'changed', kind: 'choice',
      prompt: Mx(k, 'changed.prompt', nums),
      options: [
        { text: Mx(k, 'changed.length'), why: Mx(k, 'changed.whyLength', nums) },
        { text: Mx(k, 'changed.angle'), correct: true },
        { text: Mx(k, 'changed.none'), why: Mx(k, 'changed.whyNone', nums) },
      ],
      hints: [Mx(k, 'changed.hint1'), Mx(k, 'changed.hint2', nums)],
      explain: Mx(k, 'changed.explain', nums),
    };
  },
  rule: (lab, k) => ({
    id: 'rule', kind: 'choice',
    prompt: <MathText>{k(lab.mode === 'scale' ? 'dPromptAdv' : 'dPrompt')}</MathText>,
    options: discoveryOptions(lab, k),
    hints: [Mx(k, 'rule.hint1'), Mx(k, 'rule.hint2')],
    explain: <Formal scale={lab.mode === 'scale'} k={k} />,
  }),
};

export default function RampRatios({
  angle = 30, hyp = 4, hyps = null, mode = 'name', theme = 'skatepark', title, lead, mission, level,
  levels: withLevels = true, checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.rampRatios.${key}`, o), [t]);
  const initialNumbers = mode === 'scale' ? { angle, hyps, mode } : { angle, hyp, mode };
  const state = useManipulation({ type: 'ramp-ratios', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nb = state.numbers;
  const make = () => L.init(nb);
  const [lab, setLab] = useState(make);
  const sceneKey = `${nb.mode}|${nb.angle}|${nb.hyp ?? ''}|${(nb.hyps ?? []).join(',')}|${state.epoch}`;
  const [scene, setScene] = useState(sceneKey);
  const [doneIds, setDoneIds] = useState([]);
  const [inits, setInits] = useState(0);
  if (scene !== sceneKey) { setScene(sceneKey); setLab(make()); setDoneIds([]); setInits((n) => n + 1); }   // « إعادة » : TOUT recommence, questions comprises
  const scale = lab.mode === 'scale';

  /* ── les questions pendant le labo (primitives/LabCheckpoint) : une suite par étape, la dernière finit par la règle ── */
  const cpSettings = useLabCheckpointSettings('ramp-ratios');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const gate = cpOn && cpSettings.enabled;
  const order = scale ? ['sizes', 'turn'] : ['names', 'compose', 'rule'];
  const party = useStepCelebration();
  const curId = gate ? order.find((id) => !doneIds.includes(id)) ?? null : null;
  const curReached = !!curId && REACHED[curId](lab);
  const cp = useLabCheckpoint({
    id: curReached ? curId : null,
    questions: curReached ? CHAINS[curId].map((q) => QUESTIONS[q](lab, k)) : null,
    reached: curReached,
    resetKey: inits,
    onRetry: () => { const f = RETRY[curId]; if (f) setLab(f); },
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setDoneIds((d) => (d.includes(id) ? d : [...d, id]));
      party.celebrate({ n: order.indexOf(id) + 1, total: order.length });
      if (id === order[order.length - 1]) { state.discover(); state.formalize(); }
    },
  });

  const ready = L.discoveryReady(lab);
  useEffect(() => { if (ready && !gate) state.discover(); }, [ready, gate, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, { mode: lab.mode }); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  // Miroir synchrone de `lab` : « جرّب كل الإمكانيات » enchaîne des pas plus vite qu'un rendu.
  const labRef = useRef(lab);
  labRef.current = lab;
  const nItems = scale ? lab.ramps.length : lab.trials.length;
  useEffect(() => {
    if (nItems > 0) state.report(onTrial, L.evidenceOf(lab, scale ? lab.ramps.at(-1) : lab.trials.at(-1)));
  }, [nItems]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : largeur, hauteur de l'écran de leçon, ce que le bloc mesure en plus du dessin ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const svgHRef = useRef(220);
  const twoCol = useRef(false);
  const [width, setWidth] = useState(320);
  const [overhead, setOverhead] = useState(300);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(160, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(twoCol.current ? 40 : 140, Math.ceil(glanceRef.current.getBoundingClientRect().height) - svgHRef.current));
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
  // Sur un écran large, la scène et le panneau (cases, commandes, lecture) côte à côte : la rampe garde sa hauteur.
  const twoColNow = width >= 680;
  twoCol.current = twoColNow;
  const sceneW = twoColNow ? Math.floor((width - 12) * 0.59) : width;
  const maxH = Math.max(140, Math.min(Math.round(sceneW * (narrow ? 1.8 : twoColNow ? 1.0 : 0.62)), 480, screenH - overhead - 20));
  const lay = useMemo(() => L.layout(lab, { width: sceneW, maxHeight: maxH, compact: narrow }), [lab.mode, lab.run, sceneW, maxH, narrow]); // eslint-disable-line react-hooks/exhaustive-deps
  svgHRef.current = lay.H;

  /* ── coordonnées ── */
  const svgRef = useRef(null);
  const toMeters = (cx, cy) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r || !r.width) return null;
    return lay.toMeters([((cx - r.left) * lay.W) / r.width, ((cy - r.top) * lay.H) / r.height]);
  };
  const V = L.vertices(lab);
  const P = { B: lay.px(V.B), A: lay.px(V.A), C: lay.px(V.C) };
  const len = L.lengths(lab);

  /* ── les gestes d'étirement : la hauteur (مبتدئ), la planche et l'angle (متقدم) ── */
  const riseTo = useCallback((cx, cy) => { const p = toMeters(cx, cy); return p ? L.bFromPoint(lab, p) : lab.b; }, [lab, lay]); // eslint-disable-line react-hooks/exhaustive-deps
  const lenTo = useCallback((cx, cy) => { const p = toMeters(cx, cy); return p ? L.iFromPoint(lab, p) : lab.i; }, [lab, lay]); // eslint-disable-line react-hooks/exhaustive-deps
  const angTo = useCallback((cx, cy) => { const p = toMeters(cx, cy); return p ? L.angleFromPoint(lab, p) : lab.b; }, [lab, lay]); // eslint-disable-line react-hooks/exhaustive-deps
  const rise = useStretchInteraction({
    value: lab.b, range: { min: lab.range[0], max: lab.range[1] }, toValue: riseTo, direction: 'ltr', pageStep: 5, settleMs: 450,
    onChange: (b) => setLab((s) => L.setB(s, b)), onCommit: (b) => setLab((s) => L.commitB(s, b)),
  });
  const lenS = useStretchInteraction({
    value: lab.i ?? 10, range: { min: L.LEN_RANGE[0], max: L.LEN_RANGE[1] }, toValue: lenTo, direction: 'ltr', pageStep: 2, settleMs: 300,
    onChange: (i) => setLab((s) => L.setLen(s, i)), onCommit: (i) => setLab((s) => L.setLen(s, i)),
  });
  const angS = useStretchInteraction({
    value: lab.b, range: { min: lab.range[0], max: lab.range[1] }, toValue: angTo, direction: 'ltr', pageStep: 5, settleMs: 300,
    onChange: (b) => setLab((s) => L.setAngle(s, b)), onCommit: (b) => setLab((s) => L.setAngle(s, b)),
  });

  /* ── le geste de portage : étiquettes → côtés (nommer), côtés nommés → cases (composer) ── */
  const [notice, setNotice] = useState(null);
  useEffect(() => { setNotice(null); }, [state.epoch]);
  const drag = useDragInteraction({
    accepts: (src, zone) => {
      if (src.startsWith('label:') && zone.startsWith('zside:')) return L.canName(lab, src.slice(6), zone.slice(6));
      if (src.startsWith('sside:') && zone.startsWith('slot:')) { const [, kind, slot] = zone.split(':'); return L.canFill(lab, kind, slot, src.slice(6)); }
      return '';
    },
    onDrop: (src, zone) => {
      setNotice(null);
      if (src.startsWith('label:')) setLab((s) => L.name(s, src.slice(6), zone.slice(6)));
      else { const [, kind, slot] = zone.split(':'); setLab((s) => L.fill(s, kind, slot, src.slice(6))); }
    },
    onReject: (src, zone, reason) => setNotice(reason ? { reason, src, zone } : null),
  });
  const pickV = (v) => { setNotice(null); setLab((s) => L.pick(s, v)); };

  /* ── l'étape (مبتدئ) ── */
  const pr = L.progress(lab);
  const waits = (id) => gate && !doneIds.includes(id);   // l'étape suivante n'apparaît qu'une fois les questions de celle-ci répondues
  const stage = scale ? 'scale' : !lab.at ? 'pick' : (!L.namesDone(lab) || waits('names')) ? 'name' : (!L.composeDone(lab) || waits('compose')) ? 'compose' : 'explore';

  /* ── le son : un déclic quand la main bouge la rampe, un drapeau quand une étape est juste, un « over » quand c'est refusé ── */
  const sfx = useRef({ b: lab.b, i: lab.i, at: 0, key: inits });
  useEffect(() => {
    const p = sfx.current;
    if (p.key !== inits) { sfx.current = { b: lab.b, i: lab.i, at: 0, key: inits }; return; }
    const up = lab.b !== p.b ? lab.b > p.b : (lab.i ?? 0) > (p.i ?? 0);
    if (lab.b === p.b && lab.i === p.i) return;
    const now = performance.now();
    if (now - p.at > 35) { playSfx('tooth', { pitch: up ? 1 : 0.75 }); p.at = now; }
    p.b = lab.b; p.i = lab.i;
  }, [lab.b, lab.i, inits]);
  const sfxLast = useRef(null);
  useEffect(() => {
    const kd = lab.last?.kind;
    if (!kd || sfxLast.current === lab.last) return;
    sfxLast.current = lab.last;
    if (kd === 'claimOk' || kd === 'first') playSfx('flag');
    else if (kd === 'claimWrong' || kd === 'top' || kd === 'bottom' || kd === 'dup') playSfx('over');
  }, [lab.last]);
  const namesOk = !scale && L.namesDone(lab);
  const composeOk = !scale && L.composeDone(lab);
  useEffect(() => { if (namesOk) playSfx('flag'); }, [namesOk]);
  useEffect(() => { if (composeOk) playSfx('flag'); }, [composeOk]);
  useEffect(() => { if (notice) playSfx('over'); }, [notice]);

  const at = lab.at;
  const roleWord = (r) => k(`role_${r}`);
  const kindWord = (kd) => k(`kind_${kd}`);

  /* ── le verdict ── */
  const fracTex = (n, d) => `\\dfrac{${n}}{${d}}`;
  const verdict = (() => {
    if (notice) {
      const { reason, src, zone } = notice;
      if (src.startsWith('label:')) {
        const side = zone.slice(6);
        return { tone: 'rose', kind: `refuse-${reason}`, text: k(`refuse_${reason}`, { side, a: `$${ANG[at]}$`, v: at, role: roleWord(src.slice(6)) }) };
      }
      const [, kind, slot] = zone.split(':');
      const side = src.slice(6);
      const w = L.wrongRatio(lab, kind, slot, side);
      return {
        tone: 'rose', kind: `refuse-${reason}`,
        text: k(`fill_${reason}`, { side, a: `$${ANG[at]}$`, kind: kindWord(kind), f: `$${fracTex(w.num, w.den)} \\approx ${comma(L.fmt(w.value))}$`, hyp: L.sideOfRole(at, 'hypotenuse') }),
      };
    }
    const last = lab.last;
    if (!last) return null;
    switch (last.kind) {
      case 'rightAngle': return { tone: 'amber', kind: 'rightAngle', text: k('vRightAngle') };
      case 'picked': case 'same': return { tone: 'indigo', kind: 'picked', text: k(L.namesDone(lab) ? 'vPickedNamed' : 'vPicked', { a: `$${ANG[last.at]}$` }) };
      case 'named': return { tone: 'emerald', kind: 'named', text: k('vNamed', { side: last.side, role: roleWord(last.role), a: `$${ANG[at]}$` }) };
      case 'filled': {
        if (!L.rowDone(lab, last.ratio)) return { tone: 'emerald', kind: 'filled', text: k('vFilledHalf') };
        const row = lab.compose[at][last.ratio];
        return { tone: 'emerald', kind: 'row', text: k('vRow', { eq: `$${FN[last.ratio]}${ANG[at]} = ${fracTex(row.num, row.den)} \\approx ${comma(L.fmt(L.value(lab, last.ratio)))}$` }) };
      }
      case 'top': return { tone: 'amber', kind: 'top', text: k('vTop', { ac: `$AC \\approx ${m(last.AC)}$`, bc: `$BC \\approx ${m(last.BC)}$` }) };
      case 'bottom': return { tone: 'slate', kind: 'bottom', text: k('vBottom', { ab: `$AB \\approx ${m(last.AB)}$`, bc: `$BC \\approx ${m(last.BC)}$` }) };
      case 'trial': return L.composeDone(lab) ? { tone: 'slate', kind: 'trial', text: k('vTrial') } : null;
      case 'first': return { tone: 'indigo', kind: 'first', text: k('vFirst', { r: rampTex(lab.ramps[0]) }) };
      case 'ask': return { tone: 'indigo', kind: 'ask', text: k('vAsk', { ref: lab.ramps.length }) };
      case 'dup': return { tone: 'amber', kind: 'dup', text: k('vDup') };
      case 'claimOk': case 'claimWrong': {
        const r = lab.ramps.find((x) => x.n === last.n);
        const r0 = lab.ramps.find((x) => x.n === last.ref);
        const key = `${last.kind === 'claimOk' ? 'vOk' : 'vWrong'}_${last.truth}`;
        return { tone: last.kind === 'claimOk' ? 'emerald' : 'rose', kind: last.kind, text: k(key, { n: r.n, ref: r0.n, b: r.b, b0: r0.b, r: rampTex(r), r0: rampTex(r0) }) };
      }
      default: return null;
    }
  })();
  function rampTex(r) {
    return `$\\dfrac{AC}{BC} \\approx ${comma(L.fmt(r.sin))}$ ، $\\dfrac{AC}{AB} \\approx ${comma(L.fmt(r.tan))}$`;
  }

  /* ── ce qu'il reste à faire (orientation, jamais la réponse) ── */
  const needs = scale
    ? [pr.sizes < 3 && k('needSizes', { n: pr.sizes }), !pr.turned && k('needTurn')].filter(Boolean)
    : [stage === 'explore' && (pr.trials < 3 || pr.span < 20) && k('needHeights', { n: pr.trials })].filter(Boolean);

  /* ── la découverte ── */
  const options = useMemo(() => discoveryOptions(lab, k), [lab, k]);
  const formal = <Formal scale={scale} k={k} />;

  const missionText = mission ?? (scale ? k('missionAdvanced') : k(`mission_${stage}`, { a: at ? `$${ANG[at]}$` : '' }));
  const hints = (scale ? ['hintAdv1', 'hintAdv2', 'hintAdv3'] : ['hint1', 'hint2', 'hint3']).map((h) => <MathText key={h}>{k(h)}</MathText>);
  const handle = 44;

  /* ── le dessin : quelques points en pixels ── */
  const roleAt = (side) => (at ? lab.names[at][side] : null);
  const midPx = (a, b) => [(P[a][0] + P[b][0]) / 2, (P[a][1] + P[b][1]) / 2];
  // les pastilles des côtés, hors du triangle
  const pill = {
    AB: (() => { const q = midPx('A', 'B'); return [q[0], q[1] + 26]; })(),
    AC: (() => { const q = midPx('A', 'C'); return [Math.min(q[0] + 44, lay.W - 40), q[1]]; })(),
    BC: (() => {
      const q = midPx('B', 'C');
      const dx = P.C[0] - P.B[0]; const dy = P.C[1] - P.B[1]; const l = Math.hypot(dx, dy) || 1;
      return [Math.max(40, q[0] + (dy / l) * 30), q[1] - (dx / l) * 30];
    })(),
  };
  const cl = ([x, y]) => [Math.max(22, Math.min(lay.W - 22, x)), Math.max(22, Math.min(lay.H - 22, y))];
  const vbtn = { B: cl([P.B[0] - 24, P.B[1] + 20]), A: cl([P.A[0] + 26, P.A[1] + 20]), C: cl([P.C[0] - 36, P.C[1] - 26]) };

  const sideZone = (side) => {
    const role = roleAt(side);
    const tone = TONE[role ? ROLE_TONE[role] : 'slate'];
    const asSource = stage === 'compose' || stage === 'explore';
    const common = {
      'data-rr-side': side, 'data-role': role ?? '',
      className: `absolute flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 px-1.5 text-xs font-extrabold shadow-sm outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 ${tone.chip} ${drag.hoverZone === `zside:${side}` ? 'ring-4 ring-indigo-300' : ''}`,
      style: { left: pill[side][0], top: pill[side][1], transform: 'translate(-50%, -50%)' },
    };
    // sur téléphone, un côté nommé ne montre que son nom (la scène est étroite) ; ses lettres restent dans l'aria-label
    const label = (
      <>
        {role && <span>{roleWord(role)}</span>}
        {!(role && narrow) && <bdi dir="ltr" className="font-mono">[{side}]</bdi>}
      </>
    );
    if (asSource && !scale) {
      const src = drag.sourceProps(`sside:${side}`);
      return (
        <div key={side} {...common} {...src} style={{ ...common.style, ...src.style }} role="button" tabIndex={0} aria-label={k('sideSourceAria', { side, role: role ? roleWord(role) : '' })}
          data-drag-held={src['data-drag-held']}>
          {label}
        </div>
      );
    }
    return (
      <div key={side} {...common} {...drag.zoneProps(`zside:${side}`, { disabled: stage !== 'name' })} style={common.style} role="button" tabIndex={stage === 'name' ? 0 : -1} aria-label={k('sideZoneAria', { side, role: role ? roleWord(role) : k('unnamed') })}>
        {label}
      </div>
    );
  };

  const slot = (kind, sl) => {
    const v = at ? lab.compose[at][kind][sl] : null;
    const role = v ? L.roleOfSide(at)[v] : null;
    return (
      <div {...drag.zoneProps(`slot:${kind}:${sl}`, { disabled: stage !== 'compose' || !!v })} data-rr-slot={`${kind}:${sl}`} role="button" tabIndex={stage === 'compose' && !v ? 0 : -1}
        aria-label={k('slotAria', { slot: k(`slot_${sl}`), kind: kindWord(kind), v: v ?? k('empty') })}
        className={`flex h-11 min-w-[44px] items-center justify-center rounded-lg border-2 px-1 text-xs font-extrabold ${v ? TONE[ROLE_TONE[role]].chip : 'border-dashed border-slate-400 bg-white text-slate-400'} ${drag.hoverZone === `slot:${kind}:${sl}` ? 'ring-4 ring-indigo-300' : ''}`}>
        <bdi dir="ltr" className="font-mono">{v ?? '?'}</bdi>
      </div>
    );
  };

  const ratioCard = (kind) => (
    <div key={kind} className={`flex items-center justify-center rounded-xl border border-slate-200 bg-white/90 ${narrow ? 'gap-0.5 px-0.5 py-0.5' : 'gap-1 px-1 py-1'}`} dir="ltr" data-rr-value={kind}>
      <span className={`${narrow ? 'text-xs' : 'text-sm'} font-bold text-slate-800`}><MathText>{`$${FN[kind]}${ANG[at] ?? ''} =$`}</MathText></span>
      {narrow ? (
        <div className="flex items-center gap-0.5">
          {slot(kind, 'num')}
          <span aria-hidden="true" className="text-base font-bold text-slate-700">/</span>
          {slot(kind, 'den')}
        </div>
      ) : (
        <div className="flex flex-col items-stretch gap-0.5">
          {slot(kind, 'num')}
          <span aria-hidden="true" className="block h-0.5 w-full bg-slate-700" />
          {slot(kind, 'den')}
        </div>
      )}
      {L.rowDone(lab, kind) && (narrow
        ? <bdi dir="ltr" className="text-[11px] font-bold text-emerald-800">≈ {L.fmt(L.value(lab, kind))}</bdi>
        : <span className="text-sm font-bold text-emerald-800"><MathText>{`$\\approx ${comma(L.fmt(L.value(lab, kind)))}$`}</MathText></span>)}
    </div>
  );

  const toneText = { rose: 'text-rose-800', emerald: 'text-emerald-800', amber: 'text-amber-800', indigo: 'text-indigo-900', slate: 'text-slate-700' };
  const heldLabel = drag.held?.startsWith('label:') ? drag.held.slice(6) : null;
  const heldSide = drag.held?.startsWith('sside:') ? drag.held.slice(6) : null;

  return (
    <ManipulationShell
      type="ramp-ratios"
      title={title ?? k('title')}
      mission={<MathText>{missionText}</MathText>}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      hints={hints}
      headerAction={cpOn ? cpSettings.control : null}
      guided={gate}
      controller={{
        autoStep: () => false,
        canAutoStep: () => false,
        // مبتدئ, une fois les rapports composés : chaque degré est un essai. متقدم : un jugement par rampe, jamais auto.
        ...(scale ? {} : {
          autoComplete: {
            label: t('manipulation.autoComplete.tryAll'),
            ready: stage === 'explore',
            remaining: L.tryAllPlan(lab).length,
            // un degré par pas : on VOIT la rampe se lever et les rapports changer
            intervalMs: 480,
            maxTicks: 80,
            step: () => {
              const next = L.tryAllPlan(labRef.current)[0];
              if (next === undefined) return;
              labRef.current = L.commitB(labRef.current, next);
              setLab((s) => L.commitB(s, next));
            },
            finish: () => {
              let cur = labRef.current;
              for (const b of L.tryAllPlan(cur)) cur = L.commitB(cur, b);
              labRef.current = cur;
              setLab(cur);
            },
          },
        }),
      }}
      discovery={<ManipulationDiscovery state={state} prompt={k(scale ? 'dPromptAdv' : 'dPrompt')} options={options} formal={formal} />}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-fuchsia-50/50 via-white to-white" data-dragging={drag.dragging ? 'true' : undefined}>
        <div ref={boxRef} className="space-y-2" data-ramp-ratios data-mode={lab.mode} data-at={at ?? ''} data-b={lab.b} data-i={lab.i ?? ''}
          data-stage={stage} data-solved={ready ? 'true' : 'false'} data-world={theme} data-layout={narrow ? 'narrow' : 'wide'}>
          <div className="relative space-y-2">
          {party.node}
          {cp.node}
          {gate && (
            <LabStepper count={order.length} current={Math.max(0, order.findIndex((id) => !doneIds.includes(id)))}
              done={order.map((id) => doneIds.includes(id))} stepAttr="data-rr-step" />
          )}
          <div ref={glanceRef} className={twoColNow ? 'grid grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] items-center gap-3' : 'space-y-2'} data-rr-glance data-cols={twoColNow ? '2' : '1'}>
            {/* LA SCÈNE */}
            <div className="relative mx-auto" style={{ width: lay.W, height: lay.H, maxWidth: '100%' }} data-rr-scene>
              <svg ref={svgRef} width={lay.W} height={lay.H} viewBox={`0 0 ${lay.W} ${lay.H}`} className="absolute inset-0 block" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
                <Decor lay={lay} P={P} scale={scale} />
                {scale ? <ScaleDrawing lab={lab} lay={lay} P={P} /> : <NameDrawing lab={lab} lay={lay} P={P} len={len} at={at} />}
                <Lbl p={P.B} t="B" dx={-14} dy={-8} />
                <Lbl p={P.A} t="A" dx={12} dy={-7} />
                <Lbl p={P.C} t="C" dx={28} dy={-6} />
              </svg>

              {/* les sommets à toucher (مبتدئ) */}
              {!scale && ['B', 'C', 'A'].map((v) => (
                <button key={v} type="button" onClick={() => pickV(v)} data-rr-vertex={v} aria-pressed={at === v}
                  aria-label={v === 'A' ? k('vertexA') : k('vertexAria', { v })}
                  className={`absolute flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-black shadow outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 ${at === v ? 'border-fuchsia-600 bg-fuchsia-600 text-white' : v === 'A' ? 'border-slate-300 bg-white/85 text-slate-500' : 'border-fuchsia-400 bg-white/90 text-fuchsia-800'}`}
                  style={{ left: vbtn[v][0], top: vbtn[v][1], transform: 'translate(-50%, -50%)' }}>
                  <span aria-hidden="true" style={{ direction: 'ltr' }}>{v === 'A' ? '∟' : <MathText>{`$${ANG[v]}$`}</MathText>}</span>
                </button>
              ))}

              {/* les côtés : zones (nommer) puis sources (composer) */}
              {!scale && at && L.SIDES.map(sideZone)}

              {/* la poignée de HAUTEUR (مبتدئ) */}
              {!scale && (
                <div {...rise.trackProps} {...rise.handleProps({ label: k('handleRise'), valueText: k('riseValue', { ac: L.fmt(len.AC), b: lab.b }) })}
                  data-rr-handle="rise"
                  className="absolute flex items-center justify-center rounded-full border-2 border-fuchsia-600 bg-white/85 shadow outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-300"
                  style={{ ...rise.trackProps.style, left: P.C[0], top: P.C[1], width: handle, height: handle, transform: 'translate(-50%, -50%)', cursor: rise.dragging ? 'grabbing' : 'ns-resize', touchAction: 'none' }}>
                  <span aria-hidden="true" className="text-base font-black text-fuchsia-700">↕</span>
                </div>
              )}

              {/* les poignées de PLANCHE et d'ANGLE (متقدم) */}
              {scale && (() => {
                const r = 1.7;
                const ap = lay.px([r * Math.cos((lab.b * Math.PI) / 180), r * Math.sin((lab.b * Math.PI) / 180)]);
                return (
                  <>
                    <div {...lenS.trackProps} {...lenS.handleProps({ label: k('handleLen'), valueText: k('lenValue', { len: L.fmt(L.lenOf(lab), 1) }) })}
                      data-rr-handle="len"
                      className="absolute flex items-center justify-center rounded-full border-2 border-amber-600 bg-white/85 shadow outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
                      style={{ ...lenS.trackProps.style, left: P.C[0], top: P.C[1], width: handle, height: handle, transform: 'translate(-50%, -50%)', cursor: lenS.dragging ? 'grabbing' : 'grab', touchAction: 'none' }}>
                      <span aria-hidden="true" className="text-[11px] font-black text-amber-700">⤢</span>
                    </div>
                    <div {...angS.trackProps} {...angS.handleProps({ label: k('handleAngle'), valueText: k('angleValue', { b: lab.b }) })}
                      data-rr-handle="angle"
                      className="absolute flex items-center justify-center rounded-full border-2 border-dashed border-fuchsia-600 bg-white/85 shadow outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-300"
                      style={{ ...angS.trackProps.style, left: ap[0], top: ap[1], width: handle, height: handle, transform: 'translate(-50%, -50%)', cursor: angS.dragging ? 'grabbing' : 'grab', touchAction: 'none' }}>
                      <span aria-hidden="true" className="text-[10px] font-black text-fuchsia-700" style={{ direction: 'ltr' }}>{lab.b}°</span>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="space-y-2">

            {/* LES COMMANDES DE L'ÉTAPE */}
            {!scale && stage === 'pick' && (
              <p className="text-center text-sm font-bold text-fuchsia-900"><MathText>{k('pickPrompt')}</MathText></p>
            )}
            {!scale && stage === 'name' && (
              <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-label={k('labelsGroup')}>
                {L.freeRoles(lab).map((r) => (
                  <div key={r} {...drag.sourceProps(`label:${r}`)} data-rr-label={r} role="button" tabIndex={0} aria-label={k('labelAria', { role: roleWord(r) })}
                    className={`flex min-h-[44px] min-w-[64px] items-center justify-center rounded-xl border-2 px-3 text-sm font-extrabold shadow-sm outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 ${TONE[ROLE_TONE[r]].chip} ${drag.held === `label:${r}` ? 'ring-4 ring-indigo-400' : ''} ${drag.rejected === `label:${r}` ? 'animate-pulse' : ''}`}>
                    {roleWord(r)}
                  </div>
                ))}
              </div>
            )}
            {!scale && stage === 'compose' && (
              <div className={`grid gap-1 ${twoColNow || narrow ? 'grid-cols-1' : 'grid-cols-3'}`} data-rr-compose>
                {L.KINDS.map(ratioCard)}
              </div>
            )}
            {/* les trois rapports composés, lus en direct pendant que la rampe se lève */}
            {!scale && stage === 'explore' && (
              <div className={`grid gap-1 rounded-xl border border-emerald-200 bg-emerald-50/60 px-1 py-1 ${twoColNow || narrow ? 'grid-cols-1' : 'grid-cols-3'}`} data-rr-compose data-done="true" dir="ltr">
                {L.KINDS.map((kind) => {
                  const row = lab.compose[at][kind];
                  const fr = narrow ? '\\tfrac' : '\\dfrac';
                  return (
                    <span key={kind} data-rr-value={kind} className={`text-center font-bold text-slate-800 ${narrow ? 'text-[11px]' : 'text-sm'}`}>
                      <MathText>{`$${FN[kind]}${ANG[at]} = ${fr}{${row.num}}{${row.den}} \\approx ${comma(L.fmt(L.value(lab, kind)))}$`}</MathText>
                    </span>
                  );
                })}
              </div>
            )}
            {!scale && (stage === 'compose' || stage === 'explore') && (
              <div className="flex items-center justify-center gap-1" role="group" aria-label={k('riseGroup')}>
                <span className={narrow ? 'sr-only' : 'text-xs font-bold text-fuchsia-800'}>{k('riseGroup')}</span>
                <div dir="ltr" className="flex items-center gap-1">
                  <IconBtn onClick={() => rise.nudge(-1)} label={k('riseLess')} data-rr-less="rise" disabled={lab.b <= lab.range[0]}><Minus className="h-4 w-4" /></IconBtn>
                  <IconBtn onClick={() => rise.nudge(1)} label={k('riseMore')} data-rr-more="rise" disabled={lab.b >= lab.range[1]}><Plus className="h-4 w-4" /></IconBtn>
                </div>
                {!narrow && <Kickflip />}
              </div>
            )}
            {scale && (
              <div className={`flex flex-wrap items-center justify-center ${narrow ? 'gap-1' : 'gap-1.5'}`}>
                <div className="flex items-center gap-1" role="group" aria-label={k('lenGroup')}>
                  <span className={narrow ? 'sr-only' : 'text-xs font-bold text-amber-800'}>{k('lenGroup')}</span>
                  <div dir="ltr" className="flex items-center gap-1">
                    <IconBtn onClick={() => lenS.nudge(-1)} label={k('lenLess')} data-rr-less="len" disabled={lab.i <= L.LEN_RANGE[0]}><Minus className="h-4 w-4" /></IconBtn>
                    <IconBtn onClick={() => lenS.nudge(1)} label={k('lenMore')} data-rr-more="len" disabled={lab.i >= L.LEN_RANGE[1]}><Plus className="h-4 w-4" /></IconBtn>
                  </div>
                </div>
                <div className="flex items-center gap-1" role="group" aria-label={k('angleGroup')}>
                  <span className={narrow ? 'sr-only' : 'text-xs font-bold text-fuchsia-800'}>{k('angleGroup')}</span>
                  <div dir="ltr" className="flex items-center gap-1">
                    <IconBtn onClick={() => angS.nudge(-1)} label={k('angleLess')} data-rr-less="angle" disabled={lab.b <= lab.range[0]}><RotateCw className="h-4 w-4" /></IconBtn>
                    <IconBtn onClick={() => angS.nudge(1)} label={k('angleMore')} data-rr-more="angle" disabled={lab.b >= lab.range[1]}><RotateCcw className="h-4 w-4" /></IconBtn>
                  </div>
                </div>
                {lab.pending ? (
                  <div className="flex items-center gap-1" role="group" aria-label={k('claimGroup')} data-rr-claim-row>
                    {['same', 'changed'].map((c) => (
                      <button key={c} type="button" onClick={() => setLab((s) => L.claim(s, c))} data-rr-claim={c}
                        className={`h-11 min-w-[44px] rounded-xl border-2 bg-white font-bold focus:outline-none focus-visible:ring-2 ${c === 'same' ? 'border-emerald-600 text-emerald-800 focus-visible:ring-emerald-400' : 'border-rose-500 text-rose-800 focus-visible:ring-rose-400'} ${narrow ? 'px-2 text-xs' : 'px-3 text-sm'}`}>
                        {k(`claim_${c}`)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <button type="button" onClick={() => { lenS.flush(); angS.flush(); setLab((s) => L.record(s)); }} data-rr-record
                    className={`inline-flex h-11 min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 border-fuchsia-700 bg-fuchsia-700 font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 ${narrow ? 'px-2 text-xs' : 'px-3 text-sm'}`}>
                    <Video className="h-4 w-4" aria-hidden="true" />{k('record')}
                  </button>
                )}
              </div>
            )}

            {/* LA LECTURE */}
            <div className={`rounded-xl border border-slate-200 bg-white/90 px-2 py-1 text-center ${narrow ? 'text-[11px]' : 'text-sm'}`} aria-live="polite" data-rr-reading dir="ltr">
              <MathText>{scale
                ? `$\\widehat{B} = ${lab.b}^{\\circ}$ · $BC = ${comma(L.fmt(L.lenOf(lab), 1))}\\,\\mathrm{m}$ · $AC \\approx ${m(len.AC)}$${narrow ? '' : ` · $AB \\approx ${m(len.AB)}$`}`
                : narrow
                  ? `$\\widehat{B} = ${lab.b}^{\\circ}$ · $AC \\approx ${comma(L.fmt(len.AC))}$ · $BC \\approx ${comma(L.fmt(len.BC))}$`
                  : `$\\widehat{B} = ${lab.b}^{\\circ}$ · $\\widehat{C} = ${90 - lab.b}^{\\circ}$ · $AB \\approx ${m(len.AB)}$ · $AC \\approx ${m(len.AC)}$ · $BC \\approx ${m(len.BC)}$`}</MathText>
            </div>
            <p role="status" className={`min-h-[1.5rem] ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug ${verdict ? toneText[verdict.tone] : ''}`} data-rr-verdict={verdict?.kind ?? ''}>
              {verdict && <MathText>{verdict.text}</MathText>}
            </p>
            {!narrow && !ready && needs.length > 0 && !lab.pending && (
              <p className="text-[11px] text-slate-600" data-rr-need>
                <span className="font-bold">{k('needTitle')}</span> <MathText>{needs.join(' ، ')}</MathText>
              </p>
            )}
            </div>
          </div>
          </div>
          {narrow && !ready && needs.length > 0 && !lab.pending && (
            <p className="text-[11px] text-slate-600" data-rr-need>
              <span className="font-bold">{k('needTitle')}</span> <MathText>{needs.join(' ، ')}</MathText>
            </p>
          )}

          {!scale && lab.trials.length > 0 && (
            <LabFold id="ramp-ratios.trials" title={k('trialsTitle')}>
              <ol className="space-y-1 text-xs">
                {lab.trials.map((tr) => (
                  <li key={tr.n} data-rr-trial={tr.n} className="text-slate-800">
                    <MathText>{`$${ANG[tr.at]} = ${tr.angle}^{\\circ}$ : $\\cos \\approx ${comma(L.fmt(tr.values.cos))}$ ، $\\sin \\approx ${comma(L.fmt(tr.values.sin))}$ ، $\\tan \\approx ${comma(L.fmt(tr.values.tan))}$`}</MathText>
                  </li>
                ))}
              </ol>
            </LabFold>
          )}
          {scale && lab.ramps.length > 0 && (
            <LabFold id="ramp-ratios.trials" title={k('rampsTitle')}>
              <ol className="space-y-1 text-xs">
                {lab.ramps.map((r) => (
                  <li key={r.n} data-rr-ramp={r.n} data-ok={String(r.ok)} className={r.ok ? 'text-emerald-900' : 'text-rose-800'}>
                    <MathText>{k('rampRow', { n: r.n, b: r.b, len: `$BC = ${comma(L.fmt(r.len, 1))}\\,\\mathrm{m}$`, r: rampTex(r) })}</MathText>
                    {r.says && <span className="text-slate-600"> · {k(`said_${r.says}`)} {r.ok ? '✓' : '✗'}</span>}
                  </li>
                ))}
              </ol>
            </LabFold>
          )}
        </div>
        <DragGhost ghost={drag.ghost}>
          {heldLabel && <span className={`rounded-xl border-2 px-3 py-2 text-sm font-extrabold ${TONE[ROLE_TONE[heldLabel]].chip}`}>{roleWord(heldLabel)}</span>}
          {heldSide && <span className="rounded-xl border-2 border-indigo-500 bg-white px-3 py-2 font-mono text-sm font-extrabold text-indigo-900" dir="ltr">{heldSide}</span>}
        </DragGhost>
      </ManipulationStage>
    </ManipulationShell>
  );
}

function IconBtn({ onClick, label, disabled, children, ...rest }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} disabled={disabled} {...rest}
      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-fuchsia-300 bg-white text-fuchsia-800 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500">
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

function Lbl({ p, t, dx = 0, dy = 0, color = '#0F172A' }) {
  return <text x={p[0] + dx} y={p[1] + dy} fontSize="14" fontWeight="bold" fill={color} textAnchor="middle" stroke="#FFFFFF" strokeWidth={3.5} paintOrder="stroke" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{t}</text>;
}

/** L'arc d'angle en un sommet (pixels) entre deux directions. */
function arcPath(c, p1, p2, r) {
  const a1 = Math.atan2(p1[1] - c[1], p1[0] - c[0]);
  const a2 = Math.atan2(p2[1] - c[1], p2[0] - c[0]);
  let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
  const s = [c[0] + r * Math.cos(a1), c[1] + r * Math.sin(a1)];
  const e = [c[0] + r * Math.cos(a1 + d), c[1] + r * Math.sin(a1 + d)];
  return `M${c[0]} ${c[1]} L${s[0]} ${s[1]} A${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${e[0]} ${e[1]} Z`;
}
function RightMark({ P, size = 11 }) {
  const ux = P.B[0] < P.A[0] ? -1 : 1; // vers B
  return <path d={`M${P.A[0] + ux * size} ${P.A[1]} L${P.A[0] + ux * size} ${P.A[1] - size} L${P.A[0]} ${P.A[1] - size}`} fill="none" stroke="#334155" strokeWidth={1.5} />;
}

/** مبتدئ : la rampe, ses côtés colorés par leur nom, l'arc de la planche couchée (jamais atteint par la hauteur). */
function NameDrawing({ lab, lay, P, len, at }) {
  const roleOf = (side) => (at ? lab.names[at][side] : null);
  const col = (side) => (roleOf(side) ? TONE[ROLE_TONE[roleOf(side)]].stroke : '#475569');
  const r = len.BC * lay.scale;
  const ghostEnd = lay.px([len.BC, 0]);
  const ghostTop = lay.px([0, len.BC]);
  return (
    <g>
      {/* la rampe pleine */}
      <polygon points={[P.B, P.A, P.C].map((p) => p.join(',')).join(' ')} fill="#F5D0FE" opacity={0.55} />
      {/* l'arc de la planche couchée : de C au sol (après A) et jusqu'à la verticale de B (au-dessus de C) */}
      <path d={`M${ghostEnd[0]} ${ghostEnd[1]} A${r} ${r} 0 0 0 ${ghostTop[0]} ${ghostTop[1]}`} fill="none" stroke="#D97706" strokeWidth={1.6} strokeDasharray="5 5" opacity={0.85} data-rr-ghost />
      <circle cx={ghostEnd[0]} cy={ghostEnd[1]} r={3.5} fill="#D97706" />
      <line x1={ghostTop[0]} y1={ghostTop[1]} x2={P.C[0]} y2={ghostTop[1]} stroke="#D97706" strokeWidth={1} strokeDasharray="2 4" opacity={0.7} />
      {/* les côtés */}
      <line x1={P.B[0]} y1={P.B[1]} x2={P.A[0]} y2={P.A[1]} stroke={col('AB')} strokeWidth={4} strokeLinecap="round" />
      <line x1={P.A[0]} y1={P.A[1]} x2={P.C[0]} y2={P.C[1]} stroke={col('AC')} strokeWidth={4} strokeLinecap="round" />
      <line x1={P.B[0]} y1={P.B[1]} x2={P.C[0]} y2={P.C[1]} stroke={col('BC')} strokeWidth={6} strokeLinecap="round" />
      <RightMark P={P} />
      {/* les arcs d'angle : celui choisi est plein */}
      <path d={arcPath(P.B, P.A, P.C, 20)} fill={at === 'B' ? '#C026D3' : 'none'} fillOpacity={0.35} stroke="#A21CAF" strokeWidth={1.4} />
      <path d={arcPath(P.C, P.A, P.B, 18)} fill={at === 'C' ? '#C026D3' : 'none'} fillOpacity={0.35} stroke="#A21CAF" strokeWidth={1.4} />
      <Skater lay={lay} P={P} />
    </g>
  );
}

/** متقدم : la rampe courante, les rampes enregistrées (contours emboîtés), les repères 4, 6, 8 sur la planche. */
function ScaleDrawing({ lab, lay, P }) {
  const dir = [Math.cos((lab.b * Math.PI) / 180), Math.sin((lab.b * Math.PI) / 180)];
  const rayEnd = lay.px([dir[0] * 9.3, dir[1] * 9.3]);
  return (
    <g>
      {lab.ramps.map((r) => {
        const v = L.vertices(lab, r.b, r.i);
        const p = { B: lay.px(v.B), A: lay.px(v.A), C: lay.px(v.C) };
        return (
          <g key={r.n} opacity={r.b === lab.b ? 0.55 : 0.3}>
            <polygon points={[p.B, p.A, p.C].map((q) => q.join(',')).join(' ')} fill="none" stroke={r.b === lab.angle0 ? '#A21CAF' : '#64748B'} strokeWidth={1.4} strokeDasharray="4 3" />
            <text x={p.C[0] + 6} y={p.C[1] - 4} fontSize="10" fill="#64748B" style={{ direction: 'ltr' }}>{r.n}</text>
          </g>
        );
      })}
      {/* le rayon de la planche et les repères du manuel (orientation, pas une réponse) */}
      <line x1={P.B[0]} y1={P.B[1]} x2={rayEnd[0]} y2={rayEnd[1]} stroke="#CBD5E1" strokeWidth={1.2} />
      {lab.marks.map((mk) => {
        const q = lay.px([dir[0] * mk, dir[1] * mk]);
        return (
          <g key={mk}>
            <circle cx={q[0]} cy={q[1]} r={3} fill="#7C3AED" />
            <text x={q[0] - 8} y={q[1] - 6} fontSize="10" fill="#6D28D9" fontWeight="bold" textAnchor="end" style={{ direction: 'ltr' }}>{mk}</text>
          </g>
        );
      })}
      <polygon points={[P.B, P.A, P.C].map((p) => p.join(',')).join(' ')} fill="#F5D0FE" opacity={0.55} />
      <line x1={P.B[0]} y1={P.B[1]} x2={P.A[0]} y2={P.A[1]} stroke="#0284C7" strokeWidth={4} strokeLinecap="round" />
      <line x1={P.A[0]} y1={P.A[1]} x2={P.C[0]} y2={P.C[1]} stroke="#E11D48" strokeWidth={4} strokeLinecap="round" />
      <line x1={P.B[0]} y1={P.B[1]} x2={P.C[0]} y2={P.C[1]} stroke="#D97706" strokeWidth={6} strokeLinecap="round" />
      <RightMark P={P} />
      <path d={arcPath(P.B, P.A, P.C, 1.7 * lay.scale)} fill="#C026D3" fillOpacity={0.12} stroke="#A21CAF" strokeWidth={1.2} strokeDasharray="3 3" />
      {/* l'angle imposé du نشاط 2 */}
      {lab.b !== lab.angle0 && (() => { const q = lay.px([2.3 * Math.cos((lab.angle0 * Math.PI) / 180), 2.3 * Math.sin((lab.angle0 * Math.PI) / 180)]); return <text x={q[0]} y={q[1]} fontSize="10" fill="#A21CAF" fontWeight="bold" textAnchor="middle" style={{ direction: 'ltr' }}>{`${lab.angle0}°`}</text>; })()}
      <Skater lay={lay} P={P} t={0.66} />
    </g>
  );
}

/** Le skateur sur la planche (décor : il suit la rampe, n'indique rien). */
function Skater({ lay, P, t = 0.62 }) {
  const x = P.B[0] + (P.C[0] - P.B[0]) * t; const y = P.B[1] + (P.C[1] - P.B[1]) * t;
  const a = (Math.atan2(P.C[1] - P.B[1], P.C[0] - P.B[0]) * 180) / Math.PI;
  const s = Math.max(0.6, Math.min(1.1, lay.scale / 34));
  return (
    <g aria-hidden="true" data-deco="skater" transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
      <rect x={-13} y={-6} width={26} height={4} rx={2} fill="#111827" />
      <circle cx={-8} cy={-1} r={2} fill="#F59E0B" /><circle cx={8} cy={-1} r={2} fill="#F59E0B" />
      <g transform="rotate(-8)">
        <path d="M-5 -7 L-2 -20 L3 -20 L5 -7" fill="none" stroke="#1E293B" strokeWidth={3} strokeLinecap="round" />
        <rect x={-5} y={-33} width={10} height={14} rx={4} fill="#22C55E" />
        <circle cx={0} cy={-38} r={5} fill="#FCD34D" />
        <path d="M-5 -41 Q0 -47 5 -41" fill="#DC2626" />
        <path d="M-5 -29 L-13 -24 M5 -29 L13 -33" stroke="#FCD34D" strokeWidth={2.5} strokeLinecap="round" />
      </g>
    </g>
  );
}

/** Le décor du skatepark : mur de graffitis, sol, téléphone qui filme. Jamais une information. */
function Decor({ lay, P }) {
  const reduce = useReducedMotion();
  const ground = P.B[1];
  const phoneX = Math.min(lay.W - 30, Math.max(P.A[0] + 70, lay.W * 0.82));
  return (
    <g aria-hidden="true" data-deco="skatepark">
      <style>{'.rr-rec{animation:rr-r 1.2s steps(2) infinite}@keyframes rr-r{0%{opacity:1}100%{opacity:.2}}@media (prefers-reduced-motion: reduce){.rr-rec{animation:none}}'}</style>
      {/* le mur de graffitis du skatepark : un vrai mur de briques posé sur le sol, derrière la rampe, couvert de tags */}
      <Wall lay={lay} ground={ground} />
      {/* le sol du skatepark */}
      <rect x={0} y={ground} width={lay.W} height={lay.H - ground} fill="#E2E8F0" />
      <line x1={0} y1={ground} x2={lay.W} y2={ground} stroke="#94A3B8" strokeWidth={1.5} />
      {/* le téléphone qui filme le trick (sur un mini-trépied) */}
      {lay.W - (P.A[0] + 60) > 34 && (
        <g transform={`translate(${phoneX} ${ground - 34})`} opacity={0.9}>
          <line x1={0} y1={30} x2={-7} y2={34} stroke="#475569" strokeWidth={2} />
          <line x1={0} y1={30} x2={7} y2={34} stroke="#475569" strokeWidth={2} />
          <line x1={0} y1={22} x2={0} y2={30} stroke="#475569" strokeWidth={2} />
          <rect x={-9} y={-2} width={18} height={26} rx={3} fill="#0F172A" />
          <rect x={-7} y={1} width={14} height={18} rx={1.5} fill="#38BDF8" opacity={0.6} />
          <circle className={reduce ? undefined : 'rr-rec'} cx={4} cy={4} r={2} fill="#EF4444" />
        </g>
      )}
    </g>
  );
}

/** Le mur du skatepark : briques en quinconce, tags en lettres-bulles (sans aucune lettre lisible), coulures de bombe. */
function Wall({ lay, ground }) {
  const h = Math.max(36, Math.round(ground * 0.5));
  const top = ground - h;
  const bh = 12; const bw = 30;
  const rows = Math.ceil(h / bh);
  const bricks = [];
  for (let r = 0; r < rows; r++) {
    const y = top + r * bh;
    const off = r % 2 ? bw / 2 : 0;
    for (let x = -off; x < lay.W; x += bw) bricks.push(<rect key={`${r}-${x}`} x={x + 1} y={y + 1} width={bw - 2} height={bh - 2} rx={1.5} fill={(r + Math.round(x / bw)) % 3 ? '#F1E3D3' : '#EAD7C3'} />);
  }
  const cy = top + h * 0.48;
  const tags = [
    { x: lay.W * 0.08, c: '#EC4899', d: '#831843' }, { x: lay.W * 0.33, c: '#38BDF8', d: '#0C4A6E' },
    { x: lay.W * 0.58, c: '#FACC15', d: '#713F12' }, { x: lay.W * 0.8, c: '#4ADE80', d: '#14532D' },
  ];
  const k = Math.max(0.35, Math.min(1.2, h / 90, lay.W / 560));
  const shown = lay.W < 320 ? [tags[0], tags[3]] : tags;
  return (
    <g data-deco="graffiti-wall">
      <rect x={0} y={top} width={lay.W} height={h} fill="#D6C2AE" />
      {bricks}
      <rect x={0} y={top - 4} width={lay.W} height={5} fill="#A8A29E" />
      {shown.map((g, j) => (
        <g key={j} transform={`translate(${g.x} ${cy}) scale(${k}) rotate(${j % 2 ? 6 : -5})`} opacity={0.62}>
          <path d="M0 8 C-2 -14 14 -22 22 -8 C26 -22 46 -20 44 0 C58 -6 64 14 50 20 C46 34 22 32 18 22 C6 30 -8 22 0 8 Z" fill={g.c} stroke={g.d} strokeWidth={3} strokeLinejoin="round" />
          <path d="M8 2 C10 -8 18 -10 20 -4 M30 -6 C34 -12 40 -10 40 -2" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.8} />
          <path d={`M14 26 v${10 + j * 3} M38 28 v${6 + (j % 3) * 4}`} stroke={g.c} strokeWidth={3} strokeLinecap="round" />
          <circle cx={14} cy={37 + j * 3} r={2.4} fill={g.c} /><circle cx={38} cy={35 + (j % 3) * 4} r={2.4} fill={g.c} />
        </g>
      ))}
      <path d={`M${lay.W * 0.2} ${top + 10} l6 -6 l3 8 l8 -2 l-6 6 l4 7 l-8 -3 l-5 6 l0 -8 l-8 -2 z`} fill="#F97316" opacity={0.85} />
      <path d={`M${lay.W * 0.47} ${top + h * 0.85} c12 -10 26 8 40 -2 s24 6 34 -4`} fill="none" stroke="#7C3AED" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
    </g>
  );
}

/** Une planche de skate qui fait un kickflip au toucher. Décor seulement. */
function Kickflip() {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => setN((v) => v + 1)} data-deco="kickflip" className="h-10 w-12 shrink-0 rounded-xl focus:outline-none">
      <svg viewBox="0 0 48 40" width="100%" height="100%">
        <style>{'.rr-flip{animation:rr-f .6s ease-out 1;transform-origin:24px 20px}@keyframes rr-f{0%{transform:translateY(0) rotate(0)}50%{transform:translateY(-8px) rotate(180deg)}100%{transform:translateY(0) rotate(360deg)}}@media (prefers-reduced-motion: reduce){.rr-flip{animation:none}}'}</style>
        <g key={n} className={n > 0 && !reduce ? 'rr-flip' : undefined}>
          <rect x={6} y={17} width={36} height={6} rx={3} fill="#7C3AED" />
          <path d="M10 20 h28" stroke="#F0ABFC" strokeWidth={1.5} strokeDasharray="3 3" />
          <circle cx={13} cy={27} r={3} fill="#F59E0B" /><circle cx={35} cy={27} r={3} fill="#F59E0B" />
        </g>
      </svg>
    </button>
  );
}
