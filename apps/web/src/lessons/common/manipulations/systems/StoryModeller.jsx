import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { CheckCircle2, ArrowLeft, ArrowRight, X as XIcon, ChevronDown, PlayCircle } from 'lucide-react';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useDragInteraction from '../useDragInteraction';
import DraggableObject from '../primitives/DraggableObject';
import DropZone from '../primitives/DropZone';
import LabFold from '../primitives/LabFold';
import MovablePanel from '../primitives/MovablePanel';
import MathText from '../../components/MathText';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { bidi } from '../../../../utils/bidi';
import * as L from '../logic/storyModeller';
import { useInMissionPlayer } from '../../mission/missionPlayerContext';
import StoryModellerPlayer from './StoryModellerPlayer';

/**
 * story-modeller — DE L'HISTOIRE À LA JUMLA (unité 5 « جمل معادلتين من الدرجة الأولى بمجهولين »,
 * leçon « حل مشكلات بتوظيف جمل معادلتين » ; RÉUTILISÉ par la synthèse « أدمج تعلّماتي »).
 *
 * ── CONTRAT DES PROPS (contraignant : la synthèse code contre lui ; on n'ajoute que de l'optionnel) ──
 *   <Manipulation type="story-modeller"
 *     system="x+y=140|300x+150y=30300"     la jumla CIBLE, coefficients tels que l'histoire les donne
 *                                         (a·x + b·y = c, une équation par information, dans l'ordre)
 *     theme="museum" | "stadium" | "party" le monde dessiné (tourniquets / gradins / table de fête)
 *     unknowns={[{ id: 'x', noun: 'عدد البالغين' }, { id: 'y', noun: 'عدد الصغار' }]}
 *                                         l'id est la variable de `system` ET la lettre que l'élève porte
 *     named={false}                       true : les lettres déjà posées (on ouvre sur la traduction)
 *     facts={[{ quote: 'استقبل المتحف 140 زائرا', kind: 'count' }, { quote: '…', kind: 'money' }]}
 *                                         une par équation, dans l'ordre ; `kind` = 'count' (on compte
 *                                         des personnes / des objets : chacun compte une fois, et les
 *                                         inconnues sont des entiers ≥ 0) | 'money' (on additionne des
 *                                         prix) | autre (refus génériques). Rien n'impose « count = (1) » :
 *                                         la fête a deux informations 'money'.
 *     chips={[{ value: '140', label: 'زائرا' }, …]}  les nombres que l'élève porte (avec le mot de
 *                                         l'histoire) ; RÉUTILISABLES. Le type ajoute toujours le jeton
 *                                         « 1 » (« كل واحد يُعدّ مرة ») : le coefficient 1 de x + y se
 *                                         PORTE — une case vide n'est jamais lue comme 1 (« incomplete »).
 *     story="…"                           (optionnel) l'énoncé entier, montré au-dessus
 *     answer={{ options: ['…', '…', '…'], correct: 0 }}   la phrase de réponse (étape 5)
 *     startWith="model" | "solve"         « solve » : le modèle déjà posé (étapes 3 à 5 seulement)
 *     onModel={({ system, tex, unknowns }) => …}  la jumla de l'élève vérifiée (« x+y=140|300x+150y=30300 »)
 *                                         et ses lettres [{ letter, noun }] (champ ajouté, optionnel à lire)
 *     onSolved={({ x, y, method }) => …}  la ثنائية trouvée — x et y = valeurs des inconnues
 *                                         `unknowns[0]` et `unknowns[1]` (même si l'élève a nommé à
 *                                         l'envers), en texte exact (« 62 », « 14/5 »)
 *     onTrial={(t) => …}                  chaque essai : { stage: 'model', ok, rows } (un « تحقّق »)
 *                                         ou { stage: 'verify', ok, values } (une histoire rejouée)
 *     onFinished={({ x, y }) => …}        la phase formelle (le tableau du manuel) atteinte
 *     title, lead, mission, level, levels={false} />          (communs à tous les types)
 *   Tous les rappels passent par `state.report` : ils ne partent que du niveau de la leçon.
 *   Props absentes : celles de l'histoire intégrée du thème (lesson.json › storyModeller.themes) —
 *   c'est aussi ce que raconte l'AUTRE niveau d'une manipulation posée seule (levels.js : stadium /
 *   museum). La synthèse : theme="party", system="150x+150y=11250|24x+30y=2100", deux faits 'money'.
 *
 * ── QUESTIONS PENDANT LE LABO (2026-10-28, `primitives/LabCheckpoint`, `checkpoints` défaut true) ──
 *   Une étape `LabStepper` PAR ÉTAPE du labo (المجاهيل, الترجمة, الحل, التحقق, الإجابة ; quatre sans la première quand les inconnues sont déjà nommées, trois avec startWith="solve") ; quand son
 *   objectif est atteint, une suite de questions sur ce que l'élève vient de faire s'ouvre PAR-DESSUS le labo et retient le bouton qui
 *   passe à l'étape suivante (« إلى الترجمة »…) : name — pourquoi ces inconnues, combien d'équations ; model — ce que l'équation mesure
 *   (personnes ou DA), pourquoi les deux nombres ne s'échangent pas ; solve — les deux valeurs calculées ; verify — la valeur d'une
 *   information, quelle information contredit les valeurs échangées ; answer — pourquoi une phrase, puis la RÈGLE (l'ancienne découverte).
 *   Tout est construit sur la jumla et les valeurs de l'élève (`CHAINS`, `QUESTIONS`, `chainOf`, `makeCtx` exportés). `onCheckpoint(ev)` reçoit
 *   les événements `checkpoint` / `checkpoint-done` (trace des modules) ; `onTrial` ne reçoit que les essais du modèle et du rejeu.
 *
 * ── LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1) ─────────────────────────────────────────────
 * A. L'élève PORTE les lettres sur les noms de l'histoire, puis les NOMBRES de l'histoire dans les
 *    cases □x + □y = □ (un rang par information) ; il choisit une méthode ; il porte les deux
 *    valeurs trouvées sur les éléments de l'histoire (tourniquets, étiquettes) et la REJOUE.
 * B. Idée : résoudre un problème par une jumla — les cinq étapes du tableau du manuel (نشاط 3).
 * C. Chaque information se traduit sous sa citation ; « تحقّق » relit l'équation dans les mots de
 *    l'histoire ; les lignes de la résolution apparaissent une à une ; les tourniquets comptent
 *    les personnes, la caisse les dinars.
 * D. La jumla { x + y = 140 ; 300x + 150y = 30300 }, sa résolution, (62 ; 78), la vérification
 *    62 + 78 = 140 et 300 × 62 + 150 × 78 = 30 300, la phrase « زار المتحف 62 بالغا و 78 صغيرا ».
 * E. À découvrir : une ثنائية n'est une réponse que lorsque l'HISTOIRE se vérifie avec elle et
 *    qu'elle est rendue en phrase — la jumla n'est que notre traduction.
 *
 * ── FICHE (MANIPULATION_DNA §7) ───────────────────────────────────────────────────────────────
 *   CONCEPT        ترييض بجملة معادلتين : choisir, traduire, résoudre, vérifier, répondre
 *   OBJECT         les noms et les nombres de l'histoire ; les tourniquets / étiquettes du monde
 *   VARIABLE       quel nombre va dans quelle case (le MODÈLE) ; quelle valeur va à quel élément
 *   INVARIANT      les nombres de l'histoire (jetons réutilisables) ; une équation = une information
 *   TRANSFORMATION l'équation s'écrit sous la citation à chaque nombre posé ; l'histoire se recompte
 *   CONSTRAINT     une donnée connue n'est pas une inconnue ; une case vide n'est pas 1 ; la suite de
 *                  la résolution est fermée tant que l'élève croit avoir fini avec une seule inconnue
 *   RESISTANCE     « تحقّق » refuse dans les mots de l'histoire (« 300 DA ثمن لا عدد : في هذه
 *                  المعلومة يُحسب كل واحد مرة واحدة ») ; l'histoire rejouée avec les valeurs
 *                  échangées garde 140 visiteurs mais la caisse affiche 32 700 DA
 *   EVIDENCE       les deux informations recomptées ✓ ; la foule dessinée par tourniquet
 *   CONTRAST       un modèle refusé / accepté ; un ordre refusé / accepté au rejeu (l'information qui
 *                  COMPTE ne distingue pas les deux ordres, celle qui PAIE les distingue)
 *   PREDICTION     avant « تحقّق », la lecture « معادلتك تقول… » est disponible au premier refus
 *   DISCOVERY      « on a résolu quand l'histoire elle-même se vérifie et qu'on répond par une phrase »
 *   FORMALIZATION  le tableau du manuel (مراحل الحل) rempli avec le travail de l'élève
 *   TRANSFER       le تحدّ (37 pièces, 610 DA) et أبو كامل (module 2), ex. 14 → 28, la fête (synthèse)
 *
 * AUTO-COMPLÉTION : MANUELLE (§6bis) — chaque nombre posé est une décision de modélisation.
 *
 * ÉTAPES ENCHAÎNÉES (§7quater) : chaque passage est le geste de l'élève (un bouton qui dit ce qui
 * vient), avec un retour (« العودة إلى الترجمة ») qui garde les cases ; jamais un seuil caché.
 *
 * DÉCOR (exigence du propriétaire) : stade — une écharpe qu'on agite dans les gradins ; musée — la
 * lampe du hall qui s'allume ; fête — des ballons qui dansent. `aria-hidden`, `tabIndex={-1}`,
 * jamais un état du laboratoire, immobile sous `prefers-reduced-motion`.
 *
 * TOUT TIENT DANS UN ÉCRAN (règle du propriétaire, 2026-10-01 — « d'un seul regard ») : à chaque étape,
 * ce qu'on porte, ce qui le reçoit, le bouton qui juge et le verdict tiennent ensemble dans une fenêtre
 * (moins la barre de l'application, 64 px) à 1280×800, 1366×768, 390×844 et 320×640, pour les TROIS
 * mondes — mesuré au navigateur (Playwright, boîtes englobantes de `[data-sm-core]`, + l'énoncé à
 * l'étape 1, + le panneau mobile) le 2026-10-01 : 112/112 sur un banc isolé, 72/72 dans la leçon (où
 * le laboratoire ne dispose que de 182 px de large à 320 px). Comment : une seule rangée d'étapes ;
 * l'énoncé dans un `LabFold` (« إخفاء / إظهار », secondaire dès l'étape 2 : ses informations sont
 * citées dans les rangs) ; « تحقّق » et « إلى الحل » DANS la réserve des nombres ; la raison du refus
 * DANS le rang refusé (la lecture « معادلتك تقول… » à partir de 640 px) ; la jumla et les méthodes
 * sur une rangée ; « أعد القصة » à côté des valeurs ; le verdict de la caisse dans un `MovablePanel`
 * qui flotte SUR la scène rejouée (l'élève le déplace ; il s'efface quand une valeur est en main) ;
 * la foule en grille presque carrée (⌈√n⌉ colonnes) dans une image de hauteur fixe ; les retours
 * (« العودة إلى … ») sous l'instrument.
 *
 * CONTRAT DOM (e2e) :
 *   [data-story-modeller][data-theme][data-stage=name|model|solve|verify|answer]
 *   [data-sm-noun=<id>|known:<chip>] (zones des noms)  [data-drag-source="unk:<lettre>"]
 *   [data-drag-source="chip:<c0…|one>"]  [data-drop-zone="slot:<1|2>:<a|b|c>"]  [data-sm-check]
 *   [data-sm-verdict=ok|ko] [data-sm-row=<n>][data-ok][data-reason]  [data-sm-open=model|solve|verify|answer]
 *   [data-sm-back]  [data-sm-method=sub|add][aria-pressed]  [data-sm-line=<i>]  [data-sm-next]
 *   [data-sm-half=done|more]  [data-drag-source="val:<lettre>"]  [data-drop-zone="gate:<id>"]
 *   [data-sm-replay-go]  [data-sm-replay][data-ok]  [data-sm-crowd=<id>][data-count]
 *   [data-sm-answer] [data-sm-option=<i>][aria-pressed]  [data-sm-formal]  [data-deco]
 *   [data-sm-core] (l'instrument de l'étape, mesuré)  [data-sm-story] > [data-lab-fold="story-modeller.story"]
 *   [data-sm-reason-row=<n>] > [data-sm-reason]  [data-sm-scene] > [data-movable-panel="story-modeller.replay"]
 *   (le verdict accepté remplace [data-sm-check] par [data-sm-open="solve"] dans la réserve)
 */

const LETTER_COLORS = ['#2563EB', '#E11D48'];

/**
 * LECTEUR DE MISSION (rollout 2026-11-12, unité 5 leçon 3 `mushkilat-jumla` ; verdict X7) : dans le lecteur le labo est `StoryModellerPlayer`
 * (manches, questions sur ce que l'élève FAIT, prédictions, guide, aucune barre de défilement) ; partout ailleurs (page, enseignant, mode classe,
 * la synthèse `wadiya-idmajiya-jumal`) c'est la page ci-dessous, INCHANGÉE.
 */
export default function StoryModeller(props) {
  const inPlayer = useInMissionPlayer();
  return inPlayer ? <StoryModellerPlayer {...props} /> : <StoryModellerPage {...props} />;
}

function StoryModellerPage({
  system: system0, theme = 'museum', unknowns, named = false, facts, chips, story, answer, startWith = 'model',
  title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false,
  onModel, onSolved, onTrial, onCheckpoint, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.storyModeller.${key}`, o), [t]);
  const authoredSystem = system0 ?? L.THEME_SYSTEMS[theme] ?? L.THEME_SYSTEMS.museum;
  const state = useManipulation({ type: 'story-modeller', initialNumbers: { system: authoredSystem }, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { system } = state.numbers;

  // L'histoire racontée : celle de la leçon sur SON niveau, l'histoire intégrée du préréglage sinon.
  const own = state.isAuthoredLevel && system === authoredSystem;
  const themeId = own ? theme : (state.levelPreset?.theme ?? theme);
  const builtin = useMemo(() => {
    const b = t(`manipulation.storyModeller.themes.${themeId}`, { returnObjects: true });
    return b && typeof b === 'object' ? b : {};
  }, [t, themeId]);
  const def = useMemo(() => {
    const bUnknowns = (builtin.unknowns ?? []).map((noun, i) => ({ id: ['x', 'y'][i], noun }));
    if (!own) {
      return { unknowns: bUnknowns, facts: builtin.facts ?? [], chips: builtin.chips ?? [], story: builtin.story, answer: builtin.answer, named: state.levelPreset?.named ?? false, startWith: 'model' };
    }
    return {
      unknowns: unknowns ?? bUnknowns, facts: facts ?? builtin.facts ?? [], chips: chips ?? builtin.chips ?? [],
      story: story ?? (unknowns || facts ? undefined : builtin.story), answer: answer ?? builtin.answer, named, startWith,
    };
  }, [own, builtin, unknowns, facts, chips, story, answer, named, startWith, state.levelPreset]);

  const model = useMemo(() => L.parseModel({ system, unknowns: def.unknowns, facts: def.facts, chips: def.chips }), [system, def]);
  const ids = model.ids;

  const sceneKey = `${system}|${state.epoch}|${own}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [lab, setLab] = useState(() => L.init(model, def));
  const [notice, setNotice] = useState(null);
  const [doneStages, setDoneStages] = useState([]);
  if (scene.key !== sceneKey) {
    // « إعادة », un autre niveau ou une autre histoire : TOUT recommence — les cases, les étapes et les questions du labo
    setScene({ key: sceneKey, inits: scene.inits + 1 });
    setLab(L.init(model, def)); setNotice(null); setDoneStages([]);
  }

  /* ── les mots ── */
  const nounOf = (id) => def.unknowns.find((u) => u.id === id)?.noun ?? id;
  const unknownOfLetter = (letter) => ids.find((id) => lab.naming[id] === letter);
  const nounOfLetter = (letter) => nounOf(unknownOfLetter(letter));
  const chipMeta = (key) => {
    if (key === L.ONE) return { v: '1', label: k('oneLabel') };
    const i = Number(String(key).slice(1));
    return { v: L.numberText(model.chips[i].value), label: def.chips[i]?.label ?? '' };
  };
  const quote = (row) => def.facts[row - 1]?.quote ?? '';

  const sceneRef = useRef(null);
  // la hauteur du panneau de la caisse : la scène s'agrandit pour le contenir ENTIER (MovablePanel le
  // borne dans la scène ; plus haut qu'elle, il déborderait sur les valeurs à porter)
  const [panelH, setPanelH] = useState(0);
  const panelObserver = useRef(null);
  const panelRef = useCallback((el) => {
    panelObserver.current?.disconnect();
    if (!el) { setPanelH(0); return; }
    const measure = () => setPanelH(el.getBoundingClientRect().height);
    measure();
    if (typeof ResizeObserver !== 'undefined') { panelObserver.current = new ResizeObserver(measure); panelObserver.current.observe(el); }
  }, []);

  /* ── la résolution ── */
  const solving = lab.stage === 'solve' || lab.stage === 'verify' || lab.stage === 'answer';
  const sys = useMemo(() => (solving ? L.studentSystem(lab, model) : null), [solving, lab.slots, model]); // eslint-disable-line react-hooks/exhaustive-deps
  const plan = useMemo(() => (sys && lab.method ? L.solvePlan(sys, ids, lab.method) : null), [sys, lab.method, ids]);
  const isSolved = plan ? L.solved(lab, plan) : false;
  const valueOfUnknown = (id) => plan?.values[lab.naming[id]];
  useEffect(() => {
    if (isSolved && plan) state.report(onSolved, { x: L.fracText(valueOfUnknown(ids[0])), y: L.fracText(valueOfUnknown(ids[1])), method: lab.method });
  }, [isSolved]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── les questions pendant le labo : une suite par étape, retenant le passage à la suivante ── */
  const cpSettings = useLabCheckpointSettings('story-modeller');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpActive = cpOn && cpSettings.enabled;
  const reached = {
    name: L.namingDone(lab), model: !!lab.verdict?.ok, solve: isSolved, verify: !!lab.replay?.ok, answer: L.discoveryReady(lab),
  }[lab.stage];
  const ctx = makeCtx({ model, def, lab, plan, sys, k });
  const chain = cpActive && reached && !doneStages.includes(lab.stage) ? chainOf(lab.stage, lab, ctx) : null;
  const party = useStepCelebration();
  const stagesShown = def.startWith === 'solve' ? L.STAGES.slice(2) : def.named ? L.STAGES.slice(1) : L.STAGES;   // une histoire déjà nommée n'a pas d'étape « المجاهيل »
  const cp = useLabCheckpoint({
    id: chain ? lab.stage : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, k, ctx)) : null,
    reached: !!reached,
    resetKey: scene.inits,
    // la MÊME étape au départ : ses cases, sa méthode, ses valeurs ou sa réponse sont retirées
    onRetry: () => { setNotice(null); setLab((s) => L.retryStage(s, model)); },
    onEvent: (ev) => state.report(onCheckpoint, ev),
    onDone: (id) => {
      setDoneStages((d) => (d.includes(id) ? d : [...d, id]));
      party.celebrate({ n: stagesShown.indexOf(id) + 1, total: stagesShown.length });
      if (id === 'answer') { state.discover(); state.formalize(); }
    },
  });

  /* ── le son (muet sauf « الصوت ») : un geste (dent), une étape réussie (cloche), un refus (grave), la règle atteinte (drapeau) ── */
  const mounted = useRef(false);
  useEffect(() => { if (mounted.current && lab.checks > 0) playSfx(lab.verdict?.ok ? 'bell' : 'over'); }, [lab.checks]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (mounted.current && lab.replay) playSfx(lab.replay.ok ? 'bell' : 'over'); }, [lab.replay]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (mounted.current && lab.half === 'refused') playSfx('over'); }, [lab.half, lab.halfRefusals]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (mounted.current && lab.revealed > 0) playSfx('tooth'); }, [lab.revealed]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (mounted.current && isSolved) playSfx('bell'); }, [isSolved]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (mounted.current && L.discoveryReady(lab)) playSfx('flag'); }, [L.discoveryReady(lab)]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { mounted.current = true; }, []);

  /* ── découverte, règle formelle ── */
  const ready = L.discoveryReady(lab) && !cpActive;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (state.isFormal && plan) state.report(onFinished, { x: L.fracText(valueOfUnknown(ids[0])), y: L.fracText(valueOfUnknown(ids[1])) });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le geste : porter (lettres, nombres, valeurs) ── */
  const drag = useDragInteraction({
    accepts: (src, zone) => {
      if (src.startsWith('unk:') && (zone.startsWith('noun:') || zone.startsWith('known:'))) return L.canName(lab, src.slice(4), zone);
      if (src.startsWith('chip:') && zone.startsWith('slot:')) return L.canFill(lab, src.slice(5), zone);
      if (src.startsWith('val:') && zone.startsWith('gate:')) return L.canGate(lab, src.slice(4), zone);
      return '';
    },
    onDrop: (src, zone) => {
      setNotice(null);
      playSfx('tooth');
      if (src.startsWith('unk:')) setLab((s) => L.name(s, src.slice(4), zone.slice(5)));
      else if (src.startsWith('chip:')) setLab((s) => L.fill(s, src.slice(5), zone));
      else if (src.startsWith('val:')) setLab((s) => L.gate(s, src.slice(4), zone));
    },
    onReject: (src, zone, reason) => { setNotice(reason ? { reason, src, zone } : null); if (reason) playSfx('over'); },
  });

  const noticeText = () => {
    if (!notice) return null;
    if (notice.reason === 'known') { const c = chipMeta(notice.zone.slice(6)); return k('known', c); }
    if (notice.reason === 'taken') { const id = notice.zone.slice(5); return k('taken', { noun: nounOf(id), letter: lab.naming[id] }); }
    return null;
  };

  /* ── actions ── */
  const verify = () => {
    const next = L.checkModel(lab, model);
    setLab(next); setNotice(null);
    state.report(onTrial, { stage: 'model', ok: next.verdict.ok, rows: next.verdict.rows });
    if (next.verdict.ok) {
      const s = L.studentSystem(next, model);
      state.report(onModel, { system: L.systemText(s, ids), tex: L.systemLatex(s, ids), unknowns: ids.map((letter) => ({ letter, noun: nounOfLetter(letter) })) });
    }
  };
  const doReplay = () => {
    const next = L.replay(lab, model, plan.values);
    setLab(next);
    state.report(onTrial, { stage: 'verify', ok: next.replay.ok, values: Object.fromEntries(ids.map((id) => [id, L.fracText(next.replay.values[id])])) });
  };

  /* ── refus de la traduction, dans les mots de l'histoire ── */
  const reasonText = (row, d) => {
    if (d.reason === 'incomplete') return k('reason_incomplete', { n: row });
    const c = d.chip ? chipMeta(d.chip) : { v: '', label: '' };
    const vars = { ...c, quote: quote(row), other: quote(3 - row), n: row };
    if (d.reason === 'swapped') {
      const right = d.slot === 'a' ? ids[1] : ids[0];
      const wrong = d.slot === 'a' ? ids[0] : ids[1];
      return k('reason_swapped', { ...vars, noun: nounOfLetter(right), letter: right, wrongLetter: wrong });
    }
    return k(`reason_${d.reason}`, vars);
  };
  const readingText = (row) => {
    if (!L.rowComplete(lab, row)) return null;
    const m = (s) => chipMeta(lab.slots[row][s]);
    return k('reading', { n: row, a: m('a').v, b: m('b').v, c: m('c').v, cl: lab.slots[row].c === L.ONE ? '' : m('c').label, nx: nounOfLetter(ids[0]), ny: nounOfLetter(ids[1]) });
  };

  /* ── textes du shell ── */
  const stageKey = lab.stage[0].toUpperCase() + lab.stage.slice(1);
  const startStage = def.startWith === 'solve' ? 'solve' : def.named ? 'model' : 'name';
  const shownMission = mission && lab.stage === startStage ? mission : k(`mission${stageKey}`, { l0: ids[0], l1: ids[1] });
  const hints = [1, 2, 3].map((i) => k(`hint${stageKey}${i}`));
  const themeTitle = builtin.title;

  /* ── la découverte : la conjecture se choisit, le tableau du manuel suit ── */
  const correct = def.answer?.correct ?? 0;
  const options = [
    { text: k('discHalf', { l0: plan?.first?.letter ?? ids[0] }), why: k('discHalfWhy', { l0: plan?.first?.letter ?? ids[0], n0: nounOf(ids[0]), n1: nounOf(ids[1]) }) },
    { text: k('discSystem'), why: k('discSystemWhy') },
    { text: k('discStory'), correct: true },
  ];
  const finalValues = lab.replay?.values;
  const formal = sys && plan ? (
    <div className="space-y-2" data-sm-formal>
      <p className="text-sm font-extrabold text-slate-800">{k('formalTitle')}</p>
      <ol className="space-y-2">
        <FormalRow label={k('formalStage1')}>
          <ul className="space-y-0.5">
            {ids.map((letter) => <li key={letter}><span dir="ltr" className="font-mono font-bold">{letter}</span> : {nounOfLetter(letter)}</li>)}
          </ul>
        </FormalRow>
        <FormalRow label={k('formalStage2')}><div dir="ltr"><MathText>{`$${L.systemLatex(sys, ids)}$`}</MathText></div></FormalRow>
        <FormalRow label={k('formalStage3')}>
          <p>{k('formalMethod', { method: k(`methodWord_${lab.method}`) })}</p>
          <div dir="ltr"><MathText>{`$${plan.lines.at(-1).tex}$`}</MathText></div>
        </FormalRow>
        <FormalRow label={k('formalStage4')}>
          {finalValues && L.replayTex(model, finalValues).map((tx, i) => (
            <p key={tx} className="flex flex-wrap items-center gap-2"><span className="text-xs text-slate-600">«{quote(i + 1)}»</span><span dir="ltr"><MathText>{`$${tx}$`}</MathText></span></p>
          ))}
        </FormalRow>
        <FormalRow label={k('formalStage5')}><p className="font-bold text-emerald-900">{bidi(def.answer?.options?.[correct] ?? '')}</p></FormalRow>
      </ol>
    </div>
  ) : null;

  const stages = def.startWith === 'solve' ? L.STAGES.slice(2) : L.STAGES;
  const btn = 'inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 font-bold focus:outline-none focus-visible:ring-4';

  return (
    <ManipulationShell
      type="story-modeller"
      title={bidi(title ?? (themeTitle ? `${k('title')} — ${themeTitle}` : k('title')))}
      mission={shownMission}
      lead={typeof lead === 'string' ? bidi(lead) : lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      guided={cpActive}
      hints={hints.map((h) => <MathText key={h}>{h}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={<ManipulationDiscovery state={state} prompt={k('discoveryPrompt')} options={options} formal={formal} />}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <div className="relative" data-sm-lab style={{ minHeight: cp.open ? 560 : undefined }}>
      {party.node}
      {cp.node}
      <ManipulationStage className="bg-gradient-to-b from-amber-50/60 to-white" data-dragging={drag.dragging ? 'true' : undefined}>
        <div className="space-y-2" data-story-modeller data-theme={themeId} data-stage={lab.stage}>
          {cpActive && (
            <LabStepper count={stagesShown.length} current={Math.max(0, stagesShown.indexOf(lab.stage))}
              done={stagesShown.map((st) => doneStages.includes(st) && (st !== lab.stage || !cp.blocking))} stepAttr="data-sm-step" />
          )}
          {/* ── les cinq étapes du tableau du manuel : une seule rangée (sur un téléphone, l'étape courante
              seule et « n / 5 ») — la hauteur va à la manipulation (règle « d'un seul regard ») ── */}
          {!cpActive && <ol className="flex flex-nowrap items-center gap-1 overflow-hidden font-bold text-xs" aria-hidden="true">
            {stages.map((s2) => {
              const i2 = L.STAGES.indexOf(s2); const cur = L.STAGES.indexOf(lab.stage);
              return <li key={s2} className={`${i2 === cur ? 'bg-indigo-600 text-white' : `block ${i2 < cur ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`} shrink-0 rounded-full px-2 py-0.5`}>{k(`stage${s2[0].toUpperCase()}${s2.slice(1)}`)}</li>;
            })}
          </ol>}

          {/* ── l'histoire : lue à l'étape 1 ; repliable ensuite (ses informations sont citées dans les rangs) ── */}
          {/* l'énoncé entier : SECONDAIRE dès que ses informations sont citées dans les rangs — l'élève le
              replie (LabFold, « إخفاء / إظهار », retenu par navigateur) pour que l'instrument tienne */}
          <div data-sm-story>
            <LabFold id="story-modeller.story" title={k('storyTitle')} actions={<Decor themeId={themeId} />} className="border-2 !border-amber-200">
              {def.story
                ? <p className="leading-snug text-slate-800 text-sm"><MathText>{bidi(def.story)}</MathText></p>
                : <ul className="list-disc ps-5 text-sm text-slate-800">{def.facts.map((f) => <li key={f.quote}>{bidi(f.quote)}</li>)}</ul>}
            </LabFold>
          </div>

          {/* ═════════ 1) المجاهيل ═════════ */}
          {lab.stage === 'name' && (
            <div className="space-y-2" data-sm-core>
              <Reserve title={k('lettersTitle')} hint={k('nounsHint')}>
                {ids.map((letter, i) => (
                  <DraggableObject key={letter} drag={drag} id={`unk:${letter}`} label={k('letterLabel', { letter })}
                    className="min-h-[44px] min-w-[48px] rounded-xl border-2 bg-white px-2 font-mono text-xl font-black shadow-sm"
                    style={{ borderColor: LETTER_COLORS[i], color: LETTER_COLORS[i], opacity: unknownOfLetter(letter) ? 0.55 : 1 }}>
                    <span dir="ltr">{letter}</span>
                  </DraggableObject>
                ))}
                {L.namingDone(lab) && !cp.blocking && (
                  <button type="button" onClick={() => setLab(L.openModel)} data-sm-open="model" className={`${btn} ms-auto bg-emerald-600 text-white focus-visible:ring-emerald-300`}>
                    {k('openModel')} <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </Reserve>
              <div className="grid grid-cols-3 gap-1" aria-label={k('nounsTitle')} role="group">
                {nounOrder(model, ids).map((z) => {
                  if (z.kind === 'unknown') {
                    const letter = lab.naming[z.id];
                    return (
                      <DropZone key={z.id} drag={drag} id={`noun:${z.id}`} tone="indigo" minHeight="min-h-[44px]" data-sm-noun={z.id}
                        label={letter ? k('nounZoneNamed', { noun: nounOf(z.id), letter }) : k('nounZone', { noun: nounOf(z.id) })}>
                        <div className="flex h-full flex-wrap items-center justify-center gap-0.5 p-1 text-center">
                          <span className="font-bold leading-tight text-slate-800 text-sm">{nounOf(z.id)}</span>
                          {letter && (
                            <span className="inline-flex items-center gap-1">
                              <span dir="ltr" className="rounded-lg bg-indigo-100 px-1.5 font-mono text-base font-black text-indigo-800">{letter}</span>
                              <IconButton label={k('removeLetter', { letter, noun: nounOf(z.id) })} onClick={() => { setLab((s) => L.unname(s, z.id)); setNotice(null); }} />
                            </span>
                          )}
                        </div>
                      </DropZone>
                    );
                  }
                  const c = chipMeta(z.key);
                  return (
                    <DropZone key={z.key} drag={drag} id={`known:${z.key}`} tone="slate" minHeight="min-h-[44px]" data-sm-noun={`known:${z.key}`} label={k('knownZone', c)}>
                      <div className="flex h-full items-center justify-center p-1 text-center leading-tight text-slate-700 text-sm">
                        <span><bdi dir="ltr" className="font-mono font-bold">{c.v}</bdi> {c.label}</span>
                      </div>
                    </DropZone>
                  );
                })}
              </div>
            </div>
          )}

          {/* le rappel des inconnues nommées (étapes 2 à 5) */}
          {lab.stage !== 'name' && (
            <p className="flex flex-wrap items-center gap-x-2 rounded-xl bg-indigo-50 px-2 py-0.5 text-slate-800 text-sm" data-sm-named>
              <span className="font-bold text-indigo-900">{k('namedTitle')}</span>
              {ids.map((letter, i) => (
                <span key={letter}><bdi dir="ltr" className="font-mono text-sm font-black" style={{ color: LETTER_COLORS[i] }}>{letter}</bdi> : {nounOfLetter(letter)}</span>
              ))}
            </p>
          )}

          {/* ═════════ 2) الترجمة ═════════ */}
          {lab.stage === 'model' && (
            <div className="space-y-2" data-sm-core>
              {[1, 2].map((row) => {
                const v = lab.verdict?.rows?.[row - 1];
                return (
                  <div key={row} className={`space-y-1 rounded-2xl border-2 p-1.5 ${v ? (v.ok ? 'border-emerald-300 bg-emerald-50/50' : 'border-amber-300 bg-amber-50/60') : 'border-slate-200 bg-white'}`}
                    data-sm-row={row} data-ok={v ? String(v.ok) : undefined} data-reason={v && !v.ok ? v.reason : undefined}>
                    <p className="line-clamp-2 text-sm" title={quote(row)}><span className="font-bold text-slate-600 inline">{k('factN', { n: row })} : </span><span className="font-bold text-slate-900">«{bidi(quote(row))}»</span></p>
                    <div dir="ltr" className="flex flex-nowrap items-center justify-center font-mono font-extrabold text-slate-700 gap-1.5 text-xl">
                      {L.SLOTS.map((s, si) => {
                        const key = lab.slots[row][s];
                        const c = key ? chipMeta(key) : null;
                        const bad = v && !v.ok && v.slot === s;
                        const slotName = s === 'c' ? k('slotC') : k('slotA', { letter: ids[si] });
                        return (
                          <React.Fragment key={s}>
                            {s === 'c' && <span aria-hidden="true">=</span>}
                            <DropZone drag={drag} id={L.slotId(row, s)} tone="amber" minHeight="min-h-[46px]"
                              className={`min-w-[3.5rem] ${bad ? '!border-solid !border-rose-400 ring-2 ring-rose-200' : ''}`}
                              label={k('slotLabel', { n: row, slot: slotName, value: c ? c.v : k('slotEmpty') })}>
                              {/* une case pleine se REMPLACE en y portant un autre nombre (pas de bouton « × » :
                                  à 320 px la ligne □x + □y = □ doit tenir sur une rangée) */}
                              <span className="flex h-full min-h-[44px] items-center justify-center px-1.5">
                                {c ? <span className="text-lg">{c.v}</span> : <span className="text-base text-slate-300">□</span>}
                              </span>
                            </DropZone>
                            {s === 'a' && <span style={{ color: LETTER_COLORS[0] }}>{ids[0]}</span>}
                            {s === 'a' && <span aria-hidden="true">+</span>}
                            {s === 'b' && <span style={{ color: LETTER_COLORS[1] }}>{ids[1]}</span>}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    {v && !v.ok && lab.verdict.rows.findIndex((r) => !r.ok) === row - 1 && (
                      <div className="text-amber-950 text-sm" data-sm-reason-row={row}>
                        {readingText(row) && <p className="text-slate-700 block">{bidi(readingText(row))}</p>}
                        <p className="font-bold" data-sm-reason>{bidi(reasonText(row, v))}</p>
                      </div>
                    )}
                  </div>
                );
              })}
              <Reserve title={k('chipsTitle')}>
                {model.chips.map((c) => {
                  const m = chipMeta(c.key);
                  return (
                    <DraggableObject key={c.key} drag={drag} id={`chip:${c.key}`} label={k('chipLabel', m)}
                      className="flex min-h-[44px] min-w-0 flex-col items-center justify-center rounded-xl border-2 border-amber-400 bg-white py-0.5 shadow-sm px-1.5">
                      <span dir="ltr" className="font-mono font-extrabold leading-tight text-amber-900 text-lg">{m.v}</span>
                      <span className="line-clamp-2 text-slate-600 max-w-[8rem] text-[11px] leading-tight">{m.label}</span>
                    </DraggableObject>
                  );
                })}
                {/* « تحقّق » À CÔTÉ des nombres qu'il juge (règle « d'un seul regard ») ; le verdict s'y lit aussi :
                    accepté → « إلى الحل » prend sa place ; refusé → la raison est DANS le rang refusé */}
                <span className="ms-auto flex flex-wrap items-center gap-1.5 col-span-1">
                  {lab.verdict && !lab.verdict.ok && <span className="text-xs font-bold text-amber-900 inline" data-sm-verdict="ko">{k('verdictKo')}</span>}
                  {lab.verdict?.ok && <span className="text-xs font-bold text-emerald-900" data-sm-verdict="ok">{k('verdictOk')}</span>}
                  {lab.verdict?.ok ? (cp.blocking ? null : (
                    <button type="button" onClick={() => setLab(L.openSolve)} data-sm-open="solve" className={`${btn} bg-emerald-600 text-white focus-visible:ring-emerald-300`}>
                      {k('openSolve')} <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                  )) : (
                    <button type="button" onClick={verify} data-sm-check className={`${btn} bg-indigo-600 text-white focus-visible:ring-indigo-300`}>
                      <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> {k('check')}
                    </button>
                  )}
                </span>
              </Reserve>
            </div>
          )}
          {lab.stage === 'model' && !def.named && def.startWith !== 'solve' && (
            <BackButton onClick={() => { setLab((st) => L.backTo(st, 'name')); setNotice(null); }} label={k('backName')} />
          )}

          {/* ═════════ 3) الحل ═════════ */}
          {lab.stage === 'solve' && sys && (
            <div className="space-y-2" data-sm-core>
              {/* la jumla et le choix de la méthode sur UNE rangée : le geste à côté de ce qu'il résout */}
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label={k('methodTitle')}>
                <span dir="ltr" className="text-sm"><MathText>{`$${L.systemLatex(sys, ids)}$`}</MathText></span>
                <span className="font-bold text-slate-700 inline text-sm">{k('methodTitle')}</span>
                {['sub', 'add'].map((m) => (
                  <button key={m} type="button" aria-pressed={lab.method === m} data-sm-method={m} onClick={() => setLab((s) => L.chooseMethod(s, m))}
                    className={`inline-flex min-h-[44px] items-center rounded-xl border-2 font-bold focus:outline-none focus-visible:ring-4 px-3 text-sm ${lab.method === m ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-indigo-300 bg-white text-indigo-800'} focus-visible:ring-indigo-300`}>
                    {k(m === 'sub' ? 'methodSub' : 'methodAdd')}
                  </button>
                ))}
              </div>
              {plan && (
                <ol className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-2 py-1.5 text-sm">
                  {plan.lines.slice(0, lab.revealed).map((ln, i) => (
                    <li key={`${lab.method}-${i}`} className="flex flex-wrap items-center gap-x-2 leading-tight" data-sm-line={i}>
                      <span className="font-bold text-slate-600 text-xs"><MathText>{k(`line_${ln.key}`, ln.vars)}</MathText></span>
                      <span dir="ltr" className="font-mono"><MathText>{`$${ln.tex}$`}</MathText></span>
                    </li>
                  ))}
                </ol>
              )}
              {plan && lab.revealed === plan.halfAt + 1 && lab.half !== 'more' && (
                <div className="space-y-1 rounded-2xl border-2 border-sky-200 bg-sky-50 p-1.5">
                  {lab.half === 'refused'
                    ? <p className="font-bold text-rose-800 text-sm" data-sm-half-refused>{k('halfRefused', { letter: plan.first.letter, other: plan.second.letter })}</p>
                    : <p className="font-bold text-sky-950 text-sm">{k('halfQuestion', { letter: plan.first.letter })}</p>}
                  <div className="flex flex-nowrap gap-1.5">
                    <button type="button" data-sm-half="done" onClick={() => setLab((s) => L.claimHalf(s, 'done'))} className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-slate-300 bg-white px-2 font-bold text-slate-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 text-sm">{k('halfDone')}</button>
                    <button type="button" data-sm-half="more" onClick={() => setLab((s) => L.claimHalf(s, 'more'))} className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-sky-400 bg-white px-2 font-bold text-sky-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 text-sm">{k('halfMore', { other: plan.second.letter })}</button>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {plan && L.canReveal(lab, plan) && (
                  <button type="button" onClick={() => setLab((s) => L.reveal(s, plan))} data-sm-next className={`${btn} border-2 border-indigo-300 bg-white text-indigo-800 focus-visible:ring-indigo-300`}>
                    <ChevronDown className="h-5 w-5" aria-hidden="true" /> {k('nextLine')}
                  </button>
                )}
                {isSolved && !cp.blocking && (
                  <button type="button" onClick={() => setLab((s) => L.openVerify(s, plan))} data-sm-open="verify" className={`${btn} bg-emerald-600 text-white focus-visible:ring-emerald-300`}>
                    {k('openVerify')} <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          )}
          {lab.stage === 'solve' && def.startWith !== 'solve' && <BackButton onClick={() => setLab((st) => L.backTo(st, 'model'))} label={k('backModel')} />}

          {/* ═════════ 4) التحقق ═════════ */}
          {lab.stage === 'verify' && plan && (
            <div className="space-y-2" data-sm-core>
              <Reserve title={k('valuesTitle')}>
                {ids.map((letter, i) => (
                  <DraggableObject key={letter} drag={drag} id={`val:${letter}`} label={k('valueLabel', { letter, v: L.numberText(plan.values[letter]) })}
                    className="min-h-[48px] rounded-xl border-2 bg-white px-3 font-mono text-lg font-extrabold shadow-sm"
                    style={{ borderColor: LETTER_COLORS[i], color: LETTER_COLORS[i], opacity: Object.values(lab.gates).includes(letter) ? 0.55 : 1 }}>
                    <span dir="ltr">{letter} = {L.numberText(plan.values[letter])}</span>
                  </DraggableObject>
                ))}
                {/* « أعد القصة » À CÔTÉ des valeurs qu'on porte */}
                <button type="button" onClick={doReplay} disabled={!L.gatesDone(lab)} data-sm-replay-go className={`${btn} ms-auto bg-indigo-600 text-white disabled:opacity-40 focus-visible:ring-indigo-300`}>
                  <PlayCircle className="h-5 w-5" aria-hidden="true" /> {k('replayGo')}
                </button>
              </Reserve>
              {/* LA SCÈNE REJOUÉE : les deux portes et leur foule ; le verdict de la caisse flotte DESSUS
                  (MovablePanel) — l'élève le déplace s'il cache la foule (règle « d'un seul regard ») */}
              <div ref={sceneRef} className="relative" style={{ minHeight: lab.replay && panelH ? panelH + 56 : undefined }} data-sm-scene>
              <div className="grid grid-cols-2 gap-1.5">
                {ids.map((id, gi) => {
                  const letter = lab.gates[id];
                  const value = letter ? plan.values[letter] : null;
                  const shownCount = lab.replay && value != null ? value : null;
                  return (
                    <DropZone key={id} drag={drag} id={L.gateId(id)} tone="emerald" minHeight="min-h-[100px]"
                      label={k('gateLabel', { noun: nounOf(id), value: letter ? `${letter} = ${L.numberText(value)}` : k('gateEmpty') })}>
                      <div className="flex flex-col items-center gap-0.5 p-1.5">
                        <GateFigure kind={model.hasCount ? 'turnstile' : 'tag'} index={gi} turns={shownCount != null && L.toNumber(shownCount) >= 0 ? Math.min(60, Math.round(L.toNumber(shownCount))) : 0} />
                        <span className="text-center font-bold text-slate-800 text-sm">{nounOf(id)}</span>
                        {letter ? (
                          <span className="inline-flex items-center gap-1">
                            <span dir="ltr" className="rounded-lg bg-white px-2 font-mono font-extrabold" style={{ color: LETTER_COLORS[ids.indexOf(letter)] }}>{letter} = {L.numberText(value)}</span>
                            <IconButton label={k('removeValue', { noun: nounOf(id) })} onClick={() => setLab((s) => L.ungate(s, id))} />
                          </span>
                        ) : <span className="text-xs text-slate-400">{k('gateEmpty')}</span>}
                        {model.hasCount && shownCount != null && <Crowd id={id} n={shownCount} adult={gi === 0} color={LETTER_COLORS[gi]} />}
                      </div>
                    </DropZone>
                  );
                })}
              </div>
              {/* une valeur en main : le panneau s'efface pour laisser les portes à portée du doigt */}
              {lab.replay && !String(drag.held ?? '').startsWith('val:') && !drag.dragging && (
                <MovablePanel key={panelH ? "sized" : "measuring"} id="story-modeller.replay" bounds={sceneRef} title={k("replayTitle")} className="absolute inset-x-0 top-0">
                <div ref={panelRef} className={`space-y-1 rounded-xl border-2 p-1.5 text-sm ${lab.replay.ok ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`} data-sm-replay data-ok={String(lab.replay.ok)} aria-live="polite">
                  {L.replayTex(model, lab.replay.values).map((tx, i) => {
                    const f = lab.replay.facts[i];
                    return (
                      <div key={tx} className="space-y-0.5" data-sm-fact={i + 1} data-ok={String(f.ok)}>
                        <p className="flex flex-wrap items-center gap-x-2">
                          <span aria-hidden="true">{f.ok ? '✓' : '✗'}</span>
                          <span className="text-slate-700 inline">«{bidi(quote(i + 1))}»</span>
                          <span dir="ltr" className="font-mono"><MathText>{`$${tx}$`}</MathText></span>
                        </p>
                        {!f.ok && <p className="font-bold text-rose-800">{bidi(k('factKo', { quote: quote(i + 1), c: L.numberText(f.c), lhs: L.numberText(f.lhs) }))}</p>}
                      </div>
                    );
                  })}
                  {model.hasCount && (lab.replay.natural.ok
                    ? <p className="text-emerald-900">✓ {k('naturalOk')}</p>
                    : lab.replay.natural.bad.map((id) => <p key={id} className="font-bold text-rose-800">{bidi(k('naturalKo', { noun: nounOf(id), v: L.numberText(lab.replay.values[id]) }))}</p>))}
                  <div className="flex flex-wrap items-center gap-2"><p className="font-bold">{lab.replay.ok ? k('replayOk') : k('replayKo')}</p>
                  {lab.replay.ok && !cp.blocking && (
                    <button type="button" onClick={() => setLab(L.openAnswer)} data-sm-open="answer" className={`${btn} bg-emerald-600 text-white focus-visible:ring-emerald-300`}>
                      {k('openAnswer')} <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                  )}</div>
                </div>
                </MovablePanel>
              )}
              </div>
            </div>
          )}

          {lab.stage === 'verify' && def.startWith !== 'solve' && <BackButton onClick={() => setLab((st) => L.backTo(st, 'model'))} label={k('backModel')} />}

          {/* ═════════ 5) الإجابة ═════════ */}
          {lab.stage === 'answer' && (
            <div className="space-y-2" data-sm-answer data-sm-core>
              <p className="text-sm font-bold text-slate-800">{k('answerTitle')}</p>
              <div className="grid gap-2">
                {(def.answer?.options ?? []).map((o, i) => {
                  const picked = lab.answer === i;
                  const tone = picked ? (i === correct ? 'border-emerald-500 bg-emerald-50' : 'border-amber-400 bg-amber-50') : 'border-slate-300 bg-white';
                  return (
                    <button key={o} type="button" aria-pressed={picked} data-sm-option={i} onClick={() => setLab((s) => L.chooseAnswer(s, i, correct))}
                      className={`min-h-[44px] rounded-xl border-2 px-3 py-2 text-start text-sm font-bold text-slate-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 ${tone}`}>
                      {bidi(o)}
                    </button>
                  );
                })}
              </div>
              {lab.answer != null && (
                <p className={`text-sm font-bold ${lab.answer === correct ? 'text-emerald-900' : 'text-amber-900'}`} aria-live="polite">
                  {lab.answer === correct ? k('answerRight') : bidi(k('answerWrong', { n0: nounOf(ids[0]), v0: L.numberText(finalValues?.[ids[0]] ?? valueOfUnknown(ids[0])), n1: nounOf(ids[1]), v1: L.numberText(finalValues?.[ids[1]] ?? valueOfUnknown(ids[1])) }))}
                </p>
              )}
            </div>
          )}

          <p className="min-h-[1.25rem] text-sm" aria-live="polite" data-sm-notice>
            {noticeText() && <span className="text-rose-800">{bidi(noticeText())}</span>}
          </p>
        </div>
      </ManipulationStage>
      </div>
    </ManipulationShell>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** Une suite par étape ; la dernière ajoute la RÈGLE (l'ancienne découverte). */
export const CHAINS = Object.freeze({
  name: ['nameWhy', 'nameCount'],
  model: ['kinds', 'swap'],
  solve: ['solveFirst', 'solveSecond'],
  verify: ['verifyFact', 'verifySwap'],
  answer: ['answerWhy', 'rule'],
});

/** Les mots et les nombres de l'élève, lus une fois pour toutes les questions (rien n'est écrit en dur). */
export function makeCtx({ model, def, lab, plan, sys, k }) {
  const ids = model.ids;
  const nounOf = (id) => def.unknowns.find((u) => u.id === id)?.noun ?? id;
  const unknownOfLetter = (letter) => ids.find((id) => lab.naming[id] === letter);
  const nounOfLetter = (letter) => nounOf(unknownOfLetter(letter));
  const chipMeta = (key) => {
    if (key === L.ONE) return { v: '1', label: k('oneLabel') };
    const i = Number(String(key).slice(1));
    return { v: L.numberText(model.chips[i].value), label: def.chips[i]?.label ?? '' };
  };
  const quote = (row) => def.facts[row - 1]?.quote ?? '';
  const valueOf = (id) => plan?.values[lab.naming[id]];
  return { model, def, lab, plan, sys, ids, nounOf, nounOfLetter, chipMeta, quote, valueOf };
}

const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const intText = (p) => (p != null && Number.isInteger(L.toNumber(p)) ? L.numberText(p) : null);
const ansTex = (t) => <MathText>{`$${t}$`}</MathText>;
const rowKind = (ctx, kind) => ctx.model.facts.findIndex((f) => f.kind === kind) + 1;   // 0 : aucune
const KIND_ROW = (ctx) => rowKind(ctx, 'count') || rowKind(ctx, 'money');
const swapRow = (ctx) => {
  const rows = [1, 2].filter((r) => { const e = L.studentEq(ctx.lab, ctx.model, r); return !!e && L.toNumber(e.a) !== L.toNumber(e.b); });
  return rows.find((r) => ctx.model.facts[r - 1].kind === 'money') ?? rows[0] ?? 0;
};
/** Les deux gates échangées : la valeur de chaque inconnue passe à l'autre. */
const swappedReplay = (ctx) => {
  const [u0, u1] = ctx.ids;
  return L.replayStory(ctx.model, { [u0]: ctx.lab.naming[u1], [u1]: ctx.lab.naming[u0] }, ctx.plan.values);
};

/** Les questions de l'étape, sans celles que les nombres de l'élève rendent sans objet. */
export function chainOf(stage, lab, ctx) {
  return CHAINS[stage].filter((q) => {
    if (q === 'kinds') return KIND_ROW(ctx) > 0;
    if (q === 'swap') return swapRow(ctx) > 0;
    if (q === 'solveFirst') return ctx.plan && intText(ctx.plan.first.value) != null;
    if (q === 'solveSecond') return ctx.plan && intText(ctx.plan.second.value) != null;
    if (q === 'verifyFact') return ctx.plan && intText(ctx.model.target[ctx.model.facts.length - 1].c) != null;
    if (q === 'verifySwap') { if (!ctx.plan) return false; const r = swappedReplay(ctx); return r.facts.some((f) => !f.ok); }
    return true;
  });
}

/** Chaque question est construite sur LES nombres de l'élève ; `k` : les textes de `storyModeller`. */
export const QUESTIONS = {
  nameWhy: (lab, k, ctx) => {
    const [c0, c1] = ctx.model.chips.filter((c) => c.key !== L.ONE).map((c) => ctx.chipMeta(c.key));
    const nums = { n0: ctx.nounOf(ctx.ids[0]), n1: ctx.nounOf(ctx.ids[1]), k0: `${c0.v} ${c0.label}`.trim(), k1: `${c1?.v ?? c0.v} ${c1?.label ?? ''}`.trim() };
    return {
      id: 'nameWhy', kind: 'choice',
      prompt: Mx(k, 'nameWhy.prompt', nums),
      options: [
        { text: Mx(k, 'nameWhy.wrongBig', nums), why: Mx(k, 'nameWhy.whyBig', nums) },
        { text: Mx(k, 'nameWhy.right', nums), correct: true },
        { text: Mx(k, 'nameWhy.wrongFirst', nums), why: Mx(k, 'nameWhy.whyFirst', nums) },
      ],
      hints: [Mx(k, 'nameWhy.hint1', nums), Mx(k, 'nameWhy.hint2', nums)], explain: Mx(k, 'nameWhy.explain', nums),
    };
  },
  nameCount: (lab, k, ctx) => {
    const nums = { l0: ctx.ids[0], l1: ctx.ids[1], n: ctx.model.facts.length };
    return {
      id: 'nameCount', kind: 'number', expected: String(ctx.model.facts.length), answer: ansTex(ctx.model.facts.length),
      prompt: Mx(k, 'nameCount.prompt', nums), hints: [Mx(k, 'nameCount.hint1', nums), Mx(k, 'nameCount.hint2', nums)], explain: Mx(k, 'nameCount.explain', nums),
    };
  },
  kinds: (lab, k, ctx) => {
    const row = KIND_ROW(ctx); const kind = ctx.model.facts[row - 1].kind;
    const e = L.studentEq(lab, ctx.model, row); const c = ctx.chipMeta(lab.slots[row].c);
    const nums = { n: row, eq: `$ ${L.eqLatex(e, ctx.ids)} $`, c: c.v, cl: c.label };
    const opts = {
      count: { text: Mx(k, 'kinds.count'), why: Mx(k, 'kinds.whyCount', nums) },
      money: { text: Mx(k, 'kinds.money'), why: Mx(k, 'kinds.whyMoney', nums) },
      both: { text: Mx(k, 'kinds.both'), why: Mx(k, 'kinds.whyBoth', nums) },
    };
    const right = kind === 'count' ? 'count' : 'money';
    return {
      id: 'kinds', kind: 'choice',
      prompt: Mx(k, 'kinds.prompt', nums),
      options: ['count', 'money', 'both'].map((o) => (o === right ? { text: opts[o].text, correct: true } : opts[o])),
      hints: [Mx(k, 'kinds.hint1', nums), Mx(k, `kinds.hint2${kind === 'count' ? 'Count' : 'Money'}`, nums)], explain: Mx(k, `kinds.explain${kind === 'count' ? 'Count' : 'Money'}`, nums),
    };
  },
  swap: (lab, k, ctx) => {
    const row = swapRow(ctx); const e = L.studentEq(lab, ctx.model, row);
    const sw = { ...e, a: e.b, b: e.a };
    const nums = {
      n: row, l0: ctx.ids[0], l1: ctx.ids[1], a: L.numberText(e.a), b: L.numberText(e.b),
      eq: `$ ${L.eqLatex(e, ctx.ids)} $`, sw: `$ ${L.eqLatex(sw, ctx.ids)} $`, n0: ctx.nounOfLetter(ctx.ids[0]), n1: ctx.nounOfLetter(ctx.ids[1]),
    };
    return {
      id: 'swap', kind: 'choice', cols: 2,
      prompt: Mx(k, 'swap.prompt', nums),
      options: [
        { text: Mx(k, 'swap.yes'), why: Mx(k, 'swap.whyYes', nums) },
        { text: Mx(k, 'swap.no', nums), correct: true },
      ],
      hints: [Mx(k, 'swap.hint1', nums), Mx(k, 'swap.hint2', nums)], explain: Mx(k, 'swap.explain', nums),
    };
  },
  solveFirst: (lab, k, ctx) => {
    const { plan } = ctx; const f = plan.first;
    const line = plan.lines[Math.max(0, plan.halfAt - 1)];
    const nums = { letter: f.letter, line: `$ ${line.tex} $`, v: intText(f.value) };
    return {
      id: 'solveFirst', kind: 'number', expected: intText(f.value), answer: ansTex(intText(f.value)),
      prompt: Mx(k, 'solveFirst.prompt', nums), hints: [Mx(k, 'solveFirst.hint1', nums), Mx(k, 'solveFirst.hint2', nums)], explain: Mx(k, 'solveFirst.explain', nums),
    };
  },
  solveSecond: (lab, k, ctx) => {
    const { plan } = ctx; const f = plan.first; const sd = plan.second;
    const nums = { first: f.letter, fv: intText(f.value), letter: sd.letter, v: intText(sd.value) };
    return {
      id: 'solveSecond', kind: 'number', expected: intText(sd.value), answer: ansTex(intText(sd.value)),
      prompt: Mx(k, 'solveSecond.prompt', nums), hints: [Mx(k, 'solveSecond.hint1', nums), Mx(k, 'solveSecond.hint2', nums)], explain: Mx(k, 'solveSecond.explain', nums),
    };
  },
  verifyFact: (lab, k, ctx) => {
    const n = ctx.model.facts.length;
    const f = lab.replay.facts[n - 1];
    const tx = L.replayTex(ctx.model, lab.replay.values)[n - 1];
    const nums = { n, quote: bidi(ctx.quote(n).replace(/(\d) (?=\d{3}\b)/g, '$1')), v: intText(f.lhs), expr: `$ ${tx.slice(0, tx.lastIndexOf('=')).trim()} $` };
    return {
      id: 'verifyFact', kind: 'number', expected: intText(f.lhs), answer: ansTex(intText(f.lhs)),
      prompt: Mx(k, 'verifyFact.prompt', nums), hints: [Mx(k, 'verifyFact.hint1', nums), Mx(k, 'verifyFact.hint2', nums)], explain: Mx(k, 'verifyFact.explain', nums),
    };
  },
  verifySwap: (lab, k, ctx) => {
    const r = swappedReplay(ctx); const [u0, u1] = ctx.ids;
    const fails = r.facts.map((f) => !f.ok);
    const kindOf = fails[0] && fails[1] ? 'both' : fails[0] ? 'only1' : 'only2';
    const nums = { v0: L.numberText(r.values[u0]), v1: L.numberText(r.values[u1]), n0: ctx.nounOf(u0), n1: ctx.nounOf(u1) };
    // pourquoi une option est fausse : la première information dont l'état la contredit, lue sur les valeurs échangées
    const claims = { only1: [true, false], only2: [false, true], both: [true, true] };
    const whyOf = (opt) => {
      const bad = claims[opt].findIndex((c, i) => c !== fails[i]);
      const f = r.facts[bad]; const d = { ...nums, i: bad + 1, lhs: L.numberText(f.lhs), c: L.numberText(f.c) };
      return Mx(k, fails[bad] ? 'verifySwap.whyFails' : 'verifySwap.whyHolds', d);
    };
    const opts = ['only1', 'only2', 'both'].map((o) => (o === kindOf ? { text: Mx(k, `verifySwap.${o}`), correct: true } : { text: Mx(k, `verifySwap.${o}`), why: whyOf(o) }));
    return {
      id: 'verifySwap', kind: 'choice',
      prompt: Mx(k, 'verifySwap.prompt', nums), options: opts,
      hints: [Mx(k, 'verifySwap.hint1', nums), Mx(k, 'verifySwap.hint2', nums)],
      explain: Mx(k, 'verifySwap.explain', { ...nums, i: fails[0] ? 1 : 2, lhs: L.numberText(r.facts[fails[0] ? 0 : 1].lhs), c: L.numberText(r.facts[fails[0] ? 0 : 1].c) }),
    };
  },
  answerWhy: (lab, k, ctx) => {
    const [u0, u1] = ctx.ids;
    const nums = { v0: L.numberText(ctx.valueOf(u0)), v1: L.numberText(ctx.valueOf(u1)), n0: ctx.nounOf(u0), n1: ctx.nounOf(u1), first: ctx.plan.first.letter };
    return {
      id: 'answerWhy', kind: 'choice',
      prompt: Mx(k, 'answerWhy.prompt', nums),
      options: [
        { text: Mx(k, 'answerWhy.wrongPair'), why: Mx(k, 'answerWhy.whyPair', nums) },
        { text: Mx(k, 'answerWhy.right'), correct: true },
        { text: Mx(k, 'answerWhy.wrongOne', nums), why: Mx(k, 'answerWhy.whyOne', nums) },
      ],
      hints: [Mx(k, 'answerWhy.hint1', nums), Mx(k, 'answerWhy.hint2', nums)], explain: Mx(k, 'answerWhy.explain', nums),
    };
  },
  rule: (lab, k, ctx) => {
    const { plan, sys, ids } = ctx;
    const letter0 = plan?.first?.letter ?? ids[0];
    const finalValues = lab.replay?.values;
    const correct = ctx.def.answer?.correct ?? 0;
    return {
      id: 'rule', kind: 'choice',
      prompt: <MathText>{k('discoveryPrompt')}</MathText>,
      options: [
        { text: <MathText>{k('discHalf', { l0: letter0 })}</MathText>, why: <MathText>{k('discHalfWhy', { l0: letter0, n0: ctx.nounOf(ids[0]), n1: ctx.nounOf(ids[1]) })}</MathText> },
        { text: <MathText>{k('discSystem')}</MathText>, why: <MathText>{k('discSystemWhy')}</MathText> },
        { text: <MathText>{k('discStory')}</MathText>, correct: true },
      ],
      hints: [Mx(k, 'rule.hint1'), Mx(k, 'rule.hint2')],
      explain: sys && plan ? (
        <div className="space-y-2" data-sm-formal>
          <p className="text-sm font-extrabold text-slate-800">{k('formalTitle')}</p>
          <ol className="space-y-2">
            <FormalRow label={k('formalStage1')}>
              <ul className="space-y-0.5">{ids.map((letter) => <li key={letter}><span dir="ltr" className="font-mono font-bold">{letter}</span> : {ctx.nounOfLetter(letter)}</li>)}</ul>
            </FormalRow>
            <FormalRow label={k('formalStage2')}><div dir="ltr"><MathText>{`$${L.systemLatex(sys, ids)}$`}</MathText></div></FormalRow>
            <FormalRow label={k('formalStage3')}>
              <p>{k('formalMethod', { method: k(`methodWord_${lab.method}`) })}</p>
              <div dir="ltr"><MathText>{`$${plan.lines.at(-1).tex}$`}</MathText></div>
            </FormalRow>
            <FormalRow label={k('formalStage4')}>
              {finalValues && L.replayTex(ctx.model, finalValues).map((tx, i) => (
                <p key={tx} className="flex flex-wrap items-center gap-2"><span className="text-xs text-slate-600">«{ctx.quote(i + 1)}»</span><span dir="ltr"><MathText>{`$${tx}$`}</MathText></span></p>
              ))}
            </FormalRow>
            <FormalRow label={k('formalStage5')}><p className="font-bold text-emerald-900">{bidi(ctx.def.answer?.options?.[correct] ?? '')}</p></FormalRow>
          </ol>
        </div>
      ) : null,
    };
  },
};

/* ───────────────────────── petites pièces ───────────────────────── */

/**
 * L'ordre des zones de noms : les deux inconnues MÊLÉES aux données (jamais groupées à part, ce qui
 * dirait la réponse) — l'inconnue 1 après la première donnée, l'inconnue 2 après la troisième.
 */
function nounOrder(model, ids) {
  const knowns = model.chips.filter((c) => c.key !== L.ONE).map((c) => ({ kind: 'known', key: c.key }));
  const out = [...knowns];
  out.splice(Math.min(1, out.length), 0, { kind: 'unknown', id: ids[0] });
  out.splice(Math.min(4, out.length), 0, { kind: 'unknown', id: ids[1] });
  return out;
}

function Reserve({ title, hint, children }) {
  return (
    <div className="space-y-1 rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-1.5">
      <p className="text-xs font-bold text-amber-900 block">{title}</p>
      <div className="flex flex-wrap items-stretch gap-1.5" role="group" aria-label={title}>{children}</div>
      {hint && <p className="text-[11px] leading-tight text-slate-600 block">{hint}</p>}
    </div>
  );
}

function IconButton({ label, onClick, small = false }) {
  return (
    <button type="button" aria-label={label} onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`inline-flex ${small ? 'h-7 w-7' : 'h-8 w-8'} items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}>
      <XIcon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

function BackButton({ onClick, label }) {
  return (
    <button type="button" onClick={onClick} data-sm-back
      className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
      <ArrowRight className="h-4 w-4" aria-hidden="true" /> {label}
    </button>
  );
}

function FormalRow({ label, children }) {
  return (
    <li className="grid gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 grid-cols-[11rem_1fr]">
      <span className="text-xs font-extrabold text-indigo-900">{label}</span>
      <div className="text-sm text-slate-800">{children}</div>
    </li>
  );
}

/** Un tourniquet (on compte des personnes) ou une étiquette de prix (on cherche un prix). */
function GateFigure({ kind, index, turns }) {
  const color = LETTER_COLORS[index];
  if (kind === 'tag') {
    return (
      <svg viewBox="0 0 80 48" width="52" height="32" aria-hidden="true" focusable="false">
        <path d="M14 6 H72 V42 H14 L4 24 Z" fill="#fff" stroke={color} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="16" cy="24" r="4" fill={color} fillOpacity="0.35" />
        <path d="M30 18 h30 M30 28 h22" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 80 56" width="52" height="36" aria-hidden="true" focusable="false">
      <rect x="34" y="18" width="12" height="36" rx="3" fill="#94A3B8" />
      <rect x="8" y="50" width="64" height="4" rx="2" fill="#CBD5E1" />
      <g style={{ transform: `rotate(${turns * 120}deg)`, transformOrigin: '40px 20px', transition: 'transform 900ms ease-out' }} className="motion-reduce:transition-none">
        {[0, 120, 240].map((a) => <rect key={a} x="40" y="18" width="30" height="4" rx="2" fill={color} transform={`rotate(${a} 40 20)`} />)}
      </g>
      <circle cx="40" cy="20" r="5" fill="#334155" />
    </svg>
  );
}

/**
 * La foule passée par un tourniquet : le dessin COMPTE (au-delà de 160, « +n »). Une SEULE image SVG de
 * hauteur fixe (80 / 96 px) dont la grille se calcule sur n : 12 personnes sont grandes, 140 rétrécissent —
 * jamais une taille en px par figure qui pousserait le compteur hors de l'écran (règle « d'un seul regard »).
 */
function Crowd({ id, n, adult, color }) {
  const count = L.toNumber(n);
  if (!Number.isInteger(count) || count < 0) return null;
  const shown = Math.min(count, 160);
  // une grille PRESQUE CARRÉE (cols ≈ ⌈√n⌉), jamais une bande étroite : 12 supporters en 4 × 3,
  // 62 visiteurs en 8 × 8, 140 en 12 × 12 — la hauteur de l'image est fixe, les figures rétrécissent
  const cols = Math.max(1, Math.ceil(Math.sqrt(shown)));
  const rows = Math.max(1, Math.ceil(shown / cols));
  const CW = 10; const CH = 15;
  const k = adult ? 1 : 0.8;
  return (
    <span className="flex w-full items-center justify-center gap-1" dir="ltr" aria-hidden="true" data-sm-crowd={id} data-count={count} data-cols={cols}>
      <svg viewBox={`0 0 ${cols * CW} ${rows * CH}`} preserveAspectRatio="xMidYMax meet" className="max-w-full h-24" focusable="false">
        {Array.from({ length: shown }, (_, i) => {
          const cx = (i % cols) * CW + CW / 2; const by = (Math.floor(i / cols) + 1) * CH - 0.5;
          return (
            <g key={i} transform={`translate(${cx} ${by}) scale(${k})`}>
              <circle cx="0" cy="-10.5" r="2.4" fill="#E0B48A" />
              <path d="M-3.4 0 L-3 -7.4 Q0 -9.2 3 -7.4 L3.4 0 Z" fill={color} />
            </g>
          );
        })}
      </svg>
      {count > shown && <span className="font-mono text-[10px] text-slate-500">+{count - shown}</span>}
    </span>
  );
}

/**
 * Le DÉCOR — sans information, sans état du laboratoire. Stade : l'écharpe des gradins s'agite ;
 * musée : la lampe du hall s'allume ; fête : les ballons dansent. `aria-hidden`, hors du parcours
 * clavier, rien ne bouge sous `prefers-reduced-motion`.
 */
function Decor({ themeId }) {
  const reduce = useReducedMotion();
  const [taps, setTaps] = useState(0);
  const tap = () => { if (!reduce) setTaps((n) => n + 1); };
  const anim = taps && !reduce ? 'sm-wave' : undefined;
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" onClick={tap} data-deco
      className="shrink-0 rounded-xl focus:outline-none h-10 w-14">
      <svg viewBox="0 0 120 80" width="100%" height="100%">
        <style>{'.sm-wave{animation:sm-wave .5s ease-in-out 3;transform-box:fill-box;transform-origin:left center}@keyframes sm-wave{0%,100%{transform:skewY(0)}50%{transform:skewY(-14deg) scaleX(.92)}}.sm-glow{animation:sm-glow 1.2s ease-out 1}@keyframes sm-glow{0%{opacity:.2}40%{opacity:1}100%{opacity:.35}}.sm-bob{animation:sm-bob .6s ease-in-out 3;transform-box:fill-box;transform-origin:bottom center}@keyframes sm-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px) rotate(4deg)}}@media (prefers-reduced-motion: reduce){.sm-wave,.sm-glow,.sm-bob{animation:none}}'}</style>
        {themeId === 'stadium' && (
          <g key={taps}>
            <path d="M4 70 L116 70 L116 50 L4 58 Z" fill="#E2E8F0" />
            <path d="M4 58 L116 50 L116 34 L4 46 Z" fill="#CBD5E1" />
            {[16, 40, 64, 88].map((x, i) => <circle key={x} cx={x} cy={52 - i * 2} r="5" fill={['#FCD9B6', '#E0B48A', '#FCD9B6', '#C68E63'][i]} />)}
            <line x1="52" y1="44" x2="52" y2="10" stroke="#334155" strokeWidth="2" />
            <g className={anim}>
              <rect x="52" y="10" width="44" height="9" fill="#15803D" />
              <rect x="52" y="19" width="44" height="9" fill="#DC2626" />
              <rect x="52" y="28" width="44" height="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
            </g>
          </g>
        )}
        {themeId === 'museum' && (
          <g key={taps}>
            <path d="M10 30 L60 8 L110 30 Z" fill="#E7E5E4" stroke="#78716C" strokeWidth="2" />
            {[22, 44, 66, 88].map((x) => <rect key={x} x={x} y="32" width="8" height="34" fill="#F5F5F4" stroke="#A8A29E" />)}
            <rect x="8" y="66" width="104" height="8" fill="#D6D3D1" />
            <circle cx="60" cy="22" r="5" fill="#FDE047" className={taps && !reduce ? 'sm-glow' : undefined} opacity={taps ? 1 : 0.35} />
          </g>
        )}
        {themeId !== 'stadium' && themeId !== 'museum' && (
          <g key={taps}>
            <rect x="8" y="62" width="104" height="8" rx="3" fill="#FDE68A" />
            {[[30, '#F472B6'], [60, '#60A5FA'], [90, '#34D399']].map(([x, c]) => (
              <g key={x} className={taps && !reduce ? 'sm-bob' : undefined}>
                <line x1={x} y1="34" x2={x} y2="62" stroke="#94A3B8" strokeWidth="1" />
                <ellipse cx={x} cy="22" rx="10" ry="13" fill={c} />
              </g>
            ))}
          </g>
        )}
      </svg>
    </button>
  );
}
