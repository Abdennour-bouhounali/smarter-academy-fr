import React, { useId, useMemo } from 'react';
import { fr, relation, siOnDouble, texteDuree, BORNES } from './grandeurs4e';

/**
 * DashboardLab — la manipulation SIGNATURE de la leçon (INTERACTION_PEDAGOGY §6bis).
 *
 * Activity               régler le trajet d'un cycliste sur TROIS cadrans liés :
 *                        la distance, la durée, la vitesse. L'élève choisit
 *                        lequel TENIR FIXE, puis en glisse un autre.
 * Mathematical objective une vitesse n'est pas un nombre isolé : c'est deux
 *                        grandeurs tenues ensemble. Les trois cadrans obéissent
 *                        à UNE seule relation, `relation()`.
 * Student action         choisir la grandeur fixée, puis glisser l'un des deux
 *                        cadrans restants. Le troisième suit, sans clic.
 * Controlled variable    la grandeur fixée (un choix), et le cadran glissé.
 *                        Le troisième cadran n'est JAMAIS réglable : il est
 *                        calculé, et son curseur est absent — pas grisé.
 * Mathematical state     deux nombres seulement. Le troisième est DÉRIVÉ par
 *                        `relation()` : les trois cadrans ne peuvent donc pas
 *                        se contredire, dans aucun état atteignable.
 * Visual consequence     les trois aiguilles se réécrivent à l'instant, et le
 *                        cadran calculé s'allume.
 * Expected observation   « doubler la durée divise la vitesse par deux SI je
 *                        fixe la distance, mais double la distance si je fixe
 *                        la vitesse — c'est le même geste ».
 * Misconception targeted « si je double quelque chose, la vitesse double » —
 *                        la réponse DÉPEND de ce qu'on tient fixe, et c'est
 *                        `siOnDouble` qui donne les DEUX réponses. Voir le
 *                        commentaire « L'AHA, ET OÙ IL SE TROUVE VRAIMENT »
 *                        plus bas : le contraste n'est pas là où on l'attend.
 *
 * CE QUE CE LABO NE FAIT PAS (laissé aux modules suivants) : nommer le mot
 * « quotient » et opposer quotient et produit (M2), le débit (M3), le
 * changement d'unité (M4), la formule écrite et ses trois lectures (M5).
 *
 * SÉCURITÉ VISUELLE (§6ter.5) : aucune valeur en <text> SVG — les nombres
 * vivent dans le DOM, dans leur propre colonne à largeur fixe. Les aiguilles
 * sont des arcs SVG purement décoratifs, bornés par construction : leur angle
 * est clampé dans [0 ; 1] avant d'être converti, donc aucune aiguille ne peut
 * sortir de son cadran, quel que soit le réglage.
 *
 * DURÉES : affichées avec `texteDuree` — « 1 h 30 min », jamais « 1,5 h » seul.
 * Le décimal reste lisible juste au-dessous : c'est la même durée, dite deux
 * fois, et c'est ce qui permet d'écrire ensuite d = v × t.
 *
 * IDENTIFIANTS UNIQUES : ce labo est rendu PLUSIEURS FOIS dans un même module
 * (une fois par étape qui en a besoin). Un `id` écrit en dur y serait dupliqué,
 * et chaque <label for> pointerait alors vers la PREMIÈRE occurrence — le clic
 * sur le libellé de l'étape 3 déplacerait le curseur de l'étape 1. `useId`
 * donne à chaque instance son propre identifiant. Défaut trouvé au navigateur,
 * invisible en test unitaire.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement (mémoire « manipulations
 * gelées après validation »). Le labo reste vivant jusqu'à la fin du module.
 */

/** Les trois cadrans, dans l'ordre où ils se lisent. */
export const CADRANS = [
  { id: 'distance', nom: 'Distance', court: 'd', couleur: '#4338ca', fond: 'indigo' },
  { id: 'duree', nom: 'Durée', court: 't', couleur: '#0369a1', fond: 'sky' },
  { id: 'vitesse', nom: 'Vitesse', court: 'v', couleur: '#7e22ce', fond: 'purple' },
];

/** L'écriture d'une valeur de cadran, avec son unité. */
export function texteCadran(id, valeur) {
  if (valeur == null || !Number.isFinite(valeur)) return '—';
  if (id === 'duree') return texteDuree(valeur);
  return `${fr(valeur, 2)} ${BORNES[id].unite}`;
}

/** Un cadran : un arc, une aiguille, et le nombre — dans le DOM. */
function Cadran({ cadran, valeur, fixe, calcule }) {
  const b = BORNES[cadran.id];
  // Clampé AVANT conversion : l'aiguille ne peut pas sortir de l'arc.
  const t = Math.max(0, Math.min(1, (valeur - b.min) / (b.max - b.min)));
  // Un demi-cercle, de 180° (gauche) à 0° (droite).
  const angle = Math.PI * (1 - t);
  const cx = 50;
  const cy = 46;
  const r = 34;
  const x = cx + r * Math.cos(angle);
  const y = cy - r * Math.sin(angle);

  return (
    <div
      className={`rounded-2xl border-2 p-3 transition-colors ${
        calcule
          ? 'border-amber-400 bg-amber-50'
          : fixe
            ? 'border-slate-800 bg-slate-50'
            : 'border-slate-200 bg-white'
      }`}
      data-cadran={cadran.id}
      data-role={calcule ? 'calcule' : fixe ? 'fixe' : 'libre'}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {cadran.nom}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[13px] font-bold ${
            calcule
              ? 'bg-amber-200 text-amber-900'
              : fixe
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-500'
          }`}
        >
          {calcule ? 'calculée' : fixe ? 'fixée' : 'réglable'}
        </span>
      </div>

      <div className="mx-auto max-w-[140px]">
        <svg viewBox="0 0 100 56" className="w-full" role="img"
             aria-label={`Cadran ${cadran.nom} : ${texteCadran(cadran.id, valeur)}`}>
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none" stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round" />
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${x} ${y}`}
            fill="none" stroke={cadran.couleur} strokeWidth="7" strokeLinecap="round"
          />
          <line x1={cx} y1={cy} x2={x} y2={y} stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="3.5" fill="#0f172a" />
        </svg>
      </div>

      {/* Le nombre vit dans le DOM, jamais en <text> SVG (§6ter.5). */}
      <p className={`text-center font-mono text-lg font-black tabular-nums ${
        calcule ? 'text-amber-900' : 'text-slate-900'
      }`}>
        {texteCadran(cadran.id, valeur)}
      </p>
      {cadran.id === 'duree' && (
        <p className="text-center font-mono text-[13px] text-slate-400 tabular-nums">
          soit {fr(valeur, 2)} h
        </p>
      )}
    </div>
  );
}

export default function DashboardLab({
  fixee,          // 'distance' | 'duree' | 'vitesse'
  onFixee,
  reglee,         // la grandeur que l'élève règle (≠ fixee)
  onReglee,
  valeurs,        // { distance, duree, vitesse } — deux suffisent, la 3e est dérivée
  onValeur,       // (id, v) => void
  montrerDoublement = false,
}) {
  // Un identifiant par INSTANCE : le labo est rendu à plusieurs étapes.
  const uid = useId();
  // ── L'ÉTAT MATHÉMATIQUE : deux nombres, jamais trois ────────────────
  // On donne à `relation` la grandeur fixée et la grandeur réglée. La
  // troisième est CALCULÉE : c'est ce qui rend toute contradiction impossible.
  const etat = useMemo(
    () => ({ [fixee]: valeurs[fixee], [reglee]: valeurs[reglee] }),
    [fixee, reglee, valeurs]
  );
  const r = relation(etat);
  const calculee = r.manquante;

  // ── L'AHA, ET OÙ IL SE TROUVE VRAIMENT ──────────────────────────────
  //
  // DÉFAUT TROUVÉ AU NAVIGATEUR : la première version comparait les deux
  // grandeurs qu'on peut doubler À FIXÉE CONSTANTE. Or ces deux facteurs sont
  // TOUJOURS ÉGAUX — à durée fixée, doubler la distance ou doubler la vitesse
  // donnent ×2 toutes les deux. La comparaison ne pouvait donc jamais montrer
  // de contraste, et la phrase-clé du labo était du code mort.
  //
  // Le contraste réel est ailleurs : c'est le MÊME geste (doubler la durée) qui
  // a deux effets opposés sur la MÊME grandeur (la vitesse) selon qu'on fixe la
  // distance (÷ 2) ou qu'on la laisse libre (× 2). On compare donc, pour la
  // grandeur que l'élève est en train de régler, ce qui arrive à la troisième
  // sous CHACUNE des deux fixations possibles.
  const doublements = useMemo(() => {
    if (!montrerDoublement) return [];
    const out = [];
    // Les deux grandeurs qu'on POURRAIT tenir fixes en doublant `reglee`.
    for (const f of ['distance', 'duree', 'vitesse']) {
      if (f === reglee) continue;
      try {
        const base = { [f]: r[f], [reglee]: r[reglee] };
        out.push({ fixeeIci: f, ...siOnDouble({ grandeur: reglee, fixee: f, etat: base }) });
      } catch {
        /* une combinaison impossible n'est simplement pas proposée */
      }
    }
    return out;
  }, [montrerDoublement, reglee, r]);

  const b = BORNES[reglee];

  return (
    <div className="space-y-4" role="group" aria-label="Tableau de bord du cycliste : trois cadrans liés">
      {/* ── 1. Quelle grandeur tient-on FIXE ? ───────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
        <p className="text-sm font-bold text-slate-700">Quelle grandeur tiens-tu fixe ?</p>
        <div className="flex flex-wrap gap-2">
          {CADRANS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onFixee(c.id)}
              aria-pressed={c.id === fixee}
              className={`min-h-[44px] rounded-xl border-2 px-3.5 py-2 text-sm font-bold transition-colors ${
                c.id === fixee
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
              }`}
            >
              {c.nom}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          Celle que tu fixes ne bougera plus. Tu règles une des deux autres, et la
          dernière se calcule toute seule.
        </p>
      </div>

      {/* ── 2. Les trois cadrans ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CADRANS.map((c) => (
          <Cadran
            key={c.id}
            cadran={c}
            valeur={r[c.id]}
            fixe={c.id === fixee}
            calcule={c.id === calculee}
          />
        ))}
      </div>

      {/* ── 3. Le curseur : une seule grandeur réglable à la fois ────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-slate-700">Je règle :</span>
          {CADRANS.filter((c) => c.id !== fixee).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onReglee(c.id)}
              aria-pressed={c.id === reglee}
              className={`min-h-[44px] rounded-xl border-2 px-3.5 py-2 text-sm font-bold transition-colors ${
                c.id === reglee
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
              }`}
            >
              {c.nom}
            </button>
          ))}
        </div>

        <label htmlFor={`${uid}-reglage`} className="block text-sm font-semibold text-slate-600">
          {CADRANS.find((c) => c.id === reglee)?.nom} : {texteCadran(reglee, valeurs[reglee])}
        </label>
        <input
          id={`${uid}-reglage`}
          type="range"
          min={b.min}
          max={b.max}
          step={b.pas}
          value={valeurs[reglee]}
          onChange={(e) => onValeur(reglee, Number(e.target.value))}
          className="sa-slider accent-indigo-600 w-full"
          role="slider"
          aria-valuemin={b.min}
          aria-valuemax={b.max}
          aria-valuenow={valeurs[reglee]}
          aria-valuetext={`${texteCadran(reglee, valeurs[reglee])}, ${
            CADRANS.find((c) => c.id === calculee)?.nom ?? ''
          } ${texteCadran(calculee, r[calculee])}`}
        />
        <div className="flex justify-between text-[13px] text-slate-400 -mt-1">
          <span>{texteCadran(reglee, b.min)}</span>
          <span>{texteCadran(reglee, b.max)}</span>
        </div>
      </div>

      {/* ── 4. Le MÊME geste, deux fixations, deux effets ────────────── */}
      {montrerDoublement && doublements.length > 0 && (
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-2"
             data-doublement="true"
             data-contraste={String(
               doublements.length === 2 && doublements[0].facteur !== doublements[1].facteur
             )}>
          <p className="text-sm font-bold text-amber-900">
            Si je double {CADRANS.find((c) => c.id === reglee)?.nom.toLowerCase()}…
          </p>
          <ul className="space-y-1.5">
            {doublements.map((d) => (
              <li key={d.fixeeIci}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-slate-600">
                  en gardant {CADRANS.find((c) => c.id === d.fixeeIci)?.nom.toLowerCase()} fixe
                </span>
                <span className="font-mono font-bold tabular-nums text-slate-900">
                  {CADRANS.find((c) => c.id === d.troisieme)?.nom.toLowerCase()} ×&nbsp;{fr(d.facteur, 2)}
                </span>
              </li>
            ))}
          </ul>
          {doublements.length === 2 && doublements[0].facteur !== doublements[1].facteur ? (
            <p className="rounded-xl bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900">
              Le MÊME geste, deux effets opposés : « si je double » n’a de sens que si
              l’on dit AUSSI ce qu’on garde fixe.
            </p>
          ) : (
            // Doubler la distance multiplie par 2 dans les deux cas : c'est VRAI,
            // et le labo le dit plutôt que de faire semblant d'avoir un contraste.
            <p className="rounded-xl bg-white px-3 py-2 text-sm text-amber-900">
              Ici les deux réponses coïncident. Essaie plutôt de régler{' '}
              <strong>la durée</strong> : le même geste y donne deux effets opposés.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
