import React, { useCallback, useState } from 'react';
import GeoScene, { Dot, Handle, Poly, dotObstacles, polyObstacles } from '../../../../../common/geo5e/GeoScene';
import { Grille, Fleche, Trajets, Mesure, carreaux, W, H } from './scene4e';
import {
  PAS, fr, glissement, translater, demiTour, trajetsConcordants, auNoeud,
} from './translation4e';

/**
 * GlissementLab — LA manipulation signature de la leçon (§6bis).
 *
 * ─── CE QUE L'ÉLÈVE MANIPULE ──────────────────────────────────────────────
 * La FLÈCHE DU GLISSEMENT elle-même. Pas un curseur « longueur », pas un
 * curseur « angle », pas de boutons + / − : une poignée à la pointe de la
 * flèche, qu'on tire où l'on veut. C'est le seul geste qui rende les trois
 * caractères INSÉPARABLES — direction, sens et longueur changent ensemble
 * parce qu'ils sont trois lectures du même objet, et deux curseurs auraient
 * enseigné l'inverse.
 *
 * Activity              tirer la flèche ; la copie suit en direct.
 * Mathematical objective un glissement du plan est décrit par une direction,
 *                       un sens et une longueur, et TOUS les points font
 *                       exactement le même trajet.
 * Student action        glisser la pointe de la flèche (souris, doigt, ou
 *                       flèches du clavier).
 * Controlled variable   la pointe de la flèche — rien d'autre.
 * Mathematical state    (origine, pointe) ; le glissement, la copie et les
 *                       cinq trajets en sont DÉRIVÉS à chaque rendu.
 * Visual consequence    la copie se déplace, et les cinq traits [M M']
 *                       restent parallèles et de même longueur, quoi qu'on
 *                       fasse.
 * Expected observation  « les traits ne se croisent jamais » — puis, en
 *                       basculant sur le demi-tour de 5e, « là, ils se
 *                       croisent tous au même endroit ».
 * Misconception targeted croire que la copie a tourné (elle n'a pas tourné :
 *                       la comparaison avec le demi-tour le montre) ; croire
 *                       que la longueur suffit à décrire le déplacement (le
 *                       sens change sans que la longueur bouge).
 * Formalization         aucune ici. Le mot est posé au module suivant, une
 *                       fois le geste fait.
 *
 * ─── DEUX PIÈGES QUI COÛTENT DES CYCLES DE MISE AU POINT ──────────────────
 * 1. `setPointerCapture` dans `onPointerDown`. Sans lui, le premier
 *    `pointermove` sort de la poignée et le glisser se fige au premier pixel.
 * 2. LA CIBLE TACTILE SE MESURE, elle ne se devine pas. Ce cadre fait 760
 *    unités de large et se rend sur ≈ 263 px à 375 px de large (le module a
 *    ses marges) : le facteur est donc ≈ 0,346, et les 44 px du §17 exigent
 *    44 / 0,346 ≈ 127 unités de DIAMÈTRE, soit un `hitR` de 64 unités. On
 *    prend 68, avec la marge.
 *
 * ─── RIEN NE SE FIGE ──────────────────────────────────────────────────────
 * Aucun `disabled` : une fois l'étape validée, la flèche reste saisissable.
 * C'est après avoir trouvé qu'on essaie « et si… ? ».
 */

/** Le rayon de saisie, MESURÉ (voir l'en-tête) et non deviné. */
const HIT_R = 68;

/** L'origine de la flèche : hors de la figure (qui s'arrête à x = 240), et
 *  assez centrée pour laisser à la pointe ~10 carreaux de course horizontale
 *  et ~6 verticale une fois la copie contrainte au cadre. */
const ORIGINE = { x: 360, y: 240 };

export default function GlissementLab({
  figure,
  pointe,
  onPointe,
  /** 'glissement' (défaut) ou 'demi-tour' — le contraste du module 1. */
  geste = 'glissement',
  centreDemiTour = { x: 400, y: 280 },
  montrerTrajets = true,
  aimanter = true,
  nomsSommets = ['A', 'B', 'C', 'D', 'E'],
  ariaLabel = 'Laboratoire du glissement',
}) {
  const [drag, setDrag] = useState(false);

  const g = glissement({ dx: pointe.x - ORIGINE.x, dy: pointe.y - ORIGINE.y });
  const enGlissement = geste === 'glissement';
  // La copie est TOUJOURS calculée par le noyau, jamais dessinée « à peu
  // près » : ce que l'élève voit est exactement ce que les tests mesurent.
  const image = enGlissement ? translater(figure, g) : demiTour(figure, centreDemiTour);
  const concordants = trajetsConcordants(figure, image);

  /* LA BORNE N'EST PAS CELLE DE LA POIGNÉE : C'EST CELLE DE LA COPIE.
     Deux contraintes, et la plus serrée gagne :
       1. le cercle de SAISIE (68 unités de rayon) doit rester dans le
          viewBox — sinon il déborde de <main>, ce que l'audit attrape ;
       2. surtout, LA COPIE ENTIÈRE doit rester visible. Une pointe libre
          dans tout le cadre envoyait la copie du drapeau à x = 812 sur un
          viewBox de 760 : l'élève tirait la flèche et sa figure disparaissait
          par le bord, ce qu'aucun test de source ne voit. La suite navigateur
          l'a attrapé sur un simple glisser vers le bas à droite.
     On calcule donc, à partir de la boîte de la figure, le déplacement
     maximal admissible dans chaque direction — pour CETTE figure, quelle
     qu'elle soit. */
  const bbox = {
    minX: Math.min(...figure.map((p) => p.x)),
    maxX: Math.max(...figure.map((p) => p.x)),
    minY: Math.min(...figure.map((p) => p.y)),
    maxY: Math.max(...figure.map((p) => p.y)),
  };
  const MARGE = 24;                       // la copie garde un liseré visible
  const borner = (p) => {
    // Bornes du DÉPLACEMENT pour que la copie tienne dans le cadre…
    const dxMin = MARGE - bbox.minX;
    const dxMax = W - MARGE - bbox.maxX;
    const dyMin = MARGE - bbox.minY;
    const dyMax = H - MARGE - bbox.maxY;
    // …traduites en bornes pour la POINTE (pointe = origine + déplacement).
    const x = Math.min(
      Math.max(p.x, Math.max(HIT_R, ORIGINE.x + dxMin)),
      Math.min(W - HIT_R, ORIGINE.x + dxMax),
    );
    const y = Math.min(
      Math.max(p.y, Math.max(HIT_R, ORIGINE.y + dyMin)),
      Math.min(H - HIT_R, ORIGINE.y + dyMax),
    );
    return { x, y };
  };

  const deplacer = useCallback((p) => {
    if (!p || !drag) return;
    const q = borner(p);
    // L'aimantation aux nœuds rend les longueurs COMPTABLES : « 8 carreaux à
    // droite et 2 vers le haut » est une phrase que l'élève peut dire, alors
    // que 7,93 n'en est pas une.
    onPointe?.(aimanter ? borner(auNoeud(q)) : q);
  }, [drag, onPointe, aimanter]);

  const prendre = (e) => {
    // SANS CECI, LE GLISSER SE FIGE AU PREMIER PIXEL.
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
  };

  /* Le chemin clavier — une manipulation à part entière (§27). Un cran vaut
     un carreau, exactement comme l'aimantation à la souris. */
  const auClavier = (e) => {
    const pas = e.shiftKey ? PAS * 2 : PAS;
    const d = {
      ArrowRight: { x: pas, y: 0 }, ArrowLeft: { x: -pas, y: 0 },
      ArrowUp: { x: 0, y: -pas }, ArrowDown: { x: 0, y: pas },
    }[e.key];
    if (!d) return;
    e.preventDefault();
    onPointe?.(borner({ x: pointe.x + d.x, y: pointe.y + d.y }));
  };

  /* ON NE NOMME QUE DEUX POINTS, et c'est un choix mesuré.
     Nommer les cinq sommets ET leurs cinq images donnait dix étiquettes à
     placer sur une scène où les deux polygones et leurs cinq trajets sont
     déjà des obstacles : `placeLabels` n'y trouvait plus de place libre et
     posait C’, D’ et E’ les unes sur les autres — la suite navigateur l'a
     attrapé. Or le module 1 ne demande rien à ces noms : il demande de
     REGARDER LES TRAITS. Un seul couple nommé (A et son image) suffit à dire
     « chaque point a une image », et la correspondance des autres se lit sur
     les traits eux-mêmes. Les noms complets reviennent aux modules 3 et 5,
     où l'on construit sommet par sommet et où ils servent vraiment. */
  const labels = [
    { id: 's0', text: nomsSommets[0] ?? 'A', anchor: figure[0], color: '#334155', size: 21, priority: true },
    { id: 'i0', text: `${nomsSommets[0] ?? 'A'}’`, anchor: image[0], color: '#7c3aed', size: 21, priority: true },
  ];

  const obstacles = [
    ...polyObstacles(figure),
    ...polyObstacles(image),
    ...dotObstacles([...figure, ...image], 14),
    ...dotObstacles([ORIGINE, pointe], 22),
  ];

  return (
    <div
      className="rounded-2xl border-2 border-indigo-200 bg-white overflow-hidden"
      role="group"
      aria-label={ariaLabel}
    >
      <GeoScene
        width={W} height={H}
        labels={labels}
        obstacles={obstacles}
        ariaLabel={`${ariaLabel} — la figure, sa copie et les trajets de chaque sommet`}
        onPointerMove={deplacer}
        onPointerUp={() => setDrag(false)}
      >
        <rect x={0} y={0} width={W} height={H} fill="#ffffff" data-visual-role="decor" />
        <Grille />

        {/* Les trajets d'abord : ils passent SOUS les figures, pour ne pas
            masquer les sommets qu'ils relient. */}
        {montrerTrajets && (
          <Trajets figure={figure} image={image} color={concordants ? '#f59e0b' : '#e11d48'} />
        )}

        {/* La figure de départ reste TOUJOURS visible : on compare deux
            objets, on n'en remplace pas un par l'autre. */}
        <Poly pts={figure} fill="#64748b" stroke="#475569" fillOpacity={0.1} w={3} />
        {figure.map((p, i) => <Dot key={`d${i}`} p={p} color="#334155" r={6} />)}

        {/* La copie. */}
        <Poly pts={image} fill="#7c3aed" stroke="#6d28d9" fillOpacity={0.16} w={3} />
        {image.map((p, i) => <Dot key={`c${i}`} p={p} color="#7c3aed" r={6} />)}

        {/* Le centre du demi-tour n'apparaît QUE dans le mode demi-tour :
            l'afficher en mode glissement suggérerait un centre là où il n'y
            en a aucun. */}
        {!enGlissement && (
          <g>
            <circle cx={centreDemiTour.x} cy={centreDemiTour.y} r={9} fill="#dc2626" stroke="#ffffff" strokeWidth={3} />
            <circle cx={centreDemiTour.x} cy={centreDemiTour.y} r={17} fill="none" stroke="#dc2626" strokeWidth={2} opacity={0.5} data-visual-role="decor" />
          </g>
        )}

        {/* LA FLÈCHE — l'objet qu'on manipule. Elle n'existe qu'en mode
            glissement : un demi-tour n'a pas de flèche, et en dessiner une
            serait un mensonge de l'écran. */}
        {enGlissement && !g.estNul && (
          <Fleche de={ORIGINE} vers={pointe} color="#4338ca" w={6} />
        )}
        {enGlissement && (
          <>
            <circle cx={ORIGINE.x} cy={ORIGINE.y} r={7} fill="#4338ca" stroke="#ffffff" strokeWidth={3} />
            <Handle
              p={pointe}
              color="#4338ca"
              r={14}
              hitR={HIT_R}
              dragging={drag}
              onPointerDown={prendre}
              onKeyDown={auClavier}
              label="Tirer la pointe de la flèche pour régler le glissement"
            />
          </>
        )}
      </GeoScene>

      {/* ── Le tableau de bord : tout est en DOM, jamais en <text> SVG ──── */}
      <div className="border-t-2 border-indigo-100 bg-indigo-50/50 px-3 py-3">
        {enGlissement ? (
          <div className="grid grid-cols-3 gap-2 text-center" data-lecture="glissement">
            <Mesure label="Direction" value={`${fr(g.direction, 0)}°`} tone="indigo" />
            <Mesure label="Sens" value={g.sens ?? '—'} tone="indigo" />
            <Mesure label="Longueur" value={g.estNul ? '—' : carreaux(g.longueur)} tone="indigo" />
          </div>
        ) : (
          <div className="rounded-xl bg-rose-50 px-3 py-2 text-center text-sm font-semibold text-rose-900">
            Demi-tour autour du point rouge — le geste de 5e, pour comparer.
          </div>
        )}
        <div
          className="mt-2 rounded-xl border-2 px-3 py-2 text-center text-sm font-bold"
          data-verdict={concordants ? 'concordants' : 'croises'}
        >
          {concordants ? (
            <span className="text-emerald-700">
              Les {figure.length} traits sont parallèles et de même longueur.
            </span>
          ) : (
            <span className="text-rose-700">
              Les {figure.length} traits ne sont ni parallèles ni de même longueur : ils se croisent.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export { ORIGINE as ORIGINE_FLECHE, HIT_R as HIT_R_GLISSEMENT };
