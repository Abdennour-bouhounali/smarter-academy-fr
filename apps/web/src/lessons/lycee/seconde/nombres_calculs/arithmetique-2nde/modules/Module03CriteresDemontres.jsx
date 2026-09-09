import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DigitSplit from '../components/DigitSplit';
import { nineSplit, digitSum } from '../components/arithUtils';

/**
 * Module 3 — DISCOVERY : « Les critères, démontrés ».
 * Activity: découper des nombres en « partie multiple de 9 » + « somme des
 *   chiffres » ; puis en centaines + deux derniers chiffres.
 * Mathematical objective: n = 9 × (…) + somme des chiffres : la première
 *   part est toujours multiple de 9 (et de 3), donc tout se joue sur la
 *   somme des chiffres. Idem pour 4 avec 100.
 * Misconception targeted: « divisible par 3 ⇔ dernier chiffre 3, 6 ou 9 » ;
 *   « un critère, ça se retient sans se comprendre ».
 */
const NUMBERS = [4725, 2346, 1080, 731];

export default function Module03CriteresDemontres() {
  const [prediction, setPrediction] = useState(null);
  const [n, setN] = useState(4725);
  const [seen, setSeen] = useState(() => new Set([4725]));
  const [whyDone, setWhyDone] = useState(false);
  const [n2, setN2] = useState(1316);
  const [fourDone, setFourDone] = useState(false);
  const [batchDone, setBatchDone] = useState(false);
  const pick = (v) => { setN(v); const s = new Set(seen); s.add(v); setSeen(s); };
  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="Les critères, démontrés"
      moduleSubtitle="Pourquoi la somme des chiffres décide pour 3 et 9 ? Découpe 4 725 en 999 + 99 + 9 et regarde."
      estimatedTime="10 min"
      brief={{ tag: '🔬 Mission 03', title: 'On te dit : « 4 725 est divisible par 9 car 4 + 7 + 2 + 5 = 18 ». Pourquoi ça marche ?', tone: 'indigo', body: <p>Découpe le nombre. Chaque chiffre apporte une part multiple de 9 — et lui-même.</p> }}
      steps={[
        {
          num: 1, title: 'Découpe le nombre', subtitle: 'Essaie au moins trois nombres et lis la dernière ligne.', done: seen.size >= 3 && whyDone,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips prompt="d’où vient la règle de la somme des chiffres ?" options={[{ id: 'hasard', label: 'C’est une astuce sans raison' }, { id: 'preuve', label: 'Il y a une raison qu’on peut voir' }]} value={prediction} onChange={setPrediction} disabled={seen.size >= 3} />
              <DigitSplit n={n} numbers={NUMBERS} onPick={(v) => { pick(v); if (seen.size === 2) kit.react(true); }} mode="nine" />
              {seen.size >= 3 && (
                <TapQuestion prompt="Pourquoi la somme des chiffres suffit-elle à décider ?" options={['Parce que 9, 99, 999… sont des multiples de 9 : cette part n’a aucune influence, tout se joue sur la somme des chiffres', 'Parce que les chiffres sont petits', 'C’est une coïncidence des nombres testés']} cols={1} correct={0}
                  requires={[]}
                  explain="Chaque chiffre d apporte d × 10^k = d × (10^k − 1) + d : la première part (d × 9, d × 99, d × 999…) est toujours multiple de 9. Il ne reste que la somme des chiffres. Donc n est multiple de 9 exactement quand elle l’est — et pareil pour 3, car 9, 99, 999… sont aussi multiples de 3."
                  explainWrong="Regarde le tableau : la colonne « multiple de 9 » se remplit toute seule quel que soit le nombre (999, 99, 9 sont des multiples de 9). Le seul élément qui varie, c’est la somme des chiffres."
                  solved={whyDone} onAnswered={() => setWhyDone(true)} />
              )}
              {/* Le découpage 4 725 = 9 × 523 + 18 vient de montrer QUE le
                  critère est un découpage — l'étape 2 va le réutiliser sur 4. */}
              {whyDone && (
                <KnowledgeBrick
                  id="critere-est-decoupage"
                  variant="new"
                  lead={<>Un critère n’est pas une astuce : on sépare le nombre en une part <strong>toujours multiple</strong>, et un reste qui décide seul.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Et le critère par 4 ?', subtitle: 'Même méthode, autre découpage.', done: fourDone,
          content: (
            <div className="space-y-3">
              <DigitSplit n={n2} numbers={[1316, 1318, 2500, 731]} onPick={setN2} mode="hundred" />
              <TapQuestion prompt="Pourquoi les deux derniers chiffres suffisent-ils pour 4 ?" options={['Parce que 100 est un multiple de 4 : les centaines n’ont aucune influence', 'Parce que 4 est pair', 'Parce que 4 divise 10']} cols={1} correct={0}
                requires={['critere-est-decoupage']}
                explain="n = 100 × (centaines) + (deux derniers chiffres), et 100 = 4 × 25 : la première part est toujours multiple de 4. Il ne reste que les deux derniers chiffres. (4 ne divise pas 10 : c’est pourquoi le dernier chiffre seul ne suffit pas.)"
                explainWrong="4 ne divise pas 10, donc le dernier chiffre seul ne suffit pas — mais 4 divise 100, donc toutes les centaines s’annulent : seuls les deux derniers chiffres comptent."
                solved={fourDone} onAnswered={() => setFourDone(true)} />
              {/* Deux découpages faits (9 et 4) : la liste complète des
                  critères peut être posée, avant l'étape 3 qui les applique. */}
              {fourDone && (
                <KnowledgeBrick
                  id="criteres-divisibilite"
                  variant="new"
                  lead={<>Dernier chiffre pour 2, 5, 10 ; deux derniers chiffres pour 4 ; somme des chiffres pour 3 et 9.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'Applique les critères', done: batchDone,
          content: (
            <BatchChoiceQuestion intro={<p className="text-sm text-slate-600">Pour chaque nombre, par quoi est-il divisible ?</p>} requires={['criteres-divisibilite']} rows={[
              { id: 'r1', label: '2 346', options: ['par 3 seulement', 'par 9 seulement', 'par 3 et par 9'], correct: 0, correction: 'somme 15 : multiple de 3, pas de 9.' },
              { id: 'r2', label: '1 080', options: ['par 9 et par 10', 'par 10 seulement', 'ni l’un ni l’autre'], correct: 0, correction: 'somme 9 ; dernier chiffre 0.' },
              { id: 'r3', label: '731', options: ['par 3', 'par aucun de 2, 3, 5', 'par 5'], correct: 1, correction: 'somme 11 ; finit par 1.' },
              { id: 'r4', label: '4 725', options: ['par 5 et par 9', 'par 2 et par 9', 'par 4'], correct: 0, correction: 'finit par 5 ; somme 18.' },
            ]}
              feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} / ${total}.`} Multiple de 9 ⇒ multiple de 3, mais l’inverse est faux (2 346, somme 15). Et 731, dont le dernier chiffre est 1, n’est divisible ni par 2, ni par 3 (11), ni par 5.</Feedback>}
              solved={batchDone} onAnswered={() => setBatchDone(true)} />
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
