import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PyLab from '../components/PyLab';

/**
 * Module 2 — plusieurs arguments, et la portée.
 *
 * L'ordre des arguments se démontre sur une fonction NON SYMÉTRIQUE : avec
 * aire(L, l) = L * l, échanger les arguments donne le même résultat et ne
 * prouve rien. Avec un pourcentage — remise(prix, taux) — l'échange saute aux
 * yeux. Sorties vérifiées à l'interpréteur avant écriture.
 */
const REMISE = `def remise(prix, taux):
    return prix - prix * taux / 100

print(remise(200, 10))
print(remise(10, 200))`;

const PORTEE = `def calcul(x):
    resultat = x * x
    return resultat

print(calcul(5))
print(resultat)`;

export default function Module02UnOuPlusieursArguments() {
  const [ranR, setRanR] = useState(false);
  const [q1, setQ1] = useState(false);
  const [ranP, setRanP] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Deux valeurs, dans un ordre',
      subtitle: 'Une remise de 10 % sur 200 €. Le deuxième appel donne les mêmes nombres, échangés. Exécute.',
      done: ranR && q1,
      content: (kit) => (
        <div className="space-y-3">
          <PyLab
            initial={REMISE}
            label="Prix et taux"
            onRun={({ output }) => { if (output.length >= 2 && !ranR) { setRanR(true); kit.react?.(true); } }}
          />
          {ranR && (
            <>
              <Feedback tone="ok">
                <strong>180</strong> puis <strong>−10</strong>. Mêmes nombres, ordre inversé, résultat
                absurde : une remise ne rend pas un prix négatif. Les valeurs sont distribuées par leur
                <strong> position</strong>, jamais par leur sens.
              </Feedback>
              <KnowledgeBrick
                id="parametre-argument"
                variant="new"
                lead={<>Les deux mots qui distinguent ce qui est écrit dans la définition de ce qui est donné à l’appel.</>}
              />
              <KnowledgeBrick id="regle-ordre-arguments" variant="new" />
              <TapQuestion
                prompt={<span>Avec <span className="font-mono">def imc(masse, taille)</span>, quel appel calcule l’IMC d’une personne de 60 kg mesurant 1,70 m ?</span>}
                options={['imc(60, 1.7)', 'imc(1.7, 60)', 'imc(masse, taille)', 'imc(60 ; 1.7)']}
                correct={0} cols={2}
                requires={['parametre-argument', 'regle-ordre-arguments']}
                explain="La masse est le premier paramètre, donc le premier argument : imc(60, 1.7). On écrit des VALEURS à l’appel, pas les noms des paramètres, et la virgule sépare (jamais le point-virgule)."
                explainWrong="Regarde l’en-tête de la définition : masse d’abord, taille ensuite. L’appel doit suivre le même ordre."
                solved={q1} onAnswered={() => setQ1(true)}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce qui naît dans la fonction y reste',
      subtitle: 'La fonction calcule bien. La dernière ligne essaie de lire sa variable interne. Exécute.',
      done: ranP,
      content: (kit) => (
        <div className="space-y-3">
          <PyLab
            initial={PORTEE}
            label="Sortir une variable de la fonction ?"
            onRun={({ output, error }) => { if ((error || output.length) && !ranP) { setRanP(true); kit.react?.(true); } }}
          />
          {ranP && (
            <>
              <Feedback tone="ok">
                <span className="font-mono">25</span> s’affiche, puis une erreur : <strong>resultat n’existe pas</strong> hors
                de la fonction. Elle a bien été créée — le temps de l’appel — puis effacée. Pour faire
                sortir une valeur, il n’y a qu’un chemin : <span className="font-mono">return</span>.
              </Feedback>
              <KnowledgeBrick
                id="portee-locale"
                variant="new"
                lead={<>Ce comportement n’est pas un défaut : c’est une protection, et elle porte un nom.</>}
              />
              <KnowledgeBrick id="mem-locale-reste-locale" variant="new" />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Reconnaître les appels valides',
      done: q3,
      content: () => (
        <BatchChoiceQuestion
          intro={<p className="text-sm text-slate-600">La fonction est <span className="font-mono">def vitesse(distance, duree)</span>. Chaque ligne est-elle un appel correct ?</p>}
          rows={[
            { id: 'r1', label: 'vitesse(120, 2)', options: ['Correct', 'Incorrect'], correct: 0, correction: 'Deux arguments, dans l’ordre : correct.' },
            { id: 'r2', label: 'vitesse(120)', options: ['Correct', 'Incorrect'], correct: 1, correction: 'Un seul argument alors que la fonction en attend deux : Python refuse.' },
            { id: 'r3', label: 'vitesse(120, 2, 3)', options: ['Correct', 'Incorrect'], correct: 1, correction: 'Trois arguments pour deux paramètres : Python refuse également.' },
            { id: 'r4', label: 'vitesse()', options: ['Correct', 'Incorrect'], correct: 1, correction: 'Aucun argument : les deux paramètres resteraient sans valeur.' },
          ]}
          requires={['parametre-argument', 'appel-fonction']}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Les quatre.' : `${nCorrect} sur ${total}.`} La règle est stricte : <strong>autant
              d’arguments que de paramètres</strong>, ni plus ni moins. Python le vérifie à chaque appel
              et refuse d’exécuter sinon.
            </Feedback>
          )}
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Un ou plusieurs arguments"
      moduleSubtitle="L’ordre compte, et la portée protège"
      estimatedTime="12 min"
      brief={{
        tag: '📥 Mission 02',
        title: 'Une remise de 10 % sur 200 €, ou de 200 % sur 10 € ?',
        tone: 'indigo',
        body: <p>Les mêmes nombres, dans l’autre ordre, et le prix devient négatif. La position des arguments n’est pas un détail.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          Tu sais appeler une fonction écrite d’avance. Il est temps d’écrire la tienne,
          à partir d’une formule.
        </KnowledgeSnapshot>
      )}
    />
  );
}
