import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { parseDec } from '@smarter-academy/core';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 4 — FORMALISATION, et le PONT explicite avec la leçon
 * « Fréquences conditionnelles ».
 *
 * Le risque de doublon entre les deux leçons est réel : c'est la même
 * division. On le traite frontalement plutôt que de l'éviter — l'élève doit
 * savoir que le calcul est identique et que seul le STATUT change (décrire
 * des données observées / modéliser un tirage au hasard). C'est aussi ce
 * module qui introduit la formule des probabilités composées, absente de la
 * leçon de statistiques parce qu'elle n'a de sens que sur un modèle.
 */
export default function Module04DesFrequencesAuxProbabilites() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Le même quotient, deux statuts',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">En statistiques</div>
              <p className="text-sm text-slate-700">
                <strong>Fréquence conditionnelle.</strong> On DÉCRIT des données déjà recueillies : parmi les
                200 internes observés, 150 sont en club, soit 0,75.
              </p>
            </div>
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">En probabilités</div>
              <p className="text-sm text-emerald-900">
                <strong>Probabilité conditionnelle.</strong> On MODÉLISE un tirage au hasard à venir : si
                l’élève tiré est interne, il a 0,75 de chance d’être en club.
              </p>
            </div>
          </div>
          <TapQuestion
            prompt="Qu’est-ce qui distingue une fréquence conditionnelle d’une probabilité conditionnelle ?"
            options={[
              'Pas le calcul, mais ce dont on parle : des données observées ou un tirage au hasard',
              'La formule : on divise par le total dans un cas, par la ligne dans l’autre',
              'La fréquence est un pourcentage, la probabilité un nombre décimal',
              'Rien du tout : ce sont deux noms pour la même chose',
            ]}
            correct={0} cols={1}
            explain="Le quotient est rigoureusement le même : 150/200. Ce qui change est son statut — la fréquence RÉSUME une série d’observations, la probabilité PRÉVOIT le résultat d’une expérience aléatoire. C’est d’ailleurs la loi des grands nombres qui justifie qu’on passe de l’une à l’autre : sur un grand nombre de tirages, la fréquence observée s’approche de la probabilité."
            explainWrong="Les deux se calculent exactement pareil (effectif de l’intersection ÷ effectif de la condition), et les deux peuvent s’écrire en pourcentage. La différence est de nature, pas de formule."
            solved={q1} onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Composer deux probabilités',
      subtitle: 'De la conditionnelle vers l’intersection.',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-emerald-200 bg-white p-4 space-y-2">
            <div className="text-center">
              <MathText>{'$$P(A \\cap B) = P(A) \\times P_A(B)$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              La formule se relit à l’endroit : « la probabilité d’être interne <em>et</em> en club » =
              « la probabilité d’être interne » × « la probabilité d’être en club, une fois qu’on sait qu’il
              est interne ».
            </p>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              0,25 × 0,75 = <strong>0,1875</strong> — et c’est bien 150/800.
            </div>
          </div>
          <NumericQuestion
            prompt="Dans une ville, 40 % des habitants font du vélo. Parmi les cyclistes, 30 % vont travailler à vélo chaque jour. Quelle est la probabilité qu’un habitant tiré au hasard soit un cycliste quotidien ? (en %)"
            expected={(n) => Math.abs(n - 12) < 0.3}
            parse={parseDec}
            display="12 %"
            suffix="%"
            explain="On compose : 0,40 × 0,30 = 0,12, soit 12 %. Les 30 % ne concernent que les cyclistes ; on ne peut pas les appliquer à toute la ville."
            explainFor={(n) => (Math.abs(n - 30) < 0.5
              ? 'Les 30 % sont une probabilité CONDITIONNELLE : ils portent sur les seuls cyclistes. Pour revenir à toute la ville, il faut les multiplier par la probabilité d’être cycliste.'
              : Math.abs(n - 70) < 0.5
                ? 'On ne additionne pas des probabilités ici : il s’agit de deux étapes successives, donc d’un produit.'
                : null)}
            solved={q2} onAnswered={(ok) => { if (ok) setQ2(true); }}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Interpréter en une phrase',
      done: q3,
      content: (
        <TapQuestion
          prompt="Dans un lycée, P_externe(club) = 0,5. Quelle phrase traduit correctement ce nombre ?"
          options={[
            'La moitié des externes sont en club',
            'La moitié des élèves en club sont externes',
            'La moitié des élèves sont externes et en club',
            'La moitié des élèves du lycée sont externes',
          ]}
          correct={0} cols={1}
          explain="L’indice « externe » désigne la population dont on parle : la phrase commence donc par « parmi les externes ». Les trois autres formulations décrivent P_club(externe), P(externe ∩ club) et P(externe) — trois nombres différents."
          explainWrong="Repère l’indice : il donne le groupe de référence. P_externe(club) parle des externes, et dit quelle part d’entre eux est en club."
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Des fréquences aux probabilités" moduleSubtitle="Même division, autre statut" estimatedTime="12 min"
      brief={{
        tag: 'Formalisation', title: 'Tu connaissais déjà ce calcul', tone: 'emerald',
        body: <p>En statistiques, tu divisais une case par sa ligne. Ici, c’est le même geste — mais on ne décrit plus des données : on prévoit un tirage.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Retenu.</strong> Fréquence et probabilité conditionnelles se calculent pareil ; la loi des
          grands nombres relie l’une à l’autre. Et <MathText>{'$P(A \\cap B) = P(A) \\times P_A(B)$'}</MathText>.
          Module suivant : quatre situations concrètes.
        </KnowledgeSnapshot>
      )}
    />
  );
}
