import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseDec, formatDec } from '../components/affineUtils';

/**
 * Module 6 — LABORATOIRE D'ENTRAÎNEMENT : modéliser (abonnement, téléphérique,
 * bougie).
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Le passage « situation → a et b » n'était énoncé que dans les `feedback` et
 *   dans l'« À retenir » du pied, alors que les trois situations le demandent
 *   dès la première ligne. L'étape 1 ouvrant sur une question, la brique est
 *   posée EN TÊTE, avant la demande :
 *     étape 1  brique `methode-modeliser-affine`, puis l'abonnement
 *     étapes 2 et 3  la même méthode réemployée (`requires`), avec ce que les
 *                    modules 4 et 5 ont établi (deux données, équation,
 *                    inéquation)
 *   Ce module est un atelier de réemploi : il n'introduit aucune connaissance
 *   nouvelle, et n'a aucun laboratoire à dégeler.
 */
export default function Module06AtelierModeliser() {
  const [q1, setQ1] = useState(false); const [q2, setQ2] = useState(false); const [q3a, setQ3a] = useState(false); const [q3b, setQ3b] = useState(false);
  const steps = [
    {
      num: 1, title: 'L’abonnement', subtitle: 'Une salle de sport : 25 € d’inscription puis 30 € par mois. C(m) = coût total après m mois.', done: q1,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick id="methode-modeliser-affine" variant="new" lead={<>Tu sais lire a et b sur une courbe, une table et deux données. Dernier registre : une situation racontée en français.</>} />
          <BatchChoiceQuestion
            rows={[
              { id: 'r1', label: 'C(m) = ?', options: ['30m + 25', '25m + 30', '55m'], correct: 0, correction: 'a = 30 par mois, b = 25 au départ' },
              { id: 'r2', label: 'a représente', options: ['le prix d’un mois', 'l’inscription', 'le nombre de mois'], correct: 0, correction: 'le taux : + 30 € par mois' },
              { id: 'r3', label: 'C(12) = ?', options: ['385 €', '360 €', '660 €'], correct: 0, correction: '30 × 12 + 25' },
              { id: 'r4', label: 'Pour un budget de 205 €, on peut s’abonner', options: ['6 mois', '7 mois', '8 mois'], correct: 0, correction: '30m + 25 ≤ 205 ⟺ m ≤ 6' },
            ]}
            feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} « Tant au départ, puis tant par unité » : b puis a. Le budget donne une inéquation : 30m + 25 ≤ 205 ⟺ m ≤ 6.</Feedback>}
            requires={['methode-modeliser-affine', 'fonction-affine-ab', 'methode-inequation-affine']}
            solved={q1} onAnswered={() => setQ1(true)} />
        </div>
      ),
    },
    {
      num: 2, title: 'Le téléphérique', subtitle: 'Une cabine part de 2 400 m et descend régulièrement ; après 4 min elle est à 1 800 m. h(t) = altitude après t minutes.', done: q2,
      content: (
        <TapQuestion prompt="h(t) = ?"
          options={['h(t) = −150t + 2 400', 'h(t) = 150t + 2 400', 'h(t) = −600t + 2 400', 'h(t) = 2 400t − 150']}
          correct={0} cols={2}
          explain="Taux : (1 800 − 2 400) ÷ 4 = −150 m par minute (elle descend : a < 0). b = 2 400 = h(0). h(t) = −150t + 2 400, décroissante ; elle atteint 1 200 m à t = 8."
          explainWrong="Deux données : (0 ; 2 400) et (4 ; 1 800). a = (1 800 − 2 400) ÷ (4 − 0) = −150 (négatif : ça descend). b = 2 400, l’altitude de départ."
          requires={['methode-modeliser-affine', 'methode-determiner-affine', 'regle-signe-a-variations']}
          solved={q2} onAnswered={() => setQ2(true)} />
      ),
    },
    {
      num: 3, title: 'La bougie', subtitle: 'Une bougie de 20 cm perd 2,5 cm par heure. L(t) = longueur après t heures.', done: q3a && q3b,
      content: (
        <div className="space-y-4">
          <NumericQuestion prompt="Après combien d’heures ne mesure-t-elle plus que 5 cm ? (résous L(t) = 5)" expected={6} parse={parseDec} display={formatDec(6)}
            explain={<span>L(t) = −2,5t + 20. −2,5t + 20 = 5 ⟺ −2,5t = −15 ⟺ t = <strong>6</strong> h.</span>}
            explainFor={(n) => (n === 8 ? 't = 8 donne L = 0 : bougie entièrement consumée. Pour 5 cm : 15 cm à brûler à 2,5 cm/h, soit 6 h.' : n === 2 ? '5 ÷ 2,5 = 2 est le temps pour brûler 5 cm ; ici il faut brûler 20 − 5 = 15 cm : 6 h.' : '−2,5t + 20 = 5 ⟺ t = 15 ÷ 2,5 = 6.')}
            requires={['methode-modeliser-affine', 'methode-equation-affine']}
            solved={q3a} onAnswered={() => setQ3a(true)} />
          {q3a && (
            <TapQuestion prompt="Pendant combien de temps la bougie mesure-t-elle plus de 10 cm ? (L(t) > 10)"
              options={['Pendant 4 h : t < 4', 'À partir de 4 h : t > 4', 'Pendant 10 h', 'Jamais']}
              correct={0} cols={2}
              explain="−2,5t + 20 > 10 ⟺ −2,5t > −10 ⟺ t < 4 (division par −2,5 : le sens s’inverse). La bougie raccourcit : c’est au début qu’elle dépasse 10 cm."
              explainWrong="En divisant par −2,5, l’inégalité se retourne : t < 4. Vérifie : L(2) = 15 > 10 ✓, L(6) = 5 non."
              requires={['methode-modeliser-affine', 'methode-inequation-affine']}
              solved={q3b} onAnswered={() => setQ3b(true)} />
          )}
        </div>
      ),
    },
  ];
  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6}
      moduleTitle="Atelier : modéliser" moduleSubtitle="Reconnaître a et b dans la situation, puis répondre" estimatedTime="9 min"
      brief={{ tag: 'Atelier', title: 'Un taux et une valeur de départ', tone: 'rose', body: <p>Un abonnement, une descente, une bougie qui fond : à chaque fois, quelle est la valeur initiale (b) ? quel est le taux (a), et son signe ? Puis équation ou inéquation.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6}>Il ne reste qu’à le prouver : la mission finale. Dix épreuves, une seule validation.</KnowledgeSnapshot>} />
  );
}
