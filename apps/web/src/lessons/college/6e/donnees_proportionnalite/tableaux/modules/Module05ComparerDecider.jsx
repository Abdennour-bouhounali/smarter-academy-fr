import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DataTable from '../components/DataTable';
import { TOURNOI, ELEVES, EPREUVES } from '../components/tournoiData';
import { rowTotal, colTotal, bestRow, withCell, parseDec, formatDec } from '../components/tableUtils';

/**
 * Module 5 — FORMALISATION : le tableau sert à COMPARER et à DÉCIDER.
 *
 * Le « À retenir » de la leçon se construit ici, à partir des gestes des
 * modules précédents, autour du contraste central :
 *
 *   comparer DANS une ligne  → les performances d'un élève entre épreuves
 *   comparer DANS une colonne → les élèves sur une même épreuve
 *   comparer les TOTAUX      → le classement général
 *
 * Piège travaillé : Tom détient la meilleure CASE du tableau (15 au relais)
 * mais Inès a le meilleur TOTAL (37). La meilleure cellule n'est pas la
 * meilleure ligne — c'est exactement ce que le tableau permet de voir et que
 * l'œil seul rate.
 *
 * Étape 4 (LP « modifier et interpréter ») : on change UNE donnée et on
 * observe la conséquence sur le classement — les totaux affichés sont
 * recalculés par rowTotal, jamais réécrits à la main.
 */
const TOTALS = ELEVES.map((_, r) => rowTotal(TOURNOI, r));
const WINNER = ELEVES[bestRow(TOURNOI)];        // Inès (37)
const TOM_RELAIS_TOTAL = colTotal(TOURNOI, 2);  // 39

// Scénario « et si » : Hugo marque 12 de plus en précision (9 → 21).
const TOURNOI_MODIFIE = withCell(TOURNOI, 3, 3, 21);
const HUGO_NEW_TOTAL = rowTotal(TOURNOI_MODIFIE, 3); // 43

export default function Module05ComparerDecider() {
  const [ligneDone, setLigneDone] = useState(false);
  const [colonneDone, setColonneDone] = useState(false);
  const [totalDone, setTotalDone] = useState(false);
  const [pieceDone, setPieceDone] = useState(false);
  const [modifDone, setModifDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Comparer et décider"
      moduleSubtitle="Une ligne, une colonne, un total : le tableau fait apparaître le gagnant."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 05',
        title: 'Qui a gagné le tournoi ? La réponse n’est pas celle qu’on croit.',
        body: (
          <p>
            Un tableau ne sert pas seulement à retrouver un nombre : il sert à les <strong>comparer</strong>.
            Selon qu'on lit une ligne, une colonne ou un total, on ne répond pas à la même question.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Comparer dans une ligne',
          done: ligneDone,
          content: (
            <div className="space-y-3">
              <DataTable table={TOURNOI} caption="Tournoi de la 6e B" tone="amber" highlightRow={1} />
              <TapQuestion
                prompt="En suivant la ligne de Tom : dans quelle épreuve est-il le meilleur ?"
                options={EPREUVES}
                correct={2}
                cols={4}
                explain="Sur sa ligne, Tom a 7, 6, 15 et 6. Son meilleur résultat est le relais avec 15 points. Lire une LIGNE, c’est comparer un même élève d’une épreuve à l’autre."
                solved={ligneDone}
                onAnswered={() => setLigneDone(true)}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Comparer dans une colonne',
          done: colonneDone,
          content: (
            <div className="space-y-3">
              <DataTable table={TOURNOI} caption="Tournoi de la 6e B" tone="amber" highlightCol={1} />
              <TapQuestion
                prompt="En descendant la colonne « Saut » : qui saute le mieux ?"
                options={ELEVES}
                correct={2}
                cols={4}
                explain="La colonne Saut contient 8, 6, 10 et 5 : le meilleur est 10, celui d’Inès. Lire une COLONNE, c’est comparer tout le monde sur une même épreuve."
                solved={colonneDone}
                onAnswered={() => setColonneDone(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le total change tout',
          done: totalDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Ajoutons une colonne de totaux : chaque total est la somme d'une ligne entière.
              </p>
              <DataTable table={TOURNOI} caption="Tournoi de la 6e B, avec les totaux par élève" tone="amber" showRowTotals />
              <NumericQuestion
                prompt="Quel est le total de points d’Inès sur les quatre épreuves ?"
                suffix="pts"
                expected={TOTALS[2]}
                parse={parseDec}
                display={formatDec(TOTALS[2])}
                explain={<>9 + 10 + 8 + 10 = <strong>{TOTALS[2]} points</strong>.</>}
                explainFor={(n) =>
                  n === TOTALS[0]
                    ? `${TOTALS[0]}, c’est le total de Léa : une ligne trop haut.`
                    : 'Additionne les quatre nombres de la ligne d’Inès : 9 + 10 + 8 + 10.'
                }
                solved={totalDone}
                onAnswered={() => setTotalDone(true)}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'La meilleure case n’est pas la meilleure ligne',
          done: pieceDone,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={`Tom détient le plus gros score du tableau (15 au relais). Qui remporte pourtant le tournoi ?`}
                options={ELEVES}
                correct={2}
                cols={4}
                correctionLabel={WINNER}
                explain={`${WINNER} gagne avec ${TOTALS[2]} points, alors qu’elle n’a remporté aucune épreuve. Tom, malgré son 15, ne totalise que ${TOTALS[1]} points. Une seule grosse case ne fait pas un classement : c’est le TOTAL de la ligne qui décide.`}
                explainWrong={`Tom a bien la plus grosse cellule du tableau, mais ses autres résultats sont faibles : ${TOTALS[1]} points au total. ${WINNER} l’emporte avec ${TOTALS[2]} points sans jamais gagner d’épreuve.`}
                solved={pieceDone}
                onAnswered={() => setPieceDone(true)}
              />
              {pieceDone && (
                <Feedback tone="info">
                  Voilà pourquoi on range les données : à l'œil nu, on aurait sacré Tom. Le tableau, lui,
                  compare vraiment.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 5,
          title: 'Et si on changeait une donnée ?',
          done: modifDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Après réclamation, le score d'Hugo en précision passe de 9 à <strong>21 points</strong>. Une
                seule case bouge.
              </p>
              <DataTable
                table={TOURNOI_MODIFIE}
                caption="Tournoi après réclamation — une seule case a changé"
                tone="amber"
                showRowTotals
                highlight={[{ r: 3, c: 3 }]}
              />
              <TapQuestion
                prompt="Qui gagne le tournoi maintenant ?"
                options={ELEVES}
                correct={3}
                cols={4}
                explain={`Hugo passe à ${HUGO_NEW_TOTAL} points et prend la tête devant ${WINNER} (${TOTALS[2]}). Modifier UNE cellule peut changer tout un classement : c’est pour ça qu’une donnée fausse dans un tableau est si dangereuse.`}
                explainWrong={`${WINNER} menait avec ${TOTALS[2]} points, mais Hugo atteint désormais ${HUGO_NEW_TOTAL}. Une seule case modifiée a suffi à renverser le classement.`}
                solved={modifDone}
                onAnswered={() => setModifDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-5 text-center space-y-1">
            <p className="text-xs uppercase tracking-wide text-amber-100 font-mono font-bold">À retenir</p>
            <p className="font-mono font-extrabold text-sm sm:text-base">Une LIGNE compare un même sujet</p>
            <p className="font-mono font-extrabold text-sm sm:text-base">Une COLONNE compare une même catégorie</p>
            <p className="font-mono font-extrabold text-sm sm:text-base">Un TOTAL décide du classement</p>
          </div>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Trophy className="w-6 h-6 mx-auto text-amber-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Le relais est l'épreuve où l'on a marqué le plus de points au total ({TOM_RELAIS_TOTAL}) — encore
              une chose qu'aucun paragraphe en vrac ne t'aurait montrée.
            </p>
          </div>
        </motion.div>
      }
    />
  );
}
