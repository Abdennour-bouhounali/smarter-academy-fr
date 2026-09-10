import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import {
  RANGE, SOMMETS, PAS, deplacer, angles, cotes, nature, natureTexte, fr, frVec,
} from './theodoliteUtils';

/**
 * TheodoliteLab — l'interaction SIGNATURE : « Le théodolite ».
 *
 * Activity               un TRIANGLE dont l'élève déplace les trois sommets au
 *                        cliquet, d'une case entière à la fois. Le panneau de
 *                        droite est un INSTRUMENT DE MESURE : trois angles,
 *                        trois longueurs, et une pastille de NATURE qui se met
 *                        à jour en direct.
 * Mathematical objective une seule opération mesure les angles ET les
 *                        longueurs — le produit scalaire remplace le rapporteur
 *                        et la règle d'un coup.
 * Student action         choisir un sommet, puis appuyer sur ←↑↓→ (cliquet
 *                        entier, jamais un curseur : l'angle droit doit être
 *                        EXACT, et il ne l'est qu'à coordonnées entières).
 * Controlled variable    les trois sommets. Tout le reste — angles, longueurs,
 *                        nature — en est DÉRIVÉ, jamais stocké.
 * Mathematical state     { A, B, C } à coordonnées entières.
 * Visual consequence     la figure se déforme, les six mesures bougent
 *                        ensemble, et la pastille change de mot.
 * Expected observation   « quand la pastille dit rectangle, un produit scalaire
 *                        vaut exactement 0 — et pas 0,003 ».
 * Misconception targeted « il faut un rapporteur pour mesurer un angle » ;
 *                        « ça a l'air rectangle, donc ça l'est » ; « le produit
 *                        scalaire ne sert qu'à détecter l'angle droit ».
 *
 * ─── DISTINCTION AVEC LA LEÇON AMONT ──────────────────────────────────
 * `produit-scalaire-definir-1ere` fait TOURNER une flèche autour d'un point
 * fixe et lire UN nombre. Ici l'élève DÉFORME une figure et lit une
 * CLASSIFICATION. Un cliquet angulaire d'un côté, un déplacement sur la grille
 * de l'autre : les deux mécanismes ne se ressemblent pas, et c'est voulu.
 *
 * ─── ÉTIQUETTES EN LÉGENDE DOM, JAMAIS EN <text> SVG ──────────────────
 * Deux sommets peuvent être à UNE case l'un de l'autre — et l'un peut passer
 * derrière l'autre au cran suivant. Des noms « A », « B », « C » posés dans le
 * SVG, avec le décalage fixe de CoordPlane, se chevaucheraient alors
 * nécessairement. Les noms, les coordonnées, les six mesures et la pastille
 * vivent donc TOUS dans le DOM sous la figure, où l'écart entre deux sommets
 * peut tendre vers zéro sans rendre l'affichage illisible. Le balayage de
 * 200 marches est un test (theodoliteUtils.test.js).
 *
 * ─── LES CARRÉS SONT LA VÉRITÉ, LES LONGUEURS L'APPROXIMATION ─────────
 * Le panneau affiche pour chaque côté son CARRÉ SCALAIRE (entier, exact) ET sa
 * longueur (racine, arrondie). C'est le carré qui décide de l'isocélie :
 * « 10,3 = 10,44 » à l'œil ne prouverait rien, 106 ≠ 109 si.
 *
 * ─── JAMAIS GELÉ APRÈS RÉUSSITE ──────────────────────────────────────
 * `disabled` ne sert qu'au verrou d'ANTÉRIORITÉ d'une étape sur la précédente.
 * Un élève qui vient d'atteindre sa cible doit pouvoir continuer à déformer la
 * figure — c'est précisément là qu'il comprend pourquoi elle la perd.
 */
const TONS = {
  A: '#7c3aed',
  B: '#0284c7',
  C: '#d97706',
  trait: '#4f46e5',
  fond: '#c7d2fe',
  droit: '#059669',
};

const PASTILLE = {
  'rectangle-isocele': { fond: 'bg-emerald-100', bord: 'border-emerald-400', texte: 'text-emerald-900', mot: 'rectangle ET isocèle' },
  rectangle: { fond: 'bg-sky-100', bord: 'border-sky-400', texte: 'text-sky-900', mot: 'rectangle' },
  isocele: { fond: 'bg-violet-100', bord: 'border-violet-400', texte: 'text-violet-900', mot: 'isocèle' },
  quelconque: { fond: 'bg-slate-100', bord: 'border-slate-300', texte: 'text-slate-700', mot: 'quelconque' },
};

export default function TheodoliteLab({
  triangle,
  onChange,
  sommetActif = 'A',
  onSommetActif,
  disabled = false,
  montrerAngles = true,
  montrerLongueurs = true,
  montrerPastille = true,
  montrerProduits = true,
}) {
  const t = triangle;
  const mesAngles = angles(t);
  const mesCotes = cotes(t);
  const nat = nature(t);
  const past = PASTILLE[nat.code];

  const bouger = (dx, dy) => {
    const suivant = deplacer(t, sommetActif, dx, dy);
    if (suivant !== t) onChange?.(suivant);
  };

  /**
   * Le marqueur d'angle droit : le petit carré, dessiné SEULEMENT quand le
   * produit scalaire vaut exactement 0. Il n'est pas décoratif — il est la
   * traduction visuelle d'un entier nul, et il disparaît au cran suivant.
   */
  const overlay = (toSvg) => (
    <g pointerEvents="none">
      {mesAngles
        .filter((a) => a.produit === 0)
        .map((a) => {
          const S = t[a.id];
          const O = toSvg(S.x, S.y);
          const bras = (v) => {
            const n = Math.hypot(v.x, v.y) || 1;
            const P = toSvg(S.x + (v.x / n) * 0.8, S.y + (v.y / n) * 0.8);
            return { x: P.x - O.x, y: P.y - O.y };
          };
          const u = bras(a.u);
          const w = bras(a.v);
          return (
            <polyline
              key={a.id}
              points={`${O.x + u.x},${O.y + u.y} ${O.x + u.x + w.x},${O.y + u.y + w.y} ${O.x + w.x},${O.y + w.y}`}
              fill="none"
              stroke={TONS.droit}
              strokeWidth={2.5}
            />
          );
        })}
      {/* La couronne autour du sommet actif : l'élève doit voir CE qu'il pilote. */}
      {(() => {
        const S = t[sommetActif];
        const P = toSvg(S.x, S.y);
        return <circle cx={P.x} cy={P.y} r={11} fill="none" stroke={TONS[sommetActif]} strokeWidth={2.5} strokeDasharray="3 3" />;
      })()}
    </g>
  );

  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 '
    + 'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  const onglet = (s) =>
    'min-h-[44px] px-4 rounded-lg text-sm font-bold border-2 transition '
    + 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 '
    + (sommetActif === s ? 'text-white' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300');

  return (
    <div className="space-y-3">
      <CoordPlane
        range={RANGE}
        unit={26}
        xStep={1}
        yStep={1}
        labelEvery={2}
        polygons={[{ id: 'tri', points: [t.A, t.B, t.C], fill: TONS.fond, fillOpacity: 0.3, stroke: TONS.trait, strokeWidth: 2.5 }]}
        // AUCUN `label` sur les sommets : deux d'entre eux peuvent être à une
        // case l'un de l'autre, et le décalage fixe de CoordPlane ferait se
        // chevaucher leurs noms. Ils vivent dans la LÉGENDE DOM ci-dessous.
        points={SOMMETS.map((s) => ({ id: s, x: t[s].x, y: t[s].y, color: TONS[s] }))}
        overlay={overlay}
        caption={false}
        disabled
        ariaLabel={
          `Un triangle de sommets A ${frVec(t.A)}, B ${frVec(t.B)} et C ${frVec(t.C)}. `
          + `Ses angles mesurent ${mesAngles.map((a) => `${a.id} : ${fr(a.deg)} degrés`).join(', ')}. `
          + `Ses côtés mesurent ${mesCotes.map((c) => `${c.id} : ${fr(c.longueur)}`).join(', ')}. `
          + `Ce triangle est ${natureTexte(t)}. Le sommet piloté est ${sommetActif}.`
        }
      />

      {/* LA LÉGENDE : elle remplace les étiquettes SVG, qui se chevaucheraient
          dès que deux sommets se rapprochent. */}
      <div className="flex flex-wrap items-center gap-3 text-[13px]">
        {SOMMETS.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: TONS[s] }} aria-hidden="true" />
            <strong>{s}</strong> {frVec(t[s])}
          </span>
        ))}
      </div>

      {/* ── L'INSTRUMENT ────────────────────────────────────────────── */}
      {montrerAngles && (
        <div>
          <div className="text-[13px] font-semibold text-slate-600 mb-1">
            Les trois angles — chacun lu par cos = (u · v) / (‖u‖ × ‖v‖)
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {mesAngles.map((a) => (
              <div
                key={a.id}
                data-testid={`angle-${a.id}`}
                className={`rounded-lg border-2 px-2 py-2 ${a.produit === 0 ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white'}`}
              >
                <div className="text-[13px]" style={{ color: TONS[a.id] }}>angle en <strong>{a.id}</strong></div>
                <div className="font-mono font-black tabular-nums text-slate-900">{fr(a.deg)}°</div>
                {montrerProduits && (
                  <div className="font-mono text-xs text-slate-500 tabular-nums">produit = {fr(a.produit)}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {montrerLongueurs && (
        <div>
          <div className="text-[13px] font-semibold text-slate-600 mb-1">
            Les trois longueurs — chacune lue par ‖AB‖² = AB · AB
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {mesCotes.map((c) => (
              <div key={c.id} data-testid={`cote-${c.id}`} className="rounded-lg border border-slate-200 bg-white px-2 py-2">
                <div className="text-[13px] text-slate-500">côté <strong>{c.id}</strong></div>
                <div className="font-mono font-black tabular-nums text-slate-900">{fr(c.longueur)}</div>
                {/* Le CARRÉ est la valeur exacte ; c'est lui qui décide de
                    l'isocélie. La longueur n'en est que la racine arrondie. */}
                <div className="font-mono text-xs text-slate-500 tabular-nums">carré = {c.carre}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {montrerPastille && (
        <div
          data-testid="pastille-nature"
          className={`rounded-xl border-2 px-4 py-3 text-center ${past.fond} ${past.bord} ${past.texte}`}
        >
          <div className="text-[13px] font-semibold opacity-80">nature du triangle</div>
          <div className="text-lg font-black">{past.mot}</div>
          <div className="text-xs opacity-80">
            {nat.code === 'quelconque'
              ? 'aucun produit scalaire nul, aucun couple de carrés égaux'
              : natureTexte(t)}
          </div>
        </div>
      )}

      {/* ── LE CLIQUET ──────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Choisir le sommet à déplacer">
          <span className="text-[13px] text-slate-600">sommet piloté :</span>
          {SOMMETS.map((s) => (
            <button
              key={s}
              type="button"
              className={onglet(s)}
              style={sommetActif === s ? { background: TONS[s], borderColor: TONS[s] } : undefined}
              onClick={() => onSommetActif?.(s)}
              aria-pressed={sommetActif === s}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap" role="group" aria-label={`Déplacer le sommet ${sommetActif} d’une case`}>
          {PAS.map((p) => (
            <button
              key={p.label}
              type="button"
              className={btn}
              disabled={disabled || deplacer(t, sommetActif, p.dx, p.dy) === t}
              onClick={() => bouger(p.dx, p.dy)}
              aria-label={`Déplacer ${sommetActif} vers ${p.label === '→' ? 'la droite' : p.label === '←' ? 'la gauche' : p.label === '↑' ? 'le haut' : 'le bas'}`}
            >
              {p.label}
            </button>
          ))}
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold tabular-nums text-sm">
            {sommetActif} {frVec(t[sommetActif])}
          </span>
        </div>
      </div>
    </div>
  );
}
