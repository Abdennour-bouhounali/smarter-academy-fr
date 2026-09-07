import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { groupIntoClasses, classMean, mean, formatNumber } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { RECHARGES, BORNES_10 } from '../data';

/**
 * Module 4 — MANIPULATION : la moyenne ESTIMÉE à partir des centres.
 *
 * L'honnêteté mathématique est le sujet du module : on compare l'estimation
 * (41,15 min) à la moyenne exacte calculée sur les données brutes (41,15 min
 * également, à deux décimales près — l'écart réel est de 0,002 min ici) et on
 * explique POURQUOI l'accord est bon : les valeurs se répartissent à peu près
 * symétriquement dans chaque classe. Le module montre aussi un cas où
 * l'estimation serait mauvaise.
 */
const CLASSES = groupIntoClasses(RECHARGES, BORNES_10);
const EST = classMean(CLASSES);
const EXACT = mean(RECHARGES);

export default function Module04EstimerLaMoyenne() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Chaque classe par son centre',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
            <MathText>{'$$\\bar{x} \\approx \\frac{n_1 c_1 + n_2 c_2 + \\dots}{n_1 + n_2 + \\dots}$$'}</MathText>
            <p className="text-xs text-emerald-700 mt-1">cᵢ = centre de la classe i</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th scope="col" className="border border-slate-200 bg-slate-100 px-2 py-1.5 text-xs font-bold text-slate-600">Classe</th>
                  {CLASSES.map((c, i) => <th key={i} scope="col" className="border border-slate-200 bg-slate-100 px-2 py-1.5 text-[13px] font-bold text-slate-600">[{c.from} ; {c.to}{c.isLast ? ']' : '['}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" className="border border-slate-200 bg-emerald-50 px-2 py-1.5 text-xs font-bold text-emerald-700">Centre</th>
                  {CLASSES.map((c, i) => <td key={i} className="border border-slate-200 bg-emerald-50 px-2 py-1.5 text-center font-mono tabular-nums font-bold text-emerald-900">{c.center}</td>)}
                </tr>
                <tr>
                  <th scope="row" className="border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-bold text-slate-600">Effectif</th>
                  {CLASSES.map((c, i) => <td key={i} className="border border-slate-200 px-2 py-1.5 text-center font-mono tabular-nums text-slate-700">{c.count}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
          <TapQuestion
            prompt="Pourquoi remplace-t-on chaque classe par son centre ?"
            options={[
              'Parce qu’on ignore les valeurs exactes : le centre est le meilleur représentant faute de mieux',
              'Parce que le centre est toujours la vraie moyenne de la classe',
              'Parce que c’est plus rapide que le calcul exact',
              'Parce que le centre est la valeur la plus fréquente',
            ]}
            correct={0} cols={1}
            explain="Le tableau regroupé ne contient plus les valeurs individuelles. On fait l’hypothèse que, dans chaque classe, les valeurs se répartissent à peu près symétriquement autour du centre — d’où une ESTIMATION, pas un calcul exact."
            explainWrong="Rien ne garantit que la moyenne d’une classe soit son centre : les 64 recharges de [40 ; 50[ pourraient toutes être vers 41 min. Le centre est une hypothèse raisonnable, pas une vérité."
            solved={q1} onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Calculer l’estimation',
      done: q2,
      content: (
        <NumericQuestion
          prompt="Une petite série regroupée : [0 ; 10[ → 5 individus, [10 ; 20[ → 15, [20 ; 30[ → 10. Quelle est la moyenne estimée ?"
          above={(revealed) => (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <p>Centres : 5, 15 et 25.</p>
              {revealed && <p className="text-xs mt-1">(5×5 + 15×15 + 10×25) ÷ 30 = (25 + 225 + 250) ÷ 30 = 500 ÷ 30 ≈ 16,67</p>}
            </div>
          )}
          expected={(n) => Math.abs(n - 16.67) < 0.02}
          display="16,67"
          explain="(5×5 + 15×15 + 10×25) ÷ 30 = 500 ÷ 30 ≈ 16,67. On pondère les CENTRES par les effectifs."
          explainFor={(n) => (n === 15
            ? '15 est la moyenne des trois centres (5, 15, 25) sans tenir compte des effectifs. Il faut pondérer : 500 ÷ 30 ≈ 16,67.'
            : n === 500
              ? '500 est la somme pondérée. Il reste à diviser par l’effectif total 30 : ≈ 16,67.'
              : 'Somme des (effectif × centre) divisée par l’effectif total : 500 ÷ 30 ≈ 16,67.')}
          solved={q2} onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Estimation contre valeur exacte',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center space-y-1">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">Moyenne estimée (par les centres)</p>
              <p className="font-mono text-2xl font-black text-emerald-900">{formatNumber(EST, 2)} min</p>
            </div>
            <div className="rounded-2xl border-2 border-slate-300 bg-slate-50 p-4 text-center space-y-1">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Moyenne exacte (200 valeurs brutes)</p>
              <p className="font-mono text-2xl font-black text-slate-900">{formatNumber(EXACT, 2)} min</p>
            </div>
          </div>
          <TapQuestion
            prompt="L’estimation et la valeur exacte coïncident presque parfaitement ici. Peut-on en conclure que l’estimation est toujours fiable ?"
            options={[
              'Non : elle est bonne quand les valeurs sont réparties assez symétriquement dans chaque classe, ce qui n’est pas garanti',
              'Oui : la méthode des centres donne toujours la valeur exacte',
              'Non : l’estimation est toujours trop grande',
              'Oui, à condition que les classes aient la même amplitude',
            ]}
            correct={0} cols={1}
            explain="Ici les écarts se compensent d’une classe à l’autre, d’où un accord excellent. Mais si, dans une classe large, tous les individus étaient tassés près d’une borne, le centre serait un mauvais représentant et l’estimation serait décalée. C’est le prix du regroupement : on gagne en lisibilité, on perd en exactitude."
            explainWrong="La méthode repose sur une hypothèse — la répartition régulière dans chaque classe — qui est souvent raisonnable, jamais garantie. L’écart peut aller dans les deux sens."
            solved={q3} onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Estimer la moyenne" moduleSubtitle="Ce que coûte le regroupement" estimatedTime="12 min"
      brief={{
        tag: 'Manipulation', title: 'Une moyenne approchée', tone: 'emerald',
        body: <p>Le tableau regroupé ne contient plus les 200 durées. On remplace chaque classe par son centre — et le résultat devient une estimation, qu’il faut savoir présenter comme telle.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Et la médiane ?</strong> Elle non plus n’est plus une valeur de la série. Module suivant :
          la trouver dans la classe où le cumul franchit 50 %.
        </KnowledgeSnapshot>
      )}
    />
  );
}
