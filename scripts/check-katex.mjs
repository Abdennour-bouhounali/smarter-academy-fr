// Garde-fou KaTeX : une commande LaTeX écrite avec UN SEUL antislash dans une
// chaîne JavaScript est silencieusement avalée par le langage — `'$\;$'` donne
// « $;$ », et la formule s'affiche cassée sans qu'aucun outil ne s'en plaigne.
//
// docs/architecture/KNOWLEDGE_MAP.md impose de doubler les antislashs ; ce
// script le vérifie sur tout le contenu des leçons.
//
// Usage: node scripts/check-katex.mjs [--fix-report]

import { traverse, parseFile, findLessonDirs, listSourceFiles, repoRoot } from './lib/lessonAst.mjs';
import { relative } from 'node:path';

// Commandes KaTeX courantes : si l'une apparaît SANS son antislash dans une
// chaîne contenant des maths, c'est qu'il a été mangé à la lecture du fichier.
const SWALLOWED = /\$[^$]*(?:^|[^\\])(?:;|,|!)\s*;/;
// Commandes SANS homonyme en français, et qui prennent une accolade : leur
// présence sans antislash est sans ambiguïté un antislash avalé. On écarte
// délibérément `le`, `in`, `text`, `times`… qui sont aussi des mots.
const BRACED = ['frac', 'dfrac', 'sqrt', 'overrightarrow', 'overline', 'mathbb', 'vec', 'widehat'];
const BARE = ['approx', 'neq', 'infty', 'alpha', 'beta', 'gamma', 'lambda', 'qquad'];

const problems = [];
for (const dir of findLessonDirs()) {
  for (const file of listSourceFiles(dir)) {
    let ast;
    try { ast = parseFile(file); } catch { continue; }
    traverse(ast, {
      StringLiteral(path) {
        const v = path.node.value;
        if (!v.includes('$')) return;
        // Un antislash présent dans la valeur = il a survécu : c'est correct.
        const inMath = /\$[^$]*\$/.test(v) || v.trim().startsWith('$');
        if (!inMath) return;
        for (const cmd of BRACED) {
          const re = new RegExp(`(^|[^\\\\A-Za-z])${cmd}\\{`);
          if (re.test(v) && !v.includes(`\\${cmd}`)) {
            problems.push({ file: relative(repoRoot, file), line: path.node.loc?.start.line, cmd, value: v.slice(0, 90) });
            return;
          }
        }
        for (const cmd of BARE) {
          const re = new RegExp(`(^|[^\\\\A-Za-z])${cmd}(?![A-Za-z])`);
          if (re.test(v) && !v.includes(`\\${cmd}`)) {
            problems.push({ file: relative(repoRoot, file), line: path.node.loc?.start.line, cmd, value: v.slice(0, 90) });
            return;
          }
        }
        // Espacement KaTeX `\;` `\,` `\!` avalé : reste « ; » nu entre deux $.
        if (SWALLOWED.test(v) && !v.includes('\;') && !v.includes('\\,')) {
          problems.push({ file: relative(repoRoot, file), line: path.node.loc?.start.line, cmd: 'espacement (\; \\, \\!)', value: v.slice(0, 90) });
        }
      },
    });
  }
}

if (problems.length === 0) {
  console.log('KaTeX : aucun antislash avalé dans les leçons.');
  process.exit(0);
}
console.error(`${problems.length} formule(s) avec un antislash avalé :`);
for (const p of problems) console.error(`  ${p.file}:${p.line}  « ${p.cmd} »  ${p.value}`);
console.error('\nDoubler les antislashs dans les chaînes JS : \'$\\\\frac{a}{b}$\'.');
process.exit(1);
