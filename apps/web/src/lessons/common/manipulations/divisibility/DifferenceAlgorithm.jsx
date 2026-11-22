import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as divisibility from '@smarter-academy/core/arithmetic/divisibility.js';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useDragInteraction from '../useDragInteraction';
import DropZone from '../primitives/DropZone';
import NumberTile from '../primitives/NumberTile';
import DragGhost from '../primitives/DragGhost';
import RibbonStrip from '../primitives/RibbonStrip';
import DraggableObject from '../primitives/DraggableObject';
import EquationDisplay from '../primitives/EquationDisplay';
import MathText from '../../components/MathText';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { ordered } from './cpOrder';
import * as L from '../logic/algorithms';
import PredictTray from '../primitives/PredictTray';
import { useLabCoach } from '../primitives/LabCoach';
import { useInMissionPlayer } from '../../mission/missionPlayerContext';
import { chipsAround } from './divisionChecks';

/** Lecteur : une prédiction au début des PRED_MAX premières coupes de la manche. */
const PRED_MAX = 2;

const NS = 'manipulation.diff';

const { differenceStepTex, pgcdEqualityTex } = divisibility;

/**
 * pgcd-differences — LA MACHINE À SOUSTRAIRE.
 *
 * A. L'élève PORTE le petit RUBAN sur le grand : les ciseaux y coupent sa
 *    longueur. (Le contraire est refusé, avec la raison : « نطرح دائمًا
 *    الأصغر من الأكبر ».) Atelier de couture, thème `workshop`.
 * B. Idée : PGCD(a ; b) = PGCD(b ; a − b) — la plus grande longueur qui
 *    mesure deux rubans mesure aussi ce qui reste après la coupe.
 * C. Les deux rubans sont à la même échelle (RibbonStrip) : la part commune
 *    se coupe sous les yeux, la différence reste.
 * D. Émerge : la ligne « 252 − 140 = 112 » et, à côté, l'invariant qui ne
 *    change pas d'un maillon à l'autre.
 * QUESTIONS PENDANT LE LABO (2026-10-28, `primitives/LabCheckpoint`, déploiement du prototype) : deux ÉTAPES (`LabStepper`, `[data-da-step]`) — « القصّ » (la
 * chaîne est finie : combien de coupes, qu'est-ce qui ne change pas) puis « PGCD » (le dernier fruit non nul est posé : pourquoi s'arrêter, puis la RÈGLE, qui
 * remplace la découverte automatique et formalise dans `onDone`). Obligatoires pour tout élève ; l'enseignant seul les coupe pour SON compte
 * (`useLabCheckpointSettings`). « أعِد التجربة » remet l'étape (`CHAINS` / `QUESTIONS` ci-dessous, textes dans `diff.cp.*`). SON : `tooth` à chaque coupe,
 * `bell` quand le dernier fruit est nul, `flag` quand le PGCD est posé, `over` pour un geste refusé.
 * E. À découvrir : la chaîne s'arrête au fruit nul, et le PGCD est le
 *    DERNIER FRUIT NON NUL — l'élève le porte lui-même dans la case PGCD.
 *    La case refuse les autres fruits PAR LA DIVISIBILITÉ (« 56 لا يقسم
 *    252 »), jamais en énonçant la règle ; les fruits y sont proposés rangés
 *    par taille, pas dans l'ordre de la chaîne (2026-09-30).
 *
 * LECTEUR DE MISSION (rollout 2026-11-08, traitement v2) : joué en MANCHES (LabRounds). `onVerdict` remonte le PGCD posé ({ groups: v, exact })
 * — une case refusée compte comme un essai raté ; `levels={false}` ; `predict` : au DÉBUT d'une coupe (les PRED_MAX premières), « كم سيبقى من
 * الشريط الأكبر؟ » (`PredictTray`, trois longueurs) ; `chains` (`['cuts', 'pgcd']`) ; `CHAINS_PLAYER` = cuts : compter d'un toucher (`fill`) →
 * BÂTIR « grand = petit + reste » (`build`, ops `=` `+`) → l'invariant ; pgcd : pourquoi s'arrêter → la règle ; la chaîne des coupes est le
 * JOURNAL « 📋 جدول تجاربك » dans la colonne du labo ; `handDone` ouvre « أكمل الفروق » ; `choices` : des paires (a, b) à toucher. Contrôles
 * figés pendant une prédiction ou une question ; toujours guidé ; pas de fête quand l'étape est cachée.
 */
export default function DifferenceAlgorithm({
  a: a0, b: b0, title, lead, mission, initialMode = 'student', allowModeSwitch = false, answerHiddenByDefault = false, showStepCount = true, onFinished, onTrial, checkpoints: cpOn = true, coach: coachOn = true,
  // ── LECTEUR DE MISSION (rollout 2026-11-08, traitement v2) ──
  onVerdict, levels: withLevels = true, handDone = false, chains: chainsOn = ['cuts', 'pgcd'], predict: predictOn = true, choices,
}) {
  const { t } = useTranslation('lesson');
  const gameScreen = useInMissionPlayer();
  const state = useManipulation({ type: 'pgcd-differences', initialNumbers: { a: a0, b: b0 }, initialMode, hintCount: 3, answerHiddenByDefault, withLevels: withLevels !== false });
  const { a, b } = state.numbers;
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const [lab, setLab] = useState(() => L.initDifferences({ a: a0, b: b0 }));
  const [reject, setReject] = useState(null);

  // « إعادة », d'autres nombres ou un autre niveau : TOUT recommence — la chaîne, les questions du labo, la fête
  const sceneKey = `${a}|${b}|${state.epoch}|${state.resetCount}`;
  const [scene, setScene] = useState(sceneKey);
  // lecteur : les coupes déjà prédites (index), la dernière prédiction jugée
  const [predDone, setPredDone] = useState([]);
  const [pred, setPred] = useState(null);
  const [missionBig, setMissionBig] = useState(false);
  if (scene !== sceneKey) { setScene(sceneKey); setLab(L.initDifferences({ a, b })); setReject(null); setPredDone([]); setPred(null); }
  const [answered, setAnswered] = useState({ key: sceneKey, ids: [] });
  const answeredIds = answered.key === sceneKey ? answered.ids : [];

  // les questions pendant le labo : obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpSettings = useLabCheckpointSettings('pgcd-differences');
  const ruleByCheckpoint = cpOn && cpSettings.enabled;
  const reachedOf = { cuts: L.isDifferencesFinished(lab), pgcd: lab.pgcdPlaced };
  const pending = ruleByCheckpoint ? STEPS.find((id) => chainsOn.includes(id) && !answeredIds.includes(id)) : null;
  // lecteur : compter d'un toucher puis BÂTIR la première coupe ; la page garde ses suites
  const chain = pending && reachedOf[pending] ? (gameScreen ? CHAINS_PLAYER : CHAINS)[pending] : null;
  const cp = useLabCheckpoint({
    id: chain ? pending : null,
    questions: chain ? chain.map((q) => QUESTIONS[q]({ a, b, lab }, k)) : null,
    reached: true,
    resetKey: sceneKey,
    onRetry: () => setLab((s) => (pending === 'cuts' ? L.initDifferences({ a, b }) : { ...s, pgcdPlaced: false })),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setAnswered((x) => ({ key: sceneKey, ids: [...(x.key === sceneKey ? x.ids : []), id] }));
      if (id === 'pgcd') { state.discover(); state.formalize(); }
    },
  });
  const stepDone = STEPS.map((id) => reachedOf[id] && (!ruleByCheckpoint || !chainsOn.includes(id) || answeredIds.includes(id)));
  // lecteur : une manche sans questions (défi, terrain libre) ne montre pas d'étapes, et ne fête rien
  const showStepper = !(gameScreen && (!ruleByCheckpoint || chainsOn.length === 0));
  const party = useStepCelebration();
  const celebrated = useRef({ key: sceneKey, set: new Set() });
  if (celebrated.current.key !== sceneKey) celebrated.current = { key: sceneKey, set: new Set() };
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.set.has(i)) return;
      celebrated.current.set.add(i);
      if (showStepper) party.celebrate({ n: i + 1, total: STEPS.length });
    });
  }, [stepDone.join()]); // eslint-disable-line react-hooks/exhaustive-deps

  // le son : un pas par coupe (plus grave en arrière), la cloche au fruit nul, le drapeau au PGCD posé
  const heard = useRef({ done: 0, placed: false, at: 0 });
  useEffect(() => {
    const h = heard.current;
    if (lab.done !== h.done) {
      const now = Date.now();
      if (now - h.at > 35) { playSfx('tooth', { pitch: lab.done > h.done ? 1 : 0.75 }); h.at = now; }
      if (lab.done > h.done && L.isDifferencesFinished(lab)) playSfx('bell');
      h.done = lab.done;
    }
    if (lab.pgcdPlaced && !h.placed) playSfx('flag');
    h.placed = lab.pgcdPlaced;
  }, [lab.done, lab.pgcdPlaced]); // eslint-disable-line react-hooks/exhaustive-deps

  const drag = useDragInteraction({
    onDrop: (sourceId, zoneId) => {
      setReject(null);
      if (zoneId === 'big' && sourceId === 'num:small') { setLab(L.subtract); return; }
      if (zoneId === 'pgcd') {
        const v = Number(sourceId.replace('diff:', ''));
        setLab((s) => ({ ...s, pgcdPlaced: v === s.gcd }));
        state.report(onVerdict, { a, b, groups: v, exact: v === lab.gcd });
        if (!ruleByCheckpoint && !gameScreen) state.discover();
      }
    },
    accepts: (sourceId, zoneId) => {
      if (lockedRef.current) return '';
      if (zoneId === 'big') return L.canSubtract(lab, sourceId.replace('num:', ''), 'big');
      if (zoneId === 'pgcd') return L.canPlaceDifferencePgcd(lab, Number(sourceId.replace('diff:', '')));
      return 'invalid';
    },
    onReject: (sourceId, zoneId, reason) => {
      if (!reason) return;
      playSfx('over');
      const v = Number(String(sourceId).replace('diff:', ''));
      // une case PGCD refusée est un essai raté de la manche
      if (zoneId === 'pgcd') state.report(onVerdict, { a, b, groups: v, exact: false });
      setReject({ reason, v });
    },
  });

  useEffect(() => { if (state.isFormal) state.report(onFinished, lab.gcd); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  // La contrainte de la configuration — une seule définition, lue par le
  // laboratoire libre / le mode classe ET par « أكمل الفروق ».
  // a = b : la seule différence est 0, le PGCD n'est jamais une tuile.
  const validateNumbers = (x) => (
    x.a === x.b ? t('manipulation.diff.equalNumbers')
      : divisibility.differenceSteps(x.a, x.b).steps.length > 30 ? t('manipulation.diff.tooManySteps') : '');

  const pair = L.currentPair(lab);
  const finished = L.isDifferencesFinished(lab);
  const shown = lab.steps.slice(0, lab.done);
  const scale = Math.max(a, b);
  const nonZero = [...new Set(shown.filter((s) => s.diff !== 0).map((s) => s.diff))];
  // lecteur : au DÉBUT d'une coupe (les PRED_MAX premières), prédire ce qui restera du grand ruban
  const step = lab.steps[lab.done];
  const predictOpen = gameScreen && predictOn && ruleByCheckpoint && !missionBig && !cp.open && !finished && !!step
    && predDone.length < PRED_MAX && !predDone.includes(lab.done);
  const locked = gameScreen && (cp.open || predictOpen);
  const lockedRef = useRef(false);
  lockedRef.current = locked;
  const predOptions = step ? [...new Set([step.diff, step.small, step.big, step.big + step.small])].slice(0, 3).sort((x, y) => x - y) : [];
  const sayPredict = (says) => {
    const ok = Number(says) === step.diff;
    playSfx(ok ? 'correct' : 'pop');
    setPred({ at: lab.done, ok });
    state.report(onTrial, { tk: 'predict', ok });
    setPredDone((d) => [...d, lab.done]);
  };
  const trayNode = !gameScreen ? null : predictOpen ? (
    <PredictTray attr="da" title={k('cp.predict.title')} prompt={k('cp.predict.prompt', { big: step.big, small: step.small })}
      options={predOptions.map((v) => ({ says: String(v), text: k('cp.predict.option', { v }) }))} onSay={sayPredict} />
  ) : cp.open ? cp.node : null;
  // le GUIDE (LabCoach, 2026-11-09) : le geste du moment, jamais le résultat
  const coachStep = coachOn && !locked ? L.differencesCoachOf(lab) : null;
  const coach = useLabCoach({ lab: 'pgcd-differences', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '', labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') } });
  const heldLabel = drag.held === 'num:small' ? pair.small : drag.held?.startsWith('diff:') ? Number(drag.held.replace('diff:', '')) : null;

  return (
    <ManipulationShell
      type="pgcd-differences"
      title={title ?? t('manipulation.diff.title', { a, b })}
      mission={mission ?? t(gameScreen && handDone ? 'manipulation.diff.missionButton' : 'manipulation.diff.ribbonMission', { a, b })}
      lead={lead}
      state={state}
      numberFields={[{ key: 'a', label: 'a' }, { key: 'b', label: 'b' }]}
      validate={validateNumbers}
      allowModeSwitch={allowModeSwitch}
      headerAction={cpOn ? cpSettings.control : null}
      coach={coachOn ? coach : null}
      // lecteur : l'écran de jeu est toujours GUIDÉ (les manches et les questions guident)
      guided={!!chain || ruleByCheckpoint || gameScreen}
      hideRepresentation={gameScreen || undefined}
      onIntroChange={setMissionBig}
      sidePanel={trayNode ? <div data-da-tray>{trayNode}</div> : null}
      allowFreeLab={gameScreen ? false : undefined}
      hints={[t('manipulation.diff.hint1'), t('manipulation.diff.hint2'), t('manipulation.diff.hint3')]}
      controller={{
        autoStep: () => { if (L.isDifferencesFinished(lab)) return false; setLab(L.subtract); return true; },
        canAutoStep: () => !L.isDifferencesFinished(lab),
        prevStep: () => setLab(L.undoSubtract),
        canPrev: () => lab.done > 0,
        showSolution: () => { setLab((s) => ({ ...s, done: s.steps.length, pgcdPlaced: true })); state.discover(); state.formalize(); },
        // « أكمل الفروق » (§6bis) : après UNE coupe faite à la main, les
        // suivantes ne sont plus que le même geste. La case PGCD reste vide :
        // reconnaître le dernier fruit non nul est la découverte.
        // lecteur : « أكمل الفروق » est le BOUTON du geste appris — il s'ouvre après la manche à la main (handDone)
        autoComplete: gameScreen && !handDone ? undefined : {
          label: t('manipulation.diff.autoComplete'),
          ready: lab.a === a && lab.b === b && !validateNumbers({ a, b }),
          manualDone: lab.done > 0,
          remaining: L.remainingDifferences(lab),
          step: () => setLab(L.subtract),
          finish: () => setLab(L.completeDifferences),
        },
      }}
      controlsOverride={{ prevStep: true }}
      representation={shown.length > 0 && (
        <ol className="space-y-1.5" data-difference-chain>
          {shown.map((s, i) => {
            const isLast = i === lab.steps.length - 1;
            const nextBig = Math.max(s.small, s.diff); const nextSmall = Math.min(s.small, s.diff);
            return (
              <li key={i} className="grid gap-2 grid-cols-2">
                <EquationDisplay tex={differenceStepTex(s)} tone={s.diff === 0 ? 'result' : i === shown.length - 1 ? 'active' : 'neutral'} size="sm" />
                {/* La dernière ligne ne dit le PGCD qu'une fois que l'élève l'a posé
                    dans sa case : sinon la chaîne donne la réponse avant le geste
                    (« أكمل الفروق » y mène en un clic). Audit du 2026-09-29. */}
                <EquationDisplay tex={isLast ? `\\mathrm{PGCD}(${a}\\ ;\\ ${b}) = ${lab.pgcdPlaced ? lab.gcd : '\\,?'}` : pgcdEqualityTex(s.big, s.small, nextBig, nextSmall)} tone="muted" size="sm" />
              </li>
            );
          })}
        </ol>
      )}
      discovery={(
        <ManipulationDiscovery
          state={state}
          prompt={t('manipulation.diff.discoverPrompt')}
          options={[
            { text: t('manipulation.diff.opt1'), correct: true },
            { text: t('manipulation.diff.opt2'), why: t('manipulation.diff.why2', { first: lab.steps[0]?.diff }) },
            { text: t('manipulation.diff.opt3'), why: t('manipulation.diff.why3') },
          ]}
          formal={(
            <div className="space-y-2">
              <EquationDisplay tex={`\\mathrm{PGCD}(${a}\\ ;\\ ${b}) = ${lab.gcd}`} tone="result" size="lg" note={t('manipulation.lastNonZeroDiff')} />
              {showStepCount && <p className="font-mono text-xs text-slate-600" dir="auto">{t('manipulation.diff.steps', { count: lab.steps.length })}</p>}
            </div>
          )}
        />
      )}
      explanation={t('manipulation.diff.explanation')}
    >
      <div className="relative min-h-[460px]" data-da-glance>
      {party.node}
      {!(gameScreen && cp.open) && cp.node}
      <ManipulationStage dragging={drag.dragging}>
        <div className={gameScreen ? 'grid grid-cols-[minmax(0,1fr)_15rem] gap-3' : ''}>
        <div className="min-w-0 space-y-3">
          {showStepper && <LabStepper count={STEPS.length} current={Math.max(0, stepDone.indexOf(false))} done={stepDone} stepAttr="data-da-step" />}
          {gameScreen && choices?.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5" data-da-choices>
              <span className="text-sm font-bold text-slate-600">{k('choicesLabel')}</span>
              {choices.map((c) => (
                <button key={`${c.a}-${c.b}`} type="button" data-da-choice={`${c.a}-${c.b}`} disabled={locked} onClick={() => state.setNumbers({ a: c.a, b: c.b })}
                  className={`min-h-[44px] rounded-xl border-2 px-3 text-base font-black ${c.a === a && c.b === b ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'}`}>
                  <bdi dir="ltr">{c.a} · {c.b}</bdi>
                </button>
              ))}
            </div>
          )}
          {gameScreen && pred && pred.at === lab.done - 1 && !cp.open && (
            <p role="status" data-da-predict-result={pred.ok ? 'ok' : 'wrong'}
              className={`rounded-2xl px-4 py-2 text-center text-lg font-black ${pred.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
              {pred.ok ? k('cp.predict.right') : k('cp.predict.wrong')}
            </p>
          )}
          <p className="text-xs text-slate-500">{t('manipulation.dragHint')}</p>

          <div className="space-y-2" data-ribbons>
            {/* LE PETIT RUBAN : c'est LUI qu'on porte sur le grand. */}
            <div className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-xs font-bold text-slate-600">{t('manipulation.diff.ribbonSmall')}</span>
              {!finished ? (
                <DraggableObject drag={drag} id="num:small" label={`${t('manipulation.diff.ribbonSmall')} ${pair.small}`} className="flex min-h-[44px] flex-1 items-center gap-2 rounded-xl border-2 border-violet-300 bg-violet-50 px-2 py-1">
                  <NumberTile value={pair.small} tone="divisor" size="sm" />
                  <RibbonStrip value={pair.small} scale={scale} tone="b" height="h-6" className="flex-1" />
                </DraggableObject>
              ) : (
                <div className="flex min-h-[44px] flex-1 items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-2 py-1">
                  <NumberTile value={pair.small} tone="dim" size="sm" />
                  <RibbonStrip value={pair.small} scale={scale} tone="ghost" height="h-6" className="flex-1" />
                </div>
              )}
            </div>

            {/* LE GRAND RUBAN : la zone qui reçoit le petit. Il est ENTIER
                avant le geste — jusqu'au 2026-09-30 il était déjà découpé et
                chiffré (« 140 | 112 ») : la soustraction se lisait avant
                d'être faite. Pendant qu'on porte le petit, seul son CONTOUR
                se pose dessus, sans nombre ; la différence s'écrit après la
                coupe, dans la chaîne. */}
            <DropZone drag={drag} id="big" label={t('manipulation.diff.ribbonBig')} disabled={finished} minHeight="min-h-[72px]" className="flex items-center gap-2 p-2">
              <span className="w-16 shrink-0 text-xs font-bold text-slate-600">{t('manipulation.diff.ribbonBig')}</span>
              <NumberTile value={pair.big} tone="dividend" size="sm" />
              <RibbonStrip value={pair.big} scale={scale} tone="a" className="flex-1" cut={drag.held === 'num:small' && !finished && pair.big > pair.small}
                segments={drag.held === 'num:small' && pair.small <= pair.big && pair.big > 0 ? [
                  { value: pair.small, tone: 'ghost' },
                  ...(pair.big - pair.small > 0 ? [{ value: pair.big - pair.small, tone: 'a' }] : []),
                ] : undefined} />
              {!finished && !drag.held && <span className="text-[11px] text-slate-400 inline">{t('manipulation.diff.dropOnBig')}</span>}
            </DropZone>
            {finished && <p className="text-xs font-bold text-emerald-800">{t('manipulation.diff.nothingLeft', { v: lab.gcd })}</p>}
          </div>

          {finished && (
            <div className="grid gap-2 grid-cols-[1fr_auto]">
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
                <div className="mb-1 text-[11px] font-bold text-slate-700">{t('manipulation.diff.piecesTitle')}</div>
                {/* Les fruits dans l'ordre de grandeur, pas dans celui de la
                    chaîne : « le dernier » ne se lit pas à sa place. */}
                <div dir="ltr" className="flex flex-wrap gap-1.5">
                  {[...nonZero].sort((x, y) => y - x).map((v) => <NumberTile key={v} value={v} drag={drag} id={`diff:${v}`} label={`${v}`} tone="quotient" size="sm" />)}
                  <NumberTile value={0} tone="dim" size="sm" />
                </div>
              </div>
              <DropZone drag={drag} id="pgcd" label={t('manipulation.diff.pgcdZone')} tone="amber" hint={!lab.pgcdPlaced ? t('manipulation.diff.dropPgcd') : undefined} minHeight="min-h-[72px]" className="flex flex-col items-center justify-center px-4">
                <div className="text-[11px] font-mono font-bold text-amber-800">PGCD</div>
                {lab.pgcdPlaced && <NumberTile value={lab.gcd} tone="pgcd" size="lg" />}
              </DropZone>
            </div>
          )}

          {reject && <p role="status" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{t(`manipulation.diff.reject.${reject.reason}`, { v: reject.v, a, b })}</p>}
        </div>
        {/* lecteur : la chaîne des coupes est le JOURNAL, dans la colonne du labo */}
        {gameScreen && (
          <div className="min-w-0" data-da-side>
            {shown.length > 0 && (
              <div className="overflow-hidden rounded-2xl border-2 border-indigo-100 bg-white" data-da-trials>
                <p className="bg-indigo-50 px-2 py-1 text-sm font-black text-indigo-900">📋 {k('trials.title')}
                  {shown.length > TRIALS_SHOWN && <span className="block text-xs font-bold text-indigo-500">{k('trials.lastOf', { n: TRIALS_SHOWN, total: shown.length })}</span>}</p>
                <ol className="space-y-1 p-1.5">
                  {shown.slice(-TRIALS_SHOWN).map((x, i) => (
                    <li key={`${x.big}-${i}`} data-da-trial={x.diff}><EquationDisplay tex={differenceStepTex(x)} tone={x.diff === 0 ? 'result' : 'neutral'} size="sm" /></li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
        </div>
      </ManipulationStage>
      </div>
      <DragGhost ghost={drag.ghost}>{heldLabel !== null && <NumberTile value={heldLabel} tone="divisor" />}</DragGhost>
    </ManipulationShell>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** Les deux étapes : la chaîne de coupes finie, puis le PGCD posé. */
const STEPS = Object.freeze(['cuts', 'pgcd']);
/** La suite de questions de chaque étape : elle interroge ce que l'élève vient de FAIRE ; la dernière finit par la RÈGLE. */
export const CHAINS = Object.freeze({
  cuts: ['count', 'invariant'],
  pgcd: ['stop', 'rule'],
});
/** Lecteur (rollout 2026-11-08, traitement v2) : compter d'un toucher → BÂTIR la première coupe → l'invariant ; puis pourquoi s'arrêter → la règle. */
export const CHAINS_PLAYER = Object.freeze({
  cuts: ['countFill', 'build', 'invariant'],
  pgcd: ['stop', 'rule'],
});
/** Le journal du lecteur montre les TRIALS_SHOWN dernières coupes. */
const TRIALS_SHOWN = 6;

const $ = (x) => `$${x}$`;
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const lineOf = (s) => `${s.big} - ${s.small} = ${s.diff}`;

/** Chaque question est construite sur LES nombres de l'élève (rien n'est écrit en dur) ; `k` : les textes de `diff`. */
const BUILD = {
  // combien de coupes, d'un toucher (le journal est à côté)
  countFill: ({ a, b, lab }, k) => {
    const n = lab.steps.length;
    const last = lab.steps[n - 1];
    return {
      id: 'countFill', kind: 'fill', prompt: Mx(k, 'count.prompt', { a, b }),
      fields: [{ label: k('cp.count.field'), expected: n, options: chipsAround(n, { min: 1 }) }],
      hints: [Mx(k, 'count.hint1'), Mx(k, 'count.hint2', { first: $(lineOf(lab.steps[0])), last: $(lineOf(last)) })],
      explain: Mx(k, 'count.explain', { n, last: $(lineOf(last)) }),
    };
  },
  // la PREMIÈRE coupe bâtie : le grand ruban = le petit + ce qui reste (une tuile de trop : la somme)
  build: ({ lab }, k) => {
    const s0 = lab.steps[0];
    const o = { big: s0.big, small: s0.small, diff: s0.diff, eq: $(`${s0.big} = ${s0.small} + ${s0.diff}`) };
    return {
      id: 'build', kind: 'build', ops: ['=', '+'], prompt: Mx(k, 'build.prompt', o),
      slots: [k('cp.build.slotBig'), k('cp.build.slotSmall'), k('cp.build.slotDiff')],
      tiles: [s0.diff, s0.big, s0.big + s0.small, s0.small], expected: [s0.big, s0.small, s0.diff],
      hints: [Mx(k, 'build.hint1'), Mx(k, 'build.hint2', o)], explain: Mx(k, 'build.explain', o),
    };
  },
  count: ({ a, b, lab }, k) => {
    const n = lab.steps.length;
    const last = lab.steps[n - 1];
    return {
      id: 'count', kind: 'number', expected: String(n), answer: <MathText>{$(n)}</MathText>,
      prompt: Mx(k, 'count.prompt', { a, b }),
      hints: [Mx(k, 'count.hint1'), Mx(k, 'count.hint2', { first: $(lineOf(lab.steps[0])), last: $(lineOf(last)) })],
      explain: Mx(k, 'count.explain', { n, last: $(lineOf(last)) }),
    };
  },
  invariant: ({ a, b, lab }, k) => {
    const [s0, s1] = lab.steps;
    const o = { a, b, big0: s0.big, big1: s1.big, d0: s0.diff, dLast: lab.steps[lab.steps.length - 1].diff };
    return {
      id: 'invariant', kind: 'choice',
      prompt: Mx(k, 'invariant.prompt'),
      options: [
        { text: Mx(k, 'invariant.big'), why: Mx(k, 'invariant.whyBig', o) },
        { text: Mx(k, 'invariant.pgcd'), correct: true },
        { text: Mx(k, 'invariant.diff'), why: Mx(k, 'invariant.whyDiff', o) },
      ],
      hints: [Mx(k, 'invariant.hint1'), Mx(k, 'invariant.hint2', { a, b, big1: s1.big, small1: s1.small })],
      explain: Mx(k, 'invariant.explain', { a, b, big1: s1.big, small1: s1.small }),
    };
  },
  stop: ({ a, b, lab }, k) => {
    const last = lab.steps[lab.steps.length - 1];
    const o = { a, b, g: lab.gcd, last: $(lineOf(last)) };
    return {
      id: 'stop', kind: 'choice',
      prompt: Mx(k, 'stop.prompt', o),
      options: [
        { text: Mx(k, 'stop.zero'), why: Mx(k, 'stop.whyZero', o) },
        { text: Mx(k, 'stop.equal', o), correct: true },
        { text: Mx(k, 'stop.small'), why: Mx(k, 'stop.whySmall', o) },
      ],
      hints: [Mx(k, 'stop.hint1', o), Mx(k, 'stop.hint2', o)],
      explain: Mx(k, 'stop.explain', o),
    };
  },
  rule: ({ a, b, lab }, k) => {
    // quand le PREMIER fruit est déjà le PGCD (21 et 14 : 7), « أوّل فرق » serait juste aussi : on le remplace par le grand nombre de départ
    const firstIsGcd = lab.steps[0].diff === lab.gcd;
    const big = Math.max(a, b); const small = Math.min(a, b);
    return {
      id: 'rule', kind: 'choice',
      prompt: <MathText>{k('discoverPrompt')}</MathText>,
      options: [
        { text: <MathText>{k('opt1')}</MathText>, correct: true },
        firstIsGcd
          ? { text: Mx(k, 'rule.optBig'), why: Mx(k, 'rule.whyBig', { big, small }) }
          : { text: <MathText>{k('opt2')}</MathText>, why: Mx(k, 'rule.whyFirst', { first: lab.steps[0].diff, a, b }) },
        { text: <MathText>{k('opt3')}</MathText>, why: <MathText>{k('why3')}</MathText> },
      ],
      hints: [Mx(k, 'rule.hint1'), Mx(k, 'rule.hint2', { g: lab.gcd })],
      explain: <MathText>{k('cp.rule.explain', { a, b, g: lab.gcd })}</MathText>,
    };
  },
};

export const QUESTIONS = ordered(BUILD);
