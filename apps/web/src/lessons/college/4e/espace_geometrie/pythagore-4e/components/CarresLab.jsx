import React, { useState } from 'react';
import GeoScene, { Handle, Dot, Poly, dotObstacles } from '../../../../../common/geo5e/GeoScene';
import {
  CADRE, A_DEFAUT, B_DEFAUT, surLeCercle, milieu, dist,
  troisCarres, bilanAires, angles, fr, arrondi,
} from './pythagore4e';

/**
 * CarresLab — la manipulation SIGNATURE de la leçon (INTERACTION_PEDAGOGY §6bis).
 *
 * Activity              déformer un triangle rectangle en faisant glisser le
 *                       sommet de l'angle droit, et regarder les trois carrés.
 * Mathematical objective l'aire du carré construit sur l'hypoténuse égale la
 *                       somme des deux autres — pour TOUTE forme du triangle
 *                       rectangle.
 * Student action        faire glisser C. En mode « contraint », C reste sur le
 *                       cercle de diamètre [AB] ; en mode « libre », il va où
 *                       l'élève veut.
 * Controlled variable   la position de C, et elle seule. A et B sont fixes.
 * Mathematical state    les trois sommets. Les carrés, leurs aires, les angles
 *                       et le bilan sont TOUS mesurés sur ces points.
 * Visual consequence    les trois carrés se redessinent, les trois nombres
 *                       changent, et la balance des aires reste — ou penche.
 * Expected observation  « les aires changent, l'égalité reste ».
 * Misconception targeted croire que la relation porte sur les LONGUEURS
 *                       (a + b = c) : le module 4 la teste explicitement.
 *
 * POURQUOI LE CERCLE PLUTÔT QU'UN AIMANT. L'angle droit est préservé par une
 * PROPRIÉTÉ (tout point du cercle de diamètre [AB] voit [AB] sous un angle
 * droit), pas par un code qui corrigerait la position de C après coup. Un
 * aimant serait un mensonge de plus dans la figure : l'élève croirait déformer
 * librement alors qu'on le rattraperait. Ici, il glisse VRAIMENT le long d'un
 * chemin, et ce chemin est visible.
 *
 * SÉCURITÉ VISUELLE : `GeoScene` place les étiquettes sans collision
 * (`placeLabels`) ; les trois aires sont affichées HORS du SVG, dans leur
 * propre grille DOM — elles ne peuvent donc ni se chevaucher ni sortir du
 * cadre, quel que soit le nombre de chiffres.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement.
 */

/** Le rayon de la cible tactile, en unités de viewBox. */
const HIT_R = 68; // ≈ 47 px à 375 px de large sur un cadre de 620 unités

export default function CarresLab({
  contraint = true,
  C,
  onC,
  montrerAires = true,
  montrerBalance = true,
  A = A_DEFAUT,
  B = B_DEFAUT,
}) {
  const [drag, setDrag] = useState(false);

  const T = { A, B, C };
  const carres = troisCarres(T);
  const bilan = bilanAires(T);
  const ang = angles(T);
  const O = milieu(A, B);
  const rayon = dist(A, B) / 2;

  /* LE CADRE SE DÉDUIT DU CONTENU (§17bis), il ne se devine pas.
     Le carré construit sur l'hypoténuse descend très bas quand C est proche
     de A ou de B : un cadre fixe le laisserait sortir de l'écran pour une
     bonne moitié des positions atteignables. On englobe donc les trois
     carrés, le cercle et les trois sommets, avec une marge — et on garde le
     cadre CENTRÉ sur [AB] pour que la figure ne saute pas d'un côté à
     l'autre pendant le glissement. */
  const MARGE = 26;
  const tousLesPoints = [
    A, B, C,
    ...carres.flatMap((c) => c.sommets),
    { x: O.x - rayon, y: O.y - rayon }, { x: O.x + rayon, y: O.y + rayon },
  ];
  const minX = Math.min(...tousLesPoints.map((p) => p.x)) - MARGE;
  const maxX = Math.max(...tousLesPoints.map((p) => p.x)) + MARGE;
  const minY = Math.min(...tousLesPoints.map((p) => p.y)) - MARGE;
  const maxY = Math.max(...tousLesPoints.map((p) => p.y)) + MARGE;
  const vue = { x: minX, y: minY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) };

  // `GeoScene` convertit lui-même l'évènement en coordonnées de viewBox et
  // passe le point à `onPointerMove` : aucune conversion à refaire ici, et
  // aucune référence au SVG à tenir (une seule définition de l'échelle).

  /** En mode contraint, on projette sur le cercle : le geste reste libre, la
   *  propriété est préservée par la GÉOMÉTRIE, pas par une correction cachée. */
  const placer = (p) => {
    if (!p) return;
    if (!contraint) {
      onC({ x: Math.max(20, Math.min(CADRE.largeur - 20, p.x)), y: Math.max(20, Math.min(CADRE.hauteur - 20, p.y)) });
      return;
    }
    const dx = p.x - O.x;
    const dy = p.y - O.y;
    const n = Math.hypot(dx, dy) || 1;
    // On garde C au-dessus de [AB] : sous la droite, le triangle se retourne
    // et sort du cadre pour certaines positions.
    const y = O.y - Math.abs((dy / n) * rayon);
    onC({ x: O.x + (dx / n) * rayon, y });
  };

  // `setPointerCapture` n'est pas optionnel : sans lui, le glissement se fige
  // au premier pixel dès que le pointeur quitte la poignée (piège documenté).
  const onDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
  };

  /** Point de la scène → point du cadre mesuré. */
  const d = (p) => ({ x: p.x - vue.x, y: p.y - vue.y });

  const COULEURS = ['#0891b2', '#7c3aed', '#dc2626'];
  const nomDe = (c) => `${c.de}${c.a}`;

  return (
    <div className="space-y-3" role="group" aria-label="Triangle rectangle et les trois carrés construits sur ses côtés">
      <GeoScene
        width={vue.w}
        height={vue.h}
        ariaLabel={`Triangle ${contraint ? 'rectangle' : ''} et les carrés de ses trois côtés`}
        onPointerMove={(p) => { if (drag) placer(p ? { x: p.x + vue.x, y: p.y + vue.y } : null); }}
        onPointerUp={() => setDrag(false)}
        labels={[
          { id: 'A', text: 'A', anchor: d(A), color: '#0f172a', size: 17, priority: true },
          { id: 'B', text: 'B', anchor: d(B), color: '#0f172a', size: 17, priority: true },
          { id: 'C', text: 'C', anchor: d(C), color: '#0f172a', size: 17, priority: true },
        ]}
        obstacles={dotObstacles([d(A), d(B), d(C)], 16)}
      >
        {/* Le chemin de C, quand il est contraint : on le MONTRE. */}
        {contraint && (
          <circle cx={d(O).x} cy={d(O).y} r={rayon} fill="none" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="5 4" />
        )}

        {/* Les trois carrés, sous le triangle. */}
        {carres.map((c, i) => (
          <Poly key={nomDe(c)} pts={c.sommets.map(d)} fill={COULEURS[i]} fillOpacity={0.14} stroke={COULEURS[i]} w={2} />
        ))}

        {/* Le triangle. */}
        <Poly pts={[A, B, C].map(d)} fill="#f8fafc" fillOpacity={0.9} stroke="#0f172a" w={2.5} />

        {/* La marque d'angle droit, dessinée seulement quand il l'est. */}
        {Math.abs(ang.C - 90) < 0.5 && (() => {
          const u = { x: (A.x - C.x) / dist(C, A), y: (A.y - C.y) / dist(C, A) };
          const v = { x: (B.x - C.x) / dist(C, B), y: (B.y - C.y) / dist(C, B) };
          const t = 16;
          return (
            <polyline
              points={[
                d({ x: C.x + u.x * t, y: C.y + u.y * t }),
                d({ x: C.x + (u.x + v.x) * t, y: C.y + (u.y + v.y) * t }),
                d({ x: C.x + v.x * t, y: C.y + v.y * t }),
              ].map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none" stroke="#0f172a" strokeWidth={2}
            />
          );
        })()}

        <Dot p={d(A)} color="#0f172a" r={5} />
        <Dot p={d(B)} color="#0f172a" r={5} />
        <Handle
          p={d(C)}
          color="#b45309"
          r={11}
          hitR={HIT_R}
          dragging={drag}
          label="Sommet C — fais-le glisser"
          onPointerDown={onDown}
          onKeyDown={(e) => {
            const pas = 12;
            const map = { ArrowLeft: [-pas, 0], ArrowRight: [pas, 0], ArrowUp: [0, -pas], ArrowDown: [0, pas] };
            const d = map[e.key];
            if (!d) return;
            e.preventDefault();
            placer({ x: C.x + d[0], y: C.y + d[1] });
          }}
        />
      </GeoScene>

      {/* Les trois aires, dans le DOM — jamais en texte SVG. */}
      {montrerAires && (
        <div className="grid grid-cols-3 gap-2">
          {carres.map((c, i) => (
            <div key={nomDe(c)} className="rounded-xl border-2 bg-white p-2 text-center"
                 style={{ borderColor: COULEURS[i] }}>
              <div className="text-[11px] font-semibold text-slate-500">
                carré sur [{nomDe(c)}]
              </div>
              <div className="font-mono text-base font-black tabular-nums" style={{ color: COULEURS[i] }}>
                {fr(arrondi(c.aire / 100, 1), 1)}
              </div>
              <div className="text-[10px] text-slate-400">unités d’aire</div>
            </div>
          ))}
        </div>
      )}

      {/* La balance : les deux petits d'un côté, le grand de l'autre. */}
      {montrerBalance && (
        <div className={`rounded-2xl border-2 p-3 ${
          bilan.equilibre ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'
        }`}>
          <div className="flex items-center justify-center gap-3 font-mono text-sm tabular-nums">
            <span className="font-bold text-slate-700">
              {fr(arrondi(bilan.petits[0].aire / 100, 1), 1)} + {fr(arrondi(bilan.petits[1].aire / 100, 1), 1)}{' '}
              = {fr(arrondi(bilan.somme / 100, 1), 1)}
            </span>
            <span className={`text-lg font-black ${bilan.equilibre ? 'text-emerald-700' : 'text-amber-700'}`}>
              {bilan.equilibre ? '=' : bilan.ecart > 0 ? '<' : '>'}
            </span>
            <span className="font-bold text-slate-700">
              {fr(arrondi(bilan.grand.aire / 100, 1), 1)}
            </span>
          </div>
          <p className={`mt-1 text-center text-xs font-semibold ${
            bilan.equilibre ? 'text-emerald-800' : 'text-amber-900'
          }`}>
            {bilan.equilibre
              ? 'Les deux plateaux s’équilibrent.'
              : `L’écart vaut ${fr(Math.abs(arrondi(bilan.ecart / 100, 1)), 1)} — la balance penche.`}
          </p>
        </div>
      )}

      {/* L'angle en C, affiché quand il peut changer. */}
      {!contraint && (
        <div className="rounded-xl bg-slate-900 px-3 py-2 text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Angle en C </span>
          <span className="font-mono text-lg font-black tabular-nums text-white">{fr(ang.C, 1)}°</span>
          <span className={`ml-2 text-sm font-semibold ${
            Math.abs(ang.C - 90) < 0.5 ? 'text-emerald-300' : ang.C > 90 ? 'text-rose-300' : 'text-sky-300'
          }`}>
            {Math.abs(ang.C - 90) < 0.5 ? 'droit' : ang.C > 90 ? 'obtus' : 'aigu'}
          </span>
        </div>
      )}
    </div>
  );
}

export { surLeCercle, HIT_R };
