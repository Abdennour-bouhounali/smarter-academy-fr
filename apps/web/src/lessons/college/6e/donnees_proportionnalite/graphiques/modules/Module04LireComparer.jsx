import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';
import { CDI, SONDAGE } from '../components/meteoData';
import { maxIndex, minIndex, parseDec, formatDec } from '../components/chartUtils';

/**
 * Module 4 — MANIPULATION : comparer, et repérer les extrêmes.
 *
 * Ce que le graphique fait mieux que le tableau : voir d'un coup QUI est le
 * plus grand, QUI est le plus petit, et de COMBIEN l'un dépasse l'autre.
 *
 * L'élève désigne les extrêmes en tapant directement les barres (mode
 * 'read'), puis quantifie un écart — la lecture visuelle doit redevenir un
 * nombre, sinon le graphique reste une impression.
 *
 * La dernière étape introduit le diagramme circulaire, la seconde forme au
 * programme : il ne compare pas des quantités entre elles mais des PARTS
 * d'un tout. Le contraste avec les bâtons est explicite.
 */
const I_MAX = maxIndex(CDI); // 1 → mardi (45)
const I_MIN = minIndex(CDI); // 2 → mercredi (15)
const ECART = CDI.values[I_MAX] - CDI.values[I_MIN]; // 30

export default function Module04LireComparer() {
  const [maxDone, setMaxDone] = useState(false);
  const [minDone, setMinDone] = useState(false);
  const [ecartDone, setEcartDone] = useState(false);
  const [doubleDone, setDoubleDone] = useState(false);
  const [camembertDone, setCamembertDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Lire, comparer, repérer"
      moduleSubtitle="Le plus haut, le plus bas, et tout ce qui se compare d’un regard."
      estimatedTime="11 min"
      brief={{
        tag: '📊 Mission 04',
        title: 'Le CDI veut savoir quand ouvrir plus longtemps.',
        body: (
          <p>
            Voici la fréquentation du CDI cette semaine. Un graphique répond en une seconde à des questions
            qui, dans un tableau, demandent de comparer cinq nombres.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Le jour le plus fréquenté',
          done: maxDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Touche la barre du jour où le CDI a reçu le plus d'élèves.</p>
              <BarChart
                series={CDI}
                mode={maxDone ? 'display' : 'read'}
                step={10}
                selected={maxDone ? I_MAX : null}
                highlightMax={maxDone}
                onSelect={(i) => {
                  const ok = i === I_MAX;
                  kit.react(ok);
                  if (ok) setMaxDone(true);
                }}
                title="Élèves au CDI cette semaine"
                axisLabel="élèves"
                tone="violet"
              />
              {maxDone && (
                <>
                  <Feedback tone="ok">
                    Le mardi, avec <strong>{CDI.values[I_MAX]} élèves</strong> : c'est la barre la plus haute,
                    et tu l'as désignée sans lire un seul nombre.
                  </Feedback>
                  {/* Les deux mots arrivent APRÈS la désignation : l'élève sait
                      déjà faire ce qu'ils nomment. */}
                  <KnowledgeBrick
                    id="maximum-minimum"
                    variant="new"
                    lead="La plus haute et la plus courte : ces deux barres ont chacune un nom en mathématiques."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le jour le plus calme',
          done: minDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Et maintenant, le jour où il y a eu le moins de monde.</p>
              <BarChart
                series={CDI}
                mode={minDone ? 'display' : 'read'}
                step={10}
                selected={minDone ? I_MIN : null}
                highlightMin={minDone}
                onSelect={(i) => {
                  const ok = i === I_MIN;
                  kit.react(ok);
                  if (ok) setMinDone(true);
                }}
                title="Élèves au CDI cette semaine"
                axisLabel="élèves"
                tone="violet"
              />
              {minDone && (
                <Feedback tone="ok">
                  Le mercredi, avec <strong>{CDI.values[I_MIN]} élèves</strong> — la barre la plus courte. (Le
                  mercredi après-midi, il n'y a pas cours pour tout le monde.)
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'De combien ?',
          done: ecartDone,
          content: (
            <div className="space-y-3">
              <BarChart series={CDI} step={10} highlightMax highlightMin title="Élèves au CDI cette semaine" axisLabel="élèves" tone="violet" />
              {/* Voir « c'est plus haut » ne suffit pas : la méthode qui
                  transforme l'impression en nombre est posée avant la demande. */}
              <KnowledgeBrick
                id="ecart-chiffre"
                variant="new"
                lead="Les deux barres extrêmes sont éclairées. Reste à dire de combien elles diffèrent."
              />
              <NumericQuestion
                prompt="Combien d’élèves de plus le mardi que le mercredi ?"
                suffix="élèves"
                expected={ECART}
                parse={parseDec}
                display={formatDec(ECART)}
                explain={<>45 − 15 = <strong>{ECART} élèves</strong> d'écart. Voir que « c'est plus haut » ne suffit pas : on revient au nombre pour dire de combien.</>}
                explainFor={(n) =>
                  n === 60
                    ? '60, c’est 45 + 15 : tu as additionné au lieu de comparer. Un écart se calcule par une soustraction.'
                    : n === 45 || n === 15
                    ? 'Tu as donné une des deux valeurs, pas leur différence : 45 − 15.'
                    : 'Soustrais la plus petite valeur de la plus grande : 45 − 15.'
                }
                requires={['ecart-chiffre', 'maximum-minimum', 'lire-hauteur']}
                solved={ecartDone}
                onAnswered={() => setEcartDone(true)}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Deux fois plus haut ?',
          done: doubleDone,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="La barre du jeudi (40) est-elle vraiment plus de deux fois plus haute que celle du mercredi (15) ?"
                options={[
                  'Oui : 40 est plus du double de 15',
                  'Non : 40 est moins du double de 15',
                ]}
                correct={0}
                cols={1}
                explain="Le double de 15 est 30, et 40 dépasse 30 : la barre du jeudi est bien plus de deux fois plus haute. Sur un graphique qui part de zéro, les hauteurs se comparent comme les nombres."
                explainWrong="Le double de 15 vaut 30. Comme 40 > 30, la barre du jeudi est bien plus de deux fois plus haute. Attention : ce raisonnement ne marche QUE si l’axe part de zéro."
                requires={['lire-hauteur', 'echelle-axe', 'comparer-entiers']}
                solved={doubleDone}
                onAnswered={() => setDoubleDone(true)}
              />
              {doubleDone && (
                <Feedback tone="info">
                  Retiens bien cette condition : « deux fois plus haut = deux fois plus » suppose que l'axe
                  commence à <strong>zéro</strong>. Le module 6 te montrera ce qui se passe sinon.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 5,
          title: 'Un autre genre de graphique',
          done: camembertDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Les 24 élèves du club ont choisi une activité. Ici, chaque part montre une portion du{' '}
                <strong>groupe entier</strong>. Touche la part la plus grande.
              </p>
              <PieChart
                series={SONDAGE}
                mode={camembertDone ? 'display' : 'read'}
                selected={camembertDone ? 0 : null}
                onSelect={(i) => {
                  const ok = i === 0;
                  kit.react(ok);
                  if (ok) setCamembertDone(true);
                }}
                title="Activité choisie par les 24 élèves du club"
              />
              {camembertDone && (
                <>
                  <Feedback tone="ok">
                    Le foot occupe <strong>exactement la moitié</strong> du disque : 12 élèves sur 24.
                  </Feedback>
                  <KnowledgeBrick
                    id="diagramme-circulaire"
                    variant="new"
                    lead="Cette forme-là ne répond pas à la même question que les barres."
                  />
                </>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <KnowledgeSnapshot moduleNumber={4}>
            <strong>La suite.</strong> Tu repères les extrêmes et tu chiffres un écart. Au prochain module,
            on relie les points : apparaît alors ce qu’aucune barre isolée ne montre — le mouvement.
          </KnowledgeSnapshot>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <BarChart3 className="w-6 h-6 mx-auto text-violet-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              L'œil repère — puis on revient au nombre pour être précis.
            </p>
          </div>
        </motion.div>
      }
    />
  );
}
