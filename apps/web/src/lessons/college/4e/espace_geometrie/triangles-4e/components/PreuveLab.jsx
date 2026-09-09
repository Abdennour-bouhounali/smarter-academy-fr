import React from 'react';
import { preuveEstCharpentee } from './triangles4e';

/**
 * PreuveLab — assembler une démonstration, et VOIR sa charpente.
 *
 * Activity              taper les cartes dans l'ordre où on les invoque.
 * Mathematical objective une démonstration géométrique a une STRUCTURE :
 *                       ce qu'on nous donne, la propriété du cours qu'on
 *                       invoque, ce qu'on en conclut. Justifier, ce n'est pas
 *                       annoncer le résultat.
 * Student action        choisir la carte suivante, ou retirer la dernière.
 * Controlled variable   l'ordre des étapes.
 * Mathematical state    la liste des étapes choisies. Le verdict de charpente
 *                       est CALCULÉ par `preuveEstCharpentee` — le composant
 *                       ne juge rien lui-même.
 * Visual consequence    la rédaction s'écrit, et une jauge de charpente
 *                       s'allume rôle par rôle.
 * Misconception targeted poser une conclusion sans la propriété qui l'autorise
 *                       — l'erreur la plus fréquente en 4e, et celle que
 *                       `preuveEstCharpentee` refuse explicitement.
 *
 * CE QUE CE COMPOSANT AJOUTE À `ProofStrip` DE LA 3e. La 3e montre le rôle de
 * chaque carte DÈS QU'ELLE EST POSÉE. Ici, le rôle des cartes DISPONIBLES est
 * caché : l'élève choisit sur le CONTENU, pas sur l'étiquette, sinon
 * l'exercice se résout en triant trois couleurs sans lire une ligne. Le rôle
 * apparaît une fois la carte posée — c'est là qu'il enseigne quelque chose.
 *
 * Tap-first : ce sont des boutons, jamais un glisser-déposer. Aucune cible
 * sous 44 px, et rien n'est désactivé après validation — la preuve se refait.
 */
const ROLE_STYLE = {
  donnee: { chip: 'bg-sky-100 text-sky-800', label: 'Donnée' },
  propriete: { chip: 'bg-violet-100 text-violet-800', label: 'Propriété du cours' },
  conclusion: { chip: 'bg-emerald-100 text-emerald-800', label: 'Conclusion' },
};

/** L'ordre d'affichage de la jauge de charpente. */
const JAUGE = [
  { role: 'donnee', label: 'Donnée' },
  { role: 'propriete', label: 'Propriété' },
  { role: 'conclusion', label: 'Conclusion' },
];

export default function PreuveLab({ etapes, choisies, onChoisir, onRetirer, attendu }) {
  const posees = choisies.map((id) => etapes.find((e) => e.id === id)).filter(Boolean);
  const restantes = etapes.filter((e) => !choisies.includes(e.id));
  const charpente = posees.length > 0 ? preuveEstCharpentee(posees) : null;

  /* La preuve est-elle CELLE qu'on attend ? La charpente ne suffit pas : deux
     preuves peuvent avoir la même forme et invoquer des propriétés qui n'ont
     rien à voir avec l'énoncé. `attendu` est la liste des ids justes, dans
     l'ordre ; les distracteurs n'y figurent pas. */
  const juste = attendu
    && choisies.length === attendu.length
    && choisies.every((id, i) => id === attendu[i]);

  const rolesPoses = new Set(posees.map((e) => e.role));

  return (
    <div className="space-y-3">
      {/* La rédaction en cours */}
      <div className="min-h-[120px] rounded-2xl border-2 border-slate-200 bg-white p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Ta démonstration
        </p>
        {posees.length === 0 ? (
          <p className="text-sm italic text-slate-400">
            Commence par ce que l’énoncé t’accorde.
          </p>
        ) : (
          <ol className="space-y-1.5" data-preuve="rédaction">
            {posees.map((e, i) => {
              const style = ROLE_STYLE[e.role];
              return (
                <li key={e.id} className="flex items-start gap-2 rounded-xl bg-slate-50 p-2 text-sm">
                  <span className="shrink-0 text-xs font-bold text-slate-400">{i + 1}.</span>
                  <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${style.chip}`}>
                    {style.label}
                  </span>
                  <span className="text-slate-800">{e.texte}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* La jauge de charpente : les trois rôles, allumés au fur et à mesure. */}
      <div className="flex items-center justify-center gap-2">
        {JAUGE.map((j, i) => (
          <React.Fragment key={j.role}>
            {i > 0 && <span className="text-slate-300" aria-hidden="true">→</span>}
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              rolesPoses.has(j.role) ? ROLE_STYLE[j.role].chip : 'bg-slate-100 text-slate-400'
            }`}>
              {j.label}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Les cartes disponibles — leur rôle n'est PAS affiché ici. */}
      {restantes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Étapes disponibles — tape celle qui vient ensuite
          </p>
          <div className="grid gap-2">
            {restantes.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => onChoisir(e.id)}
                className="min-h-[44px] rounded-xl border-2 border-slate-200 bg-white p-3 text-left
                           text-sm text-slate-800 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
              >
                {e.texte}
              </button>
            ))}
          </div>
        </div>
      )}

      {choisies.length > 0 && (
        <button
          type="button"
          onClick={onRetirer}
          className="min-h-[44px] px-2 text-sm text-slate-600 underline hover:text-slate-900"
        >
          Retirer la dernière étape
        </button>
      )}

      {/* Le verdict : d'abord la charpente, puis le contenu. */}
      {charpente && (
        <div className={`rounded-2xl border-2 p-3 text-sm font-semibold ${
          juste ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
            : charpente.ok ? 'border-amber-200 bg-amber-50 text-amber-900'
              : 'border-slate-200 bg-slate-50 text-slate-700'
        }`} data-preuve="verdict">
          {juste
            ? 'Démonstration complète : donnée, propriété nommée, conclusion. C’est exactement la charpente attendue.'
            : charpente.ok
              ? 'La charpente est bonne, mais les étapes choisies ne sont pas celles que cet énoncé demande.'
              : `Charpente incomplète : ${charpente.raison}.`}
        </div>
      )}
    </div>
  );
}
