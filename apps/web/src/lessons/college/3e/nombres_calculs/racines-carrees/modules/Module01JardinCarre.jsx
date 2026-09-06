import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SquareLab from '../components/SquareLab';
import { formatDec, approxRoot, formatSqrt, bracket } from '../components/rootUtils';

/**
 * Module 1 — DÉCLENCHEUR : « Le jardin carré ».
 *
 * Activity: un jardin carré doit couvrir 49 m² ; l'élève redimensionne le
 *   carré jusqu'à ce que l'aire tombe exactement sur 49, puis recommence
 *   avec 50 m².
 * Mathematical objective: faire vivre le problème INVERSE du carré — on
 *   connaît l'aire, on cherche le côté — avant de le nommer.
 * Student action: tirer le coin du carré, ou −/+ (pas 0,1), ou une puce.
 * Controlled variable: le côté, au dixième.
 * Mathematical state: le côté c ; aire = c² dérivée.
 * Visual consequence: le carré cible en pointillés reste derrière ; le carré
 *   courant passe au vert quand l'aire tombe pile.
 * Expected observation: pour 49, le côté 7 tombe pile. Pour 50, aucun côté
 *   entier ni au dixième ne tombe pile — c'est le déclencheur.
 * Misconception targeted: « le côté, c'est l'aire divisée par 2 » (49 → 24,5)
 *   et « il y a toujours un nombre entier qui marche ».
 * Feedback: l'écart d'aire est chiffré à chaque essai.
 * Formalization: AUCUNE dans ce module — le mot « racine carrée » n'est
 *   posé qu'à la fin, comme nom de ce qu'on vient de chercher.
 * Scaffolding: après 3 essais, « montre-moi » place le côté sur 7.
 * Transfer: le module 3 reprend le même laboratoire sur une aire de 20.
 */
const AREA_A = 49;
const AREA_B = 50;

export default function Module01JardinCarre() {
  const [sideA, setSideA] = useState(4);
  const [triesA, setTriesA] = useState(0);
  const [revealedA, setRevealedA] = useState(false);

  const [sideB, setSideB] = useState(7);
  const [seenB, setSeenB] = useState(new Set());
  const [nameDone, setNameDone] = useState(false);

  const areaA = Math.round(sideA * sideA * 100) / 100;
  const doneA = areaA === AREA_A;

  const areaB = Math.round(sideB * sideB * 100) / 100;
  // Objectif MATHÉMATIQUE de l'étape 2 : avoir constaté l'échec des deux
  // côtés qui « devraient » marcher (7 : trop petit ; 7,1 : trop grand).
  const doneB = seenB.has(7) && seenB.has(7.1);

  const handleA = (next) => {
    setSideA(next);
    setTriesA((t) => t + 1);
  };

  const handleB = (next) => {
    setSideB(next);
    const a = Math.round(next * next * 100) / 100;
    if (a !== AREA_B) setSeenB((s) => new Set(s).add(next));
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le jardin carré"
      moduleSubtitle="On connaît l’aire. Reste à trouver le côté."
      estimatedTime="8 min"
      brief={{
        tag: '🌱 Mission 01',
        title: 'Un jardin carré de 49 m². Quelle clôture commander ?',
        body: (
          <p>
            Le jardinier connaît l’<strong>aire</strong> du terrain, pas son <strong>côté</strong>. Ajuste le
            carré jusqu’à ce que son aire tombe exactement sur 49 m² — c’est cette longueur qu’il faut
            commander.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Trouve le côté du jardin de 49 m²',
          subtitle: 'Tire le coin, ou tape une puce.',
          done: doneA,
          content: (kit) => (
            <div className="space-y-3">
              <SquareLab
                mode="reverse"
                side={sideA}
                onChange={handleA}
                targetArea={AREA_A}
                maxSide={10}
                unit="m"
                label="Jardin carré, aire visée 49 m²"
              />

              {!doneA && (
                <Feedback tone="info">
                  Un côté de <strong className="font-mono">{formatDec(sideA)} m</strong> donne une aire de{' '}
                  <strong className="font-mono">{formatDec(areaA)} m²</strong>
                  {areaA < AREA_A
                    ? <> : il manque <strong className="font-mono">{formatDec(Math.round((AREA_A - areaA) * 100) / 100)} m²</strong>.</>
                    : <> : on dépasse de <strong className="font-mono">{formatDec(Math.round((areaA - AREA_A) * 100) / 100)} m²</strong>.</>}
                  {' '}Le côté n’est pas la moitié de l’aire : on cherche le nombre qui, multiplié{' '}
                  <em>par lui-même</em>, donne 49.
                </Feedback>
              )}

              {!doneA && triesA >= 3 && (
                <button
                  type="button"
                  onClick={() => { setSideA(7); setRevealedA(true); kit.react(false); }}
                  className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Je ne trouve pas — montre-moi
                </button>
              )}

              {doneA && (
                <Feedback tone="ok">
                  <MathText>{'$7 \\times 7 = 49$'}</MathText> : le côté du jardin mesure{' '}
                  <strong>7 m</strong>. On a fait le chemin inverse du carré — de l’aire vers le côté.
                  {revealedA && ' (Il t’a été montré — bouge autour de 7 pour voir l’aire s’en éloigner.)'}
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le voisin veut 50 m². Même jeu.',
          subtitle: 'Essaie 7, puis 7,1. Puis regarde.',
          done: doneB,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Un mètre carré de plus, ça ne change pas grand-chose… ou si ? Cherche un côté dont l’aire
                fait exactement <strong>50 m²</strong>.
              </p>

              <SquareLab
                mode="reverse"
                side={sideB}
                onChange={handleB}
                targetArea={AREA_B}
                maxSide={10}
                unit="m"
                showLine={false}
                label="Jardin carré, aire visée 50 m²"
              />

              {!doneB && (
                <Feedback tone="info">
                  <strong className="font-mono">{formatDec(sideB)} m</strong> → aire{' '}
                  <strong className="font-mono">{formatDec(areaB)} m²</strong>
                  {areaB < AREA_B ? ' (trop petit)' : areaB > AREA_B ? ' (trop grand)' : ''}.
                  {!seenB.has(7) && ' Essaie d’abord 7.'}
                  {seenB.has(7) && !seenB.has(7.1) && ' Maintenant 7,1 : le côté juste au-dessus.'}
                </Feedback>
              )}

              {doneB && (
                <Feedback tone="ok">
                  <p>
                    <MathText>{'$7^{2} = 49$'}</MathText> — trop petit d’1 m².{' '}
                    <MathText>{'$7{,}1^{2} = 50{,}41$'}</MathText> — trop grand de 0,41 m². On saute
                    par-dessus 50 <strong>sans jamais tomber dessus</strong>.
                  </p>
                </Feedback>
              )}

              {doneB && (
                <KnowledgeBrick
                  id="racine-existe-toujours"
                  variant="new"
                  compact
                  lead="Le jardin du voisin existe pourtant : c’est un vrai terrain, avec un vrai côté."
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'On lui donne enfin un nom',
          done: nameDone,
          content: (
            <div className="space-y-4">
              <KnowledgeBrick
                id="racine-carree"
                variant="new"
                lead="Tu as cherché deux fois la même chose : le côté, à partir de l’aire. Ce nombre a un nom et un symbole."
              >
              <TapQuestion
                prompt={
                  <>
                    Un carré a une aire de <strong>36 cm²</strong>. Quel est son côté ?
                  </>
                }
                options={['$18 \\text{ cm}$', '$6 \\text{ cm}$', '$1296 \\text{ cm}$']}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['18 cm', '6 cm', '1296 cm'][i]}
                correctionLabel="6 cm"
                cols={3}
                correct={1}
                explain={
                  <>
                    <MathText>{'$6 \\times 6 = 36$'}</MathText>, donc{' '}
                    <MathText>{'$\\sqrt{36} = 6$'}</MathText>. Le côté d’un carré, c’est la racine carrée
                    de son aire.
                  </>
                }
                explainWrong={
                  <>
                    18, c’est 36 ÷ 2 : la moitié, pas la racine — un carré de côté 18 aurait une aire de
                    324 cm². 1296, c’est <MathText>{'$36^{2}$'}</MathText> : le carré de l’aire, pas sa
                    racine. On cherche le nombre qui, multiplié <em>par lui-même</em>, donne 36 : c’est 6.
                  </>
                }
                requires={['racine-carree']}
                solved={nameDone}
                onAnswered={() => setNameDone(true)}
              />
              </KnowledgeBrick>

              <Feedback tone="info">
                Le jardin du voisin a donc pour côté{' '}
                <MathText>{`$${formatSqrt(AREA_B)}$`}</MathText> mètres — un nombre compris entre{' '}
                {bracket(AREA_B)[0]} et {bracket(AREA_B)[1]} (≈ {formatDec(approxRoot(AREA_B, 2))}).
              </Feedback>
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          Parfois la racine tombe juste (49 → 7), parfois non (50). Le module suivant range les cas qui
          tombent juste.
        </KnowledgeSnapshot>
      )}
    />
  );
}
