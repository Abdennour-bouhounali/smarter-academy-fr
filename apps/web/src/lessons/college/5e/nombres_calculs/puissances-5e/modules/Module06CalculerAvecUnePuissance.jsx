import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import {
  puissance, ecrirePuissance, evaluer, n, pow, mul, add, sub, parseEntier,
} from '../components/puissances';

/**
 * Module 6 — LABORATOIRE D'ENTRAÎNEMENT : calculer avec une puissance.
 *
 * Transfert, pas répétition : la puissance cesse d'être un objet isolé pour
 * devenir un morceau d'un calcul plus grand. La leçon « Opérations » (5e) a
 * installé l'ordre « parenthèses → × ÷ → + − » ; il ne reste qu'UN cran à
 * ajouter, et il se DÉDUIT du sens plutôt qu'il ne s'apprend :
 *
 *   2³ n'est qu'une écriture courte de 8. Ce raccourci doit être déplié avant
 *   qu'on puisse s'en servir dans le reste du calcul — donc en premier.
 *
 * Misconception targeted : appliquer la puissance à tout ce qui précède
 * (lire 3 × 2³ comme (3 × 2)³), et l'erreur de lecture 2³ = 6.
 *
 * Toutes les valeurs sont calculées par components/puissances.js : aucun
 * résultat n'est écrit à la main dans ce fichier.
 */
const CALC_A = mul(n(3), pow(2, 3));                 // 3 × 2³ = 24
const CALC_B = add(n(5), pow(3, 2));                 // 5 + 3² = 14
const CALC_C = sub(mul(n(2), pow(5, 2)), n(10));     // 2 × 5² − 10 = 40

export default function Module06CalculerAvecUnePuissance() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Deux lectures possibles, une seule correcte',
      subtitle: 'Comme au tout début de « Opérations » : le même calcul, deux façons de le lire.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-rose-200 bg-white p-4 text-center">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Le calcul</div>
            <div className="font-mono text-3xl font-black text-slate-800">
              3 × {ecrirePuissance(2, 3)}
            </div>
          </div>
          <TapQuestion
            prompt="Sur quoi porte exactement la petite puissance 3 ?"
            options={[
              'Sur le 2 seulement',
              'Sur tout le calcul 3 × 2',
              'Sur le 3 seulement',
              'Sur le résultat final',
            ]}
            correct={0}
            cols={2}
            requires={['exposant', 'puissance']}
            explain={`L’exposant n’agit que sur le nombre juste en dessous de lui — ici le 2. Le calcul vaut donc 3 × 8 = ${evaluer(CALC_A)}. S’il portait sur 3 × 2, on l’aurait écrit avec des parenthèses : (3 × 2)³ = ${puissance(6, 3)}.`}
            explainWrong={`Une puissance ne s’applique jamais à tout ce qui la précède : elle est collée au nombre qu’elle répète. Ici c’est le 2 qui est répété trois fois, ce qui donne 8, puis 3 × 8 = ${evaluer(CALC_A)}.`}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Un cran de plus dans l’ordre',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="priorite-puissance"
            variant="new"
            lead={<>Tu connais déjà l’ordre des priorités depuis « Opérations ». La puissance vient s’y glisser à une place, et une seule.</>}
          />
          <NumericQuestion
            prompt={<>Combien vaut <span className="font-mono font-bold">5 + {ecrirePuissance(3, 2)}</span> ?</>}
            expected={evaluer(CALC_B)}
            parse={parseEntier}
            display={String(evaluer(CALC_B))}
            requires={['priorite-puissance', 'exposant']}
            explain={`La puissance d’abord : ${ecrirePuissance(3, 2)} = 9. Puis l’addition : 5 + 9 = ${evaluer(CALC_B)}.`}
            explainFor={(rep) => {
              if (rep === 64) return 'Tu as calculé (5 + 3)² = 8² = 64, en additionnant avant. La puissance ne porte que sur le 3 : il faut donc faire 3² = 9 en premier, puis ajouter 5.';
              if (rep === 11) return 'Tu as lu 3² comme 3 × 2 = 6, puis 5 + 6 = 11. Le petit 2 ne multiplie pas : il dit que le 3 est écrit deux fois, soit 3 × 3 = 9.';
              return `D’abord la puissance : ${ecrirePuissance(3, 2)} = 9. Ensuite l’addition : 5 + 9 = ${evaluer(CALC_B)}.`;
            }}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Un calcul à trois étapes',
      done: q3,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<>Combien vaut <span className="font-mono font-bold">2 × {ecrirePuissance(5, 2)} − 10</span> ?</>}
            expected={evaluer(CALC_C)}
            parse={parseEntier}
            display={String(evaluer(CALC_C))}
            requires={['priorite-puissance', 'exposant']}
            explain={`Trois étapes, dans l’ordre : la puissance ${ecrirePuissance(5, 2)} = 25 ; puis le produit 2 × 25 = 50 ; puis la soustraction 50 − 10 = ${evaluer(CALC_C)}.`}
            explainFor={(rep) => {
              if (rep === 90) return 'Tu as sans doute fait (2 × 5)² − 10 = 100 − 10 = 90. La puissance ne porte que sur le 5, pas sur le produit 2 × 5.';
              if (rep === 0) return 'Tu as peut-être fait 2 × (5² − 10) = 2 × 15 = 30, ou soustrait trop tôt. La soustraction vient en DERNIER : 2 × 25 = 50, puis 50 − 10 = 40.';
              return `Ordre : ${ecrirePuissance(5, 2)} = 25, puis 2 × 25 = 50, puis 50 − 10 = ${evaluer(CALC_C)}.`;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Quatre calculs à trancher',
      done: q4,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={<p className="text-sm text-slate-700">Pour chaque calcul, quel est le bon résultat ?</p>}
            rows={[
              {
                id: 'p1',
                label: `${ecrirePuissance(4, 2)} + 1`,
                options: ['17', '9', '25'],
                correct: 0,
                correction: `${ecrirePuissance(4, 2)} = 16, puis 16 + 1 = 17. (25 serait (4 + 1)².)`,
              },
              {
                id: 'p2',
                label: `2 × ${ecrirePuissance(10, 2)}`,
                options: ['400', '200', '40'],
                correct: 1,
                correction: `${ecrirePuissance(10, 2)} = 100, puis 2 × 100 = 200. (400 serait (2 × 10)².)`,
              },
              {
                id: 'p3',
                label: `${ecrirePuissance(3, 3)} − 7`,
                options: ['20', '2', '81'],
                correct: 0,
                correction: `${ecrirePuissance(3, 3)} = 27, puis 27 − 7 = 20. (2 viendrait de lire 3³ comme 3 × 3 = 9.)`,
              },
              {
                id: 'p4',
                label: `(2 + 3) × ${ecrirePuissance(2, 2)}`,
                options: ['20', '14', '100'],
                correct: 0,
                correction: `La parenthèse d’abord : 2 + 3 = 5. Puis la puissance : ${ecrirePuissance(2, 2)} = 4. Enfin 5 × 4 = 20.`,
              },
            ]}
            requires={['priorite-puissance', 'exposant']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  L’ordre complet est maintenant en place :{' '}
                  <strong>parenthèses → puissances → × ÷ → + −</strong>. Chaque distracteur
                  correspondait à une puissance appliquée trop largement, ou à un exposant lu comme
                  un facteur.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Deux réflexes suffisent : d’abord{' '}
                  <strong>déplier la puissance</strong> (elle ne porte que sur le nombre juste en
                  dessous d’elle), ensuite appliquer l’ordre habituel des priorités.
                </Feedback>
              )
            }
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
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Calculer avec une puissance"
      moduleSubtitle="Un cran de plus dans l’ordre des priorités"
      estimatedTime="9 min"
      brief={{
        tag: 'Entraînement',
        title: 'Où se place la puissance ?',
        tone: 'amber',
        body: (
          <p>
            Tu connais l’ordre des priorités depuis la leçon « Opérations » :{' '}
            <strong className="font-mono">( ) → × ÷ → + −</strong>. La puissance doit s’y glisser
            quelque part. À quelle place — et surtout, <strong>pourquoi celle-là</strong> ?
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
