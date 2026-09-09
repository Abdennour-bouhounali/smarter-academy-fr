/**
 * Noyau mathématique de « Fonctions » (5e).
 *
 * RÈGLE-OBJETS. Une dépendance est une FONCTION de l'entrée au sens
 * informatique du terme — jamais une liste de valeurs écrite à la main. C'est
 * ce qui garantit deux choses que la leçon AFFIRME et que le code doit rendre
 * vraies partout :
 *   1. une même entrée redonne toujours la même sortie (le cœur du module 1) ;
 *   2. une dépendance peut décroître, ou n'être pas proportionnelle, sans
 *      cesser d'être une dépendance (ce que la leçon sœur écarte, et que
 *      celle-ci accueille).
 *
 * PÉRIMÈTRE. Aucun identifiant, aucun commentaire et aucune sortie de ce
 * fichier n'emploie « image », « antécédent » ni la notation f(x) : ce sont
 * des objets de 3e. On dit « entrée » et « sortie ».
 *
 * Toutes les fonctions sont pures et testées (fonctionsUtils.test.js).
 */
import { parseDec } from '@smarter-academy/core';

/** `parseFr` est ENTIER : toute saisie décimale a besoin de `parseDec`. */
export { parseDec };

export const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;

export function fr(x, maxDecimals = 2) {
  if (!Number.isFinite(x)) return '—';
  return x.toLocaleString('fr-FR', { maximumFractionDigits: maxDecimals });
}

/* ─────────────────────────────────────────────────────────────────────
   Une grandeur qui dépend d'une autre
   ───────────────────────────────────────────────────────────────────── */

/**
 * Une grandeur de sortie : un nom, une unité, et la RÈGLE qui la calcule à
 * partir de l'entrée. `rule` est la seule source de vérité ; rien de ce que
 * la leçon affiche n'est écrit ailleurs.
 */
export const quantity = ({ id, label, unit, rule, decimals = 0, ...meta }) => ({
  id,
  label,
  unit,
  decimals,
  at: (x) => round2(rule(x)),
  ...meta,
});

/**
 * Le tableau de valeurs d'une grandeur, pour une liste d'entrées.
 * C'est l'objet du module 3 — et il est ENGENDRÉ, jamais recopié.
 */
export const valueTable = (q, inputs) => inputs.map((x) => ({ x, y: q.at(x) }));

/** La sortie pour une entrée donnée, ou null si l'entrée n'est pas au tableau. */
export function readTable(rows, x) {
  const row = rows.find((r) => r.x === x);
  return row ? row.y : null;
}

/**
 * Le sens de variation entre deux entrées — « monte », « descend », ou « ne
 * bouge pas ». Il sert au module 1 à faire constater qu'une dépendance n'est
 * pas forcément croissante : la masse du pain DIMINUE quand la cuisson
 * augmente, et c'est une dépendance quand même.
 */
export function trend(q, a, b) {
  const d = round2(q.at(b) - q.at(a));
  if (d > 0) return 'monte';
  if (d < 0) return 'descend';
  return 'stable';
}

/* ─────────────────────────────────────────────────────────────────────
   Le programme de calcul (module 3)
   ───────────────────────────────────────────────────────────────────── */

/**
 * Un programme de calcul : une suite d'étapes appliquées à un nombre de
 * départ. Chaque étape porte son libellé, de sorte que la leçon montre le
 * DÉROULÉ et non seulement le résultat — c'est ce déroulé qui remplace la
 * notation f(x), hors programme en 5e.
 */
export const program = (steps) => ({
  steps,
  /** Le résultat final. */
  run: (x) => round2(steps.reduce((acc, s) => s.apply(acc), x)),
  /** Les valeurs intermédiaires, pour l'affichage pas à pas. */
  trace: (x) => {
    const out = [{ label: 'Je choisis un nombre', value: round2(x) }];
    let acc = x;
    for (const s of steps) {
      acc = s.apply(acc);
      out.push({ label: s.label, value: round2(acc) });
    }
    return out;
  },
});

export const step = (label, apply) => ({ label, apply });

/* ─────────────────────────────────────────────────────────────────────
   Lecture graphique (modules 4 et 5)
   ───────────────────────────────────────────────────────────────────── */

/** Les couples d'un tableau, en points pour CoordPlane. */
export const toPoints = (rows, color = '#4f46e5', prefix = 'p') =>
  rows.map((r) => ({ id: `${prefix}${r.x}`, x: r.x, y: r.y, color }));

/**
 * Lecture d'une valeur sur une courbe échantillonnée, par interpolation
 * linéaire entre les deux points encadrants. C'est exactement ce que fait un
 * élève qui suit la courbe avec son doigt — et cela permet de poser des
 * questions sur des instants qui ne sont pas dans le tableau.
 */
export function readCurve(rows, x) {
  const sorted = [...rows].sort((a, b) => a.x - b.x);
  if (x <= sorted[0].x) return sorted[0].y;
  if (x >= sorted[sorted.length - 1].x) return sorted[sorted.length - 1].y;
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (x >= a.x && x <= b.x) {
      if (b.x === a.x) return a.y;
      const t = (x - a.x) / (b.x - a.x);
      return round2(a.y + t * (b.y - a.y));
    }
  }
  return null;
}

/**
 * Les entrées auxquelles la sortie atteint une valeur donnée (à une tolérance
 * près), cherchées sur les segments de la courbe. Une dépendance peut passer
 * DEUX FOIS par la même sortie — la température qui monte puis redescend en
 * est l'exemple du module 5. C'est la dissymétrie que la leçon fait voir,
 * sans jamais employer le mot « antécédent » (3e).
 */
export function inputsReaching(rows, y, tol = 0.001) {
  const sorted = [...rows].sort((a, b) => a.x - b.x);
  const found = [];
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (Math.abs(a.y - y) <= tol) found.push(a.x);
    const between = (y > a.y && y < b.y) || (y < a.y && y > b.y);
    if (between && b.y !== a.y) {
      found.push(round2(a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x)));
    }
  }
  const last = sorted[sorted.length - 1];
  if (Math.abs(last.y - y) <= tol) found.push(last.x);
  return [...new Set(found)].sort((p, q) => p - q);
}

/** Le maximum d'une série, et l'entrée où il est atteint. */
export function maximumOf(rows) {
  return rows.reduce((best, r) => (r.y > best.y ? r : best), rows[0]);
}
