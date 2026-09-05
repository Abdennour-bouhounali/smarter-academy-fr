import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CoordGrid from '../components/CoordGrid';
import { makeGrid, formatCoords, samePoint } from '../components/reperageUtils';

/**
 * Module 1 — TRIGGER (conflit cognitif).
 *
 * Objectif : faire NAÎTRE le besoin d'un repérage précis, avant tout
 * vocabulaire. L'élève choisit un message à envoyer à un ami ; pour les
 * messages imprécis, trois chercheurs partent et atterrissent à trois
 * endroits DIFFÉRENTS. L'ambiguïté n'est pas expliquée : elle est montrée.
 *
 * Aha : « en haut à droite » ne désigne pas UN endroit. Deux nombres, dans un
 * ordre fixé, si.
 *
 * Misconception visée : une description qualitative (ou un seul nombre)
 * suffirait à localiser un point.
 */
const GRID = makeGrid({ cols: 7, rows: 6, step: 38 });

const TREASURE = { col: 5, row: 2 };

// Pour chaque message, les endroits où arrivent trois chercheurs qui l'ont
// suivi honnêtement. Un seul message les fait converger.
const MESSAGES = [
  {
    label: '« Le trésor est en haut à droite »',
    landings: [{ col: 5, row: 5 }, { col: 7, row: 4 }, { col: 6, row: 6 }],
  },
  {
    label: '« Le trésor est à 5 »',
    landings: [{ col: 5, row: 6 }, { col: 5, row: 0 }, { col: 0, row: 5 }],
  },
  {
    label: '« Le trésor est près du grand arbre »',
    landings: [{ col: 2, row: 1 }, { col: 4, row: 3 }, { col: 3, row: 4 }],
  },
  {
    label: '« Le trésor est à 5 pas à droite et 2 pas vers le haut »',
    landings: [TREASURE, TREASURE, TREASURE],
  },
];

const CORRECT = MESSAGES.length - 1;

/** Le résultat d'un message : les trois chercheurs, sur le quadrillage. */
function SearchResult({ pick }) {
  const msg = MESSAGES[pick];
  const converge = msg.landings.every((l) => samePoint(l, msg.landings[0]));
  const distinct = [...new Set(msg.landings.map((l) => `${l.col}-${l.row}`))].length;

  return (
    <div className="space-y-2">
      <CoordGrid
        grid={GRID}
        mode="display"
        overlay={msg.landings.map((l, i) => ({
          col: l.col,
          row: l.row,
          emoji: ['🧭', '🔍', '🏴‍☠️'][i],
          label: `chercheur ${i + 1}`,
        }))}
        showCoordsBadge={false}
        ariaLabel={
          converge
            ? 'Les trois chercheurs sont arrivés exactement au même endroit'
            : `Les trois chercheurs sont arrivés à ${distinct} endroits différents`
        }
      />
      <p className={`text-center text-sm font-semibold ${converge ? 'text-emerald-700' : 'text-rose-700'}`}>
        {converge
          ? '✓ Les trois chercheurs arrivent exactement au même endroit.'
          : `✗ Les trois chercheurs sont arrivés à ${distinct} endroits différents.`}
      </p>
    </div>
  );
}

export default function Module01TresorPerdu() {
  const [pick, setPick] = useState(null);
  const [msgDone, setMsgDone] = useState(false);
  const [countDone, setCountDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le trésor perdu"
      moduleSubtitle="Décris une position sans qu’on puisse se tromper."
      estimatedTime="8 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Ton ami cherche le trésor. Il n’a que ton message.',
        body: (
          <p>
            Tu vois le trésor ; lui, non. Choisis le message à lui envoyer — puis regarde où arrivent
            réellement trois chercheurs qui l’ont suivi.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Envoie ton message',
          subtitle: 'Un seul de ces messages conduit tout le monde au même endroit.',
          done: msgDone,
          content: (
            <TapQuestion
              above={(revealed) =>
                revealed && pick !== null ? (
                  <SearchResult pick={pick} />
                ) : (
                  <CoordGrid
                    grid={GRID}
                    mode="display"
                    overlay={[{ col: TREASURE.col, row: TREASURE.row, emoji: '💎', label: 'le trésor' }]}
                    showCoordsBadge={false}
                    ariaLabel="Quadrillage avec le trésor visible, en haut à droite"
                  />
                )
              }
              prompt="Quel message envoies-tu ?"
              options={MESSAGES.map((m) => m.label)}
              correct={CORRECT}
              cols={1}
              explain="Deux nombres, dans un ordre fixé, désignent un seul endroit. Les autres messages laissent le choix entre plusieurs cases : ils ne suffisent pas."
              explainWrong="Trois chercheurs ont suivi ton message… et ils sont arrivés à trois endroits différents. Il manque une information."
              solved={msgDone}
              onAnswered={(_, i) => {
                setPick(i);
                setMsgDone(true);
              }}
            />
          ),
        },
        {
          num: 2,
          title: 'Combien de nombres faut-il ?',
          subtitle: 'Tu viens de le constater : essaie de le formuler.',
          done: countDone,
          content: (
            <TapQuestion
              prompt="Pour désigner un seul point du quadrillage, combien de nombres faut-il donner ?"
              options={['Un seul nombre', 'Deux nombres', 'Trois nombres']}
              correct={1}
              cols={3}
              explain="Deux nombres : un pour se déplacer horizontalement, un pour se déplacer verticalement. Avec un seul, il reste toute une ligne de possibilités — c’est ce qui est arrivé au message « à 5 »."
              solved={countDone}
              onAnswered={() => setCountDone(true)}
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
          <MapPin className="w-6 h-6 mx-auto text-indigo-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Le trésor était en <span className="font-mono font-bold text-white">{formatCoords(TREASURE)}</span>.
            Deux nombres suffisent — mais dans quel ordre&nbsp;? C’est toute la question du module suivant.
          </p>
        </motion.div>
      }
    />
  );
}
