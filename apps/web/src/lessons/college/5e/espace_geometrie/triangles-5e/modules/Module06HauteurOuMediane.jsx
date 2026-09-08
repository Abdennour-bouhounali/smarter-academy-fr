import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import HauteurMedianeLab from '../components/HauteurMedianeLab';

/**
 * Module 6 — ENTRAÎNEMENT : hauteur ou médiane ?
 *
 * Deux objets qu'on confond parce qu'ils partent du même sommet et arrivent
 * sur le même côté. Le module les sépare en montrant que leurs points
 * d'arrivée sont DISTINCTS — et mesure cette distance en direct, pour que
 * l'élève voie le cas isocèle apparaître comme une exception, pas comme la
 * règle.
 *
 * Puis vient la seconde démonstration exigée par le programme : la médiane
 * partage le triangle en deux triangles de MÊME AIRE. Elle est ici précédée
 * d'une recherche (les deux nombres restent collés quoi qu'on déforme), puis
 * expliquée par ses deux ingrédients — même base, même hauteur — tous deux
 * VISIBLES sur la figure.
 *
 * Expected observation : « la médiane vise le milieu, la hauteur tombe
 * perpendiculairement ; et les deux moitiés découpées par la médiane ont
 * toujours la même aire ».
 * Misconception targeted : croire que hauteur et médiane sont la même chose,
 * et croire que « même aire » implique « même forme ».
 */
const DEPART = [{ x: 320, y: 120 }, { x: 170, y: 390 }, { x: 590, y: 350 }];

export default function Module06HauteurOuMediane() {
  const [tri, setTri] = useState(DEPART);
  const [triAires, setTriAires] = useState(DEPART);
  const [vuDistinct, setVuDistinct] = useState(false);
  const [essaisAires, setEssaisAires] = useState(0);
  const [renonce, setRenonce] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const assez = essaisAires >= 6;

  const steps = [
    {
      num: 1,
      title: 'Deux droites, un seul sommet',
      subtitle: 'Elles partent du même point A. Déforme le triangle et regarde où chacune arrive.',
      done: vuDistinct,
      content: (kit) => (
        <div className="space-y-3">
          <HauteurMedianeLab
            tri={tri}
            onTri={(t) => {
              setTri(t);
              if (!vuDistinct) { setVuDistinct(true); kit.react?.(true); }
            }}
            mode="les-deux"
            ariaLabel="La hauteur et la médiane issues du sommet A, et la distance entre leurs points d’arrivée"
          />
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3">
              <div className="font-bold text-sky-800">— La hauteur (trait plein bleu)</div>
              <div className="text-xs text-slate-600">tombe <strong>perpendiculairement</strong> sur (BC), en H</div>
            </div>
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3">
              <div className="font-bold text-emerald-800">- - La médiane (pointillé vert)</div>
              <div className="text-xs text-slate-600">rejoint le <strong>milieu</strong> de [BC], en M</div>
            </div>
          </div>
          {vuDistinct ? (
            <Feedback tone="ok">
              H et M sont <strong>deux points différents</strong>. Essaie maintenant de les faire
              coïncider : tu n’y arriveras qu’en rendant le triangle{' '}
              <strong>isocèle en A</strong> — c’est-à-dire dans un cas très particulier.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Traîne un sommet. Les deux droites partent du même point, mais elles n’arrivent pas au
              même endroit — la bande du bas mesure l’écart.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce que la médiane fait au triangle',
      subtitle: 'Défi : déforme le triangle pour rendre les deux moitiés d’aires différentes.',
      done: renonce,
      content: (kit) => (
        <div className="space-y-3">
          <HauteurMedianeLab
            tri={triAires}
            onTri={(t) => { setTriAires(t); setEssaisAires((n) => n + 1); }}
            mode="aires"
            ariaLabel="La médiane partage le triangle en deux morceaux dont les aires sont mesurées"
          />
          {renonce ? (
            <Feedback tone="ok">
              Les deux morceaux n’ont pas la même forme — l’un est souvent tout étiré, l’autre
              trapu — et pourtant leurs aires sont <strong>rigoureusement égales</strong>. Il y a
              une raison, et elle tient en deux mots.
            </Feedback>
          ) : (
            <>
              <Feedback tone="info">
                Positions essayées : <strong className="tabular-nums">{essaisAires}</strong>. Les
                deux morceaux ont des formes très différentes : leurs aires devraient bien finir par
                se séparer…
              </Feedback>
              {assez && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setRenonce(true); kit.react?.(true); }}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 transition"
                  >
                    Les deux aires restent toujours égales
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Les deux mots : même base, même hauteur',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="hauteur-et-mediane"
            variant="new"
            lead={<>Avant d’expliquer les aires, fixons le vocabulaire des deux droites que tu viens de comparer.</>}
          />
          <KnowledgeBrick
            id="mediane-deux-aires-egales"
            variant="new"
            lead={<>Et voici pourquoi les deux morceaux ont toujours la même aire, quelle que soit leur forme.</>}
          />
          <BatchChoiceQuestion
            intro={<p className="text-sm text-slate-700">Pour chaque affirmation, dis si elle est vraie ou fausse.</p>}
            rows={[
              {
                id: 'r1',
                label: 'La hauteur issue de A arrive au milieu de [BC].',
                options: ['Faux', 'Vrai'],
                correct: 0,
                correction: 'C’est la MÉDIANE qui vise le milieu. La hauteur, elle, tombe perpendiculairement — et rarement au milieu.',
              },
              {
                id: 'r2',
                label: 'La médiane issue de A arrive au milieu de [BC].',
                options: ['Vrai', 'Faux'],
                correct: 0,
                correction: 'C’est exactement sa définition.',
              },
              {
                id: 'r3',
                label: 'Les deux morceaux découpés par la médiane ont la même forme.',
                options: ['Faux', 'Vrai'],
                correct: 0,
                correction: 'Ils ont la même AIRE, pas la même forme — tu l’as vu : l’un peut être très étiré et l’autre trapu.',
              },
              {
                id: 'r4',
                label: 'Dans un triangle isocèle, hauteur et médiane issues du sommet principal sont confondues.',
                options: ['Vrai', 'Faux'],
                correct: 0,
                correction: 'C’est le cas particulier que tu as trouvé en cherchant à faire coïncider H et M.',
              },
            ]}
            requires={['hauteur-et-mediane', 'mediane-deux-aires-egales']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Deux mots à retenir pour ne plus jamais les confondre :{' '}
                  <strong>hauteur → perpendiculaire</strong>,{' '}
                  <strong>médiane → milieu</strong>.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Le repère infaillible : le mot <em>médiane</em> contient{' '}
                  <em>médi-</em>, comme <em>milieu</em>. La hauteur, elle, est celle qui sert à
                  calculer l’aire — donc celle qui est perpendiculaire à la base.
                </Feedback>
              )
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'L’hypothèse est-elle indispensable ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Une droite part de A vers un point de [BC] qui n’est PAS le milieu. Partage-t-elle le triangle en deux aires égales ?"
            options={[
              'Non : sans le milieu, les deux bases diffèrent, donc les aires aussi',
              'Oui : toute droite issue de A partage en deux parts égales',
              'Oui, si elle est perpendiculaire à [BC]',
            ]}
            correct={0}
            cols={1}
            requires={['mediane-deux-aires-egales']}
            explain="La preuve reposait sur DEUX ingrédients : même hauteur (toujours vrai pour une droite issue de A) et même base (vrai seulement si le point est le milieu). Sans le milieu, la seconde condition tombe et les aires diffèrent."
            explainWrong="La hauteur est bien la même pour n’importe quelle droite issue de A. Mais si le point d’arrivée n’est pas le milieu, les deux bases sont différentes — et base × hauteur ÷ 2 donne alors deux résultats différents."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="ok">
              C’est cela, une démonstration : chaque hypothèse sert à quelque chose. Retire le
              milieu, et le résultat s’effondre.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Hauteur ou médiane ?"
      moduleSubtitle="Deux droites qu’on confond, et un partage d’aires à démontrer"
      estimatedTime="12 min"
      brief={{
        tag: 'Entraînement',
        title: 'Même départ, arrivées différentes',
        tone: 'indigo',
        body: (
          <p>
            La hauteur et la médiane partent toutes deux d’un sommet et arrivent sur le côté
            opposé. Pourtant, ce sont <strong>deux droites différentes</strong> — et l’une d’elles
            a une propriété que l’autre n’a pas.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
