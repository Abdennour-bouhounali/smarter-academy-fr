import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { FractionView, FractionField } from '../../../../../common/algebra4e';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { q, produit, quotient, inverse, diagnostiquerQuotient } from '../components/rationnels4e';

/**
 * Module 5 — FORMALISATION : l'inverse, puis la division qui s'y ramène.
 *
 * Activity              chercher, parmi des candidats, le nombre dont le
 *                       produit avec un nombre donné vaut exactement 1.
 * Mathematical objective l'inverse se DÉFINIT par un produit qui vaut 1 — il
 *                       ne se décrète pas « on retourne la fraction ». Le
 *                       retournement est la CONSÉQUENCE, constatée après coup.
 * Student action        taper un candidat ; le produit se calcule aussitôt.
 * Expected observation  « c'est toujours la fraction retournée » — puis
 *                       « zéro n'y arrive jamais, quoi que j'essaie ».
 * Misconception targeted « l'inverse, c'est l'opposé » (−2/3), et, à la
 *                       division, « on inverse le premier ».
 *
 * Ce module vient APRÈS le produit (M4) par nécessité : l'inverse est défini
 * par un produit. L'ordre des modules suit la dépendance mathématique, pas la
 * commodité.
 */
const CIBLE = q(3, 5);
const CANDIDATS = [q(-3, 5), q(5, 3), q(3, 5), q(1, 3)];

export default function Module05LInverseEtLaDivision() {
  const [essai, setEssai] = useState(null);
  const trouve = essai !== null && produit(CIBLE, CANDIDATS[essai]).n === 1 && produit(CIBLE, CANDIDATS[essai]).d === 1;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Cherche le nombre qui ramène à 1',
      subtitle: 'Un seul de ces quatre nombres, multiplié par 3/5, donne exactement 1. Trouve-le.',
      done: trouve,
      content: (kit) => {
        const res = essai !== null ? produit(CIBLE, CANDIDATS[essai]) : null;
        return (
          <div className="space-y-3">
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4">
              <div className="flex flex-wrap items-center justify-center gap-2 text-lg">
                <FractionView value={CIBLE} size="lg" tone="indigo" />
                <span className="font-black text-slate-500">×</span>
                {essai === null ? (
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-slate-400 text-2xl font-black text-slate-400">
                    ?
                  </span>
                ) : (
                  <FractionView value={CANDIDATS[essai]} size="lg" tone="violet" />
                )}
                <span className="font-black text-slate-500">=</span>
                {res === null ? (
                  <span className="text-2xl font-black text-slate-300">…</span>
                ) : (
                  <FractionView value={res} size="lg" tone={trouve ? 'emerald' : 'rose'} />
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Candidats">
              {CANDIDATS.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setEssai(i);
                    const p = produit(CIBLE, c);
                    if (p.n === 1 && p.d === 1 && !trouve) kit.react(true);
                  }}
                  aria-pressed={i === essai}
                  className={`min-h-[52px] rounded-xl border-2 px-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    i === essai ? 'border-blue-600 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400'
                  }`}
                >
                  <FractionView value={c} size="sm" tone={i === essai ? 'violet' : 'slate'} />
                </button>
              ))}
            </div>

            {trouve ? (
              <Feedback tone="ok">
                Exactement : <FractionView value={CIBLE} size="sm" tone="indigo" /> ×{' '}
                <FractionView value={q(5, 3)} size="sm" tone="violet" /> = 15/15 = <strong>1</strong>.
                Le nombre cherché est la fraction <strong>retournée</strong> — et ce n’est pas une
                règle décrétée : c’est la seule façon d’obtenir le même nombre en haut et en bas.
                Essaie encore les autres candidats pour voir ce qu’ils donnent.
              </Feedback>
            ) : essai !== null ? (
              <Feedback tone="warn">
                Ce produit vaut <FractionView value={res} size="sm" tone="rose" />, pas 1. Pour que
                le résultat fasse 1, il faut que le numérateur et le dénominateur du produit soient{' '}
                <strong>égaux</strong>. Quels facteurs feraient ça ?
              </Feedback>
            ) : (
              <Feedback tone="info">
                Choisis un candidat : son produit avec 3/5 s’affiche aussitôt.
              </Feedback>
            )}
          </div>
        );
      },
    },
    {
      num: 2,
      title: 'Trouve les inverses',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="inverse-nombre"
            variant="new"
            lead={<>Le nombre que tu viens de trouver — celui qui ramène le produit à 1 — porte un nom.</>}
          />
          <BatchChoiceQuestion
            intro={<p className="text-sm text-slate-700">Pour chaque nombre, choisis son inverse.</p>}
            rows={[
              {
                id: 'r1',
                label: <FractionView value={q(2, 7)} size="sm" tone="indigo" />,
                options: [
                  <FractionView key="a" value={q(7, 2)} size="sm" />,
                  <FractionView key="b" value={q(-2, 7)} size="sm" />,
                ],
                correct: 0,
                correction: '2/7 × 7/2 = 14/14 = 1',
              },
              {
                id: 'r2',
                label: <span className="font-mono text-base font-bold">4</span>,
                options: [
                  <FractionView key="a" value={q(1, 4)} size="sm" />,
                  <span key="b" className="font-mono text-sm font-bold">−4</span>,
                ],
                correct: 0,
                correction: '4 × 1/4 = 1 — un entier a bien un inverse',
              },
              {
                id: 'r3',
                label: <span className="font-mono text-base font-bold">0</span>,
                options: [
                  <span key="a" className="text-xs font-bold">il n’en a pas</span>,
                  <span key="b" className="font-mono text-sm font-bold">0</span>,
                ],
                correct: 0,
                correction: 'aucun nombre multiplié par 0 ne donne 1',
              },
            ]}
            requires={['inverse-nombre']}
            feedback={({ allRight }) =>
              allRight ? (
                <p className="text-sm text-emerald-700">
                  Parfait. Retenir : on échange les deux termes, le signe reste, et{' '}
                  <strong>zéro est le seul nombre sans inverse</strong>.
                </p>
              ) : (
                <p className="text-sm text-slate-700">
                  L’inverse n’est pas l’opposé : l’opposé de 2/7 est −2/7 (leur SOMME fait 0), son
                  inverse est 7/2 (leur PRODUIT fait 1). Et zéro n’a pas d’inverse, puisque tout
                  nombre multiplié par 0 donne 0.
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
      title: 'Diviser par une fraction',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="diviser-par-inverse"
            variant="new"
            lead={<>Maintenant que l’inverse existe, la division n’a plus besoin de règle propre : elle se ramène à la multiplication.</>}
          />
          <FractionField
            prompt={
              <span className="inline-flex flex-wrap items-center gap-1.5">
                Combien fait
                <FractionView value={q(3, 4)} size="sm" tone="indigo" />
                <span className="font-black">÷</span>
                <FractionView value={q(2, 5)} size="sm" tone="violet" />
                <span>?</span>
              </span>
            }
            expected={quotient(q(3, 4), q(2, 5))}
            allowNegative={false}
            requires={['diviser-par-inverse', 'inverse-nombre', 'produit-fractions']}
            explain="On inverse le SECOND et on multiplie : 3/4 × 5/2 = 15/8. Le résultat dépasse 3/4 — normal, on divise par un nombre inférieur à 1."
            explainFor={(rep) => {
              const code = diagnostiquerQuotient(q(3, 4), q(2, 5), rep);
              if (code === 'a-multiplie-sans-inverser') {
                return "Tu as multiplié sans inverser : 3/4 × 2/5. Pour diviser, il faut d’abord retourner le SECOND nombre.";
              }
              if (code === 'inverse-le-mauvais') {
                return "Tu as inversé le premier nombre. C’est le DIVISEUR — celui d’après le signe ÷ — qu’on retourne.";
              }
              return "Diviser par 2/5, c’est multiplier par 5/2 : 3 × 5 = 15 en haut, 4 × 2 = 8 en bas.";
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Un résultat qui surprend',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Combien de bouteilles de 1/2 litre peut-on remplir avec 3 litres ?"
            options={['6', '1,5', '3', '2']}
            correct={0}
            cols={4}
            requires={['diviser-par-inverse']}
            explain="On cherche combien de fois 1/2 tient dans 3 : c’est 3 ÷ 1/2 = 3 × 2 = 6. Diviser par un nombre plus petit que 1 fait AUGMENTER le résultat — ce qui est logique : les bouteilles étant petites, il en faut beaucoup."
            explainWrong="1,5 serait 3 × 1/2 — la moitié de 3. Mais ici on ne prend pas la moitié de 3 litres : on demande combien de demi-litres tiennent dedans, ce qui est une division."
            solved={q4}
            onAnswered={() => setQ4(true)}
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
      moduleTitle="L’inverse et la division"
      moduleSubtitle="Le nombre qui ramène à 1"
      estimatedTime="12 min"
      brief={{
        tag: 'Formalisation',
        title: 'Défaire une multiplication',
        tone: 'indigo',
        body: (
          <p>
            Multiplier par 3/5 transforme un nombre. Existe-t-il un nombre qui{' '}
            <strong>défait</strong> exactement cette transformation ? S’il existe, la division n’aura
            plus besoin d’aucune règle à elle.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
