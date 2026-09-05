import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Puzzle, Eye } from 'lucide-react';
import { ContentModule } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MirrorLab from '../components/MirrorLab';
import {
  lineThrough, reflectPoint, checkSymmetric, symmetricHint, dist,
} from '../components/symetrieUtils';

/**
 * Module 6 — PRACTICE LAB : compléter une figure (P6).
 *
 * Objectif : passer du point à la FIGURE. Construire le symétrique d'un
 * polygone, c'est construire le symétrique de chacun de ses sommets — puis
 * relier. Rien de plus, mais rien de moins.
 *
 * Aha : on ne « dessine pas l'autre moitié à l'œil ». On place les sommets
 * un par un, chacun avec les deux mêmes conditions.
 *
 * Politique formative : chaque sommet placé reste visible ; le suivant
 * s'active seulement quand le précédent est juste. Échappatoire par sommet.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 320, yMax: 220 };
const AXE = lineThrough({ x: 160, y: 0 }, { x: 160, y: 220 });

// La moitié donnée : trois sommets à gauche de l'axe.
const DEMI = [{ x: 60, y: 45 }, { x: 120, y: 95 }, { x: 70, y: 170 }];
const NOMS = ['A', 'B', 'C'];

export default function Module06CompleterFigure() {
  const [placed, setPlaced] = useState([]);          // images validées
  const [cand, setCand] = useState({ x: 250, y: 120 });
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const idx = placed.length;                          // sommet en cours
  const current = DEMI[idx];
  const state = current ? checkSymmetric(AXE, current, cand) : null;

  const handle = (p, react) => {
    if (allDone || revealed || !current) return;
    setCand(p);
    const st = checkSymmetric(AXE, current, p);
    if (!st.ok) return;
    const next = [...placed, reflectPoint(AXE, current)];
    react(true);
    setPlaced(next);
    setTries(0);
    if (next.length === DEMI.length) setAllDone(true);
    else setCand({ x: 250, y: 120 });
  };

  const reveal = () => {
    setRevealed(true);
    setPlaced(DEMI.map((p) => reflectPoint(AXE, p)));
    setAllDone(true);
  };

  // Les points affichés : la moitié donnée + les images déjà placées.
  const shown = [...DEMI, ...placed];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Compléter une figure"
      moduleSubtitle="La moitié est donnée : reconstitue l’autre, sommet par sommet."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 06',
        title: 'Un sommet à la fois.',
        body: (
          <p>
            Construire le symétrique d’une figure, c’est construire celui de{' '}
            <strong>chacun de ses sommets</strong> — avec les deux mêmes conditions à chaque fois.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Place les trois sommets manquants',
          subtitle: allDone ? 'Terminé.' : `Sommet ${NOMS[idx] ?? ''}′ — ${idx} / ${DEMI.length} placés`,
          done: allDone,
          content: (kit) => (
            <div className="space-y-3">
              <MirrorLab
                axis={AXE}
                points={shown}
                candidate={allDone ? null : cand}
                onCandidateChange={(p) => handle(p, kit.react)}
                showImage={false}
                showDistances={false}
                showConnector={false}
                polygon={false}
                box={BOX}
                disabled={allDone}
                ariaLabel={
                  allDone
                    ? 'Figure complétée par symétrie'
                    : `Place le symétrique du sommet ${NOMS[idx]}`
                }
              />

              {!allDone && state && (
                <>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <div
                      className={`rounded-xl border-2 px-3 py-2 text-xs font-semibold flex items-center gap-2 ${
                        state.perpendiculaire ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-500'
                      }`}
                    >
                      <span aria-hidden="true">{state.perpendiculaire ? '✓' : '○'}</span>
                      Perpendiculaire à l’axe
                    </div>
                    <div
                      className={`rounded-xl border-2 px-3 py-2 text-xs font-semibold flex items-center gap-2 ${
                        state.distanceEgale ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-500'
                      }`}
                    >
                      <span aria-hidden="true">{state.distanceEgale ? '✓' : '○'}</span>
                      Distances égales
                      <span className="ml-auto font-mono text-[11px]">
                        {Math.round(state.distPoint)} / {Math.round(state.distCandidate)}
                      </span>
                    </div>
                  </div>
                  <Feedback tone="info">
                    Sommet <strong>{NOMS[idx]}</strong> : {symmetricHint(state)}
                  </Feedback>
                  <button
                    type="button"
                    onClick={() => setTries((t) => t + 1)}
                    className="min-h-[44px] inline-flex items-center px-1 text-xs font-mono text-slate-500 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                  >
                    Un indice ?
                  </button>
                </>
              )}

              {allDone && (
                <Feedback tone={revealed ? 'info' : 'ok'}>
                  {revealed && <strong>Pas grave, on te le montre. </strong>}
                  Les trois sommets sont placés. En les reliant, on obtient l’image de la figure : même
                  forme, mêmes longueurs, mêmes angles — de l’autre côté du pli.
                </Feedback>
              )}

              {tries >= 3 && !allDone && (
                <button
                  type="button"
                  onClick={reveal}
                  className="w-full min-h-[44px] rounded-xl border-2 border-sky-300 bg-sky-50 text-sky-800 font-bold text-sm hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Eye className="w-4 h-4 inline mr-1.5" aria-hidden="true" />
                  Je ne trouve pas — montre-moi
                </button>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2"
        >
          <Puzzle className="w-6 h-6 mx-auto text-rose-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Le symétrique d’une figure se construit{' '}
            <strong className="text-white">sommet par sommet</strong>. Chaque sommet suit exactement la même
            règle que le point isolé du module 3.
          </p>
        </motion.div>
      }
    />
  );
}
