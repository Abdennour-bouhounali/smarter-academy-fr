import React from 'react';
import { exagerationAxe, fr } from './stats4e';

/**
 * AxeLab — le diagramme dont on déplace le DÉPART DE L'AXE.
 *
 * Activity               glisser l'origine de l'axe vertical d'un diagramme
 *                        en barres et lire de combien l'écart paraît grossi.
 * Mathematical objective un diagramme se LIT, mais il se met aussi en cause.
 *                        L'œil compare les hauteurs DESSINÉES ; quand l'axe ne
 *                        part pas de zéro, ce rapport n'est plus celui des
 *                        valeurs, et le mensonge se mesure par un nombre.
 * Student action         glisser le départ de l'axe, de 0 jusqu'à juste sous
 *                        la barre la plus basse.
 * Controlled variable    le départ de l'axe. Les deux valeurs, elles, ne
 *                        changent JAMAIS — c'est tout l'intérêt : le dessin
 *                        change alors que les données sont identiques.
 * Mathematical state     `depart` ; les hauteurs, le rapport vu et le facteur
 *                        viennent tous de `exagerationAxe`.
 * Visual consequence     les deux barres se redessinent, et le rapport vu
 *                        s'écarte du rapport réel.
 * Expected observation   « les nombres n'ont pas bougé d'un dixième et
 *                        pourtant la barre paraît deux fois plus haute ».
 * Misconception targeted lire un diagramme sans regarder l'axe.
 *
 * ATTEIGNABILITÉ ET SÛRETÉ. Le domaine du curseur s'arrête à `basse − 1` :
 * `exagerationAxe` LÈVE au-delà, parce qu'un axe qui coupe la barre basse ne
 * représente plus rien. Le composant ne peut donc jamais atteindre l'état qui
 * ferait exploser le calcul — la garde du noyau et la borne du curseur disent
 * la même chose, et un test le vérifie.
 *
 * SÉCURITÉ VISUELLE : les deux valeurs et le facteur vivent dans le DOM, sous
 * les barres, en colonnes de largeur fixe. Le SVG ne porte aucun `<text>` ;
 * une barre ne peut ni dépasser le cadre (sa hauteur est bornée à 100 %) ni
 * disparaître (hauteur minimale de 3 unités, y compris au départ maximal).
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement.
 */
const H = 260;
const W = 340;
const MARGE_HAUT = 14;

export default function AxeLab({ sondage, depart, onDepart }) {
  const { basse, haute, libelles, unite } = sondage;
  const maxDepart = basse - 1;
  const d = Math.max(0, Math.min(maxDepart, depart));
  const info = exagerationAxe({ basse, haute, depart: d });

  // La hauteur dessinée : proportionnelle à (valeur − depart). Le sommet du
  // cadre est fixé à la barre HAUTE, pour que le diagramme occupe toujours la
  // même place quel que soit le réglage — c'est ce qui rend le trucage
  // spectaculaire, et c'est exactement ce que fait un graphique truqué.
  const plage = haute - d;
  const hauteurDe = (v) => Math.max(3, ((v - d) / plage) * (H - MARGE_HAUT - 20));

  const hb = hauteurDe(basse);
  const hh = hauteurDe(haute);
  const baseY = H - 20;
  const largeurBarre = 86;
  const xA = W / 2 - largeurBarre - 24;
  const xB = W / 2 + 24;

  return (
    <div className="space-y-3" role="group" aria-label="Diagramme dont le départ de l’axe se déplace">

      {/* ── LE DIAGRAMME ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3">
        <div className="mx-auto max-w-[380px]">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            role="img"
            aria-label={`Diagramme en barres : ${libelles[0]} à ${fr(basse, 0)} ${unite} et ${libelles[1]} à ${fr(haute, 0)} ${unite}, sur un axe qui démarre à ${fr(d, 0)}.`}
          >
            {/* L'axe vertical et sa base. */}
            <line x1={26} y1={MARGE_HAUT} x2={26} y2={baseY} stroke="#94a3b8" strokeWidth="2.5" />
            <line x1={26} y1={baseY} x2={W - 10} y2={baseY} stroke="#475569" strokeWidth="3" />

            {/* La marque du DÉPART, sur l'axe : c'est elle qu'on déplace, et
                c'est elle que le lecteur pressé ne regarde pas. */}
            <circle cx={26} cy={baseY} r="6" fill={d === 0 ? '#059669' : '#dc2626'} />

            <rect x={xA} y={baseY - hb} width={largeurBarre} height={hb} rx="4" fill="#0ea5e9" />
            <rect x={xB} y={baseY - hh} width={largeurBarre} height={hh} rx="4" fill="#e11d48" />
          </svg>
        </div>

        {/* Les étiquettes, en DOM : jamais en <text> SVG. */}
        <div className="mx-auto flex max-w-[380px] justify-around px-2 pt-1 text-center">
          <div className="w-[42%]">
            <p className="text-xs font-bold text-sky-700">{libelles[0]}</p>
            <p className="font-mono text-lg font-black tabular-nums text-slate-900">{fr(basse, 0)} {unite}</p>
          </div>
          <div className="w-[42%]">
            <p className="text-xs font-bold text-rose-700">{libelles[1]}</p>
            <p className="font-mono text-lg font-black tabular-nums text-slate-900">{fr(haute, 0)} {unite}</p>
          </div>
        </div>
      </div>

      {/* ── LA POIGNÉE : le départ de l'axe ────────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="axe-depart" className="text-sm font-bold text-slate-700">
            L’axe démarre à
          </label>
          <span
            data-depart
            className={`font-mono text-xl font-black tabular-nums ${d === 0 ? 'text-emerald-700' : 'text-rose-700'}`}
          >
            {fr(d, 0)} {unite}
          </span>
        </div>
        <input
          id="axe-depart"
          type="range"
          min={0}
          max={maxDepart}
          step={1}
          value={d}
          onChange={(e) => onDepart(Number(e.target.value))}
          className="sa-slider accent-amber-600 min-h-[44px] w-full"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={maxDepart}
          aria-valuenow={d}
          aria-valuetext={`axe démarrant à ${d} ${unite}, écart grossi ${fr(info.facteur)} fois`}
        />
        <div className="-mt-1 flex justify-between text-xs text-slate-400">
          <span>0 (honnête)</span>
          <span>{maxDepart}</span>
        </div>
      </div>

      {/* ── CE QUE L'ŒIL VOIT, CONTRE CE QUE DISENT LES NOMBRES ────────── */}
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold text-slate-500">Rapport réel des valeurs</p>
          <p className="mt-1 font-mono text-2xl font-black tabular-nums text-slate-800" data-rapport-reel>
            {fr(info.rapportReel)}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold text-slate-500">Rapport des hauteurs vues</p>
          <p className="mt-1 font-mono text-2xl font-black tabular-nums text-slate-800" data-rapport-vu>
            {fr(info.rapportVu)}
          </p>
        </div>
        <div className={`rounded-2xl border-2 p-3 ${info.honnete ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'}`}>
          <p className={`text-xs font-semibold ${info.honnete ? 'text-emerald-700' : 'text-rose-700'}`}>
            L’écart paraît grossi
          </p>
          <p
            data-facteur
            className={`mt-1 font-mono text-2xl font-black tabular-nums ${info.honnete ? 'text-emerald-800' : 'text-rose-800'}`}
          >
            × {fr(info.facteur)}
          </p>
        </div>
      </div>

      <p
        data-verdict
        className={`rounded-xl px-3 py-2 text-sm font-semibold ${
          info.honnete ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'
        }`}
      >
        {info.honnete
          ? 'L’axe part de zéro : les hauteurs dessinées sont dans le rapport des valeurs. Ce diagramme ne trompe personne.'
          : `L’axe ne part pas de zéro : l’écart dessiné paraît ${fr(info.facteur)} fois plus grand qu’il ne l’est.`}
      </p>
    </div>
  );
}
