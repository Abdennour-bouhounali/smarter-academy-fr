import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { parseDec } from '@smarter-academy/core';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import CrossTableView from '../../../../../common/stats/CrossTableView';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { lyceeTable } from '../data';

/**
 * Module 2 — DÉCOUVERTE : mettre une notation sur le geste du module 1.
 *
 * L'ordre est délibéré : l'élève a DÉJÀ restreint l'univers à la main, on
 * ne fait donc ici que nommer (P_A(B), « sachant que ») et écrire la
 * formule — jamais l'inverse. Le tableau croisé arrive maintenant comme un
 * outil de calcul commode, pas comme un nouvel objet à découvrir : sa
 * construction appartient à la leçon « Tableaux croisés ».
 *
 * Le piège travaillé ici est la confusion entre P(A ∩ B) (÷ 800) et
 * P_A(B) (÷ 200) — deux quotients de même numérateur.
 */
const T = lyceeTable();

export default function Module02LaNotationSachantQue() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Une écriture pour la condition',
      subtitle: 'Le même calcul qu’au module 1, avec des symboles.',
      done: q1,
      content: (
        <KnowledgeBrick
          id="notation-sachant"
          variant="new"
          lead="Au module 1, tu as éteint une partie de la population pour ne garder que les internes, et la probabilité a changé. Voici le nom et l’écriture de ce que tu as fait."
        >
          <TapQuestion
            prompt="Dans l’écriture P_A(B), quel événement joue le rôle de condition ?"
            options={['A, l’événement en indice', 'B, l’événement entre parenthèses', 'Les deux à la fois', 'Aucun des deux']}
            correct={0} cols={2}
            requires={['notation-sachant']}
            explain="L’indice porte la condition : A restreint l’univers, et c’est n(A) qui devient le dénominateur. B est l’événement dont on calcule la probabilité DANS cet univers."
            explainWrong="Retiens la lecture : « probabilité de B SACHANT A ». Ce qui suit « sachant » est en indice, et c’est la condition."
            solved={q1} onAnswered={() => setQ1(true)}
          />
        </KnowledgeBrick>
      ),
    },
    {
      num: 2,
      title: 'Lire le tableau pour calculer',
      subtitle: 'Le tableau croisé donne directement les effectifs dont tu as besoin.',
      done: q2,
      content: (
        <div className="space-y-3">
          <CrossTableView table={T} rowsTitle="Régime" colsTitle="Sport" />
          <NumericQuestion
            prompt="Avec A = « être externe » et B = « être en club », combien vaut P_A(B) en pourcentage ?"
            expected={(n) => Math.abs(n - 50) < 0.5}
            parse={parseDec}
            display="50 %"
            suffix="%"
            requires={['notation-sachant', 'univers-restreint', 'tableau-double-entree', 'effectif', 'pourcentage', 'quotient']}
            explain="La condition « externe » impose le dénominateur : 600 externes. Parmi eux, 300 sont en club, donc 300/600 = 0,50 = 50 %."
            explainFor={(n) => (Math.abs(n - 37.5) < 0.5
              ? 'Tu as divisé par 800 : c’est P(A ∩ B), la probabilité d’être externe ET en club, pas la conditionnelle. La condition impose 600 au dénominateur.'
              : null)}
            solved={q2} onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Intersection ou conditionnelle ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 space-y-1">
            <p><strong>Deux questions, un même numérateur (150 élèves) :</strong></p>
            <p>· « Quelle est la probabilité d’être interne <strong>et</strong> en club ? » → 150/800</p>
            <p>· « Sachant qu’il est interne, quelle est la probabilité d’être en club ? » → 150/200</p>
          </div>
          <TapQuestion
            prompt="On tire un élève au hasard parmi les 800. La probabilité qu’il soit à la fois interne et en club vaut…"
            options={['18,75 %', '75 %', '33,3 %', '56,3 %']}
            correct={0} cols={4}
            requires={['notation-sachant', 'univers-restreint', 'probabilite', 'denominateur', 'pourcentage']}
            explain="Sans condition, l’univers reste les 800 élèves : 150/800 = 0,1875, soit 18,75 %. Les 75 % correspondent à P_interne(club) — une autre question, posée dans un univers plus petit."
            explainWrong="Aucune condition n’est imposée ici : le dénominateur reste 800. On calcule P(A ∩ B), pas une probabilité conditionnelle."
            solved={q3} onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="La notation « sachant que »" moduleSubtitle="Mettre des symboles sur le geste" estimatedTime="14 min"
      brief={{
        tag: 'Découverte', title: 'P_A(B) se lit, puis se calcule', tone: 'violet',
        body: <p>Tu sais déjà restreindre l’univers. Il reste à l’écrire — et à ne pas confondre « A et B » avec « B sachant A ».</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Retenu.</strong> <MathText>{'$P_A(B) = n(A \\cap B) / n(A)$'}</MathText> : l’indice porte la
          condition et donne le dénominateur. Module suivant : ce qui se passe quand on échange A et B.
        </KnowledgeSnapshot>
      )}
    />
  );
}
