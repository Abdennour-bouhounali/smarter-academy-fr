import React, { useState } from 'react';
import { Target, RotateCw } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SquareBalance from '../components/SquareBalance';
import {
  ORIENTATIONS, hypotenuseIndex, rightVertexIndex, sideLengths, VERTEX_NAMES,
} from '../components/pythagoreUtils';

/**
 * Module 1 — DÉCLENCHEUR : trouver l'hypoténuse quand rien n'est droit.
 *
 * Activity              repérer l'angle droit puis l'hypoténuse sur des
 *                       triangles posés de travers.
 * Mathematical objective l'hypoténuse est le côté OPPOSÉ à l'angle droit —
 *                       une définition relationnelle, pas visuelle.
 * Student action        choisir un sommet, puis un côté.
 * Mathematical state    le triangle ; l'hypoténuse est CALCULÉE.
 * Visual consequence    la marque d'angle droit n'apparaît que sur le bon
 *                       sommet.
 * Misconception ciblée   « l'hypoténuse est le côté du bas / le côté
 *                       horizontal / le plus long qu'on voit ». Les trois
 *                       triangles sont volontairement inclinés.
 * Feedback              on renvoie à la relation, jamais à l'apparence.
 * Formalization         l'hypoténuse est aussi le plus grand côté — constaté
 *                       à l'étape 3, pas asséné.
 */
const T = ORIENTATIONS;

export default function Module01AngleDroitEtHypotenuse() {
  const [q1, setQ1] = useState(false);
  const [batch, setBatch] = useState(false);
  const [q3, setQ3] = useState(false);

  /* Sur chaque triangle, l'angle droit est en A et l'hypoténuse est [BC]. */
  const hyp = (pts) => {
    const h = hypotenuseIndex(pts, 3);
    return h === null ? '—' : `[${VERTEX_NAMES[h]}${VERTEX_NAMES[(h + 1) % 3]}]`;
  };

  const steps = [
    {
      num: 1,
      title: 'Où est l’angle droit ?',
      subtitle: 'Ce triangle est rectangle — mais pas posé comme dans le cahier.',
      done: q1,
      content: (
        <div className="space-y-3">
          <SquareBalance
            points={T[1].pts}
            draggable={false}
            showAreas={false}
            showBalance={false}
            ariaLabel="Triangle rectangle incliné, angle droit au sommet A"
          />
          <TapQuestion
            prompt="À quel sommet se trouve l’angle droit ?"
            options={['En A', 'En B', 'En C', 'Il n’y en a pas']}
            correct={0}
            cols={4}
            explain="La petite marque carrée apparaît en A : c’est là que les deux côtés se rencontrent perpendiculairement. Elle n’est dessinée que lorsque l’angle vaut vraiment 90°."
            explainWrong="Ne te fie pas à l’orientation du dessin : cherche la marque carrée, qui signale l’angle droit où qu’il se trouve."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Trois triangles, trois hypoténuses',
      subtitle: 'L’hypoténuse est le côté opposé à l’angle droit.',
      done: batch,
      content: (
        <BatchChoiceQuestion
          intro={
            <div className="space-y-3">
              <p className="text-sm text-slate-700">
                Sur chacun de ces triangles rectangles, l’angle droit est en <strong>A</strong>.
                Trouve l’hypoténuse.
              </p>
              <div className="grid sm:grid-cols-3 gap-2">
                {T.map((o) => (
                  <div key={o.id} className="space-y-1">
                    <p className="text-xs font-semibold text-slate-600 text-center">{o.label}</p>
                    <SquareBalance
                      points={o.pts}
                      draggable={false}
                      showAreas={false}
                      showBalance={false}
                      ariaLabel={`${o.label} : triangle rectangle en A`}
                    />
                  </div>
                ))}
              </div>
            </div>
          }
          rows={T.map((o, i) => ({
            id: o.id,
            label: `${o.label} : quelle est l’hypoténuse ?`,
            options: ['[BC]', '[AB]', '[AC]'],
            correct: 0,
            correction: `L’angle droit est en A, donc l’hypoténuse est le côté qui NE touche pas A : c’est ${hyp(o.pts)}. Les deux autres côtés partent de A, ce sont les côtés de l’angle droit.`,
          }))}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'info'}>
              {allRight
                ? 'Dans les trois cas, l’hypoténuse est le côté qui ne touche pas le sommet de l’angle droit — quelle que soit l’inclinaison du dessin.'
                : `${nCorrect} sur ${total}. Méthode infaillible : repère le sommet de l’angle droit, puis prends le côté d’en face.`}
            </Feedback>
          )}
          solved={batch}
          onAnswered={() => setBatch(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Une conséquence utile',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3">
            <p className="text-sm text-slate-700">
              Mesure les trois côtés du Triangle 1 : ils valent environ{' '}
              {sideLengths(T[0].pts).map((l) => Math.round(l)).join(', ')} pixels.
            </p>
          </div>
          <TapQuestion
            prompt="Que remarque-t-on sur la longueur de l’hypoténuse ?"
            options={[
              'C’est toujours le PLUS GRAND des trois côtés',
              'C’est toujours le plus petit',
              'Elle est toujours horizontale',
              'Sa longueur varie sans règle particulière',
            ]}
            correct={0}
            cols={1}
            explain="L’hypoténuse fait face au plus grand angle du triangle (l’angle droit, 90°), elle est donc le plus long côté. C’est un bon moyen de vérifier qu’on ne s’est pas trompé d’hypoténuse."
            explainWrong="Regarde les trois mesures : celle du côté opposé à l’angle droit dépasse les deux autres. C’est toujours le cas, car l’angle droit est le plus grand angle d’un triangle rectangle."
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
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="L’angle droit et son vis-à-vis"
      moduleSubtitle="Trouver l’hypoténuse sans se fier au dessin"
      estimatedTime="8 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Des triangles de travers',
        tone: 'indigo',
        body: (
          <p>
            Dans le cahier, l’hypoténuse est souvent « celle du bas ». Sur un vrai chantier, les
            triangles sont posés n’importe comment. Il faut donc une règle qui ne dépende{' '}
            <strong>pas</strong> de l’orientation.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Target, t: 'L’angle droit', d: 'Il porte une petite marque carrée.', c: 'text-rose-600' },
            { icon: RotateCw, t: 'Le vis-à-vis', d: 'L’hypoténuse est le côté d’en face.', c: 'text-indigo-600' },
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
        <Feedback tone="ok">
          <strong>Retenons.</strong> Dans un triangle rectangle, l’<strong>hypoténuse</strong> est
          le côté opposé à l’angle droit — celui qui ne touche pas le sommet marqué. C’est aussi
          toujours le plus long des trois côtés.
        </Feedback>
      }
    />
  );
}
