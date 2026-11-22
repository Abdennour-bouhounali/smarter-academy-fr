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
import QuantityBar from '../primitives/QuantityBar';
import RibbonStrip from '../primitives/RibbonStrip';
import DraggableObject from '../primitives/DraggableObject';
import EquationBuilder from '../primitives/EquationBuilder';
import EquationDisplay from '../primitives/EquationDisplay';
import { Btn } from '../ManipulationTeacherMode';
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
import { chipsAround, buildTiles } from './divisionChecks';

/** Lecteur : une prédiction au début des PRED_MAX premières divisions de la manche. */
const PRED_MAX = 2;

const NS = 'manipulation.euclid';

const { euclidStepTex, pgcdEqualityTex } = divisibility;

/**
 * euclidean-algorithm — LA MACHINE À DIVISER.
 *
 * A. L'élève REPORTE des copies du petit ruban le long du grand (glisser, ou
 *    les boutons + / −). Il ESSAIE aussi la copie de trop : elle ne tient pas
 *    — la mathématique résiste, rien ne se pose — et c'est seulement alors
 *    que le reste peut être porté (`tryCopy` / `overflowSeen`, 2026-09-30 ;
 *    avant, la scène annonçait « توقّف » et grisait « + » d'elle-même). La
 *    copie qu'on porte est à l'ÉCHELLE du grand ruban.
 *    Même atelier de couture que les différences (thème `workshop`) : la
 *    division est une suite de reports, la soustraction une suite de coupes.
 * B. Idée : a = b × q + r, où q est le NOMBRE DE COPIES qui tiennent et r le
 *    bout qui dépasse.
 * C. Le grand ruban se couvre de copies égales (RibbonStrip) ; le bout non
 *    couvert reste en pointillés, puis le reste apparaît en ambre.
 * D. Émerge : l'égalité se remplit case par case (le q vient du comptage des
 *    copies, le r de ce qui reste), puis l'invariant PGCD(a ; b) = PGCD(b ; r).
 * QUESTIONS PENDANT LE LABO (2026-10-28, `primitives/LabCheckpoint`) : deux ÉTAPES (`LabStepper`, `[data-ea-step]`) — « القسمات » (la chaîne est finie : combien de
 * divisions, ce qui passe à la ligne suivante, ce qui ne change pas) puis « PGCD » (le dernier reste non nul est posé : pourquoi s'arrêter, puis la RÈGLE, qui
 * remplace la découverte automatique et formalise dans `onDone`). Obligatoires pour tout élève ; l'enseignant seul les coupe (`useLabCheckpointSettings`).
 * SON : `tooth` par copie posée, `bell` par division confirmée, `flag` au PGCD posé, `over` pour un geste refusé. Textes dans `euclid.cp.*`.
 * E. À découvrir : la chaîne des divisions, et le PGCD = DERNIER RESTE NON
 *    NUL. `compareWith="differences"` montre 3 divisions contre 8 différences.
 *
 * LECTEUR DE MISSION (rollout 2026-11-08, traitement v2, comme pgcd-differences) : joué en MANCHES (LabRounds). `onVerdict` remonte le PGCD posé
 * ({ groups: v, exact }) — une case refusée est un essai raté ; `levels={false}` ; `predict` : au DÉBUT d'une division (les PRED_MAX premières),
 * « كم نسخة تدخل؟ » (`PredictTray`) ; `chains` (`['divs', 'pgcd']`) ; `CHAINS_PLAYER` = divs : compter d'un toucher (`fill`) → BÂTIR la première
 * division a = b × q + r (`build`) → l'invariant ; pgcd : pourquoi s'arrêter → la règle ; la chaîne des divisions ET l'égalité vivante vont dans la
 * colonne du labo (« 📋 جدول تجاربك ») ; `handDone` ouvre « أكمل القسمات » ; `choices` : des paires (a, b). Contrôles figés pendant une prédiction
 * ou une question ; toujours guidé ; pas de fête quand l'étape est cachée.
 */
export default function EuclidAlgorithm({
  a: a0, b: b0, title, lead, mission, compareWith, initialMode = 'student', allowModeSwitch = false, answerHiddenByDefault = false, onFinished, onTrial, checkpoints: cpOn = true, coach: coachOn = true,
  // ── LECTEUR DE MISSION (rollout 2026-11-08, traitement v2) ──
  onVerdict, levels: withLevels = true, handDone = false, chains: chainsOn = ['divs', 'pgcd'], predict: predictOn = true, choices,
  // ── SYNTHÈSE (unité 1, 2026-11-12, additif) : `share` = les mots de la part { all, groups, each } — la chaîne pgcd du lecteur finit alors sur
  // la construction NUMÉRIQUE a = PGCD × part (CHAINS_SHARE) ; absent, rien ne change ──
  share = null,
}) {
  const { t } = useTranslation('lesson');
  const gameScreen = useInMissionPlayer();
  const state = useManipulation({ type: 'euclidean-algorithm', initialNumbers: { a: a0, b: b0 }, initialMode, hintCount: 3, answerHiddenByDefault, withLevels: withLevels !== false });
  const { a, b } = state.numbers;
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const [lab, setLab] = useState(() => L.initEuclid({ a: a0, b: b0 }));
  const [reject, setReject] = useState(null);

  // « إعادة », d'autres nombres ou un autre niveau : TOUT recommence — la chaîne, les questions du labo, la fête
  const sceneKey = `${a}|${b}|${state.epoch}|${state.resetCount}`;
  const [scene, setScene] = useState(sceneKey);
  // lecteur : les divisions déjà prédites (index), la dernière prédiction jugée
  const [predDone, setPredDone] = useState([]);
  const [pred, setPred] = useState(null);
  const [missionBig, setMissionBig] = useState(false);
  if (scene !== sceneKey) { setScene(sceneKey); setLab(L.initEuclid({ a, b })); setReject(null); setPredDone([]); setPred(null); }
  const [answered, setAnswered] = useState({ key: sceneKey, ids: [] });
  const answeredIds = answered.key === sceneKey ? answered.ids : [];

  // les questions pendant le labo : obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpSettings = useLabCheckpointSettings('euclidean-algorithm');
  const ruleByCheckpoint = cpOn && cpSettings.enabled;
  const reachedOf = { divs: L.isEuclidFinished(lab), pgcd: lab.pgcdPlaced };
  const pending = ruleByCheckpoint ? STEPS.find((id) => chainsOn.includes(id) && !answeredIds.includes(id)) : null;
  // lecteur : compter d'un toucher puis BÂTIR la première division ; la page garde ses suites
  const chain = pending && reachedOf[pending] ? (gameScreen ? (share ? CHAINS_SHARE : CHAINS_PLAYER) : CHAINS)[pending] : null;
  const cp = useLabCheckpoint({
    id: chain ? pending : null,
    questions: chain ? chain.map((q) => QUESTIONS[q]({ a, b, lab, share }, k)) : null,
    reached: true,
    resetKey: sceneKey,
    onRetry: () => setLab((s) => (pending === 'divs' ? L.initEuclid({ a, b }) : { ...s, pgcdPlaced: false })),
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

  // le son : une dent par copie (plus grave en retirant), la cloche par division confirmée, le drapeau au PGCD posé
  const heard = useRef({ copies: 0, confirmed: 0, placed: false, at: 0 });
  useEffect(() => {
    const h = heard.current;
    if (lab.copies !== h.copies) {
      const now = Date.now();
      if (now - h.at > 35) { playSfx('tooth', { pitch: lab.copies > h.copies ? 1 : 0.75 }); h.at = now; }
      h.copies = lab.copies;
    }
    if (lab.confirmed > h.confirmed) playSfx('bell');
    h.confirmed = lab.confirmed;
    if (lab.pgcdPlaced && !h.placed) playSfx('flag');
    h.placed = lab.pgcdPlaced;
  }, [lab.copies, lab.confirmed, lab.pgcdPlaced]); // eslint-disable-line react-hooks/exhaustive-deps

  const drag = useDragInteraction({
    onDrop: (sourceId, zoneId) => {
      setReject(null);
      if (sourceId === 'copy' && zoneId === 'dividend') { setLab(L.addCopy); return; }
      if (sourceId.startsWith('rem:') && zoneId.startsWith('slot')) return;
      if (sourceId.startsWith('rem:') && zoneId === 'carry') { setLab(L.carryRemainder); return; }
      if (sourceId.startsWith('rem:') && zoneId === 'pgcd') {
        const v = Number(sourceId.replace('rem:', ''));
        setLab((s) => ({ ...s, pgcdPlaced: v === s.gcd }));
        state.report(onVerdict, { a, b, groups: v, exact: v === lab.gcd });
        if (!ruleByCheckpoint && !gameScreen) state.discover();
      }
    },
    accepts: (sourceId, zoneId) => {
      if (lockedRef.current) return '';
      if (sourceId === 'copy') return zoneId === 'dividend' ? L.canAddCopy(lab) : 'invalid';
      const v = Number(sourceId.replace('rem:', ''));
      if (zoneId === 'carry') return L.canCarryRemainder(lab, v);
      if (zoneId === 'pgcd') return L.canPlaceEuclidPgcd(lab, v);
      return 'invalid';
    },
    onReject: (sourceId, zoneId, reason) => {
      // La copie de trop, LÂCHÉE sur le ruban : refusée, mais vue — l'essai compte.
      // (Ici et pas dans `accepts`, que l'aimant consulte à chaque mouvement.)
      if (!reason) return;
      if (sourceId === 'copy' && reason === 'overflow') setLab(L.tryCopy);
      // une case PGCD refusée est un essai raté de la manche
      if (zoneId === 'pgcd') state.report(onVerdict, { a, b, groups: Number(String(sourceId).replace('rem:', '')), exact: false });
      playSfx('over');
      setReject({ reason, v: Number(String(sourceId).replace('rem:', '')) });
    },
  });
  /** « + » : ESSAYER une copie de plus — posée si elle tient, refusée sinon. */
  const tryPlus = () => {
    if (lockedRef.current) return;
    if (L.canAddCopy(lab) === 'overflow') { playSfx('over'); setReject({ reason: 'overflow' }); }
    else setReject(null);
    setLab(L.tryCopy);
  };

  useEffect(() => { if (state.isFormal) state.report(onFinished, lab.gcd); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  // La contrainte de la configuration — une seule définition, lue par le
  // laboratoire libre / le mode classe ET par « أكمل القسمات ».
  // Quand l'un divise l'autre, le seul reste est 0 : le PGCD (le plus petit
  // nombre) n'est jamais une tuile à poser, la case restait vide pour de bon.
  const validateNumbers = (x) => (
    Math.max(x.a, x.b) % Math.min(x.a, x.b) === 0 ? t('manipulation.euclid.dividesOther')
      : divisibility.euclidSteps(x.a, x.b).steps.length > 12 ? t('manipulation.euclid.tooManySteps') : '');

  const div = L.currentDivision(lab);
  const done = lab.steps.slice(0, lab.confirmed);
  const rest = div ? L.remainderOf(lab) : null;
  const quotientReached = L.quotientReached(lab);
  const cmp = compareWith === 'differences' ? L.comparison(a, b) : null;
  const nonZeroRemainders = [...new Set(lab.steps.filter((s) => s.r !== 0).map((s) => s.r))];
  // lecteur : au DÉBUT d'une division (les PRED_MAX premières), prédire combien de copies tiennent
  const predictOpen = gameScreen && predictOn && ruleByCheckpoint && !missionBig && !cp.open && !!div && lab.copies === 0
    && predDone.length < PRED_MAX && !predDone.includes(lab.index);
  const locked = gameScreen && (cp.open || predictOpen);
  const lockedRef = useRef(false);
  lockedRef.current = locked;
  const sayPredict = (says) => {
    const ok = Number(says) === div.q;
    playSfx(ok ? 'correct' : 'pop');
    setPred({ at: lab.index, ok });
    state.report(onTrial, { tk: 'predict', ok });
    setPredDone((d) => [...d, lab.index]);
  };
  const trayNode = !gameScreen ? null : predictOpen ? (
    <PredictTray attr="ea" title={k('cp.predict.title')} prompt={k('cp.predict.prompt', { a: div.a, b: div.b })}
      options={chipsAround(div.q, { min: 1 }).map((v) => ({ says: String(v), text: k('cp.predict.option', { v }) }))} onSay={sayPredict} />
  ) : cp.open ? cp.node : null;

  // le GUIDE (LabCoach, 2026-11-09) : le geste du moment, jamais le résultat
  const coachStep = coachOn && !locked ? L.euclidCoachOf(lab) : null;
  const coach = useLabCoach({ lab: 'euclidean-algorithm', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '', labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') } });
  // la chaîne des divisions et l'égalité vivante : la représentation de la page, la colonne du labo dans le lecteur
  const chainNode = (
        <div className="space-y-2" data-euclid-chain>
          {done.map((s, i) => (
            // lecteur : la colonne est étroite — une ligne par division, sans l'invariant écrit (les questions le font dire)
            <div key={i} className={gameScreen ? '' : 'grid gap-2 grid-cols-2'} data-ea-trial={s.r}>
              <EquationDisplay tex={euclidStepTex(s)} tone={s.r === 0 ? 'result' : 'ok'} size="sm" />
              {!gameScreen && <EquationDisplay tex={s.r === 0 ? `\\mathrm{PGCD}(${a}\\ ;\\ ${b}) = ${lab.pgcdPlaced ? lab.gcd : '\\,?'}` : pgcdEqualityTex(s.a, s.b, s.b, s.r)} tone="muted" size="sm"
                note={s.r === 0 ? t('manipulation.euclid.remainderZero') : t('manipulation.euclid.invariant')} />}
            </div>
          ))}
          {div && (
            <EquationBuilder
              parts={[
                { text: String(div.a) }, { text: '=' }, { text: String(div.b) }, { text: '×' },
                { slot: 'q', value: lab.copies > 0 ? lab.copies : null, tileTone: 'quotient' },
                { text: '+' }, { slot: 'r', value: quotientReached && lab.overflowSeen ? rest : null, tileTone: 'remainder' },
              ]}
              drag={drag}
              slotLabel={(s) => (s === 'q' ? t('manipulation.quotient') : t('manipulation.remainder'))}
            />
          )}
        </div>
  );

  return (
    <ManipulationShell
      type="euclidean-algorithm"
      title={title ?? t('manipulation.euclid.title', { a, b })}
      mission={mission ?? t(gameScreen && handDone ? 'manipulation.euclid.missionButton' : 'manipulation.euclid.ribbonMission', { a, b })}
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
      sidePanel={trayNode ? <div data-ea-tray>{trayNode}</div> : null}
      allowFreeLab={gameScreen ? false : undefined}
      hints={[t('manipulation.euclid.hint1'), t('manipulation.euclid.hint2'), t('manipulation.euclid.hint3')]}
      controller={{
        autoStep: () => { if (L.isEuclidFinished(lab)) return false; setLab(L.euclidAutoStep); return true; },
        canAutoStep: () => !L.isEuclidFinished(lab),
        prevStep: () => setLab(L.removeCopy),
        canPrev: () => lab.copies > 0,
        showSolution: () => {
          setLab((s) => { let x = s; let g = 0; while (!L.isEuclidFinished(x) && g++ < 30) x = L.euclidAutoStep(x); return { ...x, pgcdPlaced: true }; });
          state.discover(); state.formalize();
        },
        // « أكمل القسمات » (§6bis) : la PREMIÈRE division se fait à la main —
        // poser les copies, voir le bout qui dépasse, porter le reste. Les
        // suivantes répètent ce geste : le bouton pose les copies une à une
        // et porte les restes, jusqu'au reste nul. La case PGCD reste vide.
        // lecteur : « أكمل القسمات » est le BOUTON du geste appris — il s'ouvre après la manche à la main (handDone)
        autoComplete: gameScreen && !handDone ? undefined : {
          label: t('manipulation.euclid.autoComplete'),
          ready: lab.a === a && lab.b === b && !validateNumbers({ a, b }),
          manualDone: lab.confirmed > 0,
          remaining: L.remainingEuclidGestures(lab),
          step: () => setLab(L.euclidGestureStep),
          finish: () => setLab(L.completeEuclid),
        },
      }}
      controlsOverride={{ prevStep: true }}
      representation={chainNode}
      discovery={(
        <ManipulationDiscovery
          state={state}
          prompt={t('manipulation.euclid.discoverPrompt')}
          options={[
            { text: t('manipulation.euclid.opt1'), correct: true },
            { text: t('manipulation.euclid.opt2'), why: t('manipulation.euclid.why2') },
            { text: t('manipulation.euclid.opt3'), why: t('manipulation.euclid.why3') },
          ]}
          formal={(
            <div className="space-y-2">
              <EquationDisplay tex={`\\mathrm{PGCD}(${a}\\ ;\\ ${b}) = ${lab.gcd}`} tone="result" size="lg" note={t('manipulation.lastNonZeroRem')} />
              <p className="font-mono text-xs text-slate-600" dir="auto">{t('manipulation.euclid.divisionCount', { count: lab.steps.length })}</p>
              {cmp && (
                <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-3 py-2" data-euclid-compare>
                  <p className="text-sm font-bold text-amber-900" dir="auto">{t('manipulation.euclid.compare', cmp)}</p>
                  <p className="text-xs text-amber-800">{t('manipulation.euclid.compareQuestion')}</p>
                  <div className="mt-1.5 space-y-1">
                    <QuantityBar value={cmp.differences} scale={cmp.differences} tone="diff" height="h-5" label={`${cmp.differences}`} />
                    <QuantityBar value={cmp.divisions} scale={cmp.differences} tone="unit" height="h-5" label={`${cmp.divisions}`} />
                  </div>
                </div>
              )}
            </div>
          )}
        />
      )}
      explanation={t('manipulation.euclid.explanation')}
    >
      <div className="relative min-h-[520px]" data-ea-glance>
      {party.node}
      {!(gameScreen && cp.open) && cp.node}
      <ManipulationStage dragging={drag.dragging}>
        <div className={gameScreen ? 'grid grid-cols-[minmax(0,1fr)_17rem] gap-3' : ''}>
        <div className="min-w-0 space-y-3">
          {showStepper && <LabStepper count={STEPS.length} current={Math.max(0, stepDone.indexOf(false))} done={stepDone} stepAttr="data-ea-step" />}
          {gameScreen && choices?.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5" data-ea-choices>
              <span className="text-sm font-bold text-slate-600">{k('choicesLabel')}</span>
              {choices.map((c) => (
                <button key={`${c.a}-${c.b}`} type="button" data-ea-choice={`${c.a}-${c.b}`} disabled={locked} onClick={() => state.setNumbers({ a: c.a, b: c.b })}
                  className={`min-h-[44px] rounded-xl border-2 px-3 text-base font-black ${c.a === a && c.b === b ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'}`}>
                  <bdi dir="ltr">{c.a} · {c.b}</bdi>
                </button>
              ))}
            </div>
          )}
          {gameScreen && pred && pred.at === lab.index && lab.copies > 0 && !cp.open && (
            <p role="status" data-ea-predict-result={pred.ok ? 'ok' : 'wrong'}
              className={`rounded-2xl px-4 py-2 text-center text-lg font-black ${pred.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
              {pred.ok ? k('cp.predict.right') : k('cp.predict.wrong')}
            </p>
          )}
          {div ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                {/* LA COPIE : un petit ruban qu'on prend et qu'on reporte — à
                    l'échelle du grand (sa largeur est b / a de celle du grand). */}
                <div className="flex w-full items-center gap-2">
                  <NumberTile value={div.b} tone="divisor" size="sm" />
                  <DraggableObject drag={drag} id="copy" label={t('manipulation.euclid.copyRibbon', { b: div.b })}
                    className="flex min-h-[44px] min-w-[44px] items-center rounded-xl border-2 border-violet-300 bg-violet-50 px-1 py-1"
                    style={{ width: `${Math.max(8, (100 * div.b) / div.a)}%` }}>
                    <RibbonStrip value={div.b} scale={div.b} tone="b" height="h-6" className="min-w-0 flex-1" />
                  </DraggableObject>
                </div>
                <span className="ms-auto flex items-center gap-1.5">
                  <Btn onClick={() => { setReject(null); setLab(L.removeCopy); }} disabled={lab.copies === 0 || locked} ariaLabel={t('manipulation.euclid.removeCopy')}>−</Btn>
                  <span className="font-mono text-xs font-bold text-slate-700">{t('manipulation.euclid.copies', { n: lab.copies })}</span>
                  <Btn onClick={tryPlus} ariaLabel={t('manipulation.euclid.addCopy')}>+</Btn>
                </span>
              </div>

              <DropZone drag={drag} id="dividend" label={t('manipulation.euclid.dividendRibbon', { a: div.a })} minHeight="min-h-[84px]" className="space-y-1.5 p-2" data-ribbons>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <NumberTile value={div.a} tone="dividend" size="sm" />
                  <span dir="auto">{t('manipulation.euclid.dividendRibbon', { a: div.a })}</span>
                </div>
                <RibbonStrip value={div.a} scale={div.a} tone="a"
                  ghost={Math.max(0, div.a - lab.copies * div.b - (rest !== null && quotientReached && lab.overflowSeen ? rest : 0))}
                  segments={[
                    ...Array.from({ length: Math.min(lab.copies, 30) }, () => ({ value: div.b, tone: 'b', label: lab.copies <= 12 ? t('manipulation.euclid.cm', { n: div.b }) : undefined })),
                    ...(rest !== null && rest > 0 && quotientReached && lab.overflowSeen ? [{ value: rest, tone: 'rem', label: t('manipulation.euclid.cm', { n: rest }) }] : []),
                  ]} />
                {quotientReached && lab.overflowSeen
                  ? <p className="text-[11px] font-bold text-amber-800" data-euclid-overflow>{t('manipulation.euclid.overflow', { r: rest, b: div.b })}</p>
                  : <p className="text-[11px] text-slate-500">{t('manipulation.euclid.notCovered')}: <span dir="ltr" className="font-mono">{div.a - lab.copies * div.b}</span></p>}
              </DropZone>

              {quotientReached && lab.overflowSeen && (
                <div className="flex flex-wrap items-center gap-2">
                  <NumberTile value={rest} drag={drag} id={`rem:${rest}`} label={`${t('manipulation.remainder')} ${rest}`} tone="remainder" />
                  <DropZone drag={drag} id="carry" label={t('manipulation.euclid.carry')} tone="emerald" hint={t('manipulation.euclid.dropCarry')} minHeight="min-h-[56px]" className="min-w-[180px] flex-1" />
                </div>
              )}
            </>
          ) : (
            <div className="grid gap-2 grid-cols-[1fr_auto]">
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
                <div className="mb-1 text-[11px] font-bold text-slate-700">{t('manipulation.euclid.chain')}</div>
                <div dir="ltr" className="flex flex-wrap gap-1.5">
                  {[...nonZeroRemainders].sort((x, y) => y - x).map((v) => <NumberTile key={v} value={v} drag={drag} id={`rem:${v}`} label={`${v}`} tone="remainder" size="sm" />)}
                  <NumberTile value={0} tone="dim" size="sm" />
                </div>
              </div>
              <DropZone drag={drag} id="pgcd" label={t('manipulation.euclid.pgcdZone')} tone="amber" hint={!lab.pgcdPlaced ? t('manipulation.euclid.dropPgcd') : undefined} minHeight="min-h-[72px]" className="flex flex-col items-center justify-center px-4">
                <div className="text-[11px] font-mono font-bold text-amber-800">PGCD</div>
                {lab.pgcdPlaced && <NumberTile value={lab.gcd} tone="pgcd" size="lg" />}
              </DropZone>
            </div>
          )}

          {reject && <p role="status" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{t(`manipulation.euclid.reject.${reject.reason}`, { v: reject.v, a, b, r: rest, d: div?.b })}</p>}
        </div>
        {/* lecteur : la chaîne des divisions et l'égalité vivante sont le JOURNAL, dans la colonne du labo */}
        {gameScreen && (
          <div className="min-w-0 overflow-hidden rounded-2xl border-2 border-indigo-100 bg-white" data-ea-side>
            <p className="bg-indigo-50 px-2 py-1 text-sm font-black text-indigo-900">📋 {k('trials.title')}</p>
            <div className="p-1.5" data-ea-trials>{chainNode}</div>
          </div>
        )}
        </div>
      </ManipulationStage>
      </div>
      <DragGhost ghost={drag.ghost}>
        {drag.held === 'copy' && div && <NumberTile value={div.b} tone="divisor" />}
        {drag.held?.startsWith('rem:') && <NumberTile value={Number(drag.held.replace('rem:', ''))} tone="remainder" />}
      </DragGhost>
    </ManipulationShell>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** Les deux étapes : la chaîne de divisions finie, puis le PGCD posé. */
const STEPS = Object.freeze(['divs', 'pgcd']);
/** La suite de questions de chaque étape : elle interroge ce que l'élève vient de FAIRE ; la dernière finit par la RÈGLE. */
export const CHAINS = Object.freeze({
  divs: ['count', 'next', 'invariant'],
  pgcd: ['stop', 'rule'],
});
/** Lecteur (rollout 2026-11-08, traitement v2) : compter d'un toucher → BÂTIR la première division → l'invariant ; puis pourquoi s'arrêter → la règle. */
export const CHAINS_PLAYER = Object.freeze({
  divs: ['countFill', 'build', 'invariant'],
  pgcd: ['stop', 'rule'],
});
/**
 * Lecteur, SYNTHÈSE (unité 1, 2026-11-12, additif — prop `share`) : après la règle, la PART — le PGCD est le plus grand nombre de parts égales,
 * et l'élève BÂTIT a = PGCD × part (une tuile de trop : la part de l'autre nombre). La manche finit sur une égalité numérique.
 */
export const CHAINS_SHARE = Object.freeze({
  divs: CHAINS_PLAYER.divs,
  pgcd: ['stop', 'rule', 'share'],
});

const $ = (x) => `$${x}$`;
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const lineOf = (s) => `${s.a} = ${s.b} \\times ${s.q} + ${s.r}`;

/** Chaque question est construite sur LES nombres de l'élève (rien n'est écrit en dur) ; `k` : les textes de `euclid`. */
const BUILD = {
  // combien de divisions, d'un toucher (la chaîne est à côté)
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
  // la PREMIÈRE division bâtie : a = b × q + r, chaque emplacement porte le sens de son nombre
  build: ({ lab }, k) => {
    const s0 = lab.steps[0];
    const o = { a: s0.a, b: s0.b, q: s0.q, r: s0.r, eq: $(lineOf(s0)) };
    return {
      id: 'build', kind: 'build', prompt: Mx(k, 'build.prompt', o),
      slots: [k('cp.build.slotA'), k('cp.build.slotB'), k('cp.build.slotQ'), k('cp.build.slotR')],
      tiles: buildTiles({ n: s0.a, g: s0.b, q: s0.q, r: s0.r }), expected: [s0.a, s0.b, s0.q, s0.r],
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
  next: ({ lab }, k) => {
    const [s0, s1] = lab.steps;
    const o = { a: s0.a, b: s0.b, r: s0.r, line: $(lineOf(s0)), line2: $(lineOf(s1)) };
    return {
      id: 'next', kind: 'choice',
      prompt: Mx(k, 'next.prompt', o),
      options: [
        { text: Mx(k, 'next.again', o), why: Mx(k, 'next.whyAgain', o) },
        { text: Mx(k, 'next.shift', o), correct: true },
        { text: Mx(k, 'next.swap', o), why: Mx(k, 'next.whySwap', o) },
      ],
      hints: [Mx(k, 'next.hint1', o), Mx(k, 'next.hint2', o)],
      explain: Mx(k, 'next.explain', o),
    };
  },
  invariant: ({ a, b, lab }, k) => {
    const [s0, s1] = lab.steps;
    const o = { a, b, a0: s0.a, a1: s1.a, r0: s0.r, rLast: lab.steps[lab.steps.length - 1].r, b1: s1.b };
    return {
      id: 'invariant', kind: 'choice',
      prompt: Mx(k, 'invariant.prompt'),
      options: [
        { text: Mx(k, 'invariant.dividend'), why: Mx(k, 'invariant.whyDividend', o) },
        { text: Mx(k, 'invariant.remainder'), why: Mx(k, 'invariant.whyRemainder', o) },
        { text: Mx(k, 'invariant.pgcd'), correct: true },
      ],
      hints: [Mx(k, 'invariant.hint1'), Mx(k, 'invariant.hint2', o)],
      explain: Mx(k, 'invariant.explain', o),
    };
  },
  stop: ({ a, b, lab }, k) => {
    const last = lab.steps[lab.steps.length - 1];
    const o = { a, b, g: lab.gcd, last: $(lineOf(last)), q: last.q };
    return {
      id: 'stop', kind: 'choice',
      prompt: Mx(k, 'stop.prompt', o),
      options: [
        { text: Mx(k, 'stop.zero'), why: Mx(k, 'stop.whyZero', o) },
        { text: Mx(k, 'stop.divides', o), correct: true },
        { text: Mx(k, 'stop.quotient'), why: Mx(k, 'stop.whyQuotient', o) },
      ],
      hints: [Mx(k, 'stop.hint1', o), Mx(k, 'stop.hint2', o)],
      explain: Mx(k, 'stop.explain', o),
    };
  },
  rule: ({ a, b, lab }, k) => {
    // « آخر حاصل قسمة » ou « أوّل باقٍ » seraient justes aussi quand ils valent le PGCD (45 et 18 : 9) : on les remplace par un nombre de départ
    const g = lab.gcd;
    const big = Math.max(a, b); const small = Math.min(a, b);
    const alts = [
      { text: Mx(k, 'rule.optBig'), why: Mx(k, 'rule.whyBig', { big, small }) },
      { text: Mx(k, 'rule.optSmall'), why: Mx(k, 'rule.whySmall', { big, small }) },
    ];
    const wrong2 = lab.steps[lab.steps.length - 1].q === g ? alts.shift() : { text: <MathText>{k('opt2')}</MathText>, why: <MathText>{k('why2')}</MathText> };
    const wrong3 = lab.steps[0].r === g ? alts.shift() : { text: <MathText>{k('opt3')}</MathText>, why: <MathText>{k('why3')}</MathText> };
    return {
      id: 'rule', kind: 'choice',
      prompt: <MathText>{k('discoverPrompt')}</MathText>,
      options: [{ text: <MathText>{k('opt1')}</MathText>, correct: true }, wrong2, wrong3],
      hints: [Mx(k, 'rule.hint1'), Mx(k, 'rule.hint2', { g })],
      explain: <MathText>{k('cp.rule.explain', { a, b, g })}</MathText>,
    };
  },
  // SYNTHÈSE (prop `share`) : la part BÂTIE — a = PGCD × part ; les emplacements portent les mots de la leçon, la tuile de trop est la part de b
  share: ({ a, b, lab, share: w }, k) => {
    const g = lab.gcd;
    const words = { all: w?.all ?? k('cp.share.slotAll'), groups: w?.groups ?? k('cp.share.slotGroups'), each: w?.each ?? k('cp.share.slotEach') };
    const o = { a: $(a), b: $(b), g: $(g), q: $(a / g), ...words, eq: $(`${a} = ${g} \\times ${a / g}`) };
    return {
      id: 'share', kind: 'build', prompt: Mx(k, 'share.prompt', o),
      slots: [words.all, words.groups, words.each],
      // les tuiles sont DISTINCTES (une valeur répétée rendrait l'identité d'une tuile ambiguë — revue 2026-11-12)
      tiles: [...new Set([a / g, b / g, a, g])], expected: [a, g, a / g], ops: ['=', '×'],
      hints: [Mx(k, 'share.hint1', o), Mx(k, 'share.hint2', o)], explain: Mx(k, 'share.explain', o),
    };
  },
};

export const QUESTIONS = ordered(BUILD);
