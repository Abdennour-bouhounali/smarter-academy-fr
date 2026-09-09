import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 2 — DÉCOUVERTE : le vocabulaire, et le test d'une valeur.
 *
 * Ce que le module 1 a laissé ouvert : on a TROUVÉ une masse en manipulant,
 * on n'a pas dit ce qu'on cherchait ni comment on saurait qu'on l'a trouvé.
 * C'est ici que « équation », « membre » et « solution » sont posés, et que
 * la vérification devient un geste systématique.
 *
 * Ce que ce module NE fait PAS : aucune méthode de résolution — elle attend
 * le module 3. Ici on TESTE des valeurs, on ne les cherche pas.
 */

/** 4x − 3 = 9, dont la solution est 3. */
const gauche = (x) => 4 * x - 3;
const droite = () => 9;
const CANDIDATS = [1, 2, 3, 4];

export default function Module02CeQuEstUneSolution() {
  const [testes, setTestes] = useState([]);
  const trouve = testes.includes(3);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Laquelle de ces valeurs convient ?',
      subtitle: 'Teste-les : pour chacune, les deux membres se calculent séparément.',
      done: trouve,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4">
            <p className="mb-3 text-center text-xl font-black text-slate-800">
              <MathText>{'$4x - 3 = 9$'}</MathText>
            </p>

            {testes.length === 0 ? (
              <p className="text-center text-sm italic text-slate-400">
                Choisis une valeur de x ci-dessous.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[280px] text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600">
                      <th scope="col" className="p-1.5 text-left font-semibold">x</th>
                      <th scope="col" className="p-1.5 text-right font-semibold">4x − 3</th>
                      <th scope="col" className="p-1.5 text-right font-semibold">9</th>
                      <th scope="col" className="p-1.5 text-center font-semibold">?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testes.map((x) => {
                      const g = gauche(x);
                      const ok = g === droite();
                      return (
                        <tr key={x} className={`border-t border-slate-200 ${ok ? 'bg-emerald-50' : ''}`}>
                          <th scope="row" className="p-1.5 text-left font-bold tabular-nums text-slate-700">{x}</th>
                          <td className="p-1.5 text-right tabular-nums text-slate-700">{g}</td>
                          <td className="p-1.5 text-right tabular-nums text-slate-700">9</td>
                          <td className={`p-1.5 text-center text-base font-black ${ok ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {ok ? '=' : '≠'}
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
            {CANDIDATS.map((x) => (
              <button
                key={x}
                type="button"
                disabled={testes.includes(x)}
                onClick={() => {
                  const next = [...testes, x];
                  setTestes(next);
                  if (x === 3 && !trouve) kit.react(true);
                }}
                className="min-h-[44px] min-w-[56px] rounded-xl border-2 border-slate-300 bg-white text-base font-bold tabular-nums text-slate-700 hover:border-violet-400 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                x = {x}
              </button>
            ))}
          </div>

          {trouve ? (
            <Feedback tone="ok">
              <strong>x = 3</strong> est la valeur qui rend l’égalité vraie : 4 × 3 − 3 = 9, et le
              membre de droite vaut 9. Les autres valeurs donnent des nombres différents — elles ne
              conviennent pas. Tu peux tester les autres pour t’en assurer.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Pour chaque valeur, on calcule les deux membres <strong>séparément</strong>, puis on
              regarde s’ils tombent égaux.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Les mots',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="equation-solution"
            variant="new"
            lead={<>Ce que tu viens de chercher — la valeur qui rend l’égalité vraie — porte un nom, et l’égalité elle-même aussi.</>}
          />
          <TapQuestion
            prompt={<span>Que signifie « x = 5 est solution de <MathText>{'$2x + 1 = 11$'}</MathText> » ?</span>}
            options={[
              'Que 5 est la seule valeur permise pour x, dans tous les cas',
              'Qu’en remplaçant x par 5, les deux membres donnent le même nombre',
              'Que l’équation est vraie pour toutes les valeurs de x',
              'Que 5 est la valeur du membre de droite',
            ]}
            correct={1}
            cols={1}
            requires={['equation-solution']}
            explain="Une solution est une valeur qui rend l’égalité VRAIE : 2 × 5 + 1 = 11, et le membre de droite vaut 11 aussi. En dehors de cette équation, x pourrait valoir tout autre chose."
            explainWrong="Une équation n’est ni vraie ni fausse en soi : elle est vraie POUR CERTAINES valeurs. Résoudre, c’est trouver lesquelles."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Vérifier sans deviner',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="verifier-une-solution"
            variant="new"
            lead={<>Tu viens de tester quatre valeurs de la même façon à chaque fois. Ce geste est celui qui vérifie n’importe quelle solution.</>}
          />
          <TapQuestion
            prompt={<span>Théo affirme que x = 4 est solution de <MathText>{'$3x - 2 = 14$'}</MathText>. A-t-il raison ?</span>}
            options={[
              'Oui : 3 × 4 − 2 = 10, et 10 = 14',
              'Non : 3 × 4 − 2 = 10, or le membre de droite vaut 14',
              'Oui : 4 est plus petit que 14',
              'On ne peut pas le savoir sans résoudre l’équation',
            ]}
            correct={1}
            cols={1}
            requires={['verifier-une-solution']}
            explain="On calcule chaque membre séparément : à gauche 3 × 4 − 2 = 10, à droite 14. 10 ≠ 14, donc x = 4 n’est pas solution. (La vraie solution est 16/3.) Vérifier ne demande jamais de résoudre."
            explainWrong="La vérification est mécanique : on remplace, on calcule les deux côtés, on compare. Ici 10 et 14 ne sont pas égaux — pas besoin de résoudre quoi que ce soit pour le voir."
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
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Ce qu’est une solution"
      moduleSubtitle="Le vocabulaire, et le geste qui vérifie"
      estimatedTime="11 min"
      brief={{
        tag: 'Découverte',
        title: 'Comment sait-on qu’on a trouvé ?',
        tone: 'indigo',
        body: (
          <p>
            Tu as découvert la masse du paquet en manipulant. Mais si quelqu’un te propose une
            valeur, comment savoir si elle est la bonne — <strong>sans</strong> refaire toute la
            manipulation ?
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
