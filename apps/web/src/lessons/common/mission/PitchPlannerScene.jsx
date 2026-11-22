import KidFigure from '../manipulations/primitives/KidFigure';
import { PitchBackdrop, PitchPlot, TurfStrips, PitchLines, Goal } from './pitchSceneKit';

const W = 480;
const H = 260;
const GROUND = 214;
const BOARD = { x: 168, y: 34, w: 144, h: 112 };      // le tableau du mentor sur son chevalet
const MINI = { x: 196, y: 52, w: 88, hMax: 56 };        // le petit terrain tracé sur le tableau
const SLIDER = { x1: 196, x2: 284, y: 126 };            // le curseur sous le petit terrain (sans graduation)

/**
 * LE TABLEAU DU MENTOR (leçon `jidaa-maadum`, unité 4 « معادلات ومتراجحات », rollout 2026-11-11 ; conseil du 2026-11-11, verdict L2 — « pitch-planner »)
 * — dessinée en code (CLAUDE.md : aucune image générée dans les leçons), sur les primitives communes de l'unité 3 (`pitchSceneKit.jsx`).
 * Au bord du terrain du quartier, le mentor a posé un tableau sur un chevalet : un petit terrain à deux côtés (l'un bleu, l'autre violet) et un
 * curseur dessous (sans graduation, sans nombre). À mesure que les outils sont gagnés (`fill` ∈ [0, 1]), le petit terrain passe d'une simple LIGNE
 * à un rectangle plein, et le vrai terrain derrière reçoit son gazon puis ses lignes blanches. Deux élèves dessinés par `KidFigure` : une fille en
 * hijab (tenue islamique) montre le curseur, un garçon tient un ballon. Aucun nombre ni aucune lettre n'est dessiné ; le texte arabe reste dans le DOM.
 */
export default function PitchPlannerScene({ fill = 0, label, className = '', scene = 'pitch-planner' }) {
  const f = Math.max(0, Math.min(1, fill));
  const done = f >= 1;
  const h = Math.max(0, f * MINI.hMax);
  const knob = SLIDER.x1 + (SLIDER.x2 - SLIDER.x1) * f;
  const baseY = MINI.y + MINI.hMax;                      // le coin O du petit terrain : en bas à gauche
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      data-scene={scene} data-fill={f.toFixed(2)}>
      <PitchBackdrop width={W} height={H} ground={GROUND} />
      {/* le vrai terrain, derrière : le gazon se pose avec les outils */}
      <PitchPlot x={40} y={156} w={400} h={46} />
      <TurfStrips x={40} y={156} w={400} h={46} fill={f} bands={10} />
      {done && <PitchLines x={40} y={156} w={400} h={46} />}
      {done && <Goal x={40} y={167} h={24} side="left" />}
      {/* le chevalet et son tableau */}
      <g data-planner-board>
        <line x1={BOARD.x + 18} y1={BOARD.y + BOARD.h} x2={BOARD.x - 6} y2={GROUND - 2} stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
        <line x1={BOARD.x + BOARD.w - 18} y1={BOARD.y + BOARD.h} x2={BOARD.x + BOARD.w + 6} y2={GROUND - 2} stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
        <rect x={BOARD.x} y={BOARD.y} width={BOARD.w} height={BOARD.h} rx="6" fill="#F8FAFC" stroke="#78350F" strokeWidth="4" />
        {/* le petit terrain : une LIGNE tant que rien n'est acquis, puis un rectangle qui se déplie vers le haut */}
        <rect x={MINI.x} y={baseY - h} width={MINI.w} height={Math.max(h, 0.01)} fill="#22C55E" opacity={h > 0.5 ? 0.9 : 0} data-planner-mini />
        <line x1={MINI.x} y1={baseY} x2={MINI.x + MINI.w} y2={baseY} stroke="#1D4ED8" strokeWidth="5" strokeLinecap="round" />
        <line x1={MINI.x} y1={baseY} x2={MINI.x} y2={baseY - Math.max(h, 0)} stroke="#7C3AED" strokeWidth="5" strokeLinecap="round" />
        <circle cx={MINI.x} cy={baseY} r="3.5" fill="#0F172A" />
        {/* le curseur, sans graduation */}
        <line x1={SLIDER.x1} y1={SLIDER.y} x2={SLIDER.x2} y2={SLIDER.y} stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
        <circle cx={knob} cy={SLIDER.y} r="7" fill="#0EA5E9" stroke="#fff" strokeWidth="2" data-planner-knob />
      </g>
      {!done && <circle cx={420} cy={GROUND - 8} r="6" fill="#fff" stroke="#0F172A" strokeWidth="1.2" data-ball />}
      <KidFigure cx={96} top={110} foot={GROUND - 2} hairStyle="hijab" scarf="sky" outfit="violet" mood={done ? 'proud' : 'wonder'} />
      <KidFigure cx={380} top={114} foot={GROUND - 2} outfit="orange" mood={done ? 'proud' : 'happy'} />
    </svg>
  );
}
