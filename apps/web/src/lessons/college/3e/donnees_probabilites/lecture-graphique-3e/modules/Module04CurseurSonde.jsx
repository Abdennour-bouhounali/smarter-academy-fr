import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GraphProbe from '../components/GraphProbe';
import { maxOf, minOf, variations, describeVariation, image } from '../components/readingUtils';
import { BALLOON } from '../components/balloonData';
import { formatDec } from '@smarter-academy/core';

/**
 * Module 4 — MANIPULATION SIGNATURE : « Le curseur-sonde ».
 *
 * Activity: trouver le point le plus haut et le plus bas en promenant la sonde,
 *   puis délimiter les moments où le ballon monte.
 * Mathematical objective: extremums et intervalles de variation se LISENT. Le
 *   maximum n'est pas « le plus grand nombre du tableau » mais le sommet de la
 *   courbe ; un intervalle de croissance est un morceau de l'axe des abscisses,
 *   pas une valeur.
 * Student action: promener la sonde jusqu'au sommet, puis cocher les
 *   intervalles où la courbe monte.
 * Controlled variable: la position de la sonde ; puis la sélection
 *   d'intervalles.
 * Mathematical state: { value, picked[] } ; `variations` fournit la découpe de
 *   référence, donc la correction ne peut pas diverger du dessin.
 * Visual consequence: les intervalles cochés s'ombrent sur le repère — une
 *   période de croissance devient une BANDE, pas un point.
 * Expected observation: « ça monte de 0 à 3 h, ça redescend, ça remonte ».
 * Misconception targeted: confondre le maximum (une altitude) avec l'heure où
 *   il est atteint ; et croire qu'une fonction ne peut monter qu'une fois.
 * Feedback: la découpe est révélée en toutes lettres via `describeVariation`.
 * Formalization: `maximum-minimum` puis `intervalle-variation`, chacun posé sur
 *   le geste qui vient de le produire.
 * Scaffolding: sommet guidé → minimum → intervalles → distinction
 *   valeur/moment.
 * Transfer: le module 5 superpose une seconde courbe.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Le mot « intervalle » apparaissait pour la PREMIÈRE fois dans la
 *   `correction` d'une ligne de l'étape 4 — donc après la réponse — et n'était
 *   énoncé qu'au `footer`, que l'élève ne voit qu'une fois tout terminé. Les
 *   deux positions renforcent, aucune n'enseigne. L'ordre est maintenant :
 *     étape 1  atteindre le sommet → brique `maximum-minimum`
 *     étape 3  cocher les périodes → brique `intervalle-variation` → essai
 *     étape 4  le tri valeur/moment, désormais légitime, puis la brique
 *              `mem-valeur-ou-moment` qui le fige
 *   Le mot n'arrive donc jamais dans une position que l'élève lit trop tard.
 */

const MAXP = maxOf(BALLOON);
const MINP = minOf(BALLOON);
const VARS = variations(BALLOON);
const UP = VARS.filter((v) => v.direction === 'croissante');

export default function Module04CurseurSonde() {
  const [x, setX] = useState(0);
  const [foundMax, setFoundMax] = useState(false);
  const [picked, setPicked] = useState([]);
  const [minDone, setMinDone] = useState(false);
  const [distDone, setDistDone] = useState(false);
  const [varDone, setVarDone] = useState(false);

  const atMax = image(BALLOON, x) === MAXP.y;
  const done1 = foundMax || atMax;

  const togglePick = (i, kit) => {
    setPicked((prev) => {
      const next = prev.includes(i) ? prev.filter((k) => k !== i) : [...prev, i];
      return next;
    });
    kit.react(true);
  };
  const upIdx = VARS.map((v, i) => (v.direction === 'croissante' ? i : -1)).filter((i) => i >= 0);
  const pickedOk = upIdx.length === picked.length && upIdx.every((i) => picked.includes(i));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Le curseur-sonde"
      moduleSubtitle="Le plus haut, le plus bas, et les moments où ça monte."
      estimatedTime="11 min"
      brief={{
        tag: '🔎 Mission 04',
        title: 'Sonder tout le vol',
        tone: 'indigo',
        body: (
          <p>
            Trois questions que seule la courbe peut trancher : jusqu’où est-il monté,
            jusqu’où est-il descendu, et quand montait-il ?
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Trouve le point le plus haut',
          subtitle: 'Promène la sonde jusqu’au sommet du vol.',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <GraphProbe
                curve={BALLOON}
                mode="x"
                value={x}
                onChange={(v) => {
                  setX(v);
                  if (image(BALLOON, v) === MAXP.y && !foundMax) { setFoundMax(true); kit.react(true); }
                  else kit.react(true);
                }}
                showExtremes
                ariaLabel="Repère : cherche le sommet du vol"
              />
              {!done1 && (
                <Feedback tone="info">
                  Actuellement <strong>{formatDec(image(BALLOON, x))} m</strong>. Continue :
                  le ballon est monté plus haut que ça.
                </Feedback>
              )}
              {done1 && (
                <KnowledgeBrick
                  id="maximum-minimum"
                  variant="new"
                  lead={(
                    <>
                      Tu as atteint le point le plus haut : <strong>{formatDec(MAXP.y)} m</strong>,
                      dès <strong>{formatDec(MAXP.x)} h</strong> et tenu jusqu’à 4 h. Ces deux
                      nombres ne répondent pas à la même question.
                    </>
                  )}
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le point le plus bas',
          done: minDone,
          content: (
            <TapQuestion
              prompt="Quelle est l’altitude minimale du vol, et quand est-elle atteinte ?"
              options={[
                '0 m, atteint au départ et à 7 h',
                '200 m, atteint à 12 h',
                '0 m, atteint seulement au départ',
                '200 m, atteint à 1 h',
              ]}
              correct={0}
              cols={1}
              requires={['maximum-minimum', 'echelle-graduation']}
              explain="Le minimum est 0 m — le sol. Il est atteint deux fois : au décollage et lors de l’escale de 7 h. Un minimum peut très bien être atteint plusieurs fois."
              explainWrong="Cherche le point le plus BAS de la courbe, puis compte combien de fois elle y descend."
              solved={minDone}
              onAnswered={() => setMinDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Quand le ballon monte-t-il ?',
          subtitle: 'Coche les périodes de montée. Elles s’ombrent sur le repère.',
          done: pickedOk && varDone,
          content: (kit) => (
            <div className="space-y-3">
              <GraphProbe
                curve={BALLOON}
                mode="x"
                value={x}
                onChange={(v) => { setX(v); kit.react(true); }}
                highlightIntervals={picked.map((i) => ({
                  from: VARS[i].from, to: VARS[i].to,
                  tone: VARS[i].direction === 'croissante' ? 'emerald' : 'rose',
                }))}
                ariaLabel="Repère : sélectionne les périodes de montée"
              />
              <div className="flex flex-wrap gap-2">
                {VARS.map((v, i) => (
                  <button
                    key={`${v.from}-${v.to}`}
                    type="button"
                    onClick={() => togglePick(i, kit)}
                    aria-pressed={picked.includes(i)}
                    aria-label={`Période de ${formatDec(v.from)} à ${formatDec(v.to)} heures`}
                    className={`min-h-[44px] px-3 rounded-xl border-2 font-mono text-sm font-bold transition
                      focus-visible:ring-2 focus-visible:ring-blue-500
                      ${picked.includes(i) ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400'}`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {formatDec(v.from)} h → {formatDec(v.to)} h
                  </button>
                ))}
              </div>
              {!pickedOk && (
                <Feedback tone="info">
                  Coche les périodes pendant lesquelles la courbe <strong>monte</strong>. Il
                  y en a <strong>{UP.length}</strong>{picked.length > 0 && <>, tu en as coché {picked.length}</>}.
                </Feedback>
              )}
              {pickedOk && (
                <KnowledgeBrick
                  id="intervalle-variation"
                  establishes={['intervalle-variation', 'intervalle', 'variations']}
                  variant="new"
                  lead={(
                    <>
                      Exact : le vol {describeVariation(VARS, { unit: ' h' })}. Chaque bande que tu
                      viens d’ombrer a un début et une fin sur l’axe des heures — jamais une
                      altitude.
                    </>
                  )}
                >
                  <TapQuestion
                    prompt="Sur l’intervalle de 4 h à 7 h, que fait la fonction ?"
                    options={[
                      'Elle est décroissante : la courbe descend',
                      'Elle est croissante : la courbe monte',
                      'Elle vaut 400 m',
                      'Elle est constante',
                    ]}
                    correct={0}
                    cols={1}
                    requires={['intervalle-variation']}
                    explain="De 4 h à 7 h, le ballon passe de 600 m à 0 m : la courbe descend sur tout ce morceau d’axe, la fonction y est décroissante."
                    explainWrong="Regarde la bande de 4 h à 7 h que tu viens d’ombrer : la courbe y descend d’un bout à l’autre."
                    solved={varDone}
                    onAnswered={(ok) => { setVarDone(true); kit.react(ok); }}
                  />
                </KnowledgeBrick>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Une altitude ou un moment ?',
          done: distDone,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm text-slate-600">Chaque réponse est-elle une altitude ou un moment ?</p>}
                rows={[
                  { id: 'q1', label: 'Le maximum du vol', options: ['une altitude', 'un moment'], correct: 0,
                    correction: 'Le maximum est 600 m : c’est une hauteur.' },
                  { id: 'q2', label: 'L’heure où le sommet est atteint', options: ['une altitude', 'un moment'], correct: 1,
                    correction: '3 h : c’est un instant, lu sur l’axe horizontal.' },
                  { id: 'q3', label: 'Un intervalle de croissance', options: ['une altitude', 'un moment'], correct: 1,
                    correction: 'De 0 h à 3 h : un morceau de l’axe des heures.' },
                  { id: 'q4', label: 'Un antécédent de 400 m', options: ['une altitude', 'un moment'], correct: 1,
                    correction: 'Un antécédent est une heure : 2 h, 5 h, 9 h ou 11 h.' },
                ]}
                requires={['maximum-minimum', 'intervalle-variation', 'tous-les-antecedents']}
                feedback={({ allRight, nCorrect, total }) =>
                  allRight
                    ? <>Les quatre. Les altitudes se lisent verticalement, les moments horizontalement.</>
                    : <>{nCorrect} sur {total}. Demande-toi sur quel axe la réponse se lit.</>
                }
                solved={distDone}
                onAnswered={() => setDistDone(true)}
              />
              {distDone && (
                <KnowledgeBrick
                  id="mem-valeur-ou-moment"
                  variant="new"
                  compact
                  lead="Tu viens de trier quatre réponses par leur axe. Garde ce réflexe : il désamorce la moitié des erreurs de lecture."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> Tu sais tout dire d’une courbe seule. Au module suivant, une
          seconde courbe se superpose — et c’est leur croisement qui répondra.
        </KnowledgeSnapshot>
      )}
    />
  );
}
