import React, { useState } from 'react';
import { GitBranch } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { STRATEGIES } from '../components/raisonnement4e';

/**
 * Module 4 — MANIPULATION : la même situation, deux chemins.
 *
 * Activity              résoudre DEUX FOIS le même problème, une fois en
 *                       remontant à l'envers, une fois par une équation, et
 *                       constater que les deux tombent sur le même nombre.
 * Mathematical objective un problème n'a pas UNE méthode attendue ; il en a
 *                       plusieurs qui aboutissent, et deux chemins concordants
 *                       constituent une vérification.
 * Student action        dérouler chaque chemin, puis donner le résultat.
 * Controlled variable   le chemin choisi ; les nombres sont les MÊMES.
 * Mathematical state    tout est calculé à partir des trois constantes de la
 *                       situation — aucun nombre du module n'est écrit à la
 *                       main dans une phrase.
 * Visual consequence    les deux colonnes arrivent au même nombre.
 * Expected observation  « ce n'est pas la même méthode, et c'est la même
 *                       réponse ».
 * Misconception targeted croire qu'il existe une méthode « attendue » et que
 *                       les autres sont fausses.
 *
 * La SITUATION est neuve — une cagnotte, pas le club du module 3 : on ne
 * compare pas deux chemins sur un problème déjà résolu, sinon l'élève reconnaît
 * la réponse au lieu de la trouver.
 */
const DEPART = 9;      // ce que Léa avait au départ (la réponse cherchée)
const AJOUT = 7;       // elle reçoit 7 €
const FACTEUR = 3;     // sa grand-mère triple la somme
const ARRIVEE = (DEPART + AJOUT) * FACTEUR;  // 48 — calculé, jamais écrit

/** Le chemin « remonter à l'envers », calculé étape par étape. */
const REMONTER = [
  { texte: `On part de l’arrivée : ${ARRIVEE} €`, valeur: ARRIVEE },
  { texte: `On défait le « ×${FACTEUR} » : on divise par ${FACTEUR}`, valeur: ARRIVEE / FACTEUR },
  { texte: `On défait le « +${AJOUT} » : on retire ${AJOUT}`, valeur: ARRIVEE / FACTEUR - AJOUT },
];

/** Le chemin « équation », écrit dans l'ordre où on le pose au tableau. */
const EQUATION = [
  { texte: 'On appelle x la somme de départ', ecriture: 'x' },
  { texte: `Elle reçoit ${AJOUT} €`, ecriture: `x + ${AJOUT}` },
  { texte: `Sa grand-mère triple le tout`, ecriture: `${FACTEUR} × (x + ${AJOUT})` },
  { texte: `Et cela fait ${ARRIVEE} €`, ecriture: `${FACTEUR}(x + ${AJOUT}) = ${ARRIVEE}` },
  { texte: 'On développe et on résout', ecriture: `${FACTEUR}x + ${FACTEUR * AJOUT} = ${ARRIVEE}` },
  { texte: `On retire ${FACTEUR * AJOUT}, puis on divise par ${FACTEUR}`, ecriture: `x = ${DEPART}` },
];

export default function Module04DeuxChemins() {
  const [chemin1, setChemin1] = useState(0);
  const [chemin2, setChemin2] = useState(0);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = chemin1 >= REMONTER.length && chemin2 >= EQUATION.length;

  const steps = [
    {
      num: 1,
      title: 'Déroule les deux chemins',
      subtitle: 'Le même problème, deux façons de s’y prendre. Avance-les l’un après l’autre.',
      done: done1,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-3.5">
            <p className="text-sm text-emerald-900">
              Léa a une certaine somme dans sa cagnotte. Elle y ajoute {AJOUT} €, puis sa
              grand-mère triple le contenu. La cagnotte contient alors {ARRIVEE} €.
            </p>
            <p className="mt-2 text-sm font-bold text-emerald-950">
              Combien Léa avait-elle au départ ?
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Chemin A — remonter à l'envers */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                Chemin A · {STRATEGIES.find((s) => s.id === 'remonter').nom}
              </p>
              <ol className="mt-2 space-y-1.5">
                {REMONTER.slice(0, chemin1).map((e) => (
                  <li key={e.texte} className="rounded-xl bg-slate-50 px-2.5 py-2 text-sm">
                    <span className="text-slate-600">{e.texte}</span>
                    <span className="ml-2 font-mono font-bold tabular-nums text-slate-900">
                      {e.valeur} €
                    </span>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={() => setChemin1((c) => (c >= REMONTER.length ? 0 : c + 1))}
                className="mt-2 min-h-[44px] w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700"
              >
                {chemin1 >= REMONTER.length ? 'Chemin A terminé — recommencer' : 'Remonter d’une étape'}
              </button>
            </div>

            {/* Chemin B — l'équation */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                Chemin B · {STRATEGIES.find((s) => s.id === 'equation').nom}
              </p>
              <ol className="mt-2 space-y-1.5">
                {EQUATION.slice(0, chemin2).map((e) => (
                  <li key={e.texte} className="rounded-xl bg-slate-50 px-2.5 py-2 text-sm">
                    <span className="text-slate-600">{e.texte}</span>
                    <span className="ml-2 font-mono font-bold text-slate-900">{e.ecriture}</span>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={() => setChemin2((c) => (c >= EQUATION.length ? 0 : c + 1))}
                className="mt-2 min-h-[44px] w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700"
              >
                {chemin2 >= EQUATION.length ? 'Chemin B terminé — recommencer' : 'Écrire la ligne suivante'}
              </button>
            </div>
          </div>

          {done1 && (
            <Feedback tone="ok">
              Deux raisonnements sans rien en commun, et le même nombre au bout : {DEPART} €. Ce
              n’est pas une coïncidence — c’est ce qui rend la réponse sûre.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Choisir, sans se tromper de question',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Lequel des deux chemins est le bon ?"
            options={[
              'Les deux : ils aboutissent tous les deux',
              'Le chemin A, parce qu’il est plus court',
              'Le chemin B, parce qu’il utilise une lettre',
              'Aucun : il en faudrait un troisième',
            ]}
            correct={0}
            cols={1}
            requires={['modeliser-par-une-equation', 'representer']}
            explain="Une stratégie se juge à une seule chose : arrive-t-elle au bout ? Ici les deux y arrivent, donc les deux sont bonnes. Remonter à l’envers marche quand on connaît l’arrivée ; l’équation marche même quand l’inconnue intervient plusieurs fois."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="plusieurs-strategies"
              variant="new"
              lead="Deux chemins valides pour une même situation : c’est la règle, pas l’exception."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Quand remonter ne suffit plus',
      done: q4,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Change une phrase : « Léa ajoute {AJOUT} €, sa grand-mère triple le tout, puis Léa
            dépense le double de sa somme de départ. » Il reste alors{' '}
            {ARRIVEE - 2 * DEPART} €.
          </p>
          <TapQuestion
            prompt="Quelle stratégie choisir maintenant ?"
            options={[
              'Une équation : la somme de départ intervient DEUX fois',
              'Remonter à l’envers, comme au chemin A',
              'Des essais organisés, en testant tous les prix',
              'Un schéma en barres, comme au module précédent',
            ]}
            correct={0}
            cols={1}
            requires={['plusieurs-strategies']}
            explain={`Remonter à l’envers suppose qu’on défait les opérations une par une. Ici la somme de départ apparaît au début ET à la fin : on ne peut plus remonter, il faut une lettre. C’est exactement le « quand » de la stratégie : ${STRATEGIES.find((s) => s.id === 'equation').quand}.`}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <NumericQuestion
              prompt={`Vérifie que ${DEPART} € marche encore : ajoute ${AJOUT}, triple, puis retire le double de ${DEPART}. Que reste-t-il ?`}
              expected={ARRIVEE - 2 * DEPART}
              parse={parseDec}
              suffix="€"
              requires={['plusieurs-strategies', 'controler-le-sens']}
              explain={`(${DEPART} + ${AJOUT}) × ${FACTEUR} = ${ARRIVEE}, puis ${ARRIVEE} − 2 × ${DEPART} = ${ARRIVEE - 2 * DEPART}. La somme de départ n’a pas changé : c’est bien la même situation, vue autrement.`}
              explainFor={(n) => {
                if (n === ARRIVEE) return `Tu as oublié de retirer le double de la somme de départ, c’est-à-dire ${2 * DEPART} €.`;
                if (n === ARRIVEE - DEPART) return `Il faut retirer le DOUBLE de ${DEPART}, donc ${2 * DEPART} €, pas ${DEPART} €.`;
                return null;
              }}
            />
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
      moduleTitle="Deux chemins, une réponse"
      moduleSubtitle="Il n’y a pas de méthode attendue"
      estimatedTime="10 min"
      brief={{
        tag: '🎬 Mission 04',
        title: 'La cagnotte de Léa',
        tone: 'indigo',
        body: (
          <>
            Un même problème, résolu deux fois de deux façons très différentes.{' '}
            <strong>Laquelle est la bonne ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5">
          <GitBranch className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="text-sm text-emerald-900">
            Avance les deux colonnes en parallèle, et compare les deux dernières lignes.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
