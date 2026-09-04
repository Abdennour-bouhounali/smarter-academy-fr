import React from 'react';

/**
 * ProofStrip — assembler un raisonnement, carte par carte.
 *
 * ACTION            l'élève tape les étapes dans l'ordre où il les invoque.
 * CHANGEMENT        la rédaction se construit sous ses yeux, ligne par ligne.
 * OBSERVATION       une démonstration a une STRUCTURE : ce qu'on sait, la
 *                   propriété qu'on invoque, ce qu'on en conclut.
 * SENS MATHÉMATIQUE justifier, ce n'est pas donner le résultat : c'est relier
 *                   une donnée à une conclusion par une propriété nommée.
 *
 * Tap-first, aucune manipulation au pointeur : les cartes sont des boutons.
 * Le rôle de chaque étape (donnée / propriété / conclusion) est affiché — la
 * structure du raisonnement est visible, pas seulement son contenu.
 */
const ROLE_STYLE = {
  donnee: { chip: 'bg-sky-100 text-sky-800', label: 'Donnée' },
  propriete: { chip: 'bg-violet-100 text-violet-800', label: 'Propriété' },
  conclusion: { chip: 'bg-emerald-100 text-emerald-800', label: 'Conclusion' },
  piege: { chip: 'bg-slate-100 text-slate-700', label: '' },
};

export default function ProofStrip({
  steps,
  chosen,
  onPick,
  onUndo,
  firstWrong = -1,
  locked = false,
  revealed = false,
}) {
  const available = steps.filter((s) => !chosen.includes(s.id));

  return (
    <div className="space-y-3">
      {/* La rédaction en cours */}
      <div className="rounded-xl border-2 border-slate-200 bg-white p-3 min-h-[110px]">
        <p className="text-xs font-semibold text-slate-500 mb-2">Ta rédaction</p>
        {chosen.length === 0 ? (
          <p className="text-sm text-slate-400 italic">
            Commence par ce que l’énoncé te donne.
          </p>
        ) : (
          <ol className="space-y-1.5">
            {chosen.map((id, i) => {
              const step = steps.find((s) => s.id === id);
              const wrong = firstWrong >= 0 && i >= firstWrong;
              const style = ROLE_STYLE[step.role] ?? ROLE_STYLE.piege;
              return (
                <li key={id} className={`flex gap-2 items-start text-sm rounded-lg p-2 ${
                  wrong ? 'bg-rose-50 border border-rose-200' : 'bg-slate-50'
                }`}>
                  <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-semibold ${style.chip}`}>
                    {style.label || 'À vérifier'}
                  </span>
                  <span className="text-slate-800">{step.text}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Les cartes disponibles */}
      {!locked && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500">
            Étapes disponibles — tape celle qui vient ensuite
          </p>
          <div className="grid gap-2">
            {available.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onPick(s.id)}
                className="text-left text-sm rounded-lg border-2 border-slate-200 bg-white
                           hover:border-indigo-300 hover:bg-indigo-50 p-3 min-h-[44px]
                           transition-colors text-slate-800"
              >
                {s.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {chosen.length > 0 && !locked && (
        <button
          type="button"
          onClick={onUndo}
          className="text-sm text-slate-600 hover:text-slate-900 underline min-h-[44px] px-2"
        >
          Retirer la dernière étape
        </button>
      )}

      {revealed && (
        <p className="text-xs text-slate-500">
          Une démonstration suit toujours la même charpente : ce qu’on sait, la propriété du cours
          qui s’applique, puis la conclusion qui en découle.
        </p>
      )}
    </div>
  );
}
