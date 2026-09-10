import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TableauSignes from '../components/TableauSignes';
import SignePlot from '../components/SignePlot';
import {
  INEQUATIONS, REL_TEXT, solutionsInequationText, verifieInequation,
  discriminant, roots, evalTrinome, trinomeText, parseSigned, fr,
} from '../components/signeProblemesUtils';

/**
 * Module 4 — MANIPULATION : lire un tableau de signes comme une réponse (P2).
 *
 * Étape 1  x² − 5x + 6 > 0, a > 0 : DEUX morceaux, l'extérieur. On établit
 *          l'objet « inéquation du second degré » et la méthode.
 * Étape 2  LE MÊME TRINÔME avec ⩽ : le même tableau, l'autre lecture, et les
 *          bornes qui deviennent INCLUSES. C'est le cœur du module, et c'est
 *          une comparaison, pas une affirmation.
 * Étape 3  a < 0, et Δ < 0 : les deux réponses qu'on oublie — S = ℝ et S = ∅.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 geste → briques
 * `inequation-second-degre` puis `methode-inequation-second-degre` ; étape 2
 * comparaison → brique `bornes-incluses-inequation`.
 *
 * TOUTES LES RÉPONSES SONT RECALCULÉES par `solutionsInequationText`, et
 * confrontées point par point au prédicat direct dans le test : aucun ensemble
 * de solutions n'est écrit à la main dans ce module.
 *
 * AUCUNE MANIPULATION GELÉE : les tableaux et les figures restent affichés et
 * lisibles après validation.
 */
export default function Module04ResoudreUneInequation() {
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2b, setQ2b] = useState(false);
  const [q3a, setQ3a] = useState(false);
  const [q3b, setQ3b] = useState(false);

  const E = INEQUATIONS.exterieur;        // x² − 5x + 6 > 0
  const I = INEQUATIONS.interieurLarge;   // x² − 5x + 6 ⩽ 0
  const N = INEQUATIONS.aNegatif;         // −x² + 4 ⩾ 0
  const T = INEQUATIONS.toujoursPositif;  // x² + x + 1 > 0
  const J = INEQUATIONS.jamaisNegatif;    // x² + x + 1 < 0

  const rE = roots(E.a, E.b, E.c);
  const rN = roots(N.a, N.b, N.c);

  const ecris = (q) => `${trinomeText(q.a, q.b, q.c)} ${REL_TEXT[q.rel]} 0`;
  const sol = (q) => solutionsInequationText(q.a, q.b, q.c, q.rel);

  const steps = [
    {
      num: 1,
      title: 'Le tableau lu comme une réponse',
      subtitle: `Résous ${ecris(E)}. Tu connais déjà le tableau de ce trinôme : il ne reste qu’à choisir les colonnes.`,
      done: q1a && q1b,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <div className="font-mono text-lg font-black text-emerald-900">{ecris(E)}</div>
            <div className="mt-1 text-sm text-emerald-900">
              Δ = {fr(discriminant(E.a, E.b, E.c))} · racines {fr(rE[0])} et {fr(rE[1])} · a = {fr(E.a)}
            </div>
          </div>
          <TableauSignes a={E.a} b={E.b} c={E.c} label={trinomeText(E.a, E.b, E.c)} />
          <TapQuestion
            prompt={`Quelles colonnes du tableau conviennent pour ${ecris(E)} ?`}
            options={[
              'Les deux colonnes marquées « + », celles de gauche et de droite',
              'La colonne marquée « − », celle du milieu',
              'Les trois colonnes, puisque le trinôme existe partout',
              'Les deux cases marquées « 0 », sous les racines',
            ]}
            correct={0}
            cols={1}
            requires={['tableau-signes-trinome']}
            explain={`« > 0 » demande les endroits où le trinôme est STRICTEMENT POSITIF : les colonnes qui portent un « + ». Les cases « 0 » ne conviennent pas — zéro n’est pas strictement supérieur à zéro.`}
            explainWrong={`Relis le symbole : « > 0 » veut dire « strictement plus grand que zéro », donc positif. C’est le signe « + » qu’il faut retenir, pas le « − ».`}
            solved={q1a}
            onAnswered={() => setQ1a(true)}
          />
          <TapQuestion
            prompt="Comment s’écrit l’ensemble des solutions ?"
            options={[
              sol(E),
              ']2 ; 3[',
              '[2 ; 3]',
              '{ 2 ; 3 }',
            ]}
            correct={0}
            cols={2}
            requires={['intervalle-crochets', 'tableau-signes-trinome']}
            explain={`Deux colonnes retenues, donc deux intervalles réunis par ∪ : ${sol(E)}. Les bornes 2 et 3 sont EXCLUES, parce que le trinôme y vaut 0 et que l’inégalité est stricte. Vérification en x = 0 : ${fr(evalTrinome(E.a, E.b, E.c, 0))}, positif ✔ ; en x = 2,5 : ${fr(evalTrinome(E.a, E.b, E.c, 2.5))}, négatif, donc 2,5 est bien exclu ✔`}
            explainWrong={`${']2 ; 3['} est l’intervalle du MILIEU, celui où le trinôme est négatif — c’est la réponse à l’inéquation contraire. Et { 2 ; 3 } ne contient que les deux racines, là où le trinôme vaut zéro : précisément les nombres à exclure. Ici on veut les deux morceaux du dehors, réunis par ∪.`}
            solved={q1b}
            onAnswered={() => setQ1b(true)}
          />
          {q1a && q1b && (
            <>
              <SignePlot a={E.a} b={E.b} c={E.c} />
              <Feedback tone="ok">
                Un ensemble de solutions du second degré peut donc être en <strong>deux
                morceaux</strong> — ce qui n’arrive jamais au premier degré, où la réponse est
                toujours une seule demi-droite.
              </Feedback>
              <KnowledgeBrick
                id="inequation-second-degre"
                variant="new"
                lead={<>L’objet que tu viens de résoudre.</>}
              />
              <KnowledgeBrick
                id="methode-inequation-second-degre"
                variant="new"
                lead={<>Et les cinq gestes, dans l’ordre.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le même trinôme, l’autre symbole',
      subtitle: `Résous maintenant ${ecris(I)}. Même trinôme, même tableau — seul le symbole a changé.`,
      done: q2a && q2b,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <div className="font-mono text-lg font-black text-emerald-900">{ecris(I)}</div>
          </div>
          <TableauSignes a={I.a} b={I.b} c={I.c} label={trinomeText(I.a, I.b, I.c)} />
          <NumericQuestion
            prompt={<>Commence par le vérifier : que vaut {trinomeText(I.a, I.b, I.c)} en x = {fr(rE[0])} ?</>}
            expected={0}
            parse={parseSigned}
            display="0"
            requires={['formule-racines']}
            explain={`${fr(rE[0])} est une racine, donc le trinôme y vaut 0. Et « ⩽ 0 » accepte le zéro : ${fr(rE[0])} fait partie des solutions, alors qu’il était exclu avec « > 0 ».`}
            explainFor={(n) =>
              n === 6
                ? 'C’est la valeur en x = 0, pas en x = 2. Remplace bien x par 2 : 4 − 10 + 6.'
                : null
            }
            solved={q2a}
            onAnswered={() => setQ2a(true)}
          />
          <TapQuestion
            prompt={`Quel est l’ensemble des solutions de ${ecris(I)} ?`}
            options={[
              sol(I),
              ']2 ; 3[',
              sol(E),
              '∅',
            ]}
            correct={0}
            cols={2}
            requires={['borne-incluse-exclue', 'tableau-signes-trinome']}
            explain={`« ⩽ 0 » retient la colonne « − » ET les deux cases « 0 » : les racines font partie des solutions. On écrit donc ${sol(I)}, avec des crochets FERMÉS. Vérification en x = 2 : ${fr(evalTrinome(I.a, I.b, I.c, 2))} ⩽ 0 ✔`}
            explainWrong={`${']2 ; 3['} serait la réponse à « < 0 », strictement. Avec « ⩽ », le zéro est accepté, donc les racines entrent dans l’ensemble et les crochets se ferment.`}
            solved={q2b}
            onAnswered={() => setQ2b(true)}
          />
          {q2a && q2b && (
            <>
              <div className="grid gap-2 sm:grid-cols-2 text-sm">
                <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-3 text-center text-rose-900">
                  <div className="font-mono font-bold">{ecris({ ...E, rel: '<' })}</div>
                  <div className="mt-1 font-mono font-black text-lg">{sol({ ...E, rel: '<' })}</div>
                </div>
                <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 text-center text-emerald-900">
                  <div className="font-mono font-bold">{ecris(I)}</div>
                  <div className="mt-1 font-mono font-black text-lg">{sol(I)}</div>
                </div>
              </div>
              <Feedback tone="ok">
                Le même intervalle, deux écritures. C’est exactement la péniche dont un coin touche
                l’arche : avec « strictement dessous » elle ne passe pas, avec « au plus à la
                hauteur de l’arche » elle passe tout juste.
              </Feedback>
              <KnowledgeBrick
                id="bornes-incluses-inequation"
                variant="new"
                lead={<>Ce que le symbole change, et ce qu’il ne change pas.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Les deux réponses qu’on oublie',
      subtitle: `Deux inéquations sans deux racines à l’extérieur : ${ecris(N)}, où a est négatif, puis ${ecris(T)} et ${ecris(J)}, dont le discriminant vaut ${fr(discriminant(T.a, T.b, T.c))}.`,
      done: q3a && q3b,
      content: (
        <div className="space-y-3">
          <TableauSignes a={N.a} b={N.b} c={N.c} label={trinomeText(N.a, N.b, N.c)} />
          <TapQuestion
            prompt={`Quel est l’ensemble des solutions de ${ecris(N)} ?`}
            options={[
              sol(N),
              sol({ ...N, rel: '<=' }),
              `]${fr(rN[0])} ; ${fr(rN[1])}[`,
              '∅',
            ]}
            correct={0}
            cols={2}
            requires={['signe-trinome-regle', 'borne-incluse-exclue']}
            explain={`a = ${fr(N.a)} est négatif : le trinôme est positif ENTRE les racines. « ⩾ 0 » retient donc la colonne du milieu et les deux zéros : ${sol(N)}. Vérification en x = 0 : ${fr(evalTrinome(N.a, N.b, N.c, 0))} ⩾ 0 ✔ ; en x = 3 : ${fr(evalTrinome(N.a, N.b, N.c, 3))}, exclu ✔`}
            explainWrong={`Le piège est de lire « ⩾ 0 » comme « à l’extérieur », par habitude du cas a > 0. Ici a est négatif, tout est retourné : le POSITIF est au milieu. Vérifie en x = 0 : ${fr(evalTrinome(N.a, N.b, N.c, 0))}.`}
            solved={q3a}
            onAnswered={() => setQ3a(true)}
          />
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-[13px] font-semibold text-slate-700 mb-2">
              {trinomeText(T.a, T.b, T.c)} : Δ = {fr(discriminant(T.a, T.b, T.c))}, a = {fr(T.a)}
            </div>
            <SignePlot a={T.a} b={T.b} c={T.c} xMin={-3} xMax={3} unit={30} />
          </div>
          <TapQuestion
            prompt={`Que valent les ensembles de solutions de ${ecris(T)} et de ${ecris(J)} ?`}
            options={[
              `${sol(T)} pour la première, ${sol(J)} pour la seconde`,
              `${sol(J)} pour la première, ${sol(T)} pour la seconde`,
              'Les deux valent ∅ : sans racine, il n’y a pas de solution',
              'On ne peut pas résoudre une inéquation dont le discriminant est négatif',
            ]}
            correct={0}
            cols={1}
            requires={['signe-sans-racine', 'methode-inequation-second-degre']}
            explain={`Le trinôme est positif PARTOUT (a > 0, Δ < 0). « > 0 » est donc vrai pour tous les nombres : S = ${sol(T)}. Et « < 0 » n’est jamais vrai : S = ${sol(J)}. Ce sont deux réponses complètes, pas des impasses.`}
            explainWrong={`« Pas de racine » ne veut pas dire « pas de solution » : cela veut dire que le signe ne change jamais. Ici le trinôme est positif partout — donc tous les nombres conviennent pour « > 0 », et aucun pour « < 0 ». Vérifie en x = 0 : ${fr(evalTrinome(T.a, T.b, T.c, 0))}.`}
            solved={q3b}
            onAnswered={() => setQ3b(true)}
          />
          {q3a && q3b && (
            <Feedback tone="ok">
              Quatre réponses possibles, donc : un intervalle, deux intervalles réunis,{' '}
              <strong>ℝ tout entier</strong>, ou <strong>∅</strong>. Aucune n’est un échec —
              chacune est une réponse à écrire telle quelle.
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
      moduleTitle="Résoudre une inéquation"
      moduleSubtitle="Choisir les colonnes, puis choisir les crochets"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Du tableau à l’ensemble des solutions',
        tone: 'indigo',
        body: (
          <p>
            Un tableau de signes se lit comme une réponse : on garde les colonnes dont le signe
            convient, et le symbole de l’inégalité décide si les bornes entrent ou non dans
            l’ensemble.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> Reste à savoir d’où viennent ces inéquations : une situation
          réelle, traduite en « = » ou en « ⩾ » selon ce que la question demande.
        </KnowledgeSnapshot>
      }
    />
  );
}
