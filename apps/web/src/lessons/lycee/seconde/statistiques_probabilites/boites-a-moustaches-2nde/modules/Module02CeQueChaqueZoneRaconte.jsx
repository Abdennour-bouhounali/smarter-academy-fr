import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { BoxPlot, DotPlot, fiveNumberSummary, interquartileRange, range as rangeOf, formatNumber } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { BREST, EMBRUN } from '../data';

/**
 * Module 2 — DÉCOUVERTE : ce que représente chaque zone.
 *
 * LE piège de la lecture d'une boîte, et donc le cœur du module : une zone
 * LARGE ne contient pas plus d'individus, elle contient des individus plus
 * ÉTALÉS. Les quatre zones ont toutes ~25 % de l'effectif, par construction.
 *
 * On le fait constater sur Embrun, dont la moustache droite est très longue
 * (25 → 35 °C) alors qu'elle ne couvre que 25 % des jours, en la comparant au
 * nuage de points affiché juste au-dessus.
 */
const F = fiveNumberSummary(EMBRUN);

export default function Module02CeQueChaqueZoneRaconte() {
  const [pred, setPred] = useState(null);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Quatre zones, un quart chacune',
      subtitle: 'Embrun : la moustache de droite est très longue. Contient-elle plus de jours que les autres zones ?',
      done: q1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="la zone la plus large de la boîte contient-elle plus d’individus que les autres ?"
            options={[
              { id: 'oui', label: 'Oui, plus large = plus de monde' },
              { id: 'non', label: 'Non, autant — mais plus étalés' },
            ]}
            value={pred} onChange={setPred} disabled={q1}
          />
          <DotPlot values={EMBRUN} domain={{ min: 4, max: 37 }} unit="°C" label="Embrun — 30 relevés" showQuartiles showMedian />
          <BoxPlot series={[{ id: 'embrun', label: 'Embrun', values: EMBRUN, color: '#059669' }]}
            domain={{ min: 4, max: 37 }} unit="°C" />
          {/* L'élève vient de parier, et le nuage AU-DESSUS de la boîte porte
              déjà ses repères de quartiles : les pastilles à droite de Q3 se
              comptent à l'œil. On pose donc la règle ici, juste avant la
              question qui l'exige — pas dans son explication. */}
          {pred && (
            <KnowledgeBrick
              id="zones-quart"
              variant="new"
              lead={<>Compte les pastilles du nuage à droite de Q3, puis celles entre Q1 et la médiane : le nombre est le même, l’espace occupé non.</>}
            />
          )}
          {!pred && (
            <Feedback tone="info">Choisis d’abord ton pari ci-dessus : la boîte d’Embrun est juste en dessous du nuage qui l’a produite.</Feedback>
          )}
          <TapQuestion
            prompt={`La moustache droite d’Embrun va de Q3 = ${F.q3} °C au maximum ${F.max} °C, soit 10 °C de large. Combien de jours contient-elle ?`}
            options={[
              'Environ un quart des jours, comme chacune des trois autres zones',
              'La moitié des jours, puisqu’elle est la plus large',
              'Tous les jours au-dessus de la médiane',
              'On ne peut pas le savoir',
            ]}
            correct={0} cols={1}
            requires={['zones-quart', 'quartile', 'effectif']}
            explain="Par construction, les quartiles découpent l’effectif en quatre parts d’environ 25 %. La moustache droite couvre donc ~8 des 30 jours, mais ces 8 jours s’étalent sur 10 °C — d’où sa longueur. Compte les pastilles au-dessus de 25 °C sur le nuage : il y en a bien environ un quart."
            explainWrong="La largeur d’une zone mesure un ÉTALEMENT de valeurs, jamais un effectif. Les quatre zones contiennent toutes environ un quart des individus."
            solved={q1} onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Lire l’étendue et l’écart interquartile',
      done: q2,
      content: (
        <div className="space-y-3">
          {/* Les cinq nombres d'Embrun sont sous les yeux depuis l'étape 1 :
              nommer les deux longueurs qu'ils dessinent est la suite immédiate
              du geste, et la question qui suit ne peut pas s'y prendre autrement. */}
          <KnowledgeBrick
            id="lire-dispersion"
            variant="new"
            lead={<>Sur la boîte d’Embrun que tu viens de lire, deux longueurs se mesurent directement : celle de la figure entière, et celle du rectangle seul.</>}
          />
          <NumericQuestion
            prompt={`Sur la boîte d’Embrun : minimum ${F.min} °C, Q1 ${F.q1} °C, médiane ${F.median} °C, Q3 ${F.q3} °C, maximum ${F.max} °C. Quel est l’écart interquartile ?`}
            expected={interquartileRange(EMBRUN)} suffix="°C"
            explain={`Q3 − Q1 = ${F.q3} − ${F.q1} = ${interquartileRange(EMBRUN)} °C : c’est la LARGEUR DU RECTANGLE. L’étendue, elle, vaut ${F.max} − ${F.min} = ${rangeOf(EMBRUN)} °C et se lit d’une pointe de moustache à l’autre.`}
            explainFor={(n) => (n === rangeOf(EMBRUN)
              ? `${rangeOf(EMBRUN)} est l’ÉTENDUE (maximum − minimum), lue de bout en bout. L’écart interquartile est la largeur du rectangle seul : ${F.q3} − ${F.q1} = ${interquartileRange(EMBRUN)} °C.`
              : `L’écart interquartile est la largeur du rectangle : Q3 − Q1 = ${F.q3} − ${F.q1} = ${interquartileRange(EMBRUN)} °C.`)}
            requires={['lire-dispersion', 'quartile', 'etendue', 'dispersion']}
            solved={q2} onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Une boîte étroite, une boîte large',
      done: q3,
      content: (
        <div className="space-y-3">
          <BoxPlot series={[
            { id: 'brest', label: 'Brest', values: BREST, color: '#0284c7' },
            { id: 'embrun', label: 'Embrun', values: EMBRUN, color: '#059669' },
          ]} domain={{ min: 4, max: 37 }} unit="°C" />
          <TapQuestion
            prompt="Que dit la comparaison de ces deux rectangles ?"
            options={[
              'À Brest la moitié centrale des jours tient dans 4 °C, à Embrun il lui faut 12 °C : Brest est bien plus régulière',
              'Brest a moins de jours de relevé qu’Embrun',
              'Il fait plus chaud à Brest, puisque sa boîte est plus haute sur l’axe',
              'Les deux villes ont la même dispersion',
            ]}
            correct={0} cols={1}
            requires={['lire-dispersion', 'zones-quart', 'dispersion', 'effectif']}
            explain="Les deux séries comptent 30 relevés. La largeur du rectangle mesure la dispersion du cœur de la série : 4 °C contre 12 °C. À Brest on sait presque toujours à quoi s’attendre ; à Embrun beaucoup moins."
            explainWrong="Les deux villes ont exactement 30 relevés, et la position sur l’axe indique la température, pas l’effectif. C’est la LARGEUR des rectangles qui les distingue."
            solved={q3} onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Ce que chaque zone raconte" moduleSubtitle="Large ≠ nombreux" estimatedTime="12 min"
      brief={{
        tag: 'Découverte', title: 'Un quart dans chaque zone', tone: 'violet',
        body: <p>Les quartiles découpent l’effectif en quatre parts égales. Une zone large ne contient donc pas plus de monde : elle contient des valeurs plus dispersées. C’est le piège de lecture le plus fréquent.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Et à plusieurs ?</strong> Toute la force de cette figure est de pouvoir en empiler plusieurs.
          Module suivant : trois villes sur le même axe.
        </KnowledgeSnapshot>
      )}
    />
  );
}
