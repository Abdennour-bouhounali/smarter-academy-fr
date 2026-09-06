import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GraphProbe from '../components/GraphProbe';
import { image, antecedents } from '../components/readingUtils';
import { BALLOON } from '../components/balloonData';
import { formatDec } from '@smarter-academy/core';

/**
 * Module 1 — DÉCLENCHEUR : « La montgolfière » (manipulation signature).
 *
 * Activity: promener la sonde sur la courbe du vol dès la première étape —
 *   aucune lecture, aucune consigne préalable : on manipule d'abord. Puis des
 *   défis que seule la sonde permet de relever.
 * Mathematical objective: faire éprouver qu'une courbe RÉPOND. Chaque position
 *   de la sonde produit une altitude, qui ne se calcule pas : elle se lit. Il
 *   n'y a ni expression ni règle dans toute la leçon.
 * Student action: glisser la sonde (ou − / +) ; l'amener sur une heure donnée ;
 *   prédire puis vérifier ; l'amener là où l'altitude vaut 400 m.
 * Controlled variable: l'heure visée.
 * Mathematical state: { value } par sonde ; l'altitude affichée est calculée
 *   par `image` sur la polyligne, si bien que le texte ne peut pas diverger du
 *   dessin, et les défis se valident sur cette même valeur.
 * Visual consequence: le guide vertical suit le doigt, le point d'intersection
 *   s'allume sur la courbe, la lecture s'écrit sous le repère avec le couple
 *   (heure ; altitude).
 * Expected observation: « le ballon monte, se stabilise, redescend, remonte » ;
 *   « à une heure, une altitude — mais 400 m est atteint plusieurs fois ».
 * Misconception targeted: croire qu'il faut une formule ; lire l'abscisse à
 *   la place de l'ordonnée ; croire qu'une altitude n'a qu'une heure.
 * Feedback: la lecture en toutes lettres à chaque déplacement ; les défis se
 *   valident quand la sonde est au bon endroit — jamais par un « faux ».
 * Formalization: le GESTE de lecture, nommé après avoir été fait — pas les
 *   mots « image » et « antécédent », qui viennent de `fonctions-3e` et sont
 *   ici des prérequis (voir `priorKnowledge`).
 * Scaffolding: exploration libre (SHOW) → défi guidé « 3 h » (TRY) →
 *   prédiction (EXPLORE) → défi inverse « 400 m » (CHALLENGE).
 * Transfer: le module 2 bascule la sonde sur l'autre axe et compte les
 *   réponses que ce second sens produit.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Ce module ne posait AUCUNE connaissance : la règle de lecture n'existait
 *   que dans les `explain`, c'est-à-dire après les réponses. L'ordre est
 *   maintenant :
 *     étape 1  promener la sonde, puis brique `lecture-image-graphique`
 *              → rappel `image` (acquis de fonctions-3e, resitué sur un dessin)
 *     étape 1  la lecture affichée « c'est le point (x ; y) »
 *              → brique `point-de-la-courbe` → essai immédiat
 *     étapes 2-6  les questions, désormais toutes légitimes
 *   Le mot « antécédent » n'est PAS posé ici : l'étape 4 fait seulement
 *   constater qu'une altitude revient plusieurs fois, et c'est le module 2 qui
 *   en tire la méthode.
 */

const CHALLENGE_H = 3;       // « amène la sonde sur 3 h »
const CHALLENGE_ALT = 400;   // « trouve une heure où le ballon est à 400 m »
const PRED_FROM = 5;
const PRED_TO = 6;

export default function Module01Montgolfiere() {
  const [x, setX] = useState(0);
  const [visited, setVisited] = useState(() => new Set([0]));
  const [x2, setX2] = useState(0);
  const [hitHour, setHitHour] = useState(false);
  const [predDone, setPredDone] = useState(false);
  const [x4, setX4] = useState(0);
  const [hitAlt, setHitAlt] = useState(false);
  const [coordDone, setCoordDone] = useState(false);
  const [pairDone, setPairDone] = useState(false);
  const [shapeDone, setShapeDone] = useState(false);

  // On veut que l'élève ait parcouru les quatre temps du vol : la montée, le
  // palier, la descente jusqu'au sol, la remontée.
  const phases = new Set();
  for (const v of visited) {
    if (v <= 3) phases.add('montee');
    else if (v <= 4) phases.add('palier');
    else if (v <= 7) phases.add('descente');
    else phases.add('remontee');
  }
  const LABELS = { montee: 'la montée', palier: 'le palier', descente: 'la descente', remontee: 'la remontée' };
  const missing = ['montee', 'palier', 'descente', 'remontee'].filter((p) => !phases.has(p));
  const explored = missing.length === 0;

  const move = (v, kit) => {
    if (v === x) return;
    setX(v);
    setVisited((prev) => new Set(prev).add(v));
    kit.react(true);
  };

  const altTimes = antecedents(BALLOON, CHALLENGE_ALT);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La montgolfière"
      moduleSubtitle="Promène le curseur sur le vol : à chaque heure, son altitude."
      estimatedTime="7 min"
      brief={{
        tag: '🎈 Mission 01',
        title: 'Douze heures de vol',
        tone: 'indigo',
        body: (
          <p>
            Voici l’altitude d’une montgolfière, relevée pendant douze heures. Aucune
            formule ne l’accompagne : la courbe est tout ce que tu as. Touche-la.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Promène la sonde sur tout le vol',
          subtitle: 'Fais-la passer par la montée, le palier, la descente et la remontée.',
          done: explored && coordDone,
          content: (kit) => (
            <div className="space-y-3">
              <GraphProbe
                curve={BALLOON}
                mode="x"
                value={x}
                onChange={(v) => move(v, kit)}
                showPair
                ariaLabel="Repère : promène la sonde sur le vol de la montgolfière"
              />
              <Feedback tone={explored ? 'ok' : 'info'}>
                {explored ? (
                  <>
                    Tu as parcouru tout le vol. Le ballon <strong>monte</strong>, se
                    <strong> stabilise</strong>, <strong>redescend</strong> jusqu’au sol, puis
                    <strong> remonte</strong> — et tu l’as lu sans le moindre calcul.
                  </>
                ) : (
                  <>
                    Continue de déplacer la sonde : il te reste{' '}
                    <strong>{missing.map((m) => LABELS[m]).join(', ')}</strong>.
                  </>
                )}
              </Feedback>

              {explored && (
                <>
                  <KnowledgeBrick
                    id="image"
                    variant="rappel"
                    compact
                    lead="Ce que la courbe t’a répondu à chaque position porte déjà un nom, vu avec les machines à nombres."
                  />
                  <KnowledgeBrick
                    id="lecture-image-graphique"
                    variant="new"
                    lead="Sur un dessin, la lire ne se calcule pas : c’est le trajet que ton doigt vient de faire."
                  />
                  <KnowledgeBrick
                    id="point-de-la-courbe"
                    variant="new"
                    lead="Sous le repère, la lecture s’écrivait aussi sous la forme d’un couple. Voilà comment on la lit."
                  >
                    <TapQuestion
                      prompt="Le point de la courbe situé en (3 ; 600) raconte quoi ?"
                      options={[
                        'À 3 h, le ballon était à 600 m',
                        'À 600 h, le ballon était à 3 m',
                        'Le ballon a mis 600 h pour monter de 3 m',
                        'Le ballon est monté de 3 m par heure',
                      ]}
                      correct={0}
                      cols={1}
                      requires={['point-de-la-courbe', 'coordonnees', 'abscisse', 'ordonnee']}
                      explain="L’abscisse d’abord (l’heure), l’ordonnée ensuite (l’altitude) : à 3 h, 600 m — exactement ce que la sonde affichait."
                      explainWrong="L’abscisse est portée par l’axe horizontal — ce sont les heures. L’ordonnée est la hauteur : l’altitude."
                      solved={coordDone}
                      onAnswered={() => setCoordDone(true)}
                    />
                  </KnowledgeBrick>
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: `Défi : amène la sonde sur ${CHALLENGE_H} h`,
          subtitle: 'Où est le ballon à cette heure-là ?',
          done: hitHour,
          content: (kit) => (
            <div className="space-y-3">
              <GraphProbe
                curve={BALLOON}
                mode="x"
                value={x2}
                onChange={(v) => {
                  setX2(v);
                  if (v === CHALLENGE_H && !hitHour) { setHitHour(true); kit.react(true); }
                }}
                showPair
                ariaLabel={`Repère : amène la sonde sur ${CHALLENGE_H} h`}
              />
              <Feedback tone={hitHour ? 'ok' : 'info'}>
                {hitHour ? (
                  <>
                    À <strong>{CHALLENGE_H} h</strong>, le ballon est à{' '}
                    <strong>{formatDec(image(BALLOON, CHALLENGE_H))} m</strong>. Une heure donnée,
                    <strong> une seule</strong> altitude : la courbe répond sans hésiter.
                  </>
                ) : (
                  <>
                    La sonde est à {formatDec(x2)} h. Déplace-la {x2 < CHALLENGE_H ? 'vers la droite' : 'vers la gauche'} jusqu’à {CHALLENGE_H} h.
                  </>
                )}
              </Feedback>
            </div>
          ),
        },
        {
          num: 3,
          title: 'Prédis, puis vérifie',
          done: predDone,
          content: (
            <TapQuestion
              prompt={`À ${PRED_TO} h, le ballon est-il plus haut ou plus bas qu’à ${PRED_FROM} h ?`}
              above={(revealed) => revealed && (
                <div className="grid grid-cols-2 gap-2">
                  {[PRED_FROM, PRED_TO].map((h) => (
                    <div key={h} className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{h} h</p>
                      <p className="font-mono font-bold text-sky-700 tabular-nums">{formatDec(image(BALLOON, h))} m</p>
                    </div>
                  ))}
                </div>
              )}
              options={['Plus bas : il descend', 'Plus haut : il monte', 'À la même altitude']}
              correct={0}
              cols={1}
              requires={['lecture-image-graphique']}
              explain={`À ${PRED_FROM} h : ${formatDec(image(BALLOON, PRED_FROM))} m. À ${PRED_TO} h : ${formatDec(image(BALLOON, PRED_TO))} m. Entre les deux, la courbe descend — le ballon perd de l’altitude.`}
              explainWrong={`Regarde la courbe entre ${PRED_FROM} h et ${PRED_TO} h : elle descend. ${formatDec(image(BALLOON, PRED_FROM))} m puis ${formatDec(image(BALLOON, PRED_TO))} m.`}
              solved={predDone}
              onAnswered={() => setPredDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: `Défi : trouve une heure où le ballon est à ${CHALLENGE_ALT} m`,
          subtitle: 'Cette fois, c’est l’altitude qui est donnée.',
          done: hitAlt,
          content: (kit) => (
            <div className="space-y-3">
              <GraphProbe
                curve={BALLOON}
                mode="x"
                value={x4}
                onChange={(v) => {
                  setX4(v);
                  if (image(BALLOON, v) === CHALLENGE_ALT && !hitAlt) { setHitAlt(true); kit.react(true); }
                }}
                showPair
                ariaLabel={`Repère : trouve une heure où l’altitude vaut ${CHALLENGE_ALT} m`}
              />
              <Feedback tone={hitAlt ? 'ok' : 'info'}>
                {hitAlt ? (
                  <>
                    À <strong>{formatDec(x4)} h</strong>, le ballon est bien à {CHALLENGE_ALT} m. Mais ce
                    n’est pas la seule heure : {CHALLENGE_ALT} m est atteint{' '}
                    <strong>{altTimes.length} fois</strong> — à {altTimes.map((t) => `${formatDec(t)} h`).join(', ')}.
                    Une altitude peut avoir <strong>plusieurs</strong> heures : c’est le module suivant.
                  </>
                ) : (
                  <>
                    Actuellement {formatDec(image(BALLOON, x4))} m. Déplace la sonde jusqu’à ce que
                    la lecture affiche {CHALLENGE_ALT} m.
                  </>
                )}
              </Feedback>
            </div>
          ),
        },
        {
          num: 5,
          title: 'Le couple dans l’autre sens',
          done: pairDone,
          content: (
            <TapQuestion
              prompt="Un camarade écrit « le ballon est au point (600 ; 3) ». Que lui répondre ?"
              options={[
                'Il a inversé les deux nombres : c’est (3 ; 600)',
                'C’est correct, l’ordre n’a pas d’importance',
                'Il manque une unité, sinon c’est juste',
                'Le point n’existe pas sur cette courbe',
              ]}
              correct={0}
              cols={1}
              requires={['point-de-la-courbe', 'coordonnees', 'abscisse', 'ordonnee']}
              explain="Le premier nombre se lit sur l’axe horizontal : ici, 600 serait une heure — le relevé n’en compte que douze. L’ordre du couple n’est pas décoratif, il dit sur quel axe chaque nombre vit."
              explainWrong="Regarde jusqu’où va l’axe horizontal : 600 h n’y figure pas. Le premier nombre du couple est toujours l’abscisse."
              solved={pairDone}
              onAnswered={() => setPairDone(true)}
            />
          ),
        },
        {
          num: 6,
          title: 'Ce que la courbe montre d’un coup d’œil',
          done: shapeDone,
          content: (
            <TapQuestion
              prompt="À quel moment le ballon touche-t-il le sol ?"
              options={['À 0 h et à 7 h', 'Seulement à 0 h', 'Jamais', 'À 12 h']}
              correct={0}
              cols={2}
              requires={['lecture-image-graphique', 'point-de-la-courbe']}
              explain="La courbe touche l’axe horizontal deux fois : au départ, et à 7 h. À 12 h elle est encore à 200 m — le vol n’est pas terminé quand le relevé s’arrête."
              explainWrong="Cherche les endroits où la courbe touche l’altitude 0. Il y en a plus d’un."
              solved={shapeDone}
              onAnswered={() => setShapeDone(true)}
            />
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Tu viens de lire une fonction sans jamais la calculer. Au
          module suivant, on retourne la sonde : au lieu de demander « quelle altitude à cette
          heure ? », on demandera « à quelles heures cette altitude ? ».
        </KnowledgeSnapshot>
      )}
    />
  );
}
