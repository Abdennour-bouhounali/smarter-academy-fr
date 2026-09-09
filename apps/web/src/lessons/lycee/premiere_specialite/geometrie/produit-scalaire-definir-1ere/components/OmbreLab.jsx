import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import {
  U_LAB, R_LAB, PAS_DEG, CRANS, ORIGINE, RANGE,
  vAuCran, angleAuCran, ombreSignee, piedOmbre,
  produitParOmbre, produitCoordonnees, norm, fr, frVec,
} from './scalaireUtils';

/**
 * OmbreLab — l'interaction SIGNATURE : « L'ombre portée ».
 *
 * Activity               deux flèches partant de la même origine. La première
 *                        (u) est FIXE ; l'élève fait TOURNER la seconde (v) au
 *                        cliquet de 15°. L'OMBRE de v sur la direction de u —
 *                        sa projection orthogonale — est dessinée comme un
 *                        segment ÉPAIS portant un SIGNE : elle part dans le
 *                        sens de u, ou à l'opposé.
 * Mathematical objective de deux flèches naît un nombre, calculable de deux
 *                        façons sans rapport l'une avec l'autre — et ce nombre
 *                        s'annule exactement à l'angle droit.
 * Student action         appuyer sur « tourner » (cliquet discret de 15°,
 *                        jamais un curseur : l'angle droit doit être
 *                        EXACTEMENT atteignable, et il l'est en 6 crans).
 * Controlled variable    k, le cran d'angle. v en est dérivé, jamais stocké.
 * Mathematical state     { k } ; ombre, pied, angle et les DEUX afficheurs en
 *                        sont tous dérivés.
 * Visual consequence     v pivote, l'ombre s'allonge, se raccourcit, DISPARAÎT
 *                        à l'angle droit, puis repart de l'autre côté.
 * Expected observation   « les deux nombres sont toujours les mêmes, et ils
 *                        tombent à zéro pile à l'angle droit ».
 * Misconception targeted « l'ombre est une longueur, donc positive » ; « deux
 *                        flèches donnent forcément une flèche » ; « on voit
 *                        bien que c'est perpendiculaire ».
 *
 * ─── ÉTIQUETTES EN LÉGENDE DOM, JAMAIS EN <text> SVG ──────────────────
 * u et v partent du MÊME point et se SUPERPOSENT au cran 0 (angle nul) ainsi
 * qu'aux crans voisins : deux noms posés à côté d'eux se chevaucheraient
 * nécessairement. Les noms, les coordonnées et les deux afficheurs vivent donc
 * dans le DOM sous la figure, où l'écart entre les flèches peut tendre vers
 * zéro sans jamais rendre l'affichage illisible. Le balayage des 24 crans est
 * un test (scalaireUtils.test.js).
 *
 * ─── JAMAIS GELÉ APRÈS RÉUSSITE ──────────────────────────────────────
 * `disabled` ne sert qu'au verrou d'ANTÉRIORITÉ d'une étape sur la précédente.
 * Un élève qui vient de comprendre doit pouvoir refaire tourner la flèche.
 */
const C_U = '#7c3aed';
const C_V = '#0284c7';
const C_OMBRE = '#0f766e';
const C_PERP = '#94a3b8';

export default function OmbreLab({
  k,
  onChangeK,
  visites = [],
  disabled = false,
  montrerCoordonnees = true,
  montrerAfficheurs = true,
}) {
  const u = U_LAB;
  const v = vAuCran(k);
  const pied = piedOmbre(u, v);
  const ombre = ombreSignee(u, v);
  const angle = angleAuCran(k);
  const parOmbre = produitParOmbre(u, v);
  const parCoord = produitCoordonnees(u, v);
  const droit = Math.abs(angle - 90) < 1e-9;

  const bout = { x: ORIGINE.x + v.x, y: ORIGINE.y + v.y };

  /**
   * L'ombre et sa perpendiculaire. Le SEGMENT ÉPAIS va de l'origine au pied :
   * son sens à l'écran EST le signe, il n'est pas décoré après coup. La
   * perpendiculaire en pointillé relie le bout de v à son pied — c'est le
   * geste de projection rendu visible.
   */
  const overlay = (toSvg) => {
    const O = toSvg(ORIGINE.x, ORIGINE.y);
    const P = toSvg(pied.x, pied.y);
    const B = toSvg(bout.x, bout.y);
    return (
      <g pointerEvents="none">
        {/* La droite qui porte u, prolongée des deux côtés : c'est sur elle
            que l'ombre se lit, y compris du côté négatif. */}
        <line
          x1={toSvg(-u.x * 1.5, -u.y * 1.5).x} y1={toSvg(-u.x * 1.5, -u.y * 1.5).y}
          x2={toSvg(u.x * 1.5, u.y * 1.5).x} y2={toSvg(u.x * 1.5, u.y * 1.5).y}
          stroke={C_U} strokeWidth={1} strokeDasharray="3 4" opacity={0.45}
        />
        {/* La perpendiculaire abaissée du bout de v : le geste de projection. */}
        <line x1={B.x} y1={B.y} x2={P.x} y2={P.y} stroke={C_PERP} strokeWidth={2} strokeDasharray="4 3" />
        {/* Le carré du pied — visible seulement quand le pied n'est pas sur
            l'origine, sans quoi il masquerait le point commun aux deux flèches. */}
        {Math.abs(ombre) > 1e-9 && <circle cx={P.x} cy={P.y} r={4} fill={C_OMBRE} />}
        {/* L'OMBRE : segment épais de l'origine au pied. */}
        {Math.abs(ombre) > 1e-9 && (
          <line x1={O.x} y1={O.y} x2={P.x} y2={P.y} stroke={C_OMBRE} strokeWidth={7} strokeLinecap="round" opacity={0.85} />
        )}
        {/* À l'angle droit, l'ombre est réduite à un point : on le marque, sans
            quoi « elle a disparu » se lirait comme « le dessin a un bug ». */}
        {droit && <circle cx={O.x} cy={O.y} r={7} fill="none" stroke={C_OMBRE} strokeWidth={2.5} />}
      </g>
    );
  };

  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 ' +
    'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  const sensOmbre = ombre > 1e-9 ? 'dans le sens de u' : ombre < -1e-9 ? 'à l’opposé de u' : 'réduite à un point';

  return (
    <div className="space-y-3">
      <CoordPlane
        range={RANGE}
        unit={28}
        xStep={1}
        yStep={1}
        labelEvery={2}
        // AUCUN `label` sur les flèches : le décalage fixe de CoordPlane
        // ferait se chevaucher « u » et « v » dès que l'angle devient petit.
        // Les noms sont dans la LÉGENDE DOM ci-dessous.
        arrows={[
          { id: 'u', from: ORIGINE, to: { x: u.x, y: u.y }, color: C_U, width: 3.5 },
          { id: 'v', from: ORIGINE, to: bout, color: C_V, width: 3.5 },
        ]}
        points={[{ id: 'O', x: ORIGINE.x, y: ORIGINE.y, color: '#0f172a' }]}
        overlay={overlay}
        caption={false}
        disabled
        ariaLabel={
          `Deux flèches partant de l’origine. La première, u, a pour coordonnées ${frVec(u)} ` +
          `et pour longueur ${fr(norm(u))}. La seconde, v, a pour coordonnées ${frVec(v)}. ` +
          `L’angle entre les deux vaut ${fr(angle)} degrés. L’ombre de v sur la direction de u ` +
          `mesure ${fr(ombre)}, ${sensOmbre}. Les deux calculs donnent ${fr(parCoord)}.`
        }
      />

      {/* LA LÉGENDE : elle remplace les étiquettes SVG, qui se chevaucheraient
          quand les deux flèches se rapprochent. */}
      <div className="flex flex-wrap items-center gap-3 text-[13px]">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-4 h-1.5 rounded-full" style={{ background: C_U }} aria-hidden="true" />
          <strong>u</strong> {montrerCoordonnees ? frVec(u) : ''} <span className="text-slate-500">— fixe</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-4 h-1.5 rounded-full" style={{ background: C_V }} aria-hidden="true" />
          <strong>v</strong> {montrerCoordonnees ? frVec(v) : ''} <span className="text-slate-500">— tu la fais tourner</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-4 h-2 rounded-full" style={{ background: C_OMBRE }} aria-hidden="true" />
          <span className="text-slate-600">l’ombre de v sur la direction de u</span>
        </span>
      </div>

      {/* Les trois nombres de la figure, dans le DOM. */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
          <div className="text-[13px] text-slate-500">angle</div>
          <div className="font-mono font-bold tabular-nums text-slate-900">{fr(angle)}°</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
          <div className="text-[13px] text-slate-500">longueur de u</div>
          <div className="font-mono font-bold tabular-nums text-slate-900">{fr(norm(u))}</div>
        </div>
        <div className={`rounded-lg border-2 px-2 py-2 ${ombre < -1e-9 ? 'border-rose-300 bg-rose-50' : ombre > 1e-9 ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 bg-slate-100'}`}>
          <div className="text-[13px] text-teal-700">ombre signée</div>
          <div className="font-mono font-black tabular-nums text-teal-900">{fr(ombre)}</div>
        </div>
      </div>

      {/* LES DEUX AFFICHEURS INDÉPENDANTS, côte à côte dans le DOM. Chacun est
          calculé par SA recette : le premier ne consulte jamais les
          coordonnées, le second ne consulte jamais l'ombre. */}
      {montrerAfficheurs && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="rounded-xl border-2 border-teal-300 bg-teal-50 p-3" data-testid="afficheur-ombre">
            <div className="text-[13px] font-semibold text-teal-800">‖u‖ × (ombre signée)</div>
            <div className="font-mono text-xs text-teal-700 mt-0.5">
              {fr(norm(u))} × {fr(ombre)}
            </div>
            <div className="font-mono text-2xl font-black tabular-nums text-teal-900 mt-1">{fr(parOmbre)}</div>
          </div>
          <div className="rounded-xl border-2 border-indigo-300 bg-indigo-50 p-3" data-testid="afficheur-coordonnees">
            <div className="text-[13px] font-semibold text-indigo-800">x<sub>u</sub>·x<sub>v</sub> + y<sub>u</sub>·y<sub>v</sub></div>
            <div className="font-mono text-xs text-indigo-700 mt-0.5">
              {fr(u.x)} × {fr(v.x)} + {fr(u.y)} × {fr(v.y)}
            </div>
            <div className="font-mono text-2xl font-black tabular-nums text-indigo-900 mt-1">{fr(parCoord)}</div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Faire tourner la flèche v">
        <button
          type="button" className={btn} disabled={disabled}
          onClick={() => onChangeK?.(((k - 1) % CRANS + CRANS) % CRANS)}
          aria-label={`Tourner v de ${PAS_DEG} degrés en arrière`}
        >
          ↺ −{PAS_DEG}°
        </button>
        <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold tabular-nums text-sm">
          angle = {fr(angle)}°
        </span>
        <button
          type="button" className={btn} disabled={disabled}
          onClick={() => onChangeK?.((k + 1) % CRANS)}
          aria-label={`Tourner v de ${PAS_DEG} degrés en avant`}
        >
          tourner +{PAS_DEG}° ↻
        </button>
        {droit && (
          <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 text-[13px] font-semibold">
            angle droit — les deux afficheurs valent 0
          </span>
        )}
      </div>

      {/* L'historique : la SUITE des valeurs est ce qui fait la découverte, pas
          la dernière. Il est en DOM et se lit au lecteur d'écran. */}
      {visites.length > 1 && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
          <div className="text-[13px] font-semibold text-indigo-900 mb-2">Les angles déjà visités</div>
          <ul className="flex flex-wrap gap-2">
            {visites.map((kv) => {
              const vv = vAuCran(kv);
              return (
                <li key={kv} className="rounded-lg bg-white border border-indigo-200 px-2.5 py-1 font-mono text-[13px] tabular-nums">
                  {fr(angleAuCran(kv))}° → <strong>{fr(produitCoordonnees(u, vv))}</strong>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
