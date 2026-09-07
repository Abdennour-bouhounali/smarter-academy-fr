import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useDragValue } from '../../../../../common/manip6e';

/**
 * StructureLab — LA manipulation signature de « Résolution de problèmes ».
 *
 * Activity: construire la STRUCTURE d'un problème en glissant deux prises sur
 *   la figure elle-même — combien de paquets, et combien dans chaque paquet.
 * Mathematical objective: un problème n'est pas un texte à décoder, c'est un
 *   assemblage de quantités. L'opération se LIT sur l'assemblage ; elle ne se
 *   devine pas dans les mots.
 * Student action: on attrape le BORD DROIT de la grille (le nombre de paquets)
 *   ou le BORD BAS d'un paquet (sa taille) ; la grille se redessine sous le
 *   doigt, sans clic de validation.
 * Controlled variable: deux entiers, `groups` et `perGroup` — les deux facteurs
 *   de la situation. Rien d'autre n'est exposé.
 * Mathematical state: {groups, perGroup}. La grille, l'aire coloriée, le total,
 *   l'écriture répétée et la comparaison à la cible en dérivent TOUS.
 * Visual consequence: la grille gagne (ou perd) une colonne entière d'un coup —
 *   un paquet arrive avec tous ses éléments. C'est cela qui rend × visible.
 * Expected observation: 6 paquets de 24 et 24 paquets de 6 remplissent
 *   exactement la même surface. La quantité ne dépend pas du rangement.
 * Misconception targeted: « l'opération se devine au mot de l'énoncé ». Ici il
 *   n'y a pas de mot : il y a une surface qu'on remplit ou qu'on n'atteint pas.
 * Feedback: aucun jugement dans le composant. Il rend la structure et son
 *   total ; c'est le module qui décide de ce que cela veut dire.
 * Formalization: l'écriture 6 × 24 est proposée par le module APRÈS le geste.
 * Scaffolding: les deux prises restent vivantes en permanence (règle projet :
 *   une manipulation ne se fige jamais) ; le clavier fait le même travail.
 * Transfer: la même grille sert au module 4 (modéliser) et au module 6
 *   (reconnaître grouper / partager).
 *
 * §17bis — sécurité visuelle : la grille est dessinée en SVG à surface
 * CONSTANTE (le cadre ne grandit jamais), donc aucune cellule ne peut sortir
 * du cadre quel que soit l'état. Les nombres vivent dans le DOM, sous la
 * figure, où ils ne peuvent entrer en collision avec rien.
 *
 * PIÈGE D'ORDRE DES PROPS : `handleProps` porte son propre `style` (cursor,
 * touchAction). Tout `style` que le composant veut ajouter doit donc être
 * fusionné APRÈS le spread (`style={{ ...drag.handleProps.style, … }}`), sinon
 * il est purement et simplement écrasé — c'est ce qui rendait inerte
 * l'`outline: 'none'` posé avant le spread.
 *
 * LES DEUX PRISES SONT SUR LA FIGURE (demande utilisateur du 2026-09-07).
 * Une première version réglait la taille d'un paquet avec une barre-curseur
 * posée SOUS le cadre : le geste était alors déporté hors du dessin, et
 * l'élève tirait en bas pour faire changer quelque chose en haut — exactement
 * ce que INTERACTION_PEDAGOGY §16 demande d'éviter. Les deux bords de la zone
 * remplie sont donc redevenus les poignées : le bord DROIT commande le nombre
 * de paquets, le bord BAS la taille d'un paquet.
 *
 * Le problème que la barre contournait — deux poignées de 44 px ne tiennent
 * pas côte à côte autour d'une zone de 22 px — est résolu par la GÉOMÉTRIE et
 * non en déménageant une prise : la bande verticale s'arrête `grip` pixels
 * au-dessus du bord bas, et la bande horizontale s'arrête `grip` pixels avant
 * le bord droit. Les deux rectangles restent disjoints dans TOUS les états, y
 * compris « 1 paquet de 1 », parce que le cadre — lui — ne rétrécit jamais.
 */

const W = 520;
const H = 300;   // cadre de travail + jauge d'aire, sans couloir de réglage
const PAD = 26;

export default function StructureLab({
  groups,
  perGroup,
  onGroups,
  onPerGroup,
  maxGroups = 12,
  maxPerGroup = 30,
  target = null,          // total visé : dessine une ligne d'horizon, sans juger
  unit = 'élève',
  packLabel = 'classe',
  color = '#8b5cf6',
}) {
  const svgRef = useRef(null);
  const [scale, setScale] = useState(1);
  // Quelle prise a le focus clavier : sert à dessiner l'anneau sur la poignée
  // visible plutôt que le contour noir du navigateur sur la zone de captation.
  const [focused, setFocused] = useState(null);


  // La taille tactile se MESURE (§6ter.5) : à 375 px le SVG est rendu ~0,6×,
  // donc une prise de 24 unités SVG ne ferait que 14 px réels.
  useLayoutEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0) setScale(W / r.width);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  // 45 et non 44 : la conversion viewBox → pixels perd une fraction.
  const grip = Math.max(26, 45 * scale);

  const total = groups * perGroup;

  // Le cadre a une largeur fixe : c'est la LARGEUR D'UNE COLONNE qui varie.
  // Ainsi la figure ne déborde jamais, quel que soit le nombre de paquets.
  const innerW = W - 2 * PAD;
  const LANE = 34;                 // bande basse : la seule jauge d'aire, étiquetée
  const innerH = H - 2 * PAD - LANE;
  const colW = innerW / maxGroups;
  const cellH = innerH / maxPerGroup;

  const filledW = groups * colW;
  const filledH = perGroup * cellH;

  const dragGroups = useDragValue({
    value: groups,
    onChange: onGroups,
    min: 1,
    max: maxGroups,
    step: 1,
    axis: 'x',
    ariaLabel: `Nombre de ${packLabel}s : glisse le bord droit`,
    valueText: (v) => `${v} ${packLabel}${v > 1 ? 's' : ''} de ${perGroup}, soit ${v * perGroup} ${unit}s`,
  });

  const dragPer = useDragValue({
    value: perGroup,
    onChange: onPerGroup,
    min: 1,
    max: maxPerGroup,
    step: 1,
    // Le bord bas de la zone remplie EST la poignée : on tire vers le bas
    // pour agrandir le paquet. `useDragValue` inverse l'axe y (haut = plus),
    // donc on convertit ici pour que « tirer vers le bas » = « plus grand ».
    axis: 'y',
    toValue: (r) => maxPerGroup - r * (maxPerGroup - 1),
    ariaLabel: `Taille d’un${packLabel === 'classe' ? 'e' : ''} ${packLabel} : glisse le bord bas de la grille`,
    valueText: (v) => `${v} ${unit}s par ${packLabel}, soit ${groups * v} ${unit}s`,
  });

  /* Les deux hooks mesurent leur course sur le MÊME cadre — le SVG. Chacun
     expose son propre `ref` via frameProps ; on les fusionne avec le ref de
     mesure tactile en une seule callback, sinon le dernier écraserait les
     autres et un des deux glissements resterait mort. */
  const setSvg = useCallback((node) => {
    svgRef.current = node;
    const a = dragGroups.frameProps.ref;
    const b = dragPer.frameProps.ref;
    if (a) a.current = node;
    if (b) b.current = node;
  }, [dragGroups.frameProps.ref, dragPer.frameProps.ref]);

  /* La cible est un TOTAL, donc une AIRE — pas une hauteur. La dessiner comme
     une ligne d'horizon était faux : à 3 paquets, 144 aurait demandé 48 rangées
     dans un cadre qui n'en contient que 30, et le trait se collait au bas du
     cadre sans rien vouloir dire. On dessine à la place une jauge d'aire : la
     surface à atteindre, et la part déjà construite. */
  const targetCells = target || null;

  const cells = [];
  for (let g = 0; g < groups; g += 1) {
    for (let k = 0; k < perGroup; k += 1) {
      cells.push({ g, k });
    }
  }
  // Au-delà de ~200 cellules les points deviennent illisibles : on peint alors
  // les colonnes pleines plutôt que chaque élément (la surface reste exacte).
  const drawDots = cells.length <= 240;

  const gy = PAD; // haut de la zone remplie

  /* Les deux prises se croisent au coin bas-droit de la zone remplie. Pour
     qu'aucune ne vole le geste de l'autre, elles occupent des bandes
     DISJOINTES — et il faut que ce soit vrai jusqu'aux états extrêmes
     (1 paquet de 1), où la zone remplie est plus petite que deux poignées.
     On garantit donc les 44 px en débordant vers le HAUT / la GAUCHE de la
     zone remplie (là où il n'y a rien), jamais l'un sur l'autre. */

  /* DEUX BORDS DE LA GRILLE, DISJOINTS PAR CONSTRUCTION.
     Le bord DROIT de la zone remplie commande le nombre de paquets ; le bord
     BAS commande la taille d'un paquet. Les deux poignées se croiseraient au
     coin bas-droit : on les rend exclusives en RÉSERVANT ce coin à personne —
     la bande verticale s'arrête `grip` au-dessus du bas du CADRE, la bande
     horizontale s'arrête `grip` avant la droite du CADRE. Comme le cadre ne
     change jamais de taille, cette séparation tient dans tous les états, y
     compris « 1 paquet de 1 » où la zone remplie est minuscule. */
  const vGripTop = PAD;                       // bande verticale : le bord droit
  const vGripH = Math.max(grip, innerH - grip);
  const hGripLeft = PAD;                      // bande horizontale : le bord bas
  const hGripW = Math.max(grip, innerW - grip);

  return (
    <div className="space-y-3" role="group" aria-label="Atelier de structure" data-sl-groups={groups} data-sl-per={perGroup} data-sl-total={total}>
      <div className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden">
        <svg
          ref={setSvg}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block select-none"
          style={{ touchAction: 'none' }}
          role="group"
          aria-label={`Structure : ${groups} ${packLabel}${groups > 1 ? 's' : ''} de ${perGroup} ${unit}s`}
        >
          {/* Cadre de travail — sa taille ne change JAMAIS. */}
          <rect x={PAD} y={PAD} width={innerW} height={innerH} fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" rx="8" />

          {/* Le quadrillage disponible, en filigrane : la place encore libre
              se VOIT, au lieu de ressembler à du vide. C'est aussi ce qui rend
              lisible « une colonne de plus » quand on tire le bord droit. */}
          <g pointerEvents="none" opacity="0.5">
            {Array.from({ length: maxGroups - 1 }, (_, i) => (
              <line
                key={`gx${i}`}
                x1={PAD + (i + 1) * colW} y1={PAD}
                x2={PAD + (i + 1) * colW} y2={PAD + innerH}
                stroke="#e2e8f0" strokeWidth="1"
              />
            ))}
            {Array.from({ length: Math.floor(maxPerGroup / 5) }, (_, i) => (
              <line
                key={`gy${i}`}
                x1={PAD} y1={PAD + (i + 1) * 5 * cellH}
                x2={PAD + innerW} y2={PAD + (i + 1) * 5 * cellH}
                stroke="#e2e8f0" strokeWidth="1"
              />
            ))}
          </g>

          {/* La jauge d'aire : combien de la quantité visée est déjà bâtie. */}
          {targetCells != null && (
            <g pointerEvents="none">
              <text x={PAD} y={PAD + innerH + LANE - 26} fontSize="12" fill="#b45309" fontFamily="ui-monospace, monospace" fontWeight="700">
                {total} / {targetCells} {unit}s
              </text>
              <rect x={PAD} y={PAD + innerH + LANE - 20} width={innerW} height={11} rx="5.5" fill="#fef3c7" stroke="#fcd34d" strokeWidth="1.5" />
              <rect
                x={PAD} y={PAD + innerH + LANE - 20}
                width={Math.min(1, total / targetCells) * innerW}
                height={11} rx="5.5"
                fill={total === targetCells ? '#10b981' : total > targetCells ? '#f43f5e' : '#f59e0b'}
              />
              {/* Le repère de la cible reste visible même quand on la dépasse. */}
              <line x1={PAD + innerW} y1={PAD + innerH + LANE - 24} x2={PAD + innerW} y2={PAD + innerH + LANE - 3} stroke="#b45309" strokeWidth="2.5" />
            </g>
          )}

          {/* Les paquets. Chaque colonne EST un paquet ; elle arrive entière. */}
          <g pointerEvents="none">
            {Array.from({ length: groups }, (_, g) => (
              <rect
                key={`col${g}`}
                x={PAD + g * colW + 1.5}
                y={gy}
                width={Math.max(2, colW - 3)}
                height={filledH}
                fill={color}
                opacity="0.16"
                stroke={color}
                strokeWidth="1.5"
                rx="3"
              />
            ))}
            {drawDots && cells.map(({ g, k }) => (
              <circle
                key={`c${g}-${k}`}
                cx={PAD + g * colW + colW / 2}
                cy={gy + k * cellH + cellH / 2}
                r={Math.max(1.6, Math.min(colW, cellH) * 0.26)}
                fill={color}
              />
            ))}
          </g>

          {/* ── Prise 1 : le bord DROIT — le nombre de paquets ─────────
              Sa bande s'arrête `grip` au-dessus du bas du cadre : le coin
              bas-droit n'appartient à personne, donc aucune des deux prises ne
              peut voler le geste de l'autre, dans aucun état. */}
          <rect
            x={PAD + filledW - grip / 2}
            y={vGripTop}
            width={grip}
            height={vGripH}
            fill="transparent"
            cursor="ew-resize"
            onFocus={() => setFocused('groups')}
            onBlur={() => setFocused(null)}
            {...dragGroups.handleProps}
            {...dragGroups.a11yProps}
            style={{ ...dragGroups.handleProps.style, outline: 'none' }}
          />
          <g pointerEvents="none">
            <line x1={PAD + filledW} y1={gy} x2={PAD + filledW} y2={gy + Math.max(filledH, 22)} stroke="#4c1d95" strokeWidth="3" />
            <g transform={`translate(${PAD + filledW}, ${gy + Math.min(Math.max(filledH, 22) / 2, vGripH - 14)})`}>
              {focused === 'groups' && <circle r="16" fill="none" stroke="#8b5cf6" strokeWidth="3" opacity="0.85" />}
              <circle r="11" fill="#4c1d95" stroke="#fff" strokeWidth="2.5" />
              {/* Deux chevrons : la poignée DIT qu'elle se tire horizontalement. */}
              <path d="M -4.5 -3.5 L -7.5 0 L -4.5 3.5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 4.5 -3.5 L 7.5 0 L 4.5 3.5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          </g>

          {/* ── Prise 2 : le bord BAS — la taille d'un paquet ───────────
              Elle vit désormais SUR la figure (et non plus dans une barre sous
              le cadre) : on tire le bord bas de la grille vers le bas pour
              mettre plus de monde dans chaque paquet. */}
          <rect
            x={hGripLeft}
            y={gy + filledH - grip / 2}
            width={hGripW}
            height={grip}
            fill="transparent"
            cursor="ns-resize"
            onFocus={() => setFocused('per')}
            onBlur={() => setFocused(null)}
            {...dragPer.handleProps}
            {...dragPer.a11yProps}
            style={{ ...dragPer.handleProps.style, outline: 'none' }}
          />
          <g pointerEvents="none">
            <line x1={PAD} y1={gy + filledH} x2={PAD + Math.max(filledW, colW)} y2={gy + filledH} stroke="#0f766e" strokeWidth="3" />
            <g transform={`translate(${PAD + Math.min(Math.max(filledW, colW) / 2, hGripW - 14)}, ${gy + filledH})`}>
              {focused === 'per' && <circle r="16" fill="none" stroke="#14b8a6" strokeWidth="3" opacity="0.85" />}
              <circle r="11" fill="#0f766e" stroke="#fff" strokeWidth="2.5" />
              {/* Chevrons verticaux : cette prise-là se tire de haut en bas. */}
              <path d="M -3.5 -4.5 L 0 -7.5 L 3.5 -4.5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M -3.5 4.5 L 0 7.5 L 3.5 4.5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          </g>
        </svg>
      </div>

      {/* Lecture chiffrée — dans le DOM, donc à l'abri de toute collision.
          Chaque carte porte la PASTILLE de la poignée qui la commande : c'est
          ce qui dit à l'élève quel bord de la grille agit sur quel nombre. */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border-2 border-violet-200 bg-violet-50 py-2">
          <div className="flex items-center justify-center gap-1.5">
            <span aria-hidden="true" className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: '#4c1d95' }} />
            <span className="font-mono font-black text-xl text-violet-800 tabular-nums">{groups}</span>
          </div>
          <div className="text-xs text-violet-700">{packLabel}{groups > 1 ? 's' : ''}</div>
          <div className="text-[11px] text-violet-500">bord droit ↔</div>
        </div>
        <div className="rounded-xl border-2 border-teal-200 bg-teal-50 py-2">
          <div className="flex items-center justify-center gap-1.5">
            <span aria-hidden="true" className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: '#0f766e' }} />
            <span className="font-mono font-black text-xl text-teal-800 tabular-nums">{perGroup}</span>
          </div>
          <div className="text-xs text-teal-700">{unit}s par {packLabel}</div>
          <div className="text-[11px] text-teal-600">bord bas ↕</div>
        </div>
        <div className="rounded-xl border-2 border-slate-300 bg-slate-900 py-2" role="status" aria-live="polite">
          <div className="font-mono font-black text-xl text-amber-300 tabular-nums">{total}</div>
          <div className="text-xs text-slate-300">{unit}s en tout</div>
        </div>
      </div>

      <p className="text-center text-xs font-mono text-slate-500">
        {groups} × {perGroup} = {total}
      </p>
    </div>
  );
}
