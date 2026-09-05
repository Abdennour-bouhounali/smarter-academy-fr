import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BarChart from '../components/BarChart';
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
  const [tronqueDone, setTronqueDone] = useState(false);
  const [reperageDone, setReperageDone] = useState(false);
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
          done: tronqueDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Une publicité compare la satisfaction de deux marques : <strong>96 %</strong> contre{' '}
                <strong>100 %</strong>. Voici son graphique.
              </p>
              <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-3">
                <p className="text-xs font-bold text-rose-700 text-center mb-1">Le graphique de la publicité</p>
                <BarChart
                  series={VENTES}
                  step={5}
                  zeroBased={false}
                  baseValue={95}
                  title="Satisfaction (%)"
                  tone="rose"
                />
              </div>
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3">
                <p className="text-xs font-bold text-emerald-700 text-center mb-1">Le même écart, axe depuis 0</p>
                <BarChart series={VENTES} step={20} title="Satisfaction (%)" tone="emerald" />
              </div>
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
                solved={tronqueDone}
                onAnswered={() => setTronqueDone(true)}
              />
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
                mode={reperageDone ? 'display' : 'read'}
                selected={reperageDone ? 2 : null}
                onSelect={(i) => {
                  const ok = i === 2;
                  kit.react(ok);
                  if (ok) setReperageDone(true);
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
                solved={gradDone}
                onAnswered={() => setGradDone(true)}
              />
              {gradDone && (
                <Feedback tone="info">
                  Trois vérifications, désormais, devant n'importe quel graphique : l'axe part-il de{' '}
                  <strong>zéro</strong> ? Les graduations sont-elles <strong>régulières</strong> ? Les
                  hauteurs correspondent-elles aux <strong>données</strong> ?
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <ShieldAlert className="w-6 h-6 mx-auto text-rose-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Un graphique n'est pas une preuve : c'est un dessin. Regarde toujours son axe avant de croire ce
            qu'il montre.
          </p>
        </motion.div>
      }
    />
  );
}
