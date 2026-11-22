import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronsUpDown, ArrowLeft, Check, Move, CheckCircle2, XCircle, Info, Minus, Plus } from 'lucide-react';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import useDragInteraction from '../useDragInteraction';
import DropZone from '../primitives/DropZone';
import DragGhost from '../primitives/DragGhost';
import LabFold from '../primitives/LabFold';
import KidFigure from '../primitives/KidFigure';
import { kidBox, kidLook } from '../primitives/kidFigure.js';
import { SvgPill, SvgDimension } from '../primitives/SvgPill';
import { LabCard, StageFrame, PromptCard, ChoiceTray, ChoiceCard, StepperCard, NamePill, VerdictBanner, RoundButton } from '../primitives/LabKit';
import ArcTape from '../../components/ArcTape';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import * as L from '../logic/storyBars';

/**
 * story-bars — LE MODÈLE EN BARRES D'UNE HISTOIRE (1AM, unité 2 « الجمع والطرح », درس « معنى الجمع والطرح »,
 * manuel pp. 25, 26, 29). La logique, exacte, est dans `logic/storyBars.js` ; la bande est `ArcTape`
 * (« مخطط بأقواس », components/arcTape.js), qui dessine elle-même l'écart ou le débordement quand les
 * parties ne font pas le tout.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève TIENT L'INCONNUE. مبتدئ (`checkup`) et la méthode p. 29 (`method29`) : il TIRE la tête d'un
 *    enfant devant la toise (glisser vertical sur la scène, flèches ±1, Page ±5, boutons −/+, toucher la
 *    toise) jusqu'à ce que la phrase de l'histoire soit vraie ; puis il CHOISIT une des trois cartes de
 *    calcul (toucher, Entrée). متقدم (`act1`, نشاط 1) : il PORTE chaque carte de calcul du manuel sur le
 *    texte qu'elle résout (glisser, toucher-toucher, clavier).
 * B. Idée : ce ne sont pas les mots « يزيد / ينقص / أكثر / أقل » qui décident de l'opération, c'est la
 *    STRUCTURE — si l'inconnue est le TOUT on additionne les parties, si c'est une PARTIE on soustrait
 *    l'autre partie du tout.
 * C. La tête suit le doigt ; une ligne pointillée joint les deux têtes et un arc entre elles porte la
 *    différence vivante (« 6 cm ») ; au relâchement la lampe de la phrase s'allume ou la phrase refuse,
 *    avec les nombres de l'élève. Une carte de calcul dessine sa taille en TÊTE FANTÔME. La bonne carte
 *    ferme la bande (le tout = l'enfant le plus grand). En متقدم, une carte refusée revient et la bande
 *    du texte se dessine avec sa valeur à la place de l'inconnue — ouverte (écart ou débordement).
 * D. La ligne formelle « □ = 130 + 6 = 136 » et la bande fermée ; en متقدم la bande fermée de chaque
 *    texte ; après la découverte, la bande générique « الكلّ = جزء + جزء ».
 * E. À découvrir avant la règle : une addition, une soustraction ET un piège (« تزيد » → on soustrait)
 *    faits à la main (checkup items 1–3 ; act1 les six textes). Les conjectures fausses sont réfutées
 *    par les items de l'élève (نزيم / النص ③ contre « le mot décide » ; أمين / النص ① contre « on
 *    soustrait toujours le petit du grand »). L'item 4 (ياسين, l'autre piège) reste un transfert.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        l'opération vient de la structure tout / parties, pas du mot de l'énoncé
 *   OBJECT         la taille d'un enfant devant la toise (مبتدئ) ; une carte de calcul (متقدم)
 *   VARIABLE       la taille inconnue h (cm entier, 100–150) ; le texte où la carte est posée
 *   INVARIANT      la taille de l'enfant connu (130 cm) et la différence de la phrase ; le tout = la somme
 *                  des parties (la bande ne se ferme qu'à cette condition, jugée EXACTEMENT)
 *   TRANSFORMATION la tête monte / descend, l'arc de différence grandit, la lampe s'allume ; la tête
 *                  fantôme d'une carte ; la bande se ferme ou montre son écart
 *   CONSTRAINT     la toise (100–150) ; une carte n'est choisie qu'une fois la phrase vraie ; une carte
 *                  n'entre que dans le texte qu'elle résout
 *   RESISTANCE     la phrase refuse avec les nombres de l'élève (« بهذا الطول تكون ريم أطول من سارة… ») ;
 *                  « 6 − 130 » n'a pas de taille ; la bande d'un texte reste ouverte (écart / débordement)
 *   EVIDENCE       la lampe, l'arc de différence, la tête fantôme, la bande fermée et « □ = 130 + 6 = 136 »
 *   CONTRAST       un TOUT inconnu (أمين, +), une PARTIE inconnue (ريم, −) et un PIÈGE (نزيم : « تزيد » → −)
 *   PREDICTION     la taille tirée AVANT tout calcul ; en متقدم la carte posée avant de voir la bande
 *   DISCOVERY      « إذا كان المجهول هو الكلّ نجمع الجزأين، وإذا كان جزءًا نطرح الجزء الآخر من الكلّ »
 *   FORMALIZATION  la bande générique + « الكلّ = جزء + جزء » / « جزء = الكلّ − الجزء الآخر »
 *   TRANSFER       ياسين (le second piège) ; la méthode p. 29 (يونس, محمد) ; les مسائل et la banque
 *                  (`statement.figure` de kind `tape`)
 *
 * « جرّب كل الإمكانيات » (§6bis) : NON — chaque taille tirée et chaque carte EST la réponse de l'élève ;
 * la balayer donnerait la réponse. Pas d'auto-complétion (le registre n'en déclare pas).
 *
 * D'UN SEUL REGARD (§8bis) : `[data-sb-glance]` enveloppe la phrase, les cartes, la scène, la poignée,
 * ses −/+, la lecture et la bande ; la hauteur de la scène vient de l'écran de leçon (`useLessonViewport`)
 * moins ce que le bloc mesure autour d'elle (170–420 px) ; la poignée est À CÔTÉ de la tête de l'enfant ;
 * la phrase et les cartes sont AU-DESSUS de la scène ; la liste des essais est dans un `LabFold` sous le
 * bloc. En متقدم : les cartes au-dessus, les six textes en deux colonnes ; sous 520 px de large (QA 320×640 : 1084 px
 * de haut sinon), les cartes en grille de 3 et UN texte à la fois — le sélecteur ①–⑥ (`role=tablist`, flèches,
 * ✓ sur un texte résolu) dont chaque onglet est la zone d'accueil de son texte, plus le panneau du texte choisi.
 *
 * ONBOARDING (prop `coach`, défaut true — `LabCoach`, §8quater) : `logic/storyBars.js › coachOf` montre la poignée de la toise, les
 * cartes de calcul, « suivant » ou la première carte du manuel ; jamais la taille, la carte juste ni l'opération.
 *
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 1, 2026-10-28) : `checkpoints` (défaut true).
 * Toise (stretch) : après CHAQUE item (taille tirée ET carte de calcul juste), une suite par-dessus le labo (`chainsOf`) : la taille ·
 * qui est le TOUT · (piège) ce qui décide de l'opération ; la suite du dernier item de la découverte finit par LA RÈGLE (l'ancienne
 * découverte, qui formalise dans `onDone`). Cartes (act1) : une seule suite quand les six textes sont résolus. « أعِد التجربة » remet
 * l'item (`L.retryItem`) ; « إعادة » remet l'item 1. Mode guidé (`guided`) dès qu'une suite est active ; l'enseignant seul coupe les
 * questions pour SON compte. ÉTAPES `LabStepper` (`[data-sb-step=<i>]`) et la fête par item. SON : `tooth` quand la tête monte ou
 * descend (plus grave en bas), `bell` une phrase vraie ou une carte juste, `flag` l'item fini, `over` un refus.
 * Props (contrat fixé avec la leçon) : `story` ('checkup' | 'act1' | 'method29'), `level`, `levels`
 * (false : l'exemple travaillé de M3), `title`, `lead`, `onTrial({ story, item, kind, value, ok, calc? })`
 * à chaque essai VALIDÉ, `onFinished({ story })` à la règle (ou, sans découverte, quand tout est fait) —
 * tous par `state.report`.
 *
 * CONTRAT DOM : [data-story-bars][data-story][data-mode][data-item][data-solved], [data-sb-glance],
 * [data-sb-item-chip=<i>][aria-current], [data-sb-sentence][data-ok], [data-sb-scene], [data-sb-handle]
 * (role=slider), [data-sb-less], [data-sb-more], [data-sb-person=<id>][data-height], [data-sb-diff],
 * [data-sb-ghost][data-ok], [data-sb-calc=<i>][data-value][data-tried] (i canonique : 0 = a + d,
 * 1 = a − d, 2 = d − a), [data-sb-formal-line], [data-sb-next], [data-sb-card=<id>][data-placed],
 * [data-sb-slot=<n>][data-matched][data-tried] (étroit : l'onglet role=tab ; [data-sb-compact], [data-sb-panel=<n>]
 * pour le panneau du texte choisi), [data-sb-verdict], [data-sb-refused=<kind>],
 * [data-sb-formal], [data-lab-fold=story-bars.trials], et la bande `[data-arc-tape][data-tape-closed]`.
 */
const NS = 'manipulation.storyBars';

export default function StoryBars({
  story: story0 = 'checkup', title, lead, level, levels: withLevels = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished, coach: coachOn = true, checkpoints: cpOn = true,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const state = useManipulation({ type: 'story-bars', initialNumbers: { story: story0 }, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const story = state.numbers.story;
  const def = L.storyOf(story);
  const sceneKey = `${story}|${state.epoch}`;
  const [lab, setLab] = useState(() => L.init(story));
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  // « إعادة » (epoch), un autre niveau : TOUT recommence — l'item 1, les essais et les questions du labo
  if (scene.key !== sceneKey) { setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(L.init(story)); }

  const ready = L.discoveryReady(lab);
  const done = L.allDone(lab);
  // les questions pendant le labo : la suite de l'item courant (stretch) ou de la scène (cartes)
  const cpSettings = useLabCheckpointSettings('story-bars');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const chains = cpOn && cpSettings.enabled ? chainsOf(story) : null;
  const taskId = def.mode === 'stretch' ? lab.cur : 'all';
  const chain = chains?.[taskId] ?? null;
  const ruleByCheckpoint = !!chains && def.discovery;
  const cp = useLabCheckpoint({
    id: chain ? `item-${taskId}` : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](story, taskId, k)) : null,
    reached: def.mode === 'stretch' ? L.itemDone(lab, lab.cur) : done,
    resetKey: scene.inits,
    onRetry: () => setLab(L.retryItem),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (chains?.[id.slice(5)]?.includes('rule')) { state.discover(); state.formalize(); } },
  });
  useEffect(() => { if (ready && !ruleByCheckpoint) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son : la tête qui monte ou descend (au plus une note toutes les 35 ms), puis le verdict de chaque essai
  const curH = def.mode === 'stretch' ? lab.items[lab.cur].h : null;
  const prevH = useRef({ h: curH, at: 0 });
  useEffect(() => {
    const p = prevH.current;
    if (curH == null || curH === p.h) { p.h = curH; return; }
    const now = Date.now();
    if (now - p.at > 35) { playSfx('tooth', { pitch: curH > p.h ? 1 : 0.75 }); p.at = now; }
    p.h = curH;
  }, [curH]);
  const lastSeen = useRef(lab.last);
  useEffect(() => {
    const v = lab.last;
    if (v === lastSeen.current) return;
    lastSeen.current = v;
    if (!v) return;
    if (v.kind === 'stretch') playSfx(v.verdict.ok ? 'bell' : 'over');
    else if (v.kind === 'calc') playSfx(v.verdict.ok ? 'flag' : 'over');
    else if (v.kind === 'card') playSfx(!v.ok ? 'over' : L.allDone(lab) ? 'flag' : 'bell');
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps
  // les étapes : un item est FAIT quand sa bande est fermée ET que ses questions sont répondues ; on le fête une fois
  const nItems = def.mode === 'stretch' ? lab.items.length : 1;
  const curIdx = def.mode === 'stretch' ? lab.cur : 0;
  const stepDone = Array.from({ length: nItems }, (_, i) => (def.mode === 'stretch' ? L.itemDone(lab, i) : done) && (i !== curIdx || !cp.blocking));
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();
  const nowDone = stepDone[curIdx];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(curIdx)) return;
    celebrated.current.add(curIdx);
    party.celebrate({ n: def.mode === 'stretch' ? stepDone.filter(Boolean).length : 1, total: nItems });
  }, [nowDone, curIdx]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, { story }); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  // une histoire sans découverte (la méthode p. 29) finit quand tous ses items sont faits
  useEffect(() => { if (!def.discovery && done) state.report(onFinished, { story }); }, [done, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => { if (nTrials > 0) state.report(onTrial, L.trialEvidence(lab, lab.trials.at(-1))); }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── les mots de l'histoire ── */
  const knownName = def.mode === 'stretch' ? k(`stories.${story}.known`) : '';
  const itemWords = (i) => {
    const id = def.items[i].id;
    const o = { d: def.items[i].d };
    return {
      name: k(`stories.${story}.items.${id}.name`),
      sentence: k(`stories.${story}.items.${id}.sentence`, o),
      taller: k(`stories.${story}.items.${id}.taller`),
      shorter: k(`stories.${story}.items.${id}.shorter`),
    };
  };
  const textWords = (i) => ({
    text: k(`stories.act1.texts.${i}.text`),
    p0: k(`stories.act1.texts.${i}.words.p0`),
    p1: k(`stories.act1.texts.${i}.words.p1`),
    whole: k(`stories.act1.texts.${i}.words.whole`),
  });

  /* ── mesure : largeur, écran de leçon, ce qui entoure la scène ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const sceneHRef = useRef(260);
  const [width, setWidth] = useState(320);
  const [overhead, setOverhead] = useState(320);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(240, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(160, Math.ceil(glanceRef.current.getBoundingClientRect().height) - sceneHRef.current));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (glanceRef.current) ro.observe(glanceRef.current);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 640;
  const sceneH = Math.round(Math.max(240, Math.min(480, screenH - overhead - 16)));
  sceneHRef.current = def.mode === 'stretch' ? sceneH : 0;
  const narrow = width < 380;

  /* ── le verdict (une seule ligne, sous la phrase et les cartes) ── */
  const verdict = useMemo(() => {
    const last = lab.last;
    if (!last) return null;
    if (def.mode === 'cards') {
      if (last.kind !== 'card') return null;
      const card = L.cardsOf(story)[last.card];
      const o = { calc: L.calcText(card), value: L.dec(L.calcValue(card)), n: def.items[last.item].n };
      if (last.ok) return { kind: 'ok', ok: true, text: k('v.cardOk', o) };
      return { kind: last.verdict, ok: false, text: k(`stories.act1.texts.${last.item}.wrongWhy`, o) };
    }
    const w = itemWords(last.item);
    switch (last.kind) {
      case 'stretch': {
        const v = last.verdict;
        const o = { name: w.name, known: knownName, h: v.h, d: v.d, diff: v.diff, says: w.sentence, got: v.taller ? w.taller : w.shorter };
        return v.ok ? { kind: 'ok', ok: true, text: k('v.ok', o) } : { kind: v.kind, ok: false, text: k(`v.${v.kind}`, o) };
      }
      case 'locked': return { kind: 'locked', ok: null, text: k('v.locked', { name: w.name }) };
      case 'calcFirst': return { kind: 'calcFirst', ok: null, text: k('v.calcFirst', { name: w.name }) };
      case 'calcDone': return { kind: 'calcDone', ok: null, text: k('v.calcDone') };
      case 'calc': {
        const v = last.verdict;
        const o = { calc: L.calcText(v.calc), value: L.dec(v.value), name: w.name, a: v.calc.a, b: v.calc.b, says: w.sentence, got: v.taller ? w.taller : w.shorter };
        if (v.ok) return { kind: 'ok', ok: true, text: k('v.calcOk', o) };
        return { kind: v.kind, ok: false, text: k(v.kind === 'impossible' ? 'v.calcImpossible' : 'v.calcWrong', o) };
      }
      default: return null;
    }
  }, [lab, story, k]); // eslint-disable-line react-hooks/exhaustive-deps
  const verdictLine = (
    <VerdictBanner
      size="sm"
      tone={verdict?.ok === true ? 'emerald' : verdict?.ok === false ? 'rose' : 'indigo'}
      icon={verdict?.ok === true ? CheckCircle2 : verdict?.ok === false ? XCircle : Info}
      className={`shadow-[0_10px_24px_-14px_rgba(30,27,75,0.5)] ${verdict ? '' : 'hidden'}`}
      data-sb-verdict={verdict?.kind ?? ''} data-sb-refused={verdict?.ok === false ? verdict.kind : undefined}>
      {verdict?.text}
    </VerdictBanner>
  );

  /* ── la découverte : les conjectures fausses réfutées par les items de l'élève ── */
  const discoveryOptions = useMemo(() => {
    if (!def.discovery) return null;
    const word = L.rightCalcOf(story, def.refute.word);
    const big = L.rightCalcOf(story, def.refute.big);
    return [
      { text: k(`stories.${story}.optWord`), why: k(`stories.${story}.whyWord`, word) },
      { text: k('discovery.optRight'), correct: true },
      { text: k('discovery.optBig'), why: k(`stories.${story}.whyBig`, big) },
    ];
  }, [story, k]); // eslint-disable-line react-hooks/exhaustive-deps

  const formal = def.discovery ? (
    <div className="space-y-2" data-sb-formal>
      <ArcTape kind="tape" parts={[{ label: k('formal.part') }, { label: k('formal.part') }]} whole={{ label: k('formal.whole') }}
        ariaLabel={k('tapeAria', { whole: k('formal.whole'), p0: k('formal.part'), p1: k('formal.part') })} maxWidth={320} />
      <p className="text-center text-sm font-extrabold text-indigo-950">{k('formal.lineWhole')}</p>
      <p className="text-center text-sm font-extrabold text-indigo-950">{k('formal.linePart')}</p>
      <p className="text-sm text-emerald-900">{k('formal.rule')}</p>
      <p className="text-xs text-slate-700">
        {k('formal.examples')}{' '}
        {[def.refute.big, def.refute.word].map((i) => (
          <bdi key={i} dir="ltr" className="mx-1 inline-block font-mono font-bold">{L.formalLine(story, i)}</bdi>
        ))}
      </p>
    </div>
  ) : null;

  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'story-bars', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });

  // §17.9 : la leçon peut écrire le contexte (`lead`) pour SES nombres ; sinon celui de l'histoire
  const authoredLead = state.isAuthoredLevel ? lead : null;
  const hintKeys = def.mode === 'stretch' ? 'stretch' : 'cards';
  const currentItem = def.mode === 'stretch' ? def.items[lab.cur].id : (def.items[Math.min(L.firstUndone(lab), def.items.length - 1)].id);

  return (
    <ManipulationShell
      type="story-bars"
      title={title ?? k(`title.${story}`)}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      coach={coachOn ? coach : null}
      hints={[0, 1, 2].map((i) => k(`hints.${hintKeys}.${i}`))}
      guided={!!chain || ruleByCheckpoint}
      headerAction={cpSettings.control}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={def.discovery ? (
        <ManipulationDiscovery state={state} prompt={k('discovery.prompt')} options={discoveryOptions} formal={formal} />
      ) : null}
      explanation={k('explanation')}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/60 to-white">
        <div ref={boxRef} className="space-y-2" data-story-bars data-story={story} data-mode={def.mode} data-item={currentItem}
          data-solved={(def.discovery ? ready : done) ? 'true' : 'false'} data-layout={narrow ? 'narrow' : 'wide'} data-scene-h={def.mode === 'stretch' ? sceneH : undefined}>
          {def.mode === 'stretch' ? (
            <StretchLab lab={lab} setLab={setLab} story={story} def={def} k={k} knownName={knownName} itemWords={itemWords} lead={authoredLead}
              cp={cp} party={party} stepDone={stepDone}
              width={width} sceneH={sceneH} narrow={narrow} glanceRef={glanceRef} verdictLine={verdictLine} />
          ) : (
            <CardsLab lab={lab} setLab={setLab} story={story} def={def} k={k} textWords={textWords} lead={authoredLead} cp={cp} party={party}
              narrow={narrow} compact={width < 520} glanceRef={glanceRef} verdictLine={verdictLine} />
          )}

          {lab.trials.length > 0 && (
            <LabFold id="story-bars.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-sb-trials={lab.trials.length}>
                {lab.trials.map((tr, i) => (
                  <li key={i} className={tr.ok ? 'text-emerald-800' : 'text-rose-800'} data-ok={String(tr.ok)}>
                    {tr.kind === 'stretch' && k('trialStretch', { name: itemWords(tr.item).name, h: tr.value })}
                    {tr.kind === 'calc' && k('trialCalc', { name: itemWords(tr.item).name, calc: tr.calc, value: tr.value })}
                    {tr.kind === 'card' && k('trialCard', { n: def.items[tr.item].n, calc: tr.calc, value: tr.value })}
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

/* ══════════════ مبتدئ / méthode p. 29 : la toise ══════════════ */

/** Les étiquettes de la bande d'un item stretch : « سارة 130 », « الفرق 6 », « أمين 136 » (ou □). */
export function stretchTape(story, i, value, k, knownName, name) {
  const tp = L.tapeOf(story, i, value);
  // fermée, l'inconnue garde son « □ » (comme le manuel p. 29 ; la valeur est écrite dans la ligne « □ = … ») ;
  // ouverte, elle porte la valeur essayée — c'est elle qui ne ferme pas la bande
  const label = (p) => `${p.role === 'known' ? knownName : p.role === 'diff' ? k('diffWord') : name} ${p.unknown && (tp.closed || p.value == null) ? k('unknownBox') : p.value}`;
  return {
    closed: tp.closed,
    fig: {
      kind: 'tape',
      parts: tp.parts.map((p) => ({ label: label(p), value: p.value ?? undefined, unknown: p.unknown })),
      whole: { label: label(tp.whole), value: tp.whole.value ?? undefined, unknown: tp.whole.unknown },
      ariaLabel: k(tp.closed ? 'tapeAria' : 'tapeAriaOpen', { whole: label(tp.whole), p0: label(tp.parts[0]), p1: label(tp.parts[1]) }),
    },
  };
}

function StretchLab({ lab, setLab, story, def, k, knownName, itemWords, width, sceneH, narrow, glanceRef, verdictLine, lead, cp, party, stepDone }) {
  const i = lab.cur;
  const it = lab.items[i];
  const item = def.items[i];
  const w = itemWords(i);
  const firstOpen = L.firstUndone(lab);
  const isDone = L.itemDone(lab, i);
  const triedCalc = new Set(lab.trials.filter((tr) => tr.item === i && tr.kind === 'calc').map((tr) => tr.card));
  const uid = useId().replace(/:/g, '');

  /* la composition : large → la scène et la carte de commande côte à côte ; étroit → la commande en rangée sous la scène */
  const wide = width >= WIDE_MIN;
  const W = wide ? width - SIDE_W - 12 : width;
  const H = sceneH;
  const g = L.gaugeScale(H);
  const rulerX = 6;
  const rulerW = narrow ? 40 : 50;
  const lane = 54;
  const free = W - rulerX - rulerW - lane;
  const knownCx = rulerX + rulerW + free * 0.3;
  const unkCx = rulerX + rulerW + free * 0.75;
  const yKnown = g.yOf(def.known.h);
  const yH = g.yOf(it.h);
  const halfU = kidBox({ cx: unkCx, top: yH, foot: g.floor }).width / 2;
  const halfK = kidBox({ cx: knownCx, top: yKnown, foot: g.floor }).width / 2;
  const diff = Math.abs(it.h - def.known.h);
  const handleX = Math.min(W - 48, unkCx + halfU + 4);
  const gapL = knownCx + halfK;
  const gapR = unkCx - halfU;
  const dimX = (gapL + gapR) / 2 - (narrow ? 0 : 16);
  const pillSize = narrow ? 11 : 14;

  const toValue = useCallback((_cx, cy, rect) => L.gaugeScale(rect.height).cmAt(cy - rect.top), []);
  const st = useStretchInteraction({
    value: it.h, range: { min: L.GAUGE.min, max: L.GAUGE.max }, toValue, direction: 'ltr', pageStep: 5,
    onChange: (v) => setLab((s) => L.setHeight(s, v)),
    onCommit: (v) => setLab((s) => L.commitHeight(s, v)),
  });
  const ticks = L.rulerTicks(g.k);
  const ghost = !it.calcOk && it.ghost && it.ghost.h != null && it.ghost.h >= L.GAUGE.min - 20 && it.ghost.h <= L.VIEW.hi ? it.ghost : null;
  const tape = isDone ? stretchTape(story, i, L.answerOf(story, i), k, knownName, w.name) : null;
  const order = L.calcOrder(story, i);
  const cards = L.calcCards(story, i);
  const lookOf = (id, n) => LOOKS[id] ?? kidLook(n);
  const unkMood = !it.stretchOk ? 'wonder' : it.calcOk ? 'proud' : 'happy';

  const result = tape && (
    <LabCard className="space-y-2.5 p-4" data-sb-result>
      <p className="text-sm font-black text-indigo-900">{k('tapeTitle')}</p>
      <ArcTape {...tape.fig} maxWidth={wide ? SIDE_W - 30 : 300} />
      <p className="whitespace-nowrap text-center text-lg font-black tabular-nums text-indigo-950"><bdi dir="ltr" data-sb-formal-line>{L.formalLine(story, i)}</bdi></p>
      {firstOpen < def.items.length ? (!cp.blocking && (
        <button type="button" onClick={() => setLab(L.next)} data-sb-next
          className="flex min-h-[48px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-600 px-3 text-sm font-black text-white shadow-[0_8px_18px_-8px_rgba(79,70,229,0.9)] outline-none focus-visible:ring-4 focus-visible:ring-indigo-300">
          {k('next')} <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
      )) : (
        <p className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-800" data-sb-all-done>{k('allDone')}</p>
      )}
    </LabCard>
  );

  const stepper = wide && (
    <StepperCard
      layout="card"
      title={k('readingTitle', { name: w.name })}
      value={it.h} unit="cm"
      onLess={() => st.nudge(-1)} onMore={() => st.nudge(1)}
      lessDisabled={it.stretchOk || it.h <= L.GAUGE.min} moreDisabled={it.stretchOk || it.h >= L.GAUGE.max}
      lessLabel={k('less')} moreLabel={k('more')}
      lessProps={{ 'data-sb-less': true }} moreProps={{ 'data-sb-more': true }}
      readoutProps={{ 'data-sb-reading': it.h }}
      hint={k('dragHint', { name: w.name })} hintIcon={Move}
    />
  );

  return (
    <>
    <div ref={glanceRef} className="relative space-y-3" data-sb-glance>
      {party.node}
      {cp.node}
      {/* la consigne : les jalons, la phrase et sa lampe, les trois cartes de calcul */}
      <PromptCard
        size={narrow ? 'md' : 'lg'}
        context={<>{lead || k(`context.${story}`, { known: def.known?.h })}{' '}
          <span className="font-black text-indigo-900" data-sb-sentence data-ok={it.stretchOk ? 'true' : 'false'}>{"«\u00A0"}{w.sentence}{"\u00A0»"}</span></>}
        contextProps={{ 'data-sb-context': story }}
        aside={def.items.length > 1 ? (
          <LabStepper count={def.items.length} current={i} done={stepDone} stepAttr="data-sb-step" />
        ) : null}
        title={k('question.stretch', { name: w.name })}
        titleClassName={narrow ? 'text-base' : 'text-xl'}
        lamp={isDone ? 'on' : 'off'}
        titleProps={{ 'data-sb-question': true }}
      >
        <p className={`font-extrabold ${it.stretchOk ? 'text-indigo-900' : 'text-slate-400'} ${narrow ? 'text-sm' : 'text-base'}`} data-sb-calc-ask>{k('calcAsk', { name: w.name })}</p>
        <ChoiceTray cols={3} dir="ltr" data-sb-calcs>
          {order.map((ci) => {
            const c = cards[ci];
            const tried = triedCalc.has(ci);
            const right = isDone && ci === L.rightCalc(story, i);
            const state = right ? 'right' : tried ? 'tried' : !it.stretchOk ? 'locked' : 'idle';
            return (
              <ChoiceCard key={ci} ltr size={narrow ? 'md' : 'lg'} state={state}
                onClick={() => setLab((s) => L.chooseCalc(s, ci))} disabled={!it.stretchOk || it.calcOk}
                aria-label={k('calcAria', { calc: L.calcText(c) })} data-sb-calc={ci} data-value={L.dec(L.calcValue(c))} data-tried={tried ? 'true' : 'false'}>
                {L.calcText(c)}
              </ChoiceCard>
            );
          })}
        </ChoiceTray>
      </PromptCard>

      <div className={wide ? 'flex items-stretch gap-3' : 'space-y-2.5'}>
        {/* la scène : la toise, les deux enfants EN ENTIER (pieds sur 0), les lectures, la poignée */}
        <StageFrame className="overflow-hidden" style={{ width: W, height: H }} data-sb-scene>
          <svg width={W} height={H} className="absolute inset-0" style={{ direction: 'ltr' }} role="img"
            aria-label={k('gaugeAria', { known: knownName, k: def.known.h, name: w.name, h: it.h })}>
            <defs>
              <linearGradient id={`${uid}-wood`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#FFE8C2" /><stop offset="1" stopColor="#F9D59B" />
              </linearGradient>
              <linearGradient id={`${uid}-floor`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#E3E6FF" /><stop offset="1" stopColor="#EEF0FF" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* le sol */}
            <rect x={0} y={g.floor} width={W} height={H - g.floor} fill={`url(#${uid}-floor)`} />
            <line x1={rulerX + rulerW} x2={W - 6} y1={g.floor} y2={g.floor} stroke="#C7CBF5" strokeWidth={1.5} />
            {/* la toise en bois, de 0 (le sol) à 150 */}
            <rect x={rulerX} y={g.yOf(L.VIEW.hi) - 10} width={rulerW} height={g.floor - g.yOf(L.VIEW.hi) + 10} rx={10} fill={`url(#${uid}-wood)`} stroke="#E8B86A" strokeWidth={1.5} />
            {ticks.map((tk) => (
              <g key={tk.cm}>
                <line x1={rulerX + rulerW - (tk.major ? 13 : tk.mid ? 9 : 5)} x2={rulerX + rulerW - 1} y1={g.yOf(tk.cm)} y2={g.yOf(tk.cm)} stroke="#8A5A1F" strokeWidth={tk.major ? 1.5 : 0.8} />
                {tk.label && tk.cm > 0 && (
                  <text x={rulerX + 5} y={g.yOf(tk.cm) + 4} fontSize={narrow ? 9.5 : 11} fontWeight={800} fill="#6B4416" fontFamily="ui-sans-serif, system-ui, sans-serif">{tk.cm}</text>
                )}
              </g>
            ))}
            <text x={rulerX + rulerW / 2} y={g.floor + 15} textAnchor="middle" fontSize={narrow ? 10 : 12} fontWeight={900} fill="#8A5A1F">cm</text>
            {/* les hauteurs lues sur la toise : pointillés de la toise aux têtes */}
            <line x1={rulerX + rulerW} x2={W - 8} y1={yKnown} y2={yKnown} stroke="#7C6CF2" strokeWidth={1.6} strokeDasharray="6 5" />
            <line x1={rulerX + rulerW} x2={W - 8} y1={yH} y2={yH} stroke="#4F46E5" strokeWidth={1.6} strokeDasharray="6 5" />
            {/* les deux enfants */}
            <KidFigure cx={knownCx} top={yKnown} foot={g.floor} {...lookOf(def.known.id, 0)} mood="happy"
              data-sb-person={def.known.id} data-height={def.known.h} />
            <KidFigure cx={unkCx} top={yH} foot={g.floor} {...lookOf(item.id, i + 1)} mood={unkMood}
              unknown={!it.stretchOk} mark={k('unknownMark')} data-sb-person={item.id} data-height={it.h} />
            {/* la barre de la toise posée sur la tête de l'inconnu */}
            <rect x={unkCx - halfU * 0.55} y={yH - 4} width={halfU * 1.1} height={4} rx={2} fill="#4F46E5" />
            {/* les lectures : une pilule au-dessus de chaque tête */}
            <SvgPill x={knownCx} y={yKnown - 6} pointer="down" text={`${def.known.h} cm`} fill="#7C6CF2" size={pillSize} />
            <SvgPill x={unkCx} y={yH - 8} pointer="down" text={`${it.h} cm`} fill="#4F46E5" size={pillSize} />
            {/* la cote de la différence, vivante (sans signe : le dessin ne dicte pas l'opération) */}
            {diff > 0 && (
              <SvgDimension x={dimX} y1={yKnown} y2={yH} label={ghost ? null : `${diff} cm`} color="#4F46E5" pillFill="#6366F1"
                placement={narrow ? 'above' : 'side'} size={narrow ? 10.5 : 13} data-sb-diff={diff} />
            )}
            {/* la tête fantôme d'une carte de calcul */}
            {ghost && (
              <g data-sb-ghost={ghost.h} data-ok={ghost.ok ? 'true' : 'false'}>
                <ellipse cx={unkCx} cy={g.yOf(ghost.h) + halfU * 0.6} rx={halfU * 0.58} ry={halfU * 0.66} fill="none" stroke={ghost.ok ? '#059669' : '#E11D48'} strokeWidth={2.2} strokeDasharray="5 4" />
                <line x1={unkCx - halfU - 6} x2={unkCx + halfU + 6} y1={g.yOf(ghost.h)} y2={g.yOf(ghost.h)} stroke={ghost.ok ? '#059669' : '#E11D48'} strokeWidth={1.6} strokeDasharray="4 3" />
                <SvgPill x={unkCx - halfU - 8} y={g.yOf(ghost.h)} anchor="end" text={`${ghost.h} cm`} fill={ghost.ok ? '#059669' : '#E11D48'} size={pillSize - 1} />
              </g>
            )}
          </svg>
          {/* les noms sous les pieds */}
          <div className="pointer-events-none absolute inset-x-0" style={{ top: g.floor + 8 }} aria-hidden="true">
            <NamePill className="absolute -translate-x-1/2" style={{ left: knownCx }}>{knownName}</NamePill>
            <NamePill active className="absolute -translate-x-1/2" style={{ left: unkCx }}>{w.name}</NamePill>
          </div>
          {/* le verdict flotte DANS la scène, sur les jambes (jamais sur les têtes ni la toise) : la scène ne saute pas */}
          <div className="absolute z-10" style={{ left: wide ? rulerX + rulerW + 8 : 6, right: wide ? 10 : lane + 2, bottom: H - g.floor + 10 }}>
            {verdictLine}
          </div>
          {/* étroit : les ronds −/+ vivent DANS la scène, dans la voie de la poignée, au-dessus du sol (aucune rangée en plus) */}
          {!wide && (
            <div className="absolute z-10 flex flex-col gap-2" style={{ right: 5, bottom: H - g.floor + 8 }} dir="ltr">
              <RoundButton primary size={44} onClick={() => st.nudge(1)} disabled={it.stretchOk || it.h >= L.GAUGE.max} aria-label={k('more')} data-sb-more>
                <Plus className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
              </RoundButton>
              <RoundButton size={44} onClick={() => st.nudge(-1)} disabled={it.stretchOk || it.h <= L.GAUGE.min} aria-label={k('less')} data-sb-less>
                <Minus className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
              </RoundButton>
            </div>
          )}
          {/* la scène est la PISTE : toucher y pose la tête ; la poignée est à côté de la tête */}
          <div {...st.trackProps} className="absolute inset-0" style={{ ...st.trackProps.style, cursor: it.stretchOk ? 'default' : st.trackProps.style.cursor }}>
            <div {...st.handleProps({ label: k('handle', { name: w.name }), valueText: k('handleValue', { h: it.h }) })}
              aria-orientation="vertical" aria-disabled={it.stretchOk || undefined} data-sb-handle
              className={`absolute flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-white shadow-[0_6px_16px_-6px_rgba(79,70,229,0.8)] outline-none transition-transform focus-visible:ring-4 focus-visible:ring-indigo-300 motion-reduce:transition-none ${it.stretchOk ? 'border-emerald-500' : `border-indigo-600 ${st.dragging ? 'scale-110' : ''}`}`}
              style={{ left: handleX, top: yH, cursor: it.stretchOk ? 'default' : st.dragging ? 'grabbing' : 'grab' }}>
              <ChevronsUpDown className={`h-6 w-6 ${it.stretchOk ? 'text-emerald-600' : 'text-indigo-700'}`} strokeWidth={2.6} aria-hidden="true" />
            </div>
          </div>
        </StageFrame>

        {wide ? (
          <div className="flex shrink-0 flex-col gap-3" style={{ width: SIDE_W }}>
            {result || stepper}
          </div>
        ) : null}
      </div>
    </div>
    {/* étroit : le résultat vient APRÈS le bloc « d'un seul regard » — il ne rétrécit pas la scène */}
    {!wide && result}
    </>
  );
}

/** L'apparence de chaque personne des histoires (stable : deux élèves voient la même scène). Les filles portent le hijab
 *  et la tenue islamique (demande du propriétaire, 2026-10-14). */
const LOOKS = {
  sara: { hairStyle: 'hijab', scarf: 'rose', outfit: 'pink', skin: 'light' },
  amine: { hairStyle: 'short', outfit: 'blue', skin: 'wheat', hair: 'black' },
  rim: { hairStyle: 'hijab', scarf: 'lavender', outfit: 'violet', skin: 'wheat' },
  nazim: { hairStyle: 'curly', outfit: 'green', skin: 'brown', hair: 'black' },
  yassine: { hairStyle: 'short', outfit: 'orange', skin: 'light', hair: 'brown' },
  akram: { hairStyle: 'short', outfit: 'teal', skin: 'wheat', hair: 'black' },
  younes: { hairStyle: 'curly', outfit: 'blue', skin: 'brown', hair: 'black' },
  mohamed: { hairStyle: 'short', outfit: 'red', skin: 'light', hair: 'chestnut' },
};
const WIDE_MIN = 600;
const SIDE_W = 240;

/* ══════════════ متقدم : نشاط 1 — six cartes, six textes ══════════════ */

/** La bande d'un texte de نشاط 1 pour la carte c (posée ou essayée) : sa valeur à la place de l'inconnue. */
export function cardTape(story, tIdx, c, k, words) {
  const tp = L.tapeOf(story, tIdx, L.calcValue(L.cardsOf(story)[c]));
  const label = (p) => `${words[p.role]} ${p.unknown && tp.closed ? k('unknownBox') : p.value}`;
  return {
    kind: 'tape',
    parts: tp.parts.map((p) => ({ label: label(p), value: p.value, unknown: p.unknown })),
    whole: { label: label(tp.whole), value: tp.whole.value, unknown: tp.whole.unknown },
    ariaLabel: k(tp.closed ? 'tapeAria' : 'tapeAriaOpen', { whole: label(tp.whole), p0: label(tp.parts[0]), p1: label(tp.parts[1]) }),
  };
}

function CardsLab({ lab, setLab, story, def, k, textWords, narrow, compact, glanceRef, verdictLine, lead, cp, party }) {
  const cards = L.cardsOf(story);
  // ÉTROIT (< 520 px, téléphone) : un texte à la fois — le sélecteur ①–⑥ (tablist) ; chaque onglet est AUSSI la zone
  // d'accueil de son texte, et le panneau du texte choisi en est une seconde (même zone) pour le glisser.
  const [sel, setSel] = useState(0);
  const drag = useDragInteraction({
    accepts: (src, zone) => {
      if (!src.startsWith('card:') || !zone.startsWith('text:')) return '';
      return L.canPlace(lab, Number(src.slice(5)), Number(zone.slice(5)));
    },
    onDrop: (src, zone) => { setSel(Number(zone.slice(5))); setLab((s) => L.placeCard(s, Number(src.slice(5)), Number(zone.slice(5)))); },
    onReject: (src, zone, reason) => {
      if (reason && src.startsWith('card:') && zone.startsWith('text:')) {
        setSel(Number(zone.slice(5)));
        setLab((s) => L.placeCard(s, Number(src.slice(5)), Number(zone.slice(5))));
      }
    },
  });
  const tabsRef = useRef(null);
  const onTabKey = (e, tIdx) => {
    const n = def.items.length;
    // RTL : ← va vers l'onglet suivant (dessiné à gauche)
    const to = { ArrowLeft: tIdx + 1, ArrowRight: tIdx - 1, Home: 0, End: n - 1 }[e.key];
    if (to === undefined) { drag.zoneProps(`text:${tIdx}`).onKeyDown(e); return; }
    e.preventDefault();
    const j = (to + n) % n;
    setSel(j);
    tabsRef.current?.querySelector(`[data-sb-slot="${def.items[j].n}"]`)?.focus();
  };
  const heldCard = String(drag.held ?? '').startsWith('card:') ? Number(String(drag.held).slice(5)) : null;
  const slotOf = (c) => lab.slots.findIndex((sl) => sl.matched === c);

  const tapeFor = (tIdx, c) => cardTape(story, tIdx, c, k, textWords(tIdx));
  const matchedCount = lab.slots.filter((sl) => sl.matched != null).length;

  return (
    <div ref={glanceRef} className="relative space-y-3" data-sb-glance>
      {party.node}
      {cp.node}
      {/* la consigne et les six cartes de calcul (au-dessus des textes) */}
      <PromptCard
        size={narrow ? 'md' : 'lg'}
        context={lead || k('context.cards', { count: def.items.length })}
        contextProps={{ 'data-sb-context': story }}
        title={k('question.cards', { count: def.items.length })}
        titleClassName={narrow ? 'text-base' : 'text-xl'}
        lamp={matchedCount === def.items.length ? 'on' : 'off'}
        aside={(
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-800" data-sb-progress={matchedCount}>
            <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />{k('solvedLabel')}
            <bdi dir="ltr">{matchedCount}{'\u00A0/\u00A0'}{def.items.length}</bdi>
          </span>
        )}
        data-sb-cards
      >
        <ChoiceTray cols={compact ? 2 : 3} dir="ltr">
          {cards.map((c, ci) => {
            const placed = L.isPlaced(lab, ci);
            const sp = drag.sourceProps(`card:${ci}`, { disabled: placed });
            const calc = L.calcText(c);
            return (
              <ChoiceCard key={ci} {...sp} disabled={placed} size={narrow ? 'sm' : 'md'} ltr state={placed ? 'right' : drag.held === `card:${ci}` ? 'selected' : 'idle'}
                aria-label={placed ? k('cardPlacedAria', { calc, n: def.items[slotOf(ci)].n }) : k('cardAria', { calc })}
                data-sb-card={ci} data-placed={placed ? 'true' : 'false'}
                className={`sa-manip-object select-none ${placed ? 'opacity-60' : ''} ${drag.held === `card:${ci}` ? 'scale-105' : ''} ${drag.rejected === `card:${ci}` ? 'sa-manip-reject ring-2 ring-rose-400' : ''}`}
                style={sp.style}>
                {calc}
              </ChoiceCard>
            );
          })}
        </ChoiceTray>
      </PromptCard>

      {verdictLine}

      {compact ? (
        <div className="space-y-1.5" data-sb-texts data-sb-compact>
          <div ref={tabsRef} role="tablist" aria-label={k('textsTitle')} className="grid grid-cols-6 gap-1">
            {def.items.map((it, tIdx) => {
              const sl = lab.slots[tIdx];
              const zp = drag.zoneProps(`text:${tIdx}`, { disabled: sl.matched != null });
              const active = zp['data-drop-active'] === 'true';
              const invalid = zp['data-drop-invalid'] === 'true';
              const readyZone = zp['data-drop-ready'] === 'true';
              const matched = sl.matched != null;
              return (
                <button key={it.id} type="button" role="tab" {...zp} id={`sb-tab-${tIdx}`}
                  aria-selected={sel === tIdx} tabIndex={sel === tIdx ? 0 : -1}
                  aria-label={matched ? k('slotDoneAria', { n: it.n, calc: L.calcText(cards[sl.matched]) }) : k('slotAria', { n: it.n, text: textWords(tIdx).text })}
                  onClick={(e) => { zp.onClick(e); setSel(tIdx); }} onKeyDown={(e) => onTabKey(e, tIdx)}
                  data-sb-slot={it.n} data-matched={matched ? 'true' : 'false'} data-tried={sl.tried != null ? String(sl.tried) : undefined}
                  className={`relative inline-flex min-h-[44px] items-center justify-center gap-0.5 rounded-xl border-2 text-sm font-extrabold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    active ? 'border-indigo-500 bg-indigo-100 ring-2 ring-indigo-300' : invalid ? 'border-rose-400 bg-rose-50' : sel === tIdx ? 'border-indigo-600 bg-indigo-600 text-white' : matched ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : readyZone ? 'border-indigo-400 bg-indigo-50 text-indigo-900' : sl.tried != null ? 'border-rose-300 bg-white text-rose-800' : 'border-slate-300 bg-white text-slate-700'}`}>
                  {it.n}{matched && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
          {(() => {
            const tIdx = sel;
            const it = def.items[tIdx];
            const sl = lab.slots[tIdx];
            const shown = sl.matched ?? sl.tried;
            return (
              <DropZone drag={drag} id={`text:${tIdx}`} tone={sl.matched != null ? 'emerald' : 'indigo'} minHeight="min-h-[64px]"
                disabled={sl.matched != null} label={k('slotAria', { n: it.n, text: textWords(tIdx).text })}
                className={`p-2 ${sl.matched != null ? 'border-emerald-400 bg-emerald-50/60' : ''}`}
                role="tabpanel" aria-labelledby={`sb-tab-${tIdx}`} data-sb-panel={it.n} data-panel-matched={sl.matched != null ? 'true' : 'false'}>
                <p className="text-sm leading-snug text-slate-800">
                  <span className="me-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-indigo-500 to-indigo-600 align-middle text-xs font-black text-white">{it.n}</span>
                  {textWords(tIdx).text}
                </p>
                {shown != null && (
                  <div className="mt-1 space-y-0.5">
                    <p className={`text-xs font-bold ${sl.matched != null ? 'text-emerald-800' : 'text-rose-800'}`}>
                      {sl.matched == null && <span>{k('slotTried')} </span>}
                      <bdi dir="ltr" className="font-mono">{`${L.calcText(cards[shown])} = ${L.dec(L.calcValue(cards[shown]))}`}</bdi>
                    </p>
                    <ArcTape {...tapeFor(tIdx, shown)} maxWidth={300} />
                  </div>
                )}
              </DropZone>
            );
          })()}
        </div>
      ) : (
      /* les six textes du manuel : chacun est une zone d'accueil */
      <div className="grid grid-cols-2 gap-2.5" data-sb-texts>
        {def.items.map((it, tIdx) => {
          const sl = lab.slots[tIdx];
          const words = textWords(tIdx);
          const shown = sl.matched ?? sl.tried;
          const fig = shown != null ? tapeFor(tIdx, shown) : null;
          return (
            <DropZone key={it.id} drag={drag} id={`text:${tIdx}`} tone={sl.matched != null ? 'emerald' : 'indigo'} minHeight="min-h-[64px]"
              disabled={sl.matched != null}
              label={sl.matched != null ? k('slotDoneAria', { n: it.n, calc: L.calcText(cards[sl.matched]) }) : k('slotAria', { n: it.n, text: words.text })}
              className={`rounded-2xl bg-white p-2.5 ${sl.matched != null ? 'border-emerald-400 bg-emerald-50/70' : ''}`}
              data-sb-slot={it.n} data-matched={sl.matched != null ? 'true' : 'false'} data-tried={sl.tried != null ? String(sl.tried) : undefined}>
              <p className={`${narrow ? 'text-xs' : 'text-sm'} font-semibold leading-relaxed text-slate-800`}>
                <span className="me-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-indigo-500 to-indigo-600 align-middle text-xs font-black text-white">{it.n}</span>
                {words.text}
              </p>
              {shown != null && (
                <div className="mt-1 space-y-0.5">
                  <p className={`text-[11px] font-bold ${sl.matched != null ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {sl.matched == null && <span>{k('slotTried')} </span>}
                    <bdi dir="ltr" className="font-mono">{`${L.calcText(cards[shown])} = ${L.dec(L.calcValue(cards[shown]))}`}</bdi>
                  </p>
                  <ArcTape {...fig} maxWidth={narrow ? 170 : 260} />
                </div>
              )}
            </DropZone>
          );
        })}
      </div>
      )}

      <DragGhost ghost={drag.ghost}>
        {heldCard != null && (
          <span className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-indigo-500 bg-white px-3 font-mono text-sm font-bold text-indigo-950" dir="ltr">{L.calcText(cards[heldCard])}</span>
        )}
      </DragGhost>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de chaque item (stretch) — ou de la scène (`all`, cartes) ; `rule` clôt le dernier item de la découverte. */
export const CHAINS = Object.freeze({ item: ['height', 'whole'], trap: ['height', 'whole', 'word'], all: ['plusCount', 'trapText'] });

export function chainsOf(story) {
  const def = L.storyOf(story);
  if (def.mode !== 'stretch') return { all: [...CHAINS.all, ...(def.discovery ? ['rule'] : [])] };
  const last = def.discovery ? Math.max(...def.discoveryItems) : -1;
  const out = {};
  def.items.forEach((it, i) => { out[i] = [...(it.trap ? CHAINS.trap : CHAINS.item), ...(i === last ? ['rule'] : [])]; });
  return out;
}

const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const C = (k, key, o) => k(`cp.${key}`, o);
const pick = (list, right, whys) => list.map((text, i) => (i === right ? { text, correct: true } : { text, why: whys[i] }));

function ruleQuestion(story, k) {
  const def = L.storyOf(story);
  const word = L.rightCalcOf(story, def.refute.word);
  const big = L.rightCalcOf(story, def.refute.big);
  return {
    id: 'rule', kind: 'choice', prompt: k('discovery.prompt'),
    options: [
      { text: k(`stories.${story}.optWord`), why: k(`stories.${story}.whyWord`, word) },
      { text: k('discovery.optRight'), correct: true },
      { text: k('discovery.optBig'), why: k(`stories.${story}.whyBig`, big) },
    ],
    hints: [C(k, 'rule.hint1'), C(k, 'rule.hint2')],
    explain: (
      <div className="space-y-1">
        <p className="font-extrabold">{k('formal.lineWhole')} · {k('formal.linePart')}</p>
        <p>{k('formal.rule')}</p>
      </div>
    ),
  };
}

/** Les mots d'un item stretch, ses nombres (rien en dur). */
function itemO(story, i, k) {
  const def = L.storyOf(story);
  const it = def.items[i];
  const r = L.rightCalcOf(story, i);
  return {
    name: k(`stories.${story}.items.${it.id}.name`), known: k(`stories.${story}.known`), k: iso(def.known.h), d: iso(it.d),
    h: iso(L.dec(L.answerOf(story, i))), calc: iso(`${r.calc} = ${r.value}`), line: iso(L.formalLine(story, i)),
    sentence: k(`stories.${story}.items.${it.id}.sentence`, { d: it.d }), word: C(k, it.sign > 0 ? 'word.less' : 'word.more'),
  };
}

export const QUESTIONS = {
  height: (story, i, k) => {
    const o = itemO(story, i, k);
    const v = L.dec(L.answerOf(story, i));
    return {
      id: 'height', kind: 'number', expected: v.replace(',', '.'), answer: <bdi dir="ltr">{v} cm</bdi>,
      prompt: C(k, 'height.prompt', o), hints: [C(k, 'height.hint1', o), C(k, 'height.hint2', o)], explain: C(k, 'height.explain', o),
    };
  },
  whole: (story, i, k) => {
    const o = itemO(story, i, k);
    const right = L.unknownIsWhole(story, i) ? 0 : 1;
    return {
      id: 'whole', kind: 'choice', prompt: C(k, 'whole.prompt', o),
      options: pick([o.name, o.known, C(k, 'whole.diff', o)], right,
        [right === 1 ? C(k, 'whole.whyUnknown', o) : null, right === 0 ? C(k, 'whole.whyKnown', o) : null, C(k, 'whole.whyDiff', o)]),
      hints: [C(k, 'whole.hint1', o), C(k, 'whole.hint2', o)],
      explain: C(k, right === 0 ? 'whole.explainUnknown' : 'whole.explainKnown', o),
    };
  },
  word: (story, i, k) => {
    const o = itemO(story, i, k);
    return {
      id: 'word', kind: 'choice', prompt: C(k, 'word.prompt', o),
      options: pick([C(k, 'word.right'), C(k, 'word.theWord', o), C(k, 'word.big')], 0, [null, C(k, 'word.whyWord', o), C(k, 'word.whyBig', o)]),
      hints: [C(k, 'word.hint1', o), C(k, 'word.hint2', o)], explain: C(k, 'word.explain', o),
    };
  },
  plusCount: (story, i, k) => {
    const def = L.storyOf(story);
    const plus = def.items.filter((_, j) => L.unknownIsWhole(story, j));
    const o = { n: iso(plus.length), list: iso(plus.map((it) => it.n).join(' · ')), total: iso(def.items.length) };
    return {
      id: 'plusCount', kind: 'number', expected: String(plus.length), answer: <bdi dir="ltr">{plus.length}</bdi>,
      prompt: C(k, 'plusCount.prompt', o), hints: [C(k, 'plusCount.hint1'), C(k, 'plusCount.hint2')], explain: C(k, 'plusCount.explain', o),
    };
  },
  trapText: (story, i, k) => {
    const def = L.storyOf(story);
    const j = def.refute.word;
    const r = L.rightCalcOf(story, j);
    const o = { n: iso(def.items[j].n), calc: iso(`${r.calc} = ${r.value}`) };
    return {
      id: 'trapText', kind: 'choice', prompt: C(k, 'trapText.prompt', o),
      options: pick([C(k, 'trapText.part'), C(k, 'trapText.whole'), C(k, 'trapText.word')], 0, [null, C(k, 'trapText.whyWhole', o), C(k, 'trapText.whyWord', o)]),
      hints: [C(k, 'trapText.hint1', o), C(k, 'trapText.hint2')], explain: C(k, 'trapText.explain', o),
    };
  },
  rule: (story, i, k) => ruleQuestion(story, k),
};
