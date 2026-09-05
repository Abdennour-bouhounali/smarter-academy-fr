import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookMarked } from 'lucide-react';
import { ContentModule, BatchChoiceQuestion, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MirrorLab from '../components/MirrorLab';
import {
  lineThrough, conservationReport, CONSERVEES, NON_CONSERVEES,
  sideLengths, interiorAngles, polygonArea,
} from '../components/symetrieUtils';

/**
 * Module 5 — FORMALISATION (P9).
 *
 * Ce module ne fait rien découvrir : il met en mots les deux conditions
 * manipulées aux modules 3-4, et fait constater ce que la symétrie CONSERVE.
 *
 * Aha : la symétrie déplace la figure sans la déformer. Longueurs, angles,
 * périmètre, aire : tout est conservé. Seuls la position et le sens de
 * lecture changent.
 *
 * Les verdicts viennent de `conservationReport`, calculé sur la figure et son
 * image — jamais d'une liste écrite à la main.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 320, yMax: 200 };
const AXE = lineThrough({ x: 160, y: 0 }, { x: 160, y: 200 });
const FIG = [{ x: 55, y: 45 }, { x: 125, y: 65 }, { x: 90, y: 155 }];

const RAPPORT = conservationReport(FIG, AXE);

const ROWS = [
  ...CONSERVEES.map((c) => ({ id: c.id, label: c.label, correct: 0 })),
  ...NON_CONSERVEES.map((c) => ({ id: c.id, label: c.label, correct: 1 })),
];

export default function Module05RegleDuMiroir() {
  const [consDone, setConsDone] = useState(false);
  const [ruleDone, setRuleDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="La règle du miroir"
      moduleSubtitle="Deux conditions, et ce qui ne change jamais."
      estimatedTime="8 min"
      brief={{
        tag: '📋 Mission 05',
        title: 'La fiche à retenir — construite à partir de tes gestes.',
        body: <p>Rien de nouveau : on met des mots sur ce que tu as manipulé.</p>,
      }}
      intro={
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 space-y-3">
          <p className="text-center text-xs font-mono uppercase tracking-widest text-blue-500">
            Le symétrique d’un point M
          </p>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <div className="bg-white rounded-xl p-3 border border-blue-200">
              <div className="font-bold text-blue-900 mb-1">1. Perpendiculaire</div>
              <div className="text-slate-700 text-xs">
                Le trait [MM′] coupe l’axe à angle droit.
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-blue-200">
              <div className="font-bold text-blue-900 mb-1">2. Égale distance</div>
              <div className="text-slate-700 text-xs">
                M et M′ sont à la même distance de l’axe, de part et d’autre.
              </div>
            </div>
          </div>
          <p className="text-xs text-blue-900 text-center">
            Les deux ensemble, toujours — l’une sans l’autre ne définit rien.
          </p>
        </div>
      }
      steps={[
        {
          num: 1,
          title: 'Qu’est-ce que la symétrie conserve ?',
          done: consDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <div className="space-y-2">
                  <MirrorLab
                    axis={AXE}
                    points={FIG}
                    polygon
                    showDistances={false}
                    disabled
                    box={BOX}
                    ariaLabel="Un triangle et son image par symétrie axiale"
                  />
                  <p className="text-sm text-slate-600">
                    Compare la figure bleue et son image verte. Qu’est-ce qui est resté identique ?
                  </p>
                </div>
              }
              rows={ROWS.map((r) => ({
                id: r.id,
                label: <span className="text-sm">{r.label}</span>,
                options: ['Conservé', 'Changé'],
                correct: r.correct,
                correction: <>{r.correct === 0 ? 'conservé' : 'changé'}</>,
              }))}
              solved={consDone}
              onAnswered={() => setConsDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  La symétrie <strong>déplace</strong> la figure sans la déformer : longueurs, angles,
                  périmètre et aire sont identiques (
                  {Math.round(polygonArea(FIG))} = {Math.round(polygonArea(RAPPORT.image))} pour l’aire).
                  Seuls la position et le sens de lecture changent.
                </Feedback>
              )}
            />
          ),
        },
        {
          num: 2,
          title: 'Une seule condition suffit-elle ?',
          done: ruleDone,
          content: (
            <TapQuestion
              prompt="Un élève place un point à la bonne distance de l’axe, mais pas en face de M. A-t-il construit le symétrique ?"
              options={[
                'Non : il faut AUSSI que [MM′] soit perpendiculaire à l’axe',
                'Oui : la distance est la seule condition',
                'Oui, à condition que ce soit de l’autre côté',
              ]}
              correct={0}
              cols={1}
              explain="Tous les points à la même distance de l’axe forment deux droites parallèles — il y en a une infinité. C’est la perpendicularité qui en désigne un seul."
              explainWrong="À distance égale de l’axe, il existe une infinité de points. Seule la perpendicularité de [MM′] en sélectionne un — celui-là précisément."
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
          <BookMarked className="w-6 h-6 mx-auto text-blue-400" aria-hidden="true" />
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <div className="bg-emerald-400/15 border border-emerald-400/30 rounded-xl p-3">
              <div className="font-bold text-emerald-200 mb-1">Conservé</div>
              <div className="text-slate-300 text-xs">longueurs · angles · périmètre · aire</div>
            </div>
            <div className="bg-rose-400/15 border border-rose-400/30 rounded-xl p-3">
              <div className="font-bold text-rose-200 mb-1">Changé</div>
              <div className="text-slate-300 text-xs">la position · le sens de lecture</div>
            </div>
          </div>
        </motion.div>
      }
    />
  );
}
