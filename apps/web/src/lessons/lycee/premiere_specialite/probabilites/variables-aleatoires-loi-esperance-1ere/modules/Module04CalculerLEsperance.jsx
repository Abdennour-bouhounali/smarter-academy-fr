import React, { useState, useMemo, useCallback } from 'react';
import { ContentModule, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { makeRng } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import WheelLab, { TableauDeLoi } from '../components/WheelLab';
import {
  GROS_LOT_DEFAUT, N_SIMULATION, loiDeLaRoue, esperanceDeLaRoue, grandLivre,
  sessionSeed, euros, fr,
} from '../components/roueUtils';

/**
 * Module 4 — MANIPULATION : poser le calcul, et voir la ligne rouge du calcul
 * venir se poser sur la ligne verte de la simulation.
 *
 * Étape 1  les trois produits, un par un : 0 × 0,4, puis 1 × 0,4, puis
 *          5 × 0,2. On les fait CALCULER avant de nommer leur somme.
 * Étape 2  la somme, puis la SUPERPOSITION : la ligne du calcul se pose sur
 *          celle de la simulation. L'élève peut alors changer le gros lot et
 *          relancer autant qu'il veut : les deux lignes se suivent.
 * Étape 3  appliquer sur un dé équilibré (3,5, aucune face) et sur une roue
 *          modifiée.
 *
 * CE QUE LE MODULE N'AFFIRME PAS. Les deux lignes se REJOIGNENT presque ; il
 * n'est écrit nulle part qu'elles sont égales. Sur 500 tirages l'écart est réel,
 * et il est AFFICHÉ : c'est plus honnête, et c'est ce que le test verrouille
 * (marge déclarée en σ/√n dans roueUtils).
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 les produits calculés ; étape 2 la
 * somme et la superposition constatées → briques `esperance`,
 * `methode-calculer-esperance`, `mem-esperance` ; étape 3 les demandes.
 *
 * MANIPULATION JAMAIS GELÉE : le laboratoire de l'étape 2 reste pilotable après
 * validation — c'est même là que l'élève doit refaire le geste pour se
 * convaincre. `disabled` ne porte que le verrou d'ANTÉRIORITÉ.
 */
export default function Module04CalculerLEsperance() {
  const graine = useMemo(() => sessionSeed(), []);

  const [p1, setP1] = useState(false);
  const [p2, setP2] = useState(false);
  const [p3, setP3] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const [grosLot, setGrosLot] = useState(GROS_LOT_DEFAUT);
  const [series, setSeries] = useState(1);

  const loi = loiDeLaRoue(GROS_LOT_DEFAUT);
  const loiLab = loiDeLaRoue(grosLot);
  const esperance = esperanceDeLaRoue(GROS_LOT_DEFAUT);      // 1,4
  const esperanceLab = esperanceDeLaRoue(grosLot);

  const livre = useMemo(
    () => grandLivre(loiLab, N_SIMULATION, makeRng(graine + series * 104729 + grosLot)),
    [loiLab, graine, series, grosLot],
  );

  const done1 = p1 && p2 && p3;
  const relancer = useCallback(() => setSeries((s) => s + 1), []);
  const changerLot = useCallback((v) => { setGrosLot(v); setSeries((s) => s + 1); }, []);

  const ecart = Math.abs(livre.moyenne - esperanceLab);

  const steps = [
    {
      num: 1,
      title: 'Chaque valeur, multipliée par SA probabilité',
      subtitle:
        'Le tableau est prêt. Calcule les trois produits « valeur × probabilité », un par un.',
      done: done1,
      content: (
        <div className="space-y-3">
          <TableauDeLoi loi={loi} titre="La loi de X" avecTotal={false} />
          <NumericQuestion
            prompt={<>Premier produit : <strong>0 × 0,4</strong></>}
            expected={0}
            parse={parseDec}
            display="0"
            requires={['loi-de-probabilite', 'tableau-de-loi']}
            explain="0 × 0,4 = 0. Les quatre secteurs qui ne paient rien ne contribuent en rien — c’est cohérent."
            solved={p1}
            onAnswered={() => setP1(true)}
          />
          <NumericQuestion
            prompt={<>Deuxième produit : <strong>1 × 0,4</strong></>}
            expected={0.4}
            parse={parseDec}
            display="0,4"
            requires={['loi-de-probabilite', 'tableau-de-loi']}
            explain="1 × 0,4 = 0,4."
            solved={p2}
            onAnswered={() => setP2(true)}
          />
          <NumericQuestion
            prompt={<>Troisième produit : <strong>5 × 0,2</strong></>}
            expected={1}
            parse={parseDec}
            display="1"
            requires={['loi-de-probabilite', 'tableau-de-loi']}
            explain="5 × 0,2 = 1. Le gros lot est rare (0,2) mais gros (5 €) : sa contribution reste la plus forte des trois."
            explainFor={(n) => (n === 5 ? 'Tu as gardé le montant sans le multiplier par sa probabilité : 5 × 0,2 = 1.' : null)}
            solved={p3}
            onAnswered={() => setP3(true)}
          />
          {done1 && (
            <Feedback tone="ok">
              Trois produits : <strong>0</strong>, <strong>0,4</strong> et <strong>1</strong>. Une
              valeur rare mais forte peut peser plus qu’une valeur fréquente mais faible : c’est
              tout l’intérêt de multiplier plutôt que de faire une moyenne simple.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La somme, et la superposition',
      subtitle: 'Additionne les trois produits. Puis regarde où tombe ce nombre sur la règle des gains.',
      done: q2,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<>Combien vaut <strong>0 + 0,4 + 1</strong> ?</>}
            expected={1.4}
            parse={parseDec}
            display="1,4"
            requires={['loi-de-probabilite', 'tableau-de-loi', 'somme-des-probabilites-vaut-1']}
            explain="1,4. C’est exactement l’endroit où la ligne verte se posait au module 1 — obtenu sans lancer une seule fois la roue."
            explainFor={(n) =>
              n === 2
                ? 'Tu as fait la moyenne simple des gains : (0 + 1 + 5) ÷ 3 = 2. Mais les trois montants n’ont pas la même chance de sortir : il faut les peser par leur probabilité.'
                : n === 6
                ? 'Tu as additionné les gains eux-mêmes (0 + 1 + 5). Ce sont les PRODUITS « gain × probabilité » qu’il faut additionner : 0 + 0,4 + 1.'
                : null
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <>
              <Feedback tone="ok">
                <strong>{euros(esperance)}</strong> — le tableau seul a suffi. Regarde maintenant la
                règle ci-dessous : la ligne rouge du calcul et la ligne verte de la simulation sont
                à {euros(ecart)} l’une de l’autre sur {N_SIMULATION} lancers. Elles ne se
                confondent pas : la moyenne observée <em>s’approche</em> du nombre calculé, elle ne
                l’égale pas.
              </Feedback>
              <KnowledgeBrick
                id="esperance"
                variant="new"
                lead={<>Le nom et la formule de ce nombre.</>}
              />
              <KnowledgeBrick
                id="methode-calculer-esperance"
                variant="new"
                compact
                lead={<>Les quatre gestes que tu viens de faire, dans l’ordre.</>}
              />
              <KnowledgeBrick
                id="mem-esperance"
                variant="new"
                lead={<>La seule chose à retenir par cœur de ce module.</>}
              />
              <WheelLab
                grosLot={grosLot}
                onChangeGrosLot={changerLot}
                livre={livre}
                valeurCalculee={esperanceLab}
                onLancer500={relancer}
                disabled={!done1}
              />
              <p className="text-[13px] text-slate-600">
                👉 Change le gros lot, relance : la ligne rouge est calculée d’avance et la ligne
                verte vient la retrouver, série après série. Écart actuel : {euros(ecart)}.
              </p>
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Trois espérances à calculer',
      done: q3,
      content: (
        <BatchChoiceQuestion
          intro={<p>Applique E(X) = somme des « valeur × probabilité ».</p>}
          rows={[
            {
              id: 'e1',
              label: 'Un sac de six boules identiques numérotées de 1 à 6 ; X = le numéro tiré',
              options: ['3,5', '3', '6'],
              correct: 0,
              correction: 'Chaque boule a la probabilité 1/6 : (1 + 2 + 3 + 4 + 5 + 6)/6 = 21/6 = 3,5. Et aucune boule ne porte 3,5.',
            },
            {
              id: 'e2',
              label: 'X vaut 0 avec 0,5 et 10 avec 0,5',
              options: ['5', '10', '0,5'],
              correct: 0,
              correction: '0 × 0,5 + 10 × 0,5 = 5. Là non plus, 5 n’est pas une valeur possible.',
            },
            {
              id: 'e3',
              label: 'X vaut 2 avec 0,9 et 100 avec 0,1',
              options: ['11,8', '51', '10'],
              correct: 0,
              correction: '2 × 0,9 + 100 × 0,1 = 1,8 + 10 = 11,8. (51 serait la moyenne simple de 2 et 100 : elle ignore que 100 est dix fois plus rare.)',
            },
          ]}
          requires={['esperance', 'methode-calculer-esperance', 'mem-esperance']}
          feedback={({ allRight }) =>
            allRight ? (
              <>
                Dans les trois cas, l’espérance n’est aucune valeur possible. Et le contrôle d’ordre
                de grandeur marche à chaque fois : le résultat tombe entre la plus petite et la
                plus grande valeur.
              </>
            ) : (
              <>
                Le piège récurrent est la moyenne simple : pour 2 et 100, elle donnerait 51, alors
                que 100 n’a qu’une chance sur dix de sortir. Chaque valeur pèse selon SA
                probabilité.
              </>
            )
          }
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Calculer l’espérance"
      moduleSubtitle="Somme des valeurs × leur probabilité — et la ligne tombe juste"
      estimatedTime="12 min"
      brief={{
        tag: 'Atelier',
        title: 'Prévoir sans lancer',
        tone: 'indigo',
        body: (
          <p>
            Le tableau de la loi contient tout ce qu’il faut. Trois multiplications, une addition,
            et le nombre où se posait la ligne verte apparaît — sans un seul lancer.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Le nombre est là.</strong> Reste à savoir ce qu’il annonce vraiment — et ce qu’il
          n’annonce pas. Module suivant : l’interpréter.
        </KnowledgeSnapshot>
      }
    />
  );
}
