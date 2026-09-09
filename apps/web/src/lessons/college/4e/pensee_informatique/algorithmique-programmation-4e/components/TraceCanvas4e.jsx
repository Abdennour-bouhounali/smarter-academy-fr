import React, { useMemo } from 'react';
import { cadre, toSvg, arrondi } from '../../../../../common/turtle/trace4e';

/**
 * TraceCanvas4e — la feuille sur laquelle KIWI dessine, version 4e.
 *
 * Activity               afficher le tracé produit par un programme, y compris
 *                        À MI-EXÉCUTION.
 * Mathematical objective rendre visible l'ÉTAT d'un programme à un instant
 *                        donné, et non son seul résultat final.
 * Student action         aucune : composant de présentation pure.
 * Expected observation   « le dessin s'arrête là où le programme en est ».
 * Misconception targeted croire qu'un programme n'a d'existence qu'une fois
 *                        fini — d'où l'impossibilité de le déboguer.
 *
 * PURE PRÉSENTATION : reçoit soit un résultat d'`executer()`, soit une liste
 * de segments déjà calculée (`segments`, ce que `executerPasAPas` fournit dans
 * `segmentsJusquIci`). Aucune exécution ici : le moteur
 * (lessons/common/turtle/trace4e.js) reste la seule source de vérité, et deux
 * canevas montrant le même état sont identiques par construction.
 *
 * CE QUE LA 4e AJOUTE AU CANEVAS DE 5e, ET RIEN D'AUTRE :
 *  1. `segments` peut être fourni directement — le pas-à-pas n'a pas à
 *     tronquer un résultat, il a déjà sa liste ;
 *  2. `teinterBranches` colore un trait selon la BRANCHE qui l'a produit
 *     (`s.branche`), ce qui rend le choix visible dans le dessin lui-même ;
 *  3. `stylo` accepte une position imposée, celle du pas courant, avec son
 *     CAP — une petite flèche montre où le stylo regarde, sans quoi « le
 *     programme a tourné » resterait invisible.
 *
 * SÉCURITÉ VISUELLE (playbook §17bis, INTERACTION_PEDAGOGY §6bis.4).
 * Le viewBox est DÉRIVÉ du tracé COMPLET (`cadre(resultat)`), jamais fixé et
 * jamais recalculé sur les seuls segments déjà tracés : sans cela, la figure
 * « sauterait » à chaque pas parce que son cadre grandirait sous elle. Un test
 * de `parcours.test.js` vérifie que tout point atteint tient dans ce cadre,
 * pour chaque pas de chaque programme de la leçon.
 *
 * Aucun nombre n'est écrit en SVG <text> : les lectures (position, cap,
 * variables) vivent dans le DOM, chez l'appelant.
 */
export default function TraceCanvas4e({
  resultat,
  segments = null,        // segments à dessiner ; par défaut, tous ceux du résultat
  cadreImpose = null,     // pour comparer deux figures à la même échelle
  stylo = null,           // { x, y, cap } — la position du pas courant
  hauteur = 240,
  montrerDepart = true,
  montrerStylo = true,
  teinterBranches = false,
  titre = 'Le tracé de KIWI',
  fond = 'quadrillage',   // 'quadrillage' | 'uni'
}) {
  const c = cadreImpose ?? cadre(resultat);
  const traces = segments ?? resultat.segments;

  // Position du stylo : celle imposée par le pas courant, sinon la fin du
  // dernier segment tracé, sinon le départ.
  const pos = useMemo(() => {
    if (stylo) return stylo;
    const dernier = traces[traces.length - 1];
    return dernier ? { x: dernier.x2, y: dernier.y2, cap: resultat.final.cap } : resultat.depart;
  }, [stylo, traces, resultat]);

  const P = (x, y) => toSvg(c, x, y);
  const dep = P(resultat.depart.x, resultat.depart.y);
  const sty = P(pos.x, pos.y);

  // Le pas du quadrillage suit l'échelle du dessin : jamais plus de ~14
  // lignes, sinon la feuille devient un moiré illisible sur un grand tracé.
  const pas = useMemo(() => {
    const brut = Math.max(c.largeur, c.hauteur) / 12;
    const jolis = [5, 10, 20, 25, 50, 100, 200];
    return jolis.find((p) => p >= brut) ?? 500;
  }, [c.largeur, c.hauteur]);

  const gid = `g4-${arrondi(pas)}-${arrondi(c.largeur)}`;
  const rStylo = Math.max(5, c.largeur / 50);

  // La flèche du cap. Sa longueur suit l'échelle, PUIS elle est raccourcie
  // pour que sa pointe reste dans le cadre : le stylo peut être posé sur le
  // bord (le cadre borne les segments avec une marge fixe), et une flèche de
  // longueur constante en sortirait — un débordement réel, attrapé par le
  // test de sécurité visuelle de parcours.test.js.
  const fleche = useMemo(() => {
    const cap = pos.cap;
    if (cap == null) return null;
    const rad = (cap * Math.PI) / 180;
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);
    let L = Math.max(14, c.largeur / 14);
    // Distance au bord dans la direction visée, en coordonnées élève.
    const marge = 2;
    if (dx > 1e-9) L = Math.min(L, (c.maxX - marge - pos.x) / dx);
    if (dx < -1e-9) L = Math.min(L, (c.minX + marge - pos.x) / dx);
    if (dy > 1e-9) L = Math.min(L, (c.maxY - marge - pos.y) / dy);
    if (dy < -1e-9) L = Math.min(L, (c.minY + marge - pos.y) / dy);
    if (!(L > 0)) return null;
    // y monte chez l'élève ; toSvg inverse. On calcule en coordonnées élève
    // puis on projette, pour que le sens du cap ne soit jamais écrit deux fois.
    const bout = P(pos.x + L * dx, pos.y + L * dy);
    return { x1: sty.x, y1: sty.y, x2: bout.x, y2: bout.y };
  }, [pos, c.largeur, c.minX, c.maxX, c.minY, c.maxY, sty.x, sty.y]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-2 sm:p-3">
      <svg
        viewBox={`0 0 ${c.largeur} ${c.hauteur}`}
        style={{ width: '100%', height: hauteur }}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`${titre} — ${traces.length} segment${traces.length > 1 ? 's' : ''} tracé${traces.length > 1 ? 's' : ''}`}
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

        {traces.map((s) => {
          const a = P(s.x1, s.y1);
          const b = P(s.x2, s.y2);
          // Un trait produit par la branche « alors » et un trait produit par
          // la branche « sinon » ne se ressemblent pas : le CHOIX se lit dans
          // la figure, pas seulement dans le programme.
          const couleur = !teinterBranches || !s.branche
            ? '#4f46e5'
            : s.branche === 'alors' ? '#059669' : '#e11d48';
          return (
            <line
              key={s.ordre}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={couleur}
              strokeWidth={3.5}
              strokeLinecap="round"
            />
          );
        })}

        {montrerDepart && (
          <circle cx={dep.x} cy={dep.y} r={Math.max(4, c.largeur / 60)} fill="#10b981" stroke="#065f46" strokeWidth="2" />
        )}

        {montrerStylo && fleche && (
          <line
            x1={fleche.x1} y1={fleche.y1} x2={fleche.x2} y2={fleche.y2}
            stroke="#7c2d12" strokeWidth={Math.max(2, c.largeur / 200)} strokeLinecap="round"
          />
        )}
        {montrerStylo && (
          <circle cx={sty.x} cy={sty.y} r={rStylo} fill="#f97316" stroke="#7c2d12" strokeWidth="2" />
        )}
      </svg>
    </div>
  );
}
