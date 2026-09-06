import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hammer } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DataTable from '../components/DataTable';
import SortingBoard from '../components/SortingBoard';
import { makeTable, colTotal, parseDec, formatDec } from '../components/tableUtils';

/**
 * Module 6 — ATELIER : construire SON tableau, puis s'en servir.
 *
 * Trois chantiers authentiques, du choix de la structure jusqu'à la décision :
 *
 *  1. CHOISIR la structure : quelles lignes, quelles colonnes ? C'est la
 *     décision que la leçon n'a pas encore fait prendre — jusqu'ici la grille
 *     était toujours fournie.
 *  2. CONSTRUIRE : ranger les relevés météo dans la grille choisie
 *     (réemploi du SortingBoard, mais sur un contexte neuf : le geste doit
 *     transférer).
 *  3. DÉCIDER : un problème de sortie scolaire qui ne se résout qu'en
 *     croisant deux informations du tableau.
 */
const METEO_VIDE = makeTable({
  rowHeader: 'Ville',
  colHeaders: ['Samedi', 'Dimanche'],
  rowLabels: ['Lyon', 'Brest', 'Nice'],
  values: [[null, null], [null, null], [null, null]],
  unit: '°C',
});

const METEO_FAITS = [
  { id: 'm1', row: 'Brest', col: 'Samedi', value: 14, label: 'Brest, samedi : 14 °C' },
  { id: 'm2', row: 'Nice', col: 'Dimanche', value: 24, label: 'Nice, dimanche : 24 °C' },
  { id: 'm3', row: 'Lyon', col: 'Samedi', value: 19, label: 'Lyon, samedi : 19 °C' },
  { id: 'm4', row: 'Brest', col: 'Dimanche', value: 12, label: 'Brest, dimanche : 12 °C' },
  { id: 'm5', row: 'Nice', col: 'Samedi', value: 22, label: 'Nice, samedi : 22 °C' },
  { id: 'm6', row: 'Lyon', col: 'Dimanche', value: 17, label: 'Lyon, dimanche : 17 °C' },
];

const SORTIE = makeTable({
  rowHeader: 'Classe',
  colHeaders: ['Élèves', 'Prix par élève'],
  rowLabels: ['6e A', '6e B', '6e C'],
  values: [[24, 8], [27, 8], [22, 8]],
  unit: null,
});

const TOTAL_ELEVES = colTotal(SORTIE, 0);        // 73
const COUT_6EB = 27 * 8;                          // 216

export default function Module06ConstruireTableau() {
  const [structureDone, setStructureDone] = useState(false);
  const [meteoDone, setMeteoDone] = useState(false);
  const [ecartDone, setEcartDone] = useState(false);
  const [sortieDone, setSortieDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Construire son tableau"
      moduleSubtitle="Trois situations réelles : à toi de choisir lignes, colonnes et en-têtes."
      estimatedTime="13 min"
      brief={{
        tag: '📋 Mission 06',
        title: 'Jusqu’ici la grille t’était donnée. Plus maintenant.',
        body: (
          <p>
            Face à une situation, la première décision est la plus importante : qu'est-ce qui fait les lignes,
            qu'est-ce qui fait les colonnes ? Puis on remplit, et on s'en sert pour trancher.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Choisir la structure',
          done: structureDone,
          content: (
            <div className="space-y-3">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4">
                <p className="text-sm text-slate-700">
                  On relève la température de <strong>trois villes</strong> (Lyon, Brest, Nice) sur{' '}
                  <strong>deux jours</strong> (samedi, dimanche) — soit six relevés.
                </p>
              </div>
              <TapQuestion
                prompt="Quelle structure de tableau convient ?"
                options={[
                  '3 lignes (les villes) et 2 colonnes (les jours)',
                  '6 lignes, une par relevé, et 1 colonne',
                  '1 ligne et 6 colonnes',
                ]}
                correct={0}
                cols={1}
                explain="Les deux « familles » d’information sont les villes et les jours : l’une fait les lignes, l’autre les colonnes, et chaque relevé trouve son croisement. Six lignes ou six colonnes redonneraient une simple liste — exactement le désordre du module 1."
                requires={['ligne-colonne', 'cellule-croisement', 'position-porte-sens']}
                solved={structureDone}
                onAnswered={() => setStructureDone(true)}
              />
              {structureDone && (
                <KnowledgeBrick
                  id="choisir-structure"
                  variant="new"
                  lead="Tu viens de trancher : les villes d’un côté, les jours de l’autre. C’est la première décision de tout tableau."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Remplir la grille',
          done: meteoDone,
          content: (kit) => (
            <SortingBoard
              initialTable={METEO_VIDE}
              facts={METEO_FAITS}
              react={kit.react}
              solved={meteoDone}
              onSolved={() => setMeteoDone(true)}
              tone="emerald"
              caption="Températures du week-end — range chaque relevé"
            />
          ),
        },
        {
          num: 3,
          title: 'S’en servir pour comparer',
          done: ecartDone,
          content: (
            <NumericQuestion
              prompt="Entre samedi et dimanche, de combien de degrés Brest a-t-elle refroidi ?"
              suffix="°C"
              expected={2}
              parse={parseDec}
              display={formatDec(2)}
              explain={<>Brest passe de 14 °C à 12 °C : elle perd <strong>2 °C</strong>. On compare deux cellules d’une même LIGNE.</>}
              explainFor={(n) =>
                n === 12
                  ? '12 °C, c’est la température du dimanche, pas l’écart. L’écart se calcule : 14 − 12.'
                  : n === 5
                  ? '5, c’est l’écart de Nice (22 → 24, soit 2) ou une autre ligne : reste sur la ligne de Brest.'
                  : 'Compare les deux cases de la ligne Brest : 14 puis 12.'
              }
              requires={['choisir-structure', 'comparer-sens-lecture', 'calcul-numerique']}
              solved={ecartDone}
              onAnswered={() => setEcartDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Décider avec un tableau',
          done: sortieDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Le collège organise une sortie. Chaque classe paie 8 € par élève.
              </p>
              <DataTable table={SORTIE} caption="Effectifs et tarif de la sortie" tone="rose" />
              <NumericQuestion
                prompt="Combien la 6e B doit-elle payer en tout ?"
                suffix="€"
                expected={COUT_6EB}
                parse={parseDec}
                display={formatDec(COUT_6EB)}
                explain={<>La 6e B compte 27 élèves à 8 € : 27 × 8 = <strong>{COUT_6EB} €</strong>. Il fallait croiser DEUX cellules de la même ligne.</>}
                explainFor={(n) =>
                  n === 35
                    ? '35, c’est 27 + 8 : on additionne un nombre d’élèves et un prix, deux grandeurs qui ne s’additionnent pas. Ici, chaque élève paie 8 € : on multiplie.'
                    : n === TOTAL_ELEVES
                    ? `${TOTAL_ELEVES}, c’est le nombre total d’élèves des trois classes — mauvaise question, et mauvaise ligne.`
                    : 'Prends la ligne 6e B : 27 élèves, 8 € chacun.'
                }
                requires={['lire-un-croisement', 'comparer-sens-lecture', 'calcul-numerique']}
                solved={sortieDone}
                onAnswered={() => setSortieDone(true)}
              />
              {sortieDone && (
                <Feedback tone="info">
                  Ce problème ne se lit pas dans une seule case : il faut prendre deux informations de la même
                  ligne et les combiner. C'est exactement à ça qu'un tableau sert.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <KnowledgeSnapshot moduleNumber={6}>
            <strong>La suite.</strong> Ta carte est complète : il ne reste qu'à la mettre à l'épreuve sur
            dix questions, dont aucune n'apportera de notion nouvelle.
          </KnowledgeSnapshot>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Hammer className="w-6 h-6 mx-auto text-rose-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Choisir, remplir, lire, décider : tu sais construire un tableau de bout en bout.
            </p>
          </div>
        </motion.div>
      }
    />
  );
}
