import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TowerLab from '../components/TowerLab';
import {
  puissance, ecrirePuissance, produitEcrit, diagnostiquerPuissance, parseEntier,
} from '../components/puissances';

/**
 * Module 2 — DÉCOUVERTE : ce que compte exactement l'exposant.
 *
 * Le module 1 a installé le raccourci. Celui-ci en fixe le SENS, en attaquant
 * frontalement les deux confusions les plus tenaces :
 *   — lire aⁿ comme a × n ;
 *   — intervertir la base et l'exposant.
 *
 * Activity              comparer deux tours de facteurs côte à côte.
 * Mathematical objective l'exposant est un COMPTEUR de facteurs, pas un facteur.
 * Visual consequence    les deux tours n'ont ni la même hauteur, ni les mêmes
 *                       briques, ni le même total — la confusion devient
 *                       visuellement intenable.
 * Expected observation  « la hauteur de la tour, c'est l'exposant ; ce qu'il y
 *                       a dans les briques, c'est la base ».
 */
export default function Module02CeQueCompteLEtage() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Deux écritures qui se ressemblent',
      subtitle: 'Les mêmes chiffres, 2 et 5 — mais pas au même endroit. Regarde les deux tours.',
      done: q1,
      content: (
        <div className="space-y-3">
          <TowerLab a={{ base: 2, exposant: 5 }} b={{ base: 5, exposant: 2 }} />
          <TapQuestion
            prompt={<>D’après les tours, que vaut <span className="font-mono font-bold">{ecrirePuissance(2, 5)}</span> ?</>}
            options={['32', '25', '10', '7']}
            correct={0}
            cols={4}
            requires={['puissance']}
            explain={`${ecrirePuissance(2, 5)}, c’est cinq briques de 2 empilées : ${produitEcrit(2, 5)} = 32. La tour de droite, ${ecrirePuissance(5, 2)}, n’a que deux briques et donne 25.`}
            explainWrong="Compte les briques de la tour de gauche : il y en a cinq, et chacune vaut 2. Le total est donc 2 × 2 × 2 × 2 × 2 = 32, pas 25 (qui est l’autre tour) ni 10 (qui serait 2 × 5)."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Trois nombres différents',
      subtitle: 'Le troisième piège est le plus fréquent de tous.',
      done: q2,
      content: (
        <div className="space-y-3">
          <TowerLab a={{ base: 2, exposant: 5 }} b={{ base: 5, exposant: 2 }} montrerProduit />
          {/* Les trois valeurs sont maintenant sous les yeux de l'élève : la
              brique peut nommer ce qu'il vient de voir, avant toute demande. */}
          <KnowledgeBrick
            id="exposant"
            variant="new"
            lead={<>Trois écritures, trois nombres — et une seule règle pour ne plus les confondre.</>}
          />
          <KnowledgeBrick id="mem-exposant" variant="new" compact />
          <TapQuestion
            prompt={<>Que signifie exactement le petit 4 dans <span className="font-mono font-bold">{ecrirePuissance(3, 4)}</span> ?</>}
            options={[
              'Le facteur 3 apparaît 4 fois',
              'Il faut multiplier 3 par 4',
              'Le facteur 4 apparaît 3 fois',
              'Il faut ajouter 4 au résultat',
            ]}
            correct={0}
            cols={1}
            requires={['exposant', 'puissance']}
            explain={`Le nombre du haut COMPTE les facteurs : ${ecrirePuissance(3, 4)} = ${produitEcrit(3, 4)} = ${puissance(3, 4)}.`}
            explainWrong={`« Multiplier 3 par 4 » donnerait 12, et « le facteur 4 trois fois » donnerait ${puissance(4, 3)} : trois résultats différents pour trois lectures différentes. Le nombre du haut ne participe pas au calcul — il dit seulement combien de fois écrire celui du bas.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'À toi de calculer',
      done: q3,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<>Combien vaut <span className="font-mono font-bold">{ecrirePuissance(2, 6)}</span> ?</>}
            expected={puissance(2, 6)}
            parse={parseEntier}
            display={String(puissance(2, 6))}
            requires={['exposant', 'puissance']}
            explain={`${produitEcrit(2, 6)} = ${puissance(2, 6)}. On écrit six fois le facteur 2, puis on multiplie.`}
            explainFor={(rep) => {
              const d = diagnostiquerPuissance(2, 6, rep);
              if (d === 'multiplie') return 'Tu as calculé 2 × 6 = 12. Le nombre du haut ne se multiplie pas : il compte combien de fois écrire le 2. Ici, six fois — donc 2 × 2 × 2 × 2 × 2 × 2 = 64.';
              if (d === 'echange') return `Tu as calculé ${ecrirePuissance(6, 2)} = 36, en intervertissant les deux nombres. Le nombre du BAS est le facteur qu’on répète : c’est le 2. Six briques de 2 donnent 64.`;
              return `Écris les six facteurs en ligne puis multiplie : ${produitEcrit(2, 6)} = ${puissance(2, 6)}.`;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Traduire dans les deux sens',
      done: q4,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour chaque produit, quelle est l’écriture courte correspondante ?
              </p>
            }
            rows={[
              {
                id: 'e1',
                label: produitEcrit(7, 3),
                options: [ecrirePuissance(7, 3), ecrirePuissance(3, 7), '7 × 3'],
                correct: 0,
                correction: `Le facteur 7 apparaît 3 fois : ${ecrirePuissance(7, 3)} = ${puissance(7, 3)}.`,
              },
              {
                id: 'e2',
                label: produitEcrit(10, 4),
                options: [ecrirePuissance(4, 10), ecrirePuissance(10, 4), '40'],
                correct: 1,
                correction: `Le facteur 10 apparaît 4 fois : ${ecrirePuissance(10, 4)} = ${puissance(10, 4)}.`,
              },
              {
                id: 'e3',
                label: produitEcrit(5, 2),
                options: [ecrirePuissance(2, 5), ecrirePuissance(5, 2), '10'],
                correct: 1,
                correction: `Le facteur 5 apparaît 2 fois : ${ecrirePuissance(5, 2)} = ${puissance(5, 2)}.`,
              },
            ]}
            requires={['exposant', 'puissance', 'mem-exposant']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Le réflexe est en place : on repère <strong>le facteur qui se répète</strong> — il
                  va en bas — puis on <strong>compte combien de fois</strong> il est écrit — ce
                  nombre va en haut.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. La méthode ne change jamais : le nombre qu’on voit
                  plusieurs fois va <strong>en bas</strong>, et le nombre de fois qu’on le voit va{' '}
                  <strong>en haut</strong>. Il ne faut jamais les intervertir.
                </Feedback>
              )
            }
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Deux tours, deux nombres"
      moduleSubtitle="Ce que compte exactement le nombre du haut"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Les mêmes chiffres, deux nombres',
        tone: 'indigo',
        body: (
          <p>
            Tu sais maintenant écrire court. Reste une question redoutable :{' '}
            <strong className="font-mono">{ecrirePuissance(2, 5)}</strong> et{' '}
            <strong className="font-mono">{ecrirePuissance(5, 2)}</strong> utilisent exactement les
            mêmes chiffres. Donnent-ils le même nombre ? Empile les facteurs et regarde.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
