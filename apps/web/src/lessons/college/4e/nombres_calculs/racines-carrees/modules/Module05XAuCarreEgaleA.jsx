import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { carre, resoudreCarreEgal } from '../components/racines4e';

/**
 * Module 5 — FORMALISATION : l'équation x² = a.
 *
 * Activity              tester des valeurs — positives ET négatives — dans
 *                       x² = 25, et constater que DEUX d'entre elles marchent.
 * Mathematical objective x² = a a deux solutions quand a > 0, parce que deux
 *                       nombres opposés ont le même carré. La leçon
 *                       distingue soigneusement √25 (UN nombre, le positif)
 *                       de l'ÉQUATION x² = 25 (deux solutions) — confusion
 *                       qui survit sinon jusqu'au lycée.
 * Expected observation  « −5 marche aussi, et je ne l'avais pas vu venir ».
 * Misconception targeted oublier la solution négative ; et croire que
 *                       √25 « vaut ±5 ».
 *
 * PÉRIMÈTRE : le programme de 4e mentionne x² = a comme « parfois introduit ».
 * On s'en tient donc à des `a` qui sont des carrés parfaits ou négatifs —
 * aucune résolution approchée, aucune équation produit nul (3e).
 */
const CANDIDATS = [-5, -2, 0, 2, 5];

export default function Module05XAuCarreEgaleA() {
  const [testes, setTestes] = useState([]);
  const solutions = testes.filter((v) => carre(v) === 25);
  const lesDeux = solutions.length >= 2;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Trouve TOUTES les solutions',
      subtitle: 'Teste les valeurs proposées dans x² = 25. Attention : il y en a plus d’une qui marche.',
      done: lesDeux,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4">
            <p className="mb-3 text-center text-xl font-black text-slate-800">
              <MathText>{'$x^2 = 25$'}</MathText>
            </p>
            {testes.length === 0 ? (
              <p className="text-center text-sm italic text-slate-400">
                Choisis une valeur à tester.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[260px] text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600">
                      <th scope="col" className="p-1.5 text-left font-semibold">x</th>
                      <th scope="col" className="p-1.5 text-right font-semibold">x²</th>
                      <th scope="col" className="p-1.5 text-center font-semibold">= 25 ?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testes.map((v) => {
                      const c = carre(v);
                      const ok = c === 25;
                      return (
                        <tr key={v} className={`border-t border-slate-200 ${ok ? 'bg-emerald-50' : ''}`}>
                          <th scope="row" className="p-1.5 text-left font-bold tabular-nums text-slate-700">
                            {v < 0 ? `−${-v}` : v}
                          </th>
                          <td className="p-1.5 text-right tabular-nums text-slate-700">{c}</td>
                          <td className={`p-1.5 text-center text-base font-black ${ok ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {ok ? '✓' : '✗'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Valeurs à tester">
            {CANDIDATS.map((v) => (
              <button
                key={v}
                type="button"
                disabled={testes.includes(v)}
                onClick={() => {
                  const next = [...testes, v];
                  setTestes(next);
                  if (carre(v) === 25 && next.filter((w) => carre(w) === 25).length === 2) {
                    kit.react(true);
                  }
                }}
                className="min-h-[44px] min-w-[56px] rounded-xl border-2 border-slate-300 bg-white text-base font-bold tabular-nums text-slate-700 hover:border-amber-400 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {v < 0 ? `−${-v}` : v}
              </button>
            ))}
          </div>

          {lesDeux ? (
            <Feedback tone="ok">
              <strong>Deux</strong> valeurs conviennent : <strong>5</strong> et{' '}
              <strong>−5</strong>. Ce n’est pas un hasard : deux nombres <strong>opposés</strong>{' '}
              ont toujours le même carré, puisque (−5) × (−5) et 5 × 5 donnent tous deux 25 par la
              règle des signes.
            </Feedback>
          ) : solutions.length === 1 ? (
            <Feedback tone="info">
              Tu en as trouvé <strong>une</strong>. Il y en a une autre — pense aux nombres{' '}
              <strong>négatifs</strong>.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Teste plusieurs valeurs, y compris les négatives.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Combien de solutions ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="x-carre-egale-a"
            variant="new"
            lead={<>Deux solutions pour une seule équation : ce cas mérite d’être écrit une bonne fois, avec ses exceptions.</>}
          />
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour chaque équation, combien de solutions ?
              </p>
            }
            rows={[
              {
                id: 'r1',
                label: <MathText>{'$x^2 = 81$'}</MathText>,
                options: ['aucune', 'une', 'deux'],
                correct: 2,
                correction: '9 et −9',
              },
              {
                id: 'r2',
                label: <MathText>{'$x^2 = 0$'}</MathText>,
                options: ['aucune', 'une', 'deux'],
                correct: 1,
                correction: 'seulement 0 — son opposé est lui-même',
              },
              {
                id: 'r3',
                label: <MathText>{'$x^2 = -4$'}</MathText>,
                options: ['aucune', 'une', 'deux'],
                correct: 0,
                correction: 'un carré n’est jamais négatif',
              },
            ]}
            requires={['x-carre-egale-a']}
            feedback={({ allRight }) =>
              allRight ? (
                <p className="text-sm text-emerald-700">
                  Exactement. Trois cas, et un seul est fréquent : <strong>deux</strong> solutions
                  dès que le nombre est strictement positif. Zéro est le seul à n’en avoir qu’une,
                  parce qu’il est son propre opposé.
                </p>
              ) : (
                <p className="text-sm text-slate-700">
                  Le raisonnement est toujours le même : existe-t-il un nombre dont le carré vaut ce
                  qu’on demande ? Pour 81, il y en a deux (9 et −9) ; pour 0, un seul ; pour −4,
                  aucun, puisqu’un carré est toujours positif ou nul.
                </p>
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
      title: 'Ne pas confondre',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={<span>Combien vaut <MathText>{'$\\sqrt{36}$'}</MathText> ?</span>}
            options={[
              '6 uniquement',
              '6 et −6',
              '−6 uniquement',
              '18',
            ]}
            correct={0}
            cols={2}
            requires={['racine-carree', 'x-carre-egale-a']}
            explain="√36 désigne UN SEUL nombre : le positif, c’est-à-dire 6. C’est l’ÉQUATION x² = 36 qui a deux solutions (6 et −6). Le symbole √ ne désigne jamais deux nombres à la fois."
            explainWrong="C’est la confusion à éviter absolument : « x² = 36 » (deux solutions) et « √36 » (un seul nombre, le positif) sont deux choses différentes. Le symbole √ désigne toujours le nombre positif."
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
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="x² = a"
      moduleSubtitle="L’équation qui a deux réponses"
      estimatedTime="11 min"
      brief={{
        tag: 'Formalisation',
        title: 'Une équation qui piège',
        tone: 'indigo',
        body: (
          <p>
            « Quel nombre, au carré, donne 25 ? » Tu vas répondre 5 — et tu auras{' '}
            <strong>à moitié</strong> raison. Cette équation cache une seconde réponse à laquelle
            on ne pense jamais.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
