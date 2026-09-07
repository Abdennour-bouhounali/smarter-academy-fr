import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 4 — MANIPULATION : reconstruire un tableau d'effectifs à partir de
 * fréquences.
 *
 * Le sens de lecture inverse — effectif = fréquence × effectif de référence —
 * oblige à identifier À QUOI se rapporte chaque pourcentage donné dans
 * l'énoncé. C'est la compétence réellement utile face à un article de presse,
 * qui ne donne jamais un tableau complet.
 *
 * L'énoncé est construit pour que chaque case se déduise dans un ordre
 * déterminé, sans ambiguïté ; les corrections nomment à chaque fois le groupe
 * de référence utilisé.
 */
export default function Module04DesFrequencesAuxEffectifs() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const Enonce = () => (
    <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 space-y-1.5 text-sm text-emerald-900">
      <p className="font-black">L’enquête, résumée en pourcentages</p>
      <ul className="list-disc list-inside space-y-1">
        <li>Un lycée compte <strong>500 élèves</strong>.</li>
        <li><strong>60 %</strong> des élèves sont demi-pensionnaires.</li>
        <li>Parmi les demi-pensionnaires, <strong>25 %</strong> font partie d’une association.</li>
        <li>Parmi les externes, <strong>40 %</strong> font partie d’une association.</li>
      </ul>
    </div>
  );

  const steps = [
    {
      num: 1,
      title: 'Les effectifs marginaux',
      done: q1,
      content: (
        <div className="space-y-3">
          <Enonce />
          <div className="rounded-xl border border-emerald-200 bg-white p-3 text-center">
            <MathText>{'$$\\text{effectif} = \\text{fréquence} \\times \\text{effectif de référence}$$'}</MathText>
          </div>
          <NumericQuestion
            prompt="Combien d’élèves sont demi-pensionnaires ?"
            expected={300} suffix="élèves"
            explain="0,60 × 500 = 300. Les 60 % se rapportent à l’ensemble des élèves : la référence est le total, 500."
            explainFor={(n) => (n === 60
              ? '60 est le pourcentage, pas l’effectif : 0,60 × 500 = 300 élèves.'
              : 'Le pourcentage porte sur l’ensemble du lycée : 0,60 × 500 = 300.')}
            solved={q1} onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Une case, via une conditionnelle',
      done: q2,
      content: (
        <NumericQuestion
          prompt="Combien de demi-pensionnaires font partie d’une association ?"
          expected={75} suffix="élèves"
          explain="Les 25 % se rapportent aux DEMI-PENSIONNAIRES, pas à tout le lycée : 0,25 × 300 = 75 élèves. Rapportés au lycée entier, ces 75 élèves ne représentent que 15 %."
          explainFor={(n) => (n === 125
            ? 'Tu as multiplié par 500 : 0,25 × 500 = 125. Mais la phrase dit « parmi les demi-pensionnaires » : la référence est 300, donc 0,25 × 300 = 75.'
            : n === 25
              ? '25 est le pourcentage. Il s’applique aux 300 demi-pensionnaires : 0,25 × 300 = 75 élèves.'
              : 'Le mot « parmi » désigne la référence : 0,25 × 300 = 75.')}
          solved={q2} onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'L’autre branche',
      done: q3,
      content: (
        <NumericQuestion
          prompt="Combien d’externes font partie d’une association ?"
          expected={80} suffix="élèves"
          explain="Il y a 500 − 300 = 200 externes, et 0,40 × 200 = 80 d’entre eux sont en association. Chaque pourcentage a sa propre référence : 300 pour les uns, 200 pour les autres."
          explainFor={(n) => (n === 200
            ? '200 est le nombre d’externes. Il reste à en prendre 40 % : 0,40 × 200 = 80.'
            : n === 120
              ? '0,40 × 300 utiliserait la référence des demi-pensionnaires. Les externes sont 500 − 300 = 200, donc 0,40 × 200 = 80.'
              : 'Externes = 500 − 300 = 200, puis 0,40 × 200 = 80.')}
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Retour à une marginale',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Au total, quelle proportion des 500 élèves fait partie d’une association ?"
            options={[
              '31 % : (75 + 80) ÷ 500',
              '32,5 % : la moyenne de 25 % et 40 %',
              '65 % : 25 % + 40 %',
              '15 % : seulement les demi-pensionnaires',
            ]}
            correct={0} cols={1}
            explain="On additionne les EFFECTIFS (75 + 80 = 155), puis on rapporte au total : 155 ÷ 500 = 31 %. On ne peut ni additionner ni moyenner directement deux pourcentages qui n’ont pas la même référence — sauf si les deux groupes avaient la même taille, ce qui n’est pas le cas (300 contre 200)."
            explainWrong="25 % et 40 % ont des dénominateurs différents (300 et 200) : ni leur somme ni leur moyenne n’a de sens. Il faut repasser par les effectifs : (75 + 80) ÷ 500 = 31 %."
            solved={q4} onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="ok">
              Le tableau est maintenant complet : 75 et 225 chez les demi-pensionnaires, 80 et 120 chez les
              externes, soit 155 élèves en association sur 500. Toute la reconstruction repose sur une seule
              règle : <strong>identifier la référence de chaque pourcentage</strong> avant de multiplier.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Des fréquences aux effectifs" moduleSubtitle="Reconstruire le tableau" estimatedTime="13 min"
      brief={{
        tag: 'Manipulation', title: 'Effectif = fréquence × référence', tone: 'emerald',
        body: <p>Un article ne donne jamais un tableau complet : quelques pourcentages et un effectif total. Reconstruire le tableau demande d’identifier, pour chaque pourcentage, le groupe auquel il se rapporte.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Dernier entraînement.</strong> Des affirmations tirées d’articles réels : lesquelles le
          tableau soutient-il vraiment ?
        </KnowledgeSnapshot>
      )}
    />
  );
}
