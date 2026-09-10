import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TableauDeLoi } from '../components/DeuxJeuxLab';
import {
  EPREUVE, N_PRELEVEES, SITUATIONS, LOI_BINOMIALE, probasBinomiales,
  binomialCoeff, binomialPmf, parseSigned, fr,
} from '../components/dispersionUtils';

/**
 * Module 5 — ATELIER : reconnaître, puis calculer (P4 et P5).
 *
 * Étape 1  RECONNAÎTRE : quatre situations, une seule relève de la répétition
 *          d'épreuves identiques. Les trois autres cassent chacune UNE des
 *          trois conditions — jamais deux, sinon l'élève ne saurait pas
 *          laquelle il vient de repérer.
 * Étape 2  ASSEMBLER LA FORMULE, facteur par facteur : combien de chemins, ce
 *          que coûtent les k succès, ce que coûtent les n − k échecs. Le
 *          produit tombe, et il vaut exactement ce que la loi annonce.
 * Étape 3  LE COMPLÉMENTAIRE : « au moins un » se calcule par 1 − P(X = 0),
 *          en un terme au lieu de cinq.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 le tri mené → brique
 * `coefficient-binomial` posée à l'étape 2 après le comptage, puis
 * `loi-binomiale` et `mem-loi-binomiale` une fois le produit assemblé ; étape 3
 * le calcul mené → brique `passer-au-complementaire`.
 *
 * L'ID DE LA BRIQUE `loi-binomiale` EST IMPOSÉ par le lexique d'audit.
 *
 * PARSE. Toutes les réponses sont décimales (0,3456 · 0,92224) : chaque
 * `NumericQuestion` porte `parse={parseSigned}`, qui délègue à `parseDec` après
 * avoir normalisé le vrai signe moins. `parseFr` tronquerait en silence.
 *
 * DISTRACTEURS vérifiés numériquement et DISTINCTS (dispersionUtils.test.js,
 * groupe « LES DISTRACTEURS DU BOSS » et `explainFor` ci-dessous) : coefficient
 * oublié (0,03456), probabilité brute prise pour la réponse (0,4), décalage
 * d'un cran sur k (0,2304).
 */
export default function Module05CompterLesChemins() {
  const [q1, setQ1] = useState(false);
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [c3, setC3] = useState(false);
  const [q3, setQ3] = useState(false);

  const n = N_PRELEVEES;          // 5
  const p = EPREUVE.p;            // 0,4
  const loi = LOI_BINOMIALE();
  const probas = probasBinomiales();
  const coeff2 = binomialCoeff(n, 2);          // 10
  const p2 = binomialPmf(n, 2, p);             // 0,3456
  const p0 = binomialPmf(n, 0, p);             // 0,07776
  const auMoinsUn = 1 - p0;                    // 0,92224

  const done2 = c1 && c2 && c3;

  const steps = [
    {
      num: 1,
      title: 'Reconnaître la situation',
      subtitle:
        'Trois conditions : deux issues, un nombre de répétitions fixé d’avance, des épreuves indépendantes. Il suffit qu’une tombe pour que tout tombe.',
      done: q1,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={<p>Pour chaque situation : la répétition d’épreuves identiques et indépendantes s’applique-t-elle ?</p>}
            rows={SITUATIONS.map((s) => ({
              id: s.id,
              label: s.label,
              options: s.binomiale ? ['Oui', 'Non'] : ['Non', 'Oui'],
              correct: 0,
              correction: s.raison,
            }))}
            requires={['schema-bernoulli', 'compter-les-succes', 'arbre-structure']}
            feedback={({ allRight }) =>
              allRight ? (
                <>
                  Une seule des quatre convient. Les trois autres cassent chacune une condition
                  différente : l’indépendance (tirage sans remise), le nombre fixé de répétitions
                  (on s’arrête au premier pile), les deux issues (trois réponses possibles).
                </>
              ) : (
                <>
                  Reprends les trois conditions une par une sur chaque énoncé. Le mot à traquer dans
                  le premier contre-exemple est « sans remise » ; dans le deuxième, « jusqu’à » ;
                  dans le troisième, la troisième réponse possible.
                </>
              )
            }
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Assembler la formule, facteur par facteur',
      subtitle: `On revient aux ${n} ampoules, défectueuses avec la probabilité ${fr(p)}. Combien vaut la probabilité d’en trouver exactement 2 ?`,
      done: done2,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<>Premier facteur — <strong>combien de chemins</strong> de l’arbre portent exactement 2 défauts sur {n} ?</>}
            expected={coeff2}
            parse={parseSigned}
            display={fr(coeff2)}
            requires={['compter-les-succes', 'schema-bernoulli']}
            explain="10 chemins — c’est exactement ce que tu as compté sur l’arbre au module précédent. Ce nombre de chemins s’écrit C(5, 2), et il porte un nom : voir juste en dessous."
            explainFor={(n2) => (n2 === 2 ? 'Deux est le nombre de défauts, pas le nombre de chemins qui y mènent. Il y a 10 façons de choisir lesquelles des 5 ampoules sont défectueuses.' : null)}
            solved={c1}
            onAnswered={() => setC1(true)}
          />
          {c1 && (
            <KnowledgeBrick
              id="coefficient-binomial"
              variant="new"
              lead={<>Le nom et la notation du nombre que tu viens de retrouver.</>}
            />
          )}
          <NumericQuestion
            prompt={<>Deuxième facteur — le long d’UN chemin, que coûtent les <strong>2 défauts</strong> ? Calcule {fr(p)}²</>}
            expected={p ** 2}
            parse={parseSigned}
            display={fr(p ** 2, { maxDecimals: 4 })}
            requires={['produit-chemin', 'schema-bernoulli']}
            explain="0,4 × 0,4 = 0,16. On multiplie le long d’un chemin — c’est l’arbre pondéré de 2de, rien de neuf."
            explainFor={(v) => (v === 0.8 ? 'Tu as ADDITIONNÉ les deux poids. Le long d’un chemin, on multiplie : 0,4 × 0,4 = 0,16.' : null)}
            solved={c2}
            onAnswered={() => setC2(true)}
          />
          <NumericQuestion
            prompt={<>Troisième facteur — que coûtent les <strong>{n - 2} ampoules conformes</strong> du même chemin ? Calcule {fr(1 - p)}³</>}
            expected={(1 - p) ** 3}
            parse={parseSigned}
            display={fr((1 - p) ** 3, { maxDecimals: 4 })}
            requires={['produit-chemin', 'schema-bernoulli']}
            explain="0,6 × 0,6 × 0,6 = 0,216. Deux défauts et trois conformes : cinq ampoules en tout, l’exposant total vaut bien 5."
            explainFor={(v) => (v === 1.8 ? 'Tu as multiplié 0,6 par 3 au lieu de l’élever au cube. Trois branches successives se multiplient entre elles : 0,6 × 0,6 × 0,6 = 0,216.' : null)}
            solved={c3}
            onAnswered={() => setC3(true)}
          />
          {done2 && (
            <>
              <Feedback tone="ok">
                Un chemin à 2 défauts pèse 0,16 × 0,216 = {fr(p ** 2 * (1 - p) ** 3, { maxDecimals: 5 })}. Il y en a{' '}
                {fr(coeff2)}, tous de même poids — et des chemins qui mènent au même résultat
                s’additionnent. Donc P(X = 2) = {fr(coeff2)} × {fr(p ** 2 * (1 - p) ** 3, { maxDecimals: 5 })} ={' '}
                <strong>{fr(p2, { maxDecimals: 5 })}</strong>. Trois facteurs, chacun avec sa raison
                d’être.
              </Feedback>
              <KnowledgeBrick
                id="loi-binomiale"
                variant="new"
                lead={<>La formule que tu viens d’assembler, et son nom.</>}
              />
              <KnowledgeBrick
                id="mem-loi-binomiale"
                variant="new"
                lead={<>La seule chose à retenir par cœur de ce module.</>}
              />
              <div className="space-y-1">
                <TableauDeLoi
                  loi={loi}
                  titre={`La loi complète de X pour n = ${n} et p = ${fr(p)}`}
                  enFractions={false}
                  avecTotal={false}
                  unite=""
                />
                <p className="text-[13px] text-slate-500">
                  Les six probabilités, obtenues par la même formule avec k = 0, 1, … {n}. Leur
                  somme vaut 1 : X prend forcément l’une de ces valeurs.
                </p>
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: '« Au moins une défectueuse »',
      subtitle:
        'Cette fois, plusieurs valeurs conviennent : 1, 2, 3, 4 ou 5. Cinq calculs — ou un seul, si l’on prend le problème à l’envers.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-sm text-rose-950">
            P(X = 0) = {fr(probas[0], { maxDecimals: 5 })} — la probabilité que les cinq ampoules
            soient conformes. C’est le seul de ces événements qui se calcule en un terme.
          </div>
          <TapQuestion
            prompt="Quel est l’événement CONTRAIRE de « au moins une ampoule défectueuse » ?"
            options={[
              '« Aucune ampoule défectueuse », c’est-à-dire X = 0',
              '« Au plus une ampoule défectueuse », c’est-à-dire X ⩽ 1',
              '« Exactement une ampoule défectueuse », c’est-à-dire X = 1',
              '« Au moins deux ampoules défectueuses », c’est-à-dire X ⩾ 2',
            ]}
            correct={0}
            cols={1}
            requires={['loi-binomiale', 'somme-chemins']}
            explain="« Au moins un » signifie 1, 2, 3, 4 ou 5. Le seul cas qui reste est 0 : c’est bien l’événement contraire, et sa probabilité se calcule en un unique terme."
            explainWrong="Le contraire d’un événement rassemble TOUT ce qui n’y est pas. « Au moins un » couvre les valeurs 1 à 5 ; ce qui reste est la seule valeur 0. « Au plus un » contiendrait aussi la valeur 1, qui appartient déjà à l’événement de départ — ce ne serait donc pas son contraire."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <>
              <Feedback tone="ok">
                Donc P(X ⩾ 1) = 1 − P(X = 0) = 1 − {fr(probas[0], { maxDecimals: 5 })} ={' '}
                <strong>{fr(auMoinsUn, { maxDecimals: 5 })}</strong>. Un seul calcul au lieu de
                cinq — et sur vingt ampoules, un seul au lieu de vingt.
              </Feedback>
              <KnowledgeBrick
                id="passer-au-complementaire"
                variant="new"
                lead={<>Le raccourci que tu viens d’utiliser, et l’erreur qu’il faut éviter en le posant.</>}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Compter les chemins"
      moduleSubtitle="Reconnaître la situation, puis calculer sans dessiner l’arbre"
      estimatedTime="11 min"
      brief={{
        tag: 'Atelier',
        title: 'Trente-deux chemins, une formule',
        tone: 'indigo',
        body: (
          <p>
            Dessiner l’arbre marche pour cinq ampoules. Pour vingt, il faudrait un million de
            chemins. Une formule à trois facteurs remplace le dessin — encore faut-il avoir reconnu
            la situation.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La formule est là.</strong> Reste le geste qui la précède toujours : traduire un
          énoncé en français en une variable, un n et un p. Module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
