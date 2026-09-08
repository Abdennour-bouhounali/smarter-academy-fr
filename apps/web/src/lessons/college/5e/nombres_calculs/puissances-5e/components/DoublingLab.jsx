import React from 'react';
import { grainsCase, produitEcrit, ecrirePuissance, CASES_MAX } from './puissances';

/**
 * DoublingLab — la manipulation SIGNATURE de la leçon (§6bis).
 *
 * L'élève avance case après case sur l'échiquier de la légende : un grain sur
 * la première, deux sur la deuxième, quatre sur la troisième… À chaque pas, le
 * produit s'écrit EN TOUTES LETTRES, et la ligne s'allonge sous ses yeux
 * jusqu'à devenir illisible. C'est cet encombrement qui crée le besoin d'une
 * écriture courte — le besoin précède la notation, jamais l'inverse.
 *
 * Expected observation : « c'est toujours le même facteur 2 ; seul le NOMBRE
 * DE FOIS change » — puis « écrire tout ça est absurde, il faut noter combien
 * de fois ».
 * Misconception targeted : croire que 2⁵ se calcule en multipliant 2 par 5.
 * Le laboratoire montre les cinq facteurs, alignés, avant tout symbole.
 *
 * Cause → effet immédiat : un tap sur « case suivante » redessine l'échiquier,
 * réécrit le produit et met à jour le compte, depuis le même état. Aucun
 * bouton « Valider » entre le geste et sa conséquence. On peut reculer à tout
 * moment : la manipulation ne se fige jamais (frozen-manipulation bug class).
 *
 * Sécurité visuelle (§17bis) : tout est du DOM en flux — pas un seul <text>
 * SVG posé à des coordonnées calculées. Le produit écrit vit dans un conteneur
 * qui défile HORIZONTALEMENT DE LUI-MÊME (`overflow-x-auto`), ce qui est ici
 * l'information pédagogique et non un défaut : la ligne déborde, et c'est le
 * propos. Le reste de la page, lui, ne défile jamais.
 */
export default function DoublingLab({
  cases,                    // numéro de la case courante (1 … CASES_MAX)
  onCases,
  max = CASES_MAX,
  montrerNotation = false,  // révéler l'écriture puissance (après l'étape 3)
  ariaLabel,
}) {
  const grains = grainsCase(cases);
  const exposant = cases - 1;
  const aller = (k) => {
    const next = Math.max(1, Math.min(max, k));
    if (next !== cases) onCases?.(next);
  };

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3">
      {/* L'échiquier — une grille CSS, jamais des coordonnées calculées. */}
      <div className="flex justify-center">
        <div
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: 'repeat(8, minmax(0, 26px))' }}
          role="img"
          aria-label={`Échiquier : la case ${cases} porte ${grains} grain${grains > 1 ? 's' : ''}`}
        >
          {Array.from({ length: max }, (_, i) => i + 1).map((k) => (
            <div
              key={k}
              style={{ width: 26, height: 26 }}
              className={[
                'rounded-[3px] flex items-center justify-center text-[10px] font-bold',
                k < cases ? 'bg-amber-200 text-amber-800'
                  : k === cases ? 'bg-amber-500 text-white ring-2 ring-amber-700'
                  : 'bg-slate-100 text-slate-300',
              ].join(' ')}
            >
              {k}
            </div>
          ))}
        </div>
      </div>

      {/* Le compte de grains — en flux, sous le dessin. */}
      <div className="flex items-center justify-center gap-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 flex-wrap">
        <span className="text-xs uppercase tracking-wide text-slate-500">
          Sur la case {cases}
        </span>
        <output
          className="font-mono text-2xl sm:text-3xl font-black text-amber-700 tabular-nums"
          aria-live="polite"
          data-grains={String(grains)}
        >
          {grains.toLocaleString('fr-FR')}
        </output>
        <span className="text-xs text-slate-500">grain{grains > 1 ? 's' : ''}</span>
      </div>

      {/* Le produit écrit en toutes lettres. C'est LUI qui doit déborder :
          son propre conteneur défile, jamais la page. */}
      <div className="space-y-1">
        <div className="text-[11px] uppercase tracking-wide text-slate-400 text-center">
          Le calcul, écrit en entier
        </div>
        <div className="overflow-x-auto rounded-xl bg-slate-900 px-3 py-2.5">
          <code
            className="font-mono text-sm text-amber-200 whitespace-nowrap block text-center"
            data-produit={produitEcrit(2, exposant)}
          >
            {exposant === 0 ? '1 (le grain de départ)' : produitEcrit(2, exposant)}
          </code>
        </div>
        {exposant >= 8 && (
          <p className="text-xs text-center text-orange-600 font-semibold">
            La ligne ne tient plus dans l’écran — et il reste des cases.
          </p>
        )}
      </div>

      {/* L'écriture courte, révélée seulement quand la leçon l'a posée. */}
      {montrerNotation && exposant > 0 && (
        <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-3 py-2.5 text-center">
          <div className="text-[11px] uppercase tracking-wide text-emerald-700">La même chose, en court</div>
          <output className="font-mono text-2xl font-black text-emerald-800" data-notation={ecrirePuissance(2, exposant)}>
            {ecrirePuissance(2, exposant)}
          </output>
        </div>
      )}

      {/* Les commandes — hors du dessin, taille tactile. */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => aller(cases - 1)}
          disabled={cases <= 1}
          className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white font-semibold text-sm text-slate-700 disabled:opacity-40 hover:border-amber-400"
        >
          ← Case précédente
        </button>
        <button
          type="button"
          onClick={() => aller(cases + 1)}
          disabled={cases >= max}
          data-role="case-suivante"
          className="min-h-[44px] px-4 rounded-xl border-2 border-amber-400 bg-amber-500 font-bold text-sm text-white disabled:opacity-40 hover:bg-amber-600"
        >
          Case suivante →
        </button>
      </div>
    </div>
  );
}
