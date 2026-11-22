import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Group, Mesh, SphereGeometry, CircleGeometry, MeshStandardMaterial, DoubleSide } from 'three';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { spread } from './spaceCp';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import MathText from '../../components/MathText';
import SpaceFigure from '../../components/SpaceFigure';
import Stage3D from './stage3d/Stage3D';
import { sphere, ball, cylinder, ring, line, segment, handle, setAt } from './stage3d/solids3d';
import * as L from '../logic/orangePeel';

/**
 * orange-peel — L'ORANGE DE BOUFARIK (unité 14 « الهندسة في الفضاء », درس « مساحة الكرة وحجم الجلة » : مدخل الوحدة p. 163,
 * Archimède — la boule de rayon R dans le cylindre de rayon R et de hauteur 2R — puis معارف 2 p. 166, l'exemple R = 1,4 cm).
 * Archimède rendu touchable, en VRAIE 3D (Stage3D : lumière, transparence, orbite au doigt).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève tient le rayon R (la poignée sur le bord de l'orange, ou le curseur) ; il POSE sur la table le nombre de disques
 *    de rayon R qu'il pense couvrir avec la peau, puis TIRE la peau (le ruban au sommet de l'orange, ou « قشّر ») ; dans le
 *    verre cylindrique taillé pour l'orange (rayon R, hauteur 2R), il PLACE la marque où le jus s'arrêtera, puis PRESSE
 *    l'orange vers le bas (ou « اعصر ») ; il écrit enfin l'aire et le volume avec des cartes.
 * B. Idée : l'aire de la sphère est 4 fois celle de son grand disque, 4πR² — l'aire latérale du cylindre 2πR × 2R ; le volume
 *    de la boule est les 2/3 de celui du cylindre, 2/3 × 2πR³ = 4/3·πR³ (Archimède).
 * C. Pendant le geste : la peau quitte l'orange par quartiers et se dépose, quartier par quartier, dans les disques ; s'il
 *    n'y a pas assez de disques, la peau DÉBORDE dans un disque fantôme rouge ; le jus monte dans le verre, l'orange fond.
 * D. La lecture écrit le nombre de disques remplis, puis 𝒜 = 4π × R² = …π cm² ; la hauteur du jus, puis
 *    𝒱 = 2/3 × 2πR³ = 4/3·π × R³ = …π cm³ — avec le R de l'élève.
 * E. Avant la règle : la peau posée juste, le jus marqué juste, les deux formules écrites, et un CONTRASTE (un refus, ou la
 *    même expérience réussie à un second rayon : 4 disques et 2/3, quel que soit R).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        𝒜 = 4πR² (4 grands disques = l'aire latérale du cylindre) ; 𝒱 = 4/3·πR³ (2/3 du cylindre de hauteur 2R)
 *   OBJECT         une orange de Boufarik sur la table de la cuisine, sa peau, son jus, un verre à sa taille
 *   VARIABLE       R (poignée / curseur) ; la prédiction k (disques posés) ; la marque du jus ; l'épluchage p ; la pression q
 *   INVARIANT      quel que soit R : la peau couvre exactement 4 disques ; le jus s'arrête aux 2/3 du verre
 *   TRANSFORMATION la peau passe de l'orange aux disques ; le jus passe de l'orange au verre ; R redimensionne tout
 *   CONSTRAINT     la prédiction se fige dès que la peau bouge ; la marque se fige dès que le jus coule ; la peau et le jus
 *                  ne reviennent pas seuls (« أعد القشرة », « أفرغ الكأس »)
 *   RESISTANCE     k ≠ 4 : la peau déborde (« يبقى من القشرة ما يملأ قرصا آخر ») ou laisse un disque vide ; une marque fausse :
 *                  le jus la dépasse ou s'arrête dessous, avec le volume qu'elle voudrait dire ; une carte : πR² (un disque sur
 *                  quatre), 2πR (une LONGUEUR), 4/3·πR³ (un VOLUME — à R = 3 le même nombre 36π, autre unité), 2πR³ (le verre
 *                  plein), 3/4·πR³ (coefficient renversé) — toutes jugées par space.js
 *   EVIDENCE       quatre disques pleins, aucun débordement ; le jus pile sur la marque des 2/3
 *   CONTRAST       la prédiction refusée contre la juste ; deux rayons, le même « 4 » et le même « 2/3 »
 *   PREDICTION     k disques AVANT la peau ; la marque AVANT le jus
 *   DISCOVERY      « مساحة الكرة 4πR² ، وحجم الجلة 4/3·πR³ »
 *   FORMALIZATION  𝒜 = 4πR² = 2πR × 2R ; 𝒱 = 2/3 × πR² × 2R = 4/3·πR³ ; (متقدم) l'exemple 1,4 cm : 24,63 cm² au mm², 11,494 cm³ au mm³
 *   TRANSFER       معارف 2 (l'exemple du manuel), طرائق (diamètre → rayon, valeur exacte puis arrondie), le إختبار أولي
 *
 * Niveaux : مبتدئ = R entier 1 … 5 (défaut 3 : 36π cm² ET 36π cm³ — le piège de l'unité), graduations du verre au sixième ;
 * متقدم = R libre 1,0 … 6,0 au dixième, verre sans graduation, marque au douzième, puis (ouvert par l'élève après la règle)
 * l'exemple du manuel R = 1,4 cm et la précision choisie : 1 mm² = 0,01 cm², 1 mm³ = 0,001 cm³ (`rounding`).
 *
 * Monde (`theme`) : `boufarik-orange` — la cuisine de la maison (zellige, table en bois, une cagette « برتقال بوفاريك », un
 * téléphone sur mini-trépied qui filme l'épluchage pour la story : un toucher fait monter des cœurs). Le DÉCOR est un SVG
 * derrière la scène 3D, `aria-hidden`, `[data-deco]`, hors clavier, sans aucune mesure ; immobile sous `prefers-reduced-motion`.
 * Ce qui est 3D : l'orange (peau en quartiers, chair), les disques sur la table, la peau qui s'y dépose, le verre, l'orange
 * fantôme qui y tient, le jus, les poignées (rayon, ruban de peau, pression, marque) — Stage3D sur solids3d.js.
 *
 * D'UN SEUL REGARD (§8bis) : la fenêtre 3D est budgétée sur l'écran de leçon (`useLessonViewport` moins ce que le bloc
 * `[data-op-glance]` prend en plus d'elle, ≤ 55 % de la hauteur de l'écran) ; R, la prédiction, l'épluchage / la marque, la
 * pression, les cartes, la lecture et le verdict sont juste dessous ; la liste des essais est dans un `LabFold` SOUS le bloc.
 *
 * Props : `R`, `example`, `rounding` (à plat ou dans `numbers`), `theme`, `title`, `lead`, `mission`, `level`, `levels`,
 * `onTrial(evidence)` à chaque geste jugé, `onFinished({ R, area, volume })` à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-orange-peel][data-world][data-phase=peel|pour|book][data-r][data-op-rt], [data-op-glance], [data-stage3d],
 * [data-op-r] (curseur R), [data-op-k-minus|plus][data-op-k], [data-op-peel] (curseur), [data-op-reset-peel], [data-op-card=<id>],
 * [data-op-to-pour], [data-op-mark-minus|plus][data-op-mark], [data-op-pour] (curseur), [data-op-reset-pour], [data-op-vcard=<id>],
 * [data-op-to-peel], [data-op-to-book], [data-op-digits-minus|plus][data-op-digits], [data-op-round], [data-op-reading],
 * [data-op-verdict=<kind>], [data-lab-fold=orange-peel.trials], [data-deco].
 */
const ORANGE = '#f97316';
const FLESH = '#ffb05c';
const PITH = '#fff7ed';
const JUICE = '#fb923c';
const SPILL = '#e11d48';

function circlePts([cx, cy, cz], r, n = 72) {
  const out = [];
  for (let i = 0; i <= n; i += 1) { const t = (i / n) * 2 * Math.PI; out.push([cx + r * Math.cos(t), cy + r * Math.sin(t), cz]); }
  return out;
}
/** Un secteur plein posé sur la table (la peau dans un disque) : fraction f du disque, depuis l'arrière. */
function sector(center, r, f, color, opacity = 0.95) {
  const g = new CircleGeometry(r, 64, Math.PI / 2, Math.max(0.0001, f) * 2 * Math.PI).rotateX(-Math.PI / 2);
  const m = new MeshStandardMaterial({ color, roughness: 0.65, transparent: opacity < 1, opacity, side: DoubleSide, depthWrite: false });
  return setAt(new Mesh(g, m), center);
}
/** La peau qui reste sur l'orange : une sphère OUVERTE (les quartiers déjà tirés manquent). */
function skinShell(r, remaining) {
  const g = new SphereGeometry(r, 48, 32, Math.PI / 2, Math.max(0.0001, remaining) * 2 * Math.PI);
  return new Mesh(g, new MeshStandardMaterial({ color: ORANGE, roughness: 0.62, side: DoubleSide }));
}

/** La chair d'une orange épluchée : une boule lumineuse et quatre méridiens blancs (les quartiers). */
function flesh(r, at) {
  const g = new Group();
  const b = ball(r, { at: [0, 0, 0], color: FLESH });
  b.material.emissive?.set('#f97316');
  b.material.emissiveIntensity = 0.18;
  g.add(b);
  for (let i = 0; i < 4; i += 1) {
    const a = (i * Math.PI) / 4;
    g.add(ring([0, 0, 0], r * 1.004, { normal: [Math.cos(a), Math.sin(a), 0], color: PITH, tube: Math.max(0.005, r * 0.012) }));
  }
  return setAt(g, at);
}

/** La scène 3D : construite UNE fois (Stage3D › build) ; `update(state)` refait la partie mobile. */
function makeScene(stage, actionsRef) {
  let dyn = null;
  let unreg = [];
  let viewKey = '';
  let cur = null;
  const clear = () => { unreg.forEach((u) => u()); unreg = []; if (dyn) stage.remove(dyn); dyn = null; };
  const lbl = (text, at, style) => dyn.add(stage.label(text, at, style));

  /** Le cadre de la caméra : la boîte qui contient l'orange et TOUTES les places possibles (la vue ne saute pas avec k). */
  function bounds(st) {
    const r = st.rhoMax;
    if (st.phase === 'pour') return { x: [-1.1 * r, 3.85 * r], y: [-1.2 * r, 1.2 * r], z: [0, 2.3 * r] };
    const cols = st.wide ? 3 : 2;
    const sl = L.discSlots(Math.max(4, st.k), r, cols);
    const xs = sl.map((p) => p[0]); const ys = sl.map((p) => p[1]);
    return { x: [-1.1 * r, Math.max(...xs) + r], y: [Math.min(...ys, -r) - r * 0.1, Math.max(...ys) + r], z: [0, 2.3 * r] };
  }
  function frame(st) {
    const rows = Math.ceil(Math.max(4, st.k) / (st.wide ? 3 : 2));
    const key = `${st.phase === 'pour' ? 'pour' : `peel${rows}`}|${st.wide ? 'w' : 'n'}|${st.aspect.toFixed(1)}`;
    if (key === viewKey) return;
    viewKey = key;
    const el = st.phase === 'pour' ? 24 : 46;
    const b = bounds(st);
    const target = [(b.x[0] + b.x[1]) / 2, (b.y[0] + b.y[1]) / 2, (st.phase === 'pour' ? 0.95 : 0.3) * st.rhoMax];
    const W = b.x[1] - b.x[0];
    const D = b.y[1] - b.y[0];
    const t = Math.tan((35 / 2) * Math.PI / 180);
    const H = D * Math.sin(el * Math.PI / 180) + (b.z[1] - b.z[0]) * Math.cos(el * Math.PI / 180);
    const dist = (st.wide ? 1.22 : st.phase === 'pour' ? 1.0 : 1.1) * Math.max(W / (2 * st.aspect * t), H / (2 * t));
    const view = { azimuth: -90, elevation: el, distance: dist };
    stage.options.view = view; stage.options.target = target;
    stage.setView(view, target);
  }
  /** La table de la cuisine (bois), sous tout ce qui est posé. */
  function table(st) {
    const b = bounds({ ...st, rhoMax: st.rhoMax });
    const cx = (b.x[0] + b.x[1]) / 2; const cy = (b.y[0] + b.y[1]) / 2;
    const R = 0.42 * Math.hypot(b.x[1] - b.x[0], b.y[1] - b.y[0]);
    const top = new Mesh(new CircleGeometry(R, 96).rotateX(-Math.PI / 2), new MeshStandardMaterial({ color: '#e9c48f', roughness: 0.85 }));
    dyn.add(setAt(top, [cx, cy, -0.012]));
    dyn.add(ring([cx, cy, -0.012], R, { color: '#a16207', tube: 0.04 }));
  }

  function drawPeel(st) {
    const rho = st.rho;
    const C = [0, 0, rho];
    const k = st.k;
    const p = st.p;
    const book = st.phase === 'book';
    // la chair, sous la peau (un peu lumineuse) et ses quartiers (méridiens blancs)
    dyn.add(flesh(rho * 0.965, C));
    // la peau qui reste (les quartiers tirés manquent) et la queue / la feuille (décor 3D)
    if (p < 1) dyn.add(setAt(skinShell(rho, 1 - p), C));
    dyn.add(ball(rho * 0.07, { at: [0, 0, 2 * rho + 0.02], color: '#65a30d' }));
    const leaf = ball(rho * 0.16, { at: [rho * 0.16, 0, 2 * rho + 0.04], color: '#16a34a' });
    leaf.scale.set(1.6, 0.35, 0.8);
    dyn.add(leaf);
    // le rayon R (pointillé) et sa poignée sur le bord
    dyn.add(segment(C, [rho, 0, rho], { color: 'ink', dashed: true }));
    lbl('R', [rho * 0.5, 0, rho + 0.16], { size: 15 });
    if (!book) {
      const hr = handle([rho, 0, rho], { radius: 0.2, color: 'amber' });
      dyn.add(hr);
      unreg.push(stage.draggable(hr, {
        move: ({ onLine }) => { const tt = onLine(C, [1, 0, 0]); actionsRef.current.dragR(tt); },
      }));
    }
    // les disques posés par l'élève (k), et — si la peau déborde — des disques fantômes rouges
    const discs = 4;
    const shown = Math.max(k, p > 0 ? Math.min(6, Math.ceil(p * discs - 1e-9)) : 0, k);
    const slots = L.discSlots(Math.max(shown, k), rho, st.wide ? 3 : 2);
    slots.forEach((c, i) => {
      const own = i < k;
      if (own) dyn.add(ring(c, rho, { normal: 'z', color: 'slate', tube: 0.018 }));
      else dyn.add(line(circlePts(c, rho), { color: SPILL, dashed: true, dash: 0.12, gap: 0.09 }));
      const f = L.discFill(p, i, discs);
      if (f > 0) {
        dyn.add(sector([c[0], c[1], 0.004], rho * 0.985, f, own ? ORANGE : SPILL, own ? 0.95 : 0.55));
        // les morceaux de peau : des coutures claires tous les quarts de disque déjà remplis
        for (let j = 1; j <= Math.floor(f * 4 + 1e-9) && j <= 4; j += 1) {
          const a = Math.PI / 2 + (j / 4) * 2 * Math.PI;
          dyn.add(segment([c[0], c[1], 0.01], [c[0] + rho * 0.97 * Math.cos(a), c[1] - rho * 0.97 * Math.sin(a), 0.01], { color: PITH, opacity: 0.9 }));
        }
      }
      if (own && f === 0) lbl(String(i + 1), [c[0], c[1], 0.02], { size: 13, color: '#475569' });
    });
    // le ruban de peau qu'on tire (au sommet), et sa poignée
    if (!book && !st.peeled) {
      const pull = 2.2 * rho;
      const tab = [p * pull, 0, 2 * rho + 0.12];
      if (p > 0) dyn.add(line([[0, 0, 2 * rho], [tab[0] * 0.5, 0, 2 * rho + 0.22], tab], { color: ORANGE }));
      const ht = handle(tab, { radius: 0.17, color: 'rose' });
      dyn.add(ht);
      unreg.push(stage.draggable(ht, {
        move: ({ onLine }) => { const tt = onLine([0, 0, 2 * rho + 0.12], [1, 0, 0]); actionsRef.current.dragPeel(tt / pull); },
        end: () => actionsRef.current.releasePeel(),
      }));
    }
  }

  function drawPour(st) {
    const rho = st.rho;
    const gx = 2.6 * rho;
    const G = [gx, 0, 0];
    const q = st.q;
    // le verre (rayon R, hauteur 2R) et l'orange fantôme qui y tient tout juste
    dyn.add(cylinder(rho, 2 * rho, { at: G, color: 'glass', opacity: 0.2, open: true }));
    dyn.add(ring([gx, 0, 2 * rho], rho, { color: 'slate', tube: 0.014 }));
    dyn.add(ring([gx, 0, 0.005], rho, { color: 'slate', tube: 0.014 }));
    dyn.add(sphere(rho, { at: [gx, 0, rho], color: 'amber', opacity: 0.07 }));
    dyn.add(line(circlePts([gx, 0, rho], rho), { color: 'amber', dashed: true, dash: 0.1, gap: 0.08, opacity: 0.8 }));
    lbl('2R', [gx + rho + 0.28, 0, rho], { size: 14 });
    dyn.add(segment([gx, 0, 2 * rho + 0.05], [gx + rho, 0, 2 * rho + 0.05], { color: 'ink', dashed: true }));
    lbl('R', [gx + rho / 2, 0, 2 * rho + 0.22], { size: 14 });
    // les graduations au sixième (مبتدئ seulement)
    if (st.level !== 'advanced') {
      for (let j = 1; j < 6; j += 1) {
        const z = (j / 6) * 2 * rho;
        dyn.add(segment([gx - rho * 0.98, -rho * 0.2, z], [gx - rho * 0.8, -rho * 0.6, z], { color: 'slate' }));
      }
    }
    // le jus
    const hj = L.juiceLevel(q, 2 / 3) * 2 * rho;
    if (hj > 0.002) dyn.add(cylinder(rho * 0.985, hj, { at: [gx, 0, 0.004], color: JUICE, opacity: 0.78 }));
    // la marque de l'élève
    const hm = (st.m / L.MARK_DEN) * 2 * rho;
    dyn.add(ring([gx, 0, hm], rho * 1.02, { color: st.poured ? (st.poured.ok ? 'emerald' : 'rose') : 'violet', tube: 0.03 }));
    if (!st.poured && q === 0) {
      const hmk = handle([gx, -rho * 1.02, hm], { radius: 0.19, color: 'violet' });
      dyn.add(hmk);
      unreg.push(stage.draggable(hmk, {
        move: ({ onLine }) => { const tt = onLine([gx, -rho * 1.02, 0], [0, 0, 1]); actionsRef.current.dragMark((tt / (2 * rho)) * L.MARK_DEN); },
      }));
    }
    // l'orange épluchée qui fond quand on la presse (volume conservé : r = R·∛(1 − q))
    const r = rho * Math.cbrt(Math.max(0, 1 - q));
    if (r > 0.02) dyn.add(flesh(r, [0, 0, r]));
    dyn.add(segment([0, 0, Math.max(r, 0.02)], [rho, 0, Math.max(r, 0.02)], { color: 'ink', dashed: true, opacity: q > 0 ? 0.35 : 1 }));
    // la poignée de R (à côté de l'orange, même quand elle fond) et la poignée de pression (au sommet de l'orange)
    if (q === 0 || st.poured) {
      const hr = handle([rho, 0, rho], { radius: 0.2, color: 'amber' });
      dyn.add(hr);
      unreg.push(stage.draggable(hr, { move: ({ onLine }) => actionsRef.current.dragR(onLine([0, 0, rho], [1, 0, 0])) }));
    }
    if (!st.poured) {
      const top = 2 * r + 0.16;
      const hp = handle([0, 0, top], { radius: 0.18, color: 'rose' });
      dyn.add(hp);
      unreg.push(stage.draggable(hp, {
        move: ({ onLine }) => {
          const z = onLine([0, 0, 0], [0, 0, 1]);
          const rr = Math.max(0, Math.min(rho, (z - 0.16) / 2));
          actionsRef.current.dragPour(1 - (rr / rho) ** 3);
        },
        end: () => actionsRef.current.releasePour(),
      }));
    }
  }

  return {
    update(st) {
      cur = st;
      frame(st);
      clear();
      dyn = new Group();
      table(st);
      if (st.phase === 'pour') drawPour(st); else drawPeel(st);
      stage.add(dyn);
    },
    dispose() { clear(); cur = null; },
    get state() { return cur; },
  };
}

/** Le repli sans WebGL (rendu serveur, vieux navigateur) : la figure d'Archimède du manuel, au même R. */
function fallbackFigure(rt, ariaLabel) {
  const r = Number(L.rText(rt).replace(',', '.'));
  return {
    kind: 'space', view: { azimuth: -62, elevation: 16 },
    points: { O: [0, 0, 0], B: [0, 0, -r], T: [0, 0, r], M: [r, 0, 0] },
    hidden: ['B', 'T'],
    solids: [{ type: 'cylinder', base: 'B', top: 'T', radius: r, tone: 'sky' }, { type: 'sphere', center: 'O', radius: r, tone: 'amber' }],
    segments: [{ from: 'O', to: 'M', label: 'R', dashed: true }, { from: 'B', to: 'T', dashed: true }],
    ariaLabel, maxWidth: 260, inline: true,
  };
}

/** Un curseur (range natif, LTR) : flèches ±pas, Maj + flèches ±grand pas. */
function Slider({ value, min, max, step, big, onChange, onRelease, label, valueText, disabled, data, className = '' }) {
  const onKeyDown = (e) => {
    if (!e.shiftKey || disabled) return;
    const d = { ArrowRight: big, ArrowUp: big, ArrowLeft: -big, ArrowDown: -big }[e.key];
    if (d == null) return;
    e.preventDefault();
    onChange(Math.max(min, Math.min(max, value + d)));
    onRelease?.();
  };
  return (
    <span className="flex min-w-[4rem] flex-1 items-center">
    <input
      type="range" dir="ltr" min={min} max={max} step={step} value={value} disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      onPointerUp={() => onRelease?.()} onKeyUp={(e) => { if (/Arrow|Home|End|Page/.test(e.key)) onRelease?.(); }} onKeyDown={onKeyDown}
      aria-label={label} aria-valuetext={valueText}
      className={`h-11 w-full min-w-0 cursor-pointer accent-orange-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      {...data}
      style={{ width: '100%' }}
    />
    </span>
  );
}

export default function OrangePeel({
  R: R0, example: ex0, rounding: rd0, numbers: nums, theme = 'boufarik-orange', title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.orangePeel.${key}`, o), [t]);
  const initialNumbers = {
    R: R0 ?? nums?.R ?? 3,
    ...((ex0 ?? nums?.example) != null ? { example: ex0 ?? nums?.example } : {}),
    ...((rd0 ?? nums?.rounding) != null ? { rounding: rd0 ?? nums?.rounding } : {}),
  };
  const state = useManipulation({ type: 'orange-peel', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const lv = state.level;
  const make = () => L.init({ R: state.numbers.R, level: lv, example: state.numbers.example ?? '1,4', rounding: state.numbers.rounding ?? [2, 3] });
  const [lab, setLab] = useState(make);
  const sceneKey = `${state.numbers.R}|${lv}|${state.epoch}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [doneIds, setDoneIds] = useState({});
  // « إعادة » (epoch), un autre niveau ou d'autres nombres : TOUT recommence — l'orange, les étapes et les questions du labo
  if (scene.key !== sceneKey) { setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(make()); setDoneIds({}); }
  const reduce = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const rg = L.rangeFor(lv);

  const ready = L.discoveryReady(lab);
  const cpSettings = useLabCheckpointSettings('orange-peel');   // obligatoires pour tout élève ; l'enseignant seul les coupe, pour SON compte
  const cpLive = cpOn && cpSettings.enabled;
  useEffect(() => { if (ready && !cpLive) state.discover(); }, [ready, state.epoch, cpLive]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!state.isFormal) return;
    state.report(onFinished, { R: L.rText(lab.rt), area: L.piTex(L.skin(lab.rt).k), volume: L.piTex(L.juice(lab.rt).k) });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (lab.trials.length > 0) state.report(onTrial, L.evidenceOf(lab)); }, [lab.trials.length]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── les gestes de la scène 3D (poignées) passent par ces actions, jamais par le dessin ── */
  const labRef = useRef(lab);
  labRef.current = lab;
  const actionsRef = useRef(null);
  actionsRef.current = {
    dragR: (t3) => {
      const cur = labRef.current;
      const frac = Math.max(0, Math.min(1, (t3 - 0.62) / 0.5));
      const rt = rg.min + frac * (rg.max - rg.min);
      // la peau tirée / le jus qui coule : R ne bouge plus pendant le geste
      if ((cur.phase === 'peel' && cur.p > 0 && !cur.peeled) || (cur.phase === 'pour' && cur.q > 0 && !cur.poured)) return;
      setLab((s) => L.setR(s, rt));
    },
    dragPeel: (p) => setLab((s) => (p >= 0.985 ? s : L.peelTo(s, Math.max(0, Math.min(0.98, p))))),
    releasePeel: () => setLab((s) => (s.p >= 0.9 && !s.peeled ? L.peelTo(s, 1) : s)),
    dragMark: (m) => setLab((s) => L.setMark(s, m)),
    dragPour: (q) => setLab((s) => (q >= 0.985 ? s : L.pourTo(s, Math.max(0, Math.min(0.98, q))))),
    releasePour: () => setLab((s) => (s.q >= 0.9 && !s.poured ? L.pourTo(s, 1) : s)),
  };

  /* ── mesure : la fenêtre 3D est budgétée sur l'écran (§8bis) ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const stageHRef = useRef(300);
  const [boxW, setBoxW] = useState(360);
  const [overhead, setOverhead] = useState(220);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setBoxW(Math.max(200, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(140, Math.ceil(glanceRef.current.getBoundingClientRect().height) - stageHRef.current));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (glanceRef.current) ro.observe(glanceRef.current);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 640;
  const winH = typeof window !== 'undefined' && window.innerHeight ? window.innerHeight : 800;
  const narrow = boxW < 420;
  const stageH = Math.round(Math.max(170, Math.min(440, winH * 0.55, screenH - overhead - 12)));
  stageHRef.current = stageH;
  const aspect = boxW / stageH;
  const wide = aspect > 1.45;

  /* ── l'état que la scène dessine ── */
  const rho = L.displayRadius(lab.rt, lv);
  const scene3d = useMemo(() => ({
    phase: lab.phase, rt: lab.rt, rho, rhoMax: L.displayRadius(rg.max, lv), level: lv, wide, aspect,
    k: lab.phase === 'book' ? 4 : lab.k, p: lab.phase === 'book' ? 1 : lab.p, peeled: lab.peeled,
    m: lab.m, q: lab.q, poured: lab.poured,
  }), [lab.phase, lab.rt, rho, lv, wide, aspect, lab.k, lab.p, lab.peeled, lab.m, lab.q, lab.poured, rg.max]);
  const build = useCallback((stage) => makeScene(stage, actionsRef), []);

  /* ── les animations « jusqu'au bout » (un bouton), immédiates sous reduced-motion ── */
  const animRef = useRef(null);
  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);
  const runTo = (field, step) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (reduce) { setLab((s) => step(s, 1)); return; }
    const t0 = performance.now(); const from = lab[field];
    const tick = (now) => {
      const v = Math.min(1, from + (now - t0) / 1400);
      setLab((s) => step(s, v));
      if (v < 1) animRef.current = requestAnimationFrame(tick); else animRef.current = null;
    };
    animRef.current = requestAnimationFrame(tick);
  };

  /* ── les textes ── */
  const rT = L.rTex(lab.rt);
  const rP = rT.includes('{,}') ? `(${rT})` : rT; // une puissance d'un décimal : (1{,}4)^2
  const phase = lab.phase;
  const markTex = (m) => { const g = gcd(m, L.MARK_DEN); return `\\frac{${m / g}}{${L.MARK_DEN / g}}`; };
  const discCount = (n) => k('discs', { count: n });
  const reading = (() => {
    if (lab.last?.kind?.startsWith('card')) return null; // le verdict d'une carte écrit déjà la formule
    if (phase === 'peel') {
      if (lab.areaOk && lab.peeled?.ok) return k('readArea', { r: rP, a: L.piTex(L.skin(lab.rt).k) });
      if (lab.p === 0) return k('readPredict', { disc: discCount(lab.k), r: rT, d: L.piTex(L.disc(lab.rt).k) });
      if (!lab.peeled) return k('readPeeling', { n: decTex(Math.round(lab.p * 40) / 10) });
      return null;
    }
    if (phase === 'pour') {
      if (lab.volumeOk && lab.poured?.ok) return k('readVolume', { r: rP, v: L.piTex(L.juice(lab.rt).k) });
      if (lab.q === 0) return k('readMark', { f: markTex(lab.m), h: L.rTex(lab.rt * 2), cyl: L.piTex(L.glass(lab.rt).volume.k) });
      if (!lab.poured) return k('readPouring', { h: decTex(Math.round(L.juiceLevel(lab.q) * 2 * lab.rt) / 10), H: L.rTex(lab.rt * 2) });
      return null;
    }
    const which = lab.book.which;
    const bv = L.bookValue(lab, which, lab.book.digits);
    return k(which === 'area' ? 'readBookArea' : 'readBookVolume', { full: decTex(bv.full), v: L.piTex(bv.value.k), d: lab.book.digits, rd: decTex(bv.rounded) });
  })();

  const last = lab.last;
  const moving = (phase === 'peel' && lab.p > 0 && !lab.peeled) || (phase === 'pour' && lab.q > 0 && !lab.poured);
  const verdictKind = moving ? `${phase}-moving` : last ? last.kind : `start-${phase}`;
  const verdict = (() => {
    const area = L.skin(lab.rt); const vol = L.juice(lab.rt);
    switch (verdictKind) {
      case 'start-peel': return <span className="text-slate-800"><MathText>{k('vStartPeel')}</MathText></span>;
      case 'start-pour': return <span className="text-slate-800"><MathText>{k('vStartPour')}</MathText></span>;
      case 'peel-moving': return <span className="text-violet-900"><MathText>{k('vPeeling', { disc: discCount(lab.k) })}</MathText></span>;
      case 'pour-moving': return <span className="text-violet-900"><MathText>{k('vPouring', { f: markTex(lab.m) })}</MathText></span>;
      case 'start-book': return <span className="text-slate-800"><MathText>{k('vStartBook', { which: k(`which.${lab.book.which}`) })}</MathText></span>;
      case 'peelOk': return <span className="text-emerald-800"><MathText>{k('vPeelOk', { disc: discCount(4) })}</MathText></span>;
      case 'peelShort': return <span className="text-rose-800"><MathText>{k('vPeelShort', { k: last.k, n: lab.peeled?.extra ?? 4 - last.k })}</MathText></span>;
      case 'peelLong': return <span className="text-rose-800"><MathText>{k('vPeelLong', { k: last.k, n: lab.peeled?.empty ?? last.k - 4 })}</MathText></span>;
      case 'cardOneDisc': return <span className="text-rose-800"><MathText>{k('vCardOneDisc', { v: L.piTex(lab.areaCard.value.k), a: L.piTex(area.k) })}</MathText></span>;
      case 'cardLength': return <span className="text-rose-800"><MathText>{k('vCardLength', { v: L.piTex(lab.areaCard.value.k) })}</MathText></span>;
      case 'cardVolume': return <span className="text-rose-800"><MathText>{k(lab.areaCard.same ? 'vCardVolumeSame' : 'vCardVolume', { v: L.piTex(lab.areaCard.value.k) })}</MathText></span>;
      case 'cardAreaOk': return <span className="text-emerald-800"><MathText>{k('vCardAreaOk', { a: L.piTex(area.k) })}</MathText></span>;
      case 'pourOk': return <span className="text-emerald-800"><MathText>{k('vPourOk', { v: L.piTex(vol.k), cyl: L.piTex(L.glass(lab.rt).volume.k) })}</MathText></span>;
      case 'pourLow':
      case 'pourHigh': return (
        <span className="text-rose-800">
          <MathText>{k(verdictKind === 'pourLow' ? 'vPourLow' : 'vPourHigh', { f: markTex(last.m), at: L.piTex(lab.poured.atMark.k), v: L.piTex(vol.k) })}</MathText>
        </span>
      );
      case 'cardArea': return <span className="text-rose-800"><MathText>{k(lab.volumeCard.same ? 'vCardAreaSame' : 'vCardArea', { v: L.piTex(lab.volumeCard.value.k) })}</MathText></span>;
      case 'cardFullGlass': return <span className="text-rose-800"><MathText>{k('vCardFullGlass', { v: L.piTex(lab.volumeCard.value.k), b: L.piTex(vol.k) })}</MathText></span>;
      case 'cardCoef': return <span className="text-rose-800"><MathText>{k('vCardCoef', { v: L.piTex(lab.volumeCard.value.k), b: L.piTex(vol.k) })}</MathText></span>;
      case 'cardVolumeOk': return <span className="text-emerald-800"><MathText>{k('vCardVolumeOk', { v: L.piTex(vol.k) })}</MathText></span>;
      case 'roundOk': return <span className="text-emerald-800"><MathText>{k(last.which === 'area' ? 'vRoundAreaOk' : 'vRoundVolumeOk', { rd: decTex(last.rounded) })}</MathText></span>;
      case 'roundCoarse':
      case 'roundFine': return (
        <span className="text-rose-800">
          <MathText>{k(`v${verdictKind === 'roundCoarse' ? 'RoundCoarse' : 'RoundFine'}${last.which === 'area' ? 'Area' : 'Volume'}`, { d: last.digits, mm: decTex(String(last.mm)) })}</MathText>
        </span>
      );
      default: return <span className="text-slate-700">{k('vStartPeel')}</span>;
    }
  })();

  /* ── la découverte : les distracteurs réfutés par les essais de l'élève ── */
  const radii = L.triedRadii(lab).map(L.rTex);
  const discoveryOptions = useMemo(() => [
    { text: <MathText>{k('dOptGrow')}</MathText>, why: <MathText>{radii.length >= 2 ? k('dWhyGrowOwn', { a: radii[0], b: radii[radii.length - 1] }) : k('dWhyGrow')}</MathText> },
    { text: <MathText>{k('dOptDisc')}</MathText>, why: <MathText>{k('dWhyDisc')}</MathText> },
    { text: <MathText>{k('dOptFull')}</MathText>, why: <MathText>{k('dWhyFull')}</MathText> },
    { text: <MathText>{k('dOptRight')}</MathText>, correct: true },
  ], [k, radii.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  const formal = (
    <div className="space-y-2" data-op-formal>
      <EquationDisplay tone="result" tex={'\\mathcal{A} = 4\\pi R^2 = 2\\pi R \\times 2R'} note={k('fNoteArea')} />
      <EquationDisplay tone="result" tex={'\\mathcal{V} = \\frac{2}{3} \\times \\pi R^2 \\times 2R = \\frac{4}{3}\\pi R^3'} note={k('fNoteVolume')} />
      <p className="text-sm text-emerald-900 [&_.katex]:whitespace-nowrap"><MathText>{k('fWithR', { r: rT, a: L.piTex(L.skin(lab.rt).k), v: L.piTex(L.juice(lab.rt).k) })}</MathText></p>
    </div>
  );

  /* ── les étapes et leurs questions : la peau, le jus, le contraste (puis la règle), l'exemple arrondi ── */
  const stepList = L.stepsOf(lab).map((st) => ({ ...st, chain: chainOf(st.id) }));
  const stepDone = stepList.map((st) => !!doneIds[st.id] || (!cpLive && st.reached));
  const nextStep = cpLive ? stepList.find((st) => !doneIds[st.id]) : null;
  const cpId = nextStep && nextStep.reached ? nextStep.id : null;
  const chain = cpId ? nextStep.chain : null;
  const cp = useLabCheckpoint({
    id: cpId,
    questions: chain ? chain.map((q) => QUESTIONS[q]({ lab, options: discoveryOptions, formal }, k)) : null,
    reached: !!cpId,
    resetKey: scene.inits,
    onRetry: () => setLab((cur) => L.retryStep(cur, cpId)),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setDoneIds((d) => ({ ...d, [id]: true }));
      if (stepList.find((st) => st.id === id)?.chain.includes('rule')) { state.discover(); state.formalize(); }
    },
  });
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // « إعادة » : on refête
  const doneKey = stepDone.join();
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.has(i)) return;
      celebrated.current.add(i);
      party.celebrate({ n: i + 1, total: stepList.length });
    });
  }, [doneKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le son : un déclic quand R, la prédiction, la peau, la marque ou le jus changent (au plus un toutes les 35 ms), « flag » au geste jugé
     juste, « over » au geste refusé, « bell » quand une étape est finie. Muet sauf « الصوت ». ── */
  const tick = useRef({ key: null, at: 0 });
  const gestureKey = `${lab.rt}|${lab.k}|${Math.round(lab.p * 24)}|${Math.round(lab.q * 24)}|${lab.m}`;
  useEffect(() => {
    const p = tick.current;
    if (p.key === null) { p.key = gestureKey; return; }
    if (p.key === gestureKey) return;
    p.key = gestureKey;
    const now = performance.now();
    if (now - p.at > 35) { playSfx('tooth'); p.at = now; }
  }, [gestureKey]);
  const heard = useRef(0);
  useEffect(() => {
    const n = lab.trials.length;
    if (n < heard.current) heard.current = 0;
    if (n === 0 || n === heard.current) return;
    heard.current = n;
    playSfx(lab.trials[n - 1].ok ? 'flag' : 'over');
  }, [lab.trials.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const bells = useRef(0);
  useEffect(() => {
    const n = stepDone.filter(Boolean).length;
    if (n > bells.current) playSfx('bell');
    bells.current = n;
  }, [doneKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── les commandes ── */
  const btn = `inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 ${narrow ? 'px-2 text-xs' : 'px-3 text-sm'} font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 disabled:opacity-40`;
  const card = (id, ok, picked) => `min-h-[44px] rounded-xl border-2 px-1 py-1 text-center ${narrow ? 'text-xs' : 'text-sm'} font-bold [&_.katex]:whitespace-nowrap focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${picked ? (ok ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-rose-400 bg-rose-50 text-rose-900') : 'border-orange-200 bg-white text-slate-800 hover:border-orange-400'}`;
  const rLocked = phase === 'book' || (phase === 'peel' && lab.p > 0 && !lab.peeled) || (phase === 'pour' && lab.q > 0 && !lab.poured);
  const rRow = (
    <div className="flex items-center gap-2 rounded-xl bg-white/90 px-2 ring-1 ring-orange-200" data-op-r-row>
      <span className="shrink-0 text-xs font-bold text-orange-900">{k('rLabel')}</span>
      <Slider value={lab.rt} min={rg.min} max={rg.max} step={rg.step} big={rg.big} disabled={rLocked}
        onChange={(v) => setLab((s) => L.setR(s, v))} label={k('rAria')} valueText={k('rValue', { r: L.rText(lab.rt) })} data={{ 'data-op-r': lab.rt }} />
      <bdi dir="ltr" className="shrink-0 font-mono text-sm font-bold text-slate-900">{`R = ${L.rText(lab.rt)} cm`}</bdi>
    </div>
  );
  const stepper = (name, label, value, onMinus, onPlus, disabled, minusOff, plusOff) => (
    <div className="flex items-center gap-1 rounded-xl bg-white/90 px-1 ring-1 ring-orange-200" role="group" aria-label={label}>
      <button type="button" className={`${btn} border-orange-200 bg-white text-orange-900`} onClick={onMinus} disabled={disabled || minusOff} aria-label={k('minus', { what: label })} {...{ [`data-op-${name}-minus`]: true }}>−</button>
      <span className={`min-w-[4.5rem] text-center ${narrow ? 'text-xs' : 'text-sm'} font-bold text-slate-900 [&_.katex]:whitespace-nowrap`} {...{ [`data-op-${name}`]: true }} aria-live="polite">{value}</span>
      <button type="button" className={`${btn} border-orange-200 bg-white text-orange-900`} onClick={onPlus} disabled={disabled || plusOff} aria-label={k('plus', { what: label })} {...{ [`data-op-${name}-plus`]: true }}>+</button>
    </div>
  );

  let controls = null;
  if (phase === 'peel') {
    if (!lab.peeled) {
      controls = (
        <div className={`grid gap-1.5 ${narrow ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {stepper('k', k('kLabel'), discCount(lab.k), () => setLab((s) => L.setK(s, s.k - 1)), () => setLab((s) => L.setK(s, s.k + 1)), !L.canPredict(lab), lab.k <= L.K_MIN, lab.k >= L.K_MAX)}
          <div className="flex items-center gap-1 rounded-xl bg-white/90 px-2 ring-1 ring-rose-200">
            <span className="shrink-0 text-xs font-bold text-rose-900">{k('peelLabel')}</span>
            <Slider value={Math.round(lab.p * 100)} min={0} max={100} step={5} big={25} onChange={(v) => setLab((s) => L.peelTo(s, v / 100))}
              label={k('peelAria')} valueText={k('peelValue', { n: Math.round(lab.p * 100) })} data={{ 'data-op-peel': Math.round(lab.p * 100) }} />
            <button type="button" className={`${btn} border-rose-300 bg-rose-500 text-white`} onClick={() => runTo('p', L.peelTo)} data-op-peel-all>{k('peelAll')}</button>
          </div>
        </div>
      );
    } else if (!lab.peeled.ok) {
      controls = (
        <div className="flex flex-wrap justify-center gap-1.5">
          <button type="button" className={`${btn} border-orange-300 bg-orange-500 text-white`} onClick={() => setLab((s) => L.resetPeel(s))} data-op-reset-peel>{k('resetPeel')}</button>
        </div>
      );
    } else if (!lab.areaOk) {
      controls = (
        <div className="space-y-1">
          <p className={`text-center ${narrow ? 'text-xs' : 'text-sm'} font-bold text-slate-800`}><MathText>{k('cardsArea')}</MathText></p>
          <div className={`grid gap-1.5 ${narrow ? 'grid-cols-2' : 'grid-cols-4'}`} role="group" aria-label={k('cardsAreaAria')}>
            {L.AREA_CARDS.map((id) => (
              <button key={id} type="button" className={card(id, lab.areaCard?.ok, lab.areaCard?.id === id)} onClick={() => setLab((s) => L.pickAreaCard(s, id))} data-op-card={id} aria-pressed={lab.areaCard?.id === id}>
                <MathText>{`$\\mathcal{A} = ${L.cardValue(id, lab.rt).tex}$`}</MathText>
              </button>
            ))}
          </div>
        </div>
      );
    } else {
      controls = (
        <div className="flex flex-wrap justify-center gap-1.5">
          <button type="button" className={`${btn} border-orange-200 bg-white text-orange-900`} onClick={() => setLab((s) => L.resetPeel(s))} data-op-reset-peel>{k('resetPeelAgain')}</button>
          <button type="button" className={`${btn} border-amber-400 bg-amber-400 text-slate-900`} onClick={() => setLab((s) => L.openPour(s))} data-op-to-pour>{k('toPour')}</button>
        </div>
      );
    }
  } else if (phase === 'pour') {
    if (!lab.poured) {
      const st = L.markStep(lv);
      controls = (
        <div className={`grid gap-1.5 ${narrow ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {stepper('mark', k('markLabel'), <MathText>{`$${markTex(lab.m)}$`}</MathText>, () => setLab((s) => L.setMark(s, s.m - st)), () => setLab((s) => L.setMark(s, s.m + st)), !L.canMark(lab), lab.m <= st, lab.m >= L.MARK_DEN - st)}
          <div className="flex items-center gap-1 rounded-xl bg-white/90 px-2 ring-1 ring-rose-200">
            <span className="shrink-0 text-xs font-bold text-rose-900">{k('pourLabel')}</span>
            <Slider value={Math.round(lab.q * 100)} min={0} max={100} step={5} big={25} onChange={(v) => setLab((s) => L.pourTo(s, v / 100))}
              label={k('pourAria')} valueText={k('pourValue', { n: Math.round(lab.q * 100) })} data={{ 'data-op-pour': Math.round(lab.q * 100) }} />
            <button type="button" className={`${btn} border-rose-300 bg-rose-500 text-white`} onClick={() => runTo('q', L.pourTo)} data-op-pour-all>{k('pourAll')}</button>
          </div>
        </div>
      );
    } else if (!lab.poured.ok) {
      controls = (
        <div className="flex flex-wrap justify-center gap-1.5">
          <button type="button" className={`${btn} border-orange-300 bg-orange-500 text-white`} onClick={() => setLab((s) => L.resetPour(s))} data-op-reset-pour>{k('resetPour')}</button>
        </div>
      );
    } else if (!lab.volumeOk) {
      controls = (
        <div className="space-y-1">
          <p className={`text-center ${narrow ? 'text-xs' : 'text-sm'} font-bold text-slate-800`}><MathText>{k('cardsVolume')}</MathText></p>
          <div className={`grid gap-1.5 ${narrow ? 'grid-cols-2' : 'grid-cols-4'}`} role="group" aria-label={k('cardsVolumeAria')}>
            {L.VOLUME_CARDS.map((id) => (
              <button key={id} type="button" className={card(id, lab.volumeCard?.ok, lab.volumeCard?.id === id)} onClick={() => setLab((s) => L.pickVolumeCard(s, id))} data-op-vcard={id} aria-pressed={lab.volumeCard?.id === id}>
                <MathText>{`$\\mathcal{V} = ${L.cardValue(id, lab.rt).tex}$`}</MathText>
              </button>
            ))}
          </div>
        </div>
      );
    } else {
      controls = (
        <div className="flex flex-wrap justify-center gap-1.5">
          <button type="button" className={`${btn} border-orange-200 bg-white text-orange-900`} onClick={() => setLab((s) => L.backToPeel(s))} data-op-to-peel>{k('toPeel')}</button>
          <button type="button" className={`${btn} border-orange-200 bg-white text-orange-900`} onClick={() => setLab((s) => L.resetPour(s))} data-op-reset-pour>{k('resetPourAgain')}</button>
          {lv === 'advanced' && state.isFormal && (
            <button type="button" className={`${btn} border-amber-400 bg-amber-400 text-slate-900`} onClick={() => setLab((s) => L.openBook(s))} data-op-to-book>{k('toBook')}</button>
          )}
        </div>
      );
    }
  } else {
    const done = L.bookDone(lab);
    controls = (
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {!done && stepper('digits', k('digitsLabel', { which: k(`which.${lab.book.which}`) }), k('digitsValue', { count: lab.book.digits }), () => setLab((s) => L.setDigits(s, s.book.digits - 1)), () => setLab((s) => L.setDigits(s, s.book.digits + 1)), false, lab.book.digits <= 0, lab.book.digits >= 4)}
        {!done && <button type="button" className={`${btn} border-amber-400 bg-amber-400 text-slate-900`} onClick={() => setLab((s) => L.checkRounding(s))} data-op-round>{k('round')}</button>}
        <button type="button" className={`${btn} border-orange-200 bg-white text-orange-900`} onClick={() => setLab((s) => L.closeBook(s))} data-op-close-book>{k('closeBook')}</button>
      </div>
    );
  }

  const sceneLabel = k('sceneLabel', { r: L.rText(lab.rt), phase: k(`phaseName.${phase}`) });

  return (
    <ManipulationShell
      type="orange-peel"
      title={title ?? k('title')}
      mission={mission ?? <MathText>{k(`mission.${phase}`)}</MathText>}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided={cpLive}
      hints={['hint1', 'hint2', 'hint3'].map((hk) => <MathText key={hk}>{k(hk)}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={<ManipulationDiscovery state={state} prompt={k('dPrompt')} options={discoveryOptions} formal={formal} />}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-orange-50 to-amber-100/70" minHeight="min-h-[180px]">
        <div ref={boxRef} className="relative space-y-2" data-orange-peel data-world={theme} data-phase={phase} data-level={lv} data-r={L.rText(lab.rt)} data-op-rt={lab.rt}>
          {party.node}
          {cp.node}
          <LabStepper count={stepList.length} current={Math.max(0, stepDone.indexOf(false) < 0 ? stepList.length - 1 : stepDone.indexOf(false))} done={stepDone} stepAttr="data-op-step" />
          <div ref={glanceRef} className="space-y-1.5" data-op-glance>
            <div className="relative overflow-hidden rounded-2xl" style={{ height: stageH }}>
              <Kitchen uid={uid} reduce={reduce} narrow={narrow} />
              <Stage3D
                build={build} state={scene3d} className="absolute inset-0" style={{ height: '100%' }}
                view={{ azimuth: -90, elevation: 30, distance: 12 }} target={[2.5, 0, 0.3]}
                ariaLabel={sceneLabel}
                fallback={<SpaceFigure {...fallbackFigure(lab.rt, sceneLabel)} />}
              />
            </div>
            {rRow}
            {controls}
            {reading && <p className={`min-h-[1.5rem] text-center ${narrow ? 'text-xs' : 'text-sm'} text-slate-800`} data-op-reading aria-live="polite"><MathText>{reading}</MathText></p>}
            <p role="status" className={`min-h-[2.5rem] rounded-xl bg-white/95 px-2 py-1 ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug`} data-op-verdict={verdictKind}>{verdict}</p>
          </div>

          {lab.trials.length > 0 && (
            <LabFold id="orange-peel.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-op-trials={lab.trials.length}>
                {lab.trials.map((tr) => (
                  <li key={tr.n} className={tr.ok ? 'text-emerald-800' : 'text-rose-800'}>
                    <MathText>{k(`trial.${tr.kind}`, { r: tr.R.replace(',', '{,}'), disc: tr.k != null ? discCount(tr.k) : '', f: tr.m != null ? markTex(tr.m) : '', card: tr.card ? L.cardValue(tr.card, 10).tex : '', d: tr.digits ?? '', rd: tr.rounded ? decTex(tr.rounded) : '' })}</MathText>
                  </li>
                ))}
              </ul>
            </LabFold>
          )}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

function gcd(a, b) { while (b) [a, b] = [b, a % b]; return a || 1; }
const decTex = (s) => String(s).replace('.', ',').replace(',', '{,}');

/**
 * Le DÉCOR (exigence du propriétaire, monde Gen-Alpha) derrière la scène 3D : la cuisine de la maison — un mur de zellige,
 * une fenêtre ensoleillée, la table en bois, une cagette « برتقال بوفاريك » et un téléphone sur mini-trépied qui filme
 * l'épluchage pour la story (un toucher fait monter des cœurs). `aria-hidden`, hors clavier, sans aucune mesure ; ids de
 * dégradés par `useId` (les deux niveaux d'un workspace sont montés ensemble) ; immobile sous `prefers-reduced-motion`.
 */
function Kitchen({ uid, reduce, narrow }) {
  const [likes, setLikes] = useState(0);
  const s = narrow ? 0.75 : 1;
  return <>
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" data-deco="boufarik-orange">
        <defs>
          <linearGradient id={`opWall${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff7ed" /><stop offset="1" stopColor="#ffedd5" />
          </linearGradient>
          <linearGradient id={`opTable${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fdba74" /><stop offset="1" stopColor="#fb923c" />
          </linearGradient>
          <pattern id={`opZel${uid}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#e0f2fe" />
            <path d="M10 1 L19 10 L10 19 L1 10 Z" fill="#38bdf8" opacity="0.45" />
            <circle cx="10" cy="10" r="2.6" fill="#f59e0b" opacity="0.7" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="400" height="300" fill={`url(#opWall${uid})`} />
        <rect x="0" y="62" width="400" height="26" fill={`url(#opZel${uid})`} opacity="0.85" />
        {/* la fenêtre et le soleil de la Mitidja */}
        <g opacity="0.8">
          <rect x="300" y="8" width="70" height="48" rx="4" fill="#bae6fd" stroke="#f8fafc" strokeWidth="3" />
          <circle cx="352" cy="22" r="8" fill="#fde047" />
          <path d="M300 48 q18 -10 34 -2 t36 -4 v14 h-70 z" fill="#86efac" />
          <line x1="335" y1="8" x2="335" y2="56" stroke="#f8fafc" strokeWidth="2" />
        </g>
        {/* le carrelage du sol de la cuisine */}
        <rect x="0" y="190" width="400" height="110" fill={`url(#opTable${uid})`} />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <line key={i} x1={i * 50} y1="190" x2={i * 50 - 40} y2="300" stroke="#9a3412" strokeOpacity="0.18" strokeWidth="1.2" />)}
        {[215, 250].map((y) => <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#9a3412" strokeOpacity="0.18" strokeWidth="1.2" />)}
        {/* la cagette de Boufarik (coin bas-gauche) */}
        <g transform="translate(8 236)">
          <rect x="0" y="12" width="78" height="40" rx="3" fill="#a16207" />
          <rect x="0" y="22" width="78" height="4" fill="#854d0e" /><rect x="0" y="36" width="78" height="4" fill="#854d0e" />
          {[[12, 10], [30, 6], [48, 9], [66, 7], [21, -2], [57, -3]].map(([x, y], i) => <circle key={i} cx={x} cy={y + 8} r="9" fill="#f97316" stroke="#ea580c" strokeWidth="1" />)}
          <text x="39" y="49" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#fef3c7" direction="rtl">برتقال بوفاريك</text>
        </g>
    </svg>
    {/* le téléphone de la story (coin haut côté début) : un toucher, des cœurs — décor seulement */}
    <button
      type="button" tabIndex={-1} aria-hidden="true" data-deco-tap
      onClick={() => setLikes((n) => n + 1)}
      className="absolute start-1 top-1 z-10 h-[72px] w-[44px] rounded-lg focus:outline-none"
      style={{ transform: `scale(${s})`, transformOrigin: 'top right' }}
    >
      <svg viewBox="0 0 44 72" className="h-full w-full">
        <line x1="22" y1="52" x2="10" y2="70" stroke="#334155" strokeWidth="2" /><line x1="22" y1="52" x2="34" y2="70" stroke="#334155" strokeWidth="2" />
        <rect x="8" y="2" width="28" height="50" rx="5" fill="#0f172a" />
        <rect x="11" y="7" width="22" height="40" rx="2" fill="#fed7aa" />
        <circle cx="22" cy="27" r="7" fill="#f97316" />
        <circle cx="15" cy="11" r="2" fill="#ef4444" className={reduce ? undefined : 'op-rec'} />
        <text x="25" y="13" fontSize="5" fontWeight="700" fill="#7c2d12" direction="rtl" textAnchor="middle">مباشر</text>
      </svg>
        {likes > 0 && !reduce && [0, 1, 2].map((i) => (
          <span key={`${likes}-${i}`} className="op-heart pointer-events-none absolute text-sm" style={{ left: 8 + i * 9, top: 6, animationDelay: `${i * 120}ms` }}>♥</span>
        ))}
        <style>{'.op-rec{animation:opRec 1.2s steps(2) infinite}@keyframes opRec{50%{opacity:.2}}.op-heart{color:#f43f5e;animation:opHeart 1.1s ease-out both}@keyframes opHeart{from{transform:translateY(0);opacity:1}to{transform:translateY(-40px);opacity:0}}@media (prefers-reduced-motion: reduce){.op-rec,.op-heart{animation:none}}'}</style>
      </button>
  </>;
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de chaque étape : la peau (disque · aire), le jus (verre · rapport), le contraste (nombre de disques · unités · règle), l'exemple arrondi. */
export function chainOf(id) {
  return ({ peel: ['pDisc', 'pSkin'], pour: ['jCyl', 'jRatio'], rule: ['same', 'unit', 'rule'], book: ['bookMm2', 'bookMm3'] })[id];
}

const $ = (x) => `$${x}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const nums = (lab) => {
  const r = L.R(lab.rt);
  return { R: $(L.rTex(lab.rt)), disc: L.disc(lab.rt).k, skin: L.skin(lab.rt).k, cyl: L.glass(lab.rt).volume.k, ball: L.juice(lab.rt).k, r };
};
const num = (k, id, o, expected, answer) => ({
  id, kind: 'number', expected, answer: <MathText>{$(answer)}</MathText>,
  prompt: Cq(k, `${id}.prompt`, o), hints: [Cq(k, `${id}.hint1`, o), Cq(k, `${id}.hint2`, o)], explain: Cq(k, `${id}.explain`, o),
});
const choice = (k, id, o, texts, hints = ['hint1', 'hint2'], seed = id.length) => ({
  id, kind: 'choice', cols: 1, prompt: Cq(k, `${id}.prompt`, o),
  options: spread(texts.map(([key, why], i) => ({ text: Cq(k, `${id}.${key}`, o), correct: i === 0, why: i === 0 ? undefined : Cq(k, `${id}.${why}`, o) })), seed),
  hints: hints.map((h) => Cq(k, `${id}.${h}`, o)), explain: Cq(k, `${id}.explain`, o),
});

/** Chaque question est construite sur LE rayon de l'élève (rien n'est écrit en dur) ; `k` : les textes de `orangePeel`. */
export const QUESTIONS = {
  pDisc: ({ lab }, k) => {
    const n = nums(lab);
    return num(k, 'pDisc', { R: n.R }, L.answerText(n.disc), L.fracTex(n.disc));
  },
  pSkin: ({ lab }, k) => {
    const n = nums(lab);
    return num(k, 'pSkin', { R: n.R, d: $(`${L.fracTex(n.disc)}\\pi`), a: L.fracTex(n.skin) }, L.answerText(n.skin), L.fracTex(n.skin));
  },
  jCyl: ({ lab }, k) => {
    const n = nums(lab);
    return num(k, 'jCyl', { R: n.R, d: $(`${L.fracTex(n.disc)}\\pi`), h: $(L.rTex(lab.rt * 2)), v: L.fracTex(n.cyl) }, L.answerText(n.cyl), L.fracTex(n.cyl));
  },
  jRatio: ({ lab }, k) => {
    const n = nums(lab);
    return choice(k, 'jRatio', { R: n.R, cyl: $(`${L.fracTex(n.cyl)}\\pi`), ball: $(L.piTex(n.ball)) }, [['two', ''], ['half', 'whyHalf'], ['quarter', 'whyQuarter']]);
  },
  same: ({ lab }, k) => {
    const n = nums(lab);
    return choice(k, 'same', { R: n.R }, [['four', ''], ['grows', 'whyGrows'], ['shrinks', 'whyShrinks']]);
  },
  unit: ({ lab }, k) => {
    const n = nums(lab);
    return choice(k, 'unit', { R: n.R, a: $(L.piTex(n.skin)), v: $(L.piTex(n.ball)) }, [['no', ''], ['yes', 'whyYes'], ['coincide', 'whyCoincide']]);
  },
  rule: ({ options, formal }, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k('dPrompt')}</MathText>, options,
    hints: [Cq(k, 'rule.hint1'), Cq(k, 'rule.hint2')], explain: formal,
  }),
  bookMm2: (ctx, k) => num(k, 'bookMm2', {}, '100', '100'),
  bookMm3: (ctx, k) => num(k, 'bookMm3', {}, '1000', '1000'),
};
