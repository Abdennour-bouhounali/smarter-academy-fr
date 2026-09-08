import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CompasLab from '../components/CompasLab';

/**
 * Module 4 — MANIPULATION : construire au compas.
 *
 * Le module 3 dit QUELLES longueurs ferment ; celui-ci les construit. La
 * construction est jouée geste par geste, dans l'ordre exact de la feuille —
 * et le sommet obtenu vient de l'intersection réelle des deux cercles
 * (triangleDe, testé), pas d'un point posé à la main.
 *
 * LE POINT PÉDAGOGIQUE : les deux arcs se coupent en DEUX points, et les deux
 * triangles obtenus sont identiques au retournement près. C'est ce qui
 * explique pourquoi trois longueurs déterminent un triangle « à une symétrie
 * près » — et pourquoi on peut choisir n'importe lequel des deux.
 *
 * Expected observation : « le sommet est à l'intersection des deux arcs, et
 * les deux intersections donnent le même triangle retourné ».
 * Misconception targeted : croire qu'il faut mesurer des angles pour
 * construire, ou placer le troisième sommet « à peu près ».
 */
const CAS = { a: 8, b: 6, c: 5 };

export default function Module04ConstruireAuCompas() {
  const [etape, setEtape] = useState(0);
  const [construit, setConstruit] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Construis le triangle, geste par geste',
      subtitle: 'Trois longueurs : 8, 6 et 5 cm. Avance étape par étape, comme sur ta feuille.',
      done: construit,
      content: (kit) => (
        <div className="space-y-3">
          <CompasLab
            a={CAS.a} b={CAS.b} c={CAS.c}
            etape={etape}
            ariaLabel="La construction d’un triangle au compas, étape par étape"
          />
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              type="button"
              onClick={() => {
                const suivant = Math.min(4, etape + 1);
                setEtape(suivant);
                if (suivant === 4 && !construit) { setConstruit(true); kit.react?.(true); }
              }}
              disabled={etape >= 4}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition disabled:opacity-40"
            >
              {etape >= 4 ? '✓ construit' : '▶ Étape suivante'}
            </button>
            <button
              type="button"
              onClick={() => setEtape(0)}
              className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:border-slate-300 transition"
            >
              ↺ Recommencer
            </button>
          </div>
          {construit ? (
            <Feedback tone="ok">
              Le sommet A n’a pas été placé « à peu près » : c’est{' '}
              <strong>l’intersection des deux arcs</strong>. Le premier arc rassemble tous les
              points à 5 cm de B ; le second, tous ceux à 6 cm de C. Leur croisement est donc le
              seul point qui satisfait les deux conditions à la fois.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Appuie sur « Étape suivante ». Remarque qu’on commence toujours par tracer{' '}
              <strong>le plus grand côté</strong> — c’est plus commode, et cela évite les mauvaises
              surprises.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Pourquoi deux points d’intersection ?',
      done: construit,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3.5 text-sm text-slate-700">
            Regarde à nouveau la figure : les deux cercles se croisent en{' '}
            <strong>deux points</strong> — un au-dessus de [BC], un en dessous.
          </div>
          <Feedback tone="ok">
            Les deux triangles obtenus ont exactement les <strong>mêmes trois côtés</strong> : ils
            sont identiques, simplement <strong>retournés</strong> l’un par rapport à l’autre. On
            choisit donc celui qu’on veut — le plus souvent, celui du dessus.
          </Feedback>
        </div>
      ),
    },
    {
      num: 3,
      title: 'La méthode',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="construire-triangle"
            variant="new"
            lead={<>Voilà les cinq gestes que tu viens d’exécuter, dans l’ordre où ils doivent être faits.</>}
          />
          <TapQuestion
            prompt="Avant de sortir le compas pour construire un triangle de côtés 4 cm, 5 cm et 11 cm, que faut-il faire ?"
            options={[
              'Vérifier l’inégalité triangulaire : ici 11 > 4 + 5, c’est impossible',
              'Tracer directement le plus grand côté',
              'Mesurer d’abord les angles',
            ]}
            correct={0}
            cols={1}
            requires={['construire-triangle', 'inegalite-triangulaire']}
            explain="11 > 4 + 5 = 9 : les deux arcs ne se croiseraient jamais. La vérification prend deux secondes et évite de construire dans le vide."
            explainWrong="Commencer par tracer, c’est risquer de découvrir au bout de trois minutes que les arcs ne se coupent pas. L’inégalité triangulaire se vérifie AVANT tout tracé."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Ce que le compas fabrique vraiment',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Quand on trace un arc de cercle de centre B et de rayon 5 cm, quels points obtient-on ?"
            options={[
              'Tous les points situés à exactement 5 cm de B',
              'Les points situés à moins de 5 cm de B',
              'Un seul point, à 5 cm de B',
            ]}
            correct={0}
            cols={1}
            requires={['construire-triangle']}
            explain="Un cercle est l’ensemble de TOUS les points à une distance donnée de son centre. C’est pour cela que l’intersection de deux arcs donne le point qui respecte les deux distances à la fois."
            explainWrong="Le compas ne marque pas un point isolé : il balaie tous les points à la même distance du centre. C’est justement cette famille de points qu’on croise avec l’autre arc."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Cette idée — <em>l’ensemble des points à égale distance</em> — va resservir tout de
              suite. Le module suivant l’applique non plus à un point, mais à{' '}
              <strong>deux sommets à la fois</strong>.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Construire au compas"
      moduleSubtitle="Trois longueurs, deux arcs, un sommet"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Le sommet ne se place pas au hasard',
        tone: 'indigo',
        body: (
          <p>
            Avec trois longueurs valables, le triangle se construit <strong>exactement</strong>, à
            la règle et au compas. Suis les gestes un par un, et vois d’où sort le troisième
            sommet.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
