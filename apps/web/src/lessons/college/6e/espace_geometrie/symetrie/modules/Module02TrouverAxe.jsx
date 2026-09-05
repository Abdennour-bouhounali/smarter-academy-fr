import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
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
          title: 'La diagonale d’un rectangle est-elle un axe ?',
          subtitle: 'Beaucoup le croient. Vérifions en pliant.',
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
                  tombent pas l’un sur l’autre. C’est l’erreur la plus fréquente du chapitre — un rectangle
                  n’a que <strong>2</strong> axes, ses deux médianes.
                </Feedback>
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
                  Le carré en a <strong>4</strong> (2 médianes + 2 diagonales), le rectangle{' '}
                  <strong>2</strong> (ses médianes seulement), le triangle équilatéral <strong>3</strong>, et
                  une figure quelconque <strong>aucun</strong>.
                </Feedback>
              )}
            />
          ),
        },
        {
          num: 3,
          title: 'Pourquoi le carré en a-t-il plus que le rectangle ?',
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
              explain="Plus une figure a de propriétés, plus elle a d’axes. L’égalité des côtés du carré rend ses diagonales pliables — ce qui est faux pour le rectangle."
              explainWrong="Ni la taille ni l’orientation n’ont d’effet sur la symétrie. C’est l’égalité des côtés qui donne au carré ses deux axes supplémentaires."
              solved={ruleDone}
              onAnswered={() => setRuleDone(true)}
            />
          ),
        },
      ]}
      footer={
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white rounded-2xl p-5 space-y-3"
        >
          <Search className="w-6 h-6 mx-auto text-sky-400" aria-hidden="true" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            {A_COMPTER.map((f) => (
              <div key={f.id} className="bg-white/10 rounded-xl p-3 text-center">
                <div className="font-mono font-extrabold text-white text-lg">{countSymmetryAxes(f.pts)}</div>
                <div className="text-slate-300 text-[11px] leading-tight">{f.label}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400">
            Le nombre d’axes est une propriété de la figure — il se compte, il ne se devine pas.
          </p>
        </motion.div>
      }
    />
  );
}
