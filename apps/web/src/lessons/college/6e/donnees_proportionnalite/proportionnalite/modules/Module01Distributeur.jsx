import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
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
 *     encore le nommer (LP P1).
 *
 * RÉPARATION (contrat « connaissances avant la demande ») : ce module ne
 * nomme PLUS la proportionnalité. Le mot y apparaissait en option d'un QCM
 * — donc en position de DEMANDE — alors qu'aucune brique ne l'avait posé et
 * que le nombre constant qui lui donne son sens n'est trouvé qu'au module 2.
 * Le mot est désormais posé là-bas, après le geste qui le fait apparaître ;
 * ici l'élève consolide le COMPORTEMENT, avec ses mots à lui.
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
                <>
                  <Feedback tone="ok">
                    Tu as vu les deux tas grandir ensemble : plus il y a de jetons, plus il y a de crêpes — et
                    jamais n'importe comment.
                  </Feedback>
                  <KnowledgeBrick
                    id="deux-grandeurs"
                    variant="new"
                    lead="Deux choses bougeaient sur cet écran, et pas trois."
                  />
                </>
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
              requires={['deux-grandeurs']}
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
                requires={['deux-grandeurs', 'tables-multiplication']}
                solved={doubleDone}
                onAnswered={() => setDoubleDone(true)}
              />
              {/* La prédiction vient d'être vérifiée par la machine : le
                  comportement peut être posé comme une règle observée. */}
              {doubleDone && (
                <KnowledgeBrick
                  id="double-double"
                  variant="new"
                  lead="Ta prédiction s’est vérifiée — et elle se vérifierait pour n’importe quelle quantité."
                />
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Jusqu’où va cette régularité ?',
          done: nomDone,
          content: (
            <div className="space-y-3">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-center font-mono text-sm text-slate-700 space-y-0.5">
                <p>2 jetons → {PRIX(2)} crêpes</p>
                <p>4 jetons → {PRIX(4)} crêpes</p>
              </div>
              <TapQuestion
                prompt="Et si on prenait la MOITIÉ des jetons — 1 au lieu de 2 ?"
                options={[`${PRIX(1)} crêpes, la moitié de ${PRIX(2)}`, `${PRIX(2) - 1} crêpes, une de moins`, `${PRIX(2)} crêpes, comme avant`]}
                correct={0}
                cols={1}
                explain={`${PRIX(1)} crêpes : la machine suit dans les deux sens. Moitié de jetons, moitié de crêpes — exactement comme double donnait double.`}
                explainWrong={`Enlever un jeton n’enlève pas une crêpe. Passer de 2 jetons à 1, c’est prendre la moitié : on obtient la moitié des crêpes, soit ${PRIX(1)}.`}
                requires={['double-double', 'deux-grandeurs']}
                solved={nomDone}
                onAnswered={() => setNomDone(true)}
              />
              {nomDone && (
                <Feedback tone="info">
                  Dans les deux sens, la machine suit exactement. Il reste à découvrir <strong>comment</strong>{' '}
                  elle calcule — et ce qu’on trouvera là mérite un nom.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <KnowledgeSnapshot moduleNumber={1}>
            <strong>La suite.</strong> Tu connais le comportement de la machine. Au prochain module, tu
            trouves l'opération exacte qui le produit — et elle porte un nom.
          </KnowledgeSnapshot>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Coins className="w-6 h-6 mx-auto text-indigo-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Deux grandeurs, une machine, et un comportement régulier.
            </p>
          </div>
        </motion.div>
      }
    />
  );
}
