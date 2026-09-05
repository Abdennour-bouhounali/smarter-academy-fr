import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CoordGrid from '../components/CoordGrid';
import {
  makeGrid, formatCoords, samePoint, displacement, describeDisplacement, sameRow, sameCol,
} from '../components/reperageUtils';

/**
 * Module 7 — PRACTICE LAB : utiliser les coordonnées pour RÉSOUDRE (P7).
 *
 * Objectif : le repérage cesse d'être un exercice pour devenir un outil.
 * Trois problèmes authentiques sur le plan du parc :
 *   1. croiser deux indices pour trouver un lieu inconnu ;
 *   2. lire une relation entre positions (l'alignement) ;
 *   3. calculer un trajet.
 *
 * Aha : deux informations partielles qui se croisent valent une position
 * exacte — c'est exactement le mécanisme des deux guides du module 3, mais
 * appliqué à un raisonnement.
 *
 * La question 2 sème délibérément « Droites et segments » : trois points de
 * même ordonnée sont ALIGNÉS.
 */
const GRID = makeGrid({ cols: 7, rows: 6, step: 38 });

const PARC = [
  { col: 6, row: 3, emoji: '🎡', label: 'Grande roue' },
  { col: 2, row: 5, emoji: '🍦', label: 'Kiosque' },
  { col: 2, row: 3, emoji: '🎯', label: 'Tir à l’arc' },
  { col: 0, row: 0, emoji: '🚪', label: 'Entrée' },
];

const STANDS = [
  { col: 1, row: 2 },
  { col: 4, row: 2 },
  { col: 7, row: 2 },
];

const CACHE = { col: 5, row: 1 };

export default function Module07MissionsReperage() {
  const [guess, setGuess] = useState(null);
  const [tries, setTries] = useState(0);
  const [cacheDone, setCacheDone] = useState(false);
  const [alignDone, setAlignDone] = useState(false);
  const [trajetDone, setTrajetDone] = useState(false);

  const wrongGuess = guess && !samePoint(guess, CACHE);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Missions de repérage"
      moduleSubtitle="Croise deux indices, compare des positions, calcule un trajet."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 07',
        title: 'Le plan du parc d’aventure.',
        body: (
          <p>
            Trois problèmes à résoudre en te servant des coordonnées — pas en devinant à l’œil.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'La cache secrète',
          subtitle: 'Deux indices se croisent en un seul endroit.',
          done: cacheDone,
          content: (kit) => (
            <div className="space-y-3">
              <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-3.5 space-y-1.5 text-sm text-indigo-900">
                <p className="font-bold">Deux indices :</p>
                <p>• « La cache est 3 pas à droite du tir à l’arc. »</p>
                <p>• « Elle est 2 pas plus bas que le tir à l’arc. »</p>
              </div>

              <CoordGrid
                grid={GRID}
                mode="place"
                point={guess}
                onPointChange={(n) => {
                  if (cacheDone) return;
                  setGuess(n);
                  const ok = samePoint(n, CACHE);
                  kit.react(ok);
                  if (ok) setCacheDone(true);
                  else setTries((t) => t + 1);
                }}
                overlay={PARC}
                ghost={cacheDone ? null : tries >= 3 ? { ...CACHE, label: formatCoords(CACHE) } : null}
                disabled={cacheDone}
                ariaLabel="Plan du parc : pose un point sur la cache secrète"
              />

              {cacheDone && (
                <Feedback tone="ok">
                  La cache est en <strong className="font-mono">{formatCoords(CACHE)}</strong>. Le tir à
                  l’arc est en <span className="font-mono">(2 ; 3)</span> : 3 pas à droite donnent 2 + 3 = 5,
                  et 2 pas plus bas donnent 3 − 2 = 1.
                </Feedback>
              )}

              {!cacheDone && wrongGuess && (
                <Feedback tone="ko">
                  Ton point est en <strong className="font-mono">{formatCoords(guess)}</strong>. Repars du
                  tir à l’arc <span className="font-mono">(2 ; 3)</span> : le premier indice change la
                  première coordonnée, le second change la seconde.
                  {tries >= 3 && (
                    <> La cache est en <strong className="font-mono">{formatCoords(CACHE)}</strong> — pose-la là.</>
                  )}
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Les trois stands',
          done: alignDone,
          content: (
            <TapQuestion
              above={
                <CoordGrid
                  grid={GRID}
                  mode="display"
                  labelledNodes={STANDS.map((s, i) => ({
                    col: s.col,
                    row: s.row,
                    name: ['S₁', 'S₂', 'S₃'][i],
                    color: '#0891b2',
                  }))}
                  showCoordsBadge={false}
                  ariaLabel="Trois stands placés sur le plan"
                />
              }
              prompt={
                <>
                  Trois stands sont en <span className="font-mono">(1 ; 2)</span>,{' '}
                  <span className="font-mono">(4 ; 2)</span> et <span className="font-mono">(7 ; 2)</span>.
                  Que peut-on affirmer avec certitude ?
                </>
              }
              options={[
                'Ils sont alignés sur une même ligne horizontale',
                'Ils forment un triangle',
                'Ils sont alignés sur une même ligne verticale',
              ]}
              correct={0}
              cols={1}
              explain="Les trois ont la MÊME seconde coordonnée (2) : ils sont donc tous à la même hauteur, alignés sur une horizontale. Leur première coordonnée, elle, change."
              explainWrong="Regarde ce qui est commun : la seconde coordonnée vaut 2 pour les trois. C’est elle qui commande la hauteur — donc même hauteur, donc alignés horizontalement."
              solved={alignDone}
              onAnswered={() => setAlignDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Le trajet du gardien',
          done: trajetDone,
          content: (
            <NumericQuestion
              above={
                <CoordGrid
                  grid={GRID}
                  mode="display"
                  overlay={PARC}
                  trail={[
                    { col: 0, row: 0 },
                    { col: 6, row: 0 },
                    { col: 6, row: 3 },
                  ]}
                  showCoordsBadge={false}
                  ariaLabel="Trajet de l’entrée vers la grande roue"
                />
              }
              prompt={
                <>
                  Le gardien va de l’entrée <span className="font-mono">(0 ; 0)</span> à la grande roue{' '}
                  <span className="font-mono">(6 ; 3)</span> en se déplaçant uniquement le long des traits.
                  Combien de pas au minimum ?
                </>
              }
              suffix="pas"
              expected={9}
              explain="6 pas horizontalement + 3 pas verticalement = 9 pas. On additionne les deux écarts."
              explainFor={(n) =>
                n === 18
                  ? 'Tu as multiplié 6 × 3. Un déplacement se compose en additionnant les deux écarts : 6 + 3 = 9.'
                  : n === 6 || n === 3
                    ? 'Tu n’as compté qu’un seul des deux déplacements. Il faut avancer ET monter : 6 + 3 = 9.'
                    : 'De (0 ; 0) à (6 ; 3) : 6 pas vers la droite, puis 3 pas vers le haut, soit 9 pas.'
              }
              solved={trajetDone}
              onAnswered={() => setTrajetDone(true)}
            />
          ),
        },
      ]}
      footer={
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2"
        >
          <Compass className="w-6 h-6 mx-auto text-rose-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Les coordonnées ne servent pas qu’à nommer un point : elles permettent de{' '}
            <strong className="text-white">raisonner</strong> — croiser des indices, comparer des positions,
            calculer un trajet, sans jamais mesurer à l’œil.
          </p>
        </motion.div>
      }
    />
  );
}
