import { useCallback, useRef, useState } from 'react';

/**
 * useDragValue — saisir UN objet de la figure et le déplacer, en unités
 * mathématiques.
 *
 * Pourquoi ce hook plutôt qu'un `<input type="range">` sous la figure : le
 * curseur natif sépare le geste de son effet (on tire en bas pour faire bouger
 * en haut). Ici c'est l'élément lui-même — la part, le bloc, le point, la
 * frontière — qui porte la poignée : le geste EST la transformation
 * mathématique (INTERACTION_PEDAGOGY §16, règle projet du 2026-09-06).
 *
 * Le hook ne dessine rien. Il convertit une position de pointeur en valeur
 * mathématique et rend les gestionnaires à poser sur l'élément saisissable ;
 * la figure reste entièrement à la charge de la leçon.
 *
 * Accessibilité : `a11yProps` fournit un `role="slider"` focalisable, piloté
 * aux flèches (±step), Page↑/↓ (±10 pas), Début/Fin — la manipulation reste
 * donc entièrement faisable au clavier, sans souris ni doigt.
 *
 * RÈGLE PROJET : la manipulation ne se fige JAMAIS après validation de
 * l'étape. Il n'y a volontairement pas de prop `disabled` ; seul `locked`
 * — réservé aux figures d'illustration pilotées par le module — retire la
 * poignée.
 *
 * @param {object}   o
 * @param {number}   o.value      valeur courante, en unités mathématiques
 * @param {function} o.onChange   reçoit la nouvelle valeur (déjà bornée et calée)
 * @param {number}   o.min
 * @param {number}   o.max
 * @param {number}   [o.step=1]   granularité ; la garder fine (le continu enseigne)
 * @param {'x'|'y'}  [o.axis='x'] axe du geste ; 'y' est inversé (haut = plus)
 * @param {boolean}  [o.locked=false]
 * @param {function} [o.toValue]  (ratio 0..1) → valeur, pour une échelle non linéaire
 * @param {string}   [o.ariaLabel]
 * @param {function} [o.valueText] (value) → texte annoncé par le lecteur d'écran
 */
export default function useDragValue({
  value,
  onChange,
  min,
  max,
  step = 1,
  axis = 'x',
  locked = false,
  toValue,
  ariaLabel = 'Valeur',
  valueText,
}) {
  const frameRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const clamp = (v) => Math.max(min, Math.min(max, v));
  // Le calage passe par une grille ancrée sur `min` : sans cela, un min non
  // multiple du pas (ex. min = 0,5 au pas 0,25) produirait des valeurs
  // décalées et l'élève ne pourrait jamais atteindre les extrêmes.
  const snap = (v) => {
    const snapped = min + Math.round((v - min) / step) * step;
    // Le pas peut être décimal : on arrondit pour éviter 0,30000000000000004.
    const decimals = (String(step).split('.')[1] || '').length;
    return clamp(Number(snapped.toFixed(decimals)));
  };

  const valueFromEvent = useCallback((e) => {
    const frame = frameRef.current;
    if (!frame) return value;
    const rect = frame.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return value;
    const ratio = axis === 'x'
      ? (e.clientX - rect.left) / rect.width
      // En y, l'écran descend quand la valeur monte : on inverse.
      : 1 - (e.clientY - rect.top) / rect.height;
    const bounded = Math.max(0, Math.min(1, ratio));
    return snap(toValue ? toValue(bounded) : min + bounded * (max - min));
  }, [axis, min, max, step, value, toValue]);

  const begin = (e) => {
    if (locked) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    onChange(valueFromEvent(e));
  };
  const move = (e) => {
    if (!dragging || locked) return;
    onChange(valueFromEvent(e));
  };
  const end = (e) => {
    if (locked) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };

  const onKeyDown = (e) => {
    if (locked) return;
    const big = step * 10;
    const map = {
      ArrowRight: step, ArrowUp: step,
      ArrowLeft: -step, ArrowDown: -step,
      PageUp: big, PageDown: -big,
    };
    if (e.key in map) { e.preventDefault(); onChange(snap(value + map[e.key])); return; }
    if (e.key === 'Home') { e.preventDefault(); onChange(min); }
    if (e.key === 'End') { e.preventDefault(); onChange(max); }
  };

  return {
    dragging,
    /** À poser sur le cadre qui définit la course du geste (le SVG, la piste). */
    frameProps: { ref: frameRef, style: { touchAction: 'none' } },
    /** À poser sur l'élément SAISISSABLE lui-même (la part, le bloc, le point). */
    handleProps: locked ? {} : {
      onPointerDown: begin,
      onPointerMove: move,
      onPointerUp: end,
      onPointerCancel: end,
      style: { cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' },
    },
    /** Rôle, bornes et pilotage clavier — la manipulation sans souris. */
    a11yProps: locked ? { 'aria-hidden': true } : {
      role: 'slider',
      tabIndex: 0,
      'aria-label': ariaLabel,
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-valuenow': value,
      ...(valueText ? { 'aria-valuetext': valueText(value) } : {}),
      onKeyDown,
    },
  };
}
