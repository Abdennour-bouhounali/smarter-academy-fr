import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PyLab from '../components/PyLab';

/**
 * Module 2 — l'affectation, et le piège du « = ».
 *
 * « x = x + 1 » est absurde comme équation et banal comme instruction. L'élève
 * l'exécute AVANT qu'on lui explique, parce que voir x passer de 4 à 5 règle la
 * question plus sûrement qu'un paragraphe.
 */
const SWAP = `a = 3
b = 8
a = b
b = a
print(a)
print(b)`;

const INC = `x = 4
x = x + 1
print(x)`;

export default function Module02AffecterNEstPasEgaler() {
  const [ranInc, setRanInc] = useState(false);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [ranSwap, setRanSwap] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'x = x + 1',
      subtitle: 'En mathématiques, cette égalité n’a aucune solution. Exécute-la quand même.',
      done: ranInc,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="que va afficher ce programme ?"
            options={[{ id: '5', label: '5' }, { id: 'err', label: 'une erreur' }, { id: '4', label: '4' }]}
            value={pred} onChange={setPred} disabled={ranInc}
          />
          <PyLab initial={INC} label="Incrémenter" showEnv onRun={() => { if (!ranInc) kit.react?.(true); setRanInc(true); }} />
          {ranInc ? (
            <>
              <Feedback tone="ok">
                Aucune erreur : le programme affiche <strong>5</strong>. Le signe « = » n’affirme pas une
                égalité, il donne un ORDRE : calcule la droite (4 + 1 = 5), range le résultat dans x.
                L’ancien x sert au calcul, le nouveau le remplace.
              </Feedback>
              <KnowledgeBrick
                id="affectation"
                variant="new"
                lead={<>Le geste que tu viens d’exécuter a un nom, et se lit dans un sens précis.</>}
              />
            </>
          ) : (
            <Feedback tone="info">Exécute le programme pour voir.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Dans quel ordre ?',
      done: q2,
      content: () => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="regle-ordre-affectation"
            variant="new"
            lead={<>C’est cet ordre — droite d’abord — qui rend l’instruction possible.</>}
          />
          <NumericQuestion
            prompt="Après ces trois lignes — n = 10, puis n = n * 2, puis n = n − 5 — que vaut n ?"
            expected={15}
            requires={['affectation', 'regle-ordre-affectation']}
            explain="10 × 2 = 20, puis 20 − 5 = 15. Chaque ligne utilise la valeur COURANTE de n, celle que la ligne précédente vient d’y ranger."
            explainFor={(v) => (v === 10 ? 'Tu as gardé la valeur de départ : chaque affectation la remplace.'
              : v === 5 ? 'Tu as appliqué les opérations dans le désordre : d’abord ×2, ensuite −5.'
              : v === 20 ? 'Tu t’es arrêté après la deuxième ligne : il reste n = n − 5.'
              : '10 × 2 = 20, puis 20 − 5 = 15.')}
            solved={q2} onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'L’échange qui rate',
      subtitle: 'Ce programme veut échanger a et b. Prédis la sortie, puis exécute.',
      done: ranSwap,
      content: (kit) => (
        <div className="space-y-3">
          <PyLab initial={SWAP} label="Échange raté" showEnv onRun={() => { if (!ranSwap) kit.react?.(true); setRanSwap(true); }} />
          {ranSwap && (
            <Feedback tone="ok">
              Les deux valent <strong>8</strong> : l’échange a échoué. La ligne <span className="font-mono">a = b</span>
              a ÉCRASÉ le 3, qui n’existe plus nulle part quand <span className="font-mono">b = a</span> s’exécute.
              Pour échanger, il faut d’abord mettre 3 de côté dans une troisième variable — c’est une
              conséquence directe de ce qu’est une affectation.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Écrire une formule',
      done: q4,
      content: () => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="methode-formule-variables"
            variant="new"
            lead={<>Une formule s’écrit avec les NOMS, jamais avec les nombres — c’est ce qui rend le programme réutilisable.</>}
          />
          <TapQuestion
            prompt={<span>On veut calculer le prix TTC à partir d’un prix HT et d’un taux de TVA. Quelle ligne écrire ?</span>}
            options={[
              'ttc = ht * (1 + tva)',
              'ttc = 12 * 1.2',
              'ttc = ht + tva',
              'ht * (1 + tva) = ttc',
            ]}
            correct={0} cols={1}
            requires={['methode-formule-variables', 'affectation']}
            explain="Avec les noms, la ligne reste juste quel que soit le prix ou le taux. Écrire les nombres en dur (12 et 1.2) ne calcule qu’un seul cas, et il faudrait modifier le programme à chaque fois."
            explainWrong="Attention aussi au SENS : la variable qui reçoit est toujours à GAUCHE du signe =. « ht * (1 + tva) = ttc » n’est pas une instruction valide."
            solved={q4} onAnswered={() => setQ4(true)}
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
      moduleTitle="Affecter n’est pas égaler"
      moduleSubtitle="x = x + 1 : absurde en mathématiques, banal en informatique"
      estimatedTime="12 min"
      brief={{
        tag: '➡️ Mission 02',
        title: 'Le signe « = » ne veut pas dire la même chose ici.',
        tone: 'indigo',
        body: <p>En mathématiques il affirme. En programmation il ordonne. Une seule ligne suffit à voir la différence.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          Tu sais ranger des valeurs et écrire une formule. Reste à faire CHOISIR le programme
          selon ce qu’il trouve.
        </KnowledgeSnapshot>
      )}
    />
  );
}
