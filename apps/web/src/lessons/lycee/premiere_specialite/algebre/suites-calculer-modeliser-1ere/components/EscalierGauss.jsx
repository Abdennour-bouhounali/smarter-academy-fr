import React, { useRef, useState } from 'react';
import { apparierGauss, ESCALIER_HAUTEUR_MAX, fr } from './sommesUtils';

/**
 * EscalierGauss — l'interaction SIGNATURE, temps 2 : l'escalier de pièces.
 *
 * Activity               la somme u(0) + … + u(n) est dessinée en COLONNES de
 *                        pièces, une par terme. L'élève APPARIE deux colonnes
 *                        en glissant l'une sur l'autre (ou en les touchant
 *                        l'une après l'autre — voir plus bas). Chaque paire
 *                        formée se pose dans une bande de résultats avec sa
 *                        hauteur totale.
 * Mathematical objective la somme de beaucoup de termes est un PETIT NOMBRE DE
 *                        PAIRES IDENTIQUES : premier + dernier = deuxième +
 *                        avant-dernier = … Ce qu'on gagne d'un côté, on le perd
 *                        de l'autre.
 * Student action         glisser une colonne sur une autre. Rien n'impose
 *                        d'apparier « bien » : une paire mal choisie se forme
 *                        aussi, et sa hauteur totale DIFFÈRE — c'est ainsi que
 *                        l'égalité des bonnes paires se remarque.
 * Controlled variable    le choix des deux colonnes appariées.
 * Mathematical state     `paires` — la liste des couples d'indices déjà formés.
 *                        Les hauteurs, les totaux et le verdict « toutes
 *                        égales » en sont DÉRIVÉS.
 * Visual consequence     les deux colonnes prennent la même teinte et leur
 *                        total s'inscrit ; quand toutes les paires du bon
 *                        appariement sont formées, la bande s'allume d'un coup.
 * Expected observation   « elles font toutes 25 — donc au lieu d'additionner
 *                        six nombres, j'en additionne trois fois le même ».
 * Misconception targeted « il faut additionner tous les termes un par un » ;
 *                        « la formule avec la division par 2 est arbitraire » ;
 *                        « avec un nombre impair de colonnes ça ne marche
 *                        plus » (la colonne centrale est MONTRÉE, pas cachée).
 *
 * DEUX GESTES POUR LE MÊME ACTE. Le glisser est le geste premier ; mais un
 * appariement doit aussi être atteignable au clavier et au lecteur d'écran.
 * Toucher une colonne la SÉLECTIONNE, toucher une seconde forme la paire —
 * strictement le même modèle, aucune duplication d'état.
 *
 * `setPointerCapture` EST OBLIGATOIRE : sans lui la colonne cesse de recevoir
 * `pointermove` dès que le pointeur la quitte, et le glisser se fige au
 * premier pixel.
 *
 * SÉCURITÉ DE MISE EN PAGE. Les valeurs sont écrites SOUS les colonnes, dans le
 * DOM ; la colonne elle-même n'est qu'un rectangle dont la hauteur est calculée
 * depuis `ESCALIER_HAUTEUR_MAX` — pas depuis le maximum courant, sinon deux
 * escaliers différents ne seraient pas comparables. Au plus neuf colonnes
 * (test), donc pas de débordement à 375 px.
 *
 * JAMAIS GELÉ après réussite : `disabled` ne sert qu'au verrou d'ANTÉRIORITÉ.
 * Le bouton « tout défaire » permet de refaire le geste autant qu'on veut.
 */
export default function EscalierGauss({
  list,
  label,
  paires,
  onChangePaires,
  disabled = false,
  onComplet,
}) {
  const [selection, setSelection] = useState(null);
  const [survol, setSurvol] = useState(null);
  const dragRef = useRef(null);

  const attendu = apparierGauss(list);
  /** L'index du partenaire « de Gauss » d'une colonne. */
  const partenaireDeGauss = (i) => list.length - 1 - i;

  const appariee = (i) => paires.some((p) => p.a === i || p.b === i);
  const indexPaire = (i) => paires.findIndex((p) => p.a === i || p.b === i);

  /** Le bon appariement est-il entièrement formé ? */
  const complet =
    paires.length === attendu.paires.length
    && attendu.paires.every((att) =>
      paires.some((p) => (p.a === att.i && p.b === att.j) || (p.a === att.j && p.b === att.i)),
    );

  const total = (p) => list[p.a] + list[p.b];
  const tousEgaux =
    paires.length > 1
    && paires.every((p) => Math.abs(total(p) - total(paires[0])) < 1e-9);

  const former = (a, b) => {
    if (a === b || appariee(a) || appariee(b)) return;
    const suivant = [...paires, { a, b }];
    onChangePaires(suivant);
    setSelection(null);
    // L'effet de bord vit ICI, dans le gestionnaire, jamais dans un updater :
    // un updater impur déclenche l'avertissement React « cannot update while
    // rendering ».
    const estComplet =
      suivant.length === attendu.paires.length
      && attendu.paires.every((att) =>
        suivant.some((p) => (p.a === att.i && p.b === att.j) || (p.a === att.j && p.b === att.i)),
      );
    if (estComplet) onComplet?.();
  };

  const toucher = (i) => {
    if (disabled || appariee(i)) return;
    if (selection === null) setSelection(i);
    else if (selection === i) setSelection(null);
    else former(selection, i);
  };

  /* ── Le glisser ──────────────────────────────────────────────────────── */
  const onPointerDown = (i) => (ev) => {
    if (disabled || appariee(i)) return;
    // Sans capture, la colonne perd `pointermove` dès que le pointeur la quitte.
    ev.currentTarget.setPointerCapture?.(ev.pointerId);
    dragRef.current = { depuis: i, pointerId: ev.pointerId };
    setSelection(i);
  };

  const colonneSousLePointeur = (ev) => {
    const el = document.elementFromPoint(ev.clientX, ev.clientY);
    const hote = el?.closest?.('[data-colonne]');
    return hote ? Number(hote.getAttribute('data-colonne')) : null;
  };

  const onPointerMove = (ev) => {
    if (!dragRef.current) return;
    const cible = colonneSousLePointeur(ev);
    setSurvol(cible !== null && cible !== dragRef.current.depuis && !appariee(cible) ? cible : null);
  };

  const onPointerUp = (ev) => {
    const drag = dragRef.current;
    dragRef.current = null;
    setSurvol(null);
    if (!drag) return;
    ev.currentTarget.releasePointerCapture?.(drag.pointerId);
    const cible = colonneSousLePointeur(ev);
    // Relâcher sur soi-même laisse la colonne SÉLECTIONNÉE : le glisser
    // dégénère alors proprement en « toucher », plutôt que d'annuler.
    if (cible !== null && cible !== drag.depuis) former(drag.depuis, cible);
  };

  const teintes = [
    'bg-emerald-400 border-emerald-600',
    'bg-sky-400 border-sky-600',
    'bg-amber-400 border-amber-600',
    'bg-violet-400 border-violet-600',
    'bg-fuchsia-400 border-fuchsia-600',
  ];

  return (
    <div className="space-y-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-3">
      {label && <div className="text-sm font-bold text-emerald-900">{label}</div>}
      <p className="text-[13px] text-slate-700">
        Glisse une colonne sur une autre pour les <strong>apparier</strong> — ou touche-les l’une
        après l’autre. {list.length} colonnes, {fr(attendu.paires.length)} paires possibles
        {attendu.centre ? ' et une colonne qui restera seule' : ''}.
      </p>

      {/* ── L'escalier ──────────────────────────────────────────────────── */}
      <div
        className="flex items-end justify-center gap-1.5 overflow-x-auto rounded-xl border border-emerald-200 bg-white p-3"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {list.map((v, i) => {
          const k = indexPaire(i);
          const estAppariee = k >= 0;
          const teinte = estAppariee ? teintes[k % teintes.length] : 'bg-slate-300 border-slate-400';
          const choisie = selection === i;
          const vise = survol === i;
          return (
            <button
              key={i}
              type="button"
              data-colonne={i}
              onPointerDown={onPointerDown(i)}
              onClick={() => toucher(i)}
              disabled={disabled || estAppariee}
              aria-label={
                `Colonne numéro ${i}, hauteur ${fr(v)}`
                + (estAppariee ? `, appariée avec la colonne ${fr(paires[k].a === i ? paires[k].b : paires[k].a)}` : '')
                + (choisie ? ', sélectionnée' : '')
              }
              aria-pressed={choisie}
              className={`flex shrink-0 touch-none flex-col items-center gap-1 rounded-lg p-1 transition-colors
                ${choisie ? 'bg-indigo-100 ring-2 ring-indigo-500' : vise ? 'bg-indigo-50 ring-2 ring-indigo-300' : ''}
                ${disabled || estAppariee ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
            >
              <span
                className={`w-8 rounded-t border-b-2 ${teinte}`}
                style={{ height: `${10 + (v / ESCALIER_HAUTEUR_MAX) * 80}px` }}
                aria-hidden="true"
              />
              <span className="font-mono text-sm font-black tabular-nums text-slate-900">{fr(v)}</span>
              <span className="font-mono text-[13px] text-slate-400">n° {fr(i)}</span>
            </button>
          );
        })}
      </div>

      {/* ── La bande des paires formées, en DOM ─────────────────────────── */}
      {paires.length > 0 && (
        <div
          className={`rounded-xl border-2 p-3 ${
            tousEgaux ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50'
          }`}
          aria-live="polite"
        >
          <div className="mb-1.5 text-[13px] font-semibold text-slate-700">
            Hauteur totale de chaque paire
          </div>
          <ul className="flex flex-wrap gap-2">
            {paires.map((p, k) => (
              <li
                key={`${p.a}-${p.b}`}
                className={`rounded-lg border px-2.5 py-1 font-mono text-sm font-bold tabular-nums ${
                  tousEgaux ? 'border-emerald-400 bg-white text-emerald-900' : 'border-slate-300 bg-white text-slate-800'
                }`}
              >
                <span className="text-[13px] font-normal text-slate-500">
                  n°{fr(p.a)} + n°{fr(p.b)} ={' '}
                </span>
                {fr(total(p))}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[13px] text-slate-700">
            {tousEgaux ? (
              <>
                Toutes les paires font <strong>{fr(total(paires[0]))}</strong>. Ce n’est pas un
                hasard.
              </>
            ) : (
              <>
                Les paires n’ont pas la même hauteur. Essaie d’apparier la{' '}
                <strong>première</strong> avec la <strong>dernière</strong>.
              </>
            )}
          </p>
        </div>
      )}

      {/* ── La colonne restée seule, MONTRÉE et non cachée ──────────────── */}
      {complet && attendu.centre && (
        <div className="rounded-xl border-2 border-slate-300 bg-white p-3 text-[13px] text-slate-700">
          La colonne <strong>n°{fr(attendu.centre.i)}</strong> est restée seule : il y a un nombre
          impair de colonnes. Elle vaut <strong>{fr(attendu.centre.valeur)}</strong>, soit
          exactement la <strong>moitié</strong> d’une paire ({fr(attendu.totalPaire)} ÷ 2).
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="min-h-[44px] rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          onClick={() => { onChangePaires([]); setSelection(null); }}
          disabled={disabled || paires.length === 0}
        >
          Tout défaire
        </button>
        {selection !== null && (
          <span className="text-[13px] text-indigo-800">
            Colonne n°{fr(selection)} sélectionnée — touche sa partenaire.
          </span>
        )}
        {complet && (
          <span className="text-[13px] font-bold text-emerald-700">
            Appariement complet : {fr(attendu.paires.length)} paires à {fr(attendu.totalPaire)}
            {attendu.centre ? `, plus la colonne centrale (${fr(attendu.centre.valeur)})` : ''}.
          </span>
        )}
      </div>
    </div>
  );
}

/** Le partenaire de Gauss d'une colonne — exporté pour les tests des modules. */
export const partenaireDeGauss = (list, i) => list.length - 1 - i;
