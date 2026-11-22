import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand } from 'lucide-react';
import * as S from '@smarter-academy/core/arithmetic/substitution.js';
import { sign, rat, ratText } from '@smarter-academy/core/arithmetic/powers.js';
import { termsTex } from '@smarter-academy/core/arithmetic/polynomials.js';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { PromptCard, VerdictBanner } from '../primitives/LabKit';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import KidFigure from '../primitives/KidFigure';
import MathText from '../../components/MathText';
import { LEVELS } from '../levels';
import * as L from '../logic/marbleRun';
import { Rack, Reservoir, StationCard, Basket, Pegboard, useMarbleDrag, iso } from './marbleRun/Parts';
import LineRow from './marbleRun/LineRow';
import { PredictPanel, FreePanel, TwinsFree, TwinWall, chipOf } from './marbleRun/Panels';

/**
 * marble-run — « مسار الكريات » : LA VALEUR SOUS LA MAIN (3AM, unité 4 « الحساب الحرفي », درس « حساب قيمة عبارة حرفية », 2026-10-26).
 * Logique : `logic/marbleRun.js` (sur `core/arithmetic/substitution.js`, importé par chemin). Dessin : `marbleRun/`.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. Un MUR de billes du نادي العلوم (thème `marblerun`) calcule une expression : un réservoir par lettre, des stations (les opérations de
 *    l'arbre), une corbeille. La main (1) choisit la VALEUR de la lettre : une bille du râtelier lâchée dans le réservoir (glisser, toucher-
 *    toucher, clavier) ; (2) ÉCRIT sous le mur la ligne de la substitution : toucher une case = ses parenthèses, toucher le vide avant une
 *    case = le signe × ; (3) lance la glissière. Monde `twins` : deux murs sous UN réservoir, la main compare les corbeilles et juge.
 * B. Remplacer une lettre, c'est mettre le MÊME nombre à chaque endroit de la lettre, sans changer son rôle : « 4 fois x » reste « 4 fois le
 *    nombre » (le × doit se voir, sinon 4 et 3 deviennent 43) et « x au carré » reste « le nombre au carré » (avec un nombre négatif,
 *    les parenthèses gardent le signe dans le carré). Deux lettres peuvent prendre deux nombres. Une valeur où deux expressions se
 *    séparent prouve qu'elles sont différentes ; des valeurs égales ne prouvent rien.
 * C. Le mur calcule le sens de l'expression, le lecteur strict calcule ce que la LIGNE dit ; la première station où ils diffèrent s'allume
 *    et la bannière donne les deux calculs avec LES nombres de l'élève. La valeur n'est jamais dite : elle sort du mur.
 * D. La règle formelle (ses lignes acceptées) s'écrit après la découverte.
 * E. « لماذا احتاج سطرك إلى قوسين ؟ » — les fausses conjectures réfutées par SA course refusée.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        substituer un nombre à une lettre ; × visible ; parenthèses d'un négatif ; priorité ; un contre-exemple réfute
 *   OBJECT         un mur à chevilles, des billes, un réservoir par lettre, des stations (copieuse, presse, basculeur, jonction), une corbeille
 *   VARIABLE       la valeur de la lettre (bille) ; l'écriture de chaque case (parenthèses, ×) ; la bille du monde twins
 *   INVARIANT      la même bille à chaque entrée de la lettre ; le mur calcule le sens de l'expression
 *   TRANSFORMATION la ligne se lit autrement (43 pour 4 × 3, −4 pour (−2)²) ; la station fautive s'allume
 *   CONSTRAINT     un × caché fond les chiffres ; un négatif nu est illisible après un opérateur ; sous une puissance il est avalé
 *   RESISTANCE     fused · syntax · unbracketed (la copieuse) · swallowed
 *   EVIDENCE       les puces des stations, la corbeille, le ticker du lecteur, la bannière aux deux calculs
 *   CONTRAST       une ligne refusée à côté de la ligne acceptée ; deux corbeilles qui s'accordent puis se séparent
 *   PREDICTION     متقدم : la valeur est écrite au clavier AVANT le lancement, sans puces pendant la course
 *   DISCOVERY      pourquoi des parenthèses (options réfutables par SES nombres)
 *   FORMALIZATION  mêmes nombres partout · × explicite · parenthèses d'un négatif · priorité
 *   TRANSFER       le monde twins (module طريقة), les exercices, la banque, 4AM (images d'une fonction affine)
 *
 * « جرّب كل الإمكانيات » : NON (chaque course est une réponse). « جرّب أعدادك » : TOUJOURS OUVERT (`[data-mr-free]`).
 *
 * D'UN SEUL REGARD (§8bis) : `[data-mr-glance]` enveloppe la consigne, le mur, la ligne, la bannière, le râtelier et la glissière.
 *
 * CONTRAT DOM : [data-marble-run][data-world][data-task][data-solved], [data-mr-glance], [data-mr-rack] / [data-mr-marble=<v>],
 * [data-mr-reservoir=x|y], [data-mr-station=<id>][data-op][data-lit], [data-mr-basket], [data-mr-line], [data-mr-slot=<i>][data-brackets],
 * [data-mr-times=<i>], [data-mr-run], [data-mr-reader], [data-mr-refused=<reason>], [data-mr-banner], [data-mr-predict], [data-mr-claims],
 * [data-mr-claim=counter|equal], [data-mr-expand], [data-mr-next], [data-mr-free], [data-mr-formal].
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 1, 2026-10-28) : `checkpoints` (défaut true). Après CHAQUE
 * tâche (une fois la course révélée), une suite de questions sur ce que l'élève vient de FAIRE se pose par-dessus le labo et retient « التالي »
 * (`chainOf`) : run la valeur obtenue · puis selon SA tâche la croix du produit, les parenthèses du négatif, le carré d'un négatif ou deux
 * lettres ; la dernière tâche finit par LA RÈGLE (l'ancienne découverte, qui formalise) ; twins la valeur à SA bille · une valeur suffit /
 * deux égalités ne prouvent rien · (égalité) la forme développée · pourquoi aucun contre-exemple. Obligatoires pour tout élève ; l'enseignant
 * seul les coupe pour SON compte. ÉTAPES `LabStepper` (`[data-mr-step=<i>]`) + fête ; « إعادة » repart de la tâche 1 ; « أعِد التجربة »
 * remet LA MÊME tâche (`L.retryTask`). SON : `tooth` (poser une bille, écrire), `bell` (développer), `flag` (tâche faite), `over` (refus).
 */
const NS = 'manipulation.marbleRun';
const MAX_W = 1080;
const CSS = '@keyframes mr-pop{from{opacity:.2;transform:scale(.88)}to{opacity:1;transform:scale(1)}}'
  + '@keyframes mr-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-4px)}45%{transform:translateX(4px)}70%{transform:translateX(-3px)}}'
  + '@keyframes mr-ring{0%,100%{box-shadow:0 0 0 3px rgba(99,102,241,.9),0 0 0 8px rgba(99,102,241,.15)}50%{box-shadow:0 0 0 3px rgba(99,102,241,.9),0 0 0 12px rgba(99,102,241,.28)}}'
  + '@keyframes mr-run{0%{transform:scale(1)}50%{transform:scale(1.06)}100%{transform:scale(1)}}'
  + '.mr-pop{animation:mr-pop .26s ease-out both}.mr-shake{animation:mr-shake .4s ease-in-out}'
  + '[data-mr-coach]{border-radius:14px;animation:mr-ring 1.4s ease-in-out infinite}'
  + '[data-mr-station][data-active="true"]{animation:mr-run .35s ease-in-out infinite}'
  + 'section:has([data-marble-run]) [data-lab-coach-ring]{display:none}'
  + '@media (prefers-reduced-motion:reduce){.mr-pop,.mr-shake,[data-mr-coach],[data-mr-station][data-active="true"]{animation:none}}';

/** Les nombres de la manipulation : ceux de la leçon, ou le préréglage du niveau (même objet : `levelMatching` compare par référence). */
export function numbersFor({ world, tasks, level }) {
  if (world === 'twins') return { world: 'twins', tasks: L.tasksFor('twins', tasks, false) };
  if (Array.isArray(tasks) && tasks.length) return { world: 'run', predict: false, tasks };
  return LEVELS['marble-run'][resolveLevelId(level ?? 'beginner')].numbers;
}

const vt = (v) => iso(L.valueText(v));

function Ines({ mood }) {
  return (
    <svg width="58" height="96" viewBox="0 0 64 104" className="shrink-0" aria-hidden="true" data-mr-ines={mood}>
      <KidFigure cx={32} top={3} foot={102} hairStyle="hijab" scarf="lavender" outfit="teal" skin="wheat" mood={mood} />
    </svg>
  );
}

/** La question : une seule phrase qui nomme le but et l'état final (les billes demandées y sont écrites). */
export function questionOf(lab, k) {
  if (lab.custom) return k(`question.custom.${lab.world}`);
  if (lab.world === 'twins') return k('question.twins');
  const entries = Object.entries(lab.tasks[lab.ti].target);
  const drops = entries.map(([l, t], i) => k(i === 0 ? 'drop.one' : 'drop.and', { v: vt(L.marble(t).v), l })).join('');
  return k(lab.predict ? 'question.predict' : 'question.run', { drops });
}
export function contextOf(lab, k, lead) {
  if (lab.custom) return k(`context.custom.${lab.world}`);
  if (lab.world === 'twins') return k('context.twins');
  return lead ?? k('context.run', { expr: `$${S.treeTex(lab.tree)}$` });
}

/** La bannière : un verdict en une ou deux phrases avec LES nombres de l'élève (vide quand le guide parle). */
export function bannerOf(lab, k, coachShowing) {
  if (lab.world === 'twins') {
    const r = lab.ran;
    if (r) {
      const pair = L.twinValues(lab);
      const n = { x: lab.m ? iso(L.valueText(lab.m.v)) : '', a: pair ? vt(pair.left) : '', b: pair ? vt(pair.right) : '' };
      if (!r.ok) return { tone: 'rose', reason: r.reason, text: k(`twin.refused.${r.reason}`, n) };
      return { tone: 'emerald', reason: null, text: k(`twin.accepted.${r.kind}`, n) };
    }
    if (coachShowing) return { tone: 'indigo', reason: null, text: '' };
    return { tone: 'indigo', reason: null, text: k('idle.twins') };
  }
  const r = lab.ran;
  if (r) {
    if (r.ok) {
      if (r.hit) return { tone: 'emerald', reason: null, text: k('b.ok', { v: vt(r.runValue) }) };
      return { tone: lab.custom ? 'emerald' : 'amber', reason: null, text: k(lab.custom ? 'b.okCustom' : 'b.okWrongValue', { v: vt(r.runValue) }) };
    }
    const st = r.stationInfo;
    const line = st?.lineValue ? vt(st.lineValue) : null;
    if (r.reason === 'fused' && line) return { tone: 'rose', reason: 'fused', text: k('b.fused', { line, a: vt(st.args[0]), b: vt(st.args[1]), run: vt(st.value) }) };
    if (r.reason === 'unbracketed' && line && st.op === 'pow') {
      const base = st.args[0];
      if (sign(base) < 0) return { tone: 'rose', reason: 'unbracketed', text: k('b.squareNeg', { abs: iso(L.valueText({ n: -base.n, d: base.d })), line, base: vt(base), run: vt(st.value) }) };
      return { tone: 'rose', reason: 'unbracketed', text: k('b.squareFrac', { line, run: vt(st.value) }) };
    }
    if (r.reason === 'unbracketed' && line) return { tone: 'rose', reason: 'unbracketed', text: k('b.swallowed', { line, run: vt(st.value) }) };
    return { tone: 'rose', reason: 'syntax', text: k('b.syntax') };
  }
  if (coachShowing) return { tone: 'indigo', reason: null, text: '' };
  if (!L.filled(lab)) return { tone: 'indigo', reason: null, text: k('idle.rack') };
  if (lab.predict && !lab.custom && !lab.predicted) return { tone: 'indigo', reason: null, text: k('idle.predict') };
  return { tone: 'indigo', reason: null, text: k('idle.write') };
}

export default function MarbleRun({
  world, tasks, title, lead, level, levels: withLevelsProp = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const withLevels = world === 'twins' ? false : withLevelsProp;
  const initialNumbers = useMemo(() => numbersFor({ world, tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'marble-run', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const fresh = () => L.init({ world: nums.world, tasks: nums.tasks, predict: !!nums.predict });
  const [lab, setLab] = useState(fresh);
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch || scene.rc !== state.resetCount) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(fresh());
  }
  const twins = lab.world === 'twins';
  const ready = L.discoveryReady(lab);
  const reported = useRef(0);
  const nEv = lab.events.length;
  useEffect(() => {
    if (nEv < reported.current) reported.current = 0;
    for (let i = reported.current; i < nEv; i += 1) state.report(onTrial, lab.events[i]);
    reported.current = nEv;
  }, [nEv, lab.events]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la course : les stations s'allument une à une (la bannière et la corbeille attendent la fin) ── */
  const [shown, setShown] = useState(0); // le numéro de la dernière course dont la révélation est finie
  const [reveal, setReveal] = useState(0);
  const total = twins ? 0 : L.stationSkeleton(lab).length;
  const running = !twins && lab.nRuns > Math.min(shown, lab.nRuns);
  useEffect(() => {
    if (twins || !lab.nRuns) { setShown(lab.nRuns ?? 0); return undefined; }
    const still = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (still) { setShown(lab.nRuns); return undefined; }
    let i = 0;
    setReveal(0);
    const id = setInterval(() => { i += 1; if (i > total) { clearInterval(id); setShown(lab.nRuns); } else setReveal(i); }, 340);
    return () => clearInterval(id);
  }, [lab.nRuns]); // eslint-disable-line react-hooks/exhaustive-deps

  // les questions pendant le labo : la suite de la tâche courante, une fois la course révélée ; la règle remplace la découverte automatique
  const cpSettings = useLabCheckpointSettings('marble-run');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpLive = cpOn && cpSettings.enabled;
  const chain = cpLive && !lab.custom ? chainOf(lab, lab.ti) : null;
  const ruleByCheckpoint = cpLive && !twins;
  const cpTask = lab.tasks[lab.ti];
  const cp = useLabCheckpoint({
    id: chain ? cpTask.id : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, cpTask, k)) : null,
    reached: !lab.custom && !!lab.done[lab.ti] && !running,
    resetKey: scene.inits,
    onRetry: () => setLab(L.retryTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: () => { if (chain?.includes('rule')) { state.discover(); state.formalize(); } },
  });
  useEffect(() => { if (ready && !ruleByCheckpoint) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son du geste (muet sans « الصوت ») : poser une bille, écrire ; développer ; la tâche faite ; un refus
  const heard = useRef({ n: lab.events.length, at: 0 });
  useEffect(() => {
    const h = heard.current;
    if (lab.events.length < h.n) h.n = 0;
    const evs = lab.events.slice(h.n);
    h.n = lab.events.length;
    if (!evs.length) return;
    const kinds = evs.map((e) => e.kind);
    if (kinds.includes('solved')) playSfx('flag');
    else if (evs.some((e) => (e.kind === 'run' || e.kind === 'claim') && (!e.ok || (e.kind === 'run' && !e.free)))) playSfx('over');
    else if (kinds.includes('expand')) playSfx('bell');
    else if (kinds.some((x) => x === 'drop' || x === 'write')) {
      const now = Date.now();
      if (now - h.at > 35) { playSfx('tooth'); h.at = now; }
    }
  }, [lab.events]);
  // une étape est FAITE quand la tâche est résolue ET que ses questions (LabCheckpoint) sont répondues : la pastille passe au vert et on fête
  const stepDone = lab.done.map((d, i) => !!d && (i !== lab.ti || lab.custom || (!cp.blocking && !running)));
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.events.length === 0 && celebrated.current.size) celebrated.current = new Set();   // L.init (« إعادة », autre niveau) : on refête
  const nowDone = !lab.custom && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.done.filter(Boolean).length, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le guide ── */
  const ownStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coachStep = ownStep ? { ...ownStep, prefer: 'below' } : null;
  const coach = useLabCoach({
    lab: 'marble-run', step: coachStep,
    text: ownStep ? k(`coach.${ownStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });
  const ringTarget = coach.visible && ownStep ? ownStep.target : null;
  useEffect(() => {
    const root = document.querySelector('[data-marble-run]');
    const el = ringTarget && root ? root.querySelector(ringTarget) : null;
    if (!el) return undefined;
    el.setAttribute('data-mr-coach', '');
    return () => el.removeAttribute('data-mr-coach');
  });

  /* ── mesures ── */
  const boxRef = useRef(null);
  const [width, setWidth] = useState(900);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => setWidth(Math.max(320, Math.min(MAX_W, Math.floor(el.clientWidth))));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : (typeof window !== 'undefined' ? window.innerHeight : 800);
  const wide = width >= 660;
  const short = screenH < 820;

  /* ── les gestes ── */
  const drag = useMarbleDrag({
    onPick: (m) => setLab((s) => L.hold(s, s.held?.id === m.id ? null : m)),
    onDrop: (letter, m) => setLab((s) => (s.world === 'twins' ? L.dropTwin(s, m) : L.drop(s, letter, m))),
  });
  const dropHeld = (letter) => setLab((s) => (s.held ? (s.world === 'twins' ? L.dropTwin(s, s.held) : L.drop(s, letter, s.held)) : s));
  const act = (fn, ...args) => setLab((s) => fn(s, ...args));
  const rack = twins ? L.RACK.twins : lab.predict ? L.RACK.advanced : L.RACK.beginner;
  const rackAria = (m) => k('marbleAria', { v: L.marbleText(m) });

  /* ── l'affichage ── */
  const task = L.taskOf(lab);
  const banner = running ? { tone: 'indigo', reason: null, text: '' } : bannerOf(lab, k, coach.visible && !!ownStep);
  const ran = lab.ran;
  const done = !running && ran;
  const lit = done && !twins && ran && !ran.ok ? ran.station : null;
  const mood = lab.solvedNow ? 'proud' : ran && !ran.ok ? 'wonder' : 'happy';
  const context = contextOf(lab, k, state.isAuthoredLevel ? lead : undefined);
  const question = questionOf(lab, k);
  const prompt = (
    <PromptCard size={wide && width >= 900 ? 'lg' : 'md'} className={short ? '!space-y-1 !p-3' : undefined}
      context={<MathText>{context}</MathText>} contextProps={{ 'data-mr-context': task }}
      title={question} titleClassName={!wide || width < 900 ? (short ? 'text-[15px]' : 'text-lg') : short ? 'text-lg' : 'text-xl'}
      lamp={lab.solvedNow ? 'on' : 'off'} titleProps={{ 'data-mr-question': task, 'data-lit': lab.solvedNow ? 'true' : 'false' }} />
  );

  const dots = lab.tasks.length > 1 && (
    <LabStepper count={lab.tasks.length} current={lab.custom ? -1 : lab.ti} done={stepDone} stepAttr="data-mr-step" />
  );

  const verdict = (
    <div className="min-h-[46px]" data-mr-banner-slot>
      {(banner.text || (done && !twins)) && (
        <VerdictBanner tone={banner.tone} size="sm" data-mr-banner data-tone={banner.tone} {...(banner.reason ? { 'data-mr-refused': banner.reason } : {})}>
          {banner.text && <div className="mr-pop" key={`${lab.nRuns}|${lab.events.length}`}><MathText>{banner.text}</MathText></div>}
        </VerdictBanner>
      )}
    </div>
  );

  const nextBtn = L.canNext(lab) && !cp.blocking && (
    <button type="button" data-mr-next onClick={() => act(L.nextTask)}
      className="inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-emerald-600 bg-emerald-600 px-4 text-sm font-black text-white outline-none focus-visible:ring-4 focus-visible:ring-emerald-300">
      {lab.custom ? k('back') : k('next')}
    </button>
  );
  const backBtn = lab.custom && (
    <button type="button" data-mr-back onClick={() => act(L.backToTasks)}
      className="inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-4 text-sm font-black text-slate-700 outline-none focus-visible:ring-4 focus-visible:ring-indigo-300">{k('back')}</button>
  );

  /* ── monde « run » ── */
  let body;
  if (!twins) {
    const sk = L.stationSkeleton(lab);
    const steps = L.stationsOf(lab);
    const letters = L.lettersOf(lab);
    const names = (st) => (st.op === 'pow' ? k(st.n === 3 ? 'stations.pow3' : 'stations.pow2') : k(`stations.${st.op}`));
    const scaffold = !lab.predict;
    const guiltySlot = lit != null ? ran.slot : null;
    const wall = (
      <Pegboard data-mr-wall>
        <div dir="ltr" className="flex flex-wrap items-stretch justify-center gap-1.5" role="group" aria-label={k('stationsAria')} data-mr-stations>
          {letters.map((l) => (
            <Reservoir key={l} letter={l} marble={lab.env[l] ? { v: lab.env[l].v, fmt: lab.env[l].fmt, id: String(lab.env[l].v.n) } : null} held={!!lab.held}
              onDrop={dropHeld} name={k('reservoir', { l })} aria={k('reservoirAria', { l })} full={k('reservoirFull', { l, v: lab.env[l] ? L.marbleText(lab.env[l]) : '' })} size={0.78} />
          ))}
          {sk.map((st, idx) => {
            const real = steps[idx];
            const reached = L.filled(lab) && !!ran && (running ? idx < reveal : true);
            const showChip = reached && (scaffold || (!running && !!ran));
            return <StationCard key={st.id} st={st} name={names(st)} reached={showChip} chip={showChip ? chipOf(real) : ''} lit={lit === st.id} active={running && idx === reveal} size="sm" />;
          })}
          <Basket value={done ? iso(L.valueText(ran.runValue)) : null} label={k('basket')} ok={!!done && ran.ok} />
        </div>
      </Pegboard>
    );
    const ticker = done && (
      <div data-mr-reader className="flex min-h-[40px] flex-wrap items-center justify-center gap-2 rounded-xl border-2 border-amber-700/40 bg-gradient-to-b from-amber-100 to-amber-200 px-3 py-1 text-sm font-black text-amber-950">
        <span>{k('reader')}</span>
        {ran.lineValue ? <><span className="font-bold">{k('readerReads')}</span><bdi dir="ltr" data-mr-reader-value className="rounded-lg bg-white px-2 py-0.5 text-lg tabular-nums text-slate-900">{L.valueText(ran.lineValue)}</bdi></> : <span className="font-bold text-rose-800">{k('readerLost')}</span>}
      </div>
    );
    const predictResult = done && lab.predict && !lab.custom && lab.predicted && ran.predictedOk != null && (
      <p className="text-center text-xs font-bold text-indigo-900" data-mr-predict-result={ran.predictedOk ? 'right' : 'wrong'}>
        {ran.predictedOk ? k('predict.right', { v: vt(ran.runValue) }) : k('predict.wrong', { p: vt(lab.predicted.v), v: vt(ran.runValue) })}
      </p>
    );
    body = (
      <>
        <div className="relative flex items-end gap-2">
          <div className="min-w-0 flex-1">{wall}</div>
          {wide && <Ines mood={mood} />}
        </div>
        <LineRow lab={lab} k={k} onBrackets={(i) => act(L.toggleBrackets, i)} onTimes={(i) => act(L.toggleTimes, i)} guilty={guiltySlot} />
        <div className="space-y-1">{ticker}{predictResult}{verdict}</div>
        <Rack marbles={rack} held={lab.held} onPick={(m) => act(L.hold, lab.held?.id === m.id ? null : m)} dragStart={drag.start} label={k('rackAria')} itemAria={rackAria} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          {dots || <span />}
          <button type="button" data-mr-run disabled={!L.canRun(lab)} onClick={() => act(L.run)} aria-label={k('runAria')}
            className="inline-flex min-h-[52px] items-center gap-2 rounded-2xl border-2 border-amber-700 bg-gradient-to-b from-amber-400 to-amber-600 px-5 text-base font-black text-amber-950 shadow-[0_3px_0_rgba(120,53,15,.6)] outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-40">
            <Hand className="h-5 w-5" aria-hidden="true" />{k('run')}
          </button>
          <div className="flex gap-2">{backBtn}{nextBtn}</div>
        </div>
        {lab.predict && !lab.custom && L.filled(lab) && <PredictPanel lab={lab} k={k} onCommit={(p) => act(L.commitPrediction, p)} onClear={() => act(L.clearPrediction)} />}
        <FreePanel lab={lab} k={k} onExpr={(txt) => act(L.setFreeExpr, txt)} onStep={(f, d) => act(L.stepFreeMarble, f, d)} onDrop={(l, m) => act(L.drop, l, m)} />
      </>
    );
  } else {
    body = (
      <>
        <Pegboard data-mr-wall className="space-y-1.5">
          <div className="flex items-start justify-center gap-3">
            <Reservoir letter="x" marble={lab.m ? { v: lab.m.v, fmt: lab.m.fmt, id: lab.m.id } : null} held={!!lab.held} onDrop={dropHeld} name={k('reservoir', { l: 'x' })} aria={k('reservoirAria', { l: 'x' })} full={k('reservoirFull', { l: 'x', v: lab.m ? L.marbleText(lab.m) : '' })} size={short ? 0.8 : 0.9} />
            {wide && <Ines mood={mood} />}
          </div>
          <div className={`flex gap-2 ${width >= 900 ? 'flex-row' : 'flex-col'}`}>
            <TwinWall lab={lab} tree={lab.a} title={k('twin.wall', { n: 1 })} k={k} side="a" />
            <TwinWall lab={lab} tree={lab.b} title={k('twin.wall', { n: 2 })} k={k} side="b" />
          </div>
        </Pegboard>
        {lab.tried.length > 0 && (
          <p className="text-center text-xs font-bold text-slate-600" data-mr-tried dir="ltr">{k('twin.tried', { list: lab.tried.map((m) => L.marbleText(m)).join(' ، ') })}</p>
        )}
        <div className="space-y-1">{verdict}</div>
        <Rack marbles={rack} held={lab.held} onPick={(m) => act(L.hold, lab.held?.id === m.id ? null : m)} dragStart={drag.start} label={k('rackAria')} itemAria={rackAria} />
        <div className="flex flex-wrap items-center justify-center gap-2" data-mr-claims role="group" aria-label={k('twin.claims')}>
          <button type="button" data-mr-claim="counter" disabled={lab.solvedNow} onClick={() => act(L.claim, 'counter')}
            className="inline-flex min-h-[48px] items-center rounded-xl border-2 border-rose-500 bg-rose-50 px-3 text-sm font-black text-rose-900 outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 disabled:opacity-50">{k('twin.counter')}</button>
          <button type="button" data-mr-claim="equal" disabled={lab.solvedNow} onClick={() => act(L.claim, 'equal')}
            className="inline-flex min-h-[48px] items-center rounded-xl border-2 border-teal-500 bg-teal-50 px-3 text-sm font-black text-teal-900 outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 disabled:opacity-50">{k('twin.equal')}</button>
          <button type="button" data-mr-expand disabled={!L.canExpand(lab) || lab.expanded} onClick={() => act(L.expandTwin)}
            className="inline-flex min-h-[48px] items-center rounded-xl border-2 border-indigo-500 bg-indigo-50 px-3 text-sm font-black text-indigo-900 outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 disabled:opacity-50">{k('twin.expand')}</button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">{dots}<div className="flex gap-2">{backBtn}{nextBtn}</div></div>
        <TwinsFree lab={lab} k={k} onSet={(which, txt) => act(L.setFreeTwins, which, txt)} />
      </>
    );
  }

  const hintsKey = twins ? 'twins' : lab.predict ? 'advanced' : 'beginner';
  const discovery = twins ? null : (
    <ManipulationDiscovery state={state}
      prompt={<MathText>{k('discovery.prompt')}</MathText>}
      options={discoveryOptions(lab, k)} formal={<Formal lab={lab} k={k} />}
      onFormalized={() => state.report(onFinished, { world: lab.world })} />
  );
  return (
    <ManipulationShell type="marble-run" title={title ?? k('title')} titleHidden state={state} allowModeSwitch={allowModeSwitch} allowFreeLab={false}
      coach={coachOn ? coach : null} headerAction={cpSettings.control} guided={!!chain || ruleByCheckpoint} hints={[0, 1, 2].map((i) => k(`hints.${hintsKey}.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }} discovery={discovery} explanation={<MathText>{k('explanation')}</MathText>}>
      <ManipulationStage className="bg-gradient-to-b from-amber-50/60 to-white">
        <div ref={boxRef} data-marble-run data-world={lab.world} data-task={task} data-solved={lab.solvedNow ? 'true' : 'false'} data-running={running ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <div className="relative mx-auto space-y-2" style={{ maxWidth: MAX_W }} data-mr-glance data-mr-budget={`${screenH}|${width}`}>
            {party.node}
            {cp.node}
            {prompt}
            {body}
          </div>
          {drag.ghost}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

export function discoveryOptions(lab, k) {
  const M = (s) => <MathText>{s}</MathText>;
  const w = L.discoveryWitness(lab);
  const line = w.line == null ? '؟' : w.line; const run = w.run;
  return [
    { text: M(k('discovery.decor')), why: M(k('discovery.whyDecor', { line: iso(line.replace?.('-', '−') ?? line), run: iso(String(run).replace('-', '−')) })) },
    { text: M(k('discovery.right')), correct: true },
    { text: M(k('discovery.every')), why: M(k('discovery.whyEvery')) },
  ];
}

export function Formal({ lab, k }) {
  const solved = lab.events.filter((e) => e.kind === 'solved' && e.world === 'run');
  const seen = new Set(); const lines = [];
  for (const e of solved) if (!seen.has(e.line)) { seen.add(e.line); lines.push(e); }
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-mr-formal>
      <p>{k('formal.sub')}</p>
      <p><MathText>{k('formal.times')}</MathText></p>
      <p><MathText>{k('formal.brackets')}</MathText></p>
      <p><MathText>{k('formal.priority')}</MathText></p>
      {lines.length > 0 && (
        <div className="space-y-1">
          <p>{k('formal.lines')}</p>
          {lines.map((e) => <bdi key={e.line} dir="ltr" className="block rounded-lg bg-emerald-50 px-2 py-0.5 text-[15px] ring-1 ring-emerald-200">{e.line} = {String(e.value).replace('-', '−')}</bdi>)}
        </div>
      )}
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

const envOf = (tk) => Object.fromEntries(Object.entries(tk.target ?? {}).map(([l, v]) => [l, L.marble(v)]));
const isNeg = (m) => m.v.n < 0n;
const rTex = (v) => (v.d === 1n ? String(v.n) : `${v.n < 0n ? '-' : ''}\\frac{${v.n < 0n ? -v.n : v.n}}{${v.d}}`);
const mTex = (m) => rTex(m.v);

/** La question sur ce que la main a écrit dans SA tâche, puis la règle à la dernière ; twins : la valeur à SA bille, puis le sens du verdict. */
export function chainOf(lab, i) {
  const tk = lab.tasks[i];
  if (!tk) return [];
  if (lab.world === 'twins') {
    const a = L.treeOf(tk.a); const b = L.treeOf(tk.b);
    if (S.samePolynomial(a, b)) return ['expanded', 'noCounter'];
    const equalAt = [-3, -2, -1, 0, 1, 2, 3].filter((x) => S.pairAt(a, b, rat(x)).equal).length;
    return ['atMarble', equalAt >= 2 ? 'notProof' : 'oneEnough'];
  }
  const tree = L.treeOf(tk.expr);
  const env = envOf(tk);
  const sl = S.slots(tree);
  const names = Object.keys(env);
  let second;
  if (names.length > 1) second = 'letters';
  else if (sl.filter(Boolean).length > 1) second = 'same';
  else if (sl.some((x) => x?.underPow) && Object.values(env).some(isNeg)) second = 'square';
  else if (Object.values(env).some(isNeg)) second = 'brackets';
  else second = 'times';
  const base = ['value', second];
  return i === lab.tasks.length - 1 ? [...base, 'rule'] : base;
}

const $ = (s) => `$${s}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const exprTex = (text) => S.treeTex(L.treeOf(text));
const opt = (tex) => <MathText>{$(tex)}</MathText>;

export const QUESTIONS = {
  value: (lab, tk, k) => {
    const env = envOf(tk);
    const v = S.evaluate(L.treeOf(tk.expr), env);
    const at = Object.entries(env).map(([l, m]) => `${l}=${mTex(m)}`).join(',\\ ');
    const o = { expr: $(exprTex(tk.expr)), at: $(at), v: $(rTex(v)) };
    return {
      id: 'value', kind: 'number', expected: ratText(v), answer: opt(rTex(v)),
      prompt: Cq(k, 'value.prompt', o), hints: [Cq(k, 'value.hint1'), Cq(k, 'value.hint2', o)], explain: Cq(k, 'value.explain', o),
    };
  },
  times: (lab, tk, k) => {
    const env = envOf(tk); const [l, m] = Object.entries(env)[0];
    const tree = L.treeOf(tk.expr);
    const coef = tree.t === 'add' || tree.t === 'sub' ? tree.a : tree;
    const c = coef.t === 'mul' && coef.a.t === 'num' ? String(coef.a.v.n) : '4';
    const o = { c: $(c), l: $(l), m: $(mTex(m)), fused: $(`${c}${mTex(m)}`), prod: $(`${c}\\times${mTex(m)}=${Number(c) * Number(m.v.n)}`) };
    return {
      id: 'times', kind: 'choice', prompt: Cq(k, 'times.prompt', o),
      options: [{ text: Cq(k, 'times.right', o), correct: true }, { text: Cq(k, 'times.add'), why: Cq(k, 'times.whyAdd', o) }, { text: Cq(k, 'times.decor'), why: Cq(k, 'times.whyDecor', o) }],
      hints: [Cq(k, 'times.hint1', o), Cq(k, 'times.hint2', o)], explain: Cq(k, 'times.explain', o),
    };
  },
  brackets: (lab, tk, k) => {
    const env = envOf(tk); const m = Object.values(env).find(isNeg);
    const o = { m: $(mTex(m)), br: $(`(${mTex(m)})`), bare: $(`\\times${mTex(m)}`) };
    return {
      id: 'brackets', kind: 'choice', prompt: Cq(k, 'brackets.prompt', o),
      options: [{ text: Cq(k, 'brackets.right'), correct: true }, { text: Cq(k, 'brackets.decor'), why: Cq(k, 'brackets.whyDecor', o) }, { text: Cq(k, 'brackets.big'), why: Cq(k, 'brackets.whyBig') }],
      hints: [Cq(k, 'brackets.hint1', o), Cq(k, 'brackets.hint2')], explain: Cq(k, 'brackets.explain', o),
    };
  },
  square: (lab, tk, k) => {
    const env = envOf(tk); const m = Object.values(env).find(isNeg);
    const a = -Number(m.v.n);
    const o = { m: $(mTex(m)), sq: $(`(${mTex(m)})^2`), right: $(`(${mTex(m)})^2=${a * a}`), bare: $(`-${a}^2=-${a * a}`) };
    return {
      id: 'square', kind: 'choice', cols: 3, prompt: Cq(k, 'square.prompt', o),
      options: [{ text: opt(String(a * a)), correct: true }, { text: opt(String(-a * a)), why: Cq(k, 'square.whyNeg', o) }, { text: opt(String(-2 * a)), why: Cq(k, 'square.whyDouble', o) }],
      hints: [Cq(k, 'square.hint1', o), Cq(k, 'square.hint2', o)], explain: Cq(k, 'square.explain', o),
    };
  },
  same: (lab, tk, k) => {
    const env = envOf(tk); const [l, m] = Object.entries(env)[0];
    const n = S.slots(L.treeOf(tk.expr)).filter(Boolean).length;
    const o = { l: $(l), m: $(mTex(m)), n: $(String(n)), opp: $(rTex({ n: -m.v.n, d: m.v.d })) };
    return {
      id: 'same', kind: 'choice', prompt: Cq(k, 'same.prompt', o),
      options: [{ text: Cq(k, 'same.right', o), correct: true }, { text: Cq(k, 'same.mixed', o), why: Cq(k, 'same.whyMixed', o) }, { text: Cq(k, 'same.once'), why: Cq(k, 'same.whyOnce', o) }],
      hints: [Cq(k, 'same.hint1', o), Cq(k, 'same.hint2')], explain: Cq(k, 'same.explain', o),
    };
  },
  letters: (lab, tk, k) => {
    const env = envOf(tk); const [[l1, m1], [l2, m2]] = Object.entries(env);
    const o = { l1: $(l1), l2: $(l2), m1: $(mTex(m1)), m2: $(mTex(m2)) };
    return {
      id: 'letters', kind: 'choice', prompt: Cq(k, 'letters.prompt', o),
      options: [{ text: Cq(k, 'letters.right', o), correct: true }, { text: Cq(k, 'letters.same'), why: Cq(k, 'letters.whySame', o) }, { text: Cq(k, 'letters.one'), why: Cq(k, 'letters.whyOne', o) }],
      hints: [Cq(k, 'letters.hint1'), Cq(k, 'letters.hint2', o)], explain: Cq(k, 'letters.explain', o),
    };
  },
  atMarble: (lab, tk, k) => {
    const a = L.treeOf(tk.a); const b = L.treeOf(tk.b);
    const x = lab.m && !S.pairAt(a, b, lab.m.v).equal ? lab.m.v : S.witness(a, b, [-3, -2, -1, 0, 1, 2, 3].map((n) => rat(n)));
    const pr = S.pairAt(a, b, x);
    const o = { x: $(`x=${rTex(x)}`), A: $(exprTex(tk.a)), B: $(exprTex(tk.b)), l: $(rTex(pr.left)), r: $(rTex(pr.right)) };
    return {
      id: 'atMarble', kind: 'number', expected: ratText(pr.left), answer: opt(rTex(pr.left)),
      prompt: Cq(k, 'atMarble.prompt', o), hints: [Cq(k, 'atMarble.hint1'), Cq(k, 'atMarble.hint2', o)], explain: Cq(k, 'atMarble.explain', o),
    };
  },
  oneEnough: (lab, tk, k) => ({
    id: 'oneEnough', kind: 'choice', prompt: Cq(k, 'oneEnough.prompt'),
    options: [{ text: Cq(k, 'oneEnough.right'), correct: true }, { text: Cq(k, 'oneEnough.many'), why: Cq(k, 'oneEnough.whyMany') }, { text: Cq(k, 'oneEnough.expand'), why: Cq(k, 'oneEnough.whyExpand') }],
    hints: [Cq(k, 'oneEnough.hint1'), Cq(k, 'oneEnough.hint2')], explain: Cq(k, 'oneEnough.explain'),
  }),
  notProof: (lab, tk, k) => {
    const a = L.treeOf(tk.a); const b = L.treeOf(tk.b);
    const eqs = [-3, -2, -1, 0, 1, 2, 3].filter((x) => S.pairAt(a, b, rat(x)).equal);
    const o = { eqs: $(`x=${eqs.join(',\\ x=')}`) };
    return {
      id: 'notProof', kind: 'choice', prompt: Cq(k, 'notProof.prompt', o),
      options: [{ text: Cq(k, 'notProof.right'), correct: true }, { text: Cq(k, 'notProof.twice'), why: Cq(k, 'notProof.whyTwice') }, { text: Cq(k, 'notProof.marble'), why: Cq(k, 'notProof.whyMarble') }],
      hints: [Cq(k, 'notProof.hint1', o), Cq(k, 'notProof.hint2')], explain: Cq(k, 'notProof.explain', o),
    };
  },
  expanded: (lab, tk, k) => {
    const t = S.toTerms(L.treeOf(tk.a));
    const flip = (p) => { const u = t.map((q) => (q.p === p ? { ...q, c: -q.c } : q)); return termsTex(u); };
    const ps = t.map((q) => q.p);
    const p1 = ps.includes(1) ? 1 : ps[0]; const p0 = ps.includes(0) ? 0 : ps.at(-1);
    const o = { A: $(exprTex(tk.a)), B: $(exprTex(tk.b)), r: $(termsTex(t)) };
    return {
      id: 'expanded', kind: 'choice', cols: 3, prompt: Cq(k, 'expanded.prompt', o),
      options: [{ text: opt(flip(p1)), why: Cq(k, 'expanded.whySign') }, { text: opt(termsTex(t)), correct: true }, { text: opt(flip(p0)), why: Cq(k, 'expanded.whySign') }],
      hints: [Cq(k, 'expanded.hint1'), Cq(k, 'expanded.hint2')], explain: Cq(k, 'expanded.explain', o),
    };
  },
  noCounter: (lab, tk, k) => {
    const o = { r: $(termsTex(S.toTerms(L.treeOf(tk.a)))) };
    return {
      id: 'noCounter', kind: 'choice', prompt: Cq(k, 'noCounter.prompt'),
      options: [{ text: Cq(k, 'noCounter.right', o), correct: true }, { text: Cq(k, 'noCounter.few'), why: Cq(k, 'noCounter.whyFew') }, { text: Cq(k, 'noCounter.shape'), why: Cq(k, 'noCounter.whyShape') }],
      hints: [Cq(k, 'noCounter.hint1'), Cq(k, 'noCounter.hint2')], explain: Cq(k, 'noCounter.explain', o),
    };
  },
  rule: (lab, tk, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k('discovery.prompt')}</MathText>, options: discoveryOptions(lab, k),
    hints: [Cq(k, 'rule.hint1'), Cq(k, 'rule.hint2')], explain: <Formal lab={lab} k={k} />,
  }),
};
