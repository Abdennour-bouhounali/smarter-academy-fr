import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FlipHorizontal } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FoldCard from '../components/FoldCard';
import { lineThrough, isSymmetryAxis } from '../components/symetrieUtils';

/**
 * Module 1 — TRIGGER (conflit cognitif).
 *
 * Objectif : faire naître l'idée de symétrie par le GESTE du pliage, avant
 * tout vocabulaire. Deux figures se ressemblent ; pliées, une seule se
 * superpose.
 *
 * Aha : « avoir l'air symétrique » et « l'être » sont deux choses. Le pli
 * tranche.
 *
 * Misconception visée : juger la symétrie à l'œil, sur une impression
 * d'équilibre général.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 240, yMax: 180 };
const AXE = lineThrough({ x: 120, y: 0 }, { x: 120, y: 180 });

// A : vraiment symétrique par rapport à l'axe vertical.
const SYM = [
  { x: 120, y: 30 }, { x: 190, y: 90 }, { x: 155, y: 150 },
  { x: 85, y: 150 }, { x: 50, y: 90 },
];
// B : le sommet de droite est décalé — l'œil ne le voit presque pas.
const PRESQUE = [
  { x: 120, y: 30 }, { x: 205, y: 95 }, { x: 155, y: 150 },
  { x: 85, y: 150 }, { x: 50, y: 90 },
];

export default function Module01Pliage() {
  const [folded, setFolded] = useState(false);
  const [predictDone, setPredictDone] = useState(false);
  const [foldDone, setFoldDone] = useState(false);
  const [ruleDone, setRuleDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le pliage"
      moduleSubtitle="Plie la feuille : les deux moitiés se superposent-elles ?"
      estimatedTime="8 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Deux figures. Une seule se plie parfaitement.',
        body: (
          <p>
            Le trait pointillé est le <strong>pli</strong>. Fais ta prédiction, puis plie pour vérifier.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Laquelle se pliera parfaitement ?',
          subtitle: 'À l’œil, pour l’instant.',
          done: predictDone,
          content: (
            <TapQuestion
              above={
                <div className="grid sm:grid-cols-2 gap-3">
                  <FoldCard points={SYM} axis={AXE} folded={false} box={BOX} label="Figure A" />
                  <FoldCard points={PRESQUE} axis={AXE} folded={false} box={BOX} label="Figure B" />
                </div>
              }
              prompt="Si on plie le long du pointillé, laquelle des deux moitiés se superposera exactement ?"
              options={['La figure A', 'La figure B', 'Les deux']}
              correct={0}
              cols={3}
              explain="C’est la figure A. La B a un sommet décalé de quelques millimètres : invisible à l’œil, mais suffisant pour que le pliage rate."
              explainWrong="Impossible de trancher à l’œil — c’est le piège. Plions pour voir."
              solved={predictDone}
              onAnswered={() => setPredictDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Plie les deux figures',
          done: foldDone,
          content: (kit) => (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <FoldCard points={SYM} axis={AXE} folded={folded} box={BOX} label="Figure A" />
                <FoldCard points={PRESQUE} axis={AXE} folded={folded} box={BOX} label="Figure B" />
              </div>

              {!foldDone && (
                <button
                  type="button"
                  onClick={() => {
                    if (!folded) { setFolded(true); return; }
                    kit.react(true);
                    setFoldDone(true);
                  }}
                  className="w-full min-h-[44px] rounded-xl bg-indigo-600 text-white font-bold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {folded ? 'J’ai vu la différence' : '📄 Plier le long du pointillé'}
                </button>
              )}

              {folded && (
                <Feedback tone={foldDone ? 'ok' : 'info'}>
                  La figure A se superpose <strong>exactement</strong> : le pli est un{' '}
                  <strong>axe de symétrie</strong>. La figure B déborde — elle n’est pas symétrique par
                  rapport à ce pli, même si elle en avait l’air.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Qu’est-ce que ça veut dire, « symétrique » ?',
          done: ruleDone,
          content: (
            <TapQuestion
              prompt="Une figure est symétrique par rapport à une droite quand…"
              options={[
                'En pliant le long de cette droite, les deux moitiés se superposent exactement',
                'Ses deux moitiés se ressemblent beaucoup',
                'Elle est bien équilibrée à gauche et à droite',
              ]}
              correct={0}
              cols={1}
              explain="La superposition doit être EXACTE, point par point. « Se ressembler » ou « être équilibré » ne sont pas des critères géométriques."
              explainWrong="La figure B se ressemblait beaucoup de part et d’autre, et pourtant elle ne se superposait pas. Le critère est la superposition exacte."
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
          className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2"
        >
          <FlipHorizontal className="w-6 h-6 mx-auto text-indigo-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            La symétrie axiale, c’est un <strong className="text-white">pliage</strong> : le long de l’axe,
            les deux moitiés coïncident exactement. Reste à savoir où passe ce pli.
          </p>
        </motion.div>
      }
    />
  );
}
