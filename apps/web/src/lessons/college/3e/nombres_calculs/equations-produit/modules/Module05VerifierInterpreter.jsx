import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import {
  lin, evalLin, evalProduct, productZeros,
  formatDec, formatLin, formatProduct, formatSolutionSet, formatSubstituted,
} from '../components/equationUtils';

/**
 * Module 5 — FORMALISATION : « Vérifier et interpréter ».
 *
 * Activity: remettre chaque solution candidate dans l'équation produit et
 *   voir la bande de vérification se remplir, puis décider si la solution a
 *   un sens dans une situation concrète (une longueur).
 * Mathematical objective: vérifier une solution en substituant, et
 *   interpréter le résultat dans le contexte (rejeter une longueur négative).
 * Student action: taper « Vérifier x = … » pour chaque candidat, y compris
 *   un intrus qui n'est pas solution.
 * Controlled variable: le candidat vérifié.
 * Mathematical state: l'ensemble des candidats vérifiés ; chaque ligne est
 *   dérivée par formatSubstituted + evalProduct.
 * Visual consequence: la ligne affiche le calcul substitué puis le produit
 *   obtenu, en vert si 0, en rose sinon.
 * Expected observation: seuls les vrais zéros donnent 0 ; l'intrus, non.
 * Misconception targeted: « vérifier, c'est refaire la résolution » et
 *   « toute solution mathématique convient au problème concret ».
 * Feedback: la ligne montre le calcul complet, pas un verdict.
 * Formalization: « vérifier » et « interpréter » vivent dans
 *   `knowledge.jsx` ; des <KnowledgeBrick> les posent après la bande de
 *   vérification et après le verdict sur le rectangle. L'étape 3 ne recopie
 *   plus la méthode : elle l'affiche depuis la carte
 *   (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 * Scaffolding: les substitutions sont écrites pour l'élève, il ne tape rien.
 * Transfer: le module 6 rejette x = 0 pour un côté de carré.
 */
const F1 = lin(1, -3);
const F2 = lin(2, 4);
const ZEROS = productZeros(F1, F2); // [−2, 3]
const CANDIDATES = [-2, 2, 3];      // 2 est l'intrus

export default function Module05VerifierInterpreter() {
  const [checked, setChecked] = useState([]);
  const [interpDone, setInterpDone] = useState(false);
  const [retainDone, setRetainDone] = useState(false);

  const allChecked = CANDIDATES.every((c) => checked.includes(c));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Vérifier et interpréter"
      moduleSubtitle="Remets tes solutions dans l’équation, puis regarde si elles ont un sens."
      estimatedTime="9 min"
      brief={{
        tag: '✔️ Mission 05',
        title: 'Trouver une solution ne suffit pas. Il faut la remettre à sa place.',
        body: (
          <p>
            Vérifier une solution, c’est la remplacer dans l’équation de DÉPART et voir si l’égalité tient.
            Trois candidats t’attendent : l’un d’eux ne passera pas.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'La bande de vérification',
          subtitle: 'Vérifie les trois candidats, intrus compris.',
          done: allChecked,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Équation de départ : <MathText>{`$${formatProduct(F1, F2)} = 0$`}</MathText>. On remplace{' '}
                <MathText>{'$x$'}</MathText> par le candidat et on calcule.
              </p>

              <div className="flex flex-wrap gap-2" role="group" aria-label="Candidats à vérifier">
                {CANDIDATES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    disabled={checked.includes(c)}
                    onClick={() => {
                      setChecked((s) => [...s, c]);
                      kit.react(evalProduct(F1, F2, c) === 0);
                    }}
                    aria-label={`Vérifier x égale ${formatDec(c)}`}
                    className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white font-mono text-sm font-bold text-slate-700 hover:border-blue-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    Vérifier x = {formatDec(c)}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border-2 border-slate-200 bg-white divide-y divide-slate-100">
                {checked.length === 0 && (
                  <p className="px-3 py-3 text-center text-xs text-slate-400 italic">
                    Touche un candidat pour dérouler sa vérification.
                  </p>
                )}
                {checked.map((c) => {
                  const p = evalProduct(F1, F2, c);
                  const ok = p === 0;
                  return (
                    <div
                      key={c}
                      className={`px-3 py-2.5 text-sm ${ok ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}
                    >
                      <div className="overflow-x-auto">
                        <MathText>
                          {`$x = ${formatDec(c)} \\;:\\; (${formatSubstituted(F1, c)})(${formatSubstituted(F2, c)}) = ${formatDec(evalLin(F1, c))} \\times ${formatDec(evalLin(F2, c))} = ${formatDec(p)}$`}
                        </MathText>
                      </div>
                      <p className="text-xs font-bold mt-0.5">
                        {ok ? '✅ le produit vaut 0 : c’est bien une solution.' : `❌ le produit vaut ${formatDec(p)}, pas 0 : ce n’est pas une solution.`}
                      </p>
                    </div>
                  );
                })}
              </div>

              {!allChecked && (
                <Feedback tone="info">
                  {checked.length}/3 candidats vérifiés. Vérifie-les tous, y compris celui qui te semble
                  faux — c’est ainsi qu’on prouve qu’une valeur n’est PAS solution.
                </Feedback>
              )}
              {allChecked && (
                <Feedback tone="ok">
                  Deux candidats sur trois passent :{' '}
                  <MathText>{`$S = ${formatSolutionSet(ZEROS)}$`}</MathText>. Le candidat{' '}
                  <MathText>{'$x = 2$'}</MathText> donne{' '}
                  <MathText>{`$${formatDec(evalLin(F1, 2))} \\times ${formatDec(evalLin(F2, 2))} = ${formatDec(evalProduct(F1, F2, 2))}$`}</MathText>{' '}
                  — aucun facteur nul, donc pas de produit nul.
                </Feedback>
              )}
              {allChecked && (
                <KnowledgeBrick
                  id="verifier-solution"
                  variant="new"
                  lead="Tu n’as rien résolu : tu as seulement remplacé x, trois fois. C’est exactement ce que veut dire vérifier."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Une solution peut être refusée par le problème',
          done: interpDone,
          content: (
            <div className="space-y-3">
            <TapQuestion
              prompt={
                <>
                  Un rectangle a pour longueur <MathText>{'$x + 5$'}</MathText> cm et pour largeur{' '}
                  <MathText>{'$x - 2$'}</MathText> cm. On cherche <MathText>{'$x$'}</MathText> tel que
                  l’une des dimensions soit nulle : <MathText>{'$(x + 5)(x - 2) = 0$'}</MathText> donne{' '}
                  <MathText>{'$x = -5$'}</MathText> ou <MathText>{'$x = 2$'}</MathText>. Que retient-on
                  pour le rectangle ?
                </>
              }
              options={[
                'Les deux : ce sont les solutions de l’équation',
                'Seulement x = 2 : avec x = −5, la longueur ferait 0 cm et la largeur −7 cm',
                'Aucune : un rectangle ne peut pas avoir un côté nul',
              ]}
              cols={1}
              correct={1}
              explain={
                <>
                  L’équation a bien deux solutions — c’est un fait mathématique. Mais avec{' '}
                  <MathText>{'$x = -5$'}</MathText> la largeur vaudrait{' '}
                  <MathText>{'$-5 - 2 = -7$'}</MathText> cm : une longueur négative n’existe pas. On
                  garde <MathText>{'$x = 2$'}</MathText>, en le DISANT.
                </>
              }
              explainWrong={
                <>
                  Attention à ne pas confondre les deux étapes. Résoudre donne{' '}
                  <MathText>{'$\\{\\,-5\\,;\\,2\\,\\}$'}</MathText> ; interpréter élimine ensuite les
                  valeurs impossibles dans le contexte. Ici, <MathText>{'$x = -5$'}</MathText> donne une
                  largeur de −7 cm : on la rejette, mais on ne rejette pas tout.
                </>
              }
              requires={['verifier-solution', 'ensemble-solutions', 'nombres-relatifs']}
              solved={interpDone}
              onAnswered={() => setInterpDone(true)}
            />
            {interpDone && (
              <KnowledgeBrick
                id="interpreter-solution"
                variant="new"
                lead="L’équation avait raison sur ses deux solutions ; c’est le rectangle qui en a refusé une. Ces deux étapes ne se confondent jamais."
              />
            )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Les trois façons de se tromper',
          subtitle: 'Toutes les trois, tu les as déjà rencontrées.',
          done: retainDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Tu as maintenant les quatre gestes en main. Avant de passer aux problèmes, revois les
                trois façons de les rater — celles que tu as déjà croisées.
              </p>
              <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-1.5 text-sm">
                <p className="font-bold text-amber-900">Les trois pièges déjà rencontrés</p>
                <p className="text-rose-700">❌ Croire qu’il faut annuler les DEUX facteurs</p>
                <p className="text-rose-700">❌ N’agir que sur un plateau de la balance</p>
                <p className="text-rose-700">❌ Garder une solution qui donne une longueur négative</p>
              </div>
              <button
                type="button"
                onClick={() => setRetainDone(true)}
                disabled={retainDone}
                className="w-full min-h-[48px] rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {retainDone ? '✓ Noté' : 'J’ai noté les trois pièges'}
              </button>
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Résoudre, vérifier, interpréter : trois gestes distincts. Le
          module suivant les enchaîne sur un vrai problème de figures — mais il faudra d’abord
          fabriquer le produit, car il n’y en aura pas.
        </KnowledgeSnapshot>
      )}
    />
  );
}
