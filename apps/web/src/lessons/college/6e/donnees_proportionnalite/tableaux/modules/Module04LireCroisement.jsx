import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crosshair } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DataTable from '../components/DataTable';
import { TOURNOI, ELEVES } from '../components/tournoiData';
import { cellValue, makeTable, parseDec, formatDec } from '../components/tableUtils';

/**
 * Module 4 — DÉCOUVERTE : lire SANS se tromper de ligne.
 *
 * Le piège n°1 des tableaux à double entrée n'est pas de ne pas savoir lire,
 * c'est de glisser d'une ligne à l'autre. Le module l'attaque de front :
 *
 *  1. lecture guidée : la ligne et la colonne visées sont surlignées, on
 *     voit physiquement le croisement se former ;
 *  2. lecture libre, avec des distracteurs qui sont TOUS des cases voisines
 *     réelles du tableau (la ligne du dessous, la colonne d'à côté) ;
 *  3. lecture inverse : on donne la valeur, l'élève retrouve QUI et QUOI ;
 *  4. un horaire de bus — un tableau à double entrée d'un autre monde.
 */
const LEA_PRECISION = cellValue(TOURNOI, 0, 3);   // 7
const INES_SAUT = cellValue(TOURNOI, 2, 1);       // 10

const BUS = makeTable({
  rowHeader: 'Arrêt',
  colHeaders: ['Bus 1', 'Bus 2', 'Bus 3'],
  rowLabels: ['Gare', 'Marché', 'Collège'],
  values: [[7, 9, 12], [12, 14, 17], [20, 22, 25]],
  unit: 'h',
});

export default function Module04LireCroisement() {
  const [guideDone, setGuideDone] = useState(false);
  const [libreDone, setLibreDone] = useState(false);
  const [inverseDone, setInverseDone] = useState(false);
  const [busDone, setBusDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Lire le bon croisement"
      moduleSubtitle="Le piège n°1 : suivre la bonne ligne jusqu’à la bonne colonne."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 04',
        title: 'Une ligne de décalage, et tu lis la vie de quelqu’un d’autre.',
        body: (
          <p>
            Lire un tableau, ce n'est pas repérer un nombre : c'est tenir une ligne ET une colonne en même
            temps. Entraîne l'œil, puis lâche les repères.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Lecture guidée',
          done: guideDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                La ligne de <strong>Léa</strong> et la colonne <strong>Précision</strong> sont éclairées : leur
                croisement est la valeur cherchée.
              </p>
              <DataTable
                table={TOURNOI}
                caption="Tournoi de la 6e B — ligne et colonne éclairées"
                tone="violet"
                highlightRow={0}
                highlightCol={3}
                highlight={guideDone ? [{ r: 0, c: 3 }] : []}
              />
              <NumericQuestion
                prompt="Combien Léa a-t-elle marqué en précision ?"
                suffix="pts"
                expected={LEA_PRECISION}
                parse={parseDec}
                display={formatDec(LEA_PRECISION)}
                explain={<>Ligne Léa, colonne Précision : <strong>{LEA_PRECISION} points</strong>.</>}
                explainFor={(n) =>
                  n === 10
                    ? '10, c’est la précision d’Inès (une ligne plus bas) — ou le saut d’Inès. Reste bien sur la ligne de Léa.'
                    : n === 9
                    ? '9, c’est le relais de Léa : bonne ligne, mais une colonne trop à gauche.'
                    : 'Suis la ligne de Léa jusqu’à la dernière colonne, celle de la précision.'
                }
                solved={guideDone}
                onAnswered={() => setGuideDone(true)}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Sans les repères',
          done: libreDone,
          content: (
            <div className="space-y-3">
              <DataTable table={TOURNOI} caption="Tournoi de la 6e B" tone="violet" />
              <TapQuestion
                prompt="Combien Inès a-t-elle marqué au saut ?"
                options={['8 points', `${INES_SAUT} points`, '6 points']}
                correct={1}
                cols={3}
                explain={`Ligne Inès, colonne Saut : ${INES_SAUT} points.`}
                explainWrong="8, c’est le saut de Léa (une ligne au-dessus) ; 6, celui de Tom. Ces deux erreurs viennent du même geste : glisser de ligne."
                solved={libreDone}
                onAnswered={() => setLibreDone(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Lecture inverse',
          done: inverseDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    Cette fois on te donne le nombre : à toi de dire de <strong>qui</strong> il s'agit.
                  </p>
                  <DataTable table={TOURNOI} caption="Tournoi de la 6e B" tone="violet" />
                </div>
              }
              rows={[
                { id: 'i1', label: '15 points au relais', options: ELEVES, correct: 1 },
                { id: 'i2', label: '5 points au saut', options: ELEVES, correct: 3 },
                { id: 'i3', label: '12 points à la course', options: ELEVES, correct: 0 },
              ]}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {nCorrect}/{total}. Pour remonter d'un nombre à son propriétaire, on part de la case et on
                  relit son en-tête de ligne : c'est le même croisement, parcouru à l'envers.
                </Feedback>
              )}
              solved={inverseDone}
              onAnswered={() => setInverseDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Transfert : les horaires de bus',
          done: busDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Un tableau à double entrée d'un tout autre monde — mais le geste est identique.
              </p>
              <DataTable table={BUS} caption="Horaires : heure de passage à chaque arrêt" tone="violet" />
              <TapQuestion
                prompt="À quelle heure le Bus 2 passe-t-il au Marché ?"
                options={['12 h', '14 h', '17 h']}
                correct={1}
                cols={3}
                explain="Ligne Marché, colonne Bus 2 : 14 h. Ici les lignes sont des lieux et les colonnes des bus — mais on croise exactement de la même façon."
                explainWrong="12 h, c’est le Bus 1 au Marché (colonne d’à côté) ; 17 h, le Bus 3. La ligne était bonne, pas la colonne."
                solved={busDone}
                onAnswered={() => setBusDone(true)}
              />
              {busDone && (
                <Feedback tone="info">
                  Scores, horaires, prix, températures : dès qu'il y a deux entrées, on lit toujours pareil —
                  une ligne, une colonne, un croisement.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <Crosshair className="w-6 h-6 mx-auto text-violet-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Un doigt sur la ligne, un doigt sur la colonne : là où ils se rejoignent, c'est la réponse — et
            nulle part ailleurs.
          </p>
        </motion.div>
      }
    />
  );
}
