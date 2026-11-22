import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PencilLine, CheckCircle2, XCircle, Hand, Gift, MapPin, Play, Undo2, Notebook, Sparkles, X } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import LabFold from '../primitives/LabFold';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import KidFigure from '../primitives/KidFigure';
import { LabCard, StageFrame, PromptCard, StepperCard, RoundButton, VerdictBanner, ChoiceCard } from '../primitives/LabKit';
import { LEVELS } from '../levels';
import * as L from '../logic/fractionKnife';

/**
 * fraction-knife — LE COUTEAU ET LA PART (1AM, unité 4 « الكتابات الكسرية », درس « الكتابات الكسرية لحاصل قسمة واختزال
 * كسر », manuel نشاط 4 p. 54, معارف 3 p. 55, طريقة p. 56). La logique, exacte, est dans `logic/fractionKnife.js`
 * (`core/arithmetic/linear.js` et `divisibility.js`, importés par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La part p/q d'un tout est FIXE (son bord ne bouge jamais) ; la main tient le COUTEAU : d, le nombre de morceaux
 *    égaux du tout. مبتدئ (`world: 'tray'`, thème `sweets-tray`) : le plateau de قلب اللوز de grand-mère, le ruban à 3/5
 *    (la part des voisins) ; متقدم (`world: 'paper'`) : le rectangle du نشاط 4 sur papier quadrillé, puis le cadeau du
 *    grand-père 27/45. Le couteau glisse sur un rail sous le tout (glisser, toucher le rail, flèches ±1 — en RTL ←
 *    affine —, Page ±5, boutons ronds −/+).
 * B. Une même part a BEAUCOUP d'écritures : couper chaque morceau en k multiplie par k les morceaux de la part ET du tout
 *    (3/5 = 6/10 = 12/20) ; réunir k morceaux en un divise les deux par k, possible seulement si k divise les DEUX
 *    (27/45 = 9/15 = 3/5) — c'est réduire. d = 10, 100, 1000 : un كسر عشري et son écriture décimale (3/5 = 6/10 = 0,6).
 * C. Au relâchement, de la logique seule : lisible — les morceaux de la part prennent la couleur de la boîte, la pilule
 *    « 6 قطع من 10 », l'écriture 6/10 TAMPONNÉE dans le دفتر الكتابات (« كسر عشري: 0,6 » à d = 10) ; illisible — le
 *    morceau à cheval est dessiné dedans ET dehors (sa coupe et le ruban visiblement écartés), « 4 قطع وجزء من قطعة »,
 *    aucune écriture, la fillette hésite. Amine (« 3/5 = 4/6 ») : à d = 6 ses 4 morceaux fantômes DÉBORDENT le ruban.
 *    Les épingles (متقدم) : jugées par le couteau quand il passe — vertes si lisibles, roses avec leur « 5,4 » sinon.
 * D. a/b = (a × k)/(b × k), k ≠ 0, avec les k de l'élève ; 27/45 = (27 ÷ 9)/(45 ÷ 9) = 3/5, « نقول إننا اختزلنا الكسر ».
 * E. Avant la règle : مبتدئ — 3 écritures dans le cahier (dont une de la main), une coupe illisible, la proposition
 *    d'Amine jugée ; متقدم — les rectangles 2 et 3 du manuel tamponnés, 27/45 ramené à 5 morceaux, un refus d < 45
 *    (épingle ou coupe). Conjectures fausses réfutées par SES coupes (son 7 ou 8 illisible, le 9 du piège).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        les écritures fractionnaires d'un même nombre ; la réduction
 *   OBJECT         un tout (plateau, rectangle) et UNE part fixe ; un couteau
 *   VARIABLE       d, le nombre de morceaux égaux du tout (1 … max)
 *   INVARIANT      la part (son bord), donc la valeur p/q
 *   TRANSFORMATION couper plus fin (× k) ou plus grossier (÷ k) ; les morceaux de la part se comptent
 *   CONSTRAINT     le numérateur n'est JAMAIS choisi : il se LIT, et n'existe que si le bord tombe sur une coupe
 *   RESISTANCE     un morceau à cheval sur le bord : « وجزء من قطعة », aucune écriture
 *   EVIDENCE       le cahier des écritures tamponnées, le morceau à cheval, les fantômes d'Amine, les épingles jugées
 *   CONTRAST       lisible / illisible côte à côte sur le même tout ; 4/6 (ajouter 1) contre 6/10 (× 2)
 *   PREDICTION     متقدم : des épingles AVANT que le couteau bouge (9 et 3 divisent 45 mais pas lisibles)
 *   DISCOVERY      « نضرب البسط والمقام في نفس العدد » ; « نجمع كل 9 قطع في قطعة: نقسم البسط والمقام على 9 »
 *   FORMALIZATION  a/b = (a × k)/(b × k) ; la réduction ; le كسر عشري
 *   TRANSFER       معارف 3, la طريقة 45/567, les exercices et la banque
 *
 * Ce n'est PAS `fraction-reduction` (4AM : on PORTE un nombre de portions et on divise deux quantités séparées) ni
 * `square-root-side` (une longueur 1D, une cible irrationnelle) : ici UNE aire, UNE part fixe, les deux termes comptés,
 * et le mouvement va dans les deux sens (DNA §12).
 *
 * « جرّب كل الإمكانيات » (§6bis) : NON — chaque coupe et chaque épingle EST une réponse ; balayer le rail donnerait les
 * écritures sans les chercher. Pas d'auto-complétion.
 *
 * LE KIT (§8ter) : `PromptCard` (puce, la question, sa lampe — allumée quand la dernière coupe est lisible —, les cibles du
 * manuel en `aside`), la scène dans un `StageFrame` (le plateau de cuivre et la fillette `KidFigure` en hijab ; le papier
 * quadrillé), le rail du couteau DANS la scène ; large (≥ 600 px) : à côté, la `StepperCard` « عدد القطع » ; étroit : les
 * ronds −/+ aux deux bouts du rail. Sous la scène : le cahier (une rangée de tampons, les plus anciens dans un `LabFold`),
 * le `VerdictBanner` qui garde sa place, puis la carte d'Amine / du cadeau / des épingles.
 *
 * D'UN SEUL REGARD (§8bis) : `[data-fk-glance]` = la consigne + la scène (tout, rail, pilule du compte) + le cahier + le
 * verdict. À d = 45 sur un téléphone le tout est dessiné en 3 bandes de 15 lues de droite à gauche, la part continue
 * d'une bande à l'autre (`L.bandsFor`, `L.trayLayout`, balayés : chaque morceau ≥ 6 px).
 *
 * Props (contrat fixé avec la leçon) : `world` ('tray' | 'paper'), `share` [p, q], `start`, `max`, `claim` [a, b]
 * (مبتدئ), `targets` [[a, d], …] (متقدم), `then` { share, start, max, predict } (متقدم), `level`, `levels`, `title`,
 * `lead`, `onTrial(e)` — e = { kind: 'cut', share, d, inShare, readable, writing? } | { kind: 'claim', claim, ok, answer }
 * | { kind: 'pin', share, d, readable } —, `onFinished({ share })` à la règle ; tous par `state.report`.
 *
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 1, 2026-10-28) : `checkpoints` (défaut true).
 * مبتدئ (une seule scène) : quand la découverte serait prête (3 écritures, une coupe illisible, Amine jugé), UNE suite par-dessus le
 * labo (`chainsOf`) : le k de SES écritures · pourquoi 4/6 déborde · le كسر عشري · LA RÈGLE. متقدم : la part 1 quand les cibles sont
 * tamponnées (k · le كسر عشري), la part 2 quand 27/45 est ramené (combien de morceaux réunis · le diviseur refusé · LA RÈGLE). La règle
 * formalise (`onDone`). « أعِد التجربة » remet LA MÊME part (`L.retryStage`) ; « إعادة » la part 1. Mode guidé (`guided`) dès qu'une suite
 * est active ; l'enseignant seul coupe les questions pour SON compte. ÉTAPES `LabStepper` (`[data-fk-step=<i>]`, متقدم) et la fête par
 * part. SON : `tooth` pour chaque coupe du couteau (plus grave en arrière), `bell` une écriture tamponnée, `over` une coupe à cheval,
 * `flag` la part terminée.
 * ONBOARDING (prop `coach`, défaut true — `LabCoach`, §8quater) : `logic/fractionKnife.js › coachOf` montre la poignée du couteau,
 * la proposition à ouvrir, la carte de réponse, le cadeau, puis le curseur / « غرس » / « ابدأ » des épingles ; jamais un nombre
 * de morceaux ni une réponse.
 *
 * CONTRAT DOM : [data-fraction-knife][data-world][data-share][data-d][data-solved][data-stage][data-layout],
 * [data-fk-glance], [data-fk-scene][data-bands], [data-fk-knife] (role=slider, aria-valuenow = d), [data-fk-pin-cursor]
 * (slider de prédiction), [data-fk-less] / [data-fk-more] (une seule paire), [data-fk-piece=<i>][data-in] (full | part |
 * out), [data-fk-edge], [data-fk-count], [data-fk-notebook], [data-fk-stamp=<a/d>][data-figure], [data-fk-decimal],
 * [data-fk-claim][data-judged], [data-fk-claim-open], [data-fk-answer=true|false], [data-fk-ghost], [data-fk-pin=<d>]
 * [data-state], [data-fk-plant], [data-fk-start], [data-fk-verdict=<readable|straddle|>], [data-fk-glue], [data-fk-target=<a/d>]
 * [data-done], [data-fk-next], [data-fk-back], [data-fk-same], [data-fk-formal], [data-fk-girl][data-mood].
 */
const NS = 'manipulation.fractionKnife';
const WIDE_MIN = 600;
const SIDE_W = 214;
const MOTION_CSS = '@keyframes fk-stamp{0%{transform:scale(1.7) rotate(-14deg);opacity:0}60%{transform:scale(.92) rotate(-5deg);opacity:1}100%{transform:scale(1) rotate(-4deg)}}'
  + '@keyframes fk-cut{from{opacity:0;transform:scaleY(.2)}to{opacity:1;transform:scaleY(1)}}'
  + '@keyframes fk-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}'
  + '.fk-stamp{animation:fk-stamp .42s cubic-bezier(.34,1.56,.64,1) both}'
  + '.fk-cut{transform-box:fill-box;transform-origin:50% 50%;animation:fk-cut .22s ease-out both}'
  + '.fk-shake{animation:fk-shake .36s ease-in-out 2}'
  + '@media (prefers-reduced-motion: reduce){.fk-stamp,.fk-cut,.fk-shake{animation:none}}';

/** Une fraction écrite en colonne (numérateur, barre, dénominateur) — un îlot LTR. */
export function Frac({ n, d, className = '', ...rest }) {
  return (
    <span className={`inline-flex flex-col items-center align-middle font-mono font-black leading-none tabular-nums ${className}`} dir="ltr" {...rest}>
      <span className="px-0.5">{n}</span>
      <span className="my-[2px] block h-[2px] w-full min-w-[1.1em] rounded bg-current" aria-hidden="true" />
      <span className="px-0.5">{d}</span>
    </span>
  );
}

/** Une égalité de fractions : UN îlot LTR dont les morceaux ne se réordonnent jamais. */
function Row({ children, className = '', ...rest }) {
  return <bdi dir="ltr" className={`inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 ${className}`} {...rest}>{children}</bdi>;
}

export default function FractionKnife({
  world: world0, share: share0, start: start0, max: max0, claim: claim0, targets: targets0, then: then0,
  title, lead, level, levels: withLevels = true, initialMode = 'student', allowModeSwitch = false, onTrial, onFinished, coach: coachOn = true,
  checkpoints: cpOn = true,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const preset = LEVELS['fraction-knife'][resolveLevelId(level ?? 'beginner')].numbers;
  const initialNumbers = useMemo(() => {
    const out = {
      world: world0 ?? preset.world,
      share: share0 ?? preset.share,
      start: start0 ?? preset.start,
      max: max0 ?? preset.max,
    };
    const claim = claim0 !== undefined ? claim0 : preset.claim;
    const targets = targets0 !== undefined ? targets0 : preset.targets;
    const then = then0 !== undefined ? then0 : preset.then;
    if (claim) out.claim = claim;
    if (targets) out.targets = targets;
    if (then) out.then = then;
    return out;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'fraction-knife', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const numbers = state.numbers;
  const sceneKey = `${JSON.stringify(numbers)}|${state.epoch}`;
  const [lab, setLab] = useState(() => L.init(numbers));
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  // « إعادة » (epoch), un autre niveau : TOUT recommence — la part 1, le cahier, les essais et les questions du labo
  if (scene.key !== sceneKey) { setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(L.init(numbers)); }
  const world = lab.world;
  const st = L.current(lab);

  const ready = L.discoveryReady(lab);
  // les questions pendant le labo : la suite de la part courante (`chainsOf`)
  const cpSettings = useLabCheckpointSettings('fraction-knife');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const chains = cpOn && cpSettings.enabled ? chainsOf(lab) : null;
  const chain = chains?.[lab.stage] ?? null;
  const ruleByCheckpoint = !!chains;
  const stageReached = stageDone(lab, lab.stage);
  const cp = useLabCheckpoint({
    id: chain ? `stage-${lab.stage}` : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, k)) : null,
    reached: stageReached,
    resetKey: scene.inits,
    onRetry: () => setLab(L.retryStage),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (chains?.[Number(id.slice(6))]?.includes('rule')) { state.discover(); state.formalize(); } },
  });
  // le son : chaque coupe du couteau (au plus une note toutes les 35 ms), puis le relâchement jugé, puis la part terminée
  const prevD = useRef({ d: lab.d, at: 0 });
  useEffect(() => {
    const p = prevD.current;
    const now = Date.now();
    if (lab.d !== p.d && now - p.at > 35) { playSfx('tooth', { pitch: lab.d > p.d ? 1 : 0.75 }); p.at = now; }
    p.d = lab.d;
  }, [lab.d]);
  const lastSeen = useRef(lab.last);
  useEffect(() => {
    const v = lab.last;
    if (v === lastSeen.current) return;
    lastSeen.current = v;
    if (!v) return;
    if (v.stamped) playSfx('bell');
    else if (!v.cut.readable) playSfx('over');
  }, [lab.last]);
  const flagged = useRef(false);
  useEffect(() => {
    if (!stageReached) { flagged.current = false; return; }
    if (!flagged.current) { flagged.current = true; playSfx('flag'); }
  }, [stageReached]);
  // les étapes (متقدم : deux parts) : une part est FAITE quand son but est atteint ET que ses questions sont répondues
  const nStages = lab.stages.length;
  const stepDone = lab.stages.map((_, i) => stageDone(lab, i) && (i !== lab.stage || !cp.blocking));
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = stepDone[lab.stage];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.stage)) return;
    celebrated.current.add(lab.stage);
    party.celebrate({ n: lab.stage + 1, total: nStages });
  }, [nowDone, lab.stage]); // eslint-disable-line react-hooks/exhaustive-deps
  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'fraction-knife', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });
  useEffect(() => { if (ready && !ruleByCheckpoint) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, { share: L.finishedShare(lab) }); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  // chaque essai rapporté UNE fois, même quand un geste en produit plusieurs (une épingle traversée + la coupe)
  const reported = useRef(0);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials < reported.current) reported.current = 0;
    for (let i = reported.current; i < nTrials; i += 1) state.report(onTrial, L.trialEvidence(lab.trials[i]));
    reported.current = nTrials;
  }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── les noms comptés ── */
  const pieces = (n) => k('pieces', { count: n });

  /* ── mesure ── */
  const boxRef = useRef(null);
  const [width, setWidth] = useState(320);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => setWidth(Math.max(220, Math.floor(el.clientWidth)));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 720;
  const compact = width < 380;
  const wide = width >= WIDE_MIN;
  const short = screenH < 700;
  const W = Math.min(wide ? width - SIDE_W - 12 : width, 900);

  /* ── la géométrie de la scène ── */
  const tray = world === 'tray';
  const girlW = tray ? (compact ? 52 : wide ? 96 : 76) : 0;
  const padX = compact ? 8 : 14;
  const rim = tray ? (compact ? 7 : 10) : 0;
  const cakeX0 = padX + rim + (tray ? 0 : 4);
  const cakeW = Math.max(120, W - girlW - padX * 2 - rim * 2 - (tray ? 4 : 8));
  const B = L.bandsFor(st.max, cakeW);
  const bandH = B === 1 ? (compact ? 66 : wide ? (short ? 96 : 116) : short ? 78 : 92) : (compact ? 40 : wide ? 58 : 50);
  const bandGap = 10;
  const topPad = compact ? 40 : 46;
  const cakeY0 = topPad + rim;
  const cakeH = B * bandH + (B - 1) * bandGap;
  const trayBottom = cakeY0 + cakeH + rim;
  const railY = trayBottom + (compact ? 34 : 38);
  const H = railY + (compact ? 30 : 34);
  const railPad = wide ? 26 : 62; // étroit : les ronds −/+ aux deux bouts du rail
  const rail = { x0: railPad, x1: W - railPad, max: st.max };
  const lay = useMemo(() => L.trayLayout({ p: st.p, q: st.q, d: lab.d, bands: B, width: cakeW }), [st.p, st.q, lab.d, B, cakeW]);

  /* ── LE geste : le couteau (ou, pendant la prédiction, le curseur d'épingle) ── */
  const predicting = lab.predicting;
  const toValue = useCallback((cx, cy, rect) => L.railValue(cx - rect.left, rail), [rail.x0, rail.x1, rail.max]); // eslint-disable-line react-hooks/exhaustive-deps
  const knife = useStretchInteraction({
    value: predicting ? lab.cursor : lab.d,
    range: { min: 1, max: predicting ? st.max - 1 : st.max },
    toValue, direction: 'rtl', pageStep: 5,
    onChange: (d) => setLab((s) => (s.predicting ? L.setCursor(s, d) : L.setD(s, d))),
    onCommit: (d) => setLab((s) => (s.predicting ? L.setCursor(s, d) : L.commitD(s, d))),
  });

  /* ── le verdict du dernier relâchement ── */
  const cut = L.shownCut(lab);
  const live = L.readCut(st.p, st.q, lab.d);
  const lit = !!cut && cut.readable;
  const stamped = lab.last?.stamped && cut;
  const claim = lab.claim;
  const claimV = L.claimVerdict(lab);
  const ghosts = tray && claim && claim.state !== 'closed' && claim.state !== 'right' && lab.d === claim.b && !predicting;
  const glue = L.shownGlue(lab);
  const same = lab.stage === 1 && cut?.readable && cut.d === L.reducedTo(lab);
  const mood = cut ? (cut.readable ? 'proud' : 'wonder') : 'happy';

  const verdictText = useMemo(() => {
    if (!cut) return '';
    if (cut.readable) return k(stamped ? 'v.readable' : 'v.readableAgain', { pieces: pieces(cut.a), d: cut.d });
    return k('v.straddle', { n: cut.whole + 1, piecesD: pieces(cut.d) });
  }, [cut, stamped, k]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la pilule du compte (vivante : ce que la main a produit) ── */
  const countText = live.readable
    ? k('count.readable', { pieces: pieces(live.a), d: live.d })
    : live.whole === 0 ? k('count.partOnly') : k('count.straddle', { pieces: pieces(live.whole) });

  /* ── la découverte ── */
  const discoveryOptions = useMemo(() => {
    if (world === 'paper' && lab.stages.length > 1) {
      const s1 = lab.stages[1];
      const dv = L.refusedDivisor(lab) ?? 9;
      const kk = s1.start / dv;
      const over = L.decimalText(L.product(s1.p, s1.q, dv));
      const den = L.readablePeriod(s1.p, s1.q);
      return [
        { text: k('discovery.anyDivisor'), why: k('discovery.whyAnyDivisor', { d: dv, k: kk, q: s1.start, p: s1.p, x: over }) },
        { text: k('discovery.denOnly'), why: k('discovery.whyDenOnly', { p: s1.p, d: den, x: L.decimalText(L.shareValue(s1.p, den)) }) },
        { text: k('discovery.rightPaper', { k: s1.start / den }), correct: true },
      ];
    }
    const s0 = lab.stages[0];
    const c = claim ?? { a: s0.p + 1, b: s0.q + 1 };
    const cv = L.judgeClaim(s0.p, s0.q, [c.a, c.b]);
    const dd = L.firstUnreadable(lab) ?? (s0.start + 2);
    const rc = L.readCut(s0.p, s0.q, dd);
    return [
      { text: k('discovery.add'), why: k('discovery.whyAdd', { a: c.a, b: c.b, x: L.decimalText(cv.cut.inShare), piecesB: pieces(c.b) }) },
      { text: k('discovery.rightTray'), correct: true },
      { text: k('discovery.bigger'), why: k('discovery.whyBigger', { piecesD: pieces(dd), reading: rc.whole === 0 ? k('count.partOnly') : k('count.straddle', { pieces: pieces(rc.whole) }) }) },
    ];
  }, [lab, world, claim, k]); // eslint-disable-line react-hooks/exhaustive-deps

  const discoveryPromptArgs = (() => {
    if (lab.stages.length < 2) return {};
    const s1 = lab.stages[1];
    const r = L.readCut(s1.p, s1.q, L.readablePeriod(s1.p, s1.q));
    return { p: s1.p, q: s1.q, a2: r.a, d2: r.d };
  })();

  /* ── la règle, avec les nombres de l'élève ── */
  const mult = L.multiplyLines(lab);
  const decimalStamp = lab.notebook[0].find((x) => x.decimal);
  const s0 = lab.stages[0];
  const formal = (
    <div className="space-y-2.5 text-indigo-950" data-fk-formal>
      <p className="flex justify-center text-base">
        <Row className="text-lg">
          <Frac n="a" d="b" /><span>=</span><Frac n="a × k" d="b × k" />
          <span className="font-mono text-sm font-bold text-slate-600">(k ≠ 0)</span>
        </Row>
      </p>
      {mult.length > 0 && (
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2" data-fk-formal-mult>
          {mult.map((m) => (
            <Row key={m.d2} className="text-base">
              <Frac n={m.a} d={m.d} /><span>=</span><Frac n={`${m.a} × ${m.k}`} d={`${m.d} × ${m.k}`} /><span>=</span><Frac n={m.a2} d={m.d2} />
            </Row>
          ))}
        </div>
      )}
      {decimalStamp && (
        <p className="flex flex-wrap items-center justify-center gap-2 text-sm font-bold" data-fk-formal-decimal>
          <Row className="text-base"><Frac n={s0.p} d={s0.q} /><span>=</span><Frac n={decimalStamp.a} d={decimalStamp.d} /><span>=</span><span className="font-mono text-lg font-black">{decimalStamp.decimal}</span></Row>
          <span className="text-emerald-800">{k('formal.decimal')}</span>
        </p>
      )}
      {world === 'paper' && lab.stages.length > 1 && (() => {
        const tg = L.totalGlue(lab);
        const steps = L.reduceSteps(lab);
        if (!tg) return null;
        return (
          <div className="space-y-1.5 rounded-2xl border border-emerald-200 bg-white/70 p-2" data-fk-formal-reduce>
            <p className="flex justify-center">
              <Row className="text-base">
                <Frac n={tg.a} d={tg.d} /><span>=</span><Frac n={`${tg.a} ÷ ${tg.k}`} d={`${tg.d} ÷ ${tg.k}`} /><span>=</span><Frac n={tg.a2} d={tg.d2} />
              </Row>
            </p>
            {steps.length > 1 && (
              <p className="flex justify-center">
                <Row className="text-sm">
                  <Frac n={steps[0].from[0]} d={steps[0].from[1]} />
                  {steps.map((sp) => (
                    <React.Fragment key={sp.to[1]}><span className="text-xs text-slate-500">{`÷ ${sp.k}`}</span><span>=</span><Frac n={sp.to[0]} d={sp.to[1]} /></React.Fragment>
                  ))}
                </Row>
              </p>
            )}
            <p className="text-center text-sm font-extrabold text-emerald-900">{k('formal.reduced')}</p>
          </div>
        );
      })()}
      <p className="text-sm text-emerald-900">{k(`formal.rule.${world}`)}</p>
    </div>
  );

  /* ── les commandes : la carte (large) ou les ronds au bout du rail (étroit) ── */
  const moving = predicting ? lab.cursor : lab.d;
  const lo = 1;
  const hi = predicting ? st.max - 1 : st.max;
  const lessDisabled = moving <= lo;
  const moreDisabled = moving >= hi;
  const lessProps = { 'data-fk-less': true };
  const moreProps = { 'data-fk-more': true };
  const stepper = wide && (
    <StepperCard
      layout="card"
      title={k(predicting ? 'stepTitlePin' : 'stepTitle')}
      value={moving}
      onLess={() => knife.nudge(-1)} onMore={() => knife.nudge(1)}
      lessDisabled={lessDisabled} moreDisabled={moreDisabled}
      lessLabel={k('less')} moreLabel={k('more')}
      lessProps={lessProps} moreProps={moreProps}
      readoutProps={{ 'data-fk-readout': moving }}
    />
  );
  const railButtons = !wide && (
    <>
      <RoundButton size={44} className="absolute" style={{ right: 10, top: railY - 22, width: 44, height: 44 }}
        onClick={() => knife.nudge(-1)} disabled={lessDisabled} aria-label={k('less')} {...lessProps}>
        <span className="text-2xl font-black leading-none" aria-hidden="true">−</span>
      </RoundButton>
      <RoundButton primary size={44} className="absolute" style={{ left: 10, top: railY - 22, width: 44, height: 44 }}
        onClick={() => knife.nudge(1)} disabled={moreDisabled} aria-label={k('more')} {...moreProps}>
        <span className="text-2xl font-black leading-none" aria-hidden="true">+</span>
      </RoundButton>
    </>
  );

  /* ── le verdict : un seul bandeau, qui garde sa place ── */
  const idle = predicting ? k('instruction.predict') : k(`instruction.${world}`);
  const verdictTone = cut ? (cut.readable ? 'emerald' : 'rose') : 'indigo';
  const verdictLine = (
    <VerdictBanner tone={verdictTone} icon={cut ? (cut.readable ? CheckCircle2 : XCircle) : predicting ? MapPin : Hand}
      size={compact ? 'xs' : 'sm'} className={`${compact ? '!gap-2 !px-2.5 !py-1.5 min-h-[3.5rem]' : 'min-h-[3.25rem]'}`}
      data-fk-verdict={cut ? (cut.readable ? 'readable' : 'straddle') : ''}>
      <p className={cut ? '' : 'font-bold text-indigo-900'}>{cut ? verdictText : idle}</p>
    </VerdictBanner>
  );

  /* ── le cahier des écritures : une rangée de tampons ; les plus anciens repliés sur un téléphone ── */
  const book = L.stamps(lab);
  // la rangée tient sur UNE ligne : on garde les plus récents qui y entrent (largeur estimée d'un tampon), les autres se replient
  const stampW = (x) => (x.decimal ? (compact ? 92 : 100) : (compact ? 42 : 50) + (String(x.d).length > 1 ? 6 : 0)) + 12;
  let room = width - (compact ? 56 : 150) - (wide ? SIDE_W * 0 : 0);
  let fitStamps = 0;
  for (let i = book.length - 1; i >= 0; i -= 1) { room -= stampW(book[i]); if (room < 0) break; fitStamps += 1; }
  fitStamps = Math.max(1, fitStamps);
  const shownStamps = book.slice(-fitStamps);
  const olderStamps = book.slice(0, Math.max(0, book.length - fitStamps));
  const lastStamp = lab.last?.stamped ? book.at(-1) : null;
  const stampNode = (x, small = false) => (
    <span key={x.writing} data-fk-stamp={x.writing} data-figure={x.figure ?? undefined}
      className={`relative inline-flex shrink-0 flex-col items-center rounded-xl border-2 border-dashed ${x.figure ? FIG_TONE[x.figure].stamp : 'border-indigo-300 bg-white text-indigo-900'} ${small ? 'px-1.5 py-0.5' : 'px-2 py-1'} ${x === lastStamp ? 'fk-stamp' : ''}`}
      style={{ transform: 'rotate(-4deg)' }}>
      {x.figure && (
        <span className={`absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black text-white ${FIG_TONE[x.figure].badge}`} aria-label={k('figure', { n: x.figure })}>{x.figure}</span>
      )}
      <Frac n={x.a} d={x.d} className={small ? 'text-sm' : compact ? 'text-base' : 'text-lg'} />
      {x.decimal && (
        <span className="mt-0.5 whitespace-nowrap rounded-full bg-emerald-100 px-1.5 text-[10px] font-extrabold text-emerald-900" data-fk-decimal={x.decimal}>
          {k('decimal')} <bdi dir="ltr" className="font-mono">{x.decimal}</bdi>
        </span>
      )}
    </span>
  );
  const notebook = (
    <LabCard className={`flex items-center gap-2 overflow-hidden ${compact ? 'p-2' : 'px-3 py-2'}`} data-fk-notebook={book.length}>
      <span className="flex shrink-0 items-center gap-1 text-xs font-black text-indigo-800">
        <Notebook className="h-4 w-4" aria-hidden="true" />{k(compact ? 'notebookShort' : 'notebook')}
      </span>
      <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-2.5 py-1.5">{shownStamps.map((x) => stampNode(x))}</div>
    </LabCard>
  );

  /* ── les cibles du manuel (متقدم, première part) ── */
  const done = L.targetsDone(lab);
  const targetsAside = world === 'paper' && lab.stage === 0 && lab.targets && (
    <div className="flex flex-wrap items-center gap-1.5" data-fk-targets>
      <span className="text-xs font-black text-indigo-900/60">{k('targetsLabel')}</span>
      {lab.targets.map(([a, d], i) => (
        <span key={`${a}/${d}`} data-fk-target={`${a}/${d}`} data-done={done[i] ? 'true' : 'false'}
          className={`inline-flex items-center gap-1 rounded-2xl border-2 px-1.5 py-0.5 ${done[i] ? `${FIG_TONE[i + 2].stamp}` : 'border-slate-200 bg-white text-slate-500'}`}>
          <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black text-white ${FIG_TONE[i + 2].badge}`} aria-label={k('figure', { n: i + 2 })}>{i + 2}</span>
          <Frac n={a} d={d} className="text-xs" />
          {done[i] && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
        </span>
      ))}
    </div>
  );

  /* ── la carte d'Amine (مبتدئ) ── */
  const claimCard = claim && lab.stage === 0 && (L.canOpenClaim(lab) || claim.state !== 'closed') && (
    claim.state === 'closed' ? (
      <button type="button" onClick={() => setLab(L.openClaim)} data-fk-claim-open
        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-amber-300 bg-amber-50 px-3 text-sm font-black text-amber-950 shadow-[0_4px_0_0_#FCD34D] outline-none transition-transform active:translate-y-0.5 active:shadow-none focus-visible:ring-4 focus-visible:ring-amber-300 motion-reduce:transition-none">
        <Sparkles className="h-4 w-4" aria-hidden="true" /> {k('claim.open')}
      </button>
    ) : (
      <LabCard className={`space-y-2 border-amber-200 bg-amber-50/70 ${compact ? 'p-2.5' : 'p-3'}`} data-fk-claim={`${claim.a}/${claim.b}`} data-judged={claim.state === 'right' ? 'true' : claim.state === 'wrong' ? 'wrong' : 'false'}>
        <p className="flex flex-wrap items-center gap-2 text-sm font-bold leading-snug text-amber-950">
          <span className="font-black">{k('claim.who')}</span>
          <span>{k('claim.text')}</span>
          <Row className="text-base"><Frac n={s0.p} d={s0.q} /><span>=</span><Frac n={claim.a} d={claim.b} /></Row>
        </p>
        {claim.state === 'right' ? (
          <p className="flex items-start gap-2 text-sm font-extrabold text-emerald-900"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {k('claim.right', { a: claim.a, x: L.decimalText(claimV.cut.inShare), piecesB: pieces(claim.b) })}</p>
        ) : (
          <>
            {claim.state === 'wrong' && (
              <p className="flex items-start gap-2 text-sm font-extrabold text-rose-900"><XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {k('claim.wrong', { a: claim.a, x: L.decimalText(claimV.cut.inShare) })}</p>
            )}
            {lab.d !== claim.b && <p className="text-xs font-bold text-amber-900">{k('claim.cut', { piecesB: pieces(claim.b) })}</p>}
            <div className="grid grid-cols-2 gap-2">
              {['true', 'false'].map((ans) => (
                <ChoiceCard key={ans} size="md" data-fk-answer={ans} disabled={!L.claimCuttable(lab)}
                  state={!L.claimCuttable(lab) ? 'locked' : claim.answers.at(-1) === ans ? 'tried' : 'idle'}
                  onClick={() => setLab((s) => L.answerClaim(s, ans))}>{k(`claim.${ans}`)}</ChoiceCard>
              ))}
            </div>
          </>
        )}
      </LabCard>
    )
  );

  /* ── le cadeau du grand-père (متقدم) ── */
  const nextCard = L.canOpenNext(lab) && !cp.blocking && (
    <LabCard className={`space-y-2 border-amber-200 bg-amber-50/70 ${compact ? 'p-2.5' : 'p-3'}`} data-fk-next>
      <p className={`${compact ? 'text-xs' : 'text-sm'} flex flex-wrap items-center gap-x-2 gap-y-1 font-bold leading-snug text-amber-950`}>
        <span className="font-black">{k('next.title')}</span> <span>{k('next.text', { p0: s0.p, q0: s0.q, p: lab.stages[1].p, q: lab.stages[1].q })}</span>
      </p>
      <button type="button" onClick={() => setLab(L.openNext)} data-fk-next-button
        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 px-3 text-sm font-black text-amber-950 shadow-[0_4px_0_0_#D97706] outline-none transition-transform active:translate-y-0.5 active:shadow-none focus-visible:ring-4 focus-visible:ring-amber-300 motion-reduce:transition-none">
        <Gift className="h-5 w-5" aria-hidden="true" /> {k('next.button')}
      </button>
    </LabCard>
  );
  const backButton = lab.stages.length > 1 && (lab.stage === 1 || lab.notebook[1].length > 1) && (
    <button type="button" onClick={() => setLab(lab.stage === 1 ? L.backToFirst : L.backToSecond)} data-fk-back
      className="inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-indigo-100 bg-white px-3 text-xs font-bold text-indigo-800 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
      <Undo2 className="h-4 w-4" aria-hidden="true" /> {k(lab.stage === 1 ? 'next.back' : 'next.again')}
    </button>
  );

  /* ── les épingles de prédiction (متقدم, seconde part) ── */
  const pinCard = predicting && (
    <LabCard className={`space-y-2 ${compact ? 'p-2.5' : 'p-3'}`} data-fk-predict>
      <div className="flex flex-wrap items-center gap-2">
        {lab.pins.map((p) => (
          <button key={p.d} type="button" onClick={() => setLab((s) => L.togglePin(s, p.d))} data-fk-pin-chip={p.d}
            aria-label={k('pin.remove', { piecesD: pieces(p.d) })}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-indigo-300 bg-indigo-50 px-3 text-sm font-black text-indigo-900 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            <MapPin className="h-4 w-4" aria-hidden="true" /><bdi dir="ltr" className="font-mono">{p.d}</bdi><X className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
          </button>
        ))}
        <span className="text-xs font-bold text-slate-500">{k('pin.left', { n: L.MAX_PINS - lab.pins.length })}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" data-fk-plant onClick={() => setLab((s) => L.togglePin(s, s.cursor))}
          disabled={lab.pins.length >= L.MAX_PINS || lab.pins.some((p) => p.d === lab.cursor)}
          className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-2xl border-2 border-indigo-200 bg-white px-2 text-sm font-black text-indigo-900 shadow-[0_4px_0_0_#E0E3FF] outline-none transition-transform active:translate-y-0.5 active:shadow-none focus-visible:ring-4 focus-visible:ring-indigo-300 disabled:opacity-40 motion-reduce:transition-none">
          <MapPin className="h-4 w-4" aria-hidden="true" /> {k('pin.plant')} <bdi dir="ltr" className="font-mono">{lab.cursor}</bdi>
        </button>
        <button type="button" data-fk-start onClick={() => setLab(L.startKnife)} disabled={!L.canStartKnife(lab)}
          className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-600 px-2 text-sm font-black text-white shadow-[0_4px_0_0_#3730A3] outline-none transition-transform active:translate-y-0.5 active:shadow-none focus-visible:ring-4 focus-visible:ring-indigo-300 disabled:opacity-40 motion-reduce:transition-none">
          <Play className="h-4 w-4" aria-hidden="true" /> {k('pin.start')}
        </button>
      </div>
    </LabCard>
  );
  const pinsRow = lab.stage === 1 && !predicting && lab.pins.length > 0 && (
    <div className="flex flex-wrap items-center gap-1.5" data-fk-pins>
      {lab.pins.map((p) => {
        const c = L.readCut(st.p, st.q, p.d);
        const tone = p.state === 'readable' ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : p.state === 'straddle' ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-indigo-200 bg-white text-indigo-800';
        return (
          <span key={p.d} data-fk-pin-chip={p.d} data-state={p.state} className={`inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-0.5 text-xs font-black ${tone}`}>
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            <bdi dir="ltr" className="font-mono">{p.d}</bdi>
            {p.state === 'planted' && <span className="font-bold opacity-70">{k('pin.waiting')}</span>}
            {p.state === 'readable' && <><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /><bdi dir="ltr" className="font-mono">{c.writing}</bdi></>}
            {p.state === 'straddle' && <><XCircle className="h-3.5 w-3.5" aria-hidden="true" /><span>{k('pin.straddle', { x: L.decimalText(c.inShare) })}</span></>}
          </span>
        );
      })}
    </div>
  );
  const sameCard = same && (
    <LabCard className={`flex items-center gap-2 border-emerald-200 bg-emerald-50 ${compact ? 'p-2.5' : 'p-3'}`} data-fk-same>
      <Gift className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
      <Row className="text-base text-emerald-950"><Frac n={st.p} d={st.q} /><span>=</span><Frac n={cut.a} d={cut.d} /></Row>
      <p className="text-sm font-extrabold text-emerald-900">{k('same')}</p>
    </LabCard>
  );

  // §17.9 : le CONTEXTE (la part, en nombres) puis UNE question qui nomme l'état final ; pas de puce, pas de titre visible
  const promptKey = lab.stage === 1 ? 'gift' : world;
  const promptArgs = { p: st.p, q: st.q, p0: s0.p, q0: s0.q, pieces: pieces(st.p), piecesQ: pieces(st.q) };
  const promptContext = (lab.stage === 0 && state.isAuthoredLevel && lead) || k(`context.${promptKey}`, promptArgs);
  const promptTitle = k(`question.${promptKey}`, promptArgs);

  const sceneNode = (
    <KnifeScene
      lab={lab} st={st} lay={lay} k={k} W={W} H={H} world={world} compact={compact}
      cakeX0={cakeX0} cakeY0={cakeY0} cakeW={cakeW} bandH={bandH} bandGap={bandGap} rim={rim} trayBottom={trayBottom}
      girlW={girlW} padX={padX} railY={railY} rail={rail} knife={knife} predicting={predicting} cut={cut} mood={mood}
      ghosts={ghosts ? claimV : null} glue={glue} same={same} countText={countText} live={live} pieces={pieces}
      railButtons={railButtons} wide={wide} onPlant={() => setLab((s) => L.togglePin(s, s.cursor))}
    />
  );

  return (
    <ManipulationShell
      type="fraction-knife"
      title={title ?? k(`title.${world}`)}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      hints={[0, 1, 2].map((i) => k(`hints.${world}.${i}`))}
      guided={!!chain || ruleByCheckpoint}
      headerAction={cpSettings.control}
      coach={coachOn ? coach : null}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={<ManipulationDiscovery state={state} prompt={k(`discovery.prompt.${world}`, discoveryPromptArgs)} options={discoveryOptions} formal={formal} />}
      explanation={k('explanation')}
    >
      <ManipulationStage className="bg-gradient-to-b from-indigo-50/40 to-white">
        <div ref={boxRef} className="space-y-2" data-fraction-knife data-world={world} data-share={st.label} data-d={lab.d}
          data-stage={lab.stage} data-solved={ready ? 'true' : 'false'} data-layout={wide ? 'wide' : 'narrow'}>
          <style dangerouslySetInnerHTML={{ __html: MOTION_CSS }} />
          <div className="relative space-y-2.5" data-fk-glance>
            {party.node}
            {cp.node}
            <PromptCard
              size={compact ? 'md' : 'lg'}
              aside={nStages > 1 || targetsAside ? (
                <div className="flex flex-wrap items-center gap-2">
                  {nStages > 1 && <LabStepper count={nStages} current={lab.stage} done={stepDone} stepAttr="data-fk-step" />}
                  {targetsAside}
                </div>
              ) : null}
              context={promptContext}
              contextProps={{ 'data-fk-context': promptKey }}
              title={promptTitle}
              titleClassName={compact ? 'text-base' : wide ? 'text-xl' : 'text-lg'}
              lamp={lit ? 'on' : 'off'}
              titleProps={{ 'data-fk-prompt': true, 'data-lit': lit ? 'true' : 'false' }}
            />
            {wide ? (
              <div className="flex items-start gap-3">
                {sceneNode}
                <div className="shrink-0" style={{ width: SIDE_W }}>{stepper}</div>
              </div>
            ) : sceneNode}
            {notebook}
            {verdictLine}
          </div>
          {(claimCard || nextCard || pinCard || sameCard || backButton || pinsRow) && (
            <div className="space-y-2">
              {pinsRow}{sameCard}{claimCard}{pinCard}{nextCard}
              {backButton && <div className="flex justify-start">{backButton}</div>}
            </div>
          )}
          {olderStamps.length > 0 && (
            <LabFold id="fraction-knife.notebook" title={k('notebookAll')}>
              <div className="flex flex-wrap gap-2.5 py-1">{olderStamps.map((x) => stampNode(x, true))}</div>
            </LabFold>
          )}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/** Les couleurs des rectangles du manuel : 1 jaune, 2 rouge, 3 vert. */
const FIG_TONE = {
  1: { stamp: 'border-amber-400 bg-amber-50 text-amber-900', badge: 'bg-amber-500', fill: '#FDE68A', line: '#D97706' },
  2: { stamp: 'border-rose-400 bg-rose-50 text-rose-900', badge: 'bg-rose-500', fill: '#FDA4AF', line: '#E11D48' },
  3: { stamp: 'border-emerald-400 bg-emerald-50 text-emerald-900', badge: 'bg-emerald-600', fill: '#86EFAC', line: '#059669' },
};

/* ══════════════ la scène : le tout, la part, le couteau ══════════════ */

function KnifeScene({
  lab, st, lay, k, W, H, world, compact, cakeX0, cakeY0, cakeW, bandH, bandGap, rim, trayBottom, girlW, padX, railY, rail,
  knife, predicting, cut, mood, ghosts, glue, same, countText, live, pieces, railButtons, wide, onPlant,
}) {
  const uid = useId().replace(/:/g, '');
  const tray = world === 'tray';
  const bandY = (b) => cakeY0 + b * (bandH + bandGap);
  const X = (x) => cakeX0 + x;
  const showCut = !!cut;
  const straddle = showCut && !cut.readable;
  const shareFill = tray ? `url(#fk-box-${uid})` : FIG_TONE[1].fill;
  const edgeX = X(lay.edge.x);
  const edgeY = bandY(lay.edge.band);
  // la part : de la droite de la bande 0 jusqu'au bord (continue d'une bande à l'autre)
  const shareRects = [];
  for (let b = 0; b <= lay.edge.band; b += 1) {
    const x0 = b === lay.edge.band ? lay.edge.x : 0;
    if (cakeW - x0 > 0.01) shareRects.push({ b, x0, x1: cakeW });
  }
  const firstStamps = lab.notebook[0];
  const figDone = (n) => lab.stage === 0 && firstStamps.some((x) => x.figure === n);
  const knifeX = L.railX(predicting ? lab.cursor : lab.d, rail);
  const handleLabel = predicting ? k('pin.cursor') : k(tray ? 'knife' : 'pencil');
  const handleValue = pieces(predicting ? lab.cursor : lab.d);
  const tickStep = (rail.x1 - rail.x0) / Math.max(1, rail.max - 1) >= 4 ? 1 : 5;
  const girlH = Math.min(trayBottom + 6 - 8, compact ? 120 : wide ? 196 : 168);
  const girlCx = W - padX - girlW / 2;
  const girlFoot = trayBottom + 6;

  return (
    <StageFrame className="shrink-0 overflow-hidden" style={{ width: W, height: H }} data-fk-scene data-bands={lay.B}>
      <svg width={W} height={H} className="absolute inset-0" style={{ direction: 'ltr' }} role="img"
        aria-label={k(`sceneAria.${world}`, { p: st.p, q: st.q, d: lab.d, count: countText })}>
        <defs>
          <linearGradient id={`fk-cake-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F8D06B" /><stop offset="0.55" stopColor="#E9A93C" /><stop offset="1" stopColor="#C9832A" />
          </linearGradient>
          <linearGradient id={`fk-box-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7DE3D2" /><stop offset="1" stopColor="#2BB5A0" />
          </linearGradient>
          <linearGradient id={`fk-rim-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F3DDB0" /><stop offset="0.5" stopColor="#D6A866" /><stop offset="1" stopColor="#A87436" />
          </linearGradient>
          <linearGradient id={`fk-sheen-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.38" /><stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <pattern id={`fk-grid-${uid}`} width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M12 0 H0 V12" fill="none" stroke="#C7D7FE" strokeWidth="0.8" />
          </pattern>
          <pattern id={`fk-h2-${uid}`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="7" stroke={FIG_TONE[2].line} strokeWidth="2" />
          </pattern>
          <pattern id={`fk-h3-${uid}`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <line x1="0" y1="0" x2="0" y2="7" stroke={FIG_TONE[3].line} strokeWidth="2" />
          </pattern>
          <pattern id={`fk-over-${uid}`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="5" stroke="#E11D48" strokeWidth="1.6" />
          </pattern>
        </defs>

        {/* le décor : la nappe et le plateau de cuivre (مبتدئ) ; la feuille quadrillée (متقدم) */}
        {tray ? (
          <g aria-hidden="true">
            <rect x={0} y={trayBottom - 4} width={W} height={H - trayBottom + 4} fill="#EEF0FF" />
            <path d={`M0 ${trayBottom - 4} H${W}`} stroke="#DCE0FF" strokeWidth={2} />
            <ellipse cx={X(cakeW / 2)} cy={trayBottom + 5} rx={cakeW / 2 + rim + 6} ry={6} fill="#1E1B4B" opacity={0.1} />
            <rect x={cakeX0 - rim - 7} y={cakeY0 + (bandY(lay.B - 1) + bandH - cakeY0) / 2 - 9} width={10} height={18} rx={5} fill={`url(#fk-rim-${uid})`} stroke="#9A6A2F" strokeWidth={1} />
            <rect x={cakeX0 + cakeW + rim - 3} y={cakeY0 + (bandY(lay.B - 1) + bandH - cakeY0) / 2 - 9} width={10} height={18} rx={5} fill={`url(#fk-rim-${uid})`} stroke="#9A6A2F" strokeWidth={1} />
            <rect x={cakeX0 - rim} y={cakeY0 - rim} width={cakeW + rim * 2} height={trayBottom - cakeY0 + rim} rx={rim + 4} fill={`url(#fk-rim-${uid})`} stroke="#9A6A2F" strokeWidth={1.2} />
            <rect x={cakeX0 - rim + 3} y={cakeY0 - rim + 2} width={cakeW + rim * 2 - 6} height={3} rx={1.5} fill="#FFF7E6" opacity={0.7} />
          </g>
        ) : (
          <g aria-hidden="true">
            <rect x={6} y={8} width={W - 12} height={trayBottom + 8 - 8} rx={8} fill="#FFFFFF" stroke="#DCE0FF" />
            <rect x={6} y={8} width={W - 12} height={trayBottom + 8 - 8} rx={8} fill={`url(#fk-grid-${uid})`} />
          </g>
        )}

        {/* les bandes du tout (le gâteau doré / le papier) */}
        {Array.from({ length: lay.B }, (_, b) => (
          <rect key={`band-${b}`} x={X(0)} y={bandY(b)} width={cakeW} height={bandH} rx={tray ? 5 : 2}
            fill={tray ? `url(#fk-cake-${uid})` : '#FFFFFF'} fillOpacity={tray ? 1 : 0.6} stroke={tray ? '#B7761F' : '#334155'} strokeWidth={tray ? 1 : 1.6} />
        ))}

        {/* la part : chaque morceau DEDANS prend la couleur de la boîte ; le morceau à cheval seulement jusqu'au bord */}
        {lay.pieces.map((pc) => (
          <g key={`p-${lab.d}-${pc.i}`} data-fk-piece={pc.i} data-in={pc.in} className={pc.in === 'part' && straddle ? 'fk-shake' : undefined}>
            {pc.segs.map((sg, j) => {
              const y = bandY(sg.band);
              const sx = X(sg.x0);
              const sw = sg.x1 - sg.x0;
              const inShare = pc.in === 'full'
                ? [sg.x0, sg.x1]
                : pc.in === 'part' && sg.band <= lay.edge.band
                  ? (sg.band < lay.edge.band ? [sg.x0, sg.x1] : [Math.max(sg.x0, lay.edge.x), sg.x1])
                  : null;
              return (
                <g key={j}>
                  {inShare && inShare[1] - inShare[0] > 0.01 && (
                    <rect x={X(inShare[0])} y={y} width={inShare[1] - inShare[0]} height={bandH} fill={shareFill} opacity={tray ? 0.82 : 1} />
                  )}
                  {tray && sw >= 11 && j === mainSeg(pc) && (
                    <g aria-hidden="true">
                      <ellipse cx={sx + sw / 2} cy={y + bandH / 2} rx={Math.min(sw * 0.24, 8)} ry={Math.min(sw * 0.15, 5)} fill="#FFF3D6" stroke="#B9874A" strokeWidth={0.8}
                        transform={`rotate(-18 ${sx + sw / 2} ${y + bandH / 2})`} />
                      <path d={`M${sx + sw / 2 - Math.min(sw * 0.14, 4.5)} ${y + bandH / 2 + 0.5} Q${sx + sw / 2} ${y + bandH / 2 - 1.5} ${sx + sw / 2 + Math.min(sw * 0.14, 4.5)} ${y + bandH / 2 - 1.5}`} fill="none" stroke="#D9B47A" strokeWidth={0.7} />
                    </g>
                  )}
                  {pc.in === 'part' && straddle && (
                    <rect x={sx + 1} y={y + 1} width={Math.max(0, sw - 2)} height={bandH - 2} rx={3} fill="none" stroke="#E11D48" strokeWidth={2.2} strokeDasharray="5 3" />
                  )}
                </g>
              );
            })}
          </g>
        ))}

        {/* le sirop qui brille (مبتدئ) */}
        {tray && Array.from({ length: lay.B }, (_, b) => (
          <rect key={`sh-${b}`} x={X(0)} y={bandY(b)} width={cakeW} height={bandH} rx={5} fill={`url(#fk-sheen-${uid})`} pointerEvents="none" aria-hidden="true" />
        ))}

        {/* متقدم : les rectangles 2 et 3 du manuel, SUPERPOSÉS à la part (ils coïncident) */}
        {!tray && [2, 3].map((n) => figDone(n) && shareRects.map((r) => (
          <rect key={`h${n}-${r.b}`} x={X(r.x0)} y={bandY(r.b)} width={r.x1 - r.x0} height={bandH} fill={`url(#fk-h${n}-${uid})`} opacity={0.55} data-fk-figure-area={n} />
        )))}

        {/* les coupes du couteau */}
        {Array.from({ length: lab.d - 1 }, (_, j) => {
          const c = lay.endAt(j + 1, lab.d);
          const y = bandY(c.band);
          return (
            <g key={`c-${lab.d}-${j}`} className="fk-cut" aria-hidden="true">
              <line x1={X(c.x)} x2={X(c.x)} y1={y + 1} y2={y + bandH - 1} stroke={tray ? '#7A4A12' : '#334155'} strokeWidth={tray ? 1.4 : 1.2} />
              {tray && <line x1={X(c.x) + 1} x2={X(c.x) + 1} y1={y + 2} y2={y + bandH - 2} stroke="#FFE7B0" strokeWidth={0.6} opacity={0.8} />}
            </g>
          );
        })}

        {/* la colle (seconde part, après une coupe lisible plus grossière) : les anciens morceaux et leurs crochets */}
        {glue && (
          <g data-fk-glue={glue.k}>
            {(() => {
              const old = L.trayLayout({ p: st.p, q: st.q, d: st.start, bands: lay.B, width: cakeW });
              return Array.from({ length: st.start - 1 }, (_, j) => {
                const c = old.endAt(j + 1, st.start);
                const y = bandY(c.band);
                return <line key={`o-${j}`} x1={X(c.x)} x2={X(c.x)} y1={y + bandH * 0.3} y2={y + bandH * 0.7} stroke="#475569" strokeWidth={0.8} strokeDasharray="2 2" opacity={0.75} />;
              });
            })()}
            {lay.pieces.map((pc) => pc.segs.map((sg, j) => {
              const y = bandY(sg.band) - 4;
              return <path key={`b-${pc.i}-${j}`} d={`M${X(sg.x0) + 2} ${y + 3} V${y} H${X(sg.x1) - 2} V${y + 3}`} fill="none" stroke="#4338CA" strokeWidth={1.4} />;
            }))}
          </g>
        )}

        {/* seconde part ramenée au rectangle 1 : le rectangle 1 posé dessus, ils coïncident */}
        {same && shareRects.map((r) => (
          <rect key={`same-${r.b}`} x={X(r.x0)} y={bandY(r.b)} width={r.x1 - r.x0} height={bandH} fill="none" stroke={FIG_TONE[1].line} strokeWidth={3} strokeDasharray="7 4" data-fk-coincide />
        ))}

        {/* les fantômes d'Amine (à d = b) : ses a morceaux, le dernier DÉBORDE le ruban */}
        {ghosts && (
          <g data-fk-ghost={ghosts.a}>
            {Array.from({ length: ghosts.a }, (_, i) => {
              const pc = lay.pieces[i];
              if (!pc) return null;
              return pc.segs.map((sg, j) => (
                <g key={`g-${i}-${j}`}>
                  <rect x={X(sg.x0) + 2} y={bandY(sg.band) + 3} width={Math.max(0, sg.x1 - sg.x0 - 4)} height={bandH - 6} rx={4}
                    fill={pc.in === 'out' || pc.in === 'part' ? `url(#fk-over-${uid})` : 'none'} fillOpacity={0.5}
                    stroke="#BE123C" strokeWidth={1.8} strokeDasharray="4 3" />
                  {j === mainSeg(pc) && <text x={X((sg.x0 + sg.x1) / 2)} y={bandY(sg.band) + bandH - 7} textAnchor="middle" fontSize={11} fontWeight={900} fill="#9F1239" fontFamily="ui-monospace, monospace">{i + 1}</text>}
                </g>
              ));
            })}
          </g>
        )}

        {/* le bord de la part : le ruban de grand-mère (مبتدئ) ; le trait du manuel (متقدم) — il ne bouge JAMAIS */}
        <g data-fk-edge={`${st.p}/${st.q}`}>
          {tray ? (
            <>
              <rect x={edgeX - 3.5} y={edgeY - rim - 3} width={7} height={bandH + rim * 2 + 6} rx={2} fill="#DC2626" stroke="#991B1B" strokeWidth={0.8} />
              <rect x={edgeX - 1} y={edgeY - rim - 3} width={2} height={bandH + rim * 2 + 6} fill="#FCA5A5" opacity={0.8} />
              <g transform={`translate(${edgeX} ${edgeY - rim - 4})`}>
                <path d="M0 0 C-12 -10 -16 2 -3 1 Z" fill="#EF4444" stroke="#991B1B" strokeWidth={0.8} />
                <path d="M0 0 C12 -10 16 2 3 1 Z" fill="#EF4444" stroke="#991B1B" strokeWidth={0.8} />
                <path d="M-2 1 L-7 11 M2 1 L7 11" stroke="#DC2626" strokeWidth={2.4} strokeLinecap="round" />
                <circle r={2.6} fill="#B91C1C" />
              </g>
            </>
          ) : (
            <line x1={edgeX} x2={edgeX} y1={edgeY - 6} y2={edgeY + bandH + 6} stroke="#0F172A" strokeWidth={3} strokeLinecap="round" />
          )}
        </g>

        {/* la fillette (مبتدئ) : elle tient la boîte des voisins et réagit */}
        {tray && (
          <g data-fk-girl data-mood={mood}>
            <KidFigure cx={girlCx} top={girlFoot - girlH} foot={girlFoot} hairStyle="hijab" scarf="lavender" outfit="teal" skin="wheat" mood={mood} />
            <g transform={`translate(${girlCx} ${girlFoot - girlH * 0.5})`} aria-hidden="true">
              <rect x={-girlW * 0.3} y={-girlH * 0.06} width={girlW * 0.6} height={girlH * 0.16} rx={3} fill={`url(#fk-box-${uid})`} stroke="#0F766E" strokeWidth={1} />
              <rect x={-girlW * 0.33} y={-girlH * 0.09} width={girlW * 0.66} height={girlH * 0.045} rx={2} fill="#5EEAD4" stroke="#0F766E" strokeWidth={0.8} />
              <rect x={-1.5} y={-girlH * 0.09} width={3} height={girlH * 0.19} fill="#FDE68A" />
            </g>
          </g>
        )}

        {/* le rail du couteau : des crans sans nombres (aucune valeur lisible n'est annoncée) */}
        <g aria-hidden="true">
          <rect x={rail.x0 - 8} y={railY - 5} width={rail.x1 - rail.x0 + 16} height={10} rx={5} fill="#FFFFFF" stroke="#C7D2FE" />
          {Array.from({ length: rail.max }, (_, i) => i + 1).filter((d) => d === 1 || d === rail.max || d % tickStep === 0).map((d) => (
            <line key={d} x1={L.railX(d, rail)} x2={L.railX(d, rail)} y1={railY - 3} y2={railY + 3} stroke="#A5B4FC" strokeWidth={1} />
          ))}
        </g>
        {/* les épingles (متقدم) : plantées, puis jugées par le couteau quand il passe */}
        {lab.stage === 1 && lab.pins.map((p) => {
          const px = L.railX(p.d, rail);
          const tone = p.state === 'readable' ? '#059669' : p.state === 'straddle' ? '#E11D48' : '#4F46E5';
          return (
            <g key={p.d} data-fk-pin={p.d} data-state={p.state}>
              <path d={`M${px} ${railY - 2} L${px - 5} ${railY - 13} A6 6 0 1 1 ${px + 5} ${railY - 13} Z`} fill={tone} stroke="#FFFFFF" strokeWidth={1.2} />
              {p.state === 'planted' && <circle cx={px} cy={railY - 16} r={2.2} fill="#FFFFFF" />}
              {p.state !== 'planted' && (
                <text x={px} y={railY - 13.2} textAnchor="middle" fontSize={8} fontWeight={900} fill="#FFFFFF">{p.state === 'readable' ? '✓' : '×'}</text>
              )}
            </g>
          );
        })}
      </svg>

      {/* la pilule du compte (vivante) et la colle, en HTML au-dessus du tout, du côté où la part commence */}
      <div className="pointer-events-none absolute inset-x-2 top-1.5 flex flex-wrap items-center justify-start gap-1.5" style={{ paddingInlineStart: Math.max(0, girlW - 6) }}>
        <span data-fk-count={live.readable ? live.writing : 'straddle'}
          className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border-2 px-2.5 py-0.5 font-black shadow-sm ${compact ? 'text-xs' : 'text-sm'} ${live.readable ? 'border-teal-300 bg-teal-50 text-teal-900' : 'border-rose-300 bg-rose-50 text-rose-900'}`}>
          {countText}
        </span>
        {glue && (
          <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border-2 border-indigo-200 bg-white px-2 py-0.5 font-black text-indigo-900 ${compact ? 'text-[11px]' : 'text-xs'}`}>
            {k('glue', { piecesK: pieces(glue.k) })}
          </span>
        )}
        {ghosts && !compact && (
          <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border-2 border-dashed border-rose-400 bg-white px-2 py-0.5 font-black text-rose-800 ${compact ? 'text-[11px]' : 'text-xs'}`}>
            {k('claim.ghost', { pieces: pieces(ghosts.a) })}
          </span>
        )}
      </div>

      {/* le rail est la PISTE : le toucher pose le couteau ; la poignée est le couteau */}
      <div {...knife.trackProps} className="absolute inset-x-0" style={{ ...knife.trackProps.style, top: railY - 26, height: 52 }}>
        <div {...knife.handleProps({ label: handleLabel, valueText: handleValue })}
          {...(predicting ? { 'data-fk-pin-cursor': lab.cursor } : { 'data-fk-knife': lab.d })}
          onKeyDown={(e) => {
            if (predicting && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onPlant(); return; }
            knife.handleProps().onKeyDown(e);
          }}
          className="group absolute flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full outline-none"
          style={{ left: knifeX, top: 2, cursor: knife.dragging ? 'grabbing' : 'grab' }}>
          <span className={`flex h-11 w-11 items-center justify-center rounded-full border-[3px] bg-white shadow-[0_6px_16px_-6px_rgba(79,70,229,0.9)] transition-transform group-focus-visible:ring-4 group-focus-visible:ring-indigo-300 motion-reduce:transition-none ${predicting ? 'border-amber-500' : 'border-indigo-500'} ${knife.dragging ? '-translate-y-1 scale-110' : ''}`}>
            {predicting ? <MapPin className="h-5 w-5 text-amber-600" strokeWidth={2.6} aria-hidden="true" />
              : tray ? <KnifeIcon />
                : <PencilLine className="h-5 w-5 text-indigo-600" strokeWidth={2.6} aria-hidden="true" />}
          </span>
          {!wide && (
            <span className={`absolute -top-5 rounded-full px-1.5 text-xs font-black tabular-nums text-white ${predicting ? 'bg-amber-500' : 'bg-indigo-600'}`} aria-hidden="true">
              <bdi dir="ltr">{predicting ? lab.cursor : lab.d}</bdi>
            </span>
          )}
        </div>
      </div>
      {railButtons}
    </StageFrame>
  );
}

/** Le segment qui porte le milieu d'un morceau (un morceau coupé par une fin de bande n'a qu'UNE amande, qu'UN numéro). */
function mainSeg(pc) {
  if (pc.segs.length < 2) return 0;
  let best = 0;
  pc.segs.forEach((sg, j) => { if (sg.x1 - sg.x0 > pc.segs[best].x1 - pc.segs[best].x0) best = j; });
  return best;
}

/** Le couteau dessiné de la poignée : un manche de bois riveté, une mitre, une lame d'acier qui pointe vers le haut. */
function KnifeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <g transform="rotate(-45 14 14)">
        <rect x="1.5" y="12" width="9.5" height="5" rx="2.3" fill="#B45309" stroke="#78350F" strokeWidth="0.8" />
        <circle cx="4.4" cy="14.5" r="0.75" fill="#FDE68A" />
        <circle cx="8.2" cy="14.5" r="0.75" fill="#FDE68A" />
        <rect x="10.6" y="11.4" width="1.8" height="6.2" rx="0.7" fill="#94A3B8" />
        <path d="M12.3 12 H23 Q26.6 12.5 26.2 14.1 L12.3 17.1 Z" fill="#E2E8F0" stroke="#475569" strokeWidth="0.9" strokeLinejoin="round" />
        <path d="M13.4 13.1 H22.4" stroke="#FFFFFF" strokeWidth="0.9" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** Le but d'une part : مبتدئ — la découverte prête ; متقدم — la part 1 : les cibles tamponnées ; la part 2 : la découverte prête. */
export function stageDone(lab, i) {
  if (lab.world === 'paper' && lab.stages.length > 1) return i === 0 ? L.allTargetsDone(lab) : L.discoveryReady(lab);
  return L.discoveryReady(lab);
}

/** Les suites de chaque part ; `decimal` seulement si la part s'écrit en dixièmes ; `rule` clôt la dernière part. */
export function chainsOf(lab) {
  const s0 = lab.stages[0];
  const dec = L.readCut(s0.p, s0.q, 10).readable ? ['decimal'] : [];
  if (lab.world === 'paper' && lab.stages.length > 1) return { 0: ['times', ...dec], 1: ['glue', 'divisor', 'rule'] };
  return { 0: ['times', ...(lab.claim ? ['claim'] : []), ...dec, 'rule'] };
}

const iso = (s) => `⁦${s}⁩`;
const C = (k, key, o) => k(`cp.${key}`, o);
const pick = (list, right, whys) => list.map((text, i) => (i === right ? { text, correct: true } : { text, why: whys[i] }));
const fr = (a, b) => iso(`${a}/${b}`);

export const QUESTIONS = {
  times: (lab, k) => {
    const s0 = lab.stages[0];
    const base = L.readCut(s0.p, s0.q, s0.start);
    const m = L.multiplyLines(lab)[0] ?? { k: 2, a: base.a, d: s0.start, a2: base.a * 2, d2: s0.start * 2 };
    const o = { from: fr(m.a, m.d), to: fr(m.a2, m.d2), k: iso(m.k), d: iso(m.d), d2: iso(m.d2), a: iso(m.a), a2: iso(m.a2) };
    return {
      id: 'times', kind: 'number', expected: String(m.k), answer: <bdi dir="ltr">{m.k}</bdi>,
      prompt: C(k, 'times.prompt', o), hints: [C(k, 'times.hint1', o), C(k, 'times.hint2', o)], explain: C(k, 'times.explain', o),
    };
  },
  claim: (lab, k) => {
    const s0 = lab.stages[0];
    const c = lab.claim;
    const v = L.judgeClaim(s0.p, s0.q, [c.a, c.b]);
    const o = { share: fr(s0.p, s0.q), claim: fr(c.a, c.b), x: iso(L.decimalText(v.cut.inShare)), a: iso(c.a), b: iso(c.b), p: iso(s0.p), q: iso(s0.q) };
    return {
      id: 'claim', kind: 'choice', prompt: C(k, 'claim.prompt', o),
      options: pick([C(k, 'claim.add', o), C(k, 'claim.big', o), C(k, 'claim.same', o)], 0, [null, C(k, 'claim.whyBig', o), C(k, 'claim.whySame', o)]),
      hints: [C(k, 'claim.hint1', o), C(k, 'claim.hint2', o)], explain: C(k, 'claim.explain', o),
    };
  },
  decimal: (lab, k) => {
    const s0 = lab.stages[0];
    const c = L.readCut(s0.p, s0.q, 10);
    const o = { share: fr(s0.p, s0.q), ten: fr(c.a, 10), dec: iso(c.decimal), a: iso(c.a) };
    const glued = `${c.a},10`;
    const hundredth = `0,0${c.a}`;
    return {
      id: 'decimal', kind: 'choice', cols: 3, prompt: C(k, 'decimal.prompt', o),
      options: pick([iso(c.decimal), iso(glued), iso(hundredth)], 0, [null, C(k, 'decimal.whyGlued', { ...o, glued: iso(glued) }), C(k, 'decimal.whyHundredth', { ...o, h: iso(hundredth) })]),
      hints: [C(k, 'decimal.hint1', o), C(k, 'decimal.hint2', o)], explain: C(k, 'decimal.explain', o),
    };
  },
  glue: (lab, k) => {
    const g = L.totalGlue(lab);
    const s1 = lab.stages[1];
    const o = { from: fr(s1.p, s1.q), to: fr(g.a2, g.d2), k: iso(g.k), calc: iso(`${s1.p} ÷ ${g.k} = ${g.a2} ; ${s1.q} ÷ ${g.k} = ${g.d2}`) };
    return {
      id: 'glue', kind: 'number', expected: String(g.k), answer: <bdi dir="ltr">{g.k}</bdi>,
      prompt: C(k, 'glue.prompt', o), hints: [C(k, 'glue.hint1', o), C(k, 'glue.hint2', o)], explain: C(k, 'glue.explain', o),
    };
  },
  divisor: (lab, k) => {
    const s1 = lab.stages[1];
    const dv = L.refusedDivisor(lab) ?? s1.start;
    const kk = s1.start / dv;
    const o = { dv: iso(dv), q: iso(s1.q), p: iso(s1.p), k: iso(kk), x: iso(L.decimalText(L.product(s1.p, s1.q, dv))) };
    return {
      id: 'divisor', kind: 'choice', prompt: C(k, 'divisor.prompt', o),
      options: pick([C(k, 'divisor.right', o), C(k, 'divisor.notDiv', o), C(k, 'divisor.big', o)], 0, [null, C(k, 'divisor.whyNotDiv', o), C(k, 'divisor.whyBig', o)]),
      hints: [C(k, 'divisor.hint1', o), C(k, 'divisor.hint2', o)], explain: C(k, 'divisor.explain', o),
    };
  },
  rule: (lab, k) => {
    const paper = lab.world === 'paper' && lab.stages.length > 1;
    let options;
    let args = {};
    if (paper) {
      const s1 = lab.stages[1];
      const dv = L.refusedDivisor(lab) ?? 9;
      const kk = s1.start / dv;
      const den = L.readablePeriod(s1.p, s1.q);
      const r = L.readCut(s1.p, s1.q, den);
      args = { p: s1.p, q: s1.q, a2: r.a, d2: r.d };
      options = [
        { text: k('discovery.anyDivisor'), why: k('discovery.whyAnyDivisor', { d: dv, k: kk, q: s1.start, p: s1.p, x: L.decimalText(L.product(s1.p, s1.q, dv)) }) },
        { text: k('discovery.denOnly'), why: k('discovery.whyDenOnly', { p: s1.p, d: den, x: L.decimalText(L.shareValue(s1.p, den)) }) },
        { text: k('discovery.rightPaper', { k: s1.start / den }), correct: true },
      ];
    } else {
      const s0 = lab.stages[0];
      const c = lab.claim ?? { a: s0.p + 1, b: s0.q + 1 };
      const cv = L.judgeClaim(s0.p, s0.q, [c.a, c.b]);
      const dd = L.firstUnreadable(lab) ?? (s0.start + 2);
      const rc = L.readCut(s0.p, s0.q, dd);
      const pieces = (n) => k('pieces', { count: n });
      options = [
        { text: k('discovery.add'), why: k('discovery.whyAdd', { a: c.a, b: c.b, x: L.decimalText(cv.cut.inShare), piecesB: pieces(c.b) }) },
        { text: k('discovery.rightTray'), correct: true },
        { text: k('discovery.bigger'), why: k('discovery.whyBigger', { piecesD: pieces(dd), reading: rc.whole === 0 ? k('count.partOnly') : k('count.straddle', { pieces: pieces(rc.whole) }) }) },
      ];
    }
    return {
      id: 'rule', kind: 'choice', prompt: k(`discovery.prompt.${lab.world}`, args), options,
      hints: [C(k, `rule.${lab.world}.hint1`), C(k, `rule.${lab.world}.hint2`)],
      explain: <p>{k(`formal.rule.${lab.world}`)}</p>,
    };
  },
};
