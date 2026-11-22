import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react';
import * as divisibility from '@smarter-academy/core/arithmetic/divisibility.js';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import DivisorSet from '../primitives/DivisorSet';
import { BOOK_PALETTE } from '../primitives/BookFigure';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import PredictTray from '../primitives/PredictTray';
import NumberTile from '../primitives/NumberTile';
import RolesEquation from '../primitives/RolesEquation';
import { useInMissionPlayer, useMissionArea } from '../../mission/missionPlayerContext';
import { chipsAround, buildTiles } from './divisionChecks';
import { playSfx } from '../../utils/playEffect';
import MathText from '../../components/MathText';
import * as L from '../logic/factorPairs';

const { divisionTestBound } = divisibility;

// Lecteur de mission : ce que la scène porte autour du rectangle (étapier, réglette, boutons − / +, bandeau de prédiction), en px.
const PLAYER_SCENE_OVERHEAD = 300;
// Au plus 2 prédictions par manche : l'élève prédit les premières largeurs, puis joue librement (pas de lassitude)
const PRED_MAX = 2;

/**
 * factor-pairs — LE RECTANGLE QUI SE COUCHE.
 *
 * A. L'élève TIRE le bord de la rangée : d, le nombre de livres par rangée,
 *    suit le doigt (réglette `useStretchInteraction` ; clavier, − / + et
 *    toucher la réglette font la même chose).
 * B. Idée : n = d × e ⇔ les n livres forment un rectangle PARFAIT ; les
 *    diviseurs viennent par PAIRES.
 * C. Pendant le geste, les n livres se rangent en rangées de d, dessinés dans
 *    un cadre carré : le rectangle est haut et mince, devient CARRÉ, puis
 *    large et plat. Une rangée incomplète est dessinée en pointillés ambre.
 * D. Émerge, au relâchement : n = d × e (+ r), et la paire (petit × grand)
 *    rejoint le tableau — deux diviseurs d'un coup.
 * E. À découvrir : passé le carré, chaque rectangle parfait est un rectangle
 *    déjà possible, COUCHÉ (« مقلوب ») — on peut s'arrêter au carré, √n.
 *
 * FICHE (MANIPULATION_DNA §7) — variable : d ; invariant : les n livres ;
 * résistance : la rangée incomplète ; contraste : parfait / incomplet ;
 * découverte : tous les d jusqu'au carré testés ET un rectangle couché vu
 * (`discoveryReady`, indépendant de l'ordre depuis 2026-09-30).
 *
 * ONBOARDING (prop `coach`, défaut true — `LabCoach`, §8quater) : `logic/factorPairs.js › coachOf` montre la poignée de la réglette
 * (glisser), puis le bouton « + » ou « − » du côté de la prochaine largeur à essayer ; il ne la nomme pas.
 *
 * Jusqu'au 2026-09-30 l'élève portait un NOMBRE d'un rail où les tuiles
 * au-delà de √n étaient grisées d'avance — la règle d'arrêt était affichée
 * avant d'être découverte. Rien ici ne marque √n : c'est le carré qui le dit.
 */
export default function FactorPairs({
  n: n0, title, lead, mission, initialMode = 'student', allowModeSwitch = false, onFinished, coach: coachOn = true, checkpoints: cpOn = true, onTrial,
  // ── LECTEUR DE MISSION (rollout 2026-11-08, traitement v2 du labo) ──
  onVerdict,
  // false : pas de sélecteur مبتدئ / متقدم (le lecteur joue en manches, LabRounds)
  levels: withLevels = true,
  // true : l'élève a DÉJÀ dessiné les rectangles à la main (manche 1) — « جرّب كل الإمكانيات » s'ouvre d'emblée
  handDone = false,
  // les suites de questions permises : 'first' (observe → build) et 'rule' (le rectangle couché → la règle d'arrêt)
  chains: chainsOn = ['first', 'rule'],
  // false : pas de prédiction avant les premières largeurs
  predict: predictOn = true,
  // des pastilles de nombres de livres à essayer (terrain libre)
  nChoices,
}) {
  const { t } = useTranslation('lesson');
  const gameScreen = useInMissionPlayer();
  const area = useMissionArea();
  const k = useCallback((key, o) => t(`manipulation.factorPairs.${key}`, o), [t]);
  const state = useManipulation({ type: 'factor-pairs', initialNumbers: { n: n0 }, initialMode, hintCount: 3, withLevels: withLevels !== false });
  const { n } = state.numbers;
  const bound = divisionTestBound(n);
  const range = L.widthRange(n);

  const [lab, setLab] = useState(() => L.init({ n: n0 }));
  // Un d PAR DÉFAUT, jamais un diviseur : la manipulation n'est pas vide à l'ouverture et ne donne rien (2026-10-09). Ce n'est pas un essai : seul un geste validé entre dans `lab`.
  const [d, setD] = useState(() => L.defaultWidth(n0));
  const sceneKey = `${n}:${state.epoch}`;
  const [scene, setScene] = useState(sceneKey);
  const [doneIds, setDoneIds] = useState({});
  const [retryN, setRetryN] = useState(0);
  // lecteur : la largeur qui attend sa PRÉDICTION, la dernière prédiction jugée, l'ordre des essais (le journal)
  const [pending, setPending] = useState(null);
  const [pred, setPred] = useState(null);
  const [hist, setHist] = useState([]);
  const predsMade = useRef(0);
  const [missionBig, setMissionBig] = useState(false);
  if (scene !== sceneKey) { setScene(sceneKey); setLab(L.init({ n })); setD(L.defaultWidth(n)); setDoneIds({}); setPending(null); setPred(null); setHist([]); predsMade.current = 0; }

  // Miroir synchrone de `lab` : « جرّب كل الإمكانيات » enchaîne des pas plus
  // vite qu'un rendu, il lui faut toujours le dernier état.
  const labRef = useRef(lab);
  labRef.current = lab;
  // le VERDICT d'un essai (largeur v) remonte à la manche (LabRounds) : `groups` = le nombre de livres par rangée
  const verdictRef = useRef(null);
  verdictRef.current = (v) => {
    setHist((h) => [...h, v]);
    state.report(onVerdict, { n, groups: v, exact: n % v === 0, rows: Math.floor(n / v), rest: n % v });
  };
  const commit = useCallback((v) => { setD(v); setLab((s) => L.test(s, v)); verdictRef.current?.(v); }, []);
  // lecteur : une largeur NOUVELLE attend d'abord la prédiction de l'élève (holdRef dit si on prédit encore)
  const holdRef = useRef(false);
  const commitPlayer = useCallback((v) => {
    if (holdRef.current && !labRef.current.tested.some((x) => x.d === v)) { setD(v); setPending(v); return; }
    commit(v);
  }, [commit]);
  const ready = L.discoveryReady(lab);
  // le PREMIER essai de la scène (le tableau `tested` est trié par d, il ne garde pas l'ordre) : la 1re suite de questions s'y rapporte
  const firstRef = useRef(null);
  if (lab.tested.length === 0) firstRef.current = null;
  else if (firstRef.current == null) firstRef.current = lab.tested.find((x) => x.d === lab.cols) ?? lab.tested[0];
  // les questions pendant le labo : obligatoires pour tout élève, l'enseignant seul les coupe pour SON compte
  const cpSettings = useLabCheckpointSettings('factor-pairs');
  const cpLive = cpOn && cpSettings.enabled;
  const wanted = ready ? 'rule' : lab.tested.length > 0 ? 'first' : null;
  const cpId = cpLive && wanted && chainsOn.includes(wanted) ? wanted : null;
  // lecteur : observer d'un toucher puis BÂTIR l'égalité ; après le rectangle couché, laquelle puis la règle (pilote 2026-11-07)
  const chain = cpId ? (gameScreen ? CHAINS_PLAYER : CHAINS)[cpId] : null;
  const kq = (key, o) => t(`manipulation.factorPairs.${key}`, o);
  const cp = useLabCheckpoint({
    id: cpId,
    questions: chain ? chain.map((q) => QUESTIONS[q]({ n, lab, first: firstRef.current }, kq)) : null,
    reached: !!cpId,
    resetKey: `${sceneKey}:${state.resetCount}:${retryN}`,
    onRetry: () => { setLab(L.init({ n })); setD(L.defaultWidth(n)); setDoneIds({}); setRetryN((x) => x + 1); },
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setDoneIds((x) => ({ ...x, [id]: true }));
      if (id === 'rule') { state.discover(); state.formalize(); }
    },
  });
  useEffect(() => { if (ready && !cpLive && !gameScreen) state.discover(); }, [ready, state.epoch, cpLive]); // eslint-disable-line react-hooks/exhaustive-deps
  // lecteur : prédire avant d'agir — encore PRED_MAX fois par manche, jamais pendant une suite de questions
  holdRef.current = gameScreen && predictOn && cpLive && predsMade.current < PRED_MAX && !cp.open;
  const hideAnswers = gameScreen && cp.open && cpId === 'first';
  const predictOpen = gameScreen && !missionBig && pending != null && pending === d && !cp.open && !!d;
  const sayPredict = (says) => {
    const dd = pending;
    const ok = (says === 'perfect') === (n % dd === 0);
    predsMade.current += 1;
    playSfx(ok ? 'correct' : 'pop');
    setPred({ d: dd, ok });
    state.report(onTrial, { tk: 'predict', ok });
    setPending(null);
    commit(dd);
  };
  // la largeur qui attend sa prédiction ne montre RIEN du rectangle : sinon la prédiction est déjà une lecture
  const veil = holdRef.current && d != null && !lab.tested.some((x) => x.d === d);
  // les étapes : un premier essai interrogé, puis la règle d'arrêt (le rectangle couché) et la règle
  const stepCount = chainsOn.includes('rule') ? 2 : 1;
  const stepDone = [!!doneIds.first || !!doneIds.rule || (!cpLive && lab.tested.length > 0), !!doneIds.rule || (!cpLive && ready)];
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.tested.length === 0 && celebrated.current.size) celebrated.current = new Set();
  useEffect(() => {
    stepDone.forEach((x, i) => {
      if (!x || celebrated.current.has(i)) return;
      celebrated.current.add(i);
      if (i < stepCount) party.celebrate({ n: i + 1, total: stepCount });
    });
  }, [stepDone[0], stepDone[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son du geste (muet sans « الصوت ») : un essai · un rectangle tamam · un rectangle couché · l'étape atteinte
  const heard = useRef({ n: 0, ready: false });
  useEffect(() => {
    const h = heard.current;
    if (lab.tested.length > h.n && lab.tested.length > 0) {
      const last = lab.tested.find((x) => x.d === lab.cols);
      if (last?.repeat) playSfx('over'); else if (last?.divides) playSfx('bell'); else playSfx('tooth');
    }
    h.n = lab.tested.length;
  }, [lab.tested.length]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (ready && !heard.current.ready) playSfx('flag'); heard.current.ready = ready; }, [ready]);
  useEffect(() => { if (state.isFormal) state.report(onFinished, n); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  // La place : la réglette prend toute la largeur ; le cadre est carré.
  const boxRef = useRef(null);
  const [width, setWidth] = useState(300);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => setWidth(Math.max(200, Math.floor(el.clientWidth)));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const EDGE = 26;
  const mu = Math.max(range.max > 40 ? 4 : 8, Math.min(40, (width - 2 * EDGE) / range.max));
  const x0 = width - EDGE;
  const xOf = (v) => x0 - v * mu;
  const toValue = useCallback((clientX, _y, rect) => (x0 - (clientX - rect.left)) / mu, [x0, mu]);
  const stretch = useStretchInteraction({ value: d, range, toValue, onChange: setD, onCommit: commitPlayer, direction: 'rtl' });

  // Le cadre du rectangle prend TOUTE la place offerte (largeur mesurée, hauteur
  // bornée pour que la manipulation reste lisible sans défilement long).
  const frameRef = useRef(null);
  const [frameW, setFrameW] = useState(280);
  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return undefined;
    const measure = () => setFrameW(Math.max(160, Math.floor(el.clientWidth) - 16));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // Dans le lecteur de mission le labo est monté dans une copie cachée (largeur 0) puis déplacé : le ResizeObserver ne ré-annonce
  // pas toujours la vraie largeur. On re-mesure donc aussi à chaque rendu (même valeur = aucun nouveau rendu) ; la zone du
  // lecteur (`useMissionArea`) change quand l'écran se pose, ce qui rend ce composant à nouveau.
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (el) { const w = Math.max(200, Math.floor(el.clientWidth)); setWidth((cur) => (cur === w ? cur : w)); }
    const fr = frameRef.current;
    if (fr) { const w = Math.max(160, Math.floor(fr.clientWidth) - 16); setFrameW((cur) => (cur === w ? cur : w)); }
  });

  const boxW = frameW;
  // lecteur : le rectangle prend la hauteur qui reste dans l'écran de jeu (jamais de défilement), borné pour rester lisible
  const boxH = gameScreen && area?.height ? Math.round(Math.min(340, Math.max(170, area.height - PLAYER_SCENE_OVERHEAD))) : (width < 520 ? 280 : 360);
  const R = d == null || veil ? null : L.rectangleLayout({ n, d, boxW, boxH, maxCell: gameScreen ? 72 : 44 });

  // Saisie directe de d (grands nombres : 452 → on tape 4 au lieu de tirer).
  const [typed, setTyped] = useState('');
  const [typing, setTyping] = useState(false);
  const submitTyped = () => {
    setTyping(false);
    const v = Number(String(typed).replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x0660)));
    if (Number.isInteger(v) && v >= range.min && v <= range.max) { stretch.set(v); stretch.flush(); }
  };
  // Le résultat SUIT le geste : calculé pour le d vivant, jamais retiré.
  const live = d == null ? null : { rows: Math.floor(n / d), rest: n % d, divides: n % d === 0, repeat: n % d === 0 && d > Math.floor(n / d) };
  const untested = () => Array.from({ length: range.max }, (_, i) => i + 1).filter((v) => !labRef.current.tested.some((x) => x.d === v));
  const coachStep = coachOn ? L.coachOf(lab, { d, range }) : null;
  const coach = useLabCoach({
    lab: 'factor-pairs', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });
  const color = (i) => BOOK_PALETTE[i % BOOK_PALETTE.length][0];
  const labelStep = [1, 2, 5, 10].find((s) => s * mu >= 22) ?? 10;
  // lecteur : la prédiction ou la question PREND la colonne du labo ; la réglette se fige le temps d'y répondre (le rectangle décrit CET essai)
  const trayNode = !gameScreen ? null : predictOpen ? (
    <PredictTray
      attr="fp"
      title={k('cp.predict.title')}
      prompt={k('cp.predict.prompt', { n, d })}
      options={[{ says: 'perfect', text: k('cp.predict.perfect') }, { says: 'short', text: k('cp.predict.short') }]}
      onSay={sayPredict}
    />
  ) : cp.open ? cp.node : null;
  const locked = gameScreen && (cp.open || predictOpen);
  const showStepper = !(gameScreen && (!cpLive || chainsOn.length === 0));

  return (
    <ManipulationShell
      type="factor-pairs"
      // Un autre nombre testé au « مختبر حر » : le titre écrit pour n0 ne le décrit plus.
      title={n === n0 ? (title ?? k('title', { n })) : k('title', { n })}
      // une manche où « جرّب كل الإمكانيات » est ouvert d'emblée (handDone) ne dit plus « اسحب » : la consigne suit le geste réel
      mission={mission ?? k(gameScreen && handDone ? 'missionButton' : 'mission', { n })}
      lead={n === n0 ? lead : null}
      state={state}
      coach={coachOn ? coach : null}
      headerAction={cpSettings.control}
      // lecteur : l'écran de jeu est toujours GUIDÉ (ni « جرّب › اكتشف », ni تلميح, ni carte « ماذا لاحظت؟ » — les manches et les questions guident)
      guided={!!chain || cpLive || gameScreen}
      hideRepresentation={hideAnswers || gameScreen}
      onIntroChange={setMissionBig}
      // la question / la prédiction prend la COLONNE du labo : le rectangle et la réglette gardent toute la largeur
      sidePanel={trayNode ? <div data-fp-tray>{trayNode}</div> : null}
      freeLabAlwaysOpen={!gameScreen}
      allowFreeLab={!gameScreen}
      freeLabLead={k('freeLead')}
      numberFields={[{ key: 'n', label: 'a' }]}
      allowModeSwitch={allowModeSwitch}
      hints={[k('hint1'), k('hint2'), k('hint3')]}
      controller={{
        autoStep: () => {
          const next = Array.from({ length: range.max }, (_, i) => i + 1).find((v) => !lab.tested.some((x) => x.d === v));
          if (next === undefined) return false;
          commit(next);
          return true;
        },
        canAutoStep: () => lab.tested.length < range.max,
        // lecteur : « جرّب كل الإمكانيات » est le BOUTON du geste appris — il s'ouvre après la manche à la main (handDone)
        autoComplete: gameScreen && !handDone ? undefined : {
          label: t('manipulation.autoComplete.tryAll'),
          ready: true,
          remaining: untested().length,
          // un essai par pas, court : on VOIT chaque rectangle et chaque paire arriver
          intervalMs: 480,
          maxTicks: 80,
          step: () => {
            const next = untested()[0];
            if (next === undefined) return;
            labRef.current = L.test(labRef.current, next);
            setD(next);
            setLab((s) => L.test(s, next));
            verdictRef.current?.(next);
          },
          finish: () => {
            const todo = untested();
            if (todo.length === 0) return;
            labRef.current = todo.reduce((acc, v) => L.test(acc, v), labRef.current);
            setD(todo[todo.length - 1]);
            setLab((s) => todo.reduce((acc, v) => L.test(acc, v), s));
            todo.forEach((v) => verdictRef.current?.(v));
          },
        },
        showSolution: () => { setLab((s) => Array.from({ length: range.max }, (_, i) => i + 1).reduce((acc, v) => L.test(acc, v), s)); state.discover(); state.formalize(); },
      }}
      representation={!gameScreen && !hideAnswers && live && (
        <div className="space-y-2" data-factor-result>
          {live.divides
            ? <EquationDisplay tex={`${n} = ${d} \\times ${live.rows}`} tone={live.repeat ? 'muted' : 'ok'} note={live.repeat ? k('turned', { d, e: live.rows }) : k('perfect', { n, d, e: live.rows })} />
            : <EquationDisplay tex={`${n} = ${d} \\times ${live.rows} + ${live.rest}`} tone="neutral" note={k('imperfect', { d, n, r: live.rest })} />}
        </div>
      )}
      discovery={(
        <ManipulationDiscovery
          state={state}
          prompt={k('discoverPrompt')}
          options={[
            { text: k('opt2', { n }), why: k('why2') },
            { text: k('opt1', { n }), correct: true },
            { text: k('opt3', { n }), why: k('why3') },
          ]}
          formal={(
            <div className="space-y-2">
              <DivisorSet title={t('manipulation.divisorsOf', { n })} values={L.allDivisors(lab)} highlight={new Set(L.allDivisors(lab))} ariaLabel={t('manipulation.divisorsOf', { n })} />
              <EquationDisplay tex={`d \\times d \\leq ${n}`} tone="result" note={k('testUpTo', { n, bound })} />
            </div>
          )}
        />
      )}
      explanation={k('explanation')}
    >
      <ManipulationStage className="bg-gradient-to-b from-amber-50/50 to-white" data-dragging={stretch.dragging ? 'true' : undefined}>
        <div ref={boxRef} className="relative space-y-3" data-factor-rectangle>
          {party.node}
          {!(gameScreen && cp.open) && cp.node}
          {gameScreen && pred && pred.d === d && lab.tested.some((x) => x.d === d) && !cp.open && (
            <p role="status" data-fp-predict-result={pred.ok ? 'ok' : 'wrong'}
              className={`rounded-2xl px-4 py-2 text-center text-lg font-black ${pred.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
              {pred.ok ? k('cp.predict.right') : k('cp.predict.wrong')}
            </p>
          )}
          {showStepper && <LabStepper count={stepCount} current={ready && stepCount > 1 ? 1 : 0} done={stepDone.slice(0, stepCount)} stepAttr="data-fp-step" />}
          {gameScreen && nChoices?.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5" data-fp-n-choices>
              <span className="text-xs font-bold text-slate-700">{k('booksLabel')}</span>
              <div dir="ltr" className="flex flex-wrap gap-1.5" role="group" aria-label={k('booksLabel')}>
                {nChoices.map((v) => (
                  <NumberTile key={v} value={v} size="sm" data-fp-n={v} onClick={() => state.setNumbers({ ...state.numbers, n: v })}
                    label={k('makeBooks', { n: v })} tone={v === n ? 'common' : 'neutral'} />
                ))}
              </div>
            </div>
          )}
          <div className={`space-y-3 ${locked ? 'pointer-events-none opacity-60' : ''}`} aria-disabled={locked || undefined} data-fp-controls={locked ? 'locked' : 'open'}>
          {/* ── LA RÉGLETTE : le nombre de livres par rangée, tenu au doigt ── */}
          <div {...stretch.trackProps} className="relative" style={{ ...stretch.trackProps.style, height: 66 }} data-width-ruler>
            <svg width={width} height={66} className="absolute inset-0" aria-hidden="true" focusable="false">
              <rect x={xOf(range.max) - 4} y={30} width={range.max * mu + 8} height={5} rx={2} fill="#B45309" />
              <rect x={x0} y={10} width={5} height={26} rx={1} fill="#92400E" />
              {d != null && Array.from({ length: d }, (_, j) => (
                <rect key={j} x={x0 - (j + 1) * mu + 1} y={12} width={Math.max(2, mu - 2)} height={18} rx={2} fill={color(j)} />
              ))}
              {Array.from({ length: range.max }, (_, i) => i + 1).map((v) => (
                <g key={v}>
                  <line x1={xOf(v)} x2={xOf(v)} y1={37} y2={v % 5 === 0 ? 45 : 41} stroke="#94A3B8" />
                  {v % labelStep === 0 && <text x={xOf(v)} y={58} textAnchor="middle" fontSize={11} fill="#475569" fontFamily="ui-monospace, monospace">{v}</text>}
                </g>
              ))}
            </svg>
            <div
              {...stretch.handleProps({ label: k('handle'), valueText: d == null ? k('notSet') : k('valueText', { d }) })}
              className={`absolute top-1 flex h-11 w-11 -translate-x-1/2 items-start justify-center rounded-xl border-2 outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${stretch.dragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-400 bg-white/60'}`}
              style={{ left: xOf(d ?? range.min), cursor: stretch.dragging ? 'grabbing' : 'grab' }}
            >
              <span dir="ltr" className="-mt-3 rounded-full bg-slate-800 px-2 font-mono text-sm font-extrabold text-white" data-row-length>{d ?? '?'}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {range.max > 20 && (
              <button type="button" onClick={() => stretch.nudge(-5)} aria-label={k('shorter5')} disabled={d != null && d <= range.min}
                className="inline-flex h-11 min-w-[2.75rem] items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-2 text-sm font-extrabold disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" dir="ltr">−5</button>
            )}
            <button type="button" onClick={() => stretch.nudge(-1)} aria-label={k('shorter')} data-fp-nudge="-1" disabled={d != null && d <= range.min}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Minus className="h-5 w-5" aria-hidden="true" /></button>
            <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
              <input type="text" inputMode="numeric" dir="ltr" data-row-input aria-label={k('typeRow', { min: range.min, max: range.max })}
                value={typing ? typed : (d ?? '')} placeholder="?"
                onFocus={(e) => { setTyped(d == null ? '' : String(d)); setTyping(true); e.target.select(); }}
                onChange={(e) => setTyped(e.target.value.replace(/[^0-9٠-٩]/g, ''))}
                onBlur={submitTyped}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                className="w-20 rounded-xl border-2 border-slate-300 bg-white px-2 py-2 text-center font-mono text-lg font-extrabold tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
              <span>{k('perRow')}</span>
            </label>
            <button type="button" onClick={() => stretch.nudge(1)} aria-label={k('longer')} data-fp-nudge="1" disabled={d != null && d >= range.max}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Plus className="h-5 w-5" aria-hidden="true" /></button>
            {range.max > 20 && (
              <button type="button" onClick={() => stretch.nudge(5)} aria-label={k('longer5')} disabled={d != null && d >= range.max}
                className="inline-flex h-11 min-w-[2.75rem] items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-2 text-sm font-extrabold disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" dir="ltr">+5</button>
            )}
          </div>
          </div>

          <div className={`grid gap-3 ${gameScreen ? 'grid-cols-[minmax(0,1fr)_17rem]' : 'grid-cols-[1fr_minmax(10rem,14rem)]'}`}>
            {/* ── LE CADRE CARRÉ : le rectangle de n livres, entier ── */}
            <div ref={frameRef} className="flex items-end justify-center rounded-2xl border-2 border-slate-200 bg-white p-2" style={{ minHeight: boxH + 16 }}>
              {R == null ? (
                <p className="max-w-[16rem] self-center text-center text-sm font-bold text-slate-500" data-fp-veil={veil ? 'true' : undefined}>{veil && pending === d ? k('veiled') : k('dropCols', { n })}</p>
              ) : (
                <svg width={boxW} height={boxH} viewBox={`0 0 ${boxW} ${boxH}`} role="img"
                  aria-label={R.rest ? `${n} = ${d} × ${R.rows} + ${R.rest}` : `${n} = ${d} × ${R.rows}`}
                  data-rectangle data-cols={d} data-rows={R.rows} data-rest={R.rest} data-turned={R.rest === 0 && d > R.rows ? 'true' : 'false'}>
                  {/* le carré de référence : là où le rectangle cesse d'être debout */}
                  <rect x={0.5} y={0.5} width={boxW - 1} height={boxH - 1} fill="none" stroke="#E2E8F0" strokeDasharray="3 4" />
                  {Array.from({ length: n }, (_, i) => {
                    const row = Math.floor(i / d);
                    const col = i % d;
                    const partial = row >= R.rows;
                    return (
                      <rect key={i} data-book={partial ? 'rest' : 'full'}
                        x={boxW - (col + 1) * R.cell + 0.6} y={boxH - R.height + row * R.cell + 0.6}
                        width={R.cell - 1.2} height={R.cell - 1.2} rx={Math.min(3, R.cell / 5)}
                        fill={partial ? '#FDE68A' : color(i)} stroke={partial ? '#D97706' : 'none'} strokeDasharray={partial ? '2 2' : undefined} />
                    );
                  })}
                </svg>
              )}
            </div>

            {/* ── lecteur : l'égalité de CET essai, le JOURNAL des essais, puis les paires en pastilles (jamais pendant les questions sur le premier essai) ── */}
            {gameScreen ? (
              <div className="min-w-0 space-y-2" data-fp-side>
                {live && !veil && !hideAnswers && (
                  <EquationDisplay tex={live.divides ? `${n} = ${d} \\times ${live.rows}` : `${n} = ${d} \\times ${live.rows} + ${live.rest}`} tone={live.divides ? (live.repeat ? 'muted' : 'ok') : 'result'} size="lg" />
                )}
                {hist.length > 0 && !hideAnswers && <WidthTrials n={n} hist={hist} k={k} />}
                {!hideAnswers && (
                  <div className="rounded-2xl border-2 border-slate-200 bg-white p-2" data-fp-pairs-card>
                    <div className="mb-1 text-xs font-bold text-slate-700">{k('pairsBoard')}</div>
                    <ul className="grid grid-cols-2 gap-1" dir="ltr" data-pairs>
                      {lab.pairs.length === 0 && <li className="col-span-2 text-xs text-slate-400">—</li>}
                      {lab.pairs.map((p) => (
                        <li key={p.key} data-pair={p.key} className="rounded-lg bg-emerald-50 px-2 py-0.5 text-center font-mono text-sm font-extrabold text-emerald-900">{p.small} × {p.big}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 min-w-[10rem]">
              <div className="mb-1.5 text-xs font-bold text-slate-700">{k('pairsBoard')}</div>
              <ul className="space-y-1" dir="ltr" data-pairs>
                {lab.pairs.length === 0 && <li className="text-xs text-slate-400">—</li>}
                {lab.pairs.map((p) => {
                  const isCurrent = live?.divides && Math.min(d, live.rows) === p.small;
                  return (
                    <li key={p.key} data-pair={p.key} className={`rounded-lg px-2 py-0.5 font-mono text-sm font-bold ${isCurrent ? (live.repeat ? 'bg-sky-100 text-sky-900 ring-2 ring-sky-300' : 'bg-emerald-100 text-emerald-900') : 'text-slate-800'}`}>
                      {p.small} × {p.big}
                    </li>
                  );
                })}
              </ul>
            </div>
            )}
          </div>
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}


/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

export const CHAINS = { first: ['rows', 'rest', 'verdict'], rule: ['pairsCount', 'turned', 'rule'] };
/** Lecteur (rollout 2026-11-08, même traitement que team-builder) : observer d'un toucher puis BÂTIR l'égalité ; ensuite le rectangle couché, puis la règle. */
export const CHAINS_PLAYER = { first: ['observe', 'build'], rule: ['turned', 'rule'] };

/** Les essais de l'élève dans l'ordre, au fil de la manche (lecteur) : les 3 derniers, chacun avec son sens ; le titre dit combien il y en a. */
const TRIALS_SHOWN = 3;
function WidthTrials({ n, hist, k }) {
  const rows = hist.slice(-TRIALS_SHOWN).map((d) => ({ d, e: Math.floor(n / d), r: n % d }));
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-indigo-100 bg-white" data-fp-trials>
      <p className="bg-indigo-50 px-2 py-1 text-sm font-black text-indigo-900">
        📋 {k('trials.title')}{hist.length > TRIALS_SHOWN && <span className="ms-2 text-xs font-bold text-indigo-500">{k('trials.lastOf', { n: TRIALS_SHOWN, total: hist.length })}</span>}
      </p>
      <table className="w-full text-center">
        <thead className="text-[11px] font-black text-slate-500">
          <tr><th className="px-1 py-0.5">{k('trials.perRow')}</th><th className="px-1 py-0.5">{k('trials.rows')}</th><th className="px-1 py-0.5">{k('trials.rest')}</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.d}:${i}`} data-fp-trial={r.d} data-exact={r.r === 0 ? 'true' : 'false'} className={`border-t border-indigo-50 text-base font-black ${r.r === 0 ? 'bg-emerald-50 text-emerald-800' : 'text-slate-800'}`}>
              <td className="px-1 py-0.5">{r.d}</td><td className="px-1 py-0.5">{r.e}</td><td className={`px-1 py-0.5 ${r.r === 0 ? '' : 'text-rose-600'}`}>{r.r}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const $ = (x) => `$${x}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;

export const QUESTIONS = {
  // « صفوف تامّة ▢ · كتب ناقصة ▢ » : ce que le RECTANGLE montre, d'un toucher (le rectangle reste visible à côté)
  observe: ({ n, first }, k) => {
    const d = first.d; const e = Math.floor(n / d); const r = n % d;
    const o = { n: $(n), d: $(d), rows: $(e), r: $(r) };
    return {
      id: 'observe', kind: 'fill', prompt: Cq(k, 'observe.prompt', o),
      fields: [
        { label: k('cp.observe.rows'), expected: e, options: chipsAround(e) },
        { label: k('cp.observe.rest'), expected: r, options: chipsAround(r) },
      ],
      hints: [Cq(k, 'observe.hint1'), Cq(k, 'observe.hint2')], explain: Cq(k, 'observe.explain', o),
    };
  },
  // l'égalité BÂTIE : chaque emplacement porte le sens de son nombre (n = d × e + r)
  build: ({ n, first }, k) => {
    const d = first.d; const e = Math.floor(n / d); const r = n % d;
    return {
      id: 'build', kind: 'build', prompt: Cq(k, 'build.prompt'),
      slots: [k('cp.build.slotN'), k('cp.build.slotD'), k('cp.build.slotE'), k('cp.build.slotR')],
      tiles: buildTiles({ n, g: d, q: e, r }), expected: [n, d, e, r],
      hints: [Cq(k, 'build.hint1'), Cq(k, 'build.hint2')],
      explain: (
        <div className="space-y-2">
          <RolesEquation n={n} g={d} q={e} r={r} labels={{ n: k('roles.n'), g: k('roles.d'), q: k('roles.e'), r: k('roles.r') }} />
          <p>{k('cp.build.explainRoles')}</p>
        </div>
      ),
    };
  },
  rows: ({ n, first }, k) => {
    const d = first.d; const rows = Math.floor(n / d); const r = n % d;
    const o = { n: $(n), d: $(d), rows: $(rows), eq: $(r ? `${n} = ${d} \\times ${rows} + ${r}` : `${n} = ${d} \\times ${rows}`) };
    return { id: 'rows', kind: 'number', expected: String(rows), answer: <MathText>{$(rows)}</MathText>, prompt: Cq(k, 'rows.prompt', o), hints: [Cq(k, 'rows.hint1'), Cq(k, 'rows.hint2', o)], explain: Cq(k, 'rows.explain', o) };
  },
  rest: ({ n, first }, k) => {
    const d = first.d; const r = n % d;
    const o = { n: $(n), d: $(d), r: $(r), eq: $(`${n} = ${d} \\times ${Math.floor(n / d)} + ${r}`) };
    return { id: 'rest', kind: 'number', expected: String(r), answer: <MathText>{$(r)}</MathText>, prompt: Cq(k, 'rest.prompt', o), hints: [Cq(k, 'rest.hint1'), Cq(k, 'rest.hint2')], explain: Cq(k, 'rest.explain', o) };
  },
  verdict: ({ n, first }, k) => {
    const d = first.d; const r = n % d; const yes = r === 0;
    const o = { n: $(n), d: $(d), r: $(r), e: $(Math.floor(n / d)) };
    return {
      id: 'verdict', kind: 'choice', cols: 1, prompt: Cq(k, 'verdict.prompt', o),
      options: [
        { text: Cq(k, 'verdict.yes'), correct: yes, why: yes ? undefined : Cq(k, 'verdict.whyYes', o) },
        { text: Cq(k, 'verdict.no'), correct: !yes, why: yes ? Cq(k, 'verdict.whyNo', o) : undefined },
        { text: Cq(k, 'verdict.wait'), why: Cq(k, 'verdict.whyWait', o) },
      ],
      hints: [Cq(k, 'verdict.hint1'), Cq(k, 'verdict.hint2')], explain: Cq(k, yes ? 'verdict.explainYes' : 'verdict.explainNo', o),
    };
  },
  pairsCount: ({ lab }, k) => {
    const c = lab.pairs.length;
    const o = { c: $(c), list: $(lab.pairs.map((p) => `${p.small}\\times${p.big}`).join('\\ ;\\ ')) };
    return { id: 'pairsCount', kind: 'number', expected: String(c), answer: <MathText>{$(c)}</MathText>, prompt: Cq(k, 'pairsCount.prompt'), hints: [Cq(k, 'pairsCount.hint1'), Cq(k, 'pairsCount.hint2')], explain: Cq(k, 'pairsCount.explain', o) };
  },
  turned: ({ n, lab }, k) => {
    const t = lab.tested.find((x) => x.beyondBound && x.repeat);
    const d = t.d; const e = n / d;
    const o = { d: $(d), e: $(e), n: $(n), pair: $(`${e}\\times${d}`) };
    return {
      id: 'turned', kind: 'choice', cols: 1, prompt: Cq(k, 'turned.prompt', o),
      options: [
        { text: Cq(k, 'turned.new', o), why: Cq(k, 'turned.whyNew', o) },
        { text: Cq(k, 'turned.same', o), correct: true },
        { text: Cq(k, 'turned.none', o), why: Cq(k, 'turned.whyNone', o) },
      ],
      hints: [Cq(k, 'turned.hint1', o), Cq(k, 'turned.hint2', o)], explain: Cq(k, 'turned.explain', o),
    };
  },
  rule: ({ n }, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k('discoverPrompt')}</MathText>,
    options: [
      { text: <MathText>{k('opt2', { n })}</MathText>, why: <MathText>{k('why2')}</MathText> },
      { text: <MathText>{k('opt1', { n })}</MathText>, correct: true },
      { text: <MathText>{k('opt3', { n })}</MathText>, why: <MathText>{k('why3')}</MathText> },
    ],
    hints: [Cq(k, 'rule.hint1'), Cq(k, 'rule.hint2')],
    explain: <MathText>{k('testUpTo', { n, bound: divisionTestBound(n) })}</MathText>,
  }),
};
