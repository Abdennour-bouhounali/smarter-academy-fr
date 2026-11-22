import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { PromptCard } from '../primitives/LabKit';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { mulTerms, reduce } from '@smarter-academy/core/arithmetic/polynomials.js';
import { termsTex } from '@smarter-academy/core/arithmetic/expansion.js';
import KidFigure from '../primitives/KidFigure';
import MathText from '../../components/MathText';
import { LEVELS } from '../levels';
import * as L from '../logic/areaSplit';
import PlotScene, { PatchCards } from './areaSplit/PlotScene';
import ArrowsScene, { ProductCards } from './areaSplit/ArrowsScene';
import LineRow, { ReduceBlock, showReduce } from './areaSplit/LineRow';
import SidePanel from './areaSplit/SidePanel';
import { fitUnit as fitPlotUnit } from './areaSplit/plotLayout';
import { num } from './areaSplit/format';

export { bannerOf, iso, num, tex, plain } from './areaSplit/format';

/**
 * area-split — « أرض الحديقة » : LA COUPURE SOUS LA MAIN (3AM, unité 4 « الحساب الحرفي », درس « نشر عبارات جبرية », 2026-10-21).
 * Logique : `logic/areaSplit.js` (sur `core/arithmetic/expansion.js`, importé par chemin). Dessin : `areaSplit/`.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. Un TERRAIN du jardin de l'école vu d'en haut (thème `schoolgarden`), dont les deux côtés sont les facteurs (k, x + 4, x − 3…).
 *    La main porte la POIGNÉE de coupure le long d'un bord (glisser, toucher-toucher, clavier) ; puis, sur chaque parcelle, elle DÉCIDE
 *    « تُضاف » / « تُطرح » (l'allée dallée s'ôte, le COIN ôté deux fois se rend). Elle règle aussi x (4…9) : le terrain se redessine.
 *    Monde `arrows` : l'expression est écrite ; la main TRACE la flèche de chaque terme du 1er facteur vers chaque terme de l'autre
 *    parenthèse et décide le signe de chaque produit partiel.
 * B. L'aire d'un rectangle se compte DEUX fois — le produit de ses côtés et la somme des aires de ses parties — donc
 *    k(a + b) = ka + kb et (a + b)(c + d) = ac + ad + bc + bd ; une bande ôtée est une aire retranchée, et quand deux bandes se
 *    croisent le coin est retranché deux fois, on le rend ((−)×(−) = +) ; chaque terme du 1er facteur multiplie CHAQUE terme du 2e.
 * C. Une coupure ailleurs qu'au bord d'un terme revient avec les deux longueurs NUMÉRIQUES qu'elle fait ; un signe faux est refusé avec
 *    l'aire comptée du terrain et la somme écrite ; une flèche dans sa propre parenthèse ou répétée est refusée ; deux compteurs
 *    (l'aire / la somme des parties — ou l'expression / les produits décidés) bougent ensemble quand la main change x.
 * D. L'expansion (`expandedTex`) puis la forme réduite (`resultTex`), la règle formelle avec SES lignes.
 * E. « كم مرّة نُحصي مساحة الأرض ؟ » (plot) · « ماذا يحدث لكل حدّ في القوس الأول ؟ » (arrows) — les fausses conjectures réfutées par
 *    SES nombres (ses compteurs à deux x ; la valeur à x de la lecture fausse).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        distributivité par l'aire ; k(a + b), (a + b)(c + d) ; une aire ôtée ; le coin rendu ; la valeur ne change jamais
 *   OBJECT         un terrain de jardin (pelouse, massif, allée dallée, haie), une poignée de coupure, des cartes de parcelle ; des flèches
 *   VARIABLE       la position de la coupure ; le signe de chaque parcelle ; x (4…9) ; le coefficient de chaque puissance (متقدم)
 *   INVARIANT      l'aire comptée du terrain = la somme des aires des parties, à tout x
 *   TRANSFORMATION le côté se coupe en termes ; chaque parcelle s'ajoute ou s'ôte ; les parcelles semblables se réunissent
 *   CONSTRAINT     une coupure hors du bord d'un terme revient ; un signe qui fausserait l'aire est refusé
 *   RESISTANCE     cut (deux longueurs numériques) · sign (deux aires) · coef (deux valeurs) · arrow (arrow répétée / dans sa parenthèse)
 *   EVIDENCE       les deux compteurs, les badges (numéro puis signe), les hachures de l'allée, le coin qui redevient pelouse, la ligne écrite
 *   CONTRAST       un massif (+) / une allée (−) ; le coin (+) à côté de deux bandes (−) ; une flèche juste / répétée
 *   PREDICTION     متقدم : plus d'accolades ni d'aires écrites ; la main écrit le coefficient de chaque puissance avant « تحقّق »
 *   DISCOVERY      les deux questions de E, options réfutables
 *   FORMALIZATION  k(a+b) = ka+kb · (a+b)(c+d) = ac+ad+bc+bd · كل حدّ يضرب كل حدّ · (−)(−) = + · القيمة لا تتغيّر
 *   TRANSFER       le module de la طريقة (monde arrows), les exercices, la leçon suivante (تحليل / متطابقات)
 *
 * « جرّب كل الإمكانيات » : NON (§6bis — chaque geste EST une réponse : une coupure, un signe, une flèche, un coefficient).
 * « جرّب أعدادك » : TOUJOURS OUVERT (`[data-as-free]`) : deux côtés m·x + n (plot) / deux facteurs a·x + b (arrows), la même mécanique.
 *
 * D'UN SEUL REGARD (§8bis) : `[data-as-glance]` enveloppe la consigne, la scène, les cartes et le panneau. L'unité `u` du terrain est budgétée
 * sur `useLessonViewport` (cadre calculé à x = 9, pour que rien ne saute quand la main change x). ≥ 660 px de large : le panneau est À CÔTÉ
 * de la scène ; en dessous (colonne de leçon étroite, barre latérale ouverte), il passe DESSOUS. Tablette et ordinateur seulement.
 *
 * ONBOARDING : `logic/areaSplit.js › coachOf` (plot : cut · cutMore · sign · signMore · x · coef · check · next ; arrows : arrow ·
 * arrowMore · productSign · x · coef · check · next).
 *
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 1, 2026-10-28) : `checkpoints` (défaut true). Après CHAQUE
 * tâche, une suite de questions sur ce que l'élève vient de FAIRE se pose par-dessus le labo et retient « التالي » (`chainOf`) : une question
 * sur SON geste (les deux aires égales · la parcelle retirée · le coin rendu · le nombre de parcelles / de flèches · le signe d'un produit
 * de deux négatifs), puis « quelle est la forme développée ? » (les mauvaises options sont les erreurs réelles : un seul terme multiplié, le
 * signe oublié, les seuls extrêmes). La dernière tâche finit par LA RÈGLE (l'ancienne découverte, qui formalise). Obligatoires pour tout
 * élève ; l'enseignant seul les coupe pour SON compte. ÉTAPES `LabStepper` (`[data-as-step=<i>]`) + fête ; « إعادة » repart de la tâche 1 ;
 * « أعِد التجربة » remet LA MÊME tâche (`L.retryTask`). SON : `tooth` (couper, bouger x, une flèche), `bell` (une parcelle / un produit
 * décidé juste), `flag` (tâche faite), `over` (refus).
 * Props (contrat fixé avec la leçon) : `world` ('plot' | 'arrows'), `tasks` (plot : [{ id, h: {m,n}, w: {m,n} }] ; arrows : [{ id, expr:
 * { products: [{ sign, f1, f2 }] } }]), `level`, `levels` (forcé à false pour arrows), `coach`, `lead` (REMPLACE la phrase de contexte du
 * niveau écrit), `onTrial(événement)` (par `state.report`), `onFinished({ world })`.
 *
 * CONTRAT DOM : [data-area-split][data-world][data-task][data-solved], [data-as-glance], [data-as-cut=h|w][data-at] (poignée),
 * [data-as-patch=<id>][data-sign][data-corner] + [data-as-sign=plus|minus], [data-as-x] + [data-as-x-less] / [data-as-x-more],
 * [data-as-meter=whole|parts], [data-as-line], [data-as-coef=<p>] + [data-as-check], [data-as-origin=<i>], [data-as-target=<j>],
 * [data-as-arrow], [data-as-product=<oi>><tj>][data-sign], [data-as-refused=<reason>], [data-as-banner], [data-as-next], [data-as-free],
 * [data-as-formal].
 */
const NS = 'manipulation.areaSplit';
const MAX_W = 1080;
const MOTION_CSS = '@keyframes as-pop{from{opacity:.2;transform:scale(.88)}to{opacity:1;transform:scale(1)}}'
  + '@keyframes as-fade{0%{opacity:0}12%{opacity:1}80%{opacity:1}100%{opacity:0}}'
  + '@keyframes as-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}45%{transform:translateX(5px)}70%{transform:translateX(-3px)}}'
  + '.as-pop{animation:as-pop .28s ease-out both}.as-fade{animation:as-fade 2.2s ease-out both}.as-shake{animation:as-shake .4s ease-in-out}'
  + '.as-knob:focus-visible .as-knob-disc{stroke:#4F46E5;stroke-width:4}'
  + '@keyframes as-ring{0%,100%{box-shadow:0 0 0 3px rgba(99,102,241,.9),0 0 0 8px rgba(99,102,241,.15)}50%{box-shadow:0 0 0 3px rgba(99,102,241,.9),0 0 0 12px rgba(99,102,241,.28)}}'
  + '[data-as-coach]:not(g){border-radius:14px;animation:as-ring 1.4s ease-in-out infinite}[data-as-coach] .as-knob-disc{stroke:#4F46E5;stroke-width:5}'
  + '[data-as-coach] .as-knob-disc{filter:drop-shadow(0 0 7px rgba(99,102,241,.95))}'
  + 'section:has([data-area-split]) [data-lab-coach-ring]{display:none}'
  + '@media (prefers-reduced-motion:reduce){.as-pop,.as-fade,.as-shake,[data-as-coach]{animation:none}.as-fade{opacity:1}}';

/** Les nombres de la manipulation : la tâche de la leçon, ou le préréglage du niveau (même objet : `levelMatching` compare par référence). */
export function numbersFor({ world, tasks, level }) {
  if (world === 'arrows') return { world: 'arrows', tasks: L.tasksFor('arrows', tasks) };
  if (Array.isArray(tasks) && tasks.length) return { world: 'plot', tasks };
  return LEVELS['area-split'][resolveLevelId(level ?? 'beginner')].numbers;
}

const figure0 = (side, sceneW) => side && sceneW >= 560;

/** La hauteur MESURÉE d'un bloc (le budget du terrain se calcule sur ce que le reste de la scène occupe vraiment). */
function useHeight(init) {
  const [el, setEl] = useState(null);
  const [h, setH] = useState(init);
  useLayoutEffect(() => {
    if (!el) return undefined;
    const measure = () => setH(Math.round(el.getBoundingClientRect().height));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  return [setEl, h];
}

function Hana({ mood }) {
  return (
    <svg width="64" height="104" viewBox="0 0 64 104" className="shrink-0" aria-hidden="true" data-as-hana={mood}>
      <KidFigure cx={32} top={3} foot={102} hairStyle="hijab" scarf="lavender" outfit="teal" skin="wheat" mood={mood} />
    </svg>
  );
}

export default function AreaSplit({
  world, tasks, title, lead, level, levels: withLevelsProp = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const withLevels = world === 'arrows' ? false : withLevelsProp;
  const initialNumbers = useMemo(() => numbersFor({ world, tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'area-split', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const scaffold = nums.world === 'arrows' ? false : state.level !== 'advanced';
  const numsKey = `${JSON.stringify(nums)}|${scaffold}`;
  const fresh = () => L.init({ world: nums.world, tasks: nums.tasks, scaffold });
  const [lab, setLab] = useState(fresh);
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch || scene.rc !== state.resetCount) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(fresh());
  }
  const ready = L.discoveryReady(lab);
  // les questions pendant le labo : la suite de la tâche courante ; celle qui finit par la règle remplace la découverte automatique
  const cpSettings = useLabCheckpointSettings('area-split');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpLive = cpOn && cpSettings.enabled;
  const chain = cpLive && !lab.custom ? chainOf(lab, lab.ti) : null;
  const ruleByCheckpoint = cpLive;
  const cpTask = lab.tasks[lab.ti];
  const cp = useLabCheckpoint({
    id: chain ? cpTask.id : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, cpTask, k)) : null,
    reached: !lab.custom && !!lab.done[lab.ti],
    resetKey: scene.inits,
    onRetry: () => setLab(L.retryTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: () => { if (chain?.includes('rule')) { state.discover(); state.formalize(); } },
  });
  useEffect(() => { if (ready && !ruleByCheckpoint) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son du geste (muet sans « الصوت ») : couper, bouger x, une flèche ; une décision juste ; la tâche faite ; un refus
  const heard = useRef({ n: lab.events.length, at: 0 });
  useEffect(() => {
    const h = heard.current;
    if (lab.events.length < h.n) h.n = 0;
    const fresh2 = lab.events.slice(h.n);
    h.n = lab.events.length;
    if (!fresh2.length) return;
    const kinds = fresh2.map((e) => e.kind);
    if (kinds.includes('solved')) playSfx('flag');
    else if (kinds.includes('refused')) playSfx('over');
    else if (fresh2.some((e) => (e.kind === 'patch' || e.kind === 'product') && e.ok)) playSfx('bell');
    else if (kinds.some((x) => x === 'cut' || x === 'x' || x === 'arrow')) {
      const now = Date.now();
      if (now - h.at > 35) { playSfx('tooth'); h.at = now; }
    }
  }, [lab.events]);
  // une étape est FAITE quand la tâche est résolue ET que ses questions (LabCheckpoint) sont répondues : la pastille passe au vert et on fête
  const stepDone = lab.done.map((d, i) => !!d && (i !== lab.ti || lab.custom || !cp.blocking));
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.events.length === 0 && celebrated.current.size) celebrated.current = new Set();   // L.init (« إعادة », autre niveau) : on refête
  const nowDone = !lab.custom && stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.done.filter(Boolean).length, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps
  const reported = useRef(0);
  const nEv = lab.events.length;
  useEffect(() => {
    if (nEv < reported.current) reported.current = 0;
    for (let i = reported.current; i < nEv; i += 1) state.report(onTrial, lab.events[i]);
    reported.current = nEv;
  }, [nEv, lab.events]); // eslint-disable-line react-hooks/exhaustive-deps

  const ownStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  // La bulle ne couvre JAMAIS le terrain, la ligne écrite ni les cartes : elle s'ancre sur la bannière (sous la scène), TOUJOURS dessous
  // (`noFlip`) ; l'objet à toucher porte lui-même son anneau (`data-as-coach`, ci-dessous). La poignée gauche (`cutMore`) n'a pas de texte.
  const coachStep = ownStep ? { ...ownStep, target: '[data-as-banner]', prefer: 'below', noFlip: true } : null;
  const coach = useLabCoach({
    lab: 'area-split', step: coachStep,
    text: ownStep && ownStep.id !== 'cutMore' ? k(`coach.${ownStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });
  const ringTarget = coach.visible && ownStep ? ownStep.target : null;
  useEffect(() => {
    const root = document.querySelector('[data-area-split]');
    const el = ringTarget && root ? root.querySelector(ringTarget) : null;
    if (!el) return undefined;
    el.setAttribute('data-as-coach', '');
    return () => el.removeAttribute('data-as-coach');
  });

  /* ── mesures : la largeur du labo, la hauteur de l'écran de la leçon ── */
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
  const side = width >= 660;
  const sideW = side ? 272 : 0;
  const sceneW = side ? width - sideW - 12 : width;
  const plot = lab.world === 'plot';
  const [promptRef, promptH] = useHeight(130);
  const [bottomRef, bottomH] = useHeight(92);
  const [lineRef, lineH] = useHeight(48);
  const [panelRef, panelH] = useHeight(side ? 0 : 280);
  // le terrain prend ce que le reste de la scène laisse dans la hauteur de l'écran de la leçon (la consigne, les cartes, la ligne, le panneau s'ils sont dessous)
  const restH = promptH + bottomH + lineH + (side ? 0 : panelH) + (side ? 34 : 44) + 16;
  const u = plot
    ? fitPlotUnit({ h: lab.h, w: lab.w, scaffold: lab.scaffold, width: sceneW - (figure0(side, sceneW) ? 96 : 0) - 26, height: screenH - 20 - restH })
    : 0;

  /* ── un essai refusé : la coupure refusée reste visible un instant ── */
  const [ghost, setGhost] = useState(null);
  useEffect(() => {
    const last = lab.last;
    if (last?.event === 'refused' && last.reason === 'cut') {
      setGhost({ side: last.side, at: last.at, a: last.a, b: last.b, n: nEv });
      const tm = setTimeout(() => setGhost(null), 2200);
      return () => clearTimeout(tm);
    }
    setGhost(null);
    return undefined;
  }, [nEv]); // eslint-disable-line react-hooks/exhaustive-deps
  const [hot, setHot] = useState(null);

  const task = L.taskOf(lab);
  const context = lab.custom ? k(`context.custom.${lab.world}`) : (state.isAuthoredLevel && lead) || k(`context.${lab.world}`);
  const question = k(`question.${lab.custom ? `custom.${lab.world}` : lab.world === 'arrows' ? 'arrows' : lab.scaffold ? 'beginner' : 'advanced'}`);
  const prompt = (
    <PromptCard size={side && width >= 900 ? 'lg' : 'md'} className={screenH < 820 ? '!space-y-1 !p-3' : undefined}
      context={context} contextProps={{ 'data-as-context': task }}
      title={question} titleClassName={!side || width < 900 ? (screenH < 820 ? 'text-[15px]' : 'text-lg') : screenH < 820 ? 'text-lg' : 'text-xl'}
      lamp={lab.solvedNow ? 'on' : 'off'} titleProps={{ 'data-as-question': task, 'data-lit': lab.solvedNow ? 'true' : 'false' }}
      aside={lab.tasks.length > 1 ? <LabStepper count={lab.tasks.length} current={lab.custom ? -1 : lab.ti} done={stepDone} stepAttr="data-as-step" /> : undefined} />
  );
  const mood = lab.solvedNow ? 'proud' : lab.last?.event === 'refused' ? 'wonder' : 'happy';
  const figure = plot && figure0(side, sceneW);

  const sceneEl = plot ? (
    <div className="relative flex items-end justify-center gap-3 rounded-2xl bg-[#F3EEDA] p-2" data-as-yard>
      <div className={ghost ? 'as-shake' : undefined} key={ghost ? `g${ghost.n}` : 'n'}>
        <PlotScene lab={lab} setLab={setLab} k={k} u={u} hot={hot} ghost={ghost} showArea={lab.scaffold} compact={!side} />
      </div>
      {figure && <Hana mood={mood} />}
    </div>
  ) : (
    <div className="relative">
      <ArrowsScene lab={lab} setLab={setLab} k={k} width={sceneW} side={side} screenH={screenH} mood={mood} />
    </div>
  );
  const bottomPlot = showReduce(lab) ? <ReduceBlock lab={lab} setLab={setLab} k={k} /> : null;
  const cardsEl = bottomPlot ?? (plot
    ? <PatchCards lab={lab} setLab={setLab} k={k} setHot={setHot} compact={!side} tight={lab.patches.length >= 4 && sceneW < 520} />
    : <ProductCards lab={lab} setLab={setLab} k={k} />);
  const lineEl = <div ref={lineRef}><LineRow lab={lab} short={!side} /></div>;
  const panel = <div ref={panelRef} className={side ? 'shrink-0' : undefined}><SidePanel lab={lab} setLab={setLab} k={k} side={side} width={sideW} coachVisible={coach.visible} mood={mood} fold={!side && screenH < 820} blocking={cp.blocking} /></div>;

  const discovery = (
    <ManipulationDiscovery state={state}
      prompt={<MathText>{k(lab.world === 'arrows' ? 'discovery.arrows.prompt' : 'discovery.plot.prompt')}</MathText>}
      options={discoveryOptions(lab, k)} formal={<Formal lab={lab} k={k} />}
      onFormalized={() => state.report(onFinished, { world: lab.world })} />
  );

  const hintsKey = lab.world === 'arrows' ? 'arrows' : lab.scaffold ? 'beginner' : 'advanced';
  return (
    <ManipulationShell type="area-split" title={title ?? k('title')} titleHidden state={state} allowModeSwitch={allowModeSwitch} allowFreeLab={false}
      coach={coachOn ? coach : null} headerAction={cpSettings.control} guided={!!chain || ruleByCheckpoint} hints={[0, 1, 2].map((i) => k(`hints.${hintsKey}.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }} discovery={discovery} explanation={<MathText>{k('explanation')}</MathText>}>
      <ManipulationStage className="bg-gradient-to-b from-emerald-50/50 to-white">
        <div ref={boxRef} data-area-split data-world={lab.world} data-task={task} data-solved={lab.solvedNow ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: MOTION_CSS }} />
          <div className="relative mx-auto space-y-2" style={{ maxWidth: MAX_W }} data-as-glance data-as-budget={`${screenH}|${promptH}|${bottomH}|${lineH}|${panelH}|${u}`}>
            {party.node}
            {cp.node}
            <div ref={promptRef}>{prompt}</div>
            {side ? (
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1 space-y-2">{sceneEl}<div ref={bottomRef}>{cardsEl}</div>{lineEl}</div>
                {panel}
              </div>
            ) : (
              <div className="space-y-1.5">{sceneEl}<div ref={bottomRef}>{cardsEl}</div>{lineEl}{panel}</div>
            )}
          </div>
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

export function discoveryOptions(lab, k) {
  const M = (s) => <MathText>{s}</MathText>;
  if (lab.world === 'arrows') {
    const w = L.arrowWitness(lab);
    return [
      { text: M(k('discovery.arrows.first')), why: M(k('discovery.arrows.whyFirst', { expr: w.tex, x: w.first.x, w: num(w.first.wrong), r: num(w.first.right) })) },
      { text: M(k('discovery.arrows.right')), correct: true },
      { text: M(k('discovery.arrows.added')), why: M(k('discovery.arrows.whyAdded', { expr: w.tex, x: w.added.x, w: num(w.added.wrong), r: num(w.added.right) })) },
    ];
  }
  const w = L.plotWitness(lab);
  return [
    { text: M(k('discovery.plot.bigger')), why: M(k('discovery.plot.whyBigger', { x: w.a.x, whole: num(w.a.whole), parts: num(w.a.parts) })) },
    { text: M(k('discovery.plot.right')), correct: true },
    { text: M(k('discovery.plot.once')), why: M(k('discovery.plot.whyOnce', { x1: w.a.x, a: num(w.a.whole), x2: w.b.x, b: num(w.b.whole) })) },
  ];
}

/** Une ligne de la règle : la phrase (arabe), puis la ou les égalités de l'élève, chacune dans son îlot LTR (jamais collées au texte). */
function Rule({ label, lines, rule, plain = false }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${plain ? '' : 'rounded-2xl border border-emerald-200 bg-white/80 px-3 py-2'}`} data-as-rule={rule}>
      <span><MathText>{label}</MathText></span>
      {lines.map((l) => (
        <bdi key={l} dir="ltr" className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[15px] ring-1 ring-emerald-200"><MathText>{`$${l}$`}</MathText></bdi>
      ))}
    </div>
  );
}

export function Formal({ lab, k }) {
  const f = L.formalLines(lab);
  const last = f.lines[f.lines.length - 1];
  const value = f.witness && last && (
    <div className="text-xs text-slate-700"><Rule plain rule="value" label={k('formal.value', { x: f.witness.a.x })} lines={[`${f.witness.tex} = ${f.witness.a.whole}`, `${last.result} = ${f.witness.a.parts}`]} /></div>
  );
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-as-formal={lab.world}>
      {lab.world === 'plot' && <Rule rule="area" label={k('formal.area')} lines={[]} />}
      <Rule rule="k" label={k('formal.k')} lines={['k(a+b)=ka+kb']} />
      <Rule rule="kk" label={k('formal.kk')} lines={['(a+b)(c+d)=ac+ad+bc+bd']} />
      <Rule rule="each" label={k('formal.each')} lines={[]} />
      {lab.world === 'plot' && f.corner && <Rule rule="corner" label={k('formal.corner')} lines={['(-a)(-b)=+ab']} />}
      <Rule plain rule="lines" label={k('formal.lines')} lines={f.lines.map((l) => `${l.tex} = ${l.expanded} = ${l.result}`)} />
      {value}
    </div>
  );
}


/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

const sideTerms = (sd) => [sd.m ? { c: sd.m, p: 1 } : null, sd.n ? { c: sd.n, p: 0 } : null].filter(Boolean);
/** Les produits d'une tâche, sous la même forme dans les deux mondes : [{ sign, f1, f2 }]. */
export const productsOf = (tk) => (tk.expr ? tk.expr.products : [{ sign: 1, f1: sideTerms(tk.h), f2: sideTerms(tk.w) }]);
const negPair = (pr) => pr.sign > 0 && pr.f1.some((a) => a.c < 0) && pr.f2.some((b) => b.c < 0);

/** La question sur le GESTE de la tâche (selon ce que la main a fait), puis la forme développée ; la dernière tâche finit par la règle. */
export function chainOf(lab, i) {
  const tk = lab.tasks[i];
  if (!tk) return [];
  const prs = productsOf(tk);
  let first;
  if (tk.expr) first = prs.some(negPair) ? 'negSign' : 'arrows';
  else if (tk.h.n < 0 && tk.w.n < 0 && tk.h.m && tk.w.m) first = 'corner';
  else if (tk.h.n < 0 || tk.w.n < 0) first = 'minus';
  else if (tk.h.m && tk.w.m) first = 'count';
  else first = 'value';
  const base = [first, 'expand'];
  return i === lab.tasks.length - 1 ? [...base, 'rule'] : base;
}

const mul = (sg, a, b) => { const t = mulTerms(a, b); return { c: sg * t.c, p: t.p }; };
/** La forme développée juste, et les deux erreurs RÉELLES de la distributivité. */
export function expandOptions(tk) {
  const prs = productsOf(tk);
  const right = reduce(prs.flatMap((pr) => pr.f1.flatMap((a) => pr.f2.map((b) => mul(pr.sign, a, b)))));
  // A : seul le premier terme du 2e facteur est multiplié, le reste recopié
  const onlyFirst = reduce(prs.flatMap((pr) => [...pr.f1.map((a) => mul(pr.sign, a, pr.f2[0])), ...pr.f2.slice(1).map((b) => ({ c: pr.sign * b.c, p: b.p }))]));
  // B : le signe devant un produit oublié ; sinon (−)(−) compté négatif ; sinon les seuls extrêmes
  let other;
  if (prs.some((pr) => pr.sign < 0)) other = reduce(prs.flatMap((pr) => pr.f1.flatMap((a) => pr.f2.map((b) => mul(1, a, b)))));
  else if (prs.some(negPair)) other = reduce(prs.flatMap((pr) => pr.f1.flatMap((a) => pr.f2.map((b) => { const t = mul(pr.sign, a, b); return a.c < 0 && b.c < 0 ? { c: -t.c, p: t.p } : t; }))));
  else other = reduce(prs.flatMap((pr) => (pr.f1.length > 1 ? [mul(pr.sign, pr.f1[0], pr.f2[0]), mul(pr.sign, pr.f1.at(-1), pr.f2.at(-1))] : [mul(pr.sign, pr.f1[0], pr.f2.at(-1)), ...pr.f2.slice(0, -1).map((b) => ({ c: pr.sign * b.c, p: b.p }))])));
  return { right: termsTex(right), onlyFirst: termsTex(onlyFirst), other: termsTex(other), otherKind: prs.some((pr) => pr.sign < 0) ? 'sign' : prs.some(negPair) ? 'negneg' : prs[0].f1.length > 1 ? 'extremes' : 'onlyLast' };
}

const $ = (s) => `$${s}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const exprOfTask = (tk) => L.exprTex(tk.expr ? { world: 'arrows', expr: tk.expr } : { world: 'plot', h: tk.h, w: tk.w });

export const QUESTIONS = {
  value: (lab, tk, k) => {
    const x = lab.x;
    const hv = tk.h.m * x + tk.h.n; const wv = tk.w.m * x + tk.w.n;
    const area = hv * wv;
    const o = { x: $(`x=${x}`), expr: $(exprOfTask(tk)), calc: $(`${hv}\\times${wv}=${area}`), area: $(String(area)) };
    return {
      id: 'value', kind: 'number', expected: String(area), answer: <MathText>{$(String(area))}</MathText>,
      prompt: Cq(k, 'value.prompt', o), hints: [Cq(k, 'value.hint1'), Cq(k, 'value.hint2', o)], explain: Cq(k, 'value.explain', o),
    };
  },
  minus: (lab, tk, k) => {
    const o = { expr: $(exprOfTask(tk)), eq: $(`${exprOfTask(tk)}=${expandOptions(tk).right}`) };
    return {
      id: 'minus', kind: 'choice', prompt: Cq(k, 'minus.prompt', o),
      options: [{ text: Cq(k, 'minus.right'), correct: true }, { text: Cq(k, 'minus.small'), why: Cq(k, 'minus.whySmall') }, { text: Cq(k, 'minus.add'), why: Cq(k, 'minus.whyAdd') }],
      hints: [Cq(k, 'minus.hint1'), Cq(k, 'minus.hint2')], explain: Cq(k, 'minus.explain', o),
    };
  },
  corner: (lab, tk, k) => {
    const c = tk.h.n * tk.w.n;
    const o = { a: $(String(-tk.h.n)), b: $(String(-tk.w.n)), c: $(String(c)), prod: $(`(${tk.h.n})\\times(${tk.w.n})=+${c}`) };
    return {
      id: 'corner', kind: 'choice', prompt: Cq(k, 'corner.prompt', o),
      options: [{ text: Cq(k, 'corner.right'), correct: true }, { text: Cq(k, 'corner.big'), why: Cq(k, 'corner.whyBig') }, { text: Cq(k, 'corner.add', o), why: Cq(k, 'corner.whyAdd', o) }],
      hints: [Cq(k, 'corner.hint1'), Cq(k, 'corner.hint2', o)], explain: Cq(k, 'corner.explain', o),
    };
  },
  count: (lab, tk, k) => {
    const prs = productsOf(tk);
    const n = prs.reduce((a, pr) => a + pr.f1.length * pr.f2.length, 0);
    const o = { expr: $(exprOfTask(tk)), n: $(String(n)), calc: $(`${prs[0].f1.length}\\times${prs[0].f2.length}=${n}`) };
    return {
      id: 'count', kind: 'number', expected: String(n), answer: <MathText>{$(String(n))}</MathText>,
      prompt: Cq(k, 'count.prompt', o), hints: [Cq(k, 'count.hint1'), Cq(k, 'count.hint2')], explain: Cq(k, 'count.explain', o),
    };
  },
  arrows: (lab, tk, k) => {
    const prs = productsOf(tk);
    const n = prs.reduce((a, pr) => a + pr.f1.length * pr.f2.length, 0);
    const o = { expr: $(exprOfTask(tk)), n: $(String(n)) };
    return {
      id: 'arrows', kind: 'number', expected: String(n), answer: <MathText>{$(String(n))}</MathText>,
      prompt: Cq(k, 'arrows.prompt', o), hints: [Cq(k, 'arrows.hint1'), Cq(k, 'arrows.hint2')], explain: Cq(k, 'arrows.explain', o),
    };
  },
  negSign: (lab, tk, k) => {
    const pr = productsOf(tk).find(negPair);
    const a = pr.f1.find((q) => q.c < 0); const b = pr.f2.find((q) => q.c < 0 && q.p === 0) ?? pr.f2.find((q) => q.c < 0);
    const t = mulTerms(a, b);
    const tt = termsTex([t]); const ta = termsTex([a]); const tb = termsTex([b]);
    const o = { a: $(ta), b: $(tb), prod: $(`(${ta})\\times(${tb})=+${termsTex([{ c: Math.abs(t.c), p: t.p }])}`) };
    const neg = termsTex([{ c: -Math.abs(t.c), p: t.p }]); const sum = termsTex([{ c: a.c + b.c, p: 0 }]);
    return {
      id: 'negSign', kind: 'choice', cols: 3, prompt: Cq(k, 'negSign.prompt', o),
      options: [
        { text: <MathText>{$(`+${tt.replace(/^\+/, '')}`)}</MathText>, correct: true },
        { text: <MathText>{$(neg)}</MathText>, why: Cq(k, 'negSign.whyNeg') },
        { text: <MathText>{$(sum)}</MathText>, why: Cq(k, 'negSign.whySum', o) },
      ],
      hints: [Cq(k, 'negSign.hint1'), Cq(k, 'negSign.hint2')], explain: Cq(k, 'negSign.explain', o),
    };
  },
  expand: (lab, tk, k) => {
    const e = expandOptions(tk);
    const o = { expr: $(exprOfTask(tk)), eq: $(`${exprOfTask(tk)}=${e.right}`) };
    return {
      id: 'expand', kind: 'choice', cols: 3, prompt: Cq(k, 'expand.prompt', o),
      options: [
        { text: <MathText>{$(e.onlyFirst)}</MathText>, why: Cq(k, 'expand.whyOnlyFirst') },
        { text: <MathText>{$(e.right)}</MathText>, correct: true },
        { text: <MathText>{$(e.other)}</MathText>, why: Cq(k, `expand.why.${e.otherKind}`) },
      ],
      hints: [Cq(k, `expand.hint1.${tk.expr ? 'arrows' : 'plot'}`), Cq(k, 'expand.hint2')], explain: Cq(k, 'expand.explain', o),
    };
  },
  rule: (lab, tk, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k(lab.world === 'arrows' ? 'discovery.arrows.prompt' : 'discovery.plot.prompt')}</MathText>,
    options: discoveryOptions(lab, k).map((o) => ({ ...o })),
    hints: [Cq(k, `rule.${lab.world}.hint1`), Cq(k, `rule.${lab.world}.hint2`)],
    explain: <Formal lab={lab} k={k} />,
  }),
};
