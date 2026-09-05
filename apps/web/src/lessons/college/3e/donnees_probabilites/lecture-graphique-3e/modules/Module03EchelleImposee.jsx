import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GraphProbe from '../components/GraphProbe';
import { image, isReadingOk } from '../components/readingUtils';
import { BALLOON } from '../components/balloonData';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 3 — DÉCOUVERTE : « L'échelle imposée ».
 *
 * Activity: lire des valeurs qui ne tombent PAS sur une graduation, sur un axe
 *   où un carreau vaut 100 m.
 * Mathematical objective: lire, c'est d'abord savoir ce que vaut un carreau.
 *   La sonde peut se poser entre deux graduations, et la valeur lue est alors
 *   une estimation — légitime, à la tolérance près.
 * Student action: poser la sonde à une demi-heure, lire entre deux traits.
 * Controlled variable: la position de la sonde, au demi-pas.
 * Mathematical state: { value } ; l'altitude vient de l'interpolation de la
 *   polyligne, donc la valeur affichée est celle que le dessin montre.
 * Visual consequence: la lecture affiche une valeur intermédiaire (300 m à
 *   1 h 30) qu'aucune graduation ne porte.
 * Expected observation: « entre deux traits, la valeur existe quand même ».
 * Misconception targeted: arrondir à la graduation la plus proche ; et lire
 *   « 3 » là où l'échelle dit 300 (le carreau pris pour une unité).
 * Feedback: explainFor cible ces deux erreurs nommément.
 * Formalization: la règle « regarde ce que vaut un carreau » est posée.
 * Scaffolding: lecture sur graduation → lecture entre deux → piège d'échelle.
 * Transfer: le module 4 lit des extremums sur la même échelle.
 *
 * NOTE — `representation-graphique-3e` faisait CHOISIR l'échelle pour
 * construire. Ici elle est IMPOSÉE et il faut la lire : c'est la différence
 * entre les deux leçons, annoncée dans les deux en-têtes.
 */

const HALF = 1.5;    // 300 m — entre deux graduations de l'axe des heures

export default function Module03EchelleImposee() {
  const [x, setX] = useState(1);
  const [gradDone, setGradDone] = useState(false);
  const [betweenDone, setBetweenDone] = useState(false);
  const [trapDone, setTrapDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="L’échelle imposée"
      moduleSubtitle="Un carreau vaut 100 m. Encore faut-il le remarquer."
      estimatedTime="8 min"
      brief={{
        tag: '📏 Mission 03',
        title: 'Ce que vaut un carreau',
        tone: 'indigo',
        body: (
          <p>
            Sur ce repère, un carreau vertical vaut <strong>100 m</strong>. Ni 1, ni 10 :
            c’est l’axe qui le dit, et rien d’autre.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Lis une altitude sur une graduation',
          subtitle: 'Place la sonde sur 5 h.',
          done: gradDone,
          content: (kit) => (
            <div className="space-y-3">
              <GraphProbe
                curve={BALLOON}
                mode="x"
                value={x}
                onChange={(v) => { setX(v); kit.react(true); }}
                ariaLabel="Repère : lire l’altitude avec une échelle de 100 m par carreau"
              />
              <NumericQuestion
                prompt="Quelle est l’altitude à 5 h ?"
                expected={(n) => isReadingOk(image(BALLOON, 5), n, 50)}
                parse={parseDec}
                display={formatDec(image(BALLOON, 5))}
                suffix="m"
                explain="À 5 h, la courbe est sur la quatrième graduation : 4 × 100 = 400 m."
                explainFor={(n) => {
                  if (n === 4) return 'Tu as compté les carreaux. Un carreau vaut 100 m, donc quatre carreaux font 400 m.';
                  if (n === 40) return 'Attention à l’échelle : c’est 100 m par carreau, pas 10.';
                  if (n === 5) return 'Tu as redonné l’heure. On demande l’altitude, sur l’axe vertical.';
                  return null;
                }}
                solved={gradDone}
                onAnswered={(ok) => { setGradDone(true); kit.react(ok); }}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Et entre deux graduations ?',
          subtitle: 'Place la sonde sur 1 h 30.',
          done: betweenDone,
          content: (kit) => (
            <NumericQuestion
              prompt="Quelle est l’altitude à 1 h 30 ?"
              expected={(n) => isReadingOk(image(BALLOON, HALF), n, 50)}
              parse={parseDec}
              display={formatDec(image(BALLOON, HALF))}
              suffix="m"
              explain="À 1 h le ballon est à 200 m, à 2 h il est à 400 m. À mi-chemin, il est à 300 m — une altitude bien réelle, même si aucune graduation ne la porte."
              explainFor={(n) => {
                if (n === 200 || n === 400) return 'Tu as arrondi à une graduation. Entre 1 h et 2 h, la courbe passe bien par une valeur intermédiaire.';
                if (n === 3) return 'Tu as lu le nombre de carreaux. Un carreau vaut 100 m : trois carreaux font 300 m.';
                return null;
              }}
              solved={betweenDone}
              onAnswered={(ok) => { setBetweenDone(true); kit.react(ok); }}
            />
          ),
        },
        {
          num: 3,
          title: 'Le piège de l’échelle',
          done: trapDone,
          content: (
            <TapQuestion
              prompt="Un camarade dit : « le ballon est monté à 6 ». Que lui répondre ?"
              options={[
                'Il a compté 6 carreaux : cela fait 600 m, pas 6',
                'Il a raison, le sommet est bien à 6',
                'Il a lu l’heure au lieu de l’altitude',
                'Il a oublié de diviser par 100',
              ]}
              correct={0}
              cols={1}
              explain="Compter les carreaux ne suffit pas : il faut les multiplier par ce que vaut un carreau. Six carreaux à 100 m font 600 m. C’est l’erreur la plus fréquente en lecture graphique."
              explainWrong="Le sommet est bien à six carreaux de hauteur — mais un carreau ne vaut pas 1. Regarde les nombres écrits sur l’axe."
              solved={trapDone}
              onAnswered={() => setTrapDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          <strong>Le réflexe.</strong> Avant toute lecture, repère{' '}
          <strong>ce que vaut un carreau</strong> sur chaque axe. Une valeur peut tomber
          entre deux graduations : elle existe quand même, et se lit à quelques mètres près.
        </Feedback>
      }
    />
  );
}
