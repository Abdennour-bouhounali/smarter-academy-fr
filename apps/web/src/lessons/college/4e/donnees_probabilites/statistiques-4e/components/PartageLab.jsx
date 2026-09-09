import React, { useCallback, useRef, useState } from 'react';
import { valeurs, medianeDetail, fr } from './stats4e';

/**
 * PartageLab — la coupure qu'on déplace jusqu'à équilibrer les deux moitiés.
 *
 * Activity               tirer un trait vertical sur la série rangée et lire,
 *                        de part et d'autre, COMBIEN de valeurs il laisse.
 * Mathematical objective la médiane est la valeur qui partage l'effectif en
 *                        deux moitiés de MÊME TAILLE — définition trouvée par
 *                        le geste, avant d'être nommée. Le cas pair y apparaît
 *                        de lui-même : l'équilibre s'obtient sur tout un
 *                        intervalle, et la valeur retenue est le milieu de ses
 *                        deux bornes.
 * Student action         glisser la coupure, au pas d'un demi-cran, à la
 *                        souris, au doigt ou aux flèches.
 * Controlled variable    la position de la coupure. La série ne bouge pas.
 * Mathematical state     la position `coupe` ; les deux effectifs et le
 *                        verdict d'équilibre en sont DÉRIVÉS. La valeur de
 *                        référence vient de `medianeDetail`, jamais d'un
 *                        second calcul écrit ici.
 * Visual consequence     les pastilles se colorent selon le côté où elles
 *                        tombent, et les deux compteurs se réécrivent.
 * Expected observation   « il y a plusieurs endroits où c'est équilibré, et
 *                        pas un seul » — la porte d'entrée du cas pair.
 * Misconception targeted chercher la médiane DANS la liste quand l'effectif
 *                        est pair : ici l'équilibre s'obtient entre deux
 *                        valeurs, et la coupure ne tombe sur aucune pastille.
 *
 * ATTEIGNABILITÉ. Le pas vaut un demi-cran de l'unité de la série : chacune
 * des deux bornes de la zone d'équilibre est donc exactement atteignable, et
 * leur milieu — la médiane — aussi quand il est un demi-entier. Un test de
 * `parcours.test.js` le verrouille sur les séries employées.
 *
 * SÉCURITÉ VISUELLE : aucun `<text>` dans le SVG ; les deux compteurs et la
 * position de la coupure vivent dans le DOM, en colonnes fixes.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement.
 */
const W = 1000;
const H = 130;
const PAD = { g: 26, d: 26 };
const RAYON = 14;

export default function PartageLab({
  serie,
  coupe,
  onCoupe,
  axe,
  pas = 0.5,
  montrerVerdict = true,
}) {
  const svgRef = useRef(null);
  const [glisse, setGlisse] = useState(false);

  const vs = valeurs(serie);
  const detail = medianeDetail(serie);

  const lo = axe.min;
  const hi = axe.max;
  const span = hi - lo || 1;
  const largeur = W - PAD.g - PAD.d;
  const xOf = (v) => PAD.g + ((v - lo) / span) * largeur;
  const baseY = H - 34;

  // Les deux effectifs de part et d'autre. Une valeur POSÉE EXACTEMENT sur la
  // coupure n'est ni d'un côté ni de l'autre : on la compte à part plutôt que
  // de l'attribuer en silence, ce qui rendrait le compteur faux d'une unité.
  const gauche = vs.filter((v) => v < coupe).length;
  const droite = vs.filter((v) => v > coupe).length;
  const dessus = vs.filter((v) => v === coupe).length;

  /* DEUX FAÇONS D'ÊTRE ÉQUILIBRÉ, ET C'EST TOUTE LA LEÇON DU MODULE.
     · effectif PAIR — la coupure passe ENTRE deux valeurs, laissant autant de
       part et d'autre et rien dessus. La médiane n'appartient alors à personne.
     · effectif IMPAIR — la coupure tombe SUR une valeur, qui n'est ni d'un
       côté ni de l'autre, et il en reste autant de chaque côté. La médiane est
       cette valeur-là.
     Refuser le second cas rendrait l'étape de l'effectif impair littéralement
     impossible : aucune position du curseur ne validerait jamais. */
  const equilibre = gauche === droite && (dessus === 0 || dessus === 1);
  const surUneValeur = equilibre && dessus === 1;

  const vues = new Map();
  const pastilles = serie.items.map((it, i) => {
    const k = vues.get(it.valeur) ?? 0;
    vues.set(it.valeur, k + 1);
    return { ...it, i, empile: k };
  });
  const yOf = (empile) => baseY - RAYON - 4 - empile * (RAYON * 2 + 3);

  const borne = (v) => Math.max(lo, Math.min(hi, v));
  const cran = (v) => borne(Math.round(v / pas) * pas);

  const valeurDeLEvenement = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return coupe;
    const r = svg.getBoundingClientRect();
    if (r.width === 0) return coupe;
    const xSvg = ((e.clientX - r.left) / r.width) * W;
    return cran(lo + ((xSvg - PAD.g) / largeur) * span);
  }, [coupe, lo, span, largeur, pas]);

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setGlisse(true);
    onCoupe(valeurDeLEvenement(e));
  };
  const onPointerMove = (e) => { if (glisse) onCoupe(valeurDeLEvenement(e)); };
  const finGlisse = (e) => {
    if (!glisse) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setGlisse(false);
  };
  const onKeyDown = (e) => {
    const map = { ArrowLeft: -pas, ArrowDown: -pas, ArrowRight: pas, ArrowUp: pas };
    if (e.key in map) { e.preventDefault(); onCoupe(borne(coupe + map[e.key])); return; }
    if (e.key === 'Home') { e.preventDefault(); onCoupe(lo); return; }
    if (e.key === 'End') { e.preventDefault(); onCoupe(hi); }
  };

  const graduations = [];
  for (let t = lo; t <= hi + 1e-9; t += axe.pas) graduations.push(Math.round(t));
  const x = xOf(coupe);

  return (
    <div className="space-y-3" role="group" aria-label="Partager la série en deux moitiés">

      {/* ── LES DEUX COMPTEURS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        <div className={`rounded-2xl border-2 p-3 text-center ${equilibre ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
          <p className="text-xs font-semibold text-slate-500">À gauche de la coupure</p>
          <p className="font-mono text-3xl font-black tabular-nums text-slate-800" data-gauche>{gauche}</p>
        </div>
        <div className={`rounded-2xl border-2 p-3 text-center ${equilibre ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
          <p className="text-xs font-semibold text-slate-500">À droite de la coupure</p>
          <p className="font-mono text-3xl font-black tabular-nums text-slate-800" data-droite>{droite}</p>
        </div>
      </div>

      {/* ── LA SÉRIE ET SA COUPURE ─────────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3">
        <svg
          ref={svgRef}
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          className="select-none touch-none"
          style={{ touchAction: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finGlisse}
          onPointerCancel={finGlisse}
          role="img"
          aria-label={`${vs.length} valeurs sur un axe de ${lo} à ${hi} ${serie.unite}. La coupure est à ${fr(coupe)}, avec ${gauche} à gauche et ${droite} à droite.`}
        >
          <line x1={PAD.g} y1={baseY} x2={W - PAD.d} y2={baseY} stroke="#475569" strokeWidth="3" />
          {graduations.map((t) => (
            <line key={t} x1={xOf(t)} y1={baseY} x2={xOf(t)} y2={baseY + 8} stroke="#94a3b8" strokeWidth="2" />
          ))}

          {pastilles.map((p) => (
            <circle
              key={p.cle}
              cx={xOf(p.valeur)}
              cy={yOf(p.empile)}
              r={RAYON}
              fill={p.valeur === coupe ? '#a16207' : p.valeur < coupe ? '#0284c7' : '#7c3aed'}
              stroke="#fff"
              strokeWidth="3"
            >
              <title>{`${p.libelle ?? 'valeur'} : ${fr(p.valeur)} ${serie.unite}`}</title>
            </circle>
          ))}

          {/* LA COUPURE : un trait plein, sa poignée, et une zone de
              préhension de 60 unités — largement au-delà des 44 px requis. */}
          <g
            role="slider"
            tabIndex={0}
            aria-label="Position de la coupure"
            aria-valuemin={lo}
            aria-valuemax={hi}
            aria-valuenow={coupe}
            aria-valuetext={`${fr(coupe)} ${serie.unite}, ${gauche} à gauche et ${droite} à droite`}
            onKeyDown={onKeyDown}
            style={{ cursor: glisse ? 'grabbing' : 'ew-resize', outline: 'none' }}
            className="focus-visible:[&>circle]:stroke-blue-500"
          >
            <rect x={x - 30} y={0} width={60} height={H} fill="transparent" />
            <line x1={x} y1={4} x2={x} y2={baseY + 12} stroke={equilibre ? '#059669' : '#0f172a'} strokeWidth={glisse ? 6 : 4.5} />
            <circle cx={x} cy={16} r="12" fill={equilibre ? '#059669' : '#0f172a'} stroke="transparent" strokeWidth="3" />
            <path
              d="M -5 12 L -9 16 L -5 20 M 5 12 L 9 16 L 5 20"
              transform={`translate(${x}, 0)`}
              fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
          </g>
        </svg>

        <div className="flex justify-between px-1 text-xs tabular-nums text-slate-400">
          {graduations.map((t) => <span key={t}>{t}</span>)}
        </div>
      </div>

      {/* ── LA POSITION ET LE VERDICT ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2">
        <span className="text-sm text-slate-600">Coupure placée à</span>
        <span className="font-mono text-lg font-black tabular-nums text-slate-900" data-coupe>
          {fr(coupe)} {serie.unite}
        </span>
      </div>

      {montrerVerdict && (
        <p
          data-verdict
          className={`rounded-xl px-3 py-2 text-sm font-semibold ${
            equilibre ? 'bg-emerald-50 text-emerald-900'
              : dessus > 0 ? 'bg-amber-50 text-amber-900'
                : 'bg-slate-100 text-slate-600'
          }`}
        >
          {equilibre
            ? surUneValeur
              ? `Équilibré : ${gauche} d’un côté, ${droite} de l’autre, et la coupure passe exactement sur une valeur.`
              : `Équilibré : ${gauche} d’un côté, ${droite} de l’autre, et la coupure ne touche aucune valeur.`
            : dessus > 0
              ? `La coupure passe sur ${dessus} valeurs à la fois : ${gauche} d’un côté et ${droite} de l’autre, ce n’est pas équilibré.`
              : `${gauche} d’un côté contre ${droite} de l’autre : déplace encore la coupure.`}
        </p>
      )}
    </div>
  );
}

/**
 * Les positions du curseur qui ÉQUILIBRENT — même règle que la figure, écrite
 * une seule fois : autant de valeurs de chaque côté, et au plus une posée
 * exactement sur la coupure. Exportée pour que `parcours.test.js` vérifie
 * qu'une position gagnante EXISTE sur chaque série employée, et qu'elle est
 * bien la médiane du noyau (mémoire « cible atteignable sur la grille »).
 */
export function zoneEquilibre(serie, axe, pas = 0.5) {
  const vs = valeurs(serie);
  const out = [];
  for (let c = axe.min; c <= axe.max + 1e-9; c += pas) {
    const v = Math.round(c / pas) * pas;
    const g = vs.filter((x) => x < v).length;
    const d = vs.filter((x) => x > v).length;
    const s = vs.filter((x) => x === v).length;
    if (g === d && s <= 1) out.push(v);
  }
  return out;
}
