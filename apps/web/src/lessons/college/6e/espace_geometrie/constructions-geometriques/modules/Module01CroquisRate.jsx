import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { INSTRUMENTS, INSTRUMENTS_LIST, TACHES, instrumentFor } from '../components/constructionsUtils';

/**
 * Module 1 — TRIGGER (conflit cognitif).
 *
 * Objectif : faire sentir que chaque instrument GARANTIT une propriété
 * précise — et qu'à main levée, aucune n'est garantie.
 *
 * Aha : on ne choisit pas un instrument par habitude, mais d'après la
 * propriété qu'on veut assurer. « Je veux un angle droit » ⇒ équerre.
 *
 * Misconception visée : croire que la règle sert à tout, ou que le compas ne
 * sert qu'à faire des cercles.
 */
const CROQUIS = [
  { defaut: 'Les côtés opposés ne sont pas égaux', instrument: 'regle' },
  { defaut: 'Les angles ne sont pas droits', instrument: 'equerre' },
  { defaut: 'Le cercle est bosselé', instrument: 'compas' },
];

export default function Module01CroquisRate() {
  const [pourquoiDone, setPourquoiDone] = useState(false);
  const [assocDone, setAssocDone] = useState(false);
  const [regleDone, setRegleDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le croquis raté"
      moduleSubtitle="À main levée, rien n’est garanti."
      estimatedTime="8 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Un dessin à main levée, trois défauts.',
        body: (
          <p>
            Chaque défaut aurait été évité par un instrument précis. Encore faut-il savoir{' '}
            <strong>lequel</strong>.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Pourquoi utiliser des instruments ?',
          done: pourquoiDone,
          content: (
            <div className="space-y-5">
              <TapQuestion
                above={
                  <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 space-y-2">
                    <p className="text-xs font-mono uppercase tracking-wide text-rose-500">
                      Le croquis à main levée
                    </p>
                    <ul className="text-sm text-rose-900 space-y-1.5">
                      {CROQUIS.map((c, i) => (
                        <li key={i}>✗ {c.defaut}</li>
                      ))}
                    </ul>
                  </div>
                }
                prompt="À quoi servent les instruments de géométrie ?"
                options={[
                  'À GARANTIR une propriété : une longueur, un angle droit, une égalité',
                  'À dessiner plus joliment',
                  'À aller plus vite',
                ]}
                correct={0}
                cols={1}
                requires={['figures-planes-usuelles', 'angle-droit']}
                explain="Un instrument n’embellit pas : il garantit. La règle garantit la longueur, l’équerre l’angle droit, le compas l’égalité des distances."
                explainWrong="Ce n’est pas une question d’esthétique ni de vitesse : sans instrument, aucune propriété n’est exacte — et une figure fausse ne prouve rien."
                solved={pourquoiDone}
                onAnswered={() => setPourquoiDone(true)}
              />

              {/* Les trois défauts du croquis viennent d'être reliés à trois
                  causes distinctes : l'idée fondatrice de la leçon se pose
                  ici, avant l'association tâche/instrument de l'étape 2. */}
              {pourquoiDone && (
                <>
                  <KnowledgeBrick
                    id="instrument-garantit"
                    variant="new"
                    lead="Chacun des trois défauts venait d’une propriété qui n’était pas assurée."
                  />
                  <KnowledgeBrick id="mem-trois-garanties" variant="new" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Quel instrument pour quelle tâche ?',
          done: assocDone,
          content: (
            <BatchChoiceQuestion
              requires={['instrument-garantit', 'mem-trois-garanties', 'angle-droit']}
              intro={
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-3 gap-2">
                    {INSTRUMENTS_LIST.map((i) => (
                      <div key={i.id} className="rounded-xl border-2 border-slate-200 bg-white p-3 text-center">
                        <div className="text-2xl" aria-hidden="true">{i.emoji}</div>
                        <div className="font-bold text-slate-800 text-sm capitalize mt-1">{i.nom}</div>
                        <div className="text-[11px] text-slate-500 mt-1">{i.garantit}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-600">
                    Pour chaque tâche, choisis l’instrument qui garantit ce qu’on demande.
                  </p>
                </div>
              }
              rows={TACHES.slice(0, 4).map((t) => ({
                id: t.id,
                label: <span className="text-sm">{t.libelle}</span>,
                options: INSTRUMENTS_LIST.map((i) => i.nom),
                correct: INSTRUMENTS_LIST.findIndex((i) => i.id === instrumentFor(t.id)),
                correction: <>{INSTRUMENTS[instrumentFor(t.id)].nom}</>,
              }))}
              solved={assocDone}
              onAnswered={() => setAssocDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Retiens la propriété garantie : <strong>règle</strong> → longueur,{' '}
                  <strong>équerre</strong> → angle droit, <strong>compas</strong> → égalité de longueurs.
                </Feedback>
              )}
            />
          ),
        },
        {
          num: 3,
          title: 'Le compas sert-il seulement aux cercles ?',
          done: regleDone,
          content: (
            <TapQuestion
              prompt="On veut reporter une longueur d’un endroit à un autre, sans la mesurer. Quel instrument ?"
              options={[
                'Le compas : son écartement ne change pas',
                'La règle graduée : il faut lire la mesure',
                'L’équerre',
              ]}
              correct={0}
              cols={1}
              requires={['instrument-garantit', 'mem-trois-garanties']}
              explain="Le compas conserve un écartement : c’est ce qui permet de REPORTER une longueur sans jamais la lire. Il ne sert donc pas qu’aux cercles."
              explainWrong="La règle oblige à lire un nombre — donc à arrondir. Le compas, lui, transporte la longueur exacte, même inconnue."
              solved={regleDone}
              onAnswered={() => setRegleDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Tu sais ce que chaque instrument garantit. Reste à savoir s’en
          servir : le module suivant commence par la règle graduée, et son piège.
        </KnowledgeSnapshot>
      }
    />
  );
}
