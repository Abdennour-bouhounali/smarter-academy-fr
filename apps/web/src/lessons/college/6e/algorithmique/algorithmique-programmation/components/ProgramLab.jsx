import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Play, RotateCcw, SkipForward, HelpCircle } from 'lucide-react';
import { Feedback } from '../../../../../common/components/LessonUI';
import RobotWorld, { WorldReadout } from './RobotWorld';
import ProgramStrip, { InstructionPalette } from './ProgramStrip';
import { evaluateRun, instr, makeRepeat, formatProgram } from './algoUtils';

/**
 * ProgramLab — L'INTERACTION SIGNATURE de la leçon.
 *
 *   ÉCRIS → LANCE → REGARDE → CORRIGE → RELANCE
 *
 * ACTION          l'élève empile des instructions puis lance l'exécution.
 * TRANSFORMATION  ROBI exécute pas à pas ; la carte en cours est surlignée.
 * SENS            un programme est une SUITE ORDONNÉE d'instructions ; le
 *                 robot n'obéit qu'à elles, jamais à l'intention.
 * FEEDBACK        en cas d'échec, ROBI RESTE là où il s'est réellement
 *                 arrêté (contre le mur, ou sur la mauvaise case) : la
 *                 conséquence se voit avant d'être expliquée.
 * GÉNÉRALISATION  même programme → même trajet, toujours (déterminisme).
 *
 * CONTRATS RESPECTÉS
 *  §8   L'objectif RÉEL déclenche la complétion ; jamais le simple fait
 *       d'avoir posé des cartes. Les commandes restent vivantes après un
 *       échec, et une sortie de secours apparaît après `maxAttempts` essais.
 *  §10.10 `onRunComplete`/`onSolved` partent d'un EFFET, jamais d'un updater.
 *  §10.11 Le verdict s'affiche seulement quand le robot s'est arrêté.
 *  §10.12 useReducedMotion réduit le rejeu à l'image finale, sans changer la
 *       logique.
 */

const STEP_MS = 420;

export default function ProgramLab({
  world,
  mission = {},          // { maxCards, requireItems }
  allowed = ['AVANCER', 'GAUCHE', 'DROITE'],
  repeatBody = ['AVANCER'],  // corps par défaut d'une carte RÉPÉTER
  program,
  onProgramChange,
  onRunComplete,         // (result) => void — appelé après CHAQUE exécution
  solved = false,
  disabled = false,
  height,
  goal,                  // ReactNode — « Objectif : … » toujours affiché
  successNode,           // ReactNode — remplace le message de réussite
  failureNode,           // (result) => ReactNode — message d'échec sur mesure
  maxAttempts = 3,       // au-delà : sortie de secours
  solution = null,       // programme de référence, montré par la sortie de secours
  onReveal,              // () => void — l'élève a demandé la solution
  showStepCount = true,
  extraControls = null,
  pulsePalette = false,
}) {
  const reduced = useReducedMotion();
  const [cursor, setCursor] = useState(null);       // index du pas en cours de rejeu continu
  const [frameIndex, setFrameIndex] = useState(null); // image affichée en mode pas-à-pas
  const [result, setResult] = useState(null);       // résultat de l'exécution terminée
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const runRef = useRef(null);                  // résultat calculé au lancement
  const timer = useRef(null);
  const pendingRef = useRef(false);             // une exécution attend d'être remontée

  const locked = disabled || solved;
  const running = cursor !== null;

  useEffect(() => () => clearTimeout(timer.current), []);

  /* ── Rejeu image par image ─────────────────────────────────────── */
  useEffect(() => {
    if (cursor === null) return undefined;
    const run = runRef.current;
    if (!run) return undefined;

    if (cursor >= run.trace.length) {
      setCursor(null);
      pendingRef.current = true;      // remontée dans l'effet suivant, jamais ici
      setResult(run);
      return undefined;
    }

    timer.current = setTimeout(() => {
      setCursor((c) => (c === null ? null : c + 1));
    }, reduced ? 0 : STEP_MS);

    return () => clearTimeout(timer.current);
  }, [cursor, reduced]);

  /* ── Remontée du résultat : effet, jamais updater (§10.10) ─────── */
  useEffect(() => {
    if (!pendingRef.current || !result) return;
    pendingRef.current = false;
    setAttempts((a) => (result.success ? a : a + 1));
    onRunComplete?.(result);
  }, [result, onRunComplete]);

  const launch = useCallback(() => {
    if (locked || running || program.length === 0) return;
    runRef.current = evaluateRun(world, program, mission);
    setResult(null);
    setCursor(0);
  }, [locked, running, program, world, mission]);

  /**
   * Pas à pas : une instruction, puis on s'arrête — l'alternative NON animée
   * au rejeu continu (et le moyen d'observer chaque effet isolément).
   * Repart de zéro si l'exécution précédente est déjà terminée.
   */
  const stepOnce = () => {
    if (locked || running || program.length === 0) return;

    const restart = result !== null || runRef.current === null;
    const run = restart ? evaluateRun(world, program, mission) : runRef.current;
    runRef.current = run;

    const nextIndex = restart ? 1 : Math.min((frameIndex ?? 0) + 1, run.trace.length);
    if (restart) setResult(null);
    setFrameIndex(nextIndex);

    // Dernière image atteinte → le verdict tombe, comme après un rejeu complet.
    if (nextIndex >= run.trace.length) {
      pendingRef.current = true;
      setResult(run);
    }
  };

  const reset = () => {
    clearTimeout(timer.current);
    setCursor(null);
    setFrameIndex(null);
    setResult(null);
    runRef.current = null;
  };

  const addInstruction = (kind) => {
    if (locked || running) return;
    if (program.length >= (mission.maxCards ?? 14)) return;
    reset();
    onProgramChange([...program, kind === 'REPETER' ? makeRepeat(3, repeatBody.map(instr)) : instr(kind)]);
  };

  const changeProgram = (next) => {
    reset();
    onProgramChange(next);
  };

  const revealSolution = () => {
    if (!solution) return;
    reset();
    onProgramChange(solution);
    setRevealed(true);
    onReveal?.();
  };

  /* ── Image courante (rejeu continu, pas-à-pas, ou état final) ───
     `shownIndex` = nombre de pas déjà joués. null ⇒ on montre l'état final
     du dernier résultat, ou le départ si rien n'a encore tourné. */
  const activeRun = runRef.current;
  const frames = activeRun?.trace ?? [];
  const shownIndex = cursor !== null ? cursor : frameIndex;
  const playedCount = shownIndex != null ? Math.min(shownIndex, frames.length) : frames.length;
  const shownFrame = shownIndex != null && playedCount > 0 ? frames[playedCount - 1] : null;

  const pos = shownFrame ? shownFrame.pos : result ? result.final : world.start;

  // La trace n'est dessinée que si une exécution a eu lieu.
  const played = shownIndex != null || result !== null;
  const trail = played ? [world.start, ...frames.slice(0, playedCount).map((f) => f.pos)] : [];
  const collected = played
    ? frames.slice(0, playedCount).filter((f) => f.event === 'picked').map((f) => `${f.pos.col},${f.pos.row}`)
    : [];
  const isBlocked = shownFrame ? shownFrame.event === 'blocked' : !!result?.blocked;

  // Le surlignage ne vaut que pendant une exécution en cours.
  const inProgress = cursor !== null || (frameIndex !== null && result === null);
  const runningIndex = inProgress && shownFrame ? shownFrame.srcIndex : null;
  const runningIteration = inProgress && shownFrame ? shownFrame.iteration : null;

  const settled = !!result && !running;   // §10.11 : verdict après l'arrêt
  const canEscape = !!solution && attempts >= maxAttempts && !solved && !result?.success;

  const btn =
    'inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-xl border-2 font-mono text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 disabled:opacity-40';

  return (
    <div className="space-y-3" role="group" aria-label="Laboratoire de programmation">
      {goal && (
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
          <span className="font-space font-bold">🎯 Objectif : </span>
          {goal}
        </div>
      )}

      <RobotWorld
        world={world}
        pos={pos}
        trail={trail}
        collected={collected}
        blocked={isBlocked}
        height={height}
        reduced={reduced}
      />
      <WorldReadout pos={pos} blocked={isBlocked} />

      <ProgramStrip
        program={program}
        onChange={changeProgram}
        runningIndex={runningIndex}
        runningIteration={runningIteration}
        disabled={locked}
        maxCards={mission.maxCards ?? 14}
        showStepCount={showStepCount}
      />

      {!locked && (
        <InstructionPalette
          allowed={allowed}
          onAdd={addInstruction}
          disabled={running || program.length >= (mission.maxCards ?? 14)}
          pulse={pulsePalette && program.length === 0}
        />
      )}

      <div className="flex gap-2 flex-wrap items-center">
        <button
          type="button"
          onClick={launch}
          disabled={locked || running || program.length === 0}
          aria-label="Exécuter le programme"
          className={`${btn} border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-400`}
        >
          <Play className="w-4 h-4" aria-hidden="true" /> Exécuter
        </button>
        <button
          type="button"
          onClick={stepOnce}
          disabled={locked || running || program.length === 0}
          aria-label="Exécuter une seule instruction"
          className={`${btn} border-slate-300 bg-white text-slate-700 hover:border-slate-500 focus-visible:ring-slate-400`}
        >
          <SkipForward className="w-4 h-4" aria-hidden="true" /> Pas à pas
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={locked || running || (!result && frameIndex === null && program.length === 0)}
          aria-label="Remettre ROBI au départ"
          className={`${btn} border-slate-300 bg-white text-slate-700 hover:border-slate-500 focus-visible:ring-slate-400`}
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" /> Réinitialiser
        </button>
        {extraControls}
      </div>

      {/* ── Verdict, seulement une fois le robot arrêté (§10.11) ───── */}
      {settled && result.success && (
        <Feedback tone="ok">
          {successNode ?? (
            <>
              🎉 ROBI est arrivé ! Ton programme{' '}
              <strong className="font-mono">{formatProgram(program)}</strong> l’a mené au but.
            </>
          )}
        </Feedback>
      )}

      {settled && !result.success && (
        <Feedback tone="ko">
          {failureNode ? (
            failureNode(result)
          ) : result.blocked ? (
            <>
              💥 ROBI a heurté un obstacle à l’instruction{' '}
              <strong className="font-mono">n° {result.blockedAt + 1}</strong> et s’est arrêté là.
              Regarde vers où il était tourné, puis corrige ton programme.
            </>
          ) : !result.gotItems ? (
            <>
              ROBI s’est arrêté en colonne {result.final.col}, ligne {result.final.row}, mais il a oublié
              de <strong>ramasser</strong> quelque chose en chemin.
            </>
          ) : !result.withinCards ? (
            <>
              ROBI arrive bien au but, mais ton programme fait{' '}
              <strong className="font-mono">{program.length} cartes</strong> — la limite est{' '}
              <strong className="font-mono">{mission.maxCards}</strong>. Il faut l’écrire plus court.
            </>
          ) : (
            <>
              ROBI s’est arrêté en <strong className="font-mono">colonne {result.final.col}, ligne{' '}
              {result.final.row}</strong> — ce n’est pas le drapeau. Modifie une instruction et relance :
              le robot ne se casse pas.
            </>
          )}
        </Feedback>
      )}

      {/* ── Sortie de secours après plusieurs essais (§8) ──────────── */}
      {canEscape && !revealed && (
        <button
          type="button"
          onClick={revealSolution}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border-2 border-sky-300 bg-sky-50 text-sky-800 font-mono text-xs font-bold hover:border-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <HelpCircle className="w-4 h-4" aria-hidden="true" /> Je ne trouve pas — montre-moi
        </button>
      )}

      {revealed && (
        <Feedback tone="hint">
          Pas grave, on te le montre : voici un programme qui marche. Touche{' '}
          <strong>Exécuter</strong> pour le voir fonctionner, et compare-le au tien.
        </Feedback>
      )}
    </div>
  );
}
