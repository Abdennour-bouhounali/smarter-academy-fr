import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Box } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SolidView from '../components/SolidView';
import { SOLIDES } from '../components/solidesUtils';

/**
 * Module 1 — TRIGGER (conflit cognitif).
 *
 * Objectif : faire sentir l'écart entre un DESSIN (plat, sur la feuille) et
 * l'OBJET (en volume). Sur un dessin de cube, on ne voit que 3 faces sur 6 :
 * les autres existent pourtant.
 *
 * Aha : le dessin ment par omission. Les arêtes en pointillé sont là pour
 * rappeler ce qu'on ne voit pas — et le compte réel ne se lit pas sur le
 * dessin, il se raisonne.
 *
 * Misconception visée : compter les faces visibles et croire qu'on a compté
 * le solide.
 */
export default function Module01BoiteMysterieuse() {
  const [visiblesDone, setVisiblesDone] = useState(false);
  const [totalDone, setTotalDone] = useState(false);
  const [pointilleDone, setPointilleDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La boîte mystérieuse"
      moduleSubtitle="Un dessin plat, un objet en volume."
      estimatedTime="9 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Ce dessin cache la moitié de l’objet.',
        body: (
          <p>
            Une feuille est plate ; un cube ne l’est pas. Regarde bien ce que le dessin montre — et ce qu’il
            ne montre pas.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Combien de faces VOIS-tu ?',
          done: visiblesDone,
          content: (
            <TapQuestion
              above={<SolidView solide="cube" ariaLabel="Un cube dessiné en perspective" />}
              prompt="Sur ce dessin, combien de faces du cube peux-tu réellement voir ?"
              options={['3 faces', '6 faces', '4 faces']}
              correct={0}
              cols={3}
              explain="On n’en voit que 3 : le dessus, le devant et un côté. Les trois autres sont derrière."
              explainWrong="Compte celles qui sont face à toi : le dessus, le devant, un côté. Les trois autres sont cachées derrière."
              solved={visiblesDone}
              onAnswered={() => setVisiblesDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Et combien en a-t-il vraiment ?',
          done: totalDone,
          content: (
            <TapQuestion
              above={<SolidView solide="cube" highlight="faces" ariaLabel="Le même cube, avec ses arêtes cachées en pointillé" />}
              prompt="Un cube, en tant qu’objet, possède combien de faces au total ?"
              options={[`${SOLIDES.cube.faces} faces`, '3 faces', '4 faces']}
              correct={0}
              cols={3}
              explain="6 faces : les 3 visibles, et les 3 cachées derrière. Elles existent même si le dessin ne les montre pas."
              explainWrong="Le dessin n’en montre que 3, mais l’objet en a 6 — une boîte a bien un fond et un arrière."
              solved={totalDone}
              onAnswered={() => setTotalDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'À quoi servent les pointillés ?',
          done: pointilleDone,
          content: (
            <TapQuestion
              above={<SolidView solide="cube" highlight="aretes" ariaLabel="Cube avec les arêtes cachées en pointillé" />}
              prompt="Sur ce dessin, certaines arêtes sont en pointillé. Pourquoi ?"
              options={[
                'Ce sont les arêtes cachées : elles existent, mais on ne les verrait pas',
                'Ce sont des arêtes plus courtes',
                'C’est une décoration',
              ]}
              correct={0}
              cols={1}
              explain="Le pointillé est la convention du dessin technique : il signale ce qui est derrière. L’objet possède ces arêtes, le dessin doit donc les indiquer."
              explainWrong="Toutes les arêtes d’un cube ont la même longueur. Le pointillé n’indique pas une taille mais une position : derrière."
              solved={pointilleDone}
              onAnswered={() => setPointilleDone(true)}
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
          <Box className="w-6 h-6 mx-auto text-indigo-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Un dessin est <strong className="text-white">plat</strong> ; le solide, lui, a un derrière. Pour
            le compter correctement, il faut raisonner — pas seulement regarder.
          </p>
        </motion.div>
      }
    />
  );
}
