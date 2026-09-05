import React, { useState } from 'react';
import { Wrench, Bug } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
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
          title: '🐛 Le programme qui bugue',
          subtitle: 'Lance, observe, trouve, corrige.',
          done: debugDone,
          content: (kit) => (
            <DebugMission solved={debugDone} onSolved={() => setDebugDone(true)} react={kit.react} />
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
                onAnswered={() => setQuizDone(true)}
              />
              <KeyTakeaway color="blue">
                <li>
                  Un <strong>algorithme</strong> est une suite d’<strong>instructions</strong> dans un{' '}
                  <strong>ordre</strong> précis : changer l’ordre change le résultat.
                </li>
                <li>
                  <strong>AVANCER</strong> change la case, <strong>TOURNER</strong> change la
                  direction — jamais les deux.
                </li>
                <li>
                  <strong>RÉPÉTER n FOIS</strong> raccourcit l’écriture, pas le travail du robot :
                  1 carte, n actions.
                </li>
                <li>
                  Une erreur dans un programme s’appelle un <strong>bug</strong>. Pour la trouver :{' '}
                  <strong>lancer, observer où ça dérape, corriger, relancer</strong>.
                </li>
              </KeyTakeaway>
            </div>
          ),
        },
      ]}
      footer={
        <div className="space-y-3">
          <Feedback tone="info">
            💡 Le bouton <strong>Pas à pas</strong> est l’outil du déboguage : il exécute une seule
            instruction à la fois, pour voir exactement ce que fait chacune.
          </Feedback>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Wrench className="w-6 h-6 mx-auto text-blue-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Tu sais modifier et réparer. Prochaine étape : le{' '}
              <strong className="text-white">labo de débogage</strong>, où tu mènes l’enquête tout seul.
            </p>
          </div>
        </div>
      }
    />
  );
}
