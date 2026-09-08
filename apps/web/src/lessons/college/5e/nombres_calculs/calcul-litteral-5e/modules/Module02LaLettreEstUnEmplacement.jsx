import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SubstitutionLab from '../components/SubstitutionLab';
import { MOTIF_SIGNATURE, ecrire, valeur } from '../components/litteral';

/**
 * Module 2 — DÉCOUVERTE : ce qu'une lettre fait dans une expression.
 *
 * Le module 1 a produit une recette écrite en toutes lettres (« 2 × numéro de
 * l'étape + 1 »). Celui-ci la raccourcit, en introduisant la lettre à la seule
 * place où elle a un sens : celle du nombre qu'on refuse de fixer.
 *
 * Activity              donner plusieurs valeurs à la lettre et voir la MÊME
 *                       recette produire des résultats différents.
 * Mathematical objective une lettre est un EMPLACEMENT, pas une étiquette ni
 *                       une valeur secrète.
 * Visual consequence    la recette, affichée en haut, ne change JAMAIS ; seuls
 *                       la ligne de remplacement et le résultat changent.
 * Expected observation  « l'expression reste identique, c'est ce que je mets
 *                       dedans qui change ».
 * Misconception targeted croire que la lettre est l'initiale d'un mot, ou
 *                       qu'elle cache une valeur unique à deviner.
 */
const REGLE = MOTIF_SIGNATURE.regle;   // 2n + 1

export default function Module02LaLettreEstUnEmplacement() {
  const [n, setN] = useState(1);
  const [testees, setTestees] = useState(() => new Set([1]));
  const done1 = testees.size >= 4;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const tester = (v, react) => {
    setN(v);
    const next = new Set(testees);
    next.add(v);
    setTestees(next);
    if (next.size >= 4 && testees.size < 4) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Une seule recette, plusieurs nombres',
      subtitle: 'Voici la recette du module précédent, écrite en court. Essaie au moins quatre valeurs et surveille la ligne du haut.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <SubstitutionLab
            e={REGLE}
            n={n}
            onN={(v) => tester(v, kit.react)}
            valeurs={[1, 2, 3, 4, 10, 20]}
            ariaLabel="Choisir la valeur de la lettre"
          />
          {done1 ? (
            <Feedback tone="ok">
              La recette <strong className="font-mono">{ecrire(REGLE)}</strong> n’a{' '}
              <strong>jamais changé</strong> — pas une seule fois. Seul le nombre que tu as mis à la
              place de la lettre a changé, et donc le résultat. Cette lettre n’est ni un mystère,
              ni une étiquette : c’est simplement <strong>un trou qu’on remplit</strong>.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {testees.size} valeur{testees.size > 1 ? 's' : ''} essayée{testees.size > 1 ? 's' : ''} sur 4.
              La ligne « La recette » bouge-t-elle quand tu changes de nombre ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce que la lettre est — et n’est pas',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="calcul-litteral"
            variant="new"
            lead={<>Tu viens de mettre six nombres différents au même endroit, sans jamais toucher à la recette. Voilà exactement ce que fait une lettre.</>}
          />
          <TapQuestion
            prompt={<>Dans l’expression <span className="font-mono font-bold">{ecrire(REGLE)}</span>, que représente la lettre n ?</>}
            options={[
              'La place d’un nombre qu’on choisit librement',
              'L’initiale du mot « nombre »',
              'Une valeur secrète, toujours la même, qu’il faut deviner',
              'Le résultat du calcul',
            ]}
            correct={0}
            cols={1}
            requires={['calcul-litteral']}
            explain={`La lettre marque l’emplacement d’un nombre. On y met ce qu’on veut : avec n = 4 l’expression vaut ${valeur(REGLE, 4)}, avec n = 10 elle vaut ${valeur(REGLE, 10)}. C’est la même recette dans les deux cas.`}
            explainWrong="La lettre n’est pas choisie pour son sens : on aurait pu écrire x, a ou t sans rien changer. Et elle ne cache pas un nombre unique — tu viens toi-même d’en essayer plusieurs, tous valides."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Deux façons de s’en servir',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="inconnue-variable"
            variant="new"
            lead={<>La même lettre peut jouer deux rôles très différents, selon la question qu’on pose.</>}
          />
          <TapQuestion
            prompt="« Quelle étape du motif compte exactement 41 carreaux ? » — dans cette question, quel est le rôle de la lettre ?"
            options={[
              'Une inconnue : il n’y a qu’une seule réponse, et on la cherche',
              'Une variable : elle peut prendre toutes les valeurs',
              'Elle n’a aucun rôle : la question ne contient pas de lettre',
              'Elle désigne le nombre 41',
            ]}
            correct={0}
            cols={1}
            requires={['inconnue-variable', 'calcul-litteral']}
            explain="On cherche UNE étape précise, celle qui donne 41. Une seule convient (la 20ᵉ) : la lettre joue donc le rôle d’inconnue. Si on avait demandé « combien de carreaux à l’étape n ? », elle aurait été une variable."
            explainWrong="Le mot « quelle » signale qu’on cherche une valeur précise et unique. C’est la définition même d’une inconnue. Dans « combien de carreaux à l’étape n ? », au contraire, n reste libre : c’est une variable."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Inconnue ou variable ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={<p className="text-sm text-slate-700">Pour chaque question, quel est le rôle de la lettre ?</p>}
            rows={[
              {
                id: 'r1',
                label: 'Combien coûtent n places de cinéma à 8 € ?',
                options: ['Inconnue', 'Variable'],
                correct: 1,
                correction: 'n peut valoir 1, 2, 50… La formule 8n répond dans tous les cas : c’est une variable.',
              },
              {
                id: 'r2',
                label: 'Combien de places ai-je achetées si j’ai payé 56 € ?',
                options: ['Inconnue', 'Variable'],
                correct: 0,
                correction: 'Une seule réponse convient (7 places) : c’est une inconnue qu’on cherche.',
              },
              {
                id: 'r3',
                label: 'Quel est le périmètre d’un carré de côté c ?',
                options: ['Inconnue', 'Variable'],
                correct: 1,
                correction: 'c peut être n’importe quelle longueur ; la formule 4c répond pour toutes : c’est une variable.',
              },
            ]}
            requires={['inconnue-variable']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Le test est simple : si la question a <strong>une seule réponse</strong> qu’on
                  cherche, la lettre est une inconnue. Si elle en a{' '}
                  <strong>une infinité</strong> et qu’on écrit une recette valable pour toutes, la
                  lettre est une variable.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Demande-toi : « est-ce que je CHERCHE un nombre précis, ou
                  est-ce que je décris ce qui se passe pour <strong>n’importe quel</strong>{' '}
                  nombre ? » Le premier cas est une inconnue, le second une variable.
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
      moduleTitle="La lettre est un emplacement"
      moduleSubtitle="Une recette, tous les nombres"
      estimatedTime="11 min"
      brief={{
        tag: 'Découverte',
        title: 'Écrire la recette plus court',
        tone: 'indigo',
        body: (
          <p>
            Ta recette du module précédent fonctionne, mais elle est longue :{' '}
            <em>« 2 × le numéro de l’étape + 1 »</em>. On va la raccourcir en remplaçant ces cinq
            mots par <strong>une seule lettre</strong> — et découvrir au passage ce qu’une lettre
            fait vraiment dans un calcul.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
