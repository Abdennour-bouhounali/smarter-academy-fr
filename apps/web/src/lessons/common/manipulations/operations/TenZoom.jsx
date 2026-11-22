import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Sparkles, Hand, FlaskConical, Undo2, RotateCcw, ChevronLeft, ShieldAlert, Plus } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import * as T from '@smarter-academy/core/arithmetic/tenPowers.js';
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
import * as L from '../logic/tenZoom';
import { CSS, VB_W, VB_H, CX, CY, R_IN, R_OUT, FRAME, NOTCH_DEG, Bench, Ring, Frame, Vignette, SCENE_IDS } from './tenZoom/art';

/**
 * ten-zoom — LA BAGUE QUI ZOOME PAR DIX : « عدسة القوى » (3AM, unité 3 « القوى ذات أسس نسبية صحيحة », درس « قوى العدد 10 », 2026-10-26).
 * La logique, exacte, est dans `logic/tenZoom.js` (sur `packages/core/arithmetic/tenPowers.js`, importé PAR CHEMIN) ; le dessin dans `tenZoom/art.jsx`.
 * Distinct de `power-train` (la main bâtit un PRODUIT facteur par facteur, la charge est la sortie), `decimal-comma` (1AM : la main déplace la VIRGULE d'un
 * décimal arbitraire) et `ruler-compare` (1AM : la main choisit une graduation) : ici la main change une ÉCHELLE ; rien n'est multiplié par elle ; la preuve est
 * l'écriture décimale du côté et une grandeur physique. Geste : TOURNER la bague / PINCER la lentille / molette — aucun des trois n'en use.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main tourne la bague (glisser autour, boutons ×10 / ÷10, pincement, molette, clavier + −) : n, le nombre de crans à partir du cadre de 1 m ; puis « ثبّت الإطار ».
 * B. Chaque cran ×10 ou ÷10 le côté ; la plaque lit le côté en décimal (le 1 se déplace, un zéro apparaît ou disparaît) ; un cadre faux est REFUSÉ avec les deux côtés côte à côte.
 * C. Le cadre qui s'agrandit rentre dans UNE cellule de la grille 10 × 10 du nouveau cadre ; en zoom avant la cellule centrale remplit la lentille ; l'échelle ne devient jamais négative.
 * D. Chaque cran, prédiction et verdict est un essai jugé exactement (MANUEL §6bis).
 * E. À découvrir : مبتدئ « العلاقة بين nombre de crans et côté » ; متقدم « où est le 1 après trois crans de réduction ». La notation 10ⁿ n'est NOMMÉE qu'à la phase formelle.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        10ⁿ = 1 suivi de n zéros ; 10⁰ = 1 ; 10⁻ⁿ a son 1 au rang n après la virgule ; les préfixes sont des puissances de 10
 *   OBJECT         la table du club de sciences : lentille de laiton, bague crantée, cadre carré, plaque « ضلع الإطار » ; Maryam (KidFigure, hijab) tient la carte
 *   VARIABLE       n, le nombre de crans (entier relatif) à partir du cadre de 1 m
 *   INVARIANT      un cran change le côté d'un facteur exactement 10 ; sans cran le côté reste 1 m
 *   TRANSFORMATION cran → côté × ou ÷ 10 → un zéro de plus ou de moins sur la plaque
 *   CONSTRAINT     un seul cadre à la fois ; la bague s'arrête à ±12 ; la prédiction se fait AVANT le premier cran
 *   RESISTANCE     10ⁿ = 10 × n (la plaque ne montre jamais 30 pour 3 crans) ; n = nombre de chiffres (7 pour 1 000 000) ; 10⁻ⁿ négatif (le cadre rapetisse, la plaque reste positive) ; n zéros après la virgule
 *   EVIDENCE       la plaque en décimal, l'unité nommée, le décor à l'échelle, le refus « 10 000 = 1 000 × 10 »
 *   CONTRAST       z3 (réduction), z4 (retour : 0 cran), z7 (0,0000001 m avec prédiction 6 / 7 / 8)
 *   PREDICTION     « كم نقرة ؟ » avant le premier cran (z2, z7)
 *   DISCOVERY      voir E
 *   FORMALIZATION  10³ = 10 × 10 × 10 = 1 000 ; 10⁰ = 1 ; 10⁻³ = 1/10³ = 0,001
 *   TRANSFER       « جرّب أعدادك » (toujours ouvert), les exercices et la banque
 *
 * QUESTIONS PENDANT LE LABO (2026-10-28, lot 6) : après chaque tâche une suite de 2 questions se pose PAR-DESSUS le labo (`CHAINS`, `QUESTIONS` en bas du fichier) sur ce que l'élève vient de
 * FAIRE avec SA bague : le nombre de crans, ce que fait un cran, les zéros, la rang du 1, le retour à 1 m, les noms d'unités ; la dernière tâche de chaque niveau finit par LA RÈGLE
 * (la découverte d'avant passe dans la carte) ; le monde `prefixes` n'a pas de règle. Étapes `LabStepper` (`[data-tz-step=<i>]`) + fête ; « إعادة » repart de la tâche 1 ; obligatoires pour
 * tout élève, coupées par l'enseignant pour SON compte (`useLabCheckpointSettings`) ; `checkpoints` = false les coupe aussi ; `onCheckpoint(ev)` : la trace pour les étapes du module.
 *
 * D'UN SEUL REGARD (§8bis) : `[data-tz-glance]` enveloppe la consigne, la carte, la lentille, la plaque, les boutons et le verdict.
 * ONBOARDING : `coach` (défaut true) → `LabCoach` ; `logic/tenZoom.js › coachOf` (predict · ring · plate · dock · next · free).
 * Props : `tasks`, `world` ('zoom' | 'prefixes'), `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({ world })`.
 * CONTRAT DOM : [data-ten-zoom][data-world][data-n][data-task][data-solved], [data-tz-glance], [data-tz-scene], [data-tz-lens], [data-tz-ring][role=slider], [data-tz-plate], [data-tz-side],
 * [data-tz-unit], [data-tz-tally], [data-tz-card], [data-tz-predict=<i>], [data-tz-predict-card], [data-tz-less], [data-tz-more], [data-tz-dock], [data-tz-next], [data-tz-banner],
 * [data-tz-free], [data-tz-free-input], [data-tz-formal], [data-tz-kid].
 */
const NS = 'manipulation.tenZoom';
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-amber-300';
const sp = (n) => T.decText({ m: BigInt(n), e: 0 });
/** Un décimal exact en LaTeX (îlot LTR dans le texte arabe) : 10\,000 · 0{,}001 */
const texs = (v) => { const [w, f] = T.decText(v).split(','); return w.replace(/\u00A0/g, '\\,') + (f ? `{,}${f}` : ''); };
const tex = (v) => `$${texs(v)}$`;
const p10tex = (nn) => tex(T.pow10(nn));

export function numbersFor({ tasks, world, level }) {
  if (world === 'prefixes') return { ...L.PRESETS.prefixes, tasks: tasks ?? L.PRESETS.prefixes.tasks };
  const lv = resolveLevelId(level ?? 'beginner');
  const asked = LEVELS['ten-zoom'][lv].numbers;
  return { ...asked, world: world ?? asked.world, tasks: tasks ?? asked.tasks };
}

export default function TenZoom({
  tasks, world, title, lead, level, levels: withLevels = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished, onCheckpoint,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ tasks, world, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'ten-zoom', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const kind = L.discoveryKind(lab);
  // les questions pendant le labo : la suite de la tâche courante ; celle qui finit par la règle remplace la découverte automatique
  const cpSettings = useLabCheckpointSettings('ten-zoom');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cur = L.taskOf(lab);
  const chain = cpOn && cpSettings.enabled && !L.isFree(lab) ? CHAINS[cur.id] ?? null : null;
  const ruleByCheckpoint = cpOn && cpSettings.enabled && lab.tasks.some((tk) => CHAINS[tk.id]?.includes('rule'));
  const taskReached = L.taskDone(lab);
  const cp = useLabCheckpoint({
    id: chain ? cur.id : null,
    questions: chain && taskReached ? chain.map((q) => QUESTIONS[q](lab, cur, k)) : null,
    reached: taskReached,
    resetKey: scene.inits,
    onRetry: () => setLab(L.retryTask),
    onEvent: (ev) => state.report(onCheckpoint, ev),
    onDone: (id) => { if (CHAINS[id]?.includes('rule')) { state.discover(); state.formalize(); } },
  });
  useEffect(() => { if (kind && !ruleByCheckpoint) state.discover(); }, [kind, state.epoch, ruleByCheckpoint]); // eslint-disable-line react-hooks/exhaustive-deps
  // une étape est FAITE quand son cadre est posé ET que ses questions sont répondues : alors la pastille passe au vert et on fête
  const stepDone = lab.tasks.map((_, i) => !!lab.done[i] && (i !== lab.ti || !cp.blocking));
  const stepper = lab.tasks.length > 1 && !L.isFree(lab) && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-tz-step" />
  );
  const party = useStepCelebration();
  const celebrated = useRef({ inits: 0, set: new Set() });
  if (celebrated.current.inits !== scene.inits) celebrated.current = { inits: scene.inits, set: new Set() };   // « إعادة » : on refête
  const nowDone = !L.isFree(lab) && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.set.has(lab.ti)) return;
    celebrated.current.set.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps
  /* ── le son (muet sauf « الصوت ») : un cran à chaque nouvelle dent de la bague (plus grave en réduisant), la cloche quand la plaque nomme une unité, le drapeau au cadre posé, « over » pour un refus ── */
  const heardAt = useRef({ notches: 0, at: 0 });
  useEffect(() => {
    const h = heardAt.current;
    if (lab.notches > h.notches) {
      const now = performance.now();
      if (now - h.at > 35) { playSfx('tooth', { pitch: lab.dir < 0 ? 0.75 : 1 }); h.at = now; }
      if (L.unitPill(lab.n, lab.world)) playSfx('bell');
    }
    h.notches = lab.notches;
  }, [lab.notches]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const l = lab.last;
    if (!l) return;
    if (l.kind === 'refused' || l.kind === 'limit') playSfx('over');
    else if (l.kind === 'solved') playSfx('flag');
  }, [lab.flash]); // eslint-disable-line react-hooks/exhaustive-deps
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

  const coachStep = coachOn ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'ten-zoom', step: coachStep,
    text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });

  const discovery = kind ? (
    <ManipulationDiscovery state={state} prompt={<MathText>{k(`discovery.${kind}.prompt`)}</MathText>} options={discoveryOptions(k, kind)} formal={<Formal k={k} />} />
  ) : null;

  return (
    <ManipulationShell
      type="ten-zoom"
      title={title ?? k('title')}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      coach={coachOn ? coach : null}
      headerAction={cpOn ? cpSettings.control : null}
      guided={!!chain || ruleByCheckpoint}
      hints={[0, 1, 2].map((i) => k(`hints.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={discovery}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-amber-50/70 to-white">
        <div className="space-y-2" data-ten-zoom data-world={lab.world} data-n={lab.n} data-task={lab.ti} data-solved={everyDone ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} lead={state.isAuthoredLevel ? lead : null}
            overlay={<>{party.node}{cp.node}</>} stepper={stepper} blocked={cp.blocking} />
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Le laboratoire ══════════════ */

const timesWord = (kk) => (kk === 1 ? '10 مرّات' : `${p10tex(kk)} مرّة`);
const againWord = (kk) => (kk === 1 ? '' : kk === 2 ? 'مرّتين' : `${kk} مرّات`);

function cardText(card, k) {
  if ('dec' in card) return k('card.dec', { v: T.pow10Text(card.dec) });
  if ('name' in card) return k('card.name', { v: T.pow10Name(card.name) });
  if ('km' in card) return k('card.km', { v: T.decText({ m: BigInt(card.km), e: 0 }) });
  const p = T.prefixOf(card.unit);
  if (card.def) return card.unit < 0 ? k('card.unitFrac', { p: p.name, name: T.pow10Name(card.unit) }) : k('card.unitMulti', { p: p.name, name: T.pow10Name(card.unit) });
  return k('card.unit', { p: p.name });
}

function Lab({ lab, setLab, k, lead, overlay, stepper, blocked }) {
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const done = L.taskDone(lab);
  const pending = L.predictionPending(lab);
  const prefixes = lab.world === 'prefixes';
  const ctxKey = free ? 'free' : prefixes ? 'prefixes' : lab.tasks[lab.ti]?.startAt === 'prev' ? 'carry' : lab.ti === 0 ? 'first' : 'again';
  const prompt = (
    <PromptCard size="md"
      context={<MathText>{`${free ? `${k('context.freePrefix')} ` : ''}${k(`context.${ctxKey}`)}`}</MathText>}
      contextProps={{ 'data-tz-context': ctxKey }}
      title={<MathText>{k(prefixes ? 'question.prefixes' : 'question.zoom')}</MathText>} titleClassName="text-base" lamp={free ? null : done ? 'on' : 'off'}
      titleProps={{ 'data-tz-prompt': prefixes ? 'prefixes' : 'zoom', 'data-lit': done ? 'true' : 'false' }}
      aside={stepper || undefined}
      instruction={lead || undefined} />
  );
  const vv = verdictOf(lab, k);
  const canNext = L.canNext(lab) && !blocked;
  const Icon = vv.tone === 'emerald' ? CheckCircle2 : vv.tone === 'amber' ? ShieldAlert : vv.tone === 'indigo' ? Hand : Sparkles;
  const btn = `inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border-2 px-3.5 text-sm font-black transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`;
  const banner = (
    <VerdictBanner tone={vv.tone} icon={Icon} size="sm" className="min-h-[2.75rem] !py-1.5" data-tz-banner data-tz-refused={vv.refused || undefined} data-code={vv.code}>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <p className={vv.tone === 'indigo' ? 'font-bold text-indigo-900' : ''}><MathText>{vv.text}</MathText></p>
        <div className="flex flex-wrap items-center gap-2">
          {lab.n !== 0 && !done && (
            <button type="button" onClick={() => setLab(L.restartTask)} data-tz-retry className={`${btn} border-amber-300 bg-amber-50 text-amber-950`}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> {k('retry')}
            </button>
          )}
          {!done && (
            <button type="button" disabled={pending} onClick={() => setLab(L.dock)} data-tz-dock
              className={`${btn} ${pending ? 'border-slate-200 bg-slate-50 text-slate-400' : 'border-amber-600 bg-amber-500 text-white shadow-[0_3px_0_0_#B45309]'}`}>
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {k('dock')}
            </button>
          )}
          {canNext && (
            <button type="button" onClick={() => setLab(L.nextTask)} data-tz-next className={`${btn} border-emerald-600 bg-emerald-600 text-white shadow-[0_3px_0_0_#047857]`}>
              {k('next')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </VerdictBanner>
  );

  return (
    <>
      <div className="relative space-y-2" data-tz-glance>
        {overlay}
        {prompt}
        <MissionRow lab={lab} setLab={setLab} k={k} task={task} />
        <Scene lab={lab} setLab={setLab} k={k} />
        <Plate lab={lab} setLab={setLab} k={k} />
        {banner}
      </div>
      <FreeCard lab={lab} setLab={setLab} k={k} />
    </>
  );
}

/* ══════════════ La carte à atteindre et la prédiction ══════════════ */

function MissionRow({ lab, setLab, k, task }) {
  const done = L.taskDone(lab);
  const pending = L.predictionPending(lab);
  const wobble = lab.wobble && done;
  const shake = lab.flash % 2 ? 'tz-shake-a' : 'tz-shake-b';
  return (
    <div className="flex flex-wrap items-stretch gap-2" data-tz-mission>
      <div data-tz-card data-target={task.target} data-done={done ? 'true' : 'false'}
        className={`flex min-h-[48px] min-w-0 flex-1 items-center gap-2 rounded-2xl border-[3px] px-3 py-1.5 ${wobble ? shake : ''} ${done ? 'border-emerald-500 bg-emerald-50' : 'border-amber-400 bg-amber-50'}`}>
        <span className="text-xs font-black text-amber-900">{k('card.label')}</span>
        <span className="min-w-0 text-lg font-black text-amber-950" dir="rtl"><MathText>{cardText(task.card, k)}</MathText></span>
        {done && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" data-tz-stamp />}
      </div>
      {task.predict && !done && (
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/70 px-2.5 py-1.5" data-tz-predict-card role="group" aria-label={k(`predict.${task.predict.q}`)}>
          <span className="text-xs font-black text-indigo-950">{k(`predict.${task.predict.q}`)}</span>
          {task.predict.options.map((o, i) => (
            <button key={o} type="button" data-tz-predict={i} aria-pressed={lab.pick === i} disabled={!pending} onClick={() => setLab((s) => L.choosePrediction(s, i))}
              className={`min-h-[40px] min-w-[52px] rounded-xl border-2 px-2.5 text-base font-black tabular-nums ${ring} ${lab.pick === i ? 'border-indigo-700 bg-indigo-600 text-white' : pending ? 'border-indigo-300 bg-white text-indigo-950' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
              <bdi dir="ltr">{sp(o)}</bdi>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════ La scène : table, lentille, bague, cadre, décor ══════════════ */

function Scene({ lab, setLab, k }) {
  const clipId = useId().replace(/:/g, '');
  const svgRef = useRef(null);
  const done = L.taskDone(lab);
  const blocked = done || L.predictionPending(lab);
  const [acc, setAcc] = useState(0);
  const drag = useRef(null);
  const pinch = useRef({ pts: new Map(), d0: null });
  const wheelAt = useRef(0);
  const n = lab.n;
  const hasScene = SCENE_IDS.includes(n);
  const mood = done ? 'proud' : lab.last?.kind === 'refused' ? 'wonder' : lab.last?.kind === 'notch' ? 'wonder' : 'happy';
  const angle = n * NOTCH_DEG + acc;

  const toSvg = (e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: p.x, y: p.y };
  };
  const angleOf = (e) => { const p = toSvg(e); return (Math.atan2(p.x - CX, -(p.y - CY)) * 180) / Math.PI; };
  const onRingDown = (e) => {
    if (blocked) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { last: angleOf(e), acc: 0 };
  };
  const onRingMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const a = angleOf(e);
    let delta = a - d.last;
    if (delta > 180) delta -= 360; else if (delta < -180) delta += 360;
    d.last = a; d.acc += delta;
    while (d.acc >= NOTCH_DEG) { d.acc -= NOTCH_DEG; setLab((s) => L.notch(s, 1)); }
    while (d.acc <= -NOTCH_DEG) { d.acc += NOTCH_DEG; setLab((s) => L.notch(s, -1)); }
    setAcc(Math.max(-NOTCH_DEG / 2, Math.min(NOTCH_DEG / 2, d.acc)));
  };
  const onRingUp = () => { drag.current = null; setAcc(0); };
  const onRingKey = (e) => {
    if (blocked) return;
    const up = ['ArrowRight', 'ArrowUp', '+', '=', 'PageUp'];
    const down = ['ArrowLeft', 'ArrowDown', '-', '−', 'PageDown'];
    if (up.includes(e.key)) { e.preventDefault(); setLab((s) => L.notch(s, 1)); } else if (down.includes(e.key)) { e.preventDefault(); setLab((s) => L.notch(s, -1)); }
  };
  /* pincement (tablette) : écarter = cadre plus petit ; rapprocher = cadre plus grand */
  const onLensDown = (e) => {
    if (e.pointerType === 'mouse' || blocked) return;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* pointeur déjà levé */ }
    pinch.current.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current.pts.size === 2) pinch.current.d0 = pinchDist(pinch.current.pts);
  };
  const onLensMove = (e) => {
    const p = pinch.current;
    if (!p.pts.has(e.pointerId)) return;
    p.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (p.pts.size !== 2 || !p.d0) return;
    const d = pinchDist(p.pts);
    if (d > p.d0 * 1.45) { p.d0 = d; setLab((s) => L.notch(s, -1)); } else if (d < p.d0 / 1.45) { p.d0 = d; setLab((s) => L.notch(s, 1)); }
  };
  const onLensUp = (e) => { pinch.current.pts.delete(e.pointerId); pinch.current.d0 = null; };
  /* molette (portable) : vers le haut = zoom avant = cadre plus petit */
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      const now = Date.now();
      if (now - wheelAt.current < 140) return;
      wheelAt.current = now;
      setLab((s) => L.notch(s, e.deltaY < 0 ? -1 : 1));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [setLab]);

  const frameX = CX - FRAME / 2;
  const frameY = CY - FRAME / 2;
  const old = lab.epoch > 0 && lab.dir !== 0 ? lab.prevN : null;
  const place = `translate(${frameX} ${frameY}) scale(${FRAME / 200})`;

  return (
    <StageFrame className="min-w-0 overflow-hidden !p-1.5" data-tz-stage>
      <div dir="ltr" data-tz-scene>
        <svg ref={svgRef} viewBox={`0 14 ${VB_W} ${VB_H - 34}`} className="block h-auto w-full max-h-[38vh]" role="group" aria-label={k('scene.aria')} data-tz-lens-svg style={{ touchAction: 'none' }}>
          <defs>
            <clipPath id={`lens${clipId}`}><circle cx={CX} cy={CY} r={R_IN - 2} /></clipPath>
            <clipPath id={`frame${clipId}`}><rect x={frameX} y={frameY} width={FRAME} height={FRAME} /></clipPath>
            <pattern id={`hatch${clipId}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#E2E8F0" /><line x1="0" y1="0" x2="0" y2="8" stroke="#CBD5E1" strokeWidth="3" /></pattern>
          </defs>
          <Bench />
          <g data-tz-kid aria-hidden="true">
            <KidFigure cx={62} top={206} foot={326} hairStyle="hijab" scarf="lavender" outfit="violet" skin="medium" mood={mood} />
          </g>
          <g clipPath={`url(#lens${clipId})`} data-tz-lens data-n={n}>
            <rect x={CX - R_IN} y={CY - R_IN} width={2 * R_IN} height={2 * R_IN} fill={`url(#hatch${clipId})`} />
            <g clipPath={`url(#frame${clipId})`}>
              <rect x={frameX} y={frameY} width={FRAME} height={FRAME} fill="#F8FAFC" />
              <g transform={place}>
                {old !== null && <g key={`o${lab.epoch}`} className="tz-old" style={{ '--tz-f': lab.dir > 0 ? 0.1 : 10 }}><Vignette n={old} /></g>}
                <g key={`n${lab.epoch}`} className={old !== null ? 'tz-new' : undefined}><Vignette n={n} /></g>
              </g>
              {!hasScene && <text x={CX} y={CY + 4} textAnchor="middle" fontSize="13" fontWeight="800" fill="#475569" data-tz-noscene>{k('scene.none')}</text>}
            </g>
            <Frame />
            <path d={`M${CX - R_IN} ${CY - R_IN} h${2 * R_IN} v${2 * R_IN} h${-2 * R_IN} Z M${frameX} ${frameY} v${FRAME} h${FRAME} v${-FRAME} Z`} fill="#0F172A" opacity=".18" fillRule="evenodd" />
            <path d={`M${CX - 96} ${CY - 70} A 110 110 0 0 1 ${CX - 20} ${CY - 112}`} fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".55" />
          </g>
          <circle cx={CX} cy={CY} r={R_IN - 2} fill="transparent" data-tz-lens-hit onPointerDown={onLensDown} onPointerMove={onLensMove} onPointerUp={onLensUp} onPointerCancel={onLensUp} />
          <Ring angle={angle} active={!blocked} />
          <g data-tz-ring role="slider" tabIndex={blocked ? -1 : 0} aria-label={k('ring.aria')} aria-valuemin={L.N_MIN} aria-valuemax={L.N_MAX} aria-valuenow={n} aria-valuetext={`${T.pow10Text(n)} ${k('plate.m')}`} aria-disabled={blocked}
            onPointerDown={onRingDown} onPointerMove={onRingMove} onPointerUp={onRingUp} onPointerCancel={onRingUp} onKeyDown={onRingKey}
            className="outline-none focus-visible:[&>circle]:stroke-amber-400" style={{ cursor: blocked ? 'default' : 'grab', touchAction: 'none' }}>
            <circle cx={CX} cy={CY} r={(R_IN + R_OUT) / 2} fill="none" stroke="transparent" strokeWidth={R_OUT - R_IN + 10} pointerEvents="stroke" />
          </g>
        </svg>
      </div>
    </StageFrame>
  );
}

const pinchDist = (pts) => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };

/* ══════════════ La plaque de laiton et les boutons ══════════════ */

function Plate({ lab, setLab, k }) {
  const n = lab.n;
  const done = L.taskDone(lab);
  const blocked = done || L.predictionPending(lab);
  const txt = T.pow10Text(n);
  const pill = L.unitPill(n, lab.world);
  const sceneName = SCENE_IDS.includes(n) ? k(`scene.names.${n}`) : null;
  const ring2 = 'inline-flex h-12 min-w-[52px] shrink-0 items-center justify-center rounded-full border-[3px] border-amber-600 bg-white px-2 text-base font-black text-amber-950 shadow-[0_3px_0_0_rgba(180,83,9,0.45)] disabled:border-slate-200 disabled:text-slate-300 disabled:shadow-none';
  const big = txt.length > 17;
  return (
    <div className="flex items-stretch gap-1.5" data-tz-controls>
      <button type="button" data-tz-less disabled={blocked || n <= L.N_MIN} onClick={() => setLab((s) => L.notch(s, -1))} className={`${ring2} ${ring}`} aria-label={k('less.aria')}>
        <bdi dir="ltr">÷10</bdi>
      </button>
      <div className="min-w-0 flex-1 rounded-2xl border-[3px] border-amber-700 bg-gradient-to-b from-amber-200 to-amber-400 px-3 py-1.5 text-center shadow-inner" data-tz-plate data-n={n}>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <span className="text-xs font-black text-amber-950">{k('plate.label')}</span>
          <output className={`font-black tabular-nums text-amber-950 ${big ? 'text-xl' : 'text-2xl'}`} data-tz-side data-value={T.pow10Text(n, { group: false })}>
            <bdi dir="ltr">{[...txt].map((c, i) => <span key={`${i}-${n < 0 ? 'n' : 'p'}`} className={`inline-block ${c === '1' ? 'rounded bg-amber-50 px-0.5 text-amber-700 ring-2 ring-amber-600' : ''} ${i === txt.length - 1 || c === '1' ? 'tz-new' : ''}`}>{c}</span>)}</bdi>{' '}<span className="text-lg">{k('plate.m')}</span>
          </output>
          {pill && <span className="rounded-full border-2 border-amber-800 bg-amber-100 px-2 py-0.5 text-sm font-black text-amber-950" data-tz-unit>{pill}</span>}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-3 text-xs font-bold text-amber-900">
          {lab.tally && n !== 0 && <span data-tz-tally dir="ltr" className="tabular-nums">{L.tallyOf(n)}</span>}
          {sceneName && <span data-tz-scenename>{sceneName}</span>}
        </div>
      </div>
      <button type="button" data-tz-more disabled={blocked || n >= L.N_MAX} onClick={() => setLab((s) => L.notch(s, 1))} className={`${ring2} ${ring}`} aria-label={k('more.aria')}>
        <bdi dir="ltr">×10</bdi>
      </button>
    </div>
  );
}

/* ══════════════ Le verdict (la bannière) ══════════════ */

function verdictOf(lab, k) {
  const free = L.isFree(lab);
  const task = L.taskOf(lab);
  const last = lab.last;
  const note = free ? ` ${k('v.freeNote')}` : '';
  const side = (nn) => `${p10tex(nn)} ${k('plate.m')}`;
  if (last?.kind === 'refused') {
    const x = side(last.n); const tg = side(last.target);
    if (last.reason === 'over') return { text: k('refuse.over', { x, t: tg, r: timesWord(last.k), eq: `$${texs(T.pow10(last.n))} = ${texs(T.pow10(last.target))} \\times ${texs(T.pow10(last.k))}$` }) + note, tone: 'amber', code: 'over', refused: 'over' };
    if (last.reason === 'under') return { text: k(last.k === 1 ? 'refuse.under1' : 'refuse.under', { x, k: againWord(last.k) }) + note, tone: 'amber', code: 'under', refused: 'under' };
    return { text: k('refuse.direction', { x, rel: k(task.target < 0 ? 'refuse.smaller' : 'refuse.bigger'), dir: k(task.target < 0 ? 'refuse.shrink' : 'refuse.grow') }) + note, tone: 'amber', code: 'direction', refused: 'direction' };
  }
  if (L.taskDone(lab)) {
    const base = k('v.solved', { x: side(last?.n ?? lab.n) });
    if (lab.wobble) return { text: `${base} ${k('v.wobble', { c: lab.wobble.count, v: T.decText({ m: BigInt(lab.wobble.choice), e: 0 }) })}`, tone: 'emerald', code: 'solved' };
    return { text: base + note, tone: 'emerald', code: 'solved' };
  }
  if (last?.kind === 'limit') return { text: k('v.limit'), tone: 'amber', code: 'limit' };
  if (last?.kind === 'custom') return { text: k('v.custom') , tone: 'indigo', code: 'custom' };
  if (L.predictionPending(lab)) return { text: k('idle.predict'), tone: 'indigo', code: 'predict' };
  if (lab.n === 0) return { text: k('idle.start'), tone: 'indigo', code: 'start' };
  return { text: k('idle.moved', { x: side(lab.n) }), tone: 'indigo', code: 'moved' };
}

/* ══════════════ « جرّب أعدادك » : toujours ouvert ══════════════ */

function FreeCard({ lab, setLab, k }) {
  const free = L.isFree(lab);
  const [txt, setTxt] = useState('');
  const [bad, setBad] = useState(null);
  const add = () => {
    const v = L.validateFree(txt);
    if (!v.ok) { setBad(v.why === 'empty' ? null : v.why); return; }
    setBad(null); setLab((s) => L.setFree(s, txt));
  };
  const onKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } };
  return (
    <LabCard className="space-y-2 border-amber-200 bg-amber-50/50 p-3" data-tz-free data-active={free ? 'true' : 'false'}>
      <p className="flex items-center gap-1.5 text-sm font-black text-amber-950"><FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}</p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
        <label className="flex flex-col gap-1 text-xs font-black text-amber-950">
          <span>{k('free.label')}</span>
          <input type="text" inputMode="text" autoComplete="off" dir="ltr" value={txt} onChange={(e) => setTxt(e.target.value.slice(0, 40))} onKeyDown={onKey} data-tz-free-input aria-label={k('free.aria')} aria-invalid={!!bad}
            placeholder="0,0001" className={`h-11 w-56 max-w-full rounded-xl border-2 ${bad ? 'border-rose-300' : 'border-amber-300'} bg-white px-2 text-start text-lg font-black tabular-nums text-amber-950 ${ring}`} />
        </label>
        <button type="button" onClick={add} data-tz-free-add className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-amber-500 bg-white px-3 text-sm font-black text-amber-950 ${ring}`}>
          <Plus className="h-4 w-4" aria-hidden="true" /> {k('free.add')}
        </button>
        {free && (
          <button type="button" onClick={() => setLab(L.toGuided)} data-tz-free-back className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-amber-200 bg-white px-3 text-xs font-bold text-amber-950 ${ring}`}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
          </button>
        )}
      </div>
      {bad && <p role="alert" className="text-sm font-bold text-rose-700" data-tz-free-refusal={bad}>{k(`free.refusal.${bad}`)}</p>}
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

export function discoveryOptions(k, kind = 'count') {
  if (kind === 'rank') {
    return [
      { text: <MathText>{k('discovery.rank.zeros')}</MathText>, why: <MathText>{k('discovery.rank.whyZeros')}</MathText> },
      { text: <MathText>{k('discovery.rank.third')}</MathText>, correct: true },
      { text: <MathText>{k('discovery.rank.neg')}</MathText>, why: <MathText>{k('discovery.rank.whyNeg')}</MathText> },
    ];
  }
  return [
    { text: <MathText>{k('discovery.count.digits')}</MathText>, why: <MathText>{k('discovery.count.whyDigits')}</MathText> },
    { text: <MathText>{k('discovery.count.zeros')}</MathText>, correct: true },
    { text: <MathText>{k('discovery.count.div')}</MathText>, why: <MathText>{k('discovery.count.whyDiv')}</MathText> },
  ];
}

export function Formal({ k }) {
  return (
    <div className="space-y-2 text-sm font-bold text-amber-950" data-tz-formal>
      <p><MathText>{k('formal.pos')}</MathText></p>
      <p><MathText>{k('formal.zero')}</MathText></p>
      <p><MathText>{k('formal.neg')}</MathText></p>
      <p><MathText>{k('formal.read')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de chaque tâche : ce que la main vient de faire avec SA bague ; la dernière tâche de chaque niveau finit par LA RÈGLE ; le monde `prefixes` n'a pas de règle. */
export const CHAINS = Object.freeze({
  z1: ['clicks', 'each'],
  z2: ['clicks', 'zeros'],
  z3: ['clicks', 'rank'],
  z4: ['back', 'rule'],
  z5: ['clicks', 'zeros'],
  z6: ['clicks', 'rank'],
  z7: ['clicks', 'neg'],
  z8: ['kmToM', 'rule'],
  p1: ['prefix', 'clicks'],
  p2: ['prefix', 'mirror'],
  p3: ['prefix', 'between'],
  p4: ['prefix', 'between'],
  p5: ['prefix', 'chain'],
});

const $ = (s) => `$${s}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const sideOf = (n) => tex(T.pow10(n));
/** La bonne option à la place `want` ; une seule bonne. */
const place = (opts, want) => {
  const ci = opts.findIndex((o) => o.correct);
  const rest = opts.filter((_, i) => i !== ci);
  rest.splice(Math.min(want, rest.length), 0, opts[ci]);
  return rest;
};
const distinct = (list, count = 3) => { const seen = new Set(); const out = []; for (const x of list) { if (!seen.has(x.v)) { seen.add(x.v); out.push(x); } } return out.slice(0, count); };
/** « 1 \\times 10 \\times 10 » ou « 1 \\div 10 \\div 10 » (LaTeX) pour n crans. */
const tallyTex = (n) => L.tallyOf(n).replace(/×/g, '\\times').replace(/÷/g, '\\div');
const prevTarget = (lab) => lab.tasks[Math.max(0, lab.ti - 1)].target;
const pillOf = (n, world) => L.unitPill(n, world) ?? '';

/** Chaque question est construite sur LA tâche (rien n'est écrit en dur) ; `k` : les textes de `tenZoom`. */
export const QUESTIONS = {
  /* combien de crans, dans quel sens */
  clicks: (lab, task, k) => {
    const n = task.target; const c = Math.abs(n);
    const dir = k(n > 0 ? 'cp.clicks.grow' : 'cp.clicks.shrink');
    const side = sideOf(n);
    return {
      id: 'clicks', kind: 'number', expected: String(c), answer: <MathText>{$(String(c))}</MathText>,
      prompt: Cq(k, 'clicks.prompt', { side, dir }),
      hints: [Cq(k, 'clicks.hint1', { side }), Cq(k, 'clicks.hint2')],
      explain: Cq(k, 'clicks.explain', { calc: $(`${tallyTex(n)}=${texs(T.pow10(n))}`), n: c, dir }),
    };
  },
  /* ce que fait un cran */
  each: (lab, task, k) => {
    const opts = [
      { text: Cq(k, 'each.times'), correct: true },
      { text: Cq(k, 'each.plus'), why: Cq(k, 'each.whyPlus') },
      { text: Cq(k, 'each.double'), why: Cq(k, 'each.whyDouble') },
    ];
    return {
      id: 'each', kind: 'choice', cols: 1,
      prompt: Cq(k, 'each.prompt'),
      options: place(opts, 0),
      hints: [Cq(k, 'each.hint1'), Cq(k, 'each.hint2')],
      explain: Cq(k, 'each.explain'),
    };
  },
  /* les zéros après le 1 = les crans */
  zeros: (lab, task, k) => {
    const n = task.target;
    return {
      id: 'zeros', kind: 'number', expected: String(n), answer: <MathText>{$(String(n))}</MathText>,
      prompt: Cq(k, 'zeros.prompt', { side: sideOf(n) }),
      hints: [Cq(k, 'zeros.hint1'), Cq(k, 'zeros.hint2')],
      explain: Cq(k, 'zeros.explain', { n }),
    };
  },
  /* la rang du 1 après la virgule = les crans de réduction */
  rank: (lab, task, k) => {
    const n = Math.abs(task.target);
    const side = sideOf(task.target);
    const mk = (x, why) => ({ v: x, text: <MathText>{k('cp.rank.at', { x })}</MathText>, ...(why ? { why } : { correct: true }) });
    const opts = distinct([mk(n), mk(n - 1, Cq(k, 'rank.whyZeros', { x: n - 1 })), mk(n + 1, Cq(k, 'rank.whyNext', { side, n }))]);
    return {
      id: 'rank', kind: 'choice', cols: 3,
      prompt: Cq(k, 'rank.prompt', { side }),
      options: place(opts, (lab.ti + 1) % 3),
      hints: [Cq(k, 'rank.hint1'), Cq(k, 'rank.hint2')],
      explain: Cq(k, 'rank.explain', { n }),
    };
  },
  /* le retour à 1 m : le même nombre de crans, dans l'autre sens */
  back: (lab, task, k) => {
    const pt = prevTarget(lab);
    const dir = k(pt < 0 ? 'cp.clicks.grow' : 'cp.clicks.shrink');
    const c = Math.abs(pt);
    return {
      id: 'back', kind: 'number', expected: String(c), answer: <MathText>{$(String(c))}</MathText>,
      prompt: Cq(k, 'back.prompt', { from: sideOf(pt), dir }),
      hints: [Cq(k, 'back.hint1'), Cq(k, 'back.hint2')],
      explain: Cq(k, 'back.explain', { n: c, dir }),
    };
  },
  /* le côté reste positif quand on réduit */
  neg: (lab, task, k) => {
    const side = sideOf(task.target);
    const opts = [
      { text: Cq(k, 'neg.right'), correct: true },
      { text: Cq(k, 'neg.neg'), why: Cq(k, 'neg.whyNeg', { side }) },
      { text: Cq(k, 'neg.gone'), why: Cq(k, 'neg.whyGone', { side }) },
    ];
    return {
      id: 'neg', kind: 'choice', cols: 1,
      prompt: Cq(k, 'neg.prompt', { side }),
      options: place(opts, 1),
      hints: [Cq(k, 'neg.hint1'), Cq(k, 'neg.hint2')],
      explain: Cq(k, 'neg.explain'),
    };
  },
  /* 10 km → mètres */
  kmToM: (lab, task, k) => {
    const km = Number(task.card.km);
    const m = km * 1000;
    const mk = (mult) => { const x = km * mult; return { v: x, text: <MathText>{$(texs({ m: BigInt(x), e: 0 }))}</MathText>, ...(mult === 1000 ? { correct: true } : { why: Cq(k, 'kmToM.why', { x: $(texs({ m: BigInt(x), e: 0 })), y: $(String(x / 1000)), km: $(String(km)) }) }) }; };
    return {
      id: 'kmToM', kind: 'choice', cols: 3,
      prompt: Cq(k, 'kmToM.prompt', { km: $(String(km)) }),
      options: place([mk(1000), mk(100), mk(10000)], (lab.ti + 1) % 3),
      hints: [Cq(k, 'kmToM.hint1'), Cq(k, 'kmToM.hint2')],
      explain: Cq(k, 'kmToM.explain', { calc: $(`${km}\\times1\\,000=${texs({ m: BigInt(m), e: 0 })}`) }),
    };
  },
  /* monde `prefixes` : combien de mètres dans l'unité nommée */
  prefix: (lab, task, k) => {
    const n = task.target;
    const unit = pillOf(n, 'prefixes');
    const good = sideOf(n);
    const sg = n > 0 ? 1 : -1;
    const mk = (e, kind) => ({ v: e, text: <MathText>{sideOf(e)}</MathText>, ...(kind === 'good' ? { correct: true } : { why: Cq(k, kind === 'mirror' ? (n > 0 ? 'prefix.whyBigger' : 'prefix.whySmaller') : 'prefix.whyOff', { unit, side: good, x: sideOf(e) }) }) });
    const opts = distinct([mk(n, 'good'), mk(-n, 'mirror'), mk(n - sg, 'off'), mk(n + sg, 'off')]);
    return {
      id: 'prefix', kind: 'choice', cols: 3,
      prompt: Cq(k, 'prefix.prompt', { unit }),
      options: place(opts, (lab.ti + 2) % 3),
      hints: [Cq(k, 'prefix.hint1'), Cq(k, 'prefix.hint2')],
      explain: Cq(k, 'prefix.explain', { unit, side: good }),
    };
  },
  /* kilo et milli : deux ordres de grandeur symétriques */
  mirror: (lab, task, k) => {
    const big = pillOf(3, 'prefixes'); const small = pillOf(-3, 'prefixes');
    const bv = sideOf(3); const sv = sideOf(-3);
    const opts = [
      { text: Cq(k, 'mirror.right'), correct: true },
      { text: Cq(k, 'mirror.bigger'), why: Cq(k, 'mirror.whyBigger', { big, small, bv, sv }) },
      { text: Cq(k, 'mirror.both'), why: Cq(k, 'mirror.whyBoth', { small, sv }) },
    ];
    return {
      id: 'mirror', kind: 'choice', cols: 1,
      prompt: Cq(k, 'mirror.prompt', { big, small }),
      options: place(opts, 2),
      hints: [Cq(k, 'mirror.hint1', { big, small }), Cq(k, 'mirror.hint2')],
      explain: Cq(k, 'mirror.explain', { calc: $('1\\,000\\times0{,}001=1') }),
    };
  },
  /* d'une unité à la suivante sur la bague */
  between: (lab, task, k) => {
    const pt = prevTarget(lab);
    const n = Math.abs(task.target - pt);
    return {
      id: 'between', kind: 'number', expected: String(n), answer: <MathText>{$(String(n))}</MathText>,
      prompt: Cq(k, 'between.prompt', { from: pillOf(pt, 'prefixes'), to: pillOf(task.target, 'prefixes') }),
      hints: [Cq(k, 'between.hint1', { from: pillOf(pt, 'prefixes'), to: pillOf(task.target, 'prefixes') }), Cq(k, 'between.hint2')],
      explain: Cq(k, 'between.explain', { fv: sideOf(pt), tv: sideOf(task.target), n }),
    };
  },
  /* méga en kilomètres : on soustrait les zéros */
  chain: (lab, task, k) => {
    const n = task.target;
    const unit = pillOf(n, 'prefixes');
    const r = n - 3;
    const mk = (e) => ({ v: e, text: <MathText>{sideOf(e)}</MathText>, ...(e === r ? { correct: true } : { why: Cq(k, 'chain.why', { x: sideOf(e), xm: tex({ m: 1n, e: e + 3 }), side: sideOf(n) }) }) });
    const opts = distinct([mk(r), mk(Math.round(n / 3)), mk(n + 3), mk(r + 1)]);
    return {
      id: 'chain', kind: 'choice', cols: 3,
      prompt: Cq(k, 'chain.prompt', { unit, side: sideOf(n) }),
      options: place(opts, (lab.ti + 1) % 3),
      hints: [Cq(k, 'chain.hint1', { unit }), Cq(k, 'chain.hint2')],
      explain: Cq(k, 'chain.explain', { calc: $(`${texs(T.pow10(n))}\\div1\\,000=${texs(T.pow10(r))}`), unit, res: sideOf(r) }),
    };
  },
  /* la règle : l'ancienne découverte, posée en dernier */
  rule: (lab, task, k) => {
    const kind = lab.discovery === 'rank' ? 'rank' : 'count';
    return {
      id: 'rule', kind: 'choice', cols: 1,
      prompt: <MathText>{k(`discovery.${kind}.prompt`)}</MathText>,
      options: place(discoveryOptions(k, kind), 2),
      hints: [Cq(k, `rule.${kind}.hint1`), Cq(k, `rule.${kind}.hint2`)],
      explain: <Formal k={k} />,
    };
  },
};
