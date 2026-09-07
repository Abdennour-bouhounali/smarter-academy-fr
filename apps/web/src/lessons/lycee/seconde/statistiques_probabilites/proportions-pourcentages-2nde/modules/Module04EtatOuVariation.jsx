import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { formatPercent, formatNumber, evolutionRate, percentagePointDifference } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import StateVsChange from '../components/StateVsChange';

/**
 * Module 4 — MANIPULATION : séparer l'état de la variation.
 *
 * L'instrument (StateVsChange) montre DEUX années côte à côte et affiche
 * simultanément les deux lectures de la même paire de nombres :
 *   · la différence des proportions, en POINTS ;
 *   · l'évolution relative, en POUR CENT.
 * Le seul fait de les voir cohabiter — et diverger — installe la distinction
 * que ni l'un ni l'autre ne peut installer seul.
 *
 * C'est aussi ici que se règle la confusion « point de pourcentage » /
 * « pourcentage », que les médias entretiennent en permanence.
 */
export default function Module04EtatOuVariation() {
  const [before, setBefore] = useState(0.2);
  const [after, setAfter] = useState(0.25);
  const [seen, setSeen] = useState(() => new Set(['0.2|0.25']));
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = seen.size >= 3;

  const change = (b, a, react) => {
    setBefore(b); setAfter(a);
    const next = new Set(seen); next.add(`${b}|${a}`); setSeen(next);
    if (!done1 && next.size >= 3) react?.(true);
  };

  const points = percentagePointDifference(before, after);
  const rate = evolutionRate(before, after);

  const steps = [
    {
      num: 1,
      title: 'Deux lectures de la même paire',
      subtitle: 'Règle la proportion de boursiers avant et après. Regarde les deux chiffres du bas. Trois réglages.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <StateVsChange before={before} after={after} onChange={(b, a) => change(b, a, kit.react)} />
          {done1 ? (
            <Feedback tone="ok">
              Les deux nombres du bas décrivent la <strong>même</strong> paire, et ils ne sont presque jamais égaux.
              La <strong>différence en points</strong> compare deux états ; le <strong>taux d’évolution</strong> rapporte
              le changement à la valeur de <strong>départ</strong>. Passer de 20 % à 25 %, c’est {formatPercent(0.05, 0).replace(' %', '')} points
              de plus, et <strong>+25 %</strong> de boursiers.
              {' '}<span className="text-slate-500">Continue à régler les deux années : les deux cases divergent presque toujours.</span>
            </Feedback>
          ) : (
            <Feedback tone="info">
              Réglages essayés : {seen.size} sur 3. Ici : {formatNumber(points * 100, 1)} points, et {formatPercent(rate, 1)} d’évolution.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Points ou pour cent ?',
      done: q2,
      content: (
        <TapQuestion
          prompt="Le taux de chômage passe de 8 % à 6 %. Un journal titre « le chômage baisse de 25 % ». A-t-il raison ?"
          options={[
            'Oui : (6 − 8)/8 = −0,25, soit une baisse de 25 % du nombre de chômeurs',
            'Non : il baisse de 2 %',
            'Non, la baisse est de 2 points, donc de 2 %',
            'C’est faux dans tous les cas',
          ]}
          correct={0} cols={1}
          explain="Les deux formulations sont justes mais différentes : la baisse est de 2 POINTS (8 − 6) et de 25 % en évolution relative ((6 − 8)/8 = −0,25). Le journal a choisi la seconde lecture, et il a le droit — à condition de dire « de 25 % », pas « de 25 points »."
          explainWrong="« Baisser de 2 points » et « baisser de 25 % » décrivent le même passage de 8 % à 6 %. La confusion vient de ce que les deux s’écrivent avec le signe %. Ici (6 − 8)/8 = −0,25."
          solved={q2} onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Trier les phrases',
      done: q3,
      content: (
        <BatchChoiceQuestion
          intro={<p className="text-sm font-semibold text-slate-700">Chaque phrase décrit-elle un <strong>état</strong> (une proportion) ou une <strong>variation</strong> (une évolution) ?</p>}
          rows={[
            { id: 'p1', label: '« 62 % des élèves sont demi-pensionnaires »', options: ['État', 'Variation'], correct: 0, correction: 'Une part du total à un instant donné.' },
            { id: 'p2', label: '« Les inscriptions ont augmenté de 8 % »', options: ['État', 'Variation'], correct: 1, correction: 'Comparaison à la valeur de départ.' },
            { id: 'p3', label: '« Le loyer a baissé de 5 % cette année »', options: ['État', 'Variation'], correct: 1, correction: 'Un changement rapporté au loyer précédent.' },
            { id: 'p4', label: '« 3 candidats sur 4 ont été reçus »', options: ['État', 'Variation'], correct: 0, correction: '3/4 = 75 % : une part des candidats.' },
            { id: 'p5', label: '« La part des boursiers est passée de 18 % à 21 % »', options: ['État', 'Variation'], correct: 1, correction: 'Deux états comparés : la phrase décrit le passage, donc une variation (+3 points, soit +16,7 %).' },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Les cinq.' : `${nCorrect} sur ${total}.`} Le test qui marche à tous les coups :
              {' '}<strong>« de quoi ce pourcentage est-il une part ? »</strong> Si la réponse est un tout (les élèves, les candidats),
              c’est un état. S’il n’y a pas de tout mais une valeur d’avant, c’est une variation.
            </Feedback>
          )}
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Le calcul d’une évolution',
      done: q4,
      content: (
        <NumericQuestion
          prompt="Un club passe de 240 à 288 adhérents. De quel pourcentage a-t-il augmenté ?"
          above={(revealed) => (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
              <MathText>{'$$t = \\frac{V_{\\text{finale}} - V_{\\text{initiale}}}{V_{\\text{initiale}}}$$'}</MathText>
              {revealed && <p className="text-xs text-emerald-700 mt-1">(288 − 240) ÷ 240 = 48 ÷ 240 = 0,2</p>}
            </div>
          )}
          expected={20} suffix="%"
          explain="(288 − 240)/240 = 48/240 = 0,20, soit +20 %. On divise par la valeur de DÉPART, jamais par celle d’arrivée."
          explainFor={(n) => (n === 48
            ? '48 est l’augmentation en adhérents, pas en pourcentage. Il reste à la rapporter au départ : 48 ÷ 240 = 0,20.'
            : Math.abs(n - 16.67) < 0.5
              ? 'Tu as divisé par 288, la valeur d’arrivée. Un taux d’évolution se rapporte toujours à la valeur INITIALE : 48 ÷ 240 = 20 %.'
              : 'Différence divisée par la valeur initiale : (288 − 240) ÷ 240 = 0,20 = 20 %.')}
          solved={q4} onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="État ou variation ?" moduleSubtitle="Deux « % » qui ne parlent pas de la même chose" estimatedTime="11 min"
      brief={{
        tag: 'Manipulation', title: 'Points ≠ pour cent', tone: 'emerald',
        body: <p>Le signe % sert à deux choses différentes : décrire une part d’un tout, ou décrire un changement. Confondre les deux fait dire n’importe quoi à un chiffre juste.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Il manque un outil.</strong> Une évolution se calcule, mais s’applique mal : « +20 % » n’est pas
          un nombre qu’on multiplie. Module suivant : le nombre par lequel on multiplie vraiment.
        </KnowledgeSnapshot>
      )}
    />
  );
}
