import React, { useCallback, useRef, useState } from 'react';
import { cransSonde, etatSonde, bandesDeSigne, echantillon, abscisseAimantee, graduationsY, pasDe, fr } from './variationsUtils';

/**
 * DeuxPanneaux — l'interaction SIGNATURE : « deux lignes qui se répondent ».
 *
 * Activity               deux panneaux EMPILÉS et alignés sur le MÊME axe des
 *                        abscisses — la courbe de f en haut, celle de f′ en
 *                        dessous. UNE SEULE sonde verticale les traverse tous
 *                        les deux ; l'élève la déplace au cliquet.
 * Mathematical objective le SIGNE de la courbe du bas EST le sens de marche de
 *                        celle du haut, et les deux basculent EXACTEMENT aux
 *                        mêmes abscisses.
 * Student action         SAISIR la sonde et la faire GLISSER, dans l'un ou
 *                        l'autre panneau — c'est le geste principal (règle
 *                        utilisateur : on attrape la figure, on ne la pilote
 *                        pas au bouton). Le glisser AIMANTE sur le pas de la
 *                        sonde, si bien que chaque zéro de f′ reste
 *                        exactement atteignable même quand un doigt vise mal
 *                        — c'est ce que verrouille le test « CIBLE
 *                        ATTEIGNABLE », et c'est plus critique au glisser
 *                        qu'au bouton. Le clavier (flèches, Home, End) et les
 *                        deux boutons ± restent des chemins complets, en
 *                        second.
 * Controlled variable    x, l'abscisse de la sonde. C'est la DISTINCTION avec
 *                        `derivation-nombre-derive-1ere` M1, où l'élève
 *                        contrôlait h en un point FIXE : ici h a disparu, et
 *                        c'est le point lui-même qui se promène.
 * Mathematical state     { fn, x } ; la flèche du haut, la position par rapport
 *                        à l'axe du bas et les bandes peintes en sont TOUTES
 *                        dérivées par `etatSonde` et `bandesDeSigne`.
 * Visual consequence     la flèche du haut bascule ↗ ↔ ↘ à l'instant où la
 *                        pastille du bas traverse l'axe.
 * Expected observation   « les deux changent en même temps, au même endroit ».
 * Misconception targeted « le signe de f′ dit si la courbe est au-dessus ou en
 *                        dessous de l'axe » ; « f′(a) = 0 donne un sommet ».
 *
 * ─── POURQUOI UNE GÉOMÉTRIE PROPRE ET NON DEUX CoordPlane ───────────────────
 * `CoordPlane` calcule sa marge gauche d'après la largeur de ses étiquettes
 * d'ordonnées. Or les deux panneaux n'ont PAS la même échelle verticale : deux
 * CoordPlane empilés auraient donc deux marges gauches différentes, et l'axe
 * des abscisses du bas serait décalé de quelques pixels par rapport à celui du
 * haut. La sonde serait alors à un x dans le haut et à un autre dans le bas —
 * exactement le mensonge que le module entend interdire. Les deux panneaux
 * partagent donc ICI une SEULE fonction `toX`, et le test verrouille l'égalité
 * des largeurs (« les deux panneaux gardent la même LARGEUR en pixels »).
 *
 * Les nombres vivent dans le DOM, jamais en <text> SVG : c'est la parade §16
 * contre les collisions d'étiquettes quand la sonde s'approche d'un zéro.
 *
 * JAMAIS GELÉ après réussite : `disabled` ne sert qu'au verrou d'ANTÉRIORITÉ
 * d'une étape sur la précédente. Un élève qui vient de comprendre doit pouvoir
 * refaire le geste.
 *
 * ─── PIÈGES DU GLISSER (mémoire `geo5e_drag_touch_traps`) ──────────────────
 *  - `setPointerCapture` sur le pointerdown : sans lui, sortir du SVG en
 *    glissant perd le pointeur et la sonde reste plantée.
 *  - `touchAction: 'none'` : sans lui, le navigateur fait défiler la page au
 *    lieu de déplacer la sonde sur mobile.
 *  - AIMANTATION dès la conversion : on ne stocke jamais un x continu, ce qui
 *    garantit que l'état est TOUJOURS un cran — donc toujours atteignable, et
 *    toujours exactement lisible.
 *  - une zone tactile PLEIN CADRE : on n'exige pas de viser la pastille, qui
 *    fait moins de 15 px et qu'un doigt ne trouve pas.
 */
const COURBE_F = '#4f46e5';
const COURBE_FP = '#0284c7';
const SONDE = '#d97706';
const TONE_FILL = { emerald: '#059669', rose: '#e11d48', slate: '#64748b' };

const PAD = { left: 46, right: 18, top: 16, bottom: 22 };

/** Le chemin d'une courbe échantillonnée, dans la géométrie d'un panneau. */
function chemin(points, toX, toY) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.x).toFixed(2)},${toY(p.y).toFixed(2)}`).join(' ');
}

/**
 * Un panneau : cadre, axes, courbe, bandes de signe, sonde. Géométrie en x
 * IMPOSÉE de l'extérieur — c'est ce qui aligne les deux panneaux au pixel.
 * Chaque panneau porte SA propre zone de glisser : la sonde s'attrape aussi
 * bien en haut qu'en bas, et les deux commandent le même x.
 */
function Panneau({ range, unitY, courbe, tone, toX, fromX, largeurTracee, x, bandes, marqueZero, titre, sousTitre, onGlisser, interactif, ariaLabel }) {
  const hauteur = (range.yMax - range.yMin) * unitY;
  const toY = (y) => PAD.top + (range.yMax - y) * unitY;
  const y0 = Math.max(PAD.top, Math.min(PAD.top + hauteur, toY(0)));
  const axeVisible = range.yMin <= 0 && range.yMax >= 0;
  const W = PAD.left + largeurTracee + PAD.right;
  const H = PAD.top + hauteur + PAD.bottom;

  const svgRef = useRef(null);
  const glisse = useRef(false);
  const [focus, setFocus] = useState(false);

  // Les graduations viennent du MODÈLE, comme tout le reste de ce qui s'affiche.
  const graduations = graduationsY(range);

  /** Le point du SVG sous le pointeur, converti en abscisse mathématique. */
  const abscisseSous = (clientX) => {
    const el = svgRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    // Le SVG est mis à l'échelle par le viewBox : on repasse en unités de
    // viewBox AVANT de convertir, sinon la sonde suit le doigt avec un
    // facteur d'erreur invisible sur grand écran et énorme sur mobile.
    return fromX(((clientX - r.left) / r.width) * W);
  };

  const commencer = (e) => {
    if (!interactif) return;
    glisse.current = true;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* déjà relâché */ }
    const v = abscisseSous(e.clientX);
    if (v !== null) onGlisser?.(v);
  };

  const bouger = (e) => {
    if (!interactif || !glisse.current) return;
    const v = abscisseSous(e.clientX);
    if (v !== null) onGlisser?.(v);
  };

  const finir = (e) => {
    if (!glisse.current) return;
    glisse.current = false;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* idem */ }
  };

  /** L'alternative OBLIGATOIRE au glisser : le clavier, sur le même élément. */
  const auClavier = (e) => {
    if (!interactif) return;
    const gestes = {
      ArrowRight: 'droite', ArrowUp: 'droite',
      ArrowLeft: 'gauche', ArrowDown: 'gauche',
      Home: 'debut', End: 'fin',
    };
    if (!(e.key in gestes)) return;
    e.preventDefault();
    onGlisser?.(gestes[e.key], true);
  };

  // `outline: 'none'` puis un anneau DESSINÉ : le contour noir par défaut d'un
  // SVG focusable encadre tout le cadre et ne dit pas OÙ est la poignée
  // (mémoire `svg_handle_focus_ring`).
  const styleSvg = {
    maxWidth: W,
    height: 'auto',
    touchAction: 'none',
    outline: 'none',
    cursor: interactif ? 'ew-resize' : 'default',
  };

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-baseline gap-x-2 text-[13px]">
        <span className="font-bold" style={{ color: tone }}>{titre}</span>
        <span className="text-slate-500">{sousTitre}</span>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={styleSvg}
        onPointerDown={commencer}
        onPointerMove={bouger}
        onPointerUp={finir}
        onPointerCancel={finir}
        onKeyDown={auClavier}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        tabIndex={interactif ? 0 : undefined}
        {...(interactif
          ? { role: 'group', 'aria-label': ariaLabel }
          : { role: 'img', 'aria-hidden': true })}
      >
        <rect x={PAD.left} y={PAD.top} width={largeurTracee} height={hauteur} fill="#ffffff" stroke="#e2e8f0" />
        {/* La zone de saisie : PLEIN CADRE, jamais la seule pastille. On
            n'exige pas de l'élève qu'il vise un disque de 13 px. */}
        {interactif && (
          <rect x={PAD.left} y={PAD.top} width={largeurTracee} height={hauteur} fill="transparent" />
        )}

        {/* Les bandes de signe, DÉRIVÉES du modèle — donc identiques dans les
            deux panneaux. C'est la synchronisation, peinte. */}
        {bandes.map((b) => (
          <rect
            key={`${b.from}-${b.to}`}
            x={toX(b.from)}
            y={PAD.top}
            width={Math.max(0, toX(b.to) - toX(b.from))}
            height={hauteur}
            fill={TONE_FILL[b.tone]}
            opacity="0.10"
          />
        ))}

        {/* Les graduations : un panneau sans repère gradué ne se lit pas, et
            l'élève doit pouvoir dire « ici f′ vaut environ 3 ». Les étiquettes
            d'ordonnées vivent dans la marge GAUCHE, réservée par PAD.left. */}
        {graduations.map((g) => (
          <g key={`g${g}`}>
            <line x1={PAD.left - 4} y1={toY(g)} x2={PAD.left} y2={toY(g)} stroke="#94a3b8" strokeWidth="1" />
            <text x={PAD.left - 7} y={toY(g) + 3.5} textAnchor="end" fontSize="10" fill="#64748b" fontFamily="ui-monospace, monospace">
              {fr(g)}
            </text>
          </g>
        ))}

        {/* L'axe des abscisses — la ligne de partage du panneau du bas. */}
        {axeVisible && (
          <line x1={PAD.left} y1={y0} x2={PAD.left + largeurTracee} y2={y0} stroke="#334155" strokeWidth="1.5" />
        )}

        {/* Les frontières : là où f′ s'annule EN CHANGEANT de signe. */}
        {marqueZero.map((z) => (
          <line key={z} x1={toX(z)} y1={PAD.top} x2={toX(z)} y2={PAD.top + hauteur}
            stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
        ))}

        <path d={chemin(courbe, toX, toY)} fill="none" stroke={tone} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />

        {/* LA SONDE — la même abscisse dans les deux panneaux. */}
        <line x1={toX(x.x)} y1={PAD.top} x2={toX(x.x)} y2={PAD.top + hauteur}
          stroke={SONDE} strokeWidth="2.5" strokeDasharray="6 4" />
        {x.y >= range.yMin && x.y <= range.yMax && (
          <g pointerEvents="none">
            {interactif && (
              <circle cx={toX(x.x)} cy={toY(x.y)} r="12" fill={SONDE} opacity="0.18" />
            )}
            {focus && (
              <circle cx={toX(x.x)} cy={toY(x.y)} r="12" fill="none" stroke="#2563eb" strokeWidth="3" />
            )}
            <circle cx={toX(x.x)} cy={toY(x.y)} r="6.5" fill={tone} stroke="#ffffff" strokeWidth="2.5" />
          </g>
        )}
      </svg>
    </div>
  );
}

export default function DeuxPanneaux({
  fn,
  x,
  onChangeX,
  visites = [],
  montrerBandes = true,
  disabled = false,
  pas = null,
}) {
  // Le pas vient de la FONCTION : c'est lui qui garantit une zone de saisie
  // tactile sur un domaine large (voir `pasDe`).
  const pasEffectif = pas ?? pasDe(fn);
  const crans = cransSonde(fn, pasEffectif);
  const e = etatSonde(fn, x);
  const bandes = montrerBandes ? bandesDeSigne(fn) : [];
  // Une frontière n'est tracée que là où le signe CHANGE vraiment. Sur x³, les
  // deux bandes ont fusionné : aucune frontière n'apparaît en 0, et c'est
  // précisément ce que le contre-exemple doit donner à voir.
  const marqueZero = montrerBandes ? bandes.slice(1).map((b) => b.from) : [];

  // La géométrie en x, PARTAGÉE : une seule fonction pour les deux panneaux.
  const largeurTracee = (fn.domain.xMax - fn.domain.xMin) * fn.fUnit;
  const toX = useCallback(
    (v) => PAD.left + (v - fn.domain.xMin) * fn.fUnit,
    [fn.domain.xMin, fn.fUnit],
  );

  const idx = crans.findIndex((c) => Math.abs(c - x) < 1e-9);

  /**
   * L'inverse de `toX`, AIMANTÉ sur le cran le plus proche et borné au domaine.
   *
   * L'aimantation a lieu ICI, à la conversion, et non après coup : l'état de la
   * leçon n'est donc JAMAIS un x continu. C'est ce qui garantit qu'un zéro de
   * f′ reste atteignable au doigt comme au clavier — un glisser aimanté sur un
   * quart d'unité ne peut pas « rater » −1 ou 1, alors qu'un glisser libre les
   * raterait presque toujours.
   */
  const fromX = useCallback((px) => abscisseAimantee(fn, px, PAD.left, pasEffectif), [fn, pasEffectif]);

  /**
   * Le seul point d'entrée du déplacement, quel que soit le geste : glisser,
   * clavier ou bouton. Il reçoit soit une abscisse déjà aimantée, soit le nom
   * d'un geste de clavier. Updater PUR : il ne lit que `crans` et son argument.
   */
  const deplacer = (v, auClavier = false) => {
    if (disabled) return;
    if (!auClavier) {
      if (typeof v === 'number' && Number.isFinite(v)) onChangeX?.(v);
      return;
    }
    if (v === 'debut') { onChangeX?.(crans[0]); return; }
    if (v === 'fin') { onChangeX?.(crans[crans.length - 1]); return; }
    const cible = idx + (v === 'droite' ? 1 : -1);
    if (cible >= 0 && cible < crans.length) onChangeX?.(crans[cible]);
  };

  const legendeSonde =
    `Sonde de ${fn.label}. Glisse-la, ou utilise les flèches du clavier. ` +
    `Actuellement en x = ${fr(x)} : ${fn.name} y est ${etatSonde(fn, x).sens}, ` +
    `et ${fn.name}′ y est ${etatSonde(fn, x).position} de l’axe.`;
  const peutGauche = !disabled && idx > 0;
  const peutDroite = !disabled && idx >= 0 && idx < crans.length - 1;

  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 ' +
    'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  const tonSens = e.signe > 0 ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : e.signe < 0 ? 'text-rose-700 bg-rose-50 border-rose-200'
    : 'text-slate-700 bg-slate-100 border-slate-300';

  return (
    <div className="space-y-3">
      {/* Le lecteur d'écran reçoit l'état COMPLET des deux panneaux d'un coup :
          la synchronisation ne doit pas être réservée à la vue. */}
      <p className="sr-only" aria-live="polite">
        Sonde en x = {fr(x)}. En haut, {fn.name} vaut {fr(Math.round(e.y * 1000) / 1000)} et la
        courbe est {e.sens === 'constante' ? 'momentanément plate' : e.sens}. En bas,{' '}
        {fn.name}′ vaut {fr(Math.round(e.d * 1000) / 1000)}, {e.position} de l’axe.
      </p>

      <Panneau
        range={fn.fRange} unitY={fn.fUnitY}
        courbe={echantillon(fn.f, fn.fRange, 300)}
        tone={COURBE_F} toX={toX} fromX={fromX} largeurTracee={largeurTracee}
        x={{ x, y: e.y }} bandes={bandes} marqueZero={marqueZero}
        titre={`Panneau du haut · ${fn.label}`}
        sousTitre="la fonction elle-même — attrape la sonde et fais-la glisser"
        onGlisser={deplacer}
        interactif={!disabled}
        ariaLabel={legendeSonde}
      />

      {/* La flèche du HAUT : le sens de marche, dans le DOM. */}
      <div className={`flex flex-wrap items-center gap-3 rounded-xl border-2 px-3 py-2 ${tonSens}`}>
        <span className="text-2xl leading-none font-black" aria-hidden="true">{e.fleche}</span>
        <span className="text-sm font-semibold">
          en x = {fr(x)}, la courbe du haut{' '}
          {e.sens === 'constante' ? <>ne monte ni ne descend</> : <>est {e.sens}</>}
        </span>
      </div>

      <Panneau
        range={fn.fpRange} unitY={fn.fpUnitY}
        courbe={echantillon(fn.fPrime, fn.fpRange, 300)}
        tone={COURBE_FP} toX={toX} fromX={fromX} largeurTracee={largeurTracee}
        x={{ x, y: e.d }} bandes={bandes} marqueZero={marqueZero}
        titre={`Panneau du bas · ${fn.fPrimeText}`}
        sousTitre="sa dérivée — la même sonde s’attrape ici aussi"
        onGlisser={deplacer}
        interactif={!disabled}
        ariaLabel={legendeSonde}
      />

      {/* Les trois nombres, dans le DOM — jamais en <text> SVG. */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
          <div className="text-[13px] text-slate-500">x</div>
          <div className="font-mono font-bold tabular-nums text-slate-900">{fr(x)}</div>
        </div>
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-2">
          <div className="text-[13px] text-indigo-700">{fn.name}(x)</div>
          <div className="font-mono font-bold tabular-nums text-indigo-900">{fr(Math.round(e.y * 1000) / 1000)}</div>
        </div>
        <div className="rounded-lg border-2 border-sky-300 bg-sky-50 px-2 py-2">
          <div className="text-[13px] text-sky-700">{fn.name}′(x)</div>
          <div className="font-mono font-black tabular-nums text-sky-900">{fr(Math.round(e.d * 1000) / 1000)}</div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
        Dans le panneau du bas, la pastille est <strong>{e.position}</strong> de l’axe.
      </div>

      {/* Chemin SECONDAIRE. Le geste principal est le glisser, dans l'un ou
          l'autre panneau ; ces deux boutons restent là comme secours tactile et
          pour avancer d'un cran exact. */}
      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Avancer la sonde d’un cran">
        <button type="button" className={btn} onClick={() => deplacer('gauche', true)} disabled={!peutGauche} aria-label="Déplacer la sonde d’un cran vers la gauche">
          ← un cran
        </button>
        <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold tabular-nums text-sm">x = {fr(x)}</span>
        <button type="button" className={btn} onClick={() => deplacer('droite', true)} disabled={!peutDroite} aria-label="Déplacer la sonde d’un cran vers la droite">
          un cran →
        </button>
      </div>

      {/* L'historique des zones traversées : c'est la SUITE des observations
          qui fait la découverte, pas la dernière. */}
      {visites.length > 1 && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
          <div className="text-[13px] font-semibold text-indigo-900 mb-2">Ce que tu as déjà relevé</div>
          <ul className="flex flex-wrap gap-2">
            {visites.map((xv) => {
              const ev = etatSonde(fn, xv);
              return (
                <li key={xv} className="rounded-lg bg-white border border-indigo-200 px-2.5 py-1 font-mono text-[13px] tabular-nums">
                  x = {fr(xv)} → {fn.name}′ {ev.signe > 0 ? '> 0' : ev.signe < 0 ? '< 0' : '= 0'} · <strong>{ev.fleche}</strong>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
