import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useDragInteraction from '../useDragInteraction';
import DropZone from '../primitives/DropZone';
import DraggableObject from '../primitives/DraggableObject';
import NumberTile from '../primitives/NumberTile';
import DragGhost from '../primitives/DragGhost';
import BrickWall from '../primitives/BrickWall';
import EquationDisplay from '../primitives/EquationDisplay';
import { measureLayout } from '../primitives/brickLayout';
import { useLabCoach } from '../primitives/LabCoach';
import MathText from '../../components/MathText';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { ordered } from './cpOrder';
import PredictTray from '../primitives/PredictTray';
import RolesEquation from '../primitives/RolesEquation';
import { useInMissionPlayer } from '../../mission/missionPlayerContext';
import { chipsAround, buildTiles } from './divisionChecks';
import * as L from '../logic/divisorProperties';

const NS = 'manipulation.props';

/**
 * divisor-properties — LE CHANTIER DES MURS EN BRIQUES DE n.
 *
 * A. L'élève porte LE MUR DE b (un vrai mur, en briques de longueur n) vers
 *    l'une des trois zones du chantier : l'ACCOLER au mur de a (a + b),
 *    l'ENLEVER du mur de a (a − b), ou MESURER le mur de a avec des panneaux
 *    de b (le reste). (La preuve écrite est au module « أتعلّم البرهنة » ; le
 *    constructeur de preuve qui vivait ici n'était posé par aucune leçon, il
 *    a été retiré le 2026-09-30.)
 * B. Idée : n | a et n | b ⇒ n | a + b, a − b, r — parce que tout est bâti
 *    en briques entières de n.
 * C. Les murs sont à la même échelle (BrickWall) : accolés, le résultat est
 *    encore un mur de briques entières ; enlevé, ce qui reste aussi ; mesuré
 *    par des panneaux de b, le bout qui dépasse aussi — aucun demi-brique
 *    n'apparaît jamais.
 * D. Émerge : a + b = n × (q + q'), littéralement la factorisation du manuel.
 * E. À découvrir : ce n'est pas un hasard des nombres choisis — c'est n en
 *    facteur commun ; la preuve, construite à la main, le dit avec des lettres.
 *
 * ONBOARDING (prop `coach`, défaut true — `LabCoach`, §8quater) : `logic/divisorProperties.js › coachOf` montre le mur de b à porter
 * (et, au niveau avancé, la prédiction à choisir d'abord) ; la zone est désignée par son rang, jamais par ses mots.
 *
 * QUESTIONS PENDANT LE LABO (2026-10-28, `primitives/LabCheckpoint`) : TROIS ÉTAPES (`LabStepper`, `[data-dp-step=<i>]`), une par mur bâti (a + b, a − b, le reste) ; chaque mur
 * pose sa suite de questions (`CHAINS`, textes dans `props.cp.*`) par-dessus le chantier, dans l'ordre où l'élève les bâtit ; la suite du dernier mur (le reste) finit par
 * la RÈGLE, qui remplace la découverte automatique et formalise dans `onDone`. Obligatoires pour tout élève ; l'enseignant seul les coupe (`useLabCheckpointSettings`).
 * Le guide `LabCoach` se tait pendant une question. SON : `tooth` par mur posé, `flag` quand les trois sont bâtis, `over` pour un geste refusé.
 *
 * Thème `construction` (packages/core VISUAL_THEMES). Le geste est le même
 * à tous les niveaux ; au niveau avancé (900, 90, 9) les briques sont trop
 * petites pour être comptées : l'élève PRÉDIT avec la propriété — « طوب كامل »
 * ou « يبقى جزء من طوبة » — avant de bâtir chaque mur, et le mur bâti
 * confirme ou réfute (`predict` / `outcome`, 2026-09-30 : la prédiction était
 * promise sans exister).
 */

/** Les trois zones du chantier et le mesurande que chacune construit. */
const ZONES = Object.freeze([
  { id: 'join', target: 'sum', tone: 'emerald' },
  { id: 'remove', target: 'diff', tone: 'amber' },
  { id: 'measure', target: 'rem', tone: 'indigo' },
]);
const targetOfZone = (zoneId) => ZONES.find((z) => `zone:${z.id}` === zoneId)?.target ?? null;

export default function DivisorProperties({
  n: n0, a: a0, b: b0, title, lead, mission, initialMode = 'student', allowModeSwitch = false, onFinished, onTrial, coach: coachOn = true, checkpoints: cpOn = true,
  // ── LECTEUR DE MISSION (rollout 2026-11-08, traitement v2 du labo) ──
  // chaque mur bâti remonte à la manche : onVerdict({ groups: 1 | 2 | 3 (ألصق · انزع · قِس), exact: true, target })
  onVerdict,
  // false : pas de sélecteur مبتدئ / متقدم (le lecteur joue en manches, LabRounds)
  levels: withLevels = true,
  // true : l'élève a DÉJÀ porté le mur à la main (manche 1) — chaque zone devient un BOUTON (le geste appris)
  handDone = false,
  // les murs dont on pose les questions ('sum', 'diff', 'rem') ; [] : aucune
  chains: chainsOn = ['sum', 'diff', 'rem'],
  // true : PRÉDIRE (« طوب كامل » ?) avant de bâtir chaque mur, dans la colonne (au lieu des boutons d'un niveau متقدم)
  predict: predictOn = false,
  // des triplets { n, a, b } à essayer (terrain libre)
  choices,
  // des triplets { n, a, b } joués l'un après l'autre DANS la même manche : quand les trois murs d'un cas sont bâtis, le cas suivant s'ouvre
  sequence,
}) {
  const { t } = useTranslation('lesson');
  const gameScreen = useInMissionPlayer();
  const state = useManipulation({ type: 'divisor-properties', initialNumbers: { n: n0, a: a0, b: b0 }, initialMode, hintCount: 3, withLevels: withLevels !== false });
  const { n, a, b } = state.numbers;
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const [lab, setLab] = useState(() => L.init({ n: n0, a: a0, b: b0 }));
  const [reject, setReject] = useState(null);

  // « إعادة », d'autres nombres ou un autre niveau : TOUT recommence — les murs, les questions du labo, la fête
  const sceneKey = `${n}|${a}|${b}|${state.epoch}|${state.resetCount}`;
  const [scene, setScene] = useState(sceneKey);
  // lecteur : le mur qui attend sa PRÉDICTION, la dernière prédiction jugée, la prédiction mission en grand
  // l'indice du cas courant dans `sequence` (déduit des nombres : « إعادة » le ramène seul au premier)
  const seqIdx = sequence ? sequence.findIndex((c) => c.n === n && c.a === a && c.b === b) : -1;
  const [predTarget, setPredTarget] = useState(null);
  const [lastPred, setLastPred] = useState(null);
  const [missionBig, setMissionBig] = useState(false);
  if (scene !== sceneKey) { setScene(sceneKey); setLab(L.init({ n, a, b })); setReject(null); setPredTarget(null); setLastPred(null); }
  const [answered, setAnswered] = useState({ key: sceneKey, ids: [] });
  const answeredIds = answered.key === sceneKey ? answered.ids : [];

  // les questions pendant le labo : la suite du premier mur bâti dont les questions ne sont pas finies
  const cpSettings = useLabCheckpointSettings('divisor-properties');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const ruleByCheckpoint = cpOn && cpSettings.enabled;
  const chainSet = gameScreen ? CHAINS_PLAYER : CHAINS;
  const pending = ruleByCheckpoint ? lab.built.find((x) => !answeredIds.includes(x) && chainsOn.includes(x)) : null;
  const chain = pending ? chainSet[pending] : null;
  const cp = useLabCheckpoint({
    id: chain ? pending : null,
    questions: chain ? chain.map((q) => QUESTIONS[q]({ n, a, b, lab }, k)) : null,
    reached: true,
    resetKey: sceneKey,
    onRetry: () => setLab((s) => ({ ...s, built: s.built.filter((x) => x !== pending) })),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setAnswered((x) => ({ key: sceneKey, ids: [...(x.key === sceneKey ? x.ids : []), id] }));
      if (chainSet[id].includes('rule')) { state.discover(); state.formalize(); }
    },
  });
  const stepDone = L.TARGETS.map((x) => lab.built.includes(x) && (!ruleByCheckpoint || answeredIds.includes(x) || !chainsOn.includes(x)));
  const party = useStepCelebration();
  const celebrated = useRef({ key: sceneKey, set: new Set() });
  if (celebrated.current.key !== sceneKey) celebrated.current = { key: sceneKey, set: new Set() };
  useEffect(() => {
    // lecteur : sans étapier (manches sans questions) la fête « أنهيت كل المهام » ne doit pas couper une manche qui continue (la suite de cas)
    if (gameScreen && (!ruleByCheckpoint || chainsOn.length === 0)) return;
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.set.has(i)) return;
      celebrated.current.set.add(i);
      party.celebrate({ n: stepDone.filter(Boolean).length, total: L.TARGETS.length });
    });
  }, [stepDone.join()]); // eslint-disable-line react-hooks/exhaustive-deps

  // le son : un pas par mur posé, le drapeau quand les trois sont bâtis
  const heard = useRef({ built: 0, at: 0 });
  useEffect(() => {
    const h = heard.current;
    if (lab.built.length !== h.built) {
      const now = Date.now();
      if (lab.built.length < h.built || now - h.at > 35) { playSfx('tooth', { pitch: lab.built.length > h.built ? 1 : 0.75 }); h.at = now; }
      if (lab.built.length === L.TARGETS.length && h.built < L.TARGETS.length) playSfx('flag');
      h.built = lab.built.length;
    }
  }, [lab.built.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // lecteur : chaque mur bâti est annoncé UNE fois à la manche (groups = 1 ألصق · 2 انزع · 3 قِس)
  const reported = useRef({ key: sceneKey, set: new Set() });
  if (reported.current.key !== sceneKey) reported.current = { key: sceneKey, set: new Set() };
  useEffect(() => {
    lab.built.forEach((tg) => {
      if (reported.current.set.has(tg)) return;
      reported.current.set.add(tg);
      state.report(onVerdict, { groups: Math.max(seqIdx, 0) * L.TARGETS.length + L.TARGETS.indexOf(tg) + 1, exact: true, target: tg });
    });
  }, [lab.built.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  // la suite de cas : les trois murs bâtis (et leurs questions faites), le cas suivant s'ouvre après un court instant pour voir le dernier mur
  useEffect(() => {
    if (!sequence || seqIdx < 0 || seqIdx >= sequence.length - 1 || !L.discoveryReady(lab) || cp.open || predTarget) return undefined;
    const id = setTimeout(() => state.setNumbers(sequence[seqIdx + 1]), 1600);
    return () => clearTimeout(id);
  }, [lab.built.join(), seqIdx, cp.open, predTarget]); // eslint-disable-line react-hooks/exhaustive-deps

  const isAdvanced = state.level === 'advanced';
  // lecteur : prédire avant de bâtir (gratuit, jugé par le mur, compte pour l'étoile) — jamais pendant une suite de questions
  const predictGate = gameScreen && predictOn && ruleByCheckpoint;
  const requestBuild = (target) => {
    if (lab.built.includes(target)) return;
    if (predictGate && !lab.predictions[target]) { setPredTarget(target); return; }
    setLab((s) => L.build(s, target));
  };
  const sayPredict = (says) => {
    const tg = predTarget;
    const ok = says === L.outcome(lab, tg);
    playSfx(ok ? 'correct' : 'pop');
    setLastPred({ target: tg, ok });
    state.report(onTrial, { tk: 'predict', ok });
    setPredTarget(null);
    setLab((s) => L.build(L.predict(s, tg, says), tg));
  };
  const hideAnswers = gameScreen && cp.open;
  const predictOpen = gameScreen && !missionBig && predTarget != null && !cp.open;
  const locked = gameScreen && (cp.open || predictOpen);
  const coachStep = coachOn && !cp.open ? L.coachOf(lab, { advanced: isAdvanced }) : null;
  const coachK = (key, o) => t(`manipulation.props.coach.${key}`, o);
  const coach = useLabCoach({
    lab: 'divisor-properties', step: coachStep, text: coachStep ? coachK(coachStep.id === 'carry-next' ? 'carryNext' : coachStep.id, { zone: coachK(`zone${coachStep.rank}`) }) : '',
    labels: { hide: coachK('hide'), show: coachK('show'), ok: coachK('ok'), stop: coachK('stop') },
  });

  const drag = useDragInteraction({
    onDrop: (sourceId, zoneId) => {
      setReject(null);
      if (sourceId === 'wall:b') {
        const target = targetOfZone(zoneId);
        if (!target) return;
        if (gameScreen) { requestBuild(target); return; }
        setLab((s) => L.build(s, target));
      }
    },
    accepts: (sourceId, zoneId) => {
      if (sourceId === 'wall:b') {
        const target = targetOfZone(zoneId);
        // Un mur déjà bâti : geste sans effet (refus muet, pas une erreur).
        if (target && lab.built.includes(target)) return '';
        if (gameScreen) return target ? true : 'wrongZone';
        return target ? L.canBuild(lab, target, { requirePrediction: isAdvanced }) : 'wrongZone';
      }
      return 'wrongZone';
    },
    onReject: (_s, _z, reason) => { if (reason) playSfx('over'); setReject(reason); },
  });

  // La découverte suit les trois murs bâtis — dans un effet, pas un updater.
  const ready = L.discoveryReady(lab) && !ruleByCheckpoint && !gameScreen;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tous les murs à la MÊME échelle : la plus grande longueur du chantier.
  const scale = Math.max(a + b, 1);
  const heldWall = drag.held === 'wall:b';
  const zoneLabel = (id) => t(`manipulation.props.zone${id[0].toUpperCase()}${id.slice(1)}`);
  const dropLabel = (id) => t(`manipulation.props.drop${id[0].toUpperCase()}${id.slice(1)}`);
  const meas = measureLayout({ a, b, unit: n });
  const cm = (v) => `${v}`;
  // lecteur : la prédiction ou la question PREND la colonne du labo (le chantier garde toute sa largeur)
  const trayNode = !gameScreen ? null : predictOpen ? (
    <PredictTray attr="dp" title={k('cp.predictTray.title')} prompt={k(`cp.predictTray.${predTarget}`, { n, a, b })}
      options={[{ says: 'whole', text: k('predictWhole') }, { says: 'partial', text: k('predictPartial') }]} onSay={sayPredict} />
  ) : cp.open ? cp.node : null;

  /** Le mur RÉSULTAT d'une zone, en segments de couleur, tous en briques de n. */
  const resultSegments = (target) => {
    if (target === 'sum') return [{ value: a, tone: 'a', label: cm(a) }, { value: b, tone: 'b', label: cm(b) }];
    if (target === 'diff') return [{ value: a - b, tone: 'diff', label: cm(a - b) }, { value: b, tone: 'ghost', label: cm(b) }];
    return [
      ...meas.panels.map(() => ({ value: b, tone: 'panel', label: meas.q <= 12 ? cm(b) : undefined })),
      ...(meas.r > 0 ? [{ value: meas.r, tone: 'rem', label: cm(meas.r) }] : []),
    ];
  };
  // Une égalité dans une phrase arabe est ISOLÉE en LTR : sans cela,
  // « 18 = 3 × 6 » se relisait « 6 × 3 = 18 » (audit, défaut m).
  const eq = (text) => <bdi dir="ltr" className="font-mono">{text}</bdi>;
  const resultNote = (target) => {
    const r = L.blocks(lab, target);
    const lead = target === 'sum' ? t('manipulation.props.wallSum')
      : target === 'diff' ? t('manipulation.props.wallDiff')
        : t('manipulation.props.wallRem', { panels: t('manipulation.props.panels', { count: meas.q }), b });
    const guess = lab.predictions[target];
    const verdict = guess && (guess === L.outcome(lab, target) ? t('manipulation.props.predictRight') : t('manipulation.props.predictWrong'));
    return (
      <>
        {verdict && <span className={`me-1 ${guess === 'whole' ? 'text-emerald-800' : 'text-amber-800'}`} data-prediction-verdict={guess === L.outcome(lab, target) ? 'right' : 'wrong'}>{verdict}</span>}
        {!verdict && <span className="me-1">{lead}</span>}
        {eq(`${r.value} = ${n} × ${r.count}`)}
      </>
    );
  };

  return (
    <ManipulationShell
      type="divisor-properties"
      title={title ?? t('manipulation.props.title')}
      mission={mission ?? t(gameScreen && handDone ? 'manipulation.props.missionButton' : 'manipulation.props.wallMission', { n, a, b })}
      lead={lead}
      state={state}
      coach={coachOn ? coach : null}
      numberFields={[{ key: 'n', label: 'n' }, { key: 'a', label: 'a' }, { key: 'b', label: 'b' }]}
      validate={(x) => (x.a % x.n !== 0 || x.b % x.n !== 0 ? t('manipulation.props.mustDivideBoth') : x.a < x.b ? t('manipulation.props.aBeforeB') : '')}
      allowModeSwitch={allowModeSwitch}
      headerAction={cpOn ? cpSettings.control : null}
      // lecteur : l'écran de jeu est toujours GUIDÉ ; la question / la prédiction prend la colonne ; le résultat écrit ne donne jamais la réponse
      guided={!!chain || ruleByCheckpoint || gameScreen}
      hideRepresentation={hideAnswers || gameScreen}
      onIntroChange={setMissionBig}
      sidePanel={trayNode ? <div data-dp-tray>{trayNode}</div> : null}
      allowFreeLab={!gameScreen}
      hints={[t('manipulation.props.hint1', { a, b }), t('manipulation.props.hint2'), t('manipulation.props.hint3', { n })]}
      // (réf. §6bis : MANUEL — trois opérations distinctes, rien ne se répète.)
      controller={{
        autoStep: () => {
          const next = L.TARGETS.find((x) => !lab.built.includes(x));
          if (!next) return false;
          setLab((s) => L.build(s, next));
          return true;
        },
        canAutoStep: () => lab.built.length < L.TARGETS.length,
        showSolution: () => { setLab((s) => L.TARGETS.reduce((acc, x) => L.build(acc, x), s)); state.discover(); state.formalize(); },
      }}
      representation={!gameScreen && lab.built.length > 0 && (
        <div className="space-y-2">
          {lab.built.map((target) => {
            const r = L.blocks(lab, target);
            return <EquationDisplay key={target} tex={r.tex} tone="ok" size="sm" note={eq(`${r.value} = ${n} × ${r.count}`)} />;
          })}
        </div>
      )}
      discovery={(
        <ManipulationDiscovery
          state={state}
          prompt={t('manipulation.props.discoverPrompt')}
          options={[
            { text: t('manipulation.props.opt1', { n }), correct: true },
            { text: t('manipulation.props.opt2', { n }), why: t('manipulation.props.why2') },
            { text: t('manipulation.props.opt3', { n }), why: t('manipulation.props.why3') },
          ]}
          formal={(
            <div className="space-y-3">
              <EquationDisplay tex={`n \\mid a,\\ n \\mid b \\Rightarrow n \\mid a+b,\\ n \\mid a-b,\\ n \\mid r`} tone="result" note={t('manipulation.props.conclusion', { n })} />
            </div>
          )}
        />
      )}
      explanation={t('manipulation.props.explanation')}
    >
      <div className={`relative ${gameScreen ? '' : 'min-h-[600px]'}`} data-dp-glance>
      {party.node}
      {!(gameScreen && cp.open) && cp.node}
      <ManipulationStage dragging={drag.dragging} className="bg-gradient-to-b from-orange-50/60 to-white">
        <div className="space-y-3" data-brick-site>
          {!(gameScreen && (!ruleByCheckpoint || chainsOn.length === 0)) && <LabStepper count={L.TARGETS.length} current={Math.max(0, stepDone.indexOf(false))} done={stepDone} stepAttr="data-dp-step" />}
          {gameScreen && lastPred && lab.built.includes(lastPred.target) && lab.built[lab.built.length - 1] === lastPred.target && !cp.open && (
            <p role="status" data-dp-predict-result={lastPred.ok ? 'ok' : 'wrong'}
              className={`rounded-2xl px-4 py-2 text-center text-lg font-black ${lastPred.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
              {lastPred.ok ? k('cp.predictTray.right') : k('cp.predictTray.wrong')}
            </p>
          )}
          {gameScreen && sequence?.length > 1 && seqIdx >= 0 && (
            <p className="text-sm font-black text-indigo-900" data-dp-case>{k('cp.caseOf', { i: seqIdx + 1, m: sequence.length })}</p>
          )}
          {gameScreen && choices?.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5" data-dp-choices>
              <span className="text-xs font-bold text-slate-700">{k('cp.choicesLabel')}</span>
              <div dir="ltr" className="flex flex-wrap gap-1.5" role="group" aria-label={k('cp.choicesLabel')}>
                {choices.map((c) => (
                  <button key={`${c.n}|${c.a}|${c.b}`} type="button" data-dp-choice={`${c.n}|${c.a}|${c.b}`} onClick={() => state.setNumbers({ n: c.n, a: c.a, b: c.b })}
                    className={`min-h-[44px] rounded-xl border-2 px-3 font-mono text-sm font-extrabold ${c.n === n && c.a === a && c.b === b ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white text-slate-800'}`}>
                    {c.n} | {c.a} , {c.b}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className={gameScreen ? 'grid grid-cols-[minmax(0,1fr)_15rem] items-start gap-3' : 'space-y-3'}>
          <div className={`space-y-3 ${locked ? 'pointer-events-none opacity-60' : ''}`} aria-disabled={locked || undefined} data-dp-controls={locked ? 'locked' : 'open'}>
          {/* ── LES DEUX MURS, bâtis en briques de n, à la même échelle ──── */}
          <div className="space-y-2 rounded-2xl border-2 border-slate-200 bg-white p-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700">
              <NumberTile value={n} tone="quotient" size="sm" />
              <span>{t('manipulation.props.brickOf', { n })}</span>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-600">{t('manipulation.props.wallA')}: {hideAnswers ? eq(`${a}`) : eq(`${a} = ${n} × ${lab.q}`)}</div>
              <BrickWall value={a} unit={n} scale={scale} tone="a" />
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-600">{t('manipulation.props.wallB')}: {hideAnswers ? eq(`${b}`) : eq(`${b} = ${n} × ${lab.qp}`)}</div>
              {/* LE MUR DE b : c'est LUI qu'on porte. Il reste à sa place
                  (l'objet de référence ne disparaît pas) et sa copie va
                  dans la zone choisie. */}
              <DraggableObject drag={drag} id="wall:b" label={t('manipulation.props.dragWall')} disabled={lab.built.length === L.TARGETS.length}
                className="block w-full rounded-xl border-2 border-violet-300 bg-violet-50/60 p-1">
                <div className="flex items-center gap-2">
                  <NumberTile value={b} tone="divisor" size="sm" />
                  <BrickWall value={b} unit={n} scale={scale} tone="b" className="flex-1" />
                </div>
              </DraggableObject>
            </div>
          </div>

          {/* ── LE CHANTIER : trois zones, trois questions du manuel ─────── */}
          <div className="grid gap-2">
            {ZONES.map((z) => {
              const built = lab.built.includes(z.target);
              return (
                <DropZone key={z.id} drag={drag} id={`zone:${z.id}`} label={zoneLabel(z.id)} tone={z.tone} disabled={built}
                  hint={!built ? dropLabel(z.id) : undefined} minHeight="min-h-[64px]" className="p-2" data-site-zone={z.id} data-built={built ? 'true' : 'false'}>
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-[11px] font-extrabold text-slate-700">
                    <span>{zoneLabel(z.id)}</span>
                    {built && <span className="rounded-full bg-emerald-600 px-2 text-white">{t('manipulation.props.alreadyBuiltShort')}</span>}
                  </div>
                  {built ? (
                    <div className="space-y-1">
                      <BrickWall unit={n} scale={scale} segments={resultSegments(z.target)} />
                      {!hideAnswers && <p className="text-xs font-bold text-emerald-800">{resultNote(z.target)}</p>}
                    </div>
                  ) : gameScreen && handDone ? (
                    // le geste est appris : la zone devient un BOUTON
                    <button type="button" data-dp-build={z.target} onClick={(e) => { e.stopPropagation(); requestBuild(z.target); }}
                      className="min-h-[48px] w-full rounded-xl bg-indigo-600 px-4 text-base font-black text-white shadow-[0_3px_0_0_#3730A3] hover:bg-indigo-700 active:translate-y-0.5">
                      {dropLabel(z.id)}
                    </button>
                  ) : isAdvanced ? (
                    // LA PRÉDICTION : on s'engage AVANT de voir le mur.
                    <div className="flex flex-wrap items-center gap-1.5" data-prediction={lab.predictions[z.target] ?? ''}>
                      <span className="text-[11px] font-bold text-slate-600">{t('manipulation.props.predictPrompt')}</span>
                      {L.PREDICTIONS.map((g) => (
                        <button key={g} type="button" aria-pressed={lab.predictions[z.target] === g}
                          onClick={(e) => { e.stopPropagation(); setReject(null); setLab((s) => L.predict(s, z.target, g)); }}
                          className={`min-h-[44px] rounded-lg border-2 px-2.5 text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${lab.predictions[z.target] === g ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>
                          {t(g === 'whole' ? 'manipulation.props.predictWhole' : 'manipulation.props.predictPartial')}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="h-6" aria-hidden="true" />
                  )}
                </DropZone>
              );
            })}
          </div>

          {reject && <p role="status" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{t(`manipulation.props.reject.${reject}`)}</p>}
          </div>
          {gameScreen && lab.built.length > 0 && !hideAnswers && <WallTrials lab={lab} n={n} k={k} />}
          </div>
        </div>
      </ManipulationStage>
      </div>
      <DragGhost ghost={drag.ghost}>
        {heldWall && (
          <span className="flex w-40 items-center gap-2 rounded-xl border-2 border-blue-500 bg-blue-50 px-2 py-1">
            <NumberTile value={b} tone="divisor" size="sm" />
            <BrickWall value={b} unit={n} scale={b} tone="b" className="flex-1" height="h-6" />
          </span>
        )}
      </DragGhost>
    </ManipulationShell>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** Lecteur : les murs bâtis par l'élève, dans l'ordre (« جدول تجاربك ») : l'opération, la longueur, les briques entières. */
const TRIAL_LABEL = { sum: 'a + b', diff: 'a − b', rem: 'r' };
function WallTrials({ lab, n, k }) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-indigo-100 bg-white" data-dp-trials>
      <p className="bg-indigo-50 px-2 py-1 text-sm font-black text-indigo-900">📋 {k('cp.trials.title')}</p>
      <table className="w-full text-center">
        <thead className="text-[11px] font-black text-slate-500">
          <tr><th className="px-1 py-0.5">{k('cp.trials.op')}</th><th className="px-1 py-0.5">{k('cp.trials.length')}</th><th className="px-1 py-0.5">{k('cp.trials.bricks', { n })}</th></tr>
        </thead>
        <tbody>
          {lab.built.map((tg) => {
            const r = L.blocks(lab, tg);
            return (
              <tr key={tg} data-dp-trial={tg} className="border-t border-indigo-50 bg-emerald-50 text-base font-black text-emerald-800">
                <td className="px-1 py-0.5" dir="ltr">{TRIAL_LABEL[tg]}</td><td className="px-1 py-0.5">{r.value}</td><td className="px-1 py-0.5">{r.count} ✓</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** La suite de questions de chaque mur bâti : elle interroge ce que l'élève vient de FAIRE ; celle du reste finit par la RÈGLE. */
export const CHAINS = Object.freeze({
  sum: ['sumCount', 'sumWhole'],
  diff: ['diffCount', 'diffWhole'],
  rem: ['remPanels', 'remBricks', 'rule'],
});

/** Lecteur (rollout 2026-11-08) : observer d'un toucher (`fill`), puis — pour le reste — BÂTIR a = b × k + r ; la règle finit toujours. */
export const CHAINS_PLAYER = Object.freeze({
  sum: ['sumObserve', 'sumWhole'],
  diff: ['diffObserve', 'diffWhole'],
  rem: ['remObserve', 'remBuild', 'rule'],
});

const $ = (x) => `$${x}$`;
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;

/** Chaque question est construite sur LES nombres de l'élève (rien n'est écrit en dur) ; `k` : les textes de `props`. */
const BUILD = {
  // « طوب الجدار الأول ▢ · طوب الجدار الثاني ▢ » : ce que les DEUX murs collés montrent, d'un toucher
  sumObserve: ({ n, a, b, lab }, k) => {
    const o = { n, a, b, q: lab.q, qp: lab.qp, c: lab.q + lab.qp };
    return {
      id: 'sumObserve', kind: 'fill', prompt: Mx(k, 'sumObserve.prompt', o),
      fields: [
        { label: k('cp.sumObserve.first'), expected: lab.q, options: chipsAround(lab.q, { min: 1 }) },
        { label: k('cp.sumObserve.second'), expected: lab.qp, options: chipsAround(lab.qp, { min: 1 }) },
      ],
      hints: [Mx(k, 'sumObserve.hint1'), Mx(k, 'sumObserve.hint2')], explain: Mx(k, 'sumObserve.explain', { ...o, calc: $(`${a}+${b}=${n}\\times(${lab.q}+${lab.qp})=${n}\\times${lab.q + lab.qp}`) }),
    };
  },
  diffObserve: ({ n, a, b, lab }, k) => {
    const c = lab.q - lab.qp;
    const o = { n, a, b, c };
    return {
      id: 'diffObserve', kind: 'fill', prompt: Mx(k, 'diffObserve.prompt', o),
      fields: [{ label: k('cp.diffObserve.left'), expected: c, options: chipsAround(c, { min: 0 }) }],
      hints: [Mx(k, 'diffObserve.hint1'), Mx(k, 'diffObserve.hint2')], explain: Mx(k, 'diffObserve.explain', { ...o, calc: $(`${a}-${b}=${n}\\times(${lab.q}-${lab.qp})=${n}\\times${c}`) }),
    };
  },
  remObserve: ({ n, a, b, lab }, k) => {
    const c = lab.r / n;
    const o = { n, a, b, panels: lab.k, r: lab.r, c };
    return {
      id: 'remObserve', kind: 'fill', prompt: Mx(k, 'remObserve.prompt', o),
      fields: [
        { label: k('cp.remObserve.panels'), expected: lab.k, options: chipsAround(lab.k, { min: 0 }) },
        { label: k('cp.remObserve.bricks'), expected: c, options: chipsAround(c, { min: 0 }) },
      ],
      hints: [Mx(k, 'remObserve.hint1'), Mx(k, 'remObserve.hint2')], explain: Mx(k, 'remObserve.explain', o),
    };
  },
  // l'égalité de la division BÂTIE : a = b × k + r (chaque emplacement porte son sens)
  remBuild: ({ a, b, lab }, k) => ({
    id: 'remBuild', kind: 'build', prompt: Mx(k, 'remBuild.prompt'),
    slots: [k('cp.remBuild.slotA'), k('cp.remBuild.slotB'), k('cp.remBuild.slotK'), k('cp.remBuild.slotR')],
    tiles: buildTiles({ n: a, g: b, q: lab.k, r: lab.r }), expected: [a, b, lab.k, lab.r],
    hints: [Mx(k, 'remBuild.hint1'), Mx(k, 'remBuild.hint2')],
    explain: (
      <div className="space-y-2">
        <RolesEquation n={a} g={b} q={lab.k} r={lab.r} labels={{ n: k('cp.roles.a'), g: k('cp.roles.b'), q: k('cp.roles.k'), r: k('cp.roles.r') }} />
        <p>{k('cp.remBuild.explainRoles')}</p>
      </div>
    ),
  }),
  sumCount: ({ n, a, b, lab }, k) => {
    const c = lab.q + lab.qp;
    return {
      id: 'sumCount', kind: 'number', expected: String(c), answer: <MathText>{$(c)}</MathText>,
      prompt: Mx(k, 'sumCount.prompt', { n, a, b }),
      hints: [Mx(k, 'sumCount.hint1', { n, a, b, q: lab.q, qp: lab.qp }), Mx(k, 'sumCount.hint2', { q: lab.q, qp: lab.qp })],
      explain: Mx(k, 'sumCount.explain', { calc: $(`${a}+${b}=${n}\\times(${lab.q}+${lab.qp})=${n}\\times${c}`) }),
    };
  },
  sumWhole: ({ n, a, b, lab }, k) => {
    const o = { n, a, b, sum: a + b, c: lab.q + lab.qp };
    return {
      id: 'sumWhole', kind: 'choice',
      prompt: Mx(k, 'sumWhole.prompt', o),
      options: [
        { text: Mx(k, 'sumWhole.yes'), why: Mx(k, 'sumWhole.whyYes', o) },
        { text: Mx(k, 'sumWhole.wholeBecause', o), correct: true },
        { text: Mx(k, 'sumWhole.bigger'), why: Mx(k, 'sumWhole.whyBigger', o) },
      ],
      hints: [Mx(k, 'sumWhole.hint1', o), Mx(k, 'sumWhole.hint2', o)],
      explain: Mx(k, 'sumWhole.explain', o),
    };
  },
  diffCount: ({ n, a, b, lab }, k) => {
    const c = lab.q - lab.qp;
    return {
      id: 'diffCount', kind: 'number', expected: String(c), answer: <MathText>{$(c)}</MathText>,
      prompt: Mx(k, 'diffCount.prompt', { n, a, b }),
      hints: [Mx(k, 'diffCount.hint1', { a, q: lab.q, qp: lab.qp }), Mx(k, 'diffCount.hint2', { q: lab.q, qp: lab.qp })],
      explain: Mx(k, 'diffCount.explain', { calc: $(`${a}-${b}=${n}\\times(${lab.q}-${lab.qp})=${n}\\times${c}`) }),
    };
  },
  diffWhole: ({ n, a, b, lab }, k) => {
    const o = { n, a, b, diff: a - b, c: lab.q - lab.qp };
    return {
      id: 'diffWhole', kind: 'choice',
      prompt: Mx(k, 'diffWhole.prompt', o),
      options: [
        { text: Mx(k, 'diffWhole.smaller', o), why: Mx(k, 'diffWhole.whySmaller', o) },
        { text: Mx(k, 'diffWhole.wholeBoth', o), correct: true },
        { text: Mx(k, 'diffWhole.even'), why: Mx(k, 'diffWhole.whyEven', o) },
      ],
      hints: [Mx(k, 'diffWhole.hint1', o), Mx(k, 'diffWhole.hint2', o)],
      explain: Mx(k, 'diffWhole.explain', o),
    };
  },
  remPanels: ({ a, b, lab }, k) => ({
    id: 'remPanels', kind: 'number', expected: String(lab.k), answer: <MathText>{$(lab.k)}</MathText>,
    prompt: Mx(k, 'remPanels.prompt', { a, b }),
    hints: [Mx(k, 'remPanels.hint1', { b }), Mx(k, 'remPanels.hint2', { a, b })],
    explain: Mx(k, 'remPanels.explain', { calc: $(`${a}=${b}\\times${lab.k}+${lab.r}`) }),
  }),
  remBricks: ({ n, a, b, lab }, k) => {
    const c = lab.r / n;
    const o = { n, a, b, r: lab.r, c };
    return {
      id: 'remBricks', kind: 'number', expected: String(c), answer: <MathText>{$(c)}</MathText>,
      prompt: Mx(k, 'remBricks.prompt', o),
      hints: [Mx(k, 'remBricks.hint1', o), Mx(k, 'remBricks.hint2', o)],
      explain: Mx(k, 'remBricks.explain', { calc: $(`${lab.r}=${n}\\times${c}`), n }),
    };
  },
  rule: ({ n, lab }, k) => ({
    id: 'rule', kind: 'choice',
    prompt: <MathText>{k('discoverPrompt')}</MathText>,
    options: [
      { text: <MathText>{k('opt1', { n })}</MathText>, correct: true },
      { text: <MathText>{k('opt2', { n })}</MathText>, why: <MathText>{k('why2')}</MathText> },
      { text: <MathText>{k('opt3', { n })}</MathText>, why: <MathText>{k('why3')}</MathText> },
    ],
    hints: [Mx(k, 'rule.hint1', { n }), Mx(k, 'rule.hint2', { n, sum: lab.a + lab.b, diff: lab.a - lab.b, r: lab.r })],
    explain: Mx(k, 'rule.explain', { n }),
  }),
};

export const QUESTIONS = ordered(BUILD);
