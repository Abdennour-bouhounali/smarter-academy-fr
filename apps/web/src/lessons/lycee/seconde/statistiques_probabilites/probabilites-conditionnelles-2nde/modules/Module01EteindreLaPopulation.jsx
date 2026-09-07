import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { formatPercent } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import UniverseLab from '../components/UniverseLab';
import { probabilityUnder } from '../data';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : éteindre une partie
 * de la population (components/UniverseLab.jsx).
 *
 * Le phénomène central est visuel avant d'être numérique : en imposant
 * « sachant qu'il est interne », 600 pastilles s'éteignent et la
 * probabilité d'être en club passe de 56,3 % à 75 %. L'élève ne lit pas
 * une formule, il voit le TOUT rétrécir.
 *
 * L'étape ne se valide qu'après avoir essayé au moins trois univers : le
 * sens ne vient pas d'une valeur, mais de la comparaison entre plusieurs.
 * Ce que ce module ne fait PAS : introduire la notation P_A(B) (M2),
 * comparer les deux sens du conditionnement (M3), relier aux fréquences
 * conditionnelles (M4).
 */
const P_TOUS = probabilityUnder('aucune', 'club');
const P_INTERNE = probabilityUnder('interne', 'club');
const P_EXTERNE = probabilityUnder('externe', 'club');

export default function Module01EteindreLaPopulation() {
  const [condition, setCondition] = useState('aucune');
  const [eventId, setEventId] = useState('club');
  const [seen, setSeen] = useState(() => new Set(['aucune']));
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);

  const done1 = seen.size >= 3;
  const done2 = q2;

  const changeCondition = (id, react) => {
    setCondition(id);
    const next = new Set(seen); next.add(id); setSeen(next);
    if (!done1 && next.size >= 3) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Impose une condition, regarde le tout rétrécir',
      subtitle: 'Les pastilles éteintes ne comptent plus. Essaie au moins trois conditions.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="56 % des 800 élèves sont en club. Chez les seuls internes, penses-tu que cette proportion soit la même ?"
            options={[
              { id: 'meme', label: 'La même : 56 %' },
              { id: 'autre', label: 'Elle peut être très différente' },
            ]}
            value={pred} onChange={setPred} disabled={done1}
          />
          <UniverseLab
            conditionId={condition}
            eventId={eventId}
            onConditionChange={(id) => changeCondition(id, kit.react)}
            onEventChange={setEventId}
          />
          {done1 ? (
            <Feedback tone="ok">
              {pred === 'autre' ? 'Ta prédiction tenait' : 'Surprise'} : être en club vaut{' '}
              <strong>{formatPercent(P_TOUS.value, 1)}</strong> sur toute la population,{' '}
              <strong>{formatPercent(P_INTERNE.value, 0)}</strong> chez les internes et{' '}
              <strong>{formatPercent(P_EXTERNE.value, 0)}</strong> chez les externes. Imposer une condition ne
              consiste pas à ajouter une information au calcul : on <strong>jette une partie de la
              population</strong> et on recalcule dans ce qui reste. Le tout a changé.
            </Feedback>
          ) : null}
          {/* Le geste vient de faire sortir 600 élèves de l'univers et de
              déplacer le quotient sans toucher au numérateur : c'est
              l'instant où la sous-population peut être nommée, avant la
              question de l'étape 2 qui l'exige. */}
          {done1 && (
            <KnowledgeBrick
              id="univers-restreint"
              variant="new"
              lead={<>Tu viens d’écarter une partie des 800 élèves et de voir la probabilité changer sans que le nombre d’élèves en club retenus ne bouge. Ce que tu as remplacé porte un nom.</>}
            />
          )}
          {!done1 && (
            <Feedback tone="info">Conditions essayées : {seen.size} sur 3.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Qu’est-ce qui a changé ?',
      done: done2,
      content: (
        <TapQuestion
          prompt={`En passant de « tous les élèves » à « sachant qu’il est interne », la probabilité d’être en club passe de ${formatPercent(P_TOUS.value, 1)} à ${formatPercent(P_INTERNE.value, 0)}. Pourquoi ?`}
          options={[
            'Le dénominateur est passé de 800 à 200 élèves',
            'Le nombre d’élèves en club a augmenté',
            'Les internes aiment davantage le sport',
            'Le calcul a été fait avec plus de précision',
          ]}
          correct={0} cols={1}
          requires={['univers-restreint', 'probabilite', 'denominateur', 'effectif']}
          explain="Le numérateur reste 150 dans les deux cas : ce sont bien les mêmes élèves. Ce qui change, c’est l’univers — 800 élèves d’abord, 200 ensuite. 150/800 ≈ 18,8 % n’est d’ailleurs pas la même question : c’est la probabilité d’être À LA FOIS interne et en club."
          explainWrong="Regarde les deux quotients affichés : 450/800 puis 150/200. C’est le dénominateur — l’univers dans lequel on calcule — qui a été remplacé."
          solved={done2} onAnswered={() => setQ2(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="Éteins une partie de la population" moduleSubtitle="Conditionner, c’est changer d’univers" estimatedTime="14 min"
      brief={{
        tag: 'Déclencheur', title: '800 élèves, puis 200', tone: 'indigo',
        body: <p>Un lycée de 800 élèves. On en tire un au hasard. Puis on ajoute une condition — et la population sur laquelle on raisonne n’est plus la même.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Ce que tu viens de voir.</strong> Une condition remplace la population entière par une
          <strong> sous-population</strong> : c’est elle, le nouveau dénominateur. Module suivant : comment
          l’écrire — la notation « sachant que ».
        </KnowledgeSnapshot>
      )}
    />
  );
}
