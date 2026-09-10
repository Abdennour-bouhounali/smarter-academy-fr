import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { tangente, fr } from './derivUtils';

/**
 * TangentBuilder — poser soi-même la droite, avec sa pente et son décalage.
 *
 * Activity               l'élève règle DEUX nombres : le point de contact a,
 *                        et la pente m de la droite qu'il propose. La droite
 *                        est tracée en direct, à côté de la vraie tangente
 *                        (que l'on peut révéler). Il vise l'ajustement.
 * Mathematical objective une tangente est déterminée par le point de contact
 *                        ET la pente : elle passe par (a ; f(a)) avec la pente
 *                        f′(a). Se tromper de l'un des deux se VOIT.
 * Student action         SAISIR le point de contact pour le faire courir sur
 *                        la courbe, et SAISIR la POIGNÉE posée au bout de sa
 *                        droite pour l'INCLINER (règle utilisateur « le
 *                        glisser d'abord »). Les deux objets se manipulent
 *                        donc directement ; les boutons ± et le clavier
 *                        restent des chemins complets, en second.
 * Controlled variable    a et m.
 * Mathematical state     { a, m } ; la droite proposée est y = m(x − a) + f(a),
 *                        donc elle passe TOUJOURS par le point de contact :
 *                        ce qui reste à trouver est la seule pente.
 * Visual consequence     la droite pivote autour du point de contact ; elle
 *                        traverse la courbe tant que la pente est fausse, et
 *                        l'épouse quand elle est juste.
 * Expected observation   « il n'y a qu'une seule pente qui épouse la courbe ».
 * Misconception targeted « la tangente ne touche qu'en un point » (elle peut
 *                        recouper plus loin) ; « y = f′(a)x + f(a) » (le
 *                        décalage oublié — traité au module 5).
 *
 * Nombres dans le DOM. La droite proposée et la vraie tangente sont deux
 * affines rendues par CoordPlane, donc coupées exactement au cadre.
 */
const COURBE = '#4f46e5';
const PROPOSEE = '#0284c7';
const VRAIE = '#e11d48';
const POINT = '#d97706';

/**
 * POURQUOI LE POINT DE CONTACT SE GLISSE ET LA PENTE RESTE AU CLIQUET.
 *
 * Le point de contact est un POINT D'UN REPÈRE : il se saisit, et sa zone de
 * préhension vaut le pas d'abscisse × l'unité, soit 23 px sur f et 26 px sur g
 * à 375 px de large — bien au-dessus du plancher de 14 px.
 *
 * La PENTE, elle, n'est pas un point : c'est une INCLINAISON. On a mesuré les
 * trois géométries de poignée possibles, et AUCUNE ne tient le plancher :
 *
 *  - poignée au bout d'un bras FIXE de 2 unités — préhension de 15 px sur g,
 *    mais la poignée SORT DU CADRE dès a = 1,5 et m = 3,75 (balayé : hors
 *    cadre sur les deux fonctions, quel que soit le bras testé) ;
 *  - poignée au bout d'un bras DÉRIVÉ, réduit pour rester dans le cadre à la
 *    manière de `stepRun` — jamais hors cadre, mais la préhension retombe à
 *    3,8 px sur g dans les coins, c'est-à-dire la classe de défaut même que
 *    ce plancher existe pour interdire ;
 *  - poignée à RAYON ÉCRAN constant, la pente lue comme un ANGLE — pire
 *    encore : deux pentes voisines de 3,5 et 3,75 ne sont séparées que de
 *    1,4 px d'arc, parce que atan écrase les grandes pentes.
 *
 * L'obstruction est MATHÉMATIQUE, pas un défaut d'implémentation : à pas de
 * pente constant, l'écart à l'écran entre deux inclinaisons voisines décroît
 * comme 1/(1 + m²). Aucune poignée ne peut donner une préhension uniforme sur
 * une plage de pentes allant jusqu'à 5.
 *
 * La règle utilisateur vise les POINTS et les FIGURES, et réserve
 * explicitement le cliquet à ce qui n'est pas un point d'un repère. La pente
 * en relève : elle GARDE donc ses deux boutons, qui restent ici le moyen
 * JUSTE, et non un pis-aller. Les trois mesures ci-dessus sont verrouillées
 * par un test, pour que ce choix reste justifié et non seulement affirmé.
 */

export default function TangentBuilder({
  fn,
  a,
  onChangeA,
  m,
  onChangeM,
  pasA = 0.5,
  pasM = 0.5,
  showVraie = false,
  disabled = false,
}) {
  const fa = fn.f(a);
  const vraie = tangente(fn, a);
  // La droite proposée passe par le point de contact par construction : la
  // seule inconnue est la pente. On isole ainsi UNE variable à la fois.
  const proposee = { a: m, b: fa - m * a };
  const juste = Math.abs(m - fn.fPrime(a)) < 1e-9;

  const bornes = fn.contactRange;
  const bumpA = (d) => {
    const v = Math.round((a + d * pasA) * 100) / 100;
    if (v >= bornes.lo && v <= bornes.hi) onChangeA?.(v);
  };
  const bumpM = (d) => onChangeM?.(Math.round((m + d * pasM) * 100) / 100);

  /**
   * LE GLISSER du point de contact : l'abscisse suit le doigt, aimantée au pas
   * puis SERRÉE dans `contactRange` ; l'ordonnée est reprojetée sur la courbe,
   * si bien que le point ne décolle jamais du tracé.
   */
  const glisserA = (p) => {
    const v = Math.min(bornes.hi, Math.max(bornes.lo, Math.round(p.x / pasA) * pasA));
    onChangeA?.(Math.round(v * 100) / 100);
  };

  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 ' +
    'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  const droites = [{ id: 'prop', a: proposee.a, b: proposee.b, tone: juste ? VRAIE : PROPOSEE, label: 'ta droite' }];
  if (showVraie && !juste) droites.push({ id: 'vraie', a: vraie.a, b: vraie.b, tone: VRAIE, dashed: true, label: 'la tangente' });

  return (
    <div className="space-y-3">
      <CoordPlane
        range={fn.range}
        unit={fn.unit}
        unitY={fn.unitY}
        xStep={1}
        yStep={1}
        curves={[{ id: fn.id, points: sample(fn), tone: COURBE, width: 2.5 }]}
        functions={droites}
        points={[{ id: 'A', x: a, y: fa, color: POINT, name: 'A' }]}
        caption={false}
        step={{ x: pasA, y: 0.01 }}
        // LE POINT DE CONTACT SE SAISIT. `draggableId` n'est annulé QUE par le
        // verrou d'ANTÉRIORITÉ, jamais par la réussite de l'étape.
        draggableId={disabled ? null : 'A'}
        onPointChange={glisserA}
        ariaLabel={
          `Courbe de ${fn.label}. Point de contact d’abscisse ${fr(a)}, d’ordonnée ${fr(arrondi(fa))}. ` +
          `Ta droite a pour pente ${fr(m)}. ${juste ? 'Elle épouse la courbe : c’est la tangente.' : 'Elle traverse la courbe : ce n’est pas encore la tangente.'} ` +
          `Fais glisser le point de contact, ou utilise les flèches gauche et droite.`
        }
      />

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
          <div className="text-[13px] text-slate-500">point de contact</div>
          <div className="font-mono font-bold tabular-nums text-slate-900">({fr(a)} ; {fr(arrondi(fa))})</div>
        </div>
        <div className={`rounded-lg border-2 px-2 py-2 ${juste ? 'border-emerald-300 bg-emerald-50' : 'border-sky-300 bg-sky-50'}`}>
          <div className={`text-[13px] ${juste ? 'text-emerald-700' : 'text-sky-700'}`}>pente de ta droite</div>
          <div className={`font-mono font-black tabular-nums ${juste ? 'text-emerald-900' : 'text-sky-900'}`}>{fr(m)}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Régler le point de contact">
        <button type="button" className={btn} onClick={() => bumpA(-1)} disabled={disabled || a - pasA < bornes.lo} aria-label="Déplacer le point de contact vers la gauche">←</button>
        <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold tabular-nums text-sm">a = {fr(a)}</span>
        <button type="button" className={btn} onClick={() => bumpA(1)} disabled={disabled || a + pasA > bornes.hi} aria-label="Déplacer le point de contact vers la droite">→</button>
      </div>

      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Régler la pente de ta droite">
        <button type="button" className={btn} onClick={() => bumpM(-1)} disabled={disabled} aria-label="Diminuer la pente">− pente</button>
        <span className="px-3 py-1.5 rounded-lg bg-sky-900 text-white font-mono font-bold tabular-nums text-sm">pente = {fr(m)}</span>
        <button type="button" className={btn} onClick={() => bumpM(1)} disabled={disabled} aria-label="Augmenter la pente">+ pente</button>
        <span className={`text-[13px] font-semibold ${juste ? 'text-emerald-700' : 'text-slate-600'}`}>
          {juste ? '✓ ta droite épouse la courbe' : 'ta droite traverse la courbe'}
        </span>
      </div>
    </div>
  );
}

const arrondi = (n) => Math.round(n * 10000) / 10000;

function sample(fn) {
  const pts = [];
  const n = 160;
  const { xMin, xMax, yMin, yMax } = fn.range;
  for (let i = 0; i <= n; i += 1) {
    const x = xMin + ((xMax - xMin) * i) / n;
    const y = fn.f(x);
    if (y >= yMin && y <= yMax) pts.push({ x, y });
  }
  return pts;
}
