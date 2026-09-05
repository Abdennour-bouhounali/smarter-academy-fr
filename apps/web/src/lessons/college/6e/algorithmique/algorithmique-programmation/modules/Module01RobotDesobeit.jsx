import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Bot, MessageSquare } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProgramLab from '../components/ProgramLab';
import RobotWorld, { WorldReadout } from '../components/RobotWorld';
import { makeWorld, instr, runProgram } from '../components/algoUtils';

/**
 * Module 1 — DÉCLENCHEUR : « Le robot n'obéit pas » (P1, P2).
 *
 *   DIRE → RIEN → INSTRUIRE → ÇA BOUGE → COMPRENDRE
 *
 * Conflit cognitif : l'élève commence par DIRE le but (« va au drapeau »).
 * ROBI ne bouge pas — il n'a reçu aucune instruction. La découverte est :
 *
 *      OBJECTIF ≠ PROGRAMME
 *
 * Le mot « instruction » est introduit ICI, après le geste. Le mot
 * « algorithme » ne l'est PAS : c'est le module 3 qui existe pour le faire
 * découvrir (playbook §2 — ne pas expliquer en M1 ce que M3 doit révéler).
 */

/* ══ Étape 1 — dire ne suffit pas ═════════════════════════════════════ */

const WORLD_1 = makeWorld({
  cols: 4, rows: 3, step: 54,
  start: { col: 0, row: 1, heading: 1 },
  target: { col: 2, row: 1 },
});

const SAYINGS = [
  'Va au drapeau !',
  'Avance jusqu’à la fleur !',
  'Tu vois bien où il faut aller…',
];

function TalkToRobot({ solved, onSolved, react }) {
  const reduced = useReducedMotion();
  const [tries, setTries] = useState(solved ? SAYINGS.length : 0);
  const [shrug, setShrug] = useState(false);
  const [program, setProgram] = useState([]);
  const [pos, setPos] = useState(WORLD_1.start);
  const [ran, setRan] = useState(false);

  const saidEnough = tries >= 2;

  const say = (i) => {
    if (i >= SAYINGS.length) return;
    setTries((t) => Math.max(t, i + 1));
    setShrug(true);
    react?.(false);
    setTimeout(() => setShrug(false), reduced ? 60 : 900);
  };

  // Le seul geste qui marche : donner une instruction.
  const pushInstruction = () => {
    const next = [...program, instr('AVANCER')];
    setProgram(next);
    const { final } = runProgram(WORLD_1, next);
    setPos(final);
    setRan(true);
    const arrived = final.col === WORLD_1.target.col && final.row === WORLD_1.target.row;
    react?.(true);
    if (arrived && !solved) onSolved?.();
  };

  const arrived = pos.col === WORLD_1.target.col && pos.row === WORLD_1.target.row;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700">
        Voici <strong>ROBI</strong>, le robot du potager de l’école. Le drapeau est à deux cases de lui.
        Commence par lui <strong>dire</strong> d’y aller.
      </p>

      <div className="relative rounded-3xl border border-slate-200 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50 px-3 py-5">
        <RobotWorld world={WORLD_1} pos={pos} height={reduced ? 150 : 170} reduced={reduced} />
        <WorldReadout pos={pos} />

        <AnimatePresence>
          {shrug && (
            <motion.div
              key="shrug"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 text-center font-space font-extrabold text-lg text-slate-700"
            >
              🤷 « Je ne comprends pas… »
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 1. parler — ça ne marche jamais */}
      {!arrived && (
        <div className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-wide text-slate-500">
            Parle à ROBI
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {SAYINGS.map((s, i) => (
              <button
                key={s}
                type="button"
                disabled={i > tries}
                onClick={() => say(i)}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl border-2 border-slate-300 bg-white text-slate-700 text-xs font-medium hover:border-slate-500 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" /> « {s} »
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. après 2 essais : l'instruction apparaît */}
      {saidEnough && !arrived && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <Feedback tone="hint">
            ROBI ne comprend pas ce que tu <strong>veux</strong>. Il ne comprend que des ordres très
            précis, qu’on appelle des <strong>instructions</strong>. Essaie celle-ci :
          </Feedback>
          <button
            type="button"
            onClick={pushInstruction}
            className="inline-flex items-center gap-2 min-h-[52px] px-6 rounded-2xl bg-indigo-600 text-white font-mono text-sm font-bold shadow-md hover:bg-indigo-700 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <span aria-hidden="true">⬆</span> AVANCER
          </button>
          {ran && !arrived && (
            <p className="text-sm text-slate-600">
              Il a bougé d’<strong>une seule case</strong> ! Touche encore <strong>AVANCER</strong>.
            </p>
          )}
        </motion.div>
      )}

      {arrived && (
        <Feedback tone="ok">
          🎉 ROBI est sur le drapeau ! Tu ne lui as pas dit <em>où aller</em> : tu lui as donné des{' '}
          <strong>instructions</strong>, une par une. C’est la seule chose qu’un robot comprenne.
        </Feedback>
      )}
    </div>
  );
}

/* ══ Étape 3 — première mission libre ═════════════════════════════════ */

const WORLD_2 = makeWorld({
  cols: 5, rows: 4, step: 50,
  start: { col: 0, row: 0, heading: 1 },
  target: { col: 3, row: 0 },
});

function FirstMission({ solved, onSolved, react }) {
  const [program, setProgram] = useState([]);

  return (
    <ProgramLab
      world={WORLD_2}
      program={program}
      onProgramChange={setProgram}
      allowed={['AVANCER']}
      mission={{ maxCards: 6 }}
      solved={solved}
      height={190}
      pulsePalette
      goal={<>amène ROBI jusqu’au drapeau, 3 cases devant lui.</>}
      solution={[instr('AVANCER'), instr('AVANCER'), instr('AVANCER')]}
      successNode={
        <>
          🎉 Trois fois <strong className="font-mono">AVANCER</strong> : ROBI y est. Une suite
          d’instructions, exécutée dans l’ordre — voilà ce qu’est un <strong>programme</strong>.
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

export default function Module01RobotDesobeit() {
  const [talkDone, setTalkDone] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [missionDone, setMissionDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le robot n'obéit pas"
      moduleSubtitle="Tu lui dis où aller… et il ne bouge pas. Que comprend-il vraiment ?"
      estimatedTime="8 min"
      brief={{
        tag: '🤖 Défi 01',
        title: 'ROBI ne fait pas ce que tu veux.',
        body: (
          <p>
            Il fait ce que tu lui <strong>dis</strong> — et seulement si tu le dis dans sa langue.
            Découvre pourquoi dire « va au drapeau » ne suffit pas.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Dis-lui d’aller au drapeau',
          subtitle: 'Parle-lui. Regarde ce qu’il fait.',
          done: talkDone,
          content: (kit) => (
            <TalkToRobot solved={talkDone} onSolved={() => setTalkDone(true)} react={kit.react} />
          ),
        },
        {
          num: 2,
          title: 'Pourquoi ça n’a pas marché ?',
          done: quizDone,
          content: (
            <TapQuestion
              prompt="ROBI n’a pas bougé quand tu lui as dit « va au drapeau ». Pourquoi ?"
              options={[
                'Parce qu’il est cassé',
                'Parce qu’il n’a pas reçu d’instruction qu’il comprend',
                'Parce que le drapeau est trop loin',
              ]}
              correct={1}
              cols={1}
              solved={quizDone}
              explain="🎯 Exactement. « Va au drapeau », c'est un OBJECTIF. ROBI, lui, n'exécute que des INSTRUCTIONS précises comme AVANCER. À toi de traduire l'objectif en instructions."
              explainWrong="ROBI n'est pas cassé, et la distance n'y change rien : il a très bien avancé dès que tu lui as donné l'instruction AVANCER. Un objectif n'est pas une instruction — c'est à toi de faire la traduction."
              onAnswered={() => setQuizDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: '🎯 À toi de le programmer',
          subtitle: 'Trois cases cette fois. Construis la suite d’instructions.',
          done: missionDone,
          content: (kit) => (
            <FirstMission
              solved={missionDone}
              onSolved={() => setMissionDone(true)}
              react={kit.react}
            />
          ),
        },
      ]}
      footer={
        <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <Bot className="w-6 h-6 mx-auto text-indigo-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Tu as découvert le plus important : <strong className="text-white">un objectif n’est pas
            un programme</strong>. Prochaine étape : regarder de près ce que fait chaque instruction.
          </p>
        </div>
      }
    />
  );
}
