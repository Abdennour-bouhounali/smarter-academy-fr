import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SeriesLab from '../components/SeriesLab';
import { TRAJETS_A } from '../data';

/**
 * Module 2 — DÉCOUVERTE : calculer la moyenne et la médiane, et savoir
 * laquelle répond à quelle question.
 *
 * Le piège travaillé est celui de la médiane d'un effectif PAIR (on prend la
 * demi-somme des deux valeurs centrales, et le résultat peut ne pas figurer
 * dans la série) et celui de la moyenne pondérée (on ne fait pas la moyenne
 * des valeurs distinctes, on tient compte des effectifs).
 */
export default function Module02MoyenneEtMediane() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'La moyenne : partager équitablement',
      done: q1,
      content: (
        <NumericQuestion
          prompt="Cinq élèves mettent 10, 12, 15, 20 et 43 minutes. Quelle est la moyenne, en minutes ?"
          above={(revealed) => (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-center">
              <MathText>{'$$\\bar{x} = \\frac{x_1 + x_2 + \\dots + x_n}{n}$$'}</MathText>
              {revealed && <p className="text-xs text-violet-700 mt-1">(10 + 12 + 15 + 20 + 43) ÷ 5 = 100 ÷ 5 = 20</p>}
            </div>
          )}
          expected={20} suffix="min"
          explain="100 ÷ 5 = 20 min. Remarque : quatre élèves sur cinq sont EN DESSOUS de cette moyenne — le 43 la tire vers le haut."
          explainFor={(n) => (n === 15
            ? '15 est la valeur du milieu (la médiane), pas la moyenne. La moyenne additionne toutes les durées : 100 ÷ 5 = 20.'
            : n === 100
              ? '100 est la somme. Il reste à la partager entre les 5 élèves : 100 ÷ 5 = 20 min.'
              : 'Somme ÷ effectif : (10 + 12 + 15 + 20 + 43) ÷ 5 = 20 min.')}
          solved={q1} onAnswered={() => setQ1(true)}
        />
      ),
    },
    {
      num: 2,
      title: 'La moyenne avec des effectifs',
      done: q2,
      content: (
        <NumericQuestion
          prompt="Un sondage : 3 élèves mettent 10 min, 5 élèves mettent 20 min, 2 élèves mettent 45 min. Quelle est la moyenne, en minutes ?"
          above={(revealed) => (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-center">
              <MathText>{'$$\\bar{x} = \\frac{n_1 x_1 + n_2 x_2 + \\dots}{n_1 + n_2 + \\dots}$$'}</MathText>
              {revealed && <p className="text-xs text-violet-700 mt-1">(3×10 + 5×20 + 2×45) ÷ 10 = 220 ÷ 10 = 22</p>}
            </div>
          )}
          expected={22} suffix="min"
          explain="(30 + 100 + 90) ÷ 10 = 220 ÷ 10 = 22 min. Chaque valeur compte autant de fois qu’il y a d’élèves."
          explainFor={(n) => (n === 25
            ? '25 est la moyenne des trois valeurs 10, 20 et 45 — comme s’il y avait un élève par valeur. Il faut PONDÉRER par les effectifs : 220 ÷ 10 = 22.'
            : n === 220
              ? '220 est la somme totale des durées. Il reste à diviser par l’effectif total, 10 : 22 min.'
              : 'Somme pondérée ÷ effectif total : (3×10 + 5×20 + 2×45) ÷ 10 = 22 min.')}
          solved={q2} onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'La médiane : couper l’effectif en deux',
      done: q3,
      content: (
        <div className="space-y-3">
          <SeriesLab values={TRAJETS_A} min={0} max={60} unit="min"
            label="2de A — 20 élèves, donc effectif pair" show={{ median: true }} />
          <NumericQuestion
            prompt="La 2de A compte 20 élèves. Les 10ᵉ et 11ᵉ valeurs de la série rangée sont 18 et 18. Quelle est la médiane, en minutes ?"
            above={(revealed) => (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                <p>Effectif <strong>impair</strong> → la valeur du milieu. Effectif <strong>pair</strong> → la demi-somme des deux valeurs centrales.</p>
                {revealed && <p className="text-xs mt-1">(18 + 18) ÷ 2 = 18 min</p>}
              </div>
            )}
            expected={18} suffix="min"
            explain="(18 + 18) ÷ 2 = 18 min. Au moins la moitié des élèves mettent 18 min ou moins, au moins la moitié mettent 18 min ou plus."
            explainFor={() => 'Avec un effectif pair, on prend la demi-somme des deux valeurs centrales : (18 + 18) ÷ 2 = 18.'}
            solved={q3} onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Laquelle choisir ?',
      done: q4,
      content: (
        <TapQuestion
          prompt="Dans une entreprise, presque tous les salaires tournent autour de 2 000 €, sauf trois dirigeants payés 40 000 €. Quel indicateur décrit le mieux « le salaire habituel » ?"
          options={[
            'La médiane, car elle n’est pas tirée par les très hauts salaires',
            'La moyenne, car elle utilise toutes les valeurs',
            'Les deux donnent la même chose',
            'Ni l’une ni l’autre',
          ]}
          correct={0} cols={1}
          explain="La moyenne serait gonflée par trois valeurs extrêmes et ne décrirait le salaire de presque personne. La médiane répond à « la moitié des salariés gagnent moins que… », ce qui est bien la question posée. La moyenne reste utile pour d’autres questions — par exemple la masse salariale totale."
          explainWrong="Utiliser toutes les valeurs est justement le problème ici : trois salaires énormes déplacent la moyenne loin de ce que gagne la grande majorité. La médiane compte les personnes, pas les euros."
          solved={q4} onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Moyenne et médiane" moduleSubtitle="Deux réponses à « où se situe la série ? »" estimatedTime="12 min"
      brief={{
        tag: 'Découverte', title: 'Partager, ou compter', tone: 'violet',
        body: <p>La moyenne partage le total entre tous ; la médiane coupe l’effectif en deux. Deux calculs différents, deux questions différentes — et un choix à faire selon la situation.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>On peut couper plus finement.</strong> Si couper en deux renseigne, couper en quatre en dira davantage :
          c’est le module suivant.
        </KnowledgeSnapshot>
      )}
    />
  );
}
