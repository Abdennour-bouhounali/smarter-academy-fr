import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Repeat, CheckCheck, Lock } from 'lucide-react';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import PredictTray from '../primitives/PredictTray';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { useLabCoach } from '../primitives/LabCoach';
import { useMissionArea } from '../../mission/missionPlayerContext';
import MathText from '../../components/MathText';
import { playSfx } from '../../utils/playEffect';
import * as L from '../logic/pairScoreboard';
import * as P from '../logic/pairScoreboardPlayer';
import { MatchCard, Coin, ValueBar, Deco } from './PairScoreboard';

/*
 * pair-scoreboard — LECTEUR DE MISSION (rollout 2026-11-12, unité 5 leçon 1 `mafhum-jumla` ; conseil du 2026-11-11, verdict « L1 », X7).
 * La page (`PairScoreboard.jsx`, enseignant, mode classe) est INCHANGÉE : ce composant n'est monté que dans le lecteur (`useInMissionPlayer()`),
 * joué en MANCHES (LabRounds). Logique pure : `logic/pairScoreboardPlayer.js` (essais, gratuités, découvertes, suites, prédictions, guide).
 *   - Les deux poignées partent d'une ثنائية EXPLICITE (`start`). Les deux jauges sont MASQUÉES pendant le geste et lues au relâchement
 *     (verdict L1.2 a, précédent `solution-ray`) : la valeur posée (relâchement, pause du clavier) est la seule façon de les lire.
 *   - Un ESSAI = une ثنائية nouvelle validée ; une réponse refusée compte une fois ; ce que le but exige est GRATUIT (`free`) ; en manche
 *     COUVERTE (`covered`), la jauge (2) est cachée et seule une réponse sur une ثنائية nouvelle est un essai. `onVerdict { groups, exact, free? }`.
 *   - `readings` : 'values' (la valeur de chaque condition, r1–r2 : les constructions sont l'écriture de l'élève) ou 'lines' (les substitutions).
 *   - `chains` : season · coins · covered · none ; `predict` (clés, ≤ 2) ; `discover` : contrast · many · covered (annoncée `{ tk: 'discovered' }`).
 *   - `swap` : le bouton « اقلب الثنائية » (r2, ⭐, libre — l'ordre est rencontré UNE fois par la main, L1.6) ; `counter` : « n من 3 » (r2).
 *   - Journal « 📋 جدول تجاربك » et verdict dans la colonne ; commandes figées pendant une prédiction ou une question (`aria-disabled`) ;
 *     région vivante TOUJOURS montée ; AUCUN défilement : le monde est une BANDE dont la hauteur vient de la zone du lecteur.
 */
const PRED_HOLD_MS = 1600;
const PLAYER_CHROME = 150;
const ringP = 'focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2';
const $ = (x) => `$${x}$`;
const texNode = (v) => <MathText>{$(v)}</MathText>;
const pairT = (x, y) => $(L.pairTex(x, y));
const spin = (xs, seed) => { const s0 = ((seed % xs.length) + xs.length) % xs.length; return xs.map((_, i) => xs[(i + s0) % xs.length]); };
const seedOf = (lab) => (lab.shape.kind === 'count' ? lab.shape.N + lab.shape.V : 7);
const lastLine = (lab, i, x, y) => { const l = L.readingTex(lab, i, x, y).lines; return l[l.length - 1]; };
const fullLine = (lab, i, x, y) => L.readingTex(lab, i, x, y).lines.join(' \\quad ');

/* ══════════════ Les questions du lecteur (LabCheckpoint) ══════════════ */

const Pq = (k, key, o) => <MathText>{k(`player.q.${key}`, o)}</MathText>;

export const QUESTIONS = {
  /* OBSERVER sa ثنائية à une seule jauge (r1) — en VALEURS : la ligne de substitution est l'écriture que la construction demande ensuite */
  halfWhich: (lab, k) => {
    const h = L.halfTrial(lab); const w = h.ok[0] ? 1 : 2; const o = 3 - w;
    const val = (i) => P.gaugeValue(lab, i - 1, h.x, h.y);
    const nums = { pair: pairT(h.x, h.y), w, o, hw: val(w).have, tw: val(w).target, ho: val(o).have, to: val(o).target };
    const opts = [1, 2].map((n) => (n === w
      ? { text: Pq(k, `halfWhich.only${n}`), correct: true }
      : { text: Pq(k, `halfWhich.only${n}`), why: Pq(k, 'halfWhich.whyOnly', { ...nums, n, h: val(n).have, t: val(n).target }) }));
    opts.push({ text: Pq(k, 'halfWhich.both'), why: Pq(k, 'halfWhich.whyBoth', nums) });
    return {
      id: 'halfWhich', kind: 'choice', prompt: Pq(k, 'halfWhich.prompt', nums), options: opts,
      hints: [Pq(k, 'halfWhich.hint1', nums), Pq(k, 'halfWhich.hint2', nums)], explain: Pq(k, 'halfWhich.explain', nums),
    };
  },
  /* BÂTIR ce qu'a calculé la jauge (2) : « 17 = 3 × 5 + 2 », UN leurre (15 : les victoires seules) */
  buildLine: (lab, k) => {
    const b = P.buildLine(lab); const s = lab.solved;
    const o = { pair: pairT(s.x, s.y), p: lab.shape.p, x: s.x, y: s.y, v: b.expected[0], decoy: b.decoy, line: $(`${b.expected[0]} = ${lab.shape.p} \\times ${s.x} + ${s.y}`) };
    return {
      id: 'buildLine', kind: 'build', prompt: Pq(k, 'buildLine.prompt', o),
      slots: [k('player.slot.points'), k('player.slot.wins'), k('player.slot.draws')], ops: b.ops,
      tiles: spin(b.tiles, seedOf(lab) + 1), render: (n) => texNode(String(n)), expected: b.expected,
      hints: [Pq(k, 'buildLine.hint1', o), Pq(k, 'buildLine.hint2', o)], explain: Pq(k, 'buildLine.explain', o),
    };
  },
  /* BÂTIR la condition (2) de la cagnotte : « 50x + 20y = 300 », UN leurre (330 : le montant de SA ثنائية renversée) */
  buildEq2: (lab, k) => {
    const b = P.buildEq2(lab); const s = lab.solved; const { p, q, V, N } = lab.shape;
    const o = { p, q, V, N, decoy: b.decoy, swap: pairT(s.y, s.x), eq: $(`${p}x + ${q}y = ${V}`), eq1: $(`x + y = ${N}`) };
    return {
      id: 'buildEq2', kind: 'build', prompt: Pq(k, 'buildEq2.prompt', o),
      slots: [k('player.slot.coinX', { p }), k('player.slot.coinY', { q }), k('player.slot.amount')], ops: b.ops,
      tiles: spin(b.tiles, seedOf(lab)), render: (n) => texNode(String(n)), expected: b.expected,
      hints: [Pq(k, 'buildEq2.hint1', o), Pq(k, 'buildEq2.hint2', o)], explain: Pq(k, 'buildEq2.explain', o),
    };
  },
  /* LA RÈGLE, après deux cas différents (r1, r2), sur les essais de l'élève */
  rule: (lab, k) => {
    const sol = lab.solved;
    const only1 = L.halfTrial(lab, 1);
    const sw = { x: sol.y, y: sol.x };
    const options = [{ text: Pq(k, 'rule.right'), correct: true }];
    if (only1) options.push({ text: Pq(k, 'rule.first'), why: Pq(k, 'rule.whyFirst', { pair: pairT(only1.x, only1.y) }) });
    if (sol.x !== sol.y) options.push({ text: Pq(k, 'rule.any'), why: Pq(k, 'rule.whyAny', { pair: pairT(sw.x, sw.y) }) });
    return {
      id: 'rule', kind: 'choice', prompt: Pq(k, 'rule.prompt'), options: spin(options, seedOf(lab) + 2),
      hints: [Pq(k, 'rule.hint1'), Pq(k, 'rule.hint2')],
      explain: (
        <div className="space-y-2" data-pair-formal>
          <EquationDisplay tone="neutral" tex={L.systemWrittenTex(lab)} note={<MathText>{k('fSystem')}</MathText>} />
          <EquationDisplay tone="result" tex={L.pairTex(sol.x, sol.y)} note={<MathText>{k('fSolution', { pair: pairT(sol.x, sol.y), x: sol.x, y: sol.y })}</MathText>} />
          <p className="text-sm text-emerald-900"><MathText>{k('fRule')}</MathText></p>
        </div>
      ),
    };
  },
  /* LIRE la jauge (2) découverte (r3) : 29 · 13 · 24 */
  readCovered: (lab, k) => {
    const r = P.readCovered(lab); const s = lab.solved;
    const o = { pair: pairT(s.x, s.y), v: r.right, p: lab.shape.p, x: s.x, y: s.y, r: $(fullLine(lab, 1, s.x, s.y)) };
    return {
      id: 'readCovered', kind: 'choice', cols: 3, prompt: Pq(k, 'readCovered.prompt', o),
      options: spin([{ v: r.right, ok: true }, ...r.wrong], seedOf(lab)).map((c) => (c.ok
        ? { text: texNode(String(c.v)), correct: true }
        : { text: texNode(String(c.v)), why: Pq(k, `readCovered.why_${c.id}`, { ...o, w: c.v }) })),
      hints: [Pq(k, 'readCovered.hint1', o), Pq(k, 'readCovered.hint2', o)], explain: Pq(k, 'readCovered.explain', o),
    };
  },
  /* LES CAS PARTICULIERS (module 2, décision du propriétaire OQ1) : pourquoi les deux jauges ne s'allument JAMAIS / TOUJOURS ensemble */
  whyNever: (lab, k) => {
    const f = P.parallelFacts(lab);
    const o = { ...f, n: P.gauge1Pairs(lab).length };
    return {
      id: 'whyNever', kind: 'choice', prompt: Pq(k, 'whyNever.prompt', o),
      options: spin([
        { text: Pq(k, 'whyNever.right', o), correct: true },
        { text: Pq(k, 'whyNever.notYet'), why: Pq(k, 'whyNever.whyNotYet', o) },
        { text: Pq(k, 'whyNever.broken'), why: Pq(k, 'whyNever.whyBroken', o) },
      ], seedOf(lab)),
      hints: [Pq(k, 'whyNever.hint1', o), Pq(k, 'whyNever.hint2', o)], explain: Pq(k, 'whyNever.explain', o),
    };
  },
  whyAlways: (lab, k) => {
    const f = P.parallelFacts(lab);
    const o = { ...f, n: P.gauge1Pairs(lab).length, more: f.N + 1, moreV: f.p * (f.N + 1) };
    return {
      id: 'whyAlways', kind: 'choice', prompt: Pq(k, 'whyAlways.prompt', o),
      options: spin([
        { text: Pq(k, 'whyAlways.right', o), correct: true },
        { text: Pq(k, 'whyAlways.first'), why: Pq(k, 'whyAlways.whyFirst', o) },
        { text: Pq(k, 'whyAlways.any', o), why: Pq(k, 'whyAlways.whyAny', o) },
      ], seedOf(lab) + 1),
      hints: [Pq(k, 'whyAlways.hint1', o), Pq(k, 'whyAlways.hint2', o)], explain: Pq(k, 'whyAlways.explain', o),
    };
  },
  /* POURQUOI un refus à saison pleine (r3) — seulement quand la manche en a un */
  coveredWhy: (lab, k) => {
    const c = P.fullRefused(lab);
    const o = { pair: pairT(c.x, c.y), r2: $(lastLine(lab, 1, c.x, c.y)), r1: $(lastLine(lab, 0, c.x, c.y)) };
    return {
      id: 'coveredWhy', kind: 'choice', prompt: Pq(k, 'coveredWhy.prompt', o),
      options: spin([
        { text: Pq(k, 'coveredWhy.right', o), correct: true },
        { text: Pq(k, 'coveredWhy.notFull'), why: Pq(k, 'coveredWhy.whyNotFull', o) },
        { text: Pq(k, 'coveredWhy.big'), why: Pq(k, 'coveredWhy.whyBig', o) },
      ], seedOf(lab) + 1),
      hints: [Pq(k, 'coveredWhy.hint1', o), Pq(k, 'coveredWhy.hint2', o)], explain: Pq(k, 'coveredWhy.explain', o),
    };
  },
};

export default function PairScoreboardPlayer({
  system: system0 = 'x+y=7|3x+y=17', theme, ranges, start, title, lead, mission, level, checkpoints: cpOn = true, onFinished, onTrial,
  coach: coachOn = true, onVerdict, chains: chainsMode = 'none', discover = 'contrast', covered = false, readings = 'lines', free = null,
  predict: predictList = [], counter = false, swap: swapOn = true, choices, choiceSpec, nouns,
}) {
  const { t } = useTranslation('lesson');
  const uid = useId();
  const k = useCallback((key, o) => t(`manipulation.pairScoreboard.${key}`, o), [t]);
  const state = useManipulation({ type: 'pair-scoreboard', initialNumbers: { system: system0 }, initialMode: 'student', initialLevel: level, withLevels: false, hintCount: 3 });
  const { system } = state.numbers;
  const here = choices?.length ? P.choiceProps({ choiceSpec }, system) : { system, theme, ranges, start };
  const make = () => P.initRound(here);
  const rule = { covered, free };

  const sceneKey = `${system}:${state.epoch}:${state.resetCount}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [lab, setLab] = useState(make);
  const labRef = useRef(lab);
  const [liveX, setLiveX] = useState(null);
  const [liveY, setLiveY] = useState(null);
  const [said, setSaid] = useState(null);
  const [gesture, setGesture] = useState(0);
  const [doneIds, setDoneIds] = useState([]);
  const [preds, setPreds] = useState({});
  const [shownPreds, setShownPreds] = useState([]);
  const [predHold, setPredHold] = useState(false);
  const [moved, setMoved] = useState({ x: false, y: false });
  const [choiceSaid, setChoiceSaid] = useState(null);
  const [missionBig, setMissionBig] = useState(false);
  const discoveredSent = useRef(false);
  const asked = useRef(new Set());
  const heardPred = useRef(new Set());
  const holdTimer = useRef(null);
  // « إعادة » ou une autre jumla : TOUT recommence — la manche, les essais, les prédictions et les questions
  let lb = lab;
  if (scene.key !== sceneKey) {
    lb = make();
    labRef.current = lb;
    setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(lb); setLiveX(null); setLiveY(null); setSaid(null); setDoneIds([]);
    setPreds({}); setShownPreds([]); setPredHold(false); setMoved({ x: false, y: false });
    discoveredSent.current = false; asked.current = new Set(); heardPred.current = new Set();
  }
  useEffect(() => { if (scene.inits > 0) state.report(onTrial, { tk: 'reset' }); }, [scene.inits]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── les suites, posées quand ce qu'elles interrogent est là, après les résultats des prédictions ── */
  const cpSettings = useLabCheckpointSettings('pair-scoreboard');
  const cpLive = cpOn && cpSettings.enabled;
  const specs = P.chainsOf(chainsMode);
  const predKeys = predictList.filter((key) => P.PRED_KEYS.includes(key)).slice(0, 2);
  const judged = P.judgedPredictions(lb, predKeys.filter((key) => key in preds));
  const pendingPreds = judged.filter((key) => !heardPred.current.has(key));
  const holdChain = pendingPreds.length > 0 || predHold;
  const pendingSpec = cpLive && !holdChain ? specs.find((sp) => sp.reached(lb) && !doneIds.includes(sp.id)) ?? null : null;
  const cp = useLabCheckpoint({
    id: pendingSpec?.id ?? null,
    questions: pendingSpec ? P.questionsOf(pendingSpec, lb).map((q) => QUESTIONS[q](lb, k)) : null,
    reached: !!pendingSpec,
    resetKey: scene.inits,
    onRetry: () => {
      focusHandle();
      const fresh = make();
      labRef.current = fresh; setLab(fresh); setLiveX(null); setLiveY(null); setSaid(null); discoveredSent.current = false;
      state.report(onTrial, { tk: 'retry' });
    },
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { focusHandle(); setDoneIds((d) => (d.includes(id) ? d : [...d, id])); if (id === specs[specs.length - 1]?.id) { state.discover(); state.formalize(); } },
  });
  useEffect(() => {
    if (P.discovered(lb, discover) && !discoveredSent.current) {
      discoveredSent.current = true; state.report(onTrial, { tk: 'discovered' }); playSfx('flag');
      if (!cpLive || !specs.length) { state.discover(); state.formalize(); }
    }
  }, [lb]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, system); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la prédiction : « start » avant le premier geste, « accepted » à la réponse acceptée ; commandes figées pendant elle et une question ── */
  const untouched = lb.trials.length === 0 && lb.claimed.length === 0 && !moved.x && !moved.y;
  // « لو قلبتها » n'a de sens que pour une ثنائية aux deux nombres différents (sinon elle ne serait jamais jugée — revue 2026-11-12)
  const askable = (key) => (P.predictWhen(key) === 'start' ? untouched : !!lb.solved && lb.solved.x !== lb.solved.y && !P.swapSeen(lb));
  const focusHandle = () => setTimeout(() => boxRef.current?.querySelector('[data-pair-handle="x"]')?.focus?.(), 60);
  const nextPred = predKeys.find((key) => !asked.current.has(key) && askable(key)) ?? null;
  const predictOpen = cpLive && !cp.open && !missionBig && nextPred != null;
  const locked = cp.open || predictOpen;
  const lockedRef = useRef(false);
  lockedRef.current = locked;
  const boxRef = useRef(null);
  const sayPredict = (says) => {
    const key = nextPred;
    const ok = String(says) === String(P.predictTruth(lb, key));
    asked.current.add(key);
    playSfx('pop');
    setPreds((m) => ({ ...m, [key]: ok }));
    state.report(onTrial, { tk: 'predict', ok });
    const back = key === 'swapSol' ? '[data-pair-swap]' : '[data-pair-handle="x"]';
    setTimeout(() => boxRef.current?.querySelector(back)?.focus?.(), 60);
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

  /* ── un geste : la logique dit l'état suivant et les verdicts ── */
  const doAct = (action) => {
    const r = P.act(labRef.current, action, rule);
    labRef.current = r.lab;
    setLab(r.lab);
    r.verdicts.forEach((v) => state.report(onVerdict, v));
    setGesture((g) => g + 1);
    const last = r.lab.last;
    if (!last) { setSaid(null); return; }
    if (last.kind === 'accepted') playSfx('bell');
    else if (last.kind === 'onlyOne' || last.kind === 'none' || last.kind === 'swapOut') playSfx('over');
    setSaid({ ...last });
  };
  const tick = useRef(0);
  const tooth = () => { const now = performance.now(); if (now - tick.current > 35) { playSfx('tooth'); tick.current = now; } };

  /* ── les deux poignées ── */
  const [width, setWidth] = useState(600);
  const [overhead, setOverhead] = useState(170);
  const ctrlRef = useRef(null);
  const [ctrlH, setCtrlH] = useState(300);
  const area = useMissionArea();
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (el) { const w = Math.max(280, Math.floor(el.clientWidth)); setWidth((cur) => (cur === w ? cur : w)); }
    if (ctrlRef.current) { const h = Math.ceil(ctrlRef.current.getBoundingClientRect().height / Math.max(0.5, zoomOf(ctrlRef.current))); setCtrlH((cur) => (Math.abs(cur - h) < 4 ? cur : h)); }
    if (el && el.parentElement) {
      const sec = el.closest('[data-manipulation]');
      if (sec) { const o = Math.max(60, Math.ceil((sec.getBoundingClientRect().height - el.getBoundingClientRect().height) / Math.max(0.5, zoomOf(el)))); setOverhead((cur) => (Math.abs(cur - o) < 4 ? cur : o)); }
    }
  });
  const EDGE = 22;
  const rx = lb.range.x; const ry = lb.range.y;
  // la valeur sous le doigt se lit sur la piste TELLE QU'ELLE EST au moment du geste (`rect`), jamais sur une largeur mesurée plus tôt :
  // la colonne de côté change de largeur avec son contenu (la mission en grand, une question) et la piste avec elle (marche 2026-11-12)
  const muOf = (r, width) => (width - 2 * EDGE) / Math.max(1, r.max - r.min);
  const toValueX = useCallback((cx, _y, rect) => rx.min + (cx - rect.left - EDGE) / muOf(rx, rect.width), [rx.min, rx.max]); // eslint-disable-line react-hooks/exhaustive-deps
  const toValueY = useCallback((cx, _y, rect) => ry.min + (cx - rect.left - EDGE) / muOf(ry, rect.width), [ry.min, ry.max]); // eslint-disable-line react-hooks/exhaustive-deps
  const sx = useStretchInteraction({
    value: liveX ?? lb.x, range: rx, toValue: toValueX,
    onChange: (v) => { if (!lockedRef.current) { setLiveX(v); tooth(); } },
    onCommit: (v) => { setLiveX(null); if (lockedRef.current) return; setMoved((m) => (m.x ? m : { ...m, x: true })); doAct({ kind: 'set', which: 'x', v }); },
    direction: 'ltr',
  });
  const sy = useStretchInteraction({
    value: liveY ?? lb.y, range: ry, toValue: toValueY,
    onChange: (v) => { if (!lockedRef.current) { setLiveY(v); tooth(); } },
    onCommit: (v) => { setLiveY(null); if (lockedRef.current) return; setMoved((m) => (m.y ? m : { ...m, y: true })); doAct({ kind: 'set', which: 'y', v }); },
    direction: 'ltr',
  });
  const X = liveX ?? lb.x;
  const Y = liveY ?? lb.y;
  // LES JAUGES SE LISENT AU RELÂCHEMENT (verdict L1.2 a) : pendant le geste, ou tant que le clavier n'a pas validé, elles sont masquées
  const dragging = sx.dragging || sy.dragging;
  const readable = !dragging && X === lb.x && Y === lb.y;
  const claim = () => { if (lockedRef.current) return; sx.flush(); sy.flush(); doAct({ kind: 'claim' }); };
  const doSwap = () => { if (lockedRef.current) return; sx.flush(); sy.flush(); setLiveX(null); setLiveY(null); doAct({ kind: 'swap' }); };

  /* ── les mots du monde ── */
  const W = lb.world;
  const sh = lb.shape;
  const w = (key, o) => k(`worlds.${W}.${key}`, { ...(sh.kind !== 'none' ? sh : {}), ...o });
  const mode = P.readingsOf(lb, readings);
  const hasWorld = W === 'football' || W === 'coins';
  const gaugesNow = L.gauges(lb, lb.x, lb.y);
  const claimHere = P.claimAt(lb, lb.x, lb.y);
  const g2Hidden = covered && !claimHere;

  /* ── le verdict de la colonne et de la région vivante (dérivé de l'essai à l'état courant) ── */
  const okWord = (ok) => k(ok ? 'player.ok' : 'player.ko');
  const verdictText = () => {
    if (!said) return k('player.verdict.start');
    const pr = pairT(said.x ?? lb.x, said.y ?? lb.y);
    switch (said.kind) {
      case 'accepted': return k('player.verdict.accepted', { pair: pr });
      case 'onlyOne': return k('player.verdict.onlyOne', { pair: pr, i: said.ok[0] ? 1 : 2, j: said.ok[0] ? 2 : 1 });
      case 'none': return k('player.verdict.none', { pair: pr });
      case 'swapOut': return k('vSwapOut', { pair: pr });
      case 'sameSwap': return k('vSameSwap');
      case 'trial': return covered
        ? k('player.verdict.trialCovered', { pair: pr, g1: okWord(said.ok[0]) })
        : k('player.verdict.trial', { pair: pr, g1: okWord(said.ok[0]), g2: okWord(said.ok[1]) });
      default: return k('player.verdict.start');
    }
  };
  const shownSay = verdictText();
  const refusedNow = said?.kind === 'onlyOne' || said?.kind === 'none';
  const acceptedNow = said?.kind === 'accepted';
  const liveKey = `${said?.kind ?? 'start'}:${gesture}`;

  /* ── le journal ── */
  const journalId = `${uid}-journal`;
  const rows = lb.trials.slice(-5);
  const rowWord = (tr) => {
    const c = P.claimAt(lb, tr.x, tr.y);
    if (c) return k(c.accepted ? 'player.rowAccepted' : 'player.rowRefused');
    return k(tr.swapped ? 'player.rowSwapped' : 'player.rowTrial');
  };
  const mark = (ok) => (
    <>
      <span aria-hidden="true" className={ok ? 'text-emerald-700' : 'text-rose-700'}>{ok ? '✓' : '✗'}</span>
      <span className="sr-only">{okWord(ok)}</span>
    </>
  );
  const g1Count = P.gauge1Pairs(lb).length;
  const playerRepresentation = !locked && (
    <div className="space-y-2" data-pair-player-col>
      <p className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-bold leading-snug ${refusedNow ? 'text-rose-800' : acceptedNow ? 'text-emerald-800' : 'text-slate-800'}`}
        data-pair-verdict={said?.kind ?? ''}>
        {refusedNow && <span aria-hidden="true">✗ </span>}{acceptedNow && <span aria-hidden="true">✓ </span>}<MathText>{shownSay}</MathText>
      </p>
      {shownPreds.map((pr) => (
        <p key={pr.key} data-pair-predict-result={pr.ok ? 'ok' : 'wrong'} data-pair-predict-key={pr.key}
          className={`rounded-2xl px-4 py-2 text-center text-lg font-black ${pr.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
          {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}
        </p>
      ))}
      {counter && sh.kind === 'count' && (
        <p className="rounded-xl bg-indigo-50 px-3 py-1.5 text-center text-sm font-black text-indigo-900" data-pair-counter={Math.min(g1Count, P.GAUGE1_GOAL)}>
          {k('player.counter', { N: sh.N, n: Math.min(g1Count, P.GAUGE1_GOAL), goal: P.GAUGE1_GOAL })}
        </p>
      )}
      {rows.length > 0 && (
        <div data-pair-journal>
          <p id={journalId} className="text-sm font-black text-indigo-900"><span aria-hidden="true">📋 </span>{k('player.journal')}</p>
          <table className="mt-1 w-full text-center text-xs" aria-labelledby={journalId}>
            <thead>
              <tr className="bg-slate-50">
                <th scope="col">{k('player.colPair')}</th><th scope="col">{k('player.colG1')}</th><th scope="col">{k('player.colG2')}</th><th scope="col">{k('player.colVerdict')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((tr) => {
                const c = P.claimAt(lb, tr.x, tr.y);
                return (
                  <tr key={`${tr.x};${tr.y}`} data-pair-trial={L.pairText(tr.x, tr.y)} data-ok1={String(tr.ok[0])} data-ok2={String(tr.ok[1])}>
                    <th scope="row" className="border border-slate-200 font-bold"><bdi dir="ltr" className="font-mono">{L.pairText(tr.x, tr.y)}</bdi></th>
                    <td className="border border-slate-200">{mark(tr.ok[0])}</td>
                    <td className="border border-slate-200">{covered && !c ? <span className="text-slate-500">{k('player.rowCovered')}</span> : mark(tr.ok[1])}</td>
                    <td className="border border-slate-200">{rowWord(tr)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  /* ── le guide ── */
  const coachRaw = coachOn && !locked ? P.coachOf(lb, { done: P.discovered(lb, discover), movedX: moved.x, movedY: moved.y, covered, swap: swapOn }) : null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const coachStep = useMemo(() => coachRaw, [coachRaw?.id]);
  const coach = useLabCoach({
    lab: 'pair-scoreboard', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: t('manipulation.common.coach.hide'), show: t('manipulation.common.coach.show'), ok: t('manipulation.common.coach.ok'), stop: t('manipulation.common.coach.stop') },
  });

  /* ── la colonne : la prédiction ou la question PREND la place ── */
  const trayNode = predictOpen ? (
    <PredictTray attr="pair" key={nextPred} step={predKeys.indexOf(nextPred) + 1} of={predKeys.length}
      title={t('manipulation.common.cp.predict.title')}
      prompt={k(`predict.${nextPred}`, { N: sh.N })}
      options={P.predictOptions(nextPred).map((o) => ({ says: o.says, text: k(`predict.opt_${o.says}`) }))}
      onSay={sayPredict} />
  ) : cp.open ? cp.node : null;

  /* ── la bande du monde : sa hauteur vient de la zone du lecteur (aucun défilement) ── */
  const roomH = area?.height > 0 ? area.height - overhead - PLAYER_CHROME - ctrlH : 110;
  const stripMax = Math.max(44, Math.min(110, roomH - 40));
  const count = hasWorld ? Math.max(sh.N, (X ?? 0) + (Y ?? 0)) : 0;
  const grid = hasWorld ? P.stripGrid({ count, width: width - 16, maxHeight: stripMax }) : null;
  const frozen = locked ? { 'aria-disabled': true } : {};
  // les noms des deux nombres, du LECTEUR (« دج », jamais « DA » : les mots des mondes de la page restent ceux de la page)
  const noun = (v) => nouns?.[v] ?? k(`player.noun.${hasWorld ? W : 'abstract'}.${v}`, sh.kind === 'count' ? sh : {});

  return (
    <ManipulationShell
      type="pair-scoreboard"
      title={title ?? k('player.title')}
      mission={<MathText>{mission ?? k('player.mission')}</MathText>}
      lead={typeof lead === 'string' ? <MathText>{lead}</MathText> : lead}
      state={state}
      coach={coachOn ? coach : null}
      allowModeSwitch={false}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided
      hideRepresentation={locked || undefined}
      onIntroChange={setMissionBig}
      sidePanel={trayNode ? <div data-pair-tray>{trayNode}</div> : null}
      hints={[]}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      representation={playerRepresentation}
      discovery={null}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/70 to-white" data-dragging={dragging ? 'true' : undefined}>
        <div ref={boxRef} className="relative space-y-2" data-pair-scoreboard data-player="" data-world={W} data-system={system}
          data-x={lb.x} data-y={lb.y} data-solved={lb.solved ? 'true' : 'false'} data-covered={covered ? 'true' : undefined} data-readable={readable ? 'true' : 'false'}>
          {/* la région vivante TOUJOURS montée : une clé par geste */}
          <div role="status" aria-live="polite" className="sr-only" data-pair-verdict-live>
            <span key={liveKey}>{refusedNow ? `${k('player.srWrong')} ` : acceptedNow ? `${k('player.srRight')} ` : ''}<MathText>{shownSay}</MathText></span>
            {shownPreds.map((pr) => <span key={pr.key}> {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}</span>)}
            {choiceSaid && <span key={`${choiceSaid}:${gesture}`}> {k('player.choiceNow')}</span>}
          </div>
          {choices?.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-labelledby={`${uid}-choices`} data-pair-choices>
              <span id={`${uid}-choices`} className="text-sm font-bold text-slate-600">{k('player.choicesLabel')}</span>
              {choices.map((c) => {
                const on = c === system;
                const tex = L.systemWrittenTex(L.init({ system: c }));
                return (
                  <button key={c} type="button" data-pair-choice={c} aria-disabled={locked || undefined} aria-pressed={on}
                    onClick={() => { if (!lockedRef.current && !on) { state.setNumbers({ system: c }); setChoiceSaid(c); setGesture((g) => g + 1); } }}
                    className={`inline-flex min-h-[44px] items-center rounded-xl border-2 px-2 text-sm font-black focus:outline-none ${ringP} ${on ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-300 bg-white text-slate-700'}`}>
                    <span className="pointer-events-none" dir="ltr"><MathText>{$(tex)}</MathText></span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── le monde, en bande ── */}
          {hasWorld && (
            <div className={`rounded-2xl border-2 border-slate-200 bg-white p-1 ${predictOpen ? 'ring-4 ring-amber-300 ring-offset-2' : ''}`} data-pair-world={W} data-paging-keep>
              <div className="relative flex flex-wrap items-center gap-x-3 gap-y-0.5 pe-12 text-xs font-bold text-slate-700">
                {['x', 'y'].map((v) => {
                  const Fig = W === 'coins' ? Coin : MatchCard;
                  return (
                    <span key={v} className="inline-flex items-center gap-1">
                      <span className="inline-block h-4 w-4" aria-hidden="true"><Fig kind={v} shape={sh} /></span>
                      <bdi dir="ltr" className={v === 'x' ? 'text-blue-700' : 'text-violet-700'}>{v}</bdi> {noun(v)}
                    </span>
                  );
                })}
                <Deco world={W} />
              </div>
              <WorldStrip lab={lb} X={X} Y={Y} grid={grid} />
            </div>
          )}

          <div ref={ctrlRef} className="space-y-2" data-pair-controls>
            {/* ── les deux poignées ── */}
            {['x', 'y'].map((which) => {
              const st = which === 'x' ? sx : sy;
              const r = which === 'x' ? rx : ry;
              const v = which === 'x' ? X : Y;
              return (
                <div key={which} data-coach={`handle-${which}`}>
                  <PlayerRuler which={which} stretch={st} range={r} value={v} edge={EDGE} locked={locked}
                    handleLabel={k('handle', { name: which, noun: noun(which) })} less={k('less', { name: which })} more={k('more', { name: which })} />
                </div>
              );
            })}

            {/* ── les deux jauges, lues au relâchement ── */}
            <div className="grid grid-cols-2 gap-2">
              {[0, 1].map((i) => {
                const g = gaugesNow[i];
                const hidden = i === 1 && g2Hidden;
                const show = readable && !hidden;
                const ok = g?.ok ?? false;
                const val = P.gaugeValue(lb, i, lb.x, lb.y);
                const rd = L.readingTex(lb, i, lb.x, lb.y);
                return (
                  <section key={i} data-gauge={i + 1} data-ok={show ? String(ok) : ''} data-masked={!readable ? 'true' : undefined} data-covered-gauge={hidden ? 'true' : undefined}
                    data-coach={`gauge-${i + 1}`} role="group" aria-labelledby={`${uid}-g${i + 1}`}
                    className={`min-w-0 rounded-xl border-2 px-2 py-1.5 ${!show ? 'border-slate-200 bg-slate-50' : ok ? 'border-emerald-400 bg-emerald-50' : 'border-rose-300 bg-rose-50'}`}>
                    <div className="flex items-start justify-between gap-1">
                      <h4 id={`${uid}-g${i + 1}`} className="text-xs font-extrabold leading-tight text-slate-800">{w(i === 0 ? 'g1' : 'g2')}</h4>
                      <span aria-hidden="true" className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${!show ? 'bg-slate-600' : ok ? 'bg-emerald-700' : 'bg-rose-700'}`}>
                        {hidden ? <Lock className="h-3.5 w-3.5" /> : !show ? '…' : ok ? '✓' : '✗'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600" dir="ltr"><MathText>{$(L.eqWrittenTex(lb, i))}</MathText></p>
                    <div className="min-h-[3.25rem]" data-gauge-reading>
                      {hidden ? (
                        <p className="pt-1 text-xs font-bold text-slate-600">{k('player.covered')}</p>
                      ) : !readable ? (
                        <p className="pt-1 text-xs font-bold text-slate-500" data-gauge-masked>{k('player.masked')}</p>
                      ) : mode === 'values' && val ? (
                        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                          <p className="text-base font-black text-slate-900" data-gauge-value={val.have}>{k(`player.value.${W}${i + 1}`, { n: val.have })}</p>
                          <p className="text-xs font-bold text-slate-600">{k(W === 'coins' && i === 1 ? 'player.targetDa' : 'player.target', { n: val.target })}</p>
                          {i === 1 && <div className="w-full"><ValueBar lab={lb} X={lb.x} Y={lb.y} /></div>}
                        </div>
                      ) : (
                        <div className="flex flex-wrap content-start gap-x-3 text-sm font-bold" dir="ltr">
                          {rd.lines.map((ln) => <span key={ln}><MathText>{$(ln)}</MathText></span>)}
                        </div>
                      )}
                      {show && <span className="sr-only">{okWord(ok)}</span>}
                    </div>
                  </section>
                );
              })}
            </div>

            {/* ── les deux nombres, les renverser, répondre ── */}
            <div className="flex flex-wrap items-center gap-2" data-pair-card>
              <span className="sr-only">{k('player.pairAria', { pair: L.pairText(X, Y) })}</span>
              <p dir="ltr" aria-hidden="true" className="rounded-xl border-2 border-slate-300 bg-white px-2 py-1 font-mono text-lg font-extrabold text-slate-900">
                (<span className="text-blue-700" data-pair-value-x>{X}</span> ; <span className="text-violet-700" data-pair-value-y>{Y}</span>)
              </p>
              {swapOn && (
                <button type="button" onClick={doSwap} data-pair-swap data-coach="swap" {...frozen}
                  className={`inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-slate-500 bg-white px-2.5 text-sm font-bold text-slate-800 aria-disabled:opacity-50 focus:outline-none ${ringP}`}>
                  <span>{k('swap')}</span> <Repeat className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              <button type="button" onClick={claim} data-pair-claim data-coach="claim" {...frozen}
                className={`inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-emerald-700 bg-emerald-700 px-3 text-sm font-bold text-white aria-disabled:opacity-50 focus:outline-none ${ringP}`}>
                <span>{k('player.claim')}</span> <CheckCheck className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/** Le facteur de zoom d'un élément (le lecteur ajuste par `zoom` CSS) : pixels d'écran / pixels de mise en page. */
function zoomOf(el) {
  const r = el.getBoundingClientRect();
  return el.offsetWidth > 0 && r.width > 0 ? r.width / el.offsetWidth : 1;
}

/* ── une règle graduée, une poignée (le lecteur : aria-disabled et garde, anneau indigo) ── */
function PlayerRuler({ which, stretch, range, value, edge, handleLabel, less, more, locked }) {
  // la piste PREND la place qui reste (flex-1, min-w-0) et se MESURE elle-même : une largeur fixe calculée depuis la scène débordait
  // sur la colonne de côté quand celle-ci changeait (marche 2026-11-12)
  const [width, setWidth] = useState(320);
  const trackRef = stretch.trackProps.ref;
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    const read = () => { const w0 = Math.max(120, Math.floor(el.clientWidth)); setWidth((cur) => (cur === w0 ? cur : w0)); };
    read();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [trackRef]);
  const steps = Math.max(1, range.max - range.min);
  const mu = (width - 2 * edge) / steps;
  const px = (v) => edge + (v - range.min) * mu;
  const grads = Array.from({ length: steps + 1 }, (_, i) => range.min + i);
  const color = which === 'x' ? '#1D4ED8' : '#6D28D9';
  const atMin = value <= range.min; const atMax = value >= range.max;
  const nudge = (d) => { if (locked || (d < 0 && atMin) || (d > 0 && atMax)) return; stretch.nudge(d); };
  return (
    <div dir="ltr" className="flex min-w-0 items-center gap-2" data-pair-ruler={which}>
      <button type="button" onClick={() => nudge(-1)} aria-label={less} aria-disabled={locked || atMin || undefined} data-pair-less={which}
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 bg-white aria-disabled:opacity-40 focus:outline-none ${ringP}`}><Minus className="h-5 w-5" aria-hidden="true" /></button>
      <div {...stretch.trackProps} className="relative min-w-0 flex-1" style={{ ...stretch.trackProps.style, height: 48, ...(locked ? { pointerEvents: 'none' } : {}) }}>
        <svg width={width} height={48} className="absolute inset-0" aria-hidden="true" focusable="false">
          <rect x={edge - 4} y={24} width={steps * mu + 8} height={5} rx={2} fill={color} opacity={0.85} />
          {grads.map((u) => (
            <g key={u}>
              <line x1={px(u)} x2={px(u)} y1={30} y2={37} stroke="#64748B" strokeWidth={1.2} />
              <text x={px(u)} y={47} textAnchor="middle" fontSize={10} fill="#334155" fontFamily="ui-monospace, monospace">{String(u).replace('-', '−')}</text>
            </g>
          ))}
        </svg>
        <div
          {...stretch.handleProps({ label: handleLabel, valueText: `${which} = ${String(value).replace('-', '−')}` })}
          {...(locked ? { 'aria-disabled': true } : {})}
          data-pair-handle={which}
          className={`absolute top-0 flex h-11 min-w-[44px] -translate-x-1/2 items-start justify-center rounded-xl border-2 outline-none ${ringP} ${stretch.dragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-400 bg-white/70'}`}
          style={{ left: px(value), cursor: locked ? 'default' : stretch.dragging ? 'grabbing' : 'grab' }}
        >
          <span className="mt-0.5 whitespace-nowrap rounded-full px-1.5 font-mono text-sm font-extrabold text-white" style={{ background: color }}>{which} = {String(value).replace('-', '−')}</span>
        </div>
      </div>
      <button type="button" onClick={() => nudge(1)} aria-label={more} aria-disabled={locked || atMax || undefined} data-pair-more={which}
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 bg-white aria-disabled:opacity-40 focus:outline-none ${ringP}`}><Plus className="h-5 w-5" aria-hidden="true" /></button>
    </div>
  );
}

/* ── le monde en BANDE : le cadre de l'équation (1), les objets au-delà du cadre restent dehors ── */
function WorldStrip({ lab, X, Y, grid }) {
  const sh = lab.shape;
  const g = L.slots(sh.N, X, Y);
  const Figure = lab.world === 'coins' ? Coin : MatchCard;
  const cells = [
    ...g.inside.map((kind) => ({ kind, out: false })),
    ...Array.from({ length: g.empty }, () => ({ kind: 'empty', out: false })),
    ...g.overflow.map((kind) => ({ kind, out: true })),
  ];
  return (
    <div dir="ltr" className="mx-auto grid" style={{ gridTemplateColumns: `repeat(${grid.cols}, ${grid.cell}px)`, gap: 4, width: grid.width }}
      data-pair-frame={sh.N} data-cell={grid.cell} aria-hidden="true">
      {cells.map((c, i) => (
        <div key={i} data-pair-cell={c.kind} data-outside={c.out ? 'true' : undefined}
          className={`relative ${c.out ? 'rounded-md bg-rose-50 outline-dashed outline-2 outline-rose-400' : ''}`} style={{ width: grid.cell, height: grid.cell }}>
          {c.kind === 'empty'
            ? <div className="h-full w-full rounded-md border-2 border-dashed border-slate-300 bg-white" />
            : <div className="h-full w-full"><Figure kind={c.kind} shape={sh} /></div>}
        </div>
      ))}
    </div>
  );
}
