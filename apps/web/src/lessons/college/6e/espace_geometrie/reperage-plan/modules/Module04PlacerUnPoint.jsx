import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Eye } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CoordGrid from '../components/CoordGrid';
import {
  makeGrid, formatCoords, samePoint, swapNode, describeDisplacement,
} from '../components/reperageUtils';

/**
 * Module 4 — MANIPULATION : placer un point à partir de ses coordonnées (P4).
 *
 * Objectif : le geste inverse du module 3. On donne les deux nombres,
 * l'élève pose le point.
 *
 * Aha : placer, c'est avancer sur l'horizontale PUIS monter — l'ordre des
 * deux nombres est l'ordre des deux gestes.
 *
 * Politique formative : le placement ne se valide pas « au clic » mais sur
 * l'objectif réel (le bon nœud). Tant que ce n'est pas le bon, l'élève garde
 * la main, voit son point ET l'écart chiffré. Au bout de 3 essais, une
 * sortie de secours révèle et complète — jamais de blocage.
 */
const GRID = makeGrid({ cols: 7, rows: 6, step: 38 });

const TARGETS = [
  { id: 't1', node: { col: 3, row: 5 }, hint: 'Avance de 3 sur l’axe horizontal, puis monte de 5.' },
  { id: 't2', node: { col: 6, row: 1 }, hint: 'Le premier nombre est grand, le second petit : loin à droite, tout en bas.' },
  { id: 't3', node: { col: 0, row: 4 }, hint: 'Un 0 en première position : on ne bouge pas horizontalement, on reste sur l’axe vertical.' },
];

const MAX_TRIES = 3;

/** Une mission de placement : cible annoncée, point posé par l'élève. */
function PlaceMission({ target, done, onDone, react }) {
  const [point, setPoint] = useState(null);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const ok = point && samePoint(point, target.node);
  const wrong = point && !ok;
  const exhausted = tries >= MAX_TRIES;

  const handleChange = (n) => {
    if (done || revealed) return;
    setPoint(n);
    if (samePoint(n, target.node)) {
      react(true);
      onDone();
      return;
    }
    setTries((t) => t + 1);
    react(false);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-2.5 text-center">
        <span className="text-sm text-amber-900">
          Place le point en{' '}
          <strong className="font-mono text-base">{formatCoords(target.node)}</strong>
        </span>
      </div>

      <CoordGrid
        grid={GRID}
        mode="place"
        point={point}
        onPointChange={handleChange}
        target={done || revealed ? target.node : null}
        ghost={revealed && !ok ? { ...target.node, label: formatCoords(target.node) } : null}
        disabled={done || revealed}
        ariaLabel={`Quadrillage : place un point aux coordonnées ${formatCoords(target.node)}`}
      />

      {/* Conséquence visible : le point reste où l'élève l'a mis, et l'écart
          est chiffré. Le contrôle n'est jamais retiré. */}
      {wrong && !revealed && !done && (
        <Feedback tone="ko">
          Ton point est en <strong className="font-mono">{formatCoords(point)}</strong>. Depuis là, il
          faudrait encore {describeDisplacement(point, target.node)}.
          {samePoint(point, swapNode(target.node)) && (
            <> Tu as posé les deux nombres dans l’ordre inverse&nbsp;!</>
          )}
          {tries === 1 && <> {target.hint}</>}
        </Feedback>
      )}

      {/* Ne JAMAIS conditionner ce retour à `!done` : onDone() bascule `done`
          au rendu suivant et le message disparaîtrait aussitôt (playbook §8).
          On teste l'état interne `revealed`, qui appartient à ce composant. */}
      {revealed && (
        <Feedback tone="info">
          Pas grave, on te le montre : {formatCoords(target.node)} se trouve à{' '}
          {describeDisplacement({ col: 0, row: 0 }, target.node)} depuis l’origine.
        </Feedback>
      )}

      {ok && (
        <Feedback tone="ok">
          Exactement : {formatCoords(target.node)}. Horizontale d’abord, verticale ensuite.
        </Feedback>
      )}

      {/* Sortie de secours après 3 essais — révèle ET complète. */}
      {exhausted && !done && !revealed && (
        <button
          type="button"
          onClick={() => {
            setRevealed(true);
            onDone();
          }}
          className="w-full min-h-[44px] rounded-xl border-2 border-sky-300 bg-sky-50 text-sky-800 font-bold text-sm hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Eye className="w-4 h-4 inline mr-1.5" aria-hidden="true" />
          Je ne trouve pas — montre-moi
        </button>
      )}
    </div>
  );
}

export default function Module04PlacerUnPoint() {
  const [placed, setPlaced] = useState([]);
  const [orderDone, setOrderDone] = useState(false);
  const mark = (id) => setPlaced((p) => (p.includes(id) ? p : [...p, id]));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Placer un point"
      moduleSubtitle="On te donne les deux nombres : à toi de poser le point au bon nœud."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 04',
        title: 'Le geste inverse : des nombres vers le point.',
        body: (
          <p>
            Trois points à poser. Touche le quadrillage — ou déplace-toi avec les flèches du clavier — pour
            atteindre exactement le nœud demandé.
          </p>
        ),
      }}
      steps={[
        ...TARGETS.map((t, i) => ({
          num: i + 1,
          title: `Pose le point ${formatCoords(t.node)}`,
          done: placed.includes(t.id),
          content: (kit) => (
            <PlaceMission
              target={t}
              done={placed.includes(t.id)}
              onDone={() => mark(t.id)}
              react={kit.react}
            />
          ),
        })),
        {
          num: TARGETS.length + 1,
          title: 'Dans quel ordre travailles-tu ?',
          done: orderDone,
          content: (
            <TapQuestion
              prompt="Pour placer le point (3 ; 5) en partant de l’origine, quel est le bon enchaînement ?"
              options={[
                'J’avance de 3 horizontalement, puis je monte de 5',
                'Je monte de 3, puis j’avance de 5',
                'J’avance de 5 horizontalement, puis je monte de 3',
              ]}
              correct={0}
              cols={1}
              explain="Le premier nombre est toujours le déplacement horizontal, le second la montée : 3 vers la droite, puis 5 vers le haut."
              explainWrong="Les deux autres enchaînements utilisent les nombres dans le mauvais rôle — ils mènent à un autre point du quadrillage."
              solved={orderDone}
              onAnswered={() => setOrderDone(true)}
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
          <Target className="w-6 h-6 mx-auto text-violet-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Lire et placer sont deux gestes inverses, mais ils suivent le même ordre :{' '}
            <strong className="text-white">horizontale d’abord, verticale ensuite</strong>.
          </p>
        </motion.div>
      }
    />
  );
}
