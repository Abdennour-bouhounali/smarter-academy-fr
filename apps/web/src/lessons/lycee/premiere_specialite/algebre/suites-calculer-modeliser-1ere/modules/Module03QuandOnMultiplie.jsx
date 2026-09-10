import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PliageDesPas from '../components/PliageDesPas';
import {
  CAS_GEOMETRIQUES, nthGeometric, nthArithmetic, parseNombre, fr,
} from '../components/sommesUtils';

/**
 * Module 3 — DÉCOUVERTE : le terme de rang n d'une suite géométrique (P2).
 *
 * Étape 1  le MÊME PLIAGE, l'autre opération. Dix « × 2 » ne se replient pas
 *          en « × 20 » : ils se replient sur un EXPOSANT, exactement ce que la
 *          3e appelle une puissance. → brique `terme-rang-geometrique`.
 * Étape 2  l'appliquer : u(10) avec u(0) = 3 et q = 2.
 * Étape 3  une raison DÉCIMALE, et une raison PLUS PETITE QUE 1. La formule ne
 *          change pas ; c'est la seule chose à vérifier.
 * Étape 4  les deux familles côte à côte → brique `mem-les-deux-sauts`, et le
 *          contraste chiffré qui justifie qu'on ne les confonde pas.
 *
 * PLAFOND DE LISIBILITÉ. Aucun terme cité ne dépasse 10⁶ ni quatre décimales
 * (`GEO_PLAFOND`, balayé par le test) : une géométrique de raison 3 au rang 30
 * vaudrait 2 × 10¹⁴, illisible — et le point n'est pas de produire un monstre.
 *
 * MANIPULATION JAMAIS GELÉE : les plieuses restent pilotables après validation.
 * Seul demeure le verrou d'ANTÉRIORITÉ de l'étape 3 sur l'étape 2.
 */
export default function Module03QuandOnMultiplie() {
  const G = CAS_GEOMETRIQUES[0];    // u(0) = 3, q = 2, rang 10
  const H = CAS_GEOMETRIQUES[1];    // u(0) = 400, q = 1,05, rang 10
  const D = CAS_GEOMETRIQUES[2];    // u(0) = 64, q = 0,5, rang 6

  const [rangG, setRangG] = useState(2);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [rangD, setRangD] = useState(2);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = rangG >= 5 && q1;
  const done2 = q2;
  const done3 = q3;

  const cible10 = nthGeometric(G.u0, G.q, G.n);              // 3072
  const arrondi = (x) => Math.round(x * 100) / 100;

  const steps = [
    {
      num: 1,
      title: 'Replier des multiplications',
      subtitle:
        'Même instrument, autre opération : chaque pas MULTIPLIE par 2. Fais grandir le rang, au moins jusqu’à 5.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PliageDesPas
            u0={G.u0}
            pas={G.q}
            mode="mul"
            n={rangG}
            nMax={G.n}
            onChangeRang={(v) => {
              setRangG(v);
              if (!done1 && v >= 5 && q1) kit.react?.(true);
            }}
          />
          <TapQuestion
            prompt="Dix pas qui multiplient chacun par 2 : que fait-on au premier terme, en tout ?"
            options={[
              'On le multiplie par 2¹⁰, c’est-à-dire par 1 024',
              'On le multiplie par 2 × 10, c’est-à-dire par 20',
              'On lui ajoute 2 dix fois, c’est-à-dire 20',
              'On le multiplie par 10, puisqu’il y a dix pas',
            ]}
            correct={0}
            cols={1}
            requires={['suite-geometrique', 'puissance', 'exposant']}
            explain={`Multiplier dix fois par 2, c’est multiplier par 2 × 2 × … × 2 dix fois, ce qui s’écrit 2¹⁰ = 1 024. C’est exactement ce que compte un exposant : le nombre de facteurs, pas leur valeur.`}
            explainWrong="Multiplier dix fois PAR 2 n’est pas multiplier PAR 20 : 3 × 20 = 60, alors que la suite atteint 3 072 au rang 10. Le nombre de pas devient l’EXPOSANT, jamais un facteur."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {done1 && (
            <>
              <Feedback tone="ok">
                Là où l’addition répétée donnait une multiplication, la multiplication répétée donne
                une <strong>puissance</strong>. C’est le même geste de pliage, un cran plus haut.
              </Feedback>
              <KnowledgeBrick
                id="terme-rang-geometrique"
                variant="new"
                lead={<>L’écriture directe de l’autre famille. Puis reprends le cliquet en la lisant.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le rang 10 sans les gravir',
      done: done2,
      content: () => (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="font-mono text-sm font-bold text-slate-900">{G.label}</p>
            <p className="mt-1 font-mono text-[13px] text-slate-600">
              premiers termes : {[0, 1, 2, 3, 4].map((n) => fr(nthGeometric(G.u0, G.q, n))).join(' · ')} …
            </p>
          </div>
          <NumericQuestion
            prompt={<>Que vaut <strong>u({fr(G.n)})</strong> ?</>}
            expected={cible10}
            parse={parseNombre}
            display={fr(cible10)}
            requires={['terme-rang-geometrique', 'puissance']}
            explain={`u(${fr(G.n)}) = ${fr(G.u0)} × 2¹⁰ = ${fr(G.u0)} × 1 024 = ${fr(cible10)}.`}
            explainFor={(n) =>
              n === G.u0 * G.q * G.n
                ? `${fr(G.u0 * G.q * G.n)}, c’est ${fr(G.u0)} × 2 × 10 : on a multiplié PAR 10 au lieu de multiplier DIX FOIS. L’exposant compte les facteurs.`
                : n === nthGeometric(G.u0, G.q, G.n - 1)
                ? `${fr(nthGeometric(G.u0, G.q, G.n - 1))} est au rang ${fr(G.n - 1)} : un pas de trop peu.`
                : n === G.u0 * G.q ** (G.n + 1)
                ? `${fr(G.u0 * G.q ** (G.n + 1))} est au rang ${fr(G.n + 1)} : on a compté les cases au lieu des pas.`
                : n === (G.u0 * G.q) ** G.n
                ? `Ce serait (u(0) × q)¹⁰. On n’élève QUE la raison : u(0) reste devant, en facteur.`
                : null
            }
            solved={done2}
            onAnswered={() => setQ2(true)}
          />
          {done2 && (
            <Feedback tone="ok">
              Dix pas, un exposant, un résultat. Et au rang 20 il suffirait de changer l’exposant —
              la formule ne bouge pas.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Une raison plus petite que 1',
      subtitle:
        'Autre réglage : la raison vaut 0,5, et la suite descend. Vérifie si la formule doit changer.',
      done: done3,
      content: () => (
        <div className="space-y-3">
          <PliageDesPas
            u0={D.u0}
            pas={D.q}
            mode="mul"
            n={rangD}
            nMax={D.n}
            onChangeRang={setRangD}
            disabled={!done2}
          />
          <NumericQuestion
            prompt={<>Que vaut <strong>u({fr(D.n)})</strong> pour cette suite ?</>}
            expected={nthGeometric(D.u0, D.q, D.n)}
            parse={parseNombre}
            display={fr(nthGeometric(D.u0, D.q, D.n))}
            requires={['terme-rang-geometrique']}
            explain={`u(${fr(D.n)}) = ${fr(D.u0)} × 0,5⁶ = ${fr(D.u0)} ÷ 64 = ${fr(nthGeometric(D.u0, D.q, D.n))}. La formule est la même : une raison entre 0 et 1 fait descendre, sans rien changer au calcul.`}
            explainFor={(n) =>
              n === D.u0 / 2
                ? `${fr(D.u0 / 2)} est au rang 1 : un seul pas. Il en faut ${fr(D.n)}.`
                : n === nthGeometric(D.u0, D.q, D.n - 1)
                ? `${fr(nthGeometric(D.u0, D.q, D.n - 1))} est au rang ${fr(D.n - 1)}.`
                : n === D.u0 - D.n
                ? `Retrancher ${fr(D.n)} serait une raison additive. Ici on DIVISE par 2 à chaque pas.`
                : null
            }
            solved={done3}
            onAnswered={() => setQ3(true)}
          />
          {done3 && (
            <Feedback tone="ok">
              La même formule, pour une suite qui descend : <strong>u(0) × qⁿ</strong>. Et avec une
              raison décimale comme {fr(H.q)}, rien ne change non plus — au rang {fr(H.n)}, la
              suite {H.label} vaut {fr(arrondi(nthGeometric(H.u0, H.q, H.n)))}.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Les deux sauts, côte à côte',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3">
              <div className="text-[13px] font-semibold text-emerald-800">u(0) = 3, on AJOUTE 2</div>
              <p className="mt-1 font-mono text-sm text-emerald-900">
                rang 10 → {fr(nthArithmetic(3, 2, 10))}
              </p>
            </div>
            <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-3">
              <div className="text-[13px] font-semibold text-rose-800">u(0) = 3, on MULTIPLIE par 2</div>
              <p className="mt-1 font-mono text-sm text-rose-900">
                rang 10 → {fr(nthGeometric(3, 2, 10))}
              </p>
            </div>
          </div>
          <TapQuestion
            prompt="Deux suites, même premier terme, même nombre 2, même rang. Pourquoi un tel écart ?"
            options={[
              'Parce que 2 est un facteur ajouté dix fois d’un côté (10 × 2), et un facteur multiplié dix fois de l’autre (2¹⁰)',
              'Parce que la deuxième suite a une raison plus grande',
              'Parce que la deuxième part d’un premier terme plus grand',
              'C’est une erreur de calcul : les deux devraient donner la même chose',
            ]}
            correct={0}
            cols={1}
            requires={['terme-rang-arithmetique', 'terme-rang-geometrique', 'exposant']}
            explain={`3 + 10 × 2 = ${fr(nthArithmetic(3, 2, 10))} contre 3 × 2¹⁰ = ${fr(nthGeometric(3, 2, 10))}. Le même nombre 2 occupe deux places différentes : il est ajouté dix fois d’un côté, multiplié dix fois de l’autre. C’est la place de n — en facteur ou en exposant — qui creuse l’écart.`}
            explainWrong="Les deux suites ont bien la même raison en valeur (2) et le même premier terme (3) : rien de tout cela ne diffère. Ce qui diffère, c’est l’opération répétée."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <KnowledgeBrick
              id="mem-les-deux-sauts"
              variant="new"
              lead={<>Les deux écritures directes, réunies sur une seule carte.</>}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Quand on multiplie"
      moduleSubtitle="Le même pliage, un cran plus haut : n multiplications identiques deviennent un exposant"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Dix fois « × 2 », ce n’est pas « × 20 »',
        tone: 'indigo',
        body: (
          <p>
            Le pliage a marché pour l’addition. Reprends-le pour l’autre famille — et vérifie où le
            nombre de pas va se loger cette fois.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Autre question.</strong> Tu sais atteindre un rang lointain dans les deux
          familles. Reste ce que l’escalier de colonnes avait laissé en suspens : le TOTAL.
        </KnowledgeSnapshot>
      }
    />
  );
}
