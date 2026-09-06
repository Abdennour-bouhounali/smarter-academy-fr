import React, { useState } from 'react';
import { Wrench, Bug } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProgramLab from '../components/ProgramLab';
import { makeWorld, instr, makeRepeat } from '../components/algoUtils';

/**
 * Module 6 — FORMALISATION : « Réparer un programme » (P8, P9, P10).
 *
 *   MODIFIER (P8) → REPÉRER L'ERREUR (P9) → CORRIGER (P10)
 *
 * Étape 1 : le programme MARCHE, mais l'objectif change. On le MODIFIE au
 * lieu de le réécrire — l'idée qu'un programme s'édite et se réutilise.
 *
 * Étape 2 : un programme buggé. L'élève le lance, VOIT où ROBI quitte le bon
 * chemin, formule une hypothèse et corrige UNE instruction. Rien n'est
 * colorié en rouge d'avance (le brief l'interdit explicitement) : c'est le
 * comportement observé qui désigne l'erreur.
 *
 * Le module porte la carte « À retenir » de la leçon, construite à partir des
 * gestes déjà faits — jamais avant eux.
 */

/* ── Étape 1 : le but change, le programme reste ──────────────────── */
const W_EDIT = makeWorld({
  cols: 6, rows: 3, step: 46,
  start: { col: 0, row: 0, heading: 1 },
  target: { col: 5, row: 0 },     // le drapeau a été déplacé : 3 → 5
});

// Le programme « d'hier » : il menait au drapeau quand il était en colonne 3.
const YESTERDAY = [makeRepeat(3, [instr('AVANCER')])];

function EditMission({ solved, onSolved, react }) {
  const [program, setProgram] = useState(YESTERDAY);

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-700">
        Hier, ce programme amenait ROBI au drapeau. Mais le jardinier a{' '}
        <strong>déplacé le drapeau</strong> : il est maintenant en{' '}
        <strong className="font-mono">colonne 5</strong>. Ne réécris pas tout —{' '}
        <strong>modifie</strong> le programme existant.
      </p>
      <ProgramLab
        world={W_EDIT}
        program={program}
        onProgramChange={setProgram}
        allowed={['AVANCER', 'REPETER', 'DROITE', 'GAUCHE']}
        mission={{ maxCards: 4 }}
        solved={solved}
        height={130}
        goal={<>adapte le programme d’hier au nouveau drapeau, sans repartir de zéro.</>}
        solution={[makeRepeat(5, [instr('AVANCER')])]}
        successNode={
          <>
            🎉 Il suffisait de changer <strong>un seul nombre</strong> : 3 → 5. Un programme
            n’est pas figé, il se <strong>modifie</strong> et se réutilise.
          </>
        }
        failureNode={(r) => (
          <>
            ROBI s’arrête en <strong className="font-mono">colonne {r.final.col}</strong>, le drapeau
            est en <strong className="font-mono">colonne 5</strong>. Combien de cases lui manque-t-il ?
            Ajuste le nombre de répétitions avec <span className="font-mono">−</span> /{' '}
            <span className="font-mono">+</span>.
          </>
        )}
        onRunComplete={(r) => {
          react?.(r.success);
          if (r.success && !solved) onSolved?.();
        }}
      />
    </div>
  );
}

/* ── Étape 2 : le programme buggé ─────────────────────────────────── */
const W_BUG = makeWorld({
  cols: 5, rows: 4, step: 46,
  start: { col: 0, row: 0, heading: 1 },
  target: { col: 2, row: 2 },
});

// Le bug : TOURNER → au lieu de TOURNER ←. ROBI part vers le bas et se bloque.
const BUGGY = [
  instr('AVANCER'), instr('AVANCER'),
  instr('DROITE'),                     // ← l'erreur
  instr('AVANCER'), instr('AVANCER'),
];
const FIXED = [
  instr('AVANCER'), instr('AVANCER'),
  instr('GAUCHE'),
  instr('AVANCER'), instr('AVANCER'),
];

function DebugMission({ solved, onSolved, react }) {
  const [program, setProgram] = useState(BUGGY);

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-700">
        Ce programme <strong>ne marche pas</strong>. Lance-le d’abord : regarde bien{' '}
        <strong>à quel moment</strong> ROBI quitte le bon chemin. Puis corrige — tu peux supprimer
        une carte et en ajouter une autre à sa place.
      </p>
      <ProgramLab
        world={W_BUG}
        program={program}
        onProgramChange={setProgram}
        allowed={['AVANCER', 'GAUCHE', 'DROITE']}
        mission={{ maxCards: 8 }}
        solved={solved}
        height={185}
        goal={<>répare le programme pour que ROBI atteigne le drapeau.</>}
        solution={FIXED}
        successNode={
          <>
            🎉 Réparé ! Une <strong>seule</strong> instruction était fautive : le robot tournait du
            mauvais côté. Tu n’as pas eu besoin de tout réécrire — c’est ça, <strong>déboguer</strong>.
          </>
        }
        failureNode={(r) =>
          r.blocked ? (
            <>
              💥 ROBI se bloque à l’instruction{' '}
              <strong className="font-mono">n° {r.blockedAt + 1}</strong>. Utilise{' '}
              <strong>Pas à pas</strong> pour voir précisément où il part du mauvais côté : la
              carte fautive est juste avant. Le drapeau est <strong>en haut</strong> à droite.
            </>
          ) : (
            <>
              ROBI finit en{' '}
              <strong className="font-mono">colonne {r.final.col}, ligne {r.final.row}</strong>, pas
              sur le drapeau (<strong className="font-mono">colonne 2, ligne 2</strong>). Après ses
              deux premiers pas, dans quel sens doit-il tourner pour aller vers le{' '}
              <strong>haut</strong> ?
            </>
          )
        }
        onRunComplete={(r) => {
          react?.(r.success);
          if (r.success && !solved) onSolved?.();
        }}
      />
    </div>
  );
}

/* ══ Module ═══════════════════════════════════════════════════════════ */

export default function Module06ReparerProgramme() {
  const [editDone, setEditDone] = useState(false);
  const [debugDone, setDebugDone] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Réparer un programme"
      moduleSubtitle="Le but change, le programme reste : modifie-le. Puis répare celui qui bugue."
      estimatedTime="10 min"
      brief={{
        tag: '🔧 Défi 06',
        title: 'Un programme, ça se répare.',
        body: (
          <p>
            Les vrais programmeurs passent beaucoup de temps à <strong>modifier</strong> et à{' '}
            <strong>réparer</strong> des programmes déjà écrits. À ton tour.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Le drapeau a bougé',
          subtitle: 'Modifie le programme d’hier.',
          done: editDone,
          content: (kit) => (
            <EditMission solved={editDone} onSolved={() => setEditDone(true)} react={kit.react} />
          ),
        },
        {
          num: 2,
          title: '🐛 Le programme qui n’arrive pas au bon endroit',
          subtitle: 'Lance, observe, trouve, corrige.',
          done: debugDone,
          content: (kit) => (
            <div className="space-y-4">
              <DebugMission solved={debugDone} onSolved={() => setDebugDone(true)} react={kit.react} />
              {/* Le mot arrive après l'enquête, sur une erreur que l'élève a
                  effectivement cherchée puis corrigée. */}
              {debugDone && (
                <>
                  <KnowledgeBrick
                    id="bug-debogage"
                    variant="new"
                    lead="Ce programme n’était pas cassé : il faisait exactement ce qui était écrit. Cette sorte d’erreur a un nom."
                  />
                  <KnowledgeBrick
                    id="methode-debogage"
                    variant="new"
                    lead="Et ce que tu viens de faire pour la trouver est une méthode, pas un coup de chance."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'La bonne méthode',
          done: quizDone,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="Ton programme n’amène pas ROBI au bon endroit. Quelle est la meilleure façon de trouver l’erreur ?"
                options={[
                  'Tout effacer et recommencer de zéro',
                  'Le lancer et regarder à quel moment ROBI quitte le bon chemin',
                  'Changer des cartes au hasard jusqu’à ce que ça marche',
                ]}
                correct={1}
                cols={1}
                solved={quizDone}
                explain="🎯 Exactement. On EXÉCUTE pour OBSERVER : l'endroit où le robot dévie désigne l'instruction fautive. C'est plus rapide et plus sûr que de tout réécrire ou de tâtonner au hasard."
                explainWrong="Tout effacer fait perdre le travail déjà juste, et le hasard ne t'apprend rien. La bonne méthode : lancer, regarder OÙ ça dérape, puis corriger cette instruction-là."
                requires={['methode-debogage', 'bug-debogage']}
                onAnswered={() => setQuizDone(true)}
              />
              {quizDone && (
                <KnowledgeBrick
                  id="mem-quatre-reflexes"
                  variant="new"
                  lead="Six modules, une seule boucle de travail à garder pour de bon."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <div className="space-y-3">
          <KnowledgeSnapshot moduleNumber={6}>
            <strong>La suite.</strong> Tu sais modifier et réparer. Prochaine étape : le labo, où tu
            mènes l'enquête tout seul, sans le moindre indice.
          </KnowledgeSnapshot>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Wrench className="w-6 h-6 mx-auto text-blue-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Le bouton <strong className="text-white">Pas à pas</strong> exécute une seule instruction
              à la fois : c'est ton meilleur outil d'enquête.
            </p>
          </div>
        </div>
      }
    />
  );
}
