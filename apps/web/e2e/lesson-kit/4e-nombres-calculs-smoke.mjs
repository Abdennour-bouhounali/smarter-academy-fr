/**
 * Suite e2e — fumée sur les six leçons « Nombres et calculs » de 4e.
 *
 * Ce que cette suite vérifie, et que les contrôles de source ne peuvent pas
 * voir (ils lisent des fichiers, jamais l'application) :
 *
 *   1. chaque module de chaque leçon REND réellement — une leçon non branchée
 *      dans App.jsx retombe sur la page d'accueil sans la moindre erreur, et
 *      un composant qui jette au montage (le contrat `badges[].test`, un
 *      import cassé, une prop manquante) ne se voit qu'ici ;
 *   2. aucune ERREUR de console pendant le rendu ;
 *   3. la manipulation signature de chaque leçon est présente et vivante,
 *      module 1 (elle est le cœur de la leçon : si elle manque, le module est
 *      une page) ;
 *   4. pas de défilement horizontal à 375 px — la contrainte mobile.
 *
 * Le déverrouillage séquentiel est levé en semant la progression : la clé est
 * PORTÉE PAR UTILISATEUR (`u_<id|anon>_<clé>`) et `completedModules` porte des
 * chaînes NON rembourrées (memory: e2e_scoped_storage_key, e2e_seeding_and_locale_traps).
 *
 * Lancer : démarrer vite depuis apps/web/ en détaché, puis
 *   KIT_BASE=http://localhost:5399 node apps/web/e2e/lesson-kit/4e-nombres-calculs-smoke.mjs
 */
import { chromium } from 'playwright';
import { courseLevels } from '../../../../packages/core/curriculum/coursesData.js';

const BASE = process.env.KIT_BASE || 'http://localhost:5399';

/**
 * Les chemins viennent du CATALOGUE, jamais d'une constante recopiée.
 *
 * C'est la leçon de ce fichier : sa première version codait le chemin en dur
 * (`…/racines-carrees`, le nom du DOSSIER) et passait au vert pendant que la
 * carte des cours, elle, pointait sur `…/racines-carrees-4e` (l'ID de la
 * leçon, que `buildLesson` met dans le lien). L'élève qui cliquait la carte
 * atterrissait sur la page d'accueil — sans erreur, sans 404, invisible pour
 * toutes les gardes de source. Une suite e2e qui invente son URL ne teste pas
 * le chemin de l'élève.
 */
const CATALOGUE = Object.fromEntries(
  courseLevels
    .flatMap((n) => n.grades)
    .find((g) => g.id === '4e')
    .chapters.find((c) => c.id === 'nombres_calculs')
    .lessons.map((l) => [l.id, l])
);

/**
 * Le segment de domaine est l'id OFFICIEL (`nombres_calculs`, souligné) :
 * c'est celui que la carte des cours met dans le lien. Un tiret ferait passer
 * la suite au vert pendant que chaque carte cliquée retomberait sur l'accueil.
 */
const LESSONS = [
  {
    id: 'nombres-rationnels-4e',
    titre: 'Nombres rationnels',
    modules: ['mission-de-depart', 'la-croix-qui-tranche', 'un-quotient-d-entiers',
      'fabriquer-la-graduation', 'multiplier', 'l-inverse-et-la-division',
      'la-recette-et-le-chantier', 'mission-finale-la-croix'],
    // La manipulation signature du module 1 : les quatre steppers de la croix.
    signature: { slug: 'la-croix-qui-tranche', role: 'Régler les quatre nombres de l’égalité', boutons: 8 },
  },
  {
    id: 'puissances-4e',
    titre: 'Puissances',
    modules: ['mission-de-depart', 'descendre-l-echelle', 'l-exposant-negatif',
      'compter-les-facteurs', 'ecrire-l-immense', 'ordres-de-grandeur',
      'mission-finale-l-echelle'],
    signature: { slug: 'descendre-l-echelle', role: 'Choisir la valeur suivante', boutons: 2 },
  },
  {
    id: 'racines-carrees-4e',
    titre: 'Racine carrée',
    modules: ['mission-de-depart', 'le-tas-de-carreaux', 'le-symbole',
      'les-carres-parfaits', 'encadrer', 'x-au-carre-egale-a',
      'le-terrain-et-la-dalle', 'mission-finale-le-carre'],
    signature: { slug: 'le-tas-de-carreaux', role: null, boutons: 2 },
  },
  {
    id: 'calcul-litteral-4e',
    titre: 'Calcul littéral',
    modules: ['mission-de-depart', 'ranger-les-tuiles', 'termes-semblables',
      'l-aire-qui-developpe', 'couper-les-deux-cotes', 'remonter-le-facteur',
      'tester-une-egalite', 'mission-finale-les-tuiles'],
    signature: { slug: 'ranger-les-tuiles', role: 'Ton expression', boutons: 3 },
  },
  {
    id: 'equations-4e',
    titre: 'Équations du premier degré',
    modules: ['mission-de-depart', 'la-masse-cachee', 'ce-qu-est-une-solution',
      'un-seul-geste', 'deux-gestes', 'ecrire-l-equation', 'l-atelier',
      'mission-finale-la-balance'],
    signature: { slug: 'la-masse-cachee', role: 'Gestes disponibles', boutons: 2 },
  },
];

/**
 * Le chemin de base de la leçon, tel que la carte des cours le construit.
 * Il n'est PAS dérivé du nom du dossier sur disque : `racines-carrees-4e` vit
 * dans un dossier nommé `racines-carrees` (héritage d'avant sa refonte), et
 * c'est l'id qui fait foi.
 */
const chemin = (l) => {
  const entree = CATALOGUE[l.id];
  if (!entree) throw new Error(`Leçon absente du catalogue : ${l.id}`);
  return entree.path;
};

let ok = 0;
let ko = 0;
const echecs = [];

const check = (nom, condition, detail = '') => {
  if (condition) { ok += 1; return; }
  ko += 1;
  echecs.push(`${nom}${detail ? ` — ${detail}` : ''}`);
};

const navigateur = await chromium.launch();
const page = await navigateur.newPage({ viewport: { width: 1280, height: 900 } });

const erreurs = [];
page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));

/** Semer la progression pour lever le verrouillage séquentiel. */
const semer = async (lessonId, nModules) => {
  await page.addInitScript(
    ([k, mods]) => {
      window.localStorage.setItem(k, JSON.stringify({
        completedModules: mods,
        currentModule: 0,
        xp: 0,
      }));
    },
    [`u_anon_smarter_lesson_${lessonId}`, Array.from({ length: nModules }, (_, i) => String(i))]
  );
};

for (const lecon of LESSONS) {
  // La leçon doit être OUVERTE (`status: 'available'`) : codée + routée ne
  // suffit pas, c'est le statut qui rend la carte cliquable
  // (memory: lesson_visibility_gate).
  check(`${lecon.id} · visible au catalogue`, CATALOGUE[lecon.id]?.status === 'available',
    `status ${CATALOGUE[lecon.id]?.status}`);

  await semer(lecon.id, lecon.modules.length);

  // La page d'accueil de la leçon.
  erreurs.length = 0;
  await page.goto(`${BASE}${chemin(lecon)}`, { waitUntil: 'networkidle' });
  const texteIndex = await page.textContent('body');
  check(`${lecon.id} · index`, texteIndex.includes(lecon.titre),
    `titre « ${lecon.titre} » absent`);
  check(`${lecon.id} · index sans erreur`, erreurs.length === 0, erreurs[0]);

  for (const slug of lecon.modules) {
    erreurs.length = 0;
    await page.goto(`${BASE}${chemin(lecon)}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(250);

    const corps = await page.textContent('body');

    // Une leçon non branchée retombe sur l'accueil : le mot-repère de la page
    // d'accueil y apparaît, et le module est introuvable.
    check(`${lecon.id}/${slug} · rendu`,
      corps.length > 400 && !corps.includes('Page introuvable'),
      `corps de ${corps.length} caractères`);

    check(`${lecon.id}/${slug} · pas d’erreur console`, erreurs.length === 0, erreurs[0]);

    // Le module doit porter au moins un bouton : un module sans interaction
    // est une page, pas un module.
    const nBoutons = await page.locator('button').count();
    check(`${lecon.id}/${slug} · interactif`, nBoutons >= 2, `${nBoutons} bouton(s)`);

    // La manipulation signature, au module 1.
    if (lecon.signature.slug === slug) {
      if (lecon.signature.role) {
        const groupe = await page.getByRole('group', { name: lecon.signature.role }).count();
        check(`${lecon.id}/${slug} · manipulation signature`, groupe >= 1,
          `groupe « ${lecon.signature.role} » absent`);
      }
      check(`${lecon.id}/${slug} · commandes de la manipulation`,
        nBoutons >= lecon.signature.boutons,
        `${nBoutons} bouton(s), ${lecon.signature.boutons} attendus`);
    }
  }

  // Mobile : le module 1, à 375 px, ne doit pas défiler horizontalement.
  await page.setViewportSize({ width: 375, height: 780 });
  await page.goto(`${BASE}${chemin(lecon)}/${lecon.signature.slug}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(250);
  const deborde = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  check(`${lecon.id} · pas de défilement horizontal à 375 px`, !deborde);
  await page.setViewportSize({ width: 1280, height: 900 });
}

await navigateur.close();

console.log(`\n${ok} vérification(s) passée(s), ${ko} échec(s).`);
if (ko > 0) {
  console.log('\nÉchecs :');
  for (const e of echecs) console.log(`  ✗ ${e}`);
  process.exit(1);
}
console.log('✅ Les six leçons « Nombres et calculs » de 4e rendent sans erreur.');
