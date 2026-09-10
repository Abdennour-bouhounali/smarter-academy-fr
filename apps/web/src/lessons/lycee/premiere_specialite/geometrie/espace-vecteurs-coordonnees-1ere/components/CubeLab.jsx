import React, { useCallback, useRef, useState } from 'react';
import {
  CUBE, IDX, DEMI_CADRE, RAYON_SOMMET, RAYON_SAISIE, PAS_ROT,
  sommetsEcran, sommetLePlusProche, orientationApresGlisser, orientationApresTouche,
  rotateSolid, visibleEdges, visibleVertices, vertexName,
  coordsDansRepere, vecNom, decomposition, doublePythagore, normeExacte, fr, frVec3,
} from './espaceUtils';

/**
 * CubeLab — LA manipulation signature : « La boîte et les trois nombres ».
 *
 * Activity               une boîte qu'on ATTRAPE et qu'on tourne au doigt, et
 *                        dont on CLIQUE les coins pour choisir un trajet.
 * Mathematical objective trois nombres suffisent à situer n'importe quoi dans
 *                        la boîte, et la longueur d'un trajet est Pythagore
 *                        appliqué DEUX FOIS.
 * Student action         glisser sur la figure pour la tourner ; cliquer un
 *                        sommet pour poser le départ, un second pour l'arrivée.
 * Controlled variable    l'orientation (yaw, pitch) et le couple de sommets.
 * Mathematical state     { orientation, depart, arrivee } ; le vecteur, sa
 *                        décomposition, ses deux triangles et sa longueur en
 *                        sont TOUS dérivés, jamais stockés.
 * Visual consequence     le cube tourne, une arête pointillée devient pleine ;
 *                        le trajet s'allume en trois segments ; les deux
 *                        triangles rectangles se tracent sur le solide.
 * Expected observation   « il faut trois nombres, et la longueur sort de deux
 *                        triangles emboîtés ».
 * Misconception targeted deux coordonnées suffiraient ; la longueur serait la
 *                        somme des trois trajets ; ce que montre le dessin
 *                        serait la vérité de l'objet.
 * Formalization          aucune ici. Le module 1 fait CONSTRUIRE les deux
 *                        triangles et DEMANDE la formule qui les résume ; le
 *                        module 3 l'écrit.
 *
 * ─── LE GLISSER, ET POURQUOI IL EST OBLIGATOIRE ICI ───────────────────────
 * La leçon apprend qu'un dessin plat MENT sur les positions relatives. Un
 * élève qui ne peut pas tourner l'objet n'a aucun moyen de le vérifier : la
 * consigne « tourne pour t'en assurer » serait un mensonge de plus. La
 * rotation est donc un DROIT permanent, jamais gelé, et elle se prend au
 * doigt sur la figure elle-même — pas au bouton, parce qu'on tourne une boîte
 * en la saisissant.
 *
 * Trois pièges payés, et ce qui les évite :
 *  1. `setPointerCapture` dans `onPointerDown`. Sans lui, le premier
 *     `pointermove` sort de la figure et le glisser se fige au premier pixel.
 *  2. LE GLISSER ET LE CLIC PARTAGENT LE MÊME GESTE. Un `pointerup` après un
 *     déplacement de 3 px est un clic ; après 60 px, c'est la fin d'une
 *     rotation. On mesure donc le déplacement total et l'on ne sélectionne un
 *     sommet que sous le seuil `SEUIL_CLIC` — sinon tourner la boîte
 *     changerait la sélection à chaque fois.
 *  3. L'AIMANTATION EST CE QUI SAUVE L'ATTEIGNABILITÉ. Un doigt ne vise pas au
 *     degré ; `orientationApresGlisser` aimante sur le cliquet de PAS_ROT, si
 *     bien que toute orientation atteinte au doigt appartient à
 *     `orientationsAtteignables()`. C'est un invariant testé.
 *
 * ─── LE CLAVIER EST UN CHEMIN COMPLET ─────────────────────────────────────
 * La figure est focusable (`tabIndex=0`, `role="application"`) : flèches pour
 * tourner d'un cran, Home/End et PageUp/PageDown pour les bornes. Les sommets
 * sont AUSSI des boutons DOM sous la figure — un élève au clavier ou au
 * lecteur d'écran sélectionne là, sans avoir à viser une pastille.
 * Deux boutons de rotation restent EN SECOURS, pour la même raison.
 *
 * ─── LES NOMBRES SONT DANS LE DOM, JAMAIS EN <text> SVG ───────────────────
 * Sur 43 des 117 orientations atteignables, deux sommets se projettent à moins
 * de 24 unités l'un de l'autre : des étiquettes posées à côté d'eux se
 * chevaucheraient. Le SVG ne porte donc que les pastilles et les traits ; les
 * noms, les coordonnées, les trois trajets et les deux triangles se lisent
 * dans le DOM sous la figure, où l'écart entre deux sommets peut tendre vers
 * zéro sans rendre quoi que ce soit illisible.
 *
 * ─── JAMAIS GELÉ APRÈS RÉUSSITE ──────────────────────────────────────────
 * `disabled` ne sert qu'au verrou d'ANTÉRIORITÉ d'une étape sur la précédente.
 * Un élève qui vient de comprendre doit pouvoir refaire tourner la boîte.
 */

/** Sous ce déplacement (en unités d'écran), un geste est un CLIC. */
const SEUIL_CLIC = 6;

const C_ARETE = '#0f172a';
const C_X = '#7c3aed';       // le trajet vers la droite
const C_Y = '#0284c7';       // le trajet vers le haut
const C_Z = '#0f766e';       // le trajet vers le fond
const C_VEC = '#e11d48';     // le trajet complet
const C_PLANCHER = '#a855f7';
const C_SEL = '#e11d48';

const COULEUR_AXE = { x: C_X, y: C_Y, z: C_Z };
const NOM_AXE = { x: 'vers la droite', y: 'vers le haut', z: 'vers le fond' };

export default function CubeLab({
  orientation,
  onOrientation,
  depart = null,
  arrivee = null,
  onSommet,
  /** 'aucune' | 'trajet' | 'pythagore' — ce que la figure superpose. */
  montrer = 'trajet',
  /** Deux droites mises en évidence : [[a,b],[c,d]] en noms de sommets. */
  droites = null,
  montrerNombres = true,
  disabled = false,
  ariaLabel,
}) {
  const [saisi, setSaisi] = useState(false);
  const svgRef = useRef(null);
  const geste = useRef({ x0: 0, y0: 0, o0: null, parcouru: 0 });

  const tourne = rotateSolid(CUBE, orientation);
  const { visible, hidden } = visibleEdges(tourne);
  const vus = visibleVertices(tourne);
  const S = sommetsEcran(orientation);

  /** Un point du client vers les unités du viewBox — la seule conversion. */
  const versCadre = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return { x: 0, y: 0 };
    return {
      x: ((e.clientX - r.left) / r.width) * (2 * DEMI_CADRE),
      y: ((e.clientY - r.top) / r.height) * (2 * DEMI_CADRE),
    };
  }, []);

  const prendre = (e) => {
    if (disabled) return;
    // SANS CECI, LE GLISSER SE FIGE AU PREMIER PIXEL.
    e.currentTarget.setPointerCapture?.(e.pointerId);
    geste.current = { x0: e.clientX, y0: e.clientY, o0: orientation, parcouru: 0 };
    setSaisi(true);
  };

  const bouger = (e) => {
    if (disabled || !saisi || !geste.current.o0) return;
    const dx = e.clientX - geste.current.x0;
    const dy = e.clientY - geste.current.y0;
    geste.current.parcouru = Math.max(geste.current.parcouru, Math.hypot(dx, dy));
    onOrientation?.(orientationApresGlisser(geste.current.o0, dx, dy));
  };

  const lacher = (e) => {
    if (disabled) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    const etaitClic = geste.current.parcouru < SEUIL_CLIC;
    setSaisi(false);
    // UN CLIC, ET NON UNE FIN DE ROTATION : on sélectionne le sommet visé.
    if (etaitClic && onSommet) {
      const i = sommetLePlusProche(orientation, versCadre(e));
      if (i !== null) onSommet(vertexName(CUBE, i));
    }
    geste.current.parcouru = 0;
  };

  const auClavier = (e) => {
    if (disabled) return;
    const suivant = orientationApresTouche(orientation, e.key);
    if (!suivant) return;
    e.preventDefault();
    onOrientation?.(suivant);
  };

  /* ── Ce que la figure superpose, TOUT calculé ─────────────────────────── */

  const couple = depart && arrivee && depart !== arrivee ? { depart, arrivee } : null;
  const u = couple ? coordsDansRepere(vecNom(couple.depart, couple.arrivee)) : null;
  const etapes = couple ? decomposition(couple.depart, couple.arrivee) : null;
  const pyth = u ? doublePythagore(u) : null;

  const droitesSegments = droites?.map(([a, b]) => ({
    a, b, A: S[IDX[a]], B: S[IDX[b]],
  })) ?? [];

  const arete = ([i, j], cachee) => (
    <line
      key={`${i}-${j}-${cachee ? 'h' : 'v'}`}
      x1={S[i].x} y1={S[i].y} x2={S[j].x} y2={S[j].y}
      stroke={C_ARETE} strokeWidth={cachee ? 1.6 : 2.2}
      strokeDasharray={cachee ? '6 4' : undefined}
      opacity={cachee ? 0.35 : 1}
      strokeLinecap="round"
    />
  );

  const faces = tourne.faces.map((f, idx) => {
    if (!f.every((i) => vus.has(i))) return null;
    return (
      <polygon key={`f${idx}`} points={f.map((i) => `${S[i].x},${S[i].y}`).join(' ')}
        fill="#eef2ff" fillOpacity={0.68} stroke="none" />
    );
  });

  const btn = 'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 '
    + 'disabled:opacity-40 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  const btnSommet = (nom, actif) => 'w-11 h-11 rounded-lg border-2 font-mono font-bold text-base '
    + 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 '
    + (actif ? 'border-rose-500 bg-rose-100 text-rose-900' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100');

  const roleSommet = (nom) => (nom === depart ? 'départ' : nom === arrivee ? 'arrivée' : null);

  return (
    <div className="space-y-3">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${2 * DEMI_CADRE} ${2 * DEMI_CADRE}`}
        className={`w-full max-w-[340px] mx-auto bg-white rounded-xl border-2 border-slate-200 touch-none select-none ${
          disabled ? 'opacity-60' : saisi ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        role="application"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        onPointerDown={prendre}
        onPointerMove={bouger}
        onPointerUp={lacher}
        onPointerCancel={lacher}
        onKeyDown={auClavier}
        aria-label={
          ariaLabel
          ?? `La boîte ABCDEFGH, vue sous une rotation horizontale de ${fr(orientation.yaw)} degrés et une `
            + `inclinaison de ${fr(orientation.pitch)} degrés. ${hidden.length} arêtes sont cachées. `
            + `Glisse sur la figure pour la tourner, ou utilise les flèches du clavier. `
            + (couple
              ? `Le trajet choisi va de ${couple.depart} à ${couple.arrivee} et se lit ${frVec3(u)}.`
              : 'Aucun trajet choisi : clique deux coins de la boîte.')
        }
      >
        <g style={{ pointerEvents: 'none' }}>
          {faces}
          {hidden.map((e) => arete(e, true))}
          {visible.map((e) => arete(e, false))}

          {/* Les deux droites mises en évidence, quand un module en demande. */}
          {droitesSegments.map((d, k) => (
            <line key={`d${k}`} x1={d.A.x} y1={d.A.y} x2={d.B.x} y2={d.B.y}
              stroke={k === 0 ? C_X : C_Z} strokeWidth={5} strokeLinecap="round" opacity={0.85} />
          ))}

          {/* LE TRAJET EN TROIS DÉPLACEMENTS, le long des arêtes. */}
          {montrer !== 'aucune' && etapes && (
            <Trajet etapes={etapes} orientation={orientation} montrer={montrer} pyth={pyth} />
          )}

          {/* Les pastilles des sommets. Le NOM n'est pas ici : il est en DOM. */}
          {S.map((p, i) => {
            const nom = vertexName(CUBE, i);
            const actif = nom === depart || nom === arrivee;
            return (
              <circle
                key={`v${i}`} cx={p.x} cy={p.y}
                r={actif ? RAYON_SOMMET + 2.5 : RAYON_SOMMET}
                fill={actif ? C_SEL : vus.has(i) ? '#475569' : '#cbd5e1'}
                stroke="#fff" strokeWidth={actif ? 3 : 2}
                opacity={vus.has(i) || actif ? 1 : 0.7}
              />
            );
          })}
        </g>
      </svg>

      {/* LA LÉGENDE DES SOMMETS — et le chemin de sélection au clavier.
          Les huit boutons sont l'équivalent DOM du clic sur la pastille : même
          action, même état, accessible sans viser. */}
      {onSommet && (
        <div className="space-y-1.5">
          <p className="text-[13px] text-slate-600">
            Clique deux coins <strong>sur la boîte</strong> — ou choisis-les ici :
          </p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Choisir les deux coins du trajet">
            {CUBE.names.map((nom) => {
              const r = roleSommet(nom);
              return (
                <button
                  key={nom} type="button" disabled={disabled}
                  className={btnSommet(nom, r !== null)}
                  aria-pressed={r !== null}
                  aria-label={r ? `${nom}, coin de ${r}` : `Choisir le coin ${nom}`}
                  onClick={() => onSommet(nom)}
                >
                  {nom}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* LA ROTATION EN SECOURS. Le glisser reste le geste principal ; ces
          boutons existent pour la souris sans glisser et pour le tactile
          d'appoint. Ils ne sont JAMAIS le seul chemin. */}
      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Tourner la boîte">
        <button type="button" className={btn} disabled={disabled}
          aria-label={`Tourner la boîte de ${PAS_ROT} degrés vers la gauche`}
          onClick={() => onOrientation?.(orientationApresTouche(orientation, 'ArrowLeft'))}>↺</button>
        <button type="button" className={btn} disabled={disabled}
          aria-label={`Tourner la boîte de ${PAS_ROT} degrés vers la droite`}
          onClick={() => onOrientation?.(orientationApresTouche(orientation, 'ArrowRight'))}>↻</button>
        <button type="button" className={btn} disabled={disabled}
          aria-label={`Pencher la boîte de ${PAS_ROT} degrés vers l’avant`}
          onClick={() => onOrientation?.(orientationApresTouche(orientation, 'ArrowDown'))}>⤓</button>
        <button type="button" className={btn} disabled={disabled}
          aria-label={`Pencher la boîte de ${PAS_ROT} degrés vers l’arrière`}
          onClick={() => onOrientation?.(orientationApresTouche(orientation, 'ArrowUp'))}>⤒</button>
        <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold tabular-nums text-[13px]">
          {fr(orientation.yaw)}° / {fr(orientation.pitch)}°
        </span>
        <span className="text-[13px] text-slate-500">
          attrape la boîte et fais-la tourner
        </span>
      </div>

      {/* LES NOMBRES, DANS LE DOM. */}
      {montrerNombres && (
        <div aria-live="polite" className="space-y-2">
          {!couple ? (
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-3 text-center text-sm text-slate-600">
              Choisis un coin de <strong>départ</strong> et un coin d’<strong>arrivée</strong> :
              le trajet s’allumera sur la boîte.
            </div>
          ) : (
            <>
              <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-3">
                <div className="text-[13px] font-semibold text-indigo-900">
                  Le trajet de {couple.depart} à {couple.arrivee}, en trois fois
                </div>
                <ul className="mt-2 grid grid-cols-3 gap-2 text-center">
                  {etapes.map((e) => (
                    <li key={e.axe} className="rounded-lg border-2 bg-white px-2 py-1.5"
                      style={{ borderColor: COULEUR_AXE[e.axe] }}>
                      <div className="text-[13px] text-slate-600">{NOM_AXE[e.axe]}</div>
                      <div className="font-mono text-xl font-black tabular-nums"
                        style={{ color: COULEUR_AXE[e.axe] }}>{fr(e.aretes)}</div>
                    </li>
                  ))}
                </ul>
              </div>

              {montrer === 'pythagore' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="rounded-xl border-2 border-purple-300 bg-purple-50 p-3"
                    data-testid="triangle-plancher">
                    <div className="text-[13px] font-semibold text-purple-900">
                      1. le triangle du plancher
                    </div>
                    <div className="font-mono text-xs text-purple-700 mt-0.5">
                      {fr(u.x)}² + {fr(u.y)}² = {fr(pyth.plancherCarre)}
                    </div>
                    <div className="text-[13px] text-purple-800 mt-1">
                      diagonale du plancher = <strong className="font-mono">{normeExacte(pyth.plancherCarre)}</strong>
                    </div>
                  </div>
                  <div className="rounded-xl border-2 border-sky-300 bg-sky-50 p-3"
                    data-testid="triangle-espace">
                    <div className="text-[13px] font-semibold text-sky-900">
                      2. le triangle de l’espace
                    </div>
                    <div className="font-mono text-xs text-sky-700 mt-0.5">
                      {fr(pyth.plancherCarre)} + {fr(u.z)}² = {fr(pyth.totalCarre)}
                    </div>
                    <div className="text-[13px] text-sky-800 mt-1">
                      longueur du trajet = <strong className="font-mono">{normeExacte(pyth.totalCarre)}</strong>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Le trajet en trois déplacements, et les deux triangles rectangles.
 *
 * Les points intermédiaires ne sont PAS des sommets du cube : ils vivent sur
 * les arêtes ou dans les faces. Ils passent donc par la même chaîne de
 * transformation que les sommets — `sommetsEcran` appliqué à un solide dont
 * les sommets sont ces points-là — pour que chaque segment se superpose
 * EXACTEMENT à l'arête qu'il longe. Les recalculer « à peu près » ferait
 * flotter le trajet à côté du cube dès qu'on tourne.
 */
function Trajet({ etapes, orientation, montrer, pyth }) {
  const pts = [etapes[0].from, etapes[0].to, etapes[1].to, etapes[2].to];
  const E = sommetsEcran(orientation, pts);
  const [P0, P1, P2, P3] = E;
  const couleurs = [C_X, C_Y, C_Z];

  return (
    <g>
      {/* Le triangle du PLANCHER : P0 → P1 → P2, rectangle en P1. */}
      {montrer === 'pythagore' && pyth.plancherCarre > 0 && (
        <polygon points={`${P0.x},${P0.y} ${P1.x},${P1.y} ${P2.x},${P2.y}`}
          fill={C_PLANCHER} fillOpacity={0.18} stroke={C_PLANCHER}
          strokeWidth={1.8} strokeDasharray="5 3" />
      )}
      {/* Le triangle de l'ESPACE : P0 → P2 → P3, rectangle en P2. */}
      {montrer === 'pythagore' && (
        <polygon points={`${P0.x},${P0.y} ${P2.x},${P2.y} ${P3.x},${P3.y}`}
          fill={C_Y} fillOpacity={0.14} stroke={C_Y} strokeWidth={1.8} strokeDasharray="5 3" />
      )}
      {/* La diagonale du plancher, qui est un CÔTÉ du second triangle. */}
      {montrer === 'pythagore' && pyth.plancherCarre > 0 && (
        <line x1={P0.x} y1={P0.y} x2={P2.x} y2={P2.y}
          stroke={C_PLANCHER} strokeWidth={3.5} strokeLinecap="round" />
      )}
      {/* LES TROIS DÉPLACEMENTS, un par direction. */}
      {[[P0, P1], [P1, P2], [P2, P3]].map(([a, b], k) => (
        Math.hypot(b.x - a.x, b.y - a.y) < 0.5 ? null : (
          <line key={`t${k}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={couleurs[k]} strokeWidth={5} strokeLinecap="round" opacity={0.9} />
        )
      ))}
      {/* LE TRAJET COMPLET, la flèche oblique. */}
      <line x1={P0.x} y1={P0.y} x2={P3.x} y2={P3.y}
        stroke={C_VEC} strokeWidth={3} strokeLinecap="round" strokeDasharray="7 4" />
    </g>
  );
}
