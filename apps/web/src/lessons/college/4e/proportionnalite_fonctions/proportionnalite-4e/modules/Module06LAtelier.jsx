import React, { useState } from 'react';
import { Wrench } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CroixLab from '../components/CroixLab';
import {
  parseDec, fr, eur, pct,
  quatriemeProportionnelle, appliquerEvolution, valeurInitiale, coefficientMultiplicateur,
} from '../components/prop4e';
import { ratToNumber } from '../../../../../common/algebra4e';

/**
 * Module 6 — PRACTICE LAB : trois situations réelles, de l'énoncé à la
 * réponse, où l'élève CHOISIT son outil.
 *
 * Ce module n'enseigne rien de neuf : il fait choisir. Les trois situations
 * appellent trois outils différents — le produit en croix, le coefficient
 * multiplicateur, la remontée à la valeur initiale — et l'énoncé ne dit
 * jamais lequel. Les erreurs n'y comptent pas comme preuve (stage
 * `practice_lab`) : c'est l'endroit où l'on a le droit de se tromper.
 */

// Situation 1 — change : aucun passage entier, la croix est l'outil.
const CHANGE = { euros: 7, livres: 6, cible: 12 }; // 7 € → 6 £, combien pour 12 € ?
// Situation 2 — soldes successives.
const SOLDES = { prix: 80, remise: 0.3 };
// Situation 3 — remonter à la valeur initiale.
const AVANT = { affiche: 78, hausse: 0.3 };

export default function Module06LAtelier() {
  const [q1, setQ1] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [diag, setDiag] = useState([]);

  const livresPour12 = quatriemeProportionnelle(CHANGE.euros, CHANGE.livres, CHANGE.cible);

  const steps = [
    {
      num: 1,
      title: 'Au bureau de change',
      subtitle: '7 € valent 6 £. Combien vaut un billet de 12 € ?',
      done: q1 && q1b,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Quel outil convient ici ?"
            options={[
              'Le produit en croix',
              'Un coefficient multiplicateur d’évolution',
              'Une remontée à la valeur initiale',
            ]}
            correct={0}
            cols={1}
            requires={['produit-en-croix', 'coefficient-multiplicateur']}
            explain="On cherche une quatrième proportionnelle, et de 7 à 12 on ne passe par aucun nombre simple : c’est le cas où la croix sert."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <>
              <CroixLab
                a={CHANGE.euros} b={CHANGE.livres} c={CHANGE.cible} d={0}
                inconnue="d"
                diagonales={diag}
                onDiagonale={(n) => setDiag((d) => (d.includes(n) ? d.filter((x) => x !== n) : [...d, n]))}
                labels={{ colonnes: ['Euros', 'Livres'], lignes: ['Taux affiché', 'Mon billet'] }}
              />
              <NumericQuestion
                prompt="Combien de livres pour 12 € ? Donne un résultat au dixième."
                expected={Math.round(ratToNumber(livresPour12) * 10) / 10}
                parse={parseDec}
                suffix="£"
                requires={['produit-en-croix']}
                explain={`6 × 12 = 72, puis 72 ÷ 7 ≈ ${fr(ratToNumber(livresPour12), 1)} £. Le résultat exact est la fraction 72/7 : il ne tombe pas juste, et c’est normal pour un taux de change.`}
                solved={q1b}
                onAnswered={() => setQ1b(true)}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Aux soldes',
      subtitle: `Un manteau à ${eur(SOLDES.prix)} est soldé de ${pct(-SOLDES.remise)}.`,
      done: q2,
      content: (
        <NumericQuestion
          prompt="Prix soldé, en euros"
          expected={appliquerEvolution(SOLDES.prix, -SOLDES.remise)}
          parse={parseDec}
          suffix="€"
          requires={['coefficient-multiplicateur']}
          explain={`On garde 70 % du prix : ${SOLDES.prix} × 0,7 = ${eur(appliquerEvolution(SOLDES.prix, -SOLDES.remise))}.`}
          explainFor={(n) => {
            if (n === 24) return 'Tu as calculé la REMISE (80 × 0,3 = 24 €). Le prix payé est ce qui reste : 80 − 24, soit 80 × 0,7.';
            if (n === 50 || n === 77) return 'Attention : 30 est un pourcentage, pas un nombre d’euros. On multiplie par 0,7.';
            return null;
          }}
          solved={q2}
          onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Le prix d’avant',
      subtitle: `Après une hausse de ${pct(AVANT.hausse)}, un abonnement coûte ${eur(AVANT.affiche)}.`,
      done: q3,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt="Combien coûtait-il avant la hausse, en euros ?"
            expected={valeurInitiale(AVANT.affiche, coefficientMultiplicateur(AVANT.hausse))}
            parse={parseDec}
            suffix="€"
            requires={['valeur-initiale', 'coefficient-multiplicateur']}
            explain={`${AVANT.affiche} est le prix APRÈS ×1,3. On remonte en divisant : ${AVANT.affiche} ÷ 1,3 = ${eur(valeurInitiale(AVANT.affiche, coefficientMultiplicateur(AVANT.hausse)))}. Vérification : 60 × 1,3 = 78.`}
            explainFor={(n) => {
              if (n === 54.6) return 'Tu as appliqué une baisse de 30 % (78 × 0,7). Or les 30 % avaient été calculés sur le prix d’AVANT, plus bas : il faut diviser par 1,3.';
              if (n === 48) return 'Tu as retiré 30 € au lieu de 30 %. La hausse valait 30 % de 60, soit 18 €.';
              return null;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="ok">
              Trois situations, trois outils. Aucun énoncé ne t’a dit lequel choisir : c’est
              exactement ce qu’on te demandera.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="L’atelier"
      moduleSubtitle="Trois situations, et c’est toi qui choisis l’outil"
      estimatedTime="9 min"
      brief={{
        tag: '🎬 Mission 06',
        title: 'Personne ne te dira quelle méthode employer',
        tone: 'slate',
        body: (
          <>
            Un bureau de change, des soldes, un abonnement qui augmente. À toi de reconnaître
            ce que chaque situation demande. <strong>Les erreurs ne comptent pas ici.</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-3.5">
          <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
          <p className="text-sm text-rose-900">
            Avant de calculer, demande-toi : est-ce que je cherche une quatrième valeur, ou est-ce
            qu’une grandeur ÉVOLUE ? Et si elle évolue, dans quel sens vais-je ?
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
