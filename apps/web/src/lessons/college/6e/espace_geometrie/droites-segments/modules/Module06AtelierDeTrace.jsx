import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool } from 'lucide-react';
import { ContentModule } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TraceWorkshop from '../components/TraceWorkshop';

/**
 * Module 6 — PRACTICE LAB : construire et prolonger (P8).
 *
 * Objectif : passer de « reconnaître » à « produire ». L'élève décide
 * lui-même par où passe l'objet et jusqu'où il va.
 *
 * Aha : construire une demi-droite oblige à choisir SON ORIGINE — l'ordre
 * des deux points cesse d'être indifférent.
 *
 * Misconception visée : croire que [AB) et [BA) désignent le même objet.
 * Ils partagent la même droite support mais partent dans des sens opposés.
 *
 * Validation SÉMANTIQUE : on compare {type, points} à la consigne, jamais la
 * géométrie du tracé au pixel près.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 320, yMax: 180 };

const POINTS = [
  { name: 'A', x: 70, y: 130 },
  { name: 'B', x: 175, y: 70 },
  { name: 'C', x: 255, y: 135 },
];

const SPECS = [
  {
    id: 't1',
    kind: 'segment',
    from: 'A',
    through: 'B',
    label: 'Trace le segment qui relie A et B — il doit s’arrêter aux deux bouts.',
  },
  {
    id: 't2',
    kind: 'droite',
    from: 'B',
    through: 'C',
    label: 'Trace la droite passant par B et C — elle ne doit s’arrêter nulle part.',
  },
  {
    id: 't3',
    kind: 'demi-droite',
    from: 'A',
    through: 'C',
    label: 'Trace la demi-droite d’origine A passant par C. Attention à l’ordre : l’origine d’abord.',
  },
];

export default function Module06AtelierDeTrace() {
  const [done, setDone] = useState([]);
  const mark = (id) => setDone((d) => (d.includes(id) ? d : [...d, id]));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="L’atelier de tracé"
      moduleSubtitle="À toi de produire l’objet demandé."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 06',
        title: 'Deux décisions à chaque tracé.',
        body: (
          <p>
            <strong>Par où ça passe</strong> (les deux points) et <strong>jusqu’où ça va</strong> (le type).
            Choisis, puis trace.
          </p>
        ),
      }}
      steps={SPECS.map((s, i) => ({
        num: i + 1,
        title: `Construction ${i + 1}`,
        done: done.includes(s.id),
        content: (kit) => (
          <TraceWorkshop
            spec={s}
            points={POINTS}
            box={BOX}
            done={done.includes(s.id)}
            onSolved={() => mark(s.id)}
            react={kit.react}
          />
        ),
      }))}
      footer={
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2"
        >
          <PenTool className="w-6 h-6 mx-auto text-purple-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            <span className="font-mono text-white">[AC)</span> et{' '}
            <span className="font-mono text-white">[CA)</span> ne sont pas le même objet : même droite
            support, mais des origines — et donc des sens — opposés.
          </p>
        </motion.div>
      }
    />
  );
}
