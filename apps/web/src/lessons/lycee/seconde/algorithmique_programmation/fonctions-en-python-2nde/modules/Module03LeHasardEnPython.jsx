import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PyLab from '../components/PyLab';

/**
 * Module 3 — randint et la simulation (P9, P11).
 *
 * L'élève exécute PLUSIEURS fois le même programme et constate que la sortie
 * change : c'est le fait fondateur du chapitre, et aucune phrase ne peut le
 * remplacer. Le compteur d'exécutions rend la répétition obligatoire.
 */
const DE = `def lancer():
    return randint(1, 6)

print(lancer())
print(lancer())
print(lancer())`;

const SERIE = `def lancer():
    return randint(1, 6)

serie = []
for i in range(10):
    serie.append(lancer())
print(serie)`;

export default function Module05LeHasardEnPython() {
  const [runs, setRuns] = useState(0);
  const [outs, setOuts] = useState([]);
  const [ranS, setRanS] = useState(false);
  const [q3, setQ3] = useState(false);

  const varied = outs.length >= 2 && new Set(outs).size >= 2;
  const done1 = runs >= 2 && varied;

  const steps = [
    {
      num: 1,
      title: 'Le même programme, deux résultats',
      subtitle: 'Exécute. Puis exécute encore, sans rien changer au code.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PyLab
            initial={DE}
            label="Trois lancers de dé"
            onRun={({ output }) => {
              const joined = output.join(',');
              // Jamais kit.react() dans un updater : React ré-exécute l'updater
              // pendant le rendu et l'effet du kit déclencherait un setState
              // d'un autre composant.
              const next = [...outs, joined];
              if (next.length >= 2 && new Set(next).size >= 2) kit.react?.(true);
              setRuns((r) => r + 1);
              setOuts(next);
            }}
          />
          {runs === 0 && (
            <Feedback tone="info">
              Ce programme définit un dé à six faces. Exécute-le une première fois.
            </Feedback>
          )}
          {runs === 1 && (
            <Feedback tone="info">
              Note tes trois nombres, puis <strong>réexécute sans rien changer</strong>. Tu devrais obtenir autre chose.
            </Feedback>
          )}
          {done1 && (
            <>
              <Feedback tone="ok">
                Même code, résultats différents : ce n’est pas un bug. <span className="font-mono">randint</span> tire
                un entier au hasard à chaque appel — c’est ce qui permet de simuler une expérience aléatoire.
              </Feedback>
              <KnowledgeBrick
                id="randint"
                variant="new"
                lead={<>La fonction qui a produit ces nombres.</>}
              />
              <KnowledgeBrick
                id="regle-bornes-randint"
                variant="new"
                lead={<>Attention : elle ne se comporte pas comme <span className="font-mono">range</span>.</>}
              />
              <KnowledgeBrick id="simulation" variant="new" />
            </>
          )}
          {runs === 1 && !varied && outs.length === 1 && null}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Dix lancers d’un coup',
      subtitle: 'Dix tirages d’un coup, rangés au fur et à mesure. Exécute plusieurs fois.',
      done: ranS,
      content: (kit) => (
        <div className="space-y-3">
          <PyLab
            initial={SERIE}
            label="Une série de dix lancers"
            onRun={({ output }) => { if (output.length && !ranS) { setRanS(true); kit.react?.(true); } }}
          />
          {ranS && (
            <Feedback tone="ok">
              Dix lancers en une exécution. Le 6 sort parfois plusieurs fois, parfois pas du tout —
              sur dix essais, c’est normal. Augmente le nombre de tours pour voir ce que ça change.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Les bornes de randint',
      done: q3,
      content: () => (
        <TapQuestion
          prompt={<span>Quelles valeurs <span className="font-mono">randint(1, 6)</span> peut-il renvoyer ?</span>}
          options={['1, 2, 3, 4, 5 ou 6', '1, 2, 3, 4 ou 5', '0, 1, 2, 3, 4, 5 ou 6', 'N’importe quel nombre entre 1 et 6, virgule comprise']}
          correct={0} cols={1}
          requires={['randint', 'regle-bornes-randint']}
          explain="randint inclut ses DEUX bornes — c’est exactement ce qu’il faut pour un dé. Attention au contraste avec range(1, 6), qui s’arrête à 5 : deux fonctions, deux conventions."
          explainWrong="randint n’exclut pas sa borne de droite, contrairement à range. Et il renvoie toujours un entier."
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le hasard en Python"
      moduleSubtitle="Un dé qui ne pèse rien"
      estimatedTime="12 min"
      brief={{
        tag: '🎲 Mission 03',
        title: 'Exécute deux fois le même programme. Tu n’obtiendras pas la même chose.',
        tone: 'amber',
        body: <p>Jusqu’ici tes fonctions étaient prévisibles. Celle-ci va tirer au sort — et c’est ce qui rend la simulation possible.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          Dix lancers ne disent pas grand-chose. Mille, en revanche…
        </KnowledgeSnapshot>
      )}
    />
  );
}
