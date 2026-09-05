import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import AffineExplorer from '../../../../../common/components/AffineExplorer';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { affineFromTwoPoints, image, cheapest, formatAffine } from '../components/affineUtils';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 6 — ATELIER : « La facture à l'envers ».
 *
 * Activity: deux factures d'un même client chez deux opérateurs ; retrouver
 *   l'expression de chaque tarif, puis régler l'abonnement du second pour
 *   qu'il devienne le moins cher au-delà d'un seuil.
 * Mathematical objective: modéliser à partir de DONNÉES (P10, P11), et
 *   comprendre que b est le levier commercial — changer l'abonnement déplace
 *   le point de bascule sans toucher au prix à la minute.
 * Student action: calculer les deux expressions, puis régler b au curseur.
 * Controlled variable: b du tarif B (a reste verrouillé — c'est l'abonnement
 *   qui se négocie, pas le prix à la minute).
 * Mathematical state: deux couples {a, b} ; `cheapest` renvoie une LISTE, donc
 *   l'égalité parfaite est reconnue au lieu d'être refusée.
 * Visual consequence: la droite B glisse verticalement ; le point où les deux
 *   se croisent se déplace le long de A.
 * Expected observation: « baisser l'abonnement rend B intéressant plus tôt ».
 * Misconception targeted: croire qu'un tarif est meilleur en toutes
 *   circonstances ; et lire un prix comme un coefficient.
 * Feedback: explainFor cible la confusion entre le prix affiché et a.
 * Formalization: aucune ; c'est l'atelier de transfert.
 * Scaffolding: expressions guidées → réglage libre → interprétation.
 * Transfer: c'est le module de transfert de la leçon.
 *
 * NOTE DE CONCEPTION — la comparaison de deux forfaits au curseur existe déjà
 * dans `fonctions-3e` (module 7). Ce module ne la refait pas : on part ici de
 * FACTURES (deux points par tarif), on remonte aux expressions, puis on
 * NÉGOCIE b. Le croisement est une conséquence, jamais la question posée.
 */

const PLAN_A = { a: 0.25, b: 0 };          // 0,25 €/min, sans abonnement
const PLAN_B_START = { a: 0.1, b: 12 };    // 0,10 €/min + abonnement à régler
const RANGE = { xMin: 0, xMax: 120, yMin: 0, yMax: 30 };
const SEUIL = 40;

export default function Module06FactureALenvers() {
  const [aDone, setADone] = useState(false);
  const [bDone, setBDone] = useState(false);
  const [bValue, setBValue] = useState(PLAN_B_START.b);
  const [interpDone, setInterpDone] = useState(false);

  // Objectif : B doit être strictement moins cher que A dès 40 minutes.
  const planB = { a: PLAN_B_START.a, b: bValue };
  const cheapAt40 = cheapest([{ id: 'A', ...PLAN_A }, { id: 'B', ...planB }], SEUIL);
  const goalReached = cheapAt40.length === 1 && cheapAt40[0] === 'B';

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="La facture à l’envers"
      moduleSubtitle="Deux factures, deux expressions à retrouver — puis un abonnement à négocier."
      estimatedTime="9 min"
      brief={{
        tag: '🧾 Mission 06',
        title: 'Ce que disent deux factures',
        tone: 'indigo',
        body: (
          <p>
            Chez l’opérateur A, 20 min ont coûté 5 € et 60 min ont coûté 15 €. Aucune
            brochure : la facture suffit à retrouver le tarif.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Le tarif de l’opérateur A',
          subtitle: '20 min → 5 € · 60 min → 15 €',
          done: aDone,
          content: (kit) => (
            <NumericQuestion
              prompt="Quel est le prix à la minute chez A ?"
              expected={affineFromTwoPoints({ x: 20, y: 5 }, { x: 60, y: 15 }).a}
              parse={parseDec}
              display={formatDec(affineFromTwoPoints({ x: 20, y: 5 }, { x: 60, y: 15 }).a)}
              suffix="€/min"
              explain="Δy = 15 − 5 = 10 € pour Δx = 40 min, donc a = 10 ÷ 40 = 0,25 €/min. Et b = 5 − 0,25 × 20 = 0 : pas d’abonnement chez A."
              explainFor={(n) => {
                if (n === 5) return 'Tu as repris un prix de facture. Le prix à la minute est un rapport : 10 € ÷ 40 min.';
                if (n === 10) return 'C’est l’écart de prix, pas le prix par minute. Divise-le par les 40 minutes d’écart.';
                if (n === 4) return 'Tu as divisé les minutes par les euros. C’est les euros divisés par les minutes.';
                return null;
              }}
              solved={aDone}
              onAnswered={(ok) => { setADone(true); kit.react(ok); }}
            />
          ),
        },
        {
          num: 2,
          title: 'A a-t-il un abonnement ?',
          done: bDone,
          content: (
            <TapQuestion
              prompt={<>Chez A, <MathText>{'$a = 0{,}25$'}</MathText>. Que vaut <MathText>{'$b$'}</MathText> ?</>}
              options={[
                'b = 0 : pas d’abonnement, c’est une fonction linéaire',
                'b = 5 : c’est la première facture',
                'b = 20 : ce sont les premières minutes',
                'Impossible à savoir avec deux factures',
              ]}
              correct={0}
              cols={1}
              explain="0,25 × 20 = 5, exactement le montant facturé : rien ne s’ajoute. Donc b = 0 et A(x) = 0,25x — une fonction linéaire, cas particulier des affines."
              explainWrong="Remplace dans 0,25 × 20 + b = 5 : il vient b = 0. Une facture n’est pas un b."
              solved={bDone}
              onAnswered={() => setBDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Négocie l’abonnement de B',
          subtitle: 'B facture 0,10 €/min. À quel abonnement devient-il intéressant dès 40 min ?',
          done: goalReached,
          content: (kit) => (
            <div className="space-y-3">
              <AffineExplorer
                a={planB.a}
                b={bValue}
                showB
                lockA
                onChange={({ b: nb }) => {
                  if (nb === bValue) return;
                  setBValue(nb);
                  const next = cheapest([{ id: 'A', ...PLAN_A }, { id: 'B', a: planB.a, b: nb }], SEUIL);
                  if (next.length === 1 && next[0] === 'B') kit.react(true);
                }}
                aRange={{ min: 0, max: 0.5, step: 0.05 }}
                bRange={{ min: 0, max: 14, step: 1 }}
                range={RANGE}
                compareWith={{ a: PLAN_A.a, b: PLAN_A.b, label: 'A', tone: 'rose' }}
                showIntercept
                unit=" €"
                name="B"
              />
              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <div className="rounded-lg bg-rose-100 p-2">
                  <p className="text-xs font-semibold text-rose-700">A à {SEUIL} min</p>
                  <p className="font-mono font-bold text-rose-900">{formatDec(image(PLAN_A.a, PLAN_A.b, SEUIL))} €</p>
                </div>
                <div className="rounded-lg bg-indigo-100 p-2">
                  <p className="text-xs font-semibold text-indigo-700">B à {SEUIL} min</p>
                  <p className="font-mono font-bold text-indigo-900">{formatDec(image(planB.a, bValue, SEUIL))} €</p>
                </div>
              </div>
              <Feedback tone={goalReached ? 'ok' : 'info'}>
                {goalReached ? (
                  <>
                    Avec un abonnement de <strong>{formatDec(bValue)} €</strong>, B passe devant
                    dès 40 minutes. Baisser l’abonnement, c’est faire glisser la droite vers le
                    bas — l’inclinaison, elle, n’a pas bougé.
                  </>
                ) : cheapAt40.length === 2 ? (
                  <>Égalité parfaite à 40 min : les deux coûtent {formatDec(image(planB.a, bValue, SEUIL))} €. Descends encore d’un cran.</>
                ) : (
                  <>À 40 min, B coûte {formatDec(image(planB.a, bValue, SEUIL) - image(PLAN_A.a, PLAN_A.b, SEUIL))} € de trop. Baisse l’abonnement.</>
                )}
              </Feedback>
            </div>
          ),
        },
        {
          num: 4,
          title: 'Que change l’abonnement ?',
          done: interpDone,
          content: (
            <TapQuestion
              prompt="En baissant l’abonnement de B (sans toucher au prix à la minute), qu’a-t-on changé ?"
              options={[
                'Le moment où B devient plus intéressant que A',
                'La vitesse à laquelle la facture de B augmente',
                'Le prix de B pour un très gros consommateur uniquement',
                'Rien : les deux droites restent parallèles',
              ]}
              correct={0}
              cols={1}
              explain="Baisser b translate la droite de B vers le bas : elle croise celle de A plus tôt. Le prix à la minute (a) est inchangé, donc la pente aussi. Aucun tarif n’est meilleur partout — c’est l’usage qui décide."
              explainWrong="a n’a pas changé, donc la pente non plus. Ce qui bouge, c’est la hauteur de départ, et donc le point de croisement."
              solved={interpDone}
              onAnswered={() => setInterpDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Deux factures suffisent à retrouver un tarif : <MathText>{'$a$'}</MathText> par le
          rapport des écarts, <MathText>{'$b$'}</MathText> en remontant depuis un point. Et
          <MathText>{'$b$'}</MathText> est le levier : il décide de <em>quand</em> un tarif
          devient le bon.
        </Feedback>
      }
    />
  );
}
