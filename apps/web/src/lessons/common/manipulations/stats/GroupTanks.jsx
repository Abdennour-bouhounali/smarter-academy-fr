import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import * as ST from '@smarter-academy/core/arithmetic/statistics.js';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import MathText from '../../components/MathText';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import * as L from '../logic/groupTanks';

/**
 * group-tanks — LES RÉSERVOIRS DE GROUPES (unité 8 « الإحصاء », درس « ترييض وقراءة وضعيات إحصائية
 * وتفسير المؤشرات », le تحدّ p. 91).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève PARIE : il fait glisser le repère 🎯 sur le réservoir VIDE de la classe (glisser sur le
 *    réservoir, ▲ ▼, flèches du clavier) ; il OUVRE la vanne ; ensuite il change l'effectif d'un groupe
 *    (toucher le réservoir du groupe, puis −/+) et regarde le niveau commun bouger.
 * B. Idée : la moyenne de groupes réunis est la moyenne PONDÉRÉE Σ n·m ÷ N — jamais la moyenne des
 *    moyennes (sauf effectifs égaux) ; deux classes peuvent avoir la même moyenne alors que leurs groupes
 *    se comparent dans les deux sens (le تحدّ).
 * C. La largeur d'un réservoir est l'effectif n, la hauteur d'eau la moyenne m : l'aire d'eau n·m est le
 *    total des points. La vanne ouverte, l'eau des groupes descend dans le réservoir de la classe (de
 *    largeur N, MÊME échelle) et s'y étale : son niveau est Σ n·m ÷ N, dessiné exactement.
 * D. Sous chaque classe s'écrit, APRÈS l'ouverture, Σ n·m = … et le niveau (« 384/33 ≈ 11,64 ») ; le
 *    pari et le verdict ; la liste des paris de l'élève (repliable).
 * E. À découvrir avant la règle : l'eau refuse la moyenne des moyennes ; le niveau suit les effectifs ;
 *    les deux classes du تحدّ s'arrêtent au MÊME niveau.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        moyenne de groupes réunis = Σ nᵢ·mᵢ ÷ Σ nᵢ (المتوسط المتوازن) ; comparer des
 *                  classes par l'indicateur de la classe entière, pas groupe par groupe
 *   OBJECT         des réservoirs d'eau (un par groupe, un par classe), une vanne
 *   VARIABLE       le PARI (niveau prévu, pas ½ ou 1/10) ; après l'ouverture, l'effectif n d'un groupe
 *   INVARIANT      le total d'eau Σ n·m (avant = après : aires dessinées égales) ; le niveau ne dépend
 *                  que de Σ n·m et de N
 *   TRANSFORMATION l'eau descend et s'étale ; le niveau monte / descend quand n change
 *   CONSTRAINT     pas de vanne sans pari ; pas d'effectif changé avant que l'eau soit dans la classe
 *   RESISTANCE     le pari « moyenne des moyennes » (9,5 ; 11,5) est refusé par l'eau elle-même, qui
 *                  s'arrête plus bas, du côté du réservoir le plus large
 *   EVIDENCE       le niveau d'eau, la ligne du pari restée au-dessus, Σ n·m ÷ N écrit sous la classe
 *   CONTRAST       مبتدئ : effectifs 4 / 6 puis égaux (le niveau rejoint 9,5) ; متقدم : les classes (أ)
 *                  et (ب) — groupes différents, comparaisons croisées — au MÊME niveau 384/33
 *   PREDICTION     le pari, posé AVANT d'ouvrir la vanne
 *   DISCOVERY      « مجموع (العدد × المتوسط) ÷ العدد الكلي » ; « للقسمين المعدّل نفسه »
 *   FORMALIZATION  m = (n₁m₁ + n₂m₂) ÷ (n₁ + n₂) ; l'indicateur de toute la série décide
 *   TRANSFER       les modules 1 et 3 (تحدّ, ex-22 : retirer une valeur), le banc d'exercices
 *
 * Mondes (`theme`) : `quiz` (مسابقة القسم, deux équipes d'amis — مبتدئ) et `school` (les deux classes du
 * manuel — متقدم). Manuel (§6bis) : chaque pari est une prédiction, chaque effectif un essai — aucune
 * auto-complétion.
 *
 * DÉCOR (exigence du propriétaire) : un buzzer de quiz qui s'allume au toucher, des bulles dans l'eau et
 * une éclaboussure quand l'eau arrive. `aria-hidden`, hors clavier, `[data-deco]`, jamais une information,
 * immobiles sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (§8bis) : la hauteur d'un réservoir vient de l'écran de leçon (`useLessonViewport`
 * moins les commandes mesurées) ; chaque colonne de classe porte SES commandes juste sous son réservoir
 * (pari ▲▼, vanne) ; la ligne d'effectif et le verdict suivent ; la liste des paris est dans un
 * `LabFold` SOUS le bloc mesuré `[data-gt-glance]`. Deux classes = deux colonnes côte à côte, même à
 * 320 px (≈ 130 px chacune).
 *
 * QUESTIONS PENDANT LE LABO (2026-10-28, lot 5 ; `primitives/LabCheckpoint`) : `checkpoints` (défaut true). DEUX étapes (`LabStepper`) :
 *   1. la 1re vanne ouverte → `CHAINS.s1` (l'eau totale Σ n·m · l'effectif N · comment le niveau se calcule) — bâties sur les effectifs du ESSAI ;
 *   2. `discoveryReady` (un effectif changé / chaque classe versée) → `CHAINS.s2` : une seule classe `move` puis `rule` ; deux classes `cmp` puis `rule`.
 *      La dernière question est la règle : elle remplace la découverte, qui formalise. Les événements `{ tk: 'checkpoint' | 'checkpoint-done', … }` partent
 *      vers `onCheckpoint` (jamais `onTrial`). OBLIGATOIRES pour tout élève ; l'ENSEIGNANT les coupe pour SON compte (interrupteur en en-tête).
 * Props : `groups` (« n:m|… », virgule décimale), `classes` (« 2|2 » : groupes par classe ; absent = une
 * classe), `theme`, `title`, `lead`, `mission`, `level`, `levels`, `onTrial(evidence)` à chaque vanne
 * ouverte ou effectif changé, `onFinished({ groups, classes })` à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-group-tanks][data-classes][data-step][data-solved], [data-gt-glance],
 * [data-gt-class=<ci>][data-opened][data-level], [data-gt-tank=<gi>][data-n][aria-pressed],
 * [data-gt-bet-handle=<ci>] (role=slider), [data-gt-bet-less|more=<ci>], [data-gt-open=<ci>],
 * [data-gt-refill=<ci>], [data-gt-size-less|more], [data-gt-verdict=<kind>], [data-gt-refused],
 * [data-gt-formula=<ci>], [data-gt-same], [data-lab-fold=group-tanks.trials], [data-deco].
 */
export default function GroupTanks({
  groups: groups0 = '4:12|6:7', classes: classes0, theme, title, lead, mission, level, levels: withLevels = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished, checkpoints: cpOn = true, onCheckpoint,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.groupTanks.${key}`, o), [t]);
  const initialNumbers = classes0 ? { groups: groups0, classes: classes0 } : { groups: groups0 };
  const state = useManipulation({ type: 'group-tanks', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { groups, classes } = state.numbers;
  const make = () => L.init({ groups, classes });
  const [lab, setLab] = useState(make);
  const sceneKey = `${groups}|${classes ?? ''}|${state.epoch}`;
  const [scene, setScene] = useState(sceneKey);
  const [sel, setSel] = useState(0);
  const [inits, setInits] = useState(0);
  const [done1, setDone1] = useState(false);
  if (scene !== sceneKey) { setScene(sceneKey); setLab(make()); setSel(0); setInits((n) => n + 1); setDone1(false); }

  const many = lab.classes.length > 1;
  const world = theme ?? (many ? 'school' : 'quiz');
  const words = t(`manipulation.groupTanks.themes.${world}`, { returnObjects: true });
  const W = typeof words === 'object' && words ? words : {};
  const gName = (gi) => W.groups?.[gi] ?? k('groupFallback', { n: gi + 1 });
  const cName = (ci) => (many ? W.classes?.[ci] : W.classes?.[0]) ?? k('classFallback', { n: ci + 1 });

  // les questions pendant le labo : obligatoires pour tout élève, l'enseignant seul les coupe pour SON compte
  const cpSettings = useLabCheckpointSettings('group-tanks');
  const cpActive = cpOn && cpSettings.enabled;
  const stage = lab.trials.length === 0 || !done1 ? 's1' : 's2';
  const cpReached = stage === 's1' ? lab.trials.length > 0 : L.discoveryReady(lab);
  const solved = L.discoveryReady(lab);
  const cp = useLabCheckpoint({
    id: cpActive ? stage : null,
    questions: cpActive && cpReached ? (many ? CHAINS.many : CHAINS.one)[stage].map((q) => QUESTIONS[q](lab, k, { gName, cName, many })) : null,
    reached: cpReached,
    resetKey: inits,
    // « أعِد التجربة » : l'étape recommence (s1 : tout est remis ; s2 : les effectifs reviennent au départ, ou les classes sont remises)
    onRetry: () => { setSel(0); setLab((x) => (stage === 's1' || many ? make() : { ...x, groups: x.groups.map((g) => ({ ...g, n: g.n0 })), sizeTrials: [], last: null })); },
    onEvent: (ev) => state.report(onCheckpoint, ev),
    onDone: (id) => { if (id === 's1') setDone1(true); else { state.discover(); state.formalize(); } },
  });
  const ready = solved && !cpActive;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps

  // les sons : un cran de pari / d'effectif = un pas ; l'eau qui arrive = juste (flag) ou refusée (over)
  useEffect(() => {
    const l = lab.last;
    if (!l) return;
    if (l.kind === 'bet' || l.kind === 'size') playSfx('tooth', { pitch: l.kind === 'bet' ? 1 : 0.85 });
    else if (l.kind === 'opened') playSfx(lab.trials.at(-1)?.ok ? 'flag' : 'over');
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, { groups, classes }); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const nEvents = lab.trials.length + lab.sizeTrials.length;
  useEffect(() => { if (nEvents > 0) state.report(onTrial, L.evidenceOf(lab)); }, [nEvents]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : largeur de la scène, hauteur de l'écran de leçon, hauteur des commandes ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const tankRef = useRef(120);
  const [width, setWidth] = useState(320);
  // ce que le bloc « glance » mesure EN PLUS des deux réservoirs (titres, tuyau, boutons, lecture, verdict)
  const [overhead, setOverhead] = useState(260);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(150, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(140, Math.ceil(glanceRef.current.getBoundingClientRect().height) - 2 * tankRef.current));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (glanceRef.current) ro.observe(glanceRef.current);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 600;
  const narrow = width < 360;
  const GAP = 10;
  const colW = Math.min(many ? 300 : 340, Math.floor((width - (many ? GAP : 0)) / (many ? 2 : 1)));
  // par colonne : titre ≈ 20, tuyau ≈ 26, rangée pari/vanne ≈ 50, lecture ≈ 34 ; puis les commandes communes
  const tankH = Math.round(Math.max(56, Math.min(170, (screenH - overhead - 36) / 2)));
  tankRef.current = tankH;
  // une colonne étroite (deux classes sur téléphone) : pas de ▲▼ (la piste se touche, la poignée se règle au
  // clavier), lecture courte, poignée DANS le réservoir
  const tight = colW < 150;

  /* ── les gestes ── */
  const bet = (ci, kk) => setLab((s) => L.setBet(s, ci, kk));
  const open = (ci) => setLab((s) => L.openValve(s, ci));
  const refill = (ci) => setLab((s) => L.refill(s, ci));
  const size = (gi, n) => setLab((s) => L.setSize(s, gi, n));
  const selG = lab.groups[sel] ?? lab.groups[0];

  /* « جرّب كل الإمكانيات » : tous les effectifs possibles du groupe choisi (1 … max), une fois la vanne ouverte.
     Le pari et l'ouverture restent le geste de l'élève ; chaque n est l'essai exact de −/+ (L.setSize). */
  const labRef = useRef(lab);
  labRef.current = lab;
  const untriedN = () => {
    const cur = labRef.current;
    const g = cur.groups[sel] ?? cur.groups[0];
    return Array.from({ length: L.nMax(g) - L.N_MIN + 1 }, (_, i) => L.N_MIN + i).filter((n) => n !== g.n && !cur.sizeTrials.some((u) => u.gi === g.id && u.n === n));
  };
  const selOpen = lab.classes[L.classOfGroup(lab, selG.id)].opened;
  const autoComplete = {
    label: t('manipulation.autoComplete.tryAll'),
    ready: selOpen,
    remaining: untriedN().length,
    intervalMs: 480,
    maxTicks: 80,
    step: () => {
      const n = untriedN()[0];
      const gi = (labRef.current.groups[sel] ?? labRef.current.groups[0]).id;
      if (n === undefined) return;
      labRef.current = L.setSize(labRef.current, gi, n);
      setLab((x) => L.setSize(x, gi, n));
    },
    finish: () => {
      const gi = (labRef.current.groups[sel] ?? labRef.current.groups[0]).id;
      // deux passes : la taille de départ (le n courant, exclu d'abord) est visitée une fois qu'on l'a quittée
      const first = untriedN();
      if (first.length === 0) return;
      const run = (st, list) => list.reduce((acc, n) => L.setSize(acc, gi, n), st);
      const mid = run(labRef.current, first);
      labRef.current = mid;
      const second = untriedN();
      labRef.current = run(mid, second);
      setLab((x) => run(run(x, first), second));
    },
  };

  /* ── le verdict ── */
  const last = lab.last;
  const verdict = last && (() => {
    const cls = cName(last.ci);
    switch (last.kind) {
      case 'betFirst': return <span className="text-amber-800">{k('vBetFirst', { cls })}</span>;
      case 'betLocked': return <span className="text-amber-800">{k('vBetLocked')}</span>;
      case 'bet': return <span className="text-slate-800"><MathText>{k('vBet', { cls, bet: L.betTex(lab, last.k) })}</MathText></span>;
      case 'alreadyOpen': return <span className="text-slate-700">{k('vAlreadyOpen')}</span>;
      case 'refilled': return <span className="text-slate-700">{k('vRefilled')}</span>;
      case 'sizeFirst': return <span className="text-amber-800">{k('vSizeFirst')}</span>;
      case 'opened': {
        const tr = lab.trials.at(-1);
        const o = { cls, level: L.levelTex(lab, last.ci), bet: L.betTex(lab, tr.bet) };
        if (tr.kind === 'ok') return <span className="text-emerald-800"><MathText>{k('vOk', o)}</MathText></span>;
        if (tr.kind === 'meanOfMeans') return <span className="text-rose-800" data-gt-refused="meanOfMeans"><MathText>{k('vMeanOfMeans', o)}</MathText></span>;
        return <span className="text-rose-800" data-gt-refused={tr.kind}><MathText>{k(tr.kind === 'high' ? 'vHigh' : 'vLow', o)}</MathText></span>;
      }
      case 'size': {
        const tr = lab.sizeTrials.at(-1);
        return <span className="text-slate-900"><MathText>{k(tr.equal ? 'vSizeEqual' : 'vSize', { name: gName(last.gi), n: last.n, level: L.levelTex(lab, last.ci) })}</MathText></span>;
      }
      default: return null;
    }
  })();

  /* ── la découverte : des distracteurs réfutés par l'eau de l'élève ── */
  const discoveryOptions = useMemo(() => discoveryOptionsOf(lab, k, many, cName), [lab, k]); // eslint-disable-line react-hooks/exhaustive-deps

  const formal = <Formal lab={lab} k={k} many={many} cName={cName} />;

  const missionText = mission ?? k(many ? 'missionMany' : 'missionOne', {
    groups: lab.groups.map((g) => k('groupLine', { name: gName(g.id), n: g.n0, m: L.dec(g.m) })).join('، '),
  });

  /* ── la ligne d'effectif (commune), puis le verdict ── */
  const sizeRow = (
    <div className="flex flex-wrap items-center gap-1.5" data-gt-size-row>
      <span className={`text-xs font-bold ${narrow ? 'w-full' : ''} ${selOpen ? 'text-slate-700' : 'text-slate-500'}`}>
        {selOpen || narrow ? k('sizeTitle', { name: gName(selG.id) }) : k('sizeLocked')}
      </span>
      <div dir="ltr" className="flex items-center gap-1.5">
        <button type="button" onClick={() => size(selG.id, selG.n - 1)} aria-label={k('sizeLess', { name: gName(selG.id) })} data-gt-size-less
          disabled={selOpen && selG.n <= L.N_MIN}
          className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><Minus className="h-4 w-4" aria-hidden="true" /></button>
        <span className="min-w-[2.5rem] rounded-full bg-sky-100 px-2 text-center font-mono text-sm font-extrabold text-sky-900" data-gt-size-value={selG.n}>{selG.n}</span>
        <button type="button" onClick={() => size(selG.id, selG.n + 1)} aria-label={k('sizeMore', { name: gName(selG.id) })} data-gt-size-more
          disabled={selOpen && selG.n >= L.nMax(selG)}
          className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><Plus className="h-4 w-4" aria-hidden="true" /></button>
      </div>
      <Deco world={world} />
    </div>
  );

  // deux étapes lisibles : chacune est FAITE quand ses questions sont répondues ; on fête chacune une fois (réarmées après « إعادة »)
  const stepDone = [cpActive ? done1 : lab.trials.length > 0, cpActive ? done1 && cp.done : solved];
  const stepper = <LabStepper count={2} current={stepDone[0] ? 1 : 0} done={stepDone} stepAttr="data-gt-step" />;
  const party = useStepCelebration();
  const celebrated = useRef({ inits, set: new Set() });
  if (celebrated.current.inits !== inits) celebrated.current = { inits, set: new Set() };
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.set.has(i)) return;
      celebrated.current.set.add(i);
      party.celebrate({ n: i + 1, total: 2 });
    });
  }, [stepDone[0], stepDone[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  const bothOpen = many && lab.classes.every((c) => c.opened);
  const same = bothOpen && L.sameLevels(lab);

  return (
    <ManipulationShell
      type="group-tanks"
      title={title ?? k('title')}
      mission={missionText}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      guided={cpActive}
      hints={(many ? ['hint1Many', 'hint2Many', 'hint3Many'] : ['hint1One', 'hint2One', 'hint3One']).map((h) => <MathText key={h}>{k(h)}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false, autoComplete }}
      discovery={(
        <ManipulationDiscovery
          state={state}
          prompt={k(many ? 'dPromptMany' : 'dPromptOne')}
          options={discoveryOptions}
          formal={formal}
        />
      )}
      explanation={<MathText>{k(many ? 'explanationMany' : 'explanationOne')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/70 to-white">
        <div ref={boxRef} className="space-y-2" data-group-tanks data-classes={lab.classes.length} data-world={world}
          data-step={lab.classes.every((c) => c.opened) ? 'opened' : lab.classes.some((c) => c.bet != null) ? 'bet' : 'start'}
          data-solved={solved ? 'true' : 'false'} data-tank-h={tankH} data-layout={narrow ? 'narrow' : 'wide'}>
          <div className="relative">
          {party.node}
          {cp.node}
          <div ref={glanceRef} className="space-y-2" data-gt-glance>
            {stepper}
            <div className="relative flex items-start justify-center gap-2.5">
              {lab.classes.map((c) => (
                <ClassColumn key={`${c.id}-${state.epoch}`} lab={lab} ci={c.id} width={colW} tankH={tankH} narrow={tight}
                  k={k} cName={cName} gName={gName} who={W.who ?? ''} sel={sel} onSelect={setSel}
                  onBet={bet} onOpen={open} onRefill={refill} />
              ))}
            </div>
            {same && (
              <p className="text-center text-sm font-extrabold text-emerald-800" data-gt-same>
                {k('sameLevel')} {!narrow && <bdi dir="ltr"><MathText>{`$${L.levelTex(lab, 0)}$`}</MathText></bdi>}
              </p>
            )}
            <div className="space-y-1.5">
              {sizeRow}
              <p role="status" className={`min-h-[2.5rem] ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug`} data-gt-verdict={last?.kind === 'opened' ? lab.trials.at(-1)?.kind : (last?.kind ?? '')}>{verdict}</p>
            </div>
          </div>
          </div>

          {lab.trials.length > 0 && (
            <LabFold id="group-tanks.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-gt-trials={lab.trials.length}>
                {lab.trials.map((tr, i) => (
                  <li key={i} className={tr.ok ? 'text-emerald-800' : 'text-rose-800'} data-ok={String(tr.ok)}>
                    <MathText>{k('trialRow', { cls: cName(tr.ci), bet: L.betTex(lab, tr.bet), level: `${ST.approx(tr.level, 2).replace(',', '{,}')}` })}</MathText>
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

/* ── une colonne de classe : les réservoirs des groupes, la vanne, le réservoir de la classe ── */
function ClassColumn({ lab, ci, width, tankH, narrow, k, cName, gName, who, sel, onSelect, onBet, onOpen, onRefill }) {
  const reduce = useReducedMotion();
  const c = lab.classes[ci];
  // marges : graduations à gauche (18 px), poignée du pari à droite (24 px)
  const OX = narrow ? 14 : 18;
  const raw = L.columnGeometry(lab, ci, { width: width - OX - (narrow ? 4 : 24), tankH, gap: narrow ? 4 : 6 });
  const geo = { ...raw, tanks: raw.tanks.map((t) => ({ ...t, x: t.x + OX })), cls: { ...raw.cls, x: raw.cls.x + OX } };
  const lv = L.level(lab, ci);
  const lvY = geo.yOf(lv);
  const [live, setLive] = useState(null);
  const K = live ?? c.bet;
  const toValue = useCallback((_cx, cy, rect) => {
    const y = cy - rect.top;
    return L.kFromY(lab, y, rect.height);
  }, [lab]);
  const st = useStretchInteraction({
    value: K, range: { min: 0, max: lab.kMax }, toValue, direction: 'ltr', pageStep: Math.round(1 / LIN.toNumber(lab.step)),
    onChange: (v) => { if (!c.opened) setLive(v); },
    onCommit: (v) => { setLive(null); onBet(ci, v); },
  });
  const betY = K == null ? null : geo.yOf(L.betValue(lab, K));
  const pipeH = 22;
  const label = cName(ci);
  const groupsTop = 18;
  const H = groupsTop + tankH + pipeH + tankH + 4;
  const ticks = L.gradTicks(lab);
  const fill = c.opened ? 'opened' : 'full';
  const tr = { transition: reduce ? 'none' : 'y 700ms ease-in, height 700ms ease-in' };
  const classTop = groupsTop + tankH + pipeH;

  return (
    <div className="flex flex-col items-stretch gap-1" style={{ width }} data-gt-class={ci} data-opened={c.opened ? 'true' : 'false'} data-level={LIN.fracText(lv)}>
      <h4 className="truncate text-center text-xs font-extrabold text-slate-800">{label}</h4>
      {/* le nom de chaque groupe, au-dessus de son réservoir */}
      <div className="relative h-4" style={{ width }} aria-hidden="true">
        {geo.tanks.map((tk) => (
          <span key={tk.id} className="absolute top-0 truncate text-center text-[10px] font-bold leading-4 text-slate-600" style={{ left: tk.x - 4, width: tk.w + 8 }}>{gName(tk.id)}</span>
        ))}
      </div>
      <div className="relative" style={{ width, height: H }}>
        <svg width={width} height={H} className="absolute inset-0" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
          {/* les réservoirs des groupes (eau = n × m) */}
          {geo.tanks.map((tk) => {
            const g = lab.groups[tk.id];
            const wy = c.opened ? groupsTop + tankH : groupsTop + tk.y;
            return (
              <g key={tk.id}>
                <rect x={tk.x} y={wy} width={tk.w} height={groupsTop + tankH - wy} fill={g.id % 2 ? '#38BDF8' : '#0EA5E9'} opacity={0.85} style={tr} />
                {c.opened && <line x1={tk.x} x2={tk.x + tk.w} y1={groupsTop + tk.y} y2={groupsTop + tk.y} stroke="#0369A1" strokeDasharray="3 3" />}
                <path d={`M${tk.x} ${groupsTop} L${tk.x} ${groupsTop + tankH} L${tk.x + tk.w} ${groupsTop + tankH} L${tk.x + tk.w} ${groupsTop}`} fill="none"
                  stroke={sel === tk.id ? '#4F46E5' : '#334155'} strokeWidth={sel === tk.id ? 3 : 2} />
                <text x={tk.x + tk.w / 2} y={groupsTop + tk.y - 3} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#075985" fontFamily="ui-monospace, monospace">{narrow ? L.dec(g.m) : `m = ${L.dec(g.m)}`}</text>
                <text x={tk.x + tk.w / 2} y={groupsTop + tankH - 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill={c.opened ? '#334155' : '#FFFFFF'} fontFamily="ui-monospace, monospace">{narrow ? g.n : `👥 ${g.n}`}</text>
              </g>
            );
          })}
          {/* le tuyau et la vanne */}
          <rect x={geo.cls.x + geo.cls.w / 2 - 5} y={groupsTop + tankH} width={10} height={pipeH} fill={c.opened ? '#7DD3FC' : '#CBD5E1'} stroke="#64748B" />
          <circle cx={geo.cls.x + geo.cls.w / 2} cy={groupsTop + tankH + pipeH / 2} r={6} fill={c.opened ? '#10B981' : '#F43F5E'} stroke="#334155" />
          {/* le réservoir de la classe (largeur N, même échelle) */}
          <rect x={geo.cls.x} y={c.opened ? classTop + lvY : classTop + tankH} width={geo.cls.w} height={c.opened ? tankH - lvY : 0} fill="#0EA5E9" opacity={0.9} style={tr} data-fill={fill} />
          {c.opened && !reduce && <Bubbles x={geo.cls.x} w={geo.cls.w} top={classTop + lvY} bottom={classTop + tankH} />}
          <path d={`M${geo.cls.x} ${classTop} L${geo.cls.x} ${classTop + tankH} L${geo.cls.x + geo.cls.w} ${classTop + tankH} L${geo.cls.x + geo.cls.w} ${classTop}`} fill="none" stroke="#334155" strokeWidth={2.5} />
          {ticks.map((v) => (
            <g key={v}>
              <line x1={geo.cls.x - 4} x2={geo.cls.x} y1={classTop + geo.yOf(v)} y2={classTop + geo.yOf(v)} stroke="#64748B" />
              {!narrow || v % 10 === 0 ? <text x={geo.cls.x - 6} y={classTop + geo.yOf(v) + 3.5} textAnchor="end" fontSize="9.5" fill="#475569" fontFamily="ui-monospace, monospace">{v}</text> : null}
            </g>
          ))}
          <text x={geo.cls.x + geo.cls.w / 2} y={classTop + tankH - 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill={c.opened ? '#FFFFFF' : '#64748B'} fontFamily="ui-monospace, monospace">{narrow ? L.count(lab, ci) : `👥 ${L.count(lab, ci)}`}</text>
          {/* la ligne du pari */}
          {betY != null && (
            <line x1={geo.cls.x - 2} x2={geo.cls.x + geo.cls.w + 2} y1={classTop + betY} y2={classTop + betY} stroke="#D97706" strokeWidth={2.5} strokeDasharray="7 4" data-gt-bet-line={K} />
          )}
          {c.opened && <line x1={geo.cls.x} x2={geo.cls.x + geo.cls.w} y1={classTop + lvY} y2={classTop + lvY} stroke="#075985" strokeWidth={2} />}
        </svg>
        {/* chaque réservoir de groupe est un bouton : on le choisit pour changer son effectif */}
        {geo.tanks.map((tk) => {
          const g = lab.groups[tk.id];
          return (
            <button key={tk.id} type="button" onClick={() => onSelect(tk.id)} aria-pressed={sel === tk.id} data-gt-tank={tk.id} data-n={g.n}
              aria-label={k('pickGroup', { name: gName(tk.id), n: g.n, who, m: L.dec(g.m) })}
              className="absolute rounded-md focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
              style={{ left: tk.x, top: groupsTop - 14, width: Math.max(tk.w, 24), height: tankH + 14 }}>
              <span className="sr-only">{gName(tk.id)}</span>
            </button>
          );
        })}
        {/* le réservoir de la classe est la PISTE du pari ; le repère 🎯 est la poignée */}
        <div {...st.trackProps} className="absolute" style={{ ...st.trackProps.style, left: geo.cls.x, top: classTop, width: geo.cls.w, height: tankH, cursor: c.opened ? 'default' : st.trackProps.style.cursor }}
          data-gt-track={ci}>
          <div {...st.handleProps({ label: k('betHandle', { cls: label }), valueText: K == null ? k('betNotSet') : L.dec(L.betValue(lab, K)) })}
            data-gt-bet-handle={ci}
            className={`absolute flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${K == null ? 'border-dashed border-amber-400 bg-amber-50/90' : 'border-amber-600 bg-white/90'}`}
            style={{ right: narrow ? -4 : -22, top: betY ?? tankH / 2, cursor: st.dragging ? 'grabbing' : 'grab' }}>
            <span aria-hidden="true" className="text-base">🎯</span>
          </div>
        </div>
      </div>
      {/* la rangée sous le réservoir : pari ▲▼, sa valeur, la vanne */}
      <div className="flex items-center justify-center gap-1" dir="ltr">
        {!narrow && <button type="button" onClick={() => st.set((K ?? Math.round(lab.kMax / 2)) - 1)} aria-label={k('betLess')} data-gt-bet-less={ci} disabled={c.opened}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-amber-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"><ChevronDown className="h-4 w-4" aria-hidden="true" /></button>}
        {!narrow && <button type="button" onClick={() => st.set((K ?? Math.round(lab.kMax / 2)) + 1)} aria-label={k('betMore')} data-gt-bet-more={ci} disabled={c.opened}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-amber-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"><ChevronUp className="h-4 w-4" aria-hidden="true" /></button>}
        {c.opened ? (
          <button type="button" onClick={() => onRefill(ci)} data-gt-refill={ci}
            className="inline-flex h-11 min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 border-slate-300 bg-white px-2 text-xs font-bold text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />{narrow ? <span className="sr-only">{k('refill')}</span> : k('refill')}
          </button>
        ) : (
          <button type="button" onClick={() => { st.flush(); onOpen(ci); }} data-gt-open={ci}
            className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 border-sky-700 bg-sky-700 px-2 text-xs font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
            {narrow ? k('openShort') : k('open')}
          </button>
        )}
      </div>
      {/* la lecture : le pari ; après la vanne, Σ n·m ÷ N */}
      <div className="min-h-[2rem] text-center text-xs font-bold text-slate-800" data-gt-reading={ci}>
        {c.opened ? (
          <bdi dir="ltr" className="block" data-gt-formula={ci}><MathText>{`$${narrow ? `m ${LIN.fracDecimal(lv, 3) == null ? '\\approx' : '='} ${ST.approx(lv, 2).replace(',', '{,}')}` : L.formulaTex(lab, ci)}$`}</MathText></bdi>
        ) : (
          K == null ? <span className="text-slate-500">{narrow ? '🎯 ؟' : k('betNotSet')}</span>
            : narrow ? <bdi dir="ltr"><MathText>{`🎯 $${L.betTex(lab, K)}$`}</MathText></bdi> : <MathText>{k('betValue', { bet: L.betTex(lab, K) })}</MathText>
        )}
      </div>
    </div>
  );
}

/** Des bulles qui montent dans l'eau versée — décor pur, jamais une information. */
function Bubbles({ x, w, top, bottom }) {
  const xs = [0.2, 0.45, 0.7, 0.85];
  return (
    <g aria-hidden="true" data-deco="bubbles">
      <style>{'.gt-b{animation:gt-b 1.6s ease-in 2;opacity:0}@keyframes gt-b{0%{transform:translateY(0);opacity:.8}100%{transform:translateY(-40px);opacity:0}}@media (prefers-reduced-motion: reduce){.gt-b{animation:none}}'}</style>
      {xs.map((f, i) => (
        <circle key={i} className="gt-b" cx={x + f * w} cy={Math.max(top + 6, bottom - 6 - i * 4)} r={2 + (i % 2)} fill="#E0F2FE" style={{ animationDelay: `${i * 0.25}s` }} />
      ))}
    </g>
  );
}

/** Le buzzer de la mesure (quiz) ou la cloche de l'école : il s'allume au toucher. Décor seulement. */
function Deco({ world }) {
  const reduce = useReducedMotion();
  const [taps, setTaps] = useState(0);
  const lit = taps % 2 === 1;
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => setTaps((n) => n + 1)} data-deco={world}
      className="h-9 w-10 shrink-0 rounded-xl focus:outline-none">
      <svg viewBox="0 0 60 50" width="100%" height="100%">
        <style>{'.gt-p{transform-origin:30px 30px;animation:gt-p .4s ease-out 2}@keyframes gt-p{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}@media (prefers-reduced-motion: reduce){.gt-p{animation:none}}'}</style>
        <rect x="8" y="34" width="44" height="12" rx="4" fill="#334155" />
        <g key={taps} className={taps > 0 && !reduce ? 'gt-p' : undefined}>
          <ellipse cx="30" cy="30" rx="16" ry="9" fill={lit ? '#F43F5E' : world === 'quiz' ? '#FB7185' : '#FBBF24'} stroke="#7F1D1D" strokeWidth="1.5" />
        </g>
        {lit && <path d="M12 12 L18 18 M30 4 L30 12 M48 12 L42 18" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />}
      </svg>
    </button>
  );
}

/** Les options de la règle (distracteurs réfutés par l'eau de l'élève) — partagées par la découverte et la dernière question de s2. */
export function discoveryOptionsOf(lab, k, many, cName) {
    if (!many) {
      const gs = lab.groups;
      const big = gs.reduce((a, g) => (g.n0 > a.n0 ? g : a), gs[0]);
      const lv0 = L.levelOf(gs.map((g) => ({ n: g.n0, m: g.m })));
      const lvTex = L.decTex(lv0).length < 8 && LIN.fracDecimal(lv0, 3) != null ? L.decTex(lv0) : `${ST.approx(lv0, 2).replace(',', '{,}')}`;
      const mm = L.decTex(L.meanOfMeansOf(gs));
      return [
        { text: <MathText>{k('dOptMm', { mm })}</MathText>, why: <MathText>{k('dWhyMm', { level: lvTex, mm })}</MathText> },
        { text: k('dOptRightOne'), correct: true },
        { text: k('dOptBig'), why: <MathText>{k('dWhyBig', { level: lvTex, big: L.decTex(big.m) })}</MathText> },
      ];
    }
    const lvTex = L.levelTex(lab, 0);
    if (L.sameLevels(lab)) {
      return [
        { text: k('dOptA'), why: <MathText>{k('dWhyA', { level: lvTex })}</MathText> },
        { text: <MathText>{k('dOptRightMany', { level: lvTex })}</MathText>, correct: true },
        { text: k('dOptB'), why: <MathText>{k('dWhyB', { sum: L.decTex(L.water(lab, 0)), N: L.count(lab, 0) })}</MathText> },
        { text: k('dOptMmMany'), why: <MathText>{k('dWhyMmMany', { mmA: L.decTex(L.meanOfMeans(lab, 0)), mmB: L.decTex(L.meanOfMeans(lab, 1)), level: lvTex })}</MathText> },
      ];
    }
    const best = lab.classes.reduce((a, c) => (LIN.cmp(L.level(lab, c.id), L.level(lab, a)) > 0 ? c.id : a), 0);
    return [
      { text: <MathText>{k('dOptRightManyDiff', { best: cName(best), level: L.levelTex(lab, best) })}</MathText>, correct: true },
      { text: k('dOptMmMany'), why: k('dWhyRightDiff') },
    ];
}

function Formal({ lab, k, many, cName }) {
  return (
    <div className="space-y-2" data-gt-formal>
      {lab.classes.map((c) => (
        <EquationDisplay key={c.id} tone="result" tex={`m = ${L.formulaTex(lab, c.id)}`} note={many ? cName(c.id) : undefined} />
      ))}
      <p className="text-sm text-emerald-900"><MathText>{k(many ? 'fRuleMany' : 'fRuleOne')}</MathText></p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** s1 : après la 1re vanne ; s2 : un effectif changé (une classe) ou chaque classe versée (deux) — la dernière question est la règle. */
export const CHAINS = Object.freeze({
  one: { s1: ['water', 'count', 'how'], s2: ['move', 'rule'] },
  many: { s1: ['water', 'count', 'how'], s2: ['cmp', 'rule'] },
});

const dl = (x) => `$${x}$`;
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;

/** Les faits de l'essai : les effectifs AU MOMENT de l'ouverture (ne bougent plus ensuite). */
function factsOf(lab, tr) {
  const gs = lab.classes[tr.ci].members.map((gi, i) => ({ n: tr.ns[i], m: lab.groups[gi].m }));
  const W = L.waterOf(gs);
  const N = L.countOf(gs);
  const terms = gs.map((g) => `${g.n} \\times ${L.decTex(g.m)}`).join(' + ');
  return { gs, W, N, terms, level: L.levelOf(gs), mm: L.meanOfMeansOf(gs) };
}

/** Chaque question est construite sur LES effectifs et LES niveaux de l'élève (rien en dur) ; `k` : les textes de `groupTanks`. */
export const QUESTIONS = {
  water: (lab, k, ctx) => {
    const f = factsOf(lab, lab.trials[0]);
    const o = { terms: dl(f.terms), cls: ctx.cName(lab.trials[0].ci) };
    return {
      id: 'water', kind: 'number', expected: LIN.fracText(f.W), answer: <MathText>{dl(L.decTex(f.W))}</MathText>,
      prompt: Mx(k, 'water.prompt', o), hints: [Mx(k, 'water.hint1', o), Mx(k, 'water.hint2', o)],
      explain: Mx(k, 'water.explain', { ...o, calc: dl(`${f.terms} = ${L.decTex(f.W)}`) }),
    };
  },
  count: (lab, k, ctx) => {
    const f = factsOf(lab, lab.trials[0]);
    const o = { ns: dl(f.gs.map((g) => g.n).join(' + ')), cls: ctx.cName(lab.trials[0].ci) };
    return {
      id: 'count', kind: 'number', expected: String(f.N), answer: <MathText>{dl(String(f.N))}</MathText>,
      prompt: Mx(k, 'count.prompt', o), hints: [Mx(k, 'count.hint1', o), Mx(k, 'count.hint2', o)],
      explain: Mx(k, 'count.explain', { ...o, calc: dl(`${f.gs.map((g) => g.n).join(' + ')} = ${f.N}`) }),
    };
  },
  how: (lab, k) => {
    const tr = lab.trials[0];
    const f = factsOf(lab, tr);
    const lvl = ST.approx(f.level, 2).replace(',', '{,}');
    const mmTex = L.decTex(f.mm);
    const o = { level: dl(lvl), W: dl(L.decTex(f.W)), N: f.N, g: f.gs.length };
    const perTank = ST.approx(LIN.div(f.W, f.gs.length), 2).replace(',', '{,}');
    const mmDiffers = !LIN.eq(f.mm, f.level);
    const sumM = L.decTex(f.gs.reduce((acc, g) => LIN.add(acc, g.m), LIN.frac(0)));
    return {
      id: 'how', kind: 'choice',
      prompt: Mx(k, 'how.prompt', o),
      options: [
        mmDiffers
          ? { text: Mx(k, 'how.mm', { mm: dl(mmTex) }), why: Mx(k, 'how.whyMm', { ...o, mm: dl(mmTex) }) }
          : { text: Mx(k, 'how.sumM', o), why: Mx(k, 'how.whySumM', { ...o, v: dl(sumM) }) },
        { text: Mx(k, 'how.right', o), correct: true },
        { text: Mx(k, 'how.perTank', o), why: Mx(k, 'how.whyPerTank', { ...o, v: dl(perTank) }) },
      ],
      hints: [Mx(k, 'how.hint1', o), Mx(k, 'how.hint2', o)],
      explain: Mx(k, 'how.explain', { ...o, calc: dl(`\\dfrac{${f.terms}}{${f.gs.map((g) => g.n).join(' + ')}} = ${lvl}`) }),
    };
  },
  move: (lab, k, ctx) => {
    const tr = lab.sizeTrials.at(-1);
    const mem = lab.classes[tr.ci].members;
    const [a, b] = mem.map((gi, i) => ({ gi, n: tr.ns[i] }));
    const name = ctx.gName(tr.gi);
    const o = { name, n: tr.n, a: ctx.gName(a.gi), b: ctx.gName(b.gi), na: a.n, nb: b.n, level: dl(ST.approx(tr.level, 2).replace(',', '{,}')) };
    const wide = a.n === b.n ? 'mid' : a.n > b.n ? 'a' : 'b';
    const mkOpt = (id) => {
      if (id === 'mid') return { text: Mx(k, 'move.mid', o), ...(wide === 'mid' ? { correct: true } : { why: Mx(k, 'move.whyMid', o) }) };
      const nm = id === 'a' ? o.a : o.b;
      return { text: Mx(k, 'move.toward', { name: nm }), ...(wide === id ? { correct: true } : { why: Mx(k, 'move.whyToward', { ...o, wide: wide === 'a' ? o.a : o.b, nw: wide === 'a' ? a.n : b.n }) }) };
    };
    const opts = wide === 'mid' ? ['mid', 'a', 'b'] : ['a', 'mid', 'b'];
    return {
      id: 'move', kind: 'choice',
      prompt: Mx(k, 'move.prompt', o),
      options: opts.map(mkOpt),
      hints: [Mx(k, 'move.hint1', o), Mx(k, 'move.hint2', o)],
      explain: Mx(k, wide === 'mid' ? 'move.explainMid' : 'move.explain', { ...o, wide: wide === 'a' ? o.a : o.b }),
    };
  },
  cmp: (lab, k, ctx) => {
    const tie = L.sameLevels(lab);
    const best = lab.classes.reduce((x, c) => (LIN.cmp(L.level(lab, c.id), L.level(lab, x)) > 0 ? c.id : x), 0);
    const A = ctx.cName(0); const B = ctx.cName(1);
    const o = { A, B, a: dl(L.levelTex(lab, 0)), b: dl(L.levelTex(lab, 1)) };
    const right = tie ? 0 : best === 0 ? 1 : 2;
    const opt = (id, why) => (id === right ? { text: Mx(k, `cmp.${id === 0 ? 'same' : id === 1 ? 'a' : 'b'}`, o), correct: true } : { text: Mx(k, `cmp.${id === 0 ? 'same' : id === 1 ? 'a' : 'b'}`, o), why });
    return {
      id: 'cmp', kind: 'choice',
      prompt: Mx(k, 'cmp.prompt', o),
      options: [opt(1, Mx(k, 'cmp.whyA', o)), opt(0, Mx(k, 'cmp.whySame', o)), opt(2, Mx(k, 'cmp.whyB', o))],
      hints: [Mx(k, 'cmp.hint1', o), Mx(k, 'cmp.hint2', o)],
      explain: Mx(k, tie ? 'cmp.explainSame' : 'cmp.explainDiff', { ...o, best: ctx.cName(best) }),
    };
  },
  rule: (lab, k, ctx) => ({
    id: 'rule', kind: 'choice',
    prompt: <MathText>{k(ctx.many ? 'dPromptMany' : 'dPromptOne')}</MathText>,
    options: discoveryOptionsOf(lab, k, ctx.many, ctx.cName),
    hints: [Mx(k, ctx.many ? 'rule.hint1Many' : 'rule.hint1One'), Mx(k, 'rule.hint2')],
    explain: <Formal lab={lab} k={k} many={ctx.many} cName={ctx.cName} />,
  }),
};
