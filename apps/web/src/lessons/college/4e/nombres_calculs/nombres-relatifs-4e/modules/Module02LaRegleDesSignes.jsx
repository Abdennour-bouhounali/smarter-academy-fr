import React, { useState } from 'react';
import { ContentModule, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import {
  fmt, fmtParen, multiplier, parseRelatif, diagnostiquerProduit, DIAGNOSTIC_PRODUIT,
} from '../components/operations';

/**
 * Module 2 — DÉCOUVERTE : la règle des signes, écrite.
 *
 * Le module 1 a rendu la règle INÉVITABLE ; celui-ci l'énonce et la fait
 * appliquer. La brique arrive en tête d'étape 1 parce que la table du module
 * précédent l'a déjà établie par le geste — ce n'est pas une définition
 * parachutée, c'est la mise en mots de ce qui vient d'être constaté.
 *
 * Ce que ce module ne fait PAS : plusieurs facteurs (M3), la division (M4).
 */
export default function Module02LaRegleDesSignes() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Les quatre cas',
      subtitle: 'Ce que la table du module précédent a imposé, écrit une fois pour toutes.',
      done: q1,
      content: (
        <div className="space-y-3">
          {/* « facteur » est nommé ICI, en position d'ENSEIGNEMENT, avant la
              première demande qui l'emploie (M2 étape 1, puis M3). Un mot
              rencontré d'abord dans une option ou un `correction` arriverait
              après la demande — docs/architecture/KNOWLEDGE_DEPENDENCY.md. */}
          <KnowledgeBrick
            id="regle-des-signes"
            variant="new"
            lead={(
              <>
                Dans un produit comme {fmt(-6)} × {fmtParen(-7)}, on appelle <strong>les deux
                facteurs</strong> les deux nombres que l’on multiplie. Les colonnes que tu as
                prolongées se résument alors en quatre cas — et en une méthode en deux temps.
              </>
            )}
          />
          <BatchChoiceQuestion
            intro={<p className="text-sm text-slate-700">Pour chaque produit, choisis le <strong>signe</strong> du résultat.</p>}
            rows={[
              { id: 's1', label: `${fmt(-6)} × ${fmtParen(-7)}`, options: ['Positif', 'Négatif'], correct: 0, correction: 'Deux facteurs négatifs → produit positif : 42.' },
              { id: 's2', label: `${fmt(8)} × ${fmtParen(-5)}`, options: ['Positif', 'Négatif'], correct: 1, correction: `Signes contraires → produit négatif : ${fmt(-40)}.` },
              { id: 's3', label: `${fmt(-9)} × ${fmtParen(3)}`, options: ['Positif', 'Négatif'], correct: 1, correction: `Signes contraires → produit négatif : ${fmt(-27)}.` },
              { id: 's4', label: `${fmt(-4)} × ${fmtParen(-4)}`, options: ['Positif', 'Négatif'], correct: 0, correction: 'Deux facteurs négatifs → produit positif : 16.' },
            ]}
            requires={['regle-des-signes']}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Calcule un produit',
      done: q2,
      content: (
        <NumericQuestion
          prompt={`Combien fait ${fmt(-7)} × ${fmtParen(-6)} ?`}
          expected={multiplier(-7, -6)}
          parse={parseRelatif}
          display={fmt(multiplier(-7, -6))}
          requires={['regle-des-signes']}
          explain={`En deux temps : 7 × 6 = 42, puis deux facteurs négatifs donnent un produit positif. D’où ${fmt(multiplier(-7, -6))}.`}
          explainFor={(n) => {
            const why = diagnostiquerProduit(-7, -6, n);
            return why === 'ok' ? null : <>{DIAGNOSTIC_PRODUIT[why]}</>;
          }}
          solved={q2}
          onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Le piège de l’addition',
      done: q3,
      content: (
        <NumericQuestion
          prompt={`Combien fait ${fmt(-5)} × ${fmtParen(-2)} ?`}
          expected={multiplier(-5, -2)}
          parse={parseRelatif}
          display={fmt(multiplier(-5, -2))}
          requires={['regle-des-signes']}
          explain={`5 × 2 = 10, et deux négatifs donnent un positif : ${fmt(multiplier(-5, -2))}. Attention à ne pas confondre avec ${fmt(-5)} + ${fmtParen(-2)}, qui vaut ${fmt(-7)} : additionner deux négatifs donne bien un négatif, mais les MULTIPLIER donne un positif.`}
          explainFor={(n) => {
            const why = diagnostiquerProduit(-5, -2, n);
            if (why === 'addition') {
              return <>Tu as calculé la <strong>somme</strong> ({fmt(-7)}), pas le produit. C’est la confusion la plus fréquente : « − + − = − », mais « − × − = + ».</>;
            }
            return why === 'ok' ? null : <>{DIAGNOSTIC_PRODUIT[why]}</>;
          }}
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="La règle des signes"
      moduleSubtitle="Quatre cas, une méthode en deux temps"
      estimatedTime="11 min"
      brief={{
        tag: 'Découverte',
        title: 'Mettre des mots sur la table',
        tone: 'indigo',
        body: (
          <p>
            La table t’a montré ce qui doit arriver. Il reste à l’écrire sous une forme qui serve
            pour <strong>tous</strong> les produits, pas seulement ceux de la colonne.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
