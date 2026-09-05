import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ListRestart } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DataTable from '../components/DataTable';
import { TOURNOI } from '../components/tournoiData';
import { cellValue } from '../components/tableUtils';

/**
 * Module 1 — DÉCLENCHEUR : le conflit cognitif.
 *
 * La même information est présentée deux fois : d'abord en vrac (un texte
 * de 16 nombres où il faut relire trois fois pour répondre), puis rangée.
 * L'élève répond à LA MÊME question dans les deux états et constate que ce
 * n'est pas lui qui est lent — c'est la présentation qui est mauvaise.
 *
 * Le tableau n'est donc pas présenté comme une définition mais comme la
 * RÉPONSE à une gêne que l'élève vient de ressentir. Aucun vocabulaire
 * (ligne/colonne/en-tête) n'est donné ici : c'est le module 2 qui le nomme.
 */
const VRAC = `Au tournoi de la 6e B : Léa a marqué 12 points à la course, Tom 7 à la course,
Inès 9 à la course et Hugo 10 à la course. Au saut, Léa a eu 8, Tom 6, Inès 10 et Hugo 5.
Au relais, Tom a fait 15, Léa 9, Hugo 7 et Inès 8. Enfin en précision, Inès et Hugo ont eu
10 et 9, tandis que Léa a eu 7 et Tom 6.`;

const HUGO_RELAIS = cellValue(TOURNOI, 3, 2); // 7

export default function Module01MessageEnVrac() {
  const [vracDone, setVracDone] = useState(false);
  const [rangeDone, setRangeDone] = useState(false);
  const [verdictDone, setVerdictDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le message en vrac"
      moduleSubtitle="Onze informations jetées en désordre : réponds vite… si tu peux."
      estimatedTime="8 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Le prof a tout noté au fil de l’eau. Bon courage.',
        body: (
          <p>
            Les résultats du tournoi existent : ils sont tous là, dans un paragraphe. Réponds à une seule
            question — puis on te reposera exactement la même autrement.
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
                explainWrong="5, c’est le saut d’Hugo ; 10, sa course. Trois nombres pour un même élève, éparpillés dans trois phrases différentes : voilà le problème."
                solved={vracDone}
                onAnswered={() => setVracDone(true)}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'La même question, autrement',
          done: rangeDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Voici exactement les mêmes nombres, rien de plus. Repose-toi la question.
              </p>
              <DataTable table={TOURNOI} caption="Résultats du tournoi de la 6e B" tone="emerald" />
              <TapQuestion
                prompt="Et cette fois : combien de points Hugo a-t-il marqués au relais ?"
                options={['5 points', `${HUGO_RELAIS} points`, '10 points']}
                correct={1}
                cols={3}
                explain="Même réponse, même information — mais tu l’as trouvée du regard. Suivre la ligne d’Hugo jusqu’à la colonne du relais suffit."
                solved={rangeDone}
                onAnswered={() => setRangeDone(true)}
              />
              {rangeDone && (
                <Feedback tone="info">
                  Les deux questions étaient identiques. Ce qui a changé, ce n'est ni toi ni les nombres :
                  c'est leur <strong>rangement</strong>.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
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
              solved={verdictDone}
              onAnswered={() => setVerdictDone(true)}
            />
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <ListRestart className="w-6 h-6 mx-auto text-indigo-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Même information, deux présentations, deux efforts très différents. Reste à comprendre COMMENT le
            tableau y arrive — c'est le prochain module.
          </p>
        </motion.div>
      }
    />
  );
}
