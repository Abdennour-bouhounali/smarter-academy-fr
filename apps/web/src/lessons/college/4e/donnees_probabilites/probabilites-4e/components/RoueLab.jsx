import React, { useMemo } from 'react';
import {
  experience, probabilite, fraction, pct, pctNombre,
  series, TAILLES_DE_SERIE, NOMBRE_DE_SERIES, evenementSi,
} from './proba4e';

/**
 * RoueLab — la manipulation SIGNATURE de la leçon (INTERACTION_PEDAGOGY §6bis).
 *
 * Activity              composer une roue (combien de secteurs de chaque
 *                       couleur), puis la faire tourner 10, 100, 1 000 et
 *                       10 000 fois.
 * Mathematical objective la fréquence observée FLUCTUE d'une série à l'autre,
 *                       puis se resserre autour de la probabilité quand on
 *                       répète — sans jamais l'atteindre exactement.
 * Student action        régler la composition de la roue ; lancer une taille
 *                       de série ; relancer.
 * Controlled variable   la composition, et le nombre de tours.
 * Mathematical state    { composition, taille, graine }. Les fréquences, les
 *                       écarts et l'amplitude sont TOUS calculés par le
 *                       noyau — rien n'est écrit à la main.
 * Visual consequence    cinq barres de fréquence, l'une sous l'autre, avec le
 *                       repère de la probabilité théorique ; elles se
 *                       resserrent visiblement quand la taille grandit.
 * Expected observation  « à 10 tours elles partent dans tous les sens ; à
 *                       10 000 elles se collent au trait ».
 * Misconception targeted « le hasard finit par s'équilibrer exactement » —
 *                       l'écart ne devient jamais nul, il devient petit.
 *
 * ALÉA INJECTÉ (§6ter.2) : la graine vient du module, jamais de l'horloge
 * dans le rendu. Le bouton « relancer » utilise `graineSuivante` (pas premier)
 * et non `graine + 1`, qui donnerait des séries visiblement identiques.
 *
 * SÉCURITÉ VISUELLE : pistes DOM et nombres en colonne propre — aucun texte
 * SVG, donc aucun chevauchement possible quel que soit le nombre de chiffres.
 * L'échelle est FIXE (0 à 1), donc une barre ne peut jamais sortir du cadre.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement.
 */

/** Une barre de fréquence, avec le repère de la probabilité théorique. */
function BarreSerie({ serie, pTheorique, index }) {
  const f = serie.frequence ?? 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 shrink-0 text-[11px] font-semibold text-slate-400">#{index + 1}</span>
      <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-indigo-500 transition-[width] duration-200"
          style={{ width: `${Math.max(0, Math.min(100, f * 100))}%` }}
        />
        {/* Le repère théorique : un trait vertical, à la même échelle. */}
        <div
          className="absolute inset-y-0 w-[2px] bg-slate-900"
          style={{ left: `${Math.max(0, Math.min(100, pTheorique * 100))}%` }}
          aria-hidden="true"
        />
      </div>
      <span className="w-16 shrink-0 text-right font-mono text-xs font-bold tabular-nums text-slate-800">
        {pctNombre(f, 1)}
      </span>
    </div>
  );
}

export default function RoueLab({
  composition,          // { or, violet, turquoise, rose } — des ENTIERS ≥ 0
  onComposition,
  couleurSuivie = 'or',
  taille,
  onTaille,
  graine,
  onRelancer,
  lance = false,
  lockComposition = false,
}) {
  const COULEURS = [
    { id: 'or', label: 'Or', hex: '#f59e0b' },
    { id: 'violet', label: 'Violet', hex: '#7c3aed' },
    { id: 'turquoise', label: 'Turquoise', hex: '#0891b2' },
    { id: 'rose', label: 'Rose', hex: '#db2777' },
  ];

  // L'expérience est RECONSTRUITE depuis la composition : la roue affichée et
  // la roue simulée sont le même objet mathématique, par construction.
  //
  // `experience()` REFUSE une expérience sans issue — à juste titre : une
  // roue sans secteur n'est pas une expérience aléatoire. L'élève peut
  // pourtant atteindre cet état en retirant tous les secteurs, et l'interface
  // doit alors l'INVITER à en remettre un, jamais planter. On ne construit
  // donc l'expérience que lorsqu'elle existe.
  const secteurs = useMemo(
    () =>
      COULEURS.flatMap((c) =>
        Array.from({ length: composition[c.id] ?? 0 }, (_, i) => ({
          id: `${c.id}${i + 1}`,
          label: c.label,
          couleur: c.id,
          hex: c.hex,
        }))
      ),
    [composition]
  );
  const total = secteurs.length;
  const exp = useMemo(
    () => (total > 0 ? experience({ id: 'roue-eleve', nom: 'Ta roue', issues: secteurs }) : null),
    [secteurs, total]
  );
  const evt = useMemo(
    () =>
      exp
        ? evenementSi(exp, (i) => i.couleur === couleurSuivie, {
            id: couleurSuivie,
            label: `on tombe sur ${couleurSuivie}`,
          })
        : null,
    [exp, couleurSuivie]
  );
  const p = evt ? probabilite(evt) : null;
  const pNum = p ? p.n / p.d : 0;

  const lesSeries = useMemo(
    () => (lance && exp && evt ? series(exp, evt, taille, graine, NOMBRE_DE_SERIES) : []),
    [lance, exp, evt, taille, graine]
  );
  const freqs = lesSeries.map((s) => s.frequence).filter((x) => x != null);
  const amp = freqs.length ? Math.max(...freqs) - Math.min(...freqs) : null;

  const regler = (id, delta) => {
    const suivant = Math.max(0, Math.min(8, (composition[id] ?? 0) + delta));
    onComposition({ ...composition, [id]: suivant });
  };

  return (
    <div className="space-y-4" role="group" aria-label="Roue de la fête : composer et faire tourner">
      {/* ── La roue, dessinée depuis la composition ─────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
        <div className="mx-auto max-w-[190px]">
          <svg viewBox="-52 -52 104 104" className="w-full" role="img"
               aria-label={`Roue de ${total} secteurs, dont ${composition[couleurSuivie] ?? 0} ${couleurSuivie}`}>
            {total === 0 ? (
              <circle r="46" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
            ) : (
              secteurs.map((issue, i) => {
                const a0 = (i / total) * 2 * Math.PI - Math.PI / 2;
                const a1 = ((i + 1) / total) * 2 * Math.PI - Math.PI / 2;
                const R = 46;
                const grand = a1 - a0 > Math.PI ? 1 : 0;
                const d = total === 1
                  ? `M 0 0 m -${R} 0 a ${R} ${R} 0 1 0 ${2 * R} 0 a ${R} ${R} 0 1 0 ${-2 * R} 0`
                  : `M 0 0 L ${R * Math.cos(a0)} ${R * Math.sin(a0)} A ${R} ${R} 0 ${grand} 1 ${R * Math.cos(a1)} ${R * Math.sin(a1)} Z`;
                return (
                  <path key={issue.id} d={d} fill={issue.hex}
                        opacity={issue.couleur === couleurSuivie ? 1 : 0.35}
                        stroke="#fff" strokeWidth="1" />
                );
              })
            )}
          </svg>
        </div>
        <p className="mt-2 text-center text-sm text-slate-600">
          {total === 0
            ? 'Ajoute au moins un secteur.'
            : <>
                {total} secteur{total > 1 ? 's' : ''} · probabilité de tomber sur{' '}
                <strong>{couleurSuivie}</strong> :{' '}
                <span className="font-mono font-bold text-slate-900">{fraction(p)}</span>{' '}
                <span className="text-slate-400">= {pct(p)}</span>
              </>}
        </p>
      </div>

      {/* ── La composition ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {COULEURS.map((c) => (
          <div key={c.id} className="flex min-w-0 items-center justify-between gap-2 rounded-xl border-2 border-slate-200 bg-white px-2.5 py-2">
            <span className="flex min-w-0 items-center gap-2 truncate text-sm font-semibold text-slate-700">
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: c.hex }} aria-hidden="true" />
              {c.label}
            </span>
            <span className="flex shrink-0 items-center gap-1">
              <button type="button" disabled={lockComposition}
                      onClick={() => regler(c.id, -1)}
                      aria-label={`Retirer un secteur ${c.label}`}
                      className="min-h-[44px] min-w-[44px] rounded-lg border-2 border-slate-200 text-lg font-bold text-slate-600 disabled:opacity-40">
                −
              </button>
              <span className="w-6 text-center font-mono text-base font-black tabular-nums text-slate-900">
                {composition[c.id] ?? 0}
              </span>
              <button type="button" disabled={lockComposition}
                      onClick={() => regler(c.id, 1)}
                      aria-label={`Ajouter un secteur ${c.label}`}
                      className="min-h-[44px] min-w-[44px] rounded-lg border-2 border-slate-200 text-lg font-bold text-slate-600 disabled:opacity-40">
                +
              </button>
            </span>
          </div>
        ))}
      </div>

      {/* ── Le nombre de tours ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TAILLES_DE_SERIE.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onTaille(t)}
            aria-pressed={t === taille}
            disabled={total === 0}
            className={`min-h-[44px] rounded-xl border-2 px-2 py-2 text-sm font-bold transition-colors disabled:opacity-40 ${
              t === taille ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            {t.toLocaleString('fr-FR')} tours
          </button>
        ))}
      </div>

      {/* ── Les séries ──────────────────────────────────────────────── */}
      {lance && lesSeries.length > 0 && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-bold text-slate-700">
              {NOMBRE_DE_SERIES} séries de {taille.toLocaleString('fr-FR')} tours
            </p>
            <span className="text-[11px] text-slate-400">| trait noir = probabilité</span>
          </div>
          {lesSeries.map((s, i) => (
            <BarreSerie key={s.graine} serie={s} pTheorique={pNum} index={i} />
          ))}
          <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-900 px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Écart entre la plus petite et la plus grande
            </span>
            <span className="font-mono text-base font-black tabular-nums text-white">
              {pctNombre(amp, 1)}
            </span>
          </div>
          <button
            type="button"
            onClick={onRelancer}
            className="min-h-[44px] w-full rounded-xl bg-indigo-600 px-3 py-2 text-sm font-bold text-white hover:bg-indigo-700"
          >
            Relancer les {NOMBRE_DE_SERIES} séries
          </button>
        </div>
      )}
    </div>
  );
}
