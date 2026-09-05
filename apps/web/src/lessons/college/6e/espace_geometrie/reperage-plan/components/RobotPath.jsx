import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { RotateCcw, Play, Undo2 } from 'lucide-react';
import CoordGrid from './CoordGrid';
import { STEPS, runProgram, samePoint, formatCoords, describeDisplacement } from './reperageUtils';

/**
 * RobotPath — programmer un déplacement, puis le voir se dérouler.
 *
 * ACTION          l'élève empile des pas (→ ↑ ← ↓), puis lance le robot.
 * TRANSFORMATION  le robot parcourt le trajet nœud par nœud.
 * SENS MATH.      « 4 pas à droite puis 3 vers le haut » et « (4 ; 3) »
 *                 décrivent la même chose : un déplacement EST un couple.
 * FEEDBACK        s'il rate, le robot RESTE où il s'est arrêté, à côté du
 *                 drapeau, et l'écart est chiffré — la conséquence est visible.
 * GÉNÉRALISATION  le nombre de pas total est une SOMME (4+3=7), jamais un
 *                 produit — le piège classique.
 *
 * §10.10 : `onRunComplete` part d'un effet, à la fin de l'animation, JAMAIS
 * depuis un updater d'état. Le module décide ensuite lui-même d'appeler
 * `react`/`onSolved`.
 */
const MAX_PROGRAM = 12;

export default function RobotPath({
  grid,
  start,
  flag,
  program,
  onProgramChange,
  onRunComplete,
  allowedSteps = ['R', 'U'],
  disabled = false,
  solved = false,
  ariaLabel,
}) {
  const reduced = useReducedMotion();
  const [cursor, setCursor] = useState(null); // index en cours d'animation
  const timer = useRef(null);
  const landedRef = useRef(null);

  const fullPath = runProgram(start, program, grid);
  const landed = fullPath[fullPath.length - 1];
  const running = cursor !== null;
  const shownPath = running ? fullPath.slice(0, cursor + 1) : fullPath;
  const robot = shownPath[shownPath.length - 1];

  useEffect(() => () => clearTimeout(timer.current), []);

  // Déroulé pas à pas ; à la dernière étape, on remonte le résultat au module.
  useEffect(() => {
    if (cursor === null) return undefined;
    if (cursor >= fullPath.length - 1) {
      const finished = landedRef.current;
      setCursor(null);
      if (finished) onRunComplete?.(finished);
      return undefined;
    }
    timer.current = setTimeout(() => setCursor((c) => (c === null ? null : c + 1)), reduced ? 0 : 260);
    return () => clearTimeout(timer.current);
  }, [cursor, fullPath.length, onRunComplete, reduced]);

  const push = (key) => {
    if (disabled || running || solved || program.length >= MAX_PROGRAM) return;
    onProgramChange([...program, key]);
  };
  const undo = () => {
    if (disabled || running || solved) return;
    onProgramChange(program.slice(0, -1));
  };
  const clear = () => {
    if (disabled || running || solved) return;
    onProgramChange([]);
  };
  const run = () => {
    if (disabled || running || solved || program.length === 0) return;
    landedRef.current = landed;
    setCursor(0);
  };

  const reached = samePoint(landed, flag);
  const btn = 'min-h-[44px] min-w-[44px] px-3 rounded-xl border-2 font-mono font-bold text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40';

  return (
    <div className="space-y-3">
      <CoordGrid
        grid={grid}
        mode="display"
        point={robot}
        target={flag}
        trail={shownPath}
        overlay={[
          { col: start.col, row: start.row, emoji: '🏁', label: 'départ' },
          { col: flag.col, row: flag.row, emoji: '🚩', label: 'arrivée' },
        ]}
        showCoordsBadge={false}
        ariaLabel={
          ariaLabel ??
          `Quadrillage : le robot part de ${formatCoords(start)} et doit atteindre ${formatCoords(flag)}`
        }
      />

      {/* Le programme, lisible comme une suite d'ordres */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[11px] font-mono uppercase tracking-wide text-slate-500">
            Ton programme ({program.length}/{MAX_PROGRAM})
          </span>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            Robot en {formatCoords(robot)}
          </span>
        </div>

        <div className="flex gap-1.5 flex-wrap min-h-[36px]" role="list" aria-label="Suite des pas programmés">
          {program.length === 0 && (
            <span className="text-xs text-slate-400 italic self-center">
              Ajoute des pas avec les boutons ci-dessous.
            </span>
          )}
          {program.map((k, i) => (
            <span
              key={`${k}-${i}`}
              role="listitem"
              className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center font-bold ${
                running && i < (cursor ?? 0)
                  ? 'bg-violet-600 border-violet-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
              aria-label={STEPS[k].name}
            >
              {STEPS[k].label}
            </span>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {allowedSteps.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => push(k)}
              disabled={disabled || running || solved || program.length >= MAX_PROGRAM}
              className={`${btn} bg-white border-slate-300 text-slate-700 hover:border-violet-400`}
              aria-label={`Ajouter ${STEPS[k].name}`}
            >
              {STEPS[k].label}
            </button>
          ))}
          <button
            type="button" onClick={undo} disabled={disabled || running || solved || program.length === 0}
            className={`${btn} bg-white border-slate-300 text-slate-600`} aria-label="Retirer le dernier pas"
          >
            <Undo2 className="w-4 h-4 inline" aria-hidden="true" />
          </button>
          <button
            type="button" onClick={clear} disabled={disabled || running || solved || program.length === 0}
            className={`${btn} bg-white border-slate-300 text-slate-600`} aria-label="Effacer le programme"
          >
            <RotateCcw className="w-4 h-4 inline" aria-hidden="true" />
          </button>
          <button
            type="button" onClick={run} disabled={disabled || running || solved || program.length === 0}
            className={`${btn} flex-1 bg-violet-600 border-violet-700 text-white hover:bg-violet-700`}
          >
            <Play className="w-4 h-4 inline mr-1" aria-hidden="true" />
            {running ? 'En route…' : 'Lancer le robot'}
          </button>
        </div>
      </div>

      {/* Conséquence chiffrée : où le robot s'est arrêté, et ce qu'il manque */}
      {!running && program.length > 0 && !reached && (
        <p className="text-center text-sm text-slate-600" aria-live="polite">
          Le robot s’arrête en <span className="font-mono font-bold">{formatCoords(landed)}</span>. Pour
          rejoindre le drapeau, il faudrait encore {describeDisplacement(landed, flag)}.
        </p>
      )}
    </div>
  );
}
