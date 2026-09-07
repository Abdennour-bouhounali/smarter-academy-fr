import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ListRestart } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DropGrid from '../components/DropGrid';
import { ELEVES } from '../components/tournoiData';
import { makeTable } from '../components/tableUtils';

/**
 * Module 1 — LABORATOIRE : « le rangement, c'est toi qui le construis ».
 *
 * Activity: l'élève cherche une information dans un paragraphe en vrac (et
 *   peine), puis il RANGE lui-même ces mêmes données en les faisant glisser
 *   au croisement d'une ligne et d'une colonne. La même question devient
 *   alors immédiate — sur un tableau qu'il a bâti de ses mains.
 * Mathematical objective: comprendre à quoi sert un tableau (LP P1), non
 *   parce qu'on le lui dit, mais parce qu'il a vécu les deux états.
 * Student action: glisser une étiquette du vrac jusqu'à une case.
 * Mathematical state: un `TableModel` unique ; la grille, le compteur de
 *   données restantes et l'état « terminé » en dérivent tous.
 * Expected observation: pendant qu'on tient une donnée, sa ligne et sa
 *   colonne s'allument — et elles ne se croisent qu'en UN point. Poser
 *   ailleurs est refusé, et le refus dit lequel des deux repères est faux.
 * Misconception targeted: « un tableau, c'est de la mise en page ». Non :
 *   la POSITION est ce qui porte le sens, et c'est l'élève qui la choisit.
 * Controlled surprise (étape 3) : la même valeur, 9, se trouve deux fois
 *   dans le tableau construit — mais à deux croisements différents, elle ne
 *   dit pas du tout la même chose. Un nombre seul ne veut rien dire.
 * Formalization: aucune ici. Les mots ligne / colonne / en-tête / cellule
 *   sont posés au module 2 ; ce module ne pose que `tableau-outil`, après le
 *   geste.
 *
 * REFONTE DU 2026-09-07 (« deep WOW »). L'ancienne version était trois
 * TapQuestion : chercher dans un paragraphe, relire la réponse dans un
 * tableau DÉJÀ FAIT, puis dire à quoi sert un tableau. L'élève ne rangeait
 * rien — le tableau lui tombait dessus tout construit, et la seule chose
 * qu'il produisait était un clic. Le rangement est maintenant son œuvre.
 *
 * RÈGLE PROJET : la grille n'est jamais figée après validation d'une étape ;
 * elle reste visible et complète pour les étapes suivantes.
 */

/* Le vrac : exactement les mêmes huit résultats que la grille à construire,
   noyés dans des phrases. C'est la difficulté de LECTURE qui crée le besoin,
   pas la difficulté des nombres. */
const VRAC = `Au tournoi de la 6e B : Léa a marqué 12 points à la course, Tom 7 à la course,
Inès 9 à la course et Hugo 10 à la course. Au relais, Tom a fait 15, Léa 9,
Hugo 7 et Inès 8.`;

/* La grille vide et les huit données en vrac : les mêmes nombres que le
   paragraphe, à ceci près qu'ils sont maintenant SAISISSABLES. */
const GRILLE = makeTable({
  rowHeader: 'Élève',
  colHeaders: ['Course', 'Relais'],
  rowLabels: ELEVES,
  values: ELEVES.map(() => [null, null]),
  unit: 'pts',
});

const DONNEES = [
  { id: 'd1', row: 'Tom', col: 'Relais', value: 15, label: 'Tom · Relais · 15' },
  { id: 'd2', row: 'Léa', col: 'Course', value: 12, label: 'Léa · Course · 12' },
  { id: 'd3', row: 'Hugo', col: 'Relais', value: 7, label: 'Hugo · Relais · 7' },
  { id: 'd4', row: 'Inès', col: 'Course', value: 9, label: 'Inès · Course · 9' },
  { id: 'd5', row: 'Léa', col: 'Relais', value: 9, label: 'Léa · Relais · 9' },
  { id: 'd6', row: 'Tom', col: 'Course', value: 7, label: 'Tom · Course · 7' },
  { id: 'd7', row: 'Inès', col: 'Relais', value: 8, label: 'Inès · Relais · 8' },
  { id: 'd8', row: 'Hugo', col: 'Course', value: 10, label: 'Hugo · Course · 10' },
];

export default function Module01MessageEnVrac() {
  const [vracDone, setVracDone] = useState(false);
  const [pred, setPred] = useState(null);
  const [rangeDone, setRangeDone] = useState(false);
  const [memeDone, setMemeDone] = useState(false);
  const [verdictDone, setVerdictDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le message en vrac"
      moduleSubtitle="Huit résultats jetés en désordre. Range-les toi-même, et vois ce que ça change."
      estimatedTime="9 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Le prof a tout noté au fil de l’eau. Bon courage.',
        body: (
          <p>
            Les résultats du tournoi existent : ils sont tous là, dans un paragraphe. Cherche-en un —
            puis tu <strong className="text-white">rangeras</strong> les huit de tes propres mains.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Cherche dans le paragraphe',
          done: vracDone,
          content: (
            <div className="space-y-3">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{VRAC}</p>
              </div>
              <TapQuestion
                prompt="Combien de points Hugo a-t-il marqués au relais ?"
                options={['5 points', '7 points', '10 points']}
                correct={1}
                cols={3}
                explain="Hugo a marqué 7 points au relais. Pour le trouver, il fallait retenir « Hugo » ET « relais » en balayant tout le texte — l’information est là, mais elle se cache."
                explainWrong="10, c’est la course d’Hugo. Deux nombres pour un même élève, éparpillés dans deux phrases différentes : voilà le problème."
                requires={['lecture-information']}
                solved={vracDone}
                onAnswered={() => setVracDone(true)}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Range-les toi-même',
          subtitle: 'Prends une étiquette et pose-la au croisement de son nom et de son épreuve.',
          done: rangeDone,
          content: (kit) => (
            <div className="space-y-4">
              <PredictionChips
                prompt="une fois les huit données rangées, retrouver le score d’Hugo au relais sera…"
                options={[
                  { id: 'pareil', label: 'aussi long qu’avant' },
                  { id: 'vite', label: 'immédiat' },
                  { id: 'pire', label: 'plus difficile' },
                ]}
                value={pred}
                onChange={setPred}
                disabled={rangeDone}
              />
              {/* Le geste : l'étiquette part du vrac et atterrit dans la
                  grille. Le trajet désordre → rangement EST la leçon. */}
              <DropGrid
                initialTable={GRILLE}
                facts={DONNEES}
                react={kit.react}
                solved={rangeDone}
                onSolved={() => setRangeDone(true)}
                tone="emerald"
                caption="Le tableau du tournoi — construis-le"
                trayLabel="Les huit résultats, en vrac"
              />
              {rangeDone && (
                <>
                  <Feedback tone="info">
                    {pred === 'vite'
                      ? 'Ta prédiction tenait : '
                      : pred
                      ? 'Ta prédiction disait autre chose, et pourtant : '
                      : ''}
                    les nombres n’ont pas changé, et le paragraphe non plus. Ce que tu viens de
                    fabriquer, c’est leur <strong>rangement</strong> — et il suffit maintenant de
                    partir d’un nom pour glisser jusqu’au résultat.
                  </Feedback>
                  {/* La brique arrive APRÈS le geste et APRÈS l'écart d'effort
                      ressenti : elle nomme ce que l'élève vient de vivre. */}
                  <KnowledgeBrick
                    id="tableau-outil"
                    variant="new"
                    lead="Tu as cherché longtemps dans le texte, et tu viens de bâtir l’outil qui répond du regard."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le même nombre, deux fois',
          subtitle: 'Regarde ton tableau : deux cases portent 9.',
          done: memeDone,
          content: (
            <div className="space-y-3">
              <div className="bg-slate-900 text-white rounded-2xl px-4 py-3 text-center">
                <p className="font-mono text-2xl font-black">9</p>
                <p className="text-xs text-slate-300 mt-1">
                  Ce nombre apparaît deux fois dans le tableau que tu viens de construire.
                </p>
              </div>
              <TapQuestion
                prompt="Ces deux 9 racontent-ils la même chose ?"
                options={[
                  'Oui : 9 vaut 9, où qu’il soit écrit',
                  'Non : l’un est la course d’Inès, l’autre le relais de Léa',
                  'Non : l’un des deux est forcément une erreur',
                ]}
                correct={1}
                cols={1}
                explain="Les deux nombres sont bien égaux, mais ils ne disent pas la même chose : 9 en haut à gauche, c’est la course d’Inès ; 9 dans la colonne du relais, c’est celui de Léa. C’est la CASE qui donne son sens au nombre — et c’est toi qui l’as choisie en le posant."
                explainWrong="Aucun des deux n’est faux, et ils sont bien tous les deux égaux à 9. Ce qui les distingue, c’est l’endroit où tu les as posés : ligne d’Inès et colonne Course pour l’un, ligne de Léa et colonne Relais pour l’autre."
                requires={['tableau-outil']}
                solved={memeDone}
                onAnswered={() => setMemeDone(true)}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Alors, à quoi ça sert ?',
          done: verdictDone,
          content: (
            <TapQuestion
              prompt="D’après ce que tu viens de vivre, à quoi sert un tableau ?"
              options={[
                'À faire joli sur la feuille',
                'À ranger les informations pour les retrouver vite',
                'À rendre les nombres plus grands',
              ]}
              correct={1}
              cols={1}
              explain="Un tableau ne change aucun nombre : il les range, pour qu’on retrouve chaque information d’un coup d’œil au lieu de fouiller."
              requires={['tableau-outil']}
              solved={verdictDone}
              onAnswered={() => setVerdictDone(true)}
            />
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <KnowledgeSnapshot moduleNumber={1}>
            <strong>La suite.</strong> Tu sais à quoi sert un tableau — et tu en as construit un.
            Reste à donner un nom à chacune de ses parties : c'est le prochain module.
          </KnowledgeSnapshot>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <ListRestart className="w-6 h-6 mx-auto text-indigo-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Mêmes nombres, deux présentations — et c'est toi qui as fabriqué la seconde.
            </p>
          </div>
        </motion.div>
      }
    />
  );
}
