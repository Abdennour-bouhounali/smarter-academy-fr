import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
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
            <div className="space-y-5">
              {/* Le troisième cas — deux droites qui se coupent SANS angle
                  droit — est une option de la question : il doit être posé
                  avant qu'on demande de le reconnaître. */}
              <KnowledgeBrick
                id="secantes"
                variant="new"
                lead="Il reste un cas que tu as croisé sans le nommer : deux droites qui se coupent, mais pas à angle droit."
              />
              <BatchChoiceQuestion
                requires={['secantes', 'droites-paralleles', 'droites-perpendiculaires']}
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
                    Une seule des trois figures porte le petit carré : c’est la seule paire
                    perpendiculaire.
                  </Feedback>
                )}
              />
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>La suite.</strong> Tu sais reconnaître et vérifier. À l’atelier, c’est toi qui
          traces.
        </KnowledgeSnapshot>
      }
    />
  );
}
