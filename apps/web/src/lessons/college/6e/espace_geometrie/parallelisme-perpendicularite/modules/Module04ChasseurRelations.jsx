import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { ContentModule, BatchChoiceQuestion, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RelationFigure from '../components/RelationFigure';
import { relationOf, RELATIONS, RELATION_LABEL } from '../components/relationsUtils';

/**
 * Module 4 — MANIPULATION : repérer les deux relations dans le monde réel.
 *
 * Objectif : transférer. Les rues d'un quartier, les lignes d'un cahier, les
 * montants d'une fenêtre : les deux relations sont partout, et il faut les
 * NOMMER, pas seulement les reconnaître sur une figure abstraite.
 *
 * Aha : dans un même dessin, une droite peut être parallèle à l'une et
 * perpendiculaire à l'autre. La relation n'appartient pas à une droite seule,
 * elle lie deux droites.
 *
 * Misconception visée : parler d'« une droite parallèle » dans l'absolu.
 * Parallèle à QUOI ? La relation est toujours binaire.
 *
 * Chaque verdict vient de relationOf : le dessin et la réponse attendue ne
 * peuvent pas diverger.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 300, yMax: 170 };

/* Le quartier : trois rues, deux relations à identifier. */
const RUES = [
  { p: { x: 20, y: 55 }, angleDeg: 0, name: 'Rue A' },
  { p: { x: 20, y: 120 }, angleDeg: 0, name: 'Rue B' },
  { p: { x: 175, y: 20 }, angleDeg: 90, name: 'Rue C' },
];

const PAIRS = [
  { id: 'ab', i: 0, j: 1, label: 'Rue A et Rue B' },
  { id: 'ac', i: 0, j: 2, label: 'Rue A et Rue C' },
  { id: 'bc', i: 1, j: 2, label: 'Rue B et Rue C' },
];

const OPTIONS = [RELATIONS.paralleles, RELATIONS.perpendiculaires, RELATIONS.secantes];

export default function Module04ChasseurRelations() {
  const [pairsDone, setPairsDone] = useState(false);
  const [binaryDone, setBinaryDone] = useState(false);
  const [deduceDone, setDeduceDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Le chasseur de relations"
      moduleSubtitle="Dans la ville, sur la feuille : repère les deux relations."
      estimatedTime="8 min"
      brief={{
        tag: '📋 Mission 04',
        title: 'Un plan de quartier, trois rues.',
        body: (
          <p>
            Pour chaque paire de rues, dis quelle relation les lie. Attention : une même rue peut être
            parallèle à l’une et perpendiculaire à l’autre.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Identifie les trois relations',
          done: pairsDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <div className="space-y-2">
                  <RelationFigure
                    droites={RUES}
                    box={BOX}
                    showMarks={false}
                    showIntersection={false}
                    ariaLabel="Plan de quartier : rue A et rue B horizontales, rue C verticale"
                  />
                  <p className="text-sm text-slate-600">
                    Rappelle-toi : parallèles = écart constant, jamais de point commun. Perpendiculaires =
                    angle droit.
                  </p>
                </div>
              }
              rows={PAIRS.map((p) => ({
                id: p.id,
                label: <span className="font-semibold">{p.label}</span>,
                options: OPTIONS.map((o) => RELATION_LABEL[o]),
                correct: OPTIONS.indexOf(relationOf(RUES[p.i], RUES[p.j])),
                correction: <>{RELATION_LABEL[relationOf(RUES[p.i], RUES[p.j])]}</>,
              }))}
              solved={pairsDone}
              onAnswered={() => setPairsDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Les rues A et B ne se coupent jamais : parallèles. La rue C croise les deux à angle droit :
                  elle est perpendiculaire à chacune.
                </Feedback>
              )}
            />
          ),
        },
        {
          num: 2,
          title: 'Parallèle… à quoi ?',
          done: binaryDone,
          content: (
            <TapQuestion
              prompt="Un élève dit : « la rue A est parallèle ». Qu’est-ce qui cloche dans cette phrase ?"
              options={[
                'Il manque à quoi : une droite est parallèle à une autre droite',
                'Rien, la phrase est correcte',
                'Il faudrait dire « perpendiculaire »',
              ]}
              correct={0}
              cols={1}
              explain="Parallèle et perpendiculaire sont des RELATIONS : elles lient deux droites. Une droite seule n’est ni parallèle ni perpendiculaire — il faut toujours préciser à quoi."
              explainWrong="Ce n’est pas une question de vocabulaire mais de logique : « parallèle » relie forcément deux objets. La rue A est parallèle à la rue B, et perpendiculaire à la rue C."
              solved={binaryDone}
              onAnswered={() => setBinaryDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Déduis sans mesurer',
          done: deduceDone,
          content: (
            <TapQuestion
              prompt={
                <>
                  La rue C est perpendiculaire à la rue A <em>et</em> à la rue B. Que peut-on en déduire sur
                  les rues A et B ?
                </>
              }
              options={[
                'Elles sont parallèles entre elles',
                'Elles sont perpendiculaires entre elles',
                'On ne peut rien en déduire',
              ]}
              correct={0}
              cols={1}
              explain="Deux droites perpendiculaires à une même troisième sont parallèles entre elles. C’est une propriété très utile : elle permet de tracer une parallèle en traçant deux perpendiculaires."
              explainWrong="Si A et B faisaient toutes les deux un angle droit avec C, elles auraient forcément la même inclinaison — donc elles sont parallèles. C’est ce que montre le plan."
              solved={deduceDone}
              onAnswered={() => setDeduceDone(true)}
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
          <Search className="w-6 h-6 mx-auto text-violet-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Parallèle et perpendiculaire sont des <strong className="text-white">relations entre deux
            droites</strong>. Et deux perpendiculaires à une même droite sont parallèles entre elles — tu
            t’en serviras pour construire.
          </p>
        </motion.div>
      }
    />
  );
}
