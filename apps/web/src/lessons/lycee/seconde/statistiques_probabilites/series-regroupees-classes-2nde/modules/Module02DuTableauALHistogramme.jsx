import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Histogram, groupIntoClasses, formatNumber } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ClassWidthLab from '../components/ClassWidthLab';
import { RECHARGES, BORNES_10, SALAIRES } from '../data';

/**
 * Module 2 — DÉCOUVERTE : le tableau des effectifs par classe et
 * l'histogramme.
 *
 * Le point non négociable, et la raison d'être d'un histogramme (par
 * opposition à un diagramme en barres) : c'est l'AIRE qui représente
 * l'effectif. Tant que les amplitudes sont égales, hauteur et aire sont
 * proportionnelles et la distinction est invisible ; le contre-exemple des
 * salaires (dernière classe 4 fois plus large) la rend nécessaire.
 */
const CLASSES = groupIntoClasses(RECHARGES, BORNES_10);
const SAL_CLASSES = groupIntoClasses(
  // Série reconstituée à partir des effectifs annoncés : chaque individu est
  // placé au centre de sa classe, ce qui suffit pour dessiner l'histogramme.
  SALAIRES.effectifs.flatMap((n, i) => {
    const c = (SALAIRES.bornes[i] + SALAIRES.bornes[i + 1]) / 2;
    return Array.from({ length: n }, () => c);
  }),
  SALAIRES.bornes,
);

export default function Module02DuTableauALHistogramme() {
  const [amp, setAmp] = useState(10);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Le tableau des effectifs',
      subtitle: 'Amplitude 10 min : huit classes, et un tableau enfin lisible.',
      done: true,
      content: (
        <div className="space-y-3">
          <ClassWidthLab values={RECHARGES} width={amp} onWidthChange={setAmp}
            amplitudes={[5, 10, 20]} min={10} max={90} unit="min" showDots={false} showTable />
          <Feedback tone="info">
            Deux cents durées tiennent maintenant en huit lignes. Chaque classe s’écrit
            <strong> [a ; b[</strong> : la borne de gauche appartient à la classe, celle de droite non —
            sinon une valeur tombant pile sur 40 serait comptée deux fois. Seule la dernière classe
            est fermée à droite, pour ne pas perdre la valeur maximale.
          </Feedback>
        </div>
      ),
    },
    {
      num: 2,
      title: 'Lire l’histogramme',
      done: q2,
      content: (
        <div className="space-y-3">
          <Histogram classes={CLASSES} useDensity={false} unit="min" barLabel="effectif" />
          {/* Le tableau est devenu un dessin : avant de demander une lecture
              qui couvre deux tranches, on dit comment ce dessin se lit. */}
          <KnowledgeBrick
            id="lire-histogramme"
            variant="new"
            compact
            lead={<>Le tableau de l’étape précédente est maintenant un dessin. Une lecture s’y fait toujours dans le même ordre.</>}
          />
          <NumericQuestion
            prompt="Combien de recharges ont duré entre 40 et 60 minutes ?"
            expected={81} suffix="recharges"
            requires={['lire-histogramme', 'vocab-classe-amplitude', 'effectif']}
            explain="La classe [40 ; 50[ compte 64 recharges et la classe [50 ; 60[ en compte 17 : 64 + 17 = 81. On additionne les effectifs des classes concernées."
            explainFor={(n) => (n === 64
              ? '64 est l’effectif de la seule classe [40 ; 50[. La question couvre aussi [50 ; 60[, qui en compte 17 : 64 + 17 = 81.'
              : 'Il faut additionner les effectifs des deux classes couvertes : 64 + 17 = 81 recharges.')}
            solved={q2} onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce qu’un histogramme ne dit pas',
      done: q3,
      content: (
        <TapQuestion
          prompt="Sur cet histogramme, la classe [40 ; 50[ compte 64 recharges. Combien ont duré exactement 45 min ?"
          options={[
            'On ne peut pas le savoir : le regroupement a perdu cette information',
            '64, puisque c’est l’effectif de la classe',
            '6, soit 64 divisé par 10',
            'Environ 32, la moitié de la classe',
          ]}
          correct={0} cols={1}
          requires={['lire-histogramme', 'regroupement-classes', 'effectif']}
          explain="L’histogramme ne retient que « combien dans chaque tranche ». La répartition À L’INTÉRIEUR d’une classe est inconnue : les 64 recharges peuvent être groupées vers 41 min ou étalées jusqu’à 49."
          explainWrong="L’effectif 64 concerne toute la tranche [40 ; 50[, pas une valeur particulière. Rien dans le graphique ne permet de descendre en dessous de la classe."
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Le piège des amplitudes inégales',
      done: q4,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Salaires mensuels d’une PME (en k€). Attention : la dernière classe [4 ; 8[ est
            <strong> quatre fois plus large</strong> que les autres.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>{['Classe (k€)', '[1 ; 2[', '[2 ; 3[', '[3 ; 4[', '[4 ; 8]'].map((h) => (
                  <th key={h} scope="col" className="border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" className="border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">Effectif</th>
                  {SALAIRES.effectifs.map((n, i) => (
                    <td key={i} className="border border-slate-200 px-3 py-1.5 text-center font-mono font-bold text-slate-800">{n}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <Histogram classes={SAL_CLASSES} useDensity unit="k€" barLabel="effectif" />
          {/* Le tableau annonce 16 salariés, la barre est la plus basse du
              dessin : la contradiction est sous les yeux de l'élève. C'est
              l'instant où la règle de l'aire a un sens — et la question qui
              suit l'exige. */}
          <KnowledgeBrick
            id="histogramme-aire"
            variant="new"
            lead={<>Le tableau annonce 16 salariés dans [4 ; 8], et pourtant sa barre est la plus basse du dessin. Ce n’est pas une erreur de tracé.</>}
          />
          <TapQuestion
            prompt="Sur cet histogramme correct, la barre de [4 ; 8] est la plus BASSE alors que la classe compte 16 salariés. Pourquoi ?"
            options={[
              'Parce que c’est l’AIRE qui représente l’effectif : large et basse, elle vaut bien 16',
              'Parce que l’histogramme est mal construit',
              'Parce que 16 est le plus petit effectif du tableau',
              'Parce que les salaires élevés comptent moins',
            ]}
            correct={0} cols={1}
            requires={['histogramme-aire', 'vocab-classe-amplitude', 'effectif']}
            explain="Hauteur = effectif ÷ amplitude = 16 ÷ 4 = 4, contre 34 ÷ 1 = 34 pour [2 ; 3[. L’aire de la barre large vaut 4 × 4 = 16 : l’effectif est bien respecté. Dessiner une barre de hauteur 16 sur une largeur 4 laisserait croire à 64 salariés."
            explainWrong="L’histogramme est correct : sur des classes d’amplitudes inégales, la hauteur est une DENSITÉ (effectif par unité) et c’est l’aire qui porte l’effectif. 16 n’est d’ailleurs pas le plus petit effectif du tableau."
            solved={q4} onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Du tableau à l’histogramme" moduleSubtitle="C’est l’aire qui compte" estimatedTime="12 min"
      brief={{
        tag: 'Découverte', title: 'Huit lignes, un dessin', tone: 'violet',
        body: <p>Les classes donnent un tableau, le tableau donne un diagramme. Mais un histogramme n’est pas un diagramme en barres : ce qui représente l’effectif, c’est l’aire de la barre.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Une autre question.</strong> « Combien de recharges durent moins de 40 min ? » demande d’additionner
          plusieurs classes à chaque fois. Module suivant : un graphique qui répond à toutes ces questions d’un coup.
        </KnowledgeSnapshot>
      )}
    />
  );
}
