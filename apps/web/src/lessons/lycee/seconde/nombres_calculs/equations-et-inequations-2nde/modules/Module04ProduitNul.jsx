import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProductScanner from '../components/ProductScanner';
import { lin, evalProduct } from '../components/eqUtils';

/**
 * Module 4 — MANIPULATION : « Produit nul ».
 * Activity: balayer x pour (x − 2)(2x + 6) ; voir le produit s'annuler
 *   exactement quand un facteur s'annule ; résoudre une équation produit ;
 *   déjouer « (x + 1)(x − 1) = 3 ».
 * Mathematical objective: A × B = 0 ⇔ A = 0 ou B = 0 — et seulement pour 0.
 * Expected observation: deux valeurs annulent le produit, 2 et −3, une par
 *   facteur ; ailleurs le produit n'est jamais nul.
 */
const F = [lin(1, -2), lin(2, 6)];

export default function Module04ProduitNul() {
  const [x, setX] = useState(0);
  const [zeros, setZeros] = useState(() => new Set());
  const [whyDone, setWhyDone] = useState(false);
  const [solveDone, setSolveDone] = useState(false);
  const [trapDone, setTrapDone] = useState(false);
  const [squareDone, setSquareDone] = useState(false);
  const scan = (v) => { setX(v); if (evalProduct(F, v) === 0) { const s = new Set(zeros); s.add(v); setZeros(s); } };
  const scanDone = zeros.has(2) && zeros.has(-3);

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Produit nul"
      moduleSubtitle="Deux facteurs, un produit : balaye x et vois le produit tomber à 0 exactement quand un facteur s’annule."
      estimatedTime="11 min"
      brief={{ tag: '✖️ Mission 04', title: '(x − 2)(2x + 6) = 0. Deux facteurs, et une question : pour quels x le produit vaut-il 0 ?', tone: 'indigo', body: <p>Balaye x. Il y a plus d’une réponse.</p> }}
      steps={[
        {
          num: 1, title: 'Trouve tous les x qui annulent le produit', done: scanDone,
          content: (kit) => (
            <div className="space-y-3">
              <ProductScanner factors={F} x={x} onX={(v) => { scan(v); if (evalProduct(F, v) === 0 && !zeros.has(v)) kit.react(true); }} showRoots={scanDone} />
              {scanDone ? <Feedback tone="ok">Deux solutions : <strong>x = 2</strong> (le premier facteur vaut 0) et <strong>x = −3</strong> (le second vaut 0). Ailleurs, aucun facteur n’est nul, et le produit non plus.</Feedback>
                : <Feedback tone="info">{zeros.size === 0 ? 'Cherche un x où la barre « produit » est vide.' : `Une solution trouvée (x = ${[...zeros][0]}). Regarde l’autre facteur : lui aussi peut s’annuler.`}</Feedback>}
            </div>
          ),
        },
        {
          num: 2, title: 'Pourquoi exactement là ?', done: whyDone,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="vocab-facteur"
                establishes={['facteur']}
                variant="new"
                compact
                lead="Un mot d’abord, pour désigner les deux morceaux du produit."
              />
              <TapQuestion prompt="Un produit de deux nombres vaut 0…" options={['si et seulement si l’un au moins des deux facteurs vaut 0', 'seulement si les deux facteurs valent 0', 'si les deux facteurs sont opposés']} cols={1} correct={0}
              explain="C’est la règle du produit nul : A × B = 0 ⇔ A = 0 ou B = 0. Un seul facteur nul suffit ; et si aucun ne l’est, le produit ne l’est pas. D’où deux branches à résoudre séparément."
              explainWrong="Regarde le scanner : en x = 2, seul le premier facteur est nul, et le produit l’est déjà. Il suffit d’UN facteur nul (« ou »), et il en faut au moins un."
                requires={['vocab-facteur']}
                solved={whyDone} onAnswered={() => setWhyDone(true)} />
              {whyDone && (
                <KnowledgeBrick
                  id="produit-nul"
                  variant="new"
                  lead="Le scanner et ta réponse disent la même chose. Voilà la règle, telle qu’on l’écrit."
                />
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'Résous (3x − 6)(x + 1) = 0', subtitle: 'Une branche par facteur.', done: solveDone,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion rows={[
              { id: 'r1', label: '3x − 6 = 0 ⇔', options: ['x = 2', 'x = −2', 'x = 6'], correct: 0, correction: '3x = 6, x = 2.' },
              { id: 'r2', label: 'x + 1 = 0 ⇔', options: ['x = 1', 'x = −1'], correct: 1 },
              { id: 'r3', label: 'Ensemble des solutions', options: ['{2 ; −1}', '{2}', '{−2 ; 1}'], correct: 0 },
            ]}
              feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>Deux branches, deux solutions : S = {'{'}−1 ; 2{'}'}. Vérification : (3 × 2 − 6)(2 + 1) = 0 × 3 = 0 et (3 × (−1) − 6)(−1 + 1) = (−9) × 0 = 0.</Feedback>}
                requires={['produit-nul', 'vocab-facteur', 'methode-premier-degre', 'regle-nombre-de-solutions']}
                solved={solveDone} onAnswered={() => setSolveDone(true)} />
              {solveDone && (
                <KnowledgeBrick
                  id="methode-equation-produit"
                  variant="new"
                  lead="Une branche par facteur, puis on rassemble : tu viens de le faire. Voilà la méthode, ramener à 0 compris."
                />
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'Le piège du 3', done: trapDone,
          content: (
            <div className="space-y-3">
              <TapQuestion prompt="(x + 1)(x − 1) = 3. Peut-on dire « x + 1 = 3 ou x − 1 = 3 » ?" options={['Non : la règle ne marche que pour un produit égal à 0', 'Oui, c’est la même règle', 'Oui, si on prend x = 2 ou x = 4']} cols={1} correct={0}
              explain="Un produit égal à 3 peut être 1 × 3, 1,5 × 2, 6 × 0,5… rien n’impose qu’un facteur vaille 3. La règle du produit nul ne vaut que pour 0. (Ici : x² − 1 = 3, x² = 4, x = 2 ou x = −2 — vérifie : (2 + 1)(2 − 1) = 3.)"
              explainWrong="Teste x = 2 : (2 + 1)(2 − 1) = 3 × 1 = 3, c’est bien une solution — mais aucun facteur ne vaut 3 ! La règle « un facteur vaut… » ne marche que pour 0. Il faut d’abord tout ramener à « … = 0 »."
                requires={['produit-nul', 'vocab-facteur']}
                solved={trapDone} onAnswered={() => setTrapDone(true)} />
              {trapDone && (
                <KnowledgeBrick
                  id="regle-piege-produit-non-nul"
                  variant="new"
                  compact
                  lead="Le « = 3 » ne se traite pas comme le « = 0 ». Retiens pourquoi."
                />
              )}
            </div>
          ),
        },
        {
          num: 5, title: 'x² = 9', done: squareDone,
          content: (
            <div className="space-y-3">
              <TapQuestion prompt="Combien de solutions a l’équation x² = 9 ?" options={['Deux : 3 et −3', 'Une : 3', 'Une : 4,5', 'Aucune']} cols={2} correct={0}
              explain="x² − 9 = 0, soit (x − 3)(x + 3) = 0 : x = 3 ou x = −3. Les deux ont pour carré 9. Oublier −3 est l’erreur classique."
              explainWrong="(−3)² = 9 aussi. En ramenant à 0 : x² − 9 = (x − 3)(x + 3) = 0, produit nul → deux solutions, 3 et −3."
                requires={['methode-equation-produit', 'produit-nul', 'regle-nombre-de-solutions']}
                solved={squareDone} onAnswered={() => setSquareDone(true)} />
              {squareDone && (
                <KnowledgeBrick
                  id="mem-produit-nul"
                  variant="new"
                  compact
                  lead="S’il ne fallait retenir qu’une chose de ce module :"
                />
              )}
            </div>
          ),
        },
      ]}
      footer={<Feedback tone="ok"><strong>Équation produit nul :</strong> A × B = 0 ⇔ A = 0 ou B = 0. Ramener à 0 d’abord, factoriser, puis une branche par facteur. Et si x est au dénominateur ? Une valeur devient interdite : module suivant.</Feedback>}
    />
  );
}
