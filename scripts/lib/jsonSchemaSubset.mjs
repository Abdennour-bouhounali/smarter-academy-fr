// Le sous-ensemble de JSON Schema (draft 2020-12) dont ont besoin les schémas de contenu
// du dépôt : type (dont listes de types), enum, pattern, minLength, minimum, maximum,
// minItems, maxItems, items, properties, required, additionalProperties, $ref local (#/$defs/…).
// Pas de dépendance : un mot-clé inconnu est une ERREUR de schéma, jamais ignoré en silence.

const KNOWN = new Set([
  '$schema', '$id', '$ref', '$defs', '$comment', 'title', 'description',
  'type', 'enum', 'pattern', 'minLength', 'minimum', 'maximum', 'minItems', 'maxItems',
  'items', 'properties', 'required', 'additionalProperties',
]);

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (Number.isInteger(value)) return 'integer';
  if (typeof value === 'number') return Number.isFinite(value) ? 'number' : 'non-finite';
  return typeof value;
}

const matchesType = (value, type) => {
  const t = typeOf(value);
  return t === type || (type === 'number' && t === 'integer');
};

function resolve(schema, root) {
  if (!schema.$ref) return schema;
  const m = /^#\/\$defs\/(.+)$/.exec(schema.$ref);
  const target = m && root.$defs?.[m[1]];
  if (!target) throw new Error(`$ref introuvable : ${schema.$ref}`);
  return { ...resolve(target, root), ...Object.fromEntries(Object.entries(schema).filter(([k]) => k !== '$ref')) };
}

/**
 * @returns {string[]} les erreurs, chacune préfixée par le chemin JSON (`answer.vars[0]`)
 */
export function validateAgainstSchema(data, schema, root = schema, path = '') {
  const s = resolve(schema, root);
  for (const key of Object.keys(s)) if (!KNOWN.has(key)) throw new Error(`mot-clé de schéma non géré « ${key} » (${path || 'racine'})`);
  const at = path || 'racine';
  const errors = [];

  if (s.type) {
    const types = Array.isArray(s.type) ? s.type : [s.type];
    if (!types.some((t) => matchesType(data, t))) return [`${at} : type ${typeOf(data)}, attendu ${types.join(' | ')}`];
  }
  if (s.enum && !s.enum.some((v) => v === data)) errors.push(`${at} : ${JSON.stringify(data)} hors de ${JSON.stringify(s.enum)}`);
  if (data === null) return errors;

  if (typeof data === 'string') {
    if (s.minLength !== undefined && [...data].length < s.minLength) errors.push(`${at} : moins de ${s.minLength} caractères`);
    if (s.pattern && !new RegExp(s.pattern, 'u').test(data)) errors.push(`${at} : « ${data} » ne suit pas ${s.pattern}`);
  }
  if (typeof data === 'number') {
    if (s.minimum !== undefined && data < s.minimum) errors.push(`${at} : ${data} < ${s.minimum}`);
    if (s.maximum !== undefined && data > s.maximum) errors.push(`${at} : ${data} > ${s.maximum}`);
  }
  if (Array.isArray(data)) {
    if (s.minItems !== undefined && data.length < s.minItems) errors.push(`${at} : moins de ${s.minItems} élément(s)`);
    if (s.maxItems !== undefined && data.length > s.maxItems) errors.push(`${at} : plus de ${s.maxItems} élément(s)`);
    if (s.items) data.forEach((item, i) => errors.push(...validateAgainstSchema(item, s.items, root, `${path}[${i}]`)));
  }
  if (isObject(data)) {
    for (const key of s.required ?? []) if (!(key in data)) errors.push(`${at} : champ requis « ${key} » absent`);
    for (const [key, value] of Object.entries(data)) {
      const child = path ? `${path}.${key}` : key;
      if (s.properties && key in s.properties) errors.push(...validateAgainstSchema(value, s.properties[key], root, child));
      else if (s.additionalProperties === false) errors.push(`${at} : champ inconnu « ${key} »`);
      else if (isObject(s.additionalProperties)) errors.push(...validateAgainstSchema(value, s.additionalProperties, root, child));
    }
  }
  return errors;
}
