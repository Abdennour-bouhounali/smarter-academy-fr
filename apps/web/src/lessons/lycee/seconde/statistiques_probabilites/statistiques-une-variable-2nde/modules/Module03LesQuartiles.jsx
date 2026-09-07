import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SeriesLab from '../components/SeriesLab';
import { TRAJETS_A } from '../data';

/**
 * Module 3 — DÉCOUVERTE : les quartiles et l'écart interquartile.
 *
 * CONVENTION DU PROGRAMME (statsUtils, testée) : rang de Q1 = ⌈n/4⌉, rang de
 * Q3 = ⌈3n/4⌉, et Q1/Q3 sont des VALEURS DE LA SÉRIE — pas des interpolations.
 * Les tableurs utilisent une autre convention ; l'élève doit connaître
 * celle-ci, et le module le dit explicitement.
 *
 * Le sens visé : Q1 et Q3 encadrent la « moitié centrale » de l'effectif, et
 * leur écart mesure la dispersion du CŒUR de la série — donc sans être
 * perturbé par un extrême, contrairement à l'étendue.
 */
export default function Module03LesQuartiles() {
  const [q1s, setQ1s] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Couper en quatre paquets d’effectifs',
      subtitle: 'La bande violette contient la moitié centrale des élèves.',
      done: q1s,
      content: (
        <div className="space-y-3">
          <SeriesLab values={TRAJETS_A} min={0} max={60} unit="min"
            label="2de A — Q1, médiane et Q3" show={{ median: true, quartiles: true }} />
          <TapQuestion
            prompt="Que signifie Q1 = 12 min pour la 2de A ?"
            options={[
              'Au moins un quart des élèves mettent 12 min ou moins',
              'Exactement un quart des élèves mettent exactement 12 min',
              'Le quart des élèves les plus lents mettent 12 min',
              '12 est le quart de la durée maximale',
            ]}
            correct={0} cols={1}
            explain="Q1 est la plus petite valeur telle qu’au moins 25 % de l’effectif lui est inférieur ou égal. Ici, le rang de Q1 est ⌈20/4⌉ = 5 : la 5ᵉ valeur de la série rangée, soit 12 min."
            explainWrong="Un quartile est un SEUIL de position dans l’effectif, pas un effectif ni une fraction de la valeur maximale. Q1 = 12 : au moins un quart des élèves sont à 12 min ou moins."
            solved={q1s} onAnswered={() => setQ1s(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Trouver le rang',
      done: q2,
      content: (
        <NumericQuestion
          prompt="Une série compte 30 valeurs rangées. Quel est le RANG de Q3 ?"
          above={(revealed) => (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-center">
              <MathText>{'$$\\text{rang}(Q_1) = \\left\\lceil \\frac{n}{4} \\right\\rceil \\qquad \\text{rang}(Q_3) = \\left\\lceil \\frac{3n}{4} \\right\\rceil$$'}</MathText>
              {revealed && <p className="text-xs text-sky-700 mt-1">3 × 30 ÷ 4 = 22,5 → on arrondit à l’entier supérieur : 23</p>}
            </div>
          )}
          expected={23} suffix="ᵉ valeur"
          explain="3n/4 = 22,5 ; on prend l’entier immédiatement supérieur, soit le rang 23. Q3 est la 23ᵉ valeur de la série rangée — une vraie valeur de la série."
          explainFor={(n) => (n === 22
            ? 'On arrondit à l’entier SUPÉRIEUR, jamais à l’inférieur : 22,5 donne le rang 23.'
            : n === 22.5
              ? 'Un rang est forcément entier : 22,5 s’arrondit au supérieur, donc 23.'
              : 'rang(Q3) = ⌈3 × 30 ÷ 4⌉ = ⌈22,5⌉ = 23.')}
          solved={q2} onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'L’écart interquartile',
      done: q3,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt="Pour la 2de A : Q1 = 12 min et Q3 = 25 min. Quel est l’écart interquartile, en minutes ?"
            expected={13} suffix="min"
            explain="Q3 − Q1 = 25 − 12 = 13 min. C’est l’amplitude dans laquelle vit la MOITIÉ CENTRALE des élèves."
            explainFor={() => 'L’écart interquartile est la différence Q3 − Q1 = 25 − 12 = 13 min.'}
            solved={q3} onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="ok">
              L’étendue de la 2de A vaut 35 min (40 − 5) : elle dépend entièrement des deux élèves
              les plus extrêmes. L’écart interquartile, lui, vaut <strong>13 min</strong> et ne dépend
              que du cœur de la série — un élève qui déménage très loin ne le change pas.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Étendue ou écart interquartile ?',
      done: q4,
      content: (
        <BatchChoiceQuestion
          intro={<p className="text-sm font-semibold text-slate-700">Pour chaque affirmation, vrai ou faux ?</p>}
          rows={[
            { id: 'r1', label: 'L’étendue ne dépend que de deux valeurs', options: ['Vrai', 'Faux'], correct: 0, correction: 'La plus grande et la plus petite valeur de la série, uniquement.' },
            { id: 'r2', label: 'L’écart interquartile est sensible à une valeur extrême', options: ['Vrai', 'Faux'], correct: 1, correction: 'Non : Q1 et Q3 restent au cœur de la série.' },
            { id: 'r3', label: 'Q3 − Q1 contient environ la moitié de l’effectif', options: ['Vrai', 'Faux'], correct: 0, correction: 'Du 1er au 3e quartile : la moitié centrale.' },
            { id: 'r4', label: 'On a toujours Q1 ≤ médiane ≤ Q3', options: ['Vrai', 'Faux'], correct: 0, correction: 'Par construction, les trois seuils sont ordonnés.' },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Les quatre.' : `${nCorrect} sur ${total}.`} Deux mesures d’étalement, deux
              sensibilités : l’<strong>étendue</strong> dit tout l’espace occupé (extrêmes compris),
              l’<strong>écart interquartile</strong> décrit le cœur de la série en ignorant les cas isolés.
            </Feedback>
          )}
          solved={q4} onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="Les quartiles" moduleSubtitle="Couper la série en quatre paquets d’effectifs égaux" estimatedTime="12 min"
      brief={{
        tag: 'Découverte', title: 'Q1, médiane, Q3', tone: 'sky',
        body: <p>La médiane coupe l’effectif en deux. Les quartiles le coupent en quatre — et l’écart entre Q1 et Q3 mesure la dispersion du cœur de la série, sans se laisser perturber par un cas isolé.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Il manque encore une mesure.</strong> Q3 − Q1 ignore les extrêmes — c’est parfois un avantage,
          parfois une perte d’information. Module suivant : un indicateur qui tient compte de <em>toutes</em> les valeurs.
        </KnowledgeSnapshot>
      )}
    />
  );
}
