import React, { useRef, useState, useCallback } from 'react';

/**
 * VirtualCompas — le compas dont on ÉCARTE les branches, qu'on PLANTE
 * ailleurs, et qu'on fait PIVOTER pour tracer.
 *
 * ACTION          l'élève saisit la mine et l'éloigne de la pointe : les
 *                 branches s'ouvrent. Il saisit la pointe et la plante
 *                 ailleurs. Il fait tourner la mine autour de la pointe.
 * TRANSFORMATION  l'écartement suit la mine ; l'arc balayé se dessine
 *                 derrière elle ; déplacer la pointe ne change PAS
 *                 l'écartement.
 * SENS MATH.      le compas ne mesure pas, il CONSERVE. Reporter une
 *                 longueur, c'est déplacer un écartement sans le lire.
 * FEEDBACK        aucun verdict : l'écartement affiché reste le même quand
 *                 la pointe se déplace — l'élève le constate.
 * GÉNÉRALISATION  l'arc balayé est l'ensemble des points à écartement
 *                 constant de la pointe : c'est la définition du cercle.
 *
 * ── POURQUOI PAS L'ANCIEN CompasTool ──────────────────────────────────
 * `CompasTool` était un `role="img"` piloté par un `<input type="range">` et
 * deux boutons `+`/`−` — interdits par la règle projet (jamais de stepper
 * pour une grandeur continue), et le geste n'avait rien d'un compas : on
 * réglait un nombre, on ne l'écartait pas. Ici la grandeur EST la distance
 * entre deux objets que l'élève tient.
 *
 * ── SÉCURITÉ VISUELLE (§6bis.4) ───────────────────────────────────────
 * L'écartement et l'angle balayé sont lus dans le DOM, pas en <text> SVG.
 * La pointe est bornée à une marge intérieure telle que l'arc de rayon
 * maximal reste dans le cadre (`clampCentre`), donc aucun tracé ne peut
 * sortir. Aucune étiquette n'est posée près de la mine mobile.
 *
 * RÈGLE PROJET : pas de prop `disabled` — le compas reste manipulable après
 * validation de l'étape.
 */

const W = 320;
const H = 210;
const R_MIN = 22;
const R_MAX = 78;

/** Distance entre deux points. */
const d2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export default function VirtualCompas({
  /** Pointe sèche (le centre). */
  centre,
  onCentreChange,
  /** Écartement, en unités SVG. */
  rayon,
  onRayonChange,
  /** Angle de la mine, en degrés — c'est lui qu'on fait tourner. */
  angleDeg,
  onAngleChange,
  /** Segment de référence dont on reporte la longueur (optionnel). */
  reference = null,
  /** Arc déjà balayé, en degrés cumulés — piloté par le module. */
  sweptDeg = 0,
  /** Points remarquables que le module veut montrer (le report atteint…). */
  marks = [],
  ariaLabel,
}) {
  const svgRef = useRef(null);
  const held = useRef(null);           // 'pointe' | 'mine' | null
  const [holding, setHolding] = useState(null);

  const posFromClient = useCallback((clientX, clientY) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return null;
    return {
      x: ((clientX - rect.left) / rect.width) * W,
      y: ((clientY - rect.top) / rect.height) * H,
    };
  }, []);

  /* La pointe est bornée de sorte qu'un arc de rayon MAXIMAL tienne encore
     dans le cadre : aucun tracé atteignable ne peut donc déborder. */
  const clampCentre = (p) => ({
    x: Math.max(R_MAX + 6, Math.min(W - R_MAX - 6, p.x)),
    y: Math.max(R_MAX + 6, Math.min(H - R_MAX - 6, p.y)),
  });

  const apply = (p) => {
    if (!p) return;
    if (held.current === 'pointe') {
      // Planter la pointe ailleurs : l'écartement, lui, ne bouge pas. C'est
      // exactement ce que la leçon veut faire constater.
      onCentreChange?.(clampCentre(p));
      return;
    }
    if (held.current === 'mine') {
      const dx = p.x - centre.x;
      const dy = p.y - centre.y;
      const r = Math.hypot(dx, dy);
      if (r < 1) return;
      // Un seul geste porte les deux grandeurs : s'éloigner ouvre le compas,
      // tourner autour de la pointe le fait pivoter.
      onRayonChange?.(Math.max(R_MIN, Math.min(R_MAX, Math.round(r))));
      onAngleChange?.((Math.atan2(dy, dx) * 180) / Math.PI);
    }
  };

  const begin = (what) => (e) => {
    e.stopPropagation();
    held.current = what;
    setHolding(what);
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
    apply(posFromClient(e.clientX, e.clientY));
  };
  const move = (e) => {
    if (!held.current) return;
    apply(posFromClient(e.clientX, e.clientY));
  };
  const end = (e) => {
    if (!held.current) return;
    held.current = null;
    setHolding(null);
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };

  const keyPointe = (e) => {
    const m = {
      ArrowRight: { x: 6, y: 0 }, ArrowLeft: { x: -6, y: 0 },
      ArrowUp: { x: 0, y: -6 }, ArrowDown: { x: 0, y: 6 },
    }[e.key];
    if (!m) return;
    e.preventDefault();
    onCentreChange?.(clampCentre({ x: centre.x + m.x, y: centre.y + m.y }));
  };
  const keyMine = (e) => {
    /* Début/Fin donnent les deux bornes de l'écartement, Page↑/↓ un grand
       pas : la course entière reste atteignable sans souris. */
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      onRayonChange?.(e.key === 'Home' ? R_MIN : R_MAX);
      return;
    }
    if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      const d = e.key === 'PageUp' ? 12 : -12;
      onRayonChange?.(Math.max(R_MIN, Math.min(R_MAX, rayon + d)));
      return;
    }
    // Flèches ↑↓ : ouvrir / refermer. Flèches ←→ : faire pivoter.
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const d = e.key === 'ArrowUp' ? 3 : -3;
      onRayonChange?.(Math.max(R_MIN, Math.min(R_MAX, rayon + d)));
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      onAngleChange?.(angleDeg + (e.key === 'ArrowRight' ? 8 : -8));
    }
  };

  const rad = (angleDeg * Math.PI) / 180;
  const mine = { x: centre.x + rayon * Math.cos(rad), y: centre.y + rayon * Math.sin(rad) };
  // La charnière du compas, au-dessus des deux branches : ce qui lui donne
  // sa silhouette d'instrument plutôt que de simple rayon.
  const hinge = {
    x: (centre.x + mine.x) / 2 - (mine.y - centre.y) * 0.42,
    y: (centre.y + mine.y) / 2 + (mine.x - centre.x) * 0.42,
  };

  /* L'arc balayé : le module cumule les degrés parcourus, on en dessine la
     portion correspondante à partir de l'angle courant, en arrière. */
  const arcPath = () => {
    const sweep = Math.min(Math.abs(sweptDeg), 359.9);
    if (sweep < 1) return null;
    const a0 = rad - (sweep * Math.PI) / 180;
    const p0 = { x: centre.x + rayon * Math.cos(a0), y: centre.y + rayon * Math.sin(a0) };
    const large = sweep > 180 ? 1 : 0;
    return `M ${p0.x} ${p0.y} A ${rayon} ${rayon} 0 ${large} 1 ${mine.x} ${mine.y}`;
  };
  const arc = arcPath();
  const ferme = Math.abs(sweptDeg) >= 359;

  return (
    <div className="space-y-3">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-[500px] mx-auto select-none bg-white rounded-xl border-2 border-slate-200"
        style={{ touchAction: 'none' }}
        role="group"
        aria-label={ariaLabel ?? 'Compas : pointe à planter, mine à écarter et à faire pivoter'}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <g style={{ pointerEvents: 'none' }}>
          {/* Le segment de référence, dont on reporte la longueur */}
          {reference && (
            <g>
              <line
                x1={reference.a.x} y1={reference.a.y} x2={reference.b.x} y2={reference.b.y}
                stroke="#4f46e5" strokeWidth="4" strokeLinecap="round"
              />
              <circle cx={reference.a.x} cy={reference.a.y} r="4" fill="#4f46e5" />
              <circle cx={reference.b.x} cy={reference.b.y} r="4" fill="#4f46e5" />
            </g>
          )}

          {/* Le cercle « fantôme » de l'écartement courant : il montre où la
              mine PEUT aller — l'ensemble des points à distance constante. */}
          <circle
            cx={centre.x} cy={centre.y} r={rayon}
            fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="2 5"
          />
          {/* L'arc réellement balayé */}
          {arc && (
            <path
              d={arc} fill="none"
              stroke={ferme ? '#7c3aed' : '#a855f7'} strokeWidth="3" strokeLinecap="round"
            />
          )}

          {/* Les repères posés par le module (report atteint, intersections…) */}
          {marks.map((m, i) => (
            <g key={i}>
              <circle cx={m.x} cy={m.y} r="5.5" fill="#059669" stroke="#fff" strokeWidth="2" />
              {m.label && (
                <text
                  x={m.x + (m.x > centre.x ? 9 : -9)} y={m.y - 9}
                  textAnchor={m.x > centre.x ? 'start' : 'end'}
                  className="font-space" fontSize="12" fontWeight="700" fill="#047857"
                >
                  {m.label}
                </text>
              )}
            </g>
          ))}

          {/* Les deux branches du compas */}
          <path
            d={`M ${centre.x} ${centre.y} L ${hinge.x} ${hinge.y} L ${mine.x} ${mine.y}`}
            fill="none" stroke="#475569" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
          />
          <circle cx={hinge.x} cy={hinge.y} r="5" fill="#334155" />
          {/* La pointe sèche */}
          <circle cx={centre.x} cy={centre.y} r="5" fill="#7c3aed" stroke="#fff" strokeWidth="2" />
          {/* La mine */}
          <circle
            cx={mine.x} cy={mine.y} r={holding === 'mine' ? 8 : 6.5}
            fill="#a855f7" stroke="#fff" strokeWidth="2.5"
          />
        </g>

        {/* ── Poignées : ≈47 px à l'écran (r=15 sur 320 unités pour ~500 px) ── */}
        <circle
          cx={centre.x} cy={centre.y} r="15" fill="transparent"
          onPointerDown={begin('pointe')}
          onKeyDown={keyPointe}
          role="slider"
          tabIndex={0}
          aria-label="Pointe du compas — à planter"
          aria-valuemin={0}
          aria-valuemax={W}
          aria-valuenow={Math.round(centre.x)}
          aria-valuetext={`pointe plantée, écartement ${Math.round(rayon)}`}
          style={{ cursor: holding === 'pointe' ? 'grabbing' : 'grab', outline: 'none' }}
        />
        <circle
          cx={mine.x} cy={mine.y} r="15" fill="transparent"
          onPointerDown={begin('mine')}
          onKeyDown={keyMine}
          role="slider"
          tabIndex={0}
          aria-label="Mine du compas — à écarter et à faire tourner"
          aria-valuemin={R_MIN}
          aria-valuemax={R_MAX}
          aria-valuenow={Math.round(rayon)}
          aria-valuetext={`écartement ${Math.round(rayon)}, flèches haut et bas pour ouvrir, gauche et droite pour pivoter`}
          style={{ cursor: holding === 'mine' ? 'grabbing' : 'grab', outline: 'none' }}
        />
      </svg>

      {/* Les lectures vivent dans le DOM — jamais dans le SVG. */}
      <div className="grid grid-cols-2 gap-2 text-center" role="status" aria-live="polite">
        <div className="rounded-xl border-2 border-violet-300 bg-violet-50 px-2 py-2">
          <div className="text-[11px] font-mono uppercase tracking-wide text-violet-500">écartement</div>
          <div className="font-mono font-black text-xl text-violet-800">{Math.round(rayon)}</div>
        </div>
        <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-2 py-2">
          <div className="text-[11px] font-mono uppercase tracking-wide text-slate-400">arc balayé</div>
          <div className="font-mono font-black text-xl text-slate-700">
            {Math.min(Math.round(Math.abs(sweptDeg)), 360)}°
          </div>
        </div>
      </div>
    </div>
  );
}
