import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 6 — LABORATOIRE D'ENTRAÎNEMENT. Trois situations réelles où la
 * difficulté est d'IDENTIFIER l'opération avant de la faire : composer,
 * inverser, ou remonter. Les erreurs n'y comptent jamais comme preuve de
 * maîtrise (stage practice_lab).
 */
export default function Module06AtelierLireLesEvolutions() {
  const [a1, setA1] = useState(false);
  const [a2, setA2] = useState(false);
  const [b1, setB1] = useState(false);
  const [b2, setB2] = useState(false);
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);

  const Situation = ({ emoji, title, children }) => (
    <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/50 p-4 space-y-3">
      <p className="text-sm font-black text-rose-900">{emoji} {title}</p>
      {children}
    </div>
  );

  const steps = [
    {
      num: 1,
      title: 'Les soldes en deux temps',
      done: a1 && a2,
      content: (
        <Situation emoji="🏷️" title="« −30 %, puis −50 % sur les articles déjà soldés »">
          {/* Les trois opérations existent déjà (modules 2, 4 et 5) ; ce que
              l'atelier demande de neuf, c'est de CHOISIR laquelle. La brique
              pose ce tri avant la première situation. */}
          <KnowledgeBrick
            id="methode-choisir-operation"
            variant="new"
            lead={<>Tu sais composer, inverser et remonter. Dans les trois situations qui suivent, la difficulté est ailleurs : décider laquelle l’énoncé réclame.</>}
          />
          <p className="text-sm text-slate-700">Un blouson affiché 200 € avant les soldes.</p>
          <TapQuestion
            prompt="La remise totale annoncée par un client comme « −80 % » est-elle correcte ?"
            requires={['methode-choisir-operation', 'coefficient-global', 'somme-jamais', 'pourcentage']}
            options={[
              'Non : 0,70 × 0,50 = 0,35, donc −65 %',
              'Oui : 30 + 50 = 80 %',
              'Non : c’est −15 %',
              'Non : c’est −80 % mais seulement sur le second article',
            ]}
            correct={0} cols={1}
            explain="Il reste 70 % puis la moitié de cela : 0,70 × 0,50 = 0,35, soit 35 % du prix. La remise est de 65 %, avantageuse mais inférieure aux 80 % imaginés."
            explainWrong="La seconde remise porte sur le prix déjà soldé (140 €), pas sur 200 €. Il reste 0,70 × 0,50 = 35 % du prix initial : la remise vaut 65 %."
            solved={a1} onAnswered={() => setA1(true)}
          />
          {a1 && (
            <NumericQuestion
              prompt="Quel est le prix final du blouson, en euros ?"
              requires={['methode-composer', 'coefficient-global', 'pourcentage']}
              expected={70} suffix="€"
              explain="200 × 0,70 × 0,50 = 70 €. On peut aussi faire 200 × 0,35 = 70 €."
              explainFor={(n) => (n === 40
                ? '40 € correspondrait à −80 %. La bonne chaîne est 200 × 0,70 = 140, puis 140 × 0,50 = 70 €.'
                : n === 140
                  ? 'C’est le prix après la PREMIÈRE remise seulement. Il reste à en prendre la moitié : 70 €.'
                  : '200 × 0,70 × 0,50 = 70 €.')}
              solved={a2} onAnswered={() => setA2(true)}
            />
          )}
        </Situation>
      ),
    },
    {
      num: 2,
      title: 'Trois ans de population',
      done: b1 && b2,
      content: (
        <Situation emoji="🏘️" title="« +5 % la première année, −5 % la deuxième, +2 % la troisième »">
          <p className="text-sm text-slate-700">Une commune de 12 000 habitants au départ.</p>
          <TapQuestion
            prompt="Sans calculer précisément, la population après trois ans est…"
            requires={['methode-choisir-operation', 'coefficient-global', 'somme-jamais', 'base-mouvante', 'pourcentage']}
            options={[
              'un peu supérieure à 12 000, car +5 − 5 + 2 = +2 % environ mais la compensation +5/−5 est légèrement négative',
              'exactement 12 240 habitants',
              'inférieure à 12 000',
              'exactement 12 000 habitants',
            ]}
            correct={0} cols={1}
            explain="1,05 × 0,95 = 0,9975 (soit −0,25 %), puis × 1,02 donne 1,017450 : +1,745 %. C’est un peu MOINS que les +2 % qu’on obtiendrait en additionnant, à cause de la compensation imparfaite +5 %/−5 %."
            explainWrong="+5 % puis −5 % ne se compense pas exactement : 1,05 × 0,95 = 0,9975. Le coefficient global vaut 0,9975 × 1,02 ≈ 1,0175, soit +1,75 % — donc plus de 12 000, mais moins que 12 240."
            solved={b1} onAnswered={() => setB1(true)}
          />
          {b1 && (
            <NumericQuestion
              prompt="Combien d’habitants après ces trois années ? (arrondi à l’unité)"
              requires={['methode-composer', 'coefficient-global', 'arrondi']}
              expected={(n) => Math.abs(n - 12209) <= 1}
              display="12 209 habitants"
              explain="12 000 × 1,05 × 0,95 × 1,02 = 12 209,4, soit environ 12 209 habitants."
              explainFor={(n) => (Math.abs(n - 12240) < 2
                ? '12 240 viendrait d’une hausse de 2 % (la somme des taux). Le produit donne 12 000 × 1,05 × 0,95 × 1,02 ≈ 12 209.'
                : 'On multiplie les trois coefficients : 12 000 × 1,05 × 0,95 × 1,02 ≈ 12 209 habitants.')}
              solved={b2} onAnswered={() => setB2(true)}
            />
          )}
        </Situation>
      ),
    },
    {
      num: 3,
      title: 'Le salaire gelé puis revalorisé',
      done: c1 && c2,
      content: (
        <Situation emoji="💼" title="« Après une revalorisation de 4 %, le salaire net est de 2 080 € »">
          <p className="text-sm text-slate-700">On cherche le salaire d’avant la revalorisation.</p>
          <TapQuestion
            prompt="Quelle opération donne le salaire initial ?"
            requires={['methode-choisir-operation', 'retrouver-valeur-initiale', 'evolution-reciproque', 'pourcentage']}
            options={[
              '2 080 ÷ 1,04',
              '2 080 × 0,96',
              '2 080 − 4',
              '2 080 × 1,04',
            ]}
            correct={0} cols={2}
            explain="Le salaire initial a été multiplié par 1,04 pour donner 2 080 €. Pour remonter, on divise : 2 080 ÷ 1,04. Multiplier par 0,96 serait retirer 4 % de 2 080, ce qui n’est pas la même chose."
            explainWrong="V_i × 1,04 = 2 080, donc V_i = 2 080 ÷ 1,04. Attention : ×0,96 donnerait 1 996,80 €, un nombre qui ne redonne pas 2 080 après +4 %."
            solved={c1} onAnswered={() => setC1(true)}
          />
          {c1 && (
            <NumericQuestion
              prompt="Quel était le salaire initial, en euros ?"
              requires={['retrouver-valeur-initiale', 'verification-systematique']}
              expected={2000} suffix="€"
              explain="2 080 ÷ 1,04 = 2 000 €. Vérification : 2 000 × 1,04 = 2 080 ✓."
              explainFor={(n) => (Math.abs(n - 1996.8) < 1
                ? 'C’est 2 080 × 0,96. Or retirer 4 % de 2 080 n’annule pas une hausse de 4 % : il faut diviser, 2 080 ÷ 1,04 = 2 000 €.'
                : '2 080 ÷ 1,04 = 2 000 €.')}
              solved={c2} onAnswered={() => setC2(true)}
            />
          )}
        </Situation>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6}
      moduleTitle="Atelier : lire les évolutions" moduleSubtitle="Composer, inverser, ou remonter ?" estimatedTime="10 min"
      brief={{
        tag: 'Atelier', title: 'Quelle opération ?', tone: 'rose',
        body: <p>Dans chaque situation, commence par décider ce que demande l’énoncé : enchaîner des évolutions, en annuler une, ou remonter à la valeur de départ. Les erreurs ne comptent pas ici.</p>,
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
