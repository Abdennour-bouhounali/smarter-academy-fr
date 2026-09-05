import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ShapeLab from '../components/ShapeLab';
import { propertiesOf, PROPERTIES, classifyQuad, SHAPE_LABEL } from '../components/figuresUtils';

/**
 * Module 5 — FORMALISATION (P7, P8).
 *
 * Ce module ne fait rien découvrir : il MET EN MOTS ce que les modules 1 à 4
 * ont fait manipuler, sous forme de fiches d'identité. Chaque ligne renvoie
 * à un voyant que l'élève a déjà vu s'allumer.
 *
 * Aha : comparer deux figures, ce n'est pas les regarder — c'est comparer
 * leurs listes de propriétés, ligne à ligne.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 260, yMax: 190 };

const CARRE = [{ x: 70, y: 40 }, { x: 190, y: 40 }, { x: 190, y: 160 }, { x: 70, y: 160 }];
const RECT = [{ x: 40, y: 55 }, { x: 220, y: 55 }, { x: 220, y: 145 }, { x: 40, y: 145 }];
const LOSANGE = [{ x: 130, y: 30 }, { x: 215, y: 100 }, { x: 130, y: 170 }, { x: 45, y: 100 }];

const FICHES = [CARRE, RECT, LOSANGE];

/** Une fiche d'identité : les propriétés cochées, calculées en direct. */
function Fiche({ pts }) {
  const props = propertiesOf(pts);
  const kind = classifyQuad(pts);
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
      <ShapeLab
        points={pts} box={BOX} draggable={false}
        showName={false} showProperties={false} size={220}
        ariaLabel={`Fiche : ${SHAPE_LABEL[kind]}`}
      />
      <div className="text-center font-space font-extrabold text-indigo-900 capitalize">
        {SHAPE_LABEL[kind]}
      </div>
      <ul className="space-y-1">
        {PROPERTIES.map((p) => (
          <li
            key={p.id}
            className={`text-[11px] flex items-center gap-1.5 ${props[p.id] ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}
          >
            <span aria-hidden="true">{props[p.id] ? '✓' : '○'}</span>
            {p.short}
          </li>
        ))}
      </ul>
    </div>
  );
}

const COMPARE_ROWS = [
  { id: 'r1', label: <>Le carré et le rectangle ont tous deux 4 angles droits.</>, correct: 0 },
  { id: 'r2', label: <>Le losange a 4 angles droits.</>, correct: 1 },
  { id: 'r3', label: <>Le carré et le losange ont tous deux 4 côtés égaux.</>, correct: 0 },
  { id: 'r4', label: <>Le rectangle a tous ses côtés égaux.</>, correct: 1 },
];

export default function Module05CarteIdentite() {
  const [readDone, setReadDone] = useState(false);
  const [compareDone, setCompareDone] = useState(false);
  const [describeDone, setDescribeDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="La carte d’identité des figures"
      moduleSubtitle="Chaque figure a sa liste de propriétés."
      estimatedTime="9 min"
      brief={{
        tag: '📋 Mission 05',
        title: 'Trois fiches, à lire ligne à ligne.',
        body: <p>Rien de nouveau ici : on met des mots sur les voyants que tu as vus s’allumer.</p>,
      }}
      intro={
        <div className="grid sm:grid-cols-3 gap-3">
          {FICHES.map((pts, i) => (
            <Fiche key={i} pts={pts} />
          ))}
        </div>
      }
      steps={[
        {
          num: 1,
          title: 'Ce qui distingue le carré du rectangle',
          done: readDone,
          content: (
            <TapQuestion
              prompt="En comparant les deux fiches, quelle est la SEULE propriété que le carré a en plus du rectangle ?"
              options={[
                'Ses quatre côtés sont égaux',
                'Ses angles sont droits',
                'Ses côtés opposés sont parallèles',
              ]}
              correct={0}
              cols={1}
              explain="Les deux ont 4 angles droits et des côtés opposés parallèles. Seule l’égalité des QUATRE côtés sépare le carré du rectangle."
              explainWrong="Regarde les deux fiches côte à côte : les lignes « angles droits » et « côtés opposés parallèles » sont cochées des deux côtés. La seule différence est l’égalité des quatre côtés."
              solved={readDone}
              onAnswered={() => setReadDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Vrai ou faux, d’après les fiches',
          done: compareDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  Réponds en lisant les fiches ci-dessus — pas en te fiant à l’allure des dessins.
                </p>
              }
              rows={COMPARE_ROWS.map((r) => ({
                id: r.id,
                label: <span className="text-sm">{r.label}</span>,
                options: ['Vrai', 'Faux'],
                correct: r.correct,
                correction: <>{r.correct === 0 ? 'vrai' : 'faux'}</>,
              }))}
              solved={compareDone}
              onAnswered={() => setCompareDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Comparer deux figures, c’est comparer deux LISTES de propriétés — ligne par ligne, sans
                  regarder les dessins.
                </Feedback>
              )}
            />
          ),
        },
        {
          num: 3,
          title: 'Décris une figure',
          done: describeDone,
          content: (
            <TapQuestion
              prompt="Quelle description permet de reconnaître un LOSANGE à coup sûr ?"
              options={[
                'Un quadrilatère dont les 4 côtés sont égaux',
                'Un quadrilatère penché',
                'Un carré posé sur la pointe',
              ]}
              correct={0}
              cols={1}
              explain="Une description doit énoncer des PROPRIÉTÉS vérifiables. « Penché » ou « sur la pointe » décrivent une position sur la feuille, pas la figure."
              explainWrong="Attention : tourner un carré ne change pas sa nature — il reste un carré. Une description valable ne parle jamais de l’orientation, seulement des côtés et des angles."
              solved={describeDone}
              onAnswered={() => setDescribeDone(true)}
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
          <ClipboardList className="w-6 h-6 mx-auto text-blue-400" aria-hidden="true" />
          <p className="text-center text-xs font-mono uppercase tracking-widest text-slate-400">À retenir</p>
          <p className="text-sm text-slate-300 text-center">
            Décrire une figure, c’est donner la <strong className="text-white">liste des propriétés</strong>{' '}
            qu’elle vérifie. Comparer deux figures, c’est comparer leurs deux listes — jamais leurs dessins.
          </p>
        </motion.div>
      }
    />
  );
}
