import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { mean, median, standardDeviation, interquartileRange, formatNumber } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SeriesLab from '../components/SeriesLab';
import { TRAJETS_A, ELEVE_LOINTAIN } from '../data';

/**
 * Module 5 — MANIPULATION : l'effet d'un ajout, d'un retrait, et d'une
 * translation de toute la série (linéarité de la moyenne).
 *
 * Deux idées distinctes, volontairement mises côte à côte :
 *  · une valeur EXTRÊME perturbe la moyenne et l'écart type, épargne la
 *    médiane et l'écart interquartile (robustesse) ;
 *  · une modification appliquée à TOUS translate la moyenne et la médiane
 *    sans toucher à la dispersion (linéarité).
 * Confondre les deux est l'erreur classique ; les traiter dans le même
 * module, avec le même instrument, permet de les opposer.
 */
const WITH_OUTLIER = [...TRAJETS_A, ELEVE_LOINTAIN];

export default function Module05AjouterOuRetirerUneValeur() {
  const [added, setAdded] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const base = { m: mean(TRAJETS_A), med: median(TRAJETS_A), sd: standardDeviation(TRAJETS_A), iq: interquartileRange(TRAJETS_A) };
  const out = { m: mean(WITH_OUTLIER), med: median(WITH_OUTLIER), sd: standardDeviation(WITH_OUTLIER), iq: interquartileRange(WITH_OUTLIER) };
  const shown = added ? WITH_OUTLIER : TRAJETS_A;

  const Row = ({ label, before, after, unit = 'min', digits = 2 }) => {
    const moved = Math.abs(after - before) > 0.05;
    return (
      <tr>
        <th scope="row" className="border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-bold text-slate-600">{label}</th>
        <td className="border border-slate-200 px-3 py-2 text-center font-mono tabular-nums text-slate-700">{formatNumber(before, digits)} {unit}</td>
        <td className={`border border-slate-200 px-3 py-2 text-center font-mono tabular-nums font-bold ${moved ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>
          {formatNumber(after, digits)} {unit}
        </td>
        <td className={`border border-slate-200 px-3 py-2 text-center text-xs font-bold ${moved ? 'text-rose-700' : 'text-emerald-700'}`}>
          {moved ? `${after > before ? '+' : '−'}${formatNumber(Math.abs(after - before), digits)}` : 'inchangé'}
        </td>
      </tr>
    );
  };

  const steps = [
    {
      num: 1,
      title: 'Un élève déménage à 120 min',
      subtitle: 'Ajoute-le à la série et regarde le tableau : lesquels des quatre indicateurs bougent ?',
      done: added,
      content: (kit) => (
        <div className="space-y-3">
          <SeriesLab values={shown} min={0} max={130} unit="min"
            label={added ? '2de A + 1 élève très éloigné' : '2de A'}
            show={{ mean: true, median: true }} highlightIndex={added ? shown.length - 1 : null} />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Ajouter ou retirer l’élève">
            {[{ id: false, label: 'Série d’origine (20 élèves)' }, { id: true, label: '+ l’élève à 120 min (21 élèves)' }].map((o) => (
              <button key={String(o.id)} type="button" aria-pressed={added === o.id}
                onClick={() => { setAdded(o.id); if (o.id) kit.react?.(true); }}
                className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  added === o.id ? 'bg-cyan-600 border-cyan-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-cyan-400'
                }`}>
                {o.label}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  {['Indicateur', '20 élèves', '21 élèves', 'Effet'].map((h) => (
                    <th key={h} scope="col" className="border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <Row label="Moyenne" before={base.m} after={out.m} />
                <Row label="Médiane" before={base.med} after={out.med} digits={1} />
                <Row label="Écart type" before={base.sd} after={out.sd} />
                <Row label="Écart interquartile" before={base.iq} after={out.iq} digits={1} />
              </tbody>
            </table>
          </div>
          {added ? (
            <Feedback tone="ok">
              La <strong>moyenne bondit de {formatNumber(out.m - base.m, 2)} min</strong> et l’écart type explose,
              alors que la <strong>médiane ne bouge pas</strong> et que l’écart interquartile reste stable.
              On dit que la médiane et l’écart interquartile sont <strong>robustes</strong> : un individu
              exceptionnel ne les déplace pas, parce qu’ils comptent des effectifs, pas des valeurs.
            </Feedback>
          ) : null}
          {/* Le tableau vient de montrer QUI bouge et QUI résiste à l'élève
              exceptionnel : on nomme cette propriété ici, avant qu'elle ne
              soit exigée par la question de l'étape 2. */}
          {added && (
            <KnowledgeBrick
              id="robustesse"
              variant="new"
              lead={<>Le tableau vient de le montrer : médiane et écart interquartile n’ont pas bougé, moyenne et écart type ont explosé. Cette résistance a un nom.</>}
            />
          )}
          {!added && (
            <Feedback tone="info">Ajoute l’élève à 120 min pour comparer les deux colonnes.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Tout le monde part 5 minutes plus tôt',
      done: q2,
      content: (
        <div className="space-y-3">
        <BatchChoiceQuestion
          intro={(
            <div className="space-y-2">
              <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-center">
                <MathText>{'$$\\overline{x + b} = \\bar{x} + b \\qquad \\overline{a x} = a\\,\\bar{x}$$'}</MathText>
              </div>
              <p className="text-sm font-semibold text-slate-700">On retire 5 min au trajet de <strong>chaque</strong> élève. Que devient chaque indicateur ?</p>
            </div>
          )}
          rows={[
            { id: 'l1', label: 'Moyenne (19,15 min)', options: ['14,15 min', '19,15 min', '3,83 min'], correct: 0, correction: 'Elle diminue de 5 : 19,15 − 5 = 14,15.' },
            { id: 'l2', label: 'Médiane (18 min)', options: ['13 min', '18 min', '3,6 min'], correct: 0, correction: 'Elle diminue de 5 aussi : 13 min.' },
            { id: 'l3', label: 'Écart type (8,97 min)', options: ['8,97 min', '3,97 min', '1,79 min'], correct: 0, correction: 'Inchangé : décaler toute la série ne change pas son étalement.' },
            { id: 'l4', label: 'Écart interquartile (13 min)', options: ['13 min', '8 min', '2,6 min'], correct: 0, correction: 'Inchangé, pour la même raison.' },
          ]}
          requires={['robustesse', 'mediane-stat', 'etendue']}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Les quatre.' : `${nCorrect} sur ${total}.`} Retirer la même durée à tout le monde
              <strong> translate</strong> la série : les indicateurs de POSITION suivent, ceux de
              <strong> DISPERSION ne bougent pas</strong>. Rien ne s’est resserré : tout s’est déplacé.
            </Feedback>
          )}
          solved={q2} onAnswered={() => setQ2(true)}
        />
        {/* Le tableau vient de séparer ce qui SUIT le décalage (position) de
            ce qui n'en bouge PAS (dispersion) : on nomme cette règle avant
            que le retrait de valeur, à l'étape 3, ne remette la moyenne au
            travail. */}
        {q2 && (
          <KnowledgeBrick
            id="linearite-moyenne"
            variant="new"
            lead={<>Retirer 5 min à tout le monde a décalé moyenne et médiane, sans toucher à l’étalement. C’est une règle générale.</>}
          />
        )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Retirer une valeur',
      done: q3,
      content: (
        <NumericQuestion
          prompt="Cinq élèves : 10, 12, 14, 16 et 48 min (moyenne 20 min). On retire l’élève à 48 min. Quelle est la nouvelle moyenne, en minutes ?"
          expected={13} suffix="min"
          requires={['robustesse', 'quotient']}
          explain="(10 + 12 + 14 + 16) ÷ 4 = 52 ÷ 4 = 13 min. Retirer la valeur extrême fait chuter la moyenne de 7 min ; la médiane, elle, passe seulement de 14 à 13."
          explainFor={(n) => (n === 20
            ? '20 était la moyenne AVEC l’élève à 48 min. Sans lui : 52 ÷ 4 = 13 min.'
            : n === 16
              ? 'Tu as divisé par 5 au lieu de 4 : après retrait il ne reste que 4 élèves. 52 ÷ 4 = 13.'
              : 'Nouvelle somme 52, nouvel effectif 4 : 52 ÷ 4 = 13 min.')}
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Robuste ou non ?',
      done: q4,
      content: (
        <TapQuestion
          prompt="Un institut publie « le revenu médian » plutôt que « le revenu moyen ». Pourquoi ce choix ?"
          options={[
            'Parce que la médiane n’est pas déformée par les très hauts revenus, rares mais énormes',
            'Parce que la médiane est toujours plus grande que la moyenne',
            'Parce que la médiane est plus facile à calculer',
            'Parce que la moyenne n’a pas de sens sur des revenus',
          ]}
          correct={0} cols={1}
          requires={['robustesse', 'mediane-stat', 'moyenne']}
          explain="Quelques revenus très élevés tirent fortement la moyenne vers le haut, sans rien changer à ce que gagne la personne « du milieu ». La médiane décrit mieux la situation typique — c’est la robustesse constatée à l’étape 1."
          explainWrong="La médiane n’est pas toujours plus grande (ici elle est plus PETITE que la moyenne), et son calcul demande de trier toute la série. Son avantage est sa robustesse aux valeurs extrêmes."
          solved={q4} onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Ajouter ou retirer une valeur" moduleSubtitle="Qui résiste, qui s’effondre" estimatedTime="12 min"
      brief={{
        tag: 'Manipulation', title: 'Perturber la série', tone: 'cyan',
        body: <p>Un cas exceptionnel, ou un changement qui touche tout le monde : ce ne sont pas les mêmes effets. Regarde lesquels des quatre indicateurs bougent dans chaque cas.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Dernière étape.</strong> Tu sais ce que mesure chaque indicateur et lequel résiste.
          Il reste à s’en servir pour comparer honnêtement deux séries.
        </KnowledgeSnapshot>
      )}
    />
  );
}
