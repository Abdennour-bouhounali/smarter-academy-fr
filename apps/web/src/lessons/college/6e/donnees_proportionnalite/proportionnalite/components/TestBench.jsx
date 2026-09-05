import React, { useState } from 'react';
import { Feedback, NumberField, ValidateButton } from '../../../../../common/components/LessonUI';
import {
  applyRule, ratioAt, doublingHolds, isProportional, formatDec, parseDec,
} from './proportionUtils';

/**
 * TestBench — LA manipulation signature de la leçon.
 *
 * L'élève ne CLASSE pas une situation (« proportionnelle : oui / non ») : il
 * la MET À L'ÉPREUVE. Le protocole, identique pour toutes les situations :
 *
 *   1. on lui donne un point de départ (1 → …) ;
 *   2. il PRÉDIT ce que donnera le double ;
 *   3. la machine calcule la vraie valeur avec `applyRule` ;
 *   4. il voit si sa prédiction tient — et surtout OÙ la règle casse.
 *
 * C'est le renversement demandé par le playbook §3 : la découverte vient du
 * fait que l'écran change et contredit (ou confirme) une prédiction que
 * l'élève a formulée lui-même. Une situation affine ne « rate » pas au
 * hasard : elle rate d'un montant égal à la part fixe, ce que le feedback
 * nomme explicitement.
 *
 * FORMATIF (playbook §8) : la prédiction est révélée quelle que soit sa
 * justesse, `onTested` est appelé inconditionnellement, aucune boucle de
 * réessai. Une prédiction fausse est même la plus instructive — elle est
 * accueillie comme telle.
 */
/**
 * Accord en nombre de l'étiquette de grandeur : les situations la donnent au
 * pluriel (« personnes », « crêpes »), mais « 1 personnes » est fautif. Les
 * pluriels irréguliers de la leçon sont explicités ; sinon on retire le « s ».
 */
const SINGULARS = { ans: 'an', 'crêpes': 'crêpe', personnes: 'personne', litres: 'litre', heures: 'heure' };
function agree(n, label) {
  if (Math.abs(n) >= 2) return label;
  return SINGULARS[label] ?? (label.endsWith('s') ? label.slice(0, -1) : label);
}

export default function TestBench({
  situation,          // { id, title, context, rule, unit, xLabel, yLabel, base }
  react,
  solved = false,
  onTested,           // (verdictCorrect: boolean) => void — inconditionnel
}) {
  const { rule, base = 1, unit = '', xLabel = 'quantité', yLabel = 'prix', context, title } = situation;

  const [prediction, setPrediction] = useState('');
  const [tested, setTested] = useState(false);
  const [verdict, setVerdict] = useState(null); // réponse de l'élève à « est-ce proportionnel ? »

  const yBase = applyRule(rule, base);
  const xDouble = base * 2;
  const yDouble = applyRule(rule, xDouble);
  const predictedIfProportional = yBase * 2;
  const holds = doublingHolds(rule, base);
  const prop = isProportional(rule);

  const runTest = () => {
    if (prediction === '' || tested) return;
    setTested(true);
    react?.(parseDec(prediction) === yDouble);
  };

  const answerVerdict = (saysProportional) => {
    if (verdict !== null || solved) return;
    setVerdict(saysProportional);
    const ok = saysProportional === prop;
    react?.(ok);
    onTested?.(ok);
  };

  const predictedValue = prediction === '' ? null : parseDec(prediction);
  const predictedDoubling = predictedValue === predictedIfProportional;

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-2xl px-4 py-3">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-slate-300 mt-1">{context}</p>
      </div>

      {/* Le point de départ, donné. */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-wide font-mono">Ce qu'on sait</p>
        <p className="font-mono text-lg font-bold text-slate-800 mt-1">
          {formatDec(base)} {agree(base, xLabel)} → {formatDec(yBase)} {unit}
        </p>
      </div>

      {/* Étape 1 : prédire. */}
      {!tested ? (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 space-y-3">
          <p className="text-sm text-slate-700">
            Si on prend <strong>{formatDec(xDouble)} {agree(xDouble, xLabel)}</strong> (le double), combien penses-tu obtenir ?
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <NumberField
              value={prediction}
              onChange={setPrediction}
              onEnter={runTest}
              ariaLabel={`Ta prédiction pour ${formatDec(xDouble)} ${agree(xDouble, xLabel)}`}
              width="w-28"
            />
            <span className="font-mono text-sm text-slate-500">{unit}</span>
            <ValidateButton onClick={runTest} disabled={prediction === ''}>
              Tester
            </ValidateButton>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Il n'y a pas de piège : réponds ce que tu penses, on vérifiera ensemble.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Étape 2 : la vraie valeur, comparée à la prédiction. */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-center">
              <p className="text-xs text-slate-500">Ta prédiction</p>
              <p className="font-mono text-lg font-bold text-slate-700">
                {formatDec(predictedValue)} {unit}
              </p>
            </div>
            <div
              className={`rounded-2xl border-2 p-3 text-center ${
                predictedValue === yDouble ? 'border-emerald-300 bg-emerald-50' : 'border-sky-300 bg-sky-50'
              }`}
            >
              <p className="text-xs text-slate-500">La réalité</p>
              <p className="font-mono text-lg font-bold text-slate-900">
                {formatDec(yDouble)} {unit}
              </p>
            </div>
          </div>

          <Feedback tone={predictedValue === yDouble ? 'ok' : 'info'}>
            {holds ? (
              <>
                En doublant {xLabel}, on double aussi {yLabel} : {formatDec(yBase)} × 2 ={' '}
                <strong>{formatDec(yDouble)}</strong>.{' '}
                {predictedDoubling
                  ? 'C’est exactement ce que tu avais prédit.'
                  : `Le double de ${formatDec(yBase)} vaut ${formatDec(predictedIfProportional)}.`}
              </>
            ) : (
              <>
                Attention : le double de {formatDec(yBase)} serait{' '}
                <strong>{formatDec(predictedIfProportional)}</strong>, mais la réalité donne{' '}
                <strong>{formatDec(yDouble)}</strong>. Doubler {xLabel} ne double PAS {yLabel} —
                il y a un écart de {formatDec(Math.abs(predictedIfProportional - yDouble))} {unit}.
              </>
            )}
          </Feedback>

          {/* Étape 3 : le verdict, formulé par l'élève. */}
          {verdict === null && !solved ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700 text-center">
                Alors, cette situation est-elle proportionnelle ?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => answerVerdict(true)}
                  className="min-h-[44px] px-3 py-2.5 rounded-xl border-2 border-slate-300 bg-white font-semibold text-sm text-slate-700 hover:border-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  Oui, proportionnelle
                </button>
                <button
                  type="button"
                  onClick={() => answerVerdict(false)}
                  className="min-h-[44px] px-3 py-2.5 rounded-xl border-2 border-slate-300 bg-white font-semibold text-sm text-slate-700 hover:border-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  Non, pas proportionnelle
                </button>
              </div>
            </div>
          ) : (
            <Feedback tone={verdict === prop || solved ? 'ok' : 'ko'}>
              {prop ? (
                <>
                  <strong>Proportionnelle.</strong> Quelle que soit la quantité, on multiplie toujours par le
                  même nombre : {formatDec(ratioAt(rule, base))}. C'est ce qui fait que doubler d'un côté
                  double de l'autre.
                </>
              ) : (
                <>
                  <strong>Pas proportionnelle.</strong>{' '}
                  {rule.kind === 'affine'
                    ? `Il y a une part fixe de ${formatDec(rule.b)} ${unit} qui ne dépend pas de ${xLabel} : elle est payée une seule fois, donc elle ne double jamais.`
                    : `Le nombre par lequel on multiplie change d'une valeur à l'autre : ${formatDec(
                        ratioAt(rule, base),
                      )} puis ${formatDec(ratioAt(rule, xDouble))}.`}
                </>
              )}
            </Feedback>
          )}
        </div>
      )}
    </div>
  );
}
