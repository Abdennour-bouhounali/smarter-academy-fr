import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useDragInteraction from '../useDragInteraction';
import DragGhost from '../primitives/DragGhost';
import { PromptCard } from '../primitives/LabKit';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import * as BR from '@smarter-academy/core/arithmetic/brackets.js';
import { termsTex as polyTex } from '@smarter-academy/core/arithmetic/polynomials.js';
import MathText from '../../components/MathText';
import { LEVELS } from '../levels';
import * as L from '../logic/likeTerms';
import PieceArt from './likeTerms/PieceArt';
import { fitUnit } from './likeTerms/pieceLayout';
import Workbench from './likeTerms/Workbench';
import SidePanel from './likeTerms/SidePanel';
import { num } from './likeTerms/format';

export { bannerOf, iso, num, tex, plain } from './likeTerms/format';

/**
 * like-terms — « طاولة الحدود » : LE TERME SOUS LA MAIN (3AM, unité 4 « الحساب الحرفي », درس « تبسيط عبارة جبرية وحذف الأقواس »,
 * 2026-10-20). Logique : `logic/likeTerms.js` (sur `core/arithmetic/brackets.js`, importé par chemin). Dessin : `likeTerms/`.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. Une PILE de pièces de bois identiques (« حزمة ») — un terme de l'expression écrite : réglettes x, plaques x² (côté = la réglette),
 *    cubes 1 ; un coefficient négatif = la même pile en finition « opposée » (rouge hachuré, « − »). La main la PORTE (glisser,
 *    toucher-toucher, clavier) : dans la صينية de sa forme (collect), ou hors d'une caisse « +( ) » / « −( ) » vers une sortie
 *    « كما هي » / « بعكس إشارتها » (brackets). La main règle aussi x (la longueur de la réglette) : toutes les pièces se redessinent.
 * B. Réduire une somme = regrouper les termes SEMBLABLES (même partie littérale) en ajoutant leurs coefficients ; un terme et son
 *    opposé s'annulent ; supprimer des parenthèses précédées de − change le signe de CHAQUE terme ; la valeur ne change jamais.
 * C. Une pile d'une autre forme est refusée et revient en tremblant, la bannière donne les valeurs des deux pièces à x (ou à un
 *    témoin quand x = 1 les confond) ; dans une صينية les paires pièce/opposée disparaissent (bouffée) ; une mauvaise sortie de caisse
 *    est refusée avec la valeur de l'expression et celle qu'aurait la table ; deux compteurs de valeur (l'expression écrite, la
 *    table) bougent ensemble quand la main change x ; la ligne écrite grandit, la forme réduite s'écrit.
 * D. La forme réduite (`simplifiedTex`), la ligne sans parenthèses (`openedTex`), la règle formelle avec SES lignes.
 * E. « متى تجتمع حزمتان في حدّ واحد؟ » (collect) · « ماذا حدث لإشارة كل حدّ أخرجتَه من قوسين مسبوقين بـ − ؟ » (brackets) — les
 *    fausses conjectures réfutées par SES nombres (ses compteurs à x, son propre refus).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        termes semblables ; somme des coefficients ; opposés qui s'annulent ; suppression des parenthèses ; valeur invariante
 *   OBJECT         des piles de pièces de bois (réglettes, plaques, cubes) sur la table du club ; trois صواني ; des caisses à signe
 *   VARIABLE       la destination de la pile (la صينية, la sortie) ; x, la longueur de la réglette (1…6) ; le coefficient écrit (متقدم)
 *   INVARIANT      la valeur de la table = la valeur de l'expression écrite, à tout x
 *   TRANSFORMATION la pile rejoint sa صينية (paires annulées) ; la pile sort de sa caisse telle quelle ou retournée
 *   CONSTRAINT     une صينية n'accepte que sa forme ; une sortie qui changerait la valeur est refusée
 *   RESISTANCE     kind (la pièce et la صينية ne valent pas la même chose à x) · sign (la valeur de l'expression changerait)
 *   EVIDENCE       les deux compteurs de valeur, la bouffée des paires, la ligne écrite qui grandit, la forme réduite
 *   CONTRAST       x avec x (s'empilent) / x avec x² ou 1 (refusés) ; +( ) (rien ne change) / −( ) (tout change)
 *   PREDICTION     متقدم : le coefficient de chaque صينية est ÉCRIT avant que « تحقّق » n'annule les paires
 *   DISCOVERY      les deux questions de E, options réfutables
 *   FORMALIZATION  الحدود المتشابهة · نجمع المعاملات · الحدّ ومعاكسه · حذف الأقواس (+ / −) · القيمة لا تتغيّر
 *   TRANSFER       le module de la طريقة (monde brackets), les exercices, la leçon suivante (النشر)
 *
 * « جرّب كل الإمكانيات » : NON (§6bis — chaque geste EST une réponse : une destination, une sortie, un coefficient).
 * « جرّب أعدادك » : TOUJOURS OUVERT (`[data-lt-free]`) : + / − par forme, une caisse de chaque signe (brackets), « امسح ».
 *
 * D'UN SEUL REGARD (§8bis) : `[data-lt-glance]` enveloppe la consigne, la table (ligne écrite, rangée, sorties / صواني) et le panneau
 * (x, les deux valeurs, la bannière, le panneau libre). L'unité `u` des pièces est budgétée sur `useLessonViewport` (`fitUnit`, 7…18 px,
 * calculée à x = 6 pour que la table ne saute pas quand la main change x). ≥ 660 px de large : le panneau est À CÔTÉ de la table ;
 * en dessous (768 × 1024 portrait), il passe DESSOUS sur deux colonnes. Tablette et ordinateur seulement.
 *
 * ONBOARDING : `logic/likeTerms.js › coachOf` (exit · exitMore · sort · x · sortMore · coef · check · next).
 *
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 1, 2026-10-28) : `checkpoints` (défaut true). Après CHAQUE
 * tâche, une suite de questions sur ce que l'élève vient de FAIRE se pose par-dessus le labo et retient « التالي » (`chainOf`) : collect le
 * coefficient d'une SA plateau · les pièces qui s'annulent · le terme qui disparaît, puis « quelle forme réduite ? » ; brackets la caisse +
 * ou − (le signe de chaque pièce qui sort), puis la forme réduite (les mauvaises options sont les erreurs réelles : tout fusionner, le signe
 * du seul premier terme, aucun signe changé). La dernière tâche finit par LA RÈGLE (l'ancienne découverte, qui formalise). Obligatoires pour
 * tout élève ; l'enseignant seul les coupe pour SON compte. ÉTAPES `LabStepper` (`[data-lt-step=<i>]`) + fête ; « إعادة » repart de la
 * tâche 1 ; « أعِد التجربة » remet LA MÊME tâche (`L.retryTask`). SON : `tooth` (poser, sortir, bouger x), `bell` (une paire annulée),
 * `flag` (tâche faite), `over` (refus).
 * Props (contrat fixé avec la leçon) : `world` ('collect' | 'brackets'), `tasks` ([{ id, expr }], format brackets.js), `level`, `levels`
 * (forcé à false pour brackets), `coach`, `lead` (REMPLACE la phrase de contexte du niveau écrit), `onTrial(événement)` (par
 * `state.report`), `onFinished({ world })`.
 *
 * CONTRAT DOM : [data-like-terms][data-world][data-task][data-solved], [data-lt-glance], [data-lt-bundle=<id>][data-c][data-p],
 * [data-lt-tray=2|1|0][data-coef], [data-lt-crate=<i>][data-sign], [data-lt-exit=keep|flip], [data-lt-x], [data-lt-x-less],
 * [data-lt-x-more], [data-lt-xbox], [data-lt-value=written|table], [data-lt-line], [data-lt-result], [data-lt-refused=<reason>],
 * [data-lt-banner], [data-lt-next], [data-lt-free], [data-lt-add=<p><+|->], [data-lt-clear], [data-lt-target=row|plus|minus],
 * [data-lt-coef=<p>], [data-lt-check], [data-lt-formal].
 */
const NS = 'manipulation.likeTerms';
const MAX_W = 1080;
const MOTION_CSS = '@keyframes lt-wobble{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px) rotate(-2deg)}45%{transform:translateX(6px) rotate(2deg)}70%{transform:translateX(-3px)}}'
  + '@keyframes lt-poof{0%{opacity:.95;transform:scale(1)}60%{opacity:.6;transform:scale(1.18)}100%{opacity:0;transform:scale(.4)}}'
  + '@keyframes lt-pop{from{opacity:.2;transform:scale(.85)}to{opacity:1;transform:scale(1)}}'
  + '@keyframes lt-flip{0%{transform:rotateY(180deg);opacity:.4}100%{transform:rotateY(0);opacity:1}}'
  + '@keyframes lt-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}'
  + '.lt-wobble{animation:lt-wobble .42s ease-in-out}.lt-poof{animation:lt-poof .8s ease-out forwards}.lt-pop{animation:lt-pop .28s ease-out both}'
  + '.lt-flip{animation:lt-flip .45s ease-out both}.lt-hop{animation:lt-hop .5s ease-out}'
  + '@media (prefers-reduced-motion:reduce){.lt-wobble,.lt-poof,.lt-pop,.lt-flip,.lt-hop{animation:none}.lt-poof{display:none}}';

/** Les nombres de la manipulation : la tâche de la leçon, ou le préréglage du niveau (même objet : `levelMatching` compare par référence). */
export function numbersFor({ world, tasks, level }) {
  if (world === 'brackets') return { world: 'brackets', tasks: L.tasksFor('brackets', tasks) };
  if (Array.isArray(tasks) && tasks.length) return { world: 'collect', tasks };
  return LEVELS['like-terms'][resolveLevelId(level ?? 'beginner')].numbers;
}

export default function LikeTerms({
  world, tasks, title, lead, level, levels: withLevelsProp = true, coach: coachOn = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const withLevels = world === 'brackets' ? false : withLevelsProp;
  const initialNumbers = useMemo(() => numbersFor({ world, tasks, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'like-terms', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const scaffold = nums.world === 'brackets' || state.level !== 'advanced';
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
  const cpSettings = useLabCheckpointSettings('like-terms');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
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
  // le son du geste (muet sans « الصوت ») : poser, sortir, bouger x ; une paire annulée ; la tâche faite ; un refus
  const heard = useRef({ n: lab.events.length, at: 0 });
  useEffect(() => {
    const h = heard.current;
    if (lab.events.length < h.n) h.n = 0;
    const evs = lab.events.slice(h.n);
    h.n = lab.events.length;
    if (!evs.length) return;
    const kinds = evs.map((e) => e.kind);
    if (kinds.includes('solved')) playSfx('flag');
    else if (kinds.includes('refused')) playSfx('over');
    else if (kinds.includes('cancel')) playSfx('bell');
    else if (kinds.some((x) => x === 'sort' || x === 'exit' || x === 'x')) {
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

  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'like-terms', step: coachStep,
    text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
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
  const sideW = side ? (width < 820 ? 230 : width < 900 ? 250 : 272) : 0;
  const sceneW = side ? width - sideW - 12 : width;
  const advanced = !lab.scaffold;
  const u = fitUnit({
    cards: lab.bundles.map((b) => ({ n: Math.abs(b.place === 'crate' ? b.c0 : b.c), p: b.p })),
    width: sceneW - 40, height: side ? screenH - 250 : screenH - (screenH < 900 ? 620 : 520), extra: 120 + (advanced ? 52 : 0) + (lab.crates.length ? 70 : 0),
    crates: lab.crates.length,
  });

  /* ── le geste : porter une pile (glisser, toucher-toucher, clavier) ── */
  const [wobble, setWobble] = useState(null);
  const drag = useDragInteraction({
    accepts: (src, zone) => {
      const id = src.slice(2);
      if (zone.startsWith('tray:')) return L.canSort(lab, id, Number(zone.slice(5)));
      // une sortie ne se juge qu'au dépôt : ni l'aimant ni le survol ne trahissent la bonne
      if (zone.startsWith('exit:')) return L.canExit(lab, id) ? true : '';
      return '';
    },
    onDrop: (src, zone) => {
      const id = src.slice(2);
      if (zone.startsWith('tray:')) setLab((s) => L.sort(s, id, Number(zone.slice(5))));
      else if (zone.startsWith('exit:')) setLab((s) => L.exitTo(s, id, zone === 'exit:flip'));
    },
    onReject: (src, zone, reason) => {
      if (reason === 'kind') setLab((s) => L.refuseKind(s, src.slice(2), Number(zone.slice(5))));
    },
  });
  useEffect(() => {
    const last = lab.last;
    if (last?.event === 'refused' && last.reason === 'sign') setWobble({ id: last.id, n: nEv });
  }, [nEv]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la bouffée des paires annulées ── */
  const [poof, setPoof] = useState(null);
  const seenEv = useRef(0);
  useEffect(() => {
    if (nEv < seenEv.current) seenEv.current = 0;
    const fresh2 = lab.events.slice(seenEv.current);
    seenEv.current = nEv;
    const cancels = fresh2.filter((e) => e.kind === 'cancel');
    if (!cancels.length) return undefined;
    const trays = {};
    for (const e of cancels) {
      if (lab.last?.event === 'sort') trays[e.tray] = lab.last.cancelled;
      else { const pc = L.trayPieces(lab, e.tray); trays[e.tray] = Math.min(pc.pos, pc.neg); }
    }
    setPoof({ key: nEv, trays });
    const tm = setTimeout(() => setPoof(null), 900);
    return () => clearTimeout(tm);
  }, [nEv]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── clavier : les flèches passent d'une pile / d'une zone à l'autre, Échap lâche ── */
  const onKeyDown = (e) => {
    if (e.key === 'Escape') { drag.release(); return; }
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    const from = e.target.closest?.('[data-lt-nav]');
    if (!from) return;
    const all = [...e.currentTarget.querySelectorAll('[data-lt-nav]')].filter((n) => !n.hasAttribute('disabled') && n.getAttribute('aria-disabled') !== 'true');
    const i = all.indexOf(from);
    if (i < 0) return;
    e.preventDefault();
    const fwd = e.key === 'ArrowDown' || e.key === 'ArrowLeft'; // RTL : ← avance
    all[(i + (fwd ? 1 : -1) + all.length) % all.length]?.focus();
  };

  const held = drag.held ? L.bundle(lab, drag.held.slice(2)) : null;
  const task = L.taskOf(lab);
  const context = lab.custom ? k('context.custom') : (state.isAuthoredLevel && lead) || k(`context.${lab.world}`);
  const question = k(`question.${lab.custom ? 'custom' : lab.world === 'brackets' ? 'brackets' : advanced ? 'advanced' : 'collect'}`);
  const prompt = (
    <PromptCard size={side && width >= 900 ? 'lg' : 'md'} className={screenH < 820 ? '!space-y-1 !p-3' : undefined}
      aside={lab.tasks.length > 1 ? <LabStepper count={lab.tasks.length} current={lab.custom ? -1 : lab.ti} done={stepDone} stepAttr="data-lt-step" /> : undefined} context={context} contextProps={{ 'data-lt-context': task }}
      title={question} titleClassName={!side || width < 900 ? (screenH < 820 ? 'text-base' : 'text-lg') : screenH < 820 ? 'text-lg' : 'text-xl'}
      lamp={lab.solvedNow ? 'on' : 'off'} titleProps={{ 'data-lt-question': task, 'data-lit': lab.solvedNow ? 'true' : 'false' }} />
  );
  const mood = lab.solvedNow ? 'proud' : lab.last?.event === 'refused' ? 'wonder' : 'happy';
  const bench = <Workbench lab={lab} setLab={setLab} k={k} u={u} drag={drag} wobble={wobble} poof={poof} mood={mood} narrow={!side} />;
  const panel = <SidePanel lab={lab} setLab={setLab} k={k} side={side} width={sideW} coachVisible={coach.visible} blocking={cp.blocking} />;

  const discovery = (
    <ManipulationDiscovery state={state}
      prompt={<MathText>{k(lab.world === 'brackets' ? 'discovery.brackets.prompt' : 'discovery.collect.prompt')}</MathText>}
      options={discoveryOptions(lab, k)} formal={<Formal lab={lab} k={k} />}
      onFormalized={() => state.report(onFinished, { world: lab.world })} />
  );

  const hintsKey = lab.world === 'brackets' ? 'brackets' : advanced ? 'advanced' : 'collect';
  return (
    <ManipulationShell type="like-terms" title={title ?? k('title')} titleHidden state={state} allowModeSwitch={allowModeSwitch} allowFreeLab={false}
      coach={coachOn ? coach : null} headerAction={cpSettings.control} guided={!!chain || ruleByCheckpoint} hints={[0, 1, 2].map((i) => k(`hints.${hintsKey}.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }} discovery={discovery} explanation={<MathText>{k('explanation')}</MathText>}>
      <ManipulationStage className="bg-gradient-to-b from-amber-50/50 to-white">
        <div ref={boxRef} data-like-terms data-world={lab.world} data-task={task} data-solved={lab.solvedNow ? 'true' : 'false'}>
          <style dangerouslySetInnerHTML={{ __html: MOTION_CSS }} />
          <div className="relative mx-auto space-y-2.5" style={{ maxWidth: MAX_W }} data-lt-glance onKeyDown={onKeyDown}>
            {party.node}
            {cp.node}
            {prompt}
            {side ? (
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">{bench}</div>
                {panel}
              </div>
            ) : (
              <div className="space-y-1.5">{bench}{panel}</div>
            )}
          </div>
          <DragGhost ghost={drag.ghost}>
            {held && <div className="rounded-xl bg-white/70 p-1"><PieceArt c={held.place === 'crate' ? held.c0 : held.c} p={held.p} x={lab.x} u={u} /></div>}
          </DragGhost>
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

export function discoveryOptions(lab, k) {
  const M = (s) => <MathText>{s}</MathText>;
  if (lab.world === 'brackets') {
    const v = L.minusVariants(lab);
    const firstWhy = v.own
      ? k('discovery.brackets.whyFirstOwn', { term: v.own.termTex, x: v.own.x, before: num(v.own.before), after: num(v.own.after) })
      : k('discovery.brackets.whyFirst', { wrong: v.first.wrongTex, expr: v.first.exprTex, x: v.first.x, w: num(v.first.wrong), r: num(v.first.right) });
    return [
      { text: M(k('discovery.brackets.first')), why: M(firstWhy) },
      { text: M(k('discovery.brackets.right')), correct: true },
      { text: M(k('discovery.brackets.none')), why: M(k('discovery.brackets.whyNone', { wrong: v.none.wrongTex, expr: v.none.exprTex, x: v.none.x, w: num(v.none.wrong), r: num(v.none.right) })) },
    ];
  }
  const a = L.mergeAllWitness(lab);
  const b = L.sameNumberWitness(lab);
  return [
    { text: M(k('discovery.collect.always')), why: M(k('discovery.collect.whyAlways', { x: a.x, a: num(a.a), b: num(a.b) })) },
    { text: M(k('discovery.collect.right')), correct: true },
    { text: M(k('discovery.collect.sameNumber')), why: M(k('discovery.collect.whySameNumber', { x: b.x, a: num(b.a), b: num(b.b) })) },
  ];
}

/** Une ligne de la règle : la phrase (arabe), puis la ou les égalités de l'élève, chacune dans son îlot LTR (jamais collées au texte). */
function Rule({ label, lines, rule, plain = false }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${plain ? '' : 'rounded-2xl border border-emerald-200 bg-white/80 px-3 py-2'}`} data-lt-rule={rule}>
      <span><MathText>{label}</MathText></span>
      {lines.map((l) => (
        <bdi key={l} dir="ltr" className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[15px] ring-1 ring-emerald-200"><MathText>{`$${l}$`}</MathText></bdi>
      ))}
    </div>
  );
}

export function Formal({ lab, k }) {
  const f = L.formalLines(lab);
  const value = f.value && (
    <div className="text-xs text-slate-700"><Rule plain rule="value" label={k('formal.value', { x: f.value.x })} lines={[`${f.value.expr} = ${f.value.v}`, `${f.value.result} = ${f.value.v}`]} /></div>
  );
  if (lab.world === 'brackets') {
    const plus = f.lines.find((l) => l.plus && !l.minus) ?? f.lines.find((l) => l.plus);
    const minus = f.lines.find((l) => l.minus && !l.plus) ?? f.lines.find((l) => l.minus);
    return (
      <div className="space-y-2 text-sm font-bold text-emerald-950" data-lt-formal="brackets">
        {plus && <Rule rule="plus" label={k('formal.plus')} lines={[`${plus.expr} = ${plus.opened}`]} />}
        {minus && <Rule rule="minus" label={k('formal.minus')} lines={[`${minus.expr} = ${minus.opened}`]} />}
        <Rule plain rule="reduce" label={k('formal.thenReduce')} lines={f.lines.map((l) => `${l.opened} = ${l.result}`)} />
        {value}
      </div>
    );
  }
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-lt-formal="collect">
      <Rule rule="like" label={k('formal.like')} lines={[]} />
      {f.sum && <Rule rule="sum" label={k('formal.sum')} lines={[`${f.sum.lhs} = ${f.sum.rhs}`]} />}
      {f.cancel && <Rule rule="cancel" label={k('formal.cancel')} lines={[f.cancel.tex]} />}
      <Rule plain rule="lines" label={k('formal.lines')} lines={f.lines.map((l) => `${l.expr} = ${l.result}`)} />
      {value}
    </div>
  );
}



/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

const flatTerms = (expr) => expr.flatMap((it) => (BR.isGroup(it) ? it.terms.map((q) => ({ c: it.sign * q.c, p: q.p })) : [{ ...it }]));
const sumOf = (expr, p) => flatTerms(expr).filter((q) => q.p === p).reduce((a, q) => a + q.c, 0);
const powersIn = (expr) => [...new Set(flatTerms(expr).map((q) => q.p))].sort((a, b) => b - a);
const mixedPower = (expr) => powersIn(expr).find((p) => { const cs = flatTerms(expr).filter((q) => q.p === p).map((q) => q.c); return cs.some((c) => c > 0) && cs.some((c) => c < 0); });

/** La question sur le geste de la tâche, puis la forme réduite ; la dernière tâche finit par la règle. */
export function chainOf(lab, i) {
  const tk = lab.tasks[i];
  if (!tk) return [];
  let first;
  const last = i === lab.tasks.length - 1;
  // la règle de la dernière tâche demande déjà le signe de la caisse − : sa première question porte alors sur la caisse +
  if (tk.expr.some(BR.isGroup)) first = tk.expr.some((it) => BR.isGroup(it) && it.sign < 0) && !(last && tk.expr.some((it) => BR.isGroup(it) && it.sign > 0)) ? 'minusCrate' : 'plusCrate';
  else if (powersIn(tk.expr).some((p) => sumOf(tk.expr, p) === 0)) first = 'vanish';
  else if (mixedPower(tk.expr) != null) first = 'cancel';
  else first = 'trayCoef';
  const base = [first, 'result'];
  return last ? [...base, 'rule'] : base;
}

/** La forme réduite juste et deux erreurs RÉELLES : tout fusionner (collect) / le signe du seul premier terme (−), aucun signe changé (−, +). */
export function resultOptions(tk) {
  const expr = tk.expr;
  const right = BR.simplifiedTex(expr);
  const groups = expr.some(BR.isGroup);
  const variant = (mode) => expr.flatMap((it) => {
    if (!BR.isGroup(it)) return [{ ...it }];
    if (mode === 'flipAll') return it.terms.map((q) => ({ c: -q.c, p: q.p }));
    if (it.sign > 0) return it.terms.map((q) => ({ ...q }));
    return it.terms.map((q, j) => (mode === 'first' && j === 0 ? BR.opposite(q) : { ...q }));
  });
  let wrong;
  if (groups && expr.some((it) => BR.isGroup(it) && it.sign < 0)) wrong = [BR.simplifiedTex(variant('first')), BR.simplifiedTex(variant('none'))];
  else if (groups) wrong = [BR.simplifiedTex(variant('flipAll')), polyTex([{ c: flatTerms(expr).reduce((a, q) => a + q.c, 0), p: 1 }])];
  else {
    const all = flatTerms(expr).reduce((a, q) => a + q.c, 0);
    const abs = flatTerms(expr).map((q) => ({ c: Math.abs(q.c), p: q.p }));
    const top = powersIn(expr)[0];
    wrong = [polyTex([{ c: all, p: top }]), flatTerms(expr).some((q) => q.c < 0) ? BR.simplifiedTex(abs) : polyTex(powersIn(expr).map((p) => ({ c: p === 0 ? sumOf(expr, 0) : flatTerms(expr).filter((q) => q.p === p).length, p })))];
  }
  return { right, wrong, kinds: groups ? (expr.some((it) => BR.isGroup(it) && it.sign < 0) ? ['first', 'none'] : ['flipAll', 'merge']) : ['merge', flatTerms(expr).some((q) => q.c < 0) ? 'sign' : 'merge2'] };
}

const $ = (s) => `$${s}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const pTex = (p) => (p === 0 ? '1' : p === 1 ? 'x' : `x^${p}`);
const exprOf = (tk) => BR.expressionTex(tk.expr);

export const QUESTIONS = {
  trayCoef: (lab, tk, k) => {
    const p = powersIn(tk.expr).includes(1) ? 1 : powersIn(tk.expr)[0];
    const n = sumOf(tk.expr, p);
    const parts = flatTerms(tk.expr).filter((q) => q.p === p).map((q) => q.c);
    const o = { piece: $(pTex(p)), expr: $(exprOf(tk)), n: $(String(n)), calc: $(`${parts.join('+').replace(/\+-/g, '-')}=${n}`) };
    return {
      id: 'trayCoef', kind: 'number', expected: String(n), answer: <MathText>{$(String(n))}</MathText>,
      prompt: Cq(k, 'trayCoef.prompt', o), hints: [Cq(k, 'trayCoef.hint1', o), Cq(k, 'trayCoef.hint2', o)], explain: Cq(k, 'trayCoef.explain', o),
    };
  },
  cancel: (lab, tk, k) => {
    const p = mixedPower(tk.expr);
    const cs = flatTerms(tk.expr).filter((q) => q.p === p).map((q) => q.c);
    const pos = cs.filter((c) => c > 0).reduce((a, c) => a + c, 0); const neg = -cs.filter((c) => c < 0).reduce((a, c) => a + c, 0);
    const n = pos - neg;
    const o = { piece: $(pTex(p)), pos: $(String(pos)), neg: $(String(neg)), n: $(String(n)), calc: $(`${pos}-${neg}=${n}`) };
    return {
      id: 'cancel', kind: 'number', expected: String(n), answer: <MathText>{$(String(n))}</MathText>,
      prompt: Cq(k, 'cancel.prompt', o), hints: [Cq(k, 'cancel.hint1'), Cq(k, 'cancel.hint2', o)], explain: Cq(k, 'cancel.explain', o),
    };
  },
  vanish: (lab, tk, k) => {
    const p = powersIn(tk.expr).find((q) => sumOf(tk.expr, q) === 0);
    const cs = flatTerms(tk.expr).filter((q) => q.p === p).map((q) => q.c);
    const o = { piece: $(pTex(p)), calc: $(`${polyTex(cs.map((c) => ({ c, p })))}=0`) };
    return {
      id: 'vanish', kind: 'choice', prompt: Cq(k, 'vanish.prompt', o),
      options: [{ text: Cq(k, 'vanish.right', o), correct: true }, { text: Cq(k, 'vanish.double', o), why: Cq(k, 'vanish.whyDouble') }, { text: Cq(k, 'vanish.one', o), why: Cq(k, 'vanish.whyOne', o) }],
      hints: [Cq(k, 'vanish.hint1', o), Cq(k, 'vanish.hint2')], explain: Cq(k, 'vanish.explain', o),
    };
  },
  plusCrate: (lab, tk, k) => {
    const g = tk.expr.find(BR.isGroup);
    const o = { crate: $(`+(${polyTex(g.terms)})`), out: $(polyTex(g.terms)) };
    return {
      id: 'plusCrate', kind: 'choice', prompt: Cq(k, 'plusCrate.prompt', o),
      options: [{ text: Cq(k, 'plusCrate.right'), correct: true }, { text: Cq(k, 'plusCrate.flip'), why: Cq(k, 'plusCrate.whyFlip', o) }, { text: Cq(k, 'plusCrate.first'), why: Cq(k, 'plusCrate.whyFirst', o) }],
      hints: [Cq(k, 'plusCrate.hint1'), Cq(k, 'plusCrate.hint2', o)], explain: Cq(k, 'plusCrate.explain', o),
    };
  },
  minusCrate: (lab, tk, k) => {
    const g = tk.expr.find((it) => BR.isGroup(it) && it.sign < 0);
    const o = { crate: $(`-(${polyTex(g.terms)})`), out: $(polyTex(g.terms.map(BR.opposite))) };
    return {
      id: 'minusCrate', kind: 'choice', prompt: Cq(k, 'minusCrate.prompt', o),
      options: [{ text: Cq(k, 'minusCrate.first'), why: Cq(k, 'minusCrate.whyFirst', o) }, { text: Cq(k, 'minusCrate.right'), correct: true }, { text: Cq(k, 'minusCrate.none'), why: Cq(k, 'minusCrate.whyNone', o) }],
      hints: [Cq(k, 'minusCrate.hint1'), Cq(k, 'minusCrate.hint2', o)], explain: Cq(k, 'minusCrate.explain', o),
    };
  },
  result: (lab, tk, k) => {
    const r = resultOptions(tk);
    const o = { eq: $(`${exprOf(tk)}=${r.right}`), expr: $(exprOf(tk)) };
    return {
      id: 'result', kind: 'choice', cols: 3, prompt: Cq(k, 'result.prompt', o),
      options: [
        { text: <MathText>{$(r.wrong[0])}</MathText>, why: Cq(k, `result.why.${r.kinds[0]}`) },
        { text: <MathText>{$(r.right)}</MathText>, correct: true },
        { text: <MathText>{$(r.wrong[1])}</MathText>, why: Cq(k, `result.why.${r.kinds[1]}`) },
      ],
      hints: [Cq(k, `result.hint1.${lab.world}`), Cq(k, 'result.hint2')], explain: Cq(k, 'result.explain', o),
    };
  },
  rule: (lab, tk, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k(lab.world === 'brackets' ? 'discovery.brackets.prompt' : 'discovery.collect.prompt')}</MathText>,
    options: discoveryOptions(lab, k), hints: [Cq(k, `rule.${lab.world}.hint1`), Cq(k, `rule.${lab.world}.hint2`)], explain: <Formal lab={lab} k={k} />,
  }),
};
