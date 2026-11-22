import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import MathText from '../../components/MathText';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { useLabCoach } from '../primitives/LabCoach';
import PredictTray from '../primitives/PredictTray';
import { useMissionArea } from '../../mission/missionPlayerContext';
import { playSfx } from '../../utils/playEffect';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import { Mx, useTick, spreadAll } from './thalesCp';
import * as L from '../logic/coneCylinder';

/**
 * cone-cylinder — LE LECTEUR DE MISSION (la synthèse de l'unité 9 « خاصية طالس », module 7 ; conseil du 2026-11-10, verdict C). `ConeCylinder.jsx`
 * choisit ce composant quand le labo est joué dans le lecteur (`useInMissionPlayer`) ; la page et l'enseignant gardent le labo d'avant.
 *
 * Ce qui change dans le lecteur :
 *   - UN ESSAI = UN APPUI sur « أدخِل الأسطوانة » : h et r se règlent librement (aucun verdict pendant le geste, le cylindre reste bleu), puis
 *     l'appui juge : il touche (vert), un jeu reste (le jeu est DESSINÉ), il perce (refusé : hachures, ✗ et un mot) ;
 *   - AUCUN nombre dans un verdict, AUCUN volume, AUCUNE lettre de point (ni O, ni S, ni T) : l'égalité se bâtit en NOMBRES (`r2`) — les lettres
 *     viennent à l'étape « بالقلم » du module 7 ;
 *   - le même (h ; r) deux fois n'est pas un essai ; le premier refus peut être gratuit (`freeFirstRefusal`) ;
 *   - `lockH` (h fixé : on cherche r) et `lockR` (r fixé, une liste : on cherche h — la tâche inverse du défi ⭐) ;
 *   - `n` EXPLICITE : le cylindre h = r n'est jamais sur la règle (il reste au module 7, puis au défi 🏆).
 *
 * Props d'une manche : `H`, `R`, `n`, `lockH`, `lockR`, `start: { h, r }`, `freeFirstRefusal`, `chains` ('sec' | 'r2' | 'none'), `build` (la
 * hauteur du cylindre sur lequel r2 bâtit son égalité), `predict` (['part', 'double']), `choices: { cones: [{ H, R, n }] }` (manche libre),
 * `lead`, `mission`, `title`. Événements : `onVerdict { groups: cran de h, exact, free? }`, `onTrial` ({ tk: 'predict' | 'discovered' | 'reset' |
 * 'retry' }, les événements des questions, et la trace { stage: 'press', H, R, h, r, verdict }).
 *
 * CONTRAT DOM : [data-cone-cylinder-player][data-state][data-dirty][data-trials], [data-cc-scene], [data-cc-h-handle] / [data-cc-r-handle]
 * (role=slider, aria-disabled quand figé ou verrouillé), [data-cc-h-less|more], [data-cc-r-less|more], [data-cc-lock=h|r], [data-cc-press],
 * [data-cc-verdict=<kind>], [data-cc-verdict-live], [data-cc-journal], [data-cc-cone-choice], [data-cc-tray], [data-cc-gap], [data-cc-pierce].
 */
const ringCls = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2';
const PRED_MAX = 2;
const PRED_HOLD_MS = 1600;
const BELOW = 46;
const TONE = { inscribed: 'text-emerald-800', gap: 'text-sky-900', pierce: 'text-rose-800', repeat: 'text-slate-700' };
const Num = ({ children }) => <bdi dir="ltr" className="font-mono font-black">{children}</bdi>;
const texOf = (s) => String(s).replace(',', '{,}');
/** « 9/15 » → une vraie barre de fraction (les pastilles de la question `sec`, les cases du journal). */
export const fracNode = (s) => {
  const [a, b] = String(s).split('/');
  return b ? <MathText>{`$\\tfrac{${texOf(a)}}{${texOf(b)}}$`}</MathText> : <bdi dir="ltr">{s}</bdi>;
};

export default function ConeCylinderPlayer({
  H: H0 = 25, R: R0 = 15, n: n0 = 5, lockH = null, lockR = null, start = null, freeFirstRefusal = false, theme = 'cornet',
  title, lead, mission, level, levels: withLevels = true, initialMode = 'student', allowModeSwitch = false,
  checkpoints: cpOn = true, coach: coachOn = true, onTrial, onFinished, onVerdict,
  chains: chainsMode = 'none', build = null, predict: predictList = [], choices,
}) {
  const { t } = useTranslation('lesson');
  const uid = useId();
  const journalId = `${uid}-journal`;
  const k = useCallback((key, o) => t(`manipulation.coneCylinderPlayer.${key}`, o), [t]);
  const state = useManipulation({ type: 'cone-cylinder', initialNumbers: { H: H0, R: R0, n: n0 }, initialMode, initialLevel: level, withLevels, hintCount: 2 });
  const nums = state.numbers;
  // la manche telle qu'écrite (ses verrous, son départ) tant que ses nombres sont les siens ; un autre cône (manche libre) : rien de verrouillé
  const authored = String(nums.H) === String(H0) && String(nums.R) === String(R0) && Number(nums.n ?? n0) === Number(n0);
  const def = useMemo(() => (authored
    ? { H: H0, R: R0, n: n0, lockH, lockR, start, freeFirstRefusal }
    : { H: nums.H, R: nums.R, n: Number(nums.n) }), [authored, H0, R0, n0, lockH, lockR, start, freeFirstRefusal, nums.H, nums.R, nums.n]);
  const make = () => L.initPlayer(def);
  const [lab, setLab] = useState(make);
  const labRef = useRef(lab);
  labRef.current = lab;
  const sceneKey = `${JSON.stringify(def)}|${state.epoch}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [doneIds, setDoneIds] = useState([]);
  const [preds, setPreds] = useState({});
  const asked = useRef(new Set());
  const heardPred = useRef(new Set());
  const [shownPreds, setShownPreds] = useState([]);
  const [predHold, setPredHold] = useState(false);
  const holdTimer = useRef(null);
  const [missionBig, setMissionBig] = useState(false);
  const [liveH, setLiveH] = useState(null);
  const [liveR, setLiveR] = useState(null);
  const [said, setSaid] = useState(null);
  const [presses, setPresses] = useState(0);   // chaque appui (même répété) : la région vivante annonce de nouveau
  const discovered = useRef(false);
  if (scene.key !== sceneKey) {
    // « إعادة », un autre cône : TOUT repart — les essais, les questions, les prédictions
    const fresh = make();
    labRef.current = fresh;
    setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(fresh); setDoneIds([]);
    setPreds({}); asked.current = new Set(); heardPred.current = new Set(); setShownPreds([]); setPredHold(false);
    setLiveH(null); setLiveR(null); setSaid(null); setPresses(0); discovered.current = false;
  }
  useEffect(() => { if (scene.inits > 0) state.report(onTrial, { tk: 'reset' }); }, [scene.inits]); // eslint-disable-line react-hooks/exhaustive-deps

  const buildIdx = useMemo(() => {
    if (build == null || !authored) return null;
    const i = LIN.div(LIN.parseNumber(String(build)), lab.hStep);
    return LIN.isInteger(i) ? LIN.toNumber(i) : null;
  }, [build, authored, lab.hStep]);

  /* ── les questions PENDANT le labo ── */
  const cpSettings = useLabCheckpointSettings('cone-cylinder');
  const cpEnabled = cpOn && cpSettings.enabled;
  const chainList = chainsOf(chainsMode, { buildIdx });
  const judged = predictList.slice(0, PRED_MAX).filter((key) => preds[key] && L.predictJudgedPlayer(lab, key));
  const pendingPreds = judged.filter((key) => !heardPred.current.has(key));
  const holdChain = pendingPreds.length > 0 || predHold;
  const pendingChain = cpEnabled && !holdChain ? chainList.find((c) => c.reached(lab) && !doneIds.includes(c.id)) ?? null : null;
  const ctxQ = { buildIdx };
  const cp = useLabCheckpoint({
    id: pendingChain?.id ?? null,
    questions: pendingChain ? pendingChain.qs.map((q) => QUESTIONS[q](lab, k, ctxQ)) : null,
    reached: !!pendingChain,
    resetKey: scene.inits,
    onRetry: () => {
      const fresh = make();
      labRef.current = fresh; setLab(fresh); setLiveH(null); setLiveR(null); discovered.current = false;
      state.report(onTrial, { tk: 'retry' });
    },
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setDoneIds((d) => (d.includes(id) ? d : [...d, id]));
      // la question se démonte : le focus revient au bouton d'essai, jamais sur la page (revue a11y 2026-11-10)
      setTimeout(() => boxRef.current?.querySelector('[data-cc-press]')?.focus?.(), 80);
    },
  });
  const chainsDone = chainList.every((c) => doneIds.includes(c.id));
  const finished = chainList.length > 0 && chainsDone;
  useEffect(() => {
    if (!finished) return;
    state.discover(); state.formalize();
    state.report(onFinished, { H: L.dec(lab.H), R: L.dec(lab.R) });
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la découverte du labo (deux cylindres inscrits + un contraste) : annoncée une fois à la manche ── */
  const disc = L.discoveredPlayer(lab);
  useEffect(() => {
    if (!disc || discovered.current) return;
    discovered.current = true;
    state.report(onTrial, { tk: 'discovered' });
  }, [disc]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── les PRÉDICTIONS : posées au début de la manche, avant le premier essai ; jugées quand le terrain les montre ── */
  const predQueue = cpEnabled ? predictList.slice(0, PRED_MAX) : [];
  const nextPred = predQueue.find((key) => !asked.current.has(key)) ?? null;
  const predictOpen = nextPred != null && !cp.open && !pendingChain && !missionBig && L.predictTruthPlayer(lab, nextPred) != null;
  const sayPredict = (says) => {
    const key = nextPred;
    const ok = says === L.predictTruthPlayer(labRef.current, key);
    asked.current.add(key);
    playSfx('pop');
    setPreds((p) => ({ ...p, [key]: { ok } }));
    state.report(onTrial, { tk: 'predict', ok });
    if (!predQueue.some((x) => x !== key && !asked.current.has(x))) {
      setTimeout(() => boxRef.current?.querySelector(lab.lockH == null ? '[data-cc-h-handle]' : '[data-cc-r-handle]')?.focus?.(), 60);
    }
  };
  const pendingSig = pendingPreds.join('|');
  useEffect(() => {
    if (!pendingSig) return;
    const keys = pendingSig.split('|');
    keys.forEach((key) => heardPred.current.add(key));
    setShownPreds(keys.map((key) => ({ key, ok: preds[key]?.ok })));
    playSfx(keys.every((key) => preds[key]?.ok) ? 'correct' : 'pop');
    setPredHold(true);
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => setPredHold(false), PRED_HOLD_MS);
  }, [pendingSig]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(holdTimer.current), []);
  useEffect(() => { if (cp.open) setShownPreds([]); }, [cp.open]);

  const locked = cp.open || predictOpen;
  const lockedRef = useRef(false);
  lockedRef.current = locked;

  /* ── mesure ── */
  const boxRef = useRef(null);
  const [boxEl, setBoxEl] = useState(null);
  const setBox = useCallback((el) => { boxRef.current = el; setBoxEl(el); }, []);
  const glanceRef = useRef(null);
  const svgHRef = useRef(220);
  const [width, setWidth] = useState(520);
  const [overhead, setOverhead] = useState(150);
  useLayoutEffect(() => {
    const el = boxEl;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(240, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(110, Math.ceil(glanceRef.current.getBoundingClientRect().height) - svgHRef.current));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (glanceRef.current) ro.observe(glanceRef.current);
    return () => ro.disconnect();
  }, [boxEl]);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (el) { const w = Math.max(240, Math.floor(el.clientWidth)); setWidth((c) => (c === w ? c : w)); }
  });
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 640;
  const area = useMissionArea();
  const inColumn = (area?.width ?? 0) >= 900;
  const playerRoom = area?.height > 0 ? Math.max(170, area.height - 250) : Infinity;
  const budget = Math.round(Math.max(170, Math.min(380, screenH - overhead - 24, playerRoom)));
  const G = L.layout(lab, { width: Math.min(width, 900), height: budget - BELOW });
  const svgW = Math.min(width, Math.round(G.width));
  const svgH = Math.round(G.height) + BELOW;
  svgHRef.current = svgH;

  /* ── les deux poignées : régler, jamais juger ── */
  const tick = useTick();
  const hI = liveH ?? lab.hIdx;
  const rI = liveR ?? lab.rIdx;
  const view = L.probe(lab, hI, rI);
  const hFree = lab.lockH == null;
  const rFree = !lab.lockR;
  const commit = (patch) => {
    const prev = labRef.current;
    const next = L.moveTo(prev, patch);
    if (next !== prev) { labRef.current = next; setLab(next); }
  };
  const num = (p) => Number(p.n) / Number(p.d);
  const hSt = useStretchInteraction({
    value: hI, range: { min: 1, max: lab.n - 1 }, direction: 'ltr', pageStep: 2,
    toValue: (cx, _cy, rect) => (((cx - rect.left) * (svgW / rect.width)) - G.x0) / G.k / num(lab.hStep),
    onChange: (v) => { if (lockedRef.current || !hFree) return; tick(); setLiveH(v); },
    onCommit: (v) => { setLiveH(null); if (lockedRef.current || !hFree) return; commit({ hIdx: v }); },
  });
  const rSt = useStretchInteraction({
    value: rI, range: { min: 1, max: lab.n - 1 }, direction: 'ltr', pageStep: 2,
    // l'écran peut être zoomé (le lecteur ajuste par zoom) : la hauteur affichée de la piste ramène le pointeur en pixels du dessin
    toValue: (_cx, cy, rect) => (G.yAxis - (cy - rect.top) * (G.height / (rect.height || G.height))) / G.k / num(lab.rStep),
    onChange: (v) => { if (lockedRef.current || !rFree) return; tick(); setLiveR(v); },
    onCommit: (v) => { setLiveR(null); if (lockedRef.current || !rFree) return; commit({ rIdx: v }); },
  });

  /* ── ESSAYER : un appui, un verdict ── */
  const dirty = L.isDirty(lab);
  const tryIt = () => {
    if (lockedRef.current) return;
    const prev = labRef.current;
    const next = L.press(prev);
    labRef.current = next; setLab(next); setPresses((n) => n + 1);
    // le même cylindre deux fois : pas un essai — ni son, ni verdict compté (le verdict « جرّبتها من قبل » s'affiche et s'annonce une fois)
    if (next.last.repeat) return;
    const v = next.last.verdict;
    playSfx(v === 'inscribed' ? 'flag' : v === 'pierce' ? 'over' : 'tooth');
    const verdict = L.verdictOfPress(next);
    if (verdict) state.report(onVerdict, verdict);
    state.report(onTrial, { stage: 'press', H: L.dec(next.H), R: L.dec(next.R), h: L.dec(L.hOf(next, next.last.hIdx)), r: L.dec(L.rOf(next, next.last.rIdx)), verdict: v });
    setSaid(null);
  };

  /* ── le verdict (dérivé de l'état : le dernier appui, tant que le cylindre n'a pas bougé) ── */
  const lastPress = lab.last?.kind === 'press' ? lab.last : null;
  const shownVerdict = lastPress && !dirty ? (lastPress.repeat ? 'repeat' : lastPress.verdict) : null;
  const verdictKey = `${presses}:${lab.trials.length}:${lastPress?.repeat ? 'r' : ''}:${shownVerdict ?? ''}`;
  const cue = (kind) => (kind === 'inscribed'
    ? <><span aria-hidden="true">✓ </span><span className="sr-only">{k('cueRight')} </span></>
    : kind === 'pierce' ? <><span aria-hidden="true">✗ </span><span className="sr-only">{k('cueWrong')} </span></> : null);
  const verdictText = shownVerdict ? k(`v.${shownVerdict}`) : null;
  const trialsWord = k('trialsCount', { count: lab.trials.length });

  /* ── le guide ── */
  const coachRaw = coachOn && !locked && !missionBig ? L.coachOfPlayer(lab, { done: finished }) : null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const coachStep = useMemo(() => coachRaw, [coachRaw?.id]);
  const coach = useLabCoach({
    lab: 'cone-cylinder', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: t('manipulation.common.coach.hide'), show: t('manipulation.common.coach.show'), ok: t('manipulation.common.coach.ok'), stop: t('manipulation.common.coach.stop') },
  });

  /* ── la prédiction, ou la question, dans la colonne ── */
  const predPrompt = (key) => k(`predict.${key}.prompt`, {
    h: L.dec(L.hOf(lab, 1)), h1: L.dec(L.hOf(lab, 1)), h2: L.dec(L.hOf(lab, 2)), part: k(`part.${lab.n}`),
  });
  const trayNode = predictOpen ? (
    <PredictTray attr="cc" key={nextPred} step={predQueue.indexOf(nextPred) + 1} of={predQueue.length}
      title={t('manipulation.common.cp.predict.title')} prompt={predPrompt(nextPred)}
      options={L.predictOptionsPlayer(nextPred).map((says) => ({ says, text: k(`predict.${nextPred}.${says}`) }))}
      onSay={sayPredict} />
  ) : cp.open ? cp.node : null;

  /* ── le journal « 📋 جدول تجاربك » ── */
  const ratiosShown = doneIds.includes('sec') || doneIds.includes('r2');
  const rows = L.journalPlayer(lab, { ratios: ratiosShown });
  const journalTable = rows.length > 0 && (
    <div data-cc-journal>
      <p id={journalId} className="text-sm font-black text-indigo-900"><span aria-hidden="true">📋 </span>{k('journal')}</p>
      <table className="mt-1 w-full table-fixed text-center text-xs" aria-labelledby={journalId}>
        <thead>
          <tr className="bg-slate-50">
            <th scope="col">{k('col.n')}</th><th scope="col"><bdi dir="ltr">h</bdi></th><th scope="col"><bdi dir="ltr">r</bdi></th><th scope="col">{k('col.verdict')}</th>
            {ratiosShown && <><th scope="col"><MathText>{'$\\tfrac{r}{R}$'}</MathText></th><th scope="col"><MathText>{'$\\tfrac{H - h}{H}$'}</MathText></th></>}
          </tr>
        </thead>
        <tbody>
          {rows.slice(-6).map((r) => (
            <tr key={r.i} data-cc-row={r.verdict}>
              <td className="border border-slate-200"><Num>{r.i}</Num></td>
              <td className="border border-slate-200"><Num>{r.h}</Num></td>
              <td className="border border-slate-200"><Num>{r.r}</Num></td>
              <td className={`border border-slate-200 font-bold ${TONE[r.verdict]}`}>{cue(r.verdict)}{k(`word.${r.verdict}`)}</td>
              {ratiosShown && <><td className="border border-slate-200">{r.rr ? fracNode(r.rr) : '—'}</td><td className="border border-slate-200">{r.hh ? fracNode(r.hh) : '—'}</td></>}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-xs text-slate-600">{k('journalUnit')}</p>
    </div>
  );
  const verdictBox = (
    <div data-cc-verdict-box>
      {verdictText ? (
        <p key={verdictKey} className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-bold leading-snug ${TONE[shownVerdict]}`} data-cc-verdict={shownVerdict}>
          {cue(shownVerdict)}{verdictText}
        </p>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 px-3 py-2 text-center text-sm font-bold text-slate-600" data-cc-verdict="">{k('waiting')}</p>
      )}
      {shownPreds.map((pr) => (
        <p key={pr.key} data-cc-predict-result={pr.ok ? 'ok' : 'wrong'} data-cc-predict-key={pr.key}
          className={`mt-2 rounded-2xl px-4 py-2 text-center text-lg font-black ${pr.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
          {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}
        </p>
      ))}
    </div>
  );
  const playerRepresentation = !(inColumn && trayNode) && (
    <div className="space-y-2" data-cc-player-col>
      {verdictBox}
      {journalTable}
    </div>
  );

  /* ── le dessin ── */
  const X = G.X; const Y = G.Y; const yA = G.yAxis;
  const Hn = num(lab.H); const Rn = num(lab.R);
  const hN = num(view.h); const rN = num(view.r); const rMaxN = num(view.rMax);
  const ex = 0.2;
  const judgedNow = shownVerdict && shownVerdict !== 'repeat' ? shownVerdict : lastPress?.repeat && !dirty ? L.verdictKind(lab) : null;
  const tone = judgedNow === 'pierce' ? '#E11D48' : judgedNow === 'inscribed' ? '#059669' : '#0369A1';
  const textP = { style: { direction: 'ltr', unicodeBidi: 'isolate' }, fontFamily: 'ui-monospace, monospace' };
  const trackY = G.height + 2;
  const freezeH = locked || !hFree;
  const freezeR = locked || !rFree;
  const btn = `inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 bg-white ${ringCls}`;
  const nudge = (which, d) => {
    if (lockedRef.current) return;
    if (which === 'h' && hFree) commit({ hIdx: labRef.current.hIdx + d });
    if (which === 'r' && rFree) commit({ rIdx: labRef.current.rIdx + d });
    tick();
  };
  const cones = choices?.cones ?? [];
  const sceneSr = k('sceneSr', { H: L.dec(lab.H), R: L.dec(lab.R), h: L.dec(view.h), r: L.dec(view.r) });

  return (
    <ManipulationShell
      type="cone-cylinder"
      title={title ?? k('title')}
      mission={<MathText>{mission ?? k('mission')}</MathText>}
      lead={lead}
      state={state}
      coach={coachOn ? coach : null}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      guided
      hideRepresentation={(inColumn && !!trayNode) || undefined}
      onIntroChange={setMissionBig}
      sidePanel={inColumn && trayNode ? <div data-cc-tray>{trayNode}</div> : null}
      representation={playerRepresentation}
      hints={lab.lockR ? [k('hintLockR1'), k('hintLockR2')] : [k('hint1'), k('hint2')]}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={null}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-rose-50/60 to-white" minHeight="min-h-[150px]">
        <div ref={setBox} className="space-y-2" data-cone-cylinder-player data-world={theme} data-n={lab.n}
          data-state={judgedNow ?? 'idle'} data-dirty={dirty ? 'true' : 'false'} data-trials={lab.trials.length} data-scene-h={svgH}>
          <div className="relative space-y-2">
            <div role="status" aria-live="polite" className="sr-only" data-cc-verdict-live>
              {verdictText && <span key={verdictKey}>{shownVerdict === 'inscribed' ? `${k('cueRight')} ` : shownVerdict === 'pierce' ? `${k('cueWrong')} ` : ''}{verdictText}</span>}
              {shownPreds.map((pr) => <span key={pr.key}> {pr.ok ? t('manipulation.common.cp.predict.right') : k('predict.wrong')}</span>)}
              {said && <span key={`${said}:${lab.trials.length}`}> {said}</span>}
            </div>
            <p className="sr-only" data-cc-scene-sr>{sceneSr}</p>
            {!inColumn && trayNode && <div className="mx-auto max-w-xl" data-cc-tray>{trayNode}</div>}
            <div ref={glanceRef} className="space-y-2" data-cc-glance>
              {cones.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-labelledby={`${uid}-cones`} data-cc-choices>
                  <span id={`${uid}-cones`} className="text-sm font-bold text-slate-600">{k('choicesCones')}</span>
                  {cones.map((c) => {
                    const on = String(c.H) === String(nums.H) && String(c.R) === String(nums.R);
                    const label = `H = ${c.H} ، R = ${c.R}`;
                    return (
                      <button key={label} type="button" aria-pressed={on} aria-disabled={locked || undefined} data-cc-cone-choice={`${c.H}/${c.R}`}
                        onClick={() => { if (lockedRef.current) return; state.setNumbers({ H: c.H, R: c.R, n: c.n }); setSaid(k('sayCone', { H: c.H, R: c.R })); }}
                        className={`min-h-[44px] rounded-xl border-2 px-3 text-sm font-black ${ringCls} ${on ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-300 bg-white text-slate-700'}`}>
                        <bdi dir="ltr">{label}</bdi>
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="relative mx-auto" style={{ width: svgW, height: svgH }} data-cc-scene>
                <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="absolute inset-0" style={{ direction: 'ltr' }} aria-hidden="true" focusable="false">
                  <defs>
                    <pattern id={`${uid}-waffle`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <rect width="10" height="10" fill="#FDE68A" />
                      <path d="M0 0 L0 10 M0 0 L10 0" stroke="#D97706" strokeWidth="1" opacity="0.45" />
                    </pattern>
                    <pattern id={`${uid}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <rect width="6" height="6" fill="#FFE4E6" />
                      <line x1="0" y1="0" x2="0" y2="6" stroke="#E11D48" strokeWidth="2" />
                    </pattern>
                  </defs>
                  {/* le cornet : base elliptique à gauche, pointe à droite (aucune lettre de point) */}
                  <path d={`M${X(0)} ${Y(Rn)} L${X(Hn)} ${yA} L${X(0)} ${Y(-Rn)} Z`} fill={`url(#${uid}-waffle)`} stroke="#B45309" strokeWidth={1.6} />
                  <ellipse cx={X(0)} cy={yA} rx={ex * Rn * G.k} ry={Rn * G.k} fill="#FEF3C7" stroke="#B45309" strokeWidth={1.6} />
                  {/* le pot */}
                  <rect x={X(0)} y={Y(rN)} width={X(hN) - X(0)} height={2 * rN * G.k} fill={tone} opacity={0.3} data-cc-body />
                  <line x1={X(0)} y1={Y(rN)} x2={X(hN)} y2={Y(rN)} stroke={tone} strokeWidth={2.4} />
                  <line x1={X(0)} y1={Y(-rN)} x2={X(hN)} y2={Y(-rN)} stroke={tone} strokeWidth={2.4} />
                  <ellipse cx={X(hN)} cy={yA} rx={ex * rN * G.k} ry={rN * G.k} fill="#FFFFFF" fillOpacity={0.55} stroke={tone} strokeWidth={2.4} />
                  {/* REFUSÉ : la partie qui sort du cornet, hachurée (un repère qui n'est pas qu'une couleur) */}
                  {judgedNow === 'pierce' && (
                    <path data-cc-pierce d={`M${X(Hn - (rN * Hn) / Rn)} ${Y(rN)} L${X(hN)} ${Y(rN)} L${X(hN)} ${Y(rMaxN)} Z`} fill={`url(#${uid}-hatch)`} stroke="#E11D48" strokeWidth={1.5} />
                  )}
                  {/* UN JEU : dessiné entre le bord du pot et le jarret, sans nombre */}
                  {judgedNow === 'gap' && (
                    <line data-cc-gap x1={X(hN)} y1={Y(rN)} x2={X(hN)} y2={Y(rMaxN)} stroke="#D97706" strokeWidth={4} strokeDasharray="3 3" strokeLinecap="round" />
                  )}
                  <line x1={X(0)} y1={yA} x2={X(Hn)} y2={yA} stroke="#334155" strokeDasharray="5 4" />
                  <line x1={X(0)} y1={Y(Rn)} x2={X(Hn)} y2={yA} stroke={judgedNow === 'inscribed' ? '#059669' : '#92400E'} strokeWidth={judgedNow === 'inscribed' ? 3 : 1.6} />
                  <line x1={X(0)} y1={yA} x2={X(0)} y2={Y(Rn)} stroke="#92400E" strokeDasharray="2 2" />
                  <text x={X(0) + 4} y={Y(Rn) + 14} fontSize={11} fontWeight="bold" fill="#92400E" {...textP}>{`R = ${L.dec(lab.R)}`}</text>
                  <text x={(X(0) + X(Hn)) / 2} y={Y(-Rn) - 4} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#92400E" {...textP}>{`H = ${L.dec(lab.H)}`}</text>
                  <text x={X(hN) + 6} y={(Y(rN) + yA) / 2 + 4} fontSize={11} fontWeight="bold" fill={tone} {...textP}>r</text>
                  <text x={(X(0) + X(hN)) / 2} y={Y(rN) - 5} textAnchor="middle" fontSize={11} fontWeight="bold" fill={tone} {...textP}>h</text>
                  {/* la piste de h : l'axe gradué sous le cornet */}
                  <line x1={X(0)} y1={trackY + 22} x2={X(Hn)} y2={trackY + 22} stroke="#94A3B8" strokeWidth={2} />
                  {Array.from({ length: lab.n + 1 }, (_, i) => i).map((i) => (
                    <line key={i} x1={X(num(L.hOf(lab, i)))} x2={X(num(L.hOf(lab, i)))} y1={trackY + 18} y2={trackY + 26} stroke="#94A3B8" />
                  ))}
                </svg>
                <div {...hSt.trackProps} className="absolute" style={{ ...hSt.trackProps.style, left: 0, width: svgW, top: trackY, height: BELOW - 2, ...(freezeH ? { pointerEvents: 'none' } : {}) }} data-cc-h-track>
                  <div {...hSt.handleProps({ label: k('hHandle'), valueText: `${k('hValueText', { h: L.dec(view.h) })}${hFree ? '' : ` — ${k('lockedSr')}`}` })}
                    data-cc-h-handle={hI} aria-disabled={freezeH || undefined}
                    className="group absolute flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border-2 border-sky-700 bg-white/90 outline-none focus-visible:ring-4 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                    style={{ left: X(hN), top: 0, cursor: freezeH ? 'default' : hSt.dragging ? 'grabbing' : 'grab' }}>
                    <span aria-hidden="true" className="text-sm font-black text-sky-800">{hFree ? '⇆' : '🔒'}</span>
                  </div>
                </div>
                <div {...rSt.trackProps} className="absolute" style={{ ...rSt.trackProps.style, left: X(hN) - 22, width: 44, top: 0, height: G.height, ...(freezeR ? { pointerEvents: 'none' } : {}) }} data-cc-r-track>
                  <div {...rSt.handleProps({ label: k('rHandle'), valueText: `${k('rValueText', { r: L.dec(view.r) })}${rFree ? '' : ` — ${k('lockedSr')}`}` })}
                    aria-orientation="vertical"
                    data-cc-r-handle={rI} aria-disabled={freezeR || undefined}
                    className="absolute left-0 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-white/90 outline-none focus-visible:ring-4 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                    style={{ top: Y(rN), borderColor: tone, cursor: freezeR ? 'default' : rSt.dragging ? 'grabbing' : 'grab' }}>
                    <span aria-hidden="true" className="text-sm font-black" style={{ color: tone }}>{rFree ? '↕' : '🔒'}</span>
                  </div>
                </div>
              </div>
              {/* les commandes, dans l'ordre du dessin (h puis r), puis l'essai */}
              <div className="flex flex-wrap items-center justify-center gap-1.5" dir="ltr" data-cc-controls>
                {hFree && <button type="button" onClick={() => nudge('h', -1)} aria-disabled={freezeH || undefined} aria-label={k('hLess')} data-cc-h-less className={`${btn} border-sky-300`}><Minus className="h-4 w-4" aria-hidden="true" /></button>}
                <span className="min-w-[4.6rem] rounded-full bg-sky-100 px-2 text-center font-mono text-sm font-extrabold text-sky-900" data-cc-h-value={L.dec(view.h)} data-cc-lock={hFree ? undefined : 'h'}>
                  {!hFree && <span aria-hidden="true">🔒 </span>}<bdi dir="ltr">{`h = ${L.dec(view.h)}`}</bdi>{!hFree && <span className="sr-only"> {k('lockedSr')}</span>}
                </span>
                {hFree && <button type="button" onClick={() => nudge('h', 1)} aria-disabled={freezeH || undefined} aria-label={k('hMore')} data-cc-h-more className={`${btn} border-sky-300`}><Plus className="h-4 w-4" aria-hidden="true" /></button>}
                <span className="mx-1 h-6 w-px bg-slate-300" aria-hidden="true" />
                {rFree && <button type="button" onClick={() => nudge('r', -1)} aria-disabled={freezeR || undefined} aria-label={k('rLess')} data-cc-r-less className={`${btn} border-rose-300`}><Minus className="h-4 w-4" aria-hidden="true" /></button>}
                <span className="min-w-[4.6rem] rounded-full bg-rose-100 px-2 text-center font-mono text-sm font-extrabold text-rose-900" data-cc-r-value={L.dec(view.r)} data-cc-lock={rFree ? undefined : 'r'}>
                  {!rFree && <span aria-hidden="true">🔒 </span>}<bdi dir="ltr">{`r = ${L.dec(view.r)}`}</bdi>{!rFree && <span className="sr-only"> {k('lockedSr')}</span>}
                </span>
                {rFree && <button type="button" onClick={() => nudge('r', 1)} aria-disabled={freezeR || undefined} aria-label={k('rMore')} data-cc-r-more className={`${btn} border-rose-300`}><Plus className="h-4 w-4" aria-hidden="true" /></button>}
                <button type="button" onClick={tryIt} aria-disabled={locked || undefined} data-cc-press
                  // aria-disabled, jamais disabled : le focus clavier reste sur le bouton (`tryIt` se garde lui-même)
                  className={`ms-2 inline-flex min-h-[48px] items-center gap-2 rounded-2xl border-2 px-5 text-base font-black ${ringCls} ${!locked ? 'border-amber-700 bg-amber-700 text-white shadow-[0_3px_0_0_#78350F]' : 'border-slate-300 bg-slate-200 text-slate-600'}`}>
                  <span dir="rtl">{k('press')}</span>
                </button>
              </div>
              <p className="sr-only">{trialsWord}</p>
            </div>
          </div>
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/**
 * Les suites, par mode : { id, reached(lab), qs } — l'id est le point d'étape de la manche (`{ checkpoint: id }`).
 *   sec  au premier cylindre qui TOUCHE : lire r/R et (H − h)/H en NOMBRES (trois pastilles, le leurre h/H). La manche s'arrête là.
 *   r2   quand le cylindre de `build` touche : BÂTIR « r/R = □/□ » en nombres (le leurre : h), puis la règle en mots (leurres : « r + h ثابت »,
 *        « r/R = h/H », réfutés par les propres cylindres de l'élève).
 */
export function chainsOf(mode, { buildIdx = null } = {}) {
  if (mode === 'sec') return [{ id: 'sec', reached: (lab) => Boolean(L.firstInscribed(lab)), qs: ['sec'] }];
  // r2 : le cylindre de la construction ET au moins un autre cylindre qui touche (la règle se réfute avec DEUX cylindres — revue 2026-11-10)
  if (mode === 'r2' && buildIdx != null) return [{ id: 'r2', reached: (lab) => Boolean(L.inscribedAt(lab, buildIdx)) && new Set(L.inscribedTrials(lab).map((t) => t.hIdx)).size >= 2, qs: ['build', 'rule'] }];
  return [];
}

const spinList = (xs, seed) => { const s = ((seed % xs.length) + xs.length) % xs.length; return xs.map((_, i) => xs[(i + s) % xs.length]); };
const seedOf = (lab) => Number(lab.H.n) + Number(lab.R.n) + lab.n;

const RAW_QUESTIONS = {
  sec: (lab, k) => {
    const tr = L.firstInscribed(lab);
    const s = L.secOptions(lab, tr);
    const o = { h: L.dec(tr.h), r: L.dec(tr.r), H: L.dec(lab.H), R: L.dec(lab.R), rr: s.rr, hh: s.hh };
    return {
      id: 'sec', kind: 'fill', prompt: Mx(k, 'sec.prompt', o),
      fields: [
        { label: <MathText>{'$\\dfrac{r}{R}$'}</MathText>, expected: s.rr, options: s.options, render: fracNode },
        { label: <MathText>{'$\\dfrac{H - h}{H}$'}</MathText>, expected: s.hh, options: s.options, render: fracNode },
      ],
      hints: [Mx(k, 'sec.hint1', o), Mx(k, 'sec.hint2', o)],
      explain: Mx(k, 'sec.explain', { ...o, rrx: `\\dfrac{${texOf(L.dec(tr.r))}}{${texOf(o.R)}}`, hhx: `\\dfrac{${texOf(L.dec(LIN.sub(lab.H, tr.h)))}}{${texOf(o.H)}}` }),
    };
  },
  build: (lab, k, { buildIdx }) => {
    const b = L.buildOf(lab, buildIdx);
    const o = { h: L.dec(L.hOf(lab, buildIdx)) };
    return {
      id: 'build', kind: 'build', prompt: Mx(k, 'build.prompt', o),
      slots: ['r', 'R', k('cp.build.slotTop'), k('cp.build.slotBottom')], ops: ['/', '=', '/'],
      tiles: [b.r, b.R, ...spinList([b.OT, b.H, b.h], seedOf(lab))], preset: [b.r, b.R, null, null],
      expected: [...b.expected],
      hints: [Mx(k, 'build.hint1', o), Mx(k, 'build.hint2', o)],
      explain: Mx(k, 'build.explain', { ...o, eq: `\\dfrac{${texOf(b.r)}}{${texOf(b.R)}} = \\dfrac{${texOf(b.OT)}}{${texOf(b.H)}}` }),
    };
  },
  rule: (lab, k) => {
    const ins = lab.trials.filter((x) => x.inscribed);
    const sums = [...new Set(ins.map((x) => L.dec(LIN.add(x.h, x.r))))].join(' ، ');
    const a = ins[0];
    const o = {
      sums,
      h: L.dec(a.h), a: `\\dfrac{${texOf(L.dec(a.r))}}{${texOf(L.dec(lab.R))}}`, b: `\\dfrac{${texOf(L.dec(a.h))}}{${texOf(L.dec(lab.H))}}`,
    };
    return {
      id: 'rule', kind: 'choice', prompt: Mx(k, 'rule.prompt', o),
      options: [
        { text: Mx(k, 'rule.right', o), correct: true },
        { text: Mx(k, 'rule.sum', o), why: Mx(k, 'rule.whySum', o) },
        { text: Mx(k, 'rule.same', o), why: Mx(k, 'rule.whySame', o) },
      ],
      hints: [Mx(k, 'rule.hint1', o), Mx(k, 'rule.hint2', o)], explain: Mx(k, 'rule.explain', o),
    };
  },
};

export const QUESTIONS = spreadAll(RAW_QUESTIONS, seedOf);
