import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookMarked } from 'lucide-react';
import { ContentModule, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RelationFigure from '../components/RelationFigure';
import { relationOf, RELATIONS, RELATION_LABEL, RELATION_SYMBOL } from '../components/relationsUtils';

/**
 * Module 6 — FORMALISATION.
 *
 * Ce module ne fait RIEN découvrir : il met en mots ce que les modules 1 à 5
 * ont fait manipuler, et rien de plus. Chaque ligne de la fiche renvoie au
 * geste qui l'a produite.
 *
 * Le cas « confondues » est montré UNE fois, nommé, et jamais évalué : il est
 * hors du périmètre d'évaluation de 6e, mais l'ignorer laisserait un trou
 * dans la classification.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 280, yMax: 130 };

const CASES = [
  {
    id: 'par',
    droites: [
      { p: { x: 20, y: 45 }, angleDeg: 10, name: 'd₁' },
      { p: { x: 20, y: 95 }, angleDeg: 10, name: 'd₂' },
    ],
  },
  {
    id: 'perp',
    droites: [
      { p: { x: 140, y: 65 }, angleDeg: 20, name: 'd₁' },
      { p: { x: 140, y: 65 }, angleDeg: 110, name: 'd₂' },
    ],
  },
  {
    id: 'sec',
    droites: [
      { p: { x: 140, y: 65 }, angleDeg: 15, name: 'd₁' },
      { p: { x: 140, y: 65 }, angleDeg: 55, name: 'd₂' },
    ],
  },
];

const SORT_OPTIONS = [RELATIONS.paralleles, RELATIONS.perpendiculaires, RELATIONS.secantes];

export default function Module06LesDeuxRelations() {
  const [sortDone, setSortDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Les deux relations"
      moduleSubtitle="Ce qui change, ce qui ne change jamais."
      estimatedTime="6 min"
      brief={{
        tag: '📋 Mission 06',
        title: 'La fiche à retenir — construite à partir de tes gestes.',
        body: <p>Rien de nouveau ici : on met des mots sur ce que tu as manipulé.</p>,
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-2xl text-sky-700">//</span>
              <h3 className="font-space font-bold text-sky-900">Parallèles</h3>
            </div>
            <ul className="text-sm text-sky-900 space-y-1.5">
              <li>• Elles ne se coupent <strong>jamais</strong>, même prolongées à l’infini.</li>
              <li>• Leur <strong>écart est constant</strong> : mesuré n’importe où, c’est le même nombre.</li>
              <li>• On note <span className="font-mono">d₁ // d₂</span>.</li>
            </ul>
            <p className="text-xs text-sky-700 italic">Constaté aux modules 1 et 2.</p>
          </div>

          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-2xl text-emerald-700">⊥</span>
              <h3 className="font-space font-bold text-emerald-900">Perpendiculaires</h3>
            </div>
            <ul className="text-sm text-emerald-900 space-y-1.5">
              <li>• Elles se coupent en formant un <strong>angle droit</strong> : 90° exactement.</li>
              <li>• L’orientation sur la page n’a <strong>aucune importance</strong>.</li>
              <li>• On note <span className="font-mono">d₁ ⊥ d₂</span>.</li>
            </ul>
            <p className="text-xs text-emerald-700 italic">Constaté au module 3.</p>
          </div>
        </div>
      }
      steps={[
        {
          num: 1,
          title: 'Classe les trois figures',
          done: sortDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <div className="space-y-3">
                  {CASES.map((c, i) => (
                    <div key={c.id} className="rounded-xl border-2 border-slate-200 bg-white p-2">
                      <p className="text-xs font-mono text-slate-500 mb-1">Figure {i + 1}</p>
                      <RelationFigure droites={c.droites} box={BOX} size={260} ariaLabel={`Figure ${i + 1}`} />
                    </div>
                  ))}
                </div>
              }
              rows={CASES.map((c, i) => ({
                id: c.id,
                label: <span className="font-semibold">Figure {i + 1}</span>,
                options: SORT_OPTIONS.map((o) => RELATION_LABEL[o]),
                correct: SORT_OPTIONS.indexOf(relationOf(c.droites[0], c.droites[1])),
                correction: <>{RELATION_LABEL[relationOf(c.droites[0], c.droites[1])]}</>,
              }))}
              solved={sortDone}
              onAnswered={() => setSortDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Deux droites qui se coupent sont <strong>sécantes</strong>. Si l’angle vaut exactement 90°,
                  elles sont en plus <strong>perpendiculaires</strong> : la perpendicularité est un cas
                  particulier de sécance.
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
          className="bg-slate-900 text-white rounded-2xl p-5 space-y-3"
        >
          <BookMarked className="w-6 h-6 mx-auto text-blue-400" aria-hidden="true" />
          <p className="text-center text-xs font-mono uppercase tracking-widest text-slate-400">
            Le cas qu’on rencontre rarement
          </p>
          <p className="text-sm text-slate-300 text-center">
            Deux droites <strong className="text-white">confondues</strong> sont en réalité la même droite :
            elles ont tous leurs points en commun. Elles ne comptent ni comme sécantes ni comme deux
            parallèles distinctes — c’est un cas à part, qu’on se contente de savoir nommer.
          </p>
        </motion.div>
      }
    />
  );
}
