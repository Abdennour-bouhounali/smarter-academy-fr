import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Ruler, CheckCircle2, Sparkles, ChevronLeft, FlaskConical, Undo2, Check, Hand, LockKeyhole, Flag } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as D from '@smarter-academy/core/arithmetic/decimals.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import LabFold from '../primitives/LabFold';
import { LabCard, PromptCard, VerdictBanner } from '../primitives/LabKit';
import KidFigure from '../primitives/KidFigure';
import RulerTape from '../primitives/RulerTape';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { LEVELS } from '../levels';
import * as L from '../logic/rulerCompare';

/**
 * ruler-compare — LA GRADUATION SOUS LA MAIN (1AM, unité 1 « الأعداد الطبيعية والأعداد العشرية », درس « مقارنة الأعداد العشرية
 * وترتيبها »). La logique, entière et exacte, est dans `logic/rulerCompare.js` (core/arithmetic/decimals.js, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. Des sauts en longueur sont des nombres décimaux (mètres). La main tient la GRADUATION de la règle commune : le mètre, le décimètre,
 *    le centimètre, le millimètre — un curseur à quatre crans (tiré, touché, ← →). En `order`, la main place aussi les sauts sur le podium.
 * B. À la graduation g un saut se LIT : un nombre ENTIER de graduations et un reste plus petit qu'une graduation (hachuré, exact). Quand
 *    la règle sépare deux sauts, la comparaison devient celle de deux nombres NATURELS ; le premier rang où les chiffres diffèrent est la
 *    première graduation qui sépare ; compléter par des zéros (4,6 = 4,60) ne change pas le saut mais rend les deux lectures comparables.
 * C. La règle résiste : tant qu'elle ne sépare pas les sauts (4,6 et 4,65 se lisent 46 dm tous deux), le verdict `< = >` (ou « تحقّق »)
 *    est REFUSÉ, avec les lectures de l'élève ; un verdict faux est réfuté par les lectures (« على مسطرة السنتيمتر : 460 مقابل 435 »).
 * D. La phase formelle écrit ce que l'élève a fait : les nombres écrits avec le premier rang qui diffère mis en évidence, complétés par
 *    des zéros, les lectures naturelles ; en `order` la chaîne rangée avec ses symboles.
 * E. Les fausses conjectures sont réfutées avec SES nombres (le plus de chiffres après la virgule mais le plus petit ; les chiffres
 *    après la virgule lus comme un naturel).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        comparer deux nombres décimaux : rang par rang, ou comme des naturels après avoir complété par des zéros
 *   OBJECT         des sauts mesurés sur un ruban jaune posé sur le sable ; la règle commune à quatre graduations ; le podium
 *   VARIABLE       la GRADUATION de la règle (m · dm · cm · mm) ; en `order` aussi la place de chaque saut sur le podium
 *   INVARIANT      la longueur de chaque saut (le décimal écrit) ; le reste hachuré est exact, jamais arrondi
 *   TRANSFORMATION chaque cran : les lectures entières changent (4 → 46 → 460), le ruban se « zoome » dix fois
 *   CONSTRAINT     quatre graduations ; une seule règle pour toute la rangée
 *   RESISTANCE     « la règle ne sépare pas » (lectures égales) ; une lecture qui réfute un verdict faux ; une inversion montrée en lectures
 *   EVIDENCE       le ruban (cases entières, case du reste hachurée, fanion exact), les lectures en chiffres latins, la lampe « تفصل »
 *   CONTRAST       4,6 / 4,35 (35 > 6) · 8,05 / 8,5 (le zéro qui garde la place) · 12,70 / 12,7 (égaux) · 9,87 / 10,2 (les entiers décident)
 *   PREDICTION     aucune carte : la graduation est un geste d'essai, chaque verdict est jugé
 *   DISCOVERY      « ما الذي يحدّد أيّ العددين أكبر؟ »
 *   FORMALIZATION  le premier rang qui diffère ; compléter par des zéros ; plus de chiffres ne veut pas dire plus grand
 *   TRANSFER       la banque, « جرّب أعدادك أنت » (deux nombres libres, toujours ouvert)
 *
 * « جرّب كل الإمكانيات » : NON (le curseur de graduation EST l'expérience de l'élève). « جرّب أعدادك أنت » est TOUJOURS ouvert sous le labo.
 *
 * D'UN SEUL REGARD (§8bis) : `[data-rc-glance]` enveloppe la consigne (contexte puis UNE question), les rubans et leurs lectures, la règle,
 * le verdict (ou le podium). Étroit (< 560 px de labo : tablette à côté du menu) : le verdict et la ligne de retour s'empilent ; la scène ne dépasse jamais 980 px.
 *
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/rulerCompare.js › coachOf` (ruler · verdict · place · check · next) ne dit jamais OÙ.
 *
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 1, 2026-10-28) : `checkpoints` (défaut true). Après CHAQUE
 * tâche réussie, une suite de questions sur ce que l'élève vient de FAIRE, construite sur SES sauts (`chainOf`, `QUESTIONS`) : comparer — la
 * lecture à SA graduation, la graduation la plus grossière qui sépare (ou, pour =, pourquoi le 0 final ne compte pas) ; ranger — la
 * graduation qui range tout, pourquoi tel saut avant tel autre ; la DERNIÈRE suite finit par la règle (l'ancienne découverte, qui formalise).
 * Obligatoires pour tout élève ; l'enseignant seul les coupe pour SON compte. Questions actives → `guided` (ni « جرّب › اكتشف › صِغ » ni
 * « تلميح »). ÉTAPES : `LabStepper` (`[data-rc-step=<i>]`) + fête par tâche ; « إعادة » repart de la tâche 1 ; « أعِد التجربة » remet LA MÊME
 * tâche (`L.retryTask`). SON : `tooth` à chaque cran de règle (plus grave vers le mètre) et à chaque saut posé, `flag` à la tâche réussie,
 * `over` pour un verdict faux ou refusé (règle trop grossière).
 * Props (contrat fixé avec la leçon) : `world` ('jump'), `tasks` ([{ kind: 'compare', a, b } | { kind: 'order', values, dir }]), `level`, `levels`, `coach`,
 * `title`, `lead`, `onTrial({ task, kind, event, g, a, b, verdict, ok, decided, free, … })`, `onFinished({ tasks })` — par `state.report`.
 *
 * CONTRAT DOM : [data-ruler-compare][data-world][data-task][data-solved][data-layout], [data-rc-glance], [data-rc-grad=<0..3>][data-active],
 * [data-rc-knob], [data-rc-reading=<i>][data-count], [data-rc-rest=<i>], [data-rc-verdicts], [data-rc-verdict=lt|eq|gt], [data-rc-lamp][data-decided],
 * [data-rc-slot=<i>], [data-rc-tray], [data-rc-jump=<i>], [data-rc-check], [data-rc-free][data-active], [data-rc-free-a|b] (compare) · [data-rc-free-n=<1..6>] (order : jusqu'à 6 champs, ≥2 valides) · [data-rc-free][data-rc-free-kind], [data-rc-formal],
 * [data-rc-refused=<kind>], [data-rc-next], [data-rc-shown], [data-rc-kid], [data-rc-prompt][data-lit], [data-rc-step=<i>][data-done],
 * [data-lab-fold=ruler-compare.trials].
 */
const NS = 'manipulation.rulerCompare';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const UNIT = ['m', 'dm', 'cm', 'mm'];
const MAX_W = 980; // au-delà, la scène ne s'étale plus : le labo reste lisible d'un seul regard
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const SAND = 'linear-gradient(180deg,#FBEFC9 0%,#F5DFA0 62%,#EBC878 100%)';
const MOTION_CSS = '@keyframes rc-zoom{from{opacity:.25;transform:scaleX(.55)}to{opacity:1;transform:scaleX(1)}}'
  + '@keyframes rc-pop{from{transform:scale(.8);opacity:.2}to{transform:scale(1);opacity:1}}'
  + '@keyframes rc-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}45%{transform:translateX(5px)}70%{transform:translateX(-3px)}}'
  + '.rc-zoom{animation:rc-zoom .32s cubic-bezier(.2,.8,.3,1) both;transform-origin:100% 50%}.rc-pop{animation:rc-pop .22s ease-out both}.rc-shake{animation:rc-shake .36s ease-in-out}'
  + '@media (prefers-reduced-motion:reduce){.rc-zoom,.rc-pop,.rc-shake{animation:none}}';

/** Les nombres de départ : ceux de la leçon, sinon ceux du niveau. */
export function numbersFor({ world, tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['ruler-compare'][lv].numbers;
  const given = L.tasksFor(tasks);
  return { world: world ?? asked.world, tasks: given.length ? given : asked.tasks };
}

/** « 46 ديسيمترًا » : la lecture entière d'un saut, accordée. */
const said = (k, r) => k(`count.${UNIT[r.g]}`, { count: r.count });

export default function RulerCompare({
  world, tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ world, tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'ruler-compare', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const ready = L.discoveryReady(lab);
  // les questions pendant le labo : la suite de la tâche courante ; la dernière finit par la règle (elle remplace la découverte automatique)
  const cpSettings = useLabCheckpointSettings('ruler-compare');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpActive = cpOn && cpSettings.enabled;
  const chain = cpActive && !lab.free ? chainOf(lab, lab.ti) : null;
  const cp = useLabCheckpoint({
    id: chain ? `t${lab.ti}` : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, lab.ti, k)) : null,
    reached: L.taskDone(lab) && !lab.free,
    resetKey: scene.inits,
    onRetry: () => setLab(L.retryTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (chainOf(lab, Number(id.slice(1))).includes('rule')) { state.discover(); state.formalize(); } },
  });
  useEffect(() => { if (ready && !cpActive) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son du geste (muet sans « الصوت ») : un cran de règle, un saut posé, la tâche réussie, le refus
  const lastSeen = useRef(lab.last);
  useEffect(() => {
    const v = lab.last;
    if (v === lastSeen.current) return;
    lastSeen.current = v;
    if (!v) return;
    if (v.event === 'ruler') playSfx('tooth', { pitch: v.g > v.from ? 1 : 0.75 });
    else if (v.event === 'place') playSfx('tooth');
    else if (v.ok === true && !v.free) playSfx('flag');
    else if (v.ok === false || v.refused) playSfx('over');
  }, [lab.last]);
  // `onFinished` : UNE fois, quand toutes les tâches guidées sont faites (la découverte et la règle suivent, dans le même cadre)
  const finishedOnce = useRef(false);
  useEffect(() => {
    if (!ready) { finishedOnce.current = false; return; }
    if (!finishedOnce.current) { finishedOnce.current = true; state.report(onFinished, { tasks: nums.tasks.map((x) => ({ ...x })) }); }
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  // chaque geste jugé est rapporté UNE fois, même si deux tombent dans le même rendu
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
    lab: 'ruler-compare', step: coachStep,
    text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });

  /* ── mesure ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const [width, setWidth] = useState(720);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => setWidth(Math.max(300, Math.min(MAX_W, Math.floor(el.clientWidth))));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 720;

  const kind = L.taskOf(lab).kind;
  const discovery = (
    <ManipulationDiscovery state={state} prompt={k('discovery.prompt')} options={discoveryOptions(lab, k)} formal={<Formal lab={lab} k={k} />} />
  );

  return (
    <ManipulationShell
      headerAction={cpSettings.control}
      type="ruler-compare"
      title={title ?? k('title')}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      coach={coachOn ? coach : null}
      hints={[0, 1, 2].map((i) => k(`hints.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={discovery}
      guided={cpActive}
      explanation={k('explanation')}
    >
      <ManipulationStage className="bg-gradient-to-b from-amber-50/60 to-white">
        <div ref={boxRef} className="space-y-2" data-ruler-compare data-world="jump" data-kind={kind} data-task={lab.ti}
          data-solved={ready ? 'true' : 'false'} data-layout={width >= 640 ? 'wide' : width >= 560 ? 'medium' : 'narrow'}>
          <style dangerouslySetInnerHTML={{ __html: MOTION_CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} glanceRef={glanceRef} lead={state.isAuthoredLevel ? lead : null} cp={cp} />
          {lab.trials.length > 0 && (
            <LabFold id="ruler-compare.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-rc-trials={lab.trials.length}>
                {lab.trials.map((tr, i) => (
                  <li key={i} className={tr.ok === true ? 'text-emerald-800' : tr.ok === false ? 'text-amber-800' : tr.refused ? 'text-rose-800' : 'text-slate-700'} data-event={tr.event}>
                    {trialLine(tr, k)}
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

function trialLine(tr, k) {
  const ruler = k(`ruler.${UNIT[tr.g]}`);
  if (tr.free) return k('trial.free', { what: trialWhat(tr, k), ruler });
  return k('trial.line', { what: trialWhat(tr, k), ruler });
}
function trialWhat(tr, k) {
  if (tr.event === 'ruler') return k('trial.ruler');
  if (tr.event === 'place') return k('trial.place', { text: iso(tr.text) });
  if (tr.event === 'check') return tr.refused ? k('trial.checkRefused') : k(tr.ok ? 'trial.checkRight' : 'trial.checkWrong');
  const sym = iso(tr.verdict);
  return tr.refused ? k('trial.verdictRefused', { sym }) : k(tr.ok ? 'trial.verdictRight' : 'trial.verdictWrong', { sym });
}

/** Une secousse rejouable SANS remonter le sous-arbre. */
function useShake(ref, trigger) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = ref.current;
    if (!el || !trigger) return;
    el.classList.remove('rc-shake');
    void el.offsetWidth; // eslint-disable-line no-void
    el.classList.add('rc-shake');
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps
}

/* ══════════════ Le retour écrit (le bandeau) ══════════════ */

/** Le bandeau : jamais la règle, toujours les LECTURES de l'élève. `last` est un verdict ou un « تحقّق » (ruler / place → rien de nouveau). */
function bannerOf(lab, k) {
  const a = L.activeOf(lab);
  const last = lab.last;
  const idle = { tone: 'indigo', text: k(a.kind === 'order' ? 'idle.order' : 'idle.compare'), icon: Hand };
  if (!last || (last.event !== 'verdict' && last.event !== 'check') || Boolean(last.free) !== Boolean(a.free)) return idle;
  const g = last.g;
  const ruler = k(`ruler.${UNIT[g]}`);
  if (last.event === 'verdict') {
    const [r0, r1] = a.vals.map((v, index) => ({ index, g, ...D.readAt(v, g) }));
    const [ta, tb] = a.values;
    if (last.refused) return { tone: 'rose', icon: LockKeyhole, text: k('v.coarse', { reading: said(k, r0) }) };
    if (!last.ok) return { tone: 'amber', icon: Sparkles, text: k('v.wrong', { word: k(`word.${L.SYMBOL_KEY[last.verdict]}`), ruler, a: iso(ta), ca: iso(r0.count), b: iso(tb), cb: iso(r1.count) }) };
    if (r0.count === r1.count) return { tone: 'emerald', icon: CheckCircle2, text: k('v.rightEq', { ruler, reading: said(k, r0) }) };
    return { tone: 'emerald', icon: CheckCircle2, text: k('v.right', { ruler, ca: iso(r0.count), cb: iso(r1.count) }) };
  }
  if (last.refused) {
    const [i, j] = last.pair;
    const r = { g, ...D.readAt(a.vals[i], g) };
    return { tone: 'rose', icon: LockKeyhole, text: k('v.coarseOrder', { a: iso(a.values[i]), b: iso(a.values[j]), reading: said(k, r) }) };
  }
  if (!last.ok) {
    const i = last.inversion;
    return { tone: 'amber', icon: Sparkles, text: k('v.inversion', { i: iso(i + 1), j: iso(i + 2), a: iso(last.a), ca: iso(last.counts[i]), b: iso(last.b), cb: iso(last.counts[i + 1]), ruler }) };
  }
  return { tone: 'emerald', icon: CheckCircle2, text: k('v.orderRight', { ruler, list: last.counts.map((c) => iso(c)).join(k('comma')) }) };
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, screenH, glanceRef, lead, cp }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const a = L.activeOf(lab);
  const task = lab.tasks[lab.ti];
  const free = a.free;
  const order = a.kind === 'order';
  const done = !free && L.taskDone(lab);
  const narrow = width < 560;
  const compact = screenH < 800;
  const decided = L.decidedNow(lab);
  const banner = bannerOf(lab, k);
  const refused = lab.last && lab.last.refused && lab.last.event !== 'ruler' && Boolean(lab.last.free) === Boolean(free) ? lab.last.event : null;
  const readings = L.readingsOf(lab);
  const [held, setHeld] = useState(null); // « je prends ce saut » (tap-tap), partagé entre le sable et le podium
  useEffect(() => { setHeld(null); }, [lab.ti, free]);

  /* ── la consigne : le contexte (tous les nombres), puis UNE question ── */
  const jumpers = a.values.map((_, i) => L.jumperOf(a.kind, lab.ti, i));
  const context = (() => {
    if (free) return k(order ? 'context.freeOrder' : 'context.free');
    if (lead) return lead;
    if (order) return k('context.order', { jumps: k('jump', { count: task.n }) });
    return k('context.compare', { x: jumpers[0].name, a: iso(task.a), y: jumpers[1].name, b: iso(task.b) });
  })();
  const question = free ? k(order ? `question.freeOrder_${a.task.dir}` : 'question.free') : order ? k(`question.order_${task.dir}`) : k('question.compare');
  // une étape est FAITE quand la tâche est réussie ET que ses questions (LabCheckpoint) sont répondues : la pastille passe au vert et on fête
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-rc-step" />
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
  const prompt = (
    <PromptCard size={narrow ? 'md' : 'lg'} className={compact && !narrow ? '!space-y-1.5 !p-3.5' : undefined} aside={steps || null} context={context} contextProps={{ 'data-rc-context': free ? 'free' : task.kind }}
      title={question} titleClassName={compact || narrow ? 'text-lg' : 'text-xl'} lamp={!free && done ? 'on' : 'off'}
      titleProps={{ 'data-rc-prompt': free ? 'free' : task.kind, 'data-lit': !free && done ? 'true' : 'false' }} />
  );

  /* ── le bandeau de retour + « المهمة التالية » ── */
  const canNext = L.canNext(lab) && !cp.blocking;
  const mood = banner.tone === 'emerald' ? 'proud' : banner.tone === 'rose' ? 'wonder' : 'happy';
  const bannerEl = (
    <VerdictBanner tone={banner.tone} icon={banner.icon} size="sm" className="min-h-[3.4rem]" data-rc-banner={lab.last ? lab.last.event : ''}>
      <div className="min-w-0 space-y-1.5">
        <p className={lab.last && (lab.last.event === 'verdict' || lab.last.event === 'check') ? '' : 'font-bold text-indigo-900'} {...(refused ? { 'data-rc-refused': refused === 'check' ? 'order' : 'coarse' } : {})}>{banner.text}</p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-rc-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </VerdictBanner>
  );

  const full = L.slotsFull(lab);
  const checkEl = order && (
    <button type="button" data-rc-check onClick={() => setLab(L.check)} disabled={!full || done} data-done={done ? 'true' : 'false'}
      className={`inline-flex min-h-[56px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border-2 px-5 text-base font-black transition-all duration-150 motion-reduce:transition-none ${ring} ${done ? 'border-emerald-600 bg-emerald-500 text-white' : full ? 'border-indigo-600 bg-indigo-600 text-white shadow-[0_5px_0_0_#3730A3] active:translate-y-0.5 active:shadow-none' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
      {done && <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />}{done ? k('stamp') : k('check')}
    </button>
  );
  const sand = (
    <div className="relative rounded-3xl border-2 border-amber-300/70 p-2 shadow-[0_12px_30px_-18px_rgba(146,64,14,0.55)]" style={{ background: SAND }} data-rc-pit>
      <SandSpeckle uid={uid} />
      <div className="relative space-y-2">
        {order
          ? <Tray lab={lab} a={a} k={k} readings={readings} jumpers={jumpers} setLab={setLab} width={width} compact={compact} held={held} setHeld={setHeld} />
          : <Lanes lab={lab} a={a} k={k} readings={readings} jumpers={jumpers} mood={mood} width={width} compact={compact} uid={uid} done={done} />}
        <RulerControl g={a.g} setG={(g) => setLab((s) => L.setRuler(s, g))} k={k} compact={compact} decided={decided} />
      </div>
    </div>
  );

  const verdictCard = <VerdictCard lab={lab} a={a} k={k} setLab={setLab} decided={decided} refused={refused === 'verdict' ? 'coarse' : null} compact={compact} />;

  return (
    <>
      <div ref={glanceRef} className="relative mx-auto space-y-2.5" style={{ maxWidth: MAX_W }} data-rc-glance>
        {party.node}
        {cp.node}
        {prompt}
        {order ? (
          <>
            {sand}
            <Podium lab={lab} a={a} k={k} readings={readings} jumpers={jumpers} setLab={setLab} width={width} compact={compact} decided={decided} held={held} setHeld={setHeld} />
            <div className="flex items-stretch gap-2.5">
              <div className="min-w-0 flex-1">{bannerEl}</div>
              {checkEl}
            </div>
          </>
        ) : (
          <>
            {sand}
            <div className={narrow ? 'space-y-2' : 'grid grid-cols-[minmax(0,6fr)_minmax(0,5fr)] items-stretch gap-2.5'}>{verdictCard}{bannerEl}</div>
          </>
        )}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/** Des grains de sable : un motif discret, jamais un obstacle à la lecture. */
function SandSpeckle({ uid }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full rounded-3xl opacity-60" aria-hidden="true">
      <defs>
        <pattern id={`${uid}sp`} width="46" height="38" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="8" r="1.3" fill="#D6A94A" opacity=".55" />
          <circle cx="29" cy="22" r="1.6" fill="#C8923A" opacity=".4" />
          <circle cx="40" cy="6" r="1" fill="#D6A94A" opacity=".5" />
          <circle cx="15" cy="31" r="1.1" fill="#C8923A" opacity=".45" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${uid}sp)`} />
    </svg>
  );
}

/* ══════════════ Compare : les deux pistes ══════════════ */

function Lanes({ k, readings, jumpers, mood, width, compact, uid, done }) {
  const narrow = width < 640;
  return (
    <div className="space-y-2">
      {readings.map((r, i) => {
        const j = jumpers[i];
        const kid = narrow ? { w: 42, h: 58 } : { w: 52, h: compact ? 72 : 86 };
        const tape = (tw) => (
          <div className="rc-zoom" style={{ width: tw }} key={`${r.g}`}>
            <RulerTape width={tw} height={narrow ? 46 : compact ? 56 : 64} count={r.count} rest={r.rest} restIsZero={r.restIsZero} uid={`${uid}${i}`}
              label={k('tapeAria', { name: j.name, reading: said(k, r) })} flag={i === 0 ? '#DC2626' : '#2563EB'} />
          </div>
        );
        const kidSvg = (
          <svg width={kid.w} height={kid.h} viewBox={`0 0 ${kid.w} ${kid.h}`} aria-hidden="true" data-rc-kid={j.id} className="shrink-0">
            <KidFigure cx={kid.w / 2} top={kid.h * 0.08} foot={kid.h - 4} mood={done ? mood : 'happy'} {...j.look} />
          </svg>
        );
        if (narrow) {
          return (
            <div key={i} className="rounded-2xl bg-white/55 px-2 py-1.5 ring-1 ring-amber-300/60" data-rc-lane={i}>
              <div className="flex items-center gap-2">
                {kidSvg}
                <Bib2 name={j.name} text={r.text} k={k} i={i} row />
                <div className="ms-auto"><Reading r={r} i={i} k={k} small /></div>
              </div>
              <div className="mt-1 flex justify-center" dir="ltr">{tape(width - 36 - 8)}</div>
            </div>
          );
        }
        const bibW = 112;
        const readW = 150;
        const tw = Math.max(150, width - 36 - kid.w - bibW - readW - 24);
        return (
          <div key={i} className="flex items-center gap-2 rounded-2xl bg-white/55 px-2 ring-1 ring-amber-300/60" style={{ height: kid.h + 8 }} data-rc-lane={i}>
            {kidSvg}
            <Bib2 name={j.name} text={r.text} k={k} i={i} width={bibW} />
            <div className="min-w-0 flex-1" dir="ltr">{tape(tw)}</div>
            <Reading r={r} i={i} k={k} width={readW} />
          </div>
        );
      })}
    </div>
  );
}

/** Le dossard : le nom du coureur et son saut écrit (le nombre à comparer). */
function Bib2({ name, text, k, i, width, row = false }) {
  return (
    <div className={`flex shrink-0 ${row ? 'items-baseline gap-2 px-2.5 py-1' : 'flex-col items-center justify-center px-2 py-1 text-center'} rounded-xl border-2 border-amber-700/30 bg-white shadow-sm`} style={width ? { width } : undefined} data-rc-bib={i}>
      <span className="text-sm font-black leading-tight text-amber-900">{name}</span>
      <bdi dir="ltr" className="whitespace-nowrap text-2xl font-black leading-tight tabular-nums text-indigo-950" data-rc-written={i}>{text}<span className="ms-1 text-base text-amber-800">{k('metre')}</span></bdi>
    </div>
  );
}

/** La lecture : « 46 ديسيمتر + باقٍ ». Le nombre est ENTIER (chiffres latins), le reste est dit hachuré. */
function Reading({ r, i, k, width, small = false }) {
  const frac = r.restIsZero ? '0' : `${r.rest.n}/${10 ** r.rest.k}`;
  const chip = (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-extrabold leading-tight ${r.restIsZero ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-100 text-amber-900'}`} data-rc-rest={i} data-rest={frac} data-zero={r.restIsZero ? 'true' : 'false'}>
      {r.restIsZero
        ? (<><Check className="h-3 w-3" strokeWidth={3.5} aria-hidden="true" />{k('rest.none')}</>)
        : (<><span aria-hidden="true" className="inline-block h-3 w-4 rounded-[3px] border border-amber-700" style={{ background: 'repeating-linear-gradient(135deg,#B45309 0 2px,#FEF3C7 2px 5px)' }} />+ {k('rest.some')}</>)}
    </span>
  );
  return (
    <div className="flex shrink-0 flex-col items-center justify-center rounded-xl bg-white px-2 py-1 text-center ring-2 ring-indigo-100" style={width ? { width } : undefined}
      data-rc-reading={i} data-count={r.count} data-g={r.g} aria-label={k('readAria', { reading: said(k, r), rest: r.restIsZero ? k('rest.none') : k('rest.some') })}>
      <div className="flex items-baseline justify-center gap-1.5">
        <bdi dir="ltr" key={`${r.g}-${r.count}`} className={`rc-pop font-black leading-none tabular-nums text-indigo-700 ${small ? 'text-3xl' : 'text-4xl'}`}>{r.count}</bdi>
        <span className="text-xs font-extrabold text-indigo-900/80">{k(`unit.${UNIT[r.g]}`)}</span>
      </div>
      <div className="mt-0.5">{chip}</div>
    </div>
  );
}

/* ══════════════ La règle : le curseur de graduation ══════════════ */

function RulerControl({ g, setG, k, compact, decided }) {
  const railRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const stopAt = (clientX) => {
    const el = railRef.current;
    if (!el) return g;
    const r = el.getBoundingClientRect();
    return Math.max(0, Math.min(3, Math.floor(((clientX - r.left) / r.width) * 4)));
  };
  const onDown = (e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(true); };
  const onMove = (e) => { if (drag) { const s = stopAt(e.clientX); if (s !== g) setG(s); } };
  const onUp = () => setDrag(false);
  const onKey = (e) => {
    const map = { ArrowLeft: g - 1, ArrowRight: g + 1, ArrowDown: g - 1, ArrowUp: g + 1, Home: 0, End: 3 };
    if (!(e.key in map)) return;
    e.preventDefault();
    setG(Math.max(0, Math.min(3, map[e.key])));
  };
  const h = compact ? 46 : 52;
  return (
    <div className="rounded-2xl bg-white/60 px-2.5 pb-1.5 pt-2 ring-1 ring-amber-300/60" data-rc-ruler data-g={g}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-black text-amber-950"><Ruler className="h-4 w-4" aria-hidden="true" /> {k('ruler.title')}</span>
        <Lamp k={k} decided={decided} />
      </div>
      <div className="relative" dir="ltr" ref={railRef} style={{ height: h }}>
        <div className="absolute inset-0 grid grid-cols-4 overflow-hidden rounded-xl border-2 border-amber-800/70 bg-yellow-300 shadow-[0_4px_0_0_#A16207]">
          {UNIT.map((u, i) => (
            <button key={u} type="button" tabIndex={-1} onClick={() => setG(i)} data-rc-grad={i} data-active={g === i ? 'true' : 'false'} aria-label={k('ruler.stopAria', { ruler: k(`ruler.${u}`) })}
              className={`relative border-amber-800/50 outline-none ${i > 0 ? 'border-s-2' : ''} ${g === i ? 'bg-yellow-200' : 'hover:bg-yellow-200/70'}`}>
              <TickIcon i={i} h={h} active={g === i} />
            </button>
          ))}
        </div>
        <button type="button" role="slider" aria-orientation="horizontal" aria-valuemin={0} aria-valuemax={3} aria-valuenow={g} aria-valuetext={k(`ruler.${UNIT[g]}`)} aria-label={k('ruler.knob')}
          data-rc-knob data-dragging={drag ? 'true' : 'false'}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onKey}
          className={`absolute top-1/2 flex touch-none items-center justify-center rounded-full border-[3px] border-indigo-700 bg-gradient-to-b from-indigo-400 to-indigo-600 text-white shadow-[0_6px_0_0_#3730A3,0_12px_18px_-8px_rgba(49,46,129,0.7)] ${ring} focus-visible:ring-amber-300 motion-reduce:transition-none`}
          style={{ width: h + 2, height: h + 2, left: `${(g + 0.5) * 25}%`, transform: `translate(-50%,-50%)${drag ? ' scale(1.08)' : ''}`, transition: drag ? 'none' : 'left .18s cubic-bezier(.34,1.3,.64,1)', cursor: drag ? 'grabbing' : 'grab' }}>
          <Ruler className="h-6 w-6" strokeWidth={2.6} aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-4 pt-2" dir="ltr">
        {UNIT.map((u, i) => (
          <span key={u} dir="rtl" className={`text-center text-[13px] font-black leading-tight ${g === i ? 'text-indigo-800' : 'text-amber-900/70'}`}>{k(`unit.${u}`)}</span>
        ))}
      </div>
    </div>
  );
}

/** Les traits d'une graduation : 1 gros trait au mètre, 10 au décimètre, 20 au centimètre, 40 au millimètre (la densité EST le niveau de détail). */
function TickIcon({ i, active }) {
  const n = [2, 9, 19, 39][i];
  const long = [1, 3, 5, 10][i];
  return (
    <svg className="absolute inset-x-1 bottom-0 top-0 h-full w-[calc(100%-8px)]" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true" style={{ opacity: active ? 0.28 : 0.75 }}>
      {Array.from({ length: n }, (_, j) => {
        const x = ((j + 1) * 100) / (n + 1);
        const big = (j + 1) % long === 0 && i > 0;
        return <line key={j} x1={x} x2={x} y1={0} y2={big ? 22 : i === 0 ? 30 : 13} stroke="#713F12" strokeWidth={i === 3 ? 0.9 : 1.6} vectorEffect="non-scaling-stroke" />;
      })}
    </svg>
  );
}

/** La lampe : la règle sépare-t-elle ce qu'il faut séparer ? Elle ne dit jamais QUELLE graduation il faudrait. */
function Lamp({ k, decided }) {
  return (
    <span data-rc-lamp data-decided={decided ? 'true' : 'false'} role="status"
      className={`inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-0.5 text-xs font-black transition-colors ${decided ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-amber-300 bg-white/80 text-amber-900'}`}>
      <span aria-hidden="true" className={`h-3 w-3 rounded-full ${decided ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]' : 'bg-amber-300'}`} />
      {decided ? k('lamp.yes') : k('lamp.no')}
    </span>
  );
}

/* ══════════════ Compare : le verdict ══════════════ */

const SYM = { lt: '<', eq: '=', gt: '>' };

function VerdictCard({ lab, a, k, setLab, decided, refused, compact }) {
  const shakeRef = useRef(null);
  useShake(shakeRef, refused ? lab.trials.length : 0);
  if (a.kind !== 'compare') return null;
  const [ta, tb] = a.values;
  const last = lab.last && lab.last.event === 'verdict' && Boolean(lab.last.free) === Boolean(a.free) ? lab.last : null;
  const done = !a.free && L.taskDone(lab);
  const solvedSym = done ? lab.solved[lab.ti].verdict : null;
  return (
    <LabCard className="space-y-2 p-3" data-rc-verdictcard>
      <div ref={shakeRef} className="flex items-center justify-center gap-1.5" dir="ltr" data-rc-verdicts role="group" aria-label={k('verdictAria')}>
        <Bib text={ta} a={a} shown={done} />
        <div className="flex items-center gap-1.5">
          {Object.entries(SYM).map(([key, sym]) => {
            const chosen = last && last.verdict === sym;
            const state = solvedSym === sym ? 'right' : chosen && last.ok === false ? 'wrong' : chosen && last.refused ? 'refused' : 'idle';
            return (
              <button key={key} type="button" onClick={() => setLab((s) => L.verdict(s, sym))} data-rc-verdict={key} data-state={state} data-locked={!decided || (done && solvedSym !== sym) ? 'true' : undefined}
                aria-label={k(`word.${key}`)}
                className={`flex ${compact ? 'h-14 w-14' : 'h-16 w-16'} items-center justify-center rounded-2xl border-2 text-4xl font-black leading-none transition-all duration-150 motion-reduce:transition-none ${ring} ${
                  state === 'right' ? 'border-emerald-600 bg-emerald-500 text-white shadow-[0_5px_0_0_#047857]'
                    : state === 'wrong' ? 'border-rose-300 bg-rose-50 text-rose-700 line-through decoration-2'
                      : !decided ? 'border-slate-200 bg-slate-50 text-slate-400 shadow-[0_4px_0_0_#E2E8F0]'
                        : 'border-indigo-200 bg-white text-indigo-900 shadow-[0_5px_0_0_#C7CBFF] hover:-translate-y-0.5 hover:border-indigo-400 active:translate-y-0.5 active:shadow-none'}`}>
                <bdi dir="ltr">{sym}</bdi>
              </button>
            );
          })}
        </div>
        <Bib text={tb} a={a} shown={done} />
      </div>
    </LabCard>
  );
}

function Bib({ text, a, shown }) {
  const [va, vb] = a.vals;
  const rank = D.firstDifferingRank(va, vb);
  return (
    <span className={`inline-flex min-w-[3.4rem] items-center justify-center rounded-xl px-2 py-2 text-xl font-black tabular-nums ring-1 ${shown ? 'rc-pop bg-emerald-50 text-indigo-950 ring-emerald-300' : 'bg-amber-100 text-amber-950 ring-amber-300'}`} data-rc-bib-number={shown ? 'shown' : 'plain'}>
      {shown ? <Written text={text} rank={rank} padTo={Math.max(va.k, vb.k)} /> : <bdi dir="ltr">{text}</bdi>}
    </span>
  );
}

/** Découpe l'écriture d'un nombre pour mettre en évidence le premier rang qui diffère (et dessiner les zéros ajoutés en fantôme). */
export function highlightParts(text, rank, padTo) {
  const [whole, dec = ''] = text.split(',');
  const parts = [];
  parts.push({ t: whole, hl: rank === 0 });
  const total = Math.max(dec.length, padTo ?? 0);
  if (total > 0) parts.push({ t: ',', hl: false, comma: true });
  for (let i = 0; i < total; i += 1) {
    const ghost = i >= dec.length;
    parts.push({ t: ghost ? '0' : dec[i], hl: rank === i + 1, ghost });
  }
  return parts;
}

export function Written({ text, rank, padTo, ...rest }) {
  return (
    <bdi dir="ltr" className="inline-flex items-baseline tabular-nums" {...rest}>
      {highlightParts(text, rank, padTo).map((p, i) => (
        <span key={i} data-hl={p.hl ? 'true' : undefined} data-ghost={p.ghost ? 'true' : undefined}
          className={`${p.hl ? 'rounded-md bg-amber-300 px-[3px] text-amber-950 ring-2 ring-amber-500' : ''} ${p.ghost ? 'rounded-md border border-dashed border-slate-400 px-[2px] text-slate-400' : ''}`}>{p.t}</span>
      ))}
    </bdi>
  );
}

/* ══════════════ Order : les sauts sur le sable et le podium ══════════════ */

function useTokenDrag({ onDrop, onTap }) {
  const st = useRef(null);
  const suppress = useRef(false);
  const [drag, setDrag] = useState(null);
  return {
    drag,
    handlers: {
      onPointerDown: (e) => {
        if (e.button != null && e.button > 0) return;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        st.current = { x0: e.clientX, y0: e.clientY, moved: false, el: e.currentTarget };
      },
      onPointerMove: (e) => {
        const s = st.current;
        if (!s) return;
        const dx = e.clientX - s.x0;
        const dy = e.clientY - s.y0;
        if (!s.moved && Math.hypot(dx, dy) > 7) s.moved = true;
        if (s.moved) setDrag({ dx, dy });
      },
      onPointerUp: (e) => {
        const s = st.current;
        st.current = null;
        setDrag(null);
        if (!s || !s.moved) return;
        suppress.current = true;
        const hit = document.elementsFromPoint(e.clientX, e.clientY).filter((n) => !s.el.contains(n));
        const slotEl = hit.map((n) => n.closest?.('[data-rc-slot]')).find(Boolean);
        const trayEl = hit.map((n) => n.closest?.('[data-rc-tray]')).find(Boolean);
        onDrop?.(slotEl ? Number(slotEl.getAttribute('data-rc-slot')) : trayEl ? null : undefined);
      },
      onPointerCancel: () => { st.current = null; setDrag(null); },
      onClick: (e) => {
        e.stopPropagation();
        if (suppress.current) { suppress.current = false; return; }
        onTap?.();
      },
    },
  };
}

function JumpToken({ i, a, k, r, jumper, held, placed, onDrop, onTap, compact, wide }) {
  const { drag, handlers } = useTokenDrag({ onDrop, onTap });
  const frac = r.restIsZero ? '0' : `${r.rest.n}/${10 ** r.rest.k}`;
  const tiny = wide < 96;
  return (
    <button type="button" data-rc-jump={i} data-held={held ? 'true' : 'false'} data-placed={placed ? 'true' : 'false'} data-dragging={drag ? 'true' : 'false'}
      aria-pressed={held} aria-label={k('jumpAria', { name: jumper.name, text: a.values[i], reading: said(k, r) })}
      {...handlers}
      onKeyDown={(e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { const all = [...(e.currentTarget.closest('[data-rc-podium],[data-rc-tray]')?.querySelectorAll('[data-rc-jump]') ?? [])]; const at = all.indexOf(e.currentTarget); const nx = all[at + (e.key === 'ArrowLeft' ? -1 : 1)]; if (nx) { e.preventDefault(); nx.focus(); } } }}
      className={`relative flex touch-none select-none flex-col items-center justify-center gap-0.5 rounded-2xl border-2 bg-white text-center shadow-[0_4px_0_0_#D6A94A] ${ring} ${held ? 'border-indigo-600 ring-4 ring-indigo-200' : 'border-amber-700/40 hover:border-indigo-400'} ${drag ? 'z-50' : ''}`}
      style={{ width: wide, height: compact ? 78 : 88, cursor: drag ? 'grabbing' : 'grab', transform: drag ? `translate(${drag.dx}px,${drag.dy}px) scale(1.06) rotate(-2deg)` : undefined, transition: drag ? 'none' : 'transform .15s', boxShadow: drag ? '0 18px 30px -12px rgba(67,56,202,0.55)' : undefined }}>
      <span className="flex items-baseline gap-1.5 leading-none" dir="rtl">
        <span className={`${tiny ? 'text-[10px]' : 'text-xs'} font-black text-amber-900`}>{jumper.name}</span>
        <bdi dir="ltr" className={`${tiny ? 'text-sm' : 'text-lg'} font-black tabular-nums text-indigo-950`} data-rc-written={i}>{a.values[i]}{!tiny && <span className="ms-0.5 text-xs text-amber-800">{k('metre')}</span>}</bdi>
      </span>
      <span className="flex items-center gap-1.5" data-rc-reading={i} data-count={r.count} data-g={r.g}>
        <bdi dir="ltr" key={`${r.g}-${r.count}`} className={`rc-pop rounded-lg bg-indigo-50 px-1 ${tiny ? 'text-lg' : 'px-1.5 text-2xl'} font-black leading-tight tabular-nums text-indigo-700`}>{r.count}</bdi>
        <span data-rc-rest={i} data-rest={frac} data-zero={r.restIsZero ? 'true' : 'false'} role="img" aria-label={r.restIsZero ? k('rest.none') : k('rest.some')} title={r.restIsZero ? k('rest.none') : k('rest.some')}
          className={`inline-flex ${tiny ? 'h-3.5 w-3.5' : 'h-4 w-5'} items-center justify-center rounded-[4px] border ${r.restIsZero ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-amber-700'}`}
          style={r.restIsZero ? undefined : { background: 'repeating-linear-gradient(135deg,#B45309 0 2px,#FEF3C7 2px 5px)' }}>
          {r.restIsZero && <Check className="h-3 w-3" strokeWidth={3.5} aria-hidden="true" />}
        </span>
      </span>
    </button>
  );
}

function tokenWidth(width, n) {
  return Math.max(60, Math.min(150, Math.floor((width - 64 - (n - 1) * 6) / n)));
}

function Tray({ lab, a, k, readings, jumpers, setLab, width, compact, held, setHeld }) {
  const tray = L.trayOf(lab);
  const w = tokenWidth(width, a.vals.length);
  const tapJump = (i) => {
    if (held === i) { setHeld(null); return; }
    const slot = a.slots.indexOf(i);
    if (held !== null && slot >= 0) { setLab((s) => L.place(s, held, slot)); setHeld(null); return; }
    setHeld(i);
  };
  return (
    <div className="relative rounded-2xl bg-white/45 p-2 ring-1 ring-amber-300/60" data-rc-tray onClick={() => { if (held !== null && a.slots.includes(held)) { setLab((s) => L.place(s, held, null)); setHeld(null); } }}>
      <p className="mb-1 flex items-center gap-1.5 text-xs font-black text-amber-950"><Flag className="h-3.5 w-3.5" aria-hidden="true" /> {k('sand.title')}</p>
      <div className={`flex ${compact ? 'min-h-[80px]' : 'min-h-[90px]'} flex-wrap items-center justify-center gap-2`} dir="ltr" data-rc-tray-row>
        {tray.map((i) => (
          <JumpToken key={i} i={i} a={a} k={k} r={readings[i]} jumper={jumpers[i]} held={held === i} placed={false} wide={w} compact={compact}
            onTap={() => tapJump(i)}
            onDrop={(slot) => { if (slot !== undefined) setLab((s) => L.place(s, i, slot)); setHeld(null); }} />
        ))}
        {tray.length === 0 && <span className="text-xs font-bold text-amber-900/60">{k('sand.empty')}</span>}
      </div>
    </div>
  );
}

function Podium({ lab, a, k, readings, jumpers, setLab, width, compact, held, setHeld }) {
  const n = a.vals.length;
  const w = tokenWidth(width, n);
  const done = !a.free && L.taskDone(lab);
  const wrongAt = (() => {
    const l = lab.last;
    if (l && l.event === 'check' && l.ok === false && Boolean(l.free) === Boolean(a.free)) return [l.inversion, l.inversion + 1];
    return [];
  })();
  const refused = lab.last && lab.last.event === 'check' && lab.last.refused ? lab.last.pair : null;
  const shakeRef = useRef(null);
  useShake(shakeRef, refused || wrongAt.length ? lab.trials.length : 0);
  const tapJump = (i) => {
    if (held === i) { setHeld(null); return; }
    if (held !== null) { const slot = a.slots.indexOf(i); if (slot >= 0) { setLab((s) => L.place(s, held, slot)); setHeld(null); return; } }
    setHeld(i);
  };
  const tapSlot = (s) => {
    if (done) return;
    if (held !== null) { setLab((st) => L.place(st, held, s)); setHeld(null); return; }
    if (a.slots[s] !== null) setHeld(a.slots[s]);
  };
  const ends = a.task.dir === 'asc' ? ['podium.shortest', 'podium.farthest'] : ['podium.farthest', 'podium.shortest'];
  return (
    <LabCard className="space-y-1.5 p-2.5" data-rc-podium>
      <div ref={shakeRef} className="flex flex-wrap items-end justify-center gap-2" dir="ltr">
        {a.slots.map((jump, s) => {
          const bad = wrongAt.includes(s) || (refused && jump !== null && refused.includes(jump));
          return (
            <div key={s} data-rc-slot={s} data-filled={jump !== null ? 'true' : 'false'} data-bad={bad ? 'true' : undefined} onClick={() => tapSlot(s)}
              role={jump === null ? 'button' : undefined} tabIndex={jump === null ? 0 : undefined} aria-label={jump === null ? k('podium.slotAria', { i: s + 1 }) : undefined}
              onKeyDown={jump === null ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapSlot(s); } } : undefined}
              className={`relative flex items-center justify-center rounded-2xl border-2 border-dashed ${ring} ${jump === null ? (held !== null ? 'border-indigo-400 bg-indigo-50/70' : 'border-slate-300 bg-slate-50') : bad ? 'border-rose-400 bg-rose-50' : done ? 'border-emerald-400 bg-emerald-50' : 'border-amber-500/60 bg-amber-50'}`}
              style={{ width: w + 6, height: (compact ? 78 : 88) + 12 }}>
              <span className="absolute -top-2.5 start-1/2 inline-flex h-5 min-w-[20px] -translate-x-1/2 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[11px] font-black text-white" aria-hidden="true"><bdi dir="ltr">{s + 1}</bdi></span>
              {jump !== null
                ? <JumpToken i={jump} a={a} k={k} r={readings[jump]} jumper={jumpers[jump]} held={held === jump} placed wide={w} compact={compact}
                  onTap={() => tapJump(jump)}
                  onDrop={(target) => { if (target === null) setLab((st) => L.place(st, jump, null)); else if (target !== undefined) setLab((st) => L.place(st, jump, target)); setHeld(null); }} />
                : <span className="text-xs font-bold text-slate-300" aria-hidden="true">{s + 1}</span>}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between px-1 text-[11px] font-extrabold text-indigo-900/70" dir="ltr" data-rc-podium-ends>
        <span dir="rtl">{k(ends[0])}</span>
        <span dir="rtl">{k(ends[1])}</span>
      </div>
    </LabCard>
  );
}

/* ══════════════ « جرّب أعدادك أنت » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const order = L.taskOf(lab).kind === 'order';
  const count = order ? L.FREE_MAX_ORDER : 2;
  const [vals, setVals] = useState(() => Array(L.FREE_MAX_ORDER).fill(''));
  useEffect(() => { if (!lab.free) setVals(Array(L.FREE_MAX_ORDER).fill('')); }, [lab.free]);
  const clean = (raw) => raw.replace(/[^0-9.,]/g, '').replace(/[.,]/g, (c, i, s) => (s.indexOf(',') === i || s.indexOf('.') === i ? ',' : ''));
  const onChange = (i, raw) => {
    const next = vals.slice();
    next[i] = clean(raw);
    setVals(next);
    setLab((s) => L.setFree(s, next.slice(0, count)));
  };
  const shown = vals.slice(0, count);
  const bad = shown.some((v) => v && !L.parseJump(v));
  const field = (i) => {
    const val = vals[i];
    const id = order ? String(i + 1) : i === 0 ? 'a' : 'b';
    const label = order ? k('free.n', { i: iso(String(i + 1)) }) : k(i === 0 ? 'free.a' : 'free.b');
    const aria = order ? k('free.nAria', { i: iso(String(i + 1)) }) : k(`free.${id}Aria`);
    return (
      <label key={id} className={`flex min-w-0 ${order ? 'flex-col items-stretch gap-1' : 'items-center gap-2'} text-xs font-black text-indigo-950`}>
        {label}
        <input type="text" inputMode="decimal" autoComplete="off" dir="ltr" value={val} onChange={(e) => onChange(i, e.target.value)} maxLength={6}
          aria-label={aria} data-rc-free-input={id} {...(order ? { 'data-rc-free-n': String(i + 1) } : { [`data-rc-free-${id}`]: '' })}
          className={`h-11 ${order ? 'w-full min-w-0' : 'w-28'} rounded-xl border-2 bg-white px-2 text-center text-xl font-black tabular-nums text-indigo-950 ${val && !L.parseJump(val) ? 'border-rose-300' : 'border-emerald-300'} ${ring}`} />
      </label>
    );
  };
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-rc-free data-active={free ? 'true' : 'false'} data-rc-free-kind={order ? 'order' : 'compare'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : bad ? k('free.bad') : k(order ? 'free.hintOrder' : 'free.hint')}</p>
      <div className={order ? 'grid gap-2 grid-cols-6' : 'flex flex-wrap items-center gap-3'}>
        {Array.from({ length: count }, (_, i) => field(i))}
      </div>
      {free && (
        <button type="button" onClick={() => setLab(L.toGuided)} data-rc-free-back
          className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900 ${ring}`}>
          <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
        </button>
      )}
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

export function discoveryOptions(lab, k) {
  const w = L.witnesses(lab);
  return [
    {
      text: k('discovery.digits'),
      why: k('discovery.whyDigits', { small: iso(w.digits.small), big: iso(w.digits.big), sn: iso(w.digits.smallNatural), bn: iso(w.digits.bigNatural) }),
    },
    { text: k('discovery.right'), correct: true },
    {
      text: k('discovery.longer'),
      why: k('discovery.whyLonger', { small: iso(w.longer.small), big: iso(w.longer.big), sd: k('digit', { count: w.longer.smallDecimals }), bd: k('digit', { count: w.longer.bigDecimals }) }),
    },
  ];
}

const sym2 = { '<': '<', '=': '=', '>': '>' };

export function Formal({ lab, k }) {
  const compares = lab.tasks.map((t, i) => (t.kind === 'compare' && lab.solved[i] ? { i, t, s: lab.solved[i] } : null)).filter(Boolean);
  const order = L.lastOrder(lab);
  if (compares.length === 0 && !order) return null;
  const w = L.witnesses(lab);
  return (
    <div className="space-y-2.5 text-sm font-bold text-emerald-950" data-rc-formal={order && compares.length === 0 ? 'order' : 'compare'}>
      {compares.length > 0 && (
        <div className="grid gap-2 grid-cols-2">
          {compares.map(({ i, t, s }) => {
            const rank = D.firstDifferingRank(t.av, t.bv);
            const kmax = Math.max(t.av.k, t.bv.k);
            const padded = t.av.k !== t.bv.k;
            return (
              <div key={i} className="space-y-1 rounded-2xl border border-emerald-200 bg-white/80 p-2.5" data-rc-formal-card={i}>
                <p className="flex items-center justify-center gap-2 text-xl font-black text-indigo-950" dir="ltr">
                  <Written text={t.a} rank={rank} padTo={kmax} /> <span className="text-emerald-700">{sym2[s.verdict]}</span> <Written text={t.b} rank={rank} padTo={kmax} />
                </p>
                {padded && (
                  <p className="flex items-center justify-center gap-2 text-base font-extrabold text-slate-700" dir="ltr" data-rc-formal-padded>
                    <span className="tabular-nums">{D.paddedText(t.av, kmax)}</span><span>{sym2[s.verdict]}</span><span className="tabular-nums">{D.paddedText(t.bv, kmax)}</span>
                    <span className="mx-1 text-slate-400">→</span>
                    <span className="tabular-nums">{D.readAt(t.av, kmax).count}</span><span>{sym2[s.verdict]}</span><span className="tabular-nums">{D.readAt(t.bv, kmax).count}</span>
                  </p>
                )}
                {rank === null && !padded && null}
                {rank !== null && (
                  <p className="text-center text-xs text-slate-600" data-rc-formal-rank>{k(rank === 0 ? 'formal.rankWhole' : 'formal.rank', { rank: D.rankName(-rank) })}</p>
                )}
                {rank === null && <p className="text-center text-xs text-slate-600" data-rc-formal-equal>{k('formal.equal', { a: iso(t.a), b: iso(t.b) })}</p>}
              </div>
            );
          })}
        </div>
      )}
      {order && <OrderChain order={order} k={k} />}
      <p>{k('formal.rule')}</p>
      <p data-rc-formal-longer>{k('formal.notLonger', { small: iso(w.longer.small), big: iso(w.longer.big) })}</p>
    </div>
  );
}

function OrderChain({ order, k }) {
  const { task, solved } = order;
  const texts = solved.order;
  const vals = texts.map((x) => D.parse(x));
  return (
    <div className="space-y-1.5 rounded-2xl border border-emerald-200 bg-white/80 p-2.5" data-rc-formal-chain>
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-lg font-black text-indigo-950" dir="ltr">
        {texts.map((tx, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-emerald-700">{D.cmp(vals[i - 1], vals[i]) === 0 ? '=' : task.dir === 'asc' ? '<' : '>'}</span>}
            <span className="tabular-nums">{tx}</span>
          </React.Fragment>
        ))}
      </p>
      <p className="flex flex-wrap items-center justify-center gap-x-2 text-sm font-extrabold text-slate-600" dir="ltr">
        {solved.counts.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span>{c === solved.counts[i - 1] ? '=' : task.dir === 'asc' ? '<' : '>'}</span>}
            <span className="tabular-nums">{c}</span>
          </React.Fragment>
        ))}
      </p>
      <p className="text-center text-xs text-slate-600">{k(task.dir === 'asc' ? 'formal.chainAsc' : 'formal.chainDesc', { ruler: k(`ruler.${UNIT[solved.g]}`) })}</p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

const RULERS = ['m', 'dm', 'cm', 'mm'];

/** La suite de la tâche i (comparer : lecture + graduation, ou le 0 final ; ranger : graduation + une paire) ; la DERNIÈRE finit par la règle. */
export function chainOf(lab, i) {
  const t = lab.tasks[i];
  const out = t.kind === 'order' ? ['rowG', 'pair'] : ['read', t.cmp === 0 ? 'equal' : 'grad'];
  return i === lab.tasks.length - 1 ? [...out, 'rule'] : out;
}

const C = (k, key, o) => k(`cp.${key}`, o);
const pick = (list, right, whys) => list.map((text, i) => (i === right ? { text, correct: true } : { text, why: whys[i] }));
const rulerName = (k, g) => k(`ruler.${RULERS[g]}`);
/** Trois graduations distinctes : la juste puis deux voisines (une plus grossière si elle existe, sinon deux plus fines). */
const gradOptions = (g) => [g, g > 0 ? g - 1 : Math.min(3, g + 2), Math.min(3, g + 1) === g ? g - 2 : g + 1].filter((x, j, a) => x >= 0 && x <= 3 && a.indexOf(x) === j);
/** Pourquoi une graduation fausse : trop grossière (deux sauts lus pareil), ou plus fine que nécessaire. */
function gradWhy(k, vals, texts, gx, g) {
  if (gx > g) return C(k, 'grad.whyFiner', { ruler: rulerName(k, gx), right: rulerName(k, g) });
  for (let a = 0; a < vals.length; a += 1) for (let b = a + 1; b < vals.length; b += 1) {
    if (!D.decidedAt(vals[a], vals[b], gx)) return C(k, 'grad.whyCoarse', { ruler: rulerName(k, gx), x: iso(texts[a]), y: iso(texts[b]), n: iso(D.readAt(vals[a], gx).count) });
  }
  return C(k, 'grad.whyFiner', { ruler: rulerName(k, gx), right: rulerName(k, g) });
}

/** Chaque question est construite sur LES sauts de la tâche (rien en dur). */
export const QUESTIONS = {
  read: (lab, i, k) => {
    const t = lab.tasks[i];
    const g = lab.solved[i]?.g ?? t.minG;
    const n = D.readAt(t.av, g).count;
    const m = D.readAt(t.bv, g).count;
    const x = L.jumperOf('compare', i, 0).name;
    const o = { ruler: rulerName(k, g), x, a: iso(t.a), n: iso(n), m: iso(m), b: iso(t.b) };
    return {
      id: 'read', kind: 'number', expected: String(n), answer: <bdi dir="ltr">{n}</bdi>,
      prompt: C(k, 'read.prompt', o), hints: [C(k, 'read.hint1', o), C(k, 'read.hint2', o)], explain: C(k, 'read.explain', o),
    };
  },
  grad: (lab, i, k) => {
    const t = lab.tasks[i];
    const g = t.minG;
    const opts = gradOptions(g);
    const o = { a: iso(t.a), b: iso(t.b), right: rulerName(k, g), na: iso(D.readAt(t.av, g).count), nb: iso(D.readAt(t.bv, g).count) };
    return {
      id: 'grad', kind: 'choice', cols: 3, prompt: C(k, 'grad.prompt', o),
      options: pick(opts.map((x) => rulerName(k, x)), 0, opts.map((x) => (x === g ? null : gradWhy(k, t.vals, t.values, x, g)))),
      hints: [C(k, 'grad.hint1', o), C(k, 'grad.hint2', o)], explain: C(k, 'grad.explain', o),
    };
  },
  equal: (lab, i, k) => {
    const t = lab.tasks[i];
    const [long, short] = t.av.k >= t.bv.k ? [t.a, t.b] : [t.b, t.a];
    const o = { a: iso(t.a), b: iso(t.b), long: iso(long), short: iso(short) };
    return {
      id: 'equal', kind: 'choice', prompt: C(k, 'equal.prompt', o),
      options: pick([C(k, 'equal.right'), C(k, 'equal.digits'), C(k, 'equal.whole')], 0, [null, C(k, 'equal.whyDigits', o), C(k, 'equal.whyWhole', o)]),
      hints: [C(k, 'equal.hint1', o), C(k, 'equal.hint2', o)], explain: C(k, 'equal.explain', o),
    };
  },
  rowG: (lab, i, k) => {
    const t = lab.tasks[i];
    const g = t.rowG;
    const opts = gradOptions(g);
    const o = { right: rulerName(k, g), jumps: k('jump', { count: t.n }) };
    return {
      id: 'rowG', kind: 'choice', cols: 3, prompt: C(k, 'rowG.prompt', o),
      options: pick(opts.map((x) => rulerName(k, x)), 0, opts.map((x) => (x === g ? null : gradWhy(k, t.vals, t.values, x, g)))),
      hints: [C(k, 'rowG.hint1'), C(k, 'rowG.hint2', o)], explain: C(k, 'rowG.explain', o),
    };
  },
  pair: (lab, i, k) => {
    const t = lab.tasks[i];
    // le couple qui piège : le plus PETIT a plus de chiffres après la virgule (sinon le premier couple de valeurs différentes)
    let best = null;
    for (let a = 0; a < t.n; a += 1) for (let b = 0; b < t.n; b += 1) {
      if (a === b || D.cmp(t.vals[a], t.vals[b]) >= 0) continue;
      const trap = t.vals[a].k > t.vals[b].k;
      if (!best || (trap && !best.trap)) best = { s: a, l: b, trap };
    }
    const g = D.minGraduation(t.vals[best.s], t.vals[best.l]);
    const [first, second] = t.dir === 'asc' ? [best.s, best.l] : [best.l, best.s];
    const o = {
      first: iso(t.values[first]), second: iso(t.values[second]), small: iso(t.values[best.s]), big: iso(t.values[best.l]),
      ruler: rulerName(k, g), cs: iso(D.readAt(t.vals[best.s], g).count), cb: iso(D.readAt(t.vals[best.l], g).count),
    };
    return {
      id: 'pair', kind: 'choice', prompt: C(k, `pair.prompt_${t.dir}`, o),
      options: pick([C(k, 'pair.right', o), C(k, 'pair.longer', o), C(k, 'pair.digits', o)], 0, [null, C(k, 'pair.whyLonger', o), C(k, 'pair.whyDigits', o)]),
      hints: [C(k, 'pair.hint1', o), C(k, 'pair.hint2', o)], explain: C(k, 'pair.explain', o),
    };
  },
  rule: (lab, i, k) => ({
    id: 'rule', kind: 'choice', prompt: k('discovery.prompt'), options: discoveryOptions(lab, k),
    hints: [C(k, 'rule.hint1'), C(k, 'rule.hint2')], explain: <Formal lab={lab} k={k} />,
  }),
};
