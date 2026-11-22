/** La donnée d'une illustration de مسألة (voir ProblemIllustration.jsx) — JS pur, lu par le validateur. */
import { ICON_KINDS, PILL_TONES, PLAN_FILLS, PLAN_SHAPES, SCENE_BGS } from './situationKinds.js';

const FIGURE_KINDS = Object.freeze(['books', 'bouquets', 'field', 'orchard', 'glass', 'hall']);
const GENERIC_KINDS = Object.freeze(['plan', 'stacks', 'tags', 'tanks', 'route', 'ladder', 'timeline', 'scene']);
export const ILLUSTRATION_KINDS = Object.freeze([...FIGURE_KINDS, ...GENERIC_KINDS]);

const filled = (v) => v != null && v !== '';
const icon = (errors, k, where) => { if (!ICON_KINDS.includes(k)) errors.push(`${where} : icône inconnue « ${k} »`); };

/** Les erreurs propres aux genres génériques (situationDrawings.jsx). */
function validateGeneric(il, errors) {
  const need = (keys) => keys.forEach((k) => { if (!filled(il[k])) errors.push(`${k} manquant`); });
  switch (il.kind) {
    case 'plan': {
      const shape = il.shape ?? 'rect';
      if (!PLAN_SHAPES.includes(shape)) errors.push(`plan.shape inconnu « ${shape} »`);
      if (il.fill != null && !PLAN_FILLS.includes(il.fill)) errors.push(`plan.fill inconnu « ${il.fill} »`);
      if (shape === 'tri') { if (!(Array.isArray(il.sides) && il.sides.length === 3)) errors.push('sides : trois côtés'); }
      else if (shape === 'ring') need(['border']);
      else if (shape === 'square') { if (!filled(il.side) && !filled(il.w)) errors.push('side manquant'); }
      else need(['w', 'h']);
      if (shape === 'grow') need(['dw', 'dh']);
      break;
    }
    case 'stacks':
      if (!(Array.isArray(il.rows) && il.rows.length >= 1 && il.rows.length <= 3)) errors.push('rows : 1 à 3 lignes');
      else il.rows.forEach((r, i) => { icon(errors, r.icon, `rows[${i}]`); if (!filled(r.count)) errors.push(`rows[${i}].count manquant`); if (!/[؀-ۿ]/.test(r.label ?? '')) errors.push(`rows[${i}].label arabe obligatoire`); });
      break;
    case 'tags':
      if (!(Array.isArray(il.cards) && il.cards.length >= 1 && il.cards.length <= 3)) errors.push('cards : 1 à 3 cartes');
      else il.cards.forEach((c, i) => {
        if (!/[؀-ۿ]/.test(c.title ?? '')) errors.push(`cards[${i}].title arabe obligatoire`);
        if (!(Array.isArray(c.lines) && c.lines.length >= 1 && c.lines.length <= 3)) errors.push(`cards[${i}].lines : 1 à 3 lignes`);
        if (c.icon != null) icon(errors, c.icon, `cards[${i}]`);
      });
      break;
    case 'tanks':
      if (!(Array.isArray(il.tanks) && il.tanks.length >= 1 && il.tanks.length <= 3)) errors.push('tanks : 1 à 3 réservoirs');
      else il.tanks.forEach((t, i) => { if (!/[؀-ۿ]/.test(t.label ?? '')) errors.push(`tanks[${i}].label arabe obligatoire`); });
      break;
    case 'route':
      need(['from', 'to', 'distance', 'unit']);
      for (const v of il.vehicles ?? []) icon(errors, v.icon ?? 'car', 'vehicles');
      if ((il.vehicles?.length ?? 0) > 2) errors.push('vehicles : 2 au plus');
      break;
    case 'ladder':
      if (![il.h, il.base, il.len].some(filled)) errors.push('ladder : au moins une cote connue');
      if (il.object != null && !['ladder', 'rope'].includes(il.object)) errors.push(`ladder.object inconnu « ${il.object} »`);
      break;
    case 'timeline':
      icon(errors, il.icon, 'timeline');
      if (!(Array.isArray(il.marks) && il.marks.length >= 1 && il.marks.length <= 4)) errors.push('marks : 1 à 4 repères');
      else il.marks.forEach((m, i) => { if (!/[؀-ۿ]/.test(m.label ?? '')) errors.push(`marks[${i}].label arabe obligatoire`); });
      break;
    case 'scene':
      icon(errors, il.icon, 'scene');
      if (!(Array.isArray(il.chips) && il.chips.length >= 1 && il.chips.length <= 4)) errors.push('chips : 1 à 4 pastilles');
      else il.chips.forEach((c, i) => { if (!/[؀-ۿ]/.test(c.label ?? '')) errors.push(`chips[${i}].label arabe obligatoire`); if (c.tone != null && !PILL_TONES.includes(c.tone)) errors.push(`chips[${i}].tone inconnu « ${c.tone} »`); });
      if (il.bg != null && !SCENE_BGS.includes(il.bg)) errors.push(`scene.bg inconnu « ${il.bg} »`);
      for (const k of il.extra ?? []) icon(errors, k, 'scene.extra');
      break;
    default:
  }
}

export function validateIllustration(il) {
  const errors = [];
  if (!il || typeof il !== 'object') return ['illustration absente'];
  if (!ILLUSTRATION_KINDS.includes(il.kind)) errors.push(`kind inconnu « ${il.kind} »`);
  if (typeof il.ariaLabel !== 'string' || !/[؀-ۿ]/.test(il.ariaLabel)) errors.push('ariaLabel arabe obligatoire');
  const need = (keys) => keys.forEach((k) => { if (il[k] == null || il[k] === '') errors.push(`${k} manquant`); });
  if (il.kind === 'books') need(['notebooks', 'books']);
  if (il.kind === 'bouquets') need(['white', 'red']);
  if (il.kind === 'field' || il.kind === 'glass' || il.kind === 'hall') need(['length', 'width', 'unit']);
  if (il.kind === 'orchard' && !(Array.isArray(il.sides) && il.sides.length === 3)) errors.push('sides : trois côtés');
  if (GENERIC_KINDS.includes(il.kind)) validateGeneric(il, errors);
  return errors;
}
