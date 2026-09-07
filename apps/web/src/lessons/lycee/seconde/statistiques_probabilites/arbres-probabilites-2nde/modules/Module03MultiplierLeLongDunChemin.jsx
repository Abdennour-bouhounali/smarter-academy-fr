import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { parseDec } from '@smarter-academy/core';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import ProbabilityTree from '../../../../../common/stats/ProbabilityTree';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { arbreBilles, pChemin, SACS, pRougeSachant } from '../data';

/**
 * Module 3 — DÉCOUVERTE : pourquoi on MULTIPLIE le long d'un chemin.
 *
 * La règle n'est pas assénée : elle est établie sur 1 000 tirages imaginés.
 * Sur 1 000 expériences, 600 passent par le sac A ; parmi ces 600, la
 * moitié donnent une rouge, soit 300. Et 300/1 000 = 0,30 = 0,6 × 0,5.
 * Le produit apparaît comme un COMPTAGE, pas comme une convention — c'est
 * la seule façon d'éviter que l'élève additionne « parce que ça semble
 * naturel ».
 *
 * L'élève sélectionne un chemin dans l'arbre (onPathClick) : le produit
 * s'affiche pour CE chemin.
 */
const TREE = arbreBilles();
const N = 1000;

export default function Module03MultiplierLeLongDunChemin() {
  const [selected, setSelected] = useState([]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);

  const nA = N * SACS.A.p;
  const nAR = nA * pRougeSachant('A');

  const steps = [
    {
      num: 1,
      title: 'Comptons sur 1 000 tirages',
      subtitle: 'Pas de formule : on compte.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-sky-200 bg-white p-4 space-y-2 text-sm text-slate-700">
            <p>On imagine <strong>{N.toLocaleString('fr-FR')} tirages</strong>.</p>
            <p>
              · Le sac A est choisi dans <strong>{SACS.A.p * 100} %</strong> des cas :
              {' '}<strong>{nA.toLocaleString('fr-FR')}</strong> tirages passent par A.
            </p>
            <p>
              · Parmi ces {nA.toLocaleString('fr-FR')} tirages, une bille sur deux est rouge :
              {' '}<strong>{nAR.toLocaleString('fr-FR')}</strong> donnent « A puis rouge ».
            </p>
            <p className="pt-1 border-t border-slate-200">
              Donc P(A puis rouge) = {nAR.toLocaleString('fr-FR')} / {N.toLocaleString('fr-FR')} =
              {' '}<strong className="text-sky-700">0,30</strong>.
            </p>
          </div>
          <TapQuestion
            prompt="Quel calcul retrouve directement ce 0,30 à partir des deux poids du chemin (0,6 puis 0,5) ?"
            options={['0,6 × 0,5', '0,6 + 0,5', '0,6 − 0,5', '0,6 ÷ 0,5']}
            correct={0} cols={4}
            explain="0,6 × 0,5 = 0,30. Prendre « la moitié des 600 » revient à multiplier : le second poids s’applique à ce qui reste après le premier, il ne s’ajoute pas. Une somme donnerait 1,1 — impossible pour une probabilité."
            explainWrong="Reprends le comptage : on prend 60 % de 1 000, puis la moitié de CE résultat. Enchaîner deux proportions, c’est les multiplier."
            solved={q1} onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Choisis un chemin et calcule-le',
      subtitle: 'Clique un chemin dans l’arbre pour le mettre en évidence.',
      done: q2,
      content: (
        <div className="space-y-3">
          <ProbabilityTree
            branches={TREE}
            levelLabels={['sac', 'bille']}
            highlightPaths={selected}
            onPathClick={(id) => setSelected((prev) => (prev.includes(id) ? [] : [id]))}
          />
          <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3 text-center">
            <MathText>{'$$P(\\text{chemin}) = P(\\text{1}^{\\text{re}}\\text{ branche}) \\times P(\\text{2}^{\\text{e}}\\text{ branche})$$'}</MathText>
          </div>
          <NumericQuestion
            prompt="Quelle est la probabilité du chemin « sac B, puis bille rouge » ? (en %)"
            expected={(n) => Math.abs(n - pChemin('B', 'rouge') * 100) < 0.5}
            parse={parseDec}
            display="10 %"
            suffix="%"
            explain="0,4 × 0,25 = 0,10, soit 10 %. Le sac B est choisi 4 fois sur 10, et une fois dedans, une bille sur quatre est rouge."
            explainFor={(n) => (Math.abs(n - 65) < 1
              ? 'Tu as additionné les deux poids (0,4 + 0,25). Le long d’un chemin, on multiplie : la seconde étape se joue seulement parmi les tirages qui ont pris cette route.'
              : Math.abs(n - 25) < 0.5
                ? 'Le 0,25 est la probabilité d’une rouge UNE FOIS le sac B choisi. Il reste à tenir compte de la probabilité d’avoir choisi B.'
                : null)}
            solved={q2} onAnswered={(ok) => { if (ok) setQ2(true); }}
          />
          {q2 && (
            <Feedback tone="ok">
              Les quatre chemins valent 0,30 · 0,30 · 0,10 · 0,30 — et leur somme fait exactement 1, puisqu’un
              tirage emprunte forcément l’un d’eux.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="Multiplier le long d’un chemin" moduleSubtitle="Une règle qui se compte, pas qui s’apprend" estimatedTime="14 min"
      brief={{
        tag: 'Découverte', title: 'Pourquoi un produit ?', tone: 'sky',
        body: <p>Tout le monde retient « on multiplie ». Presque personne ne sait pourquoi. On va le voir en comptant des tirages, sans aucune formule.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Retenu.</strong> La probabilité d’un <strong>chemin</strong> est le <strong>produit</strong>
          {' '}des poids rencontrés — parce que la seconde étape ne se joue que parmi les tirages ayant pris la
          première. Module suivant : quand plusieurs chemins mènent au même résultat.
        </KnowledgeSnapshot>
      )}
    />
  );
}
