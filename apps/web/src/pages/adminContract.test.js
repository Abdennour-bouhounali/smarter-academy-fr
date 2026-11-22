import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

/**
 * LE CONTRAT DU PANNEAU D'ADMINISTRATION — vérifié sur la SOURCE, comme
 * `teacherContract.test.js` et `checkoutContract.test.js`.
 *
 * Il tient l'acquis de l'alignement : le panneau est le MÊME produit que
 * l'espace élève, dans la même langue et le même système visuel. Sans ce
 * test, le prochain écran d'administration repartirait d'une autre langue ou
 * d'un `AdminPage` à fond sombre — c'est exactement ainsi que la divergence
 * était née.
 *
 * Quatre engagements :
 *
 *   1. FRANÇAIS — le catalogue du panneau est français, et aucun caractère
 *                 arabe ne subsiste dans ses fichiers (FRENCH_LANGUAGE_CONTRACT) ;
 *   2. SYSTÈME  — pas de thème sombre ni de palette parallèle ;
 *   3. LOGIQUE  — propriétés logiques, jamais gauche/droite en dur ;
 *   4. CLÉS     — la navigation et les libellés partagés sont des CLÉS, pas du texte.
 */
const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '..');

function walk(dir, { tests = false } = {}) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full, { tests }));
    else if (/\.(jsx?|mjs)$/.test(name) && (tests || !/\.test\./.test(name))) out.push(full);
  }
  return out;
}

/** Le code SANS ses commentaires. */
function codeOf(file) {
  return readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

const ADMIN_DIRS = ['pages/admin', 'components/admin'];
const adminFiles = ADMIN_DIRS.flatMap((rel) => walk(resolve(src, rel)));

/**
 * Le dossier du catalogue : `locales/ar/` pendant la campagne de traduction,
 * `locales/fr/` quand la session principale l'aura renommé
 * (FRANCE_REBUILD_PLAN §4quater, règle 2). Le test accepte les deux noms ;
 * le premier qui existe est le bon.
 */
const LOCALE_DIR = ['fr', 'ar'].find((dir) => existsSync(resolve(src, `i18n/locales/${dir}/admin.json`)));
const readCatalogue = () => JSON.parse(readFileSync(resolve(src, `i18n/locales/${LOCALE_DIR}/admin.json`), 'utf8'));

// Les blocs arabes d'Unicode. `\uFEFC` et non `\uFEFF` : U+FEFF est la marque d'ordre des octets (le BOM d'un CSV).
const ARABIC = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFC]/;

/**
 * La librairie est éteinte (`config/features.js`) et exemptée de la campagne
 * jusqu'à ce que les livres existent : ses écrans et ses entrées de menu
 * gardent leur texte d'origine. Rien d'autre n'est exempté.
 */
const BOOKS_FILES = /^pages\/admin\/books\//;
const BOOKS_KEYS = new Set(['nav.books', 'nav.booksOrders', 'nav.booksCatalog', 'nav.booksMessages', 'nav.booksManagers']);

/** Toutes les feuilles du catalogue : `[['common.loading', '…'], …]`. */
function leaves(node, path = []) {
  return Object.entries(node).flatMap(([key, value]) => (
    value && typeof value === 'object' ? leaves(value, [...path, key]) : [[[...path, key].join('.'), value]]
  ));
}

describe('le panneau d’administration est français', () => {
  /**
   * Les libellés partagés (boutons, états de chargement, titres) viennent du
   * catalogue `admin.common` : écrits en dur dans un écran, ils échapperaient
   * au vocabulaire unique du panneau. On ne teste pas « tout mot français »
   * (les commentaires en sont pleins, à dessein) mais les CHAÎNES qui
   * atteignaient l'écran.
   */
  const HARD_CODED_UI = [
    /'Chargement/, /'Réessayer/, /'Annuler'/, /'Confirmer'/, /'Précédent'/, /'Suivant'/,
    /'Enregistrer'/, /'Rechercher/, /'Fermer'/, /'Supprimer'/, /'Modifier'/, /'Créer'/,
    /'Aucun résultat'/, /'Aucune? /, /'Tous'/, /'Toutes/, /'En cours…'/,
    /Tableau de bord/, /Élèves —/, /Enseignants —/, /Administration'/,
  ];

  for (const file of adminFiles) {
    const rel = file.slice(src.length + 1);
    // `StatusBadge` garde un petit vocabulaire comme FILET pour un statut
    // hors catalogue : il n'atteint l'écran que si le serveur invente un
    // état, auquel cas dire « Publié » vaut mieux que « status.xyz ».
    if (rel.endsWith('ui/StatusBadge.jsx')) continue;

    it(`${rel} prend ses libellés partagés dans le catalogue`, () => {
      const code = codeOf(file);
      for (const pattern of HARD_CODED_UI) {
        expect(code, `${rel} écrit en dur ${pattern}`).not.toMatch(pattern);
      }
    });
  }

  it('aucun fichier du panneau ne garde un caractère arabe — commentaires et tests compris', () => {
    const files = ['pages/admin', 'components/admin', 'services/admin', 'features/admin']
      .flatMap((rel) => walk(resolve(src, rel), { tests: true }))
      .concat(resolve(src, 'pages/adminContract.test.js'));
    for (const file of files) {
      const rel = file.slice(src.length + 1);
      if (BOOKS_FILES.test(rel)) continue;
      readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
        expect(ARABIC.test(line), `${rel}:${i + 1} contient de l’arabe`).toBe(false);
      });
    }
  });

  it('le catalogue français du panneau existe et est monté', () => {
    const i18n = readFileSync(resolve(src, 'i18n/index.js'), 'utf8');
    // À la demande depuis 2026-11-17 : il arrive avec le cadre du panneau, pas avec l'application.
    // Le dossier s'appelle `ar` jusqu'au renommage de fin de campagne, `fr` ensuite.
    expect(i18n).toMatch(/admin: \(\) => import\('\.\/locales\/(?:ar|fr)\/admin\.json'\)/);
    expect(LOCALE_DIR, 'admin.json introuvable sous locales/fr/ ni locales/ar/').toBeDefined();

    const catalogue = readCatalogue();
    // Les sections que tout écran consomme.
    for (const key of ['common', 'nav', 'status', 'dashboard']) {
      expect(catalogue, `admin.json a la section ${key}`).toHaveProperty(key);
    }
    // Un échantillon : le vocabulaire du contrat, mot pour mot.
    expect(catalogue.common.loading).toBe('Chargement…');
    expect(catalogue.common.cancel).toBe('Annuler');
    expect(catalogue.nav.dashboard).toBe('Tableau de bord');
    expect(catalogue.status.published).toMatch(/^Publié/);
    expect(catalogue.status.draft).toBe('Brouillon');
    expect(catalogue.status.hidden).toMatch(/^Masqué/);
    expect(catalogue.status.archived).toMatch(/^Archivé/);
    expect(catalogue.nav.classrooms).toBe('Classes');
    expect(catalogue.nav.schools).toBe('Établissements');
  });

  it('aucune valeur du catalogue n’est arabe, et chacune est écrite', () => {
    for (const [key, value] of leaves(readCatalogue())) {
      expect(typeof value, `admin.${key} n’est pas une chaîne`).toBe('string');
      expect(value.trim(), `admin.${key} est vide`).not.toBe('');
      if (BOOKS_KEYS.has(key)) continue;
      expect(ARABIC.test(value), `admin.${key} contient de l’arabe : ${value}`).toBe(false);
    }
  });

  it('aucun montant n’est en dinars', () => {
    for (const [key, value] of leaves(readCatalogue())) {
      expect(value, `admin.${key} parle de dinars`).not.toMatch(/\bDA\b|DZD|dinar/i);
    }
    for (const file of adminFiles) {
      const rel = file.slice(src.length + 1);
      if (BOOKS_FILES.test(rel)) continue;
      const code = codeOf(file);
      expect(code, `${rel} formate en dinars`).not.toMatch(/formatDzd|utils\/dinars|'DZD'|\bDA\b/);
      expect(code, `${rel} écrit une locale en dur`).not.toMatch(/'(?:ar-DZ|fr-DZ|en-US)'/);
    }
  });

  it('toute clé citée par un écran existe dans le catalogue', () => {
    // Une clé absente ne casse rien : i18next rend la clé elle-même, et
    // « plans.tierOverlap » s'affiche à l'écran. C'est le défaut le plus
    // silencieux de cette architecture, donc celui qu'on teste.
    const catalogue = readCatalogue();
    const has = (key) => {
      const parts = key.split('.');
      const leaf = parts.pop();
      const node = parts.reduce((n, part) => (n ?? {})[part], catalogue);
      if (!node || typeof node !== 'object') return false;
      // Un nom PLURIEL n'existe pas nu : i18next le range sous `_one` et `_other`.
      return typeof node[leaf] === 'string'
        || ['one', 'other'].some((f) => typeof node[`${leaf}_${f}`] === 'string');
    };

    for (const file of adminFiles) {
      const rel = file.slice(src.length + 1);
      const code = codeOf(file);
      if (!code.includes("useTranslation('admin')")) continue;
      for (const match of code.matchAll(/\bt\(\s*'([a-z][\w]*(?:\.[\w]+)+)'/g)) {
        const key = match[1];
        // On ne juge que les clés d'une section connue : `t(someVar)` et les
        // chemins qui n'en sont pas (params d'URL, etc.) ne sont pas des clés.
        if (!Object.prototype.hasOwnProperty.call(catalogue, key.split('.')[0])) continue;
        expect(has(key), `${rel} cite admin.${key}, absente du catalogue`).toBe(true);
      }
    }
  });

  it('un nom compté porte les deux formes du pluriel français, et elles seules', () => {
    // FRENCH_LANGUAGE_CONTRACT §6 : `_one` (0 et 1) et `_other`. Les formes
    // `_zero`, `_two`, `_few`, `_many` n'existent pas en français : une clé
    // restée là serait morte, ou lue par erreur.
    const catalogue = readCatalogue();

    const check = (node, path) => {
      const bases = new Set();
      for (const key of Object.keys(node)) {
        if (typeof node[key] === 'object') { check(node[key], `${path}.${key}`); continue; }
        expect(key, `${path}.${key} est une forme de pluriel étrangère au français`)
          .not.toMatch(/_(?:zero|two|few|many)$/);
        const m = key.match(/^(.*)_(one|other)$/);
        if (m) bases.add(m[1]);
      }
      for (const base of bases) {
        for (const form of ['one', 'other']) {
          expect(typeof node[`${base}_${form}`], `${path}.${base} n’a pas la forme _${form}`).toBe('string');
        }
      }
    };
    check(catalogue, 'admin');
  });

  it('la navigation du panneau est faite de CLÉS, jamais de texte', () => {
    const nav = readFileSync(resolve(src, 'data/adminNavigation.js'), 'utf8');
    expect(nav).toMatch(/labelKey:/);
    // Plus aucun `label:` porteur de texte — sinon une entrée échapperait au
    // catalogue.
    expect(codeOf(resolve(src, 'data/adminNavigation.js'))).not.toMatch(/\blabel:\s*['"]/);
  });
});

describe('le panneau partage le système visuel de l’espace élève', () => {
  it('la coquille n’est plus un thème sombre', () => {
    const layout = readFileSync(resolve(src, 'components/layout/AdminLayout.jsx'), 'utf8');
    const sidebar = codeOf(resolve(src, 'components/admin/AdminSidebar.jsx'));

    // Le fond du produit, le même que StudentLayout/TeacherLayout.
    expect(layout).toMatch(/bg-\[#FAFAFA\]/);
    // Aucune livrée sombre dans la barre : c'était `bg-slate-900`.
    expect(sidebar).not.toMatch(/bg-slate-9\d\d/);
    expect(sidebar).not.toMatch(/text-slate-300/);
    // Elle porte au contraire la barre blanche de l'espace élève.
    expect(sidebar).toMatch(/bg-white border-e border-slate-200/);
  });

  it('le panneau réutilise le cadre de page et les tuiles du produit', () => {
    const chrome = readFileSync(resolve(src, 'pages/admin/adminUi.jsx'), 'utf8');
    // La gouttière partagée, pas une largeur à soi.
    expect(chrome).toMatch(/sa-page/);

    // L'accueil monte `StatTile`, le composant de « Ma progression » — et non
    // une copie locale.
    const dashboard = readFileSync(resolve(src, 'pages/admin/Dashboard.jsx'), 'utf8');
    expect(dashboard).toMatch(/from '\.\.\/\.\.\/components\/common\/StatTile'/);
  });

  it('aucun écran ne redéfinit une police : la typographie vient des jetons', () => {
    for (const file of adminFiles) {
      const code = codeOf(file);
      expect(code, `${file.slice(src.length + 1)} redéclare une police`).not.toMatch(/font-family:/);
      // Les piles arabes ont quitté le produit (FRENCH_LANGUAGE_CONTRACT §8) :
      // aucune ne revient par un écran. La typographie vient des jetons de
      // tailwind.config.js, seule source.
      expect(code, `${file.slice(src.length + 1)} pose une police arabe à la main`)
        .not.toMatch(/Cairo|Tajawal|Amiri|Noto Naskh/);
    }
  });
});

describe('le panneau est écrit en propriétés logiques', () => {
  /**
   * Les propriétés PHYSIQUES, là où l'écran veut dire début et fin. Elles
   * ne cassent rien de gauche à droite, mais un `ml-2` qui veut dire « après
   * l'icône » ment sur son intention ; le kit entier parle en logique. On vise les utilitaires
   * Tailwind de marge, de rembourrage, de position et d'alignement — pas
   * `left`/`right` dans un mot quelconque.
   *
   * `inset-x-*`, `top-*`, `bottom-*` et `-translate-y-*` sont neutres : ils
   * ne distinguent pas début et fin.
   */
  const PHYSICAL = [
    /\b(?:sm:|md:|lg:|xl:)?[mp][lr]-\d/,
    /\b(?:sm:|md:|lg:|xl:)?(?:left|right)-\d/,
    /\btext-(?:left|right)\b/,
    /\bborder-[lr]\b/,
    /\brounded-[lr]-/,
  ];

  for (const file of adminFiles) {
    const rel = file.slice(src.length + 1);
    it(`${rel} n’utilise que des propriétés logiques`, () => {
      const code = codeOf(file);
      for (const pattern of PHYSICAL) {
        expect(code, `${rel} utilise ${pattern} au lieu de son équivalent logique (ms/me, ps/pe, start/end, text-start/end)`)
          .not.toMatch(pattern);
      }
    });
  }

  it('les FLÈCHES écrites dans une phrase suivent le sens de lecture', () => {
    // `←` tapé dans une chaîne n'est pas une icône : il ne passe pas par
    // DirectionalIcons. C'était la flèche « devient » / « puis » d'une phrase
    // arabe ; de gauche à droite, elle pointe à l'envers. Elle s'écrit `→`.
    // Les flèches MATHÉMATIQUES sont hors sujet : elles vivent dans MathText,
    // jamais dans une chaîne d'interface.
    for (const file of adminFiles) {
      const rel = file.slice(src.length + 1);
      if (BOOKS_FILES.test(rel)) continue;
      expect(codeOf(file), `${rel} écrit ← dans une phrase (utiliser →)`).not.toMatch(/←/);
    }
    for (const [key, value] of leaves(readCatalogue())) {
      expect(value, `admin.${key} écrit ← (utiliser →)`).not.toMatch(/←/);
    }
  });

  it('les icônes directionnelles passent par le résolveur, jamais en dur', () => {
    // Un chevron de navigation (« précédent »/« suivant ») doit venir de
    // DirectionalIcons, la seule source du sens de lecture du produit. Les chevrons VERTICAUX (tri d'une colonne) et les
    // icônes sémantiques (loupe, corbeille) n'y passent pas — ils ne se
    // retournent jamais.
    for (const rel of ['components/admin/ui/FilterBar.jsx', 'components/admin/AdminSidebar.jsx']) {
      const code = codeOf(resolve(src, rel));
      expect(code, `${rel} importe un chevron horizontal directement de lucide`)
        .not.toMatch(/import \{[^}]*Chevron(?:Left|Right)[^}]*\} from 'lucide-react'/);
    }
  });
});
