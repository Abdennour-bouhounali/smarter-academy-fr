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
import DivisorChip from '../primitives/DivisorChip';
import DragGhost from '../primitives/DragGhost';
import GroupingScene from '../primitives/GroupingScene';
import { themeWords } from '../themeWords';
import MathTransformation from '../primitives/MathTransformation';
import EquationDisplay from '../primitives/EquationDisplay';
import MathText from '../../components/MathText';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { ordered } from './cpOrder';
import * as L from '../logic/fraction';
import PredictTray from '../primitives/PredictTray';
import { useLabCoach } from '../primitives/LabCoach';
import { useInMissionPlayer } from '../../mission/missionPlayerContext';
import { chipsAround } from './divisionChecks';

const NS = 'manipulation.reduce';

const { reductionStepTex, euclidStepTex } = divisibility;

/**
 * fraction-reduction — LE LABORATOIRE DES DEUX CHEMINS.
 *
 * A. L'élève porte un DIVISEUR COMMUN sur la RECETTE : 84 cuillères de sucre
 *    pour 48 tasses de farine. Diviser les deux termes par k, c'est répartir
 *    les deux ingrédients en k parts identiques — et la fraction réduite est
 *    ce que contient UNE part (GroupingScene, thème `kitchen`).
 * B. Idée : diviser les deux termes par un diviseur commun ne change pas le
 *    kasr (une part garde les mêmes proportions que la recette entière) ; on
 *    s'arrête quand il n'y a plus de diviseur commun > 1.
 * C. Le rail offre 2 … 12, pas seulement les bons nombres : un nombre qui ne
 *    divise qu'un seul terme est refusé AVEC la raison — l'erreur classique,
 *    possible et expliquée au moment où elle se produit. L'élève DÉCIDE de
 *    s'arrêter (« لا يمكن الاختزال أكثر ») ; l'affirmation est jugée. Au
 *    chemin ب, aucun nombre n'est doré : un diviseur commun qui n'est pas le
 *    plus grand est refusé en montrant ce qu'il donnerait (2026-09-30).
 * D. Émerge : la chaîne 84/48 → 21/12 → 7/4, puis, à côté, la même chose en
 *    UNE division par le PGCD.
 * QUESTIONS PENDANT LE LABO (2026-10-28, `primitives/LabCheckpoint`) : deux ÉTAPES (`LabStepper`, `[data-fr-step]`) — « الخطوات » (le chemin أ est déclaré fini :
 * combien de divisions, la valeur ne change pas, pourquoi s'arrêter) puis « PGCD » (le chemin ب est fait : la même fraction en une division, puis la RÈGLE, qui
 * remplace la découverte automatique et formalise dans `onDone`). Obligatoires pour tout élève ; l'enseignant seul les coupe (`useLabCheckpointSettings`).
 * SON : `tooth` par division, `bell` quand le chemin أ est fini, `flag` quand le chemin ب l'est, `over` pour un geste refusé. Textes dans `reduce.cp.*`.
 * E. À découvrir : « أي الطريقين أوفر؟ » — l'utilité du PGCD, comptée en
 *    étapes, pas affirmée.
 *
 * LECTEUR DE MISSION (rollout 2026-11-09, traitement v2, comme pgcd-differences) : joué en MANCHES (LabRounds). `onVerdict` remonte le chemin ب
 * (`{ groups: k, exact }` : la division unique par le PGCD ; une case refusée ou une affirmation « لا يمكن الاختزال أكثر » fausse = un essai raté) ;
 * `levels={false}` ; `predict` : DEUX prédictions — avant la première division (« هل تتغيّر قيمة الكسر؟ ») et au début du chemin ب (« بأيّ عدد نقسم مرّة
 * واحدة؟ ») ; `chains` (`['steps', 'pgcd']`) ; `CHAINS_PLAYER` = steps : compter d'un toucher (`fill`) → BÂTIR la première division « n = k × n′ »
 * (`build`, ops `=` `×`) → pourquoi s'arrêter ; pgcd : une seule division → la règle ; la chaîne des réductions est le JOURNAL « 📋 جدول تجاربك »
 * dans la colonne du labo ; `choices` : des fractions { n, d } à toucher. Contrôles figés pendant une prédiction ou une question ; toujours guidé ;
 * pas de fête quand l'étape est cachée.
 */
export default function FractionReduction({
  n: n0, d: d0, title, lead, mission, path, theme = 'kitchen', initialMode = 'student', allowModeSwitch = false, onFinished, onTrial, checkpoints: cpOn = true, coach: coachOn = true,
  // ── LECTEUR DE MISSION (rollout 2026-11-09, traitement v2) ──
  onVerdict, levels: withLevels = true, chains: chainsOn = ['steps', 'pgcd'], predict: predictOn = true, choices,
}) {
  const { t } = useTranslation('lesson');
  const gameScreen = useInMissionPlayer();
  const state = useManipulation({ type: 'fraction-reduction', initialNumbers: { n: n0, d: d0 }, initialMode, hintCount: 3, withLevels: withLevels !== false });
  const { n, d } = state.numbers;
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const [lab, setLab] = useState(() => L.init({ n: n0, d: d0 }));
  const [reject, setReject] = useState(null);

  // « إعادة », d'autres nombres ou un autre niveau : TOUT recommence — les chemins, les questions du labo, la fête
  const sceneKey = `${n}|${d}|${state.epoch}|${state.resetCount}`;
  const [scene, setScene] = useState(sceneKey);
  // lecteur : les prédictions faites ('value' avant la 1re division, 'one' au début du chemin ب), la dernière jugée
  const [predDone, setPredDone] = useState([]);
  const [pred, setPred] = useState(null);
  const [missionBig, setMissionBig] = useState(false);
  if (scene !== sceneKey) { setScene(sceneKey); setLab(L.init({ n, d })); setReject(null); setPredDone([]); setPred(null); }
  const [answered, setAnswered] = useState({ key: sceneKey, ids: [] });
  const answeredIds = answered.key === sceneKey ? answered.ids : [];

  // les questions pendant le labo : obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpSettings = useLabCheckpointSettings('fraction-reduction');
  const ruleByCheckpoint = cpOn && cpSettings.enabled;
  const reachedOf = { steps: L.pathAFinished(lab), pgcd: lab.pathB !== null };
  const pending = ruleByCheckpoint ? STEPS.find((id) => chainsOn.includes(id) && !answeredIds.includes(id)) : null;
  // lecteur : compter d'un toucher puis BÂTIR la première division ; la page garde ses suites
  const cpChain = pending && reachedOf[pending] ? (gameScreen ? CHAINS_PLAYER : CHAINS)[pending] : null;
  const cp = useLabCheckpoint({
    id: cpChain ? pending : null,
    questions: cpChain ? cpChain.map((q) => QUESTIONS[q]({ n, d, lab }, k)) : null,
    reached: true,
    resetKey: sceneKey,
    onRetry: () => setLab((s) => (pending === 'steps' ? L.init({ n, d }) : { ...s, pathB: null })),
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
    stepDone.forEach((done, i) => {
      if (!done || celebrated.current.set.has(i)) return;
      celebrated.current.set.add(i);
      if (showStepper) party.celebrate({ n: i + 1, total: STEPS.length });
    });
  }, [stepDone.join()]); // eslint-disable-line react-hooks/exhaustive-deps

  // le son : une dent par division, la cloche quand le chemin أ est fini, le drapeau quand le chemin ب l'est
  const heard = useRef({ divs: 0, claimed: false, b: false, at: 0 });
  useEffect(() => {
    const h = heard.current;
    if (lab.pathA.length !== h.divs) {
      const now = Date.now();
      if (now - h.at > 35) { playSfx('tooth', { pitch: lab.pathA.length > h.divs ? 1 : 0.75 }); h.at = now; }
      h.divs = lab.pathA.length;
    }
    if (lab.claimed && !h.claimed) playSfx('bell');
    h.claimed = lab.claimed;
    const placed = lab.pathB !== null;
    if (placed && !h.b) playSfx('flag');
    h.b = placed;
  }, [lab.pathA.length, lab.claimed, lab.pathB]); // eslint-disable-line react-hooks/exhaustive-deps

  const drag = useDragInteraction({
    onDrop: (sourceId, zoneId) => {
      setReject(null);
      const k = Number(sourceId.replace(/^[kp]:/, ''));
      if (zoneId === 'fraction') { setLab((s) => L.reduceA(s, k)); return; }
      if (zoneId === 'pgcd') { setLab((s) => L.reduceB(s, k)); state.report(onVerdict, { n, d, groups: k, exact: true }); }
    },
    accepts: (sourceId, zoneId) => {
      if (lockedRef.current) return '';
      const k = Number(sourceId.replace(/^[kp]:/, ''));
      if (zoneId === 'fraction') return L.canReduceA(lab, k);
      if (zoneId === 'pgcd') return L.canReduceB(lab, k);
      return 'invalid';
    },
    onReject: (sourceId, zoneId, reason) => {
      if (!reason) return;
      playSfx('over');
      const k = Number(sourceId.replace(/^[kp]:/, ''));
      // une case du chemin ب refusée est un essai raté de la manche
      if (zoneId === 'pgcd') state.report(onVerdict, { n, d, groups: k, exact: false });
      setReject({ reason, k });
    },
  });

  const ready = L.discoveryReady(lab) && !ruleByCheckpoint && !gameScreen;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  const claim = () => {
    if (lockedRef.current) return;
    const ok = L.canClaimIrreducible(lab);
    // « لا يمكن الاختزال أكثر » trop tôt : un essai raté de la manche
    if (ok !== true) { playSfx('over'); setReject({ reason: ok }); state.report(onVerdict, { n, d, groups: 0, exact: false }); return; }
    setReject(null);
    setLab(L.claimIrreducible);
  };

  useEffect(() => { if (state.isFormal) state.report(onFinished, lab.final); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  const cur = L.currentA(lab);
  const rail = L.railA(lab);
  const chain = L.chainA(lab);
  const finishedA = L.pathAFinished(lab);
  // La SCÈNE montre la dernière répartition : la recette d'avant, en k parts,
  // dont une est mise en évidence — c'est la fraction courante.
  const last = chain[chain.length - 1];
  const prev = chain.length > 1 ? chain[chain.length - 2] : null;
  const words = themeWords(t, theme);
  const heldValue = drag.held ? Number(drag.held.replace(/^[kp]:/, '')) : null;
  // Le chemin du manuel (سمير : ÷4 puis ÷3) guide le mode classe — sur les
  // nombres de la leçon SEULEMENT (il fuyait sur 595/560 : 12 proposé, refusé).
  const classPath = state.isAuthoredLevel ? path : undefined;
  const cmp = L.pathComparison(lab);
  // lecteur : deux prédictions — avant la 1re division, puis au début du chemin ب
  const predWhich = lab.pathA.length === 0 ? 'value' : finishedA && lab.pathB === null ? 'one' : null;
  const predictOpen = gameScreen && predictOn && ruleByCheckpoint && !missionBig && !cp.open && !!predWhich && !predDone.includes(predWhich);
  const locked = gameScreen && (cp.open || predictOpen);
  const lockedRef = useRef(false);
  lockedRef.current = locked;
  const oneOptions = [...new Set([lab.gcd, ...lab.pathA, ...chipsAround(lab.gcd, { min: 2 })])].slice(0, 3).sort((x, y) => x - y);
  const sayPredict = (says) => {
    const ok = predWhich === 'value' ? says === 'same' : Number(says) === lab.gcd;
    playSfx(ok ? 'correct' : 'pop');
    setPred({ which: predWhich, ok });
    state.report(onTrial, { tk: 'predict', ok });
    setPredDone((x) => [...x, predWhich]);
  };
  // le GUIDE (LabCoach, 2026-11-09) : le geste du moment, jamais le résultat ni le moment de s'arrêter
  const coachStep = coachOn && !locked ? L.coachOf(lab) : null;
  const coach = useLabCoach({ lab: 'fraction-reduction', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '', labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') } });
  const trayNode = !gameScreen ? null : predictOpen ? (
    <PredictTray attr="fr" title={k('cp.predict.title')}
      prompt={predWhich === 'value' ? k('cp.predict.valuePrompt', { n, d }) : k('cp.predict.onePrompt', { n, d, fn: cur.n, fd: cur.d })}
      options={predWhich === 'value'
        ? [{ says: 'same', text: k('cp.predict.same') }, { says: 'smaller', text: k('cp.predict.smaller') }]
        : oneOptions.map((v) => ({ says: String(v), text: k('cp.predict.by', { v }) }))}
      onSay={sayPredict} />
  ) : cp.open ? cp.node : null;

  return (
    <ManipulationShell
      type="fraction-reduction"
      title={title ?? t('manipulation.reduce.title', { n, d })}
      mission={mission ?? t('manipulation.reduce.recipeMission')}
      // lecteur : l'écran de jeu est toujours GUIDÉ ; la question / la prédiction prend la colonne du labo
      hideRepresentation={gameScreen || undefined}
      onIntroChange={setMissionBig}
      sidePanel={trayNode ? <div data-fr-tray>{trayNode}</div> : null}
      allowFreeLab={gameScreen ? false : undefined}
      lead={lead}
      state={state}
      numberFields={[{ key: 'n', label: t('manipulation.reduce.numerator') }, { key: 'd', label: t('manipulation.reduce.denominator') }]}
      validate={(x) => (x.d === 0 ? t('manipulation.reduce.denominatorZero') : '')}
      allowModeSwitch={allowModeSwitch}
      headerAction={cpOn ? cpSettings.control : null}
      coach={coachOn ? coach : null}
      guided={!!cpChain || ruleByCheckpoint || gameScreen}
      hints={[t('manipulation.reduce.hint1'), t('manipulation.reduce.hint2'), t('manipulation.reduce.hint3')]}
      controller={{
        autoStep: () => {
          if (!L.pathAFinished(lab)) {
            const k = (classPath ?? []).find((x, i) => i === lab.pathA.length) ?? L.candidatesA(lab)[0];
            if (k === undefined) { setLab(L.claimIrreducible); return true; }
            setLab((s) => L.reduceA(s, k));
            return true;
          }
          if (lab.pathB === null) { setLab((s) => L.reduceB(s, s.gcd)); return true; }
          return false;
        },
        canAutoStep: () => !L.pathAFinished(lab) || lab.pathB === null,
        showSolution: () => {
          setLab((s) => {
            let x = s; let guard = 0;
            while (L.candidatesA(x).length && guard++ < 20) x = L.reduceA(x, L.candidatesA(x)[0]);
            return L.reduceB(L.claimIrreducible(x), x.gcd);
          });
          state.discover(); state.formalize();
        },
      }}
      representation={(
        <div className="space-y-2">
          {chain.slice(1).map((c, i) => (
            <MathTransformation key={i} fromTex={`\\dfrac{${chain[i].n}}{${chain[i].d}}`} opLabel={`÷ ${c.k}`} toTex={`\\dfrac{${c.n}}{${c.d}}`}
              tone={i === chain.length - 2 ? 'active' : 'ok'} note={t('manipulation.reduce.divideBy', { k: c.k })} />
          ))}
          {finishedA && (
            <EquationDisplay tex={`\\dfrac{${cur.n}}{${cur.d}}`} tone="ok" size="lg"
              note={`${t('manipulation.irreducible')} — ${t('manipulation.reduce.whyIrreducible', { n: cur.n, d: cur.d })}`} />
          )}
          {lab.pathB !== null && (
            <div className="space-y-1.5 rounded-2xl border-2 border-amber-300 bg-amber-50 p-3">
              <div className="text-sm font-bold text-amber-900">{t('manipulation.reduce.pathB')}</div>
              {lab.euclid.map((s, i) => <EquationDisplay key={i} tex={euclidStepTex(s)} tone="muted" size="sm" />)}
              <MathTransformation fromTex={`\\dfrac{${n}}{${d}}`} opLabel={`÷ ${lab.gcd}`} toTex={`\\dfrac{${lab.final.n}}{${lab.final.d}}`} tone="result"
                note={reductionStepTex(n, d, lab.gcd) ? t('manipulation.reduce.pgcdInOneStep') : undefined} />
              <GroupingScene a={n} b={d} k={lab.gcd} theme={theme} words={{ ...words, allUsed: undefined }} highlight={0} compact
                ariaLabel={`${n}/${d} ÷ ${lab.gcd} = ${lab.final.n}/${lab.final.d}`} />
            </div>
          )}
        </div>
      )}
      discovery={(
        <ManipulationDiscovery
          state={state}
          prompt={t('manipulation.reduce.discoverPrompt')}
          options={cmp.equal ? [
            { text: t('manipulation.reduce.opt1'), why: t('manipulation.reduce.why1Equal') },
            { text: t('manipulation.reduce.opt3'), correct: true },
            { text: t('manipulation.reduce.opt2'), why: t('manipulation.reduce.why3', { stepsA: t('manipulation.reduce.steps', { count: cmp.stepsA }) }) },
          ] : [
            { text: t('manipulation.reduce.opt2'), why: t('manipulation.reduce.why2', { stepsA: t('manipulation.reduce.steps', { count: cmp.stepsA }) }) },
            { text: t('manipulation.reduce.opt1'), correct: true },
            { text: t('manipulation.reduce.opt3'), why: t('manipulation.reduce.why3', { stepsA: t('manipulation.reduce.steps', { count: cmp.stepsA }) }) },
          ]}
          formal={(
            <div className="space-y-2">
              <EquationDisplay tex={reductionStepTex(n, d, lab.gcd)} tone="result" />
              <p className="font-mono text-xs text-slate-600" dir="auto">
                {t('manipulation.reduce.pathA')}: {t('manipulation.reduce.steps', { count: lab.pathA.length })} · {t('manipulation.reduce.pathB')}: {t('manipulation.reduce.steps', { count: 1 })}
              </p>
            </div>
          )}
        />
      )}
      explanation={t('manipulation.reduce.explanation')}
    >
      <div className="relative min-h-[520px]" data-fr-glance>
      {party.node}
      {!(gameScreen && cp.open) && cp.node}
      <ManipulationStage dragging={drag.dragging}>
        <div className={gameScreen ? 'grid grid-cols-[minmax(0,1fr)_15rem] gap-3' : ''}>
        <div className="min-w-0 space-y-3">
          {showStepper && <LabStepper count={STEPS.length} current={Math.max(0, stepDone.indexOf(false))} done={stepDone} stepAttr="data-fr-step" />}
          {gameScreen && choices?.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5" data-fr-choices>
              <span className="text-sm font-bold text-slate-600">{k('choicesLabel')}</span>
              {choices.map((c) => (
                <button key={`${c.n}-${c.d}`} type="button" data-fr-choice={`${c.n}-${c.d}`} disabled={locked} onClick={() => state.setNumbers({ n: c.n, d: c.d })}
                  className={`min-h-[44px] rounded-xl border-2 px-3 text-base font-black ${c.n === n && c.d === d ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'}`}>
                  <bdi dir="ltr">{c.n}/{c.d}</bdi>
                </button>
              ))}
            </div>
          )}
          {gameScreen && pred && !cp.open && !predictOpen && ((pred.which === 'value' && lab.pathA.length === 1) || (pred.which === 'one' && lab.pathB !== null)) && (
            <p role="status" data-fr-predict-result={pred.ok ? 'ok' : 'wrong'}
              className={`rounded-2xl px-4 py-2 text-center text-lg font-black ${pred.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
              {pred.ok ? k('cp.predict.right') : k('cp.predict.wrong')}
            </p>
          )}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-bold text-slate-800">{t('manipulation.reduce.chooseParts')}</span>
              <span className="text-[11px] text-slate-500">{t('manipulation.dragHint')}</span>
            </div>
            {/* Tous les nombres 2 … 12, PAS seulement les bons ; aucun n'est désigné. */}
            <div dir="ltr" className="flex flex-wrap gap-1.5" role="group" data-fr-rail>
              {(finishedA ? L.railB(lab) : rail).map((k) => (
                <DivisorChip key={k} value={k} drag={lab.pathB === null ? drag : undefined} id={finishedA ? `p:${k}` : `k:${k}`} label={`${k}`} state="idle" />
              ))}
            </div>
            {!finishedA && lab.pathA.length > 0 && (
              <button type="button" onClick={claim} disabled={locked} data-claim-irreducible
                className="min-h-[44px] rounded-xl border-2 border-emerald-600 bg-white px-3 py-1.5 text-sm font-bold text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                {t('manipulation.reduce.claim')}
              </button>
            )}
          </div>

          <DropZone drag={drag} id="fraction" label={t('manipulation.reduce.fractionZone')} hint={lab.pathA.length === 0 ? t('manipulation.reduce.dropDivisor') : undefined} minHeight="min-h-[150px]" className="p-3" disabled={finishedA} data-recipe>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                <span className="flex items-center gap-2 text-slate-800">
                  <span dir="ltr" className="inline-flex flex-col items-center gap-0.5">
                    <NumberTile value={cur.n} tone="dividend" size="sm" />
                    <span className="h-0.5 w-full rounded bg-slate-800" aria-hidden="true" />
                    <NumberTile value={cur.d} tone="divisor" size="sm" />
                  </span>
                  <span>{t('manipulation.reduce.recipe', { n: cur.n, d: cur.d, itemA: words.itemA, itemB: words.itemB })}</span>
                </span>
                {prev && <span className="text-amber-800">{t('manipulation.reduce.portionsHint', { k: last.k })}</span>}
              </div>
              {prev ? (
                <GroupingScene a={prev.n} b={prev.d} k={last.k} theme={theme} words={{ ...words, allUsed: undefined }} highlight={0}
                  ariaLabel={`${prev.n}/${prev.d} ÷ ${last.k} = ${cur.n}/${cur.d}`} />
              ) : (
                <GroupingScene a={cur.n} b={cur.d} k={null} theme={theme} words={words}
                  ariaLabel={t('manipulation.reduce.wholeRecipe', { n: cur.n, d: cur.d, itemA: words.itemA, itemB: words.itemB })} />
              )}
              {prev && (
                <p className="text-xs font-bold text-emerald-800" data-recipe-portion>
                  {t('manipulation.reduce.onePortion', { n: cur.n, d: cur.d, itemA: words.itemA, itemB: words.itemB })} <bdi dir="ltr" className="font-mono">{cur.n}/{cur.d}</bdi>
                </p>
              )}
            </div>
          </DropZone>

          {finishedA && (
            <DropZone drag={drag} id="pgcd" label={t('manipulation.reduce.pathB')} tone="amber" hint={lab.pathB === null ? t('manipulation.reduce.dropPgcd', { n, d }) : undefined} minHeight="min-h-[64px]" className="flex items-center justify-center gap-2 px-3">
              <span className="text-xs font-bold text-amber-900">{t('manipulation.reduce.pathB')}</span>
              {lab.pathB !== null && <NumberTile value={lab.pathB} tone="pgcd" />}
            </DropZone>
          )}

          {reject && <p role="status" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{t(`manipulation.reduce.reject.${reject.reason}`, { k: reject.k, n2: reject.k ? n / reject.k : '', d2: reject.k ? d / reject.k : '' })}</p>}
        </div>
        {/* lecteur : la chaîne des réductions est le JOURNAL, dans la colonne du labo */}
        {gameScreen && (
          <div className="min-w-0" data-fr-side>
            {chain.length > 1 && (
              <div className="overflow-hidden rounded-2xl border-2 border-indigo-100 bg-white" data-fr-trials>
                <p className="bg-indigo-50 px-2 py-1 text-sm font-black text-indigo-900">📋 {k('trials.title')}</p>
                <ol className="space-y-1 p-1.5">
                  {chain.slice(1).map((c, i) => (
                    <li key={`${c.k}-${i}`} data-fr-trial={c.k}>
                      <EquationDisplay tex={`\\dfrac{${chain[i].n} \\div ${c.k}}{${chain[i].d} \\div ${c.k}} = \\dfrac{${c.n}}{${c.d}}`} tone={finishedA && i === chain.length - 2 ? 'ok' : 'neutral'} size="sm" />
                    </li>
                  ))}
                  {lab.pathB !== null && (
                    <li data-fr-trial-b={lab.pathB}>
                      <EquationDisplay tex={`\\dfrac{${n} \\div ${lab.gcd}}{${d} \\div ${lab.gcd}} = \\dfrac{${lab.final.n}}{${lab.final.d}}`} tone="result" size="sm" />
                    </li>
                  )}
                </ol>
              </div>
            )}
          </div>
        )}
        </div>
      </ManipulationStage>
      </div>
      <DragGhost ghost={drag.ghost}>{heldValue !== null && <NumberTile value={heldValue} tone="divisor" />}</DragGhost>
    </ManipulationShell>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** Les deux étapes : le chemin أ déclaré fini, puis le chemin ب fait. */
const STEPS = Object.freeze(['steps', 'pgcd']);
/** La suite de questions de chaque étape : elle interroge ce que l'élève vient de FAIRE ; la dernière finit par la RÈGLE. */
export const CHAINS = Object.freeze({
  steps: ['count', 'same', 'why'],
  pgcd: ['oneStep', 'rule'],
});
/** Lecteur (rollout 2026-11-09, traitement v2) : compter d'un toucher → BÂTIR la première division → pourquoi s'arrêter ; puis une division → la règle. */
export const CHAINS_PLAYER = Object.freeze({
  steps: ['countFill', 'build', 'why'],
  pgcd: ['oneStep', 'rule'],
});

const $ = (x) => `$${x}$`;
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;

/** Chaque question est construite sur LES nombres de l'élève (rien n'est écrit en dur) ; `k` : les textes de `reduce`. */
const BUILD = {
  // combien de divisions, d'un toucher (le journal est à côté)
  countFill: ({ n, d, lab }, k) => {
    const c = lab.pathA.length;
    return {
      id: 'countFill', kind: 'fill', prompt: Mx(k, 'count.prompt', { n, d }),
      fields: [{ label: k('cp.count.field'), expected: c, options: chipsAround(c, { min: 1 }) }],
      hints: [Mx(k, 'count.hint1'), Mx(k, 'count.hint2', { path: lab.pathA.map((x) => $(`\\div ${x}`)).join(' ، ') })],
      explain: Mx(k, 'count.explain', { c, fn: lab.final.n, fd: lab.final.d }),
    };
  },
  // la PREMIÈRE division bâtie : l'ancien numérateur = le diviseur × le nouveau (une tuile de trop : le nouveau dénominateur)
  build: ({ n, d, lab }, k) => {
    const k1 = lab.pathA[0];
    const o = { n, k1, n1: n / k1, d1: d / k1, eq: $(`${n} = ${k1} \\times ${n / k1}`) };
    return {
      id: 'build', kind: 'build', ops: ['=', '×'], prompt: Mx(k, 'build.prompt', o),
      slots: [k('cp.build.slotN'), k('cp.build.slotK'), k('cp.build.slotN1')],
      tiles: [n / k1, n, d / k1, k1], expected: [n, k1, n / k1],
      hints: [Mx(k, 'build.hint1'), Mx(k, 'build.hint2', o)], explain: Mx(k, 'build.explain', o),
    };
  },
  count: ({ n, d, lab }, k) => {
    const c = lab.pathA.length;
    return {
      id: 'count', kind: 'number', expected: String(c), answer: <MathText>{$(c)}</MathText>,
      prompt: Mx(k, 'count.prompt', { n, d }),
      hints: [Mx(k, 'count.hint1'), Mx(k, 'count.hint2', { path: lab.pathA.map((x) => $(`\\div ${x}`)).join(' ، ') })],
      explain: Mx(k, 'count.explain', { c, fn: lab.final.n, fd: lab.final.d }),
    };
  },
  same: ({ n, d, lab }, k) => {
    const o = { n, d, fn: lab.final.n, fd: lab.final.d };
    return {
      id: 'same', kind: 'choice',
      prompt: Mx(k, 'same.prompt', o),
      options: [
        { text: Mx(k, 'same.smaller'), why: Mx(k, 'same.whySmaller', o) },
        { text: Mx(k, 'same.equal'), correct: true },
        { text: Mx(k, 'same.changed'), why: Mx(k, 'same.whyChanged', o) },
      ],
      hints: [Mx(k, 'same.hint1', o), Mx(k, 'same.hint2', o)],
      explain: Mx(k, 'same.explain', o),
    };
  },
  why: ({ n, d, lab }, k) => {
    const o = { n, d, fn: lab.final.n, fd: lab.final.d };
    return {
      id: 'why', kind: 'choice',
      prompt: Mx(k, 'why.prompt', o),
      options: [
        { text: Mx(k, 'why.size', o), why: Mx(k, 'why.whySize', o) },
        { text: Mx(k, 'why.coprime', o), correct: true },
        { text: Mx(k, 'why.two'), why: Mx(k, 'why.whyTwo', o) },
      ],
      hints: [Mx(k, 'why.hint1', o), Mx(k, 'why.hint2', o)],
      explain: Mx(k, 'why.explain', o),
    };
  },
  oneStep: ({ n, d, lab }, k) => {
    const g = lab.gcd;
    const o = { n, d, g, fn: lab.final.n, fd: lab.final.d, wn: n / g, wd: d / g };
    return {
      id: 'oneStep', kind: 'choice', cols: 3,
      prompt: Mx(k, 'oneStep.prompt', o),
      options: [
        { text: <MathText>{$(`\\frac{${n / g}}{${d}}`)}</MathText>, why: Mx(k, 'oneStep.whyNumerator', o) },
        { text: <MathText>{$(`\\frac{${lab.final.n}}{${lab.final.d}}`)}</MathText>, correct: true },
        { text: <MathText>{$(`\\frac{${n}}{${d / g}}`)}</MathText>, why: Mx(k, 'oneStep.whyDenominator', o) },
      ],
      hints: [Mx(k, 'oneStep.hint1', o), Mx(k, 'oneStep.hint2', o)],
      explain: Mx(k, 'oneStep.explain', o),
    };
  },
  rule: ({ n, d, lab }, k) => {
    const cmp = L.pathComparison(lab);
    const stepsA = k('steps', { count: cmp.stepsA });
    return {
      id: 'rule', kind: 'choice',
      prompt: <MathText>{k('discoverPrompt')}</MathText>,
      options: cmp.equal ? [
        { text: <MathText>{k('opt1')}</MathText>, why: <MathText>{k('why1Equal')}</MathText> },
        { text: <MathText>{k('opt3')}</MathText>, correct: true },
        { text: <MathText>{k('opt2')}</MathText>, why: <MathText>{k('why3', { stepsA })}</MathText> },
      ] : [
        { text: <MathText>{k('opt2')}</MathText>, why: <MathText>{k('why2', { stepsA })}</MathText> },
        { text: <MathText>{k('opt1')}</MathText>, correct: true },
        { text: <MathText>{k('opt3')}</MathText>, why: <MathText>{k('why3', { stepsA })}</MathText> },
      ],
      hints: [Mx(k, 'rule.hint1', { stepsA }), Mx(k, 'rule.hint2', { g: lab.gcd })],
      explain: Mx(k, 'rule.explain', { n, d, g: lab.gcd, fn: lab.final.n, fd: lab.final.d }),
    };
  },
};

export const QUESTIONS = ordered(BUILD);
