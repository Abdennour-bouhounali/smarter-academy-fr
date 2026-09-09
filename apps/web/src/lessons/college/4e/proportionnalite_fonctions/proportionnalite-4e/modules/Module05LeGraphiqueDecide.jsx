import React, { useMemo, useState } from 'react';
import { LineChart, MousePointerClick } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ATELIERS, eur, alignesAvecOrigine, couples } from '../components/prop4e';

/**
 * Module 5 — MANIPULATION : le critère graphique, construit par l'élève.
 *
 * Activity              placer soi-même les points de deux situations, puis
 *                       prolonger vers l'origine.
 * Mathematical objective des points alignés ne suffisent pas ; c'est le
 *                       passage PAR L'ORIGINE qui signe la proportionnalité.
 * Student action        faire glisser chaque point sur le nœud qui convient.
 * Controlled variable   la position du point courant.
 * Mathematical state    la liste des points posés ; la validité de chacun est
 *                       CALCULÉE par la règle de l'atelier.
 * Visual consequence    le point se verrouille quand il est juste, la droite
 *                       se prolonge vers le coin.
 * Expected observation  « les deux séries sont alignées, mais une seule vise
 *                       le coin ».
 * Misconception targeted « alignés donc proportionnels » — les deux séries le
 *                       sont, et c'est le but.
 * Formalization         la brique `critere-graphique` arrive une fois les
 *                       deux droites tracées.
 *
 * DIFFÉRENCE AVEC LE MODULE 1 : là-bas, le nuage était MONTRÉ, en dernière
 * lecture, sans que l'élève y touche ; ici il le CONSTRUIT et s'en sert comme
 * critère de décision. Le module 1 ouvrait la question, celui-ci la tranche.
 */
/**
 * ATTEIGNABILITÉ (mémoire « cible atteignable sur la grille »). L'élève pose
 * ses points sur les NŒUDS du quadrillage : chaque ordonnée à atteindre doit
 * donc être un multiple du pas vertical. Avec un pas de 2, les points de
 * 2 affiches (3 € chez Cléo, 9 € chez Bruno) tombent ENTRE deux lignes et
 * seraient impossibles à poser. Le pas de 3 les contient tous —
 * 3, 6, 9, 12, 15, 18 — et garde une grille lisible. Verrouillé par un test.
 */
const XS = [2, 4, 6, 8];
const Y_STEP = 3;
const RANGE = { xMin: 0, xMax: 10, yMin: 0, yMax: 21 };

/** Un atelier, ses points à poser, et le verdict qui en découle. */
function useSerie(atelier) {
  const cibles = useMemo(() => XS.map((x) => ({ x, y: atelier.apply(x) })), [atelier]);
  const [poses, setPoses] = useState([]);
  const [curseur, setCurseur] = useState({ x: XS[0], y: 0 });

  const suivant = cibles[poses.length] ?? null;
  const deposer = () => {
    if (!suivant) return false;
    if (curseur.x === suivant.x && Math.abs(curseur.y - suivant.y) < 1e-9) {
      setPoses((p) => [...p, { ...suivant }]);
      const apres = cibles[poses.length + 1];
      if (apres) setCurseur({ x: apres.x, y: 0 });
      return true;
    }
    return false;
  };
  return { cibles, poses, curseur, setCurseur, suivant, deposer, fini: poses.length === cibles.length };
}

function SerieBoard({ atelier, serie, couleur }) {
  const points = [
    ...serie.poses.map((p, i) => ({ id: `p${i}`, x: p.x, y: p.y, color: couleur })),
    ...(serie.suivant
      ? [{ id: 'curseur', x: serie.curseur.x, y: serie.curseur.y, color: '#0f172a' }]
      : []),
  ];
  const segments = serie.fini
    ? [{ from: { x: serie.poses[0].x, y: serie.poses[0].y }, to: { x: serie.poses[serie.poses.length - 1].x, y: serie.poses[serie.poses.length - 1].y }, color: couleur }]
    : [];

  return (
    <CoordPlane
      range={RANGE}
      unit={26}
      unitY={13}
      xStep={2}
      yStep={Y_STEP}
      points={points}
      segments={segments}
      draggableId={serie.suivant ? 'curseur' : null}
      onPointChange={(_, p) => serie.setCurseur({ x: p.x, y: p.y })}
      axisLabels={{ x: 'affiches', y: '€' }}
      ariaLabel={`Nuage de points de ${atelier.nom}`}
      caption={false}
    />
  );
}

export default function Module05LeGraphiqueDecide() {
  const cleo = useSerie(ATELIERS.aLaCommande);
  const bruno = useSerie(ATELIERS.avecMiseEnRoute);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const bloc = (atelier, serie, couleur, kit) => (
    <div className="space-y-2">
      <p className="text-sm font-bold text-slate-700">{atelier.nom}</p>
      <SerieBoard atelier={atelier} serie={serie} couleur={couleur} />
      {serie.suivant ? (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
          <span className="text-xs text-slate-600">
            Place le point de <strong>{serie.suivant.x} affiches</strong> ({eur(serie.suivant.y)})
          </span>
          <button
            type="button"
            onClick={() => { if (serie.deposer()) kit?.react?.(true); }}
            className="min-h-[44px] shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white"
          >
            Poser
          </button>
        </div>
      ) : (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
          Les {XS.length} points sont posés.
        </p>
      )}
    </div>
  );

  const steps = [
    {
      num: 1,
      title: 'Place les points de Cléo',
      subtitle: 'Fais glisser le point noir jusqu’au bon nœud, puis pose-le.',
      done: cleo.fini,
      content: (kit) => (
        <div className="space-y-3">
          {bloc(ATELIERS.aLaCommande, cleo, '#4338ca', kit)}
          {cleo.fini && (
            <Feedback tone="ok">
              Quatre points alignés. Prolonge mentalement la droite vers la gauche : où
              arrive-t-elle ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Maintenant ceux de Bruno',
      subtitle: 'Même geste, même quadrillage.',
      done: bruno.fini,
      content: (kit) => (
        <div className="space-y-3">
          {bloc(ATELIERS.avecMiseEnRoute, bruno, '#b45309', kit)}
          {bruno.fini && (
            <Feedback tone="info">
              Alignés aussi ! Pourtant une seule des deux situations est proportionnelle.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce qui les sépare',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Les deux séries de points sont alignées. Qu’est-ce qui distingue celle de Cléo ?"
            options={[
              'Sa droite passe par le point (0 ; 0)',
              'Ses points sont plus rapprochés',
              'Sa droite monte plus vite',
              'Elle a plus de points',
            ]}
            correct={0}
            cols={1}
            requires={['graphique-proportionnalite', 'cinq-lectures']}
            explain={`Pour 0 affiche, Cléo demande ${eur(0)} : sa droite part du coin. Bruno demande déjà ${eur(ATELIERS.avecMiseEnRoute.apply(0))}, donc sa droite démarre plus haut.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="critere-graphique"
              variant="new"
              lead="Tu viens de construire les deux droites : voici ce qu’elles permettent de décider."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Décider tout seul',
      done: q4,
      content: (
        <TapQuestion
          prompt="Sur un graphique, quatre points sont parfaitement alignés sur une droite qui coupe l’axe vertical à 3. Que peut-on dire ?"
          options={[
            'La situation n’est pas proportionnelle',
            'La situation est proportionnelle',
            'On ne peut rien dire sans le tableau',
            'La situation est proportionnelle si les points sont assez nombreux',
          ]}
          correct={0}
          cols={1}
          requires={['critere-graphique']}
          explain="Couper l’axe vertical à 3, c’est facturer 3 pour une quantité nulle. La droite ne passe pas par l’origine : ce n’est pas proportionnel, même si tout est bien aligné."
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Le graphique décide"
      moduleSubtitle="Alignés, oui — mais avec l’origine ?"
      estimatedTime="11 min"
      brief={{
        tag: '🎬 Mission 05',
        title: 'Deux droites, un seul coin',
        tone: 'indigo',
        body: (
          <>
            Tu as vu les nuages au module 1. Cette fois, tu les construis toi-même —
            et tu t’en sers pour <strong>décider</strong>.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-purple-100 bg-purple-50/60 p-3.5">
          <LineChart className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" aria-hidden="true" />
          <p className="text-sm text-purple-900">
            <MousePointerClick className="inline h-4 w-4" aria-hidden="true" /> Fais glisser le
            point noir sur le bon nœud du quadrillage, puis pose-le. Quatre points par atelier.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
