import React, { useState } from 'react';
import { EXPERIENCES, issuesElementaires } from './probabilites';

/**
 * ExperienceLab — un seul lancer, à la main.
 *
 * C'est la manipulation d'ouverture (§6bis) : l'élève lance RÉELLEMENT, une
 * fois, et voit un résultat qu'il ne pouvait pas prévoir. Aucun nombre, aucune
 * fraction — seulement le geste et son résultat, plus l'historique des tirages
 * déjà faits, qui suffit à faire naître la question « est-ce que ça se
 * répète ? » que le module 5 ira trancher.
 *
 * Le tirage est un vrai tirage : `Math.random` ici, et non la graine
 * reproductible du noyau, parce qu'un élève qui relance doit obtenir une
 * SURPRISE — la reproductibilité sert aux simulations massives (simuler /
 * cumuler), pas au lancer à la main.
 *
 * JAMAIS GELÉ : aucun `disabled` lié à la validation de l'étape.
 */
export default function ExperienceLab({
  experience,
  onLancer,
  historique,
  ariaLabel,
}) {
  const exp = EXPERIENCES[experience];
  const [anim, setAnim] = useState(false);
  const issues = issuesElementaires(exp);

  const lancer = () => {
    setAnim(true);
    const tire = issues[Math.floor(Math.random() * issues.length)];
    // Le petit délai n'est pas cosmétique : il sépare la décision du
    // résultat, pour que l'élève ne croie pas que le clic choisit.
    window.setTimeout(() => {
      setAnim(false);
      onLancer(exp.id === 'urne' ? tire.label : tire.label);
    }, 320);
  };

  const dernier = historique.length > 0 ? historique[historique.length - 1] : null;

  return (
    <div className="space-y-3" aria-label={ariaLabel ?? `Expérience : ${exp.nom}`}>
      <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4 text-center space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
          {exp.nom}
        </div>

        {/* Le résultat du dernier lancer, en grand. */}
        <div
          className={`mx-auto grid h-24 w-24 place-items-center rounded-2xl border-4 bg-white transition-transform duration-300 ${
            anim ? 'animate-pulse scale-95 border-slate-300' : 'border-indigo-300'
          }`}
          role="status"
          aria-live="polite"
        >
          {anim ? (
            <span className="text-3xl" aria-hidden>{exp.emoji}</span>
          ) : dernier ? (
            <Resultat experience={exp.id} valeur={dernier} />
          ) : (
            <span className="text-3xl opacity-40" aria-hidden>{exp.emoji}</span>
          )}
        </div>

        <div className="text-sm text-slate-600 min-h-[1.25rem]">
          {anim ? '…' : dernier ? <>Résultat : <strong>{dernier}</strong></> : 'Rien n’a encore été lancé.'}
        </div>

        <button
          type="button"
          onClick={lancer}
          className="rounded-xl border-2 border-indigo-400 bg-white px-5 py-2.5 text-base font-black text-indigo-700 shadow-sm transition hover:bg-indigo-100 active:scale-95"
        >
          {historique.length === 0 ? 'Lancer' : 'Relancer'}
        </button>
      </div>

      {/* L'historique : c'est lui qui fait apparaître l'irrégularité. */}
      {historique.length > 0 && (
        <div className="rounded-xl border-2 border-slate-200 bg-white p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
            Tes {historique.length} lancer{historique.length > 1 ? 's' : ''}
          </div>
          <div className="flex flex-wrap gap-1">
            {historique.map((h, i) => (
              <span
                key={i}
                className="grid h-7 min-w-7 place-items-center rounded-md border-2 border-slate-200 bg-slate-50 px-1.5 font-mono text-xs font-bold text-slate-700"
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Le résultat, dessiné selon le dispositif. */
function Resultat({ experience, valeur }) {
  if (experience === 'de') {
    return (
      <span className="font-mono text-4xl font-black tabular-nums text-indigo-800">{valeur}</span>
    );
  }
  if (experience === 'piece') {
    return (
      <span className="text-2xl font-black text-indigo-800">
        {valeur === 'Pile' ? '🪙' : '👑'}
        <span className="sr-only">{valeur}</span>
      </span>
    );
  }
  return (
    <span
      className="h-12 w-12 rounded-full border-4 border-white shadow"
      style={{ background: { rouge: '#dc2626', bleu: '#2563eb', vert: '#16a34a' }[valeur] }}
      role="img"
      aria-label={`bille ${valeur}`}
    />
  );
}
