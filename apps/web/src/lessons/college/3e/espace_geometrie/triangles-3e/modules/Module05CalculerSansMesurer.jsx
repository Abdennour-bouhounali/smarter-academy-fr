import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { ContentModule, NumericQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TriangleLab from '../components/TriangleLab';
import { baseAngles, thirdAngle, FIGURES } from '../components/triangleUtils';

/**
 * Module 5 — MANIPULATION : calculer un angle sans le mesurer.
 *
 * Activity              déduire des angles à partir de propriétés.
 * Mathematical objective mobiliser la somme des angles ET les propriétés des
 *                       triangles particuliers pour CALCULER.
 * Student action        répondre numériquement, la figure ne portant PAS la
 *                       mesure cherchée.
 * Controlled variable   les données de l'énoncé.
 * Mathematical state    les angles, dont un seul est inconnu.
 * Visual consequence    la figure sert d'appui, jamais de réponse : les
 *                       mesures sont masquées.
 * Misconception ciblée   mesurer sur le dessin au lieu de raisonner ; et
 *                       diviser 180 par 3 dès qu'on voit « isocèle ».
 * Feedback              `explainFor` intercepte les erreurs classiques.
 * Transfer              module 6 : rédiger le raisonnement qu'on vient de faire.
 */
export default function Module05CalculerSansMesurer() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [batch, setBatch] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Le troisième angle',
      subtitle: 'La figure ne porte aucune mesure : il faut raisonner.',
      done: q1,
      content: (
        <div className="space-y-3">
          <TriangleLab
            points={FIGURES.quelconque}
            draggable={false}
            showName={false}
            ariaLabel="Triangle ABC quelconque, sans mesures affichées"
          />
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3 text-center">
            <p className="text-sm text-slate-700">
              Dans ce triangle ABC : angle A = <strong>61°</strong>, angle B = <strong>47°</strong>.
            </p>
          </div>
          <NumericQuestion
            prompt="Combien mesure l’angle C ?"
            suffix="°"
            expected={thirdAngle(61, 47)}
            width="w-24"
            explain="180 − 61 − 47 = 72. La somme des angles suffit, aucune mesure sur la figure n’est nécessaire."
            explainFor={(n) => (n === 108
              ? 'Tu as fait 61 + 47 = 108 : c’est la somme des deux angles connus, pas le troisième. Retranche-la à 180.'
              : n === 60 ? 'Attention : 60° serait le cas d’un triangle équilatéral. Ici les deux angles donnés sont différents.' : null)}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Dans un isocèle',
      subtitle: 'Un seul angle donné suffit.',
      done: q2,
      content: (
        <div className="space-y-3">
          <TriangleLab
            points={FIGURES.isocele}
            draggable={false}
            showName={false}
            ariaLabel="Triangle isocèle en C, sans mesures affichées"
          />
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3 text-center">
            <p className="text-sm text-slate-700">
              Ce triangle est <strong>isocèle en C</strong>, et l’angle en C mesure{' '}
              <strong>44°</strong>.
            </p>
          </div>
          <NumericQuestion
            prompt="Combien mesure l’angle en A ?"
            suffix="°"
            expected={baseAngles(44)}
            width="w-24"
            explain="Isocèle en C ⇒ les angles à la base A et B sont égaux. Il reste 180 − 44 = 136° à partager en deux : chacun vaut 68°."
            explainFor={(n) => (n === 136
              ? 'Tu as trouvé 180 − 44 = 136 : c’est ce qui reste pour les DEUX angles à la base. Comme ils sont égaux, il faut encore diviser par 2.'
              : n === 60 ? 'Isocèle ne veut pas dire équilatéral : les trois angles ne valent 60° que si les trois côtés sont égaux.' : null)}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Quatre situations',
      subtitle: 'Chaque fois, quelle propriété utilises-tu ?',
      done: batch,
      content: (
        <BatchChoiceQuestion
          intro={
            <p className="text-sm text-slate-700">
              Associe chaque situation à la mesure cherchée.
            </p>
          }
          rows={[
            {
              id: 'r1',
              label: 'Triangle équilatéral : combien mesure chaque angle ?',
              options: ['60°', '90°', '45°'],
              correct: 0,
              correction: 'Trois côtés égaux ⇒ trois angles égaux, et leur somme vaut 180° : chacun vaut 180 ÷ 3 = 60°.',
            },
            {
              id: 'r2',
              label: 'Triangle rectangle avec un angle de 35° : combien mesure le troisième ?',
              options: ['55°', '145°', '65°'],
              correct: 0,
              correction: 'Les deux angles aigus somment 90° : 90 − 35 = 55°.',
            },
            {
              id: 'r3',
              label: 'Triangle isocèle dont un angle à la base vaut 50° : combien mesure l’angle au sommet ?',
              options: ['80°', '50°', '130°'],
              correct: 0,
              correction: 'Les deux angles à la base valent 50° chacun : 180 − 50 − 50 = 80°.',
            },
            {
              id: 'r4',
              label: 'Triangle rectangle ET isocèle : combien mesurent les angles aigus ?',
              options: ['45° chacun', '30° et 60°', '90° chacun'],
              correct: 0,
              correction: 'Il reste 90° à partager entre deux angles égaux : 45° chacun. C’est la moitié d’un carré coupé en diagonale.',
            },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'info'}>
              {allRight
                ? 'Tu combines les deux outils : la somme vaut 180°, et les triangles particuliers donnent des égalités d’angles.'
                : `${nCorrect} sur ${total}. Dans chaque cas, demande-toi d’abord quels angles sont ÉGAUX, puis applique la somme.`}
            </Feedback>
          )}
          solved={batch}
          onAnswered={() => setBatch(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Calculer sans mesurer"
      moduleSubtitle="Le raisonnement remplace le rapporteur"
      estimatedTime="10 min"
      brief={{
        tag: 'Manipulation',
        title: 'Poser le rapporteur',
        tone: 'purple',
        body: (
          <p>
            Les figures ne portent plus aucune mesure. Tout ce dont tu as besoin, tu l’as déjà :
            la somme des angles, et les propriétés des triangles particuliers.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3 flex gap-3 items-start">
          <Calculator className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-purple-900">
            Méthode : repère d’abord les angles <strong>égaux</strong> (grâce au type de triangle),
            puis utilise la somme <strong>180°</strong>.
          </p>
        </div>
      }
      steps={steps}
      footer={
        <Feedback tone="ok">
          <strong>Retenons.</strong> Équilatéral : trois angles de 60°. Isocèle : les deux angles
          à la base sont égaux. Rectangle : les deux angles aigus somment 90°. Rectangle isocèle :
          45° et 45°.
        </Feedback>
      }
    />
  );
}
