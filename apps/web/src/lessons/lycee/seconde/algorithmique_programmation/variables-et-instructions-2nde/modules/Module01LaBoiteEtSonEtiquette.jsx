import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PyLab from '../components/PyLab';

/**
 * Module 1 — LA manipulation signature : exécuter un vrai programme.
 *
 * Activité               modifier un programme et l'exécuter
 * Geste de l'élève       éditer le code, cliquer sur « Exécuter »
 * Observation attendue   la sortie ET les variables finales changent avec le code
 * Obstacle visé          « un programme, ça se lit » — non, ça s'exécute, et
 *                        c'est l'exécution qui dit la vérité.
 *
 * Le programme est réellement interprété (components/pyRun.js, 27 tests) :
 * aucune sortie n'est écrite à la main dans ce module.
 */
const P1 = `prix = 12
quantite = 3
total = prix * quantite
print(total)`;

const P2 = `age = 15
taille = 1.62
majeur = False
nom = "Lina"
print(nom)
print(age)`;

export default function Module01LaBoiteEtSonEtiquette() {
  const [ran, setRan] = useState(false);
  const [changed, setChanged] = useState(false);
  const [pred, setPred] = useState(null);
  const [ranTypes, setRanTypes] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = ran && changed;

  const steps = [
    {
      num: 1,
      title: 'Ton premier programme',
      subtitle: 'Exécute-le tel quel. Puis change une valeur — le prix, la quantité — et exécute à nouveau.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="que va afficher ce programme ?"
            options={[{ id: '36', label: '36' }, { id: '12', label: '12' }, { id: 'total', label: 'total' }]}
            value={pred} onChange={setPred} disabled={done1}
          />
          <PyLab
            initial={P1}
            label="Programme du total"
            onRun={({ output, source }) => {
              setRan(true);
              if (source.trim() !== P1.trim()) { if (!changed) kit.react?.(true); setChanged(true); }
            }}
          />
          {done1 ? (
            <>
              <Feedback tone="ok">
                {pred === '36' ? 'Ta prédiction tenait' : 'Le programme a tranché'} : il affiche
                <strong> 36</strong>, pas « total ». Et en changeant une valeur, la sortie a suivi —
                sans que tu réécrives le calcul. Trois noms, trois valeurs, et un résultat qui se
                recalcule : c’est tout l’intérêt.
              </Feedback>
              <KnowledgeBrick
                id="variable-informatique"
                variant="new"
                lead={<>Ce que tu viens de manipuler — un nom qui désigne une valeur modifiable — porte un nom précis.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              {!ran ? 'Clique sur « ▶ Exécuter ». ' : ''}{ran && !changed ? 'Maintenant change une valeur dans le code, puis exécute encore.' : ''}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Quatre sortes de valeurs',
      subtitle: 'Exécute ce second programme et regarde le bandeau bleu : chaque variable y apparaît avec sa valeur.',
      done: ranTypes,
      content: (kit) => (
        <div className="space-y-3">
          <PyLab
            initial={P2}
            label="Programme des types"
            onRun={() => { if (!ranTypes) kit.react?.(true); setRanTypes(true); }}
          />
          {ranTypes && (
            <>
              <Feedback tone="ok">
                Quatre valeurs, quatre natures : <strong>15</strong> est un entier, <strong>1.62</strong>
                un nombre à virgule, <strong>False</strong> un booléen, <strong>"Lina"</strong> une chaîne
                de caractères — reconnaissable à ses guillemets. Le type n’est pas un détail : il décide
                de ce qu’on peut faire avec la valeur.
              </Feedback>
              <KnowledgeBrick
                id="types-python"
                variant="new"
                lead={<>Ces quatre natures ont chacune un nom, et tu les rencontreras dans tous les messages d’erreur.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Reconnaître un type',
      done: q3,
      content: () => (
        <BatchChoiceQuestion
          intro={<p className="text-sm text-slate-600">Quel est le type de chaque valeur ?</p>}
          rows={[
            { id: 'r1', label: '42', options: ['int', 'float', 'str'], correct: 0, correction: 'Un entier, sans virgule.' },
            { id: 'r2', label: '3.0', options: ['float', 'int', 'str'], correct: 0, correction: 'La virgule en fait un flottant, MÊME si la valeur est ronde.' },
            { id: 'r3', label: '"7"', options: ['str', 'int', 'bool'], correct: 0, correction: 'Les guillemets en font une chaîne : c’est le CARACTÈRE 7, pas le nombre.' },
            { id: 'r4', label: 'True', options: ['bool', 'str', 'int'], correct: 0, correction: 'Un booléen : vrai ou faux, rien d’autre.' },
          ]}
          requires={['types-python', 'variable-informatique']}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Les quatre.' : `${nCorrect} sur ${total}.`} Les deux pièges sont
              <strong> 3.0</strong>, flottant malgré son air d’entier, et <strong>"7"</strong>, chaîne
              malgré son air de nombre. Les guillemets changent tout.
            </Feedback>
          )}
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Quand le type coince',
      done: q4,
      content: () => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="mem-nom-valeur-type"
            variant="new"
            lead={<>Trois questions à se poser devant toute variable — et la troisième explique la plupart des erreurs.</>}
          />
          <TapQuestion
            prompt={<span>Le programme <span className="font-mono">print("âge : " + 15)</span> plante. Pourquoi ?</span>}
            options={[
              'On ne peut pas additionner une chaîne et un entier : il faut str(15)',
              'Parce que 15 est trop petit',
              'Parce qu’il manque des parenthèses',
              'Parce qu’une chaîne ne peut pas contenir d’accent',
            ]}
            correct={0} cols={1}
            requires={['types-python', 'mem-nom-valeur-type']}
            explain="Le + additionne deux nombres OU colle deux chaînes, mais ne mélange pas les deux : Python ne devine pas ce qu’on veut. On convertit d’abord : « âge : » + str(15)."
            explainWrong="Ce n’est ni la taille du nombre ni la ponctuation : c’est le TYPE. Une chaîne et un entier ne s’additionnent pas."
            solved={q4} onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La boîte et son étiquette"
      moduleSubtitle="Un nom, une valeur, un type"
      estimatedTime="13 min"
      brief={{
        tag: '💻 Mission 01',
        title: 'Un programme ne se lit pas : il s’exécute.',
        tone: 'indigo',
        body: <p>L’éditeur ci-dessous exécute vraiment ton code. Change une ligne, relance, et regarde la sortie te répondre.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          Tu sais créer des variables et lire leur type. Reste le signe le plus trompeur de la
          programmation : le « = ».
        </KnowledgeSnapshot>
      )}
    />
  );
}
