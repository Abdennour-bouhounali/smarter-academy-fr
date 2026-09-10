import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SignePlot from '../components/SignePlot';
import {
  PONT, discriminant, roots, evalTrinome, trinomeText, fr,
} from '../components/signeProblemesUtils';

/**
 * Module 2 — DÉCOUVERTE : le signe d'un trinôme se lit sur DEUX nombres, le
 * signe de Δ et le signe de a. Trois cas, et rien d'autre (P1).
 *
 * Étape 1  l'arche du module 1, écrite comme un trinôme : −0,5x² + 2 pour une
 *          péniche de 2,5 m. Ses racines sont ±2, et la bande est ENTRE elles.
 *          On nomme le phénomène : c'est le SIGNE du trinôme.
 * Étape 2  le cas retourné : a > 0. Sur x² − 5x + 6, le trinôme est NÉGATIF
 *          entre 2 et 3 et positif ailleurs. L'élève constate l'inversion.
 * Étape 3  Δ ⩽ 0 : plus d'exception du tout. Le trinôme garde le signe de a
 *          partout, et Δ = 0 ne fait PAS basculer le signe.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 constat → brique
 * `signe-trinome-regle` ; étape 3 constat → brique `signe-sans-racine`, puis
 * `mem-signe-trinome` qui les résume.
 *
 * PÉRIMÈTRE : le discriminant et les racines sont ACQUIS. Ce module ne les
 * réenseigne pas — il les EMPLOIE, et chaque question qui s'en sert le déclare
 * par `requires`.
 *
 * AUCUNE MANIPULATION GELÉE : ce module n'a pas de laboratoire à geler ; les
 * figures illustrent le raisonnement et restent visibles après validation.
 */
export default function Module02LeSigneDUnTrinome() {
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3a, setQ3a] = useState(false);
  const [q3b, setQ3b] = useState(false);

  // Le trinôme du dégagement du module 1, pour une péniche de 2,5 m de haut.
  const D = { a: PONT.a, b: 0, c: PONT.k - 2.5 };   // −0,5x² + 2
  const dD = discriminant(D.a, D.b, D.c);
  const rD = roots(D.a, D.b, D.c);

  // Le cas retourné : a > 0, racines 2 et 3.
  const P = { a: 1, b: -5, c: 6 };
  const dP = discriminant(P.a, P.b, P.c);
  const rP = roots(P.a, P.b, P.c);

  // Δ < 0 et Δ = 0, tous deux avec a > 0.
  const N = { a: 1, b: 1, c: 1 };                    // Δ = −3
  const Z = { a: 1, b: -6, c: 9 };                   // Δ = 0, racine double 3

  const steps = [
    {
      num: 1,
      title: 'La bande a une équation',
      subtitle:
        `Reprends la péniche de 2,5 m. Un coin situé en x passe quand l’arche est plus haute que lui, c’est-à-dire quand ${fr(PONT.a)}x² + ${fr(PONT.k)} − 2,5 est positif — soit ${trinomeText(D.a, D.b, D.c)}.`,
      done: q1a && q1b,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-center">
            <div className="font-mono text-lg font-black text-violet-900">{trinomeText(D.a, D.b, D.c)}</div>
            <div className="mt-2 text-sm text-violet-900">
              a = {fr(D.a)} · b = {fr(D.b)} · c = {fr(D.c)} · Δ = {fr(dD)}, donc les racines sont{' '}
              <strong>{fr(rD[0])}</strong> et <strong>{fr(rD[1])}</strong>.
            </div>
          </div>
          <TapQuestion
            prompt={`Où ce trinôme est-il strictement positif ? (C’est exactement là où le coin d’une péniche de 2,5 m passe.)`}
            options={[
              'Entre −2 et 2, et nulle part ailleurs',
              'À l’extérieur : avant −2 et après 2',
              'Partout, puisque l’arche existe partout',
              'Nulle part, puisque a est négatif',
            ]}
            correct={0}
            cols={1}
            requires={['bande-entre-les-racines', 'formule-racines']}
            explain={`Les deux coins qui touchent l’arche sont en ${fr(rD[0])} et ${fr(rD[1])} : ce sont les racines. Entre les deux, l’arche est plus haute que 2,5 m et le trinôme est positif ; au-delà, il devient négatif. En x = 0 il vaut ${fr(evalTrinome(D.a, D.b, D.c, 0))}, en x = 3 il vaut ${fr(evalTrinome(D.a, D.b, D.c, 3))}.`}
            explainWrong={`Vérifie en remplaçant : en x = 0, ${trinomeText(D.a, D.b, D.c)} vaut ${fr(evalTrinome(D.a, D.b, D.c, 0))}, donc positif au milieu. En x = 3 il vaut ${fr(evalTrinome(D.a, D.b, D.c, 3))}, donc négatif à l’extérieur. Un seul essai de chaque côté suffit à trancher.`}
            solved={q1a}
            onAnswered={() => setQ1a(true)}
          />
          {q1a && (
            <SignePlot
              a={D.a} b={D.b} c={D.c}
              legende={<span className="text-slate-600">a = {fr(D.a)} &lt; 0 : la courbe descend, et le positif est au milieu</span>}
            />
          )}
          <TapQuestion
            prompt="Sur cette figure, où le trinôme prend-il le signe de a — le nombre qui multiplie x² ?"
            options={[
              'À l’extérieur des racines, des deux côtés à la fois',
              'Entre les racines',
              'Partout, sans exception',
              'Aux racines elles-mêmes',
            ]}
            correct={0}
            cols={1}
            requires={['bande-entre-les-racines']}
            explain={`a vaut ${fr(D.a)}, il est négatif — et le trinôme est négatif à l’extérieur des racines. L’exception, c’est le MILIEU. On dira donc : « du signe de a, sauf entre les racines ».`}
            explainWrong="Regarde les couleurs de la figure : le rose (négatif) occupe les deux bords, et a est négatif. C’est donc à l’extérieur que le trinôme prend le signe de a."
            solved={q1b}
            onAnswered={() => setQ1b(true)}
          />
          {q1a && q1b && (
            <>
              <Feedback tone="ok">
                Ce que tu regardes s’appelle le <strong>signe du trinôme</strong> : non pas ses
                valeurs, mais seulement s’il est positif, négatif ou nul en chaque point. Et il
                suffit de deux renseignements pour le connaître partout.
              </Feedback>
              <KnowledgeBrick
                id="signe-trinome-regle"
                variant="new"
                lead={<>La règle que la figure vient de montrer.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Quand a est positif, tout s’inverse',
      subtitle: `Le trinôme ${trinomeText(P.a, P.b, P.c)} a pour discriminant ${fr(dP)} et pour racines ${fr(rP[0])} et ${fr(rP[1])}. Cette fois a = ${fr(P.a)}, positif.`,
      done: q2,
      content: (
        <div className="space-y-3">
          <SignePlot a={P.a} b={P.b} c={P.c} />
          <TapQuestion
            prompt={`Où ${trinomeText(P.a, P.b, P.c)} est-il NÉGATIF ?`}
            options={[
              'Entre 2 et 3, et nulle part ailleurs',
              'Avant 2 et après 3',
              'Nulle part : un carré est toujours positif',
              'Partout, sauf en 2 et en 3',
            ]}
            correct={0}
            cols={1}
            requires={['signe-trinome-regle']}
            explain={`a = ${fr(P.a)} est positif, donc le trinôme est positif à l’extérieur — et l’exception du milieu lui donne le signe contraire : négatif. Vérification en x = 2,5 : ${fr(evalTrinome(P.a, P.b, P.c, 2.5))}. C’est bien négatif.`}
            explainWrong={`« Du signe de a, sauf entre les racines » : a est positif, donc l’extérieur est POSITIF, et le milieu prend l’autre signe. Vérifie en x = 2,5 : ${fr(evalTrinome(P.a, P.b, P.c, 2.5))}. Et « x² est toujours positif » vaut pour x² seul, pas pour x² − 5x + 6, où l’on retranche aussi 5x.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <Feedback tone="ok">
              La même règle, deux figures opposées. Ce n’est pas « le milieu est négatif » : c’est{' '}
              <strong>le milieu prend le signe contraire à celui de a</strong>. Avec a négatif, le
              milieu était positif ; avec a positif, il est négatif.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Quand il n’y a pas d’exception',
      subtitle: `Deux trinômes sans deux racines : ${trinomeText(N.a, N.b, N.c)} avec Δ = ${fr(discriminant(N.a, N.b, N.c))}, et ${trinomeText(Z.a, Z.b, Z.c)} avec Δ = ${fr(discriminant(Z.a, Z.b, Z.c))}.`,
      done: q3a && q3b,
      content: (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="text-[13px] font-semibold text-slate-700">{trinomeText(N.a, N.b, N.c)} — Δ = {fr(discriminant(N.a, N.b, N.c))}</div>
              <SignePlot a={N.a} b={N.b} c={N.c} xMin={-3} xMax={3} unit={28} />
            </div>
            <div className="space-y-1">
              <div className="text-[13px] font-semibold text-slate-700">{trinomeText(Z.a, Z.b, Z.c)} — Δ = {fr(discriminant(Z.a, Z.b, Z.c))}</div>
              <SignePlot a={Z.a} b={Z.b} c={Z.c} xMin={0} xMax={6} unit={28} />
            </div>
          </div>
          <TapQuestion
            prompt={`Quel est le signe de ${trinomeText(N.a, N.b, N.c)}, dont le discriminant vaut ${fr(discriminant(N.a, N.b, N.c))} ?`}
            options={[
              'Positif partout : sans racine, la courbe ne traverse jamais l’axe et reste du côté de a',
              'Négatif partout, puisque le discriminant est négatif',
              'Positif d’un côté, négatif de l’autre',
              'On ne peut pas savoir sans calculer plusieurs valeurs',
            ]}
            correct={0}
            cols={1}
            requires={['signe-change-aux-racines', 'discriminant']}
            explain={`Sans racine, aucun endroit où le signe pourrait basculer : le trinôme garde partout le signe de a, ici positif. Une valeur suffit à savoir lequel — en x = 0 il vaut ${fr(evalTrinome(N.a, N.b, N.c, 0))}.`}
            explainWrong="Le signe de Δ ne se transmet pas au trinôme : Δ dit s’il y a des racines, pas si le trinôme est positif. Δ négatif signifie « aucune racine », donc « aucun changement de signe » — et c’est a qui décide lequel."
            solved={q3a}
            onAnswered={() => setQ3a(true)}
          />
          <TapQuestion
            prompt={`Et ${trinomeText(Z.a, Z.b, Z.c)}, dont le discriminant est nul et la racine double vaut 3 ?`}
            options={[
              'Positif partout sauf en 3, où il vaut 0 — le signe ne bascule pas',
              'Positif avant 3 et négatif après : la racine fait basculer le signe',
              'Négatif partout sauf en 3',
              'Nul partout, puisque le discriminant est nul',
            ]}
            correct={0}
            cols={1}
            requires={['signe-change-aux-racines']}
            explain={`(x − 3)² est un carré : il est positif ou nul, jamais négatif. La courbe TOUCHE l’axe en 3 et repart du même côté — elle ne le traverse pas. Vérification : en x = 2 le trinôme vaut ${fr(evalTrinome(Z.a, Z.b, Z.c, 2))}, en x = 4 il vaut ${fr(evalTrinome(Z.a, Z.b, Z.c, 4))}. Le même signe des deux côtés.`}
            explainWrong={`Un zéro ne fait pas forcément basculer le signe. Calcule de part et d’autre : en x = 2, ${fr(evalTrinome(Z.a, Z.b, Z.c, 2))} ; en x = 4, ${fr(evalTrinome(Z.a, Z.b, Z.c, 4))}. Les deux sont positifs. La courbe rebondit sur l’axe.`}
            solved={q3b}
            onAnswered={() => setQ3b(true)}
          />
          {q3a && q3b && (
            <>
              <Feedback tone="ok">
                Il n’y a donc que <strong>trois cas</strong>, et deux nombres suffisent à savoir
                lequel : le signe de Δ dit s’il y a une exception, le signe de a dit quel signe
                règne partout ailleurs.
              </Feedback>
              <KnowledgeBrick
                id="signe-sans-racine"
                variant="new"
                lead={<>Les deux cas où le signe ne change jamais.</>}
              />
              <KnowledgeBrick
                id="mem-signe-trinome"
                variant="new"
                lead={<>Le tout en une ligne.</>}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Le signe d’un trinôme"
      moduleSubtitle="Deux nombres décident du signe partout : celui de Δ et celui de a"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Trois cas, et rien d’autre',
        tone: 'indigo',
        body: (
          <p>
            La bande du pont porte un nom : c’est l’endroit où un trinôme est positif. Reste à
            savoir la trouver <strong>sans essayer</strong> — et il suffit pour cela de connaître
            le signe de deux nombres.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> Cette règle se range dans un outil compact, qui la rend lisible
          d’un coup d’œil et prête à servir : le tableau de signes.
        </KnowledgeSnapshot>
      }
    />
  );
}
