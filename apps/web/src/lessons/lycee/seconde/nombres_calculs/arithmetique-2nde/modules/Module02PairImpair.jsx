import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import ValueTable from '../../../../../common/components/ValueTable';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parityForm, oddSquareForm } from '../components/arithUtils';

/**
 * Module 2 — DISCOVERY : « Pair, impair, et la lettre ».
 * Activity: écrire des nombres sous la forme 2k ou 2k + 1 ; vérifier la
 *   somme de deux impairs par le calcul littéral ; démontrer que le carré
 *   d'un impair est impair.
 * Mathematical objective: la lettre transforme le constat du module 1 en
 *   démonstration valable pour TOUS les entiers.
 * Misconception targeted: « des exemples suffisent » ; « 2k + 1 ne
 *   représente que 3, 5, 7… ».
 */
export default function Module02PairImpair() {
  const [kDone, setKDone] = useState(false);
  const [formDone, setFormDone] = useState(false);
  const [proofDone, setProofDone] = useState(false);
  const [tested, setTested] = useState(() => new Set());
  const [squareDone, setSquareDone] = useState(false);
  const [batchDone, setBatchDone] = useState(false);
  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Pair, impair, et la lettre"
      moduleSubtitle="Un pair s’écrit 2k, un impair 2k + 1. Avec ces écritures, un constat devient une preuve."
      estimatedTime="10 min"
      brief={{ tag: '✏️ Mission 02', title: 'Les paquets ont montré que deux impairs font un pair. Pour tous les nombres ? Il faut une lettre.', tone: 'indigo', body: <p>Un nombre pair, ce sont des paquets de 2 pleins : 2k. Un impair, un jeton en plus : 2k + 1.</p> }}
      steps={[
        {
          num: 1, title: 'Trouve le k', subtitle: 'Chaque entier s’écrit 2k (pair) ou 2k + 1 (impair).', done: kDone && formDone,
          content: (
            <div className="space-y-3">
              <NumericQuestion prompt={<>On écrit 47 sous la forme <MathText>{'$2k + 1$'}</MathText>. Que vaut k ?</>} expected={parityForm(47).k} suffix=""
                requires={[]}
                explain="47 = 2 × 23 + 1 : k = 23, ce sont les 23 paquets de 2, plus le jeton seul."
                explainFor={(v) => (v === 47 ? 'k n’est pas le nombre lui-même : c’est le NOMBRE DE PAQUETS. 47 = 2 × 23 + 1, donc k = 23.' : v === 24 ? '2 × 24 + 1 = 49, pas 47. Enlève d’abord le jeton seul : 46 ÷ 2 = 23.' : '47 − 1 = 46, et 46 ÷ 2 = 23 : k = 23.')}
                solved={kDone} onAnswered={() => setKDone(true)} />
              {/* Tu viens de trouver k pour 47 : l'écriture littérale a
                  maintenant un sens avant qu'on demande POURQUOI l'utiliser. */}
              {kDone && (
                <KnowledgeBrick
                  id="ecriture-litterale-parite"
                  variant="new"
                  compact
                  lead={<>Tu viens de trouver k = 23. Un pair s’écrit <strong>2k</strong>, un impair <strong>2k + 1</strong>, un multiple de p s’écrit <strong>pk</strong>.</>}
                />
              )}
              {kDone && (
                <TapQuestion prompt="Pourquoi écrire « 2k + 1 » plutôt que donner des exemples comme 3, 5, 7 ?" options={['Parce que k peut être n’importe quel entier : 2k + 1 représente TOUS les impairs d’un coup', 'Parce que c’est plus court', 'Parce que les exemples sont faux']} cols={1} correct={0}
                  requires={['ecriture-litterale-parite']}
                  explain="k = 0 donne 1, k = 1 donne 3, k = 500 donne 1 001, k = −3 donne −5 : l’écriture 2k + 1 couvre tous les impairs, y compris ceux qu’on n’écrira jamais. C’est ce qui permet de démontrer."
                  explainWrong="Les exemples ne sont pas faux, mais ils ne couvrent jamais tout. Avec k entier quelconque, 2k + 1 EST n’importe quel impair : la preuve vaut alors pour tous."
                  solved={formDone} onAnswered={() => setFormDone(true)} />
              )}
              {formDone && (
                <KnowledgeBrick
                  id="lettre-couvre-tout"
                  variant="new"
                  compact
                  lead={<>k pouvant être n’importe quel entier, <strong>2k + 1 représente TOUS les impairs</strong> d’un coup — c’est ce qui permet de démontrer.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'La preuve de la somme', subtitle: 'Deux impairs : 2k + 1 et 2m + 1.', done: proofDone,
          content: (
            <div className="space-y-3">
              <TapQuestion prompt={<>Que vaut <MathText>{'$(2k + 1) + (2m + 1)$'}</MathText>, une fois réduit ?</>}
                options={['$2(k + m + 1)$, donc un nombre pair', '$2k + 2m + 1$, donc impair', '$4km + 2$', '$2(k + m) + 2$, on ne peut pas conclure']}
                renderOption={(o) => <MathText>{o}</MathText>} optionLabel={(i) => ['2(k + m + 1), donc pair', '2k + 2m + 1, impair', '4km + 2', '2(k + m) + 2, sans conclusion'][i]} cols={2} correct={0}
                requires={['ecriture-litterale-parite', 'lettre-couvre-tout']}
                explain="(2k + 1) + (2m + 1) = 2k + 2m + 2 = 2(k + m + 1). Comme k + m + 1 est un entier, le résultat est 2 × (un entier) : un nombre PAIR. C’est vrai pour tous les k et m — la preuve du module 1, écrite."
                explainWrong="Additionne : 2k + 2m + 1 + 1 = 2k + 2m + 2. On peut factoriser par 2 : 2(k + m + 1). La forme « 2 × un entier » est exactement la définition d’un nombre pair."
                solved={proofDone} onAnswered={() => setProofDone(true)} />
              {/* La transformation qui vient de conclure est LA méthode :
                  la nommer avant de la réutiliser (étape 3). */}
              {proofDone && (
                <KnowledgeBrick
                  id="methode-preuve-parite"
                  variant="new"
                  lead={<>Tu viens d’écrire l’hypothèse avec une lettre, de transformer, puis de reconnaître la forme « 2 × un entier » qui conclut. C’est la méthode pour démontrer.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'Le carré d’un impair', subtitle: 'Teste, puis prouve.', done: tested.size >= 3 && squareDone,
          content: (kit) => (
            <div className="space-y-3">
              <ValueTable columns={[{ id: 'n', label: <MathText>{'$(2k+1)^{2}$'}</MathText>, fn: (k) => (2 * k + 1) ** 2 }, { id: 'm', label: <MathText>{'$2(2k^{2}+2k)+1$'}</MathText>, fn: (k) => 2 * (2 * k * k + 2 * k) + 1 }]} xs={[1, 2, 3, 0, 5]} tested={tested} onTest={(v) => { const s = new Set(tested); s.add(v); setTested(s); if (s.size === 3) kit.react(true); }} variable="k" caption="Les deux colonnes coïncident : le carré est bien de la forme 2m + 1." />
              {tested.size >= 3 && (
                <TapQuestion prompt={<>En développant, <MathText>{'$(2k + 1)^{2} = 4k^{2} + 4k + 1$'}</MathText>. Que conclure ?</>}
                  options={['C’est 2(2k² + 2k) + 1 : de la forme 2m + 1, donc le carré d’un impair est IMPAIR', 'C’est pair, car 4k² et 4k sont pairs', 'On ne peut rien conclure sans tester tous les k']} cols={1} correct={0}
                  requires={['methode-preuve-parite']}
                  explain="4k² + 4k + 1 = 2(2k² + 2k) + 1, avec 2k² + 2k entier : c’est un impair. Le « + 1 » isolé est ce qui empêche la somme d’être paire — pour tout k."
                  explainWrong="4k² et 4k sont pairs, mais le + 1 change tout : le total est 2 × (2k² + 2k) + 1, la forme d’un IMPAIR. Et la lettre couvre tous les cas : plus besoin de tester."
                  solved={squareDone} onAnswered={() => setSquareDone(true)} />
              )}
              {/* Deux preuves faites (somme, carré) : la règle générale peut
                  maintenant être énoncée, avant l'étape 4 qui l'applique. */}
              {squareDone && (
                <KnowledgeBrick
                  id="regle-parite-operations"
                  variant="new"
                  lead={<>pair + pair = pair, impair + impair = pair, pair + impair = impair. Et <MathText>{'$n(n+1)$'}</MathText> — deux entiers consécutifs — est toujours pair.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'Pair ou impair ?', done: batchDone,
          content: (
            <BatchChoiceQuestion intro={<p className="text-sm text-slate-600">Pour tout entier n :</p>} requires={['regle-parite-operations']} rows={[
              { id: 'r1', label: '2n + 5', options: ['pair', 'impair', 'ça dépend'], correct: 1, correction: '2n + 4 + 1 = 2(n + 2) + 1.' },
              { id: 'r2', label: 'n + n', options: ['pair', 'impair', 'ça dépend'], correct: 0, correction: 'n + n = 2n.' },
              { id: 'r3', label: 'n(n + 1)', options: ['pair', 'impair', 'ça dépend'], correct: 0, correction: 'deux entiers consécutifs : l’un des deux est pair.' },
              { id: 'r4', label: 'n²', options: ['pair', 'impair', 'ça dépend'], correct: 2, correction: '4 est pair, 9 est impair : cela dépend de n.' },
            ]}
              feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} / ${total}.`} La forme décide : ce qui s’écrit 2 × (entier) est pair ; ce qui s’écrit 2 × (entier) + 1 est impair ; et n² dépend de la parité de n.</Feedback>}
              solved={batchDone} onAnswered={() => setBatchDone(true)} />
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          Reste une question : pourquoi la somme des chiffres décide-t-elle pour 3 et 9 ?
        </KnowledgeSnapshot>
      )}
    />
  );
}
