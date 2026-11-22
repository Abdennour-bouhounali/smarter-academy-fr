import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, ChevronsLeftRight, Flower2, Undo2, Ribbon, Hand, CheckCircle2, XCircle } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import { divmod } from '@smarter-academy/core/arithmetic/divisibility.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import LabFold from '../primitives/LabFold';
import DivisionRoles from '../primitives/DivisionRoles';
import { LabCard, StageFrame, PromptCard, StepperCard, RoundButton, VerdictBanner } from '../primitives/LabKit';
import { SvgPill, pillWidth } from '../primitives/SvgPill';
import { FlowerFigure, BouquetSleeve, BouquetTie, hueOf } from '../primitives/FlowerFigure';
import HopperFigure from '../primitives/HopperFigure';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { LEVELS } from '../levels';
import * as L from '../logic/divisionJumps';

/**
 * division-jumps — LA DIVISION EUCLIDIENNE TIRÉE À LA MAIN (1AM, unité 3 « الضرب والقسمة », درس « القسمة
 * الإقليدية », manuel نشاط 3 p. 37 et معارف 2 p. 41). La logique, entière et exacte, est dans
 * `logic/divisionJumps.js` (divmod du core, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. b est DONNÉ (6 fleurs par bouquet, des sauts de 14) ; l'élève TIENT q, le nombre de groupes. مبتدئ
 *    (`world: 'flowers'`, thème `garden`) : il TIRE le bout d'un RUBAN le long des rangs de fleurs dessinées
 *    (glisser sur les fleurs, flèches ±1 — en RTL ← agrandit —, boutons ronds −/+, toucher une fleur) ; chaque pas
 *    noue les 6 fleurs suivantes en un bouquet. متقدم (`world: 'line'`, 279 ÷ 14) : il TIRE un lapin qui saute
 *    de 14 en 14 sur une droite graduée (le point d'arrivée 14 × q avance ; flèches, −/+, toucher la droite).
 * B. Le quotient est le PLUS GRAND nombre de groupes de b dans a : on s'arrête quand ce qui reste est plus
 *    PETIT que b — pas quand il ne reste rien. a = b × q + r avec r < b ; b × q ≤ a < b × (q + 1).
 * C. Pendant le geste les bouquets se nouent (les tiges se resserrent dans un cornet de papier, un nœud de ruban,
 *    une pilule « 6 » au-dessus) ou le lapin saute d'arc en arc ; au relâchement : `over` — le dernier cornet
 *    rose pointillé, les fleurs qui manquent en fantômes roses, sa pilule « 5 » ; sur la droite le lapin tombe
 *    dans la mare qui commence après 279 ; `short` — un cornet fantôme indigo sur 6 des fleurs restantes / un saut
 *    fantôme vert ; `exact` — le reste entouré avec sa pilule, « لا تكفي الأزهار الباقية (5) لباقة أخرى من 6 »,
 *    l'écart 279 − 266 = 13 en segment rose + le حصر.
 * D. `47 = 6 × 7 + 5` et `5 < 6`, les quatre noms (المقسوم a, المقسوم عليه b, الحاصل q, الباقي r) ; en
 *    متقدم le حصر `14 × 19 ≤ 279 < 14 × 20`.
 * E. Avant la règle : un groupe de TROP (over), un groupe de MOINS (short) ET l'arrêt exact, relâchés par
 *    l'élève sur le nombre de la leçon. Les conjectures fausses (« quand il ne reste rien », « quand on a
 *    10 bouquets ») sont réfutées avec SES nombres (47 : 5 restent et aucun bouquet n'est possible).
 *    Le second nombre (47 → 48, la carte « زهرة جديدة! ») vient après, en transfert : il ne compte PAS dans
 *    `discoveryReady` (choix de l'auteur du lab, brief unité 3).
 *
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 1, 2026-10-28) : `checkpoints` (défaut true). Étape 1 —
 * le nombre de la leçon, atteinte quand l'arrêt exact ET le contraste (un de trop, un de moins) sont faits : le quotient, le reste, (متقدم)
 * le حصر, puis LA RÈGLE (l'ancienne découverte, qui formalise). Étape 2 (مبتدئ, 47 → 48) : le nouveau reste et pourquoi un bouquet de plus
 * (`chainOf`, `QUESTIONS`, sur SES nombres). Obligatoires pour tout élève ; l'enseignant seul les coupe pour SON compte. Questions actives →
 * `guided`. ÉTAPES : `LabStepper` (`[data-dj-step=<i>]`) quand il y a deux nombres, fête par étape ; « إعادة » repart de zéro ; « أعِد
 * التجربة » remet LE MÊME nombre (`L.retryStep`). SON : `tooth` à chaque bouquet noué / saut (plus grave en arrière), `flag` à l'arrêt exact,
 * `over` pour un groupe de trop.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        le quotient euclidien = le plus grand nombre de groupes complets ; r < b
 *   OBJECT         un ruban le long des rangs de fleurs (مبتدئ) ; un lapin qui saute sur une droite (متقدم)
 *   VARIABLE       q, le nombre de groupes (0 … qMax : le quotient + un groupe entamé + deux de trop)
 *   INVARIANT      a et b ; tous les groupes ont b objets ; le tout = b × q + ce qui reste
 *   TRANSFORMATION les bouquets se nouent / les sauts avancent ; le reste rétrécit de b à chaque pas
 *   CONSTRAINT     un bouquet a b fleurs ou n'existe pas ; un saut a la longueur b
 *   RESISTANCE     over : des fleurs fantômes (elles n'existent pas) / un saut qui tombe dans la mare après a ;
 *                  short : un bouquet fantôme qui tient encore dans le reste / un saut fantôme
 *   EVIDENCE       le reste visible (entouré + pilule / segment rose), comparé à un bouquet ou à un saut
 *   CONTRAST       un de trop ET un de moins autour de l'arrêt ; puis 48 : une fleur de plus ferme un bouquet
 *   PREDICTION     sur la droite, les multiples ne sont PAS écrits avant qu'un saut y arrive : l'élève estime
 *                  14 × 10 = 140, 14 × 20 = 280 ; les marques du manuel « 10؟ 20؟ » sont à visiter
 *   DISCOVERY      « نتوقّف عندما يصبح الباقي أصغر من عدد الأزهار في الباقة »
 *   FORMALIZATION  a = b × q + r avec r < b ; les quatre noms ; le حصر
 *   TRANSFER       253 ÷ 17 (معارف 2, `levels={false}`), 48 ÷ 6, les مسائل et la banque
 *
 * « جرّب كل الإمكانيات » (§6bis) : NON — chaque q relâché EST la réponse de l'élève ; balayer donnerait le
 * quotient. Pas d'auto-complétion (le registre n'en déclare pas). Ce n'est ni le team-builder (b n'est pas
 * choisi, on ne porte aucun objet) ni l'étagère (la main tient q, pas b) : DNA §12.
 *
 * LE KIT (2026-10-14, §8ter) : la carte de consigne `PromptCard` (§17.9 : le contexte et ses nombres, la question qui nomme l'état final et
 * sa lampe — allumée à l'arrêt exact —, les pilules de lecture vivante en `aside`) ; la scène dans un `StageFrame`
 * lavande (un auvent de fleuriste ; la mare après a sur la droite) ; large (≥ 600 px) : à côté des fleurs, la colonne
 * `StepperCard` (« عدد الباقات », la grande lecture q, les ronds −/+) + `VerdictBanner` ; sur la droite (qui veut
 * toute la largeur) une barre de commande SOUS la scène ; étroit : les ronds −/+ et la lecture sont DANS la scène
 * (une bande en bas) et le bandeau de verdict garde sa place (la consigne s'y lit avant le premier essai) pour que la
 * scène ne saute pas. Dessins : `primitives/FlowerFigure.jsx` (fleur, cornet, nœud) et `primitives/HopperFigure.jsx`
 * (le lapin) ; la géométrie du cornet est `logic › bouquetShape` (testée).
 *
 * D'UN SEUL REGARD (§8bis) : `[data-dj-glance]` enveloppe la consigne, la scène, les commandes, le verdict, la carte
 * 48 et le حصر ; la hauteur de la scène de fleurs vient de l'écran de leçon (`useLessonViewport`) moins la consigne et
 * ce qui est sous la scène (mesurés, jamais la scène elle-même : pas de boucle), et les fleurs RÉTRÉCISSENT avec elle
 * (`flowerLayout` + `BOUQUET_ROWS`). La droite a une hauteur fixe. La liste des essais est dans un `LabFold` sous le bloc.
 *
 * Props (contrat fixé avec la leçon) : `a`, `b`, `world` ('flowers' | 'line'), `then` (facultatif ; par
 * défaut, en `flowers`, le multiple suivant de b — 48 pour 47 ÷ 6), `level`, `levels` (false : l'exemple
 * travaillé de معارف), `title`, `lead`, `onTrial({ a, b, q, r, kind: 'over' | 'short' | 'exact', ok })` à
 * chaque essai VALIDÉ (r = null pour `over`), `onFinished({ a, b })` à la règle — tous par `state.report`.
 *
 * ONBOARDING (prop `coach`, défaut true — `LabCoach`, §8quater) : `logic/divisionJumps.js › coachOf` montre la poignée à tirer, puis
 * les boutons −/+ tant que le contraste n'est pas vu, puis la carte 48 ; jamais une taille de saut ni un nombre de groupes.
 *
 * CONTRAT DOM : [data-division-jumps][data-world][data-a][data-b][data-q][data-solved][data-layout], [data-dj-glance],
 * [data-dj-prompt][data-lit], [data-dj-scene], [data-dj-handle] (role=slider), [data-dj-less], [data-dj-more] (une
 * seule paire rendue), [data-dj-reading] / [data-dj-read=<clé>], [data-dj-count] (la grande lecture q),
 * [data-dj-group=<1..q>][data-dj-missing], [data-dj-flower=<i>], [data-dj-left=<r>], [data-dj-ghost] (flower | bouquet
 * | jump | past), [data-dj-verdict=<kind>], [data-dj-refused=<kind>], [data-dj-need], [data-dj-mark=<q>],
 * [data-dj-landing], [data-dj-hopper][data-mood], [data-dj-pond], [data-dj-target], [data-dj-bracket], [data-dj-next]
 * (47 → 48), [data-dj-back], [data-dj-formal], [data-lab-fold=division-jumps.trials].
 */
const NS = 'manipulation.divisionJumps';
const iso = (x) => `\u2066${x}\u2069`;   // un nombre ou une égalité isolé(e) dans une phrase arabe (LRI … PDI)
const WIDE_MIN = 600;
const SIDE_W = 214;
const STRIP_H = 58;
const btn = 'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border-2 px-2 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-40';
/** Les animations servent le geste (un nœud qui se serre, un saut) et se taisent sous `prefers-reduced-motion`. */
const MOTION_CSS = '@keyframes dj-pop{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}'
  + '@keyframes dj-hop{0%{transform:translateY(0)}45%{transform:translateY(-16px)}100%{transform:translateY(0)}}'
  + '.dj-pop{transform-box:fill-box;transform-origin:50% 35%;animation:dj-pop .3s cubic-bezier(.34,1.56,.64,1) both}'
  + '.dj-hop{animation:dj-hop .3s ease-out both}'
  + '@media (prefers-reduced-motion: reduce){.dj-pop,.dj-hop{animation:none}}';

/**
 * Une formule : UN îlot LTR (`<bdi dir="ltr">` en flex LTR) dont les morceaux sont insécables ; à l'étroit elle
 * passe à la ligne entre deux morceaux, de gauche à droite, sans jamais se réordonner (QA 320 px : une formule
 * coupée au hasard dans un paragraphe RTL se lisait « 279 > 19 »).
 */
function Formula({ pieces, className = '', ...rest }) {
  return (
    <bdi dir="ltr" className={`inline-flex flex-wrap justify-center gap-x-1.5 font-mono ${className}`} {...rest}>
      {pieces.map((p, i) => <span key={i} className="whitespace-nowrap">{p}</span>)}
    </bdi>
  );
}

/** Le second nombre du contraste : celui de la leçon, sinon (fleurs) le multiple suivant de b. */
export function thenOf(world, a, b, then) {
  if (world !== 'flowers') return null;
  if (then != null) return then;
  const { q, r } = divmod(a, b);
  return r === 0 ? null : b * (q + 1);
}

/** Une pilule de lecture vivante (« خارج الباقات 29 ») : ce que la main a produit, jamais la réponse. */
function StatPill({ label, value, tone = 'indigo', small = false, ...rest }) {
  const tones = { indigo: 'border-indigo-100 bg-white text-indigo-900', rose: 'border-rose-200 bg-rose-50 text-rose-900', amber: 'border-amber-200 bg-amber-50 text-amber-900' };
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border font-bold ${small ? 'gap-1 px-2 text-[11px]' : 'gap-1.5 px-2.5 py-0.5 text-xs'} ${tones[tone] ?? tones.indigo}`} {...rest}>
      {label}
      <bdi dir="ltr" className={`font-mono font-black tabular-nums ${small ? 'text-sm' : 'text-base'}`}>{value}</bdi>
    </span>
  );
}

export default function DivisionJumps({
  a: a0, b: b0, world: world0, then: then0, title, lead, level, levels: withLevels = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished, coach: coachOn = true, checkpoints: cpOn = true,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const preset = LEVELS['division-jumps'][resolveLevelId(level ?? 'beginner')].numbers;
  const initialNumbers = useMemo(() => {
    const a = a0 ?? preset.a;
    const b = b0 ?? preset.b;
    const world = world0 ?? preset.world;
    const then = thenOf(world, a, b, then0 ?? (a === preset.a && b === preset.b ? preset.then : undefined));
    return then == null ? { a, b, world } : { a, b, world, then };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'division-jumps', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { a: na, b, world } = state.numbers;
  const nthen = thenOf(world, na, b, state.numbers.then);
  // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — les étapes, les essais et les questions du labo
  const sceneKey = `${na}|${b}|${world}|${nthen}|${state.epoch}|${state.resetCount}`;
  const [lab, setLab] = useState(() => L.init({ a: na, b, world, then: nthen }));
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  if (scene.key !== sceneKey) { setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(L.init({ a: na, b, world, then: nthen })); }

  const ready = L.discoveryReady(lab);
  // les questions pendant le labo : la suite du nombre affiché ; celle du nombre de la leçon finit par la règle
  const cpSettings = useLabCheckpointSettings('division-jumps');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpActive = cpOn && cpSettings.enabled;
  const onFirst = lab.a === lab.a0;
  const stepReached = onFirst ? ready : L.thenDone(lab);
  const chain = cpActive ? chainOf(lab) : null;
  const cp = useLabCheckpoint({
    id: chain ? `a${lab.a}` : null,
    questions: chain && stepReached ? chain.map((q) => QUESTIONS[q](lab, k)) : null,
    reached: stepReached,
    resetKey: scene.inits,
    onRetry: () => setLab(L.retryStep),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (id === `a${lab.a0}`) { state.discover(); state.formalize(); } },
  });
  useEffect(() => { if (ready && !cpActive) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son du geste (muet sans « الصوت ») : chaque bouquet noué / saut, l'arrêt exact, un groupe de trop
  const qSeen = useRef({ q: lab.q, at: 0 });
  useEffect(() => {
    const p = qSeen.current;
    const now = Date.now();
    if (lab.q !== p.q && now - p.at > 35) { playSfx('tooth', { pitch: lab.q > p.q ? 1 : 0.75 }); p.at = now; }
    p.q = lab.q;
  }, [lab.q]);
  const lastSeen = useRef(lab.last);
  useEffect(() => {
    const v = lab.last;
    if (v === lastSeen.current) return;
    lastSeen.current = v;
    if (!v) return;
    if (v.verdict.kind === 'exact') playSfx('flag');
    else if (v.verdict.kind === 'over') playSfx('over');
  }, [lab.last]);
  // les étapes : le nombre de la leçon, puis (s'il existe) le second ; FAITE quand l'étape est atteinte ET ses questions répondues
  const nSteps = lab.then != null ? 2 : 1;
  const curStep = onFirst ? 0 : 1;
  const stepDone = [ready && (curStep !== 0 || !cp.blocking), L.thenDone(lab) && (curStep !== 1 || !cp.blocking)].slice(0, nSteps);
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // « إعادة » : on refête
  const nowDone = stepDone[curStep];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(curStep)) return;
    celebrated.current.add(curStep);
    party.celebrate({ n: curStep + 1, total: nSteps });
  }, [nowDone, curStep]); // eslint-disable-line react-hooks/exhaustive-deps
  const labSteps = nSteps > 1 && <LabStepper count={nSteps} current={curStep} done={stepDone} stepAttr="data-dj-step" />;
  useEffect(() => { if (state.isFormal) state.report(onFinished, { a: lab.a0, b }); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'division-jumps', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });
  const nTrials = lab.trials.length;
  useEffect(() => { if (nTrials > 0) state.report(onTrial, L.trialEvidence(lab.trials.at(-1))); }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── les noms comptés (ARABIC_RTL_CONTRACT « Counting nouns ») ── */
  const flowers = (n) => k('flowers', { count: n });
  const groups = (n) => k(world === 'line' ? 'jumps' : 'bouquets', { count: n });

  /* ── mesure : largeur, écran de leçon, la consigne et ce qui est sous la scène (jamais la scène) ── */
  const boxRef = useRef(null);
  const promptRef = useRef(null);
  const belowRef = useRef(null);
  const [width, setWidth] = useState(320);
  const [around, setAround] = useState(260);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(200, Math.floor(el.clientWidth)));
      const h = (r) => (r.current ? Math.ceil(r.current.getBoundingClientRect().height) + 12 : 0);
      setAround(Math.max(100, h(promptRef) + h(belowRef)));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (promptRef.current) ro.observe(promptRef.current);
    if (belowRef.current) ro.observe(belowRef.current);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 640;
  const compact = width < 380;
  const wide = width >= WIDE_MIN;
  // − 48 : la barre collante du module (« 0 / 4 ») et une marge
  const flowerH = Math.round(Math.max(212, Math.min(460, screenH - around - 48)));

  /* ── la géométrie de la scène et LE geste (un seul : la piste, la poignée, −/+) ── */
  const sideFlowers = wide && world === 'flowers';
  const W = Math.min(sideFlowers ? width - SIDE_W - 12 : width, 900);
  const strip = !wide; // étroit : les ronds −/+ et la lecture vivent DANS la scène
  const awning = compact ? 12 : 18;
  const padTop = awning + 8;
  const padBottom = strip ? STRIP_H + 2 : 10;
  const padX = 8;
  const padStart = 46; // à droite (le début du rang, en RTL) : la place de la poignée à q = 0
  const slots = b * lab.qMax;
  const fLay = useMemo(() => (world === 'flowers'
    ? L.flowerLayout({ slots, b, width: W - padX - padStart, maxHeight: flowerH - padTop - padBottom, maxSize: 46, ...L.BOUQUET_ROWS })
    : null), [world, slots, b, W, flowerH, padTop, padBottom]);
  // la scène épouse son contenu (aucune bande vide) ; les fleurs sont centrées si la colonne d'à côté est plus haute
  const stageH = fLay ? Math.ceil(fLay.height + padTop + padBottom + 6) : 0;
  const offY = padTop + 2;
  const lineTop = compact ? 98 : 104;
  const lineH = lineTop + 74; // les marques « 10 قفزات؟ » (Y + 59) et leurs lettres sous la ligne tiennent dans la scène
  const lLay = useMemo(() => (world === 'line' ? L.lineLayout({ a: lab.a, b, qMax: lab.qMax, width: W, pad: 26 }) : null), [world, lab.a, b, lab.qMax, W]);
  const toValue = useCallback((cx, cy, rect) => (lLay
    ? lLay.valueAt(cx - rect.left) / b
    : fLay.posAt(cx - rect.left - padX, cy - rect.top - offY) / b), [fLay, lLay, b, offY]);
  const st = useStretchInteraction({
    value: lab.q, range: { min: 0, max: lab.qMax }, toValue, direction: world === 'line' ? 'ltr' : 'rtl', pageStep: 5,
    onChange: (q) => setLab((s) => L.setQ(s, q)),
    onCommit: (q) => setLab((s) => L.commitQ(s, q)),
  });

  /* ── le verdict du dernier relâchement (un seul emplacement, mis à jour en place) ── */
  const v = L.shownVerdict(lab);
  const verdictText = useMemo(() => {
    if (!v) return '';
    const w = world;
    if (w === 'line') {
      const o = { q: v.q, land: v.need, a: v.a, b: v.b, left: v.left, over: v.missing, jumps: groups(v.q) };
      if (v.kind === 'over') return k('v.line.over', o);
      if (v.kind === 'short') return k(v.q === 0 ? 'v.line.shortZero' : 'v.line.short', o);
      return k(v.left === 0 ? 'v.line.exactZero' : 'v.line.exact', o);
    }
    const o = { q: v.q, bouquets: groups(v.q), need: flowers(v.need), have: flowers(v.a), missing: flowers(v.missing), left: flowers(v.left ?? 0), per: flowers(v.b), b: v.b };
    if (v.kind === 'over') return k(v.missing < v.b ? 'v.flowers.overLast' : 'v.flowers.over', o);
    if (v.kind === 'short') return k(v.q === 0 ? 'v.flowers.shortZero' : 'v.flowers.short', o);
    return k(v.left === 0 ? 'v.flowers.exactZero' : 'v.flowers.exact', o);
  }, [v, world, k]); // eslint-disable-line react-hooks/exhaustive-deps
  const need = L.stillToTry(lab);

  /* ── la découverte : les conjectures fausses réfutées par les nombres de l'élève ── */
  const discoveryOptions = useMemo(() => discoveryOptionsOf(lab, k), [lab.a0, b, world, k]); // eslint-disable-line react-hooks/exhaustive-deps

  const formalFor = (a) => (
    <p className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-0.5 font-mono font-extrabold text-indigo-950 text-base" key={a}>
      <Formula pieces={L.formalPieces(a, b)} data-dj-formal-line={a} />
      <bdi dir="ltr" className="whitespace-nowrap text-rose-800">{L.remainderLine(a, b)}</bdi>
    </p>
  );
  const formal = (
    <div className="space-y-2" data-dj-formal>
      <p className="flex flex-wrap justify-center gap-x-4 font-mono text-sm font-bold text-slate-600"><bdi dir="ltr" className="whitespace-nowrap">a = b × q + r</bdi> <bdi dir="ltr" className="whitespace-nowrap">r &lt; b</bdi></p>
      {formalFor(lab.a0)}
      {L.thenDone(lab) && (
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-slate-600">{k('formal.then', { flowers: flowers(lab.then) })}</p>
          {formalFor(lab.then)}
        </div>
      )}
      <div className="space-y-1.5">
        <p className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1.5 font-bold text-slate-900 text-sm" data-division-role="a">
          <span dir="ltr" className="font-mono text-sm font-extrabold">a</span>
          <span>{k(`formal.roles.a.${world}`, { a: lab.a0 })}</span>
        </p>
        <DivisionRoles roles={['b', 'q', 'r'].map((key) => ({ key, text: k(`formal.roles.${key}.${world}`, { b, ...divmod(lab.a0, b) }) }))} />
      </div>
      {world === 'line' && (
        <p className="flex flex-wrap items-baseline justify-center gap-x-2 text-sm font-bold text-indigo-950">
          <span>{k('bracketTitle')}</span> <Formula pieces={L.bracketPieces(lab.a0, b)} />
        </p>
      )}
      <p className="text-sm text-emerald-900">{k(`formal.rule.${world}`)}</p>
    </div>
  );

  /* ── la lecture vivante (pilules de la consigne) : seulement ce que la main a produit ── */
  const land = b * lab.q;
  const leftNow = Math.max(0, lab.a - land);
  const reading = world === 'line'
    ? [['land', land, land > lab.a ? 'rose' : 'indigo']]
    : [...(compact ? [] : [['need', land, land > lab.a ? 'rose' : 'indigo']]), ['left', leftNow, 'indigo']];

  /* ── les commandes : la carte (large), la barre (droite large) ou la bande DANS la scène (étroit) ── */
  const lessProps = { 'data-dj-less': true };
  const moreProps = { 'data-dj-more': true };
  const lessDisabled = lab.q <= 0;
  const moreDisabled = lab.q >= lab.qMax;
  const stepper = sideFlowers && (
    <StepperCard
      layout="card"
      title={k(`stepTitle.${world}`)}
      value={lab.q}
      onLess={() => st.nudge(-1)} onMore={() => st.nudge(1)}
      lessDisabled={lessDisabled} moreDisabled={moreDisabled}
      lessLabel={k(`less.${world}`)} moreLabel={k(`more.${world}`)}
      lessProps={lessProps} moreProps={moreProps}
      readoutProps={{ 'data-dj-count': lab.q }}
    />
  );
  const lineBar = wide && world === 'line' && (
    <LabCard className="flex items-center gap-4 p-3">
      <p className="min-w-0 flex-1 text-lg font-black text-indigo-950">{k(`stepTitle.${world}`)}</p>
      <div className="flex items-center gap-3" dir="ltr">
        <RoundButton size={52} onClick={() => st.nudge(-1)} disabled={lessDisabled} aria-label={k(`less.${world}`)} {...lessProps}>
          <Minus className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
        </RoundButton>
        <div className="flex min-w-[88px] items-baseline justify-center rounded-2xl border border-indigo-100 bg-[#F5F6FF] px-4 py-1.5" data-dj-count={lab.q}>
          <bdi dir="ltr" className="text-4xl font-black tabular-nums text-indigo-900">{lab.q}</bdi>
        </div>
        <RoundButton primary size={52} onClick={() => st.nudge(1)} disabled={moreDisabled} aria-label={k(`more.${world}`)} {...moreProps}>
          <Plus className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
        </RoundButton>
      </div>
    </LabCard>
  );
  const stripNode = strip && (
    <div className="absolute inset-x-1.5 bottom-1.5 z-10 flex items-center gap-2 rounded-2xl border border-indigo-100 bg-white/95 p-1 shadow-[0_8px_20px_-14px_rgba(67,56,202,0.6)]"
      style={{ height: STRIP_H - 6 }} dir="ltr">
      <RoundButton size={44} onClick={() => st.nudge(-1)} disabled={lessDisabled} aria-label={k(`less.${world}`)} {...lessProps}>
        <Minus className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
      </RoundButton>
      <div className="flex min-w-0 flex-1 items-center justify-center gap-2" dir="rtl" data-dj-count={lab.q}>
        <span className="truncate text-sm font-extrabold text-indigo-800">{k(`reading.${world}.q`)}</span>
        <bdi dir="ltr" className="text-3xl font-black tabular-nums leading-none text-indigo-900">{lab.q}</bdi>
      </div>
      <RoundButton primary size={44} onClick={() => st.nudge(1)} disabled={moreDisabled} aria-label={k(`more.${world}`)} {...moreProps}>
        <Plus className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
      </RoundButton>
    </div>
  );

  /* ── le verdict : un seul bandeau ; à l'étroit il garde sa place (la consigne avant le premier essai) ── */
  const verdictTone = v ? (v.ok ? 'emerald' : 'rose') : 'indigo';
  const verdictLine = (
    <VerdictBanner tone={verdictTone} icon={v ? (v.ok ? CheckCircle2 : XCircle) : Hand}
      size={compact ? 'xs' : 'sm'}
      className={`${compact ? '!gap-2 !px-2.5 !py-1.5' : ''} ${wide ? 'min-h-[3.5rem]' : compact ? 'min-h-[4.25rem]' : 'min-h-[4.75rem]'}`}
      data-dj-verdict={v?.kind ?? ''} data-dj-refused={v && !v.ok ? v.kind : undefined}>
      <p className={v ? '' : 'font-bold text-indigo-900'}>{v ? verdictText : k(`instruction.${world}`, { b, per: flowers(b) })}</p>
      {need.length > 0 && v?.kind === 'exact' && (
        <p className="mt-1 text-xs font-bold text-indigo-900" data-dj-need={need.join(' ')}>{k(`need.${world}.${need[0]}`, { a: lab.a0 })}</p>
      )}
    </VerdictBanner>
  );
  const bracket = world === 'line' && v?.kind === 'exact' && (
    <p className={`flex flex-wrap items-baseline justify-center gap-x-3 gap-y-0.5 rounded-2xl border-2 border-indigo-200 bg-white px-3 py-1.5 ${compact ? 'text-sm' : 'text-base'} font-extrabold text-indigo-950`} data-dj-bracket>
      <span>{k('bracketTitle')}</span>
      <Formula pieces={[`${b} × ${v.q} ≤ ${v.a}`, `< ${b} × ${v.q + 1}`]} />
      <bdi dir="ltr" className="whitespace-nowrap font-mono text-rose-700">{`${v.a} − ${v.need} = ${v.left}`}</bdi>
    </p>
  );
  const nextCard = L.canAddFlower(lab) && !cp.blocking && (
    <LabCard className={`space-y-2 border-amber-200 bg-amber-50/70 ${compact ? 'p-2.5' : 'p-3'}`} data-dj-next>
      <p className={`${compact ? 'text-xs' : 'text-sm'} font-bold leading-snug text-amber-950`}>
        <span className="font-black">{k('next.title')}</span> {k('next.text', { flowers: flowers(lab.then) })}
      </p>
      <button type="button" onClick={() => setLab(L.addFlower)} data-dj-next-button
        className={`flex min-h-[44px] items-center justify-center gap-2 rounded-2xl w-full px-3 text-sm bg-gradient-to-b from-amber-400 to-amber-500 font-black text-amber-950 shadow-[0_4px_0_0_#D97706] outline-none transition-transform active:translate-y-0.5 active:shadow-none focus-visible:ring-4 focus-visible:ring-amber-300 motion-reduce:transition-none`}>
        <Flower2 className="h-5 w-5" aria-hidden="true" /> {k('next.button')}
      </button>
    </LabCard>
  );
  const backButton = lab.then != null && lab.a !== lab.a0 && (
    <button type="button" onClick={() => setLab(L.backToFirst)} className={`${btn} gap-1 rounded-full border-indigo-100 bg-white px-3 text-xs text-indigo-800`} data-dj-back>
      <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('next.back', { flowers: flowers(lab.a0) })}
    </button>
  );

  const promptArgs = { a: lab.a, b, flowers: flowers(lab.a), per: flowers(b) };
  const readingPills = (
    <div className={`flex flex-wrap items-center gap-1.5 ${compact ? 'w-full' : ''}`} data-dj-reading={lab.q}>
      {reading.map(([key, n, tone]) => (
        <StatPill key={key} small={compact} label={k(`reading.${world}.${key}`)} value={n} tone={tone} data-dj-read={key} />
      ))}
    </div>
  );

  const sceneNode = world === 'flowers'
    ? <FlowerScene lab={lab} lay={fLay} st={st} k={k} W={W} H={stageH} offX={padX} offY={offY} awning={awning} trackBottom={padBottom} v={v} groups={groups} strip={stripNode} />
    : <LineScene lab={lab} lay={lLay} st={st} k={k} W={W} lineY={lineTop} lineH={lineH} compact={compact} v={v} groups={groups} strip={stripNode} />;

  return (
    <ManipulationShell
      headerAction={cpSettings.control}
      type="division-jumps"
      title={title ?? k(`title.${world}`)}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      coach={coachOn ? coach : null}
      hints={[0, 1].map((i) => k(`hints.${world}.${i}`, { a: lab.a0, b }))}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      guided={cpActive}
      discovery={<ManipulationDiscovery state={state} prompt={k(`discovery.prompt.${world}`)} options={discoveryOptions} formal={formal} />}
      explanation={k('explanation')}
    >
      <ManipulationStage className="bg-gradient-to-b from-indigo-50/40 to-white">
        <div ref={boxRef} className="space-y-2" data-division-jumps data-world={world} data-a={lab.a} data-b={b}
          data-solved={ready ? 'true' : 'false'} data-q={lab.q} data-layout={wide ? 'wide' : 'narrow'} data-scene-h={world === 'flowers' ? flowerH : undefined}>
          <style dangerouslySetInnerHTML={{ __html: MOTION_CSS }} />
          <div className="relative space-y-3" data-dj-glance>
            {party.node}
            {cp.node}
            {/* la consigne : la question, la phrase de l'histoire (sa lampe s'allume à l'arrêt exact), la lecture vivante */}
            <div ref={promptRef}>
              {/* §17.9 : le CONTEXTE (tous les nombres) puis UNE question qui nomme l'état final — pas de puce, pas de titre ;
                  les lectures vivantes à côté du contexte (large) ou sous la question (étroit) */}
              <PromptCard
                size={compact ? 'md' : 'lg'}
                context={(state.isAuthoredLevel && lab.a === lab.a0 && lead) || k(`context.${world}`, promptArgs)}
                contextProps={{ 'data-dj-context': world }}
                aside={compact ? labSteps || null : (labSteps ? <div className="flex flex-wrap items-center gap-2">{labSteps}{readingPills}</div> : readingPills)}
                title={<span className={compact ? 'text-base' : ''}>{k(`question.${world}`, promptArgs)}</span>}
                lamp={v?.kind === 'exact' ? 'on' : 'off'}
                titleProps={{ 'data-dj-prompt': true, 'data-lit': v?.kind === 'exact' ? 'true' : 'false' }}
              >
                {compact && readingPills}
              </PromptCard>
            </div>

            {sideFlowers ? (
              <div className="flex items-start gap-3">
                {sceneNode}
                <div className="shrink-0" style={{ width: SIDE_W }}>{stepper}</div>
              </div>
            ) : sceneNode}
            {/* sous la scène : la barre de commande (droite, large), le verdict, le حصر, la carte 48 — la scène ne saute jamais */}
            <div ref={belowRef} className="space-y-2">
              {lineBar}
              <div className={wide ? 'flex items-start gap-3' : 'space-y-2'}>
                <div className="min-w-0 flex-1 space-y-2">{verdictLine}{bracket}</div>
                {(nextCard || backButton) && (
                  <div className="space-y-2" style={wide ? { width: SIDE_W } : undefined}>{nextCard}{backButton}</div>
                )}
              </div>
            </div>
          </div>

          {lab.trials.length > 0 && (
            <LabFold id="division-jumps.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-dj-trials={lab.trials.length}>
                {lab.trials.map((tr, i) => (
                  <li key={i} className={tr.ok ? 'text-emerald-800' : 'text-rose-800'} data-ok={String(tr.ok)}>
                    {k('trial', { a: tr.a, groups: groups(tr.q), word: k(`kind.${world}.${tr.kind}`) })}
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

/* ══════════════ le décor : l'auvent du fleuriste ══════════════ */

function Awning({ W, h }) {
  const n = Math.max(6, Math.round(W / 34));
  const w = W / n;
  return (
    <g aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={`M${i * w} 0 H${(i + 1) * w} V${h - w / 2 * 0.6} A${w / 2} ${w / 2 * 0.6} 0 0 1 ${i * w} ${h - w / 2 * 0.6} Z`}
          fill={i % 2 ? '#FFFFFF' : '#F9A8D4'} stroke="#F472B6" strokeWidth={0.8} />
      ))}
    </g>
  );
}

/* ══════════════ مبتدئ : les rangs de fleurs et le ruban ══════════════ */

function FlowerScene({ lab, lay, st, k, W, H, offX, offY, awning, trackBottom, v, groups, strip }) {
  const { a, b, q } = lab;
  const s = lay.size;
  const tied = b * q;
  const showGhost = v && v.q === q;
  const left = Math.max(0, a - tied);
  const shapes = Array.from({ length: q }, (_, g) => L.bouquetShape(lay, g, b));
  const leanOf = (i) => (i < tied ? shapes[Math.floor(i / b)].leans[i % b] : 0);
  const pillSize = Math.max(9, Math.min(13, s * 0.4));
  const toneOf = (g) => (Math.min(b, a - g * b) < b ? 'short' : 'tied');
  // le bout du ruban : avant la première fleur (q = 0) ou au bout du ruban du dernier bouquet
  const last = shapes[q - 1];
  const tipX = q === 0 ? lay.right + 22 : last.x0 - Math.min(20, s * 0.7);
  const tipY = q === 0 ? lay.y(0) + s * 0.45 : last.band;
  const hx = Math.max(24, Math.min(W - 24, offX + tipX));
  const hy = Math.max(24, Math.min(H - trackBottom - 22, offY + tipY));
  const ghostShape = showGhost && v.kind === 'short' ? L.bouquetShape(lay, q, b) : null;

  return (
    <StageFrame className="shrink-0 overflow-hidden" style={{ width: W, height: H }}
      data-dj-scene data-dj-size={s.toFixed(1)} data-dj-rows={lay.rows} data-dj-per-row={lay.perRow}>
      <svg width={W} height={H} className="absolute inset-0" style={{ direction: 'ltr' }} role="img"
        aria-label={k('sceneAria.flowers', { a, b, q })}>
        <Awning W={W} h={awning} />
        <g transform={`translate(${offX} ${offY})`}>
          {/* les pochettes de papier, DERRIÈRE les fleurs ; le bouquet fantôme d'un `short` (il tient encore dans le reste) */}
          {shapes.map((sh, g) => (
            <BouquetSleeve key={`${g}-${a}`} shape={sh} size={s} tone={toneOf(g)} className="dj-pop" />
          ))}
          {ghostShape && <BouquetSleeve shape={ghostShape} size={s} tone="ghost" data-dj-ghost="bouquet" />}
          {/* ce qui reste hors des bouquets : entouré après un arrêt exact */}
          {left > 0 && showGhost && v.kind === 'exact' && (
            <rect x={lay.x(tied + left - 1) - s * 0.1} y={lay.y(tied) - s * 0.02} width={lay.x(tied) - lay.x(tied + left - 1) + s * 1.2} height={s * 1.1}
              rx={s * 0.3} fill="#FEF3C7" stroke="#D97706" strokeWidth={2} strokeDasharray="6 4" />
          )}
          {/* les fleurs (une seule fois chacune) ; les tiges d'un bouquet noué se resserrent */}
          {Array.from({ length: a }, (_, i) => (
            <FlowerFigure key={i} x={lay.x(i)} y={lay.y(i)} size={s} lean={leanOf(i)} hue={hueOf(i)} data-dj-flower={i} />
          ))}
          {/* les rubans noués : le nœud porte la pilule du compte (rose s'il manque des fleurs), puis les fleurs fantômes */}
          {shapes.map((sh, g) => {
            const have = Math.max(0, Math.min(b, a - g * b));
            const incomplete = have < b;
            const text = String(have);
            return (
              <g key={`${g}-${a}`} data-dj-group={g + 1} data-dj-missing={incomplete ? b - have : undefined} className="dj-pop">
                {incomplete && showGhost && v.kind === 'over' && Array.from({ length: b - have }, (_, j) => {
                  const i = g * b + have + j;
                  return <FlowerFigure key={i} ghost x={lay.x(i)} y={lay.y(i)} size={s} data-dj-ghost="flower" />;
                })}
                <BouquetTie shape={sh} size={s} tone={incomplete ? 'short' : 'tied'} knotW={pillWidth(text, pillSize)} />
                <SvgPill x={sh.cx} y={sh.band} text={text} size={pillSize} fill={incomplete ? '#E11D48' : '#4F46E5'} />
              </g>
            );
          })}
          {/* le reste : sa pilule (après un arrêt exact) — data-dj-left est toujours là */}
          {left > 0 && (
            <g data-dj-left={left}>
              {showGhost && v.kind === 'exact' && (
                <SvgPill x={(lay.x(tied + left - 1) + lay.x(tied) + s) / 2} y={lay.y(tied) + s * 0.8} text={String(left)} size={pillSize} fill="#D97706" />
              )}
            </g>
          )}
          {/* le ruban tiré : du dernier bouquet à la poignée */}
          {q > 0 && (
            <path d={`M${last.x0 + s * 0.12} ${last.band} L${tipX} ${tipY}`} fill="none"
              stroke={a < tied ? '#F43F5E' : '#6366F1'} strokeWidth={Math.max(2.4, s * 0.12)} strokeLinecap="round" />
          )}
        </g>
      </svg>
      {/* les rangs sont la PISTE : toucher une fleur pose le bout du ruban ; la poignée est au bout du ruban */}
      <div {...st.trackProps} className="absolute inset-x-0 top-0" style={{ ...st.trackProps.style, bottom: trackBottom }}>
        <div {...st.handleProps({ label: k('handle.flowers'), valueText: k('handleValue.flowers', { bouquets: groups(q) }) })}
          data-dj-handle
          className="group absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none"
          style={{ left: hx, top: hy, cursor: st.dragging ? 'grabbing' : 'grab' }}>
          <span className={`flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-indigo-500 bg-white shadow-[0_6px_16px_-6px_rgba(79,70,229,0.9)] transition-transform group-focus-visible:ring-4 group-focus-visible:ring-indigo-300 motion-reduce:transition-none ${st.dragging ? 'scale-110' : ''}`}>
            <Ribbon className="h-5 w-5 text-indigo-600" strokeWidth={2.6} aria-hidden="true" />
          </span>
        </div>
      </div>
      {strip}
    </StageFrame>
  );
}

/* ══════════════ متقدم : la droite graduée, le lapin et ses sauts ══════════════ */

function LineScene({ lab, lay, st, k, W, lineY: Y, lineH, compact, v, groups, strip }) {
  const { a, b, q } = lab;
  const H = lineH + (strip ? STRIP_H : 0);
  const showGhost = v && v.q === q;
  const land = b * q;
  const xa = lay.xOf(a);
  const xl = lay.xOf(land);
  const hs = compact ? 32 : 40;
  // les multiples déjà atteints par un saut relâché (l'élève les a trouvés) ; jamais les autres
  const visited = [...new Set(lab.trials.filter((tr) => tr.a === a).map((tr) => tr.q * b))].filter((m) => m !== land);
  const labelled = [];
  const visitedShown = visited.sort((x, y) => x - y).filter((m) => {
    const x = lay.xOf(m);
    if (Math.abs(x - xl) < 26 || labelled.some((u) => Math.abs(u - x) < 26)) return false;
    labelled.push(x);
    return true;
  });
  const arc = (x0, x1, h) => `M${x0} ${Y} Q${(x0 + x1) / 2} ${Y - 2 * h} ${x1} ${Y}`;
  const hOf = (w) => Math.max(7, Math.min(28, w * 0.6));
  const marks = L.marksOf(a, b);
  const past = land > a;
  const mood = past ? 'oops' : v?.kind === 'exact' ? 'happy' : 'idle';
  const pillSize = compact ? 11 : 12.5;
  const landX = Math.max(22, Math.min(W - 22, xl));

  return (
    <StageFrame className="overflow-hidden" style={{ width: W, height: H }} data-dj-scene>
      <svg width={W} height={H} className="absolute inset-0" style={{ direction: 'ltr' }} role="img"
        aria-label={k('sceneAria.line', { a, b, q, land, L: lay.L })}>
        {/* le sol et la mare : après a, on tombe dans l'eau */}
        <rect x={0} y={Y + 8} width={W} height={lineH - Y - 8} fill="#E9EBFF" opacity={0.55} />
        {Array.from({ length: Math.floor(W / 70) }, (_, i) => {
          const gx = 34 + i * 70;
          return gx < xa - 10 ? <path key={i} d={`M${gx} ${lineH - 3} q2 -8 4 0 q2 -10 4 0 q2 -7 4 0`} fill="none" stroke="#A5B4FC" strokeWidth={1.4} strokeLinecap="round" aria-hidden="true" /> : null;
        })}
        <g data-dj-pond={a} aria-hidden="true">
          <path d={`M${xa + 4} ${Y - 10} Q${xa + 4} ${Y - 16} ${xa + 14} ${Y - 16} H${W + 2} V${Y + 34} H${xa + 18} Q${xa + 4} ${Y + 34} ${xa + 6} ${Y + 18} Z`} fill="#BAE6FD" />
          <path d={`M${xa + 10} ${Y - 12} H${W}`} stroke="#E0F2FE" strokeWidth={3} strokeLinecap="round" />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${xa + 14 + i * 22} ${Y + 12 + (i % 2) * 10} q4 -3 8 0 t8 0`} fill="none" stroke="#38BDF8" strokeWidth={1.4} strokeLinecap="round" />
          ))}
        </g>
        {/* la droite : une piste, ses graduations ; des nombres « ronds » seulement */}
        <rect x={lay.x0 - 10} y={Y - 4} width={lay.x1 - lay.x0 + 20} height={8} rx={4} fill="#FFFFFF" stroke="#C7D2FE" />
        <line x1={lay.x0 - 8} x2={lay.x1 + 10} y1={Y} y2={Y} stroke="#475569" strokeWidth={2} />
        <path d={`M${lay.x1 + 10} ${Y - 4.5} L${lay.x1 + 18} ${Y} L${lay.x1 + 10} ${Y + 4.5} Z`} fill="#475569" />
        {lay.ticks.map((tk) => (
          <g key={tk.v}>
            <line x1={tk.x} x2={tk.x} y1={Y - (tk.major ? 6 : 3)} y2={Y + (tk.major ? 6 : 3)} stroke="#64748B" strokeWidth={tk.major ? 1.4 : 0.8} />
            {tk.label && <text x={tk.x} y={Y + 21} textAnchor="middle" fontSize={11} fontWeight={700} fill="#475569" fontFamily="ui-monospace, monospace">{tk.v}</text>}
          </g>
        ))}
        {/* le nombre à atteindre : un drapeau */}
        <g data-dj-target={a}>
          <line x1={xa} x2={xa} y1={Y + 6} y2={Y - 66} stroke="#9F1239" strokeWidth={2.2} strokeLinecap="round" />
          <path d={`M${xa} ${Y - 66} L${xa - 16} ${Y - 60} L${xa} ${Y - 54} Z`} fill="#F43F5E" />
          <SvgPill x={xa} y={Y - 68} pointer="down" text={String(a)} size={pillSize + 1} fill="#E11D48" />
        </g>
        {/* les sauts : de (i − 1)·b à i·b ; ceux qui passent après a sont de trop (pointillés roses) */}
        {Array.from({ length: q }, (_, i) => {
          const j = lay.jump(i + 1);
          const over = j.to > a;
          return (
            <g key={i}>
              <path d={arc(j.x0, j.x1, hOf(j.x1 - j.x0))} fill="none" data-dj-group={i + 1} data-dj-missing={over ? j.to - a : undefined}
                stroke={over ? '#E11D48' : '#6366F1'} strokeWidth={2.4} strokeLinecap="round" strokeDasharray={over ? '4 3' : undefined} />
              <circle cx={j.x1} cy={Y} r={3.2} fill={over ? '#E11D48' : '#4F46E5'} stroke="#FFFFFF" strokeWidth={1.2} />
            </g>
          );
        })}
        {/* le saut fantôme d'un `short` : il tient encore avant a */}
        {showGhost && v.kind === 'short' && (() => {
          const j = lay.jump(q + 1);
          return <path data-dj-ghost="jump" d={arc(j.x0, j.x1, hOf(j.x1 - j.x0))} fill="none" stroke="#059669" strokeWidth={2.4} strokeDasharray="5 4" />;
        })()}
        {showGhost && v.kind === 'over' && (
          <line data-dj-ghost="past" x1={xa} x2={xl} y1={Y} y2={Y} stroke="#E11D48" strokeWidth={5} strokeDasharray="3 3" strokeLinecap="round" />
        )}
        {/* l'écart a − b·q : ce qui reste, en rose, après un arrêt exact */}
        {land <= a && (
          <g data-dj-left={a - land}>
            {showGhost && v.kind === 'exact' && a > land && <line x1={xl} x2={xa} y1={Y} y2={Y} stroke="#E11D48" strokeWidth={6} strokeLinecap="round" />}
          </g>
        )}
        {/* les multiples trouvés, sous la droite */}
        {visitedShown.map((m) => (
          <text key={m} x={lay.xOf(m)} y={Y + 36} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#4338CA" fontFamily="ui-monospace, monospace" data-dj-visited={m}>{m}</text>
        ))}
        {/* les marques du manuel (« 10؟ 20؟ ») : des nombres de sauts à visiter, jamais des réponses */}
        {marks.map((n) => (
          <g key={n} data-dj-mark={n} data-hit={n === q ? 'true' : 'false'}>
            <line x1={lay.xOf(n * b)} x2={lay.xOf(n * b)} y1={Y + 42} y2={Y + 48} stroke="#A16207" strokeWidth={1.5} />
            <text x={lay.xOf(n * b)} y={Y + 59} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={n === q ? '#4338CA' : '#A16207'}
              style={{ direction: 'rtl', unicodeBidi: 'isolate' }}>{k('mark', { jumps: groups(n) })}</text>
          </g>
        ))}
        {/* le lapin au point d'arrivée (il saute à chaque pas), et la pilule de son arrivée */}
        <g transform={`translate(${xl} ${Y - 2})`} data-dj-hopper={land} data-mood={mood}>
          <g key={q} className="dj-hop"><HopperFigure x={0} y={0} size={hs} mood={mood} /></g>
        </g>
        <SvgPill x={landX} y={Y - hs * 1.18 - 4} pointer="down" text={String(land)} size={pillSize} fill={past ? '#E11D48' : '#4F46E5'} data-dj-landing={land} />
      </svg>
      <div {...st.trackProps} className="absolute inset-x-0 top-0" style={{ ...st.trackProps.style, height: lineH }}>
        <div {...st.handleProps({ label: k('handle.line'), valueText: k('handleValue.line', { jumps: groups(q), land }) })}
          data-dj-handle
          className="group absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-end justify-end rounded-full outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
          style={{ left: xl, top: Y - hs * 0.45, cursor: st.dragging ? 'grabbing' : 'grab' }}>
          <span className={`flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white shadow transition-transform motion-reduce:transition-none ${st.dragging ? 'scale-125' : ''}`}>
            <ChevronsLeftRight className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
          </span>
        </div>
      </div>
      {strip}
    </StageFrame>
  );
}

/** La découverte : les conjectures fausses réfutées avec SES nombres (aussi la dernière question de l'étape 1). */
export function discoveryOptionsOf(lab, k) {
  const { b, world } = lab;
  const flowers = (n) => k('flowers', { count: n });
  const groups = (n) => k(world === 'line' ? 'jumps' : 'bouquets', { count: n });
  const { q, r } = divmod(lab.a0, b);
  const n = q === 10 ? 20 : 10;
  const ten = L.judge(lab.a0, b, n);
  const o = { a: lab.a0, b, q, n, left: r, land: b * q, flowers: flowers(lab.a0), bouquets: groups(q), leftF: flowers(r), per: flowers(b), jumps: groups(q) };
  const tenO = { n, a: lab.a0, b, land: ten.need, left: ten.left, need: flowers(ten.need), have: flowers(lab.a0), leftF: flowers(ten.left ?? 0), groupsN: groups(n) };
  return [
    { text: k(`discovery.nothing.${world}`), why: k(`discovery.whyNothing.${world}`, o) },
    { text: k(`discovery.right.${world}`), correct: true },
    { text: k(`discovery.ten.${world}`, { n }), why: k(`discovery.whyTen.${world}.${ten.kind === 'over' ? 'over' : 'short'}`, tenO) },
  ];
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite du nombre affiché : le nombre de la leçon (quotient, reste, [حصر], la règle) ou le second nombre (47 → 48). */
export function chainOf(lab) {
  if (lab.a !== lab.a0) return ['thenRemainder', 'thenWhy'];
  return lab.world === 'line' ? ['quotient', 'remainder', 'bracket', 'rule'] : ['quotient', 'remainder', 'rule'];
}

const C = (k, key, o) => k(`cp.${key}`, o);
const pick = (list, right, whys) => list.map((text, i) => (i === right ? { text, correct: true } : { text, why: whys[i] }));
const numsOf = (lab, a = lab.a) => {
  const { q, r } = divmod(a, lab.b);
  return { a: iso(a), b: iso(lab.b), q: iso(q), r: iso(r), bq: iso(lab.b * q), eq: iso(L.formalLine(a, lab.b)), lt: iso(L.remainderLine(a, lab.b)) };
};

/** Chaque question est construite sur LES nombres du labo (rien en dur). */
export const QUESTIONS = {
  quotient: (lab, k) => {
    const { q } = divmod(lab.a, lab.b);
    const o = numsOf(lab);
    return {
      id: 'quotient', kind: 'number', expected: String(q), answer: <bdi dir="ltr">{q}</bdi>,
      prompt: C(k, `quotient.prompt.${lab.world}`, o), hints: [C(k, `quotient.hint1.${lab.world}`), C(k, 'quotient.hint2', o)], explain: C(k, 'quotient.explain', o),
    };
  },
  remainder: (lab, k) => {
    const { r } = divmod(lab.a, lab.b);
    const o = numsOf(lab);
    return {
      id: 'remainder', kind: 'number', expected: String(r), answer: <bdi dir="ltr">{r}</bdi>,
      prompt: C(k, `remainder.prompt.${lab.world}`, o), hints: [C(k, `remainder.hint1.${lab.world}`, o), C(k, 'remainder.hint2', o)], explain: C(k, 'remainder.explain', o),
    };
  },
  bracket: (lab, k) => {
    const { a, b } = lab;
    const { q } = divmod(a, b);
    const o = { ...numsOf(lab), q1: iso(q + 1), bq1: iso(b * (q + 1)), qm: iso(q - 1), bqm: iso(b * (q - 1)) };
    return {
      id: 'bracket', kind: 'choice', prompt: C(k, 'bracket.prompt', o),
      options: pick([iso(L.bracketLine(a, b)), iso(`${b} × ${q - 1} ≤ ${a} < ${b} × ${q}`), iso(`${b} × ${q + 1} ≤ ${a} < ${b} × ${q + 2}`)], 0,
        [null, C(k, 'bracket.whyShort', o), C(k, 'bracket.whyOver', o)]),
      hints: [C(k, 'bracket.hint1'), C(k, 'bracket.hint2', o)], explain: C(k, 'bracket.explain', { ...o, line: iso(L.bracketLine(a, b)) }),
    };
  },
  thenRemainder: (lab, k) => {
    const { r } = divmod(lab.a, lab.b);
    const o = numsOf(lab);
    return {
      id: 'thenRemainder', kind: 'number', expected: String(r), answer: <bdi dir="ltr">{r}</bdi>,
      prompt: C(k, 'thenRemainder.prompt', o), hints: [C(k, 'thenRemainder.hint1'), C(k, 'thenRemainder.hint2', o)], explain: C(k, 'thenRemainder.explain', o),
    };
  },
  thenWhy: (lab, k) => {
    const first = numsOf(lab, lab.a0);
    const o = { ...numsOf(lab), a0: first.a, q0: first.q, r0: first.r };
    return {
      id: 'thenWhy', kind: 'choice', prompt: C(k, 'thenWhy.prompt', o),
      options: pick([C(k, 'thenWhy.right', o), C(k, 'thenWhy.zero'), C(k, 'thenWhy.smaller')], 0, [null, C(k, 'thenWhy.whyZero', o), C(k, 'thenWhy.whySmaller', o)]),
      hints: [C(k, 'thenWhy.hint1', o), C(k, 'thenWhy.hint2', o)], explain: C(k, 'thenWhy.explain', o),
    };
  },
  rule: (lab, k) => {
    const o = numsOf(lab, lab.a0);
    return {
      id: 'rule', kind: 'choice', prompt: k(`discovery.prompt.${lab.world}`), options: discoveryOptionsOf(lab, k),
      hints: [C(k, `rule.hint1.${lab.world}`, o), C(k, 'rule.hint2', o)], explain: C(k, 'rule.explain', { ...o, rule: k(`formal.rule.${lab.world}`) }),
    };
  },
};
