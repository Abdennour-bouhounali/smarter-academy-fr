import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PyLab from '../components/PyLab';

/**
 * Module 5 — l'atelier : prévoir, compléter, réparer.
 *
 * Chaque étape impose l'ordre « je prédis, PUIS j'exécute » : la prédiction est
 * une question fermée, la vérification est le labo. Les trois programmes sont
 * vérifiés à l'interpréteur (somme 1..10 = 55, la version buggée = 45, l'échange
 * a=8 b=3, le compteur de pairs = 10).
 */
const TRACE_SRC = `a = 3
b = 8
a = a + b
b = a - b
a = a - b
print(a)
print(b)`;

const BUG_SRC = `total = 0
for i in range(1, 10):
    total = total + i
print(total)`;

const COUNT_SRC = `c = 0
for i in range(1, 21):
    if i % 2 == 0:
        c = c + 1
print(c)`;

export default function Module05LireCompleterReparer() {
  const [pred1, setPred1] = useState(false);
  const [ran1, setRan1] = useState(false);
  const [pred2, setPred2] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [q3, setQ3] = useState(false);
  const [ran3, setRan3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Prévoir',
      subtitle: 'Lis le programme, annonce ce qu’il affiche, puis exécute pour te vérifier.',
      done: pred1 && ran1,
      content: (kit) => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="methode-tracer"
            variant="new"
            lead={<>Le geste du programmeur, avant toute exécution.</>}
          />
          <NumericQuestion
            prompt={<span>Après ces cinq lignes, que vaut <span className="font-mono">a</span> ? (annonce avant d’exécuter)</span>}
            answer={8}
            requires={['methode-tracer', 'affectation', 'regle-ordre-affectation']}
            explain="a = 3 + 8 = 11 ; b = 11 − 8 = 3 ; a = 11 − 3 = 8. Les deux valeurs ont été échangées sans troisième variable."
            explainWrong="Suis les lignes une par une en notant les deux valeurs à chaque fois. Chaque ligne calcule la droite avec les valeurs de CE moment-là."
            solved={pred1} onAnswered={() => setPred1(true)}
          />
          {pred1 && (
            <PyLab
              initial={TRACE_SRC}
              label="Vérifie ta prévision"
              onRun={({ output }) => { if (output.length >= 2 && !ran1) { setRan1(true); kit.react?.(true); } }}
            />
          )}
          {ran1 && (
            <Feedback tone="ok">
              <span className="font-mono">8</span> puis <span className="font-mono">3</span> : les deux valeurs
              ont bien été échangées. Trois affectations, aucune variable supplémentaire.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Réparer',
      subtitle: 'Ce programme doit afficher la somme des entiers de 1 à 10. Il affiche 45. Corrige-le.',
      done: pred2 && fixed,
      content: (kit) => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="methode-verifier"
            variant="new"
            lead={<>Avant de chercher dans le code, compare au résultat attendu.</>}
          />
          <TapQuestion
            prompt="La somme de 1 à 10 vaut 55, le programme affiche 45. Où est l’erreur ?"
            options={[
              'range(1, 10) s’arrête à 9 : il manque le terme 10',
              'total n’est pas initialisé',
              'l’indentation est fausse',
              'il faut écrire total += i',
            ]}
            correct={0} cols={1}
            requires={['boucle-for', 'methode-verifier']}
            explain="55 − 45 = 10 : c’est exactement le terme manquant. La borne de droite d’un range est exclue, il faut écrire range(1, 11)."
            explainWrong="Compare les deux résultats : l’écart vaut 10, le dernier terme attendu. C’est la borne de la boucle qui est en cause, pas l’initialisation."
            solved={pred2} onAnswered={() => setPred2(true)}
          />
          {pred2 && (
            <>
              <PyLab
                initial={BUG_SRC}
                label="Répare, puis exécute jusqu’à obtenir 55"
                onRun={({ output }) => {
                  if (output.includes('55') && !fixed) { setFixed(true); kit.react?.(true); }
                }}
              />
              {fixed ? (
                <Feedback tone="ok">
                  <strong>55.</strong> Un seul caractère séparait le programme faux du programme juste —
                  et c’est le résultat attendu, pas le code, qui te l’a révélé.
                </Feedback>
              ) : (
                <Feedback tone="info">Modifie la borne du <span className="font-mono">range</span> et réexécute.</Feedback>
              )}
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Compléter',
      subtitle: 'Ce programme compte les nombres pairs de 1 à 20. Prévois le résultat, puis exécute.',
      done: q3 && ran3,
      content: (kit) => (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<span>Combien affiche ce programme ? (<span className="font-mono">i % 2 == 0</span> teste « le reste de la division par 2 est nul »)</span>}
            answer={10}
            requires={['boucle-for', 'conditionnelle', 'methode-tracer']}
            explain="Un entier sur deux entre 1 et 20 est pair : 2, 4, …, 20, soit 10 nombres. Le compteur c est augmenté à chacun d’eux."
            explainWrong="La boucle parcourt 1, 2, …, 20. Le if ne laisse passer que les pairs : compte-les."
            solved={q3} onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <PyLab
              initial={COUNT_SRC}
              label="Vérifie, puis essaie jusqu’à 30"
              onRun={({ output }) => { if (output.length && !ran3) { setRan3(true); kit.react?.(true); } }}
            />
          )}
          {ran3 && (
            <Feedback tone="ok">
              Une boucle, une condition, un compteur : ces trois briques ensemble suffisent à
              répondre à une question qu’aucune formule simple ne donne. Change la borne à 30 pour voir.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Lire, compléter, réparer"
      moduleSubtitle="Trois programmes, trois gestes"
      estimatedTime="10 min"
      brief={{
        tag: '🛠️ Mission 05',
        title: 'Un programmeur passe plus de temps à lire du code qu’à en écrire.',
        tone: 'indigo',
        body: <p>Prévois avant d’exécuter, compare au résultat attendu, corrige. Trois programmes pour ces trois gestes.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          Ta carte est complète : variables, affectation, condition, boucles, vérification.
          Le test final va les mesurer une par une.
        </KnowledgeSnapshot>
      )}
    />
  );
}
