import React from 'react';
import { premieresValeurs, ecartConstant } from './litteral';

/**
 * PatternLab — la manipulation SIGNATURE de la leçon (§6bis).
 *
 * L'élève construit un motif étape par étape. La figure grandit, le compte
 * s'affiche, et un tableau étape → nombre se remplit tout seul à mesure qu'il
 * avance. Puis on lui demande l'étape 20 : le bouton ne va pas si loin, et
 * dessiner serait absurde. C'est ce refus de compter qui fait naître la
 * formule — le besoin précède la lettre, jamais l'inverse.
 *
 * Expected observation : « d'une étape à l'autre, j'ajoute toujours le même
 * nombre » — puis « donc je peux prévoir n'importe quelle étape sans dessiner ».
 * Misconception targeted : croire qu'une lettre est une étiquette arbitraire,
 * ou l'initiale d'un mot. Ici la lettre arrive à la seule place où elle a un
 * sens : celle du numéro d'étape qu'on ne veut pas fixer.
 *
 * Cause → effet immédiat : un tap sur « étape suivante » redessine la figure,
 * réécrit le compte et ajoute une ligne au tableau, depuis le même état. Aucun
 * bouton « Valider » entre le geste et sa conséquence. On peut reculer à tout
 * moment : la manipulation ne se fige jamais.
 *
 * Sécurité visuelle (§17bis) : la figure est une grille CSS dont la taille de
 * carreau est BORNÉE, dans un conteneur qui défile lui-même ; le tableau est
 * un vrai <table> en flux. Aucun texte n'est posé sur le dessin — donc aucun
 * chevauchement n'est possible, quelle que soit l'étape atteinte.
 */
const CASE = 20;

/** Le dessin d'un motif à une étape donnée : une rangée de carreaux par « bras ». */
function Figure({ motif, etape }) {
  const total = motif.compte(etape);
  // La disposition dépend du motif, mais reste toujours une grille : on ne
  // calcule jamais de coordonnées, donc rien ne peut se superposer.
  const parLigne = motif.id === 'escalier' ? etape + 1 : Math.min(total, 12);
  const lignes = Math.ceil(total / parLigne);

  return (
    <div className="overflow-x-auto">
      <div
        className="grid gap-[3px] w-max mx-auto"
        style={{ gridTemplateColumns: `repeat(${parLigne}, ${CASE}px)` }}
        role="img"
        aria-label={`Étape ${etape} : ${total} carreaux`}
      >
        {Array.from({ length: lignes * parLigne }, (_, i) => (
          <div
            key={i}
            style={{ width: CASE, height: CASE }}
            className={i < total ? 'rounded-[3px] bg-violet-500' : 'opacity-0'}
          />
        ))}
      </div>
    </div>
  );
}

export default function PatternLab({
  motif,
  etape,
  onEtape,
  maxEtape = 6,
  montrerTableau = true,
  montrerEcart = false,   // révéler la colonne « ce qu'on ajoute » (étape 2)
  ariaLabel,
}) {
  const total = motif.compte(etape);
  const lignes = premieresValeurs(motif, etape);
  const ecart = ecartConstant(motif);

  const aller = (k) => {
    const next = Math.max(1, Math.min(maxEtape, k));
    if (next !== etape) onEtape?.(next);
  };

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3">
      <div className="text-xs uppercase tracking-wide text-slate-500 text-center">
        {motif.titre} — étape {etape}
      </div>

      <Figure motif={motif} etape={etape} />

      {/* Le compte — en flux, sous le dessin. */}
      <div className="flex items-center justify-center gap-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 flex-wrap">
        <span className="text-xs uppercase tracking-wide text-slate-500">Carreaux</span>
        <output
          className="font-mono text-2xl sm:text-3xl font-black text-violet-700 tabular-nums"
          aria-live="polite"
          data-total={String(total)}
        >
          {total}
        </output>
      </div>

      {/* Le tableau étape → nombre, qui se remplit à mesure qu'on avance.
          C'est lui qui rend la régularité visible avant qu'on la nomme. */}
      {montrerTableau && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[260px]">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="py-1.5 px-2 text-left font-semibold">Étape</th>
                <th className="py-1.5 px-2 text-right font-semibold">Carreaux</th>
                {montrerEcart && <th className="py-1.5 px-2 text-right font-semibold text-violet-700">On ajoute</th>}
              </tr>
            </thead>
            <tbody>
              {lignes.map((l, i) => (
                <tr key={l.etape} className="border-t border-slate-200">
                  <td className="py-1.5 px-2 font-mono tabular-nums text-slate-700">{l.etape}</td>
                  <td className="py-1.5 px-2 text-right font-mono tabular-nums font-bold text-slate-900">{l.nombre}</td>
                  {montrerEcart && (
                    <td className="py-1.5 px-2 text-right font-mono tabular-nums text-violet-700">
                      {i === 0 ? '—' : `+ ${ecart}`}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Les commandes — hors du dessin, taille tactile. */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => aller(etape - 1)}
          disabled={etape <= 1}
          className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white font-semibold text-sm text-slate-700 disabled:opacity-40 hover:border-violet-400"
        >
          ← Étape précédente
        </button>
        <button
          type="button"
          onClick={() => aller(etape + 1)}
          disabled={etape >= maxEtape}
          data-role="etape-suivante"
          className="min-h-[44px] px-4 rounded-xl border-2 border-violet-400 bg-violet-600 font-bold text-sm text-white disabled:opacity-40 hover:bg-violet-700"
        >
          Étape suivante →
        </button>
      </div>
      {etape >= maxEtape && (
        <p className="text-xs text-center text-orange-600 font-semibold">
          Le laboratoire s’arrête à l’étape {maxEtape}. Pour aller plus loin, il faudra autre chose
          qu’un dessin.
        </p>
      )}
    </div>
  );
}
