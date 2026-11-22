import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Sparkles, Hand, FlaskConical, Undo2, RotateCcw, ChevronLeft, Plus, ShieldAlert, FlipHorizontal2 } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import { links as chainLinks, tileTex, tileValue, ratTexStd, evaluateChain } from '@smarter-academy/core/arithmetic/fractions3.js';
import MathText from '../../components/MathText';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { LabCard, StageFrame, PromptCard, VerdictBanner } from '../primitives/LabKit';
import KidFigure from '../primitives/KidFigure';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { LEVELS } from '../levels';
import * as L from '../logic/mergeBoard';
import { CSS, SignBar, Magnet, MiniLine } from './mergeBoard/boardArt';

/**
 * merge-board — LE SIGNE PRÉDIT SOUS LA MAIN : « لوحة الدمج » (3AM, unité 2 « العمليات على الكسور والأعداد الناطقة », درس « العمليات على الأعداد الناطقة », 2026-10-26).
 * La logique, exacte, est dans `logic/mergeBoard.js` (sur `packages/core/arithmetic/fractions3.js` : `parseChain`, `links`, `linkStatus`, `mergeLink`… importé PAR CHEMIN) ; le dessin
 * dans `mergeBoard/boardArt.jsx`. Distinct de `like-terms` / `term-ferry` / `equality-lanes` (3AM, autres unités : on PORTE un terme ou on le TRAVERSE), de `robot-track` (unité 1 : on RÉORDONNE
 * des facteurs librement), de `shade-match`, `seed-rake`, `gear-crank` (autres leçons de l'unité) : ici les tuiles ne quittent jamais leur rangée — deux VOISINES se fusionnent — et la main
 * tient le SIGNE prédit, le DIVISEUR retourné et l'ORDRE des fusions (que les aimants et les bulles contraignent).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main choisit deux tuiles voisines (ou le jeton entre elles), PRÉDIT le signe du résultat (pavé + / − / 0), retourne le diviseur d'une division.
 * B. Le signe juste → les tuiles glissent et FUSIONNENT ; faux → REFUSÉ : les barres montrent pourquoi. Un aimant, une bulle ou l'ordre de gauche à droite REFUSENT une fusion trop tôt.
 * C. Les barres signées sous chaque tuile (متقدم : cachées jusqu'à la fusion, elles reviennent après trois fautes) et la mini-droite d'un + ou − : bout à bout, les couleurs opposées se CHEVAUCHENT.
 * D. Chaque fusion, chaque refus et chaque retournement est un essai jugé exactement (MANUEL §6bis).
 * E. À découvrir (مبتدئ, après c1–c3) : « كيف تعرف إشارة الناتج قبل أن تحسب؟ ».
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        les quatre opérations sur les rationnels : le signe d'abord, puis la fraction ; ÷ = × le مقلوب du diviseur ; priorité des opérations
 *   OBJECT         une borne d'arcade du club : tuiles de nombres, jetons d'opération, aimants, bulles, pavés de signe ; Ilyes (KidFigure) aux commandes
 *   VARIABLE       le signe prédit ; la tuile retournée ; l'ordre des fusions
 *   INVARIANT      la valeur d'un nombre ne change pas quand on le retourne et qu'on change l'opération (a ÷ b = a × 1/b) ; le résultat d'une chaîne ne dépend pas de l'ordre légal des fusions
 *   TRANSFORMATION deux tuiles → une tuile ; une bulle ou une barre résolue s'efface
 *   CONSTRAINT     b ≠ 0 (« لا مقلوب للعدد 0 ») ; seuls des VOISINS fusionnent ; aimants, bulles, gauche-droite
 *   RESISTANCE     le signe d'une somme n'est pas celui du 1er terme ; deux signes − ne donnent pas un résultat − ; le مقلوب d'un négatif reste négatif
 *   EVIDENCE       les barres qui s'ajoutent ou se chevauchent, la trace du dénominateur commun, le مقلوب retourné qui garde sa barre rouge
 *   CONTRAST       −5/4 + 11/6 (le 1er terme est négatif, la somme positive) ; −9/8 ÷ (−3/4) ; 7/3 − 8/15 ÷ 11/20 (l'aimant)
 *   PREDICTION     le signe du résultat AVANT chaque fusion (requise)
 *   DISCOVERY      « كيف تعرف إشارة الناتج قبل أن تحسب؟ »
 *   FORMALIZATION  les quatre règles : + −, ×, ÷ par le مقلوب, la priorité
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * « جرّب كل الإمكانيات » : NON. « جرّب أعدادك » est TOUJOURS ouvert sous le labo (2 à 4 nombres, |a| et b ≤ 20, un seul couple de parenthèses ; rien n'est compté).
 * D'UN SEUL REGARD (§8bis) : `[data-mb-glance]` enveloppe la consigne, la borne, les pavés et le verdict.
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/mergeBoard.js › coachOf` (pair · flip · sign · magnet · bubble · free).
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 5, 2026-10-28) : `checkpoints` (défaut true). Après CHAQUE tâche, une suite de questions se pose PAR-DESSUS le labo et
 * retient « المهمة التالية » (`CHAINS`) : c1 dénominateur commun · le numérateur converti ; c2 pourquoi le signe · le dénominateur du produit ; c3 le résultat réduit · la RÈGLE (l'ancienne découverte, qui
 * formalise) ; c4 le quotient d'abord · le dénominateur du dernier pas ; a1–a4 le signe puis le numérateur du résultat ; monde `signs` : à la fin de la série, pourquoi 5/6 − 7/8 < 0 et pourquoi
 * (−6) × (−5/12) > 0. OBLIGATOIRES pour tout élève ; l'ENSEIGNANT seul les coupe pour SON compte (`useLabCheckpointSettings`, interrupteur dans l'en-tête) ; coupées, la découverte d'avant reprend.
 * ÉTAPES `LabStepper` (`[data-mb-step=<i>]`) + fête ; « إعادة » repart de la tâche 1 ; « أعِد التجربة » remet LA MÊME tâche. SON (`playSfx`) : `bell` à chaque fusion, `tooth` au retournement,
 * `flag` à l'objectif, `over` quand une prédiction ou une fusion est refusée.
 * Props : `tasks` ([{ id, chain, hidden, signOnly }]), `world` ('board' | 'signs'), `level`, `levels`, `coach`, `checkpoints`, `title`, `lead`, `onTrial(event)`, `onFinished({ world })`.
 * CONTRAT DOM : [data-merge-board][data-task][data-world][data-solved], [data-mb-glance], [data-mb-board][data-tiles], [data-mb-tile][data-id][data-state][data-sign], [data-mb-chip][data-op],
 * [data-mb-bubble], [data-mb-bar-rail], [data-mb-magnet], [data-mb-pads], [data-mb-pad][data-sign], [data-mb-flip][data-id], [data-mb-miniline], [data-mb-trail], [data-mb-score], [data-mb-retry],
 * [data-mb-next], [data-mb-verdict], [data-mb-step], [data-mb-free][data-active], [data-mb-free-input], [data-mb-free-add], [data-mb-free-refusal], [data-mb-kid], [data-mb-formal].
 */
const NS = 'manipulation.mergeBoard';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-amber-300';
const M = (tex) => `$${tex}$`;
const OPSYM = { '+': '+', '-': '−', '×': '×', '÷': '÷' };
const OPKEY = { '+': 'plus', '-': 'minus', '×': 'times', '÷': 'over' };

export function numbersFor({ tasks, world, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['merge-board'][lv].numbers;
  return { tasks: tasks ?? asked.tasks, world: world ?? asked.world ?? 'board' };
}

export default function MergeBoard({
  tasks, world, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, world, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'merge-board', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  // les questions pendant le labo : la suite de la tâche courante ; celle qui finit par la règle remplace la découverte automatique
  const cpSettings = useLabCheckpointSettings('merge-board');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const curTask = L.taskOf(lab);
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[curTask.id] ?? null : null;
  const ruleByCheckpoint = cpOn && cpSettings.enabled && lab.tasks.some((tk) => CHAINS[tk.id]?.includes('rule'));
  const cp = useLabCheckpoint({
    id: chain ? curTask.id : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, curTask, k)) : null,
    reached: L.taskDone(lab),
    resetKey: scene.inits,
    onRetry: () => setLab(L.restartTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (CHAINS[id]?.includes('rule')) { state.discover(); state.formalize(); } },
  });
  const ready = L.discoveryReady(lab) && !ruleByCheckpoint;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  const finishedOnce = useRef(false);
  const everyDone = L.allDone(lab);
  useEffect(() => {
    if (!everyDone) { finishedOnce.current = false; return; }
    if (!finishedOnce.current) { finishedOnce.current = true; state.report(onFinished, { world: lab.world }); }
  }, [everyDone]); // eslint-disable-line react-hooks/exhaustive-deps
  const reported = useRef(0);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials < reported.current) reported.current = 0;
    for (let i = reported.current; i < nTrials; i += 1) state.report(onTrial, { ...lab.trials[i] });
    reported.current = nTrials;
  }, [nTrials, lab.trials]); // eslint-disable-line react-hooks/exhaustive-deps

  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'merge-board', step: coachStep,
    text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });

  const discovery = (
    <ManipulationDiscovery state={state} prompt={<MathText>{k('discovery.prompt')}</MathText>} options={discoveryOptions(k)} formal={<Formal k={k} />} />
  );

  return (
    <ManipulationShell
      type="merge-board"
      title={title ?? k('title')}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      coach={coachOn ? coach : null}
      headerAction={cpSettings.control}
      guided={!!chain || ruleByCheckpoint}
      hints={[0, 1, 2].map((i) => k(`hints.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={discovery}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-violet-50/70 to-white">
        <div className="space-y-2" data-merge-board data-task={lab.ti} data-world={lab.world} data-solved={everyDone ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} lead={state.isAuthoredLevel ? lead : null} cp={cp} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, lead, cp }) {
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const signs = L.isSigns(lab);
  const bars = L.barsShown(lab);
  const all = useMemo(() => chainLinks(lab.root), [lab.root]);
  const link = L.selectedLink(lab);
  const status = L.statusOf(lab, link);
  const last = lab.last;
  const shakeIds = last?.kind === 'refused' ? new Set(last.pair ?? lab.sel) : new Set();
  const shakeCls = lab.flash % 2 ? 'mb-shake-a' : 'mb-shake-b';

  /* ── les étapes, la fête et le son (2026-10-28) */
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // L.init (« إعادة », autre niveau) : on refête
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son (muet sans « الصوت ») : une cloche à chaque fusion, un déclic au retournement, le drapeau à l'objectif, « over » quand c'est refusé
  const heard = useRef(lab.trials.length);
  useEffect(() => {
    if (lab.trials.length < heard.current) heard.current = 0;
    const fresh = lab.trials.slice(heard.current);
    heard.current = lab.trials.length;
    if (!fresh.length) return;
    if (fresh.some((e) => e.kind === 'solved')) playSfx('flag');
    else if (fresh.some((e) => e.kind === 'refused' || (e.kind === 'flip' && e.ok === false))) playSfx('over');
    else if (fresh.some((e) => e.kind === 'merge')) playSfx('bell');
    else if (fresh.some((e) => e.kind === 'flip')) playSfx('tooth');
  }, [lab.trials]);

  const chainTexOf = L.chainTex(task.root);
  const kind = free ? 'free' : signs ? 'signs' : 'board';
  const contextKey = free ? 'board' : signs ? 'signs' : task.hidden ? 'hidden' : 'board';
  const prompt = (
    <PromptCard size="md" context={<MathText>{`${free ? `${k('context.freePrefix')} ` : ''}${k(`context.${contextKey}`, { chain: M(chainTexOf) })}`}</MathText>} contextProps={{ 'data-mb-context': kind }}
      title={<MathText>{k(`question.${kind}`)}</MathText>} titleClassName="text-base" lamp={free ? null : done ? 'on' : 'off'}
      titleProps={{ 'data-mb-prompt': kind, 'data-lit': done ? 'true' : 'false' }}
      aside={lab.tasks.length > 1 && !free ? <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-mb-step" /> : undefined}
      instruction={lead || (!free && !signs && lab.ti === 0 && lab.history.length === 0 ? k('lead') : undefined)} />
  );

  /* ── les nœuds de la chaîne */
  const linkOfGroup = (g, i) => all.find((l) => l.group === g && l.i === i);
  const tile = (n) => {
    const sel = lab.sel.includes(n.id);
    const b = L.barOf(lab, n);
    const v = tileValue(n);
    const sg = v.n < 0n ? -1 : v.n > 0n ? 1 : 0;
    const fresh = last?.kind === 'merge' && last.mergedId === n.id;
    const shaking = shakeIds.has(n.id);
    const isDiv = link?.op === '÷' && (link.left.id === n.id || link.right.id === n.id);
    return (
      <div key={n.id} className="flex flex-col items-center gap-1">
        <button type="button" data-mb-tile data-id={n.id} data-state={sel ? 'selected' : 'idle'} data-sign={sg} data-flipped={n.flip ? 'true' : 'false'} disabled={done}
          aria-label={k('tile.aria', { w: iso(n.flip ? `${v.n}/${v.d}` : n.w), s: k(sg < 0 ? 'tile.signMinus' : sg > 0 ? 'tile.signPlus' : 'tile.signZero') })} aria-pressed={sel}
          onClick={() => setLab((s) => L.tapTile(s, n.id))}
          className={`flex min-h-[84px] w-[86px] flex-col items-center justify-center gap-0.5 rounded-2xl border-[3px] bg-white px-1 pb-1 pt-2 shadow-[0_4px_0_0_rgba(76,29,149,0.35)] transition-transform duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring} ${sel ? 'border-amber-400 mb-glow' : n.flip ? 'border-emerald-400' : 'border-violet-300'} ${fresh ? 'mb-pop' : ''} ${shaking ? shakeCls : ''}`}>
          <span className="text-[19px] font-black leading-none text-indigo-950" dir="ltr"><MathText>{M(tileTex(n))}</MathText></span>
          <SignBar sign={b.sign} frac={b.frac} hidden={!bars && !n.merged} />
        </button>
        {sel && isDiv && !signs && (
          <button type="button" data-mb-flip data-id={n.id} onClick={() => setLab((s) => L.flip(s, n.id))} aria-label={k('flip.aria', { w: iso(n.flip ? `${v.n}/${v.d}` : n.w) })}
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 px-2.5 text-sm font-black ${ring} ${n.flip ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-amber-400 bg-amber-50 text-amber-950'}`}>
            <FlipHorizontal2 className="h-4 w-4" aria-hidden="true" /> {n.flip ? k('flip.back') : k('flip.label')}
          </button>
        )}
      </div>
    );
  };
  const chip = (l, flippedRight) => {
    const op = l.op === '÷' && flippedRight ? '×' : l.op;
    const md = l.op === '×' || l.op === '÷';
    const sel = link && link.id === l.id;
    return (
      <button type="button" key={`c${l.id}`} data-mb-chip data-op={l.op} data-state={sel ? 'selected' : 'idle'} onClick={() => setLab((s) => L.tapChip(s, l.id))} disabled={done}
        aria-label={k('chip.aria', { op: k(`chip.${OPKEY[l.op]}`) })}
        className={`relative flex h-[84px] min-w-[44px] flex-col items-center justify-center rounded-xl ${ring}`}>
        {md && <span data-mb-magnet className="-mb-1" aria-hidden="true"><Magnet faint={task.hidden && !lab.barsBack} size={26} /></span>}
        <span className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xl font-black ${sel ? 'border-amber-400 bg-amber-100 text-amber-950' : md ? 'border-rose-300 bg-white text-rose-800' : 'border-violet-300 bg-white text-violet-900'}`}>{OPSYM[op]}</span>
      </button>
    );
  };
  const node = (n, depth = 0) => {
    if (n.t === 'n') return tile(n);
    if (n.t === 'b') {
      const bl = all.find((l) => l.bar === n);
      return (
        <div key={`b${bl?.id}`} className="flex flex-col items-stretch gap-1" data-mb-bar-node>
          <div className="flex justify-center">{node(n.top, depth + 1)}</div>
          <button type="button" data-mb-bar-rail data-state={link && bl && link.id === bl.id ? 'selected' : 'idle'} onClick={() => bl && setLab((s) => L.tapChip(s, bl.id))} disabled={done}
            aria-label={k('chip.aria', { op: k('chip.bar') })} className={`relative flex h-7 items-center justify-center rounded-full ${ring}`}>
            <span className="h-2 w-full rounded-full bg-rose-400" /><span className="absolute -top-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-rose-300 bg-white text-base font-black text-rose-800">÷</span>
          </button>
          <div className="flex justify-center">{node(n.bottom, depth + 1)}</div>
        </div>
      );
    }
    const row = n.items.map((x, i) => (i % 2 === 0 ? node(x, depth + 1) : chip(linkOfGroup(n, i) ?? { id: `x${i}`, op: x, group: n, i }, n.items[i + 1]?.flip)));
    const inner = <div className="flex flex-wrap items-center justify-center gap-1.5" data-mb-row>{row}</div>;
    if (!n.paren) return depth === 0 ? inner : <div key={`g${depth}${n.items.length}`} className="flex justify-center">{inner}</div>;
    return (
      <div key={`p${depth}${n.items.length}`} data-mb-bubble aria-label={k('bubble.aria')}
        className="rounded-[28px] border-[3px] border-sky-300 bg-sky-100/60 px-2 py-1.5 shadow-inner">{inner}</div>
    );
  };

  /* ── la mini-droite et la trace de la dernière fusion */
  const pair = L.pairBars(lab);
  const showLine = bars && pair && (pair.op === '+' || pair.op === '-') && !done;
  const lineAB = pair && (() => {
    const a = tileValue(pair.link.left); const b0 = tileValue(pair.link.right);
    return { a, b: pair.op === '-' ? { n: -b0.n, d: b0.d } : b0 };
  })();
  const lastStep = last?.kind === 'merge' ? last.step : null;
  const stepLine = lastStep && (lastStep.op === '+' || lastStep.op === '-') && task.hidden;

  const stage = (
    <StageFrame className="min-w-0 overflow-hidden !bg-gradient-to-b from-indigo-950 to-violet-900 !p-2" data-mb-stage>
      <div className="mx-auto flex min-h-[150px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-violet-400/60 bg-indigo-50/95 p-3" data-mb-board dir="ltr" data-tiles={L.tilesLeft(lab)} role="group" aria-label={k('board.aria')}>
        {node(lab.root)}
        {showLine && lineAB && <div className="w-full max-w-[340px]" data-mb-miniline-wrap><MiniLine a={lineAB.a} b={lineAB.b} scale={task.scale} /></div>}
        {stepLine && <div className="w-full max-w-[340px]" data-mb-miniline-wrap><MiniLine a={lastStep.a} b={lastStep.op === '-' ? { n: -lastStep.b.n, d: lastStep.b.d } : lastStep.b} scale={task.scale} /></div>}
        {lastStep && <p className="text-center text-sm font-black text-indigo-950" data-mb-trail dir="ltr"><MathText>{M(lastStep.trail)}</MathText></p>}
      </div>
    </StageFrame>
  );

  /* ── les pavés de signe */
  const canPredict = !!link && !done && (status?.ok || status?.reason === 'noflip');
  const pad = (sg, key, tone) => (
    <button key={key} type="button" data-mb-pad data-sign={sg} disabled={!canPredict} onClick={() => setLab((s) => L.predict(s, sg))}
      aria-label={k(`pads.${key}Aria`)}
      className={`inline-flex min-h-[64px] min-w-[96px] items-center justify-center gap-2 rounded-2xl border-[3px] px-4 text-2xl font-black shadow-[0_4px_0_0_var(--mb-sh)] transition-all duration-150 active:translate-y-0.5 active:shadow-none disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none motion-reduce:transition-none ${ring} ${tone}`}>
      <span aria-hidden="true" className="text-3xl leading-none">{sg > 0 ? '+' : sg < 0 ? '−' : '٠'}</span> <span className="text-base" dir="rtl">{k(`pads.${key}`)}</span>
    </button>
  );
  const mood = done ? 'proud' : last?.kind === 'refused' ? 'wonder' : 'happy';
  const pads = (
    <div className="flex items-end justify-center gap-3" data-mb-controls>
      <div className="flex flex-wrap items-center justify-center gap-2" data-mb-pads role="group" aria-label={k('pads.aria')}>
        {pad(1, 'plus', 'border-blue-700 bg-blue-600 text-white [--mb-sh:#1E3A8A]')}
        {pad(-1, 'minus', 'border-red-700 bg-red-600 text-white [--mb-sh:#7F1D1D]')}
        {free && pad(0, 'zero', 'border-slate-500 bg-slate-100 text-slate-900 [--mb-sh:#94A3B8]')}
      </div>
      <svg viewBox="0 0 70 100" width="58" height="82" aria-hidden="true" data-mb-kid className="shrink-0">
        <KidFigure cx={36} top={6} foot={96} hairStyle="short" hair="brown" outfit="blue" skin="light" mood={mood} data-mb-ilyes data-mood={mood} />
      </svg>
    </div>
  );

  /* ── le verdict */
  const vv = verdictOf(lab, k, all);
  const canNext = L.canNext(lab) && !cp.blocking;
  const Icon = vv.tone === 'emerald' ? CheckCircle2 : vv.tone === 'amber' ? ShieldAlert : vv.tone === 'indigo' ? Hand : Sparkles;
  const btn = `inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border-2 px-3.5 text-sm font-black transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`;
  const banner = (
    <VerdictBanner tone={vv.tone} icon={Icon} size="sm" className="min-h-[2.75rem] !py-1.5" data-mb-verdict={vv.code}>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <p className={vv.tone === 'indigo' ? 'font-bold text-indigo-900' : ''}><MathText>{vv.text}</MathText></p>
        <div className="flex flex-wrap items-center gap-2">
          {L.canRetry(lab) && (
            <button type="button" onClick={() => setLab(L.retry)} data-mb-retry className={`${btn} border-amber-400 bg-amber-50 text-amber-950`}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> {k('retry.label')}
            </button>
          )}
          {canNext && (
            <button type="button" onClick={() => setLab(L.nextTask)} data-mb-next className={`${btn} border-emerald-600 bg-emerald-600 text-white shadow-[0_3px_0_0_#047857]`}>
              {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </VerdictBanner>
  );

  return (
    <>
      <div className="relative space-y-2" data-mb-glance>
        {party.node}
        {cp.node}
        {prompt}
        {stage}
        {pads}
        {banner}
        {!free && <p className="text-center text-xs font-bold text-slate-600" data-mb-score data-clean={lab.clean}>{k('score.label')}: <bdi dir="ltr">{lab.clean}</bdi>{signs && <span> · {k('streak', { n: lab.streak, m: lab.tasks.length })}</span>}</p>}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ Le verdict ══════════════ */

function verdictOf(lab, k, all) {
  const free = L.isFree(lab);
  const last = lab.last;
  const note = free ? ` ${k('v.freeNote')}` : '';
  if (last?.kind === 'refused') {
    const r = last.reason;
    if (r === 'sign') {
      const w = L.whyOf(last.step);
      const col = (big) => k(`bars.${big ? 'blue' : 'red'}`);
      if (w.type === 'prod') return { text: k('refuse.signProd', { n: w.negatives }) + note, tone: 'amber', code: 'sign' };
      const D = w.den;
      const abs = (x) => (x < 0n ? -x : x);
      const A = M(`\\frac{${abs((w.a.n * BigInt(D)) / w.a.d)}}{${D}}`); const B = M(`\\frac{${abs((w.b.n * BigInt(D)) / w.b.d)}}{${D}}`);
      if (w.same) return { text: k('refuse.signSumSame', { den: D, a: A, b: B }) + note, tone: 'amber', code: 'sign' };
      if (w.bigger === 'tie') return { text: k('refuse.signSumTie') + note, tone: 'amber', code: 'sign' };
      const bigNode = w.bigger === 'a' ? w.a : w.b;
      return { text: k('refuse.signSumOpposite', { big: col(bigNode.n > 0n), den: D, a: w.bigger === 'a' ? A : B, b: w.bigger === 'a' ? B : A }) + note, tone: 'amber', code: 'sign' };
    }
    if (r === 'magnet') {
      const pairIds = last.pair ?? [];
      const md = all.find((l) => (l.op === '×' || l.op === '÷') && l.left && l.right && (pairIds.includes(l.left.id) || pairIds.includes(l.right.id)) && !(pairIds.includes(l.left.id) && pairIds.includes(l.right.id)));
      const bound = md ? (pairIds.includes(md.left.id) ? md.left : md.right) : null;
      return { text: (bound ? k('refuse.magnet', { a: M(tileTex(bound)) }) : k('refuse.magnetPlain')) + note, tone: 'amber', code: 'magnet' };
    }
    return { text: k(`refuse.${r}`) + note, tone: 'amber', code: r };
  }
  if (last?.kind === 'merge') {
    const s = last.step;
    const fin = L.finished(lab);
    const base = k(s.op === '÷' ? 'v.mergedDiv' : 'v.merged', { trail: M(s.trail) });
    return { text: `${fin ? `${k('v.solved', { r: M(ratTexStd(s.result)) })} ` : ''}${fin ? '' : base}${note}`.trim(), tone: fin ? 'emerald' : 'indigo', code: fin ? 'solved' : 'merged' };
  }
  if (last?.kind === 'flipped') {
    return { text: `${last.back ? '' : flipNote(lab, last.tile, k)}`.trim() || k('idle.sign'), tone: 'indigo', code: 'flipped' };
  }
  if (L.taskDone(lab)) return { text: k('idle.done'), tone: 'emerald', code: 'solved' };
  const l = L.selectedLink(lab);
  if (l) {
    if (l.op === '÷' && !l.right.flip && !L.isSigns(lab)) return { text: k('idle.flip'), tone: 'indigo', code: 'flip' };
    return { text: k('idle.sign'), tone: 'indigo', code: 'sign' };
  }
  return { text: free ? k('idle.free') : L.isSigns(lab) ? k('idle.pairSigns') : k('idle.pair'), tone: 'indigo', code: '' };
}
function flipNote(lab, id, k) {
  const l = chainLinks(lab.root).find((x) => x.right?.id === id);
  if (!l) return '';
  const n = l.right;
  const orig = n.w.includes('/') ? tileTex({ ...n, flip: false, merged: false }) : n.w;
  const rec = tileValue(n);
  const recTex = ratTexStd(rec);
  const neg = rec.n < 0n;
  const eq = `${neg ? '\\left(' : ''}${orig}${neg ? '\\right)' : ''}\\times${neg ? '\\left(' : ''}${recTex}${neg ? '\\right)' : ''}=1`;
  return k('flip.check', { w: M(orig), r: M(recTex), eq: M(eq) });
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [text, setText] = useState('');
  const [bad, setBad] = useState(null);
  const add = () => {
    const v = L.validateFree(text);
    if (!v.ok) { setBad(v.why === 'empty' ? null : v.why); return; }
    setBad(null); setLab((s) => L.setFree(s, v.text)); setText('');
  };
  const onKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } };
  return (
    <LabCard className="space-y-2 border-violet-200 bg-violet-50/50 p-3" data-mb-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-indigo-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
        <label className="flex flex-col gap-1 text-xs font-black text-indigo-950">
          <span>{k('free.chain')}</span>
          <input type="text" inputMode="text" autoComplete="off" dir="ltr" value={text} onChange={(e) => setText(L.latin(e.target.value).slice(0, 40))} onKeyDown={onKey}
            aria-label={k('free.aria')} aria-invalid={!!bad} data-mb-free-input placeholder="-3/4 + 5/6 × (1/2 - 1/3)"
            className={`h-11 w-72 max-w-full rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-violet-300'} bg-white px-2 text-start text-lg font-black tabular-nums text-indigo-950 ${ring}`} />
        </label>
        <button type="button" onClick={add} data-mb-free-add className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-violet-400 bg-white px-3 text-sm font-black text-indigo-900 ${ring}`}>
          <Plus className="h-4 w-4" aria-hidden="true" /> {k('free.add')}
        </button>
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-mb-free-back className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-violet-200 bg-white px-3 text-xs font-bold text-indigo-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
      {bad && <p role="alert" className="text-sm font-bold text-rose-700" data-mb-free-refusal={bad}>{k(`free.refusal.${bad}`)}</p>}
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

export function discoveryOptions(k) {
  return [
    { text: <MathText>{k('discovery.first')}</MathText>, why: <MathText>{k('discovery.whereFirst', { c1: M('-\\frac{5}{4}+\\frac{11}{6}') })}</MathText> },
    { text: <MathText>{k('discovery.right')}</MathText>, correct: true },
    { text: <MathText>{k('discovery.minus')}</MathText>, why: <MathText>{k('discovery.whereMinus', { c3: M('-\\frac{9}{8}\\div\\left(-\\frac{3}{4}\\right)') })}</MathText> },
  ];
}

export function Formal({ k }) {
  return (
    <div className="space-y-2 text-sm font-bold text-indigo-950" data-mb-formal>
      <p><MathText>{k('formal.sum', { eq: M('-\\frac{5}{4}+\\frac{11}{6}=-\\frac{15}{12}+\\frac{22}{12}=\\frac{7}{12}') })}</MathText></p>
      <p><MathText>{k('formal.prod', { eq: M('\\frac{7}{13}\\times\\left(-\\frac{8}{5}\\right)=-\\frac{7\\times8}{13\\times5}=-\\frac{56}{65}') })}</MathText></p>
      <p><MathText>{k('formal.div', { eq: M('-\\frac{9}{8}\\div\\left(-\\frac{3}{4}\\right)=-\\frac{9}{8}\\times\\left(-\\frac{4}{3}\\right)=\\frac{3}{2}') })}</MathText></p>
      <p><MathText>{k('formal.order')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque tâche : elle interroge ce que l'élève vient de FAIRE ; c3 finit par la règle (l'ancienne découverte). */
export const CHAINS = Object.freeze({
  c1: ['commonDen', 'toDen'],
  c2: ['prodSign', 'prodDen'],
  c3: ['simplify', 'rule'],
  c4: ['divResult', 'lastDen'],
  a1: ['finalSign', 'finalAbs'],
  a2: ['finalSign', 'finalAbs'],
  a3: ['finalSign', 'finalAbs'],
  a4: ['finalSign', 'finalAbs'],
  s6: ['signSum', 'signProd'],
});

const Q = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const at = (list, i) => { const [first, ...rest] = list; const out = [...rest]; out.splice(Math.min(i, out.length), 0, first); return out; };
const rt = (x) => M(ratTexStd(x));
const absB = (x) => (x < 0n ? -x : x);
const numTxt = (x) => <MathText>{M(String(x))}</MathText>;
const stepsOf = (task) => evaluateChain(task.chain).steps;
const stepOfId = (lab, id) => lab.tasks.find((t) => t.id === id);

/** Chaque question est construite sur LES nombres de la tâche (rien n'est écrit en dur) ; `k` : les textes de `mergeBoard`. */
export const QUESTIONS = {
  commonDen: (lab, task, k) => {
    const st = stepsOf(task)[0];
    const o = { a: rt(st.a), b: rt(st.b), da: M(String(st.a.d)), db: M(String(st.b.d)), D: M(String(st.den)) };
    return {
      id: 'commonDen', kind: 'number', expected: String(st.den), answer: numTxt(st.den),
      prompt: Q(k, 'commonDen.prompt', o),
      hints: [Q(k, 'commonDen.hint1', o), Q(k, 'commonDen.hint2', o)],
      explain: Q(k, 'commonDen.explain', o),
    };
  },
  toDen: (lab, task, k) => {
    const st = stepsOf(task)[0];
    const big = absB((st.a.n * BigInt(st.den)) / st.a.d);
    const o = { a: rt(st.a), D: M(String(st.den)), da: M(String(st.a.d)), f: M(String(BigInt(st.den) / st.a.d)), n: M(String(big)), calc: M(`${rt(st.a).slice(1, -1)}=\\frac{${st.a.n < 0n ? '-' : ''}${big}}{${st.den}}`) };
    return {
      id: 'toDen', kind: 'number', expected: String(big), answer: numTxt(big),
      prompt: Q(k, 'toDen.prompt', o),
      hints: [Q(k, 'toDen.hint1', o), Q(k, 'toDen.hint2', o)],
      explain: Q(k, 'toDen.explain', o),
    };
  },
  prodSign: (lab, task, k) => {
    const st = stepsOf(task)[0];
    const o = { a: rt(st.a), b: rt(st.b), r: rt(st.result) };
    return {
      id: 'prodSign', kind: 'choice',
      prompt: Q(k, 'prodSign.prompt', o),
      options: at([
        { text: Q(k, 'prodSign.right'), correct: true },
        { text: Q(k, 'prodSign.first'), why: Q(k, 'prodSign.whyFirst', o) },
        { text: Q(k, 'prodSign.always'), why: Q(k, 'prodSign.whyAlways', o) },
      ], 1),
      hints: [Q(k, 'prodSign.hint1', o), Q(k, 'prodSign.hint2', o)],
      explain: Q(k, 'prodSign.explain', o),
    };
  },
  prodDen: (lab, task, k) => {
    const st = stepsOf(task)[0];
    const o = { a: rt(st.a), b: rt(st.b), r: rt(st.result) };
    return {
      id: 'prodDen', kind: 'number', expected: String(st.result.d), answer: numTxt(st.result.d),
      prompt: Q(k, 'prodDen.prompt', o),
      hints: [Q(k, 'prodDen.hint1', o), Q(k, 'prodDen.hint2', o)],
      explain: Q(k, 'prodDen.explain', o),
    };
  },
  simplify: (lab, task, k) => {
    const st = stepsOf(task)[0];
    const o = { a: rt(st.a), b: rt(st.b), r: rt(st.result), m: rt({ n: st.b.n < 0n ? -st.b.d : st.b.d, d: absB(st.b.n) }) };
    return {
      id: 'simplify', kind: 'number', expected: String(absB(st.result.n)), answer: numTxt(absB(st.result.n)),
      prompt: Q(k, 'simplify.prompt', o),
      hints: [Q(k, 'simplify.hint1', o), Q(k, 'simplify.hint2', o)],
      explain: Q(k, 'simplify.explain', o),
    };
  },
  rule: (lab, task, k) => ({
    id: 'rule', kind: 'choice',
    prompt: <MathText>{k('discovery.prompt')}</MathText>,
    options: discoveryOptions(k),
    hints: [Q(k, 'rule.hint1'), Q(k, 'rule.hint2')],
    explain: <Formal k={k} />,
  }),
  divResult: (lab, task, k) => {
    const st = stepsOf(task).find((x) => x.op === '÷') ?? stepsOf(task)[0];
    const o = { a: rt(st.a), b: rt(st.b), r: rt(st.result) };
    return {
      id: 'divResult', kind: 'number', expected: String(absB(st.result.n)), answer: numTxt(absB(st.result.n)),
      prompt: Q(k, 'divResult.prompt', o),
      hints: [Q(k, 'divResult.hint1', o), Q(k, 'divResult.hint2', o)],
      explain: Q(k, 'divResult.explain', o),
    };
  },
  lastDen: (lab, task, k) => {
    const sts = stepsOf(task);
    const st = sts[sts.length - 1];
    const o = { a: rt(st.a), b: rt(st.b), D: M(String(st.den)) };
    return {
      id: 'lastDen', kind: 'number', expected: String(st.den), answer: numTxt(st.den),
      prompt: Q(k, 'lastDen.prompt', o),
      hints: [Q(k, 'lastDen.hint1', o), Q(k, 'lastDen.hint2', o)],
      explain: Q(k, 'lastDen.explain', o),
    };
  },
  finalSign: (lab, task, k) => {
    const v = evaluateChain(task.chain).value;
    const sg = v.n > 0n ? 'pos' : v.n < 0n ? 'neg' : 'zero';
    const label = (x) => k(`cp.finalSign.${x}`);
    const o = { r: rt(v) };
    return {
      id: 'finalSign', kind: 'choice', cols: 3,
      prompt: Q(k, 'finalSign.prompt', { chain: M(L.chainTex(task.root)) }),
      options: at([
        { text: Q(k, `finalSign.${sg}`), correct: true },
        ...['pos', 'neg', 'zero'].filter((x) => x !== sg).map((x) => ({ text: Q(k, `finalSign.${x}`), why: Q(k, 'finalSign.why', { s: label(x) }) })),
      ], task.id === 'a1' ? 0 : task.id === 'a2' ? 1 : 2),
      hints: [Q(k, 'finalSign.hint1'), Q(k, 'finalSign.hint2')],
      explain: Q(k, 'finalSign.explain', { ...o, s: label(sg) }),
    };
  },
  finalAbs: (lab, task, k) => {
    const v = evaluateChain(task.chain).value;
    const o = { r: rt(v) };
    return {
      id: 'finalAbs', kind: 'number', expected: String(absB(v.n)), answer: numTxt(absB(v.n)),
      prompt: Q(k, 'finalAbs.prompt', { chain: M(L.chainTex(task.root)) }),
      hints: [Q(k, 'finalAbs.hint1'), Q(k, 'finalAbs.hint2')],
      explain: Q(k, 'finalAbs.explain', o),
    };
  },
  signSum: (lab, task, k) => {
    const t5 = stepOfId(lab, 's5') ?? task;
    const st = stepsOf(t5)[0];
    const N = BigInt(st.den);
    const fr = (x) => M(`\\frac{${absB(x.n * (N / x.d))}}{${N}}`);
    const o = { a: rt(st.a), b: rt(st.b), r: rt(st.result), N: M(String(N)), fa: fr(st.a), fb: fr(st.b) };
    return {
      id: 'signSum', kind: 'choice',
      prompt: Q(k, 'signSum.prompt', o),
      options: at([
        { text: Q(k, 'signSum.right', o), correct: true },
        { text: Q(k, 'signSum.always'), why: Q(k, 'signSum.whyAlways', o) },
        { text: Q(k, 'signSum.den', o), why: Q(k, 'signSum.whyDen', o) },
      ], 2),
      hints: [Q(k, 'signSum.hint1', o), Q(k, 'signSum.hint2', o)],
      explain: Q(k, 'signSum.explain', o),
    };
  },
  signProd: (lab, task, k) => {
    const st = stepsOf(task)[0];
    const t2 = stepOfId(lab, 's2');
    const s2 = t2 ? stepsOf(t2)[0] : st;
    const o = { a: rt(st.a), b: rt(st.b), r: rt(st.result), a2: rt(s2.a), b2: rt(s2.b), r2: rt(s2.result) };
    return {
      id: 'signProd', kind: 'choice',
      prompt: Q(k, 'signProd.prompt', o),
      options: at([
        { text: Q(k, 'signProd.right'), correct: true },
        { text: Q(k, 'signProd.always'), why: Q(k, 'signProd.whyAlways', o) },
        { text: Q(k, 'signProd.whole'), why: Q(k, 'signProd.whyWhole', o) },
      ], 0),
      hints: [Q(k, 'signProd.hint1', o), Q(k, 'signProd.hint2', o)],
      explain: Q(k, 'signProd.explain', o),
    };
  },
};
