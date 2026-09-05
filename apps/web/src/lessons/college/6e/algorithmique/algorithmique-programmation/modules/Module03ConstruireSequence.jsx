import React, { useState } from 'react';
import { ListOrdered } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import ConceptCard from '../../../../../common/components/ConceptCard';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProgramLab from '../components/ProgramLab';
import { makeWorld, instr } from '../components/algoUtils';

/**
 * Module 3 — DÉCOUVERTE : « Construire une séquence » (P3, P4).
 *
 *   DÉCOUPER → ÉCRIRE → EXÉCUTER → AJUSTER
 *
 * L'élève doit d'abord DÉCOMPOSER le trajet en étapes (P3) : le chemin
 * demande un virage, donc un TOURNER. Puis il écrit la séquence complète
 * (P4) et la lance.
 *
 * C'est ICI que le mot « algorithme » est formalisé — après que l'élève en a
 * construit un. Le module 1 s'est arrêté à « instruction », le module 2 à
 * l'effet de chacune ; la formalisation arrive au bon moment (playbook §2).
 */

/* ── Étape 1 : un trajet à angle droit ────────────────────────────── */
const W_TURN = makeWorld({
  cols: 5, rows: 4, step: 50,
  start: { col: 0, row: 0, heading: 1 },   // regarde à droite
  target: { col: 2, row: 2 },
});

const SOLUTION_TURN = [
  instr('AVANCER'), instr('AVANCER'),
  instr('GAUCHE'),
  instr('AVANCER'), instr('AVANCER'),
];

function TurnRoute({ solved, onSolved, react }) {
  const [program, setProgram] = useState([]);

  return (
    <ProgramLab
      world={W_TURN}
      program={program}
      onProgramChange={setProgram}
      allowed={['AVANCER', 'GAUCHE', 'DROITE']}
      mission={{ maxCards: 10 }}
      solved={solved}
      height={200}
      pulsePalette
      goal={<>amène ROBI au drapeau. Attention : il n’est pas en face — il faudra tourner.</>}
      solution={SOLUTION_TURN}
      successNode={
        <>
          🎉 Bravo ! Tu as découpé le trajet en étapes :{' '}
          <strong>avancer</strong> jusqu’au virage, <strong>tourner</strong>, puis{' '}
          <strong>avancer</strong> encore. C’est exactement ce qu’on appelle{' '}
          <strong>décomposer un problème</strong>.
        </>
      }
      failureNode={(r) =>
        r.blocked ? (
          <>
            💥 ROBI a foncé dans le bord du potager. Avant d’avancer encore, il faut le faire{' '}
            <strong className="font-mono">TOURNER</strong> pour le remettre dans la bonne direction.
          </>
        ) : (
          <>
            ROBI s’est arrêté en{' '}
            <strong className="font-mono">colonne {r.final.col}, ligne {r.final.row}</strong>, le
            drapeau est en <strong className="font-mono">colonne 2, ligne 2</strong>. Combien de cases
            lui manque-t-il vers la droite ? Et vers le haut ? Ajoute les instructions qui manquent.
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

/* ── Étape 3 : un trajet plus long, avec obstacle à contourner ────── */
const W_LONG = makeWorld({
  cols: 6, rows: 4, step: 46,
  start: { col: 0, row: 0, heading: 1 },
  target: { col: 4, row: 2 },
  obstacles: [{ col: 2, row: 0 }, { col: 2, row: 1 }],
});

const SOLUTION_LONG = [
  instr('AVANCER'),
  instr('GAUCHE'), instr('AVANCER'), instr('AVANCER'),
  instr('DROITE'), instr('AVANCER'), instr('AVANCER'), instr('AVANCER'),
];

function LongRoute({ solved, onSolved, react }) {
  const [program, setProgram] = useState([]);

  return (
    <ProgramLab
      world={W_LONG}
      program={program}
      onProgramChange={setProgram}
      allowed={['AVANCER', 'GAUCHE', 'DROITE']}
      mission={{ maxCards: 14 }}
      solved={solved}
      height={185}
      goal={<>deux rochers 🪨 bloquent le passage. Trouve un chemin qui les contourne.</>}
      solution={SOLUTION_LONG}
      successNode={
        <>
          🎉 Excellent ! Tu as construit un <strong>algorithme</strong> : une suite d’instructions,
          dans un ordre précis, qui résout le problème. Et il en existe plusieurs qui marchent —
          le tien en fait partie.
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

export default function Module03ConstruireSequence() {
  const [turnDone, setTurnDone] = useState(false);
  const [wordDone, setWordDone] = useState(false);
  const [longDone, setLongDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Construire une séquence"
      moduleSubtitle="Découpe le trajet en étapes simples et écris ton premier algorithme."
      estimatedTime="10 min"
      brief={{
        tag: '🧩 Défi 03',
        title: 'Un trajet, plusieurs étapes.',
        body: (
          <p>
            Le drapeau n’est plus en face de ROBI. Pour l’atteindre, il va falloir{' '}
            <strong>découper le trajet</strong> en étapes simples, puis les enchaîner dans le bon ordre.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Le trajet en deux temps',
          subtitle: 'Avancer, tourner, avancer.',
          done: turnDone,
          content: (kit) => (
            <TurnRoute solved={turnDone} onSolved={() => setTurnDone(true)} react={kit.react} />
          ),
        },
        {
          num: 2,
          title: 'Ça porte un nom',
          done: wordDone,
          content: (
            <div className="space-y-3">
              <ConceptCard label="Le mot juste" emoji="📘" color="emerald">
                <p className="text-sm">
                  La suite d’instructions que tu viens d’écrire pour résoudre le problème s’appelle un{' '}
                  <strong>algorithme</strong>. Quand on l’écrit pour qu’une machine l’exécute, on parle
                  d’un <strong>programme</strong>.
                </p>
              </ConceptCard>
              <TapQuestion
                prompt="Parmi ces trois propositions, laquelle est un algorithme ?"
                options={[
                  '« Le drapeau est en colonne 2, ligne 2 »',
                  '« AVANCER, AVANCER, TOURNER ←, AVANCER, AVANCER »',
                  '« ROBI doit rejoindre le drapeau »',
                ]}
                correct={1}
                cols={1}
                solved={wordDone}
                explain="🎯 Oui : un algorithme est une SUITE D'INSTRUCTIONS ordonnées. Les deux autres décrivent une situation ou un but — mais ne disent pas quoi faire, étape par étape."
                explainWrong="Un algorithme, ce n'est ni une description de la situation, ni l'objectif : c'est la suite précise des instructions à exécuter, dans l'ordre."
                onAnswered={() => setWordDone(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: '🪨 Contourne les rochers',
          subtitle: 'Un vrai problème à décomposer.',
          done: longDone,
          content: (kit) => (
            <LongRoute solved={longDone} onSolved={() => setLongDone(true)} react={kit.react} />
          ),
        },
      ]}
      footer={
        <div className="space-y-3">
          <Feedback tone="info">
            💡 Astuce de programmeur : avant d’écrire, regarde le trajet et compte —{' '}
            « combien de cases tout droit ? où est le virage ? ». C’est ça, décomposer un problème.
          </Feedback>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <ListOrdered className="w-6 h-6 mx-auto text-emerald-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Tu sais écrire un algorithme. Mais est-ce que l’<strong className="text-white">ordre</strong>{' '}
              des instructions compte vraiment ? C’est la question du prochain module.
            </p>
          </div>
        </div>
      }
    />
  );
}
