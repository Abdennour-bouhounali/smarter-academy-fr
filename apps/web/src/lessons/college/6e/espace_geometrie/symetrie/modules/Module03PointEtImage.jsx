import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Move } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MirrorLab from '../components/MirrorLab';
import { lineThrough, distPointLine, reflectPoint, dist } from '../components/symetrieUtils';

/**
 * Module 3 — MANIPULATION, et l'interaction SIGNATURE de la leçon.
 *
 * ACTION          l'élève déplace le point M.
 * TRANSFORMATION  M′ suit en miroir, EN DIRECT ; les deux distances à l'axe
 *                 s'affichent et restent toujours égales.
 * SENS MATH.      l'image est CALCULÉE (`reflectPoint`), jamais posée : elle
 *                 ne peut pas mentir sur la relation.
 * FEEDBACK        la marque d'angle droit au pied du trait montre la
 *                 perpendicularité ; les deux jauges montrent l'égalité.
 * GÉNÉRALISATION  deux conditions, toujours les deux ensemble.
 *
 * Misconception visée : croire qu'il suffit d'être « en face » (même
 * hauteur), sans se soucier de la distance — ou l'inverse.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 320, yMax: 220 };
const AXE = lineThrough({ x: 160, y: 0 }, { x: 160, y: 220 });

export default function Module03PointEtImage() {
  const [M, setM] = useState({ x: 85, y: 70 });
  const [explored, setExplored] = useState([]);
  const [moveDone, setMoveDone] = useState(false);
  const [distDone, setDistDone] = useState(false);
  const [axeDone, setAxeDone] = useState(false);

  const handleMove = (_, p) => {
    setM(p);
    // On note les positions explorées pour exiger une vraie exploration.
    // Grille de 20 px : au clavier (pas de 4 px), cinq appuis suffisent à
    // changer de case — une grille de 30 px rendait le compteur presque
    // impossible à faire avancer autrement qu'à la souris.
    const key = `${Math.round(p.x / 20)}-${Math.round(p.y / 20)}`;
    setExplored((e) => (e.includes(key) ? e : [...e, key]));
  };

  const dM = Math.round(distPointLine(AXE, M));
  const assez = explored.length >= 4;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le point et son image"
      moduleSubtitle="Déplace M : son image suit. Quelle règle les relie ?"
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 03',
        title: 'Le miroir ne recopie pas : il reflète.',
        body: (
          <p>
            Déplace le point <strong>M</strong> et observe <strong>M′</strong>. Surveille les deux distances
            affichées sous la figure.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Promène M et observe M′',
          subtitle: 'Essaie au moins 4 endroits différents.',
          done: moveDone,
          content: (kit) => (
            <div className="space-y-3">
              <MirrorLab
                axis={AXE}
                points={[M]}
                onPointChange={handleMove}
                box={BOX}
                disabled={moveDone}
                ariaLabel="Miroir : déplace le point M, son image M prime suit"
              />
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-mono text-slate-500">
                  Endroits explorés : {Math.min(explored.length, 4)} / 4
                </span>
                {!moveDone && (
                  <button
                    type="button"
                    disabled={!assez}
                    onClick={() => { kit.react(true); setMoveDone(true); }}
                    className="min-h-[44px] px-4 rounded-xl bg-violet-600 text-white font-bold text-sm disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    J’ai vu la règle
                  </button>
                )}
              </div>
              {moveDone && (
                <Feedback tone="ok">
                  Où que tu ailles, les deux distances restent <strong>égales</strong>, et le trait [MM′] est
                  toujours <strong>perpendiculaire</strong> à l’axe. Ces deux faits ne sont pas des
                  coïncidences : ce sont les deux conditions de la symétrie.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Que vaut la distance de M′ à l’axe ?',
          done: distDone,
          content: (
            <TapQuestion
              above={
                <MirrorLab
                  axis={AXE}
                  points={[{ x: 70, y: 90 }]}
                  box={BOX}
                  disabled
                  ariaLabel="Un point M à 90 unités de l’axe, et son image"
                />
              }
              prompt="Le point M est à 90 de l’axe. À quelle distance de l’axe se trouve son image M′ ?"
              options={['90 — la même', '45 — la moitié', '180 — le double']}
              correct={0}
              cols={3}
              explain="Le symétrique est TOUJOURS à la même distance de l’axe, de l’autre côté. C’est ce que le pliage fait : la distance ne change pas, seul le côté change."
              explainWrong="Regarde les deux jauges de l’étape 1 : elles affichent toujours le même nombre, quelle que soit la position de M."
              solved={distDone}
              onAnswered={() => setDistDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Et si M est SUR l’axe ?',
          done: axeDone,
          content: (
            <TapQuestion
              above={
                <MirrorLab
                  axis={AXE}
                  points={[{ x: 160, y: 110 }]}
                  box={BOX}
                  showConnector={false}
                  disabled
                  ariaLabel="Un point posé exactement sur l’axe"
                />
              }
              prompt="Le point M est posé exactement SUR l’axe. Où se trouve son image ?"
              options={[
                'Au même endroit : M est son propre symétrique',
                'À l’autre bout de l’axe',
                'Il n’a pas d’image',
              ]}
              correct={0}
              cols={1}
              explain="Sa distance à l’axe vaut 0 ; son image est donc aussi à 0 de l’axe, du « même côté » : c’est le point lui-même. En pliant, il reste sur le pli."
              explainWrong="Applique la règle : le symétrique est à la même distance de l’axe. Ici cette distance vaut 0 — l’image ne peut donc être que le point lui-même."
              solved={axeDone}
              onAnswered={() => setAxeDone(true)}
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
          <Move className="w-6 h-6 mx-auto text-violet-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            M et M′ sont à <strong className="text-white">égale distance</strong> de l’axe, et le trait qui
            les relie lui est <strong className="text-white">perpendiculaire</strong>. Deux conditions — à
            toi de t’en servir pour construire.
          </p>
        </motion.div>
      }
    />
  );
}
