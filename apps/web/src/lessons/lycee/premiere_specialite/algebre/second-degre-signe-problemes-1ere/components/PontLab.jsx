import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import {
  PONT, H_STEPS, L_STEPS, pStepsDe, arche, labState, fr,
} from './signeProblemesUtils';

/**
 * PontLab — l'interaction SIGNATURE : le pont et la péniche.
 *
 * Activity               une arche parabolique FIXE, h(x) = −0,5x² + 4,5, et
 *                        une péniche dont l'élève règle la LARGEUR et la
 *                        HAUTEUR, puis qu'il DÉPLACE sous l'arche au cliquet.
 * Mathematical objective un trinôme ne change de signe qu'à ses racines : les
 *                        positions qui passent forment donc UNE SEULE bande,
 *                        jamais un patchwork, et cette bande est ENTRE les
 *                        racines pour une courbe tournée vers le bas.
 * Student action         régler L, régler H, déplacer la péniche cran par
 *                        cran (0,25 m). Cliquets discrets, jamais des
 *                        curseurs : les bandes remarquables ]−3 ; 3[,
 *                        ]−2 ; 2[ et ]−1 ; 1[ doivent être exactement
 *                        atteignables (§17, verrouillé par un test).
 * Controlled variables   L, H, p — rien d'autre. L'arche ne bouge JAMAIS.
 * Mathematical state     le triplet (p, L, H) ; les coins, leur couleur, la
 *                        bande et la liste des positions gagnantes en sont
 *                        TOUS dérivés par `labState`.
 * Visual consequence     les deux coins hauts s'allument en vert (sous
 *                        l'arche) ou en rouge (dans l'arche) ; la bande des
 *                        positions qui passent se peint sur l'axe.
 * Expected observation   « les positions qui marchent se touchent toutes —
 *                        c'est un seul morceau, et il se rétrécit quand
 *                        j'élargis ou que je surélève ».
 * Misconception targeted « il faut essayer toutes les positions une par une » ;
 *                        « une position qui passe peut être isolée entre deux
 *                        positions qui ne passent pas ».
 *
 * DISTINCTION AVEC LE LABORATOIRE AMONT (`ParabolaLab`, « Second degré :
 * résoudre ») : là-bas la courbe GLISSE et l'élève COMPTE des points ; ici la
 * courbe est FIXE et l'élève déplace un OBJET pour lire un INTERVALLE.
 *
 * Nombres dans le DOM, jamais en <text> SVG : les deux coins peuvent se
 * rapprocher jusqu'à 1 m et leurs étiquettes se chevaucheraient. Le repère ne
 * porte que la figure ; tout ce qui se lit est en dessous.
 *
 * JAMAIS GELÉ après réussite : `disabled` ne sert qu'au verrou d'ANTÉRIORITÉ
 * d'une étape sur la précédente. Un élève qui vient de comprendre doit pouvoir
 * refaire le geste.
 */
const ARCHE = '#4f46e5';
const OK = '#059669';
const KO = '#e11d48';
const EAU = '#0284c7';

const btn =
  'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 ' +
  'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

/** Un cliquet : deux boutons et la valeur courante, tous ≥ 44 px de haut. */
function Cliquet({ label, unite, valeur, crans, onChange, disabled, moins, plus }) {
  const idx = crans.findIndex((v) => Math.abs(v - valeur) < 1e-9);
  return (
    <div className="flex items-center gap-2 flex-wrap" role="group" aria-label={label}>
      <span className="text-[13px] font-semibold text-slate-700 min-w-[86px]">{label}</span>
      <button
        type="button" className={btn} aria-label={`${label} : ${moins}`}
        disabled={disabled || idx <= 0}
        onClick={() => onChange?.(crans[idx - 1])}
      >
        {moins}
      </button>
      <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold tabular-nums text-sm">
        {fr(valeur)} {unite}
      </span>
      <button
        type="button" className={btn} aria-label={`${label} : ${plus}`}
        disabled={disabled || idx < 0 || idx >= crans.length - 1}
        onClick={() => onChange?.(crans[idx + 1])}
      >
        {plus}
      </button>
    </div>
  );
}

export default function PontLab({
  p, L, H,
  onChangeP, onChangeL, onChangeH,
  disabled = false,
  /** Les réglages de forme sont masqués à l'étape 1 : on déplace d'abord une
   *  péniche donnée, on la transforme ensuite. */
  showReglages = true,
  /** La bande des positions gagnantes, peinte sur l'axe. Masquée tant que
   *  l'élève ne l'a pas cherchée lui-même. */
  showBande = true,
  /** Les positions déjà essayées, dans l'ordre d'essai : c'est la SUITE des
   *  états qui fait la découverte, pas la dernière. */
  essais = [],
}) {
  const s = labState(p, L, H);
  const crans = pStepsDe(L);

  // La péniche : un rectangle posé sur l'eau (y = 0), de largeur L et de
  // hauteur H. À H = 0 elle n'est qu'une ligne — c'est un état légitime (une
  // barge à ras de l'eau) et le polygone reste bien formé.
  const peniche = {
    id: 'peniche',
    points: [
      { x: p - L / 2, y: 0 }, { x: p + L / 2, y: 0 },
      { x: p + L / 2, y: H }, { x: p - L / 2, y: H },
    ],
    fill: s.passe ? '#a7f3d0' : '#fecdd3',
    fillOpacity: 0.55,
    stroke: s.passe ? OK : KO,
    strokeWidth: 2.5,
  };

  const points = s.coins.map((coin, i) => ({
    id: `coin${i}`, x: coin.x, y: H, color: coin.ok ? OK : KO,
  }));

  const bandes = showBande && s.bande
    ? [{ from: s.bande.from, to: s.bande.to, tone: 'emerald' }]
    : [];

  return (
    <div className="space-y-3">
      <CoordPlane
        range={PONT.range}
        unit={PONT.unit}
        unitY={PONT.unitY}
        xStep={1}
        yStep={1}
        highlightIntervals={bandes}
        curves={[
          { id: 'arche', points: echantillonneArche(), tone: ARCHE, width: 3 },
          { id: 'eau', points: [{ x: PONT.range.xMin, y: 0 }, { x: PONT.range.xMax, y: 0 }], tone: EAU, width: 2 },
        ]}
        polygons={[peniche]}
        // LES COINS NE PORTENT PAS D'ÉTIQUETTE SVG. Ils peuvent se rapprocher
        // jusqu'à 1 m l'un de l'autre, et deux étiquettes posées à côté d'eux
        // se chevaucheraient. Ils sont identifiés par la LÉGENDE en DOM
        // ci-dessous, lisible quel que soit l'écart — règle §6bis.4.
        points={points}
        caption={false}
        disabled
        ariaLabel={
          `Arche de pont d'équation y = ${fr(PONT.a)}x² + ${fr(PONT.k)}, fixe, ` +
          `haute de ${fr(PONT.k)} mètres au milieu et large de 6 mètres à la base. ` +
          `Une péniche large de ${fr(L)} mètres et haute de ${fr(H)} mètres est centrée en ${fr(p)}. ` +
          `Son coin gauche est en ${fr(arrondi(s.coins[0].x))}, son coin droit en ${fr(arrondi(s.coins[1].x))}. ` +
          (s.passe ? 'Les deux coins sont sous l’arche : elle passe.' : 'Au moins un coin touche l’arche : elle ne passe pas.')
        }
      />

      {/* LE VERDICT — un afficheur unique, jamais une couleur seule. */}
      <div
        data-testid="pont-verdict"
        className={`rounded-xl border-2 px-3 py-2.5 text-center font-bold ${
          s.passe
            ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
            : 'border-rose-300 bg-rose-50 text-rose-900'
        }`}
      >
        {s.passe ? '✔ la péniche passe' : '✘ la péniche ne passe pas'}
      </div>

      {/* La légende des coins : elle remplace les étiquettes SVG. */}
      <div className="flex flex-wrap items-center gap-3 text-[13px]" data-testid="pont-legende">
        {s.coins.map((coin, i) => (
          <span key={i} className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: coin.ok ? OK : KO }} aria-hidden="true" />
            coin {i === 0 ? 'gauche' : 'droit'} en x = {fr(arrondi(coin.x))} · l’arche y monte à{' '}
            {fr(arrondi(arche(coin.x)))} m {coin.ok ? '(dégagé)' : '(trop bas)'}
          </span>
        ))}
      </div>

      <Cliquet
        label="position" unite="m" valeur={p} crans={crans}
        onChange={onChangeP} disabled={disabled} moins="← gauche" plus="droite →"
      />
      {showReglages && (
        <>
          <Cliquet
            label="largeur" unite="m" valeur={L} crans={L_STEPS}
            onChange={onChangeL} disabled={disabled} moins="− étroite" plus="+ large"
          />
          <Cliquet
            label="hauteur" unite="m" valeur={H} crans={H_STEPS}
            onChange={onChangeH} disabled={disabled} moins="− basse" plus="+ haute"
          />
        </>
      )}

      {showBande && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-sm">
          <div className="font-semibold text-emerald-900 mb-1">Les positions qui passent</div>
          {s.bande ? (
            <p className="text-emerald-900">
              toutes celles strictement comprises entre{' '}
              <strong className="font-mono tabular-nums">{fr(arrondi(s.bande.from))}</strong> et{' '}
              <strong className="font-mono tabular-nums">{fr(arrondi(s.bande.to))}</strong>{' '}
              — soit <strong>{s.gagnantes.length}</strong> position
              {s.gagnantes.length > 1 ? 's' : ''} sur les {crans.length} crans, et elles se
              suivent toutes.
            </p>
          ) : (
            <p className="text-rose-900">
              aucune : cette péniche ne passe nulle part sous cette arche.
            </p>
          )}
        </div>
      )}

      {/* L'HISTORIQUE : la SUITE des essais est ce qui fait la découverte.
          En DOM, donc lu par un lecteur d'écran. */}
      {essais.length > 1 && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
          <div className="text-[13px] font-semibold text-indigo-900 mb-2">Les positions déjà essayées</div>
          <ul className="flex flex-wrap gap-2">
            {[...essais].sort((x, y) => x - y).map((pv) => {
              const e = labState(pv, L, H);
              return (
                <li
                  key={pv}
                  className={`rounded-lg border px-2.5 py-1 font-mono text-[13px] tabular-nums ${
                    e.passe ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  {fr(pv)} m {e.passe ? '✔' : '✘'}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Arrondi d'affichage : deux décimales suffisent et évitent 2,8284271247. */
const arrondi = (n) => Math.round(n * 100) / 100;

/** L'arche échantillonnée, COUPÉE au cadre — jamais tracée puis rognée.
 *  Elle ne dépend d'aucun réglage : elle est calculée une fois. */
const ARCHE_POINTS = (() => {
  const pts = [];
  const n = 200;
  const { xMin, xMax, yMin, yMax } = PONT.range;
  for (let i = 0; i <= n; i += 1) {
    const x = xMin + ((xMax - xMin) * i) / n;
    const y = arche(x);
    if (y >= yMin && y <= yMax) pts.push({ x, y });
  }
  return pts;
})();
const echantillonneArche = () => ARCHE_POINTS;
