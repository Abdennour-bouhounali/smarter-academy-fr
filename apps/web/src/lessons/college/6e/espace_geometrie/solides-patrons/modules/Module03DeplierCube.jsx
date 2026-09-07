import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SolidView from '../components/SolidView';
import PatronGrid from '../components/PatronGrid';
import FoldLab from '../components/FoldLab';
import {
  gridFromArt, gridOf, foldsIntoCube, filledCells, patronHint,
  PATRON_CROIX, PATRON_ESCALIER, PATRON_IMPOSSIBLE,
} from '../components/solidesUtils';

/**
 * Module 3 — MANIPULATION, et l'interaction SIGNATURE de la leçon.
 *
 * ACTION          l'élève coche des cases pour dessiner un patron, PUIS il
 *                 saisit la figure et la replie à la main (FoldLab).
 * TRANSFORMATION  le verdict se recalcule à chaque clic, par SIMULATION du
 *                 pliage — jamais par comparaison à une liste mémorisée — et
 *                 le pliage lui-même devient visible : les six faces se
 *                 relèvent, ou se chevauchent.
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

/* La surprise contrôlée : deux patrons de 6 cases, d'un seul morceau, très
   semblables à l'œil — et un seul se referme. Le verdict n'est écrit nulle
   part : c'est `foldsIntoCube`, donc la simulation du pliage, qui décide.
   PATRON_IMPOSSIBLE (2 × 3) échoue par superposition ; le « T » à côté est
   un patron valide du cube. */
const PATRON_T = gridFromArt([
  '.#..',
  '###.',
  '.#..',
  '.#..',
]);

const PIEGE = [
  { id: 'a', label: 'Patron A', grid: PATRON_IMPOSSIBLE },
  { id: 'b', label: 'Patron B', grid: PATRON_T },
];

export default function Module03DeplierCube() {
  const [grid, setGrid] = useState(VIDE);
  const [libreDone, setLibreDone] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [tries, setTries] = useState(0);
  const [nbDone, setNbDone] = useState(false);
  /* Le taux de pliage : 0 = à plat, 1 = refermé. C'est LE geste de la
     leçon, et il reste disponible en permanence. */
  const [t, setT] = useState(0);
  const [plieDone, setPlieDone] = useState(false);
  /* Le piège : chaque patron a son propre taux de pliage, et l'étape est
     acquise quand les DEUX ont été repliés jusqu'au bout — donc quand
     l'élève a vu l'un fermer et l'autre se superposer. */
  const [tPiege, setTPiege] = useState({ a: 0, b: 0 });
  const [plies, setPlies] = useState([]);
  const pieegeDone = plies.length >= 2;

  const result = foldsIntoCube(grid);
  const shown = revealed ? PATRON_CROIX : grid;

  /* La grille reste modifiable APRÈS la réussite : c'est en changeant une
     case et en repliant que l'élève voit un patron valide devenir
     impossible. Seule la complétion cesse d'être re-déclenchée. */
  const toggle = (r, c, react) => {
    if (revealed) return;
    const cells = grid.cells.map((row) => [...row]);
    cells[r][c] = !cells[r][c];
    const next = gridOf(grid.rows, grid.cols, cells);
    setGrid(next);
    // Modifier le patron rouvre la boîte : on ne garde pas un pliage qui
    // ne correspondrait plus à la figure affichée.
    setT(0);
    if (!libreDone && foldsIntoCube(next).ok) { react(true); setLibreDone(true); }
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
                  readOnly={revealed}
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
          title: 'Referme la boîte',
          subtitle: 'Attrape la figure et tire : les six faces se relèvent.',
          done: plieDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Voici ton patron. Replie-le entièrement — puis rouvre-le, et recommence autant que
                tu veux.
              </p>

              {/* LE geste de la leçon : le taux de pliage est continu et
                  c'est l'élève qui le pilote, en saisissant la figure. */}
              <FoldLab
                grid={shown}
                t={t}
                onTChange={(v) => {
                  setT(v);
                  if (!plieDone && v >= 0.98) { kit.react?.(true); setPlieDone(true); }
                }}
                ariaLabel="Ton patron, à replier en cube"
              />

              {plieDone && (
                <Feedback tone="ok">
                  La boîte s’est refermée : chaque case est devenue une face, et il n’en manquait
                  aucune. Rouvre-la, décoche une case, et replie — tu verras la boîte refuser de
                  fermer.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Deux patrons qui se ressemblent',
          subtitle: 'Un seul des deux se referme. Lequel ?',
          done: pieegeDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Ces deux patrons ont tous les deux <strong>6 cases</strong> et se tiennent d’un seul
                morceau. Replie-les l’un après l’autre.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {PIEGE.map((cas) => (
                  <div key={cas.id} className="space-y-1.5">
                    <p className="text-xs font-mono text-center text-slate-500">{cas.label}</p>
                    <FoldLab
                      grid={cas.grid}
                      t={tPiege[cas.id]}
                      onTChange={(v) => {
                        setTPiege((prev) => ({ ...prev, [cas.id]: v }));
                        if (v >= 0.98) {
                          setPlies((prev) => (prev.includes(cas.id) ? prev : [...prev, cas.id]));
                        }
                      }}
                      cell={28}
                      ariaLabel={`${cas.label} : replie-le pour voir s’il ferme`}
                    />
                  </div>
                ))}
              </div>

              {!pieegeDone && (
                <Feedback tone="info">
                  Replie les <strong>deux</strong> patrons jusqu’au bout ({plies.length} / 2 fait).
                </Feedback>
              )}

              {pieegeDone && (
                <>
                  <Feedback tone="ok">
                    Même nombre de cases, même allure — et pourtant l’un se referme, l’autre non :
                    deux de ses cases réclament la <strong>même face</strong> du cube et se
                    chevauchent (elles passent au rouge), pendant qu’une face reste à découvert.
                    C’est le pliage qui tranche, jamais la ressemblance.
                  </Feedback>
                  {/* Volontairement AUCUNE brique ici : le module 4 est celui
                      qui nomme le critère d'impossibilité (`patron-impossible`
                      y est déclaré). Le module 3 se contente de faire VOIR le
                      phénomène — le nommer ici le dédoublerait et l'audit
                      l'attribuerait au mauvais module. */}
                </>
              )}
            </div>
          ),
        },
        {
          num: 4,
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
