import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import OrderingGame from '../../../../../common/components/OrderingGame';
import { parseDec, formatDec } from '../components/durationUtils';

/**
 * Module 4 — manipulation : convertir pour comparer.
 *
 * Conversions composées (h+min → min ; s → min+s), puis l'atelier de
 * rangement : quatre durées en écritures mélangées qu'on ne peut ordonner
 * qu'en les convertissant dans la MÊME unité. OrderingGame est en mode
 * formatif : la première vérification révèle, jamais de blocage.
 */
// value = durée en minutes (vérification interne), text = écriture affichée.
const RANK_ITEMS = [
  { id: 'quatrevingtdix', value: 90, text: '90 min' },
  { id: 'unheurevingt', value: 80, text: '1 h 20 min' },
  { id: 'cinqmilleq', value: 95, text: '5 700 s' },
  { id: 'uneheuredemie', value: 75, text: '1 h et quart' },
];

const EGALITE_Q = {
  q: 'Course de fond : Sami a couru 1 h 05 min, Nora 65 min. Qui a couru le plus longtemps ?',
  options: ['Sami', 'Nora', 'Ils ont couru exactement autant'],
  correct: 2,
  explain: '1 h 05 min = 60 + 5 = 65 min : deux ÉCRITURES différentes de la même durée. Toujours convertir avant de trancher.',
};

export default function Module04ConvertirComparer() {
  const [conv1Done, setConv1Done] = useState(false);
  const [conv2aDone, setConv2aDone] = useState(false);
  const [conv2bDone, setConv2bDone] = useState(false);
  const [rankDone, setRankDone] = useState(false);
  const [egaliteDone, setEgaliteDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Convertir et comparer"
      moduleSubtitle="90 min ou 1 h 20 min : qui dure le plus ? Convertis, puis ordonne."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 04',
        title: 'Quatre coureurs, quatre chronos… écrits n’importe comment.',
        body: <p>Impossible de comparer des durées écrites dans des unités différentes — sauf à tout ramener dans la même.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Conversions composées',
          done: conv1Done && conv2aDone && conv2bDone,
          content: (
            <div className="space-y-6">
              <NumericQuestion
                prompt="2 h 15 min = ? minutes (convertis les heures, puis ajoute les minutes)"
                suffix="min"
                expected={135}
                parse={parseDec}
                display={formatDec(135)}
                explain={<>2 h = 120 min, puis 120 + 15 = <strong>135 min</strong>.</>}
                explainFor={(n) =>
                  n === 215
                    ? '« 215 », c’est recopier 2 et 15 côte à côte. Il faut convertir : 2 h = 2 × 60 = 120 min, puis + 15.'
                    : 'Convertis d’abord les heures (2 × 60), puis ajoute les 15 minutes.'
                }
                requires={['unites-temps', 'base-60']}
                solved={conv1Done}
                onAnswered={() => setConv1Done(true)}
              />
              {conv1Done && (
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <p className="text-sm font-semibold text-slate-700">200 secondes = ? min ? s (deux réponses)</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <NumericQuestion
                      prompt="Minutes entières :"
                      suffix="min"
                      expected={3}
                      parse={parseDec}
                      display={formatDec(3)}
                      explain={<>200 ÷ 60 → 3 paquets entiers de 60 s : <strong>3 min</strong>.</>}
                      explainFor={() => 'Combien de paquets ENTIERS de 60 secondes dans 200 s ?'}
                      requires={['unites-temps', 'base-60']}
                      solved={conv2aDone}
                      onAnswered={() => setConv2aDone(true)}
                    />
                    <NumericQuestion
                      prompt="Secondes restantes :"
                      suffix="s"
                      expected={20}
                      parse={parseDec}
                      display={formatDec(20)}
                      explain={<>200 − 180 = <strong>20 s</strong> : 200 s = 3 min 20 s.</>}
                      explainFor={() => '3 min = 180 s. Que reste-t-il de 200 s ?'}
                      requires={['unites-temps', 'base-60']}
                      solved={conv2bDone}
                      onAnswered={() => setConv2bDone(true)}
                    />
                  </div>
                </div>
              )}
              {/* Les deux sens de la conversion viennent d'être exécutés :
                  la méthode est posée AVANT l'atelier de rangement, qui ne
                  peut se faire qu'en convertissant. */}
              {conv1Done && conv2aDone && conv2bDone && (
                <KnowledgeBrick
                  id="convertir-durees"
                  variant="new"
                  lead="Ces deux calculs, dans un sens puis dans l’autre, sont toute la conversion des durées."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Range les chronos',
          done: rankDone,
          content: (kit) => (
            <OrderingGame
              items={RANK_ITEMS}
              direction="asc"
              instruction="Range les quatre durées, de la plus courte à la plus longue. Astuce : convertis tout en minutes avant de placer."
              solved={rankDone}
              formative
              onError={() => kit.react(false)}
              onSolved={() => setRankDone(true)}
              format={(v) => `${v} min`}
            />
          ),
        },
        {
          num: 3,
          title: 'Le duel des écritures',
          done: egaliteDone,
          content: (
            <div className="space-y-5">
              <TapQuestion
                prompt={EGALITE_Q.q}
                options={EGALITE_Q.options}
                correct={EGALITE_Q.correct}
                cols={3}
                explain={EGALITE_Q.explain}
                requires={['unites-temps', 'base-60', 'convertir-durees']}
                solved={egaliteDone}
                onAnswered={() => setEgaliteDone(true)}
              />
              {/* Le rangement puis le duel viennent de montrer qu'un nombre
                  seul ne tranche rien : la règle de comparaison se pose ici. */}
              {egaliteDone && (
                <KnowledgeBrick
                  id="comparer-durees"
                  variant="new"
                  lead="Deux écritures, une seule durée : voilà ce qu’il faut faire avant toute comparaison."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> Il reste la question la plus utile de toutes : combien de
          temps s'écoule entre deux instants ? Et surtout, comment le calculer sans se tromper.
        </KnowledgeSnapshot>
      }
    />
  );
}
