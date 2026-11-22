import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Scissors, SearchCheck } from 'lucide-react';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import { useManipulation } from '../useManipulation';
import useDragInteraction from '../useDragInteraction';
import useStretchInteraction from '../useStretchInteraction';
import DraggableObject from '../primitives/DraggableObject';
import DropZone from '../primitives/DropZone';
import EquationDisplay from '../primitives/EquationDisplay';
import PredictTray from '../primitives/PredictTray';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { useLabCoach } from '../primitives/LabCoach';
import { useMissionArea } from '../../mission/missionPlayerContext';
import MathText from '../../components/MathText';
import { bidi } from '../../../../utils/bidi';
import { playSfx } from '../../utils/playEffect';
import * as B from '../logic/equationBalance';
import * as P from '../logic/equationBalancePlayer';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { W, PIVOT, ARM, PW, CX, KINDS, beamGeometry, layoutPan, Item, Icon } from './equationBalanceParts';

/*
 * equation-balance — LECTEUR DE MISSION (rollout 2026-11-11, unité 4 leçon 1 `muadala-ula` ; conseil du 2026-11-11, verdict « L1 »).
 * La page (`EquationBalance.jsx`, enseignant, mode classe) est INCHANGÉE : ce composant n'est monté que dans le lecteur
 * (`useInMissionPlayer()`), joué en MANCHES (LabRounds). Logique pure : `logic/equationBalancePlayer.js` (essais, suites, prédictions, guide).
 *   - Un ESSAI est une équation NOUVELLE écrite (étape des deux plateaux, partage) ou un geste REFUSÉ (`REFUSALS`) ; le même refus deux fois dans le
 *     même état, « noneHere » et « full » ne comptent pas ; le PREMIER refus de la manche est gratuit (`free`). `onVerdict { groups: n° de la ligne,
 *     exact: true }` pour une ligne, `{ groups: 0, exact: false, free? }` pour un refus. La découverte (un sac lu ET les sacs ouverts) est
 *     annoncée une fois (`{ tk: 'discovered' }`) ; « إعادة » → `{ tk: 'reset' }`, « أعِد التجربة » → `{ tk: 'retry' }`.
 *   - Le fléau DIT un fait (« الكفّة اليمنى أثقل الآن »), jamais la règle ; le titre du labo ne paraît pas (verdict L1.2).
 *   - `handDone` : des pastilles « 1 · 2 · 3 · 4 » — un dépôt porte n objets (le geste appliqué n fois, refusé EN ENTIER si l'un l'est) ; la page
 *     garde un objet par dépôt (verdict L1.3).
 *   - `chains` : r1 · r2 · r3 · m2r1 · m2r2 · none (`logic › CHAIN_SPECS`) : observer en un toucher, BÂTIR « ▢ = ▢ » avec UN leurre, lire le sac, LA RÈGLE.
 *   - `predict` : des CLÉS (≤ 2) posées AVANT le premier geste ; options et vérité de la logique, jugées par la balance.
 *   - `kinds` : les objets de la réserve ; `choices` : des équations au choix (la manche libre) ; `coach` : le guide (`coachOf`, ancres `[data-coach]`).
 *   - Journal « 📋 جدول تجاربك » et verdict dans la colonne ; commandes figées pendant une prédiction ou une question (`aria-disabled`) ;
 *     région vivante TOUJOURS montée ; AUCUN défilement : la scène est cadrée par la largeur du labo ET la hauteur de la zone du lecteur.
 */
const PRED_MAX = 2;
const PRED_HOLD_MS = 1600;
const PLAYER_CHROME = 150;
const ringP = 'focus-visible:ring-indigo-600 focus-visible:ring-offset-2';
const $ = (x) => `$${x}$`;
const texNode = (v) => <MathText>{$(v)}</MathText>;
const spin = (xs, seed) => { const s0 = ((seed % xs.length) + xs.length) % xs.length; return xs.map((_, i) => xs[(i + s0) % xs.length]); };
const seedOf = (lab) => Math.abs(lab.start.L.a * 3 + lab.start.R.a * 5 + Math.round(B.toNumber(lab.start.L.u)) + Math.round(B.toNumber(lab.start.R.u)) * 2);
const pct = (v, total) => `${(v / total) * 100}%`;

/* ══════════════ Les questions du lecteur (LabCheckpoint) ══════════════ */

const Pq = (k, key, o) => <MathText>{k(`player.${key}`, o)}</MathText>;
const kindWord = (kind) => (kind === 'balloon' ? 'balloon' : 'ball');

export const QUESTIONS = {
  /* OBSERVER : combien de l'autre côté (r1) / qu'a-t-il mis dans l'autre plateau (r2) */
  lineChips: (lab, k, { spec, moves }) => {
    const seed = seedOf(lab);
    if (spec.chips === 'placed') {
      const pc = P.placedChips(lab);
      const opts = { balloons: { text: Pq(k, 'line.placed.balloons', { n: $(pc.n) }) }, balls: { text: Pq(k, 'line.placed.balls', { n: $(pc.n) }) }, none: { text: Pq(k, 'line.placed.none') } };
      const order = spin(pc.options, seed);
      return {
        id: 'lineChips', kind: 'choice', cols: 3, prompt: Pq(k, 'line.placed.prompt'),
        options: order.map((id) => (id === pc.right ? { ...opts[id], correct: true } : { ...opts[id], why: Pq(k, `line.placed.why_${id}`, { n: $(pc.n) }) })),
        hints: [Pq(k, 'line.placed.hint1'), Pq(k, 'line.placed.hint2')],
        explain: Pq(k, 'line.placed.explain', { n: $(pc.n) }),
      };
    }
    const c = P.lineChips(lab, { moves });
    const f = c.first;
    const o = { n: $(c.n), side: k(f.side === 'L' ? 'sideL' : 'sideR') };
    return {
      id: 'lineChips', kind: 'choice', cols: 3,
      prompt: Pq(k, `line.taken.${f.verb}_${kindWord(f.kind)}`, o),
      options: spin(c.options, seed).map((n) => (n === c.n
        ? { text: texNode(String(n)), correct: true }
        : { text: texNode(String(n)), why: Pq(k, n === 0 ? 'line.taken.whyZero' : 'line.taken.whyLeft', { n: $(n), took: $(c.n) }) })),
      hints: [Pq(k, 'line.taken.hint1'), Pq(k, 'line.taken.hint2', o)],
      explain: Pq(k, 'line.taken.explain', o),
    };
  },
  /* BÂTIR l'équation que la balance dessine, UN leurre */
  lineBuild: (lab, k, { spec }) => {
    const b = P.lineBuild(lab, spec.build);
    const eq = `${b.expected[0]} = ${b.expected[1]}`;
    const o = { eq: $(eq), decoy: $(b.decoy) };
    return {
      id: 'lineBuild', kind: 'build', prompt: Pq(k, 'line.build.prompt'),
      slots: [k('player.build.slotL'), k('player.build.slotR')], ops: ['='],
      tiles: spin(b.tiles, seedOf(lab) + 1), render: texNode,
      expected: b.expected, accept: b.accept,
      hints: [Pq(k, 'line.build.hint1'), Pq(k, 'line.build.hint2', o)], explain: Pq(k, 'line.build.explain', o),
    };
  },
  /* LIRE le sac : le poids d'UN sac (le bon, puis deux erreurs réelles) */
  readChips: (lab, k, { spec }) => {
    const r = P.readOptions(lab, spec.read);
    const tex = (v) => B.fracLatex(v);
    const o = { v: $(tex(r.right)) };
    return {
      id: 'readChips', kind: 'choice', cols: 3, prompt: Pq(k, 'read.prompt'),
      options: spin([{ val: r.right, ok: true }, ...r.wrong.map((w) => ({ val: w.val, id: w.id }))], seedOf(lab) + 2).map((x) => (x.ok
        ? { text: texNode(tex(x.val)), correct: true }
        : { text: texNode(tex(x.val)), why: Pq(k, `read.why_${x.id}`, { got: $(tex(x.val)), ...o }) })),
      hints: [Pq(k, 'read.hint1'), Pq(k, 'read.hint2')],
      explain: Pq(k, 'read.explain', o),
    };
  },
  /* LA RÈGLE de la leçon 1 : après trois cas différents */
  ruleBalance: (lab, k) => ({
    id: 'ruleBalance', kind: 'choice', prompt: Pq(k, 'rule.balance'),
    options: spin([
      { text: <MathText>{k('opt1')}</MathText>, correct: true },
      { text: <MathText>{k('opt2')}</MathText>, why: <MathText>{k('why2')}</MathText> },
      { text: <MathText>{k('opt3')}</MathText>, why: <MathText>{k('why3')}</MathText> },
    ], seedOf(lab) + 1),
    hints: [Pq(k, 'rule.hint1'), Pq(k, 'rule.hint2')],
    explain: <EquationDisplay tone="result" tex={k('rule')} note={<MathText>{k('ruleNote')}</MathText>} />,
  }),
  /* LA RÈGLE du module 2 : ax = b → b/a, après deux cas */
  ruleAxb: (lab, k) => ({
    id: 'ruleAxb', kind: 'choice', prompt: Pq(k, 'rule.axb'),
    options: spin([
      { text: texNode('\\dfrac{b}{a}'), correct: true },
      { text: texNode('\\dfrac{a}{b}'), why: Pq(k, 'rule.whyInv') },
      { text: texNode('b - a'), why: Pq(k, 'rule.whySub') },
    ], seedOf(lab)),
    hints: [Pq(k, 'rule.axbHint1'), Pq(k, 'rule.axbHint2')],
    explain: Pq(k, 'rule.axbExplain'),
  }),
};

export default function EquationBalancePlayer({
  eq: eq0 = '2x+3=11', title, lead, mission, level, checkpoints: cpOn = true, onFinished, onTrial,
  coach: coachOn = true,
  onVerdict, chains: chainsMode = 'none', predict: predictList = [], choices, kinds = ['ball', 'balloon', 'bag'], handDone = false,
}) {
  const { t } = useTranslation('lesson');
  const uid = useId();
  const k = useCallback((key, o) => t(`manipulation.equationBalance.${key}`, o), [t]);
  const state = useManipulation({ type: 'equation-balance', initialNumbers: { eq: eq0 }, initialMode: 'student', initialLevel: level, withLevels: false, hintCount: 3 });
  const { eq } = state.numbers;

  const sceneKey = `${eq}:${state.epoch}:${state.resetCount}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [lab, setLab] = useState(() => B.init(eq0));
  const [parts, setParts] = useState(1);
  const [liveParts, setLiveParts] = useState(null);
  const [qty, setQty] = useState(1);
  const [said, setSaid] = useState(null);
  const [gesture, setGesture] = useState(0);
  const [doneIds, setDoneIds] = useState([]);
  const [preds, setPreds] = useState({});
  const [shownPreds, setShownPreds] = useState([]);
  const [predHold, setPredHold] = useState(false);
  const [choiceSaid, setChoiceSaid] = useState(null);
  const [noneHereSeen, setNoneHereSeen] = useState(false);
  const [missionBig, setMissionBig] = useState(false);
  const movesRef = useRef([]);
  const written = useRef(new Set([P.lineSig(B.init(eq0).pans)]));
  const refusalKeys = useRef(new Set());
  const refusedCount = useRef(0);
  const discoveredSent = useRef(false);
  const asked = useRef(new Set());
  const heardPred = useRef(new Set());
  const holdTimer = useRef(null);
  const wipe = (src) => {
    movesRef.current = []; written.current = new Set([P.lineSig(B.init(src).pans)]); refusalKeys.current = new Set(); refusedCount.current = 0; discoveredSent.current = false;
  };
  // « إعادة » ou une autre équation : TOUT recommence — la balance, les essais, les prédictions et les questions
  let labNow = lab;
  if (scene.key !== sceneKey) {
    labNow = B.init(eq);
    setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(labNow); setParts(1); setLiveParts(null); setSaid(null); setDoneIds([]); setPreds({}); setShownPreds([]);
    setPredHold(false); setNoneHereSeen(false); asked.current = new Set(); heardPred.current = new Set(); wipe(eq);
  }
  const lb = labNow;
  useEffect(() => { if (scene.inits > 0) state.report(onTrial, { tk: 'reset' }); }, [scene.inits]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── les suites de la manche, posées quand ce qu'elles interrogent est là, après les résultats des prédictions ──
  const cpSettings = useLabCheckpointSettings('equation-balance');
  const cpLive = cpOn && cpSettings.enabled;
  const specs = P.chainsOf(chainsMode);
  const predKeys = predictList.filter((key) => P.PREDICT_KEYS.includes(key)).slice(0, PRED_MAX);
  const judged = P.judgedPredictions(lb, predKeys.filter((key) => key in preds));
  const pendingPreds = judged.filter((key) => !heardPred.current.has(key));
  const holdChain = pendingPreds.length > 0 || predHold;
  const pendingSpec = cpLive && !holdChain ? specs.find((sp) => sp.reached(lb) && !doneIds.includes(sp.id)) ?? null : null;
  const cp = useLabCheckpoint({
    id: pendingSpec?.id ?? null,
    questions: pendingSpec ? pendingSpec.qs.map((q) => QUESTIONS[q](lb, k, { spec: pendingSpec, moves: movesRef.current })) : null,
    reached: !!pendingSpec,
    resetKey: scene.inits,
    onRetry: () => {
      const fresh = B.init(eq);
      setLab(fresh); setParts(1); setLiveParts(null); setSaid(null); wipe(eq);
      state.report(onTrial, { tk: 'retry' });
    },
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { setDoneIds((d) => (d.includes(id) ? d : [...d, id])); if (specs.find((sp) => sp.id === id)?.qs.some((q) => q.startsWith('rule'))) { state.discover(); state.formalize(); } },
  });
  useEffect(() => {
    if (P.discoveryReached(lb) && !discoveredSent.current) {
      discoveredSent.current = true; state.report(onTrial, { tk: 'discovered' });
      // questions coupées (l'enseignant, pour SON compte) : la découverte du labo suffit à le formaliser
      if (!cpLive) { state.discover(); state.formalize(); }
    }
  }, [lb]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, eq); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── la prédiction, avant le premier geste ; commandes figées pendant elle et pendant une question ──
  const untouched = lb.history.length === 1 && !lb.pending && movesRef.current.length === 0;
  const nextPred = predKeys.find((key) => !asked.current.has(key)) ?? null;
  const predictOpen = cpLive && !cp.open && !missionBig && untouched && nextPred != null;
  const locked = cp.open || predictOpen;
  const lockedRef = useRef(false);
  lockedRef.current = locked;
  const boxRef = useRef(null);
  const sayPredict = (says) => {
    const key = nextPred;
    const ok = String(says) === String(P.predictTruth(lb.src, key));
    asked.current.add(key);
    playSfx('pop');
    setPreds((m) => ({ ...m, [key]: ok }));
    state.report(onTrial, { tk: 'predict', ok });
    if (!predKeys.some((x) => x !== key && !asked.current.has(x))) setTimeout(() => boxRef.current?.querySelector('[data-coach="reserve"] button, [data-coach="reserve"] [role="button"]')?.focus?.(), 60);
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

  /* ── un ESSAI : une ligne nouvelle, ou un refus ── */
  const lineTrial = (next) => {
    const sig = P.lineSig(next.pans);
    if (written.current.has(sig)) return;
    written.current.add(sig);
    state.report(onVerdict, { groups: written.current.size - 1, exact: true });
  };
  const refusalTrial = (reason, at) => {
    if (!P.isRefusal(reason)) return;
    const key = `${reason}:${P.lineSig(at.pans)}:${at.pending ? `${at.pending.L}/${at.pending.R}` : ''}`;
    if (refusalKeys.current.has(key)) return;
    refusalKeys.current.add(key);
    const free = refusedCount.current === 0;
    refusedCount.current += 1;
    state.report(onVerdict, { groups: 0, exact: false, ...(free ? { free: true } : {}) });
  };
  const heavySide = (l) => (B.tilt(l) > 0 ? 'L' : 'R');
  const commit = (next, moves) => {
    if (moves?.length) movesRef.current = [...movesRef.current, ...moves];
    const grew = next.history.length !== lb.history.length;
    setLab(next); setGesture((g) => g + 1);
    if (next.pending) setSaid({ key: 'tipped', side: heavySide(next) });
    else if (next.zero) setSaid({ key: next.zero.kind === 'bag' ? 'zeroBag' : 'zeroUnit' });
    else if (grew) setSaid({ key: next.history.at(-1).kind === 'divide' ? 'divided' : 'balanced' });
    else setSaid(null);
    if (grew) lineTrial(next);
  };

  /* ── porter : n objets d'un dépôt (handDone) — le geste appliqué n fois, refusé en entier si l'un l'est ── */
  const nHand = handDone ? qty : 1;
  const side = (zone) => zone.slice(4);
  const sequence = (sd, g, n) => {
    let cur = lb; const moves = [];
    for (let i = 0; i < n; i += 1) {
      const v = B.canGesture(cur, sd, g);
      if (v !== true) return { reason: v || '' };
      cur = B.gesture(cur, sd, g); moves.push({ g, side: sd });
    }
    return { next: cur, moves };
  };
  const drag = useDragInteraction({
    accepts: (src, zone) => {
      if (lockedRef.current) return '';
      if (src.startsWith('r:') && zone.startsWith('pan:')) { const r = sequence(side(zone), `add:${src.slice(2)}`, nHand); return r.next ? true : r.reason; }
      if (src.startsWith('p:') && zone === 'reserve') { const [, s, kind] = src.split(':'); const r = sequence(s, `remove:${kind}`, nHand); return r.next ? true : r.reason; }
      if (src.startsWith('p:') && zone.startsWith('pan:')) return src.split(':')[1] === side(zone) ? '' : 'moveAcross';
      return '';
    },
    onDrop: (src, zone) => {
      if (lockedRef.current) return;
      const r = src.startsWith('r:') ? sequence(side(zone), `add:${src.slice(2)}`, nHand) : sequence(src.split(':')[1], `remove:${src.split(':')[2]}`, nHand);
      if (!r.next) return;
      playSfx('tooth');
      if (r.next.history.length > lb.history.length) playSfx('bell');
      commit(r.next, r.moves);
    },
    onReject: (_s, _z, reason) => {
      if (lockedRef.current) return;
      if (reason) playSfx('over');
      setGesture((g) => g + 1);
      if (reason === 'noneHere') setNoneHereSeen(true);
      setSaid(reason ? { key: reason === 'tipped' ? 'tippedRefusal' : reason, refusal: true, d: B.tippedDetails(lb) ?? undefined } : null);
      refusalTrial(reason, lb);
    },
  });
  const targetFor = (id) => {
    const held = drag.held;
    if (!held || drag.dragging || held === id) return null;
    if (held.startsWith('r:') && id.startsWith('p:')) return `pan:${id.split(':')[1]}`;
    if (held.startsWith('p:') && id.startsWith('r:')) return 'reserve';
    return null;
  };
  const intercept = (id) => ({
    onPointerDownCapture: (e) => { if (targetFor(id)) { e.stopPropagation(); e.preventDefault(); } },
    onPointerUpCapture: (e) => { if (targetFor(id)) { e.stopPropagation(); e.preventDefault(); } },
    onClickCapture: (e) => { const z = targetFor(id); if (z) { e.stopPropagation(); e.preventDefault(); drag.dropHere(z); } },
    onKeyDownCapture: (e) => { const z = targetFor(id); if (z && (e.key === 'Enter' || e.key === ' ')) { e.stopPropagation(); e.preventDefault(); drag.dropHere(z); } },
  });

  /* ── partager : k parts ── */
  const kMax = 12;
  const kk = liveParts ?? parts;
  const divOk = B.canDivide(lb, kk);
  const stretch = useStretchInteraction({
    value: kk, range: { min: 1, max: kMax },
    toValue: (clientX, _y, rect) => 1 + ((clientX - rect.left - 22) / Math.max(1, rect.width - 44)) * (kMax - 1),
    onChange: (v) => { if (!lockedRef.current) setLiveParts(v); },
    onCommit: (v) => {
      setLiveParts(null);
      if (lockedRef.current) return;
      setParts(v);
      const verdict = B.canDivide(lb, v);
      if (verdict !== true && verdict.reason) { setSaid({ key: verdict.reason, refusal: true, d: verdict }); setGesture((g) => g + 1); }
    },
    direction: 'ltr',
  });
  const nudge = (d) => { if (!lockedRef.current) stretch.nudge(d); };
  const doDivide = () => {
    // la poignée montre encore une valeur non validée (clavier, ± : 700 ms) : on ne partage jamais par un autre k que celui affiché
    if (lockedRef.current || liveParts != null) return;
    const verdict = B.canDivide(lb, parts);
    if (verdict !== true) {
      if (parts >= 2) { playSfx('over'); setSaid({ key: verdict.reason, refusal: true, d: verdict }); setGesture((g) => g + 1); refusalTrial(verdict.reason, lb); }
      return;
    }
    const next = B.divide(lb, parts);
    playSfx('bell');
    setParts(1);
    commit(next, null);
    if (B.isSolved(next)) setSaid({ key: 'oneBag', v: B.fracLatex(B.readValue(next)) });
  };
  const doVerify = () => { if (lockedRef.current) return; setLab(B.verify(lb)); playSfx('flag'); setSaid({ key: 'verified' }); setGesture((g) => g + 1); };

  /* ── la scène (les sacs ouverts : le départ, chaque sac remplacé par son contenu) ── */
  const opened = lb.verified && B.isSolved(lb);
  const shownPans = useMemo(() => {
    if (!opened) return lb.pans;
    const v = B.readValue(lb);
    const sub = (p) => Object.freeze({ a: 0, u: Lin.linAt(Lin.lin(p.a, p.u), v) });
    return { L: sub(lb.start.L), R: sub(lb.start.R) };
  }, [lb, opened]);
  const counts = { L: B.drawCounts(shownPans.L), R: B.drawCounts(shownPans.R) };
  const lay = { L: layoutPan(counts.L), R: layoutPan(counts.R) };
  const contentH = Math.max(150, lay.L.height, lay.R.height);
  const SWING = 22;
  const plateY = 18 + contentH + SWING;
  const beamY = plateY + 46;
  const H = beamY + 86;
  const tilt = opened ? 0 : B.tilt(lb);
  const diff = opened ? 0 : B.toNumber(B.weight(lb, 'L')) - B.toNumber(B.weight(lb, 'R'));
  const sw = tilt === 0 ? 0 : Math.sign(diff) * Math.min(SWING, 9 + Math.abs(diff) * 1.5);
  const py = { L: plateY + sw, R: plateY - sw };
  const { angle } = beamGeometry(sw);
  const boxOf = (sd, kind) => {
    const items = [...lay[sd].ground, ...lay[sd].float].filter((it) => it.kind === kind || it.kind === `part${kind[0].toUpperCase()}${kind.slice(1)}`);
    if (!items.length) return null;
    const xs = items.map((it) => CX[sd] + it.x); const ys = items.map((it) => py[sd] + it.y);
    const pad = items[0].size / 2;
    return { x0: Math.min(...xs) - pad, x1: Math.max(...xs) + pad, y0: Math.min(...ys) - pad, y1: Math.max(...ys) + pad };
  };
  const has = (sd, kind) => { const c = counts[sd]; return { bag: c.bags > 0, anti: c.antis > 0, ball: c.balls > 0 || (c.part && !c.part.negative && kind === 'ball'), balloon: c.balloons > 0 || (c.part && c.part.negative && kind === 'balloon') }[kind]; };
  const panWords = (sd) => {
    const c = counts[sd]; const p = shownPans[sd];
    const words = [];
    if (c.bags) words.push(k('nBags', { count: c.bags }));
    if (c.antis) words.push(k('nAntis', { count: c.antis }));
    if (c.balls || (c.part && !c.part.negative)) words.push(k('unitsBalls', { v: B.fracText(p.u).replace('-', '') }));
    if (c.balloons || (c.part && c.part.negative)) words.push(k('unitsBalloons', { v: B.fracText(p.u).replace('-', '') }));
    return words.length ? words.join(k('and')) : k('emptyPan');
  };

  /* ── la taille : la largeur du labo ET la hauteur de la zone du lecteur (aucun défilement) ── */
  const sceneRef = useRef(null);
  const [width, setWidth] = useState(560);
  const [overhead, setOverhead] = useState(170);
  const area = useMissionArea();
  useLayoutEffect(() => {
    const el = boxRef.current; const sc = sceneRef.current;
    if (el) { const w = Math.max(260, Math.floor(el.clientWidth)); setWidth((cur) => (cur === w ? cur : w)); }
    if (el && sc) { const o = Math.max(90, Math.ceil(el.getBoundingClientRect().height - sc.getBoundingClientRect().height)); setOverhead((cur) => (Math.abs(cur - o) < 4 ? cur : o)); }
  });
  const roomH = area?.height > 0 ? Math.max(170, area.height - overhead - PLAYER_CHROME) : Infinity;
  const sceneW = Math.max(240, Math.min(width, 720, roomH * (W / H)));

  /* ── lecteur : le verdict, le journal, le guide ── */
  const noticeText = (n) => {
    if (!n) return k('player.verdict.start');
    const d = n.d ?? {};
    switch (n.key) {
      case 'tipped': return k('player.verdict.tipped', { side: k(n.side === 'L' ? 'sideL' : 'sideR') });
      case 'tippedRefusal': return k('player.verdict.tippedRefusal');
      case 'balanced': return k('player.verdict.balanced');
      case 'divided': return k('divided');
      case 'oneBag': return k('oneBag', { v: n.v });
      case 'verified': { const sub = B.substitution(lb); return sub ? k('verifiedNote', { v: B.fracLatex(sub.x) }) : ''; }
      case 'bagsUneven': return k('bagsUneven', { n: d.n, k: d.k, q: d.q, r: d.r, side: k(d.side === 'L' ? 'sideL' : 'sideR') });
      case 'cutMixed': return k('player.verdict.cutMixed', { k: d.k });
      case 'noneHere': return k('player.verdict.noneHere');
      case 'moveAcross': return k('player.verdict.moveAcross');
      case 'full': case 'noBags': case 'zeroUnit': case 'zeroBag': return k(n.key);
      default: return k('player.verdict.start');
    }
  };
  const shownSay = noticeText(said);
  const refusedNow = Boolean(said?.refusal);
  const stepsList = B.steps(lb).slice(-5);
  const journalId = `${uid}-journal`;
  const liveKey = `${said?.key ?? 'start'}:${gesture}`;
  const playerRepresentation = !cp.open && (
    <div className="space-y-2" data-eb-player-col>
      <div data-eb-verdict-box>
        <p className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-bold leading-snug ${refusedNow ? 'text-rose-800' : 'text-slate-800'}`} data-eb-verdict={said?.key ?? ''}>
          {refusedNow && <span aria-hidden="true">✗ </span>}<MathText>{shownSay}</MathText>
        </p>
        {opened && (() => {
          const sub = B.substitution(lb);
          return sub ? (
            <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-center text-sm font-bold text-emerald-900" data-eb-substitution>
              <span className="block">{k('sideL')}: <bdi dir="ltr"><MathText>{`$${B.substitutedTex(lb.start.L, sub.x)} = ${B.fracLatex(sub.left)}$`}</MathText></bdi></span>
              <span className="block">{k('sideR')}: <bdi dir="ltr"><MathText>{`$${B.substitutedTex(lb.start.R, sub.x)} = ${B.fracLatex(sub.right)}$`}</MathText></bdi></span>
            </p>
          ) : null;
        })()}
        {shownPreds.map((pr) => (
          <p key={pr.key} data-eb-predict-result={pr.ok ? 'ok' : 'wrong'} data-eb-predict-key={pr.key}
            className={`mt-2 rounded-2xl px-4 py-2 text-center text-lg font-black ${pr.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
            {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}
          </p>
        ))}
      </div>
      {stepsList.length > 0 && !state.isFormal && (
        <div data-eb-journal>
          <p id={journalId} className="text-sm font-black text-indigo-900"><span aria-hidden="true">📋 </span>{k('player.journal')}</p>
          <table className="mt-1 w-full text-center text-xs" aria-labelledby={journalId}>
            <thead>
              <tr className="bg-slate-50"><th scope="col">{k('player.colDid')}</th><th scope="col">{k('player.colEq')}</th></tr>
            </thead>
            <tbody>
              {stepsList.map((st, i) => (
                <tr key={`${i}-${st.result}`} data-eb-row={i}>
                  <th scope="row" className="border border-slate-200 font-normal"><MathText>{k(st.key, { term: st.term })}</MathText></th>
                  <td className="border border-slate-200 font-bold"><bdi dir="ltr"><MathText>{$(st.result)}</MathText></bdi></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const readDone = doneIds.includes('read') || !specs.some((sp) => sp.id === 'read');
  const coachRaw = coachOn && !locked ? P.coachOf(lb, { done: P.discoveryReached(lb), firstRound: chainsMode === 'r1', qty: handDone, noneHere: noneHereSeen, readDone, parts }) : null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const coachStep = useMemo(() => coachRaw, [coachRaw?.id]);
  const coach = useLabCoach({
    lab: 'equation-balance', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: t('manipulation.common.coach.hide'), show: t('manipulation.common.coach.show'), ok: t('manipulation.common.coach.ok'), stop: t('manipulation.common.coach.stop') },
  });

  /* ── la colonne : la prédiction ou la question PREND la place ── */
  const predText = (key, o) => (o.n != null ? <MathText>{$(o.says)}</MathText> : <MathText>{k(`predict.opt_${o.says}`)}</MathText>);
  const trayNode = predictOpen ? (
    <PredictTray attr="eb" key={nextPred} step={predKeys.indexOf(nextPred) + 1} of={predKeys.length}
      title={t('manipulation.common.cp.predict.title')}
      prompt={k(`predict.${nextPred}`)}
      options={P.predictOptions(lb.src, nextPred).map((o) => ({ says: o.says, text: predText(nextPred, o) }))}
      onSay={sayPredict} />
  ) : cp.open ? cp.node : null;

  const choiceId = (c) => `eq-${c}`;
  const frozen = locked ? { 'aria-disabled': true } : {};
  const verifyShown = B.isSolved(lb) && !lb.verified;
  const startTex = B.equationTex(lb.start);

  return (
    <ManipulationShell
      type="equation-balance"
      title={bidi(title ?? k('player.title'))}
      mission={mission ?? <MathText>{k('mission', { eq: startTex })}</MathText>}
      lead={typeof lead === 'string' ? <MathText>{lead}</MathText> : lead}
      state={state}
      coach={coachOn ? coach : null}
      allowModeSwitch={false}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided
      hideRepresentation={locked || undefined}
      onIntroChange={setMissionBig}
      sidePanel={trayNode ? <div data-eb-tray>{trayNode}</div> : null}
      hints={[]}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      representation={playerRepresentation}
      discovery={null}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/70 to-white" data-dragging={drag.dragging || stretch.dragging ? 'true' : undefined}>
        <div ref={boxRef} className="relative space-y-2" data-equation-balance data-player="" data-eq={eq} data-tilt={tilt} data-solved={String(B.isSolved(lb))}>
          {/* la région vivante TOUJOURS montée : une clé par geste */}
          <div role="status" aria-live="polite" className="sr-only" data-eb-verdict-live>
            <span key={liveKey}>{refusedNow ? `${k('player.cueRefused')} ` : ''}{shownSay}</span>
            {shownPreds.map((pr) => <span key={pr.key}> {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}</span>)}
            {choiceSaid && <span key={`${choiceSaid}:${gesture}`}> {k('player.choiceNow')}</span>}
          </div>
          {choices?.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-labelledby={`${uid}-choices`} data-eb-choices>
              <span id={`${uid}-choices`} className="text-sm font-bold text-slate-600">{k('player.choicesLabel')}</span>
              {choices.map((c) => {
                const on = c === eq;
                return (
                  <button key={choiceId(c)} type="button" data-eb-choice={c} aria-disabled={locked || undefined} aria-pressed={on}
                    onClick={() => { if (!lockedRef.current && !on) { state.setNumbers({ eq: c }); setChoiceSaid(c); setGesture((g) => g + 1); } }}
                    className={`inline-flex min-h-[44px] items-center rounded-xl border-2 px-3 text-sm font-black focus:outline-none focus-visible:ring-2 ${ringP} ${on ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-300 bg-white text-slate-700'}`}>
                    <span className="pointer-events-none"><MathText>{$(B.equationTex(B.init(c).pans))}</MathText></span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── la balance ── */}
          <div ref={sceneRef} className="mx-auto" style={{ width: sceneW }} dir="ltr" data-paging-keep data-eb-scene-box>
            <div className={`relative w-full ${predictOpen ? 'rounded-xl ring-4 ring-amber-300 ring-offset-2' : ''}`} style={{ aspectRatio: W / H }} data-balance-scene>
              <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
                <rect x={0} y={0} width={W} height={H} fill="#F8FAFC" />
                {Array.from({ length: 8 }, (_, i) => (
                  <g key={i} opacity={0.5}>
                    <rect x={8 + i * 79} y={6} width={70} height={Math.min(120, H * 0.35)} rx={4} fill="#E0F2FE" stroke="#BAE6FD" />
                    <circle cx={8 + i * 79 + 60} cy={6 + Math.min(120, H * 0.35) / 2} r={2.5} fill="#7DD3FC" />
                  </g>
                ))}
                <rect x={0} y={H - 24} width={W} height={24} fill="#CBD5E1" />
              </svg>
              {B.SIDES.map((sd) => (
                <div key={sd} className="absolute" style={{ left: pct(CX[sd] - PW / 2 - 6, W), width: pct(PW + 12, W), top: pct(Math.max(0, py[sd] - contentH - 10), H), height: pct(contentH + 22, H) }}>
                  <DropZone drag={drag} id={`pan:${sd}`} tone="emerald" minHeight="min-h-0" disabled={opened}
                    label={k('panZone', { side: k(sd === 'L' ? 'sideL' : 'sideR'), content: panWords(sd) })}
                    className="h-full w-full border-transparent bg-transparent" data-balance-zone={sd} />
                </div>
              ))}
              <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full" role="img"
                aria-label={k('ariaScene', { left: panWords('L'), right: panWords('R'), state: k(tilt === 0 ? 'stateLevel' : tilt > 0 ? 'stateLeftDown' : 'stateRightDown') })}>
                <rect x={PIVOT - 70} y={H - 34} width={140} height={14} rx={5} fill="#475569" />
                <rect x={PIVOT - 9} y={beamY} width={18} height={H - 34 - beamY} fill="#64748B" />
                <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${PIVOT}px ${beamY}px`, transition: 'transform 500ms cubic-bezier(.3,1.4,.5,1)' }} className="motion-reduce:transition-none" data-balance-beam>
                  <rect x={PIVOT - ARM - 8} y={beamY - 5} width={2 * ARM + 16} height={10} rx={5} fill="#334155" />
                  <polygon points={`${PIVOT},${beamY - 26} ${PIVOT - 6},${beamY - 4} ${PIVOT + 6},${beamY - 4}`} fill={tilt === 0 ? '#10B981' : '#F59E0B'} data-balance-needle />
                </g>
                <circle cx={PIVOT} cy={beamY} r={8} fill="#0F172A" />
                {B.SIDES.map((sd) => (
                  <g key={sd} style={{ transform: `translateY(${py[sd] - plateY}px)`, transition: 'transform 500ms cubic-bezier(.3,1.4,.5,1)' }} className="motion-reduce:transition-none" data-balance-pan={sd}>
                    <rect x={CX[sd] - 5} y={plateY + 6} width={10} height={beamY - plateY - 6} fill="#94A3B8" />
                    <rect x={CX[sd] - PW / 2 - 6} y={plateY} width={PW + 12} height={9} rx={4} fill="#475569" />
                    {lay[sd].float.length > 0 && lay[sd].float.map((it, i) => (
                      <line key={`s${i}`} x1={CX[sd] + it.x} y1={plateY + it.y + it.size * 0.4} x2={CX[sd]} y2={plateY + lay[sd].knotY} stroke="#94A3B8" strokeWidth={0.8} />
                    ))}
                    <g transform={`translate(${CX[sd]} ${plateY})`}>
                      {[...lay[sd].ground, ...lay[sd].float].map((it, i) => <Item key={i} it={it} part={counts[sd].part} />)}
                    </g>
                  </g>
                ))}
              </svg>
              {/* l'ancre du guide sur l'aiguille */}
              <div aria-hidden="true" data-coach="beam" className="pointer-events-none absolute" style={{ left: pct(PIVOT - 26, W), top: pct(beamY - 36, H), width: pct(52, W), height: pct(56, H) }} />
              {!opened && B.SIDES.flatMap((sd) => KINDS.filter((kind) => has(sd, kind)).map((kind) => {
                const b = boxOf(sd, kind);
                if (!b) return null;
                const id = `p:${sd}:${kind}`;
                return (
                  <div key={id} className="absolute flex items-center justify-center" {...intercept(id)} data-coach={`pan-${sd}-${kind === 'ball' || kind === 'balloon' ? 'units' : kind}`}
                    style={{ left: pct((b.x0 + b.x1) / 2, W), top: pct((b.y0 + b.y1) / 2, H), width: pct(b.x1 - b.x0, W), height: pct(b.y1 - b.y0, H), transform: 'translate(-50%, -50%)', minWidth: 44, minHeight: 44 }}>
                    <DraggableObject drag={drag} id={id} label={k('takeFrom', { what: k(`kind_${kind}`), side: k(sd === 'L' ? 'sideL' : 'sideR') })}
                      className={`h-full w-full rounded-xl bg-transparent hover:bg-white/30 focus-visible:ring-2 ${ringP}`} />
                  </div>
                );
              }))}
            </div>
          </div>

          {/* ── la réserve et la main ── */}
          <div className="flex flex-wrap items-stretch gap-2" dir="rtl">
            <div data-coach="reserve" className="min-w-0 flex-1">
              <DropZone drag={drag} id="reserve" tone="slate" label={k('reserveZone')} minHeight="min-h-[56px]" className="p-1.5" data-balance-reserve disabled={opened}>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-600">{k('player.reserve')}</span>
                  {kinds.map((kind) => (
                    <span key={kind} {...intercept(`r:${kind}`)}>
                      <DraggableObject drag={drag} id={`r:${kind}`} label={k('takeReserve', { what: k(`kind_${kind}`) })}
                        className={`inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-slate-300 bg-white px-2 py-0.5 text-sm font-bold text-slate-800 focus-visible:ring-2 ${ringP}`}>
                        <Icon kind={kind} size={30} />
                        <span>{k(`kind_${kind}`)}</span>
                        <bdi dir="ltr" className="font-mono text-xs text-slate-600">{k(`value_${kind}`)}</bdi>
                      </DraggableObject>
                    </span>
                  ))}
                </div>
              </DropZone>
            </div>
            {handDone && (
              <div role="group" aria-labelledby={`${uid}-qty`} data-coach="qty" className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-indigo-200 bg-white px-2 py-1" data-eb-qty>
                <span id={`${uid}-qty`} className="text-xs font-bold text-indigo-900">{k('player.qty')}</span>
                <div className="flex gap-1" dir="ltr">
                  {[1, 2, 3, 4].map((n) => (
                    <button key={n} type="button" aria-pressed={qty === n} data-eb-qty-n={n} {...frozen}
                      onClick={() => { if (!lockedRef.current) setQty(n); }}
                      className={`h-11 w-11 rounded-lg border-2 font-mono text-lg font-black focus:outline-none focus-visible:ring-2 ${ringP} ${qty === n ? 'border-indigo-700 bg-indigo-700 text-white' : 'border-slate-300 bg-white text-slate-800'}`}>{n}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── partager chaque plateau en k parts égales ── */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border-2 border-violet-200 bg-violet-50/50 p-1.5" data-balance-divide>
            <div className="flex min-w-[14rem] flex-1 items-center gap-1.5" dir="ltr">
              <button type="button" onClick={() => { if (kk > 1) nudge(-1); }} aria-label={k('fewer')} aria-disabled={locked || kk <= 1 || undefined}
                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 bg-white aria-disabled:opacity-40 focus:outline-none focus-visible:ring-2 ${ringP}`}><Minus className="h-5 w-5" aria-hidden="true" /></button>
              <div {...stretch.trackProps} className="relative h-11 flex-1" style={{ ...stretch.trackProps.style, ...(locked ? { pointerEvents: 'none' } : {}) }} data-balance-parts-track data-coach="parts">
                <div className="absolute inset-x-[22px] top-1/2 h-1.5 -translate-y-1/2 rounded bg-violet-300" />
                <div {...stretch.handleProps({ label: k('partsHandle'), valueText: k('partsValue', { k: kk }) })} {...frozen}
                  className={`absolute top-0 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-xl border-2 font-mono font-extrabold outline-none focus-visible:ring-2 ${ringP} ${stretch.dragging ? 'border-blue-500 bg-blue-50' : 'border-violet-500 bg-white'}`}
                  style={{ left: `calc(22px + (100% - 44px) * ${(kk - 1) / (kMax - 1)})` }} data-balance-k>{kk}</div>
              </div>
              <button type="button" onClick={() => { if (kk < kMax) nudge(1); }} aria-label={k('more')} aria-disabled={locked || kk >= kMax || undefined}
                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 bg-white aria-disabled:opacity-40 focus:outline-none focus-visible:ring-2 ${ringP}`}><Plus className="h-5 w-5" aria-hidden="true" /></button>
            </div>
            {kk >= 2 && !opened && (
              <div className="flex gap-1" dir="ltr" data-balance-groups data-k={kk} data-ok={String(divOk === true)}>
                {B.SIDES.map((sd) => {
                  const g = B.groupsOf(lb, kk)[sd]; const p = lb.pans[sd];
                  const unitKind = B.toNumber(p.u) < 0 ? 'balloon' : 'ball';
                  return (
                    <span key={sd} className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-white px-1.5 py-1 text-xs" data-balance-group={sd}>
                      <span className="sr-only">{k('onePart', { side: k(sd === 'L' ? 'sideL' : 'sideR'), k: kk })}</span>
                      {g.a !== 0 && <span className="inline-flex items-center"><Icon kind={g.bagKind} size={20} /><bdi dir="ltr" className="font-mono">×{Math.abs(g.a)}</bdi></span>}
                      {B.toNumber(p.u) !== 0 && <span className="inline-flex items-center"><Icon kind={unitKind} size={20} /><span className="font-mono"><MathText>{`$\\times ${B.fracLatex(g.u).replace('-', '')}$`}</MathText></span></span>}
                      {g.leftoverBags > 0 && <span className="inline-flex items-center rounded bg-rose-100 px-1 text-rose-800" data-balance-leftover><Icon kind={g.bagKind} size={18} /><bdi dir="ltr" className="font-mono">×{g.leftoverBags}</bdi><span className="sr-only"> {k('player.leftover')}</span></span>}
                    </span>
                  );
                })}
              </div>
            )}
            <button type="button" onClick={doDivide} data-balance-divide-go data-coach="keep" aria-disabled={locked || parts < 2 || liveParts != null || divOk !== true || undefined}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-violet-700 px-3 text-sm font-bold text-white aria-disabled:opacity-50 focus:outline-none focus-visible:ring-2 ${ringP}`}>
              <Scissors className="h-5 w-5" aria-hidden="true" /> <span>{k('keepOne', { k: parts })}</span>
            </button>
            {verifyShown && (
              <button type="button" onClick={doVerify} data-balance-verify-go data-coach="open" {...frozen}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-700 px-3 text-sm font-bold text-white focus:outline-none focus-visible:ring-2 ${ringP}`}>
                <SearchCheck className="h-5 w-5" aria-hidden="true" /> <span>{k('player.open')}</span>
              </button>
            )}
          </div>
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

