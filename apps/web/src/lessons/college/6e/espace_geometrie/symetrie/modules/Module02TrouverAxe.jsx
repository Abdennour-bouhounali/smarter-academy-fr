import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FoldCard from '../components/FoldCard';
import { symmetryAxesOf, countSymmetryAxes, lineThrough } from '../components/symetrieUtils';

/**
 * Module 2 — DÉCOUVERTE : trouver l'axe (P2, P3).
 *
 * Objectif : chercher OÙ passe le pli, et découvrir qu'il peut y en avoir
 * plusieurs — ou aucun.
 *
 * Aha : le nombre d'axes est une propriété de la figure, pas une question de
 * goût. Le carré en a 4, le rectangle 2, une figure quelconque aucun.
 *
 * Misconception visée : croire que la diagonale d'un rectangle est un axe de
 * symétrie (elle ne l'est pas — c'est l'erreur la plus fréquente du chapitre).
 *
 * Tous les verdicts viennent de `symmetryAxesOf` : le nombre affiché est
 * CALCULÉ, jamais écrit à la main.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 240, yMax: 180 };

const CARRE = [{ x: 60, y: 40 }, { x: 180, y: 40 }, { x: 180, y: 160 }, { x: 60, y: 160 }];
const RECT = [{ x: 35, y: 60 }, { x: 205, y: 60 }, { x: 205, y: 140 }, { x: 35, y: 140 }];
const EQUI = [{ x: 120, y: 35 }, { x: 182, y: 142 }, { x: 58, y: 142 }];
const QUELCONQUE = [{ x: 40, y: 45 }, { x: 190, y: 60 }, { x: 170, y: 150 }, { x: 55, y: 135 }];

/* Les deux plis testés sur le rectangle : la médiane marche, la diagonale non. */
const MEDIANE_RECT = lineThrough({ x: 120, y: 0 }, { x: 120, y: 180 });
const DIAGONALE_RECT = lineThrough({ x: 35, y: 60 }, { x: 205, y: 140 });

const A_COMPTER = [
  { id: 'a1', pts: CARRE, label: 'Carré' },
  { id: 'a2', pts: RECT, label: 'Rectangle' },
  { id: 'a3', pts: EQUI, label: 'Triangle équilatéral' },
  { id: 'a4', pts: QUELCONQUE, label: 'Quadrilatère quelconque' },
];

export default function Module02TrouverAxe() {
  const [foldedDiag, setFoldedDiag] = useState(false);
  const [diagDone, setDiagDone] = useState(false);
  const [countDone, setCountDone] = useState(false);
  const [ruleDone, setRuleDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Trouver l’axe"
      moduleSubtitle="Où passe le pli ? Parfois plusieurs, parfois aucun."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 02',
        title: 'Un axe de symétrie, c’est un pli qui marche.',
        body: (
          <p>
            Toutes les droites ne conviennent pas. On va tester des plis, et compter ceux qui{' '}
            <strong>fonctionnent vraiment</strong>.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          // Titre neutre : StepCard l'affiche AVANT l'ouverture de l'étape, et
          // il ne doit ni nommer le pli à tester ni annoncer le verdict.
          title: 'Deux plis à tester sur un rectangle',
          subtitle: 'Beaucoup se trompent ici. Vérifions en pliant.',
          done: diagDone,
          content: (kit) => (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <FoldCard points={RECT} axis={MEDIANE_RECT} folded={foldedDiag} box={BOX} label="Pli au milieu" />
                <FoldCard points={RECT} axis={DIAGONALE_RECT} folded={foldedDiag} box={BOX} label="Pli sur la diagonale" />
              </div>

              {!diagDone && (
                <button
                  type="button"
                  onClick={() => {
                    if (!foldedDiag) { setFoldedDiag(true); return; }
                    kit.react(true);
                    setDiagDone(true);
                  }}
                  className="w-full min-h-[44px] rounded-xl bg-sky-600 text-white font-bold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {foldedDiag ? 'J’ai compris' : '📄 Plier les deux'}
                </button>
              )}

              {foldedDiag && (
                <Feedback tone={diagDone ? 'ok' : 'info'}>
                  Le pli du milieu fonctionne. La <strong>diagonale, non</strong> : en pliant, les coins ne
                  tombent pas l’un sur l’autre.
                </Feedback>
              )}

              {diagDone && (
                <KnowledgeBrick
                  id="nombre-axes"
                  variant="new"
                  lead="Tu viens de rejeter un pli qui semblait plausible : les axes se testent, ils ne se supposent pas."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Compte les axes de chaque figure',
          done: countDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {A_COMPTER.map((f) => (
                      <FoldCard key={f.id} points={f.pts} axis={MEDIANE_RECT} folded={false} box={BOX} label={f.label} />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600">
                    Pour chaque figure, combien de plis différents la superposeraient à elle-même ?
                  </p>
                </div>
              }
              requires={['nombre-axes', 'axe-symetrie', 'symetrie-pliage']}
              rows={A_COMPTER.map((f) => ({
                id: f.id,
                label: <span className="font-semibold">{f.label}</span>,
                options: ['0', '1', '2', '3', '4'],
                correct: countSymmetryAxes(f.pts),
                correction: (
                  <>
                    {countSymmetryAxes(f.pts)} axe{countSymmetryAxes(f.pts) > 1 ? 's' : ''}
                  </>
                ),
              }))}
              solved={countDone}
              onAnswered={() => setCountDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Le carré en a <strong>4</strong> (les deux plis du milieu, et ses deux diagonales), le
                  rectangle <strong>2</strong> (ses deux plis du milieu seulement), le triangle
                  équilatéral <strong>3</strong>, et une figure quelconque <strong>aucun</strong>.
                </Feedback>
              )}
            />
          ),
        },
        {
          num: 3,
          title: 'D’où vient la différence ?',
          done: ruleDone,
          content: (
            <TapQuestion
              prompt="Le carré a 4 axes, le rectangle seulement 2. Qu’est-ce qui explique la différence ?"
              options={[
                'Le carré a ses 4 côtés égaux : ses diagonales deviennent aussi des axes',
                'Le carré est plus petit',
                'Le rectangle est penché',
              ]}
              correct={0}
              cols={1}
              requires={['nombre-axes', 'axe-symetrie']}
              explain="Plus une figure a de propriétés, plus elle a d’axes. L’égalité des côtés du carré rend ses diagonales pliables — ce qui est faux pour le rectangle."
              explainWrong="Ni la taille ni l’orientation n’ont d’effet sur la symétrie. C’est l’égalité des côtés qui donne au carré ses deux axes supplémentaires."
              solved={ruleDone}
              onAnswered={() => setRuleDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> On sait où plier. Voyons maintenant, point par point, ce que le
          pli fait exactement.
        </KnowledgeSnapshot>
      }
    />
  );
}
