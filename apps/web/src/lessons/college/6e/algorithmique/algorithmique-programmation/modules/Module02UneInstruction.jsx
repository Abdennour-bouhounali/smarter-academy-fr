import React, { useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Target } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RobotWorld, { WorldReadout } from '../components/RobotWorld';
import ProgramLab from '../components/ProgramLab';
import {
  makeWorld, instr, runProgram, describeHeading, headingArrow, INSTRUCTION_LABELS,
} from '../components/algoUtils';

/**
 * Module 2 — DÉCOUVERTE : « Une instruction, un effet » (P2, P5).
 *
 *   PRÉDIRE → EXÉCUTER → VÉRIFIER
 *
 * Chaque instruction est exécutée SEULE, depuis le même départ. L'élève
 * prédit d'abord le résultat sur la grille, puis lance — c'est la boucle
 * « programme → prédiction → exécution → vérification » du brief, et non un
 * QCM déguisé : la prédiction se pose EN TOUCHANT une case ou une direction.
 *
 * Misconception centrale visée : « TOURNER fait aussi avancer ». La
 * conséquence est rendue visible — la case ne change pas, seul le cône bouge.
 */

const W = makeWorld({
  cols: 5, rows: 4, step: 50,
  start: { col: 2, row: 1, heading: 0 },
});

/* ── Prédire la CASE d'arrivée en touchant la grille ─────────────── */
function PredictCell({ kind, solved, onSolved, react }) {
  const reduced = useReducedMotion();
  const [pick, setPick] = useState(null);      // {col,row} prédit
  const [ran, setRan] = useState(solved);
  const program = [instr(kind)];
  const { final } = runProgram(W, program);
  const [shown, setShown] = useState(solved ? final : W.start);

  const right = pick && pick.col === final.col && pick.row === final.row;

  const run = () => {
    if (!pick || ran) return;
    setShown(final);
    setRan(true);
    react?.(!!right);
    onSolved?.();
  };

  // Cases tapables : la prédiction est une MANIPULATION, pas un QCM.
  const cells = [];
  for (let row = 0; row < W.rows; row += 1) {
    for (let col = 0; col < W.cols; col += 1) cells.push({ col, row });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-700">
        ROBI part de la case <strong className="font-mono">colonne 2, ligne 1</strong>, tourné vers{' '}
        <strong>{describeHeading(W.start.heading)}</strong> {headingArrow(W.start.heading)}. Tu vas
        lui donner <strong>une seule</strong> instruction :{' '}
        <strong className="font-mono">{INSTRUCTION_LABELS[kind].label}</strong>.
      </p>

      <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-sky-50/60 via-white to-slate-50 px-3 py-4 space-y-3">
        <RobotWorld
          world={W}
          pos={shown}
          trail={ran ? [W.start, final] : []}
          ghost={!ran && pick ? pick : null}
          height={reduced ? 165 : 185}
          reduced={reduced}
        />
        <WorldReadout pos={shown} />

        {!ran && (
          <>
            <p className="text-xs font-mono uppercase tracking-wide text-slate-500 text-center">
              1. Touche la case où tu penses qu’il va arriver
            </p>
            <div
              className="grid gap-1 mx-auto max-w-[280px]"
              style={{ gridTemplateColumns: `repeat(${W.cols}, minmax(0,1fr))` }}
              role="group"
              aria-label="Choisis la case d’arrivée prédite"
            >
              {/* ligne du haut en premier : row décroissant */}
              {cells
                .slice()
                .sort((a, b) => b.row - a.row || a.col - b.col)
                .map((c) => {
                  const sel = pick && pick.col === c.col && pick.row === c.row;
                  return (
                    <button
                      key={`${c.col},${c.row}`}
                      type="button"
                      onClick={() => setPick(c)}
                      aria-label={`Prédire colonne ${c.col}, ligne ${c.row}`}
                      aria-pressed={sel}
                      className={`min-h-[44px] rounded-lg border-2 text-[10px] font-mono transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                        sel
                          ? 'border-sky-500 bg-sky-100 text-sky-800 font-bold'
                          : 'border-slate-200 bg-white text-slate-400 hover:border-sky-400'
                      }`}
                    >
                      {c.col},{c.row}
                    </button>
                  );
                })}
            </div>
          </>
        )}

        {!ran && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={run}
              disabled={!pick}
              className="inline-flex items-center gap-2 min-h-[48px] px-6 rounded-2xl bg-sky-600 text-white font-mono text-sm font-bold shadow-md hover:bg-sky-700 disabled:opacity-40 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <Target className="w-4 h-4" aria-hidden="true" /> 2. Exécuter {INSTRUCTION_LABELS[kind].label}
            </button>
          </div>
        )}
        {!pick && !ran && (
          <p className="text-center text-xs text-slate-400">Choisis d’abord une case.</p>
        )}
      </div>

      {ran && (
        <Feedback tone={right ? 'ok' : 'ko'}>
          {right ? (
            <>
              🎯 Bien vu ! <strong className="font-mono">{INSTRUCTION_LABELS[kind].label}</strong> l’a
              amené en <strong className="font-mono">colonne {final.col}, ligne {final.row}</strong>.
            </>
          ) : (
            <>
              Tu prédisais <strong className="font-mono">colonne {pick.col}, ligne {pick.row}</strong>,
              mais ROBI est en{' '}
              <strong className="font-mono">colonne {final.col}, ligne {final.row}</strong>.{' '}
              <strong className="font-mono">AVANCER</strong> le fait avancer d’<strong>une seule
              case</strong>, dans la direction où il regarde — ici {describeHeading(W.start.heading)}.
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}

/* ── TOURNER : la case ne change pas, seule la direction change ──── */
function TurnLab({ solved, onSolved, react }) {
  const reduced = useReducedMotion();
  const [pick, setPick] = useState(null);      // direction prédite (0..3)
  const [ran, setRan] = useState(solved);
  const { final } = runProgram(W, [instr('DROITE')]);
  const [shown, setShown] = useState(solved ? final : W.start);

  const right = pick === final.heading;
  const moved = final.col !== W.start.col || final.row !== W.start.row;

  const run = () => {
    if (pick == null || ran) return;
    setShown(final);
    setRan(true);
    react?.(right);
    onSolved?.();
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-700">
        Même départ, mais cette fois l’instruction est{' '}
        <strong className="font-mono">TOURNER →</strong>. Vers où ROBI va-t-il regarder ?
      </p>

      <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-sky-50/60 via-white to-slate-50 px-3 py-4 space-y-3">
        <RobotWorld world={W} pos={shown} height={reduced ? 165 : 185} reduced={reduced} />
        <WorldReadout pos={shown} />

        {!ran && (
          <>
            <p className="text-xs font-mono uppercase tracking-wide text-slate-500 text-center">
              Prédis la direction
            </p>
            <div className="flex justify-center gap-1.5" role="group" aria-label="Direction prédite">
              {[0, 1, 2, 3].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setPick(h)}
                  aria-label={`Prédire : tourné vers ${describeHeading(h)}`}
                  aria-pressed={pick === h}
                  className={`min-h-[52px] min-w-[52px] rounded-xl border-2 text-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                    pick === h
                      ? 'border-sky-500 bg-sky-100 text-sky-800'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-sky-400'
                  }`}
                >
                  {headingArrow(h)}
                </button>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={run}
                disabled={pick == null}
                className="inline-flex items-center gap-2 min-h-[48px] px-6 rounded-2xl bg-sky-600 text-white font-mono text-sm font-bold shadow-md hover:bg-sky-700 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                Exécuter TOURNER →
              </button>
            </div>
          </>
        )}
      </div>

      {ran && (
        <Feedback tone={right ? 'ok' : 'ko'}>
          {right ? '🎯 Exact ! ' : (
            <>
              Tu prédisais {headingArrow(pick)}, ROBI regarde {headingArrow(final.heading)}.{' '}
            </>
          )}
          Et surtout, regarde sa case :{' '}
          <strong className="font-mono">colonne {final.col}, ligne {final.row}</strong> —{' '}
          {moved ? 'elle a changé.' : (
            <strong>elle n’a pas changé du tout.</strong>
          )}{' '}
          <strong>TOURNER change la direction, jamais la case.</strong> Pour changer de case, il faut{' '}
          <strong className="font-mono">AVANCER</strong>.
        </Feedback>
      )}
    </div>
  );
}

/* ── Ramasser ─────────────────────────────────────────────────────── */
const W_PICK = makeWorld({
  cols: 4, rows: 2, step: 52,
  start: { col: 0, row: 0, heading: 1 },
  target: { col: 3, row: 0 },
  items: [{ col: 2, row: 0, emoji: '🥕' }],
});

function PickLab({ solved, onSolved, react }) {
  const [program, setProgram] = useState([]);

  return (
    <ProgramLab
      world={W_PICK}
      program={program}
      onProgramChange={setProgram}
      allowed={['AVANCER', 'RAMASSER']}
      mission={{ maxCards: 8 }}
      solved={solved}
      height={130}
      goal={<>ramasse la carotte 🥕 <strong>puis</strong> va au drapeau.</>}
      solution={[instr('AVANCER'), instr('AVANCER'), instr('RAMASSER'), instr('AVANCER')]}
      successNode={
        <>
          🎉 Parfait. <strong className="font-mono">RAMASSER</strong> n’agit que sur la case où ROBI se
          trouve <em>déjà</em> — il faut donc y être arrivé avant.
        </>
      }
      onRunComplete={(r) => {
        react?.(r.success);
        if (r.success && !solved) onSolved?.();
      }}
    />
  );
}

/* ══ Module ═══════════════════════════════════════════════════════════ */

export default function Module02UneInstruction() {
  const [advDone, setAdvDone] = useState(false);
  const [turnDone, setTurnDone] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [pickDone, setPickDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Une instruction, un effet"
      moduleSubtitle="Une seule instruction à la fois : prédis ce qu’elle fait, puis vérifie."
      estimatedTime="9 min"
      brief={{
        tag: '🔍 Défi 02',
        title: 'Que fait exactement chaque instruction ?',
        body: (
          <p>
            Avant d’écrire un vrai programme, il faut savoir ce que fait <strong>chaque</strong>{' '}
            instruction. À chaque fois : tu <strong>prédis</strong>, puis tu <strong>vérifies</strong>.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'AVANCER : où va-t-il arriver ?',
          done: advDone,
          content: (kit) => (
            <PredictCell kind="AVANCER" solved={advDone} onSolved={() => setAdvDone(true)} react={kit.react} />
          ),
        },
        {
          num: 2,
          title: 'TOURNER : et là, où va-t-il ?',
          subtitle: 'Attention au piège.',
          done: turnDone,
          content: (kit) => (
            <TurnLab solved={turnDone} onSolved={() => setTurnDone(true)} react={kit.react} />
          ),
        },
        {
          num: 3,
          title: 'Ce qu’il faut retenir',
          done: quizDone,
          content: (
            <TapQuestion
              prompt="ROBI est en colonne 1, ligne 1. Tu exécutes TOURNER → deux fois. Où est-il ?"
              options={[
                'En colonne 3, ligne 1 — il a avancé de 2 cases',
                'Toujours en colonne 1, ligne 1 — il a seulement tourné',
                'En colonne 1, ligne 3',
              ]}
              correct={1}
              cols={1}
              solved={quizDone}
              explain="🎯 Oui ! TOURNER ne déplace jamais ROBI. Deux TOURNER → le font faire un demi-tour sur place : même case, direction opposée."
              explainWrong="Attention : TOURNER ne fait que pivoter ROBI sur sa case. Aucun déplacement. Seul AVANCER change la case — c'est la confusion la plus fréquente."
              onAnswered={() => setQuizDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: '🥕 Une nouvelle instruction : RAMASSER',
          subtitle: 'Elle n’agit que là où ROBI se trouve.',
          done: pickDone,
          content: (kit) => (
            <PickLab solved={pickDone} onSolved={() => setPickDone(true)} react={kit.react} />
          ),
        },
      ]}
      footer={
        <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <p className="text-sm text-slate-300">
            Tu connais maintenant l’effet de chaque instruction.{' '}
            <strong className="text-white">AVANCER change la case, TOURNER change la direction.</strong>{' '}
            Prochaine étape : les enchaîner pour aller plus loin.
          </p>
        </div>
      }
    />
  );
}
