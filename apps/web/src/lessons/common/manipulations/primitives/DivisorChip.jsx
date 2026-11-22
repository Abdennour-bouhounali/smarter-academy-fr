import NumberTile from './NumberTile';

/**
 * Un DIVISEUR comme jeton : une NumberTile petite, avec un état lisible —
 *   'idle'    candidat non essayé
 *   'common'  diviseur commun (vert plein)
 *   'single'  divise un seul des deux nombres (ambre)
 *   'no'      ne divise ni l'un ni l'autre (gris)
 *   'pgcd'    le plus grand des communs (doré)
 * Glissable quand `drag` est fourni.
 */
export default function DivisorChip({ value, state = 'idle', drag, id, label, disabled, onClick, size = 'sm', badge }) {
  const tone = { idle: 'neutral', common: 'common', single: 'remainder', no: 'dim', pgcd: 'pgcd', ok: 'ok', ko: 'ko' }[state] ?? 'neutral';
  return <NumberTile value={value} tone={tone} drag={drag} id={id} label={label} disabled={disabled} onClick={onClick} size={size} badge={badge} />;
}
