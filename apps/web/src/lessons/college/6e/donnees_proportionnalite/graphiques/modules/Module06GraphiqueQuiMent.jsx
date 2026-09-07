import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BarChart from '../components/BarChart';
import AxisCutter from '../components/AxisCutter';
import { makeSeries, withValue } from '../components/chartUtils';

/**
 * Module 6 — ATELIER : détecter et corriger une représentation fausse.
 *
 * Trois trucages, du plus classique au plus subtil, chacun montré PUIS
 * corrigé côte à côte — la correction n'est pas une explication, c'est le
 * même graphique redessiné honnêtement :
 *
 *  1. AXE TRONQUÉ : l'axe démarre à 90 au lieu de 0, un écart de 4 % a l'air
 *     d'un écrasement. C'est le trucage le plus fréquent dans la vraie vie.
 *  2. VALEUR FAUSSE : une barre ne correspond pas à la donnée du tableau —
 *     ici le graphique contredit sa propre source.
 *  3. GRADUATIONS IRRÉGULIÈRES : l'axe saute 0, 5, 10, 50 — les hauteurs ne
 *     sont plus proportionnelles aux valeurs, donc plus comparables.
 *
 * L'élève ne fait pas que « reconnaître » : à l'étape 2, il désigne la barre
 * fautive puis choisit la correction.
 */
const VENTES = makeSeries({
  categories: ['Marque A', 'Marque B'],
  values: [96, 100],
  unit: null,
  label: 'Satisfaction',
});

const CLUB_VRAI = makeSeries({
  categories: ['Lun', 'Mar', 'Mer'],
  values: [8, 14, 11],
  unit: 'élèves',
  label: 'Présents au club',
});
const CLUB_FAUX = withValue(CLUB_VRAI, 2, 20); // mercredi dessiné à 20 au lieu de 11

export default function Module06GraphiqueQuiMent() {
  // Le pied de l'axe, piloté par l'élève : c'est LUI qui fabrique le trucage.
  const [base, setBase] = useState(0);
  const [cutSeen, setCutSeen] = useState(false);
  const [tronqueDone, setTronqueDone] = useState(false);
  const [reperageDone, setReperageDone] = useState(false);
  const [pickedBar, setPickedBar] = useState(null);
  const [correctionDone, setCorrectionDone] = useState(false);
  const [gradDone, setGradDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Le graphique qui ment"
      moduleSubtitle="Trois graphiques truqués : trouve la faute et corrige-la."
      estimatedTime="12 min"
      brief={{
        tag: '📊 Mission 06',
        title: 'Un graphique peut être exact… et trompeur quand même.',
        body: (
          <p>
            Les nombres peuvent être justes et l'image mensongère. Trois pièges classiques t'attendent — ceux
            qu'on rencontre vraiment dans les publicités et les journaux.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Piège 1 : l’axe qui ne part pas de zéro',
          subtitle: 'Fabrique le mensonge de tes propres mains.',
          done: tronqueDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Une publicité compare la satisfaction de deux marques : <strong>96 %</strong> contre{' '}
                <strong>100 %</strong>. Les deux nombres sont exacts, et ils ne changeront pas.{' '}
                <strong>Attrape le pied de l’axe</strong> (la poignée à gauche) et fais-le monter.
              </p>
              {/* L'élève ne CONSTATE plus le trucage : il le FABRIQUE. Les
                  valeurs restent celles de la publicité ; seul l'endroit où
                  l'axe commence obéit à son doigt. */}
              <AxisCutter
                series={VENTES}
                baseValue={base}
                onChange={(v) => {
                  setBase(v);
                  if (v >= 90 && !cutSeen) { setCutSeen(true); kit.react(true); }
                }}
                step={base === 0 ? 20 : 5}
                title="Satisfaction (%)"
                axisLabel="%"
                readout={
                  <p className="text-xs text-center text-slate-600 mt-1">
                    {base === 0
                      ? 'Axe depuis 0 : les deux barres se ressemblent, et c’est la vérité.'
                      : cutSeen
                      ? 'Tu viens de fabriquer le trucage. Redescends à 0 : les nombres n’ont jamais bougé.'
                      : 'Continue de monter le pied de l’axe et regarde l’écart enfler.'}
                  </p>
                }
              />
              <TapQuestion
                prompt="Pourquoi le premier graphique est-il trompeur ?"
                options={[
                  'Les nombres sont faux',
                  'L’axe commence à 95, ce qui transforme un petit écart en énorme différence',
                  'Il manque le titre',
                ]}
                correct={1}
                cols={1}
                explain="Les deux nombres sont exacts. Mais en démarrant l’axe à 95, on ne dessine plus que les 5 derniers pour-cent : la barre de B paraît des fois plus grande que celle de A, alors que l’écart réel est de 4 points sur 100. Un axe qui ne part pas de zéro interdit de comparer les hauteurs."
                explainWrong="Regarde le bas de l’axe : il commence à 95, pas à 0. Du coup on n’affiche qu’une toute petite tranche, et un écart de 4 points paraît gigantesque. Les nombres, eux, sont justes."
                requires={['echelle-axe', 'lire-hauteur', 'comparer-entiers']}
                solved={tronqueDone}
                onAnswered={() => setTronqueDone(true)}
              />
              {tronqueDone && (
                <KnowledgeBrick
                  id="axe-tronque"
                  variant="new"
                  lead="Tu viens de démasquer le trucage le plus courant. Il porte un nom."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Piège 2 : repère la barre fautive',
          done: reperageDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Le tableau du club dit :{' '}
                <strong className="font-mono">Lun 8 · Mar 14 · Mer 11</strong> élèves. Touche la barre qui ne
                correspond PAS au tableau.
              </p>
              <BarChart
                series={CLUB_FAUX}
                step={5}
                mode="read"
                selected={pickedBar}
                onSelect={(i) => {
                  // Le diagramme reste désignable : l'élève peut vérifier les
                  // trois barres contre le tableau, y compris après avoir
                  // trouvé la fautive (règle projet du 2026-09-06).
                  setPickedBar(i);
                  const ok = i === 2;
                  if (!reperageDone) { kit.react(ok); if (ok) setReperageDone(true); }
                }}
                title="Présents au club (graphique publié)"
                axisLabel="élèves"
                tone="rose"
              />
              {reperageDone && (
                <Feedback tone="ok">
                  La barre du mercredi monte à <strong>20</strong> alors que le tableau annonce{' '}
                  <strong>11 élèves</strong>. Le graphique contredit sa propre source : toujours vérifier une
                  barre contre la donnée.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Corrige-la',
          done: correctionDone,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="À quelle hauteur la barre du mercredi doit-elle s’arrêter ?"
                options={['8', '11', '20']}
                correct={1}
                cols={3}
                explain="Le tableau dit 11 élèves : la barre doit s’arrêter à 11, entre les graduations 10 et 15."
                explainWrong="Le tableau annonce 11 élèves pour le mercredi. 8 est la valeur du lundi, et 20 est justement la hauteur fausse."
                requires={['hauteur-est-nombre', 'lire-hauteur', 'echelle-axe']}
                solved={correctionDone}
                onAnswered={() => setCorrectionDone(true)}
              />
              {correctionDone && (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3">
                  <p className="text-xs font-bold text-emerald-700 text-center mb-1">Le graphique corrigé</p>
                  <BarChart series={CLUB_VRAI} step={5} title="Présents au club" axisLabel="élèves" tone="emerald" axisFloor={25} />
                </div>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Piège 3 : des graduations irrégulières',
          done: gradDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Un graphique porte sur son axe vertical, de bas en haut, les graduations{' '}
                <strong className="font-mono">0, 5, 10, 50, 100</strong>, toutes espacées pareil.
              </p>
              <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4">
                <svg viewBox="0 0 260 170" className="w-full max-w-xs mx-auto block" role="img" aria-label="Axe vertical dont les graduations 0, 5, 10, 50, 100 sont espacées régulièrement alors que les écarts de valeur sont très différents">
                  {[0, 5, 10, 50, 100].map((v, i) => {
                    const y = 145 - i * 30;
                    return (
                      <g key={v}>
                        <line x1="40" y1={y} x2="245" y2={y} stroke="#fecdd3" strokeWidth="1" />
                        <text x="34" y={y + 4} textAnchor="end" fontSize="11" fill="#9f1239" fontFamily="monospace">{v}</text>
                      </g>
                    );
                  })}
                  <line x1="40" y1="20" x2="40" y2="145" stroke="#334155" strokeWidth="1.5" />
                  <line x1="40" y1="145" x2="245" y2="145" stroke="#334155" strokeWidth="1.5" />
                  <text x="142" y="163" textAnchor="middle" fontSize="10" fill="#9f1239">écarts : 5, 5, 40, 50 — même espace !</text>
                </svg>
              </div>
              <TapQuestion
                prompt="Quel est le problème avec cet axe ?"
                options={[
                  'Il n’y a pas assez de graduations',
                  'Des écarts très différents (5, puis 40, puis 50) occupent la même distance : les hauteurs ne sont plus comparables',
                  'Les nombres devraient être écrits à droite',
                ]}
                correct={1}
                cols={1}
                explain="Sur un axe correct, une même distance représente toujours le même écart. Ici, monter d’un cran vaut tantôt 5, tantôt 50 : deux barres de hauteur double ne représentent plus des valeurs doubles. L’axe doit être RÉGULIER."
                explainWrong="Le nombre de graduations n’est pas le souci. Le problème est leur régularité : passer de 10 à 50 occupe autant de place que passer de 0 à 5, alors que l’écart est huit fois plus grand."
                requires={['echelle-axe', 'axe-tronque']}
                solved={gradDone}
                onAnswered={() => setGradDone(true)}
              />
              {gradDone && (
                <>
                  <KnowledgeBrick
                    id="graduations-regulieres"
                    variant="new"
                    lead="Troisième trucage, et il attaque exactement ce qui rendait les hauteurs comparables."
                  />
                  <KnowledgeBrick
                    id="mem-verifier-graphique"
                    variant="new"
                    lead="Trois trucages démasqués : voici les trois questions qui les attrapent tous."
                  />
                </>
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
            <ShieldAlert className="w-6 h-6 mx-auto text-rose-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Un graphique n'est pas une preuve : c'est un dessin. Regarde toujours son axe avant de croire ce
              qu'il montre.
            </p>
          </div>
        </motion.div>
      }
    />
  );
}
