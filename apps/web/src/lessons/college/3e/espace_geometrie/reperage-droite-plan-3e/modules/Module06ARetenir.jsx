import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { ContentModule, BatchChoiceQuestion, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PARC, formatCoords } from '../components/reperageUtils';

/**
 * Module 6 — FORMALISATION.
 *
 * Rien de nouveau ici : chaque règle est la mise en mots d'un geste déjà fait.
 * L'ordre suit celui des modules — c'est ce qui permet de dire à l'élève
 * « tu l'as vu au module 2 » plutôt que « apprends ceci ».
 *
 * Activity              relier chaque règle au geste qui l'a produite.
 * Misconception ciblée   apprendre la notation sans le sens : l'étape 2 teste
 *                       des cas limites (point sur un axe, origine).
 */
const RANGE = PARC.range;
const DEMO = { x: -4, y: 3 };

export default function Module06ARetenir() {
  const [batch, setBatch] = useState(false);
  const [q2, setQ2] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Trois règles, trois gestes',
      subtitle: 'Retrouve d’où vient chacune.',
      done: batch,
      content: (
        <BatchChoiceQuestion
          intro={
            <div className="space-y-3">
              <CoordPlane
                range={RANGE}
                points={[{ id: 'M', name: 'M', x: DEMO.x, y: DEMO.y, color: '#2563eb' }]}
                guides={DEMO}
                caption={false}
                ariaLabel="Point M en (−4 ; 3) avec ses deux projections sur les axes"
              />
              <p className="text-center text-sm text-slate-700">
                M {formatCoords(DEMO)} — abscisse −4 sur l’axe horizontal, ordonnée 3 sur l’axe vertical.
              </p>
            </div>
          }
          rows={[
            {
              id: 'ordre',
              label: 'Pourquoi écrit-on (x ; y) et jamais (y ; x) ?',
              options: [
                'Parce que la première place désigne l’horizontal et la seconde le vertical',
                'Parce que x vient avant y dans l’alphabet',
              ],
              correct: 0,
              correction: 'Au module 2, bouger le premier réglage ne déplaçait le point qu’horizontalement. C’est la PLACE dans le couple qui donne le rôle, pas le nom de la lettre.',
            },
            {
              id: 'lecture',
              label: 'Comment lit-on les coordonnées d’un point ?',
              options: [
                'En le projetant sur chacun des deux axes',
                'En mesurant sa distance à l’origine',
              ],
              correct: 0,
              correction: 'C’est le geste des deux guides du module 3 : chaque axe reçoit une projection, et donne une coordonnée.',
            },
            {
              id: 'longueur',
              label: 'Comment trouve-t-on la longueur d’un segment horizontal ?',
              options: [
                'En calculant l’écart des abscisses, en valeur absolue',
                'En additionnant les deux abscisses',
              ],
              correct: 0,
              correction: 'Module 5 : seule la coordonnée qui change porte la longueur, et une longueur est toujours positive.',
            },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'info'}>
              {allRight
                ? 'Les trois règles sont reliées à leur geste : c’est ainsi qu’on les retient sans les apprendre par cœur.'
                : `${nCorrect} sur ${total}. Relis les corrections : chacune renvoie au module où tu l’as vu se produire.`}
            </Feedback>
          )}
          solved={batch}
          onAnswered={() => setBatch(true)}
        />
      ),
    },
    {
      num: 2,
      title: 'Les cas particuliers',
      subtitle: 'Ceux qu’on oublie souvent.',
      done: q2,
      content: (
        <TapQuestion
          prompt="Quelle affirmation est VRAIE ?"
          options={[
            'Un point situé sur l’axe vertical a une abscisse nulle.',
            'Un point situé sur l’axe vertical a une ordonnée nulle.',
            'L’origine n’a pas de coordonnées.',
            'Un point d’abscisse négative est forcément en dessous de l’axe horizontal.',
          ]}
          correct={0}
          cols={1}
          explain="Sur l’axe vertical, on ne s’est pas décalé horizontalement : x = 0. L’origine, elle, a bien des coordonnées : (0 ; 0). Et le signe de l’abscisse dit gauche/droite, jamais haut/bas."
          solved={q2}
          onAnswered={() => setQ2(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Ce qu’on retient"
      moduleSubtitle="Les mots, après les gestes"
      estimatedTime="7 min"
      brief={{
        tag: 'Formalisation',
        title: 'Mettre des mots',
        tone: 'blue',
        body: (
          <p>
            Tu as tout manipulé. Il reste à nommer les choses proprement — et à repérer les cas
            particuliers qui piègent le plus souvent.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 space-y-2">
          <div className="flex gap-2 items-center">
            <BookOpen className="w-5 h-5 text-blue-700" aria-hidden="true" />
            <p className="font-bold text-blue-900">À retenir</p>
          </div>
          <ul className="text-sm text-blue-900 space-y-1.5 list-disc pl-5">
            <li>
              Un point du plan est repéré par un <strong>couple</strong> (x ; y) :
              x est son <strong>abscisse</strong>, y son <strong>ordonnée</strong>.
            </li>
            <li>
              L’abscisse se lit sur l’axe <strong>horizontal</strong>, l’ordonnée sur l’axe{' '}
              <strong>vertical</strong>. On les sépare par un point-virgule.
            </li>
            <li>
              Le signe donne le côté : abscisse négative = à gauche, ordonnée négative = en dessous.
            </li>
            <li>
              Segment <strong>horizontal</strong> : longueur = |x<sub>B</sub> − x<sub>A</sub>|.
              Segment <strong>vertical</strong> : longueur = |y<sub>B</sub> − y<sub>A</sub>|.
            </li>
            <li>
              <strong>Milieu</strong> : chaque coordonnée est la moyenne des deux.
            </li>
          </ul>
        </div>
      }
      steps={steps}
      footer={
        <Feedback tone="ok">
          Ces règles suffisent pour tout le reste de la leçon : construire des figures, prouver
          qu’un triangle est isocèle, retrouver un symétrique.
        </Feedback>
      }
    />
  );
}
