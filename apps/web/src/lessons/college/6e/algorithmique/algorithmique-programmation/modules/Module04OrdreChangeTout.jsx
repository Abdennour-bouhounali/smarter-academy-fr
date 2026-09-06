import React, { useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Shuffle, Play } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProgramLab from '../components/ProgramLab';
import RobotWorld from '../components/RobotWorld';
import ProgramStrip from '../components/ProgramStrip';
import { makeWorld, instr, runProgram, formatProgram } from '../components/algoUtils';

/**
 * Module 4 — MANIPULATION : « L'ordre change tout » (P6, P5).
 *
 *   MÊMES CARTES → DEUX ORDRES → DEUX RÉSULTATS
 *
 * Aucune instruction nouvelle : toute la charge cognitive porte sur l'ORDRE.
 * Les deux programmes contiennent EXACTEMENT les mêmes cartes ; seul leur
 * ordre diffère. Les lancer côte à côte rend la différence indiscutable —
 * un QCM aurait permis de deviner.
 */

const W = makeWorld({
  cols: 5, rows: 4, step: 46,
  start: { col: 1, row: 0, heading: 0 },   // regarde vers le haut
  target: { col: 3, row: 2 },
});

/* Mêmes cartes, deux ordres — c'est le cœur du module. */
const CARDS = [instr('AVANCER'), instr('AVANCER'), instr('DROITE'), instr('AVANCER'), instr('AVANCER')];
const ORDER_A = CARDS;                                                        // ↑↑ puis →→
const ORDER_B = [instr('DROITE'), instr('AVANCER'), instr('AVANCER'), instr('AVANCER'), instr('AVANCER')]; // →→→→

/* ── Étape 1 : comparer deux ordres côte à côte ───────────────────── */
function SideBySide({ solved, onSolved, react }) {
  const reduced = useReducedMotion();
  const [ran, setRan] = useState(solved);

  const runA = runProgram(W, ORDER_A);
  const runB = runProgram(W, ORDER_B);

  const launch = () => {
    if (ran) return;
    setRan(true);
    react?.(true);
    onSolved?.();
  };

  const panel = (title, program, run, tone) => (
    <div className={`rounded-2xl border-2 p-3 space-y-2 ${tone}`}>
      <div className="font-space font-bold text-sm text-slate-800">{title}</div>
      <RobotWorld
        world={W}
        pos={ran ? run.final : W.start}
        trail={ran ? [W.start, ...run.trace.map((t) => t.pos)] : []}
        blocked={ran && run.blocked}
        height={reduced ? 150 : 165}
        reduced={reduced}
        label={`Programme ${title} : ROBI arrive colonne ${run.final.col}, ligne ${run.final.row}${
          run.blocked ? ', bloqué contre le bord' : ''
        }`}
      />
      <ProgramStrip
        program={program}
        onChange={() => {}}
        disabled
        title="Programme"
        showStepCount={false}
      />
      {ran && (
        <div className="text-center font-mono text-xs font-bold text-slate-700 tabular-nums">
          arrivée : colonne {run.final.col}, ligne {run.final.row}
          {run.final.col === W.target.col && run.final.row === W.target.row
            ? ' 🚩'
            : run.blocked
            ? ' 💥 bloqué'
            : ''}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-700">
        Ces deux programmes contiennent <strong>exactement les mêmes cartes</strong> : deux{' '}
        <span className="font-mono">AVANCER</span>, un <span className="font-mono">TOURNER →</span>,
        puis deux <span className="font-mono">AVANCER</span>. Seul l’<strong>ordre</strong> change.
        Vont-ils au même endroit ?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {panel('Programme A', ORDER_A, runA, ran ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-white')}
        {panel('Programme B', ORDER_B, runB, ran ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-white')}
      </div>

      {!ran && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={launch}
            className="inline-flex items-center gap-2 min-h-[52px] px-6 rounded-2xl bg-violet-600 text-white font-space font-bold text-base shadow-md hover:bg-violet-700 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <Play className="w-5 h-5" aria-hidden="true" /> Lancer les deux en même temps
          </button>
        </div>
      )}

      {ran && (
        <Feedback tone="ok">
          Les mêmes cartes, et pourtant deux arrivées différentes :{' '}
          <strong className="font-mono">colonne {runA.final.col}, ligne {runA.final.row}</strong> pour A,{' '}
          <strong className="font-mono">colonne {runB.final.col}, ligne {runB.final.row}</strong> pour B.
          👉 <strong>Dans un programme, l’ordre des instructions fait partie du sens.</strong> Changer
          l’ordre, c’est changer le programme.
        </Feedback>
      )}
    </div>
  );
}

/* ── Étape 3 : réordonner un programme donné ──────────────────────── */
const W_FIX = makeWorld({
  cols: 5, rows: 4, step: 48,
  start: { col: 0, row: 0, heading: 1 },
  target: { col: 2, row: 2 },
});

// Les bonnes cartes… dans le mauvais ordre. À remonter/descendre.
const SCRAMBLED = [
  instr('GAUCHE'),
  instr('AVANCER'),
  instr('AVANCER'),
  instr('AVANCER'),
  instr('AVANCER'),
];
const FIXED = [
  instr('AVANCER'), instr('AVANCER'),
  instr('GAUCHE'),
  instr('AVANCER'), instr('AVANCER'),
];

function ReorderMission({ solved, onSolved, react }) {
  const [program, setProgram] = useState(SCRAMBLED);

  return (
    <ProgramLab
      world={W_FIX}
      program={program}
      onProgramChange={setProgram}
      allowed={[]}                    // aucune carte à ajouter : on RÉORDONNE
      mission={{ maxCards: 5 }}
      solved={solved}
      height={190}
      goal={
        <>
          tu as déjà <strong>les bonnes cartes</strong>, mais dans le mauvais ordre. Utilise les
          flèches ↑ ↓ pour les remettre en place — sans en ajouter ni en supprimer.
        </>
      }
      solution={FIXED}
      successNode={
        <>
          🎉 Sans changer une seule carte, tu as changé le résultat. C’est tout le pouvoir de
          l’<strong>ordre</strong> : <strong className="font-mono">{formatProgram(program)}</strong>.
        </>
      }
      failureNode={(r) =>
        r.blocked ? (
          <>
            💥 ROBI sort du potager : il tourne <strong>trop tôt</strong>. Descends la carte{' '}
            <strong className="font-mono">TOURNER ←</strong> de quelques rangs, pour qu’il avance
            d’abord.
          </>
        ) : (
          <>
            ROBI arrive en{' '}
            <strong className="font-mono">colonne {r.final.col}, ligne {r.final.row}</strong> au lieu de{' '}
            <strong className="font-mono">colonne 2, ligne 2</strong>. Il doit avancer{' '}
            <strong>deux fois</strong> avant de tourner. Déplace la carte{' '}
            <strong className="font-mono">TOURNER ←</strong>.
          </>
        )
      }
      onRunComplete={(r) => {
        react?.(r.success);
        if (r.success && !solved) onSolved?.();
      }}
    />
  );
}

/* ══ Module ═══════════════════════════════════════════════════════════ */

export default function Module04OrdreChangeTout() {
  const [compareDone, setCompareDone] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [reorderDone, setReorderDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="L'ordre change tout"
      moduleSubtitle="Mêmes instructions, ordre différent : le robot n’arrive plus au même endroit."
      estimatedTime="10 min"
      brief={{
        tag: '🔀 Défi 04',
        title: 'Les mêmes cartes, deux résultats.',
        body: (
          <p>
            Si deux programmes contiennent exactement les mêmes instructions, font-ils forcément la
            même chose ? Vérifions-le.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Deux programmes, mêmes cartes',
          subtitle: 'Lance-les côte à côte.',
          done: compareDone,
          content: (kit) => (
            <div className="space-y-4">
              <SideBySide solved={compareDone} onSolved={() => setCompareDone(true)} react={kit.react} />
              {compareDone && (
                <KnowledgeBrick
                  id="ordre-compte"
                  variant="new"
                  lead="Mêmes cartes, deux arrivées différentes : ce n’est pas un bug, c’est une règle."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Ce que ça prouve',
          done: quizDone,
          content: (
            <TapQuestion
              prompt="Deux programmes ont exactement les mêmes instructions, mais pas dans le même ordre. Que peut-on dire ?"
              options={[
                'Ils donnent forcément le même résultat',
                'Ils peuvent donner des résultats différents',
                'Le deuxième ne fonctionnera pas',
              ]}
              correct={1}
              cols={1}
              solved={quizDone}
              explain="🎯 Oui. Un programme n'est pas un SAC d'instructions, c'est une SUITE : elles s'exécutent l'une après l'autre, et chacune part de l'état laissé par la précédente."
              explainWrong="Tu viens pourtant de le voir : les mêmes cartes, dans deux ordres différents, ont mené ROBI à deux cases différentes. L'ordre fait partie du programme."
              requires={['ordre-compte', 'sequence-algorithme', 'effet-instruction']}
              onAnswered={() => setQuizDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: '🔀 Remets-les dans le bon ordre',
          subtitle: 'Les bonnes cartes sont déjà là.',
          done: reorderDone,
          content: (kit) => (
            <ReorderMission solved={reorderDone} onSolved={() => setReorderDone(true)} react={kit.react} />
          ),
        },
      ]}
      footer={
        <div className="space-y-3">
          <KnowledgeSnapshot moduleNumber={4}>
            <strong>La suite.</strong> L'ordre fait partie du programme. Prochaine étape : que faire
            quand la même instruction doit revenir dix fois de suite ?
          </KnowledgeSnapshot>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Shuffle className="w-6 h-6 mx-auto text-violet-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Un programme est une SUITE, jamais un sac.
            </p>
          </div>
        </div>
      }
    />
  );
}
