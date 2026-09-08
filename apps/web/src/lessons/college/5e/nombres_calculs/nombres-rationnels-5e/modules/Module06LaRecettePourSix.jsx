import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { frac, fractionDe, RECETTE, parseEntier } from '../components/rationnels';

/**
 * Module 6 — LABORATOIRE D'ENTRAÎNEMENT : la recette à adapter.
 *
 * Transfert, pas répétition : la fraction cesse d'être un point sur une droite
 * pour devenir une ACTION sur une quantité — partager, puis prendre. C'est le
 * dernier visage de la notion, et celui que les problèmes utilisent.
 *
 * La méthode enseignée est celle qui marche toujours et qui se contrôle :
 * diviser par le dénominateur, multiplier par le numérateur — dans cet ordre,
 * parce que la première étape donne une quantité qui a un SENS (une part).
 *
 * Toutes les données viennent de components/rationnels.js et sont vérifiées
 * par le test : `tombeJuste` garantit qu'aucun ingrédient ne produit un
 * partage à virgule que la 5e n'a pas à traiter ici.
 */
const TROIS_DEMIS = frac(3, 2);
const MOITIE = frac(1, 2);

/** La recette, en tableau — DOM en flux, aucune collision possible. */
function Table({ facteur = null }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse min-w-[300px]">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-2 font-semibold">Ingrédient</th>
            <th className="py-2 px-2 font-semibold text-right">Pour {RECETTE.personnes}</th>
            {facteur && <th className="py-2 pl-2 font-semibold text-right text-rose-700">Adapté</th>}
          </tr>
        </thead>
        <tbody>
          {RECETTE.ingredients.map((i) => (
            <tr key={i.nom} className="border-t border-slate-200">
              <td className="py-2 pr-2 text-slate-700">{i.nom}</td>
              <td className="py-2 px-2 text-right font-mono tabular-nums text-slate-800">
                {i.quantite} {i.unite}
              </td>
              {facteur && (
                <td className="py-2 pl-2 text-right font-mono tabular-nums font-bold text-rose-700">
                  {fractionDe(facteur, i.quantite)} {i.unite}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Module06LaRecettePourSix() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Une part, d’abord',
      subtitle: 'La méthode commence toujours par un partage — parce qu’une part, ça a un sens.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-rose-200 bg-white p-3">
            <Table />
          </div>
          <NumericQuestion
            prompt={<>On veut les <span className="font-mono font-bold">3/4</span> des 300 g de farine. Combien pèse UN quart de cette farine ?</>}
            expected={75}
            parse={parseEntier}
            display="75 g"
            suffix="g"
            requires={['fraction-nombre', 'quotient']}
            explain="Un quart, c’est un partage en 4 : 300 ÷ 4 = 75 g. C’est la quantité d’UNE part."
            explainFor={(n) => {
              if (n === 1200) return 'Pour prendre un quart, on DIVISE par 4, on ne multiplie pas : 300 ÷ 4 = 75 g.';
              if (n === 225) return 'Tu as donné les TROIS quarts d’un coup (3 × 75 = 225). La question ne portait que sur UNE part : 300 ÷ 4 = 75 g.';
              return 'Un quart de 300, c’est 300 partagé en 4 : 300 ÷ 4 = 75 g.';
            }}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Puis autant de parts qu’il en faut',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="fraction-quantite"
            variant="new"
            lead={<>Tu viens de calculer une part. Il ne reste qu’un pas — et c’est le numérateur qui le dit.</>}
          />
          <NumericQuestion
            prompt={<>Combien pèsent alors les <span className="font-mono font-bold">3/4</span> des 300 g de farine ?</>}
            expected={225}
            parse={parseEntier}
            display="225 g"
            suffix="g"
            requires={['fraction-quantite']}
            explain="Une part vaut 75 g, et on en prend 3 : 3 × 75 = 225 g. Contrôle : les 3/4 doivent être un peu moins que le tout, et 225 g est bien un peu moins que 300 g."
            explainFor={(n) => {
              if (n === 75) return 'C’est la valeur d’UNE part. Il en faut trois : 3 × 75 = 225 g.';
              if (n === 400) return 'Attention au sens : les 3/4 d’une quantité sont forcément PLUS PETITS que cette quantité. 400 g serait plus que les 300 g de départ.';
              return 'Une part = 300 ÷ 4 = 75 g, puis on en prend 3 : 3 × 75 = 225 g.';
            }}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'La recette pour six',
      subtitle: 'Passer de 4 à 6 personnes, c’est multiplier chaque quantité par 3/2.',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Pour nourrir 6 personnes au lieu de 4, par quelle fraction faut-il multiplier chaque quantité ?"
            options={['3/2', '2/3', '6/10', '1/2']}
            correct={0}
            cols={4}
            requires={['fraction-quantite', 'simplifier']}
            explain="On passe de 4 à 6 parts : le facteur est 6/4, qui se simplifie en 3/2 (en divisant les deux termes par 2). C’est plus grand que 1, ce qui est logique : il faut davantage d’ingrédients."
            explainWrong="Attention au sens : on veut nourrir PLUS de monde, donc il faut PLUS d’ingrédients — le facteur doit être plus grand que 1. 2/3 et 1/2 sont plus petits que 1 : ils réduiraient la recette."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <div className="rounded-2xl border-2 border-rose-200 bg-white p-3 space-y-2">
              <p className="text-sm text-slate-600">
                Chaque quantité est partagée en 2, puis prise 3 fois :
              </p>
              <Table facteur={TROIS_DEMIS} />
            </div>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Trois quantités à calculer',
      subtitle: 'La même méthode à chaque fois : diviser, puis multiplier.',
      done: q4,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Cette fois on veut faire une <strong>demi-recette</strong> (pour 2 personnes).
                Quelle quantité pour chaque ingrédient ?
              </p>
            }
            rows={RECETTE.ingredients.map((i, idx) => ({
              id: `r${idx}`,
              label: `${i.nom} : la moitié de ${i.quantite} ${i.unite}`,
              options: [
                `${fractionDe(MOITIE, i.quantite)} ${i.unite}`,
                `${i.quantite * 2} ${i.unite}`,
                `${i.quantite - 2} ${i.unite}`,
              ],
              correct: 0,
              correction: `${i.quantite} ÷ 2 = ${fractionDe(MOITIE, i.quantite)} ${i.unite}.`,
            }))}
            requires={['fraction-quantite']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Prendre la moitié, c’est partager en 2 et prendre 1 part. La méthode est
                  exactement la même que pour les 3/4 — seuls les deux nombres changent. Et le
                  contrôle reste le même : une <strong>fraction plus petite que 1</strong> donne
                  toujours <strong>moins</strong> que la quantité de départ.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Prendre une fraction d’une quantité, ce n’est ni
                  multiplier par 2 ni retirer 2 : c’est <strong>partager par le dénominateur</strong>{' '}
                  (ici 2), puis prendre autant de parts que l’indique le numérateur (ici 1).
                </Feedback>
              )
            }
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="La recette pour six"
      moduleSubtitle="Quand la fraction agit sur une quantité"
      estimatedTime="9 min"
      brief={{
        tag: 'Entraînement',
        title: 'La recette est pour quatre',
        tone: 'rose',
        body: (
          <p>
            Vous serez six à table, et la recette est prévue pour quatre. Toutes les quantités sont
            à revoir. C’est le dernier visage de la fraction : non plus un point sur une droite,
            mais une <strong>action sur une quantité</strong>.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
