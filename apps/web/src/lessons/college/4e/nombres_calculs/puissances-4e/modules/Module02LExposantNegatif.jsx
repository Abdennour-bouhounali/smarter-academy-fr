import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { decimalDeDix } from '../components/puissances4e';

/**
 * Module 2 — DÉCOUVERTE : l'exposant négatif est nommé, et le contresens du
 * signe est traité de front.
 *
 * Ce que le module 1 a laissé ouvert : on a VU la descente continuer sous le
 * 1, on n'a pas encore écrit ce que valent ces barreaux. C'est ici que
 * a⁻ⁿ = 1/aⁿ est posé — et nulle part avant.
 *
 * Ce que ce module NE fait PAS : aucune règle opératoire (produit, quotient)
 * — elles attendent le module 3, qui a d'abord besoin de cette écriture.
 */
export default function Module02LExposantNegatif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Ce que dit le signe « − »',
      subtitle: 'La descente t’a montré les valeurs. Voici comment on les écrit.',
      done: q1,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="exposant-negatif"
            variant="new"
            lead={<>Les barreaux sous le 1 valaient 0,1 puis 0,01 : à chaque cran, on avait divisé une fois de plus. C’est exactement ce que note l’exposant négatif.</>}
          />
          <TapQuestion
            prompt="Que vaut 10⁻³ ?"
            options={['−1000', '0,001', '−0,001', '1000']}
            correct={1}
            cols={4}
            requires={['exposant-negatif']}
            explain="10⁻³ = 1/10³ = 1/1000 = 0,001. Le signe « − » porte sur l’EXPOSANT : il compte des divisions, il ne change pas le signe du nombre."
            explainWrong="C’est le contresens le plus fréquent. Un exposant négatif fait RAPETISSER le nombre — 0,001 est minuscule, mais parfaitement positif. Pour obtenir −1000, il faudrait écrire −10³."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Positif ou négatif ?',
      subtitle: 'Quatre écritures qui se ressemblent — et ne désignent pas du tout la même chose.',
      done: q2,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour chaque écriture, dis si le nombre est <strong>positif</strong> ou{' '}
                <strong>négatif</strong>.
              </p>
            }
            rows={[
              {
                id: 'r1',
                label: <span className="font-mono text-base">10⁻²</span>,
                options: ['positif', 'négatif'],
                correct: 0,
                correction: '10⁻² = 0,01, un petit nombre positif',
              },
              {
                id: 'r2',
                label: <span className="font-mono text-base">−10²</span>,
                options: ['positif', 'négatif'],
                correct: 1,
                correction: '−10² = −100 : ici le signe porte sur le nombre',
              },
              {
                id: 'r3',
                label: <span className="font-mono text-base">2⁻⁵</span>,
                options: ['positif', 'négatif'],
                correct: 0,
                correction: '2⁻⁵ = 1/32, positif',
              },
            ]}
            requires={['exposant-negatif']}
            feedback={({ allRight }) =>
              allRight ? (
                <p className="text-sm text-emerald-700">
                  Exactement. Un signe <strong>en exposant</strong> commande une division, donc un
                  nombre plus petit ; un signe <strong>devant le nombre</strong> le fait passer de
                  l’autre côté de zéro. Ce sont deux choses différentes, et la place du signe suffit
                  à les distinguer.
                </p>
              ) : (
                <p className="text-sm text-slate-700">
                  Regarde <strong>où</strong> se trouve le signe. En exposant, il compte des
                  divisions et le nombre reste positif (10⁻² = 0,01). Devant le nombre, il rend le
                  résultat négatif (−10² = −100).
                </p>
              )
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Compter les zéros',
      subtitle: 'Une puissance de 10 s’écrit en décimal sans jamais poser de calcul.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-violet-200 bg-violet-50/40 p-3">
            <div className="grid grid-cols-2 gap-2 font-mono text-sm sm:grid-cols-3">
              {[4, 2, 0, -1, -3, -5].map((e) => (
                <div key={e} className="rounded-lg border border-violet-100 bg-white px-2 py-1.5 text-center">
                  <div className="text-slate-500">
                    10<sup>{e < 0 ? `−${-e}` : e}</sup>
                  </div>
                  <div className="font-bold text-violet-700">{decimalDeDix(e)}</div>
                </div>
              ))}
            </div>
          </div>
          <NumericQuestion
            prompt="Combien de zéros y a-t-il APRÈS la virgule dans l’écriture décimale de 10⁻⁶, avant le 1 ?"
            expected={5}
            requires={['exposant-negatif']}
            explain="10⁻⁶ = 0,000001 : il y a 5 zéros après la virgule, puis le 1 en 6ᵉ position. L’exposant donne le RANG du 1, pas le nombre de zéros."
            explainFor={(n) =>
              n === 6
                ? "Presque : 6 est le rang du chiffre 1 après la virgule, mais les zéros qui le précèdent ne sont que 5. Écris-le pour voir : 0,000001."
                : "Compte sur l’exemple 10⁻³ = 0,001 : deux zéros, puis le 1 en 3ᵉ position. Pour 10⁻⁶, c’est donc 5 zéros puis le 1."
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="L’exposant négatif"
      moduleSubtitle="Ce que le signe veut dire — et ce qu’il ne veut pas dire"
      estimatedTime="11 min"
      brief={{
        tag: 'Découverte',
        title: 'Un signe qui trompe',
        tone: 'indigo',
        body: (
          <p>
            Tu as vu la descente continuer sous le 1 : les nombres rapetissent sans jamais devenir
            négatifs. Reste à savoir comment on <strong>écrit</strong> ces barreaux — et pourquoi
            leur signe « − » ne veut pas dire ce qu’on croit.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
