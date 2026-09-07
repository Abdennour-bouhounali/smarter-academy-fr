import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Histogram, groupIntoClasses, medianClass, interpolatedMedian, median, formatNumber } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { RECHARGES, BORNES_10 } from '../data';

/**
 * Module 5 — MANIPULATION : classe médiane et médiane estimée.
 *
 * Deux niveaux d'exigence, dans l'ordre du programme :
 *  · identifier la CLASSE médiane (celle où le cumul franchit 50 %) —
 *    attendu partout ;
 *  · estimer la médiane par interpolation linéaire dans cette classe, ce que
 *    fait exactement la lecture du polygone à la hauteur 50 %.
 * La comparaison à la médiane exacte (40,54 min) mesure la qualité de
 * l'estimation (40,31 min) : l'écart est réel et il est dit.
 */
const CLASSES = groupIntoClasses(RECHARGES, BORNES_10);
const MC = medianClass(CLASSES);
const INTERP = interpolatedMedian(CLASSES);
const EXACT = median(RECHARGES);

export default function Module05LaClasseMediane() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Où le cumul franchit 50 %',
      done: q1,
      content: (
        <div className="space-y-3">
          <Histogram classes={CLASSES} useDensity={false} showCumulative readAt={0.5} unit="min" barLabel="effectif" />
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th scope="col" className="border border-slate-200 bg-slate-100 px-2 py-1.5 text-xs font-bold text-slate-600">Classe</th>
                  {CLASSES.slice(0, 5).map((c, i) => <th key={i} scope="col" className="border border-slate-200 bg-slate-100 px-2 py-1.5 text-[13px] font-bold text-slate-600">[{c.from} ; {c.to}[</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" className="border border-slate-200 bg-cyan-50 px-2 py-1.5 text-xs font-bold text-cyan-700">Fréq. cumulée</th>
                  {CLASSES.slice(0, 5).map((c, i) => (
                    <td key={i} className={`border border-slate-200 px-2 py-1.5 text-center font-mono tabular-nums font-bold ${
                      c.from === MC.from ? 'bg-cyan-200 text-cyan-950' : 'bg-cyan-50 text-cyan-900'}`}>
                      {formatNumber(c.cumulativeFrequency * 100, 1)} %
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          {/* La ligne surlignée du tableau vient de montrer, sous les yeux,
              la classe où le cumul franchit 50 % : le nom vient l'instant
              d'après, avant la question qui l'exige. */}
          <KnowledgeBrick
            id="classe-mediane"
            variant="new"
            lead={<>La case surlignée du tableau est celle où le cumul, encore trop faible juste avant, franchit 50 %.</>}
          />
          <TapQuestion
            prompt="Quelle est la classe médiane de cette série ?"
            options={[
              '[40 ; 50[ : c’est la première dont la fréquence cumulée atteint 50 %',
              '[30 ; 40[ : sa fréquence cumulée est 49 %, la plus proche de 50 %',
              '[40 ; 50[ : c’est la classe la plus peuplée',
              '[10 ; 90] : la médiane est au milieu de tout',
            ]}
            correct={0} cols={1}
            requires={['classe-mediane', 'frequences-cumulees', 'mediane-stat']}
            explain="La classe médiane est la PREMIÈRE dont la fréquence cumulée atteint ou dépasse 50 %. À 40 min le cumul vaut 49 % : la moitié n’est pas encore atteinte, elle l’est dans [40 ; 50[ (81 %). Que cette classe soit aussi la plus peuplée est ici une coïncidence."
            explainWrong="49 % est en dessous de 50 % : la médiane n’est pas encore atteinte à 40 min. C’est donc la classe SUIVANTE, [40 ; 50[, qui contient la médiane."
            solved={q1} onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Estimer la médiane dans sa classe',
      done: q2,
      content: (
        <div className="space-y-3">
          {/* La classe médiane est acquise : reste à dire COMMENT avancer à
              l'intérieur, avant que la question ne le demande. */}
          <KnowledgeBrick
            id="mediane-interpolee"
            variant="new"
            lead={<>Tu sais déjà dans quelle classe chercher : il reste à avancer à l’intérieur, proportionnellement à ce qu’il manque pour atteindre la moitié.</>}
          />
          <NumericQuestion
          prompt="Dans la classe [40 ; 50[, le cumul passe de 98 à 162 individus. La médiane correspond au 100ᵉ individu. Estime-la par interpolation, en minutes (arrondie au dixième)."
          above={(revealed) => (
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-900 space-y-1">
              <p>Il faut avancer de 100 − 98 = 2 individus dans une classe qui en contient 64, et large de 10 min.</p>
              {revealed && <p className="text-xs">40 + (2 ÷ 64) × 10 ≈ 40,3 min</p>}
            </div>
          )}
          expected={(n) => Math.abs(n - 40.3) < 0.15}
          display="40,3 min"
          requires={['mediane-interpolee', 'classe-mediane']}
          explain="40 + (2/64) × 10 ≈ 40,31 min. C’est exactement ce que donne la lecture du polygone cumulé à la hauteur 50 %."
          explainFor={(n) => (n === 45
            ? '45 est le CENTRE de la classe médiane. L’interpolation tient compte de la position exacte du 100ᵉ individu dans la classe : ici tout près du début, d’où ≈ 40,3 min.'
            : n === 40
              ? '40 est la borne inférieure de la classe. Il faut y ajouter la fraction parcourue : (2/64) × 10 ≈ 0,31 min.'
              : 'On part de 40 et on avance de (100 − 98)/64 de la largeur : 40 + (2/64) × 10 ≈ 40,3 min.')}
          solved={q2} onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Estimation contre valeur exacte',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-4 text-center space-y-1">
              <p className="text-xs font-bold uppercase tracking-wide text-cyan-600">Médiane estimée (interpolation)</p>
              <p className="font-mono text-2xl font-black text-cyan-900">{formatNumber(INTERP, 2)} min</p>
            </div>
            <div className="rounded-2xl border-2 border-slate-300 bg-slate-50 p-4 text-center space-y-1">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Médiane exacte (200 valeurs)</p>
              <p className="font-mono text-2xl font-black text-slate-900">{formatNumber(EXACT, 2)} min</p>
            </div>
          </div>
          <TapQuestion
            prompt={`L’estimation donne ${formatNumber(INTERP, 2)} min, la valeur exacte ${formatNumber(EXACT, 2)} min. Que faut-il en dire ?`}
            options={[
              'L’estimation est très proche, mais reste une estimation : sans les données brutes on ne peut pas faire mieux',
              'L’estimation est fausse et doit être rejetée',
              'Les deux valeurs sont identiques',
              'L’estimation est toujours inférieure à la valeur exacte',
            ]}
            correct={0} cols={1}
            requires={['mediane-interpolee', 'mediane-stat']}
            explain="L’écart vaut environ 0,2 min sur des durées de 40 min : négligeable en pratique. L’interpolation suppose que les 64 individus de la classe sont régulièrement répartis, ce qui n’est qu’approximativement vrai — d’où un petit décalage, dans un sens ou dans l’autre selon les séries."
            explainWrong="Une estimation proche n’est pas une erreur : c’est le meilleur résultat accessible à partir d’un tableau regroupé. Elle n’est pas non plus systématiquement inférieure."
            solved={q3} onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="La classe médiane" moduleSubtitle="Trouver la médiane sans connaître les valeurs" estimatedTime="12 min"
      brief={{
        tag: 'Manipulation', title: 'Là où le cumul franchit 50 %', tone: 'cyan',
        body: <p>La médiane n’est plus une valeur de la série : on identifie d’abord la classe qui la contient, puis on l’estime à l’intérieur de cette classe.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Dernière étape.</strong> Tu sais regrouper, dessiner, cumuler et estimer. Il reste à lire
          des distributions que tu n’as pas construites toi-même — et à repérer leurs pièges.
        </KnowledgeSnapshot>
      )}
    />
  );
}
