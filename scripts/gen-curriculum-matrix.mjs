import { readFileSync, writeFileSync } from 'node:fs';
const j = JSON.parse(readFileSync('packages/core/curriculum/smarter_academy_programmes_maths_2026.json','utf8'));

const GRADES = ['6e','5e','4e','3e','seconde'];
const chain = {};
for (const lvl of GRADES)
  for (const d of j.levels[lvl].domains)
    for (const o of d.official_objects||[]) (chain[o.id] ||= []).push(lvl);

let out = `# Matrice curriculaire 5e / 4e — mathématiques

> **Généré depuis la source officielle du dépôt**, jamais saisi à la main :
> \`packages/core/curriculum/smarter_academy_programmes_maths_2026.json\`.
> Régénérer : \`node scripts/gen-curriculum-matrix.mjs\`.

## Autorité officielle

| Source | Publication | NOR |
| --- | --- | --- |
`;
for (const s of j.official_sources.filter(s=>['BO-C4-2026','BO-2NDE-2026','BO-C3-2025'].includes(s.id)))
  out += `| ${s.title} | ${s.publication} | [${s.NOR}](${s.official_url}) |\n`;

out += `\nCalendrier d'application : `;
out += Object.entries(j.application_calendar).filter(([k])=>['6e','5e','4e','3e'].includes(k))
  .map(([k,v])=>`**${k}** ${v}`).join(' · ');

out += `\n\n> Le ministère publie des programmes, pas une liste de leçons. Les leçons Smarter Academy
> sont éditoriales et se rattachent chacune à **un** objet officiel — c'est exactement ce que fait
> \`buildChaptersForGrade()\` dans \`coursesData.js\`, qui GÉNÈRE le catalogue depuis ce référentiel.
> Il n'y a donc pas de catalogue à corriger à la main : le corriger, c'est corriger le référentiel
> ou enrichir \`smaMetadata\`.

---

## Ce que la matrice décide

Pour chaque objet officiel de 5e et de 4e :

- **Périmètre** — \`teachingScope.include\` / \`exclude\` du référentiel, qui portent déjà les
  frontières de niveau (« réservé à la 4e », « réservées à la 3e »…).
- **Propriétaire de niveau** — où le concept est *introduit*, *approfondi*, *maîtrisé*, *réutilisé*.
- **Ce qui ne doit PAS être enseigné ici** — la colonne qui empêche une leçon de voler la matière
  du niveau suivant.

`;

const STATUS_OF = (id, lvl) => {
  const c = chain[id] || [lvl];
  const i = c.indexOf(lvl);
  if (c.length === 1) return 'introduction + maîtrise';
  if (i === 0) return 'introduction';
  if (i === c.length - 1) return 'maîtrise / réutilisation';
  return 'approfondissement';
};

for (const lvl of ['5e','4e']) {
  const L = j.levels[lvl];
  out += `\n---\n\n# ${lvl.toUpperCase()} — ${L.official_program}\n\nStatut : \`${L.program_status}\`\n`;
  for (const d of L.domains) {
    out += `\n## ${d.title}\n`;
    for (const o of d.official_objects) {
      const c = chain[o.id] || [lvl];
      out += `\n### ${o.title}\n\n`;
      out += `- **Objet officiel** : \`${o.id}\` · domaine \`${d.id}\`\n`;
      out += `- **Chaîne verticale** : ${c.map(g => g===lvl ? `**${g}**` : g).join(' → ')}\n`;
      out += `- **Rôle en ${lvl}** : ${STATUS_OF(o.id, lvl)}\n`;
      out += `- **Prérequis officiels** : ${(o.prerequisites||[]).join(', ') || '—'}\n`;
      if (o.level_specificity) out += `- **Spécificité de niveau** : ${o.level_specificity}\n`;
      out += `\n**Au programme de ${lvl}**\n\n`;
      for (const x of o.teachingScope?.include || []) out += `- ${x}\n`;
      out += `\n**Hors périmètre de ${lvl}** (ne pas voler au niveau suivant)\n\n`;
      const ex = o.teachingScope?.exclude || [];
      out += ex.length ? ex.map(x=>`- ${x}\n`).join('') : '- —\n';
    }
  }
}

out += `\n---\n\n# Graphe de dépendance des connaissances\n\nLes chaînes verticales qui traversent 5e et 4e, dérivées du référentiel :\n\n\`\`\`text\n`;
for (const [id, c] of Object.entries(chain)) {
  if (c.length > 1 && (c.includes('5e') || c.includes('4e')))
    out += `${id.padEnd(30)} ${c.join(' → ')}\n`;
}
out += `\`\`\`\n\nLecture : un concept présent à plusieurs niveaux est **le même objet officiel** vu avec un
périmètre différent. La colonne « Hors périmètre » de chaque niveau est ce qui garantit que
l'approfondissement du niveau suivant a encore quelque chose à apprendre.\n`;

writeFileSync('docs/architecture/CURRICULUM_MATRIX_5E_4E.md', out);
console.log('written', out.length, 'chars');
