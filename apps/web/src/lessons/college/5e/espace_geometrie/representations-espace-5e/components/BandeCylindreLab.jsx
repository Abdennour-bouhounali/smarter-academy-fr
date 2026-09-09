import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { perimetreBase, diametre, verifierBande, fmtLong } from './espace5e';

/**
 * BandeCylindreLab — la manipulation SIGNATURE de la leçon (§6bis).
 *
 * L'élève DÉROULE la surface latérale d'un cylindre et règle la longueur de
 * la bande jusqu'à ce que le tube se referme exactement. Trois états sont
 * atteignables et tous les trois se VOIENT :
 *
 *   trop courte  → il reste un jour, le carton ne fait pas le tour ;
 *   trop longue  → la bande se chevauche en se refermant ;
 *   exacte       → le tube se ferme, sans jour ni recouvrement.
 *
 * C'est ainsi que le périmètre se découvre : non pas comme une formule
 * annoncée puis illustrée, mais comme la SEULE longueur qui referme le tube.
 * Le piège du diamètre (§5, M5) est un état atteignable — la bande y est
 * visiblement trop courte, et l'élève le constate au lieu qu'on le lui dise.
 *
 * ─── DEUX REGISTRES SYNCHRONISÉS ──────────────────────────────────────
 * À gauche le patron à plat (le carton), à droite le tube en cours de
 * fermeture. Un seul état, deux dessins : bouger le curseur les met à jour
 * ensemble, si bien que « la bande » et « le tour du disque » deviennent la
 * même grandeur.
 *
 * ─── SÉCURITÉ VISUELLE (§17bis) ───────────────────────────────────────
 * Les cotes sont écrites dans une couche HTML sous chaque dessin, jamais en
 * <text> SVG par-dessus le tracé : elles ne peuvent donc chevaucher ni la
 * bande ni le disque, quelle que soit la longueur réglée. Le viewBox est
 * dimensionné pour la longueur MAXIMALE atteignable, pas pour la valeur par
 * défaut — sinon le dessin déborderait dès que l'élève dépasse.
 */

const H_SVG = 190;
const PAD = 22;
const ECHELLE = 4.2;      // px par unité de longueur

export default function BandeCylindreLab({
  cyl,
  longueur,                 // longueur de la bande, contrôlée par le module
  onLongueur,
  longueurMax = null,       // borne du réglage ; déf. 1,6 × le périmètre
  // RÈGLE D'ATTEIGNABILITÉ (§10.6) : la bonne longueur est un périmètre
  // (2πr = 25,13 pour r = 4), qui n'est JAMAIS un multiple de 0,5. Un pas de
  // 0,5 rendrait la cible littéralement inatteignable — l'élève ne pourrait
  // pas réussir la manipulation. Le pas est donc de 0,1, et la tolérance de
  // validation (0,05) reste plus fine que lui : deux crans voisins ne peuvent
  // pas être « justes » tous les deux.
  step = 0.1,
  disabled = false,
  ariaLabel,
}) {
  const uid = useId();
  const pisteRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const attendu = perimetreBase(cyl);
  const max = longueurMax ?? Math.ceil(attendu * 1.6);
  const min = step;
  const verdict = verifierBande(longueur, cyl, 0.05);
  const interactive = !disabled && Boolean(onLongueur);

  // Le cadre tient la bande la PLUS LONGUE possible : le dessin ne peut donc
  // pas sortir du viewBox quand l'élève pousse le curseur au maximum.
  const W = max * ECHELLE + PAD * 2;
  const hBande = cyl.hauteur * ECHELLE;

  const clamp = useCallback(
    (v) => Math.max(min, Math.min(max, Number((Math.round(v / step) * step).toFixed(6)))),
    [max, min, step],
  );

  const fromClientX = useCallback((clientX) => {
    const box = pisteRef.current?.getBoundingClientRect();
    if (!box) return longueur;
    const ratio = (clientX - box.left) / box.width;
    return min + ratio * (max - min);
  }, [longueur, max, min]);

  useEffect(() => {
    if (!drag) return undefined;
    const onMove = (e) => {
      const t = e.touches ? e.touches[0] : e;
      onLongueur?.(clamp(fromClientX(t.clientX)));
    };
    const stop = () => setDrag(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchend', stop);
    };
  }, [clamp, drag, fromClientX, onLongueur]);

  /**
   * Clavier : un pas GROSSIER pour traverser la plage, un pas FIN pour se
   * poser sur la bonne valeur.
   *
   * Le pas fin (0,1) est nécessaire pour que le périmètre soit atteignable
   * (voir `step`), mais il demanderait ~250 appuis pour parcourir toute la
   * plage — inutilisable au clavier. Les flèches gauche/droite avancent donc
   * d'un pas grossier (1), et haut/bas affinent au dixième. PageUp/PageDown
   * font de même, pour qui connaît la convention des curseurs.
   */
  const gros = Math.max(step, 1);
  const onKeyDown = (e) => {
    if (!interactive) return;
    const d = {
      ArrowLeft: -gros, ArrowRight: gros, PageDown: -gros, PageUp: gros,
      ArrowDown: -step, ArrowUp: step,
    }[e.key];
    if (d !== undefined) { e.preventDefault(); onLongueur?.(clamp(longueur + d)); }
    if (e.key === 'Home') { e.preventDefault(); onLongueur?.(min); }
    if (e.key === 'End') { e.preventDefault(); onLongueur?.(max); }
  };

  /* ── Le tube en cours de fermeture ────────────────────────────────────
     La bande est enroulée autour de la base : l'angle couvert est
     proportionnel à la longueur, si bien qu'un jour ou un recouvrement se
     voit directement, sans qu'aucun texte n'ait à le dire. */
  const R = 34;
  const CX = 60;
  const CY = 62;
  const angle = (longueur / attendu) * 2 * Math.PI;   // 2π quand c'est exact
  const couvert = Math.min(angle, 2 * Math.PI);
  const arc = (a) => {
    const large = a > Math.PI ? 1 : 0;
    const x = CX + R * Math.cos(a - Math.PI / 2);
    const y = CY + R * Math.sin(a - Math.PI / 2);
    return `M ${CX} ${CY - R} A ${R} ${R} 0 ${large} 1 ${x} ${y}`;
  };

  const ton = verdict.ok ? '#059669' : verdict.raison === 'trop-courte' ? '#f59e0b' : '#e11d48';

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-2 sm:p-3 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        {/* ── Le patron à plat : le carton ── */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-600 text-center">Le carton, à plat</p>
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${W} ${H_SVG}`}
              className="w-full select-none"
              style={{ minWidth: Math.min(W, 280) }}
              role="img"
              aria-label={`Bande de longueur ${fmtLong(longueur)} et de hauteur ${fmtLong(cyl.hauteur)}`}
            >
              {/* la longueur exacte, en repère fixe : la cible à atteindre */}
              <g pointerEvents="none">
                <line
                  x1={PAD} y1={30} x2={PAD + attendu * ECHELLE} y2={30}
                  stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 4"
                />
                <line x1={PAD + attendu * ECHELLE} y1={24} x2={PAD + attendu * ECHELLE} y2={36}
                  stroke="#94a3b8" strokeWidth="2" />
              </g>

              {/* la bande réglée par l'élève */}
              <rect
                x={PAD} y={46} width={Math.max(longueur * ECHELLE, 1)} height={hBande}
                fill={verdict.ok ? '#d1fae5' : '#e0e7ff'}
                stroke={ton} strokeWidth="2.5" rx="2"
                pointerEvents="none"
              />

              {/* les deux disques, posés de part et d'autre — jamais du même côté */}
              <g pointerEvents="none">
                <circle cx={PAD - 10} cy={46 + hBande / 2} r={9} fill="#fde68a" stroke="#d97706" strokeWidth="2" />
                <circle cx={PAD + Math.max(longueur * ECHELLE, 1) + 10} cy={46 + hBande / 2} r={9}
                  fill="#fde68a" stroke="#d97706" strokeWidth="2" />
              </g>
            </svg>
          </div>
          {/* Les cotes vivent dans le DOM, jamais en <text> par-dessus le dessin. */}
          <p className="text-center text-xs text-slate-500">
            longueur <strong className="text-slate-700">{fmtLong(longueur)}</strong> · hauteur{' '}
            <strong className="text-slate-700">{fmtLong(cyl.hauteur)}</strong>
          </p>
        </div>

        {/* ── Le tube en cours de fermeture ── */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-600 text-center">Autour de la base</p>
          <svg viewBox="0 0 120 124" className="w-full max-w-[190px] mx-auto select-none"
            role="img"
            aria-label={
              verdict.ok
                ? 'Le tube se referme exactement'
                : verdict.raison === 'trop-courte'
                ? 'Il reste un jour : la bande ne fait pas tout le tour'
                : 'La bande se chevauche'
            }
          >
            <circle cx={CX} cy={CY} r={R} fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
            <path d={arc(couvert)} fill="none" stroke={ton} strokeWidth="7" strokeLinecap="round" />
            {/* le recouvrement, dessiné par-dessus : il se VOIT */}
            {verdict.raison === 'trop-longue' && (
              <path d={arc(Math.min(angle - 2 * Math.PI, 2 * Math.PI))} fill="none"
                stroke="#e11d48" strokeWidth="3" strokeDasharray="3 3" strokeLinecap="round" />
            )}
          </svg>
          <p className="text-center text-xs text-slate-500">
            {verdict.ok
              ? 'le tube se ferme exactement'
              : verdict.raison === 'trop-courte'
              ? 'il reste un jour'
              : 'la bande se chevauche'}
          </p>
        </div>
      </div>

      {/* ── Le réglage : glisser, ou piloter au clavier ── */}
      <div
        ref={pisteRef}
        role="slider"
        tabIndex={interactive ? 0 : -1}
        aria-label={ariaLabel || 'Longueur de la bande'}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={longueur}
        aria-valuetext={`Longueur ${fmtLong(longueur)}`}
        onKeyDown={onKeyDown}
        onMouseDown={(e) => { if (interactive) { setDrag(true); onLongueur?.(clamp(fromClientX(e.clientX))); } }}
        onTouchStart={(e) => { if (interactive) { setDrag(true); onLongueur?.(clamp(fromClientX(e.touches[0].clientX))); } }}
        className={`relative h-11 rounded-xl border-2 ${
          interactive ? 'border-slate-300 bg-slate-50 cursor-ew-resize' : 'border-slate-200 bg-slate-50'
        }`}
        style={{ touchAction: 'manipulation' }}
      >
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full"
          style={{
            left: 8, right: 8,
            background: 'linear-gradient(90deg,#e2e8f0,#e2e8f0)',
          }}
        />
        <div
          className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-[3px] border-white shadow"
          style={{
            left: `calc(${((longueur - min) / (max - min)) * 100}% - 12px)`,
            background: ton,
          }}
        />
      </div>

      {/* ── La lecture, en toutes lettres : jamais la couleur seule ── */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono font-bold text-slate-700">
          longueur = {fmtLong(longueur)}
        </span>
        <span className="text-slate-600">
          {verdict.ok ? (
            <strong className="text-emerald-700">le tube se referme exactement</strong>
          ) : verdict.raison === 'trop-courte' ? (
            <>il manque <strong className="text-amber-700">{fmtLong(-verdict.ecart)}</strong> pour faire le tour</>
          ) : (
            <>la bande dépasse de <strong className="text-rose-700">{fmtLong(verdict.ecart)}</strong></>
          )}
        </span>
      </div>
    </div>
  );
}

/** Le diamètre du cylindre — exporté pour que les modules ne le recalculent pas. */
export { diametre };
