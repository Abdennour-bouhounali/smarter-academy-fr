// Détecteur de FUITE INTER-NIVEAUX : du vocabulaire, une notation ou une
// notion de 3e (ou au-delà) qui apparaîtrait dans une leçon de 6e.
//
// La passe d'inspiration 6e ← 3e (2026-09-07) réutilise l'ARCHITECTURE des
// interactions de 3e, jamais leur contenu mathématique. Le risque propre à
// cet exercice est de faire descendre une notion « parce que l'interaction
// existe » — exactement ce que la consigne interdit. Ce script le vérifie.
//
// Il complète `audit-knowledge-dependencies.mjs`, qui vérifie l'ORDRE des
// connaissances DANS une leçon ; ici on vérifie le NIVEAU.
//
//   node scripts/audit/check-3e-leak.mjs            # toute la 6e
//   node scripts/audit/check-3e-leak.mjs fractions  # une leçon
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname;
const SIXIEME = join(ROOT, 'apps/web/src/lessons/college/6e');

// Termes dont la présence en 6e est un signal fort. Chacun est de niveau 4e
// ou au-delà dans la progression française ; aucun n'est au programme de 6e.
const FORBIDDEN = [
  ['fonction affine|coefficient directeur|ordonnée à l.origine', 'notion de fonction (3e)'],
  ['\\bf\\s*\\(\\s*x\\s*\\)', 'notation f(x) (3e)'],
  ['antécédent|image de .* par f', 'vocabulaire des fonctions (3e)'],
  ['irréductible|\\bPGCD\\b|\\bPPCM\\b', 'fractions irréductibles (4e/3e)'],
  ['théorème de (Thalès|Pythagore)|réciproque du théorème', 'théorèmes (4e/3e)'],
  ['\\bcosinus\\b|\\bsinus\\b|\\btangente\\b', 'trigonométrie (3e)'],
  ['racine carrée|√', 'racines carrées (3e)'],
  ['produit en croix|quatrième proportionnelle', 'procédés de 4e/3e'],
  ['nombre relatif négatif|abscisse négative', 'relatifs (5e/4e)'],
  ['développer (?:et |puis )?(?:réduire|factoriser)|\\bfactoriser\\b|identité remarquable', 'calcul littéral (4e/3e)'],
  ['puissance de dix|notation scientifique|10\\^', 'puissances (4e/3e)'],
  ['médiane .* série|premier quartile|\\bquartile\\b', 'statistiques (3e)'],
  ['probabilité d.un événement|arbre de probabilité', 'probabilités (5e+)'],
  ['vecteur|translation de vecteur', 'vecteurs (3e)'],
];

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(jsx|js)$/.test(p) && !/\.test\.js$/.test(p)) out.push(p);
  }
  return out;
};

const only = process.argv[2];
const lessons = readdirSync(SIXIEME).flatMap((chap) => {
  const cp = join(SIXIEME, chap);
  if (!statSync(cp).isDirectory()) return [];
  return readdirSync(cp).map((l) => ({ id: l, dir: join(cp, l) }));
}).filter((l) => !only || l.id === only);

let hits = 0;
for (const lesson of lessons) {
  const found = [];
  for (const file of walk(lesson.dir)) {
    const src = readFileSync(file, 'utf8');
    // On ignore :
    //  · les commentaires, qui EXPLIQUENT souvent ce qui est volontairement
    //    exclu (« pas de PGCD ici ») ;
    //  · le bloc `exclude:` de teachingScope, dont le rôle est précisément de
    //    NOMMER les notions hors programme — les signaler serait prendre la
    //    déclaration d'exclusion pour la fuite qu'elle empêche ;
    //  · `knowledgeAudit.ignore`, même raison.
    const code = src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
      .replace(/exclude:\s*\[[\s\S]*?\]/g, '')
      .replace(/knowledgeAudit:\s*\{[\s\S]*?\n\s*\}/g, '');
    for (const [re, why] of FORBIDDEN) {
      const m = code.match(new RegExp(re, 'i'));
      if (m) found.push({ file: relative(ROOT, file), term: m[0], why });
    }
  }
  if (found.length) {
    hits += found.length;
    console.log(`\n6e:${lesson.id}`);
    for (const f of found) console.log(`  ⚠️  « ${f.term} » — ${f.why}\n      ${f.file}`);
  }
}

console.log(hits === 0
  ? `\n✅ Aucune fuite de niveau détectée sur ${lessons.length} leçon(s) de 6e.`
  : `\n${hits} fuite(s) potentielle(s) à examiner.`);
process.exit(hits === 0 ? 0 : 1);
