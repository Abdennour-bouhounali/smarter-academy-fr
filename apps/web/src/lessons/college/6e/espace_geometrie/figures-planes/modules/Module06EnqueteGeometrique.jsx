import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SHAPE_LABEL } from '../components/figuresUtils';

/**
 * Module 6 — PRACTICE LAB : identifier par déduction (P9).
 *
 * Objectif : lire des indices et éliminer. C'est le raisonnement inverse des
 * modules précédents — on part des propriétés, on remonte à la figure.
 *
 * Aha : il faut parfois PLUSIEURS indices pour trancher. Un seul indice
 * laisse souvent plusieurs figures possibles — et savoir combien il en reste
 * fait partie du raisonnement.
 *
 * Misconception visée : conclure trop vite sur un seul indice (« 4 côtés
 * égaux, donc c'est un carré » — non, ce peut être un losange).
 */
const ENQUETES = [
  {
    id: 'e1',
    indices: [
      'J’ai 4 côtés.',
      'Mes 4 angles sont droits.',
      'Mes 4 côtés ne sont PAS tous égaux.',
    ],
    options: ['rectangle', 'carre', 'losange'],
    correct: 0,
    explain:
      '4 angles droits élimine le losange ; « côtés non tous égaux » élimine le carré. Il ne reste que le rectangle.',
    explainWrong:
      'Le troisième indice est décisif : sans lui, carré et rectangle restaient tous deux possibles. Avec lui, seul le rectangle convient.',
  },
  {
    id: 'e2',
    indices: [
      'J’ai 4 côtés, tous de la même longueur.',
      'Aucun de mes angles n’est droit.',
    ],
    options: ['losange', 'carre', 'rectangle'],
    correct: 0,
    explain:
      '4 côtés égaux : carré ou losange. « Aucun angle droit » élimine le carré. C’est donc un losange.',
    explainWrong:
      'Attention au piège : « 4 côtés égaux » ne suffit PAS à conclure au carré — le losange les a aussi. C’est le second indice qui tranche.',
  },
  {
    id: 'e3',
    indices: [
      'J’ai 3 côtés.',
      'Deux de mes côtés ont la même longueur.',
      'L’un de mes angles mesure 90°.',
    ],
    options: ['triangle-rectangle', 'triangle-equilateral', 'triangle-quelconque'],
    correct: 0,
    explain:
      '3 côtés : un triangle. Deux côtés égaux : isocèle. Un angle de 90° : rectangle. C’est un triangle isocèle rectangle — la réponse attendue est « triangle rectangle ».',
    explainWrong:
      'Un équilatéral a ses TROIS côtés égaux et aucun angle droit (ses angles font 60°). Ici, l’angle de 90° impose le triangle rectangle.',
  },
];

/** Une enquête : les indices se dévoilent un par un, puis on conclut. */
function Enquete({ enquete, done, onDone, react }) {
  const [shown, setShown] = useState(1);
  const allShown = shown >= enquete.indices.length;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 space-y-2">
        <p className="text-xs font-mono uppercase tracking-wide text-rose-500">
          Indices ({shown} / {enquete.indices.length})
        </p>
        <ul className="space-y-1.5">
          {enquete.indices.slice(0, shown).map((ind, i) => (
            <li key={i} className="text-sm text-rose-900 flex items-start gap-2">
              <span className="font-mono font-bold" aria-hidden="true">{i + 1}.</span>
              {ind}
            </li>
          ))}
        </ul>
        {!allShown && !done && (
          <button
            type="button"
            onClick={() => setShown((s) => s + 1)}
            className="min-h-[44px] px-4 rounded-xl border-2 border-rose-300 bg-white text-xs font-mono font-bold text-rose-700 hover:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Indice suivant →
          </button>
        )}
      </div>

      {allShown ? (
        <TapQuestion
          prompt="De quelle figure s’agit-il ?"
          options={enquete.options.map((o) => SHAPE_LABEL[o])}
          correct={enquete.correct}
          cols={enquete.options.length}
          explain={enquete.explain}
          explainWrong={enquete.explainWrong}
          solved={done}
          onAnswered={(ok) => { if (!done) onDone(); }}
        />
      ) : (
        <p className="text-sm text-slate-500 text-center">
          Continue à découvrir les indices avant de conclure.
        </p>
      )}
    </div>
  );
}

export default function Module06EnqueteGeometrique() {
  const [done, setDone] = useState([]);
  const [prudenceDone, setPrudenceDone] = useState(false);
  const mark = (id) => setDone((d) => (d.includes(id) ? d : [...d, id]));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="L’enquête géométrique"
      moduleSubtitle="Des indices, une seule figure possible."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 06',
        title: 'Cette fois, tu ne vois pas la figure.',
        body: (
          <p>
            Seulement des indices. Découvre-les un par un, élimine, puis conclus — comme un vrai
            raisonnement géométrique.
          </p>
        ),
      }}
      steps={[
        ...ENQUETES.map((e, i) => ({
          num: i + 1,
          title: `Enquête ${i + 1}`,
          done: done.includes(e.id),
          content: (kit) => (
            <Enquete enquete={e} done={done.includes(e.id)} onDone={() => mark(e.id)} react={kit.react} />
          ),
        })),
        {
          num: ENQUETES.length + 1,
          title: 'Un seul indice suffit-il ?',
          done: prudenceDone,
          content: (
            <TapQuestion
              prompt="On te dit seulement : « cette figure a 4 côtés égaux ». Peux-tu conclure que c’est un carré ?"
              options={[
                'Non : ce peut être un carré ou un losange',
                'Oui : 4 côtés égaux, c’est la définition du carré',
                'Non : il faut connaître sa taille',
              ]}
              correct={0}
              cols={1}
              explain="Le losange a lui aussi 4 côtés égaux. Pour trancher, il faut un indice sur les ANGLES. Un seul indice laisse souvent plusieurs figures possibles."
              explainWrong="Le carré n’est pas la seule figure à 4 côtés égaux : le losange aussi. Il manque une information sur les angles."
              solved={prudenceDone}
              onAnswered={() => setPrudenceDone(true)}
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
          <Search className="w-6 h-6 mx-auto text-rose-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Identifier une figure, c’est <strong className="text-white">éliminer</strong> celles qui ne
            vérifient pas les indices. Et tant qu’il en reste plusieurs, on ne conclut pas.
          </p>
        </motion.div>
      }
    />
  );
}
