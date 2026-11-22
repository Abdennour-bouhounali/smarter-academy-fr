import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import sharePages from './vite-plugin-share-pages.js';

/**
 * Le contenu de pratique vit HORS de apps/web (content/practice, lu aussi par Laravel) : Vite ne le surveillait pas.
 * Un serveur de dev lancé avant qu'une banque soit ajoutée gardait l'ancien `active.json` / `index.generated.json` —
 * la carte de la banque d'exercices de la leçon manquait jusqu'au redémarrage (constaté le 2026-10-14).
 * On ajoute le dossier au watcher : un fichier modifié ou ajouté recharge la page, comme une source.
 */
const PRACTICE_CONTENT = fileURLToPath(new URL('../../content/practice', import.meta.url));
function watchPracticeContent() {
  return {
    name: 'sa-watch-practice-content',
    configureServer(server) {
      server.watcher.add(PRACTICE_CONTENT);
    },
  };
}

/**
 * `virtual:practice-level-counts` — leçon → { niveau: nombre d'exercices }.
 *
 * La carte de la banque d'exercices du sommaire d'une leçon n'a besoin QUE de ces
 * nombres. Elle les lisait dans practiceContent.js, qui embarque l'index complet
 * (183 Ko de JSON : chaque identifiant d'exercice) et la table du glob de
 * ≈ 4 200 exercices — un lot de 80 Ko gzip téléchargé par chaque sommaire de
 * leçon (mesuré le 2026-10-17). Ce module, calculé au build depuis le même
 * index, pèse ≈ 2 Ko. Voir docs/architecture/BUNDLE_BOUNDARIES.md.
 */
const PRACTICE_INDEX = fileURLToPath(new URL('../../content/practice/index.generated.json', import.meta.url));
function practiceLevelCounts() {
  const id = 'virtual:practice-level-counts';
  const resolved = '\0' + id;
  return {
    name: 'sa-practice-level-counts',
    resolveId: (source) => (source === id ? resolved : null),
    load(source) {
      if (source !== resolved) return null;
      this.addWatchFile(PRACTICE_INDEX);
      const index = JSON.parse(readFileSync(PRACTICE_INDEX, 'utf8'));
      const counts = Object.fromEntries(
        Object.entries(index).map(([lesson, levels]) => [
          lesson,
          Object.fromEntries(
            Object.entries(levels).map(([level, ids]) => [level, Array.isArray(ids) ? ids.length : 0]),
          ),
        ]),
      );
      return `export default JSON.parse(${JSON.stringify(JSON.stringify(counts))})`;
    },
  };
}

/**
 * `virtual:grade-summary` — ce que le LOT D'ENTRÉE sait du catalogue : la liste des classes (`getAllGrades()`),
 * le nombre de leçons publiées et les classes de la page d'accueil. Calculé au build PAR le catalogue lui-même
 * (jamais retapé, jamais en dérive), puis écrit comme un petit littéral (≈ 0,4 Ko).
 *
 * Pourquoi : `coursesData.js` (≈ 95 Ko gzip de JSON pour les quatre années, +0,2–0,3 Ko par leçon publiée) n'est plus
 * importé par aucun module du lot d'entrée — la barre latérale, `StudentLayout` et la section « confiance » de
 * l'accueil ne lui demandaient que ces trois réponses. Le catalogue complet vit dans un lot partagé que les pages
 * qui le lisent (cours, unité, progression, pratique…) chargent en parallèle de leur propre chunk.
 * Voir docs/architecture/BUNDLE_BOUNDARIES.md §3 « Catalogue ». Les fichiers du catalogue sont surveillés.
 */
const CORE_CURRICULUM = fileURLToPath(new URL('../../packages/core/curriculum/', import.meta.url));
const CORE_PROGRESS = fileURLToPath(new URL('../../packages/core/progress/getNextLesson.js', import.meta.url));
function gradeSummary() {
  const id = 'virtual:grade-summary';
  const resolved = '\0' + id;
  return {
    name: 'sa-grade-summary',
    resolveId: (source) => (source === id ? resolved : null),
    load(source) {
      if (source !== resolved) return null;
      const fr = CORE_CURRICULUM + 'fr/';
      for (const f of readdirSync(fr)) if (f.endsWith('.json')) this.addWatchFile(fr + f);
      this.addWatchFile(CORE_CURRICULUM + 'coursesData.js');
      // Un processus Node à part : le catalogue est relu à chaque (re)chargement, jamais figé par le cache d'imports.
      const script = `
        import { getAllGrades, courseLevels } from ${JSON.stringify(CORE_CURRICULUM + 'coursesData.js')};
        import { getFlatAvailableLessons } from ${JSON.stringify(CORE_PROGRESS)};
        const homeGrades = courseLevels.flatMap((l) => l.grades.map((g) => ({ id: g.id, name: g.name, levelId: l.id })));
        process.stdout.write(JSON.stringify({ grades: getAllGrades(), homeGrades, availableLessonCount: getFlatAvailableLessons(courseLevels).length }));`;
      const r = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
        encoding: 'utf8',
        maxBuffer: 1 << 24,
      });
      if (r.status !== 0) throw new Error('virtual:grade-summary : ' + r.stderr);
      return `export default JSON.parse(${JSON.stringify(r.stdout)})`;
    },
  };
}

export default defineConfig({
  // Pages de partage (aperçu WhatsApp/Facebook) des livres : BOOKS_STORE.md §6.
  plugins: [
    react(),
    watchPracticeContent(),
    practiceLevelCounts(),
    gradeSummary(),
    sharePages({
      cards: JSON.parse(readFileSync(new URL('./src/features/books/shareCards.json', import.meta.url), 'utf8')),
    }),
  ],
  // Le JSON importé devient `JSON.parse("…")` au lieu d'un littéral d'objet :
  // V8 analyse une chaîne JSON bien plus vite qu'un objet JS de même taille. Le
  // catalogue des quatre années (≈ 430 Ko de JSON) et les namespaces i18n sont
  // dans l'entrée : c'est du temps de script en moins au démarrage de CHAQUE page.
  // Aucun import NOMMÉ depuis un .json n'existe (ce mode les interdit).
  json: { stringify: true },
  build: {
    // Le rapport des tailles gzip de CHAQUE chunk (≈ 2 000 chunks : un par module
    // de leçon) faisait dépasser le tas de 4 Go du build (`npm run build`, CI) :
    // constaté le 2026-10-14 sur origin/dev, « heap out of memory » à « computing
    // gzip size ». Les tailles se mesurent à part (docs/architecture/BUNDLE_BOUNDARIES.md).
    reportCompressedSize: false,
  },
  // `html-to-image` n'est importé que dynamiquement (capture d'écran du
  // signalement) : sans cette ligne, Vite le découvre EN COURS de session,
  // ré-optimise ses dépendances, et chaque onglet déjà ouvert reçoit des 504
  // « Outdated Optimize Dep » sur ses chunks paresseux — les liens changent
  // l'URL mais la page ne suit plus. Pré-optimisé au démarrage, plus de surprise.
  // Même cause pour `mafs` (le graphe du héros de l'accueil, chargé en lazy) : découvert
  // à la première visite de « / », il déclenchait la même ré-optimisation et un 504 sur
  // `MafsGraph.jsx` (constaté le 2026-10-17).
  optimizeDeps: {
    include: ['html-to-image', 'mafs'],
  },
  resolve: {
    // UNE seule copie de KaTeX. react-katex et mafs déclarent katex ^0.16 et
    // npm leur installe une copie imbriquée (0.16.47) à côté de la nôtre
    // (0.18.2) : un élève qui ouvrait une leçon puis son cahier téléchargeait
    // les deux (≈ 2 × 260 Ko), et les formules des leçons étaient rendues par
    // 0.16 sous la feuille de style 0.18 — alors que check:katex valide les
    // leçons avec 0.18. Dédupliquer aligne le rendu sur ce qui est vérifié.
    // Voir docs/architecture/BUNDLE_BOUNDARIES.md.
    dedupe: ['katex'],
  },
  // Vitest : les espaces `admin` et `teacher` sont chargés à la demande en
  // production ; les tests les enregistrent d'emblée.
  test: {
    setupFiles: ['./src/test/setupOnDemandStrings.js'],
    // 30 s, not vitest's 5: several tests compute every case of a lesson (2 to 4 s on a laptop). On a loaded CI
    // runner one of them passed 5 s and STOPPED A PRODUCTION DEPLOY (2026-11-20) though the same suite had just passed
    // in the CI job. A test that hangs still fails; a slow one no longer decides whether production is deployed.
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  css: {
    postcssOptions: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
});
