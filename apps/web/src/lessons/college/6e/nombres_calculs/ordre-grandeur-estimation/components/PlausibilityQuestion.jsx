import React from 'react';
import { Search, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { TapQuestion } from '../../../../../common/kit';
import { formatFr, classifyPlausibility } from './estimationUtils';

/**
 * PlausibilityQuestion — le jugement central de la leçon : un calcul, une
 * réponse proposée, une estimation de référence → « plausible », « suspect »
 * ou « impossible » ?
 *
 * La bonne catégorie vient du validateur pur `classifyPlausibility`
 * (estimationUtils.js) — jamais recopiée à la main dans les données.
 * Construit sur TapQuestion (lesson kit) : un tap = la réponse, correction
 * toujours montrée. À utiliser sous <ContentModule>.
 */
export const CATS = [
  { key: 'plausible', label: 'Plausible', Icon: CheckCircle2 },
  { key: 'suspect', label: 'Suspect', Icon: AlertTriangle },
  { key: 'impossible', label: 'Impossible', Icon: XCircle },
];

export default function PlausibilityQuestion({ calc, proposed, estimate, solved, onAnswered }) {
  const correctKey = classifyPlausibility(estimate, proposed);
  const correct = CATS.findIndex((c) => c.key === correctKey);

  const EXPLAIN = {
    plausible: `Le résultat est proche de l'estimation (≈ ${formatFr(estimate)}) : c'est plausible.`,
    suspect: `Le résultat s'écarte assez nettement de l'estimation (≈ ${formatFr(estimate)}) : à vérifier.`,
    impossible: `Le résultat est bien trop loin de l'estimation (≈ ${formatFr(estimate)}) : c'est impossible, il y a une erreur.`,
  };

  return (
    <TapQuestion
      above={
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            <span className="font-mono font-bold text-lg text-slate-800">
              {calc} = {formatFr(proposed)}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400">Ton estimation : ≈ {formatFr(estimate)}</p>
        </div>
      }
      options={CATS.map((c) => c.label)}
      correct={correct}
      cols={3}
      renderOption={(label) => {
        const cat = CATS.find((c) => c.label === label);
        const Icon = cat.Icon;
        return (
          <span className="inline-flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {label}
          </span>
        );
      }}
      explain={EXPLAIN[correctKey]}
      solved={solved}
      onAnswered={onAnswered}
    />
  );
}
