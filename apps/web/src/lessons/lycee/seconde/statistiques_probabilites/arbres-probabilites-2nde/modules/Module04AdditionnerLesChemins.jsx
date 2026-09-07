import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { parseDec } from '@smarter-academy/core';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import ProbabilityTree from '../../../../../common/stats/ProbabilityTree';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { arbreBilles, pChemin, pCouleur } from '../data';

/**
 * Module 4 — FORMALISATION : la probabilité d'un ÉVÉNEMENT, somme des
 * chemins qui le réalisent.
 *
 * Le piège central est ici, et les nombres ont été choisis pour lui : la
 * moyenne naïve des deux compositions (1/2 et 1/4) vaut 0,375, alors que la
 * bonne réponse vaut 0,40. Un élève qui « fait la moyenne » obtient un
 * nombre PLAUSIBLE mais faux — il ne peut donc pas s'en tirer sans pondérer
 * par la probabilité de chaque sac.
 *
 * Les deux chemins rouges sont mis en évidence ensemble (highlightPaths) :
 * on voit qu'ils sont disjoints, ce qui justifie l'addition.
 */
const TREE = arbreBilles();
const ROUGE_PATHS = ['A/R', 'B/R'];

export default function Module04AdditionnerLesChemins() {
  const [showPaths, setShowPaths] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Combien de routes mènent à « rouge » ?',
      subtitle: 'Affiche les chemins qui donnent une bille rouge.',
      done: q1,
      content: (
        <div className="space-y-3">
          <button type="button" onClick={() => setShowPaths((v) => !v)} aria-pressed={showPaths}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition active:scale-95 ${
              showPaths ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300'}`}>
            {showPaths ? '✓ Chemins « rouge » affichés' : 'Montrer les chemins qui donnent une rouge'}
          </button>
          <ProbabilityTree
            branches={TREE} levelLabels={['sac', 'bille']}
            highlightPaths={showPaths ? ROUGE_PATHS : []}
          />
          {showPaths && (
            <Feedback tone="info">
              Deux chemins mènent à une bille rouge : <strong>A puis rouge</strong> (0,30) et
              <strong> B puis rouge</strong> (0,10). Ils sont <strong>incompatibles</strong> — un tirage passe
              par l’un ou par l’autre, jamais par les deux — c’est pourquoi on peut les additionner.
            </Feedback>
          )}
          <NumericQuestion
            prompt="Quelle est la probabilité d’obtenir une bille rouge ? (en %)"
            expected={(n) => Math.abs(n - pCouleur('rouge') * 100) < 0.5}
            parse={parseDec}
            display="40 %"
            suffix="%"
            explain="0,30 + 0,10 = 0,40, soit 40 %. On additionne les probabilités des deux chemins qui réalisent l’événement."
            explainFor={(n) => (Math.abs(n - 37.5) < 0.6
              ? 'Tu as fait la moyenne des deux compositions : (1/2 + 1/4) ÷ 2 = 0,375. Mais les deux sacs ne sont PAS choisis aussi souvent — le sac A l’est 6 fois sur 10. Il faut pondérer, c’est-à-dire additionner les chemins.'
              : Math.abs(n - 30) < 0.6
                ? 'C’est la probabilité du seul chemin passant par A. Une rouge peut aussi venir du sac B : il reste un chemin à ajouter.'
                : null)}
            solved={q1} onAnswered={(ok) => { if (ok) setQ1(true); }}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'La règle complète',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-emerald-200 bg-white p-4 space-y-3">
            <div className="text-center">
              <MathText>{'$$P(\\text{événement}) = \\sum \\text{(chemins qui le réalisent)}$$'}</MathText>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                <strong>Le long d’un chemin</strong> — on <strong>multiplie</strong> les poids rencontrés.
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>Entre plusieurs chemins</strong> — on <strong>additionne</strong> leurs probabilités.
              </div>
            </div>
          </div>
          <TapQuestion
            prompt="Dans quel cas additionne-t-on des probabilités dans un arbre ?"
            options={[
              'Quand plusieurs chemins distincts réalisent le même événement',
              'Quand on parcourt les deux branches d’un même chemin',
              'Quand les deux étapes sont indépendantes',
              'Jamais : dans un arbre on multiplie toujours',
            ]}
            correct={0} cols={1}
            explain="Multiplier et additionner ne répondent pas à la même question. On multiplie EN AVANÇANT sur un chemin (les étapes s’enchaînent) ; on additionne EN RASSEMBLANT des chemins différents qui aboutissent au même résultat."
            explainWrong="Le long d’un même chemin, les étapes s’enchaînent : c’est un produit. L’addition ne sert qu’à réunir des routes distinctes menant au même événement."
            solved={q2} onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Additionner les chemins" moduleSubtitle="Multiplier ou additionner : deux questions différentes" estimatedTime="14 min"
      brief={{
        tag: 'Formalisation', title: 'Un résultat, plusieurs routes', tone: 'emerald',
        body: <p>Une bille rouge peut venir du sac A comme du sac B. Comment rassembler ces deux possibilités sans compter deux fois — ni faire une moyenne trompeuse ?</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Retenu.</strong> On <strong>multiplie</strong> le long d’un chemin, on
          <strong> additionne</strong> les chemins qui réalisent l’événement. Module suivant : traduire des
          situations réelles dans les deux sens.
        </KnowledgeSnapshot>
      )}
    />
  );
}
