import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VariationTable from '../components/VariationTable';
import { BOSSE } from '../components/variationsUtils';

/**
 * Module 5 — MANIPULATION : comparer sans calculer. Le tableau de g seul (pas
 * d'expression, pas de courbe) : ordre des images sur un intervalle de
 * monotonie, « on ne peut pas conclure » quand a et b sont séparés par un
 * retournement, encadrement de g(x).
 */
export default function Module05ComparerSansCalculer() {
  const [q1, setQ1] = useState(false); const [q2, setQ2] = useState(false); const [q3, setQ3] = useState(false);
  const table = <div className="space-y-2"><p className="text-sm text-slate-700">g sur [−4 ; 4], connue par son tableau seulement :</p><VariationTable f={BOSSE} /></div>;
  const steps = [
    {
      num: 1, title: 'Comparer deux images', done: q1,
      content: (
        <BatchChoiceQuestion intro={table}
          rows={[
            { id: 'r1', label: 'g(0,5) et g(1,2)', options: ['g(0,5) > g(1,2)', 'g(0,5) < g(1,2)', 'on ne peut pas savoir'], correct: 0, correction: '0,5 < 1,2 dans [−2 ; 2] où g décroît' },
            { id: 'r2', label: 'g(−3) et g(−2,5)', options: ['g(−3) < g(−2,5)', 'g(−3) > g(−2,5)', 'on ne peut pas savoir'], correct: 0, correction: 'croissante sur [−4 ; −2]' },
            { id: 'r3', label: 'g(−1) et g(3)', options: ['on ne peut pas savoir', 'g(−1) > g(3)', 'g(−1) < g(3)'], correct: 0, correction: '−1 et 3 ne sont pas dans un même intervalle de monotonie' },
            { id: 'r4', label: 'g(2,5) et g(3,5)', options: ['g(2,5) < g(3,5)', 'g(2,5) > g(3,5)', 'on ne peut pas savoir'], correct: 0, correction: 'croissante sur [2 ; 4]' },
          ]}
          feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Si a et b sont dans un même intervalle où g est monotone, la flèche donne l’ordre des images. Sinon, le tableau ne dit rien : « on ne peut pas savoir » est la bonne réponse, pas un aveu.</Feedback>}
          solved={q1} onAnswered={() => setQ1(true)} />
      ),
    },
    {
      num: 2, title: 'Encadrer', done: q2,
      content: (
        <TapQuestion above={table} prompt="Pour tout x de [−2 ; 2], que peut-on affirmer sur g(x) ?"
          options={['−4 ≤ g(x) ≤ 4', 'g(x) ≤ 0', '−2 ≤ g(x) ≤ 2', 'g(x) ≥ 4']} correct={0} cols={2}
          explain="Sur [−2 ; 2], g descend de g(−2) = 4 à g(2) = −4 sans remonter : toutes les images sont entre −4 et 4. Les valeurs de la ligne du bas encadrent g(x) sur l’intervalle."
          explainWrong="Suis la flèche : de 4 (en −2) à −4 (en 2). Les images passent par toutes les valeurs entre −4 et 4, et aucune autre. −2 et 2 sont des abscisses, pas des images."
          solved={q2} onAnswered={() => setQ2(true)} />
      ),
    },
    {
      num: 3, title: 'Vrai ou faux', done: q3,
      content: (
        <BatchChoiceQuestion intro={table}
          rows={[
            { id: 'r1', label: 'g est monotone sur [−1 ; 1]', options: ['vrai', 'faux'], correct: 0, correction: 'inclus dans [−2 ; 2]' },
            { id: 'r2', label: 'g est monotone sur [−3 ; −1]', options: ['faux', 'vrai'], correct: 0, correction: 'à cheval sur −2' },
            { id: 'r3', label: 'g(x) ≤ 4 pour tout x de [−4 ; 4]', options: ['vrai', 'faux'], correct: 0, correction: '4 est le maximum' },
            { id: 'r4', label: 'Si a < b, alors g(a) < g(b)', options: ['faux', 'vrai'], correct: 0, correction: 'vrai seulement sur un intervalle où g croît' },
          ]}
          feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Une propriété de variation vaut sur un intervalle précis ; le maximum majore toutes les images ; « a &lt; b ⟹ g(a) &lt; g(b) » n’est vrai que sur un intervalle de croissance.</Feedback>}
          solved={q3} onAnswered={() => setQ3(true)} />
      ),
    },
  ];
  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Comparer sans calculer" moduleSubtitle="Le tableau seul : conclure, ou savoir qu’on ne peut pas" estimatedTime="10 min"
      brief={{ tag: 'Manipulation', title: 'Ni courbe, ni expression', tone: 'cyan', body: <p>On ne connaît g que par son tableau de variations. Peut-on comparer g(0,5) et g(1,2) ? Et g(−1) et g(3) ? Encadrer g(x) ?</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5}>Module suivant : un enclos à clôturer, un coût à réduire — chercher le maximum ou le minimum, c’est optimiser.</KnowledgeSnapshot>} />
  );
}
