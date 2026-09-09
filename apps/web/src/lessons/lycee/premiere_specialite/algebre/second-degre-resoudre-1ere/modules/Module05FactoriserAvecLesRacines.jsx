import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import {
  TRINOMES, discriminant, roots, factoriseeText, evalTrinome,
  parseSigned, fr, trinomeText,
} from '../components/quadUtils';

/**
 * Module 5 — LABORATOIRE D'ENTRAÎNEMENT : factoriser à partir des racines (P4).
 *
 * Étape 1  x² − x − 6 : racines −2 et 3, donc (x + 2)(x − 3). LE SIGNE ENTRE
 *          DANS LA PARENTHÈSE — c'est la faute la plus fréquente, et elle est
 *          confrontée par le REDÉVELOPPEMENT, pas par une affirmation.
 * Étape 2  le a ne disparaît pas : 2x² − x − 3 = 2(x + 1)(x − 1,5), et non
 *          (x + 1)(x − 1,5). L'élève le constate en évaluant les deux en un
 *          point.
 * Étape 3  Δ < 0 : il n'y a rien à factoriser, et c'est une réponse.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 geste (redévelopper) → briques
 * `forme-factorisee-trinome` puis `methode-factoriser-par-racines` ; étape 2 →
 * brique `mem-forme-factorisee`.
 *
 * PÉRIMÈTRE : la forme factorisée sert ici à ÉCRIRE et à VÉRIFIER. On n'en tire
 * aucun tableau de signes ni aucune inéquation — leçon voisine.
 */
export default function Module05FactoriserAvecLesRacines() {
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  // x² − x − 6 : Δ = 25, racines −2 et 3.
  const A = { a: 1, b: -1, c: -6 };
  const dA = discriminant(A.a, A.b, A.c);
  const rA = roots(A.a, A.b, A.c);

  const T2 = TRINOMES.deuxRacines;      // 2x² − x − 3
  const T0 = TRINOMES.sansRacine;       // x² + 2x + 3

  const steps = [
    {
      num: 1,
      title: 'Les racines donnent les parenthèses',
      subtitle: `On part de ${trinomeText(A.a, A.b, A.c)}, dont le discriminant vaut ${fr(dA)}.`,
      done: q1a && q1b,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
            <div className="font-mono text-lg font-black text-rose-900">{trinomeText(A.a, A.b, A.c)}</div>
            <div className="mt-2 text-sm text-rose-900">
              Δ = {fr(dA)}, donc les racines sont <strong>{fr(rA[0])}</strong> et{' '}
              <strong>{fr(rA[1])}</strong>.
            </div>
          </div>
          <TapQuestion
            prompt={`Les racines sont ${fr(rA[0])} et ${fr(rA[1])}. Quelle est la forme factorisée ?`}
            options={[
              factoriseeText(A.a, A.b, A.c),
              '(x − 2)(x + 3)',
              '(x − 2)(x − 3)',
              '(x + 2)(x + 3)',
            ]}
            correct={0}
            cols={2}
            requires={['racine-trinome', 'produit-nul']}
            explain={`Chaque parenthèse s’écrit (x − racine). Pour la racine ${fr(rA[0])}, cela donne (x − (−2)), c’est-à-dire (x + 2). Pour ${fr(rA[1])}, (x − 3). D’où ${factoriseeText(A.a, A.b, A.c)}.`}
            explainWrong={`Le signe s’INVERSE en entrant dans la parenthèse : une racine négative donne un « + », une racine positive un « − ». Teste : (x − 2)(x + 3) s’annule en 2 et en −3, qui ne sont pas nos racines.`}
            solved={q1a}
            onAnswered={() => setQ1a(true)}
          />
          <NumericQuestion
            prompt={
              <>
                Vérifions en <strong>redéveloppant</strong> {factoriseeText(A.a, A.b, A.c)} : que
                vaut le coefficient de x ?
              </>
            }
            expected={A.b}
            parse={parseSigned}
            display={fr(A.b)}
            requires={['developper']}
            explain={`(x + 2)(x − 3) = x² − 3x + 2x − 6 = x² − x − 6. Le coefficient de x vaut −3 + 2 = ${fr(A.b)}, et l’on retrouve bien le trinôme de départ.`}
            explainFor={(n) =>
              n === 1
                ? 'Le signe : −3x + 2x fait −x, donc le coefficient est −1 et non +1. C’est ce qui distingue (x + 2)(x − 3) de (x − 2)(x + 3).'
                : n === -6
                ? 'C’est le nombre seul, celui sans x — pas le coefficient de x. Ce dernier vient de −3x + 2x = −x.'
                : null
            }
            solved={q1b}
            onAnswered={() => setQ1b(true)}
          />
          {q1a && q1b && (
            <>
              <Feedback tone="ok">
                Le redéveloppement retombe sur {trinomeText(A.a, A.b, A.c)} : la factorisation est
                juste. C’est la seule vérification qui vaille — elle ne dépend d’aucune mémoire.
              </Feedback>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-[13px] font-semibold text-slate-700 mb-2">
                  Les deux écritures prennent les mêmes valeurs, en tout point
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-center text-[13px] tabular-nums">
                    <tbody>
                      <tr className="bg-slate-50">
                        <th className="px-2 py-1 text-left font-sans">x</th>
                        {[-3, -2, 0, 1, 3, 4].map((x) => <td key={x} className="px-2 py-1">{fr(x)}</td>)}
                      </tr>
                      <tr className="border-t">
                        <th className="px-2 py-1 text-left font-sans">{trinomeText(A.a, A.b, A.c)}</th>
                        {[-3, -2, 0, 1, 3, 4].map((x) => (
                          <td key={x} className="px-2 py-1">{fr(evalTrinome(A.a, A.b, A.c, x))}</td>
                        ))}
                      </tr>
                      <tr className="border-t">
                        <th className="px-2 py-1 text-left font-sans">{factoriseeText(A.a, A.b, A.c)}</th>
                        {[-3, -2, 0, 1, 3, 4].map((x) => (
                          <td key={x} className="px-2 py-1">{fr((x + 2) * (x - 3))}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <KnowledgeBrick
                id="forme-factorisee-trinome"
                variant="new"
                lead={<>L’écriture que tu viens de fabriquer, et sa règle générale.</>}
              />
              <KnowledgeBrick
                id="methode-factoriser-par-racines"
                variant="new"
                lead={<>Et les quatre gestes, dans l’ordre.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le coefficient a ne disparaît pas',
      subtitle: `Reprends ${trinomeText(T2.a, T2.b, T2.c)}, dont tu as trouvé les racines ${fr(roots(T2.a, T2.b, T2.c)[0])} et ${fr(roots(T2.a, T2.b, T2.c)[1])}.`,
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-sm text-amber-900 mb-2">
              Deux candidats. Un seul prend les mêmes valeurs que {trinomeText(T2.a, T2.b, T2.c)} :
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-center font-mono text-sm">
              <div className="rounded-lg bg-white border border-amber-200 px-2 py-2">(x + 1)(x − 1,5)</div>
              <div className="rounded-lg bg-white border border-amber-200 px-2 py-2">{factoriseeText(T2.a, T2.b, T2.c)}</div>
            </div>
            <div className="mt-3 text-xs text-amber-800">
              Testons en x = 0 : {trinomeText(T2.a, T2.b, T2.c)} vaut{' '}
              <strong>{fr(evalTrinome(T2.a, T2.b, T2.c, 0))}</strong>, tandis que (x + 1)(x − 1,5)
              vaut <strong>{fr((0 + 1) * (0 - 1.5))}</strong>.
            </div>
          </div>
          <TapQuestion
            prompt={`Pourquoi (x + 1)(x − 1,5) ne convient-il pas, alors qu’il s’annule aux bonnes valeurs ?`}
            options={[
              `Parce qu’il lui manque le facteur ${fr(T2.a)} : sans lui, le terme en x² vaut x² et non ${fr(T2.a)}x²`,
              'Parce que les racines ne sont pas les bonnes',
              'Parce qu’il faut écrire les parenthèses dans l’autre ordre',
              'Parce que 1,5 n’est pas un nombre entier',
            ]}
            correct={0}
            cols={1}
            requires={['forme-factorisee-trinome', 'developper']}
            explain={`(x + 1)(x − 1,5) = x² − 0,5x − 1,5 : bonnes racines, mais toutes les valeurs sont divisées par ${fr(T2.a)}. Le facteur a remet l’échelle : ${factoriseeText(T2.a, T2.b, T2.c)}.`}
            explainWrong={`Les racines SONT bonnes — c’est bien ce qui rend le piège tentant. Ce qui manque est le coefficient a : en développant sans lui, on obtient x² au lieu de ${fr(T2.a)}x².`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <>
              <Feedback tone="ok">
                Deux expressions peuvent avoir les mêmes racines sans être égales. Le facteur{' '}
                <strong>a</strong> est ce qui les distingue — et le redéveloppement est ce qui le
                révèle.
              </Feedback>
              <KnowledgeBrick
                id="mem-forme-factorisee"
                variant="new"
                lead={<>Une seule chose à retenir de ce module.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Quand il n’y a rien à factoriser',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={`Peut-on factoriser ${trinomeText(T0.a, T0.b, T0.c)}, dont le discriminant vaut ${fr(discriminant(T0.a, T0.b, T0.c))} ?`}
            options={[
              'Non : sans racine, il n’y a pas de parenthèse (x − racine) à écrire',
              'Oui : (x + 1)(x + 3)',
              'Oui, en factorisant par x',
              'Oui, mais seulement pour les x positifs',
            ]}
            correct={0}
            cols={1}
            requires={['forme-factorisee-trinome', 'trois-cas-selon-delta']}
            explain={`La forme a(x − x₁)(x − x₂) se construit À PARTIR des racines. Δ < 0 : il n’y en a aucune, donc aucune parenthèse à écrire. Le piège (x + 1)(x + 3) se développe en x² + 4x + 3, qui n’est pas notre expression.`}
            explainWrong={`Vérifie le piège en développant : (x + 1)(x + 3) = x² + 4x + 3. Le coefficient de x vaut 4, pas 2. Et factoriser par x est impossible : le nombre ${fr(T0.c)}, écrit seul, ne contient pas de x.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="ok">
              Δ commande tout : il dit combien de solutions, quelles racines, et s’il y a une
              factorisation à écrire. Un seul nombre, calculé en premier, et tout le reste suit.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Factoriser avec les racines"
      moduleSubtitle="a(x − x₁)(x − x₂), et la vérification qui ne trompe pas"
      estimatedTime="11 min"
      brief={{
        tag: 'Entraînement',
        title: 'Des racines à un produit',
        tone: 'indigo',
        body: (
          <p>
            Une fois les racines connues, la factorisation ne se cherche plus : elle s’écrit. Reste
            à faire entrer les signes dans les parenthèses, à ne pas perdre le coefficient a, et à
            redévelopper pour se relire.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Le dessin dit tout.</strong> Au module suivant, tu retrouveras le signe de Δ sans
          poser un seul calcul — en comptant des points sur un dessin.
        </KnowledgeSnapshot>
      }
    />
  );
}
