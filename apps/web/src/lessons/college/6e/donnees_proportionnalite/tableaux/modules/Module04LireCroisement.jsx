import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crosshair } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
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
              {/* La procédure est POSÉE ici, pendant que les deux bandes
                  éclairées la rendent évidente — et avant la première
                  demande de lecture. Elle ne vivait jusqu'ici que dans des
                  `explainFor`, c'est-à-dire après la réponse. */}
              <KnowledgeBrick
                id="lire-un-croisement"
                variant="new"
                lead="Regarde les deux bandes éclairées : elles ne se rencontrent qu’en un seul endroit."
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
                requires={['lire-un-croisement', 'ligne-colonne', 'entete']}
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
                requires={['lire-un-croisement']}
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
                  {/* Le sens inverse est une méthode à part : elle est posée
                      au-dessus de la question, pas expliquée après coup. */}
                  <KnowledgeBrick
                    id="lecture-inverse"
                    variant="new"
                    lead="Le croisement se parcourt aussi à l’envers : d’une case vers les mots qui l’encadrent."
                  />
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
              requires={['lecture-inverse', 'entete']}
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
              {/* Le nom de la famille de tableaux est posé AVANT le transfert :
                  l'élève a croisé quatre fois, il peut recevoir le mot. */}
              <KnowledgeBrick
                id="mem-double-entree"
                variant="new"
                lead="Tu viens de croiser quatre fois, dans les deux sens. Ce que tu sais faire porte un nom."
              />
              <p className="text-sm text-slate-600">
                En voici un d'un tout autre monde — les lignes sont des lieux, les colonnes des bus. Le geste,
                lui, ne change pas.
              </p>
              <DataTable table={BUS} caption="Horaires : heure de passage à chaque arrêt" tone="violet" />
              <TapQuestion
                prompt="À quelle heure le Bus 2 passe-t-il au Marché ?"
                options={['12 h', '14 h', '17 h']}
                correct={1}
                cols={3}
                explain="Ligne Marché, colonne Bus 2 : 14 h. Ici les lignes sont des lieux et les colonnes des bus — mais on croise exactement de la même façon."
                explainWrong="12 h, c’est le Bus 1 au Marché (colonne d’à côté) ; 17 h, le Bus 3. La ligne était bonne, pas la colonne."
                requires={['lire-un-croisement', 'mem-double-entree']}
                solved={busDone}
                onAnswered={() => setBusDone(true)}
              />
              {busDone && (
                <Feedback tone="info">
                  Des scores, puis des horaires : le geste n'a pas changé d'un pouce en changeant de monde.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <KnowledgeSnapshot moduleNumber={4}>
            <strong>La suite.</strong> Tu lis une case sans te tromper. Le module suivant ne cherche plus
            un nombre : il les compare, et fait apparaître un gagnant.
          </KnowledgeSnapshot>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Crosshair className="w-6 h-6 mx-auto text-violet-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Quatre lectures, quatre réussites — et pas une seule ligne de décalage.
            </p>
          </div>
        </motion.div>
      }
    />
  );
}
