/**
 * Indépendance vis-à-vis du manuel (propriétaire, 2026-10-15, CRITIQUE) : aucune ligne visible par l'élève ne le renvoie au livre.
 * Les étiquettes de module (`brief.tag` de MissionBrief) en portaient souvent la page — « أتمرّن — الكتاب ص 30 و 32 »,
 * « الكتاب ص 9، 13 و 15 », « معارف ص 12 — طرائق ص 13 ». `withoutBookRef` les retire à l'affichage (la source reste dans le
 * code et dans `SourceTag`, visible de l'enseignant seulement). Une étiquette qui n'était qu'un renvoi devient `null`.
 */
const NUMS = String.raw`\d+(?:\s*(?:،|,|و|←|-)\s*\d+)*`;
const BOOK = new RegExp(String.raw`\s*[—–-]?\s*\(?\s*(?:من\s+)?الكتاب(?![ةا])\s*(?:ص\s*${NUMS})?\s*\)?`, 'g');
// « ص » seul (pas la fin d'un mot : « ينقص 4 » reste intact)
const PAGE = new RegExp(String.raw`\(?(?<!\p{L})ص\s*${NUMS}\s*\)?`, 'gu');

export function withoutBookRef(text) {
  if (typeof text !== 'string') return text;
  const out = text
    .replace(BOOK, '')
    .replace(PAGE, ' ')
    .replace(/\s*[—–-]\s*(?=[—–-]|$)/g, '')
    .replace(/^\s*[—–-]\s*/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return out || null;
}
