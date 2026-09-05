import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import QuantityMachine from '../components/QuantityMachine';
import { CREPES } from '../components/kermesseData';
import { applyRule } from '../components/proportionUtils';

/**
 * Module 1 — DÉCLENCHEUR : la machine avant les mots.
 *
 * Aucune définition, aucun vocabulaire. L'élève actionne un distributeur
 * (1 jeton, 2 jetons, 5 jetons…) et voit les deux paquets grandir ensemble.
 * Ce module a exactement deux objectifs :
 *
 *  1. IDENTIFIER LES DEUX GRANDEURS qui varient (LP P3) — question trop
 *     souvent sautée, alors que ne pas savoir « ce qui varie avec quoi »
 *     bloque tout le reste ;
 *  2. faire naître le constat « quand l'une double, l'autre double » sans
 *     encore le nommer (LP P1). Le mot « proportionnel » n'apparaît qu'à la
 *     toute fin, comme le NOM d'une chose déjà observée.
 *
 * Interdit ici (playbook §2) : expliquer le coefficient, c'est le module 2
 * qui existe pour le faire découvrir.
 */
const PRIX = (n) => applyRule(CREPES.rule, n);

export default function Module01Distributeur() {
  const [qty, setQty] = useState(1);
  const [explored, setExplored] = useState([1]);
  const [grandeursDone, setGrandeursDone] = useState(false);
  const [doubleDone, setDoubleDone] = useState(false);
  const [nomDone, setNomDone] = useState(false);

  const enough = explored.length >= 4;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le distributeur de crêpes"
      moduleSubtitle="1 jeton, 2 jetons, 5 jetons : actionne et regarde ce qui sort."
      estimatedTime="9 min"
      brief={{
        tag: '⚖️ Mission 01',
        title: 'La kermesse ouvre. Le distributeur, lui, ne parle pas.',
        body: (
          <p>
            Aucune règle affichée, aucune explication : mets des jetons, regarde ce qui sort, et déduis
            comment la machine fonctionne.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Actionne la machine',
          done: enough,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Essaie au moins quatre quantités différentes et observe les deux tas.
              </p>
              <QuantityMachine
                rule={CREPES.rule}
                quantities={[1, 2, 3, 5, 10]}
                value={qty}
                onChange={(q) => {
                  setQty(q);
                  if (!explored.includes(q)) {
                    const next = [...explored, q];
                    setExplored(next);
                    if (next.length === 4) kit.react(true);
                  }
                }}
                inputLabel="Jetons donnés"
                outputLabel="Crêpes obtenues"
                outputUnit=""
              />
              <p className="text-xs text-slate-500 text-center">
                {explored.length}/4 quantités essayées
              </p>
              {enough && (
                <Feedback tone="ok">
                  Tu as vu les deux tas grandir ensemble : plus il y a de jetons, plus il y a de crêpes — et
                  jamais n'importe comment.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Qu’est-ce qui varie ?',
          done: grandeursDone,
          content: (
            <TapQuestion
              prompt="Dans cette situation, quelles sont les DEUX quantités qui varient ensemble ?"
              options={[
                'Le nombre de jetons et le nombre de crêpes',
                'Le nombre de crêpes et la taille du stand',
                'Le nombre de jetons et le temps d’attente',
              ]}
              correct={0}
              cols={1}
              explain="Deux grandeurs varient ensemble : les jetons qu’on donne et les crêpes qu’on reçoit. Repérer CE QUI varie avec QUOI est toujours la première chose à faire."
              solved={grandeursDone}
              onAnswered={() => setGrandeursDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Et si on double ?',
          done: doubleDone,
          content: (
            <div className="space-y-3">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-center font-mono text-sm text-slate-700">
                2 jetons → {PRIX(2)} crêpes
              </div>
              <TapQuestion
                prompt="Avec 4 jetons (le double de 2), combien de crêpes penses-tu obtenir ?"
                options={[`${PRIX(2) + 2} crêpes`, `${PRIX(4)} crêpes`, `${PRIX(2)} crêpes`]}
                correct={1}
                cols={3}
                explain={`${PRIX(4)} crêpes : en doublant les jetons, on double les crêpes (${PRIX(2)} × 2 = ${PRIX(4)}). C’est ça, le comportement de cette machine.`}
                explainWrong={`Ajouter 2 jetons n’ajoute pas 2 crêpes. Avec 2 jetons on a ${PRIX(2)} crêpes ; en doublant la mise, on obtient le double : ${PRIX(4)}.`}
                solved={doubleDone}
                onAnswered={() => setDoubleDone(true)}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Ça porte un nom',
          done: nomDone,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="Deux grandeurs qui varient ainsi — double d’un côté, double de l’autre — forment une situation qu’on appelle…"
                options={['une situation de proportionnalité', 'une situation d’addition', 'une situation de comparaison']}
                correct={0}
                cols={1}
                explain="On dit que la situation est PROPORTIONNELLE. Tu viens de la reconnaître par le comportement de la machine, pas par une définition apprise."
                solved={nomDone}
                onAnswered={() => setNomDone(true)}
              />
              {nomDone && (
                <Feedback tone="info">
                  Retiens le geste, pas le mot : on double d'un côté, ça double de l'autre. Il reste à
                  découvrir <strong>comment</strong> la machine calcule.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <Coins className="w-6 h-6 mx-auto text-indigo-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Deux grandeurs, une machine, et un comportement régulier. Au prochain module, tu perces son
            secret.
          </p>
        </motion.div>
      }
    />
  );
}
