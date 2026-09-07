import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import IntervalLab from '../components/IntervalLab';
import VariationTable from '../components/VariationTable';
import { TRAIL, TRAIL_RANGE, BOSSE, maxOn, parseDec, formatDec } from '../components/variationsUtils';

/**
 * Module 4 — MANIPULATION : maximum, minimum — sur un intervalle.
 * Step 1  régler [a ; b] = [5 ; 10] : le maximum de h sur cet intervalle (560, en 8,5)
 *         n'est pas celui sur [0 ; 10] (620, en 3).
 * Step 2  le maximum est une VALEUR ; l'endroit où il est atteint est une abscisse.
 * Step 3  le minimum au bord.  Step 4  un maximum atteint deux fois (g sur [−4 ; 4]).
 */
export default function Module04MaximumMinimum() {
  const [ab, setAb] = useState({ a: 0, b: 10 });
  const [reached, setReached] = useState(false);
  const [qa, setQa] = useState(false); const [qb, setQb] = useState(false);
  const [q3, setQ3] = useState(false); const [q4, setQ4] = useState(false);
  const move = (n, react) => { setAb(n); if (!reached && n.a === 5 && n.b === 10) { setReached(true); react?.(true); } };

  const steps = [
    {
      num: 1, title: 'Règle l’intervalle sur [5 ; 10]', subtitle: 'Le bandeau donne le maximum et le minimum de h sur [a ; b]. Amène a à 5 (b reste à 10) et observe.', done: reached,
      content: (kit) => (
        <div className="space-y-3">
          <IntervalLab f={TRAIL} range={TRAIL_RANGE} unit={30} unitY={0.35} a={ab.a} b={ab.b} step={0.5} onChange={(n) => move(n, kit.react)} disabled={reached} xUnit=" km" yUnit=" m" />
          {reached ? (
            <Feedback tone="ok">Sur [0 ; 10] le maximum de h était 620 m (à 3 km). Sur <strong>[5 ; 10]</strong>, le sommet de 3 km n’est plus dans la course : le maximum est <strong>560 m, atteint en 8,5 km</strong>, et le minimum 380 m en 6 km. Un extremum se définit <strong>sur un intervalle</strong>.</Feedback>
          ) : (
            <Feedback tone="info">Intervalle actuel : [{formatDec(ab.a)} ; {formatDec(ab.b)}]. Maximum actuel : {formatDec(maxOn(TRAIL, ab.a, ab.b).value)} m.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2, title: 'Une valeur, et un endroit', subtitle: 'Sur [0 ; 10] :', done: qa && qb,
      content: (
        <div className="space-y-4">
          <NumericQuestion prompt="Quel est le maximum de h sur [0 ; 10] (en m) ?" expected={620} parse={parseDec} display={formatDec(620)}
            explain={<span>Le maximum est la plus grande valeur <strong>prise</strong> par h : <strong>620</strong> m. Il est atteint pour x = 3 — mais 3 n’est pas le maximum, c’est l’endroit.</span>}
            explainFor={(n) => (n === 3 ? '3 km est l’ENDROIT où le maximum est atteint. Le maximum lui-même est une valeur de h : 620 m.' : n === 560 ? '560 m est le sommet de 8,5 km, plus bas que celui de 3 km (620 m).' : 'Le maximum est la plus haute altitude atteinte : 620 m, à 3 km.')}
            solved={qa} onAnswered={() => setQa(true)} />
          {qa && (
            <NumericQuestion prompt="En quelle abscisse (en km) ce maximum est-il atteint ?" expected={3} parse={parseDec} display={formatDec(3)}
              explain={<span>h(3) = 620 : le maximum est atteint en x = 3. On écrit : « h admet sur [0 ; 10] un maximum égal à 620, atteint en 3 ».</span>}
              explainFor={(n) => (n === 620 ? '620 est la valeur du maximum ; la question demande l’abscisse : 3.' : 'Le sommet le plus haut est à 3 km.')}
              solved={qb} onAnswered={() => setQb(true)} />
          )}
        </div>
      ),
    },
    {
      num: 3, title: 'Le minimum au bord', done: q3,
      content: (
        <TapQuestion prompt="Le minimum de h sur [0 ; 10] est…"
          options={['300, atteint en 0 : au bord de l’intervalle', '380, atteint en 6 : dans la vallée', '0, car h ne prend pas de valeur négative', 'il n’y en a pas'] }
          correct={0} cols={1}
          explain="Le tableau de variations le montre : la plus petite valeur de la ligne du bas est 300, posée sous x = 0. Un minimum n’est pas forcément un creux : il faut comparer toutes les valeurs, bornes comprises."
          explainWrong="Compare toutes les valeurs du tableau : 300 (en 0), 620, 380 (en 6), 560, 420. La plus petite est 300, au départ. Et « pas de valeur négative » n’a rien à voir : le minimum est une valeur prise par h."
          solved={q3} onAnswered={() => setQ3(true)} />
      ),
    },
    {
      num: 4, title: 'Atteint deux fois', done: q4,
      content: (
        <BatchChoiceQuestion intro={<div className="space-y-2"><p className="text-sm text-slate-700">g sur [−4 ; 4] :</p><VariationTable f={BOSSE} /></div>}
          rows={[
            { id: 'r1', label: 'Maximum de g sur [−4 ; 4]', options: ['4, atteint en −2 et en 4', '4, atteint en −2 seulement', '−2'], correct: 0, correction: 'deux valeurs 4 dans le tableau' },
            { id: 'r2', label: 'Minimum de g sur [−4 ; 4]', options: ['−4, atteint en −4 et en 2', '−4, atteint en 2 seulement', '2'], correct: 0, correction: 'deux valeurs −4' },
            { id: 'r3', label: 'Maximum de g sur [−1 ; 3]', options: ['on ne peut pas le lire : g(−1) et g(3) ne sont pas dans le tableau', '4', '−4'], correct: 0, correction: 'il manque des valeurs' },
            { id: 'r4', label: 'Minimum de g sur [2 ; 4]', options: ['−4, atteint en 2', '4', '−2'], correct: 0, correction: 'g croissante sur [2 ; 4]' },
          ]}
          feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Un extremum peut être atteint plusieurs fois, se trouver au bord, et dépend de l’intervalle. Sur un intervalle dont les bornes ne sont pas dans le tableau, on ne peut pas conclure sans les valeurs.</Feedback>}
          solved={q4} onAnswered={() => setQ4(true)} />
      ),
    },
  ];

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Maximum, minimum" moduleSubtitle="Une valeur atteinte, un endroit, un intervalle" estimatedTime="12 min"
      brief={{ tag: 'Manipulation', title: 'Le plus haut, le plus bas — sur quel intervalle ?', tone: 'emerald', body: <p>Le maximum d’une fonction sur un intervalle est la plus grande valeur qu’elle y prend. Change l’intervalle : le maximum change. Et distingue la valeur de l’endroit où elle est atteinte.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4}>Module suivant : comparer deux images sans les calculer — avec le seul tableau.</KnowledgeSnapshot>} />
  );
}
