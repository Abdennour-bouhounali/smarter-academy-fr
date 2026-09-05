import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import { ContentModule, NumericQuestion, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProportionTable from '../components/ProportionTable';
import TestBench from '../components/TestBench';
import { DISTANCE, TAILLE } from '../components/kermesseData';
import { applyRule, parseDec, formatDec, buildRows } from '../components/proportionUtils';

/**
 * Module 6 — ATELIER : problèmes réels, et le réflexe de vérification.
 *
 * Trois situations authentiques où l'élève doit d'abord DÉCIDER si la
 * proportionnalité s'applique, avant de calculer :
 *
 *  1. la recette du stand (proportionnelle, passage par l'unité) ;
 *  2. la course de relais (proportionnelle, vitesse constante) — transfert
 *     vers un contexte sans argent ;
 *  3. la taille de Tom (NON proportionnelle) : le piège du module. Appliquer
 *     une règle de proportionnalité y donne un résultat absurde, et c'est
 *     l'absurdité elle-même qui sert de feedback (playbook §8).
 *
 * La dernière étape installe le réflexe : un résultat se contrôle par son
 * ordre de grandeur avant d'être rendu (LP P11).
 */
const DIST_ROWS = buildRows(DISTANCE.rule, [1, 2, 3]);

export default function Module06Kermesse() {
  const [recetteDone, setRecetteDone] = useState(false);
  const [distanceDone, setDistanceDone] = useState(false);
  const [tailleDone, setTailleDone] = useState(false);
  const [verifDone, setVerifDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Les problèmes de la kermesse"
      moduleSubtitle="Recettes, courses, distances : et un résultat à vérifier."
      estimatedTime="13 min"
      brief={{
        tag: '⚖️ Mission 06',
        title: 'La kermesse bat son plein. Trois questions, un piège.',
        body: (
          <p>
            Avant chaque calcul, une seule question : cette situation est-elle proportionnelle ? La réponse
            décide de la méthode — et parfois, elle interdit toute méthode.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'La recette du stand',
          done: recetteDone,
          content: (
            <div className="space-y-3">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-3">
                <p className="text-sm text-slate-700">
                  Le stand a vendu <strong>8 crêpes pour 24 €</strong>. À la fin de la journée, il en a vendu{' '}
                  <strong>20</strong>. Toutes sont au même prix.
                </p>
              </div>
              <NumericQuestion
                prompt="Quelle est la recette totale du stand ?"
                suffix="€"
                expected={60}
                parse={parseDec}
                display={formatDec(60)}
                explain={<>8 crêpes → 24 €, donc 1 crêpe → 24 ÷ 8 = 3 €. Pour 20 crêpes : 3 × 20 = <strong>60 €</strong>.</>}
                explainFor={(n) =>
                  n === 36
                    ? 'Tu as ajouté 12 € (pour 12 crêpes de plus) sans passer par le prix unitaire — mais 12 crêpes coûtent 36 €, pas 12 €. Passe par l’unité : 24 ÷ 8 = 3 € la crêpe.'
                    : n === 48
                    ? 'Tu as doublé 24 €, ce qui correspondrait à 16 crêpes, pas 20. Passe par l’unité : 3 € la crêpe, puis × 20.'
                    : 'Cherche d’abord le prix d’UNE crêpe : 24 ÷ 8 = 3 €. Puis multiplie par 20.'
                }
                solved={recetteDone}
                onAnswered={() => setRecetteDone(true)}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'La course de relais',
          done: distanceDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Les coureurs gardent une allure régulière. Voici leur progression.
              </p>
              <ProportionTable
                xLabel="Heures"
                yLabel="Distance"
                unit="km"
                columns={DIST_ROWS}
                coefficient={12}
                caption="Course de relais à allure constante"
              />
              <NumericQuestion
                prompt="Quelle distance auront-ils parcourue en 5 heures ?"
                suffix="km"
                expected={applyRule(DISTANCE.rule, 5)}
                parse={parseDec}
                display={formatDec(applyRule(DISTANCE.rule, 5))}
                explain={<>À allure constante, 12 km par heure : 12 × 5 = <strong>{applyRule(DISTANCE.rule, 5)} km</strong>. Ici le coefficient est déjà la valeur de l’unité.</>}
                explainFor={(n) =>
                  n === 17
                    ? 'Tu as ajouté 5 aux 12 km : les heures et les kilomètres ne s’additionnent pas. Chaque heure APPORTE 12 km, donc on multiplie.'
                    : 'Chaque heure apporte 12 km : multiplie 12 par le nombre d’heures.'
                }
                solved={distanceDone}
                onAnswered={() => setDistanceDone(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le piège : la taille de Tom',
          done: tailleDone,
          content: (kit) => (
            <div className="space-y-3">
              <TestBench
                situation={TAILLE}
                react={kit.react}
                solved={tailleDone}
                onTested={() => setTailleDone(true)}
              />
              {tailleDone && (
                <Feedback tone="info">
                  Si la taille était proportionnelle à l'âge, un enfant de 2 ans mesurant 86 cm en mesurerait{' '}
                  <strong>430 cm à 10 ans</strong> — plus de quatre mètres. L'absurdité du résultat est le
                  meilleur signal d'alarme : toutes les grandeurs qui augmentent ensemble ne sont pas
                  proportionnelles.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Le réflexe de vérification',
          done: verifDone,
          content: (
            <TapQuestion
              prompt="Avant de rendre un résultat de proportionnalité, quel contrôle rapide faire ?"
              options={[
                'Vérifier que le résultat est un nombre entier',
                'Vérifier qu’il est cohérent : plus de quantité doit donner plus, et le rapport doit rester le même',
                'Vérifier qu’il est plus grand que la valeur de départ',
              ]}
              correct={1}
              cols={1}
              explain="Deux contrôles suffisent : le sens (plus de crêpes → plus cher) et le rapport (le prix par crêpe doit rester le même). Un résultat peut très bien être décimal, et il peut être plus petit si la quantité diminue."
              solved={verifDone}
              onAnswered={() => setVerifDone(true)}
            />
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <PartyPopper className="w-6 h-6 mx-auto text-rose-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Reconnaître, choisir, calculer, vérifier : la boucle complète. Il ne reste qu'à tenir le stand
            pour de bon.
          </p>
        </motion.div>
      }
    />
  );
}
