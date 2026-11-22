import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2 } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import MathText from '../../components/MathText';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { LabCard, StageFrame, PromptCard, VerdictBanner, StepperCard, ChoiceTray, ChoiceCard, RoundButton } from '../primitives/LabKit';
import { SvgPill } from '../primitives/SvgPill';
import KidFigure from '../primitives/KidFigure';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { boardGeometry } from './signMachine/geometry';
import { LEVELS } from '../levels';
import * as L from '../logic/signMachine';

/**
 * sign-machine — LE SECOND FACTEUR SOUS LA MAIN (3AM, unité 1 « الأعداد النسبية », درس « جداء عددين نسبيين », module 2 معارف, 2026-10-27).
 * La logique, exacte, est dans `logic/signMachine.js` ; la géométrie du tableau dans `signMachine/geometry.js`.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tient b, le second facteur : un curseur sur un rail sous le tableau (−4 … 4), −/+ et les flèches ; en متقدم elle tient AUSSI
 *    le premier facteur a (موجب / سالب et −/+ de sa distance) dans la mission « بطريقتين ».
 * B. Le monde : la machine à multiplier du نادي الرياضيات ; chaque b visité ALLUME sa colonne a × b au-dessus ou au-dessous de la ligne 0,
 *    et les colonnes allumées restent — le tableau des جداءات se construit sous la main ; entre deux colonnes voisines une MARCHE (un palier
 *    depuis le bout de la barre b, une contremarche fléchée jusqu'au bout de la barre b − 1) porte l'écart (« +3 ») : de 0 à 3, de 3 à 6…
 *    les marches restent les mêmes de l'autre côté de 0.
 * C. La résistance : le côté négatif de b est VERROUILLÉ (« ؟ ») tant que la prédiction n'est pas faite ; une carte fausse ne montre pas
 *    la réponse, elle renvoie au tableau ; une colonne qui n'est pas la bonne est refusée avec son produit.
 * D. La phase formelle écrit ce que l'élève a vu : les colonnes 4 et −4 sont symétriques autour de la ligne 0, leur somme est a × 0 = 0.
 * E. Les fausses conjectures (« après 0 le produit redescend », « il reste négatif ») sont réfutées avec SES colonnes.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        a × b quand b traverse 0 : l'écart reste −a, donc (−) × (−) = (+) ; changer le signe d'un facteur renverse le produit
 *   OBJECT         la machine du club : un cadran (a), un tableau lumineux de neuf colonnes autour d'une ligne 0, un rail (b)
 *   VARIABLE       b, le second facteur (et, en متقدم, le signe et la distance de a)
 *   INVARIANT      l'écart entre deux colonnes voisines (−a) ; a × 0 = 0
 *   TRANSFORMATION déplacer b : sa colonne s'allume ; retourner a : le tableau entier se renverse autour de la ligne 0
 *   CONSTRAINT     −4 ≤ b ≤ 4, |a| ≤ 4 ⇒ |a × b| ≤ 16 ; le côté négatif fermé avant la prédiction
 *   RESISTANCE     le verrou « ؟ » ; une carte fausse renvoie au tableau ; une colonne fausse montre son produit
 *   EVIDENCE       les barres à l'échelle, la ligne des bouts, les pastilles « +3 », le calcul de la colonne tenue
 *   CONTRAST       (−3) × 1 = −3 / (−3) × (−1) = 3 ; a = 4 / a = −4 (le tableau renversé)
 *   PREDICTION     (−3) × (−1) en مبتدئ (après m1) ; (−4) × (−2) en متقدم (avant tout geste)
 *   DISCOVERY      « que fait le produit après 0 ? » (il continue au même pas)
 *   FORMALIZATION  a × 4 + a × (−4) = a × 0 = 0 avec les colonnes de l'élève
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les questions du module
 *
 * « جرّب كل الإمكانيات » : NON (chaque b lâché EST l'essai). « جرّب أعدادك » est TOUJOURS ouvert sous le labo.
 * ONBOARDING : `coachOf` (cards · grab · sign · try · next) montre le contrôle, jamais le nombre.
 *
 * QUESTIONS PENDANT LE LABO (déploiement lot 1, 2026-10-28, `primitives/LabCheckpoint`) : `checkpoints` (défaut true). Après CHAQUE mission,
 * une suite de questions sur ce que l'élève vient de FAIRE se pose par-dessus le labo et retient « التالي » (`chainsOf`) : le pas entre deux
 * colonnes et la colonne 0 (remplir), pourquoi le produit passe de l'autre côté et la colonne suivante (prédire), la colonne trouvée, ce
 * qu'a fait le retournement de a (بطريقتين), et LA RÈGLE (l'ancienne découverte, qui formalise) à la dernière mission. Une réponse signée est
 * un CHOIX (le champ numérique ne lit pas « − »). Obligatoires pour tout élève ; l'enseignant seul les coupe pour SON compte. Questions
 * actives → `guided` (ni « جرّب › اكتشف › صِغ » ni « تلميح »). ÉTAPES : `LabStepper` (`[data-sm-step=<i>]`) et la fête par mission.
 * « إعادة » repart de la mission 1 ; « أعِد التجربة » remet LA MÊME mission (`L.retryTask`). SON : `tooth` à chaque colonne parcourue
 * (plus grave en descendant), `bell` quand une colonne s'allume pour la première fois, `flag` à la mission réussie, `over` à une colonne refusée.
 * Props : `tasks`, `a`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({})` — par `state.report`.
 *
 * CONTRAT DOM : [data-sign-machine][data-task][data-solved][data-layout], [data-sm-glance], [data-sm-stage], [data-sm-board],
 * [data-sm-col=<b>][data-lit][data-locked][data-product], [data-sm-bar=<b>], [data-sm-pill=<b>], [data-sm-gap=<b>][data-diff] (la marche d'écart),
 * [data-sm-rail], [data-sm-knob][data-b] (role slider), [data-sm-stepper], [data-sm-less], [data-sm-more], [data-sm-b], [data-sm-factor][data-a],
 * [data-sm-a], [data-sm-pos], [data-sm-neg], [data-sm-a-less], [data-sm-a-more], [data-sm-cards], [data-sm-card=<v>], [data-sm-verdict=right|wrong|part|free|look|''],
 * [data-sm-prompt][data-lit], [data-sm-context], [data-sm-next], [data-sm-step=<i>][data-done], [data-sm-free][data-active], [data-sm-free-a],
 * [data-sm-free-back], [data-sm-calc], [data-sm-formal], [data-sm-kid][data-mood].
 */
const NS = 'manipulation.signMachine';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const minus = (v) => String(v).replace(/-/g, '−');
const WIDE_MIN = 700;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const FONT = 'ui-sans-serif, system-ui, sans-serif';

const CSS = `
[data-sm-bar] { transition: y 240ms ease-out, height 240ms ease-out; }
@keyframes sm-glow { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.55; } }
.sm-glow { animation: sm-glow 1.6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { [data-sm-bar] { transition: none !important; } .sm-glow { animation: none !important; } }
`;

/** Les nombres de départ : ceux de la leçon, sinon ceux du niveau. */
export function numbersFor({ tasks, a, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['sign-machine'][lv].numbers;
  return { a: a ?? asked.a, tasks: tasks ?? asked.tasks };
}

/** « (−3) » en LaTeX : un facteur négatif entre parenthèses. */
const tex = (v) => (v < 0 ? `(${v})` : `${v}`);
/** « (−3) × (−1) » : un facteur négatif entre parenthèses. */
const factor = (v) => (v < 0 ? `(${minus(v)})` : minus(v));
export const calcText = (a, b) => `${factor(a)} × ${factor(b)} = ${minus(L.productOf(a, b))}`;

export default function SignMachine({
  tasks, a, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, a, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'sign-machine', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la mission 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const ready = L.discoveryReady(lab);
  // les questions pendant le labo : la suite de la mission courante ; celle qui finit par la règle remplace la découverte automatique
  const cpSettings = useLabCheckpointSettings('sign-machine');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpChains = cpOn && cpSettings.enabled ? chainsOf(lab) : null;
  const cur = L.taskOf(lab);
  const chain = cpChains && !L.isFree(lab) ? cpChains[cur.id] ?? null : null;
  const ruleByCheckpoint = !!cpChains && Object.values(cpChains).some((c) => c.includes('rule'));
  const cp = useLabCheckpoint({
    id: chain ? cur.id : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, cur, k)) : null,
    reached: !L.isFree(lab) && L.taskDone(lab),
    resetKey: scene.inits,
    onRetry: () => setLab(L.retryTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (cpChains?.[id]?.includes('rule')) { state.discover(); state.formalize(); } },
  });
  useEffect(() => { if (ready && !ruleByCheckpoint) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son (muet sans « الصوت ») : un tic par colonne parcourue, une cloche pour une colonne neuve, puis le jugement de la mission
  const sfx = useRef({ b: lab.b, at: 0, last: lab.last, lit: Object.keys(lab.lit).length });
  useEffect(() => {
    const p = sfx.current;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const nLit = Object.keys(lab.lit).length;
    if (nLit > p.lit) playSfx('bell');
    else if (lab.b !== p.b && now - p.at > 35) { playSfx('tooth', { pitch: lab.b > p.b ? 1 : 0.75 }); p.at = now; }
    p.b = lab.b; p.lit = nLit;
    const v = lab.last;
    if (v && v !== p.last && !v.free && !v.look) {
      if (v.ok) playSfx('flag');
      else if (L.taskOf(lab).kind !== 'fill') playSfx('over');
    }
    p.last = v;
  }, [lab.b, lab.lit, lab.last]); // eslint-disable-line react-hooks/exhaustive-deps
  const finishedOnce = useRef(false);
  useEffect(() => {
    if (!ready) { finishedOnce.current = false; return; }
    if (!finishedOnce.current) { finishedOnce.current = true; state.report(onFinished, {}); }
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const reported = useRef(0);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials < reported.current) reported.current = 0;
    for (let i = reported.current; i < nTrials; i += 1) state.report(onTrial, L.trialEvidence(lab.trials[i]));
    reported.current = nTrials;
  }, [nTrials, lab.trials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── onboarding ── */
  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'sign-machine', step: coachStep,
    text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });

  /* ── mesure ── */
  const boxRef = useRef(null);
  const [width, setWidth] = useState(720);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => setWidth(Math.max(300, Math.floor(el.clientWidth)));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const discovery = (
    <ManipulationDiscovery state={state} prompt={<MathText>{k('discovery.prompt')}</MathText>}
      options={discoveryOptions(lab, k)} formal={<Formal lab={lab} k={k} />} />
  );

  return (
    <ManipulationShell
      headerAction={cpSettings.control}
      type="sign-machine"
      title={title ?? k('title')}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      guided={!!chain || ruleByCheckpoint}
      coach={coachOn ? coach : null}
      hints={[0, 1, 2].map((i) => k(`hints.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={discovery}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-violet-50/50 to-white">
        <div ref={boxRef} className="space-y-2" data-sign-machine data-task={lab.ti} data-solved={ready ? 'true' : 'false'} data-layout={width >= WIDE_MIN ? 'wide' : 'narrow'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} lead={state.isAuthoredLevel ? lead : null} cp={cp} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, lead, cp }) {
  const uid = `sm${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const wide = width >= WIDE_MIN;
  const a = L.aOf(lab);
  const b = L.bOf(lab);
  const last = lab.last;
  const done = L.taskDone(lab);
  const cards = L.cardsOpen(lab);
  const onTarget = !free && !!last && last.ok;

  /* ── la consigne ── */
  const context = free ? k('context.free') : (lead || k(task.kind === 'both' ? 'context.both' : 'context.machine'));
  const question = (() => {
    if (free) return k('question.free');
    if (task.kind === 'fill') return k('question.fill', { from: iso(minus(task.from)), to: iso(minus(task.to)) });
    if (task.kind === 'predict') return <MathText>{k('question.predict', { calc: `$${tex(task.a)} \\times ${tex(task.b)}$` })}</MathText>;
    if (task.kind === 'both') return k('question.both', { goal: iso(minus(task.product)) });
    return k('question.reach', { goal: iso(minus(task.product)) });
  })();
  // une étape est FAITE quand la mission est réussie ET que ses questions (LabCheckpoint) sont répondues : la pastille passe au vert et on fête
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-sm-step" />
  );
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // L.init (« إعادة », autre niveau) : on refête
  const nowDone = !free && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps
  const lit = !free && done;
  const prompt = (
    <PromptCard size={wide ? 'lg' : 'md'} aside={steps || null} context={context} contextProps={{ 'data-sm-context': free ? 'free' : task.kind }}
      title={question} titleClassName={wide ? 'text-xl' : 'text-lg'} lamp={free ? null : lit ? 'on' : 'off'}
      titleProps={{ 'data-sm-prompt': free ? 'free' : task.kind, 'data-lit': lit ? 'true' : 'false' }} />
  );

  /* ── le tableau ── */
  const colW = wide ? Math.min(320, Math.max(250, Math.round(width * 0.33))) : width;
  const boardW = wide ? Math.max(360, width - colW - 14) : width;
  const scaleMax = free || lab.advanced ? 16 : 12;
  const g = boardGeometry({ width: boardW - 16, scaleMax, half: wide ? 96 : width < 520 ? 60 : 72 });
  const pair = !wide && width >= 520; // carte du facteur et −/+ côte à côte : le labo tient dans l'écran (DNA §17.5)
  const mood = !last ? 'neutral' : onTarget ? 'proud' : last.kind === 'predict' && !last.ok ? 'wonder' : 'neutral';
  const board = (
    <Board uid={uid} g={g} lab={lab} a={a} b={b} k={k}
      onPreview={(v) => setLab((s) => L.preview(s, v))} onRelease={(v) => setLab((s) => L.release(s, v))} disabled={cards} />
  );

  /* ── les commandes ── */
  const aEdit = L.aEditable(lab);
  const factorCard = (
    <FactorCard a={a} k={k} mood={mood}>
      {aEdit && (
        <div className="space-y-1.5" data-sm-a>
          <div className="grid grid-cols-2 gap-1.5">
            <ChoiceCard size="sm" state={a > 0 ? 'selected' : 'idle'} aria-pressed={a > 0} onClick={() => setLab((s) => (s.a > 0 ? s : L.flipSign(s)))} data-sm-pos>
              {k('positive')}
            </ChoiceCard>
            <ChoiceCard size="sm" state={a < 0 ? 'selected' : 'idle'} aria-pressed={a < 0} onClick={() => setLab((s) => (s.a < 0 ? s : L.flipSign(s)))} data-sm-neg>
              {k('negative')}
            </ChoiceCard>
          </div>
          <div className="flex items-center justify-center gap-2" dir="ltr">
            <RoundButton size={40} onClick={() => setLab((s) => L.setA(s, Math.sign(s.a) * Math.max(1, Math.abs(s.a) - 1)))} aria-label={k('aLess')} data-sm-a-less disabled={Math.abs(a) <= 1}>−</RoundButton>
            <span className="min-w-[4.5rem] text-center text-xs font-black text-violet-900/70">{k('aDistance')}</span>
            <RoundButton primary size={40} onClick={() => setLab((s) => L.setA(s, Math.sign(s.a || 1) * Math.min(4, Math.abs(s.a) + 1)))} aria-label={k('aMore')} data-sm-a-more disabled={Math.abs(a) >= 4}>+</RoundButton>
          </div>
        </div>
      )}
    </FactorCard>
  );

  const predictCards = cards && (
    <LabCard className="space-y-1.5 p-2" data-sm-cards>
      <p className="text-center text-[12px] font-black text-indigo-950">{k('cardsTitle')}</p>
      <ChoiceTray cols={wide ? 2 : 4}>
        {task.options.map((o) => {
          const tried = lab.trials.some((x) => x.kind === 'predict' && x.task === lab.ti && x.pick === o && !x.ok);
          return (
            <ChoiceCard key={o} size="md" ltr state={tried ? 'tried' : 'idle'} onClick={() => setLab((s) => L.choose(s, o))} data-sm-card={o}>
              {minus(o)}
            </ChoiceCard>
          );
        })}
      </ChoiceTray>
    </LabCard>
  );

  const [lo, hi] = [L.minB(lab), L.RANGE_B[1]];
  const stepper = !cards && (
    <div data-sm-stepper>
      <StepperCard layout="row" value={minus(b)} unit={null}
        onLess={() => setLab((s) => L.step(s, -1))} onMore={() => setLab((s) => L.step(s, 1))}
        lessDisabled={b <= lo} moreDisabled={b >= hi}
        lessLabel={k('less')} moreLabel={k('more')}
        lessProps={{ 'data-sm-less': '' }} moreProps={{ 'data-sm-more': '' }} readoutProps={{ 'data-sm-b': b }}>
        <span className="sr-only">{k('stepperSr')}</span>
      </StepperCard>
    </div>
  );

  /* ── le verdict ── */
  const verdictLine = (() => {
    if (!last) return cards ? k('idle.predict') : k('idle.move');
    if (last.free) return k('v.free');
    if (last.look) return k('v.look');
    if (last.kind === 'predict') return last.ok ? k('v.predictRight') : k('v.predictWrong', { pick: iso(minus(last.pick)) });
    if (task.kind === 'fill') {
      const left = L.COLUMNS.filter((x) => x <= task.from && x >= task.to && !lab.lit[x]).length;
      return done ? k('v.fillDone') : k('v.fill', { n: left });
    }
    if (last.ok) {
      if (task.kind === 'both' && !done) return k('v.part', { other: k(last.a > 0 ? 'negative' : 'positive') });
      return k('v.right');
    }
    return k('v.wrong', { goal: iso(minus(task.product)) });
  })();
  const vkey = !last ? '' : last.free ? 'free' : last.look ? 'look' : last.ok ? (task.kind === 'both' && !done ? 'part' : 'right') : (task.kind === 'fill' ? 'part' : 'wrong');
  const tone = !last || last.look ? 'indigo' : last.ok && !last.free ? 'emerald' : 'amber';
  const Icon = !last || last.look ? Hand : last.ok && !last.free ? CheckCircle2 : Sparkles;
  const canNext = L.canNext(lab) && !cp.blocking;
  // le calcul de la colonne tenue, sur sa propre ligne LTR — jamais celui d'une carte fausse (la réponse)
  const showCalc = !!last && !(last.kind === 'predict' && !last.ok);
  const banner = (
    <VerdictBanner tone={tone} icon={Icon} size="sm" className="min-h-[3.5rem]" data-sm-verdict={vkey}>
      <div className="min-w-0 space-y-1.5">
        {showCalc && (
          <p className="text-lg font-black text-indigo-950" data-sm-calc aria-label={k('calcAria')}>
            <bdi dir="ltr">{calcText(last.a, last.b)}</bdi>
          </p>
        )}
        <p className={last ? '' : 'font-bold text-indigo-900'}>{verdictLine}</p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-sm-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );

  const controls = (
    <div className="flex min-w-0 flex-col gap-2" style={wide ? { width: colW } : undefined}>
      {pair ? <div className="grid grid-cols-2 items-stretch gap-2">{factorCard}{stepper || predictCards}</div> : factorCard}
      {(!pair || stepper) && predictCards}
      {!pair && stepper}
      {banner}
    </div>
  );

  return (
    <>
      <div className="relative space-y-2.5" data-sm-glance>
        {party.node}
        {cp.node}
        {prompt}
        <div className={wide ? 'flex items-start justify-center gap-3' : 'space-y-2'}>
          <StageFrame className="shrink-0 overflow-hidden p-1.5" data-sm-stage style={wide ? { width: boardW } : undefined}>{board}</StageFrame>
          {controls}
        </div>
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ Le premier facteur : une carte à part, grande et SIGNÉE ══════════════ */

function FactorCard({ a, k, mood, children }) {
  const sign = a > 0 ? 'pos' : a < 0 ? 'neg' : 'zero';
  const tone = sign === 'neg' ? 'border-rose-200 bg-rose-50 text-rose-900' : sign === 'pos' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-700';
  return (
    <LabCard className={`space-y-2 border-2 px-2.5 py-1.5 ${tone}`} data-sm-factor data-a={a}>
      <div className="flex items-center gap-3">
        <svg width={30} height={46} viewBox="0 0 34 52" aria-hidden="true" className="shrink-0" data-sm-kid data-mood={mood}>
          <KidFigure cx={17} top={2} foot={50} hairStyle="hijab" scarf="lavender" outfit="violet" skin="medium" mood={mood} />
        </svg>
        <Dial a={a} />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[11px] font-black opacity-70">{k('factorLabel')}</p>
          <bdi dir="ltr" className="text-3xl font-black leading-none tabular-nums" data-sm-a-value={a}>{minus(a)}</bdi>
        </div>
      </div>
      {children}
    </LabCard>
  );
}

/** Le cadran de la machine : une aiguille vers le côté du signe de a (gauche = négatif, droite = positif), d'autant plus penchée que |a| est grand. */
function Dial({ a }) {
  const rad = ((a / 4) * 70 - 90) * (Math.PI / 180);
  const cx = 26; const cy = 30; const r = 20;
  const col = a < 0 ? '#E11D48' : a > 0 ? '#059669' : '#64748B';
  return (
    <svg width={52} height={40} viewBox="0 0 52 40" aria-hidden="true" className="shrink-0">
      <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={8} />
      <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx} ${cy - r}`} fill="none" stroke="#FDA4AF" strokeWidth={4} />
      <path d={`M${cx} ${cy - r} A${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#6EE7B7" strokeWidth={4} />
      <line x1={cx} y1={cy} x2={cx + Math.cos(rad) * (r - 3)} y2={cy + Math.sin(rad) * (r - 3)} stroke={col} strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={4.5} fill={col} />
    </svg>
  );
}

/* ══════════════ Le tableau lumineux et son rail ══════════════ */

function Board({ uid, g, lab, a, b, k, onPreview, onRelease, disabled }) {
  const svgRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    const measure = () => { const w = el.getBoundingClientRect().width; if (w > 0) setScale(g.W / w); };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [g.W]);
  const toB = (e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    return rect ? g.bAt((e.clientX - rect.left) * scale) : b;
  };
  const down = (e) => { if (disabled) return; e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(true); onPreview(toB(e)); };
  const move = (e) => { if (drag) onPreview(toB(e)); };
  const up = (e) => { if (!drag) return; setDrag(false); onRelease(toB(e)); };
  const key = (e) => {
    if (disabled) return;
    const map = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    if (e.key in map) { e.preventDefault(); onRelease(b + map[e.key]); }
    if (e.key === 'Home') { e.preventDefault(); onRelease(-4); }
    if (e.key === 'End') { e.preventDefault(); onRelease(4); }
  };

  const litSet = new Set(L.litColumns(lab));
  const locked = L.negLocked(lab);
  const lockX = g.x(-1) + g.colW / 2;
  const pills = L.stepPills(lab);

  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${g.W} ${g.H}`} style={{ maxWidth: g.W, display: 'block', margin: '0 auto', touchAction: 'pan-y' }} dir="ltr"
      role="group" aria-label={k('boardAria', { a: minus(a) })} data-sm-board>
      <defs>
        <linearGradient id={`${uid}-pos`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#34D399" /><stop offset="1" stopColor="#059669" /></linearGradient>
        <linearGradient id={`${uid}-neg`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E11D48" /><stop offset="1" stopColor="#FB7185" /></linearGradient>
        <radialGradient id={`${uid}-kn`} cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor="#F5F3FF" /><stop offset="1" stopColor="#A78BFA" /></radialGradient>
      </defs>
      {/* le corps de la machine et son écran */}
      <rect x={2} y={4} width={g.W - 4} height={g.boardBottom - 2} rx={16} fill="#312E81" opacity={0.25} />
      <rect x={2} y={2} width={g.W - 4} height={g.boardBottom - 2} rx={16} fill="#1E1B4B" />
      <rect x={8} y={8} width={g.W - 16} height={g.boardBottom - 14} rx={12} fill="#0F172A" />
      <rect x={8} y={8} width={g.W - 16} height={g.y0 - 8} rx={12} fill="#10B981" opacity={0.08} />
      <rect x={8} y={g.y0} width={g.W - 16} height={g.boardBottom - 6 - g.y0} rx={12} fill="#F43F5E" opacity={0.08} />
      {[-12, -8, -4, 4, 8, 12].filter((p) => Math.abs(p) * g.unit <= g.half).map((p) => (
        <line key={p} x1={14} x2={g.W - 14} y1={g.yOf(p)} y2={g.yOf(p)} stroke="#334155" strokeWidth={1} strokeDasharray="2 6" />
      ))}
      {locked && <rect x={8} y={8} width={lockX - 8} height={g.boardBottom - 14} rx={12} fill="#020617" opacity={0.5} />}
      {/* les colonnes */}
      {L.COLUMNS.map((x) => {
        const isLit = litSet.has(x);
        const isLocked = locked && x < 0;
        const p = L.productOf(a, x);
        const cx = g.x(x);
        const yEnd = g.yOf(p);
        const top = Math.min(yEnd, g.y0);
        const h = Math.abs(yEnd - g.y0);
        const cur = x === b && !lab.free;
        return (
          <g key={x} data-sm-col={x} data-lit={isLit ? 'true' : 'false'} data-locked={isLocked ? 'true' : 'false'} data-product={isLit ? p : ''}>
            {cur && <rect className="sm-glow" x={cx - g.colW / 2 + 2} y={12} width={g.colW - 4} height={g.boardBottom - 22} rx={8} fill="#A78BFA" opacity={0.3} />}
            {!isLit && !isLocked && <rect x={cx - g.barW / 2} y={g.y0 - 26} width={g.barW} height={52} rx={6} fill="none" stroke="#475569" strokeWidth={1.5} strokeDasharray="4 4" />}
            {isLocked && (
              <g>
                <rect x={cx - g.barW / 2} y={g.y0 - 26} width={g.barW} height={52} rx={6} fill="#1E293B" stroke="#64748B" strokeWidth={1.5} />
                <text x={cx} y={g.y0 + 7} textAnchor="middle" fontSize={20} fontWeight={900} fill="#CBD5E1" fontFamily={FONT}>؟</text>
              </g>
            )}
            {isLit && h > 0 && (
              <rect data-sm-bar={x} x={cx - g.barW / 2} y={top} width={g.barW} height={h} rx={5} fill={`url(#${uid}-${p > 0 ? 'pos' : 'neg'})`} stroke={cur ? '#F5F3FF' : 'none'} strokeWidth={2} />
            )}
            {isLit && (p >= 0
              ? <SvgPill data-sm-pill={x} x={cx} y={yEnd - 3} text={minus(p)} size={12} pointer="down" fill={p > 0 ? '#047857' : '#475569'} />
              : <SvgPill data-sm-pill={x} x={cx} y={yEnd + 15} text={minus(p)} size={12} fill="#BE123C" />)}
          </g>
        );
      })}
      {/* la ligne 0 */}
      <line x1={10} x2={g.W - 10} y1={g.y0} y2={g.y0} stroke="#F8FAFC" strokeWidth={2.5} />
      <text x={14} y={g.y0 - 5} fontSize={11} fontWeight={900} fill="#E2E8F0" fontFamily={FONT}>0</text>
      {/* les marches d'écart : du bout de la colonne b au bout de la colonne b − 1 (le sens où la main descend), « +4 » à côté de la contremarche */}
      {pills.map((pl) => <GapArrow key={pl.from} g={g} a={a} pl={pl} />)}
      {/* le rail du second facteur */}
      <rect x={0} y={g.railY - 24} width={g.W} height={52} fill="transparent" style={{ cursor: disabled ? 'default' : drag ? 'grabbing' : 'pointer', touchAction: 'none' }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} data-sm-rail />
      <line x1={g.x(-4)} x2={g.x(4)} y1={g.railY} y2={g.railY} stroke="#DDD6FE" strokeWidth={6} strokeLinecap="round" pointerEvents="none" />
      {locked && <line x1={g.x(-4)} x2={g.x(-1)} y1={g.railY} y2={g.railY} stroke="#CBD5E1" strokeWidth={6} strokeLinecap="round" pointerEvents="none" />}
      <g pointerEvents="none">
        {L.COLUMNS.map((x) => (
          <g key={x}>
            <line x1={g.x(x)} x2={g.x(x)} y1={g.railY - 7} y2={g.railY + 7} stroke={x === 0 ? '#6D28D9' : '#A1A1AA'} strokeWidth={x === 0 ? 3 : 2} strokeLinecap="round" />
            <text x={g.x(x)} y={g.railY + 36} textAnchor="middle" fontSize={x === b ? 15 : 12} fontWeight={x === b ? 900 : 700} fill={x === b ? '#4C1D95' : locked && x < 0 ? '#CBD5E1' : '#64748B'}
              fontFamily={FONT} style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{minus(x)}</text>
          </g>
        ))}
      </g>
      <g role="slider" tabIndex={disabled ? -1 : 0} aria-label={k('knobAria')} aria-valuemin={L.minB(lab)} aria-valuemax={4} aria-valuenow={b} aria-valuetext={minus(b)} aria-orientation="horizontal"
        aria-disabled={disabled || undefined} onKeyDown={key} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        style={{ cursor: disabled ? 'default' : drag ? 'grabbing' : 'grab', touchAction: 'none', outline: 'none', opacity: disabled ? 0.45 : 1 }} data-sm-knob data-b={b}>
        <circle cx={g.x(b)} cy={g.railY + 2.5} r={19} fill="#1E1B4B" opacity={0.15} />
        <circle cx={g.x(b)} cy={g.railY} r={19} fill={`url(#${uid}-kn)`} stroke="#6D28D9" strokeWidth={drag ? 3.5 : 2.5} />
        <path d={`M${g.x(b) - 7} ${g.railY - 6} V${g.railY + 6} M${g.x(b)} ${g.railY - 8} V${g.railY + 8} M${g.x(b) + 7} ${g.railY - 6} V${g.railY + 6}`} stroke="#6D28D9" strokeWidth={2.4} strokeLinecap="round" />
      </g>
    </svg>
  );
}

/**
 * Une marche de l'escalier : la colonne `pl.to` (= from − 1) est la colonne `pl.from` PLUS l'écart. Un palier pointillé part du bout de la
 * barre `from` jusqu'au bord de la barre `to`, puis une contremarche fléchée monte (ou descend) jusqu'au bout de `to` ; l'écart signé
 * (« +4 ») est écrit à côté de la contremarche, dans l'intervalle entre les deux colonnes — « de 0 à 4, de 4 à 8 » se lit sur le dessin.
 */
function GapArrow({ g, a, pl }) {
  const yFrom = g.yOf(L.productOf(a, pl.from));
  const yTo = g.yOf(L.productOf(a, pl.to));
  const rx = g.x(pl.to) + g.barW / 2 + 3; // la contremarche, collée au bord droit de la colonne d'arrivée
  const tread = g.x(pl.from) - g.barW / 2;
  const dir = Math.sign(yTo - yFrom); // 1 : vers le bas, −1 : vers le haut, 0 : pas d'écart
  const head = Math.min(6, Math.abs(yTo - yFrom) / 2);
  const color = '#FBBF24';
  return (
    <g data-sm-gap={pl.from} data-diff={pl.diff} pointerEvents="none">
      <line x1={tread} y1={yFrom} x2={rx} y2={yFrom} stroke={color} strokeWidth={1.5} strokeDasharray="3 3" />
      {dir !== 0 && (
        <>
          <line x1={rx} y1={yFrom} x2={rx} y2={yTo - dir * head} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
          <path d={`M${rx} ${yTo} L${rx - 4} ${yTo - dir * head} L${rx + 4} ${yTo - dir * head} Z`} fill={color} />
        </>
      )}
      <text x={rx + 5} y={(yFrom + yTo) / 2 + 4} fontSize={12} fontWeight={900} fill={color} stroke="#0F172A" strokeWidth={3} paintOrder="stroke"
        fontFamily={FONT} style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{pl.diff > 0 ? `+${pl.diff}` : minus(pl.diff)}</text>
    </g>
  );
}

/* ══════════════ « جرّب أعدادك أنت » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [text, setText] = useState('');
  useEffect(() => { if (!lab.free) setText(''); }, [lab.free]);
  const clean = (v) => v.replace(/[^0-9\-−]/g, '').slice(0, 2);
  const bad = text !== '' && text !== '-' && text !== '−' && L.parseFree(text) == null;
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-sm-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-black text-indigo-950">
          {k('free.a')}
          <input type="text" inputMode="numeric" autoComplete="off" dir="ltr" value={text} maxLength={2}
            onChange={(e) => { const v = clean(e.target.value); setText(v); if (L.parseFree(v) != null) setLab((s) => L.setFree(s, v)); }}
            aria-label={k('free.aAria')} aria-invalid={bad} data-sm-free-a
            className={`h-11 w-20 rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-emerald-300'} bg-white px-3 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`} />
        </label>
        {bad && <span className="text-xs font-bold text-rose-700">{k('free.bad')}</span>}
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-sm-free-back
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

export function discoveryOptions(lab, k) {
  const w = L.witness(lab);
  const p = { a: tex(w.a), d: Math.abs(w.step), one: w.one };
  const up = w.step > 0;
  return [
    { text: <MathText>{k(up ? 'discovery.turnDown' : 'discovery.turnUp', p)}</MathText>, why: <MathText>{k('discovery.whyTurn', p)}</MathText> },
    { text: <MathText>{k(up ? 'discovery.keepUp' : 'discovery.keepDown', p)}</MathText>, correct: true },
    { text: <MathText>{k(up ? 'discovery.stayNeg' : 'discovery.stayPos', p)}</MathText>, why: <MathText>{k('discovery.whyStay', p)}</MathText> },
  ];
}

export function Formal({ lab, k }) {
  const w = L.witness(lab);
  const line = `${tex(w.a)} \\times 4 + ${tex(w.a)} \\times (-4) = ${tex(w.pos)} + ${tex(w.neg)} = ${tex(w.a)} \\times 0 = 0`;
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-sm-formal>
      <p className="text-center text-base" dir="ltr"><MathText>{`$${line}$`}</MathText></p>
      <p><MathText>{k('formal.mirror')}</MathText></p>
      <p><MathText>{k('formal.flip')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de chaque genre de mission ; `rule` clôt la dernière mission. */
export const CHAINS = Object.freeze({ fill: ['gap', 'zero'], predict: ['continue', 'next'], reach: ['column'], both: ['flip', 'column'] });

/** Ce que l'élève a résolu pour une mission (sinon : la solution, pour les tests et le rendu à blanc). */
export function solvedOf(lab, task) {
  const s = lab.solved[lab.tasks.indexOf(task)];
  if (s) return s;
  if (task.kind === 'fill') return { a: task.a, b: task.to, product: L.productOf(task.a, task.to) };
  if (task.kind === 'predict') return { a: task.a, b: task.b, product: L.productOf(task.a, task.b) };
  if (task.kind === 'both') {
    const b = [1, 2, 3, 4].find((x) => Number.isInteger(task.product / x) && Math.abs(task.product / x) <= L.RANGE_A[1]);
    return { a: task.product / b, b, product: task.product, also: { a: -task.product / b, b: -b } };
  }
  return { a: task.a, b: L.bFor(task.a, task.product), product: task.product };
}

/** Les suites de CE labo : une question sans objet est retirée (la colonne suivante hors du tableau ou négative). */
export function chainsOf(lab) {
  const out = {};
  for (const tk of lab.tasks) {
    const s = solvedOf(lab, tk);
    out[tk.id] = (CHAINS[tk.kind] ?? []).filter((q) => {
      if (q === 'next') return s.b - 1 >= L.RANGE_B[0] && L.productOf(s.a, s.b - 1) > 0;
      if (q === 'zero') return tk.to <= 0 && tk.from >= 0 && s.a !== 0;
      if (q === 'column') return tk.kind !== 'both' || s.also;
      return true;
    });
  }
  const last = lab.tasks[lab.tasks.length - 1];
  if (last) out[last.id] = [...out[last.id], 'rule'];
  return out;
}

const C = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const pick = (list, right, whys) => list.map((text, i) => (i === right ? { text, correct: true } : { text, why: whys[i] }));
const calc$ = (a, b) => `$${tex(a)} \\times ${tex(b)} = ${L.productOf(a, b)}$`;
const big = (v) => <bdi dir="ltr">{minus(v)}</bdi>;

/** Chaque question est construite sur LA mission résolue par l'élève (rien en dur). */
export const QUESTIONS = {
  gap: (lab, task, k) => {
    const a = task.a; const d = Math.abs(a);
    const o = { from: iso(minus(task.from)), to: iso(minus(task.to)), d: iso(d), c1: calc$(a, task.from), c2: calc$(a, task.from - 1) };
    const up = -a > 0;
    return {
      id: 'gap', kind: 'choice', prompt: C(k, 'gap.prompt', o),
      options: pick([C(k, 'gap.up', o), C(k, 'gap.down', o), C(k, 'gap.one')], up ? 0 : 1, [C(k, 'gap.whySeen', o), C(k, 'gap.whySeen', o), C(k, 'gap.whyOne', o)]),
      hints: [C(k, 'gap.hint1'), C(k, 'gap.hint2', o)], explain: C(k, up ? 'gap.explainUp' : 'gap.explainDown', o),
    };
  },
  zero: (lab, task, k) => {
    const a = task.a;
    const o = { calc: `$${tex(a)} \\times 0$`, a: iso(minus(a)) };
    const why = C(k, 'zero.why', o);
    return {
      id: 'zero', kind: 'choice', cols: 3, prompt: C(k, 'zero.prompt', o),
      options: pick([big(0), big(a), big(-a)], 0, [null, why, why]),
      hints: [C(k, 'zero.hint1'), C(k, 'zero.hint2')], explain: C(k, 'zero.explain', o),
    };
  },
  continue: (lab, task, k) => {
    const s = solvedOf(lab, task);
    const seq = [1, 0];
    for (let b = -1; b >= s.b; b -= 1) seq.push(b);
    const o = { calc: calc$(s.a, s.b), p: iso(minus(s.product)), step: iso(minus(-s.a)), seq: iso(seq.map((b) => minus(L.productOf(s.a, b))).join(' ، ')) };
    return {
      id: 'continue', kind: 'choice', prompt: C(k, 'continue.prompt', o),
      options: pick([C(k, 'continue.right', o), C(k, 'continue.flip'), C(k, 'continue.back')], 0, [null, C(k, 'continue.whyFlip', o), C(k, 'continue.whyBack', o)]),
      hints: [C(k, 'continue.hint1'), C(k, 'continue.hint2', o)], explain: C(k, 'continue.explain', o),
    };
  },
  next: (lab, task, k) => {
    const s = solvedOf(lab, task);
    const v = L.productOf(s.a, s.b - 1);
    const o = { calc: `$${tex(s.a)} \\times ${tex(s.b - 1)}$`, p: iso(minus(s.product)), step: iso(minus(-s.a)), full: calc$(s.a, s.b - 1) };
    return {
      id: 'next', kind: 'number', expected: String(v), answer: big(v),
      prompt: C(k, 'next.prompt', o), hints: [C(k, 'next.hint1', o), C(k, 'next.hint2', o)], explain: C(k, 'next.explain', o),
    };
  },
  column: (lab, task, k) => {
    const s = solvedOf(lab, task);
    const a = s.a; const b = s.b;
    const alt = b + (b > L.RANGE_B[0] ? -1 : 1);
    const o = { a: iso(minus(a)), p: iso(minus(s.product)) };
    const why = (x) => C(k, 'column.why', { calc: calc$(a, x) });
    return {
      id: 'column', kind: 'choice', cols: 3, prompt: C(k, 'column.prompt', o),
      options: pick([big(b), big(-b), big(alt)], 0, [null, why(-b), why(alt)]),
      hints: [C(k, 'column.hint1'), C(k, 'column.hint2', o)], explain: C(k, 'column.explain', { calc: calc$(a, b) }),
    };
  },
  flip: (lab, task, k) => {
    const s = solvedOf(lab, task);
    const o = { p: iso(minus(task.product)), pos: calc$(s.a, s.b), neg: calc$(s.also.a, s.also.b) };
    return {
      id: 'flip', kind: 'choice', prompt: C(k, 'flip.prompt', o),
      options: pick([C(k, 'flip.right'), C(k, 'flip.same'), C(k, 'flip.product')], 0, [null, C(k, 'flip.whySame', o), C(k, 'flip.whyProduct', o)]),
      hints: [C(k, 'flip.hint1'), C(k, 'flip.hint2', o)], explain: C(k, 'flip.explain', o),
    };
  },
  rule: (lab, task, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k('discovery.prompt')}</MathText>, options: discoveryOptions(lab, k),
    hints: [C(k, 'rule.hint1'), C(k, 'rule.hint2')], explain: <Formal lab={lab} k={k} />,
  }),
};
