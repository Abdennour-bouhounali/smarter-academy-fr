import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { BoxPlot, median, interquartileRange, range as rangeOf, formatNumber } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { VILLES, BREST, TOULOUSE, EMBRUN } from '../data';

/**
 * Module 3 — DÉCOUVERTE : comparer sur un AXE COMMUN.
 *
 * Deux idées, dans cet ordre :
 *  1. l'axe commun est la condition de la comparaison — deux boîtes dessinées
 *     à des échelles différentes ne se comparent pas ; l'élève l'éprouve en
 *     basculant entre « axe commun » et « chaque boîte à son échelle » ;
 *  2. le CONTRE-EXEMPLE d'Embrun : médiane la plus basse ET maximum le plus
 *     haut. On ne peut donc pas conclure d'une médiane à toutes les valeurs.
 */
export default function Module03TroisVillesUnAxe() {
  const [commonAxis, setCommonAxis] = useState(true);
  const [seenBoth, setSeenBoth] = useState(() => new Set([true]));
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = seenBoth.size >= 2;
  const toggle = (v, react) => {
    setCommonAxis(v);
    const next = new Set(seenBoth); next.add(v); setSeenBoth(next);
    if (!done1 && next.size >= 2) react?.(true);
  };

  // Sans axe commun, chaque boîte est dessinée sur SA propre étendue : c'est
  // exactement ce qui rend la comparaison trompeuse.
  const series = VILLES.map((v) => ({ id: v.id, label: v.label, values: v.values, color: v.color }));

  const steps = [
    {
      num: 1,
      title: 'L’axe commun, condition de la comparaison',
      subtitle: 'Bascule entre les deux modes et regarde ce que devient la comparaison.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Mode d’affichage">
            {[{ v: true, l: 'Axe commun (correct)' }, { v: false, l: 'Chaque boîte à son échelle' }].map((o) => (
              <button key={String(o.v)} type="button" aria-pressed={commonAxis === o.v}
                onClick={() => toggle(o.v, kit.react)}
                className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  commonAxis === o.v ? 'bg-sky-600 border-sky-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-sky-400'
                }`}>
                {o.l}
              </button>
            ))}
          </div>
          {commonAxis ? (
            <BoxPlot series={series} domain={{ min: 4, max: 37 }} unit="°C" />
          ) : (
            <div className="space-y-1">
              {series.map((s) => (
                <BoxPlot key={s.id} series={[s]} unit="°C" />
              ))}
            </div>
          )}
          {done1 ? (
            <Feedback tone="ok">
              À échelles séparées, les trois boîtes se ressemblent : chacune occupe toute la largeur disponible,
              et l’on croirait les trois villes comparables. Sur un <strong>axe commun</strong>, tout change :
              Brest est un rectangle étroit, Embrun s’étale d’un bout à l’autre.
              <strong> Comparer des boîtes exige un axe commun</strong> — sinon la figure ment.
              {' '}<span className="text-slate-500">Rebascule autant que tu veux.</span>
            </Feedback>
          ) : (
            <Feedback tone="info">Essaie les deux modes d’affichage.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Lire les trois villes',
      done: q2,
      content: (
        <BatchChoiceQuestion
          intro={(
            <div className="space-y-2">
              <BoxPlot series={series} domain={{ min: 4, max: 37 }} unit="°C" />
              <p className="text-sm font-semibold text-slate-700">Réponds à partir des boîtes.</p>
            </div>
          )}
          rows={[
            { id: 'r1', label: 'Médiane la plus haute', options: ['Toulouse', 'Brest', 'Embrun'], correct: 0, correction: `Toulouse : ${median(TOULOUSE)} °C, contre ${median(BREST)} à Brest et ${median(EMBRUN)} à Embrun.` },
            { id: 'r2', label: 'Ville la plus régulière', options: ['Brest', 'Toulouse', 'Embrun'], correct: 0, correction: `Brest : écart interquartile ${interquartileRange(BREST)} °C, le plus faible.` },
            { id: 'r3', label: 'Étendue la plus grande', options: ['Embrun', 'Toulouse', 'Brest'], correct: 0, correction: `Embrun : ${rangeOf(EMBRUN)} °C d’une pointe de moustache à l’autre.` },
            { id: 'r4', label: 'Ville du jour le plus chaud du mois', options: ['Embrun', 'Toulouse', 'Brest'], correct: 0, correction: `Embrun : maximum ${Math.max(...EMBRUN)} °C, alors que sa médiane est la plus BASSE.` },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Les quatre.' : `${nCorrect} sur ${total}.`} La dernière ligne est la plus instructive :
              Embrun a la <strong>médiane la plus basse</strong> et pourtant le <strong>maximum le plus haut</strong>.
              Une médiane ne dit rien des valeurs extrêmes.
            </Feedback>
          )}
          solved={q2} onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Ce qu’une médiane ne dit pas',
      done: q3,
      content: (
        <TapQuestion
          prompt="Un touriste conclut : « Embrun est la ville la plus froide, je n’y aurai jamais chaud ». Que lui répondre ?"
          options={[
            `Sa médiane est bien la plus basse, mais son maximum (${Math.max(...EMBRUN)} °C) est le plus haut des trois : il y aura des jours très chauds`,
            'Il a raison : la médiane la plus basse signifie toutes les températures les plus basses',
            'Il a tort : Embrun a en réalité la médiane la plus haute',
            'On ne peut rien dire sans connaître les moyennes',
          ]}
          correct={0} cols={1}
          explain={`La médiane résume la POSITION centrale, pas l’ensemble des valeurs. À Embrun la moitié des jours sont sous ${median(EMBRUN)} °C, mais l’étendue de ${rangeOf(EMBRUN)} °C laisse place à des jours à ${Math.max(...EMBRUN)} °C — plus chauds que partout ailleurs.`}
          explainWrong="La boîte d’Embrun est la plus basse au centre, mais sa moustache droite dépasse celles des deux autres villes. Médiane basse et maximum élevé sont parfaitement compatibles."
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="Trois villes, un axe" moduleSubtitle="Comparer d’un coup d’œil" estimatedTime="13 min"
      brief={{
        tag: 'Découverte', title: 'Empiler les boîtes', tone: 'sky',
        body: <p>La boîte à moustaches sert surtout à COMPARER. Encore faut-il que toutes les boîtes soient dessinées sur le même axe — et se garder de conclure trop vite d’une seule médiane.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Reste à décider.</strong> Selon la question posée, ce n’est pas le même nombre qui répond.
          Module suivant : choisir l’indicateur adapté.
        </KnowledgeSnapshot>
      )}
    />
  );
}
