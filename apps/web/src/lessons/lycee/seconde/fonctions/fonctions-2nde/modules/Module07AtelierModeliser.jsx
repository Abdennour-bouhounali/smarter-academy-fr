import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { H7, curvePieces, parseDec, formatDec } from '../components/fonctionsUtils';

/**
 * Module 7 — LABORATOIRE D'ENTRAÎNEMENT : modéliser.
 * Le support se retire : la feuille de 30 cm sans machine, un forfait sans
 * courbe, une courbe sans expression connue puis avec.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   L'atelier n'introduit qu'une chose, et elle vient en tête : la brique
 *   `methode-verifier-modele`. Tout le reste a été posé aux modules 1 à 6, et
 *   chaque question le déclare en `requires`. Le sous-titre de l'étape 2 ne
 *   dit plus « 2 Go inclus » : un sous-titre se lit alors que l'étape est
 *   encore verrouillée, et « inclus » y annonçait une borne fermée avant que
 *   l'énoncé ne la donne.
 */
const H_RANGE = { xMin: -3, xMax: 3, yMin: -6, yMax: 5 };

export default function Module07AtelierModeliser() {
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Une feuille de 30 cm',
      subtitle: 'Même boîte, feuille carrée de 30 cm, découpe x aux quatre coins.',
      done: q1a && q1b,
      content: (
        <div className="space-y-4">
          <KnowledgeBrick
            id="methode-verifier-modele"
            variant="new"
            lead={<>Avant de faire confiance à une expression, on la met à l’épreuve — sur une valeur qu’on connaît déjà, et sur l’ensemble où la situation a un sens.</>}
          />
          <TapQuestion prompt="Volume de la boîte en fonction de x ?"
            requires={['methode-verifier-modele', 'methode-modeliser', 'vocab-variable', 'vocab-notation-fx', 'calcul-litteral']}
            options={['V(x) = x(30 − 2x)²', 'V(x) = x(30 − x)²', 'V(x) = 30x − 2x²', 'V(x) = (30 − 2x)²']}
            correct={0} cols={2}
            explain="Le fond est un carré de côté 30 − 2x (une découpe de chaque côté), la hauteur est x : V(x) = x(30 − 2x)², définie sur ]0 ; 15[."
            explainWrong="Reprends la boîte de 20 cm : V(x) = x(20 − 2x)². Avec 30 cm, le fond mesure 30 − 2x et la hauteur x : V(x) = x(30 − 2x)²."
            solved={q1a} onAnswered={() => setQ1a(true)} />
          {q1a && (
            <NumericQuestion prompt={<span>Calcule V(5), en cm³.</span>} expected={2000} parse={parseDec} display={formatDec(2000)}
              requires={['methode-calculer-image', 'methode-verifier-modele', 'vocab-notation-fx', 'carre-nombre']}
              explain={<span>V(5) = 5 × (30 − 10)² = 5 × 20² = 5 × 400 = <strong>2 000</strong> cm³.</span>}
              explainFor={(n) => (n === 3125 ? 'Tu as retiré x d’un seul côté : 30 − 5 = 25. Le fond mesure 30 − 2 × 5 = 20.' : n === 100 ? '5 × 20 = 100 : n’oublie pas le carré, le fond est 20 × 20.' : n === 400 ? '20² = 400 est l’aire du fond ; multiplie par la hauteur 5.' : 'V(5) = 5 × (30 − 2 × 5)² = 5 × 400 = 2 000.')}
              solved={q1b} onAnswered={() => setQ1b(true)} />
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le forfait',
      subtitle: 'Un forfait mobile dont le prix change à partir d’un certain volume de données.',
      done: q2,
      content: (
        <BatchChoiceQuestion
          intro={<p className="text-sm text-slate-700">Forfait mobile : 10 € jusqu’à 2 Go, puis 4 € par Go supplémentaire, jusqu’à 10 Go au plus. Si x est le nombre de Go et f(x) le prix : f(x) = 10 si x ∈ [0 ; 2] ; f(x) = 10 + 4(x − 2) si x ∈ ]2 ; 10].</p>}
          requires={['methode-fonction-par-morceaux', 'ensemble-definition', 'regle-antecedent-equation', 'image-antecedent', 'appartient', 'intervalle-crochets']}
          rows={[
            { id: 'r1', label: 'f(1)', options: ['10 €', '14 €', '4 €'], correct: 0, correction: '1 ≤ 2 : forfait de base' },
            { id: 'r2', label: 'f(5)', options: ['22 €', '30 €', '20 €'], correct: 0, correction: '10 + 4 × 3' },
            { id: 'r3', label: 'Ensemble de définition', options: ['[0 ; 10]', ']2 ; 10]', 'ℝ'], correct: 0, correction: 'de 0 à 10 Go' },
            { id: 'r4', label: 'Antécédent de 18 €', options: ['4 Go', '2 Go', '8 Go'], correct: 0, correction: '10 + 4(x − 2) = 18 → x = 4' },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Un forfait par paliers est une fonction définie par morceaux sur [0 ; 10] : on repère le morceau, puis on calcule. L’antécédent de 18 se cherche dans le second morceau : 4(x − 2) = 8, x = 4.
            </Feedback>
          )}
          solved={q2} onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Lire une courbe',
      done: q3,
      content: (
        <BatchChoiceQuestion
          intro={(
            <div className="space-y-2">
              <p className="text-sm text-slate-700">La courbe de <MathText>{'$h(x) = -x^2 + 4$'}</MathText> sur [−3 ; 3] :</p>
              <CoordPlane range={H_RANGE} unit={30} curves={curvePieces(H7, H_RANGE).map((pc, i) => ({ id: `h${i}`, points: pc, tone: 'violet', width: 2.5 }))} caption={false} ariaLabel="Courbe de h(x) = −x² + 4 sur [−3 ; 3]" />
            </div>
          )}
          requires={['methode-lire-image-graphique', 'methode-lire-antecedents-graphique', 'methode-tester-point', 'courbe-representative', 'methode-calculer-image']}
          rows={[
            { id: 'r1', label: 'h(0)', options: ['4', '0', '−4'], correct: 0, correction: 'le sommet' },
            { id: 'r2', label: 'Antécédents de 0', options: ['−2 et 2', '2', '4'], correct: 0, correction: 'la courbe coupe l’axe deux fois' },
            { id: 'r3', label: 'h(3)', options: ['−5', '5', '13'], correct: 0, correction: '−9 + 4' },
            { id: 'r4', label: 'Le point (1 ; 3) est-il sur la courbe ?', options: ['oui : h(1) = 3', 'non', 'oui : h(3) = 1'], correct: 0, correction: '−1 + 4 = 3' },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} La courbe et l’expression disent la même chose : on lit sur l’une, on vérifie sur l’autre. Un point est sur la courbe quand son ordonnée est l’image de son abscisse.
            </Feedback>
          )}
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7}
      moduleTitle="Atelier : modéliser"
      moduleSubtitle="Choisir la variable, écrire la fonction, répondre"
      estimatedTime="10 min"
      brief={{ tag: 'Atelier', title: 'Trois situations, tes outils', tone: 'rose', body: <p>À chaque fois : quelle est la variable ? sur quel ensemble ? dans quel registre la question se résout-elle le plus vite ?</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={7}>Il ne reste qu’à le prouver : la mission finale. Dix épreuves, une seule validation.</KnowledgeSnapshot>}
    />
  );
}
