// Garde de PÉRIMÈTRE du catalogue algérien — spécifique à l'Algérie (absente
// du dépôt français amont). Elle fait échouer la construction si du contenu
// français réapparaît dans une surface produit, par le catalogue ou par un
// import.
//
// ── Ce qui a changé en phase 6F ─────────────────────────────────────────
// Ce contrôle gardait un ISOLEMENT : les 8 classes françaises vivaient dans
// le catalogue, et `filterActiveCourseLevels` les cachait. Le périmètre
// voulu n'est plus celui-là. Le catalogue algérien (`dzCourseLevels`) ne
// contient QUE les deux classes DZ, et la base non plus ne contient qu'elles.
//
// Depuis le 2026-09-25, l'arbre français n'existe plus du tout : le
// catalogue de référence (`referenceCourseLevels`) et les 132 dossiers de
// leçons françaises ont été supprimés — le dépôt ne porte plus que l'unité
// « الأعداد الطبيعيّة والأعداد النّاطقة ». Ce contrôle garde désormais qu'ils
// ne REVIENNENT pas (contrôles 2 et 3).
//
// Complète, et reste délibérément distinct de, check-routes.mjs (surface de
// montage App.jsx) et du filtre de registry.js (couvert par
// apps/web/src/lessons/registry.test.js, `import.meta.glob` étant une API
// Vite que ce script Node ne peut pas exercer). Distinct aussi de
// check-level-leak.mjs, qui malgré son nom est un contrôle PÉDAGOGIQUE de
// vocabulaire, sans rapport avec l'activation.
//
//   node scripts/check-dormant-isolation.mjs
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { courseLevels, dzCourseLevels } from '../packages/core/curriculum/coursesData.js';
import { ACTIVE_GRADE_IDS } from '../packages/core/curriculum/activeGrades.js';

const ROOT = new URL('../', import.meta.url).pathname;
const WEB_SRC = join(ROOT, 'apps/web/src');

const problems = [];

// ── Contrôle 1 : le catalogue actif ne porte que des classes actives ──────
for (const level of courseLevels) {
  for (const grade of level.grades) {
    if (!ACTIVE_GRADE_IDS.includes(grade.id)) {
      problems.push(`Le catalogue actif (courseLevels) contient la classe non active « ${grade.id} » (niveau « ${level.id} ») — filterActiveCourseLevels() ne l'a pas filtrée.`);
    }
  }
}

// Dans l'autre sens : un identifiant actif qui n'existe dans aucun catalogue
// est une faute de frappe qui n'active silencieusement rien.
const dzGradeIds = new Set(dzCourseLevels.flatMap((l) => l.grades.map((g) => g.id)));
for (const id of ACTIVE_GRADE_IDS) {
  if (!dzGradeIds.has(id)) {
    problems.push(`ACTIVE_GRADE_IDS contient « ${id} », absent du catalogue algérien (dzCourseLevels) — probablement une faute de frappe (cela n'active rien).`);
  }
}

// ── Contrôle 2 : AUCUNE classe française dans le catalogue algérien ───────
//
// Le cœur de la phase 6F. Le catalogue DZ est construit depuis le programme
// algérien ; qu'une classe ou une leçon française y entre signifierait que
// quelqu'un a rebranché l'héritage français sur le produit. Le catalogue
// français ayant été supprimé, ses classes sont nommées ici, et une leçon
// française se reconnaît à son chemin (/courses/college|lycee/…).
const frenchGradeIds = new Set(['6e', '5e', '4e', '3e', 'seconde', 'premiere_specialite', 'terminale_specialite', 'terminale_complementaires']);
const isFrenchPath = (path) => /^\/courses\/(college|lycee)\//.test(path ?? '');

for (const level of dzCourseLevels) {
  for (const grade of level.grades) {
    if (frenchGradeIds.has(grade.id)) {
      problems.push(`Le catalogue algérien (dzCourseLevels) contient la classe FRANÇAISE « ${grade.id} » — l'arbre de référence a fui dans le produit.`);
    }
    for (const chapter of grade.chapters ?? []) {
      for (const lesson of chapter.lessons ?? []) {
        if (isFrenchPath(lesson.path)) {
          problems.push(`Le catalogue algérien contient la leçon FRANÇAISE « ${lesson.id} » (classe « ${grade.id} »).`);
        }
      }
    }
  }
}

// ── Contrôle 3 : les dossiers de leçons français ne reviennent pas ───────
//
// Supprimés le 2026-09-25. Un dossier restauré (fusion, cherry-pick) ne
// serait ni monté ni indexé — registry.js ne globbe que les classes actives
// — mais il ramènerait des centaines de fichiers morts que l'outillage
// déclarerait « absents du catalogue ». On le signale ici, nommément.
for (const legacy of ['college', 'lycee']) {
  if (existsSync(join(WEB_SRC, 'lessons', legacy))) {
    problems.push(`apps/web/src/lessons/${legacy}/ existe à nouveau — les leçons françaises ont été retirées du dépôt (2026-09-25) ; seule l'unité « الأعداد الطبيعيّة والأعداد النّاطقة » est gardée.`);
  }
}

// ── Contrôle 4 : le catalogue ne porte AUCUN palier ──────────────────────
//
// Gratuit ou premium est une décision d'ADMINISTRATEUR, stockée dans
// `lessons.tier` (la seule source de vérité) : l'import crée une leçon
// nouvelle en `free` et ne réécrit jamais le palier d'une leçon existante.
// Un `tier` réapparu dans le catalogue serait une seconde autorité — une
// liste figée de leçons gratuites ou payantes que personne ne voit dans
// l'administration. On le refuse ici plutôt que de l'ignorer en silence.
for (const level of dzCourseLevels) {
  for (const grade of level.grades) {
    for (const chapter of grade.chapters ?? []) {
      for (const lesson of chapter.lessons ?? []) {
        if (Object.prototype.hasOwnProperty.call(lesson, 'tier')) {
          problems.push(`La leçon « ${lesson.id} » porte un \`tier\` dans le catalogue — le palier appartient à la base (lessons.tier, décidé par l'administrateur), jamais au catalogue.`);
        }
      }
    }
  }
}

if (problems.length) {
  console.error(`\n${problems.length} problème(s) de périmètre du catalogue :\n`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  console.error('\nLe produit algérien ne doit exposer que du curriculum algérien.\n');
  process.exit(1);
}

const dzGrades = [...dzGradeIds];
console.log(`✅ Périmètre du catalogue : ${dzGrades.length} classe(s) algérienne(s) (${dzGrades.join(', ')}), dont ${ACTIVE_GRADE_IDS.length} active(s) (${ACTIVE_GRADE_IDS.join(', ') || 'aucune'}).`);
console.log(`✅ Aucune classe ni leçon française dans le catalogue algérien, ni dossier de leçon français sur le disque.`);
console.log('✅ Aucun palier dans le catalogue : gratuit / premium est décidé en base par l\'administrateur (lessons.tier).');
