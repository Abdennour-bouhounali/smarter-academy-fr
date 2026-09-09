import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PLANTE } from '../components/situations';
import { valueTable, toPoints, fr } from '../components/fonctionsUtils';

/**
 * Module 4 — MANIPULATION : du couple au point.
 *
 * Action → changement → observation → sens :
 *   toucher une colonne du tableau → son point apparaît dans le repère →
 *   « les points dessinent la pousse » → un graphique est le tableau, vu
 *   d'un seul coup d'œil.
 *
 * Expected observation : « la plante pousse vite au début, puis ralentit — ça
 * se voit sur la forme, pas dans les nombres ».
 * Misconception targeted : croire qu'un graphique de dépendance doit être une
 * droite. Ici la courbe se CREUSE, et c'est une dépendance parfaitement
 * normale — c'est exactement ce que la leçon sœur écarterait.
 *
 * PÉRIMÈTRE : on place et on lit ; on n'écrit aucune équation, et la
 * proportionnalité n'est pas le sujet (leçon sœur).
 *
 * SÉCURITÉ VISUELLE : `unitY` distinct de `unit` (des semaines et des
 * centimètres n'ont pas le même ordre de grandeur) ; le cadre contient
 * l'origine et toutes les valeurs atteignables.
 */
const SEMAINES = [0, 1, 4, 9, 16];
const ROWS = valueTable(PLANTE, SEMAINES);

export default function Module04UnCoupleUnPoint() {
  const [placed, setPlaced] = useState([]);
  const done1 = placed.length >= ROWS.length;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const placer = (x, react) => {
    if (placed.includes(x)) return;
    setPlaced([...placed, x]);
    react?.(true);
  };

  const shown = ROWS.filter((r) => placed.includes(r.x));

  const steps = [
    {
      num: 1,
      title: 'Place les points de la plante',
      subtitle: 'Chaque colonne du tableau devient un point du repère.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3.5 text-sm text-slate-700">
            La classe a semé une plante et mesure sa hauteur chaque semaine.{' '}
            <strong>La hauteur en fonction du nombre de semaines.</strong>
          </div>

          <div className="flex flex-wrap gap-2">
            {ROWS.map((r) => (
              <button
                key={r.x}
                type="button"
                onClick={() => placer(r.x, kit.react)}
                disabled={placed.includes(r.x)}
                className={`min-h-[44px] px-3 rounded-xl border-2 text-sm font-bold tabular-nums transition-colors ${
                  placed.includes(r.x)
                    ? 'border-emerald-300 bg-emerald-100 text-emerald-400'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-400'
                }`}
              >
                ({r.x} ; {fr(r.y)})
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <CoordPlane
              range={{ xMin: 0, xMax: 18, yMin: 0, yMax: 30 }}
              unit={20}
              unitY={9}
              xStep={2}
              yStep={5}
              points={toPoints(shown, '#059669', 'pl')}
              axisLabels={{ x: 'semaines', y: 'cm' }}
              ariaLabel="Repère : la hauteur de la plante en fonction du nombre de semaines"
              caption={false}
            />
          </div>

          {done1 ? (
            <Feedback tone="ok">
              Les points ne sont <strong>pas alignés</strong> : la plante pousse vite les premières
              semaines, puis ralentit. C’est une dépendance tout à fait normale — la hauteur est
              bien déterminée par le nombre de semaines.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Touche les couples un à un. Les points forment-ils une ligne droite ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Du tableau au dessin',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="couple-point"
            variant="new"
            lead={<>Tu viens de transformer cinq colonnes en cinq points.</>}
          />
          <TapQuestion
            prompt={
              <>
                Dans ce repère, où se place la colonne{' '}
                <strong className="font-mono">(9 ; {fr(PLANTE.at(9))})</strong> ?
              </>
            }
            options={[
              `9 vers la droite, ${fr(PLANTE.at(9))} vers le haut`,
              `${fr(PLANTE.at(9))} vers la droite, 9 vers le haut`,
              'Au milieu des deux axes',
            ]}
            cols={1}
            correct={0}
            requires={['couple-point']}
            explain="La grandeur d’entrée — les semaines — se lit sur l’axe horizontal. On avance donc de 9 vers la droite, puis on monte à la hauteur mesurée."
            explainWrong="Les deux nombres ne sont pas interchangeables : le premier est l’entrée (les semaines, en horizontal), le second ce qui en dépend (la hauteur, en vertical)."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que la forme raconte',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <CoordPlane
              range={{ xMin: 0, xMax: 18, yMin: 0, yMax: 30 }}
              unit={20}
              unitY={9}
              xStep={2}
              yStep={5}
              points={toPoints(ROWS, '#059669', 'all')}
              curves={[{ id: 'pousse', points: ROWS, tone: 'emerald', label: 'la pousse' }]}
              axisLabels={{ x: 'semaines', y: 'cm' }}
              ariaLabel="La courbe de croissance de la plante"
              caption={false}
            />
          </div>
          <TapQuestion
            prompt="Que raconte la forme de cette courbe ?"
            options={[
              'La plante pousse beaucoup au début, puis de moins en moins vite',
              'La plante pousse de la même hauteur chaque semaine',
              'La plante rétrécit',
            ]}
            cols={1}
            correct={0}
            requires={['couple-point', 'dependance']}
            explain="Entre 0 et 1 semaine, la courbe grimpe fortement ; entre 9 et 16, elle s’aplatit. La plante grandit toujours, mais de moins en moins vite."
            explainWrong="Si la plante poussait de la même hauteur chaque semaine, les points seraient alignés. Ici la courbe s’aplatit : la pousse ralentit."
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
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Un couple, un point"
      moduleSubtitle="Le tableau devient un dessin"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Cinq colonnes, cinq points',
        tone: 'indigo',
        body: (
          <p>
            Un tableau donne les nombres ; un dessin donne la <strong>forme</strong>. En plaçant
            chaque couple dans un repère, tu vas voir d’un seul coup d’œil quelque chose que les
            nombres cachaient.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
