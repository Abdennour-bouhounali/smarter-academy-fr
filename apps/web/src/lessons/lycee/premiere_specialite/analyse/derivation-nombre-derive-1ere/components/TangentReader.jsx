import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { tangente, stepRun, fr } from './derivUtils';

/**
 * TangentReader — lire la pente d'une tangente sur un escalier.
 *
 * Activity               une tangente est déjà tracée au point d'abscisse a ;
 *                        l'élève ATTRAPE le point de contact et le fait
 *                        COURIR le long de la courbe, puis lit la pente sur
 *                        l'ESCALIER « +1 horizontalement, puis ? verticalement ».
 * Mathematical objective f′(a) EST le coefficient directeur de la tangente ;
 *                        son SIGNE dit si la tangente monte ou descend, et ne
 *                        dit rien de la position de la courbe.
 * Student action         SAISIR le point de contact et le tirer (règle
 *                        utilisateur « le glisser d'abord »). Les boutons ±
 *                        et le clavier restent des chemins complets, en
 *                        affordance secondaire.
 * Controlled variable    a.
 * Mathematical state     { a } ; tangente, pente et escalier sont DÉRIVÉS.
 * Visual consequence     la tangente bascule ; la marche verticale change de
 *                        longueur et de sens.
 * Expected observation   « quand la tangente descend, le nombre est négatif —
 *                        même là où la courbe est au-dessus de l'axe ».
 * Misconception targeted « f′(a) est l'ordonnée du point » ; « pente négative
 *                        = courbe sous l'axe ».
 *
 * Nombres dans le DOM. L'escalier est fait de segments sans texte.
 */
const COURBE = '#4f46e5';
const TANGENTE = '#e11d48';
const POINT = '#d97706';
const MARCHE = '#0f766e';

export default function TangentReader({ fn, a, onChangeA, pas = 0.5, disabled = false }) {
  const tan = tangente(fn, a);
  const pente = fn.fPrime(a);
  const fa = fn.f(a);

  // L'escalier : une avancée `dx` depuis le point de contact, puis la montée
  // qui vaut exactement dx × pente. Il est CALCULÉ, jamais dessiné à la main.
  //
  // SÉCURITÉ DE MISE EN PAGE (INTERACTION_PEDAGOGY §17bis) : l'avancée est
  // RÉDUITE pour que le sommet de la marche reste dans le cadre, au lieu
  // d'être fixée à 1 et de déborder. Balayé, jamais échantillonné : sur
  // g(x) = x³ − 3x en a = −1,5, une avancée de 1 hisse le sommet à 4,875 pour
  // un cadre qui s'arrête à 4. Les bornes se calculent, elles ne se
  // constatent pas après coup.
  const dx = stepRun(fn, a, pente, fa);
  const overlay = (toSvg) => {
    const p0 = toSvg(a, fa);
    const p1 = toSvg(a + dx, fa);
    const p2 = toSvg(a + dx, fa + pente * dx);
    return (
      <g pointerEvents="none">
        <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={MARCHE} strokeWidth={2.5} />
        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={MARCHE} strokeWidth={2.5} />
        <circle cx={p2.x} cy={p2.y} r={4} fill={MARCHE} />
      </g>
    );
  };

  // Les bornes du point de contact viennent du MODÈLE (fn.contactRange), qui
  // les déclare avec la fonction. Elles sont choisies pour que chaque cible
  // pédagogique du module soit ATTEIGNABLE — sur g, il faut pouvoir atteindre
  // a = 1,5, où la courbe est sous l'axe et la tangente monte — tout en
  // gardant l'escalier dans le cadre (balayé dans derivUtils.test.js).
  const bornes = fn.contactRange;
  const bump = (d) => {
    const v = Math.round((a + d * pas) * 100) / 100;
    if (v >= bornes.lo && v <= bornes.hi) onChangeA?.(v);
  };

  /**
   * LE GLISSER. `CoordPlane` rend un point librement déplaçable dans le PLAN ;
   * ici l'abscisse est aimantée au pas puis BORNÉE à `contactRange`, et
   * l'ordonnée est REPROJETÉE sur la courbe. Le point ne quitte donc jamais le
   * tracé, et le geste reste « je fais courir le point le long de la courbe ».
   *
   * Le bornage se fait par SERRAGE et non par refus : un doigt qui sort du
   * domaine laisse le point sur la dernière abscisse permise, au lieu de le
   * figer sur place — c'est ce qui rend le glisser fluide au bord.
   */
  const glisser = (p) => {
    const v = Math.min(bornes.hi, Math.max(bornes.lo, Math.round(p.x / pas) * pas));
    onChangeA?.(Math.round(v * 100) / 100);
  };
  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 ' +
    'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  const sens = pente > 0 ? 'monte' : pente < 0 ? 'descend' : 'est horizontale';
  const position = fa > 0 ? 'au-dessus de l’axe' : fa < 0 ? 'sous l’axe' : 'sur l’axe';

  return (
    <div className="space-y-3">
      <CoordPlane
        range={fn.range}
        unit={fn.unit}
        unitY={fn.unitY}
        xStep={1}
        yStep={1}
        curves={[{ id: fn.id, points: sample(fn), tone: COURBE, width: 2.5 }]}
        functions={[{ id: 'tan', a: tan.a, b: tan.b, tone: TANGENTE, label: 'tangente' }]}
        points={[{ id: 'A', x: a, y: fa, color: POINT, name: 'A' }]}
        overlay={overlay}
        caption={false}
        step={{ x: pas, y: 0.01 }}
        // LE POINT SE SAISIT. `draggableId` n'est annulé QUE par le verrou
        // d'ANTÉRIORITÉ (`disabled`), jamais par la réussite de l'étape : la
        // forme `draggableId={done ? null : …}` est proscrite au même titre
        // que `disabled={done}` — un élève qui vient de comprendre doit
        // pouvoir refaire le geste.
        draggableId={disabled ? null : 'A'}
        onPointChange={glisser}
        ariaLabel={
          `Tangente à la courbe au point d’abscisse ${fr(a)}. La courbe y est ${position}, ` +
          `d’ordonnée ${fr(arrondi(fa))}. La tangente ${sens} : sa pente vaut ${fr(arrondi(pente))}. ` +
          `Fais glisser le point de contact, ou utilise les flèches gauche et droite.`
        }
      />

      {/* Les deux nombres qu'il ne faut pas confondre, côte à côte. */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
          <div className="text-[13px] text-slate-500">ordonnée du point f(a)</div>
          <div className="font-mono font-bold tabular-nums text-slate-900">{fr(arrondi(fa))}</div>
        </div>
        <div className="rounded-lg border-2 border-rose-300 bg-rose-50 px-2 py-2">
          <div className="text-[13px] text-rose-700">pente de la tangente</div>
          <div className="font-mono font-black tabular-nums text-rose-900">{fr(arrondi(pente))}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Déplacer le point de contact">
        <button type="button" className={btn} onClick={() => bump(-1)} disabled={disabled || a - pas < bornes.lo} aria-label="Déplacer le point de contact vers la gauche">
          ←
        </button>
        <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold tabular-nums text-sm">a = {fr(a)}</span>
        <button type="button" className={btn} onClick={() => bump(1)} disabled={disabled || a + pas > bornes.hi} aria-label="Déplacer le point de contact vers la droite">
          →
        </button>
        <span className="text-[13px] text-slate-600">
          La tangente <strong>{sens}</strong> · la courbe est <strong>{position}</strong>
        </span>
      </div>

      <div className="rounded-lg bg-teal-50 border border-teal-200 px-3 py-2 text-[13px] text-teal-900">
        L’escalier vert avance de <strong>{fr(dx)}</strong> et monte de{' '}
        <strong>{fr(arrondi(pente * dx))}</strong> : la pente est le rapport des deux, soit{' '}
        <strong>{fr(arrondi(pente))}</strong>.
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
