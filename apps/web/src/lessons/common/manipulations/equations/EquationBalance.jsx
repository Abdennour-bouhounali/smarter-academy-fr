import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Scissors, SearchCheck } from 'lucide-react';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useDragInteraction from '../useDragInteraction';
import useStretchInteraction from '../useStretchInteraction';
import DraggableObject from '../primitives/DraggableObject';
import DropZone from '../primitives/DropZone';
import EquationDisplay from '../primitives/EquationDisplay';
import MathText from '../../components/MathText';
import { bidi } from '../../../../utils/bidi';
import * as B from '../logic/equationBalance';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { useInMissionPlayer } from '../../mission/missionPlayerContext';
import EquationBalancePlayer from './EquationBalancePlayer';
import { W, PIVOT, ARM, PW, CX, KINDS, beamGeometry, layoutPan, Item, Ball, Icon } from './equationBalanceParts';

export { beamGeometry, layoutPan };

/**
 * equation-balance — LA BALANCE DU VESTIAIRE (unité 4 « معادلات ومتراجحات من الدرجة الأولى
 * بمجهول واحد », leçon « حل معادلة من الدرجة الأولى بمجهول واحد »).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève PORTE des objets sur les plateaux d'une balance (ballons +1, baudruches −1,
 *    sacs fermés de x ballons, « sacs volants » −x) ou les en RETIRE vers la réserve ;
 *    puis il ÉTIRE k, le nombre de parts égales de chaque plateau. Toucher-toucher et
 *    clavier font les mêmes gestes.
 * B. Idée : une équation est une balance en équilibre ; on obtient une équation
 *    ÉQUIVALENTE en faisant la MÊME opération sur les deux membres (ajouter, retrancher,
 *    diviser par k ≠ 0), jusqu'à la forme ax = b, puis x = b/a.
 * C. Le fléau penche (selon le VRAI contenu caché des sacs) dès qu'un seul plateau
 *    change ; il revient à l'horizontale quand l'autre a reçu la même chose ; un ballon
 *    et une baudruche s'annulent sur un plateau.
 * D. Sous la balance s'écrit, après chaque étape faite des deux côtés, la ligne
 *    d'opération du manuel (« 9x + 1 − 1 = −26 − 1 ») puis « أي 9x = −27 ».
 * E. À découvrir avant la règle : on garde l'équilibre en faisant la même chose aux deux
 *    plateaux — un geste d'un seul côté fait pencher (vu), une balance résolue puis
 *    vérifiée par substitution (les sacs ouverts) le confirment.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        équations équivalentes : même opération sur les deux membres → ax = b → b/a
 *   OBJECT         une balance de Roberval dans le vestiaire, ses deux plateaux
 *   VARIABLE       le CONTENU de chaque plateau (objets portés / retirés) ; k, le nombre de parts
 *   INVARIANT      le contenu caché d'un sac (la solution) ; l'équilibre après chaque étape
 *   TRANSFORMATION l'équation écrite sous la balance, ligne après ligne
 *   CONSTRAINT     tant que le fléau penche, seul le même effet (ou se reprendre) est accepté
 *   RESISTANCE     le fléau PENCHE (« الميزان مال: ما فعلته بكفّة افعله بالأخرى ») ; porter un objet
 *                  d'un plateau à l'autre est refusé (il change les deux plateaux en sens
 *                  contraires) ; 9 sacs ne se partagent pas en 4 parts égales (9 = 4 × 2 + 1, le sac
 *                  restant dessiné en rose)
 *   EVIDENCE       le fléau horizontal, la liste d'équations, les sacs ouverts : 9 × (−3) + 1 = −26
 *   CONTRAST       un geste d'un seul côté (fléau penché) ET une balance résolue et vérifiée
 *   PREDICTION     « combien pèse un sac ? » — les ballons d'une part, avant d'ouvrir les sacs
 *   DISCOVERY      « نجري العملية نفسها على الطرفين » — choisie parmi des conjectures réfutables
 *   FORMALIZATION  معارف 1 (p. 46) : ax = b, a ≠ 0, a pour solution unique b/a
 *   TRANSFER       طرائق p. 47 (2x − 5 = 8 ; 2,5x + 4,6 = 1,3x − 0,2), تمارين 1–9 p. 50
 *
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 3, 2026-10-28) : une scène libre (une équation) ; quand la
 * découverte est atteinte (le fléau a penché, un sac est lu, la valeur vérifiée), une suite unique se pose PAR-DESSUS le labo : ce qu'il a fait
 * à l'autre plateau dans SA première étape (les mauvaises options sont réfutées par l'étape elle-même) · ce que devient sa première équation
 * écrite avec la valeur trouvée · ce que pèse un sac (les erreurs réelles : le signe, la division oubliée, le quotient renversé) · LA RÈGLE
 * (l'ancienne découverte, qui formalise). Obligatoires pour tout élève ; l'enseignant seul les coupe pour SON compte (`checkpoints` = false
 * les coupe aussi). `onCheckpoint(ev)` : la trace pour les étapes du module. ÉTAPES `LabStepper` (`[data-eb-step=<i>]` : un fléau qui penche
 * puis revient · un sac lu · la vérification + questions) + fête ; « إعادة » repart de zéro ; « أعِد التجربة » remet la balance au départ.
 * SON : `tooth` (objet posé / ôté), `bell` (étape écrite des DEUX côtés, partage), `flag` (sac lu, valeur vérifiée), `over` (geste refusé).
 *
 * AUTO-COMPLÉTION : NON (§6bis). Chaque geste est une décision (quoi retirer, de quel
 * côté, combien de parts) : « compléter » voudrait dire « résoudre à la place de l'élève ».
 *
 * DÉCOR (demande du propriétaire) : un ballon posé au sol du vestiaire que l'on peut taper
 * (il rebondit). Il ne porte AUCUNE information, est `aria-hidden`, hors du clavier
 * (`tabIndex=-1`), ne touche jamais l'état du laboratoire, et `prefers-reduced-motion`
 * l'immobilise.
 */

/**
 * LECTEUR DE MISSION (rollout 2026-11-11, unité 4 leçon 1 `muadala-ula`) : dans le lecteur le labo est `EquationBalancePlayer` (manches, questions
 * sur ce que l'élève FAIT, prédictions, guide, aucune barre de défilement) ; partout ailleurs (page, enseignant, mode classe) c'est la page ci-dessous,
 * INCHANGÉE. Les dessins sont partagés (`equationBalanceParts.jsx`).
 */
export default function EquationBalance(props) {
  const inPlayer = useInMissionPlayer();
  return inPlayer ? <EquationBalancePlayer {...props} /> : <EquationBalancePage {...props} />;
}

function EquationBalancePage({
  eq: eq0 = '3x+2=11', title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onFinished, onTrial, onCheckpoint,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.equationBalance.${key}`, o), [t]);
  const state = useManipulation({ type: 'equation-balance', initialNumbers: { eq: eq0 }, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { eq } = state.numbers;

  const sceneKey = `${eq}:${state.epoch}:${state.resetCount}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [lab, setLab] = useState(() => B.init(eq0));
  const [notice, setNotice] = useState(null);
  const [parts, setParts] = useState(1);
  const [liveParts, setLiveParts] = useState(null);
  const [hop, setHop] = useState(0);
  // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la balance, les étapes et les questions du labo
  if (scene.key !== sceneKey) { setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(B.init(eq)); setNotice(null); setParts(1); setLiveParts(null); }

  const ready = B.discoveryReady(lab);
  // les questions pendant le labo : une suite unique quand la découverte est atteinte ; celle qui finit par la règle remplace la découverte automatique
  const cpSettings = useLabCheckpointSettings('equation-balance');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpLive = cpOn && cpSettings.enabled;
  const chain = cpLive ? CHAIN : null;
  const cp = useLabCheckpoint({
    id: chain ? eq : null,
    questions: chain && ready ? chain.map((q) => QUESTIONS[q](lab, k)) : null,
    reached: ready,
    resetKey: scene.inits,
    onRetry: () => { setLab(B.init(eq)); setNotice(null); setParts(1); setLiveParts(null); },
    onEvent: (ev) => state.report(onCheckpoint, ev),   // {tk:'checkpoint'|'checkpoint-done', id: eq, …} — la TRACE que les étapes du module relisent
    onDone: () => { state.discover(); state.formalize(); },
  });
  useEffect(() => { if (ready && !cpLive) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps

  // une étape est FAITE quand son objectif est atteint ET (la dernière) ses questions répondues : la pastille passe au vert et on fête
  const solvedNow = B.isSolved(lab);
  const stepDone = [lab.tippedSeen && B.steps(lab).length > 0, solvedNow, ready && !cp.blocking];
  const nDone = stepDone.findIndex((d) => !d) < 0 ? stepDone.length : stepDone.findIndex((d) => !d);
  const party = useStepCelebration();
  const celebrated = useRef({ n: 0, inits: scene.inits });
  if (celebrated.current.inits !== scene.inits) celebrated.current = { n: 0, inits: scene.inits };   // « إعادة » : on refête
  useEffect(() => {
    if (nDone <= celebrated.current.n) return;
    celebrated.current.n = nDone;
    party.celebrate({ n: nDone, total: stepDone.length });
  }, [nDone]); // eslint-disable-line react-hooks/exhaustive-deps
  const wasSolved = useRef(false);
  useEffect(() => {
    if (solvedNow && !wasSolved.current) playSfx('flag');
    wasSolved.current = solvedNow;
  }, [solvedNow]);
  useEffect(() => { if (state.isFormal) state.report(onFinished, eq); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  const summary = (l) => ({
    steps: B.steps(l), solved: B.isSolved(l), value: B.isSolved(l) ? B.fracText(B.readValue(l)) : null,
    valueTex: B.isSolved(l) ? B.fracLatex(B.readValue(l)) : null, verified: l.verified, tippedSeen: l.tippedSeen,
    equation: B.equationTex(l.start),
  });
  const commit = (next) => {
    const grew = next.history.length !== lab.history.length || next.verified !== lab.verified;
    setLab(next);
    if (grew) state.report(onTrial, summary(next));
  };

  /* ── porter ── */
  const side = (zone) => zone.slice(4);
  const accepts = (src, zone) => {
    if (src.startsWith('r:') && zone.startsWith('pan:')) { const v = B.canGesture(lab, side(zone), `add:${src.slice(2)}`); return v === true ? true : v; }
    if (src.startsWith('p:') && zone === 'reserve') { const [, s, kind] = src.split(':'); const v = B.canGesture(lab, s, `remove:${kind}`); return v === true ? true : v; }
    if (src.startsWith('p:') && zone.startsWith('pan:')) return src.split(':')[1] === side(zone) ? '' : 'moveAcross';
    return '';
  };
  const drag = useDragInteraction({
    accepts,
    onDrop: (src, zone) => {
      const next = src.startsWith('r:')
        ? B.gesture(lab, side(zone), `add:${src.slice(2)}`)
        : B.gesture(lab, src.split(':')[1], `remove:${src.split(':')[2]}`);
      playSfx('tooth');
      if (next.history.length > lab.history.length) playSfx('bell');
      setNotice(next.pending ? { tone: 'tip', key: 'tipped', d: B.tippedDetails(next) }
        : next.zero ? { tone: 'info', key: next.zero.kind === 'bag' ? 'zeroBag' : 'zeroUnit' }
          : next.history.length > lab.history.length ? { tone: 'ok', key: 'balanced' } : null);
      commit(next);
    },
    onReject: (_s, _z, reason) => {
      if (reason) playSfx('over');
      if (reason === 'tipped') setLab((l) => ({ ...l, refusals: l.refusals + 1 }));
      setNotice(reason ? { tone: 'ko', key: reason, d: B.tippedDetails(lab) } : null);
    },
  });
  // Toucher un objet d'un plateau en TENANT un objet de la réserve, c'est viser ce plateau
  // (et toucher un objet de la réserve en tenant un objet d'un plateau, c'est viser la réserve).
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
  const divOk = B.canDivide(lab, kk);
  const stretch = useStretchInteraction({
    value: kk, range: { min: 1, max: kMax },
    toValue: (clientX, _y, rect) => 1 + ((clientX - rect.left - 22) / Math.max(1, rect.width - 44)) * (kMax - 1),
    onChange: setLiveParts,
    onCommit: (v) => {
      setLiveParts(null); setParts(v);
      const verdict = B.canDivide(lab, v);
      setNotice(verdict === true || !verdict.reason ? null : { tone: 'ko', key: verdict.reason, d: verdict });
    },
    direction: 'ltr',
  });
  const doDivide = () => {
    if (B.canDivide(lab, parts) !== true) return;
    const next = B.divide(lab, parts);
    playSfx('bell');
    setParts(1);
    setNotice(B.isSolved(next) ? { tone: 'ok', key: 'oneBag', v: B.fracLatex(B.readValue(next)) } : { tone: 'ok', key: 'divided' });
    commit(next);
  };
  const doVerify = () => { const next = B.verify(lab); playSfx('flag'); setNotice(null); commit(next); };

  /* ── la scène ── */
  const counts = { L: B.drawCounts(lab.pans.L), R: B.drawCounts(lab.pans.R) };
  const lay = { L: layoutPan(counts.L), R: layoutPan(counts.R) };
  const contentH = Math.max(150, lay.L.height, lay.R.height);
  const SWING = 22;
  const plateY = 18 + contentH + SWING;
  const beamY = plateY + 46;
  const H = beamY + 86;
  const tilt = B.tilt(lab);
  const diff = B.toNumber(B.weight(lab, 'L')) - B.toNumber(B.weight(lab, 'R'));
  const s = tilt === 0 ? 0 : Math.sign(diff) * Math.min(SWING, 9 + Math.abs(diff) * 1.5);
  const py = { L: plateY + s, R: plateY - s };
  const { angle } = beamGeometry(s);

  const boxOf = (sd, kind) => {
    const items = [...lay[sd].ground, ...lay[sd].float].filter((it) => it.kind === kind || it.kind === `part${kind[0].toUpperCase()}${kind.slice(1)}`);
    if (!items.length) return null;
    const xs = items.map((it) => CX[sd] + it.x); const ys = items.map((it) => py[sd] + it.y);
    const pad = items[0].size / 2;
    return { x0: Math.min(...xs) - pad, x1: Math.max(...xs) + pad, y0: Math.min(...ys) - pad, y1: Math.max(...ys) + pad };
  };
  const pct = (v, total) => `${(v / total) * 100}%`;
  const has = (sd, kind) => {
    const c = counts[sd];
    return { bag: c.bags > 0, anti: c.antis > 0, ball: c.balls > 0, balloon: c.balloons > 0 }[kind];
  };
  const panWords = (sd) => {
    const c = counts[sd]; const p = lab.pans[sd];
    const words = [];
    if (c.bags) words.push(k('nBags', { count: c.bags }));
    if (c.antis) words.push(k('nAntis', { count: c.antis }));
    if (c.balls || (c.part && !c.part.negative)) words.push(k('unitsBalls', { v: B.fracText(p.u).replace('-', '') }));
    if (c.balloons || (c.part && c.part.negative)) words.push(k('unitsBalloons', { v: B.fracText(p.u).replace('-', '') }));
    return words.length ? words.join(k('and')) : k('emptyPan');
  };

  const steps = B.steps(lab);
  const solved = B.isSolved(lab);
  const sub = solved ? B.substitution(lab) : null;
  const groups = kk >= 2 ? B.groupsOf(lab, kk) : null;

  const noticeText = (n) => {
    if (!n) return null;
    const d = n.d ?? {};
    switch (n.key) {
      case 'tipped': return k('tipped', { effect: k(`eff${d.effect?.replace('+', 'P').replace('-', 'M')}`), side: k(d.missing === 'L' ? 'sideL' : 'sideR') });
      case 'moveAcross': return k('moveAcross');
      case 'noneHere': return k('noneHere');
      case 'full': return k('full');
      case 'bagsUneven': return k('bagsUneven', { n: d.n, k: d.k, q: d.q, r: d.r, side: k(d.side === 'L' ? 'sideL' : 'sideR') });
      case 'cutMixed': return k('cutMixed', { k: d.k, side: k(d.side === 'L' ? 'sideL' : 'sideR') });
      case 'noBags': return k('noBags');
      case 'zeroUnit': return k('zeroUnit');
      case 'zeroBag': return k('zeroBag');
      case 'balanced': return k('balanced');
      case 'divided': return k('divided');
      case 'oneBag': return k('oneBag', { v: n.v });
      default: return null;
    }
  };
  const toneClass = { ko: 'text-rose-800', tip: 'text-amber-800', ok: 'text-emerald-800', info: 'text-sky-800' };
  const last = steps.at(-1);

  return (
    <ManipulationShell
      type="equation-balance"
      title={bidi(title ?? k('title'))}
      mission={mission ?? <MathText>{k('mission', { eq: B.equationTex(lab.start) })}</MathText>}
      lead={typeof lead === 'string' ? bidi(lead) : lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided={!!chain}
      hints={[k('hint1'), k('hint2'), k('hint3')].map((h) => <MathText key={h}>{h}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      representation={last && (
        <EquationDisplay tone={solved ? 'ok' : 'neutral'} tex={last.result} note={<MathText>{k('equivalentNote')}</MathText>} />
      )}
      discovery={(
        <ManipulationDiscovery
          state={state}
          prompt={k('discoveryPrompt')}
          options={discoveryOptions(k)}
          formal={<Formal lab={lab} k={k} />}
        />
      )}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/70 to-white" data-dragging={drag.dragging || stretch.dragging ? 'true' : undefined}>
        <div className="relative space-y-3" data-equation-balance data-eq={eq} data-tilt={tilt} data-solved={String(solved)}>
          {party.node}
          {cp.node}
          <LabStepper count={stepDone.length} current={Math.min(nDone, stepDone.length - 1)} done={stepDone} stepAttr="data-eb-step" />
          {/* ── la balance ── */}
          <div className="mx-auto w-full max-w-[720px]" dir="ltr">
            <div className="relative w-full" style={{ aspectRatio: `${W} / ${H}` }} data-balance-scene>
              <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
                {/* vestiaire : mur, casiers, sol */}
                <rect x={0} y={0} width={W} height={H} fill="#F8FAFC" />
                {Array.from({ length: 8 }, (_, i) => (
                  <g key={i} opacity={0.5}>
                    <rect x={8 + i * 79} y={6} width={70} height={Math.min(120, H * 0.35)} rx={4} fill="#E0F2FE" stroke="#BAE6FD" />
                    <circle cx={8 + i * 79 + 60} cy={6 + Math.min(120, H * 0.35) / 2} r={2.5} fill="#7DD3FC" />
                  </g>
                ))}
                <rect x={0} y={H - 24} width={W} height={24} fill="#CBD5E1" />
              </svg>
              {/* zones des plateaux (sous les objets saisissables) */}
              {B.SIDES.map((sd) => (
                <div key={sd} className="absolute" style={{ left: pct(CX[sd] - PW / 2 - 6, W), width: pct(PW + 12, W), top: pct(Math.max(0, py[sd] - contentH - 10), H), height: pct(contentH + 22, H) }}>
                  <DropZone drag={drag} id={`pan:${sd}`} tone="emerald" minHeight="min-h-0"
                    label={k('panZone', { side: k(sd === 'L' ? 'sideL' : 'sideR'), content: panWords(sd) })}
                    className="h-full w-full border-transparent bg-transparent" data-balance-zone={sd} />
                </div>
              ))}
              <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full" role="img"
                aria-label={k('ariaScene', { left: panWords('L'), right: panWords('R'), state: k(tilt === 0 ? 'stateLevel' : tilt > 0 ? 'stateLeftDown' : 'stateRightDown') })}>
                {/* pied et socle */}
                <rect x={PIVOT - 70} y={H - 34} width={140} height={14} rx={5} fill="#475569" />
                <rect x={PIVOT - 9} y={beamY} width={18} height={H - 34 - beamY} fill="#64748B" />
                {/* le fléau */}
                <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${PIVOT}px ${beamY}px`, transition: 'transform 500ms cubic-bezier(.3,1.4,.5,1)' }} className="motion-reduce:transition-none" data-balance-beam>
                  <rect x={PIVOT - ARM - 8} y={beamY - 5} width={2 * ARM + 16} height={10} rx={5} fill="#334155" />
                  <polygon points={`${PIVOT},${beamY - 26} ${PIVOT - 6},${beamY - 4} ${PIVOT + 6},${beamY - 4}`} fill={tilt === 0 ? '#10B981' : '#F59E0B'} data-balance-needle />
                </g>
                <circle cx={PIVOT} cy={beamY} r={8} fill="#0F172A" />
                {/* les plateaux (Roberval : ils restent horizontaux, montent ou descendent) */}
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
              {/* objets saisissables : un par sorte et par plateau, posé sur son groupe */}
              {B.SIDES.flatMap((sd) => KINDS.filter((kind) => has(sd, kind)).map((kind) => {
                const b = boxOf(sd, kind);
                const id = `p:${sd}:${kind}`;
                return (
                  <div key={id} className="absolute flex items-center justify-center" {...intercept(id)}
                    style={{ left: pct((b.x0 + b.x1) / 2, W), top: pct((b.y0 + b.y1) / 2, H), width: pct(b.x1 - b.x0, W), height: pct(b.y1 - b.y0, H), transform: 'translate(-50%, -50%)', minWidth: 44, minHeight: 44 }}>
                    <DraggableObject drag={drag} id={id} label={k('takeFrom', { what: k(`kind_${kind}`), side: k(sd === 'L' ? 'sideL' : 'sideR') })}
                      className="h-full w-full rounded-xl bg-transparent hover:bg-white/30" />
                  </div>
                );
              }))}
              {/* décor : un ballon au sol qu'on peut taper (aucun effet mathématique) */}
              <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => setHop((n) => n + 1)} data-decor-ball
                className="absolute h-8 w-8 -translate-x-1/2 rounded-full transition-transform duration-300 ease-out motion-reduce:transition-none"
                style={{ left: pct(W - 40, W), top: pct(H - 46, H), transform: `translate(-50%, ${hop % 2 ? '-60%' : '0'}) rotate(${hop * 90}deg)` }}>
                <svg viewBox="-12 -12 24 24" className="h-full w-full" aria-hidden="true" focusable="false"><Ball x={0} y={0} s={26} /></svg>
              </button>
            </div>
          </div>

          {/* ── contenus lisibles (et leurs comptes) ── */}
          <div className="grid grid-cols-2 gap-2 text-sm" data-balance-counts>
            {B.SIDES.map((sd) => (
              <p key={sd} className="rounded-lg bg-white px-2 py-1 text-slate-700" data-balance-count={sd}>
                <strong>{k(sd === 'L' ? 'sideL' : 'sideR')}:</strong> {panWords(sd)}
              </p>
            ))}
          </div>

          {/* ── la réserve ── */}
          <DropZone drag={drag} id="reserve" tone="slate" label={k('reserveZone')} minHeight="min-h-[64px]" className="p-2" data-balance-reserve>
            <p className="mb-1 text-xs font-bold text-slate-600">{k('reserve')}</p>
            <div className="flex flex-wrap gap-2">
              {['ball', 'balloon', 'bag', 'anti'].map((kind) => (
                <span key={kind} {...intercept(`r:${kind}`)}>
                  <DraggableObject drag={drag} id={`r:${kind}`} label={k('takeReserve', { what: k(`kind_${kind}`) })}
                    className="inline-flex min-h-[48px] items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white px-2 py-1 text-sm font-bold text-slate-800">
                    <Icon kind={kind} size={32} />
                    <span>{k(`kind_${kind}`)}</span>
                    <span dir="ltr" className="font-mono text-xs text-slate-500">{k(`value_${kind}`)}</span>
                  </DraggableObject>
                </span>
              ))}
            </div>
          </DropZone>

          {/* ── partager chaque plateau en k parts égales ── */}
          <div className="space-y-2 rounded-2xl border-2 border-violet-200 bg-violet-50/50 p-2" data-balance-divide>
            <p className="text-sm font-bold text-violet-900">{k('divideTitle')}</p>
            <div className="flex items-center gap-2" dir="ltr">
              <button type="button" onClick={() => stretch.nudge(-1)} aria-label={k('fewer')} disabled={kk <= 1}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Minus className="h-5 w-5" aria-hidden="true" /></button>
              <div {...stretch.trackProps} className="relative h-11 flex-1" style={{ ...stretch.trackProps.style }} data-balance-parts-track>
                <div className="absolute inset-x-[22px] top-1/2 h-1.5 -translate-y-1/2 rounded bg-violet-300" />
                <div {...stretch.handleProps({ label: k('partsHandle'), valueText: k('partsValue', { k: kk }) })}
                  className={`absolute top-0 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-xl border-2 font-mono font-extrabold outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${stretch.dragging ? 'border-blue-500 bg-blue-50' : 'border-violet-500 bg-white'}`}
                  style={{ left: `calc(22px + (100% - 44px) * ${(kk - 1) / (kMax - 1)})` }} data-balance-k>{kk}</div>
              </div>
              <button type="button" onClick={() => stretch.nudge(1)} aria-label={k('more')} disabled={kk >= kMax}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Plus className="h-5 w-5" aria-hidden="true" /></button>
            </div>
            {groups && (
              <div className="grid grid-cols-2 gap-2" data-balance-groups data-k={kk} data-ok={String(divOk === true)}>
                {B.SIDES.map((sd) => {
                  const g = groups[sd]; const p = lab.pans[sd];
                  const unitKind = B.toNumber(p.u) < 0 ? 'balloon' : 'ball';
                  return (
                    <div key={sd} className="rounded-xl border border-violet-200 bg-white p-1.5 text-xs" data-balance-group={sd}>
                      <p className="font-bold text-slate-600">{k('onePart', { side: k(sd === 'L' ? 'sideL' : 'sideR'), k: kk })}</p>
                      <div className="flex flex-wrap items-center gap-1" dir="ltr">
                        {g.a !== 0 && <span className="inline-flex items-center"><Icon kind={g.bagKind} size={22} /><span className="font-mono">×{Math.abs(g.a)}</span></span>}
                        {!B.toNumber(p.u) ? null : <span className="inline-flex items-center"><Icon kind={unitKind} size={22} /><span className="font-mono"><MathText>{`$\\times ${B.fracLatex(g.u).replace('-', '')}$`}</MathText></span></span>}
                        {g.a === 0 && !B.toNumber(p.u) && <span className="text-slate-400">—</span>}
                        {g.leftoverBags > 0 && (
                          <span className="inline-flex items-center rounded bg-rose-100 px-1 text-rose-800" data-balance-leftover>
                            <Icon kind={g.bagKind} size={20} /><span className="font-mono">×{g.leftoverBags}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button type="button" onClick={doDivide} disabled={parts < 2 || liveParts != null || B.canDivide(lab, parts) !== true} data-balance-divide-go
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-violet-600 px-4 font-bold text-white disabled:opacity-40 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300">
              <Scissors className="h-5 w-5" aria-hidden="true" /> <span>{k('keepOne', { k: parts })}</span>
            </button>
          </div>

          <p className="min-h-[1.25rem] text-sm font-semibold" aria-live="polite" data-balance-notice={notice?.key}>
            {notice && <span className={toneClass[notice.tone]}><MathText>{noticeText(notice)}</MathText></span>}
          </p>

          {/* ── les équations équivalentes, écrites après chaque étape faite des DEUX côtés ── */}
          <ol className="space-y-1 rounded-xl border-2 border-slate-200 bg-white p-2 text-sm" data-balance-steps>
            <li className="font-bold text-slate-800"><MathText>{`${k('startLine')} $${B.equationTex(lab.start)}$`}</MathText></li>
            {steps.map((st, i) => (
              <li key={i} className="space-y-0.5 border-t border-slate-100 pt-1" data-balance-step={i}>
                <p className="text-xs text-slate-500"><MathText>{k(st.key, { term: st.term })}</MathText></p>
                <p dir="ltr" className="text-start"><MathText>{`$${st.op}$`}</MathText></p>
                <p className="font-bold text-slate-900"><MathText>{`${k('ay')} $${st.result}$`}</MathText></p>
              </li>
            ))}
          </ol>

          {solved && (
            <div className="space-y-2" data-balance-verify>
              {!lab.verified ? (
                <button type="button" onClick={doVerify} data-balance-verify-go
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-600 px-4 font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300">
                  <SearchCheck className="h-5 w-5" aria-hidden="true" /> <span>{k('verify')}</span>
                </button>
              ) : (
                <EquationDisplay tone="ok"
                  tex={`${B.substitutedTex(lab.start.L, sub.x)} = ${B.fracLatex(sub.left)} \\qquad ${B.substitutedTex(lab.start.R, sub.x)} = ${B.fracLatex(sub.right)}`}
                  note={<MathText>{k('verifiedNote', { v: B.fracLatex(sub.x) })}</MathText>} />
              )}
            </div>
          )}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

const discoveryOptions = (k) => [
  { text: <MathText>{k('opt2')}</MathText>, why: <MathText>{k('why2')}</MathText> },
  { text: <MathText>{k('opt1')}</MathText>, correct: true },
  { text: <MathText>{k('opt3')}</MathText>, why: <MathText>{k('why3')}</MathText> },
];

function Formal({ lab, k }) {
  const sub = B.isSolved(lab) ? B.substitution(lab) : null;
  return (
    <div className="space-y-2" data-balance-formal>
      <EquationDisplay tone="result" tex={k('rule')} note={<MathText>{k('ruleNote')}</MathText>} />
      {sub && <EquationDisplay tone="neutral" tex={`${B.equationTex(lab.start)} \\;\\Rightarrow\\; x = ${B.fracLatex(sub.x)}`} note={<MathText>{k('yourCase')}</MathText>} />}
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite unique : la première étape, l'équation équivalente, le poids d'un sac, puis LA RÈGLE. */
export const CHAIN = Object.freeze(['same', 'equiv', 'value', 'rule']);

const $ = (x) => `$${x}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;

/** La valeur lue : le contenu d'un sac. */
const valueOf = (lab) => B.substitution(lab).x;
/** Les étapes de l'élève (la première est celle qui l'a fait pencher). */
const firstStep = (lab) => lab.history[1];

/** Un membre {a, u} de balance → polynôme, évalué en v. */
const evalPan = (p, v) => Lin.linAt(Lin.lin(p.a, p.u), v);

/**
 * Les mauvais poids d'un sac, chacun une erreur réelle : `sign` (le signe renversé), `nodiv` (la valeur d'avant le partage : le poids de k sacs),
 * `inv` (le quotient renversé), `off` (un ballon de trop). Écartés s'ils égalent la bonne valeur ou un autre.
 */
export function wrongValues(lab) {
  const v = valueOf(lab);
  const div = lab.history.filter((s) => s.kind === 'divide').at(-1);
  const cands = [
    { id: 'sign', val: Lin.isZero(v) ? null : Lin.neg(v) },
    { id: 'nodiv', val: div ? Lin.mul(v, div.k) : null },
    { id: 'inv', val: Lin.isZero(v) ? null : Lin.div(1, v) },
    { id: 'off', val: Lin.add(v, 1) },
  ];
  const out = [];
  for (const c of cands) {
    if (!c.val || Lin.eq(c.val, v) || out.some((o) => Lin.eq(o.val, c.val))) continue;
    out.push({ ...c, k: div?.k });
  }
  return out;
}

export const QUESTIONS = {
  same: (lab, k) => {
    const st = B.steps(lab)[0];
    const o = { op: k(st.key, { term: st.term }), term: $(st.term) };
    return {
      id: 'same', kind: 'choice', cols: 1,
      prompt: Cq(k, 'same.prompt', o),
      options: [
        { text: Cq(k, 'same.opposite'), why: Cq(k, 'same.whyOpposite', o) },
        { text: Cq(k, 'same.sameThing'), correct: true },
        { text: Cq(k, 'same.other'), why: Cq(k, 'same.whyOther', o) },
      ],
      hints: [Cq(k, 'same.hint1'), Cq(k, 'same.hint2', o)],
      explain: Cq(k, 'same.explain', o),
    };
  },
  equiv: (lab, k) => {
    const st = B.steps(lab)[0];
    const v = valueOf(lab);
    const after = firstStep(lab).after;
    const l = evalPan(after.L, v); const r = evalPan(after.R, v);
    const o = { first: $(st.result), start: $(B.equationTex(lab.start)), x: $(B.fracLatex(v)), l: $(B.fracLatex(l)), r: $(B.fracLatex(r)) };
    return {
      id: 'equiv', kind: 'choice', cols: 1,
      prompt: Cq(k, 'equiv.prompt', o),
      options: [
        { text: Cq(k, 'equiv.differ'), why: Cq(k, 'equiv.whyDiffer', o) },
        { text: Cq(k, 'equiv.equal'), correct: true },
        { text: Cq(k, 'equiv.onlyStart'), why: Cq(k, 'equiv.whyOnlyStart', o) },
      ],
      hints: [Cq(k, 'equiv.hint1', o), Cq(k, 'equiv.hint2', o)],
      explain: Cq(k, 'equiv.explain', o),
    };
  },
  value: (lab, k) => {
    const v = valueOf(lab);
    const wrong = wrongValues(lab).slice(0, 2);
    const o = { start: $(B.equationTex(lab.start)), k: wrong.find((w) => w.id === 'nodiv')?.k ?? '' };
    const why = (w) => Cq(k, `value.why.${w.id}`, { ...o, got: $(`x = ${B.fracLatex(w.val)}`), v: $(B.fracLatex(v)) });
    return {
      id: 'value', kind: 'choice', cols: 3,
      prompt: Cq(k, 'value.prompt', o),
      options: [
        { text: <MathText>{$(`x = ${B.fracLatex(wrong[0].val)}`)}</MathText>, why: why(wrong[0]) },
        { text: <MathText>{$(`x = ${B.fracLatex(v)}`)}</MathText>, correct: true },
        { text: <MathText>{$(`x = ${B.fracLatex(wrong[1].val)}`)}</MathText>, why: why(wrong[1]) },
      ],
      hints: [Cq(k, 'value.hint1'), Cq(k, 'value.hint2', o)],
      explain: Cq(k, 'value.explain', { ...o, v: $(B.fracLatex(v)), calc: $(B.substitutedTex(lab.start.L, v)), left: $(B.fracLatex(B.substitution(lab).left)) }),
    };
  },
  rule: (lab, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k('discoveryPrompt')}</MathText>,
    options: discoveryOptions(k),
    hints: [Cq(k, 'rule.hint1'), Cq(k, 'rule.hint2')],
    explain: <Formal lab={lab} k={k} />,
  }),
};
