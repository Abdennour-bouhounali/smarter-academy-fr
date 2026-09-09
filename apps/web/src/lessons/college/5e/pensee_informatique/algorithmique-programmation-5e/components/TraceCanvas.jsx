import React, { useMemo } from 'react';
import { cadre, toSvg, arrondi } from './trace';

/**
 * TraceCanvas — la feuille sur laquelle KIWI dessine.
 *
 * PURE PRÉSENTATION : reçoit un résultat d'`executer()` et le dessine. Aucune
 * exécution ici — le moteur (trace.js) est la seule source de vérité, et deux
 * canevas côte à côte montrant le même résultat sont donc identiques par
 * construction (c'est ce dont le module 4 a besoin pour prouver que la boucle
 * ne change pas le dessin).
 *
 * SÉCURITÉ VISUELLE (playbook §17bis, INTERACTION_PEDAGOGY §6bis.4).
 * Le viewBox est DÉRIVÉ du tracé (`cadre`), jamais fixé : un côté de 200 pas
 * comme un côté de 10 pas remplissent la même boîte, sans jamais déborder —
 * ce qu'un test unitaire vérifie pour tout n de 3 à 12. Le cadre peut être
 * IMPOSÉ (`cadreImpose`) quand deux figures doivent être comparables : sans
 * cela, deux carrés de tailles différentes paraîtraient identiques, et la
 * comparaison mentirait (règle de l'invariant visuel).
 *
 * Rien n'est écrit en SVG <text> sauf les repères de côté, dont la place est
 * calculée sur la normale du segment ; les nombres de lecture vivent dans le
 * DOM, hors du dessin.
 */
export default function TraceCanvas({
  resultat,
  cadreImpose = null,
  jusqua = null,          // n'afficher que les `jusqua` premiers segments (exécution pas à pas)
  hauteur = 240,
  montrerDepart = true,
  montrerStylo = true,
  montrerLongueurs = false,
  surlignerTour = null,   // met en avant les segments d'un tour de boucle donné
  titre = 'Le tracé de KIWI',
  fond = 'quadrillage',   // 'quadrillage' | 'uni'
}) {
  const c = cadreImpose ?? cadre(resultat);
  const segments = jusqua == null ? resultat.segments : resultat.segments.slice(0, jusqua);

  // Position du stylo : après le dernier segment affiché, sinon au départ.
  const posStylo = useMemo(() => {
    if (jusqua == null) return resultat.final;
    if (jusqua <= 0) return resultat.depart;
    const s = resultat.segments[Math.min(jusqua, resultat.segments.length) - 1];
    return s ? { x: s.x2, y: s.y2 } : resultat.depart;
  }, [resultat, jusqua]);

  const P = (x, y) => toSvg(c, x, y);
  const dep = P(resultat.depart.x, resultat.depart.y);
  const sty = P(posStylo.x, posStylo.y);

  // Le pas de quadrillage suit l'échelle du dessin : jamais plus de ~14 lignes,
  // sinon la feuille devient un moiré illisible sur un grand tracé.
  const pas = useMemo(() => {
    const brut = Math.max(c.largeur, c.hauteur) / 12;
    const jolis = [5, 10, 20, 25, 50, 100, 200];
    return jolis.find((p) => p >= brut) ?? 500;
  }, [c.largeur, c.hauteur]);

  const gid = `grille-${arrondi(pas)}`;

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-2 sm:p-3">
      <svg
        viewBox={`0 0 ${c.largeur} ${c.hauteur}`}
        style={{ width: '100%', height: hauteur }}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`${titre} — ${segments.length} segment${segments.length > 1 ? 's' : ''} tracé${segments.length > 1 ? 's' : ''}`}
      >
        {fond === 'quadrillage' && (
          <>
            <defs>
              <pattern id={gid} width={pas} height={pas} patternUnits="userSpaceOnUse">
                <path d={`M ${pas} 0 L 0 0 0 ${pas}`} fill="none" stroke="#e2e8f0" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width={c.largeur} height={c.hauteur} fill={`url(#${gid})`} />
          </>
        )}

        {segments.map((s) => {
          const a = P(s.x1, s.y1);
          const b = P(s.x2, s.y2);
          const vif = surlignerTour != null && s.tour === surlignerTour;
          return (
            <line
              key={s.ordre}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={vif ? '#f59e0b' : '#4f46e5'}
              strokeWidth={vif ? 5 : 3.5}
              strokeLinecap="round"
            />
          );
        })}

        {montrerLongueurs &&
          segments.map((s) => {
            const a = P(s.x1, s.y1);
            const b = P(s.x2, s.y2);
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            // Décalage sur la NORMALE du segment : l'étiquette ne s'assoit
            // jamais sur le trait, quel que soit l'angle du côté.
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const n = Math.hypot(dx, dy) || 1;
            const d = Math.max(11, c.largeur / 22);
            const long = Math.round(Math.hypot(s.x2 - s.x1, s.y2 - s.y1));
            return (
              <text
                key={`l-${s.ordre}`}
                x={mx - (dy / n) * d}
                y={my + (dx / n) * d}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.max(11, c.largeur / 26)}
                fill="#4338ca"
                fontWeight="700"
              >
                {long}
              </text>
            );
          })}

        {montrerDepart && (
          <circle cx={dep.x} cy={dep.y} r={Math.max(4, c.largeur / 60)} fill="#10b981" stroke="#065f46" strokeWidth="2" />
        )}

        {montrerStylo && (
          <circle cx={sty.x} cy={sty.y} r={Math.max(5, c.largeur / 50)} fill="#f97316" stroke="#7c2d12" strokeWidth="2" />
        )}
      </svg>
    </div>
  );
}
