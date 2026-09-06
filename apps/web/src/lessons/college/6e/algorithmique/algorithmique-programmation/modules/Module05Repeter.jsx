import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Repeat, ArrowRight } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProgramLab from '../components/ProgramLab';
import { makeWorld, instr, makeRepeat, runProgram, countSteps } from '../components/algoUtils';

/**
 * Module 5 — MANIPULATION : « Répéter sans tout réécrire » (P7).
 *
 *   SUBIR LA RÉPÉTITION → LA COMPRESSER → VÉRIFIER QUE C'EST IDENTIQUE
 *
 * L'élève écrit d'abord huit AVANCER à la main : c'est volontairement long.
 * La carte RÉPÉTER n'est proposée QU'APRÈS ce vécu — la boucle arrive comme
 * la solution à SON problème, jamais comme une notion annoncée.
 *
 * L'étape 2 est la démonstration de l'invariant central du modèle :
 *     RÉPÉTER n [corps]  ≡  n copies du corps
 * même trace, même arrivée, même nombre d'ACTIONS — mais bien moins de
 * cartes ÉCRITES. Le mot « boucle » n'arrive qu'ensuite (étape 3).
 */

/* ── Étape 1 : le couloir, à la main ──────────────────────────────── */
const CORRIDOR = makeWorld({
  cols: 9, rows: 2, step: 42,
  start: { col: 0, row: 0, heading: 1 },
  target: { col: 8, row: 0 },
});

function LongWay({ solved, onSolved, react }) {
  const [program, setProgram] = useState([]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-700">
        Le potager s’allonge : le drapeau est à <strong>8 cases</strong> de ROBI, tout droit. Écris le
        programme qui l’y amène — avec les cartes que tu connais.
      </p>
      <ProgramLab
        world={CORRIDOR}
        program={program}
        onProgramChange={setProgram}
        allowed={['AVANCER']}
        mission={{ maxCards: 14 }}
        solved={solved}
        height={110}
        goal={<>huit cases tout droit. (Oui, ça fait beaucoup de cartes…)</>}
        solution={Array.from({ length: 8 }, () => instr('AVANCER'))}
        successNode={
          <>
            🎉 ROBI y est ! Mais regarde ton programme :{' '}
            <strong>8 cartes identiques</strong> à la suite. Un peu pénible à écrire, non ? Et s’il
            fallait avancer de 50 cases ?
          </>
        }
        onRunComplete={(r) => {
          react?.(r.success);
          if (r.success && !solved) onSolved?.();
        }}
      />
    </div>
  );
}

/* ── Étape 2 : la compression, et la preuve que c'est identique ───── */
const LONG_PROGRAM = Array.from({ length: 8 }, () => instr('AVANCER'));
const LOOP_PROGRAM = [makeRepeat(8, [instr('AVANCER')])];

function CompressLab({ solved, onSolved, react }) {
  const reduced = useReducedMotion();
  const [compressed, setCompressed] = useState(solved);
  const [ran, setRan] = useState(solved);

  const runLong = runProgram(CORRIDOR, LONG_PROGRAM);
  const runLoop = runProgram(CORRIDOR, LOOP_PROGRAM);
  const identical =
    runLong.final.col === runLoop.final.col &&
    runLong.final.row === runLoop.final.row &&
    runLong.steps === runLoop.steps;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700">
        Voici une nouvelle carte : <strong className="font-mono">RÉPÉTER</strong>. Elle exécute
        plusieurs fois de suite ce qu’elle contient. Remplaçons tes 8 cartes par une seule.
      </p>

      {/* les deux écritures, face à face */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-wide text-slate-500">
            Ce que tu as écrit
          </div>
          <div className="flex flex-wrap gap-1">
            {LONG_PROGRAM.map((_, i) => (
              <motion.span
                key={i}
                initial={false}
                animate={compressed && !reduced ? { opacity: 0.25, scale: 0.9 } : { opacity: 1, scale: 1 }}
                transition={{ delay: reduced ? 0 : i * 0.05, duration: 0.3 }}
                className="inline-flex items-center rounded-lg border-2 border-indigo-300 bg-indigo-50 px-2 py-1 font-mono text-[10px] font-bold text-indigo-800"
              >
                ⬆ AVANCER
              </motion.span>
            ))}
          </div>
          <div className="text-[11px] font-mono text-slate-500 tabular-nums">
            8 cartes écrites · {countSteps(LONG_PROGRAM)} actions
          </div>
        </div>

        <div className="flex justify-center text-slate-400" aria-hidden="true">
          <ArrowRight className="w-6 h-6 rotate-90 sm:rotate-0" />
        </div>

        <div className="rounded-2xl border-2 border-purple-300 bg-purple-50/50 p-3 space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-wide text-purple-600">
            Avec RÉPÉTER
          </div>
          <motion.div
            initial={false}
            animate={compressed ? { scale: [0.9, 1.04, 1] } : { scale: 1 }}
            transition={{ duration: reduced ? 0 : 0.45 }}
            className="inline-flex items-center rounded-lg border-2 border-purple-400 bg-white px-2.5 py-1.5 font-mono text-[11px] font-bold text-purple-800"
          >
            🔁 RÉPÉTER 8 FOIS (⬆ AVANCER)
          </motion.div>
          <div className="text-[11px] font-mono text-purple-700 tabular-nums">
            1 carte écrite · {countSteps(LOOP_PROGRAM)} actions
          </div>
        </div>
      </div>

      {!compressed && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => { setCompressed(true); react?.(true); }}
            className="inline-flex items-center gap-2 min-h-[52px] px-6 rounded-2xl bg-purple-600 text-white font-space font-bold text-base shadow-md hover:bg-purple-700 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          >
            <Repeat className="w-5 h-5" aria-hidden="true" /> Compresser en une seule carte
          </button>
        </div>
      )}

      {/* la preuve : même exécution */}
      {compressed && !ran && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => { setRan(true); react?.(true); onSolved?.(); }}
            className="inline-flex items-center gap-2 min-h-[48px] px-6 rounded-2xl bg-slate-800 text-white font-mono text-sm font-bold shadow-md hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          >
            Vérifier : est-ce vraiment pareil ?
          </button>
        </div>
      )}

      {ran && (
        <Feedback tone={identical ? 'ok' : 'ko'}>
          Les deux programmes amènent ROBI <strong className="font-mono">
            colonne {runLoop.final.col}, ligne {runLoop.final.row}
          </strong>, en <strong>{runLoop.steps} actions</strong> chacun. Exactement le même trajet.
          <br />
          👉 <strong>RÉPÉTER ne change pas ce que fait le robot : ça change ce que tu écris.</strong>{' '}
          8 cartes deviennent 1, pour 8 actions identiques.
        </Feedback>
      )}
    </div>
  );
}

/* ── Étape 4 : mission avec limite de cartes → la boucle est nécessaire ── */
const W_SQUARE = makeWorld({
  cols: 7, rows: 3, step: 44,
  start: { col: 0, row: 0, heading: 1 },
  target: { col: 6, row: 0 },
});

function LoopMission({ solved, onSolved, react }) {
  const [program, setProgram] = useState([]);

  return (
    <ProgramLab
      world={W_SQUARE}
      program={program}
      onProgramChange={setProgram}
      allowed={['AVANCER', 'REPETER', 'DROITE', 'GAUCHE']}
      repeatBody={['AVANCER']}
      mission={{ maxCards: 2 }}
      solved={solved}
      height={125}
      goal={
        <>
          six cases tout droit, mais <strong>2 cartes maximum</strong> dans ton programme. Règle le
          nombre de répétitions avec les boutons <span className="font-mono">−</span> et{' '}
          <span className="font-mono">+</span>.
        </>
      }
      solution={[makeRepeat(6, [instr('AVANCER')])]}
      successNode={
        <>
          🎉 Une seule carte pour six actions ! C’est exactement à ça que sert une répétition :
          écrire court, faire long.
        </>
      }
      failureNode={(r) =>
        !r.withinCards ? (
          <>
            Ton programme fait <strong className="font-mono">{program.length} cartes</strong>, la
            limite est <strong className="font-mono">2</strong>. Utilise une carte{' '}
            <strong className="font-mono">🔁 RÉPÉTER</strong> et règle son nombre avec −/+.
          </>
        ) : (
          <>
            ROBI s’arrête en <strong className="font-mono">colonne {r.final.col}</strong>, le drapeau
            est en <strong className="font-mono">colonne 6</strong>. Compte les cases qui restent et
            ajuste le nombre de répétitions avec <span className="font-mono">−</span> /{' '}
            <span className="font-mono">+</span>.
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

export default function Module05Repeter() {
  const [longDone, setLongDone] = useState(false);
  const [compressDone, setCompressDone] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [loopDone, setLoopDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Répéter sans tout réécrire"
      moduleSubtitle="Huit fois la même instruction… ou une seule carte RÉPÉTER ?"
      estimatedTime="11 min"
      brief={{
        tag: '🔁 Défi 05',
        title: 'Huit fois la même chose.',
        body: (
          <p>
            Quand la même instruction revient encore et encore, les programmeurs ont trouvé un
            raccourci. Commence par écrire le programme « à la main » — tu verras vite le problème.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Le long couloir',
          subtitle: 'Huit cases, à la main.',
          done: longDone,
          content: (kit) => (
            <LongWay solved={longDone} onSolved={() => setLongDone(true)} react={kit.react} />
          ),
        },
        {
          num: 2,
          title: 'Le raccourci',
          subtitle: 'Une carte à la place de huit — mais est-ce vraiment pareil ?',
          done: compressDone,
          content: (kit) => (
            <CompressLab
              solved={compressDone}
              onSolved={() => setCompressDone(true)}
              react={kit.react}
            />
          ),
        },
        {
          num: 3,
          title: 'Ça porte un nom',
          done: quizDone,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="boucle"
                variant="new"
                lead="La carte que tu viens d’utiliser à la place des huit autres porte un nom."
              />
              <KnowledgeBrick
                id="ecrire-vs-executer"
                variant="new"
                lead="Et le programme a beau être plus court, ROBI n’a pas fait un pas de moins."
              />
              <TapQuestion
                prompt="Le programme « RÉPÉTER 5 FOIS (AVANCER) » — combien ROBI fait-il d’actions ?"
                options={['1 action', '5 actions', '6 actions']}
                correct={1}
                cols={3}
                solved={quizDone}
                explain="🎯 Oui : 1 carte ÉCRITE, mais 5 actions EXÉCUTÉES. C'est toute la différence entre ce qu'on écrit et ce que le robot fait."
                explainWrong="Attention à ne pas confondre : la carte RÉPÉTER 5 FOIS est écrite une seule fois, mais le robot exécute bien 5 AVANCER — donc il avance de 5 cases."
                requires={['boucle', 'ecrire-vs-executer']}
                onAnswered={() => setQuizDone(true)}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: '🎯 Deux cartes, pas une de plus',
          subtitle: 'Cette fois, la boucle est obligatoire.',
          done: loopDone,
          content: (kit) => (
            <LoopMission solved={loopDone} onSolved={() => setLoopDone(true)} react={kit.react} />
          ),
        },
      ]}
      footer={
        <div className="space-y-3">
          <KnowledgeSnapshot moduleNumber={5}>
            <strong>La suite.</strong> Tu écris moins, ROBI fait autant. Prochaine étape : que faire
            quand un programme, lui, ne fait pas du tout ce qu'on voulait ?
          </KnowledgeSnapshot>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Repeat className="w-6 h-6 mx-auto text-purple-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Une carte écrite, plusieurs actions exécutées.
            </p>
          </div>
        </div>
      }
    />
  );
}
