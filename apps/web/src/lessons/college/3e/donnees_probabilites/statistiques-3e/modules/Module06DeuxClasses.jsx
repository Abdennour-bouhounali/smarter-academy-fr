import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DotPlot from '../components/DotPlot';
import { mean, median, range, compareSeries } from '../components/statUtils';
import { CLASSE_A, CLASSE_B, AXE } from '../components/trajetData';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 6 — ATELIER : « Deux classes ».
 *
 * Activity: comparer deux séries que la moyenne ne distingue pas du tout.
 * Mathematical objective: montrer qu'un seul indicateur ne suffit jamais.
 *   Deux classes de même moyenne ET de même médiane peuvent décrire des
 *   réalités opposées — c'est l'étendue qui les sépare.
 * Student action: lire les deux axes superposés, comparer les indicateurs.
 * Controlled variable: aucune manipulation continue ; la comparaison est
 *   l'activité.
 * Mathematical state: deux séries fixes ; `compareSeries` fournit le verdict,
 *   donc la correction ne peut pas diverger des données.
 * Visual consequence: les deux DotPlot empilés rendent la différence de
 *   dispersion immédiatement visible, alors que les repères de moyenne et de
 *   médiane tombent exactement au même endroit.
 * Expected observation: « mêmes chiffres, séries complètement différentes ».
 * Misconception targeted: « la moyenne résume la série » ; et l'idée qu'une
 *   comparaison se tranche avec un seul nombre.
 * Feedback: les trois indicateurs des deux classes sont affichés côte à côte.
 * Formalization: la règle « deux indicateurs identiques ne font pas deux séries
 *   identiques » est posée par une <KnowledgeBrick> à l'étape 3, après que les
 *   étapes 1 et 2 l'ont fait constater sur les deux axes empilés.
 * Scaffolding: constat guidé → calcul de l'étendue → interprétation.
 * Transfer: le module 7 démonte une affirmation trompeuse.
 */

const CMP = compareSeries(CLASSE_A, CLASSE_B);
const RA = range(CLASSE_A);
const RB = range(CLASSE_B);

function ClassRow({ label, values, tone }) {
  return (
    <div className="space-y-1">
      <p className={`text-sm font-bold ${tone}`}>{label}</p>
      <DotPlot
        values={values}
        min={AXE.min}
        max={AXE.max}
        step={AXE.step}
        mode="display"
        showMean
        showMedian
        showRange
        ariaLabel={`Série de la ${label}`}
      />
    </div>
  );
}

export default function Module06DeuxClasses() {
  const [sameDone, setSameDone] = useState(false);
  const [rangeDone, setRangeDone] = useState(false);
  const [interpDone, setInterpDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Deux classes"
      moduleSubtitle="Même moyenne, deux réalités très différentes."
      estimatedTime="10 min"
      brief={{
        tag: '👥 Mission 06',
        title: 'Deux classes, un même chiffre',
        tone: 'indigo',
        body: (
          <p>
            Deux classes annoncent la même moyenne de trajet. Le principal en conclut
            qu’elles sont dans la même situation. A-t-il raison ?
          </p>
        ),
      }}
      intro={
        <div className="space-y-4">
          <ClassRow label="Classe A" values={CLASSE_A} tone="text-sky-700" />
          <ClassRow label="Classe B" values={CLASSE_B} tone="text-rose-700" />
        </div>
      }
      steps={[
        {
          num: 1,
          title: 'Que partagent ces deux classes ?',
          done: sameDone,
          content: (
            <TapQuestion
              prompt="Compare les deux séries. Qu’ont-elles exactement en commun ?"
              requires={['moyenne', 'mediane', 'etendue', 'indicateur']}
              options={[
                'La même moyenne et la même médiane',
                'La même moyenne seulement',
                'La même étendue',
                'Rien du tout',
              ]}
              correct={0}
              cols={1}
              explain={`Les deux classes ont pour moyenne ${formatDec(mean(CLASSE_A))} min et pour médiane ${formatDec(median(CLASSE_A))} min. Deux indicateurs identiques — et pourtant les deux nuages de points n'ont rien à voir.`}
              explainWrong="Regarde les repères bleu et vert sur les deux axes : ils tombent exactement au même endroit."
              solved={sameDone}
              onAnswered={() => setSameDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Ce qui les sépare',
          done: rangeDone,
          content: (kit) => (
            <NumericQuestion
              prompt="Quelle est l’étendue de la classe B ?"
              requires={['etendue']}
              expected={RB}
              parse={parseDec}
              display={formatDec(RB)}
              suffix="min"
              explain={`Classe B : de ${formatDec(Math.min(...CLASSE_B))} à ${formatDec(Math.max(...CLASSE_B))} min, soit une étendue de ${formatDec(RB)} min — contre ${formatDec(RA)} min pour la classe A. Cinq fois plus dispersée, à moyenne identique.`}
              explainFor={(n) => {
                if (n === RA) return 'C’est l’étendue de la classe A. La question porte sur la classe B, bien plus étalée.';
                if (n === 15) return 'Tu as donné la moyenne. L’étendue est l’écart entre le maximum et le minimum.';
                return null;
              }}
              solved={rangeDone}
              onAnswered={(ok) => { setRangeDone(true); kit.react(ok); }}
            />
          ),
        },
        {
          num: 3,
          title: 'Que répondre au principal ?',
          done: interpDone,
          content: (
            <div className="space-y-3">
            <TapQuestion
              prompt="Le principal veut savoir dans quelle classe organiser un ramassage scolaire. Que lui conseiller ?"
              requires={['etendue', 'moyenne', 'valeur-extreme', 'choisir-indicateur']}
              options={[
                'La classe B : certains élèves viennent de bien plus loin',
                'La classe A : sa moyenne est identique',
                'Aucune : les deux moyennes sont égales, donc les besoins aussi',
                'Les deux, indifféremment',
              ]}
              correct={0}
              cols={1}
              explain="La moyenne masque le problème : en classe B, des élèves mettent 25 min quand d’autres en mettent 5. Ce sont ces cas extrêmes qui justifient un ramassage — et seule l’étendue les révèle. Un chiffre unique ne décrit jamais une situation à lui seul."
              explainWrong="Les moyennes sont bien égales, et c’est précisément le piège : elles ne disent rien de la dispersion des élèves."
              solved={interpDone}
              onAnswered={() => setInterpDone(true)}
            />
            {interpDone && (
              <KnowledgeBrick
                id="comparer-series"
                variant="new"
                lead="Ce que ces deux classes viennent de démontrer vaut pour toute comparaison de séries."
              />
            )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          Tu sais lire plusieurs indicateurs ensemble. Le dernier atelier retourne la moyenne —
          au lieu de la calculer, on la <strong>vise</strong> — et démonte une phrase de journal.
        </KnowledgeSnapshot>
      }
    />
  );
}
