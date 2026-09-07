import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SignProbe from '../components/SignProbe';
import { TEMP, TEMP_RANGE, BENEFICE, Q6, solveSign, setText } from '../components/signeUtils';

/**
 * Module 6 — LABORATOIRE D'ENTRAÎNEMENT : gel, bénéfice, quotient — le signe
 * répond à une question réelle.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Les trois étapes s'ouvraient directement sur une demande : traduire « il
 *   gèle » par T(t) < 0, « l'entreprise gagne » par B(q) > 0, sans qu'aucune
 *   brique n'ait posé ce passage de la question à l'inéquation. La brique
 *   `methode-modeliser-signe` est donc en TÊTE de l'étape 1, avant la
 *   première demande ; les étapes 2 et 3 la réemploient.
 */
export default function Module06AtelierGelEtBenefice() {
  const [q1, setQ1] = useState(false); const [q2, setQ2] = useState(false); const [q3, setQ3] = useState(false);
  const steps = [
    {
      num: 1, title: 'Quand gèle-t-il ?', subtitle: 'T(t) = −0,1(t − 6)(t − 18) sur [0 ; 24]. Il gèle quand T(t) < 0.', done: q1,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="methode-modeliser-signe"
            variant="new"
            lead={<>La courbe des températures du module 1 revient — mais cette fois c’est la question qui doit devenir une inéquation.</>}
          />
          <TapQuestion above={(revealed) => (revealed ? <SignProbe f={TEMP} range={TEMP_RANGE} unit={15} unitY={14} xStep={1} yStep={2} labelEvery={2} axisLabels={{ x: 't', y: 'T' }} value={12} paintAll showZeros="all" frozen highlightIntervals={solveSign(TEMP, '<').map((I) => ({ from: I.a, to: I.b, tone: 'rose' }))} /> : null)}
            prompt="Pendant quelles heures gèle-t-il ?"
            options={['[0 ; 6[ ∪ ]18 ; 24]', ']6 ; 18[', '[6 ; 18]', 'jamais']} correct={0} cols={2}
            requires={['methode-modeliser-signe', 'methode-resoudre-par-le-signe', 'vocab-solutions-intervalles', 'regle-signe-produit']}
            explain={<span>Zéros 6 et 18. Le facteur −0,1 est négatif : à droite de 18 le produit est négatif, il change à chaque zéro : − + −. T(t) &lt; 0 sur [0 ; 6[ et ]18 ; 24] — bornes 0 et 24 comprises (l’étude va de 0 à 24), 6 et 18 exclues (T = 0, il ne gèle pas encore). Solutions : {setText(solveSign(TEMP, '<'))}.</span>}
            explainWrong="Il gèle quand la courbe est SOUS l’axe : au module 1, l’axe était rose avant 6 h et après 18 h. Entre 6 h et 18 h, T > 0."
            solved={q1} onAnswered={() => setQ1(true)} />
        </div>
      ),
    },
    {
      num: 2, title: 'Le bénéfice', subtitle: 'Une entreprise vend q dizaines d’articles ; son bénéfice (en centaines d’euros) est B(q) = (q − 20)(80 − q).', done: q2,
      content: (
        <BatchChoiceQuestion intro={<p className="text-sm text-slate-700"><MathText>{'$B(q) = (q - 20)(80 - q)$'}</MathText></p>}
          rows={[
            { id: 'r1', label: 'Zéros de B', options: ['20 et 80', '−20 et 80', '20 et −80'], correct: 0, correction: 'q − 20 = 0 ; 80 − q = 0' },
            { id: 'r2', label: 'B(50)', options: ['positif', 'négatif', 'nul'], correct: 0, correction: '(30)(30) > 0' },
            { id: 'r3', label: 'B(10)', options: ['négatif', 'positif', 'nul'], correct: 0, correction: '(−10)(70) < 0' },
            { id: 'r4', label: 'L’entreprise gagne de l’argent (B > 0) pour', options: [']20 ; 80[', ']−∞ ; 20[ ∪ ]80 ; +∞[', '[20 ; 80]'], correct: 0, correction: 'la case +' },
          ]}
          requires={['methode-modeliser-signe', 'regle-signe-produit', 'methode-resoudre-par-le-signe', 'formule-zero-affine']}
          feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Deux facteurs, deux zéros, un tableau : − + −. Le bénéfice est positif strictement entre 20 et 80 : {setText(solveSign(BENEFICE, '>'))}.</Feedback>}
          solved={q2} onAnswered={() => setQ2(true)} />
      ),
    },
    {
      num: 3, title: 'Un quotient à trancher', done: q3,
      content: (
        <TapQuestion prompt={<span>Solutions de <MathText>{'$\\dfrac{x-3}{x+1} < 0$'}</MathText> ?</span>}
          options={[']−1 ; 3[', '[−1 ; 3]', ']−∞ ; −1[ ∪ ]3 ; +∞[', ']−1 ; 3]']} correct={0} cols={2}
          requires={['regle-signe-quotient', 'methode-tableau-produit-quotient', 'methode-resoudre-par-le-signe', 'vocab-solutions-intervalles']}
          explain={<span>Zéro du numérateur : 3 ; valeur interdite : −1. Tableau : + sur ]−∞ ; −1[, ‖ en −1, − sur ]−1 ; 3[, 0 en 3, + après. Quotient négatif strictement : {setText(solveSign(Q6, '<'))} — −1 exclu (interdit), 3 exclu (quotient nul).</span>}
          explainWrong="Une ligne pour x − 3 (zéro 3), une pour x + 1 (zéro −1, interdit pour le quotient). Signes contraires seulement entre −1 et 3 : ]−1 ; 3[, bornes exclues (−1 interdit, 3 donne 0)."
          solved={q3} onAnswered={() => setQ3(true)} />
      ),
    },
  ];
  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6}
      moduleTitle="Atelier : gel et bénéfice" moduleSubtitle="Le signe répond à une question réelle" estimatedTime="8 min"
      brief={{ tag: 'Atelier', title: 'Trois questions, un outil', tone: 'rose', body: <p>Quand gèle-t-il ? Pour quelles quantités gagne-t-on de l’argent ? Un quotient négatif — à chaque fois : zéros, tableau, lecture, intervalles.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6}>Il ne reste qu’à le prouver : la mission finale. Dix épreuves, une seule validation.</KnowledgeSnapshot>} />
  );
}
