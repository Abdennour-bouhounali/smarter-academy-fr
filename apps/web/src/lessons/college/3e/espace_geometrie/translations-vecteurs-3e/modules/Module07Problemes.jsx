import React, { useState } from 'react';
import { Boxes, Layers } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CoordPlane from '../../../../../common/components/CoordPlane';
import VectorLab from '../components/VectorLab';
import {
  RANGE, FIGURES, vecFromPoints, fourthPoint, isParallelogram, translatePolygon,
  translatePoint, equalVectors, formatVec,
} from '../components/vectorUtils';

/**
 * Module 7 — LABORATOIRE : les vecteurs comme outil.
 *
 * Activity              compléter un parallélogramme, puis construire une frise.
 * Mathematical objective utiliser l'égalité de deux vecteurs pour PRODUIRE un
 *                       point, et la répétition d'un vecteur pour produire un
 *                       motif.
 * Student action        placer le quatrième sommet ; appliquer deux fois le
 *                       même vecteur.
 * Mathematical state    trois points connus, un à construire.
 * Visual consequence    le quadrilatère se ferme et se colore quand l'égalité
 *                       vectorielle est vraie (`isParallelogram`).
 * Misconception ciblée   l'ordre des sommets : ABDC n'est pas ABCD. L'énoncé
 *                       nomme explicitement les côtés opposés.
 * Transfer              la frise montre qu'un vecteur se réutilise autant de
 *                       fois qu'on veut.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Les deux méthodes de ce module — construire un point par un vecteur, puis
 *   répéter et enchaîner — ne vivaient que dans le `footer`, donc après les
 *   trois problèmes qui s'en servent. Chacune est maintenant posée par une
 *   brique à l'instant où le geste vient de l'établir : la construction du
 *   quatrième sommet à l'étape 1, la répétition et l'enchaînement à l'étape 3,
 *   qui porte le calcul en essai immédiat.
 */
const A = { x: -5, y: -1 };
const B = { x: -2, y: 1 };
const C = { x: -1, y: -3 };
const D_CIBLE = fourthPoint(A, B, C);   // AB = CD

const MOTIF = FIGURES.motif;
const PAS = { dx: 3, dy: 0 };

export default function Module07Problemes() {
  const [d, setD] = useState({ x: 0, y: 0 });
  const done1 = d.x === D_CIBLE.x && d.y === D_CIBLE.y;

  const [pas, setPas] = useState({ dx: 1, dy: 2 });
  const done2 = equalVectors(pas, PAS);

  const [q3, setQ3] = useState(false);

  const bump = (axis, delta, react) => {
    const next = {
      ...d,
      [axis]: Math.max(RANGE.xMin, Math.min(RANGE.xMax, d[axis] + delta)),
    };
    setD(next);
    if (next.x === D_CIBLE.x && next.y === D_CIBLE.y) react(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Fermer le parallélogramme',
      subtitle: 'Place D pour que le déplacement de C à D soit le même que de A à B.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            A {`(${A.x} ; ${A.y})`}, B {`(${B.x} ; ${B.y})`}, C {`(${C.x} ; ${C.y})`}. Pour que
            ABDC soit un parallélogramme, il faut que le déplacement de <strong>C vers D</strong>{' '}
            soit exactement celui de <strong>A vers B</strong>, c’est-à-dire{' '}
            {formatVec(vecFromPoints(A, B))}.
          </p>
          <CoordPlane
            range={RANGE}
            points={[
              { id: 'A', name: 'A', x: A.x, y: A.y, color: '#0f172a' },
              { id: 'B', name: 'B', x: B.x, y: B.y, color: '#0f172a' },
              { id: 'C', name: 'C', x: C.x, y: C.y, color: '#0f172a' },
              { id: 'D', name: 'D', x: d.x, y: d.y, color: '#4f46e5' },
            ]}
            arrows={[
              { id: 'ab', from: A, to: B, color: '#7c3aed' },
              { id: 'cd', from: C, to: d, color: '#059669' },
            ]}
            polygons={isParallelogram(A, B, C, d)
              ? [{ id: 'p', points: [A, B, d, C], fill: '#a7f3d0', stroke: '#059669' }]
              : []}
            caption={false}
            ariaLabel="Trois sommets et un quatrième à placer pour former un parallélogramme"
          />
          <div className="flex items-center gap-2 justify-center flex-wrap">
            {[['x', 'Abscisse de D'], ['y', 'Ordonnée de D']].map(([axis, label]) => (
              <div key={axis} className="flex items-center gap-1">
                <span className="text-xs font-semibold text-slate-600">{label}</span>
                <button type="button" aria-label={`Diminuer ${label}`} disabled={done1}
                  onClick={() => bump(axis, -1, kit.react)}
                  className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">−</button>
                <span className="w-9 text-center font-mono font-bold tabular-nums">
                  {String(d[axis]).replace('-', '−')}
                </span>
                <button type="button" aria-label={`Augmenter ${label}`} disabled={done1}
                  onClick={() => bump(axis, 1, kit.react)}
                  className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">+</button>
              </div>
            ))}
          </div>
          {done1 ? (
            <KnowledgeBrick
              id="construire-quatrieme-point"
              variant="new"
              lead={(
                <>
                  D {`(${D_CIBLE.x} ; ${D_CIBLE.y})`}. Les deux flèches sont identiques, donc ABDC
                  est un parallélogramme. Tu ne l’as pas trouvé à la règle : tu l’as calculé.
                </>
              )}
            />
          ) : (
            <Feedback tone="info">
              Déplacement de C à D actuellement : {formatVec(vecFromPoints(C, d))}. Il doit valoir{' '}
              {formatVec(vecFromPoints(A, B))}.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La frise',
      subtitle: 'Un motif, répété par le même vecteur.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Pour une frise régulière, le motif doit se répéter <strong>horizontalement</strong>,
            décalé de 3 carreaux, sans monter ni descendre. Règle le pas.
          </p>
          <VectorLab
            origin={MOTIF[0]}
            vector={pas}
            onVectorChange={(nv) => {
              setPas(nv);
              if (equalVectors(nv, PAS)) kit.react(true);
            }}
            mode="build"
            range={RANGE}
            figure={MOTIF}
            ghosts={equalVectors(pas, PAS)
              ? [{ origin: translatePoint(MOTIF[0], PAS), vector: PAS, label: '' }]
              : []}
            disabled={done2}
            ariaLabel="Règle le pas de la frise"
          />
          {done2 ? (
            <Feedback tone="ok">
              Pas de frise {formatVec(PAS)} : purement horizontal. En appliquant ce même vecteur
              encore et encore, on obtient une bande régulière — c’est ainsi que se construisent
              les frises et les pavages.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Pas actuel {formatVec(pas)}.
              {pas.dy !== 0 && ' Le motif monte ou descend : la composante verticale doit être nulle.'}
              {pas.dy === 0 && pas.dx !== PAS.dx && ` Le décalage horizontal doit valoir ${PAS.dx}.`}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Enchaîner deux déplacements',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3">
            <p className="text-sm text-slate-700">
              Un drone part de (−2 ; 1). Il effectue d’abord le déplacement (3 ; −4), puis le
              déplacement (1 ; 5).
            </p>
          </div>
          <KnowledgeBrick
            id="repeter-enchainer"
            variant="new"
            lead="La frise que tu viens de régler applique le même vecteur encore et encore. Ici, ce sont deux vecteurs DIFFÉRENTS qui se suivent — et cela se calcule de la même façon."
          >
            <NumericQuestion
              prompt="Quelle est l’ordonnée de son point d’arrivée ?"
              expected={2}
              parse={(s) => Number(String(s).replace(',', '.').replace('−', '-'))}
              display="2"
              width="w-24"
              requires={['repeter-enchainer', 'composante', 'ordonnee']}
              explain="On additionne les déplacements verticaux : 1 − 4 + 5 = 2. Enchaîner deux déplacements revient à ajouter leurs composantes."
              explainFor={(n) => (n === 1
                ? 'Tu as gardé l’ordonnée de départ : le drone a bel et bien bougé verticalement, deux fois.'
                : n === -3 ? 'Tu n’as appliqué que le premier déplacement : il y en a deux à enchaîner.' : null)}
              solved={q3}
              onAnswered={() => setQ3(true)}
            />
          </KnowledgeBrick>
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Problèmes de déplacement"
      moduleSubtitle="Le vecteur comme outil de construction"
      estimatedTime="9 min"
      brief={{
        tag: 'Atelier',
        title: 'Construire avec des vecteurs',
        tone: 'rose',
        body: (
          <p>
            Trois problèmes où le vecteur ne se contente pas de décrire : il sert à{' '}
            <strong>trouver</strong> un point, à répéter un motif, à enchaîner des trajets.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Boxes, t: 'Construire', d: 'Le quatrième sommet se calcule.', c: 'text-rose-600' },
            { icon: Layers, t: 'Répéter', d: 'Un même vecteur, autant de fois qu’on veut.', c: 'text-violet-600' },
          ].map(({ icon: Icon, t, d, c }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className={`w-5 h-5 mb-1 ${c}`} aria-hidden="true" />
              <p className="font-semibold text-slate-800 text-sm">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={7}>
          <strong>La suite.</strong> Ta carte est complète. Il ne reste qu’à tout mettre à
          l’épreuve, en dix questions.
        </KnowledgeSnapshot>
      }
    />
  );
}
