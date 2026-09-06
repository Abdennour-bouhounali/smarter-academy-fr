import React, { useState } from 'react';
import { Bug, FlaskConical } from 'lucide-react';
import { ContentModule, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProgramLab from '../components/ProgramLab';
import { makeWorld, instr, makeRepeat } from '../components/algoUtils';

/**
 * Module 7 — LABORATOIRE : « Le labo de débogage » (P11, P12).
 *
 *   LANCER → OBSERVER → HYPOTHÈSE → CORRIGER → RELANCER → VÉRIFIER
 *
 * Trois enquêtes indépendantes, de difficulté croissante. Ici l'élève est
 * autonome : plus de mot nouveau, plus d'explication préalable — il TESTE un
 * programme et observe son comportement (P11), et traduit une stratégie
 * énoncée en français en programme (P12).
 *
 * Les erreurs ne sont jamais signalées d'avance : c'est l'exécution qui les
 * révèle. Sortie de secours après 3 essais infructueux (playbook §8).
 */

const A = () => instr('AVANCER');
const G = () => instr('GAUCHE');
const D = () => instr('DROITE');
const R = () => instr('RAMASSER');

/* ── Enquête 1 : la boucle mal réglée ─────────────────────────────── */
const W1 = makeWorld({
  cols: 7, rows: 3, step: 44,
  start: { col: 0, row: 0, heading: 1 },
  target: { col: 5, row: 0 },
  items: [{ col: 5, row: 0, emoji: '🥕' }],
});
const BUG1 = [makeRepeat(2, [A()]), R()];         // 2 au lieu de 5, et RAMASSER trop tôt
const FIX1 = [makeRepeat(5, [A()]), R()];

/* ── Enquête 2 : le virage au mauvais endroit ─────────────────────── */
const W2 = makeWorld({
  cols: 5, rows: 5, step: 44,
  start: { col: 0, row: 0, heading: 0 },          // regarde vers le haut
  target: { col: 3, row: 3 },
  obstacles: [{ col: 1, row: 1 }, { col: 2, row: 1 }],
});
const BUG2 = [A(), D(), A(), A(), A()];           // tourne trop tôt → bloqué contre un rocher
const FIX2 = [A(), A(), A(), D(), A(), A(), A()]; // monte au-dessus des rochers, PUIS tourne

/* ── Enquête 3 : traduire une stratégie écrite en programme (P12) ── */
const W3 = makeWorld({
  cols: 6, rows: 4, step: 44,
  start: { col: 0, row: 3, heading: 2 },          // en haut à gauche, regarde vers le bas
  target: { col: 4, row: 0 },
  items: [{ col: 0, row: 0, emoji: '🥕' }, { col: 4, row: 0, emoji: '🍅' }],
});
const FIX3 = [
  makeRepeat(3, [A()]),   // descend en (0,0)
  R(),                    // 🥕
  G(),                    // tourné vers l'est
  makeRepeat(4, [A()]),   // jusqu'en (4,0)
  R(),                    // 🍅
];

function Investigation({ world, initial, solution, solved, onSolved, react, goal, allowed, maxCards, success, failure, height }) {
  const [program, setProgram] = useState(initial);

  return (
    <ProgramLab
      world={world}
      program={program}
      onProgramChange={setProgram}
      allowed={allowed}
      mission={{ maxCards }}
      solved={solved}
      height={height}
      goal={goal}
      solution={solution}
      successNode={success}
      failureNode={failure}
      onRunComplete={(r) => {
        react?.(r.success);
        if (r.success && !solved) onSolved?.();
      }}
    />
  );
}

/* ══ Module ═══════════════════════════════════════════════════════════ */

export default function Module07LaboDebogage() {
  const [d1, setD1] = useState(false);
  const [d2, setD2] = useState(false);
  const [d3, setD3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Le labo de débogage"
      moduleSubtitle="Lance, observe, fais une hypothèse, corrige, relance : le vrai métier."
      estimatedTime="9 min"
      brief={{
        tag: '🐛 Défi 07',
        title: 'Trois programmes, trois bugs.',
        body: (
          <p>
            À toi de mener l’enquête. Aucun indice ne te dira où est l’erreur :{' '}
            <strong>lance le programme et regarde ce que ROBI fait vraiment</strong>. C’est le
            comportement qui trahit le bug.
          </p>
        ),
      }}
      intro={
        <Feedback tone="info">
          🔍 <strong>La méthode :</strong> 1. lancer · 2. observer où ça dérape · 3. imaginer
          pourquoi · 4. corriger une chose · 5. relancer pour vérifier. Le bouton{' '}
          <strong>Pas à pas</strong> est ton meilleur allié.
        </Feedback>
      }
      steps={[
        {
          num: 1,
          title: 'Enquête 1 — la carotte inaccessible',
          subtitle: 'ROBI n’attrape rien. Pourquoi ?',
          done: d1,
          content: (kit) => (
            <Investigation
              world={W1}
              initial={BUG1}
              solution={FIX1}
              solved={d1}
              onSolved={() => setD1(true)}
              react={kit.react}
              allowed={['AVANCER', 'REPETER', 'RAMASSER', 'DROITE', 'GAUCHE']}
              maxCards={6}
              height={125}
              goal={<>ROBI doit ramasser la carotte 🥕 posée sur le drapeau.</>}
              success={
                <>
                  🎉 Trouvé ! La boucle ne répétait pas assez de fois : ROBI ramassait dans le vide,
                  loin de la carotte. <strong>RAMASSER n’agit que sur la case où il se trouve.</strong>
                </>
              }
              failure={(r) => (
                <>
                  ROBI s’arrête en <strong className="font-mono">colonne {r.final.col}</strong> et la
                  carotte est en <strong className="font-mono">colonne 5</strong>.{' '}
                  {!r.gotItems && 'Il ramasse donc du vide. '}
                  Compte les cases qui manquent et règle la boucle avec{' '}
                  <span className="font-mono">−</span> / <span className="font-mono">+</span>.
                </>
              )}
            />
          ),
        },
        {
          num: 2,
          title: 'Enquête 2 — le virage trop tôt',
          subtitle: 'Deux rochers, un programme qui se cogne.',
          done: d2,
          content: (kit) => (
            <Investigation
              world={W2}
              initial={BUG2}
              solution={FIX2}
              solved={d2}
              onSolved={() => setD2(true)}
              react={kit.react}
              allowed={['AVANCER', 'GAUCHE', 'DROITE', 'REPETER']}
              maxCards={12}
              height={195}
              goal={<>atteins le drapeau en contournant les rochers 🪨.</>}
              success={
                <>
                  🎉 Bien joué ! Le programme tournait <strong>trop tôt</strong> et envoyait ROBI dans
                  un rocher. En décalant le virage, le chemin se libère.
                </>
              }
              failure={(r) =>
                r.blocked ? (
                  <>
                    💥 ROBI percute quelque chose à l’instruction{' '}
                    <strong className="font-mono">n° {r.blockedAt + 1}</strong>. Fais{' '}
                    <strong>Pas à pas</strong> depuis le début : à quel moment se retrouve-t-il face à
                    un rocher ? Il faut monter <strong>plus haut</strong> avant de tourner.
                  </>
                ) : (
                  <>
                    ROBI termine en{' '}
                    <strong className="font-mono">colonne {r.final.col}, ligne {r.final.row}</strong>,
                    le drapeau est en <strong className="font-mono">colonne 3, ligne 3</strong>.
                    Ajuste le nombre de pas avant et après le virage.
                  </>
                )
              }
            />
          ),
        },
        {
          num: 3,
          title: 'Enquête 3 — traduis la stratégie',
          subtitle: 'Cette fois, tu pars d’une page blanche.',
          done: d3,
          content: (kit) => (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-3.5 space-y-1">
                <div className="font-space font-extrabold text-rose-900 text-sm">
                  📋 La stratégie du jardinier
                </div>
                <p className="text-sm text-rose-900">
                  « ROBI descend jusqu’en bas du potager, il ramasse la carotte 🥕, puis il tourne
                  vers la droite, traverse jusqu’à la tomate 🍅 et la ramasse. »
                </p>
                <p className="text-xs text-rose-800/80 pt-0.5">
                  À toi de traduire cette phrase en programme.
                </p>
              </div>
              <KnowledgeBrick
                id="traduire-strategie"
                variant="new"
                lead="Une page blanche et cinq lignes de français : voilà comment on passe de l’un à l’autre."
              />
              <Investigation
                world={W3}
                initial={[]}
                solution={FIX3}
                solved={d3}
                onSolved={() => setD3(true)}
                react={kit.react}
                allowed={['AVANCER', 'GAUCHE', 'DROITE', 'RAMASSER', 'REPETER']}
                maxCards={12}
                height={175}
                goal={<>ramasse la carotte 🥕 ET la tomate 🍅, puis termine sur le drapeau.</>}
                success={
                  <>
                    🏆 Magnifique ! Tu viens de traduire une <strong>stratégie écrite en français</strong>{' '}
                    en un programme qui marche. C’est exactement le métier d’un programmeur.
                  </>
                }
                failure={(r) => (
                  <>
                    ROBI s’arrête en{' '}
                    <strong className="font-mono">colonne {r.final.col}, ligne {r.final.row}</strong>
                    {!r.gotItems && ' et il manque encore quelque chose à ramasser'}. Reprends la
                    stratégie phrase par phrase : descendre, ramasser, tourner, traverser, ramasser.
                  </>
                )}
              />
            </div>
          ),
        },
      ]}
      footer={
        <div className="space-y-3">
          <KnowledgeSnapshot moduleNumber={7}>
            <strong>La suite.</strong> Ta carte est complète : il ne reste qu'à la mettre à l'épreuve
            sur dix questions, dont aucune n'apportera de notion nouvelle.
          </KnowledgeSnapshot>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <FlaskConical className="w-6 h-6 mx-auto text-rose-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Tu sais tester, observer, corriger et traduire une stratégie.{' '}
              <strong className="text-white">Tu es prêt pour la mission finale.</strong>
            </p>
          </div>
        </div>
      }
    />
  );
}
