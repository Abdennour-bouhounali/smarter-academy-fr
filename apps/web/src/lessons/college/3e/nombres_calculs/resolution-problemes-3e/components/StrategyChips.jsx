import React from 'react';

/**
 * StrategyChips — associer une STRATÉGIE à chaque situation.
 *
 * Activity: pour trois mini-situations, taper la stratégie qui convient.
 * Mathematical objective: établir qu'une équation n'est pas la réponse à
 *   tout — la proportionnalité, le calcul direct et les essais ont chacun
 *   leur domaine, et l'équation gagne quand le résultat n'est pas rond.
 * Student action: taper une puce de stratégie sur la ligne d'une situation.
 * Controlled variable: `choices` — un id de stratégie par situation.
 * Mathematical state: le module compare `choices[s.id]` à `s.correct` ;
 *   le composant ne juge rien, il montre le verdict qu'on lui passe.
 * Visual consequence: la puce choisie se colore ; à la révélation, la bonne
 *   passe en vert et la mauvaise en rose, avec la raison sous la ligne.
 * Expected observation: la même question (« combien ? ») se traite de
 *   plusieurs façons, et le choix se fait sur la FORME de la situation.
 * Misconception targeted: #4 — supposer la proportionnalité alors qu'il y a
 *   une part fixe (« 2 fois plus de séances = 2 fois plus cher »).
 * Feedback: `situation.explain`, affiché ligne par ligne à la révélation.
 * Formalization: le nom des quatre stratégies, donné après les trois choix.
 * Scaffolding: chaque ligne se répond indépendamment ; rien ne bloque.
 * Transfer: le boss e3 rejoue le choix de stratégie sur les crêpes.
 *
 * Composant CONTRÔLÉ : `choices` et `onChoose` appartiennent au module.
 * Nœuds interactifs : ≤ 3 situations × 4 stratégies = 12.
 *
 * @param {{id, text, correct, explain}[]} situations
 * @param {Record<string,string>} choices     situationId → strategyId
 * @param {(situationId, strategyId)=>void} onChoose
 * @param {{id, label, emoji}[]} [strategies]
 * @param {boolean} [revealed]  montre le verdict de chaque ligne
 * @param {boolean} [disabled]
 */
export const STRATEGIES = [
  { id: 'proportionnalite', emoji: '⚖️', label: 'Proportionnalité' },
  { id: 'calcul-direct', emoji: '🧮', label: 'Calcul direct' },
  { id: 'essais', emoji: '🎯', label: 'Essais de valeurs' },
  { id: 'equation', emoji: '🟰', label: 'Équation' },
];

export default function StrategyChips({
  situations,
  choices = {},
  onChoose,
  strategies = STRATEGIES,
  revealed = false,
  disabled = false,
}) {
  return (
    <div className="space-y-2.5" role="group" aria-label="Choisir une stratégie par situation">
      {situations.map((s) => {
        const pick = choices[s.id];
        const ok = pick === s.correct;
        const shown = revealed && pick !== undefined;
        return (
          <div
            key={s.id}
            className={`rounded-2xl border-2 p-3 space-y-2 ${
              shown
                ? ok
                  ? 'border-emerald-300 bg-emerald-50/50'
                  : 'border-rose-300 bg-rose-50/50'
                : 'border-slate-200 bg-white'
            }`}
          >
            <p className="text-sm text-slate-700 leading-snug">{s.text}</p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Stratégies pour : ${s.aria || s.id}`}>
              {strategies.map((st) => {
                const picked = pick === st.id;
                const isRight = shown && st.id === s.correct;
                const isWrongPick = shown && picked && st.id !== s.correct;
                return (
                  <button
                    key={st.id}
                    type="button"
                    disabled={disabled || revealed}
                    onClick={() => onChoose?.(s.id, st.id)}
                    aria-pressed={picked}
                    aria-label={`${st.label} pour : ${s.aria || s.id}`}
                    className={`min-h-[44px] px-3 rounded-xl border-2 text-xs font-bold transition-colors disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      isRight
                        ? 'border-emerald-700 bg-emerald-600 text-white'
                        : isWrongPick
                        ? 'border-rose-700 bg-rose-600 text-white'
                        : picked
                        ? 'border-blue-700 bg-blue-600 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-400'
                    }`}
                  >
                    <span aria-hidden="true" className="mr-1">{st.emoji}</span>
                    {st.label}
                  </button>
                );
              })}
            </div>
            {shown && <p className="text-xs text-slate-600 leading-snug">{s.explain}</p>}
          </div>
        );
      })}
    </div>
  );
}
