import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid3x3 } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DataTable from '../components/DataTable';
import { TOURNOI } from '../components/tournoiData';
import { cellMeaning } from '../components/tableUtils';

/**
 * Module 2 — DÉCOUVERTE : le vocabulaire arrive APRÈS le geste du module 1.
 *
 * Chaque mot (ligne, colonne, en-tête, cellule) est introduit par une
 * consigne de désignation : l'élève tape une case et lit la conséquence.
 * Le point dur, exercé en fin de module : un nombre seul ne veut rien dire.
 * « 15 » n'est une information que parce qu'il est au croisement Tom × Relais.
 *
 * ATTENTION (playbook §2) : ce module ne dit PAS encore comment ranger des
 * données en vrac — c'est le module 3 qui le fait découvrir par le geste.
 */
const PARTS = [
  { key: 'ligne', emoji: '➡️', label: 'Une ligne', text: 'Tout ce qui concerne UN élève : la ligne d’Inès donne ses quatre scores.' },
  { key: 'colonne', emoji: '⬇️', label: 'Une colonne', text: 'Tout ce qui concerne UNE épreuve : la colonne Saut donne les scores de tout le monde au saut.' },
  { key: 'entete', emoji: '🏷️', label: 'Les en-têtes', text: 'La première ligne et la première colonne ne sont pas des données : elles disent ce que les nombres représentent.' },
  { key: 'cellule', emoji: '▫️', label: 'Une cellule', text: 'Une case unique, au croisement d’une ligne et d’une colonne. C’est là que vit chaque nombre.' },
];

export default function Module02Anatomie() {
  const [visited, setVisited] = useState([]);
  const [designeDone, setDesigneDone] = useState(false);
  const [rolesDone, setRolesDone] = useState(false);
  const [seulDone, setSeulDone] = useState(false);
  const [picked, setPicked] = useState(null);

  const allVisited = visited.length === PARTS.length;
  const meaning = picked ? cellMeaning(TOURNOI, picked.r, picked.c) : null;
  // La cellule DEMANDÉE (Tom × Relais), et non l'avancement de l'étape : le
  // message doit décrire ce que l'élève vient de toucher, à tout instant.
  const cibleTouchee = !!picked && picked.r === 1 && picked.c === 2;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Anatomie d'un tableau"
      moduleSubtitle="Lignes, colonnes, en-têtes, cellules : chaque partie a un rôle précis."
      estimatedTime="9 min"
      brief={{
        tag: '📋 Mission 02',
        title: 'Le tableau t’a sauvé la mise. Maintenant, nomme ses parties.',
        body: (
          <p>
            Quatre mots suffisent pour parler d'un tableau — et pour comprendre pourquoi il range si bien.
            Explore-les, puis mets-les à l'épreuve.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Explore les quatre parties',
          done: allVisited,
          content: (kit) => (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {PARTS.map((p) => {
                  const seen = visited.includes(p.key);
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => {
                        if (seen) return;
                        const next = [...visited, p.key];
                        setVisited(next);
                        kit.react(true);
                      }}
                      aria-pressed={seen}
                      className={`min-h-[44px] px-3 py-3 rounded-xl border-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                        seen ? 'bg-sky-600 border-sky-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-sky-400'
                      }`}
                    >
                      <span aria-hidden="true">{p.emoji}</span> {p.label}
                    </button>
                  );
                })}
              </div>
              <div className="space-y-2">
                {PARTS.filter((p) => visited.includes(p.key)).map((p) => (
                  <Feedback key={p.key} tone="info">
                    <strong>{p.label}</strong> — {p.text}
                  </Feedback>
                ))}
              </div>
              {!allVisited && (
                <p className="text-xs text-slate-500 text-center">
                  {visited.length}/4 explorées — touche les cartes restantes.
                </p>
              )}
              {/* Les trois briques ne paraissent qu'une fois les quatre parties
                  explorées : elles NOMMENT ce que l'élève vient de voir bouger,
                  et elles arrivent avant la première demande de désignation. */}
              {allVisited && (
                <div className="space-y-3">
                  <KnowledgeBrick
                    id="ligne-colonne"
                    variant="new"
                    lead="Tu viens d’explorer deux façons de balayer le tableau : à l’horizontale et à la verticale."
                  />
                  <KnowledgeBrick
                    id="entete"
                    variant="new"
                    lead="Et tu as vu que la bande du haut et celle de gauche ne contiennent aucun résultat."
                  />
                  <KnowledgeBrick
                    id="cellule-croisement"
                    variant="new"
                    lead="Reste la case elle-même, prise entre les deux."
                  />
                </div>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Désigne une cellule',
          done: designeDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Touche la cellule qui donne le score de <strong>Tom</strong> au <strong>relais</strong>.
              </p>
              <DataTable
                table={TOURNOI}
                caption="Tournoi de la 6e B — touche une cellule pour la lire"
                tone="sky"
                /* La grille reste VIVANTE après la bonne réponse : l'élève
                   continue à désigner d'autres cellules et à lire ce qu'elles
                   veulent dire — c'est précisément l'exploration qui installe
                   le croisement (règle projet du 2026-09-06 : un labo ne se
                   fige jamais après validation de l'étape). */
                onCellClick={(r, c) => {
                  setPicked({ r, c });
                  const ok = r === 1 && c === 2;
                  if (!designeDone) {
                    kit.react(ok);
                    if (ok) setDesigneDone(true);
                  }
                }}
                selected={picked}
                highlight={designeDone ? [{ r: 1, c: 2 }] : []}
              />
              {/* Le message décrit la cellule COURANTE, pas l'état de l'étape :
                  une fois la bonne trouvée, l'élève peut continuer à en
                  désigner d'autres et lire à chaque fois ce qu'elles disent. */}
              {meaning && (
                <Feedback tone={cibleTouchee ? 'ok' : designeDone ? 'info' : 'ko'}>
                  Tu as touché : <strong>{meaning.text}</strong>.{' '}
                  {cibleTouchee
                    ? 'C’est bien la cellule demandée : ligne Tom, colonne Relais.'
                    : designeDone
                    ? 'Chaque case dit ce que son nom de gauche et sa bande du haut annoncent. Continue à en toucher d’autres.'
                    : 'Ce n’est pas celle demandée. Suis la ligne de Tom, puis descends jusqu’à la colonne Relais — la cellule cherchée est à leur croisement.'}
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Chaque partie, son rôle',
          done: rolesDone,
          content: (
            <BatchChoiceQuestion
              intro={<p className="text-sm text-slate-600">Pour chaque description, choisis le mot qui convient.</p>}
              rows={[
                { id: 'r1', label: 'Les quatre scores d’Inès', options: ['Une ligne', 'Une colonne'], correct: 0 },
                { id: 'r2', label: 'Les scores de tout le monde au saut', options: ['Une ligne', 'Une colonne'], correct: 1 },
                { id: 'r3', label: '« Précision », tout en haut', options: ['Un en-tête', 'Une cellule'], correct: 0 },
                { id: 'r4', label: 'Le nombre 15, tout seul dans sa case', options: ['Un en-tête', 'Une cellule'], correct: 1 },
              ]}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {nCorrect}/{total}. Les <strong>lignes</strong> suivent un élève, les <strong>colonnes</strong>{' '}
                  suivent une épreuve, les <strong>en-têtes</strong> disent ce que les nombres représentent, et
                  chaque nombre vit dans une <strong>cellule</strong>.
                </Feedback>
              )}
              requires={['ligne-colonne', 'entete', 'cellule-croisement']}
              solved={rolesDone}
              onAnswered={() => setRolesDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Un nombre tout seul',
          done: seulDone,
          content: (
            <TapQuestion
              prompt="On efface les en-têtes et il ne reste que le nombre 15 dans une case. Que sait-on ?"
              options={[
                'Que c’est le score de Tom au relais',
                'Rien : sans en-têtes, on ignore ce que 15 représente',
                'Que c’est le meilleur score du tournoi',
              ]}
              correct={1}
              cols={1}
              explain="Un nombre ne devient une information qu’au croisement d’une ligne et d’une colonne NOMMÉES. Sans en-têtes, 15 pourrait être des points, des euros ou des kilomètres — on ne peut rien en dire."
              requires={['entete', 'cellule-croisement']}
              solved={seulDone}
              onAnswered={() => setSeulDone(true)}
            />
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <KnowledgeSnapshot moduleNumber={2}>
            <strong>La suite.</strong> Tu sais nommer chaque partie du tableau. Au prochain module, c'est
            toi qui rangeras l'information à son croisement.
          </KnowledgeSnapshot>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Grid3x3 className="w-6 h-6 mx-auto text-sky-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Quatre mots, et le tableau devient descriptible à voix haute.
            </p>
          </div>
        </motion.div>
      }
    />
  );
}
