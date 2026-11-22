import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, XCircle, Sparkles, ChevronLeft, FlaskConical, Undo2, Plus, Check } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as D from '@smarter-academy/core/arithmetic/decimals.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import LabFold from '../primitives/LabFold';
import { LabCard, StageFrame, PromptCard, VerdictBanner } from '../primitives/LabKit';
import CommaSlip from '../primitives/CommaSlip';
import { MosaicBlocks, MosaicDefs, ClientTable, WoodTray, StarWall, Craftswoman, CraftswomanAvatar, TenMachine, rankHue, MOSAIC_CSS } from '../primitives/MosaicFigure';
import { layoutBlocks, commonScale } from '../primitives/mosaicLayout';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { LEVELS } from '../levels';
import * as L from '../logic/decimalComma';

/**
 * decimal-comma — LA VIRGULE SOUS LA MAIN (1AM, unité 1 « الأعداد الطبيعية والأعداد العشرية », درس « الكسور العشرية والكتابة
 * العشرية »). La logique, entière et exacte, est dans `logic/decimalComma.js` (core/arithmetic/decimals.js, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. Les CHIFFRES du bon sont imprimés et fixes ; la main tient la VIRGULE : sa place dans la suite de chiffres, donc le nombre de
 *    chiffres après elle. Une grosse boule ronde se tire entre les tuiles (accrochage à l'espace le plus proche), un espace se touche,
 *    le clavier la déplace d'un cran. La grandeur (N / 10^p) est une SORTIE : des pièces honnêtes (mosaïque) ou des rangs nommés (machine).
 * B. La virgule dit la taille de la pièce que compte chaque chiffre : chaque cran vers la droite la rend dix fois plus petite ; les
 *    mêmes chiffres font 235, 23,5, 2,35 ou 0,235 ; le nombre de chiffres après la virgule est le nombre de zéros du dénominateur ;
 *    un zéro garde une place vide (0,05 ≠ 0,5) ; un zéro à la fin ne change rien (2,50 = 2,5) ; × ÷ 10, 100, 1000 glissent la virgule.
 * C. La table du client (ou le كسر عشري du bon) résiste : la virgule ne sort pas de la suite de chiffres ; dans `machine` elle ne passe
 *    pas le dernier chiffre (« لا رقم هنا »), il faut y ajouter un zéro. Le plateau est PLUS ou MOINS que la table, avec SES pièces.
 * D. La phase formelle écrit ce que l'élève a fait : la table des rangs, la fraction (235/100 et sa lecture), le مفكوك, « عدد الأجزاء
 *    من مائة » une fois, 2,50 = 2,5 ; en `machine`, les rangs avant / après et la virgule qui a glissé de n rangs.
 * E. Les fausses conjectures sont réfutées avec SES planches (les mêmes chiffres 235 : 235 puis 0,235 ; plus de chiffres après la
 *    virgule mais plus petit ; les chiffres n'ont pas changé ; aucun zéro n'a été ajouté).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        la virgule du nombre décimal : la taille de la pièce que compte chaque chiffre ; ×10^k = glisser la virgule
 *   OBJECT         un bon de commande (tuiles de chiffre), la table du client, le plateau, les panneaux / bandes / carreaux / éclats ; la machine
 *   VARIABLE       la place de la virgule dans la suite de chiffres (donc le nombre de chiffres après elle), et les zéros ajoutés en machine
 *   INVARIANT      les chiffres (ordre et valeur de chaque tuile) ; la valeur ne change pas quand on ajoute un zéro (la virgule reste accrochée)
 *   TRANSFORMATION chaque cran de la virgule : les pièces se regroupent (une bande = dix carreaux), les rangs des chiffres glissent
 *   CONSTRAINT     la virgule ne quitte pas la suite de chiffres ; au plus 3 zéros ajoutés de chaque côté
 *   RESISTANCE     la table du client ; `nodigit` (« لا رقم هنا ») ; plus / moins que la table
 *   EVIDENCE       le plateau en pièces honnêtes, le nombre écrit et sa fraction (les zéros du dénominateur dessinés), les pastilles de rang
 *   CONTRAST       235 · 23,5 · 2,35 · 0,235 ; 0,05 / 0,5 ; 2,50 / 2,5 ; ×10 (sans zéro) / ×100 (un zéro à droite) / ÷100 (un zéro à gauche)
 *   PREDICTION     aucune carte : la virgule est un geste d'essai, chaque relâchement est jugé
 *   DISCOVERY      « ماذا يغيّر موضعُ الفاصلة؟ » ; « ماذا فعلت الآلة بأرقام عددك؟ »
 *   FORMALIZATION  rangs, fraction décimale, مفكوك, 2,50 = 2,5 ; la virgule glissée de n rangs
 *   TRANSFER       la banque, les exercices du manuel, « جرّب أعدادك أنت » (ses propres chiffres, toujours ouvert)
 *
 * « جرّب كل الإمكانيات » : NON (chaque relâchement EST l'expérience de l'élève). « جرّب أعدادك أنت » est TOUJOURS ouvert sous le labo.
 *
 * D'UN SEUL REGARD (§8bis) : `[data-dc-glance]` enveloppe la consigne (contexte puis UNE question), la scène (zones + bande), le
 * nombre écrit / sa fraction et le verdict. Large (≥ 760 px) : une colonne à côté porte l'artisane `KidFigure`, la lecture et le verdict ;
 * étroit : la lecture et le verdict passent sous la scène. La hauteur de la scène vient de l'écran de leçon (`useLessonViewport`).
 *
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/decimalComma.js › coachOf` (grab · move · zero · next) ne dit jamais OÙ la virgule
 * doit finir.
 *
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 1, 2026-10-28) : `checkpoints` (défaut true). Après CHAQUE
 * tâche réussie, une suite de questions sur ce que l'élève vient de FAIRE, construite sur SES chiffres (`chainOf`, `QUESTIONS`) : mosaïque —
 * combien de petites pièces, combien de pièces dans le chiffre des dixièmes, à quoi sert le 0, combien de chiffres après la virgule, le 0
 * final ; machine — le résultat, de combien de rangs et dans quel sens la virgule a glissé, pourquoi un zéro ; la DERNIÈRE suite finit par
 * la règle (l'ancienne découverte, qui formalise). Obligatoires pour tout élève ; l'enseignant seul les coupe pour SON compte. Questions
 * actives → `guided` (ni « جرّب › اكتشف › صِغ » ni « تلميح »). ÉTAPES : `LabStepper` (`[data-dc-step=<i>]`) + fête par tâche ; « إعادة »
 * repart de la tâche 1 ; « أعِد التجربة » remet LA MÊME tâche (`L.retryTask`). SON : `tooth` à chaque relâchement / zéro (plus grave quand
 * la planche est en dessous de la table), `flag` à la tâche réussie, `over` pour « لا رقم هنا ».
 * Props (contrat fixé avec la leçon) : `world` ('mosaic' | 'machine'), `tasks` ([{ kind: 'match'|'fraction', digits, target } | { kind: 'shift', start, op }]),
 * `level`, `levels`, `coach`, `title`, `lead`, `onTrial({ task, kind, digits, point, shown, value, target, ok, verdict, zeros, free })`,
 * `onFinished({ tasks })` — par `state.report`.
 *
 * CONTRAT DOM : [data-decimal-comma][data-world][data-task][data-solved][data-layout], [data-dc-glance], [data-dc-slip=input|output], [data-dc-digit=<i>],
 * [data-dc-comma][data-point], [data-dc-gap=<j>], [data-dc-rank=<i>], [data-dc-written], [data-dc-fraction], [data-dc-table=target|tray],
 * [data-dc-block=panel|strip|tile|shard], [data-dc-op], [data-dc-zero=left|right], [data-dc-verdict=exact|more|less|nodigit], [data-dc-prompt][data-lit],
 * [data-dc-next], [data-dc-free][data-active], [data-dc-free-digits], [data-dc-free-op], [data-dc-free-back], [data-dc-formal], [data-dc-kid],
 * [data-dc-stamp], [data-dc-step=<i>][data-done], [data-lab-fold=decimal-comma.trials].
 */
const NS = 'manipulation.decimalComma';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const WIDE_MIN = 700;
const SIDE_W = 224;
const ZBTN = 48;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';

/** Les nombres de départ : ceux de la leçon, sinon ceux du niveau (mosaic) ou les tâches du monde `machine`. */
export function numbersFor({ world, tasks, level }) {
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['decimal-comma'][lv].numbers;
  const given = tasks == null ? null : Array.isArray(tasks) ? tasks : [tasks];
  const w = world ?? (given?.length ? L.worldOf(given) : asked.world);
  const list = given?.length ? given : w === 'machine' ? L.MACHINE_PRESETS[lv] : asked.tasks;
  return { world: w, tasks: list };
}

export default function DecimalComma({
  world, tasks, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ world, tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'decimal-comma', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const W0 = lab.world;
  const ready = L.discoveryReady(lab);
  // les questions pendant le labo : la suite de la tâche courante ; la dernière finit par la règle (elle remplace la découverte automatique)
  const cpSettings = useLabCheckpointSettings('decimal-comma');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
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
  // le son du geste (muet sans « الصوت ») : chaque relâchement / zéro, la tâche réussie, le refus
  const lastSeen = useRef(lab.last);
  useEffect(() => {
    const v = lab.last;
    if (v === lastSeen.current) return;
    lastSeen.current = v;
    if (!v) return;
    if (v.verdict === 'nodigit') playSfx('over');
    else if (v.verdict === 'exact' && !v.free) playSfx('flag');
    else playSfx('tooth', { pitch: v.verdict === 'less' ? 0.75 : 1 });
  }, [lab.last]);
  // `onFinished` : UNE fois, quand toutes les tâches guidées sont faites (la découverte et la règle suivent, dans le même cadre)
  const finishedOnce = useRef(false);
  useEffect(() => {
    if (!ready) { finishedOnce.current = false; return; }
    if (!finishedOnce.current) { finishedOnce.current = true; state.report(onFinished, { tasks: nums.tasks.map((x) => ({ ...x })) }); }
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  // chaque relâchement jugé est rapporté UNE fois, même si deux tombent dans le même rendu
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
    lab: 'decimal-comma', step: coachStep,
    text: coachStep ? (coachStep.id === 'move' ? k(`coach.move${W0 === 'machine' ? 'Machine' : 'Mosaic'}`) : k(`coach.${coachStep.id}`)) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });

  /* ── mesure ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const bodyHRef = useRef(0);
  const [width, setWidth] = useState(640);
  const [overhead, setOverhead] = useState(330);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(300, Math.floor(el.clientWidth)));
      // hystérésis : la hauteur de la scène dépend de ce qui l'entoure et inversement — une marge de 6 px évite que deux états se renvoient la balle
      if (glanceRef.current) { const next = Math.max(160, Math.ceil(glanceRef.current.getBoundingClientRect().height) - bodyHRef.current); setOverhead((o) => (Math.abs(o - next) > 6 ? next : o)); }
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (glanceRef.current) ro.observe(glanceRef.current);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 720;

  /* ── la découverte et la règle ── */
  const discovery = (
    <ManipulationDiscovery state={state} prompt={k(`discovery.${W0}.prompt`)} options={discoveryOptions(lab, k)} formal={<Formal lab={lab} k={k} />} />
  );

  return (
    <ManipulationShell
      headerAction={cpSettings.control}
      type="decimal-comma"
      title={title ?? k(`title.${W0}`)}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      coach={coachOn ? coach : null}
      hints={[0, 1, 2].map((i) => k(`hints.${W0}.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={discovery}
      guided={cpActive}
      explanation={k('explanation')}
    >
      <ManipulationStage className="bg-gradient-to-b from-indigo-50/40 to-white">
        <div ref={boxRef} className="space-y-2" data-decimal-comma data-world={W0} data-task={lab.ti}
          data-solved={ready ? 'true' : 'false'} data-layout={width >= WIDE_MIN ? 'wide' : 'narrow'}>
          <style dangerouslySetInnerHTML={{ __html: MOSAIC_CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} width={width} screenH={screenH} overhead={overhead} glanceRef={glanceRef} bodyHRef={bodyHRef}
            lead={state.isAuthoredLevel ? lead : null} cp={cp} />
          {lab.trials.length > 0 && (
            <LabFold id="decimal-comma.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-dc-trials={lab.trials.length}>
                {lab.trials.map((tr, i) => (
                  <li key={i} className={tr.ok ? 'text-emerald-800' : tr.verdict === 'nodigit' ? 'text-rose-800' : 'text-slate-700'} data-ok={String(tr.ok)}>
                    {k('trial', { shown: iso(tr.shown), word: k(tr.free ? 'kind.free' : `kind.${tr.verdict}`) })}
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

/** Une secousse rejouable SANS remonter le sous-arbre (un remontage ferait perdre le focus clavier de la boule). */
function useShake(ref, trigger) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = ref.current;
    if (!el || !trigger) return;
    el.classList.remove('dc-shake');
    void el.offsetWidth; // eslint-disable-line no-void
    el.classList.add('dc-shake');
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps
}

/* ══════════════ Textes ══════════════ */

/** « لوحتان و3 أعمدة و5 بلاطات » : les pièces d'une valeur, en phrase (un nombre par rang, les rangs vides omis). */
function piecesText(v, k) {
  const list = L.pieceList(v).map((p) => k(p.kind, { count: p.count }));
  const finer = D.piecesOf(v).finer;
  if (finer) list.push(k('tinier'));
  return list.length ? list.join(k('and')) : '';
}

/** Une fraction décimale en colonne : le numérateur, la barre, le dénominateur dont les ZÉROS sont dessinés un à un. */
function Frac({ num, zeros, size = 'md', ...rest }) {
  const big = size === 'lg';
  return (
    <span className="inline-flex flex-col items-center align-middle font-black leading-none tabular-nums" dir="ltr" data-num={num} data-zeros={zeros} {...rest}>
      <span className={`px-1 text-indigo-950 ${big ? 'text-4xl' : 'text-2xl'}`}>{num}</span>
      <span className="my-1 block h-[3px] w-full min-w-[1.4em] rounded bg-indigo-900" aria-hidden="true" />
      <span className={`inline-flex items-center gap-[2px] ${big ? 'text-3xl' : 'text-xl'}`}>
        <span className="text-indigo-950">1</span>
        {Array.from({ length: zeros }, (_, i) => (
          <span key={i} className={`inline-flex items-center justify-center rounded-md bg-rose-100 px-[3px] text-rose-700 ring-1 ring-rose-300 ${big ? 'h-9 min-w-[1.1em]' : 'h-7 min-w-[1em]'}`}>0</span>
        ))}
      </span>
    </span>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

function Lab({ lab, setLab, k, width, screenH, overhead, glanceRef, bodyHRef, lead, cp }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const world = lab.world;
  const machine = world === 'machine';
  const a = L.activeOf(lab);
  const task = lab.tasks[lab.ti];
  const free = a.free;
  const value = L.valueOf(lab);
  const shown = L.shownOf(lab);
  const live = L.verdictOf(lab);
  const last = lab.last;
  const wide = width >= WIDE_MIN;
  const stageW = wide ? width - SIDE_W - 12 : width;
  const iw = stageW - 24;
  const done = L.taskDone(lab);

  // le budget de hauteur : ce que l'écran laisse à la scène (zones du plateau, ou deux bandes de chiffres)
  const bodyH = Math.round(Math.max(machine ? 100 : 130, Math.min(machine ? 176 : 236, screenH - overhead - 40)));
  bodyHRef.current = bodyH;

  const ranks = useMemo(() => L.ranksOf(a.str, a.point).map((r) => ({ ...r, hue: rankHue(r.exp) })), [a.str, a.point]);
  const written = shown;
  const frac = D.fractionOf(D.fromSlip(a.str, a.point));

  /* ── le texte du bandeau ── */
  const piecesNow = piecesText(value, k);
  const verdictLine = (() => {
    if (!last) return k(`idle.${machine ? 'machine' : 'mosaic'}`);
    if (last.verdict === 'nodigit') return k('v.nodigit');
    if (machine) {
      if (last.verdict === 'exact') return k('v.exactMachine', { shown: iso(last.shown) });
      if (last.verdict === 'more') return k('v.moreMachine', { shown: iso(last.shown) });
      if (last.verdict === 'less') return k('v.lessMachine', { shown: iso(last.shown) });
      return k('v.freeMachine', { shown: iso(last.shown) });
    }
    const p = piecesNow || null;
    if (last.free && last.verdict === null) return p ? k('v.tray', { pieces: p }) : k('v.empty');
    if (!p) return k('v.empty');
    if (last.verdict === 'exact') return k(task.kind === 'fraction' && !last.free ? 'v.exactFraction' : 'v.exactMatch');
    return k(`v.${last.verdict}`, { pieces: p });
  })();
  const tone = !last ? 'indigo' : last.verdict === 'exact' ? 'emerald' : last.verdict === 'nodigit' ? 'rose' : last.verdict ? 'amber' : 'indigo';
  const Icon = !last ? Hand : last.verdict === 'exact' ? CheckCircle2 : last.verdict === 'nodigit' ? XCircle : Sparkles;

  /* ── la consigne : le contexte (tous les nombres), puis UNE question ── */
  const ctxArgs = { digits: iso(task.digits ?? ''), start: iso(task.start ?? ''), op: iso(task.op ?? ''), pieces: task.kind === 'match' ? piecesText(task.targetValue, k) : '' };
  const context = free ? k('context.free') : (lead || k(`context.${task.kind}`, ctxArgs));
  const question = free ? k(machine ? 'question.freeMachine' : 'question.freeMosaic') : k(`question.${task.kind}`);
  // une étape est FAITE quand la tâche est réussie ET que ses questions (LabCheckpoint) sont répondues : la pastille passe au vert et on fête
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && !free && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-dc-step" />
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
    <PromptCard size={wide ? 'lg' : 'md'} aside={steps || null} context={context} contextProps={{ 'data-dc-context': free ? 'free' : task.kind }}
      title={question} titleClassName={wide ? 'text-xl' : 'text-lg'} lamp={!free && done ? 'on' : 'off'}
      titleProps={{ 'data-dc-prompt': free ? 'free' : task.kind, 'data-lit': !free && done ? 'true' : 'false' }} />
  );

  /* ── la lecture : le nombre écrit et sa fraction ── */
  const readout = (
    <LabCard className="space-y-2 p-3" data-dc-readout>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-black text-indigo-900/70">{k('read.written')}</span>
        <bdi dir="ltr" key={written} className="dc-pop inline-block text-4xl font-black tabular-nums tracking-wide text-indigo-950" data-dc-written>{written}</bdi>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-indigo-50 pt-2">
        <span className="text-xs font-black text-indigo-900/70">{k('read.fraction')}</span>
        <Frac num={frac.num} zeros={frac.zeros} data-dc-fraction={frac.text} />
      </div>
    </LabCard>
  );

  /* ── le bandeau de verdict + « المهمة التالية » ── */
  const kidMood = !last ? 'neutral' : last.verdict === 'exact' ? 'proud' : last.verdict === 'nodigit' ? 'wonder' : 'happy';
  const canNext = L.canNext(lab) && !cp.blocking;
  const banner = (
    <VerdictBanner tone={tone} icon={wide ? Icon : null} size="sm" className={wide ? 'min-h-[3.75rem]' : 'min-h-[4rem]'}
      data-dc-verdict={last ? (last.verdict ?? '') : ''}>
      <div className="flex items-start gap-2">
        {!wide && <CraftswomanAvatar mood={kidMood} size={46} />}
        <div className="min-w-0 space-y-1.5">
        <p className={last ? '' : 'font-bold text-indigo-900'}>{verdictLine}</p>
        {canNext && (
          <button type="button" onClick={() => setLab(L.nextTask)} data-dc-next
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-emerald-600 px-3.5 text-sm font-black text-white shadow-[0_3px_0_0_#047857] transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`}>
            {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        </div>
      </div>
    </VerdictBanner>
  );

  /* ── la scène ── */
  const release = (j) => setLab((s) => L.release(s, j));
  const stage = machine
    ? <MachineStage lab={lab} a={a} setLab={setLab} k={k} iw={iw} bodyH={bodyH} ranks={ranks} written={written} release={release} uid={uid} />
    : <MosaicStage lab={lab} a={a} k={k} iw={iw} bodyH={bodyH} ranks={ranks} written={written} release={release} value={value} verdict={live} showStamp={!!last && last.verdict === 'exact' && !free} uid={uid} />;
  const stageFrame = (
    <StageFrame className={`min-w-0 overflow-hidden p-3 ${wide ? 'flex-1' : ''}`} data-dc-stage>
      <StarWall uid={`${uid}w`} />
      <div className="relative">{stage}</div>
    </StageFrame>
  );
  const margin = 0;
  return (
    <>
    <div ref={glanceRef} className="relative space-y-2.5" style={margin ? { marginInline: -margin } : undefined} data-dc-glance>
      {party.node}
      {cp.node}
      {prompt}
      {wide ? (
        <div className="flex items-start gap-3">
          {stageFrame}
          <div className="flex shrink-0 flex-col gap-2.5" style={{ width: SIDE_W }}>
            <LabCard className="overflow-hidden p-0"><Craftswoman mood={kidMood} width={SIDE_W - 2} height={112} world={world} /></LabCard>
            {readout}
            {banner}
          </div>
        </div>
      ) : (
        <>
          {stageFrame}
          <div className="grid grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-stretch gap-2.5">{readout}{banner}</div>
        </>
      )}
    </div>
    {/* « جرّب أعدادك أنت » : toujours ouvert, SOUS le regard d'ensemble */}
    <FreeCard lab={lab} setLab={setLab} k={k} machine={machine} wide={wide} />
    </>
  );
}

/* ══════════════ Monde « mosaic » : la table du client, le plateau, la bande ══════════════ */

function MosaicStage({ lab, a, k, iw, bodyH, ranks, written, release, value, verdict, showStamp, uid }) {
  const task = lab.tasks[lab.ti];
  const free = a.free;
  const showTable = !free;
  const gap = 12;
  const zoneW = showTable ? Math.floor((iw - gap) / 2) : iw;
  const zoneH = Math.max(120, Math.min(236, bodyH));
  const inner = { width: zoneW - 24, height: zoneH - 40 };
  // UNE échelle de panneau pour toute la tâche : la table et le plateau à toutes les places de virgule se comparent
  const tableValue = showTable && task.kind === 'match' ? task.targetValue : null;
  const scale = useMemo(() => {
    const lists = [];
    if (tableValue) lists.push(L.blocksOf(tableValue).groups);
    for (let p = 0; p <= a.str.length; p += 1) lists.push(L.blocksOf(D.fromSlip(a.str, p)).groups);
    return commonScale(lists, { ...inner, maxS: 74, minS: 20 });
  }, [a.str, tableValue, inner.width, inner.height]); // eslint-disable-line react-hooks/exhaustive-deps
  const trayLayout = useMemo(() => layoutBlocks(L.blocksOf(value).groups, { ...inner, s: scale }), [value, scale, inner.width, inner.height]); // eslint-disable-line react-hooks/exhaustive-deps
  const tableLayout = useMemo(() => (tableValue ? layoutBlocks(L.blocksOf(tableValue).groups, { ...inner, s: scale }) : null), [tableValue, scale, inner.width, inner.height]); // eslint-disable-line react-hooks/exhaustive-deps
  const finer = D.piecesOf(value).finer;

  const lay = useMemo(() => L.slipLayout({ width: iw, len: a.len, maxTile: Math.max(40, Math.min(64, Math.floor((bodyH - 30) / 1.7))) }), [iw, a.len, bodyH]);
  const cu = scale / 10;
  const shakeRef = useRef(null);
  useShake(shakeRef, lab.last?.verdict === 'nodigit' ? lab.trials.length : 0);

  const zone = (kind, label, children, extra = {}) => (
    <div className="relative" style={{ width: zoneW, height: zoneH }} data-dc-table={kind} {...extra}>
      <svg width={zoneW} height={zoneH} className="absolute inset-0" aria-hidden="true">
        {kind === 'tray' ? <WoodTray w={zoneW} h={zoneH} /> : <ClientTable w={zoneW} h={zoneH} />}
      </svg>
      {kind === 'tray' && showStamp ? (
        <span data-dc-stamp className="dc-stamp absolute left-1/2 top-1.5 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-xl border-[3px] border-emerald-600 bg-white px-3 py-0.5 text-sm font-black text-emerald-700 shadow-md">
          <Check className="h-4 w-4" strokeWidth={3.5} aria-hidden="true" /> {k('stamp.match')}
        </span>
      ) : (
        <span className={`absolute left-1/2 top-2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-0.5 text-xs font-black shadow-sm ${kind === 'tray' ? 'bg-amber-100 text-amber-950' : 'bg-white text-amber-900'}`}>{label}</span>
      )}
      {children}
    </div>
  );
  const blocksSvg = (layout, id) => {
    const dy = 30 + Math.max(0, (inner.height - layout.height) / 2);
    return (
      <svg width={zoneW} height={zoneH} className="absolute inset-0" role="img" aria-hidden="true">
        <MosaicDefs uid={`${uid}${id}`} c={cu} />
        <g transform={`translate(12 ${dy}) `}>
          <MosaicBlocks layout={layout} uid={`${uid}${id}`} popKey={id === 't' ? `${task.target}` : `${a.point}`} />
        </g>
      </svg>
    );
  };
  const orderCard = task.kind === 'fraction' && showTable && (
    <div className="absolute inset-0 flex items-center justify-center pt-5" data-dc-order>
      <div className="rounded-xl border-2 border-dashed border-amber-300 bg-white px-5 py-2.5 shadow-[0_6px_0_0_#FDE68A]">
        <Frac size={zoneW >= 300 ? 'lg' : 'md'} num={task.targetValue.n} zeros={task.targetValue.k} aria-label={k('order.aria', { num: task.targetValue.n, den: D.pow10(task.targetValue.k) })} />
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-center" style={{ gap }}>
        {showTable && zone('target', task.kind === 'fraction' ? k('zone.order') : k('zone.table'), task.kind === 'fraction' ? orderCard : blocksSvg(tableLayout, 't'))}
        {zone('tray', k('zone.tray'), (
          <>
            {blocksSvg(trayLayout, 'y')}
            {finer && (
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-extrabold text-slate-600 ring-1 ring-slate-200">+ {k('tinier')}</span>
            )}
          </>
        ), { 'data-verdict': verdict ?? '' })}
      </div>
      <div ref={shakeRef}>
        <SlipBlock a={a} lay={lay} ranks={ranks} written={written} release={release} k={k} />
      </div>
    </div>
  );
}

function SlipBlock({ a, lay, ranks, written, release, k, changed = null, onRemoveZero }) {
  return (
    <CommaSlip role="output" str={a.str} pos={a.pos} zl={a.zl} zr={a.zr} layout={lay} ranks={ranks} editable onRelease={release} onRemoveZero={onRemoveZero}
      changed={changed} written={written}
      labels={{ comma: k('slip.comma'), gap: k('slip.gap'), removeZero: k('slip.removeZero') }} />
  );
}

/* ══════════════ Monde « machine » : l'entrée, la machine, la sortie ══════════════ */

function MachineStage({ lab, a, setLab, k, iw, bodyH, ranks, written, release }) {
  const task = lab.tasks[lab.ti];
  const core = a.core;
  const inPoint = a.startPoint;
  const zl = a.zl;
  const zr = a.zr;
  const avail = iw - 2 * (ZBTN + 8);
  const tileCap = Math.max(34, Math.min(60, Math.floor((bodyH / 2 - 14) / 1.4)));
  const base = L.slipLayout({ width: avail, len: core.length + 2 * Math.max(zl, zr, 0), maxTile: tileCap, minTile: 22 });
  const mk = (len) => L.slipLayout({ width: 1e6, len, maxTile: base.tileW, minTile: base.tileW });
  const outLay = mk(a.len);
  const inLay = mk(core.length);
  const coreCenter = (lay, off) => (lay.tileLeft(off) + lay.tileLeft(off + core.length - 1) + lay.tileW) / 2;
  const axis = iw / 2;
  const outLeft = axis - coreCenter(outLay, zl);
  const inLeft = axis - coreCenter(inLay, 0);

  const inRanks = L.ranksOf(core, inPoint).map((r) => ({ ...r, hue: rankHue(r.exp) }));
  const outExps = D.exponentsOf(a.str, a.point);
  const inExps = D.exponentsOf(core, inPoint);
  const changed = new Map();
  const deltas = core.split('').map((_, j) => outExps[zl + j] - inExps[j]);
  deltas.forEach((d, j) => { if (d !== 0) changed.set(zl + j, d); });
  const links = deltas.map((delta, j) => ({ x1: axis + (inLay.tileLeft(j) + inLay.tileW / 2 - coreCenter(inLay, 0)), x2: axis + (outLay.tileLeft(zl + j) + outLay.tileW / 2 - coreCenter(outLay, zl)), delta }));

  const laneH = 54;
  const shakeRef = useRef(null);
  useShake(shakeRef, lab.last?.verdict === 'nodigit' ? lab.trials.length : 0);
  const zbtn = (side) => {
    const count = side === 'left' ? zl : zr;
    const full = count >= L.ZERO_MAX;
    return (
      <button type="button" disabled={full} onClick={() => setLab((s) => L.addZero(s, side))} data-dc-zero={side} aria-label={k(side === 'left' ? 'slip.addLeft' : 'slip.addRight')}
        className={`absolute flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-400 bg-white text-indigo-700 shadow-[0_4px_0_0_#C7D2FE] transition-all duration-150 hover:bg-indigo-50 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none ${ring}`}
        style={{ width: ZBTN, height: ZBTN, top: laneH + (outLay.tileH + 8 - ZBTN) / 2, [side === 'left' ? 'left' : 'right']: -(ZBTN + 8) }}>
        <bdi dir="ltr" className="flex items-center text-xl font-black leading-none"><Plus className="h-4 w-4" strokeWidth={3.5} aria-hidden="true" />0</bdi>
      </button>
    );
  };

  return (
    <div dir="ltr" className="relative mx-auto space-y-1" style={{ width: iw }}>
      <p className="text-center text-xs font-black text-indigo-900/70" dir="rtl">{k('zone.input')}</p>
      <div className="relative" style={{ marginLeft: inLeft, width: inLay.width }} data-dc-input>
        <CommaSlip role="input" str={core} pos={core.length - inPoint} layout={inLay} ranks={inRanks} written={D.slipText(core, inPoint)} labels={{ comma: '', gap: '', removeZero: '' }} />
      </div>
      <TenMachine width={iw} height={64} op={task ? (a.op ?? task.op) : ''} links={links} />
      <p className="text-center text-xs font-black text-indigo-900/70" dir="rtl">{k('zone.output')}</p>
      <div ref={shakeRef} className="relative" style={{ marginLeft: outLeft, width: outLay.width }} data-dc-output>
        <CommaSlip role="output" str={a.str} pos={a.pos} zl={zl} zr={zr} layout={outLay} ranks={ranks} editable onRelease={release} changed={changed} written={written}
          onRemoveZero={(side) => setLab((s) => L.removeZero(s, side))} laneH={laneH} knobSize={46}
          labels={{ comma: k('slip.comma'), gap: k('slip.gap'), removeZero: k('slip.removeZero') }} />
        {zbtn('left')}
        {zbtn('right')}
      </div>
    </div>
  );
}

/* ══════════════ « جرّب أعدادك أنت » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k, machine, wide }) {
  const free = L.isFree(lab);
  const [text, setText] = useState('');
  useEffect(() => { if (!lab.free) setText(''); }, [lab.free]);
  const onText = (e) => {
    const raw = e.target.value.replace(machine ? /[^0-9.,]/g : /[^0-9]/g, '');
    const digits = raw.replace(/[^0-9]/g, '');
    setText(digits.length > L.FREE_MAX_DIGITS ? text : raw);
    if (digits && digits.length <= L.FREE_MAX_DIGITS) setLab((s) => L.setFree(s, raw));
  };
  const op = lab.free?.op;
  return (
    <LabCard className="space-y-2 border-emerald-200 bg-emerald-50/50 p-3" data-dc-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-emerald-900"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k(machine ? 'free.hintMachine' : 'free.hintMosaic')}</p>
      <div className={`flex flex-wrap items-center gap-3 ${wide ? '' : ''}`}>
        <label className="flex items-center gap-2 text-xs font-black text-indigo-950">
          {k('free.digits')}
          <input type="text" inputMode={machine ? 'decimal' : 'numeric'} autoComplete="off" dir="ltr" value={text} onChange={onText} maxLength={machine ? 7 : 5}
            aria-label={k('free.digitsAria')} data-dc-free-digits
            className={`h-11 w-32 rounded-xl border-2 border-emerald-300 bg-white px-3 text-center text-xl font-black tabular-nums text-indigo-950 ${ring}`} />
        </label>
        {machine && (
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={k('free.op')} data-dc-free-op={op ?? ''}>
            {D.OPERATORS.map((o) => (
              <button key={o} type="button" onClick={() => { setLab((s) => L.setFreeOp(s, o)); if (!text) setText(lab.tasks[lab.ti].digits); }} aria-pressed={op === o} data-dc-free-op-button={o}
                className={`min-h-[44px] rounded-xl border-2 px-2.5 text-sm font-black ${op === o ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-indigo-100 bg-white text-indigo-900 hover:border-indigo-300'} ${ring}`}>
                <bdi dir="ltr">{o}</bdi>
              </button>
            ))}
          </div>
        )}
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-dc-free-back
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
  if (lab.world === 'machine') {
    const w = L.machineWitness(lab);
    return [
      { text: k('discovery.machine.digits'), why: k('discovery.machine.whyDigits', { digits: iso(w.first.digits), start: iso(w.first.start), result: iso(w.first.result) }) },
      { text: k('discovery.machine.right'), correct: true },
      {
        text: k('discovery.machine.zeros'),
        why: k(w.fewest.zeros.left + w.fewest.zeros.right === 0 ? 'discovery.machine.whyZeros' : 'discovery.machine.whyZerosSome', { op: iso(w.fewest.op), start: iso(w.fewest.start), result: iso(w.fewest.result) }),
      },
    ];
  }
  const pair = L.sameDigitsPair(lab);
  const digitsOf = (p) => k('digit', { count: p });
  return [
    { text: k('discovery.mosaic.same'), why: k('discovery.mosaic.whySame', { digits: iso(pair.digits), big: iso(pair.narrow.shown), small: iso(pair.wide.shown) }) },
    { text: k('discovery.mosaic.right'), correct: true },
    {
      text: k('discovery.mosaic.longer'),
      why: k('discovery.mosaic.whyLonger', { wide: iso(pair.wide.shown), narrow: iso(pair.narrow.shown), pw: digitsOf(pair.wide.point), pn: digitsOf(pair.narrow.point) }),
    },
  ];
}

const cell = 'border border-emerald-200 px-1 py-1 text-center';

export function Formal({ lab, k }) {
  if (lab.world === 'machine') return <FormalMachine lab={lab} k={k} />;
  const cards = lab.tasks.map((t, i) => {
    const s = lab.solved[i];
    if (!s) return null;
    const shownV = D.parse(s.shown);
    const v = D.normalize(shownV);
    const f = D.fractionOf(shownV);
    return { i, s, shownV, v, f, dec: D.decomposition(v) };
  }).filter(Boolean);
  const last = cards.at(-1);
  if (!last) return null;
  const table = D.rankTable(last.shownV);
  const trailing = cards.find((c) => D.normalize(c.shownV).k < c.shownV.k);
  const keeper = cards.find((c) => c.shownV.k >= 2 && c.dec.parts.every((p) => p.exp <= -2) && D.integerPart(c.shownV) === 0);
  return (
    <div className="space-y-2.5 text-sm font-bold text-emerald-950" data-dc-formal="mosaic">
      <div className="grid gap-2 grid-cols-2">
        {cards.map((c) => (
          <div key={c.i} className="space-y-1 rounded-2xl border border-emerald-200 bg-white/80 p-2.5" data-dc-formal-card={c.i}>
            <p className="flex flex-wrap items-center justify-center gap-x-2 text-base font-black text-indigo-950" dir="ltr">
              <span className="tabular-nums">{c.s.shown}</span><span>=</span><Frac num={c.f.num} zeros={c.f.zeros} />
            </p>
            <p className="text-center text-xs text-slate-700">{k('formal.reads', { words: D.readFraction(c.shownV) })}</p>
            <p className="flex flex-wrap items-center justify-center gap-x-2 text-sm font-extrabold text-indigo-950" dir="ltr">
              <span className="whitespace-nowrap">{c.dec.fraction}</span>
            </p>
            <p className="flex flex-wrap items-center justify-center gap-x-2 text-xs font-bold text-slate-600" dir="ltr">
              <span className="whitespace-nowrap">{c.dec.times}</span>
            </p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table dir="ltr" className="mx-auto w-full max-w-[520px] table-fixed border-collapse text-center" data-dc-formal-table>
          <caption className="pb-1 text-sm font-black" dir="rtl">{k('formal.tableTitle', { shown: iso(last.s.shown) })}</caption>
          <thead>
            <tr>{table.map((r) => <th key={r.exp} className={`${cell} text-[11px] font-black leading-tight`} dir="rtl" style={{ background: rankHue(r.exp).soft, color: rankHue(r.exp).edge }}>{D.rankName(r.exp).replace(/^ال/, '')}</th>)}</tr>
          </thead>
          <tbody>
            <tr>{table.map((r) => <td key={r.exp} className={`${cell} text-xl font-black ${r.digit === 0 ? 'text-slate-300' : 'text-indigo-950'}`} data-zero={r.digit === 0 ? 'true' : undefined}>{r.digit}</td>)}</tr>
          </tbody>
        </table>
      </div>
      {last.shownV.k > 0 && (
        <p className="text-center" data-dc-formal-count>{k('formal.count', { rank: D.rankName(-last.shownV.k), shown: iso(last.s.shown), count: iso(D.countOfExp(last.shownV, -last.shownV.k)) })}</p>
      )}
      {keeper && <p className="text-center" data-dc-formal-keeper>{k('formal.zeroKeeper', { shown: iso(keeper.s.shown), rank: D.rankName(-1) })}</p>}
      {trailing && <p className="text-center" data-dc-formal-trailing><bdi dir="ltr" className="font-black">{k('formal.trailing', { long: iso(trailing.s.shown), short: iso(D.formatTrim(trailing.shownV)) })}</bdi></p>}
      <p>{k('formal.rule')}</p>
    </div>
  );
}

function FormalMachine({ lab, k }) {
  const ti = lab.tasks.reduce((best, _, i) => (lab.solved[i] ? i : best), 0);
  const task = lab.tasks[ti];
  const s = lab.solved[ti];
  if (!s) return null;
  const zl = s.zeros.left;
  const inExps = D.exponentsOf(task.digits, task.startPoint);
  const outExps = D.exponentsOf(s.digits, s.point);
  const mv = L.movedPlaces(task);
  return (
    <div className="space-y-2.5 text-sm font-bold text-emerald-950" data-dc-formal="machine">
      <p className="text-center font-black">{k('formal.machineTitle', { eq: iso(`${task.start} ${task.op} = ${s.value}`) })}</p>
      <div className="overflow-x-auto">
        <table dir="ltr" className="mx-auto w-full max-w-[520px] table-fixed border-collapse text-center" data-dc-formal-table>
          <tbody>
            <tr>
              {task.digits.split('').map((_, j) => <td key={j} className={`${cell} text-[11px] leading-tight`} dir="rtl" style={{ background: rankHue(inExps[j]).soft }}>{D.rankName(inExps[j]).replace(/^ال/, '')}</td>)}
              <td className="px-1 text-[11px]" dir="rtl">{k('formal.before')}</td>
            </tr>
            <tr>
              {task.digits.split('').map((d, j) => <td key={j} className={`${cell} text-xl font-black text-indigo-950`}>{d}<span className="block text-xs text-amber-600" aria-hidden="true">↓</span></td>)}
              <td />
            </tr>
            <tr>
              {task.digits.split('').map((_, j) => <td key={j} className={`${cell} text-[11px] leading-tight`} dir="rtl" style={{ background: rankHue(outExps[zl + j]).soft }}>{D.rankName(outExps[zl + j]).replace(/^ال/, '')}</td>)}
              <td className="px-1 text-[11px]" dir="rtl">{k('formal.after')}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-center" data-dc-formal-moved>{k('formal.moved', { op: iso(task.op), places: k('places', { count: mv.places }), dir: k(mv.direction === 'right' ? 'formal.dirRight' : 'formal.dirLeft') })}</p>
      {s.shown !== s.value && <p className="text-center" data-dc-formal-clean>{k('formal.clean', { shown: iso(s.shown), value: iso(s.value) })}</p>}
      <p>{k('formal.ruleMachine')}</p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La planche RÉUSSIE de la tâche i (celle de l'élève, sinon la solution la plus courte) : { str, point, shown, zeros }. */
export function solvedOf(lab, i) {
  const s = lab.solved[i];
  if (s) return { str: s.digits, point: s.point, shown: s.shown, zeros: s.zeros };
  const sol = L.solutions(lab.tasks[i]).reduce((b, x) => (b === null || x.zl + x.zr < b.zl + b.zr ? x : b), null);
  const point = sol.str.length - sol.pos;
  return { str: sol.str, point, shown: D.slipText(sol.str, point), zeros: { left: sol.zl, right: sol.zr } };
}

const decimalsOf = (str, point) => str.slice(str.length - point);
const hasKeptZero = (str, point) => point >= 2 && /^0+[1-9]/.test(decimalsOf(str, point));
const hasTrailingZero = (str, point) => point >= 1 && /0$/.test(str) && /[1-9]/.test(decimalsOf(str, point));

/** La suite de la tâche i : une question sans objet est retirée ; la DERNIÈRE tâche finit par la règle (l'ancienne découverte). */
export function chainOf(lab, i) {
  const t = lab.tasks[i];
  let out;
  if (t.kind === 'shift') {
    const z = L.zerosNeeded(t) ?? { left: 0, right: 0 };
    out = ['result', 'moved', ...(z.left + z.right > 0 ? ['zeros'] : [])];
  } else {
    const { str, point } = solvedOf(lab, i);
    if (t.kind === 'fraction') out = ['places', 'count'];
    else if (hasTrailingZero(str, point)) out = ['trailing', 'count'];
    else out = ['count', hasKeptZero(str, point) ? 'zero' : point >= 2 && Number(decimalsOf(str, point)[0]) > 0 ? 'tenth' : 'places'];
  }
  return i === lab.tasks.length - 1 ? [...out, 'rule'] : out;
}

const C = (k, key, o) => k(`cp.${key}`, o);
const pick = (list, right, whys) => list.map((text, i) => (i === right ? { text, correct: true } : { text, why: whys[i] }));
const big = (x) => <bdi dir="ltr">{x}</bdi>;

/** Chaque question est construite sur LES chiffres de la tâche (rien en dur). */
export const QUESTIONS = {
  count: (lab, i, k) => {
    const { str, point, shown } = solvedOf(lab, i);
    const v = D.fromSlip(str, point);
    const n = Number(v.n);
    const int = D.integerPart(v);
    const fracOnly = n - int * 10 ** point;
    const unit = D.rankName(-point);
    let other; let whyOther;
    if (int > 0 && fracOnly !== n) { other = fracOnly; whyOther = C(k, 'count.whyFrac', { w: iso(fracOnly), int: iso(int) }); }
    else if (n >= 10) { other = Math.floor(n / 10); whyOther = C(k, 'count.whyBigger', { w: iso(other), bigger: D.rankName(-point + 1) }); }
    else { other = n * 100; whyOther = C(k, 'count.whySmaller', { w: iso(other), smaller: D.rankName(-point - 2) }); }
    const o = { shown: iso(shown), unit, n: iso(n), frac: iso(`${n}/${D.pow10(point)}`) };
    return {
      id: 'count', kind: 'choice', cols: 3, prompt: C(k, 'count.prompt', o),
      options: pick([iso(n), iso(n * 10), iso(other)], 0, [null, C(k, 'count.whySmaller', { w: iso(n * 10), smaller: D.rankName(-point - 1) }), whyOther]),
      hints: [C(k, 'count.hint1', o), C(k, 'count.hint2', o)], explain: C(k, 'count.explain', o),
    };
  },
  tenth: (lab, i, k) => {
    const { str, point } = solvedOf(lab, i);
    const d = Number(decimalsOf(str, point)[0]);
    const ten = 10 ** (point - 1);
    const o = { d: iso(d), unit: D.rankName(-point), ten: iso(ten), calc: iso(`${d} × ${ten} = ${d * ten}`) };
    return {
      id: 'tenth', kind: 'number', expected: String(d * ten), answer: big(d * ten),
      prompt: C(k, 'tenth.prompt', o), hints: [C(k, 'tenth.hint1', o), C(k, 'tenth.hint2', o)], explain: C(k, 'tenth.explain', o),
    };
  },
  zero: (lab, i, k) => {
    const { str, point, shown } = solvedOf(lab, i);
    const dec = decimalsOf(str, point);
    const lead = dec.match(/^0+/)[0].length;
    const without = D.slipText(str.slice(0, str.length - point) + dec.slice(1), point - 1);
    const d = dec[lead];
    const o = { shown: iso(shown), without: iso(without), d: iso(d), unit: D.rankName(-point), bigger: D.rankName(-point + 1), empty: D.rankName(-lead) };
    return {
      id: 'zero', kind: 'choice', prompt: C(k, 'zero.prompt', o),
      options: pick([C(k, 'zero.right', o), C(k, 'zero.same'), C(k, 'zero.smaller')], 0, [null, C(k, 'zero.whySame', o), C(k, 'zero.whySmaller', o)]),
      hints: [C(k, 'zero.hint1', o), C(k, 'zero.hint2', o)], explain: C(k, 'zero.explain', o),
    };
  },
  places: (lab, i, k) => {
    const t = lab.tasks[i];
    const { point, shown } = solvedOf(lab, i);
    const den = D.pow10(point);
    const o = { shown: iso(shown), target: iso(t.target), den: iso(den), p: iso(point) };
    return {
      id: 'places', kind: 'number', expected: String(point), answer: big(point),
      prompt: C(k, t.kind === 'fraction' ? 'places.promptFraction' : 'places.prompt', o),
      hints: [C(k, 'places.hint1'), C(k, t.kind === 'fraction' ? 'places.hint2Fraction' : 'places.hint2', o)],
      explain: C(k, 'places.explain', o),
    };
  },
  trailing: (lab, i, k) => {
    const t = lab.tasks[i];
    const { point, shown } = solvedOf(lab, i);
    const o = { shown: iso(shown), target: iso(t.target), unit: D.rankName(-point) };
    return {
      id: 'trailing', kind: 'choice', prompt: C(k, 'trailing.prompt', o),
      options: pick([C(k, 'trailing.right'), C(k, 'trailing.bigger', o), C(k, 'trailing.smaller', o)], 0, [null, C(k, 'trailing.whyBigger', o), C(k, 'trailing.whySmaller', o)]),
      hints: [C(k, 'trailing.hint1', o), C(k, 'trailing.hint2', o)], explain: C(k, 'trailing.explain', o),
    };
  },
  result: (lab, i, k) => {
    const t = lab.tasks[i];
    const o = { start: iso(t.start), op: iso(t.op), result: iso(t.target), eq: iso(`${t.start} ${t.op} = ${t.target}`) };
    return {
      id: 'result', kind: 'number', expected: t.target, answer: big(t.target),
      prompt: C(k, 'result.prompt', o), hints: [C(k, 'result.hint1'), C(k, t.e > 0 ? 'result.hint2Up' : 'result.hint2Down')], explain: C(k, 'result.explain', o),
    };
  },
  moved: (lab, i, k) => {
    const t = lab.tasks[i];
    const n = Math.abs(t.e);
    const dir = (right) => k(right ? 'formal.dirRight' : 'formal.dirLeft');
    const opt = (m, right) => C(k, 'moved.opt', { n: k('places', { count: m }), dir: dir(right) });
    const m2 = n < 3 ? n + 1 : n - 1;
    const o = { start: iso(t.start), op: iso(t.op), result: iso(t.target), n: k('places', { count: n }) };
    return {
      id: 'moved', kind: 'choice', prompt: C(k, 'moved.prompt', o),
      options: pick([opt(n, t.e > 0), opt(n, t.e < 0), opt(m2, t.e > 0)], 0, [null, C(k, 'moved.whyDir', o), C(k, 'moved.whyCount', o)]),
      hints: [C(k, 'moved.hint1', o), C(k, 'moved.hint2', o)], explain: C(k, 'moved.explain', o),
    };
  },
  zeros: (lab, i, k) => {
    const t = lab.tasks[i];
    const o = { start: iso(t.start), op: iso(t.op), result: iso(t.target) };
    return {
      id: 'zeros', kind: 'choice', prompt: C(k, 'zeros.prompt', o),
      options: pick([C(k, 'zeros.right'), C(k, 'zeros.always'), C(k, 'zeros.bigger')], 0, [null, C(k, 'zeros.whyAlways'), C(k, 'zeros.whyBigger')]),
      hints: [C(k, 'zeros.hint1'), C(k, 'zeros.hint2', o)], explain: C(k, 'zeros.explain', o),
    };
  },
  rule: (lab, i, k) => ({
    id: 'rule', kind: 'choice', prompt: k(`discovery.${lab.world}.prompt`), options: discoveryOptions(lab, k),
    hints: [C(k, `rule.${lab.world}.hint1`), C(k, `rule.${lab.world}.hint2`)], explain: <Formal lab={lab} k={k} />,
  }),
};
