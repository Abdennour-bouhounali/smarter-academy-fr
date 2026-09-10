import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis. On MESURE ce que la leçon va employer sans l'enseigner :
 * tout ce que la Seconde a déjà posé sur le cercle trigonométrique.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un module 0 ne peut exiger que des `priorKnowledge` : il mesure, il
 *   n'enseigne pas. Aucune question ne porte sur la parité, la périodicité,
 *   les variations ni la courbe — c'est la matière de la leçon, et la mesurer
 *   ici reviendrait à évaluer avant d'enseigner. Aucun de ces mots n'apparaît,
 *   pas même dans un `explain`.
 *   Chaque prérequis déclaré est mesuré par au moins une question :
 *     tf-d1  cercle-trigonometrique, enroulement
 *     tf-d2  radian
 *     tf-d3  cos-sin-coordonnees, abscisse, ordonnee
 *     tf-d4  regle-borne-un
 *     tf-d5  valeurs-remarquables
 *     tf-d6  fonction, notation-fx
 *     tf-d7  variations-sens, tableau-de-variations
 */
const SKILLS = {
  cercle: { label: 'Le cercle et l’enroulement', emoji: '🔵' },
  radian: { label: 'Le radian', emoji: '📏' },
  coord: { label: 'Les deux coordonnées', emoji: '📍' },
  fonctions: { label: 'Fonctions', emoji: 'ƒ' },
};

const QUESTIONS = [
  {
    id: 'tf-d1',
    requires: ['cercle-trigonometrique', 'enroulement'],
    skill: 'cercle',
    points: 2,
    prompt: 'Sur le cercle trigonométrique, on part de (1 ; 0) et on parcourt une longueur de 2π. Où arrive-t-on ?',
    options: ['De nouveau en (1 ; 0) : c’est un tour complet', 'En (0 ; 1)', 'En (−1 ; 0)'],
    cols: 1,
    correct: 0,
    explain: 'Le cercle a pour rayon 1, donc son tour complet mesure 2π. Parcourir 2π ramène exactement au point de départ.',
  },
  {
    id: 'tf-d2',
    requires: ['radian'],
    skill: 'radian',
    points: 2,
    prompt: 'Un demi-tour de cercle correspond à un angle de 180°. Combien cela fait-il en radians ?',
    options: ['π', '2π', 'π/2'],
    cols: 3,
    correct: 0,
    explain: 'Un demi-tour parcourt une longueur π sur le cercle de rayon 1 : π radians valent 180°.',
  },
  {
    id: 'tf-d3',
    requires: ['cos-sin-coordonnees', 'abscisse', 'ordonnee'],
    skill: 'coord',
    points: 2,
    prompt: 'Le point associé au réel t sur le cercle a pour coordonnées…',
    options: ['(cos t ; sin t)', '(sin t ; cos t)', '(t ; cos t)'],
    cols: 3,
    correct: 0,
    explain: 'cos t est l’abscisse (on la lit à l’horizontale) et sin t est l’ordonnée (on la lit à la verticale). On écrit toujours l’abscisse en premier.',
  },
  {
    id: 'tf-d4',
    requires: ['regle-borne-un'],
    skill: 'coord',
    points: 2,
    prompt: 'Peut-on avoir cos t = 1,4 pour un certain réel t ?',
    options: [
      'Non : le point reste sur le cercle de rayon 1, donc cos t est compris entre −1 et 1',
      'Oui, si t est assez grand',
      'Oui, si t est négatif',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le point ne quitte jamais le cercle de rayon 1 : ses deux coordonnées restent entre −1 et 1, bornes comprises.',
  },
  {
    id: 'tf-d5',
    requires: ['valeurs-remarquables'],
    skill: 'coord',
    points: 2,
    prompt: 'Que vaut sin(π/6) ?',
    options: ['0,5', '√3/2', '√2/2'],
    cols: 3,
    correct: 0,
    explain: 'sin(π/6) = 1/2 = 0,5. C’est √3/2 qui est le cosinus de π/6 — les deux ne se confondent qu’en π/4.',
  },
  {
    id: 'tf-d6',
    requires: ['fonction', 'notation-fx'],
    skill: 'fonctions',
    points: 2,
    prompt: 'Pour une fonction f, l’écriture f(3) désigne…',
    options: ['le nombre que f associe à 3', 'le produit de f par 3', 'le nombre 3 lui-même'],
    cols: 1,
    correct: 0,
    explain: 'f(3) est l’image de 3 par f : le nombre que la fonction associe à 3. Ce n’est pas une multiplication.',
  },
  {
    id: 'tf-d7',
    requires: ['variations-sens', 'tableau-de-variations'],
    skill: 'fonctions',
    points: 2,
    prompt: 'Sur un intervalle, une fonction part de 4 et arrive à 1, sans jamais remonter. Elle y est…',
    options: ['décroissante', 'croissante', 'constante'],
    cols: 3,
    correct: 0,
    explain: 'La valeur d’arrivée est plus petite que celle de départ, et elle ne remonte pas : la fonction descend sur tout l’intervalle.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Sept questions sur ce que la Seconde t’a déjà donné"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Cette leçon PART du cercle trigonométrique que tu connais déjà. Un tour de tes
            outils : l’enroulement, le radian, les deux coordonnées et le vocabulaire des
            fonctions. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
