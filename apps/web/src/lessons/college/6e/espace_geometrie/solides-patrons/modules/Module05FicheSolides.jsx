import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookMarked } from 'lucide-react';
import { ContentModule, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SolidView from '../components/SolidView';
import { SOLIDES, SOLIDES_LIST, isPolyhedron, eulerCheck } from '../components/solidesUtils';

/**
 * Module 5 — FORMALISATION (P1).
 *
 * Ce module ne fait rien découvrir : il rassemble en une fiche ce que les
 * modules 1-4 ont fait manipuler. Chaque nombre vient de SOLIDES, donc la
 * fiche ne peut pas diverger de ce que l'élève a compté.
 */
const ORDRE = ['cube', 'pave', 'prisme', 'cylindre'];

export default function Module05FicheSolides() {
  const [reconnaitreDone, setReconnaitreDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="La fiche des solides"
      moduleSubtitle="Chaque solide, ses faces, ses arêtes, ses sommets."
      estimatedTime="8 min"
      brief={{
        tag: '📋 Mission 05',
        title: 'La fiche à retenir — construite à partir de tes comptes.',
        body: <p>Rien de nouveau : on rassemble ce que tu as compté.</p>,
      }}
      intro={
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ORDRE.map((id) => {
            const s = SOLIDES[id];
            return (
              <div key={id} className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
                <SolidView solide={id} size={170} ariaLabel={s.nom} />
                <div className="text-center">
                  <div className="font-space font-extrabold text-slate-900 capitalize text-sm">{s.nom}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{s.natureFaces}</div>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center">
                  {[['F', s.faces], ['A', s.aretes], ['S', s.sommets]].map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-slate-50 border border-slate-200 py-1">
                      <div className="font-mono font-bold text-slate-800 text-sm">{v}</div>
                      <div className="text-[9px] text-slate-500">{k}</div>
                    </div>
                  ))}
                </div>
                {isPolyhedron(s) && (
                  <p className="text-[10px] font-mono text-center text-emerald-700">
                    {s.faces} + {s.sommets} − {s.aretes} = {eulerCheck(s)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      }
      steps={[
        {
          num: 1,
          title: 'Reconnais chaque solide à sa description',
          done: reconnaitreDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  Sers-toi des fiches ci-dessus : chaque description ne correspond qu’à un seul solide.
                </p>
              }
              rows={[
                {
                  id: 'r1',
                  label: <span className="text-sm">6 faces carrées identiques</span>,
                  options: ['Cube', 'Pavé droit', 'Prisme'],
                  correct: 0,
                  correction: <>le cube</>,
                },
                {
                  id: 'r2',
                  label: <span className="text-sm">6 faces rectangulaires, opposées deux à deux</span>,
                  options: ['Cube', 'Pavé droit', 'Cylindre'],
                  correct: 1,
                  correction: <>le pavé droit</>,
                },
                {
                  id: 'r3',
                  label: <span className="text-sm">2 triangles et 3 rectangles</span>,
                  options: ['Cube', 'Cylindre', 'Prisme droit'],
                  correct: 2,
                  correction: <>le prisme droit à base triangulaire</>,
                },
                {
                  id: 'r4',
                  label: <span className="text-sm">Aucun sommet, une surface courbe</span>,
                  options: ['Prisme', 'Cylindre', 'Pavé droit'],
                  correct: 1,
                  correction: <>le cylindre</>,
                },
              ]}
              solved={reconnaitreDone}
              onAnswered={() => setReconnaitreDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Cube et pavé ont les mêmes comptes ({SOLIDES.cube.faces} faces,{' '}
                  {SOLIDES.cube.aretes} arêtes, {SOLIDES.cube.sommets} sommets) : c’est la NATURE de leurs
                  faces qui les distingue.
                </Feedback>
              )}
            />
          ),
        },
      ]}
      footer={
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2"
        >
          <BookMarked className="w-6 h-6 mx-auto text-blue-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Compter faces, arêtes et sommets ne suffit pas toujours à distinguer deux solides : il faut aussi
            regarder <strong className="text-white">la nature des faces</strong>.
          </p>
        </motion.div>
      }
    />
  );
}
