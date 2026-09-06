import React, { useState } from 'react';
import { Hash } from 'lucide-react';
import { ContentModule, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CoordPlane from '../../../../../common/components/CoordPlane';
import {
  RANGE, vecFromPoints, formatVec, equalVectors, translatePoint,
} from '../components/vectorUtils';

/**
 * Module 5 — MANIPULATION : lire et calculer les composantes.
 *
 * Activity              lire un vecteur sur le quadrillage, puis le calculer.
 * Mathematical objective les coordonnées d'un vecteur sont la différence des
 *                       coordonnées de ses extrémités : (x_B − x_A ; y_B − y_A).
 * Student action        compter les carreaux, puis passer au calcul.
 * Controlled variable   —
 * Mathematical state    deux points et le vecteur qui les relie.
 * Visual consequence    la flèche est décomposée en un pas horizontal et un
 *                       pas vertical.
 * Misconception ciblée   soustraire dans le mauvais sens (départ − arrivée),
 *                       et échanger les deux composantes. `explainFor`
 *                       intercepte les deux.
 * Formalization         la formule est posée à l'étape 2, après le comptage.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   La règle « arrivée − départ » ne vivait que dans l'encadré d'intro et dans
 *   le `footer` — c'est-à-dire APRÈS les trois questions qui l'exigent. L'ordre
 *   est maintenant : compter les carreaux (l'étape 1 n'a besoin que de compter)
 *   → brique `coordonnees-vecteur`, qui transforme le comptage en calcul, avec
 *   le calcul de C vers D en essai immédiat → le « à mémoriser » → le tableau
 *   des égalités, qui s'appuie sur les deux.
 */
const A = { x: -4, y: -2 };
const B = { x: 2, y: 1 };
const AB = vecFromPoints(A, B);

export default function Module05DeuxNombres() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [batch, setBatch] = useState(false);

  const escalier = (toSvg) => {
    const a = toSvg(A.x, A.y);
    const corner = toSvg(B.x, A.y);
    const b = toSvg(B.x, B.y);
    return (
      <g>
        <line x1={a.x} y1={a.y} x2={corner.x} y2={corner.y}
          stroke="#0284c7" strokeWidth="2.5" strokeDasharray="5 4" />
        <line x1={corner.x} y1={corner.y} x2={b.x} y2={b.y}
          stroke="#059669" strokeWidth="2.5" strokeDasharray="5 4" />
        <text x={(a.x + corner.x) / 2} y={a.y + 18} textAnchor="middle" fontSize="12"
          className="font-mono font-semibold" fill="#0369a1">+{AB.dx}</text>
        <text x={corner.x + 14} y={(corner.y + b.y) / 2} textAnchor="start" fontSize="12"
          className="font-mono font-semibold" fill="#047857">+{AB.dy}</text>
      </g>
    );
  };

  const steps = [
    {
      num: 1,
      title: 'Compter les carreaux',
      subtitle: 'Le trajet en escalier montre les deux composantes.',
      done: q1,
      content: (
        <div className="space-y-3">
          <CoordPlane
            range={RANGE}
            points={[
              { id: 'A', name: 'A', x: A.x, y: A.y, color: '#e11d48' },
              { id: 'B', name: 'B', x: B.x, y: B.y, color: '#e11d48' },
            ]}
            arrows={[{ id: 'ab', from: A, to: B, color: '#7c3aed' }]}
            overlay={escalier}
            caption={false}
            ariaLabel="Flèche de A à B, décomposée en un pas horizontal puis un pas vertical"
          />
          <NumericQuestion
            prompt="De combien se déplace-t-on HORIZONTALEMENT pour aller de A à B ?"
            expected={AB.dx}
            parse={(s) => Number(String(s).replace(',', '.').replace('−', '-'))}
            display={String(AB.dx)}
            width="w-24"
            requires={['composante', 'abscisse']}
            explain={`De l’abscisse ${A.x} à l’abscisse ${B.x}, on avance de ${B.x} − (${A.x}) = ${AB.dx} carreaux vers la droite.`}
            explainFor={(n) => (n === -AB.dx
              ? 'Tu as soustrait dans l’autre sens. On calcule toujours ARRIVÉE − DÉPART : le déplacement va de A vers B.'
              : null)}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Passer au calcul',
      subtitle: 'Sans compter les carreaux, cette fois.',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3 text-center">
            <p className="text-sm text-slate-700">
              C est en <strong>(5 ; −3)</strong> et D est en <strong>(1 ; 2)</strong>. Cette
              fois, il n’y a pas de quadrillage à regarder.
            </p>
          </div>
          <KnowledgeBrick
            id="coordonnees-vecteur"
            variant="new"
            lead={`Tu viens de compter ${AB.dx} carreaux vers la droite — c’est exactement ce que donne la soustraction ${B.x} − (${A.x}). Compter et calculer sont la même opération.`}
          >
            <NumericQuestion
              prompt="Quelle est la composante VERTICALE du déplacement de C vers D ?"
              expected={5}
              parse={(s) => Number(String(s).replace(',', '.').replace('−', '-'))}
              display="5"
              width="w-24"
              requires={['coordonnees-vecteur', 'composante', 'ordonnee']}
              explain="On fait arrivée − départ sur les ordonnées : 2 − (−3) = 2 + 3 = 5. Le déplacement va vers le haut."
              explainFor={(n) => (n === -5
                ? 'Signe inversé : tu as calculé départ − arrivée. Le déplacement de C vers D se lit 2 − (−3).'
                : n === -4 ? 'Tu as pris la composante horizontale (1 − 5 = −4). La question porte sur la verticale, donc sur les ordonnées.' : null)}
              solved={q2}
              onAnswered={() => setQ2(true)}
            />
          </KnowledgeBrick>
          {q2 && <KnowledgeBrick id="mem-arrivee-moins-depart" variant="new" compact />}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Égaux ou pas ?',
      subtitle: 'Deux flèches sont égales si leurs deux composantes coïncident.',
      done: batch,
      content: (
        <BatchChoiceQuestion
          requires={['coordonnees-vecteur', 'vecteurs-egaux', 'deplacement-oppose', 'composante']}
          intro={
            <p className="text-sm text-slate-700">
              Pour chaque paire de flèches, dis si elles représentent le même vecteur.
            </p>
          }
          rows={[
            {
              id: 'p1', label: 'De (0 ; 0) à (3 ; 1), et de (−4 ; 2) à (−1 ; 3)',
              options: ['Même vecteur', 'Vecteurs différents'],
              correct: 0,
              correction: 'Les deux valent (3 ; 1) : 3 − 0 = 3 et 1 − 0 = 1 ; puis −1 − (−4) = 3 et 3 − 2 = 1. Mêmes composantes, même vecteur.',
            },
            {
              id: 'p2', label: 'De (1 ; 1) à (4 ; 2), et de (4 ; 2) à (1 ; 1)',
              options: ['Même vecteur', 'Vecteurs différents'],
              correct: 1,
              correction: 'Le premier vaut (3 ; 1), le second (−3 ; −1) : ce sont des vecteurs OPPOSÉS. Même direction et même longueur, mais sens contraires.',
            },
            {
              id: 'p3', label: 'De (−2 ; 0) à (0 ; 4), et de (3 ; −1) à (5 ; 3)',
              options: ['Même vecteur', 'Vecteurs différents'],
              correct: 0,
              correction: 'Les deux valent (2 ; 4). L’éloignement entre les deux flèches ne change rien.',
            },
            {
              id: 'p4', label: 'De (0 ; 0) à (2 ; 3), et de (0 ; 0) à (3 ; 2)',
              options: ['Même vecteur', 'Vecteurs différents'],
              correct: 1,
              correction: '(2 ; 3) et (3 ; 2) : les composantes sont échangées, donc les directions diffèrent. Même point de départ, mais pas le même déplacement.',
            },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'info'}>
              {allRight
                ? 'Tu compares les composantes, et rien d’autre : c’est exactement le bon critère.'
                : `${nCorrect} sur ${total}. Calcule à chaque fois arrivée − départ, sur chacune des deux coordonnées, puis compare.`}
            </Feedback>
          )}
          solved={batch}
          onAnswered={() => setBatch(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Deux nombres suffisent"
      moduleSubtitle="Les coordonnées d’un vecteur"
      estimatedTime="10 min"
      brief={{
        tag: 'Manipulation',
        title: 'Écrire un déplacement',
        tone: 'purple',
        body: (
          <p>
            Un vecteur tient en <strong>deux nombres</strong> : le pas horizontal et le pas
            vertical. Ils se lisent sur le quadrillage, et se calculent à partir des coordonnées.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3 flex gap-3 items-start">
          <Hash className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-purple-900">
            Commence par compter sur le quadrillage. Tu chercheras ensuite l’opération qui donne le
            même résultat sans compter.
          </p>
        </div>
      }
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Tu sais calculer un vecteur. Il ne manque qu’une chose : la
          façon dont les mathématiciens l’écrivent.
        </KnowledgeSnapshot>
      }
    />
  );
}
