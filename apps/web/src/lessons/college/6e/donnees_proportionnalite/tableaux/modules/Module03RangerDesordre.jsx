import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Boxes } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SortingBoard from '../components/SortingBoard';
import DataTable from '../components/DataTable';
import { TOURNOI_DEBUT, FAITS_DEBUT, TOURNOI } from '../components/tournoiData';
import { makeTable } from '../components/tableUtils';

/**
 * Module 3 — MANIPULATION SIGNATURE : « Ranger le désordre ».
 *
 * L'élève prend une information en vrac et la dépose à son croisement. Huit
 * faits, huit croisements : le tableau se construit sous ses doigts, et
 * l'erreur est toujours parlante (« cette case-là, c'est Hugo au relais »).
 *
 * Étape 2 : compléter une case MANQUANTE dont la valeur se déduit d'une
 * information nouvelle — ranger, ce n'est pas seulement recopier.
 *
 * Aha visé : ce n'est pas la grille qui organise, c'est le CROISEMENT. La
 * position porte autant de sens que le nombre.
 */
const APRES_MIDI = makeTable({
  rowHeader: 'Stand',
  colHeaders: ['Matin', 'Après-midi'],
  rowLabels: ['Crêpes', 'Boissons'],
  values: [[24, 31], [18, null]],
  unit: '€',
});

export default function Module03RangerDesordre() {
  const [rangeDone, setRangeDone] = useState(false);
  const [completeDone, setCompleteDone] = useState(false);
  const [senseDone, setSenseDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Ranger le désordre"
      moduleSubtitle="Chaque information à son croisement : construis le tableau du tournoi."
      estimatedTime="12 min"
      brief={{
        tag: '📋 Mission 03',
        title: 'Huit résultats en vrac. Une grille vide. À toi.',
        body: (
          <p>
            Prends une information, puis touche la case où elle doit vivre. Si tu te trompes, on te dira ce que
            la case visée racontait — c'est souvent là que tout s'éclaire.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Range les huit résultats',
          done: rangeDone,
          content: (kit) => (
            <SortingBoard
              initialTable={TOURNOI_DEBUT}
              facts={FAITS_DEBUT}
              react={kit.react}
              solved={rangeDone}
              onSolved={() => setRangeDone(true)}
              tone="emerald"
              caption="Course et relais — range chaque résultat à son croisement"
            />
          ),
        },
        {
          num: 2,
          title: 'Compléter une case manquante',
          done: completeDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                La buvette a noté ses recettes, mais une case est vide. On sait que les boissons ont rapporté{' '}
                <strong>9 € de plus l’après-midi que le matin</strong>.
              </p>
              <DataTable
                table={APRES_MIDI}
                caption="Recettes de la buvette — une case reste à trouver"
                tone="emerald"
                highlight={[{ r: 1, c: 1 }]}
              />
              <TapQuestion
                prompt="Quelle valeur manque dans la case vide ?"
                options={['9 €', '27 €', '31 €']}
                correct={1}
                cols={3}
                explain="Les boissons ont rapporté 18 € le matin, et 9 € de plus l’après-midi : 18 + 9 = 27 €. La case vide se remplit en croisant la ligne « Boissons » et la colonne « Après-midi »."
                explainWrong="9 €, c’est l’écart entre les deux moments, pas la recette. 31 €, c’est la case des crêpes l’après-midi : mauvaise ligne."
                solved={completeDone}
                onAnswered={(ok) => { setCompleteDone(true); if (!ok) kit.react(false); }}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'La position porte le sens',
          done: senseDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                On déplace le 15 de Tom : au lieu de la colonne « Relais », on le pose dans la colonne
                « Course ». Le nombre n'a pas changé.
              </p>
              <TapQuestion
                prompt="Qu’est-ce qui a changé alors ?"
                options={[
                  'Rien du tout : c’est le même nombre',
                  'Le tableau raconte maintenant que Tom a fait 15 à la course — c’est faux',
                  'Le total du tournoi a augmenté',
                ]}
                correct={1}
                cols={1}
                explain="Déplacer un nombre change ce qu’il AFFIRME. Dans un tableau, la position est une information à part entière : ligne + colonne = sens."
                solved={senseDone}
                onAnswered={() => setSenseDone(true)}
              />
              {senseDone && (
                <DataTable table={TOURNOI} caption="Le tableau complet du tournoi, chaque nombre à sa place" tone="emerald" />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <Boxes className="w-6 h-6 mx-auto text-emerald-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Ranger une information, c'est choisir son croisement. Un nombre bien rangé se lit tout seul ; mal
            rangé, il ment.
          </p>
        </motion.div>
      }
    />
  );
}
