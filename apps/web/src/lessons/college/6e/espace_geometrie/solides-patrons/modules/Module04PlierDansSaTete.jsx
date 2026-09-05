import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PatronGrid from '../components/PatronGrid';
import {
  gridFromArt, foldsIntoCube, patronHint,
  PATRON_CROIX, PATRON_IMPOSSIBLE, PATRON_BANDE,
} from '../components/solidesUtils';

/**
 * Module 4 — MANIPULATION : prédire puis vérifier (P8, P9).
 *
 * Objectif : construire mentalement le pliage AVANT de le vérifier. C'est
 * la compétence visée par le programme — se représenter le solide sans
 * l'avoir sous les yeux.
 *
 * Aha : un patron impossible ne se repère pas à sa forme, mais au fait que
 * deux cases tomberaient sur la même face — laissant une autre à découvert.
 *
 * Misconception visée : croire que « 6 cases collées » suffit. La bande de
 * six et le bloc 2×3 en sont les contre-exemples classiques.
 *
 * Politique formative : la prédiction est révélée par le SIMULATEUR, pas par
 * une réponse écrite d'avance — et `onAnswered` est inconditionnel.
 */
const PATRONS = [
  {
    id: 'p1',
    grid: PATRON_CROIX,
    label: 'Patron 1',
  },
  {
    id: 'p2',
    grid: PATRON_IMPOSSIBLE,
    label: 'Patron 2',
  },
  {
    id: 'p3',
    grid: gridFromArt(['##..', '.###', '...#']),
    label: 'Patron 3',
  },
  {
    id: 'p4',
    grid: PATRON_BANDE,
    label: 'Patron 4',
  },
];

/** Une prédiction : on répond, puis le simulateur tranche sous les yeux. */
function Prediction({ patron, done, onDone }) {
  const [answered, setAnswered] = useState(false);
  const result = foldsIntoCube(patron.grid);

  return (
    <div className="space-y-3">
      <TapQuestion
        above={
          <div className="space-y-2">
            <PatronGrid
              grid={patron.grid}
              readOnly
              showVerdict={answered || done}
              cellSize={38}
              ariaLabel={`${patron.label}, à examiner`}
            />
          </div>
        }
        prompt={`${patron.label} : en le pliant, obtiendra-t-on un cube ?`}
        options={['Oui, il se replie en cube', 'Non, il est impossible']}
        correct={result.ok ? 0 : 1}
        cols={2}
        explain={
          result.ok
            ? 'Ce patron se replie bien : les 6 cases deviennent les 6 faces, sans superposition.'
            : patronHint(result)
        }
        explainWrong={
          result.ok
            ? 'Regarde le verdict sous la grille : le pliage fonctionne. Six cases connexes ne suffisent pas — mais ici, elles se replient bien.'
            : `${patronHint(result)} Six cases collées ne suffisent donc pas : encore faut-il qu’elles se replient sans se chevaucher.`
        }
        solved={done}
        onAnswered={() => { setAnswered(true); if (!done) onDone(); }}
      />
    </div>
  );
}

export default function Module04PlierDansSaTete() {
  const [done, setDone] = useState([]);
  const [ruleDone, setRuleDone] = useState(false);
  const mark = (id) => setDone((d) => (d.includes(id) ? d : [...d, id]));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Plier dans sa tête"
      moduleSubtitle="Prédis d’abord, vérifie ensuite."
      estimatedTime="12 min"
      brief={{
        tag: '📋 Mission 04',
        title: 'Imagine le pliage avant de le voir.',
        body: (
          <p>
            Pour chaque patron, décide s’il donnera un cube. Le verdict s’affiche <strong>après</strong> ta
            réponse — c’est ta prédiction qui compte.
          </p>
        ),
      }}
      steps={[
        ...PATRONS.map((p, i) => ({
          num: i + 1,
          title: `${p.label} — se replie-t-il ?`,
          done: done.includes(p.id),
          content: <Prediction patron={p} done={done.includes(p.id)} onDone={() => mark(p.id)} />,
        })),
        {
          num: PATRONS.length + 1,
          title: 'Comment repérer un patron impossible ?',
          done: ruleDone,
          content: (
            <TapQuestion
              prompt="Qu’est-ce qui rend un patron de 6 cases impossible à replier en cube ?"
              options={[
                'Deux cases tomberaient sur la même face, en laissant une autre à découvert',
                'Il a trop de cases',
                'Sa forme n’est pas une croix',
              ]}
              correct={0}
              cols={1}
              explain="Un cube a exactement 6 faces : il faut donc que les 6 cases occupent 6 faces DIFFÉRENTES. Deux cases sur la même face, et il en manque forcément une ailleurs."
              explainWrong="Le nombre de cases est bon (6), et la croix n’est qu’un patron parmi onze. Le vrai critère est la superposition au pliage."
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
          <Brain className="w-6 h-6 mx-auto text-purple-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Six cases collées ne suffisent pas. Il faut qu’elles se replient sur{' '}
            <strong className="text-white">six faces différentes</strong> — sinon une face resterait ouverte.
          </p>
        </motion.div>
      }
    />
  );
}
