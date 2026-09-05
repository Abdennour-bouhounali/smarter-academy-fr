import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SolidView from '../components/SolidView';
import { SOLIDES } from '../components/solidesUtils';

/**
 * Module 6 — PRACTICE LAB : la 3D dans la vraie vie (P10).
 *
 * Objectif : se servir des comptes. Peindre une boîte, coller du ruban sur
 * les arêtes, emballer : chaque problème mobilise un compte précis, et
 * choisir LEQUEL fait partie du travail.
 *
 * Aha : « peindre » parle des faces, « ruban adhésif » des arêtes, « embouts
 * de protection » des sommets. Le vocabulaire dirige le calcul.
 *
 * Misconception visée : appliquer le mauvais compte — répondre 12 (arêtes)
 * quand la question porte sur les faces.
 */
const CUBE = SOLIDES.cube;

export default function Module06Problemes() {
  const [peintureDone, setPeintureDone] = useState(false);
  const [rubanDone, setRubanDone] = useState(false);
  const [choixDone, setChoixDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Problèmes de solides"
      moduleSubtitle="Emballer, peindre, protéger : la 3D dans la vraie vie."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 06',
        title: 'Le bon compte, pour la bonne question.',
        body: (
          <p>
            Faces, arêtes ou sommets ? Chaque situation en réclame un seul — à toi de choisir lequel.
          </p>
        ),
      }}
      intro={<SolidView solide="cube" ariaLabel="Une caisse cubique" />}
      steps={[
        {
          num: 1,
          title: 'Peindre la caisse',
          done: peintureDone,
          content: (
            <NumericQuestion
              prompt={
                <>
                  On veut peindre <strong>toutes les surfaces extérieures</strong> d’une caisse cubique.
                  Combien de surfaces faut-il peindre ?
                </>
              }
              suffix="faces"
              expected={CUBE.faces}
              explain={`Peindre concerne les FACES : un cube en a ${CUBE.faces}, y compris le dessous.`}
              explainFor={(n) =>
                n === CUBE.aretes
                  ? `${CUBE.aretes}, ce sont les ARÊTES — les segments, pas les surfaces. On peint ${CUBE.faces} faces.`
                  : n === 5
                    ? 'N’oublie pas le dessous : même posée, la caisse a bien 6 faces.'
                    : n === 3
                      ? 'Tu n’as compté que les faces visibles sur le dessin. L’objet en a 6.'
                      : `Un cube a ${CUBE.faces} faces.`
              }
              solved={peintureDone}
              onAnswered={() => setPeintureDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Le ruban adhésif',
          done: rubanDone,
          content: (
            <NumericQuestion
              prompt={
                <>
                  On renforce la caisse en collant du ruban le long de <strong>chaque arête</strong>. Combien
                  de morceaux de ruban faut-il ?
                </>
              }
              suffix="arêtes"
              expected={CUBE.aretes}
              explain={`Les arêtes sont les segments où deux faces se rencontrent : un cube en a ${CUBE.aretes}.`}
              explainFor={(n) =>
                n === CUBE.faces
                  ? `${CUBE.faces}, ce sont les FACES. Les arêtes sont les segments : il y en a ${CUBE.aretes}.`
                  : n === CUBE.sommets
                    ? `${CUBE.sommets}, ce sont les SOMMETS — les coins. Les arêtes sont les segments : ${CUBE.aretes}.`
                    : `Un cube a ${CUBE.aretes} arêtes : 4 en haut, 4 en bas, 4 verticales.`
              }
              solved={rubanDone}
              onAnswered={() => setRubanDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Les protège-coins',
          done: choixDone,
          content: (
            <TapQuestion
              prompt={
                <>
                  On veut poser un embout de protection sur <strong>chaque coin</strong> de la caisse. De
                  quel compte s’agit-il, et combien en faut-il ?
                </>
              }
              options={[
                `Les sommets — ${CUBE.sommets} embouts`,
                `Les arêtes — ${CUBE.aretes} embouts`,
                `Les faces — ${CUBE.faces} embouts`,
              ]}
              correct={0}
              cols={1}
              explain={`Un « coin » est un SOMMET : le point où trois arêtes se rejoignent. Un cube en a ${CUBE.sommets}.`}
              explainWrong={`Un coin est un point, pas un segment ni une surface. Ce sont les sommets — un cube en a ${CUBE.sommets}.`}
              solved={choixDone}
              onAnswered={() => setChoixDone(true)}
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
          <Package className="w-6 h-6 mx-auto text-rose-400" aria-hidden="true" />
          <div className="grid sm:grid-cols-3 gap-2 text-sm">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="font-bold text-white mb-1">Peindre, recouvrir</div>
              <div className="text-slate-300 text-xs">→ les faces ({CUBE.faces})</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="font-bold text-white mb-1">Coller, border</div>
              <div className="text-slate-300 text-xs">→ les arêtes ({CUBE.aretes})</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="font-bold text-white mb-1">Protéger les coins</div>
              <div className="text-slate-300 text-xs">→ les sommets ({CUBE.sommets})</div>
            </div>
          </div>
        </motion.div>
      }
    />
  );
}
