import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PointPlacer from '../components/PointPlacer';
import { formatCoords, quadrantOf } from '../components/reperageUtils';

/**
 * Module 3 — MANIPULATION : lire un point dans les quatre quadrants.
 *
 * L'élève promène LUI-MÊME le point dans les quatre régions et voit, à chaque
 * déplacement, l'écriture et la phrase changer ensemble. C'est la
 * synchronisation des registres (§10) : le dessin, le couple et la langue
 * disent la même chose au même instant.
 *
 * La règle des signes de position n'est pas donnée puis illustrée — elle est
 * CONSTATÉE en visitant les quatre quadrants, puis nommée par la brique.
 *
 * Misconception targeted (M5) : croire que le signe de l'abscisse commande la
 * hauteur. Le tri de l'étape 3 force à séparer les deux rôles.
 */
const VISITES = [
  { q: 1, label: 'en haut à droite' },
  { q: 2, label: 'en haut à gauche' },
  { q: 3, label: 'en bas à gauche' },
  { q: 4, label: 'en bas à droite' },
];

export default function Module03LireUnPoint() {
  const [p, setP] = useState({ x: 3, y: 2 });
  const [vus, setVus] = useState(() => new Set());
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const tousVus = VISITES.every((v) => vus.has(v.q));

  const bouger = (next, react) => {
    setP(next);
    const q = quadrantOf(next);
    if (typeof q === 'number' && !vus.has(q)) {
      const suivant = new Set(vus);
      suivant.add(q);
      setVus(suivant);
      if (suivant.size === VISITES.length) react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Visite les quatre quadrants',
      subtitle: 'Déplace le point : les deux axes découpent le plan en quatre régions.',
      done: tousVus,
      content: (kit) => (
        <div className="space-y-3">
          <PointPlacer
            point={p}
            onPoint={(next) => bouger(next, kit.react)}
            showQuadrantBadge
            ariaLabel="Repère du plan — déplace le point dans les quatre quadrants"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {VISITES.map((v) => (
              <div
                key={v.q}
                className={`rounded-xl border-2 px-2 py-1.5 text-center text-xs font-semibold ${
                  vus.has(v.q)
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-dashed border-slate-300 bg-white text-slate-500'
                }`}
              >
                {vus.has(v.q) ? '✓ ' : ''}{v.label}
              </div>
            ))}
          </div>

          {tousVus ? (
            <Feedback tone="ok">
              Les quatre régions visitées. Tu as vu que le <strong>premier</strong> nombre commande
              la gauche et la droite, et le <strong>second</strong> le haut et le bas — chacun son
              rôle, jamais l’un à la place de l’autre.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Il te reste des régions à visiter. Change le <strong>signe</strong> de l’un des deux
              nombres pour passer d’une région à sa voisine.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce que les signes racontent',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="quadrant"
            variant="new"
            lead={<>Les quatre régions que tu viens de visiter portent un nom, et leurs signes suffisent à les reconnaître.</>}
          />
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Sans regarder le dessin : dans quelle région se trouve chacun de ces points ?
              </p>
            }
            rows={[
              {
                id: 'r1',
                label: formatCoords({ x: -4, y: 2 }),
                options: ['en haut à gauche', 'en bas à gauche', 'en haut à droite'],
                correct: 0,
                correction: 'Abscisse négative → à gauche ; ordonnée positive → en haut.',
              },
              {
                id: 'r2',
                label: formatCoords({ x: 3, y: -3 }),
                options: ['en haut à droite', 'en bas à droite', 'en bas à gauche'],
                correct: 1,
                correction: 'Abscisse positive → à droite ; ordonnée négative → en bas.',
              },
              {
                id: 'r3',
                label: formatCoords({ x: -2, y: -1 }),
                options: ['en bas à gauche', 'en haut à gauche', 'en bas à droite'],
                correct: 0,
                correction: 'Les deux nombres sont négatifs : à gauche ET en bas.',
              },
            ]}
            requires={['quadrant', 'coordonnees']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Chaque nombre garde son rôle : le <strong>premier</strong> décide gauche ou
                  droite, le <strong>second</strong> décide haut ou bas. Il n’y a rien d’autre à
                  retenir pour situer une région.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Reprends ligne par ligne : regarde d’abord le{' '}
                  <strong>premier</strong> nombre — il ne dit que gauche ou droite. Puis le{' '}
                  <strong>second</strong> — il ne dit que haut ou bas.
                </Feedback>
              )
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Lire un point posé',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="lire-un-point"
            variant="new"
            lead={<>Voici la méthode que tu viens d’appliquer sans la nommer.</>}
          />
          <TapQuestion
            prompt="Quelles sont les coordonnées du point rouge ?"
            above={
              <PointPlacer
                point={{ x: -4, y: -2 }}
                extraPoints={[]}
                disabled
                ariaLabel="Repère — un point à lire, en bas à gauche"
              />
            }
            options={[
              formatCoords({ x: -4, y: -2 }),
              formatCoords({ x: -2, y: -4 }),
              formatCoords({ x: 4, y: 2 }),
              formatCoords({ x: -4, y: 2 }),
            ]}
            correct={0}
            cols={2}
            requires={['lire-un-point', 'coordonnees', 'quadrant']}
            explain="En descendant du point vers l’axe horizontal on lit −4 : c’est l’abscisse. En allant vers l’axe vertical on lit −2 : c’est l’ordonnée."
            explainWrong="Attention à l’ordre : l’abscisse (l’horizontale) se lit toujours en premier. Ici on descend sur l’axe horizontal et on lit −4, puis on va sur l’axe vertical et on lit −2. Le couple (−2 ; −4) désignerait un autre point."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Lire un point"
      moduleSubtitle="Quatre régions, et ce que chaque signe commande"
      estimatedTime="8 min"
      brief={{
        tag: 'Manipulation',
        title: 'Promener un point dans tout le plan',
        tone: 'indigo',
        body: (
          <p>
            Maintenant que le repère existe, il découpe le plan en{' '}
            <strong>quatre régions</strong>. Promène le point : tu verras que chacun des deux
            nombres commande une direction, et une seule.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
