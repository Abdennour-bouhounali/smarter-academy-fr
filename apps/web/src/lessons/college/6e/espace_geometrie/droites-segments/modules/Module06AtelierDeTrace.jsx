import React, { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
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
          <div className="space-y-5">
            <TraceWorkshop
              spec={s}
              points={POINTS}
              box={BOX}
              done={done.includes(s.id)}
              onSolved={() => mark(s.id)}
              react={kit.react}
            />
            {/* La troisième construction est la seule où l'ordre des points
                change l'objet : la brique arrive juste après ce geste-là. */}
            {s.kind === 'demi-droite' && done.includes(s.id) && (
              <KnowledgeBrick
                id="ordre-des-points"
                variant="new"
                lead="Tu viens de devoir choisir quel point serait l’origine : ce choix change l’objet."
              />
            )}
          </div>
        ),
      }))}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>La suite.</strong> Tu sais produire les objets. Reste à les dire — assez
          précisément pour qu’un camarade redessine ta figure.
        </KnowledgeSnapshot>
      }
    />
  );
}
