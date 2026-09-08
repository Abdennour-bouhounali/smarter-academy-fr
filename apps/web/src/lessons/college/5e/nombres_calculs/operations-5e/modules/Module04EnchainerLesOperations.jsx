import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import StepReducer, { initReducer } from '../components/StepReducer';
import { evalFlat, fr, parseDecimalFr, writeExpr } from '../components/operations';

/**
 * Module 4 — MANIPULATION : enchaîner, une opération à la fois.
 *
 * Activity              choisir l'ordre des opérations et voir le calcul se
 *                       raccourcir à chaque coup.
 * Mathematical objective un calcul long se résout en une suite d'étapes, chacune
 *                       remplaçant deux termes par un seul.
 * Student action        toucher l'opérateur qu'il veut effectuer.
 * Visual consequence    les deux termes fusionnent, l'historique s'allonge.
 * Expected observation  « quand je commence par la mauvaise opération, je
 *                       n'arrive pas au même endroit » — l'erreur est vécue,
 *                       pas interdite.
 * Misconception targeted appliquer la règle par récitation sans savoir sur
 *                       quel morceau elle porte, et perdre le fil sur 4 termes.
 *
 * L'ERREUR EST UNE MANIPULATION (412) : le laboratoire n'empêche jamais de
 * choisir la mauvaise opération. Il l'effectue, affiche le résultat obtenu à
 * côté de celui de la convention, et invite à recommencer. Rien ne se fige.
 */
const CALC_A = { nums: [20, 4, 3, 6], ops: ['−', '×', '+'] };   // 14
const CALC_B = { nums: [5, 3, 2, 4], ops: ['+', '×', '÷'] };    // 6.5

export default function Module03EnchainerLesOperations() {
  const [etat1, setEtat1] = useState(() => initReducer(CALC_A));
  const [reussi1, setReussi1] = useState(false);
  const done1 = reussi1;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const attenduA = evalFlat(CALC_A);
  const attenduB = evalFlat(CALC_B);

  const majEtat1 = (next, react) => {
    setEtat1(next);
    if (next.ops.length === 0) {
      const ok = next.nums[0] === attenduA;
      if (ok && !reussi1) { setReussi1(true); react?.(true); }
      else if (!ok) react?.(false);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Résous ce calcul, une opération à la fois',
      subtitle: 'Touche l’opération que tu veux effectuer. Tu peux te tromper — recommence autant que tu veux.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="text-center font-mono text-lg font-black text-slate-500">
            {writeExpr(CALC_A)}
          </div>
          <StepReducer
            expr={CALC_A}
            state={etat1}
            onState={(next) => majEtat1(next, kit.react)}
            attendu={attenduA}
            ariaLabel="Calcul 20 − 4 × 3 + 6 — choisis l’ordre"
          />
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setEtat1(initReducer(CALC_A))}
              className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-indigo-400"
            >
              ↺ Recommencer ce calcul
            </button>
          </div>
          {done1 ? (
            <Feedback tone="ok">
              <strong>{fr(attenduA)}</strong> — c’est bien le résultat de la convention. Regarde ton
              historique : la première opération que tu as effectuée était{' '}
              <strong className="font-mono">4 × 3</strong>. C’est le seul produit du calcul, donc
              le seul bloc qui devait exister avant les autres.
            </Feedback>
          ) : etat1.ops.length === 0 ? (
            <Feedback tone="info">
              Tu es arrivé à <strong className="font-mono">{fr(etat1.nums[0])}</strong>, et la
              convention donne <strong className="font-mono">{fr(attenduA)}</strong>. Ce n’est pas
              grave : c’est même la meilleure façon de voir que l’ordre compte. Recommence en
              effectuant <strong className="font-mono">4 × 3</strong> en premier.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Cherche le morceau qui forme un bloc. Dans ce calcul, il n’y a qu’un seul produit.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Décris la structure avant de calculer',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="enchainement"
            variant="new"
            lead={<>Tu viens de résoudre un calcul en trois étapes, chacune plus courte que la précédente. Cette façon de faire a une méthode.</>}
          />
          <TapQuestion
            prompt={<>Comment se lit la structure de <span className="font-mono font-bold">7 × 2 + 5 × 3</span> ?</>}
            options={[
              'Une somme de deux produits',
              'Un produit de deux sommes',
              'Une suite de quatre opérations sans structure',
              'Une somme, puis deux produits',
            ]}
            correct={0}
            cols={1}
            requires={['enchainement', 'priorites']}
            explain="Les deux produits 7 × 2 et 5 × 3 forment chacun un bloc. Ce qui les relie est un +. Le calcul est donc une somme de deux produits : 14 + 15 = 29."
            explainWrong="Un produit de deux sommes s’écrirait avec des parenthèses : (7 + 2) × (5 + 3). Ici, les × relient les nombres deux à deux, et le + relie les deux blocs obtenus."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Un calcul avec une division',
      subtitle: 'La division a la même priorité que la multiplication.',
      done: q3,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<>Combien vaut <span className="font-mono font-bold">{writeExpr(CALC_B)}</span> ?</>}
            expected={attenduB}
            parse={parseDecimalFr}
            display={fr(attenduB)}
            requires={['priorites', 'enchainement']}
            explain={`Les × et ÷ d’abord, de gauche à droite : 3 × 2 = 6, puis 6 ÷ 4 = 1,5. Il reste 5 + 1,5 = ${fr(attenduB)}.`}
            explainFor={(n) => {
              if (n === 4) return 'Tu as calculé 5 + 3 = 8, puis 8 × 2 = 16, puis 16 ÷ 4 = 4 : c’est la lecture de gauche à droite. Le + doit attendre que les × et ÷ soient faits.';
              if (n === 11) return 'Tu as sans doute calculé 3 × 2 = 6 puis 5 + 6 = 11, en oubliant la division par 4. Les × et les ÷ se font ensemble, de gauche à droite : après 3 × 2 = 6, il reste 6 ÷ 4 = 1,5.';
              return `Ordre : 3 × 2 = 6, puis 6 ÷ 4 = 1,5, enfin 5 + 1,5 = ${fr(attenduB)}. Les × et ÷ passent avant le +, et se font de gauche à droite entre eux.`;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Et avec une parenthèse ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<>Combien vaut <span className="font-mono font-bold">(8 + 4) ÷ 3 + 5</span> ?</>}
            expected={9}
            parse={parseDecimalFr}
            display="9"
            requires={['priorites', 'parentheses', 'enchainement']}
            explain="La parenthèse d’abord : 8 + 4 = 12. Puis la division : 12 ÷ 3 = 4. Enfin l’addition : 4 + 5 = 9."
            explainFor={(n) => {
              if (n === 12) return 'Tu as calculé (8 + 4) ÷ 3 = 4, mais tu as ensuite multiplié ou mal repris : il reste + 5, donc 4 + 5 = 9.';
              if (n === 1.5) return 'Attention à ce que la division divise : 12 ÷ (3 + 5) donnerait 1,5, mais il n’y a pas de parenthèse autour de 3 + 5. La division ne porte que sur le 3.';
              return 'Ordre : la parenthèse (8 + 4 = 12), puis la division (12 ÷ 3 = 4), puis l’addition (4 + 5 = 9).';
            }}
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
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Enchaîner les opérations"
      moduleSubtitle="Une opération à la fois, et le calcul raccourcit"
      estimatedTime="10 min"
      brief={{
        tag: 'Manipulation',
        title: 'Choisis l’ordre, vois la différence',
        tone: 'indigo',
        body: (
          <p>
            Trois ou quatre opérations dans un même calcul : impossible de tout faire d’un coup. Ici,
            tu choisis toi-même par quoi commencer — et tu vois où cela te mène.{' '}
            <strong>Te tromper est autorisé</strong> : c’est même le meilleur moyen de comprendre
            pourquoi l’ordre compte.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
