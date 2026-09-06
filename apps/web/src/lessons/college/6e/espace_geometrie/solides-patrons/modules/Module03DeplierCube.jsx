import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SolidView from '../components/SolidView';
import PatronGrid from '../components/PatronGrid';
import {
  gridFromArt, gridOf, foldsIntoCube, filledCells, patronHint,
  PATRON_CROIX, PATRON_ESCALIER,
} from '../components/solidesUtils';

/**
 * Module 3 — MANIPULATION, et l'interaction SIGNATURE de la leçon.
 *
 * ACTION          l'élève coche des cases pour dessiner un patron.
 * TRANSFORMATION  le verdict se recalcule à chaque clic, par SIMULATION du
 *                 pliage — jamais par comparaison à une liste mémorisée.
 * SENS MATH.      un patron est une configuration qui se replie ; sa forme
 *                 exacte importe peu, c'est le pliage qui décide.
 * FEEDBACK        le refus est motivé (trop de cases, morceaux séparés, deux
 *                 faces superposées).
 * GÉNÉRALISATION  il existe PLUSIEURS patrons du cube — onze en tout.
 *
 * Le simulateur accepte donc n'importe quel patron valide que l'élève
 * inventerait, y compris ceux auxquels l'auteur n'avait pas pensé.
 */
const VIDE = gridOf(3, 5, Array.from({ length: 3 }, () => Array(5).fill(false)));

export default function Module03DeplierCube() {
  const [grid, setGrid] = useState(VIDE);
  const [libreDone, setLibreDone] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [tries, setTries] = useState(0);
  const [nbDone, setNbDone] = useState(false);

  const result = foldsIntoCube(grid);
  const shown = revealed ? PATRON_CROIX : grid;

  const toggle = (r, c, react) => {
    if (libreDone || revealed) return;
    const cells = grid.cells.map((row) => [...row]);
    cells[r][c] = !cells[r][c];
    const next = gridOf(grid.rows, grid.cols, cells);
    setGrid(next);
    if (foldsIntoCube(next).ok) { react(true); setLibreDone(true); }
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Déplier le cube"
      moduleSubtitle="Ouvre la boîte à plat : voilà son patron."
      estimatedTime="12 min"
      brief={{
        tag: '📋 Mission 03',
        title: 'Un patron, c’est le cube mis à plat.',
        body: (
          <p>
            Coche <strong>6 cases</strong> qui, une fois pliées, formeraient un cube. Le verdict se met à
            jour à chaque clic.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Aplatis le cube sur la table',
          subtitle: 'Coche 6 cases qui, une fois repliées, refermeraient la boîte.',
          done: libreDone,
          content: (kit) => (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-4 items-center">
                <SolidView solide="cube" size={200} ariaLabel="Le cube à obtenir" />
                <PatronGrid
                  grid={shown}
                  onToggle={(r, c) => toggle(r, c, kit.react)}
                  readOnly={libreDone || revealed}
                  ariaLabel="Grille : coche les cases de ton patron"
                />
              </div>

              {(libreDone || revealed) && (
                <>
                  <Feedback tone={revealed ? 'info' : 'ok'}>
                    {revealed && <strong>Pas grave, on te le montre — voici la forme « en croix ». </strong>}
                    Ces 6 cases se replient bien en cube : elles deviennent les 6 faces, sans qu’aucune
                    ne se superpose.
                  </Feedback>
                  {/* Le dépliage vient d'être réussi : c'est l'instant exact
                      où le mot « patron » a du sens, et pas avant. */}
                  <KnowledgeBrick
                    id="patron-solide"
                    variant="new"
                    lead="Ce que tu viens de dessiner a un nom."
                  />
                </>
              )}

              {!libreDone && !revealed && (
                <button
                  type="button"
                  onClick={() => setTries((t) => t + 1)}
                  className="min-h-[44px] inline-flex items-center px-1 text-xs font-mono text-slate-500 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                >
                  Un indice ?
                </button>
              )}
              {tries >= 1 && !libreDone && !revealed && (
                <Feedback tone="info">
                  Essaie une ligne de 4 cases, avec une case au-dessus et une en dessous : la forme
                  d’une croix.
                </Feedback>
              )}

              {tries >= 3 && !libreDone && !revealed && (
                <button
                  type="button"
                  onClick={() => { setRevealed(true); setLibreDone(true); }}
                  className="w-full min-h-[44px] rounded-xl border-2 border-sky-300 bg-sky-50 text-sky-800 font-bold text-sm hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Eye className="w-4 h-4 inline mr-1.5" aria-hidden="true" />
                  Je ne trouve pas — montre-moi
                </button>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Y en a-t-il un seul possible ?',
          done: nbDone,
          content: (
            <div className="space-y-5">
              <TapQuestion
                above={
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-center text-slate-500">Patron en croix</p>
                      <PatronGrid grid={PATRON_CROIX} readOnly showVerdict={false} cellSize={34} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-center text-slate-500">Patron en escalier</p>
                      <PatronGrid grid={PATRON_ESCALIER} readOnly showVerdict={false} cellSize={34} />
                    </div>
                  </div>
                }
                prompt="Ces deux patrons se replient tous les deux en cube. Combien un cube a-t-il de patrons différents ?"
                options={['Onze', 'Un seul', 'Deux']}
                correct={0}
                cols={3}
                requires={['patron-solide', 'face-solide']}
                explain="Le cube a 11 patrons différents. Ce qui compte n’est donc pas la forme du patron, mais le fait qu’il se replie sans superposition."
                explainWrong="Il y en a bien plus qu’un : le cube en a onze. C’est pourquoi on ne les apprend pas par cœur — on vérifie le pliage."
                solved={nbDone}
                onAnswered={() => setNbDone(true)}
              />

              {/* Deux formes différentes acceptées par le simulateur : la
                  généralisation se pose ici, adossée au constat. */}
              {nbDone && (
                <KnowledgeBrick
                  id="onze-patrons"
                  variant="new"
                  lead="Les deux formes ci-dessus se replient toutes les deux : elles ne sont pas les seules."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Tu sais déplier. Au module suivant, tu feras l’inverse — et sans
          simulateur : plier dans ta tête, avant de vérifier.
        </KnowledgeSnapshot>
      }
    />
  );
}
