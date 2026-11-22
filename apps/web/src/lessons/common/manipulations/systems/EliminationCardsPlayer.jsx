import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, Minus, Plus, RotateCcw, ChevronDown } from 'lucide-react';
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
import MathText from '../../components/MathText';
import FitLine from '../../components/FitLine';
import { bidi } from '../../../../utils/bidi';
import { playSfx } from '../../utils/playEffect';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as E from '../logic/eliminationCards';
import * as P from '../logic/eliminationCardsPlayer';
import { Tile, QUESTIONS as PAGE_QUESTIONS, discoveryOptions } from './EliminationCards';

/*
 * elimination-cards — LECTEUR DE MISSION (rollout 2026-11-12, unité 5 leçon 2 `hall-jabri` ; conseil du 2026-11-11, verdict « L2 », X7 et X11).
 * La page (`EliminationCards.jsx › EliminationCardsPage`, enseignant, mode classe) est INCHANGÉE : ce composant n'est monté que dans le lecteur
 * (`useInMissionPlayer()`), joué en MANCHES (LabRounds). Logique pure : `logic/eliminationCardsPlayer.js` (essais, chemins, suites, prédictions, guide).
 *   - Deux cartes-devinettes sur une simple table (aucun décor de kiosque : verdict L2.2), le titre du labo caché ; la manche s'ouvre sur sa `lead`
 *     et sa `mission`.
 *   - Un ESSAI est un geste qui ÉCRIT une ligne nouvelle (l'expression portée, les cartes posées, la valeur portée) ou un refus COMPTÉ (`REFUSALS`) ;
 *     le même refus deux fois dans le même état ne compte pas, le PREMIER refus compté de la manche est gratuit (`free`). `onVerdict { groups, exact }`.
 *     La découverte (`methods` méthodes finies, la même ثنائية) est annoncée une fois (`{ tk: 'discovered' }`) ; « إعادة » → `{ tk: 'reset' }`,
 *     « أعِد التجربة » → `{ tk: 'retry' }`.
 *   - `chains` : r1 · r2 · r3 · none (`logic › CHAIN_SPECS`) : BÂTIR « ▢ = ▢ » à l'étape à une inconnue, UNE fois par méthode, avec le leurre du
 *     CHEMIN pris (règle P : le chemin « moins » de l'élève n'est jamais refusé, son leurre est la transposition) ; la ثنائية, MASQUÉE jusqu'à la
 *     réponse (les deux lignes de valeur restent visibles) ; puis la règle (r2) ou le choix (r3). Sur la substitution la ligne substituée reste
 *     VISIBLE ; seule l'équation à une inconnue attend la construction (verdict L2.10).
 *   - `predict` : vanish / multiplier avant le premier geste ; samePair quand la première méthode est finie. `methods` : 1 | 2.
 *   - `choices` : des jumal au choix (la manche libre) ; `coach` : le guide (`coachOf`, ancres `[data-coach]`).
 *   - Journal « 📋 جدول تجاربك » et verdict dans la colonne ; commandes figées pendant une prédiction ou une question (`aria-disabled` + garde) ;
 *     région vivante TOUJOURS montée ; aucun pas, aucune fête (le lecteur a ses étoiles).
 */
const PRED_MAX = 2;
const PRED_HOLD_MS = 1600;
const ringP = 'focus-visible:ring-indigo-600 focus-visible:ring-offset-2';
const TILE_MAX = 4;
const $ = (x) => `$${x}$`;
const texNode = (v) => <MathText>{$(v)}</MathText>;
const spin = (xs, seed) => { const s0 = ((seed % xs.length) + xs.length) % xs.length; return xs.map((_, i) => xs[(i + s0) % xs.length]); };
const seedOf = (lab) => Math.abs(Math.round(E.toNumber(lab.sys[0].c) * 3 + E.toNumber(lab.sys[1].c) * 5 + E.toNumber(lab.sys[1].a)));
const coefOf = (e, v) => (v === 'x' ? e.a : e.b);

/** Les tuiles d'un terme dans le lecteur : |coef| tuiles jusqu'à 4, sinon UNE tuile qui porte le coefficient (la carte ne passe jamais à la ligne). */
function PlayerTiles({ v, coef, decimal }) {
  if (Lin.isZero(coef)) return null;
  const negative = Lin.cmp(coef, 0) < 0;
  const abs = negative ? Lin.neg(coef) : coef;
  const many = !Lin.isInteger(abs) || abs.n > TILE_MAX;
  const n = many ? 1 : abs.n;
  return (
    <span className="inline-flex flex-nowrap items-center gap-0.5">
      {Array.from({ length: n }, (_, i) => <Tile key={i} v={v} negative={negative} label={many ? E.numText(abs, decimal) : null} />)}
    </span>
  );
}

/* ══════════════ Les questions du lecteur (LabCheckpoint) ══════════════ */

const Pq = (k, key, o) => <MathText>{k(`player.${key}`, o)}</MathText>;

export const QUESTIONS = {
  /* OBSERVER (manche 1) : ce qui a remplacé chaque tuile, ou ce que deviennent les tuiles opposées */
  see: (lab, k) => {
    const s = P.seeSpec(lab);
    if (s.kind === 'add') {
      const o = { v: $(s.v) };
      return {
        id: 'see', kind: 'choice', cols: 3, prompt: Pq(k, 'see.addPrompt', o),
        options: spin(s.options, seedOf(lab)).map((t) => (t === s.right
          ? { text: texNode(t), correct: true }
          : { text: texNode(t), why: Pq(k, 'see.addWhy', o) })),
        hints: [Pq(k, 'see.addHint1', o), Pq(k, 'see.addHint2', o)], explain: Pq(k, 'see.addExplain', o),
      };
    }
    const o = { v: $(s.v), n: s.n, bundle: $(s.bundle), m: $(s.m) };
    const opts = { bundle: Pq(k, 'see.subBundle', o), number: Pq(k, 'see.subNumber', o), same: Pq(k, 'see.subNothing', o) };
    return {
      id: 'see', kind: 'choice', cols: 1, prompt: Pq(k, 'see.subPrompt', o),
      options: spin(s.options, seedOf(lab)).map((id) => (id === s.right
        ? { text: opts[id], correct: true }
        : { text: opts[id], why: Pq(k, `see.subWhy_${id}`, o) })),
      hints: [Pq(k, 'see.subHint1', o), Pq(k, 'see.subHint2', o)], explain: Pq(k, 'see.subExplain', o),
    };
  },
  /* BÂTIR l'équation à une inconnue, UN leurre — celui du chemin */
  build: (lab, k) => {
    const b = P.buildSpec(lab);
    const o = { eq: $(`${b.left} = ${b.right}`), decoy: $(b.decoy) };
    return {
      id: 'build', kind: 'build', prompt: Pq(k, 'build.prompt'),
      slots: [k('player.build.slotL'), k('player.build.slotR')], ops: ['='],
      tiles: spin(b.tiles, seedOf(lab) + (lab.method === 'add' ? 1 : 2)), render: texNode,
      expected: b.expected, accept: [[b.right, b.left]],
      hints: [Pq(k, `build.hint_${b.kind}`, o), Pq(k, 'build.hint2', o)], explain: Pq(k, `build.explain_${b.kind}`, o),
    };
  },
  /* LA ثنائية : la page la pose déjà (le bon couple, le couple permuté, une valeur seule) */
  pair: (lab, k) => PAGE_QUESTIONS.pair(lab, k),
  /* LA RÈGLE (manche 2) : après deux jumal différentes et les deux méthodes sur la même */
  rule: (lab, k) => {
    const pt = (p) => $(E.pairTex(E.parseNum(p.x), E.parseNum(p.y), lab.decimal));
    const o = { sub: pt(lab.methodsDone.sub), add: pt(lab.methodsDone.add) };
    return {
      id: 'rule', kind: 'choice', prompt: Pq(k, 'rule.prompt', o),
      options: spin(discoveryOptions(k), seedOf(lab) + 1),
      hints: [Pq(k, 'rule.hint1', o), Pq(k, 'rule.hint2')],
      explain: <div className="space-y-1"><MathText>{k('formalNote')}</MathText><p className="font-bold"><MathText>{k('player.rule.sum')}</MathText></p></div>,
    };
  },
  /* LE CHOIX (manche 3) : ce qui rendait la substitution sans multiplication sur CES cartes */
  choose: (lab, k) => {
    const unit = [1, 2].flatMap((n) => ['x', 'y'].map((v) => ({ n, v, c: coefOf(lab.sys[n - 1], v) }))).find((t) => Lin.eq(Lin.cmp(t.c, 0) < 0 ? Lin.neg(t.c) : t.c, 1));
    const sys = `\\begin{cases} ${E.eqTex(lab.sys[0], lab.decimal)} \\\\ ${E.eqTex(lab.sys[1], lab.decimal)} \\end{cases}`;
    const o = { sys: $(sys), n: unit?.n ?? 2, v: $(unit?.v ?? 'x') };
    return {
      id: 'choose', kind: 'choice', cols: 1, prompt: Pq(k, 'choose.prompt', o),
      options: spin([
        { text: Pq(k, 'choose.optOne', o), correct: true },
        { text: Pq(k, 'choose.optOpposite', o), why: Pq(k, 'choose.whyOpposite', o) },
        { text: Pq(k, 'choose.optSmall', o), why: Pq(k, 'choose.whySmall', o) },
      ], seedOf(lab) + 2),
      hints: [Pq(k, 'choose.hint1', o), Pq(k, 'choose.hint2', o)], explain: Pq(k, 'choose.explain', o),
    };
  },
};

export default function EliminationCardsPlayer({
  system: sys0 = 'x+y=10|x-y=2', title, lead, mission, level, checkpoints: cpOn = true, onFinished, onTrial, onCheckpoint,
  coach: coachOn = true, onVerdict, chains: chainsMode = 'none', predict: predictList = [], choices, methods = 1,
}) {
  const { t } = useTranslation('lesson');
  const uid = useId();
  const k = useCallback((key, o) => t(`manipulation.eliminationCards.${key}`, o), [t]);
  const state = useManipulation({ type: 'elimination-cards', initialNumbers: { system: sys0 }, initialMode: 'student', initialLevel: level, withLevels: false, hintCount: 3 });
  const { system } = state.numbers;

  const sceneKey = `${system}:${state.epoch}:${state.resetCount}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [lab, setLab] = useState(() => E.init(sys0));
  const [live, setLive] = useState({ 1: null, 2: null });
  const [said, setSaid] = useState(null);
  const [gesture, setGesture] = useState(0);
  const [rows, setRows] = useState([]);
  const [doneIds, setDoneIds] = useState([]);
  const [preds, setPreds] = useState({});
  const [shownPreds, setShownPreds] = useState([]);
  const [predHold, setPredHold] = useState(false);
  const [missionBig, setMissionBig] = useState(false);
  const [seen, setSeen] = useState({ stackTried: false, stackDone: false, started: false, refusedStack: null });
  const written = useRef(new Set());
  const refusalKeys = useRef(new Set());
  const refusedCount = useRef(0);
  const discoveredSent = useRef(false);
  const asked = useRef(new Set());
  const heardPred = useRef(new Set());
  const holdTimer = useRef(null);
  const focusTimer = useRef(null);
  const wipe = () => { written.current = new Set(); refusalKeys.current = new Set(); refusedCount.current = 0; discoveredSent.current = false; };
  // « إعادة » ou une autre jumla : TOUT recommence — les cartes, les essais, les prédictions et les questions
  let lb = lab;
  if (scene.key !== sceneKey) {
    lb = E.init(system);
    setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(lb); setLive({ 1: null, 2: null }); setSaid(null); setRows([]); setDoneIds([]);
    setPreds({}); setShownPreds([]); setPredHold(false); setSeen({ stackTried: false, stackDone: false, started: false, refusedStack: null });
    asked.current = new Set(); heardPred.current = new Set(); wipe();
  }
  useEffect(() => { if (scene.inits > 0) state.report(onTrial, { tk: 'reset' }); }, [scene.inits]); // eslint-disable-line react-hooks/exhaustive-deps
  const dec = lb.decimal;

  // ── les suites de la manche, posées quand ce qu'elles interrogent est là, après les résultats des prédictions ──
  const cpSettings = useLabCheckpointSettings('elimination-cards');
  const cpLive = cpOn && cpSettings.enabled;
  const specs = P.chainsOf(chainsMode);
  const predKeys = predictList.filter((key) => P.PREDICT_KEYS.includes(key)).slice(0, PRED_MAX);
  const judged = P.judgedPredictions(lb, predKeys.filter((key) => key in preds), seen);
  const pendingPreds = judged.filter((key) => !heardPred.current.has(key));
  const holdChain = pendingPreds.length > 0 || predHold;
  const pendingSpec = cpLive && !holdChain ? specs.find((sp) => sp.reached(lb) && !doneIds.includes(sp.id)) ?? null : null;
  const cp = useLabCheckpoint({
    id: pendingSpec?.id ?? null,
    questions: pendingSpec ? pendingSpec.qs.map((q) => QUESTIONS[q](lb, k)) : null,
    reached: !!pendingSpec,
    resetKey: scene.inits,
    // « أعِد التجربة » : la MÊME méthode repart de cartes neuves ; l'autre méthode, déjà faite, reste en mémoire
    onRetry: () => {
      setLive({ 1: null, 2: null }); setSaid(null);
      setLab((l) => E.init(l.src, { methodsDone: { ...l.methodsDone, [l.method]: null }, attempts: l.attempts.filter((a) => a.method !== l.method), refusals: l.refusals }));
      wipe();
      state.report(onTrial, { tk: 'retry' });
    },
    onEvent: (ev) => { state.report(onTrial, ev); state.report(onCheckpoint, ev); },
    onDone: (id) => {
      setDoneIds((d) => (d.includes(id) ? d : [...d, id]));
      if (id === 'rule' || id === 'choose') { state.discover(); state.formalize(); }
    },
  });
  useEffect(() => {
    if (P.discoveredFor(lb, methods) && !discoveredSent.current) {
      discoveredSent.current = true; state.report(onTrial, { tk: 'discovered' });
      // questions coupées (l'enseignant, pour SON compte) : la découverte du labo suffit à le formaliser
      if (!cpLive || !specs.length) { state.discover(); state.formalize(); }
    }
  }, [lb]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, system); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── la prédiction ; commandes figées pendant elle et pendant une question ──
  const untouched = lb.stage === 'cards' && !lb.expr && !seen.started && P.methodsCount(lb) === 0;
  const nextPred = predKeys.find((key) => !asked.current.has(key) && P.predictAsked(lb, key, { untouched, pairDone: doneIds.includes('pair') || !specs.some((sp) => sp.id === 'pair') })) ?? null;
  const predictOpen = cpLive && !cp.open && !missionBig && !holdChain && nextPred != null;
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
    // le focus revient au labo : le bouton « l'autre méthode » s'il est là, sinon la poignée de la carte (1) (revue a11y 2026-11-12)
    clearTimeout(focusTimer.current);
    focusTimer.current = setTimeout(() => boxRef.current?.querySelector('[data-ec-other], [data-drag-source="card:1"]')?.focus?.(), 60);
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
  useEffect(() => () => { clearTimeout(holdTimer.current); clearTimeout(focusTimer.current); }, []);
  useEffect(() => { if (cp.open) setShownPreds([]); }, [cp.open]);

  /* ── un ESSAI : une ligne nouvelle, ou un refus compté ── */
  const methodWord = (m) => k(`method_${m}`);
  const commit = (next) => {
    const tr = P.trialOf(lb, next);
    setLab(next); setGesture((g) => g + 1);
    setSeen((s) => ({ ...s, started: true, refusedStack: null, ...(next.method === 'add' && next.stage === 'one' ? { stackTried: true, stackDone: true } : {}) }));
    if (!tr || written.current.has(tr.sig)) return;
    written.current.add(tr.sig);
    state.report(onVerdict, { groups: written.current.size, exact: true });
    const lineKey = tr.kind === 'substitute' ? 'substitute' : tr.kind === 'sum' ? 'sum' : 'back';
    const ln = next.lines.find((l, i) => l.key === lineKey && i >= lb.lines.length) ?? next.lines.at(-1);
    setRows((r) => [...r, { method: next.method, tex: ln.tex, result: tr.kind === 'back' ? 'other' : 'one' }]);
    if (next.stage === 'done') playSfx('flag');
  };
  const refusalTrial = (reason, at, extra = {}) => {
    if (!P.isRefusal(reason)) return;
    const key = `${reason}:${P.stateKey(at)}:${extra.n ?? ''}`;
    if (refusalKeys.current.has(key)) return;
    refusalKeys.current.add(key);
    const free = refusedCount.current === 0;
    refusedCount.current += 1;
    state.report(onVerdict, { groups: 0, exact: false, ...(free ? { free: true } : {}) });
    setRows((r) => [...r, { method: reason === 'sameCard' || reason === 'wrongUnknown' ? 'sub' : 'add', tex: extra.tex ?? null, result: reason === 'noCancel' && extra.equal ? 'noCancelEqual' : reason }]);
  };

  /* ── porter ── */
  const verdict = (r) => (r === true ? true : r);
  const accepts = (src, zone) => {
    if (lockedRef.current) return '';
    const [s, sn, sv] = src.split(':');
    const [z, zn, zv] = zone.split(':');
    const n = Number(zn);
    if (s === 'iso') return zone === 'tray' ? verdict(E.canIsolate(lb, Number(sn), sv)) : '';
    if (s === 'expr') {
      if (z === 'tile') return verdict(E.canSubstitute(lb, n, zv));
      if (z === 'card') return verdict(E.canSubstitute(lb, n, lb.expr?.v));
      return '';
    }
    if (s === 'card') {
      if (z !== 'card' && z !== 'tile') return '';
      return n === Number(sn) ? '' : verdict(E.canStack(lb, Number(sn), n));
    }
    if (s === 'val') return z === 'back' ? verdict(E.canBack(lb, n)) : '';
    return '';
  };
  const drag = useDragInteraction({
    accepts,
    onDrop: (src, zone) => {
      if (lockedRef.current) return;
      const [s, sn, sv] = src.split(':');
      const n = Number(zone.split(':')[1]);
      if (s === 'iso') {
        const next = E.isolateFrom(lb, Number(sn), sv);
        playSfx('tooth');
        setSaid({ key: 'isolated', o: { expr: $(E.exprLine(next)) } });
        setSeen((st) => ({ ...st, started: true }));
        setLab(next); setGesture((g) => g + 1);
      } else if (s === 'expr') {
        const next = E.substituteInto(lb, n);
        playSfx('bell');
        setSaid({ key: 'substituted', o: { v: $(lb.expr.v), n } });
        commit(next);
      } else if (s === 'card') {
        const pairs = E.cancelledPairs(lb);
        const next = E.stack(lb, Number(sn), n);
        playSfx('bell');
        setSaid({ key: 'stacked', o: { v: $(pairs?.v ?? 'y') } });
        commit(next);
      } else if (s === 'val') {
        const next = E.backSubstitute(lb, n);
        setSaid({ key: 'found', o: {} });
        commit(next);
      }
    },
    onReject: (src, zone, reason) => {
      if (lockedRef.current) return;
      if (!reason) { setSaid(null); return; }
      const zv = zone.split(':')[2];
      let o = {};
      let key = reason;
      let extra = {};
      if (reason === 'sameCard') { const d = E.sameCardDetails(lb); o = { identity: $(d.identity), line: $(d.line) }; extra = { tex: d.line }; }
      if (reason === 'noCancel' || reason === 'both') {
        const d = E.noCancelDetails(lb);
        o = { sum: $(d.sum), v: $(d.equalVar ?? '') };
        if (reason === 'noCancel' && d.equalVar) key = 'noCancelEqual';
        extra = { tex: d.sum, equal: Boolean(d.equalVar), n: src.split(':')[1] };
        setSeen((st) => ({ ...st, stackTried: true, refusedStack: Number(src.split(':')[1]) || 2 }));
      }
      if (reason === 'wrongUnknown') o = { v: $(lb.expr?.v ?? ''), w: $(zv ?? '') };
      if (reason === 'noUnknownHere') o = { v: $(src.startsWith('expr') ? lb.expr?.v : zv) };
      if (P.isRefusal(reason) || ['noUnknownHere', 'zero', 'noOther'].includes(reason)) playSfx('over');
      setGesture((g) => g + 1);
      setSaid({ key, o, refusal: true });
      setLab((l) => E.refuse(l, reason));
      refusalTrial(reason, lb, extra);
    },
  });
  // Toucher une source posée DANS une zone en tenant un autre objet, c'est viser cette zone (la page fait de même).
  const targetFor = (id) => {
    const held = drag.held;
    if (!held || drag.dragging || held === id) return null;
    const [h, hn] = held.split(':');
    const [s, sn, sv] = id.split(':');
    if (h === 'expr' && s === 'iso') return `tile:${sn}:${sv}`;
    if (h === 'expr' && s === 'card') return `card:${sn}`;
    if (h === 'card' && (s === 'iso' || s === 'card') && sn !== hn) return `card:${sn}`;
    return null;
  };
  const intercept = (id) => ({
    onPointerDownCapture: (e) => { if (targetFor(id)) { e.stopPropagation(); e.preventDefault(); } },
    onPointerUpCapture: (e) => { if (targetFor(id)) { e.stopPropagation(); e.preventDefault(); } },
    onClickCapture: (e) => { const z = targetFor(id); if (z) { e.stopPropagation(); e.preventDefault(); drag.dropHere(z); } },
    onKeyDownCapture: (e) => { const z = targetFor(id); if (z && (e.key === 'Enter' || e.key === ' ')) { e.stopPropagation(); e.preventDefault(); drag.dropHere(z); } },
  });
  const keepInside = { onClick: (e) => e.stopPropagation(), onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); } };

  /* ── multiplier une carte (étirement) : un brouillon, jamais un essai ── */
  const commitScale = (n, v) => {
    setLive((s) => ({ ...s, [n]: null }));
    if (lockedRef.current) return;
    const r = E.canScale(lb, n, v);
    if (r === true) {
      if (v !== lb.scale[n]) { setSaid({ key: 'scaled', o: { n, k: $(v) } }); setGesture((g) => g + 1); playSfx('tooth'); }
      setLab(E.setScale(lb, n, v));
    } else if (r) {
      playSfx('over');
      setSaid({ key: r, o: {}, refusal: true }); setGesture((g) => g + 1);
    }
  };
  const toValue = (cx, _y, rect) => E.SCALE_MIN + ((cx - rect.left - 22) / Math.max(1, rect.width - 44)) * (E.SCALE_MAX - E.SCALE_MIN);
  const s1 = useStretchInteraction({ value: live[1] ?? lb.scale[1], range: { min: E.SCALE_MIN, max: E.SCALE_MAX }, toValue, onChange: (v) => { if (!lockedRef.current) setLive((s) => ({ ...s, 1: v })); }, onCommit: (v) => commitScale(1, v), direction: 'ltr' });
  const s2 = useStretchInteraction({ value: live[2] ?? lb.scale[2], range: { min: E.SCALE_MIN, max: E.SCALE_MAX }, toValue, onChange: (v) => { if (!lockedRef.current) setLive((s) => ({ ...s, 2: v })); }, onCommit: (v) => commitScale(2, v), direction: 'ltr' });
  const stretchOf = { 1: s1, 2: s2 };

  /* ── l'étape à une inconnue : la construction d'abord, puis « السطر التالي » ── */
  const buildId = P.buildIdFor(chainsMode, lb.method);
  const buildDone = !cpLive || !buildId || doneIds.includes(buildId);
  const pairMasked = cpLive && specs.some((sp) => sp.id === 'pair') && !doneIds.includes('pair');
  const nextLine = () => { if (lockedRef.current || !buildDone) return; playSfx('tooth'); setLab(E.solveStep(lb)); setGesture((g) => g + 1); setSaid({ key: 'revealed', o: {} }); };
  const visibleLines = lb.lines.filter((l, i) => {
    if (lb.stage === 'one' && lb.method === 'add' && !buildDone && l.key === 'hence' && i === lb.lines.length - 1) return false;
    if (pairMasked && l.key === 'pair') return false;
    return true;
  });
  const last = visibleLines.at(-1);

  /* ── la scène ── */
  const shownScale = (n) => live[n] ?? lb.scale[n];
  const shownCard = (n) => (shownScale(n) === 0 ? null : E.card({ ...lb, scale: { ...lb.scale, [n]: shownScale(n) } }, n));
  const plainEq = (e) => E.eqTex(e, dec).replace(/\{,\}/g, ',').replace(/\\dfrac\{(\d+)\}\{(\d+)\}/g, '$1/$2');
  const frozen = locked ? { 'aria-disabled': true } : {};

  const tileGroup = (n, v, e) => {
    const coef = v === 'x' ? e.a : e.b;
    if (Lin.isZero(coef)) return null;
    const id = `iso:${n}:${v}`;
    return (
      <span {...keepInside} className="inline-flex">
        <DropZone drag={drag} id={`tile:${n}:${v}`} tone="amber" minHeight="min-h-0" label={k('player.tileZone', { v, n })}
          className="inline-flex items-center p-0.5" data-ec-tiles={`${n}:${v}`}>
          <span {...intercept(id)} className="inline-flex">
            <DraggableObject drag={drag} id={id} label={k('player.isolateSource', { v, n })} disabled={lb.stage !== 'cards'}
              className={`inline-flex min-h-[44px] items-center rounded-lg px-0.5 focus-visible:ring-2 ${ringP}`}>
              <PlayerTiles v={v} coef={coef} decimal={dec} />
            </DraggableObject>
          </span>
        </DropZone>
      </span>
    );
  };

  const cardView = (n) => {
    const e = shownCard(n);
    const scaled = shownScale(n);
    const st = stretchOf[n];
    return (
      <div key={n} className="min-w-0 space-y-1 rounded-2xl border-2 border-slate-300 bg-white p-1 shadow-sm" data-eq-card={n} data-scale={scaled}>
        <DropZone drag={drag} id={`card:${n}`} tone="emerald" minHeight="min-h-0"
          label={k('cardZone', { n, eq: e ? plainEq(e) : '0 = 0' })} className="p-1">
          <div dir="ltr" className="flex flex-nowrap items-center justify-center gap-1" data-eq-row>
            <span {...intercept(`card:${n}`)} className="inline-flex shrink-0">
              <DraggableObject drag={drag} id={`card:${n}`} label={k('cardHandle', { n })} disabled={lb.stage !== 'cards'}
                className={`inline-flex h-11 min-w-[44px] items-center justify-center gap-0.5 rounded-xl border-2 border-emerald-600 bg-white px-1 text-sm font-extrabold text-emerald-800 focus-visible:ring-2 ${ringP}`}>
                <Hand className="h-4 w-4" aria-hidden="true" /><span>({n})</span>
              </DraggableObject>
            </span>
            {e ? (
              <>
                {tileGroup(n, 'x', e)}
                {tileGroup(n, 'y', e)}
                <span className="px-0.5 font-mono text-lg font-bold text-slate-600">=</span>
                <span data-eq-tile="c" className="inline-flex shrink-0 items-center rounded-lg border-2 border-slate-400 bg-slate-50 px-1.5 font-mono text-lg font-extrabold text-slate-800">
                  <bdi dir="ltr">{E.numText(e.c, dec)}</bdi>
                </span>
              </>
            ) : (
              <span className="rounded-lg bg-rose-50 px-2 py-1 text-sm font-bold text-rose-700" data-ec-zero-card>{k('zeroCard')} <bdi dir="ltr" className="font-mono">0 = 0</bdi></span>
            )}
          </div>
        </DropZone>
        {lb.stage === 'cards' && (
          <div className="flex items-center gap-1" dir="ltr" data-ec-scale={n} data-coach={`scale-${n}`}>
            <button type="button" onClick={() => { if (!lockedRef.current && scaled > E.SCALE_MIN) st.nudge(-1); }} aria-label={k('fewer', { n })} aria-disabled={locked || scaled <= E.SCALE_MIN || undefined}
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 bg-white aria-disabled:opacity-40 focus:outline-none focus-visible:ring-2 ${ringP}`}><Minus className="h-5 w-5" aria-hidden="true" /></button>
            <div {...st.trackProps} className="relative h-11 min-w-[60px] flex-1" style={{ ...st.trackProps.style, ...(locked ? { pointerEvents: 'none' } : {}) }} data-ec-scale-track={n}>
              <div className="absolute inset-x-[22px] top-1/2 h-1.5 -translate-y-1/2 rounded bg-violet-300" />
              <div className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-violet-500" style={{ left: 'calc(22px + (100% - 44px) * 0.5)' }} />
              <div {...st.handleProps({ label: k('scaleHandle', { n }), valueText: k('scaleValue', { k: scaled }) })} {...frozen} data-scale-handle={n}
                className={`absolute top-0 flex h-11 min-w-[44px] -translate-x-1/2 items-center justify-center rounded-xl border-2 px-1 font-mono text-sm font-extrabold outline-none focus-visible:ring-2 ${ringP} ${scaled === 0 ? 'border-rose-600 bg-rose-50 text-rose-800' : st.dragging ? 'border-blue-600 bg-blue-50' : 'border-violet-600 bg-white'}`}
                style={{ left: `calc(22px + (100% - 44px) * ${(scaled - E.SCALE_MIN) / (E.SCALE_MAX - E.SCALE_MIN)})` }}>
                <bdi dir="ltr">×{scaled}</bdi>
              </div>
            </div>
            <button type="button" onClick={() => { if (!lockedRef.current && scaled < E.SCALE_MAX) st.nudge(1); }} aria-label={k('more', { n })} aria-disabled={locked || scaled >= E.SCALE_MAX || undefined}
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 bg-white aria-disabled:opacity-40 focus:outline-none focus-visible:ring-2 ${ringP}`}><Plus className="h-5 w-5" aria-hidden="true" /></button>
          </div>
        )}
      </div>
    );
  };

  /* ── lecteur : le verdict, le journal, le guide ── */
  const verdictText = (n) => (n ? k(`player.verdict.${n.key}`, n.o ?? {}) : k('player.verdict.start'));
  const refusedNow = Boolean(said?.refusal);
  const journalId = `${uid}-journal`;
  const liveKey = `${said?.key ?? 'start'}:${gesture}`;
  const shownRows = rows.slice(-5);
  const firstRow = rows.length - shownRows.length;
  const playerRepresentation = !cp.open && (
    <div className="space-y-2" data-ec-player-col>
      <div data-ec-verdict-box>
        <p className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-bold leading-snug ${refusedNow ? 'text-rose-800' : 'text-slate-800'}`} data-ec-verdict={said?.key ?? ''}>
          {refusedNow && <span aria-hidden="true">✗ </span>}<MathText>{verdictText(said)}</MathText>
        </p>
        {shownPreds.map((pr) => (
          <p key={pr.key} data-ec-predict-result={pr.ok ? 'ok' : 'wrong'} data-ec-predict-key={pr.key}
            className={`mt-2 rounded-2xl px-4 py-2 text-center text-lg font-black ${pr.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
            {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}
          </p>
        ))}
      </div>
      {rows.length > 0 && (
        <div data-ec-journal>
          <p id={journalId} className="text-sm font-black text-indigo-900"><span aria-hidden="true">📋 </span>{k('player.journal')}</p>
          <table className="mt-1 w-full table-fixed text-center text-xs" aria-labelledby={journalId}>
            <thead>
              <tr className="bg-slate-50">
                <th scope="col" className="w-6"><span aria-hidden="true">#</span><span className="sr-only">{k('player.colN')}</span></th><th scope="col" className="w-14">{k('player.colMethod')}</th>
                <th scope="col">{k('player.colWrote')}</th><th scope="col" className="w-24">{k('player.colResult')}</th>
              </tr>
            </thead>
            <tbody>
              {shownRows.map((r, i) => (
                <tr key={firstRow + i} data-ec-row={firstRow + i} data-ec-row-result={r.result}>
                  <th scope="row" className="border border-slate-200 font-normal"><bdi dir="ltr">{firstRow + i + 1}</bdi></th>
                  <td className="border border-slate-200">{methodWord(r.method)}</td>
                  <td className="border border-slate-200 font-bold">{r.tex ? <FitLine dir="ltr"><MathText>{$(r.tex)}</MathText></FitLine> : '—'}</td>
                  <td className={`border border-slate-200 ${['one', 'other'].includes(r.result) ? 'text-emerald-800' : 'text-rose-800'}`}>{k(`player.result.${r.result}`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const missing = E.missingMethod(lb);
  const otherReady = methods >= 2 && lb.stage === 'done' && Boolean(missing) && !pairMasked && !predictOpen && !cp.open && !holdChain;
  const coachRaw = coachOn && !locked ? P.coachOf(lb, { done: P.discoveredFor(lb, methods) && !otherReady, started: seen.started || rows.length > 0, refusedStack: lb.stage === 'cards' && seen.refusedStack != null, scaleCard: seen.refusedStack, buildDone, otherReady }) : null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const coachStep = useMemo(() => coachRaw, [coachRaw?.id, coachRaw?.target]);
  const coach = useLabCoach({
    lab: 'elimination-cards', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: t('manipulation.common.coach.hide'), show: t('manipulation.common.coach.show'), ok: t('manipulation.common.coach.ok'), stop: t('manipulation.common.coach.stop') },
  });

  /* ── la colonne : la prédiction ou la question PREND la place ── */
  const predText = (key, o) => (o.n != null ? texNode(String(o.n)) : <MathText>{k(`predict.opt_${o.says}`)}</MathText>);
  const trayNode = predictOpen ? (
    <PredictTray attr="ec" key={nextPred} step={predKeys.indexOf(nextPred) + 1} of={predKeys.length}
      title={t('manipulation.common.cp.predict.title')}
      prompt={<MathText>{k(`predict.${nextPred}`)}</MathText>}
      options={P.predictOptions(lb.src, nextPred).map((o) => ({ says: o.says, text: predText(nextPred, o), aria: o.n != null ? String(o.n) : undefined }))}
      onSay={sayPredict} />
  ) : cp.open ? cp.node : null;

  const exprText = lb.expr ? E.exprLine(lb) : null;
  const subTarget = lb.method === 'sub' ? lb.lines.find((l) => l.key === 'substitute') : null;
  const checks = E.checkLines(lb);
  const systemTex = E.systemTex(lb);

  return (
    <ManipulationShell
      type="elimination-cards"
      title={bidi(title ?? k('player.title'))}
      mission={mission ?? <MathText>{k('mission', { sys: systemTex })}</MathText>}
      lead={typeof lead === 'string' ? <MathText>{lead}</MathText> : lead}
      state={state}
      coach={coachOn ? coach : null}
      allowModeSwitch={false}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided
      hideRepresentation={locked || undefined}
      onIntroChange={setMissionBig}
      sidePanel={trayNode ? <div data-ec-tray>{trayNode}</div> : null}
      hints={[]}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      representation={playerRepresentation}
      discovery={null}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-slate-50 to-white" data-dragging={drag.dragging || s1.dragging || s2.dragging ? 'true' : undefined}>
        <div ref={boxRef} className="relative space-y-2" style={{ containerType: 'inline-size' }}
          data-elimination-cards data-player="" data-system={system} data-method={lb.method} data-stage={lb.stage}>
          {/* la région vivante TOUJOURS montée : une clé par geste */}
          <div role="status" aria-live="polite" className="sr-only" data-ec-verdict-live>
            <span key={liveKey}>{refusedNow ? `${k('player.cueRefused')} ` : ''}<MathText>{verdictText(said)}</MathText></span>
            {shownPreds.map((pr) => <span key={pr.key}> {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}</span>)}
          </div>
          {choices?.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-labelledby={`${uid}-choices`} data-ec-choices>
              <span id={`${uid}-choices`} className="text-sm font-bold text-slate-600">{k('player.choicesLabel')}</span>
              {choices.map((c) => {
                const on = c === system;
                const e2 = E.parseSystem(c);
                return (
                  <button key={c} type="button" data-ec-choice={c} aria-disabled={locked || undefined} aria-pressed={on}
                    onClick={() => { if (!lockedRef.current && !on) { state.setNumbers({ system: c }); setGesture((g) => g + 1); } }}
                    className={`inline-flex min-h-[44px] items-center rounded-xl border-2 px-2 text-sm font-black focus:outline-none focus-visible:ring-2 ${ringP} ${on ? 'border-indigo-700 bg-indigo-50 text-indigo-900' : 'border-slate-300 bg-white text-slate-700'}`}>
                    <span className="pointer-events-none"><MathText>{$(`\\begin{cases} ${E.eqTex(e2[0], E.decimalMode(c))} \\\\ ${E.eqTex(e2[1], E.decimalMode(c))} \\end{cases}`)}</MathText></span>
                  </button>
                );
              })}
            </div>
          )}

          {/* la ligne de l'étape en cours, AU-DESSUS des cartes */}
          {last && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-2 py-1" data-ec-current>
              <span className="text-xs text-slate-600"><MathText>{k(`line_${last.key}`, { n: last.n, v: last.v ? $(last.v) : '', k: last.k })}</MathText></span>
              <FitLine dir="ltr" className="min-w-0 flex-1 font-bold text-slate-900"><MathText>{$(last.tex)}</MathText></FitLine>
            </div>
          )}

          {/* les deux cartes l'une SOUS l'autre, chacune sur toute la largeur : une carte multipliée (jusqu'à 8 tuiles) ne passe jamais à la
              ligne et ne déborde jamais sur sa voisine (walk 2026-11-12 : côte à côte, à 1024 × 768, la poignée de (1) couvrait la valeur de (2)) */}
          {lb.stage === 'cards' && (
            <>
              <div role="group" className={`grid grid-cols-1 gap-1.5 ${predictOpen ? 'rounded-xl ring-4 ring-amber-300 ring-offset-2' : ''}`} data-paging-keep
                aria-label={k('ariaCards', { eq1: plainEq(lb.sys[0]), eq2: plainEq(lb.sys[1]) })}>
                {E.CARDS.map((n) => cardView(n))}
              </div>
              <div data-coach="tray">
                <DropZone drag={drag} id="tray" tone="indigo" label={k('trayZone')} minHeight="min-h-[48px]" className="flex flex-wrap items-center gap-2 p-1.5" data-ec-tray>
                  <span className="text-xs font-bold text-indigo-900">{k('tray')}</span>
                  {lb.expr ? (
                    <span data-coach="expr" className="inline-flex">
                      <DraggableObject drag={drag} id={`expr:${lb.expr.from}`} label={k('player.exprChip', { expr: exprText.replace(/\\dfrac\{(\d+)\}\{(\d+)\}/g, '$1/$2').replace(/\{,\}/g, ','), n: lb.expr.from })}
                        className={`inline-flex min-h-[44px] items-center rounded-xl border-2 border-indigo-600 bg-white px-2 text-base font-bold text-indigo-950 focus-visible:ring-2 ${ringP}`}>
                        <bdi dir="ltr" className="pointer-events-none"><MathText>{$(exprText)}</MathText></bdi>
                      </DraggableObject>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-600">{k('trayEmpty')}</span>
                  )}
                </DropZone>
              </div>
            </>
          )}

          {lb.stage !== 'cards' && (
            <div className="space-y-2 rounded-2xl border-2 border-slate-200 bg-white p-2" data-ec-one data-paging-keep>
              {lb.stage === 'one' && lb.method === 'sub' && subTarget && (
                <div className="space-y-1" data-ec-bundles>
                  <p className="text-xs text-slate-600"><MathText>{k('player.bundlesTitle', { n: subTarget.n, v: $(subTarget.v) })}</MathText></p>
                  <div dir="ltr" className="flex flex-wrap items-center justify-center gap-1">
                    {(() => {
                      const e = E.card(lb, subTarget.n);
                      const u = E.other(subTarget.v);
                      const own = coefOf(e, subTarget.v);
                      const ownAbs = Lin.cmp(own, 0) < 0 ? Lin.neg(own) : own;
                      const many = !Lin.isInteger(ownAbs) || ownAbs.n > TILE_MAX;
                      const bundle = `(${E.exprTex(lb.expr, u, dec)})`;
                      const neg = Lin.cmp(own, 0) < 0;
                      return (
                        <>
                          <PlayerTiles v={u} coef={coefOf(e, u)} decimal={dec} />
                          {Array.from({ length: many ? 1 : ownAbs.n }, (_, i) => (
                            <span key={i} data-ec-bundle className={`inline-flex min-h-[36px] items-center rounded-lg border-2 px-1.5 ${neg ? 'border-dashed border-rose-600 bg-rose-50 text-rose-800' : 'border-indigo-600 bg-indigo-50 text-indigo-900'}`}>
                              <MathText>{$(`${neg ? '-' : ''}${many ? E.numTex(ownAbs, dec) : ''}${bundle}`)}</MathText>
                            </span>
                          ))}
                          <span className="px-1 font-mono text-xl font-bold text-slate-600">=</span>
                          <span data-eq-tile="c" className="inline-flex min-h-[36px] items-center rounded-lg border-2 border-slate-400 bg-slate-50 px-2 font-mono text-lg font-extrabold"><bdi dir="ltr">{E.numText(e.c, dec)}</bdi></span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
              {lb.stage === 'one' && lb.method === 'add' && lb.pairs && (
                <div className="space-y-1" data-ec-annihilate={lb.pairs.v}>
                  <p className="text-xs text-slate-600"><MathText>{k('player.annihilateTitle', { v: $(lb.pairs.v) })}</MathText></p>
                  <div dir="ltr" className="flex flex-wrap items-center justify-center gap-1.5">
                    {Array.from({ length: Math.min(TILE_MAX, lb.pairs.count ?? 1) }, (_, i) => (
                      <span key={i} className="inline-flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5" data-ec-pair>
                        <Tile v={lb.pairs.v} negative={false} label={lb.pairs.count && lb.pairs.count <= TILE_MAX ? null : E.numText(lb.pairs.coef, dec)} crossed />
                        <Tile v={lb.pairs.v} negative label={lb.pairs.count && lb.pairs.count <= TILE_MAX ? null : E.numText(lb.pairs.coef, dec)} crossed />
                        <bdi dir="ltr" className="px-0.5 font-mono text-sm font-bold text-slate-600">= 0</bdi>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {lb.stage === 'one' && buildDone && (
                <div className="flex justify-center" data-coach="next">
                  <button type="button" onClick={nextLine} data-ec-next {...frozen}
                    className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-700 px-4 font-bold text-white focus:outline-none focus-visible:ring-2 ${ringP}`}>
                    <ChevronDown className="h-5 w-5" aria-hidden="true" /> <span>{k('nextLine')}</span>
                  </button>
                </div>
              )}
              {lb.stage === 'back' && lb.found && (
                <div className="space-y-2" data-ec-back>
                  <p className="text-sm font-bold text-slate-700">{k('backTitle')}</p>
                  <div className="flex justify-center" data-coach="value">
                    <DraggableObject drag={drag} id="val" label={k('valueChip', { v: lb.found.v, value: E.numText(lb.found.value, dec) })}
                      className={`inline-flex min-h-[48px] items-center rounded-xl border-2 border-blue-700 bg-blue-50 px-3 font-bold text-blue-950 focus-visible:ring-2 ${ringP}`}>
                      <bdi dir="ltr" className="pointer-events-none"><MathText>{$(`${lb.found.v} = ${E.numTex(lb.found.value, dec)}`)}</MathText></bdi>
                    </DraggableObject>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {E.CARDS.map((n) => (
                      <DropZone key={n} drag={drag} id={`back:${n}`} tone="emerald" minHeight="min-h-[48px]" className="flex flex-wrap items-center justify-center gap-1 p-1 text-sm"
                        label={k('backZone', { n, eq: plainEq(lb.sys[n - 1]) })}>
                        <span className="font-bold text-slate-600">({n})</span>
                        <bdi dir="ltr" className="whitespace-nowrap"><MathText>{$(E.eqTex(lb.sys[n - 1], dec))}</MathText></bdi>
                      </DropZone>
                    ))}
                  </div>
                </div>
              )}
              {lb.stage === 'done' && lb.result && (
                <div className="space-y-2" data-ec-result data-x={pairMasked ? undefined : E.numText(lb.result.x)} data-y={pairMasked ? undefined : E.numText(lb.result.y)} data-masked={pairMasked ? 'true' : undefined}>
                  <div className="flex flex-wrap justify-center gap-3" data-ec-values>
                    <bdi dir="ltr" className="rounded-lg bg-slate-100 px-2 py-1 font-bold"><MathText>{$(`x = ${E.numTex(lb.result.x, dec)}`)}</MathText></bdi>
                    <bdi dir="ltr" className="rounded-lg bg-slate-100 px-2 py-1 font-bold"><MathText>{$(`y = ${E.numTex(lb.result.y, dec)}`)}</MathText></bdi>
                  </div>
                  {pairMasked ? (
                    <p className="rounded-xl border-2 border-dashed border-slate-300 px-3 py-2 text-center text-sm font-bold text-slate-600" data-ec-pair-masked>{k('player.pairMasked')}</p>
                  ) : (
                    <>
                      <EquationDisplay tone="ok" tex={E.pairTex(lb.result.x, lb.result.y, dec)} note={k('resultTitle')} />
                      <p className="text-xs font-bold text-slate-600">{k('checkTitle')}</p>
                      <ul className="space-y-1" data-ec-checks>
                        {checks.map((c) => (
                          <li key={c.n} className="flex flex-wrap items-center justify-center gap-2 text-sm" data-ok={String(c.ok)}>
                            <span className="text-slate-600">({c.n})</span>
                            <bdi dir="ltr"><MathText>{$(c.tex)}</MathText></bdi>
                            {c.ok && <span className="text-xs font-bold text-emerald-800"><span aria-hidden="true">✓ </span>{k('checkOk')}</span>}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {methods >= 2 && missing && !pairMasked && (
                    <div className="flex justify-center" data-coach="other">
                      <button type="button" onClick={() => { if (!lockedRef.current) { setSaid(null); setLab(E.restart(lb)); setGesture((g) => g + 1); } }} data-ec-other={missing} {...frozen}
                        className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border-2 border-indigo-700 bg-white px-4 font-bold text-indigo-800 focus:outline-none focus-visible:ring-2 ${ringP}`}>
                        <RotateCcw className="h-5 w-5" aria-hidden="true" /> <span>{k('tryOther', { method: k(`method_${missing}`) })}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}
