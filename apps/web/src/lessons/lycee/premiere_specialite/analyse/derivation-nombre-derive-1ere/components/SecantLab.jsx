import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { H_STEPS, tauxDetail, secante, tangente, hAimante, fr } from './derivUtils';

/**
 * SecantLab — l'interaction SIGNATURE : la sécante qui se couche.
 *
 * Activity               deux points A et B sur la courbe ; l'élève RÉTRÉCIT
 *                        l'écart h au cliquet (2 → 1 → 0,5 → … → 0,01) et la
 *                        sécante (AB) pivote et se couche. Le triangle
 *                        « avancée / montée » se redessine dessous, et une
 *                        bande d'historique empile les pentes déjà obtenues.
 * Mathematical objective le taux de variation est la pente d'une sécante ; en
 *                        rapprochant B de A, ces pentes se STABILISENT sur un
 *                        nombre qui ne dépend plus que de A.
 * Student action         SAISIR le point B et le tirer vers A — le geste EST
 *                        le rapprochement. Le lâcher AIMANTE sur le cran de h
 *                        le plus proche, si bien que chaque valeur reste
 *                        exactement atteignable et exactement lisible. Les
 *                        boutons « rapprocher » / « éloigner » restent un
 *                        chemin complet, et deviennent le SEUL moyen d'usage
 *                        confortable sur la queue de convergence (voir la note
 *                        sur la zone de préhension ci-dessous).
 * Controlled variable    h, l'écart entre les deux abscisses.
 * Mathematical state     { a, h, visites } ; pente, montée, avancée et les
 *                        deux droites en sont TOUTES dérivées.
 * Visual consequence     la sécante pivote, le triangle rétrécit, la colonne
 *                        de pentes converge.
 * Expected observation   « les pentes cessent de bouger, et pourtant h n'est
 *                        jamais nul ».
 * Misconception targeted « il faut que h atteigne 0 » ; « le taux, c'est
 *                        f(b) − f(a) » (la montée sans l'avancée).
 *
 * Nombres dans le DOM, jamais en <text> SVG : c'est la parade contre les
 * collisions d'étiquettes quand la sécante se couche sur la tangente.
 *
 * JAMAIS GELÉ après réussite : `disabled` ne sert qu'au verrou d'ANTÉRIORITÉ
 * d'une étape sur la précédente. Un élève qui vient de comprendre doit pouvoir
 * refaire le geste.
 *
 * ─── LA ZONE DE PRÉHENSION, ET POURQUOI LES BOUTONS RESTENT INDISPENSABLES ──
 * Les crans de h ne sont PAS régulièrement espacés : ils se resserrent
 * géométriquement vers 0, parce que c'est exactement ce que la leçon veut
 * faire voir. La cellule de préhension d'un cran (sa part de l'axe, jusqu'à
 * mi-chemin de ses voisins) vaut donc, à 375 px de large et unit = 46 :
 *
 *     h = 2   → 69,00 px      h = 0,25 →  9,20 px
 *     h = 1   → 34,50 px      h = 0,1  →  4,60 px
 *     h = 0,5 → 17,25 px      h = 0,05 →  2,07 px
 *                             h = 0,01 →  1,15 px
 *
 * Le glisser porte donc CONFORTABLEMENT les crans grossiers — ceux où l'élève
 * découvre le geste et voit la sécante se coucher — et devient impraticable
 * sur la queue, où deux crans voisins sont distants de 1 px. Ce n'est pas un
 * défaut réparable en changeant le pas : resserrer les crans EST le sujet du
 * module. Les deux boutons sont donc, sur la fin de la convergence, le moyen
 * JUSTE et non un secours — et c'est pourquoi ils restent au premier plan.
 * Les sept valeurs ci-dessus sont recalculées par un test.
 */
const COURBE = '#4f46e5';
const SECANTE = '#0284c7';
const TANGENTE = '#e11d48';
const POINT = '#d97706';

export default function SecantLab({
  fn,
  a,
  h,
  onChangeH,
  visites = [],
  showTangente = false,
  disabled = false,
  aControls = null,
}) {
  const t = tauxDetail(fn, a, h);
  const sec = secante(fn, a, h);
  const tan = tangente(fn, a);
  const B = { x: a + h, y: fn.f(a + h) };

  const idx = H_STEPS.indexOf(h);
  const peutRapprocher = !disabled && idx >= 0 && idx < H_STEPS.length - 1;
  const peutEloigner = !disabled && idx > 0;

  // Le triangle « avancée / montée » : deux segments dérivés de l'état, jamais
  // dessinés à la main. Il matérialise les DEUX nombres du taux.
  const overlay = (toSvg) => {
    const pA = toSvg(a, fn.f(a));
    const pB = toSvg(B.x, B.y);
    const pCoin = toSvg(B.x, fn.f(a));
    return (
      <g pointerEvents="none">
        <line x1={pA.x} y1={pA.y} x2={pCoin.x} y2={pCoin.y} stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 3" />
        <line x1={pCoin.x} y1={pCoin.y} x2={pB.x} y2={pB.y} stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 3" />
      </g>
    );
  };

  const droites = [{ id: 'sec', a: sec.a, b: sec.b, tone: SECANTE, label: 'sécante (AB)' }];
  if (showTangente) droites.push({ id: 'tan', a: tan.a, b: tan.b, tone: TANGENTE, dashed: true, label: 'tangente en A' });

  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 ' +
    'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  return (
    <div className="space-y-3">
      <CoordPlane
        range={fn.range}
        unit={fn.unit}
        unitY={fn.unitY}
        xStep={1}
        yStep={fn.id === 'carre' ? 2 : 1}
        curves={[{ id: fn.id, points: sample(fn), tone: COURBE, width: 2.5 }]}
        functions={droites}
        // LES NOMS DES POINTS NE SONT PAS DANS LE SVG. Tout l'objet du module
        // est de faire CONVERGER B vers A : au dernier cran ils sont distants
        // de 0,01, et deux étiquettes « A » et « B » posées à côté d'eux se
        // chevaucheraient nécessairement (constaté par l'audit de mise en page
        // de l'e2e). Ils sont donc identifiés par la LÉGENDE en DOM ci-dessous,
        // qui reste lisible quel que soit l'écart — c'est la règle §6bis.4 :
        // un état atteignable ne doit jamais produire un affichage illisible.
        points={[
          { id: 'A', x: a, y: fn.f(a), color: POINT },
          { id: 'B', x: B.x, y: B.y, color: SECANTE },
        ]}
        overlay={overlay}
        caption={false}
        // Le pas d'aimantation est le plus FIN des écarts entre crans : c'est
        // lui qui permet à `hAimante` de distinguer 0,05 de 0,01. L'aimantation
        // pédagogique VRAIE est faite par `hAimante`, qui ne rend jamais qu'un
        // élément de H_STEPS — le `step` ne fait que fournir une résolution
        // suffisante en amont.
        step={{ x: 0.01, y: 0.01 }}
        // LE POINT B SE SAISIT, et le geste EST le rapprochement. `draggableId`
        // n'est annulé QUE par le verrou d'ANTÉRIORITÉ, jamais par la réussite.
        draggableId={disabled ? null : 'B'}
        onPointChange={(p) => onChangeH?.(hAimante(p.x, a))}
        ariaLabel={
          `Courbe de ${fn.label}. A a pour abscisse ${fr(a)}, B a pour abscisse ${fr(a + h)}. ` +
          `Écart h = ${fr(h)}. Montée ${fr(t.rise)}, avancée ${fr(t.run)}, ` +
          `pente de la sécante ${fr(arrondi(t.slope))}. ` +
          `Fais glisser le point B vers A, ou utilise les boutons rapprocher et éloigner.`
        }
      />

      {/* La légende des deux points : elle remplace les étiquettes SVG, qui se
          chevaucheraient quand B rejoint A. */}
      <div className="flex flex-wrap items-center gap-3 text-[13px]">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: POINT }} aria-hidden="true" />
          <strong>A</strong> ({fr(a)} ; {fr(arrondi(fn.f(a)))})
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: SECANTE }} aria-hidden="true" />
          <strong>B</strong> ({fr(arrondi(B.x))} ; {fr(arrondi(B.y))})
        </span>
      </div>

      {/* Les trois nombres du taux, dans le DOM. « Montée » et « avancée »
          restent côte à côte : c'est ce qui empêche de confondre le taux avec
          la seule différence des images. */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
          <div className="text-[13px] text-slate-500">avancée h</div>
          <div className="font-mono font-bold tabular-nums text-slate-900">{fr(t.run)}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
          <div className="text-[13px] text-slate-500">montée</div>
          <div className="font-mono font-bold tabular-nums text-slate-900">{fr(arrondi(t.rise))}</div>
        </div>
        <div className="rounded-lg border-2 border-sky-300 bg-sky-50 px-2 py-2">
          <div className="text-[13px] text-sky-700">pente</div>
          <div className="font-mono font-black tabular-nums text-sky-900">{fr(arrondi(t.slope))}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Régler l’écart entre A et B">
        <button type="button" className={btn} onClick={() => onChangeH?.(H_STEPS[idx - 1])} disabled={!peutEloigner} aria-label="Éloigner B de A">
          ← éloigner
        </button>
        <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold tabular-nums text-sm">h = {fr(h)}</span>
        <button type="button" className={btn} onClick={() => onChangeH?.(H_STEPS[idx + 1])} disabled={!peutRapprocher} aria-label="Rapprocher B de A">
          rapprocher →
        </button>
        {aControls}
      </div>

      {/* L'historique : la SUITE des pentes est ce qui fait la découverte, pas
          la dernière. Il est en DOM et se lit au lecteur d'écran. */}
      {visites.length > 1 && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
          <div className="text-[13px] font-semibold text-indigo-900 mb-2">Les pentes déjà obtenues</div>
          <ul className="flex flex-wrap gap-2">
            {visites.map((hv) => (
              <li key={hv} className="rounded-lg bg-white border border-indigo-200 px-2.5 py-1 font-mono text-[13px] tabular-nums">
                h = {fr(hv)} → <strong>{fr(arrondi(tauxDetail(fn, a, hv).slope))}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Arrondi d'affichage : quatre décimales suffisent et évitent 2,0999999999. */
const arrondi = (n) => Math.round(n * 10000) / 10000;

/** La courbe échantillonnée, coupée au cadre. */
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
