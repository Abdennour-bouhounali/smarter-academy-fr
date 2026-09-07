import React from 'react';

/**
 * FilterLab — composer un filtre logique et voir la population se réduire.
 *
 * Activité : l'élève choisit un critère de classe, un critère d'activité et
 * l'OPÉRATEUR qui les relie (ET / OU), avec une option NON sur chacun. La
 * grille des 60 élèves s'allume ou s'éteint en direct, et l'effectif retenu
 * s'affiche.
 *
 * Ce qui rend le composant nécessaire : sur un OU, l'élève VOIT que les
 * individus vérifiant les deux critères ne s'allument qu'une fois — donc que
 * l'effectif n'est pas la somme des deux. Aucun texte ne remplace cette
 * constatation.
 *
 * RÈGLE GÉNÉRALE DU PROJET : jamais figé après validation de l'étape.
 */
export default function FilterLab({
  eleves,
  classes, activites,
  critClasse, critActivite, operateur, negClasse, negActivite,
  onChange,
}) {
  const matchClasse = (e) => {
    if (!critClasse) return null;
    const m = e.classe === critClasse;
    return negClasse ? !m : m;
  };
  const matchActivite = (e) => {
    if (!critActivite) return null;
    const m = e.activite === critActivite;
    return negActivite ? !m : m;
  };
  const keeps = (e) => {
    const a = matchClasse(e);
    const b = matchActivite(e);
    if (a === null && b === null) return true;
    if (a === null) return b;
    if (b === null) return a;
    return operateur === 'ET' ? (a && b) : (a || b);
  };

  const kept = eleves.filter(keeps);
  const nClasse = critClasse ? eleves.filter((e) => matchClasse(e)).length : null;
  const nActivite = critActivite ? eleves.filter((e) => matchActivite(e)).length : null;
  const nBoth = critClasse && critActivite ? eleves.filter((e) => matchClasse(e) && matchActivite(e)).length : null;

  const phrase = () => {
    const c = critClasse ? `${negClasse ? 'PAS en ' : 'en '}${critClasse}` : null;
    const a = critActivite ? `${negActivite ? 'PAS au/à la ' : 'au/à la '}${critActivite}` : null;
    if (c && a) return `${c} ${operateur} ${a}`;
    return c ?? a ?? 'aucun filtre — toute la population';
  };

  const Chip = ({ on, label, onClick, tone = 'emerald' }) => (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={`min-h-[44px] px-3.5 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        on
          ? (tone === 'emerald' ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-slate-700 border-slate-800 text-white')
          : 'bg-white border-slate-300 text-slate-700 hover:border-emerald-400'
      }`}>
      {label}
    </button>
  );

  return (
    <div className="space-y-4 rounded-2xl border-2 border-slate-200 bg-white p-4">
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-700 min-w-[5.5rem]">Classe :</span>
          <Chip on={!critClasse} label="—" onClick={() => onChange({ critClasse: null })} tone="slate" />
          {classes.map((c) => <Chip key={c} on={critClasse === c} label={c} onClick={() => onChange({ critClasse: c })} />)}
          <Chip on={negClasse} label="NON" onClick={() => onChange({ negClasse: !negClasse })} tone="slate" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-700 min-w-[5.5rem]">Opérateur :</span>
          {['ET', 'OU'].map((op) => (
            <Chip key={op} on={operateur === op} label={op} onClick={() => onChange({ operateur: op })} tone="slate" />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-700 min-w-[5.5rem]">Activité :</span>
          <Chip on={!critActivite} label="—" onClick={() => onChange({ critActivite: null })} tone="slate" />
          {activites.map((a) => <Chip key={a} on={critActivite === a} label={a} onClick={() => onChange({ critActivite: a })} />)}
          <Chip on={negActivite} label="NON" onClick={() => onChange({ negActivite: !negActivite })} tone="slate" />
        </div>
      </div>

      {/* La population : une pastille par élève, éteinte si le filtre l'exclut. */}
      <div className="flex flex-wrap gap-1" role="img"
        aria-label={`${kept.length} élèves retenus sur ${eleves.length} par le filtre ${phrase()}`}>
        {eleves.map((e) => {
          const on = keeps(e);
          return (
            <span key={e.id}
              title={`${e.prenom} — ${e.classe}, ${e.activite}`}
              className={`inline-block w-5 h-5 rounded-md border ${
                on ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-100 border-slate-200'
              }`} />
          );
        })}
      </div>

      <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3.5 space-y-1.5">
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">Filtre : {phrase()}</p>
        <p className="font-mono text-lg font-black text-emerald-900 tabular-nums">
          {kept.length} élève{kept.length > 1 ? 's' : ''} sur {eleves.length}
        </p>
        {critClasse && critActivite && operateur === 'OU' && (
          <p className="text-xs text-emerald-700">
            {nClasse} + {nActivite} = {nClasse + nActivite}, mais {nBoth} élève{nBoth > 1 ? 's vérifient' : ' vérifie'} les
            deux critères et ne {nBoth > 1 ? 'sont' : 'est'} compté{nBoth > 1 ? 's' : ''} qu’une fois :
            {' '}{nClasse} + {nActivite} − {nBoth} = <strong>{kept.length}</strong>.
          </p>
        )}
        {critClasse && critActivite && operateur === 'ET' && (
          <p className="text-xs text-emerald-700">
            C’est exactement une case du tableau croisé : l’intersection des deux critères.
          </p>
        )}
      </div>
    </div>
  );
}
