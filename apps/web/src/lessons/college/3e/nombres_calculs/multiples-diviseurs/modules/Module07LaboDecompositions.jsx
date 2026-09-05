import React, { useState } from 'react';
import { parseDec, formatDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PrimeVenn from '../components/PrimeVenn';
import {
  factorization, mergeMin, gcd, lcm, simplifyFraction, formatFactors, formatClock,
} from '../components/divisibilityUtils';

/**
 * Module 7 — LABO : « Le labo des décompositions ».
 *
 * Activity: trois problèmes authentiques de la fête, tous résolus avec le
 *   MÊME outil — deux décompositions posées côte à côte.
 * Mathematical objective: les facteurs COMMUNS aux deux décompositions
 *   donnent la simplification maximale d'une fraction et le plus grand
 *   carreau qui pave un rectangle ; les facteurs RÉUNIS donnent le premier
 *   instant où deux rythmes coïncident.
 * Student action: taper les facteurs communs, puis répondre en chiffres.
 * Controlled variable: l'ensemble des facteurs mis en commun.
 * Mathematical state: factorization(84), factorization(126) ; la fraction
 *   affichée est DÉRIVÉE (a / produit choisi), jamais écrite en dur ; les
 *   horaires viennent de formatClock, jamais d'une chaîne littérale.
 * Visual consequence: à chaque puce tapée, la fraction rétrécit sous les
 *   yeux : 84/126 → 42/63 → 14/21 → 2/3.
 * Expected observation: tant qu'il reste un facteur commun, la fraction
 *   n'est pas au bout ; 42/63 est une simplification, pas LA simplification.
 * Misconception targeted: #5 (« 12 + 18 = 30 » ou « 12 × 18 = 216 » comme
 *   prochain rendez-vous) et la simplification partielle.
 * Feedback: explainFor sur les valeurs pièges (6 pour le carreau, 30 et 216
 *   pour les bus).
 * Formalization: « facteurs communs → le plus grand qui divise les deux ;
 *   facteurs réunis → le plus petit que les deux atteignent ».
 * Scaffolding: étape 1 guidée sur la fraction, étapes 2–4 en autonomie.
 * Transfer: le boss reprend 84/126 et les bus 12 / 18.
 */

const FRAC_NUM = 84;
const FRAC_DEN = 126;
const SOL_A = 84;
const SOL_B = 126;
const BUS_A = 12;
const BUS_B = 18;
const DEPART = 7 * 60;

const COMMON_84_126 = mergeMin(factorization(FRAC_NUM), factorization(FRAC_DEN));
const N_COMMON = COMMON_84_126.reduce((s, f) => s + f.e, 0); // 3 jetons : 2, 3, 7
const SIMPLIFIED = simplifyFraction(FRAC_NUM, FRAC_DEN);
const TILE = gcd(SOL_A, SOL_B); // 42
const MEET = lcm(BUS_A, BUS_B); // 36

export default function Module07LaboDecompositions() {
  const [common, setCommon] = useState(() => new Set());
  const [revealed1, setRevealed1] = useState(false);
  const [tileDone, setTileDone] = useState(false);
  const [busDone, setBusDone] = useState(false);
  const [clockDone, setClockDone] = useState(false);

  const done1 = common.size === N_COMMON || revealed1;

  const toggle = (set, setter, key, react) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setter(next);
    react?.(next.size === N_COMMON);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Le labo des décompositions"
      moduleSubtitle="Simplifier, carreler, attraper deux bus : les facteurs au travail."
      estimatedTime="10 min"
      brief={{
        tag: '🔧 Mission 07',
        title: 'Trois problèmes de la fête, un seul outil.',
        body: (
          <p>
            Une fraction à réduire, un sol à carreler, deux bus à attraper. À chaque fois : pose les
            deux décompositions côte à côte, et regarde ce qu’elles ont — ou n’ont pas — en commun.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Réduire la fraction des tickets',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Sur {FRAC_DEN} tickets vendus, {FRAC_NUM} sont gagnants. Touche{' '}
                <strong>tous</strong> les facteurs communs pour réduire la fraction au maximum.
              </p>
              <PrimeVenn
                a={FRAC_NUM}
                b={FRAC_DEN}
                selected={revealed1 ? new Set(['2-0', '3-0', '7-0']) : common}
                onToggle={(k) => !revealed1 && toggle(common, setCommon, k, kit.react)}
                mode="common"
                readout="fraction"
                disabled={done1}
                labelA="Gagnants"
                labelB="Vendus"
              />
              {!done1 && (
                <Feedback tone="info">
                  <strong>{common.size}</strong> / {N_COMMON} facteurs communs mis en commun. Tant
                  qu’il en reste un, la fraction peut encore rétrécir.
                </Feedback>
              )}
              {!done1 && common.size >= 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setRevealed1(true);
                    kit.react(false);
                  }}
                  className="w-full min-h-[48px] rounded-xl border-2 border-sky-300 bg-sky-50 text-sky-800 font-bold hover:border-sky-500"
                >
                  Je ne trouve pas — montre-moi les facteurs communs
                </button>
              )}
              {done1 && (
                <Feedback tone={revealed1 ? 'info' : 'ok'}>
                  {FRAC_NUM} / {FRAC_DEN} = <strong className="font-mono">{SIMPLIFIED.num} / {SIMPLIFIED.den}</strong>,
                  en divisant par{' '}
                  <strong className="font-mono">{SIMPLIFIED.dividedBy.join(' × ')} = {gcd(FRAC_NUM, FRAC_DEN)}</strong>.
                  S’arrêter à 42 / 63 ou à 14 / 21, c’est n’avoir sorti qu’une partie des facteurs
                  communs : la fraction n’est irréductible que lorsqu’il n’en reste plus aucun.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le plus grand carreau du hall',
          done: tileDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Le hall mesure <strong>{SOL_A} cm sur {SOL_B} cm</strong>. On veut le paver avec des
                carreaux carrés <strong>tous identiques</strong>, sans en couper aucun. Quel est le
                plus grand côté possible ?
              </p>
              <PrimeVenn
                a={SOL_A}
                b={SOL_B}
                selected={new Set(['2-0', '3-0', '7-0'])}
                mode="union"
                readout="square"
                disabled
                labelA="Longueur"
                labelB="Largeur"
              />
              <NumericQuestion
                prompt="Côté du plus grand carreau, en centimètres :"
                suffix="cm"
                expected={TILE}
                parse={parseDec}
                display={formatDec(TILE)}
                solved={tileDone}
                onAnswered={() => setTileDone(true)}
                explain={
                  <>
                    Le côté doit diviser {SOL_A} <em>et</em> {SOL_B} : c’est un diviseur commun. Le
                    plus grand est le produit de <strong>tous</strong> les facteurs communs,{' '}
                    <strong className="font-mono">{formatFactors(COMMON_84_126)} = {TILE}</strong> —
                    soit {SOL_A / TILE} carreaux sur {SOL_B / TILE}.
                  </>
                }
                explainFor={(n) => {
                  if (n === 6) {
                    return (
                      <>
                        6 divise bien les deux, mais ce n’est pas le plus grand : il reste le facteur
                        7 en commun. 6 × 7 = {TILE} marche aussi.
                      </>
                    );
                  }
                  if (n === 2 || n === 3 || n === 7 || n === 14 || n === 21) {
                    return (
                      <>
                        {n} divise les deux, mais on peut faire plus grand : il faut prendre{' '}
                        <strong>tous</strong> les facteurs communs à la fois,{' '}
                        {formatFactors(COMMON_84_126)} = {TILE}.
                      </>
                    );
                  }
                  if (n === SOL_A * SOL_B || n === SOL_A + SOL_B) {
                    return (
                      <>
                        Ni la somme ni le produit des deux côtés : le carreau doit{' '}
                        <strong>entrer</strong> dans les deux dimensions, donc les diviser. C’est{' '}
                        {formatFactors(COMMON_84_126)} = {TILE}.
                      </>
                    );
                  }
                  return (
                    <>
                      {SOL_A} ÷ {n} ou {SOL_B} ÷ {n} ne tombe pas juste. Le côté doit diviser les
                      deux : {formatFactors(COMMON_84_126)} = {TILE}.
                    </>
                  );
                }}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Les deux bus de la sortie',
          done: busDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Devant le collège, un bus part toutes les <strong>{BUS_A} min</strong>, l’autre
                toutes les <strong>{BUS_B} min</strong>. Ils partent ensemble à{' '}
                <strong>{formatClock(DEPART)}</strong>. Dans combien de minutes repartiront-ils
                ensemble ?
              </p>
              <PrimeVenn
                a={BUS_A}
                b={BUS_B}
                selected={new Set(['2-0', '3-0'])}
                mode="union"
                readout="minutes"
                disabled
                labelA="Bus 1"
                labelB="Bus 2"
              />
              <NumericQuestion
                prompt="Prochain départ commun, dans combien de minutes ?"
                suffix="min"
                expected={MEET}
                parse={parseDec}
                display={formatDec(MEET)}
                solved={busDone}
                onAnswered={() => setBusDone(true)}
                explain={
                  <>
                    Il faut un nombre de minutes qui soit à la fois multiple de {BUS_A} et de{' '}
                    {BUS_B} : le plus petit est obtenu en réunissant tous les facteurs,{' '}
                    <strong className="font-mono">
                      {formatFactors(factorization(MEET))} = {MEET}
                    </strong>{' '}
                    ({MEET} = {BUS_A} × {MEET / BUS_A} = {BUS_B} × {MEET / BUS_B}).
                  </>
                }
                explainFor={(n) => {
                  if (n === BUS_A + BUS_B) {
                    return (
                      <>
                        {BUS_A} + {BUS_B} = {BUS_A + BUS_B} : mais {BUS_A + BUS_B} n’est pas un
                        multiple de {BUS_B} ({BUS_A + BUS_B} ÷ {BUS_B} ne tombe pas juste). On
                        n’additionne pas deux rythmes — on cherche leur premier point commun,{' '}
                        {MEET}.
                      </>
                    );
                  }
                  if (n === BUS_A * BUS_B) {
                    return (
                      <>
                        {BUS_A} × {BUS_B} = {BUS_A * BUS_B} est bien un moment où les deux repartent
                        ensemble — mais pas le <strong>premier</strong>. En réunissant les facteurs
                        sans compter deux fois ceux qui sont communs, on trouve {MEET}.
                      </>
                    );
                  }
                  if (n === gcd(BUS_A, BUS_B)) {
                    return (
                      <>
                        {gcd(BUS_A, BUS_B)}, ce sont les facteurs <em>communs</em> — utiles pour
                        découper, pas pour se retrouver. Ici il faut les facteurs{' '}
                        <strong>réunis</strong> : {MEET}.
                      </>
                    );
                  }
                  return (
                    <>
                      {n} n’est pas un multiple des deux : {n} ÷ {BUS_A} ={' '}
                      {formatDec(Math.round((n / BUS_A) * 100) / 100)} et {n} ÷ {BUS_B} ={' '}
                      {formatDec(Math.round((n / BUS_B) * 100) / 100)}. Le premier moment commun est{' '}
                      {MEET}.
                    </>
                  );
                }}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'À quelle heure, alors ?',
          done: clockDone,
          content: (
            <TapQuestion
              prompt={`Les bus partent ensemble à ${formatClock(DEPART)}. À quelle heure repartent-ils ensemble ?`}
              options={[
                formatClock(DEPART + MEET),
                formatClock(DEPART + BUS_A + BUS_B),
                formatClock(DEPART + BUS_A * BUS_B),
                formatClock(DEPART + gcd(BUS_A, BUS_B)),
              ]}
              correct={0}
              cols={2}
              solved={clockDone}
              onAnswered={() => setClockDone(true)}
              explain={
                <>
                  {formatClock(DEPART)} + {MEET} min = <strong>{formatClock(DEPART + MEET)}</strong>.{' '}
                  {formatClock(DEPART + BUS_A + BUS_B)} viendrait d’une addition des deux rythmes ;{' '}
                  {formatClock(DEPART + BUS_A * BUS_B)} de leur produit — un vrai rendez-vous, mais
                  bien plus tard ; {formatClock(DEPART + gcd(BUS_A, BUS_B))} des facteurs communs,
                  qui servent à découper, pas à se retrouver.
                </>
              }
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Un seul outil, trois usages : <strong>facteurs communs</strong> pour découper au plus grand
          (fraction irréductible, plus grand carreau), <strong>facteurs réunis</strong> pour se
          retrouver au plus tôt (les bus). Direction la fête.
        </Feedback>
      }
    />
  );
}
