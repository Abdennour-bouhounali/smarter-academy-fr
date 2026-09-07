import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SignProbe from '../components/SignProbe';
import SignTable from '../components/SignTable';
import { P4, Q4, P4_RANGE, Q4_RANGE, signTable } from '../components/signeUtils';

/**
 * Module 4 — MANIPULATION : produit et quotient.
 * Step 1  P(x) = (x − 1)(x + 3) : les lignes des facteurs sont données ; remplir
 *         la ligne du produit (règle des signes) ; la courbe peinte confirme.
 * Step 2  Q(x) = (x + 2)/(x − 1) : même règle, double barre en 1.
 * Step 3  pourquoi la double barre.  Step 4  sans tableau affiché.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   La règle des signes appliquée colonne par colonne, et la valeur interdite
 *   du dénominateur, n'existaient que dans les `Feedback` des étapes 1 et 2 :
 *   la question de l'étape 3 demandait POURQUOI une double barre alors que
 *   rien n'avait posé ce qu'est une valeur interdite. L'ordre est maintenant
 *   geste → brique → demande :
 *     étape 1  remplir la ligne du produit → brique `regle-signe-produit`
 *     étape 2  remplir celle du quotient   → briques `regle-signe-quotient`
 *              puis `methode-tableau-produit-quotient`
 *     étapes 3 et 4  les deux questions d'origine, désormais légitimes
 */
const TP = signTable(P4).cells.map((c) => c.sign);
const TQ = signTable(Q4).cells.map((c) => c.sign);

export default function Module04ProduitEtQuotient() {
  const [vp, setVp] = useState([null, null, null]);
  const [rp, setRp] = useState(false);
  const [vq, setVq] = useState([null, null, null]);
  const [rq, setRq] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const okP = vp.every((s, k) => s === TP[k]); const okQ = vq.every((s, k) => s === TQ[k]);

  const steps = [
    {
      num: 1, title: 'Le produit', subtitle: 'Les lignes des deux facteurs sont remplies. Remplis la ligne de P(x) = (x − 1)(x + 3) avec la règle des signes.', done: rp,
      content: (kit) => (
        <div className="space-y-3">
          <SignTable f={P4} editable={!rp} values={vp} reveal={rp} editRow="final"
            onChange={(i, v) => { if (rp) return; const n = [...vp]; n[i] = v; setVp(n); if (n.every((s) => s !== null)) { setRp(true); kit.react(n.every((s, k) => s === TP[k])); } }} />
          {rp && <SignProbe f={P4} range={P4_RANGE} unit={40} unitY={26} xStep={1} yStep={1} value={0} paintAll showZeros="all" frozen />}
          {rp ? (
            <>
              <Feedback tone={okP ? 'ok' : 'ko'}>{okP ? 'Trois cases justes.' : 'Regarde les cases corrigées.'} Colonne par colonne : deux facteurs de même signe donnent <strong>+</strong>, de signes contraires <strong>−</strong>. Les zéros du produit sont ceux des facteurs : −3 et 1. La courbe peinte confirme : au-dessus avant −3 et après 1, en dessous entre.</Feedback>
              <KnowledgeBrick
                id="regle-signe-produit"
                variant="new"
                lead={<>La règle que tu viens d’appliquer trois fois de suite, colonne par colonne.</>}
              />
            </>
          ) : (
            <Feedback tone="info">Dans chaque colonne, multiplie les signes des deux lignes du dessus.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2, title: 'Le quotient', subtitle: 'Q(x) = (x + 2)/(x − 1). Même règle pour la dernière ligne — mais regarde la colonne x = 1.', done: rq,
      content: (kit) => (
        <div className="space-y-3">
          <SignTable f={Q4} editable={!rq} values={vq} reveal={rq} editRow="final"
            onChange={(i, v) => { if (rq) return; const n = [...vq]; n[i] = v; setVq(n); if (n.every((s) => s !== null)) { setRq(true); kit.react(n.every((s, k) => s === TQ[k])); } }} />
          {rq && <SignProbe f={Q4} range={Q4_RANGE} unit={34} xStep={1} yStep={1} value={0} paintAll showZeros="all" frozen />}
          {rq ? (
            <>
              <Feedback tone={okQ ? 'ok' : 'ko'}>{okQ ? 'Trois cases justes.' : 'Regarde les cases corrigées.'} La règle des signes vaut pour un quotient. Mais en x = 1 le dénominateur s’annule : Q(1) n’existe pas — une <strong>double barre</strong>, pas un 0. Le seul zéro de Q est −2 (le numérateur).</Feedback>
              <KnowledgeBrick
                id="regle-signe-quotient"
                variant="new"
                lead={<>La colonne x = 1 que tu viens de voir barrée deux fois : voilà ce qu’elle dit.</>}
              />
              <KnowledgeBrick
                id="methode-tableau-produit-quotient"
                variant="new"
                compact
                lead={<>Produit ou quotient, tu viens de faire deux fois le même trajet.</>}
              />
            </>
          ) : (
            <Feedback tone="info">Le signe d’un quotient suit la même règle que celui d’un produit.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3, title: 'La double barre', done: q3,
      content: (
        <TapQuestion prompt="Pourquoi une double barre (et pas un 0) dans la colonne x = 1 du tableau de Q ?"
          options={['Le dénominateur x − 1 s’annule : Q(1) n’existe pas, 1 est une valeur interdite', 'Parce que Q(1) = 0', 'Parce que le signe ne change pas en 1', 'Parce que 1 est positif']}
          correct={0} cols={1}
          requires={['regle-signe-quotient', 'zero-fonction', 'tableau-de-signes']}
          explain="On ne divise pas par zéro. En 1, le quotient n’a pas de valeur : ni positive, ni négative, ni nulle. La double barre le rappelle — et 1 ne sera jamais solution d’une inéquation sur Q."
          explainWrong="Q(1) = 3/0 n’existe pas : 1 est une valeur interdite, marquée par une double barre. Un 0 signifierait Q(1) = 0, ce qui est faux (c’est le numérateur qui doit s’annuler pour cela, en −2)."
          solved={q3} onAnswered={() => setQ3(true)} />
      ),
    },
    {
      num: 4, title: 'Sans tableau affiché', done: q4,
      content: (
        <BatchChoiceQuestion intro={<p className="text-sm text-slate-700"><MathText>{'$h(x) = (2x - 4)(x + 1)$'}</MathText> et <MathText>{'$k(x) = \\dfrac{x - 5}{x + 1}$'}</MathText>.</p>}
          rows={[
            { id: 'r1', label: 'Zéros de h', options: ['−1 et 2', '4 et −1', '2 seulement'], correct: 0, correction: '2x − 4 = 0 ⟺ x = 2 ; x + 1 = 0 ⟺ x = −1' },
            { id: 'r2', label: 'Signe de h(0)', options: ['négatif', 'positif', 'nul'], correct: 0, correction: '(−4) × (1) < 0' },
            { id: 'r3', label: 'Signe de h(3)', options: ['positif', 'négatif', 'nul'], correct: 0, correction: '(2) × (4) > 0' },
            { id: 'r4', label: 'k(−1)', options: ['n’existe pas', 'vaut 0', 'est négatif'], correct: 0, correction: 'dénominateur nul : valeur interdite' },
          ]}
          requires={['regle-signe-produit', 'regle-signe-quotient', 'methode-tableau-produit-quotient', 'formule-zero-affine']}
          feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Pour un produit ou un quotient : le zéro de chaque facteur, une ligne par facteur, la règle des signes — et la double barre aux zéros du dénominateur.</Feedback>}
          solved={q4} onAnswered={() => setQ4(true)} />
      ),
    },
  ];

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Produit et quotient" moduleSubtitle="Une ligne par facteur, la règle des signes pour la dernière" estimatedTime="12 min"
      brief={{ tag: 'Manipulation', title: 'Quand f(x) est un produit', tone: 'emerald', body: <p>Chaque facteur affine a son tableau (module 3). Empilés, ils donnent celui du produit : dans chaque colonne, on multiplie les signes. Pour un quotient, même règle — avec une surprise au dénominateur.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4}>Un tableau de signes n’est pas une fin : il sert à résoudre. Module suivant : f(x) = 0, f(x) &gt; 0, f(x) ≤ 0.</KnowledgeSnapshot>} />
  );
}
