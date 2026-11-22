import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ArrowLeft, ArrowRight, ChevronDown, PlayCircle, X as XIcon } from 'lucide-react';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import { useManipulation } from '../useManipulation';
import useDragInteraction from '../useDragInteraction';
import DraggableObject from '../primitives/DraggableObject';
import DropZone from '../primitives/DropZone';
import PredictTray from '../primitives/PredictTray';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { useLabCoach } from '../primitives/LabCoach';
import MathText from '../../components/MathText';
import { bidi } from '../../../../utils/bidi';
import { playSfx } from '../../utils/playEffect';
import * as L from '../logic/storyModeller';
import * as P from '../logic/storyModellerPlayer';

/*
 * story-modeller — LECTEUR DE MISSION (rollout 2026-11-12, unité 5 leçon 3 `mushkilat-jumla` ; conseil du 2026-11-11, verdict L3.1–L3.16, X7).
 * La page (`StoryModeller.jsx` : enseignant, mode classe, la synthèse `wadiya-idmajiya-jumal`) est INCHANGÉE : ce composant n'est monté que dans le
 * lecteur (`useInMissionPlayer()`), joué en MANCHES (LabRounds). Logique pure : `logic/storyModellerPlayer.js`.
 *   - Les cinq étapes de la page (المجاهيل · الترجمة · الحل · التحقق · الإجابة), sans titre ni décor ni panneau flottant : l'HISTOIRE reste à l'écran à
 *     CHAQUE étape (`[data-sm-story]`, verdict L3.15), le verdict, l'étape « n من 5 » et le journal « 📋 جدول تجاربك » dans la colonne.
 *   - Un ESSAI est une histoire REJOUÉE avec une affectation NOUVELLE (`onVerdict { groups: 0, exact }`) ; la traduction vérifiée est un événement
 *     de MODÈLE (`onTrial { tk: 'model', ok, key, free? }`, `freeFirstModel` : le premier refus gratuit). La découverte (la bonne phrase, ou
 *     l'histoire qui REFUSE) est annoncée une fois (`{ tk: 'discovered' }`) ; « إعادة » → `{ tk: 'reset' }`, « أعِد التجربة » → `{ tk: 'retry' }`.
 *   - `chains` : first · second · easyFirst · easySecond · impossible · impossibleEasy · synthTrip · synthParty (la synthèse de l'unité 5) · none (`logic › CHAIN_SPECS`) ; `solveTyped` fait TAPER la
 *     première inconnue avant que sa ligne ne paraisse ; une manche « impossible » finit sur le REFUS (pas d'étape « الإجابة »).
 *   - `predict` : [{ key: 'dearer' | 'which', pos }] posées AVANT le premier geste ; vérité calculée, jugée par le geste qui la tranche.
 *   - `items` : le dessin des portes (des OBJETS comptés : crayons, livres, maillots… jamais des personnes) ; une valeur qui ne se compte pas
 *     dessine un plateau VIDE pointillé « ✗ لا يُعدّ ». `onesPlaced` : les deux « 1 » déjà dans le rang qui compte ; `chips[].useless` : un jeton
 *     muet (raison `unused`) ; `choices` : des histoires au choix (la manche libre) ; `coach` : le guide (`coachOf`, ancres `[data-coach]`).
 *   - Commandes figées pendant une prédiction ou une question (`aria-disabled`) ; région vivante TOUJOURS montée ; aucun défilement.
 */
const PRED_HOLD_MS = 1600;
const LETTER_COLORS = ['#2563EB', '#E11D48'];
const ring = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2';
const btn = `inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-sm font-bold ${ring}`;
const $ = (x) => `$${x}$`;
const spin = (xs, seed) => { const s0 = ((seed % xs.length) + xs.length) % xs.length; return xs.map((_, i) => xs[(i + s0) % xs.length]); };
/** Un nombre isolé de gauche à droite dans une phrase arabe (U+2066 … U+2069) : « -3 » ne devient jamais « 3- ». */
const iso = (v) => `\u2066${v}\u2069`;
const countWords = (u, n) => (Math.abs(n) >= 3 && Math.abs(n) <= 10 ? u?.few : u?.many) ?? u?.short ?? '';

/* ══════════════ Les questions du lecteur (LabCheckpoint) ══════════════ */

const Pq = (k, key, o) => <MathText>{k(`player.q.${key}`, o)}</MathText>;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;

export const QUESTIONS = {
  /* TAPER la première inconnue avant de voir sa ligne (r1, r2) */
  solveTyped: ({ k, plan }) => {
    const f = plan.first; const line = plan.lines[plan.halfAt - 1];
    const o = { letter: f.letter, line: `$ ${line.tex} $`, v: L.numberText(f.value) };
    return {
      id: 'solveTyped', kind: 'number', expected: L.fracText(f.value), answer: <MathText>{$(`${f.letter} = ${L.fracLatex(f.value)}`)}</MathText>,
      prompt: Pq(k, 'solveTyped.prompt', o), hints: [Pq(k, 'solveTyped.hint1', o), Pq(k, 'solveTyped.hint2', o)], explain: Pq(k, 'solveTyped.explain', o),
    };
  },
  /* BÂTIR la vérification de l'information d'argent : « a × ▢ + b × ▢ = ▢ », leurre : le nombre de la COMPTE */
  buildCheck: ({ k, model, def, sv, seed }) => {
    const b = P.checkBuild(model, sv);
    const mr = P.moneyRow(model);
    const [u0, u1] = model.ids;
    const short = (id) => def.unknowns.find((u) => u.id === id)?.short ?? id;
    const o = { quote: def.facts[mr - 1].quote, a: b.a, b: b.b, n0: short(u0), n1: short(u1), eq: `${b.a} \\times ${b.expected[0]} + ${b.b} \\times ${b.expected[1]} = ${b.expected[2]}` };
    return {
      id: 'buildCheck', kind: 'build', prompt: Pq(k, 'buildCheck.prompt', o),
      slots: [short(u0), short(u1), k('player.q.buildCheck.slotTotal')], wrap: [`${b.a} ×`], ops: [`+ ${b.b} ×`, '='],
      tiles: spin(b.tiles, seed), expected: b.expected,
      hints: [Pq(k, 'buildCheck.hint1', o), Pq(k, 'buildCheck.hint2', o)], explain: Pq(k, 'buildCheck.explain', o),
    };
  },
  /* BÂTIR la phrase-réponse : « ثمن ▢ هو v0 دج، وثمن ▢ هو v1 دج. », leurre : la lettre (elle ne nomme rien) */
  buildAnswer: ({ k, model, def, sv, seed }) => {
    const [u0, u1] = model.ids;
    const un = (id) => def.unknowns.find((u) => u.id === id) ?? {};
    const v0 = L.numberText(sv[u0]); const v1 = L.numberText(sv[u1]);
    const o = { v0, v1, s0: un(u0).short, s1: un(u1).short, l0: u0, n0: un(u0).noun };
    return {
      id: 'buildAnswer', kind: 'build', prompt: Pq(k, 'buildAnswer.prompt', o), wideText: true,
      slots: ['', ''], wrap: [k('player.q.buildAnswer.wrapStart'), k('player.q.buildAnswer.wrapEnd', o)], ops: [k('player.q.buildAnswer.op', o)],
      tiles: spin([{ text: un(u0).short }, { text: un(u1).short }, u0], seed), expected: [un(u0).short, un(u1).short],
      hints: [Pq(k, 'buildAnswer.hint1', o), Pq(k, 'buildAnswer.hint2', o)], explain: Pq(k, 'buildAnswer.explain', o),
    };
  },
  /* BÂTIR l'information aux quantités ÉGALES : « k × (▢ + ▢) = ▢ », leurre : S ÷ k (synthèse de l'unité 5, 2026-11-12) */
  buildSum: ({ k, model, def, sv, seed }) => {
    const b = P.sumBuild(model, sv);
    const [u0, u1] = model.ids;
    const short = (id) => def.unknowns.find((u) => u.id === id)?.short ?? id;
    const o = { quote: def.facts[b.row - 1].quote, k: b.k, s0: short(u0), s1: short(u1), sum: b.sum, eq: `${b.k} \\times (${b.expected[0]} + ${b.expected[1]}) = ${b.expected[2]}` };
    return {
      id: 'buildSum', kind: 'build', prompt: Pq(k, 'buildSum.prompt', o),
      slots: [short(u0), short(u1), k('player.q.buildSum.slotTotal')], wrap: [`${b.k} × (`, ''], ops: ['+', ') ='],
      tiles: spin(b.tiles, seed), expected: b.expected,
      hints: [Pq(k, 'buildSum.hint1', o), Pq(k, 'buildSum.hint2', o)], explain: Pq(k, 'buildSum.explain', o),
    };
  },
  /* les questions de la page, sur les valeurs de l'élève (mots de `cp.*`) */
  verifySwap: ({ k, model, def, lab, plan, seed }) => {
    const [u0, u1] = model.ids;
    const r = L.replayStory(model, { [u0]: lab.naming[u1], [u1]: lab.naming[u0] }, plan.values);
    const fails = r.facts.map((f) => !f.ok);
    const right = fails[0] && fails[1] ? 'both' : fails[0] ? 'only1' : 'only2';
    const nounOf = (id) => def.unknowns.find((u) => u.id === id)?.noun ?? id;
    const nums = { v0: L.numberText(r.values[u0]), v1: L.numberText(r.values[u1]), n0: nounOf(u0), n1: nounOf(u1) };
    const claims = { only1: [true, false], only2: [false, true], both: [true, true] };
    const whyOf = (opt) => {
      const bad = claims[opt].findIndex((c, i) => c !== fails[i]);
      const f = r.facts[bad];
      return Cq(k, fails[bad] ? 'verifySwap.whyFails' : 'verifySwap.whyHolds', { ...nums, i: bad + 1, lhs: L.numberText(f.lhs), c: L.numberText(f.c) });
    };
    const first = fails[0] ? 0 : 1;
    return {
      id: 'verifySwap', kind: 'choice', prompt: Cq(k, 'verifySwap.prompt', nums),
      options: spin(['only1', 'only2', 'both'], seed).map((o) => (o === right ? { text: Cq(k, `verifySwap.${o}`), correct: true } : { text: Cq(k, `verifySwap.${o}`), why: whyOf(o) })),
      hints: [Cq(k, 'verifySwap.hint1', nums), Cq(k, 'verifySwap.hint2', nums)],
      explain: Cq(k, 'verifySwap.explain', { ...nums, i: first + 1, lhs: L.numberText(r.facts[first].lhs), c: L.numberText(r.facts[first].c) }),
    };
  },
  answerWhy: ({ k, model, def, sv, plan, seed }) => {
    const [u0, u1] = model.ids;
    const nounOf = (id) => def.unknowns.find((u) => u.id === id)?.noun ?? id;
    const nums = { v0: L.numberText(sv[u0]), v1: L.numberText(sv[u1]), n0: nounOf(u0), n1: nounOf(u1), first: plan.first.letter };
    return {
      id: 'answerWhy', kind: 'choice', prompt: Cq(k, 'answerWhy.prompt', nums),
      options: spin([
        { text: Cq(k, 'answerWhy.right'), correct: true },
        { text: Cq(k, 'answerWhy.wrongPair'), why: Cq(k, 'answerWhy.whyPair', nums) },
        { text: Cq(k, 'answerWhy.wrongOne', nums), why: Cq(k, 'answerWhy.whyOne', nums) },
      ], seed),
      hints: [Cq(k, 'answerWhy.hint1', nums), Cq(k, 'answerWhy.hint2', nums)], explain: Cq(k, 'answerWhy.explain', nums),
    };
  },
  rule: ({ k, model, def, plan, seed }) => {
    const [u0, u1] = model.ids;
    const nounOf = (id) => def.unknowns.find((u) => u.id === id)?.noun ?? id;
    const l0 = plan?.first?.letter ?? u0;
    return {
      id: 'rule', kind: 'choice', prompt: <MathText>{k('discoveryPrompt')}</MathText>,
      options: spin([
        { text: <MathText>{k('discStory')}</MathText>, correct: true },
        { text: <MathText>{k('discHalf', { l0 })}</MathText>, why: <MathText>{k('discHalfWhy', { l0, n0: nounOf(u0), n1: nounOf(u1) })}</MathText> },
        { text: <MathText>{k('discSystem')}</MathText>, why: <MathText>{k('discSystemWhy')}</MathText> },
      ], seed),
      hints: [Cq(k, 'rule.hint1'), Cq(k, 'rule.hint2')],
      // la récapitulation SANS le tableau de la page (« جدول الكتاب » : verdict L3.13, OQ5)
      explain: Pq(k, 'ruleRecap'),
    };
  },
  /* l'histoire REFUSE : quelle valeur ne se compte pas ? (vérité : le rejeu) */
  naturalTap: ({ k, lab, def, seed }) => {
    const c = P.naturalChoice(lab);
    const countNoun = def.countNoun ?? '';
    const bad = c.options.find((o) => o.id === c.right);
    const o = { countNoun, letter: bad?.letter, v: bad ? L.numberText(bad.v) : '' };
    return {
      id: 'naturalTap', kind: 'choice', prompt: Pq(k, 'naturalTap.prompt', o),
      options: spin(c.options, seed).map((x) => {
        if (x.id === 'none') return x.id === c.right ? { text: Pq(k, 'naturalTap.none'), correct: true } : { text: Pq(k, 'naturalTap.none'), why: Pq(k, 'naturalTap.whyNone', o) };
        const text = <MathText>{$(`${x.letter} = ${L.fracLatex(x.v)}`)}</MathText>;
        return x.id === c.right ? { text, correct: true } : { text, why: Pq(k, 'naturalTap.whyOk', { letter: x.letter, v: L.numberText(x.v) }) };
      }),
      hints: [Pq(k, 'naturalTap.hint1'), Pq(k, 'naturalTap.hint2')], explain: Pq(k, 'naturalTap.explain', o),
    };
  },
  /* le verdict du DOSSIER (verdict L3.11 : une question à choix, pas une construction à trois cases) */
  refuseTap: ({ k, lab, model, def, seed }) => {
    const c = P.naturalChoice(lab);
    const bad = c.options.find((o) => o.id === c.right);
    const other = c.options.find((o) => o.id !== c.right && o.id !== 'none');
    const un = (id) => def.unknowns.find((u) => u.id === id);
    const nv = L.toNumber(bad.v); const ov = L.toNumber(other.v);
    const total = L.numberText(model.target[P.countRow(model) - 1]?.c ?? 0);
    const o = { letter: bad.letter, v: L.numberText(bad.v), abs: String(Math.abs(nv)), countNoun: def.countNoun ?? '', total };
    return {
      id: 'refuseTap', kind: 'choice', prompt: Pq(k, 'refuseTap.prompt'),
      options: spin([
        { text: Pq(k, 'refuseTap.right', o), correct: true },
        { text: Pq(k, 'refuseTap.wrongAbs', { n: String(Math.abs(nv)), words: countWords(un(bad.id), nv) }), why: Pq(k, 'refuseTap.whyAbs', o) },
        { text: Pq(k, 'refuseTap.wrongOther', { n: L.numberText(other.v), words: countWords(un(other.id), ov) }), why: Pq(k, 'refuseTap.whyOther', o) },
      ], seed),
      hints: [Pq(k, 'refuseTap.hint1'), Pq(k, 'refuseTap.hint2', o)], explain: Pq(k, 'refuseTap.explain'),
    };
  },
  ruleNatural: ({ k, lab, seed }) => {
    const v = lab.replay?.values ?? {};
    const ids = Object.keys(lab.gates);
    const pair = `(${ids.map((id) => L.fracLatex(v[id] ?? 0)).join(' ; ')})`;
    return {
      id: 'ruleNatural', kind: 'choice', prompt: Pq(k, 'ruleNatural.prompt'),
      options: spin([
        { text: Pq(k, 'ruleNatural.right'), correct: true },
        { text: Pq(k, 'ruleNatural.wrongAll'), why: Pq(k, 'ruleNatural.whyAll', { pair }) },
        { text: Pq(k, 'ruleNatural.wrongMethod'), why: Pq(k, 'ruleNatural.whyMethod') },
      ], seed),
      hints: [Pq(k, 'ruleNatural.hint1'), Pq(k, 'ruleNatural.hint2')], explain: Pq(k, 'ruleNatural.explain'),
    };
  },
};

/* ══════════════ Le composant ══════════════ */

/** La manche libre choisit une histoire (`choices`) : chaque histoire est un labo NEUF (clé). */
export default function StoryModellerPlayer(props) {
  const { choices } = props;
  const [choiceId, setChoiceId] = useState(choices?.[0]?.id ?? null);
  const picked = choices?.find((c) => c.id === choiceId);
  const merged = picked ? { ...props, ...picked.props, choices, lead: props.lead, mission: props.mission } : props;
  return <PlayerCore key={choiceId ?? 'main'} {...merged} choiceId={choiceId} onChoose={setChoiceId} />;
}

function PlayerCore({
  system: system0, unknowns, named = false, facts, chips, story, answer, title, lead, mission, level, checkpoints: cpOn = true,
  onTrial, onVerdict, onFinished, coach: coachOn = true, chains: chainsMode = 'none', predict: predictList = [], choices, choiceId, onChoose,
  items = {}, onesPlaced = false, freeFirstModel = false, countNoun,
}) {
  const { t } = useTranslation('lesson');
  const uid = useId();
  const k = useCallback((key, o) => t(`manipulation.storyModeller.${key}`, o), [t]);
  const state = useManipulation({ type: 'story-modeller', initialNumbers: { system: system0 }, initialMode: 'student', initialLevel: level, withLevels: false, hintCount: 3 });
  const def = useMemo(() => ({ unknowns, facts, chips, story, answer, countNoun }), [unknowns, facts, chips, story, answer, countNoun]);
  const model = useMemo(() => L.parseModel({ system: system0, unknowns, facts, chips }), [system0, unknowns, facts, chips]);
  const ids = model.ids;
  const useless = useMemo(() => P.uselessKeys(chips), [chips]);
  const fresh = useCallback(() => P.playerInit(model, { named, onesPlaced }), [model, named, onesPlaced]);

  const sceneKey = `${state.epoch}:${state.resetCount}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [lab, setLab] = useState(fresh);
  const [said, setSaid] = useState(null);
  const [gesture, setGesture] = useState(0);
  const [doneIds, setDoneIds] = useState([]);
  const [journal, setJournal] = useState([]);
  const [preds, setPreds] = useState({});
  const [shownPreds, setShownPreds] = useState([]);
  const [predHold, setPredHold] = useState(false);
  const [missionBig, setMissionBig] = useState(false);
  const touched = useRef(false);
  const modelKeys = useRef(new Set());
  const modelRefusals = useRef(0);
  const trialKeys = useRef(new Set());
  const discoveredSent = useRef(false);
  const asked = useRef(new Set());
  const heardPred = useRef(new Set());
  const holdTimer = useRef(null);
  const wipe = () => {
    touched.current = false; modelKeys.current = new Set(); modelRefusals.current = 0; trialKeys.current = new Set(); discoveredSent.current = false;
  };
  let labNow = lab;
  if (scene.key !== sceneKey) {
    // « إعادة » : TOUT recommence — les cases, les essais, les prédictions et les questions
    labNow = fresh();
    setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(labNow); setSaid(null); setDoneIds([]); setJournal([]); setPreds({}); setShownPreds([]);
    setPredHold(false); asked.current = new Set(); heardPred.current = new Set(); wipe();
  }
  const lb = labNow;
  useEffect(() => { if (scene.inits > 0) state.report(onTrial, { tk: 'reset' }); }, [scene.inits]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la résolution ── */
  const solving = lb.stage === 'solve' || lb.stage === 'verify' || lb.stage === 'answer';
  const sys = useMemo(() => (solving ? L.studentSystem(lb, model) : null), [solving, lb.slots, model]); // eslint-disable-line react-hooks/exhaustive-deps
  const plan = useMemo(() => (sys && lb.method ? L.solvePlan(sys, ids, lb.method) : null), [sys, lb.method, ids]);
  const isSolved = plan ? L.solved(lb, plan) : false;
  const sv = plan ? P.storyValues(lb, plan, model) : null;
  const ui = { plan };
  const spec = P.chainsOf(chainsMode);

  /* ── les suites, posées quand ce qu'elles interrogent est là, après les résultats des prédictions ── */
  const cpSettings = useLabCheckpointSettings('story-modeller');
  const cpLive = cpOn && cpSettings.enabled;
  const predItems = (predictList ?? []).filter((p) => P.PREDICT_KEYS.includes(p.key)).slice(0, 2);
  const predKeys = predItems.map((p) => p.key);
  const judged = P.judgedPredictions(lb, predKeys.filter((key) => key in preds), plan);
  const pendingPreds = judged.filter((key) => !heardPred.current.has(key));
  const holdChain = pendingPreds.length > 0 || predHold;
  const pending = cpLive && !holdChain ? P.pendingSpec(chainsMode, lb, ui, doneIds) : null;
  // la place des bonnes réponses varie d'une histoire à l'autre ; elle ne bouge JAMAIS sous le doigt quand une question s'ouvre (revue 2026-11-12)
  const seed = model.chips.reduce((a, c) => a + Math.round(Math.abs(L.toNumber(c.value))), 0);
  const cp = useLabCheckpoint({
    id: pending?.id ?? null,
    questions: pending ? pending.qs.map((q) => QUESTIONS[q]({ k, model, def, lab: lb, plan, sv, seed: seed + pending.id.length })) : null,
    reached: !!pending,
    resetKey: scene.inits,
    onRetry: () => {
      setLab((s) => P.retryPlayerStage(s, model, { onesPlaced }));
      discoveredSent.current = false; trialKeys.current = new Set();
      state.report(onTrial, { tk: 'retry' });
    },
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setDoneIds((d) => (d.includes(id) ? d : [...d, id]));
      if (['rule', 'ruleNatural', 'buildSum'].includes(id)) { state.discover(); state.formalize(); }
    },
  });
  const blockedAt = (at) => cpLive && P.momentBlocked(chainsMode, lb, ui, doneIds, at);

  useEffect(() => {
    if (P.discovered(lb) && !discoveredSent.current) {
      discoveredSent.current = true; state.report(onTrial, { tk: 'discovered' });
      // sans suite à poser (questions coupées, ou une manche sans questions : ⭐, libre), la découverte du labo suffit
      if (!cpLive || !spec.specs.length) { state.discover(); state.formalize(); }
    }
  }, [lb]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, { system: system0 }); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la prédiction, avant le premier geste ; commandes figées pendant elle et pendant une question ── */
  const nextPred = predItems.find((p) => !asked.current.has(p.key)) ?? null;
  const predictOpen = cpLive && !cp.open && !missionBig && !touched.current && nextPred != null;
  const locked = cp.open || predictOpen;
  const lockedRef = useRef(false);
  lockedRef.current = locked;
  const touch = () => { touched.current = true; };
  const sayPredict = (says) => {
    const key = nextPred.key;
    const ok = String(says) === String(P.predictTruth(model, key));
    asked.current.add(key);
    playSfx('pop');
    setPreds((m) => ({ ...m, [key]: ok }));
    state.report(onTrial, { tk: 'predict', ok });
    setGesture((g) => g + 1);
  };
  const pendingSig = pendingPreds.join('|');
  useEffect(() => {
    if (!pendingSig) return;
    const keys = pendingSig.split('|');
    keys.forEach((key) => heardPred.current.add(key));
    setShownPreds(keys.map((key) => ({ key, ok: preds[key] })));
    playSfx(keys.every((key) => preds[key]) ? 'correct' : 'pop');
    setPredHold(true);
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => setPredHold(false), PRED_HOLD_MS);
  }, [pendingSig]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(holdTimer.current), []);
  useEffect(() => { if (cp.open) setShownPreds([]); }, [cp.open]);

  /* ── les mots ── */
  const unknownOf = (id) => def.unknowns.find((u) => u.id === id) ?? {};
  const nounOf = (id) => unknownOf(id).noun ?? id;
  const unknownOfLetter = (letter) => ids.find((id) => lb.naming[id] === letter);
  const nounOfLetter = (letter) => nounOf(unknownOfLetter(letter));
  const chipMeta = (key) => {
    if (key === L.ONE) return { v: '1', label: k('player.oneLabel') };
    const i = Number(String(key).slice(1));
    return { v: L.numberText(model.chips[i].value), label: def.chips[i]?.label ?? '' };
  };
  const quote = (row) => def.facts[row - 1]?.quote ?? '';
  const reasonText = (row, d) => {
    if (d.reason === 'incomplete') return k('reason_incomplete', { n: row });
    const c = d.chip ? chipMeta(d.chip) : { v: '', label: '' };
    const vars = { ...c, quote: quote(row), other: quote(3 - row), n: row };
    if (d.reason === 'unused') return k('player.reason_unused', vars);
    if (d.reason === 'swapped') {
      const right = d.slot === 'a' ? ids[1] : ids[0]; const wrong = d.slot === 'a' ? ids[0] : ids[1];
      return k('reason_swapped', { ...vars, noun: nounOfLetter(right), letter: right, wrongLetter: wrong });
    }
    return k(`reason_${d.reason}`, vars);
  };

  /* ── le geste : porter (lettres, nombres, valeurs) ── */
  const drag = useDragInteraction({
    accepts: (src, zone) => {
      if (lockedRef.current) return '';
      if (src.startsWith('unk:') && (zone.startsWith('noun:') || zone.startsWith('known:'))) return L.canName(lb, src.slice(4), zone);
      if (src.startsWith('chip:') && zone.startsWith('slot:')) return L.canFill(lb, src.slice(5), zone);
      if (src.startsWith('val:') && zone.startsWith('gate:')) return L.canGate(lb, src.slice(4), zone);
      return '';
    },
    onDrop: (src, zone) => {
      if (lockedRef.current) return;
      touch(); playSfx('tooth'); setGesture((g) => g + 1);
      if (src.startsWith('unk:')) { setLab((s) => L.name(s, src.slice(4), zone.slice(5))); setSaid(null); }
      else if (src.startsWith('chip:')) { setLab((s) => L.fill(s, src.slice(5), zone)); setSaid(null); }
      else if (src.startsWith('val:')) { setLab((s) => L.gate(s, src.slice(4), zone)); setSaid(null); }
    },
    onReject: (src, zone, reason) => {
      if (lockedRef.current || !reason) return;
      playSfx('over'); setGesture((g) => g + 1);
      if (reason === 'known') setSaid({ key: 'raw', text: k('known', chipMeta(zone.slice(6))), refusal: true });
      else if (reason === 'taken') { const id = zone.slice(5); setSaid({ key: 'raw', text: k('taken', { noun: nounOf(id), letter: lb.naming[id] }), refusal: true }); }
    },
  });

  /* ── actions ── */
  const act = (fn) => () => { if (lockedRef.current) return; touch(); fn(); };
  const verifyModel = act(() => {
    // une case vide n'est pas une traduction : on le DIT, sans compter un essai de modèle (ni un raté)
    const empty = [1, 2].find((row) => !L.rowComplete(lb, row));
    if (empty) { playSfx('over'); setGesture((g) => g + 1); setSaid({ key: 'raw', text: k('reason_incomplete', { n: empty }), refusal: true }); return; }
    const next = P.checkPlayerModel(lb, model, useless);
    if (next === lb) return;
    const key = P.modelKey(lb);
    const ok = next.verdict.ok;
    setLab(next); setGesture((g) => g + 1);
    playSfx(ok ? 'bell' : 'over');
    const bad = next.verdict.rows.findIndex((r) => !r.ok);
    const why = ok ? '' : reasonText(bad + 1, next.verdict.rows[bad]);
    setSaid(ok ? { key: 'modelOk' } : { key: 'modelKo', why, refusal: true });
    if (!modelKeys.current.has(key)) {
      modelKeys.current.add(key);
      const free = !ok && freeFirstModel && modelRefusals.current === 0;
      if (!ok) modelRefusals.current += 1;
      state.report(onTrial, { tk: 'model', ok, key, ...(free ? { free: true } : {}) });
      setJournal((j) => [...j, { kind: 'model', ok, short: ok ? '' : k(`player.short.${next.verdict.rows[bad].reason}`) }]);
    }
  });
  const doReplay = act(() => {
    if (!plan) return;
    if (!L.gatesDone(lb)) { playSfx('over'); setGesture((g) => g + 1); setSaid({ key: 'raw', text: k('player.gatesFirst'), refusal: true }); return; }
    const next = L.replay(lb, model, plan.values);
    const key = P.trialKey(lb, plan.values);
    setLab(next); setGesture((g) => g + 1);
    const r = next.replay;
    playSfx(r.ok ? 'bell' : 'over');
    const exact = P.trialExact(r);
    if (!trialKeys.current.has(key)) {
      trialKeys.current.add(key);
      state.report(onVerdict, { groups: 0, exact });
      setJournal((j) => [...j, { kind: 'replay', values: ids.map((id) => L.numberText(r.values[id])), word: r.ok ? 'ok' : exact ? 'natural' : 'order' }]);
    }
    setSaid(null);
  });

  /* ── le verdict de la colonne : DÉRIVÉ de l'état (jamais d'un événement passé) ── */
  const replayWhy = (r) => {
    const f = r.facts.findIndex((x) => !x.ok);
    if (f >= 0) return k('factKo', { quote: quote(f + 1), c: iso(L.numberText(r.facts[f].c)), lhs: iso(L.numberText(r.facts[f].lhs)) });
    const id = r.natural.bad[0];
    return k('naturalKo', { noun: nounOf(id), v: iso(L.numberText(r.values[id])) });
  };
  const verdictOf = () => {
    if (said?.key === 'raw') return { text: said.text, refusal: true };
    if (said?.key === 'modelKo' && lb.stage === 'model' && lb.verdict && !lb.verdict.ok) return { text: k('player.verdict.modelKo', { why: said.why }), refusal: true };
    if (lb.stage === 'name') return { text: k(L.namingDone(lb) ? 'player.verdict.named' : 'player.verdict.name') };
    if (lb.stage === 'model') return { text: k(lb.verdict?.ok ? 'player.verdict.modelOk' : 'player.verdict.model') };
    if (lb.stage === 'solve') {
      if (plan && lb.half === 'refused') return { text: k('player.verdict.halfRefused', { letter: plan.first.letter }), refusal: true };
      return { text: k(isSolved ? 'player.verdict.solved' : 'player.verdict.solve') };
    }
    if (lb.stage === 'verify') {
      const r = lb.replay;
      if (!r) return { text: k('player.verdict.verify') };
      if (r.ok) return { text: k('player.verdict.replayOk') };
      if (P.trialExact(r)) return { text: k('player.verdict.refused', { why: replayWhy(r) }), refusal: true };
      return { text: k('player.verdict.replayKo', { why: replayWhy(r) }), refusal: true };
    }
    if (lb.stage === 'answer') {
      if (spec.answerBuild) return { text: k('player.buildNote') };
      if (lb.answer == null) return { text: k('player.verdict.answer') };
      return lb.answer === (answer?.correct ?? 0) ? { text: k('player.verdict.answered') } : { text: k('player.verdict.answerWrong'), refusal: true };
    }
    return { text: k('player.verdict.start') };
  };
  const verdict = verdictOf();
  const liveKey = `${lb.stage}:${gesture}`;

  /* ── la colonne : l'étape, le verdict, les prédictions, le journal ── */
  const stagesShown = named ? L.STAGES.slice(1) : L.STAGES;
  const stageN = Math.max(0, stagesShown.indexOf(lb.stage)) + 1;
  const journalId = `${uid}-journal`;
  const playerRepresentation = !cp.open && (
    <div className="space-y-2" data-sm-player-col>
      <p className="text-center text-xs font-black text-indigo-900" data-sm-stage-of>
        {k('player.stageOf', { n: stageN, total: stagesShown.length })} · {k(`stage${lb.stage[0].toUpperCase()}${lb.stage.slice(1)}`).replace(/^\d+\s*·\s*/, '')}
      </p>
      <p className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-bold leading-snug ${verdict.refusal ? 'text-rose-800' : 'text-slate-800'}`} data-sm-verdict-box data-refusal={verdict.refusal ? 'true' : 'false'}>
        {verdict.refusal && <span aria-hidden="true">✗ </span>}<MathText>{bidi(verdict.text)}</MathText>
      </p>
      {shownPreds.map((pr) => (
        <p key={pr.key} data-sm-predict-result={pr.ok ? 'ok' : 'wrong'} className={`rounded-2xl px-4 py-2 text-center text-lg font-black ${pr.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
          {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}
        </p>
      ))}
      {journal.length > 0 && (
        <div data-sm-journal>
          <p id={journalId} className="text-sm font-black text-indigo-900"><span aria-hidden="true">📋 </span>{k('player.journal')}</p>
          <table className="mt-1 w-full text-center text-xs" aria-labelledby={journalId}>
            <thead><tr className="bg-slate-50"><th scope="col">{k('player.colDid')}</th><th scope="col">{k('player.colStory')}</th></tr></thead>
            <tbody>
              {journal.slice(-5).map((row, i) => (
                <tr key={`${i}-${row.kind}`} data-sm-journal-row={row.kind}>
                  <th scope="row" className="border border-slate-200 font-normal">
                    {row.kind === 'model' ? k('player.rowModel') : <>{k('player.rowReplay')} <MathText>{$(`(${row.values.join(' ; ')})`)}</MathText></>}
                  </th>
                  <td className="border border-slate-200 font-bold">
                    <span aria-hidden="true">{(row.kind === 'model' ? row.ok : row.word === 'ok') ? '✓ ' : '✗ '}</span>
                    {row.kind === 'model' ? (row.ok ? k('player.word.modelOk') : k('player.word.modelKo', { why: row.short })) : k(`player.word.${row.word}`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  /* ── le guide ── */
  const coachRaw = coachOn && !locked ? P.coachOf(lb, { plan, blocking: cp.blocking }) : null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const coachStep = useMemo(() => coachRaw, [coachRaw?.id]);
  const coach = useLabCoach({
    lab: 'story-modeller', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: t('manipulation.common.coach.hide'), show: t('manipulation.common.coach.show'), ok: t('manipulation.common.coach.ok'), stop: t('manipulation.common.coach.stop') },
  });

  /* ── la colonne : la prédiction ou la question PREND la place ── */
  const predWord = (key, says) => {
    if (says === 'same') return k('predict.same');
    if (says === 'both') return k('predict.both');
    const u = unknownOf(says);
    return key === 'dearer' ? u.short ?? nounOf(says) : k('predict.rejects', { thing: u.short ?? nounOf(says) });
  };
  const trayNode = predictOpen ? (
    <PredictTray attr="sm" key={nextPred.key} step={predKeys.indexOf(nextPred.key) + 1} of={predKeys.length}
      title={t('manipulation.common.cp.predict.title')}
      prompt={k(`predict.${nextPred.key}`)}
      options={P.predictOptions(model, nextPred.key, nextPred.pos ?? 0).map((says) => ({ says, text: predWord(nextPred.key, says) }))}
      onSay={sayPredict} />
  ) : cp.open ? cp.node : null;

  const frozen = locked ? { 'aria-disabled': true } : {};
  const backTo = (stage) => act(() => { setLab((s) => L.backTo(s, stage)); setSaid(null); });

  /* ── la scène : une étape à la fois, l'histoire toujours au-dessus ── */
  return (
    <ManipulationShell
      type="story-modeller"
      title={bidi(title ?? k('player.title'))}
      mission={mission}
      lead={typeof lead === 'string' ? <MathText>{lead}</MathText> : lead}
      state={state}
      coach={coachOn ? coach : null}
      allowModeSwitch={false}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided
      hideRepresentation={locked || undefined}
      onIntroChange={setMissionBig}
      sidePanel={trayNode ? <div data-sm-tray-col>{trayNode}</div> : null}
      hints={[]}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      representation={playerRepresentation}
      discovery={null}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-amber-50/60 to-white" data-dragging={drag.dragging ? 'true' : undefined}>
        <div className="relative space-y-2" data-story-modeller data-player="" data-stage={lb.stage} data-system={system0}>
          {/* la région vivante TOUJOURS montée : une clé par geste */}
          <div role="status" aria-live="polite" className="sr-only" data-sm-verdict-live>
            <span key={liveKey}>{verdict.refusal ? `${k('player.cueRefused')} ` : ''}{verdict.text}</span>
            {shownPreds.map((pr) => <span key={pr.key}> {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}</span>)}
          </div>

          {choices?.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-labelledby={`${uid}-choices`} data-sm-choices>
              <span id={`${uid}-choices`} className="text-sm font-bold text-slate-600">{k('player.choicesLabel')}</span>
              {choices.map((c) => (
                <button key={c.id} type="button" aria-pressed={c.id === choiceId} data-sm-choice={c.id} {...frozen}
                  onClick={() => { if (!lockedRef.current && c.id !== choiceId) onChoose?.(c.id); }}
                  className={`min-h-[44px] rounded-xl border-2 px-3 text-sm font-black ${ring} ${c.id === choiceId ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-300 bg-white text-slate-700'}`}>
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {/* L'HISTOIRE, à chaque étape (verdict L3.15) */}
          <div className={`rounded-2xl border-2 border-amber-200 bg-white px-3 py-1.5 ${predictOpen ? 'ring-4 ring-amber-300 ring-offset-2' : ''}`} data-sm-story>
            <p className="text-sm leading-snug text-slate-800"><span className="font-black text-amber-900">{k('player.storyTitle')}: </span><MathText>{bidi(story ?? '')}</MathText></p>
          </div>

          {/* ═════════ 1) المجاهيل ═════════ */}
          {lb.stage === 'name' && (
            <div className="space-y-2" data-sm-core>
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-1.5">
                <span className="text-xs font-bold text-amber-900">{k('lettersTitle')}</span>
                <div className="flex gap-1.5" role="group" aria-label={k('lettersTitle')} data-coach="letters">
                  {ids.map((letter, i) => (
                    <DraggableObject key={letter} drag={drag} id={`unk:${letter}`} label={k('player.letterLabel', { letter })}
                      className={`min-h-[44px] min-w-[48px] rounded-xl border-2 bg-white px-2 font-mono text-xl font-black shadow-sm ${ring}`}
                      style={{ borderColor: LETTER_COLORS[i], color: LETTER_COLORS[i], opacity: unknownOfLetter(letter) ? 0.55 : 1 }}>
                      <span dir="ltr">{letter}</span>
                    </DraggableObject>
                  ))}
                </div>
                {L.namingDone(lb) && (
                  <span data-coach="open" className="ms-auto">
                    <button type="button" onClick={act(() => setLab(L.openModel))} data-sm-open="model" {...frozen} className={`${btn} bg-emerald-700 text-white`}>
                      {k('openModel')} <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1" aria-label={k('nounsTitle')} role="group">
                {nounZones(model, ids).map((z) => {
                  if (z.kind === 'unknown') {
                    const letter = lb.naming[z.id];
                    return (
                      <DropZone key={z.id} drag={drag} id={`noun:${z.id}`} tone="indigo" minHeight="min-h-[44px]" data-sm-noun={z.id}
                        label={letter ? k('nounZoneNamed', { noun: nounOf(z.id), letter }) : k('nounZone', { noun: nounOf(z.id) })}>
                        <div className="flex h-full flex-wrap items-center justify-center gap-1 p-1 text-center">
                          <span className="text-sm font-bold leading-tight text-slate-800">{nounOf(z.id)}</span>
                          {letter && (
                            <span className="inline-flex items-center gap-1">
                              <span dir="ltr" className="rounded-lg bg-indigo-100 px-1.5 font-mono text-base font-black text-indigo-800">{letter}</span>
                              <button type="button" aria-label={k('removeLetter', { letter, noun: nounOf(z.id) })} {...frozen}
                                onClick={(e) => { e.stopPropagation(); if (!lockedRef.current) setLab((s) => L.unname(s, z.id)); }}
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-200 ${ring}`}><XIcon className="h-4 w-4" aria-hidden="true" /></button>
                            </span>
                          )}
                        </div>
                      </DropZone>
                    );
                  }
                  const c = chipMeta(z.key);
                  return (
                    <DropZone key={z.key} drag={drag} id={`known:${z.key}`} tone="slate" minHeight="min-h-[44px]" data-sm-noun={`known:${z.key}`} label={k('knownZone', c)}>
                      <div className="flex h-full items-center justify-center p-1 text-center text-sm leading-tight text-slate-700">
                        <span><bdi dir="ltr" className="font-mono font-bold">{c.v}</bdi> {c.label}</span>
                      </div>
                    </DropZone>
                  );
                })}
              </div>
            </div>
          )}

          {/* le rappel des inconnues nommées (étapes 2 à 5) */}
          {lb.stage !== 'name' && (
            <p className="flex flex-wrap items-center gap-x-3 rounded-xl bg-indigo-50 px-2 py-0.5 text-sm text-slate-800" data-sm-named>
              <span className="font-bold text-indigo-900">{k('namedTitle')}</span>
              {ids.map((letter, i) => (
                <span key={letter}><bdi dir="ltr" className="font-mono font-black" style={{ color: LETTER_COLORS[i] }}>{letter}</bdi> : {nounOfLetter(letter)}</span>
              ))}
            </p>
          )}

          {/* ═════════ 2) الترجمة ═════════ */}
          {lb.stage === 'model' && (
            <div className="space-y-1.5" data-sm-core>
              {[1, 2].map((row) => {
                const v = lb.verdict?.rows?.[row - 1];
                return (
                  <div key={row} className={`rounded-2xl border-2 p-1 ${v ? (v.ok ? 'border-emerald-300 bg-emerald-50/50' : 'border-amber-300 bg-amber-50/60') : 'border-slate-200 bg-white'}`}
                    data-sm-row={row} data-ok={v ? String(v.ok) : undefined} data-reason={v && !v.ok ? v.reason : undefined}>
                    <div className="flex flex-wrap items-center justify-between gap-x-2">
                      <p className="text-sm"><span className="font-bold text-slate-600">{k('factN', { n: row })}: </span><span className="font-bold text-slate-900">«{bidi(quote(row))}»</span></p>
                      <div dir="ltr" className="flex flex-nowrap items-center gap-1 font-mono text-lg font-extrabold text-slate-700">
                        {L.SLOTS.map((s, si) => {
                          const key = lb.slots[row][s];
                          const c = key ? chipMeta(key) : null;
                          const bad = v && !v.ok && v.slot === s;
                          const slotName = s === 'c' ? k('slotC') : k('slotA', { letter: ids[si] });
                          return (
                            <React.Fragment key={s}>
                              {s === 'c' && <span aria-hidden="true">=</span>}
                              <DropZone drag={drag} id={L.slotId(row, s)} tone="amber" minHeight="min-h-[44px]"
                                className={`min-w-[3.5rem] ${bad ? '!border-solid !border-rose-500 ring-2 ring-rose-200' : ''}`}
                                label={k('slotLabel', { n: row, slot: slotName, value: c ? c.v : k('slotEmpty') })}>
                                <span className="flex h-full min-h-[42px] items-center justify-center px-1.5">
                                  {c ? <span>{c.v}</span> : <span className="text-base text-slate-300">□</span>}
                                  {bad && <span className="ms-0.5 text-sm text-rose-700" aria-hidden="true">✗</span>}
                                </span>
                              </DropZone>
                              {s === 'a' && <span style={{ color: LETTER_COLORS[0] }}>{ids[0]}</span>}
                              {s === 'a' && <span aria-hidden="true">+</span>}
                              {s === 'b' && <span style={{ color: LETTER_COLORS[1] }}>{ids[1]}</span>}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="flex flex-wrap items-stretch gap-1.5 rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-1.5">
                <span className="w-full text-xs font-bold text-amber-900">{k('chipsTitle')}</span>
                <div className="flex flex-wrap items-stretch gap-1.5" role="group" aria-label={k('chipsTitle')} data-coach="chips" data-sm-reserve>
                  {model.chips.map((c) => {
                    const m = chipMeta(c.key);
                    return (
                      <DraggableObject key={c.key} drag={drag} id={`chip:${c.key}`} label={k('player.chipLabel', m)}
                        className={`flex min-h-[44px] min-w-0 flex-col items-center justify-center rounded-xl border-2 border-amber-500 bg-white px-1.5 py-0.5 shadow-sm ${ring}`}>
                        <span dir="ltr" className="font-mono text-lg font-extrabold leading-tight text-amber-900">{m.v}</span>
                        <span className="line-clamp-1 max-w-[7.5rem] text-[11px] leading-tight text-slate-600">{m.label}</span>
                      </DraggableObject>
                    );
                  })}
                </div>
                <span className="ms-auto flex items-center gap-1.5">
                  {lb.verdict?.ok ? (
                    <span data-coach="open">
                      <button type="button" onClick={act(() => setLab(L.openSolve))} data-sm-open="solve" {...frozen} className={`${btn} bg-emerald-700 text-white`}>
                        {k('openSolve')} <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </span>
                  ) : (
                    <span data-coach="check">
                      <button type="button" onClick={verifyModel} data-sm-check {...frozen} className={`${btn} bg-indigo-700 text-white`}>
                        <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> {k('check')}
                      </button>
                    </span>
                  )}
                </span>
              </div>
              {!named && <BackButton onClick={backTo('name')} label={k('backName')} frozen={frozen} />}
            </div>
          )}

          {/* ═════════ 3) الحل ═════════ */}
          {lb.stage === 'solve' && sys && (
            <div className="space-y-1.5" data-sm-core>
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label={k('methodTitle')}>
                <span dir="ltr" className="text-sm"><MathText>{$(L.systemLatex(sys, ids))}</MathText></span>
                <span className="text-sm font-bold text-slate-700">{k('methodTitle')}</span>
                <span className="flex gap-1.5" data-coach="method">
                  {['sub', 'add'].map((m) => (
                    <button key={m} type="button" aria-pressed={lb.method === m} data-sm-method={m} {...frozen}
                      onClick={act(() => setLab((s) => L.chooseMethod(s, m)))}
                      className={`inline-flex min-h-[44px] items-center rounded-xl border-2 px-3 text-sm font-bold ${ring} ${lb.method === m ? 'border-indigo-700 bg-indigo-700 text-white' : 'border-indigo-300 bg-white text-indigo-800'}`}>
                      {k(m === 'sub' ? 'methodSub' : 'methodAdd')}
                    </button>
                  ))}
                </span>
              </div>
              {plan && lb.revealed > 0 && (
                <ol className="space-y-0.5 rounded-xl border-2 border-slate-200 bg-white px-2 py-1 text-sm">
                  {plan.lines.slice(0, lb.revealed).map((ln, i) => (
                    <li key={`${lb.method}-${i}`} className="flex flex-wrap items-center gap-x-2 leading-tight" data-sm-line={i}>
                      <span className="text-xs font-bold text-slate-600"><MathText>{k(`line_${ln.key}`, ln.vars)}</MathText></span>
                      <span dir="ltr" className="whitespace-nowrap font-mono"><MathText>{$(ln.tex)}</MathText></span>
                    </li>
                  ))}
                </ol>
              )}
              {plan && lb.revealed === plan.halfAt + 1 && lb.half !== 'more' && (
                <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border-2 border-sky-200 bg-sky-50 p-1.5" data-coach="half">
                  <p className="text-sm font-bold text-sky-950">{k('halfQuestion', { letter: plan.first.letter })}</p>
                  <button type="button" data-sm-half="done" {...frozen} onClick={act(() => setLab((s) => L.claimHalf(s, 'done')))} className={`${btn} border-2 border-slate-300 bg-white text-slate-800`}>{k('halfDone')}</button>
                  <button type="button" data-sm-half="more" {...frozen} onClick={act(() => setLab((s) => L.claimHalf(s, 'more')))} className={`${btn} border-2 border-sky-500 bg-white text-sky-900`}>{k('halfMore', { other: plan.second.letter })}</button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {plan && L.canReveal(lb, plan) && !blockedAt('typed') && (
                  <span data-coach="next">
                    <button type="button" onClick={act(() => setLab((s) => L.reveal(s, plan)))} data-sm-next {...frozen} className={`${btn} border-2 border-indigo-300 bg-white text-indigo-800`}>
                      <ChevronDown className="h-5 w-5" aria-hidden="true" /> {k('nextLine')}
                    </button>
                  </span>
                )}
                {isSolved && (
                  <button type="button" onClick={act(() => setLab((s) => L.openVerify(s, plan)))} data-sm-open="verify" {...frozen} className={`${btn} bg-emerald-700 text-white`}>
                    {k('openVerify')} <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
                <BackButton onClick={backTo('model')} label={k('backModel')} frozen={frozen} />
              </div>
            </div>
          )}

          {/* ═════════ 4) التحقق ═════════ */}
          {lb.stage === 'verify' && plan && (
            <div className="space-y-1.5" data-sm-core>
              <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-1.5">
                <span className="text-xs font-bold text-amber-900">{k('valuesTitle')}</span>
                <div className="flex gap-1.5" role="group" aria-label={k('valuesTitle')} data-coach="values">
                  {ids.map((letter, i) => (
                    <DraggableObject key={letter} drag={drag} id={`val:${letter}`} label={k('valueLabel', { letter, v: L.numberText(plan.values[letter]) })}
                      className={`min-h-[44px] rounded-xl border-2 bg-white px-3 font-mono text-lg font-extrabold shadow-sm ${ring}`}
                      style={{ borderColor: LETTER_COLORS[i], color: LETTER_COLORS[i], opacity: Object.values(lb.gates).includes(letter) ? 0.55 : 1 }}>
                      <span dir="ltr">{letter} = {L.numberText(plan.values[letter])}</span>
                    </DraggableObject>
                  ))}
                </div>
                <span className="ms-auto flex gap-1.5">
                  {!P.refused(lb) && (
                    <span data-coach="replay">
                      <button type="button" onClick={doReplay} aria-disabled={!L.gatesDone(lb) || locked || undefined} data-sm-replay-go
                        className={`${btn} bg-indigo-700 text-white aria-disabled:opacity-50`}>
                        <PlayCircle className="h-5 w-5" aria-hidden="true" /> {k('replayGo')}
                      </button>
                    </span>
                  )}
                  {lb.replay?.ok && !blockedAt('replayOk') && (
                    <button type="button" onClick={act(() => setLab(L.openAnswer))} data-sm-open="answer" {...frozen} className={`${btn} bg-emerald-700 text-white`}>
                      {k('openAnswer')} <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5" data-sm-scene>
                {ids.map((id, gi) => {
                  const letter = lb.gates[id];
                  const value = letter ? plan.values[letter] : null;
                  const shown = lb.replay && value != null ? value : null;
                  return (
                    <DropZone key={id} drag={drag} id={L.gateId(id)} tone="emerald" minHeight="min-h-[96px]"
                      label={k('player.trayAria', { noun: nounOf(id), value: letter ? `${letter} = ${L.numberText(value)}` : k('player.trayEmpty') })}>
                      <div className="flex flex-col items-center gap-0.5 p-1" data-sm-tray={id} data-count={shown != null ? L.fracText(shown) : ''}>
                        <span className="text-center text-sm font-bold text-slate-800">{nounOf(id)}</span>
                        {letter
                          ? <span dir="ltr" className="rounded-lg bg-white px-2 font-mono font-extrabold" style={{ color: LETTER_COLORS[ids.indexOf(letter)] }}>{letter} = {L.numberText(value)}</span>
                          : <span className="text-xs text-slate-500">{k('player.trayEmpty')}</span>}
                        <Tray item={items[id]} value={shown} count={model.hasCount} notCountable={k('player.notCountable')} index={gi} />
                      </div>
                    </DropZone>
                  );
                })}
              </div>
              {!P.refused(lb) && <BackButton onClick={backTo('model')} label={k('backModel')} frozen={frozen} />}
            </div>
          )}

          {/* ═════════ 5) الإجابة ═════════ */}
          {lb.stage === 'answer' && !spec.answerBuild && (
            <div className="space-y-1.5" data-sm-answer data-sm-core>
              <p className="text-sm font-bold text-slate-800">{k('answerTitle')}</p>
              <div className="grid gap-1.5">
                {spin((answer?.options ?? []).map((o, i) => ({ o, i })), seed).map(({ o, i }) => {
                  const picked = lb.answer === i;
                  const right = i === (answer?.correct ?? 0);
                  const tone = picked ? (right ? 'border-emerald-600 bg-emerald-50' : 'border-amber-500 bg-amber-50') : 'border-slate-300 bg-white';
                  return (
                    <button key={i} type="button" aria-pressed={picked} data-sm-option={i} {...frozen}
                      onClick={act(() => setLab((s) => L.chooseAnswer(s, i, answer?.correct ?? 0)))}
                      className={`min-h-[44px] rounded-xl border-2 px-3 py-1.5 text-start text-sm font-bold text-slate-800 ${ring} ${tone}`}>
                      {picked && <span aria-hidden="true">{right ? '✓ ' : '✗ '}</span>}{bidi(o)}
                      {picked && <span className="sr-only">{right ? k('player.cueOk') : k('player.cueRefused')}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {lb.stage === 'answer' && spec.answerBuild && (
            <p className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-900" data-sm-answer data-sm-core>{k('player.buildNote')}</p>
          )}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ───────────────────────── petites pièces ───────────────────────── */

/** Les zones de noms : les deux inconnues MÊLÉES aux données (jamais groupées à part, ce qui dirait la réponse). Jetons muets exclus. */
function nounZones(model, ids) {
  const knowns = model.chips.filter((c) => c.key !== L.ONE).map((c) => ({ kind: 'known', key: c.key }));
  const out = [...knowns];
  out.splice(Math.min(1, out.length), 0, { kind: 'unknown', id: ids[0] });
  out.splice(Math.min(4, out.length), 0, { kind: 'unknown', id: ids[1] });
  return out;
}

function BackButton({ onClick, label, frozen }) {
  return (
    <button type="button" onClick={onClick} data-sm-back {...frozen}
      className={`inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 ${ring}`}>
      <ArrowRight className="h-4 w-4" aria-hidden="true" /> {label}
    </button>
  );
}

/**
 * LE PLATEAU d'une porte : ce que la valeur COMPTE, dessiné (des crayons, des livres, des maillots…) en grille presque carrée dans une image de
 * hauteur fixe ; une valeur qui ne se compte pas (négative ou fractionnaire) dessine un plateau VIDE pointillé et « ✗ لا يُعدّ » en texte (un indice
 * qui n'est pas une couleur). Une histoire d'argent (deux prix) dessine une étiquette de prix avec l'objet, sans grille.
 */
function Tray({ item, value, count, notCountable, index }) {
  const color = item?.color ?? (index ? '#E11D48' : '#2563EB');
  if (!count) {
    return (
      <svg viewBox="0 0 96 48" width="72" height="36" aria-hidden="true" focusable="false" data-sm-tag>
        <path d="M18 6 H90 V42 H18 L6 24 Z" fill="#fff" stroke={color} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="18" cy="24" r="4" fill={color} fillOpacity="0.35" />
        <g transform="translate(40 8) scale(1.1)"><Glyph kind={item?.glyph} color={color} /></g>
      </svg>
    );
  }
  if (value == null) return <span className="block h-16" aria-hidden="true" />;
  const n = L.toNumber(value);
  if (!Number.isInteger(n) || n < 0) {
    return (
      <span className="flex h-16 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-rose-400 bg-rose-50/40" data-sm-not-countable>
        <span className="text-sm font-black text-rose-800"><span aria-hidden="true">✗ </span>{notCountable}</span>
      </span>
    );
  }
  const shown = Math.min(n, 40);
  const cols = Math.max(1, Math.ceil(Math.sqrt(shown * 1.6)));
  const rows = Math.max(1, Math.ceil(shown / cols));
  const S = 26;
  return (
    <span className="flex w-full items-center justify-center" dir="ltr" aria-hidden="true">
      <svg viewBox={`0 0 ${cols * S} ${rows * S}`} preserveAspectRatio="xMidYMid meet" className="h-16 max-w-full" focusable="false">
        {Array.from({ length: shown }, (_, i) => (
          <g key={i} transform={`translate(${(i % cols) * S + 1} ${Math.floor(i / cols) * S + 1})`}><Glyph kind={item?.glyph} color={color} /></g>
        ))}
      </svg>
    </span>
  );
}

/** Un objet en 24 × 24 (dessiné, jamais une image) : crayon, cahier, stylo, règle, gomme, livre, ballon, ballon de volley, maillot, lait, yaourt, brique de jus, part de gâteau. */
function Glyph({ kind, color = '#2563EB' }) {
  switch (kind) {
    case 'pencil': return <g><rect x="3" y="9" width="15" height="6" rx="1" fill={color} /><path d="M18 9 L23 12 L18 15 Z" fill="#FCD9B6" /><path d="M21.5 11.2 L23 12 L21.5 12.8 Z" fill="#334155" /><rect x="1" y="9" width="2.5" height="6" fill="#F472B6" /></g>;
    case 'notebook': return <g><rect x="4" y="2" width="16" height="20" rx="2" fill={color} /><rect x="7" y="2" width="1.5" height="20" fill="#fff" fillOpacity="0.6" /><rect x="10" y="7" width="7" height="3" rx="1" fill="#fff" /></g>;
    case 'pen': return <g><rect x="3" y="10" width="15" height="4" rx="2" fill={color} /><path d="M18 10 L23 12 L18 14 Z" fill="#94A3B8" /><rect x="5" y="8.5" width="6" height="1.5" rx="0.7" fill="#334155" /></g>;
    case 'ruler': return <g><rect x="1" y="8" width="22" height="8" rx="1" fill={color} />{[4, 8, 12, 16, 20].map((x) => <rect key={x} x={x} y="8" width="1" height={x % 8 === 0 ? 4 : 2.5} fill="#fff" />)}</g>;
    case 'eraser': return <g><path d="M4 14 L12 6 L20 14 L12 22 Z" fill={color} /><path d="M4 14 L8 10 L16 18 L12 22 Z" fill="#fff" fillOpacity="0.55" /></g>;
    case 'book': return <g><rect x="3" y="3" width="17" height="18" rx="1.5" fill={color} /><rect x="5" y="17" width="15" height="3" fill="#fff" /><rect x="7" y="6" width="9" height="2" rx="1" fill="#fff" fillOpacity="0.7" /></g>;
    case 'ball': return <g><circle cx="12" cy="12" r="10" fill="#fff" stroke={color} strokeWidth="1.5" /><path d="M12 8 L15.5 10.5 L14 14.5 L10 14.5 L8.5 10.5 Z" fill={color} /></g>;
    case 'volley': return <g><circle cx="12" cy="12" r="10" fill="#FEF3C7" stroke={color} strokeWidth="1.5" /><path d="M12 2 Q8 10 12 12 Q17 15 21 10 M12 12 Q9 17 5 19" fill="none" stroke={color} strokeWidth="1.5" /></g>;
    case 'shirtLong': return <g><path d="M8 3 L12 5 L16 3 L23 9 L20 12 L18 10 L18 22 L6 22 L6 10 L4 12 L1 9 Z" fill={color} /><path d="M1 9 L4 12 L2 21 L-1 20 Z" fill={color} transform="translate(1 0)" /><path d="M23 9 L20 12 L22 21 L25 20 Z" fill={color} transform="translate(-1 0)" /></g>;
    case 'shirtShort': return <g><path d="M8 3 L12 5 L16 3 L22 8 L19 12 L18 11 L18 22 L6 22 L6 11 L5 12 L2 8 Z" fill={color} /></g>;
    case 'milk': return <g><path d="M8 2 H16 V6 L19 10 V22 H5 V10 L8 6 Z" fill="#fff" stroke={color} strokeWidth="1.5" /><rect x="6.5" y="13" width="11" height="5" fill={color} /></g>;
    // la synthèse de l'unité 5 (2026-11-12) : une brique de jus avec sa paille, une part de gâteau
    case 'juice': return <g><rect x="6" y="5" width="12" height="17" rx="1.5" fill={color} /><rect x="6" y="5" width="12" height="4" fill="#fff" fillOpacity="0.45" /><circle cx="12" cy="15" r="3" fill="#FDE68A" /><path d="M15 5 L17 1" stroke="#0EA5E9" strokeWidth="1.5" /></g>;
    case 'cake': return <g><path d="M3 20 L21 20 L19 9 L5 9 Z" fill={color} /><rect x="4" y="7" width="16" height="3.5" rx="1.7" fill="#fff" fillOpacity="0.75" /><circle cx="12" cy="5" r="2.2" fill="#DC2626" /></g>;
    case 'yogurt': return <g><path d="M5 6 H19 L17 22 H7 Z" fill={color} /><rect x="4" y="3" width="16" height="3" rx="1" fill="#fff" stroke={color} strokeWidth="1" /></g>;
    default: return <circle cx="12" cy="12" r="9" fill={color} />;
  }
}
