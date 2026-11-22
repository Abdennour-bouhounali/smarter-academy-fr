import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Scissors, Hand, CheckCircle2, XCircle, Undo2, FlaskConical } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import { frac, mul } from '@smarter-academy/core/arithmetic/linear.js';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import LabFold from '../primitives/LabFold';
import { LabCard, StageFrame, PromptCard, RoundButton, VerdictBanner } from '../primitives/LabKit';
import { Cake, sectorPath as sectorPathOf } from '../primitives/CakeFigure';
import KidFigure from '../primitives/KidFigure';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { LEVELS } from '../levels';
import * as L from '../logic/fairShare';

/**
 * fair-share — LE PARTAGE ÉQUITABLE (1AM, unité 4 « الكتابات الكسرية », درس « حاصل القسمة والكسر », manuel نشاط 1 p. 53 et
 * معارف 1 p. 55). La logique, exacte, est dans `logic/fairShare.js` (fractions du core, importées par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. Des gâteaux ronds sont posés pour b enfants. L'élève agit par DEUX pas discrets : « قسّم كل كعكة إلى n قطع » (n = 1, 2, 3 …) puis
 *    « كل واحد يأخذ m قطع » (−/+). La part d'un enfant vaut m / n gâteau ; le labo COLORIE les parts de chaque enfant sur les gâteaux.
 *    Ce n'est ni `division-jumps` (b donné, la main tient le nombre de groupes), ni `fraction-knife` (la part est fixe, la main tient
 *    le nombre de morceaux) : ici la main coupe ET choisit la part, la grandeur inconnue du quotient.
 * B. Le nombre x tel que b × x = a existe pour tout a et b ≠ 0 ; il s'écrit a/b ; il n'est décimal que parfois.
 * C. Le labo juge b × x contre a : du gâteau reste (un secteur intact cerclé de rose), du gâteau manque (gâteaux fantômes en pointillés
 *    roses : ils n'existent pas), ou tout est partagé (les enfants sourient). Aucune coupe n'est annoncée juste.
 * D. a ÷ b = a/b et b × a/b = a, écrits avec les demandes de l'élève ; la valeur décimale quand elle existe, sinon deux valeurs
 *    décimales encadrantes (SES essais en dixièmes) : « 0,6 est approchée, 2/3 est la valeur exacte ».
 * E. Avant la règle : le contraste 3 ÷ 4 puis 2 ÷ 3 ; couper en dixièmes ne tombe jamais juste, couper en b parts toujours. Les fausses
 *    conjectures (« la division décimale donne toujours la part exacte », « la fraction renversée ») sont réfutées avec SES nombres.
 *
 * FICHE (DNA §7)
 *   CONCEPT       la fraction a/b est le quotient a ÷ b : le nombre qui multiplié par b donne a
 *   OBJECT        a gâteaux ronds, leurs parts coloriées par enfant, b enfants (KidFigure) avec leur assiette
 *   VARIABLE      n (le nombre de parts par gâteau) et m (les parts de chaque enfant)
 *   INVARIANT     a et b ; toutes les parts sont égales
 *   TRANSFORMATION n change : les coupes de TOUS les gâteaux changent d'un coup ; m grandit : les tranches avancent de gâteau en gâteau
 *   CONSTRAINT    on ne coupe qu'en parts égales ; les gâteaux ne dépassent pas la table
 *   RESISTANCE    les dixièmes ne tombent pas juste pour 3 ÷ 4, 2 ÷ 3, 5 ÷ 6, 7 ÷ 3 : il reste ou il manque un peu, toujours
 *   EVIDENCE      le reste / le manque dessinés et écrits avec les chiffres de l'élève ; les enfants réagissent
 *   CONTRAST      3 ÷ 4 puis 2 ÷ 3 (مبتدئ) ; 5 ÷ 6 puis 7 ÷ 3 (متقدم)
 *   PREDICTION    aucune coupe n'est étiquetée juste ; aucune règle n'annonce le résultat
 *   DISCOVERY     « on écrit la part par une fraction : numérateur = gâteaux, dénominateur = enfants »
 *   FORMALIZATION a ÷ b = a/b ; b × a/b = a ; décimal ou valeur approchée
 *   TRANSFER      les exercices 4–5 p. 57, معارف 1 (7/3), la banque ; « جرّب أعدادك » (ses propres a et b, toujours ouvert)
 *
 * « جرّب كل الإمكانيات » : NON (chaque choix EST la réponse de l'élève). Pas d'auto-complétion.
 *
 * LE KIT (§8ter, DNA §17) : `PromptCard` §17.9 (contexte avec les nombres, UNE question qui nomme l'état final et sa lampe, les
 * pilules de lecture), scène dans un `StageFrame`, carte de commande (couper + prendre), `VerdictBanner` à place fixe, LabCoach.
 * D'UN SEUL REGARD : `[data-fs-glance]` enveloppe consigne, scène, commandes et verdict.
 *
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 1, 2026-10-28) : `checkpoints` (défaut true). Après
 * CHAQUE demande résolue (tout partagé), une suite par-dessus le labo (`chainsOf`) : la part d'un enfant · b × la part · décimal (la part
 * tombe juste en dixièmes) ou dixièmes (elle ne tombe jamais juste) ; la dernière demande finit par LA RÈGLE (l'ancienne découverte, qui
 * formalise dans `onDone`). « أعِد التجربة » remet LA MÊME demande (`L.retryOrder`) ; « إعادة » la demande 1. Mode guidé (`guided`) dès
 * qu'une suite est active ; l'enseignant seul coupe les questions pour SON compte. ÉTAPES `LabStepper` (`[data-fs-step=<i>]`) et la fête
 * par demande ; la demande LIBRE n'a ni question ni étape. SON : `tooth` pour une coupe ou une part de plus (plus grave en arrière),
 * `bell` quand la part fait un gâteau entier, `flag` tout partagé, `over` trop pris.
 * Props : `scene` ('canteen' | 'family'), `orders` [[a, b], …] (la première demande, puis le contraste), `level`, `levels`, `title`,
 * `lead`, `onTrial({ order, ruler, n, m, x, kind, ok, free })` à chaque essai VALIDÉ, `onFinished({ orders })` à la règle — par `state.report`.
 *
 * CONTRAT DOM : [data-fair-share][data-scene][data-order][data-split][data-solved][data-layout], [data-fs-glance],
 * [data-fs-prompt][data-lit], [data-fs-scene], [data-fs-split][data-n], [data-fs-take][data-m], [data-fs-step-less|more=split|take],
 * [data-fs-step-value=split|take], [data-fs-read=<share|total>], [data-fs-cake=<i>], [data-fs-ghost=<i>], [data-cake-slice=<kid>], [data-fs-gap],
 * [data-fs-over], [data-fs-plate-share=<kid>], [data-fs-kid=<i>][data-mood], [data-fs-verdict=<kind>], [data-fs-next], [data-fs-next-button],
 * [data-fs-back], [data-fs-formal], [data-fs-free…], [data-fs-key], [data-fs-nonzero], [data-fs-zero-button], [data-fs-zero], [data-lab-fold=fair-share.trials].
 */
const NS = 'manipulation.fairShare';
const WIDE_MIN = 560;
const COLORS = ['#6366F1', '#F59E0B', '#10B981', '#F43F5E', '#0EA5E9', '#A855F7', '#EA580C', '#0D9488'];
const LOOKS = [
  { hairStyle: 'hijab', scarf: 'rose', outfit: 'pink', skin: 'light' },
  { hairStyle: 'short', hair: 'black', outfit: 'blue', skin: 'wheat' },
  { hairStyle: 'hijab', scarf: 'mint', outfit: 'teal', skin: 'brown' },
  { hairStyle: 'curly', hair: 'brown', outfit: 'orange', skin: 'light' },
  { hairStyle: 'hijab', scarf: 'lavender', outfit: 'violet', skin: 'wheat' },
  { hairStyle: 'short', hair: 'chestnut', outfit: 'green', skin: 'deep' },
  { hairStyle: 'hijab', scarf: 'sky', outfit: 'blue', skin: 'light' },
  { hairStyle: 'curly', hair: 'black', outfit: 'orange', skin: 'wheat' },
];
const MOTION_CSS = '@keyframes fs-pop{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}'
  + '@keyframes fs-hop{0%{transform:translateY(0)}45%{transform:translateY(-7px)}100%{transform:translateY(0)}}'
  + '.fs-pop{transform-box:fill-box;transform-origin:50% 50%;animation:fs-pop .28s cubic-bezier(.34,1.56,.64,1) both}'
  + '.fs-hop{animation:fs-hop .45s ease-out 1}'
  + '@media (prefers-reduced-motion: reduce){.fs-pop,.fs-hop{animation:none}}';

/** Une fraction écrite en colonne — un îlot LTR. */
function Frac({ n, d, className = '', ...rest }) {
  return (
    <span className={`inline-flex flex-col items-center align-middle font-mono font-black leading-none tabular-nums ${className}`} dir="ltr" {...rest}>
      <span className="px-0.5">{n}</span>
      <span className="my-[2px] block h-[2px] w-full min-w-[1.1em] rounded bg-current" aria-hidden="true" />
      <span className="px-0.5">{d}</span>
    </span>
  );
}
const Row = ({ children, className = '', ...rest }) => (
  <bdi dir="ltr" className={`inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 ${className}`} {...rest}>{children}</bdi>
);
function StatPill({ label, value, tone = 'indigo', small = false, ...rest }) {
  const tones = { indigo: 'border-indigo-100 bg-white text-indigo-900', rose: 'border-rose-200 bg-rose-50 text-rose-900', emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900' };
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border font-bold ${small ? 'gap-1 px-2 text-[11px]' : 'gap-1.5 px-2.5 py-0.5 text-xs'} ${tones[tone] ?? tones.indigo}`} {...rest}>
      {label}
      <span className={`font-black tabular-nums ${small ? 'text-sm' : 'text-base'}`}>{value}</span>
    </span>
  );
}

export default function FairShare({
  scene: scene0, orders: orders0, title, lead, level, levels: withLevels = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished, coach: coachOn = true, checkpoints: cpOn = true,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const preset = LEVELS['fair-share'][resolveLevelId(level ?? 'beginner')].numbers;
  const initialNumbers = useMemo(() => ({ scene: scene0 ?? preset.scene, orders: orders0 ?? preset.orders }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'fair-share', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { scene, orders } = state.numbers;
  const sceneKey = `${scene}|${JSON.stringify(orders)}|${state.epoch}`;
  const [lab, setLab] = useState(() => L.init({ orders }));
  const [seen, setSeen] = useState({ key: sceneKey, inits: 0 });
  // « إعادة » (epoch), un autre niveau : TOUT recommence — la demande 1, les essais et les questions du labo
  if (seen.key !== sceneKey) { setSeen({ key: sceneKey, inits: seen.inits + 1 }); setLab(L.init({ orders })); }

  const { a, b, n, m } = lab;
  const ready = L.discoveryReady(lab);
  // les questions pendant le labo : la suite de la demande courante (jamais la demande libre)
  const cpSettings = useLabCheckpointSettings('fair-share');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const chains = cpOn && cpSettings.enabled ? chainsOf(lab) : null;
  const free0 = L.isFree(lab);
  const chain = !free0 ? chains?.[lab.i] ?? null : null;
  const ruleByCheckpoint = !!chains;
  const cp = useLabCheckpoint({
    id: chain ? `order-${lab.i}` : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, lab.i, k, scene)) : null,
    reached: !free0 && L.orderSolved(lab),
    resetKey: seen.inits,
    onRetry: () => setLab(L.retryOrder),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (chains?.[Number(id.slice(6))]?.includes('rule')) { state.discover(); state.formalize(); } },
  });
  useEffect(() => { if (ready && !ruleByCheckpoint) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son : une coupe, une part de plus (au plus une note toutes les 35 ms), puis le verdict
  const prevNM = useRef({ n, m, at: 0 });
  useEffect(() => {
    const p = prevNM.current;
    const up = n !== p.n ? n > p.n : m > p.m;
    if (n !== p.n || m !== p.m) {
      const v0 = L.shownVerdict(lab);
      const now = Date.now();
      if (v0?.kind === 'exact') playSfx('flag');
      else if (v0?.kind === 'over' && m > p.m) playSfx('over');
      else if (m > 0 && m % n === 0 && m > p.m) playSfx('bell');
      else if (now - p.at > 35) { playSfx('tooth', { pitch: up ? 1 : 0.75 }); p.at = now; }
    }
    prevNM.current = { n, m, at: p.at };
  }, [n, m]); // eslint-disable-line react-hooks/exhaustive-deps
  // les étapes : une demande est FAITE quand tout est partagé ET que ses questions sont répondues ; on la fête une fois
  const stepDone = lab.orders.slice(0, lab.base).map((_, i) => L.orderSolved(lab, i) && (i !== lab.i || !cp.blocking));
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = !free0 && stepDone[lab.i];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.i)) return;
    celebrated.current.add(lab.i);
    party.celebrate({ n: lab.i + 1, total: lab.base });
  }, [nowDone, lab.i]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, L.finishedEvidence(lab)); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'fair-share', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });
  const nTrials = lab.trials.length;
  useEffect(() => { if (nTrials > 0) state.report(onTrial, L.trialEvidence(lab.trials.at(-1))); }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── les noms comptés ── */
  const cakes = (n) => k('cakes', { count: n });
  const kidsOf = (n) => k(scene === 'family' ? 'persons' : 'kids', { count: n });
  const pieces = (n) => k('pieces', { count: n });
  /** Une quantité de pains : un entier se dit « 3 أرغفة », un décimal « 0,75 رغيف ». */
  const amount = (x) => (x.d === 1 ? cakes(x.n) : k('cakeDec', { x: L.decimalText(x) }));

  /* ── mesure ── */
  const boxRef = useRef(null);
  const [width, setWidth] = useState(320);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => setWidth(Math.max(200, Math.floor(el.clientWidth)));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const compact = width < 380;
  const wide = width >= WIDE_MIN;
  const W = Math.min(width, 760);

  /* ── la géométrie ── */
  const ck = useMemo(() => L.cakesLayout({ width: W, a, b, top: compact ? 22 : 26, maxD: compact ? 92 : 132 }), [W, a, b, compact]);
  const kd = useMemo(() => L.kidsLayout({ width: W, b }), [W, b]);
  const mMax = L.mMaxOf(a, b, n);
  const kidTop = ck.height + (compact ? 14 : 18);
  const kidFoot = kidTop + (compact ? 46 : 62);
  const yPlate = kidFoot + (compact ? 16 : 20);
  const Y = { kidTop, kidFoot, plate: yPlate, H: yPlate + (compact ? 18 : 22) };

  const v = L.shownVerdict(lab);
  const x = v ? v.x : frac(m, n);
  const total = mul(x, frac(b));
  const sharePill = pieces(m);

  const verdictText = useMemo(() => {
    if (!v) return '';
    const o = { kids: kidsOf(b), per: pieces(v.n), pieces: pieces(v.m), share: amount(v.x), total: amount(v.total), have: cakes(a), gap: amount(v.left ?? v.missing ?? frac(0)) };
    return k(`v.${v.kind}`, o);
  }, [v, scene]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la découverte ── */
  const ref = useMemo(() => L.refutations(lab, orders.length - 1), [lab, orders]);
  const lastA = orders.at(-1)[0];
  const lastB = orders.at(-1)[1];
  const discoveryOptions = useMemo(() => {
    const o = { cakes: cakes(lastA), kids: kidsOf(lastB), a: lastA, b: lastB };
    const dec = ref.decimal;
    const inv = ref.inverse;
    return [
      {
        text: k('discovery.dec'),
        why: dec ? k(`discovery.whyDec.${dec.kind}`, { ...o, x: dec.x, total: dec.total, gap: dec.gap }) : k('discovery.whyDecNone', o),
      },
      { text: k('discovery.right'), correct: true },
      { text: k('discovery.inv'), why: k(`discovery.whyInv.${inv.kind}`, { ...o, x: inv.x, total: inv.total }) },
    ];
  }, [ref, lastA, lastB, scene]); // eslint-disable-line react-hooks/exhaustive-deps

  const formal = (
    <div className="space-y-2" data-fs-formal>
      {/* la fraction ÉTIQUETÉE : le haut = les gâteaux de la table, le bas = les enfants qui attendent */}
      <div className="rounded-2xl border border-emerald-200 bg-white/80 p-3" data-fs-key>
        <p className="mb-2 text-center text-sm font-black text-emerald-900">{k('formal.keyTitle')}</p>
        <div className="mx-auto grid w-fit grid-cols-[auto_auto] items-center gap-x-3 gap-y-1" dir="ltr">
          <span className="rounded-xl bg-indigo-600 px-3 py-1 text-center font-mono text-lg font-black text-white" data-fs-key-a>a</span>
          <span className="text-right text-sm font-bold text-indigo-900" dir="rtl">{k('formal.keyA')}</span>
          <span className="block h-[3px] w-full rounded bg-slate-700" aria-hidden="true" />
          <span />
          <span className="rounded-xl bg-amber-500 px-3 py-1 text-center font-mono text-lg font-black text-white" data-fs-key-b>b</span>
          <span className="text-right text-sm font-bold text-amber-900" dir="rtl">{k('formal.keyB')}</span>
        </div>
      </div>
      {L.formalOf(lab).map((f) => (
        <div key={f.i} className="space-y-1 rounded-2xl border border-emerald-200 bg-white/70 p-2 text-center text-indigo-950">
          <p className="text-xs font-bold text-slate-600">{k('formal.caseLine', { cakes: cakes(f.a), kids: kidsOf(f.b) })}</p>
          <Row className="text-base font-extrabold">
            <span className="font-mono">{f.a} ÷ {f.b}</span><span>=</span>
            <span className="inline-flex flex-col items-center align-middle font-mono font-black leading-none tabular-nums" dir="ltr" data-fs-frac={`${f.a}/${f.b}`}>
              <span className="rounded-lg bg-indigo-100 px-2 text-indigo-800">{f.a}</span>
              <span className="my-[2px] block h-[2px] w-full min-w-[1.4em] rounded bg-current" aria-hidden="true" />
              <span className="rounded-lg bg-amber-100 px-2 text-amber-800">{f.b}</span>
            </span>
          </Row>
          <Row className="text-sm font-bold text-slate-700">
            <span className="font-mono">{f.b} ×</span><Frac n={f.a} d={f.b} className="text-sm" /><span>= {f.a}</span>
          </Row>
          <p className="text-sm font-bold text-emerald-900" data-fs-formal-decimal={f.decimal ?? ''}>
            {f.decimal ? k('formal.decimal', { a: f.a, b: f.b, dec: f.decimal }) : k('formal.approx', { a: f.a, b: f.b, below: f.approx.below, above: f.approx.above })}
          </p>
        </div>
      ))}
      <p className="text-sm text-emerald-900">{k('formal.rule')}</p>
      <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-3 text-sm font-bold leading-relaxed text-rose-950" data-fs-nonzero>
        <p className="font-black">{k('formal.nonZeroTitle')}</p>
        <p>{k('formal.nonZero', { a: lastA })}</p>
      </div>
    </div>
  );

  /* ── les commandes : COUPER chaque gâteau en n parts, puis choisir m parts par enfant ── */
  const [loN, hiN] = L.SPLIT_LIMITS;
  const commit = (mm) => setLab((q) => L.commitM(q, mm));
  const stepRow = (key, label, value, lo, hi, onSet, attrs, icon) => (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-indigo-100 bg-white px-2 py-1.5" {...attrs}>
      <span className={`flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'} font-black text-indigo-950`}>{icon}{label}</span>
      <div className="flex items-center gap-2" dir="ltr">
        <RoundButton size={compact ? 44 : 52} onClick={() => onSet(value - 1)} disabled={value <= lo} aria-label={k(`${key}.less`)} data-fs-step-less={key}>
          <Minus className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
        </RoundButton>
        <span className={`min-w-[2.2ch] text-center ${compact ? 'text-xl' : 'text-2xl'} font-black tabular-nums text-indigo-900`} data-fs-step-value={key}>{value}</span>
        <RoundButton primary size={compact ? 44 : 52} onClick={() => onSet(value + 1)} disabled={value >= hi} aria-label={k(`${key}.more`)} data-fs-step-more={key}>
          <Plus className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
        </RoundButton>
      </div>
    </div>
  );
  const controls = (
    <LabCard className={`${wide ? 'grid grid-cols-2 gap-3' : 'space-y-2'} ${compact ? 'p-2' : 'p-3'}`} data-fs-controls>
      {stepRow('split', k('split.label'), n, loN, hiN, (nn) => setLab((q) => L.setN(q, nn)), { 'data-fs-split': true, 'data-n': n }, <Scissors className="h-4 w-4" aria-hidden="true" />)}
      {stepRow('take', k('take.label'), m, 0, mMax, commit, { 'data-fs-take': true, 'data-m': m })}
    </LabCard>
  );

  /* ── ses propres nombres : toujours ouverts ── */
  const free = L.isFree(lab);
  const [zero, setZero] = useState(false);
  const [loA, hiA] = L.FREE_LIMITS.cakes;
  const [loB, hiB] = L.FREE_LIMITS.kids;
  const stepper = (key, label, value, lo, hi, onSet) => (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-indigo-100 bg-white px-2 py-1.5" data-fs-free-field={key}>
      <span className="text-xs font-black text-indigo-950">{label}</span>
      <div className="flex items-center gap-1.5" dir="ltr">
        <RoundButton size={40} onClick={() => onSet(value - 1)} disabled={value <= lo} aria-label={k('free.less', { what: label })} data-fs-free-less={key}>
          <Minus className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
        </RoundButton>
        <span className="min-w-[2ch] text-center text-xl font-black tabular-nums text-indigo-900" data-fs-free-value={key}>{value}</span>
        <RoundButton primary size={40} onClick={() => onSet(value + 1)} disabled={value >= hi} aria-label={k('free.more', { what: label })} data-fs-free-more={key}>
          <Plus className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
        </RoundButton>
      </div>
    </div>
  );
  const freeCard = (
    <LabCard className={`space-y-2 border-emerald-200 bg-emerald-50/50 ${compact ? 'p-2' : 'p-3'}`} data-fs-free data-active={free ? 'true' : 'false'}>
      <p className={`flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'} font-black text-emerald-900`}>
        <FlaskConical className="h-4 w-4" aria-hidden="true" /> {k('free.title')}
      </p>
      <p className="text-xs font-bold leading-snug text-slate-600">{free ? k('free.on') : k('free.hint')}</p>
      <div className={wide ? 'grid grid-cols-2 gap-3' : 'space-y-2'}>
        {stepper('cakes', k('free.cakes'), a, loA, hiA, (n) => setLab((q) => L.setCustom(q, n, q.b)))}
        {stepper('kids', k('free.kids'), b, loB, hiB, (n) => setLab((q) => L.setCustom(q, q.a, n)))}
      </div>
      <button type="button" onClick={() => setZero((z) => !z)} aria-expanded={zero} data-fs-zero-button
        className="inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-rose-200 bg-white px-3 text-xs font-bold text-rose-900">
        {k('free.zeroButton')}
      </button>
      {zero && (
        <div className="space-y-1 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold leading-relaxed text-rose-950" data-fs-zero>
          <svg width="100%" height="46" viewBox="0 0 220 46" role="img" aria-label={k('free.zeroAria')} style={{ direction: 'ltr' }}>
            <circle cx="40" cy="26" r="16" fill="#FCE7B6" stroke="#9A5A14" strokeWidth="1.5" />
            <text x="40" y="31" textAnchor="middle" fontSize="14" fontWeight="800" fill="#7C2D12">{a}</text>
            <text x="110" y="31" textAnchor="middle" fontSize="18" fontWeight="800" fill="#9F1239">÷</text>
            <rect x="150" y="10" width="44" height="32" rx="8" fill="#FFF1F2" stroke="#E11D48" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="172" y="32" textAnchor="middle" fontSize="16" fontWeight="800" fill="#9F1239">0</text>
          </svg>
          <p>{k('free.zero', { cakes: cakes(a) })}</p>
        </div>
      )}
      {free && (
        <button type="button" onClick={() => setLab(L.toGuided)} data-fs-free-back
          className="inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-900">
          <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('free.back')}
        </button>
      )}
    </LabCard>
  );

  const verdictTone = v ? (v.ok ? 'emerald' : 'rose') : 'indigo';
  const verdictLine = (
    <VerdictBanner tone={verdictTone} icon={v ? (v.ok ? CheckCircle2 : XCircle) : Hand} size={compact ? 'xs' : 'sm'}
      className={wide ? 'min-h-[3.5rem]' : compact ? 'min-h-[3.75rem]' : 'min-h-[4.75rem]'}
      data-fs-verdict={v?.kind ?? ''}>
      <p className={v ? '' : 'font-bold text-indigo-900'}>{v ? verdictText : k('instruction')}</p>
    </VerdictBanner>
  );
  const nextCard = L.canNext(lab) && !cp.blocking && (
    <LabCard className="space-y-2 border-amber-200 bg-amber-50/70 p-3" data-fs-next>
      <p className="text-sm font-bold leading-snug text-amber-950">
        <span className="font-black">{k('next.title')}</span> {k('next.text', { cakes: cakes(lab.orders[lab.i + 1][0]), kids: kidsOf(lab.orders[lab.i + 1][1]) })}
      </p>
      <button type="button" onClick={() => setLab(L.next)} data-fs-next-button
        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 px-3 text-sm font-black text-amber-950 shadow-[0_4px_0_0_#D97706] outline-none transition-transform active:translate-y-0.5 active:shadow-none focus-visible:ring-4 focus-visible:ring-amber-300 motion-reduce:transition-none">
        {k('next.button')}
      </button>
    </LabCard>
  );
  const backButton = lab.i > 0 && !free && (
    <button type="button" onClick={() => setLab((s) => L.back(s))} data-fs-back
      className="inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-indigo-100 bg-white px-3 text-xs font-bold text-indigo-800">
      <Undo2 className="h-4 w-4" aria-hidden="true" /> {k('back', { cakes: cakes(lab.orders[lab.i - 1][0]), kids: kidsOf(lab.orders[lab.i - 1][1]) })}
    </button>
  );

  const readingPills = (
    <div className="flex flex-wrap items-center gap-1.5" data-fs-reading>
      <StatPill small={compact} label={k('read.share')} value={sharePill} data-fs-read="share-pill" />
      <StatPill small={compact} label={k('read.total')} value={amount(total)} tone={v ? (v.ok ? 'emerald' : 'rose') : 'indigo'} data-fs-read="total" />
    </div>
  );

  /* ── la scène ── */
  const mood = v?.kind === 'exact' ? 'proud' : v?.kind === 'over' ? 'wonder' : v ? 'neutral' : 'happy';
  const xv = x.n / x.d;
  const sl = useMemo(() => L.slicesOf({ a, b, x }), [a, b, x.n, x.d]); // eslint-disable-line react-hooks/exhaustive-deps
  const slicesOn = (c) => [
    ...sl.kids.filter((q) => q.cake === c).map((q) => ({ ...q, color: COLORS[q.kid % COLORS.length] })),
    ...(v && v.kind === 'short' ? sl.rest.filter((q) => q.cake === c).map((q) => ({ ...q, rest: true })) : []),
  ];
  const kidH = Y.kidFoot - Y.kidTop;
  const kidScale = Math.min(1, (kd.slot * 1.55) / kidH);
  const kH = Math.max(compact ? 38 : 46, kidH * kidScale);
  const whole = Math.floor(xv + 1e-9);
  const fracPart = xv - whole;
  const pr = Math.max(8, Math.min(compact ? 12 : 15, kd.slot * 0.3));
  const nFlags = Math.max(6, Math.floor((W - 24) / 24));
  const flags = Array.from({ length: nFlags }, (_, i) => ({ x: 12 + ((W - 24) * (i + 0.5)) / nFlags, c: ['#10B981', '#F59E0B', '#FFFFFF'][i % 3] }));
  const sceneNode = (
    <StageFrame className="overflow-hidden" style={{ width: W, height: Y.H }} data-fs-scene data-fs-split-n={n}>
      <svg width={W} height={Y.H} className="absolute inset-0" style={{ direction: 'ltr' }} role="img" aria-label={k('sceneAria', { a, b, kids: kidsOf(b) })}>
        {/* la nappe de fête du المولد النبوي : une guirlande, puis les gâteaux ronds */}
        <rect x={4} y={3} width={W - 8} height={ck.height - 4} rx={14} fill="#FFF7ED" stroke="#FDBA74" strokeWidth={1.4} data-fs-table />
        <g aria-hidden="true" data-fs-bunting>
          <path d={`M10 9 Q${W / 2} ${compact ? 17 : 21} ${W - 10} 9`} fill="none" stroke="#047857" strokeWidth={1.2} />
          {flags.map((f, i) => {
            const t = f.x / W;
            const sag = (compact ? 8 : 10) * 4 * t * (1 - t) * 0.98 + 9;
            return <path key={i} d={`M${f.x - 5} ${sag - 0.5} L${f.x + 5} ${sag - 0.5} L${f.x} ${sag + (compact ? 7 : 9)}Z`} fill={f.c} stroke="#047857" strokeWidth={0.8} />;
          })}
        </g>
        {Array.from({ length: ck.N }, (_, i) => {
          const c = ck.cell(i);
          const mine = slicesOn(i);
          if (i < a) return <Cake key={i} cx={c.cx} cy={c.cy} r={c.r} cuts={n} slices={mine} data-fs-cake={i} />;
          if (mine.length) return <Cake key={i} cx={c.cx} cy={c.cy} r={c.r} ghost slices={mine} data-fs-over data-fs-ghost={i} />;
          return <circle key={i} cx={c.cx} cy={c.cy} r={c.r - 2} fill="none" stroke="#CBD5E1" strokeWidth={1.2} strokeDasharray="2 4" opacity={0.7} aria-hidden="true" data-fs-empty={i} />;
        })}

        {/* les enfants : chacun garde sa part dans son assiette, de la couleur de ses tranches */}
        {Array.from({ length: b }, (_, i) => {
          const cx = kd.cx(i);
          const top = Y.kidFoot - kH;
          const col = COLORS[i % COLORS.length];
          return (
            <g key={i} data-fs-kid={i} data-mood={mood} className={v?.kind === 'exact' ? 'fs-hop' : undefined}>
              <KidFigure cx={cx} top={top} foot={Y.kidFoot} mood={mood} {...LOOKS[i % LOOKS.length]} />
              <circle cx={cx} cy={Y.plate} r={pr + 2} fill="#FFFFFF" stroke={col} strokeWidth={2} />
              {xv > 0 && fracPart > 1e-9 && <path d={sectorPathOf(cx, Y.plate, pr, 0, fracPart)} fill={col} fillOpacity={0.85} data-fs-plate-share={i} />}
              {xv > 0 && fracPart <= 1e-9 && <circle cx={cx} cy={Y.plate} r={pr} fill={col} fillOpacity={0.85} data-fs-plate-share={i} />}
              <circle cx={cx - pr - 1} cy={Y.plate - pr + 1} r={7} fill={col} />
              <text x={cx - pr - 1} y={Y.plate - pr + 4.8} textAnchor="middle" fontSize={10} fontWeight={800} fill="#FFFFFF" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{i + 1}</text>
              {whole >= 1 && fracPart > 1e-9 && (
                <text x={cx + pr + 3} y={Y.plate + 4} textAnchor="start" fontSize={compact ? 10 : 11} fontWeight={800} fill={col} style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{whole}+</text>
              )}
            </g>
          );
        })}
      </svg>
    </StageFrame>
  );

  const ctxArgs = { cakes: cakes(a), kids: kidsOf(b) };
  return (
    <ManipulationShell
      type="fair-share"
      title={title ?? k('title')}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      coach={coachOn ? coach : null}
      hints={[0, 1, 2].map((i) => k(`hints.${i}`))}
      guided={!!chain || ruleByCheckpoint}
      headerAction={cpSettings.control}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={<ManipulationDiscovery state={state} prompt={k('discovery.prompt', { cakes: cakes(lastA), kids: kidsOf(lastB) })} options={discoveryOptions} formal={formal} />}
      explanation={k('explanation')}
    >
      <ManipulationStage className="bg-gradient-to-b from-indigo-50/40 to-white">
        <div ref={boxRef} className="space-y-2" data-fair-share data-scene={scene} data-order={`${a}/${b}`} data-split={n}
          data-solved={ready ? 'true' : 'false'} data-layout={wide ? 'wide' : 'narrow'}>
          <style dangerouslySetInnerHTML={{ __html: MOTION_CSS }} />
          <div className="relative space-y-2" data-fs-glance>
            {party.node}
            {cp.node}
            <PromptCard
              size={compact ? 'md' : 'lg'}
              context={(state.isAuthoredLevel && lab.i === 0 && lead) || k(`context.${scene}`, ctxArgs)}
              contextProps={{ 'data-fs-context': scene }}
              aside={(
                <div className="flex flex-wrap items-center gap-2">
                  {lab.base > 1 && !free0 && <LabStepper count={lab.base} current={lab.i} done={stepDone} stepAttr="data-fs-step" />}
                  {!compact && readingPills}
                </div>
              )}
              title={<span className={compact ? 'text-base' : ''}>{k('question')}</span>}
              lamp={v?.kind === 'exact' ? 'on' : 'off'}
              titleProps={{ 'data-fs-prompt': true, 'data-lit': v?.kind === 'exact' ? 'true' : 'false' }}
            />
            {sceneNode}
            {controls}
            <div className={wide ? 'flex items-start gap-3' : 'space-y-2'}>
              <div className="min-w-0 flex-1">{verdictLine}</div>
              {(nextCard || backButton) && <div className="space-y-2" style={wide ? { width: 250 } : undefined}>{nextCard}{backButton}</div>}
            </div>
          </div>
          {freeCard}
          {lab.trials.length > 0 && (
            <LabFold id="fair-share.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-fs-trials={lab.trials.length}>
                {lab.trials.map((tr, i) => (
                  <li key={i} className={tr.ok ? 'text-emerald-800' : 'text-rose-800'} data-ok={String(tr.ok)}>
                    {k('trial', { order: `${tr.a} ÷ ${tr.b}`, x: `${pieces(tr.m)} · ${k('split.of', { n: tr.n })}`, word: k(`kind.${tr.kind}`) })}
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

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** Les suites : une par demande de la leçon ; `decimal` si la part tombe juste en dixièmes, sinon `tenths` ; `rule` clôt la dernière. */
export const CHAINS = Object.freeze({ lands: ['share', 'check', 'decimal'], never: ['share', 'check', 'tenths'] });

export function chainsOf(lab) {
  const out = {};
  lab.orders.slice(0, lab.base).forEach(([a, b], i) => {
    out[i] = [...(L.decimalLands(a, b) ? CHAINS.lands : CHAINS.never), ...(i === lab.base - 1 ? ['rule'] : [])];
  });
  return out;
}

const iso = (s) => `⁦${s}⁩`;
const C = (k, key, o) => k(`cp.${key}`, o);
const pick = (list, right, whys) => list.map((text, i) => (i === right ? { text, correct: true } : { text, why: whys[i] }));
const words = (k, scene, a, b) => ({ cakes: k('cakes', { count: a }), kids: k(scene === 'family' ? 'persons' : 'kids', { count: b }), a: iso(a), b: iso(b), frac: iso(`${a}/${b}`) });

export const QUESTIONS = {
  share: (lab, i, k, scene) => {
    const [a, b] = lab.orders[i];
    const o = words(k, scene, a, b);
    return {
      id: 'share', kind: 'number', expected: `${a}/${b}`, answer: <bdi dir="ltr">{a}/{b}</bdi>,
      prompt: C(k, 'share.prompt', o), hints: [C(k, 'share.hint1', o), C(k, 'share.hint2', o)], explain: C(k, 'share.explain', o),
    };
  },
  check: (lab, i, k, scene) => {
    const [a, b] = lab.orders[i];
    const o = { ...words(k, scene, a, b), calc: iso(`${b} × ${a}/${b} = ${a}`) };
    return {
      id: 'check', kind: 'choice', prompt: C(k, 'check.prompt', o),
      options: pick([o.cakes, k('cakes', { count: 1 }), k('cakes', { count: b })], 0, [null, C(k, 'check.whyOne', o), C(k, 'check.whyB', o)]),
      hints: [C(k, 'check.hint1', o), C(k, 'check.hint2', o)], explain: C(k, 'check.explain', o),
    };
  },
  decimal: (lab, i, k, scene) => {
    const [a, b] = lab.orders[i];
    const dec = L.decimalText(frac(a, b));
    const o = { ...words(k, scene, a, b), dec: iso(dec) };
    const glued = `${a},${b}`;
    const flipped = `0,${a}${b}`;
    return {
      id: 'decimal', kind: 'choice', cols: 3, prompt: C(k, 'decimal.prompt', o),
      options: pick([iso(dec), iso(glued), iso(flipped)], 0, [null, C(k, 'decimal.whyGlued', { ...o, glued: iso(glued) }), C(k, 'decimal.whyFlipped', { ...o, flipped: iso(flipped) })]),
      hints: [C(k, 'decimal.hint1', o), C(k, 'decimal.hint2', o)], explain: C(k, 'decimal.explain', o),
    };
  },
  tenths: (lab, i, k, scene) => {
    const [a, b] = lab.orders[i];
    const o = words(k, scene, a, b);
    return {
      id: 'tenths', kind: 'choice', prompt: C(k, 'tenths.prompt', o),
      options: pick([C(k, 'tenths.never'), C(k, 'tenths.some'), C(k, 'tenths.always')], 0, [null, C(k, 'tenths.whySome', o), C(k, 'tenths.whyAlways', o)]),
      hints: [C(k, 'tenths.hint1', o), C(k, 'tenths.hint2', o)], explain: C(k, 'tenths.explain', o),
    };
  },
  rule: (lab, i, k, scene) => {
    const [a, b] = lab.orders[i];
    const ref = L.refutations(lab, i);
    const o = { cakes: k('cakes', { count: a }), kids: k(scene === 'family' ? 'persons' : 'kids', { count: b }), a, b };
    const dec = ref.decimal;
    const inv = ref.inverse;
    return {
      id: 'rule', kind: 'choice', prompt: k('discovery.prompt', { cakes: o.cakes, kids: o.kids }),
      options: [
        { text: k('discovery.dec'), why: dec ? k(`discovery.whyDec.${dec.kind}`, { ...o, x: dec.x, total: dec.total, gap: dec.gap }) : k('discovery.whyDecNone', o) },
        { text: k('discovery.right'), correct: true },
        { text: k('discovery.inv'), why: k(`discovery.whyInv.${inv.kind}`, { ...o, x: inv.x, total: inv.total }) },
      ],
      hints: [C(k, 'rule.hint1'), C(k, 'rule.hint2')],
      explain: <p>{k('formal.rule')}</p>,
    };
  },
};
