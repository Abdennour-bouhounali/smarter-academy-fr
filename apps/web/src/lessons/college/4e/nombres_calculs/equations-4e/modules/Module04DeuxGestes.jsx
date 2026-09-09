import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { equation, expr, isSolvedForm, texEquation } from '../../../../../common/algebra4e';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BalanceWorkbench, { gestesLegaux } from '../components/BalanceWorkbench';

/**
 * Module 4 — MANIPULATION : ax + b = c, en deux gestes ordonnés.
 *
 * Activity              résoudre 5x − 4 = 11 sur la balance, avec les gestes
 *                       des deux natures disponibles — donc avec la
 *                       possibilité de diviser EN PREMIER et de constater ce
 *                       que ça donne.
 * Mathematical objective l'ordre n'est pas une convention : le coefficient
 *                       multiplie x SEUL, pas « x − 4 ». Diviser d'abord
 *                       oblige à diviser aussi la constante et fait
 *                       apparaître des fractions — l'équation reste vraie,
 *                       mais devient plus difficile. C'est une question
 *                       d'efficacité, pas de légalité, et le module le dit
 *                       ainsi plutôt que d'interdire.
 * Expected observation  « si je divise d'abord, je me retrouve avec des
 *                       fractions ; si j'enlève d'abord, tout reste entier ».
 * Misconception targeted « 5x − 4 = 11 donne 5x = 11 − 4 » (retirer au lieu
 *                       d'ajouter) et « on divise d'abord parce que la
 *                       multiplication est prioritaire » — la priorité
 *                       opératoire s'applique au CALCUL, pas à sa défaite.
 *
 * Le noyau étant en rationnels EXACTS, le chemin « division d'abord » affiche
 * 11/5 et non 2,2000000000000002 : l'élève voit une vraie fraction, et la
 * leçon peut en parler.
 */
const EQ = equation(expr(5, -4), expr(0, 11));   // 5x − 4 = 11, solution 3

export default function Module04DeuxGestes() {
  const [hist, setHist] = useState([EQ]);
  const eq = hist[hist.length - 1];
  const resolu = isSolvedForm(eq);
  const [aDiviseDabord, setADiviseDabord] = useState(false);

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Deux gênes à la fois',
      subtitle: 'Le x est multiplié par 5 ET accompagné d’un −4. Deux gestes seront nécessaires — mais dans quel ordre ?',
      done: resolu,
      content: (kit) => (
        <div className="space-y-3">
          <BalanceWorkbench
            historique={hist}
            probe={3}
            gestes={gestesLegaux(eq, { ajouts: [4], retraits: [4], divisions: [5] })}
            onGeste={(next, geste) => {
              setHist([...hist, next]);
              // Le premier geste est une division ? On le note, pour pouvoir
              // en parler — sans jamais l'empêcher.
              if (hist.length === 1 && geste.id.startsWith('div-')) setADiviseDabord(true);
              if (isSolvedForm(next) && !resolu) kit.react(true);
            }}
            onAnnuler={() => setHist(hist.slice(0, -1))}
            onRecommencer={() => { setHist([EQ]); setADiviseDabord(false); }}
          />
          {resolu ? (
            <Feedback tone="ok">
              <strong>x = 3</strong>, et la vérification tombe juste : 5 × 3 − 4 = 11 ✓
              {aDiviseDabord ? (
                <>
                  {' '}Tu as divisé <strong>en premier</strong> : ça marche — la balance est restée
                  droite tout du long — mais tu as dû passer par des <strong>fractions</strong>. En
                  enlevant d’abord le −4, tout serait resté entier. Essaie l’autre ordre avec
                  « Recommencer » pour comparer.
                </>
              ) : (
                <>
                  {' '}Tu as enlevé le <strong>−4</strong> d’abord, puis divisé par 5 : les nombres
                  sont restés entiers d’un bout à l’autre. Essaie maintenant l’ordre inverse avec
                  « Recommencer » — c’est instructif.
                </>
              )}
            </Feedback>
          ) : hist.length > 1 ? (
            <Feedback tone="info">
              Bien. Il reste une gêne à défaire. Regarde ce qu’il y a autour du x maintenant.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Deux gestes sont possibles en premier. Les deux mènent à la solution — mais pas avec
              la même facilité.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Pourquoi cet ordre',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="resoudre-ax-plus-b"
            variant="new"
            lead={<>Les deux ordres t’ont donné la même solution, mais pas le même travail. La raison tient à ce que le coefficient multiplie exactement.</>}
          />
          <TapQuestion
            prompt={<span>Pour résoudre <MathText>{'$4x + 6 = 26$'}</MathText> le plus simplement, par quoi commence-t-on ?</span>}
            options={[
              'On divise d’abord par 4, car la multiplication est prioritaire',
              'On retire d’abord 6 des deux côtés, puis on divise par 4',
              'On retire 6 puis on retire 4',
              'On divise par 4 puis par 6',
            ]}
            correct={1}
            cols={1}
            requires={['resoudre-ax-plus-b', 'defaire-une-operation']}
            explain="On retire 6 : 4x = 20, puis on divise par 4 : x = 5. Diviser d’abord donnerait x + 1,5 = 6,5 — c’est juste, et on retombe bien sur x = 5, mais on a fabriqué des virgules pour rien. La priorité opératoire dit dans quel ordre CALCULER, pas dans quel ordre défaire."
            explainWrong="Retirer 4 ne défait pas une multiplication : dans 4x, le 4 multiplie x. Et diviser par 6 ne défait rien du tout ici. Le bon enchaînement est : d’abord la constante, ensuite le coefficient."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Résous seul',
      done: q3,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<span>Résous <MathText>{'$3x + 8 = 23$'}</MathText>. Que vaut x ?</span>}
            expected={5}
            requires={['resoudre-ax-plus-b']}
            explain="On retire 8 des deux côtés : 3x = 15. On divise par 3 : x = 5. Vérification : 3 × 5 + 8 = 23 ✓"
            explainFor={(n) =>
              n === 15
                ? "Tu t’es arrêté à 3x = 15 : il reste à diviser par 3, ce qui donne x = 5."
                : n === 31
                ? "Tu as ajouté 8 au lieu de le retirer. Pour faire disparaître un « + 8 », on retire 8 — des deux côtés."
                : "Deux gestes : retirer 8 (il vient 3x = 15), puis diviser par 3 (il vient x = 5)."
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Deux gestes"
      moduleSubtitle="D’abord enlever, ensuite partager"
      estimatedTime="13 min"
      brief={{
        tag: 'Manipulation',
        title: 'Quand les deux gênes se cumulent',
        tone: 'indigo',
        body: (
          <p>
            <MathText>{'$5x - 4 = 11$'}</MathText> : le x est <strong>multiplié</strong> et{' '}
            <strong>accompagné d’un nombre</strong>. Il faudra donc deux gestes. Les deux ordres
            fonctionnent — mais l’un des deux te fera beaucoup moins travailler.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
