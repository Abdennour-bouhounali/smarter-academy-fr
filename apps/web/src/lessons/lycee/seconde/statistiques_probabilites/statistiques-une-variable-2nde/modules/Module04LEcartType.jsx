import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { mean, standardDeviation, formatNumber } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SeriesLab from '../components/SeriesLab';
import { TRAJETS_A, TRAJETS_B } from '../data';

/**
 * Module 4 — DÉCOUVERTE : l'écart type.
 *
 * Deux séries de MÊME moyenne (19,15 et 19,10) et d'allures opposées sont
 * posées l'une au-dessus de l'autre, sur le même axe : c'est la seule façon
 * de faire sentir qu'un indicateur de position ne suffit pas. L'élève voit
 * ensuite la bande « moyenne ± écart type » se rétrécir quand il resserre la
 * série lui-même.
 *
 * PÉRIMÈTRE : l'écart type est présenté comme la distance TYPIQUE à la
 * moyenne, calculée par la machine (le programme de 2nde ne demande pas de
 * le calculer à la main sur de grandes séries). La formule est donnée, et
 * une petite série la fait vérifier une fois.
 */
export default function Module04LEcartType() {
  const [values, setValues] = useState(TRAJETS_A);
  const [pred, setPred] = useState(null);
  const [tightened, setTightened] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const sd = standardDeviation(values);
  const sdA = standardDeviation(TRAJETS_A);
  const done1 = pred !== null;
  const done2 = tightened;
  const done3 = q3;
  const done4 = q4;

  const change = (next, react) => {
    setValues(next);
    const s = standardDeviation(next);
    if (!tightened && s < sdA - 2.5) { setTightened(true); react?.(true); }
  };

  const steps = [
    {
      num: 1,
      title: 'Même moyenne, deux classes',
      subtitle: 'La 2de A (bleu) et la 2de B (violet) ont la même moyenne, à 0,05 min près. Les vois-tu se ressembler ?',
      done: done1,
      content: (
        <div className="space-y-3">
          <SeriesLab values={TRAJETS_A} min={0} max={60} unit="min"
            label="2de A — moyenne 19,15 min" show={{ mean: true }}
            compareValues={TRAJETS_B} compareLabel="2de B — moyenne 19,10 min" />
          <PredictionChips
            prompt="dans quelle classe est-il le plus facile de prévoir le temps de trajet d’un élève pris au hasard ?"
            options={[
              { id: 'A', label: 'En 2de A' },
              { id: 'B', label: 'En 2de B' },
              { id: 'same', label: 'Pareil : même moyenne' },
            ]}
            value={pred} onChange={setPred}
          />
          {done1 && (
            <Feedback tone="ok">
              En <strong>2de B</strong> : tous les élèves sont entre 14 et 25 min, donc annoncer « environ 19 min »
              se trompe rarement de beaucoup. En 2de A, la même annonce peut se tromper de 14 min (l’élève à 5 min)
              ou de 21 min (celui à 40). <strong>La moyenne ne dit rien de ce risque</strong> — il faut un second nombre.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Resserre la série',
      subtitle: 'La bande verte est « moyenne ± écart type ». Rapproche les pastilles du repère orange et regarde-la maigrir.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <SeriesLab values={values} onChange={(n) => change(n, kit.react)} min={0} max={60} unit="min"
            label="2de A — bande moyenne ± écart type" show={{ mean: true, sd: true }} />
          {done2 ? (
            <Feedback tone="ok">
              La bande s’est rétrécie avec la série : l’écart type est passé de {formatNumber(sdA, 2)} min à
              {' '}<strong>{formatNumber(sd, 2)} min</strong>. C’est une <strong>distance</strong>, exprimée dans la même
              unité que les données : il mesure de combien on s’écarte de la moyenne, <em>en général</em>.
              Plus il est petit, plus la moyenne est un bon résumé.
              {' '}<span className="text-slate-500">Continue à déplacer les pastilles.</span>
            </Feedback>
          ) : (
            <Feedback tone="info">
              Écart type actuel : {formatNumber(sd, 2)} min (au départ {formatNumber(sdA, 2)}).
              Rapproche les pastilles de la moyenne pour le faire descendre sous {formatNumber(sdA - 2.5, 1)}.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le calcul, une fois',
      done: done3,
      content: (
        <NumericQuestion
          prompt="Petite série : 2, 4, 4, 4, 5, 5, 7, 9. Sa moyenne vaut 5. Quel est son écart type ?"
          above={(revealed) => (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center space-y-1">
              <MathText>{'$$\\sigma = \\sqrt{\\frac{\\sum (x_i - \\bar{x})^2}{n}}$$'}</MathText>
              {revealed && (
                <p className="text-xs text-emerald-700">
                  Écarts à 5 : −3, −1, −1, −1, 0, 0, 2, 4 → carrés 9, 1, 1, 1, 0, 0, 4, 16 → somme 32 ; 32 ÷ 8 = 4 ; √4 = 2
                </p>
              )}
            </div>
          )}
          expected={2}
          explain="La moyenne des carrés des écarts vaut 4 (c’est la variance) ; l’écart type en est la racine carrée : 2. On élève au carré pour que les écarts négatifs ne compensent pas les positifs, puis on prend la racine pour revenir à l’unité de départ."
          explainFor={(n) => (n === 4
            ? '4 est la VARIANCE (la moyenne des carrés des écarts). L’écart type est sa racine carrée : √4 = 2.'
            : n === 0
              ? 'La somme des écarts (sans les carrer) vaut toujours 0 : c’est justement pour cela qu’on élève au carré avant de moyenner.'
              : 'Somme des carrés 32, divisée par n = 8 donne 4, puis √4 = 2.')}
          solved={done3} onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Interpréter',
      done: done4,
      content: (
        <TapQuestion
          prompt="Deux capteurs mesurent la même température de 20 °C. Le capteur X a un écart type de 0,2 °C, le capteur Y de 3 °C. Lequel choisir ?"
          options={[
            'X : ses mesures s’écartent peu de la moyenne, il est plus fiable',
            'Y : un grand écart type signifie une plus grande précision',
            'Peu importe : les deux ont la même moyenne',
            'On ne peut pas conclure sans connaître la médiane',
          ]}
          correct={0} cols={1}
          explain="Un écart type faible signifie des mesures resserrées autour de la moyenne, donc reproductibles. Ici l’écart type se lit comme une incertitude : ±0,2 °C contre ±3 °C."
          explainWrong="L’écart type mesure la DISPERSION : plus il est grand, plus les mesures sont éparpillées. Un capteur fiable a un petit écart type."
          solved={done4} onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="L’écart type" moduleSubtitle="À quelle distance de la moyenne vit-on ?" estimatedTime="12 min"
      brief={{
        tag: 'Découverte', title: 'Le second nombre', tone: 'emerald',
        body: <p>Deux classes de même moyenne peuvent être totalement différentes. L’écart type dit à quelle distance de la moyenne se situent les données — en minutes, comme elles.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Une question de stabilité.</strong> Tu as quatre indicateurs. Lesquels résistent à un cas
          exceptionnel, lesquels s’effondrent ? Module suivant : on perturbe la série exprès.
        </KnowledgeSnapshot>
      )}
    />
  );
}
